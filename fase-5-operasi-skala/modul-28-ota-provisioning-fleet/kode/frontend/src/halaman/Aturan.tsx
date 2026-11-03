// halaman/Aturan.tsx - layar /aturan: daftar aturan otomatis (GET /rules). Admin dan viewer sama-sama boleh melihat;
// tombol "+ Aturan baru" dan "Ubah" hanya untuk admin (Praktik 8).
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ambilAturan, GalatApi } from "../api";
import type { AturanLengkap } from "../aturan";
import DaftarAturan from "../components/DaftarAturan";
import { sesiHabis, useAdmin, useToko } from "../toko";

export default function HalamanAturan() {
  const admin = useAdmin();
  const versiAturan = useToko((s) => s.versiAturan); // naik setiap ada kejadian "aturan-diubah"
  const [aturan, setAturan] = useState<AturanLengkap[] | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);

  // Ambil daftar saat layar dibuka, dan ambil ulang setiap kali versiAturan berubah: aturan baru saja dibuat, diubah,
  // atau dihapus dari dashboard mana pun. Daftar lama tetap tampil sampai yang baru tiba (tidak berkedip "Memuat…").
  useEffect(() => {
    let ignore = false;
    ambilAturan()
      .then((daftar) => {
        if (ignore) return;
        setAturan(daftar);
        setGalat(null);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat aturan.");
      });
    return () => {
      ignore = true;
    };
  }, [versiAturan]);

  let isi;
  if (galat !== null) isi = <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  else if (aturan === null) isi = <p className="text-slate-600 dark:text-slate-400">Memuat aturan…</p>;
  else isi = <DaftarAturan aturan={aturan} />;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Aturan otomatis</h2>
        {/* tombol admin digambar HANYA kalau peran admin sudah pasti (useAdmin), jadi tidak berkedip di layar viewer */}
        {admin ? (
          <Link
            to="/aturan/baru"
            className="inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800"
          >
            + Aturan baru
          </Link>
        ) : null}
      </div>
      <p className="mt-1 mb-4 text-sm text-slate-600 dark:text-slate-300">
        Aturan dijalankan backend, walaupun dashboard ini tertutup: aturan angka dinilai setiap kali bacaan baru tiba,
        aturan jadwal berjalan pada jamnya (WIB).
      </p>
      {isi}
    </>
  );
}
