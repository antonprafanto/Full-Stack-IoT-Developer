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
