// auth.test.ts - unit tests of the login logic (Module 20): password rules, bcrypt fingerprints, refresh tokens, old tokens.
// No database and no server. Run: npm test
import { describe, expect, it } from "vitest";
import { Password, makeFingerprint, matchPassword } from "./password.ts";
import { GRACE_MS, makeSessionToken, hashToken, judgeOldToken } from "./token.ts";

describe("password rules (Password)", () => {
  it("14 characters refused, 15 characters accepted", () => {
    expect(Password.safeParse("a".repeat(14)).success).toBe(false);
    expect(Password.safeParse("a b c d e f g h").success).toBe(true); // exactly 15 characters: spaces count too
  });
  it("more than 72 bytes refused: bcrypt would silently cut them", () => {
    expect(Password.safeParse("a".repeat(72)).success).toBe(true);
    expect(Password.safeParse("a".repeat(73)).success).toBe(false);
    expect(Password.safeParse("😀".repeat(19)).success).toBe(false); // 19 emoji = 38 JavaScript characters, but 76 bytes
  });
});

// bcrypt is slow on purpose (about 0.3 seconds per hash on an i5 laptop, >1 second on a busy or slow laptop), so the time
// limit of these tests is raised from Vitest's default 5 seconds to 30 seconds.
const SLOW = 30_000;

describe("password fingerprint (bcrypt)", () => {
  it("the right password matches, a wrong one doesn't, and the fingerprint always differs (random salt)", async () => {
    const one = await makeFingerprint("a password just for this test");
    const two = await makeFingerprint("a password just for this test");
    expect(one).toMatch(/^\$2b\$12\$.{53}$/);
    expect(one).not.toBe(two);
    expect(await matchPassword("a password just for this test", one)).toBe(true);
    expect(await matchPassword("a password just for that test", one)).toBe(false);
  }, SLOW);
  it("no such account (empty fingerprint): the result is false, not an error", async () => {
    expect(await matchPassword("anything", undefined)).toBe(false);
    expect(await matchPassword("anything", null)).toBe(false);
  }, SLOW);
});

describe("refresh token", () => {
  it("43 base64url characters, never the same", () => {
    const a = makeSessionToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(makeSessionToken()).not.toBe(a);
  });
  it("the SHA-256 hash is always the same for the same token (so it can be looked up in the database)", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashToken("abd")).not.toBe(hashToken("abc"));
  });
  it("old token used again: within 30 seconds = grace, after that = stolen", () => {
    const replaced = new Date("2026-10-22T06:00:00+07:00");
    expect(judgeOldToken(replaced, replaced.getTime() + 5_000)).toBe("grace");
    expect(judgeOldToken(replaced, replaced.getTime() + GRACE_MS)).toBe("stolen");
    expect(judgeOldToken(replaced, replaced.getTime() + 60 * 60_000)).toBe("stolen");
  });
});
