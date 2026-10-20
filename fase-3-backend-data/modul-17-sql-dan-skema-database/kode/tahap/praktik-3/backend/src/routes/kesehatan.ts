// kesehatan.ts - GET /health: apakah server hidup dan tersambung ke broker?
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { hitungan } from "../services/gudang.ts";
import { brokerTersambung } from "../services/mqtt.ts";

export const ruteKesehatan: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      summary: "Keadaan server: hidup, tersambung ke broker, dan jumlah pesan",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), diterima: z.number(), ditolak: z.number() })
          .describe("server hidup; broker = tersambung ke broker atau tidak"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerTersambung(), diterima: hitungan.diterima, ditolak: hitungan.ditolak };
  });
};
