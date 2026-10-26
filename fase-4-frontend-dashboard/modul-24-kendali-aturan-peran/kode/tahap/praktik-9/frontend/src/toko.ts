// toko.ts - "toko" data live bersama untuk seluruh dashboard (Zustand). Komponen mana pun membaca isinya lewat
// selektor, dan soket.ts mengisinya dari luar React (useToko.getState()). Isinya hanya ada di memori tab ini:
// tidak ada yang disimpan di localStorage, dan semuanya hilang saat halaman dimuat ulang.
// Modul 24: toko juga mencatat SIAPA yang sedang masuk (irisan sesi), supaya penjaga rute, kepala, dan tombol-tombol
// bisa membacanya tanpa dititipkan lewat props dari App. Peran tetap hanya di memori: tidak pernah di localStorage.
import { create } from "zustand";
import { useToast } from "./toast";
import type { Bacaan, Keadaan, Pengguna, Perangkat, StatusPerangkat, Telemetry, TelemetryNode1, Titik } from "./types";

// keadaan sambungan Socket.IO yang ditampilkan lencana di kepala
export type Koneksi = "menyambung" | "live" | "terputus";

const LIMA_MENIT = 5 * 60 * 1000; // dalam milidetik

// Larik kosong yang SELALU sama. Selektor memakai "?? KOSONG", bukan "?? []": larik baru di setiap panggilan membuat
// Zustand 5 mengira datanya berubah terus, React menggambar ulang tanpa henti, dan layar menjadi putih.
export const KOSONG: Titik[] = [];

// telemetry dari acara Socket.IO menjadi satu titik grafik (Node 2 tidak punya sensor cahaya)
function keTitik(isi: Telemetry): Titik {
  return { t: Date.parse(isi.ts), suhu: isi.suhu, kelembapan: isi.kelembapan, cahaya: "cahaya" in isi ? isi.cahaya : null };
}

// bacaan mentah dari GET …/readings menjadi satu titik grafik
function keTitikBacaan(b: Bacaan): Titik {
  return { t: Date.parse(b.ts), suhu: b.suhu, kelembapan: b.kelembapan, cahaya: b.cahaya };
}

// bacaan mentah dari database menjadi bacaan Node 1 untuk kartu, TANPA mengarang nilai: kalau kolom wajib Node 1
// kosong, hasilnya null (tidak dipakai). Keadaan aktuator (state) tidak disimpan di database, jadi tidak ikut.
function keTelemetry(b: Bacaan): TelemetryNode1 | null {
  if (b.cahaya === null || b.tanah === null || b.gerak === null) return null;
  const isi: TelemetryNode1 = {
    ts: b.ts,
    fw: b.fw,
    suhu: b.suhu,
    kelembapan: b.kelembapan,
    cahaya: b.cahaya,
    tanah: b.tanah,
    gerak: b.gerak,
    level_air: b.level_air,
  };
  // tiga kolom sensor tanah RS-485 hanya ada kalau sensornya dipasang (selalu datang bersama)
  if (b.tanah_rs485 !== null) {
    isi.tanah_rs485 = b.tanah_rs485;
    isi.suhu_tanah = b.suhu_tanah;
    isi.ec = b.ec;
  }
  return isi;
}

// gabung - jendela geser 5 menit: titik lama + titik baru, urut waktu, tanpa titik ganda (ts sama).
// Hasilnya selalu larik BARU (yang lama tidak diubah), supaya React tahu ada yang berubah.
function gabung(lama: Titik[], baru: Titik[]): Titik[] {
  const batas = Date.now() - LIMA_MENIT; // jam browser; ts titik memakai jam perangkat
  const urut = [...lama, ...baru].filter((p) => p.t >= batas).sort((a, b) => a.t - b.t);
  return urut.filter((p, i) => i === 0 || p.t !== urut[i - 1].t); // sesudah diurutkan, titik ganda pasti bersebelahan
}

