// isi-riwayat.ts - mengisi database dengan riwayat palsu 7 hari untuk latihan SQL (Modul 17 Praktik 4).
// Dua perangkat latihan, satu bacaan setiap 10 menit, dari pukul 00.00 WIB tujuh hari lalu sampai sekarang.
// Angkanya dibuat dari rumus + "dadu" berbenih tetap, jadi rata-rata setiap hari penuh sama di laptop siapa pun.
// Jalankan dari folder backend: npm run isi-riwayat (boleh diulang: bacaan yang sudah ada dilewati)
import { pool } from "./pool.ts";

const LANGKAH_MS = 10 * 60 * 1000; // satu bacaan setiap 10 menit
const HARI_MS = 24 * 60 * 60 * 1000;
const WIB_MS = 7 * 60 * 60 * 1000; // WIB = UTC + 7 jam
const CUACA = [0.2, -0.4, 0.5, 1.1, 0.7, -0.2, 0.3, 0.0]; // hari ke-0 (tujuh hari lalu) lebih hangat/sejuk berapa derajat

const PERANGKAT = [
  { device_id: "f00d00000001", nama: "Latihan ruang tamu", lokasi: "ruang tamu", lat: -6.2, lng: 106.8, panas: 0, kering: 1.0 },
  { device_id: "f00d00000002", nama: "Latihan teras", lokasi: "teras", lat: -6.2, lng: 106.8, panas: 1.5, kering: 1.4 },
];

// "dadu" berbenih (mulberry32): urutan angka acaknya selalu sama untuk benih yang sama
function dadu(benih: number): () => number {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const satuDesimal = (x: number) => Math.round(x * 10) / 10;

// awal hari ini menurut WIB, dinyatakan dalam milidetik UTC
const sekarang = Date.now();
const awalHariIni = Math.floor((sekarang + WIB_MS) / HARI_MS) * HARI_MS - WIB_MS;
const mulai = awalHariIni - 7 * HARI_MS;

for (const [urut, p] of PERANGKAT.entries()) {
  await pool.query(
    `INSERT INTO devices (device_id, jenis, nama, lokasi, lat, lng) VALUES ($1, 'node1', $2, $3, $4, $5)
     ON CONFLICT (device_id) DO UPDATE SET nama = $2, lokasi = $3, lat = $4, lng = $5`,
    [p.device_id, p.nama, p.lokasi, p.lat, p.lng],
  );
  const kolom = { ts: [] as string[], suhu: [] as number[], kelembapan: [] as number[], cahaya: [] as number[],
    tanah: [] as number[], gerak: [] as boolean[], level_air: [] as number[] };
  let tanah = 62;
  for (let ts = mulai; ts <= sekarang; ts += LANGKAH_MS) {
    const hariKe = Math.floor((ts - mulai) / HARI_MS); // 0 = tujuh hari lalu ... 7 = hari ini
    const menit = Math.round(((ts - mulai) % HARI_MS) / 60000); // menit sejak pukul 00.00 WIB
    const acak = dadu((urut + 1) * 100000 + hariKe * 1000 + menit / 10); // benih per perangkat, hari, dan jam
    const jam = menit / 60;
    const siang = Math.max(0, Math.sin(((jam - 6) / 12) * Math.PI)); // 0 di malam hari, 1 sekitar pukul 12.00
    const suhu = 26 + p.panas + CUACA[hariKe] + 4 * Math.sin(((jam - 9) / 24) * 2 * Math.PI) + (acak() - 0.5);
    if (menit === 6 * 60 || menit === 18 * 60) tanah = 68; // disiram otomatis pukul 06.00 dan 18.00 WIB
    else tanah -= (0.15 + 0.35 * siang) * p.kering * (0.8 + 0.4 * acak()); // makin kering, terutama siang hari
    kolom.ts.push(new Date(ts).toISOString());
    kolom.suhu.push(satuDesimal(suhu));
    kolom.kelembapan.push(Math.round(80 - 12 * siang + 4 * (acak() - 0.5)));
    kolom.cahaya.push(Math.round(3400 * siang + 60 * acak()));
    kolom.tanah.push(Math.max(0, Math.round(tanah)));
    kolom.gerak.push(acak() < (jam >= 7 && jam < 22 ? 0.3 : 0.03));
    kolom.level_air.push(Math.max(5, 90 - Math.round(menit / 30)));
  }
  // batch insert: semua kolom dikirim sebagai larik dalam SATU perintah, lalu unnest membukanya menjadi baris
  const hasil = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air)
     SELECT $1, ts, '1.4.0', suhu, kelembapan, cahaya, tanah, gerak, level_air
     FROM unnest($2::timestamptz[], $3::float8[], $4::int[], $5::int[], $6::int[], $7::bool[], $8::int[])
       AS b(ts, suhu, kelembapan, cahaya, tanah, gerak, level_air)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [p.device_id, kolom.ts, kolom.suhu, kolom.kelembapan, kolom.cahaya, kolom.tanah, kolom.gerak, kolom.level_air],
  );
  console.log(`${p.device_id}: ${kolom.ts.length} bacaan dikirim, ${hasil.rowCount} baru tersimpan`);
}
await pool.end();
