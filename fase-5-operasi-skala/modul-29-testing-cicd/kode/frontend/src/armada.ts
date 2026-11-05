// armada.ts - pembantu layar Armada (Modul 28): teks dan warna untuk status pembaruan dan alasan menyala ulang, cara
// menulis ukuran berkas, sinyal WiFi, RAM, dan lama menyala, serta alasan tombol Perbarui belum bisa dipakai.
// Isinya fungsi dan tabel biasa (bukan komponen), supaya kartu perangkat dan daftar rilis tetap pendek.
import { GalatApi } from "./api";
import { toast } from "./toast";
import { sesiHabis } from "./toko";
import type { BarisArmada, Pembaruan, ResetReason, StatusPembaruan, StatusPerangkat } from "./types";

// Satu rak program (app0 atau app1) skema Minimal SPIFFS (Modul 10): 0x1E0000 = 1.966.080 byte. Berkas firmware yang
// lebih besar tidak muat di rak cadangan, jadi ditolak backend (400); layar ini menolaknya lebih dulu, sebelum diunggah.
export const RAK_PROGRAM = 1_966_080;

// Kelas Tailwind ditulis UTUH (bukan disambung), seperti di Lencana.tsx: Tailwind hanya membuat kelas yang tertulis lengkap.
const BIRU = "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100";
const HIJAU = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
const KUNING = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
const MERAH = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
const ABU = "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

// Status pembaruan: warna SELALU ditemani teks (tetap terbaca oleh orang yang sulit membedakan warna).
export const TEKS_PEMBARUAN: Record<StatusPembaruan, { teks: string; warna: string }> = {
  dikirim: { teks: "dikirim, menunggu perangkat", warna: BIRU },
  diterima: { teks: "diterima perangkat", warna: BIRU }, // ack = perintah DITERIMA, belum selesai
  mengunduh: { teks: "mengunduh", warna: BIRU },
  berhasil: { teks: "berhasil", warna: HIJAU },
  rollback: { teks: "kembali ke versi lama (rollback)", warna: KUNING }, // firmware baru gagal, perangkat selamat
  gagal: { teks: "gagal", warna: MERAH },
  ditolak: { teks: "ditolak perangkat", warna: KUNING },
  kedaluwarsa: { teks: "kedaluwarsa (tanpa kabar)", warna: ABU },
};

// tiga status yang berarti "masih berjalan": selama itu perintah pembaruan kedua untuk perangkat yang sama ditolak (409)
export function sedangBerjalan(p: Pembaruan | null): boolean {
  return p !== null && (p.status === "dikirim" || p.status === "diterima" || p.status === "mengunduh");
}

// Alasan perangkat terakhir kali menyala (kontrak 1.6 bagian 6). Merah = ada yang salah di firmware; kuning = catu daya.
export const ARTI_RESET: Record<ResetReason, { arti: string; warna: string }> = {
  POWERON: { arti: "listrik baru masuk atau tombol EN", warna: ABU },
  BROWNOUT: { arti: "tegangan sempat turun: periksa catu daya", warna: KUNING },
  SW: { arti: "dinyalakan ulang program (pembaruan, rollback, restart)", warna: BIRU },
  PANIC: { arti: "program mogok", warna: MERAH },
  WDT: { arti: "program macet (watchdog)", warna: MERAH },
  DEEPSLEEP: { arti: "bangun dari tidur dalam", warna: ABU },
  UNKNOWN: { arti: "alasan lain", warna: ABU },
};

const ANGKA = new Intl.NumberFormat("id-ID"); // 1234567 -> "1.234.567"

// "1.234.567 byte (63 % rak)": ukuran berkas firmware dibandingkan satu rak program
export function teksUkuran(byte: number): string {
  return ANGKA.format(byte) + " byte (" + Math.round((byte / RAK_PROGRAM) * 100) + " % rak)";
}

// kekuatan sinyal WiFi, dengan kategori tabel RSSI Modul 10 (Konsep 2)
export function teksSinyal(rssi: number): string {
  let kategori = "sangat lemah";
  if (rssi >= -55) kategori = "sangat kuat";
  else if (rssi >= -67) kategori = "kuat";
  else if (rssi >= -75) kategori = "cukup";
  else if (rssi >= -85) kategori = "lemah";
  return rssi + " dBm (" + kategori + ")";
}

// RAM bebas: byte -> KB (1 KB = 1.024 byte, cara ESP-IDF menghitung)
export function teksRam(byte: number): string {
  return ANGKA.format(Math.round(byte / 1024)) + " KB bebas";
}

// lama menyala: 93784 detik -> "1 hari 2 jam"; dua satuan terbesar saja, supaya pendek
export function teksLamaMenyala(detik: number): string {
  const hari = Math.floor(detik / 86400);
  const jam = Math.floor((detik % 86400) / 3600);
  const menit = Math.floor((detik % 3600) / 60);
  if (hari > 0) return hari + " hari " + jam + " jam";
  if (jam > 0) return jam + " jam " + menit + " menit";
  if (menit > 0) return menit + " menit";
  return detik + " detik";
}

// Kenapa tombol Perbarui SATU perangkat belum bisa dipakai (null = bisa). Server memeriksa hal yang sama (409) dan
// lebih lengkap (versi sama, turun versi, rilis ditarik); di sini cukup yang terlihat sebelum tombol diketuk, seperti
// alasanTombolMati() di DetailPerangkat (Modul 24). status dan pembaruan = nilai LIVE dari toko, bukan dari GET /armada.
export function alasanTidakBisaPerbarui(
  p: BarisArmada,
  status: StatusPerangkat,
  pembaruan: Pembaruan | null,
  otaSiap: boolean,
  adaRilis: boolean,
): string | null {
  if (p.kunci === "dicabut") return "Perangkat ini sudah dinonaktifkan.";
  if (p.jenis === "node2") return "Node 2 (ESP-NOW) tidak bisa diperbarui lewat udara: perbarui lewat kabel.";
  if (p.jenis !== "node1") return "Jenis perangkat belum diketahui: tunggu kiriman pertamanya.";
  if (!otaSiap) return "ALAMAT_SERVER di .env server belum diisi: perangkat tidak tahu dari mana mengunduh firmware.";
  if (!adaRilis) return "Belum ada firmware yang diunggah.";
  if (sedangBerjalan(pembaruan)) return "Pembaruan sebelumnya masih berjalan.";
  if (status !== "online") return "Perangkat tidak online: perintah pembaruan hanya dikirim ke perangkat online (tidak diantre).";
  return null;
}

// Kalimat galat sebuah tombol armada, atau null bila sesi habis (401, refresh pun gagal: kembali ke layar Masuk).
// Pesannya dari backend (GalatApi), misalnya "perangkat sedang offline: perintah update hanya dikirim ke perangkat online",
// atau 503 Nonaktifkan "belum tersimpan di database ... ulangi langkah ini sebentar lagi".
export function pesanGalat(err: unknown, cadangan: string): string | null {
  if (err instanceof GalatApi && err.kode === 401) {
    sesiHabis();
    return null;
  }
  return err instanceof GalatApi ? err.message : cadangan;
}

// Galat menjadi toast merah (4 detik). Dipakai Buat kode klaim. Tombol di kartu perangkat dan kartu rilis memakai
// KotakGalat (tetap tampil sampai Tutup), karena pesannya bisa panjang dan penting.
export function laporGalat(err: unknown, cadangan: string) {
  const pesan = pesanGalat(err, cadangan);
  if (pesan !== null) toast(pesan, "galat");
}
