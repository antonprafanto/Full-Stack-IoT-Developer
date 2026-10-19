// perangkat.ts - rute /devices: daftar perangkat yang pernah terdengar.
import type { FastifyPluginAsync } from "fastify";
import { semuaPerangkat } from "../services/gudang.ts";

export const rutePerangkat: FastifyPluginAsync = async (app) => {
  app.get("/devices", async () => {
    return semuaPerangkat().map((p) => ({
      device_id: p.device_id,
      status: p.status,
      terakhir_dilihat: p.terakhir_dilihat,
    }));
  });
};
