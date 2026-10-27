// types.ts - bentuk data dari kontrak data (Lampiran A Silabus, KONTRAK-DATA.md 1.4) dan dari jawaban API backend v1.0.
// Nama kolomnya sama persis dengan yang dikirim backend, jadi data dari server langsung "pas".
// Modul 25: backend 1.2 menambah titik peta (lat, lng) di jawaban GET /devices.
// Isinya hanya tipe (label untuk TypeScript): saat halaman berjalan di browser, semua baris ini sudah dihapus Vite.
// Pilihan nilai ditulis sebagai gabungan teks ("a" | "b"), bukan enum: templat kita melarang enum (erasableSyntaxOnly).

// jenis perangkat menurut backend
export type Jenis = "node1" | "node2" | "belum-diketahui";

// status dari topik rpm/<device_id>/status; "belum-diketahui" = terdaftar, tetapi belum pernah mengirim status
export type StatusPerangkat = "online" | "offline" | "offline-mode" | "belum-diketahui";

// kolom kunci di GET /devices (Modul 21)
export type StatusKunci = "aktif" | "dicabut" | "tanpa-kunci" | "belum-terdaftar";

// satu baris jawaban GET /devices
export type Perangkat = {
  device_id: string; // 12 digit heksadesimal huruf kecil, misalnya "a4cf12e5b7c0"
  nama: string | null; // null = belum diberi nama oleh admin
  lokasi: string | null;
  // Modul 25: titik perangkat di peta, dalam derajat desimal (lintang -90 sampai 90, bujur -180 sampai 180).
  // null = titiknya belum diisi admin. Backend selalu mengisi keduanya berpasangan (dua-duanya angka atau dua-duanya null).
  lat: number | null; // lintang (latitude), misalnya -6.1754
  lng: number | null; // bujur (longitude), misalnya 106.8272
  jenis: Jenis;
  status: StatusPerangkat;
  terakhir_dilihat: string | null; // waktu UTC, misalnya "2026-10-23T09:41:30Z"
  kunci: StatusKunci;
  terdaftar: string | null;
  kunci_dibuat: string | null;
  dicabut: string | null;
  penghubung: string | null; // khusus Node 2: device_id Node 1 yang meneruskan datanya
};

// keadaan empat aktuator Node 1 (kontrak 1.3)
export type Keadaan = {
  kipas: boolean;
  lampu: boolean;
  pompa: boolean;
  tirai: number; // sudut servo tirai, 0-180 derajat
};

// isi telemetry Node 1. "| null" = sensornya gagal dibaca (aturan 7)
export type TelemetryNode1 = {
  ts: string; // waktu bacaan dalam UTC, dibuat perangkat (aturan 1)
  fw: string; // versi firmware
  suhu: number | null; // °C
  kelembapan: number | null; // %
  cahaya: number; // 0 (gelap gulita) sampai 4095 (sangat terang)
  tanah: number; // % kelembapan tanah
  gerak: boolean;
  level_air: number | null; // % isi tandon
  // tanda ? = kolomnya boleh tidak ada sama sekali
  tanah_rs485?: number | null; // sensor tanah RS-485 (kontrak 1.2): tiga kolom ini selalu datang bersama
  suhu_tanah?: number | null; // °C
  ec?: number | null; // µS/cm
  state?: Keadaan; // kontrak 1.3
};

// isi telemetry Node 2 (kontrak 1.1), diteruskan Node 1 lewat ESP-NOW
export type TelemetryNode2 = {
  ts: string;
  fw: string;
  suhu: number | null;
  kelembapan: number | null;
  tekanan: number | null; // hPa
  suhu_tanah: number | null;
  tanah: number | null;
  baterai?: number | null; // volt; kolomnya tidak ada kalau pengukur baterai tidak dipasang
};

export type Telemetry = TelemetryNode1 | TelemetryNode2;

// jawaban POST /auth/login, POST /auth/refresh, dan GET /auth/me
export type Pengguna = {
  id: number;
  email: string;
  nama: string;
  peran: "admin" | "viewer";
};

