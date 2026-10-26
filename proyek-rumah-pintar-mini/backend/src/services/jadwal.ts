// jadwal.ts - aturan jadwal (Modul 19): perintah yang dijalankan pada jam tertentu, misalnya "siram 10 detik setiap
// 06.00 WIB", dengan node-cron 4.6.0. Zona waktunya SELALU Asia/Jakarta (WIB), apa pun zona waktu laptopnya.
import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import type { AturanTersimpan } from "../schemas/aturan.ts";
import { perintahkan } from "./perintah.ts";
import type { HasilPerintah } from "./perintah.ts";
import { catatKejadian } from "./kejadian.ts";
import { kabari } from "./telegram.ts";
import { log } from "./log.ts";

export const ZONA = "Asia/Jakarta";
const tugas = new Map<number, ScheduledTask>(); // nomor aturan -> tugas node-cron

// jam WIB untuk manusia, misalnya "22 Okt 2026, 06.00 WIB"
const formatWib = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, dateStyle: "medium", timeStyle: "short" });
export const jamWib = (waktu: Date) => `${formatWib.format(waktu)} WIB`;

// Bongkar semua tugas lama, lalu pasang lagi dari daftar aturan. Dipanggil setiap kali aturan dimuat ulang.
export function pasangJadwal(daftar: AturanTersimpan[]): void {
  for (const t of tugas.values()) t.destroy();
  tugas.clear();
  for (const a of daftar) {
    if (!a.aktif || a.kondisi.jenis !== "jadwal") continue;
    const t = cron.schedule(a.kondisi.cron, () => jalankanJadwal(a), {
      name: `aturan-${a.id}`,
      timezone: ZONA, // tanpa ini, jadwal mengikuti zona laptop (laptop UTC+8 menyiram pukul 05.00 WIB)
      noOverlap: true, // kalau jadwal sebelumnya belum selesai, jangan jalankan dua kali bersamaan
      missedExecutionTolerance: 15 * 60_000, // terlambat sampai 15 menit (misalnya laptop baru bangun) tetap dijalankan
    });
    t.on("execution:missed", (konteks) => jadwalTerlewat(a, konteks.date));
    tugas.set(a.id, t);
    const berikutnya = t.getNextRun();
    log.info(`jadwal aturan ${a.id} (${a.nama}) dipasang: "${a.kondisi.cron}" ${ZONA}, `
      + `berikutnya ${berikutnya === null ? "-" : jamWib(berikutnya)}`);
  }
}

// untuk GET /rules: kapan jadwal aturan ini berjalan lagi (null kalau bukan aturan jadwal atau tidak aktif)
export function jadwalBerikutnya(id: number): Date | null {
  return tugas.get(id)?.getNextRun() ?? null;
}

// Jalankan aksi aturan jadwal sekarang: dipanggil node-cron pada jamnya, atau POST /rules/:id/jalankan untuk menguji.
export async function jalankanJadwal(a: AturanTersimpan): Promise<HasilPerintah> {
  if (a.aksi.jenis !== "perintah") throw new Error(`aturan ${a.id} bukan aturan jadwal`);
  const { device_id: deviceId, perintah } = a.aksi;
  log.info(`jadwal aturan ${a.id} (${a.nama}) berjalan: ${perintah.target} = ${perintah.nilai} ke ${deviceId}`);
  const hasil = await perintahkan(deviceId, perintah, "jadwal", a.id);
  let pesan: string;
  if (hasil.status === "dijawab" && hasil.ack.ok) {
    pesan = perintah.target === "pompa" ? `🚿 ${a.nama}: pompa menyala ${perintah.nilai} detik`
      : `⏰ ${a.nama}: ${perintah.target} = ${perintah.nilai}`;
  } else if (hasil.status === "dijawab") {
    pesan = `⚠️ ${a.nama}: perintah ${perintah.target} ditolak perangkat (${hasil.ack.pesan})`;
  } else if (hasil.status === "tanpa-ack") {
    pesan = `⚠️ ${a.nama}: ${deviceId} tidak menjawab perintah ${perintah.target}`;
  } else {
    pesan = `⚠️ ${a.nama}: perintah ${perintah.target} tidak dikirim (${hasil.pesan})`;
  }
  log.info(`jadwal aturan ${a.id}: ${pesan}`);
  // Modul 24: ok = perintahnya terlaksana (dijawab ok); dashboard memakainya untuk warna kabar
  catatKejadian({ device_id: deviceId, jenis: "jadwal", sumber: "jadwal", aturan_id: a.id, pesan,
    data: { perintah, hasil: hasil.status, ok: hasil.status === "dijawab" && hasil.ack.ok } });
  if (a.aksi.kabari) void kabari(pesan);
  return hasil;
}

// node-cron 4 TIDAK memutar ulang jadwal yang terlewat (misalnya laptop tidur pukul 06.00): kita hanya bisa mencatatnya.
function jadwalTerlewat(a: AturanTersimpan, waktu: Date): void {
  const pesan = `⏰ Jadwal ${a.nama} pada ${jamWib(waktu)} terlewat (laptop tidur atau backend sibuk?)`;
  log.warn(pesan);
  catatKejadian({ device_id: null, jenis: "jadwal", sumber: "jadwal", aturan_id: a.id, pesan, data: { terlewat: waktu, ok: false } });
  if (a.aksi.kabari) void kabari(pesan);
}

// berhenti dengan rapi: hentikan semua tugas, tunggu yang sedang berjalan (node-cron 4.6.0)
export async function hentikanJadwal(): Promise<void> {
  await cron.shutdown();
}
