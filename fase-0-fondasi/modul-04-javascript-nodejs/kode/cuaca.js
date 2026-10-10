// cuaca.js — mengambil cuaca terkini dari internet lewat API gratis Open-Meteo
// Modul 4 - Praktik 8. Jalankan:  node cuaca.js   (butuh koneksi internet)
// Data cuaca: Open-Meteo.com, lisensi CC BY 4.0 — https://open-meteo.com/

const LINTANG = -6.2; // Jakarta. Ganti dengan lokasimu (caranya ada di Praktik 8)
const BUJUR = 106.85;

const alamat =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${LINTANG}&longitude=${BUJUR}` +
  "&current=temperature_2m,relative_humidity_2m,weather_code" +
  "&timezone=auto";

// Kode cuaca WMO yang paling sering muncul di Indonesia
const KONDISI = {
  0: "cerah",
  1: "cerah berawan",
  2: "berawan sebagian",
  3: "mendung",
  45: "berkabut",
  51: "gerimis ringan",
  53: "gerimis",
  55: "gerimis lebat",
  61: "hujan ringan",
  63: "hujan sedang",
  65: "hujan lebat",
  80: "hujan lokal ringan",
  81: "hujan lokal",
  82: "hujan lokal lebat",
  95: "badai petir",
};

console.log("Mengambil data cuaca...");
const jawaban = await fetch(alamat); // kirim permintaan, tunggu jawaban
if (!jawaban.ok) {
  console.log("Server menolak permintaan. Kode status:", jawaban.status);
  process.exit(1);
}
const data = await jawaban.json(); // isi jawaban (teks JSON) -> objek
const kini = data.current;

console.log(`Waktu    : ${kini.time} (${data.timezone})`);
console.log(`Suhu     : ${kini.temperature_2m} °C`);
console.log(`Lembap   : ${kini.relative_humidity_2m} %`);
console.log(`Kondisi  : ${KONDISI[kini.weather_code] || "kode cuaca " + kini.weather_code}`);
console.log("Sumber data: Open-Meteo.com (CC BY 4.0)");
