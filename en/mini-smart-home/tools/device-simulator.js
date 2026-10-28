// device-simulator.js — ten fake "Node 1" devices that speak MQTT exactly as the data contract says (Appendix A).
// Module 16 - Practice 7. What it is for: developing and testing the backend without hardware and without Wokwi.
// Module 19 (contract 1.3): telemetry carries state (the actuator state) and is sent immediately when an actuator changes;
// config commands are saved to data/simulator-store.json (the NVS stand-in); the temperature can be set from the terminal;
// offline mode after the broker is unreachable for 2 minutes, with a hysteresis safety fan; the offline-mode report in the
// first vitals after reconnecting (delayed 10 seconds).
// Module 21: each fake device connects to the broker with its OWN account: username = device_id, its key from the file
// tools/.env (one line per device, for example KEY_F00D00000001=...). A device with no key is not started. If the broker
// rejects its key, that device retries every 60 seconds, like Node 1 v1.6.0.
// Module 24: the soil moisture and the tank level can be set from the terminal too, and a pump command is refused if the tank
// is below 20 % with exactly the same reason as the Node 1 firmware ("pump refused: tank water too low").
// Module 25: the "mock Garden" f00d000000b2, a fake Node 2 whose data is published by the first fake device (f00d00000001),
// exactly like a real Node 2 via Node 1: wakes every 300 seconds, online with its first packet, offline after 960 seconds without
// a packet. Needs the ACL block "Laptop path (Module 25)" in edge/acl-broker (then restart the broker) and a registration with linked_via.
//
// How to use (from a terminal, in the tools folder):
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883            -> 10 fake devices
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 1          -> 1 fake device (the easiest to watch)
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 clean      -> delete the retained status of the fake devices
// While it runs, type in the same terminal, then press Enter (Module 19):
//   temp 33      -> every fake device reads 33.0 °C, like moving the DHT22 slider in Wokwi (use a point: temp 29.5)
//   temp random  -> back to a random temperature of 25.0-33.0 °C
//   soil 25      -> Module 24: every fake device reads soil 25 % (a whole number 0-100), for example to test the rule
//                   "water if soil < 30 %". The simulator doesn't wet the soil after the pump runs: type soil 40 yourself.
//   soil random  -> back to a random soil reading of 20-60 %
//   tank 15      -> Module 24: the tank is 15 % full (a whole number 0-100); below 20 %, pump commands are refused like Node 1
//   tank random  -> back to a random tank level of 30-90 %
//   garden start  -> Module 25: the mock Garden starts (one packet now, then every 300 seconds; can't be sped up)
//   garden pull   -> "pulls out the Garden's battery": its packets stop, the offline status only comes 960 seconds after the last packet
//   garden insert -> "puts the battery back": the Garden wakes up at once and sends a packet, then every 300 seconds
// Stop with Ctrl+C: the broker then publishes the "offline" last will of every fake device. The mock Garden goes silent too, but
// its status stays "online" (Node 2 has no last will; exactly like a real Node 2 when Node 1 is off).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import mqtt from "mqtt";
import { buildTelemetry } from "./generate-dummy.js";

const BROKER_URL = process.argv[2] || "mqtt://127.0.0.1:1883";
const COUNT = Number(process.argv[3]) || 10;
const OFFLINE_MODE_TIMEOUT = 2 * 60 * 1000; // Module 19: broker unreachable for 2 minutes = offline mode (contract rule 5)
const FAN_HYSTERESIS = 2; // Module 19: the safety fan turns off below temp_fan_on - 2 (hysteresis, Module 13)
const STORE_FILE = "data/simulator-store.json"; // Module 19: the NVS stand-in; Git ignores the data/ folder (.gitignore)
const MIN_WATER_LEVEL = 20; // Module 24: the same as Node 1's config.h: the pump is refused if the tank is below 20 %
// Module 25: the mock Garden
const GARDEN_ID = "f00d000000b2"; // the device_id of the fake Node 2 ("b2" = Node 2), registered with the linking device f00d00000001
const LINKING_ID = "f00d00000001"; // the first fake device plays the Node 1 that publishes the Garden's data
// Node 2 wakes up every 300 seconds (INTERVAL_SECONDS in the Node 2 firmware). DON'T shorten it: the Grafana "silent node" alert
// (Module 25) counts the delay from this 5-minute schedule.
const GARDEN_INTERVAL = 300 * 1000;
const GARDEN_OFFLINE_AFTER = 3 * GARDEN_INTERVAL + 60 * 1000; // 960 seconds = 3 x the interval + 1 minute, the same as the Node 1 bridge

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
let typedSoil = null; // Module 24: null = a random soil reading of 20-60 %; a number = typed in the terminal ("soil 25")
let typedTank = null; // Module 24: null = a random tank level of 30-90 %; a number = typed in the terminal ("tank 15")

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
  if (deviceId === LINKING_ID) attachGardenLinking(client); // Module 25: the mock Garden rides on this device

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
      if (typedSoil !== null) reading.soil = typedSoil; // Module 24: "soil 25" typed in the terminal
      if (typedTank !== null) reading.water_level = typedTank; // Module 24: "tank 15" typed in the terminal
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
      if (!Number.isInteger(cmd.value) || cmd.value < 1 || cmd.value > 10) {
        message = "pump value must be 1-10 seconds";
      } else if (typedTank !== null && typedTank < MIN_WATER_LEVEL) {
        // Module 24: the tank safety check, with the same check order and text as the Node 1 firmware (networking.cpp).
        // A random tank level (30-90 %) is always enough, so this refusal only appears after "tank <below 20>" is typed.
        message = "pump refused: tank water too low";
        console.log(`${deviceId}: pump REFUSED: tank water only ${typedTank} %`);
      } else {
        state.pump = true;
        setTimeout(() => {
          state.pump = false;
          sendSoon(); // Module 19: the pump turning off by itself = an actuator state change
        }, cmd.value * 1000);
      }
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

