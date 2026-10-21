// terminal-live.js — "terminal kecil" yang menampilkan bacaan live SATU perangkat lewat Socket.IO. Modul 19.
// Butuh library socket.io-client:  npm install socket.io-client@4.8.4
// Jalankan (backend harus menyala):  node terminal-live.js http://127.0.0.1:8080 f00d00000001
// Berhenti: Ctrl + C

import { io } from "socket.io-client";

const alamat = process.argv[2] || "http://127.0.0.1:8080";
const deviceId = process.argv[3];
if (deviceId === undefined) {
  console.log("Tulis device_id perangkatnya, misalnya: node terminal-live.js http://127.0.0.1:8080 f00d00000001");
  process.exit(1);
}

const jam = () => new Date().toLocaleTimeString("id-ID"); // jam laptop, misalnya 07.15.02
const socket = io(alamat);

function tampilkan(id, isi, keterangan = "") {
  // kontrak 1.3: telemetry Node 1 membawa state, jadi keadaan kipas dan lampu ikut tampil
  const aktuator = isi.state ? `  kipas ${isi.state.kipas ? "NYALA" : "padam"}  lampu ${isi.state.lampu ? "NYALA" : "padam"}` : "";
  console.log(`[${jam()}] ${id}  suhu ${isi.suhu} °C  lembap ${isi.kelembapan} %  tanah ${isi.tanah} %${aktuator}${keterangan}`);
}

// "connect" terpanggil lagi setiap kali tersambung ulang. Room hilang saat terputus, jadi "ikuti" dikirim lagi di sini.
socket.on("connect", async () => {
  console.log(`[${jam()}] tersambung ke ${alamat} (${socket.io.engine.transport.name})`);
  socket.io.engine.once("upgrade", (transport) => console.log(`[${jam()}] jalur ditingkatkan ke ${transport.name}`));
  try {
    const jawaban = await socket.timeout(5000).emitWithAck("ikuti", deviceId);
    if (!jawaban.ok) {
      console.log(`[${jam()}] ditolak server: ${jawaban.pesan}`);
      return;
    }
    console.log(`[${jam()}] mengikuti ${deviceId}`);
    if (jawaban.terbaru) tampilkan(deviceId, jawaban.terbaru, "  (bacaan terakhir)");
  } catch {
    console.log(`[${jam()}] server tidak menjawab "ikuti" dalam 5 detik`);
  }
});

socket.on("telemetry", (id, isi) => tampilkan(id, isi));
socket.on("status", (id, status) => console.log(`[${jam()}] ${id} sekarang ${status}`));
socket.on("kejadian", (kejadian) => console.log(`[${jam()}] kejadian: ${kejadian.pesan}`)); // buku kejadian (Praktik 4)
socket.on("connect_error", (galat) => console.log(`[${jam()}] belum bisa tersambung: ${galat.message}`));
socket.on("disconnect", (alasan) => {
  console.log(`[${jam()}] terputus: ${alasan}`);
  // "io server disconnect" = server memutus kita dengan sengaja (misalnya dimatikan dengan Ctrl + C). Socket.IO tidak
  // menyambung ulang sendiri dalam keadaan itu, jadi kita minta sendiri; saat server menyala lagi, kita tersambung lagi.
  if (alasan === "io server disconnect") socket.connect();
});
