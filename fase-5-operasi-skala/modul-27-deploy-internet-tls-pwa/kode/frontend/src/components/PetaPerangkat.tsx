// PetaPerangkat.tsx - peta perangkat (Modul 25). Setiap perangkat yang punya titik (lat, lng dari GET /devices, backend
// 1.2) menjadi lingkaran berwarna di atas peta OpenStreetMap. Warnanya ikut status LIVE di toko (acara Socket.IO, tanpa
// polling): perangkat yang terputus berubah abu-abu sendiri. Ketuk lingkaran: nama, status, terakhir dilihat, tautan detail.
// Pustakanya: Leaflet (penggambar peta) + react-leaflet (Leaflet dalam bentuk komponen React).
import "leaflet/dist/leaflet.css"; // CSS Leaflet: tanpa ini ubin peta berserakan dan tombol zoom tidak berbentuk
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router";
import { ambilPerangkat, GalatApi } from "../api";
import { PETA } from "../peta";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";
import type { Perangkat } from "../types";
import { LencanaStatus } from "./Lencana";
import TerakhirDilihat from "./TerakhirDilihat";

// Perangkat yang PASTI punya titik. "p is PerangkatBertitik" memberi tahu TypeScript: kalau fungsi ini menjawab true,
// lat dan lng perangkat itu angka (bukan null), jadi boleh langsung dipakai sebagai koordinat.
// typeof (bukan !== null): backend 1.1 sama sekali tidak mengirim lat/lng (undefined), dan itu juga berarti "tanpa titik".
type PerangkatBertitik = Perangkat & { lat: number; lng: number };
function punyaTitik(p: Perangkat): p is PerangkatBertitik {
  return typeof p.lat === "number" && typeof p.lng === "number";
}

// "lat,lng;lat,lng" -> [[lat, lng], [lat, lng]]: daftar pasangan angka yang dimengerti Leaflet
function keKoordinat(titik: string): [number, number][] {
  return titik.split(";").map((t) => t.split(",").map(Number) as [number, number]);
}

// Pas-kan peta ke semua titik (fitBounds). titik = SATU teks "lat,lng;lat,lng" (pola yang sama dengan daftarId di
// soket.ts): teks yang sama = koordinat sama, jadi efek ini hanya diulang kalau ada titik yang dipindah atau ditambah,
// bukan setiap kali status perangkat berubah. Peta yang sedang digeser atau di-zoom pengguna tidak melompat sendiri.
function PasKanPeta({ titik }: { titik: string }) {
  const peta = useMap(); // peta Leaflet milik <MapContainer> di atasnya
  useEffect(() => {
    peta.fitBounds(keKoordinat(titik), { padding: [40, 40], maxZoom: PETA.zoomDekat });
  }, [peta, titik]);
  return null; // komponen ini tidak menggambar apa pun, hanya menggerakkan peta
}

