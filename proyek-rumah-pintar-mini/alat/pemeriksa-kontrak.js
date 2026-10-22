// pemeriksa-kontrak.js — memeriksa setiap pesan MQTT proyek terhadap kontrak data
// (Lampiran A Silabus dan KONTRAK-DATA.md). Modul 11 - Praktik 8. Dipakai lagi di modul-modul berikutnya.
// Versi 1.1 (Modul 14): telemetry Node 2, yang diterbitkan Node 1 atas nama Node 2, diperiksa dengan kolomnya sendiri.
// Versi 1.2 (Modul 15): telemetry Node 1 boleh membawa tiga kolom sensor RS-485 (tanah_rs485, suhu_tanah, ec).
// Versi 1.3 (Modul 19): telemetry Node 1 membawa state (keadaan aktuator, sama dengan ack.state); vitals boleh membawa
// laporan mode offline (offline_s dan kipas_lokal, selalu bersama); isi config diperiksa; perintah set yang tertempel
// (retained) di broker ditandai GAGAL; pesan kosong di cmd = pesan retained baru saja dihapus.
// Butuh library mqtt:  npm install mqtt@5.16.1
// Versi 1.4 (Modul 21): broker berkunci butuh akun "hanya membaca" di alat/.env (PENGGUNA_PEMERIKSA, KUNCI_PEMERIKSA), jadi
// jalankan dengan node --env-file=.env (broker publik tanpa kunci: cukup seperti biasa); alamat boleh membawa port.
// Jalankan:  node --env-file=.env pemeriksa-kontrak.js                (broker di laptop ini)
//            node --env-file=.env pemeriksa-kontrak.js 192.168.1.10   (broker di komputer lain)
//            node --env-file=.env pemeriksa-kontrak.js 127.0.0.1:1884 (broker di port lain, misalnya broker latihan)
//            node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b    (broker publik: satu device_id saja)
// Berhenti: Ctrl + C

import mqtt from "mqtt";

