// firmware-fleet.test.ts - INTEGRATION tests of the firmware releases and the /fleet page (Module 28) with a REAL test database
// and a temporary firmware folder (Module 29). What mocks can't test: a release's metadata in the firmware table (PRIMARY KEY
// kind + version: a version can't be overwritten), the locked download matching the device key with the fingerprint in devices,
// the test-release and withdrawn marks, and the LATERAL query of the /fleet page (the LATEST health and last update per device).
// The .bin files here are fake: 4 KiB of random bytes with a first byte 0xE9 (the server only checks that byte and the size).
// Run (the test database running, DATABASE_URL_TEST filled in; see setup.ts): npm run test:integration
import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hasTestDatabase, registerDevice, deleteTestDevices, setupTest } from "./setup.ts";
import type { TestKit } from "./setup.ts";

// device_ids and firmware versions of this file only (prefix 2906 and 29.6.x)
const DOWNLOADER = "290600000001";
const MEMBER = "290600000002";
const ALL = [DOWNLOADER, MEMBER];
const sha256 = (content: Buffer) => createHash("sha256").update(content).digest("hex");

function fakeBin(): Buffer {
  const content = randomBytes(4096);
  content[0] = 0xe9; // the mark of an ESP32 application image
  return content;
}

describe.skipIf(!hasTestDatabase)("integration (test database): firmware releases and the fleet", () => {
  let kit: TestKit;
  const upload = (version: string, content: Buffer, testRelease = false) => kit.app.inject({ method: "POST",
    url: `/firmware/node1/${version}${testRelease ? "?test=true" : ""}`, cookies: kit.wristband("admin"),
    headers: { "content-type": "application/octet-stream" }, payload: content });
  const cleanUp = async () => {
    await deleteTestDevices(kit.pool, ALL); // also the update rows that point at the releases below
    await kit.pool.query("DELETE FROM firmware WHERE version LIKE '29.6.%'");
  };

  beforeAll(async () => { kit = await setupTest(); }, 60_000); // the migration may wait for another file's turn
  beforeEach(async () => {
    await cleanUp();
    // Two tests below judge "the latest release" from ALL rows of the firmware table: another release in the test database (for
    // example left over from trying a firmware upload) makes the result wrong. Stop with a clear message, not a confusing AssertionError.
    const others = await kit.pool.query<{ version: string }>("SELECT version FROM firmware WHERE version NOT LIKE '29.6.%'");
    if (others.rowCount) {
      throw new Error(`the firmware table in the test database holds other releases (${others.rows.map((r) => r.version).join(", ")}): `
        + "this test needs a firmware table without other releases. Use a fresh test database (restart its container).");
    }
  });
  afterAll(async () => {
    if (!kit) return; // setupTest() failed: its error was already reported
    await cleanUp();
    await kit.close();
  });

  it("upload: the metadata (size, the server's SHA-256) stored, a version can't be overwritten, a device downloads with its key", async () => {
    const content = fakeBin();
    expect((await upload("29.6.1", content)).statusCode).toBe(201);
    const result = await kit.pool.query("SELECT size, sha256, test, uploaded_by, withdrawn_at FROM firmware WHERE version = '29.6.1'");
    expect(result.rows).toEqual([{ size: 4096, sha256: sha256(content), test: false, uploaded_by: "1", withdrawn_at: null }]);
    expect((await readFile(join(kit.firmwareFolder, "node-1", "29.6.1.bin"))).equals(content)).toBe(true); // the file in the cupboard
    expect((await upload("29.6.1", fakeBin())).statusCode).toBe(409); // other content, the same version: refused

    // the device download: Basic Auth device_id:key (matched with the fingerprint in the devices table) + its WiFi MAC
    const key = await registerDevice(kit, DOWNLOADER);
    const download = (keySent: string) => kit.app.inject({ method: "GET", url: "/fw/node-1/29.6.1.bin", headers: {
      authorization: `Basic ${Buffer.from(`${DOWNLOADER}:${keySent}`).toString("base64")}`,
      "x-esp32-sta-mac": "29:06:00:00:00:01" } });
    const succeeded = await download(key);
    expect(succeeded.statusCode).toBe(200);
    expect(succeeded.headers["x-sha256"]).toBe(sha256(content));
    expect(succeeded.rawPayload.equals(content)).toBe(true);
    const wrongKey = key.slice(0, -1) + (key.endsWith("A") ? "B" : "A"); // the last character replaced: one character different
    expect((await download(wrongKey)).statusCode).toBe(403);
  });

  it("a test release is stored marked test and never becomes the latest release; a withdrawn release leaves the count", async () => {
    expect((await upload("29.6.2", fakeBin())).statusCode).toBe(201);
    expect((await upload("29.6.3", fakeBin(), true)).statusCode).toBe(201); // higher, but a TEST release
    const flags = await kit.pool.query("SELECT version, test FROM firmware WHERE version LIKE '29.6.%' ORDER BY version");
    expect(flags.rows).toEqual([{ version: "29.6.2", test: false }, { version: "29.6.3", test: true }]);

    type ReleaseList = { latest: { node1: string | null }; releases: { version: string; can_update_all: boolean; update_all_reason: string | null }[] };
    const list = async () => (await kit.app.inject({ method: "GET", url: "/firmware", cookies: kit.wristband("viewer") })).json() as ReleaseList;
    const before = await list();
    expect(before.latest.node1).toBe("29.6.2");
    expect(before.releases.find((r) => r.version === "29.6.3"))
      .toMatchObject({ can_update_all: false, update_all_reason: "test release: per device only" });

    const withdraw = await kit.app.inject({ method: "POST", url: "/firmware/node1/29.6.2/withdraw", cookies: kit.wristband("admin") });
    expect(withdraw.statusCode).toBe(200);
    const withdrawn = await kit.pool.query<{ withdrawn_at: Date | null }>("SELECT withdrawn_at FROM firmware WHERE version = '29.6.2'");
    expect(withdrawn.rows[0].withdrawn_at).toBeInstanceOf(Date);
    expect((await list()).latest.node1).toBeNull(); // only the test release is left: no latest release
  });

  it("GET /fleet: a device shows with its LATEST health and its last update (LATERAL), needs_update from the latest release", async () => {
    await registerDevice(kit, MEMBER, "Test fleet node");
    // as if the device has been running: it reported version 29.5.0, sent vitals twice, and once failed to install 29.6.4
    await kit.pool.query("UPDATE devices SET kind = 'node1', fw = '29.5.0', fw_seen_at = now() WHERE device_id = $1", [MEMBER]);
    await kit.pool.query(`INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free, reset_reason, fw) VALUES
      ($1, now() - interval '20 minutes', -70, 600, 150000, 'POWERON', '29.5.0'),
      ($1, now() - interval '2 minutes', -55, 1680, 148000, 'POWERON', '29.5.0')`, [MEMBER]);
    expect((await upload("29.6.4", fakeBin())).statusCode).toBe(201);
    await kit.pool.query(`INSERT INTO updates (id, device_id, from_version, to_version, status, message, finished_at)
      VALUES ('c-test-290600000002', $1, '29.5.0', '29.6.4', 'rollback', 'trial period failed', now())`, [MEMBER]);

    const answer = await kit.app.inject({ method: "GET", url: "/fleet", cookies: kit.wristband("viewer") });
    expect(answer.statusCode).toBe(200);
    const body = answer.json() as { latest_release: { node1: string | null }; devices: { device_id: string }[] };
    expect(body.latest_release.node1).toBe("29.6.4");
    expect(body.devices.find((d) => d.device_id === MEMBER)).toMatchObject({
      name: "Test fleet node", key: "active", fw: "29.5.0", needs_update: true,
      health: { rssi: -55, uptime_s: 1680, reset_reason: "POWERON" }, // the row of 2 minutes ago, not of 20 minutes ago
      update: { status: "rollback", from: "29.5.0", to: "29.6.4", message: "trial period failed" },
    });
  });
});
