// bantu.js - fungsi kecil yang dipakai pemanasan.js
export function rataRata(angka) {
  const jumlah = angka.reduce((total, x) => total + x, 0);
  return jumlah / angka.length;
}
