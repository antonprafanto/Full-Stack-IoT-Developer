// fleet.test.ts - tests of the /fleet page routes (Module 28) WITHOUT a database or a broker: the db/fleet.ts queries are replaced by
// mocks, the update commands (services/ota.ts) by a mock that records its calls (its sending rules are tested by ota.test.ts). The
// REAL guard is mounted too: every role may look, the buttons are admin-only. Run: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.SERVER_URL = "https://iot.yourname.my.id";
  process.env.AUTO_BROKER_ACCOUNTS = "gateway:pi1";
});

const T = new Date("2026-10-31T01:00:00Z");
const ROW = { name: null, location: null, status: "online", last_seen: T, linked_via: null, revoked_at: null, canary: false,
  vitals_interval_s: null, fw_seen_at: T, reset_reason: null, health_ts: null, rssi: null, heap_free: null, uptime_s: null,
  health_reset_reason: null, u_id: null, u_status: null, u_from: null, u_to: null, u_message: null, u_created_at: null,
  u_updated_at: null, u_finished_at: null };
const calls = vi.hoisted(() => ({ update: [] as unknown[], interval: [] as unknown[] }));
vi.mock("../db/fleet.ts", () => ({
  allReleases: async () => [
    { kind: "node1", version: "1.7.1", test: false, withdrawn_at: null },
    { kind: "node1", version: "1.7.2", test: true, withdrawn_at: null }, // a test release is never "latest"
  ],
  fleetData: async () => [
    { ...ROW, device_id: "a4cf12e5b7c0", kind: "node1", fw: "1.7.0", canary: true, health_ts: T, rssi: -61, heap_free: 183200,
      uptime_s: 12, health_reset_reason: "SW", u_id: "c-20261031-010000-1", u_status: "succeeded", u_from: "1.6.0",
      u_to: "1.7.0", u_created_at: T, u_updated_at: T, u_finished_at: T },
    { ...ROW, device_id: "246f28b1c7d4", kind: "node2", fw: "1.0.0", linked_via: "a4cf12e5b7c0" },
    { ...ROW, device_id: "f00d00000009", kind: "node1", fw: "1.7.0", revoked_at: T, status: "online" },
  ],
  updateHistory: async () => [],
  changeCanary: async (id: string, canary: boolean) => (id === "a4cf12e5b7c0" ? { device_id: id, canary } : undefined),
  changeVitalsInterval: async (id: string, seconds: number) => (id === "a4cf12e5b7c0"
    ? { device_id: id, vitals_interval_s: seconds, fw: "1.6.0" } : undefined),
}));
vi.mock("../services/ota.ts", async (original) => ({
  ...(await original<typeof import("../services/ota.ts")>()), // the real blockedReason
  requestUpdate: async (id: string, version: string, requestedBy: string, force: boolean) => {
    calls.update.push({ id, version, requestedBy, force });
    if (version === "1.7.2") return { status: "rejected", id: "c-2", device_id: id, message: "still in the 60-second trial period" };
    if (version === "9.9.9") return { status: "not-sent", device_id: id, code: 404, message: "that firmware version hasn't been uploaded yet" };
    return { status: "accepted", id: "c-1", device_id: id, from: "1.7.0", to: version, wait_ms: 12 };
  },
  updateFleet: async (version: string, target: string) => (target === "all"
    ? { code: 409, message: `no canary device has run ${version} successfully yet: update the canary first` }
    : { version, target, sent: [{ status: "accepted", id: "c-3", device_id: "a4cf12e5b7c0", from: "1.7.0", to: version, wait_ms: 9 }],
      skipped: [{ device_id: "f00d00000009", reason: "device already deactivated (its key revoked)" }] }),
}));
vi.mock("../services/automation.ts", () => ({
  setVitalsInterval: (id: string, seconds: number) => { calls.interval.push({ id, seconds }); },
  sendConfigFor: () => "c-20261031-010000-9",
}));
vi.mock("../services/realtime.ts", () => ({ disconnectSession: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { setupSecurity } from "../auth/security.ts";
import { fleetRoutes } from "./fleet.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await setupSecurity(app);
await app.register(fleetRoutes);
await app.ready();
afterAll(() => app.close());

const cookie = (role: "admin" | "viewer") => `access=${app.jwt.sign({ sub: role === "admin" ? "1" : "2", role, sid: 1 })}`;
const send = (method: "GET" | "POST" | "PUT", url: string, payload?: object, role: "admin" | "viewer" = "admin") =>
  app.inject({ method, url, ...(payload === undefined ? {} : { payload }), headers: { cookie: cookie(role) } });

describe("GET /fleet", () => {
  it("a viewer may look; a test release isn't the latest release; an older Node 1 needs an update and can be updated", async () => {
    const answer = await send("GET", "/fleet", undefined, "viewer");
    expect(answer.statusCode).toBe(200);
    const content = answer.json();
    expect(content.latest_release).toEqual({ node1: "1.7.1" });
    expect(content.settings).toEqual({ ota_ready: true, broker_accounts: "gateway broker pi1" });
    expect(content.devices[0]).toMatchObject({ device_id: "a4cf12e5b7c0", fw: "1.7.0", needs_update: true, can_update: true,
      canary: true, health: { rssi: -61, reset_reason: "SW" }, update: { status: "succeeded", from: "1.6.0", to: "1.7.0" } });
  });

  it("Node 2: OTA not available (by cable); a deactivated device: key revoked, status offline, can't be updated", async () => {
    const [, node2, revoked] = (await send("GET", "/fleet")).json().devices;
    expect(node2).toMatchObject({ kind: "node2", key: "no-key", fw: "1.0.0", needs_update: false, can_update: false });
    expect(node2.blocked_reason).toContain("by cable");
    expect(revoked).toMatchObject({ key: "revoked", status: "offline", can_update: false, needs_update: false });
  });
});

describe("the admin buttons", () => {
  it("a viewer presses Update: 403 (the guard); admin: 202 accepted (NOT finished)", async () => {
    expect((await send("POST", "/devices/a4cf12e5b7c0/update", { version: "1.7.1" }, "viewer")).statusCode).toBe(403);
    const answer = await send("POST", "/devices/a4cf12e5b7c0/update", { version: "1.7.1" });
    expect(answer.statusCode).toBe(202);
    expect(answer.json()).toMatchObject({ status: "accepted", id: "c-1", to: "1.7.1" });
    expect(calls.update.at(-1)).toEqual({ id: "a4cf12e5b7c0", version: "1.7.1", requestedBy: "1", force: false });
  });

  it("the device refuses: 422 with its reason; not uploaded yet: 404; a version that isn't x.y.z: 400", async () => {
    expect((await send("POST", "/devices/a4cf12e5b7c0/update", { version: "1.7.2" })).json())
      .toEqual({ message: "device refused: still in the 60-second trial period" });
    expect((await send("POST", "/devices/a4cf12e5b7c0/update", { version: "9.9.9" })).statusCode).toBe(404);
    expect((await send("POST", "/devices/a4cf12e5b7c0/update", { version: "1.7" })).statusCode).toBe(400);
  });

  it("update canary 202 (the skipped ones with their reasons); update all before a canary succeeded 409", async () => {
    const canary = await send("POST", "/fleet/update", { version: "1.7.1", target: "canary" });
    expect(canary.statusCode).toBe(202);
    expect(canary.json().skipped[0].reason).toContain("deactivated");
    const all = await send("POST", "/fleet/update", { version: "1.7.1", target: "all" });
    expect(all.statusCode).toBe(409);
    expect(all.json().message).toContain("canary");
  });

  it("the vitals interval 60-3600 seconds; older firmware gets a note; Node 2/unknown 404", async () => {
    const answer = await send("PUT", "/devices/a4cf12e5b7c0/intervals", { vitals_s: 60 });
    expect(answer.statusCode).toBe(200);
    expect(answer.json()).toMatchObject({ vitals_interval_s: 60, config_id: "c-20261031-010000-9" });
    expect(answer.json().note).toContain("since 1.7.0");
    expect(calls.interval).toEqual([{ id: "a4cf12e5b7c0", seconds: 60 }]);
    expect((await send("PUT", "/devices/a4cf12e5b7c0/intervals", { vitals_s: 30 })).statusCode).toBe(400);
    expect((await send("PUT", "/devices/246f28b1c7d4/intervals", { vitals_s: 60 })).statusCode).toBe(404);
  });

  it("canary: mark and unmark; not an active Node 1 404", async () => {
    expect((await send("PUT", "/devices/a4cf12e5b7c0/canary", { canary: true })).json()).toEqual({ device_id: "a4cf12e5b7c0", canary: true });
    expect((await send("PUT", "/devices/246f28b1c7d4/canary", { canary: true })).statusCode).toBe(404);
  });
});
