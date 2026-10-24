// waktu.ts - urusan jam di layar: jam WIB, "… detik yang lalu", batas data basi, dan detak 1 detik.
import { formatDistanceStrict } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { Jenis } from "./types";

export const MENIT = 60 * 1000; // dalam milidetik, satuan yang dipakai Date.now()

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
