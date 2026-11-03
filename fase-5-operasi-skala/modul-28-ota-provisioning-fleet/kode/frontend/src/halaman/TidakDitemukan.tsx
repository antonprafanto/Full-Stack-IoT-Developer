// halaman/TidakDitemukan.tsx - layar untuk alamat yang tidak ada di peta rute (Route path="*"), misalnya /perangkt.
// Berada di luar penjaga, jadi tampil sendiri tanpa kepala dashboard, baik sudah masuk maupun belum.
import { Link } from "react-router";

export default function TidakDitemukan() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <h1 className="text-lg font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm">Alamat ini tidak ada di dashboard. Mungkin salah ketik?</p>
        {/* <Link> = tautan milik React Router: pindah layar TANPA memuat ulang halaman (sambungan live tidak putus) */}
        <Link to="/perangkat" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
          Ke daftar perangkat
        </Link>
      </div>
    </main>
  );
}
