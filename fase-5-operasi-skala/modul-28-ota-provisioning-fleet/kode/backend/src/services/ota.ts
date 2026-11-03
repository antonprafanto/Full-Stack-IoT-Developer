// ota.ts - pembaruan firmware lewat udara (OTA) dari sisi server (Modul 28).
// Alurnya (kontrak 1.6): admin menekan Perbarui -> mintaUpdate() memeriksa syarat -> cmd "update" (QoS 1, TIDAK retained)
// -> ack ok:true dalam 5 detik = perangkat MENERIMA perintahnya (belum selesai!) -> perangkat menerbitkan status
// offline-mode, memutus MQTT dengan rapi, mengunduh berkasnya lewat rute berkunci /fw (status "mengunduh"), memeriksanya,
// lalu menyala ulang -> firmware baru sah bila dalam 60 detik tersambung ke broker dan terbit; kalau tidak, perangkat
// kembali sendiri ke versi lama (rollback) -> hasilnya dilaporkan di vitals.ota -> catatVitalsPembaruan() menutup barisnya.
// Tanpa kabar selama OTA_BATAS_MENIT -> kedaluwarsa (pengawas di bawah).
// Server yang MEMUTUSKAN dan mengirim perintah; perangkat tidak pernah memeriksa sendiri "adakah versi baru" setiap jam.
import { env } from "../config/env.ts";
import { ambilRilis, calonPembaruan, calonSatu, catatFwDb, catatResetReasonDb, kedaluwarsakanPembaruan,
  laporHasilPembaruan, mulaiPembaruan, pembaruanDikenal, ringkasanCanary, simpulkanPembaruan, tandaiMengunduh,
  ubahStatusPembaruan } from "../db/armada.ts";
import type { BarisPembaruan, BarisRilis, CalonPembaruan } from "../db/armada.ts";
import type { Vitals } from "../schemas/kontrak.ts";
import { cariPerangkat, tungguAck } from "./gudang.ts";
import { brokerTersambung, buatIdPerintah, kirimUpdate } from "./mqtt.ts";
import { catatKejadian } from "./kejadian.ts";
import { siarkanOta } from "./realtime.ts";
import { bandingkanVersi } from "./versi.ts";
import { log } from "./log.ts";

const BATAS_ACK_MS = 5000; // setiap cmd dijawab ack dalam 5 detik (kontrak aturan 4)
export const FOLDER: Record<string, string> = { node1: "node-1" }; // jenis di database -> folder dan jalur URL (Lampiran A)

// Hasil satu perintah update. "diterima" = ack ok:true; "tanpa-ack" = terkirim tetapi tidak dijawab 5 detik (hasilnya
// bisa tetap datang lewat vitals, atau kedaluwarsa); "ditolak" = ack ok:false; "tidak-dikirim" = syarat tidak terpenuhi.
export type HasilUpdate =
  | { status: "diterima" | "tanpa-ack"; id: string; device_id: string; dari: string | null; ke: string; lama_ms: number }
  | { status: "ditolak"; id: string; device_id: string; pesan: string }
  | { status: "tidak-dikirim"; device_id: string; kode: 404 | 409 | 503; pesan: string };

// Keadaan perangkat yang menentukan boleh tidaknya dikirimi pembaruan (dari database + status terbaru di memori).
export interface KeadaanCalon {
  jenis: string;
  terdaftar: boolean;
  dicabut: boolean;
  status: string;
  fw: string | null;
  berjalan: boolean;
}

