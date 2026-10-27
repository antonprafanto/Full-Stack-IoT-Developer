// laporan.ts - laporan harian CSV lewat Telegram (Modul 25). Setiap pagi (bawaan 07.00 WIB, setelan LAPORAN_JADWAL di .env)
// backend meringkas data KEMARIN, 00.00-24.00 WIB, per perangkat dengan satu kueri SQL, menyusunnya menjadi CSV resep
// Modul 23 (csv.ts), lalu mengirimnya sebagai berkas lewat bot Telegram yang sudah ada (kirimBerkas di telegram.ts).
// POST /laporan/kirim memakai fungsi yang sama, untuk menguji tanpa menunggu jamnya.
// Laporan hanya terkirim selama backend menyala: jadwal yang terlewat (misalnya laptop tidur) tidak dikirim belakangan.
import cron from "node-cron";
import { pool } from "../db/pool.ts";
import { keCsv } from "./csv.ts";
import { alasanTelegramMati, kabari, kirimBerkas } from "./telegram.ts";
import { log } from "./log.ts";

const ZONA = "Asia/Jakarta"; // WIB, sama dengan jadwal aturan (jadwal.ts): apa pun zona waktu laptopnya
const HARI_MS = 24 * 60 * 60 * 1000;
// "sv-SE" (bahasa Swedia) dipakai karena formatnya kebetulan tahun-bulan-tanggal: 2026-10-26 (resep csv.ts Modul 23)
const tanggalIso = new Intl.DateTimeFormat("sv-SE", { timeZone: ZONA, dateStyle: "short" });
const tanggalManusia = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, dateStyle: "medium" }); // 26 Okt 2026
const jamManusia = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, hour: "2-digit", minute: "2-digit" }); // 07.00
const waktuManusia = (waktu: Date) => `${tanggalManusia.format(waktu)}, ${jamManusia.format(waktu)} WIB`;

// Rentang satu laporan: [dari, sampai), "sampai" tidak ikut dihitung. tanggal = hari WIB yang dilaporkan.
export interface Rentang {
  dari: Date;
  sampai: Date;
  tanggal: string; // misalnya 2026-10-26
  hariIni: boolean; // true = laporan sementara hari ini (POST /laporan/kirim?hari=ini)
}

// Kemarin = 00.00-24.00 WIB hari sebelumnya; hari ini = 00.00 WIB sampai sekarang. WIB = UTC + 7 jam tanpa jam musim
// panas, jadi 00.00 WIB selalu 17.00 UTC hari sebelumnya. Fungsi murni: "sekarang" diberikan dari luar supaya bisa diuji.
export function rentangLaporan(sekarang: Date, hariIni = false): Rentang {
  const tanggalHariIni = tanggalIso.format(sekarang); // tanggal di WIB, bukan tanggal di zona waktu laptop
  const awalHariIni = new Date(`${tanggalHariIni}T00:00:00+07:00`);
  if (hariIni) return { dari: awalHariIni, sampai: sekarang, tanggal: tanggalHariIni, hariIni };
  const awalKemarin = new Date(awalHariIni.getTime() - HARI_MS);
  return { dari: awalKemarin, sampai: awalHariIni, tanggal: tanggalIso.format(awalKemarin), hariIni };
}

// laporan-2026-10-26.csv = isi tanggal 26 (dikirim pagi tanggal 27). Laporan sementara diberi akhiran supaya tidak tertukar
// dengan laporan lengkap hari yang sama, yang baru dikirim besok pagi.
export function namaLaporan(r: Rentang): string {
  return `laporan-${r.tanggal}${r.hariIni ? "-sementara" : ""}.csv`;
}

// keterangan (caption) di bawah berkas di Telegram
export function keteranganLaporan(r: Rentang, jumlahPerangkat: number): string {
  return r.hariIni
    ? `📊 Laporan sementara Rumah Pintar Mini ${tanggalManusia.format(r.dari)} (00.00–${jamManusia.format(r.sampai)} WIB): `
      + `${jumlahPerangkat} perangkat`
    : `📊 Laporan harian Rumah Pintar Mini ${tanggalManusia.format(r.dari)}: ${jumlahPerangkat} perangkat`;
}

