// key.test.ts - unit tests for device keys (Module 21): the key shape, the SHA-256 fingerprint, and constant-time matching.
// No database and no broker. Run: npm test
import { describe, expect, it } from "vitest";
import { Key, makeKey, matchKey, hashKey } from "./key.ts";

describe("device key", () => {
  it("43 base64url characters, passes the Key schema, and is never the same twice", () => {
    const a = makeKey();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Key.safeParse(a).success).toBe(true);
    const many = new Set(Array.from({ length: 1000 }, () => makeKey()));
    expect(many.size).toBe(1000);
  });
  it("the Key schema rejects a truncated key or one with other characters", () => {
    expect(Key.safeParse("a".repeat(42)).success).toBe(false);
    expect(Key.safeParse("a".repeat(42) + "=").success).toBe(false); // plain base64, not base64url
    expect(Key.safeParse(" " + "a".repeat(42)).success).toBe(false); // a space stuck to it
  });
  it("fingerprint = 64-character hexadecimal SHA-256, always the same for the same key", () => {
    expect(hashKey("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const k = makeKey();
    expect(hashKey(k)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashKey(k)).toBe(hashKey(k));
    expect(hashKey(k)).not.toContain(k);
  });
  it("matchKey: the right key matches, another key doesn't, a device with no key (revoked) never matches", () => {
    const k = makeKey();
    const fingerprint = hashKey(k);
    expect(matchKey(k, fingerprint)).toBe(true);
    expect(matchKey(makeKey(), fingerprint)).toBe(false);
    expect(matchKey(k.slice(0, 42) + (k.endsWith("A") ? "B" : "A"), fingerprint)).toBe(false); // last character differs
    expect(matchKey(k, null)).toBe(false);
  });
});
