// aturan-dasar.ts - bentuk aturan otomatis (Modul 19) sebagai skema Zod, TANPA node-cron (dipisah di Modul 24). Aturan adalah
// DATA, bukan kode: hanya bentuk yang dikenal di sini yang boleh masuk, baik lewat API maupun dari database.
// Modul 24: berkas ini dipakai di DUA tempat. Backend memakainya lewat aturan.ts (ditambah pemeriksaan cron yang butuh
// node-cron), dan dashboard memakai SALINAN IDENTIK-nya di frontend/src/skema/, supaya form aturan memeriksa isian dengan aturan
// yang persis sama dengan server. Karena itu berkas ini hanya boleh mengimpor zod dan kontrak.ts (keduanya juga jalan di
// browser). Ubah selalu di backend dulu, salin ulang ke frontend, lalu jalankan npm run cek-skema di folder frontend.
import { z } from "zod";
import { DeviceId, PerintahSet } from "./kontrak.ts";

// besaran telemetry yang boleh dipakai aturan ambang
export const Besaran = z.enum(["suhu", "kelembapan", "cahaya", "tanah", "level_air", "tanah_rs485", "suhu_tanah"]);

// "Kalau <besaran> perangkat itu di atas <nyala_di_atas> terus-menerus selama <selama_detik> detik, aturan menyala;
// aturan padam lagi kalau <besaran> di bawah <padam_di_bawah>." Misalnya kipas menyala kalau suhu di atas 30 °C.
export const KondisiAmbang = z.strictObject({
  jenis: z.literal("ambang"),
  device_id: DeviceId,
  besaran: Besaran,
  nyala_di_atas: z.number(),
  padam_di_bawah: z.number(),
  selama_detik: z.number().int().min(0).max(3600),
}).refine((k) => k.padam_di_bawah < k.nyala_di_atas, {
  message: "padam_di_bawah harus lebih kecil daripada nyala_di_atas (histeresis)",
  path: ["padam_di_bawah"],
});

// Modul 24: arah sebaliknya. "Kalau <besaran> di BAWAH <nyala_di_bawah> terus-menerus selama <selama_detik> detik, aturan
// menyala; aturan padam lagi kalau <besaran> di atas <padam_di_atas>." Misalnya siram kalau tanah di bawah 30 %, dan baru boleh
// menyiram lagi setelah tanah sempat naik di atas 35 %. Celah 30-35 itu histeresis, sama seperti pada kondisi ambang.
export const KondisiAmbangBawah = z.strictObject({
  jenis: z.literal("ambang-bawah"),
  device_id: DeviceId,
  besaran: Besaran,
  nyala_di_bawah: z.number(),
  padam_di_atas: z.number(),
  selama_detik: z.number().int().min(0).max(3600),
}).refine((k) => k.padam_di_atas > k.nyala_di_bawah, {
  message: "padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis)",
  path: ["padam_di_atas"],
});

// "Setiap <cron> (jam WIB) ..." — ekspresi cron 5 bidang: menit jam tanggal bulan hari, misalnya "0 6 * * *".
// Di sini hanya banyaknya bidang yang diperiksa. Apakah isi setiap bidang masuk akal (misalnya menit 61) diperiksa node-cron di
// server (aturan.ts), karena node-cron tidak bisa jalan di browser.
export const KondisiJadwal = z.strictObject({
  jenis: z.literal("jadwal"),
  cron: z.string()
    .refine((teks) => teks.trim().split(/\s+/).length === 5, "jadwal memakai 5 bidang: menit jam tanggal bulan hari"),
});

// "... maka nyalakan <target> perangkat itu selama aturan menyala, dan padamkan lagi saat aturan padam."
export const AksiSakelar = z.strictObject({
  jenis: z.literal("sakelar"),
  device_id: DeviceId,
  target: z.enum(["kipas", "lampu"]),
  kabari: z.boolean(), // kirim pesan Telegram saat aturan ini bertindak?
});

// "... maka kirim satu perintah set", misalnya pompa 5 detik. Memakai skema perintah yang sama dengan API.
// Modul 24: juga boleh untuk kondisi ambang dan ambang-bawah. Perintahnya dikirim SEKALI saat aturan menyala; saat aturan
// padam tidak ada yang dikirim (pompa padam sendiri setelah detiknya habis).
export const AksiPerintah = z.strictObject({
  jenis: z.literal("perintah"),
  device_id: DeviceId,
  perintah: PerintahSet,
  kabari: z.boolean(),
});

// Kolom-kolom satu aturan (nama, aktif, kondisi, aksi), tanpa pemeriksaan gabungan.
export const IsiAturan = z.strictObject({
  nama: z.string().min(1).max(60),
  aktif: z.boolean(),
  kondisi: z.discriminatedUnion("jenis", [KondisiAmbang, KondisiAmbangBawah, KondisiJadwal]),
  aksi: z.discriminatedUnion("jenis", [AksiSakelar, AksiPerintah]),
});

// Isi POST /rules dan PUT /rules/:id, dengan pemeriksaan gabungan. Server menambah satu pemeriksaan lagi di aturan.ts.
export const Aturan = IsiAturan
  // Aksi sakelar artinya "menyala selama aturan menyala". Jadwal hanya punya saat mulai, tanpa saat padam, jadi jadwal hanya
  // boleh mengirim perintah. Pasangan lainnya boleh semua (Modul 24).
  .refine((a) => a.kondisi.jenis !== "jadwal" || a.aksi.jenis === "perintah", {
    message: "kondisi jadwal berpasangan dengan aksi perintah; aksi sakelar hanya untuk kondisi ambang atau ambang-bawah",
    path: ["aksi", "jenis"],
  })
  // Ambang aturan kipas juga dikirim ke perangkat sebagai suhu_kipas_on (config, kontrak 1.3), jadi rentangnya harus sama
  // dengan yang diterima perangkat: 15-45 °C.
  .refine((a) => a.kondisi.jenis !== "ambang" || a.aksi.jenis !== "sakelar" || a.kondisi.besaran !== "suhu"
    || a.aksi.target !== "kipas" || (a.kondisi.nyala_di_atas >= 15 && a.kondisi.nyala_di_atas <= 45), {
    message: "untuk aturan kipas, nyala_di_atas harus 15-45 °C (ikut dikirim ke perangkat sebagai suhu_kipas_on)",
    path: ["kondisi", "nyala_di_atas"],
  });

export type Besaran = z.infer<typeof Besaran>;
export type KondisiAmbang = z.infer<typeof KondisiAmbang>;
export type KondisiAmbangBawah = z.infer<typeof KondisiAmbangBawah>;
export type KondisiJadwal = z.infer<typeof KondisiJadwal>;
export type AksiSakelar = z.infer<typeof AksiSakelar>;
export type AksiPerintah = z.infer<typeof AksiPerintah>;
export type Aturan = z.infer<typeof Aturan>;

// aturan yang sudah tersimpan di database: ditambah nomor dan waktunya
export type AturanTersimpan = Aturan & { id: number; dibuat: string; diubah: string };
