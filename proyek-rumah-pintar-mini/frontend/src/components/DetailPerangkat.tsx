// DetailPerangkat.tsx - bacaan terbaru SEMUA sensor satu perangkat, satu KartuSensor per kolom.
// Kartu yang muncul mengikuti jenis perangkat (Node 1 atau Node 2) dan kolom yang benar-benar dikirim (Lampiran A).
// Modul 23: angkanya dibaca dari toko, jadi berubah sendiri setiap kali acara telemetry tiba; ditambah grafik 5 menit
// dan gauge.
// Modul 24: "Kembali ke daftar" dan "Riwayat →" menjadi tautan React Router ke alamat masing-masing; akun admin mendapat
// bagian Kendali (lampu, kipas, pompa).
import { Link } from "react-router";
import { useAdmin, useToko } from "../toko";
import type { Jenis, Perangkat, StatusPerangkat, Telemetry, TelemetryNode1, TelemetryNode2 } from "../types";
import { jamWib } from "../waktu";
import Gauge from "./Gauge";
import GrafikLive from "./GrafikLive";
import KartuSensor from "./KartuSensor";
import { LencanaKunci, LencanaStatus } from "./Lencana";
import TerakhirDilihat from "./TerakhirDilihat";
import TombolPompa from "./TombolPompa";
import TombolSakelar from "./TombolSakelar";

// isi satu kartu: bentuknya sama dengan props KartuSensor
type Kartu = { label: string; nilai: number | string | null; satuan?: string; warna?: string };

function kartuNode1(t: TelemetryNode1, admin: boolean): Kartu[] {
  // kelembapan tanah dan air tandon tampil sebagai gauge, jadi tidak diulang di sini
  const kartu: Kartu[] = [
    { label: "Suhu", nilai: t.suhu, satuan: "°C", warna: "text-teal-600 dark:text-teal-400" },
    { label: "Kelembapan", nilai: t.kelembapan, satuan: "%" },
    { label: "Cahaya", nilai: t.cahaya, satuan: "/4095" },
    { label: "Gerakan", nilai: t.gerak ? "Ada" : "Tidak ada", warna: t.gerak ? "text-amber-600 dark:text-amber-400" : undefined },
  ];
  // Sensor tanah RS-485 (Modul 15) hanya ada kalau dipasang; ketiga kolomnya selalu datang bersama (aturan 11).
  if (t.tanah_rs485 !== undefined) {
    kartu.push(
      { label: "Tanah RS-485", nilai: t.tanah_rs485, satuan: "%" },
      { label: "Suhu tanah", nilai: t.suhu_tanah ?? null, satuan: "°C" },
      { label: "EC tanah", nilai: t.ec ?? null, satuan: "µS/cm" },
    );
  }
  // Keadaan aktuator. Modul 24: admin mengendalikan lampu, kipas, dan pompa dari bagian Kendali, jadi ketiga kartunya
  // tidak diulang untuk admin; viewer hanya melihat kartunya. Tirai tetap kartu (tombolnya: Tantangan Tingkat 1).
  if (t.state !== undefined) {
    if (!admin) {
      kartu.push(
        { label: "Lampu", nilai: t.state.lampu ? "Nyala" : "Mati", warna: t.state.lampu ? "text-amber-600 dark:text-amber-400" : undefined },
        { label: "Kipas", nilai: t.state.kipas ? "Nyala" : "Mati", warna: t.state.kipas ? "text-teal-600 dark:text-teal-400" : undefined },
        { label: "Pompa", nilai: t.state.pompa ? "Menyiram" : "Diam", warna: t.state.pompa ? "text-sky-600 dark:text-sky-400" : undefined },
      );
    }
    kartu.push({ label: "Tirai", nilai: t.state.tirai, satuan: "°" });
  }
  return kartu;
}

