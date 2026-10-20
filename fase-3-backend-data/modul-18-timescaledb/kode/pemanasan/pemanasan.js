// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 18

// 1. Objek sebagai kamus
const MENIT = 60 * 1000; // satu menit dalam milidetik
const JAM = 60 * MENIT;
const HARI = 24 * JAM;
const EMBER = {
  "15m": { lebar: 15 * MENIT, bawaan: HARI },
  "1h": { lebar: JAM, bawaan: 7 * HARI },
};
const pilihan = "1h"; // misalnya dari ?bucket=1h
console.log(EMBER[pilihan].lebar); // 3600000 milidetik = 1 jam
console.log(EMBER[pilihan].bawaan / JAM); // rentang bawaan dalam jam
console.log(EMBER["2h"]); // kunci yang tidak ada
console.log("2h" in EMBER, Object.keys(EMBER));

// 2. Membulatkan ke bawah ke awal ember
const waktu = new Date("2026-10-20T10:37:00+07:00"); // pukul 10.37 WIB
const lebar = EMBER["15m"].lebar;
const awalEmber = new Date(Math.floor(waktu.getTime() / lebar) * lebar);
console.log(awalEmber.toISOString()); // 10.30 WIB, ditulis dalam UTC

// 3. Berapa banyak ember dalam satu rentang?
const dari = new Date("2026-10-13T00:00:00+07:00");
const sampai = new Date("2026-10-20T00:00:00+07:00");
console.log((sampai.getTime() - dari.getTime()) / JAM); // tepat 168 jam
const bawaanSore = new Date("2026-10-20T14:20:00+07:00");
console.log(Math.ceil((bawaanSore.getTime() - dari.getTime()) / JAM)); // ember terakhir belum penuh tetap dihitung

// 4. Hari WIB: geser 7 jam dulu
const GESER = 7 * JAM; // WIB = UTC + 7 jam
const subuh = new Date("2026-10-20T05:00:00+07:00"); // pukul 05.00 WIB
const hariUtc = new Date(Math.floor(subuh.getTime() / HARI) * HARI);
const hariWib = new Date(Math.floor((subuh.getTime() + GESER) / HARI) * HARI - GESER);
console.log(hariUtc.toISOString()); // awal hari UTC
console.log(hariWib.toISOString()); // awal hari WIB, ditulis dalam UTC

// 5. Angka yang datang sebagai teks
const baris = [
  { waktu: new Date("2026-10-19T03:00:00Z"), suhu_rata: "26.31", jumlah: "6" }, // numeric dan bigint dari pg = teks
];
console.log(baris[0].suhu_rata + 1); // teks + angka = teks
const rapi = baris.map((b) => ({
  waktu: b.waktu.toISOString().slice(0, 19) + "Z",
  suhu_rata: Number(b.suhu_rata),
  jumlah: Number(b.jumlah),
}));
console.log(rapi);
console.log(rapi[0].suhu_rata + 1);
