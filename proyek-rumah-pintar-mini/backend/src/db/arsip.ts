// arsip.ts - menulis pesan yang sudah lolos pemeriksaan kontrak ke database, dan membacanya lagi untuk API riwayat
// (bacaan mentah, atau ringkasannya per 15 menit, per jam, dan per hari). Modul 19: aturan otomatis (tabel rules) dan
// buku kejadian (tabel events).
// Gudang di memori (gudang.ts) tetap menjadi "papan pengumuman" keadaan terbaru; database adalah buku arsipnya.
import { pool } from "./pool.ts";
import type { Ack, PerintahSet, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import type { Aturan } from "../schemas/aturan.ts";

// Pastikan perangkat punya baris di tabel devices (dibuat kalau belum ada), lalu perbarui waktu terakhir terdengar.
// Kolom yang tidak diberikan (null) tidak menimpa isi lama, berkat coalesce.
async function catatPerangkat(deviceId: string, jenis: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id, jenis, status, terakhir_dilihat)
     VALUES ($1, coalesce($2, 'belum-diketahui'), coalesce($3, 'belum-diketahui'), now())
     ON CONFLICT (device_id) DO UPDATE SET
       jenis = coalesce($2, devices.jenis),
       status = coalesce($3, devices.status),
       terakhir_dilihat = now()`,
    [deviceId, jenis, status],
  );
}

// Simpan satu telemetry. Hasilnya false kalau bacaan dengan ts yang sama sudah tersimpan (kiriman ganda).
export async function arsipkanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): Promise<boolean> {
  const n2 = "tekanan" in isi ? isi : null; // Node 2 dikenali dari kolom tekanan (kontrak 1.2), seperti di gudang.ts
  const n1 = "tekanan" in isi ? null : isi; // selain itu, telemetry Node 1
  await catatPerangkat(deviceId, n2 ? "node2" : "node1", null);
  const hasil = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air,
                           tekanan, suhu_tanah, baterai, tanah_rs485, ec)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.fw, isi.suhu, isi.kelembapan, n1?.cahaya ?? null, isi.tanah, n1?.gerak ?? null,
      n1?.level_air ?? null, n2?.tekanan ?? null, isi.suhu_tanah ?? null, n2?.baterai ?? null,
      n1?.tanah_rs485 ?? null, n1?.ec ?? null],
  );
  return hasil.rowCount === 1;
}

export async function arsipkanStatus(deviceId: string, status: Status): Promise<void> {
  await catatPerangkat(deviceId, null, status);
}

export async function arsipkanVitals(deviceId: string, isi: Vitals): Promise<void> {
  await catatPerangkat(deviceId, null, null);
  await pool.query(
    `INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.rssi, isi.uptime_s, isi.heap_free],
  );
}

