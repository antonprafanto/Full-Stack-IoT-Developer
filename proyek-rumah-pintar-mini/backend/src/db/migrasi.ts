// migrasi.ts - menjalankan file SQL di folder migrasi/ yang belum pernah dijalankan, urut menurut nomornya.
// Jalankan dari folder backend: npm run migrasi
import { readdir, readFile } from "node:fs/promises";
import { pool } from "./pool.ts";

const FOLDER = new URL("../../migrasi/", import.meta.url); // folder backend/migrasi/

// buku catatan migrasi: satu baris untuk setiap file yang sudah dijalankan
await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  versi text PRIMARY KEY,
  diterapkan_pada timestamptz NOT NULL DEFAULT now()
)`);
const sudah = await pool.query<{ versi: string }>("SELECT versi FROM schema_migrations");
const tercatat = new Set(sudah.rows.map((baris) => baris.versi));
const semua = (await readdir(FOLDER)).filter((nama) => nama.endsWith(".sql")).sort(); // 001_…, 002_…, dan seterusnya

let baru = 0;
for (const nama of semua) {
  if (tercatat.has(nama)) continue; // sudah pernah dijalankan: lewati
  const sql = await readFile(new URL(nama, FOLDER), "utf8");
  const klien = await pool.connect(); // satu sambungan khusus supaya BEGIN dan COMMIT terjadi di sambungan yang sama
  try {
    await klien.query("BEGIN"); // semua isi file berhasil, atau tidak ada yang berubah sama sekali
    await klien.query(sql);
    await klien.query("INSERT INTO schema_migrations (versi) VALUES ($1)", [nama]);
    await klien.query("COMMIT");
    console.log(`diterapkan: ${nama}`);
    baru++;
  } catch (galat) {
    await klien.query("ROLLBACK");
    console.error(`GAGAL di ${nama}: ${(galat as Error).message}`);
    process.exitCode = 1; // npm melaporkan kegagalan
    break; // jangan lanjut ke file berikutnya
  } finally {
    klien.release(); // kembalikan sambungan ke kolam
  }
}
console.log(`${baru} migrasi baru diterapkan, ${tercatat.size} sudah ada sebelumnya.`);
await pool.end(); // tutup kolam supaya program selesai
