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
// Module 28 (contract 1.6): the fake devices imitate the DESIGN of the Node 1 1.7.0 firmware. The simulator does NOT flash anything:
//   - SIMULATED firmware updates: ack "accepted" at once, status offline-mode then a clean MQTT disconnect (without the will),
//     download the file through the locked route like HTTPUpdate of Arduino-ESP32 3.3.12 (GET ... HTTP/1.0, Basic Auth device_id:key,
//     x-ESP32-* headers), check 200 + Content-Length + the first byte 0xE9 + SHA-256, "restart" for 5 seconds with the new version;
//   - the 60-second trial period: the new version is VALID if it connects to the broker (key accepted), subscribes to cmd, and
//     publishes online. A FAKE file with the TEST_WRONG_KEY marker imitates firmware 1.7.2-test (the broker key broken in RAM): the
//     broker refuses it, 60 seconds pass, the device "goes back by itself" to the old version (a simulated rollback) and reports it;
//   - vitals carry reset_reason, fw, and the ota report (repeated in at most 3 vitals); config may carry intervals.vitals_s;
//   - registration with a claim code (the "claim" mode below), and the terminal command "restart" (stopping on purpose);
//   - "the server address" in NVS (the Server address field of the portal / Serial "server" / a claim): the device ONLY downloads
//     from <server address>/fw/node-1/<version>.bin. Any other url = ack ok:false "url is not this home's server", the key isn't sent.
// Every time number = a simulator number on the lab network, NOT an ESP32 number over Wi-Fi.
//
// How to use (from a terminal, in the tools folder):
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883            -> 10 fake devices
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 1          -> 1 fake device (the easiest to watch)
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 clean      -> delete the retained status of the fake devices
//   Module 28:
//   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 1 --fw=1.6.0
//        -> a fake device that has NEVER stored a version yet starts with the old firmware 1.6.0 (no reset_reason and fw in
//           vitals, refuses update). The default is --fw=1.7.0. A version already stored in data/simulator-store.json is still used.
//   node device-simulator.js mqtt://192.168.1.37:1883 claim 7K2M-QF9D http://192.168.1.10 f00d00000003
//        -> "a new board": exchanges the claim code at <server address>/api/provision/claim, stores its key (the NVS stand-in),
//           then connects at once. The device_id may be left out (f00d00000003 by default).
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
//   restart      -> Module 28: every fake device stops on purpose (offline-mode, a clean disconnect) then restarts
//   server http://192.168.1.10 -> Module 28: the home server address of every fake device (= the Serial command "server" of Node 1
//                 1.7.0), stored in NVS. The default is SERVER_URL in tools/.env; a device made by a claim uses its claim address
//   ota          -> Module 28: the version, the trial period, and the update report of every fake device
// Stop with Ctrl+C: the broker then publishes the "offline" last will of every fake device. The mock Garden goes silent too, but
// its status stays "online" (Node 2 has no last will; exactly like a real Node 2 when Node 1 is off).

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { connect as connectTcp } from "node:net";
import { createInterface } from "node:readline";
import { connect as connectTls } from "node:tls";
import mqtt from "mqtt";
import { buildTelemetry } from "./generate-dummy.js";

// Module 28: the --fw=x.y.z option may be written anywhere; the rest keeps the old order (broker address, count/clean/claim)
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const INITIAL_FW = (process.argv.find((a) => a.startsWith("--fw=")) ?? "--fw=1.7.0").slice(5);
const BROKER_URL = args[0] || "mqtt://127.0.0.1:1883";
const COUNT = Number(args[1]) || 10;
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
// Module 28: simulated firmware updates (the design of Node 1 1.7.0, D2/D3/D4/D7/D9-D12 of Module 28)
const PROGRAM_SHELF = 1966080; // one Minimal SPIFFS program shelf (Module 10): ESP.getFreeSketchSpace() = the size of the other shelf
const BOOT_TIME_MS = 5000; // how long a simulated "restart" takes after installing firmware or a rollback
const TRIAL_PERIOD_MS = 60 * 1000; // new firmware must prove itself within 60 seconds (OTA_TRIAL_PERIOD in the firmware)
// Silence limits while downloading, like HTTPUpdate 3.3.12 (read from its source; an M28 firmware verification finding F1):
const HEADER_SILENCE_LIMIT_MS = 8000; // waiting for the HEAD of the answer: HTTPClient 8 seconds without data = -11, without a restart
const HTTPS_BODY_SILENCE_LIMIT_MS = 30000; // the body stops in the MIDDLE of the file over https: Update gives up 300 x 0.1 s = Update 6
const DOWNLOAD_WATCHDOG_LIMIT_MS = 60000; // ... over http: the library waits much longer, the 60-second watchdog restarts (WDT)
const REPORT_REPEATS = 3; // the ota report rides along with at most 3 vitals (vitals QoS 0 can get lost)
const DEFAULT_VITALS_INTERVAL = 300; // seconds (VITALS_INTERVAL in config.h)

// a fake device_id: 12 lowercase hexadecimal digits, starting with f00d so it's easy to recognize
function makeDeviceId(number) {
  return "f00d" + String(number).padStart(8, "0");
}

// Module 19: the "NVS" of all fake devices, for example { "f00d00000001": { "temp_fan_on": 31, "soil_watering": 35 } }.
// Module 28: also fw (the installed version), vitals_interval, the key from a claim, the update plan (ota), and its report.
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

