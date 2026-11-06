// store.ts - keeps the last state of every device in memory.
// This data is lost when the server stops; its permanent copy is saved to the database by archive.ts (Module 17).
import type { Ack, State, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

export interface Device {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  status: Status | "unknown";
  last_seen: string; // server time (UTC) when this device's last message arrived
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
  reported: State | null; // Module 19: the actuator state the device reported last (telemetry.state or ack.state)
  reported_ts: string | null; // Module 19: the ts of that report, by the device's clock
  reported_at: string | null; // Module 19: server time (UTC) when that report arrived
}

const devices = new Map<string, Device>();
export const counts = { received: 0, rejected: 0, ignored: 0 }; // Module 21: ignored = sender not registered/revoked

function getOrCreate(deviceId: string): Device {
  let d = devices.get(deviceId);
  if (d === undefined) {
    d = {
      device_id: deviceId, kind: "unknown", status: "unknown", last_seen: "", telemetry: null,
      vitals: null, reported: null, reported_ts: null, reported_at: null,
    };
    devices.set(deviceId, d);
  }
  d.last_seen = new Date().toISOString();
  return d;
}

// Module 19: save a report of the actuator state, unless that report is older than the one already stored (device ts).
// Times in the contract format (2026-10-21T06:10:12Z) can be compared directly as text. The result is true if it is used.
export function saveReport(deviceId: string, state: State, ts: string | null): boolean {
  const d = getOrCreate(deviceId);
  if (ts !== null && d.reported_ts !== null && ts < d.reported_ts) return false;
  d.reported = state;
  d.reported_ts = ts ?? d.reported_ts; // ack.ts may be null (the device's clock isn't set yet)
  d.reported_at = new Date().toISOString();
  return true;
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
