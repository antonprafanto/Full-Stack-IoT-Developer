// Pemilih.tsx - deretan tombol "pilih satu", misalnya Suhu / Cahaya / Kelembapan. Tombol yang terpilih berwarna.
// <T extends string> = jenis nilai pilihannya diisi oleh pemakai komponen (misalnya "suhu" | "cahaya"), supaya
// TypeScript tetap menjaga bahwa onPilih hanya menerima nilai yang memang ada di daftar.
type Props<T extends string> = {
  label: string; // nama kelompok tombol untuk pembaca layar, misalnya "Besaran grafik"
  pilihan: { nilai: T; teks: string }[];
  dipilih: T;
  onPilih: (nilai: T) => void;
};

export default function Pemilih<T extends string>({ label, pilihan, dipilih, onPilih }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {pilihan.map((p) => (
        <button
          key={p.nilai}
          type="button"
          aria-pressed={p.nilai === dipilih} // memberi tahu pembaca layar tombol mana yang sedang terpilih
          onClick={() => onPilih(p.nilai)}
          className={
            "min-h-11 rounded-lg border px-3 text-sm font-medium " +
            (p.nilai === dipilih
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
          }
        >
          {p.teks}
        </button>
      ))}
    </div>
  );
}
