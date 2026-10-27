// kunci.ts - kunci perangkat (API key per perangkat, Modul 21). Kunci = 32 byte acak, ditampilkan SEKALI saat dibuat, lalu
// dipakai perangkat sebagai kata sandi broker MQTT (dan kelak untuk HTTP, misalnya unduh firmware di Modul 28). Database hanya
// menyimpan SHA-256-nya: kunci 256 bit acak tidak bisa ditebak, jadi hash cepat sudah cukup (bcrypt hanya perlu untuk sandi
// buatan manusia, Modul 20). Kunci TIDAK PERNAH ditulis ke log atau ke Git.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// bentuk kunci: 43 huruf base64url (A-Z, a-z, 0-9, - dan _), aman diketik di terminal, Serial Monitor, dan MQTTX
export const Kunci = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "kunci perangkat harus 43 huruf base64url");

export function buatKunci(): string {
  return randomBytes(32).toString("base64url");
}

export function hashKunci(kunci: string): string {
  return createHash("sha256").update(kunci).digest("hex"); // 64 huruf heksadesimal
}

// Apakah kunci yang dibawa cocok dengan sidik jari di database? Perbandingannya waktu-konstan (timingSafeEqual): lama
// jawabannya tidak bergantung pada berapa huruf awal yang sudah benar, jadi tidak bisa ditebak huruf demi huruf.
// Di Modul 21 yang memeriksa kunci adalah broker (password file); fungsi ini untuk backend kelak (Modul 28).
export function cocokkanKunci(kunci: string, kunciHash: string | null): boolean {
  if (kunciHash === null) return false; // perangkat tanpa kunci (dicabut, atau Node 2 lewat Node 1)
  const dibawa = Buffer.from(hashKunci(kunci), "hex");
  const tersimpan = Buffer.from(kunciHash, "hex");
  return dibawa.length === tersimpan.length && timingSafeEqual(dibawa, tersimpan);
}
