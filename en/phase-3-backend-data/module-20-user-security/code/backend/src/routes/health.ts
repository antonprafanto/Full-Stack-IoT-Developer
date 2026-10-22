// health.ts - GET /health: is the server alive, connected to the broker, and able to reach the database?
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { counts } from "../services/store.ts";
import { brokerConnected } from "../services/mqtt.ts";
import { databaseAlive } from "../db/archive.ts";

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      security: [], // Module 20: stays open without a login (monitors and the Docker healthcheck can't log in)
      summary: "Server state: alive, connected to the broker and the database, and message counts",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), database: z.boolean(), received: z.number(), rejected: z.number() })
          .describe("server alive; broker and database = reachable or not"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerConnected(), database: await databaseAlive(), received: counts.received, rejected: counts.rejected };
  });
};
