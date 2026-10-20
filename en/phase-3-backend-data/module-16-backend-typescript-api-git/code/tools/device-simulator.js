// device-simulator.js — ten fake "Node 1" devices that speak MQTT exactly as the data contract says (Appendix A).
// Module 16 - Practice 7. What it is for: developing and testing the backend without hardware and without Wokwi.
//
// How to use (from a terminal, in the tools folder):
//   node device-simulator.js mqtt://192.168.1.37:1883            -> 10 fake devices
//   node device-simulator.js mqtt://192.168.1.37:1883 3          -> 3 fake devices
//   node device-simulator.js mqtt://192.168.1.37:1883 clean      -> delete the retained status of the fake devices
// Stop with Ctrl+C: the broker then publishes the "offline" last will of every fake device.

import mqtt from "mqtt";
import { buildTelemetry } from "./generate-dummy.js";

const BROKER_URL = process.argv[2] || "mqtt://127.0.0.1:1883";
const COUNT = Number(process.argv[3]) || 10;

// a fake device_id: 12 lowercase hexadecimal digits, starting with f00d so it's easy to recognize
function makeDeviceId(number) {
  return "f00d" + String(number).padStart(8, "0");
}

// UTC time without milliseconds, like ts in the data contract: 2026-10-19T04:14:28Z
function timeNow() {
  return new Date().toISOString().slice(0, 19) + "Z";
}

function runDevice(deviceId) {
  const topic = (kind) => `msh/${deviceId}/${kind}`;
  const start = Date.now();
  const state = { fan: false, lamp: false, pump: false, curtain: 90 };
  const lastIds = []; // ids of the commands already carried out (contract rule 8)

  const client = mqtt.connect(BROKER_URL, {
    clientId: deviceId,
    clean: true,
    keepalive: 15,
    reconnectPeriod: 5000, // reconnect at most every 5 seconds (contract section 3)
    will: { topic: topic("status"), payload: "offline", qos: 1, retain: true },
  });

  // vitals: once after connecting, then every 5 minutes (contract section 2)
  function sendVitals() {
    const vitals = {
      ts: timeNow(),
      rssi: -40 - Math.floor(Math.random() * 40), // -40 to -79 dBm
      uptime_s: Math.floor((Date.now() - start) / 1000),
      heap_free: 180000 + Math.floor(Math.random() * 20000),
    };
    client.publish(topic("vitals"), JSON.stringify(vitals));
  }

  client.on("connect", () => {
    client.publish(topic("status"), "online", { qos: 1, retain: true });
    client.subscribe(topic("cmd"), { qos: 1 });
    sendVitals();
    console.log(`${deviceId}: online`);
  });
  setInterval(() => {
    if (client.connected) sendVitals();
  }, 5 * 60 * 1000);

  client.on("message", (_topic, content) => {
    let cmd;
    try {
      cmd = JSON.parse(content.toString());
    } catch {
      return; // not JSON: can't be answered (contract rule 4)
    }
    if (typeof cmd.id !== "string" || cmd.id.length > 39) return;
    if (lastIds.includes(cmd.id)) return; // the same id is carried out only once
    lastIds.push(cmd.id);
    if (lastIds.length > 8) lastIds.shift();

    let message = "";
    if (cmd.action !== "set") message = `action ${cmd.action} not supported yet`;
    else if (cmd.target === "lamp" || cmd.target === "fan") {
      if (typeof cmd.value === "boolean") state[cmd.target] = cmd.value;
      else message = `${cmd.target} value must be true or false`;
    } else if (cmd.target === "pump") {
      if (Number.isInteger(cmd.value) && cmd.value >= 1 && cmd.value <= 10) {
        state.pump = true;
        setTimeout(() => (state.pump = false), cmd.value * 1000);
      } else message = "pump value must be 1-10 seconds";
    } else if (cmd.target === "curtain") {
      if (Number.isInteger(cmd.value) && cmd.value >= 0 && cmd.value <= 180) state.curtain = cmd.value;
      else message = "curtain value must be 0-180 degrees";
    } else message = `unknown target ${cmd.target}`;

    const ack = { id: cmd.id, ts: timeNow(), ok: message === "", state: { ...state } };
    if (message !== "") ack.message = message;
    client.publish(topic("ack"), JSON.stringify(ack));
    console.log(`${deviceId}: command ${cmd.id} -> ok=${ack.ok}`);
  });

  // telemetry every 10 seconds (contract rule 3), starting at a random second so they don't all send at once
  const sendTelemetry = () => {
    if (client.connected) client.publish(topic("telemetry"), JSON.stringify(buildTelemetry()));
  };
  setTimeout(() => {
    sendTelemetry(); // the first send right at that random second
    setInterval(sendTelemetry, 10000);
  }, Math.random() * 10000);
}

// clean: publish an empty retained message to the status topic of every fake device, so that the broker
// forgets their "offline" status (the way to delete a retained message, Module 11), then finish.
// Ran more than 10 devices before? Add the number: ... clean 20
async function clean(count) {
  try {
    const client = await mqtt.connectAsync(BROKER_URL);
    for (let i = 1; i <= count; i++) {
      await client.publishAsync(`msh/${makeDeviceId(i)}/status`, "", { qos: 1, retain: true });
    }
    await client.endAsync();
    console.log(`Status of ${count} fake devices removed from the broker.`);
  } catch (error) {
    console.log(`Couldn't connect to ${BROKER_URL}: ${error.message}`);
  }
}

if (process.argv[3] === "clean") {
  await clean(Number(process.argv[4]) || 10);
} else {
  for (let i = 1; i <= COUNT; i++) {
    runDevice(makeDeviceId(i));
  }
  console.log(`${COUNT} fake devices heading to ${BROKER_URL}. Stop with Ctrl+C.`);
}
