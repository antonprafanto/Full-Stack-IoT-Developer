// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/# dan menyimpan setiap pesan.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import { hitungan, simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";

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

function terima(topik: string, teks: string, log: FastifyBaseLogger): void {
  const bagian = topik.split("/"); // ["rpm", device_id, jenis]
  if (bagian.length !== 3) return;
  const [, deviceId, jenis] = bagian;
  if (jenis === "status") {
    simpanStatus(deviceId, teks);
  } else if (jenis === "telemetry" || jenis === "vitals") {
    let json: unknown;
    try {
      json = JSON.parse(teks);
    } catch {
      log.warn(`${topik}: isinya bukan JSON`);
      return;
    }
    if (jenis === "telemetry") simpanTelemetry(deviceId, json);
    else simpanVitals(deviceId, json);
  } else {
    return; // cmd dan ack menyusul di Praktik 6
  }
  hitungan.diterima++;
  log.info(`${topik} ${teks}`); // tampilkan setiap pesan (Praktik 4 menggantinya dengan pemeriksaan)
}
