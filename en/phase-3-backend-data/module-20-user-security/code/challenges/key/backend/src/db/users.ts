// users.ts - accounts (the users table) and logins that are still active (the sessions table), Module 20. The password
// fingerprint (password_hash) only leaves this file through findForLogin: no other function ever reads it.
import { pool } from "./pool.ts";

export type Role = "admin" | "viewer";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

const COLUMNS = "id, email, name, role";

export async function findForLogin(email: string): Promise<(User & { password_hash: string | null }) | undefined> {
  const result = await pool.query<User & { password_hash: string | null }>(
    `SELECT ${COLUMNS}, password_hash FROM users WHERE email = $1`, [email]);
  return result.rows[0];
}

export async function getUser(id: number): Promise<User | undefined> {
  const result = await pool.query<User>(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function allUsers(): Promise<(User & { has_password: boolean; active_sessions: number })[]> {
  const result = await pool.query<User & { has_password: boolean; active_sessions: number }>(
    `SELECT u.id, u.email, u.name, u.role, u.password_hash IS NOT NULL AS has_password,
            (SELECT count(*)::int FROM sessions s WHERE s.user_id = u.id AND s.expires_at > now()) AS active_sessions
     FROM users u ORDER BY u.id`);
  return result.rows;
}

export async function addUser(email: string, name: string, role: Role, passwordHash: string): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (email, name, role, password_hash, password_changed_at) VALUES ($1, $2, $3, $4, now()) RETURNING ${COLUMNS}`,
    [email, name, role, passwordHash]);
  return result.rows[0];
}

// Change the password, then revoke all its sessions: anyone still logged in with the old password must log in again.
export async function changePassword(email: string, passwordHash: string): Promise<User | undefined> {
  const result = await pool.query<User>(
    `UPDATE users SET password_hash = $2, password_changed_at = now() WHERE email = $1 RETURNING ${COLUMNS}`, [email, passwordHash]);
  const u = result.rows[0];
  if (u !== undefined) await pool.query("DELETE FROM sessions WHERE user_id = $1", [u.id]);
  return u;
}

export async function changeRole(email: string, role: Role): Promise<User | undefined> {
  const result = await pool.query<User>(`UPDATE users SET role = $2 WHERE email = $1 RETURNING ${COLUMNS}`, [email, role]);
  return result.rows[0];
}

export async function deleteUser(email: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM users WHERE email = $1", [email]); // its sessions are deleted too (CASCADE)
  return result.rowCount === 1;
}

// ---- sessions (refresh tokens) ----

export async function createSession(userId: number, tokenHash: string, ageSeconds: number): Promise<number> {
  await pool.query("DELETE FROM sessions WHERE expires_at < now()"); // cleanup: throw away the sessions that have expired
  const result = await pool.query<{ id: string }>(
    `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))
     RETURNING id`, [userId, tokenHash, ageSeconds]);
  return Number(result.rows[0].id); // bigint arrives from pg as text
}

// Rotation: swap the old token for a new token in ONE UPDATE statement. If two requests bring the same token at the same
// time, only one wins; the other no longer finds the row.
export async function rotateSession(oldHash: string, newHash: string):
  Promise<{ id: number; user_id: number; expires_at: Date } | undefined> {
  const result = await pool.query<{ id: string; user_id: number; expires_at: Date }>(
    `UPDATE sessions SET previous_token_hash = token_hash, token_hash = $2, updated_at = now()
     WHERE token_hash = $1 AND expires_at > now()
     RETURNING id, user_id, expires_at`, [oldHash, newHash]);
  const row = result.rows[0];
  return row === undefined ? undefined : { ...row, id: Number(row.id) };
}

// A token that was already replaced (previous_token_hash) used again?
export async function findSessionByOldToken(hash: string): Promise<{ id: number; user_id: number; updated_at: Date } | undefined> {
  const result = await pool.query<{ id: string; user_id: number; updated_at: Date }>(
    "SELECT id, user_id, updated_at FROM sessions WHERE previous_token_hash = $1 AND expires_at > now()", [hash]);
  const row = result.rows[0];
  return row === undefined ? undefined : { ...row, id: Number(row.id) };
}

export async function deleteSession(id: number): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
}

// Logout: delete the session whose current token matches. The result is the number of the deleted session.
export async function deleteSessionByToken(hash: string): Promise<number | undefined> {
  const result = await pool.query<{ id: string }>("DELETE FROM sessions WHERE token_hash = $1 RETURNING id", [hash]);
  return result.rows[0] === undefined ? undefined : Number(result.rows[0].id);
}

// Challenge Level 2: log out of all devices. Delete ALL sessions of one account at once. The result is the list of the
// numbers of the deleted sessions (empty when that account had no session at all).
export async function deleteAllSessions(userId: number): Promise<number[]> {
  const result = await pool.query<{ id: string }>("DELETE FROM sessions WHERE user_id = $1 RETURNING id", [userId]);
  return result.rows.map((row) => Number(row.id)); // bigint arrives from pg as text
}
