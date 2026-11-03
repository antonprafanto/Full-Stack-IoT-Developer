// BagianKapan.tsx - bagian "Kapan aturan ini menyala?" di formulir aturan (Modul 24): tiga pilihan (angka naik, angka
// turun, jadwal) dan kolom-kolom milik pilihan yang sedang dipilih. Kolomnya dipasang ke formulir FormAturan lewat
// useFormContext, jadi bagian ini tidak perlu dititipi register, setValue, dan galat lewat props.
import { useFormContext } from "react-hook-form";
import { BESARAN, namaPerangkat, pilihanPerangkat } from "../aturan";
import { idKolom, KOTAK, LABEL, useKolom } from "../kolom";
import { Besaran } from "../skema/aturan-dasar";
import type { Aturan } from "../skema/aturan-dasar";
import { useToko } from "../toko";

type Props = {
  kondisi: Aturan["kondisi"]; // isi kondisi saat ini (diawasi FormAturan dengan useWatch)
  gantiKapan: (jenis: Aturan["kondisi"]["jenis"]) => void; // mengganti pilihan "Kapan?" (seluruh isi kondisi)
};

// nama empat kolom batas angka (dua untuk "naik", dua untuk "turun")
type KolomBatas = "kondisi.nyala_di_atas" | "kondisi.padam_di_bawah" | "kondisi.nyala_di_bawah" | "kondisi.padam_di_atas";

// tiga pilihan "Kapan?" dalam bahasa sehari-hari
const PILIHAN_KAPAN: { jenis: Aturan["kondisi"]["jenis"]; judul: string; contoh: string }[] = [
  { jenis: "ambang", judul: "Saat angka NAIK melewati batas", contoh: "misalnya suhu lebih panas dari 30 °C" },
  { jenis: "ambang-bawah", judul: "Saat angka TURUN di bawah batas", contoh: "misalnya tanah lebih kering dari 30 %" },
  { jenis: "jadwal", judul: "Pada jam tertentu", contoh: "misalnya setiap hari pukul 06.00 WIB" },
];

// contoh jadwal siap klik (cron 5 bidang: menit jam tanggal bulan hari, jam WIB)
const CONTOH_JADWAL = [
  { cron: "0 6 * * *", teks: "Setiap hari 06.00" },
  { cron: "30 17 * * *", teks: "Setiap hari 17.30" },
  { cron: "*/15 * * * *", teks: "Setiap 15 menit" },
];

// nama kunci teknis di bawah label: pesan galat dari skema (misalnya "padam_di_atas harus lebih besar…") jadi mudah
// dicocokkan dengan kolomnya
const kunci = (teks: string) => <span className="ml-1 font-mono text-xs font-normal text-slate-500 dark:text-slate-400">{teks}</span>;

