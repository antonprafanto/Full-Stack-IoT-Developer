// firmware.ts - rute rilis firmware (Modul 28): admin mengunggah berkas .bin, daftar rilis ("manifest" dari database),
// menarik rilis buruk, dan rute UNDUH untuk perangkat (/fw/node-1/<versi>.bin) yang dikunci kunci perangkat.
//
// Kenapa berkas firmware tidak disajikan Caddy apa adanya (file_server) seperti halaman dashboard? Berkas .bin Node 1 bisa
// berisi kunci ESP-NOW (kunci.h, Modul 14), dan siapa pun yang tahu alamatnya bisa mengunduh berkas publik. Rute ini hanya
// melayani perangkat terdaftar yang membuktikan dirinya dengan device_id + kunci perangkatnya (Basic Auth, persis
// httpUpdate.setAuthorization() di firmware), janji kunci.ts sejak Modul 21.
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { env } from "../config/env.ts";
import { DeviceId } from "../schemas/kontrak.ts";
import { cocokkanKunci } from "../auth/kunci.ts";
import { ambilRilis, semuaRilis, simpanRilis, tarikRilis } from "../db/armada.ts";
import type { BarisRilis } from "../db/armada.ts";
import { ambilSidikKunci } from "../db/perangkat.ts";
import { waktuKontrak } from "../db/arsip.ts";
import { FOLDER, catatMulaiUnduh } from "../services/ota.ts";
import { POLA_VERSI_RILIS, versiTertinggi } from "../services/versi.ts";

export const RAK_PROGRAM = 1_966_080; // satu rak program (app0/app1) skema Minimal SPIFFS (Modul 10): 0x1E0000 byte
const BATAS_UNGGAH = 2 * 1024 * 1024; // 2 MiB: bawaan Fastify hanya 1 MiB, firmware Node 1 sekitar 1,2 MB
const Galat = z.object({ pesan: z.string() });
// 400 unggahan punya DUA bentuk: berkas ditolak rute ini ({pesan}), atau jenis/versi/uji di alamat tidak sah (galat validasi
// Fastify). Keduanya wajib tertulis: bentuk yang tidak tertulis membuat Fastify menjawab 500 FST_ERR_FAILED_ERROR_SERIALIZATION
// (temuan verifikasi M28).
const Galat400 = z.union([Galat, z.object({ statusCode: z.number(), code: z.string(), error: z.string(), message: z.string() })]);
// versi rilis: x.y.z tanpa nol di depan (services/versi.ts menjelaskan alasannya)
const VersiRilis = z.string().regex(POLA_VERSI_RILIS, "versi harus berbentuk x.y.z tanpa nol di depan, misalnya 1.7.1");
const ParamRilis = z.object({
  jenis: z.enum(["node1"]).describe("jenis perangkat; hanya node1 (Node 2 tidak diperbarui lewat udara)"),
  versi: VersiRilis.describe("versi SemVer firmware, misalnya 1.7.1 (sama dengan VERSI_FIRMWARE di konfigurasi.h)"),
});
const JENIS_DARI_FOLDER: Record<string, string> = Object.fromEntries(Object.entries(FOLDER).map(([j, f]) => [f, j]));

// jalur berkas di lemari data-firmware, misalnya data-firmware/node-1/1.7.1.bin
const jalurBerkas = (jenis: string, versi: string) => join(resolve(env.FIRMWARE_DIR), FOLDER[jenis], `${versi}.bin`);
const urlUnduh = (jenis: string, versi: string) =>
  (env.ALAMAT_SERVER === "" ? null : `${env.ALAMAT_SERVER}/fw/${FOLDER[jenis]}/${versi}.bin`);

