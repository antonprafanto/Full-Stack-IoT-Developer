// perangkat.ts - rute /devices: daftar perangkat, bacaan terbaru, riwayat dari database (mentah atau ringkasan),
// perintah, dan keadaan aktuator (desired/reported, Modul 19).
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, Keadaan, PerintahSet, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import { cariPerangkat, semuaPerangkat } from "../services/gudang.ts";
import { keadaanPerangkat, perintahkan } from "../services/perintah.ts";
import { ambilRingkasan, ambilRiwayat, waktuKontrak } from "../db/arsip.ts";

const MENIT = 60 * 1000; // dalam milidetik, seperti Date.getTime()
const JAM = 60 * MENIT;
const HARI = 24 * JAM;
const BATAS_EMBER = 1000; // paling banyak 1.000 ember (titik grafik) per permintaan

// Kamus ember: lebar satu ember, rentang bawaan kalau from tidak diisi, dan geseran supaya hari dimulai 00.00 WIB.
const EMBER = {
  "15m": { lebar: 15 * MENIT, bawaan: HARI, geser: 0 },
  "1h": { lebar: JAM, bawaan: 7 * HARI, geser: 0 },
  "1d": { lebar: HARI, bawaan: 30 * HARI, geser: 7 * JAM }, // WIB = UTC + 7 jam
};

// Rentang yang sebenarnya ditanyakan. to kosong = sekarang. from kosong = 1 jam sebelum to (bacaan mentah) atau
// rentang bawaan embernya. Dengan bucket, awal rentang dibulatkan ke bawah ke awal ember supaya ember pertama utuh.
function hitungRentang(q: { from?: string; to?: string; bucket?: keyof typeof EMBER }) {
  const sampai = q.to ? new Date(q.to) : new Date();
  if (q.bucket === undefined) {
    return { dari: q.from ? new Date(q.from) : new Date(sampai.getTime() - JAM), sampai };
  }
  const { lebar, bawaan, geser } = EMBER[q.bucket];
  const awal = q.from ? new Date(q.from).getTime() : sampai.getTime() - bawaan;
  return { dari: new Date(Math.floor((awal + geser) / lebar) * lebar - geser), sampai }; // misalnya 10.37 -> 10.30
}

