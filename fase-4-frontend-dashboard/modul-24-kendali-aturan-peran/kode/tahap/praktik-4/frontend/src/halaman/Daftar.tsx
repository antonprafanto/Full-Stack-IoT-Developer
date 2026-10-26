// halaman/Daftar.tsx - layar /perangkat: judul + kartu-kartu perangkat (Modul 22-23).
// Modul 24: setiap layar punya berkas pembungkus tipis di folder halaman/. Isinya tetap komponen lama.
import DaftarPerangkat from "../components/DaftarPerangkat";

export default function HalamanDaftar() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Daftar Perangkat</h2>
      <DaftarPerangkat />
    </>
  );
}
