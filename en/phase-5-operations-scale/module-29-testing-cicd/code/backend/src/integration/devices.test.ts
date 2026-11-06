// devices.test.ts - INTEGRATION tests of the device registry (Modules 21 + 28) with a REAL test database (Module 29).
// The difference with routes/devices.test.ts: there the devices table is replaced by a mock in memory (vi.mock), so the SQL
// queries in src/db/devices.ts are never run. Here INSERT, UPDATE, transactions, CHECK, and foreign keys are really checked by
// PostgreSQL. A real example: if src/db/devices.ts one day writes the key fingerprint wrongly (for example upper($5), capitals),
// the 203 mock tests stay green, but CHECK (key_hash ~ '^[0-9a-f]{64}$') of migration 010 refuses the row: POST /devices
// is answered with 503 and the first test below is red.
// Run (the test database running, DATABASE_URL_TEST filled in; see setup.ts): npm run test:integration
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hasTestDatabase, registerDevice, deleteTestDevices, setupTest } from "./setup.ts";
import type { TestKit } from "./setup.ts";

// device_ids of this file only (prefix 2901): the other integration test files run at the same time with IDs of their own
const NEW_DEVICE = "290100000001";
const DUPLICATE = "290100000002";
const LISTED = "290100000003";
const REVOKED = "290100000004";
const ALL = [NEW_DEVICE, DUPLICATE, LISTED, REVOKED];
const fingerprint = (key: string) => createHash("sha256").update(key).digest("hex"); // computed here, not by the server code
// the server version read here from package.json (not from src/config/server-version.ts, which is under test)
const VERSION = (JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string }).version;

describe.skipIf(!hasTestDatabase)("integration (test database): devices", () => {
  let kit: TestKit;
  beforeAll(async () => { kit = await setupTest(); }, 60_000); // the migration may wait for another file's turn
  beforeEach(() => deleteTestDevices(kit.pool, ALL)); // every test starts without this file's devices
  afterAll(async () => {
    if (!kit) return; // setupTest() failed (for example the _test guard refused): its error was already reported
    await deleteTestDevices(kit.pool, ALL);
    await kit.close();
  });

  it("POST /devices: the key is shown once, the database stores only its SHA-256 fingerprint (CHECK key_hash)", async () => {
    const answer = await kit.app.inject({ method: "POST", url: "/devices", cookies: kit.wristband("admin"),
      payload: { device_id: NEW_DEVICE, name: "Integration test", location: "robot lab" } });
    expect(answer.statusCode).toBe(201);
    const { key } = answer.json() as { key: string };
    expect(key).toMatch(/^[A-Za-z0-9_-]{43}$/);

    // read straight from the table: what is stored is its fingerprint (64 lowercase hexadecimal digits), not the key
    const result = await kit.pool.query<{ key_hash: string; name: string; registered_at: Date | null }>(
      "SELECT key_hash, name, registered_at FROM devices WHERE device_id = $1", [NEW_DEVICE]);
    expect(result.rowCount).toBe(1);
    expect(result.rows[0].key_hash).toBe(fingerprint(key));
    expect(result.rows[0].key_hash).not.toContain(key);
    expect(result.rows[0].name).toBe("Integration test");
    expect(result.rows[0].registered_at).toBeInstanceOf(Date);
  });

  it("registering the same device_id again: 409, the name and the key fingerprint in the database don't change", async () => {
    const key = await registerDevice(kit, DUPLICATE, "Original node");
    const again = await kit.app.inject({ method: "POST", url: "/devices", cookies: kit.wristband("admin"),
      payload: { device_id: DUPLICATE, name: "Intruder node" } });
    expect(again.statusCode).toBe(409);

    // ON CONFLICT ... WHERE registered_at IS NULL: a row that is already registered must not be overwritten
    const result = await kit.pool.query("SELECT name, key_hash FROM devices WHERE device_id = $1", [DUPLICATE]);
    expect(result.rows).toEqual([{ name: "Original node", key_hash: fingerprint(key) }]);
  });

  it("GET /devices from the database without leaking the key; without a login 401; /health names the version and the database", async () => {
    const key = await registerDevice(kit, LISTED, "Listed node");
    const answer = await kit.app.inject({ method: "GET", url: "/devices", cookies: kit.wristband("viewer") }); // a viewer may look
    expect(answer.statusCode).toBe(200);

    const list = answer.json() as { device_id: string; name: string | null; key: string }[];
    expect(list.find((d) => d.device_id === LISTED)).toMatchObject({ name: "Listed node", key: "active" });
    expect(answer.body).not.toContain(key);
    expect(answer.body).not.toContain(fingerprint(key));
    expect(answer.body).not.toContain("key_hash");

    // the production assembly (buildApp) is guarded too: the login guard is in place, and /health (the version proof on the
    // VPS/Pi) names the package.json version and the connected database
    expect((await kit.app.inject({ method: "GET", url: "/devices" })).statusCode).toBe(401);
    const health = await kit.app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toMatchObject({ ok: true, version: VERSION, database: true });
  });

  it("revoke (Deactivate): the key fingerprint deleted, the revoke time and the status offline written, the event in the events table", async () => {
    await registerDevice(kit, REVOKED);
    const answer = await kit.app.inject({ method: "POST", url: `/devices/${REVOKED}/revoke`, cookies: kit.wristband("admin") });
    expect(answer.statusCode).toBe(200);

    const result = await kit.pool.query<{ key_hash: string | null; revoked_at: Date | null; status: string }>(
      "SELECT key_hash, revoked_at, status FROM devices WHERE device_id = $1", [REVOKED]);
    expect(result.rows[0]).toMatchObject({ key_hash: null, status: "offline" });
    expect(result.rows[0].revoked_at).toBeInstanceOf(Date);
    // the event log is written by the route without waiting (recordEvent), so its row is waited for briefly (at most 1 second)
    await vi.waitFor(async () => {
      const events = await kit.pool.query("SELECT kind, source FROM events WHERE device_id = $1", [REVOKED]);
      expect(events.rows).toEqual([{ kind: "revoked", source: "api" }]);
    });

    const again = await kit.app.inject({ method: "POST", url: `/devices/${REVOKED}/revoke`, cookies: kit.wristband("admin") });
    expect(again.statusCode).toBe(404); // already revoked: nothing changes any more
  });
});
