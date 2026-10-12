// generate-dummy.js — fake sensor data generator that follows the "data contract" (Syllabus Appendix A)
// Module 4 - Practice 4. Used again in Modules 10, 16, and 22.
//
// How to use (from a terminal, in the folder that contains this file):
//   node generate-dummy.js        -> writes 100 readings to data/readings.json
//   node generate-dummy.js 500    -> writes 500 readings
// Other files can use its function:
//   import { buildTelemetry } from "./generate-dummy.js";

import { mkdir, writeFile } from "node:fs/promises";

// A random whole number from min to max (both included).
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// One Node 1 "telemetry" reading, shaped exactly like the example in Appendix A.
export function buildTelemetry(time = new Date()) {
  return {
    ts: time.toISOString().slice(0, 19) + "Z", // UTC time without milliseconds, e.g. "2026-10-09T09:41:30Z"
    fw: "0.1.0", // firmware version (same as the Node 1 skeleton in Module 3)
    temperature: randomBetween(250, 330) / 10, // 25.0 to 33.0 degrees Celsius
    humidity: randomBetween(55, 85), // percent
    light: randomBetween(0, 4095), // 0 to 4095 (12-bit analog reading, Module 6)
    soil: randomBetween(20, 60), // soil moisture, percent
    motion: Math.random() < 0.2, // roughly 1 in 5 readings detects motion
    water_level: randomBetween(30, 90), // water tank level, percent
  };
}

// The part below only runs when this file is run directly
// (node generate-dummy.js), not when another file uses its function through import.
if (import.meta.main) {
  const count = Number(process.argv[2]) || 100; // the number after the file name, or 100
  const PAUSE_MS = 10000; // one reading every 10 seconds (Appendix A, rule 3), in milliseconds
  const start = Date.now() - (count - 1) * PAUSE_MS; // go back first so that the last reading = now

  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(buildTelemetry(new Date(start + i * PAUSE_MS)));
  }

  await mkdir("data", { recursive: true }); // create the data folder if it doesn't exist yet
  await writeFile("data/readings.json", JSON.stringify(list, null, 2));
  console.log(`Done: ${count} readings written to data/readings.json`);
  console.log("Example of the first reading:", list[0]);
}
