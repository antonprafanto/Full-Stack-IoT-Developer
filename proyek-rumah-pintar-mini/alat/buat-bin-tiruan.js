// buat-bin-tiruan.js - membuat berkas .bin TIRUAN untuk berlatih pembaruan firmware TANPA papan (Modul 28, jalur tanpa Kit).
// Berkas ini BUKAN firmware: isinya hanya teks penanda dan bait acak, tidak bisa dijalankan ESP32. JANGAN di-flash ke papan
// dan JANGAN dikirim ke papan sungguhan. Gunanya: diunggah di layar Armada (Unggah firmware), lalu "dipasang" perangkat tiruan
// alat/simulator-perangkat.js, supaya seluruh jalan pembaruan (unggah, sidik jari SHA-256, unduhan berkunci, masa uji,
// rollback) bisa dicoba tanpa Arduino IDE dan tanpa ESP32.
//
// Isi berkas (sengaja meniru hal-hal yang DIPERIKSA server dan perangkat tiruan, bukan isi firmware sungguhan):
//   - bait pertama 0xE9: semua berkas program ESP32 (<sketsa>.ino.bin) diawali bait ini. Server menolak berkas lain
//     (400 "bukan citra aplikasi ESP32"), dan HTTPUpdate di papan juga memeriksanya.
//   - lalu satu baris teks "BUKAN FIRMWARE ASLI ..." (siapa pun yang membuka berkasnya langsung tahu ini tiruan)
//   - pilihan --uji menambah penanda UJI_KUNCI_SALAH di baris itu (dalam 512 bait pertama). Perangkat tiruan yang memasang
//     berkas bertanda ini meniru firmware 1.7.2-uji: kunci brokernya salah, masa uji 60 detik lewat, lalu ia kembali sendiri
//     ke versi lama (rollback).
//   - sisanya bait "acak" yang selalu sama untuk versi, ukuran, dan pilihan --uji yang sama (diturunkan dari SHAKE256), supaya
//     ukurannya mirip firmware Node 1 (bawaan 1.196.032 byte, sekitar 1,2 MB) dan sidik jarinya bisa dicocokkan.
//
// Cara pakai (dari terminal, di folder alat; Node.js saja, tanpa library dari npm):
//   node buat-bin-tiruan.js 1.7.1 ../../firmware-tiruan                  -> rilis biasa 1.7.1
//   node buat-bin-tiruan.js 1.7.2 ../../firmware-tiruan --uji            -> rilis UJI 1.7.2 (latihan rollback)
//   node buat-bin-tiruan.js 1.7.3 ../../firmware-tiruan --ukuran=1300000 -> ukuran lain (byte)
// Isian kedua = folder tujuan (dibuat kalau belum ada; bawaan: folder tempat perintah dijalankan). Dari folder alat,
// ../../firmware-tiruan = folder "firmware-tiruan" DI SAMPING folder repositorimu, jadi di luar Git.
// Berkas yang sudah ada tidak pernah ditimpa: hapus sendiri berkas lamanya kalau memang mau membuat ulang.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const RAK_PROGRAM = 1966080; // satu rak program (app0/app1) skema Minimal SPIFFS (Modul 10): batas ukuran di server
const UKURAN_BAWAAN = 1196032; // sekitar 1,2 MB (61 % satu rak), seperti berkas tiruan di lab penulis
const UKURAN_MIN = 1024;
const UKURAN_MAKS = 4 * 1024 * 1024; // 4 MiB: boleh lebih besar dari satu rak, untuk melihat server menolaknya
const KEPALA = 512; // 512 bait pertama: tempat penanda dicari perangkat tiruan (simulator-perangkat.js)
// Aturan versi rilis yang SAMA dengan backend (services/versi.ts): x.y.z tanpa nol di depan, paling banyak 5 angka per bagian
const POLA_VERSI = /^(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})$/;