// Satu baris laporan = satu perangkat terdaftar yang belum dicabut. null = tidak ada datanya (misalnya Node 2 tidak punya
// vitals, jadi kolom rssi, heap, dan menyala_ulang-nya selalu kosong).
export interface BarisLaporan {
  device_id: string;
  nama: string;
  jenis: string;
  jumlah_bacaan: number; // 0 = perangkat diam seharian
  suhu_rata: number | null;
  suhu_min: number | null;
  suhu_maks: number | null;
  kelembapan_rata: number | null;
  tanah_rata: number | null;
  tanah_min: number | null;
  rssi_rata: number | null;
  rssi_terburuk: number | null; // paling negatif = sinyal paling lemah
  heap_terendah: number | null;
  menyala_ulang: number | null; // berapa kali uptime turun (perangkat menyala ulang)
  kali_terputus: number; // berapa kali status berganti menjadi offline/offline-mode
}

// Urutan kolom CSV. Kepala tabel = nama kolom ini, sama dengan nama kolom hasil kueri di bawah.
export const KOLOM_LAPORAN: (keyof BarisLaporan)[] = ["device_id", "nama", "jenis", "jumlah_bacaan", "suhu_rata", "suhu_min",
  "suhu_maks", "kelembapan_rata", "tanah_rata", "tanah_min", "rssi_rata", "rssi_terburuk", "heap_terendah", "menyala_ulang",
  "kali_terputus"];

// Satu kueri untuk semua perangkat, $1 = dari, $2 = sampai. Empat bagian (WITH ... AS):
// - ringkas: bacaan per jam dari buku ringkasan readings_per_jam (Modul 18), digabung menjadi satu hari. Rata-rata harian =
//   jumlah (rata x banyaknya nilai) semua jam dibagi jumlah banyaknya nilai, seperti ringkasan 1d di db/arsip.ts.
// - vital + sehat: vitals dari device_health (Modul 19). lag() mengambil uptime vitals SEBELUMNYA milik perangkat yang sama;
//   uptime yang turun berarti perangkat menyala ulang.
// - putus: kejadian status dari buku kejadian (events); kalimatnya "<device_id> terputus (offline)" (services/mqtt.ts).
// Angka di-cast ke float8 dan int supaya pg mengirimnya sebagai number, bukan teks.
const KUERI_LAPORAN = `
WITH ringkas AS (
  SELECT device_id,
         sum(jumlah_bacaan)::int                                                               AS jumlah_bacaan,
         round((sum(suhu_rata * suhu_n) / nullif(sum(suhu_n), 0))::numeric, 1)::float8          AS suhu_rata,
         min(suhu_min)                                                                         AS suhu_min,
         max(suhu_maks)                                                                        AS suhu_maks,
         round(sum(kelembapan_rata * kelembapan_n) / nullif(sum(kelembapan_n), 0), 1)::float8 AS kelembapan_rata,
         round(sum(tanah_rata * tanah_n) / nullif(sum(tanah_n), 0), 1)::float8                AS tanah_rata,
         min(tanah_min)                                                                        AS tanah_min
  FROM readings_per_jam
  WHERE jam >= $1 AND jam < $2
  GROUP BY device_id),
vital AS (
  SELECT device_id, rssi, heap_free, uptime_s,
         lag(uptime_s) OVER (PARTITION BY device_id ORDER BY ts) AS uptime_sebelum
  FROM device_health
  WHERE ts >= $1 AND ts < $2),
sehat AS (
  SELECT device_id, round(avg(rssi))::int AS rssi_rata, min(rssi) AS rssi_terburuk, min(heap_free) AS heap_terendah,
         (count(*) FILTER (WHERE uptime_s < uptime_sebelum))::int AS menyala_ulang
  FROM vital
  GROUP BY device_id),
putus AS (
  SELECT device_id, count(*)::int AS kali_terputus
  FROM events
  WHERE jenis = 'status' AND pesan LIKE '%terputus%' AND waktu >= $1 AND waktu < $2
  GROUP BY device_id)
SELECT d.device_id, coalesce(d.nama, d.device_id) AS nama, d.jenis,
       coalesce(r.jumlah_bacaan, 0) AS jumlah_bacaan, r.suhu_rata, r.suhu_min, r.suhu_maks, r.kelembapan_rata,
       r.tanah_rata, r.tanah_min, s.rssi_rata, s.rssi_terburuk, s.heap_terendah, s.menyala_ulang,
       coalesce(p.kali_terputus, 0) AS kali_terputus
FROM devices d
LEFT JOIN ringkas r ON r.device_id = d.device_id
LEFT JOIN sehat s ON s.device_id = d.device_id
LEFT JOIN putus p ON p.device_id = d.device_id
WHERE d.terdaftar IS NOT NULL AND d.dicabut IS NULL
ORDER BY d.device_id`;

// baris-baris laporan menjadi teks CSV: kepala tabel, lalu satu baris per perangkat (fungsi murni)
export function buatLaporanCsv(baris: BarisLaporan[]): string {
  return keCsv([KOLOM_LAPORAN, ...baris.map((b) => KOLOM_LAPORAN.map((kolom) => b[kolom]))]);
}

