// terminal-live.js — "terminal kecil" yang menampilkan bacaan live SATU perangkat lewat Socket.IO. Modul 19, dikunci di Modul 20.
// Butuh library socket.io-client:  npm install socket.io-client@4.8.4
// Modul 20: butuh file alat/.env (tidak ikut Git) berisi akun untuk terminal ini; contohnya di alat/.env.example.
// Jalankan (backend harus menyala):  node --env-file=.env terminal-live.js http://127.0.0.1:8080 f00d00000001
// Berhenti: Ctrl + C

import { io } from "socket.io-client";

const alamat = process.argv[2] || "http://127.0.0.1:8080";
const deviceId = process.argv[3];
if (deviceId === undefined) {
  console.log("Tulis device_id perangkatnya, misalnya: node --env-file=.env terminal-live.js http://127.0.0.1:8080 f00d00000001");
  process.exit(1);
}
// Modul 20: akun untuk terminal ini. Cukup akun viewer: terminal hanya melihat (hak sekecil mungkin).
const email = process.env.EMAIL_TERMINAL;
const sandi = process.env.SANDI_TERMINAL;
if (!email || !sandi) {
  console.log("Isi EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env, lalu jalankan dengan: node --env-file=.env terminal-live.js …");
  process.exit(1);
}

const jam = () => new Date().toLocaleTimeString("id-ID"); // jam laptop, misalnya 07.15.02
const kue = new Map(); // cookie dari backend: "akses" (gelang 15 menit) dan "sesi" (kartu terusan 7 hari)

// simpan cookie dari header Set-Cookie, misalnya "akses=eyJ…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict".
// Yang disimpan hanya bagian sebelum titik koma pertama; nilai kosong = cookie dihapus server.
function simpanCookie(jawaban) {
  for (const teks of jawaban.headers.getSetCookie()) {
    const [nama, ...nilai] = teks.split(";")[0].split("=");
    if (nilai.join("=") === "") kue.delete(nama);
    else kue.set(nama, nilai.join("="));
  }
}

// login dengan email dan sandi: jawabannya membawa cookie akses dan sesi
async function login() {
  const jawaban = await fetch(`${alamat}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, sandi }),
  });
  if (!jawaban.ok) throw new Error(`login ditolak (${jawaban.status})`);
  simpanCookie(jawaban);
  console.log(`[${jam()}] login sebagai ${email}`);
}

// gelang habis: tukar kartu terusan (cookie sesi) dengan gelang baru, tanpa login ulang (baris sesi tidak bertambah)
async function refresh() {
  if (!kue.has("sesi")) return false;
  const jawaban = await fetch(`${alamat}/auth/refresh`, { method: "POST", headers: { cookie: `sesi=${kue.get("sesi")}` } });
  simpanCookie(jawaban);
  if (!jawaban.ok) {
    console.log(`[${jam()}] refresh ditolak (${jawaban.status}), login ulang`);
    return false;
  }
  console.log(`[${jam()}] gelang diperbarui (refresh)`);
  return true;
}

const socket = io(alamat, { autoConnect: false }); // jangan menyambung sebelum punya gelang

// refresh dulu; kalau gagal, login ulang; lalu sambung dengan cookie akses di header handshake
let gagalBeruntun = 0;
async function perbaruiLaluSambung() {
  if (++gagalBeruntun > 3) { // ditolak terus walau gelang baru: jangan berputar-putar
    console.log(`[${jam()}] ditolak server terus-menerus; berhenti`);
    process.exit(1);
  }
  try {
    if (!(await refresh())) await login();
    socket.io.opts.extraHeaders = { cookie: `akses=${kue.get("akses")}` }; // dipakai setiap kali menyambung
    socket.connect();
  } catch (galat) {
    if (galat instanceof TypeError) { // fetch gagal: backend belum bisa dihubungi (misalnya sedang dimulai ulang)
      console.log(`[${jam()}] backend belum bisa dihubungi, coba lagi 5 detik lagi`);
      gagalBeruntun--;
      setTimeout(perbaruiLaluSambung, 5000);
      return;
    }
    console.log(`[${jam()}] ${galat.message}. Periksa EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env.`);
    process.exit(1);
  }
}

function tampilkan(id, isi, keterangan = "") {
  // kontrak 1.3: telemetry Node 1 membawa state, jadi keadaan kipas dan lampu ikut tampil
  const aktuator = isi.state ? `  kipas ${isi.state.kipas ? "NYALA" : "padam"}  lampu ${isi.state.lampu ? "NYALA" : "padam"}` : "";
  console.log(`[${jam()}] ${id}  suhu ${isi.suhu} °C  lembap ${isi.kelembapan} %  tanah ${isi.tanah} %${aktuator}${keterangan}`);
}

// "connect" terpanggil lagi setiap kali tersambung ulang. Room hilang saat terputus, jadi "ikuti" dikirim lagi di sini.
socket.on("connect", async () => {
  gagalBeruntun = 0;
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
socket.on("kejadian", (kejadian) => console.log(`[${jam()}] kejadian: ${kejadian.pesan}`)); // buku kejadian (Modul 19)
socket.on("connect_error", (galat) => {
  if (socket.active) { // gangguan sementara (misalnya backend sedang dimulai ulang): Socket.IO mencoba lagi sendiri
    console.log(`[${jam()}] belum bisa tersambung: ${galat.message}`);
  } else { // Modul 20: ditolak penjaga pintu Socket.IO (belum login atau gelang habis)
    console.log(`[${jam()}] ditolak server: ${galat.message}`);
    perbaruiLaluSambung();
  }
});
socket.on("disconnect", (alasan) => {
  console.log(`[${jam()}] terputus: ${alasan}`);
  // "io server disconnect" = server memutus kita dengan sengaja: gelang habis, logout, atau server dimatikan.
  // Socket.IO tidak menyambung ulang sendiri dalam keadaan itu: perbarui gelang dulu, lalu sambung lagi.
  if (alasan === "io server disconnect") perbaruiLaluSambung();
});

perbaruiLaluSambung(); // Modul 20: belum punya kartu terusan, jadi langkah pertamanya login
