// csv.test.ts - tests of the dashboard's CSV maker (Module 29): the file from the CSV button on the History screen must open
// neatly in Excel with English (US/UK) settings. Pure functions: no browser, no backend. Run from the frontend folder: npm test
import { describe, expect, it } from "vitest";
import { toCsv, csvTime } from "./csv";

describe("CSV for Excel with English (US/UK) settings (csv.ts)", () => {
  it("toCsv: comma, decimal point, quotes for a name with a comma, an empty cell for null, BOM, and CRLF", () => {
    const text = toCsv([
      ["time", "device", "temperature"],
      ["2026-10-24 16:15:42", "Node 1, living room", 28.5],
      ["2026-10-24 16:15:52", "Garden", null], // a failed sensor: an empty cell, not the word "null"
    ]);
    expect(text).toBe(
      "\uFEFF" + // BOM: an unseen mark at the start of the file saying the content is UTF-8 (written \uFEFF, as in csv.ts)
        "time,device,temperature\r\n" +
        '2026-10-24 16:15:42,"Node 1, living room",28.5\r\n' +
        "2026-10-24 16:15:52,Garden,\r\n",
    );
  });

  it("csvTime: WIB time as year-month-day hour:minute:second, so it sorts right in Excel", () => {
    // Z at the end = UTC time. WIB = UTC + 7 hours.
    expect(csvTime("2026-10-24T09:15:42Z")).toBe("2026-10-24 16:15:42");
    // 17:00 UTC is already past midnight in Indonesia: the date changes too
    expect(csvTime("2026-10-24T17:00:00Z")).toBe("2026-10-25 00:00:00");
  });
});
