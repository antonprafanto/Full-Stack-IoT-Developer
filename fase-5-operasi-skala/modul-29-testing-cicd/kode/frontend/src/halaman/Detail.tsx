// halaman/Detail.tsx - layar /perangkat/:id. Perangkatnya dicari dari ALAMAT (useParams), bukan dititipkan layar Daftar,
// jadi alamat ini bisa dibuka langsung, dimuat ulang (F5), atau dikirim ke orang lain.
import { Link, useParams } from "react-router";
import DetailPerangkat from "../components/DetailPerangkat";
import { useToko } from "../toko";

export default function HalamanDetail() {
  const { id } = useParams(); // bagian :id dari alamat, misalnya "f00d00000001"
  const daftar = useToko((s) => s.perangkat); // null = GET /devices belum dijawab
  const galat = useToko((s) => s.galatPerangkat);
  const perangkat = daftar?.find((p) => p.device_id === id);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  if (daftar === null) return <p className="text-slate-600 dark:text-slate-400">Memuat perangkat…</p>;
  // id yang tidak ada di daftar (salah ketik, perangkat sudah dihapus): tidak ada yang diminta ke API
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
  // key = device_id: perangkat lain berarti DetailPerangkat baru dengan state segar (pola resmi React, Modul 22)
  return <DetailPerangkat key={perangkat.device_id} perangkat={perangkat} />;
}