// Aturan Modul 28 (D14), fungsi murni yang diuji Vitest. null = boleh dikirim; selain itu kode HTTP dan alasannya.
//   banyak = perintah untuk banyak perangkat sekaligus ("perbarui canary" / "perbarui semua"): rilis UJI ditolak
//   paksa  = admin sengaja memasang versi yang LEBIH LAMA dari versi sekarang
export function alasanTidakBisa(p: KeadaanCalon, rilis: Pick<BarisRilis, "versi" | "uji" | "ditarik"> | undefined,
  opsi: { banyak?: boolean; paksa?: boolean } = {}): { kode: 404 | 409; pesan: string } | null {
  if (!p.terdaftar) return { kode: 404, pesan: "perangkat belum terdaftar" };
  if (p.dicabut) return { kode: 409, pesan: "perangkat sudah dinonaktifkan (kuncinya dicabut)" };
  if (p.jenis === "node2") return { kode: 409, pesan: "Node 2 (ESP-NOW) tidak bisa diperbarui lewat udara: perbarui lewat kabel" };
  if (p.jenis !== "node1") return { kode: 409, pesan: "jenis perangkat belum diketahui: tunggu telemetry pertamanya" };
  if (rilis === undefined) return { kode: 404, pesan: "firmware versi itu belum diunggah" };
  if (rilis.ditarik !== null) return { kode: 409, pesan: `firmware ${rilis.versi} sudah ditarik` };
  if (rilis.uji && opsi.banyak) {
    return { kode: 409, pesan: `${rilis.versi} rilis UJI: hanya untuk satu perangkat (Perbarui per perangkat), tidak pernah untuk semua` };
  }
  if (p.status !== "online") {
    return { kode: 409, pesan: `perangkat sedang ${p.status}: perintah update hanya dikirim ke perangkat online (tidak diantre)` };
  }
  if (p.berjalan) return { kode: 409, pesan: "perangkat masih menjalankan pembaruan lain" };
  if (p.fw === rilis.versi) return { kode: 409, pesan: `perangkat sudah memakai ${rilis.versi}` };
  if (p.fw !== null && bandingkanVersi(rilis.versi, p.fw) < 0 && !opsi.paksa) {
    return { kode: 409, pesan: `turun versi (${p.fw} ke ${rilis.versi}): kirim dengan paksa bila memang sengaja` };
  }
  return null;
}

// database + memori: status di gudang (dari pesan status terbaru) lebih segar daripada kolom devices.status
function keadaanCalon(c: CalonPembaruan): KeadaanCalon {
  const m = cariPerangkat(c.device_id);
  return { jenis: m?.jenis !== undefined && m.jenis !== "belum-diketahui" ? m.jenis : c.jenis, terdaftar: c.terdaftar !== null,
    dicabut: c.dicabut !== null, status: m?.status ?? c.status, fw: fwTerakhir.get(c.device_id) ?? c.fw, berjalan: c.berjalan };
}

// Syarat yang sama untuk semua perangkat: backend tersambung ke broker dan tahu alamat unduhnya.
function alasanServer(): string | null {
  if (env.ALAMAT_SERVER === "") return "ALAMAT_SERVER belum diisi di .env: perangkat tidak tahu dari mana mengunduh firmware";
  if (!brokerTersambung()) return "backend sedang tidak tersambung ke broker";
  return null;
}

// Kirim satu perintah update ke satu perangkat yang SUDAH lolos alasanTidakBisa(), lalu tunggu ack-nya.
async function kirimSatu(deviceId: string, dari: string | null, rilis: BarisRilis, canary: boolean, oleh: string):
  Promise<HasilUpdate> {
  const id = buatIdPerintah();
  if (!(await mulaiPembaruan({ id, deviceId, dari, ke: rilis.versi, canary, oleh }))) {
    return { status: "tidak-dikirim", device_id: deviceId, kode: 409, pesan: "perangkat masih menjalankan pembaruan lain" };
  }
  const url = `${env.ALAMAT_SERVER}/fw/${FOLDER[rilis.jenis]}/${rilis.versi}.bin`;
  const mulai = Date.now();
  const menunggu = tungguAck(id, BATAS_ACK_MS); // mulai menunggu SEBELUM mengirim, seperti perintah set
  kirimUpdate(deviceId, id, { versi: rilis.versi, url, sha256: rilis.sha256, ukuran: rilis.ukuran });
  log.info(`update ${id} ke ${deviceId}: ${dari ?? "?"} → ${rilis.versi} (${rilis.ukuran} byte)${canary ? ", canary" : ""}`);
  const ack = await menunggu;
  const lama = Date.now() - mulai;
  if (ack === null) {
    log.warn(`update ${id} ke ${deviceId}: tidak ada ack dalam 5 detik; hasilnya menunggu vitals perangkat atau kedaluwarsa`);
    return { status: "tanpa-ack", id, device_id: deviceId, dari, ke: rilis.versi, lama_ms: lama };
  }
  if (!ack.ok) {
    const baris = await ubahStatusPembaruan(id, deviceId, "ditolak", ack.pesan ?? null, ["dikirim"]);
    if (baris !== undefined) kabarkan(baris, "perangkat");
    return { status: "ditolak", id, device_id: deviceId, pesan: ack.pesan ?? "" };
  }
  // ack ok:true = DITERIMA, bukan selesai. Kalau perangkat sudah sempat mulai mengunduh, status "mengunduh" tetap.
  const baris = await ubahStatusPembaruan(id, deviceId, "diterima", null, ["dikirim"]);
  if (baris !== undefined) kabarkan(baris, "perangkat");
  return { status: "diterima", id, device_id: deviceId, dari, ke: rilis.versi, lama_ms: lama };
}

