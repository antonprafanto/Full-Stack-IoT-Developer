// store.ts - keeps the last state of every device in memory.
// The data is lost when the server stops; Module 17 replaces this with a database.
import type { Ack, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

export interface Device {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  status: Status | "unknown";
  last_seen: string; // server time (UTC) when this device's last message arrived
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
  history: (TelemetryNode1 | TelemetryNode2)[]; // at most the last 20 telemetry readings, the oldest first
}

const devices = new Map<string, Device>();
export const counts = { received: 0, rejected: 0 };

function getOrCreate(deviceId: string): Device {
  let d = devices.get(deviceId);
  if (d === undefined) {
    d = { device_id: deviceId, kind: "unknown", status: "unknown", last_seen: "", telemetry: null, vitals: null, history: [] };
    devices.set(deviceId, d);
  }
  d.last_seen = new Date().toISOString();
  return d;
}

export function saveTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  const d = getOrCreate(deviceId);
  d.kind = "pressure" in content ? "node2" : "node1";
  d.telemetry = content;
  d.history.push(content);
  if (d.history.length > 20) d.history.shift(); // drop the oldest
}

export function saveStatus(deviceId: string, status: Status): void {
  getOrCreate(deviceId).status = status;
}

export function saveVitals(deviceId: string, content: Vitals): void {
  getOrCreate(deviceId).vitals = content;
}

export function allDevices(): Device[] {
  return [...devices.values()];
}

export function findDevice(deviceId: string): Device | undefined {
  return devices.get(deviceId);
}

// Commands that are waiting for an ack, by command id.
const waiting = new Map<string, (ack: Ack) => void>();

export function waitForAck(commandId: string, timeoutMs: number): Promise<Ack | null> {
  return new Promise((done) => {
    const timer = setTimeout(() => {
      waiting.delete(commandId);
      done(null); // no answer before the time limit
    }, timeoutMs);
    waiting.set(commandId, (ack) => {
      clearTimeout(timer);
      waiting.delete(commandId);
      done(ack);
    });
  });
}

// Called when an ack arrives; false if no command is waiting for it.
export function deliverAck(ack: Ack): boolean {
  const deliver = waiting.get(ack.id);
  if (deliver === undefined) return false;
  deliver(ack);
  return true;
}
