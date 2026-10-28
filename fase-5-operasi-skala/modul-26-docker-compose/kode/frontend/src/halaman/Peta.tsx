// halaman/Peta.tsx - layar /peta (Modul 25): judul + peta perangkat. Admin dan viewer sama-sama boleh melihat; peta ini
// hanya menampilkan. Titiknya diatur admin lewat API (PUT /devices/:id/lokasi), bukan ditulis di kode frontend.
import PetaPerangkat from "../components/PetaPerangkat";

export default function HalamanPeta() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Peta Perangkat</h2>
      <PetaPerangkat />
    </>
  );
}