function kartuNode2(t: TelemetryNode2): Kartu[] {
  // kelembapan tanah tampil sebagai gauge, jadi tidak diulang di sini
  const kartu: Kartu[] = [
    { label: "Suhu", nilai: t.suhu, satuan: "°C", warna: "text-teal-600 dark:text-teal-400" },
    { label: "Kelembapan", nilai: t.kelembapan, satuan: "%" },
    { label: "Tekanan udara", nilai: t.tekanan, satuan: "hPa" },
    { label: "Suhu tanah", nilai: t.suhu_tanah, satuan: "°C" },
  ];
  // Pengukur baterai itu pilihan: kalau tidak dipasang, kolomnya tidak ada sama sekali.
  if (t.baterai !== undefined) {
    kartu.push({ label: "Baterai", nilai: t.baterai, satuan: "V" });
  }
  return kartu;
}

// Gauge hanya untuk besaran yang batasnya jelas, 0-100 %: kelembapan tanah, dan isi tandon Node 1.
function gauge(bacaan: Telemetry, node2: boolean) {
  if (node2) {
    return <Gauge label="Kelembapan tanah" nilai={(bacaan as TelemetryNode2).tanah} />;
  }
  const t = bacaan as TelemetryNode1;
  return (
    <>
      <Gauge label="Kelembapan tanah" nilai={t.tanah} />
      {/* air tandon di bawah 20 % = "rendah" (ambang kontrak data, sama dengan aturan kiriman segera Node 1) */}
      <Gauge label="Air tandon" nilai={t.level_air} ambangRendah={20} />
    </>
  );
}

// Modul 24: kenapa tombol kendali tidak bisa dipakai saat ini (null = bisa). Backend memeriksa hal yang sama (409),
// tetapi lebih ramah kalau tombolnya sudah memberi tahu sebelum diketuk.
const TEKS_STATUS: Record<StatusPerangkat, string> = {
  online: "online",
  offline: "offline",
  "offline-mode": "dalam mode offline",
  "belum-diketahui": "belum diketahui statusnya",
};
function alasanTombolMati(jenis: Jenis, status: StatusPerangkat): string | null {
  if (jenis === "belum-diketahui") return "Jenis perangkat belum diketahui: tunggu kiriman pertamanya.";
  if (status !== "online") return "Perangkat sedang " + TEKS_STATUS[status] + ": perintah tidak bisa dikirim.";
  return null;
}

type Props = {
  perangkat: Perangkat; // dari daftar di toko (Modul 24): nama, lokasi, jenis, dan kunci sudah ada, tidak perlu diminta lagi
};

