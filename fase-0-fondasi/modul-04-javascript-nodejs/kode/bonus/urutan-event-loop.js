// urutan-event-loop.js — siapa yang dikerjakan lebih dulu?
// Modul 4 - Bedah Teknis. Jalankan:  node urutan-event-loop.js

console.log("1. Pesanan A dicatat");

setTimeout(() => {
  console.log("4. Timer 0 milidetik berbunyi");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Janji yang sudah ditepati diurus");
});

console.log("2. Pesanan B dicatat");
