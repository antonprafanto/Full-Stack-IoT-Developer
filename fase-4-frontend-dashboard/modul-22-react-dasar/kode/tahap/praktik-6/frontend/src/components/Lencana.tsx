// Lencana.tsx - lencana kecil berwarna untuk status dan kunci perangkat.
// Dipakai di daftar perangkat (Praktik 5) dan di judul detail perangkat (Praktik 6).
import type { StatusKunci, StatusPerangkat } from "../types";

// Kelas Tailwind ditulis UTUH di sini, bukan disambung ("bg-" + warna): Tailwind hanya membuat kelas yang tertulis lengkap.
const WARNA_STATUS: Record<StatusPerangkat, string> = {
  online: "bg-green-100 text-green-800",
  offline: "bg-slate-200 text-slate-700",
  "offline-mode": "bg-amber-100 text-amber-800",
  "belum-diketahui": "bg-slate-100 text-slate-500",
};

// Teks dan warna untuk setiap nilai kolom kunci (Modul 21).
const LENCANA_KUNCI: Record<StatusKunci, { teks: string; warna: string }> = {
  aktif: { teks: "kunci aktif", warna: "bg-teal-50 text-teal-800" },
  dicabut: { teks: "kunci dicabut", warna: "bg-red-600 text-white" }, // paling menonjol
  "tanpa-kunci": { teks: "lewat penghubung", warna: "bg-sky-50 text-sky-800" }, // Node 2: datanya diteruskan Node 1
  "belum-terdaftar": { teks: "belum terdaftar", warna: "bg-amber-100 text-amber-800" },
};

const BENTUK = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function LencanaStatus({ status }: { status: StatusPerangkat }) {
  return <span className={BENTUK + " " + WARNA_STATUS[status]}>{status}</span>;
}

export function LencanaKunci({ kunci }: { kunci: StatusKunci }) {
  const { teks, warna } = LENCANA_KUNCI[kunci];
  return <span className={BENTUK + " " + warna}>{teks}</span>;
}
