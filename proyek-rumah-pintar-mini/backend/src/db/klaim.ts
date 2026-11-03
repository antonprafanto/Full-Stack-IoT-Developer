// klaim.ts - tabel kode_klaim (Modul 28, migrasi 011): kode sekali pakai buatan admin yang ditukar perangkat baru dengan
// kunci perangkatnya. Database hanya menyimpan SHA-256 kodenya (seperti kunci perangkat, Modul 21).
import { denganTransaksi, pool } from "./pool.ts";

// Simpan kode baru. Hasilnya waktu kedaluwarsa menurut jam database.
export async function simpanKodeKlaim(kodeHash: string, nama: string | null, lokasi: string | null, oleh: string,
  menit: number): Promise<Date> {
  const hasil = await pool.query<{ kedaluwarsa: Date }>(
    `INSERT INTO kode_klaim (kode_hash, nama, lokasi, oleh, kedaluwarsa) VALUES ($1, $2, $3, $4, now() + make_interval(mins => $5))
     RETURNING kedaluwarsa`,
    [kodeHash, nama, lokasi, oleh, menit],
  );
  return hasil.rows[0].kedaluwarsa;
}

// Daftar kode untuk halaman /armada (TANPA kodenya: kode hanya tampil sekali saat dibuat), terbaru lebih dulu.
export interface BarisKode {
  nama: string | null;
  lokasi: string | null;
  oleh: string | null;
  dibuat: Date;
  kedaluwarsa: Date;
  dipakai: Date | null;
  device_id: string | null;
}

export async function daftarKodeKlaim(batas = 20): Promise<BarisKode[]> {
  const hasil = await pool.query<BarisKode>(
    "SELECT nama, lokasi, oleh, dibuat, kedaluwarsa, dipakai, device_id FROM kode_klaim ORDER BY dibuat DESC LIMIT $1", [batas]);
  return hasil.rows;
}

export type HasilKlaim =
  | { status: "berhasil"; nama: string | null; lokasi: string | null }
  | { status: "kode-salah" } // salah, kedaluwarsa, atau sudah dipakai: satu jawaban untuk ketiganya
  | { status: "masih-aktif" }; // device_id itu terdaftar dan belum dicabut (atau perangkat ESP-NOW)

// Tukar kode dengan pendaftaran, dalam SATU transaksi:
//   1. kunci baris kodenya (FOR UPDATE): dua perangkat yang memakai kode yang sama bersamaan tidak bisa sama-sama berhasil
//   2. daftarkan perangkat: baru, baris lama Modul 17-20, atau perangkat yang pernah DICABUT (kode dari admin = izin
//      menghidupkannya lagi). Perangkat yang masih aktif TIDAK bisa diklaim: identitasnya tidak bisa direbut
//   3. tandai kodenya terpakai
//   4. diBroker: buat akun broker (dynamic security). Gagal = ROLLBACK: kode TIDAK hangus, perangkat boleh mencoba lagi
export async function tukarKodeKlaim(kodeHash: string, deviceId: string, kunciHash: string,
  diBroker: () => Promise<void>): Promise<HasilKlaim> {
  return denganTransaksi(async (klien) => {
    const kode = await klien.query<{ nama: string | null; lokasi: string | null }>(
      "SELECT nama, lokasi FROM kode_klaim WHERE kode_hash = $1 AND dipakai IS NULL AND kedaluwarsa > now() FOR UPDATE",
      [kodeHash],
    );
    if (kode.rows[0] === undefined) return { status: "kode-salah" } as const;
    const { nama, lokasi } = kode.rows[0];
    const daftar = await klien.query(
      `INSERT INTO devices (device_id, nama, lokasi, terdaftar, kunci_hash, kunci_dibuat) VALUES ($1, $2, $3, now(), $4, now())
       ON CONFLICT (device_id) DO UPDATE SET nama = coalesce($2, devices.nama), lokasi = coalesce($3, devices.lokasi),
         terdaftar = now(), kunci_hash = $4, kunci_dibuat = now(), dicabut = NULL
       WHERE devices.penghubung IS NULL AND (devices.terdaftar IS NULL OR devices.dicabut IS NOT NULL)
       RETURNING device_id`,
      [deviceId, nama, lokasi, kunciHash],
    );
    if (daftar.rowCount === 0) return { status: "masih-aktif" } as const; // tidak ada yang berubah: transaksi tetap rapi
    await klien.query("UPDATE kode_klaim SET dipakai = now(), device_id = $2 WHERE kode_hash = $1", [kodeHash, deviceId]);
    await diBroker();
    return { status: "berhasil", nama, lokasi } as const;
  });
}
