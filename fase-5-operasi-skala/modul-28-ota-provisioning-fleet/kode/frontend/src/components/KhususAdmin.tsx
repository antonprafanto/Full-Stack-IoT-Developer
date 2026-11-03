// KhususAdmin.tsx - penjaga kedua (pasangan JagaMasuk): rute tata letak untuk layar yang mengubah sesuatu (form aturan).
// Akun admin melihat layarnya; akun viewer melihat penjelasan "Khusus admin", bukan formulir yang toh akan ditolak.
// Ini kenyamanan layar, BUKAN pengaman: kalau viewer mengirim perubahan lewat jalan lain (Bruno, Console), satpam backend
// tetap menjawab 403.
import { Link, Outlet } from "react-router";
import { useAdmin } from "../toko";

export default function KhususAdmin() {
  const admin = useAdmin();
  if (admin) return <Outlet />;
  return (
    <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Khusus admin</h2>
      <p className="mt-1">
        Layar ini hanya untuk akun admin. Akunmu viewer: kamu bisa melihat semua data, tetapi tidak bisa mengubah apa pun.
      </p>
      <Link to="/perangkat" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
        ← Kembali ke daftar perangkat
      </Link>
    </div>
  );
}