// ---- Module 25: the mock Garden (a fake Node 2 published by the first fake device) ----
let linking = null; // the MQTT client of f00d00000001: only this account may write the Garden's topics (the Module 25 ACL block)
let gardenStarted = false; // true after "garden start"
let gardenBattery = false; // true = the Garden wakes every 300 seconds; false = its battery is "pulled out"
let gardenTimer = null; // the next wake-up (like a 300-second deep sleep)
let lastGardenPacket = 0; // when the Garden's last packet was published (Date.now()); 0 = never
let gardenStatus = null; // the Garden status the linking device published last: "online", "offline", or null (never)
const wibTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit",
  second: "2-digit" });
const at = (time) => `${wibTime.format(time)} WIB`; // for example 21:03:02 WIB, the same as the time in the backend's Telegram messages
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const randomOneDecimal = (min, max) => Math.round((min + Math.random() * (max - min)) * 10) / 10;

// Called by runDevice() for f00d00000001. Like a real Node 1, every time it connects (again) to the broker, the
// linking device publishes again the last Garden status it knows.
function attachGardenLinking(client) {
  linking = client;
  client.on("connect", () => {
    if (gardenStatus !== null) client.publish(`msh/${GARDEN_ID}/status`, gardenStatus, { qos: 1, retain: true });
  });
}

function publishGardenStatus(status) {
  gardenStatus = status;
  // retained, like a real Node 1. Not connected yet? It is published when the linking device connects again (see above).
  if (linking.connected) linking.publish(`msh/${GARDEN_ID}/status`, status, { qos: 1, retain: true });
}

// The Garden wakes up: one Node 2 telemetry packet (contract 1.1), then it "sleeps" 300 seconds. ts is made by the linking device
// right then, because Node 2 has no clock it can trust (contract rule 1). No vitals: Node 2 doesn't send them.
function wakeGarden() {
  gardenTimer = setTimeout(wakeGarden, GARDEN_INTERVAL);
  if (!linking.connected) {
    // a real Node 1 keeps the packet on its shelf until the broker is reachable again; this simulator just skips it
    console.log(`${GARDEN_ID}: the Garden woke up, but ${LINKING_ID} isn't connected to the broker: the packet is lost`);
    return;
  }
  const packet = {
    ts: timeNow(),
    fw: "1.0.0", // the NODE 2 firmware version (carried by its packet), not the Node 1 version
    temperature: randomOneDecimal(26, 30),
    humidity: randomInt(60, 79),
    pressure: randomOneDecimal(1008, 1012), // hPa; a Node 2-only field: the backend recognizes Node 2 telemetry by this field
    soil_temperature: randomOneDecimal(25, 27),
    soil: randomInt(35, 44),
    // without a battery field: an optional field, the default Node 2 doesn't measure it (HAS_BATTERY_DIVIDER = false)
  };
  linking.publish(`msh/${GARDEN_ID}/telemetry`, JSON.stringify(packet));
  lastGardenPacket = Date.now();
  console.log(`${GARDEN_ID}: the Garden woke up at ${at(lastGardenPacket)}, its packet published by ${LINKING_ID}`);
  if (gardenStatus !== "online") publishGardenStatus("online"); // the first packet (or the first after offline): online
}

