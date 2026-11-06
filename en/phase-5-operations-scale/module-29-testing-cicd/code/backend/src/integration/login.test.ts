// login.test.ts - INTEGRATION tests of the login (Module 20) with REAL users and sessions tables (Module 29).
// What mocks can't test: bcrypt matching a password with the stored fingerprint, a session (refresh token) stored only as its
// SHA-256, the refresh rotation in ONE UPDATE statement, and a logout that really deletes its row.
// Run (the test database running, DATABASE_URL_TEST filled in; see setup.ts): npm run test:integration
import { createHash } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hasTestDatabase, setupTest } from "./setup.ts";
import type { TestKit } from "./setup.ts";

// an account of this file only; the .test domain is reserved for testing (it never exists on the internet)
const EMAIL = "integration-test-login@home.test";
const PASSWORD = "a passphrase only for the integration tests";
const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

// one cookie from an answer (light-my-request has already read its Set-Cookie headers)
function cookie(answer: { cookies: { name: string; value: string }[] }, name: string): string {
  const found = answer.cookies.find((c) => c.name === name);
  if (found === undefined) throw new Error(`cookie ${name} isn't in the answer`);
  return found.value;
}

describe.skipIf(!hasTestDatabase)("integration (test database): login, refresh, logout", () => {
  let kit: TestKit;
  let passwordHash = ""; // the bcrypt fingerprint of PASSWORD, made once (bcrypt is slow on purpose: ±0.3 seconds)
  const logIn = (email: string, password: string) => kit.app.inject({ method: "POST", url: "/auth/login", payload: { email, password } });
  const accountSessions = () => kit.pool.query<{ token_hash: string; previous_token_hash: string | null }>(
    "SELECT s.token_hash, s.previous_token_hash FROM sessions s JOIN users u ON u.id = s.user_id WHERE u.email = $1", [EMAIL]);

  beforeAll(async () => {
    kit = await setupTest();
    const { makeFingerprint } = await import("../auth/password.ts"); // the same function as npm run users (cost 12)
    passwordHash = await makeFingerprint(PASSWORD);
  }, 60_000);
  beforeEach(async () => { // a new account for every test; its old sessions are deleted with it (ON DELETE CASCADE)
    await kit.pool.query("DELETE FROM users WHERE email = $1", [EMAIL]);
    await kit.pool.query(
      "INSERT INTO users (email, name, role, password_hash, password_changed_at) VALUES ($1, 'Login Test', 'viewer', $2, now())",
      [EMAIL, passwordHash]);
  });
  afterAll(async () => {
    if (!kit) return; // setupTest() failed: its error was already reported
    await kit.pool.query("DELETE FROM users WHERE email = $1", [EMAIL]);
    await kit.close();
  });

  it("the right password: two httpOnly cookies, the session stored in the database only as the refresh token's SHA-256", async () => {
    const answer = await logIn(EMAIL, PASSWORD);
    expect(answer.statusCode).toBe(200);
    expect(answer.json()).toMatchObject({ email: EMAIL, role: "viewer" });
    expect(answer.cookies.find((c) => c.name === "access")).toMatchObject({ httpOnly: true, path: "/" });
    expect(answer.cookies.find((c) => c.name === "session")).toMatchObject({ httpOnly: true, path: "/auth" });

    const session = await accountSessions();
    expect(session.rows).toEqual([{ token_hash: sha256(cookie(answer, "session")), previous_token_hash: null }]);
    // the wristband from this login opens the routes with a padlock: /auth/me reads its account from the database
    const me = await kit.app.inject({ method: "GET", url: "/auth/me", cookies: { access: cookie(answer, "access") } });
    expect(me.json()).toMatchObject({ email: EMAIL, name: "Login Test" });
  });

  it("a wrong password and an unregistered email: the same 401, no cookie and no new session", async () => {
    const wrong = await logIn(EMAIL, "not this account's password at all");
    const unknown = await logIn("not-registered@home.test", PASSWORD);
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(unknown.json()).toEqual(wrong.json()); // the same answer: a guesser can't tell which email is registered
    expect(wrong.cookies).toEqual([]);
    expect((await accountSessions()).rowCount).toBe(0);
  });

  it("refresh: the session cookie swapped for a new one (rotation); the database stores the fingerprints of the new and the old token", async () => {
    const login = await logIn(EMAIL, PASSWORD);
    const oldSession = cookie(login, "session");
    const refreshed = await kit.app.inject({ method: "POST", url: "/auth/refresh", cookies: { session: oldSession } });
    expect(refreshed.statusCode).toBe(200);

    const newSession = cookie(refreshed, "session");
    expect(newSession).not.toBe(oldSession);
    expect((await accountSessions()).rows).toEqual([{ token_hash: sha256(newSession), previous_token_hash: sha256(oldSession) }]);
  });

  it("logout: the session row deleted, both cookies emptied, the old session cookie can't refresh again", async () => {
    const session = cookie(await logIn(EMAIL, PASSWORD), "session");
    const loggedOut = await kit.app.inject({ method: "POST", url: "/auth/logout", cookies: { session } });
    expect(loggedOut.statusCode).toBe(200);
    expect(cookie(loggedOut, "access")).toBe("");
    expect(cookie(loggedOut, "session")).toBe("");
    expect((await accountSessions()).rowCount).toBe(0);

    const again = await kit.app.inject({ method: "POST", url: "/auth/refresh", cookies: { session } });
    expect(again.statusCode).toBe(401);
  });
});
