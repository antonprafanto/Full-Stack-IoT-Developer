# Module 18 — TimescaleDB: Time-Series Data, Automatic Aggregation, Retention, & Backup

🌐 **English** · [Bahasa Indonesia](../../../fase-3-backend-data/modul-18-timescaledb/README.md)

*Phase 3 · Week 18 · Hardware: **not required** — data from backend v0.2 (Node 1, Node 2, or the Module 16 simulator) plus 1 million rows of test data made by this module · Prerequisites: **Module 17** (the `smarthome` database in Docker and backend v0.2) · Time: 8–10 hours, spread over the week*

[⬅️ Module 17](../module-17-sql-and-database-schema/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 19 ➡️](../module-19-realtime-rules-notifications/README.md)

---

Since Module 17, your backend is no longer forgetful: every reading goes into the **archive book**, the `readings` table in the PostgreSQL database. But that book never stops growing. Node 1 alone writes one row every 10 seconds, so **8,640 rows a day** and more than **3 million rows a year**. Add Node 2, new devices, and a few years of use, and questions that were answered in an instant in Module 17 start to feel heavy: "the average per 15 minutes over a month" has to read hundreds of thousands of rows. The disk slowly fills up too, and if the database volume breaks, the whole history is lost with it, because there has never been a copy.

The good news is that the tool is already on your laptop. The `smarthome-db` container you started in Module 17 uses the `timescale/timescaledb` image, so **TimescaleDB**, a PostgreSQL add-on made for time-series data, has been installed from the start. This week you use it for real.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| The `readings` table keeps swelling: millions of rows in a year. | Sensor data only grows and is almost never changed. | **Hypertable**: a table that's automatically cut per day into chunks, that is, pieces or "binders" (Concept 2, Practice 2) |
| "The average per 15 minutes" needs a complicated query. | PostgreSQL's built-in `date_trunc` only cuts per whole minute, hour, or day, not every 15 minutes. | **`time_bucket`**: time buckets of 15 minutes, 1 hour, or 1 day (Concept 3, Practice 3) |
| An hourly chart for a month recalculates hundreds of thousands of rows every time it's opened. | The summary is computed from scratch in every query. | ***Continuous aggregate***: an hourly "summary book" that's updated automatically (Concepts 5–6, Practice 5) |
| The disk fills up over time. | Raw data is never thrown away, and it's stored as it is. | **Retention** (raw data older than 90 days is dropped, its summaries stay) and the **columnstore** (old data is compressed) (Concepts 7–8, Practice 6) |
| If the laptop breaks or the volume is deleted, the whole history is lost. | There has never been a backup copy. | A **backup** with `pg_dump` and a **restore** with `pg_restore`, proven to give back exactly the same data (Concept 9, Practice 7) |
| It has never been tested with big data. | The Module 17 practice data is only about 2,300 rows. | **1 million rows of test data** and `EXPLAIN (ANALYZE)` to measure the speed honestly (Concept 4, Practice 4) |
| Other apps can't ask for summaries yet. | API v0.2 only sends raw readings, at most 1,000. | **`GET /devices/:id/readings?bucket=1h`** in backend **v0.3** (Concept 10, Practice 8) |

By the end of the week, `readings` has become a hypertable tested with more than a million rows. The query "the average per hour over the last 7 days" finishes in **under one second**, the hourly summary updates itself, old raw data is dropped automatically without losing its summaries, and you have a **backup that's proven to restore** into an empty database with exactly the same contents. Backend **v0.3** provides history per 15 minutes, per hour, and per day for the dashboard in Phase 4.

![Module 18 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 3 Backend and data, Modules 16 to 21, is highlighted with a green frame. Modules 1 to 17 are marked done, Modules 19 to 21 are green, and Module 18 is marked YOU ARE HERE with the note: a history ready to grow, that is, hypertable, automatic summaries, retention, and backup. Below that, the box for this week's Module 18, 8 to 10 hours spread out; hardware is not required, and this module continues directly from Module 17 with the smarthome-db container and backend v0.2. The list of activities: the JavaScript warm-up, that is, a dictionary, floor/ceil, a WIB day, and Number; Quick Win, your first time bucket; Practice 1, meet TimescaleDB and create a branch; Practice 2, readings becomes a hypertable; Practice 3, time buckets with time_bucket; Practice 4, one million rows and measure the speed, with the pass requirement under 1 second; Practice 5, an automatic hourly summary; Practice 6, 90-day retention and the columnstore; Practice 7, a backup and restore that's proven, with the pass requirement the same data; Practice 8, backend v0.3 with history per bucket; and the Add-on, README v0.3 and a pull request to main. Practices 2, 4, 5, 7, 8, and the Add-on are marked with a star, required to pass. Note at the bottom: all of this week's work is on the laptop, that is, Docker Desktop, psql inside the container, and VS Code, plus DBeaver and Bruno; Practices 2 to 7 use the Module 17 practice data and 1 million rows of test data for beef00000001, while Node 1 or the simulator is only an extra in Practice 8.](assets/roadmap-module-18.png)

> [!NOTE]
> **How to use this module.**
>
> - **All of this week's work is on the laptop.** Every command box says where it's used: the **VS Code terminal** (in the `backend` folder), **psql** (the SQL window inside the database container), **DBeaver**, **Docker Desktop**, or **Bruno**. Node 1's `device_id` `a4cf12e5b7c0` and the Pi's address `192.168.1.37` are only examples; use your own.
> - **Hardware isn't required.** Practices 2–7 use the **practice data** from Module 17 and **1 million rows of test data** for a special device, `beef00000001`, that this module creates. Practice 8 is more fun if there are new messages (from Node 1 or the Module 16 simulator), but you can still do it without them.
> - **A direct continuation of Module 17.** The `smarthome-db` container, the `smarthome-data` volume, the DBeaver connection, and backend v0.2 on the `main` branch are used again as they are. The only new things are migrations 002–005, one SQL file of test data, and small changes in the backend.
> - **The Expected output boxes.** The author ran all of this module's commands, SQL, and code on a Windows laptop with Docker Desktop, the same `timescale/timescaledb:2.30.2-pg17` image as in Module 17, and Node.js 24. Times (in milliseconds), sizes (in MB), chunk names, and job numbers (a job is a scheduled task) on your screen may be different, so outputs like those are marked **example**. The shape of the output is the same.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in VS Code, DBeaver, the browser, and Bruno. **Except in the terminal:** stopping a running program is still **Ctrl + C**. Terminal commands are exactly the same on Windows and macOS, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The test data is only for the device `beef00000001`.** Those million rows are deliberately given their own `device_id` so that they don't get mixed up with your devices' data, and they can be cleaned up again at the end of the module (➕ D).
> 2. **Retention deletes raw data automatically, and it can't be undone.** Set up the retention policy only after the hourly summary has been filled in (Practices 5–6), and understand the 90-day number before you use it on real data.
> 3. **A backup file holds all your data.** Keep it in the `backup/` folder (Practice 7 adds it to `.gitignore`), don't commit it, and don't send it to anyone.
> 4. **Always test a restore into a NEW database** (`smarthome_restored`), never over `smarthome`.
> 5. **The shape of the tables is still changed only through migration files**, as in Module 17. The hypertable, the summary, retention, and the columnstore are all written as numbered migrations.

This module follows the same rhythm as Modules 1–17. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🏆 Quick Win: your first time bucket (20 minutes)](#-quick-win-your-first-time-bucket-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Time-series data](#1-time-series-data-a-diary-not-a-phone-book) · [2 Hypertables](#2-hypertables-and-chunks-an-archive-filed-into-daily-binders) · [3 `time_bucket`](#3-time_bucket-time-buckets) · [4 Indexes & `EXPLAIN`](#4-indexes-and-explain-how-the-database-finds-the-answer) · [5 Continuous aggregates](#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk) · [6 Jobs](#6-jobs-and-policies-clerks-that-work-on-their-own) · [7 Retention](#7-retention-drop-old-binders-keep-their-summaries) · [8 Columnstore](#8-columnstore-compressing-old-binders) · [9 Backup & restore](#9-backup-and-restore-photocopy-the-archive-then-prove-it-can-be-restored) · [10 From the backend](#10-from-the-backend-one-bucket-parameter)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 TimescaleDB](#practice-1--meet-timescaledb-and-create-a-branch-15-minutes) · [2 Hypertable](#practice-2--readings-becomes-a-hypertable-30-minutes) · [3 `time_bucket`](#practice-3--time-buckets-with-time_bucket-30-minutes) · [4 One million rows](#practice-4--one-million-rows-and-measure-the-speed-45-minutes) · [5 Hourly summary](#practice-5--an-automatic-hourly-summary-40-minutes) · [6 Retention & columnstore](#practice-6--90-day-retention-and-the-columnstore-40-minutes) · [7 Backup & restore](#practice-7--a-backup-and-restore-thats-proven-45-minutes) · [8 Backend v0.3](#practice-8--backend-v03-history-per-bucket-45-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-18-completion-checklist)

## 🎯 After this module you can…

1. **Explain why sensor data is different from ordinary data** (it keeps growing, is rarely changed, and is asked about per time range) and what TimescaleDB adds to PostgreSQL.
2. **Turn a table that already holds data into a hypertable** through a numbered migration, then look at its chunks in psql and DBeaver.
3. **Summarize data per time bucket** with `time_bucket` (15 minutes, 1 hour, 1 WIB day; WIB = Western Indonesia Time, UTC+7).
4. **Measure query speed honestly** with `EXPLAIN (ANALYZE)` on 1 million rows of test data, until the query "the hourly average over the last 7 days" finishes in **under one second**.
5. **Create an hourly summary that's updated automatically** (a continuous aggregate) and compute an exact daily average from that summary.
6. **Set up retention and columnstore policies** that drop and compress old data by themselves, without losing its summaries.
7. **Make a backup with `pg_dump`, restore it with `pg_restore` into an empty database, and prove that its contents are exactly the same**.
8. **Add history per bucket to backend v0.3** (`GET /devices/:id/readings?bucket=1h`) with Zod, Swagger, and Bruno.

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **Your Module 17 results** | Docker Desktop, the **`smarthome-db`** container (image `timescale/timescaledb:2.30.2-pg17`) running, the `smarthome-data` volume, the `smarthome` DBeaver connection, and **backend v0.2**, merged into `main` in Module 17 ➕ B. |
| **About 1 GB of extra disk space** | One million rows of test data, a temporary comparison table, the change records that PostgreSQL keeps (the *write-ahead log*, WAL), and the backup file. On the lab laptop, the data volume grew to about 780 MB. |
| **Node.js 24, VS Code, Git, Bruno** | The same as in Modules 16–17. |
| **An MQTT broker and Node 1 / Node 2** (optional) | The Pi gateway or the laptop broker from Module 12, the devices from Modules 14–15, or the Module 16 simulator (`tools/device-simulator.js`). Only used if you want to see new readings make it into the summary in Practice 8. |
| **A terminal for backups on Windows** | **PowerShell**: Windows PowerShell 5.1, which is already on every Windows, or PowerShell 7 if you installed it. Practice 7 explains why it's better not to use Git Bash for the backup commands. |
| **An internet connection** | No big downloads this week: the TimescaleDB image is already there from Module 17, and backend v0.3 doesn't use any new library. |

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, and the `learn-iot` repository folder.

As in Modules 16–17, the Phase 3 modules open with a JavaScript warm-up. This week's new backend feature, history per bucket (Practice 8), uses five small skills: an object as a **dictionary**, rounding a time down with **`Math.floor`**, counting buckets with **`Math.ceil`**, shifting the clock for a **WIB day**, and converting **numbers that arrive as text** from the database. This warm-up goes over all five in one small file. Type the code yourself (don't copy and paste), run it after every step, then compare the output.

**Prepare the folder.** Open the **`learn-iot`** repository folder in VS Code, first click the empty space in the Explorer panel, create a new folder **`module-18`**, then create the file **`warmup.js`** inside it. In the VS Code terminal, go into that folder:

```text
cd module-18
```

No `npm init` this time: this file doesn't use any library and doesn't use `await`, so Node.js can run it directly.

### Step 1 — An object as a dictionary

A dictionary holds pairs of **keyword → meaning**. A JavaScript object can be used exactly like that: its keys are text, and its values can be anything. Backend v0.3 uses a dictionary to translate `?bucket=1h` into a bucket width and its default range. Type this in `warmup.js`:

```js
// warmup.js - a JavaScript warm-up again before Module 18

// 1. An object as a dictionary
const MINUTE = 60 * 1000; // one minute in milliseconds
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const BUCKETS = {
  "15m": { width: 15 * MINUTE, defaultSpan: DAY },
  "1h": { width: HOUR, defaultSpan: 7 * DAY },
};
const choice = "1h"; // for example from ?bucket=1h
console.log(BUCKETS[choice].width); // 3600000 milliseconds = 1 hour
console.log(BUCKETS[choice].defaultSpan / HOUR); // the default range in hours
console.log(BUCKETS["2h"]); // a key that doesn't exist
console.log("2h" in BUCKETS, Object.keys(BUCKETS));
```

Save (**Ctrl + S**), then run it in the terminal:

```text
node warmup.js
```

**Expected output:**

```text
3600000
168
undefined
false [ '15m', '1h' ]
```

- Keys that contain numbers or unusual letters, like `"15m"`, are written between double quotes. A value is read with **square brackets**: `BUCKETS[choice]`. Square brackets are used because the key is inside a variable; `BUCKETS.choice` would look for a key that's literally named `choice`.
- A key that doesn't exist gives **`undefined`**, not an error. Only when its value is used right away (`BUCKETS["2h"].width`) does the program stop with a `TypeError`. That's why backend v0.3 checks `bucket` with Zod first: only `15m`, `1h`, and `1d` may pass.
- **`in`** asks "is this key there?", and **`Object.keys`** gives a list of all the keys.

### Step 2 — Rounding down to the start of the bucket

A 15-minute bucket starts at 10:00, 10:15, 10:30, and so on. 10:37 goes into the 10:30 bucket. In JavaScript, you divide the time by the bucket width, round it down, then multiply it again. Add this at the very bottom:

```js
// 2. Rounding down to the start of a bucket
const time = new Date("2026-10-20T10:37:00+07:00"); // 10:37 WIB
const width = BUCKETS["15m"].width;
const bucketStart = new Date(Math.floor(time.getTime() / width) * width);
console.log(bucketStart.toISOString()); // 10:30 WIB, written in UTC
```

**Expected output** (the new line):

```text
2026-10-20T03:30:00.000Z
```

`getTime()` gives the time in milliseconds since January 1, 1970 UTC. **`Math.floor`** rounds down by throwing away the fraction (`7.4` becomes `7`), so the quotient "how many whole buckets since 1970" loses its 7 leftover minutes. Multiplied by the bucket width again, the result is the start of the bucket: 03:30 UTC, which is 10:30 WIB. Backend v0.3 uses this trick so that the first bucket in an API answer is always whole (Concept 10).

### Step 3 — How many buckets fit in a range?

API v0.3 rejects requests that would give more than 1,000 buckets. For that, the backend counts the buckets before it asks the database:

```js
// 3. How many buckets fit in one range?
const fromTime = new Date("2026-10-13T00:00:00+07:00");
const toTime = new Date("2026-10-20T00:00:00+07:00");
console.log((toTime.getTime() - fromTime.getTime()) / HOUR); // exactly 168 hours
const afternoon = new Date("2026-10-20T14:20:00+07:00");
console.log(Math.ceil((afternoon.getTime() - fromTime.getTime()) / HOUR)); // a last bucket that isn't full still counts
```

**Expected output** (the new lines):

```text
168
183
```

Exactly seven days hold 168 one-hour buckets. Up to 14:20 today, the quotient is 182.33…, and **`Math.ceil`** rounds it **up** to 183, because the 14:00–15:00 bucket, filled for only 20 minutes so far, is still one point on the chart.

### Step 4 — A WIB day: shift by 7 hours first

The `Math.floor` trick of step 2 gives bucket boundaries according to **UTC**. For 15-minute and 1-hour buckets, that's no problem (Concept 3). For **daily** buckets, a UTC day starts at 07:00 WIB. The way out is to shift the clock to WIB, round it, then shift it back:

```js
// 4. A WIB day: shift by 7 hours first
const SHIFT = 7 * HOUR; // WIB = UTC + 7 hours
const dawn = new Date("2026-10-20T05:00:00+07:00"); // 05:00 WIB
const utcDay = new Date(Math.floor(dawn.getTime() / DAY) * DAY);
const wibDay = new Date(Math.floor((dawn.getTime() + SHIFT) / DAY) * DAY - SHIFT);
console.log(utcDay.toISOString()); // the start of the UTC day
console.log(wibDay.toISOString()); // the start of the WIB day, written in UTC
```

**Expected output** (the new lines):

```text
2026-10-19T00:00:00.000Z
2026-10-19T17:00:00.000Z
```

05:00 WIB on the 20th is the same as 22:00 UTC on the **19th**. Ordinary rounding gives the start of the UTC day of the 19th, which is 07:00 WIB on the 19th, so that dawn reading would end up in "yesterday". With the shift, the result is `2026-10-19T17:00:00.000Z`, which is **00:00 WIB on the 20th**: the right day. In SQL, `time_bucket('1 day', ts, 'Asia/Jakarta')` does the same thing.

### Step 5 — Numbers that arrive as text

Remember 🔬 "Numbers that arrive as text" in Module 17? The `pg` library sends numbers of the types `numeric` and `bigint` as **text** (not as numbers) so that no digits are lost. A `numeric` example: the result of `round(avg(temperature)::numeric, 1)`, or `avg` of an integer column such as `humidity`. A `bigint` example: the result of `count(*)`. Add:

```js
// 5. Numbers that arrive as text
const rows = [
  { time: new Date("2026-10-19T03:00:00Z"), avg_temp: "26.31", count: "6" }, // numeric and bigint from pg = text
];
console.log(rows[0].avg_temp + 1); // text + number = text
const tidy = rows.map((r) => ({
  time: r.time.toISOString().slice(0, 19) + "Z",
  avg_temp: Number(r.avg_temp),
  count: Number(r.count),
}));
console.log(tidy);
console.log(tidy[0].avg_temp + 1);
```

**Expected output** (the new lines):

```text
26.311
[ { time: '2026-10-19T03:00:00Z', avg_temp: 26.31, count: 6 } ]
27.31
```

- `"26.31" + 1` gives the text **`26.311`**, not 27.31: the `+` sign with text means joining. A mistake like this slips into a dashboard easily.
- **`.map`** reshapes every row into a new object: the time is written in the data contract format, and the number text is converted with **`Number(…)`**.
- Backend v0.3 takes a shorter road: the numbers are converted **inside SQL** with `::float8` and `::int`, so `pg` sends numbers right away. The only thing `.map` still does is write the time.

**Test yourself (10 minutes).** Without looking at the key:

1. Change step 2 so that it rounds 10:37 WIB down to the start of a **1-hour** bucket. What's the result?
2. How many **15-minute** buckets are there from `fromTime` to `toTime` in step 3?
3. A reading at **23:30 WIB** on the 20th belongs to which WIB day? Work it out with the `wibDay` formula of step 4, then compare it with the `utcDay` formula.

<details>
<summary>Self-test answer key</summary>

```js
// test 1: the start of a 1-hour bucket
console.log(new Date(Math.floor(time.getTime() / HOUR) * HOUR).toISOString());

// test 2: the number of 15-minute buckets in 7 days
console.log((toTime.getTime() - fromTime.getTime()) / (15 * MINUTE));

// test 3: the WIB day and the UTC day for 23:30 WIB
const night = new Date("2026-10-20T23:30:00+07:00");
console.log(new Date(Math.floor((night.getTime() + SHIFT) / DAY) * DAY - SHIFT).toISOString());
console.log(new Date(Math.floor(night.getTime() / DAY) * DAY).toISOString());
```

1. The result is `2026-10-20T03:00:00.000Z`, which is 10:00 WIB.
2. The result is `672`: 168 hours × 4 buckets per hour.
3. The `wibDay` formula gives `2026-10-19T17:00:00.000Z`, which is 00:00 WIB on the **20th**: right, because 23:30 WIB is still the 20th. The `utcDay` formula gives `2026-10-20T00:00:00.000Z`, which is 07:00 WIB on the 20th. For this time the date happens to be the same, but the boundary is wrong: a reading at 05:00 WIB on the 21st would also end up in the day of the 20th.

</details>

The warm-up is done. The `warmup.js` file goes to GitHub along with your learning notes in ➕ C.

