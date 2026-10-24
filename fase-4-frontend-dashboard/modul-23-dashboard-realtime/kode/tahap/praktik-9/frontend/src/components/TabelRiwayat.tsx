// TabelRiwayat.tsx - isi riwayat sebagai tabel, terbaru dulu, 24 baris per halaman. Halamannya dibagi di browser:
// datanya sudah lengkap di tangan (±360 baris untuk 1 jam bacaan tiap 10 detik, ditambah kiriman segera; batas API 1.000).
import { useState } from "react";
import type { TitikRingkasan } from "../types";
import { jamWib, tanggalJamWib } from "../waktu";

const PER_HALAMAN = 24;

type Props = {
  titik: TitikRingkasan[]; // urut dari yang terlama, seperti jawaban API
  mentah: boolean; // true = bacaan mentah (1 jam): tidak ada kolom terendah-tertinggi dan jumlah bacaan
};

// angka di layar memakai titik desimal, seperti di kartu sensor; null = "—"
function angka(nilai: number | null): string {
  return nilai === null ? "—" : String(nilai);
}

export default function TabelRiwayat({ titik, mentah }: Props) {
  const [halaman, setHalaman] = useState(1);
  const terbaruDulu = [...titik].reverse(); // salinan yang dibalik: urutan asli (lama -> baru) tidak diubah
  const jumlahHalaman = Math.max(1, Math.ceil(terbaruDulu.length / PER_HALAMAN));
  const baris = terbaruDulu.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN);
  const sel = "px-3 py-2 text-right whitespace-nowrap";
  const tombol =
    "min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50 disabled:opacity-40 " +
    "dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700";

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Tabel (terbaru dulu)</h3>
      {/* overflow-x-auto: di HP, tabel yang lebar digeser di dalam kotaknya sendiri; halamannya tidak ikut bergeser */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-200">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-2 text-left whitespace-nowrap">Waktu</th>
              <th className={sel}>Suhu °C</th>
              {mentah ? null : <th className={sel}>Terendah–tertinggi</th>}
              <th className={sel}>Kelembapan %</th>
              <th className={sel}>Tanah %</th>
              <th className={sel}>Cahaya</th>
              {mentah ? null : <th className={sel}>Bacaan</th>}
            </tr>
          </thead>
          <tbody>
            {baris.map((p) => (
              <tr key={p.waktu} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="px-3 py-2 whitespace-nowrap">{mentah ? jamWib(p.waktu) : tanggalJamWib(Date.parse(p.waktu))}</td>
                <td className={sel}>{angka(p.suhu_rata)}</td>
                {mentah ? null : (
                  <td className={sel}>
                    {angka(p.suhu_min)}–{angka(p.suhu_maks)}
                  </td>
                )}
                <td className={sel}>{angka(p.kelembapan_rata)}</td>
                <td className={sel}>{angka(p.tanah_rata)}</td>
                <td className={sel}>{angka(p.cahaya_rata)}</td>
                {mentah ? null : <td className={sel}>{p.jumlah_bacaan}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
        <button type="button" className={tombol} disabled={halaman === 1} onClick={() => setHalaman(halaman - 1)}>
          ← Sebelumnya
        </button>
        <span>
          Halaman {halaman} dari {jumlahHalaman}
        </span>
        <button type="button" className={tombol} disabled={halaman === jumlahHalaman} onClick={() => setHalaman(halaman + 1)}>
          Berikutnya →
        </button>
      </div>
    </section>
  );
}
