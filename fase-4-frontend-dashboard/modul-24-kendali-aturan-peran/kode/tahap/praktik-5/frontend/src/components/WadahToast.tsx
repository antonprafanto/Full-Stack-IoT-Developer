// WadahToast.tsx - tempat semua toast tampil. Di HP dan tablet (layar di bawah 1280 px): di BAWAH layar. Di laptop lebar
// (1280 px ke atas): di pojok kanan atas, di ruang kosong samping kolom isi. Dipasang TataLetak di antara kepala dan isi
// layar, jadi selalu ada di semua layar sesudah masuk.
import { useToast } from "../toast";
import type { JenisToast } from "../toast";

// warna + ikon + teks: arti toast tidak hanya dibawa warna (tetap terbaca oleh orang yang sulit membedakan warna)
const GAYA: Record<JenisToast, { ikon: string; warna: string }> = {
  info: { ikon: "i", warna: "border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" },
  sukses: { ikon: "✓", warna: "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100" },
  galat: { ikon: "!", warna: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100" },
};

export default function WadahToast() {
  const daftar = useToast((s) => s.daftar);
  const hapus = useToast((s) => s.hapus);

  return (
    // Wadah ini SELALU ada di layar, walau kosong. Pembaca layar hanya mengumumkan isi baru dari wadah yang sudah
    // dikenalnya sejak awal. role="status" + aria-live="polite" = diumumkan sesudah kalimat yang sedang dibacakan
    // selesai, tanpa memindah fokus.
    // Letaknya bergantung lebar layar, supaya toast tidak menutupi tombol yang sedang dipakai:
    // - fixed inset-x-0 bottom-0: di bawah 1280 px wadah menempel di tepi BAWAH layar. Di layar ini tidak ada ruang kosong
    //   di samping isi, dan di atas toast akan menutupi tombol tepat di bawah kepala (+ Aturan baru, ← Kembali). Supaya
    //   tombol paling bawah tetap bisa digulir ke atas toast, TataLetak memberi isi layar ruang kosong di bawah (pb-64)
    //   dan index.html memberi scroll-pb-64.
    // - xl:sticky xl:top-0 xl:bottom-auto xl:h-0: mulai 1280 px (xl) wadah setinggi nol tepat di bawah kepala, menempel di
    //   tepi atas saat halaman digulir. Toast di dalamnya "menggantung" di ruang kosong kanan, di luar kolom isi.
    // pointer-events-none: ruang kosong wadah tidak menghalangi ketukan di bawahnya.
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 xl:sticky xl:top-0 xl:bottom-auto xl:h-0"
    >
      {/* pb-[max(1rem,env(safe-area-inset-bottom))]: jarak dari tepi bawah 1rem, atau setinggi garis/tombol sistem di
          bawah layar HP kalau browser menggambar halaman sampai ke sana (di browser biasa nilai env() ini 0) */}
      <div className="flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] xl:items-end">
        {daftar.map((t) => (
          // xl:max-w-60 = di layar laptop lebar (1280 px ke atas), toast cukup sempit untuk muat di ruang kosong kanan,
          // di luar kolom isi dashboard (max-w-3xl)
          <div
            key={t.id}
            className={"pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border p-2 pl-3 shadow-lg xl:max-w-60 " + GAYA[t.jenis].warna}
          >
            <span aria-hidden="true" className="mt-2.5 w-4 shrink-0 text-center font-bold">
              {GAYA[t.jenis].ikon}
            </span>
            {/* pesan ditampilkan sebagai teks JSX (bukan HTML), walau datang dari server */}
            <p className="min-w-0 flex-1 py-2 text-sm break-words">{t.pesan}</p>
            {/* tombol tutup 44 x 44 px: cukup besar untuk jempol */}
            <button
              type="button"
              onClick={() => hapus(t.id)}
              aria-label="Tutup pesan"
              className="min-h-11 min-w-11 shrink-0 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
