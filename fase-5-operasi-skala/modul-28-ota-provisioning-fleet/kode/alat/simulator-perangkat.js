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
// Modul 28 (kontrak 1.6): perangkat palsu meniru RANCANGAN firmware Node 1 1.7.0. Simulator TIDAK mem-flash apa pun:
//   - pembaruan firmware TIRUAN: ack "diterima" seketika, status offline-mode lalu putus MQTT dengan rapi (tanpa wasiat),
//     unduh berkas lewat rute berkunci seperti HTTPUpdate Arduino-ESP32 3.3.12 (GET ... HTTP/1.0, Basic Auth device_id:kunci,
//     kepala x-ESP32-*), periksa 200 + Content-Length + bait pertama 0xE9 + SHA-256, "menyala ulang" 5 detik dengan versi baru;
//   - masa uji 60 detik: versi baru SAH bila tersambung ke broker (kunci diterima), berlangganan cmd, dan menerbitkan online.
//     Berkas TIRUAN bertanda UJI_KUNCI_SALAH meniru firmware 1.7.2-uji (kunci broker dirusak di RAM): broker menolaknya,
//     60 detik lewat, perangkat "kembali sendiri" ke versi lama (rollback tiruan) dan melaporkannya;
//   - vitals membawa reset_reason, fw, dan laporan ota (diulang di paling banyak 3 vitals); config boleh membawa jeda.vitals_s;
//   - pendaftaran dengan kode klaim (mode "klaim" di bawah), dan perintah terminal "restart" (berhenti sengaja);
//   - "alamat server" di NVS (kolom Alamat server portal / Serial "server" / hasil klaim): perangkat HANYA mengunduh dari
//     <alamat server>/fw/node-1/<versi>.bin. url lain = ack ok:false "url bukan server rumah ini", kunci tidak dikirim.
// Semua angka waktu = angka simulator di jaringan lab, BUKAN angka ESP32 lewat WiFi.
//
// Cara pakai (dari terminal, di folder alat):
//   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883            -> 10 perangkat palsu
//   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 1          -> 1 perangkat palsu (paling mudah diamati)
//   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 bersihkan  -> hapus status retained perangkat palsu
//   Modul 28:
//   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 1 --fw=1.6.0
//        -> perangkat palsu yang BELUM pernah menyimpan versi mulai dengan firmware lama 1.6.0 (tanpa reset_reason dan fw di
//           vitals, menolak update). Bawaan --fw=1.7.0. Versi yang sudah tersimpan di data/arsip-simulator.json tetap dipakai.
//   node simulator-perangkat.js mqtt://192.168.1.37:1883 klaim 7K2M-QF9D http://192.168.1.10 f00d00000003
//        -> "papan baru": tukar kode klaim di <alamat server>/api/provision/klaim, simpan kuncinya (pengganti NVS), lalu
//           langsung tersambung. device_id boleh dilewati (bawaan f00d00000003).
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
//   restart      -> Modul 28: semua perangkat palsu berhenti sengaja (offline-mode, putus rapi) lalu menyala ulang
//   server http://192.168.1.10 -> Modul 28: alamat server rumah semua perangkat palsu (= perintah Serial "server" Node 1
//                 1.7.0), disimpan di NVS. Bawaannya ALAMAT_SERVER di alat/.env; perangkat hasil klaim memakai alamat klaimnya
//   ota          -> Modul 28: versi, masa uji, dan laporan pembaruan setiap perangkat palsu
// Hentikan dengan Ctrl+C: broker lalu menerbitkan wasiat "offline" setiap perangkat palsu. Kebun tiruan ikut diam, tetapi
// statusnya tetap "online" (Node 2 tidak punya wasiat; persis Node 2 asli saat Node 1 mati).

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { connect as sambungTcp } from "node:net";
import { createInterface } from "node:readline";
import { connect as sambungTls } from "node:tls";
import mqtt from "mqtt";
import { buatTelemetri } from "./generate-dummy.js";

// Modul 28: pilihan --fw=x.y.z boleh ditulis di mana saja; sisanya tetap urutan lama (alamat broker, jumlah/bersihkan/klaim)
const argumen = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const FW_AWAL = (process.argv.find((a) => a.startsWith("--fw=")) ?? "--fw=1.7.0").slice(5);
const ALAMAT_BROKER = argumen[0] || "mqtt://127.0.0.1:1883";
const JUMLAH = Number(argumen[1]) || 10;
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
// Modul 28: pembaruan firmware tiruan (rancangan Node 1 1.7.0, D2/D3/D4/D7/D9-D12 Modul 28)
const RAK_PROGRAM = 1966080; // satu rak program Minimal SPIFFS (Modul 10): ESP.getFreeSketchSpace() = ukuran rak sebelah
const LAMA_MENYALA_MS = 5000; // lama "menyala ulang" tiruan sesudah memasang firmware atau rollback
const MASA_UJI_MS = 60 * 1000; // firmware baru harus terbukti dalam 60 detik (MASA_UJI_OTA di firmware)
// Batas diam saat mengunduh, seperti HTTPUpdate 3.3.12 (dibaca dari sumbernya; temuan verifikasi firmware M28 F1):
const BATAS_DIAM_KEPALA_MS = 8000; // menunggu KEPALA jawaban: HTTPClient 8 detik tanpa data = -11, tanpa menyala ulang
const BATAS_DIAM_ISI_HTTPS_MS = 30000; // isi berhenti di TENGAH berkas lewat https: Update menyerah 300 x 0,1 detik = Update 6
const BATAS_WATCHDOG_UNDUH_MS = 60000; // ... lewat http: library menunggu jauh lebih lama, watchdog 60 detik me-restart (WDT)
const LAPORAN_DIULANG = 3; // laporan ota ikut paling banyak 3 vitals (vitals QoS 0 bisa hilang)
const JEDA_VITALS_BAWAAN = 300; // detik (JEDA_VITALS di konfigurasi.h)

// device_id palsu: 12 digit heksadesimal huruf kecil, diawali f00d supaya mudah dikenali
function buatDeviceId(nomor) {
  return "f00d" + String(nomor).padStart(8, "0");
}

// Modul 19: "NVS" semua perangkat palsu, misalnya { "f00d00000001": { "suhu_kipas_on": 31, "tanah_siram": 35 } }.
// Modul 28: juga fw (versi yang terpasang), jeda_vitals, kunci hasil klaim, rencana pembaruan (ota), dan laporannya.
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

