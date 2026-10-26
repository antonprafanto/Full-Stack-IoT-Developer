// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 24
// Lima kemampuan kecil yang nanti dipakai di dashboard v1.0: alamat jadi layar, janji yang gagal, simpan-ubah-kembalikan,
// memeriksa isian, dan pesan yang hilang sendiri. Jalankan dengan: node pemanasan.js
import { setTimeout as tunggu } from "node:timers/promises";

// 1. Alamat jadi layar: membaca bagian-bagian alamat, lalu mencocokkannya dengan pola seperti /perangkat/:id
console.log("--- 1. Alamat jadi layar");
const alamat = new URL("http://localhost:5173/perangkat/f00d00000001/riwayat?rentang=7hari");
console.log("pathname:", alamat.pathname); // bagian jalur, tanpa nama host dan tanpa ?…
console.log("rentang :", alamat.searchParams.get("rentang")); // nilai sesudah ?rentang=

// cocokkan("/perangkat/:id", "/perangkat/abc") -> { id: "abc" }; tidak cocok -> null
function cocokkan(pola, jalur) {
  const bagianPola = pola.split("/"); // "/perangkat/:id" -> ["", "perangkat", ":id"]
  const bagianJalur = jalur.split("/");
  if (bagianPola.length !== bagianJalur.length) return null; // jumlah ruasnya harus sama
  const params = {};
  for (let i = 0; i < bagianPola.length; i++) {
    if (bagianPola[i].startsWith(":")) params[bagianPola[i].slice(1)] = bagianJalur[i]; // ruas ":id" = boleh apa saja
    else if (bagianPola[i] !== bagianJalur[i]) return null; // ruas biasa harus persis sama
  }
  return params;
}
// "peta rute" kecil: pola pertama yang cocok menentukan layarnya. Itulah inti kerja <Routes> di React Router.
const petaRute = [
  { pola: "/perangkat", layar: "Daftar Perangkat" },
  { pola: "/perangkat/:id", layar: "Detail" },
  { pola: "/perangkat/:id/riwayat", layar: "Riwayat" },
];
for (const jalur of ["/perangkat", "/perangkat/f00d00000001", alamat.pathname, "/perangkt"]) {
  const cocok = petaRute.map((r) => ({ ...r, params: cocokkan(r.pola, jalur) })).find((r) => r.params !== null);
  console.log(jalur.padEnd(32), "->", cocok ? cocok.layar + " " + JSON.stringify(cocok.params) : "Halaman tidak ditemukan");
}

// 2. Janji yang gagal: fetch TIDAK melempar galat untuk 409 atau 504; kitalah yang memeriksa res.ok
console.log("--- 2. Janji yang gagal");
// fetch tiruan: menjawab sesudah 300 ms dengan kode yang diminta, seperti POST /devices/:id/command
async function fetchTiruan(kode) {
  await tunggu(300);
  if (kode === 0) throw new TypeError("Failed to fetch"); // backend mati: HANYA ini yang membuat fetch melempar galat
  const isi = {
    200: { ack: { ok: true } },
    409: { pesan: "perangkat sedang offline" },
    504: { pesan: "tidak ada ack dalam 5 detik" },
  };
  return { ok: kode >= 200 && kode < 300, status: kode, json: async () => isi[kode] };
}
for (const kode of [200, 409, 504, 0]) {
  let menunggu = true; // di dashboard: tulisan "Menunggu konfirmasi perangkat…"
  try {
    const res = await fetchTiruan(kode);
    if (!res.ok) throw new Error(res.status + " " + (await res.json()).pesan); // ubah jawaban gagal menjadi galat
    console.log(kode, "berhasil:", JSON.stringify(await res.json()));
  } catch (err) {
    console.log(kode, "gagal  :", err.message); // di dashboard: toast
  } finally {
    menunggu = false; // finally SELALU dijalankan, berhasil atau gagal: tulisan "Menunggu…" pasti hilang
    console.log("   menunggu =", menunggu);
  }
}

