// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 22
// Lima kemampuan kecil yang nanti dipakai lagi di komponen React dashboard.

// 1. Objek bacaan dan destrukturisasi
const bacaan = {
  device_id: "a4cf12e5b7c0",
  telemetry: { ts: "2026-10-23T09:41:30Z", fw: "1.5.0", suhu: 28.5, kelembapan: 71, cahaya: 3094, tanah: 37, gerak: false, level_air: 52 },
};
const { suhu, kelembapan } = bacaan.telemetry; // ambil dua kolom sekaligus ke variabel bernama sama
console.log("Suhu:", suhu, "°C, kelembapan:", kelembapan, "%");
// destrukturisasi juga bisa langsung di parameter fungsi, persis cara komponen React menerima props
function kartu({ label, nilai, satuan }) {
  return `${label}: ${nilai} ${satuan}`;
}
console.log(kartu({ label: "Suhu", nilai: suhu, satuan: "°C" }));

// 2. Dari array menjadi daftar: map
const daftar = [
  { device_id: "a4cf12e5b7c0", nama: "Node 1 ruang tamu", status: "online" },
  { device_id: "246f28b1c7d4", nama: "Node 2 kebun", status: "online" },
  { device_id: "f00d00000001", nama: "Latihan ruang tamu", status: "belum-diketahui" },
];
const baris = daftar.map((p) => `${p.nama} (${p.status})`); // satu objek masuk, satu baris teks keluar
console.log(baris);
console.log(daftar.map((p) => p.device_id).join(", ")); // device_id unik: nanti jadi key di React

// 3. Memilih yang ditampilkan: ? :, &&, dan ??
const gagal = { suhu: null, kelembapan: null, cahaya: 2310, tanah: 0, gerak: true, level_air: null }; // aturan 7: gagal = null
console.log("Suhu:", gagal.suhu ?? "—"); // ?? mengganti null (dan undefined) dengan "—"
console.log("Tanah:", gagal.tanah ?? "—", "bukan", gagal.tanah || "—"); // || ikut mengganti 0, padahal 0 % itu bacaan sah
console.log(gagal.gerak ? "Ada gerakan" : "Tidak ada gerakan"); // ? : memilih satu dari dua
const galat = "Tidak bisa menghubungi server";
console.log(galat && `Kotak merah: ${galat}`); // && : kalau kiri berisi, hasilnya bagian kanan
const tanpaGalat = null;
console.log(tanpaGalat && `Kotak merah: ${tanpaGalat}`); // kalau kiri null, berhenti di kiri (React tidak menggambar apa pun)

// 4. Menyalin sambil mengubah: spread ...
const keadaanLama = { kipas: false, lampu: true, pompa: false, tirai: 90 };
const keadaanBaru = { ...keadaanLama, kipas: true }; // salinan baru, satu kolom diganti
console.log(keadaanLama.kipas, keadaanBaru.kipas); // yang lama tidak berubah
console.log(keadaanLama === keadaanBaru); // false: dua objek berbeda, jadi React tahu ada yang baru
const daftarBaru = [...daftar, { device_id: "c0ba00000001", nama: null, status: "belum-diketahui" }];
console.log(daftar.length, daftarBaru.length);

// 5. Bertanya ke backend: fetch, res.ok, dan try/catch
// GET /health terbuka tanpa login. Di Node tidak ada CORS: aturan itu milik browser (Konsep 9).
try {
  const res = await fetch("http://127.0.0.1:8080/health");
  if (!res.ok) {
    console.log("Backend menjawab, tetapi dengan kode", res.status); // fetch TIDAK melempar galat untuk 404 atau 500
  } else {
    const kesehatan = await res.json();
    console.log("Backend hidup:", kesehatan.ok, "| broker:", kesehatan.broker, "| database:", kesehatan.database);
  }
} catch (err) {
  // fetch melempar galat hanya kalau server sama sekali tidak bisa dihubungi (mati atau salah alamat)
  console.log("Backend tidak bisa dihubungi. Nyalakan dulu dengan npm run dev di folder backend.");
  console.log("Rincian:", err.cause?.code ?? err.message);
}
