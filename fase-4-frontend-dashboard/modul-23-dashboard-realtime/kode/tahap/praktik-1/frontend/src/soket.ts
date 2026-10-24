// soket.ts - SATU sambungan Socket.IO untuk seluruh dashboard (Modul 23). Dibuat sekali di sini, di luar komponen,
// supaya StrictMode (yang memasang komponen dua kali di mode dev) tidak membuat sambungan kedua.
import { useEffect } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { BASE, refreshSekali } from "./api";
import { useToko } from "./toko";
import type { DariKlien, KeKlien } from "./types";

// Alamatnya SAMA dengan api.ts (BASE): halaman http://<IP-laptop>:5173 di HP otomatis menyambung ke http://<IP-laptop>:8080.
// withCredentials: true = bawa cookie login ke port lain (padanan credentials: "include" pada fetch). Tanpa ini,
// backend menjawab "belum login" walaupun fetch berhasil. autoConnect: false = baru menyambung sesudah login.
export const socket: Socket<KeKlien, DariKlien> = io(BASE, { withCredentials: true, autoConnect: false });

// useRealtime - dipanggil SEKALI di App. Selama sudah login: menyambung dan memulihkan sambungan.
// Saat keluar: semuanya dilepas. onSesiHabis = fungsi App yang kembali ke formulir login.
export function useRealtime(sudahLogin: boolean, onSesiHabis: () => void) {
  // Efek 1: sambungan selama login. Pendengarnya fungsi bernama, supaya cleanup melepas PERSIS fungsi yang sama
  // (socket.off(nama) tanpa fungsi akan melepas SEMUA pendengar acara itu, termasuk milik bagian lain).
  useEffect(() => {
    if (!sudahLogin) return;
    let ignore = false; // menjadi true saat efek dibereskan: hasil refresh yang datang terlambat diabaikan
    let gagalBeruntun = 0; // ditolak berapa kali berturut-turut walau sudah refresh

    // Perbarui gelang (POST /auth/refresh) dulu, baru sambung lagi: pola yang sama dengan alat/terminal-live.js.
    async function perbaruiLaluSambung() {
      const hasil = await refreshSekali();
      if (ignore) return;
      if (hasil === false) onSesiHabis(); // ditolak: sudah logout (mungkin di tab lain) atau kartu terusan habis
      else socket.connect(); // true = gelang baru terpasang; null = backend belum bisa melayani (kalau mati: Socket.IO mencoba terus)
    }

    function onConnect() {
      gagalBeruntun = 0;
      useToko.getState().setKoneksi("live");
    }
    function onDisconnect(alasan: string) {
      if (alasan === "io client disconnect") {
        useToko.getState().setKoneksi("terputus"); // kita sendiri yang memutus (Keluar): jangan menyambung lagi
        return;
      }
      useToko.getState().setKoneksi("menyambung");
      // "io server disconnect" = server SENGAJA memutus: gelang 15 menit habis, logout di tab lain, atau backend
      // dimatikan dengan rapi. Socket.IO tidak menyambung ulang sendiri untuk alasan ini, jadi kita yang memintanya.
      // Alasan lain (WiFi putus, backend mati mendadak atau dimulai ulang): Socket.IO menyambung ulang sendiri.
      if (alasan === "io server disconnect") void perbaruiLaluSambung();
    }
    function onConnectError() {
      useToko.getState().setKoneksi("menyambung");
      // socket.active = Socket.IO masih akan mencoba lagi sendiri (backend mati, atau alamat halaman tidak diizinkan)
      if (socket.active) return;
      // Ditolak penjaga pintu Socket.IO ("belum login" atau "sesi habis…"): gelang habis. Refresh, lalu sambung lagi.
      gagalBeruntun++;
      if (gagalBeruntun > 3) {
        useToko.getState().setKoneksi("terputus"); // ditolak terus walau sudah refresh: jangan berputar tanpa akhir
        return;
      }
      void perbaruiLaluSambung();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    useToko.getState().setKoneksi("menyambung");
    socket.connect();
    // StrictMode di mode dev: sambung, putus, sambung lagi. Tetap hanya SATU sambungan yang hidup.
    return () => {
      ignore = true;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [sudahLogin, onSesiHabis]);
}
