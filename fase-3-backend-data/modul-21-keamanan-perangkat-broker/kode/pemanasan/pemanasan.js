// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 21
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// 1. Kunci perangkat: 32 byte acak, ditulis sebagai 43 huruf base64url
const buatKunci = () => randomBytes(32).toString("base64url");
const kunciNode1 = buatKunci();
console.log(kunciNode1, kunciNode1.length);
const bentukKunci = /^[A-Za-z0-9_-]{43}$/;
console.log(bentukKunci.test(kunciNode1));
console.log(bentukKunci.test(kunciNode1 + " "));
console.log(bentukKunci.test(kunciNode1.slice(0, 42)));

// 2. Sidik jari dan pembanding yang adil
const sidikJari = (teks) => createHash("sha256").update(teks).digest("hex");
const tersimpan = sidikJari(kunciNode1); // yang disimpan backend di kolom kunci_hash
function cocokkanKunci(kunci, sidikJariTersimpan) {
  const a = Buffer.from(sidikJari(kunci), "hex");
  const b = Buffer.from(sidikJariTersimpan, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
console.log(tersimpan.length);
console.log(cocokkanKunci(kunciNode1, tersimpan));
const bedaSatuHuruf = (kunciNode1[0] === "A" ? "B" : "A") + kunciNode1.slice(1);
console.log(cocokkanKunci(bedaSatuHuruf, tersimpan));
console.log(cocokkanKunci(buatKunci(), tersimpan));

// 3. Mencocokkan topik dengan pola daftar izin
function cocokPola(pola, topik, pengguna) {
  if (pengguna.includes("+") || pengguna.includes("#") || pengguna.includes("/")) return false;
  const p = pola.split("/").map((tingkat) => (tingkat === "%u" ? pengguna : tingkat));
  const t = topik.split("/");
  for (let i = 0; i < p.length; i++) {
    if (p[i] === "#") return true;
    if (i >= t.length) return false;
    if (p[i] !== "+" && p[i] !== t[i]) return false;
  }
  return p.length === t.length;
}
console.log(cocokPola("rpm/%u/telemetry", "rpm/a4cf12e5b7c0/telemetry", "a4cf12e5b7c0"));
console.log(cocokPola("rpm/%u/telemetry", "rpm/a4cf12e5b7c0/telemetry", "c0ba00000001"));
console.log(cocokPola("rpm/+/cmd", "rpm/a4cf12e5b7c0/cmd", "backend"));
console.log(cocokPola("rpm/#", "rpm/a4cf12e5b7c0/status", "pemantau"));
console.log(cocokPola("rpm/%u/telemetry", "rpm/a4cf12e5b7c0/telemetry", "+"));

// 4. Buku tamu dengan Map: daftar resmi dan lapis kedua
const daftarResmi = new Map([
  ["a4cf12e5b7c0", { nama: "Node 1 ruang tamu", dicabut: null }],
  ["246f28b1c7d4", { nama: "Node 2 kebun", dicabut: null }],
  ["c0ba00000001", { nama: "papan uji", dicabut: "2026-10-23T02:10:00Z" }],
]);
function izin(deviceId) {
  const perangkat = daftarResmi.get(deviceId);
  if (perangkat === undefined) return "belum-terdaftar";
  if (perangkat.dicabut !== null) return "dicabut";
  return "terdaftar";
}
for (const id of ["a4cf12e5b7c0", "c0ba00000001", "f00d00000009"]) {
  const keputusan = izin(id);
  console.log(id, keputusan, keputusan === "terdaftar" ? "-> diproses" : "-> DIABAIKAN");
}

// 5. Sandi di paket hanyalah byte
function teksMqtt(teks) {
  const isi = Buffer.from(teks, "utf8");
  const panjang = Buffer.alloc(2);
  panjang.writeUInt16BE(isi.length);
  return Buffer.concat([panjang, isi]);
}
const paket = Buffer.concat([teksMqtt("a4cf12e5b7c0"), teksMqtt("Qx3-contoh-kunci")]);
console.log(paket.toString("hex"));
console.log(paket.length);
const panjangNama = paket.readUInt16BE(0);
const nama = paket.toString("utf8", 2, 2 + panjangNama);
const panjangSandi = paket.readUInt16BE(2 + panjangNama);
const sandi = paket.toString("utf8", 4 + panjangNama, 4 + panjangNama + panjangSandi);
console.log(nama, sandi);
