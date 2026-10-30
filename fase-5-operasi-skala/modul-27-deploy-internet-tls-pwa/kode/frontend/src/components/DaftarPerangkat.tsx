// DaftarPerangkat.tsx - menampilkan daftar perangkat (GET /devices) sebagai kartu-kartu yang bisa diketuk.
// Tiga keadaan selalu disiapkan: memuat, galat, dan kosong (pola yang dipakai setiap layar yang mengambil data).
// Modul 23: daftarnya disimpan di toko (supaya soket.ts tahu perangkat mana yang diikuti), dan setiap kartu hidup:
// warna status, suhu terbaru, dan "terakhir dilihat" berubah sendiri tanpa memuat ulang halaman.
// Modul 24: daftarnya diambil SEKALI sesudah login (bukan lagi di layar ini); layar ini cukup membacanya dari toko.
// Kartu menjadi tautan ke alamat detailnya (/perangkat/<device_id>).
import { Link } from "react-router";
import { useToko } from "../toko";
import type { Perangkat, StatusPerangkat } from "../types";
import { LencanaKunci, LencanaStatus } from "./Lencana";
import TerakhirDilihat from "./TerakhirDilihat";

// Kartu status merah/hijau: garis tebal di tepi kiri kartu mengikuti status (warna + teks di lencananya)
const TEPI: Record<StatusPerangkat, string> = {
  online: "border-l-green-500 dark:border-l-green-500", // diulang dengan dark: supaya tidak tertimpa dark:border-slate-700 kartu
  offline: "border-l-red-500 dark:border-l-red-500",
  "offline-mode": "border-l-slate-400",
  "belum-diketahui": "border-l-slate-300 dark:border-l-slate-600",
};

// Satu kartu perangkat. Dibuat komponen sendiri supaya setiap kartu memilih datanya SENDIRI dari toko:
// telemetry perangkat A hanya menggambar ulang kartu A, bukan seluruh daftar.
function KartuPerangkat({ p }: { p: Perangkat }) {
  const status = useToko((s) => s.status[p.device_id]) ?? p.status;
  const suhu = useToko((s) => s.terbaru[p.device_id]?.suhu); // undefined = belum ada bacaan; null = sensor gagal
  const terakhir = useToko((s) => s.terakhirDilihat[p.device_id]);
  // kunci dicabut atau belum terdaftar = backend mengabaikan kirimannya, jadi status lamanya
  // (bisa masih "online") menyesatkan dan tidak ditampilkan
  const kirimanDiabaikan = p.kunci === "dicabut" || p.kunci === "belum-terdaftar";

  return (
    // Modul 24: seluruh kartu adalah tautan ke alamat detailnya. Tautan sungguhan (bukan tombol) bisa dibuka di tab
    // baru, disalin alamatnya, dan dikenali pembaca layar sebagai "tautan".
    <Link
      to={"/perangkat/" + p.device_id}
      className={
        "block w-full rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm hover:border-teal-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 " +
        (kirimanDiabaikan ? "border-l-slate-300 dark:border-l-slate-600" : TEPI[status])
      }
    >
      <span className="flex items-center justify-between gap-2">
        {/* nama dan lokasi diisi admin lewat API; JSX menampilkannya sebagai teks biasa, jadi kode HTML di dalamnya tidak dijalankan (aman dari XSS) */}
        {/* min-w-0 + truncate: nama panjang dipotong "…" supaya lencana tetap utuh di kanan */}
        <span className="min-w-0 truncate font-semibold text-slate-800 dark:text-slate-100">{p.nama ?? p.device_id}</span>
        <span className="flex shrink-0 gap-1">
          {kirimanDiabaikan ? null : <LencanaStatus status={status} />}
          <LencanaKunci kunci={p.kunci} />
        </span>
      </span>
      <span className="mt-1 block truncate text-sm text-slate-500 dark:text-slate-400">
        {p.lokasi ?? "lokasi belum diisi"} · <span className="font-mono">{p.device_id}</span>
      </span>
      <span className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-sm text-slate-500 dark:text-slate-400">
        {kirimanDiabaikan ? (
          <span>kiriman diabaikan backend</span>
        ) : (
          <span className="text-slate-700 dark:text-slate-200">
            {suhu === undefined ? "menunggu bacaan…" : <>Suhu {suhu === null ? "—" : suhu + " °C"}</>}
          </span>
        )}
        <TerakhirDilihat t={terakhir} jenis={p.jenis} periksaBasi={!kirimanDiabaikan} />
      </span>
    </Link>
  );
}

export default function DaftarPerangkat() {
  const perangkat = useToko((s) => s.perangkat); // null = masih memuat
  const galat = useToko((s) => s.galatPerangkat);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  if (perangkat === null) return <p className="text-slate-600 dark:text-slate-400">Memuat perangkat…</p>;
  if (perangkat.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Belum ada perangkat terdaftar (pendaftaran perangkat: Modul 21).</p>;
  }

  return (
    // mobile first: satu kolom di HP; mulai lebar sm (640 px) ke atas, dua kolom
    <ul className="grid gap-3 sm:grid-cols-2">
      {perangkat.map((p) => (
        // key = tanda pengenal tiap butir daftar; device_id pasti unik
        <li key={p.device_id} className="min-w-0">
          <KartuPerangkat p={p} />
        </li>
      ))}
    </ul>
  );
}
