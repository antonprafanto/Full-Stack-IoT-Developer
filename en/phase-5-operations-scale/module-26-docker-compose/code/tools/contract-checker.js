// contract-checker.js — checks every MQTT message of the project against the data contract
// (Syllabus Appendix A and DATA-CONTRACT.md). Module 11 - Practice 8. Used again in later modules.
// Version 1.1 (Module 14): Node 2 telemetry, which Node 1 publishes on behalf of Node 2, is checked against its own fields.
// Version 1.2 (Module 15): Node 1 telemetry may carry three RS-485 sensor fields (soil_rs485, soil_temperature, ec).
// Version 1.3 (Module 19): Node 1 telemetry carries state (the actuator state, the same as ack.state); vitals may carry
// the offline-mode report (offline_s and local_fan, always together); the content of config is checked; a set command
// retained on the broker is marked FAIL; an empty message on cmd = a retained message was just cleared.
// Needs the mqtt library:  npm install mqtt@5.16.1
// Version 1.4 (Module 21): a locked broker needs a "read only" account in tools/.env (CHECKER_USERNAME, CHECKER_KEY), so
// run it with node --env-file=.env (a public broker without a key: just as usual); the address may carry a port.
// Run:  node --env-file=.env contract-checker.js                (broker on this laptop)
//       node --env-file=.env contract-checker.js 192.168.1.10   (broker on another computer)
//       node --env-file=.env contract-checker.js 127.0.0.1:1884 (broker on another port, for example the practice broker)
//       node contract-checker.js broker.emqx.io 240ac45e114b    (public broker: one device_id only)
// Stop: Ctrl + C

import mqtt from "mqtt";

const address = process.argv[2] || "127.0.0.1";
const broker = address.includes(":") ? address : `${address}:1883`; // Module 21: a port may be written, default 1883
const device = process.argv[3]; // may be left out: only messages from this device_id are checked
if (device !== undefined && !/^[0-9a-f]{12}$/.test(device)) {
  console.log(`device_id must be 12 lowercase hexadecimal digits, for example 240ac45e114b. Got: ${device}`);
  process.exit(1);
}
const subscription = device ? `msh/${device}/#` : "msh/#";
const KINDS = ["telemetry", "status", "vitals", "cmd", "ack"];
const FIELDS = {
  "telemetry Node 1": { // contract 1.2: the three RS-485 sensor fields exist only when the sensor is connected; 1.3: state
    all: ["ts", "fw", "temperature", "humidity", "light", "soil", "motion", "water_level", "soil_rs485", "soil_temperature", "ec",
      "state"],
    required: ["ts", "fw", "temperature", "humidity", "light", "soil", "motion", "water_level"] },
  "telemetry Node 2": { // contract 1.1: battery may be missing (the voltage divider is optional)
    all: ["ts", "fw", "temperature", "humidity", "pressure", "soil_temperature", "soil", "battery"],
    required: ["ts", "fw", "temperature", "humidity", "pressure", "soil_temperature", "soil"] },
  vitals: { all: ["ts", "rssi", "uptime_s", "heap_free", "reset_reason", "offline_s", "local_fan"],
    required: ["ts", "rssi", "uptime_s", "heap_free"] },
  cmd: { all: ["id", "ts", "action", "target", "value", "thresholds", "url", "version"], required: ["id", "action"] },
  ack: { all: ["id", "ts", "ok", "message", "state"], required: ["id", "ts", "ok", "state"] },
};
const RESET_REASONS = ["POWERON", "BROWNOUT", "SW", "PANIC", "WDT", "DEEPSLEEP", "UNKNOWN"];
const SET_VALUES = { // the valid values for each target of a "set" command (DATA-CONTRACT.md section 7)
  lamp: [(n) => typeof n === "boolean", "true or false"],
  fan: [(n) => typeof n === "boolean", "true or false"],
  pump: [(n) => Number.isInteger(n) && n >= 1 && n <= 10, "a whole number from 1 to 10 (seconds)"],
  curtain: [(n) => Number.isInteger(n) && n >= 0 && n <= 180, "a whole number from 0 to 180 (degrees)"],
};
const seenCommands = new Map(); // command id -> time seen (ms)
const count = { passed: 0, failed: 0 };

const time = () => new Date().toLocaleTimeString("en-US");
const printSummary = () => console.log(`Summary: ${count.passed} messages PASS, ${count.failed} messages FAIL.`);
const text = (x) => (x === undefined ? "(empty)" : JSON.stringify(x));

// Required fields must be present, and no field outside the contract is allowed. Returns which fields are present.
function checkFields(content, kind, problems) {
  const { all, required = all } = FIELDS[kind];
  for (const field of required) {
    if (!(field in content)) {
      problems.push(`field "${field}" is missing`);
    }
  }
  for (const field of Object.keys(content)) {
    if (!all.includes(field)) {
      problems.push(`field "${field}" is not in the data contract`);
    }
  }
  return (field) => field in content; // used to check only the fields that are really there
}

