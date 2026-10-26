// TombolPompa.tsx - siram 3, 5, atau 10 detik. SENGAJA TIDAK optimis (Modul 24): air yang sudah keluar tidak bisa ditarik
// lagi, dan perintah "siram 5 detik" yang diulang berarti menyiram dua kali. Jadi layar baru berubah sesudah perangkat
// menjawab, dan tombol tetap mati selama pompa masih menyiram.
import { useId, useTransition } from "react";
import { GalatApi, kirimPerintah } from "../api";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";

const PILIHAN_DETIK = [3, 5, 10];

type Props = {
  deviceId: string;
  menyiram: boolean; // state.pompa yang dilaporkan perangkat
  alasanMati: string | null; // kenapa tombol tidak bisa dipakai (misalnya perangkat offline); null = bisa dipakai
};

// kalimat toast untuk perintah pompa yang gagal
function pesanGagal(err: unknown): string {
  if (!(err instanceof GalatApi)) return "Pompa: perintah gagal.";
  // Beda dengan lampu dan kipas: backend TIDAK mengirim ulang perintah pompa (supaya tidak menyiram dua kali).
  if (err.kode === 504) return "Pompa: belum dikonfirmasi perangkat dan tidak dikirim ulang. Lihat keadaan pompa sebelum mencoba lagi.";
  if (err.kode === 0) return "Pompa: server tidak menjawab.";
  return "Pompa: " + err.message;
}

export default function TombolPompa({ deviceId, menyiram, alasanMati }: Props) {
  const [menunggu, mulai] = useTransition(); // true dari ketukan sampai jawaban backend tiba
  const idJudul = useId();
  const idKeterangan = useId();
  const bisa = alasanMati === null && !menunggu && !menyiram;

  function siram(detik: number) {
    if (!bisa) return;
    mulai(async () => {
      try {
        const ack = await kirimPerintah(deviceId, { target: "pompa", nilai: detik });
        useToko.getState().terapkanKeadaan(deviceId, ack.state); // pompa: true, lalu telemetry melaporkan false lagi
        if (ack.ok) toast("Pompa menyiram " + detik + " detik.", "sukses");
        else toast("Pompa: perangkat menolak (" + (ack.pesan ?? "tanpa alasan") + ")", "galat");
      } catch (err) {
        toast(pesanGagal(err), "galat");
        if (err instanceof GalatApi && err.kode === 401) sesiHabis();
      }
    });
  }

  let keterangan = "";
  if (menunggu) keterangan = "Menunggu konfirmasi perangkat…";
  else if (menyiram) keterangan = "Pompa sedang menyiram…";
  else if (alasanMati !== null) keterangan = alasanMati;

  return (
    // col-span-2: kartu pompa memakai dua kolom kisi di HP, supaya tiga tombolnya muat berjajar
    <div className="col-span-2 min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p id={idJudul} className="flex items-center justify-between gap-2 font-medium text-slate-800 dark:text-slate-100">
        <span>Pompa: siram selama</span>
        <span className="text-sm font-normal text-slate-600 dark:text-slate-300">{menyiram ? "Menyiram" : "Diam"}</span>
      </p>
      <div role="group" aria-labelledby={idJudul} className="mt-2 flex gap-2">
        {PILIHAN_DETIK.map((detik) => (
          <button
            key={detik}
            type="button"
            onClick={() => siram(detik)}
            aria-disabled={bisa ? undefined : true}
            aria-describedby={idKeterangan}
            className={
              "min-h-11 flex-1 rounded-lg border border-sky-600 px-2 font-medium text-sky-800 dark:border-sky-400 dark:text-sky-200" +
              (bisa ? " hover:bg-sky-50 dark:hover:bg-sky-950" : " cursor-not-allowed opacity-60")
            }
          >
            {detik} detik
          </button>
        ))}
      </div>
      <p id={idKeterangan} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {keterangan}
      </p>
    </div>
  );
}
