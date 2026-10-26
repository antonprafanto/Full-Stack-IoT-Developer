// toast.ts - "kabar di layar" (toast): pesan pendek yang muncul sebentar (di bawah layar HP, di pojok kanan atas laptop
// lebar) lalu hilang sendiri sesudah 4 detik.
// Tokonya terpisah dari toko.ts supaya kecil dan mudah dibaca. Seperti toko utama, isinya hanya ada di memori tab ini.
import { create } from "zustand";

export type JenisToast = "info" | "sukses" | "galat";
export type Toast = { id: number; pesan: string; jenis: JenisToast };

const LAMA_TAMPIL = 4000; // milidetik
const PALING_BANYAK = 2; // lebih dari itu, yang paling lama dibuang: di HP, dua toast sudah setinggi seperempat layar

type TokoToast = {
  daftar: Toast[];
  tambah: (pesan: string, jenis: JenisToast) => void;
  hapus: (id: number) => void;
};

let nomorTerakhir = 0; // nomor unik setiap toast: dipakai sebagai key React dan untuk menghapusnya

export const useToast = create<TokoToast>()((set, get) => ({
  daftar: [],
  tambah: (pesan, jenis) => {
    const id = ++nomorTerakhir;
    // slice(-2) = ambil dua yang paling akhir (yang terbaru)
    set((s) => ({ daftar: [...s.daftar, { id, pesan, jenis }].slice(-PALING_BANYAK) }));
    // setTimeout = SEKALI jalan, bukan setInterval: 4 detik lagi toast ini dibuang. Kalau sudah ditutup lebih dulu,
    // hapus() tidak menemukannya dan tidak terjadi apa-apa.
    setTimeout(() => get().hapus(id), LAMA_TAMPIL);
  },
  hapus: (id) => set((s) => ({ daftar: s.daftar.filter((t) => t.id !== id) })),
}));

// singkatan, supaya bagian lain cukup menulis toast("Aturan disimpan", "sukses")
export function toast(pesan: string, jenis: JenisToast = "info") {
  useToast.getState().tambah(pesan, jenis);
}
