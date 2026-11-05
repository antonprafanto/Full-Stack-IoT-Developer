// waktu.ts - urusan jam di layar: jam WIB, "… detik yang lalu", batas data basi, label sumbu waktu, dan detak 1 detik.
import { formatDistanceStrict } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { Jenis } from "./types";

export const MENIT = 60 * 1000; // dalam milidetik, satuan yang dipakai Date.now()
export const JAM = 60 * MENIT;
export const HARI = 24 * JAM;
const WIB = 7 * JAM; // WIB = UTC + 7 jam sepanjang tahun (Indonesia tidak memakai jam musim panas)

// useSekarang - jam yang berdetak (pola useTime dari react.dev). Komponen yang memakainya digambar ulang tiap detik,
// jadi tulisan "12 detik yang lalu" ikut bertambah. Ini JAM, bukan polling: tidak ada permintaan ke server.
export function useSekarang(setiapMs = 1000): number {
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const pewaktu = setInterval(() => setSekarang(Date.now()), setiapMs);
    return () => clearInterval(pewaktu); // cleanup: hentikan detaknya saat komponen hilang dari layar
  }, [setiapMs]);
  return sekarang;
}

// "16.27.10 WIB", apa pun zona waktu laptop atau HP-nya (timeZone ditulis jelas, seperti di Modul 22)
export function jamWib(t: string | number): string {
  return new Date(t).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
}

// Pembentuk teks waktu dibuat SEKALI di sini, lalu dipakai ulang untuk setiap label grafik.
const JAM_MENIT = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
const HARI_TANGGAL = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "short", day: "numeric" });
const TANGGAL_JAM = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function jamMenitWib(t: number): string {
  return JAM_MENIT.format(t); // "16.27"
}

export function hariTanggalWib(t: number): string {
  return HARI_TANGGAL.format(t); // "Sab, 24"
}

export function tanggalJamWib(t: number): string {
  return TANGGAL_JAM.format(t) + " WIB"; // "Sab, 24 Okt, 16.00 WIB"
}

// jamRelatif - "45 detik yang lalu", "3 menit yang lalu" (date-fns dengan bahasa Indonesia).
// Di bawah 5 detik ditulis "baru saja": date-fns menulis "0 detik yang lalu", dan jam server yang sedikit lebih
// cepat dari jam HP bisa membuat selisihnya negatif ("dalam waktu 2 detik").
export function jamRelatif(t: number, sekarang: number): string {
  if (sekarang - t < 5000) return "baru saja";
  return formatDistanceStrict(t, sekarang, { locale: id, addSuffix: true });
}

// Kapan bacaan dianggap basi. Node 1 dan simulator mengirim tiap 10 detik: 30 detik tanpa kabar = 3 kiriman terlewat.
// Node 2 mengirim tiap 5 menit dan baru dianggap offline sesudah 16 menit (KONTRAK-DATA.md).
export function batasBasi(jenis: Jenis): number {
  return jenis === "node2" ? 16 * MENIT : 30 * 1000;
}

// ticksTiap - letak label sumbu waktu: setiap kelipatan "langkah" (menit, jam, atau hari menurut jam WIB) antara awal
// dan akhir. Tanpa daftar tetap ini, Recharts memilih letak label sendiri, dan labelnya melompat saat grafik bergeser.
export function ticksTiap(awal: number, akhir: number, langkah: number): number[] {
  const ticks: number[] = [];
  for (let t = Math.ceil((awal + WIB) / langkah) * langkah - WIB; t <= akhir; t += langkah) ticks.push(t);
  return ticks;
}
