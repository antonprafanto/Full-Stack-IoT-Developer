// reports.test.ts - tests for the POST /reports/send route (Module 25) WITHOUT a database and WITHOUT Telegram: the report service
// is replaced by a fake (vi.mock), the Fastify server runs without a network (app.inject), and the REAL guard (security.ts) is
// mounted as in rules.test.ts: guest 401, viewer 403, admin 200. Also the answer codes when Telegram is off (409), refuses (502),
// and when the database can't be read (503). Run: npm test
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts checks .env when imported: give it valid fake settings (nothing is really contacted)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
});

// the fake report service: remembers what was asked for, answers according to the "state" each test sets
const mock = vi.hoisted(() => ({
  state: "sent" as "sent" | "off" | "refused" | "database-down",
  requested: [] as boolean[], // the today value of every call
}));
vi.mock("../services/reports.ts", () => ({
  sendReport: async (today: boolean) => {
    mock.requested.push(today);
    if (mock.state === "database-down") throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
    if (mock.state === "off") return { status: "skipped", message: "Telegram off (TELEGRAM_BOT_TOKEN is empty)" };
    if (mock.state === "refused") {
      return { status: "failed", message: "Telegram didn't accept report-2026-10-26.csv; see the backend log" };
    }
    return today
      ? { status: "sent", file: "report-2026-10-27-partial.csv", devices: 2, size_bytes: 260, caption: "📊 …",
        range: { from: new Date("2026-10-26T17:00:00Z"), to: new Date("2026-10-27T03:15:42.123Z"), date: "2026-10-27",
          today } }
      : { status: "sent", file: "report-2026-10-26.csv", devices: 3, size_bytes: 398, caption: "📊 …",
        range: { from: new Date("2026-10-25T17:00:00Z"), to: new Date("2026-10-26T17:00:00Z"), date: "2026-10-26",
          today } };
  },
}));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { setupSecurity } from "../auth/security.ts";
import { reportRoutes } from "./reports.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await setupSecurity(app); // CORS, cookies, JWT, and the same guard as server.ts
await app.register(reportRoutes);
await app.ready();
afterAll(() => app.close());

// a "wristband" (access JWT) that is valid because it is signed with the test JWT_SECRET above, sent as the access cookie
const wristband = (role: "admin" | "viewer") => ({ access: app.jwt.sign({ sub: role === "admin" ? "1" : "2", role, sid: 1 }) });
const send = (url: string, role?: "admin" | "viewer") =>
  app.inject({ method: "POST", url, ...(role === undefined ? {} : { cookies: wristband(role) }) });

beforeEach(() => {
  mock.state = "sent";
  mock.requested = [];
});

describe("POST /reports/send", () => {
  it("guest 401 and viewer 403: no report is made at all", async () => {
    expect((await send("/reports/send")).statusCode).toBe(401);
    const answer = await send("/reports/send", "viewer");
    expect(answer.statusCode).toBe(403);
    expect(answer.json()).toEqual({ message: "viewer accounts can only look; commands and changes are admin-only" });
    expect(mock.requested).toEqual([]);
  });

  it("admin without a choice: yesterday's report (the same as the scheduled report), times in UTC", async () => {
    const answer = await send("/reports/send", "admin");
    expect(answer.statusCode).toBe(200);
    expect(answer.json()).toEqual({ file: "report-2026-10-26.csv", from: "2026-10-25T17:00:00Z",
      to: "2026-10-26T17:00:00Z", devices: 3, size_bytes: 398, caption: "📊 …" });
    expect(mock.requested).toEqual([false]);
  });

  it("?day=today: today's partial report; ?day=yesterday is the same as no choice; ?day=tomorrow 400", async () => {
    const today = await send("/reports/send?day=today", "admin");
    expect(today.statusCode).toBe(200);
    expect(today.json()).toMatchObject({ file: "report-2026-10-27-partial.csv", to: "2026-10-27T03:15:42Z" });
    expect((await send("/reports/send?day=yesterday", "admin")).statusCode).toBe(200);
    expect((await send("/reports/send?day=tomorrow", "admin")).statusCode).toBe(400);
    expect(mock.requested).toEqual([true, false]);
  });

  it("Telegram off 409, Telegram refuses 502, database down 503: all with a message for humans", async () => {
    mock.state = "off";
    const off = await send("/reports/send", "admin");
    expect(off.statusCode).toBe(409);
    expect(off.json()).toEqual({ message: "report not sent: Telegram off (TELEGRAM_BOT_TOKEN is empty)" });
    mock.state = "refused";
    expect((await send("/reports/send", "admin")).statusCode).toBe(502);
    mock.state = "database-down";
    const db = await send("/reports/send", "admin");
    expect(db.statusCode).toBe(503);
    expect(db.json()).toEqual({ message: "the database can't be reached right now, try again shortly" });
  });
});
