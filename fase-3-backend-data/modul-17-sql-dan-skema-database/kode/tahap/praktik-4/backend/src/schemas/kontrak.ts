// kontrak.ts - Lampiran A (kontrak data 1.2) dalam bentuk skema Zod: kontrak yang bisa dijalankan.
// Setiap pesan dari perangkat dicek dengan skema ini sebelum disimpan ("jangan percaya perangkat").
import { z } from "zod";

z.config(z.locales.id()); // pesan galat Zod dalam bahasa Indonesia

export const DeviceId = z.string().regex(/^[0-9a-f]{12}$/, "device_id harus 12 digit heksadesimal huruf kecil");

const Waktu = z.iso.datetime(); // waktu UTC, contoh 2026-10-19T02:10:05Z
const Versi = z.string().regex(/^\d+\.\d+\.\d+$/, "versi harus berbentuk x.y.z");
const desimal = (min: number, max: number) => z.number().min(min).max(max).nullable();
const bulat = (min: number, max: number) => z.number().int().min(min).max(max).nullable();

// telemetry Node 1 (kontrak 1.0) ditambah tiga kolom sensor RS-485 yang boleh tidak ada (kontrak 1.2)
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

export const Status = z.enum(["online", "offline", "offline-mode"]);

export const Vitals = z.strictObject({
  ts: Waktu,
  rssi: z.number().int().max(0),
  uptime_s: z.number().int().min(0),
  heap_free: z.number().int().min(0),
});

export const Keadaan = z.strictObject({
  kipas: z.boolean(),
  lampu: z.boolean(),
  pompa: z.boolean(),
  tirai: z.number().int().min(0).max(180),
});

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

export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
export type TelemetryNode2 = z.infer<typeof TelemetryNode2>;
export type Status = z.infer<typeof Status>;
export type Vitals = z.infer<typeof Vitals>;
export type Ack = z.infer<typeof Ack>;
export type PerintahSet = z.infer<typeof PerintahSet>;
