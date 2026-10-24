// bebanPalsu.ts - BERKAS SEMENTARA untuk Praktik 6. Jangan di-commit: hapus folder src/uji sesudah mengukur.
// Begitu dashboard tersambung (lencana Live), berkas ini menyuntikkan 10 bacaan palsu per detik selama 60 detik ke toko,
// seolah-olah satu perangkat mengirim 10 kali per detik. Gunanya hanya untuk MENGUKUR berapa kali layar digambar
// ulang (React DevTools: Highlight updates dan Profiler).
// Cara memakai: di main.tsx, tepat di bawah baris import App, tambahkan   import './uji/bebanPalsu'
// (gaya templat Vite di berkas itu: petik tunggal, tanpa titik koma). Lalu login dan buka detail perangkat ini.
import { useToko } from "../toko";
import type { TelemetryNode1 } from "../types";

const ID = "f00d00000001"; // perangkat yang dibanjiri; dengan Kit A + B, ganti dengan device_id Node 1
const PER_DETIK = 10;
const LAMA_DETIK = 60;

function mulai() {
  let ke = 0;
  const pewaktu = setInterval(() => {
    const isi: TelemetryNode1 = {
      ts: new Date().toISOString(), // jam bacaan palsu = sekarang
      fw: "0.0.0-uji",
      suhu: Math.round((27 + Math.random() * 3) * 10) / 10,
      kelembapan: 60,
      cahaya: Math.round(Math.random() * 4095),
      tanah: 40,
      gerak: false,
      level_air: 50,
    };
    useToko.getState().terima(ID, isi); // jalur yang sama dengan acara telemetry dari Socket.IO
    ke++;
    if (ke >= PER_DETIK * LAMA_DETIK) {
      clearInterval(pewaktu);
      console.log(`bebanPalsu: selesai, ${ke} bacaan palsu`);
    }
  }, 1000 / PER_DETIK);
  console.log(`bebanPalsu: mulai, ${PER_DETIK} bacaan per detik selama ${LAMA_DETIK} detik untuk ${ID}`);
}

// Tunggu sampai sambungan live pertama kali Live, baru mulai (jadi tidak berjalan di layar login).
const lepas = useToko.subscribe((s) => {
  if (s.koneksi !== "live") return;
  lepas(); // cukup sekali
  mulai();
});
