// simulator-perangkat.js — sepuluh "Node 1" palsu yang berbicara MQTT persis menurut kontrak data (Lampiran A).
// Modul 16 - Praktik 7. Gunanya: mengembangkan dan menguji backend tanpa hardware dan tanpa Wokwi.
//
// Cara pakai (dari terminal, di folder alat):
//   node simulator-perangkat.js mqtt://192.168.1.37:1883            -> 10 perangkat palsu
//   node simulator-perangkat.js mqtt://192.168.1.37:1883 3          -> 3 perangkat palsu
//   node simulator-perangkat.js mqtt://192.168.1.37:1883 bersihkan  -> hapus status retained perangkat palsu
// Hentikan dengan Ctrl+C: broker lalu menerbitkan wasiat "offline" setiap perangkat palsu.

import mqtt from "mqtt";
import { buatTelemetri } from "./generate-dummy.js";

const ALAMAT_BROKER = process.argv[2] || "mqtt://127.0.0.1:1883";
const JUMLAH = Number(process.argv[3]) || 10;

// device_id palsu: 12 digit heksadesimal huruf kecil, diawali f00d supaya mudah dikenali
function buatDeviceId(nomor) {
  return "f00d" + String(nomor).padStart(8, "0");
}

// waktu UTC tanpa milidetik, seperti ts di kontrak data: 2026-10-19T04:14:28Z
function waktuSekarang() {
  return new Date().toISOString().slice(0, 19) + "Z";
}

function jalankanPerangkat(deviceId) {
  const topik = (jenis) => `rpm/${deviceId}/${jenis}`;
  const mulai = Date.now();
  const keadaan = { kipas: false, lampu: false, pompa: false, tirai: 90 };
  const idTerakhir = []; // id perintah yang sudah dikerjakan (kontrak aturan 8)

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
    };
    klien.publish(topik("vitals"), JSON.stringify(vitals));
  }

  klien.on("connect", () => {
    klien.publish(topik("status"), "online", { qos: 1, retain: true });
    klien.subscribe(topik("cmd"), { qos: 1 });
    kirimVitals();
    console.log(`${deviceId}: online`);
  });
  setInterval(() => {
    if (klien.connected) kirimVitals();
  }, 5 * 60 * 1000);

  klien.on("message", (_topik, isi) => {
    let cmd;
    try {
      cmd = JSON.parse(isi.toString());
    } catch {
      return; // bukan JSON: tidak bisa dijawab (kontrak aturan 4)
    }
    if (typeof cmd.id !== "string" || cmd.id.length > 39) return;
    if (idTerakhir.includes(cmd.id)) return; // id yang sama hanya dikerjakan sekali
    idTerakhir.push(cmd.id);
    if (idTerakhir.length > 8) idTerakhir.shift();

    let pesan = "";
    if (cmd.aksi !== "set") pesan = `aksi ${cmd.aksi} belum didukung`;
    else if (cmd.target === "lampu" || cmd.target === "kipas") {
      if (typeof cmd.nilai === "boolean") keadaan[cmd.target] = cmd.nilai;
      else pesan = `nilai ${cmd.target} harus true atau false`;
    } else if (cmd.target === "pompa") {
      if (Number.isInteger(cmd.nilai) && cmd.nilai >= 1 && cmd.nilai <= 10) {
        keadaan.pompa = true;
        setTimeout(() => (keadaan.pompa = false), cmd.nilai * 1000);
      } else pesan = "nilai pompa harus 1-10 detik";
    } else if (cmd.target === "tirai") {
      if (Number.isInteger(cmd.nilai) && cmd.nilai >= 0 && cmd.nilai <= 180) keadaan.tirai = cmd.nilai;
      else pesan = "nilai tirai harus 0-180 derajat";
    } else pesan = `target ${cmd.target} tidak dikenal`;

    const ack = { id: cmd.id, ts: waktuSekarang(), ok: pesan === "", state: { ...keadaan } };
    if (pesan !== "") ack.pesan = pesan;
    klien.publish(topik("ack"), JSON.stringify(ack));
    console.log(`${deviceId}: perintah ${cmd.id} -> ok=${ack.ok}`);
  });

  // telemetry setiap 10 detik (kontrak aturan 3), mulai pada detik acak supaya tidak serentak
  const kirimTelemetry = () => {
    if (klien.connected) klien.publish(topik("telemetry"), JSON.stringify(buatTelemetri()));
  };
  setTimeout(() => {
    kirimTelemetry(); // kiriman pertama langsung pada detik acak itu
    setInterval(kirimTelemetry, 10000);
  }, Math.random() * 10000);
}

// bersihkan: terbitkan pesan kosong ber-retain ke topik status setiap perangkat palsu, supaya broker
// melupakan status "offline" mereka (cara menghapus pesan retained, Modul 11), lalu selesai.
// Dulu menjalankan lebih dari 10 perangkat? Tambahkan jumlahnya: ... bersihkan 20
async function bersihkan(jumlah) {
  try {
    const klien = await mqtt.connectAsync(ALAMAT_BROKER);
    for (let i = 1; i <= jumlah; i++) {
      await klien.publishAsync(`rpm/${buatDeviceId(i)}/status`, "", { qos: 1, retain: true });
    }
    await klien.endAsync();
    console.log(`Status ${jumlah} perangkat palsu sudah dihapus dari broker.`);
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
  console.log(`${JUMLAH} perangkat palsu menuju ${ALAMAT_BROKER}. Hentikan dengan Ctrl+C.`);
}
