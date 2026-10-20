// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 17

// 1. Waktu dengan Date
const waktu = new Date("2026-10-20T10:10:00+07:00"); // pukul 10.10 WIB
console.log(waktu.toISOString()); // titik waktu yang sama, ditulis dalam UTC
const sejam = 60 * 60 * 1000; // satu jam dalam milidetik
const sejamLalu = new Date(waktu.getTime() - sejam);
console.log(sejamLalu.toISOString());
console.log(waktu.toISOString().slice(0, 19) + "Z"); // format kontrak data, tanpa milidetik

// 2. ?. dan ??
const node1 = { suhu: 28.5, cahaya: 2310 };
const node2 = { suhu: 29.4, tekanan: 1008.6 };
console.log(node1.tekanan ?? null); // tidak ada -> null
console.log(node2.tekanan ?? null);
const kosong = null;
console.log(kosong?.cahaya ?? null); // kosong bernilai null: ?. berhenti tanpa galat
console.log(0 ?? 99, 0 || 99); // ?? hanya mengganti null dan undefined; || juga mengganti 0

// 3. Spread: salin semua kolom, lalu ganti satu
const baris = { ts: waktu, suhu: 28.5, kelembapan: 71 };
const untukApi = { ...baris, ts: baris.ts.toISOString().slice(0, 19) + "Z" };
console.log(untukApi);
console.log(baris.ts instanceof Date); // yang asli tidak berubah

// 4. Menunggu, dan menangkap kegagalan
function tanyaDatabase(hidup) {
  return new Promise((berhasil, gagal) => {
    setTimeout(() => {
      if (hidup) berhasil([{ suhu: 28.5 }]);
      else gagal(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    }, 300);
  });
}
for (const hidup of [true, false]) {
  try {
    const hasil = await tanyaDatabase(hidup);
    console.log("berhasil:", hasil.length, "baris");
  } catch (galat) {
    console.log("gagal:", galat.message);
  }
}
console.log("program tetap berjalan");

// 5. Teks templat banyak baris
const id = "a4cf12e5b7c0";
const kalimat = `SELECT ts, suhu
FROM readings
WHERE device_id = '${id}'`;
console.log(kalimat);
const nakal = "x'; DELETE FROM readings; --";
console.log(`WHERE device_id = '${nakal}'`);
