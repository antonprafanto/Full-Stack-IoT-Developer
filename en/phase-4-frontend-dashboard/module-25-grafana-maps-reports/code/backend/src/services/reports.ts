// reports.ts - the daily CSV report through Telegram (Module 25). Every morning (default 07:00 WIB, setting REPORT_SCHEDULE in .env)
// the backend summarizes YESTERDAY's data, 00:00-24:00 WIB, per device with one SQL query, turns it into a CSV with the Module 23
// recipe (csv.ts), then sends it as a file through the Telegram bot that already exists (sendFile in telegram.ts).
// POST /reports/send uses the same function, to test it without waiting for its time.
// A report is only sent while the backend is on: a missed schedule (for example a sleeping laptop) is not sent afterwards.
import cron from "node-cron";
import { pool } from "../db/pool.ts";
import { toCsv } from "./csv.ts";
import { telegramOffReason, notify, sendFile } from "./telegram.ts";
import { log } from "./log.ts";

const ZONE = "Asia/Jakarta"; // WIB, the same as the rule schedules (schedule.ts): whatever the laptop's time zone is
const DAY_MS = 24 * 60 * 60 * 1000;
// "sv-SE" (Swedish) is used because its format happens to be year-month-day: 2026-10-26 (Module 23's csv.ts recipe)
const isoDate = new Intl.DateTimeFormat("sv-SE", { timeZone: ZONE, dateStyle: "short" });
const humanDate = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, dateStyle: "medium" }); // 26 Oct 2026
const humanTime = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" }); // 07:00
const humanDateTime = (time: Date) => `${humanDate.format(time)}, ${humanTime.format(time)} WIB`;

// The range of one report: [from, to), "to" is not counted. date = the WIB day being reported.
export interface ReportRange {
  from: Date;
  to: Date;
  date: string; // for example 2026-10-26
  today: boolean; // true = today's partial report (POST /reports/send?day=today)
}

// Yesterday = 00:00-24:00 WIB of the day before; today = 00:00 WIB until now. WIB = UTC + 7 hours without daylight saving
// time, so 00:00 WIB is always 17:00 UTC the day before. A pure function: "now" is given from outside so it can be tested.
export function reportRange(now: Date, today = false): ReportRange {
  const todayDate = isoDate.format(now); // the date in WIB, not the date in the laptop's time zone
  const startOfToday = new Date(`${todayDate}T00:00:00+07:00`);
  if (today) return { from: startOfToday, to: now, date: todayDate, today };
  const startOfYesterday = new Date(startOfToday.getTime() - DAY_MS);
  return { from: startOfYesterday, to: startOfToday, date: isoDate.format(startOfYesterday), today };
}

// report-2026-10-26.csv = the data of the 26th (sent on the morning of the 27th). A partial report gets a suffix so that it isn't
// mixed up with the full report of the same day, which is only sent the next morning.
export function reportFileName(r: ReportRange): string {
  return `report-${r.date}${r.today ? "-partial" : ""}.csv`;
}

// the caption under the file in Telegram
export function reportCaption(r: ReportRange, deviceCount: number): string {
  return r.today
    ? `📊 Mini Smart Home partial report ${humanDate.format(r.from)} (00:00–${humanTime.format(r.to)} WIB): `
      + `${deviceCount} device(s)`
    : `📊 Mini Smart Home daily report ${humanDate.format(r.from)}: ${deviceCount} device(s)`;
}

// One report row = one registered device whose key isn't revoked. null = there is no data (for example Node 2 has no
// vitals, so its rssi, heap, and restarts columns are always empty).
export interface ReportRow {
  device_id: string;
  name: string;
  kind: string;
  reading_count: number; // 0 = the device was silent all day
  avg_temp: number | null;
  min_temp: number | null;
  max_temp: number | null;
  avg_humidity: number | null;
  avg_soil: number | null;
  min_soil: number | null;
  avg_rssi: number | null;
  worst_rssi: number | null; // the most negative = the weakest signal
  min_heap: number | null;
  restarts: number | null; // how many times the uptime dropped (the device restarted)
  disconnects: number; // how many times the status changed to offline/offline-mode
}

// The order of the CSV columns. The table header = these column names, the same as the column names of the query below.
export const REPORT_COLUMNS: (keyof ReportRow)[] = ["device_id", "name", "kind", "reading_count", "avg_temp", "min_temp",
  "max_temp", "avg_humidity", "avg_soil", "min_soil", "avg_rssi", "worst_rssi", "min_heap", "restarts",
  "disconnects"];

