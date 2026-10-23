// warmup.js - a JavaScript warm-up before Module 21
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// 1. A device key: 32 random bytes, written as 43 base64url characters
const makeKey = () => randomBytes(32).toString("base64url");
const node1Key = makeKey();
console.log(node1Key, node1Key.length);
const keyShape = /^[A-Za-z0-9_-]{43}$/;
console.log(keyShape.test(node1Key));
console.log(keyShape.test(node1Key + " "));
console.log(keyShape.test(node1Key.slice(0, 42)));

// 2. A fingerprint and a fair comparison
const fingerprint = (text) => createHash("sha256").update(text).digest("hex");
const stored = fingerprint(node1Key); // what the backend stores in the key_hash column
function matchKey(key, storedFingerprint) {
  const a = Buffer.from(fingerprint(key), "hex");
  const b = Buffer.from(storedFingerprint, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
console.log(stored.length);
console.log(matchKey(node1Key, stored));
const oneCharOff = (node1Key[0] === "A" ? "B" : "A") + node1Key.slice(1);
console.log(matchKey(oneCharOff, stored));
console.log(matchKey(makeKey(), stored));

// 3. Matching a topic against an access-list pattern
function matchPattern(pattern, topic, username) {
  if (username.includes("+") || username.includes("#") || username.includes("/")) return false;
  const p = pattern.split("/").map((level) => (level === "%u" ? username : level));
  const t = topic.split("/");
  for (let i = 0; i < p.length; i++) {
    if (p[i] === "#") return true;
    if (i >= t.length) return false;
    if (p[i] !== "+" && p[i] !== t[i]) return false;
  }
  return p.length === t.length;
}
console.log(matchPattern("msh/%u/telemetry", "msh/a4cf12e5b7c0/telemetry", "a4cf12e5b7c0"));
console.log(matchPattern("msh/%u/telemetry", "msh/a4cf12e5b7c0/telemetry", "c0ba00000001"));
console.log(matchPattern("msh/+/cmd", "msh/a4cf12e5b7c0/cmd", "backend"));
console.log(matchPattern("msh/#", "msh/a4cf12e5b7c0/status", "monitor"));
console.log(matchPattern("msh/%u/telemetry", "msh/a4cf12e5b7c0/telemetry", "+"));

// 4. A guest book with Map: the official registry and the second layer
const registry = new Map([
  ["a4cf12e5b7c0", { name: "Node 1 living room", revoked: null }],
  ["246f28b1c7d4", { name: "Node 2 garden", revoked: null }],
  ["c0ba00000001", { name: "test board", revoked: "2026-10-23T02:10:00Z" }],
]);
function permission(deviceId) {
  const device = registry.get(deviceId);
  if (device === undefined) return "unregistered";
  if (device.revoked !== null) return "revoked";
  return "registered";
}
for (const id of ["a4cf12e5b7c0", "c0ba00000001", "f00d00000009"]) {
  const decision = permission(id);
  console.log(id, decision, decision === "registered" ? "-> processed" : "-> IGNORED");
}

// 5. A password in a packet is just bytes
function mqttString(text) {
  const content = Buffer.from(text, "utf8");
  const length = Buffer.alloc(2);
  length.writeUInt16BE(content.length);
  return Buffer.concat([length, content]);
}
const packet = Buffer.concat([mqttString("a4cf12e5b7c0"), mqttString("Qx3-example-key")]);
console.log(packet.toString("hex"));
console.log(packet.length);
const nameLength = packet.readUInt16BE(0);
const name = packet.toString("utf8", 2, 2 + nameLength);
const passwordLength = packet.readUInt16BE(2 + nameLength);
const password = packet.toString("utf8", 4 + nameLength, 4 + nameLength + passwordLength);
console.log(name, password);
