// mqtt.ts - the backend as an MQTT client: listens to msh/# and stores every message.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import { counts, saveStatus, saveTelemetry, saveVitals } from "./store.ts";

let client: mqtt.MqttClient | undefined;

export function startMqtt(url: string, log: FastifyBaseLogger): void {
  const clientName = "backend-" + Math.random().toString(16).slice(2, 8); // a unique name, not a device_id
  client = mqtt.connect(url, { clientId: clientName, reconnectPeriod: 5000 });
  client.on("connect", () => {
    log.info(`connected to broker ${url}`);
    client?.subscribe("msh/#", { qos: 1 });
  });
  client.on("reconnect", () => log.warn("broker not reachable yet, retrying in 5 seconds"));
  client.on("error", (error) => log.error(`MQTT error: ${error.message}`));
  client.on("message", (topic, content) => receive(topic, content.toString(), log));
}

export function brokerConnected(): boolean {
  return client?.connected ?? false;
}

function receive(topic: string, text: string, log: FastifyBaseLogger): void {
  const parts = topic.split("/"); // ["msh", device_id, kind]
  if (parts.length !== 3) return;
  const [, deviceId, kind] = parts;
  if (kind === "status") {
    saveStatus(deviceId, text);
  } else if (kind === "telemetry" || kind === "vitals") {
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      log.warn(`${topic}: the content isn't JSON`);
      return;
    }
    if (kind === "telemetry") saveTelemetry(deviceId, json);
    else saveVitals(deviceId, json);
  } else {
    return; // cmd and ack come in Practice 6
  }
  counts.received++;
  log.info(`${topic} ${text}`); // show every message (Practice 4 replaces this with checks)
}
