// claims.test.ts - tests of the claim codes (Module 28) WITHOUT a database or a broker: the claim_codes and devices tables are replaced by
// in-memory mocks (vi.mock "../db/claims.ts"; its transaction is imitated: a failing broker step = nothing changes), the broker account
// by a mock. The REAL guard is mounted too: creating a code is admin-only, exchanging a code needs NO login but is limited to 10 per
// minute per IP. Run: npm test
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
});

const table = vi.hoisted(() => ({
  codes: new Map<string, { name: string | null; location: string | null; expires_at: number; used_by: string | null }>(),
  devices: new Map<string, { key_hash: string; revoked: boolean }>(),
  brokerAccounts: [] as string[],
  brokerFailed: false,
}));
vi.mock("../db/claims.ts", () => ({
  saveClaimCode: async (hash: string, name: string | null, location: string | null, _createdBy: string, minutes: number) => {
    const expiresAt = Date.now() + minutes * 60_000;
    table.codes.set(hash, { name, location, expires_at: expiresAt, used_by: null });
    return new Date(expiresAt);
  },
  listClaimCodes: async () => [],
  redeemClaimCode: async (hash: string, id: string, keyHash: string, atBroker: () => Promise<void>) => {
    const c = table.codes.get(hash);
    if (c === undefined || c.used_by !== null || c.expires_at <= Date.now()) return { status: "wrong-code" };
    const existing = table.devices.get(id);
    if (existing !== undefined && !existing.revoked) return { status: "still-active" };
    await atBroker(); // an error here = ROLLBACK: the code and the device don't change
    c.used_by = id;
    table.devices.set(id, { key_hash: keyHash, revoked: false });
    return { status: "succeeded", name: c.name, location: c.location };
  },
}));
vi.mock("../services/broker-accounts.ts", () => ({
  accountQueue: (work: () => Promise<unknown>) => work(), // the real queue is tested in broker-accounts.test.ts
  addDeviceAccount: async (id: string) => {
    if (table.brokerFailed) throw new Error("gateway broker pi1 didn't answer createClient within 3 seconds");
    table.brokerAccounts.push(id);
    return "created";
  },
  accountPlace: () => "gateway broker pi1",
}));
vi.mock("../services/events.ts", () => ({ recordEvent: () => {} }));
vi.mock("../services/realtime.ts", () => ({ disconnectSession: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { setupSecurity } from "../auth/security.ts";
import { hashKey } from "../auth/key.ts";
import { loadRegistry, devicePermission } from "../services/registry.ts";
import { claimRoutes } from "./claims.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await setupSecurity(app);
await app.register(claimRoutes);
await app.ready();
loadRegistry([]); // the device guest book is "loaded" (server.ts loads it from the database before it listens to the broker)
afterAll(() => app.close());

const cookie = (role: "admin" | "viewer") => `access=${app.jwt.sign({ sub: "1", role, sid: 1 })}`;
let nextIp = 1; // every test uses its own IP address, so the 10-per-minute limit doesn't carry over between tests
let ip = "";
beforeEach(() => { ip = `198.51.100.${nextIp++}`; table.brokerFailed = false; });
const makeCode = async (content: object = { name: "Node 1 garage", location: "garage" }) => app.inject({
  method: "POST", url: "/provision/code", payload: content, headers: { cookie: cookie("admin") } });
const claim = (code: string, device_id: string) => app.inject({ method: "POST", url: "/provision/claim", remoteAddress: ip,
  payload: { code, device_id } }); // WITHOUT a cookie and WITHOUT an Origin: like an ESP32

describe("claim codes: made by the admin", () => {
  it("201: the code XXXX-XXXX shown once, valid 30 minutes by default; a viewer 403, without a login 401", async () => {
    const answer = await makeCode();
    expect(answer.statusCode).toBe(201);
    expect(answer.json()).toMatchObject({ minutes: 30, name: "Node 1 garage" });
    expect(answer.json().code).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(JSON.stringify([...table.codes.keys()])).not.toContain(answer.json().code.replace("-", "")); // only the fingerprint
    expect((await app.inject({ method: "POST", url: "/provision/code", payload: {}, headers: { cookie: cookie("viewer") } }))
      .statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: "/provision/code", payload: {} })).statusCode).toBe(401);
  });

  it("minutes 5-60 only", async () => {
    expect((await makeCode({ minutes: 4 })).statusCode).toBe(400);
    expect((await makeCode({ minutes: 61 })).statusCode).toBe(400);
    expect((await makeCode({ minutes: 60 })).statusCode).toBe(201);
  });
});

