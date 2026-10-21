# Module 19 — Realtime, Two-Way Control, Automation Rules (Cloud & Local), & Notifications

🌐 **English** · [Bahasa Indonesia](../../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md)

*Phase 3 · Week 19 · Hardware: **Kit A + B** (Node 1 and the Pi gateway from Modules 12–15) **or just a laptop** (a new version of the Module 16 simulator, and Wokwi) · Prerequisites: **Module 18** (backend v0.3 and the `smarthome` database with TimescaleDB) · Time: 9–11 hours, spread over the week*

[⬅️ Module 18](../module-18-timescaledb/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 20 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-20--user-security-login-jwt-in-cookies-roles--api-protection)

---

Your backend now has a good memory: every reading is stored in the database, summarized per hour, and dropped by itself after 90 days, and there's a backup that's proven to restore. But it's still **passive**. New readings only show up in the browser when someone presses refresh. Commands can be sent through the API, but nothing decides when the fan should turn on. Since the Node-RED fan automation was retired in Module 16, **nothing at all turns the fan on automatically**. If the living room temperature rises to 33 °C while you're away from home, you only find out when you open the dashboard. Worse still, if the laptop goes off or the Pi's LAN cable comes loose, the house loses its brain completely.

This week the backend learns to **react**. Data flows to the screen as soon as it arrives, commands from the server reach the device with a confirmation, automation rules can be changed without touching the code, Node 1 keeps guarding the house when the server can't be reached, and your phone receives alerts through Telegram.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| New readings only show up after the page is refreshed. | Over HTTP, the client always does the asking; the server can't start a conversation. | **WebSocket through Socket.IO**: the server pushes readings as soon as they arrive, with one room for each device (Concepts 1–2, Practice 1) |
| The server doesn't know for sure whether the fan is on. | The actuator state only comes along in the `ack`, while the firmware also changes the actuators by itself. | The **command → ack → timeout** pattern and **the desired state versus the reported state**; `telemetry` carries `state` in data contract 1.3 (Concepts 3–4, Practice 2) |
| Nothing turns the fan on automatically. | The Node-RED automation has been retired, and the backend doesn't have a brain yet. | A **rules engine**: "if the temperature is above 30 °C for 2 minutes, turn on the fan; turn it off below 28 °C" (Concept 5, Practice 3) |
| Changing the temperature threshold means changing the code and then restarting. | The rules are written inside the code. | Rules are stored in the `rules` table and changed through the **`/rules`** API, in effect right away (Concept 7, Practice 4) |
| The morning watering depends on a human remembering it. | The backend doesn't have a scheduler yet. | **node-cron**: "water for 10 seconds every day at 06:00 WIB" (Concept 8, Practice 5) |
| You only find out about a problem when you open the dashboard. | There are no notifications yet. | A **Telegram bot** (grammY) that sends alerts within 10 seconds and answers `/status`, without flooding your phone (Concept 9, Practice 6) |
| If the broker (on the laptop or on the Pi) or the Pi's network goes down, nothing guards the house. | Every automatic decision is made on the server. | **Local safety in the firmware** of Node 1 v1.5.0: the latest threshold is stored in NVS, and Node 1 controls its fan by itself after 2 minutes without the broker (Concept 10, Practice 7) |
| The rule logic has never been tested automatically. | There are no unit tests yet. | **Vitest**: 10 unit tests for the rules engine (Concept 6, Practice 3) |

By the end of the week, changing the temperature threshold through the API **immediately changes how the fan behaves, without restarting the server**, Node 1 **keeps reacting when the broker is turned off**, and your Telegram **receives an alert within 10 seconds**. Those are the three pass requirements of this module. The backend goes up to **v0.4**, the Node 1 firmware to **v1.5.0**, and the data contract to **1.3**.

![Module 19 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 3 Backend and data, Modules 16 to 21, is highlighted with a green frame. Modules 1 to 18 are marked done, Modules 20 and 21 are green, and Module 19 is marked YOU ARE HERE with the note: the house starts reacting, that is, live data, automation rules, Telegram, and local safety. Below that, the box for this week's Module 19, 9 to 11 hours spread out; Kit A + B or just a laptop, continuing directly from Module 18 with backend v0.3 and the smarthome database. The list of activities: the JavaScript warm-up, that is, Map, pure functions, assert, and setTimeout; Quick Win, live data in the terminal; Practice 1, live data through Socket.IO with one room per device; Practice 2, one door for commands, and the device state; Practice 3, the rules brain and 10 unit tests; Practice 4, rules in the database changed through the API, with the pass requirement change the threshold without a restart; Practice 5, a morning watering schedule with node-cron; Practice 6, a Telegram bot with good manners, with the pass requirement an alert in 10 seconds at most; Practice 7, local safety on Node 1, with the pass requirement keeps reacting when the broker is off; Practice 8, the pass test, and save to the branch; and the Add-on, backend v0.4, firmware v1.5.0, data contract 1.3, and a pull request to main. Practices 3, 4, 6, 7, 8, and the Add-on are marked with a star, required to pass. Note at the bottom: three paths, that is, the device (Node 1 and the Pi gateway), the laptop (a broker on the laptop and the Module 19 simulator), or the Node 1 firmware in Wokwi; the Telegram bot is made with your own Telegram account, for free, through @BotFather in Practice 6.](assets/roadmap-module-19.png)

> [!NOTE]
> **How to use this module.**
>
> - **There are three paths; pick the one that fits your equipment.** **The device path**: a real Node 1, the Pi gateway, and the Mosquitto broker on the Pi (Modules 12–15). **The laptop path**: a broker on the laptop, and the Module 19 version of the device simulator in place of Node 1. **Firmware in Wokwi**: Node 1 v1.5.0 is tried in the Wokwi simulator through a public broker; outside Practice 7, readers on this path follow the laptop path. Every step names its path when the way to do it is different. The simulator commands are written with the laptop broker's address (`mqtt://127.0.0.1:1883`). The device path, which also uses the simulator in Practices 1–6, replaces it with your Pi's address, for example `mqtt://192.168.1.37:1883`.
> - **The 🖥️ box of every practice names its tools**: the **VS Code terminal** (in the `backend` or `tools` folder), **psql** (the SQL window inside the database container), **DBeaver**, **Bruno**, the browser, **Telegram** on your phone or laptop, Arduino IDE, or Wokwi. Node 1's `device_id` `a4cf12e5b7c0` and the Pi's address `192.168.1.37` are only examples; use your own.
> - **A direct continuation of Module 18.** The `smarthome-db` container, the `smarthome` database, the DBeaver connection, and backend v0.3 on the `main` branch are used again as they are.
> - **The Expected output boxes.** The author ran all of this module's commands and code on a Windows laptop with Node.js 24, a small MQTT broker on the laptop (aedes, which, like Mosquitto on a laptop, doesn't keep retained messages when it restarts), the device simulator, and Wokwi. The Telegram bot was tried through a mock Telegram server on the author's laptop, because a real bot needs a personal Telegram account; the steps for creating a bot are taken from Telegram's official documentation. The times, command `id`s, and response times (in milliseconds) on your screen may be different, so outputs like those are marked **example**. The shape of the output is the same.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in VS Code, DBeaver, the browser, and Bruno. **Except in the terminal:** stopping a running program is still **Ctrl + C**. Terminal commands are exactly the same on Windows and macOS, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **From this week on, actuators can move by themselves.** The fan, the lamp, and the pump are turned on by rules, schedules, or local safety, not only by you. While you try things out, keep your hands and cables away from the fan, and make sure the pump hose goes into a container.
> 2. **The Telegram bot token is your bot's key.** Anyone who holds it can send messages in your bot's name. Keep it only in the `.env` file (which doesn't go into Git), don't commit it, don't paste it in a group, and revoke it through @BotFather if it has already leaked.
> 3. **One actuator, one main brain.** Make sure the Node-RED fan automation from Module 13 stays off (Module 16 ➕ A retired it). If two brains control the same fan, the fan can keep turning on and off, back and forth.
> 4. **A `set` command is never sent retained.** Only `config` (the thresholds) may be retained, as the data contract says. A `set` command stuck on the broker is delivered again every time the device connects, and carried out again every time the device restarts (its memory of `id`s is empty).
> 5. **The shape of the tables is still changed only through migration files**, as in Modules 17–18.

This module follows the same rhythm as Modules 1–18. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🏆 Quick Win: live data in the terminal (20 minutes)](#-quick-win-live-data-in-the-terminal-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 WebSocket](#1-websocket-a-phone-call-not-a-mailbox) · [2 Rooms](#2-rooms-one-channel-for-each-device) · [3 Command → ack](#3-command--ack--timeout-a-command-that-knows-its-fate) · [4 Desired & reported](#4-desired-state-versus-reported-state) · [5 Rules engine](#5-the-rules-engine-rules-as-data-not-code) · [6 Unit tests](#6-unit-tests-checking-the-rules-brain-without-a-device) · [7 Rules in the database](#7-rules-in-the-database-changed-through-the-api-in-effect-right-away) · [8 Scheduling](#8-scheduling-an-alarm-clock-for-the-server) · [9 Telegram](#9-telegram-notifications-important-fast-and-not-chatty) · [10 Local safety](#10-local-safety-node-1-guards-the-house-when-the-server-is-gone)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Socket.IO](#practice-1--live-data-through-socketio-40-minutes) · [2 Commands & state](#practice-2--one-door-for-commands-and-the-device-state-45-minutes) · [3 Rules brain & unit tests](#practice-3--the-rules-brain-and-10-unit-tests-60-minutes) · [4 Rules through the API](#practice-4--rules-in-the-database-changed-through-the-api-60-minutes) · [5 Schedule](#practice-5--a-morning-watering-schedule-25-minutes) · [6 Telegram](#practice-6--a-telegram-bot-with-good-manners-60-minutes) · [7 Local safety](#practice-7--local-safety-on-node-1-60-minutes) · [8 Pass test](#practice-8--the-pass-test-and-save-to-the-branch-30-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-19-completion-checklist)

## 🎯 After this module you can…

1. **Explain the difference between HTTP polling and WebSocket**, then **stream live readings** (straight away, as soon as they arrive) from the backend to the terminal through Socket.IO, with one room for each device.
2. **Send every command through one door** (the API, rules, schedules, and Telegram) with the command → ack → timeout pattern, and **compare the state the server wants with the state the device reports**.
3. **Write a data-driven rules engine** ("above 30 °C for 2 minutes", hysteresis 30/28) as pure functions, then **test it with 10 Vitest unit tests**.
4. **Store rules in the database and change them through the API**, so that a new temperature threshold applies right away, **without restarting the server**.
5. **Schedule commands by the WIB clock** (WIB = Western Indonesia Time, UTC+7) with node-cron, for example watering for 10 seconds every day at 06:00.
6. **Build a Telegram bot** that sends alerts **within 10 seconds** and answers `/status`, without flooding your phone.
7. **Add local safety to the Node 1 firmware v1.5.0** (the threshold from a retained `config` is stored in NVS, offline mode after 2 minutes) and prove that Node 1 **keeps reacting when the broker is turned off**.
8. **Record who turned on what, and when**, in the `commands` and `events` tables, and update the data contract to **version 1.3**.

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **Your Module 18 results** | Docker Desktop with the **`smarthome-db`** container running, the `smarthome` database (migrations 001–005), the DBeaver connection, and **backend v0.3**, merged into `main` in Module 18 ➕ B. |
| **Node.js 24, VS Code, Git, Bruno** | The same as in Modules 16–18. |
| **An MQTT broker** | **The device path:** Mosquitto on the Pi (Module 12). **The laptop path:** the Mosquitto service on the laptop (Module 12 Practice 7). Practice 7.10 later moves it into a VS Code terminal for a while and then stops it, so use a broker that you're allowed to turn off. |
| **A source of readings** | **The device path:** Node 1 (and Node 2 if you have it) from Modules 14–15, plus the device simulator in the `tools` folder for one extra device in Practices 1–6. **The laptop path:** just the device simulator. The Module 19 version of the simulator is copied from the curriculum in Practice 2. |
| **MQTTX** | From Module 11, for peeking at MQTT messages and publishing them by hand. |
| **A Telegram account** | On your phone or in the Telegram app on your laptop, for creating a bot through @BotFather (Practice 6). Free. |
| **For the Node 1 firmware v1.5.0** (Practice 7) | **The device path:** Arduino IDE 2 with the **esp32 3.x** package and the Node 1 libraries from Modules 10–15. **Without a device:** a browser for **Wokwi**, as in the earlier firmware modules. |
| **An internet connection** | For `npm install` (Socket.IO, node-cron, grammY, Vitest; the backend's `node_modules` folder grows by about 45 MB) and for the Telegram bot. |

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, and the `learn-iot` repository folder.

As in Modules 16–18, the Phase 3 modules open with a JavaScript warm-up. This week's rules brain, Telegram reminder, and device-state recorder use five small skills: a **`Map`** as a notebook per device, **pure functions** that take the time as a number, checking results with **`assert`**, delaying and canceling work with **`setTimeout`** and **`clearTimeout`**, and all of them together to decide **when to send a message**. This warm-up goes over all five in one small file. Type the code yourself (don't copy and paste), run it after every step, then compare the output.

**Prepare the folder.** Open the **`learn-iot`** repository folder in VS Code, first click the empty space in the Explorer panel, create a new folder **`module-19`**, then run this in the terminal:

```text
cd module-19
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` is needed because this file uses `import` (the same as in the Module 16–17 warm-ups). Then create the file **`warmup.js`** in the `module-19` folder.

### Step 1 — `Map`: a notebook per device

The backend needs to remember things **for each device**: the last reading, the last wish, the commands still waiting, and the warning timers. A **`Map`** is a container of **key → value** pairs, like the object used as a dictionary in Module 18, but made especially for records that grow and shrink while the program runs. Type this in `warmup.js`:

```js
// warmup.js - a JavaScript warm-up again before Module 19
import assert from "node:assert/strict";

// 1. Map: a notebook per device
const latest = new Map();
latest.set("a4cf12e5b7c0", { temperature: 28.5, fan: false });
latest.set("f00d00000001", { temperature: 31.2, fan: true });
console.log("number of devices:", latest.size);
console.log(latest.get("a4cf12e5b7c0"));
console.log(latest.has("f00d00000099"), latest.get("f00d00000099") ?? "has never sent anything");
for (const [id, reading] of latest) {
  console.log(`${id}: ${reading.temperature} °C, fan ${reading.fan ? "on" : "off"}`);
}
```

Save (**Ctrl + S**), then run it in the terminal:

```text
node warmup.js
```

**Expected output:**

```text
number of devices: 2
{ temperature: 28.5, fan: false }
false has never sent anything
a4cf12e5b7c0: 28.5 °C, fan off
f00d00000001: 31.2 °C, fan on
```

- **`set(key, value)`** stores, **`get(key)`** fetches, **`has(key)`** asks "is it there?", and **`size`** counts the entries. `get` for a key that doesn't exist gives `undefined`, so **`??`** (Module 17) gives it a friendly replacement.
- **`for (const [id, reading] of latest)`** goes from pair to pair. The square brackets in front take every pair apart into two variables.
- The `import assert …` line at the top isn't used yet; it's waiting for step 3.

### Step 2 — Pure functions: the time comes in as a number

The rule "temperature above 30 °C **for 2 minutes**" needs a clock. If a function reads the clock itself with `Date.now()`, its result changes every time it runs, and it's hard to check. The way out: the time is **passed in as a number** (milliseconds) by the caller. A function whose result depends only on its inputs is called a **pure function**. Add this at the very bottom:

```js
// 2. A pure function: the clock is passed in as a number (milliseconds)
function lastedFor(since, now, seconds) {
  return since !== null && now - since >= seconds * 1000;
}
console.log(lastedFor(0, 119_000, 120), lastedFor(0, 120_000, 120), lastedFor(null, 999_000, 120));
```

**Expected output** (the new line):

```text
false true false
```

- `since` is the moment the temperature started to be above the threshold, and `now` is the current time, both in milliseconds. At `119_000` (second 119), the function answers `false`; at exactly second 120, `true`.
- The underscore in `119_000` is only a thousands separator to make it easier to read; JavaScript ignores it.
- A `since` of `null` means "not counting yet", so the answer is always `false`.

### Step 3 — Checking with `assert`

Checking results by eye (`false true false`) gets tiring fast. It's better to let the program check them. Node.js's built-in **`assert`** module does exactly that: if the result is as expected, it stays quiet; if not, it stops the program with an error. This is the simplest form of a **unit test** (Concept 6). Add:

```js
// 3. Checking with assert
assert.equal(lastedFor(0, 120_000, 120), true);
assert.equal(lastedFor(0, 119_999, 120), false);
assert.deepEqual(latest.get("f00d00000001"), { temperature: 31.2, fan: true });
console.log("all checks passed");
```

**Expected output** (the new line):

```text
all checks passed
```

- **`assert.equal(result, expected)`** checks two simple values. **`assert.deepEqual`** checks the contents of objects all the way down: two objects created separately still count as equal if their contents are the same.

Now make one check that's wrong on purpose. In the second check (`lastedFor(0, 119_999, 120)`), change `false` to `true`, save, then run it again.

**Expected output** (shortened; the file path on your screen will be different, and the line number may shift if you don't leave one empty line between the steps):

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

false !== true

    at file:///…/module-19/warmup.js:23:8
```

The program stops at the failed check, and the message names the result it got (`false`), the expected one (`true`), and the line number (`23`). The line `all checks passed` isn't printed. Change that `true` back to `false` before you continue.

### Step 4 — Delaying and canceling: `setTimeout` and `clearTimeout`

A device that disconnects and reconnects briefly doesn't need to wake anybody up. The backend delays the `offline` alert for 60 seconds, and **cancels it** if the device comes back before the time is up (Concept 9). Here the delay is shortened to 2 seconds. Add:

```js
// 4. Delaying and canceling: setTimeout and clearTimeout
const timers = new Map();
function deviceOffline(id) {
  console.log(`${id} offline, wait a moment...`);
  const t = setTimeout(() => {
    timers.delete(id);
    console.log(`WARNING: ${id} offline for more than 2 seconds`);
  }, 2000);
  timers.set(id, t);
}
function deviceOnline(id) {
  const t = timers.get(id);
  if (t === undefined) return;
  clearTimeout(t);
  timers.delete(id);
  console.log(`${id} back online, warning canceled`);
}
deviceOffline("a4cf12e5b7c0");
deviceOffline("f00d00000001");
setTimeout(() => deviceOnline("a4cf12e5b7c0"), 500);
```

**Expected output** (the new lines; the last two appear after a delay of half a second and of two seconds):

```text
a4cf12e5b7c0 offline, wait a moment...
f00d00000001 offline, wait a moment...
a4cf12e5b7c0 back online, warning canceled
WARNING: f00d00000001 offline for more than 2 seconds
```

- **`setTimeout(fn, ms)`** schedules a function to run later, then immediately returns a "ticket". The program doesn't stop to wait.
- The tickets are kept in the **`timers`** `Map`, one for each device. **`clearTimeout(ticket)`** cancels that schedule. Node 1 (`a4cf12e5b7c0`) comes back after half a second, so its warning is canceled. The device `f00d00000001` doesn't come back, so its warning is printed after 2 seconds.
- Node.js only finishes after every schedule that hasn't been canceled has run. That's why the program now runs for about two seconds.

### Step 5 — When should we send a message?

The last step puts everything together into the Telegram *debouncing* rule (Concept 9): notify when the situation **changes**, stay quiet as long as it stays safe, and as long as it stays dangerous, send a reminder **at most once every 30 minutes**. Add:

```js
// 5. When should we notify?
const THIRTY_MINUTES = 30 * 60_000;
function shouldNotify(danger, dangerBefore, lastNotified, now) {
  if (danger !== dangerBefore) return true; // the situation changed: always notify
  if (!danger) return false; // still safe: stay quiet
  return now - lastNotified >= THIRTY_MINUTES; // still dangerous: at most once every 30 minutes
}
console.log(
  shouldNotify(true, false, 0, 0),
  shouldNotify(true, true, 0, 10 * 60_000),
  shouldNotify(true, true, 0, 30 * 60_000),
  shouldNotify(false, true, 0, 31 * 60_000),
  shouldNotify(false, false, 0, 99 * 60_000),
);
```

**Expected output** (the whole output):

```text
number of devices: 2
{ temperature: 28.5, fan: false }
false has never sent anything
a4cf12e5b7c0: 28.5 °C, fan off
f00d00000001: 31.2 °C, fan on
false true false
all checks passed
a4cf12e5b7c0 offline, wait a moment...
f00d00000001 offline, wait a moment...
true false true true false
a4cf12e5b7c0 back online, warning canceled
WARNING: f00d00000001 offline for more than 2 seconds
```

- The five answers of `shouldNotify`, from the left: the temperature **starts** to get hot (notify); still hot, only 10 minutes since the last message (quiet); still hot, 30 minutes now (remind again); **back** to cool (notify); still cool (quiet).
- Look at the order: the step 5 line is printed **before** the two step 4 messages, even though its code is further down. The step 4 messages are only printed after their delays run out, while step 5 runs right away. The backend works the same way: new readings keep being processed while a delayed alert waits its turn.

**Test yourself (10 minutes).** Without looking at the key:

1. Node 1's fan has been turned on. Update Node 1's record in `latest` so that `fan` becomes `true` **without** typing its temperature again. What is `latest.size` afterwards?
2. The temperature starts to be hot at second 5 (`since` = `5_000`). What does `lastedFor` answer at `125_000` and at `124_999`, with a limit of 120 seconds?
3. The last message was sent at minute 5, and the situation is still dangerous. What does `shouldNotify` answer at minute 34 and at minute 35?

<details>
<summary>Self-test answer key</summary>

```js
// test 1: update one field with spread (Module 17)
latest.set("a4cf12e5b7c0", { ...latest.get("a4cf12e5b7c0"), fan: true });
console.log(latest.get("a4cf12e5b7c0"), latest.size);

// test 2: two minutes since second 5
console.log(lastedFor(5_000, 125_000, 120), lastedFor(5_000, 124_999, 120));

// test 3: a reminder at most once every 30 minutes
console.log(shouldNotify(true, true, 5 * 60_000, 34 * 60_000), shouldNotify(true, true, 5 * 60_000, 35 * 60_000));
```

1. The result is `{ temperature: 28.5, fan: true }` and `2`. `set` with a key that already exists **replaces** its value instead of adding a new record.
2. The result is `true false`: 125,000 − 5,000 = 120,000 milliseconds, exactly 2 minutes; one millisecond earlier isn't enough yet.
3. The result is `false true`: at minute 34, only 29 minutes have passed since the last message, and at minute 35 it's a full 30 minutes.

</details>

The warm-up is done. The `warmup.js` file goes to GitHub along with your learning notes in ➕ D.

> ➡️ **Continue** to [🏆 Quick Win](#-quick-win-live-data-in-the-terminal-20-minutes).

## 🏆 Quick Win: live data in the terminal (20 minutes)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder) with **three terminals** (the backend, the simulator for the laptop path only, and the small terminal), **Docker Desktop**, and an MQTT broker (Mosquitto on the Pi, or the Mosquitto service on the laptop from Module 12). The readings come from a real Node 1 or from the Module 16 simulator.

In 20 minutes, sensor readings show up in the terminal **as soon as they reach the backend**, without asking even once. Backend v0.3 only gets one small file and four lines added.

### Step 1 — Prepare the branch and start what you need (4 minutes)

1. Open the **`mini-smart-home`** folder in VS Code (**File → Open Folder…**), then open the first terminal (**Terminal → New Terminal**). A new terminal always starts in the `mini-smart-home` folder. Create this week's working branch from the latest `main`:

   ```text
   git switch main
   git pull
   git switch -c feature/automation
   ```

   **Expected output** (the last line):

   ```text
   Switched to a new branch 'feature/automation'
   ```

2. Make sure **Docker Desktop** is running and the **`smarthome-db`** container is running (a green icon in the **Containers** tab). If it isn't, click **▶** in its row, or run `docker start smarthome-db` in the terminal.
3. Make sure the **MQTT broker** is running: Mosquitto on the Pi (the device path) or on the laptop (the laptop path). On the laptop, the broker is the Mosquitto service you installed in Module 12 Practice 7. That service starts by itself along with the laptop, so it doesn't need a terminal. Practice 7.10 later moves it into a VS Code terminal for a while so that it can be stopped on purpose.
4. Make sure **readings are coming in**. **The device path:** turn on Node 1. **The laptop path:** open a second terminal (**Terminal → New Terminal**), then run the Module 16 simulator for one device:

   ```text
   cd tools
   node device-simulator.js mqtt://127.0.0.1:1883 1
   ```

   **Expected output:**

   ```text
   1 fake devices heading to mqtt://127.0.0.1:1883. Stop with Ctrl+C.
   f00d00000001: online
   ```

   Leave this terminal running. The simulator used here is **deliberately** the Module 16 version that's already in the `tools` folder; the Module 19 version follows in Practice 2.

### Step 2 — Install Socket.IO (3 minutes)

The backend uses the **`socket.io`** package, and the small terminal you build uses **`socket.io-client`** (Concept 1). In the first terminal, go into the `backend` folder:

```text
cd backend
npm install socket.io@4.8.4
```

**Expected output:**

```text
added 17 packages, and audited 164 packages in 5s

40 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Then install the client in the `tools` folder:

```text
cd ../tools
npm install socket.io-client@4.8.4
cd ../backend
```

**Expected output** (between the two `cd` commands):

```text
added 7 packages, and audited 52 packages in 11s

5 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

The `audited` number and the number of seconds on your screen may be slightly different (**example**). What matters are the `added …` and `found 0 vulnerabilities` lines.

### Step 3 — The backend broadcasts every reading (7 minutes)

In the Explorer panel, right-click the **`backend/src/services`** folder → **New File…**, name it **`realtime.ts`**, then type:

```ts
// realtime.ts - Socket.IO: data flows to the terminal and the browser without a refresh (Module 19).
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";

let io: Server | undefined;

export function startRealtime(app: FastifyInstance): void {
  io = new Server(app.server); // rides on Fastify's HTTP server, at the address /socket.io/
  io.on("connection", (socket) => app.log.info(`realtime client connected: ${socket.id}`));
}

// send one telemetry to ALL the clients that are connected
export function broadcastTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  io?.emit("telemetry", deviceId, content);
}
```

- **`new Server(app.server)`** attaches Socket.IO to Fastify's HTTP server. The two share port `8080`: ordinary requests are still served by Fastify, and Socket.IO connections come in through the special address `/socket.io/`.
- **`io.emit("telemetry", deviceId, content)`** sends one message named `telemetry` to **every** client that's connected. The **`?.`** sign (Module 17) prevents an error if Socket.IO hasn't been set up yet.

Now connect that file in two places.

1. Open **`src/services/mqtt.ts`**. Below the line `import { archiveStatus, archiveTelemetry, archiveVitals } from "../db/archive.ts";`, add:

   ```ts
   import { broadcastTelemetry } from "./realtime.ts";
   ```

   Then find the line `saveTelemetry(deviceId, result.data);` in the `telemetry` part, and add one line right below it:

   ```ts
       broadcastTelemetry(deviceId, result.data); // Module 19: passed on right away to the Socket.IO clients
   ```

   The reading is broadcast **after** it passes the contract check, so the screen never receives a rejected message.

2. Open **`src/server.ts`**. Below the line `import { startMqtt } from "./services/mqtt.ts";`, add:

   ```ts
   import { startRealtime } from "./services/realtime.ts";
   ```

   Then add one line right **before** the line `startMqtt(env.MQTT_URL, app.log);`:

   ```ts
   startRealtime(app); // Module 19: Socket.IO at the address /socket.io/
   ```

   Socket.IO is set up before `app.listen()`, so the `/socket.io/` address is ready as soon as the server starts receiving guests.

Save all three files, then check:

```text
npm run check
```

**Expected output:** only two header lines (`> mini-smart-home-backend@0.3.0 check` and `> tsc --noEmit`) with no other message. That means TypeScript didn't find any mistake.

### Step 4 — A small terminal that listens (4 minutes)

Run the backend in the first terminal (still in the `backend` folder):

```text
npm run dev
```

**Expected output** (**example**; the times follow your laptop's clock):

```text
[05:59:30] INFO: database ready
[05:59:31] INFO: Server listening at http://127.0.0.1:8080
[05:59:31] INFO: API docs: http://127.0.0.1:8080/docs
[05:59:31] INFO: connected to broker mqtt://127.0.0.1:1883
```

In the Explorer panel, right-click the **`tools`** folder → **New File…**, name it **`live-terminal.js`**, then type:

```js
// live-terminal.js — a "small terminal": live readings from the backend through Socket.IO (Module 19, Quick Win).
import { io } from "socket.io-client";

const socket = io(process.argv[2] || "http://127.0.0.1:8080");
socket.on("connect", () => console.log("connected to the backend"));
socket.on("telemetry", (deviceId, content) => console.log(`${deviceId}  temp ${content.temperature} °C  soil ${content.soil} %`));
```

Open a third terminal, go into the `tools` folder, then run:

```text
cd tools
node live-terminal.js
```

**Expected output** (**example**; one line every time a reading arrives, and more keep coming until you press **Ctrl + C**):

```text
connected to the backend
a4cf12e5b7c0  temp 28.5 °C  soil 37 %
f00d00000001  temp 25.8 °C  soil 27 %
a4cf12e5b7c0  temp 28.5 °C  soil 37 %
f00d00000001  temp 32.3 °C  soil 36 %
```

Meanwhile, the backend terminal records its guest:

```text
[06:00:21] INFO: realtime client connected: iIMSOuaFwvyCQw2SAAAA
```

That's your quick win: **readings show up as soon as they arrive**, without a refresh and without asking over and over. The lines from Node 1 (`a4cf12e5b7c0`) only show up if your Node 1 is on; on the laptop path, only `f00d00000001` shows up. The random text after `connected:` is the Socket.IO connection number, different every time.

Try one more thing. Save `src/server.ts` again (**Ctrl + S** without changing anything). `npm run dev` restarts the backend, the small terminal's connection drops for a moment, then the line `connected to the backend` appears again **by itself**, and the readings flow again. Reconnecting automatically is one of the things Socket.IO provides without any extra code.

### Step 5 — Peek at the Socket.IO handshake (2 minutes)

How does Socket.IO start its connection? Open a fourth terminal (or stop the small terminal for a moment with **Ctrl + C**), then ask for its "opening greeting" with `curl` (**Windows:** type `curl.exe`, including the `.exe`; in Windows PowerShell 5.1, `curl` without `.exe` is a different command; **macOS:** just `curl`):

```text
curl.exe "http://127.0.0.1:8080/socket.io/?EIO=4&transport=polling"
```

**Expected output** (**example**; the `sid` is always different):

```text
0{"sid":"FumyYLytQpDru1QxAAAB","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

A Socket.IO connection always starts with an **ordinary HTTP** request like this one (`transport=polling`). The answer gives a session number (`sid`) and announces that the connection may **upgrade** to WebSocket (`"upgrades":["websocket"]`); your small terminal does that by itself right after it connects. A `pingInterval` of 25,000 milliseconds means both sides greet each other every 25 seconds to make sure the connection is still alive (Concept 1). This `curl` request doesn't count as a client, so the line `realtime client connected` doesn't appear in the backend log.

Leave the backend, the simulator (laptop path), and the small terminal running if you're continuing right away. These changes are saved to Git at the end of Practice 1.

> ➡️ **Continue** to [🧠 The "Why" Concepts](#-the-why-concepts): read Concepts 1–2, then do Practice 1.

## 🧠 The "Why" Concepts

There are ten concepts. You don't need to read them all at once before the practices. The order:

1. Quick Win (already done) → Concepts 1–2 → Practice 1 (live data through Socket.IO)
2. Concepts 3–4 → Practice 2 (commands and the device state)
3. Concepts 5–6 → Practice 3 (the rules brain and unit tests)
4. Concept 7 → Practice 4 (rules in the database, changed through the API)
5. Concept 8 → Practice 5 (the schedule)
6. Concept 9 → Practice 6 (Telegram)
7. Concept 10 → Practice 7 (local safety on Node 1) → Practice 8 (the pass test)

The ⬆️/➡️ boxes at the end of every practice and at the end of every group of concepts above take you to the next step. The code snippets in the concepts are only for reading: they're all written and run in the practices.

### 1. WebSocket: a phone call, not a mailbox

Since Module 16, every conversation with the backend has used **HTTP**: the browser or Bruno asks, the backend answers, and then the connection is over. The pattern is like a **mailbox**. If you're waiting for news, the only way is to keep going back and checking the mailbox. In web terms, this way is called polling (asking over and over): the page requests `GET /devices/:id/latest` every few seconds. If it asks too rarely, the news comes late. If it asks too often, most questions are answered "nothing new yet", and the backend is busy serving pointless questions.

**WebSocket** works like a **phone call**. The client calls the backend once, and then the connection is left open. As long as that connection is alive, **both sides may talk at any time**: the backend can "push" a new reading as soon as it arrives from MQTT, without waiting to be asked. One connection is used the whole time, so there are no more pointless questions and answers.

| | HTTP polling (a mailbox) | WebSocket (a phone call) |
| :--- | :--- | :--- |
| Who starts | Always the client | The client calls once, then both sides are free to talk |
| A new reading arrives | At the next check (up to one interval late) | As soon as it reaches the backend |
| Pointless questions | Many ("nothing new yet") | None |
| Good for | Data that rarely changes, reports, history (the Module 16–18 API) | Live data, device state, alerts |

This module uses **Socket.IO**, a library built on top of WebSocket. Socket.IO adds things you'd have to build yourself with plain WebSocket: reconnecting automatically when the connection drops, rooms (Concept 2), an answer for every message (an *acknowledgement*), and a fallback route. When it first connects, Socket.IO uses ordinary HTTP, then "upgrades" to WebSocket as soon as it can. There's one consequence: **the server and the client must both use Socket.IO**. A plain WebSocket client can't talk to a Socket.IO server, and the other way around. The backend uses the `socket.io` package, and the small terminal you build uses the `socket.io-client` package.

Don't mix it up with MQTT. Both of them "push", but their jobs are different: **MQTT** connects the devices with the broker and the backend, while **Socket.IO** connects the backend with human screens (a terminal now, the live React dashboard in Module 23). The browser isn't allowed to subscribe to the broker directly: it only talks to the backend, and it's the backend that checks and filters the messages, and later (Module 20) also checks the user's permissions.

### 2. Rooms: one channel for each device

Imagine the backend broadcasting **every** reading to **every** connected screen. As long as there's only Node 1, that's fine. As soon as there's Node 2, ten simulated devices, and three screens that each only care about one room of the house, every screen gets flooded with readings it doesn't need.

Socket.IO provides **rooms**: named groups of connections. The backend puts a connection into a room named `device:<device_id>`, for example `device:a4cf12e5b7c0`, then sends Node 1's readings **only to that room**. A screen that wants to follow Node 1 just asks to join its room. Other screens receive nothing from Node 1.

In this module, the backend and the clients send each other five kinds of messages (Socket.IO calls them events):

| Message | Direction | Receiver | Content |
| :--- | :--- | :--- | :--- |
| `follow` | client → backend | — | the `device_id` to follow. The backend checks it with Zod, puts the client into its room, then answers with that device's last reading, so that the screen isn't empty while it waits. |
| `unfollow` | client → backend | — | leaving a device's room |
| `telemetry` | backend → client | only that device's room | a reading that has just arrived and passed the data contract |
| `status` | backend → client | every client | a device that's `online` or `offline` (from the LWT, Module 11) |
| `event` | backend → client | every client | an important record: the fan turned on by a rule, a failed command, a schedule that ran (Concept 7) |

One thing in that table is easy to mix up. Socket.IO's answer to a `follow` message is also called an *acknowledgement*, but it's **not** the MQTT `ack` from the device. A Socket.IO acknowledgement only means "the backend has received your request", while an MQTT `ack` means "the device has carried out your command" (Concept 3).

![Diagram of the mailbox versus the phone call: HTTP polling and WebSocket, Concepts 1 and 2; time runs from top to bottom, and a new reading reaches the backend at second 7. Top left, the card HTTP polling = a mailbox, with a mailbox icon: the screen asks every 5 seconds, the backend can only answer. There are two lifelines, the screen and the backend. The screen sends GET /devices/:id/latest and gets the answer nothing new yet; five seconds later it asks again whether there's anything new, and the answer is not yet. A green dot on the backend's lifeline marks the new reading that arrives at second 7, but the screen only receives it with its next question, in a green answer: here, a new reading, 3 seconds late. The fourth question is answered not yet again. Note: ask rarely, and the news comes late; ask often, and the backend is busy answering not yet. Top right, the card WebSocket = a phone call, with a phone handset icon: call once, then both sides are free to talk. The screen starts with an ordinary HTTP handshake, GET /socket.io/?EIO=4&transport=polling, and the answer holds the session number sid and upgrades websocket. After that, a light green band between the two lifelines says upgraded to WebSocket, and the connection is left open: both sides may talk at any time. When the new reading arrives at second 7, the backend immediately pushes telemetry to the screen, pushed right away without being asked, and the same happens with the next reading. Note: readings get there as soon as they arrive, with no wasted questions and answers; the connection is kept alive, and both sides greet each other every 25 seconds. Bottom, the card Rooms: one channel for each device, Concept 2. From the left: two devices, Node 1 a4cf12e5b7c0 and the simulator f00d00000001, send through the MQTT broker to the backend. The green backend box says Socket.IO at /socket.io/, the same port as Fastify 8080, and holds two rooms: device:a4cf12e5b7c0 and device:f00d00000001. On the right, small terminal A follows a4cf12e5b7c0, and small terminal B follows f00d00000001. Each terminal sends follow to its room and receives telemetry only from that room: terminal A shows the reading a4cf12e5b7c0 temp 28.5 °C, terminal B shows the reading f00d00000001 temp 32 °C, and both show the same line, f00d00000001 is now offline. Caption at the bottom: follow is answered (acknowledgement) with the last reading, so that the screen isn't empty while it waits; status and event go to every client, so the same offline line appears in both terminals. Bottom left: MQTT connects the devices with the backend, Socket.IO connects the backend with the screens.](assets/polling-and-websocket.png)

> ➡️ **Done reading Concepts 1–2?** Continue to [Practice 1 — Live data through Socket.IO](#practice-1--live-data-through-socketio-40-minutes). Concepts 3–4 are read before Practice 2.

### 3. Command → ack → timeout: a command that knows its fate

Since Module 11, every command to a device has an `id`, and the device answers with an `ack` with the same `id`. The Module 16 backend already waits **5 seconds** at most for that answer: if the `ack` comes, the command succeeded or was refused with a reason; if it doesn't come, the command counts as failed, and the API answers `504`. This pattern is called **command → ack → timeout**. Without it, the server sends a command and just hopes, like throwing a letter into someone's yard without knowing whether it gets read.

From this week on, commands don't only come from the API. Automation rules, schedules, and the Telegram bot also give orders to the devices. So that all four are treated the same, every command goes through **one door**: the function `issueCommand()` in `src/services/commands.ts`. That function sends the `cmd`, waits for the `ack`, then records the result in the `commands` table together with its **source** (`api`, `rule`, `schedule`, or `telegram`). The actions of rules and schedules are also recorded in the event log and broadcast through Socket.IO as `event` (Concept 7), and so are the commands that reconciliation sends again (Concept 4); ordinary commands from the API and Telegram are only recorded in `commands`. Every command ends with one of four fates:

| Fate | What it means | Example |
| :--- | :--- | :--- |
| Answered, `ok: true` | The device carried it out | the fan is on; `ack.state` reports `"fan": true` |
| Answered, `ok: false` | The device refused with a reason | `pump value must be 1-10 seconds`, or the pump is refused because the water tank is low |
| No `ack` | 5 seconds pass without an answer | the device has just disconnected, or the `cmd` got lost on the way |
| Not sent | The backend refuses before sending | the device is `offline`, or an earlier command for the same actuator is still waiting for its `ack` |

The rule "one waiting command for each actuator" keeps commands from piling up when the network is sluggish: a lamp command may be sent while a fan command is still waiting, but a second fan command has to wait for the answer to the first one.

### 4. Desired state versus reported state

Think of the remote control of the air conditioner at home. The remote's screen says 24 °C and "on", while the air conditioner itself might be off because the power went out for a moment. What's written on the remote is the **desired state**. What happens to the air conditioner is the **reported state**. The two aren't always the same.

Backend v0.4 keeps both for every device:

- **Desired**: the state the server last asked for, for the actuators whose state lasts, that is, `fan`, `lamp`, and `curtain`. The pump isn't included, because its command is only a 1–10 second pulse that turns off by itself.
- **Reported**: the state the device last reported. Up to Module 18, that report only came through `ack.state`, even though the firmware also changes the actuators by itself, for example the automatic lamp and the automatic watering since Module 6. That's why **data contract 1.3** adds a `state` object, with exactly the same shape as `ack.state`, to Node 1's `telemetry`, and Node 1 sends a `telemetry` right away every time the state of its actuators changes.
- **Diff**: the actuators whose state differs between what's desired and what's reported.

The new route `GET /devices/:id/state` shows all three:

```json
{"device_id":"f00d00000001","desired":{"fan":true},"reported":{"fan":false,"lamp":false,"pump":false,"curtain":90},"reported_at":"2026-10-21T00:12:08.511Z","diff":["fan"]}
```

If there's a difference, the backend **reconciles** them: it sends that command once more. But it only does so if the device is `online`, no command for that actuator is still waiting for an `ack`, at least 30 seconds have passed since the last try, **and** that wish has never been fulfilled since it was sent. The last condition matters. Node 1 also has its own brain: the automatic lamp turns on when there's motion in a dark room, and local safety (Concept 10) can turn the fan on. If the backend "fixed" every difference without conditions, the server and Node 1 would fight each other every 30 seconds. The only exception: a device that **has just restarted** (`uptime_s` in `vitals` under 60 seconds). Its relays are all off when it starts, so all the server's wishes for that device are reconciled again.

There are two limitations you should know about from the start. **The desired state is only kept in the backend's memory**, so it's empty again every time the backend restarts; its command history stays in the `commands` table. Besides that, the reported state is only as fresh as the last `telemetry`: if the device is `offline`, its numbers stop being updated. That's why the device's `status` still matters. That status comes from the **last will** (*Last Will*, LWT) of Module 11: the broker publishes `offline` on behalf of a device that disappears without saying goodbye. From this week on, the backend broadcasts status changes through Socket.IO and lets you know through Telegram if a device is `offline` for more than 60 seconds.

![Diagram of one door for commands, and the desired state versus the reported state, Concepts 3 and 4: the API, rules, schedules, and Telegram use the same issueCommand(); the example is the simulator f00d00000001. Left, Concept 3, command, ack, timeout. Four sources, recorded in the source column of the commands table: the API (Bruno) with the value api, the rules engine with the value rule, the schedule with the value schedule, and the Telegram bot with the value telegram. All four meet in one green box, the one door issueCommand() in src/services/commands.ts. To its right are the broker and Node 1. From the one door, a cmd with an id goes through the broker to Node 1; Node 1 carries it out, then answers with an ack with the same id and the state. An hourglass on the backend side: it waits 5 seconds at most. Below that, a table of the four fates of every command, with the columns fate, what it means, and API code. Answered, ok true, a green check mark: the device carries it out, ack.state reports fan true, code 200. Answered, ok false, a red cross: the device refuses with a reason, for example pump value must be 1-10 seconds, code 200. No ack, a red hourglass: 5 seconds pass without an answer, the device has just disconnected or the cmd got lost on the way, code 504. Not sent, a grey no-entry sign: the backend refuses before sending, because the device is offline or an earlier command for the same actuator is still waiting for its ack, code 409. Note: the API code is the answer of the POST /devices/:id/command route, and commands that were sent are recorded in commands. Right, Concept 4, the desired state versus the reported state. A green box, desired state (desired): last requested by the server, in the backend's memory, holding fan true. A box, reported state (reported): from state in telemetry and ack, contract 1.3, holding fan false, lamp false, pump false, curtain 90. A diff band holding fan: the fan is desired on, reported off. Below that, the answer of GET /devices/f00d00000001/state as JSON: device_id f00d00000001, desired fan true, reported fan false, lamp false, pump false, curtain 90, reported_at 2026-10-21T00:12:08.511Z, and diff fan. Then a checklist: the backend reconciles, that is, sends that command again, only if the device is online, no command for that actuator is still waiting for its ack, at least 30 seconds have passed since the last try, and that wish has never been fulfilled since it was sent. Except a device that just restarted, with uptime_s less than 60 in vitals: its relays are all off, so every wish for that device is reconciled again. The last condition keeps the server from fighting Node 1's own brain, that is, the automatic lamp and local safety, every 30 seconds. Note box at the bottom: the desired state is only kept in memory, empty again every time the backend restarts; its command history stays in the commands table.](assets/commands-and-state.png)

> ➡️ **Done reading Concepts 3–4?** Continue to [Practice 2 — One door for commands, and the device state](#practice-2--one-door-for-commands-and-the-device-state-45-minutes). Concepts 5–6 are read before Practice 3.

### 5. The rules engine: rules as data, not code

In Module 13, the fan automation was built in Node-RED: flow boxes connected with virtual wires. This week that automation moves to the backend, in a more orderly form. Start with an ordinary sentence:

> If Node 1's temperature is **above 30 °C for 2 minutes**, turn on the fan. Turn it off again when the temperature is **below 28 °C**.

That sentence is written as **data**, not as code, and stored as one row in the `rules` table you created in Module 17:

```json
{
  "name": "Node 1 automatic fan",
  "active": true,
  "condition": { "kind": "threshold", "device_id": "a4cf12e5b7c0", "quantity": "temperature",
                 "on_above": 30, "off_below": 28, "for_seconds": 120 },
  "action":    { "kind": "switch", "device_id": "a4cf12e5b7c0", "target": "fan", "notify": true }
}
```

The part of the backend that reads data like that and then decides what to do is called a **rules engine**. Writing rules as data has three advantages. First, rules can be **changed without touching the code**: you just change the numbers through the API (Concept 7). Second, every rule is **checked by Zod** before it's used, whether it comes from the API or is read from the database, so a broken rule is refused with a clear message. Third, **no text formula is ever run as code**. The rules engine only knows the shapes defined in advance (`threshold`, `schedule`, `switch`, `command`), so there's no way to slip a dangerous command in through the content of a rule.

Three ideas make that fan rule behave well:

1. **"For 2 minutes"**. The count starts at the first reading above 30 °C. If there's even one reading of 30 °C or less, a failed reading (`null`), or a gap without readings of more than 60 seconds, the count **starts again from zero**. With `telemetry` every 10 seconds, the fan is only turned on at the 13th hot reading (second 120). A temperature that only jumps up briefly, for example because the sensor catches a moment of sunlight, doesn't turn the fan on.
2. **Hysteresis** (Module 13). The on limit (30 °C) and the off limit (28 °C) are different on purpose. If they were the same, a temperature swinging around 30 °C would make the fan turn on and off every few seconds. The 2 °C gap keeps the fan on until the room is really cooler.
3. **Deciding only when crossing.** The rules engine outputs "turn-on" only once, exactly when the temperature crosses the limit, not at every hot reading. The reported state (Concept 4) is used when a rule's memory is created from scratch, that is, after the backend restarts or the rule is changed: if the device reports that the fan is on, the rule counts as already on, so the fan isn't turned on twice and is still turned off when the time comes.

![Chart of the rules engine: above 30 °C for 2 minutes, with hysteresis, Concept 5. One dot is one telemetry reading every 10 seconds, and the rule's numbers are the same as in the Practice 3 Vitest tests. The horizontal axis is the seconds since the first hot reading, from 0 to 300; the vertical axis is the temperature, 27 to 32 °C. Two dashed horizontal lines: on above 30 °C and off below 28 °C; the light green band between them says hysteresis gap: stays as it was. Two readings before second 0 are still below 30, not above 30 yet. From second 0 the temperature is above 30 and rises slowly to about 32.3 °C. A bracket above seconds 0 to 120 says for 2 minutes: 13 hot readings in a row. A green dot at second 120 says turn-on, the 13th reading, second 120, with the note: a decision only when crossing, the next hot readings stay quiet. After the fan turns on, the temperature drops and passes through the gap between 28 and 30 without a new decision, then a second green dot at second 240 says turn-off, the first reading below 28 °C (27.8). At the end of the chart the temperature rises into the gap again, and the fan stays off. Below the chart, the fan lane: OFF until second 120, ON from second 120 to 240 (it stays on even when the temperature enters the gap), then OFF (it stays off). Bottom left, the card Rules as data, one row in the rules table (Module 17): condition with kind threshold, quantity temperature, on_above 30, off_below 28, and for_seconds 120; action with kind switch and target fan; device_id in both parts and notify aren't shown, and the full example is in Concept 5. Bottom right, the card One reading of exactly 30 °C restarts the count, test 4 of Practice 3: it must be above 30, not equal to 30. A row of 31 °C dots from second 0 to 60 (the first count: 60 seconds), one dot exactly on the 30 °C limit line at second 70 (exactly 30 °C, the count starts again from zero), then another row of 31 °C dots from second 80 to 190 (a new count starts at second 80; at second 190 it's only 110 seconds). The result: no turn-on up to second 190, checked with not.toContain. The count also restarts after a null reading (a failed sensor) and after a gap of more than 60 seconds without readings.](assets/rules-engine.png)

Besides **threshold** rules like the one above, this module's rules engine knows one more kind: **schedule** rules ("water for 10 seconds every day at 06:00", Concept 8). Threshold rules only control the fan and the lamp. The pump is deliberately not given a threshold rule on the server, because Node 1 has been watering by itself based on the soil sensor since Module 6; two brains for one pump could water twice.

### 6. Unit tests: checking the rules brain without a device

How do you know the "for 2 minutes" rule really waits 120 seconds, not 110 or 130? Waiting for the fan in front of Node 1 while warming up the sensor works, but it's slow and can't be repeated exactly. There's a much faster way: **unit tests**.

The key is that the rules brain is written as **pure functions**: their results depend only on their inputs. The `evaluateThreshold()` function doesn't read the clock, the database, or MQTT by itself. Everything it needs is given by its caller: the rule, the previous memory, the reading, and **the current time as a number of milliseconds**. Its result is a decision ("turn-on", "turn-off", or doing nothing) and a new memory. Because the time is just a number, "2 minutes later" can simply be written as `120_000`, and the unit tests finish within milliseconds.

A unit test is a small program that calls that function with prepared inputs, then **checks** the result:

```ts
it("turns the fan on after 120 seconds above 30 °C", () => {
  // … readings of 31 °C at seconds 0, 10, 20, …, 120
  expect(decision).toBe("turn-on");
});
```

`expect(…).toBe(…)` means "the result must be equal to this". If it is, the test **passes** (✓); if not, the test **fails** (×), and its error message shows what was expected and what was received. The tool that finds and runs all those tests is **Vitest**, and its command is `npm test`. In Practice 3 you write 10 tests: it turns on at exactly second 120; it doesn't turn on at second 110; the count starts again after one cool reading, after a `null` reading, and after a long gap; it stays on in the hysteresis gap; it turns off below 28 °C; and so on. Once they're written, they can all be run again at any time within a second, for example every time you change the rules brain.

Unit tests don't replace tests with a real device. They make sure the **logic** is right. The parts that connect that logic to MQTT, the database, and Telegram are still tried out in Practices 4–8.

> ➡️ **Done reading Concepts 5–6?** Continue to [Practice 3 — The rules brain and 10 unit tests](#practice-3--the-rules-brain-and-10-unit-tests-60-minutes). Concept 7 is read before Practice 4.

### 7. Rules in the database, changed through the API, in effect right away

The first pass requirement of this module says: changing the temperature threshold through the API **immediately changes how the fan behaves, without restarting the server**. This is how it goes:

1. You send `PUT /rules/1` with a new threshold, for example an `on_above` of 32, from Bruno or Swagger.
2. The backend checks the content with Zod, then saves it in the `rules` table (`UPDATE … RETURNING`).
3. The backend **reloads** the list of rules in its memory. The rules engine doesn't read the database every time a reading arrives (dozens of times a minute); it uses a copy in memory, and that copy is replaced every time a rule changes. The "for" count of the changed rule starts again from zero.
4. For a fan rule, the backend publishes a **`config`** to Node 1: `{"action":"config","thresholds":{"temp_fan_on":32}}`, with QoS 1 and retained. Node 1 stores that number in NVS as the threshold of its local safety rule (Concept 10).
5. The change is recorded in the **event log** (the `events` table): who changed which rule, and when.

Why is `config` sent retained, when the data contract forbids a retained `set`? Because `config` only holds thresholds, and the same threshold carried out twice still gives the same result. A retained message is kept by the broker and delivered again every time the device subscribes, so a Node 1 that has just restarted, a replacement Node 1, or a Node 1 with an empty NVS gets the latest threshold right away, without the server needing to know when it started. A `set pump` command must never be like that: if it were stuck on the broker, the pump would water again every time Node 1 restarts and then connects, because its memory of command `id`s is lost too (contract rule 8). One thing to remember: the broker only keeps **one** retained message for each topic. Deleting the retained message on the `cmd` topic (for example with **Clear Retained Message** in MQTTX) deletes the `config` too. That's why the backend publishes `config` again every time it connects to the broker.

There's also **migration `007_rules_and_events.sql`** this week. Number 006 is skipped on purpose, because it's used by the 🧩 Level 3 challenge of Module 18 (`006_device_health.sql`); if you did that challenge, your file stays safe. Migration 007 adds three things:

| Table | Change | What for |
| :--- | :--- | :--- |
| `rules` | the `updated_at` column, and a check that `condition` and `action` are JSON objects | knowing when a rule was last changed, and refusing content that isn't an object |
| `commands` | the columns `source` (`api`, `rule`, `schedule`, `telegram`), `rule_id`, and `state` | answering "who turned on the fan, and because of which rule?" |
| `events` (new) | one row for every event a human needs to know about | a rule starts working, a command fails, a device's status changes, a schedule is missed, an offline-mode report |

![Diagram of rules in the database: change the threshold through the API, and it applies right away, Concept 7; the example is PUT /rules/1 with on_above 32, and the backend is never restarted. Top, five steps from left to right, with a green bracket above steps 2 to 5 that says all of this happens inside the running backend: no restart of the server. Step 1, Bruno or Swagger: PUT /rules/1 with the whole rule as its body, with on_above 32 and off_below 30. Step 2, Zod checks with the Rule schema; wrong content gets the answer 400, and the database isn't touched. Step 3, PostgreSQL, a blue database box: UPDATE rules … RETURNING; the rule is stored permanently in the rules table. Step 4, reload into memory, a green box: loadRules(), the copy in memory is replaced, and this rule's 2-minute "for" count starts again from zero. Step 5, the rules engine evaluates the next reading with the new threshold: evaluateReading() then evaluateThreshold(). Two branches come out of step 4. The left branch, recordEvent(): the event log, the events table, gets a new row of the kind rule-changed, that is, who changed which rule, and when; then Socket.IO sends event to every client, and the small terminal writes event: Rule 1 (Automatic …. The right branch, sendAllConfigs(): a retained config message with QoS 1, holding action config and thresholds temp_fan_on 32, to the cmd topic of Node 1; then the broker, which keeps one retained message per topic; then Node 1, which stores it in NVS (Concept 10). Note: only config may be retained, because it holds thresholds, and doing it twice gives the same result; a set command is never retained. Bottom, the proof box from Practice 4.8, the backend log in WIB times: threshold 32 doesn't turn the fan on at a temperature of 31 °C, then the threshold is lowered to 30 again without a restart. The log lines: 06:51:40 Rule 1 (Automatic fan) changed through the API; 06:51:40 config to f00d00000001, temp_fan_on 30 from rule 1 (retained); 06:51:40 PUT /rules/1 -> 200 (16 ms); 06:51:48 rule 1 (Automatic fan): temperature 31 above 30, fan turned on if it lasts 120 seconds; 06:53:48 command (rule) to f00d00000001: fan = true, ack ok=true in 3 ms; 06:53:48 rule 1 (Automatic fan): a thermometer icon, Temperature 31 °C — fan turned on automatically. The closing sentence: the first reading after the change starts the count (06:51:48), and exactly 2 minutes later (06:53:48) the rule turns the fan on.](assets/rules-without-restart.png)

> ➡️ **Done reading Concept 7?** Continue to [Practice 4 — Rules in the database, changed through the API](#practice-4--rules-in-the-database-changed-through-the-api-60-minutes). Concept 8 is read before Practice 5.

### 8. Scheduling: an alarm clock for the server

Threshold rules react to **readings**. Other jobs react to the **clock**: watering the garden every morning or turning off the porch light at midnight. For that, the backend needs an alarm clock, and this module uses **node-cron**.

The time of a schedule is written as a **cron expression**, five fields separated by spaces:

```text
┌──────── minute (0–59)
│ ┌────── hour (0–23)
│ │ ┌──── day of the month (1–31)
│ │ │ ┌── month (1–12)
│ │ │ │ ┌ day of the week (0–7; 0 and 7 = Sunday)
│ │ │ │ │
0 6 * * *
```

The `*` sign means "every". So `0 6 * * *` means "minute 0, hour 6, every day of the month, every month, every day of the week", that is, **every day at 06:00**. A few more examples:

| Expression | What it means |
| :--- | :--- |
| `0 6 * * *` | every day at 06:00 |
| `30 17 * * *` | every day at 17:30 |
| `0 6 * * 1-5` | at 06:00, Monday to Friday |
| `*/15 * * * *` | every 15 minutes |

There are two things that often make a schedule "miss":

- **The time zone.** 06:00 by whose clock? A reader's laptop in Makassar or Jayapura uses WITA or WIT (Central or Eastern Indonesia Time), and the server in Module 27 might use UTC. That's why every schedule in this module uses the **`Asia/Jakarta`** zone (WIB), written clearly in the code, whatever the laptop's time zone is. (The author's own laptop uses WITA.)
- **A sleeping laptop.** node-cron can only ring the alarm while the backend program is running. If the laptop is asleep at 06:00 and wakes up no later than 15 minutes afterwards, this module's backend tells node-cron to run the schedule anyway, even though it's late (Practice 5). If the laptop only wakes up more than 15 minutes later, that schedule is **missed**: node-cron version 4 does **not** run it afterwards, but reports it. The backend records the missed schedule in the event log and lets you know through Telegram, so that you know the garden hasn't been watered. If the backend is off at that time, nothing can report anything at all. That's one of the reasons a real backend later runs on a server that's always on (Modules 26–27).

Many node-cron tutorials on the internet still use version 3. Some of its options, for example `scheduled` and `runOnInit`, no longer exist in version 4.6.0, which this module uses. If an example from the internet doesn't work, check its version first.

> ➡️ **Done reading Concept 8?** Continue to [Practice 5 — A morning watering schedule](#practice-5--a-morning-watering-schedule-25-minutes). Concept 9 is read before Practice 6.

### 9. Telegram notifications: important, fast, and not chatty

**Telegram** has a **bot** feature: a Telegram account that's run by a program, not by a human. A bot can send you messages and read the messages you send to it. Bots are created through Telegram's official bot called **@BotFather**: you type `/newbot`, give it a name, then receive a **token**, a long secret key that the program uses to control that bot. Anyone who holds the token can use your bot, so the token is treated like a password: kept in `.env`, never put into Git.

So that the bot knows where to send alerts, it needs a **`chat_id`**, the number of the chat between you and the bot. The easiest way to get it: send `/start` to your bot, and the bot replies with that number. That number is also used as an allow list: the bot only answers `/status` if the one asking is your `chat_id`.

The bot on the laptop uses **long polling**: the backend asks the Telegram server, "any new messages for me?", and Telegram holds that question until there's a message or until 30 seconds have passed, then the backend asks again. This works from behind a home router, without a public IP address. The other way, a webhook, makes Telegram contact the backend, so the backend has to be reachable from the internet over HTTPS; that's a job for Modules 26–27. The bot program is written with the **grammY** library.

Good notifications are **important, fast, and not chatty**:

- **Important.** Only events a human needs to act on: the fan turned on automatically because of the heat, a failed command, a device going `offline`, and a missed schedule.
- **Fast.** This module's pass requirement: an alert arrives **within 10 seconds**, counted from the reading that triggered it. The backend writes the delay in its log for every message.
- **Not chatty.** Without a safeguard, a temperature that stays at 33 °C could trigger a message every 10 seconds, and you'd turn the notifications off within an hour. Keeping it quiet is called **debouncing** (damping the bounces, like the button in Module 5): notify **when the situation changes** (it starts getting hot, it's cool again), remind **at most once every 30 minutes** while the dangerous situation lasts, and delay the `offline` message for **60 seconds**, because a device that only disconnects and reconnects briefly doesn't need to wake anybody up.

![Diagram of Telegram notifications: important, fast, and not chatty, Concept 9; the bot is created once through @BotFather, the backend asks with long polling, and the messages are debounced. Left column, Making the bot (just once), four numbered steps. 1: in Telegram, open @BotFather, send /newbot, then give it a name and a username that ends in bot. 2: BotFather replies with a token; a box with a padlock: your bot's secret key, anyone who holds it can control your bot, keep it only in backend/.env; then the line TELEGRAM_BOT_TOKEN=…, and .env has stayed out of Git since Module 16. 3: send /start to your bot, and the bot replies: Hello! Your chat_id: 777000111, Write this number as TELEGRAM_CHAT_ID in the backend's .env. 4: copy the chat_id into .env, TELEGRAM_CHAT_ID=777000111; /status is only answered for this chat_id, your bot's allow list. A dashed box: Token already leaked? Send /token to @BotFather to create a new token, then replace the value in .env; the old token no longer works. Note: the bot is created with your own Telegram account, for free (Practice 6). Middle column, Long polling: the backend asks. From the top: your phone with the Telegram app, connected to the Telegram server, which keeps the messages for your bot, your chat with the bot. From the home network, a green arrow going up says getUpdates and the question any new messages for me; an arrow going down carries the answer, a new message, for example /status. An hourglass: held until there's a message, 30 seconds at most. The home network box holds the router, without a public IP address, and the backend on the laptop, grammY bot.start(), which asks again every time an answer comes. Note: alerts are sent with sendMessage, also over an outgoing connection; the other way, a webhook, makes Telegram contact the backend, so the backend has to be reachable from the internet over HTTPS, a job for Modules 26–27. Right column, Debouncing: one hot afternoon, an example of Node 1's fan rule with a reading every 10 seconds, on a vertical timeline. At 13:02, a green dot: 2 minutes above 30 °C, the fan is turned on; the situation changed, sent, with a message bubble with a thermometer icon: Temperature 33 °C — fan turned on automatically. At 13:12, a grey circle: still 33 °C 10 minutes later; no change, quiet, 60 readings and 0 messages. At 13:32, a green dot: still hot, 30 minutes since the last message; a reminder is sent, with a thermometer icon: Temperature still 33 °C — fan stays on (reminder). At 13:48, a green dot: down below 28 °C, the fan is turned off; safe again, sent, with a green check mark icon: Temperature down to 27 °C — fan turned off. At 14:05, a grey circle: Node 1 is disconnected for 20 seconds, then comes back; less than 60 seconds, quiet. At 14:20, a green dot: Node 1 is disconnected for more than 60 seconds; sent 60 seconds later, with a phone-off icon: a4cf12e5b7c0 offline since 14:20 WIB. The box at the bottom: fast, 10 seconds at most from the triggering reading (the pass requirement); the backend log in the author's lab: Telegram sent 0.6 seconds after reading ….](assets/telegram-and-debouncing.png)

> ➡️ **Done reading Concept 9?** Continue to [Practice 6 — A Telegram bot with good manners](#practice-6--a-telegram-bot-with-good-manners-60-minutes). Concept 10 is read before Practice 7.

### 10. Local safety: Node 1 guards the house when the server is gone

The brain on the server is smart: it sees every device, keeps the history, and can send Telegram messages. But it's far away. If the laptop goes off, the broker stops, or the Pi's LAN cable comes loose, commands from the server won't arrive. The brain inside Node 1 is simple, but it's **always there**. A robust system uses both: the server for decisions that need the big picture, and the device for safety rules that must never stop. Node 1 has had its own local brain since Module 6: automatic watering and the automatic lamp. This week the fan is guarded too.

How **local safety** works in the Node 1 firmware v1.5.0:

1. **Thresholds from the server, stored in NVS.** Every time the fan rule is changed (Concept 7), Node 1 receives a `config` holding `temp_fan_on`, checks it (it must be a number of 15–45 °C), then stores it in NVS (Module 8). That number survives a power cut. As long as it has never received a `config`, Node 1 uses the default of 30 °C.
2. **Offline mode after 2 minutes.** Node 1 counts how long the broker has been unreachable since the last connection. A short disconnection is normal (the Wi-Fi blinks, the broker is restarted), so local safety only kicks in when the broker is gone **continuously for 2 minutes**. At that point Node 1 enters **offline mode**, and the OLED status page writes `OFFLINE MODE`.
3. **The fan is controlled locally, only in offline mode.** If the temperature is above `temp_fan_on`, Node 1 turns the fan on. If the temperature drops below `temp_fan_on − 2`, it turns off the fan it turned on itself, also after the broker comes back. The principle is **"whoever turned it on turns it off"**: a fan turned on by the server, or by you through a command, isn't touched by local safety, and as soon as there's a new fan command, the fan passes into the hands of whoever gave it. If the DHT22 sensor can't be read, local safety stays quiet.
4. **A report when it connects again.** About 10 seconds after the broker comes back, Node 1 sends `vitals` carrying the two extra fields of contract 1.3: `offline_s` (how many seconds Node 1 spent in offline mode) and `local_fan` (how many times local safety turned the fan on). The backend records it in the event log and lets you know through Telegram. That 10-second delay is deliberate. When the broker comes back, the backend has only just reconnected too and needs a few seconds to subscribe, while `vitals` isn't retained on the broker. A report published too soon could pass by without anybody hearing it.

Why does the report go through `vitals`, not through `status`? Because `status` states the **current** situation (`online` or `offline`), and as soon as Node 1 is connected again, its status really is `online`. The report "I was offline for 5 minutes just now and turned the fan on twice" is a story about the **past**, and `vitals` is exactly where Node 1 tells about its health. The third `status` value, `offline-mode`, is still reserved for Module 28.

To try local safety without unplugging a cable, firmware v1.5.0 has a new Serial command, **`test offline`**: Node 1 cuts its broker connection on purpose (without saying goodbye, so the broker publishes the `offline` last will) and holds back from reconnecting for 3 minutes. This command is the only way to try offline mode in Wokwi, because Wokwi uses a public broker that you can't turn off. When the connection is cut, Serial still writes `… retries every 5 seconds` (card 2 in the picture below). That's the general message for every disconnection; during this test, reconnection attempts are held back until 3 minutes have passed.

There's one gap that should be admitted honestly. Local safety only works when the **broker** can't be reached. If what goes down is the **backend** on the laptop, while the broker on the Pi keeps running, Node 1 stays connected and doesn't enter offline mode, even though the server rules have stopped too. As long as the backend still runs on a laptop, nobody controls the fan in that situation. What closes this gap is a backend that's always on, on a real server (Modules 26–27).

![Diagram of local safety: Node 1 guards the fan when the broker is gone, Concept 10; Node 1 firmware v1.5.0, with numbers from the author's Wokwi test: temp_fan_on 31 °C, the broker cut off with test offline. Top, a timeline with eight numbered markers and four lanes. The broker lane: reachable, then unreachable (pink) from marker 1, then reachable again from marker 6. The Node 1 lane: connected; MQTT DISCONNECTED, counting 2 minutes, from marker 2; OFFLINE MODE: local safety active (red) from marker 3; connected again from marker 6. The fan lane: off; ON from marker 4; off from marker 5; ON (owned by the safety rule) again before the broker comes back, and still on afterwards; off at marker 8. The DHT22 temperature lane: 28.5 °C, 33.0 °C, 28.5, 33.0 °C, then 28.0 °C. Time since the broker disappeared: 0, 2 minutes, and 3 minutes (test offline). Below that, eight numbered cards, each with a piece of Serial output, except card 7, which holds a piece of the vitals message. 1, Broker gone: the Pi's LAN cable is unplugged, the broker is stopped, or the Serial command test offline; Serial: test offline: broker connection cut; offline mode starts in 2 minutes, reconnecting in 3 minutes. 2, Node 1 notices: at once with test offline, while an unplugged cable is only noticed 15–30 seconds later; Serial: ERROR MQTT DISCONNECTED: connection lost (code -3). Node 1 keeps working and retries every 5 seconds. 3, 2 minutes without a broker: offline mode, and the OLED writes OFFLINE MODE on the status page; Serial: ERROR OFFLINE MODE: broker unreachable for 120 seconds. Local safety active: fan turns on above 31.0 C. 4, Temperature above temp_fan_on: 33.0 °C is more than 31.0 °C, so local safety turns the fan on by itself; Serial: Local safety: temperature 33.0 C above 31.0 C, fan turned on. 5, Below temp_fan_on − 2: 28.5 °C is less than 29.0 °C, so the fan is turned off; at 29.5 °C, between 29 and 31, it stays quiet; Serial: Local safety: temperature 28.5 C below 29.0 C, fan turned off. 6, Broker back: 33.0 °C again had turned the fan on a second time; Serial: OFFLINE MODE ENDED after 60 seconds: broker reachable again. Local safety turned the fan on 2 time(s). 7, Report in the first vitals: sent 10 seconds after reconnecting, so that the backend has time to subscribe; the vitals hold offline_s 60 and local_fan 2, then the backend records an offline-report event and notifies the owner through Telegram. 8, The safety rule's fan: whoever turned it on turns it off; connected again, 28.0 °C, the fan is turned off; Serial: Local safety: temperature 28.0 C below 29.0 C, fan turned off. Bottom left, a teal box, Thresholds from the server, stored in NVS: the server publishes a retained config (QoS 1) every time the fan rule changes, holding action config and thresholds temp_fan_on 31; Node 1 checks it (a number of 15–45 °C), then stores temp_fan_on in NVS, and the number survives a power cut; as long as it has never received config, the default is 30 °C; the fan turns off again below temp_fan_on − 2 (a fixed gap of 2 °C). Bottom right, a dashed box, A gap you should know about: local safety only works when the broker can't be reached; if what goes down is the backend on the laptop, while the broker on the Pi keeps running, Node 1 stays connected and doesn't enter offline mode, even though the server rules stop too. The fix: a backend on a server that's always on (Modules 26–27).](assets/local-safety.png)

> ➡️ **Done reading Concept 10?** Continue to [Practice 7 — Local safety on Node 1](#practice-7--local-safety-on-node-1-60-minutes).

## 🔧 Step-by-step practice

### Practice 1 — Live data through Socket.IO (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder) with **four terminals** for the backend, the simulator (the device path also runs it, for one extra device), and two small terminals. The MQTT broker and the `smarthome-db` container are running, as in the Quick Win.

The Quick Win broadcasts **every** reading to **every** client. This practice tidies that up according to Concept 2: a client chooses the device it wants to follow, the backend checks that choice, and readings are only sent to that device's room. Changes in a device's status (`online`/`offline`) still go to every client.

#### 1.1 One room for each device

Open **`backend/src/services/realtime.ts`** and replace its whole content with this complete version:

```ts
// realtime.ts - Socket.IO: data flows to the terminal and the browser without a refresh (Module 19).
// Every device has one room named "device:<device_id>". A client that wants to watch one device sends
// "follow", and then receives only that device's telemetry. Status changes go to every client.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/contract.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { findDevice } from "./store.ts";

type Telemetry = TelemetryNode1 | TelemetryNode2;

// the server's answer to "follow" (a Socket.IO ack): success or not, and that device's last reading
interface FollowAnswer {
  ok: boolean;
  message?: string;
  latest?: Telemetry | null;
}

// events from the server to the client, with their content
interface ToClient {
  telemetry: (deviceId: string, content: Telemetry) => void;
  status: (deviceId: string, status: Status) => void;
}

// events from the client to the server; "respond" is the Socket.IO ack
interface FromClient {
  follow: (deviceId: string, respond: (answer: FollowAnswer) => void) => void;
  unfollow: (deviceId: string) => void;
}

let io: Server<FromClient, ToClient> | undefined;

export function startRealtime(app: FastifyInstance): void {
  io = new Server<FromClient, ToClient>(app.server); // rides on Fastify's HTTP server, at the address /socket.io/
  io.on("connection", (socket) => {
    app.log.info(`realtime client connected: ${socket.id}`);
    socket.on("follow", (deviceId, respond) => {
      if (typeof respond !== "function") return; // the client didn't ask for an answer: ignore it
      if (!DeviceId.safeParse(deviceId).success) { // never trust the client, just as we never trust the device
        return respond({ ok: false, message: "device_id must be 12 lowercase hexadecimal digits" });
      }
      socket.join(`device:${deviceId}`);
      app.log.info(`client ${socket.id} follows ${deviceId}`);
      // messages missed while the client was disconnected aren't sent again, so send its last reading now
      respond({ ok: true, latest: findDevice(deviceId)?.telemetry ?? null });
    });
    socket.on("unfollow", (deviceId) => {
      socket.leave(`device:${deviceId}`);
    });
    socket.on("disconnect", (reason) => app.log.info(`realtime client disconnected: ${socket.id} (${reason})`));
  });
  // When the server is closed gracefully, disconnect every Socket.IO client first; otherwise app.close() waits for them.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
}

// send one telemetry ONLY to the clients that follow that device
export function broadcastTelemetry(deviceId: string, content: Telemetry): void {
  io?.to(`device:${deviceId}`).emit("telemetry", deviceId, content);
}

// send a status change to ALL clients
export function broadcastStatus(deviceId: string, status: Status): void {
  io?.emit("status", deviceId, status);
}
```

There are four parts:

- **The list of messages** (`ToClient` and `FromClient`). These two interfaces (descriptions of a type) tell TypeScript the name of every message and its content (Concept 2). If you ever mistype `"telemtry"` or send content with a different shape, `npm run check` points it out right away. Both are given to `new Server<FromClient, ToClient>(…)`.
- **`follow`**. The client sends a `device_id`, and the backend **doesn't trust it right away**: `DeviceId.safeParse` (the same Zod schema as the data contract) checks its shape. An invalid one is answered with `ok: false` and the reason. A valid one is put into the room `device:<device_id>` with `socket.join`, then answered with `ok: true` together with that device's **last reading** from the notice board (`findDevice`). Messages missed while the client wasn't connected yet aren't sent again, so this last reading is what fills the screen while new readings are awaited. The `respond` function is the Socket.IO acknowledgement, not the MQTT `ack`.
- **`unfollow`** takes the client out of the room with `socket.leave`, and **`disconnect`** records a client that leaves, together with the reason.
- **`preClose`**. When the backend is shut down gracefully (Practice 6), Fastify waits for every connection to finish. Socket.IO connections never finish by themselves, so this hook disconnects them all first.

Below that are two broadcast functions. **`broadcastTelemetry`** now uses `io.to("device:…")`, so a reading only reaches that device's room. **`broadcastStatus`** uses `io.emit`, so the status reaches every client.

#### 1.2 Status to every client

Open **`backend/src/services/mqtt.ts`**.

1. Change the import line from the Quick Win to:

   ```ts
   import { broadcastStatus, broadcastTelemetry } from "./realtime.ts";
   ```

2. Find the line `saveStatus(deviceId, result.data);` in the `status` part, then add one line right below it:

   ```ts
       broadcastStatus(deviceId, result.data); // Module 19
   ```

3. Change the comment on the `broadcastTelemetry(…)` line to `// Module 19: passed on right away to the clients following this device`, so that the comment matches its new behavior.

Save both files, then check with `npm run check` in the backend terminal (stop `npm run dev` first with **Ctrl + C**, or open a new terminal and go into the `backend` folder with `cd backend`). There must be no error messages.

#### 1.3 A small terminal that follows one device

Open **`tools/live-terminal.js`** and replace its whole content:

```js
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
  console.log(`[${time()}] ${id}  temp ${content.temperature} °C  humidity ${content.humidity} %  soil ${content.soil} %${note}`);
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
socket.on("connect_error", (error) => console.log(`[${time()}] can't connect yet: ${error.message}`));
socket.on("disconnect", (reason) => {
  console.log(`[${time()}] disconnected: ${reason}`);
  // "io server disconnect" = the server dropped us on purpose (for example stopped with Ctrl + C). Socket.IO doesn't
  // reconnect by itself in that case, so we ask for it ourselves; when the server is back, we connect again.
  if (reason === "io server disconnect") socket.connect();
});
```

- The backend's address and the `device_id` are taken from **`process.argv`**: the third and fourth words on the command line. Without a `device_id`, the program explains how to use it and then stops.
- **`emitWithAck("follow", deviceId)`** sends a request and **waits for its answer** with `await`. **`timeout(5000)`** limits that wait to 5 seconds, so that the program doesn't wait forever if the backend stays silent.
- The `follow` request is sent inside **`connect`** on purpose. When the connection drops, the room membership is lost too. Because `connect` fires again every time Socket.IO reconnects, the small terminal always joins its room again without your help.
- The line `transport upgraded to websocket` shows the "upgrade" from HTTP to WebSocket (Concept 1).
- A `disconnect` with the reason **`io server disconnect`** means the backend disconnected the client on purpose, for example when it's shut down gracefully. In that case Socket.IO doesn't reconnect by itself, so the program asks for it with `socket.connect()`.

#### 1.4 Try it with two small terminals

Run the backend again in the first terminal (`npm run dev`), then stop the Quick Win version of the small terminal in the third terminal (**Ctrl + C**). **The device path:** leave Node 1 on, open a new terminal for the simulator (`cd tools`), then run the simulator for **one** device with your Pi broker's address (for example `node device-simulator.js mqtt://192.168.1.37:1883 1`), so that there's a device `f00d00000001` that can be followed and stopped in this step. **The laptop path:** in the simulator terminal, stop the simulator (**Ctrl + C**), then run it again for **two** devices:

```text
node device-simulator.js mqtt://127.0.0.1:1883 2
```

In the third terminal (the `tools` folder), follow the first device:

```text
node live-terminal.js http://127.0.0.1:8080 f00d00000001
```

Open a fourth terminal, go into the `tools` folder (`cd tools`), then follow the second device: on the **device path** `a4cf12e5b7c0` (replace it with your Node 1's `device_id`), on the **laptop path** `f00d00000002`.

```text
node live-terminal.js http://127.0.0.1:8080 a4cf12e5b7c0
```

**Expected output** in the third terminal (**example**):

```text
[6:09:19 AM] connected to http://127.0.0.1:8080 (polling)
[6:09:19 AM] transport upgraded to websocket
[6:09:19 AM] following f00d00000001
[6:09:25 AM] f00d00000001  temp 32 °C  humidity 65 %  soil 30 %
[6:09:35 AM] f00d00000001  temp 28.7 °C  humidity 56 %  soil 55 %
[6:09:45 AM] f00d00000001  temp 31.9 °C  humidity 55 %  soil 35 %
```

**Expected output** in the fourth terminal (**example**, Node 1):

```text
[6:09:21 AM] connected to http://127.0.0.1:8080 (polling)
[6:09:21 AM] transport upgraded to websocket
[6:09:21 AM] following a4cf12e5b7c0
[6:09:25 AM] a4cf12e5b7c0  temp 28.5 °C  humidity 71 %  soil 37 %
[6:09:35 AM] a4cf12e5b7c0  temp 28.5 °C  humidity 71 %  soil 37 %
```

Each small terminal **only** shows the device it follows. Sometimes a new connection has already upgraded before `connect`, so the first line says `(websocket)` right away and the `transport upgraded …` line doesn't appear. That's normal. The backend terminal records both of its guests:

```text
[06:09:19] INFO: realtime client connected: fP9IXYan9uqr-RSLAAAA
[06:09:19] INFO: client fP9IXYan9uqr-RSLAAAA follows f00d00000001
[06:09:21] INFO: realtime client connected: orP8Tec3jUshm-lmAAAB
[06:09:21] INFO: client orP8Tec3jUshm-lmAAAB follows a4cf12e5b7c0
```

Now stop the simulator (**Ctrl + C** in its terminal). The simulator disappears without saying goodbye, so the broker publishes the `offline` last will in its name (Module 11), and **both** small terminals show the same line, because status goes to every client (with the two-device simulator, there's one more line for `f00d00000002`):

```text
[6:10:48 AM] f00d00000001 is now offline
```

Run the simulator again before you continue (the laptop path for two devices, the device path for one), so that the readings keep flowing.

#### 1.5 A mistaken client and a latecomer

In the fourth terminal, stop the small terminal (**Ctrl + C**), then try an invalid `device_id`:

```text
node live-terminal.js http://127.0.0.1:8080 ABC
```

**Expected output** (**example**):

```text
[6:09:25 AM] connected to http://127.0.0.1:8080 (polling)
[6:09:25 AM] transport upgraded to websocket
[6:09:25 AM] refused by the server: device_id must be 12 lowercase hexadecimal digits
```

The Zod check in `follow` works: the backend refuses without getting confused itself. (The times in this example are earlier than the `offline` line in 1.4, because the author tried it before the simulator was stopped.) Stop it with **Ctrl + C**, then try it without any `device_id` at all (`node live-terminal.js http://127.0.0.1:8080`). The program refuses before connecting:

```text
Write the device's device_id, for example: node live-terminal.js http://127.0.0.1:8080 f00d00000001
```

Finally, follow the second device again, as in 1.4. This time the small terminal immediately shows the **last reading** from the answer to `follow`, without waiting for the next reading:

```text
[6:10:53 AM] connected to http://127.0.0.1:8080 (websocket)
[6:10:53 AM] following a4cf12e5b7c0
[6:10:53 AM] a4cf12e5b7c0  temp 28.5 °C  humidity 71 %  soil 37 %  (last reading)
[6:10:55 AM] a4cf12e5b7c0  temp 28.5 °C  humidity 71 %  soil 37 %
```

#### 1.6 The backend stops, the small terminal waits

Stop the backend with **Ctrl + C** in the first terminal. The two small terminals don't stop with it. They keep trying to reconnect, at first every 1–3 seconds, then less and less often, up to about every 5 seconds (**example**, the first lines):

```text
[6:11:44 AM] disconnected: transport close
[6:11:45 AM] can't connect yet: xhr poll error
[6:11:48 AM] can't connect yet: xhr poll error
[6:11:50 AM] can't connect yet: xhr poll error
```

Run the backend again (`npm run dev`). Within a few seconds, both small terminals connect and follow their devices again by themselves:

```text
[6:12:26 AM] connected to http://127.0.0.1:8080 (polling)
[6:12:26 AM] transport upgraded to websocket
[6:12:26 AM] following f00d00000001
```

The reason `transport close` means the connection was simply cut because the backend died suddenly. Practice 6 adds a graceful way to stop; if the backend is run with `npm start` and then stopped with **Ctrl + C**, the reason becomes `io server disconnect`.

#### 1.7 Save to the branch

Stop both small terminals, then also stop the backend in the first terminal (**Ctrl + C** in every terminal). A terminal that's running a program can't take other commands. The first terminal is still in the `backend` folder, so `cd ..` below takes it back to the `mini-smart-home` folder. Save your work:

```text
cd ..
git add backend tools
git status --short
git commit -m "Live data through Socket.IO with one room per device (Module 19 Practice 1)"
```

**Expected output** of `git status --short` (**example**):

```text
M  backend/package-lock.json
M  backend/package.json
M  backend/src/server.ts
M  backend/src/services/mqtt.ts
A  backend/src/services/realtime.ts
A  tools/live-terminal.js
M  tools/package-lock.json
M  tools/package.json
```

The `node_modules` folders in `backend` and `tools` aren't included, because both are already listed in their own `.gitignore` files (Modules 4 and 16).

> ⬆️ **Done with Practice 1?** Go back to [Concepts 3–4](#3-command--ack--timeout-a-command-that-knows-its-fate) before Practice 2.

### Practice 2 — One door for commands, and the device state (45 minutes)

> 🖥️ **Tools used:** **VS Code** (the backend, the simulator, and the small terminal), the browser for **`/docs`** (Swagger UI), and **MQTTX** from Module 11. The device path: Node 1 still runs firmware v1.4.0 until Practice 7, so its `telemetry` doesn't carry `state` yet; use the simulator for this practice, or just watch the commands and their `ack`s.

This practice puts Concepts 3–4 to work: every command goes through one door (`issueCommand()`), the backend remembers the **desired** state, and the device reports the state of its actuators in every `telemetry` (data contract **1.3**).

#### 2.1 The Module 19 simulator and contract checker

Data contract 1.3 adds a **`state`** object to Node 1's `telemetry`, two offline-mode report fields to `vitals`, and the details of what `config` holds (Concepts 4, 7, and 10). You copy its full text into `DATA-CONTRACT.md` in ➕ B. Two tools in the `tools` folder need to be updated to their new versions, and both are simply copied from the curriculum; you don't need to type them:

1. Open [`code/tools/device-simulator.js`](code/tools/device-simulator.js) on GitHub, click **Copy raw file** (the copy icon at the top right of the code box), then paste it in place of the whole content of your **`tools/device-simulator.js`**.
2. Do the same for [`code/tools/contract-checker.js`](code/tools/contract-checker.js) → **`tools/contract-checker.js`**.

The Module 19 version of the simulator can do four new things: write `state` in every `telemetry`, send a `telemetry` right away when its actuators change, save `config` to `data/simulator-store.json` in place of NVS, and take temperature commands from the terminal (`temp 33`, `temp random`). Its offline-mode abilities are used in Practice 7. In the simulator terminal, stop the old simulator (**Ctrl + C**), then run the new version for one device (the device path uses your Pi broker's address, for example `mqtt://192.168.1.37:1883`, and Node 1 may stay on):

```text
node device-simulator.js mqtt://127.0.0.1:1883 1
```

**Expected output:**

```text
1 fake device(s) heading to mqtt://127.0.0.1:1883. Type "temp 33" or "temp random". Stop with Ctrl+C.
f00d00000001: online
```

If you subscribe to `msh/f00d00000001/#` in MQTTX, every `telemetry` now ends with a `state` object (**example**):

```json
{"ts":"2026-10-20T22:41:55Z","fw":"0.1.0","temperature":28.5,"humidity":66,"light":2075,"soil":39,"motion":false,"water_level":50,"state":{"fan":false,"lamp":false,"pump":false,"curtain":90}}
```

Leave the simulator running. Backend v0.3 still uses the contract 1.2 schemas, so for now it **rejects** this new `telemetry` (the `state` field isn't known yet); the next step fixes that.

#### 2.2 Contract 1.3 schemas: `contract.ts`

Open **`backend/src/schemas/contract.ts`**.

1. Change the comment on the first line: `data contract 1.2` to `data contract 1.3`.
2. `TelemetryNode1` now uses `State`, so **move** the `State` schema (the four lines `fan`, `lamp`, `pump`, `curtain`) from below `Vitals` to **above** the `TelemetryNode1` comment line. In v0.3, `State` has no comment yet, so also add a one-line comment above it. The result looks like this:

   ```ts
   // the state of the four actuators, the same in ack (contract 1.0) and in Node 1 telemetry (contract 1.3)
   export const State = z.strictObject({
     fan: z.boolean(),
     lamp: z.boolean(),
     pump: z.boolean(),
     curtain: z.number().int().min(0).max(180),
   });
   ```

3. Inside `TelemetryNode1`, add one line right below `ec: integer(0, 20000).optional(),`:

   ```ts
     state: State.optional(),
   ```

   `optional()` makes sure that a Node 1 with older firmware (without `state`) is still accepted. Also replace the one-line comment above `TelemetryNode1` with these two lines: `// Node 1 telemetry (contract 1.0) plus three RS-485 sensor fields that may be missing (contract 1.2) and the actuator` and `// state (contract 1.3; older firmware doesn't write it yet, so it may be missing)`.

4. Replace the `Vitals` schema with a version that accepts the offline-mode report:

   ```ts
   // vitals (contract 1.0) plus the offline-mode report (contract 1.3): offline_s and local_fan always come together
   export const Vitals = z
     .strictObject({
       ts: Time,
       rssi: z.number().int().max(0),
       uptime_s: z.number().int().min(0),
       heap_free: z.number().int().min(0),
       offline_s: z.number().int().min(0).optional(),
       local_fan: z.number().int().min(0).optional(),
     })
     .refine((v) => (v.offline_s === undefined) === (v.local_fan === undefined),
       "the offline-mode report must be complete: offline_s and local_fan always come together");
   ```

   `.refine` (Module 16) checks a rule that involves two fields at once: both are there, or neither is.

5. In the `export type` list at the very bottom, add this line as its first line:

   ```ts
   export type State = z.infer<typeof State>;
   ```

#### 2.3 The notice board records the reports: `store.ts`

Open **`backend/src/services/store.ts`**.

1. Add `State` to the type import line: `import type { Ack, State, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";`.
2. Add three fields at the end of the `Device` interface, right below `vitals: Vitals | null;`:

   ```ts
     reported: State | null; // Module 19: the actuator state the device reported last (telemetry.state or ack.state)
     reported_ts: string | null; // Module 19: the ts of that report, by the device's clock
     reported_at: string | null; // Module 19: server time (UTC) when that report arrived
   ```

3. In the `getOrCreate` function, a new device object now has to have those three fields. Replace the line `d = { device_id: … };` with:

   ```ts
       d = {
         device_id: deviceId, kind: "unknown", status: "unknown", last_seen: "", telemetry: null,
         vitals: null, reported: null, reported_ts: null, reported_at: null,
       };
   ```

4. Add a new function right above `export function saveTelemetry`:

   ```ts
   // Module 19: save a report of the actuator state, unless that report is older than the one already stored (device ts).
   // Times in the contract format (2026-10-21T06:10:12Z) can be compared directly as text. The result is true if it is used.
   export function saveReport(deviceId: string, state: State, ts: string | null): boolean {
     const d = getOrCreate(deviceId);
     if (ts !== null && d.reported_ts !== null && ts < d.reported_ts) return false;
     d.reported = state;
     d.reported_ts = ts ?? d.reported_ts; // ack.ts may be null (the device's clock isn't set yet)
     d.reported_at = new Date().toISOString();
     return true;
   }
   ```

   A report can arrive late, for example a delayed `telemetry` that was held up in the network. Because the device's `ts` is compared, an older report doesn't overwrite a newer one. (`ts` only goes down to the second, so two reports within the same second are used in the order they arrive.)

#### 2.4 One door for every command: `log.ts` and `commands.ts`

From this week on, a few parts of the backend that don't hold Fastify's `app` object (commands, rules, schedules, and Telegram) need to write to the server log. So that they all write to the same log book, first create the small file **`backend/src/services/log.ts`** (right-click the **`services`** folder → **New File…**):

```ts
// log.ts - one "log book" for the services that don't hold the Fastify app (commands, rules, schedules, Telegram).
// server.ts fills it with app.log once, right after the server is created (Module 19).
import type { FastifyBaseLogger } from "fastify";

let logger: FastifyBaseLogger | undefined;

export function useLog(serverLog: FastifyBaseLogger): void {
  logger = serverLog;
}

export const log = {
  info: (message: string) => logger?.info(message),
  warn: (message: string) => logger?.warn(message),
  error: (message: string) => logger?.error(message),
};
```

`useLog(app.log)` is called once by `server.ts` (step 2.6). After that, any file can write `log.info("…")`, and the line appears in the backend terminal with the same time and format as Fastify's log.

Then create the file **`commands.ts`** in the same folder, and type:

```ts
// commands.ts - one door for ALL commands to the devices (Module 19): the API, automation rules, schedules, and Telegram
// use the same function, issueCommand(). It also records the state the server WANTS (desired) for the actuators whose
// state lasts (fan, lamp, curtain), then matches it against the state the device REPORTS (reported).
import type { Ack, State, SetCommand } from "../schemas/contract.ts";
import { findDevice, saveReport, waitForAck } from "./store.ts";
import { brokerConnected, makeCommandId, sendCommand } from "./mqtt.ts";
import { archiveCommand } from "../db/archive.ts";
import { log } from "./log.ts";

export type Source = "api" | "rule" | "schedule" | "telegram"; // who gave the order

// The result of one command. "answered" = there is an ack (ok true or false), "no-ack" = no answer within 5 seconds,
// "not-sent" = the command wasn't published at all (the API uses its code as the HTTP code).
export type CommandResult =
  | { status: "answered"; id: string; wait_ms: number; ack: Ack }
  | { status: "no-ack"; id: string; wait_ms: number }
  | { status: "not-sent"; code: 404 | 409 | 503; message: string };

const ACK_TIMEOUT_MS = 5000; // every cmd is answered by an ack within 5 seconds (contract rule 4)
const RETRY_INTERVAL_MS = 30_000; // reconciliation: at most once every 30 seconds per actuator

// the pump has no lasting state: its command is a 1-10 second pulse that turns off by itself
type LastingCommand = Extract<SetCommand, { target: "fan" | "lamp" | "curtain" }>;

// One wish of the server for one actuator.
interface Wish {
  command: LastingCommand;
  source: Source;
  ruleId: number | null;
  triedAt: number; // when its command was last sent (milliseconds, like Date.now())
  fulfilled: boolean; // has the device ever reported the wished state?
}

const wishes = new Map<string, Map<string, Wish>>(); // device_id -> (target -> wish)
const ackPending = new Set<string>(); // "<device_id>/<target>" whose command is waiting for an ack

export async function issueCommand(deviceId: string, command: SetCommand, source: Source,
  ruleId: number | null = null): Promise<CommandResult> {
  const d = findDevice(deviceId);
  if (d === undefined) return { status: "not-sent", code: 404, message: `device ${deviceId} has never been heard` };
  if (d.kind === "node2") return { status: "not-sent", code: 409, message: "Node 2 doesn't accept commands (contract section 2)" };
  if (d.kind !== "node1") {
    return { status: "not-sent", code: 409, message: "device kind not known yet: wait for its first telemetry" };
  }
  if (d.status !== "online") return { status: "not-sent", code: 409, message: `device is ${d.status}, command not sent` };
  if (!brokerConnected()) return { status: "not-sent", code: 503, message: "the backend isn't connected to the broker" };
  const key = `${deviceId}/${command.target}`;
  if (ackPending.has(key)) { // one actuator, one command being waited for
    return { status: "not-sent", code: 409, message: `the previous ${command.target} command is still waiting for its ack` };
  }

  if (command.target !== "pump") recordWish(deviceId, command, source, ruleId);
  const id = makeCommandId();
  const start = Date.now();
  ackPending.add(key);
  const waiting = waitForAck(id, ACK_TIMEOUT_MS); // start waiting BEFORE sending
  sendCommand(deviceId, id, command);
  const ack = await waiting;
  ackPending.delete(key);
  const elapsed = Date.now() - start;
  archiveCommand(id, deviceId, command, new Date(start), ack, elapsed)
    .catch((error) => log.error(`couldn't record command ${id} in the database: ${error.message}`));
  if (ack === null) {
    log.warn(`command ${id} (${source}) to ${deviceId}: no ack within 5 seconds`);
    return { status: "no-ack", id, wait_ms: elapsed };
  }
  if (!ack.ok) wishes.get(deviceId)?.delete(command.target); // refused by the device: don't try again
  log.info(`command ${id} (${source}) to ${deviceId}: ${command.target} = ${command.value}, ack ok=${ack.ok} in ${elapsed} ms`);
  return { status: "answered", id, wait_ms: elapsed, ack };
}

function recordWish(deviceId: string, command: LastingCommand, source: Source, ruleId: number | null): void {
  let deviceWishes = wishes.get(deviceId);
  if (deviceWishes === undefined) {
    deviceWishes = new Map();
    wishes.set(deviceId, deviceWishes);
  }
  deviceWishes.set(command.target, { command, source, ruleId, triedAt: Date.now(), fulfilled: false });
}

// Called by mqtt.ts every time a telemetry or ack of a device arrives. state = the state in that message (null for
// telemetry from older firmware that doesn't carry state yet).
export function recordReport(deviceId: string, state: State | null, ts: string | null): void {
  if (state !== null && saveReport(deviceId, state, ts)) {
    for (const w of wishes.get(deviceId)?.values() ?? []) {
      if (state[w.command.target] === w.command.value) w.fulfilled = true;
    }
  }
  reconcile(deviceId);
}

// Reconciliation: send again the wishes the device hasn't been seen carrying out YET. A wish that was fulfilled once
// isn't forced again: if a local rule of the device or MQTTX changes the actuator afterwards, the server doesn't fight it.
function reconcile(deviceId: string): void {
  const d = findDevice(deviceId);
  if (d === undefined || d.reported === null || d.status !== "online") return;
  for (const w of wishes.get(deviceId)?.values() ?? []) {
    const { target, value } = w.command;
    if (w.fulfilled || d.reported[target] === value) continue; // already as wished
    if (ackPending.has(`${deviceId}/${target}`)) continue; // the previous command is still being waited for
    if (Date.now() - w.triedAt < RETRY_INTERVAL_MS) continue; // too soon: wait first
    const message = `${target} ${deviceId} reported ${d.reported[target]}, but ${value} is desired (${w.source}); `
      + "command sent again";
    log.warn(`reconcile: ${message}`);
    void issueCommand(deviceId, w.command, w.source, w.ruleId);
  }
}

// Called by mqtt.ts when vitals carries a small uptime_s: the device has just started (again), and all its relays are off
// at startup. Even the wishes that were already fulfilled are reconciled again.
export function deviceRestarted(deviceId: string, uptime: number): void {
  const list = wishes.get(deviceId);
  if (list === undefined || list.size === 0) return;
  log.warn(`${deviceId} has just restarted (uptime ${uptime} seconds): the server's wishes are reconciled again`);
  for (const w of list.values()) w.fulfilled = false;
}

// For GET /devices/:id/state: desired, reported, when reported arrived, and the actuators that don't match yet.
export function deviceState(deviceId: string) {
  const d = findDevice(deviceId);
  if (d === undefined) return undefined;
  const desired: { fan?: boolean; lamp?: boolean; curtain?: number } = {};
  const diff: string[] = [];
  for (const { command } of wishes.get(deviceId)?.values() ?? []) {
    if (command.target === "curtain") desired.curtain = command.value;
    else desired[command.target] = command.value;
    if (d.reported === null || d.reported[command.target] !== command.value) diff.push(command.target);
  }
  return { device_id: deviceId, desired, reported: d.reported, reported_at: d.reported_at, diff };
}
```

This file is the heart of Concepts 3–4. Read it from top to bottom:

- **`CommandResult`** writes down the fate of every command (the Concept 3 table): `answered`, `no-ack`, or `not-sent`, together with a fitting HTTP code (`404`, `409`, `503`).
- **`issueCommand()`** checks the device first (the same checks as the v0.3 route), then applies two new rules: **one actuator, one waiting command** (`ackPending`), and wishes are only recorded for actuators whose state lasts (not the pump). After that, the pattern is the same as in Module 16: start waiting for the `ack` **before** sending, send, wait 5 seconds at most, then record it in the `commands` table. A command the device refuses (`ok: false`) is removed from the list of wishes, so that it isn't tried again.
- **`Wish`** keeps the command, its source, when it was last tried, and **`fulfilled`**: whether the device has ever reported the wished state or not. The **`LastingCommand`** type above it uses TypeScript's **`Extract<…>`**, which filters `SetCommand` down to the commands whose `target` is `fan`, `lamp`, or `curtain`. So a pump command can never get into the list of wishes.
- **`recordReport()`** is called every time a `telemetry` or an `ack` arrives. It saves the report through `saveReport`, marks the wishes that are now fulfilled, then calls `reconcile()`.
- **`reconcile()`** is the reconciliation of Concept 4. A wish is only sent again if it has never been fulfilled, differs from the report, no command for that actuator is still waiting for an `ack`, and 30 seconds have passed since the last try. The `void` in front of `issueCommand(…)` means "run it without waiting for the result".
- **`deviceRestarted()`** clears the `fulfilled` mark of every wish of a device that has just started, so that all of them are reconciled again.
- **`deviceState()`** builds the answer for `GET /devices/:id/state`.

#### 2.5 The command route through the same door, and the state route: `devices.ts`

Open **`backend/src/routes/devices.ts`**.

1. Change the second line of the header comment to `// commands, and the actuator state (desired/reported, Module 19).`
2. Replace the four import lines below `import type { FastifyPluginAsyncZod } …` with:

   ```ts
   import { Ack, DeviceId, State, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
   import { findDevice, allDevices } from "../services/store.ts";
   import { deviceState, issueCommand } from "../services/commands.ts";
   import { getSummary, getHistory, contractTime } from "../db/archive.ts";
   ```

3. In the `POST /devices/:id/command` route, change the description of `409` to:

   ```ts
           409: ErrorBody.describe("the device is offline, is Node 2, its kind isn't known yet, or an earlier command for "
             + "the same actuator is still waiting for its ack"),
   ```

4. Still in that route, replace the **whole body** of the function `async (req, reply) => { … }` (from `const d = findDevice(…)` to `return { id: commandId, wait_ms: elapsed, ack };`) with four lines:

   ```ts
       const result = await issueCommand(req.params.id, req.body, "api"); // Module 19: through the same single door
       if (result.status === "not-sent") return reply.code(result.code).send({ message: result.message });
       if (result.status === "no-ack") return reply.code(504).send({ message: `no ack for ${result.id} within 5 seconds` });
       return { id: result.id, wait_ms: result.wait_ms, ack: result.ack };
   ```

5. Add a new route below it, before the `};` that closes the file:

   ```ts
     app.get("/devices/:id/state", {
       schema: {
         tags: ["devices"],
         summary: "Actuator state: what the server wants (desired) and what the device reports (reported)",
         params: IdParam,
         response: {
           200: z.object({
             device_id: z.string(),
             desired: z.object({ fan: z.boolean().optional(), lamp: z.boolean().optional(), curtain: z.number().optional() })
               .describe("the state the server wants for the fan, the lamp, and the curtain (not the pump: its command runs once)"),
             reported: State.nullable().describe("the last state the device reported through telemetry or ack"),
             reported_at: z.string().nullable().describe("server time when that report arrived"),
             diff: z.array(z.string()).describe("the actuators whose state doesn't match the server's wish yet"),
           }).describe("desired, reported, and the difference"),
           404: ErrorBody.describe("the device has never been heard"),
         },
       },
     }, async (req, reply) => {
       const state = deviceState(req.params.id);
       if (state === undefined) return reply.code(404).send({ message: `device ${req.params.id} has never been heard` });
       return state;
     });
   ```

#### 2.6 MQTT passes on the news: `mqtt.ts` and `server.ts`

Open **`backend/src/services/mqtt.ts`**.

1. Below the line `import { broadcastStatus, broadcastTelemetry } from "./realtime.ts";`, add:

   ```ts
   import { recordReport, deviceRestarted } from "./commands.ts";
   ```

2. In the `telemetry` part, replace the five lines from `saveTelemetry(deviceId, result.data);` to `.then((isNew) => …)` (including the line `const ts = result.data.ts;` between them) with a version that gives the checked data the name `content` and records its state report:

   ```ts
       const content = result.data;
       saveTelemetry(deviceId, content);
       broadcastTelemetry(deviceId, content); // Module 19: passed on right away to the clients following this device
       if (!("pressure" in content)) recordReport(deviceId, content.state ?? null, content.ts); // Module 19: actuator state
       archiveTelemetry(deviceId, content)
         .then((isNew) => { if (!isNew) log.info(`duplicate skipped: ${deviceId} ${content.ts}`); })
   ```

   The line `.catch(archiveFailed(topic, log));` below them stays. The check `"pressure" in content` skips Node 2, which has no actuators.

3. In the `vitals` part, add two lines right below `saveVitals(deviceId, result.data);`:

   ```ts
       // Module 19: the first vitals after the device starts carries a small uptime; all its relays have just turned off
       if (result.data.uptime_s < 60) deviceRestarted(deviceId, result.data.uptime_s);
   ```

4. In the `ack` part, add one line right below `if (!result.success) return reject(…);`:

   ```ts
       recordReport(deviceId, result.data.state, result.data.ts); // Module 19: every valid ack updates the reported state
   ```

Then open **`backend/src/server.ts`**. Below `import { startRealtime } from "./services/realtime.ts";`, add `import { useLog } from "./services/log.ts";`. Then add one line right below the closing `});` of `const app = Fastify({ … });`, before `app.addHook("onResponse", …)`:

```ts
useLog(app.log); // Module 19: other services (commands, rules, schedules, Telegram) write to the same log
```

Save everything. In the first terminal, go into the `backend` folder again (`cd backend`; since the Practice 1 commit, that terminal has been in `mini-smart-home`), then run `npm run check`. There must be no errors.

#### 2.7 The small terminal shows the fan and the lamp

Open **`tools/live-terminal.js`** and replace the `show` function with:

```js
function show(id, content, note = "") {
  // contract 1.3: Node 1 telemetry carries state, so the fan and lamp state are shown too
  const actuators = content.state ? `  fan ${content.state.fan ? "ON" : "off"}  lamp ${content.state.lamp ? "ON" : "off"}` : "";
  console.log(`[${time()}] ${id}  temp ${content.temperature} °C  humidity ${content.humidity} %  soil ${content.soil} %${actuators}${note}`);
}
```

#### 2.8 Try it: commands, state, and reconciliation

Run the backend (`npm run dev`) and the small terminal for the simulated device (`node live-terminal.js http://127.0.0.1:8080 f00d00000001`). Then open **`http://127.0.0.1:8080/docs`** in the browser.

1. Open the **`GET /devices/{id}/state`** route → **Try it out** → fill in `id` with `f00d00000001` → **Execute**. **Expected output** (**example**):

   ```json
   {
     "device_id": "f00d00000001",
     "desired": {},
     "reported": {
       "fan": false,
       "lamp": false,
       "pump": false,
       "curtain": 90
     },
     "reported_at": "2026-10-20T23:22:31.244Z",
     "diff": []
   }
   ```

   There are no wishes yet (`desired` is empty), and the report comes from the last `telemetry`.

2. Open **`POST /devices/{id}/command`** → **Try it out** → fill in `id` with `f00d00000001` and the body with `{"target":"fan","value":true}` → **Execute**. **Expected output** (**example**):

   ```json
   {
     "id": "c-20261020-232239-1",
     "wait_ms": 6,
     "ack": {
       "id": "c-20261020-232239-1",
       "ts": "2026-10-20T23:22:39Z",
       "ok": true,
       "state": {
         "fan": true,
         "lamp": false,
         "pump": false,
         "curtain": 90
       }
     }
   }
   ```

   The small terminal immediately shows `fan ON`, and the backend log writes its source:

   ```text
   [06:22:39] INFO: command c-20261020-232239-1 (api) to f00d00000001: fan = true, ack ok=true in 6 ms
   ```

3. Send two more commands through the same route: `{"target":"curtain","value":45}` and `{"target":"pump","value":3}`. Then open `GET /devices/{id}/state` again. **Expected output** (**example**):

   ```json
   {
     "device_id": "f00d00000001",
     "desired": {
       "fan": true,
       "curtain": 45
     },
     "reported": {
       "fan": true,
       "lamp": false,
       "pump": true,
       "curtain": 45
     },
     "reported_at": "2026-10-20T23:22:40.670Z",
     "diff": []
   }
   ```

   The fan and the curtain are recorded as wishes; the pump isn't, because its command is only a 3-second pulse. The report shows that the pump was on at that moment, and a few seconds later it turns off by itself.

4. Now turn the fan off **without going through the backend**, as if another brain did it. In MQTTX, publish to the topic `msh/f00d00000001/cmd` (QoS 0, **without** retained):

   ```json
   {"id":"mqttx-1","action":"set","target":"fan","value":false}
   ```

   The backend log writes `ack mqttx-1 arrived, but no command is waiting for it`, and `GET /devices/{id}/state` now shows `"fan": false` in `reported`, with `"diff": ["fan"]`. Wait a minute, then look again: the difference is still there, and the backend does **not** send the fan command again. The fan wish has already been fulfilled once, so the backend doesn't fight the other brain (Concept 4).

5. Stop the simulator (**Ctrl + C**), wait 10 seconds, then run it again. A device that has just started reports a small `uptime_s`, and the backend reconciles all its wishes. **Expected output** in the backend log (**example**; the repeated commands are only sent a few seconds later, after the next report arrives and 30 seconds have passed since the last try):

   ```text
   [06:27:37] WARN: f00d00000001 has just restarted (uptime 0 seconds): the server's wishes are reconciled again
   [06:27:49] WARN: reconcile: fan f00d00000001 reported false, but true is desired (api); command sent again
   [06:27:49] WARN: reconcile: curtain f00d00000001 reported 90, but 45 is desired (api); command sent again
   [06:27:49] INFO: command c-20261020-232749-3 (api) to f00d00000001: fan = true, ack ok=true in 5 ms
   [06:27:49] INFO: command c-20261020-232749-4 (api) to f00d00000001: curtain = 45, ack ok=true in 7 ms
   ```

   A simulator that has just started begins with all its actuators off (curtain at 90°), exactly like a real Node 1, then the backend puts its wishes back.

6. Finally, stop the simulator again and send `{"target":"lamp","value":true}`. **Expected output**: code `409`:

   ```json
   {
     "message": "device is offline, command not sent"
   }
   ```

   Run the simulator again before you continue.

One thing to remember: every time a backend file is saved, `npm run dev` restarts the backend, and the wishes kept in memory are lost with it (`"desired": {}`). That's what Concept 4 says; the command history stays in the `commands` table. Before you save to the branch, stop the backend in the first terminal (**Ctrl + C**). That terminal is still in the `backend` folder, and `cd ..` below takes it to the `mini-smart-home` folder.

#### 2.9 Save to the branch

```text
cd ..
git add backend tools
git commit -m "One door for commands, desired/reported state, and data contract 1.3 in the backend (Module 19 Practice 2)"
```

The simulator may keep running in its own terminal. The `tools/data/` folder, where the simulator saves `config` from Practice 4 on, won't be included, because it's already listed in `tools/.gitignore`.

> ⬆️ **Done with Practice 2?** Go back to [Concepts 5–6](#5-the-rules-engine-rules-as-data-not-code) before Practice 3.

### Practice 3 — The rules brain and 10 unit tests (60 minutes)

> 🖥️ **Tools used:** **VS Code** with a terminal in the `backend` folder. This practice doesn't need a broker, a device, or a database: the rules brain is tested on its own.
>
> ⭐ **Required** — ten green unit tests of the rules engine are one of the main results of this module (Syllabus: "10 green rules-engine unit tests").

This practice puts Concepts 5–6 to work: rules are written as data checked by Zod, the brain is written as pure functions, then it's tested with Vitest. This brain isn't connected to MQTT yet; that's Practice 4's job.

#### 3.1 Install Vitest

Stop `npm run dev` if it's still running (**Ctrl + C**). Since the Practice 2 commit, the first terminal has been in the `mini-smart-home` folder, so go into the `backend` folder again with `cd backend` (the end of the prompt now reads `backend>`; on macOS `backend %`). There, install Vitest as a **development tool** (`--save-dev`): it's only used while writing and checking code, not while the backend runs. The `vite` package is listed too, because Vitest needs it:

```text
npm install --save-dev vitest@5.0.5 vite@8.3.4
```

**Expected output:**

```text
added 35 packages, and audited 199 packages in 33s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

The packages are fairly big: the `node_modules` folder grows by about 40 MB, so give it time if your connection is slow. Then open **`backend/package.json`** and add one script in the `"scripts"` section, below `"seed-history"` (don't forget the comma at the end of the `"seed-history": …` line):

```json
    "test": "vitest run"
```

`vitest run` runs all the tests once and then finishes. Without the word `run`, Vitest keeps watching the files and tests again every time you save.

#### 3.2 The shape of a rule: `schemas/rules.ts`

Right-click the **`backend/src/schemas`** folder → **New File…**, name it **`rules.ts`**, then type:

```ts
// rules.ts - the shape of an automation rule (Module 19) as a Zod schema. A rule is DATA, not code: only the shapes
// known here may come in, both through the API and from the database.
import { z } from "zod";
import { DeviceId } from "./contract.ts";

// the telemetry quantities a threshold rule may use
const Quantity = z.enum(["temperature", "humidity", "light", "soil", "water_level", "soil_rs485", "soil_temperature"]);

// "If <quantity> of that device stays above <on_above> continuously for <for_seconds> seconds, the rule turns on;
// the rule turns off again when <quantity> is below <off_below>."
export const ThresholdCondition = z.strictObject({
  kind: z.literal("threshold"),
  device_id: DeviceId,
  quantity: Quantity,
  on_above: z.number(),
  off_below: z.number(),
  for_seconds: z.number().int().min(0).max(3600),
}).refine((c) => c.off_below < c.on_above, {
  message: "off_below must be smaller than on_above (hysteresis)",
  path: ["off_below"],
});

// "... then turn on <target> of that device, and turn it off again when the rule turns off."
export const SwitchAction = z.strictObject({
  kind: z.literal("switch"),
  device_id: DeviceId,
  target: z.enum(["fan", "lamp"]),
  notify: z.boolean(), // send a Telegram message when this rule acts?
});

// The body of POST /rules and PUT /rules/:id, and also the shape of the columns of the rules table.
export const Rule = z.strictObject({
  name: z.string().min(1).max(60),
  active: z.boolean(),
  condition: ThresholdCondition,
  action: SwitchAction,
});

export type ThresholdCondition = z.infer<typeof ThresholdCondition>;
export type Rule = z.infer<typeof Rule>;
```

- **`ThresholdCondition`**, **`SwitchAction`**, and **`Rule`** are the JSON shape of a rule from Concept 5, written as Zod schemas. `z.literal("threshold")` only accepts the exact text `threshold`, and `z.enum([…])` only accepts the quantities on its list.
- **`.refine`** on `ThresholdCondition` makes sure the hysteresis makes sense: the off limit must be **smaller than** the on limit. `path: ["off_below"]` makes its error message point at the wrong field.
- This schema is used at two doors: the body of API requests (Practice 4) and the rows read from the `rules` table. The contents of the table can be changed by hand through DBeaver, so even the database's contents aren't trusted right away.

#### 3.3 The rules brain: `rules/engine.ts`

Right-click the **`backend/src`** folder → **New Folder…**, name it **`rules`**. Inside it, create the file **`engine.ts`**:

```ts
// engine.ts - the "brain" of the automation rules (Module 19) as PURE functions: it reads no clock, database, or MQTT.
// Everything it needs comes in through the arguments, so the same input always gives the same result (easy to test).
import type { ThresholdCondition } from "../schemas/rules.ts";

// The memory of one threshold rule from reading to reading.
export interface Memory {
  active: boolean; // is the rule "on" right now (for example, the fan should be on)?
  since: number | null; // when the readings started to be above the on threshold (milliseconds); null = not waiting
  last: number | null; // when the last reading was evaluated (milliseconds)
}

export const INITIAL_MEMORY: Memory = { active: false, since: null, last: null };
export const MAX_GAP_MS = 60_000; // readings more than 60 seconds apart: the "for" count starts again from zero

export type Decision = "turn-on" | "turn-off" | null; // null = nothing needs to be done

// Evaluate one reading. now = the time the reading arrived (milliseconds, like Date.now()), given by the caller.
// A decision only comes out when the rule CHANGES state (at the edge), not at every reading.
export function evaluateThreshold(c: ThresholdCondition, memory: Memory, value: number | null, now: number):
  { memory: Memory; decision: Decision } {
  const interrupted = memory.last !== null && now - memory.last > MAX_GAP_MS;
  const base: Memory = { ...memory, last: now, since: interrupted ? null : memory.since };
  if (value === null) { // the sensor couldn't be read: decide nothing, and the "for" count starts again
    return { memory: { ...base, since: null }, decision: null };
  }
  if (!base.active) {
    if (value <= c.on_above) return { memory: { ...base, since: null }, decision: null }; // not hot yet
    const since = base.since ?? now; // the first hot reading starts the count
    if (now - since >= c.for_seconds * 1000) {
      return { memory: { ...base, active: true, since: null }, decision: "turn-on" };
    }
    return { memory: { ...base, since }, decision: null }; // hot, but not long enough yet: waiting
  }
  if (value < c.off_below) return { memory: { ...base, active: false, since: null }, decision: "turn-off" };
  return { memory: base, decision: null }; // still above the off threshold (inside the hysteresis gap): stays on
}

// Notification debouncing: notify when the situation changes; while still in danger, remind at most every 30 minutes.
export type Situation = "safe" | "danger";

export interface NotifyRecord {
  situation: Situation; // the situation that was notified last
  lastSent: number | null; // when the last message was sent (milliseconds)
}

export const INITIAL_RECORD: NotifyRecord = { situation: "safe", lastSent: null };
export const REMINDER_MS = 30 * 60_000;

export function shouldNotify(r: NotifyRecord, current: Situation, now: number): { send: boolean; record: NotifyRecord } {
  if (current !== r.situation) return { send: true, record: { situation: current, lastSent: now } }; // changed
  if (current === "danger" && r.lastSent !== null && now - r.lastSent >= REMINDER_MS) {
    return { send: true, record: { ...r, lastSent: now } }; // reminder
  }
  return { send: false, record: r }; // quiet
}
```

The first part is the threshold rule:

- **`Memory`** is one rule's record from reading to reading: whether the rule is on (`active`), since when the readings have been above the on limit (`since`), and when the last reading was evaluated (`last`). All the times are stored as numbers of milliseconds, as in the warm-up.
- **`evaluateThreshold`** never calls `Date.now()`. The current time is given by its caller through `now`, and its result depends only on its four inputs. That's a pure function.
- The order of its checks follows the three ideas of Concept 5: a **gap of more than 60 seconds** or a **`null` reading** restarts the count; while the rule isn't on yet, a reading that isn't **above** `on_above` (`<=`) restarts the count too, and "turn-on" only comes out after `for_seconds` (`>=`); once the rule is on, only a reading **below** `off_below` turns it off.
- `{ ...base, since: null }` is a spread (Module 17): a copy of the memory with one field replaced. The old memory is never changed directly, so there are no side effects.

The second part is the Telegram **debouncing** (Concept 9). Its shape is a little different from `shouldNotify` in the warm-up: instead of four separate numbers, it keeps one **`NotifyRecord`** (the last situation it notified about, and when the last message was sent), then returns a `send` decision together with its new record. The rule is the same: notify when the situation changes, remind at most once every 30 minutes while the situation is still dangerous, and stay quiet otherwise.

#### 3.4 Ten tests: `rules/engine.test.ts`

In the same folder, create the file **`engine.test.ts`**. Vitest finds by itself every file whose name ends in **`.test.ts`**.

```ts
// engine.test.ts - the project's first unit tests (Module 19): the rules brain without MQTT, a database, or a real clock.
// Run: npm test
import { describe, expect, it } from "vitest";
import { INITIAL_RECORD, INITIAL_MEMORY, REMINDER_MS, evaluateThreshold, shouldNotify } from "./engine.ts";
import type { Memory, Decision } from "./engine.ts";
import { Rule } from "../schemas/rules.ts";
import type { ThresholdCondition } from "../schemas/rules.ts";

// an example fan rule: on above 30 °C for 2 minutes, off below 28 °C
const FAN: ThresholdCondition = {
  kind: "threshold", device_id: "f00d00000001", quantity: "temperature", on_above: 30, off_below: 28, for_seconds: 120,
};
const T0 = Date.parse("2026-10-21T13:00:00+07:00"); // a pretend clock: the tests don't need to wait 2 real minutes
const ON: Memory = { active: true, since: null, last: T0 }; // a rule whose fan is already on

// Evaluate a few readings [seconds since T0, value] in order. The result is the last memory and every decision.
function run(readings: [number, number | null][], initial: Memory = INITIAL_MEMORY) {
  let memory = initial;
  const decisions: Decision[] = [];
  for (const [second, value] of readings) {
    const result = evaluateThreshold(FAN, memory, value, T0 + second * 1000);
    memory = result.memory;
    decisions.push(result.decision);
  }
  return { memory, decisions };
}

// a reading every 10 seconds from second `start` to `end`, all with the value `value`
function every10Seconds(start: number, end: number, value: number | null): [number, number | null][] {
  const list: [number, number | null][] = [];
  for (let second = start; second <= end; second += 10) list.push([second, value]);
  return list;
}

describe("fan rule (evaluateThreshold)", () => {
  it("temperature 29.5 °C: no decision, the fan stays off", () => {
    const { memory, decisions } = run(every10Seconds(0, 300, 29.5));
    expect(decisions.every((k) => k === null)).toBe(true);
    expect(memory.active).toBe(false);
  });

  it("temperature 31 °C for only 60 seconds: still waiting", () => {
    const { memory, decisions } = run(every10Seconds(0, 60, 31));
    expect(decisions.at(-1)).toBeNull();
    expect(memory.since).toBe(T0); // the count starts from the first hot reading
  });

  it("temperature 31 °C for 120 seconds: the fan is turned on, only once", () => {
    const { decisions } = run(every10Seconds(0, 150, 31));
    expect(decisions[12]).toBe("turn-on"); // the 13th reading, second 120
    expect(decisions.filter((k) => k === "turn-on")).toHaveLength(1); // seconds 130-150 don't turn it on again
  });

  it("exactly 30 °C in the middle of the count: the count starts again (it must be ABOVE 30)", () => {
    const { memory, decisions } = run([...every10Seconds(0, 60, 31), [70, 30], ...every10Seconds(80, 190, 31)]);
    expect(decisions).not.toContain("turn-on"); // seconds 80 to 190 are only 110 seconds
    expect(memory.since).toBe(T0 + 80_000);
  });

  it("already on, temperature 29 °C (between 28 and 30): stays on", () => {
    const { memory, decisions } = run(every10Seconds(10, 100, 29), ON);
    expect(decisions.every((k) => k === null)).toBe(true);
    expect(memory.active).toBe(true);
  });

  it("already on, temperature 27.9 °C: the fan is turned off", () => {
    const { memory, decisions } = run([[10, 27.9]], ON);
    expect(decisions[0]).toBe("turn-off");
    expect(memory.active).toBe(false);
  });

  it("a null reading (failed sensor): no decision, the count starts again", () => {
    const { memory, decisions } = run([...every10Seconds(0, 100, 31), [110, null], ...every10Seconds(120, 200, 31)]);
    expect(decisions).not.toContain("turn-on");
    expect(memory.since).toBe(T0 + 120_000);
  });

  it("a gap between readings of more than 60 seconds: the count starts again", () => {
    const { memory, decisions } = run([[0, 31], [50, 31], [130, 31]]); // second 50 to 130 = 80 seconds without news
    expect(decisions).not.toContain("turn-on");
    expect(memory.since).toBe(T0 + 130_000);
  });
});

describe("Telegram alerts (shouldNotify)", () => {
  it("notifies on a change, reminds every 30 minutes while in danger, notifies again on recovery", () => {
    let record = INITIAL_RECORD;
    let result = shouldNotify(record, "danger", T0);
    expect(result.send).toBe(true); // safe -> danger
    record = result.record;
    expect(shouldNotify(record, "danger", T0 + 10 * 60_000).send).toBe(false); // 10 minutes later: quiet
    result = shouldNotify(record, "danger", T0 + REMINDER_MS);
    expect(result.send).toBe(true); // 30 minutes later: a reminder
    record = result.record;
    expect(shouldNotify(record, "safe", T0 + REMINDER_MS + 60_000).send).toBe(true); // danger -> safe: a recovery message
  });
});

describe("rule schema (Zod)", () => {
  it("refuses an off_below that isn't smaller than on_above", () => {
    const rule = {
      name: "Automatic fan", active: true, condition: FAN,
      action: { kind: "switch", device_id: "f00d00000001", target: "fan", notify: true },
    };
    expect(Rule.safeParse(rule).success).toBe(true);
    const reversed = { ...rule, condition: { ...FAN, off_below: 30 } }; // 30 isn't smaller than 30
    expect(Rule.safeParse(reversed).success).toBe(false);
  });
});
```

- **`describe("…", () => { … })`** groups tests of the same kind, and **`it("…", () => { … })`** is one test with a sentence that explains its behavior. That sentence is what gets printed in the terminal later, so write it like a sentence of the rule.
- **`expect(result).toBe(expected)`** checks one result (Concept 6). Other checks used here: **`toBeNull()`**, **`toContain(…)`** (the list contains something), **`not.toContain(…)`** (the list doesn't contain something), and **`toHaveLength(n)`** (the length of the list).
- **`T0`** is a pretend clock. The helper function **`every10Seconds`** makes a list of readings like real `telemetry`, and **`run`** evaluates that list reading by reading. The "for 120 seconds" test finishes in a few milliseconds, without waiting two minutes.
- The first eight tests check the fan rule, including its limits: exactly 30 °C doesn't count as **above** 30, 29 °C is still inside the hysteresis gap, and 27.9 °C is already below 28. The ninth test checks the debouncing, and the tenth checks that the Zod schema refuses a reversed hysteresis.

#### 3.5 Run the tests

```text
npm test
```

**Expected output** (**example**; the path on the `RUN` line, the time, and the milliseconds on your screen will be different):

```text
> mini-smart-home-backend@0.3.0 test
> vitest run


 RUN  v5.0.5 C:/…/mini-smart-home/backend

 ✓ src/rules/engine.test.ts (10 tests) 19ms
   ✓ fan rule (evaluateThreshold) (8)
     ✓ temperature 29.5 °C: no decision, the fan stays off 3ms
     ✓ temperature 31 °C for only 60 seconds: still waiting 1ms
     ✓ temperature 31 °C for 120 seconds: the fan is turned on, only once 2ms
     ✓ exactly 30 °C in the middle of the count: the count starts again (it must be ABOVE 30) 1ms
     ✓ already on, temperature 29 °C (between 28 and 30): stays on 1ms
     ✓ already on, temperature 27.9 °C: the fan is turned off 0ms
     ✓ a null reading (failed sensor): no decision, the count starts again 1ms
     ✓ a gap between readings of more than 60 seconds: the count starts again 1ms
   ✓ Telegram alerts (shouldNotify) (1)
     ✓ notifies on a change, reminds every 30 minutes while in danger, notifies again on recovery 1ms
   ✓ rule schema (Zod) (1)
     ✓ refuses an off_below that isn't smaller than on_above 7ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  06:35:29
   Duration  535ms (import 78%, transform 10%, tests 8%, worker 4%)
```

Ten green **✓** marks and the line **`Tests  10 passed (10)`**: that's the main result of this practice. The number at the end of each line is how long that test took, and `Duration` is how long the whole check took, under one second.

#### 3.6 Watch a test fail

A test that's always green doesn't prove anything until you've seen that it can turn red. Open **`engine.ts`** and change one sign in the line `if (now - since >= c.for_seconds * 1000) {`: replace **`>=`** with **`>`**, as if you'd made a typo. Save, then run `npm test` again.

**Expected output** (**example**, shortened at the top):

```text
 ❯ src/rules/engine.test.ts (10 tests | 1 failed) 38ms
   ❯ fan rule (evaluateThreshold) (8)
     ✓ temperature 29.5 °C: no decision, the fan stays off 3ms
     ✓ temperature 31 °C for only 60 seconds: still waiting 0ms
     × temperature 31 °C for 120 seconds: the fan is turned on, only once 19ms
     ✓ exactly 30 °C in the middle of the count: the count starts again (it must be ABOVE 30) 1ms
…
 FAIL  src/rules/engine.test.ts > fan rule (evaluateThreshold) > temperature 31 °C for 120 seconds: the fan is turned on, only once
AssertionError: expected null to be 'turn-on' // Object.is equality

- Expected:
"turn-on"

+ Received:
null

 ❯ src/rules/engine.test.ts:50:27
     48|   it("temperature 31 °C for 120 seconds: the fan is turned on, only once", () => {
     49|     const { decisions } = run(every10Seconds(0, 150, 31));
     50|     expect(decisions[12]).toBe("turn-on"); // the 13th reading, second 120
       |                           ^
     51|     expect(decisions.filter((k) => k === "turn-on")).toHaveLength(1); // seconds 130-150 don't turn it on again
     52|   });

…
 Test Files  1 failed (1)
      Tests  1 failed | 9 passed (10)
```

One small sign turns out to shift the decision: with `>`, exactly 120 seconds doesn't count as long enough yet, so the 13th reading doesn't turn the fan on (`Received: null`). Vitest points out the failed test, the expected value (`Expected`), the value it got (`Received`), and the line of code. A mistake like this is almost impossible to spot when trying things out with a real device, but a unit test catches it right away. Change the sign back to **`>=`**, save, and run `npm test` once more until you see `Tests  10 passed (10)`.

#### 3.7 Check the types and save to the branch

The test file is also checked by TypeScript, because it's in the `src` folder:

```text
npm run check
```

There must be no errors. Then save:

```text
cd ..
git add backend
git commit -m "The rules engine as pure functions and 10 Vitest unit tests (Module 19 Practice 3)"
```

> ⬆️ **Done with Practice 3?** Go back to [Concept 7](#7-rules-in-the-database-changed-through-the-api-in-effect-right-away) before Practice 4.

### Practice 4 — Rules in the database, changed through the API (60 minutes)

> 🖥️ **Tools used:** **VS Code** (the backend, the simulator, and the small terminal), the browser for **`/docs`**, and **psql** in the database container (`docker exec -it smarthome-db psql -U postgres -d smarthome`). The laptop path uses the Module 19 simulator, because its temperature can be set from the terminal (`temp 31`). The device path: a real Node 1's temperature is hard to set exactly, so do this practice with the simulator first, then try the rule on Node 1 after Practice 7.
>
> ⭐ **Required** — the first pass requirement: changing the temperature threshold through the API immediately changes how the fan behaves, **without restarting the server**.

The rules brain from Practice 3 now gets connected to the real world: rules are stored in the `rules` table, read into memory, evaluated every time a `telemetry` arrives, and act through the command door from Practice 2. Every one of their actions is recorded in the new event log (Concept 7).

#### 4.1 Migration 007

Right-click the **`backend/migrations`** folder → **New File…**, name it **`007_rules_and_events.sql`**, then type:

```sql
-- 007_rules_and_events.sql - automation rules can be changed through the API, every command records who gave the order,
-- and the event log "who turned on what, and when" (Module 19).
-- Number 006 is skipped on purpose: 006_device_health.sql is the Level 3 Challenge of Module 18 that you may have built.

-- The rules table has been ready since Module 17 (migration 001). Now it also records when it was last changed, and the
-- condition and the action must be JSON objects { ... }.
ALTER TABLE rules
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD CONSTRAINT rules_condition_object CHECK (jsonb_typeof(condition) = 'object'),
  ADD CONSTRAINT rules_action_object CHECK (jsonb_typeof(action) = 'object');

-- Every command now records who gave the order. The old commands all came from the API, so the default is 'api'.
ALTER TABLE commands
  ADD COLUMN source  text NOT NULL DEFAULT 'api' CHECK (source IN ('api', 'rule', 'schedule', 'telegram')),
  ADD COLUMN rule_id integer REFERENCES rules (id) ON DELETE SET NULL, -- the rule that gave the order (if any)
  ADD COLUMN state   jsonb;                                            -- ack.state; NULL = no ack

-- The event log: one row for everything a human needs to know.
CREATE TABLE events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  device_id   text REFERENCES devices (device_id),  -- NULL for an event that doesn't belong to one device
  kind        text NOT NULL
              CHECK (kind IN ('rule', 'rule-changed', 'schedule', 'status', 'offline-report', 'command')),
  source      text NOT NULL,                        -- api, rule, schedule, telegram, or device
  rule_id     integer REFERENCES rules (id) ON DELETE SET NULL,
  message     text NOT NULL,                        -- a sentence for humans, the same as its Telegram message
  data        jsonb                                 -- the raw details: reading, command, result
);
CREATE INDEX events_occurred_at_idx ON events (occurred_at DESC);
```

Its three changes are explained in the Concept 7 table. Two things in the SQL are new:

- **`ADD CONSTRAINT … CHECK (jsonb_typeof(condition) = 'object')`** makes the database itself refuse a `condition` that isn't a JSON object, for example a text or a list. That's a second layer of safety, after Zod in the backend.
- **`REFERENCES rules (id) ON DELETE SET NULL`**: if a rule is ever deleted, the history of its commands and events stays, and their `rule_id` column becomes empty.

Run the migration **before** you run the new version of the backend. Stop `npm run dev` if it's still running. In the first terminal, go into the `backend` folder again (`cd backend`; since the Practice 3 commit, that terminal has been in `mini-smart-home`), then run:

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.3.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 007_rules_and_events.sql
1 new migration(s) applied, 5 applied earlier.
```

If you did 🧩 Level 3 of Module 18, the number becomes `6 applied earlier`, because `006_device_health.sql` is counted too. The skipped number 006 doesn't break anything: the migration runner only runs the files that haven't been recorded yet, in order of their names.

Look at the result in psql. Open a new terminal, then go in with `docker exec -it smarthome-db psql -U postgres -d smarthome` as in Module 18. All the old commands, from Module 17 up to Practice 2, automatically get a `source` with the value `api`, its default value. This query shows the three oldest ones, so the ones on your screen may be commands from Module 17:

```sql
SELECT id, target, source, rule_id, state FROM commands ORDER BY sent_at LIMIT 3;
```

**Expected output** (**example**):

```text
         id          | target  | source | rule_id | state 
---------------------+---------+--------+---------+-------
 c-20261020-232239-1 | fan     | api    |         | 
 c-20261020-232240-2 | curtain | api    |         | 
 c-20261020-232240-3 | pump    | api    |         | 
(3 rows)
```

The `state` column of the old commands is empty, because it wasn't recorded back then. From Practice 4 on, every answered command saves its `ack.state`.

#### 4.2 The database: rules, events, and command sources

Open **`backend/src/db/archive.ts`**.

1. Add an import line below `import type { Ack, SetCommand, … } from "../schemas/contract.ts";`:

   ```ts
   import type { Rule } from "../schemas/rules.ts";
   ```

2. Replace the **`archiveCommand`** function (together with the comment above it) with a version that also records the source, the rule, and the state:

   ```ts
   // One command with its result: the ack (ok or refused), or null if no ack came within 5 seconds. Module 19: also
   // who ordered it (source), which rule (if it came from a rule or a schedule), and the actuator state according to its ack.
   export async function archiveCommand(commandId: string, deviceId: string, command: SetCommand, sentAt: Date,
     ack: Ack | null, waitMs: number, source: string, ruleId: number | null): Promise<void> {
     await pool.query(
       `INSERT INTO commands (id, device_id, sent_at, target, value, ack_ok, ack_message, wait_ms, source, rule_id, state)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
       [commandId, deviceId, sentAt, command.target, JSON.stringify(command.value), ack?.ok ?? null,
         ack?.message ?? null, waitMs, source, ruleId, ack === null ? null : JSON.stringify(ack.state)],
     );
   }
   ```

3. Add the following block **right below** that function:

   ```ts
   // Module 19: one row of the rules table, as it is (condition and action are checked by Zod in automation.ts before use).
   export interface RuleRow {
     id: number;
     name: string;
     active: boolean;
     condition: unknown;
     action: unknown;
     created_at: Date;
     updated_at: Date;
   }

   const RULE_COLUMNS = "id, name, active, condition, action, created_at, updated_at";

   export async function getAllRules(): Promise<RuleRow[]> {
     const result = await pool.query<RuleRow>(`SELECT ${RULE_COLUMNS} FROM rules ORDER BY id`);
     return result.rows;
   }

   export async function insertRule(a: Rule): Promise<RuleRow> {
     const result = await pool.query<RuleRow>(
       `INSERT INTO rules (name, active, condition, action) VALUES ($1, $2, $3, $4) RETURNING ${RULE_COLUMNS}`,
       [a.name, a.active, JSON.stringify(a.condition), JSON.stringify(a.action)],
     );
     return result.rows[0];
   }

   // The result is undefined if no rule has that number.
   export async function updateRule(id: number, a: Rule): Promise<RuleRow | undefined> {
     const result = await pool.query<RuleRow>(
       `UPDATE rules SET name = $2, active = $3, condition = $4, action = $5, updated_at = now() WHERE id = $1 RETURNING ${RULE_COLUMNS}`,
       [id, a.name, a.active, JSON.stringify(a.condition), JSON.stringify(a.action)],
     );
     return result.rows[0];
   }

   // Module 19: the event log (the events table, migration 007).
   export type EventKind = "rule" | "rule-changed" | "schedule" | "status" | "offline-report" | "command";

   export interface NewEvent {
     device_id: string | null; // null for an event that doesn't belong to one device (for example a changed rule)
     kind: EventKind;
     source: string; // api, rule, schedule, telegram, device
     rule_id: number | null;
     message: string; // a sentence for humans, the same as its Telegram message
     data?: unknown; // the raw details
   }

   // an event that is already stored: plus its number and time (this is what Socket.IO sends as "event")
   export interface SavedEvent extends NewEvent {
     id: number;
     occurred_at: string;
   }

   export async function saveEvent(e: NewEvent): Promise<SavedEvent> {
     const result = await pool.query<{ id: string; occurred_at: Date }>(
       `INSERT INTO events (device_id, kind, source, rule_id, message, data) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, occurred_at`,
       [e.device_id, e.kind, e.source, e.rule_id, e.message, e.data === undefined ? null : JSON.stringify(e.data)],
     );
     const { id, occurred_at } = result.rows[0];
     return { id: Number(id), occurred_at: contractTime(occurred_at), ...e }; // a bigint comes from pg as text
   }
   ```

   Those four new functions use `SELECT`, `INSERT`, and `UPDATE` from Module 17, plus one new word, **`RETURNING`**. They `SELECT` every rule, `INSERT … RETURNING` a new rule, `UPDATE … RETURNING` a changed rule (the result is `undefined` if that number doesn't exist), and `INSERT … RETURNING` one event. `RETURNING` makes the database answer right away with the row it has just written, complete with its `id` and its time. The `condition`, `action`, and `data` columns are of the `jsonb` type, so their contents are sent as JSON text (`JSON.stringify`).

Then open **`backend/src/services/commands.ts`**. Inside `issueCommand()`, change the `archiveCommand(…)` call so that it also passes the source and the rule:

```ts
  archiveCommand(id, deviceId, command, new Date(start), ack, elapsed, source, ruleId)
```

#### 4.3 The rule shape and the threshold shape

Open **`backend/src/schemas/rules.ts`** and replace the part from the comment `// The body of POST /rules and PUT /rules/:id, …` to the end of the file with:

```ts
// The fields of one rule (name, active, condition, action), without the combined checks.
export const RuleFields = z.strictObject({
  name: z.string().min(1).max(60),
  active: z.boolean(),
  condition: ThresholdCondition,
  action: SwitchAction,
});

// The body of POST /rules and PUT /rules/:id. The threshold of a fan rule is also sent to the device as temp_fan_on (config,
// contract 1.3), so its range must be the same as what the device accepts: 15-45 °C.
export const Rule = RuleFields.refine((a) => !(a.condition.quantity === "temperature" && a.action.target === "fan")
  || (a.condition.on_above >= 15 && a.condition.on_above <= 45), {
  message: "for a fan rule, on_above must be 15-45 °C (it is also sent to the device as temp_fan_on)",
  path: ["condition", "on_above"],
});

export type ThresholdCondition = z.infer<typeof ThresholdCondition>;
export type Rule = z.infer<typeof Rule>;

// a rule already stored in the database: plus its number and its times
export type StoredRule = Rule & { id: number; created_at: string; updated_at: string };
```

`Rule` is now built from **`RuleFields`** plus one combined check: for a fan rule based on temperature, `on_above` must be 15–45 °C. That number is also sent to Node 1 as `temp_fan_on`, and Node 1 only accepts that range (contract 1.3). Without this check, the backend could leave a `config` posted on the broker that the device is sure to refuse. **`StoredRule`** is a rule that already has a number and times from the database.

Then open **`backend/src/schemas/contract.ts`** and add the schema for the content of `config` right above the `export type` list:

```ts
// the thresholds of the local safety rules, sent with the "config" cmd (contract 1.3 section 7): at least one key
export const Thresholds = z
  .strictObject({
    temp_fan_on: z.number().min(15).max(45).optional(),
    soil_watering: z.number().int().min(0).max(100).optional(),
  })
  .refine((a) => a.temp_fan_on !== undefined || a.soil_watering !== undefined, "thresholds must contain temp_fan_on or soil_watering");
```

Also add `export type Thresholds = z.infer<typeof Thresholds>;` below the line `export type State = …`.

#### 4.4 The event log: `events.ts`

Create the file **`backend/src/services/events.ts`**:

```ts
// events.ts - the event log (Module 19): everything a human needs to know ("who turned on what, and when")
// is written to the events table, then broadcast to every Socket.IO client as the "event" event.
import { saveEvent } from "../db/archive.ts";
import type { NewEvent } from "../db/archive.ts";
import { broadcastEvent } from "./realtime.ts";
import { log } from "./log.ts";

export function recordEvent(event: NewEvent): void {
  saveEvent(event)
    .then((row) => broadcastEvent(row))
    .catch((error) => log.error(`couldn't record event "${event.message}": ${(error as Error).message}`));
}
```

One function, two jobs: write the event to the `events` table, then broadcast the stored row to every Socket.IO client. For the broadcast, open **`backend/src/services/realtime.ts`**:

1. Add `import type { SavedEvent } from "../db/archive.ts";` below the `contract.ts` imports.
2. In the `ToClient` interface, add the line `event: (event: SavedEvent) => void;` below the `status` line.
3. Change the end of the header comment to `Status changes and the event log go to every client.`
4. Add a new function at the end of the file:

   ```ts
   // send one row of the event log to ALL clients
   export function broadcastEvent(event: SavedEvent): void {
     io?.emit("event", event);
   }
   ```

Commands sent again by reconciliation (Concept 4) also go into the event log. Open **`backend/src/services/commands.ts`**, add `import { recordEvent } from "./events.ts";` below the `archive.ts` import, then inside `reconcile()` add this line right below ``log.warn(`reconcile: ${message}`);``:

```ts
    recordEvent({ device_id: deviceId, kind: "command", source: w.source, rule_id: w.ruleId, message, data: w.command });
```

#### 4.5 The brain at work: `automation.ts`

Create the file **`backend/src/services/automation.ts`**. This is the part that connects the `rules` table, the pure brain from Practice 3, and the command door:

```ts
// automation.ts - runs the automation rules from the rules table (Module 19): loads the rules into memory, evaluates every
// reading with the pure brain (rules/engine.ts), acts through issueCommand(), sends the fan threshold to the device (config), and
// records every action in the event log.
import { Rule } from "../schemas/rules.ts";
import type { StoredRule } from "../schemas/rules.ts";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { INITIAL_MEMORY, evaluateThreshold } from "../rules/engine.ts";
import type { Memory } from "../rules/engine.ts";
import { getAllRules, insertRule, updateRule, contractTime } from "../db/archive.ts";
import type { RuleRow } from "../db/archive.ts";
import { findDevice, waitForAck } from "./store.ts";
import { makeCommandId, sendConfig, summarize } from "./mqtt.ts";
import { issueCommand } from "./commands.ts";
import type { CommandResult } from "./commands.ts";
import { recordEvent } from "./events.ts";
import { log } from "./log.ts";

const STALE_READING_MS = 60_000; // a reading whose ts is older than 60 seconds (late data) is not evaluated
let rules: StoredRule[] = []; // every valid rule, by number
const memory = new Map<number, Memory>(); // rule number -> evaluateThreshold memory

// Reload every rule from the database. Invalid rows (for example edited by hand in DBeaver) are skipped.
export async function loadRules(): Promise<void> {
  const valid: StoredRule[] = [];
  for (const row of await getAllRules()) {
    const result = Rule.safeParse({ name: row.name, active: row.active, condition: row.condition, action: row.action });
    if (!result.success) {
      log.warn(`rule ${row.id} skipped: ${summarize(result.error)}`);
      continue;
    }
    valid.push({ ...result.data, id: row.id, created_at: contractTime(row.created_at), updated_at: contractTime(row.updated_at) });
  }
  rules = valid;
  log.info(`rules loaded: ${valid.filter((a) => a.active).length} active of ${valid.length}`);
}

export function allRules(): StoredRule[] {
  return rules;
}

// POST /rules: save a new rule, which applies right away
export async function createRule(content: Rule): Promise<StoredRule> {
  return afterChange(await insertRule(content), "created");
}

// PUT /rules/:id: the result is undefined if no rule has that number
export async function replaceRule(id: number, content: Rule): Promise<StoredRule | undefined> {
  const row = await updateRule(id, content);
  return row === undefined ? undefined : afterChange(row, "changed");
}

async function afterChange(row: RuleRow, word: string): Promise<StoredRule> {
  memory.delete(row.id); // a new threshold = a new "for" count
  await loadRules();
  const a = rules.find((x) => x.id === row.id);
  if (a === undefined) throw new Error(`rule ${row.id} is invalid after saving`);
  const message = `Rule ${a.id} (${a.name}) ${word} through the API: ${describeRule(a)}`;
  log.info(message);
  recordEvent({ device_id: null, kind: "rule-changed", source: "api", rule_id: a.id, message,
    data: { name: a.name, active: a.active, condition: a.condition, action: a.action } });
  sendAllConfigs();
  return a;
}

// a short sentence for the log and the event log
function describeRule(a: StoredRule): string {
  const c = a.condition;
  return `${a.action.target} ${a.action.device_id} on when ${c.quantity} ${c.device_id} is above ${c.on_above} `
    + `for ${c.for_seconds} seconds, off below ${c.off_below}${a.active ? "" : " (inactive)"}`;
}

// Send the safety threshold to every device that has a fan rule based on temperature: temp_fan_on = on_above
// (contract 1.3, retained config). Called every time the backend connects to the broker and every time a rule changes.
export function sendAllConfigs(): void {
  const done = new Set<string>(); // one device, one threshold: the active fan rule with the lowest number
  for (const a of rules) {
    if (!a.active || a.condition.quantity !== "temperature" || a.action.target !== "fan" || done.has(a.action.device_id)) continue;
    done.add(a.action.device_id);
    void sendThreshold(a.action.device_id, a.condition.on_above, a.id);
  }
}

async function sendThreshold(deviceId: string, temperature: number, ruleId: number): Promise<void> {
  const id = makeCommandId();
  const waiting = waitForAck(id, 5000); // start waiting BEFORE sending, like a set command
  sendConfig(deviceId, id, { temp_fan_on: temperature });
  log.info(`config ${id} to ${deviceId}: temp_fan_on ${temperature} from rule ${ruleId} (retained)`);
  const ack = await waiting;
  if (ack === null) {
    log.warn(`config ${id} to ${deviceId}: no answer in 5 seconds; the config stays retained on the broker until the device connects`);
  } else {
    log.info(`config ${id} to ${deviceId}: ack ok=${ack.ok}${ack.message === undefined ? "" : ` (${ack.message})`}`);
  }
}

// Called by mqtt.ts for every telemetry that passes the contract.
export function evaluateReading(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  const now = Date.now();
  if (now - Date.parse(content.ts) > STALE_READING_MS) return; // late data: not the current state
  const reading: Record<string, unknown> = content;
  for (const a of rules) {
    if (!a.active || a.condition.device_id !== deviceId) continue;
    const raw = reading[a.condition.quantity];
    const value = typeof raw === "number" ? raw : null; // null: a failed sensor, or a field the device doesn't have
    const previous = memory.get(a.id) ?? initialMemory(a);
    const { memory: updated, decision } = evaluateThreshold(a.condition, previous, value, now);
    memory.set(a.id, updated);
    if (decision !== null) {
      void act(a, decision, value, content.ts, previous);
    } else if (previous.since === null && updated.since !== null) {
      log.info(`rule ${a.id} (${a.name}): ${a.condition.quantity} ${value} above ${a.condition.on_above}; `
        + `${a.action.target} turned on if it lasts ${a.condition.for_seconds} seconds`);
    } else if (previous.since !== null && updated.since === null) {
      log.info(`rule ${a.id} (${a.name}): count restarted (${a.condition.quantity} ${value ?? "unreadable"})`);
    }
  }
}

// After the backend restarts or the rule is changed: if the device reports that its actuator is on, treat the rule
// as on so that it gets turned off when the time comes.
function initialMemory(a: StoredRule): Memory {
  return { ...INITIAL_MEMORY, active: findDevice(a.action.device_id)?.reported?.[a.action.target] === true };
}

async function act(a: StoredRule, decision: "turn-on" | "turn-off", value: number | null, readingTs: string,
  previous: Memory): Promise<void> {
  const turnOn = decision === "turn-on";
  const result = await issueCommand(a.action.device_id, { target: a.action.target, value: turnOn }, "rule", a.id);
  if (result.status === "not-sent") {
    memory.set(a.id, previous); // the decision hasn't been carried out: the next reading decides again
    log.warn(`rule ${a.id} (${a.name}): ${a.action.target} can't be turned ${turnOn ? "on" : "off"}: ${result.message}`);
    return;
  }
  const message = sentence(a, turnOn, value, result);
  log.info(`rule ${a.id} (${a.name}): ${message}`);
  recordEvent({ device_id: a.action.device_id, kind: "rule", source: "rule", rule_id: a.id, message,
    data: { decision, value, reading_ts: readingTs, command: result.id, result: result.status } });
}

const LABEL: Record<string, [string, string, string]> = { // quantity -> [emoji, name, unit]
  temperature: ["🌡️", "Temperature", " °C"], humidity: ["💧", "Humidity", " %"], light: ["💡", "Light", ""],
  soil: ["🌱", "Soil", " %"], water_level: ["🚰", "Water level", " %"], soil_rs485: ["🌱", "Soil (RS-485)", " %"],
  soil_temperature: ["🌡️", "Soil temperature", " °C"],
};
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27.8"

// A sentence for humans, for example "🌡️ Temperature 33 °C — fan turned on automatically" (the same as its Telegram message).
function sentence(a: StoredRule, turnOn: boolean, value: number | null, result: CommandResult): string {
  const [emoji, name, unit] = LABEL[a.condition.quantity];
  const text = value === null ? "-" : num.format(value);
  const target = a.action.target;
  if (result.status === "no-ack") return `⚠️ ${name} ${text}${unit} — ${target} did NOT answer the command (will retry)`;
  if (result.status === "answered" && !result.ack.ok) {
    return `⚠️ ${name} ${text}${unit} — ${target} command refused by the device: ${result.ack.message}`;
  }
  return turnOn ? `${emoji} ${name} ${text}${unit} — ${target} turned on automatically`
    : `✅ ${name} down to ${text}${unit} — ${target} turned off`;
}
```

Read it function by function:

- **`loadRules()`** reads every row of `rules`, checks each row with the `Rule` schema (invalid rows are skipped and noted in the log), then keeps the list of valid rules in memory. This function is called when the server starts and every time a rule changes.
- **`createRule()`** and **`replaceRule()`** are used by the `/rules` routes. Both save to the database, then **`afterChange()`** does steps 3–5 of Concept 7: that rule's memory is deleted (the "for" count starts again from zero), the list is reloaded, a `rule-changed` event is recorded, and the `config` is sent.
- **`sendAllConfigs()`** sends `temp_fan_on` to every device that has a fan rule based on temperature. This function is also called every time the backend connects to the broker, because a broker without persistence, like Mosquitto on a Windows or macOS laptop, forgets its retained messages when it restarts. `config` also waits for its `ack`, but it doesn't fail if the device is off: the message stays posted on the broker until the device connects.
- **`evaluateReading()`** is called for every `telemetry`. A reading whose `ts` is older than 60 seconds is skipped, because it's late data, not the current state. For every active rule of that device, it takes the value of the quantity, calls **`evaluateThreshold()`**, saves the new memory, and writes to the log when the count starts or restarts.
- **`act()`** sends the command through **`issueCommand(…, "rule", a.id)`**. If the command can't be sent (for example, the device is `offline`), the memory is put back, so that the next reading decides again. The resulting sentence, for example `🌡️ Temperature 31 °C — fan turned on automatically`, is recorded in the log and the event log. In Practice 6, the same sentence is sent to Telegram.
- **`initialMemory()`** is used when a rule's memory is created from scratch, that is, after the backend restarts or the rule is changed: if the device reports that its fan is on, the rule counts as on, so that later the fan still gets turned off when the temperature drops (Concept 5).

#### 4.6 The `/rules` routes

Create the file **`backend/src/routes/rules.ts`**:

```ts
// rules.ts - the /rules routes (Module 19): view, create, and change automation rules without changing code and without
// restarting the server. The content of every rule is checked by the Zod schema in schemas/rules.ts.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Rule, RuleFields } from "../schemas/rules.ts";
import { createRule, replaceRule, allRules } from "../services/automation.ts";

const ErrorBody = z.object({ message: z.string() });
const IdParam = z.object({ id: z.coerce.number().int().min(1).describe("the rule number, for example 1") });
const FullRule = RuleFields.extend({
  id: z.number().describe("the rule number"),
  created_at: z.string().describe("when the rule was created (UTC)"),
  updated_at: z.string().describe("when the rule was last changed (UTC)"),
});

export const ruleRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/rules", {
    schema: {
      tags: ["rules"],
      summary: "Every automation rule the server is using right now",
      response: { 200: z.array(FullRule).describe("the valid rules, by number") },
    },
  }, async () => allRules());

  app.post("/rules", {
    schema: {
      tags: ["rules"],
      summary: "Create a new automation rule; it applies right away, without restarting the server",
      body: Rule,
      response: {
        201: FullRule.describe("the rule is stored and used right away"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      return reply.code(201).send(await createRule(req.body));
    } catch (error) {
      req.log.error(`the new rule couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.put("/rules/:id", {
    schema: {
      tags: ["rules"],
      summary: "Replace the whole content of one rule; it applies right away, without restarting the server",
      params: IdParam,
      body: Rule,
      response: {
        200: FullRule.describe("the rule is stored and used right away"),
        404: ErrorBody.describe("no rule has that number"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      const rule = await replaceRule(req.params.id, req.body);
      if (rule === undefined) return reply.code(404).send({ message: `rule ${req.params.id} doesn't exist` });
      return rule;
    } catch (error) {
      req.log.error(`rule ${req.params.id} couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });
};
```

The pattern is the same as the Module 16–18 routes: Zod schemas for the body of the request and the answer, `describe` for Swagger, and code `503` if the database can't be reached. **`z.coerce.number()`** turns the text `"1"` from the address `/rules/1` into the number `1`. **`PUT`** replaces the **whole** content of a rule, so send the complete rule, not only the number that changed.

#### 4.7 Connecting everything

Open **`backend/src/services/mqtt.ts`** and replace its whole content with this version (the changes are spread over many places, so it's safer to replace it all):

```ts
// mqtt.ts - the backend as an MQTT client: listens to msh/#, checks every message, stores it, and sends commands.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import type { Thresholds, SetCommand } from "../schemas/contract.ts";
import { findDevice, counts, deliverAck, saveStatus, saveTelemetry, saveVitals } from "./store.ts";
import { archiveStatus, archiveTelemetry, archiveVitals } from "../db/archive.ts";
import { broadcastStatus, broadcastTelemetry } from "./realtime.ts";
import { recordReport, deviceRestarted } from "./commands.ts";
import { sendAllConfigs, evaluateReading } from "./automation.ts";
import { recordEvent } from "./events.ts";

let client: mqtt.MqttClient | undefined;

export function startMqtt(url: string, log: FastifyBaseLogger): void {
  const clientName = "backend-" + Math.random().toString(16).slice(2, 8); // a unique name, not a device_id
  client = mqtt.connect(url, { clientId: clientName, reconnectPeriod: 5000 });
  client.on("connect", () => {
    log.info(`connected to broker ${url}`);
    client?.subscribe("msh/#", { qos: 1 });
    sendAllConfigs(); // Module 19: a broker without persistence forgets the retained config when restarted (contract rule 10)
  });
  client.on("reconnect", () => log.warn("broker not reachable yet, retrying in 5 seconds"));
  client.on("error", (error) => log.error(`MQTT error: ${error.message}`));
  // packet.retain = true: an old message the broker kept, sent again because the backend just subscribed (Module 19)
  client.on("message", (topic, content, packet) => receive(topic, content.toString(), packet.retain, log));
}

export function brokerConnected(): boolean {
  return client?.connected ?? false;
}

function reject(topic: string, reason: string, log: FastifyBaseLogger): void {
  counts.rejected++;
  log.warn(`REJECTED ${topic}: ${reason}`);
}

// writing to the database failed (for example the database container was stopped): log it, but the server keeps running
function archiveFailed(topic: string, log: FastifyBaseLogger) {
  return (error: Error) => log.error(`couldn't save ${topic} to the database: ${error.message}`);
}

// summarize the list of issues from Zod, for example "humidity: Too big: expected number to be <=100"
export function summarize(error: ZodError): string {
  return error.issues.map((m) => `${m.path.join(".") || "content"}: ${m.message}`).join("; ");
}

function receive(topic: string, text: string, retained: boolean, log: FastifyBaseLogger): void {
  const parts = topic.split("/"); // ["msh", device_id, kind]
  if (parts.length !== 3) return reject(topic, "the topic must look like msh/<device_id>/<kind>", log);
  const [, deviceId, kind] = parts;
  if (!DeviceId.safeParse(deviceId).success) return reject(topic, "invalid device_id", log);
  if (kind === "cmd") return; // a command (from this backend or MQTTX), not device data

  if (kind === "status") {
    if (text === "") return; // an empty message = someone deleting a retained status (Module 11), not a new status
    const result = Status.safeParse(text);
    if (!result.success) return reject(topic, `unknown status "${text}"`, log);
    const previous = findDevice(deviceId)?.status;
    saveStatus(deviceId, result.data);
    const archiving = archiveStatus(deviceId, result.data);
    archiving.catch(archiveFailed(topic, log));
    if (result.data !== previous) { // Module 19: only changes are broadcast and recorded
      broadcastStatus(deviceId, result.data);
      if (!retained) { // a retained status when the backend starts = an old state, not a new event
        const message = result.data === "online" ? `${deviceId} back online` : `${deviceId} disconnected (${result.data})`;
        archiving.then(() => recordEvent({ device_id: deviceId, kind: "status", source: "device", rule_id: null, message }))
          .catch(() => {}); // a failure to save the status is already logged by archiveFailed
      }
    }
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
    const content = result.data;
    saveTelemetry(deviceId, content);
    broadcastTelemetry(deviceId, content); // Module 19: passed on right away to the clients following this device
    if (!("pressure" in content)) recordReport(deviceId, content.state ?? null, content.ts); // Module 19: actuator state
    evaluateReading(deviceId, content); // Module 19: automation rules
    archiveTelemetry(deviceId, content)
      .then((isNew) => { if (!isNew) log.info(`duplicate skipped: ${deviceId} ${content.ts}`); })
      .catch(archiveFailed(topic, log));
  } else if (kind === "vitals") {
    const result = Vitals.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    const content = result.data;
    saveVitals(deviceId, content);
    // Module 19: the first vitals after the device starts carries a small uptime; all its relays have just turned off
    if (content.uptime_s < 60) deviceRestarted(deviceId, content.uptime_s);
    const archiving = archiveVitals(deviceId, content);
    archiving.catch(archiveFailed(topic, log));
    if (content.offline_s !== undefined) { // Module 19: the offline-mode report (contract 1.3)
      const message = `${deviceId} back from offline mode after ${content.offline_s} seconds; `
        + `local safety turned the fan on ${content.local_fan} time(s)`;
      log.warn(message);
      archiving.then(() => recordEvent({ device_id: deviceId, kind: "offline-report", source: "device", rule_id: null,
        message, data: { offline_s: content.offline_s, local_fan: content.local_fan } })).catch(() => {});
    }
  } else if (kind === "ack") {
    const result = Ack.safeParse(json);
    if (!result.success) return reject(topic, summarize(result.error), log);
    recordReport(deviceId, result.data.state, result.data.ts); // Module 19: every valid ack updates the reported state
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

// Module 19: the thresholds of the local safety rules (contract 1.3 section 7). QoS 1 and retained: a device that has just
// started or just connected receives them as soon as it subscribes to cmd.
export function sendConfig(deviceId: string, commandId: string, thresholds: Thresholds): void {
  const cmd = { id: commandId, ts: new Date().toISOString().slice(0, 19) + "Z", action: "config", thresholds };
  client?.publish(`msh/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: true });
}
```

What's new compared with Practice 2:

- When it connects to the broker: **`sendAllConfigs()`**.
- **`packet.retain`** is passed on to `receive()` too. A retained message is an old message the broker hands over because the backend has just subscribed, not a new event.
- **`status`** is only broadcast and recorded in the event log when it **changes**, and it isn't recorded if the message is retained. Without this, every time the backend starts, every device would be recorded as "back online".
- **`telemetry`**: one new line, **`evaluateReading(deviceId, content)`**.
- **`vitals`** that carries `offline_s` (the offline-mode report, contract 1.3) is recorded as an `offline-report` event. This report comes from Node 1 v1.5.0 in Practice 7.
- A new function, **`sendConfig()`**: QoS 1 and **`retain: true`**, unlike `sendCommand()` for `set`, which is never retained. The `summarize()` function is now exported, because `automation.ts` uses it too.

Then open **`backend/src/server.ts`**:

1. Add two imports: `import { ruleRoutes } from "./routes/rules.ts";` below the `deviceRoutes` import, and `import { loadRules } from "./services/automation.ts";` below the `startRealtime` import.
2. Register the routes below `await app.register(deviceRoutes);`:

   ```ts
   await app.register(ruleRoutes); // Module 19
   ```

3. Load the rules after the database check (after the line `else app.log.warn("database not reachable yet: …");`):

   ```ts
   try {
     await loadRules(); // Module 19: automation rules from the rules table
   } catch (error) {
     app.log.error(`automation rules couldn't be loaded yet: ${(error as Error).message}`);
   }
   ```

   If the database isn't ready yet, the server still starts, without rules; its error message explains why.

Finally, open **`tools/live-terminal.js`** and add one line below `socket.on("status", …)`:

```js
socket.on("event", (event) => console.log(`[${time()}] event: ${event.message}`)); // the event log (Practice 4)
```

Save everything, run `npm run check`, then `npm test` (all ten tests of Practice 3 must stay green).

#### 4.8 ⭐ Change the threshold without a restart

Run the backend (`npm run dev`). **Expected output** (**example**):

```text
[06:47:51] INFO: database ready
[06:47:51] INFO: rules loaded: 0 active of 0
[06:47:51] INFO: Server listening at http://127.0.0.1:8080
[06:47:51] INFO: API docs: http://127.0.0.1:8080/docs
[06:47:51] INFO: connected to broker mqtt://127.0.0.1:1883
```

Make sure the Module 19 simulator is running for one device. Restart the small terminal in the third terminal (**Ctrl + C** if it's still running, then `node live-terminal.js http://127.0.0.1:8080 f00d00000001`), because the `event` line added in 4.7 is only read after the program restarts. If the fan is still on from Practice 2, turn it off first through `POST /devices/{id}/command` with `{"target":"fan","value":false}`. In the simulator terminal, type **`temp 29`** and press **Enter**; the simulator answers `Temperature: 29.0 °C`, and all its readings are now 29 °C.

1. **Create a rule.** In `/docs`, open **`POST /rules`** → **Try it out**, fill in the following body (the device path also uses the simulator's `f00d00000001`; this rule is only moved to your Node 1 in Practice 7), then click **Execute**:

   ```json
   {"name":"Automatic fan","active":true,"condition":{"kind":"threshold","device_id":"f00d00000001","quantity":"temperature","on_above":30,"off_below":28,"for_seconds":120},"action":{"kind":"switch","device_id":"f00d00000001","target":"fan","notify":true}}
   ```

   **Expected output**: code `201` with the stored rule, now complete with `"id": 1` and the times `created_at` and `updated_at`. The backend log (**example**):

   ```text
   [06:49:00] INFO: rules loaded: 1 active of 1
   [06:49:00] INFO: Rule 1 (Automatic fan) created through the API: fan f00d00000001 on when temperature f00d00000001 is above 30 for 120 seconds, off below 28
   [06:49:00] INFO: config c-20261020-234900-2 to f00d00000001: temp_fan_on 30 from rule 1 (retained)
   [06:49:00] INFO: POST /rules -> 201 (30 ms)
   [06:49:00] INFO: config c-20261020-234900-2 to f00d00000001: ack ok=true
   ```

   The simulator terminal writes `f00d00000001: thresholds same as the stored ones {"temp_fan_on":30,"soil_watering":30}`. The simulator's default really is 30 °C, the same as Node 1's, so there's nothing to save yet; a different threshold is only saved in step 2 (`thresholds saved {"temp_fan_on":32,"soil_watering":30}`). The small terminal shows the line `event: Rule 1 (Automatic fan) created through the API: …`.

2. **Raise the threshold.** Open **`PUT /rules/{id}`** → **Try it out**, fill in `id` with `1` and the body with the same content, but with `"on_above":32,"off_below":30` → **Execute** (code `200`). Then type **`temp 31`** in the simulator terminal, and wait **two and a half minutes**. The fan does **not** turn on: 31 °C isn't above the threshold of 32. `GET /devices/{id}/state` shows `"fan": false` in `reported`, and also in `desired` if you turned the fan off through the API earlier (if not, `desired` is still empty).

3. **Lower the threshold, without a restart.** Send `PUT /rules/1` again with `"on_above":30,"off_below":28`. The simulator still reads 31 °C. The backend log (**example**):

   ```text
   [06:51:40] INFO: Rule 1 (Automatic fan) changed through the API: fan f00d00000001 on when temperature f00d00000001 is above 30 for 120 seconds, off below 28
   [06:51:40] INFO: config c-20261020-235140-4 to f00d00000001: temp_fan_on 30 from rule 1 (retained)
   [06:51:40] INFO: PUT /rules/1 -> 200 (16 ms)
   [06:51:40] INFO: config c-20261020-235140-4 to f00d00000001: ack ok=true
   [06:51:48] INFO: rule 1 (Automatic fan): temperature 31 above 30; fan turned on if it lasts 120 seconds
   [06:53:48] INFO: command c-20261020-235348-5 (rule) to f00d00000001: fan = true, ack ok=true in 3 ms
   [06:53:48] INFO: rule 1 (Automatic fan): 🌡️ Temperature 31 °C — fan turned on automatically
   ```

   The first reading after the change starts the count, and **exactly two minutes later** the rule turns the fan on. The server wasn't restarted even once. The small terminal shows it too:

   ```text
   [6:53:48 AM] event: 🌡️ Temperature 31 °C — fan turned on automatically
   [6:53:50 AM] f00d00000001  temp 31 °C  humidity 69 %  soil 46 %  fan ON  lamp off
   ```

   That's the first pass requirement of this module. **The device path:** repeat steps 2–3 with Node 1 during the dress rehearsal of Practice 8, after firmware v1.5.0 is installed in Practice 7.

4. **Let the temperature drop.** Type **`temp 27`**. The next reading is below 28 °C, and the fan is turned off right away:

   ```text
   [06:54:10] INFO: command c-20261020-235410-6 (rule) to f00d00000001: fan = false, ack ok=true in 2 ms
   [06:54:10] INFO: rule 1 (Automatic fan): ✅ Temperature down to 27 °C — fan turned off
   ```

#### 4.9 Who turned the fan on today?

The event log and the `source` column can now answer that question. In psql:

```sql
SELECT id, target, value, source, rule_id, ack_ok, wait_ms FROM commands
WHERE device_id = 'f00d00000001' ORDER BY sent_at DESC LIMIT 3;
```

**Expected output** (**example**):

```text
         id          | target | value | source | rule_id | ack_ok | wait_ms 
---------------------+--------+-------+--------+---------+--------+---------
 c-20261020-235410-6 | fan    | false | rule   |       1 | t      |       2
 c-20261020-235348-5 | fan    | true  | rule   |       1 | t      |       3
 c-20261020-234847-1 | fan    | false | api    |         | t      |      10
(3 rows)
```

Then look at the event log with WIB times (Module 17 Concept 9). **`left(message, 45)`** only takes the first 45 characters of the message, so that the table fits on the screen:

```sql
SELECT id, occurred_at AT TIME ZONE 'Asia/Jakarta' AS occurred_at_wib, kind, source, rule_id, left(message, 45) AS message
FROM events ORDER BY id;
```

**Expected output** (**example**):

```text
 id |      occurred_at_wib       |     kind     | source | rule_id |                    message                    
----+----------------------------+--------------+--------+---------+-----------------------------------------------
  1 | 2026-10-21 06:49:00.868307 | rule-changed | api    |       1 | Rule 1 (Automatic fan) created through the AP
  2 | 2026-10-21 06:49:05.613401 | rule-changed | api    |       1 | Rule 1 (Automatic fan) changed through the AP
  3 | 2026-10-21 06:51:40.475475 | rule-changed | api    |       1 | Rule 1 (Automatic fan) changed through the AP
  4 | 2026-10-21 06:53:48.413123 | rule         | rule   |       1 | 🌡️ Temperature 31 °C — fan turned on automati
  5 | 2026-10-21 06:54:10.3509   | rule         | rule   |       1 | ✅ Temperature down to 27 °C — fan turned off
(5 rows)
```

Finally, here's the shortest answer to "who turned the fan on today", complete with the rule's name. This query uses **`LEFT JOIN`**, a sibling of `JOIN` from Module 17 Concept 8. An ordinary `JOIN` drops the `commands` rows that have no match in `rules`, for example the commands from the API. `LEFT JOIN` still shows those rows, with an empty rule name:

```sql
SELECT to_char(c.sent_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS time_wib, c.source, r.name AS rule, c.ack_ok
FROM commands c LEFT JOIN rules r ON r.id = c.rule_id
WHERE c.target = 'fan' AND c.value = 'true'
  AND c.sent_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
ORDER BY c.sent_at;
```

**Expected output** (**example**):

```text
 time_wib | source |     rule      | ack_ok 
----------+--------+---------------+--------
 06:22:39 | api    |               | t
 06:25:53 | api    |               | t
 06:27:10 | api    |               | t
 06:27:49 | api    |               | t
 06:53:48 | rule   | Automatic fan | t
(5 rows)
```

In this example, the fan was turned on four times from the API (your command and the reconciliation in Practice 2; on your screen, the number depends on how many times you tried) and once by the rule "Automatic fan". The `date_trunc(…)` line computes 00:00 WIB today, so that only today's commands are shown. Before you save to the branch, stop the backend in the first terminal (**Ctrl + C**). That terminal is still in the `backend` folder, and `cd ..` below takes it to `mini-smart-home`.

#### 4.10 Save to the branch

```text
cd ..
git add backend tools
git commit -m "Automation rules in the database, the /rules API, retained config, and the event log (Module 19 Practice 4)"
```

> ⬆️ **Done with Practice 4?** Go back to [Concept 8](#8-scheduling-an-alarm-clock-for-the-server) before Practice 5.

### Practice 5 — A morning watering schedule (25 minutes)

> 🖥️ **Tools used:** **VS Code** (the backend and the simulator), a browser for **`/docs`**, and **psql**. The laptop path uses the simulator `f00d00000001`, as in Practice 4. The device path uses Node 1 for this schedule rule (the real pump will run, so make sure its hose goes into a container and the water tank is above 20%).

This practice puts Concept 8 to work: the rules engine gets a second kind of rule, the **schedule** rule, which node-cron runs by WIB time.

#### 5.1 Install node-cron

Stop `npm run dev` if it's still running (**Ctrl + C**). In the first terminal, go back into the `backend` folder (`cd backend`; since the commit of Practice 4, that terminal has been in `mini-smart-home`), then run:

```text
npm install node-cron@4.6.0
```

**Expected output:**

```text
added 1 package, and audited 200 packages in 6s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Just one package, with no helper packages, and it already brings its own TypeScript types. Don't install `@types/node-cron`: that package holds the types for node-cron version 3, not version 4.6.0.

#### 5.2 The shape of a schedule rule

Open **`backend/src/schemas/rules.ts`** and replace its whole content with a version that knows two kinds of rules:

```ts
// rules.ts - the shape of an automation rule (Module 19) as a Zod schema. A rule is DATA, not code: only the shapes
// known here may come in, both through the API and from the database.
import { z } from "zod";
import cron from "node-cron";
import { DeviceId, SetCommand } from "./contract.ts";

// the telemetry quantities a threshold rule may use
const Quantity = z.enum(["temperature", "humidity", "light", "soil", "water_level", "soil_rs485", "soil_temperature"]);

// "If <quantity> of that device stays above <on_above> continuously for <for_seconds> seconds, the rule turns on;
// the rule turns off again when <quantity> is below <off_below>."
export const ThresholdCondition = z.strictObject({
  kind: z.literal("threshold"),
  device_id: DeviceId,
  quantity: Quantity,
  on_above: z.number(),
  off_below: z.number(),
  for_seconds: z.number().int().min(0).max(3600),
}).refine((c) => c.off_below < c.on_above, {
  message: "off_below must be smaller than on_above (hysteresis)",
  path: ["off_below"],
});

// "Every <cron> (WIB time) ..." — a 5-field cron expression: minute hour day month weekday, for example "0 6 * * *"
export const ScheduleCondition = z.strictObject({
  kind: z.literal("schedule"),
  cron: z.string()
    .refine((text) => text.trim().split(/\s+/).length === 5, "a schedule uses 5 fields: minute hour day month weekday")
    .refine((text) => cron.validate(text), "invalid cron expression"),
});

// "... then turn on <target> of that device, and turn it off again when the rule turns off."
export const SwitchAction = z.strictObject({
  kind: z.literal("switch"),
  device_id: DeviceId,
  target: z.enum(["fan", "lamp"]),
  notify: z.boolean(), // send a Telegram message when this rule acts?
});

// "... then send one set command", for example the pump for 10 seconds. Uses the same command schema as the API.
export const CommandAction = z.strictObject({
  kind: z.literal("command"),
  device_id: DeviceId,
  command: SetCommand,
  notify: z.boolean(),
});

// The fields of one rule (name, active, condition, action), without the combined checks.
export const RuleFields = z.strictObject({
  name: z.string().min(1).max(60),
  active: z.boolean(),
  condition: z.discriminatedUnion("kind", [ThresholdCondition, ScheduleCondition]),
  action: z.discriminatedUnion("kind", [SwitchAction, CommandAction]),
});

// The body of POST /rules and PUT /rules/:id.
export const Rule = RuleFields
  .refine((a) => (a.condition.kind === "threshold") === (a.action.kind === "switch"), {
    message: "a threshold condition goes with a switch action; a schedule condition with a command action",
    path: ["action", "kind"],
  })
  // The threshold of a fan rule is also sent to the device as temp_fan_on (config, contract 1.3), so its range must be the
  // same as what the device accepts: 15-45 °C.
  .refine((a) => a.condition.kind !== "threshold" || a.action.kind !== "switch" || a.condition.quantity !== "temperature"
    || a.action.target !== "fan" || (a.condition.on_above >= 15 && a.condition.on_above <= 45), {
    message: "for a fan rule, on_above must be 15-45 °C (it is also sent to the device as temp_fan_on)",
    path: ["condition", "on_above"],
  });

export type ThresholdCondition = z.infer<typeof ThresholdCondition>;
export type SwitchAction = z.infer<typeof SwitchAction>;
export type Rule = z.infer<typeof Rule>;

// a rule already stored in the database: plus its number and its times
export type StoredRule = Rule & { id: number; created_at: string; updated_at: string };
```

- **`ScheduleCondition`** accepts a cron expression (Concept 8) with two checks: it must have **5 fields**, and it must be valid according to node-cron's **`cron.validate()`**. node-cron actually accepts 6 fields too (with seconds in front), but a schedule down to the second makes no sense for watering, so this module only uses the 5-field form.
- **`CommandAction`** reuses the **`SetCommand`** schema from the data contract, so a schedule rule can't possibly tell the `pump` to run for 20 seconds or the `curtain` to go to 200°: the same schema the API uses already refuses that.
- **`z.discriminatedUnion("kind", […])`** means "one of these shapes, told apart by the `kind` field". If `kind` is `schedule`, Zod checks the content with `ScheduleCondition`; if it's `threshold`, with `ThresholdCondition`.
- **`Rule`** now has two combined checks: a `threshold` condition must go with a `switch` action, and a `schedule` condition with a `command` action; then comes the 15–45 °C limit from Practice 4.

#### 5.3 The scheduler: `schedule.ts`

Create the file **`backend/src/services/schedule.ts`**:

```ts
// schedule.ts - schedule rules (Module 19): commands that run at a set time, for example "water for 10 seconds every day
// at 06:00 WIB", with node-cron 4.6.0. Their time zone is ALWAYS Asia/Jakarta (WIB), whatever the laptop's time zone is.
import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import type { StoredRule } from "../schemas/rules.ts";
import { issueCommand } from "./commands.ts";
import type { CommandResult } from "./commands.ts";
import { recordEvent } from "./events.ts";
import { log } from "./log.ts";

export const ZONE = "Asia/Jakarta";
const tasks = new Map<number, ScheduledTask>(); // rule number -> node-cron task

// a WIB time for humans, for example "22 Oct 2026, 06:00 WIB"
const wibFormat = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, dateStyle: "medium", timeStyle: "short" });
export const wibTime = (time: Date) => `${wibFormat.format(time)} WIB`;

// Take down every old task, then install them again from the list of rules. Called every time the rules are reloaded.
export function installSchedules(rules: StoredRule[]): void {
  for (const t of tasks.values()) t.destroy();
  tasks.clear();
  for (const a of rules) {
    if (!a.active || a.condition.kind !== "schedule") continue;
    const t = cron.schedule(a.condition.cron, () => runSchedule(a), {
      name: `rule-${a.id}`,
      timezone: ZONE, // without this, the schedule follows the laptop's zone (a UTC+8 laptop waters at 05:00 WIB)
      noOverlap: true, // if the previous run hasn't finished yet, don't run twice at the same time
      missedExecutionTolerance: 15 * 60_000, // up to 15 minutes late (for example a laptop that just woke up) still runs
    });
    t.on("execution:missed", (context) => scheduleMissed(a, context.date));
    tasks.set(a.id, t);
    const next = t.getNextRun();
    log.info(`schedule of rule ${a.id} (${a.name}) installed: "${a.condition.cron}" ${ZONE}, `
      + `next ${next === null ? "-" : wibTime(next)}`);
  }
}

// for GET /rules: when this rule's schedule runs again (null if it isn't a schedule rule or isn't active)
export function nextRun(id: number): Date | null {
  return tasks.get(id)?.getNextRun() ?? null;
}

// Run the action of a schedule rule now: called by node-cron at its time, or by POST /rules/:id/run to test it.
export async function runSchedule(a: StoredRule): Promise<CommandResult> {
  if (a.action.kind !== "command") throw new Error(`rule ${a.id} is not a schedule rule`);
  const { device_id: deviceId, command } = a.action;
  log.info(`schedule of rule ${a.id} (${a.name}) running: ${command.target} = ${command.value} to ${deviceId}`);
  const result = await issueCommand(deviceId, command, "schedule", a.id);
  let message: string;
  if (result.status === "answered" && result.ack.ok) {
    message = command.target === "pump" ? `🚿 ${a.name}: pump on for ${command.value} seconds`
      : `⏰ ${a.name}: ${command.target} = ${command.value}`;
  } else if (result.status === "answered") {
    message = `⚠️ ${a.name}: ${command.target} command refused by the device (${result.ack.message})`;
  } else if (result.status === "no-ack") {
    message = `⚠️ ${a.name}: ${deviceId} did not answer the ${command.target} command`;
  } else {
    message = `⚠️ ${a.name}: ${command.target} command not sent (${result.message})`;
  }
  log.info(`schedule of rule ${a.id}: ${message}`);
  recordEvent({ device_id: deviceId, kind: "schedule", source: "schedule", rule_id: a.id, message,
    data: { command, result: result.status } });
  return result;
}

// node-cron 4 does NOT replay a missed schedule (for example a laptop asleep at 06:00): all we can do is record it.
function scheduleMissed(a: StoredRule, time: Date): void {
  const message = `⏰ Schedule ${a.name} at ${wibTime(time)} missed (laptop asleep or backend busy?)`;
  log.warn(message);
  recordEvent({ device_id: null, kind: "schedule", source: "schedule", rule_id: a.id, message, data: { missed: time } });
}

// stopping gracefully: stop every task and wait for the ones that are running (node-cron 4.6.0)
export async function stopSchedules(): Promise<void> {
  await cron.shutdown();
}
```

- **`installSchedules()`** takes down every old task (`destroy()`), then installs one node-cron task for every active schedule rule. Taking everything down and installing it again is the simplest way to make rule changes apply right away.
- The **`timezone: ZONE`** option (`Asia/Jakarta`) makes `0 6 * * *` mean 06:00 **WIB**, whatever the laptop's time zone is. **`noOverlap: true`** stops the same schedule from running twice at the same time, and **`missedExecutionTolerance`** still runs a schedule that's up to 15 minutes late, for example because the laptop just woke up.
- A schedule that's later than that triggers the **`execution:missed`** event, and **`scheduleMissed()`** records it in the log and the event log. node-cron 4 never runs it afterward (Concept 8).
- **`runSchedule()`** sends the command through **`issueCommand(…, "schedule", a.id)`**, then writes a sentence about the result, for example `🚿 Morning watering: pump on for 10 seconds`, to the log and the event log.
- **`wibTime()`** writes a time for humans with an **`Intl.DateTimeFormat`** in the `Asia/Jakarta` zone, for example `22 Oct 2026, 06:00 WIB`.
- **`import type { ScheduledTask }`** only takes the **type** of a node-cron task for TypeScript, without bringing in any code. `Map<number, ScheduledTask>` is the "rule number → node-cron task" notebook that `installSchedules()` uses to take down the old tasks.

#### 5.4 Automation knows two kinds of rules

Open **`backend/src/services/automation.ts`** and replace its whole content:

```ts
// automation.ts - runs the automation rules from the rules table (Module 19): loads the rules into memory, evaluates every
// reading with the pure brain (rules/engine.ts), acts through issueCommand(), sends the fan threshold to the device (config),
// installs the schedule rules (schedule.ts), and records every action in the event log.
import { Rule } from "../schemas/rules.ts";
import type { SwitchAction, StoredRule, ThresholdCondition } from "../schemas/rules.ts";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { INITIAL_MEMORY, evaluateThreshold } from "../rules/engine.ts";
import type { Memory } from "../rules/engine.ts";
import { getAllRules, insertRule, updateRule, contractTime } from "../db/archive.ts";
import type { RuleRow } from "../db/archive.ts";
import { findDevice, waitForAck } from "./store.ts";
import { makeCommandId, sendConfig, summarize } from "./mqtt.ts";
import { issueCommand } from "./commands.ts";
import type { CommandResult } from "./commands.ts";
import { installSchedules } from "./schedule.ts";
import { recordEvent } from "./events.ts";
import { log } from "./log.ts";

const STALE_READING_MS = 60_000; // a reading whose ts is older than 60 seconds (late data) is not evaluated
let rules: StoredRule[] = []; // every valid rule, by number
const memory = new Map<number, Memory>(); // rule number -> evaluateThreshold memory

// Reload every rule from the database. Invalid rows (for example edited by hand in DBeaver) are skipped.
export async function loadRules(): Promise<void> {
  const valid: StoredRule[] = [];
  for (const row of await getAllRules()) {
    const result = Rule.safeParse({ name: row.name, active: row.active, condition: row.condition, action: row.action });
    if (!result.success) {
      log.warn(`rule ${row.id} skipped: ${summarize(result.error)}`);
      continue;
    }
    valid.push({ ...result.data, id: row.id, created_at: contractTime(row.created_at), updated_at: contractTime(row.updated_at) });
  }
  rules = valid;
  log.info(`rules loaded: ${valid.filter((a) => a.active).length} active of ${valid.length}`);
  installSchedules(valid); // schedule rules: the node-cron tasks are taken down and installed again
}

export function allRules(): StoredRule[] {
  return rules;
}

export function findRule(id: number): StoredRule | undefined {
  return rules.find((a) => a.id === id);
}

// POST /rules: save a new rule, which applies right away
export async function createRule(content: Rule): Promise<StoredRule> {
  return afterChange(await insertRule(content), "created");
}

// PUT /rules/:id: the result is undefined if no rule has that number
export async function replaceRule(id: number, content: Rule): Promise<StoredRule | undefined> {
  const row = await updateRule(id, content);
  return row === undefined ? undefined : afterChange(row, "changed");
}

async function afterChange(row: RuleRow, word: string): Promise<StoredRule> {
  memory.delete(row.id); // a new threshold = a new "for" count
  await loadRules();
  const a = findRule(row.id);
  if (a === undefined) throw new Error(`rule ${row.id} is invalid after saving`);
  const message = `Rule ${a.id} (${a.name}) ${word} through the API: ${describeRule(a)}`;
  log.info(message);
  recordEvent({ device_id: null, kind: "rule-changed", source: "api", rule_id: a.id, message,
    data: { name: a.name, active: a.active, condition: a.condition, action: a.action } });
  sendAllConfigs();
  return a;
}

// a short sentence for the log and the event log
function describeRule(a: StoredRule): string {
  const { condition: c, action } = a;
  const inactive = a.active ? "" : " (inactive)";
  if (c.kind === "schedule" && action.kind === "command") {
    return `${action.command.target} ${action.device_id} = ${action.command.value} every "${c.cron}" WIB${inactive}`;
  }
  if (c.kind === "threshold" && action.kind === "switch") {
    return `${action.target} ${action.device_id} on when ${c.quantity} ${c.device_id} is above ${c.on_above} `
      + `for ${c.for_seconds} seconds, off below ${c.off_below}${inactive}`;
  }
  return "unknown rule shape";
}

// Send the safety threshold to every device that has a fan rule based on temperature: temp_fan_on = on_above
// (contract 1.3, retained config). Called every time the backend connects to the broker and every time a rule changes.
export function sendAllConfigs(): void {
  const done = new Set<string>(); // one device, one threshold: the active fan rule with the lowest number
  for (const a of rules) {
    const { condition, action } = a;
    if (!a.active || condition.kind !== "threshold" || action.kind !== "switch") continue;
    if (condition.quantity !== "temperature" || action.target !== "fan" || done.has(action.device_id)) continue;
    done.add(action.device_id);
    void sendThreshold(action.device_id, condition.on_above, a.id);
  }
}

async function sendThreshold(deviceId: string, temperature: number, ruleId: number): Promise<void> {
  const id = makeCommandId();
  const waiting = waitForAck(id, 5000); // start waiting BEFORE sending, like a set command
  sendConfig(deviceId, id, { temp_fan_on: temperature });
  log.info(`config ${id} to ${deviceId}: temp_fan_on ${temperature} from rule ${ruleId} (retained)`);
  const ack = await waiting;
  if (ack === null) {
    log.warn(`config ${id} to ${deviceId}: no answer in 5 seconds; the config stays retained on the broker until the device connects`);
  } else {
    log.info(`config ${id} to ${deviceId}: ack ok=${ack.ok}${ack.message === undefined ? "" : ` (${ack.message})`}`);
  }
}

// Called by mqtt.ts for every telemetry that passes the contract.
export function evaluateReading(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  const now = Date.now();
  if (now - Date.parse(content.ts) > STALE_READING_MS) return; // late data: not the current state
  const reading: Record<string, unknown> = content;
  for (const a of rules) {
    const { condition, action } = a;
    if (!a.active || condition.kind !== "threshold" || action.kind !== "switch" || condition.device_id !== deviceId) continue;
    const raw = reading[condition.quantity];
    const value = typeof raw === "number" ? raw : null; // null: a failed sensor, or a field the device doesn't have
    const previous = memory.get(a.id) ?? initialMemory(action);
    const { memory: updated, decision } = evaluateThreshold(condition, previous, value, now);
    memory.set(a.id, updated);
    if (decision !== null) {
      void act(a, condition, action, decision, value, content.ts, previous);
    } else if (previous.since === null && updated.since !== null) {
      log.info(`rule ${a.id} (${a.name}): ${condition.quantity} ${value} above ${condition.on_above}; `
        + `${action.target} turned on if it lasts ${condition.for_seconds} seconds`);
    } else if (previous.since !== null && updated.since === null) {
      log.info(`rule ${a.id} (${a.name}): count restarted (${condition.quantity} ${value ?? "unreadable"})`);
    }
  }
}

// After the backend restarts or the rule is changed: if the device reports that its actuator is on, treat the rule
// as on so that it gets turned off when the time comes.
function initialMemory(action: SwitchAction): Memory {
  return { ...INITIAL_MEMORY, active: findDevice(action.device_id)?.reported?.[action.target] === true };
}

async function act(a: StoredRule, condition: ThresholdCondition, action: SwitchAction, decision: "turn-on" | "turn-off",
  value: number | null, readingTs: string, previous: Memory): Promise<void> {
  const turnOn = decision === "turn-on";
  const result = await issueCommand(action.device_id, { target: action.target, value: turnOn }, "rule", a.id);
  if (result.status === "not-sent") {
    memory.set(a.id, previous); // the decision hasn't been carried out: the next reading decides again
    log.warn(`rule ${a.id} (${a.name}): ${action.target} can't be turned ${turnOn ? "on" : "off"}: ${result.message}`);
    return;
  }
  const message = sentence(condition, action, turnOn, value, result);
  log.info(`rule ${a.id} (${a.name}): ${message}`);
  recordEvent({ device_id: action.device_id, kind: "rule", source: "rule", rule_id: a.id, message,
    data: { decision, value, reading_ts: readingTs, command: result.id, result: result.status } });
}

const LABEL: Record<string, [string, string, string]> = { // quantity -> [emoji, name, unit]
  temperature: ["🌡️", "Temperature", " °C"], humidity: ["💧", "Humidity", " %"], light: ["💡", "Light", ""],
  soil: ["🌱", "Soil", " %"], water_level: ["🚰", "Water level", " %"], soil_rs485: ["🌱", "Soil (RS-485)", " %"],
  soil_temperature: ["🌡️", "Soil temperature", " °C"],
};
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27.8"

// A sentence for humans, for example "🌡️ Temperature 33 °C — fan turned on automatically" (the same as its Telegram message).
function sentence(condition: ThresholdCondition, action: SwitchAction, turnOn: boolean, value: number | null,
  result: CommandResult): string {
  const [emoji, name, unit] = LABEL[condition.quantity];
  const text = value === null ? "-" : num.format(value);
  if (result.status === "no-ack") return `⚠️ ${name} ${text}${unit} — ${action.target} did NOT answer the command (will retry)`;
  if (result.status === "answered" && !result.ack.ok) {
    return `⚠️ ${name} ${text}${unit} — ${action.target} command refused by the device: ${result.ack.message}`;
  }
  return turnOn ? `${emoji} ${name} ${text}${unit} — ${action.target} turned on automatically`
    : `✅ ${name} down to ${text}${unit} — ${action.target} turned off`;
}
```

The changes compared with Practice 4:

- **`loadRules()`** now also calls **`installSchedules(valid)`**, so every time the rules are reloaded, their schedules are installed again too.
- Because `condition` and `action` can now have two shapes, the code that's only for threshold rules checks the kind first: **`if (… condition.kind !== "threshold" || action.kind !== "switch" …) continue;`**. After that check, TypeScript knows that `condition` must be a `ThresholdCondition`, so `condition.quantity` may be used. That's why `act` and `sentence` now take a `condition` and an `action` whose shapes are already certain, and `initialMemory` only needs the `action`.
- **`describeRule()`** has a sentence for schedule rules, and the new function **`findRule()`** is used by the routes in the next step.

#### 5.5 Routes: when is the next run, and run it now

Open **`backend/src/routes/rules.ts`** and replace its whole content:

```ts
// rules.ts - the /rules routes (Module 19): view, create, and change automation rules without changing code and without
// restarting the server, and run a schedule rule right now to test it.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack } from "../schemas/contract.ts";
import { Rule, RuleFields } from "../schemas/rules.ts";
import type { StoredRule } from "../schemas/rules.ts";
import { createRule, findRule, replaceRule, allRules } from "../services/automation.ts";
import { nextRun, runSchedule } from "../services/schedule.ts";
import { contractTime } from "../db/archive.ts";

const ErrorBody = z.object({ message: z.string() });
const IdParam = z.object({ id: z.coerce.number().int().min(1).describe("the rule number, for example 1") });
const FullRule = z.object({
  id: z.number().describe("the rule number"),
  ...RuleFields.shape,
  created_at: z.string().describe("when the rule was created (UTC)"),
  updated_at: z.string().describe("when the rule was last changed (UTC)"),
  next_run: z.string().nullable().describe("schedule rules: when it runs again (UTC); otherwise null"),
});

// a stored rule + when its schedule runs again
function withNextRun(a: StoredRule) {
  const next = nextRun(a.id);
  return { ...a, next_run: next === null ? null : contractTime(next) };
}

export const ruleRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/rules", {
    schema: {
      tags: ["rules"],
      summary: "Every automation rule the server is using right now",
      response: { 200: z.array(FullRule).describe("the valid rules, by number") },
    },
  }, async () => allRules().map(withNextRun));

  app.post("/rules", {
    schema: {
      tags: ["rules"],
      summary: "Create a new automation rule; it applies right away, without restarting the server",
      body: Rule,
      response: {
        201: FullRule.describe("the rule is stored and used right away"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      return reply.code(201).send(withNextRun(await createRule(req.body)));
    } catch (error) {
      req.log.error(`the new rule couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.put("/rules/:id", {
    schema: {
      tags: ["rules"],
      summary: "Replace the whole content of one rule; it applies right away, without restarting the server",
      params: IdParam,
      body: Rule,
      response: {
        200: FullRule.describe("the rule is stored and used right away"),
        404: ErrorBody.describe("no rule has that number"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      const rule = await replaceRule(req.params.id, req.body);
      if (rule === undefined) return reply.code(404).send({ message: `rule ${req.params.id} doesn't exist` });
      return withNextRun(rule);
    } catch (error) {
      req.log.error(`rule ${req.params.id} couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.post("/rules/:id/run", {
    schema: {
      tags: ["rules"],
      summary: "Run the action of one schedule rule right now (to test it, without waiting for its time)",
      params: IdParam,
      response: {
        200: z.object({ id: z.string(), wait_ms: z.number(), ack: Ack }).describe("the device answered with an ack"),
        404: ErrorBody.describe("no rule has that number"),
        409: ErrorBody.describe("not a schedule rule, the rule isn't active, or its command can't be sent"),
        503: ErrorBody.describe("the backend is not connected to the broker"),
        504: ErrorBody.describe("no ack within 5 seconds"),
      },
    },
  }, async (req, reply) => {
    const rule = findRule(req.params.id);
    if (rule === undefined) return reply.code(404).send({ message: `rule ${req.params.id} doesn't exist` });
    if (rule.condition.kind !== "schedule") return reply.code(409).send({ message: `rule ${rule.id} is not a schedule rule` });
    if (!rule.active) return reply.code(409).send({ message: `rule ${rule.id} is not active` });
    const result = await runSchedule(rule);
    if (result.status === "not-sent") return reply.code(result.code === 404 ? 409 : result.code).send({ message: result.message });
    if (result.status === "no-ack") return reply.code(504).send({ message: `no ack for ${result.id} within 5 seconds` });
    return { id: result.id, wait_ms: result.wait_ms, ack: result.ack };
  });
};
```

- Every rule in the API's answer now carries the **`next_run`** field: when its schedule runs again (UTC), or `null` for threshold rules and inactive rules. `id` is now written first, so it's easy to read.
- The new route **`POST /rules/:id/run`** runs the action of a schedule rule **right now**, so you can test it without waiting for 06:00 tomorrow. A rule that isn't a schedule rule, or isn't active, is answered with `409`.

#### 5.6 The 11th test

Open **`backend/src/rules/engine.test.ts`** and add one test at the end of the `describe("rule schema (Zod)", …)` group, right before its last closing `});`:

```ts
  it("schedule rule: \"0 6 * * *\" accepted, \"61 * * * *\" refused", () => { // Practice 5
    const watering = {
      name: "Morning watering", active: true, condition: { kind: "schedule", cron: "0 6 * * *" },
      action: { kind: "command", device_id: "f00d00000001", command: { target: "pump", value: 10 }, notify: true },
    };
    expect(Rule.safeParse(watering).success).toBe(true);
    expect(Rule.safeParse({ ...watering, condition: { kind: "schedule", cron: "61 * * * *" } }).success).toBe(false);
  });
```

Run `npm run check`, then `npm test`. The `Tests` line in its summary now says **`Tests  11 passed (11)`**. The "10 green unit tests" requirement is still met: the ten tests of Practice 3 haven't changed, and now there's one more.

#### 5.7 Try the schedule

Make sure the Module 19 simulator is still running for one device (the device path: Node 1 is on too; the fan rule still points at the simulator, and this watering rule points at Node 1), then start the backend (`npm run dev`). In `/docs`, open **`POST /rules`** and create the morning watering rule (the device path: replace the `device_id` with your Node 1's):

```json
{"name":"Morning watering","active":true,"condition":{"kind":"schedule","cron":"0 6 * * *"},"action":{"kind":"command","device_id":"f00d00000001","command":{"target":"pump","value":10},"notify":true}}
```

**Expected output:** code `201` (**example**, the end of it):

```json
  "created_at": "2026-10-21T00:01:51Z",
  "updated_at": "2026-10-21T00:01:51Z",
  "next_run": "2026-10-21T23:00:00Z"
```

`23:00:00Z` is 06:00 WIB the next day, because WIB = UTC + 7. The backend log writes it in WIB (**example**, the first three lines; after them come the line `config … temp_fan_on 30 from rule 1 (retained)` and its `ack ok=true`, because every rule change publishes `config` again, Concept 7):

```text
[07:01:51] INFO: rules loaded: 2 active of 2
[07:01:51] INFO: schedule of rule 2 (Morning watering) installed: "0 6 * * *" Asia/Jakarta, next 22 Oct 2026, 06:00 WIB
[07:01:51] INFO: Rule 2 (Morning watering) created through the API: pump f00d00000001 = 10 every "0 6 * * *" WIB
```

Of course, you don't need to wait until 06:00. Open **`POST /rules/{id}/run`**, fill in `id` with `2`, then click **Execute**. **Expected output:** code `200` with an `ack` that shows `"pump": true`, and the backend log (**example**):

```text
[07:01:56] INFO: schedule of rule 2 (Morning watering) running: pump = 10 to f00d00000001
[07:01:56] INFO: command c-20261021-000156-4 (schedule) to f00d00000001: pump = 10, ack ok=true in 6 ms
[07:01:56] INFO: schedule of rule 2: 🚿 Morning watering: pump on for 10 seconds
[07:01:56] INFO: POST /rules/2/run -> 200 (41 ms)
```

Now prove that node-cron really runs at its time. Look at the current WIB time (on a WITA laptop subtract 1 hour, on a WIT laptop subtract 2 hours), add **3 minutes**, then create a test rule with that minute and hour. For example, if it's 07:01 WIB now, use `4 7 * * *` (07:04):

```json
{"name":"Schedule test","active":true,"condition":{"kind":"schedule","cron":"4 7 * * *"},"action":{"kind":"command","device_id":"f00d00000001","command":{"target":"pump","value":2},"notify":false}}
```

Wait until that time comes. **Expected output** in the backend log, exactly at second 0 of that minute (**example**):

```text
[07:04:00] INFO: schedule of rule 3 (Schedule test) running: pump = 2 to f00d00000001
[07:04:00] INFO: command c-20261021-000400-5 (schedule) to f00d00000001: pump = 2, ack ok=true in 7 ms
[07:04:00] INFO: schedule of rule 3: 🚿 Schedule test: pump on for 2 seconds
```

Then **deactivate that test rule** so it doesn't water every day: send `PUT /rules/3` with the same content, but with `"active":false`. In its answer, `next_run` becomes `null`, and the log writes `… (inactive)`.

Also try a few mistaken rules through `POST /rules`. They're all refused with `400` before they touch the database:

| What you try | The message in the `400` answer |
| :--- | :--- |
| `"cron":"61 * * * *"` (minute 61) | `body/condition/cron invalid cron expression` |
| `"cron":"*/30 * * * * *"` (6 fields) | `body/condition/cron a schedule uses 5 fields: minute hour day month weekday` |
| a `schedule` condition with a `switch` action | `body/action/kind a threshold condition goes with a switch action; a schedule condition with a command action` |
| a fan rule with `"on_above":50` | `body/condition/on_above for a fan rule, on_above must be 15-45 °C (it is also sent to the device as temp_fan_on)` |

The request `POST /rules/1/run` (the fan rule) is refused too, with code `409` and the message `rule 1 is not a schedule rule`.

#### 5.8 Its trail in the database

In psql, the commands from the schedule now have `schedule` as their source:

```sql
SELECT to_char(sent_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS time_wib, id, target, value, source, rule_id, ack_ok
FROM commands WHERE source = 'schedule' ORDER BY sent_at;
```

**Expected output** (**example**):

```text
 time_wib |         id          | target | value |  source  | rule_id | ack_ok 
----------+---------------------+--------+-------+----------+---------+--------
 07:01:56 | c-20261021-000156-4 | pump   | 10    | schedule |       2 | t
 07:04:00 | c-20261021-000400-5 | pump   | 2     | schedule |       3 | t
(2 rows)
```

The times in the `time_wib` column are the same as the times in the backend log: both are WIB. Before saving to the branch, stop the backend in the first terminal (**Ctrl + C**). That terminal is still in the `backend` folder, and the `cd ..` below takes it to `mini-smart-home`.

#### 5.9 Save to the branch

```text
cd ..
git add backend
git commit -m "Schedule rules with node-cron, time zone Asia/Jakarta (Module 19 Practice 5)"
```

> ⬆️ **Done with Practice 5?** Go back to [Concept 9](#9-telegram-notifications-important-fast-and-not-chatty) before Practice 6.

### Practice 6 — A Telegram bot with good manners (60 minutes)

> 🖥️ **Tools used:** the **Telegram** app on your phone or laptop (for @BotFather and your bot), **VS Code** (the backend, the simulator, and the small terminal), and a browser for **`/docs`**. Every path, including the device path (with the Pi's broker address), tests the fan rule with the simulator `f00d00000001`, as in Practice 4, because its temperature can be set from the terminal. The **Morning watering** rule still points at the device you used in Practice 5.
>
> ⭐ **Required** — this module's third pass requirement: the alert reaches your Telegram **within 10 seconds** of the reading that triggers it.

This practice puts Concept 9 to work. The backend gets a Telegram bot that reports three things: the actions of the automation rules (the fan turning on and off), schedules that run, and devices that are `offline` for more than 60 seconds. The bot also answers two commands: `/start` (it tells you your `chat_id`) and `/status` (a summary of the house, for its owner only).

#### 6.1 Create a bot with @BotFather

This step follows Telegram's official documentation ([core.telegram.org/bots/features#botfather](https://core.telegram.org/bots/features#botfather)) and is done in the Telegram app, not in VS Code.

1. Open Telegram, then search for **@BotFather** in the search box. Make sure its username is exactly `@BotFather`, because there are many fake accounts with similar names. Another way that's sure to be right: open the official link [t.me/botfather](https://t.me/botfather).
2. The first time you open a chat with a bot, Telegram shows a **Start** button at the bottom. Tap that button (or type `/start` and send it). BotFather replies with its list of commands.
3. Send **`/newbot`**. BotFather asks for the bot's **name**, the name shown in the contact list. Type, for example, `Mini Smart Home`.
4. BotFather then asks for the bot's **username**. The rules: 5–32 characters, only Latin letters, digits, and underscores, and it must end in `bot`, for example `mini_smart_home_budi_bot`. The username must be different from every other username on all of Telegram, so add a name or a number until it's accepted. The username can't be changed later.
5. BotFather replies with your bot's **token**. It looks like this example from Telegram's documentation (an example, not a real token):

   ```text
   110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
   ```

   Copy your own token. Step 6.3 puts it in `.env`.

BotFather now also has a Mini App view with the same functions. This module uses the text commands above, because they're easier to follow step by step.

> ⚠️ **Token = your bot's key.** According to Telegram's documentation, anyone who holds the token can control your bot. Don't put it in code, a README, a screenshot, or a Telegram group. Its only place is `backend/.env`, which has stayed out of Git since Module 16. If the token has already leaked or got lost, send **`/token`** to @BotFather to make a new token, then replace it in `.env`.

#### 6.2 Install grammY

Stop `npm run dev` if it's still running (**Ctrl + C**). In the first terminal, go back into the `backend` folder (`cd backend`; since the commit of Practice 5, that terminal has been in `mini-smart-home`), then install the Telegram bot library **grammY**:

```text
npm install grammy@1.46.0
```

**Expected output:**

```text
added 6 packages, and audited 206 packages in 4s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Install it before you write the bot's code. If a file that imports `grammy` already exists before the package is installed, `npm run check` refuses with the error `error TS2307: Cannot find module 'grammy' or its corresponding type declarations.`

#### 6.3 Telegram settings in `.env`

Open **`backend/.env.example`** and add these three lines at the very bottom:

```text
# Telegram (Module 19, optional): the token from @BotFather and your chat_id (the answer to /start). Empty = notifications off.
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

`.env.example` goes into Git, so its values are left **empty**. Then open **`backend/.env`**, add the same three lines, and fill in `TELEGRAM_BOT_TOKEN` with the token from @BotFather (no spaces and no quotation marks). Leave `TELEGRAM_CHAT_ID` empty for now; you get its number in step 6.6.

Then open **`backend/src/config/env.ts`** and add these four lines (one comment and three settings) inside `export const env = { … }`, right below the `HOST` line:

```ts
  // Module 19: Telegram is optional. Empty = Telegram notifications off.
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "", // the token from @BotFather: a secret, like a password
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "", // the owner's chat_id (the answer to /start)
  TELEGRAM_API_ROOT: process.env.TELEGRAM_API_ROOT ?? "", // empty = the real Telegram server (lab: a mock Bot API server)
```

- All three are **optional**: if they're empty, their value is `""` and the backend keeps running without Telegram. They're different from `MQTT_URL` and `DATABASE_URL`, which stop the backend if they aren't filled in.
- You don't need to write **`TELEGRAM_API_ROOT`** in `.env`. If it's empty, the backend uses the real Telegram server. The author used it to test this module's code with a mock Telegram server on the laptop (see the 🔬 Technical Deep Dive).

#### 6.4 The bot: `telegram.ts`

Create the file **`backend/src/services/telegram.ts`** (right-click the **`services`** folder → **New File…**):

```ts
// telegram.ts - the Telegram bot (Module 19, grammY 1.46.0): alerts from the automation rules, /start to find out the
// chat_id, and /status for the owner only. Leave TELEGRAM_BOT_TOKEN empty in .env to turn it off.
import { Bot, GrammyError, HttpError } from "grammy";
import { INITIAL_RECORD, shouldNotify } from "../rules/engine.ts";
import type { NotifyRecord, Situation } from "../rules/engine.ts";
import { allDevices } from "./store.ts";
import { log } from "./log.ts";

let bot: Bot | undefined;
let ownerChat: number | undefined;
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }); // 2.4 -> "2.4"
const wibTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });

export function startTelegram(token: string, chatId: string, apiRoot: string): void {
  if (token === "") {
    log.info("Telegram notifications off: TELEGRAM_BOT_TOKEN is empty");
    return;
  }
  ownerChat = chatId === "" ? undefined : Number(chatId);
  // an empty apiRoot = the real Telegram server; the lab uses a mock Bot API server (TELEGRAM_API_ROOT)
  bot = new Bot(token, apiRoot === "" ? undefined : { client: { apiRoot } });
  bot.command("start", (ctx) => ctx.reply(`Hello! Your chat_id: ${ctx.chat.id}\nWrite this number as TELEGRAM_CHAT_ID in the backend's .env.`));
  bot.command("status", async (ctx) => {
    if (ctx.chat.id !== ownerChat) { // anyone can find the bot: serve its owner only
      await ctx.reply("Sorry, this bot only serves its owner.");
      return;
    }
    await ctx.reply(statusSummary());
  });
  bot.catch((error) => log.error(`Telegram bot error: ${String(error.error)}`)); // an error inside a command handler
  // start() only finishes when the bot stops, so DON'T wait for it (await); .catch catches 401 (wrong token) and 409
  bot.start({ drop_pending_updates: true, onStart: (info) => log.info(`Telegram bot @${info.username} ready (long polling)`) })
    .catch((error) => log.error(`Telegram bot stopped: ${(error as Error).message}`));
  if (ownerChat === undefined) log.warn("TELEGRAM_CHAT_ID is empty: send /start to the bot to find out your chat_id");
}

// Send one message to the owner. readingTs (optional) = the ts of the trigger reading, to measure the delay (pass: <= 10 s).
export async function notify(text: string, readingTs?: string): Promise<boolean> {
  if (bot === undefined || ownerChat === undefined) return false;
  try {
    await bot.api.sendMessage(ownerChat, text);
    const delay = readingTs === undefined ? ""
      : ` ${num.format((Date.now() - Date.parse(readingTs)) / 1000)} seconds after reading ${readingTs}`;
    log.info(`Telegram sent${delay}: ${text}`);
    return true;
  } catch (error) {
    if (error instanceof GrammyError) log.error(`Telegram refused the message: ${error.description}`); // the Bot API answered ok:false
    else if (error instanceof HttpError) log.error(`Telegram server unreachable: ${error.message}`);
    else log.error(`Telegram failed: ${(error as Error).message}`);
    return false;
  }
}

// Debouncing: notify only when the situation changes, and while it is still dangerous at most once every 30 minutes
// (shouldNotify). key = "rule:<number>". reminder = true for an ordinary reading during danger (not a change).
const records = new Map<string, NotifyRecord>();

export async function notifyIfNeeded(key: string, situation: Situation, text: string, readingTs: string,
  reminder = false): Promise<void> {
  const previous = records.get(key);
  if (reminder && previous === undefined) return; // nothing notified since the backend started: don't begin with a reminder
  const { send, record: updated } = shouldNotify(previous ?? INITIAL_RECORD, situation, Date.now());
  records.set(key, updated);
  if (send) await notify(text, readingTs);
}

// Device status: "offline" is only reported once it lasts 60 seconds (Wi-Fi that flickers doesn't make noise).
const offlineTimers = new Map<string, ReturnType<typeof setTimeout>>(); // device_id -> the 60-second timer
const offlineSince = new Map<string, number>(); // device_id -> since when it is offline (already reported)

export function notifyStatus(deviceId: string, status: string): void {
  if (status === "online") {
    const timer = offlineTimers.get(deviceId);
    if (timer !== undefined) { // back before 60 seconds: canceled, no message
      clearTimeout(timer);
      offlineTimers.delete(deviceId);
      return;
    }
    const since = offlineSince.get(deviceId);
    if (since !== undefined) {
      offlineSince.delete(deviceId);
      void notify(`✅ ${deviceId} back online (offline ${Math.round((Date.now() - since) / 60_000)} min)`);
    }
    return;
  }
  if (offlineTimers.has(deviceId) || offlineSince.has(deviceId)) return;
  const start = Date.now();
  offlineTimers.set(deviceId, setTimeout(() => {
    offlineTimers.delete(deviceId);
    offlineSince.set(deviceId, start);
    void notify(`📴 ${deviceId} offline since ${wibTime.format(start)} WIB`);
  }, 60_000));
}

// the answer to /status: the last state of every device in the in-memory store
function statusSummary(): string {
  const lines = [`📋 Mini Smart Home, ${wibTime.format(Date.now())} WIB`];
  for (const d of allDevices()) {
    lines.push(`${d.device_id} (${d.kind}): ${d.status}`);
    const t = d.telemetry;
    if (t !== null) lines.push(`  temperature ${t.temperature === null ? "-" : num.format(t.temperature)} °C, humidity ${t.humidity ?? "-"} %, soil ${t.soil ?? "-"} %`);
    const r = d.reported;
    if (r !== null) lines.push(`  fan ${r.fan ? "on" : "off"}, lamp ${r.lamp ? "on" : "off"}, curtain ${r.curtain}°`);
    if (d.vitals !== null) lines.push(`  signal ${d.vitals.rssi} dBm, uptime ${Math.floor(d.vitals.uptime_s / 60)} min`);
  }
  if (lines.length === 1) lines.push("No device has been heard since the backend started.");
  return lines.join("\n");
}

// stopping gracefully: confirm the last update to Telegram so that it isn't processed twice
export async function stopTelegram(): Promise<void> {
  if (bot?.isRunning()) await bot.stop();
}
```

Here's what its parts do:

- **`startTelegram()`** does nothing if the token is empty (it only writes one log line). If there's a token, it creates `new Bot(token)` and registers two commands. **`/start`** replies to anyone with their own `chat_id`. **`/status`** is only answered if the one asking is the owner's `chat_id`, because anyone can find your bot through its username.
- **`bot.start()`** runs long polling (Concept 9). It only finishes when the bot stops, so it **must not be `await`ed**: the backend would get stuck on that line and never reach `app.listen()`. Instead, `.catch` catches an error that stops the bot, for example a wrong token (`401`), so that the backend doesn't go down with it. The **`drop_pending_updates: true`** option throws away the messages that piled up while the backend was off, so that yesterday's `/status` isn't answered today.
- **`bot.catch()`** catches errors inside the command handlers (`/start`, `/status`). Without it, an error there stops the bot.
- **`notify()`** sends one message to the owner with `bot.api.sendMessage()`. If `readingTs` is given, the log writes the delay from the trigger reading until the Telegram server receives the message. That's the number you check for the pass requirement. A failure never brings the backend down: **`GrammyError`** means that Telegram answered but refused (for example, the token was revoked), while **`HttpError`** means that the Telegram server can't be reached (for example, the internet is down).
- **`notifyIfNeeded()`** is the debouncing. It uses **`shouldNotify()`** from Practice 3, which is already tested, and keeps one `NotifyRecord` per rule in a `Map` (warm-up step 1). A reminder is never the first message: if the backend has just started while the fan is already on, the bot stays quiet until that rule turns the fan on again (even the first "turned off" message after the backend restarts isn't sent, because its initial record is already "safe"; the event is still recorded in the event log).
- **`notifyStatus()`** delays the `offline` message with a 60-second **`setTimeout`**, and cancels it with **`clearTimeout`** if the device comes back `online` before then (warm-up step 4). The `back online` message is only sent if its `offline` message really was sent. The type `ReturnType<typeof setTimeout>` in the `offlineTimers` `Map` means "whatever `setTimeout` returns", that is, the timer ticket from warm-up step 4.
- **`statusSummary()`** puts together the `/status` reply from the in-memory store (Module 16). The time uses an **`Intl.DateTimeFormat`** in the `Asia/Jakarta` zone, and numbers use a decimal point (`28.5`).
- **`stopTelegram()`** is used in step 6.10 to stop gracefully.

Every message is plain text with emoji. Telegram's special formatting (bold text and the like) is deliberately not used, because certain punctuation marks inside it must be escaped, which easily gets a message refused.

#### 6.5 Connect it to the rules, the schedule, and the status

The bot exists, but nothing tells it to send messages yet. Four files need to be connected.

**`backend/src/services/automation.ts`** — add `import { notifyIfNeeded } from "./telegram.ts";` below `import { recordEvent } from "./events.ts";`. Then, in the `evaluateReading()` function, insert a new `else if` branch between `void act(…);` and `} else if (previous.since === null …`, so that part becomes:

```ts
    if (decision !== null) {
      void act(a, condition, action, decision, value, content.ts, previous);
    } else if (updated.active && action.notify) { // still on: a reminder at most once every 30 minutes (shouldNotify)
      const [emoji, name, unit] = LABEL[condition.quantity];
      void notifyIfNeeded(`rule:${a.id}`, "danger",
        `${emoji} ${name} still ${value === null ? "-" : num.format(value)}${unit} — ${action.target} stays on (reminder)`,
        content.ts, true);
    } else if (previous.since === null && updated.since !== null) {
```

This branch runs for every reading while the rule is still on, but `notifyIfNeeded()` only sends a reminder once 30 minutes have passed since the last message. Then, at the end of the `act()` function, add two lines right before its closing `}`:

```ts
  const message = sentence(condition, action, turnOn, value, result);
  log.info(`rule ${a.id} (${a.name}): ${message}`);
  recordEvent({ device_id: action.device_id, kind: "rule", source: "rule", rule_id: a.id, message,
    data: { decision, value, reading_ts: readingTs, command: result.id, result: result.status } });
  // Telegram AFTER the ack result is known so that its message is honest; the delay is measured from the trigger reading
  if (action.notify) void notifyIfNeeded(`rule:${a.id}`, turnOn ? "danger" : "safe", message, readingTs);
}
```

The Telegram message is sent **after** the device's answer is known. So its content is honest: if the device doesn't answer, the message says `did NOT answer the command`, not `turned on automatically`.

**`backend/src/services/schedule.ts`** — add `import { notify } from "./telegram.ts";` below the `recordEvent` import. Then add the following line in **two** places: in `runSchedule()`, right below `recordEvent({ … });` (before `return result;`), and at the end of `scheduleMissed()`, also below `recordEvent({ … });`:

```ts
  if (a.action.notify) void notify(message);
```

**`backend/src/services/mqtt.ts`** — add `import { notify, notifyStatus } from "./telegram.ts";` below `import { recordEvent } from "./events.ts";`. In the `status` part, add the `notifyStatus(…)` line inside `if (!retained) { … }`, so that block becomes:

```ts
      if (!retained) { // a retained status when the backend starts = an old state, not a new event
        const message = result.data === "online" ? `${deviceId} back online` : `${deviceId} disconnected (${result.data})`;
        archiving.then(() => recordEvent({ device_id: deviceId, kind: "status", source: "device", rule_id: null, message }))
          .catch(() => {}); // a failure to save the status is already logged by archiveFailed
        notifyStatus(deviceId, result.data); // Telegram: offline is only reported once it lasts 60 seconds
      }
```

In the `vitals` part, add the `void notify(…)` line at the end of the offline-mode report block (Practice 7 uses it):

```ts
    if (content.offline_s !== undefined) { // Module 19: the offline-mode report (contract 1.3)
      const message = `${deviceId} back from offline mode after ${content.offline_s} seconds; `
        + `local safety turned the fan on ${content.local_fan} time(s)`;
      log.warn(message);
      archiving.then(() => recordEvent({ device_id: deviceId, kind: "offline-report", source: "device", rule_id: null,
        message, data: { offline_s: content.offline_s, local_fan: content.local_fan } })).catch(() => {});
      void notify(`📶 ${message}`);
    }
```

**`backend/src/server.ts`** — add `import { startTelegram } from "./services/telegram.ts";` below `import { loadRules } from "./services/automation.ts";`. Then add one line right **before** `await app.listen(…)`:

```ts
startTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, env.TELEGRAM_API_ROOT); // Module 19: not awaited
```

Run `npm run check` (it must be clean), then `npm test`. Its summary still says **`Tests  11 passed (11)`**: the Telegram bot doesn't change the rules brain, it only adds someone to notify.

#### 6.6 Meet your bot: `/start` and `chat_id`

Make sure the simulator is running for one device and the small terminal is following `f00d00000001`. Start the backend (`npm run dev`). **Expected output** (an **example** from a different run, so its times don't continue into 6.7–6.10; only the beginning, and your screen shows your own bot's username):

```text
[09:37:42] INFO: database ready
[09:37:42] INFO: rules loaded: 2 active of 3
[09:37:42] INFO: schedule of rule 2 (Morning watering) installed: "0 6 * * *" Asia/Jakarta, next 22 Oct 2026, 06:00 WIB
[09:37:42] WARN: TELEGRAM_CHAT_ID is empty: send /start to the bot to find out your chat_id
[09:37:42] INFO: Server listening at http://127.0.0.1:8080
[09:37:42] INFO: API docs: http://127.0.0.1:8080/docs
[09:37:42] INFO: Telegram bot @mini_smart_home_mock_bot ready (long polling)
[09:37:42] INFO: connected to broker mqtt://127.0.0.1:1883
```

The line **`Telegram bot @… ready (long polling)`** means that Telegram accepted your token. The `WARN` line above it reminds you that `TELEGRAM_CHAT_ID` is still empty. The lines `Telegram bot … ready` and `connected to broker` can swap places, because both wait for an answer from the network at the same time.

Now open your bot in Telegram: search for its username, or open the link `https://t.me/<your bot's username>`. Tap **Start**. The bot replies (**example**; the number is your own):

```text
Hello! Your chat_id: 777000111
Write this number as TELEGRAM_CHAT_ID in the backend's .env.
```

Copy that number into `backend/.env`, for example `TELEGRAM_CHAT_ID=777000111`, then save. `npm run dev` watches `.env` too, so the backend restarts by itself (the terminal writes `Change detected in …` and then `Restarting 'src/server.ts'`), and the warning `TELEGRAM_CHAT_ID is empty` doesn't appear anymore. Until that number is saved, the bot doesn't know who its owner is, so even your own `/status` is answered with `Sorry, this bot only serves its owner.`

> 💡 Messages you send to the bot while the backend is off are **thrown away** as soon as the backend starts (`drop_pending_updates`). If the bot stays silent after you tap **Start**, first make sure the log already says `Telegram bot … ready`, then send `/start` once more.

Send **`/status`** to your bot. **Expected output** (**example**):

```text
📋 Mini Smart Home, 07:17 WIB
a4cf12e5b7c0 (node1): online
  temperature 28.5 °C, humidity 71 %, soil 37 %
f00d00000001 (node1): online
  temperature 26.8 °C, humidity 76 %, soil 48 %
  fan off, lamp off, curtain 90°
  signal -40 dBm, uptime 0 min
```

Every device heard since the backend started gets one status line, then its last reading, the reported actuator state (if there is one), and its `vitals` (if there are any yet). A device with a shorter list, like `a4cf12e5b7c0` in this example, simply hasn't sent `state` or `vitals` since the backend started. If a friend of yours sends `/status` to your bot, they only get `Sorry, this bot only serves its owner.`

#### 6.7 Test the pass requirement: an alert within 10 seconds

The **Automatic fan** rule from Practice 4 (number 1: on above 30 °C for 120 seconds, off below 28 °C, `"notify": true`) and **Morning watering** from Practice 5 (number 2, `"notify": true`) are still stored. Both now send you messages through Telegram.

1. **Trigger the fan.** In the simulator's terminal, type **`temp 33`** and press **Enter**. The backend log immediately writes that the 120-second count has started (**example**):

   ```text
   [07:11:02] INFO: rule 1 (Automatic fan): temperature 33 above 30; fan turned on if it lasts 120 seconds
   ```

2. **Wait 2 minutes.** The fan turns on, and in the same second the Telegram message is sent (**example**):

   ```text
   [07:13:02] INFO: command c-20261021-001302-2 (rule) to f00d00000001: fan = true, ack ok=true in 2 ms
   [07:13:02] INFO: rule 1 (Automatic fan): 🌡️ Temperature 33 °C — fan turned on automatically
   [07:13:02] INFO: Telegram sent 0.6 seconds after reading 2026-10-21T00:13:02Z: 🌡️ Temperature 33 °C — fan turned on automatically
   ```

   Your phone receives the message **`🌡️ Temperature 33 °C — fan turned on automatically`**, and the small terminal writes an `event:` line with the same sentence. The number **`0.6 seconds`** is the delay from the trigger reading (`00:13:02Z` = 07:13:02 WIB) until the Telegram server receives the message. That's far below 10 seconds: **the third pass requirement is met.** The notification on the phone usually appears a moment later. If the phone is saving battery, the notification can be late, but the message is already in the chat as soon as you open Telegram.

3. **Prove that the bot isn't chatty.** Leave the temperature at 33 °C for a minute or two. The simulator keeps sending readings every 10 seconds, but **there's no second message**. The reminder `… still 33 °C — fan stays on (reminder)` is only sent if the danger lasts 30 minutes. You don't need to wait for it: the unit tests of Practice 3 already proved that 30-minute rule.

4. **Bring the temperature back.** Type **`temp 25`**. As soon as the 25 °C reading arrives, the fan is turned off and a Telegram message is sent (**example**):

   ```text
   [07:13:34] INFO: command c-20261021-001334-3 (rule) to f00d00000001: fan = false, ack ok=true in 2 ms
   [07:13:34] INFO: rule 1 (Automatic fan): ✅ Temperature down to 25 °C — fan turned off
   [07:13:34] INFO: Telegram sent 0.7 seconds after reading 2026-10-21T00:13:34Z: ✅ Temperature down to 25 °C — fan turned off
   ```

5. **The schedule.** In `/docs`, run **`POST /rules/{id}/run`** with `id` = `2`. The log writes (**example**):

   ```text
   [07:13:45] INFO: schedule of rule 2 (Morning watering) running: pump = 10 to f00d00000001
   [07:13:45] INFO: command c-20261021-001345-4 (schedule) to f00d00000001: pump = 10, ack ok=true in 4 ms
   [07:13:45] INFO: schedule of rule 2: 🚿 Morning watering: pump on for 10 seconds
   [07:13:45] INFO: POST /rules/2/run -> 200 (16 ms)
   [07:13:45] INFO: Telegram sent: 🚿 Morning watering: pump on for 10 seconds
   ```

   A schedule message isn't triggered by a reading, so the log doesn't write its delay. At 06:00 WIB tomorrow, the same message arrives by itself.

#### 6.8 Test the `offline` message: wait 60 seconds

1. **A long disconnection.** Stop the simulator (**Ctrl + C** in its terminal). The small terminal immediately writes `f00d00000001 is now offline`, but Telegram stays quiet for now. After 60 seconds, the log writes (**example**):

   ```text
   [07:15:05] INFO: Telegram sent: 📴 f00d00000001 offline since 07:14 WIB
   ```

2. **Connect again.** Start the simulator again (`node device-simulator.js mqtt://127.0.0.1:1883 1`). The log writes (**example**):

   ```text
   [07:15:21] WARN: f00d00000001 has just restarted (uptime 0 seconds): the server's wishes are reconciled again
   [07:15:21] INFO: ack c-20261021-000952-1 arrived, but no command is waiting for it
   [07:15:21] INFO: Telegram sent: ✅ f00d00000001 back online (offline 1 min)
   ```

   The line `ack … no command is waiting for it` is normal. The simulator that has just started receives the retained `config` from the broker again and answers it, even though the backend stopped waiting for that answer long ago.

3. **A short disconnection.** Stop the simulator again, then start it again **before** 60 seconds pass, for example after 20 seconds. The small terminal writes `offline` and then `online`, but Telegram receives **nothing**. Wi-Fi that flickers doesn't wake anyone up.

#### 6.9 If Telegram has problems, the house keeps running

Telegram is only the messenger. If it has problems, the rules, schedules, and commands must keep running. Prove it yourself: in `backend/.env`, change **one letter** of `TELEGRAM_BOT_TOKEN`, then save. The backend restarts, and the log writes (**example**):

```text
[07:19:31] INFO: Server listening at http://127.0.0.1:8080
[07:19:31] INFO: API docs: http://127.0.0.1:8080/docs
[07:19:31] INFO: connected to broker mqtt://127.0.0.1:1883
[07:19:31] INFO: config c-20261021-001931-1 to f00d00000001: temp_fan_on 30 from rule 1 (retained)
[07:19:31] ERROR: Telegram bot stopped: Call to 'getMe' failed! (401: Unauthorized)
[07:19:31] INFO: config c-20261021-001931-1 to f00d00000001: ack ok=true
```

The bot stops, but the server, the broker, and `config` keep running. Put the right token back, save, and the line `Telegram bot @… ready` appears again. The following table summarizes that `ERROR` line and three other lines that appeared when the author tested. Not one of them stops the backend:

| Log line | What it means | What to do |
| :--- | :--- | :--- |
| `Telegram bot stopped: Call to 'getMe' failed! (401: Unauthorized)` | The token in `.env` has been wrong since the backend started. | Copy the token from @BotFather again, and save `.env`. |
| `Telegram bot stopped: Call to 'getUpdates' failed! (401: Unauthorized)` | The token was revoked while the backend was running, for example because you made a new token with `/token`. | Write the new token in `.env`, and save. A bot that has stopped doesn't start again by itself until the backend restarts. |
| `Telegram refused the message: Unauthorized` | The message wasn't sent because the token isn't valid anymore. The command itself is still sent to the device. | The same as the row above. |
| `Telegram server unreachable: Network request for 'sendMessage' failed!` | The laptop's internet is down, or the Telegram server can't be reached. | Check the internet. A failed message isn't sent again, but the event is still recorded in the event log (the `events` table). |

#### 6.10 Stopping cleanly

Starting this week, the backend holds many things that are still "open": the long-polling request to Telegram, the node-cron scheduler, the Socket.IO clients, the MQTT connection, and the database connection pool. When you press **Ctrl + C**, Node.js normally kills all of them at once, in the middle of whatever they're doing. It's more polite if the backend closes them one by one: the bot confirms the last message to Telegram, a schedule that's running is waited for until it finishes, and the Socket.IO clients are told that the server is saying goodbye.

Open **`backend/src/services/mqtt.ts`** and add this function right below the `brokerConnected()` function:

```ts
// Module 19: stopping gracefully — send DISCONNECT to the broker, then close the connection
export async function stopMqtt(): Promise<void> {
  await client?.endAsync();
}
```

Then open **`backend/src/server.ts`** and replace its whole content with this version:

```ts
// server.ts - the entry point of the Mini Smart Home backend v0.3 (Module 18: the history can be summarized per 15 minutes, hour, and day).
// Run: npm run dev (automatically restarts when a file is saved) or npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { healthRoutes } from "./routes/health.ts";
import { deviceRoutes } from "./routes/devices.ts";
import { ruleRoutes } from "./routes/rules.ts";
import { stopMqtt, startMqtt } from "./services/mqtt.ts";
import { startRealtime } from "./services/realtime.ts";
import { loadRules } from "./services/automation.ts";
import { stopSchedules } from "./services/schedule.ts";
import { stopTelegram, startTelegram } from "./services/telegram.ts";
import { useLog } from "./services/log.ts";
import { databaseAlive } from "./db/archive.ts";
import { pool } from "./db/pool.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // the built-in log per request is too long...
});
useLog(app.log); // Module 19: other services (commands, rules, schedules, Telegram) write to the same log
app.addHook("onResponse", async (req, reply) => {
  // ...so it's replaced by one line per request (hook = Fastify's "middleware")
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
app.setValidatorCompiler(validatorCompiler); // Zod schemas check the content of requests...
app.setSerializerCompiler(serializerCompiler); // ...and the shape of replies

await app.register(swagger, {
  openapi: { info: { title: "Mini Smart Home API", description: "Backend v0.3 (Module 18)", version: "0.3.0" } },
  transform: jsonSchemaTransform, // the same Zod schemas become the OpenAPI documentation
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(healthRoutes);
await app.register(deviceRoutes);
await app.register(ruleRoutes); // Module 19

if (await databaseAlive()) app.log.info("database ready");
else app.log.warn("database not reachable yet: check the database container and DATABASE_URL in .env");
try {
  await loadRules(); // Module 19: automation rules from the rules table
} catch (error) {
  app.log.error(`automation rules couldn't be loaded yet: ${(error as Error).message}`);
}
startRealtime(app); // Module 19: Socket.IO at the address /socket.io/
startMqtt(env.MQTT_URL, app.log);
startTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, env.TELEGRAM_API_ROOT); // Module 19: not awaited
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`API docs: http://${env.HOST}:${env.PORT}/docs`);

// Module 19: stop gracefully on Ctrl + C (SIGINT) or SIGTERM. As soon as these signals have a listener, Ctrl + C no
// longer kills Node.js, so everything still open is closed one by one, then process.exit(0).
async function stopGracefully(signal: string): Promise<void> {
  app.log.info(`${signal} received: the backend is stopping gracefully`);
  try {
    await stopTelegram(); // confirm the last update to Telegram
    await stopSchedules(); // node-cron: wait for the tasks that are running
    await app.close(); // preClose disconnects the Socket.IO clients, then the HTTP server closes
    await stopMqtt(); // DISCONNECT to the broker
    await pool.end(); // close the database connection pool
  } catch (error) {
    app.log.error(`couldn't stop gracefully: ${(error as Error).message}`);
  }
  app.log.info("backend stopped");
  process.exit(0);
}
process.once("SIGINT", () => void stopGracefully("SIGINT"));
process.once("SIGTERM", () => void stopGracefully("SIGTERM"));
```

What's new is at the bottom:

- **`process.once("SIGINT", …)`** listens for the **Ctrl + C** signal, and `SIGTERM` is the "please stop" signal that other programs send. `once` means only once: if stopping gracefully gets stuck, a second **Ctrl + C** kills the backend as usual.
- **`stopGracefully()`** closes everything one by one: the Telegram bot, the scheduler, the HTTP server together with Socket.IO, MQTT, and then the database.
- **`process.exit(0)`** ends the program for sure. As soon as `SIGINT` has a listener, **Ctrl + C** no longer kills Node.js; the program only ends by itself when nothing is open anymore. Just one leftover, for example the `offline` message timer that's still counting its 60 seconds, keeps the backend alive until that job is done, and it even still sends a Telegram message after writing `backend stopped`. With `process.exit(0)`, leftovers like that aren't waited for.

First stop the `npm run dev` that has been running since 6.6 (**Ctrl + C** in the first terminal). In the same terminal, run `npm run check`, then start the backend with **`npm start`** (not `npm run dev`). Wait until the small terminal is following `f00d00000001`, then press **Ctrl + C** in the backend's terminal. **Expected output** (**example**):

```text
[07:24:52] INFO: SIGINT received: the backend is stopping gracefully
[07:24:52] INFO: realtime client disconnected: 3TaGCuwqDEdX8ph4AAAA (server namespace disconnect)
[07:24:52] INFO: backend stopped
```

The small terminal writes `disconnected: io server disconnect`, the sign that the backend said goodbye on purpose, then keeps trying to reconnect until the backend is started again.

Why `npm start`? On Windows, `npm run dev` (`--watch` mode) kills the backend instantly when **Ctrl + C** is pressed, without going through `stopGracefully()`. The line `SIGINT received` doesn't appear, and the small terminal writes `disconnected: transport close`. The consequences are small: when it starts again, the backend throws away the Telegram messages that piled up, sends the threshold `config` again, and reads the fan state the device reports, so that the fan still gets turned off on time (`initialMemory()`, Practice 4). The author hasn't tested how `npm run dev` behaves on macOS and Linux. A good habit: **`npm run dev`** while you change code, **`npm start`** when the backend runs to be used, for example overnight.

#### 6.11 Save to the branch

```text
cd ..
git status
```

Make sure the list of changes does **not** mention `backend/.env`. That file holds your token, and Git has ignored it since Module 16. Then:

```text
git add backend
git commit -m "grammY Telegram bot: alerts, /start, /status, graceful stop (Module 19 Practice 6)"
```

> ⬆️ **Done with Practice 6?** Go back to [Concept 10](#10-local-safety-node-1-guards-the-house-when-the-server-is-gone) before Practice 7.

### Practice 7 — Local safety on Node 1 (60 minutes)

> 🖥️ **Tools used:** **Arduino IDE** with `node-1-home.ino` from the `mini-smart-home` repository (the device path) or your Node 1 **Wokwi** project (the Wokwi path), a browser to open the curriculum files on GitHub, and **VS Code** for the backend, the simulator, and the small terminal. The Wokwi path also uses **MQTTX** with the **Public broker** connection from Module 11. Concepts used: Concept 10.
>
> ⭐ **Required** — the second pass requirement: the device keeps reacting when the broker is turned off.
>
> 🖥️ **Three paths, one firmware.** Every reader does steps 7.1–7.6 so that the firmware in your repository becomes v1.5.0. **The device path** uploads it to Node 1 (7.7), then unplugs the Pi's LAN cable (7.9). **The Wokwi path** runs it in Wokwi (7.7W), then uses the `test offline` command (7.8W). **The laptop path** (no device and no test in Wokwi) only checks the firmware with the **Verify** button in Arduino IDE (this works even without a board, as long as the esp32 package and the Node 1 libraries from Modules 10–15 are installed; if they aren't, copy the changed files into your Node 1 Wokwi project as the Wokwi path instructions below describe, then click **▶** so that Wokwi compiles it), then proves the pass requirement with the simulator in 7.10. The time `[00:00:13]` in the Serial Monitor is how long Node 1 has been running, not the wall clock.

Node 1 v1.5.0 carries out Concept 10: it receives the fan threshold from the server through `config` and saves it in NVS, enters offline mode after the broker has been gone for 2 minutes, turns the fan on by itself during offline mode, then reports through `vitals` after it reconnects. It also writes `state` in every `telemetry` (contract 1.3) and gets a new Serial command, `test offline`.

Node 1 v1.5.0 = v1.4.0 + changes in twelve files, with no new files and no new libraries:

| File | Change | How |
| :--- | :--- | :--- |
| `config.h` | version `1.5.0`, six numbers for local safety and offline mode | type (step 7.1) |
| `settings.h` / `.cpp` | the `temp_fan_on` threshold in NVS | type (step 7.2) |
| `actuators.h` / `.cpp` | the fan's owner mark | type (step 7.3) |
| `rules.h` / `.cpp` | the safety fan | type (step 7.4) |
| `networking.h` | three new functions | type (step 7.5) |
| `networking.cpp` | `config`, offline mode, the report, `state`, and `test offline` | copy it from the curriculum (step 7.5) |
| `commands.cpp`, `display.cpp`, `node-1-home.ino` | `threshold` prints two lines, the `test offline` command, `OFFLINE MODE` on the OLED, and comments | type (step 7.6) |

**The Wokwi path:** make the changes in VS Code in your repository's `firmware/node-1-home` folder, then copy the content of every changed file into the tab with the same name in your Node 1 Wokwi project (`node-1-home.ino` into the `sketch.ino` tab). **Except `config.h`:** in the Wokwi tab, just repeat the two changes of step 7.1, so that Wokwi's own `USE_WOKWI = true` doesn't get overwritten.

#### 7.1 `config.h`

1. Change its version number:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.4.0";
   ```

   to:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.5.0";
   ```

2. At the **very bottom** of the file, after the `RS485_SLOW_READ_INTERVAL` line, leave one empty line, then add:

   ```cpp
   // ---------- Module 19: local safety rule and offline mode ----------
   // The fan threshold is sent by the server with the "config" command and saved in NVS (label "temp_fan_on").
   const float DEFAULT_TEMP_FAN_ON = 30.0;             // Appendix A: "temp_fan_on"; used while NVS holds no threshold yet
   const float TEMP_FAN_MIN = 15.0;                    // a config with temp_fan_on outside 15-45 °C is refused
   const float TEMP_FAN_MAX = 45.0;
   const float FAN_HYSTERESIS = 2.0;                   // the safety fan turns off below temp_fan_on - 2 °C (hysteresis)
   const unsigned long OFFLINE_MODE_TIMEOUT = 120000;  // broker unreachable for 2 minutes without a break = offline mode
   const unsigned long OFFLINE_TEST_TIME = 180000;     // "test offline" command: the broker counts as gone for 3 minutes
   ```

   `DEFAULT_TEMP_FAN_ON` is used as long as the server has never sent a threshold. `FAN_HYSTERESIS` is the safety rule's hysteresis: with a threshold of 30 °C, the fan turns on above 30 °C and off below 28 °C, the same as the server's rule. The last two numbers are the 2 minutes before offline mode and the 3 minutes the `test offline` command lasts, in milliseconds.

#### 7.2 `settings.h` and `settings.cpp`

1. In **`settings.h`**, below the line `void saveRs485SensorEnabled(bool enabled);`, add:

   ```cpp
   float tempFanThreshold();                     // Module 19: the safety fan turns on above this number (°C)
   bool tempFanThresholdFromNvs();               // Module 19: true if it comes from NVS (sent by the server with config)
   bool saveTempFanThreshold(float degrees);     // Module 19: returns false if outside TEMP_FAN_MIN-TEMP_FAN_MAX
   ```

2. In **`settings.cpp`**, below the line `static bool useRS485 = false;`, add:

   ```cpp
   static float tempFanOn = DEFAULT_TEMP_FAN_ON;  // Module 19: the safety fan threshold, in °C
   ```

3. Still in `settings.cpp`, in the `loadSettings()` function, right below the line `useRS485 = archive.getBool("rs485", false);`, add:

   ```cpp
     tempFanOn = archive.getFloat("temp_fan_on", DEFAULT_TEMP_FAN_ON);  // Module 19
     source = "default value";
     if (tempFanThresholdFromNvs()) {
       source = "from NVS";
     }
     logInfo("temp_fan_on threshold: %.1f C (%s)", tempFanOn, source);
   ```

4. At the **very bottom** of `settings.cpp`, after the `saveRs485SensorEnabled()` function, add:

   ```cpp

   float tempFanThreshold() {
     return tempFanOn;
   }

   bool tempFanThresholdFromNvs() {
     return archive.isKey("temp_fan_on");  // 11 characters: still under the 15-character limit
   }

   bool saveTempFanThreshold(float degrees) {
     if (!(degrees >= TEMP_FAN_MIN && degrees <= TEMP_FAN_MAX)) {  // written this way so that NAN is refused too
       return false;
     }
     if (degrees == tempFanOn && tempFanThresholdFromNvs()) {
       return true;  // same number already: no need to write it again (flash can only be written so many times)
     }
     archive.putFloat("temp_fan_on", degrees);
     tempFanOn = degrees;
     logInfo("temp_fan_on threshold saved to NVS: %.1f C", tempFanOn);
     return true;
   }
   ```

The pattern is the same as the `soil_watering` threshold in Module 8: a new label, `temp_fan_on`, in the `node1` folder, this time holding a fractional number (`getFloat` and `putFloat`). `saveTempFanThreshold()` refuses numbers outside 15–45 °C, including `NAN` (not a number), and only writes to NVS if the number changes, because flash memory can only be written a limited number of times.

#### 7.3 `actuators.h` and `actuators.cpp`

1. In **`actuators.h`**, replace the line `void setFan(bool isOn);` with these two lines:

   ```cpp
   void setFan(bool isOn);                        // manual command (Serial Monitor) or from the server
   void setFanBySafety(bool isOn);                // Module 19: only for the local safety rule
   ```

   Then, below the line `bool fanOn();`, add:

   ```cpp
   bool fanBySafety();  // Module 19: true if the fan that is on was turned on by the local safety rule
   ```

2. In **`actuators.cpp`**, below the line `static bool fan = false;`, add:

   ```cpp
   static bool fanOwnedBySafety = false;  // Module 19: true if the fan was turned on by the local safety rule
   ```

3. Still in `actuators.cpp`, replace the whole `setFan()` function with these two functions:

   ```cpp
   void setFan(bool isOn) {
     fan = isOn;
     fanOwnedBySafety = false;  // Module 19: manual or server command: the fan no longer belongs to the safety rule
     writeRelay(PIN_FAN_RELAY, isOn);
   }

   void setFanBySafety(bool isOn) {
     fan = isOn;
     fanOwnedBySafety = isOn;
     writeRelay(PIN_FAN_RELAY, isOn);
   }
   ```

4. Below the `fanOn()` function, add:

   ```cpp

   bool fanBySafety() {
     return fanOwnedBySafety;
   }
   ```

This is the **"whoever turned it on turns it off"** principle in code, exactly like the note "this lamp belongs to the automation rule" (`lampOwnedByAutomation`) for the automatic lamp since Module 6. `setFanBySafety()` records that the fan was turned on by the safety rule. `setFan()`, which the Serial commands and the server's commands use, always clears that note: as soon as there's a fan command, the fan passes into the hands of whoever gave the command.

#### 7.4 `rules.h` and `rules.cpp`

1. In **`rules.h`**, replace the first line with:

   ```cpp
   // rules.h - Node 1's local automation rules: automatic watering, automatic lamp (Module 6), and safety fan (Module 19)
   ```

2. In **`rules.cpp`**, below the line `#include "actuators.h"`, add:

   ```cpp
   #include "networking.h"  // Module 19: offlineMode() and recordLocalFan()
   ```

3. Still in `rules.cpp`, right **above** the line `void runRules(SensorReading b) {`, add:

   ```cpp
   // ---------- Local safety fan (Module 19) ----------
   // Normally the server controls the fan. This safety rule only TURNS the fan ON in offline mode (broker unreachable
   // for more than 2 minutes). It also turns off a fan it turned on itself, below temp_fan_on - 2 °C, even when the
   // broker is reachable again, unless the server or you have taken that fan over with a fan command.
   static void safetyFan(SensorReading b) {
     if (isnan(b.temperature)) {
       return;  // the DHT22 couldn't be read: don't guess, leave the fan as it is
     }
     float onLimit = tempFanThreshold();
     float offLimit = onLimit - FAN_HYSTERESIS;
     if (offlineMode() && !fanOn() && b.temperature > onLimit) {
       logInfo("Local safety: temperature %.1f C above %.1f C, fan turned on.", b.temperature, onLimit);
       setFanBySafety(true);
       recordLocalFan();  // counted for the offline-mode report
     } else if (fanBySafety() && b.temperature < offLimit) {
       logInfo("Local safety: temperature %.1f C below %.1f C, fan turned off.", b.temperature, offLimit);
       setFanBySafety(false);
     }
   }

   ```

4. Inside `runRules()`, replace the comment line `// Module 19 adds the automatic fan (Appendix A: "temp_fan_on")` with:

   ```cpp
     safetyFan(b);  // Module 19 (Appendix A: "temp_fan_on")
   ```

   That comment line has been waiting since Module 6: now its place is filled.

`safetyFan()` is called for every reading, about every 2 seconds, together with automatic watering and the automatic lamp. It only **turns the fan on** in offline mode, and only if the fan is off and the temperature is **above** the threshold. It **turns the fan off** only if that fan is its own and the temperature is already below the threshold − 2, also after the broker comes back. If the DHT22 can't be read (`isnan`), the safety rule stays quiet and doesn't guess.

#### 7.5 `networking.h` and `networking.cpp`

1. At the **very bottom** of **`networking.h`**, add:

   ```cpp
   bool offlineMode();                  // Module 19: true while the broker is unreachable for more than 2 minutes
   void recordLocalFan();               // Module 19: called whenever the safety rule turns the fan on (for the report)
   void startOfflineTest();             // Module 19: Serial command "test offline"
   ```

2. **`networking.cpp`** changes in many places, so its whole content is replaced. Open [`code/firmware/node-1-home/networking.cpp`](code/firmware/node-1-home/networking.cpp) in a new browser tab, click the **Copy raw file** icon, go back to Arduino IDE (the Wokwi path: VS Code), open `networking.cpp`, press **Ctrl + A**, then paste (**Ctrl + V**). This replacement is safe: your Pi's broker address is stored in `config.h`, not in `networking.cpp`.

What's new in `networking.cpp`:

- **`doConfig()`** carries out the `config` command. Every threshold is checked first: any key other than `temp_fan_on` and `soil_watering`, a wrong type, or a number outside the range gets the whole command refused with an `ack` of `ok:false`. Only when everything is valid are the thresholds saved to NVS. The retained `config` that arrives again every time Node 1 connects is recognized by its `id` and isn't carried out twice while Node 1 is running (after a restart, the memory of `id`s is empty, so that `config` is carried out once more, without rewriting NVS; see 7.8).
- **`guardOfflineMode()`** counts how long the broker has been unreachable since the last connection, then handles entering and leaving offline mode:

  ```cpp
  // Module 19: offline mode = WiFi or broker unreachable without a break for OFFLINE_MODE_TIMEOUT, counted from the
  // last connection. During offline mode, the safety fan rule (rules.cpp) works on its own.
  static void guardOfflineMode() {
    unsigned long now = millis();
    if (mqttReady()) {
      lastReadyTime = now;
      if (offline) {
        offline = false;
        offlineEndTime = now;
        unsigned long elapsed = (now - offlineStartTime) / 1000;
        reportSeconds += elapsed;  // added up: if the vitals couldn't go out yet, the next offline mode counts too
        reportLocalFan += localFan;
        reportPending = true;  // goes with the first vitals after connecting, REPORT_DELAY later (guardMqtt)
        logInfo("OFFLINE MODE ENDED after %lu seconds: broker reachable again. Local safety turned the fan on %u time(s).", elapsed,
                localFan);
      }
      return;
    }
    if (!offline && now - lastReadyTime >= OFFLINE_MODE_TIMEOUT) {
      offline = true;
      offlineStartTime = now;
      localFan = 0;
      logError("OFFLINE MODE: broker unreachable for %lu seconds. Local safety active: fan turns on above %.1f C.",
               OFFLINE_MODE_TIMEOUT / 1000, tempFanThreshold());
    }
  }
  ```

- **The report waits 10 seconds.** The first `vitals` after offline mode carries `offline_s` and `local_fan`, but it's only sent 10 seconds after reconnecting (Concept 10):

  ```cpp
      // Module 19: after offline mode, the first vitals (the one with the report) waits REPORT_DELAY first. The server
      // usually lost the broker too and only reconnects a few seconds later. vitals is not retained, so a report
      // published before the server subscribes again would never arrive.
      bool reportWaitsForServer = reportPending && millis() - offlineEndTime < REPORT_DELAY;
      if (!reportWaitsForServer && (!vitalsSent || millis() - lastVitalsTime >= VITALS_INTERVAL)) {
        sendVitals();
      }
  ```

- **`writeState()`** writes exactly the same `state` object into the `ack` and into every `telemetry`. A change of the fan, the lamp, the pump, or the curtain angle now also triggers an immediate send, for example `Published telemetry (fan turned on)`.
- **`startOfflineTest()`** cuts the broker connection without saying goodbye (so the broker immediately publishes the `offline` last will), then holds Node 1 back from reconnecting for 3 minutes. The `restart` command ends this test early.
- **Only in Wokwi** (`USE_WOKWI`), the public broker's IP address is stored as soon as Node 1 connects. In Wokwi, looking up the address of `broker.emqx.io` through DNS after a long disconnection can take more than 5 seconds, and then the watchdog (Module 8) restarts Node 1. With the stored address, reconnecting doesn't need DNS anymore. The device path uses the Pi's IP address, so it isn't affected.
- The JSON containers are bigger: `telemetry` from 256 to 320 bytes for `state`, and `vitals` from 128 to 192 bytes to make room for the offline-mode report. The author measured the sizes on the ESP32 (Wokwi): the longest reasonable `telemetry` is 251 bytes (the worst case, with long fractional numbers, reaches 262 bytes, more than the old container's 256 bytes), and the longest `vitals` with the report is 127 bytes.

#### 7.6 `commands.cpp`, `display.cpp`, and `node-1-home.ino`

1. In **`commands.cpp`**, in the `printThreshold()` function, below the line `Serial.printf("threshold: soil_watering = %d %% (%s)\n", soilWateringThreshold(), source);`, add:

   ```cpp
     source = "default value";  // Module 19: the safety fan threshold, sent by the server with config
     if (tempFanThresholdFromNvs()) {
       source = "from NVS";
     }
     Serial.printf("threshold: temp_fan_on = %.1f C (%s); safety fan turns off below %.1f C\n", tempFanThreshold(), source,
                   tempFanThreshold() - FAN_HYSTERESIS);
   ```

2. Still in `commands.cpp`, find the line `} else if (command == "restart") {`, then insert **above it**:

   ```cpp
     } else if (command == "test offline") {
       startOfflineTest();  // Module 19: practice losing the broker for 3 minutes
       return;
   ```

3. In the command list at the very bottom, change the line `Serial.println("send, node2, node2 reset, rs485, rs485 on, rs485 off, restart");` to:

   ```cpp
       Serial.println("send, node2, node2 reset, rs485, rs485 on, rs485 off, test offline, restart");
   ```

4. In **`display.cpp`**, change the comment on the line `#include "networking.h"` to:

   ```cpp
   #include "networking.h"  // Module 10: networkText(); Module 19: offlineMode()
   ```

   Then, in the `drawStatusPage()` function, replace the line `snprintf(text, sizeof(text), "WiFi %s", networkText());` and its comment with:

   ```cpp
     if (offlineMode()) {
       snprintf(text, sizeof(text), "OFFLINE MODE");  // Module 19: broker unreachable for more than 2 minutes
     } else {
       snprintf(text, sizeof(text), "WiFi %s", networkText());  // Module 11: for example "WiFi ok, MQTT ok"
     }
   ```

5. In **`node-1-home.ino`**, replace the first line with:

   ```cpp
   // Node 1 "Home" - firmware v1.5.0 (Module 19: local safety rule and offline mode)
   ```

   Above the line `// New in v1.4.0: …`, insert:

   ```cpp
   // New in v1.5.0: Node 1 accepts the "config" command from the server (temp_fan_on and soil_watering thresholds, saved
   // in NVS). If the broker is unreachable for more than 2 minutes (offline mode), the local safety rule turns the fan on
   // by itself above temp_fan_on and off below temp_fan_on - 2 C; its report goes with the first vitals, 10 seconds after
   // reconnecting. telemetry now carries the state of all four actuators (state) and is published at once when an
   // actuator changes (data contract 1.3). The "test offline" command practices all of this without pulling a cable.
   ```

   Then, in the command list, change the line `// node2 reset, rs485, rs485 on, rs485 off, restart.` to:

   ```cpp
   // node2 reset, rs485, rs485 on, rs485 off, test offline, restart.
   ```

#### 7.7 Upload (the device path)

1. Make sure the selected board is **ESP32 Dev Module**, with **Partition Scheme** **Minimal SPIFFS** and **Flash Mode** **DIO**, and the port of the **Node 1** board. Click **Upload**. Arduino IDE writes roughly:

   ```text
   Sketch uses 1192312 bytes (60%) of program storage space. Maximum is 1966080 bytes.
   Global variables use 56572 bytes (17%) of dynamic memory, leaving 271108 bytes for local variables. Maximum is 327680 bytes.
   ```

   It's about 4.7 kilobytes larger than v1.4.0 and still far from the limit.

2. Open Node 1's Serial Monitor. Among its first lines are (**Wokwi test recording**):

   ```text
   [00:00:02] INFO  Node 1 Home - firmware 1.5.0
   [00:00:02] INFO  Last restart reason: POWERON
   [00:00:02] INFO  Boot #1. soil_watering threshold: 30 % (default value)
   [00:00:02] INFO  temp_fan_on threshold: 30.0 C (default value)
   ```

   On the real board, the number in the `Boot #…` line is of course more than 1, and the `soil_watering` threshold is your own threshold from Module 8.

Compiling fails with `'tempFanThreshold' was not declared in this scope`? The lines in `settings.h` (step 7.2) were skipped. A similar message for `setFanBySafety` or `fanBySafety` means the lines in `actuators.h` were skipped (step 7.3), and for `offlineMode`, `recordLocalFan`, or `startOfflineTest`, the lines in `networking.h` (step 7.5) or `#include "networking.h"` in `rules.cpp` (step 7.4) were skipped.

#### 7.7W The Wokwi path

There are no new libraries, so the `libraries.txt` and `diagram.json` tabs don't change. Make sure all twelve tabs hold the new version and that `config.h` in Wokwi still has `USE_WOKWI = true`, then click **▶**. The Serial Monitor writes the same first lines as in step 7.7, plus `Wokwi mode: connecting to Wokwi-GUEST without the portal, public broker broker.emqx.io.`

Remember Wokwi's habit since Module 8: NVS is empty again every time the simulation is stopped (**■**) and then started (**▶**). To imitate a power cut, type `restart`.

#### 7.8 Thresholds from the server: `config`

This step is for the device path and the Wokwi path; the laptop path goes straight to 7.10. Type `threshold` in the Serial Monitor's send box. **Expected output** (**Wokwi test recording**):

```text
threshold: soil_watering = 30 % (default value)
threshold: temp_fan_on = 30.0 C (default value); safety fan turns off below 28.0 C
```

Now send a threshold from outside.

**The device path:** move the fan rule to your Node 1. First start the backend in the first terminal (`npm run dev` in the `backend` folder; since the commit of Practice 6, that terminal has been in `mini-smart-home`, so type `cd backend` first). Then, in `/docs`, send `PUT /rules/1` with the content of the Practice 4 rule, but with both of its `device_id`s replaced by your Node 1's `device_id`, `on_above` set to **1 °C above your room temperature** (look at the OLED; round up), and `off_below` set 2 °C below that. For example, for a room at 28.6 °C: `"on_above":30,"off_below":28`. With the threshold above room temperature, the fan doesn't turn on yet as long as Node 1 is still connected. The backend log writes `config … to <device_id>: temp_fan_on 30 from rule 1 (retained)` and then `ack ok=true`, and Node 1's Serial Monitor writes `temp_fan_on threshold saved to NVS: …` and `Command c-…: config thresholds done.` (if the number is the same as the one already stored, the first line doesn't appear).

**The Wokwi path:** the backend on your laptop can't reach Wokwi, so send `config` by hand through MQTTX, with the **Public broker** connection:

1. Add a subscription to `msh/<your device_id>/#` (your simulated Node 1's `device_id` is printed in the Serial Monitor, for example `240ac45e114b`).
2. In the send box, fill in the topic `msh/<your device_id>/cmd`, choose **QoS 1**, tick **Retain** (`config` really is sent retained, contract rule 5), then send this JSON message:

   ```json
   {"id":"cfg-test-1","ts":"2026-10-20T23:22:34Z","action":"config","thresholds":{"temp_fan_on":31,"soil_watering":35}}
   ```

3. Untick **Retain** again so that the next commands don't stay stuck on the broker too.

**Expected output** in the Serial Monitor (**Wokwi test recording**):

```text
[00:00:10] INFO  temp_fan_on threshold saved to NVS: 31.0 C
[00:00:10] INFO  soil_watering threshold saved to NVS: 35 %
[00:00:10] INFO  Command cfg-test-1: config thresholds done.
```

In MQTTX, the `ack` `{"id":"cfg-test-1",…,"ok":true,"state":{…}}` arrives about a second later. Type `threshold` again: both of its lines now contain `(from NVS)`, and the safety fan turns off below `29.0 C`. Also try one mistaken `config`, without **Retain** and with a new `id` (the same `id` would be ignored): `{"id":"cfg-test-2","action":"config","thresholds":{"temp_fan_on":50}}`. Node 1 refuses it:

```text
[00:00:15] ERROR Command cfg-test-2 refused: temp_fan_on must be a number 15-45
```

Its `ack` holds `ok:false` with `"message":"temp_fan_on must be a number 15-45"`, and the stored threshold doesn't change. Finally, prove that the threshold survives a power cut: type `restart`. After it starts again, the Serial Monitor writes `temp_fan_on threshold: 31.0 C (from NVS)`, then `Command cfg-test-1: config thresholds done.` without a `saved to NVS` line: the retained `config` arrives again, but its number is the same, so NVS isn't written again.

#### 7.8W ⭐ Test the safety rule in Wokwi: `test offline`

Wokwi uses a public broker you can't turn off, so the broker is made to "disappear" with the `test offline` command. Wokwi runs slower than real time (on the author's laptop, only about 30% of real speed), so the 3 minutes of this test can take about 10 minutes of wall-clock time.

1. Type `test offline`. **Expected output** (**Wokwi test recording**, from a simulation without `restart`; after the `restart` in 7.8, the clock in Wokwi's Serial Monitor doesn't go back to zero, so the numbers on your screen are bigger):

   ```text
   test offline: broker connection cut; offline mode starts in 2 minutes, reconnecting in 3 minutes.
   [00:00:13] ERROR MQTT DISCONNECTED: connection lost (code -3). Node 1 keeps working and retries every 5 seconds.
   ```

   In MQTTX, Node 1's `status` changes to `offline` in the same second: the broker published its last will. The line `… retries every 5 seconds` is the general message every time the connection drops (Concept 10); during this test, Node 1 doesn't try to reconnect until the 3 minutes have passed.

2. Wait 2 minutes (simulation time). The Serial Monitor writes:

   ```text
   [00:02:13] ERROR OFFLINE MODE: broker unreachable for 120 seconds. Local safety active: fan turns on above 31.0 C.
   ```

   Long-press the D13 button to open the OLED status page: the `WiFi …` line now says `OFFLINE MODE`. The Wokwi simulation is slow, so hold the button down for a few seconds, until the Serial Monitor writes `Long button press: status page shown for 10 seconds.`. A press that's too short is read as a short press, and the lamp turns on (`Button: lamp on`).

3. Click the DHT22 in the circuit and slide its temperature to **33**. On the next reading:

   ```text
   [00:02:19] INFO  Local safety: temperature 33.0 C above 31.0 C, fan turned on.
   ```

   The blue `fan` LED in the circuit turns on, even though no server told it to. **That's the second pass requirement.** (The small `LED1` light on Wokwi's relay module actually goes off when the relay is working; it's the blue LED that marks the fan.)

4. Slide the temperature to **29.5**: the fan stays on (29.5 isn't below 29 yet). Slide it to **28.5**: `Local safety: temperature 28.5 C below 29.0 C, fan turned off.` Slide it to **33** again, and the fan turns on again.

5. Let it run until the test's 3 minutes are up. Node 1 reconnects by itself, then sends its report 10 seconds later (**Wokwi test recording**):

   ```text
   [00:03:13] INFO  Offline test finished: Node 1 reconnects to the broker.
   [00:03:13] INFO  MQTT connected to broker broker.emqx.io:1883 in 474 ms, as 240ac45e114b
   [00:03:13] INFO  OFFLINE MODE ENDED after 60 seconds: broker reachable again. Local safety turned the fan on 2 time(s).
   [00:03:13] INFO  Published telemetry (fan turned on)
   [00:03:19] ERROR MQTT DISCONNECTED: connection lost (code -3). Node 1 keeps working and retries every 5 seconds.
   [00:03:20] INFO  MQTT connected to broker broker.emqx.io:1883 in 473 ms, as 240ac45e114b
   [00:03:23] INFO  Offline-mode report sent with vitals: offline_s=60, local_fan=2
   ```

   Wokwi's connection to the public broker flickered at `00:03:19`, but the report was still sent 10 seconds after offline mode ended. In MQTTX, the `vitals` carrying that report arrives (**Wokwi test recording**):

   ```json
   {"ts":"2026-10-21T03:35:16Z","rssi":-85,"uptime_s":203,"heap_free":209484,"offline_s":60,"local_fan":2}
   ```

   The fan is still on, because the temperature is still 33 °C.

6. Slide the temperature to **28**: `Local safety: temperature 28.0 C below 29.0 C, fan turned off.` Node 1 is connected again, but the fan that the safety rule turned on is still turned off by the safety rule itself: whoever turned it on turns it off.

The following picture sums up this test from one of the author's Wokwi simulations: the blue fan LED (1), the OLED status page (2), the DHT22 sliders (3), and the important Serial lines (4–7).

![Local safety in Wokwi: offline mode, the fan turns on by itself. A real Wokwi screenshot of the Node 1 v1.5.0 project after the Serial command test offline, with the temp_fan_on threshold of 31.0 °C from config, and seven numbers. Left, a piece of the circuit: 1, the blue fan LED is on above the fan relay, while the yellow lamp LED is off; below are the ESP32 and the OLED module, framed with number 2. Top right, the enlarged OLED with number 2: Uptime: 00:02:26, Restart: POWERON, Boot #1, OFFLINE MODE, v1.5.0 free 207KB. Captions: 1, Fan LED on, the fan relay is driven by the local safety rule on Node 1, not the server; 2, OLED: OFFLINE MODE replaces the Wi-Fi line on the status page (button held down). Number 3, the Editing DHT22 window with the sliders Temperature 33.0°C and Humidity 71.0%; caption: DHT22 moved to 33.0 °C (click the sensor while the simulation runs), above the 31.0 °C threshold stored in NVS. Note: Wokwi uses a public broker you can't turn off, so offline mode is tried with test offline: Node 1 cuts the connection and holds back from reconnecting for 3 minutes. Bottom, Serial Monitor excerpts, in time order. 4, threshold from NVS, then test offline, cut without a goodbye: threshold: temp_fan_on = 31.0 C (from NVS); safety fan turns off below 29.0 C; test offline: broker connection cut; offline mode starts in 2 minutes, reconnecting in 3 minutes; then 00:00:14 ERROR MQTT DISCONNECTED: connection lost (code -3). Node 1 keeps working and retries every 5 seconds. 5, 2 minutes later, offline mode: 00:02:14 ERROR OFFLINE MODE: broker unreachable for 120 seconds. Local safety active: fan turns on above 31.0 C. 6, temperature 33.0 °C, fan turned on: 00:02:21 INFO temperature=33.0 C humidity=71 % light=3094 soil=70 % motion=no water_level=52 %, then 00:02:21 INFO Local safety: temperature 33.0 C above 31.0 C, fan turned on. 7, the report rides on vitals, 10 seconds after reconnecting: 00:03:25 INFO Offline-mode report sent with vitals: offline_s=60, local_fan=2.](assets/wokwi-local-safety.png)

When you're done testing, delete the `config` that's stuck on the public broker: in MQTTX, fill in the topic `msh/<your device_id>/cmd`, then choose **Clear Retained Message** (the small button with a triangle, to the right of the **Meta** button), and untick **Retain**, which got ticked along with it. Anyone can read a public broker. Node 1 keeps using its threshold from NVS.

#### 7.9 ⭐ Test the safety rule with the device: unplug the Pi's LAN cable

> ⚠️ **An honest note:** the author tested this safety rule in Wokwi (7.8W) and with the simulator (7.10), not yet with a real Node 1 and Pi. The Serial lines below are the same as in the Wokwi recording, because the code is the same; only the way the connection drops is different (see step 2).

Unplugging the Pi's LAN cable cuts off the broker for everything in the house: Node 1, the backend on the laptop, and the Node-RED dashboard. The server can't help, so Node 1 has to help itself. The Pi stays on; do **not** unplug its power, because the microSD card can get damaged (Module 12).

1. Make sure the fan rule already points at Node 1 with a threshold 1 °C above room temperature (7.8), Node 1's Serial Monitor is open, and the backend is running.
2. Unplug the LAN cable from the Pi. Within 15–30 seconds, Node 1 notices that the broker is gone and writes `MQTT DISCONNECTED: the broker did not answer in time (code -4)`, then retries every 5 seconds. The backend on the laptop also writes `broker not reachable yet, retrying in 5 seconds` over and over; that's part of this test. During the first 15–30 seconds, the Serial Monitor still writes `Published telemetry (10-second schedule)`, even though the messages never arrive. `telemetry` is sent with QoS 0 (Module 11), so "published" only means that the message has been handed to the ESP32's networking part, not necessarily that the broker received it. **Pi Zero 2 W** (no LAN socket), or a Pi that keeps the same address over Wi-Fi: stop the broker from an SSH terminal with `sudo systemctl stop mosquitto`.
3. Wait about 2 minutes from the moment Node 1 noticed, until `OFFLINE MODE: broker unreachable for 120 seconds. Local safety active: fan turns on above … C.` appears and the OLED status page says `OFFLINE MODE`.
4. Warm up the DHT22: hold the sensor in your fingers, or blow on it with a hair dryer from about 30 cm away, until its temperature passes the threshold. The fan relay goes "click", the fan spins, and the Serial Monitor writes `Local safety: temperature … C above … C, fan turned on.`
5. Plug the LAN cable back in (or `sudo systemctl start mosquitto`). Within a few seconds, Node 1 writes `MQTT connected …` and `OFFLINE MODE ENDED after … seconds …`, then 10 seconds later `Offline-mode report sent with vitals: …`. The backend log writes `WARN: <device_id> back from offline mode …`, and your Telegram receives the same `📶` message (there's an example in 7.10).
6. As the sensor cools down, the fan only turns itself off below the threshold − 2. Because your threshold is close to room temperature, the fan may stay on. Just turn it off through `/docs`: `POST /devices/{id}/command` with `{"target":"fan","value":false}`. That command also takes the fan over from the safety rule.

Finally, set the fan rule's threshold back to the number you want for everyday use, with `PUT /rules/1`.

#### 7.10 ⭐ Test the safety rule with the simulator: stop the laptop broker (the laptop path)

The Module 19 simulator runs the same safety rule as firmware v1.5.0. This time the laptop's Mosquitto broker must run in a VS Code terminal, because step 2 stops it with **Ctrl + C**. Move the broker **first**, before you set up anything else. If the simulator is still running from Practice 6, stop it first (**Ctrl + C**), because a simulator that loses the broker for more than 2 minutes during this move would already be in offline mode before the test starts. Since Module 12, your broker runs as a service, so first stop the service as in the "Viewing the log" part of Module 12 Practice 7: on Windows, `net stop mosquitto` in **Terminal (Admin)**; on macOS, `brew services stop mosquitto`; on Linux, `sudo systemctl stop mosquitto`. Two brokers can't use port 1883 at the same time. Then open a new terminal in VS Code, type `cd edge`, then `mosquitto -v -c mosquitto-lan.conf` (the `edge` folder in `mini-smart-home` has held `mosquitto-lan.conf` since Module 11). If your laptop broker is already running in a VS Code terminal anyway, just use that terminal. Leave this broker terminal running until the Practice 8 dress rehearsal is over; at the end of 8.4 you start the service again. Once the broker in the terminal is running, set up the rest as in Practice 6: the backend in the first terminal (`npm run dev` in the `backend` folder; type `cd backend` first if that terminal is still in `mini-smart-home`), the simulator for one device, and the small terminal following `f00d00000001`.

1. In the simulator's terminal, type **`temp 29`**. The temperature stays below the 30 °C threshold, so no fan turns on before the test, and the number doesn't keep changing as it does with `temp random`.
2. **Stop the broker**: press **Ctrl + C** in the Mosquitto terminal. **Expected output** in the simulator's terminal:

   ```text
   f00d00000001: broker unreachable, retrying every 5 seconds
   ```

   The backend log writes this pair of lines every 5 seconds (**example**; before them there may be one `ERROR: MQTT error: read ECONNRESET` line, depending on how the broker stopped):

   ```text
   [10:28:53] WARN: broker not reachable yet, retrying in 5 seconds
   [10:28:53] ERROR: MQTT error: connect ECONNREFUSED 127.0.0.1:1883
   ```

   The small terminal stays silent: the backend doesn't hear the simulator's `offline` last will, because that will disappeared together with the broker that was stopped.

3. **Wait 2 minutes.** The simulator's terminal writes:

   ```text
   f00d00000001: OFFLINE MODE: broker unreachable for 2 minutes; local safety turns the fan on above 30 °C
   ```

4. Type **`temp 33`**. **Expected output:**

   ```text
   Temperature: 33.0 °C
   f00d00000001: local safety: temperature 33.0 °C, fan turned on
   ```

   The broker is off and the backend can't be reached, but the fan turns on. **That's the second pass requirement.**

5. **Start the broker again** with the same command (`mosquitto -v -c mosquitto-lan.conf`), then do step 6 **less than 2 minutes** later (the reason is below). **Expected output** in the simulator's terminal (**example**; the length of offline mode and the command `id` on your screen are different):

   ```text
   f00d00000001: OFFLINE MODE ENDED after 51 seconds; local safety turned the fan on 1 time(s)
   f00d00000001: online
   f00d00000001: thresholds same as the stored ones {"temp_fan_on":30,"soil_watering":30}
   f00d00000001: command c-20261021-033139-6 -> ok=true
   f00d00000001: offline-mode report sent with vitals (offline_s=51, local_fan=1)
   ```

   The last line appears 10 seconds after `online`. The backend log (**example**):

   ```text
   [10:31:39] INFO: connected to broker mqtt://127.0.0.1:1883
   [10:31:39] INFO: config c-20261021-033139-6 to f00d00000001: temp_fan_on 30 from rule 1 (retained)
   [10:31:39] INFO: config c-20261021-033139-6 to f00d00000001: ack ok=true
   [10:31:44] INFO: rule 1 (Automatic fan): temperature 33 above 30; fan turned on if it lasts 120 seconds
   [10:31:49] WARN: f00d00000001 back from offline mode after 51 seconds; local safety turned the fan on 1 time(s)
   [10:31:49] INFO: Telegram sent: 📶 f00d00000001 back from offline mode after 51 seconds; local safety turned the fan on 1 time(s)
   ```

   - As soon as it's connected, the backend publishes the retained `config` again, because the laptop broker that was just started has forgotten every retained message (contract rule 10). The simulator answers `thresholds same as the stored ones`: its threshold is still safe in its "NVS".
   - The fan rule on the server starts counting 120 seconds from the first 33 °C reading. That's why you do step 6 **less than 2 minutes** after the broker starts. If you're late, the server rule sends `fan = true` as well, the fan passes into the server's hands, and in step 6 it's the server rule that turns it off (`✅ Temperature down to 27 °C — fan turned off`), not the local safety rule.
   - The offline-mode report goes into the event log, shows up in the small terminal as `event: f00d00000001 back from offline mode after 51 seconds; local safety turned the fan on 1 time(s)`, and reaches your Telegram.

6. Type **`temp 27`**. **Expected output:**

   ```text
   Temperature: 27.0 °C
   f00d00000001: local safety: temperature 27.0 °C, fan turned off
   ```

   The simulator is connected again, but the fan that belongs to the safety rule is still turned off by the safety rule itself, and the backend log only writes `rule 1 (Automatic fan): count restarted (temperature 27)`.

The contract 1.3 checker can check that report too, and the 8.4 dress rehearsal uses it. A checker that was already running stops along with the broker, so start the checker as soon as the broker is running again (step 5), in a new terminal: `cd tools`, then `node contract-checker.js 127.0.0.1 f00d00000001`. Don't use the simulator's terminal (which is also in the `tools` folder), because the simulator reads everything you type as a temperature command. The report is only published about 10 seconds after the simulator connects, so there's still time. The `vitals` with the report gets the stamp `msh/f00d00000001/vitals  PASS  (offline-mode report: 51 seconds, fan on 1 time(s))`.

#### 7.11 Its trail in the database

The offline-mode report is stored in the event log with the kind `offline-report`. (The Wokwi path: the backend on the laptop doesn't hear the public broker, so this query still answers `(0 rows)` until you do the simulator test in the Practice 8 dress rehearsal.) In psql:

```sql
SELECT to_char(occurred_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS time_wib, device_id, source, data
FROM events WHERE kind = 'offline-report' ORDER BY occurred_at DESC LIMIT 1;
```

**Expected output** (**example**):

```text
 time_wib |  device_id   | source |               data                
----------+--------------+--------+-----------------------------------
 10:31:49 | f00d00000001 | device | {"local_fan": 1, "offline_s": 51}
(1 row)
```

The `source` column holds `device`: the decision to turn the fan on during offline mode was made by Node 1 itself, not by the server. The `data` column stores both numbers of the report as they are, so that a dashboard can later count how long and how often your house "stood guard by itself".

#### 7.12 Save to the branch

Before saving, make sure all twelve files in your repository's `firmware/node-1-home` folder hold the new version (if you use Wokwi: not just its Wokwi tabs). The first terminal may still be running the backend (7.8 or 7.10), so open a new terminal (**Terminal → New Terminal**), which starts right in the `mini-smart-home` folder, then type:

```text
git add firmware
git commit -m "Node 1 firmware v1.5.0: config in NVS, offline mode, fan safety, report in vitals (Module 19 Practice 7)"
```

Firmware v1.5.0 is now saved on the `feature/automation` branch; step 8.5 pushes everything to GitHub.

> ➡️ **Done with Practice 7?** Continue to [Practice 8 — The pass test, and save to the branch](#practice-8--the-pass-test-and-save-to-the-branch-30-minutes) without going back to the concepts.

### Practice 8 — The pass test, and save to the branch (30 minutes)

> 🖥️ **Tools used:** **VS Code** (the backend, the simulator, the small terminal, and the broker terminal), **Bruno**, a browser for **`/docs`**, and **Telegram**. The device path uses Node 1 v1.5.0 and the Pi, as in Practice 7.
>
> ⭐ **Required** — a dress rehearsal of all three Module 19 pass requirements in one go.

You've built every part one by one. This practice gives the backend its version number, adds Bruno requests for the new routes, then tests the three pass requirements in a row, like an inspector who comes to check your house.

#### 8.1 Backend v0.4.0

Stop `npm run dev` if it's still running (**Ctrl + C**), then make sure the first terminal is in the `backend` folder. Its command line must end with `backend>` (macOS: `backend %`); if it still says `mini-smart-home`, type `cd backend` first. Then run:

```text
npm version 0.4.0 --no-git-tag-version
```

**Expected output:**

```text
v0.4.0
```

`npm version` changes the version number in both `package.json` and `package-lock.json` at once. The `--no-git-tag-version` option stops it from making a Git commit and tag by itself; you save it with `git commit` in step 8.5. Then update the three places that mention the old version:

1. In **`backend/package.json`**, replace the `"description"` line with:

   ```json
     "description": "Mini Smart Home backend (Modules 16-19): listens to MQTT, checks the data contract, stores every message in a time-series database, and provides a history API, realtime data, commands, automation rules, schedules, and Telegram notifications",
   ```

2. In **`backend/src/server.ts`**, replace the first line with these two lines:

   ```ts
   // server.ts - the entry point of the Mini Smart Home backend v0.4 (Module 19: realtime data, a single door for commands,
   // automation rules, schedules, and Telegram notifications).
   ```

3. Still in `server.ts`, replace the line `openapi: { info: … "Backend v0.3 (Module 18)", version: "0.3.0" } },` with:

   ```ts
     openapi: { info: { title: "Mini Smart Home API", description: "Backend v0.4 (Module 19)", version: "0.4.0" } },
   ```

Start the backend again (`npm run dev`), then open `http://127.0.0.1:8080/docs`. The page's title now mentions `0.4.0` and `Backend v0.4 (Module 19)`, and the list of routes has grown: `/devices/{id}/state`, `/rules`, `/rules/{id}`, and `/rules/{id}/run`.

#### 8.2 Four Bruno requests

Open the `backend/bruno` collection in Bruno, choose the **`local`** environment, then create four requests with **Clone Request** (right-click the tab of an old request → **Clone Request** → fill in **Request Name** → **Clone**). The device path uses your Node 1's `device_id`; the laptop path and the Wokwi path use `f00d00000001`.

| New request | Cloned from | Change it to |
| :--- | :--- | :--- |
| `rule list` | `device list` | URL `{{baseUrl}}/rules` |
| `change fan threshold` | `lamp on` | method **PUT**, URL `{{baseUrl}}/rules/1`, and fill the **Body** tab with the JSON of the Practice 4 fan rule (threshold 30/28) |
| `run watering schedule` | `rule list` | method **POST**, URL `{{baseUrl}}/rules/2/run`, no body |
| `Node 1 actuator state` | `Node 1 latest reading` | URL `{{baseUrl}}/devices/<your device_id>/state` |

Every **Assert** tab is copied along: `res.status` `eq` `200`. Save each request (**Ctrl + S**), then click **Send** one at a time. The **Tests** tab in the answer panel holds `Assertions (1), Passed: 1, Failed: 0`. Be careful with `run watering schedule`: that request really turns the pump on for 10 seconds and sends a Telegram message.

#### 8.3 Automatic checks

Open a new terminal (**Terminal → New Terminal**), go into the `backend` folder with `cd backend`, then run these two commands. Don't use the second terminal, because the simulator running there reads every line you type as a temperature command.

```text
npm run check
npm test
```

`npm run check` finishes without an error message, and the `npm test` summary contains **`Tests  11 passed (11)`**. Then open one more new terminal, go into the `tools` folder (`cd tools`), and run the contract 1.3 checker while the simulator or Node 1 is running (your broker's address; the laptop path: `127.0.0.1`), for example `node contract-checker.js 127.0.0.1 f00d00000001`. Every `telemetry`, `vitals`, `cmd`, and `ack` must get the `PASS` stamp. Leave the checker running during the dress rehearsal below. When the broker is stopped in requirement 2, the checker stops too; start it again as soon as the broker is running, so that the `vitals` with the report gets checked as well (7.10).

#### 8.4 ⭐ A dress rehearsal of the three pass requirements

Set everything up as in Practice 7.10: the broker, the backend (`npm run dev`), the simulator for one device, and the small terminal following `f00d00000001`. **The device path:** use Node 1 v1.5.0 with the fan rule pointing at Node 1. Room temperature is hard to control, so for requirement 1 it's the threshold that moves: first about 2 °C **above** your room temperature (the fan stays still), then about 2 °C **below** it (the fan turns on 2 minutes later); to turn it off, raise the threshold again until even `off_below` is above room temperature (for example, `on_above` 4 °C and `off_below` 2 °C above room temperature). Requirement 2 is done as in Practice 7.9. The **Expected output** boxes below come from one and the same dress rehearsal on the author's laptop, with the simulator and the mock Telegram server.

**Requirement 1 — the threshold is changed through the API, the fan follows, without a restart.**

1. Send `PUT /rules/1` with `"on_above":32,"off_below":30` (through `/docs`, or by changing the content of the Bruno request `change fan threshold` for a moment).
2. In the simulator's terminal, type **`temp 31`**. Wait **more than 2 minutes**: 31 °C isn't above 32, so the fan stays off.
3. Send `PUT /rules/1` again with `"on_above":30,"off_below":28`. The server is **not** restarted. About 2 minutes later, the fan turns on. **Expected output** in the backend log (**example**, the important lines):

   ```text
   [10:23:46] INFO: Rule 1 (Automatic fan) changed through the API: fan f00d00000001 on when temperature f00d00000001 is above 32 for 120 seconds, off below 30
   [10:23:46] INFO: config c-20261021-032346-2 to f00d00000001: temp_fan_on 32 from rule 1 (retained)
   [10:26:02] INFO: Rule 1 (Automatic fan) changed through the API: fan f00d00000001 on when temperature f00d00000001 is above 30 for 120 seconds, off below 28
   [10:26:02] INFO: config c-20261021-032602-3 to f00d00000001: temp_fan_on 30 from rule 1 (retained)
   [10:26:09] INFO: rule 1 (Automatic fan): temperature 31 above 30; fan turned on if it lasts 120 seconds
   [10:28:10] INFO: command c-20261021-032810-4 (rule) to f00d00000001: fan = true, ack ok=true in 6 ms
   [10:28:10] INFO: rule 1 (Automatic fan): 🌡️ Temperature 31 °C — fan turned on automatically
   [10:28:10] INFO: Telegram sent 0.2 seconds after reading 2026-10-21T03:28:10Z: 🌡️ Temperature 31 °C — fan turned on automatically
   ```

   While the threshold is 32, there isn't a single line about the fan. As soon as the threshold drops to 30, the next 31 °C reading starts the count, and exactly 2 minutes later the fan turns on. Every threshold change is also sent to the device as `config` (`temp_fan_on 32`, then `30`), so that its local safety rule uses the same number as the server.

**Requirement 3 — Telegram within 10 seconds.** The last line above is also the proof: `Telegram sent 0.2 seconds after reading …`, and your phone receives `🌡️ Temperature 31 °C — fan turned on automatically`.

4. Type **`temp 27`**. The fan is turned off, and your Telegram receives `✅ Temperature down to 27 °C — fan turned off` (in this dress rehearsal, 0.3 seconds after the reading).

**Requirement 2 — the device keeps reacting when the broker is turned off.** Do Practice 7.10 steps 1–6: `temp 29`, stop the broker, wait for offline mode, `temp 33`, start the broker, then `temp 27`. The example outputs in 7.10 come from the same dress rehearsal, so their times continue from the block above. This time, before typing `temp 27` (step 6), first send the Bruno request `Node 1 actuator state` (the laptop path and the Wokwi path: with `f00d00000001`). Do both within 2 minutes after the broker starts; the reason is in 7.10 step 5. **Expected output** (**example**, tidied up):

```json
{
  "device_id": "f00d00000001",
  "desired": { "fan": false },
  "reported": { "fan": true, "lamp": false, "pump": false, "curtain": 90 },
  "reported_at": "2026-10-21T03:31:54.470Z",
  "diff": ["fan"]
}
```

The server last wanted the fan **off** (the rule's command in step 4 of this dress rehearsal, when you typed `temp 27` after requirement 1), while the simulator reports the fan **on**, because its local safety rule turned it on. There's a difference, but the server does **not** send the `fan = false` command again: its wish was already fulfilled once, so any change after that counts as another brain's decision (Concept 4). If the server fought back, the fan would be turned off even though the temperature is 33 °C. After `temp 27`, the safety rule turns its own fan off, and the same request answers `"diff": []`.

All three pass requirements are proven. Write in your notes (➕ D): the "seconds after reading" number from requirement 3, and `offline_s` and `local_fan` from the offline-mode report. **The laptop path and the Wokwi path:** the dress rehearsal is over, so stop the broker in the VS Code terminal (**Ctrl + C**) and start its service again: `net start mosquitto` in **Terminal (Admin)** (Windows), `brew services start mosquitto` (macOS), or `sudo systemctl start mosquitto` (Linux).

#### 8.5 Save to the branch and push to GitHub

In the terminal where you ran `npm test` in 8.3 (the `backend` folder; the backend in the first terminal may keep running), type:

```text
cd ..
git add backend
git status
git commit -m "Backend v0.4.0 and Bruno requests for rules, schedules, and the actuator state (Module 19 Practice 8)"
git push -u origin feature/automation
```

In the `Changes to be committed` part, `git status` names `backend/package.json`, `backend/package-lock.json`, `backend/src/server.ts`, and four new files in `backend/bruno/`. Make sure `.env` is **not** on that list. This is the first push of the `feature/automation` branch: `-u` records the branch on GitHub as the partner of your local branch, so after this, `git push` is enough.

> ➡️ **Done with Practice 8?** Do Level 1 of the [🧩 Independent Challenges](#-independent-challenges), then steps A–C of the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home): there, all the Module 19 work is merged into `main` through a pull request. Levels 2 and 3 come after that, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title of the problem that looks most like yours.

<details>
<summary><b>The small terminal keeps writing <code>can't connect yet: xhr poll error</code>, or shows no readings</b></summary>

- **`xhr poll error` over and over** means that Socket.IO's first HTTP request isn't being answered. The backend isn't running yet, is restarting, or the address is wrong. The small terminal's address must be the same as the address of `/docs`, for example `http://127.0.0.1:8080`, not the broker's address.
- **`refused by the server: device_id must be 12 lowercase hexadecimal digits`**: the `device_id` in the `node live-terminal.js …` command has a typo. Copy it from `GET /devices`.
- **Connected and following, but no readings**: that device hasn't sent any `telemetry` since the backend started (the simulator is off, or Node 1 isn't connected to the broker yet), or the backend rejects it. Look at the backend log: a `REJECTED msh/…` line gives the reason. Firmware v1.4.0 and the old simulator are still accepted, but their `state` is empty.
- **Every small terminal receives the readings of all devices**: the backend still uses the Quick Win broadcast (`io.emit` to every client). Replace `realtime.ts` with the Practice 1 version.

</details>

<details>
<summary><b><code>npm test</code> fails, or isn't found</b></summary>

- `npm error Missing script: "test"` means that the `"test": "vitest run"` script hasn't been added to `backend/package.json` yet (Practice 3.1). Watch the comma at the end of the line before it.
- A test is marked `×`: read the `AssertionError` line below it. `expected null to be 'turn-on'` means that the function answered `null` (it didn't decide anything), while the test expected `"turn-on"`. Compare the part under test in `engine.ts` with the code of Practice 3.3, especially the signs `>`, `>=`, `<`, and `<=`.
- `npm run check` writes `error TS2307: Cannot find module 'vitest' or its corresponding type declarations.` (or `'grammy'`, `'node-cron'`, `'socket.io'`): `npm run check` checks every file in `src`, including the test files, so every package they use must already be installed. Run the `npm install` command of the practice that installs that package again.

</details>

<details>
<summary><b>The backend log says <code>automation rules couldn't be loaded yet: column "updated_at" does not exist</code></b></summary>

Migration `007_rules_and_events.sql` hasn't been run on the database yet. The backend keeps running, but without rules. Stop the backend, run `npm run migrate` in the `backend` folder (its answer is `1 new migration(s) applied, 5 applied earlier.`), then start the backend again (Practice 4).

</details>

<details>
<summary><b><code>POST /rules</code>, <code>PUT /rules/…</code>, or <code>POST /rules/{id}/run</code> is rejected</b></summary>

- **`400`** always names the wrong field. The most common ones: `off_below` isn't smaller than `on_above`, a fan rule's threshold is outside 15–45 °C, a cron expression doesn't have 5 fields, or a field name has a typo. For the last one, Zod writes two things at once: the right field counts as empty, and the misspelled field isn't known. For example, if `on_above` is written as `onabove`, the message is `body/condition/on_above Invalid input: expected number, received undefined, body/condition Unrecognized key: "onabove"`. If more than one field is unknown, it says `Unrecognized keys: …` instead. What matters is that the field inside the double quotes isn't known.
- **`409` with `rule 1 is not a schedule rule`**: `POST /rules/{id}/run` is only for active schedule rules. The fan rule runs by itself, from the readings.
- **`415 Unsupported Media Type`** or **`400 FST_ERR_CTP_EMPTY_JSON_BODY`** when you call `POST /rules/{id}/run` from PowerShell (`Invoke-WebRequest` or `Invoke-RestMethod`): this route doesn't need a body, while PowerShell sends a `content-type` header that doesn't fit. Use **`/docs`** or Bruno (with the **Body** tab left at **No Body**); both get `200`.

</details>

<details>
<summary><b>A rule I changed in DBeaver doesn't take effect, or the log says <code>rule … skipped</code></b></summary>

The backend reads the `rules` table when it starts and every time a rule is changed **through the API**. A change made directly in the database (DBeaver, psql) is only read when the backend restarts or when another rule is changed through the API (at that moment all the rules are reloaded), and its `config` is only published to the device at that moment, not when you save in DBeaver. If the content of a row isn't valid according to the Zod schema, the backend skips it with the line `WARN: rule … skipped: …` and keeps using the other rules. Change rules through `PUT /rules/{id}` so that everything takes effect right away.

</details>

<details>
<summary><b>The server rule doesn't turn the fan on, even though the temperature is above the threshold</b></summary>

Check the backend log from top to bottom:

1. Is there a line `rule 1 (…): temperature … above …; fan turned on if it lasts 120 seconds`? If there isn't, the rule isn't active, the `device_id` in the rule is different from your device's, or the temperature isn't **above** the threshold: exactly 30.0 with a threshold of 30 doesn't count yet.
2. Is there a `count restarted`? One reading below the threshold, a `null` reading (the DHT22 failed), or a gap of more than 60 seconds between two readings restarts the 120-second count from zero. A reading whose `ts` is more than 60 seconds older than the laptop's clock isn't evaluated at all, without any log line: it's late data, or the laptop's clock is more than a minute ahead of Node 1's clock. If Node 1 never triggers the rule while the simulator can, make sure the laptop's clock is set automatically from the internet (turn on **Set time automatically** in the laptop's date and time settings, as in Module 11's 🚨).
3. Is there a `fan can't be turned on: …`? The command wasn't sent, and the reason is written there, for example the device is `offline` or the backend isn't connected to the broker. The next reading tries again.

</details>

<details>
<summary><b>The watering schedule doesn't run at 06:00</b></summary>

- **The laptop was asleep or the backend was off at that time.** node-cron 4 doesn't replay a missed schedule. If a sleeping laptop wakes up no more than 15 minutes later, the schedule still runs; if it's later than that, the log and the event log record `⏰ Schedule … missed (laptop asleep or backend busy?)`. If the backend was off (not running) at that time, nothing is recorded at all, and a backend started later simply waits for the next scheduled time. That's a limit of a backend on a laptop; Modules 26–27 move it to a server that's always on.
- **`next_run` in `GET /rules` shows a strange time.** That field is written in UTC: `2026-10-21T23:00:00Z` is 06:00 WIB on the 22nd. The backend log writes it in WIB.
- **An example from the internet doesn't work.** Many tutorials still use node-cron 3. Options like `scheduled` and `runOnInit` don't exist in version 4.6.0, and the `@types/node-cron` package is only for version 3: don't install it.

</details>

<details>
<summary><b>The Telegram bot stays silent, or answers <code>Sorry, this bot only serves its owner.</code></b></summary>

- **The log never says `Telegram bot @… ready`.** If it says `Telegram notifications off: TELEGRAM_BOT_TOKEN is empty`, the token hasn't been written in `.env` yet (or `.env` hasn't been saved). If it says `Telegram bot stopped: Call to 'getMe' failed! (401: Unauthorized)`, the token is wrong: copy it from @BotFather again, without spaces and without quotation marks. If neither line is there, the laptop may not be connected to the internet yet: grammY keeps trying to reach Telegram without writing anything in the log, and the `ready` line only appears once the internet is connected.
- **The log says `ready`, but the bot doesn't reply.** Messages sent while the backend was off are thrown away as soon as the backend starts, so send `/start` once more. If the laptop's internet is down, grammY retries every 3 seconds **without writing anything** in the log; check the connection. To see those failed attempts, run the backend with the environment variable `DEBUG=grammy:error` (PowerShell: `$env:DEBUG="grammy:error"; npm run dev`; macOS: `DEBUG=grammy:error npm run dev`).
- **`/status` is answered with `Sorry, this bot only serves its owner.`** `TELEGRAM_CHAT_ID` in `.env` is empty, has a wrong number, or hasn't been saved yet (the backend hasn't restarted). You might also be sending from another Telegram account or from a group: a group's `chat_id` is different and usually negative. Send `/start` from the chat you want to use, then copy its number exactly.
- **The log says `Telegram bot stopped: … (409: Conflict …)`.** Two long-polling programs use the same token, for example a backend on another laptop or a copy of the backend with a different `PORT`. (A second backend with the same `.env` on the same laptop usually stops right away with `EADDRINUSE`, because its port is already taken, before it gets the chance to reach Telegram.) One token may only be used by one long-polling program. Stop one of them, then restart the one that's left.
- **The alert was sent (the log says `Telegram sent …`), but the phone notification is late.** The phone's battery saver can delay notifications. The message is already in the chat as soon as you open Telegram.

</details>

<details>
<summary><b>The bot token was already committed, sent to a group, or seen in a screenshot</b></summary>

Treat that token as leaked. Open @BotFather, send `/token`, choose your bot, then write the new token in `backend/.env`. Removing the file in the next commit isn't enough, because the Git history and other people's copies still hold it. Also make sure `.env` is listed in the `.gitignore` of the `backend` folder (since Module 16) so that this doesn't happen again.

</details>

<details>
<summary><b>Windows: <code>npm run dev</code> restarts by itself, stops suddenly, or asks <code>Terminate batch job (Y/N)?</code></b></summary>

- **`Change detected in '…node_modules…'` and then `Restarting 'src/server.ts'`, even though you didn't save anything.** Windows records "when a file was last read" (the last access time), which can make `node --watch` think that a file has changed, for example just after the backend starts or when another program reads the files in `src`. Nothing is broken, but everything that's kept only in memory is lost: the desired state, the "for" counts, and the rules' memory. If it bothers you, run the backend with `npm start`.
- **Ctrl + C doesn't write `SIGINT received`.** On Windows, `npm run dev` kills the backend instantly, without the graceful-stop path. That's normal; use `npm start` if you want a graceful stop (Practice 6.10).
- **`Terminate batch job (Y/N)?`** appears when npm is run from Command Prompt (`cmd.exe`). Type `Y`, then press **Enter**. VS Code's default terminal on Windows is PowerShell, which doesn't ask.

</details>

<details>
<summary><b>Firmware v1.5.0 doesn't compile</b></summary>

The message `'…' was not declared in this scope` points to the step that was skipped:

| Name in the error message | Check |
| :--- | :--- |
| `DEFAULT_TEMP_FAN_ON`, `FAN_HYSTERESIS`, `OFFLINE_MODE_TIMEOUT`, `OFFLINE_TEST_TIME` | the Module 19 block in `config.h` (7.1) |
| `tempFanThreshold`, `tempFanThresholdFromNvs`, `saveTempFanThreshold` | `settings.h` (7.2) |
| `setFanBySafety`, `fanBySafety` | `actuators.h` (7.3) |
| `offlineMode`, `recordLocalFan`, `startOfflineTest` | `networking.h` (7.5), then `#include "networking.h"` in `rules.cpp` (7.4) |
| `tempFanOn` | the variable at the top of `settings.cpp` (7.2 step 2) |
| `fanOwnedBySafety` | the variable at the top of `actuators.cpp` (7.3 step 2) |

If the error points at `networking.cpp`, copy that file again with **Copy raw file** (7.5). Its content must be complete, from the first line to the last.

</details>

<details>
<summary><b>Wokwi: the Library Manager says <code>Error loading library index :-(</code></b></summary>

Wokwi's library list is downloaded from the address `libraries.wokwi.workers.dev`. When this module was tested, the author's internet provider's DNS blocked that address, so the library search failed. Firmware v1.5.0 needs no new libraries, so your Node 1 project keeps working. If you create a new project, create a **`libraries.txt`** file through **▾ → New file...**, then fill it with the list from this module's [`code/firmware/node-1-home/libraries.txt`](code/firmware/node-1-home/libraries.txt), which is the same as in Module 15 (you can also copy the `libraries.txt` of your old Node 1 project). Wokwi reads that file and installs the libraries as usual. The Node 1 circuit for that new project is in [`diagram.json`](code/firmware/node-1-home/diagram.json) in the same folder: copy its content into your new project's `diagram.json` tab.

</details>

<details>
<summary><b>Wokwi: <code>test offline</code> takes very long, or the threshold goes back to 30</b></summary>

- **It takes very long.** The Wokwi simulation runs slower than real time (on the author's laptop, only about 30% of real speed). The clock in the Serial Monitor is simulation time: 2 minutes of offline mode can take 6–7 minutes of wall-clock time, and the whole `test offline` about 10 minutes. Keep the Wokwi tab in front; the browser slows down hidden tabs.
- **`test offline` stops before 3 minutes.** The `restart` command (or the EN button) ends it.
- **The threshold is back to `30.0 C (default value)`.** Wokwi's NVS is empty again every time the simulation is stopped (**■**) and then started (**▶**). Send `config` again through MQTTX, and use `restart` to imitate a power cut.
- **`MQTT DISCONNECTED … (code -3)` now and then, and then it connects again.** In Wokwi, the connection to the public broker does flicker sometimes. Flickers like these don't trigger offline mode, because that mode only starts after 2 minutes of being disconnected without a break.
- **After `test offline`, Node 1 never connects again.** The Serial Monitor writes `MQTT failed to connect to the broker after … ms: could not connect to the broker (code -2)` once, then goes quiet, and offline mode never ends. In Wokwi, Node 1 stores the public broker's IP address when it first connects so that it doesn't have to look it up again, and once in a while that address stops answering. Type `restart` (the threshold in NVS stays saved), then repeat `test offline`.
- **The Serial Monitor writes `Offline-mode report sent …`, but the report doesn't show up in MQTTX.** If the connection to the public broker flickers right after the report is published, that `vitals` gets lost on the way, because QoS 0 isn't sent again. Repeat `test offline`.

</details>

<details>
<summary><b>The local safety rule doesn't turn the fan on in offline mode</b></summary>

- **It isn't in offline mode yet.** The `OFFLINE MODE: …` line only appears 2 minutes after Node 1 **notices** that the broker is gone. With the cable unplugged, Node 1 only notices 15–30 seconds later, so wait about 2.5 minutes.
- **The laptop path: the broker isn't really off.** If `mosquitto -v -c mosquitto-lan.conf` in 7.10 stops right away with `Error: Only one usage of each socket address …` (macOS and Linux: `Error: Address already in use`), the Mosquitto service from Module 12 is still running. As a result, **Ctrl + C** in step 2 doesn't stop anything, and the simulator stays connected. First stop the service as in 7.10, run `mosquitto -v -c mosquitto-lan.conf` again in that terminal, then start again from step 1.
- **The temperature isn't above the threshold.** The safety rule uses the threshold from NVS, not the number in the server's current rule, if the last `config` never arrived. Type `threshold` to see the number.
- **The fan was already on before the broker disappeared**, for example turned on by the server or by a Serial command. That fan doesn't belong to the safety rule, so the safety rule doesn't touch it.
- **The DHT22 can't be read.** The safety rule stays quiet on purpose when the temperature can't be read, rather than guessing.

</details>

<details>
<summary><b>The fan the local safety rule turned on doesn't turn off after the broker comes back</b></summary>

The safety rule only turns its own fan off below **the threshold − 2**, for example below 28 °C for a threshold of 30 °C. If the threshold is close to room temperature, the room may never get that cool. Turn it off with `POST /devices/{id}/command` and `{"target":"fan","value":false}`; that command also takes the fan over from the safety rule. The server doesn't turn it off by itself either, because a wish of the server that was already fulfilled isn't forced again (Concept 4).

</details>

<details>
<summary><b>Node 1 is connected again, but the backend doesn't record the offline-mode report</b></summary>

- **Wait 10 seconds.** The report is sent 10 seconds after reconnecting, on purpose (Concept 10).
- **The backend connected more than 10 seconds after the device**, for example because the backend was only started later. `vitals` isn't retained, so a report published before the backend subscribes never arrives. That report isn't sent again.
- **The device restarted before it got to report.** The report is only kept in memory, so it's lost too.
- **An old version of the simulator** sends its report instantly, before the backend has had time to subscribe. Copy `tools/device-simulator.js` from the curriculum again (Practice 2.1).
- To see whether the report is published, run the contract 1.3 checker **as soon as** the broker is running again, or subscribe to `msh/<device_id>/vitals` in MQTTX. The report is only published about 10 seconds after the device connects, so there's still time. A checker started while the broker is still off stops right away with the message `Can't connect to broker …`. In Wokwi, the public broker never goes off, so the checker may run from before `test offline`.

</details>

<details>
<summary><b>The device rejects <code>config</code> (<code>ok:false</code>), again every time it starts</b></summary>

The refusal message names the cause: `temp_fan_on must be a number 15-45`, `soil_watering must be a whole number 0-100`, `unknown threshold: …`, or `thresholds must contain temp_fan_on or soil_watering`. Numbers must be written as numbers, not as text: `"temp_fan_on":30`, not `"temp_fan_on":"30"`. Because `config` is sent retained, a wrong `config` is refused again **every time** the device connects. Send a correct `config` to the same topic (the new retained message replaces the old one), or delete it with **Clear Retained Message** in MQTTX. The backend publishes the correct `config` again every time it connects to the broker and every time a rule is changed.

</details>

<details>
<summary><b>The backend log says <code>ack c-… arrived, but no command is waiting for it</code></b></summary>

That's normal. A device that has just connected receives the retained `config` from the broker again and answers it, even though the backend stopped waiting for that answer long ago. The same line also appears when you send a command through MQTTX, because the backend doesn't wait for an `ack` of a command that isn't its own.

</details>

## 🔬 Technical Deep Dive (optional)

This section is for the curious. Nothing here is required, and the next modules don't depend on it.

<details>
<summary><b>Socket.IO, plain WebSocket, and SSE</b></summary>

Socket.IO isn't the only way to stream data from the server to the screen. Two other options you'll often come across are plain WebSocket and SSE (Server-Sent Events):

| | Socket.IO 4.8.4 (this module) | Plain WebSocket (`@fastify/websocket` 11.3.4) | SSE (`@fastify/sse` 0.6.1) |
| :--- | :--- | :--- | :--- |
| Direction | Two-way | Two-way | One-way: server → browser |
| Runs on top of | Its own protocol, on top of WebSocket or HTTP long polling | WebSocket as it is | Ordinary HTTP (`text/event-stream`) |
| Reconnecting | Automatic | Build it yourself | Automatic, by `EventSource` in the browser |
| Rooms and broadcasts | Built in (`join`, `to`) | Build it yourself | Build it yourself |
| Answers (acknowledgements) | Built in (`emitWithAck`) | Build it yourself | None, because it's one-way |
| Client | Must be a Socket.IO client | Any WebSocket client | The browser's built-in `EventSource` |

Because Socket.IO has its own protocol, a plain WebSocket client can't talk to it directly. That's why `live-terminal.js` uses the `socket.io-client` package. Even the `curl.exe` answer in the Quick Win starts with the number `0`: the "open" packet code of **Engine.IO**, the transport layer under Socket.IO.

If data only needs to flow to the browser, SSE is enough, and simpler. This module chose Socket.IO because its rooms, answers, and reconnecting are already there, and because Module 20 will check the user's identity during its handshake.

</details>

<details>
<summary><b>AWS and Azure: the industry's version of desired and reported</b></summary>

The pattern of Concepts 3 and 4 wasn't made up by this curriculum. The biggest cloud IoT services use the same ideas, just with other names:

| Idea | Azure IoT Hub | AWS IoT | Mini Smart Home (contract 1.3) |
| :--- | :--- | :--- | :--- |
| A command now, which must be answered and fails if it isn't | Direct method (default timeout 30 seconds) | — | `cmd` `"action":"set"` → `ack` within 5 seconds, the API answers `504` |
| A desired state that lasts even if the device disconnects | Desired properties in the device twin | `desired` in the Device Shadow | `cmd` `"action":"config"`, retained; `desired` in the backend's memory |
| A state report from the device | Reported properties | `reported` | `state` in `telemetry` and `ack` |
| The difference between the two | — | `delta` | `diff` in `GET /devices/{id}/state` |
| Matching an answer with its command | Request number | `clientToken` | the command's `id` |

Azure's documentation even gives the same example as this module: a direct method fits "turn on the fan", which must be answered right away, while desired properties are used for a long-term state that the device reads as soon as it reconnects. MQTT version 5 also has a built-in way to match answers (Response Topic and Correlation Data). The project's contract uses MQTT 3.1.1, so the matching is built by hand: the `id` field in `cmd` and `ack`.

</details>

<details>
<summary><b>Home Assistant: automation rules in a real smart home</b></summary>

**Home Assistant**, popular open-source smart home software, has a numeric state trigger with two options that resemble this module's threshold rule:

- `above: 30` reacts when the value **crosses** from 30 to above it, and doesn't keep reacting while the value stays above 30. The same as `evaluateThreshold()`, which only decides at the edge.
- `for` means that the value must **last** for a certain time, the same as `for_seconds`. Its documentation is honest too: the `for` count starts again from zero if Home Assistant restarts. Our backend's "120 seconds" count is lost on a restart as well.

Home Assistant also records **who** changed a state: a human or an automation. That's the idea behind the `source` and `rule_id` columns in the `commands` and `events` tables. After Module 20 adds login, the signed-in user can become the next source.

</details>

<details>
<summary><b>Command queues and message queues</b></summary>

Backend v0.4 doesn't keep a command queue. A command for a device that's `offline` is refused with `409` right away, and a command that isn't answered within 5 seconds counts as failed. That's on purpose. An old command that's held back and then sent later is actually dangerous: imagine a fan that suddenly turns on an hour after you asked for it. A state that really must last takes another road: the retained `config` on the broker and the `desired` state that gets reconciled (Concept 4).

Some jobs really must survive a restart, for example "send the monthly report" or "keep resending a failed message until it succeeds". For those, people use a **durable job queue**, one that survives a restart:

- **pg-boss** (12.38.0) keeps its queue in PostgreSQL, so it fits this project's database without an extra server. It supports retries with longer and longer pauses, and cron-style schedules.
- **BullMQ** (6.3.19) keeps its queue in **Redis**, another database server that's very fast.

node-cron's own README suggests something similar: for jobs that need retries and priorities, use a queue like BullMQ. Also remember Concept 8: node-cron 4 doesn't replay a schedule that's later than its tolerance, and knows nothing about schedules that passed while the backend was off. A durable queue keeps the jobs and their history in a database, so a job that's already in the queue still gets done as soon as the backend is running again.

</details>

<details>
<summary><b>Idempotency: a command sent twice</b></summary>

An operation is called **idempotent** if its result is the same whether it's done once or twice. "Turn on the fan" is idempotent (a fan that's already on stays on), while "water for 10 seconds" isn't (twice means 20 seconds).

This project already has one layer of protection: Node 1 remembers the last eight command `id`s, so the same `cmd` sent twice by the broker (QoS 1 can do that) is only carried out once (contract rule 8). The second layer isn't there yet: if an app sends `POST /devices/{id}/command` twice because its button was double-clicked or the phone's signal dropped and came back, the backend makes **two** different `id`s, and the pump waters twice. (The "one waiting command for each actuator" rule from Concept 3 only refuses a second request that arrives while the first one is still waiting for its `ack`, and that wait usually lasts only a few milliseconds.)

The usual way to close that gap is an **idempotency key**. The app makes one random code for every user action, then sends it in the `Idempotency-Key` HTTP header. The server stores that key together with its answer:

| The request that arrives | The server's answer |
| :--- | :--- |
| A new key | Do the work as usual, and store the key and its answer |
| An old key, the same content, the answer already exists | Send the **stored answer**, without doing the work again |
| An old key, the first request is still being worked on | `409 Conflict` |
| An old key, different content | `422 Unprocessable Content`: one key may not be used for two different requests |

These rules come from the IETF draft standard *The Idempotency-Key HTTP Header Field* (not an RFC yet). Stripe, a payment service famous for its API, uses the same pattern; its keys may only be thrown away once they're about 24 hours old. In PostgreSQL, "store the key if it isn't there yet" can be written with `INSERT … ON CONFLICT DO NOTHING`, and a daily cleanup is a good job for a node-cron task.

</details>

<details>
<summary><b>The mock Telegram server: how the author tested the bot without an account</b></summary>

This module's code was tested without a real Telegram bot, so that no real token would get around. Here's how: grammY can be pointed at the address of another Bot API server with the `apiRoot` option, and `telegram.ts` already prepares for that through `TELEGRAM_API_ROOT`:

```ts
bot = new Bot(token, apiRoot === "" ? undefined : { client: { apiRoot } });
```

grammY builds the address of every call as `<apiRoot>/bot<token>/<method name>` and always sends it as a POST with JSON content. The author made a small server on the laptop that serves the four calls this bot uses: `getMe` (who is this bot?), `deleteWebhook`, `getUpdates` (any new messages?), and `sendMessage`. That mock server can also pretend to be a user who sends `/start` or `/status`, refuse every call with `401` like a revoked token, and be shut down to imitate an internet outage. That's where the `ERROR` lines in step 6.9 come from.

The mock server's log shows long polling from the server's side (UTC times):

```text
2026-10-21T00:10:22.202Z getUpdates offset=1 timeout=30 -> 0 update(s) after being held 30008 ms
2026-10-21T00:10:49.928Z [test] message from 555000222: /start (update_id 1000)
2026-10-21T00:10:49.929Z getUpdates offset=1 timeout=30 -> 1 update(s) after being held 27722 ms
2026-10-21T00:10:49.935Z sendMessage
2026-10-21T00:10:49.936Z sendMessage to 555000222: Hello! Your chat_id: 555000222
Write this number as TELEGRAM_CHAT_ID in the backend's .env.
```

A `getUpdates` request is held for up to 30 seconds. If there's no message, the answer is empty and the bot asks again right away. As soon as there's a message, the request being held is answered at once (in this example after waiting 27.7 seconds), and 6 milliseconds later the bot has already sent its reply.

Two more things you should know about how a bot receives messages:

- A **webhook** is the opposite: Telegram knocks on our server every time there's a message. This needs an HTTPS address that can be reached from the internet, so it only makes sense once the backend moves to a real server (Modules 26–27). The two ways can't be used at the same time for one bot. That's why grammY calls `deleteWebhook` every time the bot starts.
- **One token may only be used by one long-polling program.** If two programs run with the same token (for example, the backend on two laptops), Telegram refuses one of them with a `409` (Conflict) error, and that bot stops.

Telegram's rate limits are also generous for our needs. Its official documentation recommends not sending more than one message per second to one chat. Thanks to debouncing, this house's bot sends a few messages per hour at most.

</details>

## 🧩 Independent Challenges

Level 1 can be done through `/docs` or Bruno alone, without changing code. Levels 2 and 3 change the backend's code, so do them **after** ➕ C (once the `feature/automation` branch has been merged), on a new branch from `main`, as in Modules 16–18: `git switch main`, `git pull`, then `git switch -c feature/<challenge-name>`. Levels 1 and 2 have answer keys; the complete content of the Level 2 key file is in [`code/challenges/key/`](code/challenges/key/).

### Level 1 — Morning and afternoon watering (a small change)

In the dry season, plants need watering twice a day. Change the **Morning watering** rule (rule 2) so that the pump runs for 10 seconds at **06:00 and 17:00 WIB**, without creating a new rule and without changing code. Hint: a cron expression accepts a list of numbers separated by commas.

<details>
<summary><b>Level 1 answer key</b></summary>

Send `PUT /rules/2` with the same content as in Practice 5, with only its `cron` changed (the device path: your own `device_id`):

```json
{"name":"Morning watering","active":true,"condition":{"kind":"schedule","cron":"0 6,17 * * *"},"action":{"kind":"command","device_id":"f00d00000001","command":{"target":"pump","value":10},"notify":true}}
```

**Expected output:** code `200`, with `"next_run":"2026-10-21T10:00:00Z"` (**example**, sent before 17:00 WIB): 10:00 UTC is 17:00 WIB today. The backend log (**example**):

```text
[10:51:47] INFO: schedule of rule 2 (Morning watering) installed: "0 6,17 * * *" Asia/Jakarta, next 21 Oct 2026, 17:00 WIB
[10:51:47] INFO: Rule 2 (Morning watering) changed through the API: pump f00d00000001 = 10 every "0 6,17 * * *" WIB
```

- `6,17` in the hour field means "hour 6 **and** hour 17". The minute field, `0`, applies to both.
- If you send it after 17:00 WIB, `next_run` becomes 06:00 WIB tomorrow (`…T23:00:00Z`).
- You may change the rule's name as well, for example to `Morning and afternoon watering`. That name also appears in the log, the event log, and the Telegram messages.
- To go back to once a day, send the same content again with `"cron":"0 6 * * *"`.

</details>

### Level 2 — Turn the fan on from Telegram (fill in the blanks)

So far, the bot only sends messages. Add a **`/fan`** command so that the owner can turn the fan on and off from the phone, for example `/fan f00d00000001 on`. This command must go through the same door as the API, the rules, and the schedules (with the source **`telegram`**), so that it's recorded in the `commands` table and still obeys all of `issueCommand()`'s safeguards.

In **`src/services/telegram.ts`**, add `import { issueCommand } from "./commands.ts";` below the `allDevices` import. Then, inside `startTelegram()`, right below the closing `});` of `bot.command("status", …)`, add the following block and fill in every `____`:

```ts
  bot.command("____", async (ctx) => { // Level 2 Challenge, for example "/fan f00d00000001 on"
    if (ctx.chat.id !== ____) {
      await ctx.reply("Sorry, this bot only serves its owner.");
      return;
    }
    const [deviceId, word] = ctx.match.trim().split(/\s+/); // ctx.match = the text after "/fan"
    if (deviceId === "" || (word !== "on" && word !== "off")) {
      await ctx.reply("How to use: /fan <device_id> on, or /fan <device_id> off");
      return;
    }
    const result = await issueCommand(deviceId, { target: "fan", value: word === "____" }, "____");
    if (result.status === "answered" && result.ack.ok) {
      await ctx.reply(`✅ fan ${deviceId} ${word === "on" ? "turned on" : "turned off"} (answered in ${result.wait_ms} ms)`);
    } else if (result.status === "answered") {
      await ctx.reply(`⚠️ ${deviceId} refused the fan command: ${result.ack.message ?? "no reason given"}`);
    } else if (result.status === "no-ack") {
      await ctx.reply(`⚠️ ${deviceId} didn't answer within 5 seconds`);
    } else {
      await ctx.reply(`⚠️ command not sent: ${result.message}`);
    }
  });
```

`ctx.match` holds the text after the command's name, for example `f00d00000001 on`. Test with `npm run check`, start the backend, then send these to your bot: `/fan f00d00000001 on`, `/fan f00d00000001 off`, and just `/fan`.

<details>
<summary><b>Level 2 answer key</b></summary>

- `bot.command("fan", …)`: the command's name, without the slash. grammY refuses `bot.command("/fan", …)` with an error.
- `if (ctx.chat.id !== ownerChat)`: a command that **changes** something in the house is more dangerous than `/status`, so it must be limited to the owner only.
- `value: word === "on"` and the source `"telegram"`.

**Expected output** (**example**, tested by the author through the mock Telegram server). The bot's replies, in order, to `/fan f00d00000001 on`, `/fan f00d00000001 off`, `/fan`, `/fan f00d00000001 yes`, `/fan a4cf12e5b7c0 on` (a device that hasn't been heard since the backend started), and `/fan f00d00000001 on` from someone else's account:

```text
✅ fan f00d00000001 turned on (answered in 4 ms)
✅ fan f00d00000001 turned off (answered in 7 ms)
How to use: /fan <device_id> on, or /fan <device_id> off
How to use: /fan <device_id> on, or /fan <device_id> off
⚠️ command not sent: device a4cf12e5b7c0 has never been heard
Sorry, this bot only serves its owner.
```

The backend log writes `command c-… (telegram) to f00d00000001: fan = true, ack ok=true in 4 ms`, and in psql:

```sql
SELECT to_char(sent_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS time_wib, id, target, value, source, ack_ok
FROM commands WHERE source = 'telegram' ORDER BY sent_at;
```

```text
 time_wib |         id          | target | value |  source  | ack_ok 
----------+---------------------+--------+-------+----------+--------
 10:51:52 | c-20261021-035152-4 | fan    | true  | telegram | t
 10:51:56 | c-20261021-035156-5 | fan    | false | telegram | t
(2 rows)
```

A command from Telegram also becomes the server's desired state, exactly like a command through the API: afterward, `GET /devices/f00d00000001/state` answers `"desired":{"fan":false}`. If that fan is currently turned on by the local safety rule, `/fan … off` also takes it over (Concept 10). The complete content of the file: [`telegram.ts`](code/challenges/key/backend/src/services/telegram.ts).

</details>

### Level 3 — A daily report at 20:00 WIB (from scratch)

Every evening at **20:00 WIB**, the bot sends a summary of that day for every device, for example `📊 Summary 21 Oct: f00d00000001 average temperature 28.1 °C (25–33 °C)`. Create a new file **`src/services/report.ts`** with an `installDailyReport()` function, then call that function once from `server.ts`, near `startTelegram(…)`.

Hints:

- Use node-cron as `schedule.ts` does: `cron.schedule("0 20 * * *", …, { name: "daily-report", timezone: ZONE })`. The `ZONE` constant is already exported by `schedule.ts`. This task isn't a rule in the `rules` table, so `installSchedules()` doesn't take it down, but it still stops when `cron.shutdown()` is called as the backend stops gracefully.
- Take the numbers from the Module 18 summary book with the `avg × n` formula, for example:

  ```sql
  SELECT device_id,
         round((sum(avg_temp * temp_n) / nullif(sum(temp_n), 0))::numeric, 1) AS avg_temp,
         min(min_temp) AS min_temp, max(max_temp) AS max_temp
  FROM readings_hourly
  WHERE hour >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
  GROUP BY device_id ORDER BY device_id;
  ```

  That `WHERE` means "since 00:00 WIB today". Run it from code with `pool.query(…)` (`src/db/pool.ts`), like the functions in `archive.ts`.
- Put the text together, then send it with `notify(text)`. For decimal numbers, use `Intl.NumberFormat("en-US", …)` as in `telegram.ts`, so that they're written the same way as in the other messages (`28.1`).

**Check your answer yourself.** For the time being, replace `"0 20 * * *"` with a time two minutes from now, for example `"52 10 * * *"` if it's 10:50 WIB now. Exactly at that minute, the log writes `Telegram sent: 📊 …`, and your phone receives the summary. `npm run check` and `npm test` must stay clean. Put the schedule back to `"0 20 * * *"` before you commit. This level has no answer key; those three checks are the key.

## ➕ Add-on to "Mini Smart Home"

This week, Mini Smart Home gets an **automation brain**, on the server and on Node 1, together with **notifications**. Readings flow live through Socket.IO, every command goes through one door with an answer that's waited for, rules and schedules are stored in the database and can be changed through the API, every action is recorded in the event log, Telegram keeps its owner informed, and Node 1 guards the fan by itself when the broker is gone. The backend moves up to **v0.4**, the Node 1 firmware to **v1.5.0**, and the data contract to **1.3**.

![Project diagram of Mini Smart Home after Module 19: the house starts reacting by itself with live data, automation rules, Telegram, and local safety; a dashed line means optional, retired, or coming later. Top row, from the left: Node 2 "Garden" v1.0.0 with its 18650 battery, unchanged, sends ESP-NOW to Node 1 "Home" v1.5.0, a teal box: new: config into NVS, local fan safety, offline mode, and state in telemetry, new firmware from Practice 7. Node 1 sends MQTT to the Raspberry Pi gateway at 192.168.1.37, which holds Mosquitto, the MQTT broker, and Node-RED (dashboard, Garden card, RS-485 Sensor group), with a dashed, struck-through fan automation box, still retired since Module 16. The Pi is connected to the phone (Node-RED and Telegram). Below the phone is the Telegram box, the Bot API server for alerts and /status: an alerts arrow goes up to the phone, and a /status arrow comes down from the phone. On the left, the Module 19 simulator (optional, a dashed box): stand-ins for real devices, f00d00000001 to f00d00000010, with the temperature typed in from the terminal (temp 33), going into offline mode when the broker is off; it's connected to the broker over MQTT. In the middle, the green Laptop box, the backend at 127.0.0.1:8080. The broker sends msh/# to the backend, and the backend sends cmd (set and config) to the broker. Telegram is connected to the backend over the internet: outgoing HTTPS, long polling. The backend v0.4 box: Fastify and TypeScript with data contract 1.3; new: Socket.IO at /socket.io/, one door, issueCommand(), desired and reported, the rules engine with Vitest, the node-cron scheduler, and a grammY Telegram bot with long polling; a database archive, and version 0.4.0 in /docs. The API list, v0.3 plus the new ones: GET /health, GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, GET /devices/:id/readings, POST /devices/:id/command, GET /devices/:id/state (new), GET /rules (new), POST /rules (new), PUT /rules/:id (new), POST /rules/:id/run (new), and GET /docs. Below it, through pg (pool), the blue Docker Desktop box: the smarthome-db container, PostgreSQL 17 and TimescaleDB 2.30.2, the smarthome-data volume, counter 127.0.0.1:5432; the new table events as the event log, commands plus source, rule_id, and state, rules plus updated_at and now used by the backend, and, unchanged, the readings hypertable, readings_hourly, and the clerks. Guests on the right: the small terminal (Socket.IO, live-terminal.js) receives live data; Bruno (plus rules, state, schedule) and the browser opening /docs use HTTP; DBeaver via counter 5432 and psql via docker exec go to the database; the backup/ folder holds the pg_dump files from Module 18. Bottom left, an honest note: the backend is still on the laptop; if the laptop is off, the server rules stop too, and local safety only guards the fan without a broker. Bottom, the GitHub mini-smart-home box, branch feature/automation, then a pull request to main: backend/migrations/007_rules_and_events.sql (new); backend/src/services/ realtime, commands, automation, schedule, telegram, events, log (new); backend/src/rules/engine.ts and engine.test.ts (new); backend/src/routes/rules.ts (new); tools/live-terminal.js (new); tools/device-simulator.js and contract-checker.js (1.3); DATA-CONTRACT.md (1.3); backend/README.md (v0.4); firmware/node-1-home/ (v1.5.0); backend/.env.example plus TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (empty); backend/src/schemas/rules.ts (new); and backend/bruno/ plus 4 requests. Bottom right, the dashed coming-next boxes: Module 20, login and roles, Socket.IO locked too; Module 21, device keys and broker access control (ACL); Modules 22–23, a React dashboard with live data through Socket.IO.](assets/project-diagram-module-19.png)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder and its terminal) and a **browser** that's already signed in to GitHub.
>
> ⭐ **Required** — step C merges all the Module 19 work into `main`, and Module 20 starts from there.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `backend/package.json`, `package-lock.json` | the `socket.io`, `node-cron`, and `grammy` packages; `vitest` and `vite` as development tools; the `test` script; version 0.4.0 (Quick Win, Practices 3, 5, 6, and 8) |
| `backend/src/services/realtime.ts` | **new**: Socket.IO with one room for each device (Quick Win, Practice 1) |
| `backend/src/services/log.ts`, `commands.ts` | **new**: one door for every command, the desired and the reported state (Practice 2) |
| `backend/src/schemas/contract.ts`, `src/services/store.ts`, `src/routes/devices.ts` | data contract 1.3 and the `GET /devices/:id/state` route (Practice 2) |
| `backend/src/rules/engine.ts`, `engine.test.ts`, `src/schemas/rules.ts` | **new**: the rules brain and 11 unit tests (Practices 3 and 5) |
| `backend/migrations/007_rules_and_events.sql` | **new**: new columns in `rules` and `commands`, and the `events` table (Practice 4) |
| `backend/src/services/automation.ts`, `events.ts`, `src/routes/rules.ts`, `src/db/archive.ts` | **new** and changed: rules from the database, the event log, and the `/rules` API (Practice 4) |
| `backend/src/services/schedule.ts` | **new**: schedules with node-cron (Practice 5) |
| `backend/src/services/telegram.ts`, `src/config/env.ts`, `.env.example` | **new** and changed: the Telegram bot (Practice 6) |
| `backend/src/server.ts`, `src/services/mqtt.ts` | all the parts above connected, a graceful stop, and version 0.4.0 in `/docs` (Quick Win to Practice 8) |
| `backend/bruno/` | four new requests for rules, schedules, and the actuator state (Practice 8) |
| `tools/live-terminal.js`, `tools/package.json`, `package-lock.json` | **new** and changed: the small terminal and the `socket.io-client` package (Quick Win; the small terminal is updated again in Practices 1, 2, and 4) |
| `tools/device-simulator.js`, `tools/contract-checker.js` | the Module 19 simulator and the version 1.3 checker (Practice 2) |
| `firmware/node-1-home/` | **v1.5.0**: `config` saved in NVS, offline mode, the fan safety rule, `state` in `telemetry`, and the `test offline` command (Practice 7) |
| `DATA-CONTRACT.md` | version 1.3 (step B) |
| `backend/README.md` | how to run and use backend v0.4 (step A) |

### A. Update `backend/README.md`

A teammate who clones your repository needs to know three new things: the Telegram settings that may be left empty, the `npm test` command, and the routes and automation rules that are now available. Replace the content of `backend/README.md` with:

````markdown
# Mini Smart Home Backend

Backend v0.4 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.3 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database with the TimescaleDB add-on (through Docker), and provides a documented API. The reading history can be requested raw or already summarized per 15 minutes, per hour, or per day. Since Module 19, readings also flow live through Socket.IO, every command goes through one door (with the desired and the reported state), automation rules and schedules are stored in the database and can be changed through the API without restarting the server, every important event is recorded, and alerts are sent through Telegram.

## How to run it

1. Install Node.js 24 LTS and Docker Desktop.
2. Start the database, just once (replace `change-this-password` with your password; use only letters, digits, and hyphens):

   ```text
   docker run -d --name smarthome-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=change-this-password -e POSTGRES_DB=smarthome -e TIMESCALEDB_TELEMETRY=off -v smarthome-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env`, then fill in `MQTT_URL` (the broker's address) and the database password in `DATABASE_URL`.
5. Create the tables with `npm run migrate`.
6. The summary clerk only summarizes the last 3 days again. Older history that arrives all at once (readings that were there before migration `003`, the practice data from `npm run seed-history`, or the load test below) only gets into the hourly summary book when it is summarized **once** with this command, after the data is in:

   ```text
   docker exec smarthome-db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', NULL, now() - INTERVAL '1 hour');"
   ```

   Don't repeat this command after retention (migration `004`) has dropped old data: a `NULL` window also deletes the old summaries whose raw readings have already been dropped.
7. (Optional) For Telegram alerts, fill in `TELEGRAM_BOT_TOKEN` (the token from @BotFather) and `TELEGRAM_CHAT_ID` (the number the bot answers when you send `/start`) in `.env`. Empty = Telegram notifications off. That token is a secret, like a password.
8. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts; **Ctrl + C** stops it gracefully (on Windows, `npm run dev` + **Ctrl + C** kills the server at once) |
| `npm run check` | checks the TypeScript types, test files included (run it before every commit) |
| `npm test` | runs the unit tests of the rules engine (`src/rules/*.test.ts`) with Vitest |
| `npm run migrate` | runs the new SQL files in the `migrations/` folder (safe to repeat) |
| `npm run seed-history` | fills in 7 days of practice data for the practice devices `f00d00000001` and `f00d00000002` |

For a load test, `test/load-1-million.sql` loads 1,036,801 fake readings (one every 10 seconds for 120 days) for the test device `beef00000001`. Run it from this folder:

```text
docker cp test/load-1-million.sql smarthome-db:/tmp/load-1-million.sql
docker exec smarthome-db psql -U postgres -d smarthome -f /tmp/load-1-million.sql
```

## API

| Route | What it does |
| :--- | :--- |
| `GET /health` | is the server alive? connected to the broker and the database? how many messages were received and rejected? |
| `GET /devices` | every device heard since the server started |
| `GET /devices/:id/latest` | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | the last health report of one device |
| `GET /devices/:id/readings?from=…&to=…` | the raw reading history from the database (default: the last hour; at most 1,000 readings) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | a summary of the history per 15 minutes, per hour, or per WIB day (default: the last 1 day, 7 days, or 30 days; at most 1,000 buckets) |
| `POST /devices/:id/command` | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table (with `source` `api`) |
| `GET /devices/:id/state` | the actuator state: what the server wants (`desired`), what the device reported last (`reported`, from `telemetry.state` or `ack.state`), when that report arrived, and the actuators that don't match yet (`diff`) |
| `GET /rules` | every automation rule the server is using right now; schedule rules also carry `next_run` (UTC) |
| `POST /rules` | creates a new rule: a threshold rule (`condition.kind` `threshold` + `action.kind` `switch`) or a schedule rule (`schedule` + `command`); it applies right away |
| `PUT /rules/:id` | replaces the whole content of one rule; it applies right away without restarting the server, and the threshold of a fan rule is sent to the device as a retained `config` |
| `POST /rules/:id/run` | runs the action of one schedule rule right now (to test it, without waiting for its time) |

Live data is available through **Socket.IO** at the same address (`/socket.io/`): send `follow` with a `device_id` (its answer carries the last reading) to receive that device's `telemetry` events; the `status` and `event` events go to every client. An example client: `tools/live-terminal.js`.

Automation rules are stored in the `rules` table as JSON data checked by Zod. A threshold rule turns on when its quantity stays **above** `on_above` continuously for `for_seconds` seconds, then turns off **below** `off_below`. Schedule rules use a 5-field cron and are always counted in WIB (`Asia/Jakarta`), whatever the laptop's time zone. An example fan rule:

```json
{"name":"Automatic fan","active":true,
 "condition":{"kind":"threshold","device_id":"a4cf12e5b7c0","quantity":"temperature","on_above":30,"off_below":28,"for_seconds":120},
 "action":{"kind":"switch","device_id":"a4cf12e5b7c0","target":"fan","notify":true}}
```

With `bucket`, the answer has the shape `{ device_id, from, to, bucket, count, summary: [ { time, avg_temp, min_temp, max_temp, avg_humidity, avg_soil, avg_light, reading_count } ] }`. `time` is the start of the bucket (UTC), and `from` is rounded down to the start of a bucket. The 15-minute summary is computed directly from the raw readings, the hourly summary is read from `readings_hourly`, and the daily summary combines the hourly summaries into WIB days. Its daily averages are exactly the same as a calculation from the raw readings, because every hour stores an average and the number of values (`avg_temp` and `temp_n`, and so on).

The Bruno collection for every route is in the `bruno/` folder (choose the `local` environment).

## Database

The shape of the tables is written as numbered SQL files in the `migrations/` folder. A file that has already been applied must never be changed; every new change goes into a file with the next number.

| File | What it contains |
| :--- | :--- |
| `001_initial_schema.sql` | the tables `devices`, `readings`, `device_health`, `commands`, `users`, and `rules` |
| `002_hypertable.sql` | `readings` becomes a TimescaleDB hypertable, cut per day (00:00 UTC) |
| `003_hourly_summary.sql` | the *continuous aggregate* `readings_hourly` (the average, lowest, highest, and number of values per hour) with its refresh schedule (every 30 minutes, the last 3 days) |
| `004_retention.sql` | raw readings older than 90 days are dropped every day; their hourly summaries are kept |
| `005_columnstore.sql` | readings older than 7 days are compressed column by column (columnstore) every 12 hours |
| `007_rules_and_events.sql` | `rules.updated_at` and JSON shape checks; `commands.source` (`api`, `rule`, `schedule`, `telegram`), `commands.rule_id`, and `commands.state`; the event log table `events` (number 006 is skipped on purpose: it belongs to the Level 3 Challenge of Module 18) |

Example: who turned on the fan today (WIB)?

```sql
SELECT sent_at AT TIME ZONE 'Asia/Jakarta' AS time_wib, device_id, source, rule_id, ack_ok
FROM commands
WHERE target = 'fan' AND value = 'true'
  AND sent_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
ORDER BY sent_at;
```

`npm run migrate` also creates the `schema_migrations` table (the record of the migrations already applied). The scheduled TimescaleDB jobs can be seen with `SELECT * FROM timescaledb_information.jobs WHERE job_id >= 1000;`.

## Backup & restore

A photocopy of the whole database is made **inside the container** (with a `pg_dump` whose version is sure to match), then copied to the `backup/` folder (not tracked by Git):

```text
docker exec smarthome-db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
mkdir backup
docker cp smarthome-db:/tmp/smarthome.dump backup/smarthome-2026-10-20.dump
```

Replace `2026-10-20` in the file name with today's date so that later backups don't overwrite each other. On later backups, you can skip `mkdir backup` because the folder already exists.

The commands in this section are exactly the same in PowerShell (Windows), the macOS Terminal, and Linux. `pg_dump` writes one *circular foreign-key constraints* warning (`detail: continuous_agg`) with two `hint` lines; that's normal. Don't create the dump file with `>` (for example `pg_dump … > file.dump`): in Windows PowerShell 5.1 the file gets corrupted, so always use `-f` and then `docker cp`. In Git Bash, write `//tmp/…` (two slashes) because Git Bash turns `/tmp/…` into a Windows folder.

Rebuilding it in a new database `smarthome_restored` (in the same container; TimescaleDB must be the same version, 2.30.2):

```text
docker cp backup/smarthome-2026-10-20.dump smarthome-db:/tmp/restore.dump
docker exec smarthome-db createdb -U postgres -T template0 smarthome_restored
docker exec smarthome-db psql -U postgres -d smarthome_restored -c "CREATE EXTENSION timescaledb;"
docker exec smarthome-db psql -U postgres -d smarthome_restored -c "SELECT timescaledb_pre_restore();"
docker exec smarthome-db pg_restore -U postgres -d smarthome_restored /tmp/restore.dump
docker exec smarthome-db psql -U postgres -d smarthome_restored -c "SELECT timescaledb_post_restore();"
```

Don't use `pg_restore -j`, and don't skip `timescaledb_pre_restore()` or `timescaledb_post_restore()`. To prove that the data is the same, first run `CALL run_job(…);` in `smarthome` with the number of the `Retention Policy` job (you can see the number with the `timescaledb_information.jobs` query in the Database section). The copy runs its retention job as soon as it is restored, so the original database must already have dropped the same binders. Then run this query in psql on `smarthome` and on `smarthome_restored`, and compare the single row:

```sql
SELECT (SELECT count(*) FROM readings) AS readings,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS fingerprint,
       (SELECT count(*) FROM readings_hourly) AS summaries,
       (SELECT count(*) FROM show_chunks('readings')) AS chunks,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS jobs;
```

Once it is proven, delete the copy with `docker exec smarthome-db dropdb -U postgres smarthome_restored`.

## Limits of v0.4

- `GET /devices`, `latest`, `vitals`, and `state` are still read from memory, so they are empty again after every server restart. The desired state (`desired`) and the "for" count of every rule are also lost when the server restarts; the reading history, the commands, the rules, and the events are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- Raw readings are only kept for 90 days; for older times, only their hourly summaries remain.
- The days of the `1d` summary are WIB days (`Asia/Jakarta`), also for devices in WITA or WIT. Rule schedules are counted in WIB too.
- Rules and schedules only run while the backend is running. A schedule that is more than 15 minutes late (for example a laptop asleep at 06:00) isn't run afterwards, only recorded; if the backend is off at that time, nothing is recorded. When the broker can't be reached, Node 1 runs its own fan safety with the threshold from `config`.
- Changes made to the rules directly in the database (for example through DBeaver) are only read when the server restarts or when another rule is changed through the API; use the `/rules` API.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API and Socket.IO have no login yet.
````

Then save it to the `feature/automation` branch. The terminal from 8.5 is still in the `mini-smart-home` folder, so first go into the `backend` folder (`cd backend`), then run:

```text
git add README.md
git commit -m "Backend README v0.4 (Module 19)"
```

### B. Update `DATA-CONTRACT.md` to version 1.3

1. In VS Code with the `mini-smart-home` folder, open `DATA-CONTRACT.md`, then first copy the content of the **My devices** table (at the very bottom) into your notes: the replacement below empties that table too.
2. Open [`mini-smart-home/DATA-CONTRACT.md`](../../mini-smart-home/DATA-CONTRACT.md) in a new tab, click **Copy raw file**, then replace the whole content of your file with it (**Ctrl + A**, then **Ctrl + V**).
3. Fill in the **My devices** table again from your notes, then save (**Ctrl + S**).

Version 1.3 adds the section **The actuator `state` in Node 1's `telemetry`**, the offline-mode report in `vitals`, the details of what `config` holds, shared rule number 10 about retained messages, and the 1.3 history row. Save it to the branch. First go back to the `mini-smart-home` folder (`cd ..`), then run:

```text
git add DATA-CONTRACT.md
git commit -m "Data contract 1.3: state in telemetry, the offline-mode report, config details (Module 19)"
git push
```

### C. ⭐ Merge `feature/automation` into `main` through a pull request

All the commits from the Quick Win to Practice 8, plus steps A and B, are on the `feature/automation` branch. It's time to review them and merge them, exactly as in Module 18 ➕ B:

1. **Open a pull request.** In the `mini-smart-home` repository on GitHub, click **Compare & pull request** on the yellow banner of the `feature/automation` branch. If the banner is already gone, open the **Pull requests** tab → **New pull request**, then choose **base: `main`** ← **compare: `feature/automation`**. Under **What changed?**, write, for example: `Backend v0.4: live data through Socket.IO, one door for commands with desired/reported, automation rules and schedules in the database (API /rules), the event log, a Telegram bot, and a graceful stop. Node 1 firmware v1.5.0 with local safety and offline mode. Data contract 1.3.` Click **Create pull request**.
2. **Review with the checklist.** In the **Files changed** tab, make sure that migration `007_rules_and_events.sql`, `src/rules/engine.test.ts`, and the `firmware/node-1-home` folder are included. Also make sure there's **no** `.env` file: that file now holds your Telegram bot token. If `.env` does show up in the list, don't merge: first make a new token with `/token` at @BotFather, because a token in the GitHub history counts as leaked. Then tick the checklist in the **Conversation** tab according to what really happened. The `DATA-CONTRACT.md` item may be ticked, because step B has updated it. Send a summary through **Review changes** → **Comment** → **Submit review**.
3. **Merge.** Choose **Create a merge commit**, click **Merge pull request** → **Confirm merge**, then **Delete branch**.
4. **Back to `main` on the laptop.** In the terminal:

   ```text
   git switch main
   git pull --prune
   git branch -d feature/automation
   ```

The database isn't affected by this branch switch. Migration `007` is already recorded in `schema_migrations`, so `npm run migrate` on `main` doesn't apply anything anymore.

### D. Save your learning notes

Open the **`learn-iot`** repository in a new VS Code window (**File → New Window**, then **File → Open Folder…**), create the file **`module-19/notes.md`** next to `warmup.js` from 🔁, then fill it in with the numbers from your own screen:

```markdown
# Module 19 notes — Realtime, automation rules, and notifications

| What I measured | My numbers |
| :--- | :--- |
| How long the `ack` of a fan command through the API took (Practice 2) | … ms |
| Unit tests that are green (Practices 3 and 5) | … of … |
| From `PUT /rules/1` until the fan turns on, without a restart (Practice 4) | … seconds |
| The Telegram delay "seconds after reading" (Practice 6) | … seconds |
| How long the offline mode lasted (`offline_s`) and how many times the safety turned the fan on (`local_fan`) (Practice 7) | … seconds, … times |

What surprised me most: …
```

Commit and push in the **`learn-iot`** repository, with GitHub Desktop or the terminal.

**Evidence for passing Module 19** (compare it with ✅ below): the fan's behavior changing after `PUT /rules/1` without a restart (Practice 4), Node 1 or the simulator turning the fan on by itself in offline mode and then reporting when it reconnects (Practice 7), the log line `Telegram sent … seconds after reading` with a number below 10 (Practice 6), and the merged `feature/automation` pull request.

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Realtime** | Data reaches the screen as soon as it arrives at the backend, without waiting to be asked and without a refresh. |
| **HTTP polling** (asking over and over) | The client asks the server every few seconds, "anything new?". Like going back and forth to check the mailbox. |
| **WebSocket** | A connection that's opened once and then left open, so that the server and the client can send each other messages at any time. Like a phone call. |
| **Socket.IO** | A library on top of WebSocket that adds automatic reconnecting, rooms, and answers (acknowledgements). The server uses the `socket.io` package, the client uses `socket.io-client`; both are version 4.8.4. |
| **Room** | A named group of Socket.IO connections, for example `device:a4cf12e5b7c0`. One device's readings are only sent to its room. |
| Socket.IO **event** | A named message sent through Socket.IO, for example `telemetry`, `status`, `event`, `follow`, and `unfollow`. |
| **Handshake** | Socket.IO's first HTTP request (`/socket.io/?EIO=4&transport=polling`), which hands out a session number (`sid`) before the connection is upgraded to WebSocket. |
| **The small terminal** | The program `tools/live-terminal.js`, which follows one device through Socket.IO and shows its readings and events live. |
| **Command → ack → timeout** | The pattern for commands to a device: send a `cmd` with an `id`, wait for an `ack` with the same `id`, and count it as failed if it isn't answered within 5 seconds. |
| **`issueCommand()`** | One door for every command to a device. The API, the rules, the schedules, and Telegram use it, each with a different `source` label. |
| **Desired** (the desired state) | The actuator state the server wants, for example "fan on". Kept in the backend's memory for the fan, the lamp, and the curtain. |
| **Reported** (the reported state) | The actuator state according to the device itself, from `state` in `telemetry` and `ack`. |
| **Diff** | The actuators whose desired and reported states differ. Shown in `GET /devices/:id/state`. |
| **Reconciliation** | Sending the desired state again if it has never been fulfilled or the device has just restarted, at most once every 30 seconds per actuator. |
| **Rules engine** | The part of the backend that evaluates every reading with rules stored as **data** (the `rules` table), not as code. |
| **Threshold rule** and **schedule rule** | This module's two kinds of rules: "if the temperature is above 30 °C for 2 minutes, turn on the fan" (`threshold` + `switch`), and "every day at 06:00 WIB, water for 10 seconds" (`schedule` + `command`). |
| **Hysteresis** | Two different limits for turning on and off (for example, on above 30 °C and off below 28 °C), so that the actuator doesn't keep turning on and off around a single number. |
| **"For"** (`for_seconds`) | The requirement that the value must stay above the on limit continuously for a certain time before the rule acts. |
| **Pure function** | A function whose result depends only on its inputs and that doesn't change anything outside itself, for example `evaluateThreshold()` and `shouldNotify()`. The easiest kind to test. |
| **Unit test** | A small program that checks one part of the code automatically, without a device and without a database. |
| **Vitest** | A unit test tool for JavaScript and TypeScript. `describe` groups tests, `it` is one test, and `expect(…).toBe(…)` checks the result. Run with `npm test`. |
| **The event log** (the `events` table) | The record of "who turned what on, when, and why": rule actions, schedules, rule changes, device status, and offline-mode reports. |
| **Migration `007`** | The file `007_rules_and_events.sql`: new columns in `rules` and `commands`, and the `events` table. Number `006` is skipped on purpose, because 🧩 Level 3 of Module 18 uses it. |
| **Retained `config`** | A `cmd` command holding thresholds (`temp_fan_on`, `soil_watering`) that stays on the broker, so that the device receives it again every time it connects. |
| **node-cron** | A scheduler library for Node.js (version 4.6.0) that runs a function at set times according to a cron expression. |
| **Cron expression** | Five schedule fields: minute, hour, day of the month, month, and day of the week. `0 6 * * *` means 06:00 every day. |
| **Telegram bot** | A Telegram account that's run by a program. Made through **@BotFather**. |
| **Bot token** | The secret key from @BotFather for controlling the bot. Kept only in `.env`; it can be replaced through `/token` if it leaks. |
| **`chat_id`** | The number of the chat between you and the bot. The bot sends its alerts to this number, and only serves `/status` from this number. |
| **grammY** | A Telegram bot library for Node.js (version 1.46.0). |
| **Long polling** | How the bot receives messages: it asks the Telegram server, and the request is held until there's a message or 30 seconds have passed. Works from behind a router without a public IP address. |
| **Webhook** | The opposite of long polling: Telegram knocks on our server every time there's a message. Needs a public HTTPS address (Modules 26–27). |
| **Debouncing** | Damping repeated messages: notify when the situation changes, remind at most once every 30 minutes while the situation is still dangerous, and delay the `offline` message by 60 seconds. |
| **Graceful shutdown** (stopping gracefully) | Closing everything that's still open (the bot, the schedules, the server, MQTT, the database) one by one before the program exits. |
| **`SIGINT`** and **`SIGTERM`** | "Please stop" signals for a program. `SIGINT` is sent when you press **Ctrl + C**; `SIGTERM` is usually sent by another program. |
| **Local safety** | The fan rule in Node 1 firmware v1.5.0 that works on its own when the broker can't be reached, with the threshold from `config` saved in NVS. |
| **Offline mode** | Node 1's state after the broker has been unreachable without a break for 2 minutes. Shown as `OFFLINE MODE` on the OLED, then reported through `vitals` (`offline_s`, `local_fan`) when it reconnects. |
| **`test offline`** | The Serial command of firmware v1.5.0 that cuts the broker connection on purpose and holds back reconnecting for 3 minutes, to try offline mode without pulling a cable. |
| **"Whoever turned it on turns it off"** | The actuator ownership principle: local safety only turns off a fan it turned on itself; as soon as there's another fan command, the fan passes into the hands of whoever gave that command. |
| **Data contract 1.3** | This week's contract version: `state` in Node 1's `telemetry`, the offline-mode report in `vitals`, and the details of what `config` holds. |
| **Idempotency** | The property of an operation whose result is the same even if it's done twice. Covered in 🔬. |

## 📝 5-Question Quiz

1. Your family's dashboard asks `GET /devices/:id/latest` every 2 seconds, while Node 1 sends its regular `telemetry` every 10 seconds. In one hour, how many requests does one dashboard send, and at most how many of them carry a new reading? What changes if the dashboard uses Socket.IO, and why does the dashboard still not subscribe to the MQTT broker directly?
2. The server wants Node 1's fan on, and Node 1 has already reported its fan on. Then two things happen: (a) your younger sibling turns the fan off through the Serial Monitor with `fan off`; (b) the next day, the power goes out briefly, so Node 1 restarts with every relay off. In which case does the backend send the fan command again, and why?
3. The fan rule: on above 30 °C for 120 seconds, off below 28 °C. Readings arrive every 10 seconds: 31 °C from second 0 to second 50, exactly 30.0 °C at second 60, then 31 °C again from second 70 on. At the reading of which second is the fan turned on? After that, the temperature drops to 29 °C; what happens, and when is the fan turned off?
4. A temperature of 33 °C lasts 70 minutes from the moment the fan is turned on automatically, then drops to 25 °C. How many Telegram messages do you receive from the fan rule, and what do they say? And why is the `offline` message delayed by 60 seconds?
5. Node 1 runs firmware v1.5.0 with a `temp_fan_on` threshold of 30 °C, and the room is at 33 °C. What does Node 1 do in these three cases: (a) the Pi's LAN cable is unplugged for 5 minutes; (b) the laptop running the backend goes down, while the broker on the Pi keeps running; (c) after case (a), the broker is back, the temperature is still 33 °C, and the fan rule on the server isn't active. Who turns that fan off later?

<details>
<summary><b>Answer key</b></summary>

1. 3,600 seconds ÷ 2 seconds = **1,800 requests** per hour, and at most 3,600 ÷ 10 = **360** of them carry a new reading. The rest, **1,440 requests (80%)**, are answered with "nothing new yet". A new reading can also arrive up to 2 seconds late. With Socket.IO, the dashboard connects once, follows the room `device:<device_id>`, and the backend pushes every reading as soon as it arrives: 360 messages, none of them wasted, with no waiting (Concepts 1–2). The dashboard still talks to the backend, not the broker, because it's the backend that checks and filters the messages, and from Module 20 on it also checks its users' permissions.
2. Only in **(b)**. In (a), the server's wish has already been fulfilled once, so a "fan off" report means that another brain (a human or a local rule) changed it on purpose. The backend doesn't fight back; it only shows `fan` in `diff` (Concept 4, Practice 2). In (b), the first `vitals` after the restart carries a small `uptime_s` (under 60 seconds). That's a sign that every relay has just gone off because of the power, not because of anyone's decision, so the backend writes `has just restarted … the server's wishes are reconciled again` and sends the fan command again.
3. The count starts at second 0, then **restarts** at second 60, because 30.0 isn't **above** 30 (`<=` restarts the count). The count starts again at second 70, and the fan is turned on at the reading of **second 190**, exactly 120 seconds later. When the temperature drops to 29 °C, the fan **stays on**, because 29 isn't below 28 yet (hysteresis). The fan is only turned off at the first reading **below 28 °C** (Concept 5, Practice 3).
4. **Four messages**: `🌡️ Temperature 33 °C — fan turned on automatically` when the fan turns on, the reminder `🌡️ Temperature still 33 °C — fan stays on (reminder)` at minute 30 and at minute 60, then `✅ Temperature down to 25 °C — fan turned off` when the temperature drops. The other readings during those 70 minutes (about 420 readings) don't trigger any message at all (Concept 9). The `offline` message is delayed by 60 seconds because Wi-Fi or a broker that drops and comes back for a moment doesn't need to wake anyone up; if the device comes back before 60 seconds, there's no message at all (Practice 6.8).
5. (a) After the broker has been unreachable without a break for **2 minutes**, Node 1 enters **offline mode** and turns the fan on by itself, because 33 is above 30. When it reconnects, its first `vitals` carries `offline_s` and `local_fan`, then the backend records it in the event log and lets you know through Telegram. (b) **Nothing**: Node 1 is still connected to the broker, so it doesn't enter offline mode, even though the rules on the server are down too. That's the honest gap of Concept 10, which only closes once the backend runs on a real server (Modules 26–27). (c) The fan stays on, because 33 isn't below 28 yet. Even though Node 1 is connected again, the one that turns it off later is **the local safety rule itself**, when the temperature drops below 30 − 2 = **28 °C** ("whoever turned it on turns it off"). If the server or you send a fan command before that, the fan passes into the hands of whoever gave the command.

</details>

---

## ✅ Module 19 Completion Checklist

The completion requirement from the Syllabus: **changing the temperature threshold through the API immediately changes how the fan behaves without restarting the server, the device keeps reacting when the broker is turned off, and your Telegram receives the alert in ≤ 10 seconds.** **The path without a device:** every item may be ticked with the Module 19 simulator (the laptop path), or with the simulator and firmware v1.5.0 in Wokwi (the Wokwi path).

- [ ] The JavaScript warm-up is done, and I've checked my "Test yourself" answers against their key (🔁).
- [ ] The small terminal shows live readings through Socket.IO, and this week's work is on the `feature/automation` branch (Quick Win).
- [ ] Every small terminal only receives the readings of the device it follows, and reconnects by itself when the backend restarts (Practice 1).
- [ ] Every command goes through `issueCommand()`, and `GET /devices/{id}/state` shows the desired state, the reported state, and their difference (Practice 2).
- [ ] ⭐ `npm test` reports 10 green unit tests of the rules engine (Practice 3; 11 after Practice 5).
- [ ] ⭐ Changing the fan rule's threshold through `PUT /rules/1` immediately changes how the fan behaves **without restarting the server**, and all of its actions are recorded in the `commands` and `events` tables (Practice 4).
- [ ] The rule "water for 10 seconds every day at 06:00 WIB" is stored, `next_run` shows 06:00 WIB the next day, and the test schedule runs exactly on its minute (Practice 5).
- [ ] ⭐ My Telegram bot sends `🌡️ Temperature 33 °C — fan turned on automatically` **within 10 seconds** of its trigger reading, answers `/status` only for me, and isn't chatty (Practice 6).
- [ ] The backend started with `npm start` stops gracefully when I press **Ctrl + C** (Practice 6).
- [ ] ⭐ Node 1 v1.5.0 (or Wokwi, or the Module 19 simulator in 7.10) enters offline mode after 2 minutes without a broker, turns the fan on by itself when it's hot, and reports the offline mode through `vitals` when it reconnects (Practice 7).
- [ ] ⭐ The dress rehearsal of all three pass requirements succeeds in one go, `npm test` is green, and all four new Bruno requests pass (Practice 8).
- [ ] `backend/README.md` is updated for v0.4, and `DATA-CONTRACT.md` is at version 1.3 (➕ A–B).
- [ ] ⭐ All the Module 19 work is on `main` of the `mini-smart-home` repository, through a pull request, without `.env` (➕ C).

🎉 **Mini Smart Home now reacts by itself.** Data flows to the screen as soon as it arrives, commands reach the device with a confirmation, rules can be changed without touching code, Node 1 guards the house when the server is gone, and your phone gets the news within seconds. There's still one big hole: anyone who can reach your backend can turn on a relay. Next week, the door gets locked.

> ➡️ **Next module:** Module 20 — User Security: Login, JWT in Cookies, Roles, & API Protection. The system can no longer be opened by just anyone, there are accounts with different roles, and both the API and the Socket.IO connections are locked.

---

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- Socket.IO 4.8.4: [overview](https://socket.io/docs/v4/), [how it works](https://socket.io/docs/v4/how-it-works/), [setting up the server](https://socket.io/docs/v4/server-initialization/) and [its options](https://socket.io/docs/v4/server-options/), [rooms](https://socket.io/docs/v4/rooms/), [emitting events and answers (acknowledgements)](https://socket.io/docs/v4/emitting-events/), [the server API](https://socket.io/docs/v4/server-api/) (`disconnectSockets`), [the client](https://socket.io/docs/v4/client-initialization/) and [the client API](https://socket.io/docs/v4/client-api/), [delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/), [CORS](https://socket.io/docs/v4/handling-cors/), [connection problems](https://socket.io/docs/v4/troubleshooting-connection-issues/), and the source code of [socket.io 4.8.4](https://github.com/socketio/socket.io) and engine.io 6.6.11.
- node-cron 4.6.0: [nodecron.com](https://nodecron.com) ([cron syntax](https://nodecron.com/cron-syntax), [scheduling options](https://nodecron.com/scheduling-options), [time zones](https://nodecron.com/timezones-and-dst), [migrating from version 3](https://nodecron.com/migrating-from-v3)) and its source code at [github.com/node-cron/node-cron](https://github.com/node-cron/node-cron) (tag `v4.6.0`).
- Telegram Bot API: [an introduction to bots](https://core.telegram.org/bots), [bot features and @BotFather](https://core.telegram.org/bots/features#botfather), [bot commands](https://core.telegram.org/bots/features#commands), [the official tutorial](https://core.telegram.org/bots/tutorial), [the Bot API reference](https://core.telegram.org/bots/api) (`getUpdates`, `sendMessage`, [formatting](https://core.telegram.org/bots/api#formatting-options), [`chat_id`](https://core.telegram.org/bots/api#chat)), and [the FAQ on rate limits](https://core.telegram.org/bots/faq).
- grammY 1.46.0: [getting started](https://grammy.dev/guide/getting-started), [the basics](https://grammy.dev/guide/basics), [commands](https://grammy.dev/guide/commands), [the Bot API](https://grammy.dev/guide/api), [errors](https://grammy.dev/guide/errors), [long polling versus webhooks](https://grammy.dev/guide/deployment-types), [stopping gracefully](https://grammy.dev/advanced/reliability), [rate limits](https://grammy.dev/advanced/flood), [`ApiClientOptions`](https://grammy.dev/ref/core/apiclientoptions) (`apiRoot`), [the FAQ](https://grammy.dev/resources/faq), and its source code at [github.com/grammyjs/grammY](https://github.com/grammyjs/grammY) (tag `v1.46.0`).
- Vitest 5.0.5: [the guide](https://vitest.dev/guide/), [`expect`](https://vitest.dev/api/expect), and [reporters](https://vitest.dev/guide/reporters).
- Node.js 24.21.0: [process signals](https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events) (`SIGINT`, `SIGTERM`), [`--watch`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--watch), and [`--env-file`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--env-filefile). [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1 (`endAsync`). From Modules 16–18: [Fastify](https://fastify.dev/docs/latest/) 5.12.7 ([hooks](https://fastify.dev/docs/latest/Reference/Hooks/) `preClose` and `onResponse`), [Zod](https://zod.dev/api) 4.6.7 (`discriminatedUnion`, `.refine`, messages in English), [node-postgres](https://node-postgres.com) 8.23.1, TypeScript 7.0.2, [Bruno](https://docs.usebruno.com) 4.2.1, and PostgreSQL 17 ([`ALTER TABLE`](https://www.postgresql.org/docs/17/sql-altertable.html), [JSON functions](https://www.postgresql.org/docs/17/functions-json.html), [`INSERT … ON CONFLICT`](https://www.postgresql.org/docs/17/sql-insert.html)).
- Firmware: [ESP32 Preferences](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/preferences.html) (`getFloat`, `putFloat`, `isKey`; esp32 package 3.3.12), [PubSubClient3](https://github.com/hmueller01/pubsubclient3) 3.3.2, [ArduinoJson](https://arduinojson.org/v7/) 7.4.3, the [MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) specification (the last will, retained, keep-alive), and Wokwi: [ESP32 and Wi-Fi](https://docs.wokwi.com/guides/esp32-wifi), [DHT22](https://docs.wokwi.com/parts/wokwi-dht22), and [pricing and the gateway](https://wokwi.com/pricing). [NetworkManager](https://networkmanager.dev/docs/api/latest/NetworkManager.conf.html) for how the Pi behaves when its LAN cable is unplugged.
- Further reading for 🔬: [@fastify/websocket](https://github.com/fastify/fastify-websocket) 11.3.4, [@fastify/sse](https://github.com/fastify/sse) 0.6.1, [`EventSource` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) and [WebSocket on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API); Azure IoT Hub ([cloud-to-device guidance](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-c2d-guidance), [direct methods](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-direct-methods), [device twins](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-device-twins)), [AWS IoT Device Shadow](https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-document.html), [MQTT 5](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) (Response Topic, Correlation Data); Home Assistant ([the numeric state trigger](https://www.home-assistant.io/triggers/numeric_state/), [threshold](https://www.home-assistant.io/integrations/threshold/), [context in the state object](https://www.home-assistant.io/docs/configuration/state_object/)); [pg-boss](https://github.com/timgit/pg-boss) 12.38.0 and [BullMQ](https://docs.bullmq.io/); the IETF draft standard [*The Idempotency-Key HTTP Header Field*](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header) and [idempotent requests at Stripe](https://docs.stripe.com/api/idempotent_requests).

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-19`, `polling-and-websocket`, `commands-and-state`, `rules-engine`, `rules-without-restart`, `telegram-and-debouncing`, `local-safety`, `project-diagram-module-19` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The behavior of Socket.IO, node-cron, grammY, and the Bot API from the documentation above; the @BotFather steps from Telegram's official documentation; the numbers and log text from the author's lab for this module (backend v0.4, the Vitest tests, the Wokwi test of firmware v1.5.0). | CC BY 4.0 |
| `wokwi-local-safety.png` | Real screenshots of the [Wokwi](https://wokwi.com) project of Node 1 v1.5.0 on the author's laptop after the `test offline` command (the circuit, the OLED, the DHT22 window, and the Serial Monitor); cropped and rearranged, with title, numbers, and captions by the author. | Wokwi screenshot, © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, annotations by the author. Title, numbers, and captions: CC BY 4.0 |

**About the Expected output boxes.** Every command and all the code of this module were run by the author on a Windows 11 laptop with Node.js 24.21.0 and npm 11.19.0, the database in a lab container of `timescale/timescaledb:2.30.2-pg17` as in Modules 17–18, a small MQTT broker on the laptop (aedes, which, like Mosquitto on the laptop, doesn't keep retained messages when it restarts), and the Module 19 device simulator, following exactly the same order of steps as this module. The "broker off" test used a second broker on another port, so that the lab's main broker wasn't stopped too. The Telegram bot was tested against a mock Bot API server on the author's laptop through `TELEGRAM_API_ROOT` (🔬), without a real account or token; the @BotFather steps are taken from Telegram's official documentation. Firmware v1.5.0 was compiled with arduino-cli and the esp32 package 3.3.12, then tested in Wokwi through the public broker. The device path (a real Node 1 and Pi, with the LAN cable unplugged) hasn't been tried by the author; its steps are derived from the same firmware code and the documentation above. The times in the example backend log are written in WIB, while the time `[00:00:13]` in the Serial Monitor is how long Node 1 has been running. The times, command `id`s, answer times, and random numbers on your screen may be different, so outputs like those are marked **example**.

---

[⬅️ Module 18](../module-18-timescaledb/README.md) · [Phase 3](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 20 — User Security: Login, JWT in Cookies, Roles, & API Protection** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-20--user-security-login-jwt-in-cookies-roles--api-protection))
