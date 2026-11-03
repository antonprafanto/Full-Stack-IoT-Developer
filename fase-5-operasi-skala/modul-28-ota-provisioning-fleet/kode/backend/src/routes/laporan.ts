// laporan.ts - rute /laporan (Modul 25): kirim laporan harian CSV ke Telegram SEKARANG, tanpa menunggu jadwalnya
// (LAPORAN_JADWAL). Isinya sama persis dengan laporan terjadwal; ?hari=ini mengirim laporan sementara hari ini.
// Hanya admin: satpam (keamanan.ts) menolak viewer untuk POST sebelum sampai ke sini.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { kirimLaporan } from "../services/laporan.ts";
import { waktuKontrak } from "../db/arsip.ts";

const Galat = z.object({ pesan: z.string() });
const Pilihan = z.object({
  hari: z.enum(["kemarin", "ini"]).default("kemarin")
    .describe("kemarin = 00.00-24.00 WIB kemarin, sama dengan laporan terjadwal (bawaan); ini = hari ini 00.00 WIB sampai sekarang"),
});

export const ruteLaporan: FastifyPluginAsyncZod = async (app) => {
  app.post("/laporan/kirim", {
    schema: {
      tags: ["laporan"],
      summary: "Kirim laporan harian CSV ke Telegram sekarang juga (untuk menguji, tanpa menunggu jadwalnya)",
      querystring: Pilihan,
      response: {
        200: z.object({
          berkas: z.string().describe("nama berkas di Telegram, misalnya laporan-2026-10-26.csv"),
          dari: z.string().describe("awal rentang (UTC): 00.00 WIB = 17.00 UTC hari sebelumnya"),
          sampai: z.string().describe("akhir rentang (UTC), tidak ikut dihitung"),
          perangkat: z.number().describe("banyaknya baris: perangkat terdaftar yang kuncinya belum dicabut"),
          ukuran_byte: z.number().describe("ukuran berkas CSV, termasuk BOM 3 byte"),
          keterangan: z.string().describe("keterangan (caption) di bawah berkas"),
        }).describe("laporan sudah diterima Telegram"),
        409: Galat.describe("Telegram mati: TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID di .env belum diisi"),
        502: Galat.describe("Telegram menolak berkasnya atau tidak terjangkau (lihat log backend)"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      const hasil = await kirimLaporan(req.query.hari === "ini");
      if (hasil.status === "dilewati") return reply.code(409).send({ pesan: `laporan tidak dikirim: ${hasil.pesan}` });
      if (hasil.status === "gagal") return reply.code(502).send({ pesan: hasil.pesan });
      req.log.info(`laporan ${hasil.berkas} dikirim sekarang atas perintah akun ${req.user.sub}`);
      const { berkas, rentang, perangkat, ukuran_byte, keterangan } = hasil;
      return { berkas, dari: waktuKontrak(rentang.dari), sampai: waktuKontrak(rentang.sampai), perangkat, ukuran_byte, keterangan };
    } catch (galat) {
      req.log.error(`laporan gagal dibaca dari database: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });
};
