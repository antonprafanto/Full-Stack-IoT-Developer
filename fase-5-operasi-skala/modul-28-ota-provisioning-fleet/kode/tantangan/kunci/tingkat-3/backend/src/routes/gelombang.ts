// gelombang.ts - Tantangan 3 Modul 28 (kunci): rute gelombang otomatis (services/gelombang.ts). Memulai dan menghentikan
// khusus admin (satpam keamanan.ts menjawab 403 untuk viewer); melihat keadaannya boleh semua peran.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { POLA_VERSI_RILIS } from "../services/versi.ts";
import { TUNGGU_BAWAAN_MENIT, UKURAN_AWAL_BAWAAN, hentikanGelombang, keadaanGelombang, mulaiGelombang }
  from "../services/gelombang.ts";

const Galat = z.object({ pesan: z.string() });
const Keadaan = z.object({
  versi: z.string(),
  keadaan: z.enum(["berjalan", "tunggu-sehat", "selesai", "berhenti"]),
  tahap_ke: z.number().describe("tahap yang sedang (atau terakhir) berjalan: 0 = canary, 1 = gelombang 1, dan seterusnya"),
  tunggu_menit: z.number().describe("masa tunggu sehat canary"),
  alasan: z.string().nullable().describe("kenapa berhenti; null = belum/tidak berhenti"),
  mulai: z.string(),
  selesai: z.string().nullable(),
  tahap: z.array(z.object({
    nama: z.string(),
    perangkat: z.array(z.object({
      device_id: z.string(),
      status: z.string().describe("antre, berjalan, berhasil, sudah, rollback, gagal, kedaluwarsa, ditolak, atau dilewati"),
      pesan: z.string().nullable(),
    })),
  })),
});

export const ruteGelombang: FastifyPluginAsyncZod = async (app) => {
  app.post("/armada/gelombang", {
    schema: {
      tags: ["armada"],
      summary: "Mulai gelombang otomatis (admin): canary, tunggu sehat, lalu sisanya bertahap; rem darurat bila ada yang gagal",
      description: "Canary dulu; kalau berhasil, canary harus tetap online dengan versi baru selama tunggu_menit (bawaan 10), "
        + "lalu perangkat lain dikirim per gelombang (ukuran_awal, lalu dua kali lipat). Satu rollback, gagal, atau kedaluwarsa "
        + "= berhenti. Telegram: satu ringkasan per tahap. Rilis uji ditolak. Jawaban 202 = gelombang DIMULAI; keadaannya "
        + "di GET /armada/gelombang.",
      body: z.strictObject({
        versi: z.string().regex(POLA_VERSI_RILIS, "versi harus berbentuk x.y.z tanpa nol di depan, misalnya 1.7.1"),
        tunggu_menit: z.number().int().min(1).max(60).optional()
          .describe(`masa tunggu sehat canary dalam menit (bawaan ${TUNGGU_BAWAAN_MENIT}); pendekkan hanya untuk uji`),
        ukuran_awal: z.number().int().min(1).max(50).optional()
          .describe(`jumlah perangkat gelombang pertama sesudah canary (bawaan ${UKURAN_AWAL_BAWAAN}), lalu dua kali lipat`),
      }),
      response: {
        202: Keadaan.describe("gelombang dimulai (canary sedang dikirimi)"),
        404: Galat.describe("firmware versi itu belum diunggah"),
        409: Galat.describe("rilis ditarik/uji, canary belum ada atau pernah gagal, atau gelombang lain masih berjalan"),
        503: Galat,
      },
    },
  }, async (req, reply) => {
    try {
      const hasil = await mulaiGelombang(req.body.versi, req.user.sub,
        { tungguMenit: req.body.tunggu_menit, ukuranAwal: req.body.ukuran_awal });
      if (hasil.kode !== 202) return reply.code(hasil.kode).send({ pesan: hasil.pesan });
      return reply.code(202).send(hasil.keadaan);
    } catch (galat) {
      req.log.error(`gelombang ${req.body.versi} gagal dimulai: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.get("/armada/gelombang", {
    schema: {
      tags: ["armada"],
      summary: "Keadaan gelombang otomatis terakhir (sejak backend menyala)",
      response: { 200: Keadaan, 404: Galat.describe("belum ada gelombang sejak backend menyala") },
    },
  }, async (_req, reply) => keadaanGelombang() ?? reply.code(404).send({ pesan: "belum ada gelombang sejak backend menyala" }));

  app.post("/armada/gelombang/berhenti", {
    schema: {
      tags: ["armada"],
      summary: "Hentikan gelombang yang sedang berjalan (admin): tahap berikutnya tidak dikirim",
      description: "Perintah yang sudah terkirim tidak ditarik kembali; hasilnya tetap dicatat. Kirim tanpa badan.",
      response: { 200: Keadaan, 409: Galat.describe("tidak ada gelombang yang sedang berjalan") },
    },
  }, async (req, reply) => hentikanGelombang(req.user.sub)
    ?? reply.code(409).send({ pesan: "tidak ada gelombang yang sedang berjalan" }));
};
