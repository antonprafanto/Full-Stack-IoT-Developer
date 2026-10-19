// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 16
import { rataRata } from "./bantu.js";

// 1. Objek dan JSON
const teks = '{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"gerak":false}';
const bacaan = JSON.parse(teks); // teks JSON -> objek
console.log("Suhu:", bacaan.suhu, "°C");
console.log("Ada gerakan?", bacaan.gerak);
bacaan.lokasi = "ruang tamu"; // menambah kolom baru
console.log(JSON.stringify(bacaan)); // objek -> teks JSON

// 2. Array, filter, dan map
const daftar = [
  { device_id: "a4cf12e5b7c0", suhu: 28.5 },
  { device_id: "246f28b1c7d4", suhu: 31.2 },
  { device_id: "f00d00000001", suhu: 33.0 },
];
const panas = daftar.filter((b) => b.suhu > 30);
console.log("Perangkat di atas 30 °C:", panas.length);

// 3. Fungsi panah dan teks templat
const ringkas = (b) => `${b.device_id}: ${b.suhu} °C`;
console.log(daftar.map(ringkas));

// 4. import dari file lain
console.log("Rata-rata suhu:", rataRata(daftar.map((b) => b.suhu)).toFixed(1), "°C");

// 5. Menunggu tanpa membeku: Promise dan await
const tunggu = (ms) => new Promise((selesai) => setTimeout(selesai, ms));
console.log("Menunggu 1 detik...");
await tunggu(1000);
console.log("Selesai menunggu.");

// 6. fetch: bertanya ke server lain lewat HTTP
const jawaban = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.85&current=temperature_2m");
console.log("Kode status:", jawaban.status);
const data = await jawaban.json();
console.log("Suhu Jakarta sekarang:", data.current.temperature_2m, "°C");
