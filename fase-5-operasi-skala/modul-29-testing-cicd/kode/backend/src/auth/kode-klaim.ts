// kode-klaim.ts - kode klaim sekali pakai untuk mendaftarkan perangkat baru (Modul 28). Admin membuat kodenya di /armada;
// kode itu diketik di portal WiFi perangkat (atau perintah Serial "klaim <kode>"), lalu perangkat menukarnya dengan kunci
// perangkatnya sendiri lewat POST /provision/klaim. Seperti "sertifikat klaim" di layanan IoT besar, dalam ukuran rumah.
//
// Bentuknya 8 huruf Crockford Base32, ditulis XXXX-XXXX (misalnya 7K2M-QF9D): 32 huruf yang tidak mudah tertukar saat
// dibaca dan diketik (tanpa I, L, O, U). 8 huruf x 5 bit = 40 bit acak: sekitar satu triliun kemungkinan. Dengan kedaluwarsa
// 30 menit dan paling banyak 10 percobaan per menit per alamat IP, peluang menebaknya praktis nol.
// Database hanya menyimpan SHA-256-nya, seperti kunci perangkat (kunci.ts): kodenya hanya tampil sekali kepada admin.
import { createHash, randomInt } from "node:crypto";

const HURUF = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford Base32: 32 huruf
const SAH = /^[0-9A-HJKMNP-TV-Z]{8}$/;

// Kode baru, misalnya "7K2M-QF9D". randomInt = acak kriptografis yang merata (bukan Math.random).
export function buatKodeKlaim(): string {
  const huruf = Array.from({ length: 8 }, () => HURUF[randomInt(HURUF.length)]).join("");
  return `${huruf.slice(0, 4)}-${huruf.slice(4)}`;
}

// Rapikan kode yang diketik manusia: huruf kecil boleh, tanda - dan spasi diabaikan, O dibaca 0, I dan L dibaca 1
// (aturan Crockford). Hasilnya 8 huruf besar, atau null kalau tetap tidak sah (U, huruf lain, panjang salah).
export function rapikanKodeKlaim(kode: string): string | null {
  const rapi = kode.toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  return SAH.test(rapi) ? rapi : null;
}

// Sidik jari kode untuk database: SHA-256 dari bentuk rapinya, jadi "7k2m qf9d" dan "7K2M-QF9D" adalah kode yang sama.
export function hashKodeKlaim(kodeRapi: string): string {
  return createHash("sha256").update(kodeRapi).digest("hex");
}