// The ts timestamp: UTC ISO-8601 like 2026-10-18T01:30:12Z, no more than 5 minutes ahead of the laptop's clock.
function checkTs(ts, problems) {
  if (typeof ts !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(ts)) {
    problems.push(`"ts" must look like 2026-10-18T01:30:12Z (UTC), got ${text(ts)}`);
  } else if (Number.isNaN(Date.parse(ts)) || new Date(ts).getUTCFullYear() < 2025) {
    problems.push(`"ts" is not a sensible date: ${ts} (is the device's clock set?)`);
  } else if (Date.parse(ts) - Date.now() > 5 * 60 * 1000) {
    problems.push(`"ts" is more than 5 minutes ahead of the laptop's clock: ${ts}`);
  }
}

// A whole number within a range; nullAllowed = a failed reading may be written as null.
function checkInteger(name, value, min, max, nullAllowed, problems) {
  if (value === null && nullAllowed) {
    return;
  }
  if (!Number.isInteger(value) || value < min || value > max) {
    const orNull = nullAllowed ? " or null" : "";
    problems.push(`"${name}" must be a whole number from ${min} to ${max}${orNull}, got ${text(value)}`);
  }
}

// A decimal number within a range, or null (a failed reading).
function checkDecimal(name, value, min, max, problems) {
  if (value !== null && (typeof value !== "number" || value < min || value > max)) {
    problems.push(`"${name}" must be a number from ${min} to ${max} or null, got ${text(value)}`);
  }
}

// Contract 1.3: the state of the four actuators, the same in Node 1 telemetry and in ack (DATA-CONTRACT.md sections 4 and 8).
function checkState(state, problems) {
  if (typeof state !== "object" || state === null || Array.isArray(state)) {
    problems.push(`"state" must hold the actuators' state, for example {"fan":false,"lamp":true,"pump":false,"curtain":90}`);
    return;
  }
  for (const field of ["fan", "lamp", "pump", "curtain"]) {
    if (!(field in state)) problems.push(`"state" doesn't contain "${field}"`);
  }
  for (const field of Object.keys(state)) {
    if (!["fan", "lamp", "pump", "curtain"].includes(field)) problems.push(`"state.${field}" is not in the data contract`);
  }
  for (const field of ["fan", "lamp", "pump"]) {
    if (field in state && typeof state[field] !== "boolean") {
      problems.push(`"state.${field}" must be true or false, got ${text(state[field])}`);
    }
  }
  if ("curtain" in state) checkInteger("state.curtain", state.curtain, 0, 180, false, problems);
}

// Contract 1.3: the thresholds of a config command. Answers "" if they are valid, or the reason (the same as the device).
function checkThresholds(thresholds) {
  if (typeof thresholds !== "object" || thresholds === null || Array.isArray(thresholds) || Object.keys(thresholds).length === 0) {
    return "thresholds must contain temp_fan_on or soil_watering";
  }
  for (const name of Object.keys(thresholds)) {
    if (name !== "temp_fan_on" && name !== "soil_watering") return `unknown threshold: ${name}`;
  }
  const temperature = thresholds.temp_fan_on;
  const soil = thresholds.soil_watering;
  if (temperature !== undefined && (typeof temperature !== "number" || temperature < 15 || temperature > 45)) {
    return "temp_fan_on must be a number 15-45";
  }
  if (soil !== undefined && (!Number.isInteger(soil) || soil < 0 || soil > 100)) {
    return "soil_watering must be a whole number 0-100";
  }
  return "";
}

