// App.tsx - kerangka dashboard. Saat dibuka, App bertanya ke backend "siapa saya?" (GET /auth/me).
// Modul 24: sesudah login, layar dipilih dari ALAMAT di browser (React Router), bukan dari state: /perangkat,
// /perangkat/<id>, dan /perangkat/<id>/riwayat. Peta semua alamat itu ada di satu tempat: <Routes> di bawah.
// Modul 23: selama sudah login, App menjaga SATU sambungan live (Socket.IO) lewat useRealtime().
import { useCallback, useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router";
import { ambilPerangkat, GalatApi, keluar, siapaSaya } from "./api";
import LencanaKoneksi from "./components/LencanaKoneksi";
import Login from "./components/Login";
import HalamanDaftar from "./halaman/Daftar";
import HalamanDetail from "./halaman/Detail";
import HalamanRiwayat from "./halaman/Riwayat";
import TidakDitemukan from "./halaman/TidakDitemukan";
import { socket, useRealtime } from "./soket";
import { useToko } from "./toko";
import type { Pengguna } from "./types";

export default function App() {
  // "memuat" = sedang bertanya ke backend; null = belum login; objek = sudah login
  const [pengguna, setPengguna] = useState<Pengguna | null | "memuat">("memuat");
  const [galatAwal, setGalatAwal] = useState<string | null>(null); // gangguan selain 401, ditulis di atas formulir

  // Sekali saat App tampil ([] = tanpa dependensi): cek apakah cookie login dari kunjungan sebelumnya masih berlaku.
  useEffect(() => {
    let ignore = false;
    siapaSaya()
      .then((p) => {
        if (!ignore) setPengguna(p);
      })
      .catch((err) => {
        if (ignore) return;
        // 401 = memang belum login: cukup tampilkan formulir. Selain itu (backend atau database mati): beri tahu.
        if (!(err instanceof GalatApi && err.kode === 401)) {
          setGalatAwal(err instanceof GalatApi ? err.message : "Gagal memeriksa login.");
        }
        setPengguna(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Modul 24: tidak lagi melompat ke daftar perangkat. Alamat di browser tetap, jadi sesudah login kita langsung
  // melihat layar yang tadi diminta (misalnya tautan /perangkat/f00d00000001/riwayat yang dibuka saat belum login).
  function sudahMasuk(p: Pengguna) {
    setGalatAwal(null);
    setPengguna(p);
  }

  // Modul 23: useCallback = fungsi yang SAMA di setiap render App. Tanpa ini, setiap kali App digambar ulang (misalnya
  // pindah layar), efek yang bergantung pada sesiHabis ikut diulang: sambungan live diputus lalu disambung lagi.
  const sesiHabis = useCallback(() => {
    setGalatAwal("Sesi sudah habis. Silakan masuk lagi.");
    setPengguna(null);
  }, []);

  // Tombol Keluar minimal (disempurnakan di Praktik 3): hapus sesi di backend, lalu kembali ke formulir.
  async function logout() {
    // Modul 23: putuskan sambungan live DULU (alasan "io client disconnect": tidak disambung ulang), baru hapus sesi.
    // Kalau terbalik, server yang memutus kita ("io server disconnect"), lalu soket mencoba menyambung lagi.
    socket.disconnect();
    try {
      await keluar();
    } catch {
      // backend tidak menjawab: layar tetap kembali ke formulir login
    }
    setPengguna(null);
  }

  // Modul 23: sambungan live (Socket.IO) hidup selama sudah login. Hook dipanggil sebelum "return" mana pun.
  // Modul 24: hook ini tetap di sini, DI ATAS <Routes>, jadi pindah layar tidak memutus sambungan live.
  const sudahLogin = pengguna !== null && pengguna !== "memuat";
  useRealtime(sudahLogin, sesiHabis);

  // Modul 24: daftar perangkat diambil SEKALI sesudah login, di sini (bukan lagi di layar Daftar). Dengan begitu layar
  // Detail yang dibuka langsung lewat alamatnya (tautan, tombol Back, atau F5) juga sudah punya data perangkatnya.
  useEffect(() => {
    if (!sudahLogin) return;
    let ignore = false;
    ambilPerangkat()
      .then((daftar) => {
        if (!ignore) useToko.getState().setPerangkat(daftar);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
        useToko.getState().setGalatPerangkat(err instanceof GalatApi ? err.message : "Gagal memuat perangkat.");
      });
    return () => {
      ignore = true;
    };
  }, [sudahLogin, sesiHabis]);

  if (pengguna === "memuat") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">Memuat…</div>;
  }
  if (pengguna === null) {
    return <Login galatAwal={galatAwal} onMasuk={sudahMasuk} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {/* flex-wrap: di layar sempit, menu dan tombol Keluar turun ke baris berikutnya, tidak berdesakan dengan judul */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Rumah Pintar Mini</h1>
            <LencanaKoneksi />
          </div>
          {/* NavLink = Link yang tahu apakah alamatnya sedang dibuka: isActive true di /perangkat DAN di /perangkat/<id>
              (tanpa prop end), lalu React Router memasang aria-current="page" untuk pembaca layar */}
          <nav aria-label="Menu utama" className="flex gap-1 text-sm font-medium">
            <NavLink
              to="/perangkat"
              className={({ isActive }) =>
                "inline-flex min-h-11 items-center rounded-lg px-3 " +
                (isActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700")
              }
            >
              Perangkat
            </NavLink>
          </nav>
          {/* min-w-0 + truncate: nama yang panjang dipotong dengan "…", tidak mendorong tombol keluar dari layar */}
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate text-slate-600 dark:text-slate-300">
              {pengguna.nama} <span className="text-slate-400">({pengguna.peran})</span>
            </span>
            {/* min-h-11 = tinggi minimal 44 px: cukup besar untuk diketuk jempol */}
            <button
              type="button"
              onClick={logout}
              className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-4 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Peta rute: setiap <Route> memasangkan satu pola alamat dengan satu layar. :id = bagian alamat yang berubah-ubah,
            dibaca layarnya dengan useParams(). path="*" = alamat lain yang tidak cocok dengan pola mana pun. */}
        <Routes>
          <Route path="/" element={<Navigate to="/perangkat" replace />} />
          <Route path="/perangkat" element={<HalamanDaftar />} />
          <Route path="/perangkat/:id" element={<HalamanDetail />} />
          <Route path="/perangkat/:id/riwayat" element={<HalamanRiwayat onSesiHabis={sesiHabis} />} />
          <Route path="*" element={<TidakDitemukan />} />
        </Routes>
      </main>
    </div>
  );
}
