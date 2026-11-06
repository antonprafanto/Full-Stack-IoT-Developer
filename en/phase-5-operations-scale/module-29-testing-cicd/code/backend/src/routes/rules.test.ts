// rules.test.ts - tests for the DELETE /rules/:id route (Module 24) WITHOUT a database, MQTT, or schedules: automation.ts and
// schedule.ts are replaced by fakes (vi.mock), the Fastify server runs without a network (app.inject). Unlike devices.test.ts,
// the REAL guard (security.ts) is mounted here, to prove that a new route is guarded automatically: guests 401, viewer 403,
// a foreign page 403, and a browser on a page in CORS_ORIGIN may send DELETE (preflight). Run: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts checks .env when imported: give it valid fake settings (nothing is really contacted)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.CORS_ORIGIN = "http://localhost:5173"; // the dashboard page (Vite) that may call the API from a browser
});

// the fake rules table: number -> rule name
const table = vi.hoisted(() => new Map<number, string>([[1, "Water if soil < 30 %"], [2, "Automatic fan"]]));
vi.mock("../services/automation.ts", () => ({
  allRules: () => [],
  findRule: () => undefined,
  createRule: async () => { throw new Error("not used in this test"); },
  replaceRule: async () => undefined,
  deleteRule: async (id: number) => { // like deleteRuleDb: the number and name that were deleted, or undefined
    const name = table.get(id);
    if (name === undefined) return undefined;
    table.delete(id);
    return { id, name };
  },
}));
vi.mock("../services/schedule.ts", () => ({
  nextRun: () => null,
  runSchedule: async () => { throw new Error("not used in this test"); },
}));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { setupSecurity } from "../auth/security.ts";
import { ruleRoutes } from "./rules.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await setupSecurity(app); // CORS, cookies, JWT, and the same guard as server.ts
await app.register(ruleRoutes);
await app.ready();
afterAll(() => app.close());

// a "wristband" (access JWT) that is valid because it is signed with the test JWT_SECRET above, sent as the access cookie
const wristband = (role: "admin" | "viewer") => ({ access: app.jwt.sign({ sub: role === "admin" ? "1" : "2", role, sid: 1 }) });
const DASHBOARD = "http://localhost:5173";

describe("DELETE /rules/:id", () => {
  it("guest (not logged in): 401, the rule is still there", async () => {
    const answer = await app.inject({ method: "DELETE", url: "/rules/1" });
    expect(answer.statusCode).toBe(401);
    expect(table.has(1)).toBe(true);
  });

  it("viewer: may see the rule list (200), but deleting is answered 403 and the rule is still there", async () => {
    expect((await app.inject({ method: "GET", url: "/rules", cookies: wristband("viewer") })).statusCode).toBe(200);
    const answer = await app.inject({ method: "DELETE", url: "/rules/1", cookies: wristband("viewer") });
    expect(answer.statusCode).toBe(403);
    expect(answer.json()).toEqual({ message: "viewer accounts can only look; commands and changes are admin-only" });
    expect(table.has(1)).toBe(true);
  });

  it("admin: 200 with the number, name, and message; deleted once more: 404", async () => {
    const answer = await app.inject({ method: "DELETE", url: "/rules/1", cookies: wristband("admin") });
    expect(answer.statusCode).toBe(200);
    expect(answer.json()).toEqual({ id: 1, name: "Water if soil < 30 %", message: "rule 1 (Water if soil < 30 %) deleted" });
    const again = await app.inject({ method: "DELETE", url: "/rules/1", cookies: wristband("admin") });
    expect(again.statusCode).toBe(404);
    expect(again.json()).toEqual({ message: "rule 1 doesn't exist" });
  });

  it("a rule number that isn't a number: 400", async () => {
    expect((await app.inject({ method: "DELETE", url: "/rules/abc", cookies: wristband("admin") })).statusCode).toBe(400);
  });

  it("a browser on a foreign page: 403 even for an admin, the rule is still there", async () => {
    const answer = await app.inject({ method: "DELETE", url: "/rules/2", cookies: wristband("admin"),
      headers: { origin: "http://foreign-example.test" } });
    expect(answer.statusCode).toBe(403);
    expect(answer.json()).toEqual({ message: "request from the page http://foreign-example.test refused" });
    expect(table.has(2)).toBe(true);
  });

  it("a browser on the dashboard (CORS_ORIGIN): the preflight allows DELETE, then the request is accepted", async () => {
    const preflight = await app.inject({ method: "OPTIONS", url: "/rules/2",
      headers: { origin: DASHBOARD, "access-control-request-method": "DELETE" } });
    expect(preflight.statusCode).toBe(204);
    expect(preflight.headers["access-control-allow-methods"]).toBe("GET, HEAD, POST, PUT, DELETE");
    const answer = await app.inject({ method: "DELETE", url: "/rules/2", cookies: wristband("admin"), headers: { origin: DASHBOARD } });
    expect(answer.statusCode).toBe(200);
    expect(answer.headers["access-control-allow-origin"]).toBe(DASHBOARD);
    expect(table.has(2)).toBe(false);
  });
});
