// daftar.ts - "buku tamu" perangkat di memori (Modul 21): siapa yang terdaftar dan siapa yang sudah dicabut.
// Isinya dimuat dari tabel devices saat server mulai, lalu diperbarui rute registrasi, ganti kunci, dan cabut, jadi backend
// tidak perlu bertanya ke database untuk setiap pesan.
// Buku tamu ini LAPIS KEDUA: broker (password file + ACL) adalah lapis pertama. Kalau broker lupa dimuat ulang setelah
// sebuah kunci dicabut, atau berkas sandi broker dan database tidak sama, backend tetap mengabaikan pesan perangkat yang
// tidak berhak (mqtt.ts) dan tidak mengirim perintah kepadanya (perintah.ts).
import type { FastifyBaseLogger } from "fastify";
import type { BarisPerangkat } from "../db/perangkat.ts";

export type Izin = "terdaftar" | "belum-terdaftar" | "dicabut" | "belum-dimuat";

interface Catatan {
  dicabut: boolean;
}

const daftar = new Map<string, Catatan>(); // hanya perangkat yang terdaftar (aktif atau dicabut)
let termuat = false;

// keputusan murni (diuji Vitest): boleh tidaknya sebuah perangkat dilayani
export function nilaiIzin(sudahDimuat: boolean, catatan: Catatan | undefined): Izin {
  if (!sudahDimuat) return "belum-dimuat"; // daftar belum terbaca dari database: jangan percaya siapa pun dulu
  if (catatan === undefined) return "belum-terdaftar";
  return catatan.dicabut ? "dicabut" : "terdaftar";
}

export function izinPerangkat(deviceId: string): Izin {
  return nilaiIzin(termuat, daftar.get(deviceId));
}

export function isiDaftar(baris: Pick<BarisPerangkat, "device_id" | "terdaftar" | "dicabut">[]): number {
  daftar.clear();
  for (const b of baris) if (b.terdaftar !== null) daftar.set(b.device_id, { dicabut: b.dicabut !== null });
  termuat = true;
  return daftar.size;
}

export function catatTerdaftar(deviceId: string): void {
  daftar.set(deviceId, { dicabut: false });
}

export function catatDicabut(deviceId: string): void {
  daftar.set(deviceId, { dicabut: true });
}

// ---- pesan yang diabaikan: dicatat di log, tetapi paling sering sekali semenit per perangkat (perangkat yang belum
// terdaftar mengirim telemetry setiap 10 detik; log tidak boleh tenggelam karenanya) ----
export const JEDA_LOG_MS = 60_000;
const terakhirDicatat = new Map<string, { waktu: number; terlewat: number }>();

const ALASAN: Record<Exclude<Izin, "terdaftar">, string> = {
  "belum-terdaftar": "belum terdaftar (daftarkan dulu lewat POST /devices)",
  "dicabut": "kuncinya sudah dicabut",
  "belum-dimuat": "daftar perangkat belum terbaca dari database",
};

// Hasilnya kalimat log, atau null kalau masih dalam jeda (logika murni, diuji Vitest)
export function kalimatAbaikan(topik: string, deviceId: string, izin: Exclude<Izin, "terdaftar">, sekarang: number): string | null {
  const catatan = terakhirDicatat.get(deviceId);
  if (catatan !== undefined && sekarang - catatan.waktu < JEDA_LOG_MS) {
    catatan.terlewat++;
    return null;
  }
  const tambahan = catatan !== undefined && catatan.terlewat > 0 ? ` (+${catatan.terlewat} pesan lain sejak catatan terakhir)` : "";
  terakhirDicatat.set(deviceId, { waktu: sekarang, terlewat: 0 });
  return `DIABAIKAN ${topik}: ${deviceId} ${ALASAN[izin]}${tambahan}`;
}

export function catatAbaikan(topik: string, deviceId: string, izin: Exclude<Izin, "terdaftar">, log: FastifyBaseLogger): void {
  const kalimat = kalimatAbaikan(topik, deviceId, izin, Date.now());
  if (kalimat !== null) log.warn(kalimat);
}