> ➡️ **Continue** to [🏆 Quick Win](#-quick-win-your-first-time-bucket-20-minutes).

## 🏆 Quick Win: your first time bucket (20 minutes)

> 🖥️ **Tools used:** **Docker Desktop**, the **VS Code terminal** (the `mini-smart-home/backend` folder), and **psql** inside the container.

The target: in 20 minutes, you turn hundreds of readings into **averages per 15 minutes** with one TimescaleDB function, without installing anything.

### Step 1 — Start the database (2 minutes)

Open **Docker Desktop** and wait until its engine is running. The `smarthome-db` container starts by itself thanks to `--restart unless-stopped` from Module 17. Check this in the VS Code terminal:

```text
docker ps
```

The `smarthome-db` row must have the status `Up …`. If it isn't there, start it with `docker start smarthome-db` (Module 17 Practice 1.2).

### Step 2 — Refresh the practice data (3 minutes)

The Module 17 practice data was made for the seven days **before the day you filled it in**. If you did Module 17 last week, the data is already "old", and the numbers in this module won't match. As in the box in Module 17 Practice 4.2, first empty the practice readings, then fill them in again. The warm-up was done in the `learn-iot` repository, while this step needs the Mini Smart Home project. In VS Code, choose **File → Open Folder…**, open the `mini-smart-home` folder, then open a new terminal (**Terminal → New Terminal**). A new terminal always starts in the `mini-smart-home` folder, so type `cd backend` first. After that, run these two commands one at a time:

```text
docker exec smarthome-db psql -U postgres -d smarthome -c "DELETE FROM readings WHERE device_id IN ('f00d00000001', 'f00d00000002');"
npm run seed-history
```

**Expected output** (example; the numbers depend on what's in your database and on the time you run them):

```text
DELETE 2286
```

```text
f00d00000001: 1143 readings sent, 1143 newly stored
f00d00000002: 1143 readings sent, 1143 newly stored
```

The first command **only** deletes the readings of the two practice devices (`WHERE device_id IN (…)`, Module 17 Concept 7); your own devices' readings aren't touched. On the simulator path, the simulator readings for `f00d00000001` and `f00d00000002` from Module 17 are deleted too, because their numbers are the same, and that's fine. `docker exec … psql -c "…"` runs one SQL statement without going into psql. The second command fills in seven full days again, up to now, so that yesterday and the days before hold exactly the same numbers as this module. **Write down today's date** (in WIB) in your notes: Practices 3, 5, and 8 call it **day H**, and their examples are counted from that date.

### Step 3 — TimescaleDB is already there (3 minutes)

Go into psql:

```text
docker exec -it smarthome-db psql -U postgres -d smarthome
```

Then type this psql command (it starts with a backslash and has no semicolon):

```text
\dx
```

**Expected output:**

```text
                                                List of installed extensions
    Name     | Version |   Schema   |                                      Description                                      
-------------+---------+------------+---------------------------------------------------------------------------------------
 plpgsql     | 1.0     | pg_catalog | PL/pgSQL procedural language
 timescaledb | 2.30.2  | public     | Enables scalable inserts and complex queries for time-series data (Community Edition)
(2 rows)
```

`\dx` (describe extensions) shows the add-ons installed in this database. **`timescaledb` version 2.30.2** has been there since you ran `docker run` in Module 17, because the image installs it automatically. The `plpgsql` row is PostgreSQL's built-in programming language, and you don't need to deal with it.

### Step 4 — The average per 15 minutes (7 minutes)

Still in psql, type (or paste) this query, then press **Enter**:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT time_bucket('15 minutes', ts) AS bucket,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= now() - INTERVAL '2 hours'
GROUP BY bucket
ORDER BY bucket;
```

**Expected output** (example; the times and the numbers follow the moment you run it):

```text
         bucket         | avg_temp | count 
------------------------+----------+-------
 2026-10-20 20:30:00+07 |     26.6 |     2
 2026-10-20 20:45:00+07 |     25.9 |     1
 2026-10-20 21:00:00+07 |     25.9 |     2
 2026-10-20 21:15:00+07 |     25.6 |     1
 2026-10-20 21:30:00+07 |     25.4 |     2
 2026-10-20 21:45:00+07 |     24.7 |     1
 2026-10-20 22:00:00+07 |     25.0 |     2
 2026-10-20 22:15:00+07 |     24.8 |     1
(8 rows)
```

Those are two hours of readings from a practice device, grouped into 15-minute buckets, each with its average. **`time_bucket('15 minutes', ts)`** turns every `ts` into the start of its bucket, and `GROUP BY bucket` summarizes every bucket into one row (Concept 3 goes deeper). Before that table, psql writes `SET`, a sign that the session zone has been changed. `SET` and `RESET` lines like that aren't written in this module's Expected output boxes.

Look at the `count` column, which alternates **2, 1, 2, 1**. The practice data was made every 10 minutes (20:30, 20:40, 20:50, …), so the 20:30–20:45 bucket holds two readings (20:30 and 20:40), while the 20:45–21:00 bucket holds only one (20:50). Real Node 1 readings, which arrive every 10 seconds, fill every 15-minute bucket with about ninety readings.

### Step 5 — Change the bucket width (5 minutes)

Change `'15 minutes'` to `'1 hour'` and `'2 hours'` to `'6 hours'`, then run it again:

```sql
SELECT time_bucket('1 hour', ts) AS bucket,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= now() - INTERVAL '6 hours'
GROUP BY bucket
ORDER BY bucket;
```

**Expected output** (example):

```text
         bucket         | avg_temp | count 
------------------------+----------+-------
 2026-10-20 16:00:00+07 |     29.5 |     3
 2026-10-20 17:00:00+07 |     29.2 |     6
 2026-10-20 18:00:00+07 |     28.4 |     6
 2026-10-20 19:00:00+07 |     27.5 |     6
 2026-10-20 20:00:00+07 |     26.6 |     6
 2026-10-20 21:00:00+07 |     25.5 |     6
 2026-10-20 22:00:00+07 |     24.9 |     3
(7 rows)
```

Changing just two values is enough, and the summary is now per hour. The buckets in the middle hold six readings (one every 10 minutes for one hour). The first and the last buckets are only partly filled, because "the last six hours" starts in the middle of the 16:00 hour and ends in the middle of the 22:00 hour. The temperature drops from afternoon to night, exactly the daily pattern that the practice data script makes.

Put the session zone back and leave psql:

```text
RESET TIME ZONE;
\q
```

🎉 **Your first win!** You've just summarized time-series data with a special TimescaleDB function. So far, `readings` is still a plain table; `time_bucket` already works on plain tables too. From Practice 2 on, that table becomes a hypertable, and the rest of this module keeps summaries like this lightning fast even when the data is millions of rows.

> [!TIP]
> **Not working?**
>
> - `Cannot connect to the Docker daemon` or `failed to connect to the docker API` → Docker Desktop isn't running yet. Wait until the whale icon stops moving, then try again.
> - `npm run seed-history` answers `connect ECONNREFUSED 127.0.0.1:5432` → the `smarthome-db` container isn't running yet (step 1). If you used counter `5433` in Module 17, make sure `DATABASE_URL` in `.env` still says `5433`.
> - `npm error Missing script: "seed-history"` or `npm error enoent Could not read package.json` → the terminal isn't in the `backend` folder (for example, it's still in the `learn-iot` folder from 🔁), or the active branch isn't the result of Module 17. Open the `mini-smart-home` folder as in step 2, run `git switch main`, then `cd backend`.
> - The query of step 4 answers `(0 rows)` → the practice data doesn't cover the last two hours. Repeat step 2 from the `backend` folder.
> - `ERROR:  function time_bucket(unknown, timestamp with time zone) does not exist` → this database doesn't load TimescaleDB. Usually that's because its container was made from another image (for example `postgres:17`). Check the **IMAGE** column of `docker ps`: it must be `timescale/timescaledb:2.30.2-pg17`.

> ➡️ **Continue** to [🧠 The "Why" Concepts](#-the-why-concepts).

## 🧠 The "Why" Concepts

There are ten concepts. You don't need to read them all at once before the practices. The order:

1. Quick Win (already done) → Concepts 1–2 → Practices 1–2 (TimescaleDB and the hypertable)
2. Concepts 3–4 → Practices 3–4 (time buckets, 1 million rows, and measuring speed)
3. Concepts 5–6 → Practice 5 (the automatic summary)
4. Concepts 7–8 → Practice 6 (retention and the columnstore)
5. Concept 9 → Practice 7 (backup and restore)
6. Concept 10 → Practice 8 (backend v0.3)

The ⬆️/➡️ boxes at the end of every practice and at the end of every group of concepts above take you to the next step. The SQL snippets in the concepts are only for reading: they're all run in the practices, and the ones that change the shape of tables (the hypertable, the summary book, retention, the columnstore) are run only through migration files.

### 1. Time-series data: a diary, not a phone book

In Module 17, the database was compared to an **archive book**. It turns out there are two kinds of archives, and they behave very differently. The first is like a **phone book**: it holds names and numbers, the number of entries hardly changes, and any row can be changed at any time (people move house, change numbers). The `devices` and `users` tables are like this. The second is like a **diary**: every entry is written on the next page with a date and a time, old entries are never changed, and the book keeps getting thicker. The `readings` table is a diary.

Data like this, where every row is marked with a time and the rows keep coming, is called **time-series data**. It has its own typical traits:

| Trait | Phone book (`devices`) | Diary (`readings`) |
| :--- | :--- | :--- |
| Growth | Hardly any | Keeps growing: Node 1 alone writes 8,640 rows a day |
| Changing old rows | Often (an `UPDATE` of a name, a location) | Almost never: yesterday's 10:10 reading will never change |
| The usual question | "Who owns this number?" (one row) | "What's the average temperature **per hour** over **a week**?" (thousands of rows in one **time range**) |
| Old data | Stays important | The older it gets, the less often it's read; often its summary is enough |

Plain PostgreSQL treats both kinds of tables the same. For a diary millions of rows thick, that's wasteful: queries per time range have to go through an index that keeps getting bigger, a `DELETE` to throw away old data runs slowly and leaves "holes" on the disk, and every summary is computed again from scratch. **TimescaleDB** is a PostgreSQL add-on (an extension) that teaches the database how to look after a diary. It isn't another database: your tables are still PostgreSQL tables, your SQL is still the same SQL, and DBeaver and the `pg` library stay connected as usual. What's added is a few special abilities, and this week you use five of them: the hypertable, `time_bucket`, the continuous aggregate, retention, and the columnstore.

TimescaleDB was made by a company that used to be called Timescale and is now called **Tiger Data**. The add-on is still called TimescaleDB, and its official documentation is now at `tigerdata.com/docs`. The image you've been using since Module 17 is the **Community** edition: every feature in this module is free to use on your own laptop and server.

### 2. Hypertables and chunks: an archive filed into daily binders

Imagine a diary written in one giant binder. To find last week's entries, you have to open a book as thick as a wardrobe. To throw away last year's entries, you have to tear out the pages one by one. A tidy archive doesn't work like that: its entries are **filed into one binder per day** (or per week), the binders stand in a row on a shelf in date order, and the spine of every binder shows its date range.

A **hypertable** is a table that's filed into binders automatically like that. From the outside it still looks like one `readings` table: you still write `INSERT INTO readings` and `SELECT … FROM readings`, and backend v0.2 doesn't need to change at all. Inside, TimescaleDB cuts its rows according to the time column (`ts`) into small tables called **chunks** (pieces, "binders"). Every chunk holds one time range, for example one day, and is created by itself when the first reading for that day arrives.

The benefits show up in three places:

1. **A query per time range only opens the binders it needs.** The question "the last seven days" only touches seven or eight chunks, however thick the whole archive is. The database knows the range of every chunk, so the other chunks aren't even glanced at (Concept 4).
2. **Throwing away old data means throwing away whole binders.** No more slow `DELETE` of millions of rows: one binder is dropped like deleting one file (Concept 7).
3. **Old binders can be compressed** without disturbing today's binder, which is still being written to (Concept 8).

A plain table is turned into a hypertable with one function, `create_hypertable`. The heart of the migration `002_hypertable.sql` in Practice 2 is this line (Practice 2.1 adds one `LOCK TABLE` line in front of it):

```sql
SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);
```

| Part | What it means |
| :--- | :--- |
| `'readings'` | The table that's changed. Its contents, columns, keys, and foreign keys stay. |
| `by_range('ts', INTERVAL '1 day')` | Cut according to the time column `ts`, one chunk for every **1 day**. Without this number, the default is 7 days. |
| `migrate_data => true` | The table already holds data (practice data and real readings from Module 17), so move those old rows into the right chunks. Without this, `create_hypertable` refuses a table that isn't empty. |

One important condition: every **unique key**, including the primary key, must contain the time column. The primary key of `readings` has been `(device_id, ts)` since Module 17, so that condition is already met. That's one more reason why the key was designed that way. The foreign key from `readings` to `devices` still applies too.

Why one day? Mini Smart Home's data is small: one day of Node 1 readings (8,640 rows) is only about 1.7 MB, indexes included. Daily chunks let retention (Concept 7) cut exactly per day, and the number of chunks stays reasonable: about 365 a year. For data that flows in much faster, TimescaleDB recommends a chunk width that lets the indexes of the chunk being written to fit in about a quarter of the server's RAM. That's a matter for later.

The boundary of every daily chunk falls at **00:00 UTC**, which is **07:00 WIB**. So one chunk holds the readings from 07:00 WIB to just before 07:00 WIB the next day. This doesn't affect the result of any query. You'll see it when you peek at the list of chunks in Practice 2, and later it decides when a binder may be dropped by retention: every day at 07:00 WIB, one more binder crosses the 90-day limit (Practices 6 and 7).

![Diagram of hypertables and chunks, an archive filed into daily binders: from the outside it's still one readings table, and inside, TimescaleDB files its rows into one binder per day according to the ts column. Left, small and faded, the Plain table card, one giant binder, holding one thick book labeled readings, all days in one binder. Below it: finding last week's entries means opening a book as thick as a wardrobe, and throwing away old entries means tearing out pages one by one (a DELETE of millions of rows). A gray arrow leads to the main blue card, hypertable readings, still one table from the outside and inside it one binder (chunk) per day. Above the card, two capsules, INSERT INTO readings and SELECT … FROM readings, point at the card, with a note that the table is written and read as usual and backend v0.2 doesn't need to change. The top right corner of the card explains that the times on the binder spines are written in WIB, and that the binder boundary at 00:00 UTC is the same as 07:00 WIB. Inside the card, the binders stand in a row on a shelf, from the oldest on the left to the newest on the right. At the far left there's an empty dashed space; the oldest binder, _hyper_1_10_chunk of Jun 22, has already left the shelf and is drawn in pink below the shelf board, with the number 2 and the words oldest binder dropped whole. After it come thin, faded, lightly struck-through old binders, with dots between them; above them are the number 3 and the words thinner, compressed. On the right, the eight newest binders, thick and blue, with their names and time ranges on their spines, starting with _hyper_1_2_chunk with the range Oct 13 07:00 to Oct 14 07:00, _hyper_1_3_chunk Oct 14 07:00 to Oct 15 07:00, and so on, up to _hyper_1_9_chunk Oct 20 07:00 to Oct 21 07:00. A bracket above those eight binders has the number 1 and the words opened by the last-7-days query, and below the shelf board it says 8 newest binders, October 13 to 20. Below the shelf there are three numbered benefits. 1, only the binders that are needed get opened: the last-7-days query touches the 8 newest binders, and the other (faded) binders are pruned. 2, dropping old data means dropping whole binders, like deleting one file, without a DELETE of millions of rows (Concept 7). 3, old binders can be compressed, and today's binder, which is still being written to, isn't disturbed (Concept 8). At the very bottom, a gray box: one function in the migration 002_hypertable.sql (Practice 2) files readings into one binder per day and moves the rows that already exist, namely SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);](assets/hypertable-binders.png)

> ➡️ **Done reading Concepts 1–2?** Continue to [Practice 1](#practice-1--meet-timescaledb-and-create-a-branch-15-minutes).

### 3. `time_bucket`: time buckets

In Module 17, the average per day was computed by grouping readings by date. What about "the average per **15 minutes**"? PostgreSQL's `date_trunc` can only cut to whole units (minute, hour, day, month), not "every 15 minutes". (PostgreSQL 14 and later do have the similar `date_bin`, but it can't make monthly buckets and can't be used for the summary book of Concept 5.) TimescaleDB adds the function **`time_bucket`**: imagine a row of buckets labeled with times, each one 15 minutes wide, and every reading is dropped into the bucket whose range contains its `ts`.

```sql
SELECT time_bucket('15 minutes', ts) AS bucket,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= now() - INTERVAL '2 hours'
GROUP BY bucket
ORDER BY bucket;
```

`time_bucket('15 minutes', ts)` turns every `ts` into **the start of its bucket**: a reading at 10:07 goes into the 10:00 bucket, a reading at 10:22 into the 10:15 bucket. After that, `GROUP BY bucket` and the aggregate functions work exactly as in Module 17. The bucket width is up to you: `'5 minutes'`, `'1 hour'`, `'6 hours'`, `'1 day'`.

For **daily** buckets, the time zone matters again (Module 17 Concept 9). The bucket `time_bucket('1 day', ts)` starts at 00:00 **UTC**, which is 07:00 WIB, so readings from 00:00–06:59 WIB go into the previous day. Name the zone as the third argument:

```sql
time_bucket('1 day', ts, 'Asia/Jakarta')   -- daily bucket by WIB day (00:00–24:00 WIB)
```

For 15-minute and 1-hour buckets, the time zone has no effect, because WIB is exactly 7 hours apart from UTC. The 10:00 WIB bucket is still the same bucket, only written as 03:00 UTC. Readers in WITA or WIT (Central or Eastern Indonesia Time) use `'Asia/Makassar'` or `'Asia/Jayapura'` for their own devices' data, as in Module 17.

### 4. Indexes and `EXPLAIN`: how the database finds the answer

"Fast" has to be measured, not guessed. PostgreSQL can tell you its **plan**, that is, the steps it will take to answer a query, and how long those steps really took. To get it, write `EXPLAIN (ANALYZE)` in front of the query:

```sql
EXPLAIN (ANALYZE)
SELECT time_bucket('1 hour', ts) AS hour, round(avg(temperature)::numeric, 1) AS avg_temp
FROM readings
WHERE device_id = 'beef00000001' AND ts >= now() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

The answer is a tree of steps, read starting from the most deeply indented one. For beginners, there are only three things to look for:

- **`Index Scan using …`** or **`Index Only Scan`**: the database uses an **index** (a sorted table of contents) to jump straight to the rows it's looking for. Its opposite, **`Seq Scan`** (sequential scan), reads the whole table from start to end. For a table of millions of rows, that's a danger sign.
- **The number of chunks touched.** In a hypertable, the plan only includes the chunks whose range falls, wholly or partly, inside `WHERE ts >= …`. The other chunks are pruned before the query runs.
- **`Execution Time`** on the last line: how long the query really ran, in milliseconds.

Which indexes are used? The primary key `(device_id, ts)` from Module 17 is also an index, sorted by device and then by time. That's the shape that suits the question "device X, time range Y" best. When the table becomes a hypertable, `create_hypertable` adds one more index, `(ts DESC)`, for the question "the latest readings from all devices". For this module, those two are enough; there's no need to create a new index.

One thing needs to be admitted honestly: with the right index, **even a plain table** can answer "the hourly average over the last seven days" from a million rows in a few tens of milliseconds. In Practice 4 you'll see for yourself that for that query, the hypertable and the plain table are almost equally fast. The hypertable's real advantages show up elsewhere: dropping old data in an instant, automatic summaries that answer dozens of times faster, and compressing old data. They're all covered in Concepts 5–8.

> ➡️ **Done reading Concepts 3–4?** Continue to [Practice 3](#practice-3--time-buckets-with-time_bucket-30-minutes).

### 5. Continuous aggregates: a summary book written by an automatic clerk

Imagine that every time the head of the office asks "what was the average temperature per hour last month?", a staff member has to open all of the month's binders and count again from the first row. A smart office assigns a **clerk** who, every half hour, writes a **summary book**: one row per hour per device, holding the average, the lowest value, the highest value, and the number of readings. When a question comes, opening that thin summary book is enough.

A **continuous aggregate** (CAGG for short) is that summary book. It looks like a PostgreSQL view: a `GROUP BY time_bucket(…)` query that has been given a name. The difference is that its result is **stored** (materialized), and TimescaleDB updates it little by little, only for the hours whose data changed, instead of computing everything again. The migration `003_hourly_summary.sql` in Practice 5 creates the summary book `readings_hourly`:

```sql
CREATE MATERIALIZED VIEW readings_hourly
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 hour', ts) AS hour,
       device_id,
       avg(temperature)   AS avg_temp,
       count(temperature) AS temp_n,
       …
       count(*)           AS reading_count
FROM readings
GROUP BY hour, device_id
WITH NO DATA;
```

Three parts you need to understand:

- **`timescaledb.continuous`** makes it a summary book, not an ordinary view.
- **`materialized_only = false`** (a real-time summary): if the hour you ask about is newer than the last hour the clerk has already summarized, for example the hour that's still running, TimescaleDB fills it in directly from the raw data. So the newest hours always show up; without this setting, those hours only appear after the clerk has come by. (A late reading for an hour that's already summarized is only counted when that hour is summarized again, and the clerk only summarizes the last three days again.)
- **`WITH NO DATA`**: create the book first, empty. The Module 17 migration runner runs every file inside one transaction, and TimescaleDB refuses to fill a summary book inside a transaction. The old history is filled in once afterward with `CALL refresh_continuous_aggregate(…)` in psql.

Why is there a `temp_n` column (the number of temperature readings that aren't empty) next to `avg_temp`? Because **averaging the averages is a trap**. If one hour holds 360 readings and the next hour only 10 so far, the daily average isn't the average of the two hourly numbers: the hour with 360 readings has to be given more weight. Because the count is stored, an exact daily average can be computed from the summary book: add up `avg_temp × temp_n` for every hour, then divide by the sum of `temp_n`. The same pattern is used for humidity, light, and soil.

The summary book can be asked like a plain table:

```sql
SELECT hour, round(avg_temp::numeric, 1) AS avg_temp, reading_count
FROM readings_hourly
WHERE device_id = 'beef00000001' AND hour >= now() - INTERVAL '7 days'
ORDER BY hour;
```

The query "the hourly average over the last seven days" from a million rows used to read tens of thousands of raw rows; from the summary book, it reads only 168 rows. In Practice 5 you'll measure the difference yourself.

![Diagram of a continuous aggregate, a summary book written by an automatic clerk, with the example of the test device beef00000001, which sends one reading every 10 seconds, on the evening of October 20; the times are written in WIB. Left, the Raw readings card (the readings table), one reading per 10 seconds = 360 an hour, holding four hourly bands filled with small strokes (one stroke = 6 readings): 19:00–20:00 with 360 readings, 20:00–21:00 with 360 readings, 21:00–22:00 with 360 readings, and 22:00–23:00 with 109 readings so far, most of whose band is still empty and dashed, marked hour still running. Middle, the Clerk card, job 1000, the TimescaleDB background scheduler: every 30 minutes it re-summarizes the window 3 days ago to 1 hour ago, set up with add_continuous_aggregate_policy in the migration 003_hourly_summary.sql. The 19:00 and 20:00 bands go into the clerk, then come out as two rows on the right. The 21:00 and 22:00 bands are joined by a dashed arrow straight to the right, passing below the clerk, with the label real-time: not yet summarized, computed straight from the raw data when asked, materialized_only = false. Right, the Summary book readings_hourly card, one row per hour per device, with the columns hour, device_id, avg_temp, and reading_count. The rows 19:00, beef00000001, 28.5, 360 and 20:00, beef00000001, 27.5, 360 have solid outlines with the label stored by the clerk. The rows 21:00, beef00000001, 26.5, 360 and 22:00, beef00000001, 25.9, 109 have dashed outlines on a light blue background with the label computed when asked. Bottom left, the formula box for an exact daily average from the summary book (Practice 5.8): Σ(avg × n) ÷ Σn, that is, add up avg × n for every hour, then divide by the sum of n. Averaging the averages is a trap, written in red: an hour holding 360 readings must be given more weight than the running hour, which holds only 109 so far. That's why every measured quantity keeps its count of values, for example temp_n. Bottom right, the gray One complete row card (Practice 5.5), practice data f00d00000001, Oct 19 at 06:00 WIB: avg_temp 23.8, min_temp 23.4, max_temp 24.2, temp_n 6, then humidity, soil, and light, each with avg_ and _n (soil also min_), plus reading_count 6; the practice data holds one reading every 10 minutes.](assets/summary-book.png)

### 6. Jobs and policies: clerks that work on their own

Who is the "clerk" that updates the summary book? Inside the container, TimescaleDB starts a **background worker scheduler** that runs **jobs** (scheduled tasks) on their own schedules, like alarms that ring at regular times. You don't write the jobs yourself. You set up a **policy**, and TimescaleDB creates the job for you:

| Policy | Set up with | What its job does |
| :--- | :--- | :--- |
| Summary refresh | `add_continuous_aggregate_policy` (Practice 5) | Every 30 minutes, summarizes the window "3 days ago to 1 hour ago" again |
| Retention | `add_retention_policy` (Practice 6) | Once a day, drops the chunks whose entire contents are older than 90 days |
| Columnstore | `add_columnstore_policy` (Practice 6) | Regularly, compresses the chunks older than 7 days |

Every job has a number. Your own jobs start at **1000**; the numbers below that belong to TimescaleDB itself (for example `Telemetry Reporter`, which was already switched off by `-e TIMESCALEDB_TELEMETRY=off` in Module 17). The list of jobs and their schedules can be seen in `timescaledb_information.jobs`, and the history of their runs in `timescaledb_information.job_stats`. If you can't wait for the schedule, `CALL run_job(1000);` runs a job right now.

One thing surprises many people: **a policy starts working as soon as it's set up.** The retention and columnstore jobs usually run within seconds after their migration, without waiting for tomorrow. That's why Practice 6 always records the "before" state first, and only then runs the migration.

> ➡️ **Done reading Concepts 5–6?** Continue to [Practice 5](#practice-5--an-automatic-hourly-summary-40-minutes).

### 7. Retention: drop old binders, keep their summaries

A diary that's never thrown away eventually fills up the storeroom. For Mini Smart Home, readings every 10 seconds from three months ago are almost never read again; what's still useful is their **summary**, for example the hourly average. A **retention policy** drops raw data older than a certain limit automatically:

```sql
SELECT add_retention_policy('readings', drop_after => INTERVAL '90 days');
```

There are three things that make it different from `DELETE … WHERE ts < now() - INTERVAL '90 days'`:

1. **What's dropped is whole binders.** Retention drops the chunks whose **entire** contents are older than 90 days, like deleting one file. That's much faster than a `DELETE` of millions of rows, and it doesn't leave "holes" on the disk, that is, space left behind by deleted rows that's only cleaned up later. Because what's dropped is always whole binders, the oldest data that remains is between 90 and about 92 days old, depending on where the chunk boundary falls and on the time the retention clerk works (once a day). That's normal.
2. **The summary book isn't dropped with it.** Retention only applies to `readings`. The hourly averages in `readings_hourly` stay, so "the hourly temperature six months ago" can still be answered even though its raw readings are gone.
3. **The condition: the summary clerk must not look back into binders that have already been dropped.** The summary refresh policy of Concept 6 only looks back 3 days, far inside the 90-day limit, so it's safe. The danger is in **a manual refresh with a `NULL` start** ("from the beginning of time"). If that command is run **after** retention has worked, TimescaleDB sees that the raw data for the old hours is gone, and deletes their summaries too. That's why the manual `NULL` refresh in Practice 5 is run just once, **before** retention is set up.

The 90-day number is only this module's choice. For real data, ask first: how long are readings every 10 seconds still needed? Data that's been dropped can't be brought back, except from a backup (Concept 9).

![Diagram of retention, drop old binders, keep their summaries: Practice 6 with 120 days of test data, June 22 to October 20, and the policy add_retention_policy(…, drop_after => INTERVAL '90 days'). Top lane, raw readings (the readings table), one binder equals one day, drawn as a row of thin bars from Jun 22 to Oct 20 above a date axis with Jun 22, Jul 1, Aug 1, Sep 1, Oct 1, and Oct 20. The thirty leftmost bars are pink, with a red bracket and the words 30 binders dropped whole by the retention job (1001), once a day. A thick vertical line, 90 days ago, Jul 22, 22:22 WIB, cuts through both lanes. The Jul 22 binder, right on that line, has a dark outline, and a small arrow points at it with the label Jul 22 binder (the boundary): still holds readings younger than 90 days, so it waits its turn until tomorrow. The bars to the right of the line are light blue. At the far right, a small bracket above the last three bars says the summary clerk's window: the last 3 days, far from the 90-day limit, so it's safe. Bottom lane, the summary book readings_hourly, drawn as a solid blue band that stretches unbroken from June 22 to today, with the white words summaries kept: hourly averages from June 22 to today. Below the band, to the left of the 90-day line, it says 721 summaries older than 90 days are still there, and to its right it says that retention only applies to readings, so the summary book isn't dropped with it. Bottom left, a table of before and after retention (Practices 6.1 and 6.3): binders of readings 121 becomes 91, size of readings 201 MB becomes 152 MB, and summaries older than 90 days 721 stays 721, with the note the summaries survived, their number didn't change. Bottom right, a pink dashed box titled Trap: CALL refresh_continuous_aggregate('readings_hourly', NULL, …); run AFTER retention has worked recomputes every hour from the raw data. The old raw data has already been dropped, so the old summaries are deleted too (on the lab laptop, 721 went down to 16). What's safe is a window that lies entirely within the 90 days, for example the start now() - INTERVAL '8 days'.](assets/retention-summary.png)

### 8. Columnstore: compressing old binders

Databases usually store data **per row**: all the columns of one reading (`ts`, `temperature`, `humidity`, …) are written side by side. That's ideal for data that's still being written to. Old binders that are only read can be stored another way: **per column** (columnstore). All the `temperature` values of one device for a day are collected in order, then all the `humidity` values, and so on. A run of similar numbers in a row, like `28.4, 28.4, 28.5, 28.5, 28.6, …`, can be compressed very efficiently, much like a ZIP file that shrinks dramatically when its contents repeat a lot.

```sql
ALTER TABLE readings SET (timescaledb.enable_columnstore,
  timescaledb.segmentby = 'device_id', timescaledb.orderby = 'ts DESC');
CALL add_columnstore_policy('readings', after => INTERVAL '7 days');
```

- **`segmentby = 'device_id'`**: group per device, because queries almost always name one device.
- **`orderby = 'ts DESC'`**: sort by time inside every group, so that values close to each other in time (and usually similar) sit side by side.
- **`add_columnstore_policy(…, after => INTERVAL '7 days')`**: every chunk older than 7 days is compressed by a job. This week's binders stay per row, because they're still being written to.

Compressed data can still be read with the same SQL, and can still be added to: a send that arrives late (Module 27) still gets in with `INSERT … ON CONFLICT`. It's just that writing is a little slower. In Practice 6, the `readings` hypertable holding the test data shrinks from 152 MB to 30 MB, about a fifth of its size.

If you read older TimescaleDB tutorials, this feature is called **compression**, with the commands `compress_chunk` and `add_compression_policy`. Those old names still work in TimescaleDB 2.30, but this module uses the new name, **columnstore**.

> ➡️ **Done reading Concepts 7–8?** Continue to [Practice 6](#practice-6--90-day-retention-and-the-columnstore-40-minutes).

### 9. Backup and restore: photocopy the archive, then prove it can be restored

The `smarthome-data` volume keeps your whole archive in one place. If the laptop breaks, the volume is deleted by accident (`docker volume rm`), or a wrong migration drops a table, everything is gone. A **backup** is a photocopy of the whole archive, kept somewhere else. A **restore** builds a new archive from that photocopy.

There's one principle that database administrators hold on to: **a backup that has never been restored is the same as having no backup.** A backup file can be damaged, incomplete, or turn out to need special steps to restore, and all of that only comes to light when you really need it. That's why Practice 7 doesn't stop once the backup is made: it goes on to restore it into a new database and prove that the contents are exactly the same.

The tools are two programs that come with PostgreSQL and are already inside the container:

- **`pg_dump`** writes the entire contents of one database into one file. With `-Fc` (the custom format), the file is packed, compact, and can be restored partially.
- **`pg_restore`** rebuilds the contents of a database from that file.

For a TimescaleDB database, a restore needs two extra steps, like telling the archive clerk "don't work for now, we're moving the shelves":

1. `SELECT timescaledb_pre_restore();` **before** `pg_restore`: first stop the background workers and prepare TimescaleDB's catalog to receive the contents.
2. `SELECT timescaledb_post_restore();` **after** `pg_restore`: start everything again.

If this first step (step 4 in the picture below and in Practice 7.4) is forgotten, `pg_restore` prints a few errors and the result looks almost right, but some rows are missing and the primary key of `readings` isn't set up. If the second step (step 6) is forgotten, most of the data seems to vanish: `count(*)` only counts a small part of the rows. Both are shown in 🚨, and both only come to light if you **prove** the result of the restore.

One more condition: the target database must use **the same TimescaleDB version** as the source database. That's one of the reasons this module pins the image `timescale/timescaledb:2.30.2-pg17`, not `latest-pg17`.

![Diagram of backup and restore, photocopy the archive, then prove it can be restored, with a bold motto below the title: a backup that has never been restored = no backup (Practice 7). A large Laptop frame, the VS Code terminal in the backend folder (on Windows using PowerShell, not Git Bash), holds the Docker Desktop frame and, inside it, the blue box of the smarthome-db container (PostgreSQL 17 + TimescaleDB 2.30.2). Inside the container, from the left: the original database smarthome, which is never overwritten, because a restore always goes into a NEW database; a pg_dump -Fc arrow (7.3) to the file /tmp/smarthome.dump inside the container; the file /tmp/restore.dump, a copy from the laptop; then an arrow to the card of the NEW database smarthome_restored (7.4) with the numbered steps 2 createdb -T template0, 3 CREATE EXTENSION timescaledb, 4 timescaledb_pre_restore(), 5 pg_restore, and 6 timescaledb_post_restore(); steps 4 and 6 are blue. From /tmp/smarthome.dump, a docker cp arrow goes down to the card of the backup/ folder on the laptop, holding smarthome-2026-10-20.dump, about 5 MB, with the note not in Git, because backup/ is in .gitignore (7.7), and copy it to a flash drive or Google Drive too. From that card, an arrow numbered 1, docker cp, goes back up to /tmp/restore.dump, with the note that what's restored is the file on the laptop, not what's left in the container. Bottom right, a pink dashed box with a cross: don't pg_dump … > file.dump; in Windows PowerShell 5.1, the contents become UTF-16 text and the file breaks; use -f /tmp/…, then docker cp. Bottom, the proof card, the same fingerprint query in both databases (7.2 and 7.5), that is, the number of readings, the md5 of all rows, the summary rows, the binders, and your own jobs. A table headed readings, fingerprint, summaries, chunks, and jobs holds two exactly identical rows: smarthome (the original, before the backup, 7.2) and smarthome_restored (the copy, after the restore, 7.5), each 785394, 4af27a1271c640a4fa1d914cf2c26392, 3263, 91, and 3. A green check mark says exactly the same, character for character. Note at the bottom: the fingerprint on your laptop will certainly be different from this example; what matters is that the original and the copy are the same.](assets/backup-restore.png)

> ➡️ **Done reading Concept 9?** Continue to [Practice 7](#practice-7--a-backup-and-restore-thats-proven-45-minutes).

### 10. From the backend: one `bucket` parameter

The dashboard in Phase 4 will draw temperature charts for a day, a week, or a month. Sending hundreds of thousands of raw readings to the browser for a chart 1,000 pixels wide is wasteful, and besides, API v0.2 is limited to 1,000 readings. What's needed is a **summary per bucket**, and backend v0.3 provides it through one extra parameter on the same route:

```text
GET /devices/:id/readings?from=…&to=…&bucket=1h
```

| `bucket` | Bucket | Data source | Default range (if `from` is empty) |
| :--- | :--- | :--- | :--- |
| (none) | — | raw readings, as in Module 17 | 1 hour |
| `15m` | 15 minutes | the `readings` hypertable, with `time_bucket` | 1 day |
| `1h` | 1 hour | the summary book `readings_hourly` | 7 days |
| `1d` | 1 WIB day | the summary book, combined per day and weighted by the number of readings | 30 days |

Three design decisions you should know about:

- **Only three values are accepted**, checked by Zod as a fixed choice (an enum). The `bucket` text from outside is never pasted into SQL. The backend uses it as a "dictionary" key to choose one of **three fixed SQL queries** already written in the code, and then the `device_id` and the time range are sent as the parameters `$1`, `$2`, `$3`, as in Module 17 Concept 10.
- **At most 1,000 buckets per request**, the same as the limit on raw readings in Module 17. Longer ranges (more than about 10 days for `15m` or 41 days for `1h`) are rejected with `400`.
- **The start of the range is rounded down to the start of a bucket** so that the first bucket is always whole. `from=…T10:20:00` with `bucket=1h` starts at 10:00.

Without `bucket`, this route behaves exactly as in Module 17, so Bruno and other apps that already use it don't break.

> ➡️ **Done reading Concept 10?** Continue to [Practice 8](#practice-8--backend-v03-history-per-bucket-45-minutes).

## 🔧 Step-by-step practice

### Practice 1 — Meet TimescaleDB and create a branch (15 minutes)

> 🖥️ **Tools used:** **Docker Desktop** (the `smarthome-db` container running), **VS Code** with two terminals in the `mini-smart-home/backend` folder, and **psql** inside the container.

#### 1.1 A new branch: `feature/timescaledb`

All of this week's changes are made on one branch, then merged through a pull request in ➕ B, as in Modules 16–17. The `mini-smart-home` folder has been open in VS Code since the Quick Win (if it isn't, open it through **File → Open Folder…**). Open the first terminal (**Terminal → New Terminal**); a new terminal always starts in the `mini-smart-home` folder. If you use the old terminal from the Quick Win as the first terminal, go up first with `cd ..`, because that terminal is still in the `backend` folder. Run:

```text
git switch main
git pull --prune
git switch -c feature/timescaledb
cd backend
```

**Expected output:** the third command answers `Switched to a new branch 'feature/timescaledb'`, then `cd backend` moves the terminal to the `backend` folder without any answer. Open a second terminal with the **+** icon in the terminal panel, then type `cd backend` there too. The first terminal is used for `npm run migrate`, and the second terminal for psql.

#### 1.2 No hypertable yet

In the second terminal, go into psql as in Module 17:

```text
docker exec -it smarthome-db psql -U postgres -d smarthome
```

Then type these one at a time:

```sql
SHOW timescaledb.license;
SELECT count(*) FROM timescaledb_information.hypertables;
```

**Expected output:**

```text
 timescaledb.license 
---------------------
 timescale
(1 row)

 count 
-------
     0
(1 row)
```

`timescale` means the **Community** edition: every feature in this module is available. The list of hypertables is still empty (`0`), because `readings` is still the plain PostgreSQL table it has been since Module 17. Check its shape now so that you can compare it later:

```text
\d readings
```

**Expected output** (the bottom part):

```text
Indexes:
    "readings_pkey" PRIMARY KEY, btree (device_id, ts)
Foreign-key constraints:
    "readings_device_id_fkey" FOREIGN KEY (device_id) REFERENCES devices(device_id)
```

There's only one index, the primary key, and no line about child tables. Leave psql open for Practice 2.

> ➡️ **Done with Practice 1?** Continue to [Practice 2](#practice-2--readings-becomes-a-hypertable-30-minutes) without going back to the concepts.

### Practice 2 — `readings` becomes a hypertable (30 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal for `npm run migrate`, the second terminal with psql still open), **Docker Desktop**, and **DBeaver**.

#### 2.1 The migration `002_hypertable.sql`

In the `backend/migrations` folder, next to `001_initial_schema.sql`, create a new file **`002_hypertable.sql`**:

```sql
-- 002_hypertable.sql - the readings table becomes a hypertable (Module 18).
-- Its name stays readings, but TimescaleDB now stores it in "binders" (chunks) of 1 day of readings each,
-- cut every day at 00:00 UTC (= 07:00 WIB). Readings that already exist are moved into their binder (migrate_data).

-- Lock the devices table for a moment so that no deadlock (waiting for each other) happens with a backend that is writing.
LOCK TABLE devices IN SHARE ROW EXCLUSIVE MODE;
SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);
```

The two commands in it:

- **`LOCK TABLE devices …`** locks the `devices` table for a moment, while the migration runs. While `readings` is being moved into chunks, a running backend v0.2 may be writing new readings. This lock keeps the two from waiting for each other forever (a deadlock). The `create_hypertable` documentation recommends this step, and the `LOCK TABLE` command only works inside a transaction, which `npm run migrate` provides anyway.
- **`create_hypertable(…)`** turns `readings` into a hypertable with 1-day chunks and moves the readings that already exist (Concept 2).

#### 2.2 Run the migration

In the first terminal (the `backend` folder):

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.2.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 002_hypertable.sql
1 new migration(s) applied, 1 applied earlier.
```

The Module 17 migration runner sees that `001_initial_schema.sql` is already recorded in `schema_migrations`, so only `002` is run. Not a single line of backend code has changed.

#### 2.3 Look at the binders

Go back to psql in the second terminal. First, compare two ways of counting rows:

```sql
SELECT count(*) FROM ONLY readings;
SELECT count(*) FROM readings;
```

**Expected output** (example; the second number is the number of practice readings from Quick Win step 2, plus your Node 1, Node 2, or simulator readings if you have any):

```text
 count 
-------
     0
(1 row)

 count 
-------
  2284
(1 row)
```

**`ONLY readings`** means "count the rows of the parent table only, without its children". The result is `0`: all the rows have moved into chunks. Without `ONLY`, you ask the hypertable, and TimescaleDB adds up all its chunks. From the outside, `readings` still looks like one table.

Now look at its shape again:

```text
\d readings
```

**Expected output** (the bottom part, example):

```text
Indexes:
    "readings_pkey" PRIMARY KEY, btree (device_id, ts)
    "readings_ts_idx" btree (ts DESC)
Foreign-key constraints:
    "readings_device_id_fkey" FOREIGN KEY (device_id) REFERENCES devices(device_id)
Number of child tables: 9 (Use \d+ to list them.)
```

There are two changes. The new index **`readings_ts_idx`** (`ts DESC`) was added by `create_hypertable` for the question "the latest readings" (Concept 4). The **`Number of child tables`** line shows the number of chunks. That number depends on how many days have data on your laptop.

The list of chunks with their time ranges:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT chunk_name, range_start, range_end
FROM timescaledb_information.chunks
WHERE hypertable_name = 'readings'
ORDER BY range_start;
RESET TIME ZONE;
```

**Expected output** (example; the names and dates follow your data):

```text
    chunk_name    |      range_start       |       range_end        
------------------+------------------------+------------------------
 _hyper_1_1_chunk | 2026-10-12 07:00:00+07 | 2026-10-13 07:00:00+07
 _hyper_1_2_chunk | 2026-10-13 07:00:00+07 | 2026-10-14 07:00:00+07
 _hyper_1_3_chunk | 2026-10-14 07:00:00+07 | 2026-10-15 07:00:00+07
 _hyper_1_4_chunk | 2026-10-15 07:00:00+07 | 2026-10-16 07:00:00+07
 _hyper_1_5_chunk | 2026-10-16 07:00:00+07 | 2026-10-17 07:00:00+07
 _hyper_1_6_chunk | 2026-10-17 07:00:00+07 | 2026-10-18 07:00:00+07
 _hyper_1_7_chunk | 2026-10-18 07:00:00+07 | 2026-10-19 07:00:00+07
 _hyper_1_8_chunk | 2026-10-19 07:00:00+07 | 2026-10-20 07:00:00+07
 _hyper_1_9_chunk | 2026-10-20 07:00:00+07 | 2026-10-21 07:00:00+07
(9 rows)
```

Every row is one binder. Look at the times: every chunk starts at **07:00 WIB**, which is 00:00 UTC, as Concept 2 explained. The name `_hyper_1_9_chunk` means "hypertable number 1, chunk number 9"; that number is only the order in which it was created, not a date. `SET TIME ZONE` only changes the way psql writes times, and `RESET TIME ZONE` puts it back to UTC.

All those chunks live in a separate schema, `_timescaledb_internal`. You don't need to touch it: reading and writing always go through `readings`.

#### 2.4 Look in DBeaver

In DBeaver, click the `smarthome` connection, then press **F5** (refresh). Next to the `public` schema, you can now open the **`_timescaledb_internal`** schema, which holds the tables `_hyper_1_1_chunk`, `_hyper_1_2_chunk`, and so on. That schema has been there since Module 17 (one of the schemas "that belong to the TimescaleDB add-on" mentioned in Module 17 Practice 2.2), but only now does it have something in it. Remember: those binders belong to TimescaleDB. Don't change or delete them directly from DBeaver.

#### 2.5 Save to the branch

Leave psql with `\q`. In the first terminal (the `backend` folder):

```text
git add migrations/002_hypertable.sql
git commit -m "The readings table becomes a hypertable (Module 18 Practice 2)"
git push -u origin feature/timescaledb
```

`-u` records the `feature/timescaledb` branch on GitHub as the partner of your local branch. After this, `git push` is enough.

> ⬆️ **Done with Practice 2?** Go back to [Concept 3](#3-time_bucket-time-buckets) (the ➡️ at the end of Concept 4 will take you to Practice 3).

### Practice 3 — Time buckets with `time_bucket` (30 minutes)

> 🖥️ **Tools used:** **psql** inside the container (the second terminal, `docker exec -it smarthome-db psql -U postgres -d smarthome`). All the queries can also be run in DBeaver.

This practice uses the practice data of the living room device (`f00d00000001`) that you filled in again in step 2 of the Quick Win. The day you filled it in is **day H**, which you wrote down there. The numbers for the days before H are the same on anyone's laptop; only the dates follow your day H. The examples in this module use H = October 20, 2026. What you need to remember:

- In every query, **replace `2026-10-19` with the date of H-1** (the day before day H), `2026-10-13` with the date of H-7, and `2026-10-20` with the date of H. The easiest way: copy the query into an empty VS Code tab (**Ctrl + N**), replace the dates there, then copy it into psql. You can also edit the query directly in DBeaver.
- The date of H stays the same even if you do the next practices a few days later. Unlike in Module 17, **don't** fill in the practice data again when you continue on another day.
- Forgot the date? After you go into psql in 3.1, ask the database: `SELECT (min(ts) AT TIME ZONE 'Asia/Jakarta')::date + 7 AS day_h FROM readings WHERE device_id = 'f00d00000001';` (the practice data starts at 00:00 WIB seven days before H).

#### 3.1 One hour of raw readings

Because you closed psql at the end of Practice 2, go into psql again in the second terminal (`docker exec -it smarthome-db psql -U postgres -d smarthome`). Start with the simplest thing: the readings of H-1 from 06:00–07:00 WIB, without summarizing them.

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT ts, temperature FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-19 06:00:00+07' AND ts < '2026-10-19 07:00:00+07'
ORDER BY ts;
```

**Expected output** (your dates follow H-1):

```text
           ts           | temperature 
------------------------+-------------
 2026-10-19 06:00:00+07 |        23.8
 2026-10-19 06:10:00+07 |        23.4
 2026-10-19 06:20:00+07 |        23.4
 2026-10-19 06:30:00+07 |        24.1
 2026-10-19 06:40:00+07 |        24.2
 2026-10-19 06:50:00+07 |        23.8
(6 rows)
```

Six readings, one every 10 minutes. The numbers are the same as in the history API example of Module 17 Practice 7.3, because both come from the same hour of the same practice data.

#### 3.2 15-minute buckets

```sql
SELECT time_bucket('15 minutes', ts) AS start,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-19 06:00:00+07' AND ts < '2026-10-19 07:00:00+07'
GROUP BY start
ORDER BY start;
```

**Expected output:**

```text
         start          | avg_temp | count 
------------------------+----------+-------
 2026-10-19 06:00:00+07 |     23.6 |     2
 2026-10-19 06:15:00+07 |     23.4 |     1
 2026-10-19 06:30:00+07 |     24.2 |     2
 2026-10-19 06:45:00+07 |     23.8 |     1
(4 rows)
```

Check it yourself against 3.1: the 06:00–06:15 bucket holds the readings at 06:00 (23.8) and 06:10 (23.4), and their average is 23.6. The 06:15–06:30 bucket holds only the reading at 06:20 (23.4). That's how `time_bucket` works: every reading goes into exactly one bucket, and then every bucket is summarized.

#### 3.3 1-hour buckets, with and without a time zone

```sql
SELECT time_bucket('1 hour', ts) AS hour,
       time_bucket('1 hour', ts, 'Asia/Jakarta') AS hour_wib,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-19 06:00:00+07' AND ts < '2026-10-19 12:00:00+07'
GROUP BY hour, hour_wib
ORDER BY hour;
```

**Expected output:**

```text
          hour          |        hour_wib        | avg_temp | count 
------------------------+------------------------+----------+-------
 2026-10-19 06:00:00+07 | 2026-10-19 06:00:00+07 |     23.8 |     6
 2026-10-19 07:00:00+07 | 2026-10-19 07:00:00+07 |     24.8 |     6
 2026-10-19 08:00:00+07 | 2026-10-19 08:00:00+07 |     25.8 |     6
 2026-10-19 09:00:00+07 | 2026-10-19 09:00:00+07 |     26.6 |     6
 2026-10-19 10:00:00+07 | 2026-10-19 10:00:00+07 |     27.7 |     6
 2026-10-19 11:00:00+07 | 2026-10-19 11:00:00+07 |     28.5 |     6
(6 rows)
```

The `hour` and `hour_wib` columns are exactly the same. As Concept 3 said, for 15-minute and 1-hour buckets the time zone has no effect, because WIB is exactly 7 hours apart from UTC. The temperature rises from morning to midday, following the daily pattern of the practice data.

#### 3.4 1-day buckets: this is where the time zone matters

Summarize **all** the practice data per day, first without a time zone:

```sql
SELECT time_bucket('1 day', ts) AS day,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
GROUP BY day
ORDER BY day;
```

**Expected output** (the dates follow your day H, and the last row follows the time you filled in the practice data):

```text
          day           | avg_temp | count 
------------------------+----------+-------
 2026-10-12 07:00:00+07 |     22.8 |    42
 2026-10-13 07:00:00+07 |     26.0 |   144
 2026-10-14 07:00:00+07 |     25.9 |   144
 2026-10-15 07:00:00+07 |     26.7 |   144
 2026-10-16 07:00:00+07 |     27.0 |   144
 2026-10-17 07:00:00+07 |     26.4 |   144
 2026-10-18 07:00:00+07 |     25.9 |   144
 2026-10-19 07:00:00+07 |     26.2 |   144
 2026-10-20 07:00:00+07 |     27.8 |    92
(9 rows)
```

Every "day" starts at **07:00 WIB**, because the 1-day bucket follows the UTC day. The first row holds only 42 readings: 00:00–06:59 WIB on the first day of the practice data. All the averages are shifted. Now with the time zone, for the seven full days before day H:

```sql
SELECT time_bucket('1 day', ts, 'Asia/Jakarta') AS day,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-13 00:00:00+07' AND ts < '2026-10-20 00:00:00+07'
GROUP BY day
ORDER BY day;
```

**Expected output** (your dates follow day H; the numbers are the same):

```text
          day           | avg_temp | count 
------------------------+----------+-------
 2026-10-13 00:00:00+07 |     26.2 |   144
 2026-10-14 00:00:00+07 |     25.6 |   144
 2026-10-15 00:00:00+07 |     26.5 |   144
 2026-10-16 00:00:00+07 |     27.1 |   144
 2026-10-17 00:00:00+07 |     26.7 |   144
 2026-10-18 00:00:00+07 |     25.8 |   144
 2026-10-19 00:00:00+07 |     26.3 |   144
(7 rows)
```

The days now start at **00:00 WIB**, and every day holds exactly 144 readings. The averages are exactly the same as in the pass-requirement table of Module 17 Practice 4.5. There you wrote `(ts AT TIME ZONE 'Asia/Jakarta')::date`; here, `time_bucket('1 day', ts, 'Asia/Jakarta')`. Two roads, the same answer, but `time_bucket` can also be used for other buckets, such as 6 hours or 15 minutes, and it's the function the summary book of Practice 5 uses.

Put the session zone back before you continue:

```text
RESET TIME ZONE;
```

> ➡️ **Done with Practice 3?** Continue to [Practice 4](#practice-4--one-million-rows-and-measure-the-speed-45-minutes) without going back to the concepts.

### Practice 4 — One million rows, and measure the speed (45 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal in the `backend` folder, the second terminal with psql still open from Practice 3; if it's already closed, for example because you're continuing on another day, go in again with `docker exec -it smarthome-db psql -U postgres -d smarthome`) and **Docker Desktop**. Make sure there's about 1 GB of free disk space (🧰).

The practice data holds only about 2,300 readings, too few to feel a difference in speed. A real database grows much faster: Node 1 alone sends 8,640 readings a day, so four months means more than a million rows. In this practice you make data that big with one SQL file, then measure honestly: how fast the pass-requirement query is, what happens inside it, and whether a plain table is really slower.

#### 4.1 The test-data file `load-1-million.sql`

This test data is made directly inside the database with SQL, not through MQTT and the backend. Sending a million MQTT messages takes too long for practice, while SQL can make them in seconds. In the VS Code Explorer panel, create a new folder **`test`** inside the `backend` folder (next to `migrations` and `src`), then create the file **`load-1-million.sql`** inside it:

```sql
-- load-1-million.sql - Module 18 load test: fake readings every 10 seconds for the last 120 days
-- for the test device beef00000001, that is 120 x 8,640 + 1 = 1,036,801 readings ("a million rows").
-- The last reading falls on the last full minute, so its seconds are always :00, :10, ..., :50.
-- The numbers follow a daily pattern (hotter and brighter by day, more humid at night) plus a little "dice".
-- The dice are seeded (setseed), so the sequence of random numbers is the same on anyone's laptop.
-- Running it once is enough: if the test device already has readings, the second INSERT is skipped.
-- Run it with psql inside the database container (see the module README, Practice 4).
\timing on

-- the test device first, so that its readings pass the foreign key rule (readings -> devices)
INSERT INTO devices (device_id, kind, name, location)
VALUES ('beef00000001', 'node1', 'Load test', 'lab')
ON CONFLICT (device_id) DO NOTHING;

SELECT setseed(0.18);  -- the dice seed: the sequence of random() numbers after this is always the same

INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level)
SELECT 'beef00000001', ts, '1.4.0',
       round((27 + 4 * sin(pi() * (hour - 9) / 12) + random() - 0.5)::numeric, 1),  -- 22.5-31.5 degrees, hottest at 15:00
       round(75 - 10 * sin(pi() * (hour - 9) / 12) + 4 * (random() - 0.5)),         -- 63-87 percent, the opposite of temperature
       round(greatest(0, 3400 * sin(pi() * (hour - 6) / 12)) + 60 * random()),      -- dark at night, brightest at 12:00
       round(68 - 1.5 * mod(hour + 6, 12) + random()),                               -- watered at 06:00 and 18:00, then drying
       random() < 0.1,                                                               -- now and then someone walks by
       round(90 - 2 * hour)                                                          -- the water tank is full at 00:00, then drops
FROM (SELECT ts, extract(epoch FROM (ts AT TIME ZONE 'Asia/Jakarta')::time) / 3600 AS hour  -- WIB hour with decimals: 0 - 23.99
      FROM generate_series(date_trunc('minute', now()) - INTERVAL '120 days',  -- from the full minute 120 days ago
                           date_trunc('minute', now()),                       -- to the last full minute
                           INTERVAL '10 seconds') AS ts) AS times
WHERE NOT EXISTS (SELECT 1 FROM readings WHERE device_id = 'beef00000001');  -- loaded before? skip it

ANALYZE readings;  -- refresh the statistics so that the query planner knows there are a million new rows

SELECT count(*) AS test_readings FROM readings WHERE device_id = 'beef00000001';
```

| Part | What it means |
| :--- | :--- |
| `\timing on` | A psql command (it starts with a backslash), not SQL: it tells psql to write how long every command takes, as `Time: … ms`. |
| `INSERT INTO devices … ON CONFLICT (device_id) DO NOTHING` | First register the test device **`beef00000001`** ("Load test", location `lab`). Without this row, the foreign key (Module 17 Concept 4) rejects its readings. `DO NOTHING` makes it safe to run again and again. |
| `SELECT setseed(0.18)` | "Seeded dice". `random()` gives random numbers, but after `setseed` the sequence of numbers is always the same. As a result, your test data is almost a twin of the test data in this module: the number of rows is exactly the same, and the averages differ at most in the last digit, except the average light (the most random part), which can differ a little more. |
| `generate_series(start, stop, INTERVAL '10 seconds')` | Makes a series of times: one row every 10 seconds, from the full minute 120 days ago to the last full minute. The result is 120 × 8,640 + 1 = **1,036,801** timestamps. Think of it as an SQL-style "loop". |
| The `sin(…)` and `random()` formulas | A daily pattern that looks real: hot and bright by day, more humid at night, soil that dries out and is then "watered" at 06:00 and 18:00 WIB, plus a little random variation. You don't need to memorize the formulas. |
| `WHERE NOT EXISTS (…)` | A guard: if the test device already has readings, the `INSERT` is skipped. The data is never doubled, even if this file is run twice. |
| `ANALYZE readings` | Refresh the table's statistics so that the query planner (Concept 4) knows there are a million new rows and chooses the right plan. |

#### 4.2 Load a million rows

In the first terminal (the `backend` folder), run these two commands one at a time:

```text
docker cp test/load-1-million.sql smarthome-db:/tmp/load-1-million.sql
docker exec smarthome-db psql -U postgres -d smarthome -f /tmp/load-1-million.sql
```

**Expected output of the first command** (the numbers may be slightly different):

```text
Successfully copied 2.54kB (transferred 4.1kB) to smarthome-db:/tmp/load-1-million.sql
```

**`docker cp`** (copy) copies a file from the laptop into the container, into Linux's temporary `/tmp` folder inside that container (Module 17 Concept 2). The second command runs psql inside the container with **`-f`** (file): psql reads the commands from that file, then exits by itself. Because psql doesn't need to wait for your typing, `-it` isn't used this time.

**Expected output of the second command** (wait about half a minute; on a slower laptop it can take up to two minutes):

```text
Timing is on.
INSERT 0 1
Time: 7.387 ms
 setseed 
---------
 
(1 row)

Time: 1.005 ms
INSERT 0 1036801
Time: 23446.421 ms (00:23.446)
ANALYZE
Time: 2075.508 ms (00:02.076)
 test_readings 
---------------
       1036801
(1 row)

Time: 164.406 ms
```

`INSERT 0 1` is the test device's row in `devices`. `INSERT 0 1036801` is its million readings, made in 23 seconds. Every reading goes straight into the chunk of its day: TimescaleDB creates a new chunk for every day that doesn't have one yet. If you accidentally run the second command again, both `INSERT`s answer `INSERT 0 0`: the `WHERE NOT EXISTS` guard works, and nothing is doubled.

#### 4.3 Look at the result

In psql (the second terminal), type these one at a time:

```sql
SELECT device_id, count(*), min(ts), max(ts) FROM readings GROUP BY device_id ORDER BY device_id;
SELECT count(*) FROM show_chunks('readings');
SELECT pg_size_pretty(hypertable_size('readings'));
```

**Expected output** (example; the dates and times follow the moment you load the data, and your own devices, if you have any, show up too):

```text
  device_id   |  count  |          min           |          max           
--------------+---------+------------------------+------------------------
 beef00000001 | 1036801 | 2026-06-22 15:18:00+00 | 2026-10-20 15:18:00+00
 f00d00000001 |    1142 | 2026-10-12 17:00:00+00 | 2026-10-20 15:10:00+00
 f00d00000002 |    1142 | 2026-10-12 17:00:00+00 | 2026-10-20 15:10:00+00
(3 rows)

 count 
-------
   121
(1 row)

 pg_size_pretty 
----------------
 201 MB
(1 row)
```

- The test device has **1,036,801** readings over 120 days. The times are written in UTC (`+00`), because the session zone was put back at the end of Practice 3.
- **`show_chunks('readings')`** lists all the chunks of that hypertable. There are **121**: one for every day from June 22 to today. The chunks of the last days are the same ones that were created in Practice 2 for the practice data; test readings for the same day go into the same binder.
- **`hypertable_size`** adds up the size of all the chunks along with their indexes, in bytes, and **`pg_size_pretty`** writes it with an easy-to-read unit: **201 MB**. One full day of test readings is about 1.7 MB, as estimated in Concept 2.

#### 4.4 ⭐ Pass requirement: the hourly average over the last 7 days

This is this module's pass-requirement query: the average temperature per hour over the last seven days for the test device, from a million rows. Turn on `\timing` so that psql writes how long it takes:

```sql
\timing on
SELECT time_bucket('1 hour', ts) AS hour,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'beef00000001'
  AND ts >= now() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

The answer is 169 rows, longer than the screen. As in Module 17, if psql stops with `--More--` on the bottom line, press **Space** to continue or **q** to stop.

**Expected output** (cut in the middle; your dates and `Time` number will be different):

```text
Timing is on.
          hour          | avg_temp | count 
------------------------+----------+-------
 2026-10-13 15:00:00+00 |     25.3 |   238
 2026-10-13 16:00:00+00 |     24.6 |   360
 2026-10-13 17:00:00+00 |     23.8 |   360
 …
 2026-10-20 14:00:00+00 |     26.5 |   360
 2026-10-20 15:00:00+00 |     25.9 |   109
(169 rows)

Time: 41.735 ms
```

**41.7 milliseconds**, that is, 0.04 seconds: far under one second. **The first pass requirement is met.** The buckets in the middle hold 360 readings (6 per minute × 60 minutes). The first and the last buckets are only partly filled: "the last seven days" starts in the middle of an hour, and the test data ends at the minute you loaded it.

The `Time` number on your laptop may be smaller or larger, and it's often larger right after the data is loaded, because the database is still busy writing its change records to disk. Run the query two or three times; what matters is that it stays far under 1,000 ms. Turn `\timing` off again before you continue, so that the next outputs match the examples:

```text
\timing off
```

#### 4.5 Peek at the plan with `EXPLAIN (ANALYZE)`

Why is it that fast? Ask for its plan (Concept 4). Write `EXPLAIN (ANALYZE)` in front of the same query:

```sql
EXPLAIN (ANALYZE)
SELECT time_bucket('1 hour', ts) AS hour,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings
WHERE device_id = 'beef00000001'
  AND ts >= now() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

**Expected output** (cut in the middle; the chunk names and the numbers may be different):

```text
                                                                                      QUERY PLAN                                                                                       
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Finalize GroupAggregate  (cost=0.29..5442.60 rows=59972 width=48) (actual time=0.219..17.641 rows=169 loops=1)
   Group Key: (time_bucket('01:00:00'::interval, readings.ts))
   ->  Custom Scan (ChunkAppend) on readings  (cost=0.29..3802.21 rows=58793 width=48) (actual time=0.090..17.436 rows=169 loops=1)
         Order: time_bucket('01:00:00'::interval, readings.ts)
         Chunks excluded during startup: 0
         ->  Partial GroupAggregate  (cost=0.29..208.03 rows=3097 width=48) (actual time=0.089..0.935 rows=9 loops=1)
               Group Key: time_bucket('01:00:00'::interval, _hyper_1_2_chunk.ts)
               ->  Index Scan Backward using _hyper_1_2_chunk_readings_ts_idx on _hyper_1_2_chunk  (cost=0.29..145.94 rows=3118 width=16) (actual time=0.019..0.707 rows=3119 loops=1)
                     Index Cond: (ts >= (now() - '7 days'::interval))
                     Filter: (device_id = 'beef00000001'::text)
                     Rows Removed by Filter: 102
         ->  Partial GroupAggregate  (cost=0.29..541.17 rows=8391 width=48) (actual time=0.121..2.522 rows=24 loops=1)
               Group Key: time_bucket('01:00:00'::interval, _hyper_1_3_chunk.ts)
               ->  Index Scan Backward using _hyper_1_3_chunk_readings_ts_idx on _hyper_1_3_chunk  (cost=0.29..371.49 rows=8640 width=16) (actual time=0.019..1.870 rows=8640 loops=1)
                     Index Cond: (ts >= (now() - '7 days'::interval))
                     Filter: (device_id = 'beef00000001'::text)
                     Rows Removed by Filter: 288
   … (_hyper_1_4_chunk to _hyper_1_8_chunk, the same shape) …
         ->  Partial GroupAggregate  (cost=0.29..347.13 rows=5350 width=48) (actual time=0.138..1.494 rows=16 loops=1)
               Group Key: time_bucket('01:00:00'::interval, _hyper_1_9_chunk.ts)
               ->  Index Scan Backward using _hyper_1_9_chunk_readings_ts_idx on _hyper_1_9_chunk  (cost=0.29..238.94 rows=5509 width=16) (actual time=0.041..1.144 rows=5509 loops=1)
                     Index Cond: (ts >= (now() - '7 days'::interval))
                     Filter: (device_id = 'beef00000001'::text)
                     Rows Removed by Filter: 184
 Planning Time: 1.083 ms
 Execution Time: 17.977 ms
(55 rows)
```

The lines really are long. Read them starting from the most deeply indented one, and look for the three things from Concept 4:

1. **The binders touched.** There are only eight chunks, `_hyper_1_2_chunk` to `_hyper_1_9_chunk`: six full days, plus a piece of a day at the start and at the end of the range. **The other 113 chunks are pruned** before the query runs and aren't opened at all. `Custom Scan (ChunkAppend)` is a special TimescaleDB step that combines the results of all those chunks, in time order (`Order: …`).
2. **The index.** In every chunk, `Index Scan Backward using …_readings_ts_idx` uses the `ts DESC` index from Practice 2. Almost all the rows in those binders belong to the test device, so PostgreSQL chooses the time index, then throws away the few readings of other devices: `Rows Removed by Filter: 288`, that is, 2 practice devices × 144 readings a day. There's no `Seq Scan`.
3. **The time.** `Execution Time: 17.977 ms`. This number only covers how long the database worked on that query. The `Time` in 4.4 also includes planning and sending the result to psql, and its number is different every time you run it, especially right after the data is loaded.

One more thing: every chunk is summarized on its own first (`Partial GroupAggregate`, `rows=24` for one full day), and then those small summaries are combined (`Finalize GroupAggregate`). Because the chunks are already visited in time order, the database doesn't need to sort tens of thousands of readings again.

#### 4.6 A fair comparison: a plain table

Is all that speed thanks to the hypertable? The honest way to answer: make a copy of the test data in a **plain PostgreSQL table** with the same indexes, then measure the same query. Still in psql:

```sql
CREATE TABLE readings_plain (LIKE readings INCLUDING ALL);
INSERT INTO readings_plain SELECT * FROM readings WHERE device_id = 'beef00000001';
ANALYZE readings_plain;
```

**Expected output** (the second command takes a few seconds):

```text
CREATE TABLE
INSERT 0 1036801
ANALYZE
```

**`LIKE readings INCLUDING ALL`** means "create a new table with the same columns, default values, primary key, and indexes as `readings`". The result is a plain table: `LIKE` only copies the shape of `readings`, and a hypertable is only formed if you ask for one, for example with `create_hypertable` as in Practice 2. Compare their sizes. For a plain table, the counterpart of `hypertable_size` is **`pg_total_relation_size`**, the size of the table along with all its indexes:

```sql
SELECT pg_size_pretty(pg_total_relation_size('readings_plain')) AS plain_size,
       pg_size_pretty(hypertable_size('readings')) AS hypertable_total;
```

**Expected output:**

```text
 plain_size | hypertable_total 
------------+------------------
 218 MB     | 201 MB
(1 row)
```

Almost the same. Filing into binders doesn't make data smaller; what compresses it is the columnstore in Practice 6. Now measure the pass-requirement query on the plain table (only the table name changes):

```sql
EXPLAIN (ANALYZE)
SELECT time_bucket('1 hour', ts) AS hour,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       count(*) AS count
FROM readings_plain
WHERE device_id = 'beef00000001'
  AND ts >= now() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

**Expected output** (example):

```text
                                                                         QUERY PLAN                                                                          
-------------------------------------------------------------------------------------------------------------------------------------------------------------
 GroupAggregate  (cost=13862.39..15680.36 rows=60599 width=48) (actual time=19.522..26.086 rows=169 loops=1)
   Group Key: (time_bucket('01:00:00'::interval, ts))
   ->  Sort  (cost=13862.39..14013.89 rows=60599 width=16) (actual time=19.475..21.311 rows=60468 loops=1)
         Sort Key: (time_bucket('01:00:00'::interval, ts))
         Sort Method: quicksort  Memory: 3426kB
         ->  Index Scan using readings_plain_pkey on readings_plain  (cost=0.43..9048.71 rows=60599 width=16) (actual time=0.034..12.367 rows=60468 loops=1)
               Index Cond: ((device_id = 'beef00000001'::text) AND (ts >= (now() - '7 days'::interval)))
 Planning Time: 0.196 ms
 Execution Time: 26.360 ms
(9 rows)
```

The plan is shorter, because there's only one table. From the inside out: `Index Scan using readings_plain_pkey` jumps through the primary key `(device_id, ts)` straight to the 60,468 readings of the last seven days, `Sort` sorts them by hour, and then `GroupAggregate` summarizes them into 169 rows. The time is **26 ms**.

Run the two `EXPLAIN`s alternately two or three times. On the lab laptop, once the database had settled down, the plain table needed 26–35 ms, while the hypertable needed 18–22 ms. Right after the data was loaded, both were briefly at 32–57 ms. The conclusion, as already admitted in Concept 4: **for this query, the index matters most.** Both are far under one second, and the hypertable is only slightly faster, because it doesn't need to sort again. The hypertable's real advantages are in the next practices: a summary book that answers in less than 1 ms (Practice 5), and dropping and compressing old data (Practice 6). You can feel one of them right now.

#### 4.7 Deleting old data from a plain table

Suppose the rule is "keep raw readings for 90 days only". In a plain table, the only way is `DELETE`:

```sql
\timing on
DELETE FROM readings_plain WHERE ts < now() - INTERVAL '90 days';
\timing off
SELECT pg_size_pretty(pg_total_relation_size('readings_plain')) AS size_after_delete;
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'readings_plain';
```

**Expected output:**

```text
Timing is on.
DELETE 259214
Time: 270.028 ms
Timing is off.
 size_after_delete 
-------------------
 218 MB
(1 row)

 n_live_tup | n_dead_tup 
------------+------------
     777587 |     259214
(1 row)
```

As many as 259,214 readings (the oldest 30 days) were deleted, but **the size is still 218 MB**. `DELETE` doesn't tear out pages; it only marks rows as "dead" (dead tuples, the `n_dead_tup` column). Their space can only be reused after autovacuum (PostgreSQL's cleaning crew) comes by, and even after that, the table's file doesn't shrink. In a busy table, a `DELETE` this big also writes a lot of change records and competes with the backend's `INSERT`s.

Compare that later with Practice 6: the retention policy drops the thirty oldest chunks of the hypertable in less than 0.2 seconds, and `hypertable_size` immediately drops from 201 MB to 152 MB. Retention works like a small `DROP TABLE` for every old binder. Feel the difference yourself on the comparison table, which has done its job:

```sql
DROP TABLE readings_plain;
```

**Expected output:** `DROP TABLE`. All 218 MB come back right away, within milliseconds, because the table's file is deleted whole.

#### 4.8 Save to the branch

Leave psql with `\q`. In the first terminal (the `backend` folder):

```text
git add test/load-1-million.sql
git commit -m "Test data with 1 million rows (Module 18 Practice 4)"
git push
```

The test data isn't stored in Git, only its recipe. Anyone who runs this file gets a million readings that are almost twins of yours: exactly the same number, and averages that differ at most in the last digit, except light, which can differ a little more.

> [!TIP]
> **Not working?**
>
> - `docker cp` answers `GetFileAttributesEx …\test: The system cannot find the file specified.` (on macOS, the message ends with `no such file or directory`) → the terminal isn't in the `backend` folder, or the `test` folder hasn't been created inside `backend` yet. Check with `ls test`.
> - `psql: error: C:/Users/<name>/AppData/Local/Temp/load-1-million.sql: No such file or directory` → you're using **Git Bash**, which quietly changes `/tmp/…` into the Windows Temp folder. Use a PowerShell terminal (the VS Code default on Windows), or write two slashes: `-f //tmp/load-1-million.sql`.
> - `psql: error: /tmp/load-1-million.sql: No such file or directory` → the `docker cp` command hasn't been run yet, or it failed. Repeat the first command.
> - Both `INSERT`s answer `INSERT 0 0` → the test data has already been loaded. This isn't an error; continue to 4.3.
> - `ERROR:  relation "readings_plain" already exists` → you're repeating 4.6. Run `DROP TABLE readings_plain;`, then repeat 4.6 from the start.
> - The plain table's plan contains `Seq Scan on readings_plain` → the table was created without `INCLUDING ALL`, so it has no indexes. Drop the table, then create it again exactly as in 4.6.
> - The `Time` or `Execution Time` number is much larger, for example hundreds of milliseconds → wait a minute or two after loading the data, then try again. If it's still slow, first close other heavy apps, because the database shares memory with the whole laptop.

> ⬆️ **Done with Practice 4?** Go back to [Concept 5](#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk) (the ➡️ at the end of Concept 6 will take you to Practice 5).

### Practice 5 — An automatic hourly summary (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal in the `backend` folder for `npm run migrate`, the second terminal for psql) and **Docker Desktop**.

In Practice 4, the hourly query over seven days read about 60 thousand raw readings every time it ran. In this practice you create the **summary book** `readings_hourly` (Concept 5) and assign its clerk (Concept 6), then measure the difference.

#### 5.1 The migration `003_hourly_summary.sql`

In the `backend/migrations` folder, create a new file **`003_hourly_summary.sql`**:

```sql
-- 003_hourly_summary.sql - an hourly "summary book" of readings: a continuous aggregate (Module 18).
-- The TimescaleDB clerk writes the summaries by itself. Hours after the last hour already summarized are computed directly
-- from readings (materialized_only = false), so even the hour that is still running shows up.
-- WITH NO DATA is required: migrations run inside a transaction (BEGIN ... COMMIT), and filling the summary there is not allowed.
-- The history that already exists is summarized once from psql: CALL refresh_continuous_aggregate(...).
--
-- Every measured quantity has an average (avg_) and a count of the values filled in (_n; NULL values are not counted).
-- From the two, a daily average is always exact: add up (avg x n) over all hours, then divide by the sum of n over all hours.
CREATE MATERIALIZED VIEW readings_hourly
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 hour', ts) AS hour,
       device_id,
       avg(temperature)   AS avg_temp,
       min(temperature)   AS min_temp,
       max(temperature)   AS max_temp,
       count(temperature) AS temp_n,
       avg(humidity)      AS avg_humidity,
       count(humidity)    AS humidity_n,
       avg(soil)          AS avg_soil,
       min(soil)          AS min_soil,       -- the driest soil within that hour
       count(soil)        AS soil_n,
       avg(light)         AS avg_light,
       count(light)       AS light_n,
       count(*)           AS reading_count   -- every reading within that hour, including those with some columns NULL
FROM readings
GROUP BY hour, device_id
WITH NO DATA;

-- The clerk's schedule: every 30 minutes, summarize the last 3 days again, except the last hour that is still growing.
SELECT add_continuous_aggregate_policy('readings_hourly',
  start_offset      => INTERVAL '3 days',
  end_offset        => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes');
```

It has two parts. The first part, `CREATE MATERIALIZED VIEW … WITH NO DATA`, creates the summary book, empty at first (Concept 5). Every measured quantity (temperature, humidity, soil, light) has two columns: its average (`avg_`) and the number of values filled in (`_n`). Temperature also has its lowest and highest values, and soil has its driest value (`min_soil`). The second part, `add_continuous_aggregate_policy`, sets up the clerk's schedule (Concept 6):

| Setting | Value | What it means |
| :--- | :--- | :--- |
| `schedule_interval` | 30 minutes | The clerk works every half hour. |
| `start_offset` | 3 days | Every time it works, it summarizes the last three days again. Readings that arrive late, for example from a device that lost Wi-Fi all night, get caught too. |
| `end_offset` | 1 hour | The last hour isn't summarized, because its contents are still growing. Those hours still show up in the summary book thanks to `materialized_only = false`: TimescaleDB computes them directly from the raw data when asked. |

#### 5.2 Run the migration

In the first terminal (the `backend` folder):

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.2.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 003_hourly_summary.sql
1 new migration(s) applied, 2 applied earlier.
```

#### 5.3 The clerk starts right away, but only on three days

In the second terminal, go into psql again (`docker exec -it smarthome-db psql -U postgres -d smarthome`), then ask what's in the summary book per device:

```sql
SELECT device_id, count(*), min(hour), max(hour) FROM readings_hourly GROUP BY device_id ORDER BY device_id;
```

**Expected output** (example; the dates follow today):

```text
  device_id   | count |          min           |          max           
--------------+-------+------------------------+------------------------
 beef00000001 |    72 | 2026-10-17 16:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000001 |    72 | 2026-10-17 16:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000002 |    72 | 2026-10-17 16:00:00+00 | 2026-10-20 15:00:00+00
(3 rows)
```

The summary book created `WITH NO DATA` already has something in it! As Concept 6 said, the policy starts working as soon as it's set up: the clerk's job runs a few seconds after the migration. But look at the `min` column: it holds only the last **72 hours**, while the test data covers 120 days. The clerk only summarizes its own window, three days back, and the real-time part only fills in the hours **after** the last hour that's already summarized. The older history hasn't been touched at all.

If your test data was loaded one to three days before this step, your numbers are even smaller, and the practice devices may not appear at all, because the three-day window no longer reaches day H. If there hasn't been a single reading from any device in the last three days, the opposite happens: the clerk finds nothing to summarize, so the real-time part computes the **whole** history directly from the raw data, and your numbers look complete, as after 5.4 (for example 2,881 rows for the test device), even though not a single row has been stored yet. Whatever you see, step 5.4 is still required: only that step stores the summaries of the old history, and summaries that aren't stored are lost as soon as retention in Practice 6 drops their raw data.

#### 5.4 ⭐ Summarize the whole history, just once

The old history is summarized once, by hand:

```sql
\timing on
CALL refresh_continuous_aggregate('readings_hourly', NULL, now() - INTERVAL '1 hour');
\timing off
```

**Expected output** (your `Time` number will be different):

```text
Timing is on.
CALL
Time: 2861.693 ms (00:02.862)
Timing is off.
```

- **`CALL`** is used to run a **procedure**, a sibling of functions, except that it doesn't return a value. That's why the answer is just `CALL`.
- **`NULL`** as the start of the window means "from the oldest data", and **`now() - INTERVAL '1 hour'`** as its end means "up to one hour ago", the same as the clerk's `end_offset`.
- This command **must not run inside a transaction**. That's why it isn't written in the migration file: the migration runner wraps every file in `BEGIN … COMMIT`.
- Running it **once** is enough, and it must be **before** retention is set up in Practice 6. Concept 7 explains the danger of running it again after retention has worked.

Count its contents again, along with its size:

```sql
SELECT device_id, count(*), min(hour), max(hour) FROM readings_hourly GROUP BY device_id ORDER BY device_id;
SELECT pg_size_pretty(hypertable_size('readings_hourly'));
```

**Expected output** (example):

```text
  device_id   | count |          min           |          max           
--------------+-------+------------------------+------------------------
 beef00000001 |  2881 | 2026-06-22 15:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000001 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000002 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
(3 rows)

 pg_size_pretty 
----------------
 1616 kB
(1 row)
```

All 120 days are now summarized: 2,881 summary rows for the test device, one per hour. A million raw readings taking up 201 MB now have a summary book of **1.6 MB**, less than a hundredth as thick. The summary book is also stored as a hypertable, so `hypertable_size` can measure it.

#### 5.5 Read the summary book

The summary book is asked like a plain table. Try the same hours as in Practice 3.3 (**replace `2026-10-19` with the date of H-1**, as in Practice 3):

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT hour, round(avg_temp::numeric, 1) AS avg_temp, min_temp, max_temp,
       round(avg_humidity, 1) AS avg_humidity, round(avg_soil, 1) AS avg_soil, min_soil, reading_count
FROM readings_hourly
WHERE device_id = 'f00d00000001'
  AND hour >= '2026-10-19 06:00:00+07' AND hour < '2026-10-19 12:00:00+07'
ORDER BY hour;
```

**Expected output:**

```text
          hour          | avg_temp | min_temp | max_temp | avg_humidity | avg_soil | min_soil | reading_count 
------------------------+----------+----------+----------+--------------+----------+----------+---------------
 2026-10-19 06:00:00+07 |     23.8 |     23.4 |     24.2 |         79.0 |     67.5 |       67 |             6
 2026-10-19 07:00:00+07 |     24.8 |     24.1 |     25.4 |         75.3 |     66.2 |       65 |             6
 2026-10-19 08:00:00+07 |     25.8 |     25.5 |     26.3 |         73.0 |     64.2 |       63 |             6
 2026-10-19 09:00:00+07 |     26.6 |     25.9 |     27.4 |         70.7 |     61.8 |       61 |             6
 2026-10-19 10:00:00+07 |     27.7 |     27.2 |     28.6 |         69.5 |     59.3 |       58 |             6
 2026-10-19 11:00:00+07 |     28.5 |     28.1 |     29.3 |         67.8 |     56.5 |       55 |             6
(6 rows)
```

The `avg_temp` column is exactly the same as the `time_bucket` result in Practice 3.3, but this time not a single raw reading is computed again: the numbers are read from the summary that's already stored. `round(…, 1)` is still needed, because averages are stored with many digits after the decimal point. Without `round`, a temperature of 23.1 can show up as `23.099999999999998`, a built-in property of the `double precision` type.

Now look at the newest hours:

```sql
SELECT hour, device_id, round(avg_temp::numeric, 1) AS avg_temp, reading_count
FROM readings_hourly
ORDER BY hour DESC, device_id
LIMIT 4;
RESET TIME ZONE;
```

**Expected output** (example, run a few minutes after the test data was loaded):

```text
          hour          |  device_id   | avg_temp | reading_count 
------------------------+--------------+----------+---------------
 2026-10-20 22:00:00+07 | beef00000001 |     25.9 |           109
 2026-10-20 22:00:00+07 | f00d00000001 |     25.0 |             2
 2026-10-20 22:00:00+07 | f00d00000002 |     26.5 |             2
 2026-10-20 21:00:00+07 | beef00000001 |     26.5 |           360
(4 rows)
```

In this example, the top row (22:00) is the hour that's still running. The clerk hasn't summarized that hour yet (`end_offset` 1 hour), but it still shows up, complete with its number of readings so far. This is the real-time summary: the part that hasn't been stored yet is computed directly from `readings` when you ask. If your test data was loaded a few hours earlier and no device is sending, your top row is the last hour of the test data, which is already summarized. In Practice 8, new readings from Node 1 or the simulator show up here the same way.

#### 5.6 Measure: the summary book versus the raw data

Repeat the Practice 4 measurement, this time from the summary book:

```sql
EXPLAIN (ANALYZE)
SELECT hour, round(avg_temp::numeric, 1) AS avg_temp, reading_count
FROM readings_hourly
WHERE device_id = 'beef00000001'
  AND hour >= now() - INTERVAL '7 days'
ORDER BY hour;
```

**Expected output** (example):

```text
                                                                                                           QUERY PLAN                                                                                                            
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Result  (cost=0.15..71.90 rows=334 width=48) (actual time=0.032..0.632 rows=168 loops=1)
   ->  Append  (cost=0.15..66.89 rows=334 width=24) (actual time=0.023..0.529 rows=168 loops=1)
         ->  Subquery Scan on "*SELECT* 1"  (cost=0.15..23.60 rows=178 width=24) (actual time=0.022..0.138 rows=166 loops=1)
               ->  Result  (cost=0.15..21.82 rows=178 width=204) (actual time=0.021..0.127 rows=166 loops=1)
                     ->  Custom Scan (ChunkAppend) on _materialized_hypertable_2  (cost=0.15..20.04 rows=178 width=24) (actual time=0.020..0.111 rows=166 loops=1)
                           Order: _materialized_hypertable_2.hour
                           Chunks excluded during startup: 0
                           ->  Index Scan Backward using _hyper_2_123_chunk__materialized_hypertable_2_hour_idx on _hyper_2_123_chunk  (cost=0.15..3.05 rows=20 width=24) (actual time=0.019..0.025 rows=8 loops=1)
                                 Index Cond: ((hour < '2026-10-20 14:00:00+00'::timestamp with time zone) AND (hour >= (now() - '7 days'::interval)))
                                 Filter: (device_id = 'beef00000001'::text)
                                 Rows Removed by Filter: 16
                           ->  Index Scan Backward using _hyper_2_122_chunk__materialized_hypertable_2_device_id_hour_id on _hyper_2_122_chunk  (cost=0.28..16.99 rows=158 width=24) (actual time=0.027..0.076 rows=158 loops=1)
                                 Index Cond: ((device_id = 'beef00000001'::text) AND (hour < '2026-10-20 14:00:00+00'::timestamp with time zone) AND (hour >= (now() - '7 days'::interval)))
         ->  Subquery Scan on "*SELECT* 2"  (cost=0.28..41.62 rows=156 width=24) (actual time=0.280..0.378 rows=2 loops=1)
               ->  GroupAggregate  (cost=0.28..40.06 rows=156 width=185) (actual time=0.279..0.377 rows=2 loops=1)
                     Group Key: (time_bucket('01:00:00'::interval, readings.ts))
                     ->  Result  (cost=0.28..36.55 rows=156 width=29) (actual time=0.020..0.327 rows=469 loops=1)
                           ->  Custom Scan (ChunkAppend) on readings  (cost=0.28..34.60 rows=156 width=29) (actual time=0.020..0.279 rows=469 loops=1)
                                 Order: time_bucket('01:00:00'::interval, readings.ts)
                                 Chunks excluded during startup: 0
                                 ->  Index Scan Backward using _hyper_1_9_chunk_readings_ts_idx on _hyper_1_9_chunk  (cost=0.28..34.60 rows=156 width=29) (actual time=0.020..0.252 rows=469 loops=1)
                                       Index Cond: (ts >= '2026-10-20 14:00:00+00'::timestamp with time zone)
                                       Filter: ((device_id = 'beef00000001'::text) AND (time_bucket('01:00:00'::interval, ts) >= (now() - '7 days'::interval)))
                                       Rows Removed by Filter: 16
 Planning Time: 1.376 ms
 Execution Time: 0.845 ms
(26 rows)
```

This plan shows what's inside the "summary book" clearly. `Append` combines two parts:

1. **`*SELECT* 1`**: 166 rows read from the summaries that are already stored. TimescaleDB keeps them in a hidden hypertable named `_materialized_hypertable_2`, up to the boundary `hour < '2026-10-20 14:00:00+00'`: the 13:00–14:00 UTC bucket is the last hour the clerk has already summarized.
2. **`*SELECT* 2`**: the real-time part. In this example, 469 raw readings since that boundary are summarized on the spot into two rows. If there are no new readings after that boundary, this part gives no rows at all.

The result is 168 rows in **0.85 milliseconds**. Compare that with Practice 4:

| Source | `Execution Time` on the lab laptop |
| :--- | :--- |
| The plain table `readings_plain` | 26–35 ms |
| The hypertable `readings` | 18–22 ms |
| The summary book `readings_hourly` | **0.85–0.91 ms** |

About twenty times faster than the hypertable, because only 168 summary rows are read, not 60 thousand raw readings. The difference grows for longer ranges: a month or a year is still only a few thousand summary rows. (The result is 168 rows, not 169 as in Practice 4, because here the condition `hour >= now() - INTERVAL '7 days'` is tested on the **start** of every hour, so the first hour, which is only partly filled, isn't included.)

#### 5.7 Meet the clerk

Look at the list of all the jobs in this database:

```sql
SELECT job_id, application_name, schedule_interval, proc_name, hypertable_name
FROM timescaledb_information.jobs
ORDER BY job_id;
```

**Expected output:**

```text
 job_id |              application_name              | schedule_interval |              proc_name              | hypertable_name 
--------+--------------------------------------------+-------------------+-------------------------------------+-----------------
      1 | Telemetry Reporter [1]                     | 24:00:00          | policy_telemetry                    | 
      3 | Job History Log Retention Policy [3]       | 06:00:00          | policy_job_stat_history_retention   | 
   1000 | Refresh Continuous Aggregate Policy [1000] | 00:30:00          | policy_refresh_continuous_aggregate | readings_hourly
(3 rows)
```

Job **1000** is your summary book's clerk, scheduled every 30 minutes. The two jobs below 1000 belong to TimescaleDB itself: the telemetry reporter (which doesn't send anything because of `TIMESCALEDB_TELEMETRY=off` from Module 17) and the job-history cleaner. Just leave them both.

If you can't wait for the schedule, run the clerk now, then look at its work history:

```sql
CALL run_job(1000);
SELECT job_id, last_run_started_at, last_run_status, next_start, total_runs
FROM timescaledb_information.job_stats WHERE job_id = 1000;
```

**Expected output** (example; the times follow your migration):

```text
CALL
 job_id |      last_run_started_at      | last_run_status |          next_start           | total_runs 
--------+-------------------------------+-----------------+-------------------------------+------------
   1000 | 2026-10-20 15:21:15.328919+00 | Success         | 2026-10-20 15:51:15.417701+00 |          1
(1 row)
```

The `CALL run_job(1000)` you just ran doesn't increase `total_runs` (it stays at **1** in this example) and doesn't change `last_run_started_at`. That isn't a typo: `run_job` runs the job in your own psql session, while `job_stats` only records the work done by the background scheduler. In this example, what's recorded is the clerk's first run, a few seconds after `npm run migrate`, and `next_start` shows the next scheduled run: 30 minutes later. If you reach this step more than 30 minutes after the migration, your `total_runs` is already 2 or more, and `last_run_started_at` points to the last scheduled run. That's the scheduler's work, not your `run_job`.

#### 5.8 An exact daily average from the summary book

The hourly summary book can also answer daily questions. The key is the formula from Concept 5: add up `avg × n` for every hour, then divide by the sum of `n`. Both queries in this step use the test data, so their reference point is **the day you loaded the test data** in Practice 4.2. That day isn't necessarily today, for example if you continue this practice on another day or after 00:00. Forgot the date? `SELECT max(ts) AT TIME ZONE 'Asia/Jakarta' FROM readings WHERE device_id = 'beef00000001';` shows when you loaded it, in WIB. Replace `2026-10-17` with the date **three days before that loading day**:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT time_bucket('1 day', hour, 'Asia/Jakarta') AS day,
       round((sum(avg_temp * temp_n) / sum(temp_n))::numeric, 1) AS avg_temp,
       round(sum(avg_humidity * humidity_n) / sum(humidity_n), 1) AS avg_humidity,
       round(sum(avg_light * light_n) / sum(light_n), 1) AS avg_light,
       sum(reading_count) AS count
FROM readings_hourly
WHERE device_id = 'beef00000001' AND hour >= '2026-10-17 00:00:00+07'
GROUP BY day ORDER BY day;
```

**Expected output** (example; the last row is the day the test data was loaded, and its contents follow the time you loaded it):

```text
          day           | avg_temp | avg_humidity | avg_light | count 
------------------------+----------+--------------+-----------+-------
 2026-10-17 00:00:00+07 |     27.0 |         75.0 |    1112.3 |  8640
 2026-10-18 00:00:00+07 |     27.0 |         75.0 |    1112.5 |  8640
 2026-10-19 00:00:00+07 |     27.0 |         75.0 |    1112.0 |  8640
 2026-10-20 00:00:00+07 |     27.2 |         74.6 |    1194.4 |  8029
(4 rows)
```

`time_bucket('1 day', hour, 'Asia/Jakarta')` groups 24 hourly rows into one WIB day, as in Practice 3.4. The full days hold 8,640 readings. The last day, the day the test data was loaded, is only partly filled, up to the minute you loaded it.

Is the `avg × n` formula really necessary? Prove it yourself on the day the test data was loaded, whose hours aren't equally full. The following query computes that day's average in three ways: from the raw data, from the summary with the `avg × n` formula, and from the summary as an "average of averages". **`UNION ALL`** stacks the results of several `SELECT`s into one table. Replace `2026-10-20` and `2026-10-21` with **the date the test data was loaded** and **the day after it** (if you loaded it today, today's date and tomorrow's):

```sql
SELECT 'raw' AS source, round(avg(temperature)::numeric, 1) AS temperature, round(avg(humidity), 1) AS humidity,
       round(avg(soil), 1) AS soil, round(avg(light), 1) AS light, count(*) AS n
FROM readings WHERE device_id = 'beef00000001' AND ts >= '2026-10-20 00:00:00+07' AND ts < '2026-10-21 00:00:00+07'
UNION ALL
SELECT 'summary', round((sum(avg_temp * temp_n) / sum(temp_n))::numeric, 1),
       round(sum(avg_humidity * humidity_n) / sum(humidity_n), 1),
       round(sum(avg_soil * soil_n) / sum(soil_n), 1),
       round(sum(avg_light * light_n) / sum(light_n), 1), sum(reading_count)
FROM readings_hourly WHERE device_id = 'beef00000001' AND hour >= '2026-10-20 00:00:00+07' AND hour < '2026-10-21 00:00:00+07'
UNION ALL
SELECT 'average of averages', round(avg(avg_temp)::numeric, 1), round(avg(avg_humidity), 1),
       round(avg(avg_soil), 1), round(avg(avg_light), 1), sum(reading_count)
FROM readings_hourly WHERE device_id = 'beef00000001' AND hour >= '2026-10-20 00:00:00+07' AND hour < '2026-10-21 00:00:00+07';
RESET TIME ZONE;
```

**Expected output** (example):

```text
       source        | temperature | humidity | soil | light  |  n   
---------------------+-------------+----------+------+--------+------
 raw                 |        27.2 |     74.6 | 59.4 | 1194.4 | 8029
 summary             |        27.2 |     74.6 | 59.4 | 1194.4 | 8029
 average of averages |        27.1 |     74.7 | 59.5 | 1159.1 | 8029
(3 rows)
```

The `summary` row is exactly the same as `raw`. The `average of averages` row is off, most of all for light: 1,159.1 where it should be 1,194.4. The cause is the last hour of that day, which is only partly filled. In this example that hour is 22:00, a dark night hour, with 109 readings. A plain average gives it the same weight as the full hours of 360 readings, so the light gets dragged down. (If you loaded the test data in the daytime, your last hour is bright, and the difference may go the other way.) The `avg × n` formula gives every hour a weight that matches its number of readings, so the result is exact. This is the formula that backend v0.3 uses for `bucket=1d` in Practice 8. On the lab laptop, this method was tested on all 137 "day × device" pairs that exist, including partly filled days, and the result was always exactly the same as the raw data.

#### 5.9 Save to the branch

Leave psql with `\q`. In the first terminal (the `backend` folder):

```text
git add migrations/003_hourly_summary.sql
git commit -m "Automatic hourly summary (Module 18 Practice 5)"
git push
```

The `CALL refresh_continuous_aggregate(…)` command doesn't go into Git, because it's only run once on this database. The backend v0.3 README (➕ A) records it as a step after the migration, so that it isn't forgotten when the database is set up again.

> [!TIP]
> **Not working?**
>
> - `npm run migrate` answers `FAILED in 003_hourly_summary.sql: CREATE MATERIALIZED VIEW ... WITH DATA cannot run inside a transaction block` → the `WITH NO DATA;` line at the end of `CREATE MATERIALIZED VIEW` was left out. Add it, save, then run `npm run migrate` again. A failed migration isn't recorded, so it's safe to repeat.
> - `FAILED in 003_hourly_summary.sql: refresh_continuous_aggregate() cannot run inside a transaction block` → you put `CALL refresh_continuous_aggregate(…)` in the migration file. Delete that line from the file, run `npm run migrate` again, then run the `CALL` in psql as in 5.4.
> - `ERROR:  relation "readings_hourly" does not exist` → migration 003 hasn't succeeded yet. Check the answer of `npm run migrate` in the first terminal.
> - `NOTICE:  continuous aggregate "readings_hourly" is already up-to-date` → the `CALL` of 5.4 has already been run, and there's nothing left to summarize. This isn't an error.
> - In 5.4, the test device still has only 72 rows → the `CALL` hasn't been run yet, or it failed. Repeat 5.4.
> - The numbers in 5.8 are slightly different from the example, especially light → that's normal. The random part of the test data depends on the minute you loaded it. What matters is that the `summary` row is exactly the same as the `raw` row.
> - In 5.8, the three comparison rows have no numbers (`n` in the `raw` row is `0`) → the date in the query isn't the day you loaded the test data, for example because you continued Practice 5 on another day or after 00:00. Replace it with the loading date (see the `max(ts)` query at the start of 5.8).

> ⬆️ **Done with Practice 5?** Go back to [Concept 7](#7-retention-drop-old-binders-keep-their-summaries) (the ➡️ at the end of Concept 8 will take you to Practice 6).

### Practice 6 — 90-day retention and the columnstore (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal in the `backend` folder for `npm run migrate`, the second terminal for psql) and **Docker Desktop**.

In this practice you install the last two policies: **retention**, which drops raw readings older than 90 days (Concept 7), and the **columnstore**, which compresses binders older than 7 days (Concept 8). Remember what Concept 6 said: a policy starts working as soon as it's installed. That's why every step here always starts by **recording the "before" state**, and only then runs the migration. You left psql at the end of Practice 5, so go back in from the second terminal (`docker exec -it smarthome-db psql -U postgres -d smarthome`).

> [!IMPORTANT]
> Make sure you **have** run step 5.4 (`CALL refresh_continuous_aggregate(…)`). Once retention has done its work, the summaries for readings that have been dropped can't be made again.

#### 6.1 Record the state before retention

In psql (the second terminal), type these one at a time:

```sql
SELECT min(ts), max(ts), count(*) FROM readings;
SELECT count(*) AS chunks FROM show_chunks('readings');
SELECT pg_size_pretty(hypertable_size('readings')) AS size;
SELECT count(*) AS to_drop FROM show_chunks('readings', older_than => INTERVAL '90 days');
SELECT count(*) AS summaries_older_than_90_days FROM readings_hourly WHERE hour < now() - INTERVAL '90 days';
```

**Expected output** (example):

```text
          min           |          max           |  count  
------------------------+------------------------+---------
 2026-06-22 15:18:00+00 | 2026-10-20 15:18:00+00 | 1039085
(1 row)

 chunks 
--------
    121
(1 row)

  size  
--------
 201 MB
(1 row)

 to_drop 
---------
      30
(1 row)

 summaries_older_than_90_days 
------------------------------
                          721
(1 row)
```

Write down all five numbers. **`show_chunks('readings', older_than => INTERVAL '90 days')`** is a preview: the list of binders whose whole content is older than 90 days, in other words, the binders that are about to be dropped. In this example there are thirty, because this practice was done a few minutes after the test data was loaded. If you loaded it a few days earlier, there's one more binder for every 07:00 WIB that has passed since then, and the numbers that follow are different too. The last number counts the rows of the summary book for the hours older than 90 days. In a moment you'll check whether that number stays intact.

#### 6.2 The migration `004_retention.sql`

In the `backend/migrations` folder, create a new file **`004_retention.sql`**:

```sql
-- 004_retention.sql - drop raw readings older than 90 days (Module 18).
-- TimescaleDB drops whole binders (chunks), not rows one by one: fast, without DELETE.
-- The hourly summary (readings_hourly) stays, because the summary clerk's window (3 days) is much shorter than 90 days.
SELECT add_retention_policy('readings', drop_after => INTERVAL '90 days');
```

It holds one statement from Concept 7. In the first terminal (the `backend` folder), run:

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.2.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 004_retention.sql
1 new migration(s) applied, 3 applied earlier.
```

#### 6.3 Look at the result

Wait about five seconds, then go back to psql:

```sql
SELECT min(ts), max(ts), count(*) FROM readings;
SELECT now() - min(ts) AS oldest_age FROM readings;
SELECT count(*) AS chunks FROM show_chunks('readings');
SELECT pg_size_pretty(hypertable_size('readings')) AS size;
SELECT count(*) AS summaries_older_than_90_days FROM readings_hourly WHERE hour < now() - INTERVAL '90 days';
```

**Expected output** (example):

```text
          min           |          max           | count  
------------------------+------------------------+--------
 2026-07-22 00:00:00+00 | 2026-10-20 15:18:00+00 | 785393
(1 row)

       oldest_age        
-------------------------
 90 days 15:22:44.063391
(1 row)

 chunks 
--------
     91
(1 row)

  size  
--------
 152 MB
(1 row)

 summaries_older_than_90_days 
------------------------------
                          721
(1 row)
```

Compare them with your notes from 6.1:

| | Before | After |
| :--- | :--- | :--- |
| Raw readings | 1,039,085 | 785,393 |
| Binders | 121 | 91 |
| Size | 201 MB | 152 MB |
| Summaries older than 90 days | 721 | **721** |

The thirty oldest binders have already been dropped, even though you haven't run anything except `npm run migrate`: the retention job did its work by itself two seconds after it was installed. The oldest reading is now **90 days 15 hours** old, not exactly 90 days. That's normal, because retention only drops binders whose **whole** content is past the limit (Concept 7). The July 22 binder still holds readings younger than 90 days, so it waits for its turn tomorrow. Most importantly, the last row didn't change: **the summary book is safe**. See for yourself:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT hour, round(avg_temp::numeric, 1) AS avg_temp, reading_count
FROM readings_hourly WHERE device_id = 'beef00000001' ORDER BY hour LIMIT 3;
RESET TIME ZONE;
```

**Expected output** (example):

```text
          hour          | avg_temp | reading_count 
------------------------+----------+---------------
 2026-06-22 22:00:00+07 |     25.3 |           252
 2026-06-22 23:00:00+07 |     24.6 |           360
 2026-06-23 00:00:00+07 |     23.8 |           360
(3 rows)
```

The raw readings of June 22 are gone, but you can still get their hourly average temperatures. This is the division of labor planned since Concept 7: raw data is kept for 90 days, its summaries forever. Finally, look at the new clerk:

```sql
SELECT j.job_id, j.application_name, j.schedule_interval, s.last_run_status, s.last_run_duration, s.next_start
FROM timescaledb_information.jobs j
JOIN timescaledb_information.job_stats s USING (job_id)
WHERE j.job_id >= 1000
ORDER BY j.job_id;
```

**Expected output** (example):

```text
 job_id |              application_name              | schedule_interval | last_run_status | last_run_duration |          next_start           
--------+--------------------------------------------+-------------------+-----------------+-------------------+-------------------------------
   1000 | Refresh Continuous Aggregate Policy [1000] | 00:30:00          | Success         | 00:00:00.088782   | 2026-10-20 15:51:15.417701+00
   1001 | Retention Policy [1001]                    | 1 day             | Success         | 00:00:00.156763   | 2026-10-21 15:22:35.656334+00
(2 rows)
```

This query combines the list of jobs (`jobs`, given the short name `j`) with their work history (`job_stats`, short name `s`) through a `JOIN` (Module 17 Concept 8). `USING (job_id)` means "the column that links them is called `job_id` in both". Job **1001** dropped thirty binders in 0.16 seconds, and it's scheduled to work again one day later. Compare that with the `DELETE` on the plain table in Practice 4.7: both times about 30 days of readings were thrown away, but this time the size really goes down.

#### 6.4 Record the state before the columnstore

Now it's compression's turn. Record first:

```sql
SELECT pg_size_pretty(hypertable_size('readings')) AS size;
SELECT count(*) AS to_compress FROM show_chunks('readings', older_than => INTERVAL '7 days');
```

**Expected output** (example):

```text
  size  
--------
 152 MB
(1 row)

 to_compress 
-------------
          83
(1 row)
```

Of the 91 binders, 83 are older than 7 days and will be compressed. The eight newest binders stay stored row by row, because they're still being written to.

#### 6.5 The migration `005_columnstore.sql`

In the `backend/migrations` folder, create a new file **`005_columnstore.sql`**:

```sql
-- 005_columnstore.sql - compress binders older than 7 days by storing them column by column: columnstore (Module 18).
-- segmentby: readings are grouped per device; orderby: inside a group, they are sorted from the newest.
-- Binders that are already compressed can still be read, added to, and changed as usual.
ALTER TABLE readings SET (
  timescaledb.enable_columnstore,
  timescaledb.segmentby = 'device_id',
  timescaledb.orderby   = 'ts DESC'
);
CALL add_columnstore_policy('readings', after => INTERVAL '7 days');
```

It holds two commands from Concept 8: `ALTER TABLE … SET (…)` switches on the columnstore for `readings`, grouped per device and ordered by time, and then `CALL add_columnstore_policy(…)` installs the columnstore clerk. Notice the difference from 004: the retention policy is installed with `SELECT`, while the columnstore policy is installed with `CALL`, because `add_columnstore_policy` is a procedure. In the first terminal:

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.2.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 005_columnstore.sql
1 new migration(s) applied, 4 applied earlier.
```

#### 6.6 Look at the result

Wait about five seconds, then in psql:

```sql
SELECT pg_size_pretty(hypertable_size('readings')) AS size;
SELECT pg_size_pretty(before_compression_total_bytes) AS before,
       pg_size_pretty(after_compression_total_bytes)  AS after
FROM hypertable_columnstore_stats('readings');
```

**Expected output** (example):

```text
 size  
-------
 30 MB
(1 row)

 before | after 
--------+-------
 137 MB | 13 MB
(1 row)
```

**From 152 MB down to 30 MB**, about a fifth, in three seconds of work by the columnstore job. **`hypertable_columnstore_stats`** only itemizes the 83 binders that were compressed: from 137 MB down to 13 MB, ten times smaller. The rest, about 17 MB, is the eight newest binders that are still stored row by row, plus the "skeleton" of the compressed binders. Look at the status of the newest binders:

```sql
SELECT chunk_name, range_start, is_compressed FROM timescaledb_information.chunks
WHERE hypertable_name = 'readings' ORDER BY range_start DESC LIMIT 10;
```

**Expected output** (example):

```text
     chunk_name     |      range_start       | is_compressed 
--------------------+------------------------+---------------
 _hyper_1_9_chunk   | 2026-10-20 00:00:00+00 | f
 _hyper_1_8_chunk   | 2026-10-19 00:00:00+00 | f
 _hyper_1_7_chunk   | 2026-10-18 00:00:00+00 | f
 _hyper_1_6_chunk   | 2026-10-17 00:00:00+00 | f
 _hyper_1_5_chunk   | 2026-10-16 00:00:00+00 | f
 _hyper_1_4_chunk   | 2026-10-15 00:00:00+00 | f
 _hyper_1_3_chunk   | 2026-10-14 00:00:00+00 | f
 _hyper_1_2_chunk   | 2026-10-13 00:00:00+00 | f
 _hyper_1_1_chunk   | 2026-10-12 00:00:00+00 | t
 _hyper_1_121_chunk | 2026-10-11 00:00:00+00 | t
(10 rows)
```

The eight newest binders have the status `f` (false, not compressed yet); from the October 12 binder backward, they're all `t` (true, compressed). The October 13 binder isn't compressed yet, because part of its content isn't 7 days old yet. The columnstore clerk works every 12 hours, so tomorrow that binder gets compressed too. Your three clerks are now complete:

```sql
SELECT j.job_id, j.application_name, j.schedule_interval, s.last_run_status, s.last_run_duration, s.next_start
FROM timescaledb_information.jobs j
JOIN timescaledb_information.job_stats s USING (job_id)
WHERE j.job_id >= 1000
ORDER BY j.job_id;
```

**Expected output** (example):

```text
 job_id |              application_name              | schedule_interval | last_run_status | last_run_duration |          next_start           
--------+--------------------------------------------+-------------------+-----------------+-------------------+-------------------------------
   1000 | Refresh Continuous Aggregate Policy [1000] | 00:30:00          | Success         | 00:00:00.088782   | 2026-10-20 15:51:15.417701+00
   1001 | Retention Policy [1001]                    | 1 day             | Success         | 00:00:00.156763   | 2026-10-21 15:22:35.656334+00
   1002 | Columnstore Policy [1002]                  | 12:00:00          | Success         | 00:00:02.936432   | 2026-10-21 03:23:03.619804+00
(3 rows)
```

From now on, the database takes care of itself: it summarizes every 30 minutes, drops what's old every day, and compresses every 12 hours.

#### 6.7 A late send into a binder that's already compressed

A compressed binder isn't a frozen archive. Imagine the home network goes down all night, and the readings that were held back are sent later. In Module 27, the broker bridge on the Raspberry Pi will do something like that. Last night's readings still go into one of this week's binders, which aren't compressed yet. So that the late send really lands in a compressed binder, this example uses a much older reading. Try sending a reading from **30 days ago** with the same `INSERT` shape as backend v0.2 (**replace `2026-09-20` with the date 30 days ago** in all five places: twice in the first box, and once in each SQL box after it):

```sql
SELECT chunk_name, is_compressed FROM timescaledb_information.chunks
WHERE hypertable_name = 'readings' AND range_start = '2026-09-20 00:00:00+00';
INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level)
VALUES ('beef00000001', '2026-09-20 12:00:05+00', '1.4.0', 27.5, 70, 1500, 60, false, 70)
ON CONFLICT (device_id, ts) DO NOTHING;
```

**Expected output** (your binder's name may be different):

```text
     chunk_name     | is_compressed 
--------------------+---------------
 _hyper_1_100_chunk | t
(1 row)

INSERT 0 1
```

The binder is already compressed (`t`), but the new reading still goes in: `INSERT 0 1`. The seconds are deliberately `:05`, because the test readings always fall on the seconds `:00`, `:10`, `:20`, and so on, so this timestamp isn't taken yet. Run the same `INSERT` once more:

```sql
INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level)
VALUES ('beef00000001', '2026-09-20 12:00:05+00', '1.4.0', 27.5, 70, 1500, 60, false, 70)
ON CONFLICT (device_id, ts) DO NOTHING;
```

**Expected output:** `INSERT 0 0`. Even though the binder is compressed, a duplicate send is still stored only once, just as in Module 17 Practice 6. Without `ON CONFLICT`, the primary key still stands guard:

```sql
INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level)
VALUES ('beef00000001', '2026-09-20 12:00:05+00', '1.4.0', 27.5, 70, 1500, 60, false, 70);
```

**Expected output:**

```text
ERROR:  duplicate key value violates unique constraint "100_readings_pkey"
DETAIL:  Key (device_id, ts)=(beef00000001, 2026-09-20 12:00:05+00) already exists.
```

The constraint's name now contains the binder's number (`100_readings_pkey`), because every binder carries its own copy of the primary key. The late reading can be read as usual:

```sql
SELECT ts, temperature FROM readings WHERE device_id = 'beef00000001' AND ts = '2026-09-20 12:00:05+00';
```

**Expected output:**

```text
           ts           | temperature 
------------------------+-------------
 2026-09-20 12:00:05+00 |        27.5
(1 row)
```

TimescaleDB keeps this late reading in a small, uncompressed part inside the same binder. The columnstore clerk will tidy it up on its next round. Leave psql with `\q`.

#### 6.8 Save to the branch

In the first terminal (the `backend` folder):

```text
git add migrations/004_retention.sql migrations/005_columnstore.sql
git commit -m "90-day retention and columnstore (Module 18 Practice 6)"
git push
```

> [!TIP]
> **Not working?**
>
> - `FAILED in 005_columnstore.sql: add_columnstore_policy(unknown, after => interval) is a procedure` → the columnstore policy was written with `SELECT`. Change it to `CALL add_columnstore_policy(…)`, then run `npm run migrate` again.
> - `FAILED in 005_columnstore.sql: columnstore not enabled on hypertable "readings"` → the `ALTER TABLE readings SET (…)` part is missing or has a typo. Copy the file's content from 6.5 again.
> - In 6.3, the number of binders is still 121 → the retention job hasn't had time to work yet. Wait a few more seconds, then repeat. If it's still 121, run `CALL run_job(1001);`. Your job number is in the `job_id` column of the last query in 6.3.
> - In 6.6, the size is still 152 MB → the same: wait a moment, or run `CALL run_job(1002);`.
> - In 6.3, `summaries_older_than_90_days` is 0 → step 5.4 was skipped before retention did its work. The summaries for readings that have been dropped can't be made again. Just carry on with the module; your numbers in Practices 7–8 will be smaller than the examples.
> - The late send answers `INSERT 0 0` on the first try → its timestamp clashes with a test reading that's already there. Make sure the seconds are `:05`, not `:00`.
> - `ERROR:  duplicate key value violates unique constraint …` on the **first** try → the same: its timestamp clashes with a test reading. Use `:05`.

> ⬆️ **Done with Practice 6?** Go back to [Concept 9](#9-backup-and-restore-photocopy-the-archive-then-prove-it-can-be-restored) (the ➡️ at the end of Concept 9 will take you to Practice 7).

### Practice 7 — A backup and restore that's proven (45 minutes)

> 🖥️ **Tools used:** **VS Code** with two terminals in the `mini-smart-home/backend` folder, **Docker Desktop**, and **psql** inside the container. On **Windows**, use VS Code's built-in **PowerShell** terminal (both Windows PowerShell 5.1 and PowerShell 7 work), **not Git Bash**. If your VS Code terminal turns out to be Git Bash, click the small arrow next to the **+** icon in the terminal panel, choose **PowerShell** (or **Windows PowerShell**), then type `cd backend` in that new terminal. On macOS and Linux, use the normal terminal: all the commands are exactly the same.

Concept 9's lesson: a backup that has never been restored is the same as having no backup. This practice puts that lesson to work in four steps: record the original database's fingerprint, make its photocopy, build a new database from that photocopy, then prove that the contents are exactly the same.

#### 7.1 Keep the database quiet first

A proof of "exactly the same" only means something if the original database's contents don't change during this practice. If backend v0.2 or the device simulator from the previous modules is still running in one of the terminals, stop it with **Ctrl + C**. The TimescaleDB jobs may keep working. Only the retention job changes the readings, and step 7.2 runs it first.

In the real world, `pg_dump` can run while the application is running. It takes a snapshot of the database's contents at one moment, so the photocopy stays whole even while new readings keep coming in. The backend is only stopped here so that the numbers of the original and of the copy can be matched.

#### 7.2 The original database's fingerprint

In the second terminal, go into psql as usual (`docker exec -it smarthome-db psql -U postgres -d smarthome`). First, run the retention clerk right now (your retention job's number is in the job list of Practice 6.3):

```sql
CALL run_job(1001);
```

**Expected output:** `CALL`. The copy will run all its clerks as soon as it's restored (7.4), retention included. Every day at 07:00 WIB, one more binder crosses the 90-day limit, while the original database only drops it at its next scheduled retention run. Without this step, the copy could immediately lose a binder that the original database still has, and the proof in 7.5 wouldn't match. That's also why you should do 7.2 through 7.5 without a break that crosses 07:00 WIB. Now, still in psql, run this proof query:

```sql
SELECT (SELECT count(*) FROM readings) AS readings,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS fingerprint,
       (SELECT count(*) FROM readings_hourly) AS summaries,
       (SELECT count(*) FROM show_chunks('readings')) AS chunks,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS jobs;
```

**Expected output** (example; wait about 2–3 seconds):

```text
 readings |           fingerprint            | summaries | chunks | jobs 
----------+----------------------------------+-----------+--------+------
   785394 | 4af27a1271c640a4fa1d914cf2c26392 |      3263 |     91 |    3
(1 row)
```

This query asks five things at once. Every `(SELECT …)` in parentheses is one small question whose answer becomes one column:

| Column | What it holds |
| :--- | :--- |
| `readings` | The number of readings. In this example: 785,393 from Practice 6, plus the one late send from 6.7. For every 07:00 WIB that has passed since Practice 6, your number is 8,640 smaller and your `chunks` is one lower, because retention (including the `CALL run_job(1001);` you just ran) dropped one more binder. |
| `fingerprint` | **`md5`** turns any text into a 32-character "fingerprint". `md5(r::text)` makes the fingerprint of every row, `string_agg(…, '' ORDER BY r.device_id, r.ts)` strings them all together in a fixed order, and then the last `md5` sums up that string as one fingerprint. If even one number changes in one row, the fingerprint changes completely. |
| `summaries` | The number of rows in the summary book `readings_hourly`. |
| `chunks` | The number of chunks of the `readings` hypertable. |
| `jobs` | The number of jobs you created (1000, 1001, 1002). |

Your fingerprint will certainly be different from the example, because your test data was loaded at a different minute. What matters later: the copy's fingerprint must be **the same as your own fingerprint**. Copy the result row into Notepad or your notes, then leave psql with `\q`.

#### 7.3 The photocopy: `pg_dump`

In the first terminal (the `backend` folder), make the photocopy **inside the container**:

```text
docker exec smarthome-db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
```

**Expected output** (about 1–2 seconds):

```text
pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: continuous_agg
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
```

| Part | What it means |
| :--- | :--- |
| `pg_dump` | A program that comes with PostgreSQL inside the container, so its version is sure to match the database. You don't need to install anything on the laptop. |
| `-d smarthome` | The database that gets photocopied. |
| `-Fc` | The custom format: one packed, compressed file that `pg_restore` can read. |
| `-f /tmp/smarthome.dump` | Write the file to the temporary folder inside the container. |

The *circular foreign-key constraints* warning (foreign keys that go around in a circle) is normal. The TimescaleDB catalog table that records the summary books (`continuous_agg`) has a foreign key that points back at that same table. The content of catalog tables like that is always copied as "data only", so `pg_dump` warns that restoring their rows could get stuck on that foreign key. That's why the last `hint` line mentions `--data-only`. The TimescaleDB documentation says that messages like this are usually safe to ignore, and the restore in 7.4 will prove it. The backup you made yourself is a full backup, holding the shape of the tables as well as their data.

Now copy the file to the laptop, into a new `backup` folder. **Replace `2026-10-20` in the file name with today's date** so that later backups don't overwrite each other. On later backups, you can skip `mkdir backup` because the folder already exists (if you run it anyway, the answer is `… already exists.`, or `File exists` on macOS, and that's harmless):

```text
mkdir backup
docker cp smarthome-db:/tmp/smarthome.dump backup/smarthome-2026-10-20.dump
```

**Expected output** in PowerShell (example; the path, date, and time follow your laptop; on macOS and Linux, `mkdir` prints nothing):

```text
    Directory: C:\Users\<name>\…\mini-smart-home\backend

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d----          20/10/2026    23:24                backup

Successfully copied 4.99MB (transferred 4.99MB) to C:\Users\<name>\…\mini-smart-home\backend\backup\smarthome-2026-10-20.dump
```

Check the file with `dir backup` (on macOS and Linux, `ls -l backup`):

```text
    Directory: C:\Users\<name>\…\mini-smart-home\backend\backup

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---          20/10/2026    23:24        4991511 smarthome-2026-10-20.dump
```

About **5 MB** for the whole database: 785 thousand readings, the summary book, six tables, and the three jobs. The `-Fc` format compresses the content, much like a ZIP file.

> [!WARNING]
> **Don't make backups with the `>` sign** (for example `docker exec smarthome-db pg_dump … > file.dump`), even though that way shows up a lot on the internet. In Windows PowerShell 5.1, the `>` sign turns the file's content into UTF-16 text. The file becomes almost twice as large and **corrupted**: `pg_restore` refuses it with `input file does not appear to be a valid archive`. The `-f` then `docker cp` way above is safe in every terminal.

#### 7.4 Build a new archive: restore into `smarthome_restored`

The photocopy is restored into a **new database** named `smarthome_restored`, in the same container. The original database isn't touched at all. Run these commands one at a time in the first terminal, with the same file name as in 7.3:

```text
docker cp backup/smarthome-2026-10-20.dump smarthome-db:/tmp/restore.dump
docker exec smarthome-db createdb -U postgres -T template0 smarthome_restored
docker exec smarthome-db psql -U postgres -d smarthome_restored -c "CREATE EXTENSION timescaledb;"
docker exec smarthome-db psql -U postgres -d smarthome_restored -c "SELECT timescaledb_pre_restore();"
docker exec smarthome-db pg_restore -U postgres -d smarthome_restored /tmp/restore.dump
docker exec smarthome-db psql -U postgres -d smarthome_restored -c "SELECT timescaledb_post_restore();"
```

**Expected output**, in order, for the six commands:

```text
Successfully copied 4.99MB (transferred 4.99MB) to smarthome-db:/tmp/restore.dump
```

```text
CREATE EXTENSION
```

```text
 timescaledb_pre_restore 
-------------------------
 t
(1 row)
```

```text
 timescaledb_post_restore 
--------------------------
 t
(1 row)
```

The second command (`createdb`) and the fifth (`pg_restore`) print nothing when they succeed; `pg_restore` takes about 5 seconds. This is what happens in each step:

1. **`docker cp backup/… smarthome-db:/tmp/restore.dump`**: the file on the laptop is copied back into the container. What gets restored is deliberately the **laptop's** copy, not the `/tmp/smarthome.dump` that's still in the container. In a real disaster, the container may be gone; all that's left is the file on the laptop or on a flash drive.
2. **`createdb -T template0 smarthome_restored`**: create an empty database. `template0` is a completely blank database template. The default template that's normally used, `template1`, already holds TimescaleDB in this image, while a restore is safest when it starts from a blank database.
3. **`CREATE EXTENSION timescaledb`**: install TimescaleDB version 2.30.2, the same as the source database (the requirement from Concept 9).
4. **`timescaledb_pre_restore()`**: ask TimescaleDB to stop working for a moment and get ready to receive the contents. The answer `t` (true) means it's ready.
5. **`pg_restore`**: rebuild all the tables, chunks, the summary book, and the jobs from the photocopy.
6. **`timescaledb_post_restore()`**: switch TimescaleDB back on. The clerks in the copy start working right away.

Don't add `-j` (restoring with several workers at once) to `pg_restore`: the TimescaleDB documentation says that this doesn't restore the TimescaleDB catalog correctly. Don't skip either of the two TimescaleDB steps, either. What happens if you skip them was covered in Concept 9: without step 4, some rows go missing and the primary key isn't put in place, while without step 6, most of the readings seem to vanish.

#### 7.5 ⭐ Prove the contents are the same

In the second terminal, go into psql, this time into the **copy**:

```text
docker exec -it smarthome-db psql -U postgres -d smarthome_restored
```

Run the proof query from 7.2 again, exactly the same:

```sql
SELECT (SELECT count(*) FROM readings) AS readings,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS fingerprint,
       (SELECT count(*) FROM readings_hourly) AS summaries,
       (SELECT count(*) FROM show_chunks('readings')) AS chunks,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS jobs;
```

**Expected output** (example):

```text
 readings |           fingerprint            | summaries | chunks | jobs 
----------+----------------------------------+-----------+--------+------
   785394 | 4af27a1271c640a4fa1d914cf2c26392 |      3263 |     91 |    3
(1 row)
```

Match it against your notes from 7.2, character by character. The number of readings, the fingerprint of 785 thousand rows, the summary book, the binders, and the jobs are **exactly the same**. **The second pass requirement is met**: your backup is proven to be restorable.

One more interesting thing:

```sql
SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database WHERE datname IN ('smarthome', 'smarthome_restored') ORDER BY 1;
```

**Expected output** (example):

```text
      datname       | pg_size_pretty 
--------------------+----------------
 smarthome          | 46 MB
 smarthome_restored | 40 MB
(2 rows)
```

The contents are the same, but the copy is a little smaller. The original database holds leftovers from the work done during this module, such as dead rows and empty space, while the copy was built compactly from scratch. **`pg_database`** is the list of all the databases in the container, and **`pg_database_size`** measures one whole database.

#### 7.6 Clean up

You have your proof, so the copy can be thrown away. Leave psql with `\q`, then in the first terminal:

```text
docker exec smarthome-db dropdb -U postgres smarthome_restored
docker exec smarthome-db rm /tmp/smarthome.dump /tmp/restore.dump
```

Neither command prints anything when it succeeds. **`dropdb`** deletes the copy together with its contents, and **`rm`** (remove) deletes the two temporary files inside the container. Type the database name carefully: `dropdb` doesn't ask for confirmation.

The file in the `backup` folder **stays**. To be really safe, also copy it somewhere else, for example to a flash drive or Google Drive: a backup that only exists on the same laptop is lost along with it if the laptop breaks. Treat that file like personal data, because it holds the whole database.

#### 7.7 Don't put backups in Git

Backup files are large and hold data, so they must not go into Git. In VS Code, open **`backend/.gitignore`** (created in Module 16), then add these two lines at the very bottom:

```text
# a photocopy of the database (pg_dump): large and holds personal data, keep it outside Git
backup/
```

Save it, then in the first terminal:

```text
git status
```

**Expected output:** `.gitignore` is listed as `modified`, and the `backup/` folder does **not** show up in the list. Save the change:

```text
git add .gitignore
git commit -m "The backup folder stays out of Git (Module 18 Practice 7)"
git push
```

> [!TIP]
> **Not working?**
>
> - `pg_dump: error: could not open output file "C:/Users/<name>/AppData/Local/Temp/smarthome.dump": No such file or directory` → you're using **Git Bash**, which turns `/tmp/…` into the Windows Temp folder. Switch to a PowerShell terminal, or write two slashes: `//tmp/smarthome.dump`.
> - `invalid output path: directory "C:\\…\\backend\\backup" does not exist` → the `backup` folder hasn't been created yet. Make sure the terminal is in the `backend` folder, run `mkdir backup`, then repeat `docker cp`.
> - `pg_restore: error: input file does not appear to be a valid archive` → the backup file is corrupted, usually because it was made with `>`. Repeat 7.3 with `-f` and `docker cp`.
> - `createdb: error: database creation failed: ERROR:  database "smarthome_restored" already exists` → it's left over from an earlier try. Run `docker exec smarthome-db dropdb -U postgres smarthome_restored`, then repeat 7.4 from `createdb`.
> - `ERROR:  extension "timescaledb" already exists` → `createdb` was run without `-T template0`. Throw that database away with `dropdb`, then repeat 7.4 from `createdb`.
> - `pg_restore` prints several `ERROR` lines, ending with `pg_restore: warning: errors ignored on restore: 3` → `timescaledb_pre_restore()` was skipped. Throw the copy away with `dropdb`, then repeat 7.4 from `createdb` (🚨 covers this in more detail).
> - In 7.5, `readings` is much smaller, for example 68 thousand → `timescaledb_post_restore()` hasn't been run. Run the sixth command of 7.4, then repeat the proof query.
> - In 7.5, the copy's `readings` is a few thousand short (8,640 for every binder, that is, one full day of test readings) and its `chunks` is lower, while `summaries` and `jobs` are the same → retention in the copy has already dropped an old binder that the original database hasn't dropped yet (`CALL run_job(1001);` in 7.2 was skipped, or 07:00 WIB passed between 7.2 and 7.4). Leave the copy's psql with `\q`, go into `smarthome` as in 7.2, run `CALL run_job(1001);`, then run the proof query there again. Now its numbers are the same as the copy's.
> - The fingerprints differ, even though every step was right → the original database's contents changed after 7.2, for example because the backend was still running. Stop the backend, run the proof query in `smarthome` again, then repeat 7.3–7.5. Also run both proof queries in psql: the text of every row follows the session time zone, so a fingerprint from DBeaver (WIB) is always different from a psql fingerprint (UTC).
> - `dropdb: error: database removal failed: ERROR:  database "smarthome_restored" is being accessed by other users` → psql in the second terminal (or another app) is still connected to the copy. Leave it first with `\q`, then repeat `dropdb`. The copy hasn't been deleted yet, so nothing is broken.

> ⬆️ **Done with Practice 7?** Go back to [Concept 10](#10-from-the-backend-one-bucket-parameter) (the ➡️ at the end of Concept 10 will take you to Practice 8).

### Practice 8 — Backend v0.3: history per bucket (45 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal for `npm run dev`, the second terminal for other commands, both in the `backend` folder), a **browser**, **Bruno**, and **Docker Desktop**. The MQTT broker and Node 1 (or the simulator `tools/device-simulator.js` from Module 16) may be switched on as in Module 17 Practice 5.6, so that new readings make it into the summary too. Start the simulator as in Module 16 Practice 7.2: open a third terminal, type `cd tools`, then `node device-simulator.js mqtt://192.168.1.37:1883` with your broker's address. Its fake devices are numbered `f00d00000001` to `f00d00000010`. The first two are the same as the practice devices, but their readings are only for the current hour, so the numbers of the days before day H don't change.

The database is ready: the hypertable, the summary book, retention, and the columnstore. Now the backend opens it up to the outside world through one new parameter, `bucket` (Concept 10). You change four files: `package.json`, `src/db/archive.ts`, `src/routes/devices.ts`, and `src/server.ts`. Every change is an **addition** or a replacement of a specific part, so other routes that you may have made yourself (for example from 🧩 in Modules 16–17) stay safe.

#### 8.1 Bump the version

In the second terminal (the `backend` folder):

```text
npm version 0.3.0 --no-git-tag-version
```

**Expected output:** `v0.3.0`. As in Module 17 Practice 5.5, the version number in both `package.json` and `package-lock.json` changes at once. Then open `package.json` and update the `"description"` line to:

```json
"description": "Mini Smart Home backend (Modules 16-18): listens to MQTT, checks the data contract, stores every message in a time-series database, and provides a history API with summaries",
```

#### 8.2 The archive book reads summaries: `src/db/archive.ts`

There are two changes in `src/db/archive.ts`.

1. Leave the second comment line (`// The in-memory store (store.ts) …`) as it is, then replace the first comment line (`// archive.ts - writes the messages …`) with these two lines:

   ```ts
   // archive.ts - writes the messages that passed the contract checks to the database, and reads them back for the history API
   // (raw readings, or their summary per 15 minutes, per hour, and per day).
   ```

2. Find the line `// Can the database be reached right now? Used by GET /health.` (above the `databaseAlive` function). **Right above that line**, add this block:

   ```ts
   // The bucket sizes that the history API accepts: 15 minutes, 1 hour, or 1 day.
   export type Bucket = "15m" | "1h" | "1d";

   // One summary point: the average, the lowest, and the highest within one bucket, with the number of readings in it.
   interface SummaryRow {
     time: Date; // the start of the bucket
     avg_temp: number | null;
     min_temp: number | null;
     max_temp: number | null;
     avg_humidity: number | null;
     avg_soil: number | null;
     avg_light: number | null;
     reading_count: number;
   }

   // One fixed query for every bucket size. Text from the user is never glued into the SQL: what gets chosen is only
   // one of these three queries. The numbers are cast to float8 and int so that pg sends them as numbers, not as text.
   const SUMMARY_QUERIES: Record<Bucket, string> = {
     // per 15 minutes: computed directly from the raw readings in the readings hypertable (the range is short)
     "15m": `SELECT time_bucket('15 minutes', ts) AS time,
               round(avg(temperature)::numeric, 1)::float8 AS avg_temp,
               min(temperature)                            AS min_temp,
               max(temperature)                            AS max_temp,
               round(avg(humidity)::numeric, 1)::float8    AS avg_humidity,
               round(avg(soil)::numeric, 1)::float8        AS avg_soil,
               round(avg(light)::numeric, 1)::float8       AS avg_light,
               count(*)::int                               AS reading_count
             FROM readings
             WHERE device_id = $1 AND ts >= $2 AND ts < $3
             GROUP BY time
             ORDER BY time`,
     // per hour: read from the summary book readings_hourly (continuous aggregate, migration 003)
     "1h": `SELECT hour AS time,
              round(avg_temp::numeric, 1)::float8 AS avg_temp,
              min_temp,
              max_temp,
              round(avg_humidity, 1)::float8      AS avg_humidity,
              round(avg_soil, 1)::float8          AS avg_soil,
              round(avg_light, 1)::float8         AS avg_light,
              reading_count::int                  AS reading_count
            FROM readings_hourly
            WHERE device_id = $1 AND hour >= $2 AND hour < $3
            ORDER BY hour`,
     // per WIB day: the hourly summaries combined again. Daily average = the sum of (average x number of values) over
     // all hours divided by the sum of the numbers of values, so it stays exact even when some hours are only partly
     // filled. nullif prevents a division by zero when that column is empty (NULL) for the whole day
     "1d": `SELECT time_bucket('1 day', hour, 'Asia/Jakarta') AS time,
              round((sum(avg_temp * temp_n) / nullif(sum(temp_n), 0))::numeric, 1)::float8  AS avg_temp,
              min(min_temp)                                                                 AS min_temp,
              max(max_temp)                                                                 AS max_temp,
              round(sum(avg_humidity * humidity_n) / nullif(sum(humidity_n), 0), 1)::float8 AS avg_humidity,
              round(sum(avg_soil * soil_n) / nullif(sum(soil_n), 0), 1)::float8             AS avg_soil,
              round(sum(avg_light * light_n) / nullif(sum(light_n), 0), 1)::float8          AS avg_light,
              sum(reading_count)::int                                                       AS reading_count
            FROM readings_hourly
            WHERE device_id = $1 AND hour >= $2 AND hour < $3
            GROUP BY time
            ORDER BY time`,
   };

   // The reading summary of one device per bucket in the range [from, to), oldest first.
   export async function getSummary(deviceId: string, from: Date, to: Date, bucket: Bucket) {
     const result = await pool.query<SummaryRow>(SUMMARY_QUERIES[bucket], [deviceId, from, to]);
     return result.rows.map((row) => ({ ...row, time: contractTime(row.time) })); // time as text
   }
   ```

It has four parts:

| Part | What it's for |
| :--- | :--- |
| `type Bucket` | A TypeScript type that only allows three texts: `"15m"`, `"1h"`, and `"1d"`. |
| `SummaryRow` | The shape of one row of a summary query's result, like `ReadingRow` in Module 17: `time` arrives as a `Date`, numbers as a `number`, and empty columns as `null`. |
| `SUMMARY_QUERIES` | A **dictionary** holding three fixed SQL queries, one for each bucket size (🔁 step 1). `Record<Bucket, string>` means "an object whose keys are exactly the three values of `Bucket`, and whose contents are text". If one key is forgotten, `npm run check` complains right away. |
| `getSummary` | Takes one query from the dictionary, sends the `device_id` and the time range as the parameters `$1`, `$2`, `$3`, then writes `time` in the data contract format, like `getHistory`. |

The three queries repeat what you've already tried in psql:

- **`15m`** is computed directly from the hypertable with `time_bucket('15 minutes', ts)` (Practice 3). Its range is short, so it stays fast.
- **`1h`** is read from the summary book `readings_hourly` (Practice 5), without recomputing the raw readings.
- **`1d`** combines the hourly summaries into WIB days with the `avg × n` formula from Practice 5.8. **`nullif(sum(temp_n), 0)`** turns a divisor of 0 into `NULL`, so a day without a single temperature value gives `null`, not a "division by zero" error.

The endings **`::float8`** and **`::int`** turn the results into ordinary numbers, so that the `pg` library sends them as numbers, not as text (🔁 step 5).

#### 8.3 The history door accepts `bucket`: `src/routes/devices.ts`

There are seven changes in `src/routes/devices.ts`. You can compare the end result with the [final `devices.ts`](code/backend/src/routes/devices.ts) file.

1. In the very first line, change the comment to:

   ```ts
   // devices.ts - the /devices routes: the device list, the latest reading, the history from the database (raw or summarized),
   // and commands.
   ```

2. Change the import line from the archive book so that it also takes `getSummary`:

   ```ts
   import { getSummary, getHistory, archiveCommand, contractTime } from "../db/archive.ts";
   ```

3. Below the `import` lines, add the **bucket dictionary** and the **`computeRange`** function:

   ```ts
   const MINUTE = 60 * 1000; // in milliseconds, like Date.getTime()
   const HOUR = 60 * MINUTE;
   const DAY = 24 * HOUR;
   const MAX_BUCKETS = 1000; // at most 1,000 buckets (chart points) per request

   // The bucket dictionary: the width of a bucket, the default range when from is empty, and a shift so days start at 00:00 WIB.
   const BUCKETS = {
     "15m": { width: 15 * MINUTE, defaultSpan: DAY, shift: 0 },
     "1h": { width: HOUR, defaultSpan: 7 * DAY, shift: 0 },
     "1d": { width: DAY, defaultSpan: 30 * DAY, shift: 7 * HOUR }, // WIB = UTC + 7 hours
   };

   // The range actually asked for. An empty to = now. An empty from = 1 hour before to (raw readings) or the bucket's
   // default range. With a bucket, the start of the range is rounded down to a bucket start, so the first bucket is whole.
   function computeRange(q: { from?: string; to?: string; bucket?: keyof typeof BUCKETS }) {
     const toTime = q.to ? new Date(q.to) : new Date();
     if (q.bucket === undefined) {
       return { fromTime: q.from ? new Date(q.from) : new Date(toTime.getTime() - HOUR), toTime };
     }
     const { width, defaultSpan, shift } = BUCKETS[q.bucket];
     const start = q.from ? new Date(q.from).getTime() : toTime.getTime() - defaultSpan;
     return { fromTime: new Date(Math.floor((start + shift) / width) * width - shift), toTime }; // for example 10:37 -> 10:30
   }
   ```

4. Below the line `const Kind = …;`, add the bucket choices for Zod:

   ```ts
   const BucketParam = z.enum(["15m", "1h", "1d"]);
   ```

5. Replace the whole `const Range = …;`, from `const Range = z.object({` to its closing `});`, with this new version:

   ```ts
   const Range = z.object({
     from: z.iso.datetime({ offset: true }).optional()
       .describe("start of the range, e.g. 2026-10-20T10:00:00+07:00 (default: 1 hour before to; with bucket: 1, 7, or 30 days)"),
     to: z.iso.datetime({ offset: true }).optional().describe("end of the range, not included (default: now)"),
     bucket: BucketParam.optional()
       .describe("summarize per 15 minutes (15m), per hour (1h), or per WIB day (1d); without bucket = raw readings"),
   }).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // a reversed range is refused with code 400
     message: "must be later than from", path: ["to"],
     when: (result) => result.issues.length === 0, // the order is only checked when from and to have passed the format checks
   }).refine((r) => { // a summary with too many buckets is refused with code 400 as well
     if (r.bucket === undefined) return true; // raw readings are already limited to 1,000 readings by getHistory
     const { fromTime, toTime } = computeRange(r);
     return Math.ceil((toTime.getTime() - fromTime.getTime()) / BUCKETS[r.bucket].width) <= MAX_BUCKETS;
   }, {
     message: `range too long: at most ${MAX_BUCKETS} buckets (15m about 10 days, 1h about 41 days, `
       + "1d about 2.7 years)",
     path: ["from"],
     when: (result) => result.issues.length === 0,
   });
   ```

6. Below `const Reading = …;`, add the shape of one summary point:

   ```ts
   const SummaryPoint = z.object({
     time: z.string(), avg_temp: num, min_temp: num, max_temp: num, avg_humidity: num, avg_soil: num,
     avg_light: num, reading_count: z.number(),
   });
   ```

7. Replace the whole `app.get("/devices/:id/readings", …)` route, from that line to its closing `});` (right above `app.post("/devices/:id/command", …)`), with:

   ```ts
     app.get("/devices/:id/readings", {
       schema: {
         tags: ["devices"],
         summary: "History of one device from the database: raw readings (at most 1,000) or a summary per bucket",
         params: IdParam,
         querystring: Range,
         response: {
           200: z.union([
             z.object({
               device_id: z.string(), from: z.string(), to: z.string(), count: z.number(), truncated: z.boolean(),
               readings: z.array(Reading),
             }),
             z.object({
               device_id: z.string(), from: z.string(), to: z.string(), bucket: BucketParam, count: z.number(),
               summary: z.array(SummaryPoint),
             }),
           ]).describe("without bucket: raw readings, truncated = there were more than 1,000 readings; with bucket: one summary "
             + "point per bucket. Both oldest first"),
           503: ErrorBody.describe("the database can't be reached right now"),
         },
       },
     }, async (req, reply) => {
       const { fromTime, toTime } = computeRange(req.query);
       const bucket = req.query.bucket;
       try {
         if (bucket !== undefined) {
           const summary = await getSummary(req.params.id, fromTime, toTime, bucket);
           return {
             device_id: req.params.id, from: contractTime(fromTime), to: contractTime(toTime), bucket, count: summary.length,
             summary,
           };
         }
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

This is what's new:

- **The `BUCKETS` dictionary** is the dictionary from 🔁 step 1, now with `shift` for WIB days. **`computeRange`** uses the tricks of 🔁 steps 2 and 4: without `bucket`, the range stays as in Module 17; with `bucket`, the start of the range is rounded down to the start of a bucket (`Math.floor`), and for `1d` it's shifted by 7 hours first, so that the day starts at 00:00 WIB.
- **`bucket: BucketParam.optional()`**: Zod only accepts `15m`, `1h`, or `1d`. Any other value is refused with `400` before a single query reaches the database.
- **The second `.refine(…)`** counts the buckets with `Math.ceil` (🔁 step 3). More than 1,000 buckets are refused with `400`. The `when` option makes sure this check only runs once `from`, `to`, and `bucket` have passed the earlier checks.
- **`z.union([… , …])`** in the `response` part: the `200` answer now has two shapes, "raw readings" or "summary", and both are listed in `/docs`.
- Inside the route, **`if (bucket !== undefined)`** picks the summary path. Without `bucket`, the code is exactly the same as in Module 17.

#### 8.4 `server.ts` v0.3

In `src/server.ts`, change the comment in the first line:

```ts
// server.ts - the entry point of the Mini Smart Home backend v0.3 (Module 18: the history can be summarized per 15 minutes, hour, and day).
```

Then, inside `await app.register(swagger, { … })`, change the `openapi` line so that `/docs` shows the new version:

```ts
openapi: { info: { title: "Mini Smart Home API", description: "Backend v0.3 (Module 18)", version: "0.3.0" } },
```

#### 8.5 Run it

In the second terminal, check the types:

```text
npm run check
```

**Expected output:**

```text
> mini-smart-home-backend@0.3.0 check
> tsc --noEmit
```

No other lines means it's clean. Then, in the first terminal (the `backend` folder), run `npm run dev`. **Expected output** (example; your times and broker address are different):

```text
[22:30:09] INFO: database ready
[22:30:09] INFO: Server listening at http://127.0.0.1:8080
[22:30:09] INFO: API docs: http://127.0.0.1:8080/docs
[22:30:09] INFO: connected to broker mqtt://127.0.0.1:1883
```

The last line only appears if the broker is running. Without a broker, the backend can still answer every history question from the database.

#### 8.6 ⭐ Ask for the summary from the browser

As in Practice 3, this example uses the practice data and day H = October 20, 2026. Replace the dates in the addresses with your day H dates: `2026-10-13` with H-7, `2026-10-19` with H-1, and `2026-10-20` with H.

**1. Per hour, seven full days.** Open this address in the browser:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=1h&from=2026-10-13T00:00:00%2B07:00&to=2026-10-20T00:00:00%2B07:00
```

**Expected output** (tidied up and shortened):

```text
{
  "device_id": "f00d00000001",
  "from": "2026-10-12T17:00:00Z",
  "to": "2026-10-19T17:00:00Z",
  "bucket": "1h",
  "count": 168,
  "summary": [
    {"time": "2026-10-12T17:00:00Z", "avg_temp": 23.1, "min_temp": 22.7, "max_temp": 23.3, "avg_humidity": 79.7,
     "avg_soil": 61.5, "avg_light": 22.3, "reading_count": 6},
    … 167 more points …
  ]
}
```

Seven days × 24 hours = **168 points**, one per hour, all read from the summary book. Every point holds the average, lowest, and highest temperature; the average humidity, soil, and light; and the number of readings. As in Module 17, all the times are written in UTC: the first point, `2026-10-12T17:00:00Z`, is 00:00 WIB on the 13th.

**2. Per day, seven full days.** Replace `1h` with `1d` in the same address:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=1d&from=2026-10-13T00:00:00%2B07:00&to=2026-10-20T00:00:00%2B07:00
```

**Expected output:** `"bucket":"1d"` and `"count":7`. The seven points, summarized:

| `time` (UTC) | WIB day | `avg_temp` | `min_temp` | `max_temp` | `reading_count` |
| :--- | :--- | ---: | ---: | ---: | ---: |
| `2026-10-12T17:00:00Z` | October 13 | `26.2` | `21.8` | `30.6` | `144` |
| `2026-10-13T17:00:00Z` | October 14 | `25.6` | `21.1` | `30` | `144` |
| `2026-10-14T17:00:00Z` | October 15 | `26.5` | `22` | `30.8` | `144` |
| `2026-10-15T17:00:00Z` | October 16 | `27.1` | `22.6` | `31.6` | `144` |
| `2026-10-16T17:00:00Z` | October 17 | `26.7` | `22.3` | `31.1` | `144` |
| `2026-10-17T17:00:00Z` | October 18 | `25.8` | `21.4` | `30.2` | `144` |
| `2026-10-18T17:00:00Z` | October 19 | `26.3` | `22` | `30.6` | `144` |

You've already seen this `avg_temp` column twice: in the pass-requirement table of Module 17 Practice 4.5, and in Practice 3.4 of this module. Now the same numbers come from the API, computed from the hourly summary book with the `avg × n` formula. Every day starts at 17:00 UTC, that is, 00:00 WIB, thanks to `shift` in the `BUCKETS` dictionary and `'Asia/Jakarta'` in the `1d` query.

**3. Per 15 minutes, one morning hour.** Replace `2026-10-19` with your H-1 date in both places:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=15m&from=2026-10-19T06:00:00%2B07:00&to=2026-10-19T07:00:00%2B07:00
```

**Expected output** (shortened): four points with the `avg_temp` values `23.6`, `23.4`, `24.2`, and `23.8`, and the `reading_count` values `2`, `1`, `2`, and `1`. Exactly like `time_bucket` in Practice 3.2.

**4. Without `from`.** The default range applies. Try the test device:

```text
http://127.0.0.1:8080/devices/beef00000001/readings?bucket=1h
```

**Expected output** (example, shortened):

```text
{"device_id":"beef00000001","from":"2026-10-13T15:00:00Z","to":"2026-10-20T15:30:22Z","bucket":"1h","count":169,
"summary":[{"time":"2026-10-13T15:00:00Z","avg_temp":25.5, … ,"reading_count":360}, … ]}
```

The default range of `1h` is the seven days up to now. `to` is the moment you ask (in this example `15:30:22Z`, 22:30 WIB), while `from` is rounded down to the start of the hour: `15:00:00Z`, not `15:30:22Z`. That's why the first bucket is always whole, and there are 169 points, not 168. If your test data was loaded a few days ago, there are fewer points, because the hours after you loaded it simply have no readings. If Node 1 or the simulator is running, also try the same address with its `device_id`, then reload after a few minutes: the `reading_count` of the last point keeps going up, because the current hour is computed directly from the raw readings (the real-time summary, Practice 5.5).

**5. Questions that get refused.** All three are answered with `400` and `"code":"FST_ERR_VALIDATION"`:

- **A bucket that isn't available**: `http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=5m`. Its `message` is `querystring/bucket Invalid option: expected one of "15m"|"1h"|"1d"`. Capital letters (`1H`) and an empty `bucket=` are refused with the same message too.
- **Too many buckets**: `http://127.0.0.1:8080/devices/beef00000001/readings?bucket=15m&from=2026-09-20T00:00:00%2B07:00` (a month in 15-minute buckets, almost 3,000 buckets). Its `message` is `querystring/from range too long: at most 1000 buckets (15m about 10 days, 1h about 41 days, 1d about 2.7 years)`. The same range with `bucket=1d` passes.
- **A reversed range**, just as in Module 17: its `message` is `querystring/to must be later than from`.

**6. Without `bucket`, everything is as before.** Open the example address of Module 17 Practice 7.3 step 2 (replace the date with your H-1):

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06:00:00%2B07:00&to=2026-10-19T07:00:00%2B07:00
```

The **expected output** is exactly the same as in Module 17: `"count":6`, `"truncated":false`, and six raw readings. Applications that already use API v0.2 don't need to change.

#### 8.7 The new parameter in `/docs`

Open `http://127.0.0.1:8080/docs`. The version badge next to the title `Mini Smart Home API` now says `0.3.0`, and the description below it now says `Backend v0.3 (Module 18)`. Click the **GET** `/devices/{id}/readings` row. Its summary has changed to `History of one device from the database: raw readings (at most 1,000) or a summary per bucket`, and the **Parameters** section has a new parameter, **`bucket`** (marked `query`), complete with its description. Because `bucket` only has three choices, Swagger UI writes `Available values : 15m, 1h, 1d` and shows it as a dropdown list holding `--`, `15m`, `1h`, and `1d`, not a free text box. The `--` choice means that `bucket` isn't sent, so the answer is raw readings.

Try it straight away: click **Try it out**, choose `1d` in `bucket`, fill in `id` with `f00d00000001`, `from` with `2026-10-13T00:00:00+07:00`, and `to` with `2026-10-20T00:00:00+07:00` (use your H-7 and H dates), then click **Execute**. **Server response** shows code `200` and the same seven points as step 2 of 8.6. In the **Responses** section, the **Example Value** for code `200` only shows the first shape, the raw readings. Click **Schema** next to it: there it says `anyOf`, followed by two `{...}` shapes that can be opened one at a time. Those are the two answer shapes from `z.union`: raw readings and summary.

![Trying bucket=1d straight from /docs: two pieces of a real Swagger UI screenshot of backend v0.3, after Try it out was clicked, bucket 1d was chosen, from, to, and id were filled in, and Execute was clicked, with four numbers and one small inset. Top, the GET /devices/{id}/readings route row with the summary History of one device from the database: raw readings (at most 1,000) or a summary per bucket, and the Cancel button. The Parameters section, number 1, holds from, string($date-time), (query), start of the range, e.g. 2026-10-20T10:00:00+07:00 (default: 1 hour before to; with bucket: 1, 7, or 30 days), filled in with 2026-10-13T00:00:00+07:00; to, string($date-time), (query), end of the range, not included (default: now), filled in with 2026-10-20T00:00:00+07:00; bucket, string, (query), summarize per 15 minutes (15m), per hour (1h), or per WIB day (1d); without bucket = raw readings, with a dropdown list showing 1d, pointed at by an orange arrow, while the name bucket has an orange outline; and id, marked with an asterisk and required, string, (path), the device's device_id, for example a4cf12e5b7c0, filled in with f00d00000001. Below them, the blue Execute button, number 2, next to Clear. Bottom, Request URL, number 3: http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-13T00%3A00%3A00%2B07%3A00&to=2026-10-20T00%3A00%3A00%2B07%3A00&bucket=1d, with bucket=1d underlined. Then Server response, number 4: Code 200 and a Response body that starts with device_id f00d00000001, from 2026-10-12T17:00:00Z, to 2026-10-19T17:00:00Z, bucket 1d and count 7 (both underlined), then summary with the first point: time 2026-10-12T17:00:00Z and avg_temp 26.2 (both underlined), min_temp 21.8, max_temp 30.6, avg_humidity 76.3, avg_soil 58.6, avg_light 1112.1, and reading_count 144. Captions on the right: number 1, Parameters: bucket is marked (query) and optional, its list holds --, 15m, 1h, and 1d, and 1d is chosen. The small inset below it shows the bucket row before Try it out is clicked: the text Available values : 15m, 1h, 1d and a gray dropdown list that still shows --. Number 2, Execute, sends the GET request to backend v0.3, and the + sign can be typed as it is in the input boxes. Number 3, Request URL: bucket=1d is added at the end of the address; Swagger UI wraps + and the colon as %2B and %3A. Number 4, Server response: code 200, bucket 1d, and count 7; the first point, 2026-10-12T17:00:00Z, is 00:00 WIB on the 13th, with avg_temp 26.2. Notes at the bottom: all seven points match step 2 in 8.6; for the practice data of device f00d00000001, the dates follow your day H and the numbers stay the same; scroll the answer box to see the other six points.](assets/swagger-bucket.png)

#### 8.8 Save the request in Bruno

1. In Bruno, open the **Node 1 history** request from Module 17, then right-click its **tab** and choose **Clone Request**. Change **Request Name** to `Node 1 hourly history`, then click **Clone**.
2. In that new tab, add `?bucket=1h` to the end of the URL so that it becomes `{{baseUrl}}/devices/a4cf12e5b7c0/readings?bucket=1h` (with your Node 1's `device_id`). The **Params** tab immediately shows a `bucket` row with the value `1h`.
3. The **Assert** tab was copied along: `res.status` `eq` `200` and `res.body.count` `gt` `0`.
4. Save (**Ctrl + S**), then click **Send**. The **Tests** tab in the answer panel now holds `Assertions (2), Passed: 2, Failed: 0`.

The second test passes as long as there are Node 1 readings in the last seven days. If Node 1 hasn't been switched on at all this week, switch on Node 1 or its simulator for a while, or replace the `device_id` in the URL with `f00d00000001`.

#### 8.9 Save to the branch

In the second terminal (the `backend` folder):

```text
git add .
git status
git commit -m "Backend v0.3: history per bucket (Module 18 Practice 8)"
git push
```

In the `Changes to be committed` part, `git status` must name five changed files (`package.json`, `package-lock.json`, `src/db/archive.ts`, `src/routes/devices.ts`, and `src/server.ts`) and one new file (`bruno/Node 1 hourly history.yml`). The `backup/` folder isn't included, thanks to the `.gitignore` from Practice 7.

> [!TIP]
> **Not working?**
>
> - `npm run check` prints `error TS2741: Property '"1d"' is missing in type …` → one of the keys in `SUMMARY_QUERIES` is missing. If the key has a typo (for example `"1D"`), the message is different: `error TS2353: Object literal may only specify known properties, and '"1D"' does not exist in type 'Record<Bucket, string>'`. Compare with the block in 8.2.
> - `bucket=1h` or `bucket=1d` is answered with `503`, even though `/health` answers `"database":true` → the summary book `readings_hourly` doesn't exist in this database yet (migration 003 hasn't been run). The backend's log says `relation "readings_hourly" does not exist`. Do Practice 5.2 and 5.4.
> - `bucket=1h` for the practice data answers with numbers that differ from 8.6 step 1 → the dates in the address haven't been replaced with your day H dates, or you refilled the practice data after Practice 5 (🚨 covers this).
> - Every address is answered with `"count":0` → the `device_id` has a typo, or the range holds no data. Check the dates.
> - The Bruno test `res.body.count gt 0` fails → there are no Node 1 readings in the last seven days. See the note below 8.8.

> ➡️ **Done with Practice 8?** Do Level 1 of the [🧩 Independent Challenges](#-independent-challenges), then steps A and B of the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home): there, backend v0.3 is merged into `main` through a pull request. Levels 2 and 3 come after that, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title of the problem that looks most like yours. For almost every problem in this module, these three checks show where the problem is: **`docker ps`** (is the `smarthome-db` container running?), **`SELECT * FROM schema_migrations;`** in psql (which migrations are already recorded?), and **`docker logs --tail 30 smarthome-db`** (what do PostgreSQL and TimescaleDB say?). Problems with Docker, ports, and the database password are covered in 🚨 of Module 17. For TypeScript errors from `npm run check`, compare your file with [`code/backend/`](code/backend/), then also look at 🚨 in Module 16.

<details>
<summary><b>Migration <code>002_hypertable.sql</code> fails, or <code>readings</code> is already a hypertable</b></summary>

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `npm run migrate` answers `FAILED in 002_hypertable.sql: table "readings" is already a hypertable`. | You already ran the content of `002` yourself in psql or DBeaver, so `readings` is already a hypertable, but the record of migrations doesn't know it yet. | Record the migration as applied, in psql: `INSERT INTO schema_migrations (version) VALUES ('002_hypertable.sql');`. Then run `npm run migrate` again: its answer is now `0 new migration(s) applied, 2 applied earlier.` |
| When the content of `002` is run directly in psql: `ERROR:  LOCK TABLE can only be used in transaction blocks`. | `LOCK TABLE` only works inside a transaction, and psql runs every statement on its own. | Don't run migrations by hand. Use `npm run migrate`, which wraps every file in `BEGIN … COMMIT`. If the `create_hypertable` statement after it managed to succeed (`(1,t)`), `readings` is already a hypertable: fix it with the first row of this table. |
| `npm run migrate` answers `FAILED in 002_hypertable.sql: table "readings" is not empty` (in psql: `ERROR:  table "readings" is not empty`, with `HINT:  You can migrate data by specifying 'migrate_data => true' …`). | The `migrate_data => true` part is missing, even though `readings` already holds data. | Copy the content of `002_hypertable.sql` from Practice 2.1 again, then run `npm run migrate` again. A failed migration isn't recorded, so it's safe to repeat. |

The same "record it as applied" fix works for other migrations that you already ran by hand. For example, `FAILED in 004_retention.sql: retention policy already exists for hypertable "readings"` is fixed with `INSERT INTO schema_migrations (version) VALUES ('004_retention.sql');`. First make sure that its content really is in effect, for example by looking at the job list in Practice 6.3.

</details>

<details>
<summary><b>The summary book is empty, incomplete, or its numbers differ from the raw data</b></summary>

- **The test device only has 72 summary rows.** The clerk only summarizes the last three days. Run `CALL refresh_continuous_aggregate('readings_hourly', NULL, now() - INTERVAL '1 hour');` once, as in Practice 5.4, **as long as retention (Practice 6) hasn't been installed yet**. If retention has already done its work, see the next collapsible section.
- **`ERROR:  refresh window too small`**, with `DETAIL:  The refresh window must cover at least one bucket of data.` The window you asked for is shorter than one bucket (one hour). Check both time limits: the start of the window must be at least two hours before its end.
- **The summary numbers for old hours differ from the raw data.** Old raw data was changed after it had been summarized, for example because you emptied and refilled the practice data (Quick Win step 2) after Practice 5, on a different day. The clerk only summarizes the last three days again, so the older hours keep the old numbers. Summarize the last eight days again:

  ```sql
  CALL refresh_continuous_aggregate('readings_hourly', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');
  ```

  This window is safe because all of it is still inside the 90-day retention limit.
- **`docker logs smarthome-db` is full of lines like `LOG:  continuous aggregate refresh (individual invalidation) on "readings_hourly" in window [ … ]`.** That's the summary clerk's work log, and it's normal. If there's also `could not refresh continuous aggregate "readings_hourly" due to a concurrent refresh`, the clerk happened to work at the same time as your `CALL refresh_continuous_aggregate(…)`. Usually your command still succeeds, and the clerk tries again at its next scheduled time. If it's your command that fails with a similar message instead, just repeat it a few seconds later.

</details>

<details>
<summary><b>Old summaries disappeared after <code>refresh_continuous_aggregate</code> with a <code>NULL</code> start</b></summary>

This is the trap from Concept 7. If `CALL refresh_continuous_aggregate('readings_hourly', NULL, …)` is run **after** retention has done its work, TimescaleDB recomputes every hour from the raw data. For the hours older than 90 days, the raw data has already been dropped, so their summaries get deleted too. On the lab laptop, the test device's summaries went down from 2,881 to 2,176 rows, and only 16 of the 721 summaries older than 90 days were left.

**How to prevent it**: after Practice 6, never use `NULL` as the start of the window again. If you need to summarize again, use a start that's still within the 90 days, for example `now() - INTERVAL '8 days'`.

**If it has already happened**: those summaries can't be made again from the raw data, because the raw data no longer exists. For this module, the test device's missing summaries don't get in the way of the next practices, so you may carry on. The only way to get them back is a backup made **before** it happened, for example the one from Practice 7. Restore it into a new database as in Practice 7.4, then check its contents there. That's what backups are for.

</details>

<details>
<summary><b>Retention or the columnstore doesn't seem to work</b></summary>

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| After `npm run migrate`, the number of binders is still 121, or the size is still 152 MB. | The job hasn't had time to run yet. It usually only takes a few seconds. | Wait a moment, then check again. You can also run it right now with `CALL run_job(1001);` (retention) or `CALL run_job(1002);` (columnstore). The numbers are in the `job_id` column of the job list. |
| `CALL run_job(1001);` answers `CALL`, but nothing changes, and `total_runs` in `job_stats` stays the same. | The job already did its work by itself right after it was installed, so there's nothing left to drop. Besides, `run_job` runs in your own session and isn't recorded in `job_stats`. | Nothing needs fixing. |
| The oldest reading is more than 90 days old, even almost 92 days. | Retention drops **whole** binders, and its clerk only works once a day. A binder whose content is partly still younger than 90 days waits for its turn tomorrow. | Nothing needs fixing (Concept 7). |
| `FAILED in 005_columnstore.sql: columnstore policy already exists for hypertable or continuous aggregate "readings"`. | You already ran the content of `005` yourself in psql. | Record it as applied: `INSERT INTO schema_migrations (version) VALUES ('005_columnstore.sql');`. |

</details>

<details>
<summary><b>The backup or the restore goes wrong</b></summary>

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `pg_dump: error: could not open output file "C:/Users/<name>/AppData/Local/Temp/smarthome.dump": No such file or directory` | The terminal is **Git Bash**, which turns every argument that starts with `/tmp/…` into the Windows Temp folder before it reaches Docker. | Use a PowerShell terminal, or write two slashes: `//tmp/smarthome.dump`. The same goes for `pg_restore`, `psql -f`, and `rm` in Practice 7.6. |
| `pg_restore: error: input file does not appear to be a valid archive`, and the backup file is almost twice as large as 5 MB. | The backup was made with `>` in Windows PowerShell 5.1, which rewrites its content as UTF-16 text. | Make the backup again the Practice 7.3 way: `-f /tmp/…` and then `docker cp`. |
| `pg_restore: error: could not open input file "/tmp/restore.dump": No such file or directory` | The first step of Practice 7.4 (`docker cp` of the backup file into the container) was skipped or failed. | Repeat `docker cp backup/… smarthome-db:/tmp/restore.dump` with your file name. |
| `createdb: error: database creation failed: ERROR:  database "smarthome_restored" already exists` | It's left over from an earlier try. | Run `docker exec smarthome-db dropdb -U postgres smarthome_restored`, then repeat Practice 7.4 from `createdb`. |
| `ERROR:  extension "timescaledb" already exists` | `createdb` was run without `-T template0`, so the new database already brought TimescaleDB along from the default template. | Throw that database away with `dropdb`, then repeat Practice 7.4 from `createdb`. |

**Forgot `timescaledb_pre_restore()`.** `pg_restore` prints three errors, then ends with a warning:

```text
pg_restore: error: COPY failed for table "_hyper_1_100_chunk": ERROR:  could not find hypertable with id 1
DETAIL:  Assertion 'ht' failed.
CONTEXT:  COPY _hyper_1_100_chunk, line 1
pg_restore: error: could not execute query: ERROR:  ONLY option not supported on hypertable operations
Command was: ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_pkey PRIMARY KEY (device_id, ts);


pg_restore: error: could not execute query: ERROR:  ONLY option not supported on hypertable operations
Command was: ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(device_id);


pg_restore: warning: errors ignored on restore: 3
```

At first glance the result is almost right: the number of readings is short by **one** (the late reading from Practice 6.7, stored in the uncompressed part of its binder), and the fingerprint is different. The more dangerous part can't be seen from the row count: `\d readings` in that database only lists `readings_ts_idx`, without the primary key and without the foreign key, the two guards built in Module 17. Throw that copy away with `dropdb`, then repeat Practice 7.4 from `createdb`, this time complete.

**Forgot `timescaledb_post_restore()`.** There's no error at all, but the copy is still in "restore mode":

- `SHOW timescaledb.restoring;` answers `on`.
- `SELECT count(*) FROM readings;` only counts the readings in the binders that aren't compressed, for example **68,190**, not 785,394.
- Its jobs never run, and new readings written to this database disappear from view once `post_restore` is finally run.

The fix: run the sixth command of Practice 7.4 (`SELECT timescaledb_post_restore();`), then repeat the proof query. That's also the reason the backend must be stopped during a restore: don't let anything write to a database that's being restored.

**The TimescaleDB version must be the same.** The database you restore into must use the same TimescaleDB version as the source database (Concept 9). In this module both are in the same container, so that requirement is met automatically. When you restore to another computer or server, use exactly the same image, `timescale/timescaledb:2.30.2-pg17`.

</details>

<details>
<summary><b>Backend v0.3 answers <code>503</code>, <code>400</code>, or strange numbers</b></summary>

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `bucket=1h` and `bucket=1d` are answered with `503` `{"message":"the database can't be reached right now, try again shortly"}`, even though `/health` answers `"database":true` and `bucket=15m` answers `200`. The backend's log says `ERROR: history of f00d00000001 couldn't be read from the database: relation "readings_hourly" does not exist`. | This database doesn't have the summary book yet: migration `003` hasn't been run, or the backend is connected to a different database (check `DATABASE_URL` in `.env`). Backend v0.3 answers every database error with `503`, so it's the log that names the real cause. | Do Practice 5.2 and 5.4. |
| `400` with `range too long: at most 1000 buckets …`. | The range produces more than 1,000 buckets. | Make the range smaller, or use a wider bucket (`1h` or `1d`). |
| With `bucket=1d`, the `time` of every point ends in `T00:00:00Z` (07:00 WIB), not `T17:00:00Z`. | The days are counted in UTC: `'Asia/Jakarta'` is missing from the `1d` query. | Compare with the block in Practice 8.2. |
| With `bucket=1d`, `time` already ends in `T17:00:00Z`, but `from` ends in `T00:00:00Z`, and the first point may only hold readings from 07:00 WIB on. | `shift: 7 * HOUR` is missing from the `BUCKETS` dictionary, so the start of the range is rounded down to the start of a UTC day, not a WIB day. | Compare with the block in Practice 8.3. |
| Every answer holds `"count":0`. | The `device_id` has a typo, or the range holds no data. The practice data only covers the seven days before day H (plus day H up to the hour you filled it in), and the test data the 120 days before you loaded it. After retention in Practice 6, their raw readings, which are used without `bucket` and by `bucket=15m`, only cover the last 90 days. | Check the `device_id` and the dates. |

</details>

<details>
<summary><b>The laptop feels slow, or a lot of disk space is gone</b></summary>

- **Loading a million rows is very slow, or stops with `No space left on device`.** There isn't enough disk space. Free up space first (see 🚨 in Module 17, the disk space section). If the comparison table from Practice 4.6 is still there, throw it away with `DROP TABLE readings_plain;`.
- **The first query after loading the data is much slower than the example.** The database is still busy writing its change log. Wait a minute or two, then repeat.
- **The `smarthome-data` volume is now hundreds of MB, even though the hypertable is only 30 MB.** Most of its content is PostgreSQL's **change log** (the write-ahead log, WAL), which records every change before it's written to the table. After an `INSERT` of a million rows, that log grows, and PostgreSQL keeps some of its files to reuse them. On the lab laptop, the volume was about 780 MB at the end of the module. That's normal. Never delete the contents of PostgreSQL's data folder by hand.

</details>

<details>
<summary><b>The psql display is confusing</b></summary>

- **psql stops with `--More--`.** The answer is longer than the screen. Press **Space** for the next page, or **q** to stop (Module 17 Practice 3.8).
- **The `EXPLAIN` lines wrap around and are hard to read.** That's only the terminal being narrow. Enlarge VS Code's terminal panel with the **Maximize Panel Size** button (the ^ icon in the top-right corner of the panel), then run the query again.
- **Times show up with `+00`, not `+07`.** psql's session time zone is UTC. Type `SET TIME ZONE 'Asia/Jakarta';` to see them in WIB, and `RESET TIME ZONE;` to go back. The database's contents don't change; only the way psql writes the times does.
- **SQL is answered with a terminal error, for example `The term 'ts' is not recognized …` in PowerShell or `zsh: …` on macOS.** The query was typed in an ordinary terminal, not in psql. Go in first with `docker exec -it smarthome-db psql -U postgres -d smarthome`; the sign that you're in psql is the `smarthome=#` prompt at the start of the line.
- **`npm` or `git` was typed in psql, then nothing happens and the start of the line becomes `smarthome-#`.** To psql, that's the start of an SQL statement, so it waits for a semicolon. Type `\r` and press **Enter** to throw that line away (psql answers `Query buffer reset (cleared).`), then run the command in the first terminal.

</details>

## 🔬 Technical Deep Dive (optional)

This section is for the curious. Nothing here is required, and the next modules don't depend on it.

<details>
<summary><b>InfluxDB: another time-series database</b></summary>

TimescaleDB isn't the only database for time-series data. The best known one in the IoT world is **InfluxDB**. Its newest version, **InfluxDB 3 Core**, is open source (under the MIT or the Apache 2 license, your choice), is written in the Rust language, stores data in **Apache Parquet** files on disk or in cloud storage, and can be queried both with SQL and with its own language, InfluxQL. Data is sent in a compact text format called line protocol. The line below means "a reading from Node 1 `a4cf12e5b7c0` at 03:30:48 UTC on October 20, 2026, temperature 28.5, humidity 71". The long number at the end is its time in nanoseconds since 1970.

```text
readings,device_id=a4cf12e5b7c0 temperature=28.5,humidity=71 1792467048000000000
```

When should you choose which?

| | TimescaleDB (this module) | InfluxDB 3 Core |
| :--- | :--- | :--- |
| What it's built on | An add-on for PostgreSQL | A database of its own |
| Ordinary tables and relations (`devices`, `commands`, `users`) | In the same database, can be combined with `JOIN` | Not designed for that; needs a second database |
| Language | Full PostgreSQL SQL | SQL and InfluxQL |
| Backup | One `pg_dump` for everything | Separate from your relational database |
| Best suited for | Applications that mix sensor data with ordinary data | Pure metrics in very large amounts, especially recent data |

Mini Smart Home stores devices, commands, users, and rules next to the sensor readings. One PostgreSQL database with TimescaleDB keeps everything in one place, with one language and one backup. That's why this curriculum chose it. Claims about "which one is faster" depend heavily on the kind of data and on how it's tested, so don't simply trust comparison charts from the maker of one of the products.

</details>

<details>
<summary><b>Plain PostgreSQL partitioning: a handmade hypertable</b></summary>

PostgreSQL itself can cut a table up by time without TimescaleDB, with **declarative partitioning**:

```sql
CREATE TABLE sample_readings (device_id text NOT NULL, ts timestamptz NOT NULL, temperature double precision)
  PARTITION BY RANGE (ts);
CREATE TABLE sample_readings_2026_10_20 PARTITION OF sample_readings
  FOR VALUES FROM ('2026-10-20 00:00:00+00') TO ('2026-10-21 00:00:00+00');
```

It's similar to a hypertable, but there are three important differences and one similarity:

1. **Every partition is created by hand.** A reading for a date that doesn't have a partition yet is **refused**: an `INSERT` of a reading dated the 21st into the example table above is answered with `ERROR:  no partition of relation "sample_readings" found for row`. A hypertable creates new chunks by itself.
2. **A table that already holds data can't be turned into a partitioned table.** You have to create a new table and then move the data over, while `create_hypertable(…, migrate_data => true)` can do it directly.
3. **There are no automatic policies, summary books, or columnstore.** Dropping an old partition is indeed as fast as retention (`DROP TABLE` on one partition), but you have to schedule it yourself.
4. Partition pruning and the rule that "a unique key must include the time column" are exactly the same as with a hypertable.

Behind the scenes, TimescaleDB's chunks aren't declarative partitions but **child tables** of `readings`, made through table inheritance. That's why `\d readings` in Practice 2 prints `Number of child tables`.

</details>

<details>
<summary><b><code>time_bucket_gapfill</code>: charts without holes</b></summary>

If Node 1 is off for two hours, `time_bucket` produces no rows at all for those two hours. A chart that connects its points will draw a straight line across that hole, as if there were data. **`time_bucket_gapfill`** makes a row for **every** bucket in the range, including the empty ones, and **`locf`** (last observation carried forward) can fill the empty buckets with the last known value.

The test data stops at the minute you loaded it, so just treat the test device as "switched off" since then. Change the dates and times in both time limits below so that the range covers three hours before and two hours after the end of your test data. In this example, the data ends at 15:18 UTC on October 20. If you've forgotten when your test data ends, ask first with `SELECT max(ts) FROM readings WHERE device_id = 'beef00000001';`, which answers in UTC, like the query below. Then run:

```sql
SELECT time_bucket_gapfill('1 hour', ts) AS hour,
       round(avg(temperature)::numeric, 1) AS avg_temp,
       locf(round(avg(temperature)::numeric, 1)) AS temp_filled,
       count(*) AS count
FROM readings
WHERE device_id = 'beef00000001'
  AND ts >= '2026-10-20 12:00:00+00' AND ts < '2026-10-20 18:00:00+00'
GROUP BY hour
ORDER BY hour;
```

**Expected output** (on the lab laptop):

```text
          hour          | avg_temp | temp_filled | count 
------------------------+----------+-------------+-------
 2026-10-20 12:00:00+00 |     28.5 |        28.5 |   360
 2026-10-20 13:00:00+00 |     27.5 |        27.5 |   360
 2026-10-20 14:00:00+00 |     26.5 |        26.5 |   360
 2026-10-20 15:00:00+00 |     25.9 |        25.9 |   109
 2026-10-20 16:00:00+00 |          |        25.9 |      
 2026-10-20 17:00:00+00 |          |        25.9 |      
(6 rows)
```

With an ordinary `time_bucket`, the answer would only have four rows. Here, the 16:00 and 17:00 buckets still show up: `avg_temp` is empty (`NULL`), while `temp_filled` carries the last value, 25.9, forward. Which is more honest for a chart? Usually the empty column, so that the user sees that the device was off for a while. `locf` suits values that really do stay the same, for example the state of the pump.

One requirement: the time range must be **closed** in the `WHERE`. Without an end limit (`ts < …`), TimescaleDB doesn't know which bucket to stop at, and it refuses with `ERROR:  missing time_bucket_gapfill argument: could not infer finish from WHERE clause`.

</details>

<details>
<summary><b>Hierarchical summaries: a daily summary book on top of the hourly one</b></summary>

Backend v0.3 computes the daily averages every time `bucket=1d` is asked for, from 24 summary rows per day. That's already fast. If daily questions ever become very frequent, a summary book can be built **on top of another summary book** (a hierarchical continuous aggregate):

```sql
CREATE MATERIALIZED VIEW readings_daily
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 day', hour, 'Asia/Jakarta') AS day,
       device_id,
       sum(avg_temp * temp_n) / nullif(sum(temp_n), 0) AS avg_temp,
       min(min_temp) AS min_temp,
       max(max_temp) AS max_temp,
       sum(reading_count) AS reading_count
FROM readings_hourly
GROUP BY day, device_id
WITH NO DATA;
```

Notice the formula: the daily average is **not** written as `avg(avg_temp)`, because an average of averages is a trap (Practice 5.8). The `temp_n` column in the hourly summary book makes it possible to use the exact formula at the next level.

On the lab laptop, this summary book was tried out on a **copy** of the database, then filled in and queried like this:

```sql
CALL refresh_continuous_aggregate('readings_daily', NULL, now() - INTERVAL '1 day');
SET TIME ZONE 'Asia/Jakarta';
SELECT day, round(avg_temp::numeric, 1) AS avg_temp, min_temp, max_temp, reading_count
FROM readings_daily WHERE device_id = 'f00d00000001' ORDER BY day;
```

A `NULL` start is safe here, because the source is the hourly summary book, which retention doesn't touch. **Expected output:**

```text
          day           | avg_temp | min_temp | max_temp | reading_count 
------------------------+----------+----------+----------+---------------
 2026-10-13 00:00:00+07 |     26.2 |     21.8 |     30.6 |           144
 2026-10-14 00:00:00+07 |     25.6 |     21.1 |       30 |           144
 2026-10-15 00:00:00+07 |     26.5 |       22 |     30.8 |           144
 2026-10-16 00:00:00+07 |     27.1 |     22.6 |     31.6 |           144
 2026-10-17 00:00:00+07 |     26.7 |     22.3 |     31.1 |           144
 2026-10-18 00:00:00+07 |     25.8 |     21.4 |     30.2 |           144
 2026-10-19 00:00:00+07 |     26.3 |       22 |     30.6 |           144
 2026-10-20 00:00:00+07 |     26.1 |     21.6 |     30.5 |           134
(8 rows)
```

The seven full days are the same as in Module 17 Practice 4.5, this time from the second level of summaries. The last row is day H, which is only filled up to the hour the practice data was filled in. If you want to try it, do it on a copy, not on the main database. The second summary book also needs a clerk of its own (`add_continuous_aggregate_policy`) to stay up to date, and the copy can be thrown away again when you're done. You already threw away the copy from Practice 7 in 7.6, so make it again with the six commands of 7.4 (the file in the `backup` folder is still there), then go in with `docker exec -it smarthome-db psql -U postgres -d smarthome_restored` and run both SQL boxes above. When you're done, leave with `\q`, throw the copy away with `dropdb` as in 7.6, then delete its temporary file with `docker exec smarthome-db rm /tmp/restore.dump`. This time `/tmp/smarthome.dump` no longer exists, so it doesn't need deleting.

</details>

<details>
<summary><b>Thinning points for charts: from buckets to LTTB</b></summary>

A month of Node 1 readings holds about 259 thousand points, while a chart on a phone screen is only a few hundred pixels wide. Thinning out those points is called **downsampling**. There are two approaches:

1. **Time buckets**, like backend v0.3: one point per hour or per day. Simple and fast, but averages can hide a brief spike. That's why every summary point also carries `min_temp` and `max_temp`: a chart can draw a lowest–highest band around the average line, so that spikes don't get lost.
2. **LTTB** (Largest-Triangle-Three-Buckets): an algorithm that picks the **original** points that best keep the shape of the chart, for example 500 out of 259 thousand. TimescaleDB provides it as the `lttb(…)` function in the extra package **TimescaleDB Toolkit**. That package isn't in the light image this module uses, but it is in the much larger `timescale/timescaledb-ha` image. The algorithm is also short enough to write yourself in TypeScript, in the backend or directly in the dashboard.

The Phase 4 dashboard will use the first approach, because its API is ready from this module on.

</details>

<details>
<summary><b>DBeaver and TimescaleDB</b></summary>

The **PostgreSQL** connection `smarthome` from Module 17 is enough for every query in this module: its SQL editor is just the same. DBeaver also has a special connection type named **TimescaleDB** (search for "TimescaleDB" in the **Connect to a database** window). According to DBeaver's source code, the difference is mainly in the statistics panel: a TimescaleDB-type connection computes the size of a hypertable from all its chunks, while an ordinary PostgreSQL connection may show a very small size for `readings`, because its content is in the child tables. The surest way to find out its size is still SQL:

```sql
SELECT pg_size_pretty(hypertable_size('readings'));
```

A few interesting places in the **Database Navigator** tree:

- The **`_timescaledb_internal`** schema holds all the chunks (`_hyper_1_…_chunk`), the stored summary book (`_materialized_hypertable_2`), and the compressed counterpart of every chunk that has been compressed (`…_compressed`).
- `readings_hourly` shows up as a view in the `public` schema.
- The `timescaledb_information`, `_timescaledb_catalog`, and `_timescaledb_functions` schemas belong to TimescaleDB. Looking is fine; changing is not.

</details>

## 🧩 Independent Challenges

Level 1 can be done in psql or DBeaver alone. Levels 2 and 3 change the backend's code and the database, so do them **after** ➕ B (once the `feature/timescaledb` branch has been merged), on a new branch from `main`, as in Modules 16–17: `git switch main`, `git pull`, then `git switch -c feature/<challenge-name>`. Levels 1 and 2 have answer keys; the complete content of both Level 2 key files is in [`code/challenges/key/`](code/challenges/key/).

### Level 1 — Morning, midday, afternoon, and night on the porch (a small change)

The first query in Practice 5.8 computes the test device's **daily** averages from the summary book. Change that query so that it answers: **the average, lowest, and highest temperature per 6 hours on the porch** (`f00d00000002`) on day H-1, with buckets that start at 00:00, 06:00, 12:00, and 18:00 WIB. What needs to change: the bucket width, the device, the date range, and the columns shown (add `min(min_temp)` and `max(max_temp)`).

<details>
<summary><b>Level 1 answer key</b></summary>

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT time_bucket('6 hours', hour, 'Asia/Jakarta') AS six_hours,
       round((sum(avg_temp * temp_n) / sum(temp_n))::numeric, 1) AS avg_temp,
       min(min_temp) AS min_temp,
       max(max_temp) AS max_temp,
       sum(reading_count) AS count
FROM readings_hourly
WHERE device_id = 'f00d00000002'
  AND hour >= '2026-10-19 00:00:00+07' AND hour < '2026-10-20 00:00:00+07'
GROUP BY six_hours
ORDER BY six_hours;
RESET TIME ZONE;
```

**Expected output** (your date follows H-1; the numbers are the same):

```text
       six_hours        | avg_temp | min_temp | max_temp | count 
------------------------+----------+----------+----------+-------
 2026-10-19 00:00:00+07 |     24.2 |     23.4 |       25 |    36
 2026-10-19 06:00:00+07 |     27.8 |       25 |     30.6 |    36
 2026-10-19 12:00:00+07 |     31.3 |     30.7 |     32.1 |    36
 2026-10-19 18:00:00+07 |     27.9 |     24.8 |     30.7 |    36
(4 rows)
```

- The average still uses the `avg × n` formula (Practice 5.8), while the lowest and highest are simply `min` and `max` of the hourly values: the lowest of all the hours is the lowest of those six hours.
- Midday (12:00–18:00) is the hottest, and the porch is about 1.5 degrees hotter than the living room.
- Try removing `'Asia/Jakarta'` from `time_bucket`. The buckets now start at **01:00, 07:00, 13:00, and 19:00** WIB, because 6-hour buckets are counted from midnight UTC, and 7 hours isn't a multiple of 6. For 15-minute and 1-hour buckets, the time zone makes no difference, but for 6-hour buckets, as for daily buckets, the time zone matters.

</details>

### Level 2 — 6-hour buckets through the API (fill in the blanks)

Add the choice **`bucket=6h`** to the history API, with 6-hour WIB buckets as in Level 1. Fill in every `____` below.

In **`src/db/archive.ts`**, change the `Bucket` type:

```ts
export type Bucket = "15m" | "1h" | "____" | "1d";
```

Then, inside `SUMMARY_QUERIES`, between the `"1h"` query and the comment `// per WIB day: …`, add a fourth query:

```ts
  // per 6 WIB hours (Challenge Level 2): the hourly summaries combined per 6 hours with the same formula as 1d,
  // so the buckets start at 00:00, 06:00, 12:00, and 18:00 WIB
  "6h": `SELECT time_bucket('____', hour, '____') AS time,
           round((sum(avg_temp * ____) / nullif(sum(temp_n), 0))::numeric, 1)::float8  AS avg_temp,
           min(min_temp)                                                                 AS min_temp,
           max(max_temp)                                                                 AS max_temp,
           round(sum(avg_humidity * humidity_n) / nullif(sum(humidity_n), 0), 1)::float8 AS avg_humidity,
           round(sum(avg_soil * soil_n) / nullif(sum(soil_n), 0), 1)::float8             AS avg_soil,
           round(sum(avg_light * light_n) / nullif(sum(light_n), 0), 1)::float8          AS avg_light,
           sum(reading_count)::int                                                       AS reading_count
         FROM ____
         WHERE device_id = $1 AND hour >= $2 AND hour < $3
         GROUP BY time
         ORDER BY time`,
```

In **`src/routes/devices.ts`**, add this line to the `BUCKETS` dictionary, between `"1h"` and `"1d"`:

```ts
  "6h": { width: ____ * HOUR, defaultSpan: 7 * DAY, shift: ____ * HOUR }, // 00:00, 06:00, 12:00, 18:00 WIB (Challenge Level 2)
```

After that, update the Zod choices:

```ts
const BucketParam = z.enum(["15m", "1h", "____", "1d"]);
```

If you want it tidy, also update the `bucket` description and the "range too long" message so that they mention `6h` (see the key files). Test with `npm run check`, then open this in the browser (with your H-1 and H dates):

```text
http://127.0.0.1:8080/devices/f00d00000002/readings?bucket=6h&from=2026-10-19T00:00:00%2B07:00&to=2026-10-20T00:00:00%2B07:00
```

The **expected output** holds four points, with the `time` values `2026-10-18T17:00:00Z`, `2026-10-18T23:00:00Z`, `2026-10-19T05:00:00Z`, and `2026-10-19T11:00:00Z`, and the `avg_temp` values `24.2`, `27.8`, `31.3`, and `27.9`: exactly the same as the Level 1 answer. Also try `?bucket=5m`: its `400` message now mentions `"15m"|"1h"|"6h"|"1d"`.

<details>
<summary><b>Level 2 answer key</b></summary>

- In the type and in Zod: `"6h"`. The order is up to you, but the order in `z.enum` sets the order of the choices in the `400` message and in the `/docs` dropdown.
- In the SQL: `time_bucket('6 hours', hour, 'Asia/Jakarta')`, `sum(avg_temp * temp_n)`, and `FROM readings_hourly`. The time zone is required, because 6-hour buckets without a zone start at 01:00, 07:00, 13:00, and 19:00 WIB (Level 1). The source is the hourly summary book, as for `1d`, so this query stays fast even for ranges of many months.
- In the dictionary: `width: 6 * HOUR` and `shift: 7 * HOUR`. The shift is the same as for `1d`: move forward 7 hours to WIB, round down to a multiple of 6 hours, then move back 7 hours again (🔁 step 4). As a result, `from=…T10:20:00+07:00` is rounded down to 06:00 WIB.
- `Record<Bucket, string>` protects you: if `"6h"` has been added to the `Bucket` type but its query hasn't, `npm run check` prints `error TS2741: Property '"6h"' is missing in type …`. If `"6h"` is added to `z.enum` but you forget to add it to the `BUCKETS` dictionary, `npm run check` complains too, in `computeRange`.

The complete content of both files: [`archive.ts`](code/challenges/key/backend/src/db/archive.ts) and [`devices.ts`](code/challenges/key/backend/src/routes/devices.ts).

</details>

### Level 3 — `device_health` is time-series data too (from scratch)

The **`device_health`** table stores every device's `vitals` (signal strength, uptime, free memory) every few minutes. That's a diary too. Create a new migration **`006_device_health.sql`** that:

1. turns `device_health` into a hypertable with **7-day** chunks (`vitals` data is much rarer than `telemetry`, so weekly binders are small enough), and
2. automatically drops `vitals` older than **30 days**.

Hints:

- Follow the example of `002_hypertable.sql` and `004_retention.sql`. `device_health` also has a foreign key to `devices`, so lock the `devices` table first with `LOCK TABLE`, as in `002`.
- The table may already hold `vitals` from Module 17, so don't forget `migrate_data => true`.
- Its primary key, `(device_id, ts)`, already includes the time column, so the requirement of Concept 2 is met.
- Run it with `npm run migrate`.

**Check your answer yourself.** In psql:

- `SELECT hypertable_name FROM timescaledb_information.hypertables ORDER BY 1;` must answer two rows: `device_health` and `readings`.
- The job list (`SELECT job_id, application_name, schedule_interval, hypertable_name FROM timescaledb_information.jobs WHERE job_id >= 1000 ORDER BY job_id;`) must hold a new row, `Retention Policy [1003]`, for `device_health`, with the schedule `1 day`. The number may be bigger if you've ever created other jobs.
- `\d device_health` must list a new index, `device_health_ts_idx`, just like `readings_ts_idx` in Practice 2.

This level has no answer key; those three checks are the key.

## ➕ Add-on to "Mini Smart Home"

This week, Mini Smart Home gets **a history that's ready to grow** and **backend v0.3**. The `readings` table is now filed into daily binders, the hourly summary book updates itself, raw readings are dropped after 90 days and compressed after 7 days, the backup is proven to be restorable, and the history API can answer per 15 minutes, per hour, or per WIB day. The data contract stays at version 1.2, because the shape of the MQTT messages doesn't change.

![Project diagram of Mini Smart Home after Module 18: the history is now ready to grow for years; a dashed line means optional, retired, or coming later. Top, from the left: Node 2 "Garden" v1.0.0 with its 18650 battery, unchanged, sends ESP-NOW to Node 1 "Home" v1.4.0 (sensors, relays, the Node 2 bridge, the RS-485 sensor), also unchanged. Node 1 sends MQTT to the Raspberry Pi gateway at 192.168.1.37, which holds Mosquitto, the MQTT broker, and Node-RED with the dashboard, the Garden card, and the RS-485 Sensor group; the fan automation line is struck through, faded, and dashed, with the label retired since Module 16. Node-RED keeps serving the dashboard on the phone. Middle left, the dashed simulator (optional) box: 10 fake devices on the laptop, f00d00000001 to f00d00000010, standing in for real devices, connected to Mosquitto through a dashed MQTT line. Below it, an honest note: the database and backups are on the laptop, and the repository only keeps the migrations and the test-data recipe, not the data. Middle, the green Laptop box, the backend at 127.0.0.1:8080, holding backend v0.3: Fastify + light TypeScript, subscribing to msh/#, data contract 1.2 as Zod schemas, the in-memory notice board, the database archive, and version 0.3.0 in /docs, plus the API, the same as v0.2 plus bucket: GET /health, GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, GET /devices/:id/readings with ?bucket=15m|1h|1d (new), POST /devices/:id/command, and GET /docs. A green msh/# arrow goes down from the gateway to the backend, and a cmd arrow goes up from the backend to the gateway. Below the backend, a two-way pg (pool) line leads to the blue Docker Desktop box: the smarthome-db container, PostgreSQL 17 + TimescaleDB 2.30.2, the smarthome-data volume, counter 127.0.0.1:5432, with readings = hypertable, daily binders (new), the summary book readings_hourly (new), clerks for the summary every 30 minutes, 90-day retention, and the columnstore after 7 days (new), and the other tables, unchanged: devices, device_health, commands, users, and rules. On the right, four guests: Bruno with the new request Node 1 hourly history and the browser for opening /docs, both over HTTP to the backend; DBeaver via counter 5432 and psql via docker exec, both to the database. Below them, the backup/ (new) folder card, the pg_dump files, kept out of Git, with an arrow from Docker Desktop. Bottom, GitHub mini-smart-home: backend/migrations/002_hypertable.sql to 005_columnstore.sql new, backend/src/ plus ?bucket, backend/test/load-1-million.sql new, backend/README.md v0.3, DATA-CONTRACT.md still 1.2, backend/bruno/Node 1 hourly history.yml new, backend/.gitignore plus backup/, and firmware/ unchanged. Bottom right, the dashed coming-next boxes: Module 19 realtime, automation rules, and Telegram notifications; Module 20 login and roles; and Modules 22–23 React dashboard with charts from ?bucket.](assets/project-diagram-module-18.png)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder and its terminal) and a **browser** that's already signed in to GitHub.
>
> ⭐ **Required** — step B merges all the Module 18 work into `main`, and Module 19 starts from there.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `backend/migrations/002_hypertable.sql` | **new**: `readings` becomes a hypertable (Practice 2) |
| `backend/test/load-1-million.sql` | **new**: the recipe for a million rows of test data (Practice 4) |
| `backend/migrations/003_hourly_summary.sql` | **new**: the hourly summary book with its clerk (Practice 5) |
| `backend/migrations/004_retention.sql`, `005_columnstore.sql` | **new**: 90-day retention and the columnstore after 7 days (Practice 6) |
| `backend/.gitignore` | the `backup/` folder stays out of Git (Practice 7) |
| `backend/src/db/archive.ts`, `src/routes/devices.ts`, `src/server.ts` | history per bucket (`bucket`), the description and version 0.3.0 in `/docs` (Practice 8) |
| `backend/package.json`, `package-lock.json` | version 0.3.0 and a new description, no new packages (Practice 8) |
| `backend/bruno/Node 1 hourly history.yml` | **new** (Practice 8) |
| `backend/README.md` | how to run backend v0.3, including backup and restore (step A) |

### A. Update `backend/README.md`

A teammate who clones your repository now needs one extra step after the migrations (summarizing the history once), and everyone needs to know how to make and restore a backup. Replace the content of `backend/README.md` with:

````markdown
# Mini Smart Home Backend

Backend v0.3 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.2 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database with the TimescaleDB add-on (through Docker), and provides a documented API. The reading history can be requested raw or already summarized per 15 minutes, per hour, or per day.

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
7. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts |
| `npm run check` | checks the TypeScript types (run it before every commit) |
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
| `POST /devices/:id/command` | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table |

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

## Limits of v0.3

- `GET /devices`, `latest`, and `vitals` are still read from memory, so they are empty again after every server restart. The reading history and the commands are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- Raw readings are only kept for 90 days; for older times, only their hourly summaries remain.
- The days of the `1d` summary are WIB days (`Asia/Jakarta`), also for devices in WITA or WIT.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API has no login yet.
````

Then save it to the `feature/timescaledb` branch. In the second terminal (the `backend` folder):

```text
git add README.md
git commit -m "Backend README v0.3 (Module 18)"
git push
```

### B. ⭐ Merge `feature/timescaledb` into `main` through a pull request

All the commits of Practices 2–8 and step A are on the `feature/timescaledb` branch. It's time to review them and merge them, exactly as in Module 17 ➕ B:

1. **Open a pull request.** In the `mini-smart-home` repository on GitHub, click **Compare & pull request** on the yellow banner of the `feature/timescaledb` branch. If the banner is already gone, open the **Pull requests** tab → **New pull request**, then choose **base: `main`** ← **compare: `feature/timescaledb`**. Under **What changed?**, write, for example: `Backend v0.3: readings becomes a hypertable, an automatic hourly summary, 90-day retention, columnstore, backup and restore, and a history API per bucket (?bucket=15m|1h|1d).` Click **Create pull request**.
2. **Review with the checklist.** In the **Files changed** tab, make sure that the four new migrations (`002` to `005`) and `test/load-1-million.sql` are included. Also make sure that there's **no** `.env` file, `backup/` folder, or file ending in `.dump`: a backup file holds the whole database and must not go into Git. Then tick the checklist in the **Conversation** tab according to what really happened. The `DATA-CONTRACT.md` item may be ticked: the shape of the MQTT messages doesn't change. Send a summary through **Review changes** → **Comment** → **Submit review**.
3. **Merge.** Choose **Create a merge commit**, click **Merge pull request** → **Confirm merge**, then **Delete branch**.
4. **Back to `main` on the laptop.** In the second terminal:

   ```text
   git switch main
   git pull --prune
   git branch -d feature/timescaledb
   ```

The database isn't affected by this branch switch. Migrations `002`–`005` are already recorded in `schema_migrations`, so `npm run migrate` on `main` answers `0 new migration(s) applied, 5 applied earlier.`

### C. Save your learning notes

The numbers you measured yourself in this module are the best proof that you understand it. Open the **`learn-iot`** repository in a new VS Code window (**File → New Window**, then **File → Open Folder…**), create the file **`module-18/notes.md`** next to `warmup.js` from 🔁, then fill it in with the numbers from your own screen:

```markdown
# Module 18 notes — TimescaleDB

| What I measured | My numbers |
| :--- | :--- |
| The pass query, Practice 4.4 (`Time`) | … ms |
| `Execution Time` plain table / hypertable / summary book (Practices 4.6, 4.5, 5.6) | … / … / … ms |
| Hypertable size: before retention / after retention / after columnstore (Practice 6) | … / … / … MB |
| Summaries older than 90 days: before / after retention | … / … |
| Fingerprint of the original and of the copy (Practices 7.2 and 7.5) | … |

What surprised me most: …
```

Commit and push in the **`learn-iot`** repository, with GitHub Desktop or the terminal.

### D. Clean up the test device (optional)

The test device `beef00000001` doesn't get in the way of anything, and retention will drop its raw readings bit by bit over the next 90 days. If you want a tidy database now, do this step **after** 🧩. In psql:

```sql
DELETE FROM readings WHERE device_id = 'beef00000001';
DELETE FROM devices WHERE device_id = 'beef00000001';
CALL refresh_continuous_aggregate('readings_hourly', now() - INTERVAL '90 days', now() - INTERVAL '1 hour');
SELECT device_id, count(*), min(hour), max(hour) FROM readings_hourly GROUP BY 1 ORDER BY 1;
```

**Expected output** (example):

```text
DELETE 783110
DELETE 1
CALL
  device_id   | count |          min           |          max           
--------------+-------+------------------------+------------------------
 beef00000001 |   721 | 2026-06-22 15:00:00+00 | 2026-07-22 15:00:00+00
 f00d00000001 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000002 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
(3 rows)
```

- The raw readings are deleted first, and only then the device; the other order is refused by the foreign key (Module 17 Practice 6.4). `DELETE` also works on binders that are already compressed.
- The summary book isn't cleared along with the `DELETE`. `CALL refresh_continuous_aggregate(…)` with a 90-day window summarizes those hours again from the raw data, which is now empty, so their summaries disappear.
- The test device's summaries that are **older than 90 days** (721 rows in the example) are still there, exactly as Concept 7 planned: summaries survive even when their raw data is gone. Just leave them; they're tiny compared with the raw readings you just deleted. Don't use a `NULL` start to delete them (🚨).

The test data can be loaded again at any time with the two commands in Practice 4.2. After that, summarize again with a 90-day window as above (not `NULL`), because the summary clerk only looks back three days. Readings older than 90 days will be dropped again by retention on its next round.

**Evidence for passing Module 18** (compare it with ✅ below): the pass query under one second from a million rows (Practice 4.4), the fingerprints of the original database and of the copy being exactly the same (Practice 7.5), and the merged `feature/timescaledb` pull request.

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Time-series data** | Data in which every row is marked with a time and which keeps growing, for example sensor readings. It's rarely changed, and it's usually queried per time range. A "diary", not a "phone book". |
| **TimescaleDB** | An add-on (extension) for PostgreSQL that takes care of time-series data: hypertables, `time_bucket`, automatic summary books, retention, and the columnstore. This module uses version 2.30.2, Community edition. |
| **Tiger Data** | The new name of the company that makes TimescaleDB (formerly called Timescale). Its documentation is at `tigerdata.com/docs`. |
| **Extension** (add-on) | A package that adds abilities to PostgreSQL without replacing the database. `\dx` in psql shows the list. |
| **Hypertable** | A table that's automatically filed into binders by time. From the outside, it's still one table (`readings`); inside, it's split into many chunks. Created with `create_hypertable`. |
| **Chunk** (piece, binder) | A small table inside a hypertable that holds one time range; in this module, one day, starting at 00:00 UTC (07:00 WIB). It lives in the `_timescaledb_internal` schema. |
| **`time_bucket`** (time bucket) | The TimescaleDB function that turns every `ts` into the start of its bucket, for example per 15 minutes, per hour, or per day. The third argument, `'Asia/Jakarta'`, makes daily buckets (and 6-hour buckets) follow the WIB day. |
| **Continuous aggregate** (the "summary book", CAGG) | A summary in the form of a view whose results are stored and updated bit by bit by TimescaleDB, for example `readings_hourly`. |
| **Real-time summary** | The `materialized_only = false` setting: the hours after the last summarized hour are computed directly from the raw data when you ask, so the newest hours always show up too. |
| **Refresh** (summarizing again) | Recomputing the summary book for one time window, with `CALL refresh_continuous_aggregate(…)` or by the scheduled clerk. A `NULL` window start means "from the oldest data"; don't use it again once retention has done its work. |
| **Average of averages** | The trap of computing a combined average from several averages that don't contain the same number of values. The right formula: the sum of (`avg × n`) divided by the sum of `n`. That's why the summary book stores `temp_n`. |
| **Job** (scheduled task) | Work that TimescaleDB's background scheduler runs on its own schedule. The jobs you create are numbered from 1000; their list is in `timescaledb_information.jobs`. |
| **Policy** | A rule that you install and that a job then carries out: refreshing summaries (`add_continuous_aggregate_policy`), retention (`add_retention_policy`), and the columnstore (`add_columnstore_policy`). It starts working as soon as it's installed. |
| **Retention** | Dropping raw data older than a set limit (90 days in this module) one whole chunk at a time, not with a row-by-row `DELETE`. The summary book isn't dropped along with it. |
| **Columnstore** | A way of storing old chunks column by column (not row by row), so that they're much more compact (in this module, 152 MB became 30 MB). Its old name is compression. |
| **`segmentby`** and **`orderby`** | Columnstore settings: group per device (`device_id`), then sort by time (`ts DESC`) inside every group. |
| **`EXPLAIN (ANALYZE)`** | A command that runs a query and then describes its plan: its steps, the indexes it used, and how long it really took (`Execution Time`). |
| **`Seq Scan`** and **`Index Scan`** | Two ways of reading a table: from start to end (`Seq Scan`), or jumping through an index straight to the rows you're looking for (`Index Scan`). |
| **Chunk pruning** (chunk exclusion) | A hypertable's ability to skip the chunks whose time range doesn't match the `WHERE`, before the query runs. In Practice 4, 113 of the 121 chunks were pruned. |
| **`\timing`** | The psql command that switches on (`on`) or off (`off`) the note of how long every command takes, `Time: … ms`. |
| **Dead tuples** and **autovacuum** | The "dead" rows that `DELETE` and `UPDATE` leave behind, and PostgreSQL's cleaner that clears them away later. |
| **WAL** (write-ahead log) | The change log that PostgreSQL writes before changing a table, so that the data survives a power cut. It grows after many `INSERT` commands. |
| **`generate_series`** | A PostgreSQL function that makes a series of numbers or times, for example one row every 10 seconds for 120 days. |
| **`setseed`** | Sets the seed of the `random()` "dice", so that the sequence of random numbers after it is always the same. |
| **`docker cp`** | Copies a file from the laptop into a container, or the other way around. |
| **Backup** and **restore** | A backup is a photocopy of the whole database in one file; a restore builds a new database from that file. A backup that has never been restored is the same as having no backup. |
| **`pg_dump`** and **`pg_restore`** | The programs that come with PostgreSQL for making a backup (`-Fc`: the packed, compressed custom format) and for restoring it. In this module, they run inside the container. |
| **`timescaledb_pre_restore()`** and **`timescaledb_post_restore()`** | The two functions around `pg_restore` for a TimescaleDB database: they stop the background workers and prepare the catalog, then switch everything back on. |
| **`template0`** | A completely blank database template. Used by `createdb -T template0` for the database you restore into. |
| **Fingerprint** (`md5`) | A 32-character summary of a text. If even one character changes, the fingerprint changes completely. Used to prove that two databases hold exactly the same data. |
| **`bucket`** | The new parameter of API v0.3 (`?bucket=15m`, `1h`, or `1d`) that asks for the history summarized per bucket. Without `bucket`, the API answers with raw readings, as in Module 17. |
| **Enum** (`z.enum`) | A fixed list of choices. Zod refuses values outside the list with `400` before they reach the database. |
| **`Record<Key, Value>`** | A TypeScript type for an object whose keys are fixed, for example `Record<Bucket, string>`: it must have exactly one text entry for every kind of bucket. |
| **`UNION ALL`** | Stacks the results of several `SELECT` statements into one table. |
| **Downsampling** | Thinning out data points for a chart, for example with time buckets or the LTTB algorithm (🔬). |

## 📝 5-Question Quiz

1. In Practice 4, the plan of the query "the hourly average over the last 7 days" on the hypertable only includes 8 of the 121 chunks. Why aren't the other chunks opened? And why does a plain table with the same index turn out to be almost as fast for that query, and where does the hypertable's real advantage lie?
2. The 10:00 hour holds 360 readings with an average temperature of 30.0 °C. The 11:00 hour only holds 60 readings so far, with an average of 26.0 °C. What is the right average temperature for the two hours together? What do you get if you compute it as an "average of averages"? Which column in the summary book makes it possible to compute the right answer?
3. A month after 90-day retention was installed, your friend runs `CALL refresh_continuous_aggregate('readings_hourly', NULL, now() - INTERVAL '1 hour');` "to keep the summaries fresh". What happens? What kind of window is safe?
4. Your friend makes a backup every night in Windows PowerShell 5.1 with `docker exec smarthome-db pg_dump -U postgres -d smarthome -Fc > backup.dump`, and has never tried to restore it. What's wrong with doing it that way, and how do you prove that a backup really can be used?
5. Someone suggests that backend v0.3 should glue the `bucket` text straight into the SQL (for example `` `SELECT time_bucket('${req.query.bucket}', ts) …` ``) so that it can accept any bucket at all. Why is that suggestion dangerous? What does backend v0.3 do instead, and what does it answer to `?bucket=1H`?

<details>
<summary><b>Answer key</b></summary>

1. Every chunk keeps its own time range, so TimescaleDB knows that a chunk whose whole content is older than seven days can't possibly hold the answer. Those chunks are skipped before the query runs (chunk pruning, Concept 4). The plain table is almost as fast because the primary key `(device_id, ts)` is also an index that can jump straight to the device and the time range you're looking for: for this query, the index is what matters most. The hypertable's real advantage lies elsewhere: the summary book that answers in less than 1 ms (Practice 5), retention that drops whole binders in an instant and shrinks the size right away, and the columnstore that compresses old data (Practice 6).
2. The right average: (360 × 30.0 + 60 × 26.0) ÷ (360 + 60) = 12,360 ÷ 420 ≈ **29.4 °C**. The "average of averages": (30.0 + 26.0) ÷ 2 = **28.0 °C**, too low, because the hour with only 60 readings gets the same weight as the hour with 360. The **`temp_n`** column (the number of temperature values per hour) makes it possible to compute the `avg × n` formula from the summary book (Concept 5, Practice 5.8).
3. For the hours older than 90 days, retention has already dropped the raw data. A refresh with a `NULL` start recomputes **every** hour from the raw data, so the summaries of those old hours get **deleted** too, and they can't be made again, except from a backup (Concept 7, 🚨). A safe window lies entirely inside the retention period, for example from `now() - INTERVAL '8 days'` to `now() - INTERVAL '1 hour'`. The summary clerk itself is already safe, because it only looks back three days.
4. In Windows PowerShell 5.1, the `>` sign rewrites the file's content as UTF-16 text, so the file becomes almost twice as large and corrupted: `pg_restore` refuses it with `input file does not appear to be a valid archive`. Because it was never tried, that damage only comes to light when the backup is needed. Make the backup with `-f /tmp/…` inside the container and then `docker cp`, and prove it regularly: restore it into a new database (`createdb -T template0`, `CREATE EXTENSION timescaledb`, `timescaledb_pre_restore()`, `pg_restore`, `timescaledb_post_restore()`), then compare the number of rows, the `md5` fingerprint, the summary book, the binders, and the jobs with the original database (Practice 7).
5. Gluing text from outside into SQL opens the door to SQL injection (Module 17 Concept 10): anyone could slip SQL commands in through the API's address. A bucket that's too small could also force the database to make millions of buckets. Backend v0.3 only accepts three fixed values through `z.enum(["15m", "1h", "1d"])`, uses them as dictionary keys to pick one of three fixed SQL queries, and sends the `device_id` and the time range as the parameters `$1`, `$2`, `$3`. On top of that, a request that would produce more than 1,000 buckets is refused. `?bucket=1H` is answered with **`400`** and `querystring/bucket Invalid option: expected one of "15m"|"1h"|"1d"`, because capital letters are different from lowercase ones (Concept 10, Practice 8.6).

</details>

---

## ✅ Module 18 Completion Checklist

The completion requirement from the Syllabus: **the query "hourly average over the last 7 days" over 1 million rows finishes in less than 1 second, and a backup-restore produces identical data.** **The simulator path** (no Node 1 and Node 2 yet): every item may be ticked with the practice data, the test data, and the Module 16 simulator.

- [ ] The JavaScript warm-up is done, and I've checked my "Test yourself" answers against their key (🔁).
- [ ] `\dx` shows TimescaleDB 2.30.2, and I've summarized readings per 15 minutes with `time_bucket` (Quick Win).
- [ ] This week's work is on the `feature/timescaledb` branch (Practice 1).
- [ ] ⭐ `readings` became a hypertable through migration `002`, and I can show its chunks in psql (Practice 2).
- [ ] I can explain why 15-minute and 1-hour buckets don't need a time zone, while daily buckets need `'Asia/Jakarta'` (Practice 3).
- [ ] ⭐ A million rows of test data are loaded, and the query for the **hourly average over the last 7 days** finishes well under 1 second; I can also read its plan with `EXPLAIN (ANALYZE)` and compare it fairly with a plain table (Practice 4).
- [ ] ⭐ The summary book `readings_hourly` holds the whole history, answers the same query in about 1 ms, and the daily averages from the `avg × n` formula are exactly the same as from the raw data (Practice 5).
- [ ] 90-day retention and the columnstore are installed, the summaries older than 90 days are still intact, and the hypertable's size has gone down a lot (Practice 6).
- [ ] ⭐ My backup is proven to be restorable: the copy has exactly the same number of readings, fingerprint, summary book, binders, and jobs as the original (Practice 7).
- [ ] ⭐ API v0.3 answers `bucket=15m`, `1h`, and `1d`, refuses other values with `400`, and the tests of the Bruno request `Node 1 hourly history` pass (Practice 8).
- [ ] `backend/README.md` is updated for v0.3 (➕ A).
- [ ] ⭐ All the Module 18 work is on `main` of the `mini-smart-home` repository, through a pull request, without `.env` and without backup files (➕ B).

🎉 **Mini Smart Home's history is now ready to grow for years.** Queries over a million rows are answered in milliseconds, the summaries update themselves, old data is dropped and compressed without being told, and you've proven that its backup can be restored. The data is tidy in the archive. The next step: making the backend react to that data right away.

> ➡️ **Next module:** Module 19 — Realtime, Two-Way Control, Automation Rules (Cloud & Local), & Notifications. Data flows to the browser without a refresh, rules like "if the temperature is above 30 °C for 2 minutes, turn on the fan" can be set without changing code, Node 1 keeps running its own safety rules when the server can't be reached, and Telegram sends an alert when something's wrong.

---

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- TimescaleDB 2.30.2 (the Tiger Data documentation): [understanding hypertables](https://www.tigerdata.com/docs/learn/hypertables/understand-hypertables), [chunks](https://www.tigerdata.com/docs/learn/chunks/understanding-chunks) and [their size](https://www.tigerdata.com/docs/learn/hypertables/sizing-hypertable-chunks), [`create_hypertable`](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/create_hypertable), [`show_chunks`](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/show_chunks), [`hypertable_size`](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/hypertable_size), [hypertable indexes](https://www.tigerdata.com/docs/learn/hypertables/hypertable-indexes), [primary keys and the time column](https://www.tigerdata.com/docs/learn/data-model/primary-keys-time-and-uniqueness), [time buckets](https://www.tigerdata.com/docs/learn/data-lifecycle/time-buckets/about-time-buckets) and [`time_bucket`](https://www.tigerdata.com/docs/reference/timescaledb/hyperfunctions/time-series-utilities/time_bucket), [continuous aggregates](https://www.tigerdata.com/docs/learn/continuous-aggregates) ([creating one](https://www.tigerdata.com/docs/build/continuous-aggregates/create-a-continuous-aggregate), [`CREATE MATERIALIZED VIEW`](https://www.tigerdata.com/docs/reference/timescaledb/continuous-aggregates/create_materialized_view), [real-time aggregates](https://www.tigerdata.com/docs/learn/continuous-aggregates/real-time-aggregates), [refresh policies](https://www.tigerdata.com/docs/build/continuous-aggregates/refresh-policies), [`add_continuous_aggregate_policy`](https://www.tigerdata.com/docs/reference/timescaledb/continuous-aggregates/add_continuous_aggregate_policy), [`refresh_continuous_aggregate`](https://www.tigerdata.com/docs/reference/timescaledb/continuous-aggregates/refresh_continuous_aggregate)), retention ([how it works](https://www.tigerdata.com/docs/learn/data-lifecycle/data-retention/about-data-retention), [together with continuous aggregates](https://www.tigerdata.com/docs/learn/data-lifecycle/data-retention/data-retention-with-continuous-aggregates), [`add_retention_policy`](https://www.tigerdata.com/docs/reference/timescaledb/data-retention/add_retention_policy)), the columnstore ([setting it up](https://www.tigerdata.com/docs/build/columnar-storage/setup-hypercore), [`ALTER TABLE`](https://www.tigerdata.com/docs/reference/timescaledb/hypercore/alter_table)), [logical backup and restore](https://www.tigerdata.com/docs/deploy/self-hosted/backup-and-restore/logical-backup) and [`timescaledb_pre_restore`](https://www.tigerdata.com/docs/reference/timescaledb/administration/timescaledb_pre_restore), [the TimescaleDB editions](https://www.tigerdata.com/docs/get-started/choose-your-path/timescaledb-editions), and the source code and changelog at [github.com/timescale/timescaledb](https://github.com/timescale/timescaledb) (tag 2.30.2: `sql/restoring.sql`, `sql/policy_api.sql`, `CHANGELOG.md`). The image: [`timescale/timescaledb` on Docker Hub](https://hub.docker.com/r/timescale/timescaledb) (tag `2.30.2-pg17`).
- PostgreSQL 17: [`EXPLAIN`](https://www.postgresql.org/docs/17/sql-explain.html) and [how to read it](https://www.postgresql.org/docs/17/using-explain.html), [ordered indexes](https://www.postgresql.org/docs/17/indexes-ordering.html), [`generate_series`](https://www.postgresql.org/docs/17/functions-srf.html), [`random` and `setseed`](https://www.postgresql.org/docs/17/functions-math.html), [`md5`](https://www.postgresql.org/docs/17/functions-string.html) and [`string_agg`](https://www.postgresql.org/docs/17/functions-aggregate.html), [date and time functions](https://www.postgresql.org/docs/17/functions-datetime.html), [loading large amounts of data](https://www.postgresql.org/docs/17/populate.html), [routine `VACUUM`](https://www.postgresql.org/docs/17/routine-vacuuming.html) (dead tuples), [WAL](https://www.postgresql.org/docs/17/wal-intro.html), [`pg_dump`](https://www.postgresql.org/docs/17/app-pgdump.html), [`pg_restore`](https://www.postgresql.org/docs/17/app-pgrestore.html), [`createdb`](https://www.postgresql.org/docs/17/app-createdb.html), [template databases](https://www.postgresql.org/docs/17/manage-ag-templatedbs.html) (`template0`), [declarative partitioning](https://www.postgresql.org/docs/17/ddl-partitioning.html) (🔬), and [psql](https://www.postgresql.org/docs/17/app-psql.html) (`\timing`, the pager).
- Docker: [`docker container cp`](https://docs.docker.com/reference/cli/docker/container/cp/) and [`docker container exec`](https://docs.docker.com/reference/cli/docker/container/exec/). PowerShell: [output redirection with `>`](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_redirection) (why binary files get corrupted in Windows PowerShell 5.1).
- From Modules 16–17: [Fastify](https://fastify.dev/docs/latest/) 5.12.7, [Zod](https://zod.dev) 4.6.7 (`z.enum`, `.refine` with `when`), [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) 7.0.0, [node-postgres](https://node-postgres.com) (`pg` 8.23.1), [TypeScript](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) 7.0.2 (`Record<Key, Value>`), [Bruno](https://docs.usebruno.com) 4.2.1, and Swagger UI 5.32.6 through [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) 6.1.2.
- Further reading for 🔬: [InfluxDB 3 Core](https://docs.influxdata.com/influxdb3/core/) and [its README](https://github.com/influxdata/influxdb) (the MIT or Apache 2 license), [`time_bucket_gapfill`](https://www.tigerdata.com/docs/reference/timescaledb/hyperfunctions/time_bucket_gapfill/time_bucket_gapfill), [hierarchical continuous aggregates](https://www.tigerdata.com/docs/learn/continuous-aggregates/hierarchical-continuous-aggregates), [`lttb` in TimescaleDB Toolkit](https://www.tigerdata.com/docs/reference/toolkit/downsampling/lttb) and [how to install the Toolkit](https://www.tigerdata.com/docs/deploy/self-hosted/tooling/install-toolkit), the LTTB algorithm from [flot-downsample](https://github.com/sveinn-steinarsson/flot-downsample), and [DBeaver with TimescaleDB](https://www.tigerdata.com/docs/integrate/query-administration/dbeaver) and the source code of [DBeaver 26.2.3](https://github.com/dbeaver/dbeaver) (the TimescaleDB connection type).

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-18`, `hypertable-binders`, `summary-book`, `retention-summary`, `backup-restore`, `project-diagram-module-18` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The behavior of the hypertable, the summary book, retention, and restore from the TimescaleDB documentation above; the numbers (binder counts, sizes, the fingerprint) from the author's lab for this module. | CC BY 4.0 |
| `swagger-bucket.png` | Real screenshots of the `/docs` page of this module's backend v0.3 (Swagger UI 5.32.6 through @fastify/swagger-ui 6.1.2) on the author's laptop: the `GET /devices/{id}/readings` route tried with **Try it out** and `bucket=1d`; cropped and rearranged, with title, numbers, and captions by the author. | Swagger UI is licensed Apache 2.0; @fastify/swagger-ui is licensed MIT; image: CC BY 4.0 |

**About the Expected output boxes.** Every command, all the SQL, and all the code of this module were run by the author on a Windows laptop with Docker Desktop 4.77 (Docker Engine 29.5.3) and the same `timescale/timescaledb:2.30.2-pg17` image as in Module 17 (PostgreSQL 17.11, TimescaleDB 2.30.2), in a separate lab container, following exactly the same order of steps as this module. The backend code was checked with `npm run check` (TypeScript 7.0.2) and run with Node.js 24.21.0. The output of `docker cp` was recorded in a real PowerShell terminal, because the `Successfully copied …` message only appears in a terminal. The backup and restore commands were also tested in Windows PowerShell 5.1, PowerShell 7, and Bash. The times (milliseconds), sizes, chunk names, job numbers, and timestamps on your screen may be different, so outputs like those are marked **example**. The times in the example backend log are written in WIB. The practice data is made with `npm run seed-history`, so the averages of the days before day H are the same on anyone's laptop; the test data is made with `setseed`, so the number of rows is exactly the same and the averages are almost the same.

---

[⬅️ Module 17](../module-17-sql-and-database-schema/README.md) · [Phase 3](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 19 — Realtime, Automation Rules, & Notifications](../module-19-realtime-rules-notifications/README.md) ➡️**