// POST /devices/:id/update: satu perangkat, satu versi. Rilis uji boleh (satu perangkat).
export async function mintaUpdate(deviceId: string, versi: string, oleh: string, paksa = false): Promise<HasilUpdate> {
  const server = alasanServer();
  if (server !== null) return { status: "tidak-dikirim", device_id: deviceId, kode: 503, pesan: server };
  const calon = await calonSatu(deviceId);
  if (calon === undefined) return { status: "tidak-dikirim", device_id: deviceId, kode: 404, pesan: "perangkat belum terdaftar" };
  const rilis = await ambilRilis("node1", versi);
  const keadaan = keadaanCalon(calon);
  const alasan = alasanTidakBisa(keadaan, rilis, { paksa });
  if (alasan !== null || rilis === undefined) {
    return { status: "tidak-dikirim", device_id: deviceId, kode: alasan?.kode ?? 404, pesan: alasan?.pesan ?? "" };
  }
  return kirimSatu(deviceId, keadaan.fw, rilis, calon.canary, oleh);
}

// Hasil POST /armada/update
export interface HasilArmada {
  versi: string;
  sasaran: "canary" | "semua";
  dikirim: HasilUpdate[];
  dilewati: { device_id: string; alasan: string }[];
}

// POST /armada/update: canary dulu, baru semua (D14). "semua" baru boleh sesudah minimal satu canary BERHASIL memakai versi
// ini dan tidak ada canary yang rollback/gagal memakainya. Node 1 yang tidak memenuhi syarat (offline, dinonaktifkan, sudah
// memakai versi itu, ...) dilewati beserta alasannya, tanpa antre. Node 2 tidak pernah jadi calon (calonPembaruan()).
export async function perbaruiArmada(versi: string, sasaran: "canary" | "semua", oleh: string, paksa = false):
  Promise<HasilArmada | { kode: 404 | 409 | 503; pesan: string }> {
  const server = alasanServer();
  if (server !== null) return { kode: 503, pesan: server };
  const rilis = await ambilRilis("node1", versi);
  if (rilis === undefined) return { kode: 404, pesan: `firmware node1 ${versi} belum diunggah` };
  if (rilis.ditarik !== null) return { kode: 409, pesan: `firmware ${versi} sudah ditarik` };
  if (rilis.uji) return { kode: 409, pesan: `${versi} rilis UJI: hanya lewat Perbarui per perangkat, tidak pernah untuk banyak perangkat` };
  if (sasaran === "semua") {
    const canary = await ringkasanCanary("node1", versi);
    if (canary.gagal > 0) {
      return { kode: 409, pesan: `${canary.gagal} perangkat canary gagal atau rollback memakai ${versi}: periksa dulu, jangan disebarkan` };
    }
    if (canary.berhasil === 0) {
      return { kode: 409, pesan: `belum ada perangkat canary yang berhasil memakai ${versi}: perbarui canary dulu` };
    }
  }
  const semuaCalon = (await calonPembaruan()).filter((c) => sasaran === "semua" || c.canary);
  if (semuaCalon.length === 0) {
    return { kode: 409, pesan: sasaran === "canary" ? "belum ada perangkat canary: centang Canary di kartu perangkat di layar Armada dulu"
      : "belum ada Node 1 terdaftar" };
  }
  const dilewati: HasilArmada["dilewati"] = [];
  const dikirim: Promise<HasilUpdate>[] = [];
  for (const c of semuaCalon) {
    const keadaan = keadaanCalon(c);
    const alasan = alasanTidakBisa(keadaan, rilis, { banyak: true, paksa });
    if (alasan !== null) dilewati.push({ device_id: c.device_id, alasan: alasan.pesan });
    else dikirim.push(kirimSatu(c.device_id, keadaan.fw, rilis, c.canary, oleh)); // sekaligus, tidak satu per satu
  }
  return { versi, sasaran, dikirim: await Promise.all(dikirim), dilewati };
}