// The Node 1 bridge: no Garden packet for 960 seconds -> offline status. Checked every second.
function checkGarden() {
  if (gardenStatus === "online" && Date.now() - lastGardenPacket >= GARDEN_OFFLINE_AFTER) {
    publishGardenStatus("offline");
    console.log(`${GARDEN_ID}: no Garden packet for ${GARDEN_OFFLINE_AFTER / 1000} seconds: ${LINKING_ID} ` +
      `publishes the offline status at ${at(Date.now())}`);
  }
}

// typing "garden start", "garden pull", and "garden insert"
function gardenCommand(command) {
  if (linking === null) {
    console.log(`The mock Garden needs the fake device ${LINKING_ID} as its linking device: ` +
      `set KEY_${LINKING_ID.toUpperCase()} in tools/.env, then run the simulator again`);
  } else if (command === "start") {
    if (gardenStarted) {
      console.log("The mock Garden is already running. Type \"garden pull\" or \"garden insert\".");
      return;
    }
    gardenStarted = true;
    gardenBattery = true;
    setInterval(checkGarden, 1000);
    console.log(`Mock Garden ${GARDEN_ID} started via ${LINKING_ID}: one packet now, then every 300 seconds.`);
    wakeGarden();
  } else if (!gardenStarted) {
    console.log("The mock Garden isn't running yet: type \"garden start\" first.");
  } else if (command === "pull") {
    if (!gardenBattery) {
      console.log("The Garden's battery is already out. Type \"garden insert\" to put it back.");
      return;
    }
    gardenBattery = false;
    clearTimeout(gardenTimer);
    console.log(`Garden battery PULLED at ${at(Date.now())}.` + (lastGardenPacket === 0 ? "" : ` Its last packet was ` +
      `at ${at(lastGardenPacket)}; the offline status only comes around ` +
      `${at(lastGardenPacket + GARDEN_OFFLINE_AFTER)} (960 seconds after the last packet).`));
  } else if (command === "insert") {
    if (gardenBattery) {
      console.log("The Garden's battery is still in.");
      return;
    }
    gardenBattery = true;
    console.log(`Garden battery back in at ${at(Date.now())}: the Garden wakes up at once, then every 300 seconds.`);
    wakeGarden();
  }
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
      if (deviceId === LINKING_ID) { // Module 25: the mock Garden's status, through its linking device
        await client.publishAsync(`msh/${GARDEN_ID}/status`, "", { qos: 1, retain: true });
        console.log(`${GARDEN_ID}: the mock Garden's retained status was deleted too (only works if the Module 25 ACL block is in place).`);
      }
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
  // Module 19: "temp 33" / "temp random" are typed in this terminal. Module 24: also "soil 25" / "soil random" and "tank 15" /
  // "tank random". Module 25: "garden start" / "garden pull" / "garden insert". Only in this mode: in clean mode,
  // a terminal listener would keep the program from finishing by itself.
  createInterface({ input: process.stdin }).on("line", (line) => {
    const [word, arg] = line.trim().toLowerCase().split(/\s+/);
    const num = Number(arg);
    const percent = Number.isInteger(num) && num >= 0 && num <= 100; // Module 24: soil and tank, whole numbers 0-100
    if (word === "temp" && arg === "random") {
      typedTemp = null;
    } else if (word === "temp" && arg !== undefined && Number.isFinite(num)) {
      typedTemp = num;
    } else if (word === "soil" && (arg === "random" || percent)) { // Module 24
      typedSoil = arg === "random" ? null : num;
    } else if (word === "tank" && (arg === "random" || percent)) { // Module 24
      typedTank = arg === "random" ? null : num;
    } else if (word === "garden" && ["start", "pull", "insert"].includes(arg)) { // Module 25
      gardenCommand(arg);
      return;
    } else {
      console.log("Type for example: temp 33, temp random, soil 25, soil random, tank 15, tank random, garden start, " +
        "garden pull, or garden insert (soil and tank: whole numbers 0-100)");
      return;
    }
    if (word === "temp") console.log(typedTemp === null ? "Temperature: random 25.0-33.0 °C" : `Temperature: ${typedTemp.toFixed(1)} °C`);
    if (word === "soil") console.log(typedSoil === null ? "Soil: random 20-60 %" : `Soil: ${typedSoil} %`);
    if (word === "tank") {
      const low = typedTank !== null && typedTank < MIN_WATER_LEVEL;
      console.log((typedTank === null ? "Tank: random 30-90 %" : `Tank: ${typedTank} %`) +
        (low ? ` (below ${MIN_WATER_LEVEL} %: pump commands will be refused)` : ""));
    }
  });
  console.log(`${withKeys} fake device(s) heading to ${BROKER_URL}. Type for example "temp 33", "soil 25", "tank 15", ` +
    `"soil random", or "garden start". Stop with Ctrl+C.`);
}
