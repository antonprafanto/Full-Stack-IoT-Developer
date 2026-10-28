// simulator-perangkat.js — sepuluh "Node 1" palsu yang berbicara MQTT persis menurut kontrak data (Lampiran A).
// Modul 16 - Praktik 7. Gunanya: mengembangkan dan menguji backend tanpa hardware dan tanpa Wokwi.
// Modul 19 (kontrak 1.3): telemetry membawa state (keadaan aktuator) dan dikirim segera saat aktuator berubah; perintah
// config disimpan ke data/arsip-simulator.json (pengganti NVS); suhu bisa diatur dari terminal; mode offline setelah
// broker tak terjangkau 2 menit, dengan kipas pengaman berhisteresis; laporan mode offline di vitals pertama setelah
// tersambung lagi (ditunda 10 detik).
// Modul 21: setiap perangkat palsu masuk ke broker dengan akunnya SENDIRI: nama pengguna = device_id, kuncinya dari file
// alat/.env (satu baris per perangkat, misalnya KUNCI_F00D00000001=...). Perangkat tanpa kunci tidak dijalankan. Kalau
// broker menolak kuncinya, perangkat itu mencoba lagi setiap 60 detik, seperti Node 1 v1.6.0.
// Modul 24: kelembapan tanah dan isi tandon juga bisa diatur dari terminal, dan perintah pompa ditolak kalau isi tandon di
// bawah 20 % dengan alasan yang sama persis dengan firmware Node 1 ("pompa ditolak: air tandon kurang").
// Modul 25: "Kebun tiruan" f00d000000b2, Node 2 palsu yang datanya diterbitkan perangkat palsu pertama (f00d00000001),
// persis Node 2 asli lewat Node 1: bangun setiap 300 detik, status online saat paket pertama, offline sesudah 960 detik tanpa
// paket. Butuh blok ACL "jalur laptop (Modul 25)" di edge/acl-broker (lalu restart broker) dan registrasi dengan penghubung.
//
// Cara pakai (dari terminal, di folder alat):
//   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883            -> 10 perangkat palsu
//   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 1          -> 1 perangkat palsu (paling mudah diamati)
//   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 bersihkan  -> hapus status retained perangkat palsu
// Selagi berjalan, ketik di terminal yang sama lalu tekan Enter (Modul 19):
//   suhu 33    -> semua perangkat palsu membaca 33.0 °C, seperti menggeser DHT22 di Wokwi (pakai titik: suhu 29.5)
//   suhu acak  -> kembali ke suhu acak 25,0-33,0 °C
//   tanah 25   -> Modul 24: semua perangkat palsu membaca tanah 25 % (bilangan bulat 0-100), misalnya untuk menguji aturan
//                 "siram jika tanah < 30 %". Simulator tidak membasahi tanah sesudah pompa menyala: ketik tanah 40 sendiri.
//   tanah acak -> kembali ke tanah acak 20-60 %
//   tandon 15  -> Modul 24: isi tandon 15 % (bilangan bulat 0-100); di bawah 20 %, perintah pompa ditolak seperti Node 1
//   tandon acak -> kembali ke isi tandon acak 30-90 %
//   kebun mulai  -> Modul 25: Kebun tiruan menyala (satu paket sekarang, lalu setiap 300 detik; tidak bisa dipercepat)
//   kebun cabut  -> "mencabut baterai" Kebun: paketnya berhenti, status offline baru terbit 960 detik sesudah paket terakhir
//   kebun pasang -> "memasang baterai" lagi: Kebun langsung bangun dan mengirim paket, lalu setiap 300 detik
// Hentikan dengan Ctrl+C: broker lalu menerbitkan wasiat "offline" setiap perangkat palsu. Kebun tiruan ikut diam, tetapi
// statusnya tetap "online" (Node 2 tidak punya wasiat; persis Node 2 asli saat Node 1 mati).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import mqtt from "mqtt";
import { buatTelemetri } from "./generate-dummy.js";

