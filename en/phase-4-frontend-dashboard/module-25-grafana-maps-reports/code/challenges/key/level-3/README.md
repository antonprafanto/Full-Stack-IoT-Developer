# Module 25 Level 3 answer key: a weekly report on Monday 07:00

**Task:** besides the daily report, the backend sends a **weekly report** every **Monday 07:00 WIB** holding **last week's** data (Monday 00:00
to Monday 00:00 WIB, seven days), using the SAME query, CSV maker, and file sender as the daily report of Practice 8.

Key files (only the ones changed from backend 1.2.0, paths relative to the `backend` folder):

| File | Change |
| :--- | :--- |
| `src/services/weekly-report.ts` | **new** (74 lines): `weeklyRange(now)` (the day of the week counted from the WIB date, not the laptop's clock), `weeklyFileName()` → `weekly-report-YYYY-MM-DD.csv` (the date of the first Monday), `weeklyCaption()`, `sendWeeklyReport()`, `startWeeklyReports(schedule)` (node-cron `timezone: "Asia/Jakarta"`, `noOverlap`, "last week" counted from the schedule's time `context.date` like the daily report, a missed schedule only reported) |
| `src/services/weekly-report.test.ts` | **new**, 5 tests (the test laptop deliberately at UTC−4): the Monday–Monday WIB range, other days of the same week, the day changing by WIB, Telegram off, what is sent |
| `src/services/reports.ts` | +10/−4: the report query is split into `getReportRows(from, to)` (exported) so the weekly report uses the same query; `sendReport()` calls it. The daily report behaves the same (its 12 tests still pass) |
| `src/config/env.ts` | +5: the `WEEKLY_REPORT_SCHEDULE` setting, default `0 7 * * 1` (the 5th field = the day: 1 = Monday), checked like `REPORT_SCHEDULE` (5 fields, `cron.validate`) |
| `src/server.ts` | +2: `startWeeklyReports(env.WEEKLY_REPORT_SCHEDULE)` after the daily report; it stops together with `stopSchedules()` (`cron.shutdown()`) |
| `.env.example` | +2: `WEEKLY_REPORT_SCHEDULE=0 7 * * 1` with a comment |

How to use: copy those files into your project's `backend` folder, then `npm run check` and `npm test`.

## Trying it without waiting for Monday

Like the daily report's rehearsal (Practice 9): temporarily fill `WEEKLY_REPORT_SCHEDULE` with a time a few minutes ahead every day,
for example `2 23 * * *`, save `.env` (the backend's `npm run dev` restarts by itself), wait, then put it back to `0 7 * * 1`. The content is still
"last week", whatever the day.

**Expected output (the author's lab, 27 Oct 2026 19:31–19:35 WIB; this key's backend for a few minutes in place of the lab backend, a lab
database holding the `seed-history` practice data, Telegram = the mock Bot API server):**

```text
INFO: weekly report scheduled: "35 19 * * *" Asia/Jakarta, next 27 Oct 2026, 19:35 WIB
INFO: weekly report running on schedule
INFO: Telegram sent: file weekly-report-2026-10-19.csv (273 bytes), 📊 Mini Smart Home weekly report 19 Oct 2026 - 25 Oct 2026: 2 device(s)
```

The file the mock received starts with a BOM (`EF BB BF`), its lines end with CRLF, and `reading_count` per device (864) equals
`SELECT sum(reading_count) FROM readings_hourly` for 19–26 Oct 00:00 WIB. `npm run check` passes; `npm test`: `Test Files  15 passed (15)`,
`Tests  101 passed (101)` (backend 1.2: 14 files / 96 tests).

## Notes

- The weekly report's columns are the same as the daily report's (15 columns): averages and counts are computed over the 7 days at once, `restarts`
  and `disconnects` = the totals over the week.
- The first day after installing: the "last week" report can be empty if the database only holds a few days of data.
- Like the daily report, the weekly report is only sent while the laptop and the backend are on at Monday 07:00 (a 15-minute tolerance);
  a missed one isn't sent afterwards.