const Galat = z.object({ pesan: z.string() });
const Jenis = z.enum(["node1", "node2", "belum-diketahui"]);
const Ember = z.enum(["15m", "1h", "1d"]);
const ParamId = z.object({ id: DeviceId.describe("device_id perangkat, misalnya a4cf12e5b7c0") });
const Rentang = z.object({
  from: z.iso.datetime({ offset: true }).optional()
    .describe("awal rentang, misalnya 2026-10-20T10:00:00+07:00 (bawaan: 1 jam sebelum to; dengan bucket: 1, 7, atau 30 hari)"),
  to: z.iso.datetime({ offset: true }).optional().describe("akhir rentang, tidak ikut dihitung (bawaan: sekarang)"),
  bucket: Ember.optional()
    .describe("ringkas per 15 menit (15m), per jam (1h), atau per hari WIB (1d); tanpa bucket = bacaan mentah"),
}).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // rentang terbalik ditolak dengan kode 400
  message: "harus lebih akhir daripada from", path: ["to"],
  when: (hasil) => hasil.issues.length === 0, // urutan diperiksa hanya kalau from dan to sudah lolos pemeriksaan format
}).refine((r) => { // ringkasan dengan terlalu banyak ember juga ditolak dengan kode 400
  if (r.bucket === undefined) return true; // bacaan mentah sudah dibatasi 1.000 bacaan oleh ambilRiwayat
  const { dari, sampai } = hitungRentang(r);
  return Math.ceil((sampai.getTime() - dari.getTime()) / EMBER[r.bucket].lebar) <= BATAS_EMBER;
}, {
  message: `rentang terlalu panjang: paling banyak ${BATAS_EMBER} ember (15m sekitar 10 hari, 1h sekitar 41 hari, `
    + "1d sekitar 2,7 tahun)",
  path: ["from"],
  when: (hasil) => hasil.issues.length === 0,
});
const angka = z.number().nullable(); // kolom yang tidak dimiliki perangkat berisi null
const Bacaan = z.object({
  ts: z.string(), fw: z.string(), suhu: angka, kelembapan: angka, cahaya: angka, tanah: angka, gerak: z.boolean().nullable(),
  level_air: angka, tekanan: angka, suhu_tanah: angka, baterai: angka, tanah_rs485: angka, ec: angka,
});
const TitikRingkasan = z.object({
  waktu: z.string(), suhu_rata: angka, suhu_min: angka, suhu_maks: angka, kelembapan_rata: angka, tanah_rata: angka,
  cahaya_rata: angka, jumlah_bacaan: z.number(),
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
      summary: "Riwayat satu perangkat dari database: bacaan mentah (paling banyak 1.000) atau ringkasan per ember",
      params: ParamId,
      querystring: Rentang,
      response: {
        200: z.union([
          z.object({
            device_id: z.string(), dari: z.string(), sampai: z.string(), jumlah: z.number(), terpotong: z.boolean(),
            bacaan: z.array(Bacaan),
          }),
          z.object({
            device_id: z.string(), dari: z.string(), sampai: z.string(), ember: Ember, jumlah: z.number(),
            ringkasan: z.array(TitikRingkasan),
          }),
        ]).describe("tanpa bucket: bacaan mentah, terpotong = ada lebih dari 1.000 bacaan; dengan bucket: satu titik "
          + "ringkasan per ember. Keduanya terlama lebih dulu"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const { dari, sampai } = hitungRentang(req.query);
    const ember = req.query.bucket;
    try {
      if (ember !== undefined) {
        const ringkasan = await ambilRingkasan(req.params.id, dari, sampai, ember);
        return {
          device_id: req.params.id, dari: waktuKontrak(dari), sampai: waktuKontrak(sampai), ember, jumlah: ringkasan.length,
          ringkasan,
        };
      }
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

  app.post("/devices/:id/command", {
    schema: {
      tags: ["perangkat"],
      summary: "Kirim satu perintah set ke perangkat, lalu tunggu ack-nya (paling lama 5 detik)",
      params: ParamId,
      body: PerintahSet,
      response: {
        200: z.object({ id: z.string(), lama_ms: z.number(), ack: Ack }).describe("perangkat menjawab dengan ack"),
        404: Galat.describe("perangkat belum pernah terdengar"),
        409: Galat.describe("perangkat offline, Node 2, jenisnya belum diketahui, atau perintah sebelumnya untuk "
          + "aktuator yang sama masih menunggu ack"),
        503: Galat.describe("backend tidak tersambung ke broker"),
        504: Galat.describe("tidak ada ack dalam 5 detik"),
      },
    },
  }, async (req, reply) => {
    const hasil = await perintahkan(req.params.id, req.body, "api"); // Modul 19: lewat satu pintu yang sama
    if (hasil.status === "tidak-dikirim") return reply.code(hasil.kode).send({ pesan: hasil.pesan });
    if (hasil.status === "tanpa-ack") return reply.code(504).send({ pesan: `tidak ada ack untuk ${hasil.id} dalam 5 detik` });
    return { id: hasil.id, lama_ms: hasil.lama_ms, ack: hasil.ack };
  });

  app.get("/devices/:id/state", {
    schema: {
      tags: ["perangkat"],
      summary: "Keadaan aktuator: yang diinginkan server (desired) dan yang dilaporkan perangkat (reported)",
      params: ParamId,
      response: {
        200: z.object({
          device_id: z.string(),
          desired: z.object({ kipas: z.boolean().optional(), lampu: z.boolean().optional(), tirai: z.number().optional() })
            .describe("keadaan yang diinginkan server untuk kipas, lampu, dan tirai (pompa tidak: perintahnya sekali jalan)"),
          reported: Keadaan.nullable().describe("keadaan terakhir yang dilaporkan perangkat lewat telemetry atau ack"),
          reported_pada: z.string().nullable().describe("waktu server saat laporan itu tiba"),
          selisih: z.array(z.string()).describe("aktuator yang keadaannya belum sama dengan keinginan server"),
        }).describe("desired, reported, dan selisihnya"),
        404: Galat.describe("perangkat belum pernah terdengar"),
      },
    },
  }, async (req, reply) => {
    const keadaan = keadaanPerangkat(req.params.id);
    if (keadaan === undefined) return reply.code(404).send({ pesan: `perangkat ${req.params.id} belum pernah terdengar` });
    return keadaan;
  });
};
