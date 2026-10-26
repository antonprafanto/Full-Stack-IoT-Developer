// App.tsx - akar dashboard. Tiga tugasnya, masing-masing SEKALI untuk seluruh dashboard:
// 1. bertanya ke backend "siapa saya?" (GET /auth/me) saat halaman dibuka;
// 2. menjaga sambungan live (Socket.IO) selama sudah login (Modul 23);
// 3. memegang peta rute (Modul 24): alamat mana menampilkan layar mana, dan layar mana yang dijaga.
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { GalatApi, siapaSaya } from "./api";
import JagaMasuk from "./components/JagaMasuk";
import KhususAdmin from "./components/KhususAdmin";
import TataLetak from "./components/TataLetak";
import HalamanAturan from "./halaman/Aturan";
import HalamanDaftar from "./halaman/Daftar";
import HalamanDetail from "./halaman/Detail";
import HalamanFormAturan from "./halaman/FormAturan";
import HalamanMasuk from "./halaman/Masuk";
import HalamanRiwayat from "./halaman/Riwayat";
import TidakDitemukan from "./halaman/TidakDitemukan";
import { useRealtime } from "./soket";
import { sesiHabis, useToko } from "./toko";

export default function App() {
  // Sekali saat App tampil ([] = tanpa dependensi): cek apakah cookie login dari kunjungan sebelumnya masih berlaku.
  // Hasilnya ditulis ke toko, tempat penjaga rute (JagaMasuk) dan layar Masuk membacanya.
  useEffect(() => {
    let ignore = false;
    siapaSaya()
      .then((p) => {
        if (!ignore) useToko.getState().setPengguna(p);
      })
      .catch((err) => {
        if (ignore) return;
        // 401 = memang belum login: cukup tampilkan formulir. Selain itu (backend atau database mati): beri tahu.
        const sungguhBelum = err instanceof GalatApi && err.kode === 401;
        useToko.getState().belumMasuk(sungguhBelum ? null : err instanceof GalatApi ? err.message : "Gagal memeriksa login.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Modul 24: tombol Back kadang memulihkan halaman LAMA utuh dari "back/forward cache" browser (bfcache), lengkap dengan
  // isi toko milik akun yang sudah Keluar (terjadi kalau alamatnya dulu diketik langsung di bilah alamat). Halaman yang
  // dipulihkan seperti itu dimuat ulang, supaya App bertanya lagi "siapa saya?" dan penjaga rute bekerja dari awal.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) location.reload(); // persisted = dipulihkan dari bfcache, bukan dimuat baru
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Modul 23: sambungan live (Socket.IO) hidup selama sudah login. Modul 24: hook ini tetap di sini, DI ATAS <Routes>,
  // jadi pindah layar tidak memutus sambungan live.
  const sudahLogin = useToko((s) => s.pengguna !== null && s.pengguna !== "memuat");
  useRealtime(sudahLogin, sesiHabis);

  // Peta rute: setiap <Route> memasangkan satu pola alamat dengan satu layar. :id = bagian alamat yang berubah-ubah,
  // dibaca layarnya dengan useParams(). Route tanpa path (JagaMasuk, TataLetak) = "rute tata letak": ia menggambar
  // dirinya, lalu menaruh layar anak yang cocok di tempat <Outlet /> miliknya.
  return (
    <Routes>
      <Route path="/masuk" element={<HalamanMasuk />} />
      <Route element={<JagaMasuk />}>
        <Route element={<TataLetak />}>
          <Route path="/" element={<Navigate to="/perangkat" replace />} />
          <Route path="/perangkat" element={<HalamanDaftar />} />
          <Route path="/perangkat/:id" element={<HalamanDetail />} />
          <Route path="/perangkat/:id/riwayat" element={<HalamanRiwayat />} />
          <Route path="/aturan" element={<HalamanAturan />} />
          {/* penjaga kedua: layar yang mengubah sesuatu hanya untuk admin */}
          <Route element={<KhususAdmin />}>
            <Route path="/aturan/baru" element={<HalamanFormAturan />} />
          </Route>
        </Route>
      </Route>
      {/* alamat lain yang tidak cocok dengan pola mana pun, sudah masuk atau belum */}
      <Route path="*" element={<TidakDitemukan />} />
    </Routes>
  );
}