// Pesan galat ramah awam, lalu berhenti dengan kode 1 (tanda gagal untuk terminal)
function berhenti(pesan) {
  console.error(pesan);
  process.exit(1);
}

// ---------- isian dari terminal ----------
const isian = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const pilihan = process.argv.slice(2).filter((a) => a.startsWith("--"));
const [versi, folder = "."] = isian;
const uji = pilihan.includes("--uji");

if (versi === undefined) {
  berhenti("Tulis versinya, misalnya: node buat-bin-tiruan.js 1.7.1 ../../firmware-tiruan\n" +
    "Tambahkan --uji untuk berkas latihan rollback, atau --ukuran=1300000 untuk ukuran lain (byte).");
}
for (const p of pilihan) {
  if (p !== "--uji" && !p.startsWith("--ukuran=")) berhenti(`Pilihan ${p} tidak dikenal. Yang ada: --uji dan --ukuran=<byte>.`);
}
if (isian.length > 2) berhenti(`Isian terlalu banyak: ${isian.join(" ")}. Cukup versi, lalu (boleh) folder tujuan.`);
if (!POLA_VERSI.test(versi)) {
  berhenti(`Versi "${versi}" tidak bisa dipakai. Tulis x.y.z tanpa huruf dan tanpa nol di depan, misalnya 1.7.1 ` +
    "(bukan v1.7.1, 1.7, atau 1.07.1): server menolak bentuk lain.");
}
const teksUkuran = pilihan.find((p) => p.startsWith("--ukuran="))?.slice("--ukuran=".length);
const ukuran = teksUkuran === undefined ? UKURAN_BAWAAN : Number(teksUkuran);
if (!/^\d+$/.test(teksUkuran ?? "0") || ukuran < UKURAN_MIN || ukuran > UKURAN_MAKS) {
  berhenti(`Ukuran "${teksUkuran}" tidak bisa dipakai. Tulis bilangan bulat byte ${UKURAN_MIN}-${UKURAN_MAKS}, ` +
    `misalnya --ukuran=1300000 (tanpa titik). Bawaannya ${UKURAN_BAWAAN}.`);
}

// ---------- jaga Git: berkas .bin tidak boleh ikut commit ----------
// Cari akar repositori Git (folder yang punya .git) dari folder tujuan ke atas. null = folder tujuan di luar Git.
function akarGit(awal) {
  let dir = resolve(awal);
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir;
    const atas = dirname(dir);
    if (atas === dir) return null;
    dir = atas;
  }
}
const akar = akarGit(folder);
if (akar !== null) {
  const abaikan = existsSync(join(akar, ".gitignore")) ? readFileSync(join(akar, ".gitignore"), "utf8") : "";
  const adaBin = abaikan.split(/\r?\n/).some((baris) => ["*.bin", "**/*.bin", "/*.bin"].includes(baris.trim()));
  if (!adaBin) {
    berhenti(`Folder tujuan ada di dalam repositori Git (${akar}), dan .gitignore di sana belum memuat baris *.bin.\n` +
      "Berkas .bin tidak boleh ikut commit. Pilih folder di luar repositori, misalnya:\n" +
      `  node buat-bin-tiruan.js ${versi} ../../firmware-tiruan${uji ? " --uji" : ""}\n` +
      "atau tambahkan dulu baris *.bin ke .gitignore (Modul 28).");
  }
}

// ---------- isi berkas ----------
// Baris penanda: hanya huruf ASCII, supaya terbaca sama oleh siapa pun (perangkat tiruan membacanya sebagai latin1)
const penanda = `BUKAN FIRMWARE ASLI - berkas TIRUAN buat-bin-tiruan.js (Rumah Pintar Mini, Modul 28) - node-1 ${versi}` +
  `${uji ? " - UJI_KUNCI_SALAH" : ""} - jangan di-flash ke papan\n`;
