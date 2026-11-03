// pool.ts - "kolam" sambungan ke database PostgreSQL, dipakai bersama oleh seluruh backend.
import { Pool } from "pg";
import type { PoolClient } from "pg";
import { env } from "../config/env.ts";

export const pool = new Pool({
  connectionString: env.DATABASE_URL, // postgres://postgres:<sandi>@127.0.0.1:5432/rumahpintar
  max: 5, // paling banyak 5 sambungan sekaligus; cukup untuk satu backend kecil
  connectionTimeoutMillis: 5000, // menyerah kalau database tidak menjawab dalam 5 detik
});

// sambungan yang sedang menganggur bisa putus (misalnya kontainer database dihentikan): catat, jangan mematikan server
pool.on("error", (galat) => console.error(`galat database: ${galat.message}`));

// Modul 28: jalankan beberapa kueri sebagai SATU transaksi (semuanya berhasil, atau tidak ada yang berubah). `kerja` menerima
// satu sambungan khusus (BEGIN dan COMMIT harus di sambungan yang sama). Galat apa pun di dalamnya = ROLLBACK, lalu galatnya
// dilempar lagi ke pemanggil. Dipakai untuk langkah yang melibatkan broker: kalau akun broker gagal dibuat atau dihapus,
// database juga tidak berubah, jadi admin (atau perangkat) cukup mencoba lagi.
export async function denganTransaksi<T>(kerja: (klien: PoolClient) => Promise<T>): Promise<T> {
  const klien = await pool.connect();
  try {
    await klien.query("BEGIN");
    const hasil = await kerja(klien);
    await klien.query("COMMIT");
    return hasil;
  } catch (galat) {
    await klien.query("ROLLBACK").catch(() => {}); // sambungan putus: transaksinya batal sendiri
    throw galat;
  } finally {
    klien.release();
  }
}