const alamat = process.argv[2] || "127.0.0.1";
const broker = alamat.includes(":") ? alamat : `${alamat}:1883`; // Modul 21: port boleh ditulis, bawaannya 1883
const perangkat = process.argv[3]; // boleh dikosongkan: hanya pesan dari device_id ini yang diperiksa
if (perangkat !== undefined && !/^[0-9a-f]{12}$/.test(perangkat)) {
  console.log(`device_id harus 12 digit heksadesimal huruf kecil, misalnya 240ac45e114b. Isinya: ${perangkat}`);
  process.exit(1);
}
const langganan = perangkat ? `rpm/${perangkat}/#` : "rpm/#";
const JENIS = ["telemetry", "status", "vitals", "cmd", "ack"];
const KOLOM = {
  "telemetry Node 1": { // kontrak 1.2: tiga kolom sensor RS-485 hanya ada kalau sensornya dipasang; 1.3: state
    semua: ["ts", "fw", "suhu", "kelembapan", "cahaya", "tanah", "gerak", "level_air", "tanah_rs485", "suhu_tanah", "ec",
      "state"],
    wajib: ["ts", "fw", "suhu", "kelembapan", "cahaya", "tanah", "gerak", "level_air"] },
  "telemetry Node 2": { // kontrak 1.1: baterai boleh tidak ada (pembagi tegangan pilihan)
    semua: ["ts", "fw", "suhu", "kelembapan", "tekanan", "suhu_tanah", "tanah", "baterai"],
    wajib: ["ts", "fw", "suhu", "kelembapan", "tekanan", "suhu_tanah", "tanah"] },
  vitals: { semua: ["ts", "rssi", "uptime_s", "heap_free", "reset_reason", "offline_s", "kipas_lokal"],
    wajib: ["ts", "rssi", "uptime_s", "heap_free"] },
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

// Kontrak 1.3: keadaan keempat aktuator, sama di telemetry Node 1 dan di ack (KONTRAK-DATA.md bagian 4 dan 8).
function periksaState(state, masalah) {
  if (typeof state !== "object" || state === null || Array.isArray(state)) {
    masalah.push(`"state" harus berisi keadaan aktuator, misalnya {"kipas":false,"lampu":true,"pompa":false,"tirai":90}`);
    return;
  }
  for (const kolom of ["kipas", "lampu", "pompa", "tirai"]) {
    if (!(kolom in state)) masalah.push(`"state" tidak memuat "${kolom}"`);
  }
  for (const kolom of Object.keys(state)) {
    if (!["kipas", "lampu", "pompa", "tirai"].includes(kolom)) masalah.push(`"state.${kolom}" tidak ada di kontrak data`);
  }
  for (const kolom of ["kipas", "lampu", "pompa"]) {
    if (kolom in state && typeof state[kolom] !== "boolean") {
      masalah.push(`"state.${kolom}" harus true atau false, isinya ${teks(state[kolom])}`);
    }
  }
  if ("tirai" in state) periksaBulat("state.tirai", state.tirai, 0, 180, false, masalah);
}

// Kontrak 1.3: isi ambang perintah config. Jawabannya "" kalau sah, atau alasan penolakannya (sama dengan perangkat).
function periksaAmbang(ambang) {
  if (typeof ambang !== "object" || ambang === null || Array.isArray(ambang) || Object.keys(ambang).length === 0) {
    return "ambang harus berisi suhu_kipas_on atau tanah_siram";
  }
  for (const nama of Object.keys(ambang)) {
    if (nama !== "suhu_kipas_on" && nama !== "tanah_siram") return `ambang tidak dikenal: ${nama}`;
  }
  const suhu = ambang.suhu_kipas_on;
  const tanah = ambang.tanah_siram;
  if (suhu !== undefined && (typeof suhu !== "number" || suhu < 15 || suhu > 45)) {
    return "suhu_kipas_on harus angka 15-45";
  }
  if (tanah !== undefined && (!Number.isInteger(tanah) || tanah < 0 || tanah > 100)) {
    return "tanah_siram harus bilangan bulat 0-100";
  }
  return "";
}

// Kontrak 1.1: kolom sensor menurut perangkat. Telemetry Node 2 dikenali dari kolom khasnya ("tekanan"),
// karena sejak kontrak 1.2 "suhu_tanah" juga bisa datang dari sensor RS-485 Node 1.
function periksaTelemetry(isi, masalah) {
  const node2 = "tekanan" in isi || ("suhu_tanah" in isi && !("cahaya" in isi));
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
  if (!node2) {
    const rs485 = ["tanah_rs485", "suhu_tanah", "ec"].filter((k) => k in isi);
    if (rs485.length > 0 && rs485.length < 3) { // kontrak 1.2: ketiganya selalu bersama
      masalah.push(`kolom sensor RS-485 harus lengkap (tanah_rs485, suhu_tanah, ec), yang ada hanya ${rs485.join(", ")}`);
    }
    if (ada("tanah_rs485")) periksaDesimal("tanah_rs485", isi.tanah_rs485, 0, 100, masalah);
    if (ada("ec")) periksaBulat("ec", isi.ec, 0, 20000, true, masalah);
    if (ada("state")) periksaState(isi.state, masalah); // kontrak 1.3
  }
  return node2 ? "  (telemetry Node 2)" : "";
}

// Menjawab catatan tambahan kalau vitals membawa laporan mode offline (kontrak 1.3).
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
  const laporan = ["offline_s", "kipas_lokal"].filter((k) => k in isi); // kontrak 1.3: keduanya selalu bersama
  if (laporan.length === 1) {
    masalah.push(`laporan mode offline harus lengkap (offline_s, kipas_lokal), yang ada hanya ${laporan[0]}`);
  }
  if (ada("offline_s")) periksaBulat("offline_s", isi.offline_s, 0, 4294967295, false, masalah);
  if (ada("kipas_lokal")) periksaBulat("kipas_lokal", isi.kipas_lokal, 0, 65535, false, masalah);
  return laporan.length === 2 ? `  (laporan mode offline: ${isi.offline_s} detik, kipas ${isi.kipas_lokal} kali)` : "";
}

