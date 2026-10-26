// Riwayat.tsx - layar riwayat satu perangkat: pilih rentang (1 jam / 24 jam / 7 hari), lalu lihat grafik, tabel
// berhalaman, dan unduh CSV. Satu rentang = SATU permintaan ke API; sisanya (celah, halaman, CSV) dikerjakan browser.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ambilRiwayat, GalatApi } from "../api";
import { keCsv, unduhCsv, waktuCsv } from "../csv";
import type { DataRiwayat, Perangkat, Rentang } from "../types";
import GrafikRiwayat from "./GrafikRiwayat";
import Pemilih from "./Pemilih";
import TabelRiwayat from "./TabelRiwayat";

const PILIHAN: { nilai: Rentang; teks: string }[] = [
  { nilai: "1jam", teks: "1 jam" },
  { nilai: "24jam", teks: "24 jam" },
  { nilai: "7hari", teks: "7 hari" },
];

// apa arti satu titik di setiap rentang (nilai bawaan API backend Modul 18)
const KETERANGAN: Record<Rentang, string> = {
  "1jam": "Bacaan mentah 1 jam terakhir (satu titik = satu kiriman)",
  "24jam": "Rata-rata per 15 menit, 24 jam terakhir (titik = awal tiap 15 menit)",
  "7hari": "Rata-rata per jam, 7 hari terakhir (titik = awal tiap jam)",
};

type Props = {
  perangkat: Perangkat;
  onSesiHabis: () => void; // dipanggil kalau backend menjawab 401 (sesudah refresh pun gagal)
};

export default function Riwayat({ perangkat, onSesiHabis }: Props) {
  const id = perangkat.device_id;
  const [rentang, setRentang] = useState<Rentang>("7hari");
  const [data, setData] = useState<DataRiwayat | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);
  const [durasiMs, setDurasiMs] = useState<number | null>(null);
  // kapan permintaan riwayat dikirim (milidetik). useRef: nilainya disimpan tanpa membuat layar digambar ulang.
  const mulai = useRef(0);

  useEffect(() => {
    let ignore = false;
    mulai.current = performance.now(); // performance.now() = jam milidetik milik halaman, untuk mengukur lama
    ambilRiwayat(id, rentang)
      .then((d) => {
        if (!ignore) setData(d);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat riwayat.");
      });
    return () => {
      ignore = true;
    };
  }, [id, rentang, onSesiHabis]);

  // Efek berjalan SESUDAH React selesai menggambar data baru ke layar: saat itulah riwayat dianggap "termuat".
  useEffect(() => {
    if (data !== null) setDurasiMs(Math.round(performance.now() - mulai.current));
  }, [data]);

  function pilihRentang(r: Rentang) {
    if (r === rentang) return;
    setRentang(r);
    setData(null); // kosongkan dulu, supaya tidak ada grafik rentang lama yang tampak seperti rentang baru
    setGalat(null);
    setDurasiMs(null);
  }

  // Unduh semua baris rentang ini (bukan hanya halaman tabel yang tampil), urut dari yang terlama.
  function unduh() {
    if (data === null) return;
    const nama = perangkat.nama ?? id;
    const kepala = [
      "waktu_wib",
      "perangkat",
      "suhu_rata_c",
      "suhu_min_c",
      "suhu_maks_c",
      "kelembapan_rata_persen",
      "tanah_rata_persen",
      "cahaya_rata",
      "jumlah_bacaan",
    ];
    const baris = data.titik.map((p) => [
      waktuCsv(p.waktu),
      nama,
      p.suhu_rata,
      p.suhu_min,
      p.suhu_maks,
      p.kelembapan_rata,
      p.tanah_rata,
      p.cahaya_rata,
      p.jumlah_bacaan,
    ]);
    // nama berkas, misalnya riwayat-f00d00000001-7hari-2026-10-24.csv (tanggal WIB hari ini)
    unduhCsv("riwayat-" + id + "-" + rentang + "-" + waktuCsv(Date.now()).slice(0, 10) + ".csv", keCsv([kepala, ...baris]));
  }

  let isi;
  if (galat !== null) {
    isi = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  } else if (data === null) {
    isi = <p className="mt-4 text-slate-500 dark:text-slate-400">Memuat riwayat…</p>;
  } else {
    isi = (
      <>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {KETERANGAN[rentang]} · {data.titik.length} titik
          {/* waktu dari permintaan dikirim sampai grafik selesai digambar React; bisa dibaca di HP tanpa DevTools */}
          {durasiMs !== null ? " · dimuat dalam " + durasiMs + " ms" : null}
        </p>
        {data.titik.length === 0 ? (
          <p className="mt-4 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Belum ada data di rentang ini.
          </p>
        ) : (
          <>
            <GrafikRiwayat data={data} rentang={rentang} jenis={perangkat.jenis} />
            {/* key = rentang: jaga-jaga supaya tabel rentang lain selalu mulai lagi dari halaman 1 (saat memuat,
                pilihRentang sudah mengosongkan data, jadi tabel lama memang sudah hilang dari layar) */}
            <TabelRiwayat key={rentang} titik={data.titik} mentah={rentang === "1jam"} />
            <button
              type="button"
              onClick={unduh}
              className="mt-4 min-h-11 rounded-lg bg-teal-600 px-4 font-medium text-white hover:bg-teal-700"
            >
              Unduh CSV
            </button>
          </>
        )}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Riwayat ringkasan hanya menyimpan suhu, kelembapan, kelembapan tanah, dan cahaya.
        </p>
      </>
    );
  }

  return (
    <div>
      {/* Modul 24: tautan ke alamat detail perangkat ini (bukan lagi tombol yang mengganti state di App) */}
      <Link
        to={"/perangkat/" + id}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
      >
        ← Kembali ke detail
      </Link>
      <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800 dark:text-slate-100">
        Riwayat {perangkat.nama ?? id}
      </h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {perangkat.lokasi ?? "lokasi belum diisi"} · <span className="font-mono text-xs">{id}</span>
      </p>
      <Pemilih label="Rentang waktu" pilihan={PILIHAN} dipilih={rentang} onPilih={pilihRentang} />
      {isi}
    </div>
  );
}
