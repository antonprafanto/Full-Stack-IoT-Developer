// claims.test.ts - INTEGRATION tests of the single-use claim codes (Module 28) with REAL claim_codes and devices tables (Module 29).
// What mocks can't test: exchanging a code in ONE transaction (SELECT ... FOR UPDATE, register, mark used), the code's time
// limit by the database clock (expires_at > now()), and the ON CONFLICT that refuses taking over a device that's still active.
// The claim route is limited to 10 attempts per minute per address: this file uses 5.
// Run (the test database running, DATABASE_URL_TEST filled in; see setup.ts): npm run test:integration
import { createHash } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hashClaimCode, tidyClaimCode } from "../auth/claim-code.ts"; // pure functions (no settings), safe to import here
import { hasTestDatabase, deleteTestDevices, setupTest } from "./setup.ts";
import type { TestKit } from "./setup.ts";

// code names and device_ids of this file only (prefix 2905)
const PREFIX = "integration-test claim";
const NEW_DEVICE = "290500000001";
const OWNER = "290500000002";
const GRABBER = "290500000003";
const LATE = "290500000004";
const ALL = [NEW_DEVICE, OWNER, GRABBER, LATE];
const codeHash = (code: string) => hashClaimCode(tidyClaimCode(code) ?? "");

describe.skipIf(!hasTestDatabase)("integration (test database): claim codes", () => {
  let kit: TestKit;
  // the admin creates a code (valid for 5 minutes); the code is only shown in this answer
  const createCode = async (name: string) => {
    const answer = await kit.app.inject({ method: "POST", url: "/provision/code", cookies: kit.wristband("admin"),
      payload: { name, minutes: 5 } });
    expect(answer.statusCode).toBe(201);
    return (answer.json() as { code: string }).code;
  };
  // a device exchanges the code for its key: without a login (a device has no dashboard account)
  const claim = (code: string, deviceId: string) =>
    kit.app.inject({ method: "POST", url: "/provision/claim", payload: { code, device_id: deviceId } });
  const deviceCount = async (id: string) =>
    (await kit.pool.query("SELECT 1 FROM devices WHERE device_id = $1", [id])).rowCount;
  const cleanUp = async () => {
    await deleteTestDevices(kit.pool, ALL); // also the codes those devices have used
    await kit.pool.query("DELETE FROM claim_codes WHERE name LIKE $1", [`${PREFIX}%`]); // the codes not used yet
  };

  beforeAll(async () => { kit = await setupTest(); }, 60_000); // the migration may wait for another file's turn
  beforeEach(() => cleanUp());
  afterAll(async () => {
    if (!kit) return; // setupTest() failed: its error was already reported
    await cleanUp();
    await kit.close();
  });

  it("a code exchanged by a device: registered with its key fingerprint, the code recorded as used, the database doesn't store the code", async () => {
    const code = await createCode(`${PREFIX} 1`);
    const stored = await kit.pool.query("SELECT code_hash, used_at FROM claim_codes WHERE name = $1", [`${PREFIX} 1`]);
    expect(stored.rows).toEqual([{ code_hash: codeHash(code), used_at: null }]); // only its fingerprint

    // typed by a human in the portal: lowercase letters and a space are still valid (tidyClaimCode)
    const answer = await claim(code.toLowerCase().replace("-", " "), NEW_DEVICE);
    expect(answer.statusCode).toBe(201);
    const { key } = answer.json() as { key: string };

    const device = await kit.pool.query("SELECT name, key_hash FROM devices WHERE device_id = $1", [NEW_DEVICE]);
    expect(device.rows).toEqual([{ name: `${PREFIX} 1`, key_hash: createHash("sha256").update(key).digest("hex") }]);
    const used = await kit.pool.query<{ used_at: Date | null; device_id: string | null }>(
      "SELECT used_at, device_id FROM claim_codes WHERE name = $1", [`${PREFIX} 1`]);
    expect(used.rows[0].device_id).toBe(NEW_DEVICE);
    expect(used.rows[0].used_at).toBeInstanceOf(Date);
  });

  it("a used code refused with 403; a device that's still active can't be taken over with a new code (409), and that code isn't used up", async () => {
    const code = await createCode(`${PREFIX} 2`);
    expect((await claim(code, OWNER)).statusCode).toBe(201);

    const reused = await claim(code, GRABBER); // the same code, another device
    expect(reused.statusCode).toBe(403);
    expect(await deviceCount(GRABBER)).toBe(0);

    const newCode = await createCode(`${PREFIX} 2b`);
    const grab = await claim(newCode, OWNER); // OWNER is still registered and active
    expect(grab.statusCode).toBe(409);
    const left = await kit.pool.query("SELECT used_at FROM claim_codes WHERE name = $1", [`${PREFIX} 2b`]);
    expect(left.rows).toEqual([{ used_at: null }]); // nothing changed: the code can still be used by another device
  });

  it("an expired code (its time moved back directly in the test database) refused with 403, the device not registered", async () => {
    const code = await createCode(`${PREFIX} 3`);
    // as if the code was made 40 minutes ago and ran out 10 minutes ago (CHECK of migration 011: valid for at most 60 minutes)
    await kit.pool.query("UPDATE claim_codes SET created_at = now() - interval '40 minutes', expires_at = now() - interval '10 minutes' "
      + "WHERE code_hash = $1", [codeHash(code)]);

    const answer = await claim(code, LATE);
    expect(answer.statusCode).toBe(403);
    expect(await deviceCount(LATE)).toBe(0);
    const list = await kit.app.inject({ method: "GET", url: "/provision/code", cookies: kit.wristband("admin") });
    expect((list.json() as { name: string | null; state: string }[]).find((c) => c.name === `${PREFIX} 3`))
      .toMatchObject({ state: "expired" });
  });
});