// Module 21: the broker key of one fake device from tools/.env, for example KEY_F00D00000001. Module 28: or the key from a
// claim stored in "NVS" (data/simulator-store.json). undefined = none yet.
function deviceKey(deviceId) {
  return process.env[`KEY_${deviceId.toUpperCase()}`] || store[deviceId]?.key || undefined;
}
const REJECTED_CODES = [4, 5, 134, 135]; // Module 21: the broker's "wrong key / not allowed" answer (MQTT 3.1.1 and 5)

// Module 28: the home server address of one fake device, without a / at the end, in lowercase: from "NVS" (a claim or the terminal
// command "server"), or its default SERVER_URL in tools/.env (the stand-in for the default value of config.h). "" = not set yet.
// The device only downloads firmware from THIS address (contract 1.6 section 7): an update command with a url to another server
// is refused before anything is sent, because the download carries the device key (Basic device_id:key).
// The default from tools/.env is tidied and checked like DEFAULT_SERVER_ADDRESS of the firmware (settings.cpp): a form that
// Node 1 can't store isn't used (= not set yet; the reason is printed once when the simulator starts).
function deviceServerAddress(deviceId) {
  const stored = store[deviceId]?.server_address;
  if (stored) return tidyAddress(stored); // already checked when it was saved (portal/Serial/claim)
  const defaultAddress = tidyAddress(process.env.SERVER_URL);
  return serverAddressError(defaultAddress) === "" ? defaultAddress : "";
}

// UTC time without milliseconds, like ts in the data contract: 2026-10-19T04:14:28Z
function timeNow() {
  return new Date().toISOString().slice(0, 19) + "Z";
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

// Module 28: intervals in config (contract 1.6): only vitals_s, a whole number 60-3600. "" = valid.
function checkIntervals(intervals) {
  if (typeof intervals !== "object" || intervals === null || Array.isArray(intervals)) return "intervals must contain vitals_s";
  for (const name of Object.keys(intervals)) if (name !== "vitals_s") return `unknown interval: ${name}`;
  if (!Number.isInteger(intervals.vitals_s) || intervals.vitals_s < 60 || intervals.vitals_s > 3600) return "vitals_s must be a whole number 60-3600";
  return "";
}

// Module 28: is version a older than b? (for "old firmware" below 1.7.0; without the semver package)
function isOlder(a, b) {
  const [x, y] = [a.split(".").map(Number), b.split(".").map(Number)];
  return (x[0] - y[0] || x[1] - y[1] || x[2] - y[2]) < 0;
}

// Module 28: http:// may only go to a home network IP address (10.x, 172.16-31.x, 192.168.x), so that the device key is never
// sent in plain text to the internet (the firmware 1.7.0 design). The SIMULATOR ONLY also accepts 127.x: it runs on the same
// machine as the lab server; a real ESP32 never uses 127.x. An IPv4 address is read exactly like the firmware
// (ota-check.cpp, isHomeIpAddress) and the backend (config/env.ts, isHomeIp): exactly four numbers 0-255 separated by dots.
function isHomeAddress(host) {
  const numbers = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)?.slice(1).map(Number);
  if (numbers === undefined || numbers.some((n) => n > 255)) return false;
  const [a, b] = numbers;
  return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

// Module 28: the request headers of HTTPUpdate (HTTPUpdate.cpp + HTTPClient.cpp 3.3.12), in exactly this order: HTTP/1.0, Host,
// User-Agent, Connection: close (useHTTP10 turns keep-alive off), Authorization, then the extra headers of HTTPUpdate.
// The sketch MD5/SHA-256/size values here are FAKE (a real device computes them from the running shelf).
function httpUpdateHeaders(address, deviceId, key, fw) {
  const mac = deviceId.match(/../g).join(":").toUpperCase(); // a4cf12e5b7c0 -> A4:CF:12:E5:B7:C0
  const macAp = mac.slice(0, 15) + ((parseInt(deviceId.slice(10), 16) + 1) % 256).toString(16).padStart(2, "0").toUpperCase();
  const mock = createHash("sha256").update(`${deviceId}-${fw}`).digest("hex");
  const defaultPort = address.protocol === "https:" ? "443" : "80";
  return [
    `GET ${address.pathname} HTTP/1.0`,
    `Host: ${address.hostname}${address.port && address.port !== defaultPort ? `:${address.port}` : ""}`,
    "User-Agent: ESP32-http-Update",
    "Connection: close",
    `Authorization: Basic ${Buffer.from(`${deviceId}:${key}`).toString("base64")}`,
    "Cache-Control: no-cache",
    `x-ESP32-BASE-MAC: ${mac}`,
    `x-ESP32-STA-MAC: ${mac}`,
    `x-ESP32-AP-MAC: ${macAp}`,
    `x-ESP32-free-space: ${PROGRAM_SHELF}`,
    "x-ESP32-sketch-size: 1196032",
    `x-ESP32-sketch-md5: ${mock.slice(0, 32)}`,
    `x-ESP32-sketch-sha256: ${mock.toUpperCase()}`,
    "x-ESP32-chip-size: 4194304",
    "x-ESP32-sdk-version: v5.5.5",
    "x-ESP32-mode: sketch",
    `x-ESP32-version: ${fw}`,
  ].join("\r\n") + "\r\n\r\n";
}

// Module 28: download one file with RAW HTTP/1.0 (its own TCP/TLS socket, not fetch: fetch is always HTTP/1.1 and accepts a
// chunked answer, while HTTPUpdate doesn't). The result is { code, headers, body } or an error.
// HTTPS uses Node's built-in list of CA roots (lab: NODE_EXTRA_CA_CERTS = the stand-in CA root) and checks the certificate name.
// Like HTTPUpdate: an answer other than 200 + Content-Length finishes right after its headers; a 200 body is read until complete.
// An error with otaMessage = the ota.message text of the firmware; an error with wdt = the watchdog restarts the device (an http:// body stops halfway).
function downloadHttp10(url, deviceId, key, fw) {
  const address = new URL(url);
  return new Promise((done, fail) => {
    const port = Number(address.port) || (address.protocol === "https:" ? 443 : 80);
    const socket = address.protocol === "https:"
      ? connectTls({ host: address.hostname, port, servername: address.hostname })
      : connectTcp({ host: address.hostname, port });
    let all = Buffer.alloc(0);
    let result = null; // { code, headers, bodyStart } as soon as the headers of the answer are complete
    let silenceTimer = null;
    const silenceError = () => Object.assign(new Error("HTTPC_ERROR_READ_TIMEOUT (-11)"),
      { otaMessage: "server silent 8 seconds before answering (-11 HTTPC_ERROR_READ_TIMEOUT)" });
    const updateError6 = () => Object.assign(new Error("Update error: Stream Read Timeout"),
      { otaMessage: "download stopped halfway: 30 seconds without data (Update 6 UPDATE_ERROR_STREAM)" });
    // The silence count starts again with every piece of data. A connection CLOSED by the server in the middle of the body is
    // treated like silence: HTTPUpdate can't tell them apart, it only sees the data stop.
    const silence = (ms, makeError) => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        socket.removeAllListeners("close");
        socket.destroy();
        fail(makeError());
      }, ms);
    };
    const bodySilence = () => (address.protocol === "https:"
      ? silence(HTTPS_BODY_SILENCE_LIMIT_MS, updateError6)
      : silence(DOWNLOAD_WATCHDOG_LIMIT_MS, () => Object.assign(new Error("the 60-second watchdog while downloading"), { wdt: true })));
    const readHeaders = () => {
      const end = all.indexOf("\r\n\r\n");
      if (end < 0) return null;
      const [line, ...rest] = all.subarray(0, end).toString("latin1").split("\r\n");
      const headers = Object.fromEntries(rest.map((b) => [b.slice(0, b.indexOf(":")).trim().toLowerCase(), b.slice(b.indexOf(":") + 1).trim()]));
      return { code: Number(line.split(" ")[1]), headers, bodyStart: end + 4 };
    };
    const finishNow = () => {
      clearTimeout(silenceTimer);
      socket.removeAllListeners("close");
      socket.destroy();
      done({ code: result.code, headers: result.headers, body: all.subarray(result.bodyStart) });
    };
    const close = () => { // the connection was closed by the server
      if (result === null) {
        clearTimeout(silenceTimer);
        return fail(new Error("incomplete server answer"));
      }
      // a 200 body that isn't complete yet: wait until the body silence limit runs out (silenceTimer is still running)
    };
    socket.once(address.protocol === "https:" ? "secureConnect" : "connect", () => {
      socket.write(httpUpdateHeaders(address, deviceId, key, fw));
      silence(HEADER_SILENCE_LIMIT_MS, silenceError);
    });
    socket.on("data", (d) => {
      all = Buffer.concat([all, d]);
      if (result === null) {
        result = readHeaders();
        if (result === null) return silence(HEADER_SILENCE_LIMIT_MS, silenceError); // the headers aren't complete yet
      }
      const length = Number(result.headers["content-length"]);
      // HTTPUpdate only reads the body if the answer is 200 with a Content-Length that fits on the shelf; otherwise it ends here
      if (result.code !== 200 || !(length > 0) || length > PROGRAM_SHELF) return finishNow();
      // like HTTPClient: with a Content-Length, stop reading as soon as the body is complete (don't wait for the connection to close)
      if (all.length - result.bodyStart >= length) return finishNow();
      bodySilence();
    });
    // connecting (TCP, and TLS for https) that doesn't finish within 8 seconds = not connected (-1)
    silence(HEADER_SILENCE_LIMIT_MS, () => Object.assign(new Error("not connected"), { otaMessage: "can't connect to server (-1)" }));
    socket.on("error", (g) => {
      // a socket error in the middle of the body (for example the connection reset): the library sees it as a failed read,
      // 300 x 0.1 seconds = Update 6, over both http and https
      if (result !== null) return silence(HTTPS_BODY_SILENCE_LIMIT_MS, updateError6);
      clearTimeout(silenceTimer);
      fail(g);
    });
    socket.on("close", close);
  });
}