// Modul 21: kunci broker satu perangkat palsu dari alat/.env, misalnya KUNCI_F00D00000001. Modul 28: atau kunci hasil
// klaim yang tersimpan di "NVS" (data/arsip-simulator.json). undefined = belum ada.
function kunciPerangkat(deviceId) {
  return process.env[`KUNCI_${deviceId.toUpperCase()}`] || arsip[deviceId]?.kunci || undefined;
}
const KODE_DITOLAK = [4, 5, 134, 135]; // Modul 21: jawaban broker "kunci salah / tidak diizinkan" (MQTT 3.1.1 dan 5)

// Modul 28: alamat server rumah satu perangkat palsu, tanpa / di akhir, huruf kecil: dari "NVS" (klaim atau perintah
// terminal "server"), atau bawaannya ALAMAT_SERVER di alat/.env (pengganti nilai bawaan konfigurasi.h). "" = belum diisi.
// Perangkat hanya mau mengunduh firmware dari alamat INI (kontrak 1.6 bagian 7): perintah update dengan url ke server lain
// ditolak sebelum apa pun dikirim, karena unduhan membawa kunci perangkat (Basic device_id:kunci).
// Bawaan dari alat/.env dirapikan dan diperiksa seperti ALAMAT_SERVER_BAWAAN firmware (pengaturan.cpp): bentuk yang tidak
// bisa disimpan Node 1 tidak dipakai (= belum diisi; alasannya dicetak sekali saat simulator mulai).
function alamatServerPerangkat(deviceId) {
  const tersimpan = arsip[deviceId]?.alamat_server;
  if (tersimpan) return rapikanAlamat(tersimpan); // sudah diperiksa saat disimpan (portal/Serial/klaim)
  const bawaan = rapikanAlamat(process.env.ALAMAT_SERVER);
  return salahAlamatServer(bawaan) === "" ? bawaan : "";
}

