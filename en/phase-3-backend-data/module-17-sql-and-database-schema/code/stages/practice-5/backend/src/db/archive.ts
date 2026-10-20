// archive.ts - writes the messages that passed the contract checks to the database.
// The in-memory store (store.ts) remains the "notice board" for the latest state; the database is its archive book.
import { pool } from "./pool.ts";
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

// Make sure the device has a row in the devices table (created if it isn't there yet), then update when it was last heard.
// Columns that aren't given (null) don't overwrite the old values, thanks to coalesce.
async function recordDevice(deviceId: string, kind: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id, kind, status, last_seen)
     VALUES ($1, coalesce($2, 'unknown'), coalesce($3, 'unknown'), now())
     ON CONFLICT (device_id) DO UPDATE SET
       kind = coalesce($2, devices.kind),
       status = coalesce($3, devices.status),
       last_seen = now()`,
    [deviceId, kind, status],
  );
}

// Stores one telemetry message. The result is false if a reading with the same ts is already stored (a duplicate send).
export async function archiveTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): Promise<boolean> {
  const n2 = "pressure" in content ? content : null; // Node 2 is recognized by the pressure column (contract 1.2), as in store.ts
  const n1 = "pressure" in content ? null : content; // otherwise, Node 1 telemetry
  await recordDevice(deviceId, n2 ? "node2" : "node1", null);
  const result = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level,
                           pressure, soil_temperature, battery, soil_rs485, ec)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, content.ts, content.fw, content.temperature, content.humidity, n1?.light ?? null, content.soil, n1?.motion ?? null,
      n1?.water_level ?? null, n2?.pressure ?? null, content.soil_temperature ?? null, n2?.battery ?? null,
      n1?.soil_rs485 ?? null, n1?.ec ?? null],
  );
  return result.rowCount === 1;
}

export async function archiveStatus(deviceId: string, status: Status): Promise<void> {
  await recordDevice(deviceId, null, status);
}

export async function archiveVitals(deviceId: string, content: Vitals): Promise<void> {
  await recordDevice(deviceId, null, null);
  await pool.query(
    `INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, content.ts, content.rssi, content.uptime_s, content.heap_free],
  );
}

// Can the database be reached right now? Used by GET /health.
export async function databaseAlive(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
