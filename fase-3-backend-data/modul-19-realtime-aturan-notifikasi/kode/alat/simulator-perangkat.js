// simulator-perangkat.js — sepuluh "Node 1" palsu yang berbicara MQTT persis menurut kontrak data (Lampiran A).
// Modul 16 - Praktik 7. Gunanya: mengembangkan dan menguji backend tanpa hardware dan tanpa Wokwi.
// Modul 19 (kontrak 1.3): telemetry membawa state (keadaan aktuator) dan dikirim segera saat aktuator berubah; perintah
// config disimpan ke data/arsip-simulator.json (pengganti NVS); suhu bisa diatur dari terminal; mode offline setelah
// broker tak terjangkau 2 menit, dengan kipas pengaman berhisteresis; laporan mode offline di vitals pertama setelah
// tersambung lagi (ditunda 10 detik).
//
// Cara pakai (dari terminal, di folder alat):
//   node simulator-perangkat.js mqtt://192.168.1.37:1883            -> 10 perangkat palsu
//   node simulator-perangkat.js mqtt://192.168.1.37:1883 1          -> 1 perangkat palsu (paling mudah diamati)
//   node simulator-perangkat.js mqtt://192.168.1.37:1883 bersihkan  -> hapus status dan config retained perangkat palsu
// Selagi berjalan, ketik di terminal yang sama lalu tekan Enter (Modul 19):
//   suhu 33    -> semua perangkat palsu membaca 33.0 °C, seperti menggeser DHT22 di Wokwi (pakai titik: suhu 29.5)
//   suhu acak  -> kembali ke suhu acak 25,0-33,0 °C
// Hentikan dengan Ctrl+C: broker lalu menerbitkan wasiat "offline" setiap perangkat palsu.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import mqtt from "mqtt";
import { buatTelemetri } from "./generate-dummy.js";

const ALAMAT_BROKER = process.argv[2] || "mqtt://127.0.0.1:1883";
const JUMLAH = Number(process.argv[3]) || 10;
const BATAS_MODE_OFFLINE = 2 * 60 * 1000; // Modul 19: broker tak terjangkau 2 menit = mode offline (kontrak aturan 5)
const SELISIH_KIPAS = 2; // Modul 19: kipas pengaman padam di bawah suhu_kipas_on - 2 (histeresis Modul 13)
const BERKAS_ARSIP = "data/arsip-simulator.json"; // Modul 19: pengganti NVS; folder data/ diabaikan Git (.gitignore)

// device_id palsu: 12 digit heksadesimal huruf kecil, diawali f00d supaya mudah dikenali
function buatDeviceId(nomor) {
  return "f00d" + String(nomor).padStart(8, "0");
}

// waktu UTC tanpa milidetik, seperti ts di kontrak data: 2026-10-19T04:14:28Z
function waktuSekarang() {
  return new Date().toISOString().slice(0, 19) + "Z";
}

// Modul 19: "NVS" semua perangkat palsu, misalnya { "f00d00000001": { "suhu_kipas_on": 31, "tanah_siram": 35 } }
let arsip = {};
try {
  arsip = JSON.parse(readFileSync(BERKAS_ARSIP, "utf8"));
} catch {
  arsip = {}; // berkas belum ada: semua perangkat memakai angka bawaan
}

function simpanArsip() {
  mkdirSync("data", { recursive: true });
  writeFileSync(BERKAS_ARSIP, JSON.stringify(arsip, null, 2));
}

let suhuDiketik = null; // Modul 19: null = suhu acak; angka = diketik di terminal ("suhu 33")

// Modul 19: sama dengan pemeriksaan config di firmware v1.5.0. Jawabannya "" kalau sah, atau alasan penolakannya.
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

