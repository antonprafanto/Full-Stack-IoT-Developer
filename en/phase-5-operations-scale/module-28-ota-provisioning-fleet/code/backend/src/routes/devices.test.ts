// devices.test.ts - tests for the official device registry routes (Module 21) WITHOUT a database: the devices table is replaced
// by an in-memory fake (vi.mock), the Fastify server runs without a network (app.inject). What is tested: the key is shown once,
// only its fingerprint is stored, a double registration is refused, key rotation, revoke, an ESP-NOW device with no key. The
// login guard (Module 20) isn't mounted here: 401 and 403 are already handled by security.ts for ALL routes.
// Module 28: automatic broker accounts (broker-accounts.ts replaced by a mock) inside the same transaction, and "Deactivate" (revoke):
// the status written offline, the retained config deleted, a revoked event. Run: npm test
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

vi.hoisted(() => { // env.ts checks .env when imported: give it valid fake settings (nothing is really contacted)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
});

// the fake devices table: device_id -> row (including key_hash, which the real database also has)
const table = vi.hoisted(() => new Map<string, Record<string, unknown>>());
// Module 28: a mock broker account. mode "manual" = AUTO_BROKER_ACCOUNTS=off (like Module 21)
const broker = vi.hoisted(() => ({ mode: "manual" as "manual" | "auto" | "fail" | "old-account", log: [] as string[],
  config: [] as string[], events: [] as { kind: string; message: string }[] }));
vi.mock("../services/broker-accounts.ts", () => ({
  accountQueue: (work: () => Promise<unknown>) => work(), // the real queue is tested in broker-accounts.test.ts
  accountPlace: () => (broker.mode === "manual" ? "by hand (Module 21)" : "gateway broker pi1"),
  addDeviceAccount: async (id: string) => {
    if (broker.mode === "fail") throw new Error("gateway broker pi1 didn't answer createClient within 3 seconds");
    if (broker.mode === "manual") return "manual";
    broker.log.push(`create ${id}`);
    return "created";
  },
  removeDeviceAccount: async (id: string) => {
    if (broker.mode === "fail") throw new Error("gateway broker pi1 didn't answer deleteClient within 3 seconds");
    if (broker.mode === "manual") return "manual";
    broker.log.push(`delete ${id}`);
    return broker.mode === "old-account" ? "none" : "deleted";
  },
}));
vi.mock("../services/mqtt.ts", () => ({
  brokerConnected: () => true, makeCommandId: () => "c-1", sendCommand: () => {},
  clearConfig: (id: string) => { broker.config.push(id); },
}));
vi.mock("../services/events.ts", () => ({ recordEvent: (e: { kind: string; message: string }) => { broker.events.push(e); } }));
vi.mock("../db/devices.ts", () => {
  const EMPTY = { kind: "unknown", name: null, location: null, lat: null, lng: null, status: "unknown",
    last_seen: null, registered_at: null, key_hash: null, key_created_at: null, revoked_at: null, linked_via: null };
  const withoutHash = (r: Record<string, unknown>) => { const { key_hash: _, ...rest } = r; return rest; };
  return {
    allDevicesDb: async () => [...table.values()].map(withoutHash),
    // Module 28: the broker step (atBroker) runs BEFORE the table changes; an error = nothing changes (the transaction)
    registerDevice: async (id: string, name: string | null, location: string | null, linkedVia: string | null,
      keyHash: string | null, atBroker = async (_r: unknown) => {}) => {
      const old = table.get(id);
      if (old?.registered_at) return undefined;
      const fresh = { ...EMPTY, ...old, device_id: id, name: name ?? old?.name ?? null, location, linked_via: linkedVia,
        kind: linkedVia ? "node2" : (old?.kind ?? "unknown"), registered_at: new Date(), key_hash: keyHash,
        key_created_at: keyHash ? new Date() : null, revoked_at: null };
      await atBroker(withoutHash(fresh));
      table.set(id, fresh);
      return withoutHash(fresh);
    },
    rotateDeviceKey: async (id: string, keyHash: string, atBroker = async (_r: unknown) => {}) => {
      const r = table.get(id);
      if (!r?.registered_at || r.linked_via) return undefined;
      await atBroker(withoutHash(r));
      Object.assign(r, { key_hash: keyHash, key_created_at: new Date(), revoked_at: null });
      return withoutHash(r);
    },
    revokeDevice: async (id: string, atBroker = async (_r: unknown) => {}) => {
      const r = table.get(id);
      if (!r?.registered_at || r.revoked_at) return undefined;
      await atBroker(withoutHash(r));
      Object.assign(r, { key_hash: null, key_created_at: null, revoked_at: new Date(), status: "offline" });
      return withoutHash(r);
    },
  };
});

