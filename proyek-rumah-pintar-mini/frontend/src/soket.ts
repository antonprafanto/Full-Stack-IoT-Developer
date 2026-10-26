// soket.ts - SATU sambungan Socket.IO untuk seluruh dashboard (Modul 23). Dibuat sekali di sini, di luar komponen,
// supaya StrictMode (yang memasang komponen dua kali di mode dev) tidak membuat sambungan kedua.
import { useEffect } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { z } from "zod";
import { ambilPerangkat, BASE, refreshSekali } from "./api";
import { toast } from "./toast";
import type { JenisToast } from "./toast";
import { useToko } from "./toko";
import type { DariKlien, Kejadian, KeKlien, Perangkat, StatusPerangkat, Telemetry } from "./types";

// Alamatnya SAMA dengan api.ts (BASE): halaman http://<IP-laptop>:5173 di HP otomatis menyambung ke http://<IP-laptop>:8080.
// withCredentials: true = bawa cookie login ke port lain (padanan credentials: "include" pada fetch). Tanpa ini,
// backend menjawab "belum login" walaupun fetch berhasil. autoConnect: false = baru menyambung sesudah login.
export const socket: Socket<KeKlien, DariKlien> = io(BASE, { withCredentials: true, autoConnect: false });

// Hanya perangkat yang kirimannya diterima backend yang diikuti. Kiriman perangkat yang kuncinya dicabut atau
// belum terdaftar diabaikan backend (Modul 21), jadi acaranya tidak akan pernah datang.
function bolehDiikuti(p: Perangkat): boolean {
  return p.kunci === "aktif" || p.kunci === "tanpa-kunci";
}

// "ikuti" WAJIB memakai ack (jawaban): tanpa fungsi jawaban, server diam-diam tidak memasukkan kita ke room perangkat itu.
async function ikuti(deviceId: string) {
  try {
    const jawaban = await socket.timeout(5000).emitWithAck("ikuti", deviceId);
    // terbaru = bacaan terakhir yang diingat backend; null kalau backend baru dinyalakan
    if (jawaban.ok && jawaban.terbaru) useToko.getState().isiTerbaru(deviceId, jawaban.terbaru);
  } catch {
    // tidak dijawab dalam 5 detik (sambungan putus di tengah jalan): diikuti lagi saat tersambung lagi
  }
}

// ikuti semua perangkat di daftar. Room hilang setiap kali sambungan putus, jadi ini diulang di setiap "connect".
function ikutiSemua() {
  for (const p of useToko.getState().perangkat ?? []) {
    if (bolehDiikuti(p)) void ikuti(p.device_id);
  }
}

// Modul 24: bagian "data" kejadian aturan dan jadwal yang menentukan warna toast. hasil = nasib perintahnya (sejak
// Modul 19: "dijawab", "tanpa-ack", "tidak-dikirim", "tanpa-perintah"); ok = backend 1.1 (Praktik 6): false kalau
// tindakannya tidak terlaksana, termasuk perintah yang dijawab tetapi DITOLAK perangkat (tidak terbaca dari hasil saja).
// data bertipe unknown, jadi diperiksa Zod dulu, bukan dipercaya begitu saja.
const DataTindakan = z.object({ hasil: z.string().optional(), ok: z.boolean().nullable().optional() });

// Modul 24: warna toast untuk satu kejadian, dari data terstruktur (jenis, status, ok), BUKAN dari kalimatnya: kalimat
// buatan backend bisa berubah kata-katanya tanpa mengubah artinya.
function jenisToast(k: Kejadian): JenisToast {
  // perangkat tersambung lagi atau terputus: acara "status" perangkat yang sama dikirim server ke SEMUA dashboard LEBIH
  // DULU (sebelum kejadiannya dicatat), jadi status terbarunya sudah ada di toko
  if (k.jenis === "status") return useToko.getState().status[k.device_id ?? ""] === "online" ? "info" : "galat";
  if (k.jenis === "aturan" || k.jenis === "jadwal") {
    const data = DataTindakan.safeParse(k.data);
    if (data.success && (data.data.ok === false || data.data.hasil === "tanpa-ack" || data.data.hasil === "tidak-dikirim")) {
      return "galat";
    }
  }
  return "info"; // aturan bertindak, aturan siap lagi, kembali dari mode offline, perintah dikirim lagi
}

