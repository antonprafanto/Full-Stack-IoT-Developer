// DetailPerangkat.tsx - bacaan terbaru SEMUA sensor satu perangkat, satu KartuSensor per kolom.
// Kartu yang muncul mengikuti jenis perangkat (Node 1 atau Node 2) dan kolom yang benar-benar dikirim (Lampiran A).
// Modul 23: angkanya dibaca dari toko, jadi berubah sendiri setiap kali acara telemetry tiba.
import { useToko } from "../toko";
import type { Perangkat, TelemetryNode1, TelemetryNode2 } from "../types";
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
  perangkat: Perangkat; // dikirim dari daftar: nama, lokasi, jenis, dan kunci sudah ada, tidak perlu diminta lagi
  onKembali: () => void;
};

export default function DetailPerangkat({ perangkat, onKembali }: Props) {
  const id = perangkat.device_id;
  // Selektor sempit: komponen ini hanya digambar ulang kalau nilai milik perangkat INI berubah.
  const bacaan = useToko((s) => s.terbaru[id]); // undefined = belum ada bacaan
  const status = useToko((s) => s.status[id]) ?? perangkat.status;
  const live = useToko((s) => s.koneksi === "live");
  const node2 = perangkat.jenis === "node2"; // jenis menentukan bentuk telemetry: node2, atau selain itu Node 1
  // Kunci dicabut atau perangkat belum terdaftar: backend mengabaikan kirimannya (Modul 21), jadi status yang
  // tersimpan (bisa masih "online") menyesatkan. Statusnya tidak ditampilkan, diganti "kiriman diabaikan".
  const kirimanDiabaikan = perangkat.kunci === "dicabut" || perangkat.kunci === "belum-terdaftar";

  // Pilih SATU isi untuk ditampilkan di bawah judul: belum ada bacaan, atau kartu-kartu.
  let isi;
  if (bacaan === undefined) {
    // Akankah bacaan datang? Itu bergantung kolom kunci (Modul 21).
    let pesan =
      "Belum ada bacaan dari perangkat ini sejak backend dinyalakan. Angkanya muncul sendiri begitu perangkat " +
      "mengirim (Node 1: paling lama 10 detik; Node 2: 5 menit).";
    if (perangkat.kunci === "belum-terdaftar") {
      pesan = "Perangkat ini belum terdaftar, jadi kirimannya diabaikan backend (daftarkan dulu seperti di Modul 21).";
    } else if (perangkat.kunci === "dicabut") {
      pesan = "Bacaan baru dari perangkat ini tidak akan datang selama kuncinya dicabut.";
    } else if (!live) {
      // angka awal datang lewat jawaban "ikuti", dan "ikuti" baru dikirim sesudah sambungan live tersambung
      pesan = "Menunggu sambungan live…";
    }
    isi = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600">{pesan}</p>;
  } else {
    const kartu = node2 ? kartuNode2(bacaan as TelemetryNode2) : kartuNode1(bacaan as TelemetryNode1);
    isi = (
      <>
        <p className="mt-4 text-sm text-slate-500">
          {perangkat.jenis} · {kirimanDiabaikan ? "kiriman diabaikan" : status} · diperbarui pukul {jamWib(bacaan.ts)}
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
          Kunci perangkat ini sudah dicabut: backend mengabaikan kirimannya, jadi dashboard tidak mengikutinya.
        </p>
      ) : null}
      {isi}
    </div>
  );
}
