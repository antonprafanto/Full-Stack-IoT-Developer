# Module 17 — Your First Database: SQL Basics & the "Mini Smart Home" Schema (PostgreSQL via Docker)

🌐 **English** · [Bahasa Indonesia](../../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md)

*Phase 3 · Week 17 · Hardware: **Kit A + B** — Node 1, Node 2, and the Pi gateway from Modules 12–16, or **just a laptop** (the Module 16 simulator and this module's practice data stand in for the devices) · Prerequisites: **Module 16** (backend v0.1) · Time: 8–10 hours, spread over the week*

[⬅️ Module 16](../module-16-backend-typescript-api-git/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 18 ➡️](../module-18-timescaledb/README.md)

---

The backend you built in Module 16 is already smart: it listens to every message, rejects the ones that break the contract, and answers questions through an API. Unfortunately, it's **forgetful**. Everything it knows is kept in the laptop's memory, so every time the server restarts (including every time you save code, because of `--watch`), its store is empty again. It also remembers only the **last** reading of each device. Simple questions like "what was the average temperature yesterday?" or "at what time was the garden soil driest this week?" are beyond it. This week you give it a **long-term memory**: a **database**.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Every time the server restarts, `GET /devices` is empty again. | Backend v0.1 keeps its data in memory, and memory is lost when the program stops. | A **PostgreSQL database** that stores every message on disk (Concept 1, Practice 5) |
| "What was the average temperature yesterday?" can't be answered. | Only the last reading is remembered; the history is thrown away. | A `readings` table that holds every reading, asked with **SQL** (Concepts 3–8, Practice 4) |
| Installing a database server sounds complicated. | A regular database installer has many steps, and they're different on every operating system. | **"Just enough" Docker**: one command runs the same PostgreSQL on Windows and macOS (Concept 2, Quick Win, Practice 1) |
| The times in the data are confusing: the devices write UTC times, you read WIB (Western Indonesia Time, UTC+7). | Time is stored and shown in different time zones. | **`timestamptz`** columns and how to show WIB correctly (Concept 9, Practice 4) |
| The same message sometimes arrives twice. | A sender that uses MQTT QoS 1 (for example MQTTX now, and the broker bridge in Module 27 later) sends a message again if its acknowledgment gets lost. | The **`(device_id, ts)`** key and **`ON CONFLICT DO NOTHING`**: a duplicate send is stored only once (Concept 10, Practice 6) |
| The shape of the tables will change from module to module. | Changing tables by hand isn't recorded and is hard to repeat on another laptop. | **Numbered migrations**: SQL files in the repository, run in order (Concept 5, Practice 3) |
| Other apps can't ask for the history yet. | API v0.1 only has the latest reading. | **`GET /devices/:id/readings?from=&to=`** (Practice 7) |

By the end of the week, **backend v0.2** stores every `telemetry`, `status`, `vitals`, and command in a PostgreSQL database running on your laptop. You can stop the server, start it again tomorrow, and the history is still there. You write the SQL for "the average temperature per day over the last 7 days" without a cheat sheet, prove that a message sent twice is stored only once, and read that history from **Bruno** through a new API.

![Module 17 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 3 Backend and data, Modules 16 to 21, is highlighted with a green frame. Modules 1 to 16 are marked done, Modules 18 to 21 are green, and Module 17 is marked YOU ARE HERE with the note: long-term memory, PostgreSQL through Docker, SQL, history through the API. Below that, the box for this week's Module 17, 8 to 10 hours spread out, with Kit A + B (Node 1, Node 2, and the Pi gateway from Modules 12–16) or just a laptop. The list of activities: the JavaScript warm-up, that is, time, ?. and ??, spread, try/catch, and template literals; Docker Desktop setup, only once; Quick Win, your first database answers; Practice 1, just enough Docker, that is, containers, logs, and volumes; Practice 2, DBeaver as a window into the database; Practice 3, the schema through migration 001; Practice 4, basic SQL with 7 days of practice data; Practice 5, backend v0.2 stores every MQTT message; Practice 6, a duplicate send is stored once; Practice 7, the history API and recorded commands; and the Add-on, README v0.2 and a pull request to main. Practices 4, 5, 6, 7, and the Add-on are marked with a star, required to pass. Note at the bottom: almost all of this week's work is on the laptop, and the database runs in Docker Desktop; hardware is not required, because Practice 4 uses practice data and the Module 16 simulator stands in for the real devices.](assets/roadmap-module-17.png)

> [!NOTE]
> **How to use this module.**
>
> - **Almost all of this week's work is on the laptop.** Every command box says where it's used: the **VS Code terminal** (in the `backend` folder), **Docker Desktop**, **DBeaver**, **Bruno**, **MQTTX**, or **psql** (the SQL window inside the database container). The Pi's address `192.168.1.37`, Node 1's `device_id` `a4cf12e5b7c0`, and Node 2's `device_id` `246f28b1c7d4` are only examples; use your own.
> - **Hardware isn't required.** Practice 4 uses 7 days of **practice data** made by this module's script, so you can learn SQL without waiting a week. Practices 5–7 need real messages: from Node 1 and Node 2, or from the **Module 16 simulator** (`tools/device-simulator.js`) with `f00d00000001` in place of Node 1's `device_id`.
> - **No Raspberry Pi yet?** Follow the **laptop path** as in Modules 12–16: the broker runs on the laptop, and the address `mqtt://192.168.1.37:1883` is replaced with your laptop broker's address. The database runs on the laptop anyway, whichever path you take.
> - **The Expected output boxes.** The author has run this module's TypeScript and SQL code on a Windows laptop with Node.js 24, a lab MQTT broker, a mock Node 1 and Node 2, and a lab PostgreSQL server. The output of the `docker` commands and of psql inside the container has been checked against a real Docker Desktop, while the Docker Desktop screens are written from the official documentation. Outputs that contain IDs, times, or sizes are marked **example** (see 📚). The dates, times, `id`s, and millisecond numbers on your screen will certainly be different.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in VS Code, DBeaver, the browser, and Bruno. **Except in the terminal:** stopping a running program is still **Ctrl + C**. Terminal commands are exactly the same on Windows and macOS, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The database password is never committed.** It's only written in the `docker run` command (once) and in the backend's `.env` file, which has been in `.gitignore` since Module 16. Only `.env.example`, with an example password, goes to GitHub.
> 2. **The database is only open to the laptop itself** (`127.0.0.1:5432`), not to the whole Wi-Fi network. Opening the database to the network needs a stronger lock, and that's a job for Modules 26–27.
> 3. **`DELETE` and `UPDATE` without `WHERE` change ALL the rows.** Always write the `WHERE` first, and practice on the rows of the practice devices (`f00d…`), not on your own devices' data.
> 4. **The volume is your data.** The container may be deleted and created again, but the `smarthome-data` volume holds all the tables and rows. Don't delete the volume unless you really want to start from scratch.
> 5. **The shape of the tables is changed only through migration files.** A table changed by clicking in DBeaver isn't recorded in the repository, so other laptops (and you, next month) don't know about the change.

This module follows the same rhythm as Modules 1–16. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🐳 Setup: installing Docker Desktop (30–45 minutes, only once)](#-setup-installing-docker-desktop-3045-minutes-only-once)
5. [🏆 Quick Win: your first database answers (20 minutes)](#-quick-win-your-first-database-answers-20-minutes)
6. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Why a database](#1-why-a-database-a-notice-board-and-an-archive-book) · [2 Docker](#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard) · [3 Tables](#3-tables-rows-columns-types-and-the-primary-key) · [4 Relations & schema](#4-relations-and-the-mini-smart-home-schema-tables-that-point-to-each-other) · [5 Migrations](#5-numbered-migrations-the-history-of-the-table-shapes-goes-into-git) · [6 `SELECT`](#6-sql-asks-select-where-order-by-and-limit) · [7 Changing data](#7-sql-changes-data-insert-update-and-delete) · [8 `GROUP BY` & `JOIN`](#8-summarizing-and-combining-group-by-aggregate-functions-and-join) · [9 Time](#9-time-timestamptz-utc-and-wib) · [10 From the backend](#10-from-the-backend-the-pool-the-1-parameter-and-duplicate-sends)
7. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Docker](#practice-1--just-enough-docker-containers-logs-and-volumes-25-minutes) · [2 DBeaver](#practice-2--dbeaver-a-window-into-the-database-30-minutes) · [3 Migration](#practice-3--the-mini-smart-home-schema-through-a-migration-40-minutes) · [4 Basic SQL](#practice-4--basic-sql-with-7-days-of-practice-data-75-minutes) · [5 Backend v0.2](#practice-5--backend-v02-stores-every-mqtt-message-40-minutes) · [6 Duplicate sends](#practice-6--a-duplicate-send-is-stored-once-20-minutes) · [7 History API](#practice-7--the-history-api-and-recorded-commands-40-minutes)
8. [🚨 Troubleshooting](#-troubleshooting)
9. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
10. [🧩 Independent Challenges](#-independent-challenges)
11. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
12. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-17-completion-checklist)

## 🎯 After this module you can…

1. **Explain why an IoT system needs a database**, not just program memory or a CSV file.
2. **Run PostgreSQL with one Docker command**, check its container, then stop it and start it again without losing data.
3. **Open the database with DBeaver and psql**, then run SQL and read the results.
4. **Design the Mini Smart Home tables** (`devices`, `readings`, `commands`, `device_health`, `users`, `rules`) with the right data types, primary keys, and foreign keys, then create them through a **numbered migration**.
5. **Write SQL for real questions**: selecting and filtering rows, sorting, combining two tables, and summarizing per day, including **the average temperature per day over the last 7 days** without a cheat sheet.
6. **Handle time correctly**: store `timestamptz`, tell the device's time apart from the arrival time, and show WIB without getting the date wrong.
7. **Keep a duplicate send from being stored twice** with the `(device_id, ts)` key and `ON CONFLICT DO NOTHING`.
8. **Connect the backend to the database** with the `pg` library, a pool, and the `$1` parameter, so that **backend v0.2** stores every MQTT message and provides the history API `GET /devices/:id/readings`.

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **A laptop that can run Docker** | Windows 10 version 22H2 or Windows 11 version 23H2 or later (64-bit), **8 GB of RAM**, and virtualization enabled in the BIOS/UEFI; or a Mac with **macOS 14 Sonoma** or later. Keep at least **5 GB** of free space. A laptop below these requirements: read 🔬 "A database on the Raspberry Pi". |
| **Docker Desktop 4.95** or later | Installed in the 🐳 Setup section, preferably **a day before** you start, because Windows may ask you to restart. |
| **DBeaver Community 26.2** or later | The "window" into the database, installed in Practice 2 (about 114 MB on Windows, 124–125 MB on macOS). |
| **Backend v0.1 from Module 16** | The `mini-smart-home/backend` folder that was merged into `main` in Module 16 ➕ D, along with Node.js 24, VS Code, Git, and Bruno. |
| **An MQTT broker** and **Node 1 / Node 2** | The Pi gateway from Module 12 (or a laptop broker) and the devices from Modules 14–15. You can use the Module 16 simulator (`tools/device-simulator.js`) instead. |
| **MQTTX** | From Module 11, for sending a test message in Practice 6. |
| **An internet connection** | The database image (a ready-to-use package for Docker, Concept 2) is about **552 MB** (about 535 MB on an Apple silicon Mac), DBeaver about 114–125 MB, plus `npm install`. If your data quota is limited, download on a network with a generous quota. |

Versions used in this module (October 2026): **Docker Desktop 4.95** (Docker Engine 29.8.2), the image **`timescale/timescaledb:2.30.2-pg17`** (PostgreSQL 17.11 + TimescaleDB 2.30.2), **DBeaver Community 26.2.3**, **pg 8.23.1**, **@types/pg 8.23.1**, and all the Module 16 tools (Node.js 24, fastify 5.12.7, zod 4.6.7, typescript 7.0.2). Docker Desktop and DBeaver release a new version every few weeks; you may use a newer one. The database image and the npm libraries are deliberately pinned to the versions written here so that your results match this module.

> [!NOTE]
> **Why the TimescaleDB image, not plain PostgreSQL?** TimescaleDB is PostgreSQL with an add-on for time-series data (data that keeps growing over time, like sensor readings). This week we only use its PostgreSQL part: all the SQL in this module is ordinary PostgreSQL SQL. The TimescaleDB add-on is only used in Module 18, and because it's installed from the start, you won't need to move your data later.

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, and the `learn-iot` repository folder.

As in Module 16, every Phase 3 module opens with a JavaScript warm-up. This week's backend code uses five skills you haven't practiced much yet: working with **time** using `Date`, the **`?.`** and **`??`** operators for values that might be empty, **spread** (`...`) for copying objects, **`try … catch`** for catching failures while waiting, and **multi-line template literals** for writing SQL inside code. This warm-up goes over all five in one small file. Type the code yourself (don't copy and paste), run it after every step, then compare the output.

**Prepare the folder.** Open the **`learn-iot`** repository folder in VS Code, first click the empty space in the Explorer panel, create a new folder **`module-17`**, then run this in the terminal:

```text
cd module-17
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` is needed by step 4, which uses `await` outside a function (just like the Module 16 warm-up). Then create the file **`warmup.js`** in the `module-17` folder.

### Step 1 — Time with `Date`

The database and the data contract store time in UTC, while you think in WIB (Concept 9 goes deeper). In JavaScript, a **point in time** is held by a `Date` object. Type this in `warmup.js`:

```js
// warmup.js - a JavaScript warm-up before Module 17

// 1. Time with Date
const time = new Date("2026-10-20T10:10:00+07:00"); // 10:10 WIB
console.log(time.toISOString()); // the same point in time, written in UTC
const oneHour = 60 * 60 * 1000; // one hour in milliseconds
const anHourAgo = new Date(time.getTime() - oneHour);
console.log(anHourAgo.toISOString());
console.log(time.toISOString().slice(0, 19) + "Z"); // the data contract format, without milliseconds
```

Save (**Ctrl + S**), then run it in the terminal:

```text
node warmup.js
```

**Expected output:**

```text
2026-10-20T03:10:00.000Z
2026-10-20T02:10:00.000Z
2026-10-20T03:10:00Z
```

- `new Date("…+07:00")` reads a WIB time, and **`toISOString()`** always writes it in UTC (the `Z` ending). 10:10 WIB is the same as 03:10 UTC: the point in time is the same, only the way it's written differs.
- **`getTime()`** gives that point in time as a number of milliseconds. Going back one hour means subtracting `60 * 60 * 1000` milliseconds, then making a new `Date` from the result. The history API in Practice 7 works out "the last hour" this way.
- **`.slice(0, 19)`** takes the first 19 characters (up to the seconds), then the letter `Z` is added back. The result is exactly the `ts` format of the data contract, which the backend uses when it answers the API.

### Step 2 — `?.` and `??`

Node 1 and Node 2 don't have exactly the same fields: Node 1 has `light`, Node 2 has `pressure`. The database needs `null` for a field that isn't there, not `undefined`. Add this at the very bottom:

```js
// 2. ?. and ??
const node1 = { temperature: 28.5, light: 2310 };
const node2 = { temperature: 29.4, pressure: 1008.6 };
console.log(node1.pressure ?? null); // missing -> null
console.log(node2.pressure ?? null);
const empty = null;
console.log(empty?.light ?? null); // empty is null: ?. stops without an error
console.log(0 ?? 99, 0 || 99); // ?? only replaces null and undefined; || replaces 0 too
```

Run it again. **Expected output** (the new lines below the output of step 1):

```text
null
1008.6
null
0 99
```

- **`a ?? b`** means "use `a`, unless `a` is empty (`null` or `undefined`); if it's empty, use `b`". `node1.pressure` doesn't exist (`undefined`), so the result is `null`.
- **`a?.field`** means "read `field` from `a`, unless `a` itself is empty". Without the question mark, `empty.light` stops the program right away with `TypeError: Cannot read properties of null (reading 'light')`.
- The last line shows a trap: `0 || 99` gives `99` because `||` treats `0` the same as "empty". But `0` can be a real reading, for example `light` in the dark. That's why the backend uses `??`, not `||`.

### Step 3 — Spread: copy, then replace one column

When it answers the API, the backend copies every row from the database, then replaces one of its columns. Add:

```js
// 3. Spread: copy every column, then replace one
const row = { ts: time, temperature: 28.5, humidity: 71 };
const forApi = { ...row, ts: row.ts.toISOString().slice(0, 19) + "Z" };
console.log(forApi);
console.log(row.ts instanceof Date); // the original doesn't change
```

**Expected output** (the new lines):

```text
{ ts: '2026-10-20T03:10:00Z', temperature: 28.5, humidity: 71 }
true
```

`...row` (three dots, called **spread**) pours all the columns of `row` into a new object. The `ts` column written after it overwrites the `ts` that was poured in. The original object doesn't change: `row.ts` is still a `Date` (`instanceof Date` is `true`). Node.js prints objects with single quotes; that's only how it displays them, not JSON.

### Step 4 — Waiting, and catching failures

Every question to the database is a "promise" (a `Promise`) that you wait for with `await` (the Module 16 warm-up, step 5). The difference is that a promise from the database can be **broken**, for example because the database container is off. Add:

```js
// 4. Waiting, and catching failures
function askDatabase(alive) {
  return new Promise((succeed, fail) => {
    setTimeout(() => {
      if (alive) succeed([{ temperature: 28.5 }]);
      else fail(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    }, 300);
  });
}
for (const alive of [true, false]) {
  try {
    const result = await askDatabase(alive);
    console.log("success:", result.length, "row(s)");
  } catch (error) {
    console.log("failed:", error.message);
  }
}
console.log("the program keeps running");
```

**Expected output** (the new lines):

```text
success: 1 row(s)
failed: connect ECONNREFUSED 127.0.0.1:5432
the program keeps running
```

`askDatabase` pretends to be a database: after 0.3 seconds, its promise is kept (`succeed`) or broken (`fail`). If a promise that `await` is waiting for is broken, `await` "throws" an error. **`try … catch`** catches it: the code in `catch` runs, then the program keeps running. Without `try … catch`, that error stops the whole program. The backend uses this pattern when the database can't be reached: it answers `503` with a clear message instead of crashing too (Practice 7).

### Step 5 — Multi-line template literals

The SQL statements in the backend code are often long, so they're written inside **backticks** (the key to the left of **1**) so that they can span several lines. Add:

```js
// 5. Multi-line template literals
const id = "a4cf12e5b7c0";
const query = `SELECT ts, temperature
FROM readings
WHERE device_id = '${id}'`;
console.log(query);
const sneaky = "x'; DELETE FROM readings; --";
console.log(`WHERE device_id = '${sneaky}'`);
```

**Expected output** (the new lines):

```text
SELECT ts, temperature
FROM readings
WHERE device_id = 'a4cf12e5b7c0'
WHERE device_id = 'x'; DELETE FROM readings; --'
```

The last line is a warning. If a value from outside (for example a `device_id` from an API address) is pasted into an SQL statement with `${…}`, a prankster can slip in a second command, here `DELETE FROM readings`. That's why the backend only uses template literals for SQL statements that are **fixed**. The values are always sent separately through `$1`, `$2`, and so on (Concept 10).

**Test yourself (10 minutes).** Without looking at the key:

1. Add one line that prints the time **24 hours** before `time`, in the data contract format (like the third line of step 1).
2. Guess first, then run it: what are the results of `undefined ?? "empty"`, `"" ?? "empty"`, and `"" || "empty"`? Print each result with `console.log(JSON.stringify(…))` so that empty text shows up as `""`, not as a blank line that's easy to miss.
3. With spread, make a copy of `node2` that has one extra field, `battery: null`.

<details>
<summary>Self-test answer key</summary>

```js
// test 1: go back 24 hours
console.log(new Date(time.getTime() - 24 * oneHour).toISOString().slice(0, 19) + "Z");

// test 3: copy node2, add one field
const complete = { ...node2, battery: null };
console.log(complete);
```

1. The result is `2026-10-19T03:10:00Z`: the date goes back one day, the time stays the same.
2. `undefined ?? "empty"` gives `"empty"`. `"" ?? "empty"` gives `""` (empty text) because empty text isn't `null` or `undefined`. `"" || "empty"` gives `"empty"` because `||` treats empty text the same as "empty".
3. The result is `{ temperature: 29.4, pressure: 1008.6, battery: null }`.

</details>

The warm-up is done. The `warmup.js` file goes to GitHub along with your SQL notes in ➕ C.

> ➡️ **Continue** to [🐳 Setup: installing Docker Desktop](#-setup-installing-docker-desktop-3045-minutes-only-once).

## 🐳 Setup: installing Docker Desktop (30–45 minutes, only once)

> 🖥️ **Tools used:** a **browser** (for downloading), **PowerShell as Administrator** (Windows only, once), **Docker Desktop**, and the **VS Code terminal**.

**Docker Desktop** is an app that can run "ready-to-use program boxes" called **containers**. Concept 2 explains how it works; for now, it's enough to know that with Docker, a PostgreSQL database server can be run with **one command**, and the same command works on both Windows and macOS. You only need to do this section once. If you can, do it a day before you start, because Windows may ask you to restart.

Docker Desktop is **free** for personal use, education (schools and universities), and small businesses (fewer than 250 employees and less than 10 million US dollars in revenue per year). Government agencies and large companies need a paid subscription.

<details>
<summary><b>Windows</b>: WSL 2, then Docker Desktop</summary>

1. **Check the requirements.** Press **Win + R**, type `winver`, then press **Enter**: the version must be **22H2** (Windows 10) or **23H2** or later (Windows 11). Open **Task Manager** (**Ctrl + Shift + Esc**) → the **Performance** tab → **CPU**: at the bottom right it must say **Virtualization: Enabled**. If it says **Disabled**, virtualization needs to be turned on in the laptop's BIOS/UEFI (the steps differ for every brand; search for "enable virtualization" and your laptop's brand, or ask for help from someone who usually handles the BIOS).
2. **Set up WSL 2** (the Linux layer inside Windows that Docker uses). Right-click the **Start** button → **Terminal (Admin)** (or **Windows PowerShell (Admin)**), answer **Yes** in the permission window, then run:

   ```text
   wsl --update
   ```

   If the answer says that WSL isn't installed yet, run `wsl --install --no-distribution`. If you're asked to restart, restart first. Check with `wsl --version`: the first line, `WSL version: …`, must be 2.1.5 or newer. This is the only step that needs Administrator rights; close the Admin window afterward.
3. **Download** the installer from the official page [docs.docker.com/desktop/setup/install/windows-install](https://docs.docker.com/desktop/setup/install/windows-install/): click the **Docker Desktop for Windows - x86_64** button. What gets downloaded is `Docker Desktop Installer.exe` (hundreds of MB in size).
4. **Install.** Double-click `Docker Desktop Installer.exe`. When you're asked how to install, keep the default choice, which is the **per-user** installation (for your own account; it doesn't need Administrator rights). If a **Use WSL 2 instead of Hyper-V** checkbox appears, leave it checked. Follow the steps to the end, then click **Close**.
5. **Start it.** Docker Desktop doesn't start by itself after it's installed. Type `Docker Desktop` in the **Start** menu, then open it. In the **Docker Subscription Service Agreement** window, click **Accept** (Docker Desktop won't run without this agreement).
6. **Signing in isn't required.** If Docker Desktop offers to sign in or to fill in a welcome survey, choose to continue without signing in, or skip it. The labels may be slightly different between versions.
7. Wait until Docker Desktop has finished starting: the whale icon in the notification area (bottom right, near the clock) stops moving, and the main window shows a **Containers** list that's still empty.

</details>

<details>
<summary><b>macOS</b>: Docker Desktop for Apple silicon or Intel</summary>

1. **Check the requirements.** Click the Apple logo in the top left corner of the screen → **About This Mac**. The macOS version must be **14 (Sonoma)** or later. Also look at the **Chip** line: if it says **Apple M…**, your Mac uses Apple silicon; if there's a **Processor** line that says **Intel**, your Mac uses an Intel chip.
2. **Download** from the official page [docs.docker.com/desktop/setup/install/mac-install](https://docs.docker.com/desktop/setup/install/mac-install/): click **Docker Desktop for Mac with Apple silicon** or **Docker Desktop for Mac with Intel chip**, according to step 1. What gets downloaded is `Docker.dmg`.
3. **Install.** Double-click `Docker.dmg`, then drag the **Docker** icon to the **Applications** folder.
4. **Start it.** Open the **Applications** folder, then double-click **Docker**. In the **Docker Subscription Service Agreement** window, click **Accept**. New versions of Docker Desktop don't ask for the Mac's password when they're opened for the first time.
5. **Signing in isn't required.** Skip the sign-in offer and the welcome survey.
6. Wait until the whale icon in the menu bar (top right) stops moving.

</details>

**Check from the terminal.** Close VS Code completely, then open it again (so that its terminal knows the newly installed `docker` command), open a new terminal (**Terminal → New Terminal**), then run:

```text
docker --version
docker run hello-world
```

**Expected output** (example; the version number on your screen may be newer, and its `build` code changes too if the version is different):

```text
Docker version 29.8.2, build 7fc2dff
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
…: Pull complete
Digest: sha256:…
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.
…
```

The sentence `Hello from Docker!` means everything is fine: Docker downloaded a small "mold" called `hello-world`, ran it as a container, and showed its message. On an Apple silicon Mac, the line `(amd64)` reads `(arm64v8)`. If you get an error instead, open 🚨 "Docker Desktop won't start, or `docker` isn't recognized".

> [!TIP]
> **Docker Desktop must be running every time you work.** By default, Docker Desktop doesn't start when the laptop is turned on. Open the app before you work on this module, or make it start automatically: the gear icon (**Settings**) → **General** → check **Start Docker Desktop when you sign in to your computer**.

> ➡️ **Did Docker Desktop answer `Hello from Docker!`?** Continue to [🏆 Quick Win](#-quick-win-your-first-database-answers-20-minutes).

## 🏆 Quick Win: your first database answers (20 minutes)

> 🖥️ **Tools used:** **Docker Desktop** (already running) and the **VS Code terminal** (any folder).

In twenty minutes, a real PostgreSQL database server will be running on your laptop, and you'll have asked it what time it is. Most of that time goes into downloading, not typing.

### Step 1 — Choose a database password and check the counter (3 minutes)

1. **Choose a password** for the database's main account (its name is `postgres`). Use only letters, numbers, and hyphens (no spaces, `@`, `:`, or `/`), because this password will later be written inside an address. The example in this module: `change-this-password`. **Use your own password**, then write it down somewhere safe (not in the GitHub repository).
2. **Check whether counter (port) 5432 is still free.** Port 5432 is PostgreSQL's default counter number. If your laptop already has another PostgreSQL (for example from a university course), that counter is already taken. Run this in the VS Code terminal:

   **Windows:**

   ```text
   netstat -ano | findstr :5432
   ```

   **macOS:**

   ```text
   sudo lsof -nP -iTCP:5432 -sTCP:LISTEN
   ```

   On macOS, `sudo` asks for your Mac account's password; without `sudo`, a PostgreSQL that runs under another user's name isn't visible. If nothing appears, the counter is free, so carry on. On Windows, ignore lines that don't contain `LISTENING`, for example `127.0.0.1:54324 … TIME_WAIT`: that's another connection whose counter number just happens to start with `5432`. If a `LISTENING` line appears with an address that ends exactly in `:5432` (for example `0.0.0.0:5432`) on Windows, or a `(LISTEN)` line on macOS, use counter **5433**: in the command of step 2, replace `127.0.0.1:5432:5432` with `127.0.0.1:5433:5432`, and throughout this module use port `5433` every time `5432` is written for the laptop (DBeaver and `DATABASE_URL`). Check counter 5433 first with the same command (replace `5432` with `5433`): a laptop that once had two versions of PostgreSQL installed usually uses both 5432 and 5433 already. If 5433 is taken too, use 5434 the same way.

### Step 2 — Run the database with one command (5–10 minutes)

First copy the command below into an empty tab in VS Code (**Ctrl + N**), then replace `change-this-password` with your password (and `127.0.0.1:5432:5432` with `127.0.0.1:5433:5432` if step 1 told you to). After that, copy the result into the terminal **as one line**, press **Enter**, then close that tab without saving it (**Don't Save**):

```text
docker run -d --name smarthome-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=change-this-password -e POSTGRES_DB=smarthome -e TIMESCALEDB_TELEMETRY=off -v smarthome-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
```

The command really is long. Concept 2 takes it apart. In short: "run in the background (`-d`) a container named `smarthome-db` from the mold `timescale/timescaledb:2.30.2-pg17`, open counter 5432 for this laptop only, set a password, create the database `smarthome`, keep its data in the cupboard `smarthome-data`, and start it again automatically every time Docker starts". `TIMESCALEDB_TELEMETRY=off` asks TimescaleDB not to send usage statistics to its makers.

**Expected output** (example; the `Pull complete` line appears several times, and the download of about 552 MB takes a few minutes, longer if your internet is slow):

```text
Unable to find image 'timescale/timescaledb:2.30.2-pg17' locally
2.30.2-pg17: Pulling from timescale/timescaledb
…: Pull complete
…: Pull complete
Digest: sha256:b346edcdb51a1fd6020e3965e0bd1c9f3406fa6d5fbce1e28f4852587ef934e2
Status: Downloaded newer image for timescale/timescaledb:2.30.2-pg17
3f9c2a7d41e85b06c2d9a1f47e3b8c5d90a6e2f17b4c8d3e5f60a1b2c3d4e5f6
```

The long last line is your new **container ID** (yours is different). The download happens only once: next time, the mold is already on the laptop, and `docker run` answers right away with just that ID line. Careful: this ID is printed **before** the container is started. If there's still a `docker: Error response from daemon: …` line below it, the container failed to start; see the **Not working?** box at the end of the Quick Win.

### Step 3 — Make sure the container is running (2 minutes)

```text
docker ps
```

**Expected output** (example):

```text
CONTAINER ID   IMAGE                               COMMAND                  CREATED          STATUS          PORTS                      NAMES
3f9c2a7d41e8   timescale/timescaledb:2.30.2-pg17   "docker-entrypoint.s…"   38 seconds ago   Up 37 seconds   127.0.0.1:5432->5432/tcp   smarthome-db
```

What matters: the **STATUS** column starts with `Up` (running), **PORTS** shows `127.0.0.1:5432->5432/tcp` (the laptop's counter 5432 is forwarded to counter 5432 inside the container), and **NAMES** shows `smarthome-db`. In Docker Desktop, the same container appears in the **Containers** list with a green dot.

### Step 4 — Ask the database for the time (5 minutes)

Go into **psql**, PostgreSQL's own SQL window, which is already inside the container:

```text
docker exec -it smarthome-db psql -U postgres -d smarthome
```

It means: "run (`exec`) the `psql` program inside the `smarthome-db` container interactively (`-it`), as the user `postgres`, in the database `smarthome`". Inside the container, psql doesn't ask for a password. The sign that you're inside psql is a line that starts with `smarthome=#`. Type SQL commands there, **end each one with a semicolon**, then press **Enter**:

```sql
SELECT now();
SET TIME ZONE 'Asia/Jakarta';
SELECT now();
```

**Expected output** (example; the time on your screen will certainly be different):

```text
psql (17.11)
Type "help" for help.

smarthome=# SELECT now();
              now              
-------------------------------
 2026-10-20 03:15:42.367129+00
(1 row)

smarthome=# SET TIME ZONE 'Asia/Jakarta';
SET
smarthome=# SELECT now();
              now              
-------------------------------
 2026-10-20 10:15:58.104227+07
(1 row)

smarthome=# 
```

Look at the endings. The first answer ends in `+00`: the database answers with **UTC** time (world time), which is seven hours behind WIB. After `SET TIME ZONE 'Asia/Jakarta'`, the same question is answered with the ending `+07`, and it matches the WIB wall clock. (Living in WITA or WIT, Central or Eastern Indonesia Time? This clock is still WIB, one or two hours behind yours.) Only the way the time is written changes, not the time itself. Concept 9 explains why this matters, including the zone names for WITA and WIT. After you leave psql, Docker Desktop usually prints a few lines that start with `What's next:`, for example `Try Docker Debug … → docker debug smarthome-db`. Those are only feature suggestions from Docker Desktop, not errors and not steps of this module, so just ignore them. Similar `What's next:` lines also appear after `docker logs` and near the error messages of `docker run` (an invitation to ask Gordon, Docker's AI assistant). Leave psql with:

```text
\q
```

### Step 5 — The container stays alive (2 minutes)

Close that terminal, open it again, then run `docker ps` once more: `smarthome-db` is still `Up`. The database doesn't depend on the terminal that started it. It keeps running in the background until you stop it (Practice 1) or Docker Desktop is shut down.

🎉 **Congratulations!** You've just run a real database server, exactly like the ones big applications use, with one command. This week you fill it with the Mini Smart Home tables, learn to ask questions in SQL, and connect it to the backend.

> [!TIP]
> **Not working?**
>
> - `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine…` (Windows) or `Cannot connect to the Docker daemon…` / `failed to connect to the docker API at unix://…` (macOS) → Docker Desktop isn't running yet. Open the app, wait until the whale icon stops moving, then try again.
> - `docker: Error response from daemon: Conflict. The container name "/smarthome-db" is already in use…` → the container has already been created. Don't run `docker run` again; start it with `docker start smarthome-db`.
> - `ports are not available` or `port is already allocated` → counter 5432 is already used by another program. Go back to step 1, item 2, and use counter 5433 (or 5434 if 5433 is taken too). The failed `docker run` command leaves behind a container that can't start, so first delete it with `docker rm smarthome-db` before running step 2 again.
> - psql answers with an error in the first few seconds after `docker run`, for example `connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: No such file or directory`, `the database system is shutting down`, or even `database "smarthome" does not exist` → the database hasn't finished setting itself up for the first time yet (on the author's laptop, about 8 seconds after `docker run`; on a slower laptop it can take longer). Wait about half a minute, then repeat the `docker exec` command of step 4.
> - psql **still** answers `database "smarthome" does not exist` after you've waited → the `-e POSTGRES_DB=smarthome` part was left out. See 🚨 "The `smarthome` database doesn't exist, or the new password doesn't work".
> - In psql, after **Enter** there's no answer and the start of the line changes from `smarthome=#` to `smarthome-#` → the semicolon was forgotten, so psql is still waiting for the rest of the statement. Type `;`, then press **Enter**. If the statement turns out to have a typo, psql answers with an `ERROR` that doesn't break anything; type it again correctly.
> - A message that mentions `toomanyrequests` and `pull rate limit` → Docker Hub limits downloads made without signing in to 100 per 6 hours per internet address, and that limit can run out on a shared campus or classroom network. Try again a few hours later, use another network, or sign in to a free Docker account (its limit is 200).
> - In step 3, the **STATUS** column says `Restarting (1) …` (now and then briefly `Up Less than a second`) and the **PORTS** column is empty, or in step 4 you get `Error response from daemon: Container … is restarting, wait until the container is running` → the container fails to start and keeps being restarted. The most common cause is that the `-e POSTGRES_PASSWORD=…` part was left out. See 🚨 "The `smarthome-db` container stops by itself or won't start".
> - Other error messages: see 🚨 "The `smarthome-db` container stops by itself or won't start".

> ➡️ **Done with the Quick Win?** Read [Concept 1](#1-why-a-database-a-notice-board-and-an-archive-book) and [Concept 2](#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard), then do the practices in the order given at the start of 🧠.

## 🧠 The "Why" Concepts

There are ten concepts. You don't need to read them all at once before the practices. The order:

1. Quick Win (already done) → Concepts 1–2 → Practice 1 (the database and Docker)
2. Concepts 3–5 → Practices 2–3 (tables, relations, migrations)
3. Concepts 6–9 → Practice 4 (SQL and time)
4. Concept 10 → Practices 5–7 (the backend stores data in the database and reads it back)

The ⬆️/➡️ boxes at the end of every practice and at the end of every group of concepts above take you to the next step.

### 1. Why a database: a notice board and an archive book

Imagine an office. On the wall there's a **notice board** that always shows the latest news: who's on duty, the temperature in the server room right now. The board is quick to read, but every new notice covers the old one, and if the board is taken down, what's on it is gone. In a cupboard there's an **archive book**: every event is written down in order, dated, never overwritten, and can be looked up at any time. Backend v0.1 (Module 16) only has a notice board: the in-memory store. This week it gets an archive book: a **database**.

Why not just write every message to a CSV or JSON file? For one or two readings a day, that's enough. For Mini Smart Home, which sends one reading every 10 seconds from Node 1 (more than 8,600 rows a day, not counting Node 2), an ordinary file is quickly overwhelmed:

| Need | Memory (Module 16) | CSV/JSON file | Database (PostgreSQL) |
| :--- | :--- | :--- | :--- |
| The data stays after the server restarts | ❌ lost | ✅ | ✅ |
| Answering "the average temperature yesterday" | ❌ only the last reading | Possible, but you have to write a program for every question, and the whole file is read again every time | ✅ one **SQL** statement, and the database knows how to look it up quickly |
| Rejecting badly shaped data | — | ❌ whatever is written gets stored | ✅ column types, `NOT NULL`, `CHECK`, and keys reject it |
| Rejecting duplicate sends | — | ❌ | ✅ the primary key (Concept 10) |
| Many programs writing at the same time | — | ❌ the file's contents can get mixed up | ✅ designed for it |
| Surviving a power cut in the middle of writing | — | ❌ the file can get cut off | ✅ every change is completed entirely or not at all (transactions, Concept 5) |

A **database** here means a special program whose job is to store and look up data. It's sometimes called a **DBMS** (*Database Management System*). The program we use is **PostgreSQL** (pronounced "post-gres-Q-L", often shortened to "Postgres"): free, open source, developed since 1996 (its forerunner was the POSTGRES project at the University of California, Berkeley, in 1986), and used everywhere from small projects to large companies. We ask it questions in **SQL** (*Structured Query Language*), the question-and-answer language of databases, which has been in use since the 1970s and is understood by almost every database.

In Module 16, a comment in `store.ts` predicted that the store would one day be replaced by a database. It turns out the two are more useful together, because their jobs are different. Backend v0.2 uses both. The in-memory store stays the **notice board** for the latest state (`GET /devices`, `/latest`, commands) because the board is fast. The database becomes the **archive book** for everything that has ever happened (`GET /devices/:id/readings`, reports, charts in Phase 4).

![Diagram of the notice board and the archive book: backend v0.2 uses both, the board for the latest state and the archive book for everything that has ever happened. Top, from the left: Mosquitto, the MQTT broker, sends msh/# messages to the green backend v0.2 card (Fastify + light TypeScript, on the laptop); messages that pass the contract go to two places at once. Top right, a note: messages that break the contract are rejected (REJECTED in the log), not on the board and not in the archive. Two arrows go down from the backend. The left arrow, every new message overwrites the old one, leads to the Notice board card = the in-memory store (Module 16): one card per device, holding its latest state. The a4cf12e5b7c0 (Node 1) card holds ts 03:10:00Z temperature 28.5 and ts 03:10:10Z temperature 28.5, crossed out and marked overwritten, then ts 03:10:20Z temperature 28.6, marked latest; 246f28b1c7d4 (Node 2) has its own card, also with only the latest. Used by: GET /devices, /latest, and commands. The box below it: fast, but empty again when the server restarts, because memory is lost when the program stops. The blue right arrow, every new reading adds one row, leads to the blue Archive book card = the PostgreSQL database (new this week): the readings table, one row per reading, in order, with the columns device_id, ts, and temperature; three a4cf12e5b7c0 rows at 03:10:00Z (28.5), 03:10:10Z (28.5), and 03:10:20Z (28.6), added, never overwritten, then a new row for every following reading. Used by: GET /devices/:id/readings, reports, and charts in Phase 4. The box below it: still there even when the server is turned off, because it's stored on disk, not in memory.](assets/board-and-archive.png)

### 2. Just enough Docker: the mold, the container, the counter, and the cupboard

You can install PostgreSQL directly on Windows or macOS, but the steps are different on every operating system, it becomes a service that's always running, and it's hard to remove without leaving traces. **Docker** offers another way: a program is packed together with everything it needs into one ready-to-run package, then run in its own "room", separate from your laptop's system. Four terms are enough for this week:

| Docker term | Imagine | In the Quick Win |
| :--- | :--- | :--- |
| **Image** (the mold) | A cake mold: it holds everything that's needed (a mini Linux system, PostgreSQL, TimescaleDB), never changes, and can be used again and again | `timescale/timescaledb:2.30.2-pg17`, downloaded once from Docker Hub |
| **Container** | A cake made from that mold: the program that's running. It can be thrown away and made again at any time | `smarthome-db` |
| **Port** (the counter) | A counter from outside the container to its inside | `-p 127.0.0.1:5432:5432`: counter 5432 on the laptop (for this laptop only) is forwarded to counter 5432 inside the container |
| **Volume** (the cupboard) | A cupboard that stands **outside** the cake: what's in it stays even when the cake is thrown away | `-v smarthome-data:/var/lib/postgresql/data`: all the tables and rows are kept in the `smarthome-data` volume |

The whole `docker run` command from the Quick Win, part by part:

| Part | What it means |
| :--- | :--- |
| `docker run` | Make a new container from an image, then run it. |
| `-d` | Detached: it runs in the background, and the terminal is free again right away. |
| `--name smarthome-db` | The container's name, so that it can be called by name (not by a long ID). |
| `-p 127.0.0.1:5432:5432` | The counter, `laptop-address:laptop-port:container-port`. The address `127.0.0.1` means only programs on this laptop can come in; without that address, the counter is open to the whole Wi-Fi network. |
| `-e POSTGRES_PASSWORD=…` | `-e` fills in a "form" for the container (an environment variable). This is the password of the `postgres` account. |
| `-e POSTGRES_DB=smarthome` | Create a database named `smarthome` the first time it starts. |
| `-e TIMESCALEDB_TELEMETRY=off` | Don't send usage statistics to the makers of TimescaleDB. |
| `-v smarthome-data:/var/lib/postgresql/data` | The `smarthome-data` cupboard is mounted on the folder where PostgreSQL keeps its data. Docker creates the cupboard itself if it doesn't exist yet. |
| `--restart unless-stopped` | Start this container again every time Docker Desktop starts, unless you stopped it yourself. |
| `timescale/timescaledb:2.30.2-pg17` | The image used: `timescale/timescaledb` with the tag (version label) `2.30.2-pg17`, meaning TimescaleDB 2.30.2 on top of PostgreSQL 17. |

Two things often trip people up. First, **the `POSTGRES_…` forms are only read while the cupboard is still empty**, that is, when the container is created for the first time. Changing the password in a later `docker run` command doesn't change the password of the database that already exists. Second, **containers and images are Linux**. On Windows and macOS, Docker Desktop quietly runs a small Linux (through WSL 2 on Windows) to hold the containers. That's why Docker needs enough RAM and virtualization turned on.

This week we only use "just enough" Docker: `run`, `ps`, `logs`, `stop`, `start`, and `exec`. What's inside a container, building your own image, and running many containers at once with Docker Compose are covered in detail in Module 26.

![Diagram of just enough Docker with four terms, the mold, the container, the counter, and the cupboard: what happens when the docker run command of the Quick Win is run on your laptop. Top left, the Docker Hub card, an online image warehouse, holding the Mold (image) timescale/timescaledb:2.30.2-pg17: never changes, used again and again, downloaded once, about 552 MB. Top right, the Wi-Fi network card: no entry (only 127.0.0.1), for other devices, for example a phone or a friend's laptop; its dashed line stops at the edge of the laptop frame with a red cross. The docker run arrow, make and run, goes down from the mold into the Laptop frame (Windows or macOS), which holds the Docker Desktop frame, a small Linux in the laptop (through WSL 2 on Windows). Inside Docker Desktop there's a blue Container box, smarthome-db: PostgreSQL 17 + TimescaleDB 2.30.2, a running program that can be thrown away and made again from its mold at any time, with the data folder /var/lib/postgresql/data. To its left, outside the container but still inside Docker Desktop, the Cupboard (volume) box, smarthome-data: all the tables and rows are kept here; the data stays even when the container is gone; the cupboard stands outside the container and is mounted on the container's data folder through a line marked -v. On the right edge of the container is port 5432. Outside Docker Desktop, still on the laptop, the Counter (port) box, 127.0.0.1:5432, for programs on this laptop only, with an arrow to port 5432 on the container. Two guests on the laptop come in through that counter: backend v0.2 with DATABASE_URL, and DBeaver with Host 127.0.0.1, Port 5432. Below them, psql from the terminal with the command docker exec -it; its arrow goes straight into the container through docker exec, without going through the counter.](assets/docker-image-container.png)

> ➡️ **Done reading Concepts 1–2?** Continue to [Practice 1](#practice-1--just-enough-docker-containers-logs-and-volumes-25-minutes).

### 3. Tables, rows, columns, types, and the primary key

A PostgreSQL database stores data in **tables**. A table is like one sheet of a spreadsheet, with stricter rules:

- Every **column** has a name and a **type** that are set from the start. The `temperature` column only accepts numbers. Writing the text `'hot'` into that column is rejected right away.
- Every **row** is one record, for example one sensor reading.
- A cell may hold **`NULL`**, which means "there's no value" (a failed reading, or a device that doesn't have that sensor). `NULL` is different from `0`: a temperature of `0` means zero degrees, while `NULL` means unknown.

The types used this week:

| Type | What it holds | Example columns |
| :--- | :--- | :--- |
| `text` | text of any length | `device_id`, `fw`, `location` |
| `integer` | whole numbers | `humidity`, `light`, `soil`, `rssi` |
| `double precision` | decimal numbers (fractions) | `temperature`, `pressure`, `lat`, `lng` |
| `boolean` | `true` or `false` | `motion`, `active` |
| `timestamptz` | a point in time, complete with its time zone (Concept 9) | `ts`, `received_at`, `last_seen` |
| `jsonb` | a piece of JSON | a command's `value`, a rule's `condition` |

Besides its type, a column can be given extra rules (constraints): **`NOT NULL`** (must be filled in), **`DEFAULT`** (an automatic value if it isn't filled in, for example `now()` for the current time), and **`CHECK`** (a condition that must be met, for example `lat BETWEEN -90 AND 90`).

The most important thing is the **primary key**: a column, or a combination of columns, whose value **may not repeat** anywhere in the table, so that every row has its own "ID card number". In the `devices` table, the primary key is `device_id`: there can't be two rows for the same device. In the `readings` table, the primary key is the **composite** `(device_id, ts)`: one device has only one reading for one time. This composite key is what will reject duplicate sends later (Concept 10).

The `devices` table, as written in the migration file of Practice 3:

```sql
CREATE TABLE devices (
  device_id  text PRIMARY KEY CHECK (device_id ~ '^[0-9a-f]{12}$'),
  kind       text NOT NULL DEFAULT 'unknown' CHECK (kind IN ('node1', 'node2', 'unknown')),
  name       text,             -- an easy-to-remember name, for example 'Node 1 living room' (filled in by a person)
  location   text,             -- for example 'living room' or 'back garden'
  lat        double precision CHECK (lat BETWEEN -90 AND 90),
  lng        double precision CHECK (lng BETWEEN -180 AND 180),
  status     text NOT NULL DEFAULT 'unknown',
  last_seen  timestamptz,      -- server time when this device's last message arrived
  created_at timestamptz NOT NULL DEFAULT now()
);
```

How to read it: `CREATE TABLE devices (…)` creates a table named `devices`. Every line of code inside the parentheses is one column: its name, its type, then its rules. `CHECK (device_id ~ '^[0-9a-f]{12}$')` (the `~` sign means "matches the pattern") uses the same pattern as the Module 16 Zod schema (12 lowercase hexadecimal digits): the database helps guard the data contract too. The `--` sign starts an SQL comment, just like `//` in TypeScript. `lat` and `lng` (latitude and longitude) and `location` are prepared for the device map in Phase 4. The table names (`devices`, `readings`) come from the Syllabus, and the column names follow the data contract (`temperature`, `humidity`).

### 4. Relations and the Mini Smart Home schema: tables that point to each other

The `readings` table doesn't store a device's name or location; it only stores the `device_id`. If we want to know the location of a reading's device, we look at the row with the same `device_id` in the `devices` table. A link like this is called a **relation**, and the `readings.device_id` column is called a **foreign key**, because it points to the primary key of another table:

```sql
device_id text NOT NULL REFERENCES devices (device_id)
```

`REFERENCES devices (device_id)` is a promise: "every `device_id` here must already exist in the `devices` table". The database rejects readings from a device that isn't registered, and refuses to delete a device that still has readings. So that messages from a new device aren't rejected, backend v0.2 always makes sure the device's `devices` row exists first (Practice 5).

Why not write the device's name and location directly in every `readings` row? Because one device has thousands of readings. If the device is moved, we only need to change **one** row in `devices`, not thousands of `readings` rows. The same data is stored in only one place.

The Mini Smart Home schema has six tables:

| Table | What it holds | Primary key | Filled in by |
| :--- | :--- | :--- | :--- |
| `devices` | one row per device: kind, name, location, status, when it was last heard | `device_id` | the backend, automatically when the first message arrives; the name and location are filled in by a person |
| `readings` | one row per `telemetry`: all the sensor fields of contract 1.2 | `(device_id, ts)` | the backend, from `msh/<id>/telemetry` |
| `device_health` | one row per `vitals`: RSSI, uptime, free memory | `(device_id, ts)` | the backend, from `msh/<id>/vitals` |
| `commands` | one row per command from the API, along with its `ack` result | `id` (the command id) | the backend, from `POST /devices/:id/command` |
| `users` | user accounts and their roles (`admin` or `viewer`) | `id` (an automatic number) | prepared now, used in Module 20 |
| `rules` | automation rules, for example "temperature above 30 → fan on" | `id` (an automatic number) | prepared now, used in Module 19 |

The `readings` table is deliberately **wide**: one column for every sensor field of the contract, from Node 1 (`light`, `motion`, `water_level`, `soil_rs485`, `ec`) as well as from Node 2 (`pressure`, `battery`). A column that a device doesn't have holds `NULL`. That way, the readings of every device are in one table and can be compared with one **query** (a question in SQL). The `ts` column is the time of the reading **from the device**, while `received_at` is the time the message **arrived at the backend**. The difference matters in Concept 9.

![Diagram of the Mini Smart Home schema, six tables: three tables point to devices through the foreign key device_id, while users and rules are prepared now and used later. Center, the devices table, from msh/<id>/status and the first message, with the primary key device_id (text) and the columns kind, name, location (text), lat and lng (double precision), status (text), and last_seen and created_at (timestamptz). Left, the readings table, from msh/<id>/telemetry, with the composite primary key device_id (text, also a foreign key) and ts (timestamptz), then received_at (timestamptz), fw (text), temperature (double precision), humidity, light, and soil (integer), motion (boolean), water_level (integer), pressure, soil_temperature, battery, and soil_rs485 (double precision), and ec (integer). Top right, the device_health table, from msh/<id>/vitals, with the composite primary key device_id (also a foreign key) and ts, then rssi, uptime_s, and heap_free (integer). Bottom right, the commands table, from POST /devices/:id/command, with the primary key id (text), the foreign key device_id, then sent_at (timestamptz), target (text), value (jsonb), ack_ok (boolean), ack_message (text), and wait_ms (integer). Blue lines from device_id in readings, device_health, and commands end in arrows at device_id of the devices table. Bottom center, a dashed group, prepared now, used later: the users table, used in Module 20, with id, an automatic integer (the primary key), email, unique text, name, role (text: admin or viewer), and created_at; and the rules table, used in Module 19, with id, an automatic integer (the primary key), name, active (boolean), condition and action (jsonb), and created_at. Legend, bottom left: a key icon means a primary key, its value may not repeat; two key icons joined by a composite bracket, like device_id and ts in readings and device_health, mean that it's the pair that may not repeat; an arrow icon means a foreign key, pointing to devices.device_id; a dashed line means prepared, not used yet.](assets/smart-home-schema.png)

### 5. Numbered migrations: the history of the table shapes goes into Git

A table can be created by typing `CREATE TABLE …` in DBeaver, or even by clicking around in its design window. The problem is that the change only happens in your laptop's database. The repository doesn't record it. A new laptop, a teammate, the server in Module 27, even you yourself next month don't know which changes were ever made, or in what order.

**Migrations** solve that problem. Every change to the shape of the tables is written as a **numbered** SQL file in the `backend/migrations/` folder, for example `001_initial_schema.sql`, then `002_add_column_x.sql` in a later module. A small program (`npm run migrate`) runs those files in order and records the ones it has run in a special table, `schema_migrations`. Running it again is safe, because files that are already recorded are skipped. A new laptop only needs to run `npm run migrate` once to get all the tables in their latest shape.

Two rules for migrations:

1. **A file that has already been run must not be changed.** Need a change? Write a new file with the next number. Other databases that already ran the old file won't run it again.
2. **A file succeeds entirely, or nothing changes at all.** The migration program wraps every file in a **transaction**: `BEGIN` at the start, `COMMIT` at the end. If one command in the middle of the file fails, `ROLLBACK` undoes all the changes of that file, so no table is left half-built.

There are many ready-made migration libraries (for example `node-pg-migrate` or Drizzle Kit). This module deliberately uses a homemade program of about forty lines so that you can see how it works, and you still write pure SQL.

> ➡️ **Done reading Concepts 3–5?** Continue to [Practice 2](#practice-2--dbeaver-a-window-into-the-database-30-minutes).

### 6. SQL asks: `SELECT`, `WHERE`, `ORDER BY`, and `LIMIT`

Asking the database a question always starts with `SELECT`. The statement reads almost like plain English:

```sql
SELECT ts, temperature, soil    -- the columns you want to see
FROM readings                   -- from which table
WHERE device_id = 'f00d00000001' -- only the rows that meet this condition
ORDER BY ts DESC                -- sort: the newest time on top (DESC = descending, ASC = ascending)
LIMIT 5;                        -- just the first five rows
```

The answer is always a new table, even if it's only one row. A few rules worth remembering from the start:

- **Text is written between single quotes**: `'f00d00000001'`. Double quotes (`"…"`) in SQL mean **a column or table name**, not text. Writing `WHERE device_id = "f00d00000001"` gives the error `column "f00d00000001" does not exist`.
- **Every SQL statement ends with a semicolon** (`;`). Without a semicolon, psql waits for the rest of it.
- **Keywords can be uppercase or lowercase**: `SELECT` is the same as `select`. This curriculum writes SQL keywords in uppercase so that they're easy to tell apart from column names.
- **`SELECT *`** means "all columns". Handy for browsing, but in a program it's better to name the columns one by one.

Conditions in `WHERE` can be combined:

| What you write | What it means |
| :--- | :--- |
| `temperature > 30` | more than 30 (also `<`, `>=`, `<=`, `=`, and `<>` for "not equal to") |
| `temperature > 30 AND soil < 40` | both conditions are met |
| `location = 'porch' OR location = 'garden'` | one of them is met; you can also write `location IN ('porch', 'garden')` |
| `water_level IS NULL` | an empty cell (`NULL`). Writing `water_level = NULL` does **not** work |
| `ts >= now() - interval '1 hour'` | within the last hour; `interval '1 hour'` is a length of time of one hour, so `now() - interval '1 hour'` means one hour before now (Concept 9) |

### 7. SQL changes data: `INSERT`, `UPDATE`, and `DELETE`

Three commands for changing what's in a table:

```sql
INSERT INTO devices (device_id, name, location) VALUES ('f00d000000ff', 'Test device', 'storeroom');
UPDATE devices SET location = 'kitchen' WHERE device_id = 'f00d000000ff';
DELETE FROM devices WHERE device_id = 'f00d000000ff';
```

- **`INSERT INTO table (column…) VALUES (value…)`** adds a row. Columns that aren't mentioned get their `DEFAULT` value, or `NULL`.
- **`UPDATE table SET column = value WHERE …`** changes the rows that meet the condition.
- **`DELETE FROM table WHERE …`** deletes the rows that meet the condition.

> [!CAUTION]
> **`UPDATE` and `DELETE` without `WHERE` hit ALL the rows of the table**, and the database doesn't ask "are you sure?". A safe habit: first write `SELECT * FROM devices WHERE device_id = 'f00d000000ff';`, check that only the row you mean shows up, and only then replace `SELECT * FROM devices` with `DELETE FROM devices` (or with `UPDATE devices SET …`), keeping the `WHERE` part exactly the same.

The database also guards relations (Concept 4): deleting a device that still has readings in `readings` is refused with the error `violates foreign key constraint`. That's on purpose, because a reading without a device means nothing.

### 8. Summarizing and combining: `GROUP BY`, aggregate functions, and `JOIN`

The most useful questions are rarely "show this row". They usually look like "**what's the average**" or "**when was it most** …". For those there are **aggregate functions**, which summarize many rows into one number: `count(*)` (how many rows), `avg(temperature)` (the average), `min(soil)`, `max(temperature)`, and `sum(…)`.

```sql
SELECT count(*), round(avg(temperature)::numeric, 1), min(temperature), max(temperature)
FROM readings
WHERE device_id = 'f00d00000001';
```

Why `avg(temperature)::numeric`? The `temperature` column has the type `double precision`, while the function `round(…, 1)` (round to one digit after the decimal point) only accepts the type `numeric`. The `::` sign changes the type of a value. Without `::numeric`, PostgreSQL answers `function round(double precision, integer) does not exist`.

**`GROUP BY`** makes one summary for every group, for example one row for every device:

```sql
SELECT device_id, round(avg(temperature)::numeric, 1) AS avg_temp
FROM readings
GROUP BY device_id;
```

`AS avg_temp` gives the result column a name (an alias). The `GROUP BY` rule: every column in the `SELECT` must be a grouping column (here `device_id`) or be wrapped in an aggregate function.

**`JOIN`** combines two tables through their relation. To see a device's **location** next to its average temperature, `readings` is joined with `devices` on the same `device_id`:

```sql
SELECT d.location, round(avg(r.temperature)::numeric, 1) AS avg_temp
FROM readings AS r
JOIN devices AS d ON d.device_id = r.device_id
GROUP BY d.location;
```

`readings AS r` gives the table the short name `r`, so `r.temperature` means "the `temperature` column of the `readings` table". `ON d.device_id = r.device_id` is the join condition: every reading is paired with its device's row.

### 9. Time: `timestamptz`, UTC, and WIB

The `ts` column has the type **`timestamptz`** (*timestamp with time zone*). That name is a little misleading: PostgreSQL doesn't store the time zone. It converts every time to **UTC** (world time), then stores one exact **point in time**. When it's shown, that point is written according to the **session time zone**, the session being the connection that's asking:

| Who's asking | Its session zone | The same `ts` shows up as |
| :--- | :--- | :--- |
| psql inside the container | UTC (the server's default) | `2026-10-20 03:10:00+00` |
| psql after `SET TIME ZONE 'Asia/Jakarta'` | WIB | `2026-10-20 10:10:00+07` |
| DBeaver on a laptop set to WIB | the laptop's zone, sent by DBeaver when it connects | `2026-10-20 10:10:00.000 +0700` |
| The backend (the `pg` library) | UTC (the server's default); how `ts` is shown isn't affected, because the result is a JavaScript `Date` object, a point in time | `2026-10-20T03:10:00Z` after it's converted to the contract format, that is, `toISOString()` without milliseconds (🔁 step 1) |

All four are the **same** point in time, only written differently. The devices send `ts` in UTC (the letter `Z` at the end of `2026-10-20T03:10:00Z`, data contract section 4), and PostgreSQL stores it as it is. The ending `+00`, `+07` (in DBeaver `+0700`), or `Z` always tells you the zone, so read that ending before you conclude anything.

The trap shows up most often when **grouping per day**. A day in UTC starts at 07:00 WIB. `ts::date` takes the date according to the **session zone**: in psql inside the container and in the backend (UTC), readings from 00:00–06:59 WIB end up on **yesterday's** date, while in DBeaver (the laptop's zone) the result happens to be right. To get the same result in any window, name the zone yourself and convert to WIB time first:

```sql
(ts AT TIME ZONE 'Asia/Jakarta')::date            -- the date in WIB, for example 2026-10-20
date_trunc('day', now(), 'Asia/Jakarta')          -- 00:00 WIB today
date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'   -- 00:00 WIB seven days ago
```

For a time range, use **`ts >= start AND ts < end`** (the start is included, the end isn't). This form never counts a reading twice in two ranges that follow each other, unlike `BETWEEN`, which includes both ends. Living in WITA or WIT? For your own devices' data, replace `'Asia/Jakarta'` with `'Asia/Makassar'` (WITA, UTC+8) or `'Asia/Jayapura'` (WIT, UTC+9). For the Practice 4 practice data only, keep `'Asia/Jakarta'`: that data was made according to WIB days, so with another zone its first day holds fewer than 144 readings (138 with `'Asia/Makassar'`, 132 with `'Asia/Jayapura'`) and the numbers don't match the example.

One more thing: `ts` is the time **the reading was taken** (from the device's NTP clock), while `received_at` is the time the message **arrived at the backend**. Usually the two are less than a second apart (`ts` from the device has no milliseconds), but a message that's held back and forwarded later, for example by the broker bridge in Module 27 while the internet connection is down, can arrive minutes later. Reports always use `ts`, because that's when things really happened.

![Time diagram: timestamptz, UTC, and WIB. Top, one point in time, four ways to write it: a blue box, a Node 1 reading in the readings table, ts = 2026-10-20T03:10:00Z, stored as one point in time (UTC), branches out to four windows. First, psql in the container, session zone UTC (the server's default), without any settings: 2026-10-20 03:10:00+00. Second, psql after SET TIME ZONE 'Asia/Jakarta', session zone WIB: 2026-10-20 10:10:00+07. Third, DBeaver on the laptop, the session zone follows the laptop's zone (WIB), which DBeaver sends when it connects: 2026-10-20 10:10:00.000 +0700, DBeaver's default format, complete with milliseconds. Fourth, backend / API, the pg library gives a Date object that is written in the contract format, without milliseconds: 2026-10-20T03:10:00Z. The endings +00, +07, +0700, and Z are colored blue. Note: all four are the same point in time, only written differently; the ending +00 or Z means UTC, +07 or +0700 means WIB. Bottom, the trap when grouping per day: a UTC day only starts at 07:00 WIB. Two parallel timelines: UTC (UTC+0) from 17:00 to 07:00, and WIB (UTC+7) from 00:00 to 14:00. The UTC date band is split into October 19 (UTC date) and October 20 (UTC date) exactly at 00:00 UTC; the WIB date band is October 20 (WIB date) all the way. A blue area on the left marks the readings from 00:00–06:59 WIB, lined up with 17:00–23:59 UTC on the 19th, and a dashed line between the marked hour numbers shows the UTC day change = 07:00 WIB. Conclusions at the bottom: a red cross, ts::date in a UTC session (psql in the container, the backend) puts the readings from 00:00–06:59 WIB on October 19, wrong; a green check mark, (ts AT TIME ZONE 'Asia/Jakarta')::date puts them on October 20 in any window, right. A gray line below it reminds you that in DBeaver (a WIB session) ts::date happens to be right, so don't depend on the session zone.](assets/time-utc-wib.png)

> ➡️ **Done reading Concepts 6–9?** Continue to [Practice 4](#practice-4--basic-sql-with-7-days-of-practice-data-75-minutes).

### 10. From the backend: the pool, the `$1` parameter, and duplicate sends

The backend talks to PostgreSQL through the **`pg`** library. Opening a new connection to the database is fairly slow (there's an introduction and a password check every time), so `pg` provides a **connection pool**: several connections that are opened once and then used in turns. Backend v0.2 uses one pool of at most five connections for all its work.

Values from outside (the content of an MQTT message, an API address) are **never** pasted directly into an SQL statement. Imagine the backend writes `"… WHERE device_id = '" + id + "'"`, and then someone sends an `id` containing `x'; DELETE FROM readings; --`. The SQL statement turns into two commands, and the second one deletes all the readings. An attack like this is called **SQL injection**. The cure is **parameters**: the SQL statement uses the markers `$1`, `$2`, and so on, and the values are sent separately as a list:

```ts
await pool.query("SELECT ts, temperature FROM readings WHERE device_id = $1 AND ts >= $2", [id, since]);
```

The database receives the statement and its values in different "envelopes", so the content of `id` is always treated as data, never as a command.

Finally, **duplicate sends**. Node 1 itself publishes `telemetry` with QoS 0 (Module 11), so it never resends. Still, the same message can arrive at the backend twice. The cause is a sender that uses QoS 1, for example MQTTX (Practice 6) or, in Module 27, the Pi → internet server broker bridge, which holds messages while the connection is down and forwards them afterward. QoS 1 guarantees that a message arrives "**at least** once": if the `PUBACK` gets lost on the way (Wi-Fi drops for a moment), the same message is sent again, so the backend can receive it twice. Without a guard, that reading is stored twice and the daily average goes off. There are two guards:

1. **The primary key `(device_id, ts)`** in the `readings` table. A resend carries exactly the same `ts` (the reading time from the device, not the arrival time), so its row is a twin of the one already stored.
2. **`ON CONFLICT (device_id, ts) DO NOTHING`** in the `INSERT` command: "if the key already exists, don't store it, and don't treat it as an error".

```sql
INSERT INTO readings (device_id, ts, fw, temperature) VALUES ('f00d00000099', '2026-10-20T03:10:00Z', '1.4.0', 28.5)
ON CONFLICT (device_id, ts) DO NOTHING;
```

Just read this example for now: the test device `f00d00000099` isn't registered in `devices` yet, so if you ran it now, the foreign key would reject it with `violates foreign key constraint` (Concept 4). In Practice 6, MQTTX sends this `f00d00000099` reading with the same `ts` twice, and the backend runs an `INSERT … ON CONFLICT` like the one above for each send (the backend registers the device first). The first send is answered with `INSERT 0 1`, which is also what psql prints: the last number is how many rows went in (one), while the `0` in the middle is always zero and can be ignored. The second send is answered with `INSERT 0 0` (nothing went in, but there's no error either). So if you run this example yourself between Practice 6.1 and 6.4 (before the test device is cleaned up), the answer is `INSERT 0 0` right away. In the backend, `pg` reports the same number as `rowCount`, and backend v0.2 writes `duplicate skipped` to the log when that number is 0. If `ts` were made by the server (the arrival time), a resend would have a different `ts` and get through as a new row. That's why the data contract asks the device itself to write `ts`.

![Sequence diagram of a duplicate send that is stored once: QoS 1 means it arrives at least once, and the primary key (device_id, ts) together with ON CONFLICT … DO NOTHING filters out the resend. Four lifelines from left to right: Test device f00d00000099 (the message is sent from MQTTX), Broker (Mosquitto on the Pi), Backend v0.2 (the MQTT ear, green), and readings (the table in PostgreSQL, blue). 1, the test device publishes msh/f00d00000099/telemetry with ts 2026-10-20T03:10:00Z and QoS 1 to the broker. The broker's PUBACK gets lost on the way because Wi-Fi drops for a moment, marked with a red cross. The broker forwards send 1 to the backend, which runs INSERT … ON CONFLICT (device_id, ts) DO NOTHING on readings; the answer is INSERT 0 1, rowCount 1, a new row is stored. Meanwhile the sender, drawn with an hourglass, doesn't get a PUBACK, so after reconnecting it sends the same message again. 2, exactly the same message, with ts still 2026-10-20T03:10:00Z, arrives at the broker again and is forwarded as send 2. The backend runs the same INSERT; the answer is INSERT 0 0, rowCount 0, nothing went in, not an error. Note on the left: Node 1 itself publishes telemetry with QoS 0 (contract 1.2), so it never resends; the QoS 1 senders are MQTTX in Practice 6, and later the broker bridge from the Pi to the internet server in Module 27. The backend log box holds the line duplicate skipped: f00d00000099 2026-10-20T03:10:00Z. The box with what's in readings: one row, f00d00000099 with ts 03:10:00Z, one row, not two. Bottom left, a pink dashed comparison box, if ts = the arrival time at the backend: two f00d00000099 rows, 03:10:00.021Z from send 1 and 03:10:00.538Z from send 2; two different ts values mean two twin rows, and the average goes off. The box with the two guards, as in Concept 10: 1, the primary key (device_id, ts) in the readings table; 2, ON CONFLICT … DO NOTHING, the resend is skipped without an error; the condition: ts is set by the device, not the arrival time at the backend.](assets/duplicate-send.png)

> ➡️ **Done reading Concept 10?** Continue to [Practice 5](#practice-5--backend-v02-stores-every-mqtt-message-40-minutes).

## 🔧 Step-by-step practice

### Practice 1 — Just enough Docker: containers, logs, and volumes (25 minutes)

> 🖥️ **Tools used:** the **VS Code terminal** (any folder), **Docker Desktop**, and **psql** inside the container.

The `smarthome-db` container from the Quick Win is already running. This practice teaches the five Docker commands you need throughout Phase 3, then proves Docker's most important promise for databases: **the data stays** even when its container is stopped (or even thrown away, as the tip box at the end of this practice explains).

#### 1.1 Look at the container and its log

```text
docker ps -a
docker logs smarthome-db
```

`docker ps` shows the containers that are running; the extra `-a` (for "all") also shows the stopped ones. Besides `smarthome-db`, the list also shows the container from `docker run hello-world` in 🐳 Setup: `hello-world` in the **IMAGE** column, `Exited (0) …` under **STATUS**, and a random name under **NAMES** (for example `eager_turing`), because that command didn't use `--name`. That container has already finished its job; just leave it, or delete it with `docker rm` followed by its random name. `docker logs` shows everything PostgreSQL has written since its container was created. This first log is long because PostgreSQL has just set up its cupboard. Scroll down to the bottom of it.

**Expected output** (example, the end of `docker logs`):

```text
PostgreSQL init process complete; ready for start up.

… UTC [1] LOG:  starting PostgreSQL 17.11 on x86_64-pc-linux-musl, …
… UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
… UTC [1] LOG:  listening on IPv6 address "::", port 5432
…
… UTC [1] LOG:  database system is ready to accept connections
… UTC [87] LOG:  TimescaleDB background worker launcher connected to shared catalogs
… UTC [82] LOG:  checkpoint starting: time
… UTC [82] LOG:  checkpoint complete: wrote 320 buffers (0.1%); …
```

The line **`database system is ready to accept connections`** means the database is ready to accept connections. The TimescaleDB line after it always appears too, every time the server starts. If the container has been running for more than five minutes, there's also a pair of lines below that, `checkpoint starting: time` and `checkpoint complete: …`. PostgreSQL regularly saves the contents of its memory to disk (once every five minutes, as long as there's new data), so that's normal too. At the very bottom, Docker Desktop adds three lines that start with `What's next:` (an invitation to open Docker Desktop's **Logs** view). They aren't part of the PostgreSQL log, and you can ignore them. The first time the container starts, the `ready to accept connections` line appears **twice**: once for a temporary server used while setting up the `smarthome` database, and once for the real server after `PostgreSQL init process complete`. The address `0.0.0.0` here is the address **inside** the container; from outside, the counter is still only open to your laptop's `127.0.0.1` (Concept 2). In Docker Desktop, you can see the same log by clicking the container's name in the **Containers** list → the **Logs** tab.

> [!NOTE]
> **The `WARNING`, `ERROR`, and `FATAL` lines in the first log are normal.** The log of the first setup holds a few lines that sound scary. They all come with this image, and none of them needs fixing:
>
> - `sh: locale: not found` and `WARNING:  no usable system locales were found`: the mini Linux inside the image doesn't include the `locale` program (the list of system languages). The database still uses UTF-8, so text in any language is safe.
> - `initdb: warning: enabling "trust" authentication for local connections` and the `initdb: hint: …` line below it: connections from **inside** the container aren't asked for a password. That's why psql in the Quick Win got straight in. Connections from the laptop (DBeaver and the backend) must still use the password.
> - `ERROR:  background worker "TimescaleDB Background Worker Scheduler for database 1" trying to connect to template database, exiting`: a TimescaleDB background worker tries to start in the template database, then backs off by itself.
> - Three `FATAL:  terminating background worker … due to administrator command` lines: the temporary server is shut down after the setup is finished, and its background workers are stopped along with it. `FATAL` here only means that the worker stopped, not that the database is broken. The same lines appear again every time the container is stopped with `docker stop`.
> - Small `alter_job` tables that mention `Telemetry Reporter`: a sign that `-e TIMESCALEDB_TELEMETRY=off` works, that is, the job that sends statistics is switched off. A list like `shared_buffers = …` after them shows the settings that `timescaledb-tune` calculates automatically from the RAM and CPU available to Docker.
>
> The only messages that need your attention are the ones at the **very bottom** of the log, after the last `database system is ready to accept connections` line (🚨 "The `smarthome-db` container stops by itself or won't start").

#### 1.2 Stop it and start it again

```text
docker stop smarthome-db
docker ps -a
docker start smarthome-db
```

`docker stop` shuts PostgreSQL down neatly (it finishes its writing first), and `docker start` starts it again. In between, `docker ps -a` shows the **STATUS** column of the `smarthome-db` row with `Exited (0) …` (for example `Exited (0) 3 seconds ago`), which means it stopped normally. **Don't** use `docker run` to start a container that already exists; `run` always creates a **new** container, and it will be refused because the name is already taken. In Docker Desktop, the **⏹** (stop) and **▶** (start) buttons on the container's row do the same thing.

#### 1.3 Prove that the data stays

Create a small test table, put one row in it, then stop the container and start it again.

1. Go into psql and create the test table:

   ```text
   docker exec -it smarthome-db psql -U postgres -d smarthome
   ```

   ```sql
   CREATE TABLE test (message text);
   INSERT INTO test VALUES ('hello from Module 17');
   SELECT * FROM test;
   \q
   ```

2. Stop the container and start it again: `docker stop smarthome-db`, then `docker start smarthome-db`. Both commands answer with the container's name. Wait about five seconds before going into psql again; if you're too quick, psql answers with an error that mentions `the database system is starting up` or `connection to server on socket`. Wait a moment, then try again.
3. Go into psql again and run `SELECT * FROM test;`.

**Expected output** (step 3):

```text
       message        
----------------------
 hello from Module 17
(1 row)
```

The row is still there. It isn't stored in the container, but in the `smarthome-data` **volume** (the cupboard in Concept 2). You can see that volume in Docker Desktop, in the **Volumes** menu, or in the terminal with `docker volume ls`: its answer has the columns `DRIVER` and `VOLUME NAME`, with a row that shows `local` and `smarthome-data`.

#### 1.4 Clean up the test table

Still in psql:

```sql
DROP TABLE test;
\q
```

`DROP TABLE` throws away a table along with everything in it, without asking. The test table isn't needed anymore. Starting in Practice 3, tables are created only through migrations.

> [!TIP]
> **When may the container be thrown away?** If you ever want to create the container again (for example to change the counter from 5432 to 5433), stop it and delete it with `docker stop smarthome-db` and `docker rm smarthome-db`, then run the Quick Win's `docker run` command again. The data stays safe in the `smarthome-data` volume, and the new container uses it right away. The only thing that deletes the data is deleting **the volume** (`docker volume rm smarthome-data`, or the delete button in the **Volumes** menu). Do that only if you really want to start from scratch.

> ⬆️ **Done with Practice 1?** Go back to [Concept 3](#3-tables-rows-columns-types-and-the-primary-key) (the ➡️ at the end of Concept 5 will take you to Practice 2).

### Practice 2 — DBeaver: a window into the database (30 minutes)

> 🖥️ **Tools used:** a **browser** (for downloading), **DBeaver**, the **VS Code terminal** (psql, for comparison), and **Docker Desktop** (the `smarthome-db` container running).

The psql window is very useful, but long tables are more comfortable to look at in a window you can scroll and click. **DBeaver** is a free app for viewing and working with databases: the list of tables on the left, an SQL editor in the middle, and the query results as a table below it. DBeaver is only a "window": the data stays in the database inside the container.

#### 2.1 Install DBeaver

1. Open the official download page [dbeaver.io/download](https://dbeaver.io/download/) and choose **DBeaver Community** (the free one) for your operating system: Windows (installer), or macOS for Apple silicon/Intel (check as in the 🐳 Setup section). It's about 114 MB on Windows and 124–125 MB on macOS. Java doesn't need to be installed separately, because DBeaver brings its own Java.
2. **Windows:** run the downloaded `dbeaver-ce-….exe` file, then follow the steps with the default choices. **macOS:** open the `.dmg` file, then drag **DBeaver** to the **Applications** folder.
3. Open DBeaver. The first time, the **Configure DBeaver** wizard (a guide for the first settings) appears:
   - **Appearance**: choose any theme you like, and for the database list view choose **Simplified** (only schemas and tables, without extra folders that get confusing).
   - **Features**: you can skip it.
   - **Data collection**: choose **Do not share anonymous usage statistics** if you don't want to send usage statistics (it's up to you).
   - **Final steps**: click **Apply**.
4. If DBeaver offers **Create sample database**, decline it. We use our own database.

#### 2.2 Connect to `smarthome`

1. Make sure the `smarthome-db` container is running (`docker ps`).
2. In DBeaver, click the **New Database Connection** button (the plug icon with a plus sign, at the top left) or press **Ctrl + Shift + N**.
3. On the **Select your database** page, choose **PostgreSQL**, then click **Next**.
4. Fill in the **Main** tab:

   | Field | Value |
   | :--- | :--- |
   | **Host** | `127.0.0.1` |
   | **Port** | `5432` (or `5433` if you used counter 5433 in the Quick Win) |
   | **Database** | `smarthome` |
   | **Username** | `postgres` |
   | **Password** | the password you chose in the Quick Win |
   | **Save password** | check it (on a personal laptop) so that you aren't asked every time |

5. Click **Test Connection ...** at the bottom left. The first time, DBeaver doesn't have the PostgreSQL driver (a "translator") yet, and it shows the **Setup driver files** window. Click **Download** and wait a moment. This needs the internet.
6. The right test result: a small window that says `Connected`, along with how long it took in milliseconds, and the PostgreSQL server version. Click **OK**, then **Finish**. If a **Connection error** window appears instead, read its message, then open 🚨 "DBeaver can't connect".

Your new connection appears in the left panel (**Connections**) with the name `smarthome`. Click the triangle next to it to open its contents down to the `public` schema. The **Simplified** view hides in-between folders such as **Schemas** and **Tables**, so the tables will later appear directly under `public` (in the **Full** view, the path is `smarthome` → **Schemas** → `public` → **Tables**). If you see other schemas whose names start with `_timescaledb` or `timescaledb_`, they belong to the TimescaleDB add-on (Module 18), so just leave them. `public` is still empty, because the Mini Smart Home tables are only created in Practice 3.

#### 2.3 Run your first query in DBeaver

1. Click the `smarthome` connection in the left panel, then choose the menu **SQL Editor** → **New SQL script** (or press **Ctrl + ]**; on macOS **Control + ]**, not **Cmd**). A new editor tab opens.
2. Type:

   ```sql
   SELECT now(), current_setting('TimeZone');
   ```

3. Put the cursor on that line, then press **Ctrl + Enter** (macOS: **Cmd + Enter**). The result appears as a table at the bottom.

Compare it with psql. Run `docker exec -it smarthome-db psql -U postgres -d smarthome` in the terminal, then type `SELECT now(), current_setting('TimeZone');`. **Expected output** in psql (example):

```text
              now              | current_setting 
-------------------------------+-----------------
 2026-10-20 03:42:10.512937+00 | UTC
(1 row)
```

In DBeaver, the `now` column shows a time that matches the wall clock, and the `current_setting` column holds your laptop's time zone (for example `Asia/Jakarta` or `Asia/Bangkok`, both UTC+7; in WITA and WIT, a zone that's 8 or 9 hours ahead of UTC), not `UTC`. The database and its data are the same; what's different is the **session zone**. DBeaver tells the database your laptop's time zone every time it connects, while psql inside the container uses the server's default, which is UTC (Concept 9). Remember this difference every time you compare times from two different windows. After that, leave psql with `\q` so that the terminal accepts ordinary commands again, such as `git` and `npm` in Practice 3.

#### 2.4 Three things you'll use often

- **Ctrl + Enter** runs **one** SQL statement, the one the cursor is on. **Alt + X** (macOS: **Option + X**) runs **all** the SQL statements in the editor in order, like a script.
- **Double-click a table** in the left panel to open three tabs: **Properties** (the columns and their types), **Data** (its contents, like a spreadsheet), and **Diagram** (a picture of the table's relations).
- **A script's contents are saved** as a `.sql` file in DBeaver's working folder. A new script gets an automatic name right away (`Script.sql`, then `Script-1.sql`, and so on), and **Ctrl + S** saves its contents without asking for a name. To give it a clear name, right-click inside the script text → **File** → **Rename SQL Script** (**Ctrl + F2**; on macOS **Control + F2**), type for example `first-query`, then click **OK**; the `.sql` ending is added by itself. (The name `practice-module17` is kept for the practice script in Practice 4.) You can open an existing script again through **SQL Editor** → **Open SQL script** (**F3**).

> [!WARNING]
> **Don't change the shape of the tables from DBeaver.** DBeaver can add columns or tables with a right-click, but changes like that aren't recorded in the repository (Concept 5). In this module, DBeaver is used for **looking** and for running practice SQL; the shape of the tables is changed only through migration files.

> ➡️ **Continue** to [Practice 3](#practice-3--the-mini-smart-home-schema-through-a-migration-40-minutes) without going back to the concepts.

### Practice 3 — The Mini Smart Home schema through a migration (40 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and two terminals (the first terminal for `npm run dev` later, the second terminal for other commands; both move to the `backend` folder in step 3.1), **DBeaver**, and **Docker Desktop** (the `smarthome-db` container running).

Since Module 16, every feature is built on its own branch, then merged through a pull request. All the Module 17 code work is done on one branch, `feature/database`, and merged into `main` in ➕ B.

#### 3.1 A new branch: `feature/database`

Open the `mini-smart-home` folder in VS Code, then open the first terminal (**Terminal → New Terminal**). A new terminal always starts in the `mini-smart-home` folder. Type `cd backend`, press **Enter**, then leave it; that terminal is only used for `npm run dev` in Practice 5. After that, open a second terminal with the **+** icon in the terminal panel. In the second terminal, make sure you're on the latest `main`, then create the branch and go into the `backend` folder:

```text
git switch main
git pull --prune
git switch -c feature/database
cd backend
```

**Expected output:** the third command (`git switch -c feature/database`) answers `Switched to a new branch 'feature/database'`, then `cd backend` moves the terminal to the `backend` folder without any answer. From now on, the practice commits go to this branch.

#### 3.2 Install `pg`

In the second terminal (the `backend` folder):

```text
npm install pg@8.23.1
npm install --save-dev @types/pg@8.23.1
```

**Expected output** (the first line of each command; the number of `packages` on your laptop may be slightly different):

```text
added 13 packages, and audited 146 packages in 2s
added 1 package, and audited 147 packages in 1s
```

`pg` is the library for talking to PostgreSQL (Concept 10). `@types/pg` holds the "type labels" for TypeScript, so that `npm run check` and VS Code know the functions of `pg`. Because it's only used when checking types, it's installed with `--save-dev`, just like `typescript` in Module 16.

#### 3.3 The database address in `.env`

The backend needs to know the database's address and its password. Like the broker's address in Module 16, that address is written in `.env`, not in the code. Open `.env` (the `backend` folder), then add one line at the bottom. Replace `change-this-password` with your password, and `5432` with `5433` if you use counter 5433:

```text
DATABASE_URL=postgres://postgres:change-this-password@127.0.0.1:5432/smarthome
```

You read that address like a web address:

| Part | What it means |
| :--- | :--- |
| `postgres://` | the kind of address: a PostgreSQL database |
| `postgres:change-this-password` | `username:password` |
| `@127.0.0.1:5432` | `@address:port`: this laptop, counter 5432 |
| `/smarthome` | the database name |

Then open `.env.example` (the example file that goes to GitHub) and make its contents match this, **with the example password, not yours**. Leave any extra settings that are already there, for example `FAN_AUTOMATION=` from 🧩 Module 16:

```text
# Copy this file to .env, then adjust its contents. The .env file doesn't go into Git (see .gitignore).
MQTT_URL=mqtt://192.168.1.37:1883
PORT=8080
HOST=127.0.0.1
# the PostgreSQL database in a Docker container (Module 17); replace change-this-password with a password of your choice
DATABASE_URL=postgres://postgres:change-this-password@127.0.0.1:5432/smarthome
```

Finally, tell `src/config/env.ts` that this new setting is **required**. Add one `DATABASE_URL` line below `MQTT_URL`, so that its contents become as shown below. If your `env.ts` has extra settings from 🧩 Module 16 (for example `FAN_AUTOMATION`), don't delete them:

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
  DATABASE_URL: required("DATABASE_URL"), // the database's address, for example postgres://postgres:<password>@127.0.0.1:5432/smarthome
  PORT: Number(process.env.PORT || 8080), // the server's counter (port) number
  HOST: process.env.HOST || "127.0.0.1", // 127.0.0.1 = only reachable from this laptop
};
```

If you forget to fill in `DATABASE_URL`, the server and the migration program stop right away with the message `Setting DATABASE_URL is empty. Copy .env.example to .env, fill in DATABASE_URL, then run again.`, exactly like `MQTT_URL` in Module 16.

#### 3.4 The connection pool: `src/db/pool.ts`

Create a new folder `src/db`, then a file `pool.ts` inside it:

```ts
// pool.ts - a "pool" of connections to the PostgreSQL database, shared by the whole backend.
import { Pool } from "pg";
import { env } from "../config/env.ts";

export const pool = new Pool({
  connectionString: env.DATABASE_URL, // postgres://postgres:<password>@127.0.0.1:5432/smarthome
  max: 5, // at most 5 connections at once; enough for one small backend
  connectionTimeoutMillis: 5000, // give up if the database doesn't answer within 5 seconds
});

// an idle connection can drop (for example when the database container is stopped): log it, don't crash the server
pool.on("error", (error) => console.error(`database error: ${error.message}`));
```

- **`new Pool({ … })`** creates a connection pool: several connections to the database that are opened once and then used in turns. Opening a new connection for every query is slow. Concept 10 goes deeper. The pool doesn't connect to anything yet when it's created; connections are opened when the first query runs.
- **`max: 5`**: at most five connections at once. The `pg` default is 10; five is more than enough for one small backend.
- **`connectionTimeoutMillis: 5000`**: if the database doesn't answer within 5 seconds (for example a database on a Raspberry Pi that's switched off), the query fails with a clear message instead of waiting a long time. A stopped container, by contrast, is refused right away with `ECONNREFUSED`. The `pg` default is to wait forever.
- **`pool.on("error", …)`**: an idle connection can drop, for example when the container is stopped. Without this line, a dropped connection like that would crash the whole backend. With this line, the event is only logged.

This file uses `env` from `env.ts`, so every program that uses `pool` automatically checks `.env` too.

#### 3.5 The first migration: `migrations/001_initial_schema.sql`

Create a `migrations` folder **directly inside `backend`** (next to `src`, not inside it), then the file `001_initial_schema.sql`:

```sql
-- 001_initial_schema.sql - the initial schema of the Mini Smart Home database (Module 17).
-- One table for each kind of data. Every time is a timestamptz: stored in UTC, shown in the session time zone.

-- Devices ever heard. The backend creates a device's row automatically when its first message arrives.
CREATE TABLE devices (
  device_id  text PRIMARY KEY CHECK (device_id ~ '^[0-9a-f]{12}$'),
  kind       text NOT NULL DEFAULT 'unknown' CHECK (kind IN ('node1', 'node2', 'unknown')),
  name       text,             -- an easy-to-remember name, for example 'Node 1 living room' (filled in by a person)
  location   text,             -- for example 'living room' or 'back garden'
  lat        double precision CHECK (lat BETWEEN -90 AND 90),
  lng        double precision CHECK (lng BETWEEN -180 AND 180),
  status     text NOT NULL DEFAULT 'unknown',
  last_seen  timestamptz,      -- server time when this device's last message arrived
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One row for every telemetry message. A column the device doesn't have holds NULL.
CREATE TABLE readings (
  device_id        text NOT NULL REFERENCES devices (device_id),
  ts               timestamptz NOT NULL,                -- the reading time from the device (contract section 4)
  received_at      timestamptz NOT NULL DEFAULT now(),  -- when the message arrived at the backend
  fw               text NOT NULL,
  temperature      double precision,
  humidity         integer,
  light            integer,
  soil             integer,
  motion           boolean,
  water_level      integer,
  pressure         double precision,
  soil_temperature double precision,
  battery          double precision,
  soil_rs485       double precision,
  ec               integer,
  PRIMARY KEY (device_id, ts)                           -- one reading per device per time: a duplicate send is refused
);

-- Device health from the vitals messages (contract section 6).
CREATE TABLE device_health (
  device_id text NOT NULL REFERENCES devices (device_id),
  ts        timestamptz NOT NULL,
  rssi      integer NOT NULL,
  uptime_s  integer NOT NULL,
  heap_free integer NOT NULL,
  PRIMARY KEY (device_id, ts)
);

-- Every command from the API with its ack answer (contract sections 7-8).
CREATE TABLE commands (
  id          text PRIMARY KEY,                      -- the command id, for example c-20261020-041128-1
  device_id   text NOT NULL REFERENCES devices (device_id),
  sent_at     timestamptz NOT NULL DEFAULT now(),
  target      text NOT NULL,
  value       jsonb NOT NULL,                        -- true/false for the lamp and the fan, a number for the pump and the curtain
  ack_ok      boolean,                               -- NULL = no ack within 5 seconds
  ack_message text,
  wait_ms     integer
);

-- Prepared now, used later: user accounts (Module 20 adds passwords and login).
CREATE TABLE users (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      text NOT NULL UNIQUE,
  name       text NOT NULL,
  role       text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prepared now, used later: automation rules (Module 19), for example "temperature above 30 -> fan on".
CREATE TABLE rules (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  condition  jsonb NOT NULL,
  action     jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

It holds the six tables of Concept 4, in one file. Things worth noticing:

- **`readings`** holds all the sensor fields of data contract 1.2, with the composite primary key `PRIMARY KEY (device_id, ts)` on its last line (Concept 10). The column `received_at DEFAULT now()` fills itself in with the server's time when the row is stored.
- **`device_health`** is also keyed on `(device_id, ts)`, because `vitals` can be resent just like `telemetry`.
- **`commands`** is keyed on `id`, the `c-…` command id from Module 16. The `value` column has the type `jsonb`, because a command's value can be `true`/`false` (the lamp, the fan) or a number (the pump, the curtain).
- **`users`** and **`rules`** use **`GENERATED ALWAYS AS IDENTITY`**: an automatic sequence number (1, 2, 3, …) that the database fills in itself. Both tables are deliberately not used yet this week. Modules 19 and 20 add their columns through migrations `002`, `003`, and so on. The `email` column in `users` is marked **`UNIQUE`**: just like a primary key, its values may not repeat, so one email belongs to one account only.

#### 3.6 The migration runner: `src/db/migrate.ts`

Create the file `src/db/migrate.ts`:

```ts
// migrate.ts - runs the SQL files in the migrations/ folder that haven't been run yet, in the order of their numbers.
// Run from the backend folder: npm run migrate
import { readdir, readFile } from "node:fs/promises";
import { pool } from "./pool.ts";

const FOLDER = new URL("../../migrations/", import.meta.url); // the backend/migrations/ folder

// the migration logbook: one row for every file that has already been run
await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);
const done = await pool.query<{ version: string }>("SELECT version FROM schema_migrations");
const recorded = new Set(done.rows.map((row) => row.version));
const all = (await readdir(FOLDER)).filter((name) => name.endsWith(".sql")).sort(); // 001_…, 002_…, and so on

let applied = 0;
for (const name of all) {
  if (recorded.has(name)) continue; // already run before: skip it
  const sql = await readFile(new URL(name, FOLDER), "utf8");
  const client = await pool.connect(); // one dedicated connection, so that BEGIN and COMMIT happen on the same connection
  try {
    await client.query("BEGIN"); // the whole file succeeds, or nothing changes at all
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [name]);
    await client.query("COMMIT");
    console.log(`applied: ${name}`);
    applied++;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`FAILED in ${name}: ${(error as Error).message}`);
    process.exitCode = 1; // npm reports the failure
    break; // don't go on to the next file
  } finally {
    client.release(); // give the connection back to the pool
  }
}
console.log(`${applied} new migration(s) applied, ${recorded.size} applied earlier.`);
await pool.end(); // close the pool so that the program ends
```

How it works, from top to bottom:

1. **`FOLDER`** points to the `backend/migrations/` folder. `import.meta.url` is the address of the `migrate.ts` file itself, so `../../migrations/` means "go up two folders from `src/db`, then into `migrations`".
2. **The logbook**: the `schema_migrations` table is created if it doesn't exist yet (`IF NOT EXISTS`). Every row holds the name of a migration file that has been run, and when.
3. **The list of files**: all the `.sql` files in that folder, sorted by name. That's why their names start with a three-digit number (`001_`, `002_`): the order of the names is the same as the order of the numbers.
4. **For every file that isn't recorded yet**, one connection is borrowed from the pool (`pool.connect()`), then `BEGIN`, the file's contents, the record in `schema_migrations`, and `COMMIT` are run on that same connection. If anything fails, `ROLLBACK` undoes all of it, the program prints `FAILED in …`, then stops. A transaction must use **one and the same** connection from start to finish; a plain `pool.query` may well use a different connection for every query.
5. **`pool.end()`** closes the pool at the end. Without it, the program stays "on" for about 10 more seconds, waiting for `pg` to close the idle connections by itself.

Finally, register the command in `package.json`. In the `"scripts"` section, add the `migrate` line after `check` (don't forget the comma at the end of the `check` line):

```json
"scripts": {
  "dev": "node --watch --env-file=.env src/server.ts",
  "start": "node --env-file=.env src/server.ts",
  "check": "tsc --noEmit",
  "migrate": "node --env-file=.env src/db/migrate.ts"
},
```

#### 3.7 Run the migration

In the second terminal (the `backend` folder):

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.1.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 001_initial_schema.sql
1 new migration(s) applied, 0 applied earlier.
```

Run it once more. This time nothing is run again:

```text
0 new migration(s) applied, 1 applied earlier.
```

That's an important property of migrations: they're safe to repeat. If you get an error instead, see 🚨 "`npm run migrate` fails".

#### 3.8 Look at the tables

**In DBeaver:** click the `smarthome` connection in the left panel, press **F5** (refresh), then open its contents down to `public` (in the **Full** view: **Schemas** → `public` → **Tables**). There are seven tables: the six Mini Smart Home tables plus `schema_migrations`. Double-click `readings`, then open the **Diagram** tab: DBeaver draws that table along with its relation line to `devices`, like part of the schema picture in [Concept 4](#4-relations-and-the-mini-smart-home-schema-tables-that-point-to-each-other).

**In psql** (`docker exec -it smarthome-db psql -U postgres -d smarthome`), the command `\dt` (describe tables) shows the list of tables, and `\d readings` shows its columns. The answer to `\d readings` is quite long: if psql stops with `--More--` on the bottom line, press **Space** to continue or **q** to stop. As soon as `smarthome=#` appears again, the list is finished, so there's no need to press **q** (the letter would just end up typed into psql). When you're done, leave with `\q` before running `npm run check` in 3.9. **Expected output** (`\dt`):

```text
               List of relations
 Schema |       Name        | Type  |  Owner   
--------+-------------------+-------+----------
 public | commands          | table | postgres
 public | device_health     | table | postgres
 public | devices           | table | postgres
 public | readings          | table | postgres
 public | rules             | table | postgres
 public | schema_migrations | table | postgres
 public | users             | table | postgres
(7 rows)
```

#### 3.9 Check and save

In the second terminal (the `backend` folder), run `npm run check`. The result must be clean, without a single `error`. Then save your work to the `feature/database` branch. Run the first two commands first and check the list (see the paragraph below the block) before you run `git commit` and `git push`:

```text
git add .
git status
git commit -m "Initial database schema through migration 001 (Module 17 Practice 3)"
git push -u origin feature/database
```

In the `Changes to be committed` section, `git status` must list three new files (`migrations/001_initial_schema.sql`, `src/db/migrate.ts`, `src/db/pool.ts`) and four changed files (`.env.example`, `package-lock.json`, `package.json`, `src/config/env.ts`), but **not** `.env`. If `.env` shows up too, take it out with `git restore --staged .env`, then check your `.gitignore` (Module 16 Practice 2). The first `git push -u` for this new branch also creates the branch on GitHub (Module 16 Practice 8).

> ⬆️ **Done with Practice 3?** Go back to [Concept 6](#6-sql-asks-select-where-order-by-and-limit) (the ➡️ at the end of Concept 9 will take you to Practice 4).

### Practice 4 — Basic SQL with 7 days of practice data (75 minutes)

> 🖥️ **Tools used:** the **VS Code terminal** (the second terminal, the `backend` folder), **DBeaver** (the SQL editor), and **Docker Desktop** (the `smarthome-db` container running; open the app first if you're continuing on another day). All the queries can also be run in psql.
>
> ⭐ **Required** — completion requirement: writing the SQL for "the average temperature per day over the last 7 days" without a cheat sheet.

Learning SQL needs data, and waiting a week for Node 1 to collect readings takes too long. This practice uses a script that fills the database with **practice data**: two practice devices, one reading every 10 minutes, going back 7 days.

#### 4.1 The history seeding script: `src/db/seed-history.ts`

Create the file `src/db/seed-history.ts`:

```ts
// seed-history.ts - fills the database with a fake 7-day history for SQL practice (Module 17 Practice 4).
// Two practice devices, one reading every 10 minutes, from 00:00 WIB seven days ago until now.
// The numbers come from formulas + "dice" with a fixed seed, so every full day's average is the same on any laptop.
// Run from the backend folder: npm run seed-history (safe to repeat: readings that already exist are skipped)
import { pool } from "./pool.ts";

const STEP_MS = 10 * 60 * 1000; // one reading every 10 minutes
const DAY_MS = 24 * 60 * 60 * 1000;
const WIB_MS = 7 * 60 * 60 * 1000; // WIB = UTC + 7 hours
const WEATHER = [0.2, -0.4, 0.5, 1.1, 0.7, -0.2, 0.3, 0.0]; // degrees warmer/cooler per day, from day 0 (seven days ago)

const DEVICES = [
  { device_id: "f00d00000001", name: "Practice living room", location: "living room", lat: -6.2, lng: 106.8, warmth: 0, dryness: 1.0 },
  { device_id: "f00d00000002", name: "Practice porch", location: "porch", lat: -6.2, lng: 106.8, warmth: 1.5, dryness: 1.4 },
];

// seeded "dice" (mulberry32): the same seed always gives the same sequence of random numbers
function dice(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const oneDecimal = (x: number) => Math.round(x * 10) / 10;

// the start of today in WIB, in UTC milliseconds
const now = Date.now();
const startOfToday = Math.floor((now + WIB_MS) / DAY_MS) * DAY_MS - WIB_MS;
const start = startOfToday - 7 * DAY_MS;

for (const [index, p] of DEVICES.entries()) {
  await pool.query(
    `INSERT INTO devices (device_id, kind, name, location, lat, lng) VALUES ($1, 'node1', $2, $3, $4, $5)
     ON CONFLICT (device_id) DO UPDATE SET name = $2, location = $3, lat = $4, lng = $5`,
    [p.device_id, p.name, p.location, p.lat, p.lng],
  );
  const columns = { ts: [] as string[], temperature: [] as number[], humidity: [] as number[], light: [] as number[],
    soil: [] as number[], motion: [] as boolean[], water_level: [] as number[] };
  let soil = 62;
  for (let ts = start; ts <= now; ts += STEP_MS) {
    const dayIndex = Math.floor((ts - start) / DAY_MS); // 0 = seven days ago ... 7 = today
    const minute = Math.round(((ts - start) % DAY_MS) / 60000); // minutes since 00:00 WIB
    const roll = dice((index + 1) * 100000 + dayIndex * 1000 + minute / 10); // one seed per device, day, and time of day
    const hour = minute / 60;
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI)); // 0 at night, 1 around 12:00
    const temperature = 26 + p.warmth + WEATHER[dayIndex] + 4 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) + (roll() - 0.5);
    if (minute === 6 * 60 || minute === 18 * 60) soil = 68; // watered automatically at 06:00 and 18:00 WIB
    else soil -= (0.15 + 0.35 * daylight) * p.dryness * (0.8 + 0.4 * roll()); // drier and drier, especially in the daytime
    columns.ts.push(new Date(ts).toISOString());
    columns.temperature.push(oneDecimal(temperature));
    columns.humidity.push(Math.round(80 - 12 * daylight + 4 * (roll() - 0.5)));
    columns.light.push(Math.round(3400 * daylight + 60 * roll()));
    columns.soil.push(Math.max(0, Math.round(soil)));
    columns.motion.push(roll() < (hour >= 7 && hour < 22 ? 0.3 : 0.03));
    columns.water_level.push(Math.max(5, 90 - Math.round(minute / 30)));
  }
  // batch insert: every column is sent as an array in ONE statement, then unnest unpacks the arrays into rows
  const result = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level)
     SELECT $1, ts, '1.4.0', temperature, humidity, light, soil, motion, water_level
     FROM unnest($2::timestamptz[], $3::float8[], $4::int[], $5::int[], $6::int[], $7::bool[], $8::int[])
       AS b(ts, temperature, humidity, light, soil, motion, water_level)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [p.device_id, columns.ts, columns.temperature, columns.humidity, columns.light, columns.soil, columns.motion, columns.water_level],
  );
  console.log(`${p.device_id}: ${columns.ts.length} readings sent, ${result.rowCount} newly stored`);
}
await pool.end();
```

You don't need to understand every formula. What matters:

- **Two practice devices**: `f00d00000001` (the living room) and `f00d00000002` (the porch, a little warmer and drying out faster). Both are recorded in `devices` first, with their names, locations, and coordinates, because `readings` only accepts devices that are already registered (Concept 4). `ON CONFLICT (device_id) DO UPDATE` means "if the device already exists, just update those columns".
- **Sensible patterns**: the temperature rises in the daytime and drops at night, there's light only between 06:00 and 18:00 WIB, and the soil gets drier and drier until it's watered automatically at 06:00 and 18:00.
- **Seeded "dice"**: the random numbers are made from a fixed seed, so the daily averages on your laptop are the same as the example in this module. Only the dates are different, following the day you run it.
- **Batch insert** (inserting everything at once): thousands of readings aren't sent one by one. Every column is collected into one array, then everything is sent in **one** `INSERT … SELECT … FROM unnest(…)` command. The `unnest` function on the database side unpacks those arrays back into rows. A thousand readings per device are stored in an instant.
- **`ON CONFLICT (device_id, ts) DO NOTHING`**: running this script twice doesn't duplicate the data (Concept 10).

Register the command in `package.json`. Add this line in the `"scripts"` section, after `migrate` (put a comma at the end of the `migrate` line):

```json
"seed-history": "node --env-file=.env src/db/seed-history.ts"
```

#### 4.2 Fill in the data

In the second terminal (the `backend` folder), run the command **twice**:

```text
npm run seed-history
npm run seed-history
```

**Expected output** (the first number depends on what time you run it: 1,008 readings for seven full days, plus one reading for every 10 minutes of today, so at most 1,152; this example was run at about 00:15 WIB):

```text
f00d00000001: 1010 readings sent, 1010 newly stored
f00d00000002: 1010 readings sent, 1010 newly stored
```

and on the second run:

```text
f00d00000001: 1010 readings sent, 0 newly stored
f00d00000002: 1010 readings sent, 0 newly stored
```

The second run sends more than a thousand of the same readings, and **not a single one** is stored twice. That's how `ON CONFLICT DO NOTHING` works, on a large scale. (If the second run crosses a 10-minute boundary, for example from 00:19 to 00:20, the reading for those new 10 minutes really is new, so the result is `1011 readings sent, 1 newly stored`.)

> [!IMPORTANT]
> **Do 4.5–4.8 on the same day as this step.** The numbers in the Expected output boxes are tied to dates, counted from the day you fill in the practice data: the day before is always `26.3`, two days before `25.8`, and so on. If you run the queries on another day, "the last seven days" shift too. The top row disappears, and the bottom row is the fill-in day, whose data isn't complete yet (on the simulator path, it's also mixed with simulator readings from Practice 5 on). Continuing on another day? First empty the practice readings in DBeaver with `DELETE FROM readings WHERE device_id IN ('f00d00000001', 'f00d00000002');`, then run `npm run seed-history` once more in the second terminal. The numbers match the module exactly again; only the dates follow that day.

#### 4.3 Browse the data

Open DBeaver, click the `smarthome` connection, then create a new script (**SQL Editor** → **New SQL script**). Name it `practice-module17` with a right-click inside the script text → **File** → **Rename SQL Script** → **OK**, as in 2.4. After that, **Ctrl + S** is enough to save its contents. Type the queries below one at a time, then run each one with **Ctrl + Enter**.

**The five latest readings** of the living room device:

```sql
SELECT ts, temperature, humidity, soil
FROM readings
WHERE device_id = 'f00d00000001'
ORDER BY ts DESC
LIMIT 5;
```

**Expected output** (an example from psql; the time of the latest reading follows when you ran `seed-history`, and so do the numbers, which change throughout the day):

```text
           ts           | temperature | humidity | soil 
------------------------+-------------+----------+------
 2026-10-19 17:10:00+00 |          23 |       80 |   63
 2026-10-19 17:00:00+00 |        22.8 |       82 |   63
 2026-10-19 16:50:00+00 |        23.2 |       82 |   63
 2026-10-19 16:40:00+00 |        23.5 |       78 |   63
 2026-10-19 16:30:00+00 |        23.6 |       79 |   63
(5 rows)
```

In psql, `ts` is shown in UTC (`+00`), while DBeaver shows it in your laptop's time, so the latest reading, `17:10` UTC, shows up as `00:10` (on the 20th, WIB) in DBeaver. One and the same reading, two ways of writing it (Concept 9). The temperature `23` is `23.0`; psql doesn't write the zero after the decimal point.

Try it yourself too: remove the `WHERE` to see the readings of both devices, replace `DESC` with `ASC` to see the **oldest** readings, or add the condition `AND temperature > 30` to see the hottest moments.

#### 4.4 Change data, safely

Still in the same script. Change the name and location of the first practice device, then check the result:

```sql
UPDATE devices SET name = 'Practice family room', location = 'family room' WHERE device_id = 'f00d00000001';
SELECT device_id, kind, name, location FROM devices WHERE device_id LIKE 'f00d%' ORDER BY device_id;
```

**Expected output** (psql; in DBeaver, the number of changed rows shows up in the results panel):

```text
UPDATE 1
  device_id   | kind  |         name         |  location   
--------------+-------+----------------------+-------------
 f00d00000001 | node1 | Practice family room | family room
 f00d00000002 | node1 | Practice porch       | porch
(2 rows)
```

`UPDATE 1` means exactly one row changed, as expected. `LIKE 'f00d%'` means "starts with `f00d`" (`%` stands for any text). Now add and then delete a test device:

```sql
INSERT INTO devices (device_id, name, location) VALUES ('f00d000000ff', 'Test device', 'storeroom');
DELETE FROM devices WHERE device_id = 'f00d000000ff';
```

psql's answers: `INSERT 0 1` and `DELETE 1`. Now try to delete a device that **has** readings:

```sql
DELETE FROM devices WHERE device_id = 'f00d00000001';
```

**Expected output:**

```text
ERROR:  update or delete on table "devices" violates foreign key constraint "readings_device_id_fkey" on table "readings"
DETAIL:  Key (device_id)=(f00d00000001) is still referenced from table "readings".
```

The database refuses because more than a thousand readings in `readings` still point to that device (Concept 4). A refusal like this is a guard, not a nuisance. Put its name and location back:

```sql
UPDATE devices SET name = 'Practice living room', location = 'living room' WHERE device_id = 'f00d00000001';
```

#### 4.5 ⭐ Average temperature per day, last 7 days

This is the completion-requirement query. Type it yourself (don't copy it) so that you get a feel for every part of it:

```sql
SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS day,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY day
ORDER BY day;
```

**Expected output** (your dates follow today; the `avg_temp` and `count` numbers are the same if the practice data was filled in today, see the box in 4.2; for the practice data, readers in WITA and WIT also keep using `'Asia/Jakarta'`, see Concept 9):

```text
    day     | avg_temp | count 
------------+----------+-------
 2026-10-13 |     26.2 |   144
 2026-10-14 |     25.6 |   144
 2026-10-15 |     26.5 |   144
 2026-10-16 |     27.1 |   144
 2026-10-17 |     26.7 |   144
 2026-10-18 |     25.8 |   144
 2026-10-19 |     26.3 |   144
(7 rows)
```

Read it in the order the database works through it, which is different from the order it's written in (`SELECT` is written first, but it's done after the rows are grouped):

1. **`FROM readings WHERE …`**: take the living room device's readings from 00:00 WIB seven days ago until just before 00:00 WIB today. Today is deliberately left out because it isn't complete yet.
2. **`GROUP BY day`**: group per **WIB** date (Concept 9). Without `AT TIME ZONE 'Asia/Jakarta'`, the date follows the session zone: in psql (UTC), readings from 00:00–06:59 WIB end up on the previous day's date, even though it looks right in DBeaver. With `AT TIME ZONE`, the result is the same wherever the query runs.
3. **`round(avg(temperature)::numeric, 1)`**: the average temperature of each group, rounded to one digit after the decimal point (Concept 8).
4. **`count(*)`**: the number of readings per day. The number 144 = 24 hours × 6 readings per hour (every 10 minutes), so no reading is missing or doubled.
5. **`ORDER BY day`**: sort from the oldest day.

![Diagram of the Practice 4.5 completion-requirement query, the average temperature per day, read in the order the database works through it, for the practice device f00d00000001, with the query run on October 20, 2026. There are three columns from left to right with five numbers. The left column, number 1, FROM readings WHERE …, takes the readings of device f00d00000001 from 00:00 WIB on October 13 until just before 00:00 WIB on October 20. Its small table has the columns ts (WIB) and temperature, holding 2026-10-13 00:00 with 23.3, 00:10 with 23.3, and 00:20 with 22.7, then dots, 2026-10-14 00:00 with 22.3, more dots, and 2026-10-19 23:40 with 23.5 and 23:50 with 23.2; in total 1,008 readings, that is, 7 days × 144 readings. Below it, it says that today (Oct 20) is left out because it isn't complete yet. An arrow leads to the middle column, number 2, GROUP BY day, per WIB date through AT TIME ZONE 'Asia/Jakarta', holding seven blue boxes, 2026-10-13 to 2026-10-19, each with 144 readings, with the note 7 groups, one per date. From every box, an arrow leads to one row in the right column, Result, one row per group, seven rows, the same as the Expected output box in 4.5. The result table has the columns day (number 5), avg_temp (number 3), and count (number 4), holding 2026-10-13 with 26.2, 2026-10-14 with 25.6, 2026-10-15 with 26.5, 2026-10-16 with 27.1, 2026-10-17 with 26.7, 2026-10-18 with 25.8, and 2026-10-19 with 26.3, all with a count of 144. Notes below the table: 3, round(avg(temperature)::numeric, 1), the average with one digit after the decimal point; 4, count(*), the number of readings, 144 = 24 hours × 6 readings per hour; 5, ORDER BY day, sort from the oldest day.](assets/daily-average-query.png)

For a real device, replace `'f00d00000001'` with your Node 1's `device_id`, after backend v0.2 has collected its data for a few days (Practice 5). In ✅, you write this query again without looking at the module.

#### 4.6 `JOIN`: yesterday's average temperature per location

```sql
SELECT d.location, d.name, round(avg(r.temperature)::numeric, 1) AS avg_temp
FROM readings AS r
JOIN devices AS d ON d.device_id = r.device_id
WHERE r.ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '1 day'
  AND r.ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY d.location, d.name
ORDER BY avg_temp DESC;
```

**Expected output:**

```text
  location   |         name         | avg_temp 
-------------+----------------------+----------
 porch       | Practice porch       |     27.8
 living room | Practice living room |     26.3
(2 rows)
```

`readings` knows nothing about locations. The location comes from `devices` through `JOIN … ON d.device_id = r.device_id` (Concept 8). If backend v0.2 already stored real Node 1 and Node 2 readings yesterday, both show up here too. As long as the `name` and `location` of those two devices are still empty, their readings are merged into **one** empty row, because `GROUP BY` treats all `NULL`s as one group. Fill in the columns with `UPDATE devices SET name = …, location = … WHERE device_id = …` (Practice 5.7).

#### 4.7 What time was the soil driest each day?

```sql
SELECT DISTINCT ON (day) day, hour, soil
FROM (
  SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS day,
         to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') AS hour,
         soil
  FROM readings
  WHERE device_id = 'f00d00000001'
    AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
    AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
) AS per_reading
ORDER BY day, soil, hour;
```

**Expected output:**

```text
    day     | hour  | soil 
------------+-------+------
 2026-10-13 | 17:10 |   42
 2026-10-14 | 17:50 |   41
 2026-10-15 | 17:10 |   42
 2026-10-16 | 17:10 |   42
 2026-10-17 | 17:30 |   40
 2026-10-18 | 17:20 |   41
 2026-10-19 | 17:20 |   42
(7 rows)
```

This query is a little more advanced and isn't part of the completion requirements. To get a feel for it, first run only the query inside its parentheses: in DBeaver, highlight the text from `SELECT (ts AT TIME ZONE` to the end of the line just above `) AS per_reading` (don't include the `)` at the start of the `) AS per_reading` line), then press **Ctrl + Enter** (DBeaver runs the highlighted text). The result is one row for every reading, complete with its WIB date and time. After that, run the whole query, then read it in two steps:

1. **The query inside the parentheses** (a subquery, a query inside a query) prepares three columns for every reading: the WIB date, the WIB time as `HH24:MI` text (for example `17:10`), and the `soil` value. Its result is named `per_reading`.
2. **`DISTINCT ON (day)`** takes only the **first row** of each day, after sorting by `ORDER BY day, soil, hour`. Within each day, the first row is the one with the smallest `soil`, that is, the driest. If two are equally dry, the earlier time wins.

The answer is clear: the soil is always driest around 17:10–17:50, after the midday heat and right before the 18:00 watering. Questions like this are what make a database worth the effort. In Module 19, an answer like this can become an automatic watering rule.

#### 4.8 Try it yourself

Write the queries in `practice-module17.sql`, run them, then compare with the key below.

1. The **highest** temperature of each day over the last 7 days on the porch (`f00d00000002`).
2. **How many times** motion was detected (`motion = true`) each day in the living room.
3. The average `light` for each **hour** (00 to 23) yesterday in the living room. Hint: `to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24')`.

<details>
<summary><b>Practice 4.8 answer key</b></summary>

```sql
-- 1. the highest temperature per day on the porch
SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS day, max(temperature) AS max_temp
FROM readings
WHERE device_id = 'f00d00000002'
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY day
ORDER BY day;

-- 2. the number of motion detections per day in the living room
SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS day, count(*) AS motion_count
FROM readings
WHERE device_id = 'f00d00000001' AND motion = true
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY day
ORDER BY day;

-- 3. the average light per hour yesterday in the living room
SELECT to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24') AS hour, round(avg(light)) AS avg_light
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '1 day'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY hour
ORDER BY hour;
```

The results of query 1, from the oldest day to yesterday: `32`, `31.5`, `32.3`, `33`, `32.6`, `31.7`, and `32.1`. The results of query 2: `26`, `22`, `29`, `37`, `31`, `32`, and `25` motion detections. In query 3, `light` has the type `integer`, and the `avg` of whole numbers already has the type `numeric`, so `round(…)` without a number of decimal places can be used right away. The result: about 20–40 (just sensor noise, because it's dark) before 06:00 and after 18:00, then rising to its peak, about 3,400, in hours 11 and 12.

</details>

#### 4.9 Save

In the second terminal (the `backend` folder):

```text
git add .
git commit -m "7-day practice data script (Module 17 Practice 4)"
git push
```

Your `practice-module17.sql` file is saved in DBeaver's working folder, not in the repository. Later, in ➕ C, you copy its contents to the `learn-iot` repository as `module-17/practice.sql`, so for now just make sure the script is saved (**Ctrl + S**).

> ⬆️ **Done with Practice 4?** Go back to [Concept 10](#10-from-the-backend-the-pool-the-1-parameter-and-duplicate-sends).

### Practice 5 — Backend v0.2 stores every MQTT message (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal for `npm run dev`, the second terminal for other commands, both in the `backend` folder), **DBeaver**, **Docker Desktop** (the `smarthome-db` container running), and the Pi gateway with Node 1 and Node 2 switched on. Laptop path: the laptop broker from Module 12 Practice 7 must already be running. Simulator path: open a third terminal (the **+** icon), then run `cd tools` and `node device-simulator.js mqtt://192.168.1.37:1883` with your own broker's address, as in Module 16 Practice 7.2.
>
> ⭐ **Required** — completion requirement: the history API (Practice 7) returns data from the database, and that data is collected in this practice.

Now the archive book gets attached to the backend. Every message that passes the contract check is still written to the notice board (the in-memory store, as in Module 16), **and** now to the database too.

#### 5.1 The archive writer: `src/db/archive.ts`

Create the file `src/db/archive.ts`:

```ts
// archive.ts - writes the messages that passed the contract checks to the database.
// The in-memory store (store.ts) remains the "notice board" for the latest state; the database is its archive book.
import { pool } from "./pool.ts";
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

// Make sure the device has a row in the devices table (created if it isn't there yet), then update when it was last heard.
// Columns that aren't given (null) don't overwrite the old values, thanks to coalesce.
async function recordDevice(deviceId: string, kind: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id, kind, status, last_seen)
     VALUES ($1, coalesce($2, 'unknown'), coalesce($3, 'unknown'), now())
     ON CONFLICT (device_id) DO UPDATE SET
       kind = coalesce($2, devices.kind),
       status = coalesce($3, devices.status),
       last_seen = now()`,
    [deviceId, kind, status],
  );
}

// Stores one telemetry message. The result is false if a reading with the same ts is already stored (a duplicate send).
export async function archiveTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): Promise<boolean> {
  const n2 = "pressure" in content ? content : null; // Node 2 is recognized by the pressure column (contract 1.2), as in store.ts
  const n1 = "pressure" in content ? null : content; // otherwise, Node 1 telemetry
  await recordDevice(deviceId, n2 ? "node2" : "node1", null);
  const result = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level,
                           pressure, soil_temperature, battery, soil_rs485, ec)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, content.ts, content.fw, content.temperature, content.humidity, n1?.light ?? null, content.soil, n1?.motion ?? null,
      n1?.water_level ?? null, n2?.pressure ?? null, content.soil_temperature ?? null, n2?.battery ?? null,
      n1?.soil_rs485 ?? null, n1?.ec ?? null],
  );
  return result.rowCount === 1;
}

export async function archiveStatus(deviceId: string, status: Status): Promise<void> {
  await recordDevice(deviceId, null, status);
}

export async function archiveVitals(deviceId: string, content: Vitals): Promise<void> {
  await recordDevice(deviceId, null, null);
  await pool.query(
    `INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, content.ts, content.rssi, content.uptime_s, content.heap_free],
  );
}

// Can the database be reached right now? Used by GET /health.
export async function databaseAlive(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
```

- **`recordDevice`** makes sure that the device has a row in `devices` before its readings are stored (the foreign key, Concept 4). `INSERT … ON CONFLICT (device_id) DO UPDATE SET …` means "add a new row; if that `device_id` already exists, just update these columns". This combination of "insert or update" is often called an **upsert**. `coalesce(a, b)` takes the first value that isn't `NULL`, so a `kind` and a `status` that aren't given (`null`) don't overwrite the old values.
- **`archiveTelemetry`** writes one `telemetry` message to `readings`. `"pressure" in content` checks whether the message has a `pressure` field, the field that only Node 2 has (contract 1.2). The rule is the same as the way `store.ts` decides a device's kind in Module 16. TypeScript understands this check too: in the part for Node 1, the Node 1-only fields (`light`, `motion`, `water_level`, `soil_rs485`, `ec`) may be used, while the columns that belong to the other device are filled with `null`. The function returns `true` if the row is new, and `false` if `ON CONFLICT` skipped it (`rowCount` 0, Concept 10).
- **`archiveStatus`** and **`archiveVitals`** write `status` to `devices` and `vitals` to `device_health`.
- **`databaseAlive`** runs the simplest query there is, `SELECT 1`, to check whether the database can be reached. This function is used by `/health` and when the server starts.

Notice that every value is sent through `$1`, `$2`, and so on, and is never pasted into the SQL statement (Concept 10).

#### 5.2 An ear that archives: `src/services/mqtt.ts`

There are six small changes in `mqtt.ts`, plus one comment line in `store.ts`. You can compare the end result with the [Practice 5 stage of `mqtt.ts`](code/stages/practice-5/backend/src/services/mqtt.ts).

1. In the first line, add the words "stores it," to the comment: `// mqtt.ts - the backend as an MQTT client: listens to msh/#, checks every message, stores it, and sends commands.`
2. Below the line `import { counts, … } from "./store.ts";`, add the import of the archive writer:

   ```ts
   import { archiveStatus, archiveTelemetry, archiveVitals } from "../db/archive.ts";
   ```

3. Right above the comment `// summarize the list of issues from Zod, …`, add this small function:

   ```ts
   // writing to the database failed (for example the database container was stopped): log it, but the server keeps running
   function archiveFailed(topic: string, log: FastifyBaseLogger) {
     return (error: Error) => log.error(`couldn't save ${topic} to the database: ${error.message}`);
   }
   ```

4. In the `status` part, add one line below `saveStatus(…)`, so that the part looks like the one below (the first and last lines are already there; don't write them twice):

   ```ts
       saveStatus(deviceId, result.data);
       archiveStatus(deviceId, result.data).catch(archiveFailed(topic, log));
       counts.received++;
   ```

5. In the `telemetry` part, add four lines below `saveTelemetry(…)`, so that the part looks like the one below (the first line is already there; don't write it twice):

   ```ts
       saveTelemetry(deviceId, result.data);
       const ts = result.data.ts;
       archiveTelemetry(deviceId, result.data)
         .then((isNew) => { if (!isNew) log.info(`duplicate skipped: ${deviceId} ${ts}`); })
         .catch(archiveFailed(topic, log));
   ```

6. In the `vitals` part, add one line below `saveVitals(…)`, so that the part looks like the one below (the first line is already there; don't write it twice):

   ```ts
       saveVitals(deviceId, result.data);
       archiveVitals(deviceId, result.data).catch(archiveFailed(topic, log));
   ```

Why not use `await`? The MQTT ear must always be ready to hear the next message, and the order in which the archive writes finish doesn't matter. So each write is started, then left to run on its own. **`.catch(…)`** catches it if it fails (for example, when the database container is off), and **`.then(…)`** reads its result if it succeeds: `false` means a duplicate send, and the backend writes that to the log. Without `.catch`, a single database failure would become an uncaught error that could bring the server down.

Finally, in another file: open `src/services/store.ts`, then replace its second comment line. In Module 16, that comment predicted that the store would be replaced by a database. As it turns out, the store stays in use, and the database keeps it company (Concept 1):

```ts
// This data is lost when the server stops; its permanent copy is saved to the database by archive.ts (Module 17).
```

#### 5.3 A `/health` that checks the database

Replace the content of `src/routes/health.ts` with:

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
      summary: "Server state: alive, connected to the broker and the database, and message counts",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), database: z.boolean(), received: z.number(), rejected: z.number() })
          .describe("server alive; broker and database = reachable or not"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerConnected(), database: await databaseAlive(), received: counts.received, rejected: counts.rejected };
  });
};
```

`/health` now also answers `database: true` or `false`. The `await` keyword in front of `databaseAlive()` makes the route wait for the answer to `SELECT 1` before it answers.

#### 5.4 `server.ts` v0.2

Replace the content of `src/server.ts` with:

```ts
// server.ts - the entry point of the Mini Smart Home backend v0.2 (Module 17: data is stored in the database).
// Run: npm run dev (automatically restarts when a file is saved) or npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { healthRoutes } from "./routes/health.ts";
import { deviceRoutes } from "./routes/devices.ts";
import { startMqtt } from "./services/mqtt.ts";
import { databaseAlive } from "./db/archive.ts";

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
  openapi: { info: { title: "Mini Smart Home API", description: "Backend v0.2 (Module 17)", version: "0.2.0" } },
  transform: jsonSchemaTransform, // the same Zod schemas become the OpenAPI documentation
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(healthRoutes);
await app.register(deviceRoutes);

if (await databaseAlive()) app.log.info("database ready");
else app.log.warn("database not reachable yet: check the database container and DATABASE_URL in .env");
startMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`API docs: http://${env.HOST}:${env.PORT}/docs`);
```

Two changes from Module 16: the description under the documentation's title (`Mini Smart Home API`) is now `Backend v0.2 (Module 17)`, with version `0.2.0`, and before it listens to the broker, the server checks the database once, then writes `database ready` (or a warning if the database can't be reached yet). Even if the database is down, the server still starts, because its notice board is still useful; only the archive is missing until the database comes back.

#### 5.5 Bump the version

In the second terminal (the `backend` folder):

```text
npm version 0.2.0 --no-git-tag-version
```

The command answers `v0.2.0` and changes the version number in both `package.json` and `package-lock.json`. `--no-git-tag-version` keeps npm from making a Git commit and tag by itself, because we make our commits by hand. Then open `package.json` and update the `"description"` line to:

```json
"description": "Mini Smart Home backend (Modules 16-17): listens to MQTT, checks the data contract, stores every message in the database, and provides an API",
```

#### 5.6 Run it

Make sure the `smarthome-db` container is running, then check the types in the second terminal with `npm run check` (it must pass). In the first terminal (the `backend` folder; a newly opened terminal needs `cd backend` first), run `npm run dev`. **Expected output** in the first terminal:

```text
[10:30:44] INFO: database ready
[10:30:44] INFO: Server listening at http://127.0.0.1:8080
[10:30:44] INFO: API docs: http://127.0.0.1:8080/docs
[10:30:44] INFO: connected to broker mqtt://192.168.1.37:1883
```

If you see `database not reachable yet`, check the container (`docker ps`) and the `DATABASE_URL` line in `.env`. Then open `http://127.0.0.1:8080/health` in the browser. **Expected output** (the `received` number keeps going up):

```json
{"ok":true,"broker":true,"database":true,"received":10,"rejected":0}
```

#### 5.7 Watch the data arrive

Wait one minute, then run these two queries in DBeaver (the `smarthome` connection) one at a time with **Ctrl + Enter**, as in 4.3. Replace the example `device_id` with yours. On the simulator path, the fake devices also start with `f00d`, so in the first query, replace `NOT LIKE` with `LIKE` (the two practice devices of Practice 4 are now used by the simulator too), and in the second query, use `f00d00000001`:

```sql
SELECT device_id, kind, status, last_seen FROM devices WHERE device_id NOT LIKE 'f00d%';
SELECT ts, temperature, humidity, soil, pressure, soil_temperature FROM readings WHERE device_id = 'a4cf12e5b7c0' ORDER BY ts DESC LIMIT 3;
```

**Expected output** (an example from psql, with the mock Node 1 and Node 2 in the author's lab):

```text
  device_id   | kind  | status |           last_seen           
--------------+-------+--------+-------------------------------
 246f28b1c7d4 | node2 | online | 2026-10-20 03:31:12.898204+00
 a4cf12e5b7c0 | node1 | online | 2026-10-20 03:31:18.550391+00
(2 rows)

           ts           | temperature | humidity | soil | pressure | soil_temperature 
------------------------+-------------+----------+------+----------+------------------
 2026-10-20 03:31:18+00 |        28.5 |       71 |   37 |          |                 
 2026-10-20 03:31:08+00 |        28.5 |       71 |   37 |          |                 
 2026-10-20 03:30:58+00 |        28.5 |       71 |   37 |          |                 
(3 rows)
```

The `devices` rows for Node 1 and Node 2 were created by the backend **by itself** when their first messages arrived. Node 1's readings come every 10 seconds. Their `pressure` column is empty (`NULL`) because it's a Node 2-only column, and `soil_temperature` is empty too if your Node 1 doesn't use the RS-485 soil sensor from Module 15. Run the queries a few times and watch new rows show up. `vitals` is sent when a device connects and every 5 minutes after that, so `SELECT * FROM device_health;` may only have rows after a few minutes.

Now give your real devices a name and a location (replace the `device_id` with yours; on the simulator path, skip this step, because `f00d00000001` and `f00d00000002` already have names from the practice data):

```sql
UPDATE devices SET name = 'Node 1 Home', location = 'living room' WHERE device_id = 'a4cf12e5b7c0';
UPDATE devices SET name = 'Node 2 Garden', location = 'garden' WHERE device_id = '246f28b1c7d4';
```

The backend never overwrites `name` and `location` (those columns aren't in `recordDevice`), so what a human fills in there is safe.

#### 5.8 Stop the server, start it again: the archive is still there

1. In DBeaver, count Node 1's readings: `SELECT count(*) FROM readings WHERE device_id = 'a4cf12e5b7c0';`. Write down the number, for example `33`. On the simulator path, use `f00d00000001`; the number is above 1,000, because the practice data of Practice 4 is counted too.
2. In the first terminal, stop the server with **Ctrl + C**, wait half a minute, then run `npm run dev` again.
3. Open `http://127.0.0.1:8080/devices`. Right after it starts, the list may still be empty, or the devices may already be back with `"kind":"unknown"`, because only their retained `status` message has arrived so far (Module 16 Practice 3.6). The **notice board** (memory) really does start from zero, just as in Module 16.
4. Run the `count(*)` query in DBeaver again. The number does **not** go back to zero. It's the same as, or bigger than, the number in step 1, because the **archive book** (the database) wasn't wiped along with it.

That's the difference between the notice board and the archive book (Concept 1). Readings sent while the server is off aren't stored, because nobody hears them, but everything stored before is still there.

#### 5.9 Save

In the second terminal (the `backend` folder):

```text
git add .
git commit -m "Backend v0.2 stores every MQTT message in the database (Module 17 Practice 5)"
git push
```

> ➡️ **Continue** to [Practice 6](#practice-6--a-duplicate-send-is-stored-once-20-minutes). Leave the server in the first terminal running.

### Practice 6 — A duplicate send is stored once (20 minutes)

> 🖥️ **Tools used:** **MQTTX** (the **Pi gateway** connection, or **Via laptop IP** on the laptop path), **VS Code** (backend v0.2 keeps running in the first terminal; if you continue on another day, open Docker Desktop first, then run `npm run dev` again in the first terminal, after `cd backend` if the terminal was just opened), and **DBeaver**.
>
> ⭐ **Required** — completion requirement: duplicate sends don't create duplicate rows.

Real duplicate sends are rare, and you can't just sit and wait for one. So we make one ourselves: exactly the same `telemetry` message is sent twice from MQTTX, as if it came from the test device `f00d00000099`.

#### 6.1 Send the same message twice

In **MQTTX** (the **Pi gateway** or **Via laptop IP** connection, the **Retain** box unticked, QoS **1**, format **JSON**), send this message to the topic `msh/f00d00000099/telemetry`:

```json
{"ts":"2026-10-20T03:10:00Z","fw":"1.4.0","temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}
```

Then send **exactly the same message** again, without changing anything. **Expected output** in the first terminal (the backend), after the second send:

```text
[10:40:51] INFO: duplicate skipped: f00d00000099 2026-10-20T03:10:00Z
```

The first send isn't written to the log, because storing a new reading is nothing special. The second send is recognized as a duplicate. That line didn't show up? If the log says `REJECTED msh/f00d00000099/telemetry: …`, the message's content changed when you copied it, so copy it again exactly from the box above. If the log stays completely silent, MQTTX and the backend aren't connected to the same broker: compare the address of the MQTTX connection with `MQTT_URL` in `.env`. Now check in DBeaver:

```sql
SELECT device_id, ts, received_at, temperature FROM readings WHERE device_id = 'f00d00000099';
```

Only **one** row. The `received_at` column shows when the **first** send arrived at the backend; the second send left no trace at all in the table.

#### 6.2 A different time = a new reading

Change the `ts` in the MQTTX message to `"2026-10-20T03:10:10Z"` (ten seconds later), then send it once. Run the `SELECT` query from 6.1 again: now there are **two** rows. For the database, `(f00d00000099, 03:10:00)` and `(f00d00000099, 03:10:10)` are two different keys, so both are valid readings. Only a pair of device and time that's **exactly the same** is refused (Concept 10).

#### 6.3 Without `ON CONFLICT`

What happens if someone forgets to write `ON CONFLICT DO NOTHING`? Try it in DBeaver, with the row that's already there:

```sql
INSERT INTO readings (device_id, ts, fw, temperature) VALUES ('f00d00000099', '2026-10-20T03:10:00Z', '1.4.0', 28.5);
```

**Expected output** (psql; in DBeaver, the same message shows up in the results panel below the editor, starting with `SQL Error [23505]:`, and the `DETAIL:` line is written `Detail:`):

```text
ERROR:  duplicate key value violates unique constraint "readings_pkey"
DETAIL:  Key (device_id, ts)=(f00d00000099, 2026-10-20 03:10:00+00) already exists.
```

The primary key still refuses the twin row, but as an **error**. In the backend, an error like this would show up in the log as `couldn't save …` every time there's a duplicate send, even though nothing is wrong. With `ON CONFLICT (device_id, ts) DO NOTHING`, a duplicate send is skipped quietly, and the backend can tell it apart from a real error through `rowCount`. `readings_pkey` is the name that PostgreSQL gives to the primary key of the `readings` table. In DBeaver, the `ts` value in the error message is written in your laptop's time (`… 10:10:00+07`).

#### 6.4 Clean up the test device

Delete the test device's readings **first**, and only then the device. The other order is refused by the foreign key (Practice 4.4):

```sql
DELETE FROM readings WHERE device_id = 'f00d00000099';
DELETE FROM devices WHERE device_id = 'f00d00000099';
```

psql's answers: `DELETE 2` (the two readings from 6.1 and 6.2), then `DELETE 1`. This test device is still recorded on the backend's **notice board** (`GET /devices`) until the server restarts. That's fine, because that board is only a temporary memory anyway.

> ➡️ **Continue** to [Practice 7](#practice-7--the-history-api-and-recorded-commands-40-minutes).

### Practice 7 — The history API and recorded commands (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the server keeps running in the first terminal; other commands go in the second terminal, both in the `backend` folder), a **browser**, **Bruno**, **DBeaver**, **Docker Desktop** (the `smarthome-db` container running), and Node 1 switched on (or the Module 16 simulator in a third terminal). Continuing on another day? Open Docker Desktop first, then run `npm run dev` again in the first terminal (a new terminal needs `cd backend` first). On the simulator path, also start the simulator in the third terminal, as in the 🖥️ box of Practice 5.
>
> ⭐ **Required** — completion requirement: `GET /devices/<id>/readings` returns the reading history from the database, and its request is saved in the Bruno collection.

In Module 16, the backend could only answer with the **last** reading, and its history was "waiting for the database in Module 17". Now the archive book has been filled, but so far it can only be read through DBeaver. The dashboard in Module 22 and other applications won't open the database themselves. They ask the backend through the API, like guests who order through the waiter (the restaurant waiter analogy, Module 16). The backend checks the question, limits the size of the answer, and keeps the database password to itself.

This practice adds one new door, **`GET /devices/:id/readings?from=…&to=…`** ("give me this device's readings from this time to that time"), and, while we're at it, records every command from the API in the `commands` table.

#### 7.1 An archive book you can also read: the complete `src/db/archive.ts`

Replace the content of `src/db/archive.ts` with its complete version:

```ts
// archive.ts - writes the messages that passed the contract checks to the database, and reads them back for the history API.
// The in-memory store (store.ts) remains the "notice board" for the latest state; the database is its archive book.
import { pool } from "./pool.ts";
import type { Ack, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";

// Make sure the device has a row in the devices table (created if it isn't there yet), then update when it was last heard.
// Columns that aren't given (null) don't overwrite the old values, thanks to coalesce.
async function recordDevice(deviceId: string, kind: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id, kind, status, last_seen)
     VALUES ($1, coalesce($2, 'unknown'), coalesce($3, 'unknown'), now())
     ON CONFLICT (device_id) DO UPDATE SET
       kind = coalesce($2, devices.kind),
       status = coalesce($3, devices.status),
       last_seen = now()`,
    [deviceId, kind, status],
  );
}

// Stores one telemetry message. The result is false if a reading with the same ts is already stored (a duplicate send).
export async function archiveTelemetry(deviceId: string, content: TelemetryNode1 | TelemetryNode2): Promise<boolean> {
  const n2 = "pressure" in content ? content : null; // Node 2 is recognized by the pressure column (contract 1.2), as in store.ts
  const n1 = "pressure" in content ? null : content; // otherwise, Node 1 telemetry
  await recordDevice(deviceId, n2 ? "node2" : "node1", null);
  const result = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level,
                           pressure, soil_temperature, battery, soil_rs485, ec)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, content.ts, content.fw, content.temperature, content.humidity, n1?.light ?? null, content.soil, n1?.motion ?? null,
      n1?.water_level ?? null, n2?.pressure ?? null, content.soil_temperature ?? null, n2?.battery ?? null,
      n1?.soil_rs485 ?? null, n1?.ec ?? null],
  );
  return result.rowCount === 1;
}

export async function archiveStatus(deviceId: string, status: Status): Promise<void> {
  await recordDevice(deviceId, null, status);
}

export async function archiveVitals(deviceId: string, content: Vitals): Promise<void> {
  await recordDevice(deviceId, null, null);
  await pool.query(
    `INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, content.ts, content.rssi, content.uptime_s, content.heap_free],
  );
}

// One command from the API with its result: the ack (ok or refused), or null if no ack came within 5 seconds.
export async function archiveCommand(commandId: string, deviceId: string, command: SetCommand, sentAt: Date,
  ack: Ack | null, waitMs: number): Promise<void> {
  await pool.query(
    `INSERT INTO commands (id, device_id, sent_at, target, value, ack_ok, ack_message, wait_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [commandId, deviceId, sentAt, command.target, JSON.stringify(command.value), ack?.ok ?? null,
      ack?.message ?? null, waitMs],
  );
}

// A time in the data contract format (UTC, without milliseconds), for example 2026-10-20T03:10:00Z
export const contractTime = (time: Date) => time.toISOString().slice(0, 19) + "Z";

// The shape of one readings row read through pg: a timestamptz becomes a JavaScript Date object.
interface ReadingRow {
  ts: Date;
  fw: string;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  soil: number | null;
  motion: boolean | null;
  water_level: number | null;
  pressure: number | null;
  soil_temperature: number | null;
  battery: number | null;
  soil_rs485: number | null;
  ec: number | null;
}

const MAX_READINGS = 1000; // at most 1,000 readings per request

// The reading history of one device in the range [from, to), oldest first. It asks for 1,001 rows to find out
// whether there are really more than 1,000: then the answer is cut off, and truncated is true.
export async function getHistory(deviceId: string, from: Date, to: Date) {
  const result = await pool.query<ReadingRow>(
    `SELECT ts, fw, temperature, humidity, light, soil, motion, water_level, pressure, soil_temperature, battery, soil_rs485, ec
     FROM readings
     WHERE device_id = $1 AND ts >= $2 AND ts < $3
     ORDER BY ts
     LIMIT $4`,
    [deviceId, from, to, MAX_READINGS + 1],
  );
  const readings = result.rows.slice(0, MAX_READINGS).map((row) => ({ ...row, ts: contractTime(row.ts) })); // ts as text
  return { readings, truncated: result.rows.length > MAX_READINGS };
}

// Can the database be reached right now? Used by GET /health.
export async function databaseAlive(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
```

Its top part (`recordDevice` to `archiveVitals`) is the same as in Practice 5. What's new:

- **`archiveCommand`** records one command, together with its result, in the `commands` table. The `ack_ok` column holds `true` or `false` from the `ack`, or `NULL` if no `ack` came within 5 seconds. For this function, the `import type` line at the top now also takes `Ack` and `SetCommand` from the contract. `JSON.stringify(command.value)` turns the command's value (`true`, `30`) into JSON text for the `value` column, whose type is `jsonb` (Practice 3).
- **`contractTime`** writes a time in the data contract format, for example `2026-10-20T03:10:00Z`. `toISOString()` produces `2026-10-20T03:10:00.000Z`; `.slice(0, 19)` takes its first 19 characters (the milliseconds are thrown away), and then the letter `Z` is added back.
- **`ReadingRow`** tells TypeScript the shape of one `readings` row when it's read through `pg`: a `timestamptz` column arrives as a `Date` object (Concept 9), a number column as a `number`, and an empty column as `null`. With `pool.query<ReadingRow>(…)`, TypeScript knows what `result.rows` holds and can check the code that uses it.
- **`getHistory`** runs the history query: the readings of one device with `ts >= $2 AND ts < $3`, oldest first (`ORDER BY ts`). The start of the range is included, its end isn't. That way, two ranges that follow each other, for example 06:00–07:00 and 07:00–08:00, never count the 07:00 reading twice.
- **The limit of 1,000 readings (`MAX_READINGS`).** Node 1 sends 360 readings per hour, or 8,640 per day. Without a limit, a request for "a week" would return tens of thousands of rows at once and overwhelm both the backend and the browser. That's why this function asks for `MAX_READINGS + 1` rows (1,001). If 1,001 really arrive, the range holds more than 1,000 readings: only the first 1,000 readings are sent, and `truncated` is `true`, so that whoever asked knows that the answer isn't complete. Module 18 adds a better way for long ranges: hourly averages instead of thousands of raw readings.
- **`.map((row) => ({ ...row, ts: contractTime(row.ts) }))`** changes every row before it's sent. `...row` (three dots, called spread) copies all the columns of that row, then `ts` is replaced with text in the contract format.

#### 7.2 A new door: `src/routes/devices.ts`

There are five changes in `src/routes/devices.ts`. All of them are **additions**, so other routes that you may have made yourself (for example from 🧩 in Module 16) stay safe. You can compare the end result with the [final `devices.ts`](code/backend/src/routes/devices.ts) file.

1. In the first line, change the comment to: `// devices.ts - the /devices routes: the device list, the latest reading, the history from the database, and commands.`
2. Below the line `import { brokerConnected, … } from "../services/mqtt.ts";`, add the import from the archive book:

   ```ts
   import { getHistory, archiveCommand, contractTime } from "../db/archive.ts";
   ```

3. Below the line `const IdParam = …;`, add two new schemas, `Range` and `Reading`:

   ```ts
   const Range = z.object({
     from: z.iso.datetime({ offset: true }).optional()
       .describe("start of the range, e.g. 2026-10-20T10:00:00+07:00 (default: 1 hour before to)"),
     to: z.iso.datetime({ offset: true }).optional().describe("end of the range, not included (default: now)"),
   }).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // a reversed range is refused with code 400
     message: "must be later than from", path: ["to"],
     when: (result) => result.issues.length === 0, // the order is only checked when from and to have passed the format checks
   });
   const num = z.number().nullable(); // a column the device doesn't have holds null
   const Reading = z.object({
     ts: z.string(), fw: z.string(), temperature: num, humidity: num, light: num, soil: num, motion: z.boolean().nullable(),
     water_level: num, pressure: num, soil_temperature: num, battery: num, soil_rs485: num, ec: num,
   });
   ```

   - **`Range`** is a Zod schema for the **query string**, the part of the address after the `?` sign (for example `?from=…&to=…`). `from` and `to` may be left out (`.optional()`), but if they're filled in, they must be ISO 8601 times complete with their time zone (`z.iso.datetime({ offset: true })`): ending in `Z` (UTC) or `+07:00` (WIB).
   - **`.refine(…)`** adds a rule that involves two fields at once: `to` must be later than `from`. The `when` option makes that rule wait until `from` and `to` have passed the format check, so that the error messages don't pile up.
   - **`Reading`** is the shape of one reading in the answer. Every sensor field may be `null` (`num = z.number().nullable()`), because every device only fills in its own fields.

4. Between the `GET /devices/:id/vitals` route and the `POST /devices/:id/command` route, add this new route:

   ```ts
     app.get("/devices/:id/readings", {
       schema: {
         tags: ["devices"],
         summary: "Reading history of one device from the database (at most 1,000 readings)",
         params: IdParam,
         querystring: Range,
         response: {
           200: z.object({
             device_id: z.string(), from: z.string(), to: z.string(), count: z.number(), truncated: z.boolean(),
             readings: z.array(Reading),
           }).describe("readings in that range, oldest first; truncated = there were more than 1,000 readings"),
           503: ErrorBody.describe("the database can't be reached right now"),
         },
       },
     }, async (req, reply) => {
       const toTime = req.query.to ? new Date(req.query.to) : new Date();
       const fromTime = req.query.from ? new Date(req.query.from) : new Date(toTime.getTime() - 60 * 60 * 1000);
       try {
         const { readings, truncated } = await getHistory(req.params.id, fromTime, toTime);
         return {
           device_id: req.params.id, from: contractTime(fromTime), to: contractTime(toTime), count: readings.length, truncated,
           readings,
         };
       } catch (error) {
         req.log.error(`history of ${req.params.id} couldn't be read from the database: ${(error as Error).message}`);
         return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
       }
     });
   ```

   - **`querystring: Range`** puts a checker on `from` and `to`, just as `params: IdParam` has checked `id` since Module 16.
   - If `to` is empty, `toTime` means now; if `from` is empty, `fromTime` means one hour before `toTime`. One hour holds 360 Node 1 readings, far below the limit of 1,000.
   - The answer holds the `from` and `to` that were really used, the `count` of readings, `truncated`, and the list of `readings`. This route deliberately doesn't check whether the device has ever been heard: "device X's readings yesterday" is still a valid question, even if the answer is empty.
   - **`try … catch`**: if the database can't be reached right now, the details of the error are written to the log, and whoever asked gets a `503` with a clear message, not a `500` that shows off the database's address. The pattern is the same as the `503` in the command route when the broker is disconnected.

5. In the command route, add two lines below `const elapsed = Date.now() - start;`, so that the part looks like the one below (the first line is already there; don't write it twice):

   ```ts
       const elapsed = Date.now() - start;
       archiveCommand(commandId, d.device_id, req.body, new Date(start), ack, elapsed)
         .catch((error) => req.log.error(`couldn't record command ${commandId} in the database: ${error.message}`));
   ```

   Every command that's really sent is now recorded, whether its `ack` arrives or not (`504`). Like the archive writes in Practice 5, this recording isn't waited for, and a failure is just written to the log, because the answer to Bruno must not be delayed or fail only because of the recording. Commands that are refused before they're sent (`404`, `409`, or `503`) aren't recorded, because they never reached the device.

#### 7.3 Run it, then ask for the history from the browser

In the second terminal, run `npm run check`; it must pass. The server in the first terminal has already restarted by itself every time you saved a file, because `npm run dev` uses `--watch` (Module 16). Make sure that its last line is `connected to broker …` again, without any red errors.

**1. The last hour.** Open this address in the browser (replace `a4cf12e5b7c0` with your Node 1's `device_id`, or with `f00d00000001` if you use the simulator):

```text
http://127.0.0.1:8080/devices/a4cf12e5b7c0/readings
```

**Expected output** (in reality one long line; shortened here):

```text
{"device_id":"a4cf12e5b7c0","from":"2026-10-20T03:02:14Z","to":"2026-10-20T04:02:14Z","count":184,"truncated":false,
"readings":[{"ts":"2026-10-20T03:30:48Z","fw":"1.4.0","temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,
"water_level":64,"pressure":null,"soil_temperature":null,"battery":null,"soil_rs485":null,"ec":null}, … ]}
```

- Without `from` and `to`, the range is **the last hour**. All the times in the answer are in UTC (`Z`), just like the data contract: `03:02` UTC is 10:02 WIB. Turning it into local time is the job of whatever displays it, for example the dashboard in Module 22.
- The first reading in this example is `03:30:48Z` (10:30 WIB), not `03:02`, because the backend only started archiving in Practice 5. Readings from before that were never stored.
- The fields Node 1 doesn't have (`pressure`, `battery`) are always `null`. `soil_temperature`, `soil_rs485`, and `ec` are `null` too, unless your Node 1 uses the RS-485 soil sensor from Module 15.
- The `count` on your screen will certainly be different. Reload the page after 10 seconds (**F5**): until the backend has been archiving for a full hour, `count` goes up by one every 10 seconds. After that, the number stays at around 360.

**2. A specific range, in WIB.** The practice data of Practice 4 is good for trying ranges, because its content is the same on anyone's laptop. In the address below, first replace `2026-10-19` (it's there twice) with the date **one day before** you filled in the practice data with `npm run seed-history` (Practice 4.2, or the last time you emptied it and filled it in again), then open the address. In this module's example, the practice data was filled in on the 20th.

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06:00:00%2B07:00&to=2026-10-19T07:00:00%2B07:00
```

**Expected output** (tidied up and shortened; the numbers are the same on your laptop):

```text
{
  "device_id": "f00d00000001",
  "from": "2026-10-18T23:00:00Z",
  "to": "2026-10-19T00:00:00Z",
  "count": 6,
  "truncated": false,
  "readings": [
    {"ts": "2026-10-18T23:00:00Z", "fw": "1.4.0", "temperature": 23.8, "humidity": 79, "light": 33, "soil": 68, … },
    … five more readings …
  ]
}
```

The six readings, summarized:

| `ts` (UTC) | WIB time (on the 19th) | `temperature` | `light` | `soil` |
| :--- | :--- | ---: | ---: | ---: |
| `2026-10-18T23:00:00Z` | 06:00 | `23.8` | `33` | `68` |
| `2026-10-18T23:10:00Z` | 06:10 | `23.4` | `185` | `68` |
| `2026-10-18T23:20:00Z` | 06:20 | `23.4` | `307` | `68` |
| `2026-10-18T23:30:00Z` | 06:30 | `24.1` | `484` | `67` |
| `2026-10-18T23:40:00Z` | 06:40 | `24.2` | `610` | `67` |
| `2026-10-18T23:50:00Z` | 06:50 | `23.8` | `747` | `67` |

- **`%2B` is a "wrapped" `+` sign.** In a web address, a `+` sign in the query string is read as a **space**. If you write `+07:00` as it is, the backend receives `2026-10-19T06:00:00 07:00` and refuses it. Try it yourself: replace both `%2B` with `+`. **Expected output:**

  ```json
  {"statusCode":400,"code":"FST_ERR_VALIDATION","error":"Bad Request","message":"querystring/from Invalid ISO datetime, querystring/to Invalid ISO datetime"}
  ```

  This kind of wrapping is called URL encoding: a `%` sign followed by that character's number in hexadecimal, and the number of the `+` sign is `2B`. If you don't want to wrap it, avoid the `+` sign altogether: write the time in UTC with the `Z` ending. For exactly the same range: `from=2026-10-18T23:00:00Z&to=2026-10-19T00:00:00Z`.
- **The answer is always in UTC.** You asked for the readings from 06:00 WIB on the 19th, and the backend answers `"from":"2026-10-18T23:00:00Z"`. That's the same point in time, just written in UTC (Concept 9).
- **This is the 06:00 watering.** The first reading's `soil` is `68`, then it slowly goes down. `light` climbs from tens to hundreds because the sun is rising.
- Live in the WITA or WIT time zone? This example still uses `%2B07:00` so that the result matches the module. For your own local time, use `%2B08:00` (WITA) or `%2B09:00` (WIT). The answer is still in UTC.

**3. Questions that get refused.** Try these three addresses one at a time (use your dates). All of them are answered with code `400` and `"code":"FST_ERR_VALIDATION"`; only the content of their `message` is different:

- **A reversed range** (`from` later than `to`):

  ```text
  http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T07:00:00%2B07:00&to=2026-10-19T06:00:00%2B07:00
  ```

  Its `message` is `querystring/to must be later than from`.
- **A date without a time**: `http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19`. Its `message` is `querystring/from Invalid ISO datetime`, because the time and the time zone must be written.
- **A `device_id` in capital letters**: `http://127.0.0.1:8080/devices/A4CF12E5B7C0/readings`. Its `message` is `params/id device_id must be 12 lowercase hexadecimal digits`, the same as in the Module 16 routes.

All three are refused at the door by Fastify, before a single query reaches the database. On the other hand, a valid `device_id` that has never been heard, for example `0123456789ab`, is answered with `200`, `"count":0`, and `"readings":[]`.

**4. A range that's too long.** Ask for all the practice data at once. Replace `2026-10-06` with the date two weeks ago, and leave `to` empty (meaning up to now):

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-06T00:00:00%2B07:00
```

**Expected output** (shortened):

```text
{"device_id":"f00d00000001","from":"2026-10-05T17:00:00Z","to":"2026-10-20T04:03:51Z","count":1000,"truncated":true,
"readings":[{"ts":"2026-10-12T17:00:00Z", … }, … ]}
```

This device's practice data holds more than 1,000 readings (1,010 in the Practice 4.2 example, plus the simulator's readings if you use it), so the answer stops at the 1,000th reading, and `truncated: true` tells you that there's more. A program that needs all of them simply asks again with smaller ranges, for example one day at a time.

#### 7.4 The new door is listed in `/docs`

Open `http://127.0.0.1:8080/docs`. The **devices** group now has a new row, **GET** `/devices/{id}/readings`, with the summary `Reading history of one device from the database (at most 1,000 readings)`. Click that row. The **Parameters** section holds `from` and `to` (marked `query`, not required, complete with their descriptions) and `id` (marked `path`, required, with a `*` sign).

Try it straight from here:

1. Click **Try it out**.
2. Fill in `from` with `2026-10-19T06:00:00+07:00`, `to` with `2026-10-19T07:00:00+07:00` (use your dates), and `id` with `f00d00000001`.
3. Click **Execute**.

This time, the `+` sign may be written as it is. In the **Request URL** box, Swagger UI has already wrapped it by itself into `%2B`, and the colons into `%3A`:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06%3A00%3A00%2B07%3A00&to=2026-10-19T07%3A00%3A00%2B07%3A00
```

Below it, **Server response** shows code `200` and the same answer as in step 2 of 7.3, this time already tidied up.

![Trying GET /devices/{id}/readings straight from /docs: two pieces of real Swagger UI screenshots of the final backend, after Try it out was clicked, from, to, and id were filled in, and Execute was clicked, with four numbers. Top, the GET /devices/{id}/readings route row, reading history of one device from the database (at most 1,000 readings), with the Cancel button. The Parameters section, number 1, holds the Name and Description columns: from, string($date-time), (query), start of the range, e.g. 2026-10-20T10:00:00+07:00 (default: 1 hour before to), filled in with 2026-10-19T06:00:00+07:00; to, string($date-time), (query), end of the range, not included (default: now), filled in with 2026-10-19T07:00:00+07:00; and id, marked with an asterisk and required, string, (path), the device's device_id, for example a4cf12e5b7c0, filled in with f00d00000001. Below them, the blue Execute button, number 2, next to Clear. Bottom, Request URL, number 3: http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06%3A00%3A00%2B07%3A00&to=2026-10-19T07%3A00%3A00%2B07%3A00, with both %2B07%3A00 underlined. Then Server response, number 4: Code 200 and a Response body that starts with device_id f00d00000001, from 2026-10-18T23:00:00Z (underlined), to 2026-10-19T00:00:00Z, count 6 (underlined), truncated false, then the first reading: ts 2026-10-18T23:00:00Z, fw 1.4.0, temperature 23.8, humidity 79, light 33, soil 68, motion false, water_level 78, and pressure, soil_temperature, battery, soil_rs485, and ec null. Captions on the right: 1 Parameters, from and to are marked (query) and not required, id is marked (path) and with an asterisk, required; 2 Execute sends the GET request to the backend, and in the input boxes the + sign may be written as it is; 3 Request URL, Swagger UI wraps it by itself, + becomes %2B and the colon becomes %3A; 4 Server response, code 200, from 2026-10-18T23:00:00Z, that is 06:00 WIB on the 19th, and count 6. Note: the answer is always written in UTC (Concept 9); the practice data of Practice 4 (device f00d00000001), the numbers are the same on your laptop as long as the date is one day before you ran npm run seed-history, as in 7.3; the answer box can be scrolled for the other five readings.](assets/swagger-history.png)

#### 7.5 Save the request in Bruno

1. In Bruno, click the **Node 1 latest reading** request in the sidebar so that its tab opens, then right-click that **tab** (in the row of tabs above the request panel) and choose **Clone Request**. In the **Clone Request** dialog, change **Request Name** to `Node 1 history`, then click **Clone**. The new request opens right away in its own tab. (The sidebar also has a **Clone** menu item, but it immediately makes a copy named `Node 1 latest reading copy`, without a dialog; if that already happened, right-click the copy, choose **Rename**, then change its name to `Node 1 history`.)
2. In that new tab, replace the word `latest` at the end of the URL with `readings`.
3. Open the **Assert** tab. Its first row was copied along: `res.status`, **Operator** `equals` (saved in the file as `eq`), and **Value** `200`. In the empty row below it, type `res.body.count` in the **Expr** column, choose `gt` ("greater than") in the **Operator** column, then type `0` in the **Value** column. `res.body.count` means "the `count` field inside the content of the answer (the body)".
4. Save (**Ctrl + S**), then click **Send**. The **Tests** tab in the answer panel now holds `Assertions (2), Passed: 2, Failed: 0`.

The second test makes sure that the history of the last hour **isn't empty**. If this test fails one day, no Node 1 reading has been stored during the last hour: Node 1 is off, the broker is disconnected, or the database has a problem. That's what tests are for: they tell you before the dashboard's users notice.

That's the third completion requirement of this module: **the history API returns data from the database**. Send **Node 1 history** again a few times, 10 seconds apart. Until the backend has been archiving for a full hour, its `count` goes up; after that, the number stays at around 360 (7.3).

#### 7.6 Commands are now recorded

1. In Bruno, send **lamp on**, then **lamp off**.
2. In DBeaver, run:

   ```sql
   SELECT id, target, value, ack_ok, ack_message, wait_ms, sent_at FROM commands ORDER BY sent_at DESC LIMIT 5;
   ```

**Expected output** (an example from psql; your `id`s, waits, and times are different):

```text
         id          | target | value | ack_ok | ack_message | wait_ms |          sent_at           
---------------------+--------+-------+--------+-------------+---------+----------------------------
 c-20261020-041209-2 | lamp   | false | t      |             |       9 | 2026-10-20 04:12:09.597+00
 c-20261020-041204-1 | lamp   | true  | t      |             |      12 | 2026-10-20 04:12:04.423+00
(2 rows)
```

- Every command that's really sent becomes one row: its command id, the target, the value, the result of the `ack`, and how long it waited. In DBeaver, the `sent_at` column shows up in your laptop's time (Concept 9).
- `ack_ok` `t` means `true` (psql writes `t` and `f` for a `boolean`). `ack_message` is only filled in if the device refuses the command (`ack_ok` `f`), for example the pump when the water tank is below 20%.
- A command that isn't answered within 5 seconds (`504`) is recorded too, with an empty `ack_ok` (`NULL`) and a `wait_ms` of about `5000`. You'll see one if you repeat "Test 504 and the `offline` 409" from Module 16 Practice 6.5.

With this record, a question like "how fast does Node 1 usually answer?" can now be answered with SQL:

```sql
SELECT target, count(*) AS count, round(avg(wait_ms)) AS avg_wait_ms
FROM commands
WHERE ack_ok = true
GROUP BY target
ORDER BY target;
```

**Expected output** (example):

```text
 target | count | avg_wait_ms 
--------+-------+-------------
 lamp   |     2 |          11
(1 row)
```

#### 7.7 Save

In the second terminal (the `backend` folder):

```text
git add .
git status
git commit -m "History API GET /devices/:id/readings and recorded commands (Module 17 Practice 7)"
git push
```

In the `Changes to be committed` part, `git status` must name two changed files (`src/db/archive.ts` and `src/routes/devices.ts`) and one new file (`bruno/Node 1 history.yml`). This time, `git push` doesn't need `-u`, because the pairing of the branch on the laptop with the one on GitHub has been remembered since Practice 3.

> ➡️ **Done with Practice 7?** Do Level 1 of the [🧩 Independent Challenges](#-independent-challenges), then steps A and B of the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home): there, backend v0.2 is merged into `main` through a pull request. Levels 2 and 3 come after that, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title of the problem that looks most like yours. For almost every database problem, these three checks show where the problem is: **`docker ps -a`** (is the container running?), **`docker logs smarthome-db`** (what does PostgreSQL say?), and **`http://127.0.0.1:8080/health`** (can the backend reach the database?). For TypeScript errors from `npm run check`, or a `SyntaxError` after you changed code, compare your file with the same stage in [`code/stages/`](code/stages/) (the end of Practices 3, 4, and 5) or [`code/backend/`](code/backend/) (the end of Practice 7), then also look at 🚨 in Module 16.

<details>
<summary><b>Docker Desktop won't start, or <code>docker</code> isn't recognized</b></summary>

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| The terminal answers `The term 'docker' is not recognized …` (Windows) or `zsh: command not found: docker` (macOS). | The terminal was opened before Docker Desktop was installed, so it doesn't know the `docker` command yet. | Close **all** VS Code windows, then open VS Code again. If nothing changes, restart the laptop. If it's still not recognized, Docker Desktop isn't installed yet: go through the 🐳 Setup section again. |
| `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine…` (Windows) or `Cannot connect to the Docker daemon…` / `failed to connect to the docker API at unix://…` (macOS). | The `docker` command is recognized, but the Docker Desktop app isn't running yet. Docker Desktop doesn't start by itself when the laptop is turned on. | Open Docker Desktop, wait until the whale icon stops moving, then repeat the command. So that you don't forget again, tick **Start Docker Desktop when you sign in to your computer** (the tip at the end of 🐳 Setup). |
| Docker Desktop says that virtualization isn't enabled, or it gets stuck while starting and never finishes. | Virtualization is off in the BIOS/UEFI, or WSL 2 isn't ready yet. | Check **Task Manager** → **Performance** → **CPU** → **Virtualization: Enabled** (🐳 Setup step 1). Then open **Terminal (Admin)** and run `wsl --update`, restart, and open Docker Desktop again. |
| Docker Desktop starts, but it's very slow, and the laptop feels sluggish. | The laptop has less than 8 GB of RAM, or too many apps are open. | Close the other apps (especially a browser with many tabs). If your laptop really is below the requirements, move the database to the Raspberry Pi (🔬 "A database on the Raspberry Pi"). |

</details>

<details>
<summary><b>The <code>smarthome-db</code> container stops by itself or won't start</b></summary>

Run `docker ps -a`. If the container's **STATUS** column says `Exited (…)` or `Restarting (…)`, not `Up …`, read the reason with `docker logs smarthome-db` (the very bottom part). `Restarting` means that the container failed to start, and `--restart unless-stopped` keeps restarting it, so the same error message can be written many times in the log:

- **`Error: Database is uninitialized and superuser password is not specified.`** The `-e POSTGRES_PASSWORD=…` part was left out of `docker run`, and the **STATUS** column usually says `Restarting (1) …`. First stop that failed container with `docker stop smarthome-db`, then delete it with `docker rm smarthome-db`. Without `docker stop`, `docker rm` is refused with the message `container is restarting: stop the container before removing or force remove`. After that, run the full command of Quick Win step 2 again. Its data was never created, so nothing is lost.
- **`No space left on device`.** The laptop's disk is full. Free up some space (see the collapsible section "The laptop feels slow since Docker was installed, or disk space is running low" below), then run `docker start smarthome-db`.
- **`docker start` answers `ports are not available` or `port is already allocated`.** Counter 5432 is now used by another program, for example another PostgreSQL that starts when the laptop is turned on. See the next collapsible section.

A container that **doesn't show up at all** in `docker ps -a` has never been created (or has been deleted): run Quick Win step 2. If the `smarthome-data` volume is still there, the new container uses your old data right away.

After the laptop restarts, the container doesn't start **until** Docker Desktop is opened. `--restart unless-stopped` only works while Docker Desktop is running. A container that you stopped yourself with `docker stop` also stays stopped until you run `docker start smarthome-db`.

</details>

<details>
<summary><b><code>ports are not available</code> or <code>port is already allocated</code>: counter 5432 is already taken</b></summary>

The full message holds `Error response from daemon:` (with `docker run`, it starts with `docker:`), then mentions `5432`. On Windows, for example: `ports are not available: exposing port TCP 127.0.0.1:5432 -> 127.0.0.1:0: listen tcp4 127.0.0.1:5432: bind: An attempt was made to access a socket in a way forbidden by its access permissions.` Even though it mentions "access permissions", the problem isn't Administrator rights but a counter that another program is using. It means that counter 5432 on the laptop is already in use: usually by a PostgreSQL that was once installed directly on the laptop (for example for a university course), or by another container.

1. Delete the container, whether it's the new container left behind after a failed `docker run` or the old container that `docker start` failed to start: `docker rm smarthome-db`. Its data volume isn't deleted along with it.
2. Run the command of Quick Win step 2 again, but with `-p 127.0.0.1:5433:5432` (counter 5433 on the laptop is passed on to 5432 inside the container). If the error message now mentions `5433`, that counter is taken too (for example by a second PostgreSQL version): delete the container again, then use `5434` in the same way.
3. From now on, use port **5433** (or **5434** if you moved again in step 2) in DBeaver (the **Port** field) and in `DATABASE_URL` (`…@127.0.0.1:5433/smarthome`, or `…@127.0.0.1:5434/smarthome`). The `docker exec … psql` command doesn't change, because psql runs inside the container and still uses 5432.

Don't stop or uninstall that other PostgreSQL if you aren't sure who uses it.

</details>

<details>
<summary><b>The <code>smarthome</code> database doesn't exist, or the new password doesn't work</b></summary>

The `-e POSTGRES_PASSWORD=…` and `-e POSTGRES_DB=…` settings are only used **once**, when the container first prepares the volume while it's still empty. Once the `smarthome-data` volume holds data, those settings are ignored, even if the container is created again with a different password or database name.

- **`database "smarthome" does not exist`** that still appears after the container has been running for more than half a minute (in the first few seconds after `docker run`, this message really does show up for a moment while the database sets itself up): the first database was created without `POSTGRES_DB`. Create it now (your other data isn't touched):

  ```text
  docker exec -it smarthome-db psql -U postgres -c "CREATE DATABASE smarthome;"
  ```

  psql's answer: `CREATE DATABASE`. If the answer is `ERROR:  database "smarthome" already exists`, the database turns out to exist already, so there's nothing to fix. The TimescaleDB add-on is installed in this new database too, because the image has already installed it in PostgreSQL's template database.
- **`password authentication failed for user "postgres"`** (in DBeaver, in `npm run migrate`, or in the backend's log), even though the password seems right: the password that counts is the one from when the volume was **first** created. Use that old password, or change the password from inside the container (psql inside the container doesn't ask for a password):

  ```text
  docker exec -it smarthome-db psql -U postgres -c "ALTER USER postgres PASSWORD 'your-new-password';"
  ```

  psql's answer: `ALTER ROLE`. After that, update the password in `.env` (`DATABASE_URL`) and in DBeaver (right-click the connection → **Edit Connection**). Remember the password rule of the Quick Win: only letters, numbers, and hyphens.
- **Want to really start from zero?** This step **deletes all the data** in the database. Run `docker stop smarthome-db`, `docker rm smarthome-db`, and `docker volume rm smarthome-data`, then repeat Quick Win step 2 and `npm run migrate`. Only do this if you really don't mind losing the data.

</details>

<details>
<summary><b>DBeaver can't connect</b></summary>

Open the connection's settings (right-click the `smarthome` connection → **Edit Connection**), click **Test Connection ...**, then read the message:

| Message | Fix |
| :--- | :--- |
| `Connection to 127.0.0.1:5432 refused. Check that the hostname and port are correct and that the postmaster is accepting TCP/IP connections.` | The container is off, or the port is wrong. Check `docker ps`: **STATUS** must be `Up …`, and the number in the **PORTS** column (`127.0.0.1:5432->…` or `127.0.0.1:5433->…`) must match the **Port** field in DBeaver. |
| `FATAL: password authentication failed for user "postgres"` | The password in DBeaver is different from the one set when the volume was first created. See the collapsible section "The `smarthome` database doesn't exist, or the new password doesn't work". |
| `FATAL: database "smarthome" does not exist` | There's a typo in the **Database** field, or the database really doesn't exist yet (the same collapsible section). |
| DBeaver asks to download a driver, then fails | Downloading the PostgreSQL driver needs the internet, just once. Connect the laptop to the internet, then click **Download** again. |

New tables don't show up in the left panel? Right-click the `smarthome` connection → **Refresh** (or press **F5** in that panel). DBeaver doesn't watch for changes made through psql or through migrations by itself.

</details>

<details>
<summary><b><code>npm run migrate</code> fails</b></summary>

| Message | Cause | Fix |
| :--- | :--- | :--- |
| `Error: connect ECONNREFUSED 127.0.0.1:5432`, followed by many `at …` lines | The database can't be reached: the container is off, or the port in `DATABASE_URL` is wrong. | Check with `docker ps`, start the container if needed (`docker start smarthome-db`), and match the port. The `at …` lines are only a trace of where the error happened. What matters is the line that starts with `Error:` (or `error:`), a few lines below the `pg-pool` file name that appears at the very top. |
| `password authentication failed for user "postgres"` | The password in `DATABASE_URL` is wrong. | See the collapsible section "The `smarthome` database doesn't exist, or the new password doesn't work". |
| `Setting DATABASE_URL is empty. …` | The `DATABASE_URL=…` line isn't in `.env` yet, or its name has a typo. | Copy that line from `.env.example`, then replace the password (Practice 3). |
| `npm error Missing script: "migrate"` (or `"seed-history"`) | Its line isn't in the `"scripts"` part of `package.json` yet, the file hasn't been saved, or the terminal isn't in the `backend` folder. | Save `package.json`, compare the line with Practice 3.6 or 4.1, then run the command from the `backend` folder. |
| `npm error code EJSONPARSE` | The content of `package.json` is broken, usually because of a missing or extra comma in the `"scripts"` part. | Every line inside `"scripts"` ends with a comma, except the last one. Compare it with [`package.json`](code/backend/package.json). |
| `FAILED in 001_initial_schema.sql: syntax error at or near "…"` | There's a typo in the SQL file. | Compare your file with [`001_initial_schema.sql`](code/backend/migrations/001_initial_schema.sql), especially the commas at the end of every column line, and the parentheses. Because every file runs in one transaction, no table is left half-made: fix the file, then run it again. |
| `FAILED in 001_initial_schema.sql: relation "devices" already exists` | A table with the same name was once created by hand (for example through DBeaver), outside the migrations. | First check its content with `SELECT count(*) FROM devices;`. If it's `0`, that handmade table is safe to throw away: run `DROP TABLE devices;` in DBeaver, then run `npm run migrate` again. If the next message names another table, check that table and throw it away in the same way. `DROP TABLE` throws away a table together with all its content without asking, so don't run it if you still need what's in it. |

Changed a migration file that had **already** been applied? Your change will never run, because its name is already recorded in `schema_migrations`. The rule: a migration file that has been applied must never be changed; a new change always goes into a file with the next number (Concept 5).

</details>

<details>
<summary><b>The backend prints <code>database not reachable yet</code> or <code>couldn't save … to the database</code></b></summary>

The symptoms: when the server starts, the log says `WARN: database not reachable yet: check the database container and DATABASE_URL in .env`; `/health` answers `"database":false`; every device message produces a line like

```text
[10:22:57] ERROR: couldn't save msh/a4cf12e5b7c0/telemetry to the database: connect ECONNREFUSED 127.0.0.1:5432
```

and `GET /devices/<id>/readings` is answered with `503` and `{"message":"the database can't be reached right now, try again shortly"}`. Right when the container is stopped, the terminal may also print one or two `database error: …` lines from `pool.ts`: those are idle connections in the pool that the database cut off, and they're only logged. The backend stays alive, and its notice board keeps working; only the archive is missing.

1. **The container.** `docker ps`: is it running? If not, run `docker start smarthome-db` (and open Docker Desktop first if needed).
2. **`DATABASE_URL` in `.env`.** Is the port the same as in `docker ps`? Is the password right? Once `.env` is saved, the server restarts by itself.
3. **Wait a moment.** As soon as the database can be reached again, the next archive write succeeds right away, without restarting the server. Readings that arrive while the database is down are **not** stored, because at that moment there's nowhere to store them.

If the message is `relation "devices" does not exist` (in a `couldn't save …` line) or `relation "readings" does not exist` (in a `history of … couldn't be read from the database` line), the database is alive, but its tables haven't been created yet: run `npm run migrate` (Practice 3). For `password authentication failed`, see the collapsible section "The `smarthome` database doesn't exist, or the new password doesn't work".

</details>

<details>
<summary><b>The clock in DBeaver or psql is 7 hours off, or the daily averages seem to have the wrong dates</b></summary>

No data is wrong; what's different is the way it's displayed (Concept 9).

- **psql inside the container** shows times in UTC (the `+00` ending). To see WIB for one psql session, run `SET TIME ZONE 'Asia/Jakarta';`.
- **DBeaver** shows times in your laptop's time zone. If the clock in DBeaver seems odd too, check the laptop's time zone setting.
- **The backend's API** always answers in UTC (`Z`), just like the data contract.
- **Grouping per day** must use the WIB date: `(ts AT TIME ZONE 'Asia/Jakarta')::date`, not `ts::date`. `ts::date` follows the session time zone: in psql and in the backend (UTC), readings from 00:00–06:59 WIB end up on the previous day's date, even though they look right in DBeaver (Practice 4.5). In WITA and WIT, replace `'Asia/Jakarta'` with `'Asia/Makassar'` or `'Asia/Jayapura'` for your devices' data (the practice data of Practice 4 still uses `'Asia/Jakarta'`).

</details>

<details>
<summary><b>The history API answers <code>400</code>, <code>count: 0</code>, or <code>truncated: true</code></b></summary>

| Answer | Cause | Fix |
| :--- | :--- | :--- |
| `400`, `querystring/from Invalid ISO datetime` | The time format isn't complete, or the `+` sign was written as it is in the browser's address. | Write it in full: the date, the letter `T`, the time with seconds, then the time zone, for example `2026-10-19T06:00:00%2B07:00` or `2026-10-18T23:00:00Z`. In the browser's address, `+` must be written `%2B` (Practice 7.3). Bruno and Swagger UI wrap the address by themselves, so write `+` as it is there; a `%2B` typed in Bruno even gets wrapped twice (`%252B`) and refused. The way that's safe everywhere: write the time in UTC with the `Z` ending. |
| `400`, `querystring/to must be later than from` | `from` and `to` are swapped. | Swap them back. |
| `200`, but `"count":0` | That device has no readings in that range. | Check the `device_id` (is it your own? the practice data only exists for `f00d00000001` and `f00d00000002`). Remember that the answer is in UTC: `from` and `to` in the answer show the range that was really used. For Node 1, make sure that the backend is archiving (`/health` → `"database":true`, and `SELECT count(*) FROM readings WHERE device_id = '…';` in DBeaver goes up). |
| `200`, with `"truncated":true` | The range holds more than 1,000 readings. | Make the range smaller, for example one day or one hour at a time. |
| `503`, `the database can't be reached right now, …` | The database is down, `DATABASE_URL` is wrong, or the tables haven't been created yet (`npm run migrate`). | See the collapsible section "The backend prints `database not reachable yet` …" above. |

</details>

<details>
<summary><b>The laptop feels slow since Docker was installed, or disk space is running low</b></summary>

- **When you aren't studying, quit Docker Desktop.** On Windows, right-click the whale icon in the notification area; on macOS, click the whale icon in the menu bar. Then choose **Quit Docker Desktop**. Your data is safe in the volume, and the container starts again when Docker Desktop is opened. On Windows, the big process named `Vmmem` or `VmmemWSL` in Task Manager is Docker's small Linux machine; it gets smaller after Docker Desktop is closed.
- **See what's eating the disk** with `docker system df` (the **SIZE** column in the `Images`, `Containers`, and `Local Volumes` rows). For this module, almost all of it is the `timescale/timescaledb` mold and your data volume, and both are really needed. Don't be surprised if that mold is listed at about 2.2 GB (`2.222GB`) even though its download was only about 552 MB: on disk, Docker keeps the original download as well as its unpacked contents. A newly created database volume is about 70 MB. If the laptop's disk is very tight, free up space outside Docker first.
- **Don't** throw away volumes just to free up space, for example with `docker volume prune --all` or the delete button in the **Volumes** menu. A volume that no container is using at the moment, including `smarthome-data` if its container has been deleted, gets thrown away together with the whole content of the database.

</details>

## 🔬 Technical Deep Dive (optional)

This section isn't required to pass. Read it if you're curious about what happens behind the scenes, or if your laptop can't handle Docker.

<details>
<summary><b>Transactions: delete, then undo</b></summary>

Concept 5 mentions that every migration file is wrapped in a **transaction**. You can feel it for yourself in psql, with practice data that's safe to sacrifice. If the Module 16 simulator is running, stop it first (**Ctrl + C**), because the simulator also keeps adding readings for `f00d00000002`, so the numbers could be slightly different. After that, go into psql (`docker exec -it smarthome-db psql -U postgres -d smarthome`), then type these one at a time:

```sql
BEGIN;
DELETE FROM readings WHERE device_id = 'f00d00000002';
SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
ROLLBACK;
SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
```

**Expected output** (the `DELETE` and `count` numbers follow your practice data):

```text
smarthome=# BEGIN;
BEGIN
smarthome=*# DELETE FROM readings WHERE device_id = 'f00d00000002';
DELETE 1010
smarthome=*# SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
 count 
-------
     0
(1 row)

smarthome=*# ROLLBACK;
ROLLBACK
smarthome=# SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
 count 
-------
  1010
(1 row)
```

Notice the asterisk in `smarthome=*#`: psql is reminding you that you're inside a transaction.

After `BEGIN`, all changes are still "on paper". Inside that transaction, the porch readings are already gone (`count` 0). `ROLLBACK` undoes everything, and the thousand readings are back, complete. If you had typed `COMMIT`, the deletion would have become permanent.

As long as the transaction isn't finished, other connections (for example DBeaver or the backend) still see the old data. They only see the change after `COMMIT`. That's what `migrate.ts` makes use of: the whole content of one migration file becomes visible at once, or not at all. There's one condition from `pg`: all the commands of one transaction must go through **the same connection**. That's why `migrate.ts` borrows one connection with `pool.connect()`, instead of using `pool.query()`, which can switch connections with every command.

</details>

<details>
<summary><b>Numbers that arrive as text: <code>count(*)</code> and <code>numeric</code> through <code>pg</code></b></summary>

`double precision` and `integer` columns arrive in JavaScript as a `number`, as you'd expect. Two other types don't:

```ts
const result = await pool.query(
  "SELECT count(*) AS count, count(*)::int AS count_int, avg(temperature) AS avg, round(avg(temperature)::numeric, 1) AS avg_rounded " +
  "FROM readings WHERE device_id = 'f00d00000001'",
);
console.log(result.rows[0]);
```

**Expected output** (tested with `pg` 8.23.1):

```text
{
  count: '1010',
  count_int: 1010,
  avg: 26.308514851485146,
  avg_rounded: '26.3'
}
```

`count(*)` produces the `bigint` type, which can be much bigger than the biggest number that JavaScript's `number` is guaranteed to hold exactly. So that no number changes silently, `pg` sends it as **text** (`'1010'`). The same goes for `numeric` (the result of `round(…::numeric, 1)`), because a `numeric` can have more decimal digits than a `number`. If you know the number will stay small, change its type in SQL: `count(*)::int`, or `round(…)::float8`. If you forget, the trap is subtle: `'1010' + 1` in JavaScript produces the text `'10101'`, not `1011`.

</details>

<details>
<summary><b><code>EXPLAIN</code>: how the database finds readings (an introduction to Module 18)</b></summary>

Write `EXPLAIN` in front of a `SELECT`, and PostgreSQL tells you its **plan** without really running the query. Try these two queries in psql:

```sql
EXPLAIN SELECT ts, temperature FROM readings WHERE device_id = 'f00d00000001' AND ts >= '2026-10-19T00:00:00Z' AND ts < '2026-10-20T00:00:00Z';
EXPLAIN SELECT ts, temperature FROM readings WHERE temperature > 30;
```

**Expected output** (example; the `cost` and `rows` numbers on your screen are different):

```text
                                                                                   QUERY PLAN                                                                                    
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Index Scan using readings_pkey on readings  (cost=0.28..8.30 rows=1 width=16)
   Index Cond: ((device_id = 'f00d00000001'::text) AND (ts >= '2026-10-19 00:00:00+00'::timestamp with time zone) AND (ts < '2026-10-20 00:00:00+00'::timestamp with time zone))
(2 rows)

                         QUERY PLAN                         
------------------------------------------------------------
 Seq Scan on readings  (cost=0.00..92.80 rows=928 width=16)
   Filter: (temperature > '30'::double precision)
(2 rows)
```

- **`Index Scan using readings_pkey`**: for the first query, the database uses the **index** of the primary key `(device_id, ts)`. That index is like the index at the back of a book: a list already sorted by device, then by time, so the database can jump straight to the page "f00d00000001, the 19th" without reading the whole table. A primary key automatically has an index, and its shape happens to fit the most common question in IoT: "device X's readings between this time and that time". That's the query of the history API in Practice 7. On your laptop, the plan may also say `Bitmap Heap Scan on readings`, with `Bitmap Index Scan on readings_pkey` below it. That's a variation on using the same index; the sign is that the name `readings_pkey` shows up.
- **`Seq Scan`** (a sequential scan): for the second query, there's no index that fits, so the database reads **all** the rows one by one, then picks out the ones whose `temperature` is above 30. With two thousand rows, you don't notice. With a million rows, you really do.

Module 18 continues this story: filling in a million rows, measuring the time with `EXPLAIN ANALYZE`, then keeping `readings` fast even as it keeps growing.

</details>

<details>
<summary><b>psql: useful backslash commands</b></summary>

Besides SQL, psql knows short commands that start with a backslash. These commands belong to psql itself (they aren't SQL), so they do **not** end with a semicolon:

| Command | What it does |
| :--- | :--- |
| `\dt` | lists the tables in this database (Practice 3) |
| `\d readings` | shows the shape of one table: columns, types, primary key, indexes, and foreign keys |
| `\x` | an expanded display, going downward (one column per line), handy for wide rows; type it again to go back |
| `\timing` | shows how long every query takes, for example `Time: 1.234 ms`; type it again to switch it off |
| `\?` | lists every backslash command (press **q** to leave the list) |
| `\q` | quits psql |

</details>

<details>
<summary><b>Drizzle ORM: SQL written as TypeScript</b></summary>

An **ORM** (*Object-Relational Mapping*) is a library that lets you write database queries as ordinary code, not as SQL statements. One of the popular ones in the TypeScript world is **Drizzle ORM**. This is what the history query of Practice 7 looks like when it's written with Drizzle (tested with `drizzle-orm` 0.45.4 and `pg` 8.23.1):

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { Pool } from "pg";

// a "map" of the readings table in TypeScript (only the columns we use)
const readings = pgTable("readings", {
  device_id: text().notNull(),
  ts: timestamp({ withTimezone: true }).notNull(),
  temperature: doublePrecision(),
  soil: integer(),
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

const rows = await db
  .select({ ts: readings.ts, temperature: readings.temperature, soil: readings.soil })
  .from(readings)
  .where(and(
    eq(readings.device_id, "f00d00000001"),
    gte(readings.ts, new Date("2026-10-19T06:00:00+07:00")),
    lt(readings.ts, new Date("2026-10-19T07:00:00+07:00")),
  ))
  .orderBy(asc(readings.ts));
```

`rows` holds the same six readings as in Practice 7.3 step 2, and TypeScript already knows their shape without an `interface` of your own. Behind the scenes, Drizzle still makes an SQL statement with the parameters `$1`, `$2`, and so on, then sends it through the same `pg`.

Its strengths: a typo in a column name is flagged right away by the editor, and the shape of a table only has to be written once, in TypeScript (its tool, Drizzle Kit, can even make migration files from it). Its weaknesses: one more layer to learn, and you still have to understand SQL to know what's really being sent to the database. That's why this module uses plain SQL: learn SQL first, then the tools that write it for you. At the time this module was written, Drizzle was preparing version 1.0 with a few big changes, so check its official documentation if you want to use it in your own project.

</details>

<details>
<summary><b>A database on the Raspberry Pi</b></summary>

If your laptop can't handle Docker Desktop (less than 8 GB of RAM, a Windows version that's too old, or virtualization that can't be switched on), the database can run on the **Pi gateway** from Module 12. The backend still runs on the laptop; only the database's address changes.

**What you need:**

- **A Raspberry Pi 4 or 5** with 2 GB of RAM or more (4 GB gives more room, because the Pi also runs the broker and Node-RED).
- **Raspberry Pi OS 64-bit.** Check it over SSH with `uname -m`: the answer must be `aarch64`.
- **Storage that can take a beating.** A database writes to its storage all the time, and an ordinary microSD card wears out quickly because of it. Use a high-endurance card, or even better, an SSD over USB (or NVMe on a Pi 5). Whatever the storage, make regular backups. How to do that is in Module 18.

**The steps, in outline** (every command on the Pi, over SSH):

1. Install **Docker Engine** (the windowless version of Docker Desktop) by following Docker's official guide for Debian at [docs.docker.com/engine/install/debian](https://docs.docker.com/engine/install/debian/), because Raspberry Pi OS 64-bit is built from Debian. That guide also explains how to run `docker` without `sudo`.
2. Run the Quick Win's `docker run` command with **one** difference: replace `-p 127.0.0.1:5432:5432` with `-p 192.168.1.37:5432:5432` (your Pi's fixed address from Module 12). That way, the database's counter opens to the laptop on the home network, not just to the Pi itself. The same image has a version for the Pi (`arm64`, about 535 MB), so its first download takes a while.
3. On the laptop, point everything at the Pi: `DATABASE_URL=postgres://postgres:<password>@192.168.1.37:5432/smarthome` in `.env`, and **Host** `192.168.1.37` in DBeaver.
4. The `docker exec …`, `docker logs …`, and similar commands in this module are run on the Pi (over SSH), not on the laptop.

Because its counter is now open to the home network (the only exception to safety rule number 2 at the start of the module), use a strong password, and **never** forward port 5432 on the router to the internet.

Can it be done without Docker? Yes: Raspberry Pi OS 64-bit provides PostgreSQL 17 through `sudo apt install postgresql`. The catch is that this version doesn't include the TimescaleDB that Module 18 needs, and installing it takes a few extra steps. The Docker path gives your Pi exactly the same database as this module.

</details>

## 🧩 Independent Challenges

Level 1 only needs DBeaver. Levels 2 and 3 change the backend's code, so do them **after** ➕ B (once the `feature/database` branch has been merged), on a new branch from `main`, as in Module 16: `git switch main`, `git pull`, then `git switch -c feature/<challenge-name>`. Levels 1 and 2 have answer keys; the complete content of both Level 2 key files is in [`code/challenges/key/`](code/challenges/key/).

### Level 1 — The hottest hour on the porch (a small change)

The Practice 4.7 query finds the time when the soil was **driest** each day in the living room. Change that query so that it answers: **what time was the temperature hottest each day on the porch** (`f00d00000002`), over the last 7 days. Only three things need to change: the device, the column you look at, and the direction of the sort (the hottest is the **biggest**).

<details>
<summary><b>Level 1 answer key</b></summary>

```sql
SELECT DISTINCT ON (day) day, hour, temperature
FROM (
  SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS day,
         to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') AS hour,
         temperature
  FROM readings
  WHERE device_id = 'f00d00000002'
    AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
    AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
) AS per_reading
ORDER BY day, temperature DESC, hour;
```

**Expected output** (your dates follow today's date; the times and numbers are the same if the practice data was filled in today, see the box in Practice 4.2):

```text
    day     | hour  | temperature 
------------+-------+-------------
 2026-10-13 | 15:30 |          32
 2026-10-14 | 14:10 |        31.5
 2026-10-15 | 14:10 |        32.3
 2026-10-16 | 15:00 |          33
 2026-10-17 | 15:20 |        32.6
 2026-10-18 | 15:50 |        31.7
 2026-10-19 | 14:00 |        32.1
(7 rows)
```

The key is in `ORDER BY day, temperature DESC, hour`: within each day, `DESC` puts the biggest temperature at the top, so `DISTINCT ON (day)` takes the hottest reading. The temperatures are the same as in number 1 of the Practice 4.8 key, while the times are always around 14:00–16:00: the air is hottest a few hours **after** the sun is at its highest, not right at noon.

</details>

### Level 2 — Command history through the API (fill in the blanks)

The `commands` table has recorded every command since Practice 7, but so far it can only be read from DBeaver. Provide `GET /devices/:id/commands`: **the last 20 commands** of one device, newest first. Fill in every `____` below.

In **`src/db/archive.ts`**, right above the comment `// Can the database be reached right now? …`, add:

```ts
// The shape of one commands row read through pg (Challenge Level 2)
interface CommandRow {
  id: string;
  sent_at: Date;
  target: string;
  value: boolean | number;
  ack_ok: boolean | null;
  ack_message: string | null;
  wait_ms: number | null;
}

// The last 20 commands of one device, newest first (Challenge Level 2)
export async function getCommands(deviceId: string) {
  const result = await pool.query<CommandRow>(
    `SELECT id, sent_at, target, value, ack_ok, ack_message, wait_ms
     FROM ____
     WHERE device_id = ____
     ORDER BY sent_at ____
     LIMIT ____`,
    [deviceId],
  );
  return result.rows.map((row) => ({ ...row, sent_at: ____(row.sent_at) }));
}
```

In **`src/routes/devices.ts`**, add `getCommands` to the list of imports from `../db/archive.ts`, then add this route between the `GET /devices/:id/readings` route and the command route:

```ts
  app.get("/devices/:id/commands", {
    schema: {
      tags: ["devices"],
      summary: "The last 20 commands of one device, with their ack results",
      params: IdParam,
      response: {
        200: z.array(z.object({
          id: z.string(), sent_at: z.string(), target: z.string(), value: z.union([z.____(), z.____()]),
          ack_ok: z.boolean().nullable(), ack_message: z.string().nullable(), wait_ms: z.number().nullable(),
        })).describe("newest first; ack_ok null = no ack within 5 seconds"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      return await ____(req.params.id);
    } catch (error) {
      req.log.error(`commands of ${req.params.id} couldn't be read from the database: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });
```

Test it with `npm run check`, then create the Bruno request `Node 1 commands` (through **Clone Request** from the **Node 1 latest reading** tab, as in Practice 7.5, then replace `latest` at the end of the URL with `commands`). The **expected output** is the list of commands from Practice 7.6, the newest at the top:

```text
[{"id":"c-20261020-041209-2","sent_at":"2026-10-20T04:12:09Z","target":"lamp","value":false,"ack_ok":true,"ack_message":null,"wait_ms":9},
{"id":"c-20261020-041204-1","sent_at":"2026-10-20T04:12:04Z","target":"lamp","value":true,"ack_ok":true,"ack_message":null,"wait_ms":12}]
```

A device that has never received a command is answered with `[]` (an empty list).

<details>
<summary><b>Level 2 answer key</b></summary>

- In the SQL: `FROM commands`, `WHERE device_id = $1`, `ORDER BY sent_at DESC`, and `LIMIT 20`. A value from outside always goes through `$1` (Concept 10); `DESC` puts the newest at the top.
- In `.map(…)`: `contractTime(row.sent_at)`. That way, the `sent_at` column is written in the contract format, just like `ts` in the history API.
- In the schema: `value: z.union([z.boolean(), z.number()])`. A command's value can be `true`/`false` (lamp, fan) or a number (pump, curtain). A `jsonb` column arrives in JavaScript as its original value, not as text.
- In the handler: `return await getCommands(req.params.id);`. The word `await` inside `try` matters: without it, a database error slips past `catch`, and the route answers `500`, not `503`.

The complete content of both files: [`archive.ts`](code/challenges/key/backend/src/db/archive.ts) and [`devices.ts`](code/challenges/key/backend/src/routes/devices.ts).

</details>

### Level 3 — A one-day summary (from scratch)

A dashboard often needs a few summary numbers, not hundreds of readings. Build **`GET /devices/:id/summary?date=2026-10-19`**, which answers with a summary of that device's readings on one **WIB date** (from 00:00 up to, but not including, 24:00 WIB):

```json
{"device_id":"f00d00000001","date":"2026-10-19","count":144,"min_temp":22,"avg_temp":26.3,"max_temp":30.6,"min_soil":42}
```

Hints:

- The query string schema: `z.object({ date: z.iso.date() })`. `z.iso.date()` only accepts a date in the form `YYYY-MM-DD`; a date in the wrong format is answered with `400` by Fastify.
- Turn the WIB date into a time range in JavaScript: ``const fromTime = new Date(`${req.query.date}T00:00:00+07:00`);``, then `toTime` = `fromTime` plus 24 hours (`fromTime.getTime() + 24 * 60 * 60 * 1000`). As in the history API, the start of the range is included, while its end isn't.
- One query is enough: `count(*)`, `min(temperature)`, `avg(temperature)`, `max(temperature)`, and `min(soil)`, with `WHERE device_id = $1 AND ts >= $2 AND ts < $3`. Remember 🔬 "Numbers that arrive as text": write `count(*)::int`, and `round(avg(temperature)::numeric, 1)::float8`, so that both arrive as a `number`.
- Put the function in `archive.ts` and the route in `devices.ts` (complete with a `503`, like the history route), then add its Bruno request.

**Check your answer yourself** with the practice data: for every date in your Practice 4.5 table (the seven full days before the day you ran `npm run seed-history`), `count` must be `144`, `avg_temp` must equal that date's row in Practice 4.5, and `min_soil` must equal that date's row in Practice 4.7. This level has no answer key; that cross-check is the key.

## ➕ Add-on to "Mini Smart Home"

This week, Mini Smart Home gets **backend v0.2**: every message that passes the contract check is now also stored permanently in the database, its history can be requested through the API, and every command is recorded. The data contract stays at version 1.2, because the shape of the MQTT messages doesn't change. The database itself lives in a Docker container on your laptop, while the repository only keeps the **recipe** for the shape of its tables (the migrations), not the data.

![Project diagram of Mini Smart Home after Module 17: the backend now has a long-term memory; a dashed line means optional, retired, or coming later. Top, from the left: Node 2 "Garden" v1.0.0 with its 18650 battery, unchanged, sends ESP-NOW to Node 1 "Home" v1.4.0 (sensors, relays, the Node 2 bridge, the RS-485 sensor), also unchanged. Node 1 sends MQTT to the Raspberry Pi gateway at 192.168.1.37, which holds Mosquitto, the MQTT broker, and Node-RED with the dashboard, the Garden card, and the RS-485 Sensor group; the fan automation line is struck through, faded, and dashed, with the label retired since Module 16. Node-RED keeps serving the dashboard on the phone. Middle left, the dashed simulator (optional) box: 10 fake devices on the laptop, f00d00000001 to f00d00000010, standing in for real devices, connected to Mosquitto through a dashed MQTT line. Below it, an honest note: the database runs on the laptop (127.0.0.1:5432); the repository only keeps its migrations, not its data. Middle, the green Laptop box, the backend at 127.0.0.1:8080, holding backend v0.2: Fastify + light TypeScript, subscribing to msh/#, data contract 1.2 as Zod schemas, the in-memory notice board, and the database archive (new), plus the API: GET /health (+ database), GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, GET /devices/:id/readings (new), POST /devices/:id/command (now recorded), and GET /docs. A green msh/# arrow goes down from the gateway to the backend, and a cmd arrow goes up from the backend to the gateway. Below the backend, a two-way pg (pool) line leads to the blue Docker Desktop box: the smarthome-db container (new), PostgreSQL 17 + TimescaleDB 2.30.2, the smarthome-data volume, counter 127.0.0.1:5432, with the tables devices, readings, device_health, commands, users, and rules. On the right, four guests: Bruno for trying the API and the browser for opening /docs, both over HTTP to the backend; DBeaver (new) via counter 5432 and psql via docker exec, both to the database. Bottom, GitHub mini-smart-home: backend/migrations/001_initial_schema.sql new, backend/src/db/ new, backend/README.md v0.2, backend/bruno/Node 1 history.yml new, DATA-CONTRACT.md still 1.2, and firmware/ unchanged. Bottom right, the dashed coming-next boxes: Module 18 TimescaleDB (hypertable, hourly averages, retention, backup), Module 19 backend automation rules, and Module 22 React dashboard.](assets/project-diagram-module-17.png)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and its terminal, and a **browser** that's already signed in to GitHub.
>
> ⭐ **Required** — step B merges all the Module 17 work into `main`, and Module 18 starts from there.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `backend/migrations/001_initial_schema.sql` | **new**: the six Mini Smart Home tables (Practice 3) |
| `backend/src/db/` | **new**: `pool.ts` and `migrate.ts` (Practice 3), `seed-history.ts` (Practice 4), `archive.ts` (Practices 5 and 7) |
| `backend/src/services/mqtt.ts` and `store.ts`, `backend/src/routes/health.ts`, `backend/src/server.ts` | every message stored, the store's comment updated, `/health` with `database`, the description and version 0.2.0 in `/docs` (Practice 5) |
| `backend/src/routes/devices.ts` | `GET /devices/:id/readings` and recorded commands (Practice 7) |
| `backend/src/config/env.ts`, `backend/.env.example` | the `DATABASE_URL` setting (Practice 3) |
| `backend/package.json`, `package-lock.json` | `pg` and `@types/pg`, the `migrate` and `seed-history` commands, version 0.2.0 |
| `backend/bruno/Node 1 history.yml` | **new** (Practice 7) |
| `backend/README.md` | how to run backend v0.2 (step A) |

### A. Update `backend/README.md`

A teammate who clones your repository now needs two extra steps: starting the database and running the migrations. Replace the content of `backend/README.md` with:

````markdown
# Mini Smart Home Backend

Backend v0.2 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.2 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database (the TimescaleDB image, through Docker), and provides a documented API.

## How to run it

1. Install Node.js 24 LTS and Docker Desktop.
2. Start the database, just once (replace `change-this-password` with your password; use only letters, digits, and hyphens):

   ```text
   docker run -d --name smarthome-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=change-this-password -e POSTGRES_DB=smarthome -e TIMESCALEDB_TELEMETRY=off -v smarthome-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env`, then fill in `MQTT_URL` (the broker's address) and the database password in `DATABASE_URL`.
5. Create the tables with `npm run migrate`.
6. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts |
| `npm run check` | checks the TypeScript types (run it before every commit) |
| `npm run migrate` | runs the new SQL files in the `migrations/` folder (safe to repeat) |
| `npm run seed-history` | fills in 7 days of practice data for the practice devices `f00d00000001` and `f00d00000002` |

## API

| Route | What it does |
| :--- | :--- |
| `GET /health` | is the server alive? connected to the broker and the database? how many messages were received and rejected? |
| `GET /devices` | every device heard since the server started |
| `GET /devices/:id/latest` | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | the last health report of one device |
| `GET /devices/:id/readings?from=…&to=…` | the reading history from the database (default: the last hour; at most 1,000 readings) |
| `POST /devices/:id/command` | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table |

The Bruno collection for every route is in the `bruno/` folder (choose the `local` environment).

## Database

The shape of the tables is written as numbered SQL files in the `migrations/` folder. A file that has already been applied must never be changed; every new change goes into a file with the next number. The tables: `devices`, `readings`, `device_health`, `commands`, `users` and `rules` (prepared for later modules), and `schema_migrations` (the record of the migrations already applied).

## Limits of v0.2

- `GET /devices`, `latest`, and `vitals` are still read from memory, so they are empty again after every server restart. The reading history and the commands are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API has no login yet.
````

Then save it to the `feature/database` branch. In the second terminal (the `backend` folder):

```text
git add README.md
git commit -m "Backend README v0.2 (Module 17)"
git push
```

### B. ⭐ Merge `feature/database` into `main` through a pull request

All the commits of Practices 3–7 and step A are on the `feature/database` branch. It's time to review them and merge them, exactly as in Module 16 Practice 8.6–8.9:

1. **Open a pull request.** In the `mini-smart-home` repository on GitHub, click **Compare & pull request** on the yellow banner of the `feature/database` branch. If the banner is already gone, open the **Pull requests** tab → **New pull request**, then choose **base: `main`** ← **compare: `feature/database`**. Under **What changed?**, write, for example: `Backend v0.2: a PostgreSQL database through Docker, migration 001, every MQTT message stored, the history API GET /devices/:id/readings, and recorded commands.` Click **Create pull request**.
2. **Review with the checklist.** In the **Files changed** tab, make sure that `migrations/001_initial_schema.sql` is included, and that there's **no** `.env` file. Also search for your database password (**Ctrl + F** on the page): that password may only be in your laptop's `.env`, not in the code. `.env.example` may hold `change-this-password`, because that's just an example. Then tick the checklist in the **Conversation** tab according to what really happened. The `DATA-CONTRACT.md` item may be ticked: the shape of the MQTT messages doesn't change. Send a summary through **Review changes** → **Comment** → **Submit review**.
3. **Merge.** Choose **Create a merge commit**, click **Merge pull request** → **Confirm merge**, then **Delete branch**.
4. **Back to `main` on the laptop.** In the second terminal:

   ```text
   git switch main
   git pull --prune
   git branch -d feature/database
   ```

After `git switch main`, the `backend` folder on your laptop briefly goes back to version v0.1 (without the `src/db` folder), then `git pull` brings it to v0.2. If `npm run dev` is running, the server restarts a few times along the way; wait until its last log lines are clean. The database isn't affected at all, because its data is in the Docker volume, not in the repository.

### C. Save your learning notes

The `practice-module17.sql` file from Practice 4 is saved in DBeaver's working folder. Open it in DBeaver through **SQL Editor** → **Open SQL script** (**F3**) and choose `practice-module17.sql` from the list, select all its content (**Ctrl + A**), and copy it (**Ctrl + C**); then, in VS Code, open a new window (**File → New Window**), so that the `mini-smart-home` window stays open and the server in its terminal keeps running for 🧩 Levels 2 and 3. In that new window, open the `learn-iot` repository folder (**File → Open Folder…**), create the file **`module-17/practice.sql`** in it, paste the content, and save it. That `module-17` folder already holds `warmup.js` from 🔁. Commit and push in the **`learn-iot`** repository, with GitHub Desktop or the terminal.

**Evidence for passing Module 17** (compare it with ✅ below): the query for the average temperature per day over the last 7 days that you wrote yourself (Practice 4.5), a duplicate send that's stored only once (Practice 6), and the history API answering from the database (Practice 7).

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Database** | A program that stores data on disk in a tidy, long-lasting way, then answers questions about that data. Mini Smart Home's "archive book". |
| **PostgreSQL** | The open-source database used in this module (version 17). It stores data in tables, and you ask it questions with SQL. |
| **TimescaleDB** | An add-on for PostgreSQL made for time-series data, such as sensor readings. It's already installed in this module's image, and it's only used from Module 18 on. |
| **Docker** / **Docker Desktop** | Docker runs ready-to-use programs inside containers. Docker Desktop is its app for Windows and macOS, complete with a window for managing it. |
| **Image** (the mold) | A package that holds a program together with everything it needs, for example `timescale/timescaledb:2.30.2-pg17`. It's downloaded once and can be used for many containers. |
| **Tag** | The version label after an image's name, following the colon. `2.30.2-pg17` means TimescaleDB 2.30.2 on top of PostgreSQL 17. |
| **Container** | A running program made from an image, kept apart from the other programs on the laptop. This module's container is named `smarthome-db`. |
| **Volume** (the cupboard) | A storage place that belongs to Docker and stays even when its container is deleted. All the database's data is in the `smarthome-data` volume. |
| **Port** (the counter) and `-p 127.0.0.1:5432:5432` | The number of the counter where the database waits for connections. The `-p` setting passes the laptop's counter 5432 (only for that laptop itself) on to counter 5432 inside the container. |
| **psql** | PostgreSQL's text-based SQL window. In this module, it runs inside the container with `docker exec -it smarthome-db psql …`. |
| **DBeaver** | A windowed app for opening a database: looking at the tables and their content, and running SQL. |
| **SQL** | The language for asking about, and changing, the data in a database, for example `SELECT`, `INSERT`, `UPDATE`, and `DELETE`. |
| **Query** | One SQL question to the database, for example `SELECT ts, temperature FROM readings WHERE …`. Its answer always has the shape of a table. |
| **Table**, **row**, **column** | A table is like a spreadsheet: every row is one record (one reading), and every column is one kind of entry with a set type (`temperature`, `ts`). |
| **Data type** | The kind of content a column holds, for example `text`, `integer`, `double precision`, `boolean`, `timestamptz`, and `jsonb`. The database refuses content that doesn't match the type. |
| **`NULL`** | Cell content that means "there's no value" (a failed reading, or a device that doesn't have that sensor). It's different from `0`, and it's checked with `IS NULL`, not `= NULL`. |
| **Primary key** | A column (or a combination of columns) whose values may never be duplicated, for example `(device_id, ts)` in `readings`. This is the guard against duplicate sends. |
| **Foreign key** | A column that must point to a row that exists in another table, for example `readings.device_id`, which must be registered in `devices`. |
| **Schema** | The design of all the tables, with their columns, types, and the relations between the tables. |
| **Migration** | A numbered SQL file (`001_…`, `002_…`) that changes the shape of the tables, run in order with `npm run migrate` and recorded in the `schema_migrations` table. |
| **Transaction** | A group of changes that either all succeed (`COMMIT`) or are all undone (`ROLLBACK`). |
| **`WHERE`**, **`ORDER BY`**, **`LIMIT`** | The parts of a `SELECT` that filter the rows, sort them, and limit how many there are. |
| **`GROUP BY`** and **aggregate functions** | Grouping rows (for example per day), then summarizing each group with `avg`, `min`, `max`, or `count`. |
| **`JOIN`** | Combining the rows of two tables that point to each other, for example readings with the location of their device. |
| **Subquery** and **`DISTINCT ON`** | A subquery is a query in parentheses whose result is used by another query. `DISTINCT ON (column)` only takes the first row of each group after sorting, for example the driest reading of each day (Practice 4.7). |
| **`timestamptz`** | The type for a point in time, complete with its time zone. It's stored as UTC, then displayed in the session time zone (UTC in psql, the laptop's time in DBeaver). |
| **UTC** and **WIB** | UTC is the world's reference time; WIB (Western Indonesia Time) = UTC + 7 hours (WITA, Central Indonesia Time = UTC + 8 hours; WIT, Eastern Indonesia Time = UTC + 9 hours). The data contract and the API use UTC (the `Z` ending). |
| **`ON CONFLICT … DO NOTHING`** | An addition to `INSERT`: if the key already exists, that row is skipped without an error. Used for duplicate sends. |
| **Upsert** | A combination of insert and update: add a new row, or update the one that's already there (`ON CONFLICT … DO UPDATE`). |
| **Pool** | A group of several database connections that are opened once, then used in turn by the backend. |
| **Parameter** (`$1`, `$2`) | A placeholder for a value in an SQL statement. The value is sent separately, so content from outside is never treated as a command. |
| **SQL injection** | An attack that slips SQL commands into a value from outside, for example into an API address. Prevented with parameters. |
| **Batch insert** | Inserting many rows with one command, for example with `unnest`, instead of one at a time. |
| **Query string** | The part of a web address after the `?` sign, for example `?from=…&to=…`. In this part, the `+` sign is read as a space, so it's written `%2B`. |
| **Index** | A sorted list that helps the database find rows without reading the whole table. A primary key automatically has an index. |
| **ORM** | A library that lets you write database queries as ordinary code, for example Drizzle (🔬). |

## 📝 5-Question Quiz

1. You run `docker stop smarthome-db`, then `docker rm smarthome-db`. Are the readings that were already stored lost too? How do you start that database again, and which command really deletes its data?
2. Write an SQL query that counts how many of Node 1's (`a4cf12e5b7c0`) readings in the last hour have a temperature above 30 °C.
3. A reading is stored with the `ts` `2026-10-19T20:30:00Z`. What are its WIB date and time? Why can daily averages grouped with `ts::date` in psql end up on the wrong date, and how do you write it correctly?
4. A Node 1 `telemetry` message arrives at the backend twice, for example because a QoS 1 broker bridge sent it again after a `PUBACK` got lost. What happens in the `readings` table and in the backend's log? What would happen if `ts` were filled in by the backend with the arrival time, instead of by the device?
5. Your friend adds a new column by changing `001_initial_schema.sql`, then runs `npm run migrate`. The program answers `0 new migration(s) applied, 1 applied earlier.`, and the column doesn't show up. Why? What should they have done?

<details>
<summary><b>Answer key</b></summary>

1. **They aren't lost.** The data is stored in the `smarthome-data` volume, not in the container. Run the Quick Win's `docker run` command again: the new container uses the same volume right away, and all the tables and readings are still there. What really deletes the data is deleting the volume, `docker volume rm smarthome-data` (Practice 1).
2. One possible answer:

   ```sql
   SELECT count(*) FROM readings
   WHERE device_id = 'a4cf12e5b7c0'
     AND ts >= now() - interval '1 hour'
     AND temperature > 30;
   ```

   `count(*)` counts the rows that pass **all** the conditions in `WHERE` (Concepts 6 and 8).
3. `2026-10-19T20:30:00Z` is **03:30 WIB on October 20** (UTC + 7 hours goes past midnight). `ts::date` takes the date in the session time zone, and the psql session in the container uses UTC, so that reading ends up on the 19th: every reading from 00:00–06:59 WIB is counted on the day before. Write `(ts AT TIME ZONE 'Asia/Jakarta')::date` (Concept 9, Practice 4.5).
4. The second send has the same `(device_id, ts)` pair as a row that's already there, so `ON CONFLICT (device_id, ts) DO NOTHING` skips it: the table still holds **one** row, and the log says `duplicate skipped: a4cf12e5b7c0 …` (Practice 6). If `ts` were the arrival time, the second send would arrive a moment later, so its key would be different, and it would be stored as a **second** row. The daily averages would then be off too (Concept 10).
5. `001_initial_schema.sql` is already recorded in the `schema_migrations` table, so the migration runner skips it; changes in an old file never run. They should have put file 001 back the way it was, then created a new file with the next number, for example `002_add_new_column.sql`, holding `ALTER TABLE readings ADD COLUMN …;`, and run `npm run migrate` again (Concept 5).

</details>

---

## ✅ Module 17 Completion Checklist

The completion requirement from the Syllabus: **you can write the SQL for "average temperature per day over the last 7 days" without a cheat sheet, duplicate sends don't create duplicate rows, and the history API returns data from the database.** **The simulator path** (no Node 1 and Node 2 yet): every item of Practices 5–7 may be ticked with the fake device `f00d00000001` from the Module 16 simulator.

- [ ] The JavaScript warm-up is done, and I've checked my answers against its key (🔁).
- [ ] Docker Desktop is installed, and `docker run hello-world` answers `Hello from Docker!` (🐳 Setup).
- [ ] The `smarthome-db` container is running, and psql answers `SELECT now();` in UTC and in WIB (Quick Win).
- [ ] I can stop the container and start it again, and I've proven that its data stays in the volume (Practice 1).
- [ ] DBeaver is connected to `smarthome`, and I can explain why the clock in DBeaver is different from the clock in psql (Practice 2).
- [ ] `npm run migrate` creates all six tables, and running it once more doesn't change anything (Practice 3).
- [ ] ⭐ I wrote, by myself and without looking at the module, the query for the **average temperature per day over the last 7 days** with WIB dates, and its result is exactly the same as the Practice 4.5 query that I ran afterward for comparison (on another day, the numbers may differ from the module's example; see the box in Practice 4.2).
- [ ] I can answer "what time was the soil driest each day this week?" with SQL (Practice 4.7).
- [ ] ⭐ Backend v0.2 stores every MQTT message, and after the server restarts, the number of Node 1 readings in the database doesn't go back to zero (Practice 5).
- [ ] ⭐ The same `telemetry`, sent twice from MQTTX, only produces **one** row, and the log says `duplicate skipped` (Practice 6).
- [ ] ⭐ `GET /devices/<id>/readings` returns the history from the database in the browser and in Bruno, and both tests of `Node 1 history` pass (Practice 7).
- [ ] Commands from Bruno are recorded in the `commands` table, complete with the result of their `ack` (Practice 7.6).
- [ ] `backend/README.md` is updated for v0.2 (➕ A).
- [ ] ⭐ All the Module 17 work is on `main` of the `mini-smart-home` repository, through a pull request, without `.env` (➕ B).

🎉 **Mini Smart Home now has a long-term memory.** Every reading is stored, can be queried with SQL, and can be requested through the API. The next challenge: the `readings` table will keep growing, about 8,640 rows per day for Node 1 alone. Keeping it fast and tidy is the next module's job.

> ➡️ **Next module:** Module 18 — TimescaleDB: Time-Series Data, Automatic Aggregation, Retention, & Backup. The `readings` table becomes a hypertable, the question "the average per hour" is answered in an instant even with a million rows of data, old data is thrown away automatically without losing its summaries, and you learn to make and restore backups.

---

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- Docker: [installing Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/) and [on Mac](https://docs.docker.com/desktop/setup/install/mac-install/), [WSL 2](https://docs.docker.com/desktop/features/wsl/), [Docker Desktop settings](https://docs.docker.com/desktop/settings-and-maintenance/settings/), the [Docker Desktop release notes](https://docs.docker.com/desktop/release-notes/) 4.95 (Docker Engine 29.8.2), [*port publishing*](https://docs.docker.com/engine/network/port-publishing/) (why `127.0.0.1`), the [*restart policy*](https://docs.docker.com/engine/containers/start-containers-automatically/), [Docker Hub's download limits](https://docs.docker.com/docker-hub/usage/), and the source code of the Docker CLI and Engine at [github.com/docker/cli](https://github.com/docker/cli) and [github.com/moby/moby](https://github.com/moby/moby) (tag 29.8.2) for the shape of the `docker` output. Installing WSL: [Microsoft's documentation](https://learn.microsoft.com/windows/wsl/install).
- The database image: [`timescale/timescaledb` on Docker Hub](https://hub.docker.com/r/timescale/timescaledb) (tag `2.30.2-pg17`), [its image repository](https://github.com/timescale/timescaledb-docker), the [TimescaleDB Docker guide](https://www.tigerdata.com/docs/self-hosted/latest/install/installation-docker), and the startup scripts of the official PostgreSQL image at [github.com/docker-library/postgres](https://github.com/docker-library/postgres) (`POSTGRES_PASSWORD`, `POSTGRES_DB`, one-time initialization).
- PostgreSQL 17: [`CREATE TABLE`](https://www.postgresql.org/docs/17/sql-createtable.html), [constraints and keys](https://www.postgresql.org/docs/17/ddl-constraints.html), [`INSERT … ON CONFLICT`](https://www.postgresql.org/docs/17/sql-insert.html), [`SELECT`](https://www.postgresql.org/docs/17/sql-select.html) (`GROUP BY`, `JOIN`, `DISTINCT ON`), [date and time types](https://www.postgresql.org/docs/17/datatype-datetime.html) (`timestamptz`, `AT TIME ZONE`), [date and time functions](https://www.postgresql.org/docs/17/functions-datetime.html) (`date_trunc`), [`SET TIME ZONE`](https://www.postgresql.org/docs/17/sql-set.html), [transactions](https://www.postgresql.org/docs/17/tutorial-transactions.html), [`EXPLAIN`](https://www.postgresql.org/docs/17/using-explain.html), [psql](https://www.postgresql.org/docs/17/app-psql.html), and the [versioning policy](https://www.postgresql.org/support/versioning/) (PostgreSQL 17.11).
- [node-postgres](https://node-postgres.com) (`pg` 8.23.1): pools, parameterized queries, transactions, and type conversion; its source code is at [github.com/brianc/node-postgres](https://github.com/brianc/node-postgres).
- [DBeaver Community](https://dbeaver.io) 26.2.3: the [documentation wiki](https://github.com/dbeaver/dbeaver/wiki) and the source code at [github.com/dbeaver/dbeaver](https://github.com/dbeaver/dbeaver) (menu and button labels).
- From Module 16: [Fastify](https://fastify.dev/docs/latest/) 5.12.7 (query string validation), [Zod](https://zod.dev) 4.6.7 (`z.iso.datetime`, `z.iso.date`, `.refine` with `when`), [Bruno](https://docs.usebruno.com) 4.2.1 (**Assert**, **Clone**), and Swagger UI through @fastify/swagger-ui.
- The `+` sign as a space in a query string: [WHATWG URL Standard, `application/x-www-form-urlencoded`](https://url.spec.whatwg.org/#application/x-www-form-urlencoded) and [MDN: *Percent-encoding*](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding).
- Further reading for 🔬: [Drizzle ORM](https://orm.drizzle.team) 0.45.4, [Raspberry Pi OS](https://www.raspberrypi.com/software/operating-systems/), [installing Docker Engine on Debian](https://docs.docker.com/engine/install/debian/), and the [Raspberry Pi getting started guide](https://www.raspberrypi.com/documentation/computers/getting-started.html) (the choice of card and storage).

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-17`, `board-and-archive`, `docker-image-container`, `smart-home-schema`, `time-utc-wib`, `duplicate-send`, `daily-average-query`, `project-diagram-module-17` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The schema from this module's `001_initial_schema.sql` migration; Docker's behavior from the Docker documentation above; time and duplicate sends from the PostgreSQL documentation and data contract 1.2; the numbers of the daily average query from the `npm run seed-history` practice data. | CC BY 4.0 |
| `swagger-history.png` | Real screenshots of the `/docs` page of this module's backend (Swagger UI 5.32.6 through @fastify/swagger-ui 6.1.2) on the author's laptop: the `GET /devices/{id}/readings` route tried with **Try it out**; cropped and rearranged, with title, numbers, and captions by the author. | Swagger UI is licensed Apache 2.0; @fastify/swagger-ui is licensed MIT; image: CC BY 4.0 |

**About the Expected output boxes.** All of this module's backend code, including each of its stages in the `code/stages/` folder, has been checked with `npm run check` (TypeScript 7.0.2) and run with Node.js 24.21.0 on Windows. The output of the SQL, the backend, the Bruno CLI, and Swagger UI was recorded on the author's laptop with a lab PostgreSQL server (version 18; all the SQL in this module behaves the same on PostgreSQL 17), psql, a local MQTT broker, and a mock Node 1 and Node 2 that send messages exactly as the data contract says. The practice data is made with `npm run seed-history`, so its averages are the same on anyone's laptop. The output of the `docker` commands and of psql inside the container was checked against recordings made on the author's Windows laptop (Docker Desktop 4.77, Docker Engine 29.5.3, the same `timescale/timescaledb:2.30.2-pg17` image), except for the image's first download and `hello-world`, which were written from Docker's source code and the `hello-world` image. The Docker Desktop screens were written from the official documentation (October 2026). Outputs that contain IDs, times, or sizes are marked **example**. The dates, times, `id`s, and waits on your screen will certainly be different.

---

[⬅️ Module 16](../module-16-backend-typescript-api-git/README.md) · [Phase 3](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 18 — TimescaleDB](../module-18-timescaledb/README.md) ➡️**
