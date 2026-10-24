// warmup.js - a JavaScript warm-up before Module 22
// Five small skills that come back later in the dashboard's React components.

// 1. A reading object and destructuring
const reading = {
  device_id: "a4cf12e5b7c0",
  telemetry: { ts: "2026-10-23T09:41:30Z", fw: "1.5.0", temperature: 28.5, humidity: 71, light: 3094, soil: 37, motion: false, water_level: 52 },
};
const { temperature, humidity } = reading.telemetry; // take two fields at once into variables with the same names
console.log("Temperature:", temperature, "°C, humidity:", humidity, "%");
// destructuring also works right in a function's parameters, exactly the way a React component receives props
function card({ label, value, unit }) {
  return `${label}: ${value} ${unit}`;
}
console.log(card({ label: "Temperature", value: temperature, unit: "°C" }));

// 2. From an array to a list: map
const devices = [
  { device_id: "a4cf12e5b7c0", name: "Node 1 living room", status: "online" },
  { device_id: "246f28b1c7d4", name: "Node 2 garden", status: "online" },
  { device_id: "f00d00000001", name: "Practice living room", status: "unknown" },
];
const lines = devices.map((p) => `${p.name} (${p.status})`); // one object in, one line of text out
console.log(lines);
console.log(devices.map((p) => p.device_id).join(", ")); // device_id is unique: later it becomes the key in React

// 3. Choosing what to show: ? :, &&, and ??
const failed = { temperature: null, humidity: null, light: 2310, soil: 0, motion: true, water_level: null }; // rule 7: failed = null
console.log("Temperature:", failed.temperature ?? "—"); // ?? replaces null (and undefined) with "—"
console.log("Soil:", failed.soil ?? "—", "not", failed.soil || "—"); // || replaces 0 too, yet 0 % is a valid reading
console.log(failed.motion ? "Motion detected" : "No motion"); // ? : picks one of two
const error = "Can't reach the server";
console.log(error && `Red box: ${error}`); // && : if the left side holds something, the result is the right side
const noError = null;
console.log(noError && `Red box: ${noError}`); // if the left side is null, it stops at the left (React draws nothing)

// 4. Copying while changing: spread ...
const oldState = { fan: false, lamp: true, pump: false, curtain: 90 };
const newState = { ...oldState, fan: true }; // a new copy, one field replaced
console.log(oldState.fan, newState.fan); // the old one doesn't change
console.log(oldState === newState); // false: two different objects, so React knows something is new
const newDevices = [...devices, { device_id: "c0ba00000001", name: null, status: "unknown" }];
console.log(devices.length, newDevices.length);

// 5. Asking the backend: fetch, res.ok, and try/catch
// GET /health is open without login. Node has no CORS: that rule belongs to the browser (Concept 9).
try {
  const res = await fetch("http://127.0.0.1:8080/health");
  if (!res.ok) {
    console.log("The backend answers, but with code", res.status); // fetch does NOT throw an error for 404 or 500
  } else {
    const health = await res.json();
    console.log("Backend alive:", health.ok, "| broker:", health.broker, "| database:", health.database);
  }
} catch (err) {
  // fetch only throws an error when the server can't be reached at all (down or a wrong address)
  console.log("The backend can't be reached. Start it first with npm run dev in the backend folder.");
  console.log("Details:", err.cause?.code ?? err.message);
}
