// migrate.ts - runs the SQL files in the migrations/ folder that haven't been run yet, in the order of their numbers.
// Run from the backend folder: npm run migrate
import { readdir, readFile } from "node:fs/promises";
import { pool } from "./pool.ts";

const FOLDER = new URL("../../migrations/", import.meta.url); // the backend/migrations/ folder

// the migration logbook: one row for every file that has already been run
await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);
const done = await pool.query<{ version: string }>("SELECT version FROM schema_migrations");
const recorded = new Set(done.rows.map((row) => row.version));
const all = (await readdir(FOLDER)).filter((name) => name.endsWith(".sql")).sort(); // 001_…, 002_…, and so on

let applied = 0;
for (const name of all) {
  if (recorded.has(name)) continue; // already run before: skip it
  const sql = await readFile(new URL(name, FOLDER), "utf8");
  const client = await pool.connect(); // one dedicated connection, so that BEGIN and COMMIT happen on the same connection
  try {
    await client.query("BEGIN"); // the whole file succeeds, or nothing changes at all
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [name]);
    await client.query("COMMIT");
    console.log(`applied: ${name}`);
    applied++;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`FAILED in ${name}: ${(error as Error).message}`);
    process.exitCode = 1; // npm reports the failure
    break; // don't go on to the next file
  } finally {
    client.release(); // give the connection back to the pool
  }
}
console.log(`${applied} new migration(s) applied, ${recorded.size} applied earlier.`);
await pool.end(); // close the pool so that the program ends
