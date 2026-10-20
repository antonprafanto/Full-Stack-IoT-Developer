# Module 16 — Your First Backend with Light TypeScript: Receiving Data, APIs, & Git for Teams

🌐 **English** · [Bahasa Indonesia](../../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md)

*Phase 3 · Week 16 · Hardware: **Kit A + B** — Node 1, Node 2, and the Pi gateway from Modules 12–15, or **just a laptop** (this module's simulator stands in for the devices) · Prerequisites: **Module 4** (JavaScript and Node.js), **Module 11** (MQTT and the data contract), **Module 15** (data contract 1.2) · Time: 8–10 hours, spread over the week*

[⬅️ Module 15](../../phase-2-connectivity/module-15-modbus-rs485-and-protocols/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 17 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-17--your-first-database-sql-basics--the-mini-smart-home-schema-postgresql-via-docker)

---

Welcome to **Phase 3**. During Phase 2, every Mini Smart Home message flowed to the broker on the Raspberry Pi, and Node-RED showed it on your phone and turned the fan on when the room got hot. That was the fastest way to see results, but it has its limits: Node-RED only passes messages on, doesn't check whether their content is correct, doesn't offer a tidy "door" for other programs, and doesn't remember anything after a restart. Starting this week, you build Mini Smart Home's **brain** yourself: a **backend**, that is, a server program that keeps running on the laptop, listens to every device message, checks it against the data contract, and answers other programs' questions through an **API**.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Node 1's and Node 2's readings can only be seen on the Node-RED dashboard. | There's no program yet that collects the data and answers questions like "what's the latest temperature in the garden?" from other programs. | A **Fastify backend** with an **API**: `GET /devices` and `GET /devices/:id/latest` (Concepts 1–2, Practices 3 and 5) |
| Broken messages (a mistyped field, a number out of range) are passed on just like that. | Nothing compares the messages with the data contract. | **"Never trust the device"**: every message is checked with **Zod** according to Appendix A (Concept 7, Practice 4) |
| The lamp can only be turned on from a dashboard button or from MQTTX. | Commands don't have a door yet that other apps can use, and their answers (`ack`) aren't recorded. | **`POST /devices/:id/command`**: the command goes out to `cmd`, and its `ack` is awaited and recorded (Concept 9, Practice 6) |
| Nobody knows which doors the server offers. | An API without documentation is understood only by the person who made it. | **Automatic documentation** at `/docs` (OpenAPI/Swagger) and **Bruno** for trying the API (Concept 8, Practice 5) |
| In large JavaScript code, it's easy to mistype a field name without anyone noticing. | JavaScript doesn't check data types before the program runs. | **Light TypeScript**: "type labels" that VS Code checks, run directly by Node.js 24 (Concept 4, Practice 2) |
| Every change goes straight into the repository's main branch. | There's no team workflow yet. | **Git in the terminal**, a branch per feature, pull requests, and reviews with a checklist (Concepts 3 and 10, Practices 1 and 8) |

By the end of the week, **backend v0.1** runs on your laptop: it listens to every `msh/#` topic on the Pi's broker, rejects messages that break the contract, keeps the last state of every device in memory, and provides a documented API. You turn Node 1's lamp on from **Bruno**, see its `ack` recorded, and finish your first feature through a **pull request**. The fan automation in Node-RED is switched off so that Mini Smart Home doesn't have two brains.

![Module 16 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 3 Backend and data, Modules 16 to 21, is highlighted with a green frame. Modules 1 to 15 are marked done, Modules 17 to 21 are green, and Module 16 is marked YOU ARE HERE with the note: your own server, listens to MQTT, checks the contract, a documented API, Git for teams. Below that, the box for this week's Module 16, 8 to 10 hours spread out, with Kit A + B (Node 1, Node 2, and the Pi gateway from Modules 12–15) or a laptop + the simulator; hardware is not required. The list of activities: the JavaScript warm-up; Quick Win, the first server answers /health; Practice 1, Git in the terminal, the first commit of the backend; Practice 2, project structure, light TypeScript, .env; Practice 3, the backend listens to the broker; Practice 4, never trust the device, the Zod contract; Practice 5, the latest reading, /docs, and Bruno; Practice 6, commands through the API, cmd and ack; Practice 7, a ten-device simulator; Practice 8, Git for teams, branches, pull requests, reviews; and the Add-on, backend v0.1, the Node-RED automation retires. Practices 5, 6, 8, and the Add-on are marked with a star, required to pass. Note at the bottom: almost all of this week's work is on the laptop, in VS Code; if you don't have Node 1 and Node 2 yet, the Practice 7 simulator stands in for both; if you don't have a Raspberry Pi yet, follow the laptop path as in Modules 12–15, where the broker runs on the laptop and its address replaces the Pi's.](assets/roadmap-module-16.png)

> [!NOTE]
> **How to use this module.**
>
> - **Almost all of this week's work is on the laptop**, in VS Code. Every command box says where it's used: the **VS Code terminal** (in the `backend` or `tools` folder), the **browser**, **Bruno**, **MQTTX**, the **Node-RED editor** (the browser), or **On the Pi** (the SSH terminal). The Pi's address `192.168.1.37`, Node 1's `device_id` `a4cf12e5b7c0`, and Node 2's `device_id` `246f28b1c7d4` are only examples; use your own.
> - **Hardware isn't required.** A real Node 1 and Node 2 make this week more fun (the relay really goes "click"), but the **simulator** in Practice 7 can stand in for both. If your Node 1 isn't ready yet, do steps 7.1–7.2 as soon as you reach Practice 3: write and run the simulator (it doesn't need the backend), leave it running, then do Practices 3–6 with `f00d00000001` in place of Node 1's `device_id`. The simulator stops too when VS Code is closed, so every time you continue on another day, run it again in a third terminal as in 7.2 (along with `npm run dev` in the first terminal). Steps 7.3–7.4 are still done after Practice 6. The simulator only imitates Node 1, so you can just read the steps that are specific to Node 2 (`246f28b1c7d4`).
> - **No Raspberry Pi yet?** Follow the **laptop path** as in Modules 12–15: the broker runs on the laptop, and the address `mqtt://192.168.1.37:1883` is replaced with your laptop broker's address ([Module 12 Practice 7](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md)). Wokwi path: don't point the backend at a public broker. There, `msh/#` also carries other learners' Mini Smart Home messages, and the simulator's fake devices (`f00d…`) collide with other people's simulators that use the same names, so they keep kicking each other off the broker. Run the broker on the laptop as in the laptop path above, then use the Practice 7 simulator in place of the devices (the pass criteria are in ✅).
> - **The Expected output boxes.** The author has run all of this module's code on a Windows laptop with Node.js 24, a lab MQTT broker, a mock Node 1 and Node 2, and the Practice 7 simulator. The times in the logs follow the laptop's clock (the examples in this module are written in WIB), and the broker's address is written `mqtt://192.168.1.37:1883` so that it matches your steps. The times, the command `id`s, and the millisecond numbers on your screen will certainly be different.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in VS Code, the browser, and Bruno. **Except in the terminal:** stopping a running program (the server, the simulator) is still **Ctrl + C**, on a Mac too. **Cmd + C** in the terminal only copies text. Reloading a browser page: **F5** on Windows, **Cmd + R** on macOS. Terminal commands are exactly the same on Windows and macOS, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **Never commit passwords or secret addresses.** The server's settings are written in a `.env` file, and `.env` goes into `.gitignore` as soon as that file is created (Practice 2), before it has a chance to be committed. Only `.env.example`, without secrets, goes to GitHub.
> 2. **The backend only listens on `127.0.0.1`** (the laptop itself). Opening the server to the network or the internet needs a door lock first: passwords and HTTPS come in Modules 20 and 27.
> 3. **Commands from the API move real things.** Before you send a pump command, make sure the pump's hose goes into the water tank and the tank has water in it, as in Module 5. If in doubt, test with the lamp or the simulator first.
> 4. **A `set` command is never sent retained** (data contract section 7). This module's backend already follows that rule; don't change it.
> 5. **Only one brain.** The fan automation in Node-RED is switched off in the ➕ Add-on so that the backend and Node-RED don't fight each other with commands.

This module follows the same rhythm as Modules 1–15. Because Module 4 was a long time ago, this module starts with a **🔁 JavaScript warm-up**. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (45–60 minutes)](#-javascript-warm-up-4560-minutes)
4. [🏆 Quick Win: your first server answers (20 minutes)](#-quick-win-your-first-server-answers-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Backend & API](#1-backends-and-apis-a-restaurant-waiter) · [2 HTTP](#2-http-once-more-methods-routes-status-codes-and-counters) · [3 Git in the terminal](#3-git-in-the-terminal-the-same-buttons-without-the-buttons) · [4 Light TypeScript](#4-light-typescript-type-labels-checked-before-the-program-runs) · [5 Structure & secrets](#5-project-structure-and-secrets-every-file-has-one-job) · [6 MQTT client](#6-the-backend-as-an-mqtt-client-one-ear-for-every-topic) · [7 Zod contract](#7-never-trust-the-device-a-contract-that-runs) · [8 Documentation](#8-automatic-documentation-openapi-swagger-ui-and-bruno) · [9 Commands & `ack`](#9-commands-through-the-api-send-wait-for-the-ack-and-a-time-limit) · [10 Git for teams](#10-git-for-teams-branches-pull-requests-and-reviews)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Git in the terminal](#practice-1--git-in-the-terminal-the-backends-first-commit-30-minutes) · [2 Structure & TypeScript](#practice-2--project-structure-light-typescript-and-env-35-minutes) · [3 Listening to the broker](#practice-3--the-backend-listens-to-the-broker-35-minutes) · [4 Zod contract](#practice-4--never-trust-the-device-the-data-contract-with-zod-40-minutes) · [5 `/docs` & Bruno](#practice-5--the-latest-reading-docs-and-bruno-45-minutes) · [6 Commands](#practice-6--commands-through-the-api-cmd-and-ack-40-minutes) · [7 Simulator](#practice-7--a-ten-device-simulator-25-minutes) · [8 Pull requests](#practice-8--git-for-teams-branches-pull-requests-and-reviews-45-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-16-completion-checklist)

## 🎯 After this module you can…

1. **Explain what a backend and an API are** with the restaurant waiter analogy, and read an HTTP request: the method, the route, the body, and the status code.
2. **Write light TypeScript** that Node.js 24 runs directly, and use its checker (`npm run check`) to catch typos before the program runs.
3. **Organize a tidy backend project**: the `routes`, `services`, `config`, and `schemas` folders, with secret settings in `.env` that never go to GitHub.
4. **Build a backend that listens to every MQTT topic** of Mini Smart Home, then checks every message against data contract version 1.2, written as **Zod** schemas.
5. **Provide a documented API**: `GET /devices`, `GET /devices/:id/latest`, and `POST /devices/:id/command` with the right status codes, plus a `/docs` page that's generated automatically.
6. **Send commands through the API**, wait for their `ack` with a time limit, and record the result.
7. **Test the API with Bruno** and a **ten-device simulator**, without depending on hardware.
8. **Work like a team with Git in the terminal**: a branch per feature, pull requests, reviews with a checklist, and the merge.

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **A laptop with Node.js 24 and VS Code** | Both were installed in Module 4. Check with `node --version` (it must say `v24…`). A Mac that's stuck on macOS 12 and has used Node.js 22 since Module 4: every step of this module also works on Node.js 22.18 or newer (tested with 22.23.3). If your version is lower than that, install the latest version 22 as in Module 4 Practice 3. |
| **The `mini-smart-home` repository** on the laptop | Created in Module 3, holding your work up to Module 15 (`tools`, `edge`, `firmware`, `DATA-CONTRACT.md` version 1.2). |
| **Git** | Installed in Practice 1. Windows: Git for Windows 2.56.0 (about 64 MB). macOS: the Command Line Tools (a download of about 0.5–1 GB). |
| **GitHub CLI** (macOS only) | Installed in Practice 1 to sign in to GitHub from the terminal (about 28 MB). |
| **Bruno 4.2.1** | An app for trying APIs, installed in Practice 5 (about 116 MB on Windows, 160 MB on macOS). |
| **MQTTX** | From Module 11, with the **Pi gateway** connection from Module 12. |
| **The Pi gateway** with Mosquitto | From Module 12. Without a Pi: a broker on the laptop (the laptop path of Modules 12–15). |
| **Node 1 v1.4.0** with its lamp relay, and **Node 2** | From Modules 14–15. They're optional: the Practice 7 simulator stands in for them, but the "relay turns on" requirement in ✅ needs a real Node 1 (or follow the criteria of the simulator path). |
| **An internet connection** | For `npm install` and for downloading Git and Bruno. |

Versions used in this module (October 2026): **Node.js 24** (tested with 24.21.0; any 24 LTS version works), **fastify 5.12.7**, **mqtt 5.16.1**, **zod 4.6.7**, **fastify-type-provider-zod 7.0.0**, **@fastify/swagger 9.9.2**, **@fastify/swagger-ui 6.1.2**, **typescript 7.0.2**, **@types/node 24**, **pino-pretty 13.2.0**, **Bruno 4.2.1**, **Git 2.56.0**, and **GitHub CLI 2.102.0**. Every npm library is installed with its version written out (for example `npm install fastify@5.12.7`) so that your results match this module.

## 🔁 JavaScript warm-up (45–60 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24** (installed in Module 4), the `learn-iot` repository folder, and an internet connection (step 6).

You last wrote JavaScript in Module 4, three months ago. Since then you've been writing C++ for the ESP32, so it's natural if a few things feel fuzzy. This week's backend uses six basic JavaScript skills, the same ones as in Module 4. This warm-up goes over all six in one small file, `warmup.js`. Type the code yourself (don't copy and paste), run it after every step, and compare the output.

**Prepare the folder.**

1. Open VS Code, then open the **`learn-iot`** repository folder (**File → Open Folder…**), as in Module 4.
2. In the Explorer panel, first click the empty space below the file list, then click the **New Folder** icon and name it **`module-16`**.
3. Open a terminal (**Terminal → New Terminal**), then go into that folder and create the "project's ID card" as in Module 4 Practice 4. The third command (`npm pkg set type=module`) marks this project as an ES module so that `import` and `export` can be used:

   ```text
   cd module-16
   npm init -y
   npm pkg set type=module
   ```

4. Click the `module-16` folder in the Explorer, then create two new files in it: **`helpers.js`** and **`warmup.js`**.

### Step 1 — Objects and JSON

MQTT messages from Node 1 arrive at the backend as **JSON text**. `JSON.parse()` turns it into an **object** whose fields can be read with a dot, and `JSON.stringify()` turns an object back into text (Module 4 Concepts 7–8). Type this in `warmup.js`:

```js
// warmup.js - a JavaScript warm-up before Module 16

// 1. Objects and JSON
const text = '{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","temperature":28.5,"humidity":71,"motion":false}';
const reading = JSON.parse(text); // JSON text -> object
console.log("Temperature:", reading.temperature, "°C");
console.log("Any motion?", reading.motion);
reading.location = "living room"; // add a new field
console.log(JSON.stringify(reading)); // object -> JSON text
```

Save (**Ctrl + S**), then run it in the terminal:

```text
node warmup.js
```

**Expected output:**

```text
Temperature: 28.5 °C
Any motion? false
{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","temperature":28.5,"humidity":71,"motion":false,"location":"living room"}
```

Notice the quotes: the JSON text is wrapped in **single quotes** on the outside because it's full of double quotes on the inside.

### Step 2 — Arrays, `filter`, and `map`

The backend will keep many devices at once. `filter` picks the items of an array that meet a condition, while `map` turns every item into another shape (Module 4 Concept 9). Add this below step 1:

```js
// 2. Arrays, filter, and map
const list = [
  { device_id: "a4cf12e5b7c0", temperature: 28.5 },
  { device_id: "246f28b1c7d4", temperature: 31.2 },
  { device_id: "f00d00000001", temperature: 33.0 },
];
const hot = list.filter((r) => r.temperature > 30);
console.log("Devices above 30 °C:", hot.length);
```

### Step 3 — Arrow functions and template literals

An arrow function is a short way to write a function, and a **template literal** (wrapped in backticks, the key to the left of **1** on the keyboard) can insert values with `${...}` (arrow functions in Module 4 Concept 6, template literals in Concept 3, where they're called template strings). Add:

```js
// 3. Arrow functions and template literals
const summarize = (r) => `${r.device_id}: ${r.temperature} °C`;
console.log(list.map(summarize));
```

Run `node warmup.js` again. The output of steps 2 and 3 appears below the output of step 1; the list from `map` is printed on five lines because it's too long for one line:

```text
Devices above 30 °C: 2
[
  'a4cf12e5b7c0: 28.5 °C',
  '246f28b1c7d4: 31.2 °C',
  'f00d00000001: 33 °C'
]
```

The number `33.0` is printed as `33`: JavaScript doesn't keep zeros after the decimal point. If you need one digit after the decimal point, use `.toFixed(1)` as in step 4.

### Step 4 — `import` and `export`

This week's backend is made of a dozen or so small files that borrow functions from each other through `export` and `import` (Module 4 Concept 10). Type this in **`helpers.js`**:

```js
// helpers.js - small functions used by warmup.js
export function average(numbers) {
  const sum = numbers.reduce((total, x) => total + x, 0);
  return sum / numbers.length;
}
```

`reduce` adds up the items of the array one by one, starting from `0`. Then, in **`warmup.js`**, add one line at the **very top**, right below the first comment line:

```js
import { average } from "./helpers.js";
```

and one line at the **very bottom**:

```js
// 4. import from another file
console.log("Average temperature:", average(list.map((r) => r.temperature)).toFixed(1), "°C");
```

Run it again. The new line: `Average temperature: 30.9 °C`.

### Step 5 — Waiting without freezing: `Promise` and `await`

A backend often waits: for the broker to connect, for a device's answer. `await` waits for a Promise (a "promise" that the result will follow) without freezing the program (Module 4 Concept 12). Add this at the very bottom:

```js
// 5. Waiting without freezing: Promise and await
const wait = (ms) => new Promise((done) => setTimeout(done, ms));
console.log("Waiting 1 second...");
await wait(1000);
console.log("Done waiting.");
```

Run it again: there's a pause of about one second between the two new lines.

### Step 6 — `fetch`: asking another server

`fetch` sends an HTTP request and waits for its answer (Module 4 Practice 8). This week, you'll also be the **server** that gets asked. Add this at the very bottom:

```js
// 6. fetch: asking another server over HTTP
const reply = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.85&current=temperature_2m");
console.log("Status code:", reply.status);
const data = await reply.json();
console.log("Jakarta temperature now:", data.current.temperature_2m, "°C");
```

Run it once more. **Expected output** (all of it; the Jakarta temperature will certainly be different):

```text
Temperature: 28.5 °C
Any motion? false
{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","temperature":28.5,"humidity":71,"motion":false,"location":"living room"}
Devices above 30 °C: 2
[
  'a4cf12e5b7c0: 28.5 °C',
  '246f28b1c7d4: 31.2 °C',
  'f00d00000001: 33 °C'
]
Average temperature: 30.9 °C
Waiting 1 second...
Done waiting.
Status code: 200
Jakarta temperature now: 33.5 °C
```

Status code `200` means "success". You'll create other status codes (`400`, `404`, `409`, `504`) yourself this week (Concept 2). Weather data from [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0), as in Module 4.

**The most common errors in this warm-up:**

| Message in the terminal | What it means |
| :--- | :--- |
| `SyntaxError: Cannot use import statement outside a module` | `npm pkg set type=module` was skipped. Run it in the `module-16` folder, then try again. |
| A `SyntaxError` that mentions `in JSON at position …` | The JSON text in step 1 has a typo, for example a missing double quote or a comma before `}`. The number after `position` points to where the mistake is. |
| `TypeError: Cannot read properties of undefined (reading 'temperature_2m')` | The Open-Meteo address has a typo, so its answer has no `current` field. Check the address letter by letter. |
| `TypeError: fetch failed` | The laptop isn't connected to the internet, or the server's name has a typo. |

**Test yourself (10 minutes).** Without looking at the key, add to `warmup.js`:

1. An arrow function `above(list, limit)` that returns **only the `device_id`s** of the devices whose temperature is above `limit`. For the `list` from step 2 and a limit of `31`, the result is `[ '246f28b1c7d4', 'f00d00000001' ]`.
2. An `async` function named `jakartaTemperature()` that returns Jakarta's temperature from Open-Meteo, then print `Hot!` if the temperature is above 30.

<details>
<summary>Self-test answer key</summary>

```js
// test 1: filter first, then map to device_id
const above = (list, limit) => list.filter((r) => r.temperature > limit).map((r) => r.device_id);
console.log(above(list, 31));

// test 2: an async function returns a Promise, so its caller uses await too
async function jakartaTemperature() {
  const reply = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.85&current=temperature_2m");
  const data = await reply.json();
  return data.current.temperature_2m;
}
const temperature = await jakartaTemperature();
if (temperature > 30) {
  console.log("Hot!");
}
```

Forgot the `await` in front of `jakartaTemperature()`? Then `temperature` holds `Promise { <pending> }`, not a number, and the comparison `temperature > 30` is always `false`. That's the same mistake as in Module 4 Practice 6.

</details>

The warm-up is done. Save `module-16` to GitHub as usual (GitHub Desktop) if you like. Starting in Practice 1, you'll also use `git` directly from the terminal.

## 🏆 Quick Win: your first server answers (20 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, a **browser**, and the **`mini-smart-home`** repository folder on the laptop (created with GitHub Desktop in Module 3: **Documents → GitHub → mini-smart-home**). No hardware is used yet.

In 20 minutes, your laptop runs a server you wrote yourself that answers questions from the browser. Its code is written in **TypeScript**, and Node.js 24 runs it directly.

### Step 1 — Create the `backend` folder (3 minutes)

1. In VS Code, choose **File → Open Folder…**, then open the **`mini-smart-home`** folder (not `learn-iot`). The Explorer panel shows folders you already know: `tools`, `edge`, `firmware`, and the file `DATA-CONTRACT.md`.
2. Click the empty space below the Explorer's file list, click the **New Folder** icon, then name it **`backend`**. All of this week's server code lives in this folder.

### Step 2 — The project's ID card and Fastify (5 minutes)

Open a new terminal (**Terminal → New Terminal**). A terminal always starts in the folder that's open, which is `mini-smart-home`. Type these one at a time:

```text
cd backend
npm init -y
npm pkg set type=module
npm install fastify@5.12.7
```

You know the second and third commands from the warm-up: they create `package.json` and mark the project as an ES module. The fourth command installs **Fastify**, the library that takes care of all the "server" work (receiving requests, finding the route, sending the answer), with its version pinned like `dayjs` in Module 4 Practice 7. **Expected output** (the last command):

```text
added 48 packages, and audited 49 packages in 3s

19 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

It turns out Fastify brings 47 other small libraries along with it; they all go into the `node_modules` folder that has just appeared. That folder is big and can be rebuilt at any time with `npm install`, so it won't go to GitHub later (Practice 1).

### Step 3 — Write `src/server.ts` (5 minutes)

1. In the Explorer, click the **`backend`** folder, then create a new folder **`src`** inside it.
2. Click the **`src`** folder, then create a new file **`server.ts`**. The `.ts` ending means a TypeScript file.
3. Type its contents:

```ts
// server.ts - the first Mini Smart Home server (Module 16, Quick Win)
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { ok: true, message: "Mini Smart Home backend is alive" };
});

await app.listen({ port: 8080, host: "127.0.0.1" });
```

Only four instructions:

- `Fastify({ logger: true })` creates a server that logs its activity in the terminal.
- `app.get("/health", …)` registers a **route**: if someone asks `GET /health`, run this function. The object the function returns is sent as JSON automatically.
- `app.listen(…)` opens "counter" number **8080** at the address **`127.0.0.1`**, which is the laptop itself. The number 8080 was chosen because counter 3000 from Module 4 is often used by other programs on the laptop (Concept 2).
- The `await` on the last line waits until the counter is really open.

Save with **Ctrl + S**.

### Step 4 — Run it and ask from the browser (4 minutes)

In the terminal (still in the `backend` folder), run:

```text
node --watch src/server.ts
```

**Expected output** (one JSON log line; the `time` and `pid` numbers and your laptop's name will be different):

```text
{"level":30,"time":1792383502461,"pid":20356,"hostname":"laptop-budi","msg":"Server listening at http://127.0.0.1:8080"}
```

`Server listening at http://127.0.0.1:8080` means the server is waiting for guests. Open a browser, then type this address in the address bar:

```text
http://127.0.0.1:8080/health
```

The browser shows your server's answer (some browsers lay it out with colors and a pretty-print button):

```json
{"ok":true,"message":"Mini Smart Home backend is alive"}
```

Two new log lines appear in the terminal: `incoming request` (a guest has arrived) and `request completed` (the guest has been served), complete with `"statusCode":200` and how long the service took in milliseconds. Usually three more lines follow for `/favicon.ico`, with `Route GET:/favicon.ico not found` and `"statusCode":404`. That's the browser looking for a small icon for its tab; your server doesn't have an icon, so just ignore them.

### Step 5 — Change, save, and watch the server restart itself (3 minutes)

1. In `server.ts`, change the text `Mini Smart Home backend is alive` to `hello from my backend`, then save.
2. Look at the terminal. Without being told, Node.js clears the terminal screen (the old log disappears from the screen), then writes:

   ```text
   Restarting 'src/server.ts'
   ```

   (on Node.js 24.19 or newer, it's preceded by one line, `Change detected in '…\\src\\server.ts'`; on Windows, the backslashes really are shown doubled). That's what `--watch` is for: every time a file is saved, the server restarts with the latest code.
3. Reload the browser page (**F5**). The answer is now `{"ok":true,"message":"hello from my backend"}`.
4. Stop the server with **Ctrl + C** in the terminal. Reload the browser: now it reports that it can't connect, because nobody is waiting at counter 8080 anymore.

🎉 **Congratulations!** You've just run your first **backend**: a program that waits for questions and answers them with JSON. By the end of the week, the same server will answer real questions: "which devices are there?", "what's Node 2's latest temperature?", and "please turn on the lamp".

> [!TIP]
> **Not working?**
>
> - `Error: listen EADDRINUSE: address already in use 127.0.0.1:8080` → another program (often this very server, still running in another terminal) is using counter 8080. Close the old terminal with the trash can icon in the terminal panel, or change `8080` to `8081` in the code and in the browser's address.
> - `Unknown file extension ".ts"` → your Node.js is too old to run TypeScript directly. Run `node --version`; if the output isn't `v24…`, install Node.js 24 LTS as in Module 4 Practice 3. An old Mac that's stuck on Node.js 22 only needs the latest version 22 (at least `v22.18`), as the note in 🧰 says.
> - `Cannot find package 'fastify'` → `npm install fastify@5.12.7` hasn't been run **in the `backend` folder**. Check with `pwd`: the path it prints must end in `backend`.
> - The browser reports that it can't connect (for example `This site can't be reached` or `Hmmm… can't reach this page`) → the server isn't running yet or has already been stopped, or the address has a typo (`127.0.0.1`, a colon, `8080`).

> ➡️ **Done with the Quick Win?** Read [Concept 1](#1-backends-and-apis-a-restaurant-waiter) to [Concept 3](#3-git-in-the-terminal-the-same-buttons-without-the-buttons), then do the practices in the order given at the start of 🧠.

## 🧠 The "Why" Concepts

This week's ten concepts are studied in turns with their practices. At every switching point there's a ➡️ box (forward to a practice) or a ⬆️ box (back to the concepts) with a link you just click. The order:

1. Concepts 1–3 → Practice 1 (Git in the terminal)
2. Concepts 4–5 → Practice 2 (project structure, TypeScript, `.env`)
3. Concepts 6–7 → Practices 3–4 (listening to the broker, checking the contract)
4. Concept 8 → Practice 5 (the latest reading, `/docs`, Bruno)
5. Concepts 9–10 → Practices 6–8 (commands through the API, the simulator, branches, pull requests, reviews)

### 1. Backends and APIs: a restaurant waiter

Imagine a restaurant. **Guests** sit at a table and order through a **waiter**; the waiter takes the order to the **kitchen**, then comes back with the food. Guests never go into the kitchen, and the kitchen doesn't need to know who the guests are. What matters is that both agree on the **menu**: what may be ordered and what each dish looks like.

In Mini Smart Home:

- **The kitchen** = the devices and the broker: Node 1, Node 2, and Mosquitto on the Pi, which keep producing data.
- **The waiter** = the **backend**: a server program that keeps running, listens to the kitchen, remembers the last state of every device, and serves the orders.
- **The guests** = anyone who asks: Bruno this week, the React dashboard in Module 22, a phone app, or a friend's program.
- **The menu** = the **API** (*Application Programming Interface*): the list of "doors" that guests may knock on, for example `GET /devices` ("the device list, please") or `POST /devices/a4cf12e5b7c0/command` ("turn on Node 1's lamp").

Why not just have the dashboard subscribe to MQTT directly, like Node-RED? Because the waiter adds three things the kitchen doesn't have: it **checks** every dish before it's served (Concept 7), it **remembers** the orders and their answers (Concept 9; later also a database in Module 17), and it **guards the door** (who may order what, Module 20). Guests also only need to speak HTTP, the language every app understands, without having to understand MQTT.

![Diagram of the restaurant waiter analogy for a backend and an API: guests order through the waiter, the waiter talks to the kitchen, and guests never enter the kitchen. Left, the Guests card, anyone who asks: Bruno (this week), a React dashboard (later, Module 22), and a phone app (later). Center, the green card Waiter = backend, your own server program that keeps running on the laptop, holding Menu = API, the doors guests may knock on: GET /devices, the device list, please; GET /devices/:id/latest, its latest reading, please; POST /devices/:id/command, turn on Node 1's lamp. Between the guests and the waiter, the label HTTP, the language of every app: a request arrow toward the waiter, and a response + status code arrow back to the guests. Right, the Kitchen card, devices and the broker: Node 1 Home (sensors + relays), Node 2 Garden (via Node 1), and Mosquitto on the Pi 192.168.1.37. Between the waiter and the kitchen, the label MQTT: a cmd arrow toward the kitchen, and an msh/# arrow back to the waiter, carrying telemetry, status, vitals, and ack. Bottom, three things the waiter adds that the kitchen doesn't have: 1 checks, every message and request is checked with Zod before it's trusted (Concept 7); 2 remembers, the last state of every device and the commands waiting for an ack, in memory (later in a database, Module 17); 3 guards the door, marked later and drawn with a dashed line: who may order what, the login and user roles (Module 20, not this week).](assets/backend-restaurant-waiter.png)

The Syllabus calls **backend v0.1** "no database": this week, everything it remembers is kept only in memory. When the server is stopped, it forgets everything, and its memory fills up again as soon as the next device messages arrive. Module 17 gives it a permanent memory.

### 2. HTTP once more: methods, routes, status codes, and counters

You've already met HTTP in Module 4 (`webhook-receiver.js`) and Module 10 (the web server on the ESP32). Every HTTP request has four parts that matter this week:

| Part | Example | What it means |
| :--- | :--- | :--- |
| **Method** | `GET`, `POST` | `GET` = ask for data, without changing anything. `POST` = send something that changes the state, for example a command. |
| **Route** | `/devices/a4cf12e5b7c0/latest` | Which "door" is being knocked on. The `a4cf12e5b7c0` part is a **parameter**: in the code it's written `/devices/:id/latest`, and `:id` is filled with whatever the guest typed. |
| **Body** | `{"target":"lamp","value":true}` | Only for `POST`: the data the request carries, usually JSON. |
| **Status code** | `200`, `404` | A three-digit number in the answer: success or failure, and why. |

The status codes this week's backend uses:

| Code | Name | When our backend answers with it |
| :---: | :--- | :--- |
| `200` | OK | The request succeeded; the answer is in the body. |
| `400` | Bad Request | The guest's request has the wrong shape, for example a pump `value` of `30` when the maximum is `10`. The **guest's** fault. |
| `404` | Not Found | The route doesn't exist, or the device being asked about has never been heard. |
| `409` | Conflict | The request is correct, but the current state doesn't allow it: the device is `offline`, or Node 2 is given a command (Node 2 doesn't accept commands). |
| `503` | Service Unavailable | The backend isn't connected to the broker right now, so the command can't be sent. The **server's** fault, not the guest's. |
| `504` | Gateway Timeout | The command was sent, but the device didn't answer within 5 seconds. |

The rule of thumb: **a `4xx` code = the guest has to fix the request, a `5xx` code = a problem on the server's or the device's side.** The right status code lets other apps react automatically; a clear error message (`{"message":"device is offline, command not sent"}`) lets people react.

**Counters (ports) and addresses.** A server listens on one address and one counter number (Module 4 Concept 13). Our backend listens on **`127.0.0.1:8080`**:

- **`127.0.0.1`** is the address of "this laptop itself". Only programs on the same laptop can knock. That's on purpose: the backend has no door lock yet, and opening it to the home network is only safe after Module 20. As a bonus, Windows doesn't pop up a firewall dialog.
- **`8080`**, not `3000` as in Module 4, because counter 3000 is often already taken by another program on a programmer's laptop (web development tools, and later Grafana in Module 25). One counter is for one program only.
- Write **`127.0.0.1`**, not `localhost`. On some laptops, `localhost` points to the IPv6 address `::1`, so your request can end up at another program or get no answer at all.

### 3. Git in the terminal: the same buttons, without the buttons

Since Module 3, you've been saving your work to GitHub with GitHub Desktop: tick the changes, write a summary, click **Commit to main**, then **Push origin**. Behind those buttons, GitHub Desktop runs a program called **`git`**. This week you call `git` directly from the VS Code terminal. The reason is practical: almost every programming team, every server on the internet (Module 27), and every automated system (Module 29) uses `git` from the terminal, and its commands are the same on Windows, macOS, Linux, and the Raspberry Pi.

| In GitHub Desktop | In the terminal | What it means |
| :--- | :--- | :--- |
| The **Changes** tab | `git status` | Which files have changed since the last commit |
| Ticking a file | `git add <file>` | Puts the changes into the "basket" of the next commit |
| Summary + **Commit to main** | `git commit -m "summary"` | Takes a snapshot of the basket's contents as one commit |
| **Push origin** | `git push` | Sends the commits to GitHub |
| The **History** tab | `git log --oneline` | The list of commits, one line per commit |

You can keep using GitHub Desktop side by side: both read the same repository folder, so a commit made in the terminal shows up in GitHub Desktop right away, and the other way around. Only the method is new this week. Concept 10 adds a team workflow: every feature is built on its own branch, then merged through a pull request.

**Files that must stay out.** The `node_modules` folder (tens of megabytes, rebuildable with `npm install`) and the `.env` file (which holds secret settings, Concept 5) are listed in **`.gitignore`**, the "ignore" list you've used since Module 4 for `node_modules/`, and later for `secrets.h` (Module 10) and `keys.h` (Module 14). Git will never offer those files for a commit.

> ➡️ **Time to practice!** Concepts 1–3 are enough for [Practice 1 — Git in the terminal](#practice-1--git-in-the-terminal-the-backends-first-commit-30-minutes). After that, come back to Concept 4.

### 4. Light TypeScript: type labels checked before the program runs

JavaScript doesn't care about data types until the program runs. If you mistype `reading.temperatuure`, JavaScript stays quiet and gives `undefined`; the mistake only shows up hours later, when the dashboard shows an empty temperature. **TypeScript** is JavaScript with **type labels**:

```ts
interface Reading {
  temperature: number;
  humidity: number;
}

function show(r: Reading): string {
  return `temperature ${r.temperature} °C, humidity ${r.humidity} %`;
}
```

- `interface Reading` lists which fields a reading has, along with their types: `number` (a number), `string` (text), `boolean` (`true`/`false`).
- `r: Reading` means "the parameter `r` must have the shape of a `Reading`", and `: string` after the parentheses means "this function returns text".

With those labels, **VS Code** immediately underlines `r.temperatuure` with a red squiggly line as you type, complete with the message `Property 'temperatuure' does not exist on type 'Reading'. Did you mean 'temperature'?`. The mistake is caught **before** the program runs, just as the C++ compiler in the Arduino IDE rejects a variable that wasn't declared.

**"Light" has two meanings here.**

1. **Node.js 24 runs `.ts` files directly.** When it reads a `.ts` file, Node.js simply **removes the type labels** (*type stripping*), then runs the rest as ordinary JavaScript. There's no "build" step and no extra tool. As a result, **Node.js doesn't check the types at all**: the checking is done by VS Code as you type, and by the `npm run check` command (Practice 2) before a commit.
2. **We only use a small part of TypeScript**: type labels, `interface`, and `type`. TypeScript features that can't simply be removed, for example `enum`, are rejected by Node.js with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. Two more small rules: imports from your own files are written **complete with the `.ts` ending** (`import { env } from "./config/env.ts"`), and imports that only bring in types are written `import type`.

"Heavy" TypeScript (advanced features and a build step) is in 🔬. For most IoT backends, this light version already catches most typos.

### 5. Project structure and secrets: every file has one job

The Quick Win's `server.ts` is only ten lines. Backend v0.1 at the end of the week is about 400 lines. If everything were piled into one file, just finding one line would be exhausting. Like a restaurant kitchen that's divided into a cutting table, a stove, and a serving counter, the backend's code is divided into folders with clear jobs:

```text
backend/
├── package.json          the project's ID card: name, libraries, and npm run … commands
├── tsconfig.json         the TypeScript checker's settings (used by VS Code and npm run check)
├── .env                  this laptop's secret settings (NOT in Git)
├── .env.example          an example .env without secrets (in Git)
├── .gitignore            the list Git ignores: node_modules/ and .env
├── bruno/                the request collection for Bruno (Practice 5)
└── src/
    ├── server.ts         the entry point: puts the server together and starts it
    ├── config/env.ts     reads and checks the settings from .env
    ├── schemas/contract.ts the data contract of Appendix A as Zod schemas
    ├── services/mqtt.ts    "the ear": the connection to the broker, messages in and out
    ├── services/store.ts   "memory": the last state of every device
    ├── routes/health.ts    the GET /health route
    └── routes/devices.ts   the /devices routes
```

- **`routes/`** holds the API's doors: the routes and their handlers (the functions that answer).
- **`services/`** holds the behind-the-scenes work that knows nothing about HTTP: talking to the broker, remembering data.
- **`config/`** holds the settings.
- **`schemas/`** holds the rules for the shape of the data.

The rule for dividing it: routes may use services, but services don't use routes. Later, when `store.ts` is replaced by a database (Module 17), the routes don't need to change.

**Secrets in `.env`.** The broker's address, the port number, and later the database password and secret keys are different on every laptop and must not get out. They belong in the **`.env`** file, one setting per line:

```text
MQTT_URL=mqtt://192.168.1.37:1883
PORT=8080
HOST=127.0.0.1
```

Node.js 24 reads this file by itself through the **`--env-file=.env`** option, and the code can then read its contents through `process.env.MQTT_URL`. The `.env` file goes into `.gitignore`; what goes to GitHub is **`.env.example`**, with example contents and no secrets, so that other people know which settings need to be filled in. Once a password has been committed, consider it leaked: deleting it in the next commit doesn't delete it from the Git history.

> ➡️ **Time to practice!** Concepts 4–5 are enough for [Practice 2 — Project structure, light TypeScript, and `.env`](#practice-2--project-structure-light-typescript-and-env-35-minutes). After that, come back to Concept 6.

### 6. The backend as an MQTT client: one ear for every topic

To the broker, the backend is just another **MQTT client**, just like MQTTX or Node-RED. The **mqtt.js** library (`mqtt` on npm, which the contract checker has also used since Module 11) connects the backend to the broker, then the backend subscribes to **`msh/#`**. The `#` sign means "every topic under `msh/`", so one subscription catches the `telemetry`, `status`, `vitals`, and `ack` of every device at once.

For every incoming message, the topic is read first. The topic `msh/a4cf12e5b7c0/telemetry` is split at the `/` signs into three parts: the prefix `msh`, the `device_id` `a4cf12e5b7c0`, and the message kind `telemetry`. The message kind decides how its content is read (data contract section 2):

| Kind | Content | What the backend does |
| :--- | :--- | :--- |
| `telemetry` | the sensor readings as JSON | checked, then stored as that device's latest reading |
| `status` | the text `online`, `offline`, or `offline-mode` | checked, then stored as the device's status |
| `vitals` | the device's health as JSON | checked, then stored |
| `ack` | the answer to a command as JSON | checked, then handed over to the command that's waiting for it (Concept 9) |
| `cmd` | a command | ignored: it's a command from the backend itself or from MQTTX, not device data |

The backend also needs a client name (*client ID*) of its own. The data contract gives each device its `device_id` as its name; the backend uses `backend-` followed by six random letters and digits so that two backends that happen to run at the same time don't kick each other off the broker. The retained statuses (Module 11) reach the backend as soon as it subscribes, so a backend that has just started knows right away which devices are `online`.

### 7. Never trust the device: a contract that runs

The data contract (Appendix A, `DATA-CONTRACT.md` version 1.2) is a promise: `temperature` is a number from −40 to 80 or `null`, `humidity` is an integer from 0 to 100, `ts` is a UTC time, and so on. But promises can be broken: new firmware with a mistyped field name, a broken sensor that sends `humidity: 255`, a friend who publishes `{"temperature":"hot"}` from MQTTX as a prank, or a foreign device in disguise. A backend that stores whatever arrives would spread those mistakes to the database and the dashboard. That's why the backend's first rule is: **never trust the device**.

**Zod** is a library for writing the rules for the shape of data as a **schema**, and then checking data against that schema:

```ts
const Vitals = z.strictObject({
  ts: z.iso.datetime(),                  // a UTC time text, for example 2026-10-19T02:10:05Z
  rssi: z.number().int().max(0),         // a whole number, not positive
  uptime_s: z.number().int().min(0),
  heap_free: z.number().int().min(0),
});

const result = Vitals.safeParse(json);   // check it, without stopping the program
if (!result.success) {
  // reject: log the reason, don't store it
}
```

A schema like this is **a contract that runs**: Appendix A, which until now could only be read by people, can now also be checked by a program, message by message. `z.strictObject` rejects fields that aren't in the contract (the typo `temperatuure` is caught right away), and `safeParse` returns a list of problems that people can read, for example `humidity: Too big: expected number to be <=100`.

Zod works at **two doors**:

1. **The MQTT door**: every device message is checked before it's stored. Messages that break the rules are rejected, logged as `REJECTED`, and counted.
2. **The HTTP door**: every guest request is checked before it's carried out. `{"target":"pump","value":30}` is rejected with code `400` before it can become a command to Node 1.

One schema is used three times: for checking, for giving TypeScript type labels (`z.infer`), and for generating the API documentation (Concept 8). This is the way of working that companies look for: the rules are written **once** and used everywhere.

The contract checker of Module 11 (`tools/contract-checker.js`) and Zod both check the contract, but their jobs are different. The checker is a **test tool** that you run for a while when you change the firmware; Zod in the backend is a **door guard** that works all the time, every second, for every message.

> ➡️ **Time to practice!** Concepts 6–7 are enough for [Practice 3 — The backend listens to the broker](#practice-3--the-backend-listens-to-the-broker-35-minutes) and [Practice 4 — Never trust the device](#practice-4--never-trust-the-device-the-data-contract-with-zod-40-minutes). After that, come back to Concept 8.

### 8. Automatic documentation: OpenAPI, Swagger UI, and Bruno

A restaurant menu that's never updated is worse than no menu at all: guests order dishes that no longer exist. API documentation is the same. If it's written by hand in a separate file, sooner or later it drifts away from the code. The way out: **the documentation is generated automatically from the same code**.

- **OpenAPI** is a standard format for describing an API: which routes exist, which methods, what the request body looks like, and which answers are possible (complete with their status codes). It takes the form of one big JSON file that programs can read.
- **@fastify/swagger** builds that OpenAPI file from the Fastify routes and their Zod schemas (Concept 7). The schema that checks the requests **is** the documentation, so the two can't drift apart.
- **@fastify/swagger-ui** shows that file as a tidy web page at **`/docs`**: every route is one colored row that you can click to see the request body and example answers, and you can even try it straight from the browser.

![The /docs page, API documentation generated from the code: real Swagger UI screenshots of the final backend with five numbers, cut and rearranged. Left, the route list: the fastify top bar with the address box http://127.0.0.1:8080/docs/json and the Explore button, the title Mini Smart Home API with the badges 0.1.0 and OAS 3.0, the link http://127.0.0.1:8080/docs/json, and the description Backend v0.1 (Module 16). Number 1 marks the address of that OpenAPI document. Number 2 marks the server and devices groups. Number 3 marks the route rows, each with its summary: GET /health, Server state: alive, connected to the broker, and message counts; GET /devices, List every device ever heard; GET /devices/{id}/latest, The latest telemetry reading of one device; GET /devices/{id}/vitals, The last health report of one device (vitals); and POST /devices/{id}/command, Send one set command to a device, then wait for its ack (5 seconds at most). Right, the POST /devices/{id}/command route opened and cut into sections. Number 4 marks the Request body (required, application/json) with the Example Value target lamp, value true. Number 5 marks the Responses list with the columns Code, Description, and Links: 200 the device answered with an ack; 404 the device has never been heard; 409 the device is offline, is Node 2, or its kind isn't known yet; 503 the backend is not connected to the broker; 504 no ack within 5 seconds; all with No links. Notes at the bottom: 1 the OpenAPI document's address, one JSON file that other programs can read, for example Bruno; 2 groups from the tags field of each route's schema; 3 one row per route, with a colored method (GET blue, POST green), the path, and the summary from the summary field; 4 the request body from the SetCommand schema with its example; 5 the responses per status code with descriptions from .describe; code 400 isn't listed because Fastify itself sends that response when the body or the id breaks the schema.](assets/swagger-docs.png)

**Bruno** is an app for **trying APIs**: you put together a request (method, address, JSON body), press send, then look at the status code, the time, and the body of the answer. It works like MQTTX, but for HTTP. Why isn't the browser enough? The browser is only easy to use for `GET`; for a `POST` with a JSON body, you need a tool like Bruno. Why Bruno and not the better-known Postman? Bruno saves every request as a **plain text file** in your project folder (`backend/bruno/`), with no account and no cloud service. As a result, your request collection gets committed along with the code: a friend only has to open that folder in Bruno to try exactly the same API.

Swagger UI and Bruno complement each other: **`/docs` answers "which doors are there?"**, while **Bruno keeps "the requests I try often"**, complete with an environment (a set of variables, for example `baseUrl` = `http://127.0.0.1:8080`) so that the server's address only needs to be changed in one place.

> ➡️ **Time to practice!** Concept 8 is enough for [Practice 5 — The latest reading, `/docs`, and Bruno](#practice-5--the-latest-reading-docs-and-bruno-45-minutes). After that, come back to Concept 9.

### 9. Commands through the API: send, wait for the `ack`, and a time limit

Since Module 11, a command to Node 1 has gone like this: someone publishes JSON to `msh/<device_id>/cmd`, Node 1 carries it out, then answers on `msh/<device_id>/ack` with the same `id` (data contract sections 7–8). MQTT is **asynchronous**: the sender doesn't wait, and the answer comes on another topic. HTTP is the opposite: a guest sends one request and **waits for one answer**. The backend bridges the two:

![Sequence diagram of a command through the API, with time running from top to bottom: HTTP waits for one answer, MQTT doesn't, and the backend bridges the two. Four lifelines from left to right: Bruno (the guest, HTTP), Backend (API + MQTT ear, highlighted in green), Broker (Mosquitto on the Pi), and Node 1 (a4cf12e5b7c0). 1, Bruno sends POST /devices/a4cf12e5b7c0/command with the body target lamp, value true. 2, the backend checks the content with Zod, then the state: the device exists, is Node 1 (not Node 2), and is online. The box beside it reads 409 if the device is offline, answered at once without trying. 3, the backend makes the command id c-20261019-041128-1, then starts waiting for an ack with that id, with an hourglass labeled waits at most 5 seconds. 4, the backend publishes to msh/a4cf12e5b7c0/cmd with QoS 1, not retained, and the broker passes it on to Node 1 as shortened JSON, with the same id, target lamp, and value true. Red box on the left: no ack within 5 seconds, the backend gives up with 504, Bruno doesn't wait forever. 5, Node 1 turns on the lamp relay, click, then answers with the same id on msh/a4cf12e5b7c0/ack; the broker passes the ack with the id c-20261019-041128-1 and ok true on to the backend. 6, the MQTT ear checks that ack, then hands it over to the waiting request, and the backend answers Bruno with 200 + ack + wait_ms, for example wait_ms 12.](assets/command-ack-flow.png)

1. Bruno sends `POST /devices/a4cf12e5b7c0/command` with the body `{"target":"lamp","value":true}`.
2. The backend checks the body (Zod) and makes sure that the device exists, is Node 1 (not Node 2), and is `online`.
3. The backend makes a new **command `id`**, for example `c-20261019-041128-1`, then **starts waiting** for an `ack` with that `id`.
4. The backend publishes the command to `msh/a4cf12e5b7c0/cmd` (QoS 1, **not** retained).
5. Node 1 turns on the relay, then answers on `msh/a4cf12e5b7c0/ack`.
6. The backend's MQTT ear (Concept 6) receives that `ack`, checks it, then **hands it over** to the request that's waiting. The backend answers Bruno with `200`, along with the `ack` and how long it waited, in milliseconds.

What if Node 1 doesn't answer, for example because its power goes out just before the command arrives? Without a **time limit**, Bruno's request would wait forever. The data contract says every `cmd` is answered within 5 seconds (rule 4), so the backend waits **at most 5 seconds**, then gives up with code **`504`**. This "wait with a time limit" pattern is made from two things you already know: a Promise (Module 4 Concept 12) and the `setTimeout` timer. The promise is kept by whichever comes first: the `ack` or `setTimeout`.

**Why must the command `id` be unique, even after the server restarts?** Node 1 remembers its last eight `id`s and **silently ignores** an `id` it has already carried out (contract rule 8), so that a command delivered twice because of QoS 1 isn't carried out twice. The author of this module tripped over this: a sequentially numbered `id` such as `c-20261019-0001` started again from `0001` every time the server restarted. As a result, the first command after a restart used an `id` that Node 1 still remembered. That command was ignored, and the API answered `504` for no clear reason. That's why this backend's command `id` contains **the time it was made** (`041128` = 04:11:28 UTC).

### 10. Git for teams: branches, pull requests, and reviews

Imagine three people writing one report on one sheet of paper at the same time: their writing overlaps, and nobody knows which parts have been checked. Programming teams solve this with three habits:

1. **A branch per feature.** The `main` branch always holds the version that works. Every new feature is built on its own branch, for example `feature/vitals`: a copy you can mess around with without disturbing `main`. In the terminal: `git switch -c feature/vitals`.
2. **Pull request (PR).** Once the feature is finished and its branch has been sent to GitHub, you open a **request to merge** that branch into `main`. The PR page on GitHub shows every change in green and red, and that's where other people read and comment.
3. **Code review with a checklist.** Before the merge, someone checks the changes with the same checklist every time: does it pass `npm run check`? Has it been tried in Bruno? Does it show up in `/docs`? No `.env` or passwords? Are the commit messages clear? In a personal project, the reviewer is you, and that's still useful: reading your own changes on the PR page often turns up a leftover `console.log` or a typo you missed in the editor.

![Diagram of Git for teams, that is, branches, pull requests, and reviews, from Practice 8: the feature GET /devices/:id/vitals is built on its own branch, checked, then merged into main. Three bands from left to right: on the laptop (VS Code terminal), on GitHub (browser), and on the laptop again (VS Code terminal). The main line runs horizontally with the commit labeled template for pull requests; from that commit the green feature/vitals branch rises, holding the commit GET /devices/:id/vitals, crosses into the GitHub band, passes the label pull request #1, then comes back down to main at the merge commit Merge pull request #1; in the right band, main on the laptop moves to that merge commit too. There are seven numbered steps. 1, git switch -c feature/vitals: a new branch from main, and main stays untouched. 2, write the feature, then test it yourself with npm run check, send from Bruno, and look at /docs, then git add . and git commit. 3, git push -u origin feature/vitals: the branch goes to GitHub, and -u remembers the laptop and GitHub branch pair. 4, Pull request #1 with base main and compare feature/vitals, plus a checklist that's still empty: npm run check passes, tried in Bruno and the tests pass, shown in /docs, and no .env or passwords. 5, Review, check then tick the checklist: the Files changed tab, a comment on one line, then Review changes, Comment, and Submit review. 6, Merge with the option Create a merge commit, then Merge pull request, Confirm merge, and Delete branch. 7, back to main with git switch main, git pull --prune, and git branch -d feature/vitals, so main on the laptop gets the merge commit from GitHub and the feature branch is deleted; the proof shows in the history of git log --oneline --graph.](assets/git-branch-pr.png)

These habits are used in every module from here on. A Git history full of tidy PRs with checklists is also the first thing recruiters look at on your GitHub profile.

> ➡️ **Time to practice!** Concept 9 is enough for [Practice 6 — Commands through the API](#practice-6--commands-through-the-api-cmd-and-ack-40-minutes) and [Practice 7 — A ten-device simulator](#practice-7--a-ten-device-simulator-25-minutes); Concept 10 for [Practice 8 — Git for teams](#practice-8--git-for-teams-branches-pull-requests-and-reviews-45-minutes).

## 🔧 Step-by-step practice

This week's eight practices build backend v0.1 little by little, in the `backend` folder created in the Quick Win. Every practice ends with a commit. If your code doesn't work and you want to compare, the state of the code at the end of Practices 2 to 6 is in this module's [`code/stages/`](code/stages/) folder, and its final state is in [`code/backend/`](code/backend/).

### Practice 1 — Git in the terminal: the backend's first commit (30 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Git** (installed in 1.1), **GitHub CLI** (macOS only, 1.3), a browser that's signed in to your GitHub account, and the `mini-smart-home` repository. Concepts used: 3.

#### 1.1 Install Git

GitHub Desktop brings its own `git`, but that `git` can't be called from the terminal. That's why you install Git, just once.

<details>
<summary><b>Windows</b>: Git for Windows 2.56.0</summary>

1. Open **https://git-scm.com/install/windows**, then click the **Click here to download** link at the top (or **Git for Windows/x64 Setup** below it). What gets downloaded is `Git-2.56.0.2-64-bit.exe`, about 64 MB. Windows laptops with an ARM chip use **Git for Windows/ARM64 Setup**.
2. Run the installer. You can get through almost every screen with **Next**; change only **two** options:
   - On the **Choosing the default editor used by Git** screen, change **Use Vim (the ubiquitous text editor) as Git's default editor** to **Use Visual Studio Code as Git's default editor**. Vim is a terminal editor that confuses beginners, while you already know VS Code.
   - On the **Adjusting the name of the initial branch in new repositories** screen, choose **Override the default branch name for new repositories**. The box below it already holds `main`; leave it.
3. Leave the other screens at their defaults, especially **Adjusting your PATH environment** (**Git from the command line and also from 3rd-party software**, so that `git` can be called from the VS Code terminal) and **Choose a credential helper** (**Git Credential Manager**, which will take care of signing in to GitHub later). On the last screen, click **Install**, wait, then **Finish**.
4. **Close every VS Code window**, then open it again. A terminal that was already open before Git was installed doesn't know the `git` command yet.

</details>

<details>
<summary><b>macOS</b>: Git from the Command Line Tools</summary>

1. Open the VS Code terminal, then type `git --version`.
2. If macOS shows a dialog offering to install the command line developer tools, click **Install**, accept the license (**Agree**), then wait. The download is about 0.5–1 GB, so allow 5–20 minutes. When it's done, click **Done**. If no dialog appears and a Git version is printed right away, these tools were already installed.

</details>

Then, in the VS Code terminal (on Windows and macOS alike), check:

```text
git --version
```

**Expected output:** `git version 2.56.0.windows.2` (Windows) or `git version 2.50.1 (Apple Git-…)` (macOS; the numbers may be slightly different). If Windows answers with a message that contains `The term 'git' is not recognized`, VS Code hasn't been closed and reopened after the installation (step 4 above).

#### 1.2 Who is the author of your commits?

Every commit records its author's name and email. In Module 3, GitHub Desktop already filled them in (the **Configure Git** screen), and `git` in the terminal reads the same record. Check:

```text
git config --global user.name
git config --global user.email
```

If both print a name and an address (usually an address ending in `@users.noreply.github.com`), continue to 1.3. If they're empty, fill them in with your name and your GitHub noreply address (find it on GitHub through your profile picture → **Settings** → **Emails**, in the **Keep my email addresses private** section):

```text
git config --global user.name "Your Name"
git config --global user.email "12345678+YOUR-USERNAME@users.noreply.github.com"
```

The noreply address keeps your personal email from spreading through the history of a public repository.

#### 1.3 Sign in to GitHub from the terminal

The account that's signed in to GitHub Desktop can't be used by `git` in the terminal, so your first push from the terminal will ask you to sign in once.

- **Windows:** you don't need to install anything else. The Git Credential Manager that was installed along with Git will pop up a **Connect to GitHub** window on the first push in 1.5.
- **macOS:** install **GitHub CLI**, then sign in once:
  1. Download **`gh_2.102.0_macOS_universal.pkg`** (about 28 MB) from **https://github.com/cli/cli/releases/tag/v2.102.0** (the **Assets** section), then open it and install it like any other app.
  2. Close and reopen the VS Code terminal, then run `gh auth login`. Answer its four questions with the arrow keys and **Enter**: **GitHub.com**, **HTTPS**, **Y** (for the question `Authenticate Git with your GitHub credentials?`), and **Login with a web browser**.
  3. The terminal prints a one-time code, for example `! First copy your one-time code: ABCD-1234`. Copy the code, press **Enter** to open the browser, paste the code, then approve. At the end, the terminal prints `✓ Logged in as YOUR-USERNAME`.

#### 1.4 `.gitignore` before the first commit

The `node_modules` folder from the Quick Win holds 48 libraries and must not go to GitHub. In VS Code, click the **`backend`** folder, then create a new file **`.gitignore`** (starting with a dot) that contains:

```text
# libraries from npm: big, and npm install can rebuild them
node_modules/
```

Practice 2 adds one more rule (for `.env`) to this file.

#### 1.5 Commit and push from the terminal

A newly opened VS Code terminal starts in the `mini-smart-home` folder. If you're using the old terminal from the Quick Win, check with `pwd` first: if the path ends in `backend`, go up first with `cd ..`. Without that, `git status` only writes `./`, and `git add backend` refuses with `fatal: pathspec 'backend' did not match any files`. Type these one at a time, and read the output of each command:

```text
git status
```

**Expected output:**

```text
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        backend/

nothing added to commit but untracked files present (use "git add" to track)
```

`Untracked files` means new files that have never been committed. Git sums up a new folder as one line, `backend/`; its contents only show up one by one when you commit. macOS users may also see `.DS_Store`, the Finder bookkeeping file you always skipped in GitHub Desktop (Module 3): just leave it, because the next commands only add `backend`. Put it in the basket, then take the snapshot:

```text
git add backend
git commit -m "Backend: first server with GET /health (Module 16 Quick Win)"
```

**Expected output** (the code `1a2b3c4` and the number of lines on your screen may be different):

```text
[main 1a2b3c4] Backend: first server with GET /health (Module 16 Quick Win)
 4 files changed, 668 insertions(+)
 create mode 100644 backend/.gitignore
 create mode 100644 backend/package-lock.json
 create mode 100644 backend/package.json
 create mode 100644 backend/src/server.ts
```

Only four files go in, without a single item from `node_modules`: that's `.gitignore` at work. `package-lock.json` (created by npm) records the exact version of every library so that another laptop installs exactly the same versions; this file is meant to be committed. On Windows, the warning `LF will be replaced by CRLF` may appear: it's only a notice about line endings and is safe to ignore. Now send it to GitHub:

```text
git push
```

- **Windows, first push:** the **Connect to GitHub** window appears. Click **Sign in with your browser**, approve in the browser, then go back to the terminal: the push continues by itself. After that, you don't need to sign in again.
- **macOS:** the push runs right away, because you already signed in with `gh auth login`.

**Expected output** ends with lines like these:

```text
To https://github.com/YOUR-USERNAME/mini-smart-home.git
   9f8e7d6..1a2b3c4  main -> main
```

Open the `mini-smart-home` repository on GitHub: the `backend` folder is already there. Open GitHub Desktop too: the **History** tab shows the commit you just made from the terminal, because both read the same repository folder.

Finally, look at the history from the terminal:

```text
git log --oneline
```

One line per commit, the newest on top. Press **q** if the list is long and the terminal is waiting.

> **If the push is rejected** with a message starting with `! [rejected]` and the hint `hint: Updates were rejected because the remote contains work …`, GitHub has commits that aren't on your laptop yet (for example, you once changed a file directly on github.com). Run `git pull --no-rebase --no-edit`, then `git push` again. `--no-rebase` tells Git to merge the commits from GitHub with your commits. Without this option, Git on macOS stops with `fatal: Need to specify how to reconcile divergent branches.` without merging anything. `--no-edit` keeps Git from opening an editor for the merge message (on Windows, that editor is a `MERGE_MSG` tab in VS Code, and the terminal waits until that tab is closed).

> ⬆️ **Done with Practice 1?** Go back to [Concept 4](#4-light-typescript-type-labels-checked-before-the-program-runs) (the ➡️ at the end of Concept 5 will take you to Practice 2).

### Practice 2 — Project structure, light TypeScript, and `.env` (35 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal (the `backend` folder), **Node.js 24**, a **browser**, and `git` in the terminal (Practice 1). No hardware is used yet. Concepts used: 4–5.

In this practice, the ten-line `server.ts` from the Quick Win is tidied up into the skeleton of a real backend: folders with clear jobs, a TypeScript checker, logs that are pleasant to read, and settings in `.env` (Concepts 4–5). The API itself doesn't grow yet; what changes is its "house".

#### 2.1 Install the development tools

In the VS Code terminal, make sure you're in the `backend` folder (`pwd` must end in `backend`; if you're still in `mini-smart-home` from Practice 1, type `cd backend` first), then run:

```text
npm install --save-dev typescript@7.0.2 @types/node@24 pino-pretty@13.2.0
```

`--save-dev` marks all three as **development tools** (*devDependencies*): helpers while the backend is being developed on the laptop, not a core part of the program. The first two are only used for checking types, while pino-pretty is loaded by the server every time it starts, just to tidy up how the logs look.

- **typescript**: the type checker for `npm run check`.
- **@types/node**: a type "dictionary" for the built-in features of Node.js 24, for example `process.env`.
- **pino-pretty**: a log formatter, so that Fastify's JSON logs show up as one colored line per event.

**Expected output** (the numbers may be slightly different):

```text
added 18 packages, and audited 67 packages in 4s

21 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 2.2 Tidy up `package.json`

Open `package.json` (in the `backend` folder), then make its contents match this. What changes: `"name"`, `"version"`, and `"description"` are filled in, the `"main"` line is replaced with `"private": true`, the `"scripts"` section is replaced, and the `"keywords"`, `"author"`, and `"license"` lines are deleted. The `"type": "module"` line has been there since the Quick Win; make sure there's only one `"type"` line, wherever it is. The `"dependencies"` and `"devDependencies"` lists were already filled in by npm, so leave them as they are in yours.

```json
{
  "name": "mini-smart-home-backend",
  "version": "0.1.0",
  "description": "Mini Smart Home backend (Module 16): listens to MQTT, checks the data contract, and provides an API",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.ts",
    "start": "node --env-file=.env src/server.ts",
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "fastify": "^5.12.7"
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "pino-pretty": "^13.2.0",
    "typescript": "^7.0.2"
  }
}
```

- **`"private": true`** prevents this project from being published to npm by accident.
- The **`"scripts"`** section gives short names to long commands. From now on, just type **`npm run dev`** (the server with automatic restarts, reading `.env`), **`npm start`** (the server without automatic restarts), or **`npm run check`** (the TypeScript type check).
- Remember the JSON rule from Module 4: there must be no comma after the last line inside curly braces.

#### 2.3 The TypeScript checker: `tsconfig.json`

In the Explorer, click `package.json` (in the `backend` folder) so that the new file goes into that folder too, then create a new file **`tsconfig.json`** (next to `package.json`, not at the root of `mini-smart-home`):

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

This file is read by VS Code and `npm run check`, not by Node.js. What's important to understand:

- **`"strict": true`**: check strictly (for example, a value that might be empty must be checked before it's used).
- **`"noEmit": true`**: only check, don't create new JavaScript files. Node.js 24 already runs `.ts` directly.
- **`allowImportingTsExtensions`**, **`erasableSyntaxOnly`**, and **`verbatimModuleSyntax`**: three rules that are the same as Node.js 24's rules in Concept 4 (imports ending in `.ts`, only syntax that can be removed, `import type` for types). The checker complains right away if you break them, before Node.js gets a chance to refuse.
- **`"include": ["src"]`**: only the contents of the `src` folder are checked.

#### 2.4 Settings in `.env`

1. Create a file **`.env.example`** in the `backend` folder:

   ```text
   # Copy this file to .env, then adjust its contents. The .env file doesn't go into Git (see .gitignore).
   MQTT_URL=mqtt://192.168.1.37:1883
   PORT=8080
   HOST=127.0.0.1
   ```

2. Create a second file, **`.env`**, with the same contents, then replace `192.168.1.37` with your own broker's address: the Pi's address from Module 12, or your laptop broker's address if you're on the laptop path. The line that starts with `#` is a comment, and you can delete it from `.env`.
3. Open `.gitignore` (created in Practice 1), then add two lines at the bottom so that it becomes:

   ```text
   # libraries from npm: big, and npm install can rebuild them
   node_modules/
   # this laptop's secret settings; the example is in .env.example
   .env
   ```

4. Check with `git status`. The `Untracked files` section must list `.env.example` (along with `tsconfig.json`), but **not** `.env`. If `.env` shows up too, the spelling in `.gitignore` is wrong (it must be exactly `.env`, starting with a dot).

The broker's address isn't used in this practice yet (the backend only starts listening to the broker in Practice 3), but its setting is prepared now so that the next code can check it.

#### 2.5 The `src` folder and the first three files

Create two new folders inside `src`: **`config`** and **`routes`**. Then create the following three files. Type their contents, don't copy and paste: typing makes you pay attention to every line.

**`src/config/env.ts`** reads the settings from `.env` and stops with a clear message if a required setting is empty:

```ts
// env.ts - the server settings from the .env file (read by Node.js through --env-file), checked once at startup.

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    console.error(`Setting ${name} is empty. Copy .env.example to .env, fill in ${name}, then run again.`);
    process.exit(1); // stop here: without this setting the server can't work
  }
  return value;
}

export const env = {
  MQTT_URL: required("MQTT_URL"), // the broker's address, for example mqtt://192.168.1.37:1883
  PORT: Number(process.env.PORT || 8080), // the server's counter (port) number
  HOST: process.env.HOST || "127.0.0.1", // 127.0.0.1 = only reachable from this laptop
};
```

- `function required(name: string): string` is your first light TypeScript: the parameter `name` must be text, and the function returns text.
- `||` means "if the left side is empty, use the right side": without a `PORT` line in `.env`, or with a `PORT=` line that hasn't been filled in, the server uses `8080`. The same goes for `HOST`: if it's empty, the server still listens only on `127.0.0.1`.
- `Number(...)` turns the text `"8080"` from `.env` into the number `8080`. Everything in `.env` arrives as text.

**`src/routes/health.ts`** moves the `/health` route from the Quick Win into its own route file. Fastify calls a file like this a **plugin**: a function that receives `app`, then registers its routes.

```ts
// health.ts - GET /health: is the server alive?
import type { FastifyPluginAsync } from "fastify";

interface Answer {
  ok: boolean;
  message: string;
}

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    const answer: Answer = { ok: true, message: "Mini Smart Home backend is alive" };
    return answer;
  });
};
```

`import type` is used because `FastifyPluginAsync` is only a type label, not code that runs (Concept 4).

**`src/server.ts`**: replace all of its contents with this version.

```ts
// server.ts - the entry point of the Mini Smart Home backend v0.1 (Module 16).
// Run: npm run dev (restarts automatically when a file is saved) or npm start.
import Fastify, { LogController } from "fastify";
import { env } from "./config/env.ts";
import { healthRoutes } from "./routes/health.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // the built-in log per request is too long...
});
app.addHook("onResponse", async (req, reply) => {
  // ...so it's replaced by one line per request. A hook like this is called middleware.
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});

await app.register(healthRoutes);
await app.listen({ port: env.PORT, host: env.HOST });
```

Three new things here:

- **Logs that are pleasant to read.** `transport: { target: "pino-pretty", … }` sends Fastify's JSON logs to the formatter: the local time (`translateTime`), without the process number, the laptop's name, and the request number (`ignore`).
- **Middleware.** `app.addHook("onResponse", …)` installs a function that Fastify runs **after every answer is sent**, whatever the route. A function like this, which steps into the journey of every request, is called **middleware** (in Fastify it's called a **hook**). Here it prints one short line for every request, instead of Fastify's two long built-in logs, which `LogController` turns off. Later, the same kind of hook is used to check the password on every request (Module 20).
- **`app.register(healthRoutes)`** installs the route plugin. Every new route file will be installed later with one `register` line like this.

#### 2.6 Run it with `npm run dev`

Stop the old server if it's still running (**Ctrl + C**), then run:

```text
npm run dev
```

**Expected output:**

```text
> mini-smart-home-backend@0.1.0 dev
> node --watch --env-file=.env src/server.ts

[12:59:20] INFO: Server listening at http://127.0.0.1:8080
```

Open `http://127.0.0.1:8080/health` in the browser. The answer is the same as in the Quick Win, but now the terminal logs every guest in one line: `[12:59:23] INFO: GET /health -> 200 (4 ms)`. Also try an address that doesn't exist, for example `http://127.0.0.1:8080/what`. The browser shows `{"message":"Route GET:/what not found","error":"Not Found","statusCode":404}`, and the terminal logs `GET /what -> 404 (0 ms)`. The `GET /favicon.ico -> 404` line that sometimes appears too comes from the browser looking for a tab icon (Quick Win step 4); just ignore it.

Leave `npm run dev` running in this terminal. For other commands, open a second terminal with the **+** icon in the terminal panel. A new terminal always starts in the `mini-smart-home` folder, so type `cd backend` there first. From now on, "the first terminal" means the terminal where `npm run dev` runs, and "the second terminal" means the terminal for other commands, both in the `backend` folder.

#### 2.7 A deliberate mistake: who catches it?

In `health.ts`, change the line `const answer: Answer = …` to this (notice the typo `mesage`):

```ts
    const answer: Answer = { ok: true, mesage: "Mini Smart Home backend is alive" };
```

Save, then watch three places:

1. **VS Code** immediately underlines `mesage` with a red squiggly line. Hover the mouse over that line: VS Code explains that `mesage` doesn't exist in `Answer`, and suggests `message`.
2. **The server** in the first terminal, on the other hand, **calmly restarts as usual**, and the reloaded browser shows `{"ok":true,"mesage":"Mini Smart Home backend is alive"}`. Node.js only removes the type labels; it doesn't check them (Concept 4).
3. In the second terminal, run the checker:

   ```text
   npm run check
   ```

   **Expected output:**

   ```text
   > mini-smart-home-backend@0.1.0 check
   > tsc --noEmit

   src/routes/health.ts:11:40 - error TS2561: Object literal may only specify known properties, but 'mesage' does not exist in type 'Answer'. Did you mean to write 'message'?

   11     const answer: Answer = { ok: true, mesage: "Mini Smart Home backend is alive" };
                                             ~~~~~~


   Found 1 error in src/routes/health.ts:11
   ```

   `11:40` means line 11, character 40 (the spaces at the start of the line count too). Below it, the checker quotes that line and marks the wrong part with `~~~~~~`, then closes with the summary `Found 1 error`. If VS Code indents your code with 4 spaces (its default), while this module's code uses 2 spaces, the number after the colon is slightly different, for example `11:44`; what matters is that the file name and the message are the same.

Change `mesage` back to `message`, save, then run `npm run check` once more. This time it only prints the two `>` lines, without an error message: that means it passed. Make a habit of running `npm run check` before every commit; Practice 8 makes it the first item of the pull request checklist.

#### 2.8 Commit from the terminal

In the second terminal (the `backend` folder):

```text
git add .
git status
git commit -m "Backend: src structure, TypeScript, and .env (Module 16 Practice 2)"
git push
```

`git add .` puts every change in this folder into the basket (the dot = "this folder"). A `git status` between `git add` and `git commit` is a good habit: before you commit, make sure `.env` is **not** in the green list. If it is, take it out with `git restore --staged .env`, then check your `.gitignore` again. macOS users: if `.DS_Store` also ended up in the green list, take it out too with `git restore --staged .DS_Store`, then add a `.DS_Store` line to `.gitignore` so it doesn't get carried along again. Save `.gitignore`, then add its change with `git add .gitignore` before `git commit`.

> ⬆️ **Done with Practice 2?** Go back to [Concept 6](#6-the-backend-as-an-mqtt-client-one-ear-for-every-topic) (the ➡️ at the end of Concept 7 will take you to Practice 3).

### Practice 3 — The backend listens to the broker (35 minutes)

> 🖥️ **Tools used:** **VS Code** (two terminals in the `backend` folder), a **browser**, **MQTTX** (the **Pi gateway** connection from Module 12), and Node 1 and Node 2 switched on as usual (or the Practice 7 simulator). Concepts used: 6.

Now the backend gets an "ear": an MQTT connection that listens to every `msh/#` topic on the broker, then keeps the last state of every device in memory. In this practice, the messages aren't checked at all yet. That's on purpose: in the last step you'll see for yourself why that's dangerous.

#### 3.1 Install mqtt.js

In the second terminal (the `backend` folder):

```text
npm install mqtt@5.16.1
```

This is the same library that the contract checker in the `tools` folder has used since Module 11. **Expected output** starts with `added 38 packages`.

#### 3.2 "Memory": `src/services/store.ts`

Create a **`services`** folder inside `src`, then create a file **`store.ts`** in it:

```ts
// store.ts - keeps the last state of every device in memory.
// The data is lost when the server stops; Module 17 replaces this with a database.

export interface Device {
  device_id: string;
  status: string;
  last_seen: string; // server time (UTC) when this device's last message arrived
  telemetry: unknown; // not checked at all yet (Practice 4 adds the checks)
  vitals: unknown;
}

const devices = new Map<string, Device>();
export const counts = { received: 0, rejected: 0 };

function getOrCreate(deviceId: string): Device {
  let d = devices.get(deviceId);
  if (d === undefined) {
    d = { device_id: deviceId, status: "unknown", last_seen: "", telemetry: null, vitals: null };
    devices.set(deviceId, d);
  }
  d.last_seen = new Date().toISOString();
  return d;
}

export function saveTelemetry(deviceId: string, content: unknown): void {
  getOrCreate(deviceId).telemetry = content;
}

export function saveStatus(deviceId: string, status: string): void {
  getOrCreate(deviceId).status = status;
}

export function saveVitals(deviceId: string, content: unknown): void {
  getOrCreate(deviceId).vitals = content;
}

export function allDevices(): Device[] {
  return [...devices.values()];
}

export function findDevice(deviceId: string): Device | undefined {
  return devices.get(deviceId);
}
```

- **`Map`** is a "labeled cabinet": every drawer is labeled with a `device_id` and holds a `Device` object. `devices.get(id)` opens a drawer, `devices.set(id, content)` fills it. The difference from an ordinary object: a `Map` is made for collections whose contents grow and shrink while the program runs.
- **`getOrCreate()`** opens that device's drawer, or makes a new drawer if the device is heard for the first time, then records the time its message arrived.
- **`unknown`** is the TypeScript label for "its content isn't known yet". TypeScript doesn't let us read a field from an `unknown` value (for example `telemetry.temperature`) before its content has been checked. That's an honest reminder: the device's data hasn't been proven correct yet.
- `allDevices()` returns the cabinet's contents as an ordinary array: `[...devices.values()]` pours the contents of every drawer into one list.

#### 3.3 "The ear": `src/services/mqtt.ts`

Create a file **`mqtt.ts`** in the `services` folder:

```ts
// mqtt.ts - the backend as an MQTT client: listens to msh/# and stores every message.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import { counts, saveStatus, saveTelemetry, saveVitals } from "./store.ts";

let client: mqtt.MqttClient | undefined;

export function startMqtt(url: string, log: FastifyBaseLogger): void {
  const clientName = "backend-" + Math.random().toString(16).slice(2, 8); // a unique name, not a device_id
  client = mqtt.connect(url, { clientId: clientName, reconnectPeriod: 5000 });
  client.on("connect", () => {
    log.info(`connected to broker ${url}`);
    client?.subscribe("msh/#", { qos: 1 });
  });
  client.on("reconnect", () => log.warn("broker not reachable yet, retrying in 5 seconds"));
  client.on("error", (error) => log.error(`MQTT error: ${error.message}`));
  client.on("message", (topic, content) => receive(topic, content.toString(), log));
}

export function brokerConnected(): boolean {
  return client?.connected ?? false;
}

function receive(topic: string, text: string, log: FastifyBaseLogger): void {
  const parts = topic.split("/"); // ["msh", device_id, kind]
  if (parts.length !== 3) return;
  const [, deviceId, kind] = parts;
  if (kind === "status") {
    saveStatus(deviceId, text);
  } else if (kind === "telemetry" || kind === "vitals") {
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      log.warn(`${topic}: the content isn't JSON`);
      return;
    }
    if (kind === "telemetry") saveTelemetry(deviceId, json);
    else saveVitals(deviceId, json);
  } else {
    return; // cmd and ack come in Practice 6
  }
  counts.received++;
  log.info(`${topic} ${text}`); // show every message (Practice 4 replaces this with checks)
}
```

Read it from top to bottom:

- **`mqtt.connect(url, …)`** opens a connection to the broker, like the **Connect** button in MQTTX. If the broker can't be reached yet (the Pi is off, a wrong address), mqtt.js **tries again by itself** every 5 seconds (`reconnectPeriod: 5000`), so the backend doesn't need to be restarted.
- **`client.on("connect", …)`**, **`client.on("message", …)`**, and their friends register functions that are called when that **event** happens: connected, trying again, an error, a message arrives. This is the same pattern as the ESP-NOW callbacks in Module 14: we don't wait for messages; the messages "wake up" our function.
- **`subscribe("msh/#", { qos: 1 })`** subscribes to every Mini Smart Home topic at once (Concept 6).
- **`receive()`** splits the topic at the `/` signs. The line `const [, deviceId, kind] = parts;` takes the second and third items of the array (the comma at the front means "skip the first item, `msh`"). A status is stored as text; `telemetry` and `vitals` are first turned from JSON text into objects. A message that isn't JSON is logged as a warning (`log.warn`) and thrown away.
- `content.toString()`: mqtt.js hands over the message's content as a sequence of bytes (a Buffer), so it's turned into text first.

#### 3.4 The `GET /devices` route and a more honest `/health`

Create the file **`src/routes/devices.ts`**:

```ts
// devices.ts - the /devices routes: the list of devices ever heard.
import type { FastifyPluginAsync } from "fastify";
import { allDevices } from "../services/store.ts";

export const deviceRoutes: FastifyPluginAsync = async (app) => {
  app.get("/devices", async () => {
    return allDevices().map((d) => ({
      device_id: d.device_id,
      status: d.status,
      last_seen: d.last_seen,
    }));
  });
};
```

`map` from step 2 of the warm-up: every device is summarized into three fields, without the long `telemetry` content.

Then replace all of **`src/routes/health.ts`** so that `/health` also reports whether the backend is connected to the broker and how many messages it has received:

```ts
// health.ts - GET /health: is the server alive and connected to the broker?
import type { FastifyPluginAsync } from "fastify";
import { counts } from "../services/store.ts";
import { brokerConnected } from "../services/mqtt.ts";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return { ok: true, broker: brokerConnected(), received: counts.received, rejected: counts.rejected };
  });
};
```

#### 3.5 Wire everything up in `server.ts`

In **`src/server.ts`**, add two import lines below the line `import { healthRoutes } …`:

```ts
import { deviceRoutes } from "./routes/devices.ts";
import { startMqtt } from "./services/mqtt.ts";
```

then replace the last two lines of that file with:

```ts
await app.register(healthRoutes);
await app.register(deviceRoutes);

startMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
```

`app.log` is Fastify's logger, lent to the MQTT ear so that its logs look the same. Save. `npm run dev` in the first terminal restarts the server.

#### 3.6 Listen

Make sure Node 1 and the Pi gateway are on (simulator path: the simulator from 7.2 keeps running in the third terminal, so your log shows ten `f00d…` devices, not Node 1 and Node 2 as below). **Expected output** in the first terminal (the author's lab recording; the times and numbers on your screen will be different):

```text
[13:18:04] INFO: Server listening at http://127.0.0.1:8080
[13:18:04] INFO: connected to broker mqtt://192.168.1.37:1883
[13:18:04] INFO: msh/a4cf12e5b7c0/status online
[13:18:04] INFO: msh/246f28b1c7d4/status online
[13:18:09] INFO: msh/a4cf12e5b7c0/telemetry {"ts":"2026-10-19T06:18:09Z","fw":"1.4.0","temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}
```

- The two `status` lines appear **instantly**, before the devices send anything: those are retained messages (Module 11) that the broker keeps and hands straight to a new subscriber. A backend that has just started knows right away who is `online`.
- Node 1's `telemetry` comes every 10 seconds. Node 2's `telemetry` (`msh/246f28b1c7d4/telemetry`, which contains `pressure`) only comes once every 5 minutes, when Node 2 wakes up.

Open `http://127.0.0.1:8080/devices` in the browser:

```json
[{"device_id":"a4cf12e5b7c0","status":"online","last_seen":"2026-10-19T06:18:09.183Z"},{"device_id":"246f28b1c7d4","status":"online","last_seen":"2026-10-19T06:18:04.627Z"}]
```

That's your first API answering with real data. Also open `http://127.0.0.1:8080/health`: `"broker":true` and a `received` number that keeps growing.

The `last_seen` time is written in UTC (the letter `Z` at the end), seven hours behind WIB: `06:18` UTC = `13:18` WIB. The backend always stores times in UTC, just like `ts` in the data contract; turning them into local time is the display's job (the dashboard, Module 22).

#### 3.7 See the problem: the backend believes anything

In **MQTTX**, open the **Pi gateway** connection. In the send box at the bottom, make sure the **Retain** box is **not** ticked (a broken retained message would be handed to the backend again every time the server restarts), choose the **JSON** format, fill in the **Topic** field with `msh/a4cf12e5b7c0/telemetry` (use your Node 1's `device_id`), then send this content with the send button (the paper plane icon):

```json
{"temperature":"hot","humidity":255}
```

Look at the first terminal: that message is logged like any other, and the `received` number in `/health` goes up by one. The backend has just **stored** a Node 1 "reading" without a `ts`, with a temperature that's a word and a humidity of 255%. If the dashboard in Module 22 showed this latest reading, its temperature needle would break. If there were a rule "turn the fan on when the temperature is above 30", that rule would be confused comparing `"hot"` with `30`. A correct message from Node 1 will overwrite it 10 seconds later, but a device that's really broken would keep sending broken messages. Practice 4 puts the guard in place.

> **Save first:** `git add .`, then `git commit -m "Backend listens to msh/# and GET /devices (Module 16 Practice 3)"` and `git push` in the second terminal.
>
> ➡️ **Continue** to [Practice 4 — Never trust the device](#practice-4--never-trust-the-device-the-data-contract-with-zod-40-minutes) without going back to the concepts.

### Practice 4 — Never trust the device: the data contract with Zod (40 minutes)

> 🖥️ **Tools used:** **VS Code** (two terminals in the `backend` folder), a **browser**, **MQTTX** (the **Pi gateway** connection), `DATA-CONTRACT.md` (version 1.2, in the `mini-smart-home` repository), and Node 1 and Node 2 switched on (or the Practice 7 simulator). Concepts used: 7.

In this practice, data contract version 1.2 is rewritten as Zod schemas, then installed as the guard of the MQTT door. After that, the broken message from Practice 3.7 is rejected with a clear reason.

#### 4.1 Install Zod

In the second terminal (the `backend` folder):

```text
npm install zod@4.6.7
```

#### 4.2 A contract that runs: `src/schemas/contract.ts`

Click `DATA-CONTRACT.md` in the Explorer (at the root of `mini-smart-home`) to open it in a tab, then right-click its tab → **Split Right**. The contract is now open next to the editor, so you can match every line of the schema with the contract's tables. Create a **`schemas`** folder inside `src`, then create a file **`contract.ts`**:

```ts
// contract.ts - Appendix A (data contract 1.2) as Zod schemas: a contract that runs.
// Every message from a device is checked against these schemas before it is stored ("never trust the device").
import { z } from "zod";

z.config(z.locales.en()); // Zod error messages in English

export const DeviceId = z.string().regex(/^[0-9a-f]{12}$/, "device_id must be 12 lowercase hexadecimal digits");

const Time = z.iso.datetime(); // UTC time, for example 2026-10-19T02:10:05Z
const Version = z.string().regex(/^\d+\.\d+\.\d+$/, "version must look like x.y.z");
const decimal = (min: number, max: number) => z.number().min(min).max(max).nullable();
const integer = (min: number, max: number) => z.number().int().min(min).max(max).nullable();

// Node 1 telemetry (contract 1.0) plus three RS-485 sensor fields that may be missing (contract 1.2)
export const TelemetryNode1 = z.strictObject({
  ts: Time,
  fw: Version,
  temperature: decimal(-40, 80),
  humidity: integer(0, 100),
  light: z.number().int().min(0).max(4095),
  soil: z.number().int().min(0).max(100),
  motion: z.boolean(),
  water_level: integer(0, 100),
  soil_rs485: decimal(0, 100).optional(),
  soil_temperature: decimal(-55, 125).optional(),
  ec: integer(0, 20000).optional(),
});

// Node 2 telemetry (contract 1.1), published by Node 1 on behalf of Node 2; recognized by the pressure field
export const TelemetryNode2 = z.strictObject({
  ts: Time,
  fw: Version,
  temperature: decimal(-40, 80),
  humidity: integer(0, 100),
  pressure: decimal(300, 1100),
  soil_temperature: decimal(-55, 125),
  soil: integer(0, 100),
  battery: decimal(2.5, 4.5).optional(),
});

export const Status = z.enum(["online", "offline", "offline-mode"]);

export const Vitals = z.strictObject({
  ts: Time,
  rssi: z.number().int().max(0),
  uptime_s: z.number().int().min(0),
  heap_free: z.number().int().min(0),
});

export const State = z.strictObject({
  fan: z.boolean(),
  lamp: z.boolean(),
  pump: z.boolean(),
  curtain: z.number().int().min(0).max(180),
});

export const Ack = z
  .strictObject({
    id: z.string().min(1).max(39),
    ts: Time.nullable(),
    ok: z.boolean(),
    message: z.string().optional(),
    state: State,
  })
  .refine((a) => a.ok || a.message !== undefined, "message is required when ok is false"); // contract section 8

// the body of POST /devices/:id/command: one actuator and its value (contract section 7)
export const SetCommand = z.discriminatedUnion("target", [
  z.strictObject({ target: z.literal("lamp"), value: z.boolean() }),
  z.strictObject({ target: z.literal("fan"), value: z.boolean() }),
  z.strictObject({ target: z.literal("pump"), value: z.number().int().min(1).max(10) }),
  z.strictObject({ target: z.literal("curtain"), value: z.number().int().min(0).max(180) }),
]);

export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
export type TelemetryNode2 = z.infer<typeof TelemetryNode2>;
export type Status = z.infer<typeof Status>;
export type Vitals = z.infer<typeof Vitals>;
export type Ack = z.infer<typeof Ack>;
export type SetCommand = z.infer<typeof SetCommand>;
```

How to read it, from the top:

- **`z.config(z.locales.en())`** sets Zod's error messages to English ("Too big", "Invalid input"). This one line applies to the whole backend.
- **`DeviceId`**: text that matches the pattern `^[0-9a-f]{12}$`, which means exactly twelve characters, each one `0`–`9` or `a`–`f` (contract section 1). A pattern like this is called a **regular expression**: `^` is the start of the text, `[0-9a-f]` one character from that list, `{12}` exactly twelve times, `$` the end of the text. The second argument is the message that's shown if it doesn't match.
- **`Time`** (`z.iso.datetime()`): a UTC time text in ISO 8601 format, for example `2026-10-19T02:10:05Z`. **`Version`**: three numbers separated by dots, for example `1.4.0`.
- **`decimal(min, max)`** and **`integer(min, max)`** are two small helper functions, so that rules that are used often aren't written again and again. Both accept a number (or an integer, `.int()`) in a given range, **or `null`** (`.nullable()`), because failed readings are written as `null` (contract rule 7).
- **`TelemetryNode1`** holds the eight required fields of contract section 4, exactly with their types and ranges. `light` and `soil` can't be `null`, because the contract writes "—" for both. The three RS-485 fields get **`.optional()`**: they may be missing altogether (Node 1 with `rs485 off`), but if they're there, they must be numbers within their range or `null`. One contract rule isn't checked here yet: the three always come together. A message that carries only `ec` still gets through, while the Module 15 contract checker rejects it; adding that rule with `.refine(…)` can be an exercise.
- **`TelemetryNode2`** follows the Node 2 table of contract version 1.1; `battery` may be missing.
- **`z.strictObject`** rejects fields that are **not** in the contract. This is what catches typos like `temperatuure`. A plain `z.object` would let them through silently.
- **`Status`** (`z.enum`): only three texts are valid.
- **`Ack`** ends with **`.refine(…)`**: an extra rule that can't be written as a field type, namely "if `ok` is `false`, `message` is required" (contract section 8).
- **`SetCommand`** (`z.discriminatedUnion`) is the rule for the body of a command: if `target` is `"lamp"` or `"fan"`, `value` must be `true`/`false`; if `"pump"`, an integer from 1–10; if `"curtain"`, 0–180. This schema is only used in Practice 6.
- The **`export type … = z.infer<typeof …>`** lines at the bottom create **TypeScript type labels from the same schemas**. The rules are written once, then used by Zod to check messages while the program runs **and** by VS Code while you type (Concept 7). A type may have the same name as its schema: TypeScript knows when the schema (a value) is meant and when the type (a label) is.

#### 4.3 A store that knows its contents better

Replace all of **`src/services/store.ts`**:

```ts
// store.ts - keeps the last state of every device in memory.
// The data is lost when the server stops; Module 17 replaces this with a database.
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

export interface Device {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  status: Status | "unknown";
  last_seen: string; // server time (UTC) when this device's last message arrived
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
}

const devices = new Map<string, Device>();
export const counts = { received: 0, rejected: 0 };

function getOrCreate(deviceId: string): Device {
  let d = devices.get(deviceId);
  if (d === undefined) {
    d = { device_id: deviceId, kind: "unknown", status: "unknown", last_seen: "", telemetry: null, vitals: null };
    devices.set(deviceId, d);
  }
  d.last_seen = new Date().toISOString();
  return d;
}

export function saveTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  const d = getOrCreate(deviceId);
  d.kind = "pressure" in content ? "node2" : "node1";
  d.telemetry = content;
}

export function saveStatus(deviceId: string, status: Status): void {
  getOrCreate(deviceId).status = status;
}

export function saveVitals(deviceId: string, content: Vitals): void {
  getOrCreate(deviceId).vitals = content;
}

export function allDevices(): Device[] {
  return [...devices.values()];
}

export function findDevice(deviceId: string): Device | undefined {
  return devices.get(deviceId);
}
```

What changed compared with Practice 3:

- `telemetry` and `vitals` now carry type labels from the contract (`TelemetryNode1 | TelemetryNode2`, `Vitals`), not `unknown`. The **`|`** sign means "one of": Node 1's **or** Node 2's `telemetry`. Because the store only accepts data that has passed the checks, its contents can now be trusted.
- A new field, **`kind`**: `saveTelemetry()` recognizes Node 2 by the `pressure` field (contract section 10 names `pressure` as Node 2's typical field since version 1.2).

#### 4.4 An ear that checks

Replace all of **`src/services/mqtt.ts`**:

```ts
// mqtt.ts - the backend as an MQTT client: listens to msh/# and checks every message against the data contract.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import { counts, saveStatus, saveTelemetry, saveVitals } from "./store.ts";

let client: mqtt.MqttClient | undefined;

export function startMqtt(url: string, log: FastifyBaseLogger): void {
  const clientName = "backend-" + Math.random().toString(16).slice(2, 8); // a unique name, not a device_id
  client = mqtt.connect(url, { clientId: clientName, reconnectPeriod: 5000 });
  client.on("connect", () => {
    log.info(`connected to broker ${url}`);
    client?.subscribe("msh/#", { qos: 1 });
  });
  client.on("reconnect", () => log.warn("broker not reachable yet, retrying in 5 seconds"));
  client.on("error", (error) => log.error(`MQTT error: ${error.message}`));
  client.on("message", (topic, content) => receive(topic, content.toString(), log));
}

export function brokerConnected(): boolean {
  return client?.connected ?? false;
}

function reject(topic: string, reason: string, log: FastifyBaseLogger): void {
  counts.rejected++;
  log.warn(`REJECTED ${topic}: ${reason}`);
}

// summarize the list of issues from Zod, for example "humidity: Too big: expected number to be <=100"
function summarize(error: ZodError): string {
  return error.issues.map((m) => `${m.path.join(".") || "content"}: ${m.message}`).join("; ");
}

function receive(topic: string, text: string, log: FastifyBaseLogger): void {
  const parts = topic.split("/"); // ["msh", device_id, kind]
  if (parts.length !== 3) return reject(topic, "the topic must look like msh/<device_id>/<kind>", log);
  const [, deviceId, kind] = parts;
  if (!DeviceId.safeParse(deviceId).success) return reject(topic, "invalid device_id", log);
  if (kind === "cmd") return; // a command (from this backend or MQTTX), not device data

  if (kind === "status") {
    if (text === "") return; // an empty message = someone deleting a retained status (Module 11), not a new status
    const result = Status.safeParse(text);
    if (!result.success) return reject(topic, `unknown status "${text}"`, log);
    saveStatus(deviceId, result.data);
    counts.received++;
    return;
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return reject(topic, "the content isn't JSON", log);
  }

  if (kind === "telemetry") {
    const hasPressure = typeof json === "object" && json !== null && "pressure" in json;
    const result = (hasPressure ? TelemetryNode2 : TelemetryNode1).safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    saveTelemetry(deviceId, result.data);
  } else if (kind === "vitals") {
    const result = Vitals.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    saveVitals(deviceId, result.data);
  } else if (kind === "ack") {
    const result = Ack.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    log.info(`ack ${result.data.id} arrived (ok=${result.data.ok})`); // Practice 6 hands it over to the waiting command
  } else {
    return reject(topic, `message kind "${kind}" isn't in the contract`, log);
  }
  counts.received++;
}
```

What changed compared with Practice 3:

- **`reject()`** increases the `rejected` count and logs the reason as a `REJECTED …` warning. A rejected message never reaches the store.
- A status with empty text is ignored without being logged (`if (text === "") return;`). A message like that is how MQTTX and the simulator's `clean` mode (Practice 7) delete a retained message (🚨 "The fake devices `f00d…` still show up"), not a new status.
- **`summarize()`** turns Zod's list of problems into one line, for example `humidity: Too big: expected number to be <=100`. `import type { ZodError }` only borrows its type label.
- **`receive()`** now checks in layers, starting with the cheapest: the shape of the topic, then the `device_id`, then the message kind, then the JSON content against the matching schema. Every check uses **`safeParse()`**, which never stops the program: its result has `success` (`true`/`false`) and, if it succeeded, `data` that already has a type.
- For `telemetry`, the schema is chosen by whether the `pressure` field is there or not: Node 2 is checked with `TelemetryNode2`, everything else with `TelemetryNode1`. The line `typeof json === "object" && json !== null && "pressure" in json` first makes sure that the content really is an object before looking for the field; TypeScript refuses to read a field from `unknown` without this check.
- An `ack` is already checked and logged (`ack … arrived (ok=true)`), but not handed over to anyone yet. Practice 6 finishes that.
- The `INFO` log for every message that passes is removed. From now on, messages that pass are no longer logged one by one: besides the lines when the server starts and connects to the broker, the terminal only writes rejected messages, arriving `ack`s, and one line for every HTTP request (2.6).

#### 4.5 `kind` in `GET /devices`

In **`src/routes/devices.ts`**, add one line, `kind: d.kind,`, below `device_id: d.device_id,` so that the `map` part becomes:

```ts
    return allDevices().map((d) => ({
      device_id: d.device_id,
      kind: d.kind,
      status: d.status,
      last_seen: d.last_seen,
    }));
```

Save all the files, then run `npm run check` in the second terminal: it must pass without errors. The server in the first terminal has already been restarted by `npm run dev`. Open `http://127.0.0.1:8080/devices`: every device now has a `kind` field. Node 1 becomes `"kind":"node1"` as soon as its next `telemetry` arrives, at most 10 seconds after the server restarts. Node 2 stays `"unknown"` until it wakes up and sends `telemetry` (at most 5 minutes), and only then becomes `"kind":"node2"`.

#### 4.6 Test the guard

From **MQTTX** (the **Pi gateway** connection, with the **Retain** box still unticked), send the following messages one at a time. Choose the **JSON** format for JSON messages, and **Plaintext** for text messages. Replace `a4cf12e5b7c0` with your Node 1's `device_id`.

| Topic | Message content | The mistake |
| :--- | :--- | :--- |
| `msh/a4cf12e5b7c0/telemetry` | `{"ts":"2026-10-19T06:30:00Z","fw":"1.4.0","temperature":"hot","humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}` | `temperature` is a word |
| `msh/a4cf12e5b7c0/telemetry` | `{"ts":"2026-10-19T06:30:00Z","fw":"1.4.0","temperature":28.5,"humidity":255,"light":2310,"soil":37,"motion":false,"water_level":64}` | `humidity` outside 0–100 |
| `msh/a4cf12e5b7c0/telemetry` | `{"ts":"2026-10-19T06:30:00Z","fw":"1.4.0","temperatuure":28.5,"temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}` | the mistyped field `temperatuure` |
| `msh/a4cf12e5b7c0/telemetry` | `hello` (Plaintext) | not JSON |
| `msh/a4cf12e5b7c0/status` | `on` (Plaintext) | an unknown status |
| `msh/A4CF12E5B7C0/telemetry` | `{}` | an uppercase `device_id` |
| `msh/a4cf12e5b7c0/temperature` | `28.5` (Plaintext) | a message kind that isn't in the contract |

**Expected output** in the first terminal (the author's lab recording; there, all seven messages were sent by a script within one second, while the times on your screen will be a few seconds apart, depending on how fast you send them):

```text
[13:07:59] WARN: REJECTED msh/a4cf12e5b7c0/telemetry: temperature: Invalid input: expected number, received string
[13:07:59] WARN: REJECTED msh/a4cf12e5b7c0/telemetry: humidity: Too big: expected number to be <=100
[13:08:00] WARN: REJECTED msh/a4cf12e5b7c0/telemetry: content: Unrecognized key: "temperatuure"
[13:08:00] WARN: REJECTED msh/a4cf12e5b7c0/telemetry: the content isn't JSON
[13:08:00] WARN: REJECTED msh/a4cf12e5b7c0/status: unknown status "on"
[13:08:00] WARN: REJECTED msh/A4CF12E5B7C0/telemetry: invalid device_id
[13:08:00] WARN: REJECTED msh/a4cf12e5b7c0/temperature: message kind "temperature" isn't in the contract
```

`content:` on the third line means the problem is in the object as a whole (an unknown field), not in one field. Open `http://127.0.0.1:8080/health`: the `rejected` number is now `7`, and Node 1's latest reading in the store is still its valid one.

**An interesting test:** send the first message again, but replace `"temperature":"hot"` with `"temperature":null`. That message **passes**, because the contract actually tells devices to write `null` when a sensor can't be read. A good guard rejects what's wrong, but accepts honest bad news.

> **Save:** in the second terminal (the `backend` folder), `git add .`, `git commit -m "Data contract 1.2 as Zod schemas, broken messages rejected (Module 16 Practice 4)"`, and `git push`.
>
> ⬆️ **Done with Practice 4?** Go back to [Concept 8](#8-automatic-documentation-openapi-swagger-ui-and-bruno) (the ➡️ at the end of Concept 8 will take you to Practice 5).

### Practice 5 — The latest reading, `/docs`, and Bruno (45 minutes)

> 🖥️ **Tools used:** **VS Code** (two terminals in the `backend` folder), a **browser**, **Bruno 4.2.1** (installed in 5.6), and Node 1 and Node 2 switched on (or the Practice 7 simulator). Concepts used: 8.
>
> ⭐ **Required** — completion requirement: `GET /devices/<id>/latest` in Bruno returns the latest readings as JSON, and `/docs` shows the routes.

In this practice, every route gets a **schema**: the rules for the shape of its requests and its answers. From the same schemas, Fastify builds the documentation at `/docs`. Then you install Bruno and save your API requests in the `backend/bruno` folder.

#### 5.1 Install three documentation libraries

In the second terminal (the `backend` folder):

```text
npm install fastify-type-provider-zod@7.0.0 @fastify/swagger@9.9.2 @fastify/swagger-ui@6.1.2
```

- **fastify-type-provider-zod** teaches Fastify to use Zod schemas to check requests, shape answers, and put type labels on `req.params` and `req.body`.
- **@fastify/swagger** puts together an OpenAPI document from all the routes.
- **@fastify/swagger-ui** shows that document as a web page at `/docs`.

#### 5.2 The complete `server.ts`

Replace the whole content of **`src/server.ts`** with:

```ts
// server.ts - the entry point of the Mini Smart Home backend v0.1 (Module 16).
// Run: npm run dev (automatically restarts when a file is saved) or npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { healthRoutes } from "./routes/health.ts";
import { deviceRoutes } from "./routes/devices.ts";
import { startMqtt } from "./services/mqtt.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // the built-in log per request is too long...
});
app.addHook("onResponse", async (req, reply) => {
  // ...so it's replaced by one line per request (hook = Fastify's "middleware")
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
app.setValidatorCompiler(validatorCompiler); // Zod schemas check the content of requests...
app.setSerializerCompiler(serializerCompiler); // ...and the shape of replies

await app.register(swagger, {
  openapi: { info: { title: "Mini Smart Home API", description: "Backend v0.1 (Module 16)", version: "0.1.0" } },
  transform: jsonSchemaTransform, // the same Zod schemas become the OpenAPI documentation
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(healthRoutes);
await app.register(deviceRoutes);

startMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`API docs: http://${env.HOST}:${env.PORT}/docs`);
```

What's new:

- **`setValidatorCompiler`** and **`setSerializerCompiler`**: every route that has a Zod schema is now checked automatically. A request that doesn't match its schema is refused with code `400` **before** its handler runs, and the answer is shaped to fit its answer schema (fields that aren't listed in the schema aren't sent).
- **`register(swagger, …)`** puts together the OpenAPI document. `openapi.info` is the API's title, description, and version, shown at the top of `/docs`. `transform: jsonSchemaTransform` translates the Zod schemas into OpenAPI's language.
- **`register(swaggerUi, { routePrefix: "/docs" })`** sets up the documentation page. The order matters: both plugins are registered **before** the routes so that every route gets recorded.
- The last line prints the documentation's address when the server is ready.

#### 5.3 `/health` with a schema

Replace the whole content of **`src/routes/health.ts`** with:

```ts
// health.ts - GET /health: is the server alive and connected to the broker?
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { counts } from "../services/store.ts";
import { brokerConnected } from "../services/mqtt.ts";

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      summary: "Server state: alive, connected to the broker, and message counts",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), received: z.number(), rejected: z.number() })
          .describe("the server is alive; broker = connected to the broker or not"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerConnected(), received: counts.received, rejected: counts.rejected };
  });
};
```

There are two differences from Practice 3. The plugin's type is now **`FastifyPluginAsyncZod`**, and the route gets a second object holding a **`schema`**:

- **`tags`** groups the routes in `/docs` (the `server` group).
- **`summary`** is the one-line description next to the route's address.
- **`response`** lists the shape of the answer for each status code. **`.describe("…")`** becomes that status code's description in `/docs`.

#### 5.4 `/devices` with a schema, and the new route `/devices/:id/latest`

Replace the whole content of **`src/routes/devices.ts`** with:

```ts
// devices.ts - the /devices routes: the device list and the latest reading.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { DeviceId, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { findDevice, allDevices } from "../services/store.ts";

const ErrorBody = z.object({ message: z.string() });
const Kind = z.enum(["node1", "node2", "unknown"]);
const IdParam = z.object({ id: DeviceId.describe("the device's device_id, for example a4cf12e5b7c0") });

export const deviceRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["devices"],
      summary: "List every device ever heard",
      response: {
        200: z.array(z.object({
          device_id: z.string(),
          kind: Kind,
          status: z.union([Status, z.literal("unknown")]),
          last_seen: z.string(),
        })).describe("every device recorded in memory"),
      },
    },
  }, async () => {
    return allDevices().map((d) => ({
      device_id: d.device_id,
      kind: d.kind,
      status: d.status,
      last_seen: d.last_seen,
    }));
  });

  app.get("/devices/:id/latest", {
    schema: {
      tags: ["devices"],
      summary: "The latest telemetry reading of one device",
      params: IdParam,
      response: {
        200: z.object({
          device_id: z.string(),
          kind: Kind,
          status: z.union([Status, z.literal("unknown")]),
          telemetry: z.union([TelemetryNode1, TelemetryNode2]),
        }).describe("that device's latest reading"),
        404: ErrorBody.describe("no telemetry from that device yet"),
      },
    },
  }, async (req, reply) => {
    const d = findDevice(req.params.id);
    if (d === undefined || d.telemetry === null) {
      return reply.code(404).send({ message: `no telemetry from ${req.params.id} yet` });
    }
    return { device_id: d.device_id, kind: d.kind, status: d.status, telemetry: d.telemetry };
  });
};
```

- **`ErrorBody`**, **`Kind`**, and **`IdParam`** are small schemas that are used several times. `IdParam` uses `DeviceId` from the contract, so `GET /devices/A4CF/latest` is refused right away with `400` and the message `device_id must be 12 lowercase hexadecimal digits`.
- **`z.union([Status, z.literal("unknown")])`**: a device's status is one of the contract's statuses, or `unknown` (a device that has only been heard through its `telemetry` so far, not yet through its retained status).
- In the **`/devices/:id/latest`** route, `req.params.id` already has the text type and has already passed the `DeviceId` check by the time the handler runs. If the device has never been heard, or has never sent `telemetry`, the handler answers **`404`** with `{"message": …}` through `reply.code(404).send(…)`.
- The `200` answer schema holds **`z.union([TelemetryNode1, TelemetryNode2])`**: the same contract schemas as the MQTT checker of Practice 4 now also document the shape of the API's answer.

Save all the files, then run `npm run check` in the second terminal. It must pass.

#### 5.5 Look at the documentation

In the first terminal, `npm run dev` has already restarted the server, and its log now holds the line `API docs: http://127.0.0.1:8080/docs` (usually followed by `connected to broker …`). Open that address in the browser:

