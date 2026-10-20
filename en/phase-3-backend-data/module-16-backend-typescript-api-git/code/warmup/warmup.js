// warmup.js - a JavaScript warm-up before Module 16
import { average } from "./helpers.js";

// 1. Objects and JSON
const text = '{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","temperature":28.5,"humidity":71,"motion":false}';
const reading = JSON.parse(text); // JSON text -> object
console.log("Temperature:", reading.temperature, "°C");
console.log("Any motion?", reading.motion);
reading.location = "living room"; // add a new field
console.log(JSON.stringify(reading)); // object -> JSON text

// 2. Arrays, filter, and map
const list = [
  { device_id: "a4cf12e5b7c0", temperature: 28.5 },
  { device_id: "246f28b1c7d4", temperature: 31.2 },
  { device_id: "f00d00000001", temperature: 33.0 },
];
const hot = list.filter((r) => r.temperature > 30);
console.log("Devices above 30 °C:", hot.length);

// 3. Arrow functions and template literals
const summarize = (r) => `${r.device_id}: ${r.temperature} °C`;
console.log(list.map(summarize));

// 4. import from another file
console.log("Average temperature:", average(list.map((r) => r.temperature)).toFixed(1), "°C");

// 5. Waiting without freezing: Promise and await
const wait = (ms) => new Promise((done) => setTimeout(done, ms));
console.log("Waiting 1 second...");
await wait(1000);
console.log("Done waiting.");

// 6. fetch: asking another server over HTTP
const reply = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.85&current=temperature_2m");
console.log("Status code:", reply.status);
const data = await reply.json();
console.log("Jakarta temperature now:", data.current.temperature_2m, "°C");
