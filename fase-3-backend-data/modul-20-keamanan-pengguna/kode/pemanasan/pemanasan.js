// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 20
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";

// 1. Sidik jari: createHash
const sidikJari = (teks) => createHash("sha256").update(teks).digest("hex");
console.log(sidikJari("kopi pagi"));
console.log(sidikJari("kopi pagi"));
console.log(sidikJari("kopi pagI"));
console.log(sidikJari("kopi pagi").length, sidikJari("kalimat yang jauh lebih panjang daripada kopi pagi").length);

const bocor = "bee5688aea66a47460b19c76f8f199c6b9585eb726f8322b1429793863609ca2";
const sandiPopuler = ["123456", "password", "qwerty", "rahasia123", "iloveyou"];
for (const tebakan of sandiPopuler) {
  if (sidikJari(tebakan) === bocor) console.log(`ketemu: ${tebakan}`);
}
const mulai = performance.now();
for (let i = 0; i < 100_000; i++) sidikJari(`tebakan-${i}`);
console.log(`100.000 tebakan: ${Math.round(performance.now() - mulai)} ms`);

// 2. Bilangan acak yang tidak bisa ditebak
const token1 = randomBytes(32).toString("base64url");
const token2 = randomBytes(32).toString("base64url");
console.log(token1);
console.log(token2);
console.log(token1.length, token1 === token2);

// 3. Membuat dan membaca "gelang"
const RAHASIA = "stempel-panitia-hanya-panitia-yang-tahu";
const keTeks = (objek) => Buffer.from(JSON.stringify(objek)).toString("base64url");
const tandaTangan = (kepalaDanIsi) => createHmac("sha256", RAHASIA).update(kepalaDanIsi).digest("base64url");
function buatGelang(isi) {
  const kepalaDanIsi = `${keTeks({ alg: "HS256", typ: "JWT" })}.${keTeks(isi)}`;
  return `${kepalaDanIsi}.${tandaTangan(kepalaDanIsi)}`;
}
const detikSekarang = () => Math.floor(Date.now() / 1000);
const gelang = buatGelang({ sub: "2", peran: "viewer", exp: detikSekarang() + 900 });
console.log(gelang);
const [kepala, isi, tanda] = gelang.split(".");
console.log(JSON.parse(Buffer.from(isi, "base64url").toString()));

// 4. Memeriksa gelang: tanda tangan dan kedaluwarsa
function periksaGelang(teks) {
  const [kepala, isi, tanda] = teks.split(".");
  if (tandaTangan(`${kepala}.${isi}`) !== tanda) return null; // tanda tangan tidak cocok: palsu
  const data = JSON.parse(Buffer.from(isi, "base64url").toString());
  if (data.exp <= detikSekarang()) return null; // sudah kedaluwarsa
  return data;
}
const gelangPalsu = `${kepala}.${keTeks({ sub: "2", peran: "admin", exp: detikSekarang() + 900 })}.${tanda}`;
const gelangBasi = buatGelang({ sub: "2", peran: "viewer", exp: detikSekarang() - 1 });
console.log(periksaGelang(gelang)?.peran, periksaGelang(gelangPalsu), periksaGelang(gelangBasi));
assert.equal(periksaGelang(gelangPalsu), null);

// 5. Satpam mini: Set berisi pintu yang boleh dilewati tanpa gelang
const TERBUKA = new Set(["POST /auth/login", "GET /health"]);
function satpam(metode, rute, gelangTeks) {
  if (TERBUKA.has(`${metode} ${rute}`)) return 200; // pintu terbuka
  const pemakai = gelangTeks === undefined ? null : periksaGelang(gelangTeks);
  if (pemakai === null) return 401; // tidak bergelang, gelangnya palsu, atau sudah basi
  if (pemakai.peran !== "admin" && metode !== "GET") return 403; // viewer hanya boleh melihat
  return 200;
}
const gelangAdmin = buatGelang({ sub: "1", peran: "admin", exp: detikSekarang() + 900 });
console.log(
  satpam("GET", "/health"),
  satpam("GET", "/devices"),
  satpam("GET", "/devices", gelang),
  satpam("POST", "/devices/f00d00000001/command", gelang),
  satpam("POST", "/devices/f00d00000001/command", gelangPalsu),
  satpam("POST", "/devices/f00d00000001/command", gelangAdmin),
);