![Trying GET /devices/{id}/latest straight from /docs: three pieces of real Swagger UI screenshots of the Practice 5 stage backend for that route, the latest telemetry reading of one device, with four numbers. Top, before trying: the Parameters section with the Try it out button, number 1. Middle, after Try it out is clicked: the button has become Cancel, the parameter table for id (required, string, path) with the description the device's device_id, for example a4cf12e5b7c0, the id box holding a4cf12e5b7c0, number 2, and the blue Execute button next to Clear, number 3. Bottom, after Execute: Request URL http://127.0.0.1:8080/devices/a4cf12e5b7c0/latest, then Server response, number 4, with Code 200 and a Response body holding device_id a4cf12e5b7c0, kind node1, status online, and telemetry holding ts 2026-10-19T16:15:16Z, fw 1.4.0, temperature 28.5, humidity 71, light 2310, soil 37, motion false, water_level 64. Captions on the right: 1 Try it out opens the input box, and once it's clicked, the button changes to Cancel; 2 fill in the id box with your Node 1's device_id, a4cf12e5b7c0 in the author's lab; 3 Execute sends the GET request to the backend, and the Request URL below it shows the full address that was called; 4 Server response shows code 200 and the response body, the latest telemetry reading of Node 1 that passed the contract check. Note: also try a wrong id, for example A4CF; Swagger UI refuses it before sending. The Practice 5 stage backend only has /health, /devices, and /devices/{id}/latest in /docs; data from the mock Node 1 in the author's lab.](assets/swagger-try-latest.png)

If your Windows or macOS uses a dark theme, the `/docs` page turns dark too; its content is the same, and the light bulb icon at the right end of the top bar switches the theme. Try it straight from this page:

1. Click the **GET `/devices/{id}/latest`** row to open it, then click the **Try it out** button on the right.
2. Fill in the **id** box with your Node 1's `device_id`, then click the blue **Execute** button.
3. Scroll down: the **Server response** section shows code `200` and the content of the answer, Node 1's latest `telemetry` reading. Also try Node 2's `id`: the answer is `404` (`no telemetry from … yet`) until Node 2 wakes up and sends `telemetry` after the server's last restart, within 5 minutes at most. Then fill in a wrong `id`, for example `A4CF`, and click **Execute**. Swagger UI doesn't send it at all, and writes `For 'id': Value must follow pattern ^[0-9a-f]{12}$.` above the **Execute** button. That's the same `DeviceId` rule, this time checked by the browser. The `400` answer from the server only shows up when you open the address directly in a new tab, `http://127.0.0.1:8080/devices/A4CF/latest`: it holds `"message":"params/id device_id must be 12 lowercase hexadecimal digits"`.

The **Example Value** box in the **Responses** list holds an example made automatically from the schema, so its content can look strange (for example, `fw` as a very long string of digits); the real answer is always in **Server response**. At the top of the page, it says `http://127.0.0.1:8080/docs/json`. That's the raw OpenAPI document in JSON: other programs (for example Bruno, or a tool that generates client code) and your friends can read it to get to know your API.

#### 5.6 Install Bruno

1. Open **https://www.usebruno.com/downloads**, or its official releases page at **https://github.com/usebruno/bruno/releases** (this module's version: **v4.2.1**).
   - **Windows:** download the installer **`bruno_4.2.1_x64_win.exe`** (about 116 MB; for Windows laptops with an ARM chip: `bruno_4.2.1_arm64_win.exe`). Run it; on the **Choose Installation Options** screen, choose **Only for me**, then follow the next screens until it's done.
   - **macOS:** download **`bruno_4.2.1_arm64_mac.dmg`** for Macs with an Apple chip (M1 and later), or **`bruno_4.2.1_x64_mac.dmg`** for Intel Macs (you check which one you have the same way as in Module 3 Practice 9.1). Open the `.dmg` file, then drag **Bruno** into the **Applications** folder. If macOS asks whether you're sure you want to open an app downloaded from the internet, click **Open**.
2. Open Bruno. The first time it opens, Bruno shows a **Welcome to Bruno** screen in four steps. Click **Get Started**; choose a theme (**Light**, **Dark**, or **System**), then **Next**; leave the default storage location, then **Next**; on the **Ready to go!** screen, click **I'll explore on my own**.
3. In the left sidebar, Bruno has already created a sample collection for you, **Sample API Collection**. You can leave it or delete it; we're making our own collection.

Bruno doesn't ask for an account, and all its collections are saved as ordinary files on your laptop. That's why we chose it (Concept 8).

#### 5.7 Create a collection in `backend/bruno`

1. In the sidebar, in the **Collections** section, click the **+** icon (its tooltip says `Add new collection`), then choose **Create collection**. A small input box appears, saying `Untitled Collection`.
2. Type the collection name **`Mini Smart Home API`**, but **don't** press **Enter** yet. Click the **gear icon** (its tooltip says `Advanced options`) next to that box. The **Create Collection** dialog opens.
3. At **Location**, click **Browse**, then choose the **`backend`** folder inside the `mini-smart-home` repository (**Documents → GitHub → mini-smart-home → backend**).
4. At **Folder Name**, click the pencil icon, then change the name to **`bruno`**.
5. Click **Create**. Bruno shows `Collection created!`.

A **`backend/bruno`** folder now shows up in VS Code, holding `opencollection.yml` (the collection's identity) and a `.gitignore` made by Bruno. The file format is YAML, plain text that's easy to read, so it's safe to commit.

#### 5.8 The `local` environment

An environment is a set of variables. The server's address only has to be written once, as the `baseUrl` variable; later, if the server moves (for example to the internet in Module 27), you only need to change this one value.

1. At the top right, above the request area, click the selector that says **No Environment ▾**. On the **Collection** tab, click **Create**.
2. Fill in **Environment Name** with **`local`**, then click **Create**. That environment's table of variables opens.
3. Fill in one row: **Name** `baseUrl`, **Value** `http://127.0.0.1:8080`. Click **Save**.
4. Click the environment selector at the top right again, then choose **`local`**.

A new file, `backend/bruno/environments/local.yml`, shows up in VS Code. It only holds a name and the server's address, nothing secret, so it's safe to commit.

#### 5.9 The first three requests

1. Right-click the **Mini Smart Home API** collection in the sidebar, then choose **New Request**. In the **New Request** dialog, leave **Type** at **HTTP**, fill in **Request Name** with **`health`**, then fill in the URL next to the method selector (leave it at **GET**) with:

   ```text
   {{baseUrl}}/health
   ```

   Click **Create**.
2. The `health` request opens in a new tab. Click **Send** at the right end of the address bar (or press **Ctrl + Enter**). The answer panel on the right shows the code `200 OK`, how long the request took in milliseconds, and the content of the answer, for example `{"ok":true,"broker":true,"received":42,"rejected":0}`.
3. Add an automatic test. In the row of tabs below the address bar, open the **Assert** tab. Its table always has one empty row: type `res.status` in the **Expr** column, leave **Operator** at `equals` (saved in the file as `eq`), then type `200` in the **Value** column.
4. Save the request with **Ctrl + S**: the test is now written into the file `backend/bruno/health.yml` too, which Bruno created as soon as you clicked **Create** in step 1. Click **Send** again. The **Tests** tab in the answer panel now carries a small number `1`, and it holds `Assertions (1), Passed: 1, Failed: 0`. From now on, Bruno checks the status code every time this request is sent. If the answer isn't `200`, the test is marked as failed.
5. In the same way, create two more requests, each with the same `res.status` `eq` `200` test, then save them:

   | Request Name | Method | URL |
   | :--- | :--- | :--- |
   | `device list` | GET | `{{baseUrl}}/devices` |
   | `Node 1 latest reading` | GET | `{{baseUrl}}/devices/a4cf12e5b7c0/latest` (use your Node 1's `device_id`) |

6. Send **Node 1 latest reading**. The answer is Node 1's latest `telemetry` reading, which has passed the contract check:

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "kind": "node1",
     "status": "online",
     "telemetry": {
       "ts": "2026-10-19T06:09:27Z",
       "fw": "1.4.0",
       "temperature": 28.5,
       "humidity": 71,
       "light": 2310,
       "soil": 37,
       "motion": false,
       "water_level": 64
     }
   }
   ```

   That's the first completion requirement of this module: **`GET /devices/<id>/latest` in Bruno returns the latest readings as JSON**. Bruno shows it neatly; in reality, it's one long line.

> 💡 **Send it again after 10 seconds.** The `ts` in the answer has now changed, because Node 1 has already sent its next `telemetry`. The backend only keeps the **last** reading; its history waits for the database in Module 17.

#### 5.10 Save everything

In the second terminal (the `backend` folder):

```text
git add .
git status
git commit -m "API GET /devices/:id/latest, /docs, and a Bruno collection (Module 16 Practice 5)"
git push
```

In the `git status` list, the `bruno/` folder is included, together with `bruno/environments/local.yml`. That's what we want: a friend who clones this repository only needs to open the `backend/bruno` folder in Bruno (**+** → **Open collection**) to try the same API.

> ⬆️ **Done with Practice 5?** Go back to [Concept 9](#9-commands-through-the-api-send-wait-for-the-ack-and-a-time-limit) (the ➡️ at the end of Concept 10 will take you to Practice 6).

### Practice 6 — Commands through the API: `cmd` and `ack` (40 minutes)

> 🖥️ **Tools used:** **VS Code** (two terminals in the `backend` folder), **Bruno**, and Node 1 with the lamp relay on the workbench (the MB102 turned on), or the Practice 7 simulator. Concepts used: 9.
>
> ⭐ **Required** — completion requirement: `POST /devices/<id>/command` turns on a relay, and its `ack` is recorded.

The backend now accepts commands over HTTP, passes them on to Node 1 over MQTT, then waits at most 5 seconds for the `ack` (Concept 9). Remember safety rule number 3: commands from the API move real things.

#### 6.1 The store learns to wait

Replace the whole content of **`src/services/store.ts`**. The only new parts are the very bottom, starting at the comment `// Commands that are waiting for an ack`, and the one word `Ack` in the import line:

```ts
// store.ts - keeps the last state of every device in memory.
// The data is lost when the server stops; Module 17 replaces this with a database.
import type { Ack, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

export interface Device {
  device_id: string;
  kind: "node1" | "node2" | "unknown";
  status: Status | "unknown";
  last_seen: string; // server time (UTC) when this device's last message arrived
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
}

const devices = new Map<string, Device>();
export const counts = { received: 0, rejected: 0 };

function getOrCreate(deviceId: string): Device {
  let d = devices.get(deviceId);
  if (d === undefined) {
    d = { device_id: deviceId, kind: "unknown", status: "unknown", last_seen: "", telemetry: null, vitals: null };
    devices.set(deviceId, d);
  }
  d.last_seen = new Date().toISOString();
  return d;
}

export function saveTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  const d = getOrCreate(deviceId);
  d.kind = "pressure" in content ? "node2" : "node1";
  d.telemetry = content;
}

export function saveStatus(deviceId: string, status: Status): void {
  getOrCreate(deviceId).status = status;
}

export function saveVitals(deviceId: string, content: Vitals): void {
  getOrCreate(deviceId).vitals = content;
}

export function allDevices(): Device[] {
  return [...devices.values()];
}

export function findDevice(deviceId: string): Device | undefined {
  return devices.get(deviceId);
}

// Commands that are waiting for an ack, by command id.
const waiting = new Map<string, (ack: Ack) => void>();

export function waitForAck(commandId: string, timeoutMs: number): Promise<Ack | null> {
  return new Promise((done) => {
    const timer = setTimeout(() => {
      waiting.delete(commandId);
      done(null); // no answer before the time limit
    }, timeoutMs);
    waiting.set(commandId, (ack) => {
      clearTimeout(timer);
      waiting.delete(commandId);
      done(ack);
    });
  });
}

// Called when an ack arrives; false if no command is waiting for it.
export function deliverAck(ack: Ack): boolean {
  const deliver = waiting.get(ack.id);
  if (deliver === undefined) return false;
  deliver(ack);
  return true;
}
```

How it works:

- **`waiting`** is a second `Map`: its labels are command `id`s, and its contents are functions that will "wake up" the HTTP request that is waiting for that `ack`.
- **`waitForAck(id, timeoutMs)`** returns a Promise (step 5 of the warm-up) that is kept by whichever arrives first. Whichever one wins also removes that command's label from `waiting`, so that the cabinet doesn't fill up with junk. The two competitors:
  - **the timer** `setTimeout`: if the `ack` doesn't come within `timeoutMs` milliseconds, the Promise is kept with `null`;
  - **the `ack` itself**: the function stored in `waiting` keeps the Promise with that `ack`, then switches off the timer with `clearTimeout`.
- **`deliverAck(ack)`** is called by the MQTT ear when an `ack` arrives. It returns `false` if nothing is waiting for that `id`, for example an `ack` for a command you sent yourself from MQTTX.

#### 6.2 An ear that hands over the `ack` and a mouth that sends the `cmd`

Replace the whole content of **`src/services/mqtt.ts`** with:

```ts
// mqtt.ts - the backend as an MQTT client: listens to msh/#, checks every message, and sends commands.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import type { SetCommand } from "../schemas/contract.ts";
import { counts, deliverAck, saveStatus, saveTelemetry, saveVitals } from "./store.ts";

let client: mqtt.MqttClient | undefined;

export function startMqtt(url: string, log: FastifyBaseLogger): void {
  const clientName = "backend-" + Math.random().toString(16).slice(2, 8); // a unique name, not a device_id
  client = mqtt.connect(url, { clientId: clientName, reconnectPeriod: 5000 });
  client.on("connect", () => {
    log.info(`connected to broker ${url}`);
    client?.subscribe("msh/#", { qos: 1 });
  });
  client.on("reconnect", () => log.warn("broker not reachable yet, retrying in 5 seconds"));
  client.on("error", (error) => log.error(`MQTT error: ${error.message}`));
  client.on("message", (topic, content) => receive(topic, content.toString(), log));
}

export function brokerConnected(): boolean {
  return client?.connected ?? false;
}

function reject(topic: string, reason: string, log: FastifyBaseLogger): void {
  counts.rejected++;
  log.warn(`REJECTED ${topic}: ${reason}`);
}

// summarize the list of issues from Zod, for example "humidity: Too big: expected number to be <=100"
function summarize(error: ZodError): string {
  return error.issues.map((m) => `${m.path.join(".") || "content"}: ${m.message}`).join("; ");
}

function receive(topic: string, text: string, log: FastifyBaseLogger): void {
  const parts = topic.split("/"); // ["msh", device_id, kind]
  if (parts.length !== 3) return reject(topic, "the topic must look like msh/<device_id>/<kind>", log);
  const [, deviceId, kind] = parts;
  if (!DeviceId.safeParse(deviceId).success) return reject(topic, "invalid device_id", log);
  if (kind === "cmd") return; // a command (from this backend or MQTTX), not device data

  if (kind === "status") {
    if (text === "") return; // an empty message = someone deleting a retained status (Module 11), not a new status
    const result = Status.safeParse(text);
    if (!result.success) return reject(topic, `unknown status "${text}"`, log);
    saveStatus(deviceId, result.data);
    counts.received++;
    return;
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return reject(topic, "the content isn't JSON", log);
  }

  if (kind === "telemetry") {
    const hasPressure = typeof json === "object" && json !== null && "pressure" in json;
    const result = (hasPressure ? TelemetryNode2 : TelemetryNode1).safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    saveTelemetry(deviceId, result.data);
  } else if (kind === "vitals") {
    const result = Vitals.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    saveVitals(deviceId, result.data);
  } else if (kind === "ack") {
    const result = Ack.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    if (!deliverAck(result.data)) log.info(`ack ${result.data.id} arrived, but no command is waiting for it`);
  } else {
    return reject(topic, `message kind "${kind}" isn't in the contract`, log);
  }
  counts.received++;
}

