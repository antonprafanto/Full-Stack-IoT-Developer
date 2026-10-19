// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/#, memeriksa setiap pesan, dan mengirim perintah.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import type { PerintahSet } from "../schemas/kontrak.ts";
import { hitungan, serahkanAck, simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";

let klien: mqtt.MqttClient | undefined;

export function mulaiMqtt(url: string, log: FastifyBaseLogger): void {
  const idKlien = "backend-" + Math.random().toString(16).slice(2, 8); // nama unik, bukan device_id
  klien = mqtt.connect(url, { clientId: idKlien, reconnectPeriod: 5000 });
  klien.on("connect", () => {
    log.info(`tersambung ke broker ${url}`);
    klien?.subscribe("rpm/#", { qos: 1 });
  });
  klien.on("reconnect", () => log.warn("broker belum terjangkau, mencoba lagi dalam 5 detik"));
  klien.on("error", (galat) => log.error(`galat MQTT: ${galat.message}`));
  klien.on("message", (topik, isi) => terima(topik, isi.toString(), log));
}

export function brokerTersambung(): boolean {
  return klien?.connected ?? false;
}

function tolak(topik: string, alasan: string, log: FastifyBaseLogger): void {
  hitungan.ditolak++;
  log.warn(`DITOLAK ${topik}: ${alasan}`);
}

// ringkas daftar masalah dari Zod, misalnya "kelembapan: Terlalu besar: diharapkan number menjadi <=100"
function ringkas(galat: ZodError): string {
  return galat.issues.map((m) => `${m.path.join(".") || "isi"}: ${m.message}`).join("; ");
}

function terima(topik: string, teks: string, log: FastifyBaseLogger): void {
  const bagian = topik.split("/"); // ["rpm", device_id, jenis]
  if (bagian.length !== 3) return tolak(topik, "topik harus berbentuk rpm/<device_id>/<jenis>", log);
  const [, deviceId, jenis] = bagian;
  if (!DeviceId.safeParse(deviceId).success) return tolak(topik, "device_id tidak sah", log);
  if (jenis === "cmd") return; // perintah (dari backend ini atau MQTTX), bukan data perangkat

  if (jenis === "status") {
    if (teks === "") return; // pesan kosong = seseorang menghapus status retained (Modul 11), bukan status baru
    const hasil = Status.safeParse(teks);
    if (!hasil.success) return tolak(topik, `status "${teks}" tidak dikenal`, log);
    simpanStatus(deviceId, hasil.data);
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
    simpanTelemetry(deviceId, hasil.data);
  } else if (jenis === "vitals") {
    const hasil = Vitals.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    simpanVitals(deviceId, hasil.data);
  } else if (jenis === "ack") {
    const hasil = Ack.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
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