// useRealtime - dipanggil SEKALI di App. Selama sudah login: menyambung, memulihkan sambungan, dan meneruskan setiap
// acara dari server ke toko. Saat keluar: semuanya dilepas. onSesiHabis = sesiHabis() dari toko.ts (Modul 24).
export function useRealtime(sudahLogin: boolean, onSesiHabis: () => void) {
  // Efek 1: sambungan selama login. Pendengarnya fungsi bernama, supaya cleanup melepas PERSIS fungsi yang sama
  // (socket.off(nama) tanpa fungsi akan melepas SEMUA pendengar acara itu, termasuk milik bagian lain).
  useEffect(() => {
    if (!sudahLogin) return;
    let ignore = false; // menjadi true saat efek dibereskan: hasil refresh yang datang terlambat diabaikan
    let gagalBeruntun = 0; // ditolak berapa kali berturut-turut walau sudah refresh
    let pernahTersambung = false; // Modul 24: membedakan sambungan pertama dari sambungan yang PULIH

    // Perbarui gelang (POST /auth/refresh) dulu, baru sambung lagi: pola yang sama dengan alat/terminal-live.js.
    async function perbaruiLaluSambung() {
      const hasil = await refreshSekali();
      if (ignore) return;
      if (hasil === false) onSesiHabis(); // ditolak: sudah logout (mungkin di tab lain) atau kartu terusan habis
      else socket.connect(); // true = gelang baru terpasang; null = backend belum bisa melayani (kalau mati: Socket.IO mencoba terus)
    }

    // Modul 24: ambil ulang daftar perangkat (GET /devices). Server hanya mengirim acara "status" saat status BERUBAH,
    // dan tidak mengulangnya untuk sambungan baru; perubahan selama sambungan putus hanya bisa dibaca dari database.
    async function sinkronPerangkat() {
      try {
        const daftar = await ambilPerangkat();
        if (!ignore) useToko.getState().setPerangkat(daftar); // sudah Keluar sementara itu? abaikan
      } catch {
        // gagal (misalnya backend baru saja mati lagi): biarkan; sambungan yang pulih berikutnya mencoba lagi
      }
    }

    function onConnect() {
      gagalBeruntun = 0;
      useToko.getState().setKoneksi("live");
      ikutiSemua();
      // Sambungan PULIH, bukan yang pertama: sinkronkan status. Yang pertama tidak perlu, karena TataLetak baru saja
      // mengambil daftar perangkat sesudah masuk.
      if (pernahTersambung) void sinkronPerangkat();
      pernahTersambung = true;
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
    function onTelemetry(deviceId: string, isi: Telemetry) {
      useToko.getState().terima(deviceId, isi);
    }
    function onStatus(deviceId: string, status: StatusPerangkat) {
      useToko.getState().setStatus(deviceId, status);
    }
    // Modul 24: kejadian dari buku kejadian backend (aturan bertindak, jadwal, perangkat terputus, ...) menjadi toast.
    // aturan-diubah tidak: yang menyimpan aturan sudah mendapat toast dari jawaban HTTP-nya sendiri. Kejadian itu cukup
    // menaikkan versiAturan, supaya layar Aturan yang sedang terbuka (di dashboard mana pun) mengambil ulang daftarnya.
    function onKejadian(k: Kejadian) {
      if (k.jenis === "aturan-diubah") {
        useToko.getState().aturanBerubah();
        return;
      }
      toast(k.pesan, jenisToast(k));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("telemetry", onTelemetry);
    socket.on("status", onStatus);
    socket.on("kejadian", onKejadian);
    useToko.getState().setKoneksi("menyambung");
    socket.connect();
    // StrictMode di mode dev: sambung, putus, sambung lagi. Tetap hanya SATU sambungan yang hidup.
    return () => {
      ignore = true;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("telemetry", onTelemetry);
      socket.off("status", onStatus);
      socket.off("kejadian", onKejadian);
      socket.disconnect();
    };
  }, [sudahLogin, onSesiHabis]);

  // Efek 2: ikuti perangkat di daftar, berhenti di cleanup. Selektor ini mengembalikan SATU teks berisi device_id
  // dipisah koma ("a4cf12e5b7c0,f00d00000001"). Teks yang sama = tidak berubah, jadi efek (dan App) hanya diulang
  // kalau daftar perangkatnya benar-benar berubah, bukan setiap kali telemetry tiba.
  const daftarId = useToko((s) => (s.perangkat ?? []).filter(bolehDiikuti).map((p) => p.device_id).join(","));
  useEffect(() => {
    if (daftarId === "") return;
    const semuaId = daftarId.split(",");
    // belum tersambung? Tidak apa-apa: onConnect mengikuti semuanya begitu tersambung
    if (socket.connected) for (const id of semuaId) void ikuti(id);
    return () => {
      if (socket.connected) for (const id of semuaId) socket.emit("berhenti", id);
    };
  }, [daftarId]);
}
