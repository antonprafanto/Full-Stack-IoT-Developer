// App.tsx - kerangka dashboard. Saat dibuka, App bertanya ke backend "siapa saya?" (GET /auth/me),
// lalu memilih layar dengan state biasa (React Router baru di Modul 24): login, daftar, detail, atau riwayat.
// Modul 23: selama sudah login, App menjaga SATU sambungan live (Socket.IO) lewat useRealtime().
// Kunci Tantangan Tingkat 3 Modul 23: layar keempat "banding" (dua perangkat dalam satu grafik riwayat 7 hari).
import { useCallback, useEffect, useState } from "react";
import { GalatApi, keluar, siapaSaya } from "./api";
import BandingRiwayat from "./components/BandingRiwayat";
import DaftarPerangkat from "./components/DaftarPerangkat";
import DetailPerangkat from "./components/DetailPerangkat";
import LencanaKoneksi from "./components/LencanaKoneksi";
import Login from "./components/Login";
import Riwayat from "./components/Riwayat";
import { socket, useRealtime } from "./soket";
import { useToko } from "./toko";
import type { Pengguna, Perangkat } from "./types";

// layar yang sedang tampil sesudah login: daftar, detail satu perangkat, riwayat satu perangkat, atau banding
type Tampilan =
  | { nama: "daftar" }
  | { nama: "detail"; perangkat: Perangkat }
  | { nama: "riwayat"; perangkat: Perangkat }
  | { nama: "banding" };

export default function App() {
  // "memuat" = sedang bertanya ke backend; null = belum login; objek = sudah login
  const [pengguna, setPengguna] = useState<Pengguna | null | "memuat">("memuat");
  const [galatAwal, setGalatAwal] = useState<string | null>(null); // gangguan selain 401, ditulis di atas formulir
  const [tampilan, setTampilan] = useState<Tampilan>({ nama: "daftar" });

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

  function sudahMasuk(p: Pengguna) {
    setGalatAwal(null);
    setPengguna(p);
    setTampilan({ nama: "daftar" }); // selalu mulai dari daftar perangkat
  }

  // Modul 23: useCallback = fungsi yang SAMA di setiap render App. Tanpa ini, setiap kali App digambar ulang (misalnya
  // pindah layar), efek yang bergantung pada sesiHabis ikut diulang: sambungan live diputus lalu disambung lagi.
  const sesiHabis = useCallback(() => {
    setGalatAwal("Sesi sudah habis. Silakan masuk lagi.");
    setPengguna(null);
  }, []);

  // Tombol Keluar minimal (disempurnakan di Modul 24): hapus sesi di backend, lalu kembali ke formulir.
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
  const sudahLogin = pengguna !== null && pengguna !== "memuat";
  useRealtime(sudahLogin, sesiHabis);
  const daftarSiap = useToko((s) => s.perangkat !== null); // daftar perangkat sudah dimuat layar Daftar Perangkat

  if (pengguna === "memuat") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">Memuat…</div>;
  }
  if (pengguna === null) {
    return <Login galatAwal={galatAwal} onMasuk={sudahMasuk} />;
  }

  // Pilih SATU layar untuk bagian utama
  let layar;
  if (tampilan.nama === "daftar") {
    layar = (
      <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Daftar Perangkat</h2>
          {/* disabled sampai daftar termuat: layar banding memakai daftar perangkat dari toko */}
          <button
            type="button"
            disabled={!daftarSiap}
            onClick={() => setTampilan({ nama: "banding" })}
            className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline disabled:opacity-40 dark:text-teal-300"
          >
            Bandingkan 7 hari →
          </button>
        </div>
        <DaftarPerangkat onPilih={(perangkat) => setTampilan({ nama: "detail", perangkat })} onSesiHabis={sesiHabis} />
      </>
    );
  } else if (tampilan.nama === "detail") {
    const perangkat = tampilan.perangkat;
    layar = (
      // key = device_id: perangkat lain berarti DetailPerangkat baru dengan state segar,
      // bukan sisa bacaan perangkat sebelumnya (pola resmi React "mengosongkan state lewat key")
      <DetailPerangkat
        key={perangkat.device_id}
        perangkat={perangkat}
        onKembali={() => setTampilan({ nama: "daftar" })}
        onRiwayat={() => setTampilan({ nama: "riwayat", perangkat })}
      />
    );
  } else if (tampilan.nama === "riwayat") {
    const perangkat = tampilan.perangkat;
    layar = (
      <Riwayat
        perangkat={perangkat}
        onKembali={() => setTampilan({ nama: "detail", perangkat })}
        onSesiHabis={sesiHabis}
      />
    );
  } else {
    layar = <BandingRiwayat onKembali={() => setTampilan({ nama: "daftar" })} onSesiHabis={sesiHabis} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {/* flex-wrap: di layar sempit, nama + tombol Keluar turun ke baris kedua, tidak berdesakan dengan judul */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Rumah Pintar Mini</h1>
            <LencanaKoneksi />
          </div>
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

      <main className="mx-auto max-w-3xl px-4 py-6">{layar}</main>
    </div>
  );
}
