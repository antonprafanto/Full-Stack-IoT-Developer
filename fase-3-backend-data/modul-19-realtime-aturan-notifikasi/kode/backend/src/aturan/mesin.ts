// mesin.ts - "otak" aturan otomatis (Modul 19), berupa fungsi MURNI: tidak membaca jam, database, atau MQTT sendiri.
// Semua yang dibutuhkan datang lewat argumen, jadi masukan yang sama selalu memberi hasil yang sama (mudah diuji).
import type { KondisiAmbang } from "../schemas/aturan.ts";

// Ingatan satu aturan ambang dari bacaan ke bacaan.
export interface Ingatan {
  aktif: boolean; // aturan sedang "menyala" (misalnya kipas seharusnya menyala)?
  sejak: number | null; // kapan bacaan mulai berada di atas ambang nyala (milidetik); null = tidak sedang menunggu
  terakhir: number | null; // kapan bacaan terakhir dinilai (milidetik)
}

export const INGATAN_AWAL: Ingatan = { aktif: false, sejak: null, terakhir: null };
export const JEDA_MAKS_MS = 60_000; // bacaan berjarak lebih dari 60 detik: hitungan "selama" diulang dari nol

export type Keputusan = "nyalakan" | "padamkan" | null; // null = tidak ada yang perlu dikerjakan

// Nilai satu bacaan. sekarang = jam saat bacaan tiba (milidetik, seperti Date.now()), diberikan oleh pemanggil.
// Keputusan hanya keluar saat aturan BERGANTI keadaan (di tepi), bukan di setiap bacaan.
export function nilaiAmbang(k: KondisiAmbang, ingatan: Ingatan, nilai: number | null, sekarang: number):
  { ingatan: Ingatan; keputusan: Keputusan } {
  const terputus = ingatan.terakhir !== null && sekarang - ingatan.terakhir > JEDA_MAKS_MS;
  const dasar: Ingatan = { ...ingatan, terakhir: sekarang, sejak: terputus ? null : ingatan.sejak };
  if (nilai === null) { // sensor gagal dibaca: jangan memutuskan apa pun, dan hitungan "selama" diulang
    return { ingatan: { ...dasar, sejak: null }, keputusan: null };
  }
  if (!dasar.aktif) {
    if (nilai <= k.nyala_di_atas) return { ingatan: { ...dasar, sejak: null }, keputusan: null }; // belum panas
    const sejak = dasar.sejak ?? sekarang; // bacaan panas pertama memulai hitungan
    if (sekarang - sejak >= k.selama_detik * 1000) {
      return { ingatan: { ...dasar, aktif: true, sejak: null }, keputusan: "nyalakan" };
    }
    return { ingatan: { ...dasar, sejak }, keputusan: null }; // panas, tetapi belum cukup lama: menunggu
  }
  if (nilai < k.padam_di_bawah) return { ingatan: { ...dasar, aktif: false, sejak: null }, keputusan: "padamkan" };
  return { ingatan: dasar, keputusan: null }; // masih di atas ambang padam (di dalam celah histeresis): tetap menyala
}

// Debouncing notifikasi: kabari saat situasi berubah, dan selama masih bahaya ingatkan paling sering 30 menit sekali.
export type Situasi = "aman" | "bahaya";

export interface CatatanKabar {
  situasi: Situasi; // situasi yang terakhir dikabarkan
  terakhirDikirim: number | null; // kapan pesan terakhir dikirim (milidetik)
}

export const CATATAN_AWAL: CatatanKabar = { situasi: "aman", terakhirDikirim: null };
export const PENGINGAT_MS = 30 * 60_000;

export function perluKabari(c: CatatanKabar, baru: Situasi, sekarang: number): { kirim: boolean; catatan: CatatanKabar } {
  if (baru !== c.situasi) return { kirim: true, catatan: { situasi: baru, terakhirDikirim: sekarang } }; // berubah
  if (baru === "bahaya" && c.terakhirDikirim !== null && sekarang - c.terakhirDikirim >= PENGINGAT_MS) {
    return { kirim: true, catatan: { ...c, terakhirDikirim: sekarang } }; // pengingat
  }
  return { kirim: false, catatan: c }; // diam
}