// id perintah: teks 1 sampai 39 huruf (id yang lebih panjang diabaikan perangkat).
function idSah(id) {
  return typeof id === "string" && id.length >= 1 && id.length <= 39;
}

function periksaCmd(isi, masalah, retained) {
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
    if (retained) { // kontrak 1.3: hanya config yang boleh tertempel di broker
      masalah.push("perintah set tertempel (retained) di broker: hapus dengan Clear Retained Message (kontrak bagian 7)");
    }
  }
  if (isi.aksi === "config") { // kontrak 1.3
    const alasan = periksaAmbang(isi.ambang);
    if (alasan !== "") masalah.push(alasan);
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
  if (ada("state")) periksaState(isi.state, masalah); // kontrak 1.3: isi state ikut diperiksa
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
  } else if (bagian[2] === "cmd" && isiTeks === "") { // kontrak 1.3: bukan pelanggaran
    catatan += "  (pesan kosong: cmd retained baru saja dihapus)";
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
      if (bagian[2] === "vitals") catatan += periksaVitals(isi, masalah);
      if (bagian[2] === "cmd") periksaCmd(isi, masalah, retained);
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

const klien = mqtt.connect(`mqtt://${broker}`, {
  clientId: "pemeriksa-" + Math.random().toString(16).slice(2, 8), // nama unik, tidak bertabrakan
  username: process.env.PENGGUNA_PEMERIKSA, // Modul 21: akun "hanya membaca" dari alat/.env (kosong = tanpa akun)
  password: process.env.KUNCI_PEMERIKSA,
  connectTimeout: 5000,
  reconnectPeriod: 0, // tidak mencoba lagi sendiri: jalankan ulang setelah broker menyala
});
let pernahTersambung = false; // galat sesudah tersambung berarti sambungan putus di tengah jalan
klien.on("error", (galat) => {
  const sebab = galat.code || galat.message;
  if ([4, 5, 134, 135].includes(galat.code)) { // Modul 21: broker berkunci menolak akun pemeriksa
    console.log(`Broker ${broker} menolak akun pemeriksa (kode ${galat.code}). Isi PENGGUNA_PEMERIKSA dan ` +
      "KUNCI_PEMERIKSA di alat/.env, lalu jalankan dengan: node --env-file=.env pemeriksa-kontrak.js …");
  } else if (pernahTersambung) {
    console.log(`\nSambungan ke broker ${broker} putus (${sebab}). Jalankan lagi pemeriksanya setelah broker menyala.`);
    cetakRingkasan();
  } else {
    console.log(`Tidak bisa tersambung ke broker ${broker} (${sebab}). Broker sudah menyala?`);
  }
  process.exit(1);
});
klien.on("connect", () => {
  pernahTersambung = true;
  console.log(`Pemeriksa kontrak siap di broker ${broker} (langganan ${langganan}) — tekan Ctrl + C untuk berhenti.`);
  klien.subscribe(langganan);
});
klien.on("message", (topik, isi, paket) => periksa(topik, isi.toString(), paket.retain));
// Tanpa pendengar ini, alat diam saja kalau broker dimatikan di tengah jalan (reconnectPeriod: 0).
// Modul 21: broker berkunci memakai nama akun sebagai nama klien, jadi pemeriksa kedua dengan akun yang sama menendang yang
// pertama (satu akun = satu sambungan).
klien.on("close", () => {
  console.log(`\nSambungan ke broker ${broker} putus: broker dimatikan, atau akun pemeriksa yang sama dipakai program lain ` +
    "(satu akun = satu sambungan). Jalankan lagi pemeriksanya.");
  cetakRingkasan();
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("");
  cetakRingkasan();
  process.exit(0);
});
