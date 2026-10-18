// pemeriksa-kontrak.js — memeriksa setiap pesan MQTT proyek terhadap kontrak data
// (Lampiran A Silabus dan KONTRAK-DATA.md). Modul 11 - Praktik 8. Dipakai lagi di modul-modul berikutnya.
// Versi 1.1 (Modul 14): telemetry Node 2, yang diterbitkan Node 1 atas nama Node 2, diperiksa dengan kolomnya sendiri.
// Butuh library mqtt:  npm install mqtt@5.16.1
// Jalankan:  node pemeriksa-kontrak.js                               (broker di laptop ini)
//            node pemeriksa-kontrak.js 192.168.1.10                  (broker di komputer lain)
//            node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b   (broker publik: satu device_id saja)
// Berhenti: Ctrl + C

import mqtt from "mqtt";

const alamat = process.argv[2] || "127.0.0.1";
const perangkat = process.argv[3]; // boleh dikosongkan: hanya pesan dari device_id ini yang diperiksa
if (perangkat !== undefined && !/^[0-9a-f]{12}$/.test(perangkat)) {
  console.log(`device_id harus 12 digit heksadesimal huruf kecil, misalnya 240ac45e114b. Isinya: ${perangkat}`);
  process.exit(1);
}
const langganan = perangkat ? `rpm/${perangkat}/#` : "rpm/#";
const JENIS = ["telemetry", "status", "vitals", "cmd", "ack"];
const KOLOM = {
  "telemetry Node 1": { semua: ["ts", "fw", "suhu", "kelembapan", "cahaya", "tanah", "gerak", "level_air"] },
  "telemetry Node 2": { // kontrak 1.1: baterai boleh tidak ada (pembagi tegangan pilihan)
    semua: ["ts", "fw", "suhu", "kelembapan", "tekanan", "suhu_tanah", "tanah", "baterai"],
    wajib: ["ts", "fw", "suhu", "kelembapan", "tekanan", "suhu_tanah", "tanah"] },
  vitals: { semua: ["ts", "rssi", "uptime_s", "heap_free", "reset_reason"], wajib: ["ts", "rssi", "uptime_s", "heap_free"] },
  cmd: { semua: ["id", "ts", "aksi", "target", "nilai", "ambang", "url", "versi"], wajib: ["id", "aksi"] },
  ack: { semua: ["id", "ts", "ok", "pesan", "state"], wajib: ["id", "ts", "ok", "state"] },
};
const ALASAN_RESET = ["POWERON", "BROWNOUT", "SW", "PANIC", "WDT", "DEEPSLEEP", "UNKNOWN"];
const NILAI_SET = { // nilai yang sah untuk setiap target perintah "set" (KONTRAK-DATA.md bagian 7)
  lampu: [(n) => typeof n === "boolean", "true atau false"],
  kipas: [(n) => typeof n === "boolean", "true atau false"],
  pompa: [(n) => Number.isInteger(n) && n >= 1 && n <= 10, "bilangan bulat 1 sampai 10 (detik)"],
  tirai: [(n) => Number.isInteger(n) && n >= 0 && n <= 180, "bilangan bulat 0 sampai 180 (derajat)"],
};
const perintahTerlihat = new Map(); // id perintah -> waktu terlihat (ms)
const hitung = { lulus: 0, gagal: 0 };

const jam = () => new Date().toLocaleTimeString("id-ID");
const cetakRingkasan = () => console.log(`Ringkasan: ${hitung.lulus} pesan LULUS, ${hitung.gagal} pesan GAGAL.`);
const teks = (x) => (x === undefined ? "(kosong)" : JSON.stringify(x));

