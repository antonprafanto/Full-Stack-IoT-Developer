// send-data.js — sends 3 fake readings to webhook-receiver.js
// Module 4 - Practice 9. Run it in the SECOND TERMINAL while webhook-receiver.js is running:
//   node send-data.js

import { buildTelemetry } from "./generate-dummy.js";

const ADDRESS = "http://localhost:3000/telemetry";

// pause(ms): a Promise that is kept after ms milliseconds (see wait.js)
function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let i = 1; i <= 3; i++) {
  const reading = buildTelemetry();
  const reply = await fetch(ADDRESS, {
    method: "POST", // POST = send data
    headers: { "Content-Type": "application/json" }, // label: "this content is JSON"
    body: JSON.stringify(reading), // object -> JSON text
  });
  console.log(`Sent ${i}: temperature ${reading.temperature} °C -> reply ${reply.status}`, await reply.json());
  await pause(1000); // 1-second pause so the test is quick; a real ESP32 sends every 10 seconds (Appendix A, rule 3)
}
console.log("Done. Check the receiver's terminal: all three readings are printed there.");
