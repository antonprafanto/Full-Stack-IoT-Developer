// DetailPerangkat.tsx - bacaan terbaru SEMUA sensor satu perangkat (GET /devices/:id/latest), satu KartuSensor per kolom.
// Kartu yang muncul mengikuti jenis perangkat (Node 1 atau Node 2) dan kolom yang benar-benar dikirim (Lampiran A).
// Kunci Tantangan Tingkat 1 Modul 22: kartu Pompa dan Tirai (lihat kartuNode1).
import { useEffect, useState } from "react";
import { ambilTerbaru, GalatApi } from "../api";
import type { BacaanTerbaru, Perangkat, TelemetryNode1, TelemetryNode2 } from "../types";
import KartuSensor from "./KartuSensor";
import { LencanaKunci } from "./Lencana";

// isi satu kartu: bentuknya sama dengan props KartuSensor
type Kartu = { label: string; nilai: number | string | null; satuan?: string; warna?: string };

function kartuNode1(t: TelemetryNode1): Kartu[] {
  const kartu: Kartu[] = [
    { label: "Suhu", nilai: t.suhu, satuan: "°C", warna: "text-teal-600" },
    { label: "Kelembapan", nilai: t.kelembapan, satuan: "%" },
    { label: "Cahaya", nilai: t.cahaya, satuan: "/4095" },
    { label: "Kelembapan tanah", nilai: t.tanah, satuan: "%" },
    { label: "Gerakan", nilai: t.gerak ? "Ada" : "Tidak ada", warna: t.gerak ? "text-amber-600" : undefined },
    { label: "Air tandon", nilai: t.level_air, satuan: "%" },
  ];
  // Sensor tanah RS-485 (Modul 15) hanya ada kalau dipasang; ketiga kolomnya selalu datang bersama (aturan 11).
  if (t.tanah_rs485 !== undefined) {
    kartu.push(
      { label: "Tanah RS-485", nilai: t.tanah_rs485, satuan: "%" },
      { label: "Suhu tanah", nilai: t.suhu_tanah ?? null, satuan: "°C" },
      { label: "EC tanah", nilai: t.ec ?? null, satuan: "µS/cm" },
    );
  }
  // Keadaan aktuator hanya DITAMPILKAN; tombol kendalinya baru dibuat di Modul 24.
  if (t.state !== undefined) {
    kartu.push(
      { label: "Lampu", nilai: t.state.lampu ? "Nyala" : "Mati", warna: t.state.lampu ? "text-amber-600" : undefined },
      { label: "Kipas", nilai: t.state.kipas ? "Nyala" : "Mati", warna: t.state.kipas ? "text-teal-600" : undefined },
      // Tantangan Tingkat 1: dua aktuator lainnya dari objek state yang sama (kontrak 1.3)
      { label: "Pompa", nilai: t.state.pompa ? "Menyiram" : "Diam", warna: t.state.pompa ? "text-sky-600" : undefined },
      { label: "Tirai", nilai: t.state.tirai, satuan: "°" }, // sudut servo tirai, 0-180 derajat
    );
  }
  return kartu;
}

function kartuNode2(t: TelemetryNode2): Kartu[] {
  const kartu: Kartu[] = [
    { label: "Suhu", nilai: t.suhu, satuan: "°C", warna: "text-teal-600" },
    { label: "Kelembapan", nilai: t.kelembapan, satuan: "%" },
    { label: "Tekanan udara", nilai: t.tekanan, satuan: "hPa" },
    { label: "Suhu tanah", nilai: t.suhu_tanah, satuan: "°C" },
    { label: "Kelembapan tanah", nilai: t.tanah, satuan: "%" },
  ];
  // Pengukur baterai itu pilihan: kalau tidak dipasang, kolomnya tidak ada sama sekali.
  if (t.baterai !== undefined) {
    kartu.push({ label: "Baterai", nilai: t.baterai, satuan: "V" });
  }
  return kartu;
}

// ts dari perangkat selalu UTC (huruf Z di ujungnya). Tampilkan sebagai jam WIB, apa pun zona waktu laptopnya.
function jamWib(ts: string): string {
  return new Date(ts).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
}

type Props = {
  perangkat: Perangkat; // dikirim dari daftar: nama, lokasi, dan kunci sudah ada, tidak perlu diminta lagi
  onKembali: () => void;
  onSesiHabis: () => void; // dipanggil kalau backend menjawab 401 (sesudah refresh pun gagal)
};