const ALAMAT_BROKER = process.argv[2] || "mqtt://127.0.0.1:1883";
const JUMLAH = Number(process.argv[3]) || 10;
const BATAS_MODE_OFFLINE = 2 * 60 * 1000; // Modul 19: broker tak terjangkau 2 menit = mode offline (kontrak aturan 5)
const SELISIH_KIPAS = 2; // Modul 19: kipas pengaman padam di bawah suhu_kipas_on - 2 (histeresis Modul 13)
const BERKAS_ARSIP = "data/arsip-simulator.json"; // Modul 19: pengganti NVS; folder data/ diabaikan Git (.gitignore)
const LEVEL_AIR_MINIMUM = 20; // Modul 24: sama dengan konfigurasi.h Node 1: pompa ditolak kalau isi tandon di bawah 20 %
// Modul 25: Kebun tiruan
const ID_KEBUN = "f00d000000b2"; // device_id Node 2 palsu ("b2" = Node 2), didaftarkan dengan penghubung f00d00000001
const ID_PENGHUBUNG = "f00d00000001"; // perangkat palsu pertama berperan sebagai Node 1 yang menerbitkan data Kebun
// Node 2 bangun setiap 300 detik (JEDA_DETIK di firmware Node 2). JANGAN diperpendek: alert "node diam" di Grafana
// (Modul 25) menghitung keterlambatan dari jadwal 5 menit ini.
const JEDA_KEBUN = 300 * 1000;
const BATAS_OFFLINE_KEBUN = 3 * JEDA_KEBUN + 60 * 1000; // 960 detik = 3 x jeda + 1 menit, sama dengan jembatan Node 1

// device_id palsu: 12 digit heksadesimal huruf kecil, diawali f00d supaya mudah dikenali
function buatDeviceId(nomor) {
  return "f00d" + String(nomor).padStart(8, "0");
}

// Modul 21: kunci broker satu perangkat palsu dari alat/.env, misalnya KUNCI_F00D00000001. undefined = belum diisi.
function kunciPerangkat(deviceId) {
  return process.env[`KUNCI_${deviceId.toUpperCase()}`] || undefined;
}
const KODE_DITOLAK = [4, 5, 134, 135]; // Modul 21: jawaban broker "kunci salah / tidak diizinkan" (MQTT 3.1.1 dan 5)

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
let tanahDiketik = null; // Modul 24: null = tanah acak 20-60 %; angka = diketik di terminal ("tanah 25")
let tandonDiketik = null; // Modul 24: null = isi tandon acak 30-90 %; angka = diketik di terminal ("tandon 15")

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
    username: deviceId, // Modul 21: nama pengguna broker = device_id
    password: kunciPerangkat(deviceId), // Modul 21: dari alat/.env
    clean: true,
    keepalive: 15,
    reconnectPeriod: 5000, // menyambung ulang paling sering setiap 5 detik (kontrak bagian 3)
    reconnectOnConnackError: true, // Modul 21: tanpa ini, library berhenti mencoba begitu broker menolak kuncinya
    will: { topic: topik("status"), payload: "offline", qos: 1, retain: true },
  });
  if (deviceId === ID_PENGHUBUNG) pasangPenghubungKebun(klien); // Modul 25: Kebun tiruan menumpang perangkat ini

  // Modul 21: broker menolak kunci? Tulis jelas, lalu coba lagi 60 detik kemudian saja (seperti Node 1 v1.6.0).
  klien.on("error", (galat) => {
    if (KODE_DITOLAK.includes(galat.code)) {
      klien.options.reconnectPeriod = 60000;
      console.log(`${deviceId}: DITOLAK broker (kode ${galat.code}): kunci salah, belum didaftarkan, atau sudah dicabut. ` +
        "Dicoba lagi 60 detik lagi.");
    } else {
      console.log(`${deviceId}: galat MQTT: ${galat.message}`);
    }
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
      if (tanahDiketik !== null) bacaan.tanah = tanahDiketik; // Modul 24: "tanah 25" diketik di terminal
      if (tandonDiketik !== null) bacaan.level_air = tandonDiketik; // Modul 24: "tandon 15" diketik di terminal
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
    klien.options.reconnectPeriod = 5000; // Modul 21: kunci diterima lagi: kembali ke jeda biasa
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
  klien.on("offline", () => { // Modul 19; Modul 21: tidak ditulis kalau penyebabnya kunci ditolak (pesannya sudah ada)
    if (klien.options.reconnectPeriod === 5000) console.log(`${deviceId}: broker tak terjangkau, mencoba lagi setiap 5 detik`);
  });
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
      if (!Number.isInteger(cmd.nilai) || cmd.nilai < 1 || cmd.nilai > 10) {
        pesan = "nilai pompa harus 1-10 detik";
      } else if (tandonDiketik !== null && tandonDiketik < LEVEL_AIR_MINIMUM) {
        // Modul 24: pengaman tandon, dengan urutan pemeriksaan dan teks yang sama dengan firmware Node 1 (jaringan.cpp).
        // Isi tandon acak (30-90 %) selalu cukup, jadi penolakan ini hanya muncul sesudah "tandon <di bawah 20>" diketik.
        pesan = "pompa ditolak: air tandon kurang";
        console.log(`${deviceId}: pompa DITOLAK: air tandon tinggal ${tandonDiketik} %`);
      } else {
        keadaan.pompa = true;
        setTimeout(() => {
          keadaan.pompa = false;
          kirimSegera(); // Modul 19: pompa padam sendiri = keadaan aktuator berubah
        }, cmd.nilai * 1000);
      }
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

// ---- Modul 25: Kebun tiruan (Node 2 palsu yang diterbitkan perangkat palsu pertama) ----
let penghubung = null; // klien MQTT f00d00000001: hanya akun ini yang boleh menulis topik Kebun (blok ACL Modul 25)
let kebunAda = false; // true sesudah "kebun mulai"
let bateraiKebun = false; // true = Kebun bangun setiap 300 detik; false = baterainya "dicabut"
let pengaturKebun = null; // jadwal bangun berikutnya (seperti deep sleep 300 detik)
let paketKebunTerakhir = 0; // kapan paket terakhir Kebun diterbitkan (Date.now()); 0 = belum pernah
let statusKebun = null; // status Kebun yang terakhir diterbitkan penghubung: "online", "offline", atau null (belum pernah)
const jamWib = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit",
  second: "2-digit" });
