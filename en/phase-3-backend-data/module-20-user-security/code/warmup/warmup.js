// warmup.js - a JavaScript warm-up again before Module 20
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";

// 1. Fingerprints: createHash
const fingerprint = (text) => createHash("sha256").update(text).digest("hex");
console.log(fingerprint("morning coffee"));
console.log(fingerprint("morning coffee"));
console.log(fingerprint("morning coffeE"));
console.log(fingerprint("morning coffee").length, fingerprint("a sentence much longer than morning coffee").length);

const leaked = "fcf730b6d95236ecd3c9fc2d92d7b6b2bb061514961aec041d6c7a7192f592e4";
const popularPasswords = ["123456", "password", "qwerty", "secret123", "iloveyou"];
for (const guess of popularPasswords) {
  if (fingerprint(guess) === leaked) console.log(`found: ${guess}`);
}
const start = performance.now();
for (let i = 0; i < 100_000; i++) fingerprint(`guess-${i}`);
console.log(`100,000 guesses: ${Math.round(performance.now() - start)} ms`);

// 2. Random numbers that can't be guessed
const token1 = randomBytes(32).toString("base64url");
const token2 = randomBytes(32).toString("base64url");
console.log(token1);
console.log(token2);
console.log(token1.length, token1 === token2);

// 3. Making and reading a "wristband"
const SECRET = "organizers-stamp-only-the-organizers-know";
const toText = (object) => Buffer.from(JSON.stringify(object)).toString("base64url");
const sign = (headerAndPayload) => createHmac("sha256", SECRET).update(headerAndPayload).digest("base64url");
function makeWristband(payload) {
  const headerAndPayload = `${toText({ alg: "HS256", typ: "JWT" })}.${toText(payload)}`;
  return `${headerAndPayload}.${sign(headerAndPayload)}`;
}
const nowSeconds = () => Math.floor(Date.now() / 1000);
const wristband = makeWristband({ sub: "2", role: "viewer", exp: nowSeconds() + 900 });
console.log(wristband);
const [header, payload, signature] = wristband.split(".");
console.log(JSON.parse(Buffer.from(payload, "base64url").toString()));

// 4. Checking a wristband: signature and expiry
function checkWristband(text) {
  const [header, payload, signature] = text.split(".");
  if (sign(`${header}.${payload}`) !== signature) return null; // the signature doesn't match: fake
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (data.exp <= nowSeconds()) return null; // already expired
  return data;
}
const fakeWristband = `${header}.${toText({ sub: "2", role: "admin", exp: nowSeconds() + 900 })}.${signature}`;
const staleWristband = makeWristband({ sub: "2", role: "viewer", exp: nowSeconds() - 1 });
console.log(checkWristband(wristband)?.role, checkWristband(fakeWristband), checkWristband(staleWristband));
assert.equal(checkWristband(fakeWristband), null);

// 5. A mini guard: a Set holding the doors you may pass without a wristband
const OPEN = new Set(["POST /auth/login", "GET /health"]);
function guard(method, route, wristbandText) {
  if (OPEN.has(`${method} ${route}`)) return 200; // an open door
  const wearer = wristbandText === undefined ? null : checkWristband(wristbandText);
  if (wearer === null) return 401; // no wristband, a fake one, or an expired one
  if (wearer.role !== "admin" && method !== "GET") return 403; // a viewer may only look
  return 200;
}
const adminWristband = makeWristband({ sub: "1", role: "admin", exp: nowSeconds() + 900 });
console.log(
  guard("GET", "/health"),
  guard("GET", "/devices"),
  guard("GET", "/devices", wristband),
  guard("POST", "/devices/f00d00000001/command", wristband),
  guard("POST", "/devices/f00d00000001/command", fakeWristband),
  guard("POST", "/devices/f00d00000001/command", adminWristband),
);