// Kabar satu perubahan status pembaruan: log, buku kejadian (jenis ota, Socket.IO "kejadian"), dan acara Socket.IO "ota"
// untuk halaman /armada.
function kabarkan(b: BarisPembaruan, sumber: "api" | "perangkat"): void {
  const dari = b.dari_versi ?? "?";
  const kalimat: Record<string, string> = {
    diterima: `${b.device_id} menerima perintah pembaruan ${dari} → ${b.ke_versi}`,
    mengunduh: `${b.device_id} mengunduh firmware ${b.ke_versi}`,
    ditolak: `${b.device_id} menolak pembaruan ${b.ke_versi}: ${b.pesan ?? "tanpa alasan"}`,
    berhasil: `${b.device_id} berhasil diperbarui ${dari} → ${b.ke_versi}`,
    rollback: `${b.device_id} GAGAL memakai ${b.ke_versi} dan kembali sendiri ke ${dari} (rollback)`,
    gagal: `${b.device_id} gagal memasang ${b.ke_versi}, tetap memakai ${dari}: ${b.pesan ?? "tanpa alasan"}`,
    kedaluwarsa: `pembaruan ${b.device_id} ke ${b.ke_versi} kedaluwarsa: tanpa kabar ${env.OTA_BATAS_MENIT} menit`,
  };
  const pesan = (kalimat[b.status] ?? `${b.device_id} pembaruan ${b.ke_versi}: ${b.status}`)
    + (b.pesan?.startsWith("disimpulkan server") ? " (disimpulkan server, laporan perangkat tidak sampai)" : "");
  if (b.status === "berhasil" || b.status === "diterima" || b.status === "mengunduh") log.info(pesan);
  else log.warn(pesan);
  if (b.status !== "mengunduh") { // "mengunduh" cukup di Socket.IO: buku kejadian tidak perlu satu baris per tahap kecil
    catatKejadian({ device_id: b.device_id, jenis: "ota", sumber, aturan_id: null, pesan,
      data: { id: b.id, status: b.status, dari: b.dari_versi, ke: b.ke_versi, pesan: b.pesan } });
  }
  siarkanOta({ device_id: b.device_id, id: b.id, status: b.status, dari: b.dari_versi, ke: b.ke_versi, pesan: b.pesan,
    waktu: b.diperbarui.toISOString().slice(0, 19) + "Z" });
}

function gagalDb(apa: string) {
  return (galat: Error) => log.error(`gagal ${apa} di database: ${galat.message}`);
}

// ---------- dari pesan perangkat ----------

// Versi terakhir per perangkat (telemetry setiap 10 detik): database hanya ditulis kalau versinya berubah, atau paling
// sering sekali setiap 10 menit (supaya fw_dilihat tetap segar).
const fwTerakhir = new Map<string, string>();
const fwDitulis = new Map<string, number>();
const SEGARKAN_FW_MS = 10 * 60_000;

export function catatFw(deviceId: string, fw: string): void {
  const sekarang = Date.now();
  if (fwTerakhir.get(deviceId) === fw && sekarang - (fwDitulis.get(deviceId) ?? 0) < SEGARKAN_FW_MS) return;
  fwTerakhir.set(deviceId, fw);
  fwDitulis.set(deviceId, sekarang);
  catatFwDb(deviceId, fw).catch(gagalDb(`mencatat fw ${deviceId}`));
}

