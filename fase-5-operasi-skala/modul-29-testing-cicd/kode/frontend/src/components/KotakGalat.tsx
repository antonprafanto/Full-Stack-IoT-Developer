// KotakGalat.tsx - galat tombol layar Armada yang TIDAK hilang sendiri (Modul 28). Toast hilang sesudah 4 detik, padahal
// galat seperti 503 Nonaktifkan berisi perintah penting ("ulangi langkah ini sebentar lagi supaya database dan broker sama
// lagi") yang panjang. Kotak ini tetap tampil di kartu sampai Tutup diketuk, atau sampai tombol yang sama berhasil.
type Props = {
  pesan: string | null; // null = tidak ada galat, kotak tidak digambar
  onTutup: () => void;
};

export default function KotakGalat({ pesan, onTutup }: Props) {
  if (pesan === null) return null;
  return (
    // role="alert": pembaca layar langsung membacakan galatnya begitu kotak muncul
    <div
      role="alert"
      className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
    >
      <p className="break-words">{pesan}</p>
      <button
        type="button"
        onClick={onTutup}
        className="mt-2 min-h-11 rounded-lg border border-red-400 px-4 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900"
      >
        Tutup
      </button>
    </div>
  );
}