// Kolom wajib harus ada, dan tidak boleh ada kolom di luar kontrak. Menjawab daftar kolom yang ada.
function periksaKolom(isi, jenis, masalah) {
  const { semua, wajib = semua } = KOLOM[jenis];
  for (const kolom of wajib) {
    if (!(kolom in isi)) {
      masalah.push(`kolom "${kolom}" tidak ada`);
    }
  }
  for (const kolom of Object.keys(isi)) {
    if (!semua.includes(kolom)) {
      masalah.push(`kolom "${kolom}" tidak ada di kontrak data`);
    }
  }
  return (kolom) => kolom in isi; // dipakai untuk memeriksa isi kolom yang memang ada saja
}

// Cap waktu ts: UTC ISO-8601 seperti 2026-10-18T01:30:12Z, tidak lebih dari 5 menit di depan jam laptop.
function periksaTs(ts, masalah) {
  if (typeof ts !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(ts)) {
    masalah.push(`"ts" harus berbentuk 2026-10-18T01:30:12Z (UTC), isinya ${teks(ts)}`);
  } else if (Number.isNaN(Date.parse(ts)) || new Date(ts).getUTCFullYear() < 2025) {
    masalah.push(`"ts" bukan tanggal yang masuk akal: ${ts} (jam perangkat sudah disetel?)`);
  } else if (Date.parse(ts) - Date.now() > 5 * 60 * 1000) {
    masalah.push(`"ts" lebih dari 5 menit di depan jam laptop: ${ts}`);
  }
}

// Bilangan bulat dalam rentang tertentu; bolehNull = bacaan gagal boleh ditulis null.
function periksaBulat(nama, nilai, palingKecil, palingBesar, bolehNull, masalah) {
  if (nilai === null && bolehNull) {
    return;
  }
  if (!Number.isInteger(nilai) || nilai < palingKecil || nilai > palingBesar) {
    const atauNull = bolehNull ? " atau null" : "";
    masalah.push(`"${nama}" harus bilangan bulat ${palingKecil} sampai ${palingBesar}${atauNull}, isinya ${teks(nilai)}`);
  }
}

// Angka desimal dalam rentang tertentu, atau null (bacaan gagal).
function periksaDesimal(nama, nilai, palingKecil, palingBesar, masalah) {
  if (nilai !== null && (typeof nilai !== "number" || nilai < palingKecil || nilai > palingBesar)) {
    masalah.push(`"${nama}" harus angka ${palingKecil} sampai ${palingBesar} atau null, isinya ${teks(nilai)}`);
  }
}

// Kontrak 1.1: kolom sensor menurut perangkat. Telemetry Node 2 dikenali dari kolom khasnya.
function periksaTelemetry(isi, masalah) {
  const node2 = "tekanan" in isi || "suhu_tanah" in isi;
  const ada = periksaKolom(isi, node2 ? "telemetry Node 2" : "telemetry Node 1", masalah);
  if (ada("ts")) periksaTs(isi.ts, masalah);
  if (ada("fw") && (typeof isi.fw !== "string" || !/^\d+\.\d+\.\d+$/.test(isi.fw))) {
    masalah.push(`"fw" harus versi seperti "1.2.0", isinya ${teks(isi.fw)}`);
  }
  if (ada("suhu") && isi.suhu !== null && (typeof isi.suhu !== "number" || isi.suhu < -40 || isi.suhu > 80)) {
    masalah.push(`"suhu" harus angka -40 sampai 80 atau null, isinya ${teks(isi.suhu)}`);
  }
  if (ada("kelembapan")) periksaBulat("kelembapan", isi.kelembapan, 0, 100, true, masalah);
  if (ada("cahaya")) periksaBulat("cahaya", isi.cahaya, 0, 4095, false, masalah);
  if (ada("tanah")) periksaBulat("tanah", isi.tanah, 0, 100, node2, masalah); // null hanya untuk Node 2
  if (ada("gerak") && typeof isi.gerak !== "boolean") {
    masalah.push(`"gerak" harus true atau false, isinya ${teks(isi.gerak)}`);
  }
  if (ada("level_air")) periksaBulat("level_air", isi.level_air, 0, 100, true, masalah);
  if (ada("tekanan")) periksaDesimal("tekanan", isi.tekanan, 300, 1100, masalah);
  if (ada("suhu_tanah")) periksaDesimal("suhu_tanah", isi.suhu_tanah, -55, 125, masalah);
  if (ada("baterai")) periksaDesimal("baterai", isi.baterai, 2.5, 4.5, masalah);
  return node2 ? "  (telemetry Node 2)" : "";
}

