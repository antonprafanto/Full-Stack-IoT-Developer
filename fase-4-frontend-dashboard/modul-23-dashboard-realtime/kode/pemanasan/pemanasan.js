// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 23
// Lima kemampuan kecil yang nanti dipakai lagi di dashboard live: waktu, jendela geser, pendengar acara, detak, dan CSV.
import { EventEmitter } from "node:events";
import { setTimeout as tunggu } from "node:timers/promises";

// 1. Waktu: Date.parse, Date.now, dan jam WIB
// ts dari perangkat berbentuk teks UTC tanpa milidetik, misalnya "2026-10-24T03:15:42Z". Di sini dibuat "12 detik lalu".
const ts = new Date(Date.now() - 12_000).toISOString().slice(0, 19) + "Z";
const t = Date.parse(ts); // teks -> angka: milidetik sejak 1 Januari 1970 (UTC)
const selisihDetik = Math.round((Date.now() - t) / 1000); // Date.now() = sekarang, juga dalam milidetik
console.log("ts:", ts, "->", t);
console.log(`terakhir dilihat ${selisihDetik} detik yang lalu`);
console.log("jam laptop :", new Date(t).toLocaleTimeString("id-ID")); // mengikuti zona waktu laptop
console.log("jam WIB    :", new Date(t).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }), "WIB"); // selalu WIB

// 2. Jendela geser 5 menit: tambah titik baru, buang yang terlalu tua, buang yang ganda
const LIMA_MENIT = 5 * 60 * 1000;
const sekarang = Date.now();
const lama = [
  { t: sekarang - 6 * 60 * 1000, suhu: 27.9 }, // 6 menit lalu: sudah di luar jendela
  { t: sekarang - 20_000, suhu: 28.4 },
  { t: sekarang - 10_000, suhu: 28.5 },
];
const baru = [
  { t: sekarang - 10_000, suhu: 28.5 }, // titik yang sama datang dua kali (misalnya dari API dan dari soket)
  { t: sekarang, suhu: 28.7 },
];
const urut = [...lama, ...baru] // ... = salin isi kedua larik ke larik BARU; "lama" tidak diubah
  .filter((p) => p.t >= sekarang - LIMA_MENIT) // hanya 5 menit terakhir
  .sort((a, b) => a.t - b.t); // urut dari yang terlama
const jendela = urut.filter((p, i) => i === 0 || p.t !== urut[i - 1].t); // sesudah diurutkan, yang ganda bersebelahan
console.log("lama:", lama.length, "titik | jendela baru:", jendela.map((p) => p.suhu).join(", "));

// 3. Pendengar acara: on, emit, dan off (kembaran socket.on / socket.off di browser)
const soketPalsu = new EventEmitter();
function tampilkan(deviceId, isi) {
  console.log(`  telemetry ${deviceId}: suhu ${isi.suhu} °C`);
}
soketPalsu.on("telemetry", tampilkan); // pasang pendengar
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.1 }); // tercetak sekali
soketPalsu.on("telemetry", tampilkan); // lupa melepas, lalu memasang lagi (seperti efek tanpa cleanup)
console.log("pendengar telemetry sekarang:", soketPalsu.listenerCount("telemetry"));
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.2 }); // tercetak DUA kali: bacaan tampil ganda
soketPalsu.off("telemetry", tampilkan); // lepas satu, dengan fungsi yang SAMA
soketPalsu.off("telemetry", tampilkan);
console.log("sesudah off dua kali:", soketPalsu.listenerCount("telemetry"));
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.3 }); // tidak ada yang mendengar: tidak tercetak apa pun

// 4. Detak: setInterval dan clearInterval. Ini JAM di layar, bukan polling: tidak ada yang ditanyakan ke server.
let detak = 0;
const pewaktu = setInterval(() => {
  detak++;
  console.log(`  detak ${detak}: ${new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`);
  if (detak === 3) clearInterval(pewaktu); // tanpa clearInterval, detaknya jalan terus
}, 1000);
await tunggu(3500); // tunggu tiga detak selesai sebelum langkah berikutnya

// 5. Teks CSV untuk Excel Indonesia: titik koma sebagai pemisah, koma sebagai desimal, dan tanda petik bila perlu
function kutip(teks) {
  // nilai yang memuat ; " atau baris baru dibungkus petik, dan petik di dalamnya digandakan
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}
const baris = [
  ["waktu_wib", "perangkat", "suhu_rata_c"],
  ["2026-10-24 10:00:00", "Node 1; ruang tamu", 28.5],
  ["2026-10-24 11:00:00", 'Node "utama"', 29],
];
const csv = baris
  .map((b) => b.map((nilai) => (typeof nilai === "number" ? String(nilai).replace(".", ",") : kutip(nilai))).join(";"))
  .join("\r\n"); // Excel di Windows memakai CRLF sebagai akhir baris
console.log(csv);
