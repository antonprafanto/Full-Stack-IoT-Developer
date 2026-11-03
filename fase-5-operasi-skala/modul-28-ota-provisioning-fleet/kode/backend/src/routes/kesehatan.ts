// kesehatan.ts - GET /health: apakah server hidup, tersambung ke broker, dan bisa menghubungi database?
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { hitungan } from "../services/gudang.ts";
import { brokerTersambung } from "../services/mqtt.ts";
import { databaseHidup } from "../db/arsip.ts";

export const ruteKesehatan: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      security: [], // Modul 20: tetap terbuka tanpa login (pemantau dan Docker healthcheck tidak bisa login)
      summary: "Keadaan server: hidup, tersambung ke broker dan database, serta jumlah pesan",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), database: z.boolean(), diterima: z.number(), ditolak: z.number(),
          diabaikan: z.number().describe("Modul 21: pesan dari perangkat yang belum terdaftar atau sudah dicabut") })
          .describe("server hidup; broker dan database = bisa dihubungi atau tidak"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerTersambung(), database: await databaseHidup(), diterima: hitungan.diterima, ditolak: hitungan.ditolak,
      diabaikan: hitungan.diabaikan };
  });
};
