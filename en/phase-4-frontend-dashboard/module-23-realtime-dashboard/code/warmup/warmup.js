// warmup.js - a JavaScript warm-up before Module 23
// Five small skills that come back later in the live dashboard: time, a sliding window, event listeners, a tick, and CSV.
import { EventEmitter } from "node:events";
import { setTimeout as wait } from "node:timers/promises";

// 1. Time: Date.parse, Date.now, and WIB time
// A device's ts is UTC text without milliseconds, for example "2026-10-24T03:15:42Z". Here it's made "12 seconds ago".
const ts = new Date(Date.now() - 12_000).toISOString().slice(0, 19) + "Z";
const t = Date.parse(ts); // text -> number: milliseconds since 1 January 1970 (UTC)
const diffSeconds = Math.round((Date.now() - t) / 1000); // Date.now() = now, also in milliseconds
console.log("ts:", ts, "->", t);
console.log(`last seen ${diffSeconds} seconds ago`);
console.log("laptop time:", new Date(t).toLocaleTimeString("en-GB")); // follows the laptop's time zone
console.log("WIB time   :", new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }), "WIB"); // always WIB

// 2. A 5-minute sliding window: add new points, drop the ones that are too old, drop the doubles
const FIVE_MINUTES = 5 * 60 * 1000;
const now = Date.now();
const old = [
  { t: now - 6 * 60 * 1000, temperature: 27.9 }, // 6 minutes ago: already outside the window
  { t: now - 20_000, temperature: 28.4 },
  { t: now - 10_000, temperature: 28.5 },
];
const incoming = [
  { t: now - 10_000, temperature: 28.5 }, // the same point arrives twice (for example from the API and from the socket)
  { t: now, temperature: 28.7 },
];
const sorted = [...old, ...incoming] // ... = copy the items of both arrays into a NEW array; "old" isn't changed
  .filter((p) => p.t >= now - FIVE_MINUTES) // only the last 5 minutes
  .sort((a, b) => a.t - b.t); // oldest first
const slidingWindow = sorted.filter((p, i) => i === 0 || p.t !== sorted[i - 1].t); // once sorted, doubles sit side by side
console.log("old:", old.length, "points | new window:", slidingWindow.map((p) => p.temperature).join(", "));

// 3. Event listeners: on, emit, and off (the twins of socket.on / socket.off in the browser)
const fakeSocket = new EventEmitter();
function show(deviceId, content) {
  console.log(`  telemetry ${deviceId}: temperature ${content.temperature} °C`);
}
fakeSocket.on("telemetry", show); // add a listener
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.1 }); // printed once
fakeSocket.on("telemetry", show); // forgot to remove it, then added it again (like an effect without a cleanup)
console.log("telemetry listeners now:", fakeSocket.listenerCount("telemetry"));
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.2 }); // printed TWICE: the reading shows up double
fakeSocket.off("telemetry", show); // remove one, with the SAME function
fakeSocket.off("telemetry", show);
console.log("after off twice:", fakeSocket.listenerCount("telemetry"));
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.3 }); // nobody is listening: nothing is printed

// 4. A tick: setInterval and clearInterval. This is a CLOCK on the screen, not polling: nothing is asked of the server.
let tick = 0;
const timer = setInterval(() => {
  tick++;
  console.log(`  tick ${tick}: ${new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" })} WIB`);
  if (tick === 3) clearInterval(timer); // without clearInterval, the tick goes on forever
}, 1000);
await wait(3500); // wait until the three ticks are done before the next step

// 5. CSV text for Excel (English settings): a comma as the separator, a decimal point, and quotes when needed
function quote(text) {
  // a value containing , " or a line break is wrapped in quotes, and the quotes inside are doubled
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
const rows = [
  ["time_wib", "device", "avg_temp_c"],
  ["2026-10-24 10:00:00", "Node 1, living room", 28.5],
  ["2026-10-24 11:00:00", 'Node "main"', 29],
];
const csv = rows
  .map((r) => r.map((value) => (typeof value === "number" ? String(value) : quote(value))).join(","))
  .join("\r\n"); // Excel on Windows uses CRLF as the line ending
console.log(csv);