// Satu penanda. Komponen sendiri (seperti KartuPerangkat di DaftarPerangkat) supaya setiap penanda memilih statusnya
// SENDIRI dari toko: perubahan status perangkat A hanya menggambar ulang penanda A.
function TitikPerangkat({ p }: { p: PerangkatBertitik }) {
  const status = useToko((s) => s.status[p.device_id]) ?? p.status;
  const terakhir = useToko((s) => s.terakhirDilihat[p.device_id]);
  // kunci dicabut atau belum terdaftar = backend mengabaikan kirimannya, jadi status lamanya tidak dipercaya (Modul 21)
  const kirimanDiabaikan = p.kunci === "dicabut" || p.kunci === "belum-terdaftar";
  const online = status === "online" && !kirimanDiabaikan;

  return (
    // CircleMarker = lingkaran yang digambar sebagai SVG, bukan gambar ikon. Ikon penanda bawaan Leaflet (Marker) memakai
    // berkas gambar yang hilang sesudah npm run build; lingkaran tidak butuh berkas apa pun, dan warnanya bisa membawa status.
    // pathOptions boleh berubah: react-leaflet memanggil setStyle(), jadi warnanya berganti tanpa menggambar ulang peta.
    <CircleMarker
      center={[p.lat, p.lng]}
      radius={10}
      pathOptions={{ color: "#ffffff", weight: 3, fillColor: online ? PETA.warnaOnline : PETA.warnaLain, fillOpacity: 1 }}
    >
      {/* Popup: isinya baru digambar saat lingkarannya diketuk. Elemen <p> sengaja tidak dipakai: CSS Leaflet memberi
          paragraf di dalam popup jarak atas-bawah yang besar. font-sans: huruf sama dengan dashboard (Leaflet memakai
          hurufnya sendiri). Warna kotak popup diatur index.css (ikut mode gelap). */}
      <Popup>
        <div className="flex min-w-48 flex-col gap-1 font-sans text-sm">
          {/* nama diisi admin lewat API; JSX menampilkannya sebagai teks biasa (aman dari XSS) */}
          <strong className="text-base">{p.nama ?? p.device_id}</strong>
          <span className="text-slate-500 dark:text-slate-400">
            {p.lokasi ?? "lokasi belum diisi"} · <span className="font-mono">{p.device_id}</span>
          </span>
          <span>{kirimanDiabaikan ? "kiriman diabaikan backend" : <LencanaStatus status={status} />}</span>
          <TerakhirDilihat t={terakhir} jenis={p.jenis} periksaBasi={!kirimanDiabaikan} />
          {/* tautan biasa React Router: pindah ke layar detail tanpa memuat ulang halaman */}
          <Link to={"/perangkat/" + p.device_id} className="inline-flex min-h-11 items-center font-medium">
            Buka detail →
          </Link>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function PetaPerangkat() {
  const perangkat = useToko((s) => s.perangkat); // null = masih memuat
  const galat = useToko((s) => s.galatPerangkat);

  // Daftar perangkat diambil ULANG setiap kali peta dibuka (TataLetak hanya mengambilnya sekali sesudah masuk), supaya
  // titik yang baru diatur admin lewat Bruno (PUT /devices/:id/lokasi) langsung tampil tanpa F5. Titik tidak dikirim
  // lewat Socket.IO; status perangkat tetap live. Di mode dev, StrictMode menjalankan efek ini dua kali (dua GET).
  useEffect(() => {
    let ignore = false;
    ambilPerangkat()
      .then((daftar) => {
        if (!ignore) useToko.getState().setPerangkat(daftar);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
        // daftar lama sudah ada (diambil TataLetak): cukup kabari lewat toast. galatPerangkat JANGAN diisi, karena layar
        // Perangkat, Detail, Riwayat, dan formulir aturan ikut membacanya dan akan berganti kotak merah walau datanya ada.
        if (useToko.getState().perangkat !== null) {
          toast("Daftar perangkat gagal dimuat ulang: titik di peta mungkin belum yang terbaru.", "galat");
          return;
        }
        useToko.getState().setGalatPerangkat(err instanceof GalatApi ? err.message : "Gagal memuat perangkat.");
      });
    return () => {
      ignore = true; // layar Peta sudah ditutup: jawaban yang datang terlambat diabaikan
    };
  }, []);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  if (perangkat === null) return <p className="text-slate-600 dark:text-slate-400">Memuat perangkat…</p>;

  const bertitik = perangkat.filter(punyaTitik);
  const tanpaTitik = perangkat.filter((p) => !punyaTitik(p));
  const kotakPesan = "rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  // backend 1.1 (sebelum Modul 25) tidak mengirim kolom lat sama sekali: beri tahu, jangan hanya "belum ada titik"
  if (perangkat.length > 0 && perangkat.every((p) => !("lat" in p))) {
    return <p className={kotakPesan}>Backend belum mengirim titik peta (lat, lng). Halaman Peta butuh backend 1.2 (Modul 25).</p>;
  }
  if (bertitik.length === 0) {
    return (
      <p className={kotakPesan}>
        Belum ada perangkat dengan koordinat. Isi lewat Bruno <code className="font-mono">atur lokasi perangkat</code>.
      </p>
    );
  }

  const titik = bertitik.map((p) => p.lat + "," + p.lng).join(";");

  return (
    <>
      {/* Tinggi peta WAJIB ditulis (h-96 = 24rem = 384 px): tanpa tinggi, kotak peta setinggi 0 px dan tidak terlihat.
          isolate: lapisan-lapisan Leaflet (z-index 400-1000) tetap di dalam kotak ini, tidak menutupi toast (z-50).
          bounds = tampilan pertama; PasKanPeta mengurus titik yang berubah sesudahnya. */}
      <MapContainer
        bounds={keKoordinat(titik)}
        boundsOptions={{ padding: [40, 40], maxZoom: PETA.zoomDekat }}
        maxZoom={PETA.zoomMaks}
        className="isolate h-96 w-full rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <TileLayer url={PETA.ubin} attribution={PETA.atribusi} maxZoom={PETA.zoomMaks} />
        <PasKanPeta titik={titik} />
        {bertitik.map((p) => (
          <TitikPerangkat key={p.device_id} p={p} />
        ))}
      </MapContainer>

      {/* keterangan warna dengan kata, karena warna saja tidak terbaca semua orang */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: PETA.warnaOnline }} /> online
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: PETA.warnaLain }} /> tidak online,
          atau kirimannya diabaikan backend
        </span>
      </div>
      {tanpaTitik.length > 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Belum punya titik: {tanpaTitik.map((p) => p.nama ?? p.device_id).join(", ")}.
        </p>
      ) : null}
    </>
  );
}
