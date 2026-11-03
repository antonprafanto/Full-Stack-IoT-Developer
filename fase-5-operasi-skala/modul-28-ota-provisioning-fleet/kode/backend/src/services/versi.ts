// versi.ts - membandingkan nomor versi firmware SemVer x.y.z (Modul 28), tanpa paket tambahan.
// Kenapa tidak dibandingkan sebagai teks saja? Karena "1.10.0" < "1.9.0" kalau dibaca huruf demi huruf ("1" < "9"),
// padahal 1.10.0 lebih baru. Setiap bagian harus dibandingkan sebagai ANGKA, dari kiri: MAJOR, lalu MINOR, lalu PATCH.

const POLA = /^(\d+)\.(\d+)\.(\d+)$/; // sama dengan Versi di kontrak data: tanpa awalan "v" dan tanpa akhiran "-uji"

// Versi RILIS yang boleh diunggah dan diperintahkan (Modul 28): x.y.z tanpa nol di depan dan paling banyak 5 angka per
// bagian. "1.07.1" ditolak: sebagai angka ia sama dengan 1.7.1, tetapi sebagai teks berbeda, sehingga 304 "sudah memakai
// versi ini" (teks) dan bandingkanVersi() (angka) akan berselisih. Versi yang DILAPORKAN perangkat tetap memakai pola kontrak
// data di atas (firmware lama tidak boleh tiba-tiba ditolak). Pola yang sama ada di CHECK tabel firmware (migrasi 011).
export const POLA_VERSI_RILIS = /^(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})$/;

// Hasilnya negatif kalau a lebih lama dari b, 0 kalau sama, positif kalau a lebih baru (seperti pembanding sort()).
// Versi yang bentuknya salah adalah galat pemrograman, bukan data biasa: dilempar sebagai Error, tidak diam-diam dianggap 0.
export function bandingkanVersi(a: string, b: string): number {
  const x = POLA.exec(a);
  const y = POLA.exec(b);
  if (x === null || y === null) throw new Error(`versi harus berbentuk x.y.z, misalnya 1.7.1: "${x === null ? a : b}"`);
  for (let i = 1; i <= 3; i++) {
    const beda = Number(x[i]) - Number(y[i]);
    if (beda !== 0) return Math.sign(beda);
  }
  return 0;
}

// Versi tertinggi dari sebuah daftar, atau null kalau daftarnya kosong.
export function versiTertinggi(daftar: string[]): string | null {
  return daftar.reduce<string | null>((terbaik, v) => (terbaik === null || bandingkanVersi(v, terbaik) > 0 ? v : terbaik), null);
}
