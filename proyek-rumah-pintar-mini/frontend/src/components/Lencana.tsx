// Lencana.tsx - lencana kecil berwarna untuk status dan kunci perangkat.
// Dipakai di kartu daftar perangkat dan di judul detail perangkat (keduanya dibuat di Modul 22), dan di layar Armada (Modul 28).
import type { StatusKunci, StatusPerangkat } from "../types";

// Kelas Tailwind ditulis UTUH di sini, bukan disambung ("bg-" + warna): Tailwind hanya membuat kelas yang tertulis lengkap.
// Modul 23: warna SELALU ditemani teks (online hijau "Online", offline merah "Offline"), supaya tetap terbaca oleh
// orang yang sulit membedakan merah dan hijau.
// Modul 28: offline-mode ditulis "berhenti sengaja" (dulu "mode offline"): perangkat sengaja menyala ulang, misalnya untuk
// memasang firmware baru. Kata "mode offline" sudah dipakai untuk hal lain: pengaman lokal Modul 19 saat broker tidak
// terjangkau. Warnanya biru langit (bukan merah): ini bukan gangguan, dan biasanya kembali Online dalam ±1 menit.
const LENCANA_STATUS: Record<StatusPerangkat, { teks: string; warna: string }> = {
  online: { teks: "Online", warna: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  offline: { teks: "Offline", warna: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  "offline-mode": { teks: "berhenti sengaja", warna: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100" },
  "belum-diketahui": { teks: "belum diketahui", warna: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

// Teks dan warna untuk setiap nilai kolom kunci (Modul 21).
const LENCANA_KUNCI: Record<StatusKunci, { teks: string; warna: string }> = {
  aktif: { teks: "kunci aktif", warna: "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200" },
  dicabut: { teks: "kunci dicabut", warna: "bg-red-600 text-white" }, // paling menonjol
  "tanpa-kunci": { teks: "lewat penghubung", warna: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200" }, // Node 2: datanya diteruskan Node 1
  "belum-terdaftar": { teks: "belum terdaftar", warna: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
};

const BENTUK = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function LencanaStatus({ status }: { status: StatusPerangkat }) {
  const { teks, warna } = LENCANA_STATUS[status];
  // title = keterangan yang muncul saat lencana disorot tetikus (Modul 28: arti "berhenti sengaja")
  const keterangan = status === "offline-mode" ? "Sedang menyala ulang dengan sengaja, misalnya untuk pembaruan firmware" : undefined;
  return (
    <span className={BENTUK + " " + warna} title={keterangan}>
      {teks}
    </span>
  );
}

export function LencanaKunci({ kunci }: { kunci: StatusKunci }) {
  const { teks, warna } = LENCANA_KUNCI[kunci];
  return <span className={BENTUK + " " + warna}>{teks}</span>;
}
