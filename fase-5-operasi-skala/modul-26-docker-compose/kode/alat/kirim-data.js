// kirim-data.js — mengirim 3 bacaan palsu ke penerima-webhook.js
// Modul 4 - Praktik 9. Jalankan di TERMINAL KEDUA, saat penerima-webhook.js sedang berjalan:
//   node kirim-data.js

import { buatTelemetri } from "./generate-dummy.js";

const ALAMAT = "http://localhost:3000/telemetry";

// jeda(ms): Promise yang ditepati setelah ms milidetik (lihat tunggu.js)
function jeda(ms) {
  return new Promise((selesai) => setTimeout(selesai, ms));
}

for (let i = 1; i <= 3; i++) {
  const bacaan = buatTelemetri();
  const jawaban = await fetch(ALAMAT, {
    method: "POST", // POST = mengirim data
    headers: { "Content-Type": "application/json" }, // label: "isi kiriman ini JSON"
    body: JSON.stringify(bacaan), // objek -> teks JSON
  });
  console.log(`Kiriman ${i}: suhu ${bacaan.suhu} °C -> jawaban ${jawaban.status}`, await jawaban.json());
  await jeda(1000); // jeda 1 detik supaya uji cepat; ESP32 sungguhan mengirim tiap 10 detik (Lampiran A aturan 3)
}
console.log("Selesai. Lihat terminal penerima: ketiga kiriman tercetak di sana.");
