// store.ts - keeps the last state of every device in memory.
// The data is lost when the server stops; Module 17 replaces this with a database.
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

export interface Device {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  status: Status | "unknown";
  last_seen: string; // server time (UTC) when this device's last message arrived
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
}

const devices = new Map<string, Device>();
export const counts = { received: 0, rejected: 0 };

function getOrCreate(deviceId: string): Device {
  let d = devices.get(deviceId);
  if (d === undefined) {
    d = { device_id: deviceId, kind: "unknown", status: "unknown", last_seen: "", telemetry: null, vitals: null };
    devices.set(deviceId, d);
  }
  d.last_seen = new Date().toISOString();
  return d;
}

export function saveTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  const d = getOrCreate(deviceId);
  d.kind = "pressure" in content ? "node2" : "node1";
  d.telemetry = content;
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
