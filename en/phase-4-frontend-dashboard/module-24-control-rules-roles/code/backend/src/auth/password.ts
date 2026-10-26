// password.ts - the password rules and the password's "fingerprint" (bcrypt hash), Module 20. The database only stores the
// fingerprint: the original password can't be computed back from it, but a typed password can be matched against it.
import bcrypt from "bcrypt";
import { z } from "zod";

// cost 12 = 2^12 rounds: about 0.3 seconds on a 2021 i5 laptop. One step up = twice as long (OWASP: at least 10, < 1 second).
export const COST = 12;

// The rules for a new password (NIST SP 800-63B-4): what matters is LENGTH, not a mix of capitals, digits, and symbols.
// bcrypt only reads the first 72 bytes, so a longer password is refused (instead of being silently cut).
export const Password = z.string()
  .min(15, "the password needs at least 15 characters; use a passphrase: a few words only you know")
  .refine((s) => Buffer.byteLength(s, "utf8") <= 72, "the password can be at most 72 bytes (the bcrypt limit; one emoji = 4 bytes)");

export function makeFingerprint(password: string): Promise<string> {
  return bcrypt.hash(password, COST); // a random salt is made automatically and is stored inside the result
}

// A dummy fingerprint for emails that aren't registered: bcrypt.compare still runs, so "wrong email" takes as long to answer
// as "wrong password", and an attacker can't tell from the response time which emails are registered.
// Made ONCE when the server starts (not when it's first needed: that would make the first attempt twice as slow).
const dummyFingerprint = bcrypt.hash("nobody's password at all", COST);

// The result is true when the password matches. fingerprint undefined/null = no such account or no password yet (still computed).
export async function matchPassword(password: string, fingerprint: string | null | undefined): Promise<boolean> {
  if (fingerprint === null || fingerprint === undefined) {
    await bcrypt.compare(password, await dummyFingerprint); // the result is thrown away: only so that the time is the same
    return false;
  }
  return bcrypt.compare(password, fingerprint);
}
