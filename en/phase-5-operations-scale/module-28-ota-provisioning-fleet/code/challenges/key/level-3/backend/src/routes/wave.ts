// wave.ts - Module 28 Challenge 3 (key): the routes of the automatic wave (services/wave.ts). Starting and stopping are
// admin-only (the security.ts guard answers 403 for a viewer); every role may look at its state.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { RELEASE_VERSION_PATTERN } from "../services/version.ts";
import { DEFAULT_WAIT_MINUTES, DEFAULT_INITIAL_SIZE, stopWave, waveState, startWave }
  from "../services/wave.ts";

const ErrorBody = z.object({ message: z.string() });
const WaveState = z.object({
  version: z.string(),
  state: z.enum(["running", "wait-healthy", "finished", "stopped"]),
  stage_index: z.number().describe("the stage running now (or the last one): 0 = canary, 1 = wave 1, and so on"),
  wait_minutes: z.number().describe("the canary's healthy waiting period"),
  reason: z.string().nullable().describe("why it stopped; null = not stopped (yet)"),
  started_at: z.string(),
  finished_at: z.string().nullable(),
  stages: z.array(z.object({
    name: z.string(),
    devices: z.array(z.object({
      device_id: z.string(),
      status: z.string().describe("queued, running, succeeded, already, rollback, failed, expired, rejected, or skipped"),
      message: z.string().nullable(),
    })),
  })),
});

export const waveRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/fleet/wave", {
    schema: {
      tags: ["fleet"],
      summary: "Start an automatic wave (admin): the canary, a healthy wait, then the rest step by step; an emergency brake if one fails",
      description: "The canary first; if it succeeds, the canary must stay online with the new version for wait_minutes (10 by default), "
        + "then the other devices are sent per wave (initial_size, then twice as many). One rollback, failure, or expiry "
        + "= stop. Telegram: one summary per stage. A test release is refused. The answer 202 = the wave has STARTED; its state "
        + "is at GET /fleet/wave.",
      body: z.strictObject({
        version: z.string().regex(RELEASE_VERSION_PATTERN, "version must look like x.y.z without leading zeros, for example 1.7.1"),
        wait_minutes: z.number().int().min(1).max(60).optional()
          .describe(`the canary's healthy waiting period in minutes (${DEFAULT_WAIT_MINUTES} by default); shorten it only for tests`),
        initial_size: z.number().int().min(1).max(50).optional()
          .describe(`the number of devices in the first wave after the canary (${DEFAULT_INITIAL_SIZE} by default), then twice as many`),
      }),
      response: {
        202: WaveState.describe("the wave has started (the canary is being sent the command)"),
        404: ErrorBody.describe("firmware of that version not uploaded yet"),
        409: ErrorBody.describe("a withdrawn/test release, no canary yet or a canary that failed before, or another wave still running"),
        503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    try {
      const result = await startWave(req.body.version, req.user.sub,
        { waitMinutes: req.body.wait_minutes, initialSize: req.body.initial_size });
      if (result.code !== 202) return reply.code(result.code).send({ message: result.message });
      return reply.code(202).send(result.state);
    } catch (error) {
      req.log.error(`wave ${req.body.version} failed to start: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.get("/fleet/wave", {
    schema: {
      tags: ["fleet"],
      summary: "The state of the last automatic wave (since the backend started)",
      response: { 200: WaveState, 404: ErrorBody.describe("no wave yet since the backend started") },
    },
  }, async (_req, reply) => waveState() ?? reply.code(404).send({ message: "no wave yet since the backend started" }));

  app.post("/fleet/wave/stop", {
    schema: {
      tags: ["fleet"],
      summary: "Stop the running wave (admin): the next stage isn't sent",
      description: "Commands already sent aren't taken back; their results are still recorded. Send it without a body.",
      response: { 200: WaveState, 409: ErrorBody.describe("no wave is running") },
    },
  }, async (req, reply) => stopWave(req.user.sub)
    ?? reply.code(409).send({ message: "no wave is running" }));
};
