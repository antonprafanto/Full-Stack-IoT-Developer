// pool.ts - "kolam" sambungan ke database PostgreSQL, dipakai bersama oleh seluruh backend.
import { Pool } from "pg";
import { env } from "../config/env.ts";

export const pool = new Pool({
  connectionString: env.DATABASE_URL, // postgres://postgres:<sandi>@127.0.0.1:5432/rumahpintar
  max: 5, // paling banyak 5 sambungan sekaligus; cukup untuk satu backend kecil
  connectionTimeoutMillis: 5000, // menyerah kalau database tidak menjawab dalam 5 detik
});

// sambungan yang sedang menganggur bisa putus (misalnya kontainer database dihentikan): catat, jangan mematikan server
pool.on("error", (galat) => console.error(`galat database: ${galat.message}`));