// ---- Modul 23: acara Socket.IO, disalin dari backend/src/services/realtime.ts ----

// jawaban server untuk "ikuti" (ack Socket.IO): berhasil atau tidak, dan bacaan terakhir perangkat itu
export type JawabanIkuti = {
  ok: boolean;
  pesan?: string;
  terbaru?: Telemetry | null; // null = backend belum menerima bacaan dari perangkat itu sejak dinyalakan
};

// satu baris buku kejadian (tabel events, Modul 19)
export type Kejadian = {
  id: number;
  waktu: string; // jam server, UTC
  device_id: string | null;
  jenis: "aturan" | "aturan-diubah" | "jadwal" | "status" | "mode-offline" | "perintah";
  sumber: string; // api, aturan, jadwal, telegram, perangkat
  aturan_id: number | null;
  pesan: string; // kalimat untuk manusia
  data?: unknown;
};

// acara dari server ke dashboard. Isinya berurutan, bukan satu objek: telemetry membawa DUA nilai (deviceId, isi).
export type KeKlien = {
  telemetry: (deviceId: string, isi: Telemetry) => void;
  status: (deviceId: string, status: "online" | "offline" | "offline-mode") => void;
  kejadian: (kejadian: Kejadian) => void;
};

// acara dari dashboard ke server; "balas" adalah ack Socket.IO (fungsi yang dipanggil server untuk menjawab)
export type DariKlien = {
  ikuti: (deviceId: string, balas: (jawaban: JawabanIkuti) => void) => void;
  berhenti: (deviceId: string) => void;
};

// ---- Modul 23: grafik live dan riwayat ----

// satu bacaan mentah dari GET /devices/:id/readings (tanpa bucket). Ketiga belas kolom selalu ada;
// kolom yang tidak dimiliki perangkat (misalnya tekanan pada Node 1) berisi null.
export type Bacaan = {
  ts: string;
  fw: string;
  suhu: number | null;
  kelembapan: number | null;
  cahaya: number | null;
  tanah: number | null;
  gerak: boolean | null;
  level_air: number | null;
  tekanan: number | null;
  suhu_tanah: number | null;
  baterai: number | null;
  tanah_rs485: number | null;
  ec: number | null;
};

// jawaban GET /devices/:id/readings tanpa bucket: bacaan urut dari yang terlama, paling banyak 1.000
export type JawabanBacaan = {
  device_id: string;
  dari: string;
  sampai: string;
  jumlah: number;
  terpotong: boolean; // true = lebih dari 1.000 bacaan; yang dikirim hanya 1.000 yang TERLAMA
  bacaan: Bacaan[];
};

// satu titik grafik live: t = waktu bacaan dalam milidetik (dari ts perangkat); null = tidak ada nilainya
export type Titik = {
  t: number;
  suhu: number | null;
  kelembapan: number | null;
  cahaya: number | null;
};

// satu ember ringkasan (bucket=15m atau 1h): rata-rata semua bacaan dalam ember itu.
// Hanya empat besaran ini yang diringkas backend; tekanan, baterai, dan air tandon tidak ada di riwayat ringkasan.
export type TitikRingkasan = {
  waktu: string; // awal ember, UTC
  suhu_rata: number | null;
  suhu_min: number | null;
  suhu_maks: number | null;
  kelembapan_rata: number | null;
  tanah_rata: number | null;
  cahaya_rata: number | null;
  jumlah_bacaan: number;
};

// jawaban GET /devices/:id/readings?bucket=…  (ember tanpa bacaan tidak dikirim sama sekali)
export type JawabanRingkasan = {
  device_id: string;
  dari: string;
  sampai: string;
  ember: "15m" | "1h" | "1d";
  jumlah: number;
  ringkasan: TitikRingkasan[];
};

// tiga pilihan rentang di layar Riwayat
export type Rentang = "1jam" | "24jam" | "7hari";

// riwayat yang sudah diseragamkan api.ts: bacaan mentah (1 jam) pun diubah ke bentuk TitikRingkasan
export type DataRiwayat = {
  dari: string;
  sampai: string;
  titik: TitikRingkasan[]; // urut dari yang terlama
};