type Toko = {
  // Modul 24, irisan sesi: "memuat" = GET /auth/me belum dijawab; null = belum masuk; objek = sudah masuk (dengan peran)
  pengguna: Pengguna | null | "memuat";
  pesanMasuk: string | null; // kalimat di atas formulir Masuk, misalnya "Sesi sudah habis. Silakan masuk lagi."
  // true sesudah tombol Keluar: penjaga rute lalu TIDAK menitipkan alamat terakhir ke layar Masuk, jadi orang
  // berikutnya di tab ini mulai dari daftar perangkat, bukan dari layar terakhir orang sebelumnya
  keluarSengaja: boolean;
  setPengguna: (pengguna: Pengguna) => void;
  belumMasuk: (pesan: string | null) => void;
  koneksi: Koneksi;
  perangkat: Perangkat[] | null; // jawaban GET /devices; null = belum dimuat
  galatPerangkat: string | null; // Modul 24: GET /devices gagal (dibaca layar Daftar dan Detail)
  // Partial<Record<string, …>> = "kamus" ber-kunci device_id. Partial: isinya boleh belum ada (undefined).
  status: Partial<Record<string, StatusPerangkat>>;
  terbaru: Partial<Record<string, Telemetry>>; // bacaan terakhir tiap perangkat
  terakhirDilihat: Partial<Record<string, number>>; // kapan terakhir terdengar, dalam milidetik
  jendela: Partial<Record<string, Titik[]>>; // titik grafik 5 menit terakhir tiap perangkat
  setKoneksi: (koneksi: Koneksi) => void;
  setPerangkat: (daftar: Perangkat[]) => void;
  setGalatPerangkat: (pesan: string) => void;
  setStatus: (deviceId: string, status: StatusPerangkat) => void;
  isiTerbaru: (deviceId: string, isi: Telemetry) => void;
  terima: (deviceId: string, isi: Telemetry) => void;
  isiJendela: (deviceId: string, bacaan: Bacaan[]) => void;
  terapkanKeadaan: (deviceId: string, state: Keadaan) => void;
  // Modul 24: naik 1 setiap kali ada kejadian "aturan-diubah" (dari dashboard mana pun). Layar Aturan yang sedang terbuka
  // memakainya sebagai dependensi efek, jadi daftar aturannya diambil ulang sendiri.
  versiAturan: number;
  aturanBerubah: () => void;
};