// Dipanggil mqtt.ts untuk setiap vitals yang lolos kontrak: fw, reset_reason, dan laporan pembaruan (kontrak 1.6).
export function catatVitalsPembaruan(deviceId: string, v: Vitals): void {
  if (v.fw !== undefined) catatFw(deviceId, v.fw);
  if (v.reset_reason !== undefined) catatResetReasonDb(deviceId, v.reset_reason).catch(gagalDb(`mencatat reset_reason ${deviceId}`));
  if (v.ota !== undefined) {
    const { id, hasil, versi, pesan } = v.ota;
    laporHasilPembaruan(id, deviceId, hasil, pesan ?? null)
      .then(async (baris) => {
        // laporan yang sama diulang di beberapa vitals (kontrak 1.6): yang kedua dan ketiga tidak mengubah apa pun. Laporan
        // yang id-nya TIDAK pernah dikirim server ini dicatat sebagai peringatan (perintah update dari akun lain?).
        if (baris === undefined) {
          if (!(await pembaruanDikenal(id, deviceId))) kabarkanLaporanAsing(deviceId, id, hasil, versi);
          return;
        }
        if (baris.ke_versi !== versi) log.warn(`laporan ota ${id} dari ${deviceId} menyebut ${versi}, padahal perintahnya ${baris.ke_versi}`);
        kabarkan(baris, "perangkat");
      })
      .catch(gagalDb(`mencatat hasil pembaruan ${id}`));
  } else if (v.fw !== undefined) { // laporan bisa hilang (vitals QoS 0): server menyimpulkan dari versi dan uptime
    simpulkanPembaruan(deviceId, v.fw, v.uptime_s)
      .then((baris) => { for (const b of baris) kabarkan(b, "perangkat"); })
      .catch(gagalDb(`menyimpulkan pembaruan ${deviceId}`));
  }
}

// Laporan pembaruan yang id-nya tidak dikenal = pembaruan yang TIDAK diperintahkan dashboard ini, misalnya update dari
// akun lain yang boleh menulis rpm/+/cmd (nodered, Modul 13). Sebelumnya laporan seperti ini dibuang diam-diam (temuan
// verifikasi M28). Sekali per laporan: perangkat mengulangnya sampai 3 vitals.
const laporanAsing = new Set<string>();
function kabarkanLaporanAsing(deviceId: string, id: string, hasil: string, versi: string): void {
  const kunci = `${deviceId} ${id}`;
  if (laporanAsing.has(kunci)) return;
  if (laporanAsing.size >= 200) laporanAsing.clear(); // ingatan kecil saja
  laporanAsing.add(kunci);
  const pesan = `${deviceId} melaporkan pembaruan ${id} (${hasil} ${versi}) yang tidak dikirim server ini: perintah update `
    + "dari akun lain yang boleh menulis rpm/+/cmd? Periksa siapa yang memegang sandinya";
  log.warn(pesan);
  catatKejadian({ device_id: deviceId, jenis: "ota", sumber: "perangkat", aturan_id: null, pesan,
    data: { id, hasil, versi, dikenal: false } });
}

// Dipanggil rute /fw saat perangkat yang sah mulai mengunduh berkas versi itu.
export function catatMulaiUnduh(deviceId: string, versi: string): void {
  tandaiMengunduh(deviceId, versi)
    .then((baris) => { if (baris !== undefined) kabarkan(baris, "perangkat"); })
    .catch(gagalDb(`menandai unduhan ${deviceId}`));
}

// ---------- pengawas kedaluwarsa ----------

let pengawas: ReturnType<typeof setInterval> | undefined;

export function mulaiPengawasPembaruan(): void {
  pengawas = setInterval(() => {
    kedaluwarsakanPembaruan(env.OTA_BATAS_MENIT)
      .then((baris) => { for (const b of baris) kabarkan(b, "api"); })
      .catch(() => {}); // database putus: dicoba lagi 30 detik kemudian
  }, 30_000);
}

export function hentikanPengawasPembaruan(): void {
  clearInterval(pengawas);
}
