// kontrak.ts - Lampiran A (kontrak data 1.6, Modul 28) dalam bentuk skema Zod: kontrak yang bisa dijalankan.
// Setiap pesan dari perangkat dicek dengan skema ini sebelum disimpan ("jangan percaya perangkat").
// Modul 28 (kontrak 1.6): vitals boleh membawa reset_reason, fw, dan laporan pembaruan ota; cmd "update" dirinci (sha256,
// ukuran); config boleh membawa jeda.vitals_s. Bentuk lama (firmware sampai 1.6.0) tetap sah.
// Berkas ini disalin SAMA PERSIS ke frontend/src/skema/kontrak.ts (npm run cek-skema): hanya boleh mengimpor zod.
import { z } from "zod";

z.config(z.locales.id()); // pesan galat Zod dalam bahasa Indonesia

export const DeviceId = z.string().regex(/^[0-9a-f]{12}$/, "device_id harus 12 digit heksadesimal huruf kecil");

const Waktu = z.iso.datetime(); // waktu UTC, contoh 2026-10-19T02:10:05Z
const Versi = z.string().regex(/^\d+\.\d+\.\d+$/, "versi harus berbentuk x.y.z");
const desimal = (min: number, max: number) => z.number().min(min).max(max).nullable();
const bulat = (min: number, max: number) => z.number().int().min(min).max(max).nullable();

// keadaan keempat aktuator, sama di ack (kontrak 1.0) dan di telemetry Node 1 (kontrak 1.3)
export const Keadaan = z.strictObject({
  kipas: z.boolean(),
  lampu: z.boolean(),
  pompa: z.boolean(),
  tirai: z.number().int().min(0).max(180),
});

// telemetry Node 1 (kontrak 1.0) ditambah tiga kolom sensor RS-485 yang boleh tidak ada (kontrak 1.2) dan keadaan
// aktuator (kontrak 1.3; firmware yang lebih lama belum menulisnya, jadi boleh tidak ada)
export const TelemetryNode1 = z.strictObject({
  ts: Waktu,
  fw: Versi,
  suhu: desimal(-40, 80),
  kelembapan: bulat(0, 100),
  cahaya: z.number().int().min(0).max(4095),
  tanah: z.number().int().min(0).max(100),
  gerak: z.boolean(),
  level_air: bulat(0, 100),
  tanah_rs485: desimal(0, 100).optional(),
  suhu_tanah: desimal(-55, 125).optional(),
  ec: bulat(0, 20000).optional(),
  state: Keadaan.optional(),
});

// telemetry Node 2 (kontrak 1.1), diterbitkan Node 1 atas nama Node 2; dikenali dari kolom tekanan
export const TelemetryNode2 = z.strictObject({
  ts: Waktu,
  fw: Versi,
  suhu: desimal(-40, 80),
  kelembapan: bulat(0, 100),
  tekanan: desimal(300, 1100),
  suhu_tanah: desimal(-55, 125),
  tanah: bulat(0, 100),
  baterai: desimal(2.5, 4.5).optional(),
});

// offline-mode (dipakai mulai Modul 28): perangkat SENGAJA berhenti, misalnya sebelum memasang firmware baru. Diterbitkan
// perangkat sendiri sebelum memutus sambungan dengan rapi, jadi broker tidak menerbitkan wasiat "offline".
export const Status = z.enum(["online", "offline", "offline-mode"]);

// Modul 28: alasan perangkat menyala ulang terakhir kali (kontrak bagian 6). Tujuh nilai ini saja; alasan lain dari ESP-IDF
// ditulis UNKNOWN.
export const ResetReason = z.enum(["POWERON", "BROWNOUT", "SW", "PANIC", "WDT", "DEEPSLEEP", "UNKNOWN"]);

// Modul 28: laporan hasil satu pembaruan firmware di dalam vitals (kontrak 1.6). id = id perintah update-nya; perangkat
// menyimpannya di NVS sebelum restart dan mengulangnya di paling banyak 3 vitals (vitals QoS 0 bisa hilang).
export const LaporanOta = z.strictObject({
  id: z.string().min(1).max(39),
  hasil: z.enum(["berhasil", "rollback", "gagal"]),
  versi: Versi, // versi yang DICOBA dipasang (ke_versi), bukan versi yang sedang berjalan
  pesan: z.string().max(80).optional(),
});

