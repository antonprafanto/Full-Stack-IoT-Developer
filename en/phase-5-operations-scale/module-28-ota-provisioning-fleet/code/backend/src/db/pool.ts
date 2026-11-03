// pool.ts - a "pool" of connections to the PostgreSQL database, shared by the whole backend.
import { Pool } from "pg";
import type { PoolClient } from "pg";
import { env } from "../config/env.ts";

export const pool = new Pool({
  connectionString: env.DATABASE_URL, // postgres://postgres:<password>@127.0.0.1:5432/smarthome
  max: 5, // at most 5 connections at once; enough for one small backend
  connectionTimeoutMillis: 5000, // give up if the database doesn't answer within 5 seconds
});

// an idle connection can drop (for example when the database container is stopped): log it, don't crash the server
pool.on("error", (error) => console.error(`database error: ${error.message}`));

// Module 28: run several queries as ONE transaction (all succeed, or nothing changes). `work` receives
// one dedicated connection (BEGIN and COMMIT must be on the same connection). Any error inside = ROLLBACK, then the error
// is thrown again to the caller. Used for steps that involve the broker: if a broker account can't be created or deleted,
// the database doesn't change either, so the admin (or the device) simply tries again.
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {}); // the connection dropped: the transaction is cancelled by itself
    throw error;
  } finally {
    client.release();
  }
}
