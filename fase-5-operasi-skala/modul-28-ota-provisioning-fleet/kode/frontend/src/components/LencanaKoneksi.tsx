// LencanaKoneksi.tsx - lencana keadaan sambungan live di kepala dashboard: Live, Menyambung ulang…, atau Terputus.
// Angka yang tidak lagi diperbarui harus tampak basi, dan lencana inilah tanda pertamanya.
import { useToko } from "../toko";
import type { Koneksi } from "../toko";

const LENCANA: Record<Koneksi, { teks: string; warna: string }> = {
  live: { teks: "Live", warna: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  menyambung: { teks: "Menyambung ulang…", warna: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
  terputus: { teks: "Terputus", warna: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
};

export default function LencanaKoneksi() {
  // selektor: ambil SATU nilai dari toko. Lencana ini hanya digambar ulang kalau nilai itu berubah.
  const koneksi = useToko((s) => s.koneksi);
  const { teks, warna } = LENCANA[koneksi];
  return <span className={"rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " + warna}>{teks}</span>;
}
