// pengguna.ts - akun (tabel users) dan login yang masih aktif (tabel sesi), Modul 20. Sidik jari sandi (sandi_hash)
// hanya keluar dari file ini lewat cariUntukLogin: fungsi lain tidak pernah mengambilnya.
import { pool } from "./pool.ts";

export type Peran = "admin" | "viewer";

export interface Pengguna {
  id: number;
  email: string;
  nama: string;
  peran: Peran;
}

const KOLOM = "id, email, nama, peran";

export async function cariUntukLogin(email: string): Promise<(Pengguna & { sandi_hash: string | null }) | undefined> {
  const hasil = await pool.query<Pengguna & { sandi_hash: string | null }>(
    `SELECT ${KOLOM}, sandi_hash FROM users WHERE email = $1`, [email]);
  return hasil.rows[0];
}

export async function ambilPengguna(id: number): Promise<Pengguna | undefined> {
  const hasil = await pool.query<Pengguna>(`SELECT ${KOLOM} FROM users WHERE id = $1`, [id]);
  return hasil.rows[0];
}

export async function semuaPengguna(): Promise<(Pengguna & { punya_sandi: boolean; sesi_aktif: number })[]> {
  const hasil = await pool.query<Pengguna & { punya_sandi: boolean; sesi_aktif: number }>(
    `SELECT u.id, u.email, u.nama, u.peran, u.sandi_hash IS NOT NULL AS punya_sandi,
            (SELECT count(*)::int FROM sesi s WHERE s.pengguna_id = u.id AND s.kedaluwarsa > now()) AS sesi_aktif
     FROM users u ORDER BY u.id`);
  return hasil.rows;
}

export async function tambahPengguna(email: string, nama: string, peran: Peran, sandiHash: string): Promise<Pengguna> {
  const hasil = await pool.query<Pengguna>(
    `INSERT INTO users (email, nama, peran, sandi_hash, sandi_diubah) VALUES ($1, $2, $3, $4, now()) RETURNING ${KOLOM}`,
    [email, nama, peran, sandiHash]);
  return hasil.rows[0];
}

// Ganti sandi, lalu cabut semua sesinya: siapa pun yang masih login dengan sandi lama harus login ulang.
export async function gantiSandi(email: string, sandiHash: string): Promise<Pengguna | undefined> {
  const hasil = await pool.query<Pengguna>(
    `UPDATE users SET sandi_hash = $2, sandi_diubah = now() WHERE email = $1 RETURNING ${KOLOM}`, [email, sandiHash]);
  const p = hasil.rows[0];
  if (p !== undefined) await pool.query("DELETE FROM sesi WHERE pengguna_id = $1", [p.id]);
  return p;
}

export async function gantiPeran(email: string, peran: Peran): Promise<Pengguna | undefined> {
  const hasil = await pool.query<Pengguna>(`UPDATE users SET peran = $2 WHERE email = $1 RETURNING ${KOLOM}`, [email, peran]);
  return hasil.rows[0];
}

export async function hapusPengguna(email: string): Promise<boolean> {
  const hasil = await pool.query("DELETE FROM users WHERE email = $1", [email]); // sesinya ikut terhapus (CASCADE)
  return hasil.rowCount === 1;
}

// ---- sesi (refresh token) ----

export async function buatSesi(penggunaId: number, tokenHash: string, umurDetik: number): Promise<number> {
  await pool.query("DELETE FROM sesi WHERE kedaluwarsa < now()"); // bersih-bersih: buang sesi yang sudah kedaluwarsa
  const hasil = await pool.query<{ id: string }>(
    `INSERT INTO sesi (pengguna_id, token_hash, kedaluwarsa) VALUES ($1, $2, now() + make_interval(secs => $3))
     RETURNING id`, [penggunaId, tokenHash, umurDetik]);
  return Number(hasil.rows[0].id); // bigint datang dari pg sebagai teks
}

// Rotasi: tukar token lama dengan token baru dalam SATU perintah UPDATE. Kalau dua permintaan membawa token yang sama
// bersamaan, hanya satu yang menang; yang lain tidak menemukan barisnya lagi.
export async function putarSesi(hashLama: string, hashBaru: string):
  Promise<{ id: number; pengguna_id: number; kedaluwarsa: Date } | undefined> {
  const hasil = await pool.query<{ id: string; pengguna_id: number; kedaluwarsa: Date }>(
    `UPDATE sesi SET token_lama = token_hash, token_hash = $2, diperbarui = now()
     WHERE token_hash = $1 AND kedaluwarsa > now()
     RETURNING id, pengguna_id, kedaluwarsa`, [hashLama, hashBaru]);
  const baris = hasil.rows[0];
  return baris === undefined ? undefined : { ...baris, id: Number(baris.id) };
}

// Token yang sudah diganti (token_lama) dipakai lagi?
export async function cariSesiTokenLama(hash: string): Promise<{ id: number; pengguna_id: number; diperbarui: Date } | undefined> {
  const hasil = await pool.query<{ id: string; pengguna_id: number; diperbarui: Date }>(
    "SELECT id, pengguna_id, diperbarui FROM sesi WHERE token_lama = $1 AND kedaluwarsa > now()", [hash]);
  const baris = hasil.rows[0];
  return baris === undefined ? undefined : { ...baris, id: Number(baris.id) };
}

export async function hapusSesi(id: number): Promise<void> {
  await pool.query("DELETE FROM sesi WHERE id = $1", [id]);
}

// Logout: hapus sesi yang token sekarangnya cocok. Hasilnya nomor sesi yang dihapus.
export async function hapusSesiDenganToken(hash: string): Promise<number | undefined> {
  const hasil = await pool.query<{ id: string }>("DELETE FROM sesi WHERE token_hash = $1 RETURNING id", [hash]);
  return hasil.rows[0] === undefined ? undefined : Number(hasil.rows[0].id);
}
