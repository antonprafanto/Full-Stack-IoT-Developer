// TombolKonfirmasi.tsx - tombol yang bertanya "yakin?" dulu sebelum mengerjakan sesuatu yang sulit dibatalkan (Modul 28:
// Perbarui firmware, Perbarui canary/semua, Nonaktifkan). Polanya sama dengan KonfirmasiHapus (Modul 24): kotak
// pertanyaannya bagian dari halaman, bukan jendela confirm() browser; tombol Batal langsung difokus, dan sesudah Batal
// (atau sesudah selesai) fokus kembali ke tombol semula, jadi pengguna keyboard tidak terlempar ke awal halaman.
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  label: string; // teks tombol, misalnya "Perbarui"
  judul: string; // pertanyaannya, misalnya "Perbarui Node 1 garasi ke 1.7.1?"
  children: ReactNode; // penjelasan (dan kolom tambahan, misalnya centang "paksa") di dalam kotak
  labelYa: string; // misalnya "Ya, perbarui"
  onYa: () => Promise<void>; // pekerjaannya; kotak tertutup sesudah selesai (berhasil atau gagal)
  bahaya?: boolean; // true = tombol merah (Nonaktifkan)
  alasanMati?: string | null; // terisi = tombol tidak bisa dipakai, kalimat ini tampil di bawahnya
  // kelas pembungkus. "contents" = pembungkusnya seolah tidak ada: tombol ikut baris flex pemiliknya (misalnya di samping
  // pilihan versi), sedangkan kalimat alasan dan kotak "yakin?" (basis-full) turun ke baris sendiri di bawahnya
  bungkus?: string;
};

const TOMBOL_BIASA =
  "min-h-11 rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50";
const TOMBOL_BAHAYA =
  "min-h-11 rounded-lg border border-red-600 px-4 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950";

export default function TombolKonfirmasi(props: Props) {
  const { label, judul, children, labelYa, onYa, bahaya = false, alasanMati = null, bungkus = "min-w-0" } = props;
  const [yakin, setYakin] = useState(false); // kotak "yakin?" sedang tampil
  const [sibuk, setSibuk] = useState(false); // true selama pekerjaannya berjalan (tombol "Ya" tidak bisa diketuk dua kali)
  const tombol = useRef<HTMLButtonElement>(null);
  const kalimatMati = useRef<HTMLParagraphElement>(null);
  const fokusTertunda = useRef(false); // true sesudah kotak ditutup: fokus belum mendarat di tombol yang masih bisa dipakai
  const id = useId(); // id unik untuk aria-labelledby: di satu layar bisa ada banyak tombol seperti ini
  const mati = alasanMati !== null;

  // Tombol yang MATI (disabled) tidak bisa difokus. Sesudah "Ya, perbarui", tombol Perbarui biasanya langsung mati
  // ("Pembaruan sebelumnya masih berjalan"): fokus pindah ke kalimat alasannya, bukan jatuh ke awal halaman.
  function tutup() {
    setYakin(false);
    if (tombol.current !== null && !tombol.current.disabled) tombol.current.focus();
    else kalimatMati.current?.focus();
    fokusTertunda.current = true;
    setTimeout(() => {
      fokusTertunda.current = false;
    }, 3000);
  }
  // tombol baru mati SESUDAH kotak ditutup (kabar live tiba belakangan): pindahkan fokus sekali, hanya untuk tombol ini
  useEffect(() => {
    if (mati && fokusTertunda.current) {
      fokusTertunda.current = false;
      kalimatMati.current?.focus();
    }
  }, [mati]);

  async function ya() {
    setSibuk(true);
    try {
      await onYa(); // pesan berhasil atau galatnya ditampilkan oleh pemilik tombol (toast)
    } finally {
      setSibuk(false);
      tutup();
    }
  }

  return (
    <div className={bungkus}>
      <button
        ref={tombol}
        type="button"
        disabled={mati}
        aria-describedby={mati ? id + "-mati" : undefined}
        onClick={() => setYakin(true)}
        className={bahaya ? TOMBOL_BAHAYA : TOMBOL_BIASA}
      >
        {label}
      </button>
      {mati ? (
        <p ref={kalimatMati} tabIndex={-1} id={id + "-mati"} className="mt-1 basis-full text-xs text-slate-600 dark:text-slate-400">
          {alasanMati}
        </p>
      ) : null}
      {yakin ? (
        // role="alertdialog": pembaca layar membacakan judul dan isinya begitu fokus pindah ke tombol Batal
        <div
          role="alertdialog"
          aria-labelledby={id + "-judul"}
          aria-describedby={id + "-isi"}
          className={
            "mt-2 basis-full rounded-lg border p-3 text-sm " +
            (bahaya
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              : "border-teal-300 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-50")
          }
        >
          <p id={id + "-judul"} className="font-medium break-words">
            {judul}
          </p>
          <div id={id + "-isi"} className="mt-1">
            {children}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={ya}
              disabled={sibuk}
              className={
                "min-h-11 rounded-lg px-4 font-medium text-white disabled:opacity-60 " +
                (bahaya ? "bg-red-700 hover:bg-red-800" : "bg-teal-700 hover:bg-teal-800")
              }
            >
              {sibuk ? "Mengirim…" : labelYa}
            </button>
            <button
              type="button"
              autoFocus
              onClick={tutup}
              disabled={sibuk}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Batal
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
