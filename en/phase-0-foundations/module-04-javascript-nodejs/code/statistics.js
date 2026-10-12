// statistics.js — reads the fake sensor readings, then computes a summary
// Module 4 - Practice 5. Create the data first:  node generate-dummy.js
// Then run:  node statistics.js

import { readFile } from "node:fs/promises";

const text = await readFile("data/readings.json", "utf8"); // the file's content as text
const readings = JSON.parse(text); // JSON text -> array of objects

// map: from every reading, take only the temperature
const temperatures = readings.map((r) => r.temperature);

const lowest = Math.min(...temperatures); // three dots = "pour out everything in the array"
const highest = Math.max(...temperatures);

let total = 0;
for (const temperature of temperatures) {
  total = total + temperature;
}
const average = total / temperatures.length;

// filter: keep only the readings that meet the condition
const hot = readings.filter((r) => r.temperature > 30);
const motionDetected = readings.filter((r) => r.motion === true);

const last = readings[readings.length - 1];
console.log(`Number of readings  : ${readings.length}`);
console.log(`From                : ${readings[0].ts}`);
console.log(`To                  : ${last.ts}`);
console.log(`Lowest temperature  : ${lowest} °C`);
console.log(`Highest temperature : ${highest} °C`);
console.log(`Average temperature : ${average.toFixed(2)} °C`);
console.log(`Above 30 °C         : ${hot.length} times`);
console.log(`Motion detected     : ${motionDetected.length} times`);
