// perangkat.ts - rute /devices: daftar perangkat, bacaan terbaru, riwayat dari database, dan perintah.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, PerintahSet, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import { cariPerangkat, semuaPerangkat, tungguAck } from "../services/gudang.ts";
import { brokerTersambung, buatIdPerintah, kirimPerintah } from "../services/mqtt.ts";
import { ambilPerintah, ambilRiwayat, arsipkanPerintah, waktuKontrak } from "../db/arsip.ts";

const Galat = z.object({ pesan: z.string() });
const Jenis = z.enum(["node1", "node2", "belum-diketahui"]);
const ParamId = z.object({ id: DeviceId.describe("device_id perangkat, misalnya a4cf12e5b7c0") });
const Rentang = z.object({
  from: z.iso.datetime({ offset: true }).optional()
    .describe("awal rentang, misalnya 2026-10-20T10:00:00+07:00 (bawaan: 1 jam sebelum to)"),
  to: z.iso.datetime({ offset: true }).optional().describe("akhir rentang, tidak ikut dihitung (bawaan: sekarang)"),
}).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // rentang terbalik ditolak dengan kode 400
  message: "harus lebih akhir daripada from", path: ["to"],
  when: (hasil) => hasil.issues.length === 0, // urutan diperiksa hanya kalau from dan to sudah lolos pemeriksaan format
});
const angka = z.number().nullable(); // kolom yang tidak dimiliki perangkat berisi null
const Bacaan = z.object({
  ts: z.string(), fw: z.string(), suhu: angka, kelembapan: angka, cahaya: angka, tanah: angka, gerak: z.boolean().nullable(),
  level_air: angka, tekanan: angka, suhu_tanah: angka, baterai: angka, tanah_rs485: angka, ec: angka,
});

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

  app.get("/devices/:id/vitals", {
    schema: {
      tags: ["perangkat"],
      summary: "Kesehatan terakhir satu perangkat (vitals)",
      params: ParamId,
      response: {
        200: z.object({ device_id: z.string(), vitals: Vitals }).describe("vitals terbaru perangkat itu"),
        404: Galat.describe("belum ada vitals dari perangkat itu"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined || p.vitals === null) {
      return reply.code(404).send({ pesan: `belum ada vitals dari ${req.params.id}` });
    }
    return { device_id: p.device_id, vitals: p.vitals };
  });

  app.get("/devices/:id/readings", {
    schema: {
      tags: ["perangkat"],
      summary: "Riwayat bacaan satu perangkat dari database (paling banyak 1.000 bacaan)",
      params: ParamId,
      querystring: Rentang,
      response: {
        200: z.object({
          device_id: z.string(), dari: z.string(), sampai: z.string(), jumlah: z.number(), terpotong: z.boolean(),
          bacaan: z.array(Bacaan),
        }).describe("bacaan dalam rentang itu, terlama lebih dulu; terpotong = ada lebih dari 1.000 bacaan"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const sampai = req.query.to ? new Date(req.query.to) : new Date();
    const dari = req.query.from ? new Date(req.query.from) : new Date(sampai.getTime() - 60 * 60 * 1000);
    try {
      const { bacaan, terpotong } = await ambilRiwayat(req.params.id, dari, sampai);
      return {
        device_id: req.params.id, dari: waktuKontrak(dari), sampai: waktuKontrak(sampai), jumlah: bacaan.length, terpotong,
        bacaan,
      };
    } catch (galat) {
      req.log.error(`riwayat ${req.params.id} gagal dibaca dari database: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.get("/devices/:id/commands", {
    schema: {
      tags: ["perangkat"],
      summary: "20 perintah terakhir satu perangkat, beserta hasil ack-nya",
      params: ParamId,
      response: {
        200: z.array(z.object({
          id: z.string(), dikirim: z.string(), target: z.string(), nilai: z.union([z.boolean(), z.number()]),
          ack_ok: z.boolean().nullable(), ack_pesan: z.string().nullable(), lama_ms: z.number().nullable(),
        })).describe("perintah terbaru lebih dulu; ack_ok null = tidak ada ack dalam 5 detik"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      return await ambilPerintah(req.params.id);
    } catch (galat) {
      req.log.error(`perintah ${req.params.id} gagal dibaca dari database: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
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
    arsipkanPerintah(idPerintah, p.device_id, req.body, new Date(mulai), ack, lama)
      .catch((galat) => req.log.error(`gagal mencatat perintah ${idPerintah} ke database: ${galat.message}`));
    if (ack === null) {
      req.log.warn(`perintah ${idPerintah} ke ${p.device_id}: tidak ada ack dalam 5 detik`);
      return reply.code(504).send({ pesan: `tidak ada ack untuk ${idPerintah} dalam 5 detik` });
    }
    req.log.info(`perintah ${idPerintah} ke ${p.device_id}: ack ok=${ack.ok} dalam ${lama} ms`);
    return { id: idPerintah, lama_ms: lama, ack };
  });
};
