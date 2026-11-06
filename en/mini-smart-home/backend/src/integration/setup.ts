// setup.ts - the shared preparation of the INTEGRATION tests (Module 29): API routes + a REAL TimescaleDB database, not vi.mock tables.
// Every *.test.ts file in this folder calls setupTest() once before its tests (beforeAll) and kit.close() after them.
//
// The test database = an EMPTY database only for tests, its address in DATABASE_URL_TEST, for example
//   postgres://postgres:<test password>@127.0.0.1:5433/smarthome_test
// Without DATABASE_URL_TEST, every integration test is SKIPPED: npm test on the laptop still runs without Docker.
//
// GUARD: the database name MUST end in _test. The integration tests WRITE and DELETE rows, so the address of your home database
// (smarthome) is refused before a single connection is opened, then checked once more with current_database() after
// connecting: what decides is the database that is really connected, not what the address says.
//
// The order of setupTest():
//   1. check the database name in the DATABASE_URL_TEST address (_test)
//   2. put the test settings into process.env BEFORE the server code is imported (config/env.ts checks its settings when it is
//      imported): a fake broker (never contacted), a random single-use JWT_SECRET, a temporary firmware folder, automatic
//      broker accounts off, Telegram off
//   3. check again the name of the database that is really connected (current_database())
//   4. migrate: node src/db/migrate.ts, THE SAME program as the migrate service in Compose, into the test database (from zero
//      when empty; when already complete: "0 new migration(s) applied"). The test files run AT THE SAME TIME, so the migration
//      queues with a pg_advisory_lock lock: one file runs it, the other files wait for their turn
//   5. assemble the server with buildApp() (app.ts): the same assembly as server.ts, without listening at any counter
// Every test file uses device_ids, emails, rule names, and firmware versions of ITS OWN and cleans them up before every test:
// files running at the same time don't disturb each other, and no test depends on the test before it.
// One exception: "the latest release" is computed from ALL rows of the firmware table, so only firmware-fleet.test.ts may
// write to the firmware table (its tests stop with a clear message when another release is in the test database).
import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";

const TEST_URL = process.env.DATABASE_URL_TEST ?? ""; // holds a password: never written to the screen
export const hasTestDatabase = TEST_URL !== ""; // used by describe.skipIf(!hasTestDatabase) in every test file

const BACKEND_FOLDER = fileURLToPath(new URL("../../", import.meta.url)); // the backend/ folder (where package.json is)
const MIGRATION_TURN = 29_29; // any number for pg_advisory_lock: "the integration tests' migration turn"
const run = promisify(execFile);

// The database name from its address: postgres://user:password@host:5433/smarthome_test -> smarthome_test
function databaseName(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
  } catch {
    return ""; // not an address that can be read: treated as not a test database
  }
}

// The guard's error message: the address is NOT written in it (it can hold a password), only its database name.
function refuseNonTest(name: string): Error {
  return new Error(`DATABASE_URL_TEST points at the database "${name}", not a test database: the database name must end in _test `
    + "(for example smarthome_test). The integration tests write and delete rows, so they don't run. Never point it at "
    + "your home database.");
}

export interface TestKit {
  app: FastifyInstance; // the same server as production (buildApp), knocked on with app.inject() without a network
  pool: Pool; // the connection pool to the test database: to check table contents directly with SQL
  wristband: (role: "admin" | "viewer") => { access: string }; // a valid access cookie (JWT) for routes with a padlock
  firmwareFolder: string; // this test file's own temporary FIRMWARE_DIR
  close: () => Promise<void>;
}