import Fastify from "fastify";
import type { LightMyRequestResponse } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { deviceRoutes } from "./devices.ts";
import { loadRegistry, devicePermission } from "../services/registry.ts";
import { findDevice, saveStatus } from "../services/store.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
// stand-in for the guard: every request is treated as coming from admin account number 1
app.addHook("onRequest", async (req) => {
  req.user = { sub: "1", role: "admin", sid: 1, iat: 0, exp: 0 };
});
await app.register(deviceRoutes);

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
const post = (url: string, body?: object): Promise<LightMyRequestResponse> =>
  app.inject({ method: "POST", url, ...(body === undefined ? {} : { payload: body }) });

beforeAll(() => {
  // one old row from Modules 17-20 (auto-created, not registered), then the in-memory registry is loaded as when the server starts
  table.set("a4cf12e5b7c0", { device_id: "a4cf12e5b7c0", kind: "node1", name: null, location: null, lat: null, lng: null,
    status: "online", last_seen: new Date(), registered_at: null, key_hash: null, key_created_at: null, revoked_at: null,
    linked_via: null });
  loadRegistry([...table.values()] as never);
});
afterAll(() => app.close());

describe("official device registry", () => {
  let firstKey = "";

  it("an old unregistered row: GET /devices marks it unregistered", async () => {
    expect(devicePermission("a4cf12e5b7c0")).toBe("unregistered");
    const answer = await app.inject({ method: "GET", url: "/devices" });
    expect(answer.statusCode).toBe(200);
    // Module 25: the map point shows too; null = not set yet
    expect(answer.json()[0]).toMatchObject({ device_id: "a4cf12e5b7c0", key: "unregistered", registered_at: null, lat: null,
      lng: null });
  });

  it("POST /devices: 201, the 43-character key is shown ONCE, the database stores only its SHA-256", async () => {
    const answer = await post("/devices", { device_id: "a4cf12e5b7c0", name: "Node 1 living room" });
    expect(answer.statusCode).toBe(201);
    const body = answer.json();
    expect(body.key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(body.steps.length).toBe(3);
    firstKey = body.key;
    expect(table.get("a4cf12e5b7c0")?.key_hash).toBe(sha256(firstKey));
    expect(JSON.stringify([...table.values()])).not.toContain(firstKey);
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
  });

  it("GET /devices never includes the key or its fingerprint", async () => {
    const text = (await app.inject({ method: "GET", url: "/devices" })).body;
    expect(text).not.toContain(firstKey);
    expect(text).not.toContain(sha256(firstKey));
    expect(text).not.toContain("key_hash");
    expect(JSON.parse(text)[0]).toMatchObject({ key: "active", name: "Node 1 living room" });
  });

  it("a second registration for the same device_id: 409", async () => {
    const answer = await post("/devices", { device_id: "a4cf12e5b7c0" });
    expect(answer.statusCode).toBe(409);
    expect(answer.json().message).toContain("already registered");
  });

  it("invalid body: 400 (uppercase device_id, unknown field)", async () => {
    expect((await post("/devices", { device_id: "A4CF12E5B7C0" })).statusCode).toBe(400);
    expect((await post("/devices", { device_id: "a4cf12e5b7c1", key: "my-own-choice" })).statusCode).toBe(400);
  });

  it("key rotation: the new key is different, the old key's fingerprint is removed at once", async () => {
    const answer = await post("/devices/a4cf12e5b7c0/key");
    expect(answer.statusCode).toBe(200);
    const fresh = answer.json().key as string;
    expect(fresh).not.toBe(firstKey);
    expect(table.get("a4cf12e5b7c0")?.key_hash).toBe(sha256(fresh));
  });

  it("an ESP-NOW device (Node 2): no key, linked_via must be registered, the answer contains ACL lines", async () => {
    expect((await post("/devices", { device_id: "246f28b1c7d4", linked_via: "0123456789ab" })).statusCode).toBe(409);
    const answer = await post("/devices", { device_id: "246f28b1c7d4", name: "Node 2 garden", linked_via: "a4cf12e5b7c0" });
    expect(answer.statusCode).toBe(201);
    expect(answer.json().key).toBeNull();
    expect(answer.json().steps).toContain("topic write msh/246f28b1c7d4/telemetry");
    expect((await post("/devices/246f28b1c7d4/key")).statusCode).toBe(404); // an ESP-NOW device has no key
  });

  it("revoke: 200, the guest book records revoked at once, a second revoke 404, its fingerprint is removed", async () => {
    expect((await post("/devices", { device_id: "f00d00000001" })).statusCode).toBe(201);
    const answer = await post("/devices/f00d00000001/revoke");
    expect(answer.statusCode).toBe(200);
    expect(answer.json().revoked_at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    expect(devicePermission("f00d00000001")).toBe("revoked");
    expect(table.get("f00d00000001")?.key_hash).toBeNull();
    expect((await post("/devices/f00d00000001/revoke")).statusCode).toBe(404);
    const list = (await app.inject({ method: "GET", url: "/devices" })).json();
    expect(list.find((d: { device_id: string }) => d.device_id === "f00d00000001").key).toBe("revoked");
  });

  it("a revoked device can be brought back to life with a new key", async () => {
    const answer = await post("/devices/f00d00000001/key");
    expect(answer.statusCode).toBe(200);
    expect(devicePermission("f00d00000001")).toBe("registered");
  });
});

describe("automatic broker accounts and Deactivate (Module 28)", () => {
  it("registration with AUTO_BROKER_ACCOUNTS: the backend creates the broker account; the steps don't say mosquitto_passwd", async () => {
    broker.mode = "auto";
    const answer = await post("/devices", { device_id: "f00d00000021", name: "Module 28 practice" });
    expect(answer.statusCode).toBe(201);
    expect(broker.log).toContain("create f00d00000021");
    expect(answer.json().steps[2]).toContain("automatically at gateway broker pi1");
    expect(answer.json().steps.join(" ")).not.toContain("mosquitto_passwd");
  });

  it("the broker doesn't answer: 503, the database doesn't change (the device stays unregistered), the reader is told to repeat", async () => {
    broker.mode = "fail";
    const answer = await post("/devices", { device_id: "f00d00000022" });
    expect(answer.statusCode).toBe(503);
    expect(answer.json().message).toContain("not saved in the database yet");
    expect(answer.json().message).toContain("repeat this step");
    expect(table.has("f00d00000022")).toBe(false);
    expect(devicePermission("f00d00000022")).toBe("unregistered");
  });

  it("Deactivate: the broker account deleted (disconnected at once), status offline, retained config deleted, a revoked event", async () => {
    broker.mode = "auto";
    saveStatus("f00d00000021", "online"); // the dashboard sees it online...
    const answer = await post("/devices/f00d00000021/revoke");
    expect(answer.statusCode).toBe(200);
    expect(answer.json()).toMatchObject({ broker_account: "deleted" });
    expect(broker.log).toContain("delete f00d00000021");
    expect(findDevice("f00d00000021")?.status).toBe("offline"); // ...the broker publishes no will: the server writes it
    expect(table.get("f00d00000021")?.status).toBe("offline");
    expect(broker.config).toContain("f00d00000021");
    expect(broker.events.at(-1)).toMatchObject({ kind: "revoked" });
  });

  it("an old Module 21 account (password_file, not in dynamic security): the steps say mosquitto_passwd -D then restart", async () => {
    broker.mode = "old-account";
    expect((await post("/devices", { device_id: "f00d00000023" })).statusCode).toBe(201);
    const answer = await post("/devices/f00d00000023/revoke");
    expect(answer.json().broker_account).toBe("none");
    expect(answer.json().steps[0]).toContain("mosquitto_passwd -D");
    broker.mode = "manual";
  });

  it("the broker fails during Deactivate: 503, the key is NOT revoked yet (try again)", async () => {
    broker.mode = "auto";
    expect((await post("/devices", { device_id: "f00d00000024" })).statusCode).toBe(201);
    broker.mode = "fail";
    expect((await post("/devices/f00d00000024/revoke")).statusCode).toBe(503);
    expect(devicePermission("f00d00000024")).toBe("registered");
    broker.mode = "manual";
  });
});
