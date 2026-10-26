// warmup.js - a JavaScript warm-up before Module 24
// Five small skills that dashboard v1.0 uses later: an address becomes a screen, a promise that fails, save-change-roll back,
// checking input, and messages that disappear by themselves. Run it with: node warmup.js
import { setTimeout as wait } from "node:timers/promises";

// 1. An address becomes a screen: read the parts of an address, then match them with a pattern such as /devices/:id
console.log("--- 1. An address becomes a screen");
const address = new URL("http://localhost:5173/devices/f00d00000001/history?range=7days");
console.log("pathname:", address.pathname); // the path part, without the host name and without ?…
console.log("range   :", address.searchParams.get("range")); // the value after ?range=

// match("/devices/:id", "/devices/abc") -> { id: "abc" }; no match -> null
function match(pattern, path) {
  const patternParts = pattern.split("/"); // "/devices/:id" -> ["", "devices", ":id"]
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null; // they must have the same number of segments
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) params[patternParts[i].slice(1)] = pathParts[i]; // a ":id" segment = anything goes
    else if (patternParts[i] !== pathParts[i]) return null; // an ordinary segment must be exactly the same
  }
  return params;
}
// a small "route map": the first pattern that matches decides the screen. That's the heart of how <Routes> works in React Router.
const routeMap = [
  { pattern: "/devices", screen: "Device List" },
  { pattern: "/devices/:id", screen: "Details" },
  { pattern: "/devices/:id/history", screen: "History" },
];
for (const path of ["/devices", "/devices/f00d00000001", address.pathname, "/devics"]) {
  const hit = routeMap.map((r) => ({ ...r, params: match(r.pattern, path) })).find((r) => r.params !== null);
  console.log(path.padEnd(32), "->", hit ? hit.screen + " " + JSON.stringify(hit.params) : "Page not found");
}

// 2. A promise that fails: fetch does NOT throw an error for 409 or 504; we are the ones who check res.ok
console.log("--- 2. A promise that fails");
// a fake fetch: answers after 300 ms with the code asked for, like POST /devices/:id/command
async function fakeFetch(code) {
  await wait(300);
  if (code === 0) throw new TypeError("Failed to fetch"); // the backend is down: ONLY this makes fetch throw an error
  const bodies = {
    200: { ack: { ok: true } },
    409: { message: "device is offline" },
    504: { message: "no ack within 5 seconds" },
  };
  return { ok: code >= 200 && code < 300, status: code, json: async () => bodies[code] };
}
for (const code of [200, 409, 504, 0]) {
  let waiting = true; // in the dashboard: the text "Waiting for device confirmation…"
  try {
    const res = await fakeFetch(code);
    if (!res.ok) throw new Error(res.status + " " + (await res.json()).message); // turn a failed answer into an error
    console.log(code, "success:", JSON.stringify(await res.json()));
  } catch (err) {
    console.log(code, "failed :", err.message); // in the dashboard: a toast
  } finally {
    waiting = false; // finally ALWAYS runs, success or failure: the "Waiting…" text is sure to go away
    console.log("   waiting =", waiting);
  }
}

// 3. Save first, change, roll back: the basis of the optimistic button and the "rollback"
console.log("--- 3. Save first, change, roll back");
const reported = { lamp: false, fan: true }; // the state the device reports
const shown = { ...reported, lamp: true }; // ... = a NEW copy; the lamp is "on" on the screen at once (optimistic)
console.log("shown (optimistic):", shown, "| reported stays:", reported);
const commandFailed = true; // for example the device answers 409
const final = commandFailed ? reported : shown; // failed: back to what was reported (rollback)
console.log("after the answer  :", final);
const wrong = reported; // NOT a copy: two names for the same thing
wrong.lamp = true;
console.log("without a copy    :", reported, "<- the reported state changed too, it can't be rolled back anymore");

// 4. Checking input: text from an input box becomes a number, then it is checked before it is sent
console.log("--- 4. Checking input");
for (const text of ["30", "", "  25  ", "2,5", "abc"]) {
  const n = Number(text);
  const whole = Number.isInteger(n);
  console.log(JSON.stringify(text).padEnd(8), "-> Number:", String(n).padEnd(4), "| integer?", whole, "| NaN?", Number.isNaN(n));
}
// watch out: Number("") = 0, not "empty". An empty <input type="number"> box is read by react-hook-form (valueAsNumber)
// as NaN, so in the rule form an empty box is still caught ("Enter a number").
// a home-made checker: its result is a list of errors per field, like the one Zod makes later
function checkRule(input) {
  const errors = [];
  if (input.name.trim() === "") errors.push({ field: "name", message: "Required" });
  if (Number.isNaN(input.on_below)) errors.push({ field: "on_below", message: "Enter a number" });
  // two valid numbers, but the "end" limit isn't above the "start" limit: the rule would keep turning on and off
  else if (!(input.off_above > input.on_below)) {
    errors.push({ field: "off_above", message: "must be greater than on_below (hysteresis)" });
  }
  return errors;
}
console.log(checkRule({ name: "Water", on_below: 30, off_above: 35 })); // [] = passes
console.log(checkRule({ name: "   ", on_below: 30, off_above: 25 })); // an empty name + a reversed hysteresis
console.log(checkRule({ name: "Water", on_below: Number("abc"), off_above: 35 })); // NaN is caught
console.log(checkRule({ name: "Water", on_below: Number(""), off_above: 35 })); // []: an EMPTY box passes (0)!

// 5. Messages that disappear by themselves: a message queue with setTimeout (runs ONCE, not setInterval)
console.log("--- 5. Messages that disappear by themselves");
const SHOW_MS = 1500; // milliseconds (in the dashboard: 4000)
const MAX_TOASTS = 3; // (in the dashboard: 2)
let toasts = [];
let lastId = 0;
const start = Date.now();
function print(what) {
  const ms = String(Date.now() - start).padStart(4);
  console.log(`  +${ms} ms ${what.padEnd(16)} shown: [${toasts.map((t) => t.message).join(" | ")}]`);
}
function add(message) {
  const id = ++lastId;
  toasts = [...toasts, { id, message }].slice(-MAX_TOASTS); // more than 3: the oldest is dropped
  const timer = setTimeout(() => remove(id, "expired"), SHOW_MS);
  print("add " + id);
  return timer;
}
function remove(id, cause) {
  toasts = toasts.filter((t) => t.id !== id); // already gone? nothing happens
  print(cause + " " + id);
}
add("Lamp on");
const timerTwo = add("Pump watering");
await wait(500);
clearTimeout(timerTwo); // closed with the ✕ button: its timer is cancelled so it doesn't run for nothing
remove(2, "closed");
add("Soil 25 %");
add("Temperature 31 °C");
add("Fan on"); // the fourth message shown: message number 1 is pushed out
await wait(SHOW_MS + 200); // wait until every timer has finished
