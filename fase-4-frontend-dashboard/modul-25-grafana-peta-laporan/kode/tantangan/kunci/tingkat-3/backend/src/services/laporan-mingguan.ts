// laporan-mingguan.ts - Tantangan 3 Modul 25: laporan MINGGUAN CSV lewat Telegram, setiap Senin 07.00 WIB (bawaan
// LAPORAN_MINGGUAN_JADWAL). Isinya minggu lalu, Senin 00.00 sampai Senin 00.00 WIB (7 hari), dengan kueri, pembuat CSV,
// dan pengirim berkas yang SAMA dengan laporan harian (laporan.ts): yang baru hanya rentang, nama berkas, dan jadwalnya.
import cron from "node-cron";
import { ambilBarisLaporan, buatLaporanCsv } from "./laporan.ts";
import type { HasilLaporan, Rentang } from "./laporan.ts";
import { alasanTelegramMati, kabari, kirimBerkas } from "./telegram.ts";
import { log } from "./log.ts";

const ZONA = "Asia/Jakarta";
const HARI_MS = 24 * 60 * 60 * 1000;
const tanggalIso = new Intl.DateTimeFormat("sv-SE", { timeZone: ZONA, dateStyle: "short" }); // 2026-10-19
const tanggalManusia = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, dateStyle: "medium" }); // 19 Okt 2026
const jamManusia = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, hour: "2-digit", minute: "2-digit" }); // 07.00

// Minggu lalu menurut jam WIB. Hari dalam seminggu dihitung dari tanggal WIB (bukan jam laptop): 00.00 WIB hari ini digeser
// +7 jam lalu dibaca getUTCDay() = hari di WIB (0 = Minggu, 1 = Senin, ...). Fungsi murni, "sekarang" diberikan dari luar.
export function rentangMingguan(sekarang: Date): Rentang {
  const awalHariIni = new Date(`${tanggalIso.format(sekarang)}T00:00:00+07:00`);
  const hariKe = new Date(awalHariIni.getTime() + 7 * 60 * 60 * 1000).getUTCDay();
  const sejakSenin = (hariKe + 6) % 7; // Senin = 0, Selasa = 1, ..., Minggu = 6
  const awalMingguIni = new Date(awalHariIni.getTime() - sejakSenin * HARI_MS);
  const dari = new Date(awalMingguIni.getTime() - 7 * HARI_MS);
  return { dari, sampai: awalMingguIni, tanggal: tanggalIso.format(dari), hariIni: false };
}

// laporan-mingguan-2026-10-19.csv = minggu yang DIMULAI Senin 19 Okt
export function namaLaporanMingguan(r: Rentang): string {
  return `laporan-mingguan-${r.tanggal}.csv`;
}

export function keteranganMingguan(r: Rentang, jumlahPerangkat: number): string {
  const akhir = new Date(r.sampai.getTime() - 1); // Minggu terakhir yang ikut dihitung
  return `📊 Laporan mingguan Rumah Pintar Mini ${tanggalManusia.format(r.dari)} - ${tanggalManusia.format(akhir)}: `
    + `${jumlahPerangkat} perangkat`;
}

export async function kirimLaporanMingguan(sekarang = new Date()): Promise<HasilLaporan> {
  const mati = alasanTelegramMati();
  if (mati !== null) return { status: "dilewati", pesan: `Telegram mati (${mati})` };
  const rentang = rentangMingguan(sekarang);
  const baris = await ambilBarisLaporan(rentang.dari, rentang.sampai);
  const isi = buatLaporanCsv(baris);
  const berkas = namaLaporanMingguan(rentang);
  const keterangan = keteranganMingguan(rentang, baris.length);
  if (!(await kirimBerkas(berkas, isi, keterangan))) {
    return { status: "gagal", pesan: `Telegram tidak menerima ${berkas}; lihat log backend` };
  }
  return { status: "terkirim", berkas, rentang, perangkat: baris.length, ukuran_byte: Buffer.byteLength(isi, "utf8"), keterangan };
}

// Pasang jadwal (dipanggil server.ts sekali). Berhenti bersama tugas node-cron lain lewat hentikanJadwal() (cron.shutdown()).
export function mulaiLaporanMingguan(jadwal: string): void {
  // konteks.date = jam jadwal (Senin 07.00 WIB), bukan jam saat berjalan: seperti laporan harian
  const tugas = cron.schedule(jadwal, async (konteks) => {
    log.info("laporan mingguan berjalan sesuai jadwal");
    try {
      const hasil = await kirimLaporanMingguan(konteks.date);
      if (hasil.status === "dilewati") log.warn(`laporan mingguan dilewati: ${hasil.pesan}`);
      else if (hasil.status === "gagal") log.error(`laporan mingguan gagal: ${hasil.pesan}`);
    } catch (galat) {
      log.error(`laporan mingguan gagal: database tidak bisa dibaca (${(galat as Error).message})`);
    }
  }, { name: "laporan-mingguan", timezone: ZONA, noOverlap: true, missedExecutionTolerance: 15 * 60_000 });
  // seperti laporan harian: jadwal yang terlewat (laptop tidur) tidak dikirim belakangan, hanya dikabarkan
  tugas.on("execution:missed", () => {
    const pesan = "⏰ Laporan mingguan terlewat (laptop tidur atau backend sibuk?). Jadwal berikutnya minggu depan.";
    log.warn(pesan);
    void kabari(pesan);
  });
  const berikutnya = tugas.getNextRun();
  const kapan = berikutnya === null ? "-" : `${tanggalManusia.format(berikutnya)}, ${jamManusia.format(berikutnya)} WIB`;
  log.info(`laporan mingguan dijadwalkan: "${jadwal}" ${ZONA}, berikutnya ${kapan}`);
}
