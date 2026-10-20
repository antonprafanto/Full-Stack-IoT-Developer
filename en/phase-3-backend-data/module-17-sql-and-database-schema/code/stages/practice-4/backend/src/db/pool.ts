// pool.ts - a "pool" of connections to the PostgreSQL database, shared by the whole backend.
import { Pool } from "pg";
import { env } from "../config/env.ts";

export const pool = new Pool({
  connectionString: env.DATABASE_URL, // postgres://postgres:<password>@127.0.0.1:5432/smarthome
  max: 5, // at most 5 connections at once; enough for one small backend
  connectionTimeoutMillis: 5000, // give up if the database doesn't answer within 5 seconds
});

// an idle connection can drop (for example when the database container is stopped): log it, don't crash the server
pool.on("error", (error) => console.error(`database error: ${error.message}`));
