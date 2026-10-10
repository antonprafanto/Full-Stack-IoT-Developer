// tanpa-membeku.js — bukti bahwa Node.js tetap bekerja selama menunggu
// Modul 4 - Bedah Teknis. Jalankan:  node tanpa-membeku.js

function bacaSensorLambat() {
  return new Promise((selesai) => {
    setTimeout(() => selesai(28.5), 2000); // sensor pura-pura: 2 detik
  });
}

// Setiap 0,6 detik, cetak satu baris: tanda Node.js tidak membeku
const detak = setInterval(() => {
  console.log("   ...sambil menunggu, Node.js masih bebas bekerja");
}, 600);

console.log("Minta sensor membaca...");
const suhu = await bacaSensorLambat();
clearInterval(detak); // hentikan detaknya
console.log("Suhu:", suhu, "°C");
