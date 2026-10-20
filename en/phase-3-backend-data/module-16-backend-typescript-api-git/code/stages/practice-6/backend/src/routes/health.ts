// health.ts - GET /health: is the server alive and connected to the broker?
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { counts } from "../services/store.ts";
import { brokerConnected } from "../services/mqtt.ts";

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      summary: "Server state: alive, connected to the broker, and message counts",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), received: z.number(), rejected: z.number() })
          .describe("the server is alive; broker = connected to the broker or not"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerConnected(), received: counts.received, rejected: counts.rejected };
  });
};
