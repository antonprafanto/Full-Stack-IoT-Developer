// weekly-report.ts - Level 3 of Module 25: the WEEKLY CSV report through Telegram, every Monday at 07:00 WIB (default
// WEEKLY_REPORT_SCHEDULE). Its content is last week, Monday 00:00 to Monday 00:00 WIB (7 days), with the SAME query, CSV maker,
// and file sender as the daily report (reports.ts): only the range, the file name, and the schedule are new.
import cron from "node-cron";
import { getReportRows, makeReportCsv } from "./reports.ts";
import type { ReportResult, ReportRange } from "./reports.ts";
import { telegramOffReason, notify, sendFile } from "./telegram.ts";
import { log } from "./log.ts";

const ZONE = "Asia/Jakarta";
const DAY_MS = 24 * 60 * 60 * 1000;
const isoDate = new Intl.DateTimeFormat("sv-SE", { timeZone: ZONE, dateStyle: "short" }); // 2026-10-19
const humanDate = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, dateStyle: "medium" }); // 19 Oct 2026
const humanTime = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" }); // 07:00

// Last week by the WIB clock. The day of the week is counted from the WIB date (not the laptop's clock): 00:00 WIB today shifted
// +7 hours, then read with getUTCDay() = the day in WIB (0 = Sunday, 1 = Monday, ...). A pure function, "now" is given from outside.
export function weeklyRange(now: Date): ReportRange {
  const startOfToday = new Date(`${isoDate.format(now)}T00:00:00+07:00`);
  const dayIndex = new Date(startOfToday.getTime() + 7 * 60 * 60 * 1000).getUTCDay();
  const sinceMonday = (dayIndex + 6) % 7; // Monday = 0, Tuesday = 1, ..., Sunday = 6
  const startOfThisWeek = new Date(startOfToday.getTime() - sinceMonday * DAY_MS);
  const from = new Date(startOfThisWeek.getTime() - 7 * DAY_MS);
  return { from, to: startOfThisWeek, date: isoDate.format(from), today: false };
}

// weekly-report-2026-10-19.csv = the week that STARTED on Monday 19 Oct
export function weeklyFileName(r: ReportRange): string {
  return `weekly-report-${r.date}.csv`;
}

export function weeklyCaption(r: ReportRange, deviceCount: number): string {
  const end = new Date(r.to.getTime() - 1); // the last Sunday that is counted
  return `📊 Mini Smart Home weekly report ${humanDate.format(r.from)} - ${humanDate.format(end)}: `
    + `${deviceCount} device(s)`;
}

export async function sendWeeklyReport(now = new Date()): Promise<ReportResult> {
  const off = telegramOffReason();
  if (off !== null) return { status: "skipped", message: `Telegram off (${off})` };
  const range = weeklyRange(now);
  const rows = await getReportRows(range.from, range.to);
  const content = makeReportCsv(rows);
  const file = weeklyFileName(range);
  const caption = weeklyCaption(range, rows.length);
  if (!(await sendFile(file, content, caption))) {
    return { status: "failed", message: `Telegram didn't accept ${file}; see the backend log` };
  }
  return { status: "sent", file, range, devices: rows.length, size_bytes: Buffer.byteLength(content, "utf8"), caption };
}

// Set up the schedule (called once by server.ts). It stops with the other node-cron tasks through stopSchedules() (cron.shutdown()).
export function startWeeklyReports(schedule: string): void {
  // context.date = the scheduled time (Monday 07:00 WIB), not the time it runs: like the daily report
  const task = cron.schedule(schedule, async (context) => {
    log.info("weekly report running on schedule");
    try {
      const result = await sendWeeklyReport(context.date);
      if (result.status === "skipped") log.warn(`weekly report skipped: ${result.message}`);
      else if (result.status === "failed") log.error(`weekly report failed: ${result.message}`);
    } catch (error) {
      log.error(`weekly report failed: the database can't be read (${(error as Error).message})`);
    }
  }, { name: "weekly-report", timezone: ZONE, noOverlap: true, missedExecutionTolerance: 15 * 60_000 });
  // like the daily report: a missed schedule (a sleeping laptop) isn't sent afterwards, only reported
  task.on("execution:missed", () => {
    const message = "⏰ The weekly report was missed (laptop asleep or backend busy?). The next one is next week.";
    log.warn(message);
    void notify(message);
  });
  const next = task.getNextRun();
  const when = next === null ? "-" : `${humanDate.format(next)}, ${humanTime.format(next)} WIB`;
  log.info(`weekly report scheduled: "${schedule}" ${ZONE}, next ${when}`);
}
