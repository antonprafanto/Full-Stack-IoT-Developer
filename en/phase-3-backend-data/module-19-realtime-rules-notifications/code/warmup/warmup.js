// warmup.js - a JavaScript warm-up again before Module 19
import assert from "node:assert/strict";

// 1. Map: a notebook per device
const latest = new Map();
latest.set("a4cf12e5b7c0", { temperature: 28.5, fan: false });
latest.set("f00d00000001", { temperature: 31.2, fan: true });
console.log("number of devices:", latest.size);
console.log(latest.get("a4cf12e5b7c0"));
console.log(latest.has("f00d00000099"), latest.get("f00d00000099") ?? "has never sent anything");
for (const [id, reading] of latest) {
  console.log(`${id}: ${reading.temperature} °C, fan ${reading.fan ? "on" : "off"}`);
}

// 2. A pure function: the clock is passed in as a number (milliseconds)
function lastedFor(since, now, seconds) {
  return since !== null && now - since >= seconds * 1000;
}
console.log(lastedFor(0, 119_000, 120), lastedFor(0, 120_000, 120), lastedFor(null, 999_000, 120));

// 3. Checking with assert
assert.equal(lastedFor(0, 120_000, 120), true);
assert.equal(lastedFor(0, 119_999, 120), false);
assert.deepEqual(latest.get("f00d00000001"), { temperature: 31.2, fan: true });
console.log("all checks passed");

// 4. Delaying and canceling: setTimeout and clearTimeout
const timers = new Map();
function deviceOffline(id) {
  console.log(`${id} offline, wait a moment...`);
  const t = setTimeout(() => {
    timers.delete(id);
    console.log(`WARNING: ${id} offline for more than 2 seconds`);
  }, 2000);
  timers.set(id, t);
}
function deviceOnline(id) {
  const t = timers.get(id);
  if (t === undefined) return;
  clearTimeout(t);
  timers.delete(id);
  console.log(`${id} back online, warning canceled`);
}
deviceOffline("a4cf12e5b7c0");
deviceOffline("f00d00000001");
setTimeout(() => deviceOnline("a4cf12e5b7c0"), 500);

// 5. When should we notify?
const THIRTY_MINUTES = 30 * 60_000;
function shouldNotify(danger, dangerBefore, lastNotified, now) {
  if (danger !== dangerBefore) return true; // the situation changed: always notify
  if (!danger) return false; // still safe: stay quiet
  return now - lastNotified >= THIRTY_MINUTES; // still dangerous: at most once every 30 minutes
}
console.log(
  shouldNotify(true, false, 0, 0),
  shouldNotify(true, true, 0, 10 * 60_000),
  shouldNotify(true, true, 0, 30 * 60_000),
  shouldNotify(false, true, 0, 31 * 60_000),
  shouldNotify(false, false, 0, 99 * 60_000),
);
