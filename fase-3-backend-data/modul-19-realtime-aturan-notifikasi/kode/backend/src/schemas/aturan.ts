// aturan.ts - bentuk aturan otomatis (Modul 19) sebagai skema Zod. Aturan adalah DATA, bukan kode: hanya bentuk yang
// dikenal di sini yang boleh masuk, baik lewat API maupun dari database.
import { z } from "zod";
import cron from "node-cron";
import { DeviceId, PerintahSet } from "./kontrak.ts";

// besaran telemetry yang boleh dipakai aturan ambang
const Besaran = z.enum(["suhu", "kelembapan", "cahaya", "tanah", "level_air", "tanah_rs485", "suhu_tanah"]);

// "Kalau <besaran> perangkat itu di atas <nyala_di_atas> terus-menerus selama <selama_detik> detik, aturan menyala;
// aturan padam lagi kalau <besaran> di bawah <padam_di_bawah>."
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

// "Setiap <cron> (jam WIB) ..." — ekspresi cron 5 bidang: menit jam tanggal bulan hari, misalnya "0 6 * * *"
export const KondisiJadwal = z.strictObject({
  jenis: z.literal("jadwal"),
  cron: z.string()
    .refine((teks) => teks.trim().split(/\s+/).length === 5, "jadwal memakai 5 bidang: menit jam tanggal bulan hari")
    .refine((teks) => cron.validate(teks), "ekspresi cron tidak sah"),
});

// "... maka nyalakan <target> perangkat itu, dan padamkan lagi saat aturan padam."
export const AksiSakelar = z.strictObject({
  jenis: z.literal("sakelar"),
  device_id: DeviceId,
  target: z.enum(["kipas", "lampu"]),
  kabari: z.boolean(), // kirim pesan Telegram saat aturan ini bertindak?
});

// "... maka kirim satu perintah set", misalnya pompa 10 detik. Memakai skema perintah yang sama dengan API.
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
  kondisi: z.discriminatedUnion("jenis", [KondisiAmbang, KondisiJadwal]),
  aksi: z.discriminatedUnion("jenis", [AksiSakelar, AksiPerintah]),
});

// Isi POST /rules dan PUT /rules/:id.
export const Aturan = IsiAturan
  .refine((a) => (a.kondisi.jenis === "ambang") === (a.aksi.jenis === "sakelar"), {
    message: "kondisi ambang berpasangan dengan aksi sakelar; kondisi jadwal dengan aksi perintah",
    path: ["aksi", "jenis"],
  })
  // Ambang aturan kipas juga dikirim ke perangkat sebagai suhu_kipas_on (config, kontrak 1.3), jadi rentangnya harus sama
  // dengan yang diterima perangkat: 15-45 °C.
  .refine((a) => a.kondisi.jenis !== "ambang" || a.aksi.jenis !== "sakelar" || a.kondisi.besaran !== "suhu"
    || a.aksi.target !== "kipas" || (a.kondisi.nyala_di_atas >= 15 && a.kondisi.nyala_di_atas <= 45), {
    message: "untuk aturan kipas, nyala_di_atas harus 15-45 °C (ikut dikirim ke perangkat sebagai suhu_kipas_on)",
    path: ["kondisi", "nyala_di_atas"],
  });

export type KondisiAmbang = z.infer<typeof KondisiAmbang>;
export type AksiSakelar = z.infer<typeof AksiSakelar>;
export type Aturan = z.infer<typeof Aturan>;

// aturan yang sudah tersimpan di database: ditambah nomor dan waktunya
export type AturanTersimpan = Aturan & { id: number; dibuat: string; diubah: string };
