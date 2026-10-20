// mqtt.ts - the backend as an MQTT client: listens to msh/# and checks every message against the data contract.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
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

function reject(topic: string, reason: string, log: FastifyBaseLogger): void {
  counts.rejected++;
  log.warn(`REJECTED ${topic}: ${reason}`);
}

// summarize the list of issues from Zod, for example "humidity: Too big: expected number to be <=100"
function summarize(error: ZodError): string {
  return error.issues.map((m) => `${m.path.join(".") || "content"}: ${m.message}`).join("; ");
}

function receive(topic: string, text: string, log: FastifyBaseLogger): void {
  const parts = topic.split("/"); // ["msh", device_id, kind]
  if (parts.length !== 3) return reject(topic, "the topic must look like msh/<device_id>/<kind>", log);
  const [, deviceId, kind] = parts;
  if (!DeviceId.safeParse(deviceId).success) return reject(topic, "invalid device_id", log);
  if (kind === "cmd") return; // a command (from this backend or MQTTX), not device data

  if (kind === "status") {
    if (text === "") return; // an empty message = someone deleting a retained status (Module 11), not a new status
    const result = Status.safeParse(text);
    if (!result.success) return reject(topic, `unknown status "${text}"`, log);
    saveStatus(deviceId, result.data);
    counts.received++;
    return;
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return reject(topic, "the content isn't JSON", log);
  }

  if (kind === "telemetry") {
    const hasPressure = typeof json === "object" && json !== null && "pressure" in json;
    const result = (hasPressure ? TelemetryNode2 : TelemetryNode1).safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    saveTelemetry(deviceId, result.data);
  } else if (kind === "vitals") {
    const result = Vitals.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    saveVitals(deviceId, result.data);
  } else if (kind === "ack") {
    const result = Ack.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    log.info(`ack ${result.data.id} arrived (ok=${result.data.ok})`); // Practice 6 hands it over to the waiting command
  } else {
    return reject(topic, `message kind "${kind}" isn't in the contract`, log);
  }
  counts.received++;
}
