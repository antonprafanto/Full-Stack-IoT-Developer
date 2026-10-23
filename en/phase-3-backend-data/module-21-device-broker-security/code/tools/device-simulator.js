// device-simulator.js — ten fake "Node 1" devices that speak MQTT exactly as the data contract says (Appendix A).
// Module 16 - Practice 7. What it is for: developing and testing the backend without hardware and without Wokwi.
// Module 19 (contract 1.3): telemetry carries state (the actuator state) and is sent immediately when an actuator changes;
// config commands are saved to data/simulator-store.json (the NVS stand-in); the temperature can be set from the terminal;
// offline mode after the broker is unreachable for 2 minutes, with a hysteresis safety fan; the offline-mode report in the
// first vitals after reconnecting (delayed 10 seconds).
// Module 21: each fake device connects to the broker with its OWN account: username = device_id, its key from the file
// tools/.env (one line per device, for example KEY_F00D00000001=...). A device with no key is not started. If the broker
// rejects its key, that device retries every 60 seconds, like Node 1 v1.6.0.
//
// How to use (from a terminal, in the tools folder):
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883            -> 10 fake devices
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 1          -> 1 fake device (the easiest to watch)
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 clean      -> delete the retained status of the fake devices
// While it runs, type in the same terminal, then press Enter (Module 19):
//   temp 33      -> every fake device reads 33.0 °C, like moving the DHT22 slider in Wokwi (use a point: temp 29.5)
//   temp random  -> back to a random temperature of 25.0-33.0 °C
// Stop with Ctrl+C: the broker then publishes the "offline" last will of every fake device.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import mqtt from "mqtt";
import { buildTelemetry } from "./generate-dummy.js";

const BROKER_URL = process.argv[2] || "mqtt://127.0.0.1:1883";
const COUNT = Number(process.argv[3]) || 10;
const OFFLINE_MODE_TIMEOUT = 2 * 60 * 1000; // Module 19: broker unreachable for 2 minutes = offline mode (contract rule 5)
const FAN_HYSTERESIS = 2; // Module 19: the safety fan turns off below temp_fan_on - 2 (hysteresis, Module 13)
const STORE_FILE = "data/simulator-store.json"; // Module 19: the NVS stand-in; Git ignores the data/ folder (.gitignore)

// a fake device_id: 12 lowercase hexadecimal digits, starting with f00d so it's easy to recognize
function makeDeviceId(number) {
  return "f00d" + String(number).padStart(8, "0");
}

// Module 21: the broker key of one fake device from tools/.env, for example KEY_F00D00000001. undefined = not filled in yet.
function deviceKey(deviceId) {
  return process.env[`KEY_${deviceId.toUpperCase()}`] || undefined;
}
const REJECTED_CODES = [4, 5, 134, 135]; // Module 21: the broker's "wrong key / not allowed" answer (MQTT 3.1.1 and 5)

// UTC time without milliseconds, like ts in the data contract: 2026-10-19T04:14:28Z
function timeNow() {
  return new Date().toISOString().slice(0, 19) + "Z";
}

// Module 19: the "NVS" of all fake devices, for example { "f00d00000001": { "temp_fan_on": 31, "soil_watering": 35 } }
let store = {};
try {
  store = JSON.parse(readFileSync(STORE_FILE, "utf8"));
} catch {
  store = {}; // the file doesn't exist yet: every device uses the default numbers
}