const pukul = (waktu) => `${jamWib.format(waktu)} WIB`; // misalnya 21.03.02 WIB, sama dengan jam di pesan Telegram backend
const acakBulat = (min, maks) => min + Math.floor(Math.random() * (maks - min + 1));
const acakSatuDesimal = (min, maks) => Math.round((min + Math.random() * (maks - min)) * 10) / 10;

// Dipanggil jalankanPerangkat() untuk f00d00000001. Seperti Node 1 asli, setiap kali tersambung (lagi) ke broker,
// penghubung menerbitkan ulang status Kebun yang terakhir diketahuinya.
function pasangPenghubungKebun(klien) {
  penghubung = klien;
  klien.on("connect", () => {
    if (statusKebun !== null) klien.publish(`rpm/${ID_KEBUN}/status`, statusKebun, { qos: 1, retain: true });
  });
}

function terbitkanStatusKebun(status) {
  statusKebun = status;
  // retained, seperti Node 1 asli. Belum tersambung? Diterbitkan saat penghubung tersambung lagi (lihat di atas).
  if (penghubung.connected) penghubung.publish(`rpm/${ID_KEBUN}/status`, status, { qos: 1, retain: true });
}

// Kebun bangun: satu paket telemetry Node 2 (kontrak 1.1), lalu "tidur" 300 detik. ts dibuat penghubung saat itu juga,
// karena Node 2 tidak punya jam yang bisa dipercaya (kontrak aturan 1). Tanpa vitals: Node 2 tidak mengirimnya.
function bangunKebun() {
  pengaturKebun = setTimeout(bangunKebun, JEDA_KEBUN);
  if (!penghubung.connected) {
    // Node 1 asli menyimpan paket di rak sampai broker terjangkau lagi; simulator ini cukup melewatkannya
    console.log(`${ID_KEBUN}: Kebun bangun, tetapi ${ID_PENGHUBUNG} tidak tersambung ke broker: paketnya hilang`);
    return;
  }
  const paket = {
    ts: waktuSekarang(),
    fw: "1.0.0", // versi firmware NODE 2 (dibawa paketnya), bukan versi Node 1
    suhu: acakSatuDesimal(26, 30),
    kelembapan: acakBulat(60, 79),
    tekanan: acakSatuDesimal(1008, 1012), // hPa; kolom khas Node 2: backend mengenali telemetry Node 2 dari kolom ini
    suhu_tanah: acakSatuDesimal(25, 27),
    tanah: acakBulat(35, 44),
    // tanpa kolom baterai: kolom pilihan, Node 2 bawaan tidak mengukurnya (ADA_PEMBAGI_BATERAI = false)
  };
  penghubung.publish(`rpm/${ID_KEBUN}/telemetry`, JSON.stringify(paket));
  paketKebunTerakhir = Date.now();
  console.log(`${ID_KEBUN}: Kebun bangun pukul ${pukul(paketKebunTerakhir)}, paketnya diterbitkan ${ID_PENGHUBUNG}`);
  if (statusKebun !== "online") terbitkanStatusKebun("online"); // paket pertama (atau pertama sesudah offline): online
}