export default function BagianKapan({ kondisi, gantiKapan }: Props) {
  const { register, setValue } = useFormContext<Aturan>();
  const { aria, tampilGalat } = useKolom();
  const perangkat = useToko((s) => s.perangkat) ?? [];

  // keterangan di label kolom angka: satuannya (°C, %), atau rentang cahaya. Cahaya ditulis tanpa titik ribuan, karena
  // browser membaca "1.000" sebagai 1 (titik dan koma = tanda desimal).
  const satuan =
    kondisi.jenis === "jadwal" ? "" : kondisi.besaran === "cahaya" ? "0-4095, tanpa titik ribuan" : BESARAN[kondisi.besaran].satuan.trim();
  // satu kolom batas (angka berdesimal, dipakai 4 kali). valueAsNumber: isi kotak dibaca sebagai angka (kotak kosong =
  // NaN, ditolak skema: "Isi dengan angka"; "2,5" dan "2.5" sama-sama dibaca dua setengah)
  const kolomBatas = (nama: KolomBatas, judul: string) => (
    <div>
      <label htmlFor={idKolom(nama)} className={LABEL}>
        {judul}
        {satuan ? " (" + satuan + ")" : ""}
        {kunci(nama.replace("kondisi.", ""))}
      </label>
      <input
        id={idKolom(nama)}
        type="number"
        step="any"
        inputMode="decimal"
        {...aria(nama)}
        {...register(nama, { valueAsNumber: true })}
        className={KOTAK}
      />
      {tampilGalat(nama)}
    </div>
  );

  return (
    <>
      {/* fieldset + legend = satu kelompok pilihan dengan judulnya (dibacakan pembaca layar) */}
      <fieldset className="mt-5">
        <legend className="font-semibold text-slate-800 dark:text-slate-100">Kapan aturan ini menyala?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {PILIHAN_KAPAN.map((p) => (
            <label
              key={p.jenis}
              className={
                "flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm " +
                (kondisi.jenis === p.jenis
                  ? "border-teal-600 bg-teal-50 dark:border-teal-400 dark:bg-teal-950"
                  : "border-slate-300 dark:border-slate-600")
              }
            >
              <input
                type="radio"
                name="kapan"
                checked={kondisi.jenis === p.jenis}
                onChange={() => gantiKapan(p.jenis)}
                className="mt-0.5 size-5 shrink-0 accent-teal-700"
              />
              <span>
                <span className="block font-medium text-slate-800 dark:text-slate-100">{p.judul}</span>
                <span className="block text-slate-600 dark:text-slate-300">{p.contoh}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {kondisi.jenis === "jadwal" ? (
        <>
          <label htmlFor={idKolom("kondisi.cron")} className={LABEL}>
            Jadwal (cron 5 bidang: menit jam tanggal bulan hari, jam WIB){kunci("cron")}
          </label>
          <input id={idKolom("kondisi.cron")} {...aria("kondisi.cron")} {...register("kondisi.cron")} className={KOTAK + " font-mono"} />
          {tampilGalat("kondisi.cron")}
          <div className="mt-2 flex flex-wrap gap-2">
            {CONTOH_JADWAL.map((c) => (
              <button
                key={c.cron}
                type="button"
                onClick={() => setValue("kondisi.cron", c.cron, { shouldValidate: true, shouldDirty: true })}
                className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                {c.teks}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-x-3 sm:grid-cols-2">
          <div>
            <label htmlFor={idKolom("kondisi.device_id")} className={LABEL}>
              Perangkat yang diukur
            </label>
            <select id={idKolom("kondisi.device_id")} {...aria("kondisi.device_id")} {...register("kondisi.device_id")} className={KOTAK}>
              {pilihanPerangkat(perangkat, kondisi.device_id, false).map((d) => (
                <option key={d} value={d}>
                  {namaPerangkat(perangkat, d)}
                </option>
              ))}
            </select>
            {tampilGalat("kondisi.device_id")}
          </div>
          <div>
            <label htmlFor={idKolom("kondisi.besaran")} className={LABEL}>
              Yang diukur
            </label>
            <select id={idKolom("kondisi.besaran")} {...register("kondisi.besaran")} className={KOTAK}>
              {Besaran.options.map((b) => (
                <option key={b} value={b}>
                  {BESARAN[b].nama}
                </option>
              ))}
            </select>
          </div>
          {kondisi.jenis === "ambang" ? (
            <>
              {kolomBatas("kondisi.nyala_di_atas", "Menyala kalau di atas")}
              {kolomBatas("kondisi.padam_di_bawah", "Selesai kalau turun di bawah")}
            </>
          ) : (
            <>
              {kolomBatas("kondisi.nyala_di_bawah", "Menyala kalau di bawah")}
              {kolomBatas("kondisi.padam_di_atas", "Selesai kalau naik di atas")}
            </>
          )}
          <div>
            <label htmlFor={idKolom("kondisi.selama_detik")} className={LABEL}>
              Harus bertahan selama (detik, 0 = langsung){kunci("selama_detik")}
            </label>
            {/* bilangan bulat: "2,5" atau "2.5" ditolak skema dengan "Isi dengan bilangan bulat (tanpa koma)" */}
            <input
              id={idKolom("kondisi.selama_detik")}
              type="number"
              inputMode="numeric"
              {...aria("kondisi.selama_detik")}
              {...register("kondisi.selama_detik", { valueAsNumber: true })}
              className={KOTAK}
            />
            {tampilGalat("kondisi.selama_detik")}
          </div>
        </div>
      )}
    </>
  );
}
