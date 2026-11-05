// kesehatan.ts - GET /health: apakah server hidup, tersambung ke broker, dan bisa menghubungi database?
// Modul 29: juga versi server yang sedang berjalan (dari package.json), supaya robot pemasang, uji asap, dan siapa pun yang
// membuka /api/health di peramban bisa memastikan versi baru sudah terpasang tanpa SSH. Kode jawabannya tetap selalu 200:
// 503 untuk "tidak sehat" dan pemantau dari luar baru dibahas di Modul 30.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { hitungan } from "../services/gudang.ts";
import { brokerTersambung } from "../services/mqtt.ts";
import { databaseHidup } from "../db/arsip.ts";
import { VERSI_SERVER } from "../config/versi-server.ts";

export const ruteKesehatan: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      security: [], // Modul 20: tetap terbuka tanpa login (pemantau dan Docker healthcheck tidak bisa login)
      summary: "Keadaan server: hidup, versinya, tersambung ke broker dan database, serta jumlah pesan",
      response: {
        200: z.object({ ok: z.boolean(),
          versi: z.string().describe("Modul 29: versi server yang sedang berjalan (package.json), misalnya 2.0.0"),
          broker: z.boolean(), database: z.boolean(), diterima: z.number(), ditolak: z.number(),
          diabaikan: z.number().describe("Modul 21: pesan dari perangkat yang belum terdaftar atau sudah dicabut") })
          .describe("server hidup; broker dan database = bisa dihubungi atau tidak"),
      },
    },
  }, async () => {
    return { ok: true, versi: VERSI_SERVER, broker: brokerTersambung(), database: await databaseHidup(),
      diterima: hitungan.diterima, ditolak: hitungan.ditolak, diabaikan: hitungan.diabaikan };
  });
};