// Jembatan Node 1: tidak ada paket Kebun selama 960 detik -> status offline. Diperiksa setiap detik.
function periksaKebun() {
  if (statusKebun === "online" && Date.now() - paketKebunTerakhir >= BATAS_OFFLINE_KEBUN) {
    terbitkanStatusKebun("offline");
    console.log(`${ID_KEBUN}: tidak ada paket Kebun selama ${BATAS_OFFLINE_KEBUN / 1000} detik: ${ID_PENGHUBUNG} ` +
      `menerbitkan status offline pukul ${pukul(Date.now())}`);
  }
}

// ketikan "kebun mulai", "kebun cabut", dan "kebun pasang"
function ketikKebun(perintah) {
  if (penghubung === null) {
    console.log(`Kebun tiruan butuh perangkat palsu ${ID_PENGHUBUNG} sebagai penghubungnya: ` +
      `isi KUNCI_${ID_PENGHUBUNG.toUpperCase()} di alat/.env, lalu jalankan simulator lagi`);
  } else if (perintah === "mulai") {
    if (kebunAda) {
      console.log("Kebun tiruan sudah berjalan. Ketik \"kebun cabut\" atau \"kebun pasang\".");
      return;
    }
    kebunAda = true;
    bateraiKebun = true;
    setInterval(periksaKebun, 1000);
    console.log(`Kebun tiruan ${ID_KEBUN} menyala lewat ${ID_PENGHUBUNG}: satu paket sekarang, lalu setiap 300 detik.`);
    bangunKebun();
  } else if (!kebunAda) {
    console.log("Kebun tiruan belum berjalan: ketik \"kebun mulai\" dulu.");
  } else if (perintah === "cabut") {
    if (!bateraiKebun) {
      console.log("Baterai Kebun sudah dicabut. Ketik \"kebun pasang\" untuk memasangnya lagi.");
      return;
    }
    bateraiKebun = false;
    clearTimeout(pengaturKebun);
    console.log(`Baterai Kebun DICABUT pukul ${pukul(Date.now())}.` + (paketKebunTerakhir === 0 ? "" : ` Paket terakhirnya ` +
      `pukul ${pukul(paketKebunTerakhir)}; status offline baru terbit sekitar pukul ` +
      `${pukul(paketKebunTerakhir + BATAS_OFFLINE_KEBUN)} (960 detik sesudah paket terakhir).`));
  } else if (perintah === "pasang") {
    if (bateraiKebun) {
      console.log("Baterai Kebun masih terpasang.");
      return;
    }
    bateraiKebun = true;
    console.log(`Baterai Kebun dipasang lagi pukul ${pukul(Date.now())}: Kebun langsung bangun, lalu setiap 300 detik.`);
    bangunKebun();
  }
}

// bersihkan: terbitkan pesan kosong ber-retain ke topik status setiap perangkat palsu, supaya broker melupakan status
// "offline" mereka (cara menghapus pesan retained, Modul 11), lalu selesai. Modul 21: setiap perangkat masuk dengan akunnya
// sendiri, dan daftar izin broker hanya membolehkan perangkat MENULIS topiknya sendiri (status, telemetry, vitals, ack),
// bukan cmd-nya. config retained di cmd tidak lagi dihapus di sini: hanya akun backend dan nodered yang boleh menulis cmd,
// dan config itu tidak berbahaya (hanya perangkat itu sendiri yang boleh membacanya).
// Dulu menjalankan lebih dari 10 perangkat? Tambahkan jumlahnya: ... bersihkan 20
async function bersihkan(jumlah) {
  let adaKunci = 0;
  for (let i = 1; i <= jumlah; i++) {
    const deviceId = buatDeviceId(i);
    if (!kunciPerangkat(deviceId)) continue; // tanpa kunci: tidak bisa masuk, lewati
    adaKunci++;
    try {
      const klien = await mqtt.connectAsync(ALAMAT_BROKER, { clientId: deviceId, username: deviceId,
        password: kunciPerangkat(deviceId), reconnectPeriod: 0 });
      await klien.publishAsync(`rpm/${deviceId}/status`, "", { qos: 1, retain: true });
      if (deviceId === ID_PENGHUBUNG) { // Modul 25: status Kebun tiruan, lewat penghubungnya
        await klien.publishAsync(`rpm/${ID_KEBUN}/status`, "", { qos: 1, retain: true });
        console.log(`${ID_KEBUN}: status retained Kebun tiruan juga dihapus (hanya berlaku kalau blok ACL Modul 25 terpasang).`);
      }
      await klien.endAsync();
      console.log(`${deviceId}: status retained dihapus dari broker.`);
    } catch (galat) {
      console.log(`${deviceId}: gagal menyambung ke ${ALAMAT_BROKER}: ${galat.message}`);
    }
  }
  if (adaKunci === 0) console.log("Tidak ada perangkat palsu yang punya kunci di alat/.env: tidak ada yang dibersihkan.");
}