function periksaVitals(isi, masalah) {
  const ada = periksaKolom(isi, "vitals", masalah);
  if (ada("ts")) periksaTs(isi.ts, masalah);
  if (ada("rssi")) periksaBulat("rssi", isi.rssi, -120, 0, false, masalah);
  if (ada("uptime_s") && (!Number.isInteger(isi.uptime_s) || isi.uptime_s < 0)) {
    masalah.push(`"uptime_s" harus bilangan bulat 0 atau lebih, isinya ${teks(isi.uptime_s)}`);
  }
  if (ada("heap_free") && (!Number.isInteger(isi.heap_free) || isi.heap_free <= 0)) {
    masalah.push(`"heap_free" harus bilangan bulat lebih dari 0, isinya ${teks(isi.heap_free)}`);
  }
  if (ada("reset_reason") && !ALASAN_RESET.includes(isi.reset_reason)) {
    masalah.push(`"reset_reason" harus salah satu dari ${ALASAN_RESET.join(", ")}`);
  }
}

// id perintah: teks 1 sampai 39 huruf (id yang lebih panjang diabaikan perangkat).
function idSah(id) {
  return typeof id === "string" && id.length >= 1 && id.length <= 39;
}

function periksaCmd(isi, masalah) {
  const ada = periksaKolom(isi, "cmd", masalah);
  if (ada("id") && !idSah(isi.id)) {
    masalah.push(`"id" harus teks 1 sampai 39 huruf, isinya ${teks(isi.id)}`);
  } else if (ada("id")) {
    perintahTerlihat.set(isi.id, Date.now()); // dicatat untuk mengukur lamanya ack datang
  }
  if (ada("ts")) periksaTs(isi.ts, masalah);
  if (ada("aksi") && !["set", "config", "update"].includes(isi.aksi)) {
    masalah.push(`"aksi" harus "set", "config", atau "update", isinya ${teks(isi.aksi)}`);
  }
  if (isi.aksi === "set") {
    if (!Object.hasOwn(NILAI_SET, isi.target)) {
      masalah.push(`"target" harus lampu, kipas, pompa, atau tirai, isinya ${teks(isi.target)}`);
    } else if (!NILAI_SET[isi.target][0](isi.nilai)) {
      masalah.push(`"nilai" untuk ${isi.target} harus ${NILAI_SET[isi.target][1]}, isinya ${teks(isi.nilai)}`);
    }
  }
}

// Menjawab catatan tambahan: berapa lama perangkat menjawab perintahnya.
function periksaAck(isi, masalah) {
  const ada = periksaKolom(isi, "ack", masalah);
  if (ada("id") && !idSah(isi.id)) {
    masalah.push(`"id" harus teks 1 sampai 39 huruf, isinya ${teks(isi.id)}`);
  }
  if (ada("ts") && isi.ts !== null) periksaTs(isi.ts, masalah); // null boleh: jam perangkat belum disetel
  if (ada("ok") && typeof isi.ok !== "boolean") {
    masalah.push(`"ok" harus true atau false, isinya ${teks(isi.ok)}`);
  }
  if (ada("state") && (typeof isi.state !== "object" || isi.state === null || Array.isArray(isi.state))) {
    masalah.push(`"state" harus berisi keadaan aktuator, misalnya {"lampu": true}`);
  }
  if (isi.ok === false && typeof isi.pesan !== "string") {
    masalah.push(`ack yang menolak (ok: false) wajib membawa "pesan" berisi alasannya`);
  }
  if (!perintahTerlihat.has(isi.id)) {
    return "  (perintahnya tidak terlihat oleh pemeriksa)";
  }
  const lama = Date.now() - perintahTerlihat.get(isi.id);
  const kesimpulan = lama < 1000 ? "di bawah 1 detik" : "LEBIH dari 1 detik";
  return `  (dijawab ${lama} ms setelah perintah: ${kesimpulan})`;
}

