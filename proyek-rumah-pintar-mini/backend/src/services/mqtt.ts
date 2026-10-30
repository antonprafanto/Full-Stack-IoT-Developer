// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/#, memeriksa setiap pesan, menyimpannya, dan mengirim perintah.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import type { Ambang, PerintahSet } from "../schemas/kontrak.ts";
import { cariPerangkat, hitungan, serahkanAck, simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";
import { arsipkanStatus, arsipkanTelemetry, arsipkanVitals } from "../db/arsip.ts";
import { siarkanStatus, siarkanTelemetry } from "./realtime.ts";
import { catatLaporan, perangkatMenyalaUlang } from "./perintah.ts";
import { kirimSemuaConfig, nilaiBacaan } from "./otomasi.ts";
import { catatKejadian } from "./kejadian.ts";
import { kabari, kabariStatus } from "./telegram.ts";
import { catatAbaikan, izinPerangkat } from "./daftar.ts";

let klien: mqtt.MqttClient | undefined;

const JEDA_BIASA_MS = 5000; // broker mati atau jaringan putus: coba lagi setiap 5 detik (seperti perangkat, kontrak bagian 3)
const JEDA_DITOLAK_MS = 60_000; // Modul 21: broker MENOLAK akun backend: coba lagi pelan-pelan, supaya log broker tidak banjir

// Modul 21: akun broker milik backend sendiri (bukan akun perangkat, bukan akun manusia), dari MQTT_USERNAME/MQTT_PASSWORD
export interface AkunBroker {
  username: string;
  password: string;
}

export function mulaiMqtt(url: string, akun: AkunBroker | null, log: FastifyBaseLogger): void {
  // Nama klien: tanpa akun = nama acak (broker lama tanpa kunci). Dengan akun = nama akun itu sendiri (Modul 27), sama dengan
  // yang dipakai broker berkunci (use_username_as_clientid), supaya sesi tetap di bawah selalu sesi yang sama.
  const idKlien = akun === null ? "backend-" + Math.random().toString(16).slice(2, 8) : akun.username;
  klien = mqtt.connect(url, {
    clientId: idKlien,
    reconnectPeriod: JEDA_BIASA_MS,
    ...(akun === null ? {} : { username: akun.username, password: akun.password }),
    reconnectOnConnackError: true, // Modul 21: tanpa ini, sekali ditolak broker = berhenti mencoba selamanya
    // Modul 27: sesi TETAP bila masuk dengan akun (nama klien = nama akun, jadi sesinya selalu sama).
    // Broker pusat mengingat langganan backend dan MENAHAN pesan QoS 1 (antara lain antrean jembatan Pi) selama backend
    // belum tersambung: beberapa detik sesudah broker pusat dinyalakan ulang, atau saat backend sendiri dibuat ulang.
    // Sesi bersih = pesan yang tiba sebelum backend berlangganan lagi hilang. Tanpa akun (nama klien acak): tetap bersih.
    clean: akun === null,
  });
  let ditolak = false; // sedang ditolak broker? (supaya pesan panjangnya hanya ditulis sekali)
  klien.on("connect", () => {
    if (klien !== undefined) klien.options.reconnectPeriod = JEDA_BIASA_MS;
    ditolak = false;
    log.info(`tersambung ke broker ${url}${akun === null ? " TANPA akun" : ` sebagai ${akun.username}`}`);
    klien?.subscribe("rpm/#", { qos: 1 });
    kirimSemuaConfig(); // Modul 19: broker tanpa persistence lupa config retained saat dimulai ulang (kontrak aturan 10)
  });
  klien.on("reconnect", () => {
    if (!ditolak) log.warn(`broker belum terjangkau, mencoba lagi dalam ${JEDA_BIASA_MS / 1000} detik`);
  });
  klien.on("error", (galat) => {
    const kode = (galat as Error & { code?: number }).code;
    if (kode === 4 || kode === 5 || kode === 134 || kode === 135) { // CONNACK: akun ditolak (MQTT 3.1.1 dan MQTT 5)
      if (klien !== undefined) klien.options.reconnectPeriod = JEDA_DITOLAK_MS;
      if (!ditolak) {
        log.error(`broker MENOLAK backend (${galat.message}, kode ${kode}): ` + (akun === null
          ? "backend masuk tanpa akun, padahal broker sudah dikunci; isi MQTT_USERNAME dan MQTT_PASSWORD di .env"
          : `periksa MQTT_USERNAME dan MQTT_PASSWORD di .env, akun "${akun.username}" di password file broker `
            + "(mosquitto_passwd), lalu muat ulang broker")
          + `. Dicoba lagi setiap ${JEDA_DITOLAK_MS / 1000} detik.`);
      }
      ditolak = true;
      return;
    }
    log.error(`galat MQTT: ${galat.message}`);
  });
  // paket.retain = true: pesan lama yang disimpan broker, dikirim ulang karena backend baru berlangganan (Modul 19)
  klien.on("message", (topik, isi, paket) => terima(topik, isi.toString(), paket.retain, log));
}

export function brokerTersambung(): boolean {
  return klien?.connected ?? false;
}

// Modul 19: berhenti dengan rapi — kirim DISCONNECT ke broker lalu tutup sambungan
export async function hentikanMqtt(): Promise<void> {
  await klien?.endAsync();
}

function tolak(topik: string, alasan: string, log: FastifyBaseLogger): void {
  hitungan.ditolak++;
  log.warn(`DITOLAK ${topik}: ${alasan}`);
}

// gagal menulis ke database (misalnya kontainer database dimatikan): catat di log, tetapi server tetap berjalan
function gagalArsip(topik: string, log: FastifyBaseLogger) {
  return (galat: Error) => log.error(`gagal menyimpan ${topik} ke database: ${galat.message}`);
}

// ringkas daftar masalah dari Zod, misalnya "kelembapan: Terlalu besar: diharapkan number menjadi <=100"
export function ringkas(galat: ZodError): string {
  return galat.issues.map((m) => `${m.path.join(".") || "isi"}: ${m.message}`).join("; ");
}

function terima(topik: string, teks: string, retained: boolean, log: FastifyBaseLogger): void {
  const bagian = topik.split("/"); // ["rpm", device_id, jenis]
  if (bagian.length !== 3) return tolak(topik, "topik harus berbentuk rpm/<device_id>/<jenis>", log);
  const [, deviceId, jenis] = bagian;
  if (!DeviceId.safeParse(deviceId).success) return tolak(topik, "device_id tidak sah", log);
  if (jenis === "cmd") return; // perintah (dari backend ini atau MQTTX), bukan data perangkat
  // Modul 21, lapis kedua: hanya perangkat yang terdaftar dan kuncinya belum dicabut yang datanya diproses
  const izin = izinPerangkat(deviceId);
  if (izin !== "terdaftar") {
    hitungan.diabaikan++;
    return catatAbaikan(topik, deviceId, izin, log);
  }

  if (jenis === "status") {
    if (teks === "") return; // pesan kosong = seseorang menghapus status retained (Modul 11), bukan status baru
    const hasil = Status.safeParse(teks);
    if (!hasil.success) return tolak(topik, `status "${teks}" tidak dikenal`, log);
    const sebelumnya = cariPerangkat(deviceId)?.status;
    simpanStatus(deviceId, hasil.data);
    const arsip = arsipkanStatus(deviceId, hasil.data);
    arsip.catch(gagalArsip(topik, log));
    if (hasil.data !== sebelumnya) { // Modul 19: hanya perubahan yang disiarkan dan dicatat
      siarkanStatus(deviceId, hasil.data);
      if (!retained) { // status retained saat backend menyala = keadaan lama, bukan kejadian baru
        const pesan = hasil.data === "online" ? `${deviceId} tersambung lagi (online)` : `${deviceId} terputus (${hasil.data})`;
        arsip.then(() => catatKejadian({ device_id: deviceId, jenis: "status", sumber: "perangkat", aturan_id: null, pesan }))
          .catch(() => {}); // gagal menyimpan status sudah dicatat gagalArsip
        kabariStatus(deviceId, hasil.data); // Telegram: offline baru dikabarkan kalau bertahan 60 detik
      } else if (hasil.data === "online") {
        // Modul 25: "online" retained tetap membatalkan 📴 yang sedang menunggu. Sesudah broker dimulai ulang, perangkat bisa
        // tersambung LEBIH DULU dari backend, jadi kabar online-nya tiba sebagai pesan retained (tanpa ini: 📴 palsu)
        kabariStatus(deviceId, "online");
      }
    }
    hitungan.diterima++;
    return;
  }

  let json: unknown;
  try {
    json = JSON.parse(teks);
  } catch {
    return tolak(topik, "isinya bukan JSON", log);
  }

  if (jenis === "telemetry") {
    const punyaTekanan = typeof json === "object" && json !== null && "tekanan" in json;
    const hasil = (punyaTekanan ? TelemetryNode2 : TelemetryNode1).safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    const isi = hasil.data;
    simpanTelemetry(deviceId, isi);
    siarkanTelemetry(deviceId, isi); // Modul 19: langsung diteruskan ke klien yang mengikuti perangkat ini
    if (!("tekanan" in isi)) catatLaporan(deviceId, isi.state ?? null, isi.ts); // Modul 19: keadaan aktuator (kontrak 1.3)
    nilaiBacaan(deviceId, isi); // Modul 19: aturan otomatis
    arsipkanTelemetry(deviceId, isi)
      .then((baru) => { if (!baru) log.info(`kiriman ganda dilewati: ${deviceId} ${isi.ts}`); })
      .catch(gagalArsip(topik, log));
  } else if (jenis === "vitals") {
    const hasil = Vitals.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    const isi = hasil.data;
    simpanVitals(deviceId, isi);
    // Modul 19: vitals pertama sesudah perangkat menyala membawa uptime kecil; semua relay-nya baru saja padam
    if (isi.uptime_s < 60) perangkatMenyalaUlang(deviceId, isi.uptime_s);
    const arsip = arsipkanVitals(deviceId, isi);
    arsip.catch(gagalArsip(topik, log));
    if (isi.offline_s !== undefined) { // Modul 19: laporan mode offline (kontrak 1.3)
      const pesan = `${deviceId} kembali dari mode offline setelah ${isi.offline_s} detik; `
        + `pengaman lokal menyalakan kipas ${isi.kipas_lokal} kali`;
      log.warn(pesan);
      arsip.then(() => catatKejadian({ device_id: deviceId, jenis: "mode-offline", sumber: "perangkat", aturan_id: null,
        pesan, data: { offline_s: isi.offline_s, kipas_lokal: isi.kipas_lokal } })).catch(() => {});
      void kabari(`📶 ${pesan}`);
    }
  } else if (jenis === "ack") {
    const hasil = Ack.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    catatLaporan(deviceId, hasil.data.state, hasil.data.ts); // Modul 19: setiap ack sah memperbarui keadaan yang dilaporkan
    if (!serahkanAck(hasil.data)) log.info(`ack ${hasil.data.id} tiba, tetapi tidak ada perintah yang menunggunya`);
  } else {
    return tolak(topik, `jenis pesan "${jenis}" tidak ada di kontrak`, log);
  }
  hitungan.diterima++;
}

let urutan = 0;

// id perintah: c-<tanggal>-<jam UTC>-<nomor urut>, misalnya c-20261019-041008-1 (paling panjang 39 huruf, kontrak
// bagian 7). Jam ikut ditulis supaya id tetap unik setelah server dimulai ulang: perangkat mengabaikan id yang pernah ia
// kerjakan (kontrak aturan 8), jadi id kembar = perintah yang diam-diam tidak dikerjakan.
export function buatIdPerintah(): string {
  urutan = (urutan % 99) + 1;
  const waktu = new Date().toISOString(); // 2026-10-19T04:10:08.123Z
  const tanggal = waktu.slice(0, 10).replaceAll("-", "");
  const jam = waktu.slice(11, 19).replaceAll(":", "");
  return `c-${tanggal}-${jam}-${urutan}`;
}

export function kirimPerintah(deviceId: string, idPerintah: string, perintah: PerintahSet): void {
  const cmd = {
    id: idPerintah,
    ts: new Date().toISOString().slice(0, 19) + "Z",
    aksi: "set",
    target: perintah.target,
    nilai: perintah.nilai,
  };
  klien?.publish(`rpm/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: false }); // set TIDAK PERNAH retained
}

// Modul 19: ambang aturan pengaman lokal (kontrak 1.3 bagian 7). QoS 1 dan retained: perangkat yang baru menyala atau
// baru tersambung langsung menerimanya begitu berlangganan cmd.
export function kirimConfig(deviceId: string, idPerintah: string, ambang: Ambang): void {
  const cmd = { id: idPerintah, ts: new Date().toISOString().slice(0, 19) + "Z", aksi: "config", ambang };
  klien?.publish(`rpm/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: true });
}
