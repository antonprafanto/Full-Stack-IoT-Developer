// live-terminal.js — a "small terminal" that shows the live readings of ONE device through Socket.IO. Module 19.
// Needs the socket.io-client library:  npm install socket.io-client@4.8.4
// Run (the backend must be running):  node live-terminal.js http://127.0.0.1:8080 f00d00000001
// Stop: Ctrl + C

import { io } from "socket.io-client";

const address = process.argv[2] || "http://127.0.0.1:8080";
const deviceId = process.argv[3];
if (deviceId === undefined) {
  console.log("Write the device's device_id, for example: node live-terminal.js http://127.0.0.1:8080 f00d00000001");
  process.exit(1);
}

const time = () => new Date().toLocaleTimeString("en-US"); // the laptop's clock, for example 7:15:02 AM
const socket = io(address);

function show(id, content, note = "") {
  // contract 1.3: Node 1 telemetry carries state, so the fan and lamp state are shown too
  const actuators = content.state ? `  fan ${content.state.fan ? "ON" : "off"}  lamp ${content.state.lamp ? "ON" : "off"}` : "";
  console.log(`[${time()}] ${id}  temp ${content.temperature} °C  humidity ${content.humidity} %  soil ${content.soil} %${actuators}${note}`);
}

// "connect" fires again every time it reconnects. Rooms are lost on a disconnect, so "follow" is sent again here.
socket.on("connect", async () => {
  console.log(`[${time()}] connected to ${address} (${socket.io.engine.transport.name})`);
  socket.io.engine.once("upgrade", (transport) => console.log(`[${time()}] transport upgraded to ${transport.name}`));
  try {
    const answer = await socket.timeout(5000).emitWithAck("follow", deviceId);
    if (!answer.ok) {
      console.log(`[${time()}] refused by the server: ${answer.message}`);
      return;
    }
    console.log(`[${time()}] following ${deviceId}`);
    if (answer.latest) show(deviceId, answer.latest, "  (last reading)");
  } catch {
    console.log(`[${time()}] the server didn't answer "follow" within 5 seconds`);
  }
});

socket.on("telemetry", (id, content) => show(id, content));
socket.on("status", (id, status) => console.log(`[${time()}] ${id} is now ${status}`));
socket.on("event", (event) => console.log(`[${time()}] event: ${event.message}`)); // the event log (Practice 4)
socket.on("connect_error", (error) => console.log(`[${time()}] can't connect yet: ${error.message}`));
socket.on("disconnect", (reason) => {
  console.log(`[${time()}] disconnected: ${reason}`);
  // "io server disconnect" = the server dropped us on purpose (for example stopped with Ctrl + C). Socket.IO doesn't
  // reconnect by itself in that case, so we ask for it ourselves; when the server is back, we connect again.
  if (reason === "io server disconnect") socket.connect();
});