// Satu perintah beserta hasilnya: ack (ok atau ditolak) atau null kalau tidak ada ack dalam 5 detik. Modul 19: juga
// siapa yang menyuruh (sumber), aturan mana (kalau dari aturan atau jadwal), dan keadaan aktuator menurut ack-nya.
export async function arsipkanPerintah(idPerintah: string, deviceId: string, perintah: PerintahSet, dikirim: Date,
  ack: Ack | null, lamaMs: number, sumber: string, aturanId: number | null): Promise<void> {
  await pool.query(
    `INSERT INTO commands (id, device_id, dikirim, target, nilai, ack_ok, ack_pesan, lama_ms, sumber, aturan_id, state)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [idPerintah, deviceId, dikirim, perintah.target, JSON.stringify(perintah.nilai), ack?.ok ?? null,
      ack?.pesan ?? null, lamaMs, sumber, aturanId, ack === null ? null : JSON.stringify(ack.state)],
  );
}

// Modul 19: satu baris tabel rules, apa adanya (kondisi dan aksi diperiksa Zod oleh otomasi.ts sebelum dipakai).
export interface BarisAturan {
  id: number;
  nama: string;
  aktif: boolean;
  kondisi: unknown;
  aksi: unknown;
  dibuat: Date;
  diubah: Date;
}

const KOLOM_ATURAN = "id, nama, aktif, kondisi, aksi, dibuat, diubah";

export async function ambilSemuaAturan(): Promise<BarisAturan[]> {
  const hasil = await pool.query<BarisAturan>(`SELECT ${KOLOM_ATURAN} FROM rules ORDER BY id`);
  return hasil.rows;
}

export async function tambahAturan(a: Aturan): Promise<BarisAturan> {
  const hasil = await pool.query<BarisAturan>(
    `INSERT INTO rules (nama, aktif, kondisi, aksi) VALUES ($1, $2, $3, $4) RETURNING ${KOLOM_ATURAN}`,
    [a.nama, a.aktif, JSON.stringify(a.kondisi), JSON.stringify(a.aksi)],
  );
  return hasil.rows[0];
}

// Hasilnya undefined kalau aturan bernomor itu tidak ada.
export async function ubahAturan(id: number, a: Aturan): Promise<BarisAturan | undefined> {
  const hasil = await pool.query<BarisAturan>(
    `UPDATE rules SET nama = $2, aktif = $3, kondisi = $4, aksi = $5, diubah = now() WHERE id = $1 RETURNING ${KOLOM_ATURAN}`,
    [id, a.nama, a.aktif, JSON.stringify(a.kondisi), JSON.stringify(a.aksi)],
  );
  return hasil.rows[0];
}

// Modul 19: buku kejadian (tabel events, migrasi 007).
export type JenisKejadian = "aturan" | "aturan-diubah" | "jadwal" | "status" | "mode-offline" | "perintah";

export interface KejadianBaru {
  device_id: string | null; // null untuk kejadian yang bukan milik satu perangkat (misalnya aturan diubah)
  jenis: JenisKejadian;
  sumber: string; // api, aturan, jadwal, telegram, perangkat
  aturan_id: number | null;
  pesan: string; // kalimat untuk manusia, sama dengan pesan Telegram-nya
  data?: unknown; // rincian mentah
}

// kejadian yang sudah tersimpan: ditambah nomor dan waktunya (inilah isi acara Socket.IO "kejadian")
export interface Kejadian extends KejadianBaru {
  id: number;
  waktu: string;
}

export async function simpanKejadian(k: KejadianBaru): Promise<Kejadian> {
  const hasil = await pool.query<{ id: string; waktu: Date }>(
    `INSERT INTO events (device_id, jenis, sumber, aturan_id, pesan, data) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, waktu`,
    [k.device_id, k.jenis, k.sumber, k.aturan_id, k.pesan, k.data === undefined ? null : JSON.stringify(k.data)],
  );
  const { id, waktu } = hasil.rows[0];
  return { id: Number(id), waktu: waktuKontrak(waktu), ...k }; // bigint datang dari pg sebagai teks
}

// Waktu berformat kontrak data (UTC, tanpa milidetik), misalnya 2026-10-20T03:10:00Z
export const waktuKontrak = (waktu: Date) => waktu.toISOString().slice(0, 19) + "Z";

// Bentuk satu baris readings saat dibaca lewat pg: timestamptz menjadi objek Date JavaScript.
interface BarisBacaan {
  ts: Date;
  fw: string;
  suhu: number | null;
  kelembapan: number | null;
  cahaya: number | null;
  tanah: number | null;
  gerak: boolean | null;
  level_air: number | null;
  tekanan: number | null;
  suhu_tanah: number | null;
  baterai: number | null;
  tanah_rs485: number | null;
  ec: number | null;
}

const BATAS = 1000; // paling banyak 1.000 bacaan per permintaan

// Riwayat bacaan satu perangkat dalam rentang [dari, sampai), terlama lebih dulu. Diminta 1.001 baris supaya ketahuan
// kalau sebenarnya ada lebih dari 1.000: jawabannya dipotong, dan terpotong bernilai true.
export async function ambilRiwayat(deviceId: string, dari: Date, sampai: Date) {
  const hasil = await pool.query<BarisBacaan>(
    `SELECT ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air, tekanan, suhu_tanah, baterai, tanah_rs485, ec
     FROM readings
     WHERE device_id = $1 AND ts >= $2 AND ts < $3
     ORDER BY ts
     LIMIT $4`,
    [deviceId, dari, sampai, BATAS + 1],
  );
  const bacaan = hasil.rows.slice(0, BATAS).map((baris) => ({ ...baris, ts: waktuKontrak(baris.ts) })); // ts sebagai teks
  return { bacaan, terpotong: hasil.rows.length > BATAS };
}

// Ukuran ember (bucket) yang boleh diminta API riwayat: 15 menit, 1 jam, atau 1 hari.
export type Ember = "15m" | "1h" | "1d";

// Satu titik ringkasan: rata-rata, terendah, dan tertinggi dalam satu ember, beserta banyaknya bacaan di dalamnya.
interface BarisRingkasan {
  waktu: Date; // awal ember
  suhu_rata: number | null;
  suhu_min: number | null;
  suhu_maks: number | null;
  kelembapan_rata: number | null;
  tanah_rata: number | null;
  cahaya_rata: number | null;
  jumlah_bacaan: number;
}

// Satu kueri tetap untuk setiap ukuran ember. Teks dari pengguna tidak pernah disambung ke SQL: yang dipilih hanya
// salah satu dari tiga kueri ini. Angka di-cast ke float8 dan int supaya pg mengirimnya sebagai number, bukan teks.
const KUERI_RINGKASAN: Record<Ember, string> = {
  // per 15 menit: dihitung langsung dari bacaan mentah di hypertable readings (rentangnya pendek)
  "15m": `SELECT time_bucket('15 minutes', ts) AS waktu,
            round(avg(suhu)::numeric, 1)::float8       AS suhu_rata,
            min(suhu)                                  AS suhu_min,
            max(suhu)                                  AS suhu_maks,
            round(avg(kelembapan)::numeric, 1)::float8 AS kelembapan_rata,
            round(avg(tanah)::numeric, 1)::float8      AS tanah_rata,
            round(avg(cahaya)::numeric, 1)::float8     AS cahaya_rata,
            count(*)::int                              AS jumlah_bacaan
          FROM readings
          WHERE device_id = $1 AND ts >= $2 AND ts < $3
          GROUP BY waktu
          ORDER BY waktu`,
  // per jam: dibaca dari buku ringkasan readings_per_jam (continuous aggregate, migrasi 003)
  "1h": `SELECT jam AS waktu,
           round(suhu_rata::numeric, 1)::float8 AS suhu_rata,
           suhu_min,
           suhu_maks,
           round(kelembapan_rata, 1)::float8    AS kelembapan_rata,
           round(tanah_rata, 1)::float8         AS tanah_rata,
           round(cahaya_rata, 1)::float8        AS cahaya_rata,
           jumlah_bacaan::int                   AS jumlah_bacaan
         FROM readings_per_jam
         WHERE device_id = $1 AND jam >= $2 AND jam < $3
         ORDER BY jam`,
  // per hari WIB: ringkasan per jam digabung lagi. Rata-rata harian = jumlah (rata x banyaknya nilai) semua jam dibagi
  // jumlah banyaknya nilai, jadi tetap tepat walaupun ada jam yang terisi sebagian. nullif mencegah pembagian dengan nol
  // kalau sepanjang hari kolom itu kosong (NULL)
  "1d": `SELECT time_bucket('1 day', jam, 'Asia/Jakarta') AS waktu,
           round((sum(suhu_rata * suhu_n) / nullif(sum(suhu_n), 0))::numeric, 1)::float8          AS suhu_rata,
           min(suhu_min)                                                                         AS suhu_min,
           max(suhu_maks)                                                                        AS suhu_maks,
           round(sum(kelembapan_rata * kelembapan_n) / nullif(sum(kelembapan_n), 0), 1)::float8 AS kelembapan_rata,
           round(sum(tanah_rata * tanah_n) / nullif(sum(tanah_n), 0), 1)::float8                AS tanah_rata,
           round(sum(cahaya_rata * cahaya_n) / nullif(sum(cahaya_n), 0), 1)::float8             AS cahaya_rata,
           sum(jumlah_bacaan)::int                                                               AS jumlah_bacaan
         FROM readings_per_jam
         WHERE device_id = $1 AND jam >= $2 AND jam < $3
         GROUP BY waktu
         ORDER BY waktu`,
};

// Ringkasan bacaan satu perangkat per ember dalam rentang [dari, sampai), terlama lebih dulu.
export async function ambilRingkasan(deviceId: string, dari: Date, sampai: Date, ember: Ember) {
  const hasil = await pool.query<BarisRingkasan>(KUERI_RINGKASAN[ember], [deviceId, dari, sampai]);
  return hasil.rows.map((baris) => ({ ...baris, waktu: waktuKontrak(baris.waktu) })); // waktu sebagai teks
}

// Apakah database bisa dihubungi sekarang? Dipakai GET /health.
export async function databaseHidup(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