// vitals (kontrak 1.0) ditambah laporan mode offline (kontrak 1.3): offline_s dan kipas_lokal selalu datang bersama.
// Modul 28 (kontrak 1.6): reset_reason dan fw (selalu bersama, wajib mulai firmware 1.7.0), dan laporan pembaruan ota
// (hanya bersama fw). Vitals firmware lama tanpa ketiganya tetap sah.
export const Vitals = z
  .strictObject({
    ts: Waktu,
    rssi: z.number().int().max(0),
    uptime_s: z.number().int().min(0),
    heap_free: z.number().int().min(0),
    offline_s: z.number().int().min(0).optional(),
    kipas_lokal: z.number().int().min(0).optional(),
    reset_reason: ResetReason.optional(),
    fw: Versi.optional(),
    ota: LaporanOta.optional(),
  })
  .refine((v) => (v.offline_s === undefined) === (v.kipas_lokal === undefined),
    "laporan mode offline harus lengkap: offline_s dan kipas_lokal selalu datang bersama")
  .refine((v) => (v.reset_reason === undefined) === (v.fw === undefined),
    "reset_reason dan fw selalu datang bersama (firmware 1.7.0 ke atas)")
  .refine((v) => v.ota === undefined || v.fw !== undefined, "laporan ota hanya boleh bersama fw");

export const Ack = z
  .strictObject({
    id: z.string().min(1).max(39),
    ts: Waktu.nullable(),
    ok: z.boolean(),
    pesan: z.string().optional(),
    state: Keadaan,
  })
  .refine((a) => a.ok || a.pesan !== undefined, "pesan wajib ada kalau ok bernilai false"); // kontrak bagian 8

// isi POST /devices/:id/command: satu aktuator dan nilainya (kontrak bagian 7)
export const PerintahSet = z.discriminatedUnion("target", [
  z.strictObject({ target: z.literal("lampu"), nilai: z.boolean() }),
  z.strictObject({ target: z.literal("kipas"), nilai: z.boolean() }),
  z.strictObject({ target: z.literal("pompa"), nilai: z.number().int().min(1).max(10) }),
  z.strictObject({ target: z.literal("tirai"), nilai: z.number().int().min(0).max(180) }),
]);

// Modul 28: isi cmd "update" yang diterbitkan server (kontrak 1.6 bagian 7). TIDAK PERNAH retained. url = alamat final
// berkas firmware (tanpa pengalihan: HTTPUpdate tidak mengikuti 3xx), sha256 = sidik jari isi berkas (64 heksadesimal
// huruf kecil), ukuran = panjang berkas dalam byte, paling besar satu rak program Minimal SPIFFS.
export const CmdUpdate = z.strictObject({
  id: z.string().min(1).max(39),
  ts: Waktu,
  aksi: z.literal("update"),
  versi: Versi,
  url: z.string().max(200).regex(/^https?:\/\/[^\s/]+\/fw\/node-1\/\d+\.\d+\.\d+\.bin$/,
    "url harus http(s)://<alamat>/fw/node-1/<versi>.bin"),
  sha256: z.string().regex(/^[0-9a-f]{64}$/, "sha256 harus 64 heksadesimal huruf kecil"),
  ukuran: z.number().int().min(1).max(1966080),
}).refine((c) => c.url.endsWith(`/${c.versi}.bin`), "url harus menunjuk berkas versi yang sama dengan versi");

// Modul 28: jeda kirim yang bisa diatur dari jauh lewat cmd "config" (kontrak 1.6). Hanya vitals: telemetry tetap setiap
// 10 detik (kontrak aturan 3).
export const Jeda = z.strictObject({
  vitals_s: z.number().int().min(60).max(3600),
});

// ambang aturan pengaman lokal yang dikirim lewat cmd "config" (kontrak 1.3 bagian 7): paling sedikit satu kunci
export const Ambang = z
  .strictObject({
    suhu_kipas_on: z.number().min(15).max(45).optional(),
    tanah_siram: z.number().int().min(0).max(100).optional(),
  })
  .refine((a) => a.suhu_kipas_on !== undefined || a.tanah_siram !== undefined, "ambang harus berisi suhu_kipas_on atau tanah_siram");

export type Keadaan = z.infer<typeof Keadaan>;
export type Ambang = z.infer<typeof Ambang>;
export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
export type TelemetryNode2 = z.infer<typeof TelemetryNode2>;
export type Status = z.infer<typeof Status>;
export type Vitals = z.infer<typeof Vitals>;
export type ResetReason = z.infer<typeof ResetReason>;
export type LaporanOta = z.infer<typeof LaporanOta>;
export type CmdUpdate = z.infer<typeof CmdUpdate>;
export type Jeda = z.infer<typeof Jeda>;
export type Ack = z.infer<typeof Ack>;
export type PerintahSet = z.infer<typeof PerintahSet>;
