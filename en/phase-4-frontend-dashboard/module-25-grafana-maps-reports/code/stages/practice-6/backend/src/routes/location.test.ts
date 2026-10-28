// location.test.ts - tests for the device's point on the map (Module 25) WITHOUT a database: the devices table is replaced by an
// in-memory fake (vi.mock), the Fastify server runs without a network (app.inject). The first part tests only the LocationBody
// schema (limits, NaN, decimal comma); the second part tests the PUT /devices/:id/location route with the REAL guard (security.ts),
// like rules.test.ts: guest 401, viewer 403, admin 200, a device_id that doesn't exist 404. Run: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts checks .env when imported: give it valid fake settings (nothing is really contacted)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.CORS_ORIGIN = "http://localhost:5173"; // the dashboard page (Vite) that may call the API from a browser
});

// the fake devices table: one registered device without a map point
const table = vi.hoisted(() => new Map<string, Record<string, unknown>>([["a4cf12e5b7c0", {
  device_id: "a4cf12e5b7c0", kind: "node1", name: "Node 1 living room", location: "living room", lat: null, lng: null,
  status: "online", last_seen: new Date(), registered_at: new Date(), key_created_at: new Date(), revoked_at: null,
  linked_via: null,
}]]));
vi.mock("../db/devices.ts", () => ({
  allDevicesDb: async () => [...table.values()],
  setDeviceLocation: async (id: string, lat: number | null, lng: number | null) => { // like UPDATE ... RETURNING
    const r = table.get(id);
    if (r === undefined) return undefined;
    Object.assign(r, { lat, lng });
    return r;
  },
  registerDevice: async () => { throw new Error("not used in this test"); },
  rotateDeviceKey: async () => { throw new Error("not used in this test"); },
  revokeDevice: async () => { throw new Error("not used in this test"); },
}));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { setupSecurity } from "../auth/security.ts";
import { LocationBody, deviceRoutes } from "./devices.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await setupSecurity(app); // CORS, cookies, JWT, and the same guard as server.ts
await app.register(deviceRoutes);
await app.ready();
afterAll(() => app.close());

// a "wristband" (access JWT) that is valid because it is signed with the test JWT_SECRET above, sent as the access cookie
const wristband = (role: "admin" | "viewer") => ({ access: app.jwt.sign({ sub: role === "admin" ? "1" : "2", role, sid: 1 }) });
const put = (id: string, body: unknown, role?: "admin" | "viewer") => app.inject({ method: "PUT", url: `/devices/${id}/location`,
  ...(typeof body === "string" ? { payload: body, headers: { "content-type": "application/json" } } : { payload: body as object }),
  ...(role === undefined ? {} : { cookies: wristband(role) }) });
// a FICTIONAL point in a public place (around Monas, Jakarta), nobody's home
const MONAS = { lat: -6.1754, lng: 106.8272 };

describe("the LocationBody schema", () => {
  it("the range limits are accepted: -90, 90, -180, 180; also null + null (remove the point)", () => {
    for (const body of [{ lat: -90, lng: -180 }, { lat: 90, lng: 180 }, MONAS, { lat: null, lng: null }]) {
      expect(LocationBody.safeParse(body).success).toBe(true);
    }
  });

  it("outside the range is refused with a message that names the limit", () => {
    const latitude = LocationBody.safeParse({ lat: 90.0001, lng: 0 });
    expect(latitude.success).toBe(false);
    expect(latitude.error?.issues[0]).toMatchObject({ path: ["lat"], message: "latitude at most 90" });
    const longitude = LocationBody.safeParse({ lat: 0, lng: -180.5 });
    expect(longitude.error?.issues[0]).toMatchObject({ path: ["lng"], message: "longitude at least -180" });
  });

  it("NaN and Infinity aren't finite numbers: refused", () => {
    const message = "must be a finite number (not NaN or Infinity)";
    expect(LocationBody.safeParse({ lat: Number.NaN, lng: 106.8 }).error?.issues[0]).toMatchObject({ path: ["lat"], message });
    expect(LocationBody.safeParse({ lat: -6.2, lng: Number.POSITIVE_INFINITY }).error?.issues[0])
      .toMatchObject({ path: ["lng"], message });
  });

  it("the decimal comma \"-6,2\" is text, not a number: refused with a decimal-point hint", () => {
    const result = LocationBody.safeParse({ lat: "-6,2", lng: 106.8 });
    expect(result.error?.issues[0]).toMatchObject({
      path: ["lat"], message: "must be a number with a decimal point, for example -6.1754 (not the text \"-6,1754\")",
    });
  });

  it("half a point, a missing field, and a foreign field (the location text) are refused", () => {
    expect(LocationBody.safeParse({ lat: -6.2, lng: null }).error?.issues[0]).toMatchObject({ path: ["lng"],
      message: "lat and lng go in pairs: both numbers, or both null to remove the point" });
    expect(LocationBody.safeParse({ lat: -6.2 }).error?.issues[0]).toMatchObject({ path: ["lng"],
      message: "required: a number, or null to remove the point" });
    expect(LocationBody.safeParse({ ...MONAS, location: "park" }).success).toBe(false);
  });
});

