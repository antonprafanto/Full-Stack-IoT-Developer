// halaman/Riwayat.tsx - layar /perangkat/:id/riwayat. Sama dengan halaman Detail: perangkatnya dicari dari alamat.
import { Link, useParams } from "react-router";
import Riwayat from "../components/Riwayat";
import { sesiHabis, useToko } from "../toko";

export default function HalamanRiwayat() {
  const { id } = useParams();
  const daftar = useToko((s) => s.perangkat);
  const galat = useToko((s) => s.galatPerangkat);
  const perangkat = daftar?.find((p) => p.device_id === id);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  if (daftar === null) return <p className="text-slate-600 dark:text-slate-400">Memuat perangkat…</p>;
  if (perangkat === undefined) {
    return (
      <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p>
          Perangkat <span className="font-mono">{id}</span> tidak ditemukan.
        </p>
        <Link to="/perangkat" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
          ← Kembali ke daftar
        </Link>
      </div>
    );
  }
  return <Riwayat key={perangkat.device_id} perangkat={perangkat} onSesiHabis={sesiHabis} />;
}
