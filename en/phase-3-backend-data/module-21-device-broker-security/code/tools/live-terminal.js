// live-terminal.js — a "small terminal" showing the live readings of ONE device through Socket.IO. Module 19, locked in Module 20.
// Needs the socket.io-client library:  npm install socket.io-client@4.8.4
// Module 20: needs a tools/.env file (not in Git) with an account for this terminal; the example is in tools/.env.example.
// Run (the backend must be running):  node --env-file=.env live-terminal.js http://127.0.0.1:8080 f00d00000001
// Stop: Ctrl + C

import { io } from "socket.io-client";

const address = process.argv[2] || "http://127.0.0.1:8080";
const deviceId = process.argv[3];
if (deviceId === undefined) {
  console.log("Write the device's device_id, for example: node --env-file=.env live-terminal.js http://127.0.0.1:8080 f00d00000001");
  process.exit(1);
}
// Module 20: the account for this terminal. A viewer account is enough: the terminal only looks (least privilege).
const email = process.env.TERMINAL_EMAIL;
const password = process.env.TERMINAL_PASSWORD;
if (!email || !password) {
  console.log("Fill in TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env, then run with: node --env-file=.env live-terminal.js …");
  process.exit(1);
}

const time = () => new Date().toLocaleTimeString("en-US"); // the laptop's clock, for example 7:15:02 AM
const cookies = new Map(); // cookies from the backend: "access" (the 15-minute wristband) and "session" (the 7-day season pass)

// save the cookies from the Set-Cookie headers, for example "access=eyJ…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict".
// Only the part before the first semicolon is kept; an empty value = the server deleted the cookie.
function saveCookies(answer) {
  for (const text of answer.headers.getSetCookie()) {
    const [name, ...value] = text.split(";")[0].split("=");
    if (value.join("=") === "") cookies.delete(name);
    else cookies.set(name, value.join("="));
  }
}

// log in with email and password: the answer carries the access and session cookies
async function login() {
  const answer = await fetch(`${address}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!answer.ok) throw new Error(`login refused (${answer.status})`);
  saveCookies(answer);
  console.log(`[${time()}] logged in as ${email}`);
}

// the wristband ran out: swap the season pass (session cookie) for a new wristband, without logging in again (no new session row)
async function refresh() {
  if (!cookies.has("session")) return false;
  const answer = await fetch(`${address}/auth/refresh`, { method: "POST", headers: { cookie: `session=${cookies.get("session")}` } });
  saveCookies(answer);
  if (!answer.ok) {
    console.log(`[${time()}] refresh refused (${answer.status}), logging in again`);
    return false;
  }
  console.log(`[${time()}] wristband renewed (refresh)`);
  return true;
}

const socket = io(address, { autoConnect: false }); // don't connect before we have a wristband

// refresh first; if that fails, log in again; then connect with the access cookie in the handshake header
let failuresInARow = 0;
async function refreshThenConnect() {
  if (++failuresInARow > 3) { // refused again and again even with a new wristband: don't go round in circles
    console.log(`[${time()}] refused by the server again and again; stopping`);
    process.exit(1);
  }
  try {
    if (!(await refresh())) await login();
    socket.io.opts.extraHeaders = { cookie: `access=${cookies.get("access")}` }; // used every time it connects
    socket.connect();
  } catch (error) {
    if (error instanceof TypeError) { // fetch failed: the backend can't be reached yet (for example it is restarting)
      console.log(`[${time()}] can't reach the backend yet, trying again in 5 seconds`);
      failuresInARow--;
      setTimeout(refreshThenConnect, 5000);
      return;
    }
    console.log(`[${time()}] ${error.message}. Check TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env.`);
    process.exit(1);
  }
}

function show(id, content, note = "") {
  // contract 1.3: Node 1 telemetry carries state, so the fan and lamp state are shown too
  const actuators = content.state ? `  fan ${content.state.fan ? "ON" : "off"}  lamp ${content.state.lamp ? "ON" : "off"}` : "";
  console.log(`[${time()}] ${id}  temp ${content.temperature} °C  humidity ${content.humidity} %  soil ${content.soil} %${actuators}${note}`);
}

// "connect" fires again every time it reconnects. Rooms are lost on a disconnect, so "follow" is sent again here.
socket.on("connect", async () => {
  failuresInARow = 0;
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
socket.on("event", (event) => console.log(`[${time()}] event: ${event.message}`)); // the event log (Module 19)
socket.on("connect_error", (error) => {
  if (socket.active) { // a temporary problem (for example the backend is restarting): Socket.IO tries again by itself
    console.log(`[${time()}] can't connect yet: ${error.message}`);
  } else { // Module 20: refused by the Socket.IO door guard (not logged in or the wristband ran out)
    console.log(`[${time()}] refused by the server: ${error.message}`);
    refreshThenConnect();
  }
});
socket.on("disconnect", (reason) => {
  console.log(`[${time()}] disconnected: ${reason}`);
  // "io server disconnect" = the server dropped us on purpose: the wristband ran out, a logout, or the server was stopped.
  // Socket.IO doesn't reconnect by itself in that case: renew the wristband first, then connect again.
  if (reason === "io server disconnect") refreshThenConnect();
});

refreshThenConnect(); // Module 20: no season pass yet, so the first step is logging in
