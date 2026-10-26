// cek-skema.js - memeriksa bahwa salinan skema di src/skema/ SAMA PERSIS dengan aslinya di backend (Modul 24).
// Jalankan dari folder frontend dengan "npm run cek-skema". Kode keluar 0 = semuanya sama, 1 = ada yang berbeda.
// Akhir baris CRLF (Windows) dan LF dianggap sama: Git di Windows bisa mengubahnya diam-diam, padahal isinya tetap sama.
import { readFileSync } from "node:fs";

const ASLI = "../backend/src/schemas/"; // folder backend di sebelah folder frontend
const SALINAN = "src/skema/";
const BERKAS = ["kontrak.ts", "aturan-dasar.ts"];
const BOM = String.fromCharCode(0xfeff); // tanda BOM: tak terlihat, disisipkan sebagian editor di awal berkas

// isi berkas sebagai daftar baris, dengan akhir baris CRLF diseragamkan menjadi LF
function bacaBaris(jalur) {
  try {
    return readFileSync(jalur, "utf8").replaceAll("\r\n", "\n").split("\n");
  } catch {
    console.error("Tidak bisa membaca " + jalur + ". Jalankan dari folder frontend, dengan folder backend di sebelahnya.");
    process.exit(1);
  }
}

let semuaSama = true;
for (const nama of BERKAS) {
  const asli = bacaBaris(ASLI + nama);
  const salinan = bacaBaris(SALINAN + nama);
  // cari baris pertama yang berbeda
  let beda = -1;
  for (let i = 0; i < Math.max(asli.length, salinan.length); i++) {
    if (asli[i] !== salinan[i]) {
      beda = i;
      break;
    }
  }
  if (beda === -1) {
    console.log("SAMA  " + SALINAN + nama);
    continue;
  }
  semuaSama = false;
  console.log("BEDA  " + SALINAN + nama + ", mulai baris " + (beda + 1) + ":");
  console.log("  backend : " + (asli[beda] ?? "(berkas sudah habis)"));
  console.log("  frontend: " + (salinan[beda] ?? "(berkas sudah habis)"));
  // dua beda yang tidak terlihat mata: tanda BOM (U+FEFF) di awal berkas, dan baris baru di akhir berkas
  if (beda === 0 && (asli[0].startsWith(BOM) || salinan[0].startsWith(BOM))) {
    console.log("  (beda tak terlihat: salah satu berkas diawali tanda BOM; simpan ulang sebagai UTF-8 tanpa BOM)");
  } else if (asli[beda] === undefined || salinan[beda] === undefined) {
    console.log("  (beda di akhir berkas: baris baru terakhirnya hilang atau berlebih)");
  }
}

if (!semuaSama) console.log("Salin ulang berkasnya dari " + ASLI + " (jangan diubah di frontend), lalu jalankan lagi.");
process.exit(semuaSama ? 0 : 1);
