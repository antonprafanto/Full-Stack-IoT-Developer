// toko.ts - "toko" data live bersama untuk seluruh dashboard (Zustand). Komponen mana pun membaca isinya lewat
// selektor, dan soket.ts mengisinya dari luar React (useToko.getState()). Isinya hanya ada di memori tab ini:
// tidak ada yang disimpan di localStorage, dan semuanya hilang saat halaman dimuat ulang.
import { create } from "zustand";

// keadaan sambungan Socket.IO yang ditampilkan lencana di kepala
export type Koneksi = "menyambung" | "live" | "terputus";

type Toko = {
  koneksi: Koneksi;
  setKoneksi: (koneksi: Koneksi) => void;
};

// create<Toko>()(…): tanda kurung ganda memang cara menulisnya di TypeScript (Zustand 5).
export const useToko = create<Toko>()((set) => ({
  koneksi: "terputus",

  setKoneksi: (koneksi) => set({ koneksi }),
}));
