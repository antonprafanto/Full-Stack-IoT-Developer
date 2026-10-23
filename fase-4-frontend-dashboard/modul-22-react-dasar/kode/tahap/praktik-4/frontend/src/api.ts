// api.ts - satu pintu ke backend: semua permintaan ke API lewat fungsi minta() di berkas ini.
// Login memakai cookie HttpOnly dari backend (Modul 20). JavaScript tidak bisa membacanya; browser yang menyimpan
// dan mengirimkannya, asalkan setiap fetch membawa credentials: "include".
import type { Pengguna } from "./types";

// Alamat backend. Bawaan: nama host halaman ini + port 8080, jadi halaman http://localhost:5173 -> API http://localhost:8080.
// Nama host yang sama itu penting: cookie SameSite=Strict hanya ikut kalau halaman dan API satu situs
// (localhost dengan localhost, 127.0.0.1 dengan 127.0.0.1). Alamat lain bisa diatur lewat VITE_API_BASE di .env.local.
// Garis miring di ujung dibuang: "//auth/login" dijawab backend sebagai rute yang tidak dikenal (401).
const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");

// Galat yang tahu kode HTTP-nya, supaya layar bisa membedakan "belum login" (401) dari gangguan lain.
// Kode 0 = server sama sekali tidak bisa dihubungi.
export class GalatApi extends Error {
  kode: number;
  constructor(kode: number, pesan: string) {
    super(pesan);
    this.kode = kode;
    this.name = "GalatApi";
  }
}

// minta() mengirim satu permintaan, lalu mengembalikan isi JSON jawabannya atau melempar GalatApi.
// <T> = bentuk isi jawabannya, diisi oleh fungsi yang memanggil (misalnya Pengguna).
async function minta<T>(jalur: string, opsi: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    // credentials: "include" = bawa cookie walau API beda asal (port 8080, bukan 5173)
    res = await fetch(BASE + jalur, { credentials: "include", ...opsi });
  } catch {
    // fetch gagal total: backend mati, alamatnya salah, atau diblokir CORS. Browser sengaja tidak memberi tahu
    // JavaScript yang mana (galat CORS tampak sama dengan backend mati); rinciannya hanya ada di tab Console.
    throw new GalatApi(
      0,
      "Tidak bisa menghubungi server di " + BASE + ". Mungkin backend belum menyala, atau halaman ini dibuka dari " +
        "alamat yang tidak diizinkan backend (buka http://localhost:5173, lihat CORS_ORIGIN).",
    );
  }
  if (!res.ok) {
    // fetch TIDAK melempar galat untuk 401, 404, atau 500: kitalah yang memeriksa res.ok
    let pesan = "Terjadi gangguan (" + res.status + ").";
    try {
      const tubuh = await res.json();
      if (typeof tubuh?.pesan === "string") pesan = tubuh.pesan; // galat yang ditulis backend kita
      else if (typeof tubuh?.message === "string") pesan = tubuh.message; // galat bawaan Fastify: 400, 429, 500
    } catch {
      // jawabannya bukan JSON: pakai pesan bawaan di atas
    }
    throw new GalatApi(res.status, pesan);
  }
  // as T = "percayalah, isinya berbentuk T". TypeScript tidak memeriksa isi JSON saat halaman berjalan;
  // kita mengandalkan kontrak API backend (pemeriksaan sungguhan dengan Zod baru di Modul 24).
  return (await res.json()) as T;
}

// POST /auth/login. Kepala Content-Type JSON hanya dipasang pada permintaan yang memang membawa body JSON:
// POST yang mengaku JSON tetapi badannya kosong ditolak backend (400).
export function masuk(email: string, sandi: string): Promise<Pengguna> {
  return minta<Pengguna>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sandi }),
  });
}
