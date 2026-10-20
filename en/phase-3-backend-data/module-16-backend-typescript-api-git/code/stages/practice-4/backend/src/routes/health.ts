// health.ts - GET /health: is the server alive and connected to the broker?
import type { FastifyPluginAsync } from "fastify";
import { counts } from "../services/store.ts";
import { brokerConnected } from "../services/mqtt.ts";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return { ok: true, broker: brokerConnected(), received: counts.received, rejected: counts.rejected };
  });
};