describe("PUT /devices/:id/location", () => {
  it("guest (not logged in): 401, the point doesn't change", async () => {
    expect((await put("a4cf12e5b7c0", MONAS)).statusCode).toBe(401);
    expect(table.get("a4cf12e5b7c0")?.lat).toBeNull();
  });

  it("viewer: may look at GET /devices (200), but moving the point is answered 403", async () => {
    expect((await app.inject({ method: "GET", url: "/devices", cookies: wristband("viewer") })).statusCode).toBe(200);
    const answer = await put("a4cf12e5b7c0", MONAS, "viewer");
    expect(answer.statusCode).toBe(403);
    expect(answer.json()).toEqual({ message: "viewer accounts can only look; commands and changes are admin-only" });
    expect(table.get("a4cf12e5b7c0")?.lat).toBeNull();
  });

  it("admin: 200 with the whole device row, and GET /devices carries the new point at once", async () => {
    const answer = await put("a4cf12e5b7c0", MONAS, "admin");
    expect(answer.statusCode).toBe(200);
    expect(answer.json()).toMatchObject({ device_id: "a4cf12e5b7c0", location: "living room", ...MONAS, key: "active" });
    const list = (await app.inject({ method: "GET", url: "/devices", cookies: wristband("viewer") })).json();
    expect(list[0]).toMatchObject(MONAS);
  });

  it("admin: { lat: null, lng: null } removes the point", async () => {
    const answer = await put("a4cf12e5b7c0", { lat: null, lng: null }, "admin");
    expect(answer.statusCode).toBe(200);
    expect(answer.json()).toMatchObject({ lat: null, lng: null });
  });

  it("admin: a decimal comma, out of range, and 1e999 (Infinity after JSON.parse) are answered 400", async () => {
    const comma = await put("a4cf12e5b7c0", { lat: "-6,2", lng: 106.8 }, "admin");
    expect(comma.statusCode).toBe(400);
    expect(comma.json().message).toContain("must be a number with a decimal point");
    expect((await put("a4cf12e5b7c0", { lat: -91, lng: 106.8 }, "admin")).statusCode).toBe(400);
    const infinite = await put("a4cf12e5b7c0", "{\"lat\": 1e999, \"lng\": 106.8}", "admin");
    expect(infinite.statusCode).toBe(400);
    expect(infinite.json().message).toBe("body/lat must be a finite number (not NaN or Infinity)");
    expect(table.get("a4cf12e5b7c0")?.lat).toBeNull(); // nothing was saved
  });

  it("a device_id that isn't in the list: 404 with the exact message; an invalid device_id: 400", async () => {
    const answer = await put("f00d000000ff", MONAS, "admin");
    expect(answer.statusCode).toBe(404);
    expect(answer.json()).toEqual({ message: "f00d000000ff isn't in the device list" });
    expect((await put("NOT-AN-ID", MONAS, "admin")).statusCode).toBe(400);
  });

  it("a browser on the dashboard (CORS_ORIGIN): the preflight allows PUT", async () => {
    const preflight = await app.inject({ method: "OPTIONS", url: "/devices/a4cf12e5b7c0/location",
      headers: { origin: "http://localhost:5173", "access-control-request-method": "PUT" } });
    expect(preflight.statusCode).toBe(204);
    expect(preflight.headers["access-control-allow-methods"]).toContain("PUT");
  });
});
