// aturan.ts - rute /rules (Modul 19): melihat, membuat, dan mengubah aturan otomatis tanpa mengubah kode dan tanpa
// memulai ulang server, serta menjalankan aturan jadwal sekarang juga untuk mengujinya. Modul 24: juga menghapusnya.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack } from "../schemas/kontrak.ts";
import { Aturan, IsiAturan } from "../schemas/aturan.ts";
import type { AturanTersimpan } from "../schemas/aturan.ts";
import { buatAturan, cariAturan, gantiAturan, hapusAturan, semuaAturan } from "../services/otomasi.ts";
import { jadwalBerikutnya, jalankanJadwal } from "../services/jadwal.ts";
import { waktuKontrak } from "../db/arsip.ts";

const Galat = z.object({ pesan: z.string() });
const ParamId = z.object({ id: z.coerce.number().int().min(1).describe("nomor aturan, misalnya 1") });
const AturanLengkap = z.object({
  id: z.number().describe("nomor aturan"),
  ...IsiAturan.shape,
  dibuat: z.string().describe("kapan aturan dibuat (UTC)"),
  diubah: z.string().describe("kapan aturan terakhir diubah (UTC)"),
  berikutnya: z.string().nullable().describe("aturan jadwal: kapan berjalan lagi (UTC); selain itu null"),
});

// aturan tersimpan + kapan jadwalnya berjalan lagi
function lengkapi(a: AturanTersimpan) {
  const berikutnya = jadwalBerikutnya(a.id);
  return { ...a, berikutnya: berikutnya === null ? null : waktuKontrak(berikutnya) };
}

export const ruteAturan: FastifyPluginAsyncZod = async (app) => {
  app.get("/rules", {
    schema: {
      tags: ["aturan"],
      summary: "Semua aturan otomatis yang sedang dipakai server",
      response: { 200: z.array(AturanLengkap).describe("aturan yang sah, urut nomor") },
    },
  }, async () => semuaAturan().map(lengkapi));

  app.post("/rules", {
    schema: {
      tags: ["aturan"],
      summary: "Buat aturan otomatis baru; langsung berlaku tanpa memulai ulang server",
      body: Aturan,
      response: {
        201: AturanLengkap.describe("aturan tersimpan dan langsung dipakai"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      return reply.code(201).send(lengkapi(await buatAturan(req.body)));
    } catch (galat) {
      req.log.error(`aturan baru gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.put("/rules/:id", {
    schema: {
      tags: ["aturan"],
      summary: "Ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server",
      params: ParamId,
      body: Aturan,
      response: {
        200: AturanLengkap.describe("aturan tersimpan dan langsung dipakai"),
        404: Galat.describe("aturan bernomor itu tidak ada"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      const aturan = await gantiAturan(req.params.id, req.body);
      if (aturan === undefined) return reply.code(404).send({ pesan: `aturan ${req.params.id} tidak ada` });
      return lengkapi(aturan);
    } catch (galat) {
      req.log.error(`aturan ${req.params.id} gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  // Modul 24: "D" pada CRUD. Menonaktifkan (PUT dengan "aktif": false) menyimpan aturannya untuk dipakai lagi; menghapus
  // membuangnya. Riwayat perintah dan kejadian lamanya tetap ada. Seperti rute lain yang mengubah sesuatu, akun viewer
  // dijawab 403 oleh satpam (keamanan.ts) sebelum sampai ke sini.
  app.delete("/rules/:id", {
    schema: {
      tags: ["aturan"],
      summary: "Hapus satu aturan; langsung tidak berlaku. Riwayat perintah dan kejadiannya tetap ada",
      params: ParamId,
      response: {
        200: z.object({ id: z.number(), nama: z.string(), pesan: z.string() }).describe("aturan sudah dihapus"),
        404: Galat.describe("aturan bernomor itu tidak ada"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      const hasil = await hapusAturan(req.params.id);
      if (hasil === undefined) return reply.code(404).send({ pesan: `aturan ${req.params.id} tidak ada` });
      return { ...hasil, pesan: `aturan ${hasil.id} (${hasil.nama}) dihapus` };
    } catch (galat) {
      req.log.error(`aturan ${req.params.id} gagal dihapus: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.post("/rules/:id/jalankan", {
    schema: {
      tags: ["aturan"],
      summary: "Jalankan aksi satu aturan jadwal sekarang juga (untuk menguji, tanpa menunggu jamnya)",
      params: ParamId,
      response: {
        200: z.object({ id: z.string(), lama_ms: z.number(), ack: Ack }).describe("perangkat menjawab dengan ack"),
        404: Galat.describe("aturan bernomor itu tidak ada"),
        409: Galat.describe("bukan aturan jadwal, aturannya tidak aktif, atau perintahnya tidak bisa dikirim"),
        503: Galat.describe("backend tidak tersambung ke broker"),
        504: Galat.describe("tidak ada ack dalam 5 detik"),
      },
    },
  }, async (req, reply) => {
    const aturan = cariAturan(req.params.id);
    if (aturan === undefined) return reply.code(404).send({ pesan: `aturan ${req.params.id} tidak ada` });
    if (aturan.kondisi.jenis !== "jadwal") return reply.code(409).send({ pesan: `aturan ${aturan.id} bukan aturan jadwal` });
    if (!aturan.aktif) return reply.code(409).send({ pesan: `aturan ${aturan.id} tidak aktif` });
    const hasil = await jalankanJadwal(aturan);
    if (hasil.status === "tidak-dikirim") return reply.code(hasil.kode === 404 ? 409 : hasil.kode).send({ pesan: hasil.pesan });
    if (hasil.status === "tanpa-ack") return reply.code(504).send({ pesan: `tidak ada ack untuk ${hasil.id} dalam 5 detik` });
    return { id: hasil.id, lama_ms: hasil.lama_ms, ack: hasil.ack };
  });
};