export default function DetailPerangkat({ perangkat }: Props) {
  const id = perangkat.device_id;
  // Selektor sempit: komponen ini hanya digambar ulang kalau nilai milik perangkat INI berubah.
  const bacaan = useToko((s) => s.terbaru[id]); // undefined = belum ada bacaan
  const status = useToko((s) => s.status[id]) ?? perangkat.status;
  const terakhir = useToko((s) => s.terakhirDilihat[id]);
  const live = useToko((s) => s.koneksi === "live");
  const admin = useAdmin(); // Modul 24: bagian Kendali hanya digambar kalau peran admin SUDAH pasti
  // Modul 24: jenis dari daftar (GET /devices, diambil sekali sesudah masuk). Perangkat yang mengirim pertama kali SESUDAH
  // daftar diambil masih "belum-diketahui" di daftar, padahal kirimannya sudah tiba: jenisnya dibaca dari kiriman itu
  // (hanya Node 2 yang punya tekanan udara). Tanpa ini, tombol kendalinya mati sampai halaman dimuat ulang.
  const jenis: Jenis =
    perangkat.jenis !== "belum-diketahui" || bacaan === undefined ? perangkat.jenis : "tekanan" in bacaan ? "node2" : "node1";
  const node2 = jenis === "node2"; // jenis menentukan bentuk telemetry: node2, atau selain itu Node 1
  // Kunci dicabut atau perangkat belum terdaftar: backend mengabaikan kirimannya (Modul 21), jadi status yang
  // tersimpan (bisa masih "online") menyesatkan. Statusnya tidak ditampilkan, diganti "kiriman diabaikan".
  const kirimanDiabaikan = perangkat.kunci === "dicabut" || perangkat.kunci === "belum-terdaftar";
  // keadaan lampu, kipas, pompa, dan tirai yang dilaporkan perangkat; undefined = belum ada (atau Node 2)
  const keadaan = bacaan === undefined || node2 ? undefined : (bacaan as TelemetryNode1).state;
  const alasan = alasanTombolMati(jenis, status);

  // Pilih SATU isi untuk bagian bawah: belum ada bacaan, atau gauge + kartu-kartu.
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
    isi = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{pesan}</p>;
  } else {
    const kartu = node2 ? kartuNode2(bacaan as TelemetryNode2) : kartuNode1(bacaan as TelemetryNode1, admin);
    // angka awal dari database (backend baru dinyalakan) tidak membawa keadaan aktuator: database tidak menyimpannya
    const tanpaKeadaan = !node2 && (bacaan as TelemetryNode1).state === undefined;
    isi = (
      // sambungan live putus = angka di bawah tidak diperbarui lagi: dibuat pudar supaya tampak basi
      <div className={live ? "" : "opacity-60"}>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          diperbarui pukul {jamWib(bacaan.ts)}
          {live ? null : " · sambungan live terputus, angka ini mungkin sudah basi"}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">{gauge(bacaan, node2)}</div>
        {/* mobile first: dua kolom di HP, tiga kolom mulai lebar sm (640 px) */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kartu.map((k) => (
            <KartuSensor key={k.label} label={k.label} nilai={k.nilai} satuan={k.satuan} warna={k.warna} />
          ))}
        </div>
        {tanpaKeadaan ? (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Keadaan lampu, kipas, pompa, dan tirai tidak disimpan di database, jadi kartunya baru muncul bersama kiriman
            berikutnya.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        {/* min-h-11 = tinggi minimal 44 px: tautan kecil pun mudah diketuk jempol */}
        <Link to="/perangkat" className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
          ← Kembali ke daftar
        </Link>
        <Link
          to={"/perangkat/" + id + "/riwayat"}
          className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
        >
          Riwayat →
        </Link>
      </div>
      {/* flex-wrap + break-words: nama panjang turun baris, lencana tidak terdorong keluar layar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800 dark:text-slate-100">{perangkat.nama ?? id}</h2>
        <LencanaKunci kunci={perangkat.kunci} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {perangkat.lokasi ?? "lokasi belum diisi"} · <span className="font-mono text-xs">{id}</span>
      </p>
      {perangkat.kunci === "dicabut" ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          Kunci perangkat ini sudah dicabut: backend mengabaikan kirimannya, jadi dashboard tidak mengikutinya.
        </p>
      ) : null}
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        <span>{jenis}</span>
        <span>·</span>
        {kirimanDiabaikan ? <span>kiriman diabaikan</span> : <LencanaStatus status={status} />}
        <span>·</span>
        <TerakhirDilihat t={terakhir} jenis={jenis} periksaBasi={!kirimanDiabaikan} />
      </p>
      {/* Modul 24: bagian Kendali, khusus admin, untuk Node 1 dan simulator (Node 2 tidak menerima perintah) */}
      {admin && !node2 && !kirimanDiabaikan ? (
        <section aria-labelledby="judul-kendali" className="mt-4">
          <h3 id="judul-kendali" className="font-semibold text-slate-800 dark:text-slate-100">
            Kendali
          </h3>
          {keadaan === undefined ? (
            <p className="mt-2 rounded-lg bg-white p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Tombol kendali muncul begitu perangkat melaporkan keadaan lampu, kipas, dan pompanya (kiriman berikutnya).
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <TombolSakelar deviceId={id} target="lampu" label="Lampu" nilai={keadaan.lampu} alasanMati={alasan} />
              <TombolSakelar deviceId={id} target="kipas" label="Kipas" nilai={keadaan.kipas} alasanMati={alasan} />
              <TombolPompa deviceId={id} menyiram={keadaan.pompa} alasanMati={alasan} />
            </div>
          )}
        </section>
      ) : null}
      {/* Grafik 5 menit hanya untuk perangkat yang mengirim tiap 10 detik (Node 1 dan simulator) */}
      {kirimanDiabaikan ? null : node2 ? (
        <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Node 2 mengirim tiap 5 menit, jadi grafik 5 menit terakhir hampir selalu kosong. Grafiknya ada di Riwayat.
        </p>
      ) : (
        <GrafikLive deviceId={id} />
      )}
      {isi}
    </div>
  );
}
