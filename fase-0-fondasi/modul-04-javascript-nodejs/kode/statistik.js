// statistik.js — membaca bacaan sensor palsu, lalu menghitung ringkasannya
// Modul 4 - Praktik 5. Buat datanya dulu:  node generate-dummy.js
// Lalu jalankan:  node statistik.js

import { readFile } from "node:fs/promises";

const teks = await readFile("data/bacaan.json", "utf8"); // isi file sebagai teks
const bacaan = JSON.parse(teks); // teks JSON -> array berisi objek

// map: dari setiap bacaan, ambil suhunya saja
const daftarSuhu = bacaan.map((b) => b.suhu);

const terendah = Math.min(...daftarSuhu); // tiga titik = "keluarkan semua isi array"
const tertinggi = Math.max(...daftarSuhu);

let total = 0;
for (const suhu of daftarSuhu) {
  total = total + suhu;
}
const rataRata = total / daftarSuhu.length;

// filter: saring bacaan yang memenuhi syarat
const panas = bacaan.filter((b) => b.suhu > 30);
const adaGerak = bacaan.filter((b) => b.gerak === true);

const terakhir = bacaan[bacaan.length - 1];
console.log(`Jumlah bacaan  : ${bacaan.length}`);
console.log(`Dari           : ${bacaan[0].ts}`);
console.log(`Sampai         : ${terakhir.ts}`);
console.log(`Suhu terendah  : ${terendah} °C`);
console.log(`Suhu tertinggi : ${tertinggi} °C`);
console.log(`Suhu rata-rata : ${rataRata.toFixed(2)} °C`);
console.log(`Di atas 30 °C  : ${panas.length} kali`);
console.log(`Ada gerakan    : ${adaGerak.length} kali`);
