// perintah.ts - satu pintu untuk SEMUA perintah ke perangkat (Modul 19): API, aturan otomatis, jadwal, dan Telegram
// memakai fungsi yang sama, perintahkan(). Di sini juga dicatat keadaan yang DIINGINKAN server (desired) untuk aktuator
// yang keadaannya bertahan (kipas, lampu, tirai), lalu dicocokkan dengan keadaan yang DILAPORKAN perangkat (reported).
import type { Ack, Keadaan, PerintahSet } from "../schemas/kontrak.ts";
import { cariPerangkat, simpanLaporan, tungguAck } from "./gudang.ts";
import { brokerTersambung, buatIdPerintah, kirimPerintah } from "./mqtt.ts";
import { arsipkanPerintah } from "../db/arsip.ts";
import { catatKejadian } from "./kejadian.ts";
import { log } from "./log.ts";
import { izinPerangkat } from "./daftar.ts";

export type Sumber = "api" | "aturan" | "jadwal" | "telegram"; // siapa yang menyuruh

// Hasil satu perintah. "dijawab" = ada ack (ok true atau false), "tanpa-ack" = tidak dijawab dalam 5 detik,
// "tidak-dikirim" = perintah tidak diterbitkan sama sekali (kodenya dipakai API sebagai kode HTTP).
export type HasilPerintah =
  | { status: "dijawab"; id: string; lama_ms: number; ack: Ack }
  | { status: "tanpa-ack"; id: string; lama_ms: number }
  | { status: "tidak-dikirim"; kode: 404 | 409 | 503; pesan: string };

const BATAS_ACK_MS = 5000; // setiap cmd dijawab ack dalam 5 detik (kontrak aturan 4)
const JEDA_COBA_LAGI_MS = 30_000; // rekonsiliasi: paling sering sekali setiap 30 detik per aktuator

// pompa tidak punya keadaan yang bertahan: perintahnya denyut 1-10 detik yang padam sendiri
type PerintahTetap = Extract<PerintahSet, { target: "kipas" | "lampu" | "tirai" }>;

// Satu keinginan server untuk satu aktuator.
interface Keinginan {
  perintah: PerintahTetap;
  sumber: Sumber;
  aturanId: number | null;
  dicoba: number; // kapan perintahnya terakhir dikirim (milidetik, seperti Date.now())
  terpenuhi: boolean; // sudah pernah dilaporkan perangkat sesuai keinginan?
}

const keinginan = new Map<string, Map<string, Keinginan>>(); // device_id -> (target -> keinginan)
const menungguAck = new Set<string>(); // "<device_id>/<target>" yang perintahnya sedang menunggu ack

export async function perintahkan(deviceId: string, perintah: PerintahSet, sumber: Sumber,
  aturanId: number | null = null): Promise<HasilPerintah> {
  const izin = izinPerangkat(deviceId); // Modul 21: perangkat yang belum terdaftar atau dicabut tidak menerima perintah
  if (izin === "dicabut") return { status: "tidak-dikirim", kode: 409, pesan: `kunci perangkat ${deviceId} sudah dicabut` };
  if (izin !== "terdaftar") return { status: "tidak-dikirim", kode: 404, pesan: `perangkat ${deviceId} belum terdaftar` };
  const p = cariPerangkat(deviceId);
  if (p === undefined) return { status: "tidak-dikirim", kode: 404, pesan: `perangkat ${deviceId} belum pernah terdengar` };
  if (p.jenis === "node2") return { status: "tidak-dikirim", kode: 409, pesan: "Node 2 tidak menerima perintah (kontrak bagian 2)" };
  if (p.jenis !== "node1") {
    return { status: "tidak-dikirim", kode: 409, pesan: "jenis perangkat belum diketahui: tunggu telemetry pertamanya" };
  }
  if (p.status !== "online") return { status: "tidak-dikirim", kode: 409, pesan: `perangkat sedang ${p.status}, perintah tidak dikirim` };
  if (!brokerTersambung()) return { status: "tidak-dikirim", kode: 503, pesan: "backend sedang tidak tersambung ke broker" };
  const kunci = `${deviceId}/${perintah.target}`;
  if (menungguAck.has(kunci)) { // satu aktuator, satu perintah yang sedang ditunggu
    return { status: "tidak-dikirim", kode: 409, pesan: `perintah ${perintah.target} sebelumnya masih menunggu ack` };
  }

  if (perintah.target !== "pompa") catatKeinginan(deviceId, perintah, sumber, aturanId);
  const id = buatIdPerintah();
  const mulai = Date.now();
  menungguAck.add(kunci);
  const menunggu = tungguAck(id, BATAS_ACK_MS); // mulai menunggu SEBELUM mengirim
  kirimPerintah(deviceId, id, perintah);
  const ack = await menunggu;
  menungguAck.delete(kunci);
  const lama = Date.now() - mulai;
  arsipkanPerintah(id, deviceId, perintah, new Date(mulai), ack, lama, sumber, aturanId)
    .catch((galat) => log.error(`gagal mencatat perintah ${id} ke database: ${galat.message}`));
  if (ack === null) {
    log.warn(`perintah ${id} (${sumber}) ke ${deviceId}: tidak ada ack dalam 5 detik`);
    return { status: "tanpa-ack", id, lama_ms: lama };
  }
  if (!ack.ok) keinginan.get(deviceId)?.delete(perintah.target); // ditolak perangkat: jangan dicoba lagi
  log.info(`perintah ${id} (${sumber}) ke ${deviceId}: ${perintah.target} = ${perintah.nilai}, ack ok=${ack.ok} dalam ${lama} ms`);
  return { status: "dijawab", id, lama_ms: lama, ack };
}

