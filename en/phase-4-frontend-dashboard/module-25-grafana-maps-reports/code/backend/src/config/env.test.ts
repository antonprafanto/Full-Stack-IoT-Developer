// env.test.ts - tests for the REPORT_SCHEDULE setting (Module 25) in env.ts. env.ts checks process.env ONCE when it is imported, so
// every test imports it again (vi.resetModules) with different fake .env contents. Run: npm test
import { afterEach, describe, expect, it, vi } from "vitest";

const VALID = { // valid required settings (nothing is really contacted)
  MQTT_URL: "mqtt://127.0.0.1:1",
  DATABASE_URL: "postgres://fake:fake@127.0.0.1:1/fake",
  JWT_SECRET: "test-secret-long-enough-for-zod-0123456789",
};

async function readSettings(schedule: string) {
  vi.resetModules();
  for (const [name, value] of Object.entries({ ...VALID, REPORT_SCHEDULE: schedule })) vi.stubEnv(name, value);
  return (await import("./env.ts")).env;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("REPORT_SCHEDULE in .env", () => {
  it("empty = the default 0 7 * * * (every day 07:00 WIB); any other 5-field cron is taken as it is", async () => {
    expect((await readSettings("")).REPORT_SCHEDULE).toBe("0 7 * * *");
    expect((await readSettings("30 6 * * 1-5")).REPORT_SCHEDULE).toBe("30 6 * * 1-5");
  });

  it("a 6-field cron (0 7 * * * *) is refused with its reason, and the server stops", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit"); });
    await expect(readSettings("0 7 * * * *")).rejects.toThrow("process.exit");
    expect(consoleError).toHaveBeenCalledWith(
      "Setting REPORT_SCHEDULE in .env: must have 5 fields: minute hour day month weekday, for example 0 7 * * *");
  });
});
