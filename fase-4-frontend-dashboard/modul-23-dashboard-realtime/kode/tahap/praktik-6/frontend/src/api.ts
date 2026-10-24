// api.ts - satu pintu ke backend: semua permintaan ke API lewat fungsi minta() di berkas ini.
// Login memakai cookie HttpOnly dari backend (Modul 20). JavaScript tidak bisa membacanya; browser yang menyimpan
// dan mengirimkannya, asalkan setiap fetch membawa credentials: "include".
import { subMinutes } from "date-fns";
import type { JawabanBacaan, Pengguna, Perangkat } from "./types";

// Alamat backend. Bawaan: nama host halaman ini + port 8080, jadi halaman http://localhost:5173 -> API http://localhost:8080.
// Nama host yang sama itu penting: cookie SameSite=Strict hanya ikut kalau halaman dan API satu situs
// (localhost dengan localhost, 127.0.0.1 dengan 127.0.0.1). Alamat lain bisa diatur lewat VITE_API_BASE di .env.local.
// Garis miring di ujung dibuang: "//auth/login" dijawab backend sebagai rute yang tidak dikenal (401).
// Modul 23: diekspor, karena soket.ts menyambung ke alamat yang SAMA (di HP: http://<IP-laptop>:8080).
export const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");

// Tiga loket /auth ini tidak pernah di-refresh: 401 dari login berarti sandinya memang salah, 401 dari refresh berarti
// kartu terusan sudah habis (refresh tidak boleh memanggil refresh lagi), dan logout memang terbuka tanpa gelang.
const TANPA_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"];

// Refresh yang sedang berjalan, dipakai bersama. Kalau beberapa permintaan kebetulan 401 bersamaan (misalnya efek
// yang dijalankan dua kali oleh StrictMode), backend tetap hanya diketuk SATU kali.
let refreshBerjalan: Promise<boolean | null> | null = null;

// Tukar "kartu terusan" (cookie sesi, 7 hari) dengan "gelang" baru (cookie akses, 15 menit). true = berhasil.
// Modul 23: diekspor untuk soket.ts, dan kini membedakan dua kegagalan: false = DITOLAK backend (401: kartu terusan
// habis atau sudah logout), null = backend sedang tidak bisa melayani (mati, tidak bisa dihubungi, atau gangguan lain).
export function refreshSekali(): Promise<boolean | null> {
  if (refreshBerjalan === null) {
    // tanpa body, jadi juga TANPA Content-Type JSON (kalau diberi, backend menjawab 400)
    refreshBerjalan = fetch(BASE + "/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => {
        if (res.ok) return true; // 200 = gelang baru sudah dipasang di browser
        if (res.status === 401) return false; // ditolak: kartu terusan habis atau sudah logout
        return null; // kode lain, misalnya 500 saat database mati: sesinya belum tentu habis
      })
      .catch(() => null) // fetch gagal total: backend mati atau tidak bisa dihubungi
      .finally(() => {
        refreshBerjalan = null; // selesai: lain kali boleh refresh lagi
      });
  }
  return refreshBerjalan;
}

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
// bolehUlang = boleh refresh lalu mengulang sekali; ulangan itu sendiri memakai false supaya tidak berputar tanpa akhir.
async function minta<T>(jalur: string, opsi: RequestInit = {}, bolehUlang = true): Promise<T> {
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
  // Gelang habis (401)? Refresh SEKALI, lalu ulangi permintaan ini SEKALI (janji Modul 20).
  // Kalau refresh juga gagal, 401 diteruskan ke layar, dan layar kembali ke formulir login.
  if (res.status === 401 && bolehUlang && !TANPA_REFRESH.includes(jalur) && (await refreshSekali())) {
    return minta<T>(jalur, opsi, false);
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

// GET /auth/me: "siapa saya?" Dijawab 401 kalau belum login.
export function siapaSaya(): Promise<Pengguna> {
  return minta<Pengguna>("/auth/me");
}

// POST /auth/logout: tanpa body, jadi juga TANPA Content-Type JSON (kalau diberi, backend menjawab 400).
export function keluar(): Promise<unknown> {
  return minta<unknown>("/auth/logout", { method: "POST" });
}

// GET /devices: daftar perangkat dari database backend
export function ambilPerangkat(): Promise<Perangkat[]> {
  return minta<Perangkat[]>("/devices");
}

// Modul 23: GET /devices/:id/readings?from=… = bacaan mentah sejak sekian menit lalu (isi awal grafik live).
export function ambilBacaanSejak(deviceId: string, menit: number): Promise<JawabanBacaan> {
  // toISOString() menulis waktu UTC berakhiran Z, misalnya 2026-10-24T03:10:00.000Z: aman ditaruh di alamat.
  // (Waktu berzona +07:00 harus ditulis %2B07:00, karena tanda + di alamat dibaca sebagai spasi.)
  const dari = subMinutes(new Date(), menit).toISOString();
  return minta<JawabanBacaan>("/devices/" + deviceId + "/readings?from=" + dari);
}
