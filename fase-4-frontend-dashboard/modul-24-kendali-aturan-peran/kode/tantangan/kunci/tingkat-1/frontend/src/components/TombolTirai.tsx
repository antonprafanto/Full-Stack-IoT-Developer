// TombolTirai.tsx - Tantangan Tingkat 1 Modul 24 (salah satu jawaban): penggeser sudut tirai 0-180 derajat.
// Optimis seperti lampu dan kipas, karena perintahnya aman diulang: "putar ke 90°" dua kali tetap 90°. Penggesernya hanya
// MEMILIH sudut; perintah baru dikirim saat tombol "Atur" diketuk, supaya menggeser tidak mengirim puluhan perintah.
import { useId, useOptimistic, useState, useTransition } from "react";
import { GalatApi, kirimPerintah } from "../api";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";

type Props = {
  deviceId: string;
  nilai: number; // sudut yang DILAPORKAN perangkat (state.tirai)
  alasanMati: string | null; // kenapa tidak bisa dipakai (misalnya perangkat offline); null = bisa dipakai
};

// sama dengan TombolSakelar: 504 BUKAN "dibatalkan", backend mengirim ulang perintah tirai saat perangkat terdengar lagi
function pesanGagal(err: unknown): string {
  if (!(err instanceof GalatApi)) return "Tirai: perintah gagal.";
  if (err.kode === 504) return "Tirai: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.";
  if (err.kode === 0) return "Tirai: server tidak menjawab.";
  return "Tirai: " + err.message;
}

export default function TombolTirai({ deviceId, nilai, alasanMati }: Props) {
  const [tampil, setTampil] = useOptimistic(nilai); // sudut di layar: keinginan kita selama menunggu jawaban
  const [menunggu, mulai] = useTransition();
  const [pilihan, setPilihan] = useState(nilai); // sudut yang sedang dipilih di penggeser (belum dikirim)
  const idPenggeser = useId();
  const idKeterangan = useId();
  const bisa = alasanMati === null && !menunggu;

  function atur() {
    if (!bisa || pilihan === nilai) return;
    const sudut = pilihan;
    mulai(async () => {
      setTampil(sudut);
      try {
        const ack = await kirimPerintah(deviceId, { target: "tirai", nilai: sudut });
        useToko.getState().terapkanKeadaan(deviceId, ack.state); // sudut sungguhan dari perangkat
        if (!ack.ok) toast("Tirai: perangkat menolak (" + (ack.pesan ?? "tanpa alasan") + ")", "galat");
      } catch (err) {
        toast(pesanGagal(err), "galat");
        if (err instanceof GalatApi && err.kode === 401) sesiHabis();
      }
      // selesai: tampilan kembali memakai sudut dari toko (berhasil = sudut baru, gagal = sudut lama)
    });
  }

  let keterangan = "";
  if (menunggu) keterangan = "Menunggu konfirmasi perangkat…";
  else if (alasanMati !== null) keterangan = alasanMati;

  return (
    <div className="col-span-2 min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="flex items-center justify-between gap-2 font-medium text-slate-800 dark:text-slate-100">
        <label htmlFor={idPenggeser}>Tirai</label>
        <span className="text-sm font-normal text-slate-600 dark:text-slate-300">Sekarang {tampil}°</span>
      </p>
      <div className="mt-2 flex items-center gap-3">
        {/* type="range" = penggeser; panah kiri/kanan di keyboard juga menggesernya per 10 derajat */}
        <input
          id={idPenggeser}
          type="range"
          min={0}
          max={180}
          step={10}
          value={pilihan}
          onChange={(e) => setPilihan(Number(e.target.value))}
          aria-describedby={idKeterangan}
          className="h-11 min-w-0 flex-1 accent-teal-700"
        />
        <button
          type="button"
          onClick={atur}
          aria-disabled={bisa && pilihan !== nilai ? undefined : true}
          aria-describedby={idKeterangan}
          className={
            "min-h-11 shrink-0 rounded-lg border border-teal-600 px-3 font-medium text-teal-800 dark:border-teal-400 dark:text-teal-200" +
            (bisa && pilihan !== nilai ? " hover:bg-teal-50 dark:hover:bg-teal-950" : " cursor-not-allowed opacity-60")
          }
        >
          Atur ke {pilihan}°
        </button>
      </div>
      <p id={idKeterangan} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {keterangan}
      </p>
    </div>
  );
}