// Hasil satu kali kirim. "dilewati" = Telegram mati (token/chat_id kosong); "gagal" = Telegram menolak atau tak terjangkau.
export type HasilLaporan =
  | { status: "terkirim"; berkas: string; rentang: Rentang; perangkat: number; ukuran_byte: number; keterangan: string }
  | { status: "dilewati"; pesan: string }
  | { status: "gagal"; pesan: string };

// Susun dan kirim satu laporan. Galat database TIDAK ditangkap di sini: pemanggilnya yang memutuskan (rute: 503, jadwal: log).
export async function kirimLaporan(hariIni = false, sekarang = new Date()): Promise<HasilLaporan> {
  const mati = alasanTelegramMati();
  if (mati !== null) return { status: "dilewati", pesan: `Telegram mati (${mati})` }; // tidak perlu membaca database
  const rentang = rentangLaporan(sekarang, hariIni);
  const hasil = await pool.query<BarisLaporan>(KUERI_LAPORAN, [rentang.dari, rentang.sampai]);
  const isi = buatLaporanCsv(hasil.rows);
  const berkas = namaLaporan(rentang);
  const keterangan = keteranganLaporan(rentang, hasil.rows.length);
  if (!(await kirimBerkas(berkas, isi, keterangan))) {
    return { status: "gagal", pesan: `Telegram tidak menerima ${berkas}; lihat log backend` };
  }
  return { status: "terkirim", berkas, rentang, perangkat: hasil.rows.length, ukuran_byte: Buffer.byteLength(isi, "utf8"),
    keterangan };
}

// Dipanggil node-cron pada jamnya. Tidak ada yang menunggu jawabannya, jadi semua hasil (juga galat) dicatat di log.
// waktuJadwal = jam yang TERTULIS di jadwal, bukan jam saat fungsi ini berjalan: jadwal 23.50 yang baru berjalan 00.01
// (laptop baru bangun) tetap melaporkan "kemarin" dari 23.50 itu, bukan hari yang baru saja berakhir.
async function laporanTerjadwal(waktuJadwal: Date): Promise<void> {
  log.info("laporan harian berjalan sesuai jadwal");
  try {
    const hasil = await kirimLaporan(false, waktuJadwal);
    if (hasil.status === "dilewati") log.warn(`laporan harian dilewati: ${hasil.pesan}`);
    else if (hasil.status === "gagal") log.error(`laporan harian gagal: ${hasil.pesan}`);
    // terkirim: kirimBerkas() sudah menulis "Telegram terkirim: berkas laporan-…" ke log
  } catch (galat) {
    log.error(`laporan harian gagal: database tidak bisa dibaca (${(galat as Error).message})`);
  }
}

// node-cron 4 TIDAK memutar ulang jadwal yang terlewat (misalnya laptop tidur pukul 07.00): kita hanya bisa mencatatnya.
function laporanTerlewat(waktu: Date): void {
  const pesan = `⏰ Laporan harian pada ${waktuManusia(waktu)} terlewat (laptop tidur atau backend sibuk?). `
    + "Kirim sekarang lewat POST /laporan/kirim";
  log.warn(pesan);
  void kabari(pesan);
}

// Pasang jadwal laporan harian (dipanggil server.ts sekali saat mulai). Berhentinya ikut hentikanJadwal() di jadwal.ts:
// cron.shutdown() menghentikan SEMUA tugas node-cron, termasuk yang ini.
export function mulaiLaporan(jadwal: string): void {
  // konteks.date = jam jadwal tugas ini (misalnya 07.00 WIB), juga kalau baru berjalan beberapa menit kemudian
  const tugas = cron.schedule(jadwal, (konteks) => laporanTerjadwal(konteks.date), {
    name: "laporan-harian",
    timezone: ZONA, // tanpa ini, "0 7 * * *" berarti 07.00 menurut zona waktu laptop (laptop WITA: 06.00 WIB)
    noOverlap: true, // kalau laporan sebelumnya belum selesai, jangan jalankan dua kali bersamaan
    missedExecutionTolerance: 15 * 60_000, // terlambat sampai 15 menit (misalnya laptop baru bangun) tetap dijalankan
  });
  tugas.on("execution:missed", (konteks) => laporanTerlewat(konteks.date));
  const berikutnya = tugas.getNextRun();
  log.info(`laporan harian dijadwalkan: "${jadwal}" ${ZONA}, berikutnya ${berikutnya === null ? "-" : waktuManusia(berikutnya)}`);
}
