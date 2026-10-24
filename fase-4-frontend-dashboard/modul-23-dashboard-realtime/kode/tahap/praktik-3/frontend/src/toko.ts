// toko.ts - "toko" data live bersama untuk seluruh dashboard (Zustand). Komponen mana pun membaca isinya lewat
// selektor, dan soket.ts mengisinya dari luar React (useToko.getState()). Isinya hanya ada di memori tab ini:
// tidak ada yang disimpan di localStorage, dan semuanya hilang saat halaman dimuat ulang.
import { create } from "zustand";
import type { Perangkat, StatusPerangkat, Telemetry } from "./types";

// keadaan sambungan Socket.IO yang ditampilkan lencana di kepala
export type Koneksi = "menyambung" | "live" | "terputus";

type Toko = {
  koneksi: Koneksi;
  perangkat: Perangkat[] | null; // jawaban GET /devices; null = belum dimuat
  // Partial<Record<string, …>> = "kamus" ber-kunci device_id. Partial: isinya boleh belum ada (undefined).
  status: Partial<Record<string, StatusPerangkat>>;
  terbaru: Partial<Record<string, Telemetry>>; // bacaan terakhir tiap perangkat
  terakhirDilihat: Partial<Record<string, number>>; // kapan terakhir terdengar, dalam milidetik
  setKoneksi: (koneksi: Koneksi) => void;
  setPerangkat: (daftar: Perangkat[]) => void;
  setStatus: (deviceId: string, status: StatusPerangkat) => void;
  isiTerbaru: (deviceId: string, isi: Telemetry) => void;
  terima: (deviceId: string, isi: Telemetry) => void;
};

// create<Toko>()(…): tanda kurung ganda memang cara menulisnya di TypeScript (Zustand 5).
// set() menggabung isi baru dengan isi lama, tetapi hanya SATU tingkat: kamus di dalamnya (status, terbaru, …)
// harus kita salin sendiri dengan { ...lama, [kunci]: nilai }, jangan diubah langsung.
export const useToko = create<Toko>()((set) => ({
  koneksi: "terputus",
  perangkat: null,
  status: {},
  terbaru: {},
  terakhirDilihat: {},

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
      return { perangkat: daftar, status, terakhirDilihat };
    }),

  // acara "status": dikirim server hanya saat status perangkat berubah
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),

  // bacaan terakhir dari jawaban "ikuti": nilai awal, BUKAN kiriman baru, jadi "terakhir dilihat" tidak diubah
  isiTerbaru: (deviceId, isi) => set((s) => ({ terbaru: { ...s.terbaru, [deviceId]: isi } })),

  // acara "telemetry": kiriman baru dari perangkat
  terima: (deviceId, isi) =>
    set((s) => ({
      terbaru: { ...s.terbaru, [deviceId]: isi },
      terakhirDilihat: { ...s.terakhirDilihat, [deviceId]: Date.now() },
    })),
}));
