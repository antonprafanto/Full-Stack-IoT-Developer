// wait.js — simulates "waiting for a sensor" with a Promise and await
// Module 4 - Practice 6. Run:  node wait.js
// Then try deleting the word await on the line "const result = ...", save, and run it again.

import { buildTelemetry } from "./generate-dummy.js";

// A pretend sensor that needs 2 seconds to take a reading.
// This function immediately returns a Promise: a "promise" that the result will follow.
function readSensorSlowly() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buildTelemetry()); // 2 seconds later: the promise is kept, the result is handed over
    }, 2000);
  });
}

console.log("1. Asking the sensor to read...");
const result = await readSensorSlowly(); // await = wait until the promise is kept
console.log("2. The result has arrived:", result);
console.log("3. Moving on to the next task.");
