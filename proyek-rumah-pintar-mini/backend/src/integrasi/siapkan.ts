// siapkan.ts - persiapan bersama tes INTEGRASI (Modul 29): rute API + database TimescaleDB SUNGGUHAN, bukan tabel tiruan vi.mock.
// Setiap berkas *.test.ts di folder ini memanggil siapkanUji() sekali sebelum tesnya (beforeAll) dan uji.tutup() sesudahnya.
//
// Database uji = database KOSONG khusus uji, alamatnya di DATABASE_URL_UJI, misalnya
//   postgres://postgres:<sandi uji>@127.0.0.1:5433/rumahpintar_uji
// Tanpa DATABASE_URL_UJI, semua tes integrasi DILEWATI (skipped): npm test di laptop tetap jalan tanpa Docker.
//
// PENGAMAN: nama database WAJIB berakhiran _uji. Tes integrasi MENULIS dan MENGHAPUS baris, jadi alamat database rumahmu
// (rumahpintar) ditolak sebelum satu sambungan pun dibuka, lalu diperiksa sekali lagi dengan current_database() sesudah
// tersambung: yang menentukan adalah database yang benar-benar tersambung, bukan tulisan di alamat.
//
// Urutan siapkanUji():
//   1. periksa nama database di alamat DATABASE_URL_UJI (_uji)
//   2. isi setelan tes ke process.env SEBELUM kode server diimpor (config/env.ts memeriksa setelan saat diimpor): broker
//      palsu (tidak pernah dihubungi), JWT_SECRET acak sekali pakai, folder firmware sementara, akun broker otomatis mati,
//      Telegram mati
//   3. periksa lagi nama database yang benar-benar tersambung (current_database())
//   4. migrasi: node src/db/migrasi.ts, program YANG SAMA dengan layanan migrasi di Compose, ke database uji (dari nol kalau
//      kosong; kalau sudah lengkap: "0 migrasi baru diterapkan"). Berkas tes berjalan BERSAMAAN, jadi migrasi diantre dengan
//      kunci pg_advisory_lock: satu berkas menjalankannya, berkas lain menunggu giliran
//   5. rakit server lewat buatApp() (app.ts): rakitan yang sama dengan server.ts, tanpa mendengar di loket mana pun
// Setiap berkas tes memakai device_id, email, nama aturan, dan versi firmware MILIKNYA SENDIRI dan membersihkannya sebelum
// setiap tes: berkas lain yang berjalan bersamaan tidak saling mengganggu, dan setiap tes tidak bergantung pada tes sebelumnya.
// Satu pengecualian: "rilis terbaru" dihitung dari SEMUA baris tabel firmware, jadi hanya firmware-armada.test.ts yang boleh
// menulis tabel firmware (tesnya berhenti dengan pesan jelas bila ada rilis lain di database uji).
import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";

const URL_UJI = process.env.DATABASE_URL_UJI ?? ""; // berisi sandi: tidak pernah ditulis ke layar
export const adaDatabaseUji = URL_UJI !== ""; // dipakai describe.skipIf(!adaDatabaseUji) di setiap berkas tes

const FOLDER_BACKEND = fileURLToPath(new URL("../../", import.meta.url)); // folder backend/ (tempat package.json)
const GILIRAN_MIGRASI = 29_29; // nomor bebas untuk pg_advisory_lock: "giliran migrasi tes integrasi"
const jalankan = promisify(execFile);

