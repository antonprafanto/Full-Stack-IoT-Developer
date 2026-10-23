// mqtt.ts - the backend as an MQTT client: listens to msh/#, checks every message, stores it, and sends commands.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import type { Thresholds, SetCommand } from "../schemas/contract.ts";
import { findDevice, counts, deliverAck, saveStatus, saveTelemetry, saveVitals } from "./store.ts";
import { archiveStatus, archiveTelemetry, archiveVitals } from "../db/archive.ts";
import { broadcastStatus, broadcastTelemetry } from "./realtime.ts";
import { recordReport, deviceRestarted } from "./commands.ts";
import { sendAllConfigs, evaluateReading } from "./automation.ts";
import { recordEvent } from "./events.ts";
import { notify, notifyStatus } from "./telegram.ts";
import { recordIgnored, devicePermission } from "./registry.ts";

let client: mqtt.MqttClient | undefined;

const RETRY_NORMAL_MS = 5000; // broker down or network lost: retry every 5 seconds (like a device, contract section 3)
const RETRY_REJECTED_MS = 60_000; // Module 21: the broker REJECTS the backend account: retry slowly, so the broker log doesn't flood

// Module 21: the backend's own broker account (not a device account, not a human account), from MQTT_USERNAME/MQTT_PASSWORD
export interface BrokerAccount {
  username: string;
  password: string;
}

export function startMqtt(url: string, account: BrokerAccount | null, log: FastifyBaseLogger): void {
  const clientName = "backend-" + Math.random().toString(16).slice(2, 8); // a unique name; a locked broker uses its account name
  client = mqtt.connect(url, {
    clientId: clientName,
    reconnectPeriod: RETRY_NORMAL_MS,
    ...(account === null ? {} : { username: account.username, password: account.password }),
    reconnectOnConnackError: true, // Module 21: without this, once rejected by the broker = stop trying forever
  });
  let rejected = false; // currently rejected by the broker? (so the long message is written only once)
  client.on("connect", () => {
    if (client !== undefined) client.options.reconnectPeriod = RETRY_NORMAL_MS;
    rejected = false;
    log.info(`connected to broker ${url}${account === null ? " WITHOUT an account" : ` as ${account.username}`}`);
    client?.subscribe("msh/#", { qos: 1 });
    sendAllConfigs(); // Module 19: a broker without persistence forgets the retained config when restarted (contract rule 10)
  });
  client.on("reconnect", () => {
    if (!rejected) log.warn(`broker not reachable yet, retrying in ${RETRY_NORMAL_MS / 1000} seconds`);
  });
  client.on("error", (error) => {
    const code = (error as Error & { code?: number }).code;
    if (code === 4 || code === 5 || code === 134 || code === 135) { // CONNACK: account rejected (MQTT 3.1.1 and MQTT 5)
      if (client !== undefined) client.options.reconnectPeriod = RETRY_REJECTED_MS;
      if (!rejected) {
        log.error(`broker REJECTED the backend (${error.message}, code ${code}): ` + (account === null
          ? "the backend connected without an account, but the broker is already locked; fill in MQTT_USERNAME and MQTT_PASSWORD in .env"
          : `check MQTT_USERNAME and MQTT_PASSWORD in .env, the account "${account.username}" in the broker password file `
            + "(mosquitto_passwd), then reload the broker")
          + `. Retrying every ${RETRY_REJECTED_MS / 1000} seconds.`);
      }
      rejected = true;
      return;
    }
    log.error(`MQTT error: ${error.message}`);
  });
  // packet.retain = true: an old message the broker kept, sent again because the backend just subscribed (Module 19)
  client.on("message", (topic, content, packet) => receive(topic, content.toString(), packet.retain, log));
}

export function brokerConnected(): boolean {
  return client?.connected ?? false;
}

// Module 19: stopping gracefully — send DISCONNECT to the broker, then close the connection
export async function stopMqtt(): Promise<void> {
  await client?.endAsync();
}

function reject(topic: string, reason: string, log: FastifyBaseLogger): void {
  counts.rejected++;
  log.warn(`REJECTED ${topic}: ${reason}`);
}

// writing to the database failed (for example the database container was stopped): log it, but the server keeps running
function archiveFailed(topic: string, log: FastifyBaseLogger) {
  return (error: Error) => log.error(`couldn't save ${topic} to the database: ${error.message}`);
}