function jalankanPerangkat(deviceId) {
  const topik = (jenis) => `rpm/${deviceId}/${jenis}`;
  const mulai = Date.now();
  const keadaan = { kipas: false, lampu: false, pompa: false, tirai: 90 };
  const idTerakhir = []; // id perintah yang sudah dikerjakan (kontrak aturan 8)
  // Modul 19
  const ambang = { suhu_kipas_on: 30, tanah_siram: 30, ...arsip[deviceId] }; // angka bawaan = konfigurasi.h Node 1
  let suhu = 28.5; // bacaan suhu terakhir, dipakai telemetry dan pengaman
  let kipasMilikPengaman = false; // true kalau kipas dinyalakan pengaman (pola lampu otomatis Modul 6)
  let terakhirTersambung = Date.now();
  let offline = false;
  let mulaiOffline = 0;
  let kipasLokal = 0; // berapa kali pengaman menyalakan kipas selama mode offline ini
  let laporan = null; // { offline_s, kipas_lokal } yang menunggu ikut vitals
  let pengatur = null; // Modul 19: jadwal telemetry berikutnya
  let terakhirKirim = 0; // Modul 19: kapan telemetry terakhir diterbitkan

  const klien = mqtt.connect(ALAMAT_BROKER, {
    clientId: deviceId,
    clean: true,
    keepalive: 15,
    reconnectPeriod: 5000, // menyambung ulang paling sering setiap 5 detik (kontrak bagian 3)
    will: { topic: topik("status"), payload: "offline", qos: 1, retain: true },
  });

  // vitals: sekali setelah tersambung, lalu setiap 5 menit (kontrak bagian 2)
  function kirimVitals() {
    const vitals = {
      ts: waktuSekarang(),
      rssi: -40 - Math.floor(Math.random() * 40), // -40 sampai -79 dBm
      uptime_s: Math.floor((Date.now() - mulai) / 1000),
      heap_free: 180000 + Math.floor(Math.random() * 20000),
      ...laporan, // Modul 19 (kontrak 1.3): offline_s dan kipas_lokal, hanya di vitals pertama setelah mode offline
    };
    klien.publish(topik("vitals"), JSON.stringify(vitals));
    if (laporan) {
      console.log(`${deviceId}: laporan mode offline terkirim bersama vitals (offline_s=${laporan.offline_s}, ` +
        `kipas_lokal=${laporan.kipas_lokal})`);
    }
    laporan = null;
  }

  // telemetry setiap 10 detik (kontrak aturan 3). Modul 19: jadwal 10 detik berikutnya dihitung dari kiriman terakhir,
  // dan state (keadaan aktuator) ikut terkirim (kontrak 1.3)
  function kirimTelemetry() {
    if (klien.connected) {
      const bacaan = buatTelemetri();
      bacaan.suhu = Math.round(suhu * 10) / 10; // Modul 19: suhu yang sama dengan yang dipakai pengaman
      bacaan.state = { ...keadaan };
      klien.publish(topik("telemetry"), JSON.stringify(bacaan));
      terakhirKirim = Date.now();
    }
    jadwalkan(10000);
  }

  function jadwalkan(jeda) {
    clearTimeout(pengatur);
    pengatur = setTimeout(kirimTelemetry, jeda);
  }

  // Modul 19: keadaan aktuator berubah -> kiriman segera, paling sering setiap 2 detik (kontrak bagian 4)
  function kirimSegera() {
    jadwalkan(Math.max(0, terakhirKirim + 2000 - Date.now()));
  }

  klien.on("connect", () => {
    if (offline) { // Modul 19: tersambung lagi setelah mode offline
      offline = false;
      laporan = { offline_s: Math.round((Date.now() - mulaiOffline) / 1000), kipas_lokal: kipasLokal };
      console.log(`${deviceId}: MODE OFFLINE SELESAI setelah ${laporan.offline_s} detik; ` +
        `pengaman menyalakan kipas ${kipasLokal} kali`);
    }
    terakhirTersambung = Date.now();
    klien.publish(topik("status"), "online", { qos: 1, retain: true });
    klien.subscribe(topik("cmd"), { qos: 1 });
    // Modul 19: laporan mode offline ditunda 10 detik. Backend yang ikut menyambung ulang (misalnya karena broker baru
    // dinyalakan lagi) butuh beberapa detik untuk berlangganan; tanpa jeda ini laporannya bisa terlewat.
    if (laporan) setTimeout(() => { if (klien.connected) kirimVitals(); }, 10000);
    else kirimVitals();
    console.log(`${deviceId}: online`);
  });
  klien.on("offline", () => console.log(`${deviceId}: broker tak terjangkau, mencoba lagi setiap 5 detik`)); // Modul 19
  setInterval(() => {
    if (klien.connected) kirimVitals();
  }, 5 * 60 * 1000);

  klien.on("message", (_topik, isi) => {
    if (isi.length === 0) return; // Modul 19: pesan kosong = config retained dihapus dari broker, bukan perintah
    let cmd;
    try {
      cmd = JSON.parse(isi.toString());
    } catch {
      return; // bukan JSON: tidak bisa dijawab (kontrak aturan 4)
    }
    if (typeof cmd.id !== "string" || cmd.id.length > 39) return;
    if (idTerakhir.includes(cmd.id)) return; // id yang sama hanya dikerjakan sekali (config retained yang datang lagi)
    idTerakhir.push(cmd.id);
    if (idTerakhir.length > 8) idTerakhir.shift();

    const sebelum = JSON.stringify(keadaan); // Modul 19: untuk tahu apakah ada aktuator yang berubah
    let pesan = "";
    if (cmd.aksi === "config") { // Modul 19: semua ambang dicek dulu, baru disimpan
      pesan = periksaAmbang(cmd.ambang);
      if (pesan === "") {
        const baru = { ...ambang, ...cmd.ambang };
        if (JSON.stringify(baru) !== JSON.stringify(ambang)) { // seperti NVS: tulis hanya kalau berubah
          Object.assign(ambang, baru);
          arsip[deviceId] = { ...ambang };
          simpanArsip();
          console.log(`${deviceId}: ambang disimpan ${JSON.stringify(ambang)}`);
        } else {
          console.log(`${deviceId}: ambang sama dengan yang tersimpan ${JSON.stringify(ambang)}`);
        }
      }
    } else if (cmd.aksi !== "set") pesan = `aksi ${cmd.aksi} belum didukung`;
    else if (cmd.target === "lampu" || cmd.target === "kipas") {
      if (typeof cmd.nilai === "boolean") {
        keadaan[cmd.target] = cmd.nilai;
        if (cmd.target === "kipas") kipasMilikPengaman = false; // Modul 19: kipas pindah tangan ke pengirim perintah
      } else pesan = `nilai ${cmd.target} harus true atau false`;
    } else if (cmd.target === "pompa") {
      if (Number.isInteger(cmd.nilai) && cmd.nilai >= 1 && cmd.nilai <= 10) {
        keadaan.pompa = true;
        setTimeout(() => {
          keadaan.pompa = false;
          kirimSegera(); // Modul 19: pompa padam sendiri = keadaan aktuator berubah
        }, cmd.nilai * 1000);
      } else pesan = "nilai pompa harus 1-10 detik";
    } else if (cmd.target === "tirai") {
      if (Number.isInteger(cmd.nilai) && cmd.nilai >= 0 && cmd.nilai <= 180) keadaan.tirai = cmd.nilai;
      else pesan = "nilai tirai harus 0-180 derajat";
    } else pesan = `target ${cmd.target} tidak dikenal`;

    const ack = { id: cmd.id, ts: waktuSekarang(), ok: pesan === "", state: { ...keadaan } };
    if (pesan !== "") ack.pesan = pesan;
    klien.publish(topik("ack"), JSON.stringify(ack));
    console.log(`${deviceId}: perintah ${cmd.id} -> ok=${ack.ok}`);
    if (JSON.stringify(keadaan) !== sebelum) kirimSegera(); // Modul 19
  });

  // Modul 19: setiap 2 detik, seperti langkah BERTINDAK Node 1: ambil bacaan suhu, periksa mode offline, jalankan pengaman.
  setInterval(() => {
    suhu = suhuDiketik ?? buatTelemetri().suhu;
    if (klien.connected) {
      terakhirTersambung = Date.now();
    } else if (!offline && Date.now() - terakhirTersambung >= BATAS_MODE_OFFLINE) {
      offline = true;
      mulaiOffline = Date.now();
      kipasLokal = 0;
      console.log(`${deviceId}: MODE OFFLINE: broker tak terjangkau 2 menit; pengaman menyalakan kipas di atas ` +
        `${ambang.suhu_kipas_on} °C`);
    }
    if (offline && !keadaan.kipas && suhu > ambang.suhu_kipas_on) {
      keadaan.kipas = true;
      kipasMilikPengaman = true;
      kipasLokal++;
      console.log(`${deviceId}: pengaman lokal: suhu ${suhu.toFixed(1)} °C, kipas dinyalakan`);
      kirimSegera();
    } else if (kipasMilikPengaman && suhu < ambang.suhu_kipas_on - SELISIH_KIPAS) {
      keadaan.kipas = false;
      kipasMilikPengaman = false;
      console.log(`${deviceId}: pengaman lokal: suhu ${suhu.toFixed(1)} °C, kipas dipadamkan`);
      kirimSegera();
    }
  }, 2000);

  jadwalkan(Math.random() * 10000); // kiriman pertama pada detik acak supaya perangkat palsu tidak serentak
}