let sequence = 0;

// command id: c-<date>-<UTC time>-<sequence number>, for example c-20261019-041008-1 (39 characters at most, contract
// section 7). The time is included so that ids stay unique after a server restart: a device ignores an id it has
// already carried out (contract rule 8), so a duplicate id = a command that is silently not carried out.
export function makeCommandId(): string {
  sequence = (sequence % 99) + 1;
  const time = new Date().toISOString(); // 2026-10-19T04:10:08.123Z
  const date = time.slice(0, 10).replaceAll("-", "");
  const clock = time.slice(11, 19).replaceAll(":", "");
  return `c-${date}-${clock}-${sequence}`;
}

export function sendCommand(deviceId: string, commandId: string, command: SetCommand): void {
  const cmd = {
    id: commandId,
    ts: new Date().toISOString().slice(0, 19) + "Z",
    action: "set",
    target: command.target,
    value: command.value,
  };
  client?.publish(`msh/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: false }); // set is NEVER retained
}
```

Three changes compared with Practice 4:

1. In the part that handles `ack`, an `ack` that passes the check is now handed over to the command that is waiting for it (`deliverAck`).
2. **`makeCommandId()`** makes an `id` like `c-20261019-053414-1`: the UTC date and time when it was made, plus a sequence number from 1 to 99. The time keeps the `id` unique even after the server restarts (Concept 9).
3. **`sendCommand()`** puts together the `cmd` JSON exactly as in contract section 7 (`id`, `ts`, `action: "set"`, `target`, `value`), then publishes it to `msh/<device_id>/cmd` with **QoS 1** and **`retain: false`**.

The other message checks are the same as in Practice 4, including a status with empty text, which is ignored without being recorded (4.4).

#### 6.3 The `POST /devices/:id/command` route

Replace the whole content of **`src/routes/devices.ts`** with:

```ts
// devices.ts - the /devices routes: the device list, the latest reading, and commands.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, SetCommand, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { findDevice, allDevices, waitForAck } from "../services/store.ts";
import { brokerConnected, makeCommandId, sendCommand } from "../services/mqtt.ts";

const ErrorBody = z.object({ message: z.string() });
const Kind = z.enum(["node1", "node2", "unknown"]);
const IdParam = z.object({ id: DeviceId.describe("the device's device_id, for example a4cf12e5b7c0") });

export const deviceRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["devices"],
      summary: "List every device ever heard",
      response: {
        200: z.array(z.object({
          device_id: z.string(),
          kind: Kind,
          status: z.union([Status, z.literal("unknown")]),
          last_seen: z.string(),
        })).describe("every device recorded in memory"),
      },
    },
  }, async () => {
    return allDevices().map((d) => ({
      device_id: d.device_id,
      kind: d.kind,
      status: d.status,
      last_seen: d.last_seen,
    }));
  });

  app.get("/devices/:id/latest", {
    schema: {
      tags: ["devices"],
      summary: "The latest telemetry reading of one device",
      params: IdParam,
      response: {
        200: z.object({
          device_id: z.string(),
          kind: Kind,
          status: z.union([Status, z.literal("unknown")]),
          telemetry: z.union([TelemetryNode1, TelemetryNode2]),
        }).describe("that device's latest reading"),
        404: ErrorBody.describe("no telemetry from that device yet"),
      },
    },
  }, async (req, reply) => {
    const d = findDevice(req.params.id);
    if (d === undefined || d.telemetry === null) {
      return reply.code(404).send({ message: `no telemetry from ${req.params.id} yet` });
    }
    return { device_id: d.device_id, kind: d.kind, status: d.status, telemetry: d.telemetry };
  });

  app.post("/devices/:id/command", {
    schema: {
      tags: ["devices"],
      summary: "Send one set command to a device, then wait for its ack (5 seconds at most)",
      params: IdParam,
      body: SetCommand,
      response: {
        200: z.object({ id: z.string(), wait_ms: z.number(), ack: Ack }).describe("the device answered with an ack"),
        404: ErrorBody.describe("the device has never been heard"),
        409: ErrorBody.describe("the device is offline, is Node 2, or its kind isn't known yet"),
        503: ErrorBody.describe("the backend is not connected to the broker"),
        504: ErrorBody.describe("no ack within 5 seconds"),
      },
    },
  }, async (req, reply) => {
    const d = findDevice(req.params.id);
    if (d === undefined) return reply.code(404).send({ message: `device ${req.params.id} has never been heard` });
    if (d.kind === "node2") return reply.code(409).send({ message: "Node 2 doesn't accept commands (contract section 2)" });
    if (d.kind !== "node1") return reply.code(409).send({ message: "device kind not known yet: wait for its first telemetry" });
    if (d.status !== "online") return reply.code(409).send({ message: `device is ${d.status}, command not sent` });
    if (!brokerConnected()) return reply.code(503).send({ message: "the backend isn't connected to the broker" });

    const commandId = makeCommandId();
    const start = Date.now();
    const ackPending = waitForAck(commandId, 5000); // start waiting before sending
    sendCommand(d.device_id, commandId, req.body);
    const ack = await ackPending;
    const elapsed = Date.now() - start;
    if (ack === null) {
      req.log.warn(`command ${commandId} to ${d.device_id}: no ack within 5 seconds`);
      return reply.code(504).send({ message: `no ack for ${commandId} within 5 seconds` });
    }
    req.log.info(`command ${commandId} to ${d.device_id}: ack ok=${ack.ok} in ${elapsed} ms`);
    return { id: commandId, wait_ms: elapsed, ack };
  });
};
```

The new route at the bottom works in the same order as Concept 9:

1. **`body: SetCommand`**: the request's body is checked against the contract's schema before anything else runs. `{"target":"pump","value":30}` is already refused with `400` here.
2. Five checks of the situation, each with its own status code: the device has never been heard (`404`); Node 2 (`409`); its kind isn't known yet (`409`, for example right after the server restarts, before its first `telemetry` arrives); the device isn't `online` (`409`); the backend isn't connected to the broker (`503`).
3. **`waitForAck()` is called before `sendCommand()`.** This is a safe habit: the wait is already set up before the command goes out, so however fast the `ack` comes back (Node 1 can answer within two milliseconds), something is certainly there to receive it, even if one day there's an `await` between the sending and the waiting. An `ack` that arrives when nothing is waiting is only logged, then thrown away.
4. **`await ackPending`**: the HTTP request "falls asleep" until the `ack` arrives or 5 seconds pass. Meanwhile, the server keeps serving other requests: that's what `await` is for (Module 4 Concept 12).
5. The result is written to the log (`ack ok=true in 12 ms`) and sent to the guest, together with the command's `id` and how long it waited.

Save all the files, then run `npm run check` in the second terminal. It must pass.

#### 6.4 Turn the lamp on from Bruno

1. In Bruno, create a new request (right-click the collection → **New Request**): **Request Name** `lamp on`, method **POST** (click the method selector to the left of the URL), URL `{{baseUrl}}/devices/a4cf12e5b7c0/command` (use your Node 1's `device_id`). Click **Create**.
2. Open the **Body** tab. At the right end of the tab bar, click the selector that says **No Body ▾**, then choose **JSON**. Type this into its editor:

   ```json
   {
     "target": "lamp",
     "value": true
   }
   ```

   Bruno adds the `Content-Type: application/json` header (the letter's head) by itself for a JSON body, so the **Headers** tab doesn't need to be filled in.
3. On the **Assert** tab, add the `res.status` `eq` `200` test as in 5.9.
4. Save (**Ctrl + S**), then click **Send**. The lamp relay on the workbench goes "click", and the lamp turns on. On the simulator path, there's no click; the third terminal (the simulator) writes `f00d00000001: command c-… -> ok=true`. **Expected output** in Bruno's answer panel (the `id`, the time, and the wait on your screen are different):

   ```json
   {
     "id": "c-20261019-053414-1",
     "wait_ms": 12,
     "ack": {
       "id": "c-20261019-053414-1",
       "ts": "2026-10-19T05:34:14Z",
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

   and in the first terminal:

   ```text
   [12:34:14] INFO: command c-20261019-053414-1 to a4cf12e5b7c0: ack ok=true in 12 ms
   [12:34:14] INFO: POST /devices/a4cf12e5b7c0/command -> 200 (34 ms)
   ```

   That's the second completion requirement of this module: **the relay turns on and its `ack` is recorded**. The `state` in the `ack` is the state of **all** of Node 1's actuators after the command was carried out (contract section 8): what the backend records is the reality on the device, not just "the command was sent".
5. Create a second request, **`lamp off`**, with the same body and test, but `"value": false`. Save it, then send it: the relay switches off.

#### 6.5 Test the other status codes

Use the `lamp on` request and change its body or URL for a while, without saving (don't press **Ctrl + S**). When you're done, close its tab. Bruno asks with an `Unsaved changes` dialog: click **Don't Save** (not **Save**) so that `lamp on.yml` stays as it was. For the tries whose answer isn't `200`, the **Tests** tab marks the test as failed. That's how it should be: the test only accepts `200`.

| Try | Expected result |
| :--- | :--- |
| Body `{"target":"pump","value":30}` | `400`, `"message":"body/value Too big: expected number to be <=10"` |
| Body `{"target":"door","value":true}` | `400`, `"message":"body/target Invalid discriminator value. Expected 'lamp' \| 'fan' \| 'pump' \| 'curtain'"` |
| URL with Node 2's `device_id` | `409`, `{"message":"Node 2 doesn't accept commands (contract section 2)"}`. Before Node 2 sends its first `telemetry` after the server restarts (within 5 minutes at most), the message is `device kind not known yet: wait for its first telemetry`, with the same code. |
| URL with `abcdefabcdef` | `404`, `{"message":"device abcdefabcdef has never been heard"}` |
| Body `{"target":"pump","value":3}` (the pump's hose in a water tank that has water in it!) | `200`, the pump runs for three seconds; `ack.state.pump` is `true`. If the water tank is below 20% or can't be read, Node 1 refuses: the answer is still `200`, but `ack.ok` is `false`, with a `message` giving the reason. `200` means that the device answered, not that the command was carried out. |

**Test 504 and the `offline` 409** (needs a real Node 1):

1. Turn off the MB102, then unplug Node 1's USB (the golden power rules). Node 1 goes dark without getting the chance to say goodbye to the broker.
2. **Right away, within 10 seconds**, send `lamp on` from Bruno. Bruno waits about five seconds, then shows **`504`** with `{"message":"no ack for c-… within 5 seconds"}`. The broker doesn't know yet that Node 1 is off, so the status the backend has recorded is still `online`. Don't wait: the broker publishes the last will 22.5 seconds after the **last** news from Node 1, and that last news may have gone out 10 seconds before the USB was unplugged.
3. Wait about 30 seconds, then send it again. Now the answer comes right away: **`409`**, `{"message":"device is offline, command not sent"}`. The broker has published Node 1's `offline` last will after 22.5 seconds without news (contract section 3), and the backend heard it.
4. Plug Node 1's USB back in, then turn on the MB102. As soon as Node 1's status is `online` again, commands are accepted again.

Those two different codes describe two different situations: `504` means "tried, no answer", and `409` means "not tried, because the device is known to be off". An application that uses your API can show the right message for each one.

> **Save:** in the second terminal (the `backend` folder), `git add .`, `git commit -m "POST /devices/:id/command: cmd, wait for the ack, status codes (Module 16 Practice 6)"`, and `git push`.
>
> ➡️ **Continue** to [Practice 7 — A ten-device simulator](#practice-7--a-ten-device-simulator-25-minutes) without going back to the concepts.

### Practice 7 — A ten-device simulator (25 minutes)

> 🖥️ **Tools used:** **VS Code** (a third terminal in the `tools` folder), **Bruno**, and the broker on the Pi (or your laptop broker). Node 1 and Node 2 may be on, or not. Concepts used: 6 and 9.

Imagine Mini Smart Home being sold to a hundred homes: the backend has to serve hundreds of devices, while there are only two on your desk. A **simulator** is a program that pretends to be many devices at once, speaking MQTT exactly as the data contract says. With a simulator, the backend can be developed and tested anytime: without boards, without Wokwi, even on a train without a workbench.

This simulator uses the `buildTelemetry()` function from `tools/generate-dummy.js` (Module 4 Practice 4) and the `mqtt` library that has been installed in the `tools` folder since Module 11. It's written in plain JavaScript, like the other tools in that folder.

#### 7.1 Write `tools/device-simulator.js`

In VS Code's Explorer, click the **`tools`** folder (in the `mini-smart-home` repository, next to `backend`), then create a new file, **`device-simulator.js`**:

```js
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
```

Its parts:

- **`makeDeviceId(number)`** makes a fake `device_id` that's still valid under the contract: 12 lowercase hexadecimal digits, starting with `f00d` so that it's easy to tell apart from real devices. The first device is `f00d00000001`, the tenth `f00d00000010`.
- **`runDevice(deviceId)`** brings one fake device to life, with its own MQTT connection. Its settings copy contract section 3: *client ID* = `device_id`, a *clean session*, a 15-second *keep-alive*, reconnecting at most every 5 seconds, and an `offline` last will, retained. As soon as it's connected, it publishes `online` (retained), subscribes to `cmd`, and sends its first `vitals`.
- **The command answerer** copies Node 1: it ignores messages that aren't JSON or whose `id` is too long, remembers the last eight `id`s (rule 8), checks `target` and `value`, then always answers with an `ack` complete with the `state` of all its actuators, or with a `message` if the command is refused.
- **`telemetry`** is sent every 10 seconds, but each device starts at a random second (`Math.random() * 10000`) so that the ten devices don't all send at once. Real devices never send all at once either.
- `vitals` is sent once on connecting, then every 5 minutes (contract section 2).
- **`clean(count)`** near the bottom is used in 7.4: it publishes an empty retained message to the `status` topic of every fake device so that the broker forgets their status, then the program ends. The `if … else` part at the very bottom picks the job: if the word `clean` comes after the broker's address, the simulator cleans up the statuses; if not, the simulator runs the fake devices as usual.

#### 7.2 Run ten devices

Open a third terminal (**+** in the terminal panel). A new terminal always starts in the `mini-smart-home` folder, so first go into the `tools` folder, then run the simulator with your own broker's address:

```text
cd tools
node device-simulator.js mqtt://192.168.1.37:1883
```

**Expected output:**

```text
10 fake devices heading to mqtt://192.168.1.37:1883. Stop with Ctrl+C.
f00d00000001: online
f00d00000002: online
f00d00000003: online
f00d00000004: online
f00d00000005: online
f00d00000006: online
f00d00000007: online
f00d00000008: online
f00d00000009: online
f00d00000010: online
```

Leave the simulator running.

#### 7.3 The backend serves twelve devices

1. In Bruno, send **device list**. Its answer now holds twelve devices: Node 1, Node 2, and the ten `f00d…` devices (on the simulator path, only those ten fake devices, which you've been running since Practice 3). During the first 10 seconds, some of the fake devices still have `"kind":"unknown"`; as soon as their first `telemetry` arrives, they all become `node1` (the simulator copies Node 1).
2. Open `http://127.0.0.1:8080/health`. The `received` number now goes up about eleven times as fast (on the simulator path, it's been this fast since Practice 3), and `rejected` stays at `0`: every simulator message passes the contract check.
3. Open the **lamp on** request, replace the `device_id` in its URL with `f00d00000003` for now (don't save it), then send it. The answer is `200` with an `ack`, and the third terminal (the simulator) writes:

   ```text
   f00d00000003: command c-20261019-051431-1 -> ok=true
   ```

   The backend doesn't care whether the one answering is a real ESP32 or the simulator: as long as both keep to the contract, both are treated the same. That's the power of the data contract. After that, close the **lamp on** tab and click **Don't Save**, as in 6.5, so that its URL still points at Node 1 and `lamp on.yml` doesn't change. If the change got saved anyway, that file shows up in Practice 8's `git status` too; put it back from the second terminal (the `backend` folder) with `git restore "bruno/lamp on.yml"`.

#### 7.4 Stop it and watch the last will at work

Press **Ctrl + C** in the simulator's terminal, then send **device list** from Bruno again. All ten fake devices are now `"status":"offline"`: the broker publishes every device's last will as soon as its connection drops.

That `offline` status is retained, so the broker keeps it, and the fake devices show up again every time the backend restarts. That's harmless, but the list gets crowded. Clean it up from the simulator's terminal:

```text
node device-simulator.js mqtt://192.168.1.37:1883 clean
```

**Expected output:**

```text
Status of 10 fake devices removed from the broker.
```

The backend that's running still remembers them in its store. After the server restarts (for example **Ctrl + C** in the first terminal, then `npm run dev` again), the fake devices no longer show up in **device list**.

> **Save:** in the third terminal (the `tools` folder), first go up to the root of the repository with `cd ..`, then `git add tools/device-simulator.js`, `git commit -m "Simulator of 10 fake devices following the data contract (Module 16 Practice 7)"`, and `git push`.
>
> ➡️ **Continue** to [Practice 8 — Git for teams](#practice-8--git-for-teams-branches-pull-requests-and-reviews-45-minutes) without going back to the concepts. You already read Concept 10 before Practice 6.

### Practice 8 — Git for teams: branches, pull requests, and reviews (45 minutes)

> 🖥️ **Tools used:** **VS Code** (the server keeps running in the first terminal; the `git` commands go in the second terminal), **Bruno**, a **browser** that's already signed in to your GitHub account, and Node 1 or the Practice 7 simulator. Concepts used: 10.
>
> ⭐ **Required** — completion requirement: your Git history shows one merged pull request.

Up to Practice 7, every commit went straight into `main`. On a team, `main` is "the version that always works": every feature is built on its own branch, checked through a pull request, and only then merged (Concept 10). In this practice, you play two roles at once: the **author** of the feature, then the **reviewer** who checks it with the checklist.

The feature is small but real: **`GET /devices/:id/vitals`**, the last health report of a device (signal strength, uptime, and free memory). The backend's store has kept `vitals` since Practice 3, and since Practice 4 their content has been checked against the contract, but there's no API door for reading them yet.

#### 8.1 The pull request template (straight on `main`)

A pull request template is a file whose content shows up automatically in the description box of every new pull request. We fill it with the reviewer's checklist. GitHub only uses a template that's already on the `main` branch, so this template is committed to `main` first, before the feature branch is created.

1. In VS Code's Explorer, right-click the empty space below the list of files (at the root of the `mini-smart-home` folder, not inside `backend`), then choose **New File…**. Type `.github/pull_request_template.md`, then press **Enter**. Because there's a slash in it, VS Code creates the `.github` folder at the same time.
2. Fill that file with:

   ```markdown
   ## What changed?

   <!-- One or two sentences: which feature was added or fixed, and why. -->

   ## Checklist before merging

   - [ ] `npm run check` passes, without type errors
   - [ ] The server starts with `npm run dev`, without errors in the terminal
   - [ ] The new route was tried in Bruno, its test passes, and its request is saved in `backend/bruno/`
   - [ ] The new route shows up in `/docs`, with its descriptions
   - [ ] No `.env` file or password in the **Files changed** tab
   - [ ] `DATA-CONTRACT.md` is updated too if the shape of an MQTT message changed
   ```

   The `<!-- … -->` line is a comment: you see it while you write the description, but it doesn't show on the pull request page. Lines that start with `- [ ]` become checkboxes you can click on GitHub.
3. Save (**Ctrl + S**). In the second terminal, first go up to the root of the repository, then commit:

   ```text
   cd ..
   git status
   git add .github
   git commit -m "Pull request template with a checklist (Module 16 Practice 8)"
   git push
   cd backend
   ```

   `git status` only mentions that new folder:

   ```text
   On branch main
   Your branch is up to date with 'origin/main'.

   Untracked files:
     (use "git add <file>..." to include in what will be committed)
           .github/

   nothing added to commit but untracked files present (use "git add" to track)
   ```

   After the final `cd backend`, the second terminal is back in the `backend` folder. If that `git status` also mentioned `backend/bruno/lamp on.yml` under `Changes not staged for commit`, the temporary change of 7.3 got saved by accident. Put it back now with `git restore "bruno/lamp on.yml"` so that the file doesn't go into the pull request.

#### 8.2 A new branch: `feature/vitals`

```text
git switch -c feature/vitals
```

**Expected output:**

```text
Switched to a new branch 'feature/vitals'
```

`git switch` means "switch branches", and `-c` (short for *create*) means "create the branch first". The name `feature/…` is just a habit: from the name alone, everyone on the team knows which feature the branch holds. Look at the bottom left corner of VS Code: the branch name in the status bar is now `feature/vitals`, not `main`. Every commit from now on goes into this branch, and `main` stays untouched until the merge in 8.8.

#### 8.3 Write the feature

Open **`src/routes/devices.ts`**. There are two changes:

1. In the import line from `../schemas/contract.ts`, add `Vitals` at the end of its list:

   ```ts
   import { Ack, DeviceId, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
   ```

2. Find the end of the `/devices/:id/latest` route, that is, the `});` line right before `app.post("/devices/:id/command", {`. Insert one empty line and this new route between the two:

   ```ts
     app.get("/devices/:id/vitals", {
       schema: {
         tags: ["devices"],
         summary: "The last health report of one device (vitals)",
         params: IdParam,
         response: {
           200: z.object({ device_id: z.string(), vitals: Vitals }).describe("that device's latest vitals"),
           404: ErrorBody.describe("no vitals from that device yet"),
         },
       },
     }, async (req, reply) => {
       const d = findDevice(req.params.id);
       if (d === undefined || d.vitals === null) {
         return reply.code(404).send({ message: `no vitals from ${req.params.id} yet` });
       }
       return { device_id: d.device_id, vitals: d.vitals };
     });
   ```

The pattern is exactly the same as the `/latest` route above it: one schema that serves both for checking and for `/docs`, a `404` answer with a clear `message`, and a `200` answer holding data from the store. Save. The complete content of this file after the practice is in [`code/backend/src/routes/devices.ts`](code/backend/src/routes/devices.ts).

#### 8.4 Test it yourself before asking for a review

Don't burden the reviewer with mistakes you can find yourself. Do these three checks, following the checklist in the template:

1. **The type checker.** In the second terminal, run `npm run check`. It must pass, without any error messages.
2. **Bruno.** Click the **Node 1 latest reading** request in the sidebar so its tab opens, then right-click that **tab** (in the row of tabs at the top) and choose **Clone Request**. In the **Clone Request** dialog, change **Request Name** to `Node 1 vitals`, then click **Clone**. (The **Clone** item in the sidebar menu makes a copy named `Node 1 latest reading copy` straight away, without a dialog; if that happens, right-click the copy and choose **Rename**.) In that new tab, change the word `latest` at the end of the URL to `vitals`, save (**Ctrl + S**), then click **Send**. The `res.status` `eq` `200` test was copied along from the original request.

   Most likely, the first answer is **`404`**, `{"message":"no vitals from a4cf12e5b7c0 yet"}`, and the **Tests** tab marks the test as failed. This isn't a mistake in your code. When you saved `devices.ts`, `--watch` restarted the server, so its store is empty again. Node 1 itself only sends `vitals` right after it connects and every 5 minutes after that. Press the **EN** button on the Node 1 board, wait about 15 seconds until its status is `online` again, then send it again. **Expected output:** `200`, with content like this (the numbers on your screen are different):

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "vitals": {
       "ts": "2026-10-19T06:21:47Z",
       "rssi": -61,
       "uptime_s": 14,
       "heap_free": 183200
     }
   }
   ```

   **The simulator path:** the fake devices send `vitals` as soon as they connect, so run the simulator again in the third terminal (if it turns out to be still running, stop it first with **Ctrl + C**). That terminal is usually still at the root of the repository since the Practice 7 commit, so check with `pwd`: if the path doesn't end with `tools`, go in first with `cd tools`. Then run `node device-simulator.js mqtt://192.168.1.37:1883`. Replace the `device_id` in the URL with `f00d00000001`, then send it. When you're done with Practice 8, stop the simulator and run `clean` as in 7.4.
3. **`/docs`.** Reload `http://127.0.0.1:8080/docs`. The `GET /devices/{id}/vitals` route shows up in the `devices` group, complete with its `200` and `404` descriptions, even though you didn't write a single line of documentation separately.

#### 8.5 Commit and push the branch

In the second terminal (the `backend` folder):

```text
git status
git add .
git commit -m "GET /devices/:id/vitals: the last health report of a device (Module 16 Practice 8)"
git push -u origin feature/vitals
```

`git status` now names the branch, one changed file, and one new file:

```text
On branch feature/vitals
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/routes/devices.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        bruno/Node 1 vitals.yml

no changes added to commit (use "git add" and/or "git commit -a")
```

The first push of a new branch needs two pieces of information: where to (`origin`, that is, the repository on GitHub) and which branch (`feature/vitals`). `-u` tells Git to remember that pair, so the next push on this branch is just `git push`. The **Expected output** ends with lines like these:

```text
remote: Create a pull request for 'feature/vitals' on GitHub by visiting:
remote:      https://github.com/YOUR-USERNAME/mini-smart-home/pull/new/feature/vitals
remote:
To https://github.com/YOUR-USERNAME/mini-smart-home.git
 * [new branch]      feature/vitals -> feature/vitals
branch 'feature/vitals' set up to track 'origin/feature/vitals'.
```

The `remote:` lines are sent by GitHub: it's already offering a link for creating a pull request. If you forget `-u` and only type `git push`, Git refuses with `fatal: The current branch feature/vitals has no upstream branch.` and writes the right command below it: run that command.

#### 8.6 Open a pull request on GitHub

1. Open the `mini-smart-home` repository on GitHub. Above the list of files, a yellow banner appears, saying that the `feature/vitals` branch was just pushed, with a **Compare & pull request** button. Click that button. (The link in the `git push` output above opens the same page.)
2. The **Open a pull request** page opens. Check its row of branch selectors: **base: `main`** ← **compare: `feature/vitals`**. It means "merge the content of `feature/vitals` into `main`".
3. The title is already filled in from your commit message. The description box holds the template from 8.1. Under **What changed?**, write one or two sentences, for example: `New route GET /devices/:id/vitals to read the last vitals of a device. Also added: the Bruno request "Node 1 vitals".` Leave the checklist boxes empty for now: the checklist is filled in during the review.
4. Click the green **Create pull request** button.

Your pull request page opens with a number, usually **#1**, and four tabs: **Conversation** (the description and the conversation), **Commits**, **Checks**, and **Files changed** (every change, line by line).

#### 8.7 Review with a checklist

Now switch roles: you're the reviewer, who reads someone else's changes carefully.

1. Open the **Files changed** tab. There are two files: `backend/bruno/Node 1 vitals.yml` (new) and `backend/src/routes/devices.ts`. Lines with a green background were added, and lines with a red background were removed: one old import line was replaced by the version that holds `Vitals`. Make sure there's no `.env` file in this list.
2. Leave one comment on a line, like a real reviewer. Point the mouse at the line `404: ErrorBody.describe("no vitals from that device yet"),`, click the blue **+** icon that appears to the left of that line, then write, for example: `404 also appears right after the server restarts, until the device sends its vitals again.` Click **Comment**.
3. Open the **Conversation** tab. Check every checklist item in the description against what really happened (8.4 and step 1 above), then click the box of every item that has really been proven. The last item, `DATA-CONTRACT.md`, may be ticked too: this feature doesn't change the shape of any MQTT message, so there's nothing to update.
4. Go back to the **Files changed** tab, then click the **Review changes** button at the top right. Write a summary, for example `Checklist complete, the route was tried in Bruno. Ready to merge.`, choose **Comment**, then click **Submit review**.

The **Approve** option isn't available: GitHub doesn't let authors approve their own pull requests. On a real team, the teammate who reviews chooses **Approve** (agree) or **Request changes** (ask for fixes). If you're learning together with a friend, invite them through **Settings** → **Collaborators** in your repository, then ask them to review your next pull request.

#### 8.8 Merge

1. In the **Conversation** tab, scroll down to the merge box. Its green button must say **Merge pull request**. If it says **Squash and merge** or **Rebase and merge**, click the small arrow next to it, then choose **Create a merge commit**. This option keeps your commits as they are, so that `git branch -d` in 8.9 runs smoothly.
2. Click **Merge pull request**. The merge commit message is already filled in (`Merge pull request #1 from YOUR-USERNAME/feature/vitals`); leave it, then click **Confirm merge**.
3. A purple **Merged** label appears at the top of the page, and a **Delete branch** button appears below the conversation. Click that button: the `feature/vitals` branch on GitHub is deleted, because its content is already safe in `main`.

#### 8.9 Back to `main` on the laptop

`main` on GitHub is now newer than `main` on your laptop. In the second terminal:

```text
git switch main
git pull --prune
git branch -d feature/vitals
git log --oneline --graph
```

**Expected output** (the commit codes, a few `remote: …` lines, and the numbers on your screen are different):

```text
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
```

```text
From https://github.com/YOUR-USERNAME/mini-smart-home
 - [deleted]         (none)     -> origin/feature/vitals
   3a0a267..061937e  main       -> origin/main
Updating 3a0a267..061937e
Fast-forward
 backend/bruno/Node 1 vitals.yml | 22 ++++++++++++++++++++++
 backend/src/routes/devices.ts   | 20 +++++++++++++++++++-
 2 files changed, 41 insertions(+), 1 deletion(-)
 create mode 100644 backend/bruno/Node 1 vitals.yml
```

```text
Deleted branch feature/vitals (was 8d53bd9).
```

```text
*   061937e (HEAD -> main, origin/main, origin/HEAD) Merge pull request #1 from YOUR-USERNAME/feature/vitals
|\
| * 8d53bd9 GET /devices/:id/vitals: the last health report of a device (Module 16 Practice 8)
|/
* 3a0a267 Pull request template with a checklist (Module 16 Practice 8)
* 7b0a8d2 Simulator of 10 fake devices following the data contract (Module 16 Practice 7)
```

- **`git switch main`** still says `up to date`, even though `main` on GitHub has changed. Git only compares with the state of GitHub that it **last downloaded**; it doesn't know about the new merge yet.
- **`git pull --prune`** downloads that merge commit. At the same time, `--prune` removes the old record of the `feature/vitals` branch on GitHub, which you deleted in 8.8 (the `[deleted]` line).
- **`git branch -d feature/vitals`** deletes the branch on the laptop. It's safe: Git refuses to delete a branch whose content hasn't gone into `main` yet.
- **`git log --oneline --graph`** draws the history: a line that branches off to the right for the feature commit, then joins again at the merge commit. Press **q** if the terminal is waiting.

That little drawing is the proof of the last completion requirement: **your Git history shows one merged pull request**. On GitHub, the **Pull requests** tab → **Closed** also lists #1 with the **Merged** label.

> 💡 **From now on, this is how you build every feature**, in the next modules too: `git switch -c feature/…` → write and test → commit → `git push -u origin feature/…` → pull request → review with the checklist → merge → `git switch main` and `git pull --prune`. You can still use GitHub Desktop anytime: it reads the same repository, and shows the same branches and pull requests.
>
> ➡️ **Done with Practice 8?** Do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1), then the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home).

## 🚨 Troubleshooting

Click the title of the problem that looks most like yours. The first step for almost every backend problem is the same: **read the first terminal** (where `npm run dev` runs) from the bottom up, then open `http://127.0.0.1:8080/health`.

<details>
<summary><b>The server won't start: <code>EADDRINUSE</code>, <code>Unknown file extension ".ts"</code>, <code>Cannot find package</code>, or <code>Failed running</code></b></summary>

| Message | Cause | Fix |
| :--- | :--- | :--- |
| `Error: listen EADDRINUSE: address already in use 127.0.0.1:8080` | Counter 8080 is already taken, most often by this same server, still running in another terminal. | Close the old terminal (the trash can icon in the terminal panel). If the counter really is taken by another program, change it to `PORT=8081` in `.env`, then also change `baseUrl` in Bruno. |
| `Unknown file extension ".ts"` | Your Node.js is too old, so it can't run `.ts` files by itself yet. | `node --version` must say `v24…` (old Macs with Node.js 22: at least `v22.18`). Install Node.js 24 LTS as in Module 4 Practice 3, or the latest version 22 for old Macs. |
| `Cannot find package 'fastify'` (or `'mqtt'`, `'zod'`, …) | `npm install …` hasn't been run **in the `backend` folder**, or the repository was just cloned from GitHub without an `npm install`. | `cd backend`, then `npm install`. Without a library name, `npm install` installs everything listed in `package.json`. |
| `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/src/config/env' imported from …/src/server.ts` | An import of one of your own files doesn't end with `.ts` (for example `"./config/env"` or `"./config/env.js"`), or a file or folder name has a typo. | Write it in full, with the `.ts` ending, for example `"./config/env.ts"` (Concept 4), and check its spelling against the name in the Explorer. `npm run check` flags the same line (`TS2835`), but ignore its suggestion `Did you mean './config/env.js'?`: in this project, the ending is always `.ts`. |
| `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode` | There's an `enum` (or another TypeScript feature that can't simply be erased) in your code. | Replace the `enum` with `z.enum([...])` from Zod, or with a union of texts such as `"node1" \| "node2"` (Concept 4). `npm run check` had actually warned you already: `This syntax is not allowed when 'erasableSyntaxOnly' is enabled.` |
| `Failed running 'src/server.ts'. Waiting for file changes before restarting...`, preceded by a red message such as `SyntaxError` | There's a typo in the file you just saved, so the server stopped. This happens most often when code you haven't finished typing gets saved. | Read the red message above it: the line `file:///…/src/….ts:15` names the file and its line number, and the `^` marks under the line of code point at the wrong part. Fix it, then save: `--watch` starts the server again by itself. `npm run check` usually points at the same mistake. |

</details>

<details>
<summary><b>The server stops right after <code>npm run dev</code>: <code>.env: not found</code> or <code>Setting MQTT_URL is empty</code></b></summary>

- **`node: .env: not found`**: there's no `.env` file in the `backend` folder. Copy `.env.example` (right-click → **Copy**, then right-click the `backend` folder → **Paste**), rename the copy to `.env`, then fill in your broker's address. Watch the file name: it starts with a dot and has no ending at all (not `.env.txt`). After that, run `npm run dev` again. By the time this message appears, Node.js has stopped completely, so `--watch` doesn't wait for the new `.env` file either.
- **`Setting MQTT_URL is empty. Copy .env.example to .env, fill in MQTT_URL, then run again.`**: the `.env` file exists, but the `MQTT_URL=…` line is empty, or its name has a typo (all capital letters, with an underscore). Below it, `Failed running 'src/server.ts'. Waiting for file changes before restarting...` appears: the server has stopped, but `npm run dev` keeps waiting. Fill in `MQTT_URL`, save `.env`, and the server starts again by itself.
- **Changed `.env`?** As soon as `.env` is saved, `--watch` restarts the server with its new settings: the terminal writes `Restarting 'src/server.ts'` (Node.js 24.19 or newer writes `Change detected in '….env'` before it; older versions, including Node.js 22 on old Macs, only write the `Restarting` line). If the `Restarting` line doesn't appear, stop the server (**Ctrl + C**), then run `npm run dev` again.

</details>

<details>
<summary><b>The terminal keeps printing <code>broker not reachable yet, retrying in 5 seconds</code>, or commands are answered with <code>503</code></b></summary>

The backend can't connect to the broker: `/health` answers `"broker":false`, and commands to devices it already knows are answered with `503` and `{"message":"the backend isn't connected to the broker"}`. If the backend hasn't connected even once since it started, its store is still empty, so commands are answered with `404` instead. Check these in order:

1. **The address.** Open `.env`: `MQTT_URL` must start with `mqtt://`, hold the Pi's IP address (not a name), and end with `:1883`, for example `mqtt://192.168.1.37:1883`.
2. **The Pi.** Open MQTTX and connect **Pi gateway**. If MQTTX fails too, the problem is with the Pi or the network, not with the backend: follow 🚨 in Module 12 (Is the Pi on? Has its IP address changed? Is the laptop on the same Wi-Fi?).
3. **The laptop path.** The laptop broker must be running (Module 12 Practice 7), and `MQTT_URL` must hold that broker's address.

After `.env` is fixed and saved, the server restarts by itself (look for the `Restarting 'src/server.ts'` line). If it doesn't, restart it with **Ctrl + C**, then `npm run dev`.

</details>

<details>
<summary><b><code>GET /devices</code> answers <code>[]</code> (empty)</b></summary>

- Look at the first terminal's log: is there a `connected to broker …` line? If not, see the collapsible section "broker not reachable yet" above.
- The backend is connected to a **different** broker from your devices, for example the backend to the Pi, while Node 1 is still on the public broker of Module 11. In MQTTX, subscribe to `msh/#` on the connection that matches the backend's `MQTT_URL`: if MQTTX is quiet too, the devices aren't talking to that broker.
- The devices are off, and they haven't connected to this broker since the broker was switched on (there's no retained status yet). Switch on Node 1, or run the Practice 7 simulator.

</details>

<details>
<summary><b>Messages from the real Node 1 are <code>REJECTED</code> too</b></summary>

Read the reason after `REJECTED`. The most common causes:

- **`content: Unrecognized key: "…"`**: your firmware sends a field that isn't in the contract, for example an extra sensor from the 🧩 of an earlier module. This project's rule: change the contract first (`DATA-CONTRACT.md` and Appendix A), then the code. Add that field to `TelemetryNode1` in `contract.ts`, with its type and its range.
- **`ts: …`**: Node 1's clock isn't set yet, or `ts` holds a time zone other than UTC (`Z`). Node 1 v1.2.0 and later don't publish `telemetry` before their clock has been set by NTP, so this usually shows up with messages you made yourself in MQTTX.
- **`humidity: …` or another number out of range**: the sensor may really be broken. That's what the guard is for: broken data doesn't get into the store.

</details>

<details>
<summary><b>VS Code is full of red lines, or <code>npm run check</code> complains about <code>TS5097</code>, <code>TS2591</code>, <code>TS1295</code>, or <code>TS18003</code></b></summary>

| Message | Fix |
| :--- | :--- |
| `An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.` | `tsconfig.json` doesn't exist yet, or something is missing from it. Make it the same as in Practice 2.3, and make sure the file is in the `backend` folder (next to `package.json`), not in `src`. |
| `error TS18003: No inputs were found in config file '…/mini-smart-home/tsconfig.json'` | `tsconfig.json` was saved at the root of `mini-smart-home`, not in the `backend` folder. In the Explorer, drag that file into the `backend` folder (answer **Move** if you're asked), then run `npm run check` again. |
| `npm run check` only prints `Version 7.0.2` and a list of `tsc` commands | `tsconfig.json` can't be found, so `tsc` doesn't know what to check. Create that file in the `backend` folder as in Practice 2.3, then run it again. |
| `Cannot find name 'process'. Do you need to install type definitions for node?` | `@types/node` isn't installed yet: `npm install --save-dev @types/node@24`. Also check for `"types": ["node"]` in `tsconfig.json`. |
| `ECMAScript imports and exports cannot be written in a CommonJS file …` | `package.json` doesn't hold `"type": "module"` yet. Run `npm pkg set type=module` in the `backend` folder. |
| The red lines are still there after the fix | VS Code is sometimes late in reading a new `tsconfig.json`. Press **Ctrl + Shift + P**, type `TypeScript: Restart TS Server`, then press **Enter**. |

</details>

<details>
<summary><b>Commands are always answered with <code>504</code> (no <code>ack</code> within 5 seconds)</b></summary>

1. In MQTTX, subscribe to `msh/<device_id Node 1>/#`, then send the command from Bruno again. Does a `cmd` message from the backend show up? If not, check the `device_id` in Bruno's URL.
2. The `cmd` shows up, but there's no `ack`: Node 1 doesn't hear commands. Open Node 1's Serial Monitor: is there a line about that command? Since v1.2.0, Node 1's firmware subscribes to `cmd` as soon as it connects (Module 11). Press **EN** on the Node 1 board, wait until its status is `online`, then try again.
3. There's an `ack`, but the backend still answers `504`: look at the first terminal. Is there a `REJECTED msh/…/ack`? Then the `ack` breaks the contract, for example `ok:false` without a `message`. If there's `ack … arrived, but no command is waiting for it`, the `id` in the `ack` is different from the command's `id`.
4. Right after Node 1 goes off, `504` really is the correct answer, until the broker publishes its last will (Practice 6.5).

</details>

<details>
<summary><b>A command is answered with <code>409</code>: <code>device kind not known yet</code> or <code>device is offline</code></b></summary>

- **`device kind not known yet: wait for its first telemetry`**: the server has just restarted (for example because you saved a file). Node 1's retained status has already arrived again, but its sensor readings haven't, so the device's kind isn't known yet. Wait at most 10 seconds until Node 1's next `telemetry` arrives, then send it again. If the answer stays the same, look at **device list**: an `offline` status means that Node 1 (or its simulator) really is off, so follow the next item. For Node 2, this message stays until Node 2 wakes up and sends `telemetry` (within 5 minutes at most); after that, the answer is still `409`, this time `Node 2 doesn't accept commands`.
- **`device is offline, command not sent`**: the broker has published Node 1's `offline` last will. Switch on Node 1 (USB first, then the MB102), then wait until its status is `online` in **device list**. On the simulator path, run the simulator again as in 7.2.

</details>

<details>
<summary><b>The fake devices <code>f00d…</code> still show up in <code>GET /devices</code></b></summary>

Their `offline` status is retained: the broker keeps it and hands it over again every time the backend subscribes. Delete it with the simulator's `clean` mode (Practice 7.4), from the `tools` folder:

```text
node device-simulator.js mqtt://192.168.1.37:1883 clean
```

Then restart the server in the first terminal (**Ctrl + C**, then `npm run dev`). The backend ignores empty status messages, so the store of the running server is only clean after a restart.

Another way, one by one through MQTTX, as in 🚨 in Module 11 ("The lamp turns on again by itself"): fill in **Topic** with `msh/f00d00000001/status`, click the small triangle button to the right of the **Meta** button, choose **Clear Retained Message**, then answer the confirmation. Repeat for every fake device, then untick the **Retain** box that got ticked along with it.

</details>

<details>
<summary><b>Simulator: only the first line appears, without a single <code>online</code>, or <code>Cannot find …</code></b></summary>

If only the first line appears, the simulator isn't getting through to the broker, but it doesn't complain: it quietly tries again every 5 seconds. The `Cannot find …` messages are covered in the last two items.

- Stop it with **Ctrl + C**, then check the address in the command: it starts with `mqtt://`, holds the Pi's IP address (or your laptop broker's), and ends with `:1883`. The address must be the same as `MQTT_URL` in the backend's `.env`.
- Test the same address with the `clean` mode. This mode does report a failure, for example `Couldn't connect to mqtt://192.168.1.37:1883: connect ECONNREFUSED 192.168.1.37:1883`. It means that no broker answers at that address: see the collapsible section "broker not reachable yet" above.
- `Cannot find package 'mqtt'`: the `mqtt` library isn't installed in the `tools` folder yet. Run `npm install mqtt@5.16.1` in the `tools` folder (Module 11 Practice 8.1).
- `Error: Cannot find module '…device-simulator.js'`: the terminal isn't in the `tools` folder. Go in first with `cd tools` (from the root of `mini-smart-home`), then repeat the command.

</details>

<details>
<summary><b>Bruno: <code>ECONNREFUSED</code>, a red <code>{{baseUrl}}</code> address, or <code>404</code> for every request</b></summary>

- A message that contains **`ECONNREFUSED`**: the server isn't running (look at the first terminal), or `baseUrl` holds the wrong counter.
- **`{{baseUrl}}` is red**, or Bruno complains that the address isn't valid: no environment has been chosen. At the top right, change **No Environment** to **`local`**.
- **`404` for every request**, with a message such as `Route GET://health not found`: `baseUrl` ends with a slash (`http://127.0.0.1:8080/`), so the address becomes `//health`. Delete the last slash, then click **Save**.

</details>

<details>
<summary><b>Git: <code>git push</code> asks for a username and password, or is rejected</b></summary>

- **macOS, the terminal asks `Username for 'https://github.com':`**: signing in through the GitHub CLI isn't finished yet. Press **Ctrl + C**, run `gh auth login` (Practice 1.3), then `gh auth setup-git`, and repeat `git push`. GitHub doesn't accept your account password for a push.
- **Windows, the GitHub sign-in window doesn't appear again after you used the wrong account**: open Windows' **Credential Manager** (type its name in the Start menu), choose **Windows Credentials**, delete the `git:https://github.com` entry, then repeat `git push`.
- **`! [rejected] … (fetch first)`**: there's a commit on GitHub that isn't on the laptop yet. Run `git pull --no-rebase --no-edit`, then `git push` (Practice 1.5). Ran a plain `git pull` already? On Windows, close the `MERGE_MSG` tab that opened in VS Code, and the terminal carries on by itself. On macOS, if the terminal writes `fatal: Need to specify how to reconcile divergent branches.`, repeat with the command above.

</details>

<details>
<summary><b>Git: the <code>.env</code> file got committed</b></summary>

1. Make sure `.env` is listed in `backend/.gitignore` (Practice 2.4).
2. Take it out of Git without deleting the file from the laptop: `git rm --cached .env` (in the `backend` folder), then `git commit -m "Remove .env from Git"` and `git push`.
3. The file is still stored in the history of the old commits. In this module, it only holds your home broker's address, so the risk is small; but for real passwords (from Module 17 on), consider that password leaked and **change** it.

</details>

## 🔬 Technical Deep Dive (optional)

This section is for the curious. Nothing in it is required, and the next modules don't need any of it.

<details>
<summary><b>ESLint and Prettier: a bad-habit checker and a code formatter</b></summary>

On a team, two people who write code in different styles (spaces or tabs, single or double quotes, long lines or broken ones) end up "tidying" each other's code, and pull requests fill up with changes that aren't really changes. Two tools solve this:

- **Prettier** is an automatic code formatter. Its rules are agreed on once, then all the code is tidied in the same way, so reviews can focus on the content.
- **ESLint** is a checker for bad habits: variables that are never used, an `==` that should be `===`, or a Promise someone forgot to `await`. It catches the kind of mistakes that slip past the type checker.

**Try Prettier without installing it.** In the second terminal (the `backend` folder):

```text
npx prettier@3.9.10 --check src
```

`npx` downloads Prettier to a temporary place, and first asks `Need to install the following packages:` … `Ok to proceed? (y)`: type `y`, then press **Enter**. `--check` only checks; it doesn't change anything. **Expected output:**

```text
Checking formatting...
[warn] src/config/env.ts
[warn] src/routes/devices.ts
[warn] src/routes/health.ts
[warn] src/schemas/contract.ts
[warn] src/server.ts
[warn] src/services/mqtt.ts
[warn] src/services/store.ts
[warn] Code style issues found in 7 files. Run Prettier with --write to fix.
```

Every file is "wrong" because Prettier's default rules break lines at 80 characters, while this module's code uses longer lines. Want to see the tidied result? Run `npx prettier@3.9.10 --write src`, then open VS Code's **Source Control** panel (the branch icon in the left bar) and click each file to see the differences. When you've seen enough, put everything back with `git restore src` so that your code stays the same as the code of the next modules. Because `git restore` also throws away changes that haven't been committed yet, only try `--write` after all your work is committed.

**ESLint for TypeScript can't be used in this project yet.** ESLint needs `typescript-eslint` to read `.ts` files, and its newest version as of October 2026 (8.71.2) only accepts TypeScript below 6.1. This project uses TypeScript 7, so npm refuses to install it:

```text
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
…
npm error Found: typescript@7.0.2
…
npm error peer typescript@">=4.8.4 <6.1.0" from typescript-eslint@8.71.2
```

Don't "force" it with `--force` or `--legacy-peer-deps`: npm's own message calls the result `incorrect (and potentially broken)`. Projects that need ESLint today still use TypeScript 6. In this curriculum, the main checker is `npm run check`, and an automatic checking step for every pull request comes in Module 29.

</details>

<details>
<summary><b>Express for comparison</b></summary>

**Express** is the oldest and most widely used server library for Node.js: you'll find it in most tutorials. Here's the Quick Win's `GET /health`, written with Express 5.3.0:

```js
// server-express.js - the same GET /health, written with Express (for comparison)
import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Mini Smart Home backend is alive" });
});

app.listen(8081, "127.0.0.1", () => {
  console.log("Express listening at http://127.0.0.1:8081");
});
```

Want to try it? Create a separate folder, for example `learn-iot/module-16/express` (not inside `backend`). In it, run `npm init -y`, `npm pkg set type=module`, and `npm install express@5.3.0`. Save the code above as `server-express.js` in that folder, then run `node server-express.js`. Open `http://127.0.0.1:8081/health`.

The concepts are exactly the same: routes, handlers, and middleware (in Express, `app.use(…)`). The differences show as the project grows:

| | Fastify (this module) | Express |
| :--- | :--- | :--- |
| An address that doesn't exist (`/what`) | JSON: `{"message":"Route GET:/what not found",…}` | An HTML page: `Cannot GET /what` |
| Checking the content of a request | A schema in the route definition, run before the handler | Written by hand in every handler (for example by calling Zod in each one) |
| `/docs` documentation | Automatic, from the same schemas | Separate tools and separate writing |
| Logs | Built in (pino) | Extra middleware |
| TypeScript | The types of the request content come from the schema | Types written by hand |

That's why this curriculum chose Fastify. Once you understand Fastify, reading Express code won't be hard.

</details>

<details>
<summary><b>"Heavy" TypeScript: generics and a build step</b></summary>

**Generics** are types with a "fill-in". You've actually used them already in `store.ts`:

- `new Map<string, Device>()`: a cabinet whose labels are text and whose contents are `Device`s. The same `Map` could hold anything, so its fill-in is written between `<` and `>`.
- `Promise<Ack | null>`: a promise that will later be kept with an `Ack` or with `null`.
- `z.infer<typeof Vitals>`: "the type inferred from the `Vitals` schema".

Writing generic functions of your own, for example `function first<T>(list: T[]): T | undefined`, only becomes necessary when you build a library that's used with many types. For a backend like this one, using generics made by other people is enough.

A **build step** is the step that translates `.ts` into `.js` with `tsc` (usually into a `dist` folder), then runs the translated result. This step is still needed when:

- the code is published as an npm library for other people to use;
- the program has to run on an old Node.js that can't erase type labels by itself yet;
- the code uses a TypeScript feature that can't simply be erased, for example `enum` (Concept 4).

Our backend meets none of those conditions, so Node.js 24 runs the `.ts` files directly: there's no `dist` folder that can go stale, and the error lines in the log point at lines in the files you wrote. The React dashboard in Module 22 will use a tool that erases type labels in a similar way.

</details>

<details>
<summary><b>Why <code>127.0.0.1</code>, not <code>localhost</code> or <code>0.0.0.0</code></b></summary>

- **`localhost`** is a *name*, not an address. On many computers, that name can be translated into two addresses: `127.0.0.1` (IPv4) and `::1` (IPv6). If the server only listens on one of them while another program tries the other one first, the connection is refused, even though the server is clearly running. Writing `127.0.0.1` on both sides removes that doubt.
- **`0.0.0.0`** means "listen on every network of this laptop", Wi-Fi included. Phones and other laptops on the home Wi-Fi can then call your API. Windows also shows a **Windows Security Alert** window that asks whether Node.js may accept connections. The problem is that this API has no login yet: anyone on the same Wi-Fi could turn on your relay.

So, as long as the API isn't locked (logins come in Module 20), `HOST=127.0.0.1` only accepts guests from this laptop itself. If it ever needs to be opened up, changing one line in `.env` is enough.

</details>

<details>
<summary><b>Bruno CLI: every test with one command</b></summary>

The `res.status` `eq` `200` tests you put in every request can be run all at once from the terminal with the **Bruno CLI**. Before you try it, note its size: once installed, this CLI takes up about **244 MB** (more than 500 libraries), because it carries the whole Bruno engine. As with Prettier, `npx` first asks `Ok to proceed? (y)`. Also note that this command really sends `lamp on` and `lamp off`: your relay clicks too. The CLI must be run from inside the collection's folder (in the second terminal):

```text
cd bruno
npx @usebruno/cli@4.2.1 run --env local
```

**Expected output** (with the server running; an example from the author's test, right after the server restarted):

```text
health (200 OK) - 71 ms
Assertions
   ✓ res.status: eq 200
device list (200 OK) - 15 ms
Assertions
   ✓ res.status: eq 200
Node 1 latest reading (200 OK) - 7 ms
Assertions
   ✓ res.status: eq 200
lamp on (200 OK) - 75 ms
Assertions
   ✓ res.status: eq 200
lamp off (200 OK) - 11 ms
Assertions
   ✓ res.status: eq 200
Node 1 vitals (404 Not Found) - 8 ms
Assertions
   ✕ res.status: eq 200
      expected 404 to equal 200
```

Below it, a **📊 Execution Summary** table is printed: `Status ✗ FAIL`, `Requests 6 (5 Passed, 1 Failed)`, and `Assertions 5/6`. `Node 1 vitals` fails for the same reason as in 8.4: the store of a server that has just restarted hasn't received any `vitals` yet. A failed test makes the command end with exit code `1`. In Module 29, a code like this is what makes the automatic check refuse a pull request.

Without the `res.status` tests, the CLI would count even a `404` answer as "passed". That's why every request in your collection has a test. When you're done trying, go back to the `backend` folder with `cd ..`.

</details>

<details>
<summary><b>Documentation that turns straight into a Bruno collection</b></summary>

The `/docs` page is built from the raw OpenAPI document at `http://127.0.0.1:8080/docs/json`. Bruno can read that document and create one request for every route:

1. In Bruno, click **+** in the sidebar, then choose **Import collection**.
2. In the **Import Collection** dialog, open the **URL** tab, paste `http://127.0.0.1:8080/docs/json`, then click **Import**.
3. In the next step, **Name** is already filled in with `Mini Smart Home API` (from the documentation's title). Choose a **Location** outside the `mini-smart-home` repository, for example the `learn-iot/module-16` folder, then click **Import**.

The result is a new collection with requests for all the routes, complete with an example body for `POST /devices/{id}/command`. This collection doesn't have an environment with the `baseUrl` variable yet: create one as in 5.8, then fill in the `device_id` in the URL of each request. Your main collection is still the one you made yourself in `backend/bruno`, because it holds tests and examples you've already checked. The imported collection is enough to see that one source (the Zod schemas) can produce the checks, the documentation, and a test collection all at once. Remove that collection from the sidebar when you're done (right-click → **Remove**).

</details>

<details>
<summary><b>GitHub CLI: pull requests from the terminal</b></summary>

macOS users already installed `gh` in Practice 1. Windows users can install it from the same page (`gh_2.102.0_windows_amd64.msi`). With `gh`, steps 8.6–8.8 can be done from the terminal:

- `gh pr create` asks for the title and the body interactively, and can use your checklist template. **Be careful with `gh pr create --fill`**: it creates the pull request straight from the commit messages, **without** the template, so the checklist is lost.
- `gh pr view --web` opens this branch's pull request in the browser, for example for a review in the **Files changed** tab.
- `gh pr merge --merge --delete-branch` merges with a merge commit (the same as **Create a merge commit**), deletes the branch on GitHub and on the laptop, then switches to `main` and pulls the latest changes.

For learning, the GitHub page is still clearer, because you see every button and every change. Use `gh` once the workflow feels familiar.

</details>

## 🧩 Independent Challenges

Do them on a new branch, as in Practice 8: `git switch -c feature/<challenge-name>`. Every finished challenge becomes one more pull request for review practice. Levels 1 and 2 have answer keys; the complete content of both key files is in [`code/challenges/key/`](code/challenges/key/).

### Level 1 — Filter the device list (a small change)

Applications that use your API often only need the devices that are switched on. Make `GET /devices?status=online` answer only the devices that are `online`, while `GET /devices` without `?status=…` still answers all of them.

1. In the `GET /devices` route (the `devices.ts` file), add `querystring` inside `schema`, next to `summary`. `querystring` is the part of the address after the `?` sign. Its content is a Zod object with one `status` field that **may be missing**, and whose value must be one of the valid statuses.
2. In its handler, use `req.query.status` to filter `allDevices()` with `.filter(…)` (step 2 of the warm-up) before `.map(…)`.
3. Test it in Bruno: `{{baseUrl}}/devices?status=online`, `?status=offline`, and `?status=on`. The last one must be answered with `400`.

<details>
<summary><b>Level 1 answer key</b></summary>

```ts
      querystring: z.object({
        status: z.union([Status, z.literal("unknown")]).optional()
          .describe("show only devices with this status, for example online"),
      }),
```

```ts
  }, async (req) => {
    const chosen = allDevices().filter((d) => req.query.status === undefined || d.status === req.query.status);
    return chosen.map((d) => ({
```

- `.optional()` means that `status` may be left out. Without `?status=…`, `req.query.status` is `undefined`, and the filter lets every device through.
- The schema uses the same `Status` as the contract, so `?status=on` is answered with `400` and `"message":"querystring/status Invalid input"`. A guest who makes a typo is told right away, instead of getting a confusing empty list.
- Open `/docs`: the `GET /devices` route now has a `status` parameter complete with its description, without you writing it anywhere else.

</details>

### Level 2 — A history of the last 20 readings (fill in the blanks)

The backend only remembers the **last** reading. For a small chart, an application needs a few earlier readings. Keep at most the last 20 `telemetry` readings of every device in memory, then provide `GET /devices/:id/history`. Fill in every `____` below.

In **`store.ts`**, there are three places:

1. In `interface Device`, add this last line, right below `vitals: Vitals | null;`:

   ```ts
     history: (TelemetryNode1 | TelemetryNode2)[]; // at most the last 20 telemetry readings, the oldest first
   ```

2. In `getOrCreate`, a new device gets a starting history. Add `history` at the end of its object:

   ```ts
       d = { device_id: deviceId, kind: "unknown", status: "unknown", last_seen: "", telemetry: null, vitals: null, history: ____ };
   ```

3. In `saveTelemetry`, add these two lines below `d.telemetry = content;`:

   ```ts
     d.history.____(content);
     if (d.history.length > ____) d.history.____(); // drop the oldest
   ```

In **`devices.ts`**, add a new route between the `vitals` route and the `command` route:

```ts
  app.get("/devices/:id/history", {
    schema: {
      tags: ["devices"],
      summary: "At most the last 20 telemetry readings of one device (the oldest first)",
      params: IdParam,
      response: {
        200: z.object({ device_id: z.string(), history: z.____(z.union([TelemetryNode1, TelemetryNode2])) })
          .describe("the telemetry history in the server's memory"),
        404: ErrorBody.describe("that device has never been heard"),
      },
    },
  }, async (req, reply) => {
    const d = findDevice(req.params.id);
    if (d === undefined) {
      return reply.code(____).send({ message: `device ${req.params.id} has never been heard` });
    }
    return { device_id: d.device_id, history: d.history };
  });
```

Test: wait about one minute, then send `GET {{baseUrl}}/devices/<device_id Node 1>/history` from Bruno. The number of readings grows by one every 10 seconds, and stops at 20.

<details>
<summary><b>Level 2 answer key</b></summary>

The fill-ins, in order: `[]`, `push`, `20`, `shift`, `array`, and `404`.

- `history: []` is an empty list for a device that has just been heard. If you forget this line, `npm run check` refuses right away with `error TS2741: Property 'history' is missing in type …`, followed by a few follow-up messages. Fix the first message first, because the messages after it usually go away with it.
- `push` adds a reading at the back of the list, and `shift` throws away the reading at the very front (the oldest) as soon as there are more than 20. This is the same pattern as the simulator's memory of eight command `id`s (`lastIds`).
- `z.array(…)` means "a list in which every item matches this schema".
- This history still lives in memory: 20 readings × 10 seconds = about the last 3 minutes, and it's lost when the server restarts. A history of many days only makes sense once there's a database (Modules 17–18).

</details>

### Level 3 — The fan's brain moves to the backend (from scratch)

After ➕ A below, Node-RED no longer turns on the fan when the room is hot. Move that rule to the backend: **the fan turns on above 30 °C and only turns off below 28 °C** (the hysteresis of Module 13 Concept 7), just for your own Node 1.

Hints:

- Add the setting `FAN_AUTOMATION=<your Node 1's device_id>` to `.env`, and an empty `FAN_AUTOMATION=` line to `.env.example`. In `env.ts`, this setting is **not required**: if it's empty, the automation is off.
- The simplest place for the rule: `mqtt.ts`, right after `saveTelemetry(…)` in the part that handles `telemetry`. Skip Node 2's messages, other devices' messages, and `temperature` readings that are `null` (the sensor couldn't be read).
- Remember the fan state you last commanded, so that a command is only sent when the state needs to change, not every 10 seconds. Send it with `sendCommand(deviceId, makeCommandId(), { target: "fan", value: true })`, then write the result to the log.
- Test it with the simulator: set `FAN_AUTOMATION=f00d00000001`. The simulator's random temperature (25.0–33.0 °C) often crosses both limits, and the simulator's terminal writes every fan command it receives.
- Make sure ➕ A is done before you switch this automation on: two brains giving commands to the same fan will collide with each other. Module 19 later builds rules like this one more completely (the rules are stored in the database, can be changed from the dashboard, and there are safety rules on the device).

## ➕ Add-on to "Mini Smart Home"

This week, Mini Smart Home gets **backend v0.1**: a server you built yourself that listens to every device, checks every message against the data contract, and provides a documented API for turning on relays. Node-RED retires as the brain: its fan automation is switched off, while its dashboard stays in use. The data contract stays at version 1.2, because the backend only reads and sends messages in shapes that already exist.

![Project diagram of Mini Smart Home after Module 16: the brain moves to a backend you built yourself; a dashed line means optional, retired, or coming later. Top, from the left: Node 2 "Garden" v1.0.0 with its 18650 battery, unchanged, sends ESP-NOW to Node 1 "Home" v1.4.0 (sensors, relays, the Node 2 bridge, the RS-485 sensor), also unchanged. Node 1 sends MQTT to the Raspberry Pi gateway at 192.168.1.37, which holds Mosquitto, the MQTT broker, and Node-RED with the dashboard, the Garden card, and the RS-485 Sensor group; the fan automation line is struck through, faded, and dashed, with the label retired since Module 16. Node-RED keeps serving the dashboard on the phone. Middle, the green Laptop box, the backend listening at 127.0.0.1:8080, holding backend v0.1 (new) with Fastify + light TypeScript, subscribing to msh/#, data contract 1.2 as Zod schemas so that a broken message is logged as REJECTED, and an in-memory store, plus the API: GET /health, GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, POST /devices/:id/command, and GET /docs. A green msh/# arrow goes down from the gateway to the backend, and a cmd arrow goes up from the backend to the gateway. To the right of the backend, two guests over HTTP: Bruno for trying the API, and the browser for opening /docs. Middle left, the dashed simulator (optional) box: 10 fake devices on the laptop, f00d00000001 to f00d00000010, standing in for Node 1 and Node 2, connected to Mosquitto through a dashed MQTT line. Below it, an honest note: the backend runs on the laptop (127.0.0.1:8080); its data is lost when the server stops. Bottom, GitHub mini-smart-home: backend/ new (src/, bruno/, README.md), tools/device-simulator.js new, .github/pull_request_template.md new, edge/node-red-flows.json with the fan automation switched off, DATA-CONTRACT.md still 1.2, and firmware/ unchanged. Bottom right, the dashed coming-next boxes: Module 17 database, Module 19 backend automation rules, and Module 22 React dashboard.](assets/project-diagram-module-16.png)

> 🖥️ **Tools used:** the **Node-RED editor** in the laptop's browser (`http://192.168.1.37:1880`, laptop path: `http://localhost:1880`), **VS Code** with the `mini-smart-home` folder and its terminal, and a **browser** that's already signed in to GitHub.
>
> ⭐ **Required** — step D is a Module 16 completion requirement.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `backend/` | **new**: backend v0.1 (from the Quick Win to Practice 8) |
| `backend/README.md` | **new**: how to run the backend (step C) |
| `tools/device-simulator.js` | **new**: ten fake devices (Practice 7) |
| `.github/pull_request_template.md` | **new**: the review checklist (Practice 8) |
| `edge/node-red-flows.json` | the four fan automation nodes switched off (steps A and B) |

### A. Retire the Node-RED automation: only one brain

From this week on, automatic decisions are the job of the server you built yourself (Module 19). If the Node-RED automation keeps running, the home has two brains that can collide with each other. That's why the Node-RED automation is switched off, but not deleted: its nodes stay as a record, and can be switched on again anytime.

1. Open the Node-RED editor in the laptop's browser (`http://192.168.1.37:1880`, laptop path: `http://localhost:1880`), then log in if you're asked to, as in Module 13. Find the section labeled `2 · Fan automation: on > 30 °C, off < 28 °C`.
2. Select the four nodes in that section: `hysteresis 30/28`, `fan on`, `fan off`, and `only when it changes`. How: press the mouse button on an empty space, then drag a selection box around all four. You can also hold **Ctrl** (macOS: **Cmd**) while you click the four of them one by one.
3. Right-click one of the selected nodes, point to **Node**, then choose **Disable selected nodes**. The four nodes now have dashed outlines and look faded, and so do their wires.
4. Click **Deploy** at the top right (or press **Ctrl + D**).
5. Test it. The dashboard on the phone still shows the readings of Node 1 and Node 2, and the **Fan** switch can still turn the fan on by hand. Only the automatic switching on is gone: if the temperature goes above 30 °C, the fan no longer turns on by itself.

The dashboard switches also send `cmd` to Node 1. The backend hears their `ack` too, then logs `ack … arrived, but no command is waiting for it`. That's normal, because those commands came from Node-RED, not from the API. The other way around, when you turn on the lamp from Bruno, the **Lamp** switch on the phone's dashboard slides along: Node-RED hears the `ack` from Node 1 too.

### B. Export the Node-RED flows again

1. Export as in ➕ D of Module 13: main menu → **Export** → **all flows** → **formatted** → **Download**.
2. In the **Downloads** folder, rename `flows.json` to `node-red-flows.json`, then move it to **Documents → GitHub → mini-smart-home → edge** and choose **Replace the file in the destination** (macOS: **Replace**).
3. In VS Code, open `edge/node-red-flows.json`, press **Ctrl + F**, then search for `"d": true`. The result must be **4** (the marker of a node that's switched off). Also search for `password`: it must not be found even once.

### C. Notes on how to run the backend

A repository that other people look at (teammates or recruiters) needs short instructions for running your backend. In VS Code, right-click the **`backend`** folder, choose **New File…**, then create **`README.md`** with this content:

```markdown
# Mini Smart Home Backend

Backend v0.1 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.2 (Zod schemas), keeps the last state of every device in memory, and provides a documented API.

## How to run it

1. Install Node.js 24 LTS.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env`, then fill in `MQTT_URL` with the broker's address.
4. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts |
| `npm run check` | checks the TypeScript types (run it before every commit) |

## API

| Route | What it does |
| :--- | :--- |
| `GET /health` | is the server alive? connected to the broker? how many messages were received and rejected? |
| `GET /devices` | every device ever heard |
| `GET /devices/:id/latest` | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | the last health report of one device |
| `POST /devices/:id/command` | sends a `set` command to Node 1, then waits at most 5 seconds for its `ack` |

The Bruno collection for every route is in the `bruno/` folder (choose the `local` environment).

## Limits of v0.1

- The data is only kept in memory, so it's lost when the server stops. A database comes later.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API has no login yet.
```

### D. ⭐ Save to GitHub through a pull request

This ➕ work goes through the Practice 8 workflow too. In the second terminal (the `backend` folder):

```text
git switch -c feature/retire-node-red
cd ..
git add edge/node-red-flows.json backend/README.md
git commit -m "Node-RED retires as the brain, backend README (Module 16)"
git push -u origin feature/retire-node-red
cd backend
```

Then repeat steps 8.6–8.8 for this pull request: open it, review it with the checklist, then merge it with **Create a merge commit**. Some checklist items don't apply to this change, for example the new route in Bruno. Write a short note in the description ("no new route"), then tick that item. Go back to `main` with `git switch main`, `git pull --prune`, and `git branch -d feature/retire-node-red`.

Finally, in the **`learn-iot`** repository, the `module-16` folder holds `warmup.js` together with the other warm-up files. Commit and push those too, with GitHub Desktop or the terminal.

**Evidence for passing Module 16** (compare it with ✅ below): `GET /devices/<id>/latest` and `POST /devices/<id>/command` from Bruno (Practices 5–6), the `/docs` page with every route (Practices 5 and 8), and a Git history with a merged pull request (Practice 8 and step D).

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Backend** | The program on a server that works behind the scenes: it listens to devices, stores data, runs rules, and serves applications. |
| **API** (*Application Programming Interface*) | A backend's "menu and waiter": the list of requests that other programs may make, together with the shape of the answers. |
| **Route** / endpoint | A pair of a method and an address that the server serves, for example `GET /devices/:id/latest`. |
| **Handler** | The function that the server runs for one route, and that puts together its answer. |
| **Middleware** / **hook** | A function that steps into the journey of **every** request, for example the one-line logger in `server.ts`. |
| **HTTP status code** | The three-digit number in every answer: `200` success, `400` invalid request, `404` not found, `409` the situation doesn't allow it, `503` a supporting service is down, `504` no answer within the time limit. |
| **Port** (counter) | The number of a "counter" on a computer, where a server waits for guests. This backend uses `8080`. |
| **`127.0.0.1`** | The address of "this laptop itself". A server that listens at this address can only be reached from the same laptop. |
| **Fastify** | The HTTP server library for Node.js used in this module; routes, schemas, logs, and plugins are already built into it. |
| **Fastify plugin** | A function that receives `app`, then registers a group of routes; it's added with `app.register(…)`. |
| **Light TypeScript** | JavaScript plus type labels (`: number`, `interface`). Node.js 24 just erases the labels, then runs the rest (*type stripping*). |
| **Type checker** (`tsc`, `npm run check`) | A program that reads the type labels and refuses code that doesn't match, **before** the code runs. Node.js itself doesn't check type labels. |
| **`tsconfig.json`** | The type checker's settings: how strict it is, which folders it checks, and which rules must be the same as in Node.js 24. |
| **`.env` / `.env.example`** | `.env` holds your own settings and secrets, and never goes into Git. `.env.example` is its example without the secrets, and it does go into Git. |
| **devDependencies** | Libraries that help with development, for example the type checker and the log formatter, and that aren't part of the program's core. The pino-pretty log formatter is still loaded every time the server starts on the laptop. |
| **Zod** / **schema** | A library for writing the valid shape of data as code. Its schemas check messages, produce TypeScript types, and become the documentation. |
| **Validation** | Checking data that comes from outside (a device or an API guest) against rules, before that data is trusted. |
| **OpenAPI** / **Swagger UI** | OpenAPI is a standard format for describing an API. Swagger UI turns an OpenAPI document into a `/docs` page where you can try things out. |
| **Bruno** | An app for trying out APIs. Each of its requests is saved as a text file in the collection's folder, so it can go into Git. |
| **Bruno environment** | The set of variables of a Bruno collection, for example `baseUrl`, so that the server's address only has to be written in one place. |
| **Test** (*assert*) | An automatic check of an answer, for example `res.status` `eq` `200`. |
| **Simulator** | A program that pretends to be many devices and speaks exactly as the data contract says, so that the backend can be tested without boards. |
| **Branch** | A separate line of work in a Git repository. Changes on a branch don't touch `main` until they're merged. |
| **Pull request** | A request to merge a branch into `main`, complete with a page for reading its changes, commenting, and deciding. |
| **Review** | Reading someone else's changes carefully (ideally with a checklist) before those changes are merged. |
| **Merge** / **merge commit** | Joining one branch into another. A merge commit is a special commit that records that joining. |
| **Upstream** (`git push -u`) | The pairing of a branch on the laptop with a branch on GitHub, so that later `git push` and `git pull` commands know where to go. |
| **Pull request template** | The `.github/pull_request_template.md` file, whose content shows up automatically in the description of every new pull request. |

## 📝 5-Question Quiz

1. You write `const temperature: number = "28";` in `server.ts`, then save it. What happens to the server that's running with `npm run dev`? How will this mistake be found?
2. Name the status code that the backend answers for each of these events, and explain what the code means: (a) the request body `{"target":"pump","value":30}`; (b) a URL with a `device_id` that has never been heard; (c) Node 1's power was cut 5 seconds ago; (d) Node 1's power was cut 2 minutes ago.
3. A friend's Node 1, whose sensor is broken, sends `telemetry` with `"humidity": 171`. What does the backend do with that message, and where can you see it? Why is that better than simply storing the message?
4. Why is the broker's address written in `.env`, and not directly in `env.ts`? If `.env` holds a password and gets committed and pushed by accident, what do you have to do?
5. Put these steps for building a feature in order: (a) `git push -u origin feature/x`; (b) merge with **Create a merge commit**; (c) `git switch -c feature/x`; (d) review with the checklist; (e) `git switch main`, then `git pull --prune`; (f) write the code, test it, and commit; (g) open a pull request. Then explain one reason why teams don't commit straight to `main`.

<details>
<summary><b>Answer key</b></summary>

1. The server **keeps running**: `--watch` restarts it, and Node.js only erases the `: number` label without checking it (Concept 4). The mistake is found in two places: VS Code underlines it with a red line, and `npm run check` refuses with `error TS2322: Type 'string' is not assignable to type 'number'.` That's why `npm run check` is the first item of the pull request checklist.
2. (a) **`400`**: the body breaks the schema (the pump's `value` is 10 at most), so it's refused before anything is sent. (b) **`404`**: that device isn't in the store. (c) **`504`**: the broker doesn't know yet that Node 1 is off, so the command is sent, but there's no `ack` within 5 seconds. (d) **`409`**: the broker has already published the `offline` last will (after about 22.5 seconds without news), so the backend doesn't try to send anything (Practice 6.5).
3. The backend **rejects it**: the terminal writes `REJECTED msh/<device_id>/telemetry: humidity: …` with the reason, the `rejected` number in `/health` goes up by one, and the message doesn't get into the store. The old reading stays the last valid reading. If broken messages were stored, that impossible number would show up in the API and in charts, and would later drive automation rules (Concept 7, Practice 4).
4. `.env` never goes into Git (it's listed in `.gitignore`), so addresses and passwords don't spread to GitHub. Every laptop or server can also use its own settings without changing the code. If it happened anyway: take it out of Git with `git rm --cached .env`, make sure `.env` is in `.gitignore`, then commit and push. The file is still stored in the history of the old commits, so **change the password**: consider the old password leaked (🚨).
5. The order is **c → f → a → g → d → b → e**. A reason, for example: `main` must always hold a version that works, so every change is checked by a second person (or the checklist) first; several people can work on different features without getting in each other's way; and the pull request history explains why a change was made.

</details>

---

## ✅ Module 16 Completion Checklist

The completion requirement from the Syllabus: **`GET /devices/<id>/latest` in Bruno returns the latest readings as JSON, `POST …/command` turns on the relay and its `ack` is recorded, `/docs` shows all the endpoints, and your Git history shows one merged pull request.** **The simulator path** (no Node 1 with a relay yet): the ⭐ items of Practices 5 and 6 may be ticked with the fake device `f00d00000001`, as long as its latest reading shows up and its command is answered with `200` and a recorded `ack`. The Practice 3 and 7 items that mention Node 1 and Node 2 may also be ticked with fake devices. The "turns on the relay" item is proven once you have your Node 1 and your relay.

- [ ] The JavaScript warm-up is done, and I've checked my answers against its key (🔁).
- [ ] My first server answers `/health` in the browser, and restarts by itself when code is saved (Quick Win).
- [ ] Git is installed, and I've made a commit and a push from the terminal (Practice 1).
- [ ] `npm run check` passes, and I can explain why the server keeps running even with a type error (Practice 2).
- [ ] `.env` isn't on GitHub, while `.env.example` is (Practice 2).
- [ ] `GET /devices` shows Node 1 and Node 2 with their statuses (Practice 3).
- [ ] Broken messages from MQTTX are logged as `REJECTED` with a clear reason, and the `rejected` number in `/health` goes up (Practice 4).
- [ ] ⭐ `GET /devices/<id>/latest` in Bruno returns Node 1's latest reading as JSON, and the `res.status` test of every Bruno request passes (Practice 5).
- [ ] ⭐ `/docs` shows all five routes: `/health`, `/devices`, `/devices/{id}/latest`, `/devices/{id}/vitals`, and `/devices/{id}/command` (Practices 5 and 8).
- [ ] ⭐ `POST /devices/<id>/command` from Bruno turns on the lamp relay, and its `ack` is recorded in the answer and in the backend's log (Practice 6).
- [ ] I can explain the difference between `504` and `409` after Node 1 is unplugged (Practice 6.5).
- [ ] The simulator runs ten fake devices, and the backend serves all of them together with Node 1 and Node 2 (Practice 7).
- [ ] ⭐ My Git history (`git log --oneline --graph`, or the **Pull requests** tab → **Closed** on GitHub) shows the merged `feature/vitals` pull request (Practice 8).
- [ ] The Node-RED fan automation is switched off, the flows are exported, and `backend/README.md` exists (➕ A–C).
- [ ] ⭐ All the Module 16 work is on `main` of the `mini-smart-home` repository on GitHub (➕ D).

🎉 **Phase 3 has begun.** Mini Smart Home now has a server you built yourself: it listens to every device, rejects data that breaks the contract, and serves a documented API. Its data is still lost every time the server stops. Storing it permanently is the next module's job.

> ➡️ **Next module:** Module 17 — Your First Database: SQL Basics & the "Mini Smart Home" Schema (PostgreSQL via Docker). The backend gets a long-term memory: every reading that passes the contract check is stored in a database, so its history stays even when the server restarts.

---

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- Node.js 24: [Modules: TypeScript](https://nodejs.org/docs/latest-v24.x/api/typescript.html) (type stripping, erasable syntax, imports ending in `.ts`) and [command-line options](https://nodejs.org/docs/latest-v24.x/api/cli.html) (`--env-file`, `--watch`). TypeScript: [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) (`erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `noEmit`) and the TypeScript 7 announcement on the [TypeScript blog](https://devblogs.microsoft.com/typescript/).
- [Fastify](https://fastify.dev/docs/latest/) 5.12.7: Routes, *Validation and Serialization*, Hooks, Logging, Plugins, and *Type Providers*; [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) 7.0.0; [@fastify/swagger](https://github.com/fastify/fastify-swagger) 9.9.2 and [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) 6.1.2 (which brings Swagger UI 5.32.6); [pino](https://getpino.io) and [pino-pretty](https://github.com/pinojs/pino-pretty) 13.2.0.
- [Zod](https://zod.dev) 4.6.7: schemas, `z.strictObject`, `z.iso.datetime`, `z.discriminatedUnion`, `.refine`, `z.infer`, and the language of the error messages (`z.locales.en()`). [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1. [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3) 3.0.3.
- HTTP status codes: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) (*HTTP Semantics*) and [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status).
- [Bruno](https://docs.usebruno.com) 4.2.1 and its source code at [github.com/usebruno/bruno](https://github.com/usebruno/bruno) (the YAML collection format, environments, *Assert*, *Clone Request*, OpenAPI import, and the [Bruno CLI](https://www.npmjs.com/package/@usebruno/cli)).
- Git: the [official documentation](https://git-scm.com/docs) (`git switch`, `git push`, `git pull`, `git branch`, `git log`), [Git for Windows](https://gitforwindows.org) 2.56.0 and [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager), the [Xcode Command Line Tools](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools/) (Apple), and [GitHub CLI](https://cli.github.com/manual/) 2.102.0.
- GitHub Docs: [*Creating a pull request*](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request), [*Reviewing proposed changes in a pull request*](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request), [*Merging a pull request*](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request), and [*Creating a pull request template for your repository*](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository).
- Node-RED 5.0.8: [*Editor: Nodes*](https://nodered.org/docs/user-guide/editor/workspace/nodes) (disabling nodes) and [*Editor: Flows*](https://nodered.org/docs/user-guide/editor/workspace/flows).
- For comparison in 🔬: [Express](https://expressjs.com) 5.3.0, [Prettier](https://prettier.io) 3.9.10, [ESLint](https://eslint.org) 10.13.0, and [typescript-eslint](https://typescript-eslint.io) 8.71.2 (its TypeScript version requirement from the npm registry).

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-16`, `backend-restaurant-waiter`, `command-ack-flow`, `git-branch-pr`, `project-diagram-module-16` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The command flow from this module's backend code and data contract 1.2; the Git workflow from the Git and GitHub documentation above. | CC BY 4.0 |
| `swagger-docs.png`, `swagger-try-latest.png` | Real screenshots of the `/docs` page of this module's backend (Swagger UI 5.32.6 through @fastify/swagger-ui 6.1.2) on the author's laptop: the list of routes, the `POST /devices/{id}/command` route, and the `GET /devices/{id}/latest` route tried with **Try it out** (the Practice 5 stage); cropped and rearranged, with title, numbers, and captions by the author. | Swagger UI is licensed Apache 2.0; @fastify/swagger-ui (the Fastify logo in the top bar) is licensed MIT; image: CC BY 4.0 |

**About the Expected output boxes.** All of this module's backend code, including each of its stages in the `code/stages/` folder, has been checked with `npm run check` (TypeScript 7.0.2) and run with Node.js 24.21.0 on Windows. The output of the server, the Bruno CLI, the simulator, and `git` was recorded on the author's laptop, with a local MQTT broker, a mock Node 1 and Node 2 that send messages exactly as the data contract says, and a test Git repository. The broker's address, the `device_id`s, and the times were rewritten to match this module's examples (Pi `192.168.1.37`, WIB). The `remote:` lines from GitHub and the steps on GitHub's pages were written from GitHub's official documentation (October 2026), not from screen recordings. The real Node 1's answers (the relay clicking, the `vitals` numbers) are **examples** with reasonable numbers; the numbers on your screen will be different.

---

[⬅️ Module 15](../../phase-2-connectivity/module-15-modbus-rs485-and-protocols/README.md) · [Phase 3](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 17 — Your First Database** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-17--your-first-database-sql-basics--the-mini-smart-home-schema-postgresql-via-docker))
