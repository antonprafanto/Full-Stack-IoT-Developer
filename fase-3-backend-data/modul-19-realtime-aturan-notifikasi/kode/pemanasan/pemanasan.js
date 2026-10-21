// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 19
import assert from "node:assert/strict";

// 1. Map: buku catatan per perangkat
const terakhir = new Map();
terakhir.set("a4cf12e5b7c0", { suhu: 28.5, kipas: false });
terakhir.set("f00d00000001", { suhu: 31.2, kipas: true });
console.log("jumlah perangkat:", terakhir.size);
console.log(terakhir.get("a4cf12e5b7c0"));
console.log(terakhir.has("f00d00000099"), terakhir.get("f00d00000099") ?? "belum pernah mengirim");
for (const [id, bacaan] of terakhir) {
  console.log(`${id}: ${bacaan.suhu} °C, kipas ${bacaan.kipas ? "menyala" : "padam"}`);
}

// 2. Fungsi murni: jam dikirim sebagai angka (milidetik)
function sudahSelama(sejak, sekarang, detik) {
  return sejak !== null && sekarang - sejak >= detik * 1000;
}
console.log(sudahSelama(0, 119_000, 120), sudahSelama(0, 120_000, 120), sudahSelama(null, 999_000, 120));

// 3. Memeriksa dengan assert
assert.equal(sudahSelama(0, 120_000, 120), true);
assert.equal(sudahSelama(0, 119_999, 120), false);
assert.deepEqual(terakhir.get("f00d00000001"), { suhu: 31.2, kipas: true });
console.log("semua pemeriksaan lulus");

// 4. Menunda dan membatalkan: setTimeout dan clearTimeout
const penunda = new Map();
function perangkatOffline(id) {
  console.log(`${id} offline, tunggu dulu...`);
  const t = setTimeout(() => {
    penunda.delete(id);
    console.log(`PERINGATAN: ${id} offline lebih dari 2 detik`);
  }, 2000);
  penunda.set(id, t);
}
function perangkatOnline(id) {
  const t = penunda.get(id);
  if (t === undefined) return;
  clearTimeout(t);
  penunda.delete(id);
  console.log(`${id} kembali online, peringatan dibatalkan`);
}
perangkatOffline("a4cf12e5b7c0");
perangkatOffline("f00d00000001");
setTimeout(() => perangkatOnline("a4cf12e5b7c0"), 500);

// 5. Kapan harus mengabari?
const TIGA_PULUH_MENIT = 30 * 60_000;
function perluKabari(bahaya, bahayaSebelumnya, terakhirDikabari, sekarang) {
  if (bahaya !== bahayaSebelumnya) return true; // keadaan berubah: selalu kabari
  if (!bahaya) return false; // tetap aman: diam
  return sekarang - terakhirDikabari >= TIGA_PULUH_MENIT; // tetap bahaya: paling sering 30 menit sekali
}
console.log(
  perluKabari(true, false, 0, 0),
  perluKabari(true, true, 0, 10 * 60_000),
  perluKabari(true, true, 0, 30 * 60_000),
  perluKabari(false, true, 0, 31 * 60_000),
  perluKabari(false, false, 0, 99 * 60_000),
);
