// claim-code.ts - single-use claim codes to register a new device (Module 28). The admin creates the code on /fleet;
// the code is typed in the device's Wi-Fi portal (or the Serial command "claim <code>"), then the device exchanges it for its
// own device key through POST /provision/claim. Like a "claim certificate" in big IoT services, at home size.
//
// Its form is 8 Crockford Base32 characters, written XXXX-XXXX (for example 7K2M-QF9D): 32 characters that are hard to mix up
// when read and typed (no I, L, O, U). 8 characters x 5 bits = 40 random bits: about a trillion possibilities. With an expiry
// of 30 minutes and at most 10 attempts per minute per IP address, the chance of guessing one is practically zero.
// The database only stores its SHA-256, like device keys (key.ts): the code is shown only once, to the admin.
import { createHash, randomInt } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford Base32: 32 characters
const VALID = /^[0-9A-HJKMNP-TV-Z]{8}$/;

// A new code, for example "7K2M-QF9D". randomInt = evenly spread cryptographic randomness (not Math.random).
export function createClaimCode(): string {
  const letters = Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${letters.slice(0, 4)}-${letters.slice(4)}`;
}

// Tidy a code typed by a human: lowercase is fine, - and spaces are ignored, O is read as 0, I and L as 1
// (the Crockford rules). The result is 8 capital characters, or null if it is still not valid (U, other characters, wrong length).
export function tidyClaimCode(code: string): string | null {
  const tidy = code.toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  return VALID.test(tidy) ? tidy : null;
}

// The code's fingerprint for the database: the SHA-256 of its tidy form, so "7k2m qf9d" and "7K2M-QF9D" are the same code.
export function hashClaimCode(tidyCode: string): string {
  return createHash("sha256").update(tidyCode).digest("hex");
}