// Module 28: the HTTPUpdate error code (HTTPUpdate.h 3.3.12) for an HTTP code that isn't 200
function httpError(code) {
  if (code === 304 || code === 204) return "server: no update (304, HTTP_UPDATE_NO_UPDATES)";
  if (code === 403) return "download refused by the server: 403 (-103 HTTP_UE_SERVER_FORBIDDEN)";
  if (code === 404) return "file not on the server: 404 (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)";
  return `server answer ${code} (-104 HTTP_UE_SERVER_WRONG_HTTP_CODE)`;
}

const runningDevices = new Map(); // Module 28: device_id -> { restart, otaState } for the terminal commands

function runDevice(deviceId) {
  const topic = (kind) => `msh/${deviceId}/${kind}`;
  const nvs = () => (store[deviceId] ??= {});
  // Module 19
  const thresholds = { temp_fan_on: 30, soil_watering: 30, ...store[deviceId] }; // the default numbers = Node 1's config.h
  delete thresholds.fw; delete thresholds.key; delete thresholds.ota; delete thresholds.ota_report; delete thresholds.vitals_interval; // not thresholds
  delete thresholds.server_address;
  // Module 28: the things that are lost every time the device restarts (RAM), reset in boot()
  let client = null;
  let start = Date.now();
  let resetReasonName = "POWERON";
  let fw = store[deviceId]?.fw ?? INITIAL_FW;
  let trial = null; // { id, from, to, broken, timer } while the new firmware isn't valid yet ("PENDING_VERIFY")
  let updateRunning = false;
  let state = { fan: false, lamp: false, pump: false, curtain: 90 };
  let lastIds = []; // ids of the commands already carried out (contract rule 8); lost on a restart
  let temperature = 28.5; // the last temperature reading, used by telemetry and by the safety
  let fanOwnedBySafety = false; // true if the safety turned the fan on (the automatic lamp pattern of Module 6)
  let lastConnected = Date.now();
  let offline = false;
  let offlineStart = 0;
  let localFan = 0; // how many times the safety turned the fan on during this offline mode
  let report = null; // { offline_s, local_fan } waiting to go along with vitals
  let timer = null; // Module 19: the next scheduled telemetry
  let vitalsTimer = null;
  let heartbeatTimer = null;
  let lastPublished = 0; // Module 19: when the last telemetry was published
  const fw17 = () => !isOlder(fw, "1.7.0"); // firmware 1.7.0 and newer: contract 1.6

  // vitals: once after connecting, then every 5 minutes (contract section 2). Module 28: its interval comes from config (NVS)
  function sendVitals() {
    const vitals = {
      ts: timeNow(),
      rssi: -40 - Math.floor(Math.random() * 40), // -40 to -79 dBm
      uptime_s: Math.floor((Date.now() - start) / 1000),
      heap_free: 180000 + Math.floor(Math.random() * 20000),
      ...report, // Module 19 (contract 1.3): offline_s and local_fan, only in the first vitals after offline mode
    };
    if (fw17()) { // Module 28 (contract 1.6): the restart reason, the version, and the update report not yet sent 3 times
      vitals.reset_reason = resetReasonName;
      vitals.fw = fw;
      const otaReport = store[deviceId]?.ota_report;
      if (otaReport) {
        vitals.ota = otaReport.content;
        otaReport.sentCount++;
        if (otaReport.sentCount >= REPORT_REPEATS) delete store[deviceId].ota_report;
        saveStore();
        console.log(`${deviceId}: update report rides along with vitals (${otaReport.sentCount}/${REPORT_REPEATS}): ${JSON.stringify(otaReport.content)}`);
      }
    }
    client.publish(topic("vitals"), JSON.stringify(vitals));
    if (report) {
      console.log(`${deviceId}: offline-mode report sent with vitals (offline_s=${report.offline_s}, ` +
        `local_fan=${report.local_fan})`);
    }
    report = null;
  }

  function scheduleVitals() {
    clearInterval(vitalsTimer);
    const seconds = fw17() ? (store[deviceId]?.vitals_interval ?? DEFAULT_VITALS_INTERVAL) : DEFAULT_VITALS_INTERVAL;
    vitalsTimer = setInterval(() => { if (client?.connected) sendVitals(); }, seconds * 1000);
  }

  // telemetry every 10 seconds (contract rule 3). Module 19: the next 10-second send is counted from the last send,
  // and state (the actuator state) is sent along (contract 1.3)
  function sendTelemetry() {
    if (client?.connected) {
      const reading = buildTelemetry();
      reading.fw = fw; // Module 28: the running version (generate-dummy writes 0.1.0)
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

  // Module 28: "boot" = the firmware's setup(): empty RAM, relays off, read NVS, then connect to the broker with a NEW MQTT client
  // (the old connection is already closed). Newly installed firmware starts the 60-second trial period.
  function boot(reason) {
    start = Date.now();
    resetReasonName = reason;
    state = { fan: false, lamp: false, pump: false, curtain: 90 };
    lastIds = [];
    updateRunning = false;
    fanOwnedBySafety = false;
    offline = false;
    lastConnected = Date.now();
    fw = store[deviceId]?.fw ?? INITIAL_FW;
    const plan = store[deviceId]?.ota;
    if (plan?.stage === "installed" && fw === plan.to) { // the bootloader runs the new shelf: PENDING_VERIFY
      trial = { ...plan, timer: setTimeout(trialFailed, TRIAL_PERIOD_MS) };
      console.log(`${deviceId}: started with ${fw} (the new shelf), the ${TRIAL_PERIOD_MS / 1000}-second trial period begins`);
    }
    startRunning();
  }

  // Module 28: a new MQTT client + every timer. Called by boot(), and after a FAILED update without a restart
  // (RAM, uptime, and reset_reason stay: the device only reconnects).
  function startRunning() {
    let key = deviceKey(deviceId);
    if (trial?.broken) { // firmware 1.7.2-test (TEST_WRONG_KEY 1): the key is broken in RAM only, NVS isn't touched
      key = "broken-key-TEST_WRONG_KEY";
      console.log(`${deviceId}: firmware ${fw} = TEST release (TEST_WRONG_KEY): the broker key is wrong on purpose`);
    }
    client = mqtt.connect(BROKER_URL, {
      clientId: deviceId,
      username: deviceId, // Module 21: the broker username = device_id
      password: key, // Module 21: from tools/.env; Module 28: or from a claim
      clean: true,
      keepalive: 15,
      reconnectPeriod: 5000, // reconnect at most every 5 seconds (contract section 3)
      reconnectOnConnackError: true, // Module 21: without this, the library stops trying as soon as the broker rejects its key
      will: { topic: topic("status"), payload: "offline", qos: 1, retain: true },
    });
    attachListeners(client);
    if (deviceId === LINKING_ID) attachGardenLinking(client); // Module 25: the mock Garden rides on this device
    scheduleVitals();
    heartbeatTimer = setInterval(heartbeat, 2000);
    scheduleNext(Math.random() * 10000); // the first send at a random second so that the fake devices don't all send at once
  }

  // Module 28: "ESP.restart()": the timers stop, the connection is closed. cleanly = stopping on purpose: offline-mode + a clean
  // DISCONNECT (the will isn't published). Not cleanly = the connection is simply cut (the broker publishes the will if still connected).
  function powerDown(cleanly, next) {
    clearTimeout(timer);
    clearInterval(vitalsTimer);
    clearInterval(heartbeatTimer);
    clearTimeout(trial?.timer);
    trial = null;
    const old = client;
    old.options.reconnectPeriod = 0; // the old connection must not reconnect by itself
    if (cleanly && old.connected) {
      old.publish(topic("status"), "offline-mode", { qos: 1, retain: true }, () => old.end(false, {}, next));
    } else {
      old.end(true, {}, next);
    }
  }

  function reboot(reason, cleanly) {
    powerDown(cleanly, () => setTimeout(() => boot(reason), BOOT_TIME_MS));
  }

  // Module 28: the new firmware is VALID (esp_ota_mark_app_valid_cancel_rollback): called right after CONNACK arrives and the
  // cmd subscription and the online publish are WRITTEN (the firmware's rule: a true return value, not waiting for PUBACK)
  function markValid() {
    clearTimeout(trial.timer);
    console.log(`${deviceId}: ${fw} VALID (connected and published ${Math.round((Date.now() - start) / 1000)} seconds after starting)`);
    nvs().ota_report = { content: { id: trial.id, result: "succeeded", version: trial.to }, sentCount: 0 };
    delete nvs().ota;
    saveStore();
    trial = null;
  }

  // Module 28: 60 seconds passed without being valid = rollback (esp_ota_mark_app_invalid_rollback_and_reboot): the report is
  // saved FIRST in NVS, then a restart into the old shelf (reset_reason SW)
  function trialFailed() {
    const r = trial;
    console.log(`${deviceId}: ${fw} NOT valid within ${TRIAL_PERIOD_MS / 1000} seconds: back to ${r.from} (simulated rollback)`);
    nvs().fw = r.from;
    nvs().ota_report = { content: { id: r.id, result: "rollback", version: r.to, message: "not connected to the broker within 60 seconds" },
      sentCount: 0 };
    delete nvs().ota;
    saveStore();
    reboot("SW", false);
  }

  function attachListeners(k) {
    // Module 21: broker rejects the key? Write it clearly, then retry only 60 seconds later (like Node 1 v1.6.0).
    k.on("error", (error) => {
      if (REJECTED_CODES.includes(error.code)) {
        k.options.reconnectPeriod = 60000;
        console.log(`${deviceId}: REJECTED by broker (code ${error.code}): wrong key, not registered, or revoked. ` +
          "Retrying in 60 seconds.");
      } else {
        console.log(`${deviceId}: MQTT error: ${error.message}`);
      }
    });

    k.on("connect", () => {
      k.options.reconnectPeriod = 5000; // Module 21: key accepted again: back to the normal interval
      if (offline) { // Module 19: connected again after offline mode
        offline = false;
        report = { offline_s: Math.round((Date.now() - offlineStart) / 1000), local_fan: localFan };
        console.log(`${deviceId}: OFFLINE MODE ENDED after ${report.offline_s} seconds; ` +
          `local safety turned the fan on ${localFan} time(s)`);
      }
      lastConnected = Date.now();
      k.publish(topic("status"), "online", { qos: 1, retain: true }); // contract section 3: online first, then subscribe to cmd
      k.subscribe(topic("cmd"), { qos: 1 });
      if (trial) markValid(); // Module 28: CONNACK received (the key is right) + subscribe + publish = valid
      // Module 19: the offline-mode report is delayed 10 seconds. A backend that reconnects too (for example because the
      // broker was just started again) needs a few seconds to subscribe; without this delay the report can be missed.
      if (report) setTimeout(() => { if (k.connected) sendVitals(); }, 10000);
      else sendVitals();
      console.log(`${deviceId}: online (firmware ${fw})`);
    });
    k.on("offline", () => { // Module 19; Module 21: not written if the cause is a rejected key (that message already exists)
      if (k.options.reconnectPeriod === 5000) console.log(`${deviceId}: broker unreachable, retrying every 5 seconds`);
    });
    k.on("message", (_topic, content) => receiveCommand(content));
  }

  function receiveCommand(content) {
    if (content.length === 0) return; // Module 19: an empty message = the retained config was deleted, not a command
    let cmd;
    try {
      cmd = JSON.parse(content.toString());
    } catch {
      return; // not JSON: can't be answered (contract rule 4)
    }
    if (typeof cmd.id !== "string" || cmd.id === "" || cmd.id.length > 39) return; // contract rule 4: can't be answered
    if (lastIds.includes(cmd.id)) return; // the same id is carried out only once (a retained config that comes again)
    lastIds.push(cmd.id);
    if (lastIds.length > 8) lastIds.shift();

    const before = JSON.stringify(state); // Module 19: to know whether an actuator changed
    let message = "";
    let startUpdate = false;
    if (cmd.action === "config") { // Module 19: everything is checked first, then saved. Module 28: thresholds and/or intervals
      const hasThresholds = cmd.thresholds !== undefined;
      const hasIntervals = fw17() && cmd.intervals !== undefined; // old firmware ignores intervals
      if (!hasThresholds && !hasIntervals) message = fw17() ? "config must contain thresholds or intervals" : checkThresholds(cmd.thresholds);
      else message = (hasThresholds ? checkThresholds(cmd.thresholds) : "") || (hasIntervals ? checkIntervals(cmd.intervals) : "");
      if (message === "") {
        const updated = { ...thresholds, ...(hasThresholds ? cmd.thresholds : {}) };
        if (JSON.stringify(updated) !== JSON.stringify(thresholds)) { // like NVS: write only if it changed
          Object.assign(thresholds, updated);
          Object.assign(nvs(), thresholds);
          saveStore();
          console.log(`${deviceId}: thresholds saved ${JSON.stringify(thresholds)}`);
        } else if (hasThresholds) {
          console.log(`${deviceId}: thresholds same as the stored ones ${JSON.stringify(thresholds)}`);
        }
        if (hasIntervals && nvs().vitals_interval !== cmd.intervals.vitals_s) { // Module 28
          nvs().vitals_interval = cmd.intervals.vitals_s;
          saveStore();
          scheduleVitals();
          console.log(`${deviceId}: vitals interval saved: ${cmd.intervals.vitals_s} seconds`);
        }
      }
    } else if (cmd.action === "update") { // Module 28
      message = checkUpdate(cmd);
      startUpdate = message === "";
      if (startUpdate) updateRunning = true; // from ACCEPTED on: even a second update before the download starts is refused (rule 12)
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
    console.log(`${deviceId}: command ${cmd.id} (${cmd.action}) -> ok=${ack.ok}${message === "" ? "" : ` (${message})`}`);
    if (JSON.stringify(state) !== before) sendSoon(); // Module 19
    if (startUpdate) setTimeout(() => void installFirmware(cmd), 50); // after the ack has been sent (ack = ACCEPTED)
  }

  // ---------- Module 28: simulated firmware updates ----------
  // Checking the content of an update cmd (contract 1.6 section 7). "" = accepted; otherwise the reason of the refusal for ack ok:false.
  function checkUpdate(cmd) {
    if (!fw17()) return "action update not supported yet (Module 28)"; // exactly like firmware 1.6.0
    if (trial) return "still in the 60-second trial period";
    if (updateRunning) return "another update is running";
    if (typeof cmd.version !== "string" || !/^\d+\.\d+\.\d+$/.test(cmd.version)) return "version must look like x.y.z";
    if (cmd.version === fw) return `already running ${fw}`;
    // firmware below 1.7.0 has no trial period/rollback and can't take an update anymore: by cable only
    if (isOlder(cmd.version, "1.7.0")) return "versions below 1.7.0 have no rollback: install by cable";
    if (typeof cmd.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(cmd.sha256)) return "sha256 must be 64 lowercase hexadecimal digits";
    if (!Number.isInteger(cmd.size) || cmd.size < 1 || cmd.size > PROGRAM_SHELF) return `size must be 1-${PROGRAM_SHELF} bytes`;
    let address;
    try {
      address = new URL(cmd.url);
    } catch {
      return "invalid url";
    }
    if (cmd.url.length > 200 || !/^https?:$/.test(address.protocol) || address.pathname !== `/fw/node-1/${cmd.version}.bin`) {
      return "url must be http(s)://<address>/fw/node-1/<version>.bin";
    }
    // the url MUST = <home server address>/fw/node-1/<version>.bin (case doesn't matter). Without this rule, any account
    // that may write msh/+/cmd (for example nodered) could make the device send its key to another server
    // and install any file (an M28 verification finding). The server address can only be changed through the portal/Serial, not MQTT.
    const server = deviceServerAddress(deviceId);
    if (server === "") return "server address not set (Serial: server <address>)";
    if (cmd.url.toLowerCase() !== `${server}/fw/node-1/${cmd.version}.bin`) return "url is not this home's server";
    if (address.protocol === "http:" && !isHomeAddress(address.hostname)) return "http only for the home network";
    return "";
  }

  // The order of the firmware 1.7.0 design (D7): the ack is already sent -> plan into NVS -> pump off -> offline-mode + a clean
  // DISCONNECT -> download + check -> success: restart (SW) with the new version; failure: connect again, report failed.
  async function installFirmware(cmd) {
    updateRunning = true;
    nvs().ota = { id: cmd.id, from: fw, to: cmd.version, stage: "downloading" };
    saveStore();
    if (state.pump) console.log(`${deviceId}: pump turned off before updating the firmware`);
    state.pump = false;
    // Stopping on purpose: the key and the address are taken first, because powerDown() closes the MQTT client
    const key = deviceKey(deviceId);
    console.log(`${deviceId}: update ${fw} -> ${cmd.version} ACCEPTED: offline-mode, clean disconnect, downloading ${cmd.url}`);
    await new Promise((done) => powerDown(true, done));
    const startDownload = Date.now();
    let reason = "";
    let body = null;
    try {
      const answer = await downloadHttp10(cmd.url, deviceId, key, fw);
      const length = Number(answer.headers["content-length"]);
      if (answer.code !== 200) reason = httpError(answer.code);
      else if (!(length > 0)) reason = "the server gave no Content-Length (-101 HTTP_UE_SERVER_NOT_REPORT_SIZE)";
      else if (length > PROGRAM_SHELF) reason = "file bigger than the program shelf (-100 HTTP_UE_TOO_LESS_SPACE)";
      else if (answer.body[0] !== 0xe9) reason = "first byte not 0xE9 or not arrived yet (-106 HTTP_UE_BIN_VERIFY_HEADER_FAILED)";
      else if (createHash("sha256").update(answer.body).digest("hex") !== cmd.sha256) {
        // setSHA256sum(the command's sha256): Update.end() refuses the file (Updater.cpp 3.3.12), not -109
        reason = "SHA-256 doesn't match the command (Update 15 UPDATE_ERROR_SHA256)";
      } else body = answer.body;
    } catch (error) {
      if (error.wdt) { // an http:// body stopped in the middle of the file: the 60-second watchdog restarts the device, the old shelf is whole
        console.log(`${deviceId}: the download of ${cmd.version} stopped in the middle of the file for ${DOWNLOAD_WATCHDOG_LIMIT_MS / 1000} seconds: ` +
          "the WATCHDOG restarts the device (the old firmware stays)");
        nvs().ota_report = { content: { id: cmd.id, result: "failed", version: cmd.version, message: "restarted while downloading (WDT)" },
          sentCount: 0 };
        delete nvs().ota;
        saveStore();
        setTimeout(() => boot("WDT"), BOOT_TIME_MS);
        return;
      }
      reason = error.otaMessage ?? `download failed: ${error.message}`;
    }
    if (body === null) { // failed BEFORE the restart: the old shelf is whole, the old version keeps running
      console.log(`${deviceId}: update ${cmd.version} FAILED (${Date.now() - startDownload} ms): ${reason}`);
      nvs().ota_report = { content: { id: cmd.id, result: "failed", version: cmd.version, message: reason.slice(0, 80) }, sentCount: 0 };
      delete nvs().ota;
      saveStore();
      updateRunning = false;
      setTimeout(startRunning, 200); // connect again WITHOUT a restart (uptime and reset_reason stay)
      return;
    }
    // a FAKE file: the TEST_WRONG_KEY marker at the start of the file = firmware 1.7.2-test (the switch TEST_WRONG_KEY 1)
    const broken = body.subarray(0, 512).toString("latin1").includes("TEST_WRONG_KEY");
    console.log(`${deviceId}: ${cmd.version} downloaded ${body.length} bytes in ${Date.now() - startDownload} ms, SHA-256 matches; ` +
      `restarting${broken ? " (TEST file: the broker key will be wrong)" : ""}`);
    nvs().ota = { id: cmd.id, from: fw, to: cmd.version, stage: "installed", broken };
    nvs().fw = cmd.version; // otadata points at the new shelf
    saveStore();
    setTimeout(() => boot("SW"), BOOT_TIME_MS); // ESP.restart() after HTTPUpdate OK
  }

  // Module 28: the terminal command "restart" = the Serial restart command of firmware 1.7.0: stop on purpose, then restart (SW)
  function restartOnPurpose() {
    if (trial) console.log(`${deviceId}: a restart in the middle of the trial period = the new firmware is CANCELLED (back to the old shelf)`);
    if (trial) {
      nvs().fw = trial.from;
      nvs().ota_report = { content: { id: trial.id, result: "rollback", version: trial.to, message: "restarted during the trial period" },
        sentCount: 0 };
      delete nvs().ota;
      saveStore();
    }
    console.log(`${deviceId}: stopped on purpose (offline-mode), restarting in ${BOOT_TIME_MS / 1000} seconds`);
    reboot("SW", true);
  }

  const otaState = () => `${deviceId}: firmware ${fw}, server address ${deviceServerAddress(deviceId) || "(not set)"}` +
    `${trial ? `, TRIAL PERIOD ${trial.to} (from ${trial.from})` : ""}` +
    `${updateRunning ? ", updating" : ""}, reset_reason ${resetReasonName}` +
    `${store[deviceId]?.ota_report ? `, report waiting: ${JSON.stringify(store[deviceId].ota_report.content)}` : ""}`;
  runningDevices.set(deviceId, { restart: restartOnPurpose, otaState });

  // Module 19: every 2 seconds, like Node 1's ACTING step: take a temperature reading, check offline mode, run the safety.
  function heartbeat() {
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
  }

  // Module 28: the first start (the simulator was just run = the power just came on). An update plan left behind in "NVS": stage
  // "downloading" = a power cut while downloading (the old shelf is whole: the first 16 bytes of the new shelf weren't written yet),
  // report failed; stage "installed" = a power cut during the trial period: the bootloader marks the new shelf ABORTED, old shelf.
  const leftover = store[deviceId]?.ota;
  if (leftover?.stage === "downloading" || leftover?.stage === "installed") {
    const installed = leftover.stage === "installed";
    if (installed) nvs().fw = leftover.from;
    nvs().ota_report = { content: { id: leftover.id, result: installed ? "rollback" : "failed", version: leftover.to,
      message: installed ? "power lost during the trial period" : "power lost while downloading" }, sentCount: 0 };
    delete nvs().ota;
    saveStore();
  }
  boot("POWERON");
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

// Called by runDevice() for f00d00000001 every time it starts (Module 28: a new MQTT client at every start). Like a real
// Node 1, every time it connects (again) to the broker, the linking device publishes again the last Garden status it knows.
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

// Module 28: a typed address is tidied like firmware 1.7.0 (ota-check.cpp, tidyAddress): spaces at the edges are dropped, uppercase
// A-Z becomes lowercase, a slash at the end is dropped. Only A-Z, like the firmware: toLowerCase() also changes a few non-Latin
// characters (for example the Kelvin sign) into ordinary Latin letters, while a real board refuses those characters.
function tidyAddress(text) {
  return (text ?? "").replace(/^[ \t]+/, "").replace(/[ \t/]+$/, "").replace(/[A-Z]/g, (h) => h.toLowerCase());
}

// Module 28: the form of a server address that may be stored (portal, Serial "server", claim), after tidying. Exactly the same as
// firmware 1.7.0 (ota-check.cpp, checkServerAddress) and SERVER_URL of the backend (config/env.ts, serverAddressError):
// at most 64 characters; http:// or https://; the server name only lowercase letters, digits, dots, and - (no underscore
// _); port 1-65535 if written; no path; http:// only to a home IP address (the simulator also 127.x, see
// isHomeAddress). "" = valid, otherwise the reason, with the same sentence as the firmware.
function serverAddressError(serverAddress) {
  const example = "Write the server address without a / at the end, for example http://192.168.1.10 or https://iot.yourname.my.id";
  const text = serverAddress ?? "";
  if (text.length > 64) return "Server address at most 64 characters";
  const parts = /^(https?):\/\/([a-z0-9.-]+)(?::(\d{1,5}))?$/.exec(text);
  if (parts === null || (parts[3] !== undefined && (Number(parts[3]) < 1 || Number(parts[3]) > 65535))) return example;
  if (parts[1] === "http" && !isHomeAddress(parts[2])) {
    return "http only for the home network (IP address 10.x, 172.16-31.x, 192.168.x): use https:// on the internet";
  }
  return "";
}

// Module 28: "a new board" registers with a claim code, exactly like the firmware 1.7.0 design after the Save button of the portal:
// POST <server address>/api/provision/claim {code, device_id} -> 201 {device_id, key, mqtt_username}; its key is stored in
// "NVS" (data/simulator-store.json, not in Git), then the device connects at once. The result is the device_id, or null.
async function claim(code, typed, deviceId) {
  const serverAddress = tidyAddress(typed); // like the "Server address" field of the portal: tidied first, then checked
  const wrong = serverAddressError(serverAddress);
  if (wrong !== "") {
    console.log(wrong);
    return null;
  }
  const startClaim = Date.now();
  let answer;
  try {
    answer = await fetch(`${serverAddress}/api/provision/claim`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, device_id: deviceId }), signal: AbortSignal.timeout(15000) });
  } catch (error) {
    console.log(`${deviceId}: claim failed, the server can't be reached: ${error.cause?.message ?? error.message}`);
    return null;
  }
  const content = await answer.json().catch(() => ({}));
  if (answer.status !== 201) {
    console.log(`${deviceId}: claim REFUSED ${answer.status}: ${content.message ?? "(no message)"}`);
    return null;
  }
  // saveBrokerKey(): the key in NVS, never printed. The claim's server address is stored too: firmware is downloaded from there.
  store[deviceId] = { ...store[deviceId], key: content.key, server_address: serverAddress };
  saveStore();
  console.log(`${deviceId}: claim SUCCEEDED in ${Date.now() - startClaim} ms (broker username ${content.mqtt_username}); ` +
    "key stored in data/simulator-store.json, connecting to the broker...");
  return deviceId;
}

if (args[1] === "clean") {
  await clean(Number(args[2]) || 10);
} else {
  // Module 28: = settings.cpp of the firmware: a default SERVER_URL that Node 1 can't store isn't used, with its reason
  const defaultAddressError = process.env.SERVER_URL ? serverAddressError(tidyAddress(process.env.SERVER_URL)) : "";
  if (defaultAddressError !== "") console.log(`SERVER_URL in tools/.env isn't used: ${defaultAddressError}`);
  let withKeys = 0; // Module 21
  if (args[1] === "claim") { // Module 28
    const deviceId = args[4] ?? "f00d00000003";
    if (!/^[0-9a-f]{12}$/.test(deviceId)) {
      console.log(`device_id must be 12 lowercase hexadecimal digits, for example f00d00000003. Got: ${deviceId}`);
      process.exit(1);
    }
    if ((await claim(args[2] ?? "", args[3], deviceId)) === null) process.exit(1);
    runDevice(deviceId);
    withKeys = 1;
  } else {
    for (let i = 1; i <= COUNT; i++) {
      const deviceId = makeDeviceId(i);
      if (!deviceKey(deviceId)) {
        console.log(`${deviceId}: no key in tools/.env (KEY_${deviceId.toUpperCase()}=...), not started.`);
        continue;
      }
      withKeys++;
      runDevice(deviceId);
    }
  }
  if (withKeys === 0) {
    console.log("No fake device has a key. Fill in tools/.env, then run with: node --env-file=.env …");
    process.exit(1);
  }
  // Module 19: "temp 33" / "temp random" are typed in this terminal. Module 24: also "soil 25" / "soil random" and "tank 15" /
  // "tank random". Module 25: "garden start" / "garden pull" / "garden insert". Module 28: "restart" and "ota". Only in this
  // mode: in clean mode, a terminal listener would keep the program from finishing by itself.
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
    } else if (word === "restart") { // Module 28
      for (const p of runningDevices.values()) p.restart();
      return;
    } else if (word === "ota") { // Module 28
      for (const p of runningDevices.values()) console.log(p.otaState());
      return;
    } else if (word === "server" && arg !== undefined) { // Module 28: = the Serial command "server <address>" of Node 1 1.7.0
      const address = tidyAddress(arg);
      const wrong = serverAddressError(address);
      if (wrong !== "") {
        console.log(wrong);
        return;
      }
      for (const id of runningDevices.keys()) store[id] = { ...store[id], server_address: address };
      saveStore();
      console.log(`Server address saved: ${address} (firmware is only downloaded from <address>/fw/node-1/...)`);
      return;
    } else {
      console.log("Type for example: temp 33, temp random, soil 25, soil random, tank 15, tank random, garden start, " +
        "garden pull, garden insert, restart, ota, or server http://192.168.1.10 (soil and tank: whole numbers 0-100)");
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
  console.log(`${withKeys} fake device(s) heading to ${BROKER_URL} (default simulated firmware ${INITIAL_FW}). Type for example ` +
    `"temp 33", "soil 25", "tank 15", "garden start", "restart", or "ota". Stop with Ctrl+C.`);
}
