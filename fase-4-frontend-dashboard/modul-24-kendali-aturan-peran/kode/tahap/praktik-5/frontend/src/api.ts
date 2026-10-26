// api.ts - satu pintu ke backend: semua permintaan ke API lewat fungsi minta() di berkas ini.
// Login memakai cookie HttpOnly dari backend (Modul 20). JavaScript tidak bisa membacanya; browser yang menyimpan
// dan mengirimkannya, asalkan setiap fetch membawa credentials: "include".
import { subMinutes } from "date-fns";
import { Ack } from "./skema/kontrak";
import type { PerintahSet } from "./skema/kontrak";
import type { Bacaan, DataRiwayat, JawabanBacaan, JawabanRingkasan, Pengguna, Perangkat, Rentang, TitikRingkasan } from "./types";

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
  // kita mengandalkan kontrak API backend. Modul 24: jawaban yang menentukan tombol kendali (ack) diperiksa sungguhan
  // dengan Zod di kirimPerintah() di bawah; jawaban lain tetap dipercaya lewat tipe.
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

// Modul 24: POST /devices/:id/command - kirim SATU perintah (khusus admin), lalu tunggu jawaban perangkat (ack) yang
// diteruskan backend, paling lama 5 detik. Jawaban 200 belum tentu berhasil: ack.ok bisa false (perangkat menolak,
// misalnya "pompa ditolak: air tandon kurang"). Galat lain datang sebagai GalatApi: 409 (offline, perintah sebelumnya
// masih menunggu, ...), 404, 503, 504 (tidak ada ack dalam 5 detik), 403 (akun viewer).
export async function kirimPerintah(deviceId: string, perintah: PerintahSet): Promise<Ack> {
  const jawaban = await minta<{ ack?: unknown }>("/devices/" + deviceId + "/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(perintah),
  });
  // Isi ack diperiksa dengan skema Ack yang SAMA dengan backend (salinan di skema/kontrak.ts), bukan sekadar dipercaya.
  // safeParse tidak melempar galat: hasilnya { success: true, data } atau { success: false, error }.
  const hasil = Ack.safeParse(jawaban.ack);
  if (!hasil.success) throw new GalatApi(200, "Jawaban server tidak dikenal.");
  return hasil.data;
}

// Modul 23: GET /devices/:id/readings?from=… = bacaan mentah sejak sekian menit lalu (isi awal grafik live).
export function ambilBacaanSejak(deviceId: string, menit: number): Promise<JawabanBacaan> {
  // toISOString() menulis waktu UTC berakhiran Z, misalnya 2026-10-24T03:10:00.000Z: aman ditaruh di alamat.
  // (Waktu berzona +07:00 harus ditulis %2B07:00, karena tanda + di alamat dibaca sebagai spasi.)
  const dari = subMinutes(new Date(), menit).toISOString();
  return minta<JawabanBacaan>("/devices/" + deviceId + "/readings?from=" + dari);
}

// satu bacaan mentah diubah ke bentuk titik ringkasan, supaya grafik, tabel, dan CSV cukup mengenal SATU bentuk
function keTitikRingkasan(b: Bacaan): TitikRingkasan {
  return {
    waktu: b.ts,
    suhu_rata: b.suhu,
    suhu_min: null, // satu bacaan tidak punya terendah dan tertinggi
    suhu_maks: null,
    kelembapan_rata: b.kelembapan,
    tanah_rata: b.tanah,
    cahaya_rata: b.cahaya,
    jumlah_bacaan: 1,
  };
}

// Modul 23: riwayat untuk layar Riwayat. Rentangnya memakai nilai bawaan API (tanpa from dan to):
// 1 jam = bacaan mentah, 24 jam = rata-rata per 15 menit (bucket=15m), 7 hari = rata-rata per jam (bucket=1h).
export async function ambilRiwayat(deviceId: string, rentang: Rentang): Promise<DataRiwayat> {
  const jalur = "/devices/" + deviceId + "/readings";
  if (rentang === "1jam") {
    const jawaban = await minta<JawabanBacaan>(jalur);
    return { dari: jawaban.dari, sampai: jawaban.sampai, titik: jawaban.bacaan.map(keTitikRingkasan) };
  }
  const bucket = rentang === "24jam" ? "15m" : "1h";
  const jawaban = await minta<JawabanRingkasan>(jalur + "?bucket=" + bucket);
  return { dari: jawaban.dari, sampai: jawaban.sampai, titik: jawaban.ringkasan };
}