function periksa(topik, isiTeks, retained) {
  const bagian = topik.split("/");
  const masalah = [];
  let catatan = retained ? "  [retained]" : "";
  if (bagian.length !== 3 || bagian[0] !== "rpm" || !/^[0-9a-f]{12}$/.test(bagian[1]) || !JENIS.includes(bagian[2])) {
    masalah.push("topik di luar kontrak data: harus rpm/<device_id>/<telemetry|status|vitals|cmd|ack>, "
      + "dengan device_id 12 digit heksadesimal huruf kecil");
  } else if (bagian[2] === "status") {
    if (isiTeks === "") {
      catatan += "  (pesan kosong: status retained baru saja dihapus)";
    } else if (!["online", "offline", "offline-mode"].includes(isiTeks)) {
      masalah.push(`isi status harus online, offline, atau offline-mode, isinya ${teks(isiTeks)}`);
    }
  } else {
    let isi;
    try {
      isi = JSON.parse(isiTeks);
    } catch (galat) {
      masalah.push(`isinya bukan JSON yang sah: ${isiTeks.slice(0, 60)}`);
    }
    if (isi !== undefined && (typeof isi !== "object" || isi === null || Array.isArray(isi))) {
      masalah.push("isinya harus objek JSON { ... }");
    } else if (isi !== undefined) {
      if (bagian[2] === "telemetry") catatan += periksaTelemetry(isi, masalah);
      if (bagian[2] === "vitals") periksaVitals(isi, masalah);
      if (bagian[2] === "cmd") periksaCmd(isi, masalah);
      if (bagian[2] === "ack") catatan += periksaAck(isi, masalah);
    }
  }
  const lulus = masalah.length === 0;
  hitung[lulus ? "lulus" : "gagal"]++;
  console.log(`[${jam()}] ${topik}  ${lulus ? "LULUS" : "GAGAL"}${catatan}`);
  for (const m of masalah) {
    console.log(`   - ${m}`);
  }
}

const klien = mqtt.connect(`mqtt://${alamat}:1883`, {
  clientId: "pemeriksa-" + Math.random().toString(16).slice(2, 8), // nama unik, tidak bertabrakan
  connectTimeout: 5000,
  reconnectPeriod: 0, // tidak mencoba lagi sendiri: jalankan ulang setelah broker menyala
});
let pernahTersambung = false; // galat sesudah tersambung berarti sambungan putus di tengah jalan
klien.on("error", (galat) => {
  const sebab = galat.code || galat.message;
  if (pernahTersambung) {
    console.log(`\nSambungan ke broker ${alamat}:1883 putus (${sebab}). Jalankan lagi pemeriksanya setelah broker menyala.`);
    cetakRingkasan();
  } else {
    console.log(`Tidak bisa tersambung ke broker ${alamat}:1883 (${sebab}). Broker sudah menyala?`);
  }
  process.exit(1);
});
klien.on("connect", () => {
  pernahTersambung = true;
  console.log(`Pemeriksa kontrak siap di broker ${alamat}:1883 (langganan ${langganan}) — tekan Ctrl + C untuk berhenti.`);
  klien.subscribe(langganan);
});
klien.on("message", (topik, isi, paket) => periksa(topik, isi.toString(), paket.retain));
// Tanpa pendengar ini, alat diam saja kalau broker dimatikan di tengah jalan (reconnectPeriod: 0).
klien.on("close", () => {
  console.log(`\nSambungan ke broker ${alamat}:1883 putus. Jalankan lagi pemeriksanya setelah broker menyala.`);
  cetakRingkasan();
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("");
  cetakRingkasan();
  process.exit(0);
});
