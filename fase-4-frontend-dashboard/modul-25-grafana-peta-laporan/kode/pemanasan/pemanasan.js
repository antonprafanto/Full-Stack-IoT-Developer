// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 25 (langkah 4-5). Dua kemampuan kecil yang nanti dipakai laporan
// harian di backend: satu baris CSV gaya Indonesia, dan teks yang menjadi berkas (byte). Jalankan dengan: node pemanasan.js
import { readFileSync } from "node:fs";

// 4. Satu baris CSV gaya Indonesia (resep csv.ts Modul 23): pemisah titik koma, koma desimal, sel kosong untuk null,
//    dan teks yang memuat ; atau " dibungkus tanda petik. Fungsi "murni": masukan -> teks, tanpa database, tanpa jaringan.
console.log("--- 4. Satu baris CSV gaya Indonesia");
function kutip(teks) {
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}
function sel(nilai) {
  if (nilai === null) return ""; // tidak ada datanya (misalnya Node 2 tanpa vitals): sel kosong, BUKAN 0
  if (typeof nilai === "number") return String(nilai).replace(".", ","); // 28.5 -> "28,5"
  return kutip(nilai);
}
function barisCsv(nilai) {
  return nilai.map(sel).join(";");
}
console.log(barisCsv(["device_id", "nama", "suhu_rata", "rssi_rata"]));
console.log(barisCsv(["f00d00000001", "Node 1; ruang tamu", 28.5, -67]));
console.log(barisCsv(["f00d000000b2", "Kebun", 27, null])); // 27 tetap "27"; null -> sel kosong di ujung baris

// 5. Teks menjadi berkas. Telegram menerima BERKAS (deretan byte), bukan teks. Buffer.from(teks, "utf8") = teks -> byte.
//    "\uFEFF" = BOM: SATU huruf yang tak terlihat, tetapi TIGA byte (EF BB BF). Huruf seperti ° juga lebih dari satu byte.
console.log("--- 5. Teks menjadi berkas");
const isi = "\uFEFF" + barisCsv(["device_id", "suhu_rata"]) + "\r\n" + barisCsv(["f00d00000001", 28.5]) + "\r\n";
const berkas = Buffer.from(isi, "utf8");
console.log("huruf:", isi.length, "| byte:", berkas.length, "| 3 byte pertama:", berkas.subarray(0, 3));
console.log('"°" =', "°".length, "huruf,", Buffer.from("°", "utf8").length, "byte");
// Jebakan: banyak fungsi menganggap TEKS sebagai NAMA BERKAS di disk. readFileSync(isi) mencari berkas bernama
// "\uFEFFdevice_id;suhu_rata..." -> galat ENOENT (berkas tidak ada). new InputFile("teks…") di grammY (bot Telegram)
// berperilaku sama; obatnya: berikan byte-nya, new InputFile(Buffer.from(isi, "utf8"), "laporan.csv").
try {
  readFileSync(isi);
} catch (err) {
  console.log("teks dianggap nama berkas ->", err.code);
}
