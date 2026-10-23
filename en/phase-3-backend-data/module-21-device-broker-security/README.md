# Module 21 — Device Security: API Keys, Simple Provisioning, & Broker Access Control (ACL)

🌐 **English** · [Bahasa Indonesia](../../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md)

*Phase 3 · Week 21 · Hardware: **Kit A + B** (Node 1, the Pi gateway, and a Node 2 board borrowed for a moment as an "intruder") **or just a laptop** (the device simulator and MQTTX) · Prerequisites: **Module 20** (backend v0.5 with accounts and login) · Time: 9–11 hours, spread over the week*

[⬅️ Module 20](../module-20-user-security/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 22 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-22--html-css--react-typescript-from-scratch-for-an-iot-dashboard)

---

Last week you locked the front door of the house. The backend now asks **"Who are you?"** of everyone who knocks on the API: without a login the answer is 401, a `viewer` account that tries to turn a relay on is answered 403, and a password guesser is held back after 10 attempts. But your house still has a **side door that has never been locked since Module 11: the MQTT broker**.

Picture a guest connected to your home Wi-Fi. They open MQTTX on their laptop, join the broker with no username and no password, then publish one message to the topic `msh/a4cf12e5b7c0/cmd`:

```json
{"id":"c-prank-1","ts":"2026-10-23T01:00:00Z","action":"set","target":"pump","value":true}
```

Node 1 obeys: its pump turns on. The `admin` account, the guard, and every lock from Module 20 are skipped, because that command **never went through the backend**. The same guest can also publish fake `telemetry` on behalf of Node 1, for example a temperature of 45 °C. The backend stores it in the database, shows it in the small terminal, and uses it for automation rules, exactly like a real reading. The broker never asks who the sender is, and never checks whether that sender is allowed to write to that topic.

This week you install the locks for devices:

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Anyone on the home Wi-Fi can join the broker, then turn the pump on through `cmd` without going through the backend. | The broker accepts guests with no name (`allow_anonymous true` since Modules 11–12). | **A broker account for every device and program.** Without a registered username and password, the broker refuses with `Connection refused: Not authorized` (Concept 6, Practice 4) |
| If every device uses one shared password, one lost board opens everything. | There is no per-device identity yet. | **A key of its own for every device**: 43 random characters made by the backend and stored only as a fingerprint (Concept 2, Practice 1) |
| The backend records data from any device that claims to be one, including a test board or a forgotten simulator. | Since Module 17, the backend creates a new `devices` row for every `device_id` it hasn't seen before. | **An official registry** in the backend: only devices an admin has registered are listened to; messages from other devices are ignored and logged (Concepts 3–4, Practices 1–2) |
| A device key must stay on the device, but must never end up in the code or on GitHub. | Node 1's firmware code is in a public repository. | **The key is stored in NVS through the Serial Monitor** (`key <value>`), not in the code (Concept 5, Practice 3) |
| A device with a valid account can still send data on behalf of another device, and even kick it off the broker. | The broker has no topic rules yet, and the client name (*client ID*) can be faked. | **An access control list (ACL) with the `%u` pattern** and `use_username_as_clientid`: every device may only write to its own `msh/<device_id>/…` and read its own `cmd` (Concepts 7–8, Practices 5–6) |
| A lost or stolen device can still get in. | There is no way to revoke one device's key. | **Revoke the key** in the backend (effective at once) and at the broker (`mosquitto_passwd -D`), then restore it with a new key (Concept 9, Practice 7) |
| The username and key travel across the home network without encryption. | MQTT on port 1883 doesn't use TLS yet. | **Not cured this week, and this module is honest about it.** You see the key travel in the clear for yourself, then learn why that is still acceptable on a home network but must be fixed before the broker is opened to the internet in Module 27 (Concept 10, Practice 8) |

By the end of the week, **MQTTX without a password is rejected by the broker**, **a device that "impersonates" another device's topic is rejected by the access list**, and **a device whose key has been revoked can no longer send data**. Those are the three pass requirements of this module. The backend goes up to **v1.0: locked for people and for devices**, and Phase 3 is complete: 🎉 **Phase 3 Checkpoint**.

![Module 21 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 3 Backend and data, Modules 16 to 21, is highlighted with a green frame. Modules 1 to 20 are marked done, Module 21 is red and marked YOU ARE HERE with the note: the house is locked for devices, that is, a key per device, broker accounts, and an access list. Just to the right of Module 21 there is a green Phase 3 Checkpoint label with a celebration mark. Below it, the box for this week's Module 21, 9 to 11 hours spread out; Kit A + B or just a laptop, continuing directly from Module 20 with backend v0.5 that already has accounts and login. The list of activities: the JavaScript warm-up, that is, random keys, a fingerprint and a fair comparison, the %u topic pattern, a Map guest book, and a password in a packet is just bytes; Quick Win, a practice broker that rejects guests without a password; Practice 1, the registry and device keys; Practice 2, the second layer and a broker account for the backend; Practice 3, Node 1 and the tools install their keys; Practice 4, locking the broker's door, with the pass requirement MQTTX without a password is rejected by the broker; Practice 5, the access list, every device on its own topic; Practice 6, the intruder is rejected and logged, with the pass requirement a device that impersonates another's topic is rejected; Practice 7, revoking a lost device's key, with the pass requirement a device whose key is revoked can no longer send data; Practice 8, honest about encryption, and the pass tests; and the Add-on, backend v1.0, data contract 1.4, and the device-security pull request. Practices 4, 6, 7, 8, and the Add-on are marked with a star, required to pass. Note at the bottom: the order matters, install the keys first (Practices 1–3), then change the lock, that is, the broker is locked in Practice 4; three paths, that is, the device (the Pi gateway, Node 1, and a Node 2 board borrowed as an intruder), the laptop (Mosquitto on the laptop, the simulator, and MQTTX as the intruder), or Wokwi (firmware v1.6.0 only).](assets/roadmap-module-21.png)

> [!NOTE]
> **How to use this module.**
>
> - **Three paths, like Module 19.** **The device path** uses the Mosquitto broker on the Pi gateway, Node 1 with the new firmware v1.6.0, and a Node 2 board borrowed for a moment as an "intruder" in Practice 6, like the board borrowed in Module 15. **The laptop path** uses the Mosquitto service on the laptop from Module 12, the device simulator, and MQTTX as the intruder. **The Wokwi path** is only used to try firmware v1.6.0 in Practice 3, with the public broker `test.mosquitto.org` that checks the password.
> - **The order matters: install the keys first, then change the lock.** Practices 1–3 give keys to the backend, the devices, and the tools while the broker is still open. A broker that isn't locked yet doesn't check the username and password, so nothing is cut off. Only Practice 4 locks the broker. If you reversed the order, Node 1, the backend, and the Node-RED dashboard would be rejected at once.
> - **The 🖥️ box of every practice names its tools**: the **VS Code terminal** (in the `backend`, `tools`, or `edge` folder), the **SSH terminal to the Pi** (device path), **Bruno**, **MQTTX**, and the Arduino IDE **Serial Monitor**.
> - **A direct continuation of Module 20.** The `smarthome-db` container, the `smarthome` database (migrations up to 008, the `admin@home.test` and `viewer@home.test` accounts), backend v0.5 on the `main` branch, the Bruno collection with its `bruno/.env`, and the `tools/.env` are all used again as they are.
> - **The Expected output boxes.** The backend, Bruno CLI, simulator, tool, and firmware (Wokwi) output was recorded by the author on a Windows laptop with Node.js 24. **Mosquitto wasn't installed on the author's laptop this week**, so the Mosquitto output (the broker log and the contents of the password file) is written from its official source code, versions 2.0.21 (Pi) and 2.1.2 (laptop), and marked **example**. The text in the MQTTX and Bruno desktop windows is also written from the source code of both apps. The details are in 📚 Sources. The times, keys, and `device_id`s on your screen will certainly be different.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in VS Code, the browser, Bruno, and MQTTX. **Except in the terminal:** stopping a running program is still **Ctrl + C**. Terminal commands are the same on Windows and macOS, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **A device key only travels through safe places**: copied once from the API answer to **your password manager**, pasted into the `mosquitto_passwd` prompt on the broker machine, then typed into the device (the Serial Monitor) or into `tools/.env` (the simulator). Never put it in the code, in Git, in a Bruno `.yml` file, in learning notes, in a chat, or in a screenshot.
> 2. **The broker password file (`broker-passwd`) doesn't go into Git.** Its contents are only fingerprints, not passwords, but even a fingerprint doesn't need to be shown off.
> 3. **Always leave yourself a way back in.** Don't close the SSH terminal to the Pi while you're changing the broker settings. If the broker fails to start, fix it through the terminal that's still open.
> 4. **Every time the access control list (ACL) is changed, the broker is restarted, not *reloaded*.** On the Pi, an ACL with a typo that is then reloaded can leave the broker running **with no ACL at all** (Concept 9).
> 5. **Traffic isn't encrypted yet.** Don't set up port forwarding to the broker, and don't connect devices to your home broker over a public Wi-Fi. That only becomes safe after TLS in Module 27.