export async function setupTest(): Promise<TestKit> {
  // 1. the database name guard, before any connection at all
  const name = databaseName(TEST_URL);
  if (!name.endsWith("_test")) throw refuseNonTest(name);

  // 2. the test settings. An empty value = the default of config/env.ts. All are overwritten, so settings in the reader's
  //    terminal (for example a real MQTT_URL or TELEGRAM_BOT_TOKEN) never get carried into the tests.
  const firmwareFolder = await mkdtemp(join(tmpdir(), "smarthome-test-firmware-"));
  Object.assign(process.env, {
    DATABASE_URL: TEST_URL,
    MQTT_URL: "mqtt://127.0.0.1:1", // a dead address: the routes under test don't need a broker (mqtt.connect only in server.ts)
    MQTT_USERNAME: "", MQTT_PASSWORD: "",
    JWT_SECRET: `test-${randomBytes(32).toString("base64url")}`, // a single-use secret, made again every time the tests run
    FIRMWARE_DIR: firmwareFolder,
    AUTO_BROKER_ACCOUNTS: "off", SERVER_URL: "", TRUST_PROXY: "", CORS_ORIGIN: "", HOST: "", PORT: "",
    TELEGRAM_BOT_TOKEN: "", TELEGRAM_CHAT_ID: "", TELEGRAM_API_ROOT: "", REPORT_SCHEDULE: "",
  });

  // 3. the server code is imported AFTER process.env is filled in (a normal import at the top would check the settings first)
  const { pool } = await import("../db/pool.ts");
  try {
    const connected = await pool.query<{ name: string }>("SELECT current_database() AS name").catch((error: Error) => {
      throw new Error(`the test database can't be reached (${error.message}): is the test database container running, `
        + "and are its counter and password the same as in DATABASE_URL_TEST?");
    });
    if (!connected.rows[0].name.endsWith("_test")) throw refuseNonTest(connected.rows[0].name);

    // 4. the migration, one test file at a time
    const client = await pool.connect();
    try {
      await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_TURN]); // waits when another file is migrating
      await run(process.execPath, ["src/db/migrate.ts"], { cwd: BACKEND_FOLDER, env: process.env, timeout: 60_000 })
        .catch((error: Error & { stdout?: string; stderr?: string }) => {
          throw new Error(`migrating the test database failed:\n${error.stdout ?? ""}${error.stderr ?? error.message}`);
        });
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_TURN]).catch(() => {});
      client.release();
    }

    // 5. the same server as production, without listen
    const { buildApp } = await import("../app.ts");
    const app = await buildApp({ log: "errors-only" });
    await app.ready();

    return {
      app, pool, firmwareFolder,
      // sub = the account number; the routes under test only record it (for example the firmware uploader), not look it up in the users table
      wristband: (role) => ({ access: app.jwt.sign({ sub: role === "admin" ? "1" : "2", role, sid: 1 }) }),
      close: async () => {
        await waitForQueries(pool);
        await app.close();
        await pool.end();
        await rm(firmwareFolder, { recursive: true, force: true });
      },
    };
  } catch (error) {
    // failed halfway: don't leave a database connection open (Vitest waits for the process to finish) or the folder
    await pool.end().catch(() => {});
    await rm(firmwareFolder, { recursive: true, force: true });
    throw error;
  }
}

// Some routes write the event log (recordEvent) WITHOUT waiting for the write to finish: the HTTP answer has arrived, but the
// INSERT into the events table is still running. Before cleaning up, wait until the connection pool is idle (no query running
// or queued), so a late row doesn't collide with the DELETE (foreign key) or show up after the cleanup. At most
// 2 seconds.
export async function waitForQueries(pool: Pool): Promise<void> {
  for (let i = 0; i < 200 && (pool.totalCount > pool.idleCount || pool.waitingCount > 0); i++) {
    await new Promise((next) => setTimeout(next, 10));
  }
}

// Cleanup: delete every row of the test devices, in foreign-key order (children first, the parent last): readings, health,
// commands, events, firmware updates, claim codes, then the devices (a Node 2 linked through another device goes before the
// device it is linked via). The table names come from the fixed list below, not from outside; device_id always goes in as $1.
const CHILD_TABLES = ["readings", "device_health", "commands", "events", "updates", "claim_codes"];

export async function deleteTestDevices(pool: Pool, ids: string[]): Promise<void> {
  await waitForQueries(pool);
  for (const table of CHILD_TABLES) await pool.query(`DELETE FROM ${table} WHERE device_id = ANY($1)`, [ids]);
  await pool.query("DELETE FROM devices WHERE linked_via = ANY($1)", [ids]);
  await pool.query("DELETE FROM devices WHERE device_id = ANY($1)", [ids]);
}

// Data: register one device through the real API route (POST /devices as admin) and return its key.
export async function registerDevice(kit: TestKit, deviceId: string, name = "Integration test device"): Promise<string> {
  const answer = await kit.app.inject({ method: "POST", url: "/devices", cookies: kit.wristband("admin"),
    payload: { device_id: deviceId, name } });
  if (answer.statusCode !== 201) throw new Error(`registering ${deviceId} failed: ${answer.statusCode} ${answer.body}`);
  return (answer.json() as { key: string }).key;
}
