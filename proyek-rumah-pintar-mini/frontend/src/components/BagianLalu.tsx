// BagianLalu.tsx - bagian "Lalu apa yang dilakukan?" di formulir aturan (Modul 24): sakelar (nyala selama aturan menyala)
// atau satu perintah sekali, perangkat yang bertindak, isi perintahnya, serta dua kotak centang (Telegram dan Aktif).
// Seperti BagianKapan, kolomnya dipasang ke formulir FormAturan lewat useFormContext.
import { useFormContext } from "react-hook-form";
import { namaPerangkat, pilihanPerangkat } from "../aturan";
import { idKolom, KOTAK, LABEL, useKolom } from "../kolom";
import type { Aturan } from "../skema/aturan-dasar";
import type { PerintahSet } from "../skema/kontrak";
import { useToko } from "../toko";

type Props = {
  aksi: Aturan["aksi"]; // isi aksi saat ini (diawasi FormAturan dengan useWatch)
  jadwal: boolean; // true kalau "Kapan?" = jadwal: aksi sakelar tidak boleh (jadwal tidak punya saat selesai)
  gantiAksi: (jenis: Aturan["aksi"]["jenis"]) => void; // mengganti pilihan "Lalu?" (seluruh isi aksi)
  gantiTarget: (target: PerintahSet["target"]) => void; // mengganti jenis perintah (seluruh isi perintah)
};

const NAMA_TARGET: Record<PerintahSet["target"], string> = { pompa: "Pompa (siram)", lampu: "Lampu", kipas: "Kipas", tirai: "Tirai" };

// gaya kartu pilihan: yang terpilih berlatar teal muda
const kartu = (terpilih: boolean) =>
  terpilih ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950" : "border-slate-300 dark:border-slate-600";

export default function BagianLalu({ aksi, jadwal, gantiAksi, gantiTarget }: Props) {
  const { register } = useFormContext<Aturan>();
  const { aria, tampilGalat } = useKolom();
  const perangkat = useToko((s) => s.perangkat) ?? [];

  return (
    <>
      <fieldset className="mt-6">
        <legend className="font-semibold text-slate-800 dark:text-slate-100">Lalu apa yang dilakukan?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label
            className={
              "flex min-h-11 items-start gap-2 rounded-lg border p-3 text-sm " +
              (jadwal ? "cursor-not-allowed opacity-60 " : "cursor-pointer ") +
              kartu(aksi.jenis === "sakelar")
            }
          >
            <input
              type="radio"
              name="lalu"
              checked={aksi.jenis === "sakelar"}
              disabled={jadwal}
              onChange={() => gantiAksi("sakelar")}
              className="mt-0.5 size-5 shrink-0 accent-teal-700"
            />
            <span>
              <span className="block font-medium text-slate-800 dark:text-slate-100">Nyalakan selama aturan menyala</span>
              <span className="block text-slate-600 dark:text-slate-300">
                {jadwal ? "Tidak untuk jadwal: jadwal tidak punya saat selesai." : "lampu atau kipas, dimatikan lagi saat aturan selesai"}
              </span>
            </span>
          </label>
          <label className={"flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm " + kartu(aksi.jenis === "perintah")}>
            <input
              type="radio"
              name="lalu"
              checked={aksi.jenis === "perintah"}
              onChange={() => gantiAksi("perintah")}
              className="mt-0.5 size-5 shrink-0 accent-teal-700"
            />
            <span>
              <span className="block font-medium text-slate-800 dark:text-slate-100">Kirim satu perintah, sekali</span>
              <span className="block text-slate-600 dark:text-slate-300">misalnya siram 5 detik</span>
            </span>
          </label>
        </div>
        {tampilGalat("aksi.jenis")}
      </fieldset>

      <div className="grid gap-x-3 sm:grid-cols-2">
        <div>
          <label htmlFor={idKolom("aksi.device_id")} className={LABEL}>
            Perangkat yang bertindak
          </label>
          <select id={idKolom("aksi.device_id")} {...aria("aksi.device_id")} {...register("aksi.device_id")} className={KOTAK}>
            {pilihanPerangkat(perangkat, aksi.device_id, true).map((d) => (
              <option key={d} value={d}>
                {namaPerangkat(perangkat, d)}
              </option>
            ))}
          </select>
          {tampilGalat("aksi.device_id")}
        </div>
        {aksi.jenis === "sakelar" ? (
          <div>
            <label htmlFor={idKolom("aksi.target")} className={LABEL}>
              Yang dinyalakan
            </label>
            <select id={idKolom("aksi.target")} {...register("aksi.target")} className={KOTAK}>
              <option value="lampu">Lampu</option>
              <option value="kipas">Kipas</option>
            </select>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor={idKolom("aksi.perintah.target")} className={LABEL}>
                Perintahnya
              </label>
              {/* tidak di-register: mengganti pilihan ini mengganti seluruh isi perintah (gantiTarget) */}
              <select
                id={idKolom("aksi.perintah.target")}
                value={aksi.perintah.target}
                onChange={(e) => gantiTarget(e.target.value as PerintahSet["target"])}
                className={KOTAK}
              >
                {(Object.keys(NAMA_TARGET) as PerintahSet["target"][]).map((t) => (
                  <option key={t} value={t}>
                    {NAMA_TARGET[t]}
                  </option>
                ))}
              </select>
            </div>
            <div key={aksi.perintah.target}>
              {aksi.perintah.target === "lampu" || aksi.perintah.target === "kipas" ? (
                <>
                  <label htmlFor={idKolom("aksi.perintah.nilai")} className={LABEL}>
                    Nyalakan atau matikan
                  </label>
                  {/* setValueAs: pilihan "true"/"false" (teks) dibaca sebagai true/false (boolean) */}
                  <select
                    id={idKolom("aksi.perintah.nilai")}
                    {...register("aksi.perintah.nilai", { setValueAs: (v) => v === true || v === "true" })}
                    className={KOTAK}
                  >
                    <option value="true">Nyalakan</option>
                    <option value="false">Matikan</option>
                  </select>
                </>
              ) : (
                <>
                  <label htmlFor={idKolom("aksi.perintah.nilai")} className={LABEL}>
                    {aksi.perintah.target === "pompa" ? "Lama menyiram (detik, 1-10)" : "Sudut tirai (0-180 derajat)"}
                  </label>
                  <input
                    id={idKolom("aksi.perintah.nilai")}
                    type="number"
                    inputMode="numeric"
                    {...aria("aksi.perintah.nilai")}
                    {...register("aksi.perintah.nilai", { valueAsNumber: true })}
                    className={KOTAK}
                  />
                </>
              )}
              {tampilGalat("aksi.perintah.nilai")}
            </div>
          </>
        )}
      </div>

      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" {...register("aksi.kabari")} className="size-5 accent-teal-700" />
        Kirim kabar Telegram saat aturan bertindak (kalau Telegram Modul 19 sudah disetel)
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input type="checkbox" {...register("aktif")} className="size-5 accent-teal-700" />
        Aktif (hapus centang untuk menghentikan sementara tanpa menghapus)
      </label>
    </>
  );
}