// bersihkan: terbitkan pesan kosong ber-retain ke topik status dan cmd setiap perangkat palsu, supaya broker melupakan
// status "offline" dan config mereka (cara menghapus pesan retained, Modul 11), lalu selesai.
// Dulu menjalankan lebih dari 10 perangkat? Tambahkan jumlahnya: ... bersihkan 20
async function bersihkan(jumlah) {
  try {
    const klien = await mqtt.connectAsync(ALAMAT_BROKER);
    for (let i = 1; i <= jumlah; i++) {
      await klien.publishAsync(`rpm/${buatDeviceId(i)}/status`, "", { qos: 1, retain: true });
      await klien.publishAsync(`rpm/${buatDeviceId(i)}/cmd`, "", { qos: 1, retain: true }); // Modul 19: config
    }
    await klien.endAsync();
    console.log(`Status dan config ${jumlah} perangkat palsu sudah dihapus dari broker.`);
  } catch (galat) {
    console.log(`Gagal menyambung ke ${ALAMAT_BROKER}: ${galat.message}`);
  }
}

if (process.argv[3] === "bersihkan") {
  await bersihkan(Number(process.argv[4]) || 10);
} else {
  for (let i = 1; i <= JUMLAH; i++) {
    jalankanPerangkat(buatDeviceId(i));
  }
  // Modul 19: "suhu 33" / "suhu acak" diketik di terminal ini. Hanya di mode ini: di mode bersihkan, pendengar terminal
  // akan membuat program tidak selesai sendiri.
  createInterface({ input: process.stdin }).on("line", (baris) => {
    const [kata, isian] = baris.trim().toLowerCase().split(/\s+/);
    const angka = Number(isian);
    if (kata === "suhu" && isian === "acak") {
      suhuDiketik = null;
    } else if (kata === "suhu" && isian !== undefined && Number.isFinite(angka)) {
      suhuDiketik = angka;
    } else {
      console.log("Ketik misalnya: suhu 33  atau  suhu acak");
      return;
    }
    console.log(suhuDiketik === null ? "Suhu: acak 25,0-33,0 °C" : `Suhu: ${suhuDiketik.toFixed(1)} °C`);
  });
  console.log(`${JUMLAH} perangkat palsu menuju ${ALAMAT_BROKER}. Ketik "suhu 33" atau "suhu acak". Hentikan dengan Ctrl+C.`);
}
