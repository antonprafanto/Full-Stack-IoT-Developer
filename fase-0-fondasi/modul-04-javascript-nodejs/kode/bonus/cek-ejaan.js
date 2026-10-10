// @ts-check
// cek-ejaan.js — JSDoc + @ts-check: "pemeriksa ejaan" JavaScript di VS Code
// Modul 4 - Bedah Teknis. Buka file ini di VS Code: baris terakhir digarisbawahi merah.

/**
 * Menghitung rata-rata sebuah daftar angka.
 * @param {number[]} daftar - daftar angka, misalnya [28.5, 31.2, 27.9]
 * @returns {number} rata-ratanya
 */
function rataRata(daftar) {
  let total = 0;
  for (const angka of daftar) {
    total = total + angka;
  }
  return total / daftar.length;
}

console.log(rataRata([28.5, 31.2, 27.9])); // 29.2
console.log(rataRata("28.5")); // salah: teks, bukan daftar angka. Node.js tetap menjalankannya (hasilnya 7.125)
