// token.ts - the lifetimes of the "wristband" (access JWT) and the refresh token (Module 20). Refresh token = 32 random
// bytes, NOT a JWT. Its content means nothing; its row in the sessions table gives it meaning. The database only stores
// its SHA-256: a random 256-bit token can't be guessed, so a fast hash is enough (bcrypt is for human-made passwords).
import { createHash, randomBytes } from "node:crypto";

export const ACCESS_AGE_SECONDS = 15 * 60; // access JWT ("concert wristband"): 15 minutes
export const SESSION_AGE_SECONDS = 7 * 24 * 60 * 60; // refresh token ("season pass"): 7 days from login, then log in again
export const GRACE_MS = 30_000; // a token that was just replaced may be used again for 30 seconds (two requests at once)

export function makeSessionToken(): string {
  return randomBytes(32).toString("base64url"); // 43 random characters; safe to put in a cookie
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex"); // 64 hexadecimal characters
}

// What to do with a refresh token that matches NO token_hash, but matches the previous_token_hash of a session?
// (pure logic, tested by Vitest)
// - replaced less than GRACE_MS ago: another request from the same browser happened to refresh first
//   (for example two tabs) -> just give it a new access JWT, the session stays;
// - 30 seconds or more: an old token is used again, probably stolen -> revoke its session.
export function judgeOldToken(updatedAt: Date, now: number): "grace" | "stolen" {
  return now - updatedAt.getTime() < GRACE_MS ? "grace" : "stolen";
}
