// reports.test.ts - tests for the daily report (Module 25) WITHOUT a database and WITHOUT Telegram: the database pool (pool.ts) and
// the bot (telegram.ts) are replaced by fakes (vi.mock). What is tested: the "yesterday" range 00:00-24:00 WIB (also on a laptop in
// another time zone), the file name, the caption, the CSV content, what happens when Telegram is off, refuses, or the database
// can't be read, and the node-cron schedule options (node-cron is a fake too: the tests don't wait for 07:00). Run: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts checks .env when imported: give it valid fake settings (nothing is really contacted)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  // this "test laptop" is deliberately in a time zone very far from WIB (UTC-4), to catch code that secretly uses the laptop's clock
  process.env.TZ = "America/New_York";
});

const mock = vi.hoisted(() => ({
  query: vi.fn(),
  telegramOffReason: vi.fn((): string | null => null),
  sendFile: vi.fn(async (_name: string, _content: string, _caption: string) => true),
  notify: vi.fn(async (_text: string) => true),
  // mock node-cron: records cron.schedule(expression, task, options) and its task's event listeners
  schedules: [] as [string, (context: { date: Date }) => Promise<void>, Record<string, unknown>][],
  events: new Map<string, (context: { date: Date }) => void>(),
}));
vi.mock("../db/pool.ts", () => ({ pool: { query: mock.query } }));
vi.mock("./telegram.ts", () => ({
  telegramOffReason: mock.telegramOffReason,
  sendFile: mock.sendFile,
  notify: mock.notify,
}));
vi.mock("node-cron", () => ({
  default: {
    schedule: (expression: string, task: (context: { date: Date }) => Promise<void>, options: Record<string, unknown>) => {
      mock.schedules.push([expression, task, options]);
      return { on: (name: string, fn: (context: { date: Date }) => void) => mock.events.set(name, fn), getNextRun: () => null };
    },
  },
}));

import { makeReportCsv, reportCaption, sendReport, startReports, reportFileName, reportRange } from "./reports.ts";
import type { ReportRow } from "./reports.ts";

// two example devices: Node 1 complete, Node 2 (the Garden) without vitals
const NODE1: ReportRow = { device_id: "f00d00000001", name: "Node 1 lab", kind: "node1", reading_count: 8640,
  avg_temp: 28.8, min_temp: 25.1, max_temp: 33, avg_humidity: 67.6, avg_soil: 39.6, min_soil: 20, avg_rssi: -69,
  worst_rssi: -79, min_heap: 184562, restarts: 0, disconnects: 1 };
const GARDEN: ReportRow = { device_id: "f00d000000b2", name: "Garden, back", kind: "node2", reading_count: 288,
  avg_temp: 28, min_temp: 27.6, max_temp: 28.2, avg_humidity: 69.3, avg_soil: 40.3, min_soil: 38, avg_rssi: null,
  worst_rssi: null, min_heap: null, restarts: null, disconnects: 0 };
const HEADER = "device_id,name,kind,reading_count,avg_temp,min_temp,max_temp,avg_humidity,avg_soil,min_soil,"
  + "avg_rssi,worst_rssi,min_heap,restarts,disconnects";

beforeEach(() => {
  mock.query.mockReset();
  mock.telegramOffReason.mockReturnValue(null);
  mock.sendFile.mockClear();
  mock.sendFile.mockResolvedValue(true);
  mock.notify.mockClear();
  mock.schedules.length = 0;
});

describe("report range (WIB)", () => {
  it("sent 27 Oct 07:00 WIB: it covers 26 Oct 00:00-24:00 WIB = 25 Oct 17:00 UTC to 26 Oct 17:00 UTC", () => {
    const r = reportRange(new Date("2026-10-27T00:00:00Z")); // 07:00 WIB
    expect(r.from.toISOString()).toBe("2026-10-25T17:00:00.000Z");
    expect(r.to.toISOString()).toBe("2026-10-26T17:00:00.000Z");
    expect(r.date).toBe("2026-10-26");
    expect(reportFileName(r)).toBe("report-2026-10-26.csv");
  });

  it("the midnight boundary follows WIB, not the laptop's time zone (this test laptop is at UTC-4)", () => {
    expect(reportRange(new Date("2026-10-26T16:59:59Z")).date).toBe("2026-10-25"); // 26 Oct 23:59:59 WIB
    expect(reportRange(new Date("2026-10-26T17:00:00Z")).date).toBe("2026-10-26"); // 27 Oct 00:00:00 WIB
    expect(new Date("2026-10-26T17:00:00Z").getDate()).toBe(26); // on the laptop clock (UTC-4) it's still 26 Oct 13:00
  });

  it("?day=today: 00:00 WIB today until now, the file name ends in -partial", () => {
    const now = new Date("2026-10-27T03:15:00Z"); // 27 Oct 10:15 WIB
    const r = reportRange(now, true);
    expect(r.from.toISOString()).toBe("2026-10-26T17:00:00.000Z");
    expect(r.to).toBe(now);
    expect(reportFileName(r)).toBe("report-2026-10-27-partial.csv");
    expect(reportCaption(r, 2)).toBe("📊 Mini Smart Home partial report 27 Oct 2026 (00:00–10:15 WIB): 2 device(s)");
  });

  it("the daily report caption names the date it covers (WIB)", () => {
    expect(reportCaption(reportRange(new Date("2026-10-27T00:00:00Z")), 3))
      .toBe("📊 Mini Smart Home daily report 26 Oct 2026: 3 device(s)");
  });
});

