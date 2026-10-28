// key.ts - device keys (a per-device API key, Module 21). A key = 32 random bytes, shown ONCE when it is made, then used by
// the device as its MQTT broker password (and later for HTTP too, for example downloading firmware in Module 28). The database
// stores only its SHA-256: a random 256-bit key can't be guessed, so a fast hash is enough (bcrypt is only needed for
// human-made passwords, Module 20). A key is NEVER written to a log or to Git.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// the shape of a key: 43 base64url characters (A-Z, a-z, 0-9, - and _), safe to type in a terminal, Serial Monitor, and MQTTX
export const Key = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "device key must be 43 base64url characters");

export function makeKey(): string {
  return randomBytes(32).toString("base64url");
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex"); // 64 hexadecimal characters
}

// Does the key presented match the fingerprint in the database? The comparison is constant-time (timingSafeEqual): how long
// the answer takes doesn't depend on how many leading characters are already right, so it can't be guessed character by character.
// In Module 21 it is the broker (the password file) that checks the key; this function is for the backend later (Module 28).
export function matchKey(key: string, keyHash: string | null): boolean {
  if (keyHash === null) return false; // a device with no key (revoked, or Node 2 via Node 1)
  const given = Buffer.from(hashKey(key), "hex");
  const stored = Buffer.from(keyHash, "hex");
  return given.length === stored.length && timingSafeEqual(given, stored);
}
