// perangkat.ts - rute /devices: daftar perangkat, bacaan terbaru, dan perintah.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, PerintahSet, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { cariPerangkat, semuaPerangkat, tungguAck } from "../services/gudang.ts";
import { brokerTersambung, buatIdPerintah, kirimPerintah } from "../services/mqtt.ts";

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

  app.post("/devices/:id/command", {
    schema: {
      tags: ["perangkat"],
      summary: "Kirim satu perintah set ke perangkat, lalu tunggu ack-nya (paling lama 5 detik)",
      params: ParamId,
      body: PerintahSet,
      response: {
        200: z.object({ id: z.string(), lama_ms: z.number(), ack: Ack }).describe("perangkat menjawab dengan ack"),
        404: Galat.describe("perangkat belum pernah terdengar"),
        409: Galat.describe("perangkat offline, Node 2, atau jenisnya belum diketahui"),
        503: Galat.describe("backend tidak tersambung ke broker"),
        504: Galat.describe("tidak ada ack dalam 5 detik"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined) return reply.code(404).send({ pesan: `perangkat ${req.params.id} belum pernah terdengar` });
    if (p.jenis === "node2") return reply.code(409).send({ pesan: "Node 2 tidak menerima perintah (kontrak bagian 2)" });
    if (p.jenis !== "node1") return reply.code(409).send({ pesan: "jenis perangkat belum diketahui: tunggu telemetry pertamanya" });
    if (p.status !== "online") return reply.code(409).send({ pesan: `perangkat sedang ${p.status}, perintah tidak dikirim` });
    if (!brokerTersambung()) return reply.code(503).send({ pesan: "backend sedang tidak tersambung ke broker" });

    const idPerintah = buatIdPerintah();
    const mulai = Date.now();
    const menungguAck = tungguAck(idPerintah, 5000); // mulai menunggu sebelum mengirim
    kirimPerintah(p.device_id, idPerintah, req.body);
    const ack = await menungguAck;
    const lama = Date.now() - mulai;
    if (ack === null) {
      req.log.warn(`perintah ${idPerintah} ke ${p.device_id}: tidak ada ack dalam 5 detik`);
      return reply.code(504).send({ pesan: `tidak ada ack untuk ${idPerintah} dalam 5 detik` });
    }
    req.log.info(`perintah ${idPerintah} ke ${p.device_id}: ack ok=${ack.ok} dalam ${lama} ms`);
    return { id: idPerintah, lama_ms: lama, ack };
  });
};
