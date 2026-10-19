// kesehatan.ts - GET /health: apakah server hidup?
import type { FastifyPluginAsync } from "fastify";

interface Jawaban {
  ok: boolean;
  pesan: string;
}

export const ruteKesehatan: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    const jawaban: Jawaban = { ok: true, pesan: "backend Rumah Pintar Mini hidup" };
    return jawaban;
  });
};