describe("claim codes: exchanged by a DEVICE (no login)", () => {
  it("201 {device_id, key, mqtt_username}; a 43-character key, the database only stores its fingerprint; the broker account is made", async () => {
    const code = (await makeCode()).json().code as string;
    const answer = await claim(code.toLowerCase(), "f00d00000003"); // lowercase is fine
    expect(answer.statusCode).toBe(201);
    const content = answer.json();
    expect(content).toMatchObject({ device_id: "f00d00000003", mqtt_username: "f00d00000003" });
    expect(content.key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(table.devices.get("f00d00000003")?.key_hash).toBe(hashKey(content.key));
    expect(table.brokerAccounts).toContain("f00d00000003");
    expect(devicePermission("f00d00000003")).toBe("registered"); // the backend's guest book is updated too
  });

  it("a code used again, a wrong code, an expired code: 403 with the SAME message", async () => {
    const code = (await makeCode()).json().code as string;
    expect((await claim(code, "f00d00000004")).statusCode).toBe(201);
    const again = await claim(code, "f00d00000005");
    const wrong = await claim("ZZZZ-ZZZZ", "f00d00000005");
    const expiring = (await makeCode({ minutes: 5 })).json().code as string;
    for (const c of table.codes.values()) if (c.used_by === null) c.expires_at = Date.now() - 1;
    const stale = await claim(expiring, "f00d00000005");
    for (const a of [again, wrong, stale]) expect(a.statusCode).toBe(403);
    expect(new Set([again, wrong, stale].map((a) => a.json().message)).size).toBe(1);
  });

  it("a device that is still active can't be claimed (its identity can't be taken over): 409; a revoked one may", async () => {
    table.devices.set("a4cf12e5b7c0", { key_hash: "x", revoked: false });
    expect((await claim((await makeCode()).json().code, "a4cf12e5b7c0")).statusCode).toBe(409);
    table.devices.set("a4cf12e5b7c0", { key_hash: "x", revoked: true });
    expect((await claim((await makeCode()).json().code, "a4cf12e5b7c0")).statusCode).toBe(201);
  });

  it("the broker doesn't answer: 503 and the code is NOT used up (the next attempt succeeds)", async () => {
    const code = (await makeCode()).json().code as string;
    table.brokerFailed = true;
    expect((await claim(code, "f00d00000006")).statusCode).toBe(503);
    expect(table.devices.has("f00d00000006")).toBe(false);
    table.brokerFailed = false;
    expect((await claim(code, "f00d00000006")).statusCode).toBe(201);
  });

  it("the 11th request within a minute from the same IP address: 429 (code guessing is stopped)", async () => {
    for (let i = 0; i < 10; i++) expect((await claim("ZZZZ-ZZZZ", "f00d00000007")).statusCode).toBe(403);
    expect((await claim("ZZZZ-ZZZZ", "f00d00000007")).statusCode).toBe(429);
  });

  it("a wrong body shape: 400 (a device_id in capitals, a foreign field)", async () => {
    expect((await claim("7K2M-QF9D", "F00D00000008")).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/provision/claim", remoteAddress: ip,
      payload: { code: "7K2M-QF9D", device_id: "f00d00000008", key: "self-chosen" } })).statusCode).toBe(400);
  });
});
