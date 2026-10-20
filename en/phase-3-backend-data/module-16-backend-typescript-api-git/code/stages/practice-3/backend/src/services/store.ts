// store.ts - keeps the last state of every device in memory.
// The data is lost when the server stops; Module 17 replaces this with a database.

export interface Device {
  device_id: string;
  status: string;
  last_seen: string; // server time (UTC) when this device's last message arrived
  telemetry: unknown; // not checked at all yet (Practice 4 adds the checks)
  vitals: unknown;
}

const devices = new Map<string, Device>();
export const counts = { received: 0, rejected: 0 };

function getOrCreate(deviceId: string): Device {
  let d = devices.get(deviceId);
  if (d === undefined) {
    d = { device_id: deviceId, status: "unknown", last_seen: "", telemetry: null, vitals: null };
    devices.set(deviceId, d);
  }
  d.last_seen = new Date().toISOString();
  return d;
}

export function saveTelemetry(deviceId: string, content: unknown): void {
  getOrCreate(deviceId).telemetry = content;
}

export function saveStatus(deviceId: string, status: string): void {
  getOrCreate(deviceId).status = status;
}

export function saveVitals(deviceId: string, content: unknown): void {
  getOrCreate(deviceId).vitals = content;
}

export function allDevices(): Device[] {
  return [...devices.values()];
}

export function findDevice(deviceId: string): Device | undefined {
  return devices.get(deviceId);
}
