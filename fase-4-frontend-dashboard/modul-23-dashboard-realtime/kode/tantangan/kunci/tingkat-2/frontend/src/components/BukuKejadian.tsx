// BukuKejadian.tsx - Kunci Tantangan Tingkat 2 Modul 23: buku kejadian live.
// Setiap kali backend mencatat kejadian (perangkat online/offline, perintah, aturan, jadwal), acara "kejadian" tiba
// lewat Socket.IO ke SEMUA dashboard yang tersambung, lalu tampil di sini. Isinya hanya 10 kejadian terakhir SEJAK
// HALAMAN DIBUKA: backend tidak punya rute GET untuk kejadian lama, dan isinya hilang saat halaman dimuat ulang.
import { useEffect, useState } from "react";
import { socket } from "../soket";
import type { Kejadian } from "../types";
import { jamWib } from "../waktu";

const BATAS = 10; // kejadian yang disimpan; yang lebih lama dibuang

export default function BukuKejadian() {
  const [daftar, setDaftar] = useState<Kejadian[]>([]); // terbaru di depan

  // Berlangganan acara "kejadian" selama komponen ini tampil, berhenti di cleanup.
  useEffect(() => {
    // fungsi bernama: cleanup melepas PERSIS pendengar ini, bukan semua pendengar "kejadian"
    function onKejadian(k: Kejadian) {
      // larik BARU: kejadian baru di depan, lalu dipotong 10. Larik lama tidak diubah.
      setDaftar((lama) => [k, ...lama].slice(0, BATAS));
    }
    socket.on("kejadian", onKejadian);
    // StrictMode di mode dev: pasang, lepas, pasang lagi. Tetap hanya SATU pendengar, jadi tidak ada kejadian ganda.
    return () => {
      socket.off("kejadian", onKejadian);
    };
  }, []);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100">Kejadian terbaru</h2>
      {daftar.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Belum ada kejadian sejak halaman ini dibuka. Coba hentikan simulator (Ctrl + C) atau cabut USB Node 1, lalu
          nyalakan lagi.
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-700">
          {daftar.map((k) => (
            // id = nomor baris di tabel events backend, pasti unik
            <li key={k.id} className="flex flex-wrap gap-x-3 py-2">
              <span className="shrink-0 font-mono text-xs leading-5 text-slate-500 dark:text-slate-400">{jamWib(k.waktu)}</span>
              {/* pesan ditampilkan sebagai teks JSX biasa: kode HTML di dalamnya (misalnya dari nama perangkat) tidak dijalankan */}
              <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">{k.pesan}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
