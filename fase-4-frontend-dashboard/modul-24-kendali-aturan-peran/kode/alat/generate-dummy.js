// generate-dummy.js — pembuat data sensor palsu sesuai "kontrak data" (Lampiran A Silabus)
// Modul 4 - Praktik 4. Dipakai lagi di Modul 10, 16, dan 22.
//
// Cara pakai (dari terminal, di folder yang berisi file ini):
//   node generate-dummy.js        -> menulis 100 bacaan ke data/bacaan.json
//   node generate-dummy.js 500    -> menulis 500 bacaan
// File lain bisa memakai fungsinya:
//   import { buatTelemetri } from "./generate-dummy.js";

import { mkdir, writeFile } from "node:fs/promises";

// Bilangan bulat acak dari min sampai maks (keduanya ikut).
function acak(min, maks) {
  return Math.floor(Math.random() * (maks - min + 1)) + min;
}

// Satu bacaan "telemetry" Node 1, bentuknya persis seperti contoh di Lampiran A.
export function buatTelemetri(waktu = new Date()) {
  return {
    ts: waktu.toISOString().slice(0, 19) + "Z", // waktu UTC tanpa milidetik, misalnya "2026-10-09T09:41:30Z"
    fw: "0.1.0", // versi firmware (sama dengan kerangka Node 1 di Modul 3)
    suhu: acak(250, 330) / 10, // 25.0 sampai 33.0 derajat Celsius
    kelembapan: acak(55, 85), // persen
    cahaya: acak(0, 4095), // 0 sampai 4095 (pembacaan analog 12 bit, Modul 6)
    tanah: acak(20, 60), // kelembapan tanah, persen
    gerak: Math.random() < 0.2, // kira-kira 1 dari 5 bacaan mendeteksi gerakan
    level_air: acak(30, 90), // isi tandon, persen
  };
}

// Bagian di bawah ini hanya jalan kalau file ini dijalankan langsung
// (node generate-dummy.js), bukan saat fungsinya dipakai file lain lewat import.
if (import.meta.main) {
  const jumlah = Number(process.argv[2]) || 100; // angka setelah nama file, atau 100
  const JEDA = 10000; // satu bacaan tiap 10 detik (aturan 3 Lampiran A), dalam milidetik
  const mulai = Date.now() - (jumlah - 1) * JEDA; // mundur dulu supaya bacaan terakhir = sekarang

  const daftar = [];
  for (let i = 0; i < jumlah; i++) {
    daftar.push(buatTelemetri(new Date(mulai + i * JEDA)));
  }

  await mkdir("data", { recursive: true }); // buat folder data kalau belum ada
  await writeFile("data/bacaan.json", JSON.stringify(daftar, null, 2));
  console.log(`Selesai: ${jumlah} bacaan ditulis ke data/bacaan.json`);
  console.log("Contoh bacaan pertama:", daftar[0]);
}
