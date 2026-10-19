// perangkat.ts - rute /devices: daftar perangkat dan bacaan terbaru.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { DeviceId, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { cariPerangkat, semuaPerangkat } from "../services/gudang.ts";

const Galat = z.object({ pesan: z.string() });
const Jenis = z.enum(["node1", "node2", "belum-diketahui"]);
const ParamId = z.object({ id: DeviceId.describe("device_id perangkat, misalnya a4cf12e5b7c0") });

export const rutePerangkat: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["perangkat"],
      summary: "Daftar semua perangkat yang pernah terdengar",
      response: {
        200: z.array(z.object({
          device_id: z.string(),
          jenis: Jenis,
          status: z.union([Status, z.literal("belum-diketahui")]),
          terakhir_dilihat: z.string(),
        })).describe("semua perangkat yang tercatat di memori"),
      },
    },
  }, async () => {
    return semuaPerangkat().map((p) => ({
      device_id: p.device_id,
      jenis: p.jenis,
      status: p.status,
      terakhir_dilihat: p.terakhir_dilihat,
    }));
  });

  app.get("/devices/:id/latest", {
    schema: {
      tags: ["perangkat"],
      summary: "Bacaan telemetry terbaru satu perangkat",
      params: ParamId,
      response: {
        200: z.object({
          device_id: z.string(),
          jenis: Jenis,
          status: z.union([Status, z.literal("belum-diketahui")]),
          telemetry: z.union([TelemetryNode1, TelemetryNode2]),
        }).describe("bacaan terbaru perangkat itu"),
        404: Galat.describe("belum ada telemetry dari perangkat itu"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined || p.telemetry === null) {
      return reply.code(404).send({ pesan: `belum ada telemetry dari ${req.params.id}` });
    }
    return { device_id: p.device_id, jenis: p.jenis, status: p.status, telemetry: p.telemetry };
  });
};