This module's rhythm is the same as Modules 1–20. The fold-out sections under 🚨 (click the heading) only need to be opened when you need them; the fold-out sections under 🔬 may be skipped. Every practice begins with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🏆 Quick Win: a practice broker that rejects guests without a password (20 minutes)](#-quick-win-a-practice-broker-that-rejects-guests-without-a-password-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Device threat model](#1-device-threat-model-who-can-impersonate-node-1) · [2 A key of its own](#2-a-key-of-its-own-for-every-device) · [3 The registry](#3-the-registry-and-simple-provisioning) · [4 The second layer](#4-the-second-layer-the-backend-only-listens-to-registered-devices) · [5 The key in the device](#5-the-key-inside-the-device-nvs-the-serial-monitor-and-its-limits) · [6 The broker's doorkeeper](#6-the-brokers-doorkeeper-a-password-file-and-one-account-per-program) · [7 The access list](#7-the-access-control-list-acl-every-device-on-its-own-topic) · [8 Faked client IDs](#8-client-ids-can-be-faked-use_username_as_clientid) · [9 Revoking a key](#9-revoking-a-lost-devices-key) · [10 Traffic in the clear](#10-honest-traffic-at-home-is-still-in-the-clear)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 The registry](#practice-1--the-registry-and-device-keys-60-minutes) · [2 The second layer](#practice-2--the-second-layer-and-a-broker-account-for-the-backend-45-minutes) · [3 Keys on the device](#practice-3--node-1-and-the-tools-install-their-keys-60-minutes) · [4 Lock the broker](#practice-4--locking-the-brokers-door-60-minutes) · [5 Access list](#practice-5--the-access-control-list-every-device-on-its-own-topic-45-minutes) · [6 The intruder](#practice-6--the-intruder-is-rejected-and-logged-40-minutes) · [7 Revoke a key](#practice-7--revoking-a-lost-devices-key-40-minutes) · [8 Pass tests](#practice-8--honest-about-encryption-and-the-pass-tests-40-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-21-completion-checklist)

## 🎯 After this module you can…

1. **Build a threat model for devices and the broker**: who can impersonate Node 1, through which door, and what the consequences are.
2. **Give every device a key of its own** (an *API key*): 43 random characters made by the backend and stored only as a SHA-256 fingerprint, then explain why a random key can get by with SHA-256 while a human-made password needs bcrypt.
3. **Register devices through the API** (`POST /devices`) as simple *provisioning*, and make the backend **ignore** devices that aren't registered or whose key has been revoked.
4. **Store the key in Node 1's NVS through the Serial Monitor**, not in the code, and make the firmware wait patiently when the broker rejects it.
5. **Lock Mosquitto** with a password file (`mosquitto_passwd`) and one account per program, so that **MQTTX without a password is rejected**.
6. **Write an access control list (ACL) with the `%u` pattern** so that every device can only write to its own topic, then explain why the `%c` pattern alone can be tricked.
7. **Prove that an intruder is rejected and logged** in the broker log, then **revoke a lost device's key** and restore it with a new key.
8. **Name honestly what isn't secure yet**: MQTT traffic is still in the clear (you see it yourself), the key in NVS can be read by anyone who holds the board, and the items from the OWASP IoT Top 10 that are only fixed later.

## 🧰 What you need

| What to prepare | Notes |
| :--- | :--- |
| **The result of Module 20** | Docker Desktop with the **`smarthome-db`** container running, the `smarthome` database (migrations up to 008), **backend v0.5** merged into `main` in Module 20 ➕ D, the `admin@home.test` and `viewer@home.test` accounts with `bruno/.env`, and the `tools` folder with `tools/.env`. |
| **Node.js 24, VS Code, Git, Bruno, MQTTX** | Same as Modules 16–20. MQTTX has been used since Module 11. |
| **Mosquitto** | **Device path:** Mosquitto 2.0.21 on the Pi gateway (Module 12), opened through an SSH terminal. **Laptop path:** the Mosquitto 2.1.2 service on the laptop (Module 12 Practice 7), managed through an Administrator terminal (Windows) or Terminal (macOS). The account tool **`mosquitto_passwd`** is installed together with Mosquitto. |
| **Devices** | **Device path:** Node 1 with a USB cable and the Arduino IDE (firmware v1.6.0 in Practice 3), and the Node 2 ESP32 board borrowed for a moment in Practice 6, then returned to the Node 2 firmware. **Laptop path:** the device simulator from the `tools` folder. **Wokwi path:** just a browser, no account. |
| **Node-RED on the Pi** (device path) | The Module 13 dashboard still reads the broker. It gets its own account in Practice 4. |
| **An internet connection** | No new npm packages this week. The internet is only needed for the Wokwi path and the public broker `test.mosquitto.org`. |
| **A GitHub account** | Already set up since Module 16. ➕ merges all the work through the "device security" pull request. |

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, and the `learn-iot` repository folder.

Like Modules 16–20, the Phase 3 modules open with a JavaScript warm-up. This week's device key is built from five small abilities already available in Node.js, without installing anything: **random keys** with `randomBytes`, **a fingerprint and a fair comparison** with `createHash` and `timingSafeEqual`, **matching topics against a pattern**, **a guest book** with `Map`, and **reading *bytes*** with `Buffer`. All five show up again in the backend, at the broker, and in the firmware.

**Set up the folder.** Open the **`learn-iot`** repository folder in VS Code, first click an empty spot in the Explorer panel, create a new folder **`module-21`**, then run in the terminal:

```text
cd module-21
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` is needed because this file uses `import` (just like the Module 16–20 warm-ups). Then create the file **`warmup.js`** in the `module-21` folder.

### Step 1 — Device keys: `randomBytes`

A device key must be **random and unguessable**, exactly like the season pass in Module 20. The recipe is the same too: 32 random *bytes*, written as *base64url* text.

```js
// warmup.js - a JavaScript warm-up before Module 21
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// 1. A device key: 32 random bytes, written as 43 base64url characters
const makeKey = () => randomBytes(32).toString("base64url");
const node1Key = makeKey();
console.log(node1Key, node1Key.length);
const keyShape = /^[A-Za-z0-9_-]{43}$/;
console.log(keyShape.test(node1Key));
console.log(keyShape.test(node1Key + " "));
console.log(keyShape.test(node1Key.slice(0, 42)));
```

Save it (**Ctrl + S**), then run it in the terminal:

```text
node warmup.js
```

**Expected output** (**example**: the key on your first line will certainly be different, and different again each time you run it):

```text
5woD7coal_Dpmz8lLzZzOwYaxTCg5dQ9_alfT9kRnuw 43
true
false
false
```

- **`randomBytes(32)`** takes 32 *bytes* from the operating system's random source, which is made exactly for secrets. **`.toString("base64url")`** writes them with 64 kinds of character that are safe to paste anywhere: A–Z, a–z, 0–9, `-`, and `_`. The result is always **43 characters**.
- **`keyShape`** is a **text pattern** (*regular expression*): `^` means "from the start", `[A-Za-z0-9_-]{43}` means "exactly 43 characters from that set", and `$` means "to the end". This week's backend checks the key with the same pattern.
- The third and fourth lines show the two most common paste mistakes: **a space copied along at the end**, and **one character left off**. The pattern rejects both. On a device, a key pasted wrong like that makes the broker refuse the connection.

### Step 2 — Fingerprints and a fair comparison: `createHash` and `timingSafeEqual`

The backend doesn't store the key, only its SHA-256 fingerprint (Concept 2). To check a key, compute its fingerprint, then compare it with the stored one. Add at the very bottom:

```js
// 2. A fingerprint and a fair comparison
const fingerprint = (text) => createHash("sha256").update(text).digest("hex");
const stored = fingerprint(node1Key); // what the backend stores in the key_hash column
function matchKey(key, storedFingerprint) {
  const a = Buffer.from(fingerprint(key), "hex");
  const b = Buffer.from(storedFingerprint, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
console.log(stored.length);
console.log(matchKey(node1Key, stored));
const oneCharOff = (node1Key[0] === "A" ? "B" : "A") + node1Key.slice(1);
console.log(matchKey(oneCharOff, stored));
console.log(matchKey(makeKey(), stored));
```

**Expected output** (new lines):

```text
64
true
false
false
```

- **`createHash("sha256")`** you know from Module 20: its result is 64 hexadecimal characters, always the same length. The `key_hash` column in this week's database holds text like that.
- **`timingSafeEqual(a, b)`** compares two *byte* sequences of the **same length** and always checks **all** of their *bytes*. An ordinary comparison (`===`) may stop at the first differing character, so two texts that start out similar take a little longer to be declared different. A very patient guesser could measure a time difference that small to guess the contents bit by bit. `timingSafeEqual` closes that gap. The two lengths are checked first (`a.length === b.length`) because `timingSafeEqual` throws an error if the lengths differ.
- `oneCharOff` is the same key, except for its first character. One character is already enough to get it rejected. A new key from `makeKey()` is of course rejected too.

This week the backend doesn't need to check keys itself, because it's the broker that checks them. The `matchKey` function is used again in 🧩 Level 2, and later in Module 28 when devices download firmware from the backend.

### Step 3 — Matching topics against a pattern

The broker's access list (Concept 7) holds lines like `pattern write msh/%u/telemetry`. So that line doesn't feel like magic, build your own mini version. Add:

```js
// 3. Matching a topic against an access-list pattern
function matchPattern(pattern, topic, username) {
  if (username.includes("+") || username.includes("#") || username.includes("/")) return false;
  const p = pattern.split("/").map((level) => (level === "%u" ? username : level));
  const t = topic.split("/");
  for (let i = 0; i < p.length; i++) {
    if (p[i] === "#") return true;
    if (i >= t.length) return false;
    if (p[i] !== "+" && p[i] !== t[i]) return false;
  }
  return p.length === t.length;
}
console.log(matchPattern("msh/%u/telemetry", "msh/a4cf12e5b7c0/telemetry", "a4cf12e5b7c0"));
console.log(matchPattern("msh/%u/telemetry", "msh/a4cf12e5b7c0/telemetry", "c0ba00000001"));
console.log(matchPattern("msh/+/cmd", "msh/a4cf12e5b7c0/cmd", "backend"));
console.log(matchPattern("msh/#", "msh/a4cf12e5b7c0/status", "monitor"));
console.log(matchPattern("msh/%u/telemetry", "msh/a4cf12e5b7c0/telemetry", "+"));
```

**Expected output** (new lines):

```text
true
false
true
true
false
```

- **`split("/")`** breaks the pattern and the topic into levels (Module 11 Concept 4). The `%u` level is replaced by the username, then the two lists are compared one by one: `+` matches exactly one level of anything, and `#` matches all remaining levels.
- The first and second lines are the heart of this module. The same pattern lets Node 1 write to its own topic, but rejects `c0ba00000001` trying to write to Node 1's topic.
- The third and fourth lines are the rules for the `backend` account (may write to any device's `cmd`) and `monitor` (may read all of `msh/…`).
- The last line answers a mischievous question: what if someone used **`+`** as their username, so that `msh/%u/telemetry` becomes `msh/+/telemetry` and matches anyone's topic? The function's first line rejects it. Mosquitto does the same: a username that contains `+` or `#` never gets through a pattern.

### Step 4 — A guest book with `Map`: the registry and the second layer

The backend keeps the registry in memory so it doesn't have to ask the database for every message (Concept 4). The structure that fits is a **`Map`**, the per-device notebook you've used since Module 19. Add:

```js
// 4. A guest book with Map: the official registry and the second layer
const registry = new Map([
  ["a4cf12e5b7c0", { name: "Node 1 living room", revoked: null }],
  ["246f28b1c7d4", { name: "Node 2 garden", revoked: null }],
  ["c0ba00000001", { name: "test board", revoked: "2026-10-23T02:10:00Z" }],
]);
function permission(deviceId) {
  const device = registry.get(deviceId);
  if (device === undefined) return "unregistered";
  if (device.revoked !== null) return "revoked";
  return "registered";
}
for (const id of ["a4cf12e5b7c0", "c0ba00000001", "f00d00000009"]) {
  const decision = permission(id);
  console.log(id, decision, decision === "registered" ? "-> processed" : "-> IGNORED");
}
```

**Expected output** (new lines):

```text
a4cf12e5b7c0 registered -> processed
c0ba00000001 revoked -> IGNORED
f00d00000009 unregistered -> IGNORED
```

- **`new Map([...])`** builds a notebook from a list of `[key, value]` pairs. **`.get(id)`** takes its value, or `undefined` if that `id` isn't in the book.
- **`permission()`** is a **pure function** (Module 19): it only reads the book and returns one of three states, without changing anything. A function like this is easy to test with a *unit test*, and its real version is in this week's backend at `src/services/registry.ts`.
- Notice that `c0ba00000001` **is** in the book, but is still ignored because its key has been revoked. That's what the `revoked` field is for: its history stays recorded, but its messages are no longer listened to.

### Step 5 — The password in the packet is just *bytes*: `Buffer`

Concept 10 mentions that an MQTT packet carries the key as plain *bytes*. In MQTT, every piece of text in a packet is written the same way: **two *bytes* of length**, then **the text itself**. Build a mini packet with a username and a key, then read it back. Add:

```js
// 5. A password in a packet is just bytes
function mqttString(text) {
  const content = Buffer.from(text, "utf8");
  const length = Buffer.alloc(2);
  length.writeUInt16BE(content.length);
  return Buffer.concat([length, content]);
}
const packet = Buffer.concat([mqttString("a4cf12e5b7c0"), mqttString("Qx3-example-key")]);
console.log(packet.toString("hex"));
console.log(packet.length);
const nameLength = packet.readUInt16BE(0);
const name = packet.toString("utf8", 2, 2 + nameLength);
const passwordLength = packet.readUInt16BE(2 + nameLength);
const password = packet.toString("utf8", 4 + nameLength, 4 + nameLength + passwordLength);
console.log(name, password);
```

**Expected output** (new lines):

```text
000c613463663132653562376330000f5178332d6578616d706c652d6b6579
31
a4cf12e5b7c0 Qx3-example-key
```

- **`Buffer`** is a sequence of *bytes* in Node.js. **`writeUInt16BE`** writes a length number into two *bytes*: `000c` = 12, the length of `a4cf12e5b7c0`, and `000f` = 15, the length of `Qx3-example-key`.
- In that hexadecimal line, every character becomes two hexadecimal digits: `61` is `a`, `34` is `4`, and so on. That's not encryption, just another way of writing the same characters.
- The last three lines of the code read that packet back, **without any key at all**. You just need to know the rule "two *bytes* of length, then the contents". Anyone who captures a CONNECT packet on the network can do the same, and that's what the sniffer tool proves in Practice 8.

<details>
<summary>Self-test answer key</summary>

1. **Why is a device key stored as just a SHA-256 fingerprint, while an account password in Module 20 uses bcrypt?** An account password is chosen by a human, so it can be guessed from a list of popular passwords, and bcrypt deliberately makes every guess slow. A device key is taken at random from 2<sup>256</sup> possibilities, so there's no useful list to guess from. Slow or fast, guessing it is still impossible.
2. **What does `matchPattern("msh/%u/cmd", "msh/a4cf12e5b7c0/cmd", "a4cf12e5b7c0")` return, and what if the user is `c0ba00000001`?** `true` for Node 1, because `%u` becomes `a4cf12e5b7c0` and every level matches. `false` for `c0ba00000001`, because the second level differs.
3. **What does `permission("246f28b1c7d4")` print?** `registered`. Node 2 is in the book and its `revoked` is `null`. That Node 2 has no key doesn't matter to `permission()`, because its data is published by Node 1 (Concept 3).
4. **A key pasted with a space at its end is rejected by `keyShape.test()`. What happens if that space slips through and gets stored on the device?** To the broker, a key with a space is a different key, so its fingerprint doesn't match and the connection is refused with code 5. That's why the backend checks the key's shape, and the firmware refuses to store a key that contains a space or a foreign character.

</details>

## 🏆 Quick Win: a practice broker that rejects guests without a password (20 minutes)

> 🖥️ **Tools used:** **Laptop path:** the VS Code terminal in the `learn-iot/module-21` folder. **Device path:** the SSH terminal to the Pi (`ssh budi@192.168.1.37`, Module 12). Both of them plus **MQTTX** on the laptop.

Before locking the real broker, first get a feel for how a locked broker answers. You'll start a **second practice broker** on port **1884**, with just one account. The main broker on port 1883 isn't touched at all, so Node 1, the backend, and the dashboard keep running as usual while you practice.

### Step 1 — Create the first account with `mosquitto_passwd` (5 minutes)

Create the practice folder, then go into it.

**Laptop path** (the VS Code terminal, in the `module-21` folder from the warm-up):

```text
mkdir key-practice
cd key-practice
```

**Device path** (the SSH terminal to the Pi):

```bash
mkdir ~/key-practice && cd ~/key-practice
```

Then create a new password file with one account named `registered-guest`:

```text
mosquitto_passwd -c practice-passwd registered-guest
```

`-c` means "create a new file". The terminal asks for the password twice. Type a password that's easy to remember for these 20 minutes, for example `practice-side-door`, then press **Enter**. The characters you type **don't show at all**, not even as `*`. That's on purpose.

**Expected output** (**example**, Mosquitto 2.1.2 on the laptop):

```text
Adding password for user registered-guest
Password:
Reenter password:
```

On the Pi (Mosquitto 2.0.21) that first line doesn't appear; only the two password questions. If the two entries differ, the tool answers `Error: Passwords do not match.` and creates nothing; just run the command again.

Peek at the file's contents with `cat practice-passwd` (PowerShell knows this command too). **Expected output** (**example**, the fingerprint shortened):

```text
registered-guest:$7$1000$2ZbM8T1x…$m4YqVq0E…
```

What's stored isn't your password, but its fingerprint together with its salt (Concept 6). On the Pi, the number after `$7$` is `101`, not `1000`: Mosquitto 2.0.21 uses fewer rounds.

### Step 2 — Write the practice broker settings (5 minutes)

Create the file **`practice.conf`** in the same `key-practice` folder. Laptop path: right-click the `key-practice` folder in the VS Code Explorer panel → **New File…**. Device path: `nano practice.conf` in the SSH terminal. Its contents:

```text
# practice.conf - the Module 21 Quick Win practice broker: port 1884, only for registered accounts
listener 1884
allow_anonymous false
password_file practice-passwd
```

Save it (laptop: **Ctrl + S**; nano: **Ctrl + O**, **Enter**, then **Ctrl + X**). Remember the Module 11 rule: Mosquitto only treats `#` as a comment when it is **at the start of a line**.

### Step 3 — Start it, then knock without a password (5 minutes)

Run the practice broker from the `key-practice` folder. **Laptop path:**

```text
mosquitto -v -c practice.conf
```

**Device path:** on the Pi, the broker program is in `/usr/sbin`, so write the full path:

```bash
/usr/sbin/mosquitto -v -c practice.conf
```

**Expected output** (**example**, laptop; the `…` lines hold feature notes):

```text
1792721520: mosquitto version 2.1.2 starting
1792721520: Config loaded from practice.conf.
…
1792721520: Opening ipv4 listen socket on port 1884.
1792721520: Opening ipv6 listen socket on port 1884.
…
1792721520: mosquitto version 2.1.2 running
```

Leave that terminal open. Now open **MQTTX** and create a new connection (the **+** icon, **New Connection**):

1. **Name**: `Key practice`.
2. **Host**: `127.0.0.1` (laptop path) or `192.168.1.37` (device path, your Pi gateway's address).
3. **Port**: `1884`.
4. **Username** and **Password**: leave them **empty**.
5. Click **Connect** at the top right.

**Expected output:** MQTTX shows a red notice **`Error: Connection refused: Not authorized`**, and the connection doesn't turn green. The broker terminal shows (**example**, laptop):

```text
1792721560: New connection from 127.0.0.1:53470 on port 1884.
…
1792721560: Client mqttx_5f2b8a1c [127.0.0.1:53470] disconnected: not authorised.
```

That's the first pass requirement of this module in miniature: **a guest with no password is rejected.** `mqttx_5f2b8a1c` is a client name made up by MQTTX; the number on your screen will be different. On the Pi, its last line is slightly different: `Client mqttx_5f2b8a1c disconnected, not authorised.`

### Step 4 — Knock with a username and password (5 minutes)

Edit the `Key practice` connection in MQTTX: fill in **Username** `registered-guest` and **Password** with the password from Step 1, save it, then click **Connect** again.

**Expected output:** a green **`Connected`** notice. The broker terminal writes (**example**, laptop):

```text
1792721585: New client connected from 127.0.0.1:53481 as mqttx_5f2b8a1c (p5, c1, k60, u'registered-guest').
```

`u'registered-guest'` is the username MQTTX carries, and `p5` means MQTT 5, MQTTX's default version. Try it once with a **wrong** password too: the answer is again `Error: Connection refused: Not authorized`, exactly the same as with no password. The broker deliberately doesn't tell you which part was wrong.

When you're done practicing, clean up:

1. In MQTTX, click **Disconnect**, then delete the `Key practice` connection (right-click its name in the left list → **Delete**).
2. Stop the practice broker with **Ctrl + C** in its terminal.
3. Delete the `key-practice` folder and its contents (laptop path: right-click the folder in the Explorer panel → **Delete**; device path: `cd ~ && rm -r ~/key-practice`). The practice password file doesn't need to be kept, let alone put into Git.

Just three lines of settings make the broker reject guests without a password. Practice 4 installs the same three lines on the real broker, but only **after** every resident of the house, that is, the backend, Node 1, the tools, and Node-RED, holds its own key.

> ➡️ **Next:** read Concepts 1–3, then do [Practice 1 — The registry and device keys](#practice-1--the-registry-and-device-keys-60-minutes).

## 🧠 The "Why" Concepts

There are ten concepts. You don't have to read them all before practicing. The order:

1. The Quick Win (you've done it) → Concepts 1–3 → Practice 1 (the registry and device keys)
2. Concept 4 → Practice 2 (the second layer and a broker account for the backend)
3. Concept 5 → Practice 3 (Node 1 and the tools install their keys)
4. Concept 6 → Practice 4 (locking the broker's door)
5. Concepts 7–8 → Practice 5 (the access list) and Practice 6 (the intruder)
6. Concept 9 → Practice 7 (revoking a key)
7. Concept 10 → Practice 8 (honest about encryption, and the pass tests)

The ⬆️/➡️ boxes at the end of every practice and at the end of every group of concepts above take you to the next step. The code and settings snippets in the concept section only need to be read: they are all written and run in the practices.

### 1. Device threat model: who can impersonate Node 1

In Module 11 you pictured the broker as a **post office** in the middle of the house: a device drops off a letter (a message) with an address (a topic), and anyone subscribed to that address receives a copy. Until this week, that post office was very friendly. It accepted letters from **anyone**, with **any sender name**, for **any address**, without ever asking for an ID card.

The Module 20 threat model (Concept 1) now needs one extra column: devices and the broker.

| Who might mess around | Through which door | The consequence | This week's lock |
| :--- | :--- | :--- | :--- |
| A guest connected to your home Wi-Fi, or a younger sibling who installs MQTTX on their phone | The broker on port 1883, with no name or password | The pump turns on through `cmd` without going through the backend; fake readings are stored in the database and used by automation rules | Broker accounts and `allow_anonymous false` (Concept 6) |
| A test board with a valid account, but programmed to claim it's Node 1 | Node 1's topics and Node 1's client name | Fake readings on behalf of Node 1, and the real Node 1 kicked off the broker | An access control list (ACL) with the `%u` pattern, and `use_username_as_clientid` (Concepts 7–8) |
| A device that has never been registered, for example an old simulator or a forgotten test board | The broker, then the backend | Foreign data gets stored too and shows up like your home's data | The registry in the backend and the second layer (Concepts 3–4) |
| Someone holding a lost or stolen board | The key stored inside that board | They can get into the broker on behalf of that device from anywhere on your network | Revoking just that device's key (Concept 9) |
| A sniffer connected to the same Wi-Fi | MQTT traffic that isn't encrypted yet | The username and key are readable | **Not locked this week**; discussed honestly in Concept 10, fixed with TLS in Module 27 |

The first row is the most urgent. As long as the broker accepts guests with no name, all of Module 20's locks only guard the front door, while the side door is wide open. This week that side door is locked with the same four principles as Module 20: **locked by default**, **least privilege**, **defense in depth**, and **secrets never live in the code**.

There's one thing to say honestly. Your home Wi-Fi already uses a Wi-Fi password and WPA2 or WPA3 encryption, so someone outside the house who doesn't know the Wi-Fi password can't connect or eavesdrop. What's guarded this week are the people and devices **already** inside your network: the guest you gave the Wi-Fi password to, the cheap device you installed, and your own test board.

### 2. A key of its own for every device

A human logs in with an email and a password, then holds a 15-minute wristband (Module 20). That approach doesn't fit a device:

- **No one is typing.** Node 1 runs 24 hours a day and reconnects by itself every time the Wi-Fi or the broker comes back. It can't open a *login* form.
- **A device holds its secret all the time.** A wristband that expires every 15 minutes and a season pass in a *cookie* are browser tools. A device just holds one fixed secret, and shows it every time it connects to the broker.
- **One device, one key.** If every device uses one shared password, one lost board forces you to change the password on every device. With a per-device key, you just revoke the lost board's key; the others keep running.

This device-owned secret is called a **device key**. In industry, a secret like this is usually called an ***API key***. Its shape you know from Module 20: **32 random *bytes* written as 43 *base64url* characters**, the same recipe as `JWT_SECRET` and the season pass. A device's username at the broker is its own `device_id`, for example `a4cf12e5b7c0`, as the data contract has promised since Module 11.

The backend doesn't store that key. The database only stores its **SHA-256 fingerprint**, 64 hexadecimal characters in the `key_hash` column. In Module 20 (Concept 3), a human password is stored with bcrypt, which is slow on purpose because humans choose guessable passwords. A device key isn't chosen by a human: it's taken from 2<sup>256</sup> possibilities. SHA-256 is fast, about 100,000 guesses in half a second on the author's laptop (Module 20). But guessing one key still takes far longer than the age of the universe, even if every computer in the world joined in. So fast SHA-256 is enough, exactly like the season pass in the `sessions` table.

That key has only three copies, and each has a reason:

| Where | What's stored | Why |
| :--- | :--- | :--- |
| **The backend** (the `devices` table) | A SHA-256 fingerprint | The official registry: who is registered, since when, and whether their key has been revoked |
| **The broker** (Mosquitto's password file) | A fingerprint made by Mosquitto itself | The broker checks the key every time a device connects (Concept 6) |
| **The device** (Node 1's NVS or the simulator's `tools/.env`) | **The key itself** | The device must be able to present the real key (Concept 5) |

The table above is where the key (or its fingerprint) is **stored**. You **install by hand** only two of them: the broker password file and the device. The backend has held the fingerprint since it made it, so you never paste the key there.

Once made, the key is shown only **once**, in the answer when the device is registered. Because you have to copy it to the broker password file and to the device, keep your copy in your **password manager** (the same place as your Module 20 passwords) until both are installed. A password manager is exactly the tool for that. So the **exact same** key ends up in three places: your password manager, the broker password file, and the device. Outside those, and the prompt where you paste it, the key must not exist: not in the code, Git, a Bruno `.yml` file, a log, learning notes, a *chat*, or a screenshot.

### 3. The registry and simple provisioning

Giving a new device its identity, key, and rights is called ***provisioning*** (setting up the device). A factory that makes thousands of devices uses a dedicated service for this (🔬 "*Provisioning* in industry"). Mini Smart Home gets by with a simple three-step way:

1. **The backend registers the device.** The admin sends `POST /devices` with the device's `device_id` (Node 1 prints it in the Serial Monitor through the `info` command). The backend makes a random key, stores its fingerprint, and answers with the key plus a list of next `steps`. That answer is the only chance to see the key.
2. **The device is given the key.** The admin types `key <value>` in Node 1's Serial Monitor (or writes one line in `tools/.env` for the simulator). The key is stored in NVS and used every time it connects.
3. **The broker is told.** On the machine where the broker runs (the Pi, or the laptop for the laptop path), the admin runs `mosquitto_passwd` and pastes the same key. Mosquitto stores its fingerprint in the password file. (This week, the last two steps are done for all devices at once: the devices install their keys in Practice 3, then the broker is locked in Practice 4.)

![Simple provisioning diagram: one device key, three steps, Concept 3. Example Node 1 a4cf12e5b7c0; the key is made by the backend, then installed on the device and at the broker. Three numbered columns from left to right, joined by arrows. Column 1, with a green ribbon: the backend registers the device, on the laptop, the admin through Bruno. The admin sends POST /devices with the JSON body device_id a4cf12e5b7c0. An arrow down: a 43-character random key, drawn as a key capsule holding the fragment J2B and an ellipsis, the first three characters of this module's example key; made with randomBytes(32) and written as base64url. An arrow to the blue database box: the devices table, the key_hash column, holding a SHA-256 fingerprint, 64 hexadecimal characters; the key itself is not stored. An arrow to the 201 answer, the key shown once, with the JSON body device_id a4cf12e5b7c0, key J2B and so on, plus steps; the steps are what to do next on the device and at the broker. Column 2, with a gray ribbon: the device is given the key, through Node 1's Serial Monitor. The admin types key followed by the key capsule J2B, then Enter. The Serial Monitor answers: Broker key saved to NVS (43 chars); the key itself is never printed in full. An arrow to the Node 1 NVS box, the label broker_key, which stays through a restart and when new firmware is uploaded. An arrow to: every time it connects to the broker, Node 1 uses the username a4cf12e5b7c0 and a password that is the key J2B; the broker matches it against the password file (Concept 6). Note: the simulator on the laptop path uses one line in tools/.env, for example KEY_F00D00000001= followed by the key. Column 3, with a teal ribbon: the broker is told, on the machine where the broker runs (the Pi gateway). The admin runs sudo mosquitto_passwd /etc/mosquitto/broker-passwd a4cf12e5b7c0, then pastes the same key at two questions, Password and Reenter password, each with the key capsule J2B; the pasted characters don't show at all. An arrow to the teal box: the broker-passwd password file gets one line, a4cf12e5b7c0:$7$101$Bv3VQb7kNVkOTXCK$0qxDdhLe and so on, that is, a fingerprint made by Mosquitto, not the key. An arrow to the command that reloads the broker so the file is read again: sudo systemctl reload mosquitto. Note: Mosquitto can't read the backend database, it only knows its own file, so the two lists can disagree; the patches are the steps in the API answer and the second layer in the backend (Concept 4). Below, a three-copies box, each with its reason: the backend stores the SHA-256 fingerprint as the official registry, that is, who is registered, since when, and whether their key has been revoked; the device stores its own key in Node 1's NVS or the simulator's tools/.env, because it must be able to present the real key; the broker stores a fingerprint made by Mosquitto itself to check the key every time a device connects. A padlocked ribbon: outside those three places, the key must not exist, not in the code, Git, a log, learning notes, or a screenshot. The dashed box at the very bottom: Node 2 246f28b1c7d4 is registered without a key, with linked_via a4cf12e5b7c0 (Node 1), because it never connects to the broker; the backend's answer holds access-list lines for Node 1, under user a4cf12e5b7c0: topic write msh/246f28b1c7d4/telemetry and a similar line ending in /status.](assets/device-key-flow.png)

Node 2 is a little different. It never connects to the broker: Node 1 has published its data on its behalf since Module 14. So Node 2 is registered **without a key**, with a `linked_via` field holding Node 1's `device_id`. The backend then answers with three access-list lines (`user <Node 1>` plus two `topic write` lines) that let Node 1 write to Node 2's topics (Concept 7).

You might ask, why are there two lists: the registry in the backend and the password file at the broker? The answer is that Mosquitto can't read our database. It only knows its own file. As a result, the two lists can disagree, for example because you forgot to run `mosquitto_passwd`. There are two patches for that: the API answer always writes the `steps` to do at the broker, and the backend has a second layer (Concept 4). The way to make the backend write Mosquitto's password file itself is 🧩 Level 3, and the way to have no file at all is discussed in 🔬 "Mosquitto *dynamic security*".

### 4. The second layer: the backend only listens to registered devices

Since Module 17, the backend has had a friendly but dangerous habit: every time a message arrives from a `device_id` it doesn't know yet, it **creates a new row** in the `devices` table (`INSERT … ON CONFLICT` in `db/archive.ts`). Its guest book writes down the name of anyone who passes by. That made Modules 16–20 easier, but it also means a device that claims to be one is treated as a member of the house right away.

From this week on, that guest book is only **read**. The backend loads the registry from the `devices` table when it starts, then checks every message that comes in:

| The device's state | Its message |
| :--- | :--- |
| **Registered**, its key active (or with no key because it goes via a linking device, like Node 2) | Processed as usual: stored, broadcast over Socket.IO, used by automation rules, and forwarded to Telegram |
| **Not registered**, including old rows from Modules 17–20 that haven't been claimed | **Ignored**, and the log writes `IGNORED … is not registered`, at most once a minute per device |
| **Its key is revoked** | **Ignored**, with the log `IGNORED … its key has been revoked` |
| The registry can't be read yet, for example the database isn't up | **All ignored** until the registry is read; the backend retries every 10 seconds |

The last row is called **failing closed** (*fail closed*): when in doubt, refuse. It's better to lose a few readings while the database is down than to accept every message without checking. The number of ignored messages is also visible in `GET /health` as `ignored`.

Why does the backend need to check again if the broker already checks? Because security comes in layers. The broker's settings can be wrong, for example an access list with a typo (Concept 9), and a revocation in the backend takes effect **at once**, even before you've had a chance to change the password file at the broker. If one layer fails, another still holds.

Old rows in the `devices` table aren't deleted. Their reading history stays and can still be viewed. When that device is registered, its row is "claimed" and its messages are listened to again.

> ⬆️ **Done reading Concepts 1–4?** Continue to [Practice 1 — The registry and device keys](#practice-1--the-registry-and-device-keys-60-minutes), then [Practice 2](#practice-2--the-second-layer-and-a-broker-account-for-the-backend-45-minutes). Concept 5 is waiting for you before Practice 3.

### 5. The key inside the device: NVS, the Serial Monitor, and its limits

A device has to hold its real key, because that key is what it shows the broker. The question is: **where to store it?**

- **Not in the code.** Node 1's firmware code is in the public `mini-smart-home` repository. A key written in `config.h` gets pushed to GitHub along with it, and every board uploaded from that code uses the same key. Two mistakes at once.
- **In NVS** (*Non-Volatile Storage*), memory that isn't lost when the power goes out, which you know from Module 8 and used for the fan threshold in Module 19. The NVS contents stay when the board is restarted, and also when you upload new firmware from the Arduino IDE, as long as the **Erase All Flash Before Sketch Upload** option stays **Disabled** (that's the default).

Firmware v1.6.0 adds three Serial Monitor commands:

| Command | What it does |
| :--- | :--- |
| `key` | Shows the key's **state** without revealing its contents: its length, plus its last four characters if the key is long (16 characters or more) |
| `key <value>` | Stores the key in NVS, then immediately tries to connect to the broker again with that key |
| `key clear` | Removes the key from NVS |

The firmware **never prints the key in full**, because the Serial Monitor's contents are often copied to a forum or a group when people ask for help. The key's upper and lower case is also kept as is: `Ab` and `aB` are two different keys.

There's one new habit when the broker rejects it. Normally Node 1 tries to reconnect every 5 seconds, because a broker that's down does eventually come back up. A wrong key won't become right on its own. So, once the broker answers "not authorized", Node 1 writes `MQTT REJECTED by broker (code 5)` in the Serial Monitor, shows `OFFLINE: MQTT DENIED` on the display, and only retries **every 60 seconds**. That way the broker log isn't flooded with attempts that are certain to fail. The device simulator and the backend behave the same way.

The device simulator (laptop path) has no NVS. Its key is written in `tools/.env`, one line per practice device, for example `KEY_F00D00000001=…`. That file has been ignored by Git since Module 20.

You should know its limit too: **anyone who holds the board can read NVS**. Just connect a USB cable and copy the whole flash contents with a tool like esptool. That's why every device gets its own key that can be revoked one at a time (Concept 9). The ESP32 feature that scrambles the flash contents so they can't be read is discussed in 🔬 "*Secure boot* and *flash encryption*", but it isn't tried on the main board because it's permanent.

> ⬆️ **Done reading Concept 5?** Continue to [Practice 3 — Node 1 and the tools install their keys](#practice-3--node-1-and-the-tools-install-their-keys-60-minutes).

### 6. The broker's doorkeeper: a password file and one account per program

Mosquitto can guard its own door. Just two lines of settings:

```text
allow_anonymous false
password_file /etc/mosquitto/broker-passwd
```

The first line forbids guests with no username. The second points to the **password file**, a list of usernames with their password fingerprints. That file is never written by hand. The tool **`mosquitto_passwd`**, installed together with Mosquitto, asks for the password twice then writes one line like this (**example**, the fingerprint shortened):

```text
a4cf12e5b7c0:$7$101$Bv3VQb7kNVkOTXCK$0qxDdhLe…
```

`$7$` is the recipe's name (PBKDF2-SHA512), `101` the number of rounds, then the random salt and the fingerprint, exactly the Module 20 idea (Concept 3). Mosquitto 2.0.21 on the Pi uses 101 rounds and a 12-*byte* salt. Mosquitto 2.1.2 on the laptop uses 1,000 rounds and a 64-*byte* salt, and that new form is **not recognized** by Mosquitto 2.0.21. So **the password file is always made on the machine where the broker runs**, not on the laptop and then copied to the Pi.

When a client connects, the broker matches its username and password against that file. Whatever is wrong — no username, an unknown name, or a wrong password — the answer is always the same: **code 5, `Not authorized`** (in MQTT 5: `0x87`). The broker deliberately doesn't tell you which part was wrong, just like the `wrong email or password` message in Module 20. The broker log on the Pi records it, for example `Client a4cf12e5b7c0 disconnected, not authorised.`

Who needs an account? **Every program that connects to the broker gets its own account**:

| Account | Used by | Its rights after Practice 5 |
| :--- | :--- | :--- |
| `backend` | backend v1.0 | reads all of `msh/#`, writes commands to `msh/+/cmd` |
| `nodered` | Node-RED on the Pi (device path) | the same as `backend`: the dashboard reads, the Fan switch sends commands |
| `monitor` | MQTTX | only reads `msh/#` (and `$SYS/#`, the broker's health data) |
| `checker` | `tools/contract-checker.js` | only reads `msh/#` |
| `a4cf12e5b7c0` | Node 1 (your `device_id`) | its own topic, plus Node 2's `telemetry` and `status` |
| `f00d00000001` | the simulator: the practice device, on all paths | its own topic |

Why not one "admin" account for everything? Because of **least privilege**: MQTTX, which is only for peeking, doesn't need to be allowed to turn the pump on. Besides, separate accounts can be revoked separately, and there's a third reason that comes up in Concept 8: two programs that use the same account kick each other off.

One thing about the order. Once `allow_anonymous false` is in effect, every program without an account is rejected at once. That's why Practices 1–3 install the keys in the backend, the devices, and the tools first, and Practice 4 creates all the accounts at the broker **before** locking its door. While `password_file` isn't installed yet, a broker that's still open doesn't check the name and password a client carries, so nothing is cut off.

![Broker doorkeeper diagram, with two questions: Who are you?, then What are you allowed to do?, Concepts 6 to 8. The password file is checked when connecting; the access list is checked for every message sent. Three cards. Left, with a teal post-office icon: broker door 1883, the doorkeeper's three jobs, Mosquitto with allow_anonymous false. A flow line comes down from a CONNECT packet capsule, which carries the client name, the username, and the password. Step 1, Who are you?: the username and password are matched against the broker-passwd password file; a branch goes off to the red code-5 capsule. Red box: with no username, an unknown name, or a wrong password, the answer is always the same, code 5 Not authorized (MQTT 5: 0x87); the broker log on the Pi: Client … disconnected, not authorised. Step 2, the client name is replaced by the username, use_username_as_clientid true: the intruder c0ba00000001 that claims to be a4cf12e5b7c0 is still recorded as c0ba00000001, so no one is kicked off; the %c and %u patterns then point to the same device. Green capsule: passed, connected. After a dashed line, a capsule for every PUBLISH packet, holding the topic and the message content. Step 3, What are you allowed to do?: the topic is matched against the acl-broker access list; a branch goes off to the red discarded capsule. Red box: discarded silently, the sender isn't disconnected; MQTTX (MQTT 5, QoS 1) shows Publish error: Not authorized; a debug-level log records Denied PUBLISH from and so on. Green capsule: passed, forwarded to the subscribers. Middle card: the access list, the %u pattern, Concept 7; everything not mentioned is forbidden. A teal box holds pattern write msh/%u/telemetry. %u is the username already proven with a password; a pattern line applies to all accounts. A green-framed card, Node 1, account a4cf12e5b7c0: that line reads write msh/a4cf12e5b7c0/telemetry for it; it writes to msh/a4cf12e5b7c0/telemetry; green check, matches, forwarded to the subscribers. A red-framed card, the intruder, with a gray board icon, account c0ba00000001: that line reads write msh/c0ba00000001/telemetry for it; it writes to msh/a4cf12e5b7c0/telemetry; red cross, doesn't match, discarded silently. A gray box: a subscription is never refused; an intruder that subscribes to msh/# still gets a successful answer; what is filtered is every message, as it is about to be sent to it, so it only receives messages it is allowed to read, that is, its own cmd, and receives nothing from Node 1. Right card: one account per program, Concept 6, its rights after Practice 5, each account with its user's icon. backend, used by backend v1.0: reads all of msh/#, writes commands to msh/+/cmd. nodered, used by Node-RED on the Pi (device path): the same as backend, the dashboard reads and the Fan switch sends commands. monitor, used by MQTTX: only reads msh/# (and $SYS/#, the broker's health data). checker, used by tools/contract-checker.js: only reads msh/#. a4cf12e5b7c0, used by Node 1 (your device_id): its own topic, plus Node 2's telemetry and status. f00d00000001, used by the simulator (laptop path): its own topic. A teal box, why one account per program: least privilege, because MQTTX for peeking doesn't need to be allowed to turn the pump on; it can be revoked separately; and two programs with one account kick each other off.](assets/broker-doorkeeper.png)

> ⬆️ **Done reading Concept 6?** Continue to [Practice 4 — Locking the broker's door](#practice-4--locking-the-brokers-door-60-minutes).

### 7. The access control list (ACL): every device on its own topic

The password file answers the question **"Who are you?"** (authentication). The second question, **"What are you allowed to do?"** (authorization), is answered by the **access control list** (*Access Control List*, ACL). This pair is the same as 401 versus 403 in Module 20 (Concept 2), only this time at the broker.

The access list is a plain text file. Mosquitto reads it from top to bottom, and **everything not mentioned is forbidden**. The heart of the Mini Smart Home access list is just five lines:

```text
pattern write msh/%u/telemetry
pattern write msh/%u/status
pattern write msh/%u/vitals
pattern write msh/%u/ack
pattern read msh/%u/cmd
```

A `pattern` line applies to **all accounts**, and `%u` is replaced by the **username already proven with a password**. For the account `a4cf12e5b7c0`, the first line reads `write msh/a4cf12e5b7c0/telemetry`: Node 1 may write readings **to its own topic**. For the intruder account `c0ba00000001`, the same line reads `write msh/c0ba00000001/telemetry`. That intruder may write readings on its own behalf, but not on behalf of Node 1:

| Account | Tries | Result |
| :--- | :--- | :--- |
| `a4cf12e5b7c0` (Node 1) | writing to `msh/a4cf12e5b7c0/telemetry` | ✅ matches `pattern write msh/%u/telemetry` |
| `a4cf12e5b7c0` (Node 1) | reading `msh/a4cf12e5b7c0/cmd` | ✅ matches `pattern read msh/%u/cmd` |
| `c0ba00000001` (the intruder) | writing to `msh/a4cf12e5b7c0/telemetry` | ❌ no line matches, so it's forbidden |
| `c0ba00000001` (the intruder) | writing to `msh/a4cf12e5b7c0/cmd` | ❌ forbidden; a device may not even write to its own `cmd` |
| `monitor` (MQTTX) | writing to `msh/a4cf12e5b7c0/cmd` | ❌ forbidden; `monitor` may only read |

Accounts other than devices get their own `user` line. The `topic` lines below it apply only to that account, until the next `user` line:

```text
user backend
topic read msh/#
topic write msh/+/cmd
```

The Node 2 exception is also written this way, under Node 1's `user` line (your own `device_id` is of course different):

```text
user a4cf12e5b7c0
topic write msh/246f28b1c7d4/telemetry
topic write msh/246f28b1c7d4/status
```

So what happens when an intruder writes to a forbidden topic? **The broker discards the message silently.** The sender isn't disconnected, and in MQTT 3.1.1, the version Node 1 uses, the sender doesn't even know its message was discarded. There are only three signs:

- **MQTTX**, which uses MQTT 5, gets the answer `Publish error: Not authorized`, but only for QoS 1 messages (Module 11 Concept 6). A QoS 0 message gets no answer at all.
- **The broker log** records `Denied PUBLISH from …`, but only if the broker is asked to log at the **`debug`** level. The Pi's default settings don't log that level, so this week's `gateway-pi.conf` adds `log_type` lines.
- **Nothing arrives.** Subscribers to `msh/a4cf12e5b7c0/telemetry`, including the backend, never receive that fake message.

A subscription is treated a little differently. Mosquitto's access list **never refuses a subscription**: an intruder that subscribes to `msh/#` still gets a "success" answer. What's filtered is every message as it's about to be sent to it. As a result, it only receives messages it's allowed to read, that is, its own `cmd`, and receives nothing from Node 1.

> ⬆️ **Done reading Concept 7?** Also read Concept 8 before [Practice 5 — The access control list](#practice-5--the-access-control-list-every-device-on-its-own-topic-45-minutes), because the two are installed together.

### 8. Client IDs can be faked: `use_username_as_clientid`

Every MQTT client chooses its own **client name** (*client ID*). Node 1 has used its `device_id` since Module 11. The broker has one rule about client names: **one name, one connection**. If a second client connects with the same name, the first is kicked off. You saw it in Module 11 (Concept 5) when two MQTTX windows used the same client name and kicked each other off.

That rule can be abused. An intruder with a valid account, for example `c0ba00000001`, just connects with the client name `a4cf12e5b7c0`. There are two consequences:

1. **The real Node 1 is kicked off** the broker. As soon as Node 1 reconnects, it's the intruder's turn to be kicked off, and the two can keep kicking each other off endlessly.
2. If the access list uses the **`%c`** pattern (the client name) instead of `%u` (the username), that intruder may also **write to Node 1's topic**, because its client name really is `a4cf12e5b7c0`. A client name isn't proven with a password; a username is.

This curriculum's syllabus originally wrote "an ACL with the `%c` pattern". While this module was being prepared, the Mosquitto source code and testing revealed the gap above, so this module uses the **`%u` pattern** and adds one setting line that closes the second gap:

```text
use_username_as_clientid true
```

With this line, the broker **replaces every guest's client name with its username**. The intruder `c0ba00000001` that claims to be named `a4cf12e5b7c0` is still recorded as `c0ba00000001`, so no one is kicked off. The `%c` and `%u` patterns then point to the same device, and the Syllabus was changed slightly to record this decision.

This line has one consequence to remember: every program's client name is now the same as **its account name**. The backend is recorded as `backend`, MQTTX as `monitor`, and so on. Two programs that use the same account kick each other off. That's the third reason for **one account per program** (Concept 6): don't open two MQTTX connections with the `monitor` account at the same time.

`use_username_as_clientid` is a `listener` setting, so it's written **below** the `listener 1883` line. Mosquitto also doesn't re-read it on a *reload*, so adding it requires a restart.

> ⬆️ **Done reading Concepts 7–8?** Continue to [Practice 5 — The access control list](#practice-5--the-access-control-list-every-device-on-its-own-topic-45-minutes), then [Practice 6 — The intruder is rejected and logged](#practice-6--the-intruder-is-rejected-and-logged-40-minutes).

### 9. Revoking a lost device's key

Imagine the Node 1 board is lost, or a test board you once gave a key is lent to a friend. The key inside it is still valid. Revoking it is done in **two layers**, exactly the way the key was installed:

1. **The backend: effective at once.** The admin sends `POST /devices/:id/revoke`. The backend removes the key fingerprint and records the revocation time. From that second on, every message from that device is ignored (`IGNORED … its key has been revoked`), and a command to that device is answered **409**.
2. **The broker: closing its door.** On the broker machine, the admin removes its account with `mosquitto_passwd -D`, then reloads the broker. According to the Mosquitto source code, when it reloads the password file, the broker checks all currently connected clients again and **disconnects** any whose account no longer exists. That device then tries to reconnect and is answered `Not authorized`.

![Diagram of revoking a lost device's key: two layers, Concept 9. Example: the Node 1 board a4cf12e5b7c0 is lost; the key is revoked in two places, exactly the way it was installed. Left, a timeline from top to bottom. The start: the Node 1 board is lost, or a test board is lent to a friend; the key inside it is still valid, and whoever holds it can get into the broker on behalf of Node 1. Step 1, green card Layer 1, the backend, effective at once: the admin sends POST /devices/a4cf12e5b7c0/revoke; the backend removes the key fingerprint and records the revocation time. From that second on, messages from that device are logged IGNORED … its key has been revoked, and a command to that device, the answer to POST /devices/:id/command, is 409. Step 2, teal card Layer 2, the broker, closing its door: on the broker machine (the Pi), remove its account then reload, with sudo mosquitto_passwd -D /etc/mosquitto/broker-passwd a4cf12e5b7c0 and sudo systemctl reload mosquitto. According to the Mosquitto source code, all connected clients are checked again, and Node 1 is disconnected; the next attempt is answered with code 5, Not authorized; Node 1 writes MQTT REJECTED by broker (code 5) and retries every 60 seconds. Yellow box: the offline will isn't sent when the account is revoked, so the retained status can stay online; a device's official state is seen in GET /devices, the key column reads revoked, not in status. The last step, marked with a green check: recovery once the board turns up, and don't use its old key again. 1, backend: POST /devices/a4cf12e5b7c0/key makes a new key; 2, broker: mosquitto_passwd with the new key, then reload the broker; 3, device: key followed by the new key's contents, in Node 1's Serial Monitor; the old key may already have been copied. Right, a reload-or-restart card, two different ways. Reload: if what changed is the password file, that is, adding, changing, or removing an account with mosquitto_passwd; on the Pi sudo systemctl reload mosquitto; valid connections aren't cut off. Restart: if what changed is the access list, or a setting like use_username_as_clientid; on the Pi sudo systemctl restart mosquitto; all clients reconnect within a few seconds. Red box, why the access list needs a restart: according to its source code, Mosquitto 2.0.21 (the Pi) that reloads an access list with a typo keeps running with no access list at all, so every account may write anywhere, and the only sign is two Error lines in the log; with a restart, a bad file makes the broker fail to start, so the mistake is seen at once. Gray box, on the laptop: for both, just stop the broker, then start it again.](assets/two-layer-revocation.png)

There's one small consequence to know. According to the Mosquitto source code, a device disconnected because its account was revoked is **not** sent its `offline` will (*Last Will*). Its retained `status` message can stay `online`. That's why a device's official state is read from the registry (`GET /devices`, the `key` column: `revoked`), not from `status`.

To restore a device that has turned up, don't use its old key again, because it may already have been copied. Send `POST /devices/:id/key` to make a **new key**, add its account at the broker again with that new key, then type `key <new value>` on the device.

**Reload or restart?** The two are different:

| What changed | How | Why |
| :--- | :--- | :--- |
| The password file (adding, changing, or removing an account with `mosquitto_passwd`) | **Reload**: on the Pi `sudo systemctl reload mosquitto`. Valid connections aren't cut off. | `mosquitto_passwd` always writes a correct line, so there's no risk of a broken file. |
| The access list, or a setting like `use_username_as_clientid` | **Restart**: on the Pi `sudo systemctl restart mosquitto`. All clients reconnect within a few seconds. | `use_username_as_clientid` isn't reloaded. More importantly, according to its source code, Mosquitto 2.0.21 that reloads an access list **with a typo** keeps running **with no access list at all**: every account may write anywhere, and the only sign is two `Error` lines in the log. With a restart, a bad file makes the broker fail to start, and that mistake is seen at once. |

On the laptop, this week's locked broker runs in a VS Code terminal (Practice 4), so for both kinds of change just use **Ctrl + C** in the broker terminal, then run it again. There's no difference between reload and restart there: the broker simply goes down for a moment, then all clients reconnect by themselves.

> ⬆️ **Done reading Concept 9?** Continue to [Practice 7 — Revoking a lost device's key](#practice-7--revoking-a-lost-devices-key-40-minutes).

### 10. Honest: traffic at home is still in the clear

All of this week's locks share one weakness: **the MQTT traffic on port 1883 isn't encrypted**. When Node 1 connects, its first packet, CONNECT, carries the client name, the username, and the key as plain *bytes*. Anyone who can see the traffic on your network can read that key. In Practice 8 you see it for yourself with the small tool `tools/sniffer.js`.

![Diagram of the device key inside the CONNECT packet: readable in the clear, Concept 10. MQTT on port 1883 isn't encrypted yet; Node 1's first packet carries the username and its key as they are. Top, three cards from left to right, joined by arrows labeled CONNECT and plain bytes: Node 1 a4cf12e5b7c0, which connects with its key; the sniffer, that is, anyone on the same path, and in Practice 8 tools/sniffer.js at 127.0.0.1:1884 that prints the CONNECT contents; and the broker, Mosquitto on port 1883, without encryption. Middle, Node 1's CONNECT packet (MQTT 3.1.1) byte by byte, 119 bytes in all, as a row of hexadecimal byte boxes with their meaning on the right: 10 75, packet type CONNECT, then 117 more bytes; 00 04 then 4d 51 54 54, the protocol name MQTT; 04, protocol version 4 equals MQTT 3.1.1; ee, flags: there is a username, a password, and a will; 00 0f, keep-alive 15 seconds; 00 0c then 61 34 63 66 31 32 and so on, the client name a4cf12e5b7c0; 00 17 then 6d 73 68 2f 61 34 and so on, the will topic msh/a4cf12e5b7c0/status; 00 07 then 6f 66 66 6c 69 6e 65, the will content offline; 00 0c then 61 34 63 66 31 32 and so on, the username a4cf12e5b7c0; and the line highlighted in red, 00 2b then 4a 32 42 and so on, the 43-character key J2BPlozrp88Z-rmVr2EnhfJkgOxAY3xxGYzVSjQejOE, readable in the clear. A key: a gray box is the two length bytes, 00 0c equals 12, 00 17 equals 23, and 00 2b equals 43 (warm-up step 5); a white box is the contents, each character one byte, for example 61 equals a and 34 equals 4; a red box is the device key, readable in full, with no key at all to unlock it (this module's example key). Bottom left, a yellow box, now: port 1883, the home network, still acceptable for the time being, because your home Wi-Fi is already encrypted between the device and the router (WPA2 or WPA3); the broker can't be knocked on from the internet, because there is no port forwarding to the Pi or your laptop; and so a sniffer must already be inside your network, which makes the risk real but small. Bottom right, a green padlocked box, Module 27: TLS, port 8883, required before the broker is opened to the internet: the whole connection is encrypted, including the CONNECT packet, so the key can't be read anymore; on the internet, messages pass through many networks owned by other people, and an open broker is knocked on by automatic password guessers every day; an even stronger way, a certificate for every device (mTLS), is discussed in the Technical Deep Dive.](assets/key-in-connect-packet.png)

So why is that still acceptable for the time being?

- **Your home Wi-Fi is already encrypted** between the device and the router (WPA2 or WPA3). Someone outside the house who doesn't know the Wi-Fi password can't eavesdrop.
- **The broker can't be knocked on from the internet.** There's no *port forwarding* to the Pi or your laptop, and this week's safety rules ask you to keep it that way.
- So a sniffer must **already be inside your network**. That risk is real, but small, and it's already reduced by per-device keys, the access list, and revocation.

Why must it be fixed before going to the internet? On the internet, messages pass through many networks owned by other people, and an open broker is knocked on by automatic password guessers every day. **Module 27** adds **TLS** (port 8883), so the whole connection, including the CONNECT packet, is encrypted. An even stronger way, a certificate for every device (mTLS), is discussed in 🔬.

To see the big picture, OWASP (a nonprofit in the field of application security) publishes the **OWASP IoT Top 10**, the 2018 edition, the ten most common IoT device security mistakes. Here is where Mini Smart Home stands after this module:

| No. | The mistake (its official name) | What it means | Mini Smart Home |
| :--- | :--- | :--- | :--- |
| I1 | *Weak, Guessable, or Hardcoded Passwords* | weak passwords, easy to guess, or embedded in the code | ✅ a random 43-character key per device, not in the code; human passwords at least 15 characters (Module 20) |
| I2 | *Insecure Network Services* | network services open without need | 🟡 the broker and backend are locked; the broker isn't TLS yet (Module 27) |
| I3 | *Insecure Ecosystem Interfaces* | a weak API, *web*, or companion app | ✅ login, roles, and the guard on the API (Module 20); the access list at the broker (this module) |
| I4 | *Lack of Secure Update Mechanism* | no safe way to update the firmware | ⏳ over-the-air (OTA) updates in Module 28 |
| I5 | *Use of Insecure or Outdated Components* | outdated or vulnerable components | 🟡 the `npm audit` and `apt full-upgrade` habits (Modules 12 and 16) |
| I6 | *Insufficient Privacy Protection* | personal data not protected | 🟡 user data kept to a minimum (Module 20); *live* data only for those logged in |
| I7 | *Insecure Data Transfer and Storage* | data sent or stored without protection | ❌ MQTT and HTTP traffic still in the clear (Module 27 and Phase 5); NVS not encrypted yet |
| I8 | *Lack of Device Management* | can't inventory and revoke devices | ✅ the registry and key revocation (this module); managing many devices in Module 28 |
| I9 | *Insecure Default Settings* | unsafe default settings | ✅ `allow_anonymous false` and locked by default (this module and Module 20) |
| I10 | *Lack of Physical Hardening* | the board is easy to open up and read | ⏳ discussed in 🔬 (*secure boot*, *flash encryption*); the device enclosure in Module 28 |

No system is "completely secure". What you can do is know exactly what's locked, what isn't, and when the rest will be fixed. The table above is your answer to that question.

> ⬆️ **Done reading Concept 10?** Continue to [Practice 8 — Honest about encryption, and the pass tests](#practice-8--honest-about-encryption-and-the-pass-tests-40-minutes).

## 🔧 Step-by-step practice

### Practice 1 — The registry and device keys (60 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal runs `npm run dev`, a second terminal in the `backend` folder for other commands), **Docker Desktop** (the `smarthome-db` container running), and **Bruno**.

This practice turns the backend into the **registry** of devices (Concept 3): the `devices` table gets key columns, the backend can make a 43-character key for every device, and messages from any device aren't filtered yet (that's Practice 2). The broker isn't touched at all.

#### 1.1 Prepare the working branch (2 minutes)

Open the `mini-smart-home` folder in VS Code. In the second terminal (the one not running anything yet), start from the latest `main`, then create a new branch:

```text
git switch main
git pull
git switch -c feature/device-security
```

Then go into the `backend` folder: `cd backend`. In the first terminal, start the backend as usual: go into the `backend` folder, then `npm run dev`. Leave it running during the practice; every time a `.ts` file is saved, the backend restarts by itself.

#### 1.2 Migration `010`: a place for keys in the `devices` table (8 minutes)

The table's shape is changed through a numbered migration, like Modules 17–20. Right-click the **`backend/migrations`** folder → **New File…**, name it **`010_device_keys.sql`**, then type:

```sql
-- 010_device_keys.sql - the official registry of devices and their keys (Module 21). Up to Module 20, a devices row was created
-- automatically for ANY device that sent a message. From Module 21 on, a device must be registered by an admin (POST /devices);
-- messages from a device that isn't registered or whose key has been revoked are ignored by the backend.
-- Number 009 is skipped on purpose: 009_user_in_commands.sql is the Level 3 Challenge of Module 20 you may already have made.

-- A device key (32 random bytes) is shown ONCE when it is made; the database stores only its SHA-256 (64 hexadecimal
-- characters), just like a refresh token in Module 20. An ESP-NOW device (Node 2) doesn't connect to the broker, so it has no
-- key: its data is published by its linking device (Node 1).
ALTER TABLE devices
  ADD COLUMN registered_at  timestamptz,                               -- when the admin registered it; NULL = not registered
  ADD COLUMN key_hash       text CHECK (key_hash ~ '^[0-9a-f]{64}$'),  -- SHA-256 of the key that is valid now
  ADD COLUMN key_created_at timestamptz,                               -- when that key was made (registration or key rotation)
  ADD COLUMN revoked_at     timestamptz,                               -- when it was revoked; NULL = allowed to send data
  ADD COLUMN linked_via     text REFERENCES devices (device_id),       -- the device that publishes its data (Node 2 -> Node 1)
  ADD CONSTRAINT devices_key_complete CHECK ((key_hash IS NULL) = (key_created_at IS NULL)),
  ADD CONSTRAINT devices_linked_via_without_key CHECK (linked_via IS NULL OR key_hash IS NULL),
  ADD CONSTRAINT devices_not_self_linked CHECK (linked_via <> device_id),
  ADD CONSTRAINT devices_revoked_without_key CHECK (revoked_at IS NULL OR key_hash IS NULL);

-- Old rows (auto-created in Modules 17-20) stay, together with their history, but they are not registered: their new data is
-- ignored until the admin registers that device_id (their history is not lost).
```

- **`ALTER TABLE devices ADD COLUMN …`** adds five columns to the existing table. Old rows aren't lost; the new columns are empty (`NULL`) for all old rows.
- **`registered_at`** holds the time a device was registered by an admin. Old rows auto-created in Modules 17–20 hold `NULL`, meaning **not registered**.
- **`key_hash`** only accepts exactly 64 hexadecimal characters (`CHECK (key_hash ~ '^[0-9a-f]{64}$')`), the shape of a SHA-256 fingerprint. If one day some code mistakenly tries to store the key itself, the database rejects it.
- **`revoked_at`** and **`linked_via`** are used in Practice 7 and for Node 2. `REFERENCES devices (device_id)` makes sure `linked_via` always points to a device that exists.
- Four **`CONSTRAINT … CHECK`** rules keep things sensible: the fingerprint and the time it was made always come as a pair, a device via a linking device has no key, a device may not be its own linking device, and a revoked device no longer has a key.

The number is `010`, not `009`: number 009 is skipped on purpose because it's used by 🧩 Level 3 of Module 20. If you didn't do it, that's fine; `npm run migrate` applies files in number order even if one is missing. Run in the second terminal:

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.5.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 010_device_keys.sql
1 new migration(s) applied, 7 applied earlier.
```

If you did 🧩 Level 3 of Module 20, its last line says `8 applied earlier`. Run it once more: this time `0 new migration(s) applied`, because a migration that's already recorded is never run twice.

#### 1.3 Keys and their fingerprints: `src/auth/key.ts` (5 minutes)

Right-click the **`backend/src/auth`** folder → **New File…**, name it **`key.ts`**, then type:

```ts
// key.ts - device keys (a per-device API key, Module 21). A key = 32 random bytes, shown ONCE when it is made, then used by
// the device as its MQTT broker password (and later for HTTP too, for example downloading firmware in Module 28). The database
// stores only its SHA-256: a random 256-bit key can't be guessed, so a fast hash is enough (bcrypt is only needed for
// human-made passwords, Module 20). A key is NEVER written to a log or to Git.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// the shape of a key: 43 base64url characters (A-Z, a-z, 0-9, - and _), safe to type in a terminal, Serial Monitor, and MQTTX
export const Key = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "device key must be 43 base64url characters");

export function makeKey(): string {
  return randomBytes(32).toString("base64url");
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex"); // 64 hexadecimal characters
}

// Does the key presented match the fingerprint in the database? The comparison is constant-time (timingSafeEqual): how long
// the answer takes doesn't depend on how many leading characters are already right, so it can't be guessed character by character.
// In Module 21 it is the broker (the password file) that checks the key; this function is for the backend later (Module 28).
export function matchKey(key: string, keyHash: string | null): boolean {
  if (keyHash === null) return false; // a device with no key (revoked, or Node 2 via Node 1)
  const given = Buffer.from(hashKey(key), "hex");
  const stored = Buffer.from(keyHash, "hex");
  return given.length === stored.length && timingSafeEqual(given, stored);
}
```

Its contents are the same as warm-up steps 1 and 2, in TypeScript:

- **`Key`** is a Zod schema with the same text pattern as `keyShape` in the warm-up. Its error message is friendly: `device key must be 43 base64url characters`.
- **`makeKey()`** and **`hashKey()`** are `randomBytes(32).toString("base64url")` and hexadecimal SHA-256.
- **`matchKey()`** compares with `timingSafeEqual`. Its comment explains that this week it isn't used by any route yet, because it's the broker that checks keys. It's already prepared for 🧩 Level 2 and Module 28.

#### 1.4 The registry in the database: `src/db/devices.ts` (8 minutes)

Right-click the **`backend/src/db`** folder → **New File…**, name it **`devices.ts`**, then type:

```ts
// devices.ts - the official device registry in the devices table (Module 21, migration 010): registration by an admin, key
// rotation, revocation. The key fingerprint (key_hash) is ONLY WRITTEN from this file; the device list never reads it.
import { pool } from "./pool.ts";

// one row of the device registry as GET /devices shows it (without the key fingerprint)
export interface DeviceRow {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  name: string | null;
  location: string | null;
  status: string;
  last_seen: Date | null;
  registered_at: Date | null;
  key_created_at: Date | null;
  revoked_at: Date | null;
  linked_via: string | null;
}

const COLUMNS = "device_id, kind, name, location, status, last_seen, registered_at, key_created_at, revoked_at, linked_via";

export async function allDevicesDb(): Promise<DeviceRow[]> {
  const result = await pool.query<DeviceRow>(`SELECT ${COLUMNS} FROM devices ORDER BY device_id`);
  return result.rows;
}

// Register a device. A device_id that already has an old row (auto-created in Modules 17-20) is "claimed": its history stays.
// The result is undefined if that device_id is ALREADY registered (use key rotation, not a second registration).
export async function registerDevice(deviceId: string, name: string | null, location: string | null,
  linkedVia: string | null, keyHash: string | null): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `INSERT INTO devices (device_id, kind, name, location, linked_via, registered_at, key_hash, key_created_at)
     VALUES ($1, CASE WHEN $4::text IS NULL THEN 'unknown' ELSE 'node2' END, $2, $3, $4, now(), $5,
             CASE WHEN $5::text IS NULL THEN NULL ELSE now() END)
     ON CONFLICT (device_id) DO UPDATE SET
       name = coalesce($2, devices.name),
       location = coalesce($3, devices.location),
       kind = CASE WHEN $4::text IS NULL THEN devices.kind ELSE 'node2' END,
       linked_via = $4, registered_at = now(), key_hash = $5, key_created_at = EXCLUDED.key_created_at, revoked_at = NULL
     WHERE devices.registered_at IS NULL
     RETURNING ${COLUMNS}`,
    [deviceId, name, location, linkedVia, keyHash],
  );
  return result.rows[0];
}

// A new key for a registered device that connects to the broker (also brings a revoked device back to life).
export async function rotateDeviceKey(deviceId: string, keyHash: string): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `UPDATE devices SET key_hash = $2, key_created_at = now(), revoked_at = NULL
     WHERE device_id = $1 AND registered_at IS NOT NULL AND linked_via IS NULL
     RETURNING ${COLUMNS}`,
    [deviceId, keyHash],
  );
  return result.rows[0];
}

// Revoke: the key fingerprint is removed, the revocation time is recorded. The result is undefined if it isn't registered or already revoked.
export async function revokeDevice(deviceId: string): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `UPDATE devices SET key_hash = NULL, key_created_at = NULL, revoked_at = now()
     WHERE device_id = $1 AND registered_at IS NOT NULL AND revoked_at IS NULL
     RETURNING ${COLUMNS}`,
    [deviceId],
  );
  return result.rows[0];
}
```

- **`allDevicesDb()`** reads all the `devices` rows. Notice its column list (`COLUMNS`): `key_hash` **isn't included**. The key fingerprint is only ever **written** from this file, never read to be displayed.
- **`registerDevice()`** uses `INSERT … ON CONFLICT (device_id) DO UPDATE … WHERE devices.registered_at IS NULL`. That is: if that `device_id` doesn't exist yet, create a new row; if it exists as an old **unregistered** row, "claim" that row (its reading history stays); if it's already **registered**, change nothing. In that last case, `RETURNING` returns no row, so the function produces `undefined`, and the route then answers 409.
- **`rotateDeviceKey()`** replaces the fingerprint with a new one and clears `revoked_at`. The old key stops working at once, and a device that was once revoked comes back to life.
- **`revokeDevice()`** removes the fingerprint and records the revocation time. We use it in Practice 7.

#### 1.5 The guest book in memory: `src/services/registry.ts` (5 minutes)

Right-click the **`backend/src/services`** folder → **New File…**, name it **`registry.ts`**, then type:

```ts
// registry.ts - the device "guest book" in memory (Module 21): who is registered and who has been revoked.
// It is loaded from the devices table when the server starts, then updated by the registration, key-rotation, and revoke
// routes, so the backend doesn't have to ask the database for every message.
import type { DeviceRow } from "../db/devices.ts";

export type Permission = "registered" | "unregistered" | "revoked" | "not-loaded";

interface Entry {
  revoked: boolean;
}

const registry = new Map<string, Entry>(); // only registered devices (active or revoked)
let loaded = false;

// a pure decision (tested with Vitest): whether a device may be served
export function permissionOf(isLoaded: boolean, entry: Entry | undefined): Permission {
  if (!isLoaded) return "not-loaded"; // the registry hasn't been read from the database: don't trust anyone yet
  if (entry === undefined) return "unregistered";
  return entry.revoked ? "revoked" : "registered";
}

export function devicePermission(deviceId: string): Permission {
  return permissionOf(loaded, registry.get(deviceId));
}

export function loadRegistry(rows: Pick<DeviceRow, "device_id" | "registered_at" | "revoked_at">[]): number {
  registry.clear();
  for (const r of rows) if (r.registered_at !== null) registry.set(r.device_id, { revoked: r.revoked_at !== null });
  loaded = true;
  return registry.size;
}

export function recordRegistered(deviceId: string): void {
  registry.set(deviceId, { revoked: false });
}

export function recordRevoked(deviceId: string): void {
  registry.set(deviceId, { revoked: true });
}
```

This is the TypeScript version of warm-up step 4:

- **`permissionOf()`** is a pure function that decides one of four states. The fourth state, **`not-loaded`**, holds while the registry hasn't been read from the database yet: the backend may not trust anyone yet (failing closed, Concept 4).
- **`loadRegistry()`** fills the book from database rows. Only rows whose `registered_at` is filled in go into the book; old rows automatically count as unregistered.
- **`recordRegistered()`** and **`recordRevoked()`** are called by the routes when something changes, so the in-memory book always matches the database without re-reading the table.

#### 1.6 The registration routes: `src/routes/devices.ts` (12 minutes)

Open **`src/routes/devices.ts`**. There are three changes.

1. **The `import` section.** Find the line `import { findDevice, allDevices } from "../services/store.ts";`, then replace it with these five lines:

   ```ts
   import { findDevice } from "../services/store.ts";
   import { revokeDevice, registerDevice, rotateDeviceKey, allDevicesDb } from "../db/devices.ts";
   import type { DeviceRow } from "../db/devices.ts";
   import { makeKey, hashKey } from "../auth/key.ts";
   import { recordRevoked, recordRegistered, devicePermission } from "../services/registry.ts";
   ```

   `allDevices` from `store.ts` isn't used anymore: the device list is now read from the database, not from memory, which only holds devices that have been heard since the backend started.

2. **Schemas and helper functions.** Find the block `const SummaryPoint = z.object({ … });`. Right **below** that block (after its `});` line), add:

   ```ts
   // Module 21: one row of the device list. key = its key's state, not its key (the database doesn't store the key).
   const Device = z.object({
     device_id: z.string(),
     name: z.string().nullable(),
     location: z.string().nullable(),
     kind: Kind,
     status: z.string().describe("online, offline, offline-mode, or unknown (the last MQTT status)"),
     last_seen: z.string().nullable().describe("server time when this device's last message arrived"),
     key: z.enum(["active", "revoked", "no-key", "unregistered"])
       .describe("active = allowed to send data; no-key = an ESP-NOW device via its linking device; unregistered = an old row"),
     registered_at: z.string().nullable().describe("when the admin registered it"),
     key_created_at: z.string().nullable().describe("when the key that is valid now was made"),
     revoked_at: z.string().nullable().describe("when its key was revoked"),
     linked_via: z.string().nullable().describe("an ESP-NOW device: the device_id that publishes its data"),
   });
   const Registration = z.strictObject({
     device_id: DeviceId.describe("the device's device_id (12 lowercase hexadecimal digits from the MAC address), for example a4cf12e5b7c0"),
     name: z.string().min(1).max(60).optional().describe("an easy-to-remember name, for example Node 1 living room"),
     location: z.string().min(1).max(60).optional().describe("for example living room"),
     linked_via: DeviceId.optional()
       .describe("only for an ESP-NOW device (Node 2): the device_id of the Node 1 that publishes its data; this device gets no key"),
   });
   const NewKey = z.object({
     device_id: z.string(),
     key: z.string().nullable().describe("43 characters; shown ONLY this once. null for an ESP-NOW device"),
     steps: z.array(z.string()).describe("what to do next"),
   });
   const DATABASE_DOWN = "the database can't be reached right now, try again shortly";

   const iso = (time: Date | null) => (time === null ? null : contractTime(time));

   function present(r: DeviceRow) {
     const key = r.registered_at === null ? "unregistered" as const
       : r.revoked_at !== null ? "revoked" as const
         : r.linked_via !== null ? "no-key" as const : "active" as const;
     return {
       device_id: r.device_id, name: r.name, location: r.location, kind: r.kind, status: r.status,
       last_seen: iso(r.last_seen), key, registered_at: iso(r.registered_at), key_created_at: iso(r.key_created_at),
       revoked_at: iso(r.revoked_at), linked_via: r.linked_via,
     };
   }

   // the next steps, so the key is installed on the device and on the broker right away
   function keySteps(id: string): string[] {
     return ["Save this key now: the key is shown only this once (the database only stores its fingerprint).",
       `Device: type  key <key>  in the Serial Monitor (simulator: KEY_${id.toUpperCase()}=<key> in tools/.env)`,
       `Broker: mosquitto_passwd <broker password file> ${id} on the broker machine, paste the key twice, then reload the broker`];
   }

   function noKeySteps(id: string, linkedVia: string): string[] {
     return ["An ESP-NOW device with no key. Make sure these three lines are in the broker ACL file, then restart the broker:",
       `user ${linkedVia}`, `topic write msh/${id}/telemetry`, `topic write msh/${id}/status`];
   }
   ```

   - **`Device`** is the shape of one row in the `GET /devices` answer. The **`key`** field holds the key's **state** (`active`, `revoked`, `no-key`, or `unregistered`), not the key, because the backend doesn't store the key.
   - **`Registration`** uses `z.strictObject`: an unknown field, for example a `"key"` sent along, makes the request be rejected with 400. Whoever sends the request can't choose their own key: the key is always made by the backend.
   - **`keySteps()`** and **`noKeySteps()`** write the `steps` hints that come with the answer, in this module's order: the device first, then the broker.

3. **The routes.** Find the old `app.get("/devices", { … });` route (its summary is `List all devices that have ever been heard`). Replace **that whole route block**, from `app.get("/devices", {` to its closing `});`, with:

   ```ts
     app.get("/devices", {
       schema: {
         tags: ["devices"],
         summary: "Devices in the database: the registered ones, the revoked ones, and old rows that aren't registered",
         response: {
           200: z.array(Device).describe("ordered by device_id; the key and its fingerprint are never included"),
           503: ErrorBody.describe("the database can't be reached right now"),
         },
       },
     }, async (req, reply) => {
       try {
         return (await allDevicesDb()).map(present);
       } catch (error) {
         req.log.error(`the device list couldn't be read: ${(error as Error).message}`);
         return reply.code(503).send({ message: DATABASE_DOWN });
       }
     });

     // ---- Module 21: register a device, rotate its key, revoke its key (admin only: the guard refuses viewers for POST) ----

     app.post("/devices", {
       schema: {
         tags: ["devices"],
         summary: "Register a device; its key is shown ONLY ONCE, in this answer",
         body: Registration,
         response: {
           201: NewKey.describe("device registered; save its key now"),
           409: ErrorBody.describe("already registered (use key rotation), or an invalid linked_via"),
           503: ErrorBody.describe("the database can't be reached right now"),
         },
       },
     }, async (req, reply) => {
       const { device_id: id, name, location, linked_via: linkedVia } = req.body;
       if (linkedVia !== undefined) { // an ESP-NOW device: no key, its data is published by its linking device
         if (linkedVia === id) return reply.code(409).send({ message: "linked_via can't be the device itself" });
         if (devicePermission(linkedVia) !== "registered") {
           return reply.code(409).send({ message: `linked_via ${linkedVia} is not registered or has been revoked; register Node 1 first` });
         }
       }
       const key = linkedVia === undefined ? makeKey() : null;
       try {
         const row = await registerDevice(id, name ?? null, location ?? null, linkedVia ?? null,
           key === null ? null : hashKey(key)); // the database only receives its fingerprint
         if (row === undefined) {
           return reply.code(409).send({ message: `${id} is already registered; for a new key use POST /devices/${id}/key` });
         }
         recordRegistered(id);
         req.log.info(`device ${id} registered by account ${req.user.sub}${linkedVia === undefined ? "" : ` (via ${linkedVia})`}`);
         const steps = linkedVia === undefined ? keySteps(id) : noKeySteps(id, linkedVia);
         return reply.code(201).send({ device_id: id, key, steps });
       } catch (error) {
         req.log.error(`registration of ${id} failed: ${(error as Error).message}`);
         return reply.code(503).send({ message: DATABASE_DOWN });
       }
     });

     app.post("/devices/:id/key", {
       schema: {
         tags: ["devices"],
         summary: "Make a new key (the old key stops working at once); also brings a revoked device back to life",
         params: IdParam,
         response: {
           200: NewKey.describe("the new key; save it now"),
           404: ErrorBody.describe("the device isn't registered, or an ESP-NOW device (it has no key)"),
           503: ErrorBody.describe("the database can't be reached right now"),
         },
       },
     }, async (req, reply) => {
       const id = req.params.id;
       const key = makeKey();
       try {
         const row = await rotateDeviceKey(id, hashKey(key));
         if (row === undefined) return reply.code(404).send({ message: `${id} isn't registered, or a device with no key (ESP-NOW)` });
         recordRegistered(id);
         req.log.info(`a new key for ${id} was made by account ${req.user.sub}`);
         return { device_id: id, key, steps: keySteps(id) };
       } catch (error) {
         req.log.error(`key rotation for ${id} failed: ${(error as Error).message}`);
         return reply.code(503).send({ message: DATABASE_DOWN });
       }
     });

     app.post("/devices/:id/revoke", {
       schema: {
         tags: ["devices"],
         summary: "Revoke a device's key (lost or stolen): the backend no longer serves it",
         params: IdParam,
         response: {
           200: z.object({ device_id: z.string(), revoked_at: z.string(), steps: z.array(z.string()) })
             .describe("revoked; also remove its account from the broker"),
           404: ErrorBody.describe("the device isn't registered or has already been revoked"),
           503: ErrorBody.describe("the database can't be reached right now"),
         },
       },
     }, async (req, reply) => {
       const id = req.params.id;
       try {
         const row = await revokeDevice(id);
         if (row === undefined) return reply.code(404).send({ message: `${id} isn't registered or has already been revoked` });
         recordRevoked(id);
         req.log.warn(`key for ${id} REVOKED by account ${req.user.sub}`);
         return {
           device_id: id, revoked_at: contractTime(row.revoked_at ?? new Date()),
           steps: row.linked_via === null
             ? [`Remove its account from the broker: mosquitto_passwd -D <broker password file> ${id}`,
               "Reload the broker (Pi: sudo systemctl reload mosquitto; laptop: Ctrl + C then run it again)"]
             : [`Remove the two msh/${id}/... lines from the user ${row.linked_via} block in the broker ACL file, then restart the broker`],
         };
       } catch (error) {
         req.log.error(`revoke of ${id} failed: ${(error as Error).message}`);
         return reply.code(503).send({ message: DATABASE_DOWN });
       }
     });
   ```

   - **`GET /devices`** now reads the database and presents every row through `present()`.
   - **`POST /devices`** makes a key (except for an ESP-NOW device that uses `linked_via`), hands its **fingerprint** to the database, then returns the **key** in the `201` answer. That key isn't stored anywhere in the backend: this answer is the only place it appears.
   - **`POST /devices/:id/key`** and **`POST /devices/:id/revoke`** are used in Practice 7.
   - None of the three `POST` routes write the key to the log. The log only records who registered it, for example `device a4cf12e5b7c0 registered by account 1`.
   - The Module 20 guard still protects everything: without a *login* the answer is 401, and a `viewer` account that tries a `POST` is answered 403. There's no extra code for that.

#### 1.7 Load the guest book when the backend starts: `src/server.ts` (3 minutes)

Open **`src/server.ts`**. In the `import` section, below the line `import { databaseAlive } from "./db/archive.ts";`, add:

```ts
import { allDevicesDb } from "./db/devices.ts";
import { loadRegistry } from "./services/registry.ts";
```

Then find the line `startRealtime(app);` (with the comment `Module 19: Socket.IO …`). Right below it, before `startMqtt(…)`, add:

```ts
// Module 21: the registry of registered devices is loaded from the database BEFORE listening to the broker. If the database
// can't be reached yet, it is retried every 10 seconds (logged at most once a minute); until then every device message is
// ignored: it's better to lose data for a moment than to accept data from a device that isn't allowed.
let registryAttempts = 0;
async function loadDeviceRegistry(): Promise<void> {
  try {
    const count = loadRegistry(await allDevicesDb());
    app.log.info(`device registry loaded: ${count} registered devices`);
  } catch (error) {
    if (registryAttempts % 6 === 0) {
      app.log.error(`device registry couldn't be loaded yet (${(error as Error).message}); retrying every 10 seconds`);
    }
    registryAttempts++;
    setTimeout(() => void loadDeviceRegistry(), 10_000);
  }
}
await loadDeviceRegistry();
```

The guest book is loaded **before** the backend connects to the broker, so the first MQTT message can already be checked. If the database isn't up yet, the backend still runs and retries every 10 seconds; its log is written at most once a minute so the log doesn't fill up.

Save all the files. In the first terminal, `npm run dev` restarts by itself, and its log now holds one new line (**example**):

```text
[01:43:03] INFO: device registry loaded: 0 registered devices
```

That `0` is correct: none of your devices are registered yet.

#### 1.8 Five Bruno requests (8 minutes)

This week there's one device used by **every reader**, on any path: **the practice device `f00d00000001`** from the simulator in the `tools` folder. It's the test device for the second layer (Practice 2) and key revocation (Practice 7), so your Node 1 doesn't have to be revoked too.

In Bruno, open the `backend/bruno` collection and select the **`local`** *environment*. Create five new requests the same way as in Modules 16–20: open the **`lamp on`** request tab, right-click its **tab** → **Clone Request**, fill in the **Request Name**, then click **Clone**.

1. **`register Node 1`**: URL `{{baseUrl}}/devices`, the **Body** tab replaced with the contents below, and in the **Assert** tab the `res.status` value changed to `201`. Replace `a4cf12e5b7c0` with your Node 1's `device_id`:

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "name": "Node 1 living room",
     "location": "living room"
   }
   ```

2. **`register Node 2 via Node 1`** (clone of `register Node 1`): replace the **Body** with the contents below, using your own Node 2 and Node 1 `device_id`s.

   ```json
   {
     "device_id": "246f28b1c7d4",
     "name": "Node 2 garden",
     "location": "garden",
     "linked_via": "a4cf12e5b7c0"
   }
   ```

3. **`register practice device`** (clone of `register Node 1`): replace the **Body** with the contents below. Its `device_id` is the same for every reader, because the simulator always uses `f00d00000001` for its first practice device.

   ```json
   {
     "device_id": "f00d00000001",
     "name": "Practice living room",
     "location": "living room"
   }
   ```

4. **`rotate practice device key`** (clone of `register practice device`): URL `{{baseUrl}}/devices/f00d00000001/key`, in the **Body** tab choose **No Body**, and the Assert `res.status` value becomes `200`.
5. **`revoke practice device key`** (clone of `rotate practice device key`): URL `{{baseUrl}}/devices/f00d00000001/revoke`.

**Don't send numbers 4 and 5 now.** They're only used in Practice 7.

#### 1.9 Register your devices (10 minutes)

1. Send **`login admin`**, then **`device list`** (the `GET /devices` request from Module 16). **Expected output** (**example**, trimmed): all your old devices appear with `"key": "unregistered"`:

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "name": null,
     "location": null,
     "kind": "node1",
     "status": "online",
     "last_seen": "2026-10-22T18:40:11Z",
     "key": "unregistered",
     "registered_at": null,
     "key_created_at": null,
     "revoked_at": null,
     "linked_via": null
   }
   ```

   Those rows were auto-created by the backend since Module 17. On the author's laptop, the list also holds `beef00000001` (the Module 18 load-test data) plus `f00d00000001` and `f00d00000002` (the simulator's practice devices).

2. **Set up somewhere to keep the key before sending.** The key is shown only once. Keep it in **your password manager**, the same place as your Module 20 account passwords, with a clear name, for example `broker key a4cf12e5b7c0`. Those keys are used in Practice 3 (the device) and Practice 4 (the broker).
3. **Device path:** send **`register Node 1`**. **Expected output:** `201 Created`, with the body (**example**; the key is this module's example key, which is valid nowhere):

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "key": "J2BPlozrp88Z-rmVr2EnhfJkgOxAY3xxGYzVSjQejOE",
     "steps": [
       "Save this key now: the key is shown only this once (the database only stores its fingerprint).",
       "Device: type  key <key>  in the Serial Monitor (simulator: KEY_A4CF12E5B7C0=<key> in tools/.env)",
       "Broker: mosquitto_passwd <broker password file> a4cf12e5b7c0 on the broker machine, paste the key twice, then reload the broker"
     ]
   }
   ```

   **Copy the key now** (double-click inside the key text in the answer panel, then **Ctrl + C**) into your password manager. If it's lost before you install it, that's fine: make a new key with a request like `rotate practice device key`, but with that device's own URL `{{baseUrl}}/devices/<device_id>/key`. The old key stops working at once.
4. **Device path:** send **`register Node 2 via Node 1`**. **Expected output:** `201 Created`, with `"key": null` and three access-list lines:

   ```json
   {
     "device_id": "246f28b1c7d4",
     "key": null,
     "steps": [
       "An ESP-NOW device with no key. Make sure these three lines are in the broker ACL file, then restart the broker:",
       "user a4cf12e5b7c0",
       "topic write msh/246f28b1c7d4/telemetry",
       "topic write msh/246f28b1c7d4/status"
     ]
   }
   ```

   Those three lines are used in Practice 5. If Node 1 isn't registered yet, this request is rejected with 409: `linked_via … is not registered or has been revoked; register Node 1 first`.
5. **All paths:** send **`register practice device`**, then save its key too, for example with the name `broker key f00d00000001`. Its answer has the same shape as number 3; its second line now says `KEY_F00D00000001=<key> in tools/.env`, where this key is installed in Practice 3.
6. Send **`register practice device`** once more. **Expected output:** `409 Conflict`:

   ```json
   {"message":"f00d00000001 is already registered; for a new key use POST /devices/f00d00000001/key"}
   ```

   A second registration is refused on purpose, so that no one can "re-register" your device to get a new key quietly. The **Tests** tab does write one failed Assert (`expected 409 to equal 201`), and that's the result we expect.
7. Try it as a guest: send **`login viewer`**, then `register practice device`. **Expected output:** `403 Forbidden` with the Module 20 guard message, `viewer accounts can only look; commands and changes are admin-only`. Send **`login admin`** again afterwards.
8. Send **`device list`** once more. The devices you registered are now `"key": "active"`, with `registered_at` and `key_created_at` filled in. Node 2 (device path) is `"kind": "node2"`, `"key": "no-key"`, and `"linked_via": "a4cf12e5b7c0"`. Devices you didn't register, for example `f00d00000002`, stay `unregistered`.

The backend log in the first terminal records everything (**example** from the author's laptop, which deliberately sent `register Node 1` twice; the lines for the practice device aren't shown):

```text
[01:46:21] INFO: device a4cf12e5b7c0 registered by account 1
[01:46:21] INFO: POST /devices -> 201 (42 ms)
[01:46:21] INFO: device 246f28b1c7d4 registered by account 1 (via a4cf12e5b7c0)
[01:46:21] INFO: POST /devices -> 201 (208 ms)
[01:46:21] INFO: POST /devices -> 409 (44 ms)
[01:47:32] WARN: refused (403): account 2 (viewer) tried POST /devices
[01:47:32] INFO: POST /devices -> 403 (1 ms)
```

Not a single line contains the key. That's what we want.

> [!NOTE]
> **If you mistype your `device_id`**, for example in uppercase, the answer is `400` with the message `body/device_id device_id must be 12 lowercase hexadecimal digits`. If you playfully add a `"key"` field to the request body, the answer is `400` with the message ``body/ Unrecognized key: "key"``. The word "key" in that message comes from Zod and means "a JSON field", not a device key: Zod rejects the unknown `key` field (`z.strictObject`), because the key is always made by the backend.

#### 1.10 Tests and save to the branch (7 minutes)

There are three new test files. The first two are short. Right-click the **`backend/src/auth`** folder → **New File…**, name it **`key.test.ts`**, then type:

```ts
// key.test.ts - unit tests for device keys (Module 21): the key shape, the SHA-256 fingerprint, and constant-time matching.
// No database and no broker. Run: npm test
import { describe, expect, it } from "vitest";
import { Key, makeKey, matchKey, hashKey } from "./key.ts";

describe("device key", () => {
  it("43 base64url characters, passes the Key schema, and is never the same twice", () => {
    const a = makeKey();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Key.safeParse(a).success).toBe(true);
    const many = new Set(Array.from({ length: 1000 }, () => makeKey()));
    expect(many.size).toBe(1000);
  });
  it("the Key schema rejects a truncated key or one with other characters", () => {
    expect(Key.safeParse("a".repeat(42)).success).toBe(false);
    expect(Key.safeParse("a".repeat(42) + "=").success).toBe(false); // plain base64, not base64url
    expect(Key.safeParse(" " + "a".repeat(42)).success).toBe(false); // a space stuck to it
  });
  it("fingerprint = 64-character hexadecimal SHA-256, always the same for the same key", () => {
    expect(hashKey("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const k = makeKey();
    expect(hashKey(k)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashKey(k)).toBe(hashKey(k));
    expect(hashKey(k)).not.toContain(k);
  });
  it("matchKey: the right key matches, another key doesn't, a device with no key (revoked) never matches", () => {
    const k = makeKey();
    const fingerprint = hashKey(k);
    expect(matchKey(k, fingerprint)).toBe(true);
    expect(matchKey(makeKey(), fingerprint)).toBe(false);
    expect(matchKey(k.slice(0, 42) + (k.endsWith("A") ? "B" : "A"), fingerprint)).toBe(false); // last character differs
    expect(matchKey(k, null)).toBe(false);
  });
});
```

Then right-click the **`backend/src/services`** folder → **New File…**, name it **`registry.test.ts`**, then type:

```ts
// registry.test.ts - unit tests for the device guest book (Module 21): who is registered and who has been revoked.
// No database and no broker. Run: npm test
import { describe, expect, it } from "vitest";
import { recordRevoked, recordRegistered, loadRegistry, devicePermission, permissionOf } from "./registry.ts";

describe("device guest book", () => {
  it("pure decision: not loaded, unregistered, registered, revoked", () => {
    expect(permissionOf(false, { revoked: false })).toBe("not-loaded"); // database not read yet: don't trust anyone
    expect(permissionOf(true, undefined)).toBe("unregistered");
    expect(permissionOf(true, { revoked: false })).toBe("registered");
    expect(permissionOf(true, { revoked: true })).toBe("revoked");
  });
  it("registry from the database: an old row with no registration date still counts as unregistered", () => {
    const now = new Date();
    const count = loadRegistry([
      { device_id: "a4cf12e5b7c0", registered_at: now, revoked_at: null },
      { device_id: "f00d00000001", registered_at: null, revoked_at: null }, // auto-created in Modules 17-20
      { device_id: "c0ba00000001", registered_at: now, revoked_at: now },
    ]);
    expect(count).toBe(2);
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
    expect(devicePermission("f00d00000001")).toBe("unregistered");
    expect(devicePermission("c0ba00000001")).toBe("revoked");
    recordRevoked("a4cf12e5b7c0"); // POST /devices/:id/revoke
    expect(devicePermission("a4cf12e5b7c0")).toBe("revoked");
    recordRegistered("a4cf12e5b7c0"); // POST /devices/:id/key brings it back to life
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
  });
});
```

The third file, **`src/routes/devices.test.ts`**, tests all four routes **without a database**: the `devices` table is replaced by an in-memory fake with `vi.mock`, and Fastify runs without a network with `app.inject`. The test is 149 lines, so you may copy it straight from [this module's code file](code/backend/src/routes/devices.test.ts) (click the **Copy raw file** icon on GitHub), then paste it into the new file `backend/src/routes/devices.test.ts`.

<details>
<summary>The full contents of <code>src/routes/devices.test.ts</code></summary>

```ts
// devices.test.ts - tests for the official device registry routes (Module 21) WITHOUT a database: the devices table is replaced
// by an in-memory fake (vi.mock), the Fastify server runs without a network (app.inject). What is tested: the key is shown once,
// only its fingerprint is stored, a double registration is refused, key rotation, revoke, an ESP-NOW device with no key. The
// login guard (Module 20) isn't mounted here: 401 and 403 are already handled by security.ts for ALL routes. Run: npm test
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

vi.hoisted(() => { // env.ts checks .env when imported: give it valid fake settings (nothing is really contacted)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
});

// the fake devices table: device_id -> row (including key_hash, which the real database also has)
const table = vi.hoisted(() => new Map<string, Record<string, unknown>>());
vi.mock("../db/devices.ts", () => {
  const EMPTY = { kind: "unknown", name: null, location: null, status: "unknown", last_seen: null,
    registered_at: null, key_hash: null, key_created_at: null, revoked_at: null, linked_via: null };
  const withoutHash = (r: Record<string, unknown>) => { const { key_hash: _, ...rest } = r; return rest; };
  return {
    allDevicesDb: async () => [...table.values()].map(withoutHash),
    registerDevice: async (id: string, name: string | null, location: string | null, linkedVia: string | null,
      keyHash: string | null) => {
      const old = table.get(id);
      if (old?.registered_at) return undefined;
      const fresh = { ...EMPTY, ...old, device_id: id, name: name ?? old?.name ?? null, location, linked_via: linkedVia,
        kind: linkedVia ? "node2" : (old?.kind ?? "unknown"), registered_at: new Date(), key_hash: keyHash,
        key_created_at: keyHash ? new Date() : null, revoked_at: null };
      table.set(id, fresh);
      return withoutHash(fresh);
    },
    rotateDeviceKey: async (id: string, keyHash: string) => {
      const r = table.get(id);
      if (!r?.registered_at || r.linked_via) return undefined;
      Object.assign(r, { key_hash: keyHash, key_created_at: new Date(), revoked_at: null });
      return withoutHash(r);
    },
    revokeDevice: async (id: string) => {
      const r = table.get(id);
      if (!r?.registered_at || r.revoked_at) return undefined;
      Object.assign(r, { key_hash: null, key_created_at: null, revoked_at: new Date() });
      return withoutHash(r);
    },
  };
});

import Fastify from "fastify";
import type { LightMyRequestResponse } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { deviceRoutes } from "./devices.ts";
import { loadRegistry, devicePermission } from "../services/registry.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
// stand-in for the guard: every request is treated as coming from admin account number 1
app.addHook("onRequest", async (req) => {
  req.user = { sub: "1", role: "admin", sid: 1, iat: 0, exp: 0 };
});
await app.register(deviceRoutes);

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
const post = (url: string, body?: object): Promise<LightMyRequestResponse> =>
  app.inject({ method: "POST", url, ...(body === undefined ? {} : { payload: body }) });

beforeAll(() => {
  // one old row from Modules 17-20 (auto-created, not registered), then the in-memory registry is loaded as when the server starts
  table.set("a4cf12e5b7c0", { device_id: "a4cf12e5b7c0", kind: "node1", name: null, location: null, status: "online",
    last_seen: new Date(), registered_at: null, key_hash: null, key_created_at: null, revoked_at: null, linked_via: null });
  loadRegistry([...table.values()] as never);
});
afterAll(() => app.close());

describe("official device registry", () => {
  let firstKey = "";

  it("an old unregistered row: GET /devices marks it unregistered", async () => {
    expect(devicePermission("a4cf12e5b7c0")).toBe("unregistered");
    const answer = await app.inject({ method: "GET", url: "/devices" });
    expect(answer.statusCode).toBe(200);
    expect(answer.json()[0]).toMatchObject({ device_id: "a4cf12e5b7c0", key: "unregistered", registered_at: null });
  });

  it("POST /devices: 201, the 43-character key is shown ONCE, the database stores only its SHA-256", async () => {
    const answer = await post("/devices", { device_id: "a4cf12e5b7c0", name: "Node 1 living room" });
    expect(answer.statusCode).toBe(201);
    const body = answer.json();
    expect(body.key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(body.steps.length).toBe(3);
    firstKey = body.key;
    expect(table.get("a4cf12e5b7c0")?.key_hash).toBe(sha256(firstKey));
    expect(JSON.stringify([...table.values()])).not.toContain(firstKey);
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
  });

  it("GET /devices never includes the key or its fingerprint", async () => {
    const text = (await app.inject({ method: "GET", url: "/devices" })).body;
    expect(text).not.toContain(firstKey);
    expect(text).not.toContain(sha256(firstKey));
    expect(text).not.toContain("key_hash");
    expect(JSON.parse(text)[0]).toMatchObject({ key: "active", name: "Node 1 living room" });
  });

  it("a second registration for the same device_id: 409", async () => {
    const answer = await post("/devices", { device_id: "a4cf12e5b7c0" });
    expect(answer.statusCode).toBe(409);
    expect(answer.json().message).toContain("already registered");
  });

  it("invalid body: 400 (uppercase device_id, unknown field)", async () => {
    expect((await post("/devices", { device_id: "A4CF12E5B7C0" })).statusCode).toBe(400);
    expect((await post("/devices", { device_id: "a4cf12e5b7c1", key: "my-own-choice" })).statusCode).toBe(400);
  });

  it("key rotation: the new key is different, the old key's fingerprint is removed at once", async () => {
    const answer = await post("/devices/a4cf12e5b7c0/key");
    expect(answer.statusCode).toBe(200);
    const fresh = answer.json().key as string;
    expect(fresh).not.toBe(firstKey);
    expect(table.get("a4cf12e5b7c0")?.key_hash).toBe(sha256(fresh));
  });

  it("an ESP-NOW device (Node 2): no key, linked_via must be registered, the answer contains ACL lines", async () => {
    expect((await post("/devices", { device_id: "246f28b1c7d4", linked_via: "0123456789ab" })).statusCode).toBe(409);
    const answer = await post("/devices", { device_id: "246f28b1c7d4", name: "Node 2 garden", linked_via: "a4cf12e5b7c0" });
    expect(answer.statusCode).toBe(201);
    expect(answer.json().key).toBeNull();
    expect(answer.json().steps).toContain("topic write msh/246f28b1c7d4/telemetry");
    expect((await post("/devices/246f28b1c7d4/key")).statusCode).toBe(404); // an ESP-NOW device has no key
  });

  it("revoke: 200, the guest book records revoked at once, a second revoke 404, its fingerprint is removed", async () => {
    expect((await post("/devices", { device_id: "f00d00000001" })).statusCode).toBe(201);
    const answer = await post("/devices/f00d00000001/revoke");
    expect(answer.statusCode).toBe(200);
    expect(answer.json().revoked_at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    expect(devicePermission("f00d00000001")).toBe("revoked");
    expect(table.get("f00d00000001")?.key_hash).toBeNull();
    expect((await post("/devices/f00d00000001/revoke")).statusCode).toBe(404);
    const list = (await app.inject({ method: "GET", url: "/devices" })).json();
    expect(list.find((d: { device_id: string }) => d.device_id === "f00d00000001").key).toBe("revoked");
  });

  it("a revoked device can be brought back to life with a new key", async () => {
    const answer = await post("/devices/f00d00000001/key");
    expect(answer.statusCode).toBe(200);
    expect(devicePermission("f00d00000001")).toBe("registered");
  });
});
```

</details>

What the three files test: the key is always 43 characters and never the same, its fingerprint is SHA-256, a key that differs by one character is rejected, an old row counts as unregistered, the database only accepts the fingerprint, a second registration is refused with 409, key rotation makes the old key stop working, and Node 2 gets no key. Run in the second terminal:

```text
npm run check
npm test
```

**Expected output:** `npm run check` finishes with no error messages, and `npm test` writes (**example**, the end):

```text
 RUN  v5.0.5 C:/…/mini-smart-home/backend

 ✓ src/auth/key.test.ts (4 tests) 18ms
 ✓ src/rules/engine.test.ts (11 tests) 23ms
 ✓ src/services/registry.test.ts (2 tests) 6ms
 ✓ src/auth/auth.test.ts (7 tests) 2645ms
   ✓ password fingerprint (bcrypt) (2)
     ✓ the right password matches, a wrong one doesn't, and the fingerprint always differs (random salt) 1612ms
     ✓ no such account (empty fingerprint): the result is false, not an error 1020ms
 ✓ src/routes/devices.test.ts (9 tests) 486ms
   ✓ official device registry (9)
     ✓ an old unregistered row: GET /devices marks it unregistered 325ms

 Test Files  5 passed (5)
      Tests  33 passed (33)
   Start at  01:52:43
   Duration  8.51s (import 39%, transform 37%, tests 23%)
```

From 18 tests to **33**. Save your work to the branch:

```text
git add migrations/010_device_keys.sql src/auth/key.ts src/auth/key.test.ts src/db/devices.ts src/services/registry.ts src/services/registry.test.ts src/routes/devices.ts src/routes/devices.test.ts src/server.ts "bruno/register Node 1.yml" "bruno/register Node 2 via Node 1.yml" "bruno/register practice device.yml" "bruno/rotate practice device key.yml" "bruno/revoke practice device key.yml"
git status
git commit -m "Official device registry: migration 010, a per-device key, POST /devices (Module 21 Practice 1)"
```

The Bruno file names that contain spaces are wrapped in double quotes. The `git status` in the middle shows what will be committed; there is no key in any file, because the key is only in the answer you already copied to your password manager.

> ⬆️ **Done with Practice 1?** Read [Concept 4](#4-the-second-layer-the-backend-only-listens-to-registered-devices) if you haven't, then continue to [Practice 2 — The second layer and a broker account for the backend](#practice-2--the-second-layer-and-a-broker-account-for-the-backend-45-minutes).

### Practice 2 — The second layer and a broker account for the backend (45 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal runs `npm run dev`, a second terminal in the `backend` folder for other commands, a third terminal in the `tools` folder for the simulator and the small terminal) and **Bruno**.

This practice installs the **second layer** (Concept 4): the backend stops creating `devices` rows automatically and ignores messages from devices that aren't registered or whose key has been revoked. The backend also gets its own **broker account** in `.env`. The broker is still open, so that account isn't checked by anyone yet; it only matters in Practice 4.

#### 2.1 Stop creating `devices` rows automatically: `src/db/archive.ts` (3 minutes)

Open **`src/db/archive.ts`**. Find the `recordDevice` function (it starts with the comment `// Make sure the device has a row in the devices table …`), then replace the comment and the whole function with:

```ts
// Update the device's kind, status, and when it was last heard. Module 21: a devices row is NO LONGER created automatically;
// only a registered device (POST /devices) has its messages reach here (second layer in mqtt.ts). Columns that aren't given
// (null) don't overwrite the old values, thanks to coalesce.
async function recordDevice(deviceId: string, kind: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `UPDATE devices SET
       kind = coalesce($2, kind),
       status = coalesce($3, status),
       last_seen = now()
     WHERE device_id = $1`,
    [deviceId, kind, status],
  );
}
```

`INSERT … ON CONFLICT` is replaced by `UPDATE … WHERE device_id = $1`. If that `device_id` isn't in the table, `UPDATE` changes nothing and creates no new row. From now on, a `devices` row is only born from `POST /devices`.

#### 2.2 An "IGNORED" log that does not flood: `src/services/registry.ts` (5 minutes)

An unregistered device keeps sending `telemetry` every 10 seconds. If every message were logged, the backend log would drown. Open **`src/services/registry.ts`**, then replace its whole contents with:

```ts
// registry.ts - the device "guest book" in memory (Module 21): who is registered and who has been revoked.
// It is loaded from the devices table when the server starts, then updated by the registration, key-rotation, and revoke
// routes, so the backend doesn't have to ask the database for every message.
// This guest book is the SECOND LAYER: the broker (password file + ACL) is the first. If the broker is forgotten to be
// reloaded after a key is revoked, or the broker password file and the database don't match, the backend still ignores
// messages from a device that isn't allowed (mqtt.ts) and doesn't send commands to it (commands.ts).
import type { FastifyBaseLogger } from "fastify";
import type { DeviceRow } from "../db/devices.ts";

export type Permission = "registered" | "unregistered" | "revoked" | "not-loaded";

interface Entry {
  revoked: boolean;
}

const registry = new Map<string, Entry>(); // only registered devices (active or revoked)
let loaded = false;

// a pure decision (tested with Vitest): whether a device may be served
export function permissionOf(isLoaded: boolean, entry: Entry | undefined): Permission {
  if (!isLoaded) return "not-loaded"; // the registry hasn't been read from the database: don't trust anyone yet
  if (entry === undefined) return "unregistered";
  return entry.revoked ? "revoked" : "registered";
}

export function devicePermission(deviceId: string): Permission {
  return permissionOf(loaded, registry.get(deviceId));
}

export function loadRegistry(rows: Pick<DeviceRow, "device_id" | "registered_at" | "revoked_at">[]): number {
  registry.clear();
  for (const r of rows) if (r.registered_at !== null) registry.set(r.device_id, { revoked: r.revoked_at !== null });
  loaded = true;
  return registry.size;
}

export function recordRegistered(deviceId: string): void {
  registry.set(deviceId, { revoked: false });
}

export function recordRevoked(deviceId: string): void {
  registry.set(deviceId, { revoked: true });
}

// ---- ignored messages: logged, but at most once a minute per device (an unregistered device sends telemetry every 10
// seconds; the log must not drown in it) ----
export const LOG_GAP_MS = 60_000;
const lastLogged = new Map<string, { time: number; missed: number }>();

const REASON: Record<Exclude<Permission, "registered">, string> = {
  "unregistered": "is not registered (register it first with POST /devices)",
  "revoked": "its key has been revoked",
  "not-loaded": "the device registry hasn't been read from the database yet",
};

// The result is the log line, or null if we're still inside the gap (pure logic, tested with Vitest)
export function ignoredLine(topic: string, deviceId: string, permission: Exclude<Permission, "registered">, now: number): string | null {
  const entry = lastLogged.get(deviceId);
  if (entry !== undefined && now - entry.time < LOG_GAP_MS) {
    entry.missed++;
    return null;
  }
  const extra = entry !== undefined && entry.missed > 0 ? ` (+${entry.missed} more messages since the last log)` : "";
  lastLogged.set(deviceId, { time: now, missed: 0 });
  return `IGNORED ${topic}: ${deviceId} ${REASON[permission]}${extra}`;
}

export function recordIgnored(topic: string, deviceId: string, permission: Exclude<Permission, "registered">, log: FastifyBaseLogger): void {
  const line = ignoredLine(topic, deviceId, permission, Date.now());
  if (line !== null) log.warn(line);
}
```

What's new is at the bottom:

- **`ignoredLine()`** is a pure function that writes a log line, for example `IGNORED msh/f00d00000002/status: f00d00000002 is not registered (register it first with POST /devices)`. For the same device, the next line is only written **a minute later**, plus the number of messages that were missed, for example `(+5 more messages since the last log)`. During that gap, the result is `null`.
- **`recordIgnored()`** passes that line to the log as a warning (`WARN`).
- The comment at the top of the file explains that this guest book is the **second layer**; the first layer is the broker.

#### 2.3 The second layer and the broker account: `src/services/mqtt.ts` (12 minutes)

Open **`src/services/mqtt.ts`**. There are three changes.

1. Below the line `import { notify, notifyStatus } from "./telegram.ts";`, add:

   ```ts
   import { recordIgnored, devicePermission } from "./registry.ts";
   ```

2. Replace **the whole `startMqtt` function**, from the line `export function startMqtt(url: string, log: FastifyBaseLogger): void {` to its closing `}` brace, with:

   ```ts
   const RETRY_NORMAL_MS = 5000; // broker down or network lost: retry every 5 seconds (like a device, contract section 3)
   const RETRY_REJECTED_MS = 60_000; // Module 21: the broker REJECTS the backend account: retry slowly, so the broker log doesn't flood

   // Module 21: the backend's own broker account (not a device account, not a human account), from MQTT_USERNAME/MQTT_PASSWORD
   export interface BrokerAccount {
     username: string;
     password: string;
   }

   export function startMqtt(url: string, account: BrokerAccount | null, log: FastifyBaseLogger): void {
     const clientName = "backend-" + Math.random().toString(16).slice(2, 8); // a unique name; a locked broker uses its account name
     client = mqtt.connect(url, {
       clientId: clientName,
       reconnectPeriod: RETRY_NORMAL_MS,
       ...(account === null ? {} : { username: account.username, password: account.password }),
       reconnectOnConnackError: true, // Module 21: without this, once rejected by the broker = stop trying forever
     });
     let rejected = false; // currently rejected by the broker? (so the long message is written only once)
     client.on("connect", () => {
       if (client !== undefined) client.options.reconnectPeriod = RETRY_NORMAL_MS;
       rejected = false;
       log.info(`connected to broker ${url}${account === null ? " WITHOUT an account" : ` as ${account.username}`}`);
       client?.subscribe("msh/#", { qos: 1 });
       sendAllConfigs(); // Module 19: a broker without persistence forgets the retained config when restarted (contract rule 10)
     });
     client.on("reconnect", () => {
       if (!rejected) log.warn(`broker not reachable yet, retrying in ${RETRY_NORMAL_MS / 1000} seconds`);
     });
     client.on("error", (error) => {
       const code = (error as Error & { code?: number }).code;
       if (code === 4 || code === 5 || code === 134 || code === 135) { // CONNACK: account rejected (MQTT 3.1.1 and MQTT 5)
         if (client !== undefined) client.options.reconnectPeriod = RETRY_REJECTED_MS;
         if (!rejected) {
           log.error(`broker REJECTED the backend (${error.message}, code ${code}): ` + (account === null
             ? "the backend connected without an account, but the broker is already locked; fill in MQTT_USERNAME and MQTT_PASSWORD in .env"
             : `check MQTT_USERNAME and MQTT_PASSWORD in .env, the account "${account.username}" in the broker password file `
               + "(mosquitto_passwd), then reload the broker")
             + `. Retrying every ${RETRY_REJECTED_MS / 1000} seconds.`);
         }
         rejected = true;
         return;
       }
       log.error(`MQTT error: ${error.message}`);
     });
     // packet.retain = true: an old message the broker kept, sent again because the backend just subscribed (Module 19)
     client.on("message", (topic, content, packet) => receive(topic, content.toString(), packet.retain, log));
   }
   ```

   - **`BrokerAccount`** is the backend's own username and password. The backend has a broker account separate from the device accounts and from the human accounts in the `users` table (Concept 6).
   - `...(account === null ? {} : { username: …, password: … })` adds the username and password only if the account exists.
   - **`reconnectOnConnackError: true`** is very important. Without this line, the `mqtt` library stops trying to connect **forever** after being rejected by the broker once. The backend would go silent: `/health` would write `broker: false` until you run it again, even after you've fixed the account at the broker.
   - If the broker answers code **5** (or 4, 134, 135; the four forms of "account rejected" in MQTT 3.1.1 and MQTT 5), the backend writes one clear error message, then retries **every 60 seconds** instead of every 5 seconds. After reconnecting, the gap is back to 5 seconds.

3. Find the `receive` function. Right below the line `if (kind === "cmd") return; // a command …`, add:

   ```ts
     // Module 21, second layer: only a device that is registered and whose key hasn't been revoked has its data processed
     const permission = devicePermission(deviceId);
     if (permission !== "registered") {
       counts.ignored++;
       return recordIgnored(topic, deviceId, permission, log);
     }
   ```

   This is the second layer. Its check comes **before** the contract check, the store, the archive, Socket.IO, automation rules, and Telegram, so a message from a device that isn't allowed doesn't touch any of them.

#### 2.4 The `ignored` count in `/health` (3 minutes)

1. Open **`src/services/store.ts`**. Replace the line `export const counts = { received: 0, rejected: 0 };` with:

   ```ts
   export const counts = { received: 0, rejected: 0, ignored: 0 }; // Module 21: ignored = sender not registered/revoked
   ```

2. Open **`src/routes/health.ts`**, then replace its whole contents with:

   ```ts
   // health.ts - GET /health: is the server alive, connected to the broker, and able to reach the database?
   import { z } from "zod";
   import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
   import { counts } from "../services/store.ts";
   import { brokerConnected } from "../services/mqtt.ts";
   import { databaseAlive } from "../db/archive.ts";

   export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
     app.get("/health", {
       schema: {
         tags: ["server"],
         security: [], // Module 20: stays open without a login (monitors and the Docker healthcheck can't log in)
         summary: "Server state: alive, connected to the broker and the database, and message counts",
         response: {
           200: z.object({ ok: z.boolean(), broker: z.boolean(), database: z.boolean(), received: z.number(), rejected: z.number(),
             ignored: z.number().describe("Module 21: messages from a device that isn't registered or has been revoked") })
             .describe("server alive; broker and database = reachable or not"),
         },
       },
     }, async () => {
       return { ok: true, broker: brokerConnected(), database: await databaseAlive(), received: counts.received, rejected: counts.rejected,
         ignored: counts.ignored };
     });
   };
   ```

`GET /health` stays open without a *login* (Module 20), and now also says how many messages were ignored.

#### 2.5 Commands only for devices that are allowed: `src/services/commands.ts` (3 minutes)

Open **`src/services/commands.ts`**. Below the `import` lines, add:

```ts
import { devicePermission } from "./registry.ts";
```

Then, in the `issueCommand` function, right below its opening line (`ruleId: number | null = null): Promise<CommandResult> {`), add:

```ts
  const permission = devicePermission(deviceId); // Module 21: an unregistered or revoked device doesn't receive commands
  if (permission === "revoked") return { status: "not-sent", code: 409, message: `device ${deviceId} key has been revoked` };
  if (permission !== "registered") return { status: "not-sent", code: 404, message: `device ${deviceId} is not registered` };
```

A command to an unregistered device is answered **404** `device … is not registered`, and to a device whose key is revoked is answered **409** `device … key has been revoked`. Automation rules and schedules also go through this door (Module 19), so both of them also stop commanding devices that aren't allowed.

In **`src/routes/devices.ts`**, the Swagger description for the command route is also updated. Find the block `app.post("/devices/:id/command", …)`, then change the two `404:` and `409:` lines inside `response` to:

```ts
        404: ErrorBody.describe("the device isn't registered (Module 21) or has never been heard"),
        409: ErrorBody.describe("the device's key has been revoked (Module 21), the device is offline, is Node 2, its kind isn't "
          + "known yet, or an earlier command for the same actuator is still waiting for its ack"),
```

#### 2.6 The backend's broker account in `.env` (8 minutes)

1. Open **`src/config/env.ts`**, then replace its whole contents with:

   ```ts
   // env.ts - the server settings from .env (read by Node.js through --env-file), checked once by a Zod schema at startup.
   // Module 20: .env now also holds a secret (JWT_SECRET), so it is checked as strictly as the messages from devices.
   import { z } from "zod";

   z.config(z.locales.en()); // Zod error messages in English (this file is read first, before contract.ts)

   const empty = (value: unknown) => (value === "" ? undefined : value); // an empty line "NAME=" = not filled in
   const required = z.preprocess(empty, z.string({ error: "not filled in" }));

   const Settings = z.object({
     // the broker's address, for example mqtt://192.168.1.37:1883. Module 21: WITHOUT a username and password inside it (this
     // address is written to the log when connecting); its account is in the next two settings
     MQTT_URL: required.pipe(z.string()
       .regex(/^mqtts?:\/\//, "must start with mqtt:// (or mqtts:// from Module 27 on), for example mqtt://192.168.1.37:1883")
       .refine((url) => !url.includes("@"), "don't put a username or password in MQTT_URL; use MQTT_USERNAME and MQTT_PASSWORD")),
     // Module 21: the backend's own broker account (made with mosquitto_passwd). Both empty = connect without an account (only
     // works on a broker that is still open); if one is filled in, the other is required.
     MQTT_USERNAME: z.string().default(""),
     MQTT_PASSWORD: z.string().default(""),
     DATABASE_URL: required, // the database's address, for example postgres://postgres:<password>@127.0.0.1:5432/smarthome
     PORT: z.preprocess(empty, z.coerce.number().int().min(1).max(65535).default(8080)), // the server's counter (port) number
     HOST: z.preprocess(empty, z.string().default("127.0.0.1")), // 127.0.0.1 = only reachable from this laptop
     // Module 19: Telegram is optional. Empty = Telegram notifications off.
     TELEGRAM_BOT_TOKEN: z.string().default(""), // the token from @BotFather: a secret, like a password
     TELEGRAM_CHAT_ID: z.string().default(""), // the owner's chat_id (the answer to /start)
     TELEGRAM_API_ROOT: z.string().default(""), // empty = the real Telegram server (lab: a mock Bot API server)
     // Module 20: the key that signs the JWTs. Anyone who knows this key can make fake "wristbands".
     JWT_SECRET: z.preprocess(empty, z.string({ error: "not filled in" })
       .min(32, "too short (at least 32 characters); make a new one with the command in .env.example")
       .refine((s) => !s.startsWith("change"), "still holds the example from .env.example; make a new secret")),
     // Module 20: web page addresses (origins) that may call this API from a browser, comma-separated. Module 22: Vite, 5173.
     CORS_ORIGIN: z.preprocess(empty, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
       .transform((text) => text.split(",").map((origin) => origin.trim()).filter((origin) => origin !== ""))),
   }).refine((s) => s.MQTT_USERNAME !== "" || s.MQTT_PASSWORD === "", { // Module 21: the broker account must be complete
     message: "MQTT_PASSWORD is filled in but MQTT_USERNAME is empty", path: ["MQTT_USERNAME"],
   }).refine((s) => s.MQTT_PASSWORD !== "" || s.MQTT_USERNAME === "", {
     message: "MQTT_USERNAME is filled in but MQTT_PASSWORD is empty (the backend account's password from mosquitto_passwd)", path: ["MQTT_PASSWORD"],
   });

   const result = Settings.safeParse(process.env);
   if (!result.success) {
     // show ALL problems at once, so that you don't have to go back and forth fixing them one by one
     for (const issue of result.error.issues) console.error(`Setting ${issue.path.join(".")} in .env: ${issue.message}`);
     console.error("Copy .env.example to .env (or open your .env), fix the settings above, then run again.");
     process.exit(1); // stop here: without the right settings the server must not run
   }

   export const env = result.data;
   ```

   - **`MQTT_URL`** must now start with `mqtt://` (or `mqtts://` from Module 27 on) and **may not** contain an `@`. The `mqtt` library actually accepts an address like `mqtt://backend:password@192.168.1.37:1883`, but this address is written to the log every time the backend connects, so the password would be printed too. The account is split into two settings.
   - **`MQTT_USERNAME`** and **`MQTT_PASSWORD`** may both be empty (the backend connects without an account, which only works on a broker that's still open). If one is filled in, the other is required; the two `.refine()`s below check that.

2. Open **`.env.example`**. Below the `MQTT_URL=…` line, add:

   ```text
   # Module 21: the backend's broker account (made on the broker machine with mosquitto_passwd). Make its password with the same
   # command as JWT_SECRET below. Don't put a username or password in MQTT_URL.
   MQTT_USERNAME=backend
   MQTT_PASSWORD=
   ```

3. Open **`src/server.ts`**. Replace the line `startMqtt(env.MQTT_URL, app.log);` with:

   ```ts
   if (env.MQTT_USERNAME === "") {
     app.log.warn("MQTT_USERNAME empty: the backend connects to the broker WITHOUT an account (only works on a broker that isn't locked yet)");
   }
   startMqtt(env.MQTT_URL, env.MQTT_USERNAME === "" ? null : { username: env.MQTT_USERNAME, password: env.MQTT_PASSWORD }, app.log);
   ```

4. Make the backend's broker account password. In the second terminal, run the same command as making `JWT_SECRET` in Module 20:

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Save the result in your password manager with the name `backend broker account`. This password is installed at the broker in Practice 4.
5. Open your own **`.env`** (not `.env.example`). Below the `MQTT_URL=…` line, add two lines, with the password from step 4, then save:

   ```text
   MQTT_USERNAME=backend
   MQTT_PASSWORD=password-from-step-4
   ```

Once `.env` is saved, `npm run dev` in the first terminal restarts by itself, because `node --watch` also watches `.env` (Module 16). **Expected output** (**example**, trimmed):

```text
[02:05:32] INFO: device registry loaded: 2 registered devices
[02:05:33] INFO: connected to broker mqtt://192.168.1.37:1883 as backend
```

The broker is still open, so it accepts the backend whatever its name and password (Concept 6). What matters is that the backend now **carries** its account. The `2` on the first line is the devices you registered in Practice 1; on your laptop the number follows your device count. The broker address on your screen is of course your own broker's.

Before filling in `.env` correctly, the author deliberately made three mistakes to see Zod's answer. Each is followed by the line `Copy .env.example to .env (or open your .env), fix the settings above, then run again.`, and the backend doesn't start:

```text
Setting MQTT_URL in .env: don't put a username or password in MQTT_URL; use MQTT_USERNAME and MQTT_PASSWORD
Setting MQTT_PASSWORD in .env: MQTT_USERNAME is filled in but MQTT_PASSWORD is empty (the backend account's password from mosquitto_passwd)
Setting MQTT_USERNAME in .env: MQTT_PASSWORD is filled in but MQTT_USERNAME is empty
```

If your `.env` doesn't hold those two lines at all yet, the backend still starts, with the warning `MQTT_USERNAME empty: the backend connects to the broker WITHOUT an account (only works on a broker that isn't locked yet)`.

#### 2.7 Watch the second layer work (8 minutes)

To see ignored messages, you need a device that's **not registered**. The device simulator from the `tools` folder fits: its second practice device, `f00d00000002`, you didn't register.

1. In the third terminal, go into the `tools` folder (`cd tools`, from the `mini-smart-home` folder), then run the Module 19 simulator with two practice devices. Replace `192.168.1.37` with your broker's address (laptop path: `127.0.0.1`):

   ```text
   node device-simulator.js mqtt://192.168.1.37:1883 2
   ```

   This simulator is still the old version that carries no account. The still-open broker accepts it.
2. Watch the backend log in the first terminal. **Expected output** (**example**):

   ```text
   [03:44:22] WARN: IGNORED msh/f00d00000002/status: f00d00000002 is not registered (register it first with POST /devices)
   [03:45:30] WARN: IGNORED msh/f00d00000002/telemetry: f00d00000002 is not registered (register it first with POST /devices) (+7 more messages since the last log)
   ```

   The `f00d00000002` messages are ignored, and its log appears at most once a minute. The `f00d00000001` messages, the practice device you registered in Practice 1, are processed as usual.
3. In Bruno, send **`health`**. The `ignored` field is now above zero. **Expected output** (**example**):

   ```json
   {
     "ok": true,
     "broker": true,
     "database": true,
     "received": 34,
     "rejected": 0,
     "ignored": 12
   }
   ```

4. Run the small terminal in the fourth terminal, following the registered practice device: from the `tools` folder, `node --env-file=.env live-terminal.js http://127.0.0.1:8080 f00d00000001`. Its readings appear like in Module 20. Run it once more for `f00d00000002`: the small terminal connects, but **no readings appear**, because the backend never broadcasts them.
5. Stop the simulator and both small terminals with **Ctrl + C**. The new simulator, which carries a key, is installed in Practice 3.

If you send a command to `f00d00000002`, for example through **Try it out** in `/docs`, the answer is `404` with the message `device f00d00000002 is not registered`.

#### 2.8 Tests and save to the branch (6 minutes)

Open **`src/services/registry.test.ts`**, then replace its whole contents with a version that adds two tests for the `IGNORED` log:

```ts
// registry.test.ts - unit tests for the device guest book (Module 21): who is registered and who has been revoked, and the
// second-layer "IGNORED" log that doesn't flood. No database and no broker. Run: npm test
import { describe, expect, it } from "vitest";
import { LOG_GAP_MS, recordRevoked, recordRegistered, loadRegistry, devicePermission, ignoredLine, permissionOf } from "./registry.ts";

describe("device guest book", () => {
  it("pure decision: not loaded, unregistered, registered, revoked", () => {
    expect(permissionOf(false, { revoked: false })).toBe("not-loaded"); // database not read yet: don't trust anyone
    expect(permissionOf(true, undefined)).toBe("unregistered");
    expect(permissionOf(true, { revoked: false })).toBe("registered");
    expect(permissionOf(true, { revoked: true })).toBe("revoked");
  });
  it("registry from the database: an old row with no registration date still counts as unregistered", () => {
    const now = new Date();
    const count = loadRegistry([
      { device_id: "a4cf12e5b7c0", registered_at: now, revoked_at: null },
      { device_id: "f00d00000001", registered_at: null, revoked_at: null }, // auto-created in Modules 17-20
      { device_id: "c0ba00000001", registered_at: now, revoked_at: now },
    ]);
    expect(count).toBe(2);
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
    expect(devicePermission("f00d00000001")).toBe("unregistered");
    expect(devicePermission("c0ba00000001")).toBe("revoked");
    recordRevoked("a4cf12e5b7c0"); // POST /devices/:id/revoke
    expect(devicePermission("a4cf12e5b7c0")).toBe("revoked");
    recordRegistered("a4cf12e5b7c0"); // POST /devices/:id/key brings it back to life
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
  });
});

describe("IGNORED log (second layer)", () => {
  it("the first message is logged, the next ones within a minute aren't, then it logs again with the missed count", () => {
    const t0 = Date.parse("2026-10-23T08:00:00+08:00");
    const topic = "msh/c0ba00000002/telemetry";
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0))
      .toBe("IGNORED msh/c0ba00000002/telemetry: c0ba00000002 its key has been revoked");
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0 + 10_000)).toBeNull();
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0 + 20_000)).toBeNull();
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0 + LOG_GAP_MS))
      .toBe("IGNORED msh/c0ba00000002/telemetry: c0ba00000002 its key has been revoked (+2 more messages since the last log)");
  });
  it("the gap is counted per device", () => {
    const t0 = Date.parse("2026-10-23T09:00:00+08:00");
    expect(ignoredLine("msh/f00d00000009/status", "f00d00000009", "unregistered", t0)).toContain("not registered");
    expect(ignoredLine("msh/f00d00000010/status", "f00d00000010", "unregistered", t0)).not.toBeNull();
  });
});
```

The first test makes sure the next log only appears after `LOG_GAP_MS` (a minute) with the missed count, and the second makes sure the gap is counted **per device**. Run in the second terminal:

```text
npm run check
npm test
```

**Expected output:** `npm run check` with no errors, and `npm test` ends with `Tests  35 passed (35)`. Save to the branch:

```text
git add src/db/archive.ts src/services/registry.ts src/services/registry.test.ts src/services/mqtt.ts src/services/store.ts src/routes/health.ts src/services/commands.ts src/routes/devices.ts src/config/env.ts src/server.ts .env.example
git status
git commit -m "Second layer: ignore unregistered devices, the backend's broker account in .env (Module 21 Practice 2)"
```

Your own `.env`, which now holds the broker account password, still doesn't go into Git, and `git status` doesn't mention it.

> ⬆️ **Done with Practice 2?** Read [Concept 5](#5-the-key-inside-the-device-nvs-the-serial-monitor-and-its-limits), then continue to [Practice 3 — Node 1 and the tools install their keys](#practice-3--node-1-and-the-tools-install-their-keys-60-minutes).

### Practice 3 — Node 1 and the tools install their keys (60 minutes)

> 🖥️ **Tools used:** **VS Code** to change the firmware in the `firmware/node-1-home` folder and to run the tools in the `tools` folder (the first terminal still runs `npm run dev`), the **Arduino IDE** with the Serial Monitor (device path) or your Node 1 **Wokwi** project (Wokwi path), a browser to open the curriculum files on GitHub, the **SSH terminal to the Pi** (device path), and **Bruno**. Concepts used: Concept 5.
>
> 🖥️ **Three paths, one firmware.** Every reader does steps 3.1–3.5 so that the firmware in your repository becomes v1.6.0. **The device path** uploads it to Node 1, then installs Node 1's key (3.6). **The Wokwi path** runs it in Wokwi with a public broker that checks the password (3.7). **The laptop path** just checks the firmware with the **Verify** button in the Arduino IDE (3.6, the first step). After that, all paths install the key in the simulator and the contract checker (3.8–3.10).

Your home broker is still open. This practice makes every program that usually connects to the broker **carry its own identity**: Node 1 carries the username `a4cf12e5b7c0` with its key, the simulator carries `f00d00000001` with its key, and the contract checker carries the account `checker`. The backend has carried its account since Practice 2. A broker that isn't locked yet doesn't check anything, so almost nothing changes on screen. That's exactly the sign that our order is right: once the broker is locked in Practice 4, everything is already ready.

> [!NOTE]
> **Two "keys" on Node 1.** Since Module 14, the `node-1-home` folder has `keys.example.h`, an example of `keys.h` for the **ESP-NOW encryption key** between Node 1 and Node 2. That's yet another key. This week's key is the **broker key**, Node 1's password to connect to Mosquitto. The broker key is deliberately not put in `keys.h`: the contents of a `.h` file go into the firmware when it's compiled, so changing the key (Practice 7) would mean recompiling and re-uploading. A key in NVS can be changed through the Serial Monitor in seconds, without touching the code.

Node 1 v1.6.0 = v1.5.0 + changes in eight files, with no new files and no new libraries:

| File | Change | How |
| :--- | :--- | :--- |
| `config.h` | version `1.6.0` and the `WOKWI_LOCKED` switch | type it (step 3.1) |
| `settings.h` / `.cpp` | the broker key in NVS, with the label `broker_key` | type it (step 3.2) |
| `networking.h` | three new functions | type it (step 3.3) |
| `networking.cpp` | connect with a username and key, the `REJECTED` log, a 60-second gap | copy from the curriculum (step 3.3) |
| `commands.cpp` | an 80-character line buffer, the `key`, `key <value>`, and `key clear` commands | copy from the curriculum (step 3.4) |
| `display.cpp`, `node-1-home.ino` | `OFFLINE: MQTT DENIED` on the display, and comments | type it (step 3.5) |

**Wokwi path:** make the changes in VS Code in your repository's `firmware/node-1-home` folder, then copy the contents of every changed file to the tab with the same name in your Node 1 Wokwi project (`node-1-home.ino` to the `sketch.ino` tab). **Except `config.h`:** in the Wokwi tab, just repeat the step 3.1 change, so that Wokwi's `USE_WOKWI = true` isn't overwritten.

#### 3.1 `config.h` (3 minutes)

1. Change its version number:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.5.0";
   ```

   to:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.6.0";
   ```

2. At the **very bottom** of the file, after the `OFFLINE_TEST_TIME` line, leave one blank line, then add:

   ```cpp
   // ---------- Module 21: the broker account ----------
   // The broker username = device_id. Its key is NOT written in the code: type "key <value>" in the Serial Monitor (stored in NVS).
   const bool WOKWI_LOCKED = false;  // Wokwi only: true = the LOCKED public broker test.mosquitto.org:1884, public account "rw"
   ```

There's only one new setting, and its value is **not** a key. `WOKWI_LOCKED` is only used by the Wokwi path (step 3.7). In your repository and on a real board, its value stays `false`.

#### 3.2 `settings.h` and `settings.cpp` (8 minutes)

1. In **`settings.h`**, below the line `bool saveTempFanThreshold(float degrees);`, add:

   ```cpp
   const char* brokerKey();                      // Module 21: the broker key from NVS; "" if none yet. NEVER print it in full
   bool saveBrokerKey(const char* value);        // Module 21: false if it isn't 1-64 characters A-Z, a-z, 0-9, - or _
   void clearBrokerKey();                        // Module 21: the "key clear" command
   ```

2. In **`settings.cpp`**, below the line `static float tempFanOn = DEFAULT_TEMP_FAN_ON;`, add:

   ```cpp
   static char key[65] = "";  // Module 21: the broker key, at most 64 characters + the end-of-text mark; "" = none yet
   ```

   The container has 65 slots: the key is at most 64 characters, plus one slot for the end-of-text mark (Module 8). A backend-made key is 43 characters long.

3. Still in `settings.cpp`, in the `loadSettings()` function, right below the line `logInfo("temp_fan_on threshold: %.1f C (%s)", tempFanOn, source);`, add:

   ```cpp
     if (archive.isKey("broker_key")) {  // Module 21; isKey first so a label that doesn't exist yet isn't treated as an error
       archive.getString("broker_key", key, sizeof(key));
     }
     logInfo("Broker key: %s", key[0] != '\0' ? "stored in NVS" : "NONE YET (type: key <value>)");
   ```

   When Node 1 starts, the key is read from NVS. Notice its log: only `stored in NVS` or `NONE YET`, never the key's contents.

4. At the **very bottom** of `settings.cpp`, after the `saveTempFanThreshold()` function, leave one blank line, then add:

   ```cpp
   // ---------- Module 21: the broker key ----------
   // Stored in NVS under the label "broker_key" (10 characters), never in the code or in Git, and never printed in full.
   const char* brokerKey() {
     return key;
   }

   // The characters allowed in a key: A-Z, a-z, 0-9, - and _ (the characters of a backend-made key). A space, =, and
   // any other character is almost certainly a copy mistake.
   static bool isValidKeyChar(char c) {
     return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' || c == '_';
   }

   bool saveBrokerKey(const char* value) {
     size_t length = strlen(value);
     if (length == 0 || length >= sizeof(key)) {  // 1-64 characters; not necessarily exactly 43 (Wokwi: readwrite)
       return false;
     }
     for (size_t i = 0; i < length; i++) {
       if (!isValidKeyChar(value[i])) {
         return false;
       }
     }
     if (strcmp(value, key) != 0) {  // same: no need to write it again (flash can only be written so many times)
       archive.putString("broker_key", value);
       snprintf(key, sizeof(key), "%s", value);
       logInfo("Broker key saved to NVS (%u chars).", (unsigned)length);
     }
     return true;
   }

   void clearBrokerKey() {
     if (archive.isKey("broker_key")) {
       archive.remove("broker_key");
       logInfo("Broker key deleted from NVS.");
     }
     key[0] = '\0';
   }
   ```

   - **`saveBrokerKey()`** rejects contents that are empty, more than 64 characters, or contain a character outside `A–Z`, `a–z`, `0–9`, `-`, and `_`. A key from the backend only uses those characters (*base64url*, Concept 2), so a space or an `=` is almost certainly a sign of a copy mistake. Its length doesn't have to be exactly 43 characters, because the Wokwi path uses the public password `readwrite`, which is only 9 characters.
   - The same key isn't written again, because the number of writes to flash memory is limited.
   - Its NVS label, `broker_key`, is 10 characters long, still under the 15-character limit (Module 8).

#### 3.3 `networking.h` and `networking.cpp` (8 minutes)

1. In **`networking.h`**, update the note on the `networkText()` line so it mentions the new display text:

   ```cpp
   const char* networkText();           // for the display: "ok, MQTT ok", "ok, MQTT down", "ok, MQTT DENIED", "disconnected", "off"
   ```

   Then, at the **very bottom** of the file, add:

   ```cpp
   const char* brokerUsername();        // Module 21: the broker username (device_id; Wokwi locked: "rw")
   bool mqttRejected();                 // Module 21: true if the broker rejected the key on the last attempt
   void changeBrokerKey();              // Module 21: a new key or a cleared one: reconnect NOW with that key
   ```

2. **`networking.cpp`** changes in many places, so its contents are replaced entirely. Open [`code/firmware/node-1-home/networking.cpp`](code/firmware/node-1-home/networking.cpp) in a new browser tab, click the **Copy raw file** icon, go back to VS Code, open `networking.cpp`, press **Ctrl + A**, then paste (**Ctrl + V**). This replacement is safe: your Pi broker address is stored in `config.h`, not in `networking.cpp`.

What's new in `networking.cpp`:

- **Connect with a username and key.** `mqtt.connect()` now carries the username (`device_id`) and the key from NVS. If there's no key yet, `nullptr` is sent: just the username, with no password.

  ```cpp
    const char* key = brokerKey();  // Module 21: from NVS; "" = none yet
    // Client name = device_id; username = device_id (Wokwi locked: rw); key from NVS (nullptr = no key);
    // then the last will: the status topic, QoS 1, retained, content "offline" (Module 11, Concept 7).
    if (mqtt.connect(deviceId, username, key[0] != '\0' ? key : nullptr, statusTopic, 1, true, "offline")) {
  ```

- **Rejected by the broker.** Codes 4 and 5 are the broker's own answer, meaning "wrong name or password" and "not authorized". Mosquitto always answers 5. Every rejection is logged, and the next attempt comes only 60 seconds later (`REJECTED_RETRY_INTERVAL`). Another failure, for example a broker that's down, is still retried every 5 seconds as before:

  ```cpp
    brokerRejected = (code == 4 || code == 5);  // Module 21: the broker's own answer, not a network problem
    if (brokerRejected) {  // logged on every attempt (at most once a minute)
      logError("MQTT REJECTED by broker (code %d): key %s. Retrying in %lu seconds.", code,
               key[0] != '\0' ? "wrong, not registered, or revoked" : "not set yet", REJECTED_RETRY_INTERVAL / 1000);
      logInfo("A new key? Type in the Serial Monitor: key <value>, then Enter.");
    } else if (code != lastFailCode) {  // the same failure isn't logged every 5 seconds
      logError("MQTT failed to connect to the broker after %lu ms: %s (code %d). Is the broker on the gateway running?",
               millis() - start, mqttStateName(code), code);
    }
    lastFailCode = code;
  ```

- **`changeBrokerKey()`** is called every time the key is changed or cleared. The old connection is closed **without a goodbye**, just like `test offline` in Module 19, then Node 1 tries to connect again with its new key right away without waiting for the gap:

  ```cpp
  // A new key (or a cleared one): try now, without waiting for the interval. The old connection is closed WITHOUT a goodbye,
  // like "test offline", so the broker publishes the "offline" last will first; once the new key is accepted, the status is "online" again.
  void changeBrokerKey() {
    brokerRejected = false;
    hasTriedMqtt = false;
    if (mqtt.connected()) {
      netClient.stop();
    }
  }
  ```

  Because there's no goodbye, the broker publishes the `offline` will first, then Node 1 publishes `online` again once it's accepted. Node 1's status blinks for a moment, and that's normal.

- **A rejection also counts toward offline mode.** If the broker keeps rejecting it for 2 minutes, Node 1 enters offline mode (Module 19) and its fan safeguard kicks in. Its log reads `OFFLINE MODE: broker rejecting the key for 120 seconds`, so you know the cause is the key, not a cable.
- The `wifi` command now also writes the broker username and whether the key is stored.
- **Only for a locked Wokwi** (`USE_WOKWI` and `WOKWI_LOCKED` both `true`), Node 1 connects to `test.mosquitto.org` port 1884 with the username `rw`, not to `broker.emqx.io`.

#### 3.4 `commands.cpp` (5 minutes)

`commands.cpp` is also replaced entirely. Open [`code/firmware/node-1-home/commands.cpp`](code/firmware/node-1-home/commands.cpp), click **Copy raw file**, then paste it in place of your whole `commands.cpp`. If you ever added your own command to this file, for example from a 🧩 of an earlier module, copy that part first, then paste it back after the replacement.

What's new in `commands.cpp`:

- **An 80-character line buffer** (`MAX_LINE_LENGTH`, previously 40). `key` plus a space plus a 43-character key is already 49 characters. The old buffer would cut the key off silently, and Node 1 would store the wrong key without saying so. A line longer than 80 characters is now rejected whole with the message `Line longer than 80 characters: ignored.`
- **Upper and lower case are preserved.** A command is usually lowercased first (`toLowerCase()`), so `LAMP ON` is the same as `lamp on`. For the key, what's stored is the original copy (`original`). If it were lowercased too, the 43-character key from the backend would never match.
- **`printKey()`** writes the key's state without revealing its contents: its length, plus the last four characters only if the key is 16 characters or more.

  ```cpp
  // Module 21: the broker key's state WITHOUT showing its content: only the length and the last 4 characters (if the key is long).
  static void printKey() {
    const char* key = brokerKey();
    size_t length = strlen(key);
    if (length == 0) {
      Serial.printf("key: NONE YET. Node 1 connects as %s without a key; a broker that is already locked will reject it.\n",
                    brokerUsername());
      Serial.println("key: type key <value> (copy it from the device registration), then Enter.");
      return;
    }
    if (length >= 16) {
      Serial.printf("key: stored in NVS, %u chars, ending ...%s\n", (unsigned)length, key + length - 4);
    } else {
      Serial.printf("key: stored in NVS, %u chars\n", (unsigned)length);  // a short key: even its end is kept secret
    }
  }
  ```

- **Three new commands**: `key`, `key clear`, and `key <value>`.

  ```cpp
    } else if (command == "key") {
      printKey();  // Module 21: the broker key's state, without showing its content
      Serial.printf("key: broker username %s, WiFi %s\n", brokerUsername(), networkText());
      return;
    } else if (command == "key clear") {
      if (brokerKey()[0] != '\0') {
        clearBrokerKey();  // Module 21: from now on Node 1 connects without a key (a locked broker rejects it)
        changeBrokerKey();
      }
      printKey();
      return;
    } else if (command.startsWith("key ")) {
      String value = original.substring(4);  // from the ORIGINAL line: the key's upper/lower case stays
      value.trim();
      if (value == brokerKey() && mqttReady()) {
        Serial.println("key: same as the stored one and already connected, not changed.");
        return;
      }
      if (!saveBrokerKey(value.c_str())) {  // the same key isn't written to NVS again
        Serial.println("key: not saved. Only A-Z, a-z, digits 0-9, - and _, no spaces, "
                       "at most 64 characters.");
        return;
      }
      changeBrokerKey();  // Module 21: tried right away, without waiting for the interval
      printKey();
      Serial.printf("key: Node 1 is trying to connect to the broker as %s with this key now.\n", brokerUsername());
      return;
  ```

  If the key you type is the same as the stored one and Node 1 is already connected, nothing is changed. If the key is the same but Node 1 is currently being rejected, it tries again **now** without waiting 60 seconds. This is useful after you fix the password file at the broker (Practice 4).

#### 3.5 `display.cpp` and `node-1-home.ino` (4 minutes)

1. In **`display.cpp`**, change the note on the `#include "networking.h"` line to:

   ```cpp
   #include "networking.h"  // Module 10: networkText(); Module 19: offlineMode(); Module 21: mqttRejected()
   ```

   Then, in the `drawStatusPage()` function, replace these two lines:

   ```cpp
     if (offlineMode()) {
       snprintf(text, sizeof(text), "OFFLINE MODE");  // Module 19: broker unreachable for more than 2 minutes
   ```

   with:

   ```cpp
     if (offlineMode()) {  // Module 19: broker unreachable for more than 2 minutes; Module 21: or the key is rejected
       snprintf(text, sizeof(text), "%s", mqttRejected() ? "OFFLINE: MQTT DENIED" : "OFFLINE MODE");
   ```

   `OFFLINE: MQTT DENIED` is 20 characters, within the OLED display's one-line limit of 21 characters at font size 1 (Module 7). Before 2 minutes, that line reads `WiFi ok, MQTT DENIED`, which is 20 characters too.

2. In **`node-1-home.ino`**, replace the first line with:

   ```cpp
   // Node 1 "Home" - firmware v1.6.0 (Module 21: connects to the broker with a username and key)
   ```

   Above the line `// New in v1.5.0: …`, insert:

   ```cpp
   // New in v1.6.0: Node 1 connects to the broker with username = device_id and its own device key. The key is never
   // written in the code: type "key <value>" in the Serial Monitor once, and Node 1 saves it in NVS. If the broker
   // rejects it (key wrong, not set, or revoked), the Serial Monitor shows REJECTED and the display DENIED, and Node 1
   // retries only every 60 seconds so the broker log doesn't flood.
   ```

   Then, in the command list, change the line `// node2 reset, rs485, rs485 on, rs485 off, test offline, restart.` to:

   ```cpp
   // node2 reset, rs485, rs485 on, rs485 off, test offline, key, key <value>, key clear, restart.
   ```

#### 3.6 Device path: upload, then install Node 1's key (10 minutes)

**The laptop path** only needs to do step 1 with the **Verify** button (the checkmark icon), not **Upload**: it works even without a board, as long as the esp32 package and the Node 1 libraries from Modules 10–15 are installed. If the Arduino IDE finishes with no errors, your firmware is ready for the day the board is there. Continue to 3.8.

1. Make sure the selected board is **ESP32 Dev Module**, with **Partition Scheme** **Minimal SPIFFS**, **Flash Mode** **DIO**, the board port **Node 1**, and **Erase All Flash Before Sketch Upload** still **Disabled** (all in the **Tools** menu). Click **Upload**. The Arduino IDE writes roughly:

   ```text
   Sketch uses 1194928 bytes (60%) of program storage space. Maximum is 1966080 bytes.
   Global variables use 56684 bytes (17%) of dynamic memory, leaving 270996 bytes for local variables. Maximum is 327680 bytes.
   ```

   Its size is about 2.6 kilobytes larger than v1.5.0 and still far from the limit.

2. Open Node 1's Serial Monitor (**New Line**, 115200 baud). Among its first lines are (**example**: these lines were recorded by the author in Wokwi with the public broker open, then the broker address and `device_id` replaced with the device path's):

   ```text
   [00:00:02] INFO  Node 1 Home - firmware 1.6.0
   [00:00:02] INFO  Broker key: NONE YET (type: key <value>)
   [00:00:05] INFO  MQTT connected to broker 192.168.1.37:1883 in 954 ms, as a4cf12e5b7c0
   ```

   Node 1 now connects with the username `a4cf12e5b7c0`, but **without a key**, and the still-open broker still accepts it.

3. Take Node 1's key from your password manager, the one you saved in Practice 1.9 with the name `broker key a4cf12e5b7c0`. In the Serial Monitor's send box, type `key` and one space, paste the key (**Ctrl + V**), then press **Enter**. **Expected output** (**example**, with this module's example key; its origin is the same as step 2):

   ```text
   [00:00:13] INFO  Broker key saved to NVS (43 chars).
   key: stored in NVS, 43 chars, ending ...ejOE
   key: Node 1 is trying to connect to the broker as a4cf12e5b7c0 with this key now.
   [00:00:13] ERROR MQTT DISCONNECTED: connection lost (code -3). Node 1 keeps working and retries every 5 seconds.
   [00:00:13] INFO  MQTT connected to broker 192.168.1.37:1883 in 471 ms, as a4cf12e5b7c0
   ```

   - **Match the ending.** Compare `...ejOE` with the last four characters of the key in your password manager. This way you make sure the key was copied in full without showing it.
   - **The `MQTT DISCONNECTED` in the middle is deliberate.** Node 1 closes the old connection so it can connect again with its new key. Node 1's status is briefly `offline` (visible in the small terminal or the backend log), then `online` again. Telegram stays quiet, because the disconnect is well under 60 seconds (Module 19).
   - **The broker is still open, so any key is accepted**, even a mistyped one. What we make sure of here is that Node 1 **stores and carries** its key. Whether that key is correct is only known after the broker is locked in Practice 4. That's what matching the last four characters is for.

   If what appears is `key: not saved. Only A-Z, a-z, digits 0-9, - and _, no spaces, at most 64 characters.`, a quote mark `"` from the Bruno answer was probably copied too. Copy the key again without the quote marks.

4. Type `restart`. After Node 1 starts again, the Serial Monitor writes `Broker key: stored in NVS`, then Node 1 connects as usual. The key is in NVS, so it stays after a restart, after a power outage, and after the next firmware upload (as long as **Erase All Flash Before Sketch Upload** stays **Disabled**).
5. Type `wifi`. Among its lines are (**example**, its origin is the same as step 2):

   ```text
   mqtt: connected to 192.168.1.37:1883 as a4cf12e5b7c0
   mqtt: username a4cf12e5b7c0, key stored (details: type key)
   ```

Compilation fails with `'brokerKey' was not declared in this scope`? The line in `settings.h` (step 3.2) was missed. A similar message for `brokerUsername`, `mqttRejected`, or `changeBrokerKey` means a line in `networking.h` was missed (step 3.3), and for `WOKWI_LOCKED`, the new part in `config.h` (step 3.1) was missed.

#### 3.7 Wokwi path: rejected first, then accepted (12 minutes)

Wokwi can't reach your home broker, so since Module 11 Node 1 in Wokwi has used a public broker. For this module there's a public broker that fits: **`test.mosquitto.org`**, run by the Mosquitto project itself. Its port 1884 is **locked**: only a registered username and password are accepted. For practice, its maintainers provide the account `rw` with the password `readwrite`, written openly on the front page of [test.mosquitto.org](https://test.mosquitto.org/). That password really is nobody's secret. With this broker, your Node 1 can feel "rejected" then "accepted" before the home broker is locked.

> [!WARNING]
> **Don't type your real device key in Wokwi**, for example the `f00d00000001` key from Practice 1. Node 1 in Wokwi sends the key to the public broker over the internet without encryption (Concept 10). In Wokwi, just use the public password `readwrite`.

1. In the **`config.h`** tab of your Wokwi project, make sure `USE_WOKWI = true`, then change the `WOKWI_LOCKED` line to:

   ```cpp
   const bool WOKWI_LOCKED = true;  // Wokwi only: true = the LOCKED public broker test.mosquitto.org:1884, public account "rw"
   ```

   There are no new libraries, so the `libraries.txt` and `diagram.json` tabs don't change. Click **▶**.

2. **Expected output** (**Wokwi test recording**, trimmed):

   ```text
   [00:00:02] INFO  Node 1 Home - firmware 1.6.0
   [00:00:02] INFO  Broker key: NONE YET (type: key <value>)
   [00:00:03] INFO  Wokwi mode: connecting to Wokwi-GUEST without the portal, public broker test.mosquitto.org:1884.
   [00:00:05] INFO  WiFi connected to "Wokwi-GUEST": IP 10.10.0.1, signal -70 dBm, channel 6
   [00:00:06] ERROR MQTT REJECTED by broker (code 5): key not set yet. Retrying in 60 seconds.
   [00:00:06] INFO  A new key? Type in the Serial Monitor: key <value>, then Enter.
   ```

   Node 1 connects as `rw` with no password, and the broker rejects it with code 5. Type `key` to see its state:

   ```text
   key: NONE YET. Node 1 connects as rw without a key; a broker that is already locked will reject it.
   key: type key <value> (copy it from the device registration), then Enter.
   key: broker username rw, WiFi ok, MQTT DENIED
   ```

3. Don't rush. Let Node 1 be rejected for 2 minutes by the clock in the Serial Monitor (Wokwi runs slower than real time, so it can take a few minutes). **Expected output** (**Wokwi test recording**, sensor lines removed):

   ```text
   [00:01:06] ERROR MQTT REJECTED by broker (code 5): key not set yet. Retrying in 60 seconds.
   [00:01:06] INFO  A new key? Type in the Serial Monitor: key <value>, then Enter.
   [00:02:03] ERROR OFFLINE MODE: broker rejecting the key for 120 seconds. Local safety active: fan turns on above 30.0 C.
   [00:02:06] ERROR MQTT REJECTED by broker (code 5): key not set yet. Retrying in 60 seconds.
   [00:02:06] INFO  A new key? Type in the Serial Monitor: key <value>, then Enter.
   ```

   The attempts are exactly 60 seconds apart: `00:00:06`, `00:01:06`, `00:02:06`. After 2 minutes, Node 1 enters offline mode (Module 19), and its fan safeguard keeps protecting the house even though the broker rejects it.

4. Now type `key readwrite`, then **Enter**. **Expected output** (**Wokwi test recording**):

   ```text
   [00:02:09] INFO  Broker key saved to NVS (9 chars).
   key: stored in NVS, 9 chars
   key: Node 1 is trying to connect to the broker as rw with this key now.
   [00:02:10] INFO  MQTT connected to broker test.mosquitto.org:1884 in 691 ms, as rw
   [00:02:10] INFO  OFFLINE MODE ENDED after 7 seconds: broker reachable again. Local safety turned the fan on 0 time(s).
   [00:02:11] INFO  Published telemetry (10-second schedule)
   ```

   The new key is tried right away without waiting 60 seconds. Because the key is only 9 characters, `key` doesn't show its ending at all (`stored in NVS, 9 chars`): the last four characters of a key that short would give away too much of it. The OLED display tells the same story:

   ![Composite built from the Wokwi simulation of Node 1 v1.6.0 (a Wokwi test recording), showing the locked broker rejecting then accepting. Title: Node 1 in Wokwi, rejected then accepted by the locked broker; the public broker test.mosquitto.org port 1884 (practice account rw) checks the password; Wokwi test recording. First card, red band, titled 1. No key, arrow, REJECTED (code 5). On the left, Node 1's OLED screen: Uptime 00:00:14, Restart POWERON, Boot #1, the line WiFi ok, MQTT DENIED, then v1.6.0 free 207KB. On the right, a Serial Monitor snippet: the line ERROR MQTT REJECTED by broker (code 5): key not set yet. Retrying in 60 seconds, then INFO New key? Type in the Serial Monitor: key <value>, then Enter. Caption: Screen WiFi ok, MQTT DENIED; Node 1 retries every 60 seconds. Second card, green band, titled 2. Type key readwrite, arrow, ACCEPTED. On the left, the OLED screen: Uptime 00:02:16, Restart POWERON, Boot #1, the line WiFi ok, MQTT ok, then v1.6.0 free 205KB. On the right, a Serial Monitor snippet: INFO MQTT connected to broker test.mosquitto.org:1884 in 691 ms, as rw, then OFFLINE MODE ENDED after 7 seconds, and INFO Published telemetry (10-second schedule). Caption: Screen WiFi ok, MQTT ok; telemetry flows again.](assets/wokwi-broker-key.png)

5. **Also try:**
   - **Upper and lower case.** Type `key READWRITE`. Node 1 stores it as is, closes the connection, then is rejected: `MQTT REJECTED by broker (code 5): key wrong, not registered, or revoked. Retrying in 60 seconds.` Type `key readwrite` again to reconnect.
   - **The key survives a restart.** Type `restart`. After it starts again, the Serial Monitor writes `Broker key: stored in NVS`, and Node 1 connects right away.
   - **A Wokwi habit.** Stop the simulation (**■**), then run it again (**▶**). The key is gone (`Broker key: NONE YET`), because Wokwi clears NVS every time the simulation is stopped (Module 8). On a real board, the key stays.
   - **Invalid contents.** Type `key read write`, with a space in the middle. Node 1 stores nothing: `key: not saved. Only A-Z, a-z, digits 0-9, - and _, no spaces, at most 64 characters.`

To go back to the open public broker like in Module 19, change `WOKWI_LOCKED` in the Wokwi tab back to `false`.

#### 3.8 The Module 21 device simulator and contract checker (8 minutes)

Steps 3.8–3.10 are for **all paths**. The Wokwi path uses the broker on the laptop, the same as the laptop path.

1. Open [`code/tools/device-simulator.js`](code/tools/device-simulator.js) on GitHub, click **Copy raw file**, then paste it in place of your whole **`tools/device-simulator.js`**.
2. Do the same for [`code/tools/contract-checker.js`](code/tools/contract-checker.js) → **`tools/contract-checker.js`**, and for [`code/tools/README.md`](code/tools/README.md) → **`tools/README.md`** (the `tools` folder's description now mentions the broker account and `--env-file=.env`).
3. Open **`tools/.env.example`**, then replace its whole contents with:

   ```text
   # Copy this file to .env (in the tools folder), then fill in the account and its key. The .env file doesn't go into Git.
   # Use a viewer account: the small terminal only looks, so it doesn't need admin rights.
   TERMINAL_EMAIL=viewer@home.test
   TERMINAL_PASSWORD=
   # Module 21: the broker account for contract-checker.js (may only read msh/#). Make its password like the backend's JWT_SECRET:
   #   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   CHECKER_USERNAME=checker
   CHECKER_KEY=
   # Module 21: the simulator's practice-device broker keys, one line per device (from the POST /devices answer in the backend)
   KEY_F00D00000001=
   ```

What's new in both tools:

- **The simulator:** every fake device connects with its own account.

  ```js
      username: deviceId, // Module 21: the broker username = device_id
      password: deviceKey(deviceId), // Module 21: from tools/.env
  ```

  `deviceKey()` reads `KEY_F00D00000001`, `KEY_F00D00000002`, and so on from `tools/.env`. A device whose key is missing is **not started at all**, because without a key it would be rejected by the locked broker anyway. If the broker rejects its key, the simulator writes `REJECTED by broker (code 5)` and retries every 60 seconds, the same as Node 1. The `clean` mode now only clears the retained status of fake devices that have a key, because every device may only write to its own topic (Practice 5).
- **The contract checker** (version 1.4) connects with the `checker` account:

  ```js
    username: process.env.CHECKER_USERNAME, // Module 21: the "read only" account from tools/.env (empty = no account)
    password: process.env.CHECKER_KEY,
  ```

  In Practice 5, this account is only allowed to **read** `msh/#`, because the checker never writes anything. The broker address may now also carry a *port*, for example `127.0.0.1:1884`. Without a *port*, the checker still uses 1883.

4. Make a password for the `checker` account. In the second terminal, run the same command as in Practice 2:

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Save the result in your password manager with the name `checker broker account`. This password is installed at the broker in Practice 4.
5. Open your own **`tools/.env`** (not `.env.example`), the file you made in Module 20 for the small terminal. Below the two existing lines, add these three lines, then save:

   ```text
   CHECKER_USERNAME=checker
   CHECKER_KEY=password-from-step-4
   KEY_F00D00000001=the-practice-device-key-from-practice-1
   ```

   `KEY_F00D00000001` is filled in with the practice device key you saved in Practice 1.9 with the name `broker key f00d00000001`. Write it exactly like the example: no spaces around `=` and no quote marks.

#### 3.9 Try it: everyone carries a key, the broker is still open (10 minutes)

1. In the third terminal (the `tools` folder), first try it **without** `--env-file=.env`, so you know its message. Replace `192.168.1.37` with your broker's address (laptop and Wokwi paths: `127.0.0.1`):

   ```text
   node device-simulator.js mqtt://192.168.1.37:1883 1
   ```

   **Expected output:**

   ```text
   f00d00000001: no key in tools/.env (KEY_F00D00000001=...), not started.
   No fake device has a key. Fill in tools/.env, then run with: node --env-file=.env …
   ```

   Without `--env-file=.env`, Node.js doesn't read `tools/.env`, so the simulator finds no key at all and stops by itself.

2. Now run it correctly, for two practice devices:

   ```text
   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 2
   ```

   **Expected output** (**example**):

   ```text
   f00d00000002: no key in tools/.env (KEY_F00D00000002=...), not started.
   1 fake device(s) heading to mqtt://192.168.1.37:1883. Type "temp 33" or "temp random". Stop with Ctrl+C.
   f00d00000001: online
   f00d00000001: thresholds same as the stored ones {"temp_fan_on":30,"soil_watering":30}
   f00d00000001: command c-20261022-191150-1 -> ok=true
   ```

   `f00d00000002` has no key, because you didn't register it, so it isn't started. `f00d00000001` connects with its username and key. The last two lines are the retained `config` from the Module 19 rule, received again every time the device connects. Leave the simulator running.

3. In the fourth terminal (also in the `tools` folder), run the contract checker with its account. The laptop and Wokwi paths just write `node --env-file=.env contract-checker.js`, without an address:

   ```text
   node --env-file=.env contract-checker.js 192.168.1.37
   ```

   **Expected output** (**example**, trimmed):

   ```text
   Contract checker ready on broker 192.168.1.37:1883 (subscribed to msh/#) — press Ctrl + C to stop.
   [2:18:26 AM] msh/f00d00000001/cmd  PASS  [retained]
   [2:18:26 AM] msh/a4cf12e5b7c0/status  PASS  [retained]
   [2:18:26 AM] msh/246f28b1c7d4/status  PASS  [retained]
   [2:18:26 AM] msh/f00d00000001/status  PASS  [retained]
   [2:18:29 AM] msh/f00d00000001/telemetry  PASS
   [2:18:33 AM] msh/a4cf12e5b7c0/telemetry  PASS
   [2:18:38 AM] msh/246f28b1c7d4/telemetry  PASS  (Node 2 telemetry)
   ```

   Everything is `PASS`. The laptop and Wokwi paths only see the `f00d00000001` lines. Stop the checker with **Ctrl + C** after a few lines.

4. In Bruno, send **`login admin`**, then **`device list`**. The devices carrying a key are now `"status": "online"` and `"key": "active"`. **Expected output** (**example**, one row only):

   ```json
   {
     "device_id": "f00d00000001",
     "name": "Practice living room",
     "location": "living room",
     "kind": "node1",
     "status": "online",
     "last_seen": "2026-10-22T19:21:19Z",
     "key": "active",
     "registered_at": "2026-10-22T19:09:28Z",
     "key_created_at": "2026-10-22T19:09:28Z",
     "revoked_at": null,
     "linked_via": null
   }
   ```

   On the device path, the `a4cf12e5b7c0` row is also `online` and `active`, and Node 2 stays `no-key` with `linked_via` `a4cf12e5b7c0`.

5. **Device path:** see the proof in the broker log. In the SSH terminal to the Pi, run:

   ```bash
   sudo tail -n 20 /var/log/mosquitto/mosquitto.log
   ```

   Among its last lines are (**example**, written from the Mosquitto 2.0.21 source code):

   ```text
   1792811707: New client connected from 192.168.1.23:52731 as a4cf12e5b7c0 (p2, c1, k15, u'a4cf12e5b7c0').
   1792811768: New client connected from 192.168.1.10:50837 as f00d00000001 (p2, c1, k15, u'f00d00000001').
   1792811769: New client connected from 192.168.1.10:50839 as checker-7dc9cd (p2, c1, k60, u'checker').
   ```

   Up to Module 20, Node 1's line ended `(p2, c1, k15).` Now there's `u'…'`, the username each client carries. The password and key are never written in the broker log. The backend line (`u'backend'`) has appeared since Practice 2. Only one client still comes with no name: Node-RED, whose client name starts with `nodered`. It gets its account in Practice 4.

If you continue straight to Practice 4, leave the simulator running. If you want a break first, just stop it with **Ctrl + C**; Practice 4 runs it again.

#### 3.10 Save to the branch (3 minutes)

Before saving, make sure all eight files in your repository's `firmware/node-1-home` folder hold the new version (if you use Wokwi, not just its Wokwi tabs), and that `WOKWI_LOCKED` in your repository's `config.h` stays `false`. In the second terminal (the `backend` folder), type:

```text
git add ../firmware/node-1-home ../tools/device-simulator.js ../tools/contract-checker.js ../tools/README.md ../tools/.env.example
git status
git commit -m "Devices carry a key: Node 1 v1.6.0, the simulator and checker with a broker account (Module 21 Practice 3)"
```

`tools/.env`, which now holds the practice device key and the `checker` account password, doesn't go into Git, and `git status` doesn't mention it. Node 1's key is only in its board's NVS, not in any file.

> ⬆️ **Done with Practice 3?** Read [Concept 6](#6-the-brokers-doorkeeper-a-password-file-and-one-account-per-program), then continue to [Practice 4 — Locking the broker's door](#practice-4--locking-the-brokers-door-60-minutes).

### Practice 4 — Locking the broker's door (60 minutes)

> 🖥️ **Tools used:** **Device path:** the SSH terminal to the Pi (`ssh budi@192.168.1.37`) and the Node-RED editor in the browser (`http://192.168.1.37:1880`). **Laptop and Wokwi paths:** **Terminal (Admin)** on Windows (macOS: **Terminal**) to stop the Mosquitto service, then the VS Code terminal in the `edge` folder. **All paths:** **MQTTX**, **Bruno**, and the VS Code terminals running the backend and the simulator. Concepts used: Concept 6, plus one line from Concept 8.
>
> ⭐ **Required** — the first pass requirement: MQTTX without a password is rejected by the broker.

Every rightful resident of the house already holds its key. Now it's the broker's turn to check that key. There are three jobs: make a **password file** with one account per program, give Node-RED its account (device path), then change the broker settings and restart it. After that, guests without a password are rejected.

These are the accounts to create. All their passwords are already in your password manager, except two that are made in step 4.1:

| Account (username) | Used by | Its password | Path |
| :--- | :--- | :--- | :--- |
| `backend` | the backend (`backend/.env`) | the random password from Practice 2.6 | all |
| `nodered` | Node-RED on the Pi | a new random password (step 4.1) | device |
| `monitor` | your MQTTX | a new random password (step 4.1) | all |
| `checker` | the contract checker (`tools/.env`) | the random password from Practice 3.8 | all |
| `a4cf12e5b7c0` | Node 1 (use your own `device_id`) | Node 1's key from Practice 1.9 | device |
| `f00d00000001` | the simulator, the practice device | the practice device key from Practice 1.9 | all |

Node 2 needs no account: it never connects to the broker itself, because its messages are forwarded by Node 1 over ESP-NOW. A laptop path that still runs Node-RED on the laptop (Module 13 Practice 8) also makes a `nodered` account.

#### 4.1 Two new passwords: `nodered` and `monitor` (3 minutes)

In the second VS Code terminal, run the password-making command from Practice 2 **twice**:

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Save the first result in your password manager with the name `nodered broker account`, and the second with the name `monitor broker account`. A laptop path without Node-RED only needs to make the second one.

#### 4.2 Device path: list the accounts on the Pi (10 minutes)

All the commands in this step are typed **on the Pi**, through the SSH terminal. Leave this SSH terminal open until Practice 4 is done: it's your way back in if something goes wrong (safety rule number 3).

1. Create the password file with the first account, `backend`:

   ```bash
   sudo mosquitto_passwd -c /etc/mosquitto/broker-passwd backend
   ```

   The terminal asks `Password:`. Paste the `backend` account's password from your password manager by right-clicking (macOS: **Cmd + V**), then press **Enter**. The password **doesn't show at all**, just like in the Quick Win. Repeat for `Reenter password:`. If it works, the Pi's `mosquitto_passwd` writes nothing.

   The file is deliberately placed in `/etc/mosquitto`, **outside** the `conf.d` folder. The `conf.d` folder is only for `.conf` settings files that the broker reads when it starts.

2. Add the five other accounts, one command per account. Note: **without `-c`**.

   ```bash
   sudo mosquitto_passwd /etc/mosquitto/broker-passwd nodered
   sudo mosquitto_passwd /etc/mosquitto/broker-passwd monitor
   sudo mosquitto_passwd /etc/mosquitto/broker-passwd checker
   sudo mosquitto_passwd /etc/mosquitto/broker-passwd a4cf12e5b7c0
   sudo mosquitto_passwd /etc/mosquitto/broker-passwd f00d00000001
   ```

   Run them one by one, and each time paste the matching password from the table above, twice. For `a4cf12e5b7c0` and `f00d00000001`, the password is the **device key** from Practice 1.9: the same key that's stored in Node 1's NVS and in `tools/.env`.

   > [!WARNING]
   > **`-c` is only for the first account.** `-c` means "create a new file". On the Pi, `-c` **overwrites the old file without asking**, so all the existing accounts are lost too. If you did it by accident, just redo steps 1 and 2 from the start.

3. Hand the file to the broker, then close it to everyone else:

   ```bash
   sudo chown mosquitto:mosquitto /etc/mosquitto/broker-passwd
   sudo chmod 600 /etc/mosquitto/broker-passwd
   ```

   On the Pi, the broker starts as `root`, then immediately switches to the `mosquitto` user before reading the password file. `chown` makes `mosquitto` the owner of that file, and `chmod 600` means only the owner may read and write it. According to the Mosquitto source code, without `chown` the broker can't read the file made by `sudo` and **fails to start** in step 4.4.

4. Check the result:

   ```bash
   sudo ls -l /etc/mosquitto/broker-passwd
   sudo cat /etc/mosquitto/broker-passwd
   ```

   **Expected output** (**example**; the salt and fingerprint replaced with `…`):

   ```text
   -rw------- 1 mosquitto mosquitto 739 Oct 23 10:21 /etc/mosquitto/broker-passwd
   backend:$7$101$…$…
   nodered:$7$101$…$…
   monitor:$7$101$…$…
   checker:$7$101$…$…
   a4cf12e5b7c0:$7$101$…$…
   f00d00000001:$7$101$…$…
   ```

   `-rw-------` means only the owner, `mosquitto`, may read and write. There are six lines, one per account. Each line holds a username, the `$7$` recipe with 101 rounds, a 16-character salt, and an 88-character fingerprint, so it's 120–125 characters long (Concept 6). Not a single real password or key is in this file.

#### 4.3 Device path: Node-RED uses its account (5 minutes)

The broker is still open, so a Node-RED that carries an account is still accepted as usual. Do this **before** the broker is locked; otherwise your dashboard is rejected.

1. Open the Node-RED editor in the laptop browser, `http://192.168.1.37:1880`, then log in with the editor account from Module 13.
2. Double-click one of the MQTT nodes, for example `telemetry Node 1`. On the **Server** row (`Mosquitto at the gateway`), click the **pencil icon** to its right.
3. In the broker settings window, open the **Security** tab. Fill in **Username** with `nodered`, then paste the `nodered broker account` password into **Password**.
4. Click **Update**, then **Done**, then **Deploy** at the top right.

The green `connected` dot under the MQTT nodes stays on. All the MQTT nodes use the same broker node, so the account only needs to be filled in once (Module 13). Like Node-RED's other passwords, this username and password are kept locked in `flows_cred.json`, don't go into the `edge/node-red-flows.json` export, and don't go into Git.

#### 4.4 Device path: lock the door, then restart (10 minutes)

1. In the SSH terminal, open the broker settings file from Module 12:

   ```bash
   sudo nano /etc/mosquitto/conf.d/gateway-pi.conf
   ```

   Delete all its contents: press **Ctrl + K** repeatedly until the file is empty. Then type the new contents below, save (**Ctrl + O**, **Enter**), and exit (**Ctrl + X**):

   ```text
   # gateway-pi.conf - the Mini Smart Home broker on the Raspberry Pi gateway (Module 12), locked in Module 21.
   # Location on the Pi: /etc/mosquitto/conf.d/gateway-pi.conf. Accounts are in /etc/mosquitto/broker-passwd (mosquitto_passwd).
   # Traffic isn't encrypted yet: don't set up port forwarding to the Pi (Module 27).
   listener 1883
   # without a registered username and password, no one may connect
   allow_anonymous false
   password_file /etc/mosquitto/broker-passwd
   # the client name is always = the username (device_id): no one can impersonate or kick another device
   use_username_as_clientid true
   ```

   The lines that start with `#` are only notes for humans and may be shortened. The other four lines must be typed exactly:

   - `listener 1883`: the same port as in Module 12.
   - `allow_anonymous false`: a guest with no username may not connect.
   - `password_file /etc/mosquitto/broker-passwd`: the list of accounts from step 4.2.
   - `use_username_as_clientid true`: every guest's client name is replaced with its username, so no one can impersonate another device's client name. The full reason is in Concept 8.

2. Restart the broker. This is a **restart**, not a *reload*: `use_username_as_clientid` isn't read on a *reload* (Concept 9).

   ```bash
   sudo systemctl restart mosquitto
   systemctl status mosquitto
   ```

   `Active:` must be `active (running)`. See `failed`? Open "The broker fails to start after it's locked" in 🚨. Your SSH terminal is still open, so you can fix it right away.

3. See who connects again:

   ```bash
   sudo tail -n 20 /var/log/mosquitto/mosquitto.log
   ```

   **Expected output** (**example**, written from the Mosquitto 2.0.21 source code, trimmed):

   ```text
   1792813805: mosquitto version 2.0.21 terminating
   1792813805: Saving in-memory database to /var/lib/mosquitto//mosquitto.db.
   1792813806: mosquitto version 2.0.21 starting
   1792813806: Config loaded from /etc/mosquitto/mosquitto.conf.
   1792813806: Opening ipv4 listen socket on port 1883.
   1792813806: Opening ipv6 listen socket on port 1883.
   1792813806: mosquitto version 2.0.21 running
   1792813807: New connection from 192.168.1.23:52741 on port 1883.
   1792813807: New client connected from 192.168.1.23:52741 as a4cf12e5b7c0 (p2, c1, k15, u'a4cf12e5b7c0').
   1792813811: New connection from 192.168.1.10:51022 on port 1883.
   1792813811: New client connected from 192.168.1.10:51022 as backend (p2, c1, k60, u'backend').
   1792813812: New connection from 192.168.1.10:51024 on port 1883.
   1792813812: New client connected from 192.168.1.10:51024 as f00d00000001 (p2, c1, k15, u'f00d00000001').
   ```

   Everything that carries a key connects again within a few seconds. Notice the backend's name: it used to be `backend-2a2580` (a random name made by the backend), now it's **`backend`**, the same as its account name. That's `use_username_as_clientid` at work. Node-RED is now recorded as `nodered` too. If a program doesn't carry an account yet, the log shows a line `Client … disconnected, not authorised.` A line like that from your MQTTX is expected; we discuss it in 4.6.

4. **On the laptop**, open `edge/gateway-pi.conf` in VS Code, then replace its whole contents with the same contents as in step 1. This file is a copy of the Pi settings in your repository, and is saved to Git in 4.8.

Continue to 4.6. Step 4.5 is only for the laptop and Wokwi paths.

#### 4.5 Laptop and Wokwi paths: list the accounts and the locked broker in a terminal (15 minutes)

Like Module 19 Practice 7, the locked broker runs in a **VS Code terminal** from the `edge` folder, not as a service. That way the broker log is visible right away, and restarting it is just **Ctrl + C** then running it again. How to lock the laptop service permanently is in 🔬.

1. **Make the password file.** Open a new terminal in VS Code (**Terminal → New Terminal**), which starts in the `mini-smart-home` folder, then go into the `edge` folder:

   ```text
   cd edge
   ```

   Create the first account with `-c`:

   ```text
   mosquitto_passwd -c broker-passwd backend
   ```

   **Expected output** (**example**, Mosquitto 2.1.2):

   ```text
   Adding password for user backend
   Password:
   Reenter password:
   ```

   At each question, paste the `backend` account's password (**Ctrl + V**; macOS: **Cmd + V**), then press **Enter**. The password doesn't show. Then add the other accounts, **without `-c`**, and paste the matching password from the table above:

   ```text
   mosquitto_passwd broker-passwd monitor
   mosquitto_passwd broker-passwd checker
   mosquitto_passwd broker-passwd f00d00000001
   ```

   Still running Node-RED on the laptop? Also add `mosquitto_passwd broker-passwd nodered`, then fill in its account in Node-RED as in 4.3, with the editor address `http://127.0.0.1:1880`.

   The password file made by `mosquitto_passwd` on the laptop is automatically readable only by your own account, so there's no need for `chown` like on the Pi.

2. **Keep it out of Git.** Open `.gitignore` in the `mini-smart-home` folder (not `tools/.gitignore` or `backend/.gitignore`), then add these two lines at the very bottom and save:

   ```text
   # Module 21: the broker password file (fingerprints of the MQTT accounts): never goes to GitHub. The edge/acl-broker access list may.
   edge/broker-passwd
   ```

3. **Write the settings.** Open `edge/mosquitto-lan.conf`, then replace its whole contents with:

   ```text
   # mosquitto-lan.conf - the Module 11 practice broker for the home network, locked in Module 21.
   # Run it from the edge folder: mosquitto -v -c mosquitto-lan.conf. Turn the broker off before the laptop joins a public Wi-Fi.
   # Accounts are in broker-passwd (made with mosquitto_passwd on this laptop; not in Git).
   listener 1883
   # without a registered username and password, no one may connect
   allow_anonymous false
   password_file broker-passwd
   # the client name is always = the username (device_id): no one can impersonate or kick another device
   use_username_as_clientid true
   ```

   The four settings lines are the same as on the Pi (see the explanation in 4.4 step 1), except `password_file broker-passwd`, which points to the file in this `edge` folder.

4. **Stop the laptop's Mosquitto service.** Two brokers can't use port 1883 at the same time. On Windows, open **Terminal (Admin)** (right-click the **Start** button → **Terminal (Admin)**), then:

   ```powershell
   net stop mosquitto
   ```

   On macOS: `brew services stop mosquitto`. On Linux: `sudo systemctl stop mosquitto`. From this second on, the backend and the simulator write that the broker is unreachable. That's normal; they keep trying.

   From now until the end of the module, you run the locked broker in this **terminal** (step 5), just like the Module 11 practice broker. The old Mosquitto service is deliberately left stopped so it doesn't fight over port 1883. If one day you want the locked broker to start by itself as a service (without a terminal open), the way is in 🔬 "Locking the Mosquitto service on the laptop permanently"; for this module, the broker in a terminal is enough.

5. **Start the locked broker** in that `edge` folder terminal:

   ```text
   mosquitto -v -c mosquitto-lan.conf
   ```

   **Expected output** (**example**, Mosquitto 2.1.2; the `…` lines hold feature notes and detailed `-v` output):

   ```text
   1792813805: mosquitto version 2.1.2 starting
   1792813805: Config loaded from mosquitto-lan.conf.
   …
   1792813805: Opening ipv4 listen socket on port 1883.
   1792813805: Opening ipv6 listen socket on port 1883.
   …
   1792813805: mosquitto version 2.1.2 running
   1792813806: New connection from 127.0.0.1:53611 on port 1883.
   1792813806: New client connected from 127.0.0.1:53611 as backend (p4, c1, k60, u'backend').
   …
   1792813808: New connection from 127.0.0.1:53615 on port 1883.
   1792813808: New client connected from 127.0.0.1:53615 as f00d00000001 (p4, c1, k15, u'f00d00000001').
   ```

   The backend and the simulator connect again by themselves within a few seconds. The backend's name is now **`backend`**, not `backend-2a2580` like before: that's `use_username_as_clientid` at work (Concept 8). Leave this broker terminal running during Practices 4–8.

#### 4.6 ⭐ MQTTX without a password is rejected (7 minutes)

1. In MQTTX, select your old connection, **Gateway Pi** (device path) or **Laptop broker** (laptop and Wokwi paths). That connection was made in Modules 11–12 **without** a username. If it isn't trying to connect by itself, click **Connect**.

   **Expected output:** a red notice **`Error: Connection refused: Not authorized`**, and the connection name doesn't turn green. The broker log records (**example**, written from the Mosquitto source code). On the Pi:

   ```text
   1792813862: New connection from 192.168.1.10:53388 on port 1883.
   1792813862: Client mqttx_3f9a1c2b disconnected, not authorised.
   ```

   On the laptop (2.1.2), its second line is slightly different: `Client mqttx_3f9a1c2b [127.0.0.1:53701] disconnected: not authorised.` `mqttx_3f9a1c2b` is a client name made up by MQTTX; the number on your screen is different.

   **That's the first pass requirement of this module.** A guest with no password, like the mischievous guest at the start of the module, can no longer connect to the broker, let alone turn the pump on.

2. Now give MQTTX its account. Edit that connection through its **Edit** option, like when you changed the **Host** in Modules 11–12. Fill in **Username** with `monitor`, paste the `monitor broker account` password into **Password**, then click **Connect** at the top right.

   **Expected output:** a green **`Connected`** notice. The broker log (**example**, Pi):

   ```text
   1792813901: New client connected from 192.168.1.10:53390 as monitor (p5, c1, k60, u'monitor').
   ```

   Its client name is now `monitor`, not `mqttx_3f9a1c2b`. So don't open two MQTTX connections with the `monitor` account at the same time: they'll kick each other off (Concept 8).

3. Try once more with a **wrong** password, for example delete its last character. The answer is again `Error: Connection refused: Not authorized`, exactly the same as with no password. Put the correct password back, then **Connect** again.
4. Add a subscription `msh/#` (**+ New Subscription**). Messages from all devices flow as usual.

> [!IMPORTANT]
> **The new doorkeeper checks who comes in, not yet what they may do inside.** Until Practice 5, every valid account, including `monitor` in MQTTX, may still write to any topic, including `msh/a4cf12e5b7c0/cmd`. Don't be surprised if an attempt like that still succeeds. Practice 5 installs the access list that closes it.

#### 4.7 Every resident of the house stays connected (10 minutes)

Check them one by one, from the terminals still open since Practice 3.

1. **The backend** (the first terminal). **Expected output** (**example**, trimmed; laptop path: `mqtt://127.0.0.1:1883`):

   ```text
   [02:46:33] WARN: broker not reachable yet, retrying in 5 seconds
   [02:46:33] INFO: connected to broker mqtt://192.168.1.37:1883 as backend
   [02:46:33] INFO: config c-20261022-194633-2 to f00d00000001: temp_fan_on 30 from rule 1 (retained)
   [02:46:33] INFO: config c-20261022-194633-2 to f00d00000001: ack ok=true
   ```

   The `WARN` line is written when the backend starts trying to connect again, and is followed right away by `connected … as backend`. Before it there may be one line `ERROR: MQTT error: read ECONNRESET`, depending on how the broker stopped. `npm run dev` does **not** need to be run again.

2. **The simulator** (the third terminal). **Expected output** (**example**):

   ```text
   f00d00000001: broker unreachable, retrying every 5 seconds
   f00d00000001: online
   f00d00000001: thresholds same as the stored ones {"temp_fan_on":30,"soil_watering":30}
   f00d00000001: command c-20261022-194633-2 -> ok=true
   ```

   If you stopped the simulator at the end of Practice 3, run it again: `node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 2` (laptop path: `mqtt://127.0.0.1:1883`).

3. **Node 1** (device path). In the Serial Monitor, `MQTT DISCONNECTED: …` when the broker is restarted, then a few seconds later `MQTT connected to broker 192.168.1.37:1883 … as a4cf12e5b7c0`. If what appears is `MQTT REJECTED by broker (code 5): key wrong, not registered, or revoked.`, the key in NVS and in the password file don't match. Open "Node 1 or the simulator is REJECTED after the broker is locked" in 🚨.

4. **The contract checker** (the fourth terminal). The checker deliberately doesn't reconnect by itself, so run it again:

   ```text
   node --env-file=.env contract-checker.js 192.168.1.37
   ```

   **Expected output** (**example**, trimmed; laptop and Wokwi paths: without an address, and only the `f00d00000001` lines):

   ```text
   Contract checker ready on broker 192.168.1.37:1883 (subscribed to msh/#) — press Ctrl + C to stop.
   [2:47:37 AM] msh/f00d00000001/cmd  PASS  [retained]
   [2:47:37 AM] msh/a4cf12e5b7c0/status  PASS  [retained]
   [2:47:37 AM] msh/246f28b1c7d4/status  PASS  [retained]
   [2:47:37 AM] msh/f00d00000001/status  PASS  [retained]
   [2:47:39 AM] msh/246f28b1c7d4/telemetry  PASS  (Node 2 telemetry)
   [2:47:41 AM] msh/f00d00000001/telemetry  PASS
   [2:47:45 AM] msh/a4cf12e5b7c0/telemetry  PASS
   ```

   Stop it with **Ctrl + C**, then try once **without** `--env-file=.env`: `node contract-checker.js 192.168.1.37`. **Expected output:**

   ```text
   Broker 192.168.1.37:1883 rejected the checker account (code 5). Fill in CHECKER_USERNAME and CHECKER_KEY in tools/.env, then run with: node --env-file=.env contract-checker.js …
   ```

   Without `tools/.env`, the checker comes with no name, and the broker rejects it like any other guest.

5. **Node-RED** (device path). Open the dashboard `http://192.168.1.37:1880/dashboard/home`. Its numbers keep changing every 10 seconds.
6. **Bruno.** Send **`login admin`**, **`device list`**, then **`health`**. The devices carrying a key stay `"status": "online"`, and `/health` writes `"broker": true`. **Expected output** (**example**, `health`):

   ```json
   {
     "ok": true,
     "broker": true,
     "database": true,
     "received": 184,
     "rejected": 0,
     "ignored": 0
   }
   ```

**Also try: one account, one connection.** While the checker is running with its account, run a second checker in another terminal with the same command. The second one connects, while the first stops with the message (**example**):

```text
Connection to broker 192.168.1.37:1883 lost: the broker was stopped, or the same checker account is used by another program (one account = one connection). Run the checker again.
Summary: 13 messages PASS, 0 messages FAIL.
```

Both of their client names are `checker` (Concept 8), and the broker only allows one connection per client name. Stop the second checker with **Ctrl + C**.

#### 4.8 Save to the branch (5 minutes)

Your repository keeps the settings of **both** brokers, whatever your path. So, before saving:

- Make sure `edge/gateway-pi.conf` holds the settings from 4.4 step 1, and `edge/mosquitto-lan.conf` holds the settings from 4.5 step 3. A device path that hasn't changed `mosquitto-lan.conf`, and a laptop path that hasn't changed `gateway-pi.conf`, should copy their contents now from those steps.
- Make sure `.gitignore` in the `mini-smart-home` folder holds the two lines from 4.5 step 2. The device path adds them too, so the password file never goes into Git if one day you make it on the laptop.

In the second terminal (the `backend` folder), first check that the password file is indeed ignored by Git:

```text
git check-ignore -v ../edge/broker-passwd
```

**Expected output** (**example**; the number `4` is the line number in your `.gitignore`):

```text
.gitignore:4:edge/broker-passwd	../edge/broker-passwd
```

That one line means Git ignores your password file. The device path sees the same line too even though the file isn't on the laptop: the rule is ready. If there's no output at all, the line in `.gitignore` isn't saved yet. Then save:

```text
git add ../edge/gateway-pi.conf ../edge/mosquitto-lan.conf ../.gitignore
git status
git commit -m "Broker locked: a password file, one account per program, use_username_as_clientid (Module 21 Practice 4)"
```

`git status` must not mention `edge/broker-passwd`. On the Pi, the password file never exists in the repository at all.

> ⬆️ **Done with Practice 4?** Read [Concept 7](#7-the-access-control-list-acl-every-device-on-its-own-topic) and [Concept 8](#8-client-ids-can-be-faked-use_username_as_clientid), then continue to [Practice 5 — The access control list](#practice-5--the-access-control-list-every-device-on-its-own-topic-45-minutes).

### Practice 5 — The access control list: every device on its own topic (45 minutes)

> 🖥️ **Tools used:** **VS Code** (a new file `edge/acl-broker`, a second terminal in the `backend` folder), **MQTTX** with the `monitor` account, **Bruno**, and the **contract checker**. **Device path:** an SSH terminal to the Pi and Node 1's Serial Monitor. **Laptop and Wokwi paths:** the broker terminal in the `edge` folder. Concepts used: Concepts 7 and 8.

The broker now knows **who** comes in. This practice sets **what** each account may do once inside, through an **access control list** (ACL) with the `%u` pattern. Start by looking at the hole that still remains.

#### 5.1 The hole that remains: MQTTX can still command (3 minutes)

In MQTTX, your connection has been in as `monitor` since Practice 4. In the send box at the bottom, choose the **Plaintext** format, set the topic to `msh/a4cf12e5b7c0/cmd` (laptop and Wokwi paths: `msh/f00d00000001/cmd`), then send this message:

```json
{"id":"c-prank-2","ts":"2026-10-24T04:00:00Z","action":"set","target":"lamp","value":true}
```

**Result:** Node 1's lamp **turns on**. The laptop and Wokwi paths see it in the simulator terminal (**example**):

```text
f00d00000001: command c-prank-2 -> ok=true
```

The backend log also writes `INFO: ack c-prank-2 arrived, but no command is waiting for it`: Node 1 answered a command the backend never sent. The `monitor` account is valid, so the doorkeeper lets it in, and inside there are no rules yet. That account is only for peeking, but right now it can turn the lamp on, and the pump just as easily. Device path: turn the lamp off again with **`lamp off`** in Bruno.

#### 5.2 Write the access control list: `edge/acl-broker` (10 minutes)

In VS Code, right-click the **`edge`** folder → **New File…**, name it **`acl-broker`** (no extension), then type:

```text
# acl-broker - the Mini Smart Home broker's access list (Module 21).
# Mosquitto reads this file from top to bottom. A line starting with # is a note (# must be the first character of the line).
# An account not mentioned here may not write or read anything.
# Every time this file changes, RESTART the broker (not reload).

# 1) Each device may only "talk" on its own topics. A pattern line applies to ALL accounts;
#    %u is replaced by the username proven with a password, that is, that device's device_id.
pattern write msh/%u/telemetry
pattern write msh/%u/status
pattern write msh/%u/vitals
pattern write msh/%u/ack
pattern read msh/%u/cmd

# 2) One exception in the data contract (rule 6): Node 1 publishes Node 2's telemetry and status.
#    Replace a4cf12e5b7c0 with your Node 1's device_id and 246f28b1c7d4 with your Node 2's device_id.
user a4cf12e5b7c0
topic write msh/246f28b1c7d4/telemetry
topic write msh/246f28b1c7d4/status

# 3) Backend: reads all device messages, sends commands (set and config) to cmd.
user backend
topic read msh/#
topic write msh/+/cmd

# 4) Node-RED on the Pi gateway: the dashboard reads, the Fan switch sends cmd.
user nodered
topic read msh/#
topic write msh/+/cmd

# 5) The contract checker (tools/contract-checker.js): read only.
user checker
topic read msh/#

# 6) Monitor (MQTTX, mosquitto_sub): looks only, including the broker statistics in $SYS.
user monitor
topic read msh/#
topic read $SYS/#
```

Replace `a4cf12e5b7c0` with your Node 1's `device_id` and `246f28b1c7d4` with your Node 2's `device_id`, exactly like the three lines the backend gave you when you registered Node 2 in Practice 1.9. The laptop and Wokwi paths may leave both as they are; that block has no effect without Node 1.

How to read it (Concept 7):

- **Block 1, `pattern`**, applies to **every** account. `%u` is replaced by the username of the account being checked. For the account `f00d00000001`, the line `pattern write msh/%u/telemetry` becomes `write msh/f00d00000001/telemetry`. Each device may write its own four topics and read its own `cmd`, nothing more.
- **Block 2, `user a4cf12e5b7c0`**, is the one exception in the data contract (rule 6): Node 1 publishes Node 2's `telemetry` and `status`, because Node 2 speaks over ESP-NOW.
- **Blocks 3–6** give rights to the programs: `backend` and `nodered` read everything and may write to any device's `cmd` (`msh/+/cmd`), while `checker` and `monitor` **only read**. `$SYS/#` is the broker's own statistics topic.
- **What isn't mentioned isn't allowed.** Once the access list is in place, any account may only do what's written here. That's why no line lets anyone write to `cmd` except `backend` and `nodered`.

A `#` note may only be at the start of a line, the same as a `.conf` file.

#### 5.3 Device path: install it on the Pi, then restart (10 minutes)

1. **Send the file to the Pi.** In the second terminal (the `backend` folder), copy it with `scp`, the tool from Module 12 Practice 6.2, this time in the other direction: **from** the laptop **to** the Pi.

   ```text
   scp ../edge/acl-broker budi@192.168.1.37:acl-broker
   ```

   Without a slash after the colon, the file lands in your home folder on the Pi (`/home/budi`). Enter the Pi's password when asked.

2. **On the Pi** (the SSH terminal), move it into place, hand it to the broker, then clean up the copy in your home folder:

   ```bash
   sudo cp ~/acl-broker /etc/mosquitto/acl-broker
   sudo chown mosquitto:mosquitto /etc/mosquitto/acl-broker
   sudo chmod 600 /etc/mosquitto/acl-broker
   rm ~/acl-broker
   ```

   The same as the password file: outside `conf.d`, owned by `mosquitto`, and readable only by its owner. Without `chown` and `chmod`, Mosquitto 2.0.21 writes three `Warning: File /etc/mosquitto/acl-broker …` warnings to the log.

3. **Point the broker settings at the access list.** Open `sudo nano /etc/mosquitto/conf.d/gateway-pi.conf` again. The full contents now become this; what's new is the `acl_file` line, the note above the five `log_type` lines, and those five `log_type` lines themselves:

   ```text
   # gateway-pi.conf - the Mini Smart Home broker on the Raspberry Pi gateway (Module 12), locked in Module 21.
   # Location on the Pi: /etc/mosquitto/conf.d/gateway-pi.conf. Accounts are in /etc/mosquitto/broker-passwd (mosquitto_passwd),
   # the access list in /etc/mosquitto/acl-broker. Traffic isn't encrypted yet: don't set up port forwarding to the Pi (Module 27).
   listener 1883
   # without a registered username and password, no one may connect
   allow_anonymous false
   password_file /etc/mosquitto/broker-passwd
   acl_file /etc/mosquitto/acl-broker
   # the client name is always = the username (device_id): no one can impersonate or kick another device
   use_username_as_clientid true
   # note: these five types replace the default; "debug" is needed so "Denied PUBLISH" (an intruder refused) is logged
   log_type error
   log_type warning
   log_type notice
   log_type information
   log_type debug
   ```

   - **`acl_file /etc/mosquitto/acl-broker`** installs the access list.
   - **The five `log_type` lines** replace the default logging choice. The important one is **`debug`**: without that line, a refused intruder (`Denied PUBLISH`) isn't logged at all. Careful, though: writing `log_type debug` **alone** actually makes the client connect/disconnect notes disappear, so write all five. The result is a much busier log, because every message is logged too. If one day your microSD card starts to fill up, remove the `log_type debug` line; the price is that intruders are no longer logged.

   Save (**Ctrl + O**, **Enter**) and exit (**Ctrl + X**).

4. **Restart, not reload** (safe rule number 4):

   ```bash
   sudo systemctl restart mosquitto
   systemctl status mosquitto
   ```

   `Active:` must read `active (running)`. Every client reconnects within a few seconds, including the MQTTX `monitor` connection and Node-RED.

5. **On the laptop**, update the copy in your repository too: replace the whole contents of `edge/gateway-pi.conf` with the same contents as step 3.

#### 5.4 Laptop and Wokwi paths: install it on the terminal broker (5 minutes)

1. Open `edge/mosquitto-lan.conf`, then replace its whole contents with:

   ```text
   # mosquitto-lan.conf - the Module 11 practice broker for the home network, locked in Module 21.
   # Run it from the edge folder: mosquitto -v -c mosquitto-lan.conf. Turn the broker off before the laptop joins a public Wi-Fi.
   # Accounts are in broker-passwd (made with mosquitto_passwd on this laptop; not in Git), the access list in acl-broker.
   listener 1883
   # without a registered username and password, no one may connect
   allow_anonymous false
   password_file broker-passwd
   acl_file acl-broker
   # the client name is always = the username (device_id): no one can impersonate or kick another device
   use_username_as_clientid true
   ```

   The only new things are the `acl_file acl-broker` line and the note at its head. A broker started with `-v` already logs everything, including `Denied PUBLISH`, so the `log_type` lines aren't needed.

2. macOS and Linux only: `chmod 600 acl-broker` in the `edge` folder terminal, so the broker doesn't warn that the file is readable by all users. Windows doesn't check this.
3. In the broker terminal, press **Ctrl + C**, then run it again:

   ```text
   mosquitto -v -c mosquitto-lan.conf
   ```

   The backend, the simulator, and MQTTX reconnect by themselves. The contract checker, if it was running, stops too; run it again with `node --env-file=.env contract-checker.js`.

#### 5.5 Test: `monitor` may only look (7 minutes)

1. In MQTTX, make sure your connection is green again. If it isn't, click **Connect**. The `msh/#` subscription still receives messages from every device: the access list allows `monitor` to read.
2. Send the message from 5.1 to the same topic again, but this time choose **QoS 1** in the send box. **Result:** the red notice **`Error: Publish error: Not authorized`**. Node 1's lamp doesn't turn on, and the simulator stays quiet.

   Your message bubble may still appear in the list as a sent message. That's just MQTTX's note that it sent it; the broker throws the message away, and no device receives it.

3. See the proof in the broker log. **Device path:**

   ```bash
   sudo grep "Denied PUBLISH" /var/log/mosquitto/mosquitto.log | tail -n 3
   ```

   **Expected output** (**example**, written from the Mosquitto 2.0.21 source):

   ```text
   1792814461: Denied PUBLISH from monitor (d0, q1, r0, m2, 'msh/a4cf12e5b7c0/cmd', ... (89 bytes))
   ```

   **Laptop path:** the same line appears in the broker terminal, followed by `Sending PUBACK to monitor (m2, rc135)`. The number 135 (`0x87`) is the "not authorized" code sent back to MQTTX.

Why QoS 1? With **QoS 0**, the broker doesn't answer anything, so MQTTX doesn't know its message was thrown away and shows no error. The message is still thrown away. Try it yourself: send it once more with QoS 0. There's no red notice, the lamp stays off, and the broker log still records `Denied PUBLISH … (d0, q0, …)`. The same happens if your MQTTX connection uses MQTT 3.1.1: that version has no reason code in its answer. The lesson: **"sent without error" isn't necessarily "accepted"**. The proof you can trust is a device that doesn't react and the broker's log.

#### 5.6 Test: what is allowed still works (8 minutes)

1. **Commands from the backend still arrive.** **Device path:** in Bruno, send **`lamp on`**, then **`lamp off`**. **Expected output** (**example**, `lamp on`):

   ```json
   {
     "id": "c-20261022-200442-3",
     "wait_ms": 7,
     "ack": {
       "id": "c-20261022-200442-3",
       "ts": "2026-10-22T20:04:42Z",
       "ok": true,
       "state": {
         "fan": false,
         "lamp": true,
         "pump": false,
         "curtain": 90
       }
     }
   }
   ```

   The `backend` account may write `msh/+/cmd`, and Node 1 may read `msh/a4cf12e5b7c0/cmd`. **Laptop and Wokwi paths:** look at the simulator terminal. As soon as the backend reconnects after the broker is restarted, it republishes the retained `config` (Module 19), and the simulator answers it: `thresholds same as the stored ones …` then `command c-… -> ok=true`. That's also a backend command that got through the access list.

2. **The Node 2 exception works** (device path). Node 2's data still arrives, because Node 1 may publish Node 2's `telemetry` and `status`. The **Garden** card on the Node-RED dashboard still fills in every time Node 2 wakes up.
3. **The contract checker** still reads `PASS` with the `checker` account that may only read. Run it again if it stopped earlier (`node --env-file=.env contract-checker.js 192.168.1.37`; laptop path: without an address). **Expected output** (**example**, trimmed):

   ```text
   Contract checker ready on broker 192.168.1.37:1883 (subscribed to msh/#) — press Ctrl + C to stop.
   [3:02:05 AM] msh/f00d00000001/cmd  PASS  [retained]
   [3:02:05 AM] msh/a4cf12e5b7c0/status  PASS  [retained]
   [3:02:05 AM] msh/246f28b1c7d4/status  PASS  [retained]
   [3:02:05 AM] msh/f00d00000001/status  PASS  [retained]
   [3:02:06 AM] msh/a4cf12e5b7c0/telemetry  PASS
   [3:02:10 AM] msh/246f28b1c7d4/telemetry  PASS  (telemetry Node 2)
   [3:02:12 AM] msh/f00d00000001/telemetry  PASS
   ```

   Messages that the access list refuses, like the command from MQTTX earlier, never reach the checker, so there isn't a single `FAIL` stamp.

4. **Bruno `health`:** `"broker": true`.

If something stops working after this step, for example the dashboard can no longer turn on the fan or Node 2's data doesn't arrive, it's usually a mistyped `device_id` in `acl-broker`. Open "After the access list is installed, something doesn't arrive" in 🚨.

#### 5.7 Save to the branch (2 minutes)

In the second terminal (the `backend` folder):

```text
git add ../edge/acl-broker ../edge/gateway-pi.conf ../edge/mosquitto-lan.conf
git status
git commit -m "Broker access list: %u pattern, Node 2 exception, read-only accounts (Module 21 Practice 5)"
```

`acl-broker` may go into Git: its contents are only rules, with no passwords.

> ➡️ **Done with Practice 5?** Continue to [Practice 6 — The intruder is rejected and logged](#practice-6--the-intruder-is-rejected-and-logged-40-minutes).

### Practice 6 — The intruder is rejected and logged (40 minutes)

> 🖥️ **Tools used:** **Bruno**, **MQTTX** with two connections (`monitor` and a new `Intruder` connection), the broker terminal or an SSH terminal to the Pi to read the log, and the contract checker. **Device path** adds **Arduino IDE** with a Node 2 board borrowed for a short while, like in Module 15. Concepts used: Concepts 7 and 8.
>
> ⭐ **Required** — the second pass requirement: a device that impersonates another device's topic is refused by the access list, and the refusal is logged in the broker log.

The most dangerous intruder isn't a guest without a password, because such a guest has been refused at the door since Practice 4. The dangerous one is a device that **has a valid account**, then tries to do more than its rights allow: for example a practice board you once gave a key, or a board whose key leaked. In this practice you play that intruder with the test device **`c0ba00000001`**. It's registered legitimately, then tries three things:

1. using the **client name** of a victim device, so the victim is kicked off the broker;
2. publishing **fake** `telemetry` in the victim's name;
3. subscribing to **all** of the home's messages (`msh/#`).

The victim is Node 1 `a4cf12e5b7c0` (device path) or the practice device `f00d00000001` (laptop and Wokwi paths).

#### 6.1 Register the test device (5 minutes)

1. In Bruno, clone **`register practice device`** as `register test device`, then replace its **Body** with:

   ```json
   {
     "device_id": "c0ba00000001",
     "name": "Test device (intruder)",
     "location": "workbench"
   }
   ```

2. Send **`login admin`**, then **`register test device`**. **Result:** `201 Created`, with a new key and the same `steps` shape as Practice 1.9. Save its key in your password manager under the name `broker key c0ba00000001`.
3. The `register test device` request is used only once. Delete it from the collection again (right-click its name → **Delete**), so it doesn't go into Git.

Why register it legitimately? Because the intruder we want to test is exactly the one that is **valid at the door**. The backend records it as a registered device too, so the second layer doesn't help here. The only thing being tested is the broker's access list.

#### 6.2 Give the test device a broker account (5 minutes)

There's no new line in `acl-broker`: the `pattern` block already applies to any account, including `c0ba00000001`. You only need to add its account to the password file.

**Device path** (the SSH terminal to the Pi):

```bash
sudo mosquitto_passwd /etc/mosquitto/broker-passwd c0ba00000001
sudo systemctl reload mosquitto
```

Paste the `c0ba00000001` key twice. This time a **reload** is enough, because only the password file changed (Concept 9). Existing connections aren't dropped.

**Laptop and Wokwi paths:** the broker terminal is in use, so open a new terminal in VS Code, then:

```text
cd edge
mosquitto_passwd broker-passwd c0ba00000001
```

After pasting the key twice, go back to the broker terminal, press **Ctrl + C**, then run `mosquitto -v -c mosquitto-lan.conf` again. The backend, the simulator, and the MQTTX `monitor` connection reconnect by themselves.

#### 6.3 ⭐ The intruder via MQTTX (all paths, 12 minutes)

1. **Set up the observers.** In MQTTX, make sure your `monitor` connection (**Gateway Pi** or **Laptop broker**) is green and subscribed to `msh/#`. Also keep Node 1's Serial Monitor (device path) or the simulator terminal (laptop and Wokwi paths) visible on screen.
2. **Create the intruder connection.** In MQTTX, make a new connection (the **+** icon):
   - **Name**: `Intruder`
   - **Host**: `192.168.1.37` (device path) or `127.0.0.1` (laptop and Wokwi paths), **Port** `1883`
   - **Client ID**: clear its contents, then type the victim's `device_id`: `a4cf12e5b7c0` (device path) or `f00d00000001` (laptop and Wokwi paths). This is the impersonation.
   - **Username**: `c0ba00000001`, **Password**: the `c0ba00000001` key
   - **MQTT Version**: leave it at **5.0**

   Click **Connect**. **Result:** `Connected`. The account is valid, so the doorkeeper lets it in.

3. **The victim isn't kicked off.** Look at Node 1's Serial Monitor or the simulator terminal: there's no `MQTT DISCONNECTED` and no `broker unreachable`. The broker log explains why (**example**, written from the Mosquitto 2.0.21 source; on the laptop, the same line appears in the broker terminal):

   ```text
   1792815600: New connection from 192.168.1.10:53412 on port 1883.
   1792815600: New client connected from 192.168.1.10:53412 as c0ba00000001 (p5, c1, k60, u'c0ba00000001').
   ```

   MQTTX claims the name `a4cf12e5b7c0`, but the broker records it as **`c0ba00000001`**. `use_username_as_clientid` replaces the client name with the username proven by the password (Concept 8). Without that line, Node 1 would be kicked out right now.

4. **Subscribe to everything.** On the `Intruder` connection, add the subscription `msh/#`. MQTTX shows no error at all, but **not a single message comes in**, not even the retained status that usually appears right away. The access list only lets a device read its own `cmd`, and the broker filters out every other message before it's delivered.
5. **Fake telemetry.** Still on the `Intruder` connection, choose **QoS 1**, set the topic to `msh/a4cf12e5b7c0/telemetry` (laptop and Wokwi paths: `msh/f00d00000001/telemetry`), then send:

   ```json
   {"ts":"2026-10-24T04:20:00Z","fw":"6.6.6","temperature":45.5,"humidity":10,"light":0,"soil":0,"motion":true,"water_level":0}
   ```

   **Result:** the red notice **`Error: Publish error: Not authorized`**. This message's content is valid by the data contract, so what stops it is indeed the access list, not a content check in the backend.

6. **Nobody is fooled.** On the `monitor` connection, there's no `telemetry` with `"fw":"6.6.6"` or `"temperature":45.5`; there's only the victim's real reading. Device path: send **`Node 1 latest reading`** in Bruno. Its `fw` is still `1.6.0` and its temperature is still your room temperature.
7. **The refusal is logged.** **Device path** (the SSH terminal to the Pi):

   ```bash
   sudo grep "Denied PUBLISH" /var/log/mosquitto/mosquitto.log | tail -n 3
   ```

   **Expected output** (**example**, written from the Mosquitto 2.0.21 source; the last line is what you just sent):

   ```text
   1792815631: Denied PUBLISH from c0ba00000001 (d0, q1, r0, m1, 'msh/a4cf12e5b7c0/telemetry', ... (118 bytes))
   ```

   **Laptop path:** the line `Denied PUBLISH from c0ba00000001 …` appears in the broker terminal, followed by `Sending PUBACK to c0ba00000001 (m1, rc135)`.

   The name logged is the intruder's **account** name, `c0ba00000001`, not the name it claimed. The `msh/#` subscription earlier wasn't refused: Mosquitto's access list doesn't refuse subscriptions, it filters the messages as they're delivered. What's refused out in the open and logged is the `PUBLISH` to someone else's topic. **That is this module's second pass requirement.**

8. **What is really allowed still works.** Send the same message from `Intruder`, but to its own topic: `msh/c0ba00000001/telemetry`. There's no error, and the `monitor` connection receives it. A valid account may indeed speak on its own topic. That's why the test device's key must be revoked as soon as the practice is done: you do that at the end of Practice 7.

Done? Click **Disconnect** on the `Intruder` connection, then delete that connection (right-click its name → **Delete**). Don't use the `c0ba00000001` key anywhere again.

Remember the QoS lesson from Practice 5: if you send the fake telemetry with **QoS 0**, MQTTX shows nothing, and the message is still thrown away. An intruder using QoS 0 doesn't even know it failed; only the broker log does.

#### 6.4 Device path: a real intruder on the Node 2 board (15 minutes)

Now the intruder is a real ESP32 board. Borrow the Node 2 board for a while, like in Module 15; after the practice, Node 2 goes back to the garden with its own firmware.

1. Plug the Node 2 board's USB into the laptop. In Arduino IDE, open **File → New Sketch**, delete its contents, then paste the following code. Save it as `module21_intruder` in the `module-21` folder of the `learn-iot` repository.

   ```cpp
   // Module 21 - Practice 6, the SECOND board (a borrowed Node 2 board): the "intruder".
   // Only for YOUR OWN broker (Mosquitto on the Pi gateway or on the laptop), not someone else's broker.
   // This board connects to the broker with its OWN account, the test device c0ba00000001 that you registered legitimately in
   // the backend, NOT with Node 1's account. Once it is let in, it tries three things it has no right to:
   //   1. publish FAKE telemetry to Node 1's topic (msh/<NODE1_ID>/telemetry), then repeat it every 15 seconds
   //   2. subscribe to all the project's messages (msh/#)
   //   3. publish on behalf of Node 2 (msh/<NODE2_ID>/telemetry); in the access list, that right belongs only to Node 1
   // The lesson: PubSubClient doesn't know the broker threw its message away (publish() still returns true), and the msh/#
   // subscription "succeeds" but stays empty. The proof is in the broker log (the "Denied PUBLISH" line) and in the MQTTX
   // monitor, which never receives those fake messages.
   // When the practice is done: revoke the test device's key, then upload the Node 2 firmware (node-2-garden) to this board again.
   // Library: PubSubClient3 version 3.3.2 (the same as Node 1). esp32 package 3.3.12.

   #include <WiFi.h>
   #include <PubSubClient.h>  // the PubSubClient3 library version 3.3.2
   #include "secrets.h"       // WIFI_NAME, WIFI_PASSWORD, and INTRUDER_KEY; never uploaded to GitHub

   #ifndef MQTT_QOS1  // only PubSubClient3 has this name
   #error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
   #endif

   const char BROKER_ADDRESS[] = "192.168.1.37";  // REPLACE with your Pi gateway's address (the same as Node 1)
   const uint16_t BROKER_PORT = 1883;
   const char NODE1_ID[] = "a4cf12e5b7c0";        // REPLACE with your Node 1's device_id: the topic to "fake"
   const char NODE2_ID[] = "246f28b1c7d4";        // REPLACE with your Node 2's device_id
   const char INTRUDER_NAME[] = "c0ba00000001";   // the test device's device_id = client name = broker username
   const unsigned long FAKE_INTERVAL = 15000;     // the fake telemetry is repeated every 15 seconds
   const unsigned long RETRY_INTERVAL = 30000;    // connect refused? try again 30 seconds later

   WiFiClient netClient;              // TCP connection to the broker
   PubSubClient mqtt(netClient);      // MQTT runs on top of that connection
   char node1Topic[40];  // msh/<NODE1_ID>/telemetry
   char node2Topic[40];  // msh/<NODE2_ID>/telemetry
   unsigned long lastTryTime = 0;
   unsigned long lastFakeTime = 0;
   bool hasTried = false;
   int fakeNumber = 0;

   // Called by the library for every message from the msh/# subscription. If the broker access list is correct, another
   // device's message never reaches here.
   void onIncomingMessage(char* topic, byte* content, unsigned int length) {
     Serial.printf("[!] RECEIVED %s (%u bytes): if this is another device's message, the access list is leaking!\n", topic, length);
   }

   // Attempt 1: fake telemetry on behalf of Node 1. publish() returns true as soon as the message is handed to the TCP connection;
   // in MQTT 3.1.1, PubSubClient is never told that the broker threw it away.
   void publishFake() {
     fakeNumber++;
     char content[48];
     snprintf(content, sizeof(content), "{\"fw\":\"FAKE\",\"temperature\":99.9,\"n\":%d}", fakeNumber);
     bool ok = mqtt.publish(node1Topic, content);
     Serial.printf("[1] publish to %s -> publish() = %s (true does NOT mean the broker accepted it!)\n", node1Topic,
                   ok ? "true" : "false");
   }

   // Connect with its own account, then three attempts the broker's access list (ACL) should refuse.
   void tryToIntrude() {
     Serial.printf("Connecting to broker %s:%u as %s ...\n", BROKER_ADDRESS, BROKER_PORT, INTRUDER_NAME);
     if (!mqtt.connect(INTRUDER_NAME, INTRUDER_NAME, INTRUDER_KEY)) {
       int code = mqtt.state();
       Serial.printf("[x] broker refused the CONNECT (code %d): %s Retrying in %lu seconds.\n", code,
                     code == 5 ? "the test device's key is wrong or has been revoked." : "see the state() code table in Module 11.",
                     RETRY_INTERVAL / 1000);
       return;
     }
     Serial.printf("[ok] CONNECT accepted: account %s is indeed valid. Now trying what it has no right to.\n", INTRUDER_NAME);
     publishFake();
     lastFakeTime = millis();
     bool ok = mqtt.subscribe("msh/#", 1);  // also true: PubSubClient doesn't check the broker's answer (SUBACK)
     Serial.printf("[2] subscribe msh/# -> subscribe() = %s. No [!] line appears? The subscription is accepted, but empty.\n",
                   ok ? "true" : "false");
     ok = mqtt.publish(node2Topic, "{\"fw\":\"FAKE-N2\"}");
     Serial.printf("[3] publish to %s -> publish() = %s\n", node2Topic, ok ? "true" : "false");
     Serial.println("[i] Now look at the broker log (Denied PUBLISH ...) and the MQTTX monitor: the fake messages don't arrive.");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("Intruder (a borrowed Node 2 board). Only for the Module 21 broker access-list practice.");
     snprintf(node1Topic, sizeof(node1Topic), "msh/%s/telemetry", NODE1_ID);
     snprintf(node2Topic, sizeof(node2Topic), "msh/%s/telemetry", NODE2_ID);

     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     Serial.printf("Connecting to WiFi \"%s\"", WIFI_NAME);
     while (WiFi.status() != WL_CONNECTED) {  // waiting here is fine: a small practice sketch without a watchdog
       Serial.print(".");
       delay(250);
     }
     Serial.println(" connected.");
     mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
     mqtt.setCallback(onIncomingMessage);
   }

   void loop() {
     if (!mqtt.connected()) {
       if (!hasTried || millis() - lastTryTime >= RETRY_INTERVAL) {
         hasTried = true;
         lastTryTime = millis();
         tryToIntrude();
       }
       return;
     }
     mqtt.loop();  // keeps the connection alive, and runs onIncomingMessage() if a message comes in
     if (millis() - lastFakeTime >= FAKE_INTERVAL) {
       lastFakeTime = millis();
       publishFake();
     }
   }
   ```

2. Make a new tab called **`secrets.h`**, like in Module 10, then fill it with this example. Replace the three texts with your own home Wi-Fi name and password, and the `c0ba00000001` key, **not** Node 1's key:

   ```cpp
   // secrets.h - SECRET: your WiFi name and password, and the test device's key.
   // This file is an EXAMPLE. Replace the three texts below with your own.
   // In your own repository, Git ignores secrets.h through .gitignore (Module 10, Practice 1),
   // so your password and your key are never uploaded to GitHub.
   #pragma once

   const char WIFI_NAME[] = "YourHomeWiFiName";      // WiFi name (SSID), upper and lower case must match exactly
   const char WIFI_PASSWORD[] = "YourWiFiPassword";  // WiFi password
   const char INTRUDER_KEY[] = "PasteTheTestDeviceKeyHere";  // the test device c0ba00000001's key, NOT Node 1's key
   ```

   `secrets.h` has been ignored by Git in the `learn-iot` repository since Module 10, so the test device's key isn't uploaded.

3. At the top of `module21_intruder.ino`, replace `192.168.1.37`, `a4cf12e5b7c0`, and `246f28b1c7d4` with your own Pi address, Node 1 `device_id`, and Node 2 `device_id`.
4. Select **DOIT ESP32 DEVKIT V1** and the Node 2 board's port, click **Upload**, then open its Serial Monitor (115200 baud). **Expected output** (**example**: written from the sketch code; the author has compiled this sketch, but hasn't run it against a real locked broker):

   ```text
   Intruder (a borrowed Node 2 board). Only for the Module 21 broker access-list practice.
   Connecting to WiFi "YourHomeWiFiName"........ connected.
   Connecting to broker 192.168.1.37:1883 as c0ba00000001 ...
   [ok] CONNECT accepted: account c0ba00000001 is indeed valid. Now trying what it has no right to.
   [1] publish to msh/a4cf12e5b7c0/telemetry -> publish() = true (true does NOT mean the broker accepted it!)
   [2] subscribe msh/# -> subscribe() = true. No [!] line appears? The subscription is accepted, but empty.
   [3] publish to msh/246f28b1c7d4/telemetry -> publish() = true
   [i] Now look at the broker log (Denied PUBLISH ...) and the MQTTX monitor: the fake messages don't arrive.
   [1] publish to msh/a4cf12e5b7c0/telemetry -> publish() = true (true does NOT mean the broker accepted it!)
   ```

   `publish()` answers `true` every time, because PubSubClient considers its job done as soon as the message is handed to the connection. With MQTT 3.1.1, the broker never tells it the message was thrown away. The intruder thinks it succeeded.

5. The proof is elsewhere. The broker log records every attempt, and the first attempt is repeated every 15 seconds (**example**, written from the Mosquitto 2.0.21 source):

   ```bash
   sudo grep "Denied PUBLISH" /var/log/mosquitto/mosquitto.log | tail -n 3
   ```

   ```text
   1792815903: Denied PUBLISH from c0ba00000001 (d0, q0, r0, m0, 'msh/a4cf12e5b7c0/telemetry', ... (33 bytes))
   1792815903: Denied PUBLISH from c0ba00000001 (d0, q0, r0, m0, 'msh/246f28b1c7d4/telemetry', ... (17 bytes))
   1792815918: Denied PUBLISH from c0ba00000001 (d0, q0, r0, m0, 'msh/a4cf12e5b7c0/telemetry', ... (33 bytes))
   ```

   The third attempt is refused too: publishing on behalf of Node 2 is only Node 1's right (block 2 of `acl-broker`). The MQTTX `monitor` never receives `"fw":"FAKE"`, and the **Garden** card on the dashboard still shows Node 2's real data.

6. **Return Node 2.** Open the `node-2-garden` sketch from the `mini-smart-home` repository, select the board and settings for Node 2 like in Module 14, then click **Upload**. Node 2 goes back to the garden.

This practice doesn't change any file in the `mini-smart-home` repository, so there's nothing to commit.

> ➡️ **Done with Practice 6?** Read [Concept 9](#9-revoking-a-lost-devices-key), then continue to [Practice 7 — Revoking a lost device's key](#practice-7--revoking-a-lost-devices-key-40-minutes).

### Practice 7 — Revoking a lost device's key (40 minutes)

> 🖥️ **Tools used:** **Bruno**, the VS Code terminals running the backend (the first terminal) and the simulator (the third terminal), **MQTTX** with the `monitor` account, and an SSH terminal to the Pi (device path) or the broker terminal in the `edge` folder (laptop and Wokwi paths). Concepts used: Concept 9.
>
> ⭐ **Required** — the third pass requirement: a device whose key is revoked can't send data anymore.

Pretend the practice device `f00d00000001` is a board that was **lost from the porch**. Its key is still stored inside it, and anyone who finds it can use it. You revoke its key in two layers, see that it really can't send data anymore, then restore it with a new key as if the board had turned up again. Every path uses the same practice device, so your Node 1 doesn't need to be revoked.

#### 7.1 Set up what to watch (3 minutes)

1. In the third terminal (the `tools` folder), run the simulator for **one** practice device (laptop and Wokwi paths: `mqtt://127.0.0.1:1883`):

   ```text
   node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 1
   ```

   Wait until `f00d00000001: online` appears.

2. In MQTTX (`monitor`), subscribe to `msh/f00d00000001/#`. Its readings come in every 10 seconds.
3. Keep the backend log (the first terminal) visible.

#### 7.2 First layer: revoke it in the backend (5 minutes)

In Bruno, send **`login admin`**, then **`revoke practice device key`**. **Result:** `200 OK` (**example**):

```json
{
  "device_id": "f00d00000001",
  "revoked_at": "2026-10-22T20:13:23Z",
  "steps": [
    "Remove its account from the broker: mosquitto_passwd -D <broker password file> f00d00000001",
    "Reload the broker (Pi: sudo systemctl reload mosquitto; laptop: Ctrl + C then run it again)"
  ]
}
```

Look at the backend log. **Expected output** (**example**):

```text
[03:13:23] WARN: key for f00d00000001 REVOKED by account 1
[03:13:23] INFO: POST /devices/f00d00000001/revoke -> 200 (23 ms)
[03:13:29] WARN: IGNORED msh/f00d00000001/telemetry: f00d00000001 its key has been revoked
[03:14:29] WARN: IGNORED msh/f00d00000001/telemetry: f00d00000001 its key has been revoked (+5 more messages since the last log)
```

**At once**, from the next reading on, the backend ignores that device: its data doesn't reach the database, doesn't show in the small terminal, and doesn't trigger automation rules. Commands to that device are refused too. If you try one, for example through **Try it out** in `/docs` for `POST /devices/f00d00000001/command`, the answer is `409` with the body `{"message":"device f00d00000001 key has been revoked"}`.

But watch MQTTX: **its readings still come in**. The broker doesn't know anything yet, because the `f00d00000001` account is still in its password file. In the real world, that lost board can still use your home broker. That's why revocation is done in two layers.

Send **`device list`** too. The practice device's row now reads (**example**):

```json
{
  "device_id": "f00d00000001",
  "name": "Practice living room",
  "location": "living room",
  "kind": "node1",
  "status": "online",
  "last_seen": "2026-10-22T20:13:19Z",
  "key": "revoked",
  "registered_at": "2026-10-22T19:09:28Z",
  "key_created_at": null,
  "revoked_at": "2026-10-22T20:13:23Z",
  "linked_via": null
}
```

`key_created_at` is empty again, because its key's fingerprint has been removed from the database. `status` is still `online`. That column is only the device's last word, while its official state is in the **`key`** column.

#### 7.3 ⭐ Second layer: close the door at the broker (8 minutes)

**Device path** (the SSH terminal to the Pi):

```bash
sudo mosquitto_passwd -D /etc/mosquitto/broker-passwd f00d00000001
sudo systemctl reload mosquitto
```

`-D` removes one account (*delete*), without asking anything. A **reload** is enough, because only the password file changed.

**Laptop and Wokwi paths:** in the `edge` folder terminal (not the broker terminal), run `mosquitto_passwd -D broker-passwd f00d00000001`. Then, in the broker terminal, press **Ctrl + C** and run `mosquitto -v -c mosquitto-lan.conf` again.

**Expected output** in the simulator terminal:

```text
f00d00000001: broker unreachable, retrying every 5 seconds
f00d00000001: REJECTED by broker (code 5): wrong key, not registered, or revoked. Retrying in 60 seconds.
f00d00000001: REJECTED by broker (code 5): wrong key, not registered, or revoked. Retrying in 60 seconds.
```

The first line appears because the simulator's connection was just dropped; the broker itself stays alive. From then on, every connection attempt is **refused**, once a minute. In MQTTX, the `f00d00000001` readings **stop**. **That is this module's third pass requirement:** a device whose key is revoked can't send data anymore, to the backend or to the broker.

The broker log on the Pi records it (**example**, written from the Mosquitto 2.0.21 source; see it with `sudo tail -n 20 /var/log/mosquitto/mosquitto.log`):

```text
1792816205: Reloading config.
1792816205: Client f00d00000001 disconnected.
1792816210: Client f00d00000001 disconnected, not authorised.
1792816270: Client f00d00000001 disconnected, not authorised.
```

On the laptop, the broker terminal writes `Client f00d00000001 [127.0.0.1:…] disconnected: not authorised.` once a minute.

> [!NOTE]
> **If the simulator isn't disconnected after a *reload* on the Pi.** According to the Mosquitto source, a *reload* re-checks every currently connected client and disconnects the ones whose account has been removed. The Mosquitto documentation, on the other hand, writes that already-connected clients aren't affected. The author hasn't been able to prove which one is right with a real Mosquitto. If `f00d00000001` on your Pi stays connected and its readings still come into MQTTX, restart the broker with `sudo systemctl restart mosquitto`. After that, its reconnection is certainly refused. The first layer doesn't depend on this behavior: the backend has been ignoring that device since 7.2.

Two other things are also normal:

- The `offline` will isn't sent when the broker disconnects a revoked client, and the backend ignores status messages after the revocation too. So `GET /devices` can keep writing `"status": "online"`. The `key` column is the one to go by.
- If the simulator is refused for more than 2 minutes, it enters Module 19's **offline mode** (`OFFLINE MODE: broker unreachable for 2 minutes; …`) and its safety fan starts working. That's the same as a real Node 1's behavior.

#### 7.4 The board turns up: restore it with a new key (12 minutes)

The old key may not be used again, because the key might have been copied while the board was lost (Concept 9).

1. **A new key in the backend.** In Bruno, send **`rotate practice device key`**. **Result:** `200 OK` with a new key and `steps` (**example**, with this module's second example key, which is also valid nowhere):

   ```json
   {
     "device_id": "f00d00000001",
     "key": "o-kd07KCz3W-qx5u1-5A4o9wPw2OzxerY-bpiIomQOU",
     "steps": [
       "Save this key now: the key is shown only this once (the database only stores its fingerprint).",
       "Device: type  key <key>  in the Serial Monitor (simulator: KEY_F00D00000001=<key> in tools/.env)",
       "Broker: mosquitto_passwd <broker password file> f00d00000001 on the broker machine, paste the key twice, then reload the broker"
     ]
   }
   ```

   Replace the contents of `broker key f00d00000001` in your password manager with this new key. The backend log writes `a new key for f00d00000001 was made by account 1`, and from then on the backend listens to the practice device again.

2. **The new key at the broker.** **Device path:**

   ```bash
   sudo mosquitto_passwd /etc/mosquitto/broker-passwd f00d00000001
   sudo systemctl reload mosquitto
   ```

   **Laptop and Wokwi paths:** `mosquitto_passwd broker-passwd f00d00000001` in the `edge` folder terminal, then **Ctrl + C** and run the broker again in the broker terminal. Paste the new key twice.

3. **The new key on the device.** Open `tools/.env`, replace the value of `KEY_F00D00000001=` with the new key, then save. The simulator reads `.env` only at startup, so stop it with **Ctrl + C**, then run the command from 7.1 again. **Expected output** (**example**):

   ```text
   1 fake device(s) heading to mqtt://192.168.1.37:1883. Type "temp 33" or "temp random". Stop with Ctrl+C.
   f00d00000001: online
   f00d00000001: thresholds same as the stored ones {"temp_fan_on":30,"soil_watering":30}
   f00d00000001: command c-20261022-201204-1 -> ok=true
   ```

   For a real Node 1, this third step is the `key <new key>` command in the Serial Monitor (Practice 3).

4. **Check.** The `f00d00000001` readings flow again in MQTTX. In Bruno, **`device list`** writes (**example**, the practice device's row trimmed):

   ```json
   {
     "device_id": "f00d00000001",
     "status": "online",
     "key": "active",
     "key_created_at": "2026-10-22T20:17:28Z",
     "revoked_at": null
   }
   ```

   `key_created_at` is now the time the new key was made, and `revoked_at` is empty again.

Notice the order: this time the **broker is given the new key before the device**, the opposite of the first install order (Concept 3, which installs to the device first). The reason is that the broker is **already locked** now. If the device installed its new key first, it would be refused by the broker and only try again 60 seconds later — not dangerous, it just makes you wait. With the broker first, the device is accepted the moment its key is changed.

#### 7.5 Practice: revoke the test device yourself (7 minutes)

The test device `c0ba00000001` from Practice 6 still holds a valid key. Now that you know how, revoke its key yourself, **without** restoring it:

1. **Backend:** in Bruno, clone **`revoke practice device key`**, change its URL to `{{baseUrl}}/devices/c0ba00000001/revoke`, send it, then delete that clone again.
2. **Broker:** remove the `c0ba00000001` account with `mosquitto_passwd -D`, then reload the broker like in 7.3.
3. **Password manager:** don't delete it yet. Rename it to `broker key c0ba00000001 (REVOKED)`. This dead key is used once more in Practice 8 to prove that it really is invalid, then deleted.
4. **Check:** in **`device list`**, the `c0ba00000001` row writes `"key": "revoked"`.

Its row stays in the registry as a record that the device was once registered, then revoked. This practice doesn't change any file in the repository, so there's nothing to commit.

> ➡️ **Done with Practice 7?** Read [Concept 10](#10-honest-traffic-at-home-is-still-in-the-clear), then continue to [Practice 8 — Honest about encryption, and the pass tests](#practice-8--honest-about-encryption-and-the-pass-tests-40-minutes).

### Practice 8 — Honest about encryption, and the pass tests (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal running `npm run dev`, the second terminal in the `backend` folder for commands and Git, the third and fourth terminals in the `tools` folder), **MQTTX**, **Bruno**, and a **browser** already logged in to GitHub. Concepts used: Concept 10.
>
> ⭐ **Required** — see for yourself that the key travels in the clear, then a dress rehearsal of the three Module 21 pass requirements in one go.

The broker is locked, the access list is in place, and the revoked device is powerless. Before everything is sent to GitHub, this module is honest first about one thing that **isn't** safe yet: MQTT traffic is still in the clear. Then the backend rises to v1.0, and the three pass requirements are tested in sequence.

#### 8.1 ⭐ See for yourself: the key travels in the clear (10 minutes)

A device key does prove "who you are", but on the home network it's still sent **without an envelope**. Anyone who can see the packets on the same network can read it. Rather than take that on faith, you use a small **sniffer**: a middleman that stands between MQTTX and the broker, forwards everything as-is, but prints the contents of the first packet (CONNECT).

> [!WARNING]
> **Use the dead key.** To see a key on screen safely, use the `c0ba00000001` key you revoked in Practice 7.5. That key is valid nowhere anymore, so it doesn't matter if it's seen. Never run the sniffer with a key that's still active, and never record its screen.

1. Make a new file **`tools/sniffer.js`**. Its contents are simply copied from the curriculum: open [`code/tools/sniffer.js`](code/tools/sniffer.js) on GitHub, click **Copy raw file**, then paste it into the new file `tools/sniffer.js`. This tool needs no library from npm.
2. In the third terminal (the `tools` folder), run the sniffer. It listens on port 1884 (which is empty again now: you turned off the Quick Win practice broker) and forwards to your broker. Replace `192.168.1.37` with your broker's address (laptop and Wokwi paths: `127.0.0.1`):

   ```text
   node sniffer.js 192.168.1.37
   ```

   **Result:**

   ```text
   Sniffer ready on 127.0.0.1:1884, forwarding to broker 192.168.1.37:1883. Ctrl + C to stop.
   ```

3. In MQTTX, make a new connection (the **+** icon): **Name** `Via the sniffer`, **Host** `127.0.0.1`, **Port** `1884`, **Client ID** `c0ba00000001` (delete MQTTX's random default name, type this), **Username** `c0ba00000001`, **Password** the revoked `c0ba00000001` key, **MQTT Version** `3.1.1`. Click **Connect**.

   MQTTX connects to the sniffer, not straight to the broker. Because the `c0ba00000001` key is revoked, the broker refuses it (`Not authorized`), and that's fine: what we're watching is what the **sniffer** sees before the message reaches the broker. **Expected output** in the sniffer terminal (**example**; the key is the revoked key):

   ```text
   [3:23:40 AM] new connection from 127.0.0.1:62482 -> 192.168.1.37:1883
     CONNECT MQTT version 3.1.1
     client name   : c0ba00000001
     username      : c0ba00000001
     key (password): R26oUT4bKiHHIYH0tUrToMLeHTJTIFKZc7_JMFE05oc   <- readable in the clear by anyone on this path
     broker answered: CONNACK 5 (not authorized)
   ```

   The username and the **full key** are readable clearly, letter by letter. The sniffer doesn't need to know any password; it just sits on the TCP path and reads. The broker itself (`mosquitto -v`) never prints the key, but its network path is open.

4. Stop the sniffer with **Ctrl + C**, then delete the `Via the sniffer` connection in MQTTX (right-click → **Delete**). Once it's proven, **delete** `broker key c0ba00000001 (REVOKED)` from your password manager: its job is done.

This is the honest limit of Concept 10. A key answers "who are you", but it doesn't hide the contents of the conversation. On a closed home network, the risk is still small. Once the broker is opened to the internet, the envelope **must** be put on: that's TLS in Module 27, which turns `mqtt://` into `mqtts://` on port 8883. The full list of what has and hasn't been dealt with is in [Concept 10](#10-honest-traffic-at-home-is-still-in-the-clear) and 🔬 "OWASP IoT Top 10".

#### 8.2 Backend v1.0.0 (7 minutes)

Leave `npm run dev` running in the first terminal. In the second terminal (the `backend` folder), raise the version number, like in Modules 19–20:

```text
npm version 1.0.0 --no-git-tag-version
```

**Result:** `v1.0.0`. This command changes both `package.json` and `package-lock.json`, without making a commit. Then update two other places:

1. In **`backend/package.json`**, replace the `"description"` line with:

   ```json
     "description": "Mini Smart Home backend (Modules 16-21): listens to MQTT, checks the data contract, stores every message in a time-series database, and provides a history API, realtime data, commands, automation rules, schedules, and Telegram notifications, login with admin and viewer roles, plus an official device registry with a per-device key and the backend's own broker account",
   ```

2. In **`backend/src/server.ts`**, replace the two topmost comment lines (the ones that begin with `// server.ts -`) with:

   ```ts
   // server.ts - the entry point of the Mini Smart Home backend v1.0 (Module 21: the official device registry and its keys, the
   // backend's own broker account, messages from unregistered or revoked devices ignored; on top of Module 20: login, JWT in
   // cookies, roles, and API protection, and Module 19: realtime data, a single door for commands, automation rules, schedules, and Telegram notifications).
   ```

   Then, in `app.register(swagger, …)`, replace the whole `info: { … },` block with:

   ```ts
       info: {
         title: "Mini Smart Home API",
         description: "Backend v1.0 (Module 21). Every route needs a login, except the ones without a padlock. Log in first with "
           + "POST /auth/login (Try it out): the browser keeps the access cookie and sends it by itself to the other routes. "
           + "Viewer accounts can only look (GET); commands and changes are answered with 403. Devices are registered by an admin "
           + "with POST /devices; a key is shown only once, and messages from unregistered or revoked devices are ignored.",
         version: "1.0.0",
       },
   ```

Save, then run `npm run check` (no errors). The backend in the first terminal has already restarted by itself. Open `http://127.0.0.1:8080/docs` (lab path: your own port): the title is now `1.0.0`, and its description mentions device registration. The four new `/devices` routes from Practice 1 appear in the list with their padlocks.

#### 8.3 ⭐ A dress rehearsal of the three pass requirements (13 minutes)

Now the three pass requirements are tested in sequence, like an examiner coming to inspect your home. Set up MQTTX with a green `monitor` connection subscribed to `msh/#`, then work through them in order.

**Requirement 1 — a guest without a password is refused by the broker.**

1. In MQTTX, make a new connection with no username and password (or reuse your old connection from Practice 4.6 before it was given an account), to your broker on port 1883. Click **Connect**.
2. **Result:** `Error: Connection refused: Not authorized`. Delete that test connection again.

**Requirement 2 — a device impersonating another device's topic is refused by the access list.** This repeats Practice 6 briefly. If you still remember the proof from there, you may go straight to requirement 3.

3. Register the test device `c0ba00000001` again (Practice 6.1), add its account to the broker (Practice 6.2), then make an MQTTX `Intruder` connection with **Client ID** `a4cf12e5b7c0` (laptop path: `f00d00000001`) and the account `c0ba00000001`. The connection is accepted, but publishing `telemetry` to `msh/a4cf12e5b7c0/telemetry` with QoS 1 is answered with **`Error: Publish error: Not authorized`**, and the MQTTX `monitor` receives not a single fake message.
4. Revoke the `c0ba00000001` key again (Practice 7.5) so your home is clean. This just-revoked key is used in requirement 3.

**Requirement 3 — a device whose key is revoked can't send data anymore.**

5. In MQTTX, change that `Intruder` connection: clear the **Client ID** so MQTTX makes a random name, leave the account `c0ba00000001` with the key that is **already revoked**. Click **Connect**.
6. **Result:** `Error: Connection refused: Not authorized`. A device whose key is revoked can't get in anymore, the same as a guest without a password. Delete the `Intruder` connection.

If you'd rather have one tidy screen, the three requirements can also be seen from the MQTT.js library side (which MQTTX uses). Here is the rehearsal the author ran with a single script (**example**, code 135 = `0x87`, "not authorized" in MQTT 5):

```text
== Pass requirement 1: a client without a password is refused by the broker
  no username/password -> REFUSED: Connection refused: Not authorized (code 135)
== Pass requirement 2: a device impersonating Node 1's topic is refused by the ACL
  connect with account c0ba00000001, client name a4cf12e5b7c0 -> CONNECTED (the account is indeed valid)
  publish FAKE telemetry to msh/a4cf12e5b7c0/telemetry QoS 1 -> REFUSED: Publish error: Not authorized (code 135)
  FAKE Node 1 telemetry that reached other subscribers: 0 (must be 0)
== Pass requirement 3: a device whose key is revoked can't connect anymore
  connect with the REVOKED c0ba00000001 key -> REFUSED: Connection refused: Not authorized (code 135)
```

All three are proven: a guest without a password is refused, an impersonator can't write in someone else's name, and a revoked key is completely dead.

#### 8.4 Automated checks (5 minutes)

In the second terminal (the `backend` folder):

```text
npm run check
npm test
npm audit --no-progress
```

`npm run check` finishes with no errors. `npm test` writes **`Tests  35 passed (35)`** (**example**, the end):

```text
 Test Files  5 passed (5)
      Tests  35 passed (35)
   Start at  03:34:10
   Duration  3.56s (import 51%, tests 37%, transform 11%, worker 1%)
```

From 18 tests in Module 20 to **35**: 11 for the rule brain, 7 for user security, plus 4 for keys, 4 for the guest book and the second layer, and 9 for the registration routes from this module. `npm audit --no-progress` answers **`found 0 vulnerabilities`**: no new npm packages this week. (The `--no-progress` option turns off the spinning animation that sometimes gets stuck in PowerShell, like in Module 20.)

#### 8.5 Save to the branch (5 minutes)

Still in the second terminal:

```text
git add package.json package-lock.json src/server.ts ../tools/sniffer.js
git status
git commit -m "Backend v1.0.0 and an honest sniffer: MQTT traffic is still in the clear (Module 21 Practice 8)"
```

`git status` mentions only those four files; there's no `.env`, `broker-passwd`, or key anywhere. With that, all the Module 21 code is saved on the branch `feature/device-security`. The ➕ section merges it into `main` through the "device security" pull request.

> 🎉 **Phase 3 Checkpoint — a home locked for people and devices.** The last four modules built the home's brain (the backend and database, Modules 16–18), brought it to life (realtime, rules, notifications, Module 19), then locked it: for people with accounts, *login*, roles, and API protection (Module 20), and this week for devices with a per-device key, a second layer, a broker account, and an access list. The backend is now **v1.0**. You've named what isn't safe yet honestly yourself, and it's dealt with in Phase 5 (TLS in Module 27). The next phase, Phase 4, gives this home a **face**: a React dashboard you build from scratch.

> ➡️ **Done with Practice 8?** Do the [🧩 Independent Challenges](#-independent-challenges) if you like, then the steps in [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home): there the data contract rises to 1.4, the pull request template is updated, and all the Module 21 work is merged into `main` through the "device security" pull request.

## 🚨 Troubleshooting

Click the title of the problem most like the one you're having. The `mosquitto_passwd`, `mosquitto`, and `systemctl` commands are covered in Modules 11–12; what's here is specific to the new things in Module 21.

<details>
<summary><b>The broker fails to start after it's locked (<code>systemctl status</code> writes <code>failed</code>, or the broker terminal goes straight back to the <em>prompt</em>)</b></summary>

Work through it from the most common cause:

- **Device path, `chown`/`chmod` missed (Practice 4.2 step 3).** On the Pi, the broker starts as `root` then switches to the `mosquitto` user. A password file made by `sudo mosquitto_passwd` is owned by `root` and can't be read by `mosquitto`, so the broker stops. Run `sudo chown mosquitto:mosquitto /etc/mosquitto/broker-passwd /etc/mosquitto/acl-broker` then `sudo chmod 600 …`, and `sudo systemctl restart mosquitto`.
- **See the cause directly.** On the Pi: `sudo tail -n 20 /var/log/mosquitto/mosquitto.log`. On the laptop (the broker in a terminal), the message is right above the prompt that came back. The line `Error: Unable to open pwfile …` means the password file can't be read (permissions, or the wrong name in `password_file`). The line `Error: Unable to open config file …` means the wrong `.conf` file name in the `-c` command.
- **A mistyped file name.** In `gateway-pi.conf`/`mosquitto-lan.conf`, `password_file` and `acl_file` must point to files that really exist. The Pi path uses a full path (`/etc/mosquitto/broker-passwd`); the laptop path uses a relative path (`broker-passwd`), and its broker must be run **from the `edge` folder**.
- **The password file was made on the wrong machine.** A password file from the laptop (Mosquitto 2.1.2) **can't** be used by the Pi (2.0.21): its salt shape is different, and every line is thrown away with `Error: Unable to decode password salt …`. Always make the password file **on the machine where the broker runs** (Practice 4).
- **On the Pi, `restart` first (not `reload`) every time the ACL or `use_username_as_clientid` changes.** `reload` doesn't re-read `use_username_as_clientid`, and a mistyped ACL then reloaded on 2.0.21 actually makes the broker run **with no ACL** (Concept 9). With `restart`, a wrong file makes the broker stop, and the error is seen right away.

</details>

<details>
<summary><b>Node 1 or the simulator is REJECTED after the broker is locked (<code>MQTT REJECTED by broker (code 5)</code>)</b></summary>

Code 5 means the broker refused the username and key. The broker deliberately doesn't say which part is wrong, so check them one by one:

- **The key in three places must match exactly.** The same key must be in (1) the `POST /devices` answer (your password manager), (2) the broker password file (`mosquitto_passwd <id>` on the broker machine), and (3) the device (`key <value>` in the Serial Monitor, or `KEY_<DEVICE_ID>=` in `tools/.env`). If one of them differs by a single character, it's refused. Type `key` in Node 1's Serial Monitor to make sure its last four characters match the key in your password manager.
- **The username = the `device_id` in lowercase.** The account on the broker must be named exactly `a4cf12e5b7c0` (12 lowercase hexadecimal digits), not uppercase or another name.
- **The key's case.** A *base64url* key is case-sensitive. If you retype it by hand, just copy-paste it; one wrong capital letter already gets it refused.
- **The key was copied whole.** A 43-character key is sometimes cut off when copied from Bruno's answer panel, or a `"` quote is copied along with it. Make a new key with `POST /devices/:id/key`, then copy it again carefully and install it in all three places.
- **A new key? Install it in all three places.** The moment you call `POST /devices/:id/key`, the old key dies at once. Update the broker password file and the device/`.env` too, then reload the broker.
- **Node 1 tries again every 60 seconds.** After you fix the password file and reload the broker, type `key <value>` in the Serial Monitor again so Node 1 tries **now** without waiting.

</details>

<details>
<summary><b>After the access list is installed, something doesn't arrive (the dashboard can't turn on the fan, Node 2's data is gone, the checker FAILs)</b></summary>

An access list refuses silently: a refused message isn't returned with an error (except a PUBLISH QoS 1 on MQTT 5), it's just thrown away. So the symptom is "something stopped working", not an error message. Check `edge/acl-broker`:

- **A mistyped `device_id`.** The block `user a4cf12e5b7c0` and the two lines below it, `topic write msh/246f28b1c7d4/telemetry` and `topic write msh/246f28b1c7d4/status`, must use **your** Node 1 and Node 2 `device_id`s, exactly like the three lines the backend gave you in Practice 1.9. If Node 2 stops filling in on the dashboard, this is usually where the mistake is.
- **Forgot to restart after changing the ACL.** The ACL is only re-read when the broker is restarted (Pi: `sudo systemctl restart mosquitto`; laptop: **Ctrl + C** then run it again). `reload` isn't enough, and on the Pi it's actually dangerous (Concept 9).
- **`pattern` vs `topic` lines.** `pattern` applies to all accounts with `%u` replaced by their username; `topic` (inside a `user …` block) is only for that account. If you put `topic write msh/%u/telemetry` without a `user`, `%u` isn't filled in and nothing matches.
- **The backend or Node-RED lost its `cmd` right.** Make sure the `user backend` and `user nodered` blocks contain `topic write msh/+/cmd`. Without it, commands from the dashboard and the API don't reach the devices, even though the backend itself stays connected.
- **A `#` note must be at the start of a line.** The same as a `.conf` file: a `#` in the middle of a line is treated as part of the rule.

</details>

<details>
<summary><b><code>mosquitto_passwd</code> deleted the other accounts, or refuses with <code>File exists</code></b></summary>

- **All accounts gone after adding one.** You used `-c` for the second account and beyond. `-c` means "create a new file" and **overwrites** the old file. Only the first account uses `-c`; the rest don't. Redo Practice 4.2 from the start.
- **macOS: `Error: Unable to open file … for writing. File exists.`** Mosquitto 2.1.2 on macOS refuses `-c` if the file already exists (unlike the Pi, which overwrites it). Delete the old file first, or add the account without `-c`.
- **`Warning: User <name> not found in password file.`** When using `-D` (delete), that account name was already gone. Not harmful.

</details>

<details>
<summary><b>MQTTX "successfully" sends a forbidden message, or shows no error at all</b></summary>

- **QoS 0 never gives a sign.** In the MQTTX send box, QoS 0 doesn't wait for the broker's answer, so a message thrown away by the access list still looks "sent". Choose **QoS 1** to see `Error: Publish error: Not authorized`. A more trustworthy proof: the device doesn't react, and the broker log writes `Denied PUBLISH`.
- **MQTT 3.1.1 is also silent.** If your MQTTX connection uses MQTT 3.1.1, its PUBACK answer carries no reason code, so there's no red error even with QoS 1. Use **MQTT 5.0** (the MQTTX default) to see the refusal.
- **The message bubble still appears in the list.** That's MQTTX's note that it sent, not a sign the broker accepted it. What matters is that the other subscribers (`monitor`, the checker) don't receive it.

</details>

<details>
<summary><b>The backend writes <code>broker unreachable</code> then <code>broker REJECTED the backend</code></b></summary>

When the broker is **up** but refuses the backend account (the `backend` password in the broker password file is wrong), the `mqtt` library still prints `WARN: broker unreachable, retrying in 5 seconds` just before the real message, `ERROR: broker REJECTED the backend (Connection refused: Not authorized, code 5): …`. That `unreachable` line is a little misleading (the broker is actually reachable, it just refuses), but it's harmless. What you need to do is in the `REJECTED` line: check `MQTT_USERNAME`/`MQTT_PASSWORD` in `backend/.env` and the `backend` account in the broker password file, then reload the broker. Once they match, the backend recovers by itself within a minute, without `npm run dev` being restarted. `/health` writes `"broker": false` while it's refused.

</details>

<details>
<summary><b><code>GET /devices</code> writes <code>"status": "online"</code> for a device you just revoked</b></summary>

This is normal and is already explained in Practice 7.3. When the broker disconnects a client whose account is revoked, the `offline` will is **not** sent, so that device's retained `status` message can stay `online` on the broker. The backend ignores status messages after the revocation too. The right thing to go by is the **`key`** column in `GET /devices` (`revoked`), not `status`. The Module 22 dashboard later reads the `key` column too.

</details>

<details>
<summary><b>The backend suddenly "restarts by itself" during <code>npm test</code> (Windows), or <code>GET /devices/:id/vitals</code> answers 404</b></summary>

- **The backend restarts during `npm test`.** If `npm test` is run in the same folder while `npm run dev` is still alive, `node --watch` on Windows sometimes prints `Change detected in '…\node_modules\…'` and restarts the backend. The cause: Vitest reads files in `node_modules`, and the Windows file watcher also notices the files' access time. Not harmful (the backend reconnects), just confusing. Run `npm test` in a different terminal from `npm run dev`, or stop `npm run dev` for a moment.
- **`GET /devices/:id/vitals` returns 404 after the backend restarts.** `vitals` is kept in memory (a v1.0 limit), so it's empty again every time the backend restarts, until the device sends its next `vitals` (Node 1 only sends it when it connects and every 5 minutes). The `telemetry` that flows every 10 seconds isn't affected. Wait a few minutes, or reconnect the device.

</details>

<details>
<summary><b><code>scp</code> to the Pi fails, or the file doesn't appear where it should</b></summary>

- **`Permission denied`** when running `scp ... budi@192.168.1.37:/etc/mosquitto/…`: the `/etc` folder needs `sudo`, and `scp` can't `sudo`. Copy to your home folder first (`scp ... budi@192.168.1.37:acl-broker`), then on the Pi `sudo cp ~/acl-broker /etc/mosquitto/acl-broker` (Practice 5.3).
- **The `scp` pattern is always *from* then *to*.** `scp ../edge/acl-broker budi@192.168.1.37:acl-broker` copies the laptop file **to** the Pi. If you reverse it, you overwrite the laptop file instead.
- **The host key changed.** If `scp` warns `REMOTE HOST IDENTIFICATION HAS CHANGED`, you usually reinstalled the Pi. Follow the instructions in the Module 12 🚨 to update `known_hosts`.

</details>

<details>
<summary><b>Node-RED goes red "disconnected" after the broker is locked (device path)</b></summary>

You skipped Practice 4.3, or filled in its account after the broker was locked. Node-RED connects to the broker with no account, so it's refused. Open the broker node `Mosquitto on the gateway` → the **Security** tab → fill in **Username** `nodered` and **Password** the `nodered broker account` password, then **Update**, **Done**, **Deploy**. If the password is right, the dot under the MQTT node turns green `connected` within a few seconds. Also make sure the `nodered` account is in the broker password file and the `user nodered` block is in `acl-broker`.

</details>

<details>
<summary><b>The Zod message <code>Unrecognized key: "key"</code> on <code>POST /devices</code></b></summary>

This was already touched on in Practice 1.9. If you add a `"key"` field to the body of `POST /devices`, Zod refuses it with `body/ Unrecognized key: "key"`. The word "key" in that message is the **JSON field name** you sent (*an unrecognized key*), **not** a device key. The backend always makes the key itself, so you don't need to (and may not) send a `key` field. Remove that field from your body; the correct body has only `device_id`, and optionally `name`, `location`, `kind`, and `linked_via`.

</details>

## 🔬 Technical Deep Dive (optional)

This part may be skipped. It explains the deeper "why" and the other options used in professional work.

<details>
<summary><b>Mosquitto <i>dynamic security</i></b></summary>

Mini Smart Home uses two lists: the official registry in the backend, and the password file plus the access list in the broker. Mosquitto 2.x has a third way that removes the files altogether: the ***dynamic security plugin***.

- **Accounts, groups, and roles are stored by the plugin** in one JSON file owned by the broker, then **changed while the broker runs** through MQTT messages to the special topic `$CONTROL/dynamic-security/v1` or through the `mosquitto_ctrl` tool. An example command looks like JSON, such as `{"commands":[{"command":"createClient","username":"a4cf12e5b7c0","password":"…"}]}`.
- **Changes take effect at once**, without a reload. According to its source, a deleted or disabled account is kicked off the broker immediately, and the Mosquitto 2.0.21 log writes `Client … been disconnected by administrative action.` (that's exactly the English sentence in its source code).
- **Subscriptions can also be refused**, unlike a plain access-list file (Concept 7).
- The backend could be its manager: `POST /devices` would just send `createClient` to the broker, and `POST /devices/:id/revoke` would send `deleteClient`. Two lists become one flow.

Why doesn't this module use it? There are three reasons. First, it needs one very powerful **broker admin account**, and its password has to be stored by the backend: if it leaks, the whole broker falls. Second, Mosquitto 2.0.21 on the Pi doesn't yet know the `%u` replacement in this plugin's rules, so every device would need its own role. Third, for three or four devices, a password file and an access list you can read with your own eyes are far easier to understand. For hundreds of devices, *dynamic security* (or another broker that reads accounts from a database) is the natural next step.

</details>

<details>
<summary><b>The <code>$7$</code> recipe: why a password file made on the laptop is refused by the Pi</b></summary>

Every line of a Mosquitto password file looks like `name:$7$<rounds>$<salt>$<fingerprint>`. `$7$` means the **PBKDF2-SHA512** recipe: the password and its salt are stirred with SHA-512 over and over, as many times as the `<rounds>` number, much like bcrypt's "slow on purpose" idea in Module 20. The salt and fingerprint are written in plain *base64* (which may end with `=`).

| | Mosquitto 2.0.21 (Pi) | Mosquitto 2.1.2 (laptop) |
| :--- | :--- | :--- |
| `mosquitto_passwd` default rounds | 101 | 1,000 |
| Salt length | 12 *bytes* (16 characters) | 64 *bytes* (88 characters) |
| Salt accepted when loading the file | **only 12 *bytes*** | 12 or 64 *bytes* |

Because Mosquitto 2.0.21 only accepts a 12-*byte* salt, every line made by `mosquitto_passwd` 2.1.2 is thrown away with the message `Error: Unable to decode password salt for user …, removing entry.`, and all of those accounts are refused. The other direction is safe: Mosquitto 2.1.2 still accepts a 12-*byte* salt. The conclusion is simple: **run `mosquitto_passwd` on the broker machine**.

The same recipe can be computed in Node.js with `crypto.pbkdf2Sync(password, salt, 101, 64, "sha512")`. While this module was being prepared, that formula was checked against three official examples in Mosquitto's test folder, and the result matched exactly down to the last *byte*. That formula is the material for 🧩 Level 3.

</details>

<details>
<summary><b>The dangerous reload: a mistyped access list on Mosquitto 2.0</b></summary>

Concept 9 suggests a restart, not a *reload*, every time the access list is changed. The reason is in the Mosquitto 2.0.21 source:

1. When reloaded, the broker re-reads the password file and the access list, but **doesn't check** whether reading the access list succeeded.
2. If the access list has a bad line, for example `topik read msh/#` (it should be `topic`), reading it fails **before** the permission checker is reinstalled.
3. With no permission checker at all, Mosquitto decides "allowed" for every request.

The result is that the broker keeps running, but **with no access list at all**: every account may write to any topic. The only sign is two lines in the log: `Error: Invalid line in acl_file "/etc/mosquitto/acl-broker": topik read msh/#.` and `Error opening acl file "/etc/mosquitto/acl-broker".` The author concluded this behavior from the source, not yet from a real broker.

Mosquitto 2.1 fixes it another way: a broken file during a reload makes the broker **stop**. That's safer, but a broker running as a service can die quietly. Even the new `mosquitto --test-config` option in 2.1 doesn't help, because it only checks the main settings file, not the access list.

With a restart, a wrong file makes the broker **fail to start**. That's clearly visible in `sudo systemctl status mosquitto` and in the log, and you can fix it right away. A visible failure is better than a silent one.

</details>

<details>
<summary><b><i>Secure boot</i> and <i>flash encryption</i></b></summary>

Concept 5 mentions that anyone who holds the board can copy its flash contents, including the key in NVS. The ESP32 has two features for that, both explained in Espressif's official documentation:

- ***Flash encryption*** encrypts the flash contents, including the firmware and NVS, with a 256-bit key stored in **eFuse**. Flash contents copied over a USB cable are just random *bytes*.
- ***Secure boot* v2** checks the **digital signature** of the bootloader and firmware every time the board powers on. Firmware that isn't signed with your private key is refused, so no one else can replace your board's firmware with their own.

**eFuse** is a tiny "fuse" inside the chip that can only be burned **once in a lifetime**. Once burned, there's no going back. A wrong step can leave the board unable to take firmware again. That's why both features are **only discussed**, not tried on the Node 1 board or your learning board. They're used in production devices, usually with a factory process that's already proven, and a *Development* mode is available for trying them on a dedicated test board. Both answer item I10 of the OWASP IoT Top 10 (Concept 10).

</details>

<details>
<summary><b>mTLS: a certificate for every device</b></summary>

TLS (Module 27) lets a device make sure it's talking to the right broker, and encrypts all of its traffic. **mTLS** (*mutual TLS*, two-way TLS) goes one step further: the broker **also** asks for a certificate from every device.

- Every device holds a **private key** that never leaves its board. All it sends is proof that it holds that key, so there's no password that can be sniffed like in Practice 8.
- Mosquitto supports it with the setting `require_certificate true`. With `use_identity_as_username true`, the name in a device's certificate is used as its username, so this week's `%u` access list still applies.
- Revoking a device means revoking its certificate.

This is the way large IoT services like AWS IoT work. For Mini Smart Home, a username and key are enough on the home network; TLS follows in Module 27.

</details>

<details>
<summary><b><i>Provisioning</i> in industry</b></summary>

Mini Smart Home sets up a device by hand: one `POST /devices`, one `mosquitto_passwd`, and one Serial command. A factory that makes thousands of devices can't do that.

- **AWS IoT *Fleet Provisioning***: every device leaves the factory with the same "claim" certificate. The first time it powers on, the device swaps it for a certificate and private key **uniquely its own**, then registers itself as a new "thing". After that it only uses that unique certificate.
- **Azure IoT Hub *Device Provisioning Service* (DPS)**: a companion service that recognizes a new device by its certificate or key, then registers it automatically to the right IoT Hub.

The point is the same as this module: **every device gets its own identity**, there's no shared password, and every identity can be revoked one by one. The difference is only in the scale and the automation. Module 28 covers managing many devices.

</details>

<details>
<summary><b>Locking the Mosquitto service on the laptop permanently</b></summary>

The laptop path in this module runs the locked broker in a VS Code terminal, like Module 11. The Mosquitto service you installed in Module 12 Practice 7 still uses its old, unlocked settings every time you start it again. If you want that service to be locked too:

- **Windows**: add the four lines from Practice 4 to `C:\Program Files\Mosquitto\mosquitto.conf` (editing it the same way as in Module 12 Practice 7) with **full paths**, for example `password_file C:\Program Files\Mosquitto\broker-passwd`, because the service doesn't run from the `edge` folder. Make its password file with `mosquitto_passwd` in an Administrator terminal in that folder, then `net stop mosquitto` and `net start mosquitto`.
- **macOS**: add the same lines to `/opt/homebrew/etc/mosquitto/mosquitto.conf` (Intel Mac: `/usr/local/etc/…`) with full paths, then `brew services restart mosquitto`.

An honest note: the author hasn't tested this. On Windows, `mosquitto_passwd` makes a file readable only by the account that created it, and the service runs as a Windows system account, so the service might not be able to read that file. Because the Windows service log can only be read by the system account (Module 12), the easiest way to check is to try connecting with MQTTX: if even the right account is refused, restore `mosquitto.conf` from the `mosquitto.conf.asli` copy, then just use the broker in a terminal.

</details>

## 🧩 Independent Challenges

Do these on a new branch from `main` **after** ➕ is done (the Module 21 work is already on `main`): `git switch main`, `git pull`, then `git switch -c try/m21-challenges`. There's no answer key; what matters is that you try. If the result is tidy, open its own pull request.

### Level 1 — Add a second practice device without touching the code (20 minutes)

The access list with the `%u` pattern is designed so that adding a device **doesn't** need any file changed. Prove it: bring a second practice device, `f00d00000002`, to life until its data comes in, **without** typing a single line in `acl-broker` or the code.

**Task.** Register `f00d00000002` through `POST /devices`, install its key in three places (the backend already has it; the broker with `mosquitto_passwd`; `tools/.env` with `KEY_F00D00000002=`), then run the simulator for two devices (`… device-simulator.js mqtt://… 2`). Both must be `online`, and `contract-checker.js` must give `PASS` to the second one's messages.

**Hint.** The line `pattern write msh/%u/telemetry` already applies to `f00d00000002` too, because `%u` is replaced by its username. All you need to add is the **account** in the password file (reload the broker, not restart, because the ACL doesn't change) and the **key** in `tools/.env`.

**You pass when:** `GET /devices` writes `f00d00000002` as `online`/`active`, the checker gives `PASS`, and you **didn't** change `acl-broker`. Reflect: if the ACL used `%c` and a `user …` list one by one, how many files would you have to change for each new device?

### Level 2 — "Why rejected?" the `check-key` route (45–60 minutes)

When Node 1 writes `MQTT REJECTED by broker (code 5)`, you don't know whether the key is wrong or the account simply isn't on the broker yet. The backend holds the key's fingerprint, so it can answer one narrow question: "is this key the valid key for this device?" Build the route `POST /devices/:id/check-key` for that. This route is deliberately **not** in the main code, because it receives a key in the body and must be made very carefully.

**Task.** Add:

1. In `src/db/devices.ts`, a function `getKeyHash(deviceId)` that returns a registered device's `key_hash` (`undefined` if it isn't registered, `null` if it's revoked). This is the only place `key_hash` may leave that file.
2. In `src/routes/devices.ts`, a route `POST /devices/:id/check-key` (admin) that receives `{ "key": "…" }`, then answers `{ "device_id": "…", "match": true|false }`. A revoked or unregistered device is answered with `404`.

**Hint.** The comparator is `matchKey()` from `src/auth/key.ts` (it already exists and is already tested), which uses `timingSafeEqual` from warm-up step 2. **Don't** use `===`. Give this route `config: { rateLimit: { max: 10, timeWindow: 60_000 } }` like `POST /auth/login`, so it can't be used to guess the key. And never log the key from the body.

**You pass when:** the correct key answers `match: true`, a wrong key `match: false`, a revoked device `404`, and a new test in `src/routes/devices.test.ts` proves it without a database (use `vi.mock` like the existing tests do). Think about it: why is this route **not** in the main code, even though it looks useful? (Hint: it receives a raw key over a network that's still in the clear, and it opens the door to guessing the key one at a time. It's safer not to have it at all.)

### Level 3 — The backend builds the broker password file itself (60–90 minutes)

This week you copied the key from the backend to the broker **by hand**, through `mosquitto_passwd`. In a factory with hundreds of devices, that's impossible. Mosquitto's `$7$` recipe is really just PBKDF2-HMAC-SHA512, which is in Node.js (`crypto.pbkdf2`). So the backend can generate the password-file lines itself, straight in the form the broker understands.

**Task.** Write a script `backend/src/tools/make-broker-passwd.ts` (run with `node`) that, for one `device_id` and its key, prints one Mosquitto 2.0.21 password-file line:

```text
a4cf12e5b7c0:$7$101$<salt base64>$<fingerprint base64>
```

with 101 rounds, a random 12-*byte* salt, and a 64-*byte* PBKDF2-HMAC-SHA512 fingerprint, both in base64.

**Hint.** The line's shape is `name:$7$<iterations>$<salt base64>$<hash base64>`. Random salt: `randomBytes(12)`. Fingerprint: `pbkdf2Sync(key, salt, 101, 64, "sha512")`. Both `toString("base64")` (plain base64, **not** `base64url`). Mosquitto 2.0.21 only accepts a **12-*byte*** salt (the laptop's 2.1.2 uses 1,000 rounds and a 64-*byte* salt, which the Pi does **not** recognize).

**You pass when:** a line made by your script, put in the Pi's password file, lets that device connect, the same as a line made by `mosquitto_passwd`. Test it with one practice device. Reflect on the risk: once the backend can write the broker password file, the backend holds the "master key" to the whole broker. Where is that file stored, and who may tell the backend to make it? (This is exactly what 🔬 "*Provisioning* in industry" discusses: AWS IoT and Azure DPS split this job off into a separate service.)

## ➕ Add-on to "Mini Smart Home"

Five steps to tidy up the documents, then merge all the Module 21 work into `main`. Steps A–D prepare the files; step E brings them together through the "device security" pull request. Here's the whole project after this week, locked for people and devices:

![Diagram of the Mini Smart Home project after Module 21: the home is now locked for both people and devices; a dashed line means coming soon. Top row, from the left: Node 2 Garden v1.0.0 with an 18650 battery, unchanged, with no key, via Node 1, sending over ESP-NOW to Node 1 Home v1.6.0, which stores the broker key in NVS (broker_key, filled in via Serial) and uses the account a4cf12e5b7c0; new firmware from Practice 3. Node 1 sends MQTT together with its key to the Raspberry Pi gateway 192.168.1.37. Inside it, a green locked Mosquitto card, new: allow_anonymous false, broker-passwd and acl-broker, and use_username_as_clientid true; and a Node-RED card with the dashboard, the Garden card, and the RS-485 Sensor group, now with the nodered account in the Security tab, new. The Pi connects to a phone (Node-RED and Telegram); Telegram, with alerts and /status, unchanged. On the center-left, a card of broker clients on the laptop, one account per program, with MQTT lines to the broker, each with its own account: MQTTX with the monitor account that reads only; the contract checker with the checker account; the simulator (optional), f00d00000001, its key in tools/.env; and the sniffer (optional), tools/sniffer.js for Practice 8. Below it, an "honest, not safe yet" box with four items: MQTT and HTTP traffic is still in the clear (TLS in Module 27); the key in NVS is readable by anyone who holds the board; the backend is still only on 127.0.0.1 (laptop); the rate-limit count is in memory, zero again when the backend restarts. The large Laptop box, backend on 127.0.0.1:8080, receives msh/# from the broker and sends cmd (set, config) with the backend account, and connects to Telegram over the internet, outbound HTTPS with long polling. Inside it, a green backend v1.0 box, locked for people and devices: Fastify and TypeScript with data contract 1.4, then what's new: the official device registry; a per-device key, 43 random characters, stored as SHA-256; the second layer, unregistered or revoked devices are ignored; the backend's broker account in .env; /health counts ignored; and Vitest 35 tests, 17 of them new for keys and the registry; plus what stays: login, roles, and the guard from Module 20, realtime, rules, schedules, the Telegram bot, and 1.0.0 at /docs. The API list is split in two. Open without a login: GET /health, GET /docs, POST /auth/login, POST /auth/refresh, and POST /auth/logout. Needs a login, marked with a padlock, for everything else: GET /devices, now from the database; POST /devices, POST /devices/:id/key, and POST /devices/:id/revoke, all three new; POST /devices/:id/command; GET /auth/me; four more GET /devices/:id/ routes; GET /rules, POST /rules, PUT /rules/:id, and POST /rules/:id/run; POST and PUT are admin-only. The backend connects through pg (pool) to the blue Docker Desktop box, container smarthome-db: PostgreSQL 17 and TimescaleDB 2.30.2, volume smarthome-data, port 127.0.0.1:5432; the new migration 010_device_keys.sql adds the columns registered_at, key_hash, key_created_at, revoked_at, and linked_via to devices; the old Module 17–20 rows remain, but unregistered; and what stays: readings, events, commands, rules, users, and sessions. On the right, the backend's guests: the small terminal that logs in with a viewer account from tools/.env, with Socket.IO that only broadcasts registered devices, receiving live data; Bruno with 5 new requests, namely register Node 1, Node 2, and the practice device, plus rotate and revoke keys; and a browser that opens /docs, uses Try it out POST /auth/login first, then the cookie is carried by the browser; a note: everything carries the access cookie, the wristband. For the database: DBeaver and psql through port 5432 and docker exec, unchanged, plus a backup/ folder with the pg_dump files from Module 18. Bottom left, the GitHub mini-smart-home card: the branch feature/device-security becomes a pull request to main, and the "device security" pull request is reviewed with the security checklist, then merged. Files that are new or changed: backend/package.json and package-lock.json, version 1.0.0; backend/migrations/010_device_keys.sql, new; backend/src/auth/key.ts and key.test.ts, new; backend/src/db/devices.ts, new; backend/src/services/registry.ts and registry.test.ts, new, guest book and second layer; backend/src/routes/devices.ts and devices.test.ts, for register, rotate key, and revoke; backend/src/services/mqtt.ts, store.ts, and commands.ts, for the second layer, the ignored count, and the 404 and 409 answers; backend/src/config/env.ts and .env.example, with MQTT_USERNAME and MQTT_PASSWORD; backend/src/db/archive.ts, UPDATE only; backend/src/routes/health.ts, with ignored added; backend/src/server.ts, 1.0.0; backend/bruno/, with 5 requests added; backend/README.md, v1.0; tools/device-simulator.js and contract-checker.js, with the broker account from tools/.env; tools/sniffer.js, new; tools/.env.example, with the per-device key added; tools/README.md, Module 21; edge/acl-broker, new; edge/gateway-pi.conf and mosquitto-lan.conf, locked; edge/README.md, Module 21; firmware/node-1-home/, v1.6.0; DATA-CONTRACT.md, 1.4; .gitignore, with edge/broker-passwd added; and .github/pull_request_template.md, with a device-security item added to the Security checklist. A padlocked box: never in Git: .env, bruno/.env, tools/.env, and edge/broker-passwd. Bottom right, a green Phase 3 Checkpoint card with a celebration mark: locked for people and devices; Phase 3 (Modules 16–21) done, backend v1.0. Below it, three dashed cards that are coming soon: Modules 22–23, a React dashboard in the browser; Module 27, TLS (port 8883) and the broker on the internet; Module 28, OTA and managing many devices.](assets/project-diagram-module-21.png)

| File | Contents | Step |
| :--- | :--- | :--- |
| `DATA-CONTRACT.md` | the data contract rises to **1.4**: the broker-account row and rule 6 (ACL `%u`) | A |
| `backend/README.md` | how to run and use the **v1.0** backend | B |
| `edge/README.md` | how to lock the broker (password file, ACL, restart vs reload) | C |
| `.github/pull_request_template.md` | three **Security checklist** items for device security | D |

### A. Data contract 1.4

`DATA-CONTRACT.md` in the `mini-smart-home` folder is the "shared language" of every part of the project (Module 11). Module 21 adds the **broker account** to it, without changing the shape of a single message. Open [`code/DATA-CONTRACT.md`](code/DATA-CONTRACT.md) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `DATA-CONTRACT.md`. What changed from version 1.3:

- **Section 3 (MQTT rules)** gets a **Broker account** row: username = `device_id`, password = the 43-character device key from `POST /devices`, and the broker forces the client name = the username (`use_username_as_clientid`).
- **Rule 6** now mentions the access list (ACL) with the `%u` pattern and the Node 1 → Node 2 exception, replacing the old promise "enforced by the broker access list (Module 21)".
- **The change history** gets a version 1.4 row, with a firm note that the shape of the `telemetry`, `status`, `vitals`, `cmd`, and `ack` messages **hasn't changed**.

Everything else is identical. Old devices don't need updating just because the contract rose to 1.4: what changed isn't the message content, but the way a device gets into the broker.

### B. Update `backend/README.md`

A teammate who clones your repository has to know the thing that can't be guessed from the code: the backend now needs `MQTT_USERNAME`/`MQTT_PASSWORD`, devices are registered through `POST /devices`, and messages from unregistered devices are ignored. Open [`code/backend/README.md`](code/backend/README.md) on GitHub, **Copy raw file**, then paste it in place of the whole contents of your `backend/README.md`. This v1.0 version adds a **"Device and broker security (Module 21)"** section, updates the API table with four new `/devices` routes, records migration `010`, and rewrites **"Limits of v1.0"** honestly: traffic is still in the clear, and the device list is loaded into memory.

### C. Write `edge/README.md`

The `edge` folder has held the broker and Node-RED settings since Modules 12–13. Open [`code/edge/README.md`](code/edge/README.md), **Copy raw file**, then paste it in place of your `edge/README.md`. The new **"Locking the broker (Module 21)"** section sums up everything you did this week in one place: making the password file with `mosquitto_passwd` **on the broker machine**, `chown`/`chmod` on the Pi, when to **restart** and when to **reload**, one account per program, and filling in the Node-RED account in the **Security** tab. The files `acl-broker`, `gateway-pi.conf`, and `mosquitto-lan.conf` join the file table, and `broker-passwd` is marked **never in Git**.

### D. Add three items to the Security checklist

The pull request template from Module 16, which was given a **Security checklist** in Module 20, gets three items specific to device security. Open [`code/.github/pull_request_template.md`](code/.github/pull_request_template.md), **Copy raw file**, then paste it in place of your `.github/pull_request_template.md`. The three new items (marked **(Module 21)**) check: the device key is only a fingerprint, shown once, and not in `MQTT_URL`; the broker access list stays as tight as possible and the broker is restarted after the ACL changes; and `edge/broker-passwd` isn't in Git and the second layer isn't *bypassed*.

### E. ⭐ Merge `feature/device-security` into `main` via the "device security" pull request

Before you start, save the four documents above to the branch:

```text
git add DATA-CONTRACT.md backend/README.md edge/README.md .github/pull_request_template.md
git commit -m "Docs v1.0: contract 1.4, backend and edge READMEs, device-security checklist (Module 21)"
git push -u origin feature/device-security
```

This is this branch's first push, so `-u` records its partner on GitHub.

1. **Open a pull request.** On GitHub, click **Compare & pull request** on the yellow banner of the `feature/device-security` branch (or the **Pull requests** tab → **New pull request**, **base: `main`** ← **compare: `feature/device-security`**). Give it the title `Device security`. Under **What changed?**, write, for example: `Backend v1.0: an official device registry with a per-device key (SHA-256, migration 010), POST/GET /devices and revoke/rotate key, a second layer that ignores unregistered or revoked devices, the backend's broker account, Node 1 firmware v1.6.0 (the key in NVS via Serial), the simulator and checker with accounts, the broker locked (password file, ACL %u, use_username_as_clientid), and a sniffer that proves the traffic is still in the clear.` This time the description box **already** holds the full **Security checklist**, including the three Module 21 items, because the template from Module 20 is already on `main`. Click **Create pull request**.
2. **Review with the security checklist.** Go through it item by item, then tick the ones that are really met:
   - In the **Files changed** tab, make sure there's **no** `backend/.env`, `backend/bruno/.env`, `tools/.env`, `edge/broker-passwd`, `login*.json`, `cookies*.txt`, or device key. Open the new Bruno requests (`register Node 1.yml` and friends): there's no key in them, because the key is only in the answer you copied to your password manager.
   - The **(Module 21)** key item: `migrations/010` stores `key_hash` (SHA-256), not the key; `GET /devices` never loads it (Practice 1); and the broker account is in `MQTT_USERNAME`/`MQTT_PASSWORD`, not in `MQTT_URL` (Practice 2).
   - The **(Module 21)** ACL item: `edge/acl-broker` uses the `%u` pattern with the least privilege possible, and you proved an intruder is refused in Practice 6.
   - The **(Module 21)** password-file and second-layer item: `git check-ignore -v edge/broker-passwd` shows the file is ignored (Practice 4.8), and `db/archive.ts` no longer creates `devices` rows automatically (Practice 2).
   - The npm packages item: `npm test` passes **35** tests, there are no new npm packages (`npm audit` `found 0 vulnerabilities`), and `allowScripts` didn't grow (Practice 8.4).

   Send a summary through **Review changes** → **Comment** → **Submit review**. If a secret file did show up, **don't merge**: remove it with `git rm --cached <name>`, make sure its name is in `.gitignore`, then commit and push again.
3. **Merge.** Choose **Create a merge commit**, click **Merge pull request** → **Confirm merge**, then **Delete branch**.
4. **Back to `main`:**

   ```text
   git switch main
   git pull --prune
   git branch -d feature/device-security
   ```

The database isn't affected by this branch switch: migration `010` is already recorded, and the devices you registered are still there. The broker and the firmware don't move with the branch either; both are already installed on their own machines.

### F. Save your learning notes

Open the **`learn-iot`** repository in a new VS Code window, create the file **`module-21/notes.md`** next to `warmup.js` from 🔁, then fill it in with the numbers from your own screen:

```markdown
# Module 21 notes — Device and broker security

| What I measured | My numbers |
| :--- | :--- |
| Length of the device key from POST /devices | … characters |
| The broker's answer when MQTTX had no password (Practice 4) | … |
| The code the broker refuses with when the key is wrong (Practice 3) | code … |
| Node 1's retry interval after being refused (Practice 3) | … seconds |
| Unit tests that are green (Practice 8) | … of … |
| The last four characters of my Node 1 key (for matching, not secret) | …{four characters} |

What surprised me most: …
```

Commit and push in the **`learn-iot`** repository.

**Evidence for passing Module 21** (compare it with ✅ below): MQTTX without a password is refused by the broker (Practice 4), a device impersonating Node 1's topic is refused by the access list and logged (Practice 6), a device whose key is revoked can't send data anymore (Practice 7), and the "device security" pull request, reviewed and then merged.

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Threat model** | A simple list: who might sneak in, through which door, what happens then, and which lock fits. This week the door is the MQTT broker. |
| **Device key** (*device key*, *API key*) | 43 random characters (*base64url*) that the backend makes for one device, used as that device's password to the broker. Shown only once; the database stores its fingerprint. |
| **Fingerprint** (*hash*) | The result of a one-way function, always of the same length: the same text gives the same fingerprint; one letter different, and it changes completely; it can't be computed backward. |
| **SHA-256** | A fast fingerprint recipe whose result is 64 hexadecimal characters. A good fit for **random** device keys (Concept 2), too fast for human-made passwords (those use bcrypt, Module 20). |
| **`timingSafeEqual`** | A comparison of two *byte* buffers that always checks all of them, so how long it takes doesn't reveal at which character two keys start to differ. Used so a key can't be guessed from the timing difference. |
| ***base64url*** | A way to write *bytes* as letters, digits, `-`, and `_`. Device keys use this; plain `base64` (with `+` and `/`) is used for the salt and fingerprint in the Mosquitto password file. |
| **Registry** (*registry*) | The `devices` table in the backend: only devices registered by an admin (`registered_at` filled in) are listened to. |
| ***Provisioning*** | The process of giving a new device its identity and key. In this module: `POST /devices` makes a key, then that key is installed on the device and the broker (Concept 3). |
| **Second layer** | A second check in the backend: even though the broker already guards the door, the backend still ignores messages from a device that isn't registered or whose key is revoked (Concept 4). |
| **Fail closed** (*fail closed*) | When in doubt, refuse. The backend ignores a device it doesn't know, rather than accepting it; the broker refuses an account that doesn't exist, rather than letting it in. |
| **NVS** (*Non-Volatile Storage*) | ESP32 memory that isn't lost when the power goes off. Node 1 stores its key here (the label `broker_key`), not in the code (Concept 5). |
| **Broker** | The MQTT post office (Mosquitto). Since this week it checks who comes in and what may be written. |
| **`allow_anonymous false`** | A broker setting: a guest without a username may not come in. Its partner is `password_file`. |
| **Password file** (*password file*) | The list of usernames and their password fingerprints in the broker, made by `mosquitto_passwd`. Its line shape is `name:$7$<iterations>$<salt>$<fingerprint>`. Never in Git. |
| **`mosquitto_passwd`** | Mosquitto's built-in tool for making and changing the password file. `-c` makes a new file (overwrites!), `-D` removes one account. Always run on the broker machine. |
| **`$7$`** | The name of Mosquitto's fingerprint recipe: PBKDF2-HMAC-SHA512. The Pi (2.0.21) uses 101 rounds and a 12-*byte* salt; the laptop (2.1.2) uses 1,000 and 64, which the Pi doesn't recognize. |
| **CONNACK** | The broker's answer to a connection request (CONNECT). Code **0** means accepted; code **5** (`0x87` in MQTT 5) means `Not authorized`, whatever is wrong. |
| **Access control list** (*ACL*, *Access Control List*) | The `acl-broker` file: the rules of which topics each account may write and read. Mosquitto reads it from top to bottom; what isn't mentioned isn't allowed. |
| **`%u` pattern** | In the access list, `%u` is replaced by the **username** proven with a password (that is, the `device_id`). `pattern write msh/%u/telemetry` applies to every device at once. |
| **`%c` pattern** | Like `%u`, but uses the **client name** (*client ID*), which is **not** proven by a password and can be faked. This module uses `%u`, not `%c` (Concept 8). |
| **Client name** (*client ID*) | The name every MQTT client chooses for itself. The broker allows only one connection per client name, so the same name kicks each other off. |
| **`use_username_as_clientid`** | A broker setting: every guest's client name is replaced with its username. It closes the client-name impersonation gap, and makes `%c` and `%u` point to the same device (Concept 8). |
| **Revoke** (*revoke*) | Killing one device's key without touching the others: in the backend (`POST /devices/:id/revoke`, effective at once) and in the broker (`mosquitto_passwd -D` + reload). |
| **Reload** (*reload*) vs **restart** (restart) | Reload for **password file** changes (valid connections aren't dropped). Restart for **access list** or `use_username_as_clientid` changes; on the Pi, a wrong ACL + reload is dangerous (Concept 9). |
| **Will** (*Last Will*) | The `offline` message the broker publishes when a device disconnects suddenly. Not sent when the broker disconnects a device because its account is revoked. |
| **Least privilege** (*least privilege*) | Every program is given only the rights it needs: the peeking MQTTX may not write `cmd`, the checker may only read. |
| **OWASP IoT Top 10** | A list of the ten most common IoT security risks, from the OWASP community. Covered in 🔬; weak keys and insecure interfaces are among them. |
| **TLS** (*Transport Layer Security*) | The "envelope" that hides the contents of traffic from a sniffer. Not installed this week (traffic is still in the clear); it follows in Module 27 (`mqtts://`, port 8883). |

## 📝 5-Question Quiz

1. For each of these programs, say whether it needs its own broker account and what rights fit: (a) Node 1; (b) Node 2 "Garden" that speaks over ESP-NOW; (c) the backend; (d) the MQTTX you use to peek; (e) the contract checker.
2. You installed a new key for Node 1 through `POST /devices/a4cf12e5b7c0/key`, but forgot to update it in two other places. (a) In which three places must that key be the same? (b) What does Node 1's Serial Monitor write, and how often does it try again? (c) Does Node 1's reading still reach the database during that time?
3. A guest on your home Wi-Fi has a valid broker account, `c0ba00000001`, because you once lent their board a key. They connect to the broker with the client name `a4cf12e5b7c0` (Node 1's client name), then publish fake `telemetry` to `msh/a4cf12e5b7c0/telemetry`. (a) Is Node 1 kicked out? Why? (b) Does the fake message reach the backend? (c) Where is its trail visible? (d) What would change if the access list used `%c` instead of `%u`?
4. After you run `POST /devices/f00d00000001/revoke`, but **before** you touch the broker: (a) Does the backend still store f00d00000001's readings? (b) Does the broker still accept f00d00000001? (c) What `status` and what `key` does `GET /devices` write for that device? (d) Which column is the one to go by for its state?
5. You run `tools/sniffer.js` between MQTTX and the broker, then MQTTX connects with the username `backend` and its password. (a) What can the sniffer read from the CONNECT packet? (b) Does `mosquitto -v` print that password too? (c) Why is this still acceptable on a home network, but must be dealt with before the broker is opened to the internet? (d) What's the cure, and in which module?

<details>
<summary><b>Answer key</b></summary>

1. (a) **Node 1**: yes, the account `a4cf12e5b7c0`; writes its own topics (`telemetry`, `status`, `vitals`, `ack`), reads its `cmd`, plus writes Node 2's `telemetry`/`status`. (b) **Node 2**: **no** account; it never connects to the broker itself, its messages are forwarded by Node 1 over ESP-NOW. (c) **backend**: yes, the account `backend`; reads all of `msh/#`, writes `msh/+/cmd`. (d) **MQTTX**: yes, the account `monitor`; only reads `msh/#` and `$SYS/#`. (e) **checker**: yes, the account `checker`; only reads `msh/#`. The `monitor` and `checker` accounts are separate because one account may only have one connection (Concept 8).
2. (a) The key must be the same in the **`POST /devices` answer** (your password manager), the **broker password file** (`mosquitto_passwd a4cf12e5b7c0`), and the **device** (`key <value>` in Node 1's Serial Monitor). (b) `MQTT REJECTED by broker (code 5): …`, and it tries again **only every 60 seconds**, so the broker log doesn't flood (Concept 5). (c) **No.** The broker refuses Node 1, so no message gets through; and even if the key were still right in one place, the backend's second layer only processes it if the device is registered. Node 1 also enters offline mode after 2 minutes and runs its local safety fan.
3. (a) **Not kicked out**, because `use_username_as_clientid` replaces its client name with its username, `c0ba00000001`. The client name `a4cf12e5b7c0` it sent is ignored (Concept 8). (b) **No.** The access list only lets `c0ba00000001` write its own topics, so the broker throws away the message to `msh/a4cf12e5b7c0/telemetry`. (c) In the **broker log**, the line `Denied PUBLISH from c0ba00000001 …` (debug level), and in the MQTTX `monitor` that never receives that fake message. (d) With `%c`, its client name is `a4cf12e5b7c0`, so the access list would think it's Node 1 and **let it write** in Node 1's name, while kicking out the real Node 1. That's why this module uses `%u`.
4. (a) **No longer.** From the moment of revocation, the backend's second layer ignores f00d00000001's messages (`IGNORED … its key has been revoked`). (b) **Still**, because its account hasn't been removed from the broker password file. This is why revocation is done in two layers (Concept 9). (c) `status` can stay **`online`** (the will isn't sent), `key` becomes **`revoked`**. (d) The **`key`** column is the one to go by, not `status`.
5. (a) The sniffer can read the **full username and password (key)**, letter by letter, because both are in the CONNECT packet sent in the clear. (b) **No.** Mosquitto never prints the password to the log; what's open is the network path, not the broker's log. (c) On a closed home network, only a device already on your Wi-Fi can sniff, so the risk is small. On the internet, anyone along the path could read it. (d) The cure is **TLS** (`mqtts://`, port 8883), which puts an "envelope" on the traffic; covered in **Module 27**.

</details>

---

## ✅ Module 21 Completion Checklist

The completion requirement from the Syllabus: **MQTTX without a password is refused by the broker, a device impersonating another device's topic is refused by the access list (and logged), and a device whose key is revoked can't send data anymore.** **The path without a device:** every item may be ticked with the simulator and MQTTX (the laptop path).

- [ ] The JavaScript warm-up is done, and I've checked my answers against the "Self-test answer key" (🔁).
- [ ] The practice broker on port 1884 refuses MQTTX without a password, then accepts it after it's given an account (Quick Win).
- [ ] Migration `010_device_keys.sql` has been applied, `POST /devices` gives a key that's shown only once, and `GET /devices` marks every device `active`/`revoked`/`no-key`/`unregistered` without ever loading its fingerprint (Practice 1).
- [ ] The backend ignores messages from a device that isn't registered (`IGNORED …`, counted in `/health`), stops creating `devices` rows automatically, and brings its own broker account from `.env` (Practice 2).
- [ ] Node 1 firmware v1.6.0 stores its key in NVS through `key <value>` (not in the code), writes `REJECTED` while its key doesn't match yet, and the simulator and checker bring their accounts from `tools/.env` (Practice 3).
- [ ] ⭐ After the broker is locked (password file, `allow_anonymous false`, `use_username_as_clientid`), **MQTTX without a password is refused** with `Not authorized`, while every program that carries a key reconnects by itself (Practice 4).
- [ ] The `%u` access list is installed: the `monitor` account can only read (an attempt to write `cmd` is answered with `Not authorized`), backend commands still arrive, and Node 2's data still flows through Node 1 (Practice 5).
- [ ] ⭐ A test device with a valid account that impersonates Node 1's topic is **refused by the access list**, Node 1 isn't kicked out, and the refusal is **logged** in the broker log (`Denied PUBLISH`), while the MQTTX monitor never receives its fake message (Practice 6).
- [ ] ⭐ A device whose key is revoked **can't send data anymore** (ignored by the backend at once, then refused by the broker after a reload), and can be restored with a new key (Practice 7).
- [ ] ⭐ I saw for myself that the key travels in the clear through `tools/sniffer.js`, the backend rose to **v1.0**, the dress rehearsal of the three pass requirements succeeded in one go, and `npm test` passes 35 tests (Practice 8).
- [ ] ⭐ The pull request template now has three device-security items, and all the Module 21 work is on `main` through the "device security" pull request, without `edge/broker-passwd` or any key (➕).

🎉 **Mini Smart Home is now locked for people and devices.** The backend is now **v1.0**. Only the devices you register are listened to, each with its own key that can be revoked; the broker refuses guests without a password and keeps every device on its own topic; and you've honestly named what isn't safe yet. Phase 3, from the backend to security, is done.

> ➡️ **Next phase:** Phase 4 gives this home a **face**. Module 22 starts a React dashboard from scratch — HTML, CSS, and TypeScript — that reads the locked API you just built, beginning with a small *login* form. Its origin `http://localhost:5173` has been in `CORS_ORIGIN` since Module 20, waiting.

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- **Mosquitto** (the MQTT broker): the [source code](https://github.com/eclipse-mosquitto/mosquitto) version **2.0.21** (the Raspberry Pi gateway, from Debian Trixie) and **2.1.2** (the laptop, the official installer and Homebrew), and the [official documentation](https://mosquitto.org/documentation/): [`mosquitto.conf(5)`](https://mosquitto.org/man/mosquitto-conf-5.html) (`allow_anonymous`, `password_file`, `acl_file`, `use_username_as_clientid`, `log_type`), [`mosquitto_passwd(1)`](https://mosquitto.org/man/mosquitto_passwd-1.html), [`mosquitto-tls(7)`](https://mosquitto.org/man/mosquitto-tls-7.html) (for Module 27), and the [access control list (ACL)](https://mosquitto.org/man/mosquitto-conf-5.html#idm361). The behavior quoted in the **Expected output** boxes (log text, CONNACK codes, the order of ACL checks, what happens on a *reload*) was traced directly from the source of both versions and marked **example**, because Mosquitto isn't installed on the author's laptop this week (see "About the Expected output boxes").
- **The MQTT specification**: [MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) and [MQTT 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) (OASIS): the shape of the CONNECT packet (username and password), the CONNACK answer codes (`0x00`, `0x87`), and PUBACK with a reason code.
- **MQTT client libraries**: [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1 (used by the backend, and — version 4.3.7 — inside MQTTX): `reconnectOnConnackError` and the error text `Connection refused: Not authorized` / `Publish error: Not authorized`; [PubSubClient](https://github.com/knolleary/pubsubclient) (the PubSubClient3 variant) 3.3.2 in the Node 1 firmware: `connect(id, user, pass, …)` and the `state()` values. The mock broker behavior for testing the client side uses [mqtt-packet](https://github.com/mqttjs/mqtt-packet) 9.0.2; all mock-broker output is marked **MOCK**, not Mosquitto.
- **Node.js 24.21.0**: [the `crypto` module](https://nodejs.org/docs/latest-v24.x/api/crypto.html) (`randomBytes`, `createHash`, `timingSafeEqual`, `pbkdf2`) and [`--env-file`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--env-fileconfig).
- **ESP32**: the [NVS (*Non-Volatile Storage*) documentation](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/storage/nvs_flash.html), plus [*flash encryption*](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/security/flash-encryption.html) and [*secure boot v2*](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/security/secure-boot-v2.html) for 🔬.
- **Security guidelines**: [OWASP IoT Top 10 (2018)](https://owasp.org/www-project-internet-of-things/) and the [OWASP IoT Security Verification Standard](https://owasp.org/www-project-iot-security-verification-standard/); the OWASP Cheat Sheet Series: [*secrets management*](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) and [authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- **Managed IoT providers** (🔬 industrial *provisioning*): [AWS IoT Core *fleet provisioning*](https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html) and [Azure IoT Hub Device Provisioning Service](https://learn.microsoft.com/en-us/azure/iot-dps/about-iot-dps).
- **Node-RED** (device path): the [MQTT node](https://cookbook.nodered.org/mqtt/) and [credential management](https://nodered.org/docs/user-guide/runtime/securing-node-red#credentials).
- **MQTTX**: the [source code](https://github.com/emqx/MQTTX) 1.13.1 (the interface messages are written from the source, because its desktop app isn't used for the Wokwi path).

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-21`, `device-key-flow`, `broker-doorkeeper`, `two-layer-revocation`, `key-in-connect-packet`, `project-diagram-module-21` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The behavior of keys, the password file, the ACL, CONNACK, and the contents of the CONNECT packet from the documentation and source above; the numbers and messages from the author's lab for this module (backend v1.0, firmware v1.6.0). The example keys and fingerprints in the pictures were made just for the examples; they don't belong to any real device. | CC BY 4.0 |
| `wokwi-broker-key.png` | Real screenshots of the author's [Wokwi](https://wokwi.com) simulation of Node 1 v1.6.0 (the Serial Monitor and the OLED screen), when Node 1 is refused then accepted by the public broker `test.mosquitto.org`; cropped and rearranged, with title and captions by the author. | Wokwi simulation, screenshots October 2026, used for educational purposes, markers by the author. Title and captions: CC BY 4.0 |

**About the Expected output boxes.** All the commands and code of this module were run by the author on a Windows 11 laptop with Node.js 24.21.0 and npm 11.19.0, the database in a lab container of `timescale/timescaledb:2.30.2-pg17` holding the final state of Module 20, with exactly the same order of steps as this module. The backend v1.0, the simulator, the contract checker, the small terminal, and the sniffer were tested for real; the Bruno Assert answers and results were taken from the Bruno CLI 4.2.1 (`bru run`), while the text in the Bruno desktop window is written from Modules 16–20 and its source code. **Mosquitto isn't installed on the author's laptop this week**, so the broker output (the `mosquitto.log` notes, the `New client connected`/`disconnected, not authorised`/`Denied PUBLISH` text, the password-file contents, and the reaction during a *reload*) is written from the official Mosquitto 2.0.21 (Pi) and 2.1.2 (laptop) source, and marked **example**; the client-library reactions (MQTT.js, PubSubClient) to the broker's answers were tested for real through a mock broker that imitates Mosquitto. The Node 1 firmware v1.6.0 was tested on **Wokwi** with the public broker `test.mosquitto.org` (the public practice account `rw`), not on real hardware; its Serial and OLED output is a **Wokwi test recording**. The device path (a real Node 1, the Pi gateway, the Node 2 board as the intruder) and the macOS commands are written from earlier modules and the source code, not tried again in this module. The author used another port in the lab (`8240`), written here as `8080`. The clock in the example Wokwi logs is how long the device has been on; the epoch timestamps in the broker log use the author's laptop's WITA time zone. The clock, keys, fingerprints, and `device_id`s on your screen will certainly be different, so output like that is marked **example** or **Wokwi test recording**.

---

[⬅️ Module 20](../module-20-user-security/README.md) · [Phase 3](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 22 — HTML, CSS, & React (TypeScript) from Scratch for an IoT Dashboard** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-22--html-css--react-typescript-from-scratch-for-an-iot-dashboard))
