// DaftarRilis.tsx - rilis firmware yang tersimpan di server (GET /firmware, Modul 28): versi, ukuran, SHA-256, catatan, dan
// ringkasan canary-nya. Admin mendapat dua tombol per rilis: "Perbarui canary" (perangkat bertanda canary dulu), lalu
// "Perbarui semua", yang baru terbuka sesudah paling sedikit satu canary BERHASIL memakai versi itu (server yang
// memutuskan: boleh_semua). Rilis uji dan rilis yang ditarik tidak punya tombol: rilis uji hanya lewat Perbarui di kartu
// satu perangkat.
import { useState } from "react";
import { perbaruiBanyak } from "../api";
import { pesanGalat, teksUkuran } from "../armada";
import { toast } from "../toast";
import type { DaftarRilis as Daftar, HasilArmada, RilisLengkap } from "../types";
import { tanggalJamWib } from "../waktu";
import KotakGalat from "./KotakGalat";
import TombolKonfirmasi from "./TombolKonfirmasi";

const BENTUK = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

// kalimat untuk satu perangkat yang dikirimi perintah
const TEKS_KIRIM: Record<string, string> = {
  diterima: "menerima perintahnya",
  "tanpa-ack": "belum menjawab dalam 5 detik",
  ditolak: "menolak",
  "tidak-dikirim": "tidak dikirimi",
};

function KartuRilis({ r, terbaru, admin, onBerubah }: { r: RilisLengkap; terbaru: boolean; admin: boolean; onBerubah: () => void }) {
  const [hasil, setHasil] = useState<HasilArmada | null>(null); // hasil "Perbarui canary/semua" terakhir untuk rilis ini
  const [galat, setGalat] = useState<string | null>(null); // galat terakhir, tetap tampil sampai Tutup (KotakGalat)

  async function kirim(sasaran: "canary" | "semua") {
    try {
      const h = await perbaruiBanyak(r.versi, sasaran);
      setHasil(h);
      setGalat(null);
      toast(
        "Perintah " + r.versi + " dikirim ke " + h.dikirim.length + " perangkat" + (h.dilewati.length > 0 ? ", " + h.dilewati.length + " dilewati." : "."),
        h.dikirim.length > 0 ? "sukses" : "info",
      );
      onBerubah();
    } catch (err) {
      setGalat(pesanGalat(err, "Perintah pembaruan gagal dikirim."));
    }
  }

  return (
    <li className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">Node 1 {r.versi}</span>
        {terbaru ? <span className={BENTUK + " bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"}>terbaru</span> : null}
        {r.uji ? <span className={BENTUK + " bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"}>uji</span> : null}
        {r.ditarik !== null ? <span className={BENTUK + " bg-red-600 text-white"}>ditarik</span> : null}
      </div>
      {r.catatan !== null ? <p className="mt-1 text-sm break-words text-slate-700 dark:text-slate-200">{r.catatan}</p> : null}
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {teksUkuran(r.ukuran)} · diunggah {tanggalJamWib(Date.parse(r.dibuat))}
      </p>
      {/* break-all: 64 huruf heksadesimal tanpa spasi tetap terlipat di layar HP */}
      <p className="mt-1 font-mono text-xs break-all text-slate-600 dark:text-slate-400">sha256 {r.sha256}</p>
      {!r.uji ? (
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
          Canary: {r.canary_berhasil} berhasil, {r.canary_gagal} gagal atau rollback
        </p>
      ) : null}

      {admin && !r.uji && r.ditarik === null ? (
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <TombolKonfirmasi
            label="Perbarui canary"
            judul={"Perbarui semua perangkat canary ke " + r.versi + "?"}
            labelYa="Ya, perbarui canary"
            onYa={() => kirim("canary")}
          >
            <p>
              Hanya Node 1 bertanda canary yang sedang online. Perangkat yang offline, sedang memperbarui, atau sudah memakai {r.versi}{" "}
              dilewati, tidak diantre.
            </p>
          </TombolKonfirmasi>
          <TombolKonfirmasi
            label="Perbarui semua"
            judul={"Perbarui SEMUA Node 1 ke " + r.versi + "?"}
            labelYa="Ya, perbarui semua"
            onYa={() => kirim("semua")}
            alasanMati={r.boleh_semua ? null : "Terkunci: " + (r.alasan_semua ?? "syarat belum terpenuhi") + "."}
          >
            <p>
              Semua Node 1 yang online dan memenuhi syarat dikirimi perintah sekaligus. Yang offline atau sedang memperbarui dilewati,
              tidak diantre: perbarui lagi nanti.
            </p>
          </TombolKonfirmasi>
        </div>
      ) : null}

      <KotakGalat pesan={galat} onTutup={() => setGalat(null)} />

      {hasil !== null ? (
        <div role="status" className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <p className="font-medium">
            Perbarui {hasil.sasaran} ke {hasil.versi}: {hasil.dikirim.length} dikirim, {hasil.dilewati.length} dilewati
          </p>
          <ul className="mt-1 space-y-0.5 break-words">
            {hasil.dikirim.map((d) => (
              <li key={d.device_id}>
                <span className="font-mono">{d.device_id}</span> {TEKS_KIRIM[d.status] ?? d.status}
                {d.pesan === undefined ? "" : ": " + d.pesan}
              </li>
            ))}
            {hasil.dilewati.map((d) => (
              <li key={d.device_id} className="text-slate-600 dark:text-slate-400">
                <span className="font-mono">{d.device_id}</span> dilewati: {d.alasan}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setHasil(null)}
            className="mt-2 min-h-11 rounded-lg border border-slate-300 px-4 hover:bg-white dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Tutup
          </button>
        </div>
      ) : null}
    </li>
  );
}

type Props = {
  daftar: Daftar;
  admin: boolean;
  onBerubah: () => void;
};

export default function DaftarRilis({ daftar, admin, onBerubah }: Props) {
  if (daftar.rilis.length === 0) {
    return (
      <p className="rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Belum ada firmware yang diunggah ke server.
      </p>
    );
  }
  // terbaru di atas: server mengirimnya urut waktu unggah (lama ke baru); [...] = salinan, larik aslinya tidak diubah
  const urut = [...daftar.rilis].reverse();
  return (
    <ul className="grid gap-3">
      {urut.map((r) => (
        <KartuRilis key={r.versi} r={r} terbaru={r.versi === daftar.terbaru.node1} admin={admin} onBerubah={onBerubah} />
      ))}
    </ul>
  );
}
