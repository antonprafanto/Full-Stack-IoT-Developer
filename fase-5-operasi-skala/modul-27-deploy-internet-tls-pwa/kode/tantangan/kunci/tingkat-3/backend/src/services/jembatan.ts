// jembatan.ts - Tantangan 3 Modul 27: kabar jembatan gerbang rumah (Pi) dari broker pusat.
// Jembatan dengan "notifications true" menulis 1 (tersambung) di topik $SYS/broker/connection/<nama>/state di broker pusat,
// dan menitipkan wasiat 0 (putus): saat internet rumah putus, broker pusat sendiri yang menerbitkan 0 begitu sadar
// jembatannya diam (±1,5 menit; keepalive jembatan 60 detik). Keduanya pesan retained, jadi backend yang baru menyala
// langsung tahu keadaan terakhirnya. Backend meneruskannya ke dashboard sebagai acara Socket.IO "jembatan".
import type { FastifyBaseLogger } from "fastify";
import { siarkanJembatan } from "./realtime.ts";

export interface KeadaanJembatan {
  tersambung: boolean;
  // kapan backend MENDENGAR perubahannya (ISO, UTC); null = pesan retained lama, waktu sebenarnya tidak diketahui
  sejak: string | null;
}

const daftar = new Map<string, KeadaanJembatan>(); // nama jembatan (remote_clientid, mis. jembatan-pi) -> keadaan

export function semuaJembatan(): [string, KeadaanJembatan][] {
  return [...daftar];
}

// topik = $SYS/broker/connection/<nama>/state, teks = "1" atau "0"
export function terimaKabarJembatan(topik: string, teks: string, retained: boolean, log: FastifyBaseLogger): void {
  const bagian = topik.split("/");
  if (bagian.length !== 5 || (teks !== "0" && teks !== "1")) return; // bukan kabar jembatan yang kita kenal
  const nama = bagian[3];
  const tersambung = teks === "1";
  if (daftar.get(nama)?.tersambung === tersambung) return; // tidak berubah
  const keadaan: KeadaanJembatan = { tersambung, sejak: retained ? null : new Date().toISOString() };
  daftar.set(nama, keadaan);
  if (tersambung) log.info(`jembatan ${nama} tersambung`);
  else log.warn(`jembatan ${nama} TERPUTUS: data dari rumah tertahan di gerbang sampai tersambung lagi`);
  siarkanJembatan(nama, keadaan);
}