const Rilis = z.object({
  jenis: z.string(),
  versi: z.string(),
  ukuran: z.number().describe("byte"),
  sha256: z.string().describe("SHA-256 isi berkas, dihitung server saat diunggah (sama dengan sha256sum berkasnya)"),
  catatan: z.string().nullable(),
  uji: z.boolean().describe("rilis UJI: hanya boleh dikirim ke satu perangkat, tidak pernah ikut perbarui semua"),
  pengunggah: z.string().nullable().describe("nomor akun admin"),
  dibuat: z.string(),
  ditarik: z.string().nullable(),
  url: z.string().nullable().describe("alamat unduh perangkat; null kalau ALAMAT_SERVER belum diisi"),
});
const tampilkan = (r: BarisRilis) => ({
  jenis: r.jenis, versi: r.versi, ukuran: r.ukuran, sha256: r.sha256, catatan: r.catatan, uji: r.uji, pengunggah: r.pengunggah,
  dibuat: waktuKontrak(r.dibuat), ditarik: r.ditarik === null ? null : waktuKontrak(r.ditarik), url: urlUnduh(r.jenis, r.versi),
});

const SALAH_DATABASE = "database sedang tidak bisa dihubungi, coba lagi sebentar lagi";

export const ruteFirmware: FastifyPluginAsyncZod = async (app) => {
  // Badan unggahan = isi berkas .bin apa adanya (Content-Type: application/octet-stream), bukan formulir multipart: tanpa
  // paket tambahan. Pengurai ini hanya berlaku di dalam berkas rute ini (plugin Fastify terbungkus sendiri).
  app.addContentTypeParser("application/octet-stream", { parseAs: "buffer", bodyLimit: BATAS_UNGGAH },
    (_req, badan, selesai) => selesai(null, badan));

  app.post("/firmware/:jenis/:versi", {
    bodyLimit: BATAS_UNGGAH, // lebih besar = 413 sebelum kode di bawah berjalan
    schema: {
      tags: ["firmware"],
      summary: "Unggah berkas firmware .bin (admin). Badan = isi berkas, Content-Type: application/octet-stream",
      description: "Unggah <sketsa>.ino.bin dari folder build (Sketch → Export Compiled Binary), BUKAN .merged.bin atau "
        + ".bootloader.bin. Server memeriksa bait pertama 0xE9 dan ukuran ≤ 1.966.080 byte, lalu menghitung SHA-256-nya. "
        + "Versi yang sudah ada tidak bisa ditimpa (409): firmware yang berubah selalu mendapat versi baru.",
      params: ParamRilis,
      querystring: z.object({
        catatan: z.string().max(200).optional().describe("misalnya \"sapaan versi baru\""),
        uji: z.enum(["true", "false"]).optional().describe("true = rilis UJI (misalnya 1.7.2 yang sengaja rusak)"),
      }),
      response: {
        201: Rilis.describe("rilis baru tersimpan"),
        200: Rilis.describe("berkas versi ini sempat hilang dari lemari dan dipulihkan (isinya sama persis)"),
        400: Galat400.describe("bukan berkas aplikasi ESP32, kosong, atau terlalu besar untuk satu rak program ({pesan}); "
          + "atau jenis/versi/uji di alamat tidak sah (galat validasi Fastify)"),
        409: Galat.describe("versi itu sudah ada"),
        503: Galat.describe("database atau lemari firmware sedang bermasalah"),
      },
    },
  }, async (req, reply) => {
    const isi = req.body as unknown;
    if (!Buffer.isBuffer(isi) || isi.length === 0) {
      return reply.code(400).send({ pesan: "badan harus isi berkas .bin dengan Content-Type: application/octet-stream" });
    }
    if (isi[0] !== 0xe9) { // semua citra aplikasi ESP32 diawali bait 0xE9 (HTTPUpdate memeriksa hal yang sama: galat -106)
      return reply.code(400).send({ pesan: "bukan citra aplikasi ESP32: bait pertama harus 0xE9. Unggah <sketsa>.ino.bin dari "
        + "folder build, bukan .merged.bin atau .bootloader.bin" });
    }
    if (isi.length > RAK_PROGRAM) {
      return reply.code(400).send({ pesan: `terlalu besar: ${isi.length} byte, satu rak program hanya ${RAK_PROGRAM} byte` });
    }
    const { jenis, versi } = req.params;
    const sha256 = createHash("sha256").update(isi).digest("hex");
    const jalur = jalurBerkas(jenis, versi);
    // Nama sementara UNIK per unggahan: dua unggahan versi yang sama pada saat bersamaan (klik ganda, dua admin) tidak
    // menulis ke berkas yang sama, dan yang kalah (409) hanya menghapus berkas sementaranya sendiri (temuan verifikasi M28).
    const sementara = `${jalur}.${randomUUID()}.tmp`;
    try {
      // Tulis ke berkas sementara DULU, baru catat di database, baru ganti nama: perangkat tidak pernah bisa mengunduh
      // berkas yang setengah tertulis.
      await mkdir(join(resolve(env.FIRMWARE_DIR), FOLDER[jenis]), { recursive: true });
      await writeFile(sementara, isi);
      const baru = await simpanRilis({ jenis, versi, ukuran: isi.length, sha256, catatan: req.query.catatan ?? null,
        uji: req.query.uji === "true", pengunggah: req.user.sub });
      if (baru === undefined) { // versi sudah ada di database
        const lama = await ambilRilis(jenis, versi);
        const masihAda = await stat(jalur).then(() => true, () => false);
        if (lama !== undefined && !masihAda && lama.sha256 === sha256) { // berkasnya hilang (lemari dihapus?): pulihkan
          await rename(sementara, jalur);
          req.log.warn(`firmware ${jenis} ${versi} dipulihkan ke lemari oleh akun ${req.user.sub} (sha256 sama)`);
          return reply.code(200).send(tampilkan(lama));
        }
        await rm(sementara, { force: true });
        return reply.code(409).send({ pesan: `${jenis} ${versi} sudah ada: versi tidak boleh ditimpa. Naikkan VERSI_FIRMWARE, `
          + "build ulang, lalu unggah dengan versi baru" });
      }
      await rename(sementara, jalur);
      req.log.info(`firmware ${jenis} ${versi}${baru.uji ? " (UJI)" : ""} diunggah akun ${req.user.sub}: ${isi.length} byte, `
        + `sha256 ${sha256}`);
      return reply.code(201).send(tampilkan(baru));
    } catch (galat) {
      await rm(sementara, { force: true }).catch(() => {});
      req.log.error(`unggah firmware ${jenis} ${versi} gagal: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: `firmware belum tersimpan: ${(galat as Error).message}` });
    }
  });

  app.get("/firmware", {
    schema: {
      tags: ["firmware"],
      summary: "Daftar rilis firmware (\"manifest\" dari database) beserta ringkasan canary setiap versi",
      response: {
        200: z.object({
          terbaru: z.object({ node1: z.string().nullable() })
            .describe("rilis tertinggi yang bukan uji dan belum ditarik (dasar \"perlu diperbarui\")"),
          rilis: z.array(Rilis.extend({
            canary_berhasil: z.number().describe("perangkat canary yang berhasil memakai versi ini"),
            canary_gagal: z.number().describe("perangkat canary yang rollback atau gagal memakai versi ini"),
            boleh_semua: z.boolean().describe("tombol Perbarui semua boleh dipakai untuk versi ini"),
            alasan_semua: z.string().nullable(),
          })).describe("urut waktu unggah"),
        }),
        503: Galat,
      },
    },
  }, async (req, reply) => {
    try {
      const semua = await semuaRilis();
      const layak = semua.filter((r) => !r.uji && r.ditarik === null);
      return {
        terbaru: { node1: versiTertinggi(layak.filter((r) => r.jenis === "node1").map((r) => r.versi)) },
        rilis: semua.map((r) => {
          const alasan = r.ditarik !== null ? "rilis ditarik" : r.uji ? "rilis uji: hanya per perangkat"
            : r.canary_gagal > 0 ? "ada canary yang gagal atau rollback" : r.canary_berhasil === 0 ? "belum ada canary yang berhasil"
              : null;
          return { ...tampilkan(r), canary_berhasil: r.canary_berhasil, canary_gagal: r.canary_gagal, boleh_semua: alasan === null,
            alasan_semua: alasan };
        }),
      };
    } catch (galat) {
      req.log.error(`daftar rilis gagal dibaca: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.post("/firmware/:jenis/:versi/tarik", {
    schema: {
      tags: ["firmware"],
      summary: "Tarik rilis buruk (admin): tidak dikirim lagi dan tidak bisa diunduh lagi. Berkasnya tetap di lemari",
      params: ParamRilis,
      response: { 200: Rilis, 404: Galat.describe("tidak ada, atau sudah ditarik"), 503: Galat },
    },
  }, async (req, reply) => {
    try {
      const baris = await tarikRilis(req.params.jenis, req.params.versi);
      if (baris === undefined) return reply.code(404).send({ pesan: `${req.params.jenis} ${req.params.versi} tidak ada atau sudah ditarik` });
      req.log.warn(`firmware ${baris.jenis} ${baris.versi} DITARIK oleh akun ${req.user.sub}`);
      return tampilkan(baris);
    } catch (galat) {
      req.log.error(`tarik rilis gagal: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  // ---- UNDUHAN PERANGKAT (tanpa cookie login; ada di RUTE_TERBUKA keamanan.ts, jadi rute ini memeriksa sendiri) ----
  // Permintaan dari HTTPUpdate (Arduino-ESP32 3.3.12): GET ... HTTP/1.0, User-Agent ESP32-http-Update, Basic Auth
  // device_id:kunci, x-ESP32-STA-MAC (huruf besar dengan titik dua), x-ESP32-version (versi yang sedang berjalan).
  // Jawaban yang dimengerti HTTPUpdate: 200 + Content-Length (tanpa itu galat -101), 304 = tidak ada pembaruan,
  // 403 = galat -103, 404 = galat -102. Pengalihan (3xx) TIDAK diikuti (galat -104), jadi rute ini tidak pernah mengalihkan.
  app.get("/fw/:folder/:berkas", {
    config: { rateLimit: { max: 120, timeWindow: 60_000 } }, // 120 unduhan per menit per alamat IP: cukup untuk armada rumah
    schema: {
      tags: ["firmware"],
      security: [], // tanpa cookie login: perangkat membuktikan dirinya dengan Basic Auth device_id:kunci
      summary: "UNDUH firmware (perangkat). Basic Auth device_id:kunci + kepala x-ESP32-STA-MAC; 304 bila versinya sama",
      // Jawaban sengaja tidak diberi skema: isi 200 adalah berkas mentah (stream), bukan JSON yang perlu diserialkan.
      description: "200 = isi berkas apa adanya (application/octet-stream, Content-Length, x-SHA256, tanpa kompresi). "
        + "304 = perangkat sudah memakai versi ini (x-ESP32-version sama). 403 = kunci salah, perangkat dinonaktifkan, atau "
        + "x-ESP32-STA-MAC bukan milik device_id. 404 = versi tidak ada, ditarik, atau berkasnya hilang. HEAD = kepala saja.",
      params: z.object({ folder: z.string().describe("node-1"), berkas: z.string().describe("misalnya 1.7.1.bin") }),
    },
  }, async (req, reply) => {
    const jenis = JENIS_DARI_FOLDER[req.params.folder];
    const versi = /^(\d+\.\d+\.\d+)\.bin$/.exec(req.params.berkas)?.[1];
    if (jenis === undefined || versi === undefined) return reply.code(404).send({ pesan: "tidak ada" });
    // 1) siapa yang meminta? Basic base64(device_id:kunci)
    const basic = /^Basic ([A-Za-z0-9+/=]+)$/.exec(req.headers.authorization ?? "");
    const [id, kunci] = basic === null ? [] : Buffer.from(basic[1], "base64").toString("utf8").split(/:(.*)/s);
    if (id === undefined || kunci === undefined || !DeviceId.safeParse(id).success) {
      return reply.code(403).send({ pesan: "butuh Basic Auth device_id:kunci" });
    }
    let sidik: string | undefined;
    try {
      sidik = await ambilSidikKunci(id);
    } catch (galat) {
      req.log.error(`unduh firmware: database tidak bisa dibaca (${(galat as Error).message})`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
    if (!cocokkanKunci(kunci, sidik ?? null)) { // waktu-konstan (kunci.ts); kunci tidak pernah ditulis ke log
      req.log.warn(`unduh firmware ${versi} DITOLAK untuk ${id}: kunci salah, belum terdaftar, atau dicabut`);
      return reply.code(403).send({ pesan: "kunci salah, perangkat belum terdaftar, atau sudah dinonaktifkan" });
    }
    // 2) MAC WiFi yang dikirim HTTPUpdate harus milik device_id itu (A4:CF:12:E5:B7:C0 = a4cf12e5b7c0): kunci yang bocor
    //    saja tidak cukup untuk mengunduh dari alat lain tanpa meniru kepala ini juga (pengaman kecil, bukan pengganti kunci)
    const mac = String(req.headers["x-esp32-sta-mac"] ?? "").toLowerCase().replaceAll(":", "");
    if (mac !== id) {
      req.log.warn(`unduh firmware ${versi} DITOLAK untuk ${id}: x-ESP32-STA-MAC "${mac}" bukan milik perangkat itu`);
      return reply.code(403).send({ pesan: "x-ESP32-STA-MAC tidak ada atau tidak sama dengan device_id" });
    }
    // 3) berkas versi itu ada dan tidak ditarik?
    let rilis: BarisRilis | undefined;
    try {
      rilis = await ambilRilis(jenis, versi);
    } catch (galat) {
      req.log.error(`unduh firmware: database tidak bisa dibaca (${(galat as Error).message})`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
    if (rilis === undefined || rilis.ditarik !== null) return reply.code(404).send({ pesan: `firmware ${versi} tidak ada` });
    // 4) versi yang sedang berjalan sudah sama: 304, HTTPUpdate menjawab "tidak ada pembaruan" tanpa mengunduh apa pun
    if (req.headers["x-esp32-version"] === versi) return reply.code(304).send();
    const jalur = jalurBerkas(jenis, versi);
    const info = await stat(jalur).catch(() => null);
    if (info === null || info.size !== rilis.ukuran) {
      req.log.error(`firmware ${jenis} ${versi} ada di database, tetapi berkasnya ${info === null ? "hilang dari" : "berubah di"} `
        + "lemari data-firmware: unggah lagi berkas yang sama");
      return reply.code(404).send({ pesan: `berkas firmware ${versi} tidak ada di server` });
    }
    // 5) kirim apa adanya: Content-Length WAJIB (HTTPUpdate memakai HTTP/1.0, tanpa chunked), tanpa kompresi, tanpa cache
    reply.header("content-type", "application/octet-stream").header("content-length", info.size)
      .header("cache-control", "no-cache").header("x-SHA256", rilis.sha256);
    if (req.method !== "HEAD") { // HEAD = kepala saja (memeriksa ukuran tanpa mengunduh): Fastify membuang isinya sendiri
      req.log.info(`firmware ${versi} diunduh ${id} (sedang memakai ${String(req.headers["x-esp32-version"] ?? "?")})`);
      catatMulaiUnduh(id, versi);
    }
    return reply.send(createReadStream(jalur));
  });
};
