// health.ts - GET /health: is the server alive, connected to the broker, and able to reach the database?
// Module 29: also the version of the server that is running (from package.json), so the deploying robot, the smoke test, and
// anyone who opens /api/health in a browser can make sure the new version is deployed without SSH. The status code still always
// stays 200: 503 for "unhealthy" and monitors from outside come in Module 30.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { counts } from "../services/store.ts";
import { brokerConnected } from "../services/mqtt.ts";
import { databaseAlive } from "../db/archive.ts";
import { SERVER_VERSION } from "../config/server-version.ts";

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      security: [], // Module 20: stays open without a login (monitors and the Docker healthcheck can't log in)
      summary: "Server state: alive, its version, connected to the broker and the database, and message counts",
      response: {
        200: z.object({ ok: z.boolean(),
          version: z.string().describe("Module 29: the running server version (package.json), for example 2.0.0"),
          broker: z.boolean(), database: z.boolean(), received: z.number(), rejected: z.number(),
          ignored: z.number().describe("Module 21: messages from a device that isn't registered or has been revoked") })
          .describe("server alive; broker and database = reachable or not"),
      },
    },
  }, async () => {
    return { ok: true, version: SERVER_VERSION, broker: brokerConnected(), database: await databaseAlive(),
      received: counts.received, rejected: counts.rejected, ignored: counts.ignored };
  });
};
