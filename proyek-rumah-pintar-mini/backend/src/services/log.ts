// log.ts - satu "buku log" untuk layanan yang tidak memegang app Fastify (perintah, aturan, jadwal, Telegram).
// server.ts mengisinya dengan app.log sekali, sesaat setelah server dibuat (Modul 19).
import type { FastifyBaseLogger } from "fastify";

let pencatat: FastifyBaseLogger | undefined;

export function pakaiLog(logServer: FastifyBaseLogger): void {
  pencatat = logServer;
}

export const log = {
  info: (pesan: string) => pencatat?.info(pesan),
  warn: (pesan: string) => pencatat?.warn(pesan),
  error: (pesan: string) => pencatat?.error(pesan),
};

// Modul 26: apakah satu permintaan HTTP perlu ditulis ke log (dipakai hook onResponse di server.ts)? Healthcheck Docker
// mengetuk HEAD /health setiap 15 detik; tanpa saringan ini, log berisi ribuan baris yang sama setiap hari dan baris
// penting tenggelam. Hanya ketukan /health yang BERHASIL (GET atau HEAD, kode di bawah 400) yang tidak dicatat: /health
// yang gagal dan semua alamat lain tetap dicatat seperti biasa.
export function perluDicatat(metode: string, alamat: string, kode: number): boolean {
  const jalur = alamat.split("?")[0]; // tanpa ?… di belakangnya
  const ketukanKesehatan = (metode === "GET" || metode === "HEAD") && jalur === "/health";
  return !(ketukanKesehatan && kode < 400);
}
