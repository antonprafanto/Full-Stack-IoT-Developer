// registry.ts - the device "guest book" in memory (Module 21): who is registered and who has been revoked.
// It is loaded from the devices table when the server starts, then updated by the registration, key-rotation, and revoke
// routes, so the backend doesn't have to ask the database for every message.
// This guest book is the SECOND LAYER: the broker (password file + ACL) is the first. If the broker is forgotten to be
// reloaded after a key is revoked, or the broker password file and the database don't match, the backend still ignores
// messages from a device that isn't allowed (mqtt.ts) and doesn't send commands to it (commands.ts).
import type { FastifyBaseLogger } from "fastify";
import type { DeviceRow } from "../db/devices.ts";

export type Permission = "registered" | "unregistered" | "revoked" | "not-loaded";

interface Entry {
  revoked: boolean;
}

const registry = new Map<string, Entry>(); // only registered devices (active or revoked)
let loaded = false;

// a pure decision (tested with Vitest): whether a device may be served
export function permissionOf(isLoaded: boolean, entry: Entry | undefined): Permission {
  if (!isLoaded) return "not-loaded"; // the registry hasn't been read from the database: don't trust anyone yet
  if (entry === undefined) return "unregistered";
  return entry.revoked ? "revoked" : "registered";
}

export function devicePermission(deviceId: string): Permission {
  return permissionOf(loaded, registry.get(deviceId));
}

export function loadRegistry(rows: Pick<DeviceRow, "device_id" | "registered_at" | "revoked_at">[]): number {
  registry.clear();
  for (const r of rows) if (r.registered_at !== null) registry.set(r.device_id, { revoked: r.revoked_at !== null });
  loaded = true;
  return registry.size;
}

export function recordRegistered(deviceId: string): void {
  registry.set(deviceId, { revoked: false });
}

export function recordRevoked(deviceId: string): void {
  registry.set(deviceId, { revoked: true });
}

// ---- ignored messages: logged, but at most once a minute per device (an unregistered device sends telemetry every 10
// seconds; the log must not drown in it) ----
export const LOG_GAP_MS = 60_000;
const lastLogged = new Map<string, { time: number; missed: number }>();

const REASON: Record<Exclude<Permission, "registered">, string> = {
  "unregistered": "is not registered (register it first with POST /devices)",
  "revoked": "its key has been revoked",
  "not-loaded": "the device registry hasn't been read from the database yet",
};

// The result is the log line, or null if we're still inside the gap (pure logic, tested with Vitest)
export function ignoredLine(topic: string, deviceId: string, permission: Exclude<Permission, "registered">, now: number): string | null {
  const entry = lastLogged.get(deviceId);
  if (entry !== undefined && now - entry.time < LOG_GAP_MS) {
    entry.missed++;
    return null;
  }
  const extra = entry !== undefined && entry.missed > 0 ? ` (+${entry.missed} more messages since the last log)` : "";
  lastLogged.set(deviceId, { time: now, missed: 0 });
  return `IGNORED ${topic}: ${deviceId} ${REASON[permission]}${extra}`;
}

export function recordIgnored(topic: string, deviceId: string, permission: Exclude<Permission, "registered">, log: FastifyBaseLogger): void {
  const line = ignoredLine(topic, deviceId, permission, Date.now());
  if (line !== null) log.warn(line);
}