// Contract 1.1: sensor fields per device. Node 2 telemetry is recognized by its own typical field ("pressure"),
// because since contract 1.2 "soil_temperature" can also come from the RS-485 sensor of Node 1.
function checkTelemetry(content, problems) {
  const node2 = "pressure" in content || ("soil_temperature" in content && !("light" in content));
  const has = checkFields(content, node2 ? "telemetry Node 2" : "telemetry Node 1", problems);
  if (has("ts")) checkTs(content.ts, problems);
  if (has("fw") && (typeof content.fw !== "string" || !/^\d+\.\d+\.\d+$/.test(content.fw))) {
    problems.push(`"fw" must be a version like "1.2.0", got ${text(content.fw)}`);
  }
  if (has("temperature") && content.temperature !== null && (typeof content.temperature !== "number" || content.temperature < -40 || content.temperature > 80)) {
    problems.push(`"temperature" must be a number from -40 to 80 or null, got ${text(content.temperature)}`);
  }
  if (has("humidity")) checkInteger("humidity", content.humidity, 0, 100, true, problems);
  if (has("light")) checkInteger("light", content.light, 0, 4095, false, problems);
  if (has("soil")) checkInteger("soil", content.soil, 0, 100, node2, problems); // null only for Node 2
  if (has("motion") && typeof content.motion !== "boolean") {
    problems.push(`"motion" must be true or false, got ${text(content.motion)}`);
  }
  if (has("water_level")) checkInteger("water_level", content.water_level, 0, 100, true, problems);
  if (has("pressure")) checkDecimal("pressure", content.pressure, 300, 1100, problems);
  if (has("soil_temperature")) checkDecimal("soil_temperature", content.soil_temperature, -55, 125, problems);
  if (has("battery")) checkDecimal("battery", content.battery, 2.5, 4.5, problems);
  if (!node2) {
    const rs485 = ["soil_rs485", "soil_temperature", "ec"].filter((k) => k in content);
    if (rs485.length > 0 && rs485.length < 3) { // contract 1.2: the three always come together
      problems.push(`RS-485 sensor fields must be complete (soil_rs485, soil_temperature, ec), got only ${rs485.join(", ")}`);
    }
    if (has("soil_rs485")) checkDecimal("soil_rs485", content.soil_rs485, 0, 100, problems);
    if (has("ec")) checkInteger("ec", content.ec, 0, 20000, true, problems);
    if (has("state")) checkState(content.state, problems); // contract 1.3
  }
  return node2 ? "  (telemetry Node 2)" : "";
}

// Returns an extra note if vitals carries an offline-mode report (contract 1.3).
function checkVitals(content, problems) {
  const has = checkFields(content, "vitals", problems);
  if (has("ts")) checkTs(content.ts, problems);
  if (has("rssi")) checkInteger("rssi", content.rssi, -120, 0, false, problems);
  if (has("uptime_s") && (!Number.isInteger(content.uptime_s) || content.uptime_s < 0)) {
    problems.push(`"uptime_s" must be a whole number, 0 or more, got ${text(content.uptime_s)}`);
  }
  if (has("heap_free") && (!Number.isInteger(content.heap_free) || content.heap_free <= 0)) {
    problems.push(`"heap_free" must be a whole number greater than 0, got ${text(content.heap_free)}`);
  }
  if (has("reset_reason") && !RESET_REASONS.includes(content.reset_reason)) {
    problems.push(`"reset_reason" must be one of ${RESET_REASONS.join(", ")}`);
  }
  const report = ["offline_s", "local_fan"].filter((k) => k in content); // contract 1.3: the two always come together
  if (report.length === 1) {
    problems.push(`the offline-mode report must be complete (offline_s, local_fan), got only ${report[0]}`);
  }
  if (has("offline_s")) checkInteger("offline_s", content.offline_s, 0, 4294967295, false, problems);
  if (has("local_fan")) checkInteger("local_fan", content.local_fan, 0, 65535, false, problems);
  return report.length === 2 ? `  (offline-mode report: ${content.offline_s} seconds, fan on ${content.local_fan} time(s))` : "";
}

// A command id: text of 1 to 39 characters (the device ignores longer ids).
function validId(id) {
  return typeof id === "string" && id.length >= 1 && id.length <= 39;
}

function checkCmd(content, problems, retained) {
  const has = checkFields(content, "cmd", problems);
  if (has("id") && !validId(content.id)) {
    problems.push(`"id" must be text of 1 to 39 characters, got ${text(content.id)}`);
  } else if (has("id")) {
    seenCommands.set(content.id, Date.now()); // noted to measure how long the ack takes to come
  }
  if (has("ts")) checkTs(content.ts, problems);
  if (has("action") && !["set", "config", "update"].includes(content.action)) {
    problems.push(`"action" must be "set", "config", or "update", got ${text(content.action)}`);
  }
  if (content.action === "set") {
    if (!Object.hasOwn(SET_VALUES, content.target)) {
      problems.push(`"target" must be lamp, fan, pump, or curtain, got ${text(content.target)}`);
    } else if (!SET_VALUES[content.target][0](content.value)) {
      problems.push(`"value" for ${content.target} must be ${SET_VALUES[content.target][1]}, got ${text(content.value)}`);
    }
    if (retained) { // contract 1.3: only config may be retained on the broker
      problems.push("set command retained on the broker: delete it with Clear Retained Message (contract section 7)");
    }
  }
  if (content.action === "config") { // contract 1.3
    const reason = checkThresholds(content.thresholds);
    if (reason !== "") problems.push(reason);
  }
}

