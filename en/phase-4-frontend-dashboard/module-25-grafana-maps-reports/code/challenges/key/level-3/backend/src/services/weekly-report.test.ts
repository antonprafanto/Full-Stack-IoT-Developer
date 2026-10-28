// weekly-report.test.ts - tests for Level 3 (the weekly report) WITHOUT a database and WITHOUT Telegram (the reports.test.ts pattern):
// last week's Monday-Monday WIB range (also on a laptop in another time zone), the file name, the caption, and sending it.
// Run: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.TZ = "America/New_York"; // a "test laptop" at UTC-4: catches code that uses the laptop's clock
});

const mock = vi.hoisted(() => ({
  query: vi.fn(),
  telegramOffReason: vi.fn((): string | null => null),
  sendFile: vi.fn(async (_name: string, _content: string, _caption: string) => true),
}));
vi.mock("../db/pool.ts", () => ({ pool: { query: mock.query } }));
vi.mock("./telegram.ts", () => ({ telegramOffReason: mock.telegramOffReason, sendFile: mock.sendFile, notify: async () => true }));

import { weeklyCaption, sendWeeklyReport, weeklyFileName, weeklyRange } from "./weekly-report.ts";

beforeEach(() => {
  mock.query.mockReset();
  mock.telegramOffReason.mockReturnValue(null);
  mock.sendFile.mockClear();
});

describe("weekly report range (WIB)", () => {
  it("Monday 26 Oct 2026 07:00 WIB: last week = Monday 19 Oct 00:00 to Monday 26 Oct 00:00 WIB", () => {
    const r = weeklyRange(new Date("2026-10-26T00:00:00Z")); // 07:00 WIB
    expect(r.from.toISOString()).toBe("2026-10-18T17:00:00.000Z"); // 19 Oct 00:00 WIB
    expect(r.to.toISOString()).toBe("2026-10-25T17:00:00.000Z"); // 26 Oct 00:00 WIB
    expect(weeklyFileName(r)).toBe("weekly-report-2026-10-19.csv");
    expect(weeklyCaption(r, 3)).toBe("📊 Mini Smart Home weekly report 19 Oct 2026 - 25 Oct 2026: 3 device(s)");
  });

  it("other days of the same week (Thursday, Sunday night) still give the same last week", () => {
    expect(weeklyRange(new Date("2026-10-29T05:00:00Z")).date).toBe("2026-10-19"); // Thursday 29 Oct 12:00 WIB
    expect(weeklyRange(new Date("2026-11-01T16:59:59Z")).date).toBe("2026-10-19"); // Sunday 1 Nov 23:59:59 WIB
    expect(weeklyRange(new Date("2026-11-01T17:00:00Z")).date).toBe("2026-10-26"); // Monday 2 Nov 00:00 WIB
  });

  it("the day changes by WIB, not by the laptop's clock (at UTC-4, Monday 00:00 WIB is still Sunday afternoon)", () => {
    const monday = new Date("2026-10-25T17:00:00Z"); // Monday 26 Oct 00:00 WIB
    expect(monday.getDay()).toBe(0); // the test laptop's clock: Sunday 25 Oct 13:00
    expect(weeklyRange(monday).date).toBe("2026-10-19");
  });
});

describe("sendWeeklyReport", () => {
  it("Telegram off: skipped, the database isn't read", async () => {
    mock.telegramOffReason.mockReturnValue("TELEGRAM_BOT_TOKEN is empty");
    expect(await sendWeeklyReport()).toEqual({ status: "skipped", message: "Telegram off (TELEGRAM_BOT_TOKEN is empty)" });
    expect(mock.query).not.toHaveBeenCalled();
  });

  it("sent: the daily report's query with a 7-day range, Module 23's CSV recipe, the weekly name and caption", async () => {
    mock.query.mockResolvedValue({ rows: [{ device_id: "f00d00000001", name: "Node 1", kind: "node1", reading_count: 60480,
      avg_temp: 28.5, min_temp: 22, max_temp: 33.1, avg_humidity: 70.2, avg_soil: 40.1, min_soil: 20, avg_rssi: -66,
      worst_rssi: -79, min_heap: 180000, restarts: 1, disconnects: 2 }] });
    const result = await sendWeeklyReport(new Date("2026-10-26T00:00:00Z"));
    expect(result.status).toBe("sent");
    const [query, params] = mock.query.mock.calls[0];
    expect(query).toContain("FROM readings_hourly"); // the SAME query as the daily report
    expect(params).toEqual([new Date("2026-10-18T17:00:00Z"), new Date("2026-10-25T17:00:00Z")]);
    const [name, content, caption] = mock.sendFile.mock.calls[0];
    expect(name).toBe("weekly-report-2026-10-19.csv");
    expect(content.startsWith("\uFEFFdevice_id,name,kind,reading_count,")).toBe(true);
    expect(content).toContain("\r\nf00d00000001,Node 1,node1,60480,28.5,22,33.1,70.2,40.1,20,-66,-79,180000,1,2\r\n");
    expect(caption).toBe("📊 Mini Smart Home weekly report 19 Oct 2026 - 25 Oct 2026: 1 device(s)");
  });
});