export default function DetailPerangkat({ perangkat, onKembali, onSesiHabis }: Props) {
  const [bacaan, setBacaan] = useState<BacaanTerbaru | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);
  const [belumAda, setBelumAda] = useState(false); // 404: belum ada bacaan sejak backend dinyalakan
  const id = perangkat.device_id;

  // Isi awal state di atas sudah "bersih" untuk satu perangkat. Untuk perangkat lain, App memasang key={device_id},
  // jadi React membuat DetailPerangkat baru dengan state segar; efek ini tidak perlu mengosongkan state sendiri.
  // Daftar dependensi di akhir efek = semua nilai dari luar yang dipakai efek (npm run lint memperingatkan yang terlupa).
  useEffect(() => {
    let ignore = false;
    ambilTerbaru(id)
      .then((b) => {
        if (!ignore) setBacaan(b);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
        if (err instanceof GalatApi && err.kode === 404) return setBelumAda(true); // wajar, bukan kerusakan
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat bacaan.");
      });
    return () => {
      ignore = true;
    };
  }, [id, onSesiHabis]);

  // Pilih SATU isi untuk ditampilkan di bawah judul: memuat, galat, belum ada bacaan, atau kartu-kartu.
  let isi = <p className="mt-4 text-slate-500">Memuat bacaan…</p>;
  if (galat !== null) {
    isi = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{galat}</p>;
  } else if (belumAda) {
    // 404 = belum ada bacaan di memori backend. Akankah bacaan datang? Itu bergantung kolom kunci (Modul 21):
    // kiriman perangkat yang belum terdaftar atau kuncinya dicabut DIABAIKAN backend, jadi menunggu pun percuma.
    let pesan = "Belum ada bacaan dari perangkat ini sejak backend dinyalakan. Tunggu kiriman berikutnya, lalu buka lagi.";
    if (perangkat.kunci === "belum-terdaftar") {
      pesan = "Perangkat ini belum terdaftar, jadi kirimannya diabaikan backend (daftarkan dulu seperti di Modul 21).";
    } else if (perangkat.kunci === "dicabut") {
      pesan = "Tidak ada bacaan tersimpan dari perangkat ini, dan bacaan baru tidak akan datang selama kuncinya dicabut.";
    }
    isi = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600">{pesan}</p>;
  } else if (bacaan !== null) {
    // jenis memberi tahu bentuk telemetry-nya: node2 -> kolom Node 2, selain itu kolom Node 1
    const kartu =
      bacaan.jenis === "node2"
        ? kartuNode2(bacaan.telemetry as TelemetryNode2)
        : kartuNode1(bacaan.telemetry as TelemetryNode1);
    // Kunci dicabut atau perangkat belum terdaftar: backend mengabaikan kirimannya (Modul 21), jadi status yang
    // tersimpan (bisa masih "online") menyesatkan. Statusnya tidak ditampilkan, diganti "kiriman diabaikan".
    const kirimanDiabaikan = perangkat.kunci === "dicabut" || perangkat.kunci === "belum-terdaftar";
    isi = (
      <>
        <p className="mt-4 text-sm text-slate-500">
          {bacaan.jenis} · {kirimanDiabaikan ? "kiriman diabaikan" : bacaan.status} · diperbarui pukul{" "}
          {jamWib(bacaan.telemetry.ts)}
        </p>
        {/* mobile first: dua kolom di HP, tiga kolom mulai lebar sm (640 px) */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kartu.map((k) => (
            <KartuSensor key={k.label} label={k.label} nilai={k.nilai} satuan={k.satuan} warna={k.warna} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      {/* min-h-11 = tinggi minimal 44 px: tautan kecil pun mudah diketuk jempol */}
      <button
        type="button"
        onClick={onKembali}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline"
      >
        ← Kembali ke daftar
      </button>
      {/* flex-wrap + break-words: nama panjang turun baris, lencana tidak terdorong keluar layar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800">{perangkat.nama ?? id}</h2>
        <LencanaKunci kunci={perangkat.kunci} />
      </div>
      <p className="text-sm text-slate-500">
        {perangkat.lokasi ?? "lokasi belum diisi"} · <span className="font-mono text-xs">{id}</span>
      </p>
      {perangkat.kunci === "dicabut" ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Kunci perangkat ini sudah dicabut: backend mengabaikan kirimannya. Bacaan di bawah (kalau ada) adalah kiriman
          terakhir sebelum dicabut.
        </p>
      ) : null}
      {isi}
    </div>
  );
}