describe("CSV content of the report", () => {
  it("table header + one row per device; Node 2's vitals empty; a name with a comma is wrapped in quotes", () => {
    expect(makeReportCsv([NODE1, GARDEN])).toBe("\uFEFF" + HEADER + "\r\n"
      + "f00d00000001,Node 1 lab,node1,8640,28.8,25.1,33,67.6,39.6,20,-69,-79,184562,0,1\r\n"
      + "f00d000000b2,\"Garden, back\",node2,288,28,27.6,28.2,69.3,40.3,38,,,,,0\r\n");
  });

  it("no registered device yet: only the table header", () => {
    expect(makeReportCsv([])).toBe("\uFEFF" + HEADER + "\r\n");
  });
});

describe("sendReport", () => {
  it("Telegram off: skipped, the database isn't even read", async () => {
    mock.telegramOffReason.mockReturnValue("TELEGRAM_BOT_TOKEN is empty");
    expect(await sendReport()).toEqual({ status: "skipped", message: "Telegram off (TELEGRAM_BOT_TOKEN is empty)" });
    expect(mock.query).not.toHaveBeenCalled();
    expect(mock.sendFile).not.toHaveBeenCalled();
  });

  it("sent: the query uses yesterday's WIB range, the CSV file with a BOM is sent with its name and caption", async () => {
    mock.query.mockResolvedValue({ rows: [NODE1, GARDEN] });
    const result = await sendReport(false, new Date("2026-10-27T00:00:00Z"));
    const [, params] = mock.query.mock.calls[0] as [string, Date[]];
    expect(params.map((w) => w.toISOString())).toEqual(["2026-10-25T17:00:00.000Z", "2026-10-26T17:00:00.000Z"]);
    const [name, content, caption] = mock.sendFile.mock.calls[0];
    expect(name).toBe("report-2026-10-26.csv");
    expect(content).toBe(makeReportCsv([NODE1, GARDEN]));
    expect(caption).toBe("📊 Mini Smart Home daily report 26 Oct 2026: 2 device(s)");
    expect(result).toMatchObject({ status: "sent", file: "report-2026-10-26.csv", devices: 2,
      size_bytes: Buffer.byteLength(content, "utf8") });
  });

  it("Telegram refuses or can't be reached: failed, with its file name", async () => {
    mock.query.mockResolvedValue({ rows: [NODE1] });
    mock.sendFile.mockResolvedValue(false);
    expect(await sendReport(false, new Date("2026-10-27T00:00:00Z")))
      .toEqual({ status: "failed", message: "Telegram didn't accept report-2026-10-26.csv; see the backend log" });
  });

  it("the database can't be read: its error goes to the caller (the route answers 503, the schedule writes to the log)", async () => {
    mock.query.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    await expect(sendReport()).rejects.toThrow("ECONNREFUSED");
    expect(mock.sendFile).not.toHaveBeenCalled();
  });
});

describe("daily report schedule (mock node-cron)", () => {
  it("WIB, no overlap, up to 15 minutes late still runs; its content is counted from the SCHEDULED time", async () => {
    startReports("50 23 * * *");
    const [expression, task, options] = mock.schedules[0];
    expect(expression).toBe("50 23 * * *");
    expect(options).toMatchObject({ timezone: "Asia/Jakarta", noOverlap: true, missedExecutionTolerance: 15 * 60_000 });
    // the laptop sleeps at 23:49 WIB and wakes at 00:01 WIB: node-cron only runs the 27 Oct 23:50 WIB schedule on 28 Oct 00:01:30 WIB
    vi.useFakeTimers({ now: new Date("2026-10-27T17:01:30Z"), toFake: ["Date"] }); // "now" = 28 Oct 00:01:30 WIB
    mock.query.mockResolvedValue({ rows: [NODE1] });
    await task({ date: new Date("2026-10-27T16:50:00Z") }); // context.date = the scheduled time (27 Oct 23:50 WIB)
    vi.useRealTimers();
    expect(mock.sendFile.mock.calls[0][0]).toBe("report-2026-10-26.csv"); // not report-2026-10-27.csv
  });

  it("a missed schedule is only reported (⏰): the report is NOT sent afterwards", () => {
    startReports("0 7 * * *");
    mock.events.get("execution:missed")?.({ date: new Date("2026-10-27T00:00:00Z") });
    expect(mock.notify).toHaveBeenCalledWith("⏰ The daily report of 27 Oct 2026, 07:00 WIB was missed (laptop asleep or "
      + "backend busy?). Send it now with POST /reports/send");
    expect(mock.sendFile).not.toHaveBeenCalled();
  });
});
