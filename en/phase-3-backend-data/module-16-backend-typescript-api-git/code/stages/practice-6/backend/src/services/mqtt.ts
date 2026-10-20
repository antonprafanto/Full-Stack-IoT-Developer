// mqtt.ts - the backend as an MQTT client: listens to msh/#, checks every message, and sends commands.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import type { SetCommand } from "../schemas/contract.ts";
import { counts, deliverAck, saveStatus, saveTelemetry, saveVitals } from "./store.ts";

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
    if (!deliverAck(result.data)) log.info(`ack ${result.data.id} arrived, but no command is waiting for it`);
  } else {
    return reject(topic, `message kind "${kind}" isn't in the contract`, log);
  }
  counts.received++;
}

let sequence = 0;

// command id: c-<date>-<UTC time>-<sequence number>, for example c-20261019-041008-1 (39 characters at most, contract
// section 7). The time is included so that ids stay unique after a server restart: a device ignores an id it has
// already carried out (contract rule 8), so a duplicate id = a command that is silently not carried out.
export function makeCommandId(): string {
  sequence = (sequence % 99) + 1;
  const time = new Date().toISOString(); // 2026-10-19T04:10:08.123Z
  const date = time.slice(0, 10).replaceAll("-", "");
  const clock = time.slice(11, 19).replaceAll(":", "");
  return `c-${date}-${clock}-${sequence}`;
}

export function sendCommand(deviceId: string, commandId: string, command: SetCommand): void {
  const cmd = {
    id: commandId,
    ts: new Date().toISOString().slice(0, 19) + "Z",
    action: "set",
    target: command.target,
    value: command.value,
  };
  client?.publish(`msh/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: false }); // set is NEVER retained
}