function catatKeinginan(deviceId: string, perintah: PerintahTetap, sumber: Sumber, aturanId: number | null): void {
  let milikPerangkat = keinginan.get(deviceId);
  if (milikPerangkat === undefined) {
    milikPerangkat = new Map();
    keinginan.set(deviceId, milikPerangkat);
  }
  milikPerangkat.set(perintah.target, { perintah, sumber, aturanId, dicoba: Date.now(), terpenuhi: false });
}

// Dipanggil mqtt.ts setiap kali telemetry atau ack perangkat tiba. keadaan = state di pesan itu (null kalau telemetry
// firmware lama yang belum membawa state).
export function catatLaporan(deviceId: string, keadaan: Keadaan | null, ts: string | null): void {
  if (keadaan !== null && simpanLaporan(deviceId, keadaan, ts)) {
    for (const k of keinginan.get(deviceId)?.values() ?? []) {
      if (keadaan[k.perintah.target] === k.perintah.nilai) k.terpenuhi = true;
    }
  }
  cocokkan(deviceId);
}

// Rekonsiliasi: kirim lagi keinginan yang BELUM terbukti dikerjakan perangkat. Keinginan yang sudah pernah terpenuhi
// tidak dipaksakan lagi: kalau sesudah itu aktuatornya diubah aturan lokal perangkat atau MQTTX, server tidak melawan.
function cocokkan(deviceId: string): void {
  const p = cariPerangkat(deviceId);
  if (p === undefined || p.reported === null || p.status !== "online") return;
  for (const k of keinginan.get(deviceId)?.values() ?? []) {
    const { target, nilai } = k.perintah;
    if (k.terpenuhi || p.reported[target] === nilai) continue; // sudah sesuai
    if (menungguAck.has(`${deviceId}/${target}`)) continue; // perintah sebelumnya masih ditunggu
    if (Date.now() - k.dicoba < JEDA_COBA_LAGI_MS) continue; // terlalu cepat: tunggu dulu
    const pesan = `${target} ${deviceId} dilaporkan ${p.reported[target]}, padahal diinginkan ${nilai} (${k.sumber}); `
      + "perintah dikirim lagi";
    log.warn(`cocokkan ${pesan}`);
    catatKejadian({ device_id: deviceId, jenis: "perintah", sumber: k.sumber, aturan_id: k.aturanId, pesan, data: k.perintah });
    void perintahkan(deviceId, k.perintah, k.sumber, k.aturanId);
  }
}

// Modul 24: dipanggil otomasi.ts saat aturan dihapus atau dinonaktifkan. Keinginan yang tercatat atas nama aturan itu
// dilupakan, supaya rekonsiliasi (juga sesudah perangkat menyala ulang) tidak menjalankan lagi perintah aturan yang sudah
// tidak berlaku. Keadaan aktuatornya dibiarkan apa adanya: lampu yang sedang menyala tetap menyala sampai dimatikan.
export function lupakanKeinginanAturan(aturanId: number): void {
  for (const milikPerangkat of keinginan.values()) {
    for (const [target, k] of milikPerangkat) {
      if (k.aturanId === aturanId) milikPerangkat.delete(target);
    }
  }
}

// Dipanggil mqtt.ts kalau vitals membawa uptime_s kecil: perangkat baru menyala (lagi), dan semua relay-nya padam saat
// menyala. Keinginan yang sudah terpenuhi pun dicocokkan lagi.
export function perangkatMenyalaUlang(deviceId: string, uptime: number): void {
  const daftar = keinginan.get(deviceId);
  if (daftar === undefined || daftar.size === 0) return;
  log.warn(`${deviceId} baru menyala ulang (uptime ${uptime} detik): keinginan server dicocokkan lagi`);
  for (const k of daftar.values()) k.terpenuhi = false;
}

// Untuk GET /devices/:id/state: desired, reported, kapan reported tiba, dan aktuator yang belum cocok.
export function keadaanPerangkat(deviceId: string) {
  const p = cariPerangkat(deviceId);
  if (p === undefined) return undefined;
  const desired: { kipas?: boolean; lampu?: boolean; tirai?: number } = {};
  const selisih: string[] = [];
  for (const { perintah } of keinginan.get(deviceId)?.values() ?? []) {
    if (perintah.target === "tirai") desired.tirai = perintah.nilai;
    else desired[perintah.target] = perintah.nilai;
    if (p.reported === null || p.reported[perintah.target] !== perintah.nilai) selisih.push(perintah.target);
  }
  return { device_id: deviceId, desired, reported: p.reported, reported_pada: p.reported_pada, selisih };
}