// waktu UTC tanpa milidetik, seperti ts di kontrak data: 2026-10-19T04:14:28Z
function waktuSekarang() {
  return new Date().toISOString().slice(0, 19) + "Z";
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

// Modul 28: jeda di config (kontrak 1.6): hanya vitals_s, bilangan bulat 60-3600. "" = sah.
function periksaJeda(jeda) {
  if (typeof jeda !== "object" || jeda === null || Array.isArray(jeda)) return "jeda harus berisi vitals_s";
  for (const nama of Object.keys(jeda)) if (nama !== "vitals_s") return `jeda tidak dikenal: ${nama}`;
  if (!Number.isInteger(jeda.vitals_s) || jeda.vitals_s < 60 || jeda.vitals_s > 3600) return "vitals_s harus bilangan bulat 60-3600";
  return "";
}

// Modul 28: versi a lebih lama dari b? (untuk "firmware lama" di bawah 1.7.0; tanpa paket semver)
function lebihLama(a, b) {
  const [x, y] = [a.split(".").map(Number), b.split(".").map(Number)];
  return (x[0] - y[0] || x[1] - y[1] || x[2] - y[2]) < 0;
}

// Modul 28: http:// hanya boleh ke alamat IP jaringan rumah (10.x, 172.16-31.x, 192.168.x), supaya kunci perangkat tidak
// pernah terkirim polos ke internet (rancangan firmware 1.7.0). SIMULATOR SAJA juga menerima 127.x: ia berjalan di mesin
// yang sama dengan server lab; ESP32 sungguhan tidak pernah memakai 127.x. Alamat IPv4 dibaca persis seperti firmware
// (periksa-ota.cpp, alamatIpRumah) dan backend (config/env.ts, ipRumah): tepat empat angka 0-255 dipisah titik.
function alamatRumah(host) {
  const angka = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)?.slice(1).map(Number);
  if (angka === undefined || angka.some((n) => n > 255)) return false;
  const [a, b] = angka;
  return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

// Modul 28: kepala permintaan HTTPUpdate (HTTPUpdate.cpp + HTTPClient.cpp 3.3.12), persis urutannya: HTTP/1.0, Host,
// User-Agent, Connection: close (useHTTP10 mematikan keep-alive), Authorization, lalu kepala tambahan HTTPUpdate.
// Nilai MD5/SHA-256/ukuran sketsa di sini TIRUAN (perangkat sungguhan menghitungnya dari rak yang sedang berjalan).
function kepalaHttpUpdate(alamat, deviceId, kunci, fw) {
  const mac = deviceId.match(/../g).join(":").toUpperCase(); // a4cf12e5b7c0 -> A4:CF:12:E5:B7:C0
  const macAp = mac.slice(0, 15) + ((parseInt(deviceId.slice(10), 16) + 1) % 256).toString(16).padStart(2, "0").toUpperCase();
  const tiruan = createHash("sha256").update(`${deviceId}-${fw}`).digest("hex");
  const portBawaan = alamat.protocol === "https:" ? "443" : "80";
  return [
    `GET ${alamat.pathname} HTTP/1.0`,
    `Host: ${alamat.hostname}${alamat.port && alamat.port !== portBawaan ? `:${alamat.port}` : ""}`,
    "User-Agent: ESP32-http-Update",
    "Connection: close",
    `Authorization: Basic ${Buffer.from(`${deviceId}:${kunci}`).toString("base64")}`,
    "Cache-Control: no-cache",
    `x-ESP32-BASE-MAC: ${mac}`,
    `x-ESP32-STA-MAC: ${mac}`,
    `x-ESP32-AP-MAC: ${macAp}`,
    `x-ESP32-free-space: ${RAK_PROGRAM}`,
    "x-ESP32-sketch-size: 1196032",
    `x-ESP32-sketch-md5: ${tiruan.slice(0, 32)}`,
    `x-ESP32-sketch-sha256: ${tiruan.toUpperCase()}`,
    "x-ESP32-chip-size: 4194304",
    "x-ESP32-sdk-version: v5.5.5",
    "x-ESP32-mode: sketch",
    `x-ESP32-version: ${fw}`,
  ].join("\r\n") + "\r\n\r\n";
}

// Modul 28: unduh satu berkas dengan HTTP/1.0 MENTAH (soket TCP/TLS sendiri, bukan fetch: fetch selalu HTTP/1.1 dan
// menerima jawaban chunked, padahal HTTPUpdate tidak). Hasilnya { kode, kepala, isi } atau galat.
// HTTPS memakai daftar akar CA bawaan Node (lab: NODE_EXTRA_CA_CERTS = akar CA tiruan) dan memeriksa nama sertifikat.
// Seperti HTTPUpdate: jawaban selain 200 + Content-Length langsung selesai sesudah kepalanya; isi 200 dibaca sampai lengkap.
// Galat ber-pesanOta = teks ota.pesan firmware; galat ber-wdt = watchdog me-restart perangkat (isi http:// berhenti di tengah).
function unduhHttp10(url, deviceId, kunci, fw) {
  const alamat = new URL(url);
  return new Promise((selesai, gagal) => {
    const port = Number(alamat.port) || (alamat.protocol === "https:" ? 443 : 80);
    const soket = alamat.protocol === "https:"
      ? sambungTls({ host: alamat.hostname, port, servername: alamat.hostname })
      : sambungTcp({ host: alamat.hostname, port });
    let semua = Buffer.alloc(0);
    let hasil = null; // { kode, kepala, mulaiIsi } begitu kepala jawaban lengkap
    let pengaturDiam = null;
    const galatDiam = () => Object.assign(new Error("HTTPC_ERROR_READ_TIMEOUT (-11)"),
      { pesanOta: "server diam 8 detik sebelum menjawab (-11 HTTPC_ERROR_READ_TIMEOUT)" });
    const galatUpdate6 = () => Object.assign(new Error("Update error: Stream Read Timeout"),
      { pesanOta: "unduhan terhenti di tengah: 30 detik tanpa data (Update 6 UPDATE_ERROR_STREAM)" });
    // Hitungan diam dimulai lagi setiap ada data. Sambungan yang DITUTUP server di tengah isi diperlakukan sama dengan
    // diam: HTTPUpdate tidak bisa membedakannya, ia hanya melihat data yang berhenti.
    const diam = (ms, buatGalat) => {
      clearTimeout(pengaturDiam);
      pengaturDiam = setTimeout(() => {
        soket.removeAllListeners("close");
        soket.destroy();
        gagal(buatGalat());
      }, ms);
    };
    const diamIsi = () => (alamat.protocol === "https:"
      ? diam(BATAS_DIAM_ISI_HTTPS_MS, galatUpdate6)
      : diam(BATAS_WATCHDOG_UNDUH_MS, () => Object.assign(new Error("watchdog 60 detik saat mengunduh"), { wdt: true })));
    const bacaKepala = () => {
      const batas = semua.indexOf("\r\n\r\n");
      if (batas < 0) return null;
      const [baris, ...lain] = semua.subarray(0, batas).toString("latin1").split("\r\n");
      const kepala = Object.fromEntries(lain.map((b) => [b.slice(0, b.indexOf(":")).trim().toLowerCase(), b.slice(b.indexOf(":") + 1).trim()]));
      return { kode: Number(baris.split(" ")[1]), kepala, mulaiIsi: batas + 4 };
    };
    const selesaiSekarang = () => {
      clearTimeout(pengaturDiam);
      soket.removeAllListeners("close");
      soket.destroy();
      selesai({ kode: hasil.kode, kepala: hasil.kepala, isi: semua.subarray(hasil.mulaiIsi) });
    };
    const tutup = () => { // sambungan ditutup server
      if (hasil === null) {
        clearTimeout(pengaturDiam);
        return gagal(new Error("jawaban server tidak lengkap"));
      }
      // isi 200 belum lengkap: tunggu sampai batas diam isi habis (pengaturDiam masih berjalan)
    };
    soket.once(alamat.protocol === "https:" ? "secureConnect" : "connect", () => {
      soket.write(kepalaHttpUpdate(alamat, deviceId, kunci, fw));
      diam(BATAS_DIAM_KEPALA_MS, galatDiam);
    });
    soket.on("data", (d) => {
      semua = Buffer.concat([semua, d]);
      if (hasil === null) {
        hasil = bacaKepala();
        if (hasil === null) return diam(BATAS_DIAM_KEPALA_MS, galatDiam); // kepala belum lengkap
      }
      const panjang = Number(hasil.kepala["content-length"]);
      // HTTPUpdate hanya membaca isi kalau jawabannya 200 dengan Content-Length yang muat di rak; selain itu selesai di sini
      if (hasil.kode !== 200 || !(panjang > 0) || panjang > RAK_PROGRAM) return selesaiSekarang();
      // seperti HTTPClient: dengan Content-Length, berhenti membaca begitu isinya lengkap (tidak menunggu sambungan ditutup)
      if (semua.length - hasil.mulaiIsi >= panjang) return selesaiSekarang();
      diamIsi();
    });
    // menyambung (TCP, dan TLS untuk https) yang tidak selesai dalam 8 detik = tidak tersambung (-1)
    diam(BATAS_DIAM_KEPALA_MS, () => Object.assign(new Error("tidak tersambung"), { pesanOta: "tidak tersambung ke server (-1)" }));
    soket.on("error", (g) => {
      // galat soket di tengah isi (misalnya sambungan di-RST): library melihatnya sebagai bacaan gagal, 300 x 0,1 detik
      // = Update 6, baik http maupun https
      if (hasil !== null) return diam(BATAS_DIAM_ISI_HTTPS_MS, galatUpdate6);
      clearTimeout(pengaturDiam);
      gagal(g);
    });
    soket.on("close", tutup);
  });
}

// Modul 28: kode galat HTTPUpdate (HTTPUpdate.h 3.3.12) untuk kode HTTP yang bukan 200
function galatHttp(kode) {
  if (kode === 304 || kode === 204) return "server: tidak ada pembaruan (304, HTTP_UPDATE_NO_UPDATES)";
  if (kode === 403) return "unduh ditolak server: 403 (-103 HTTP_UE_SERVER_FORBIDDEN)";
  if (kode === 404) return "berkas tidak ada di server: 404 (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)";
  return `jawaban server ${kode} (-104 HTTP_UE_SERVER_WRONG_HTTP_CODE)`;
}

const perangkatBerjalan = new Map(); // Modul 28: device_id -> { restart, keadaanOta } untuk perintah terminal

function jalankanPerangkat(deviceId) {
  const topik = (jenis) => `rpm/${deviceId}/${jenis}`;
  const nvs = () => (arsip[deviceId] ??= {});
  // Modul 19
  const ambang = { suhu_kipas_on: 30, tanah_siram: 30, ...arsip[deviceId] }; // angka bawaan = konfigurasi.h Node 1
  delete ambang.fw; delete ambang.kunci; delete ambang.ota; delete ambang.laporan_ota; delete ambang.jeda_vitals; // bukan ambang
  delete ambang.alamat_server;
  // Modul 28: hal-hal yang hilang setiap kali perangkat menyala ulang (RAM), di-reset di menyala()
  let klien = null;
  let mulai = Date.now();
  let alasanReset = "POWERON";
  let fw = arsip[deviceId]?.fw ?? FW_AWAL;
  let masaUji = null; // { id, dari, ke, rusak, pengatur } selama firmware baru belum sah ("PENDING_VERIFY")
  let pembaruanBerjalan = false;
  let keadaan = { kipas: false, lampu: false, pompa: false, tirai: 90 };
  let idTerakhir = []; // id perintah yang sudah dikerjakan (kontrak aturan 8); hilang saat menyala ulang
  let suhu = 28.5; // bacaan suhu terakhir, dipakai telemetry dan pengaman
  let kipasMilikPengaman = false; // true kalau kipas dinyalakan pengaman (pola lampu otomatis Modul 6)
  let terakhirTersambung = Date.now();
  let offline = false;
  let mulaiOffline = 0;
  let kipasLokal = 0; // berapa kali pengaman menyalakan kipas selama mode offline ini
  let laporan = null; // { offline_s, kipas_lokal } yang menunggu ikut vitals
  let pengatur = null; // Modul 19: jadwal telemetry berikutnya
  let pengaturVitals = null;
  let pengaturDetak = null;
  let terakhirKirim = 0; // Modul 19: kapan telemetry terakhir diterbitkan
  const fw17 = () => !lebihLama(fw, "1.7.0"); // firmware 1.7.0 ke atas: kontrak 1.6

  // vitals: sekali setelah tersambung, lalu setiap 5 menit (kontrak bagian 2). Modul 28: jedanya dari config (NVS)
  function kirimVitals() {
    const vitals = {
      ts: waktuSekarang(),
      rssi: -40 - Math.floor(Math.random() * 40), // -40 sampai -79 dBm
      uptime_s: Math.floor((Date.now() - mulai) / 1000),
      heap_free: 180000 + Math.floor(Math.random() * 20000),
      ...laporan, // Modul 19 (kontrak 1.3): offline_s dan kipas_lokal, hanya di vitals pertama setelah mode offline
    };
    if (fw17()) { // Modul 28 (kontrak 1.6): alasan menyala ulang, versi, dan laporan pembaruan yang belum 3 kali terkirim
      vitals.reset_reason = alasanReset;
      vitals.fw = fw;
      const lap = arsip[deviceId]?.laporan_ota;
      if (lap) {
        vitals.ota = lap.isi;
        lap.terkirim++;
        if (lap.terkirim >= LAPORAN_DIULANG) delete arsip[deviceId].laporan_ota;
        simpanArsip();
        console.log(`${deviceId}: laporan pembaruan ikut vitals (${lap.terkirim}/${LAPORAN_DIULANG}): ${JSON.stringify(lap.isi)}`);
      }
    }
    klien.publish(topik("vitals"), JSON.stringify(vitals));
    if (laporan) {
      console.log(`${deviceId}: laporan mode offline terkirim bersama vitals (offline_s=${laporan.offline_s}, ` +
        `kipas_lokal=${laporan.kipas_lokal})`);
    }
    laporan = null;
  }

  function jadwalkanVitals() {
    clearInterval(pengaturVitals);
    const detik = fw17() ? (arsip[deviceId]?.jeda_vitals ?? JEDA_VITALS_BAWAAN) : JEDA_VITALS_BAWAAN;
    pengaturVitals = setInterval(() => { if (klien?.connected) kirimVitals(); }, detik * 1000);
  }

  // telemetry setiap 10 detik (kontrak aturan 3). Modul 19: jadwal 10 detik berikutnya dihitung dari kiriman terakhir,
  // dan state (keadaan aktuator) ikut terkirim (kontrak 1.3)
  function kirimTelemetry() {
    if (klien?.connected) {
      const bacaan = buatTelemetri();
      bacaan.fw = fw; // Modul 28: versi yang sedang berjalan (generate-dummy menulis 0.1.0)
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

  // Modul 28: "menyala" = setup() firmware: RAM kosong, relay padam, baca NVS, lalu menyambung ke broker dengan klien MQTT
  // BARU (sambungan lama sudah tertutup). Firmware yang baru dipasang mulai masa uji 60 detik.
  function menyala(alasan) {
    mulai = Date.now();
    alasanReset = alasan;
    keadaan = { kipas: false, lampu: false, pompa: false, tirai: 90 };
    idTerakhir = [];
    pembaruanBerjalan = false;
    kipasMilikPengaman = false;
    offline = false;
    terakhirTersambung = Date.now();
    fw = arsip[deviceId]?.fw ?? FW_AWAL;
    const rencana = arsip[deviceId]?.ota;
    if (rencana?.tahap === "dipasang" && fw === rencana.ke) { // bootloader menjalankan rak baru: PENDING_VERIFY
      masaUji = { ...rencana, pengatur: setTimeout(gagalMasaUji, MASA_UJI_MS) };
      console.log(`${deviceId}: menyala dengan ${fw} (rak baru), masa uji ${MASA_UJI_MS / 1000} detik dimulai`);
    }
    mulaiBerjalan();
  }

  // Modul 28: klien MQTT baru + semua pengatur waktu. Dipanggil menyala(), dan sesudah pembaruan GAGAL tanpa menyala ulang
  // (RAM, uptime, dan reset_reason tetap: perangkat hanya menyambung lagi).
  function mulaiBerjalan() {
    let kunci = kunciPerangkat(deviceId);
    if (masaUji?.rusak) { // firmware 1.7.2-uji (UJI_KUNCI_SALAH 1): kunci dirusak di RAM saja, NVS tidak disentuh
      kunci = "kunci-dirusak-UJI_KUNCI_SALAH";
      console.log(`${deviceId}: firmware ${fw} = rilis UJI (UJI_KUNCI_SALAH): kunci broker sengaja salah`);
    }
    klien = mqtt.connect(ALAMAT_BROKER, {
      clientId: deviceId,
      username: deviceId, // Modul 21: nama pengguna broker = device_id
      password: kunci, // Modul 21: dari alat/.env; Modul 28: atau hasil klaim
      clean: true,
      keepalive: 15,
      reconnectPeriod: 5000, // menyambung ulang paling sering setiap 5 detik (kontrak bagian 3)
      reconnectOnConnackError: true, // Modul 21: tanpa ini, library berhenti mencoba begitu broker menolak kuncinya
      will: { topic: topik("status"), payload: "offline", qos: 1, retain: true },
    });
    pasangPendengar(klien);
    if (deviceId === ID_PENGHUBUNG) pasangPenghubungKebun(klien); // Modul 25: Kebun tiruan menumpang perangkat ini
    jadwalkanVitals();
    pengaturDetak = setInterval(detak, 2000);
    jadwalkan(Math.random() * 10000); // kiriman pertama pada detik acak supaya perangkat palsu tidak serentak
  }

  // Modul 28: "ESP.restart()": timer berhenti, sambungan ditutup. rapi = berhenti sengaja: offline-mode + DISCONNECT rapi
  // (wasiat tidak terbit). Tidak rapi = sambungan diputus begitu saja (broker menerbitkan wasiat bila masih tersambung).
  function padam(rapi, lanjut) {
    clearTimeout(pengatur);
    clearInterval(pengaturVitals);
    clearInterval(pengaturDetak);
    clearTimeout(masaUji?.pengatur);
    masaUji = null;
    const lama = klien;
    lama.options.reconnectPeriod = 0; // sambungan lama tidak boleh menyambung lagi sendiri
    if (rapi && lama.connected) {
      lama.publish(topik("status"), "offline-mode", { qos: 1, retain: true }, () => lama.end(false, {}, lanjut));
    } else {
      lama.end(true, {}, lanjut);
    }
  }

  function menyalaUlang(alasan, rapi) {
    padam(rapi, () => setTimeout(() => menyala(alasan), LAMA_MENYALA_MS));
  }

  // Modul 28: firmware baru SAH (esp_ota_mark_app_valid_cancel_rollback): dipanggil segera sesudah CONNACK diterima,
  // subscribe cmd dan publish online DITULIS (aturan firmware: nilai balik true, bukan menunggu PUBACK)
  function sahkan() {
    clearTimeout(masaUji.pengatur);
    console.log(`${deviceId}: ${fw} SAH (tersambung dan terbit ${Math.round((Date.now() - mulai) / 1000)} detik sesudah menyala)`);
    nvs().laporan_ota = { isi: { id: masaUji.id, hasil: "berhasil", versi: masaUji.ke }, terkirim: 0 };
    delete nvs().ota;
    simpanArsip();
    masaUji = null;
  }

  // Modul 28: 60 detik lewat tanpa sah = rollback (esp_ota_mark_app_invalid_rollback_and_reboot): laporan disimpan DULU
  // di NVS, lalu menyala ulang ke rak lama (reset_reason SW)
  function gagalMasaUji() {
    const r = masaUji;
    console.log(`${deviceId}: ${fw} TIDAK sah dalam ${MASA_UJI_MS / 1000} detik: kembali ke ${r.dari} (rollback tiruan)`);
    nvs().fw = r.dari;
    nvs().laporan_ota = { isi: { id: r.id, hasil: "rollback", versi: r.ke, pesan: "tidak tersambung ke broker dalam 60 detik" },
      terkirim: 0 };
    delete nvs().ota;
    simpanArsip();
    menyalaUlang("SW", false);
  }

  function pasangPendengar(k) {
    // Modul 21: broker menolak kunci? Tulis jelas, lalu coba lagi 60 detik kemudian saja (seperti Node 1 v1.6.0).
    k.on("error", (galat) => {
      if (KODE_DITOLAK.includes(galat.code)) {
        k.options.reconnectPeriod = 60000;
        console.log(`${deviceId}: DITOLAK broker (kode ${galat.code}): kunci salah, belum didaftarkan, atau sudah dicabut. ` +
          "Dicoba lagi 60 detik lagi.");
      } else {
        console.log(`${deviceId}: galat MQTT: ${galat.message}`);
      }
    });

    k.on("connect", () => {
      k.options.reconnectPeriod = 5000; // Modul 21: kunci diterima lagi: kembali ke jeda biasa
      if (offline) { // Modul 19: tersambung lagi setelah mode offline
        offline = false;
        laporan = { offline_s: Math.round((Date.now() - mulaiOffline) / 1000), kipas_lokal: kipasLokal };
        console.log(`${deviceId}: MODE OFFLINE SELESAI setelah ${laporan.offline_s} detik; ` +
          `pengaman menyalakan kipas ${kipasLokal} kali`);
      }
      terakhirTersambung = Date.now();
      k.publish(topik("status"), "online", { qos: 1, retain: true }); // kontrak bagian 3: online dulu, lalu langganan cmd
      k.subscribe(topik("cmd"), { qos: 1 });
      if (masaUji) sahkan(); // Modul 28: CONNACK diterima (kunci benar) + subscribe + publish = sah
      // Modul 19: laporan mode offline ditunda 10 detik. Backend yang ikut menyambung ulang (misalnya karena broker baru
      // dinyalakan lagi) butuh beberapa detik untuk berlangganan; tanpa jeda ini laporannya bisa terlewat.
      if (laporan) setTimeout(() => { if (k.connected) kirimVitals(); }, 10000);
      else kirimVitals();
      console.log(`${deviceId}: online (firmware ${fw})`);
    });
    k.on("offline", () => { // Modul 19; Modul 21: tidak ditulis kalau penyebabnya kunci ditolak (pesannya sudah ada)
      if (k.options.reconnectPeriod === 5000) console.log(`${deviceId}: broker tak terjangkau, mencoba lagi setiap 5 detik`);
    });
    k.on("message", (_topik, isi) => terimaPerintah(isi));
  }

  function terimaPerintah(isi) {
    if (isi.length === 0) return; // Modul 19: pesan kosong = config retained dihapus dari broker, bukan perintah
    let cmd;
    try {
      cmd = JSON.parse(isi.toString());
    } catch {
      return; // bukan JSON: tidak bisa dijawab (kontrak aturan 4)
    }
    if (typeof cmd.id !== "string" || cmd.id === "" || cmd.id.length > 39) return; // kontrak aturan 4: tidak bisa dijawab
    if (idTerakhir.includes(cmd.id)) return; // id yang sama hanya dikerjakan sekali (config retained yang datang lagi)
    idTerakhir.push(cmd.id);
    if (idTerakhir.length > 8) idTerakhir.shift();

    const sebelum = JSON.stringify(keadaan); // Modul 19: untuk tahu apakah ada aktuator yang berubah
    let pesan = "";
    let mulaiPembaruan = false;
    if (cmd.aksi === "config") { // Modul 19: semua isi dicek dulu, baru disimpan. Modul 28: ambang dan/atau jeda
      const adaAmbang = cmd.ambang !== undefined;
      const adaJeda = fw17() && cmd.jeda !== undefined; // firmware lama mengabaikan jeda
      if (!adaAmbang && !adaJeda) pesan = fw17() ? "config harus berisi ambang atau jeda" : periksaAmbang(cmd.ambang);
      else pesan = (adaAmbang ? periksaAmbang(cmd.ambang) : "") || (adaJeda ? periksaJeda(cmd.jeda) : "");
      if (pesan === "") {
        const baru = { ...ambang, ...(adaAmbang ? cmd.ambang : {}) };
        if (JSON.stringify(baru) !== JSON.stringify(ambang)) { // seperti NVS: tulis hanya kalau berubah
          Object.assign(ambang, baru);
          Object.assign(nvs(), ambang);
          simpanArsip();
          console.log(`${deviceId}: ambang disimpan ${JSON.stringify(ambang)}`);
        } else if (adaAmbang) {
          console.log(`${deviceId}: ambang sama dengan yang tersimpan ${JSON.stringify(ambang)}`);
        }
        if (adaJeda && nvs().jeda_vitals !== cmd.jeda.vitals_s) { // Modul 28
          nvs().jeda_vitals = cmd.jeda.vitals_s;
          simpanArsip();
          jadwalkanVitals();
          console.log(`${deviceId}: jeda vitals disimpan: ${cmd.jeda.vitals_s} detik`);
        }
      }
    } else if (cmd.aksi === "update") { // Modul 28
      pesan = periksaUpdate(cmd);
      mulaiPembaruan = pesan === "";
      if (mulaiPembaruan) pembaruanBerjalan = true; // sejak DITERIMA: update kedua sebelum unduhan mulai pun ditolak (aturan 12)
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
    console.log(`${deviceId}: perintah ${cmd.id} (${cmd.aksi}) -> ok=${ack.ok}${pesan === "" ? "" : ` (${pesan})`}`);
    if (JSON.stringify(keadaan) !== sebelum) kirimSegera(); // Modul 19
    if (mulaiPembaruan) setTimeout(() => void pasangFirmware(cmd), 50); // sesudah ack terkirim (ack = DITERIMA)
  }

  // ---------- Modul 28: pembaruan firmware tiruan ----------
  // Pemeriksaan isi cmd update (kontrak 1.6 bagian 7). "" = diterima; selain itu alasan penolakan untuk ack ok:false.
  function periksaUpdate(cmd) {
    if (!fw17()) return "aksi update belum didukung (Modul 28)"; // persis firmware 1.6.0
    if (masaUji) return "masih dalam masa uji 60 detik";
    if (pembaruanBerjalan) return "pembaruan lain sedang berjalan";
    if (typeof cmd.versi !== "string" || !/^\d+\.\d+\.\d+$/.test(cmd.versi)) return "versi harus berbentuk x.y.z";
    if (cmd.versi === fw) return `sudah memakai ${fw}`;
    // firmware di bawah 1.7.0 tidak punya masa uji/rollback dan tidak bisa menerima update lagi: hanya lewat kabel
    if (lebihLama(cmd.versi, "1.7.0")) return "versi di bawah 1.7.0 tidak punya rollback: pasang lewat kabel";
    if (typeof cmd.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(cmd.sha256)) return "sha256 harus 64 heksadesimal huruf kecil";
    if (!Number.isInteger(cmd.ukuran) || cmd.ukuran < 1 || cmd.ukuran > RAK_PROGRAM) return `ukuran harus 1-${RAK_PROGRAM} byte`;
    let alamat;
    try {
      alamat = new URL(cmd.url);
    } catch {
      return "url tidak sah";
    }
    if (cmd.url.length > 200 || !/^https?:$/.test(alamat.protocol) || alamat.pathname !== `/fw/node-1/${cmd.versi}.bin`) {
      return "url harus http(s)://<alamat>/fw/node-1/<versi>.bin";
    }
    // url WAJIB = <alamat server rumah>/fw/node-1/<versi>.bin (huruf besar-kecil tidak dibedakan). Tanpa aturan ini, akun
    // mana pun yang boleh menulis rpm/+/cmd (misalnya nodered) bisa menyuruh perangkat mengirim kuncinya ke server lain
    // dan memasang berkas apa pun (temuan verifikasi M28). Alamat server hanya bisa diubah lewat portal/Serial, bukan MQTT.
    const server = alamatServerPerangkat(deviceId);
    if (server === "") return "alamat server belum diisi (Serial: server <alamat>)";
    if (cmd.url.toLowerCase() !== `${server}/fw/node-1/${cmd.versi}.bin`) return "url bukan server rumah ini";
    if (alamat.protocol === "http:" && !alamatRumah(alamat.hostname)) return "http hanya untuk jaringan rumah";
    return "";
  }

  // Urutan rancangan firmware 1.7.0 (D7): ack sudah terkirim -> rencana ke NVS -> pompa padam -> offline-mode + DISCONNECT
  // rapi -> unduh + periksa -> berhasil: menyala ulang (SW) dengan versi baru; gagal: tersambung lagi, laporkan gagal.
  async function pasangFirmware(cmd) {
    pembaruanBerjalan = true;
    nvs().ota = { id: cmd.id, dari: fw, ke: cmd.versi, tahap: "mengunduh" };
    simpanArsip();
    if (keadaan.pompa) console.log(`${deviceId}: pompa dipadamkan sebelum memperbarui firmware`);
    keadaan.pompa = false;
    // Berhenti sengaja: kunci dan alamat diambil dulu, karena padam() menutup klien MQTT
    const kunci = kunciPerangkat(deviceId);
    console.log(`${deviceId}: pembaruan ${fw} -> ${cmd.versi} DITERIMA: offline-mode, putus rapi, mengunduh ${cmd.url}`);
    await new Promise((selesai) => padam(true, selesai));
    const mulaiUnduh = Date.now();
    let alasan = "";
    let isi = null;
    try {
      const jawab = await unduhHttp10(cmd.url, deviceId, kunci, fw);
      const panjang = Number(jawab.kepala["content-length"]);
      if (jawab.kode !== 200) alasan = galatHttp(jawab.kode);
      else if (!(panjang > 0)) alasan = "server tidak memberi Content-Length (-101 HTTP_UE_SERVER_NOT_REPORT_SIZE)";
      else if (panjang > RAK_PROGRAM) alasan = "berkas lebih besar dari rak program (-100 HTTP_UE_TOO_LESS_SPACE)";
      else if (jawab.isi[0] !== 0xe9) alasan = "bait pertama bukan 0xE9 atau belum tiba (-106 HTTP_UE_BIN_VERIFY_HEADER_FAILED)";
      else if (createHash("sha256").update(jawab.isi).digest("hex") !== cmd.sha256) {
        // setSHA256sum(sha256 perintah): Update.end() menolak berkasnya (Updater.cpp 3.3.12), bukan -109
        alasan = "SHA-256 tidak cocok dengan perintah (Update 15 UPDATE_ERROR_SHA256)";
      } else isi = jawab.isi;
    } catch (galat) {
      if (galat.wdt) { // isi http:// berhenti di tengah berkas: watchdog 60 detik me-restart perangkat, rak lama utuh
        console.log(`${deviceId}: unduhan ${cmd.versi} berhenti di tengah berkas ${BATAS_WATCHDOG_UNDUH_MS / 1000} detik: ` +
          "WATCHDOG me-restart perangkat (firmware lama tetap)");
        nvs().laporan_ota = { isi: { id: cmd.id, hasil: "gagal", versi: cmd.versi, pesan: "menyala ulang saat mengunduh (WDT)" },
          terkirim: 0 };
        delete nvs().ota;
        simpanArsip();
        setTimeout(() => menyala("WDT"), LAMA_MENYALA_MS);
        return;
      }
      alasan = galat.pesanOta ?? `unduh gagal: ${galat.message}`;
    }
    if (isi === null) { // gagal SEBELUM menyala ulang: rak lama utuh, versi lama tetap jalan
      console.log(`${deviceId}: pembaruan ${cmd.versi} GAGAL (${Date.now() - mulaiUnduh} ms): ${alasan}`);
      nvs().laporan_ota = { isi: { id: cmd.id, hasil: "gagal", versi: cmd.versi, pesan: alasan.slice(0, 80) }, terkirim: 0 };
      delete nvs().ota;
      simpanArsip();
      pembaruanBerjalan = false;
      setTimeout(mulaiBerjalan, 200); // tersambung lagi TANPA menyala ulang (uptime dan reset_reason tetap)
      return;
    }
    // berkas TIRUAN: penanda UJI_KUNCI_SALAH di awal berkas = firmware 1.7.2-uji (saklar UJI_KUNCI_SALAH 1)
    const rusak = isi.subarray(0, 512).toString("latin1").includes("UJI_KUNCI_SALAH");
    console.log(`${deviceId}: ${cmd.versi} terunduh ${isi.length} byte dalam ${Date.now() - mulaiUnduh} ms, SHA-256 cocok; ` +
      `menyala ulang${rusak ? " (berkas UJI: kunci broker akan salah)" : ""}`);
    nvs().ota = { id: cmd.id, dari: fw, ke: cmd.versi, tahap: "dipasang", rusak };
    nvs().fw = cmd.versi; // otadata menunjuk rak baru
    simpanArsip();
    setTimeout(() => menyala("SW"), LAMA_MENYALA_MS); // ESP.restart() sesudah HTTPUpdate OK
  }

  // Modul 28: perintah terminal "restart" = perintah Serial restart firmware 1.7.0: berhenti sengaja, lalu menyala ulang (SW)
  function restartSengaja() {
    if (masaUji) console.log(`${deviceId}: restart di tengah masa uji = firmware baru BATAL (bootloader kembali ke rak lama)`);
    if (masaUji) {
      nvs().fw = masaUji.dari;
      nvs().laporan_ota = { isi: { id: masaUji.id, hasil: "rollback", versi: masaUji.ke, pesan: "menyala ulang di tengah masa uji" },
        terkirim: 0 };
      delete nvs().ota;
      simpanArsip();
    }
    console.log(`${deviceId}: berhenti sengaja (offline-mode), menyala ulang ${LAMA_MENYALA_MS / 1000} detik lagi`);
    menyalaUlang("SW", true);
  }

  const keadaanOta = () => `${deviceId}: firmware ${fw}, alamat server ${alamatServerPerangkat(deviceId) || "(belum diisi)"}` +
    `${masaUji ? `, MASA UJI ${masaUji.ke} (dari ${masaUji.dari})` : ""}` +
    `${pembaruanBerjalan ? ", sedang memperbarui" : ""}, reset_reason ${alasanReset}` +
    `${arsip[deviceId]?.laporan_ota ? `, laporan menunggu: ${JSON.stringify(arsip[deviceId].laporan_ota.isi)}` : ""}`;
  perangkatBerjalan.set(deviceId, { restart: restartSengaja, keadaanOta });

  // Modul 19: setiap 2 detik, seperti langkah BERTINDAK Node 1: ambil bacaan suhu, periksa mode offline, jalankan pengaman.
  function detak() {
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
  }

  // Modul 28: menyala pertama kali (simulator baru dijalankan = listrik baru masuk). Rencana pembaruan yang tertinggal di
  // "NVS": tahap "mengunduh" = listrik padam saat mengunduh (rak lama utuh: 16 bait pertama rak baru belum ditulis), laporkan
  // gagal; tahap "dipasang" = listrik padam di tengah masa uji: bootloader menandai rak baru ABORTED dan kembali ke rak lama.
  const tertinggal = arsip[deviceId]?.ota;
  if (tertinggal?.tahap === "mengunduh" || tertinggal?.tahap === "dipasang") {
    const dipasang = tertinggal.tahap === "dipasang";
    if (dipasang) nvs().fw = tertinggal.dari;
    nvs().laporan_ota = { isi: { id: tertinggal.id, hasil: dipasang ? "rollback" : "gagal", versi: tertinggal.ke,
      pesan: dipasang ? "padam di tengah masa uji" : "padam saat mengunduh" }, terkirim: 0 };
    delete nvs().ota;
    simpanArsip();
  }
  menyala("POWERON");
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

// Dipanggil jalankanPerangkat() untuk f00d00000001 setiap kali menyala (Modul 28: klien MQTT baru setiap menyala). Seperti
// Node 1 asli, setiap kali tersambung (lagi) ke broker, penghubung menerbitkan ulang status Kebun yang terakhir diketahuinya.
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

// Modul 28: ketikan alamat dirapikan seperti firmware 1.7.0 (periksa-ota.cpp, rapikanAlamat): spasi di tepi dibuang, huruf
// besar A-Z menjadi kecil, garis miring di akhir dibuang. Hanya A-Z, seperti firmware: toLowerCase() juga mengubah beberapa
// huruf non-Latin (misalnya tanda Kelvin) menjadi huruf Latin biasa, padahal papan sungguhan menolak huruf itu.
function rapikanAlamat(teks) {
  return (teks ?? "").replace(/^[ \t]+/, "").replace(/[ \t/]+$/, "").replace(/[A-Z]/g, (h) => h.toLowerCase());
}

// Modul 28: bentuk alamat server yang boleh disimpan (portal, Serial "server", klaim), sesudah dirapikan. Sama persis dengan
// firmware 1.7.0 (periksa-ota.cpp, periksaAlamatServer) dan ALAMAT_SERVER backend (config/env.ts, salahAlamatServer):
// paling panjang 64 huruf; http:// atau https://; nama server hanya huruf kecil, angka, titik, dan tanda - (tanpa garis
// bawah _); port 1-65535 bila ditulis; tanpa jalur; http:// hanya ke alamat IP rumah (simulator juga 127.x, lihat
// alamatRumah). "" = sah, selain itu alasannya, dengan kalimat yang sama dengan firmware.
function salahAlamatServer(alamatServer) {
  const contoh = "Tulis alamat server tanpa / di akhir, misalnya http://192.168.1.10 atau https://iot.namaanda.my.id";
  const teks = alamatServer ?? "";
  if (teks.length > 64) return "Alamat server paling panjang 64 huruf";
  const bagian = /^(https?):\/\/([a-z0-9.-]+)(?::(\d{1,5}))?$/.exec(teks);
  if (bagian === null || (bagian[3] !== undefined && (Number(bagian[3]) < 1 || Number(bagian[3]) > 65535))) return contoh;
  if (bagian[1] === "http" && !alamatRumah(bagian[2])) {
    return "http hanya untuk jaringan rumah (alamat IP 10.x, 172.16-31.x, 192.168.x): pakai https:// di internet";
  }
  return "";
}

// Modul 28: "papan baru" mendaftar dengan kode klaim, persis rancangan firmware 1.7.0 sesudah tombol Save di portal:
// POST <alamat server>/api/provision/klaim {kode, device_id} -> 201 {device_id, kunci, mqtt_username}; kuncinya disimpan di
// "NVS" (data/arsip-simulator.json, tidak ikut Git), lalu perangkat langsung tersambung. Hasilnya device_id, atau null.
async function klaim(kode, ketikan, deviceId) {
  const alamatServer = rapikanAlamat(ketikan); // seperti kolom "Alamat server" portal: dirapikan dulu, baru diperiksa
  const salah = salahAlamatServer(alamatServer);
  if (salah !== "") {
    console.log(salah);
    return null;
  }
  const mulaiKlaim = Date.now();
  let jawab;
  try {
    jawab = await fetch(`${alamatServer}/api/provision/klaim`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kode, device_id: deviceId }), signal: AbortSignal.timeout(15000) });
  } catch (galat) {
    console.log(`${deviceId}: klaim gagal, server tidak terjangkau: ${galat.cause?.message ?? galat.message}`);
    return null;
  }
  const isi = await jawab.json().catch(() => ({}));
  if (jawab.status !== 201) {
    console.log(`${deviceId}: klaim DITOLAK ${jawab.status}: ${isi.pesan ?? isi.message ?? "(tanpa pesan)"}`);
    return null;
  }
  // simpanKunciBroker(): kunci di NVS, tidak pernah dicetak. Alamat server klaim ikut disimpan: dari sinilah firmware diunduh.
  arsip[deviceId] = { ...arsip[deviceId], kunci: isi.kunci, alamat_server: alamatServer };
  simpanArsip();
  console.log(`${deviceId}: klaim BERHASIL dalam ${Date.now() - mulaiKlaim} ms (nama pengguna broker ${isi.mqtt_username}); ` +
    "kunci disimpan di data/arsip-simulator.json, menyambung ke broker...");
  return deviceId;
}

if (argumen[1] === "bersihkan") {
  await bersihkan(Number(argumen[2]) || 10);
} else {
  // Modul 28: = pengaturan.cpp firmware: ALAMAT_SERVER bawaan yang tidak bisa disimpan Node 1 tidak dipakai, dengan alasannya
  const salahBawaan = process.env.ALAMAT_SERVER ? salahAlamatServer(rapikanAlamat(process.env.ALAMAT_SERVER)) : "";
  if (salahBawaan !== "") console.log(`ALAMAT_SERVER di alat/.env tidak dipakai: ${salahBawaan}`);
  let adaKunci = 0; // Modul 21
  if (argumen[1] === "klaim") { // Modul 28
    const deviceId = argumen[4] ?? "f00d00000003";
    if (!/^[0-9a-f]{12}$/.test(deviceId)) {
      console.log(`device_id harus 12 heksadesimal huruf kecil, misalnya f00d00000003. Isinya: ${deviceId}`);
      process.exit(1);
    }
    if ((await klaim(argumen[2] ?? "", argumen[3], deviceId)) === null) process.exit(1);
    jalankanPerangkat(deviceId);
    adaKunci = 1;
  } else {
    for (let i = 1; i <= JUMLAH; i++) {
      const deviceId = buatDeviceId(i);
      if (!kunciPerangkat(deviceId)) {
        console.log(`${deviceId}: kunci belum ada di alat/.env (KUNCI_${deviceId.toUpperCase()}=...), tidak dijalankan.`);
        continue;
      }
      adaKunci++;
      jalankanPerangkat(deviceId);
    }
  }
  if (adaKunci === 0) {
    console.log("Tidak ada perangkat palsu yang punya kunci. Isi alat/.env, lalu jalankan dengan: node --env-file=.env …");
    process.exit(1);
  }
  // Modul 19: "suhu 33" / "suhu acak" diketik di terminal ini. Modul 24: juga "tanah 25" / "tanah acak" dan "tandon 15" /
  // "tandon acak". Modul 25: "kebun mulai" / "kebun cabut" / "kebun pasang". Modul 28: "restart" dan "ota". Hanya di mode
  // ini: di mode bersihkan, pendengar terminal akan membuat program tidak selesai sendiri.
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
    } else if (kata === "restart") { // Modul 28
      for (const p of perangkatBerjalan.values()) p.restart();
      return;
    } else if (kata === "ota") { // Modul 28
      for (const p of perangkatBerjalan.values()) console.log(p.keadaanOta());
      return;
    } else if (kata === "server" && isian !== undefined) { // Modul 28: = perintah Serial "server <alamat>" Node 1 1.7.0
      const alamat = rapikanAlamat(isian);
      const salah = salahAlamatServer(alamat);
      if (salah !== "") {
        console.log(salah);
        return;
      }
      for (const id of perangkatBerjalan.keys()) arsip[id] = { ...arsip[id], alamat_server: alamat };
      simpanArsip();
      console.log(`Alamat server disimpan: ${alamat} (firmware hanya diunduh dari <alamat>/fw/node-1/...)`);
      return;
    } else {
      console.log("Ketik misalnya: suhu 33, suhu acak, tanah 25, tanah acak, tandon 15, tandon acak, kebun mulai, " +
        "kebun cabut, kebun pasang, restart, ota, atau server http://192.168.1.10 (tanah dan tandon: bilangan bulat 0-100)");
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
  console.log(`${adaKunci} perangkat palsu menuju ${ALAMAT_BROKER} (firmware tiruan bawaan ${FW_AWAL}). Ketik misalnya ` +
    `"suhu 33", "tanah 25", "tandon 15", "kebun mulai", "restart", atau "ota". Hentikan dengan Ctrl+C.`);
}
