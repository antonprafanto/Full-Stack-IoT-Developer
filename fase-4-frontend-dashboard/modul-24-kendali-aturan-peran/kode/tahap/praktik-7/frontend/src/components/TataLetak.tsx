// TataLetak.tsx - bingkai semua layar sesudah masuk: kepala (judul, lencana Live, menu, nama, tombol Keluar) dan
// <Outlet />, tempat React Router menaruh layar yang cocok dengan alamatnya (Daftar, Detail, Riwayat, Aturan).
import { useEffect } from "react";
import { NavLink, Outlet } from "react-router";
import { ambilPerangkat, GalatApi, keluar } from "../api";
import { socket } from "../soket";
import { kosongkanSemua, sesiHabis, useToko } from "../toko";
import LencanaKoneksi from "./LencanaKoneksi";
import WadahToast from "./WadahToast";

// Gaya tautan menu. NavLink memanggil fungsi ini dengan isActive = true kalau alamatnya sedang dibuka.
function kelasMenu({ isActive }: { isActive: boolean }): string {
  return (
    "inline-flex min-h-11 items-center rounded-lg px-3 " +
    (isActive
      ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700")
  );
}

export default function TataLetak() {
  const pengguna = useToko((s) => s.pengguna);

  // Daftar perangkat diambil SEKALI setiap kali bingkai ini muncul (sesudah masuk), bukan di layar Daftar. Dengan begitu
  // layar Detail yang dibuka langsung lewat alamatnya (tautan, tombol Back, atau F5) juga sudah punya data perangkatnya.
  useEffect(() => {
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
  }, []);

  // Modul 24: Keluar yang tuntas, empat langkah berurutan.
  async function klikKeluar() {
    // 1. Putuskan sambungan live DULU (alasan "io client disconnect": tidak disambung ulang). Kalau terbalik, server yang
    //    memutus kita ("io server disconnect"), lalu soket mencoba menyambung lagi (Modul 23).
    socket.disconnect();
    // 2. Hapus sesi di backend. Cookie HttpOnly tidak bisa dihapus JavaScript; hanya jawaban backend yang menghapusnya.
    let pesan = "Kamu sudah keluar.";
    try {
      await keluar();
    } catch {
      pesan =
        "Keluar belum tuntas: server tidak menjawab, jadi sesi di server belum terhapus. Setelah server menyala lagi, " +
        "muat ulang halaman ini lalu tekan Keluar sekali lagi.";
    }
    // 3. Kosongkan semua isi toko: orang berikutnya di tab ini tidak melihat sisa data atau tombol akun sebelumnya.
    //    true = keluar sengaja: alamat layar ini tidak dititipkan ke layar Masuk (lihat JagaMasuk).
    kosongkanSemua(pesan, true);
    // 4. Pindah ke layar Masuk: dikerjakan penjaga rute (JagaMasuk) begitu toko kosong, dengan replace. Tombol Back
    //    tidak kembali ke layar dashboard tadi; kalaupun Back dipakai, penjaga tetap mengalihkan ke /masuk.
  }

  // JagaMasuk sudah memastikan pengguna sudah masuk; baris ini hanya memberi tahu TypeScript
  if (pengguna === null || pengguna === "memuat") return null;

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
            <NavLink to="/perangkat" className={kelasMenu}>
              Perangkat
            </NavLink>
            {/* tanpa prop end juga: tetap aktif di /aturan/baru dan /aturan/<nomor> */}
            <NavLink to="/aturan" className={kelasMenu}>
              Aturan
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
              onClick={klikKeluar}
              className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-4 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Modul 24: toast tampil di semua layar sesudah masuk (pindah layar tidak menghapusnya): di bawah layar HP dan
          tablet, di pojok kanan atas laptop lebar (lihat WadahToast) */}
      <WadahToast />

      {/* pb-64 = ruang kosong 16rem (256 px) di ujung bawah halaman, setinggi dua toast empat baris: tombol paling bawah
          (Simpan aturan, Hapus aturan) selalu bisa digulir ke atas toast. Mulai 1280 px (xl) toast ada di samping isi,
          jadi cukup pb-6. */}
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-64 xl:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