// Nama database dari alamatnya: postgres://pengguna:sandi@host:5433/rumahpintar_uji -> rumahpintar_uji
function namaDatabase(alamat: string): string {
  try {
    return decodeURIComponent(new URL(alamat).pathname.replace(/^\//, ""));
  } catch {
    return ""; // bukan alamat yang bisa dibaca: dianggap bukan database uji
  }
}

// Pesan galat pengaman: alamatnya TIDAK ikut ditulis (bisa berisi sandi), cukup nama database-nya.
function tolakBukanUji(nama: string): Error {
  return new Error(`DATABASE_URL_UJI menunjuk database "${nama}", bukan database uji: nama database harus berakhiran _uji `
    + "(misalnya rumahpintar_uji). Tes integrasi menulis dan menghapus baris, jadi tidak dijalankan. Jangan pernah "
    + "mengarahkannya ke database rumahmu.");
}

export interface Uji {
  app: FastifyInstance; // server yang sama dengan produksi (buatApp), diketuk lewat app.inject() tanpa jaringan
  pool: Pool; // kolam sambungan ke database uji: untuk memeriksa isi tabel langsung dengan SQL
  gelang: (peran: "admin" | "viewer") => { akses: string }; // cookie akses (JWT) yang sah untuk rute bergembok
  folderFirmware: string; // FIRMWARE_DIR sementara milik berkas tes ini
  tutup: () => Promise<void>;
}

export async function siapkanUji(): Promise<Uji> {
  // 1. pengaman nama database, sebelum ada sambungan apa pun
  const nama = namaDatabase(URL_UJI);
  if (!nama.endsWith("_uji")) throw tolakBukanUji(nama);

  // 2. setelan tes. Nilai kosong = bawaan config/env.ts. Ditimpa semua, supaya setelan di terminal pembaca (misalnya
  //    MQTT_URL atau TELEGRAM_BOT_TOKEN sungguhan) tidak pernah terbawa ke tes.
  const folderFirmware = await mkdtemp(join(tmpdir(), "rumahpintar-uji-firmware-"));
  Object.assign(process.env, {
    DATABASE_URL: URL_UJI,
    MQTT_URL: "mqtt://127.0.0.1:1", // alamat mati: rute yang diuji tidak butuh broker (mqtt.connect hanya di server.ts)
    MQTT_USERNAME: "", MQTT_PASSWORD: "",
    JWT_SECRET: `uji-${randomBytes(32).toString("base64url")}`, // rahasia sekali pakai, dibuat ulang setiap kali tes jalan
    FIRMWARE_DIR: folderFirmware,
    AKUN_BROKER_OTOMATIS: "mati", ALAMAT_SERVER: "", TRUST_PROXY: "", CORS_ORIGIN: "", HOST: "", PORT: "",
    TELEGRAM_BOT_TOKEN: "", TELEGRAM_CHAT_ID: "", TELEGRAM_API_ROOT: "", LAPORAN_JADWAL: "",
  });

  // 3. kode server diimpor SESUDAH process.env terisi (impor biasa di atas berkas akan memeriksa setelan lebih dulu)
  const { pool } = await import("../db/pool.ts");
  try {
    const tersambung = await pool.query<{ nama: string }>("SELECT current_database() AS nama").catch((galat: Error) => {
      throw new Error(`database uji tidak bisa dihubungi (${galat.message}): kontainer database uji sudah dinyalakan, `
        + "dan loket serta sandinya sama dengan DATABASE_URL_UJI?");
    });
    if (!tersambung.rows[0].nama.endsWith("_uji")) throw tolakBukanUji(tersambung.rows[0].nama);

    // 4. migrasi, satu berkas tes pada satu waktu
    const klien = await pool.connect();
    try {
      await klien.query("SELECT pg_advisory_lock($1)", [GILIRAN_MIGRASI]); // menunggu kalau berkas lain sedang memigrasi
      await jalankan(process.execPath, ["src/db/migrasi.ts"], { cwd: FOLDER_BACKEND, env: process.env, timeout: 60_000 })
        .catch((galat: Error & { stdout?: string; stderr?: string }) => {
          throw new Error(`migrasi database uji gagal:\n${galat.stdout ?? ""}${galat.stderr ?? galat.message}`);
        });
    } finally {
      await klien.query("SELECT pg_advisory_unlock($1)", [GILIRAN_MIGRASI]).catch(() => {});
      klien.release();
    }

    // 5. server yang sama dengan produksi, tanpa listen
    const { buatApp } = await import("../app.ts");
    const app = await buatApp({ log: "galat-saja" });
    await app.ready();

    return {
      app, pool, folderFirmware,
      // sub = nomor akun; rute yang diuji hanya mencatatnya (misalnya pengunggah firmware), tidak mencarinya di tabel users
      gelang: (peran) => ({ akses: app.jwt.sign({ sub: peran === "admin" ? "1" : "2", peran, sid: 1 }) }),
      tutup: async () => {
        await tungguKueriSelesai(pool);
        await app.close();
        await pool.end();
        await rm(folderFirmware, { recursive: true, force: true });
      },
    };
  } catch (galat) {
    // gagal di tengah jalan: jangan tinggalkan sambungan database terbuka (Vitest menunggu prosesnya selesai) atau folder
    await pool.end().catch(() => {});
    await rm(folderFirmware, { recursive: true, force: true });
    throw galat;
  }
}

// Beberapa rute menulis buku kejadian (catatKejadian) TANPA menunggu tulisannya selesai: jawaban HTTP sudah datang, tetapi
// INSERT ke tabel events masih berjalan. Sebelum bersih-bersih, tunggu sampai kolam sambungan menganggur (tidak ada kueri
// yang sedang berjalan atau mengantre), supaya baris yang terlambat tidak bertabrakan dengan DELETE (kunci asing) atau muncul
// sesudah dibersihkan. Paling lama 2 detik.
export async function tungguKueriSelesai(pool: Pool): Promise<void> {
  for (let i = 0; i < 200 && (pool.totalCount > pool.idleCount || pool.waitingCount > 0); i++) {
    await new Promise((lanjut) => setTimeout(lanjut, 10));
  }
}

// Bersih-bersih: hapus semua baris milik perangkat uji, urut menurut kunci asing (anak dulu, induk terakhir): bacaan,
// kesehatan, perintah, kejadian, pembaruan firmware, kode klaim, lalu perangkatnya (Node 2 yang menumpang lebih dulu daripada
// penghubungnya). Nama tabel berasal dari daftar tetap di bawah, bukan dari luar; device_id selalu lewat parameter $1.
const TABEL_ANAK = ["readings", "device_health", "commands", "events", "pembaruan", "kode_klaim"];

export async function hapusPerangkatUji(pool: Pool, ids: string[]): Promise<void> {
  await tungguKueriSelesai(pool);
  for (const tabel of TABEL_ANAK) await pool.query(`DELETE FROM ${tabel} WHERE device_id = ANY($1)`, [ids]);
  await pool.query("DELETE FROM devices WHERE penghubung = ANY($1)", [ids]);
  await pool.query("DELETE FROM devices WHERE device_id = ANY($1)", [ids]);
}

// Data: daftarkan satu perangkat lewat rute API sungguhan (POST /devices sebagai admin) dan kembalikan kuncinya.
export async function daftarkanPerangkat(uji: Uji, deviceId: string, nama = "Perangkat uji integrasi"): Promise<string> {
  const jawab = await uji.app.inject({ method: "POST", url: "/devices", cookies: uji.gelang("admin"),
    payload: { device_id: deviceId, nama } });
  if (jawab.statusCode !== 201) throw new Error(`gagal mendaftarkan ${deviceId}: ${jawab.statusCode} ${jawab.body}`);
  return (jawab.json() as { kunci: string }).kunci;
}
