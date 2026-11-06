// time.test.ts - tests of the clock helpers on the screen (Module 29). The dashboard clock is always WIB, whatever the time zone
// of the laptop, the phone, or the robot computer running them (the GitHub Actions robot uses UTC). From the frontend folder: npm test
import { afterEach, describe, expect, it, vi } from "vitest";
import { relativeTime, wibTime, MINUTE } from "./time";

describe("the clock on the screen (time.ts)", () => {
  // after every test: bring back this computer's own time zone (vi.stubEnv below only borrows it)
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("wibTime: WIB time, whatever the computer's time zone", () => {
    // UTC (the robot), WIB, WITA, WIT. vi.stubEnv("TZ", …) = as if this computer were set to that time zone. It only applies to
    // a format made WHEN it is called (toLocaleTimeString in wibTime). The Intl.DateTimeFormat formatters made once when
    // time.ts loads (HOUR_MINUTE and friends) use the time zone at load time: the robot on a UTC clock guards those.
    for (const zone of ["UTC", "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]) {
      vi.stubEnv("TZ", zone);
      // Z at the end = UTC time. WIB = UTC + 7 hours.
      expect(wibTime("2026-10-24T09:27:10Z")).toBe("16:27:10 WIB");
      expect(wibTime("2026-10-24T17:05:00Z")).toBe("00:05:00 WIB"); // already past midnight in Indonesia
    }
  });

  it("relativeTime: under 5 seconds 'just now' (also when the server clock runs slightly fast), after that '… ago'", () => {
    const now = Date.parse("2026-10-24T09:30:00Z");
    expect(relativeTime(now - 3000, now)).toBe("just now");
    // the server clock 2 seconds ahead of the phone clock: still "just now", not "in 2 seconds"
    expect(relativeTime(now + 2000, now)).toBe("just now");
    expect(relativeTime(now - 45 * 1000, now)).toBe("45 seconds ago");
    expect(relativeTime(now - 3 * MINUTE, now)).toBe("3 minutes ago");
  });
});
