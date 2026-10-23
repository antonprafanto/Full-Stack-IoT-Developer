// DaftarPerangkat.tsx - mengambil GET /devices, lalu menampilkannya sebagai kartu-kartu perangkat yang bisa diketuk.
// Tiga keadaan selalu disiapkan: memuat, galat, dan kosong (pola yang dipakai setiap layar yang mengambil data).
import { useEffect, useState } from "react";
import { ambilPerangkat, GalatApi } from "../api";
import type { Perangkat } from "../types";
import { LencanaKunci, LencanaStatus } from "./Lencana";

type Props = {
  onPilih: (perangkat: Perangkat) => void; // dipanggil saat satu perangkat diketuk
  onSesiHabis: () => void; // dipanggil kalau backend menjawab 401 (sesudah refresh pun gagal)
};

export default function DaftarPerangkat({ onPilih, onSesiHabis }: Props) {
  const [perangkat, setPerangkat] = useState<Perangkat[] | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);

  // Ambil data SESUDAH layar tampil. Di mode pengembangan, StrictMode menjalankan efek ini dua kali (normal).
  // [onSesiHabis] di akhir efek: efek ini memakai fungsi titipan App itu, jadi wajib ditulis (npm run lint
  // memperingatkan kalau terlupa). Selama daftar tampil, state App tidak berubah, jadi efek tidak diulang.
  useEffect(() => {
    let ignore = false; // menjadi true saat efek dibereskan: jawaban yang datang terlambat diabaikan
    ambilPerangkat()
      .then((daftar) => {
        if (!ignore) setPerangkat(daftar);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat perangkat.");
      });
    return () => {
      ignore = true; // cleanup: dijalankan React sebelum efek diulang atau saat komponen ini hilang dari layar
    };
  }, [onSesiHabis]);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700">{galat}</p>;
  if (perangkat === null) return <p className="text-slate-500">Memuat perangkat…</p>;
  if (perangkat.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600">Belum ada perangkat terdaftar (pendaftaran perangkat: Modul 21).</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {perangkat.map((p) => (
        // key = tanda pengenal tiap butir daftar; device_id pasti unik
        <li key={p.device_id}>
          {/* seluruh kartu adalah tombol; objek perangkat utuh dititipkan ke App lewat onPilih */}
          <button
            type="button"
            onClick={() => onPilih(p)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-400 hover:shadow-md"
          >
            <span className="flex items-center justify-between gap-2">
              {/* nama dan lokasi diisi admin lewat API; JSX menampilkannya sebagai teks biasa, jadi kode HTML di dalamnya tidak dijalankan (aman dari XSS) */}
              <span className="font-semibold text-slate-800">{p.nama ?? p.device_id}</span>
              <span className="flex gap-1">
                {/* kunci dicabut atau belum terdaftar = backend mengabaikan kirimannya, jadi status lamanya
                    (bisa masih "online") menyesatkan dan tidak ditampilkan */}
                {p.kunci === "dicabut" || p.kunci === "belum-terdaftar" ? null : <LencanaStatus status={p.status} />}
                <LencanaKunci kunci={p.kunci} />
              </span>
            </span>
            <span className="mt-1 block text-sm text-slate-500">
              {p.lokasi ?? "lokasi belum diisi"} · <span className="font-mono">{p.device_id}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