// 3. Simpan dulu, ubah, kembalikan: dasar tombol optimis dan "rollback"
console.log("--- 3. Simpan dulu, ubah, kembalikan");
const dilaporkan = { lampu: false, kipas: true }; // keadaan yang dilaporkan perangkat
const tampil = { ...dilaporkan, lampu: true }; // ... = salinan BARU; lampu langsung "nyala" di layar (optimis)
console.log("tampil (optimis):", tampil, "| dilaporkan tetap:", dilaporkan);
const perintahGagal = true; // misalnya perangkat menjawab 409
const akhir = perintahGagal ? dilaporkan : tampil; // gagal: kembali ke yang dilaporkan (rollback)
console.log("sesudah jawaban :", akhir);
const salah = dilaporkan; // BUKAN salinan: dua nama untuk benda yang sama
salah.lampu = true;
console.log("tanpa salinan   :", dilaporkan, "<- yang dilaporkan ikut berubah, tidak bisa dikembalikan lagi");

// 4. Memeriksa isian: teks dari kotak isian menjadi angka, lalu diperiksa sebelum dikirim
console.log("--- 4. Memeriksa isian");
for (const teks of ["30", "", "  25  ", "2,5", "abc"]) {
  const n = Number(teks);
  const bulat = Number.isInteger(n);
  console.log(JSON.stringify(teks).padEnd(8), "-> Number:", String(n).padEnd(4), "| bilangan bulat?", bulat, "| NaN?", Number.isNaN(n));
}
// awas: Number("") = 0, bukan "kosong". Kotak <input type="number"> yang kosong dibaca react-hook-form (valueAsNumber)
// sebagai NaN, jadi di formulir aturan kotak kosong tetap tertangkap ("Isi dengan angka").
// pemeriksa buatan sendiri: hasilnya daftar galat per kolom, mirip yang nanti dibuat Zod
function periksaAturan(isian) {
  const galat = [];
  if (isian.nama.trim() === "") galat.push({ kolom: "nama", pesan: "Wajib diisi" });
  if (Number.isNaN(isian.nyala_di_bawah)) galat.push({ kolom: "nyala_di_bawah", pesan: "Isi dengan angka" });
  // dua angka sah, tetapi batas "selesai" tidak di atas batas "mulai": aturan akan menyala-padam terus
  else if (!(isian.padam_di_atas > isian.nyala_di_bawah)) {
    galat.push({ kolom: "padam_di_atas", pesan: "harus lebih besar daripada nyala_di_bawah (histeresis)" });
  }
  return galat;
}
console.log(periksaAturan({ nama: "Siram", nyala_di_bawah: 30, padam_di_atas: 35 })); // [] = lolos
console.log(periksaAturan({ nama: "   ", nyala_di_bawah: 30, padam_di_atas: 25 })); // nama kosong + histeresis terbalik
console.log(periksaAturan({ nama: "Siram", nyala_di_bawah: Number("abc"), padam_di_atas: 35 })); // NaN tertangkap
console.log(periksaAturan({ nama: "Siram", nyala_di_bawah: Number(""), padam_di_atas: 35 })); // []: kotak KOSONG lolos (0)!

// 5. Pesan yang hilang sendiri: antrean pesan dengan setTimeout (SEKALI jalan, bukan setInterval)
console.log("--- 5. Pesan yang hilang sendiri");
const LAMA_TAMPIL = 1500; // milidetik (di dashboard: 4000)
const PALING_BANYAK = 3; // (di dashboard: 2)
let daftar = [];
let nomor = 0;
const mulai = Date.now();
function cetak(kejadian) {
  const ms = String(Date.now() - mulai).padStart(4);
  console.log(`  +${ms} ms ${kejadian.padEnd(16)} tampil: [${daftar.map((t) => t.pesan).join(" | ")}]`);
}
function tambah(pesan) {
  const id = ++nomor;
  daftar = [...daftar, { id, pesan }].slice(-PALING_BANYAK); // lebih dari 3: yang paling lama dibuang
  const pewaktu = setTimeout(() => hapus(id, "hilang sendiri"), LAMA_TAMPIL);
  cetak("tambah " + id);
  return pewaktu;
}
function hapus(id, sebab) {
  daftar = daftar.filter((t) => t.id !== id); // sudah tidak ada? tidak terjadi apa-apa
  cetak(sebab + " " + id);
}
tambah("Lampu menyala");
const pewaktuDua = tambah("Pompa menyiram");
await tunggu(500);
clearTimeout(pewaktuDua); // ditutup dengan tombol ✕: pewaktunya dibatalkan supaya tidak berjalan sia-sia
hapus(2, "ditutup");
tambah("Tanah 25 %");
tambah("Suhu 31 °C");
tambah("Kipas menyala"); // pesan keempat yang tampil: pesan nomor 1 terdorong keluar
await tunggu(LAMA_TAMPIL + 200); // tunggu semua pewaktu selesai
