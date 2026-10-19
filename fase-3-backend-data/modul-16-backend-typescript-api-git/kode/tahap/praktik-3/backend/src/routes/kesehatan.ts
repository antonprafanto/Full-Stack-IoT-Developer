// kesehatan.ts - GET /health: apakah server hidup dan tersambung ke broker?
import type { FastifyPluginAsync } from "fastify";
import { hitungan } from "../services/gudang.ts";
import { brokerTersambung } from "../services/mqtt.ts";

export const ruteKesehatan: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return { ok: true, broker: brokerTersambung(), diterima: hitungan.diterima, ditolak: hitungan.ditolak };
  });
};
