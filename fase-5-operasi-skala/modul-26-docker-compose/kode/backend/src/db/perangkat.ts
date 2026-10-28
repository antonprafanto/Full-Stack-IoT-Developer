// perangkat.ts - daftar resmi perangkat di tabel devices (Modul 21, migrasi 010): registrasi oleh admin, ganti kunci, cabut.
// Sidik jari kunci (kunci_hash) hanya DITULIS dari file ini; daftar perangkat tidak pernah membacanya.
// Modul 25: daftar perangkat juga membawa titik peta (lat, lng), dan admin bisa memindahkan titik itu (ubahLokasi).
import { pool } from "./pool.ts";

// satu baris daftar perangkat seperti yang ditampilkan GET /devices (tanpa sidik jari kunci)
export interface BarisPerangkat {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  nama: string | null;
  lokasi: string | null;
  lat: number | null; // Modul 25: lintang (latitude) titik di peta, derajat desimal; null = belum diisi
  lng: number | null; // Modul 25: bujur (longitude); kolomnya sudah ada sejak migrasi 001, tetapi baru dibaca sekarang
  status: string;
  terakhir_dilihat: Date | null;
  terdaftar: Date | null;
  kunci_dibuat: Date | null;
  dicabut: Date | null;
  penghubung: string | null;
}

const KOLOM = "device_id, jenis, nama, lokasi, lat, lng, status, terakhir_dilihat, terdaftar, kunci_dibuat, dicabut, penghubung";

export async function semuaPerangkatDb(): Promise<BarisPerangkat[]> {
  const hasil = await pool.query<BarisPerangkat>(`SELECT ${KOLOM} FROM devices ORDER BY device_id`);
  return hasil.rows;
}

// Daftarkan perangkat. device_id yang sudah punya baris lama (dibuat otomatis Modul 17-20) "diklaim": riwayatnya tetap.
// Hasilnya undefined kalau device_id itu SUDAH terdaftar (pakai ganti kunci, bukan registrasi ulang).
export async function daftarkanPerangkat(deviceId: string, nama: string | null, lokasi: string | null,
  penghubung: string | null, kunciHash: string | null): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `INSERT INTO devices (device_id, jenis, nama, lokasi, penghubung, terdaftar, kunci_hash, kunci_dibuat)
     VALUES ($1, CASE WHEN $4::text IS NULL THEN 'belum-diketahui' ELSE 'node2' END, $2, $3, $4, now(), $5,
             CASE WHEN $5::text IS NULL THEN NULL ELSE now() END)
     ON CONFLICT (device_id) DO UPDATE SET
       nama = coalesce($2, devices.nama),
       lokasi = coalesce($3, devices.lokasi),
       jenis = CASE WHEN $4::text IS NULL THEN devices.jenis ELSE 'node2' END,
       penghubung = $4, terdaftar = now(), kunci_hash = $5, kunci_dibuat = EXCLUDED.kunci_dibuat, dicabut = NULL
     WHERE devices.terdaftar IS NULL
     RETURNING ${KOLOM}`,
    [deviceId, nama, lokasi, penghubung, kunciHash],
  );
  return hasil.rows[0];
}

// Kunci baru untuk perangkat terdaftar yang tersambung ke broker (juga menghidupkan lagi perangkat yang dicabut).
export async function gantiKunciPerangkat(deviceId: string, kunciHash: string): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `UPDATE devices SET kunci_hash = $2, kunci_dibuat = now(), dicabut = NULL
     WHERE device_id = $1 AND terdaftar IS NOT NULL AND penghubung IS NULL
     RETURNING ${KOLOM}`,
    [deviceId, kunciHash],
  );
  return hasil.rows[0];
}

// Cabut: sidik jari kunci dihapus, waktu pencabutan dicatat. Hasilnya undefined kalau belum terdaftar atau sudah dicabut.
export async function cabutPerangkat(deviceId: string): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `UPDATE devices SET kunci_hash = NULL, kunci_dibuat = NULL, dicabut = now()
     WHERE device_id = $1 AND terdaftar IS NOT NULL AND dicabut IS NULL
     RETURNING ${KOLOM}`,
    [deviceId],
  );
  return hasil.rows[0];
}

// Modul 25: pindahkan titik perangkat di peta. lat dan lng selalu ditulis berpasangan; null dan null = titiknya dihapus.
// Teks lokasi ("ruang tamu") tidak ikut diubah. Hasilnya undefined kalau device_id itu tidak ada di tabel devices.
export async function ubahLokasi(deviceId: string, lat: number | null, lng: number | null): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `UPDATE devices SET lat = $2, lng = $3 WHERE device_id = $1 RETURNING ${KOLOM}`,
    [deviceId, lat, lng],
  );
  return hasil.rows[0];
}