// create<Toko>()(…): tanda kurung ganda memang cara menulisnya di TypeScript (Zustand 5).
// set() menggabung isi baru dengan isi lama, tetapi hanya SATU tingkat: kamus di dalamnya (status, terbaru, …)
// harus kita salin sendiri dengan { ...lama, [kunci]: nilai }, jangan diubah langsung.
export const useToko = create<Toko>()((set) => ({
  pengguna: "memuat",
  pesanMasuk: null,
  setPengguna: (pengguna) => set({ pengguna, pesanMasuk: null }),
  belumMasuk: (pesan) => set({ pengguna: null, pesanMasuk: pesan }),
  keluarSengaja: false,

  koneksi: "terputus",
  perangkat: null,
  galatPerangkat: null,
  status: {},
  terbaru: {},
  terakhirDilihat: {},
  jendela: {},

  setKoneksi: (koneksi) => set({ koneksi }),

  // daftar dari GET /devices: status dan "terakhir dilihat" ikut diisi dari database
  setPerangkat: (daftar) =>
    set((s) => {
      const status = { ...s.status };
      const terakhirDilihat = { ...s.terakhirDilihat };
      for (const p of daftar) {
        status[p.device_id] = p.status;
        if (p.terakhir_dilihat !== null) {
          // pilih yang lebih baru: jam server di database, atau jam browser saat telemetry terakhir tiba
          terakhirDilihat[p.device_id] = Math.max(terakhirDilihat[p.device_id] ?? 0, Date.parse(p.terakhir_dilihat));
        }
      }
      return { perangkat: daftar, galatPerangkat: null, status, terakhirDilihat };
    }),

  setGalatPerangkat: (pesan) => set({ galatPerangkat: pesan }),

  // acara "status": dikirim server hanya saat status perangkat berubah
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),

  // bacaan terakhir dari jawaban "ikuti": nilai awal, BUKAN kiriman baru, jadi "terakhir dilihat" tidak diubah
  isiTerbaru: (deviceId, isi) => set((s) => ({ terbaru: { ...s.terbaru, [deviceId]: isi } })),

  // acara "telemetry": kiriman baru dari perangkat
  terima: (deviceId, isi) =>
    set((s) => ({
      terbaru: { ...s.terbaru, [deviceId]: isi },
      terakhirDilihat: { ...s.terakhirDilihat, [deviceId]: Date.now() },
      jendela: { ...s.jendela, [deviceId]: gabung(s.jendela[deviceId] ?? KOSONG, [keTitik(isi)]) },
    })),

  // isi awal grafik dari database, digabung dengan titik live yang mungkin sudah lebih dulu masuk.
  // Sekaligus angka awal kartu: kalau jawaban "ikuti" tidak membawa bacaan (backend baru dinyalakan), bacaan terakhir
  // dari database yang dipakai. Angka yang sudah ada tidak ditimpa (pasti lebih baru), dan "terakhir dilihat" tidak
  // diubah (ini bukan kiriman baru).
  isiJendela: (deviceId, bacaan) =>
    set((s) => {
      const jendela = { ...s.jendela, [deviceId]: gabung(s.jendela[deviceId] ?? KOSONG, bacaan.map(keTitikBacaan)) };
      const terakhir = bacaan.at(-1); // bacaan urut dari yang terlama, jadi yang terakhir = yang terbaru
      const awal = terakhir === undefined ? null : keTelemetry(terakhir);
      if (s.terbaru[deviceId] !== undefined || awal === null) return { jendela };
      return { jendela, terbaru: { ...s.terbaru, [deviceId]: awal } };
    }),

  // Modul 24: keadaan aktuator dari ack (jawaban perangkat atas perintah kita). Ditulis ke bacaan terbaru supaya kartu dan
  // tombol langsung benar, tanpa menunggu telemetry berikutnya (yang membawa keadaan yang sama ±1-2 detik kemudian).
  terapkanKeadaan: (deviceId, state) =>
    set((s) => {
      const lama = s.terbaru[deviceId];
      // belum ada bacaan, atau Node 2 (punya tekanan, tanpa aktuator): tidak ada yang diubah
      if (lama === undefined || "tekanan" in lama) return s;
      return { terbaru: { ...s.terbaru, [deviceId]: { ...lama, state } } };
    }),

  versiAturan: 0,
  aturanBerubah: () => set((s) => ({ versiAturan: s.versiAturan + 1 })),
}));

// Modul 24: true HANYA kalau peran admin sudah pasti. Selama GET /auth/me belum dijawab ("memuat") hasilnya false, jadi
// tombol admin tidak sempat berkedip muncul di layar viewer. Ini hanya kenyamanan layar: yang benar-benar menjaga tetap
// satpam backend (403 untuk semua perubahan dari akun viewer).
export function useAdmin(): boolean {
  return useToko((s) => s.pengguna !== null && s.pengguna !== "memuat" && s.pengguna.peran === "admin");
}

// Modul 24: kosongkan SEMUA isi toko sekaligus (sesi, daftar perangkat, bacaan, grafik), lalu tulis pesan untuk layar
// Masuk. Dipakai saat Keluar dan saat sesi habis, supaya orang berikutnya di tab yang sama tidak melihat sisa data.
// getInitialState() = isi toko saat pertama dibuat; true = GANTI seluruh isinya (bukan digabung seperti set biasa).
// keluarSengaja = true hanya dari tombol Keluar (TataLetak).
export function kosongkanSemua(pesanMasuk: string | null, keluarSengaja = false) {
  useToko.setState({ ...useToko.getInitialState(), pengguna: null, pesanMasuk, keluarSengaja }, true);
  useToast.setState(useToast.getInitialState(), true); // toast milik akun sebelumnya ikut dibuang
}

// Modul 24: dipanggil kalau backend menjawab 401 dan refresh pun gagal (sesi sudah habis, atau logout di tab lain).
// Penjaga rute (JagaMasuk) lalu memindahkan layar ke /masuk. Fungsi biasa di luar komponen = fungsi yang SAMA selamanya,
// jadi aman dipakai sebagai dependensi efek (useRealtime tidak memutus-sambung soket karenanya).
export function sesiHabis() {
  kosongkanSemua("Sesi sudah habis. Silakan masuk lagi.");
}