// Returns an extra note: how long the device took to answer the command.
function checkAck(content, problems) {
  const has = checkFields(content, "ack", problems);
  if (has("id") && !validId(content.id)) {
    problems.push(`"id" must be text of 1 to 39 characters, got ${text(content.id)}`);
  }
  if (has("ts") && content.ts !== null) checkTs(content.ts, problems); // null is allowed: the device's clock isn't set yet
  if (has("ok") && typeof content.ok !== "boolean") {
    problems.push(`"ok" must be true or false, got ${text(content.ok)}`);
  }
  if (has("state")) checkState(content.state, problems); // contract 1.3: the content of state is checked too
  if (content.ok === false && typeof content.message !== "string") {
    problems.push(`an ack that refuses (ok: false) must carry a "message" with the reason`);
  }
  if (!seenCommands.has(content.id)) {
    return "  (the checker didn't see its command)";
  }
  const elapsed = Date.now() - seenCommands.get(content.id);
  const verdict = elapsed < 1000 ? "under 1 second" : "MORE than 1 second";
  return `  (answered ${elapsed} ms after the command: ${verdict})`;
}

function check(topic, contentText, retained) {
  const parts = topic.split("/");
  const problems = [];
  let note = retained ? "  [retained]" : "";
  if (parts.length !== 3 || parts[0] !== "msh" || !/^[0-9a-f]{12}$/.test(parts[1]) || !KINDS.includes(parts[2])) {
    problems.push("topic outside the data contract: must be msh/<device_id>/<telemetry|status|vitals|cmd|ack>, "
      + "with a device_id of 12 lowercase hexadecimal digits");
  } else if (parts[2] === "status") {
    if (contentText === "") {
      note += "  (empty message: the retained status was just cleared)";
    } else if (!["online", "offline", "offline-mode"].includes(contentText)) {
      problems.push(`the status content must be online, offline, or offline-mode, got ${text(contentText)}`);
    }
  } else if (parts[2] === "cmd" && contentText === "") { // contract 1.3: not a violation
    note += "  (empty message: the retained cmd was just cleared)";
  } else {
    let content;
    try {
      content = JSON.parse(contentText);
    } catch (error) {
      problems.push(`the content is not valid JSON: ${contentText.slice(0, 60)}`);
    }
    if (content !== undefined && (typeof content !== "object" || content === null || Array.isArray(content))) {
      problems.push("the content must be a JSON object { ... }");
    } else if (content !== undefined) {
      if (parts[2] === "telemetry") note += checkTelemetry(content, problems);
      if (parts[2] === "vitals") note += checkVitals(content, problems);
      if (parts[2] === "cmd") checkCmd(content, problems, retained);
      if (parts[2] === "ack") note += checkAck(content, problems);
    }
  }
  const passed = problems.length === 0;
  count[passed ? "passed" : "failed"]++;
  console.log(`[${time()}] ${topic}  ${passed ? "PASS" : "FAIL"}${note}`);
  for (const m of problems) {
    console.log(`   - ${m}`);
  }
}

const client = mqtt.connect(`mqtt://${broker}`, {
  clientId: "checker-" + Math.random().toString(16).slice(2, 8), // a unique name, no clashes
  username: process.env.CHECKER_USERNAME, // Module 21: the "read only" account from tools/.env (empty = no account)
  password: process.env.CHECKER_KEY,
  connectTimeout: 5000,
  reconnectPeriod: 0, // doesn't retry by itself: run it again once the broker is running
});
let everConnected = false; // an error after connecting means the connection dropped midway
client.on("error", (error) => {
  const cause = error.code || error.message;
  if ([4, 5, 134, 135].includes(error.code)) { // Module 21: a locked broker rejects the checker account
    console.log(`Broker ${broker} rejected the checker account (code ${error.code}). Fill in CHECKER_USERNAME and ` +
      "CHECKER_KEY in tools/.env, then run with: node --env-file=.env contract-checker.js …");
  } else if (everConnected) {
    console.log(`\nConnection to broker ${broker} lost (${cause}). Run the checker again once the broker is running.`);
    printSummary();
  } else {
    console.log(`Can't connect to broker ${broker} (${cause}). Is the broker running?`);
  }
  process.exit(1);
});
client.on("connect", () => {
  everConnected = true;
  console.log(`Contract checker ready on broker ${broker} (subscribed to ${subscription}) — press Ctrl + C to stop.`);
  client.subscribe(subscription);
});
client.on("message", (topic, content, packet) => check(topic, content.toString(), packet.retain));
// Without this listener, the tool just goes quiet if the broker is stopped midway (reconnectPeriod: 0).
// Module 21: a locked broker uses the account name as the client name, so a second checker with the same account kicks the
// first one off (one account = one connection).
client.on("close", () => {
  console.log(`\nConnection to broker ${broker} lost: the broker was stopped, or the same checker account is used by another ` +
    "program (one account = one connection). Run the checker again.");
  printSummary();
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("");
  printSummary();
  process.exit(0);
});
