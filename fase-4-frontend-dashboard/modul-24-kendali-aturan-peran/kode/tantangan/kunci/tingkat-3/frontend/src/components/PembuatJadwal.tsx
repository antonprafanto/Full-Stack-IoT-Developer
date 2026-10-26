// PembuatJadwal.tsx - Tantangan Tingkat 3 Modul 24 (salah satu jawaban): memilih jam dan hari dengan kotak biasa, lalu
// mengubahnya menjadi cron 5 bidang untuk kolom jadwal di formulir aturan. Hasilnya diperiksa dengan skema KondisiJadwal
// yang SAMA dengan backend (salinan di skema/aturan-dasar.ts) sebelum boleh dipakai.
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { buatCron, NAMA_HARI, uraikanCron } from "../aturan";
import { KondisiJadwal } from "../skema/aturan-dasar";

// urutan tampil Senin dulu, Minggu terakhir (nomornya tetap nomor cron: 1 = Senin, 0 = Minggu)
const URUTAN_HARI = [1, 2, 3, 4, 5, 6, 0];

type Props = {
  onPakai: (cron: string) => void; // dipanggil dengan cron jadinya, misalnya "30 17 * * 1,3"
};

export default function PembuatJadwal({ onPakai }: Props) {
  const [waktu, setWaktu] = useState("06:00"); // isi <input type="time">: "JJ:MM", atau "" kalau dikosongkan
  const [hari, setHari] = useState<number[]>([]); // nomor hari yang dicentang; kosong = setiap hari
  const idJam = useId();

  const cocok = /^(\d{2}):(\d{2})$/.exec(waktu);
  const cron = cocok ? buatCron(Number(cocok[1]), Number(cocok[2]), hari) : "";
  // skema yang sama dengan backend: jenis "jadwal" + cron 5 bidang
  const hasil = KondisiJadwal.safeParse({ jenis: "jadwal", cron });
  const sah = cocok !== null && hasil.success;
  let keterangan: ReactNode;
  if (cocok === null) keterangan = "Isi jamnya dulu.";
  else if (!hasil.success) keterangan = hasil.error.issues[0]?.message ?? "Jadwal tidak sah.";
  else keterangan = (
    <>
      {uraikanCron(cron)} · cron <code className="font-mono">{cron}</code>
    </>
  );

  // centang/hapus centang satu hari. Selalu larik BARU (bukan push ke larik lama), supaya React tahu ada yang berubah.
  function ganti(nomor: number) {
    setHari((lama) => (lama.includes(nomor) ? lama.filter((h) => h !== nomor) : [...lama, nomor]));
  }

  return (
    <fieldset className="mt-4 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
      <legend className="px-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Pembuat jadwal</legend>
      <label htmlFor={idJam} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Jam (WIB)
      </label>
      <input
        id={idJam}
        type="time"
        value={waktu}
        onChange={(e) => setWaktu(e.target.value)}
        className="mt-1 min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-teal-400 dark:focus:outline-teal-400"
      />
      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Hari (tidak dicentang satu pun = setiap hari)</p>
      <div className="mt-1 flex flex-wrap gap-x-4">
        {URUTAN_HARI.map((nomor) => (
          <label key={nomor} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={hari.includes(nomor)} onChange={() => ganti(nomor)} className="size-5 accent-teal-700" />
            {NAMA_HARI[nomor]}
          </label>
        ))}
      </div>
      {/* role="status": hasilnya ikut dibacakan pembaca layar setiap kali berubah */}
      <p role="status" className="mt-2 text-sm text-slate-700 dark:text-slate-200">
        {keterangan}
      </p>
      <button
        type="button"
        onClick={() => onPakai(cron)}
        disabled={!sah}
        className="mt-2 min-h-11 rounded-lg border border-teal-600 px-4 text-sm font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-60 dark:border-teal-400 dark:text-teal-200 dark:hover:bg-teal-950"
      >
        Pakai jadwal ini
      </button>
    </fieldset>
  );
}
