// halaman/Armada.tsx - layar /armada (Modul 28): semua perangkat terdaftar dengan versi firmware, kesehatan, dan pembaruan
// terakhirnya; rilis firmware di server; dan (khusus admin) unggah firmware, pembaruan lewat udara (OTA), dan kode klaim
// untuk perangkat baru. Admin dan viewer sama-sama boleh melihat; tombolnya hanya digambar untuk admin (pola layar Aturan).
// Data LIVE tanpa polling: status, versi dari telemetry, dan kemajuan pembaruan datang lewat Socket.IO (toko); data lain
// diambil ulang hanya saat ada kabar dari server (versiArmada naik).
import { useEffect, useState } from "react";
import { ambilArmada, ambilRilis, GalatApi } from "../api";
import BuatKodeKlaim from "../components/BuatKodeKlaim";
import DaftarRilis from "../components/DaftarRilis";
import KartuArmada from "../components/KartuArmada";
import UnggahFirmware from "../components/UnggahFirmware";
import { sesiHabis, useAdmin, useToko } from "../toko";
import type { DaftarRilis as Rilis, DataArmada } from "../types";

const JUDUL_BAGIAN = "text-base font-semibold text-slate-800 dark:text-slate-100";

// fungsi biasa (bukan di dalam komponen): fungsi yang SAMA selamanya, aman diberikan ke banyak kartu
function muatUlang() {
  useToko.getState().armadaBerubah();
}

export default function HalamanArmada() {
  const admin = useAdmin();
  const versiArmada = useToko((s) => s.versiArmada); // naik saat pembaruan selesai, perangkat baru, dinonaktifkan, ...
  const [data, setData] = useState<DataArmada | null>(null); // null = masih memuat
  const [rilis, setRilis] = useState<Rilis | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  // Ambil armada dan daftar rilis BERSAMAAN (Promise.all) saat layar dibuka dan setiap kali versiArmada naik. Data lama
  // tetap tampil sampai yang baru tiba (tidak berkedip "Memuat…").
  useEffect(() => {
    let ignore = false;
    Promise.all([ambilArmada(), ambilRilis()])
      .then(([armada, daftarRilis]) => {
        if (ignore) return;
        setData(armada);
        setRilis(daftarRilis);
        setGalat(null);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat armada.");
      });
    return () => {
      ignore = true;
    };
  }, [versiArmada]);

  if (galat !== null && data === null) {
    return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  }
  if (data === null || rilis === null) return <p className="text-slate-600 dark:text-slate-400">Memuat armada…</p>;

  const terbaru = data.rilis_terbaru.node1;
  const aktif = data.perangkat.filter((p) => p.kunci !== "dicabut");
  const perlu = aktif.filter((p) => p.perlu_update).length;

  return (
    <>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Armada</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {aktif.length} perangkat aktif
        {data.perangkat.length > aktif.length ? " (+" + (data.perangkat.length - aktif.length) + " nonaktif)" : ""} · rilis terbaru Node 1:{" "}
        <span className="font-mono">{terbaru ?? "belum ada"}</span>
        {perlu > 0 ? " · " + perlu + " perlu diperbarui" : ""}
      </p>
      {galat !== null ? (
        // gagal mengambil ULANG: data lama tetap tampil, dengan peringatan bahwa mungkin sudah basi
        <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {galat} Data di bawah mungkin sudah basi.
        </p>
      ) : null}
      {admin && !data.pengaturan.ota_siap ? (
        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          ALAMAT_SERVER di <span className="font-mono">.env</span> server belum diisi: tombol Perbarui belum bisa dipakai, karena
          perangkat tidak tahu dari mana mengunduh firmware.
        </p>
      ) : null}

      <section aria-labelledby="judul-perangkat" className="mt-4">
        <h3 id="judul-perangkat" className={JUDUL_BAGIAN}>
          Perangkat
        </h3>
        {data.perangkat.length === 0 ? (
          <p className="mt-2 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Belum ada perangkat terdaftar.{admin ? " Buat kode klaim di bawah untuk mendaftarkan perangkat baru." : ""}
          </p>
        ) : (
          <ul className="mt-2 grid gap-3">
            {data.perangkat.map((p) => (
              <li key={p.device_id} className="min-w-0">
                <KartuArmada p={p} rilis={rilis.rilis} terbaru={terbaru} otaSiap={data.pengaturan.ota_siap} onBerubah={muatUlang} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="judul-rilis" className="mt-6">
        <h3 id="judul-rilis" className={JUDUL_BAGIAN}>
          Rilis firmware
        </h3>
        <p className="mt-1 mb-2 text-sm text-slate-600 dark:text-slate-300">
          Berkas firmware hanya bisa diunduh perangkat terdaftar dengan kuncinya sendiri. Server yang memutuskan kapan perangkat
          diperbarui: canary dulu, baru semua.
        </p>
        <div className="grid gap-3">
          {admin ? <UnggahFirmware onSelesai={muatUlang} /> : null}
          <DaftarRilis daftar={rilis} admin={admin} onBerubah={muatUlang} />
        </div>
      </section>

      {admin ? (
        <section aria-labelledby="judul-baru" className="mt-6">
          <h3 id="judul-baru" className={JUDUL_BAGIAN}>
            Perangkat baru
          </h3>
          <div className="mt-2">
            <BuatKodeKlaim />
          </div>
        </section>
      ) : (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Akunmu viewer: kamu bisa melihat armada, tetapi unggah firmware, pembaruan, kode klaim, dan menonaktifkan perangkat khusus
          admin.
        </p>
      )}
    </>
  );
}