const isi = Buffer.alloc(ukuran); // semua bait mulai dari 0x00
isi[0] = 0xe9; // bait pertama berkas program ESP32
isi.write(penanda, 1, "latin1"); // 512 bait pertama = 0xE9 + penanda + 0x00 sisanya
// Sesudah 512 bait pertama: bait "acak" dengan resep tetap (hasilnya sama di komputer mana pun). SHAKE256 (keluarga SHA-3,
// kerabat SHA-256) bisa menghasilkan "sidik jari" sepanjang yang kita minta: di sini sepanjang sisa berkas.
const benih = `buat-bin-tiruan|${versi}|${uji ? "uji" : "biasa"}|${ukuran}`;
createHash("shake256", { outputLength: ukuran - KEPALA }).update(benih).digest().copy(isi, KEPALA);
const sha256 = createHash("sha256").update(isi).digest("hex");

// ---------- tulis (TIDAK pernah menimpa) ----------
const nama = `node-1-${versi}${uji ? "-UJI" : ""}-TIRUAN.bin`;
const jalur = resolve(folder, nama);
try {
  mkdirSync(resolve(folder), { recursive: true });
} catch (galat) {
  berhenti(`Folder ${resolve(folder)} tidak bisa dibuat: ${galat.message}`);
}
try {
  writeFileSync(jalur, isi, { flag: "wx" }); // "wx" = gagal kalau berkasnya sudah ada
} catch (galat) {
  if (galat.code === "EEXIST") {
    berhenti(`Berkas ${jalur} sudah ada: tidak ditimpa.\n` +
      "Server juga tidak pernah menimpa versi yang sudah diunggah, jadi biasanya yang kamu perlukan adalah VERSI BARU " +
      `(misalnya ${versi.replace(/\d+$/, (n) => String(Number(n) + 1))}). Kalau memang mau membuat ulang, hapus dulu berkas lamanya.`);
  }
  berhenti(`Berkas ${jalur} tidak bisa ditulis: ${galat.message}`);
}

const persen = Math.round((ukuran / RAK_PROGRAM) * 100);
console.log(`Berkas TIRUAN dibuat: ${jalur}`);
console.log(`  versi        ${versi}${uji ? " (rilis UJI: berisi penanda UJI_KUNCI_SALAH)" : " (rilis biasa)"}`);
console.log(`  ukuran       ${ukuran} byte (${persen} % satu rak program ${RAK_PROGRAM} byte)`);
console.log('  bait pertama 0xE9, lalu teks "BUKAN FIRMWARE ASLI ..."');
console.log(`  SHA-256      ${sha256}`);
if (ukuran > RAK_PROGRAM) {
  console.log("Ukurannya lebih besar dari satu rak program: server akan MENOLAKNYA (terlalu besar), dan layar Armada sudah\n" +
    "menolaknya sebelum mengunggah. Cocok untuk melihat penolakan itu.");
} else {
  console.log(uji
    ? `Unggah di layar Armada (Unggah firmware Node 1) dengan versi ${versi} dan CENTANG Rilis uji. Perangkat tiruan yang memasangnya\n` +
      "gagal masuk broker (kunci sengaja salah), lalu sesudah masa uji 60 detik kembali sendiri ke versi lama (rollback)."
    : `Unggah di layar Armada (Unggah firmware Node 1) dengan versi ${versi}. SHA-256 yang ditampilkan server harus sama dengan di atas.`);
}
if (akar !== null) {
  console.log(`Catatan: berkas ini ada di dalam repositori Git (${akar}). .gitignore mengabaikan *.bin, jadi tidak ikut commit,\n` +
    `tetapi lebih rapi di luar repositori, misalnya: node buat-bin-tiruan.js ${versi} ../../firmware-tiruan${uji ? " --uji" : ""}`);
}
console.log("BUKAN firmware asli: jangan di-flash ke papan dan jangan dikirim ke papan sungguhan. Khusus perangkat tiruan (simulator).");
