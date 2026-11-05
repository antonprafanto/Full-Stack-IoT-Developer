// token.ts - umur "gelang" (JWT akses) dan refresh token (Modul 20). Refresh token = 32 byte acak, BUKAN JWT. Isinya
// tidak berarti apa-apa; yang memberinya arti adalah barisnya di tabel sesi. Database hanya menyimpan SHA-256-nya: token
// 256 bit acak tidak bisa ditebak, jadi hash cepat sudah cukup (bcrypt hanya perlu untuk sandi buatan manusia).
import { createHash, randomBytes } from "node:crypto";

export const UMUR_AKSES_DETIK = 15 * 60; // JWT akses ("gelang konser"): 15 menit
export const UMUR_SESI_DETIK = 7 * 24 * 60 * 60; // refresh token ("kartu terusan"): 7 hari sejak login, lalu login lagi
export const TOLERANSI_MS = 30_000; // token yang baru diganti boleh dipakai lagi 30 detik (dua permintaan bersamaan)

export function buatTokenSesi(): string {
  return randomBytes(32).toString("base64url"); // 43 karakter acak; aman ditaruh di cookie
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex"); // 64 karakter heksadesimal
}

// Apa yang harus dilakukan dengan refresh token yang TIDAK cocok dengan token_hash mana pun, tetapi cocok dengan
// token_lama sebuah sesi? (logika murni, diuji Vitest)
// - diganti kurang dari TOLERANSI_MS yang lalu: permintaan lain dari browser yang sama kebetulan lebih dulu me-refresh
//   (misalnya dua tab) -> beri JWT akses baru saja, sesi tetap;
// - 30 detik atau lebih: token lama dipakai lagi, kemungkinan dicuri -> cabut sesinya.
export function nilaiTokenLama(diperbarui: Date, sekarang: number): "toleransi" | "curian" {
  return sekarang - diperbarui.getTime() < TOLERANSI_MS ? "toleransi" : "curian";
}
