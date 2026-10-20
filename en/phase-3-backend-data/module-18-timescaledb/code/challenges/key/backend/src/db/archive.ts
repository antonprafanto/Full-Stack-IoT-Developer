// archive.ts - writes the messages that passed the contract checks to the database, and reads them back for the history API
// (raw readings, or their summary per 15 minutes, per hour, and per day).
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

// The bucket sizes that the history API accepts: 15 minutes, 1 hour, 6 hours, or 1 day.
export type Bucket = "15m" | "1h" | "6h" | "1d";

// One summary point: the average, the lowest, and the highest within one bucket, with the number of readings in it.
interface SummaryRow {
  time: Date; // the start of the bucket
  avg_temp: number | null;
  min_temp: number | null;
  max_temp: number | null;
  avg_humidity: number | null;
  avg_soil: number | null;
  avg_light: number | null;
  reading_count: number;
}

// One fixed query for every bucket size. Text from the user is never glued into the SQL: what gets chosen is only
// one of these three queries. The numbers are cast to float8 and int so that pg sends them as numbers, not as text.
const SUMMARY_QUERIES: Record<Bucket, string> = {
  // per 15 minutes: computed directly from the raw readings in the readings hypertable (the range is short)
  "15m": `SELECT time_bucket('15 minutes', ts) AS time,
            round(avg(temperature)::numeric, 1)::float8 AS avg_temp,
            min(temperature)                            AS min_temp,
            max(temperature)                            AS max_temp,
            round(avg(humidity)::numeric, 1)::float8    AS avg_humidity,
            round(avg(soil)::numeric, 1)::float8        AS avg_soil,
            round(avg(light)::numeric, 1)::float8       AS avg_light,
            count(*)::int                               AS reading_count
          FROM readings
          WHERE device_id = $1 AND ts >= $2 AND ts < $3
          GROUP BY time
          ORDER BY time`,
  // per hour: read from the summary book readings_hourly (continuous aggregate, migration 003)
  "1h": `SELECT hour AS time,
           round(avg_temp::numeric, 1)::float8 AS avg_temp,
           min_temp,
           max_temp,
           round(avg_humidity, 1)::float8      AS avg_humidity,
           round(avg_soil, 1)::float8          AS avg_soil,
           round(avg_light, 1)::float8         AS avg_light,
           reading_count::int                  AS reading_count
         FROM readings_hourly
         WHERE device_id = $1 AND hour >= $2 AND hour < $3
         ORDER BY hour`,
  // per 6 WIB hours (Challenge Level 2): the hourly summaries combined per 6 hours with the same formula as 1d,
  // so the buckets start at 00:00, 06:00, 12:00, and 18:00 WIB
  "6h": `SELECT time_bucket('6 hours', hour, 'Asia/Jakarta') AS time,
           round((sum(avg_temp * temp_n) / nullif(sum(temp_n), 0))::numeric, 1)::float8  AS avg_temp,
           min(min_temp)                                                                 AS min_temp,
           max(max_temp)                                                                 AS max_temp,
           round(sum(avg_humidity * humidity_n) / nullif(sum(humidity_n), 0), 1)::float8 AS avg_humidity,
           round(sum(avg_soil * soil_n) / nullif(sum(soil_n), 0), 1)::float8             AS avg_soil,
           round(sum(avg_light * light_n) / nullif(sum(light_n), 0), 1)::float8          AS avg_light,
           sum(reading_count)::int                                                       AS reading_count
         FROM readings_hourly
         WHERE device_id = $1 AND hour >= $2 AND hour < $3
         GROUP BY time
         ORDER BY time`,
  // per WIB day: the hourly summaries combined again. Daily average = the sum of (average x number of values) over
  // all hours divided by the sum of the numbers of values, so it stays exact even when some hours are only partly
  // filled. nullif prevents a division by zero when that column is empty (NULL) for the whole day
  "1d": `SELECT time_bucket('1 day', hour, 'Asia/Jakarta') AS time,
           round((sum(avg_temp * temp_n) / nullif(sum(temp_n), 0))::numeric, 1)::float8  AS avg_temp,
           min(min_temp)                                                                 AS min_temp,
           max(max_temp)                                                                 AS max_temp,
           round(sum(avg_humidity * humidity_n) / nullif(sum(humidity_n), 0), 1)::float8 AS avg_humidity,
           round(sum(avg_soil * soil_n) / nullif(sum(soil_n), 0), 1)::float8             AS avg_soil,
           round(sum(avg_light * light_n) / nullif(sum(light_n), 0), 1)::float8          AS avg_light,
           sum(reading_count)::int                                                       AS reading_count
         FROM readings_hourly
         WHERE device_id = $1 AND hour >= $2 AND hour < $3
         GROUP BY time
         ORDER BY time`,
};

// The reading summary of one device per bucket in the range [from, to), oldest first.
export async function getSummary(deviceId: string, from: Date, to: Date, bucket: Bucket) {
  const result = await pool.query<SummaryRow>(SUMMARY_QUERIES[bucket], [deviceId, from, to]);
  return result.rows.map((row) => ({ ...row, time: contractTime(row.time) })); // time as text
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