// summarize the list of issues from Zod, for example "humidity: Too big: expected number to be <=100"
export function summarize(error: ZodError): string {
  return error.issues.map((m) => `${m.path.join(".") || "content"}: ${m.message}`).join("; ");
}

function receive(topic: string, text: string, retained: boolean, log: FastifyBaseLogger): void {
  const parts = topic.split("/"); // ["msh", device_id, kind]
  if (parts.length !== 3) return reject(topic, "the topic must look like msh/<device_id>/<kind>", log);
  const [, deviceId, kind] = parts;
  if (!DeviceId.safeParse(deviceId).success) return reject(topic, "invalid device_id", log);
  if (kind === "cmd") return; // a command (from this backend or MQTTX), not device data
  // Module 21, second layer: only a device that is registered and whose key hasn't been revoked has its data processed
  const permission = devicePermission(deviceId);
  if (permission !== "registered") {
    counts.ignored++;
    return recordIgnored(topic, deviceId, permission, log);
  }

  if (kind === "status") {
    if (text === "") return; // an empty message = someone deleting a retained status (Module 11), not a new status
    const result = Status.safeParse(text);
    if (!result.success) return reject(topic, `unknown status "${text}"`, log);
    const previous = findDevice(deviceId)?.status;
    saveStatus(deviceId, result.data);
    const archiving = archiveStatus(deviceId, result.data);
    archiving.catch(archiveFailed(topic, log));
    if (result.data !== previous) { // Module 19: only changes are broadcast and recorded
      broadcastStatus(deviceId, result.data);
      if (!retained) { // a retained status when the backend starts = an old state, not a new event
        const message = result.data === "online" ? `${deviceId} back online` : `${deviceId} disconnected (${result.data})`;
        archiving.then(() => recordEvent({ device_id: deviceId, kind: "status", source: "device", rule_id: null, message }))
          .catch(() => {}); // a failure to save the status is already logged by archiveFailed
        notifyStatus(deviceId, result.data); // Telegram: offline is only reported once it lasts 60 seconds
      }
    }
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
    const content = result.data;
    saveTelemetry(deviceId, content);
    broadcastTelemetry(deviceId, content); // Module 19: passed on right away to the clients following this device
    if (!("pressure" in content)) recordReport(deviceId, content.state ?? null, content.ts); // Module 19: actuator state
    evaluateReading(deviceId, content); // Module 19: automation rules
    archiveTelemetry(deviceId, content)
      .then((isNew) => { if (!isNew) log.info(`duplicate skipped: ${deviceId} ${content.ts}`); })
      .catch(archiveFailed(topic, log));
  } else if (kind === "vitals") {
    const result = Vitals.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    const content = result.data;
    saveVitals(deviceId, content);
    // Module 19: the first vitals after the device starts carries a small uptime; all its relays have just turned off
    if (content.uptime_s < 60) deviceRestarted(deviceId, content.uptime_s);
    const archiving = archiveVitals(deviceId, content);
    archiving.catch(archiveFailed(topic, log));
    if (content.offline_s !== undefined) { // Module 19: the offline-mode report (contract 1.3)
      const message = `${deviceId} back from offline mode after ${content.offline_s} seconds; `
        + `local safety turned the fan on ${content.local_fan} time(s)`;
      log.warn(message);
      archiving.then(() => recordEvent({ device_id: deviceId, kind: "offline-report", source: "device", rule_id: null,
        message, data: { offline_s: content.offline_s, local_fan: content.local_fan } })).catch(() => {});
      void notify(`📶 ${message}`);
    }
  } else if (kind === "ack") {
    const result = Ack.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    recordReport(deviceId, result.data.state, result.data.ts); // Module 19: every valid ack updates the reported state
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

// Module 19: the thresholds of the local safety rules (contract 1.3 section 7). QoS 1 and retained: a device that has just
// started or just connected receives them as soon as it subscribes to cmd.
export function sendConfig(deviceId: string, commandId: string, thresholds: Thresholds): void {
  const cmd = { id: commandId, ts: new Date().toISOString().slice(0, 19) + "Z", action: "config", thresholds };
  client?.publish(`msh/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: true });
}
