// DaftarAturan.tsx - aturan otomatis sebagai kartu-kartu berisi kalimat biasa, bukan JSON (Modul 24).
// Admin dan viewer melihat daftar yang sama: viewer jadi tahu kenapa kipas menyala sendiri.
import type { AturanLengkap } from "../aturan";
import { uraikanAturan } from "../aturan";
import { useToko } from "../toko";
import { tanggalJamWib } from "../waktu";

type Props = {
  aturan: AturanLengkap[];
};

export default function DaftarAturan({ aturan }: Props) {
  const perangkat = useToko((s) => s.perangkat);
  // device_id -> nama yang diberikan admin (Modul 21); perangkat yang tidak dikenal tetap ditulis device_id-nya
  const namaPerangkat = (id: string) => perangkat?.find((p) => p.device_id === id)?.nama ?? id;

  if (aturan.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Belum ada aturan otomatis.</p>;
  }

  return (
    <ul className="grid gap-3">
      {aturan.map((a) => (
        <li key={a.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* nama aturan diisi admin: ditampilkan sebagai teks JSX, bukan HTML */}
            <h3 className="min-w-0 font-semibold break-words text-slate-800 dark:text-slate-100">{a.nama}</h3>
            {/* warna selalu ditemani teks: "Aktif" / "Nonaktif" */}
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " +
                (a.aktif
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200")
              }
            >
              {a.aktif ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{uraikanAturan(a, namaPerangkat)}</p>
          {/* berikutnya = kapan aturan jadwal yang aktif berjalan lagi (UTC dari backend), ditulis dalam jam WIB */}
          {a.berikutnya !== null ? (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Berjalan lagi: {tanggalJamWib(Date.parse(a.berikutnya))}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
