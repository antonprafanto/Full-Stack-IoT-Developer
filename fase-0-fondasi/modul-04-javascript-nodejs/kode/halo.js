// Modul 4 - Praktik 3: program JavaScript pertamamu di Node.js
// Jalankan dari terminal VS Code (folder modul-04):  node halo.js

const nama = "Ani"; // teks: tulis namamu di antara dua tanda petik
const umur = 17; // angka: umurmu dalam tahun

console.log("Halo, Node.js!");
console.log("Namaku " + nama + ".");
console.log(`Umurku ${umur} tahun, kira-kira ${umur * 365} hari.`);
console.log("Sekarang:", new Date().toLocaleString("id-ID"));
