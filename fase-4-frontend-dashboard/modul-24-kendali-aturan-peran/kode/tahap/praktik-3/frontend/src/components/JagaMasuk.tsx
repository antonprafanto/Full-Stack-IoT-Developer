// JagaMasuk.tsx - penjaga rute (protected route). Dipasang sebagai rute tata letak di App: semua layar di dalamnya
// hanya tampil untuk yang sudah masuk. Yang belum masuk dipindahkan ke /masuk, sambil membawa alamat tujuannya (dari),
// supaya sesudah masuk ia kembali ke layar yang tadi dibukanya.
import { Navigate, Outlet, useLocation } from "react-router";
import { useToko } from "../toko";

export default function JagaMasuk() {
  const pengguna = useToko((s) => s.pengguna);
  const keluarSengaja = useToko((s) => s.keluarSengaja); // Modul 24 Praktik 3: baru saja menekan Keluar?
  const location = useLocation(); // alamat yang sedang dibuka, misalnya /perangkat/f00d00000001/riwayat

  if (pengguna === "memuat") {
    // GET /auth/me belum dijawab: jangan buru-buru mengusir ke /masuk, mungkin cookie-nya masih berlaku
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Memeriksa sesi…</p>;
  }
  if (pengguna === null) {
    // replace = alamat yang dijaga tidak ditinggal di riwayat browser, jadi tombol Back tidak memantul ke sini lagi.
    // state.dari = alamat tujuan untuk sesudah masuk; sesudah tombol Keluar tidak dititipkan (mulai bersih).
    return <Navigate to="/masuk" replace state={keluarSengaja ? null : { dari: location }} />;
  }
  return <Outlet />; // sudah masuk: tampilkan layar anak yang cocok dengan alamatnya
}
