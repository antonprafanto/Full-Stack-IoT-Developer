// health.ts - GET /health: is the server alive?
import type { FastifyPluginAsync } from "fastify";

interface Answer {
  ok: boolean;
  message: string;
}

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    const answer: Answer = { ok: true, message: "Mini Smart Home backend is alive" };
    return answer;
  });
};
