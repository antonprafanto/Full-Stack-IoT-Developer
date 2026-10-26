// TombolSakelar.tsx - tombol nyala/mati untuk lampu atau kipas, dengan "optimistic UI" (Modul 24).
// Begitu diketuk, tampilannya langsung berganti dan menulis "Menunggu konfirmasi perangkat…". Sesudah perangkat menjawab
// (ack), keadaan SUNGGUHAN dari jawaban itu yang dipakai. Kalau perintahnya gagal, tampilan kembali sendiri (rollback).
// Lampu dan kipas boleh optimis karena perintahnya aman diulang: "nyalakan" dua kali tetap saja nyala.
import { useId, useOptimistic, useTransition } from "react";
import { GalatApi, kirimPerintah } from "../api";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";

type Props = {
  deviceId: string;
  target: "lampu" | "kipas";
  label: string; // tulisan di tombol, misalnya "Lampu"
  nilai: boolean; // keadaan yang DILAPORKAN perangkat (telemetry atau ack): sumber kebenarannya
  alasanMati: string | null; // kenapa tombol tidak bisa dipakai (misalnya perangkat offline); null = bisa dipakai
};

// kalimat toast untuk perintah yang gagal, menurut jawaban backend
function pesanGagal(err: unknown, label: string): string {
  if (!(err instanceof GalatApi)) return label + ": perintah gagal.";
  // 504 BUKAN "dibatalkan": backend mengingat keinginan kita dan mengirim ulang sendiri saat perangkat terdengar lagi
  if (err.kode === 504) return label + ": belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.";
  if (err.kode === 0) return label + ": server tidak menjawab.";
  return label + ": " + err.message; // 409 "perangkat sedang offline, …", 404, 503, 403
}

export default function TombolSakelar({ deviceId, target, label, nilai, alasanMati }: Props) {
  // tampil = nilai, KECUALI selama perintah menunggu jawaban: saat itu tampil = keinginan kita (optimis)
  const [tampil, setTampil] = useOptimistic(nilai);
  // menunggu = true selama Action di bawah belum selesai (dari ketukan sampai jawaban backend tiba)
  const [menunggu, mulai] = useTransition();
  const idKeterangan = useId(); // id unik untuk menghubungkan tombol dengan keterangannya (aria-describedby)
  const bisa = alasanMati === null && !menunggu;

  function ketuk() {
    // Tombol yang sedang menunggu tidak bisa diketuk lagi: mencegah 409 "perintah sebelumnya masih menunggu ack".
    if (!bisa) return;
    const baru = !nilai;
    // Action = fungsi async di dalam startTransition. Selama ia berjalan, setTampil(baru) yang berlaku.
    mulai(async () => {
      setTampil(baru); // langsung berganti di layar, sebelum perangkat menjawab
      try {
        const ack = await kirimPerintah(deviceId, { target, nilai: baru });
        // Keadaan sungguhan dari perangkat masuk toko, jadi prop nilai ikut berganti. (Toko Zustand berubah seketika,
        // bukan state React, jadi tidak perlu dibungkus startTransition lagi.)
        useToko.getState().terapkanKeadaan(deviceId, ack.state);
        if (!ack.ok) toast(label + ": perangkat menolak (" + (ack.pesan ?? "tanpa alasan") + ")", "galat");
      } catch (err) {
        toast(pesanGagal(err, label), "galat");
        if (err instanceof GalatApi && err.kode === 401) sesiHabis();
      }
      // Action selesai: React membuang tampilan optimis dan kembali memakai nilai dari toko. Kalau perintahnya gagal,
      // nilai di toko tidak berubah, jadi tombol kembali ke keadaan semula (rollback) tanpa kode tambahan.
    });
  }

  let keterangan = "";
  if (menunggu) keterangan = "Menunggu konfirmasi perangkat…";
  else if (alasanMati !== null) keterangan = alasanMati;

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* aria-pressed = tombol sakelar: pembaca layar menyebut "ditekan" (nyala) atau "tidak ditekan" (mati).
          aria-disabled (bukan disabled): tombol tetap bisa difokus keyboard, jadi fokus tidak hilang saat menunggu. */}
      <button
        type="button"
        onClick={ketuk}
        aria-pressed={tampil}
        aria-disabled={bisa ? undefined : true}
        aria-describedby={idKeterangan}
        className={
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 font-medium " +
          (tampil
            ? "border-teal-600 bg-teal-600 text-white"
            : "border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100") +
          (bisa ? " hover:opacity-90" : " cursor-not-allowed opacity-70")
        }
      >
        <span>{label}</span>
        {/* keadaan untuk mata; pembaca layar sudah mendapatkannya dari aria-pressed */}
        <span aria-hidden="true" className="text-sm">
          {tampil ? "Nyala" : "Mati"}
        </span>
      </button>
      {/* role="status": "Menunggu konfirmasi perangkat…" ikut dibacakan pembaca layar tanpa memindah fokus */}
      <p id={idKeterangan} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {keterangan}
      </p>
    </div>
  );
}
