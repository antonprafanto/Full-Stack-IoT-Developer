// readings.test.ts - INTEGRATION tests of the reading history (Modules 17-18) in a REAL TimescaleDB readings hypertable (Module 29).
// What mock tables can't test: the order and the time limits from SQL (ORDER BY ts, ts >= ... AND ts < ...), TimescaleDB's
// time_bucket() function for the 15-minute summary, and PRIMARY KEY (device_id, ts) + ON CONFLICT DO NOTHING, which throws
// away a double delivery.
// Run (the test database running, DATABASE_URL_TEST filled in; see setup.ts): npm run test:integration
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hasTestDatabase, deleteTestDevices, setupTest } from "./setup.ts";
import type { TestKit } from "./setup.ts";

// device_ids of this file only (prefix 2902)
const ONE = "290200000001";
const NEIGHBOR = "290200000002";
const DUPLICATE = "290200000003";
const ALL = [ONE, NEIGHBOR, DUPLICATE];
const MINUTE = 60_000;

describe.skipIf(!hasTestDatabase)("integration (test database): reading history", () => {
  let kit: TestKit;
  // a reading only needs its device in the devices table (foreign key readings -> devices); no registration through the API
  const ensureDevice = (id: string) => kit.pool.query("INSERT INTO devices (device_id) VALUES ($1)", [id]);
  const saveReading = (id: string, ts: Date, temperature: number) =>
    kit.pool.query("INSERT INTO readings (device_id, ts, fw, temperature, humidity) VALUES ($1, $2, '1.7.0', $3, 60)", [id, ts, temperature]);

  beforeAll(async () => { kit = await setupTest(); }, 60_000); // the migration may wait for another file's turn
  beforeEach(() => deleteTestDevices(kit.pool, ALL));
  afterAll(async () => {
    if (!kit) return; // setupTest() failed: its error was already reported
    await deleteTestDevices(kit.pool, ALL);
    await kit.close();
  });

  it("GET /devices/:id/readings: only the readings of the last hour, in time order (oldest first)", async () => {
    await ensureDevice(ONE);
    const now = Date.now();
    // saved in a RANDOM order: the order in the answer must come from ORDER BY ts, not from the order of saving
    await saveReading(ONE, new Date(now - 10 * MINUTE), 23.5);
    await saveReading(ONE, new Date(now - 50 * MINUTE), 21.5);
    await saveReading(ONE, new Date(now - 30 * MINUTE), 22.5);
    await saveReading(ONE, new Date(now - 180 * MINUTE), 99); // 3 hours ago: outside the default range (1 hour)

    const answer = await kit.app.inject({ method: "GET", url: `/devices/${ONE}/readings`, cookies: kit.wristband("viewer") });
    expect(answer.statusCode).toBe(200);
    const body = answer.json() as { count: number; truncated: boolean; readings: { temperature: number | null }[] };
    expect(body.count).toBe(3);
    expect(body.truncated).toBe(false);
    expect(body.readings.map((r) => r.temperature)).toEqual([21.5, 22.5, 23.5]);
  });

  it("a 15-minute summary (TimescaleDB time_bucket): only that device's readings are counted", async () => {
    await ensureDevice(ONE);
    await ensureDevice(NEIGHBOR);
    // the start of one 15-minute bucket, two hours ago (rounded down to a multiple of 15 minutes)
    const start = Math.floor((Date.now() - 120 * MINUTE) / (15 * MINUTE)) * (15 * MINUTE);
    await saveReading(ONE, new Date(start + 1 * MINUTE), 20);
    await saveReading(ONE, new Date(start + 4 * MINUTE), 22);
    await saveReading(ONE, new Date(start + 7 * MINUTE), 24);
    await saveReading(NEIGHBOR, new Date(start + 2 * MINUTE), 90); // another device in the same bucket: must not count
    await saveReading(NEIGHBOR, new Date(start + 5 * MINUTE), 95);

    const range = new URLSearchParams({ bucket: "15m", from: new Date(start).toISOString(),
      to: new Date(start + 15 * MINUTE).toISOString() });
    const answer = await kit.app.inject({ method: "GET", url: `/devices/${ONE}/readings?${range}`,
      cookies: kit.wristband("viewer") });
    expect(answer.statusCode).toBe(200);
    const body = answer.json() as { summary: Record<string, unknown>[] };
    expect(body.summary).toEqual([{
      time: new Date(start).toISOString().slice(0, 19) + "Z", // the contract format: UTC without milliseconds
      avg_temp: 22, min_temp: 20, max_temp: 24, avg_humidity: 60, avg_soil: null, avg_light: null, reading_count: 3,
    }]);
  });

  it("a double delivery: the same telemetry twice (same ts) is stored as one row (PRIMARY KEY + ON CONFLICT)", async () => {
    await ensureDevice(DUPLICATE);
    // the function mqtt.ts calls for every telemetry that passes the contract (imported after setupTest filled in the settings)
    const { archiveTelemetry } = await import("../db/archive.ts");
    const telemetry = { ts: new Date(Date.now() - 5 * MINUTE).toISOString().slice(0, 19) + "Z", fw: "1.7.0", temperature: 27.5,
      humidity: 61, light: 900, soil: 40, motion: false, water_level: 80 };

    expect(await archiveTelemetry(DUPLICATE, telemetry)).toBe(true); // first: stored
    expect(await archiveTelemetry(DUPLICATE, telemetry)).toBe(false); // second (QoS 1 may send it again): skipped, no error
    const result = await kit.pool.query("SELECT temperature, humidity, light FROM readings WHERE device_id = $1", [DUPLICATE]);
    expect(result.rows).toEqual([{ temperature: 27.5, humidity: 61, light: 900 }]);
    // the telemetry also updates its device row: the kind is recognized from its content, the last-seen time is filled in
    const device = await kit.pool.query<{ kind: string; last_seen: Date | null }>(
      "SELECT kind, last_seen FROM devices WHERE device_id = $1", [DUPLICATE]);
    expect(device.rows[0].kind).toBe("node1");
    expect(device.rows[0].last_seen).toBeInstanceOf(Date);
  });
});
