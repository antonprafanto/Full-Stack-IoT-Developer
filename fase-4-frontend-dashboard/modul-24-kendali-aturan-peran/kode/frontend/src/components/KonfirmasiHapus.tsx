// KonfirmasiHapus.tsx - tombol "Hapus aturan" beserta kotak "yakin?"-nya di formulir ubah aturan (Modul 24). Kotak ini
// bagian dari halaman, bukan jendela confirm() browser: tombol Batal di dalamnya langsung difokus, dan sesudah Batal fokus
// kembali ke tombol Hapus aturan, jadi pengguna keyboard tidak terlempar ke awal halaman.
import { useRef, useState } from "react";

type Props = {
  nama: string; // nama aturan, untuk kalimat pertanyaannya
  menghapus: boolean; // true selama DELETE /rules/:id berjalan
  onHapus: () => void; // dipanggil tombol "Ya, hapus"
};

export default function KonfirmasiHapus({ nama, menghapus, onHapus }: Props) {
  const [yakin, setYakin] = useState(false); // kotak "yakin?" sedang tampil
  const tombolHapus = useRef<HTMLButtonElement>(null); // ref = pegangan ke tombol di halaman, untuk memindah fokus

  function batal() {
    setYakin(false);
    tombolHapus.current?.focus(); // tombol Hapus aturan tetap ada di halaman, jadi fokus bisa langsung kembali ke sana
  }

  return (
    <>
      <button
        ref={tombolHapus}
        type="button"
        onClick={() => setYakin(true)}
        className="min-h-11 rounded-lg border border-red-600 px-4 font-medium text-red-700 hover:bg-red-50 sm:ml-auto dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950"
      >
        Hapus aturan
      </button>
      {yakin ? (
        // role="alertdialog" + aria-labelledby/aria-describedby: pembaca layar membacakan pertanyaannya begitu fokus
        // pindah ke tombol Batal. basis-full = kotak ini turun ke baris sendiri, di bawah tombol-tombol formulir.
        <div
          role="alertdialog"
          aria-labelledby="hapus-judul"
          aria-describedby="hapus-isi"
          className="basis-full rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p id="hapus-judul" className="font-medium">
            Hapus aturan "{nama}"?
          </p>
          <p id="hapus-isi" className="mt-1">
            Riwayat perintah dan kejadiannya tetap tersimpan. Kalau hanya ingin berhenti sementara, hapus centang Aktif lalu
            simpan.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onHapus}
              disabled={menghapus}
              className="min-h-11 rounded-lg bg-red-700 px-4 font-medium text-white hover:bg-red-800 disabled:opacity-60"
            >
              {menghapus ? "Menghapus…" : "Ya, hapus"}
            </button>
            <button
              type="button"
              autoFocus
              onClick={batal}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Batal
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