function saveStore() {
  mkdirSync("data", { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

let typedTemp = null; // Module 19: null = a random temperature; a number = typed in the terminal ("temp 33")

// Module 19: the same as the config check in firmware v1.5.0. The answer is "" if it is valid, or the reason for refusing it.
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

function runDevice(deviceId) {
  const topic = (kind) => `msh/${deviceId}/${kind}`;
  const start = Date.now();
  const state = { fan: false, lamp: false, pump: false, curtain: 90 };
  const lastIds = []; // ids of the commands already carried out (contract rule 8)
  // Module 19
  const thresholds = { temp_fan_on: 30, soil_watering: 30, ...store[deviceId] }; // the default numbers = Node 1's config.h
  let temperature = 28.5; // the last temperature reading, used by telemetry and by the safety
  let fanOwnedBySafety = false; // true if the safety turned the fan on (the automatic lamp pattern of Module 6)
  let lastConnected = Date.now();
  let offline = false;
  let offlineStart = 0;
  let localFan = 0; // how many times the safety turned the fan on during this offline mode
  let report = null; // { offline_s, local_fan } waiting to go along with vitals
  let timer = null; // Module 19: the next scheduled telemetry
  let lastPublished = 0; // Module 19: when the last telemetry was published

  const client = mqtt.connect(BROKER_URL, {
    clientId: deviceId,
    username: deviceId, // Module 21: the broker username = device_id
    password: deviceKey(deviceId), // Module 21: from tools/.env
    clean: true,
    keepalive: 15,
    reconnectPeriod: 5000, // reconnect at most every 5 seconds (contract section 3)
    reconnectOnConnackError: true, // Module 21: without this, the library stops trying as soon as the broker rejects its key
    will: { topic: topic("status"), payload: "offline", qos: 1, retain: true },
  });

  // Module 21: broker rejects the key? Write it clearly, then retry only 60 seconds later (like Node 1 v1.6.0).
  client.on("error", (error) => {
    if (REJECTED_CODES.includes(error.code)) {
      client.options.reconnectPeriod = 60000;
      console.log(`${deviceId}: REJECTED by broker (code ${error.code}): wrong key, not registered, or revoked. ` +
        "Retrying in 60 seconds.");
    } else {
      console.log(`${deviceId}: MQTT error: ${error.message}`);
    }
  });

  // vitals: once after connecting, then every 5 minutes (contract section 2)
  function sendVitals() {
    const vitals = {
      ts: timeNow(),
      rssi: -40 - Math.floor(Math.random() * 40), // -40 to -79 dBm
      uptime_s: Math.floor((Date.now() - start) / 1000),
      heap_free: 180000 + Math.floor(Math.random() * 20000),
      ...report, // Module 19 (contract 1.3): offline_s and local_fan, only in the first vitals after offline mode
    };
    client.publish(topic("vitals"), JSON.stringify(vitals));
    if (report) {
      console.log(`${deviceId}: offline-mode report sent with vitals (offline_s=${report.offline_s}, ` +
        `local_fan=${report.local_fan})`);
    }
    report = null;
  }

  // telemetry every 10 seconds (contract rule 3). Module 19: the next 10-second send is counted from the last send,
  // and state (the actuator state) is sent along (contract 1.3)
  function sendTelemetry() {
    if (client.connected) {
      const reading = buildTelemetry();
      reading.temperature = Math.round(temperature * 10) / 10; // Module 19: the same temperature the safety uses
      reading.state = { ...state };
      client.publish(topic("telemetry"), JSON.stringify(reading));
      lastPublished = Date.now();
    }
    scheduleNext(10000);
  }

  function scheduleNext(delay) {
    clearTimeout(timer);
    timer = setTimeout(sendTelemetry, delay);
  }

  // Module 19: an actuator state changes -> an immediate send, at most every 2 seconds (contract section 4)
  function sendSoon() {
    scheduleNext(Math.max(0, lastPublished + 2000 - Date.now()));
  }

  client.on("connect", () => {
    client.options.reconnectPeriod = 5000; // Module 21: key accepted again: back to the normal interval
    if (offline) { // Module 19: connected again after offline mode
      offline = false;
      report = { offline_s: Math.round((Date.now() - offlineStart) / 1000), local_fan: localFan };
      console.log(`${deviceId}: OFFLINE MODE ENDED after ${report.offline_s} seconds; ` +
        `local safety turned the fan on ${localFan} time(s)`);
    }
    lastConnected = Date.now();
    client.publish(topic("status"), "online", { qos: 1, retain: true });
    client.subscribe(topic("cmd"), { qos: 1 });
    // Module 19: the offline-mode report is delayed 10 seconds. A backend that reconnects too (for example because the
    // broker was just started again) needs a few seconds to subscribe; without this delay the report can be missed.
    if (report) setTimeout(() => { if (client.connected) sendVitals(); }, 10000);
    else sendVitals();
    console.log(`${deviceId}: online`);
  });
  client.on("offline", () => { // Module 19; Module 21: not written if the cause is a rejected key (that message already exists)
    if (client.options.reconnectPeriod === 5000) console.log(`${deviceId}: broker unreachable, retrying every 5 seconds`);
  });
  setInterval(() => {
    if (client.connected) sendVitals();
  }, 5 * 60 * 1000);

  client.on("message", (_topic, content) => {
    if (content.length === 0) return; // Module 19: an empty message = the retained config was deleted, not a command
    let cmd;
    try {
      cmd = JSON.parse(content.toString());
    } catch {
      return; // not JSON: can't be answered (contract rule 4)
    }
    if (typeof cmd.id !== "string" || cmd.id.length > 39) return;
    if (lastIds.includes(cmd.id)) return; // the same id is carried out only once (a retained config that comes again)
    lastIds.push(cmd.id);
    if (lastIds.length > 8) lastIds.shift();

    const before = JSON.stringify(state); // Module 19: to know whether an actuator changed
    let message = "";
    if (cmd.action === "config") { // Module 19: every threshold is checked first, then saved
      message = checkThresholds(cmd.thresholds);
      if (message === "") {
        const updated = { ...thresholds, ...cmd.thresholds };
        if (JSON.stringify(updated) !== JSON.stringify(thresholds)) { // like NVS: write only if it changed
          Object.assign(thresholds, updated);
          store[deviceId] = { ...thresholds };
          saveStore();
          console.log(`${deviceId}: thresholds saved ${JSON.stringify(thresholds)}`);
        } else {
          console.log(`${deviceId}: thresholds same as the stored ones ${JSON.stringify(thresholds)}`);
        }
      }
    } else if (cmd.action !== "set") message = `action ${cmd.action} not supported yet`;
    else if (cmd.target === "lamp" || cmd.target === "fan") {
      if (typeof cmd.value === "boolean") {
        state[cmd.target] = cmd.value;
        if (cmd.target === "fan") fanOwnedBySafety = false; // Module 19: the fan passes to whoever sent the command
      } else message = `${cmd.target} value must be true or false`;
    } else if (cmd.target === "pump") {
      if (Number.isInteger(cmd.value) && cmd.value >= 1 && cmd.value <= 10) {
        state.pump = true;
        setTimeout(() => {
          state.pump = false;
          sendSoon(); // Module 19: the pump turning off by itself = an actuator state change
        }, cmd.value * 1000);
      } else message = "pump value must be 1-10 seconds";
    } else if (cmd.target === "curtain") {
      if (Number.isInteger(cmd.value) && cmd.value >= 0 && cmd.value <= 180) state.curtain = cmd.value;
      else message = "curtain value must be 0-180 degrees";
    } else message = `unknown target ${cmd.target}`;

    const ack = { id: cmd.id, ts: timeNow(), ok: message === "", state: { ...state } };
    if (message !== "") ack.message = message;
    client.publish(topic("ack"), JSON.stringify(ack));
    console.log(`${deviceId}: command ${cmd.id} -> ok=${ack.ok}`);
    if (JSON.stringify(state) !== before) sendSoon(); // Module 19
  });

  // Module 19: every 2 seconds, like Node 1's ACTING step: take a temperature reading, check offline mode, run the safety.
  setInterval(() => {
    temperature = typedTemp ?? buildTelemetry().temperature;
    if (client.connected) {
      lastConnected = Date.now();
    } else if (!offline && Date.now() - lastConnected >= OFFLINE_MODE_TIMEOUT) {
      offline = true;
      offlineStart = Date.now();
      localFan = 0;
      console.log(`${deviceId}: OFFLINE MODE: broker unreachable for 2 minutes; local safety turns the fan on above ` +
        `${thresholds.temp_fan_on} °C`);
    }
    if (offline && !state.fan && temperature > thresholds.temp_fan_on) {
      state.fan = true;
      fanOwnedBySafety = true;
      localFan++;
      console.log(`${deviceId}: local safety: temperature ${temperature.toFixed(1)} °C, fan turned on`);
      sendSoon();
    } else if (fanOwnedBySafety && temperature < thresholds.temp_fan_on - FAN_HYSTERESIS) {
      state.fan = false;
      fanOwnedBySafety = false;
      console.log(`${deviceId}: local safety: temperature ${temperature.toFixed(1)} °C, fan turned off`);
      sendSoon();
    }
  }, 2000);

  scheduleNext(Math.random() * 10000); // the first send at a random second so that the fake devices don't all send at once
}

// clean: publish an empty retained message to the status topic of every fake device, so that the broker forgets their
// "offline" status (the way to delete a retained message, Module 11), then finish. Module 21: each device connects with its
// own account, and the broker ACL only lets a device WRITE its own topics (status, telemetry, vitals, ack), not its cmd. The
// retained config on cmd is no longer deleted here: only the backend and nodered accounts may write cmd, and that config is
// harmless (only the device itself may read it).
// Ran more than 10 devices before? Add the number: ... clean 20
async function clean(count) {
  let withKeys = 0;
  for (let i = 1; i <= count; i++) {
    const deviceId = makeDeviceId(i);
    if (!deviceKey(deviceId)) continue; // no key: can't connect, skip
    withKeys++;
    try {
      const client = await mqtt.connectAsync(BROKER_URL, { clientId: deviceId, username: deviceId,
        password: deviceKey(deviceId), reconnectPeriod: 0 });
      await client.publishAsync(`msh/${deviceId}/status`, "", { qos: 1, retain: true });
      await client.endAsync();
      console.log(`${deviceId}: retained status cleared from the broker.`);
    } catch (error) {
      console.log(`${deviceId}: couldn't connect to ${BROKER_URL}: ${error.message}`);
    }
  }
  if (withKeys === 0) console.log("No fake device has a key in tools/.env: nothing cleaned.");
}

if (process.argv[3] === "clean") {
  await clean(Number(process.argv[4]) || 10);
} else {
  let withKeys = 0; // Module 21
  for (let i = 1; i <= COUNT; i++) {
    const deviceId = makeDeviceId(i);
    if (!deviceKey(deviceId)) {
      console.log(`${deviceId}: no key in tools/.env (KEY_${deviceId.toUpperCase()}=...), not started.`);
      continue;
    }
    withKeys++;
    runDevice(deviceId);
  }
  if (withKeys === 0) {
    console.log("No fake device has a key. Fill in tools/.env, then run with: node --env-file=.env …");
    process.exit(1);
  }
  // Module 19: "temp 33" / "temp random" are typed in this terminal. Only in this mode: in clean mode, a terminal listener
  // would keep the program from finishing by itself.
  createInterface({ input: process.stdin }).on("line", (line) => {
    const [word, arg] = line.trim().toLowerCase().split(/\s+/);
    const num = Number(arg);
    if (word === "temp" && arg === "random") {
      typedTemp = null;
    } else if (word === "temp" && arg !== undefined && Number.isFinite(num)) {
      typedTemp = num;
    } else {
      console.log("Type for example: temp 33  or  temp random");
      return;
    }
    console.log(typedTemp === null ? "Temperature: random 25.0-33.0 °C" : `Temperature: ${typedTemp.toFixed(1)} °C`);
  });
  console.log(`${withKeys} fake device(s) heading to ${BROKER_URL}. Type "temp 33" or "temp random". Stop with Ctrl+C.`);
}
