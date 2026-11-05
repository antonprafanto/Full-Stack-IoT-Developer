// RiwayatPembaruan.tsx - riwayat pembaruan firmware satu perangkat (GET /devices/:id/pembaruan, Modul 28), di dalam kartu
// Armada. Tertutup sebagai bawaan (<details>), dan baru diambil dari server saat dibuka: layar Armada dengan banyak
// perangkat tidak perlu meminta riwayat semuanya sekaligus.
import { useEffect, useState } from "react";
import { ambilRiwayatPembaruan, GalatApi } from "../api";
import { TEKS_PEMBARUAN } from "../armada";
import { sesiHabis } from "../toko";
import type { Pembaruan } from "../types";
import { tanggalJamWib } from "../waktu";

type Props = {
  deviceId: string;
  versi: string; // berubah setiap kali pembaruan terakhir berubah: riwayat yang sedang terbuka diambil ulang
};

export default function RiwayatPembaruan({ deviceId, versi }: Props) {
  const [buka, setBuka] = useState(false);
  const [riwayat, setRiwayat] = useState<Pembaruan[] | null>(null); // null = belum dimuat
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (!buka) return; // tertutup: tidak meminta apa pun
    let ignore = false;
    ambilRiwayatPembaruan(deviceId)
      .then((daftar) => {
        if (ignore) return;
        setRiwayat(daftar);
        setGalat(null);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat riwayat pembaruan.");
      });
    return () => {
      ignore = true;
    };
  }, [buka, deviceId, versi]);

  let isi;
  if (galat !== null) isi = <p className="text-red-700 dark:text-red-300">{galat}</p>;
  else if (riwayat === null) isi = <p className="text-slate-600 dark:text-slate-400">Memuat riwayat…</p>;
  else if (riwayat.length === 0) isi = <p className="text-slate-600 dark:text-slate-400">Belum pernah diperbarui lewat udara.</p>;
  else {
    isi = (
      <ol className="space-y-1">
        {riwayat.map((r) => (
          <li key={r.id} className="break-words">
            <span className="font-mono">
              {r.dari ?? "?"} → {r.ke}
            </span>{" "}
            <span className="font-medium">{TEKS_PEMBARUAN[r.status].teks}</span>
            <span className="text-slate-600 dark:text-slate-400">
              {" "}
              · {tanggalJamWib(Date.parse(r.dibuat))}
              {r.pesan !== null ? " · " + r.pesan : ""}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    // onToggle: dipanggil browser setiap kali <details> dibuka atau ditutup
    <details className="mt-2 text-sm" onToggle={(e) => setBuka(e.currentTarget.open)}>
      {/* py-3: tinggi ±44 px, mudah diketuk jempol (tanpa flex, supaya segitiga buka-tutup bawaan browser tetap tampil) */}
      <summary className="cursor-pointer py-3 font-medium text-teal-700 dark:text-teal-300">
        Riwayat pembaruan
      </summary>
      <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-800 dark:bg-slate-900 dark:text-slate-200">{isi}</div>
    </details>
  );
}