if (process.argv[3] === "bersihkan") {
  await bersihkan(Number(process.argv[4]) || 10);
} else {
  let adaKunci = 0; // Modul 21
  for (let i = 1; i <= JUMLAH; i++) {
    const deviceId = buatDeviceId(i);
    if (!kunciPerangkat(deviceId)) {
      console.log(`${deviceId}: kunci belum ada di alat/.env (KUNCI_${deviceId.toUpperCase()}=...), tidak dijalankan.`);
      continue;
    }
    adaKunci++;
    jalankanPerangkat(deviceId);
  }
  if (adaKunci === 0) {
    console.log("Tidak ada perangkat palsu yang punya kunci. Isi alat/.env, lalu jalankan dengan: node --env-file=.env …");
    process.exit(1);
  }
  // Modul 19: "suhu 33" / "suhu acak" diketik di terminal ini. Modul 24: juga "tanah 25" / "tanah acak" dan "tandon 15" /
  // "tandon acak". Modul 25: "kebun mulai" / "kebun cabut" / "kebun pasang". Hanya di mode ini: di mode bersihkan,
  // pendengar terminal akan membuat program tidak selesai sendiri.
  createInterface({ input: process.stdin }).on("line", (baris) => {
    const [kata, isian] = baris.trim().toLowerCase().split(/\s+/);
    const angka = Number(isian);
    const persen = Number.isInteger(angka) && angka >= 0 && angka <= 100; // Modul 24: tanah dan tandon, bulat 0-100
    if (kata === "suhu" && isian === "acak") {
      suhuDiketik = null;
    } else if (kata === "suhu" && isian !== undefined && Number.isFinite(angka)) {
      suhuDiketik = angka;
    } else if (kata === "tanah" && (isian === "acak" || persen)) { // Modul 24
      tanahDiketik = isian === "acak" ? null : angka;
    } else if (kata === "tandon" && (isian === "acak" || persen)) { // Modul 24
      tandonDiketik = isian === "acak" ? null : angka;
    } else if (kata === "kebun" && ["mulai", "cabut", "pasang"].includes(isian)) { // Modul 25
      ketikKebun(isian);
      return;
    } else {
      console.log("Ketik misalnya: suhu 33, suhu acak, tanah 25, tanah acak, tandon 15, tandon acak, kebun mulai, " +
        "kebun cabut, atau kebun pasang (tanah dan tandon: bilangan bulat 0-100)");
      return;
    }
    if (kata === "suhu") console.log(suhuDiketik === null ? "Suhu: acak 25,0-33,0 °C" : `Suhu: ${suhuDiketik.toFixed(1)} °C`);
    if (kata === "tanah") console.log(tanahDiketik === null ? "Tanah: acak 20-60 %" : `Tanah: ${tanahDiketik} %`);
    if (kata === "tandon") {
      const kurang = tandonDiketik !== null && tandonDiketik < LEVEL_AIR_MINIMUM;
      console.log((tandonDiketik === null ? "Tandon: acak 30-90 %" : `Tandon: ${tandonDiketik} %`) +
        (kurang ? ` (di bawah ${LEVEL_AIR_MINIMUM} %: perintah pompa akan ditolak)` : ""));
    }
  });
  console.log(`${adaKunci} perangkat palsu menuju ${ALAMAT_BROKER}. Ketik misalnya "suhu 33", "tanah 25", "tandon 15", ` +
    `"tanah acak", atau "kebun mulai". Hentikan dengan Ctrl+C.`);
}
