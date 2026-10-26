// KartuSensor.tsx - satu kartu untuk satu bacaan sensor: label, angka, dan satuan.
// Dipakai ulang di seluruh dashboard (balok LEGO): cetakannya satu, isinya dititipkan lewat props.
type Props = {
  label: string; // tulisan kecil di atas, misalnya "Suhu"
  nilai: number | string | null; // angka atau teks; null = sensor gagal dibaca (aturan 7)
  satuan?: string; // tanda ? = boleh tidak diisi (kartu "Gerakan" tidak punya satuan)
  warna?: string; // kelas warna Tailwind untuk angkanya, misalnya "text-teal-600"
};

export default function KartuSensor({ label, nilai, satuan, warna = "text-slate-800 dark:text-slate-100" }: Props) {
  return (
    // min-w-0: kartu boleh menyempit mengikuti kolom kisi; label yang terlalu panjang dipotong "…" (truncate)
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {/* ?? = kalau nilainya null, tulis "—" (bukan 0: angka 0 tetap bacaan yang sah) */}
        <span className={nilai === null ? "text-slate-500 dark:text-slate-400" : warna}>{nilai ?? "—"}</span>
        {/* satuan hanya ditulis kalau ada angkanya */}
        {satuan && nilai !== null ? <span className="ml-1 text-base font-normal text-slate-500 dark:text-slate-400">{satuan}</span> : null}
      </p>
    </div>
  );
}