// One query for all devices, $1 = from, $2 = to. Four parts (WITH ... AS):
// - summary: hourly readings from the summary book readings_hourly (Module 18), combined into one day. The daily average =
//   the sum of (average x number of values) of all hours divided by the total number of values, like the 1d summary in db/archive.ts.
// - vitals + health: vitals from device_health (Module 19). lag() takes the PREVIOUS vitals uptime of the same device;
//   an uptime that drops means the device restarted.
// - drops: status events from the event log (events); their sentence is "<device_id> disconnected (offline)" (services/mqtt.ts).
// Numbers are cast to float8 and int so that pg sends them as a number, not as text.
const REPORT_QUERY = `
WITH summary AS (
  SELECT device_id,
         sum(reading_count)::int                                                           AS reading_count,
         round((sum(avg_temp * temp_n) / nullif(sum(temp_n), 0))::numeric, 1)::float8     AS avg_temp,
         min(min_temp)                                                                     AS min_temp,
         max(max_temp)                                                                     AS max_temp,
         round(sum(avg_humidity * humidity_n) / nullif(sum(humidity_n), 0), 1)::float8   AS avg_humidity,
         round(sum(avg_soil * soil_n) / nullif(sum(soil_n), 0), 1)::float8                 AS avg_soil,
         min(min_soil)                                                                     AS min_soil
  FROM readings_hourly
  WHERE hour >= $1 AND hour < $2
  GROUP BY device_id),
vitals AS (
  SELECT device_id, rssi, heap_free, uptime_s,
         lag(uptime_s) OVER (PARTITION BY device_id ORDER BY ts) AS prev_uptime
  FROM device_health
  WHERE ts >= $1 AND ts < $2),
health AS (
  SELECT device_id, round(avg(rssi))::int AS avg_rssi, min(rssi) AS worst_rssi, min(heap_free) AS min_heap,
         (count(*) FILTER (WHERE uptime_s < prev_uptime))::int AS restarts
  FROM vitals
  GROUP BY device_id),
drops AS (
  SELECT device_id, count(*)::int AS disconnects
  FROM events
  WHERE kind = 'status' AND message LIKE '%disconnected%' AND occurred_at >= $1 AND occurred_at < $2
  GROUP BY device_id)
SELECT d.device_id, coalesce(d.name, d.device_id) AS name, d.kind,
       coalesce(r.reading_count, 0) AS reading_count, r.avg_temp, r.min_temp, r.max_temp, r.avg_humidity,
       r.avg_soil, r.min_soil, s.avg_rssi, s.worst_rssi, s.min_heap, s.restarts,
       coalesce(p.disconnects, 0) AS disconnects
FROM devices d
LEFT JOIN summary r ON r.device_id = d.device_id
LEFT JOIN health s ON s.device_id = d.device_id
LEFT JOIN drops p ON p.device_id = d.device_id
WHERE d.registered_at IS NOT NULL AND d.revoked_at IS NULL
ORDER BY d.device_id`;

// the report rows become CSV text: the table header, then one row per device (a pure function)
export function makeReportCsv(rows: ReportRow[]): string {
  return toCsv([REPORT_COLUMNS, ...rows.map((r) => REPORT_COLUMNS.map((column) => r[column]))]);
}

// The result of one send. "skipped" = Telegram off (token/chat_id empty); "failed" = Telegram refused it or can't be reached.
export type ReportResult =
  | { status: "sent"; file: string; range: ReportRange; devices: number; size_bytes: number; caption: string }
  | { status: "skipped"; message: string }
  | { status: "failed"; message: string };

// Build and send one report. Database errors are NOT caught here: the caller decides (route: 503, schedule: log).
export async function sendReport(today = false, now = new Date()): Promise<ReportResult> {
  const off = telegramOffReason();
  if (off !== null) return { status: "skipped", message: `Telegram off (${off})` }; // no need to read the database
  const range = reportRange(now, today);
  const result = await pool.query<ReportRow>(REPORT_QUERY, [range.from, range.to]);
  const content = makeReportCsv(result.rows);
  const file = reportFileName(range);
  const caption = reportCaption(range, result.rows.length);
  if (!(await sendFile(file, content, caption))) {
    return { status: "failed", message: `Telegram didn't accept ${file}; see the backend log` };
  }
  return { status: "sent", file, range, devices: result.rows.length, size_bytes: Buffer.byteLength(content, "utf8"),
    caption };
}

// Called by node-cron at its time. Nobody waits for its answer, so every result (errors too) is written to the log.
// scheduledTime = the time WRITTEN in the schedule, not the time this function runs: a 23:50 schedule that only runs at 00:01
// (the laptop has just woken up) still reports "yesterday" as seen from that 23:50, not the day that has just ended.
async function scheduledReport(scheduledTime: Date): Promise<void> {
  log.info("daily report running on schedule");
  try {
    const result = await sendReport(false, scheduledTime);
    if (result.status === "skipped") log.warn(`daily report skipped: ${result.message}`);
    else if (result.status === "failed") log.error(`daily report failed: ${result.message}`);
    // sent: sendFile() has already written "Telegram sent: file report-…" to the log
  } catch (error) {
    log.error(`daily report failed: the database can't be read (${(error as Error).message})`);
  }
}

// node-cron 4 does NOT replay a missed schedule (for example a laptop asleep at 07:00): we can only record it.
function missedReport(time: Date): void {
  const message = `⏰ The daily report of ${humanDateTime(time)} was missed (laptop asleep or backend busy?). `
    + "Send it now with POST /reports/send";
  log.warn(message);
  void notify(message);
}

// Set up the daily report schedule (called once by server.ts at startup). It stops with stopSchedules() in schedule.ts:
// cron.shutdown() stops ALL node-cron tasks, this one included.
export function startReports(schedule: string): void {
  // context.date = this task's scheduled time (for example 07:00 WIB), also when it only runs a few minutes later
  const task = cron.schedule(schedule, (context) => scheduledReport(context.date), {
    name: "daily-report",
    timezone: ZONE, // without this, "0 7 * * *" means 07:00 in the laptop's time zone (a WITA laptop: 06:00 WIB)
    noOverlap: true, // if the previous report isn't finished yet, don't run two at the same time
    missedExecutionTolerance: 15 * 60_000, // up to 15 minutes late (for example a laptop that has just woken up) still runs
  });
  task.on("execution:missed", (context) => missedReport(context.date));
  const next = task.getNextRun();
  log.info(`daily report scheduled: "${schedule}" ${ZONE}, next ${next === null ? "-" : humanDateTime(next)}`);
}
