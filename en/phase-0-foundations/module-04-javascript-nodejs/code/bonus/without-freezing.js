// without-freezing.js — proof that Node.js keeps working while it waits
// Module 4 - Technical Deep Dive. Run:  node without-freezing.js

function readSensorSlowly() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(28.5), 2000); // pretend sensor: 2 seconds
  });
}

// Every 0.6 seconds, print one line: a sign that Node.js is not frozen
const tick = setInterval(() => {
  console.log("   ...while waiting, Node.js is still free to work");
}, 600);

console.log("Asking the sensor to read...");
const temperature = await readSensorSlowly();
clearInterval(tick); // stop the ticking
console.log("Temperature:", temperature, "°C");
