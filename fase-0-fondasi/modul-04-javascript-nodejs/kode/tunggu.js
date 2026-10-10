// tunggu.js — simulasi "menunggu sensor" dengan Promise dan await
// Modul 4 - Praktik 6. Jalankan:  node tunggu.js
// Lalu coba hapus kata await di baris "const hasil = ...", simpan, dan jalankan lagi.

import { buatTelemetri } from "./generate-dummy.js";

// Sensor pura-pura yang butuh 2 detik untuk membaca.
// Fungsi ini langsung mengembalikan sebuah Promise: "janji" bahwa hasilnya menyusul.
function bacaSensorLambat() {
  return new Promise((selesai) => {
    setTimeout(() => {
      selesai(buatTelemetri()); // 2 detik kemudian: janji ditepati, hasil diserahkan
    }, 2000);
  });
}

console.log("1. Minta sensor membaca...");
const hasil = await bacaSensorLambat(); // await = tunggu sampai janji ditepati
console.log("2. Hasilnya datang:", hasil);
console.log("3. Lanjut ke pekerjaan berikutnya.");
