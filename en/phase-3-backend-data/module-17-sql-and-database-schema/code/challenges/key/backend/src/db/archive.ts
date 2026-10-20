// archive.ts - writes the messages that passed the contract checks to the database, and reads them back for the history API.
// The in-memory store (store.ts) remains the "notice board" for the latest state; the database is its archive book.
import { pool } from "./pool.ts";
import type { Ack, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

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

// One command from the API with its result: the ack (ok or refused), or null if no ack came within 5 seconds.
export async function archiveCommand(commandId: string, deviceId: string, command: SetCommand, sentAt: Date,
  ack: Ack | null, waitMs: number): Promise<void> {
  await pool.query(
    `INSERT INTO commands (id, device_id, sent_at, target, value, ack_ok, ack_message, wait_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [commandId, deviceId, sentAt, command.target, JSON.stringify(command.value), ack?.ok ?? null,
      ack?.message ?? null, waitMs],
  );
}

// A time in the data contract format (UTC, without milliseconds), for example 2026-10-20T03:10:00Z
export const contractTime = (time: Date) => time.toISOString().slice(0, 19) + "Z";

// The shape of one readings row read through pg: a timestamptz becomes a JavaScript Date object.
interface ReadingRow {
  ts: Date;
  fw: string;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  soil: number | null;
  motion: boolean | null;
  water_level: number | null;
  pressure: number | null;
  soil_temperature: number | null;
  battery: number | null;
  soil_rs485: number | null;
  ec: number | null;
}

const MAX_READINGS = 1000; // at most 1,000 readings per request

// The reading history of one device in the range [from, to), oldest first. It asks for 1,001 rows to find out
// whether there are really more than 1,000: then the answer is cut off, and truncated is true.
export async function getHistory(deviceId: string, from: Date, to: Date) {
  const result = await pool.query<ReadingRow>(
    `SELECT ts, fw, temperature, humidity, light, soil, motion, water_level, pressure, soil_temperature, battery, soil_rs485, ec
     FROM readings
     WHERE device_id = $1 AND ts >= $2 AND ts < $3
     ORDER BY ts
     LIMIT $4`,
    [deviceId, from, to, MAX_READINGS + 1],
  );
  const readings = result.rows.slice(0, MAX_READINGS).map((row) => ({ ...row, ts: contractTime(row.ts) })); // ts as text
  return { readings, truncated: result.rows.length > MAX_READINGS };
}

// The shape of one commands row read through pg (Challenge Level 2)
interface CommandRow {
  id: string;
  sent_at: Date;
  target: string;
  value: boolean | number;
  ack_ok: boolean | null;
  ack_message: string | null;
  wait_ms: number | null;
}

// The last 20 commands of one device, newest first (Challenge Level 2)
export async function getCommands(deviceId: string) {
  const result = await pool.query<CommandRow>(
    `SELECT id, sent_at, target, value, ack_ok, ack_message, wait_ms
     FROM commands
     WHERE device_id = $1
     ORDER BY sent_at DESC
     LIMIT 20`,
    [deviceId],
  );
  return result.rows.map((row) => ({ ...row, sent_at: contractTime(row.sent_at) }));
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
