// rules.test.ts - INTEGRATION tests of the automation rules (Modules 19 + 24) with REAL rules and events tables (Module 29).
// What mocks can't test: the condition and the action stored as JSONB, updated_at moving forward when a rule is replaced, and the
// foreign key events.rule_id ON DELETE SET NULL (migration 007): a rule is deleted, its event log stays.
// Run (the test database running, DATABASE_URL_TEST filled in; see setup.ts): npm run test:integration
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hasTestDatabase, setupTest, waitForQueries } from "./setup.ts";
import type { TestKit } from "./setup.ts";

// rule names of this file only (the cleanup uses the same prefix). The device_id is only stored inside the rule's JSON;
// the device doesn't have to be in the devices table.
const PREFIX = "integration-test rule";
const DEVICE = "290400000001";

// "the fan turns on when the temperature is above <onAbove> °C for 60 seconds, and off again below <onAbove - 2> °C"
function fanRule(name: string, onAbove = 30, active = true) {
  return {
    name, active,
    condition: { kind: "threshold", device_id: DEVICE, quantity: "temperature", on_above: onAbove, off_below: onAbove - 2,
      for_seconds: 60 },
    action: { kind: "switch", device_id: DEVICE, target: "fan", notify: false },
  };
}

describe.skipIf(!hasTestDatabase)("integration (test database): automation rules", () => {
  let kit: TestKit;
  const create = (body: object) => kit.app.inject({ method: "POST", url: "/rules", cookies: kit.wristband("admin"), payload: body });
  const cleanUp = async () => {
    await waitForQueries(kit.pool); // events of the test before may still be being written
    await kit.pool.query("DELETE FROM events WHERE data->>'name' LIKE $1", [`${PREFIX}%`]); // the "rule-changed" events
    await kit.pool.query("DELETE FROM rules WHERE name LIKE $1", [`${PREFIX}%`]);
  };

  beforeAll(async () => { kit = await setupTest(); }, 60_000); // the migration may wait for another file's turn
  beforeEach(() => cleanUp());
  afterAll(async () => {
    if (!kit) return; // setupTest() failed: its error was already reported
    await cleanUp();
    await kit.close();
  });

  it("POST /rules: the rule is stored in the rules table (JSONB) and shows at once; an invalid body refused with 400, no new row", async () => {
    const answer = await create(fanRule(`${PREFIX} 1`));
    expect(answer.statusCode).toBe(201);
    const { id } = answer.json() as { id: number };

    const result = await kit.pool.query("SELECT name, active, condition, action FROM rules WHERE id = $1", [id]);
    expect(result.rows).toEqual([fanRule(`${PREFIX} 1`)]); // JSONB is read back as exactly the same object
    const list = await kit.app.inject({ method: "GET", url: "/rules", cookies: kit.wristband("viewer") });
    expect((list.json() as { id: number }[]).map((r) => r.id)).toContain(id);

    // reversed hysteresis (off above on): refused by the Zod schema before it touches the database
    const wrong = await create({ ...fanRule(`${PREFIX} wrong`), condition: { ...fanRule("").condition, off_below: 35 } });
    expect(wrong.statusCode).toBe(400);
    expect((await kit.pool.query("SELECT 1 FROM rules WHERE name = $1", [`${PREFIX} wrong`])).rowCount).toBe(0);
  });

  it("PUT /rules/:id: the content replaced in the database and updated_at moves forward; a number that doesn't exist answered with 404", async () => {
    const { id } = (await create(fanRule(`${PREFIX} 2`))).json() as { id: number };
    const replaced = await kit.app.inject({ method: "PUT", url: `/rules/${id}`, cookies: kit.wristband("admin"),
      payload: fanRule(`${PREFIX} 2 replaced`, 32, false) });
    expect(replaced.statusCode).toBe(200);

    // "updated_at moves forward" is compared inside the database (microseconds): a JavaScript Date only goes to milliseconds,
    // so an INSERT and an UPDATE in the same millisecond on a fast computer would look the same
    const result = await kit.pool.query<{ name: string; active: boolean; on_above: number; newer: boolean }>(
      "SELECT name, active, (condition->>'on_above')::int AS on_above, updated_at > created_at AS newer FROM rules WHERE id = $1", [id]);
    expect(result.rows[0]).toEqual({ name: `${PREFIX} 2 replaced`, active: false, on_above: 32, newer: true });

    const missing = await kit.app.inject({ method: "PUT", url: "/rules/2147483647", cookies: kit.wristband("admin"),
      payload: fanRule(`${PREFIX} ghost`) });
    expect(missing.statusCode).toBe(404);
  });

  it("DELETE /rules/:id: the rule gone from the database, its event log stays (rule_id becomes NULL)", async () => {
    const { id } = (await create(fanRule(`${PREFIX} 3`))).json() as { id: number };
    // creating a rule writes one "rule-changed" event that points at that rule (written without the route waiting)
    let eventId = 0;
    await vi.waitFor(async () => {
      const events = await kit.pool.query<{ id: string }>("SELECT id FROM events WHERE rule_id = $1", [id]);
      expect(events.rowCount).toBe(1);
      eventId = Number(events.rows[0].id);
    });

    const deleted = await kit.app.inject({ method: "DELETE", url: `/rules/${id}`, cookies: kit.wristband("admin") });
    expect(deleted.statusCode).toBe(200);
    expect((await kit.pool.query("SELECT 1 FROM rules WHERE id = $1", [id])).rowCount).toBe(0);
    // the foreign key ON DELETE SET NULL: the old event stays, only its pointer to the rule is emptied
    const old = await kit.pool.query("SELECT kind, rule_id FROM events WHERE id = $1", [eventId]);
    expect(old.rows).toEqual([{ kind: "rule-changed", rule_id: null }]);
  });
});
