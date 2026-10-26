// archive.ts - writes the messages that passed the contract checks to the database, and reads them back for the history API
// (raw readings, or their summary per 15 minutes, per hour, and per day). Module 19: automation rules (the rules table) and
// the event log (the events table). Module 24: rules can be deleted too.
// The in-memory store (store.ts) remains the "notice board" for the latest state; the database is its archive book.
import { pool } from "./pool.ts";
import type { Ack, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import type { Rule } from "../schemas/rules.ts";

// Update the device's kind, status, and when it was last heard. Module 21: a devices row is NO LONGER created automatically;
// only a registered device (POST /devices) has its messages reach here (second layer in mqtt.ts). Columns that aren't given
// (null) don't overwrite the old values, thanks to coalesce.
async function recordDevice(deviceId: string, kind: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `UPDATE devices SET
       kind = coalesce($2, kind),
       status = coalesce($3, status),
       last_seen = now()
     WHERE device_id = $1`,
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

// One command with its result: the ack (ok or refused), or null if no ack came within 5 seconds. Module 19: also
// who ordered it (source), which rule (if it came from a rule or a schedule), and the actuator state according to its ack.
// Module 24: rule_id is taken through (SELECT id FROM rules …): a rule deleted WHILE its command waits for an ack makes
// rule_id NULL (the same as ON DELETE SET NULL), not a "violates foreign key constraint" error that throws the record away.
export async function archiveCommand(commandId: string, deviceId: string, command: SetCommand, sentAt: Date,
  ack: Ack | null, waitMs: number, source: string, ruleId: number | null): Promise<void> {
  await pool.query(
    `INSERT INTO commands (id, device_id, sent_at, target, value, ack_ok, ack_message, wait_ms, source, rule_id, state)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, (SELECT id FROM rules WHERE id = $10), $11)`,
    [commandId, deviceId, sentAt, command.target, JSON.stringify(command.value), ack?.ok ?? null,
      ack?.message ?? null, waitMs, source, ruleId, ack === null ? null : JSON.stringify(ack.state)],
  );
}

// Module 19: one row of the rules table, as it is (condition and action are checked by Zod in automation.ts before use).
export interface RuleRow {
  id: number;
  name: string;
  active: boolean;
  condition: unknown;
  action: unknown;
  created_at: Date;
  updated_at: Date;
}

const RULE_COLUMNS = "id, name, active, condition, action, created_at, updated_at";

export async function getAllRules(): Promise<RuleRow[]> {
  const result = await pool.query<RuleRow>(`SELECT ${RULE_COLUMNS} FROM rules ORDER BY id`);
  return result.rows;
}

export async function insertRule(a: Rule): Promise<RuleRow> {
  const result = await pool.query<RuleRow>(
    `INSERT INTO rules (name, active, condition, action) VALUES ($1, $2, $3, $4) RETURNING ${RULE_COLUMNS}`,
    [a.name, a.active, JSON.stringify(a.condition), JSON.stringify(a.action)],
  );
  return result.rows[0];
}

// The result is undefined if no rule has that number.
export async function updateRule(id: number, a: Rule): Promise<RuleRow | undefined> {
  const result = await pool.query<RuleRow>(
    `UPDATE rules SET name = $2, active = $3, condition = $4, action = $5, updated_at = now() WHERE id = $1 RETURNING ${RULE_COLUMNS}`,
    [id, a.name, a.active, JSON.stringify(a.condition), JSON.stringify(a.action)],
  );
  return result.rows[0];
}

// Module 24: delete one rule. The result is the number and name of the deleted rule, or undefined if no rule has that
// number. Its command and event history is NOT deleted with it: its rule_id column becomes NULL (ON DELETE SET NULL, migration 007).
export async function deleteRuleDb(id: number): Promise<{ id: number; name: string } | undefined> {
  const result = await pool.query<{ id: number; name: string }>("DELETE FROM rules WHERE id = $1 RETURNING id, name", [id]);
  return result.rows[0];
}

// Module 19: the event log (the events table, migration 007).
export type EventKind = "rule" | "rule-changed" | "schedule" | "status" | "offline-report" | "command";

export interface NewEvent {
  device_id: string | null; // null for an event that doesn't belong to one device (for example a changed rule)
  kind: EventKind;
  source: string; // api, rule, schedule, telegram, device
  rule_id: number | null;
  message: string; // a sentence for humans, the same as its Telegram message
  data?: unknown; // the raw details
}

// an event that is already stored: plus its number and time (this is what Socket.IO sends as "event")
export interface SavedEvent extends NewEvent {
  id: number;
  occurred_at: string;
}

// Module 24: rule_id through (SELECT id FROM rules …), for the same reason as archiveCommand: an event from a rule that
// was just deleted is still recorded (rule_id NULL), and the stored value is the one that is broadcast.
export async function saveEvent(e: NewEvent): Promise<SavedEvent> {
  const result = await pool.query<{ id: string; occurred_at: Date; rule_id: number | null }>(
    `INSERT INTO events (device_id, kind, source, rule_id, message, data)
     VALUES ($1, $2, $3, (SELECT id FROM rules WHERE id = $4), $5, $6)
     RETURNING id, occurred_at, rule_id`,
    [e.device_id, e.kind, e.source, e.rule_id, e.message, e.data === undefined ? null : JSON.stringify(e.data)],
  );
  const { id, occurred_at, rule_id } = result.rows[0];
  return { id: Number(id), occurred_at: contractTime(occurred_at), ...e, rule_id }; // a bigint comes from pg as text
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

// The bucket sizes that the history API accepts: 15 minutes, 1 hour, or 1 day.
export type Bucket = "15m" | "1h" | "1d";

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
