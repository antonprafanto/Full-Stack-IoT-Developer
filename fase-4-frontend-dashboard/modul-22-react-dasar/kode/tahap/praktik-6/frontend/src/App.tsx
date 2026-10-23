// App.tsx - kerangka dashboard v0.1. Saat dibuka, App bertanya ke backend "siapa saya?" (GET /auth/me),
// lalu memilih satu dari tiga layar dengan state biasa (React Router baru di Modul 24): login, daftar, atau detail.
import { useEffect, useState } from "react";
import { GalatApi, keluar, siapaSaya } from "./api";
import DaftarPerangkat from "./components/DaftarPerangkat";
import DetailPerangkat from "./components/DetailPerangkat";
import Login from "./components/Login";
import type { Pengguna, Perangkat } from "./types";

// layar yang sedang tampil sesudah login: daftar, atau detail satu perangkat (beserta datanya dari daftar)
type Tampilan = { nama: "daftar" } | { nama: "detail"; perangkat: Perangkat };

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

  function sesiHabis() {
    setGalatAwal("Sesi sudah habis. Silakan masuk lagi.");
    setPengguna(null);
  }

  // Tombol Keluar minimal (disempurnakan di Modul 24): hapus sesi di backend, lalu kembali ke formulir.
  async function logout() {
    try {
      await keluar();
    } catch {
      // backend tidak menjawab: layar tetap kembali ke formulir login
    }
    setPengguna(null);
  }

  if (pengguna === "memuat") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">Memuat…</div>;
  }
  if (pengguna === null) {
    return <Login galatAwal={galatAwal} onMasuk={sudahMasuk} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-slate-800">Rumah Pintar Mini</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {pengguna.nama} <span className="text-slate-400">({pengguna.peran})</span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {tampilan.nama === "daftar" ? (
          <>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Daftar Perangkat</h2>
            <DaftarPerangkat
              onPilih={(perangkat) => setTampilan({ nama: "detail", perangkat })}
              onSesiHabis={sesiHabis}
            />
          </>
        ) : (
          // key = device_id: perangkat lain berarti DetailPerangkat baru dengan state segar,
          // bukan sisa bacaan perangkat sebelumnya (pola resmi React "mengosongkan state lewat key")
          <DetailPerangkat
            key={tampilan.perangkat.device_id}
            perangkat={tampilan.perangkat}
            onKembali={() => setTampilan({ nama: "daftar" })}
            onSesiHabis={sesiHabis}
          />
        )}
      </main>
    </div>
  );
}
