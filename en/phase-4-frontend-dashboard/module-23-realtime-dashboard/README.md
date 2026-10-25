# Module 23 — Realtime Dashboard: Charts, Gauges, History, & Status

🌐 **English** · [Bahasa Indonesia](../../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md)

*Phase 4 · Week 23 · Hardware: **Kit A + B** or the Module 21 simulator (`f00d00000001`), plus a **phone** (Android/iPhone) on the same home Wi-Fi · Prerequisites: **Module 22** (dashboard v0.1 on `main`), **Module 19** · Time: 10–12 hours, spread over the week*

[⬅️ Module 22](../module-22-react-basics/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 24 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-24--controls-rule-forms-roles--protected-routes)

---

Module 22 ended with dashboard v0.1, which has a face, but **its numbers stand still**: a card only changes when its device's details are opened again. Yet since Module 19 your backend has pushed every reading through Socket.IO as soon as it arrives, and `tools/live-terminal.js` proved it in the terminal. All that's missing is a browser that listens too.

This week the dashboard stops **asking** and starts being **pushed**. You connect a locked Socket.IO, put the live data in one store that every screen reads, then add red/green status cards, a live temperature chart, gauges (half-circle dials), and the History screen.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| The numbers on the dashboard stand still until the device details are opened again. | Dashboard v0.1 **asks** once through `fetch`; nothing in the browser listens to Socket.IO yet. | **`socket.io-client` 4.8.4** with the same login cookie, the `follow` subscription and Module 19's `telemetry`/`status` listeners in `useEffect`, and a **Live** / **Reconnecting…** / **Disconnected** badge (Concepts 1–3, Practices 1–2) |
| Live data has to show in the List, the Details, the chart, and the gauges at the same time. | Every component keeps its data in its own state (a small whiteboard). | **A Zustand store** as a shared notice board, read through **selectors** so the screen isn't re-rendered 10× per second (Concepts 4–5, Practices 2 and 6) |
| It's unclear which device is alive right now, and since when its numbers haven't changed. | The status is read once when the List opens, and "updated at … WIB" doesn't say how long ago that was. | **Green `Online` and red `Offline` cards**, "last seen 12 seconds ago", and a `stale data` mark (Concepts 6–7, Practice 3) |
| Only the last number is visible; the trend of the last five minutes isn't. | v0.1 has no chart yet. | **A 5-minute live line chart** and **`RadialBarChart` gauges** for soil moisture and the water tank, with Recharts (Concepts 8–9, Practices 4–5) |
| Charts can mislead: a gauge looks full while it holds 20%, and a straight line crosses a gap while a device is off. | A chart library picks its own scale and joins two points that are far apart. | **Honest visuals**: gauges on a 0–100% scale, a unit on every number, gaps left open, and color always paired with text (Concept 9, Practice 5) |
| At night, the dashboard's white screen is glaring. | v0.1 only has a light theme. | **Dark mode** that follows the phone's or the laptop's setting, chart colors included (Concept 10, Practice 5) |
| The history can only be read through Bruno, as JSON. | No screen uses Module 18's per-bucket summaries (`bucket`) yet. | **A History screen** for 1 hour, 24 hours, and 7 days, a paged table, and a **Download CSV** button for Excel (Concept 11, Practices 7–8) |
| The dashboard only opens on the laptop. | The backend listens on `127.0.0.1`, and Vite only serves `localhost`. | **Phone mode** over home Wi-Fi (`HOST`, `CORS_ORIGIN`, `npm run dev:phone`), then back to **laptop mode** at the end of the session (Concept 12, Practices 9–10) |

At the end of the week, you cover Node 1's LDR with your hand while recording the phone screen (laptop path: `temp 33` and a lamp command), then open the 7-day History and read the text `loaded in … ms`. That's the pass requirement from the Syllabus: "covering the LDR with your hand changes the chart on your phone in **< 1 send interval + 1 second** (with Module 11's *report-by-exception*: about 1–2 seconds), and the 7-day history loads in < 1 second." One Node 1 send interval is 10 seconds, so the hard limit is 11 seconds. The Mini Smart Home gets **dashboard v0.2** (`0.2.0`, live). The backend stays v1.0, the data contract stays 1.4, and the firmware and `tools/` don't change; the new code is only in the `frontend/` folder.

![Roadmap of Module 23. At the top, the six phases of the curriculum from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 4 Dashboard, Modules 22 to 25, is highlighted with a purple frame. Modules 1 to 22 are marked done; Module 23 is red and marked YOU ARE HERE, Modules 24 and 25 are purple. The note left of the marker: the dashboard comes alive, numbers that move by themselves, with charts, gauges, history, status, and a phone over home Wi-Fi. Below, the box Module 23 this week, 10 to 12 hours spread out; hardware: Kit A + B or the Module 21 simulator (f00d00000001), plus a phone on the home Wi-Fi; a direct continuation of dashboard v0.1 of Module 22. The activity list, left column: the JavaScript warm-up, that is time, sliding windows, event listeners, setInterval that is not polling, and CSV text; the Quick Win, numbers that move by themselves without installing anything; Practice 1, a locked socket from the browser with Socket.IO and a cookie; Practice 2, a Zustand store, numbers that move by themselves; Practice 3, red/green status cards and last seen; Practice 4, a 5-minute live line chart, with the pass-requirement part: the chart changes in less than 1 send interval + 1 second; Practice 5, gauges, honest visuals, and dark mode. Right column: Practice 6, measure first, don't re-render 10× per second; Practice 7, history of 1 hour, 24 hours, 7 days, with the pass-requirement part: the 7-day history loads in less than 1 second; Practice 8, a paged table and CSV export; Practice 9, the dashboard on a phone over home Wi-Fi, with the pass-requirement part: covering the LDR with your hand changes the chart on your phone; Practice 10, the pass tests, lint, build, and a dress rehearsal, that is a dress rehearsal of both pass requirements, then back to laptop mode; and the Add-on, dashboard v0.2 and the pull request dashboard v0.2 (live). Practices 3, 4, 7, 9, 10, and the Add-on carry a star, required to pass. Bottom notes: the pass requirement from the Syllabus, covering the LDR with your hand changes the chart on your phone in less than 1 send interval + 1 second (with Module 11's report-by-exception: about 1–2 seconds), and the 7-day history loads in less than 1 second. Two data paths: the devices (Kit A + B via the Pi gateway, a real LDR) or the laptop (simulator f00d00000001 + Bruno). Unchanged: backend v1.0, data contract 1.4, firmware, and tools/; Wokwi not needed. Always open http://localhost:5173 on the laptop; the phone opens http://laptop-IP:5173 only in phone mode (Practice 9).](assets/roadmap-module-23.png)

> [!NOTE]
> **How to use this module.**
>
> - **Two data paths, one dashboard.** The dashboard only talks to backend v1.0 (the API and Socket.IO), not to the broker or the devices. **The device path**: Node 1 and Node 2 (**Kit A + B**) send through the broker on the Pi gateway, and Node 1's LDR is used for the pass requirement. **The laptop path**: Mosquitto on the laptop and the Module 21 simulator (the `tools` folder) with `f00d00000001`. The simulator has no LDR, so covering the LDR is replaced by two tests: `temp 33` in the simulator terminal (shown with the next message) and a lamp command from **Bruno** (an immediate send). The 7-day history uses practice data on both paths (the recipe is in [🧰](#-what-you-need)). **Wokwi isn't used.**
> - **On the laptop, always open the dashboard at `http://localhost:5173`**, not `127.0.0.1:5173` (Module 22 Concept 9). **The phone** opens `http://<laptop-IP>:5173`, only while **phone mode** is on (Practices 9–10). The login doesn't move along: the phone has its own browser and cookies, so on the phone you log in again with the viewer account.
> - **The 🖥️ box of every practice names its tools**: **VS Code** with the `backend` terminal (`npm run dev`, door 8080) and the `frontend` terminal (Vite, door 5173; in phone mode `npm run dev:phone`), on the laptop path also the `tools` terminal (the simulator); **Docker Desktop** with `smarthome-db` running; **Chrome or Edge** with DevTools (the **Network** and **Console** tabs) and React DevTools (Practice 6); **Bruno**; and **a phone** (Practices 9–10).
> - **A direct continuation of Module 22.** Dashboard v0.1 on `main`, the `admin@home.test` and `viewer@home.test` accounts, the Bruno collection, and `tools/.env` are used as they are. This week's work lives on a new branch, `feature/dashboard-live`; the result of every practice can be compared with `code/stages/practice-N`.
> - **The Expected output boxes.** The outputs and screenshots were recorded by the author on Windows 11 25H2 (build 10.0.26200.9711) with Node.js 24.21.0, npm 11.19.0, Docker Engine 29.5.3, and Edge 156.0.4314.42 against the real backend v1.0 and database. The senders are the Module 21 simulator (`f00d00000001`) and the lab's fake Node 1 and Node 2, so the sensor numbers are **examples**; the times, `loaded in … ms`, and the build sizes on your screen will certainly differ. IP addresses are written `192.168.1.10`; yours will be different. The phone steps were recorded on a laptop opening its own Wi-Fi IP address, with the phone screen imitated by DevTools device mode: **the author hasn't tried them on a real phone** (details in [📚 Sources](#-sources--image-credits); if your phone misbehaves, see [🚨](#-troubleshooting)).
> - macOS users: replace **Ctrl** with **Cmd** for VS Code and browser shortcuts (DevTools: **F12** or **Ctrl + Shift + I**, macOS **Cmd + Option + I**; reload: **F5**, macOS **Cmd + R**). **Except in the terminal:** stopping a program is still **Ctrl + C**, on a Mac too. Terminal commands are the same, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The dashboard still doesn't store passwords or tokens.** Socket.IO rides on the same `HttpOnly` cookies as `fetch`, and nothing goes into `localStorage`, not even the theme choice (dark mode follows the system setting).
> 2. **Every `VITE_…` variable is sent to the browser**, so it only holds addresses like `VITE_API_BASE`, never secrets.
> 3. **`.env.local` and `backend/.env` don't go into Git.** In phone mode, `backend/.env` holds your laptop's IP; only `.env.example` goes to GitHub.
> 4. **Phone mode only on a home Wi-Fi you trust**, not the Wi-Fi of a café, a campus, or a boarding house: the dashboard is still `http://` without encryption. On the phone, log in with the **viewer** account. Switch back to laptop mode (`HOST`, `CORS_ORIGIN`, and plain `npm run dev`) at the end of the session and before the laptop goes to another network ([Practice 9](#practice-9--the-dashboard-on-a-phone-over-home-wi-fi-60-minutes), [10.4](#104-switch-back-to-laptop-mode-5-minutes)). Access from the internet waits for HTTPS in Module 27.
> 5. **No polling.** Live readings only come through Socket.IO; `setInterval` only moves the clock on the screen, without network requests ([Concept 1](#1-pushed-not-asked-for-live-data-over-socketio), [Concept 6](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling)).
> 6. **Install npm packages with the versions written here** (for example `zustand@5.0.16`). Copy their names from the module, not from memory: a package with a similar name can be made by someone else.

Like Modules 16–22, this module opens with a [🔁 JavaScript warm-up](#-javascript-warm-up-3045-minutes), this time as preparation for the live dashboard: time, a sliding window, event listeners, a ticking clock, and CSV text. The first day only needs the warm-up, the Quick Win (numbers that move by themselves without installing packages), Concepts 1–2, and Practice 1. The twelve concepts are read in pairs with their practices; the order is at the start of [🧠](#-the-why-concepts). The fold-out sections under [🚨](#-troubleshooting) (click the heading) are opened when you need them; the fold-out sections under [🔬](#-technical-deep-dive-optional) may be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🏆 Quick Win: numbers that move by themselves (20 minutes)](#-quick-win-numbers-that-move-by-themselves-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Pushed](#1-pushed-not-asked-for-live-data-over-socketio) · [2 Locked socket](#2-a-locked-socket-the-same-cookie-the-same-wristband) · [3 `useEffect`](#3-useeffect-for-subscribing-add-the-listeners-remove-them-in-the-cleanup) · [4 Zustand store](#4-one-store-for-every-screen-zustand-and-selectors) · [5 Re-renders](#5-dont-re-render-10-per-second-measure-first-then-believe) · [6 Time](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling) · [7 Status and freshness](#7-alive-isnt-always-fresh-status-last-seen-and-stale-data) · [8 Live chart](#8-a-live-line-chart-the-5-minute-sliding-window) · [9 Honest visuals](#9-honest-visuals-scale-units-gaps-and-status-colors) · [10 Dark mode](#10-dark-mode-following-the-phones-and-the-laptops-setting) · [11 History](#11-history-from-buckets-three-ranges-a-paged-table-and-csv) · [12 Phone over Wi-Fi](#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Socket](#practice-1--a-locked-socket-from-the-browser-45-minutes) · [2 Zustand store](#practice-2--a-zustand-store-numbers-that-move-by-themselves-50-minutes) · [3 Status cards](#practice-3--redgreen-status-cards-and-last-seen-40-minutes) · [4 Live chart](#practice-4--a-5-minute-live-line-chart-55-minutes) · [5 Gauges and dark mode](#practice-5--gauges-honest-visuals-and-dark-mode-45-minutes) · [6 Measure first](#practice-6--measure-first-dont-re-render-10-per-second-25-minutes) · [7 History](#practice-7--history-of-1-hour-24-hours-and-7-days-55-minutes) · [8 Table and CSV](#practice-8--a-paged-table-and-csv-export-40-minutes) · [9 Phone](#practice-9--the-dashboard-on-a-phone-over-home-wi-fi-60-minutes) · [10 Pass tests](#practice-10--the-pass-tests-lint-build-a-dress-rehearsal-and-laptop-mode-35-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-23-completion-checklist)

## 🎯 After this module you can…

1. **Connect the dashboard to Socket.IO with the same login cookie** (a locked socket), let it recover by itself after the wristband expires or the backend restarts, and show a **Live**, **Reconnecting…**, or **Disconnected** badge.
2. **Subscribe through `useEffect`**: add the `telemetry` and `status` listeners, follow devices with `follow`, then remove everything in the cleanup.
3. **Put the live data in one Zustand store** (a shared notice board) that the List, the Details, the chart, and the gauges read through selectors.
4. **Make red/green status cards** with "last seen 12 seconds ago" and a `stale data` mark, without polling.
5. **Draw a 5-minute live line chart** with Recharts: a sliding window, WIB times on the time axis, and a new point as soon as a reading arrives.
6. **Choose honest visuals**: `RadialBarChart` gauges on a 0–100% scale, a unit on every number, gaps left open, and colors always paired with text.
7. **Open the history of 1 hour, 24 hours, and 7 days** from the API (raw readings and `bucket`s), prove that the 7-day history loads in under 1 second, then present it in a paged table and a CSV file for Excel.
8. **Measure first, then believe**: check with React DevTools that the screen isn't re-rendered 10× per second.
9. **Turn on dark mode** that follows the phone's or the laptop's setting, chart colors included.
10. **Open the dashboard from a phone over home Wi-Fi** (phone mode), switch back to laptop mode, then merge dashboard v0.2 through a pull request after lint and build pass.

## 🧰 What you need

| What to prepare | Notes |
| :--- | :--- |
| **The result of Module 22** | Dashboard v0.1 (`0.1.0`) on `main`, in the `frontend/` folder; backend v1.0 and the **`smarthome-db`** container in Docker Desktop; the `admin@home.test` and `viewer@home.test` accounts with their passwords; the Bruno collection with `backend/bruno/.env`; and `tools/.env`. |
| **A data source** (pick one path) | **Device path:** Node 1 and Node 2 (Kit A + B), registered since Module 21; Node 1's LDR is used for the pass requirement. **Laptop path:** Mosquitto on the laptop and the Module 21 simulator (`tools`) with **`f00d00000001`**. Wokwi isn't used. |
| **A phone** (Android or iPhone) | On the **same home Wi-Fi** as the laptop, for [Practice 9](#practice-9--the-dashboard-on-a-phone-over-home-wi-fi-60-minutes) and the Practice 10 rehearsal; plus a second camera (the laptop's camera or another phone) to record the proof video. A tablet or a second laptop may replace the phone. Without a second device, use the DevTools device-mode path and note it honestly in [✅](#-module-23-completion-checklist). The author hasn't tried the phone steps on a real phone either. |
| **7 days of history data** | Practice data for both paths, from the recipe below this table. |
| **Node.js 24, VS Code, Git, Bruno** | The same as Module 22; the `learn-iot` repository is used again for 🔁 and the ➕ E notes (the `module-23` folder). Bruno uses the admin account for the lamp command and the viewer account to check the history. |
| **Chrome or Edge** | The built-in DevTools (the **Network** and **Console** tabs) and the React DevTools extension (installed since Module 22, used in Practice 6). Firefox and Safari haven't been tested. |
| **Internet and a GitHub account** | Internet for the `npm install` of five packages in Practice 1; GitHub for the "dashboard v0.2 (live)" pull request in ➕ D. |

**The 7-day data recipe.** The `npm run seed-history` data from Module 17 is weeks old by now, so its "last 7 days" are empty or full of holes. This two-command recipe is run in [7.1](#71-prepare-7-days-of-data-and-check-it-in-bruno-10-minutes); if you try it earlier, repeat it there (readings that already exist are skipped). With the backend and `smarthome-db` running, open a new terminal in the `backend` folder:

```text
npm run seed-history
docker exec -it smarthome-db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
```

**Result (example):** the first command ends with one line per practice device, for example `f00d00000001: 1109 readings sent, 1109 newly stored` (one reading every 10 minutes from 00:00 WIB seven days ago until now, for `f00d00000001` and `f00d00000002`, so the number depends on the clock). The second command answers one line, `CALL`; if Docker Desktop adds three lines starting with `What's next:`, that's a small Docker ad, ignore it. The second command summarizes those readings into the hourly summary book (Module 18); without it, the 7-day History may only have 2 points. Its window is 8 days, not `NULL` as in Module 18, so old summaries whose raw readings retention already threw away stay intact.

Versions used in this module (October 2026): **Node.js 24** and five new packages installed with written versions in [1.2](#12-install-five-packages-at-their-written-versions-5-minutes): **socket.io-client 4.8.4** (the same version as the Socket.IO server in backend v1.0), **zustand 5.0.16** (the store), **recharts 3.10.1** (charts and gauges) with its partner **react-is 19.3.1** (its version must match `react`'s), and **date-fns 4.4.0** (relative time in English). The Module 22 packages aren't upgraded: **vite 8.3.5**, **react** and **react-dom 19.3.1**, **@vitejs/plugin-react 6.1.2**, **tailwindcss** and **@tailwindcss/vite 4.3.3**, **typescript 6.0.3**, **oxlint 1.89.0**, and the **React DevTools 8.0.0** extension. **@tanstack/react-virtual 3.14.22** is only discussed in [🔬](#-technical-deep-dive-optional), not installed.

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, and the `learn-iot` repository folder. The backend, Docker, and the browser aren't used yet.

The live dashboard uses five small JavaScript skills: time, a sliding window, event listeners, a ticking clock, and CSV text. Practice them first in Node.js, without React or packages (about 40 minutes). Type it yourself, don't copy-paste, then compare the result of each step; the **Later in React** notes show where each one is used.

**Set up the folder.** Open the **`learn-iot`** repository in VS Code, create a new folder **`module-23`**, then run in the terminal:

```text
cd module-23
npm init -y
npm pkg set type=module
```

`type=module` makes Node.js accept `import` and `await` outside a function. Then create **`warmup.js`** in `module-23` and type its head:

```js
// warmup.js - a JavaScript warm-up before Module 23
// Five small skills that come back later in the live dashboard: time, a sliding window, event listeners, a tick, and CSV.
import { EventEmitter } from "node:events";
import { setTimeout as wait } from "node:timers/promises";
```

`import` always goes at the very top. Both are built into Node.js (the `node:` prefix) and are used in Steps 3 and 4.

### Step 1 — Time: `Date.parse`, `Date.now()`, and WIB time

Every reading carries `ts`, the device's time in UTC (the letter `Z`) as **text**; to count "how many seconds ago", it must become a **number**. Add:

```js
// 1. Time: Date.parse, Date.now, and WIB time
// A device's ts is UTC text without milliseconds, for example "2026-10-24T03:15:42Z". Here it's made "12 seconds ago".
const ts = new Date(Date.now() - 12_000).toISOString().slice(0, 19) + "Z";
const t = Date.parse(ts); // text -> number: milliseconds since 1 January 1970 (UTC)
const diffSeconds = Math.round((Date.now() - t) / 1000); // Date.now() = now, also in milliseconds
console.log("ts:", ts, "->", t);
console.log(`last seen ${diffSeconds} seconds ago`);
console.log("laptop time:", new Date(t).toLocaleTimeString("en-GB")); // follows the laptop's time zone
console.log("WIB time   :", new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }), "WIB"); // always WIB
```

Save (**Ctrl + S**), then run `node warmup.js`. **Expected output (example):**

```text
ts: 2026-10-24T08:34:05Z -> 1792830845000
last seen 12 seconds ago
laptop time: 16:34:05
WIB time   : 15:34:05 WIB
```

- **`const ts`** makes an example `ts` from 12 seconds ago (`12_000` = 12000) without milliseconds (`slice(0, 19)`), so the real difference is 12.0–12.9 seconds: your number is sometimes `13`.
- **`Date.parse(ts)`** turns the text into milliseconds since 1 January 1970 UTC, the same unit as **`Date.now()`**. The difference divided by 1000 = seconds.
- **`toLocaleTimeString("en-GB")`** writes a 24-hour time with colons in the **laptop's** time zone; with **`timeZone: "Asia/Jakarta"`** it's always WIB. The author's laptop is on UTC+8 (like WITA), so `laptop time` is one hour ahead. On a WIB laptop, both lines are the same.

**Later in React:** `wibTime()` in `src/time.ts` uses this WIB line. The "… ago" text is written by `relativeTime()` (date-fns), counted from when the reading was **received**, not from the device's `ts` ([Concept 6](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling), Practice 3).

### Step 2 — A 5-minute sliding window: add, filter, and drop duplicates

The live chart only holds the last 5 minutes: new readings come in on the right, too-old ones are dropped on the left, and a double reading is kept once. Add:

```js
// 2. A 5-minute sliding window: add new points, drop the ones that are too old, drop the doubles
const FIVE_MINUTES = 5 * 60 * 1000;
const now = Date.now();
const old = [
  { t: now - 6 * 60 * 1000, temperature: 27.9 }, // 6 minutes ago: already outside the window
  { t: now - 20_000, temperature: 28.4 },
  { t: now - 10_000, temperature: 28.5 },
];
const incoming = [
  { t: now - 10_000, temperature: 28.5 }, // the same point arrives twice (for example from the API and from the socket)
  { t: now, temperature: 28.7 },
];
const sorted = [...old, ...incoming] // ... = copy the items of both arrays into a NEW array; "old" isn't changed
  .filter((p) => p.t >= now - FIVE_MINUTES) // only the last 5 minutes
  .sort((a, b) => a.t - b.t); // oldest first
const slidingWindow = sorted.filter((p, i) => i === 0 || p.t !== sorted[i - 1].t); // once sorted, doubles sit side by side
console.log("old:", old.length, "points | new window:", slidingWindow.map((p) => p.temperature).join(", "));
```

Save, then run it again. **Expected output** (new line):

```text
old: 3 points | new window: 28.4, 28.5, 28.7
```

**`[...old, ...incoming]`** pours both arrays into a **new** one (spread, Module 22), so `old` stays 3 points. **`filter`** drops 27.9 (6 minutes ago) and **`sort`** puts them oldest first (`a.t - b.t` = small to large). Once sorted, points with the same time sit side by side, so comparing each with its left neighbor `sorted[i - 1]` is enough (`i` = the position, starting at 0): only one 28.5 is left.

**Later in React:** `merge()` in `src/store.ts` does the same every time a reading arrives ([Concept 8](#8-a-live-line-chart-the-5-minute-sliding-window), Practice 4).

### Step 3 — Event listeners: `on`, `emit`, and `off`

Socket.IO works with **events**: `socket.on("telemetry", function)` adds a listener that is called every time that event arrives. Its twin in Node.js, **`EventEmitter`**, becomes a fake socket, and `emit` plays the backend. Add:

```js
// 3. Event listeners: on, emit, and off (the twins of socket.on / socket.off in the browser)
const fakeSocket = new EventEmitter();
function show(deviceId, content) {
  console.log(`  telemetry ${deviceId}: temperature ${content.temperature} °C`);
}
fakeSocket.on("telemetry", show); // add a listener
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.1 }); // printed once
fakeSocket.on("telemetry", show); // forgot to remove it, then added it again (like an effect without a cleanup)
console.log("telemetry listeners now:", fakeSocket.listenerCount("telemetry"));
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.2 }); // printed TWICE: the reading shows up double
fakeSocket.off("telemetry", show); // remove one, with the SAME function
fakeSocket.off("telemetry", show);
console.log("after off twice:", fakeSocket.listenerCount("telemetry"));
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.3 }); // nobody is listening: nothing is printed
```

**Expected output** (new lines):

```text
  telemetry f00d00000001: temperature 28.1 °C
telemetry listeners now: 2
  telemetry f00d00000001: temperature 28.2 °C
  telemetry f00d00000001: temperature 28.2 °C
after off twice: 0
```

**`on`** adds, **`emit`** sends an event to every listener, **`off`** removes one. `show` is added twice, so 28.2 is printed **twice**: the symptom of an effect without a cleanup. `off` must be given **the same function**; after two `off`s, nobody hears 28.3.

**Later in React:** `src/socket.ts` adds `socket.on("telemetry", onTelemetry)` in `useEffect`, then `socket.off` with the same function in the cleanup ([Concept 3](#3-useeffect-for-subscribing-add-the-listeners-remove-them-in-the-cleanup), Practice 2).

### Step 4 — A ticking clock: `setInterval` and `clearInterval`, not polling

The text "12 seconds ago" must grow by itself even with no new reading: a clock ticking every second is enough. Add:

```js
// 4. A tick: setInterval and clearInterval. This is a CLOCK on the screen, not polling: nothing is asked of the server.
let tick = 0;
const timer = setInterval(() => {
  tick++;
  console.log(`  tick ${tick}: ${new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" })} WIB`);
  if (tick === 3) clearInterval(timer); // without clearInterval, the tick goes on forever
}, 1000);
await wait(3500); // wait until the three ticks are done before the next step
```

**Expected output (example)** (new lines, one per second):

```text
  tick 1: 15:34:19 WIB
  tick 2: 15:34:20 WIB
  tick 3: 15:34:21 WIB
```

**`setInterval(function, 1000)`** calls its function every 1,000 ms until **`clearInterval(timer)`**; **`await wait(3500)`** holds the program until the three ticks are done. **Not polling:** it only reads the laptop's clock. Polling (asking the server again and again with a timer) is forbidden this week.

**Later in React:** `useNow()` in `src/time.ts` adds `setInterval` in `useEffect` and `clearInterval` in the cleanup, so the ticking stops when its component leaves the screen (Concept 6, [3.1](#31-a-ticking-clock-and-relative-time-srctimets-15-minutes)).

### Step 5 — CSV text for Excel: commas, decimal points, and quotes

CSV is just text, one line per record. When a CSV file is double-clicked, Excel splits the columns with the **list separator** of Windows' regional settings: with English (US/UK) settings that's a comma `,`, with a decimal point. Add:

```js
// 5. CSV text for Excel (English settings): a comma as the separator, a decimal point, and quotes when needed
function quote(text) {
  // a value containing , " or a line break is wrapped in quotes, and the quotes inside are doubled
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
const rows = [
  ["time_wib", "device", "avg_temp_c"],
  ["2026-10-24 10:00:00", "Node 1, living room", 28.5],
  ["2026-10-24 11:00:00", 'Node "main"', 29],
];
const csv = rows
  .map((r) => r.map((value) => (typeof value === "number" ? String(value) : quote(value))).join(","))
  .join("\r\n"); // Excel on Windows uses CRLF as the line ending
console.log(csv);
```

**Expected output** (new lines):

```text
time_wib,device,avg_temp_c
2026-10-24 10:00:00,"Node 1, living room",28.5
2026-10-24 11:00:00,"Node ""main""",29
```

**Two layers of `map`** (outer per row, inner per value): numbers become text with a decimal point (`28.5`), text goes through `quote()`, then `join(",")` strings the columns together and `join("\r\n")` the rows (CRLF, the Windows line ending). **`quote()`** wraps a value that contains `,`, `"`, or a line break in quotes so its column doesn't split, and doubles the quotes inside.

**Later in React:** `src/csv.ts` uses the same `quote()`, plus a BOM (the UTF-8 mark, so special characters in a device name, such as `°` or `é`, stay intact in Excel) and an empty cell for `null`; the **Download CSV** button saves it ([8.2](#82-srccsvts-and-the-download-csv-button-15-minutes)).

Different output? Compare what you typed with [the original file](code/warmup/warmup.js).

<details>
<summary>The full contents of <code>warmup.js</code></summary>

```js
// warmup.js - a JavaScript warm-up before Module 23
// Five small skills that come back later in the live dashboard: time, a sliding window, event listeners, a tick, and CSV.
import { EventEmitter } from "node:events";
import { setTimeout as wait } from "node:timers/promises";

// 1. Time: Date.parse, Date.now, and WIB time
// A device's ts is UTC text without milliseconds, for example "2026-10-24T03:15:42Z". Here it's made "12 seconds ago".
const ts = new Date(Date.now() - 12_000).toISOString().slice(0, 19) + "Z";
const t = Date.parse(ts); // text -> number: milliseconds since 1 January 1970 (UTC)
const diffSeconds = Math.round((Date.now() - t) / 1000); // Date.now() = now, also in milliseconds
console.log("ts:", ts, "->", t);
console.log(`last seen ${diffSeconds} seconds ago`);
console.log("laptop time:", new Date(t).toLocaleTimeString("en-GB")); // follows the laptop's time zone
console.log("WIB time   :", new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }), "WIB"); // always WIB

// 2. A 5-minute sliding window: add new points, drop the ones that are too old, drop the doubles
const FIVE_MINUTES = 5 * 60 * 1000;
const now = Date.now();
const old = [
  { t: now - 6 * 60 * 1000, temperature: 27.9 }, // 6 minutes ago: already outside the window
  { t: now - 20_000, temperature: 28.4 },
  { t: now - 10_000, temperature: 28.5 },
];
const incoming = [
  { t: now - 10_000, temperature: 28.5 }, // the same point arrives twice (for example from the API and from the socket)
  { t: now, temperature: 28.7 },
];
const sorted = [...old, ...incoming] // ... = copy the items of both arrays into a NEW array; "old" isn't changed
  .filter((p) => p.t >= now - FIVE_MINUTES) // only the last 5 minutes
  .sort((a, b) => a.t - b.t); // oldest first
const slidingWindow = sorted.filter((p, i) => i === 0 || p.t !== sorted[i - 1].t); // once sorted, doubles sit side by side
console.log("old:", old.length, "points | new window:", slidingWindow.map((p) => p.temperature).join(", "));

// 3. Event listeners: on, emit, and off (the twins of socket.on / socket.off in the browser)
const fakeSocket = new EventEmitter();
function show(deviceId, content) {
  console.log(`  telemetry ${deviceId}: temperature ${content.temperature} °C`);
}
fakeSocket.on("telemetry", show); // add a listener
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.1 }); // printed once
fakeSocket.on("telemetry", show); // forgot to remove it, then added it again (like an effect without a cleanup)
console.log("telemetry listeners now:", fakeSocket.listenerCount("telemetry"));
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.2 }); // printed TWICE: the reading shows up double
fakeSocket.off("telemetry", show); // remove one, with the SAME function
fakeSocket.off("telemetry", show);
console.log("after off twice:", fakeSocket.listenerCount("telemetry"));
fakeSocket.emit("telemetry", "f00d00000001", { temperature: 28.3 }); // nobody is listening: nothing is printed

// 4. A tick: setInterval and clearInterval. This is a CLOCK on the screen, not polling: nothing is asked of the server.
let tick = 0;
const timer = setInterval(() => {
  tick++;
  console.log(`  tick ${tick}: ${new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" })} WIB`);
  if (tick === 3) clearInterval(timer); // without clearInterval, the tick goes on forever
}, 1000);
await wait(3500); // wait until the three ticks are done before the next step

// 5. CSV text for Excel (English settings): a comma as the separator, a decimal point, and quotes when needed
function quote(text) {
  // a value containing , " or a line break is wrapped in quotes, and the quotes inside are doubled
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
const rows = [
  ["time_wib", "device", "avg_temp_c"],
  ["2026-10-24 10:00:00", "Node 1, living room", 28.5],
  ["2026-10-24 11:00:00", 'Node "main"', 29],
];
const csv = rows
  .map((r) => r.map((value) => (typeof value === "number" ? String(value) : quote(value))).join(","))
  .join("\r\n"); // Excel on Windows uses CRLF as the line ending
console.log(csv);
```

</details>

<details>
<summary>Self-test answer key</summary>

1. **If `ts` = `"2026-10-24T03:15:42Z"`, what does the `WIB time` line print, and why not 03?** `10:15:42 WIB`: `Z` means UTC, and WIB = UTC + 7 hours. That's why `ts` isn't shown raw.
2. **A friend forgets that `Date.now()` is in milliseconds and writes `const FIVE_MINUTES = 5 * 60;`. What is printed?** `old: 3 points | new window: 28.7`. The window is only 300 ms: only the "now" point gets through the `filter`.
3. **In both `off` lines, replace `show` with `(deviceId, content) => show(deviceId, content)`. What changes?** `after off twice: 2`, and 28.3 is printed twice. That arrow function is a **new** function, not `show`, so nothing is removed. That's why `src/socket.ts` uses named functions.
4. **Delete the line `if (tick === 3) clearInterval(timer);`. What happens?** After the CSV lines come `tick 4`, `tick 5`, and so on; the program never ends until you press **Ctrl + C**. In React, the cleanup of `useNow()` prevents this. Put the line back.
5. **Replace `"Node 1, living room"` with `"Node 1; porch"`. What is the second line, and why no quotes?** `2026-10-24 10:00:00,Node 1; porch,28.5`. Our separator is `,`, so a semicolon doesn't split a column and `quote()` leaves it alone. That's also why `28.5`, with its decimal point, is safe.

</details>

## 🏆 Quick Win: numbers that move by themselves (20 minutes)

> 🖥️ **Tools used:** **VS Code** in the `mini-smart-home` folder with the `backend` (port 8080) and `frontend` (Vite, port 5173) terminals, on the laptop path also the broker (the `edge` folder) and the simulator (the `tools` folder); **Docker Desktop**; and **Chrome or Edge** with DevTools (the **Network** tab).

Dashboard v0.1 **asks**: its numbers only change when the device details are opened again. Before touching React, prove that your backend can **push** readings to the browser: one plain HTML page with one temperature card that changes by itself about every 10 seconds, without buttons and without polling.

### Step 1 — Start everything, then log in to dashboard v0.1 (4 minutes)

The same as Module 22 Practice 4.1; every new terminal (**Terminal → New Terminal**) starts in the `mini-smart-home` folder.

1. **Database:** start `smarthome-db` in Docker Desktop (the **▶** button).
2. **Data source:** turn on Node 1 and Node 2 (device path). Laptop path: `cd edge`, then `mosquitto -v -c mosquitto-lan.conf` (skip it if your Mosquitto already runs as a service), then in another terminal `cd tools` and `node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1`; wait for `f00d00000001: online`.
3. **Backend:** `cd backend`, then `npm run dev`; wait for `Server listening at http://127.0.0.1:8080` and `connected to broker … as backend`.
4. **Dashboard:** `cd frontend`, then `npm run dev`, open **`http://localhost:5173`**, and log in with the viewer account. Leave this tab open: its login cookies are needed later.

### Step 2 — Write `public/try-live.html` (6 minutes)

The `frontend/public` folder has existed since Module 22 (it holds `favicon.svg`). Vite serves what's in it as is at `http://localhost:5173/<file-name>`: **the same site as the dashboard you just logged in to**, so the page uses those cookies too.

In VS Code's Explorer panel, right-click the **`frontend/public`** folder → **New File…**, name it **`try-live.html`**, then type its content (or open [`code/quick-win/try-live.html`](code/quick-win/try-live.html) on GitHub, click **Copy raw file**, then paste).

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Try live</title>
    <!-- try-live.html - Module 23 Quick Win: a number that moves by itself, with no button and no polling.
         Put it in frontend/public/, log in to the dashboard first (http://localhost:5173), then open
         http://localhost:5173/try-live.html. When you're done, DELETE this file so it doesn't go into dist/ and Git
         (everything in public/ is copied to dist/ by the build). -->
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; color: #1e293b; background: #f1f5f9; }
      .card { max-width: 20rem; padding: 1.5rem; border-radius: 1rem; background: white; border: 1px solid #e2e8f0; }
      .label { margin: 0; color: #64748b; font-size: 0.875rem; }
      .value { margin: 0.25rem 0; font-size: 3rem; font-weight: 600; color: #0d9488; }
      .unit { font-size: 1.25rem; font-weight: 400; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="label">Temperature <span id="device"></span></p>
      <p class="value"><span id="temperature">—</span> <span class="unit">°C</span></p>
      <p class="label" id="state">Connecting…</p>
      <p class="label" id="time"></p>
    </div>

    <!-- the Socket.IO library for the browser, served by the backend itself (no npm needed for this experiment) -->
    <script src="http://localhost:8080/socket.io/socket.io.js"></script>
    <script>
      const ID = "f00d00000001"; // Module 21's practice device; a real Node 1: replace it with its device_id
      document.getElementById("device").textContent = ID;

      // withCredentials: true = bring the login cookies (from the dashboard on localhost) to port 8080. Without it: "not logged in".
      const socket = io("http://localhost:8080", { withCredentials: true });

      function show(content) {
        document.getElementById("temperature").textContent = content.temperature ?? "—";
        const time = new Date(content.ts).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" });
        document.getElementById("time").textContent = "reading at " + time + " WIB";
      }

      // "connect" happens every time it connects. "follow" MUST use an answer function (ack):
      // without it, the server quietly doesn't put us in the device's room.
      socket.on("connect", () => {
        document.getElementById("state").textContent = "Connected. Waiting for the next message…";
        socket.emit("follow", ID, (answer) => {
          if (!answer.ok) {
            document.getElementById("state").textContent = "Refused: " + answer.message;
            return;
          }
          if (answer.latest) show(answer.latest); // the last reading the backend remembers
        });
      });

      // sent by the server every time that device sends a reading (about every 10 seconds)
      socket.on("telemetry", (deviceId, content) => {
        document.getElementById("state").textContent = "Live: this number changes by itself.";
        show(content);
      });

      socket.on("connect_error", (error) => {
        document.getElementById("state").textContent = "Not connected yet: " + error.message;
      });
      socket.on("disconnect", (reason) => {
        document.getElementById("state").textContent = "Disconnected: " + reason;
      });
    </script>
  </body>
</html>
```

Save (**Ctrl + S**). Four parts are new:

- **`<script src="http://localhost:8080/socket.io/socket.io.js">`** fetches the Socket.IO library for the browser from your own backend, so no `npm install` is needed. The `io(…)` function comes from there.
- **`withCredentials: true`**: the page (port 5173) and the backend (port 8080) use different ports; without this option the browser doesn't attach the cookies, and the backend refuses with `not logged in`. It's the twin of `credentials: "include"` in Module 22's `fetch` ([Concept 2](#2-a-locked-socket-the-same-cookie-the-same-wristband)).
- **`socket.emit("follow", ID, (answer) => …)`** asks to enter that device's "room" in the backend. The answer function (ack) at the end is **required**: without it, the backend quietly leaves you out of the room. The answer carries `latest`, the last reading the backend remembers, so the first number shows at once.
- **`socket.on("telemetry", …)`** is a listener: its function is called **every time** the backend pushes a reading of that device. There's no button and no timer.

Device path: replace `f00d00000001` in the `const ID` line with your Node 1's `device_id` (on its Device List card, after the location).

### Step 3 — Open the page: the number changes by itself (3 minutes)

In a new tab of the same browser, open **`http://localhost:5173/try-live.html`**, then don't touch anything for about 30 seconds.

**Result (example):** the `Temperature f00d00000001` card shows the last reading from the `follow` answer at once:

```text
33 °C
Connected. Waiting for the next message…
reading at 15:53:51 WIB
```

About 10 seconds later, without a click, the number, the state, and the time change:

```text
31.1 °C
Live: this number changes by itself.
reading at 15:54:01 WIB
```

Then `25.5 °C` (15:54:11 WIB), `27.5`, `26.9`, `31.5` (15:54:41 WIB), and so on; yours will certainly differ. If the backend has just been restarted, `latest` is still empty: the number stays `—` until the next message. Still `—` after 20 seconds? Check the sender and `const ID` (a wrong ID in a valid format isn't refused, just never sent anything).

That's **pushed**: the browser no longer asks; the backend sends as soon as a reading arrives.

> [!TIP]
> It says `Not connected yet: not logged in`, or `Disconnected: io server disconnect` halfway? The 15-minute wristband from your login has expired, or you haven't logged in. Press **F5** in the dashboard tab (`http://localhost:5173`), log in again if the login form appears, then press **F5** on this page. Stuck at `Connecting…`? The backend isn't running, so `socket.io.js` failed to load. The ordinary dashboard shows up? Vite didn't find the file: check its name and place in `frontend/public`. `xhr poll error` is in [🚨](#-troubleshooting).

### Step 4 — Peek at its messages in the Network tab (5 minutes)

1. In the `try-live.html` tab, open DevTools (**F12**), click the **Network** tab, then press **F5**: the **Network** tab only records while DevTools is open.
2. Click the **Socket** type filter (**WS** in older versions). One row is left, `socket.io/?EIO=4&transport=…`: one WebSocket connection that stays open.
3. Click that row, then the **Messages** tab. Wait about 30 seconds.
4. Click the lowest (newest) `42["telemetry", …]` row.

**Result (example, Edge 156):** a table with the columns **Data**, **Length**, and **Time** starts with the rows `2probe`, `3probe`, and `5` (the connection upgrades from long-polling to WebSocket), then one row about every 10 seconds with a red ↓ arrow (received; a green ↑ = sent by the browser), for example:

```text
42["telemetry","f00d00000001",{"ts":"2026-10-24T08:54:01Z","fw":"0.1.0","temperature":31.1,"humidity":57,…
```

In between are small `2` and `3` rows: the ping/pong heartbeat that keeps the connection alive, not data. The clicked row unfolds into the tree `0: "telemetry"`, `1: "f00d00000001"`, `2: {ts: "2026-10-24T23:45:51Z", fw: "0.1.0", temperature: 31.6, …}`: `temperature` is the number on the page, and `ts` (UTC time, ending in `Z`) plus 7 hours becomes `reading at 06:45:51 WIB`.

![Composite of real screenshots, Quick Win: pushed numbers, seen in DevTools (Edge, laptop 1280 px, readings from the lab simulator). Top, the page try-live.html after logging in: Temperature f00d00000001 31.6 °C, Live: this number changes by itself, reading at 06:45:51 WIB (marker 1). Bottom, the DevTools of the same tab: the Network tab and the Socket filter active (marker 2), one row socket.io/?EIO=4&transport=… in the Name column (marker 3), the Messages tab active (marker 4) with the columns Data, Length, Time: 2probe, 3probe, 5, 420 follow f00d00000001 and its 430 answer ok true, then the message 42 telemetry f00d00000001 temperature 26.3 at 06:45:01 (marker 5), temperature 28.1, 29.1, 29.6, 26.3, and 31.6 at 06:45:51 which is clicked, with the small messages 2 and 3 in between (marker 6). At the very bottom, the selected message as a tree: telemetry, f00d00000001, ts 2026-10-24T23:45:51Z, fw 0.1.0, temperature 31.6, humidity 73, light 2926, soil 26 (marker 7). Legend: 1 the number changes by itself with every message, ±10 seconds, time = the device's ts in WIB; 2 in older DevTools the button is called WS; 3 one WebSocket connection that stays open; 4 red arrow down = received, green arrow up = sent by the browser; 5 pushed by the backend, no polling; 6 2 and 3 = the ping/pong heartbeat, not data; 7 event name, device_id, readings; temperature 31.6 = the number on the page.](assets/ws-messages-quick-win.png)

`follow` and its answer sometimes don't show in **Messages** (when they're sent before the connection upgrades to WebSocket); that's normal. Now and then a `42["status", …]` appears: a status change of **any** device, sent to everyone connected. The long-polling at the start is how the library opens the connection, not the polling we forbid; what `42`, `2`, and `3` mean is in [🔬](#-technical-deep-dive-optional) (*From polling to WebSocket*).

### Step 5 — Delete `try-live.html` (2 minutes)

This page is only a demo. Everything in `public/` is copied to `dist/` by `npm run build`, and experiment files mustn't go into Git ([➕ C](#c-add-the-module-23-items-to-the-pull-request-template) checks it).

1. Close DevTools and the `try-live.html` tab (its socket closes with it).
2. In VS Code's Explorer panel, right-click **`frontend/public/try-live.html`** → **Delete**, then confirm.
3. Open `http://localhost:5173/try-live.html` again.

**Result:** the ordinary dashboard appears (tab title `Mini Smart Home`), not the temperature card, because Vite can't find the file anymore. Only `favicon.svg` is left in `frontend/public`.

In 20 minutes, your browser received readings **pushed** by the backend over one connection, with the same login cookies as `fetch`. But that page can't recover: as soon as the 15-minute wristband expires, the backend cuts it (`io server disconnect`) and it doesn't reconnect by itself. Moving the socket into the React dashboard, with a way to recover, is this week's job.

> ➡️ **Next:** read [Concepts 1–2](#1-pushed-not-asked-for-live-data-over-socketio), then do [Practice 1 — A locked socket from the browser](#practice-1--a-locked-socket-from-the-browser-45-minutes).

## 🧠 The "Why" Concepts

You don't have to read these twelve concepts in one go. Read them in pairs with their practice:

1. Quick Win (already done) → Concepts 1–2 → Practice 1 (a locked socket from the browser)
2. Concepts 3–4 → Practice 2 (a Zustand store: numbers that move by themselves)
3. Concepts 6–7 → Practice 3 (red/green status cards and "last seen")
4. Concept 8 → Practice 4 (a 5-minute live line chart)
5. Concepts 9–10 → Practice 5 (gauges, honest visuals, and dark mode)
6. Concept 5 → Practice 6 (measure first: don't re-render 10× per second)
7. Concept 11 → Practice 7 (history of 1 hour, 24 hours, and 7 days) and Practice 8 (a paged table and CSV export)
8. Concept 12 → Practice 9 (the dashboard on a phone over home Wi-Fi) and Practice 10 (the pass tests)

Concept 5 is read **after** Practice 5, just before Practice 6: by then your dashboard has a chart and gauges that can be measured. Practice 1 already uses a small store and `useCallback`; a short explanation is there, and the full store is in Concept 4. The code pieces in the concepts only need to be read; everything is written and run in the practices.

### 1. Pushed, not asked for: live data over Socket.IO

Dashboard v0.1 **asks**. When the List or the Details appears, its effect sends one `GET`, then goes quiet. The numbers on the screen are a snapshot from when it was answered. For newer numbers you must ask again: reopen the details, or tap the **Reload** button you made in [Module 22's 🧩 Level 2](../module-22-react-basics/README.md#level-2--a-reload-button-fill-in-the-blanks-45-minutes).

There are three ways to make a screen follow new readings:

| Way | Who starts it | A new reading reaches the screen | Used? |
| :--- | :--- | :--- | :--- |
| **Asking once** (v0.1, the **Reload** button) | the dashboard, when a screen opens or the button is tapped | when you ask again | only v0.1 |
| **Polling**: asking again and again with a timer (`setInterval` + `fetch`) | the dashboard, every few seconds | with the next question, so up to one interval late; almost every answer is "nothing new yet", and every tab or phone adds load to the backend | **no**, forbidden in this module; `setInterval` only moves the clock on the screen (Concept 6) |
| **Pushed** (v0.2, Socket.IO) | the dashboard connects once, then the backend sends | as soon as the backend receives a reading from the broker | **yes** |

Polling is like checking the mailbox again and again; Socket.IO is like a phone call left connected ([Module 19 Concept 1](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#1-websocket-a-phone-call-not-a-mailbox)); such an open connection is called a **socket**. Your backend has been "on the phone" since Module 19: every reading that passes the data contract is broadcast at once, before it's written to the database. `tools/live-terminal.js` listens to it in the terminal, `try-live.html` in the Quick Win listened in the browser, and this week the React dashboard listens too, with the same events.

**How fast?** In the author's research lab (the backend and the broker on the same laptop), the trip from the broker to the client took only about 3–5 milliseconds. What decides is **when the device sends**: Node 1 sends every 10 seconds, plus an **immediate send** when an important state changes, for example light turning to dark (*report-by-exception*, Module 11). That's why covering the LDR in a bright room changes the chart in about 1–2 seconds, while a slowly rising temperature only shows with the next scheduled message. The simulator has no immediate send for sensors: `temp 33` shows up with the next message (0–10 seconds), while a lamp command from Bruno triggers an immediate send.

**Module 19's events, without renaming.** A named message in Socket.IO is called an **event**. The dashboard uses the same events as Module 19's small terminal:

| Event | Direction | For whom | Content |
| :--- | :--- | :--- | :--- |
| `follow` | dashboard → backend | — | the `device_id` to follow. The backend puts your socket in that device's room ([Module 19 Concept 2](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#2-rooms-one-channel-for-each-device)), then answers `{ ok, latest }`. |
| `unfollow` | dashboard → backend | — | leave that device's room, without an answer |
| `telemetry` | backend → dashboard | only that device's room | **two** values one after another, `(deviceId, content)`, not one object |
| `status` | backend → dashboard | everyone connected | `(deviceId, status)`: `online`, `offline`, or `offline-mode` (Module 28's); only sent when a device's status changes |
| `event` | backend → dashboard | everyone connected | one new line of Module 19's event log, for example a device that disconnected or came back online; v0.2 doesn't use it yet (it's used in 🧩 Level 2) |

Three traits of these events shape this week's code:

- **`follow` requires an answer (ack).** The backend ignores a `follow` sent without an answer function. There's no error; you just never get `telemetry`. The dashboard uses `socket.timeout(5000).emitWithAck("follow", id)`: send, then wait at most 5 seconds for the answer. This Socket.IO answer only means "the backend got your request", not a device's MQTT `ack` (Module 19).
- **`latest` is the starting value.** Events only carry **new** readings. So a card isn't empty while waiting for the next message, the `follow` answer carries the last reading the backend remembers. That memory lives in the backend's RAM, so after the backend restarts it's `null` until the device sends again (the replacement is in Concept 8).
- **What's missed while disconnected isn't sent again.** Backend v1.0 doesn't keep events for a disconnected socket. Every time it connects again, the dashboard sends `follow` again and refills the 5-minute chart from the API, **once** per connection, not every few seconds; that isn't polling. Status changes during the disconnection aren't caught up ([🔬](#-technical-deep-dive-optional) *Two limits of v0.2*).

**Why not straight to the broker?** Since Module 19, the browser isn't allowed to subscribe to the broker. The dashboard only talks to the backend, which checks the data contract, drops messages from devices whose key is revoked or that aren't registered (Module 21), and checks its users' wristbands (Module 20). An MQTT client in the browser isn't used in this curriculum.

**From plain HTTP to WebSocket.** Every Socket.IO connection starts with a plain HTTP request (its address holds `transport=polling`), then upgrades to WebSocket as soon as it can. The `2probe`, `3probe`, and `5` frames in the **Network** tab during the Quick Win are the sign of that upgrade. The word polling in that address is how the library opens the connection, and its fallback route, not the dashboard asking for data every few seconds; details in [🔬](#-technical-deep-dive-optional) (*From polling to WebSocket*).

The push goes one way: from the backend to the screen. Dashboard v0.2 only sends `follow` and `unfollow`; buttons that command devices are built in Module 24. The three ways above are summed up at the top of the Concept 2 picture.

### 2. A locked socket: the same cookie, the same wristband

Since Module 20, the Socket.IO door has a guard of its own, **the hall-door guard** ([Module 20 Concept 10](../../phase-3-backend-data/module-20-user-security/README.md#10-socketio-is-locked-too-the-hall-door-takes-the-same-wristband)). Every connection starts with a **handshake** over plain HTTP, and that guard reads the `access` cookie (the 15-minute wristband) from that request. Without a wristband, it refuses with `not logged in`; a broken or expired wristband is refused with `session expired or invalid: refresh or log in again`. The `session` season pass doesn't go along to `/socket.io/` (its path is only `/auth`), so the socket relies on the wristband alone.

**`withCredentials: true` is `credentials: "include"` for the socket.** The page at `localhost:5173` and the backend at `localhost:8080` are different origins ([Module 22 Concept 9](../module-22-react-basics/README.md#9-logging-in-from-the-browser-cookies-cors-and-localhost)). Like `fetch`, Socket.IO in the browser doesn't bring cookies to another origin unless asked. One line in `src/socket.ts` (Practice 1.4) asks for it:

```ts
export const socket: Socket<ToClient, FromClient> = io(BASE, { withCredentials: true, autoConnect: false });
```

- **`withCredentials: true`**: bring the login cookies. Without it, the handshake arrives without a wristband and is answered `not logged in`, even though the device list appears, because `fetch` brings its cookies ([🚨](#-troubleshooting)).
- **`BASE`** is the one from `src/api.ts` (Practice 1.3). A page on `localhost` connects to `localhost:8080`; in phone mode, the page `http://<laptop-IP>:5173` automatically connects to `http://<laptop-IP>:8080`. The allowed origins are one list too, `CORS_ORIGIN`, for `fetch` and the socket. An origin not on the list gets an endlessly repeating `xhr poll error`, not `not logged in` (Concept 12).
- **`autoConnect: false`**: don't connect when the file loads; wait until the login succeeds.
- **`io(…)` is called once, outside any component**, so the whole dashboard uses **one** socket, however many screens are open. `Socket<ToClient, FromClient>` gives TypeScript the list of events and their content, copied from the backend (`realtime.ts`).

**Disconnecting is normal; what matters is who reconnects.** The hall-door guard only checks once, at the door, so the backend itself cuts the connection when the wristband expires. Add Wi-Fi drops and backend restarts, and the dashboard's connection will surely drop many times a day. The `disconnect` event carries a **reason**, and that reason decides the next step:

| No. | What happens | Reason in `disconnect` | Who reconnects (`src/socket.ts`) | Badge |
| :-: | :--- | :--- | :--- | :--- |
| 1 | The 15-minute wristband expires: the server disconnects exactly 900 seconds after the wristband was made | `io server disconnect` | Socket.IO doesn't reconnect by itself for this reason. The dashboard calls `refreshOnce()` (`POST /auth/refresh`), the result is `true`, then `socket.connect()`. | **Reconnecting…** → **Live** |
| 2 | The **Log out** button in this tab | `io client disconnect` | Nobody: `socket.disconnect()` first, then `POST /auth/logout` (the other way round, the server disconnects, and then the socket tries to connect again) | **Disconnected** → login screen |
| 2 | **Log out** in another tab | `io server disconnect` | `refreshOnce()` → `false` (refused) → login screen with `Your session has expired. Please log in again.` | **Reconnecting…** → login screen |
| 3 | The backend stops gracefully: **Ctrl + C** on `npm start` (on `npm run dev` on Windows: sometimes here, sometimes no. 4) | `io server disconnect` | `refreshOnce()` → `null` (the backend can't serve yet) → `socket.connect()`, then Socket.IO retries by itself every 1–5 seconds until the backend runs | **Reconnecting…** → **Live** |
| 4 | Wi-Fi drops, the backend dies suddenly (**Ctrl + C** on `npm run dev` on Windows: sometimes here, sometimes no. 3), or `--watch` restarts it | `transport close` | Socket.IO itself, with a pause of about 1 second that grows to at most 5 seconds; our code only changes the badge | **Reconnecting…** → **Live** |

One more route: **refused by the door guard** while connecting, for example because the browser has thrown the wristband away. The event is `connect_error`, and `socket.active` is `false` (Socket.IO won't try by itself). The dashboard refreshes, then connects again. If it's still refused after three refreshes in a row (for example the database is down, so the refresh ticket booth can't hand out a new wristband), the badge stops at **Disconnected** and doesn't try again. There's no "try again" button: fix the cause, then reload the page (**F5**). If `socket.active` is still `true` (the backend is down, or the page's origin isn't allowed), Socket.IO keeps trying by itself. Once connected (the `connect` event), the failure count goes back to zero, the badge shows **Live**, every device is followed again (rooms are lost at every disconnection), and the 5-minute chart is refilled from the API.

![Diagram of a locked socket: it drops, then who reconnects (Concepts 1–2); one socket for the whole dashboard, io(BASE, { withCredentials: true, autoConnect: false }). At the top, Concept 1, where new numbers come from, three panels with a browser and a backend timeline: asking once (v0.1), one GET, the numbers stay still until the screen reopens; polling (not used), asking again and again, often for nothing; and with a purple frame, pushed (v0.2), connect once, then the backend pushes telemetry events. Middle, Concept 2, the connection badge (ConnectionBadge): after logging in and socket.connect(), the amber badge Reconnecting…, then connect to the green badge Live, and Log out (cause 2) to the red badge Disconnected. Dropped for cause 1, 3, or 4 goes back to Reconnecting… to try again; refused by the door guard even after 3 refreshes ends in Disconnected. A table of the four causes, with the columns reason in disconnect, who reconnects (socket.ts), and badge. 1, the 15-minute wristband ends, the server disconnects exactly 900 seconds after the wristband was made: io server disconnect, the server disconnects on purpose and Socket.IO doesn't reconnect by itself; the dashboard calls refreshOnce() (POST /auth/refresh), result true, then socket.connect(); the author's test: one refresh; Reconnecting… then Live. 2, the Log out button in this tab: io client disconnect; socket.disconnect() first, then POST /auth/logout; Disconnected then the login screen. Log out in another tab: io server disconnect; refreshOnce() result false (refused), then the login screen with Your session has expired. Please log in again.; Reconnecting… then the login screen. 3, Ctrl+C npm start, the backend stops gracefully (Ctrl+C npm run dev on Windows: sometimes here, sometimes no. 4): io server disconnect, the server disconnects every socket; refreshOnce() result null (the backend can't answer yet), then socket.connect(), and Socket.IO retries by itself every 1–5 seconds until the backend runs again; Reconnecting… then Live. 4, Wi-Fi drops, the backend dies suddenly (Ctrl+C npm run dev on Windows: sometimes here, sometimes no. 3), or --watch restarts it: transport close; Socket.IO itself retries after about 1 second, then longer, at most 5 seconds, our code only changes the badge; Reconnecting… then Live. Bottom left, once connected again (connect): the failures-in-a-row count goes back to 0, badge Live; follow every device again with an answer (ack), because the backend loses the rooms (one channel per device) at every drop; the 5-minute chart is refilled from the API. Bottom right, refused by the door guard (connect_error), not logged in or session expired or invalid: refresh then connect again; refresh refused (false) means the login screen; refused again even after 3 refreshes means Disconnected, reload the page (F5). Bottom band: refresh first, then connect, because the Socket.IO door guard only looks at the 15-minute wristband, while /auth/refresh checks the session in the database, so a tab that has logged out doesn't connect again.](assets/socket-lifecycle.png)

**`refreshOnce()`'s three answers.** In Module 22, `refreshOnce()` only answered success or failure ([Module 22 6.5](../module-22-react-basics/README.md#65-the-wristband-expires-refresh-once-in-apits-10-minutes)). The socket needs to know **why** it failed, so Practice 1.3 makes it answer three possibilities; `request()` keeps working as before.

| Answer | Meaning | What the socket does next |
| :--- | :--- | :--- |
| `true` | the `/auth/refresh` ticket booth handed out a new wristband (200) | `socket.connect()` |
| `false` | refused (401): the season pass has run out, or that session has already **logged out** | login screen |
| `null` | the backend can't be reached, or it's having trouble (for example 500 while the database is down) | `socket.connect()`; while the backend is down, Socket.IO keeps trying by itself |

**Why refresh first, then connect?** It sounds simpler to just call `socket.connect()` whenever the server disconnects. The problem: the hall-door guard only looks at the 15-minute wristband and doesn't know you've just **logged out** in another tab; the old wristband in this tab stays valid until it expires. The `/auth/refresh` ticket booth checks the session in the database, so a tab whose session was deleted gets 401 and goes back to the login screen. With a slowed-down network (as over Wi-Fi), the "just connect" way in the author's tests left a tab that had **logged out** still **Live** in every attempt: the socket connected again before the browser threw its wristband away. "Refresh first" passed every attempt, as it did in the tests of an expired wristband, **Ctrl + C** on the backend, saving a file (`--watch`), and three failures in a row.

**The badge: stale numbers must look stale.** `ConnectionBadge` in the page header shows three connection states: **Live** (green), **Reconnecting…** (amber), and **Disconnected** (red). While the badge isn't **Live**, the numbers on the screen may be old; Practice 3 adds the text "live connection lost, these numbers may be stale" to the Details. **Ctrl + C** on the backend's `npm run dev` on Windows **sometimes** stops gracefully (log: `SIGINT received: the backend is stopping gracefully`) and **sometimes** dies suddenly without a log; in the author's tests, the dashboard recovered by itself in both cases, a few seconds after the backend was ready. You try these routes in [1.5](#15-connect-after-login-disconnect-before-log-out-connectionbadge-10-minutes) and [1.6](#16-test-the-connection-one-socket-disconnect-and-reconnect-and-log-out-10-minutes); if the badge gets stuck, open [🚨](#-troubleshooting) *The badge shows `Reconnecting…` …* or *The badge shows `Disconnected` …*.

> ⬆️ **Done reading Concepts 1–2?** Continue to [Practice 1 — A locked socket from the browser](#practice-1--a-locked-socket-from-the-browser-45-minutes). Concepts 3–4 are read before Practice 2.

### 3. `useEffect` for subscribing: add the listeners, remove them in the cleanup

In Module 22, an effect fetched data once, and its cleanup only had to set `ignore` ([Module 22 Concept 8](../module-22-react-basics/README.md#8-useeffect-and-fetch-fetching-data-after-the-screen-appears)). Subscribing is different: what the effect adds **stays alive** until it's removed. A listener you forget to remove keeps receiving events, and every time the effect runs again, a new listener is added, so every reading comes in twice, three times, and so on (remember `telemetry listeners now: 2` in 🔁 Step 3). That's why everything added has a matching remover:

| Added when the effect runs | Removed in the cleanup |
| :--- | :--- |
| `socket.on("telemetry", onTelemetry)` | `socket.off("telemetry", onTelemetry)` |
| `socket.connect()` | `socket.disconnect()` |
| `follow` for every device | `unfollow` for the same device |

This is the skeleton of the connection effect in the final `useRealtime()` (`src/socket.ts`; `…` = skipped lines):

```ts
useEffect(() => {
  if (!loggedIn) return;
  …
  function onTelemetry(deviceId: string, content: Telemetry) {
    useLiveStore.getState().receive(deviceId, content);
  }
  …
  socket.on("telemetry", onTelemetry);
  …
  socket.connect();
  return () => {
    …
    socket.off("telemetry", onTelemetry);
    …
    socket.disconnect();
  };
}, [loggedIn, onSessionExpired]);
```

The four rules this skeleton keeps:

1. **Listeners are named functions**, removed with the same function. `socket.off("telemetry")` without a function removes **every** listener of that event, including those of other parts of the dashboard.
2. **Listeners are added once, not inside the `connect` handler.** `connect` happens again at every reconnection, so a listener added there grows by one at every disconnect and reconnect. What does get sent inside `connect` is `follow`, because rooms are lost at every disconnection.
3. **`follow` always waits for an answer** (`emitWithAck` with a 5-second limit, Concept 1).
4. **Listeners only pass things on.** `onTelemetry` hands the reading to the store through `useLiveStore.getState().receive(…)`, because the socket calls listeners outside React's rendering; components read it from the store (Concept 4).

**Two effects, two jobs.** `useRealtime()` is called **once**, in `App`. The first effect (above) keeps the **connection** while logged in. The second effect keeps the **subscriptions**: `follow` for every device whose messages the backend accepts (key `active` or `no-key`), `unfollow` in the cleanup. The dashboard follows all those devices while logged in, not per screen: the backend records rooms per **socket**, not per component, so an `unfollow` from one screen would also cancel another screen's subscription. The load is small (about one event per 10 seconds per device), and the List needs them all for "last seen" anyway. This effect depends on `idList`, one **text** holding the `device_id`s separated by commas, so `follow`/`unfollow` are only repeated when the device list changes, not every time a `telemetry` arrives.

**`StrictMode`: a drill for subscriptions.** Module 22 promised this drill would become "even more valuable" this week ([Module 22's 🔬](../module-22-react-basics/README.md#-technical-deep-dive-optional)). In development mode, the connection effect runs **connect → disconnect → connect**. Because the socket is made once outside the component and the cleanup removes the listeners and disconnects, the result is still **one** connection with one set of listeners: in the author's test, the backend log recorded `GET /devices` twice, but `realtime client connected` only once ([1.6](#16-test-the-connection-one-socket-disconnect-and-reconnect-and-log-out-10-minutes)). If `io()` is created inside the effect without a cleanup, the author's research test found two sockets alive at once ([🚨](#-troubleshooting) *Every reading shows up twice …*). So don't delete `<StrictMode>`; it's the first to catch an effect that forgets to clean up after itself.

**`useCallback`: the same function at every re-render.** The list at the end of the connection effect holds `onSessionExpired`, `App`'s function that goes back to the login form. A function written plainly in a component's body is a **new** function at every `App` re-render, for example on a screen change, so the effect runs again: the connection is cut, then made again. `useCallback(…, [])` makes React hand over the **same** function every time (Practice 1.5).

### 4. One store for every screen: Zustand and selectors

One `telemetry` reading is needed in many places at once: the temperature and "last seen" on the List card, the sensor cards and gauges in the Details, a new point on the chart. In Module 22, data lived on a component's own **small whiteboard** (*state*), and shared data was moved up to the parent and handed down ([Module 22 Concept 7](../module-22-react-basics/README.md#7-state-and-usestate-a-screen-that-remembers)). For live data, that's costly: with the board in `App`, every reading re-renders `App` and all its children. React Context, React's built-in way of sharing data without handing it down level by level, is similar: every component that reads it re-renders every time its value changes (a comparison with Redux is in [🔬](#-technical-deep-dive-optional)).

**A store is a shared notice board.** **Zustand** 5.0.16 (about 0.8 kB gzip in the build) provides a **store**: one notice board outside React that any screen may read. The socket listeners write to the board through `useLiveStore.getState()`; components read it through a **selector**, a small function that only reads the line it needs. A piece of `src/store.ts`:

```ts
export const useLiveStore = create<LiveStore>()((set) => ({
  connection: "disconnected",
  …
  setConnection: (connection) => set({ connection }),
  …
  // the "status" event: the server only sends it when a device's status changes
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),
  …
}));
```

- **`create<LiveStore>()(…)`**: the double parentheses really are how it's written in TypeScript (Zustand 5); `LiveStore` is the type of the board's content and its actions.
- **Content and actions live together.** `connection`, `status`, `latest`, … are the content; `setConnection`, `setStatus`, `receive`, … are the actions that change it.
- **`set` merges, but only one level deep.** `set({ connection })` replaces `connection` and leaves the rest alone. A per-device dictionary (`status`, `latest`, …) must be **copied** first, then added to: `{ ...s.status, [deviceId]: status }`. This is Module 22's rule "hand over a new board, don't scribble on it": content changed in place isn't recognized as a change.

**Selectors: read just one line.** Two examples, from `ConnectionBadge` and from each device's card in the List:

```ts
const connection = useLiveStore((s) => s.connection);
const temperature = useLiveStore((s) => s.latest[p.device_id]?.temperature); // undefined = no reading yet; null = sensor failed
```

At every store change, Zustand runs every component's selector and compares the result with the previous one (`===`). A component only re-renders if the result is **different**. When `f00d00000001` sends, only `f00d00000001`'s card in the List re-renders; the badge and the other cards stay still. `useLiveStore()` without a selector reads the **whole** board, so its component re-renders at every message (you measure it in Practice 6).

![Diagram of one store for every screen, Zustand and selectors (Concepts 4–5): the store is a shared notice board, a selector means it only reads the line you need. Top band: example, the Device List screen is open, then a telemetry event from f00d00000001 arrives. Left, the box What fills the store, through the socket and the API: the event from the backend telemetry with f00d00000001 and the content temperature 31.2 and so on; socket.ts passes it on through useLiveStore.getState().receive(id, content); the status event (Online/Offline) to .setStatus(id, status); GET /devices in DeviceList to setDevices(list); the follow answer (starting values) to .fillLatest(id, latest). A purple arrow to the middle, the purple box store useLiveStore (src/store.ts), a shared notice board for every screen, with eight lines: connection with the value live; devices with 3 devices; status for f00d00000001 with the value online; latest for 246f28b1c7d4 with temperature 27.4; latest for a4cf12e5b7c0 with temperature 28.5; latest for f00d00000001 with temperature 31.2; lastSeen for f00d00000001 with the value Date.now(); and windows for f00d00000001 with the old points plus a new point. The last three lines, about f00d00000001, are marked purple: lines changed by this message. Note: receive() copies the old dictionary, then adds the new, that is a copy of s.latest plus the content for that id. Right, Components on the screen read through selectors, five cards: ConnectionBadge in the page header, selector s.connection, unchanged; DeviceList, the parent of the cards, selector s.devices, unchanged; DeviceCard Node 2 garden, selector the latest temperature of 246f28b1c7d4 plus the status and last seen of that device, unchanged; DeviceCard Node 1 living room, selector the latest temperature of a4cf12e5b7c0, unchanged; DeviceCard Practice living room, selector the latest temperature of f00d00000001, with a purple frame and the label re-renders. Note below: LastSeen on every card ticks by itself every second (useNow), so only that small text re-renders every second. Bottom, three boxes. Whiteboard vs notice board: state (useState) is a small whiteboard owned by one component (Module 22), while the store is a shared notice board that any screen may read and that socket.ts fills from outside React. A narrow selector, not the whole store: a check mark for useLiveStore with the selector s.connection, re-renders only when connection changes; a cross for useLiveStore() without a selector, the whole store, re-renders on every message (Practice 6). Two traps: write ?? EMPTY, not ?? with a new empty array, because a new array on every call gives a white screen (Maximum update depth exceeded); and copy, don't change, so React knows something changed. Bottom band: on the Details screen, DeviceDetails picks the latest, status, and lastSeen of that device, and connection === live; LiveChart picks that device's windows ?? EMPTY; messages from other devices don't touch that screen.](assets/store-and-selectors.png)

**Zustand 5's trap: a selector that makes a new array.** A selector must return the **same** value as long as its content doesn't change. `(s) => s.windows[id] ?? []` makes a **new** empty array every time it runs: Zustand thinks the data keeps changing, React re-renders without end, and the screen turns white with `Maximum update depth exceeded` in the **Console** tab ([🚨](#-troubleshooting)). The cure is `EMPTY`, one empty array in `src/store.ts` that is always the same ([4.1](#41-the-sliding-window-in-the-store-first-points-from-the-api-then-live-readings-15-minutes)):

```ts
const points = useLiveStore((s) => s.windows[deviceId] ?? EMPTY); // ?? EMPTY, not ?? [] (see store.ts)
```

The `idList` selector (Concept 3) uses the same trick: the `device_id`s are joined into one **text**, because a text with the same content passes `===`, while a new array never does.

**The store grows practice by practice.** Practice 1 only puts in `connection`; Practice 2 adds `devices`, `status`, and `latest` ([2.1](#21-a-shared-notice-board-in-srcstorets-devices-status-and-the-latest-readings-15-minutes)); Practice 3 adds `lastSeen`; Practice 4 adds `windows` and `EMPTY`. The content only lives in the tab's memory: nothing is saved in `localStorage`, and everything is gone when the page is reloaded. After **Log out**, the content is still there until the page is reloaded ([🔬](#-technical-deep-dive-optional) *Two limits of v0.2*).

> ⬆️ **Done reading Concepts 3–4?** Continue to [Practice 2 — A Zustand store: numbers that move by themselves](#practice-2--a-zustand-store-numbers-that-move-by-themselves-50-minutes). Skip Concept 5 for now (it waits for you after Practice 5); [Concept 6](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling)–7 are read before Practice 3.

### 5. Don't re-render 10× per second: measure first, then believe

Read this concept after Practice 5: your dashboard now has live cards, a 5-minute chart, and two gauges, so there's something to measure.

**What re-rendering is.** Every time a component's small whiteboard (*state*) or a store line it reads changes, React calls that component's function again (a *re-render*), then writes the difference to the screen. One round of writing to the screen is called a ***commit***. Once or twice per second isn't noticeable. What the Syllabus warns about is the extreme case: a device that sends 10 times per second, so its screen re-renders 10 times per second too and the phone feels sluggish. The biggest load is in the chart: at that rate, the 5-minute window holds up to 3,000 points, and Recharts draws a dot for every one of them.

**The two main re-render triggers in dashboard v0.2:**

| Trigger | How often | What re-renders |
| :--- | :--- | :--- |
| A `telemetry` event changes the store | Node 1 and the simulator: once per 10 seconds per device (immediate sends can come closer together, at most every 2 seconds) | only components whose selector reads the value that changed |
| The 1-second clock tick (`useNow`, Concept 6) | once per second | only components that use the clock: `LastSeen` and `LiveChart` |

Two design decisions keep these numbers small, and you've already written both:

- **Narrow selectors** ([Concept 4](#4-one-store-for-every-screen-zustand-and-selectors)). `ConnectionBadge` reads `const connection = useLiveStore((s) => s.connection);`, so it only re-renders when the connection changes. A wide selector like `const { connection } = useLiveStore();` means "tell me every time anything on the notice board changes": that badge would re-render at every reading, even though its text stays **Live**.
- **Only what needs to tick ticks.** The text "last seen 12 seconds ago" has to change every second, but the card and the screen don't. That's why the text is a small component of its own, `LastSeen`, with its own clock: every second, only that text re-renders. If the clock ran in `DeviceList`, the whole list would re-render every second.

***Batching* doesn't help socket messages.** React combines several state changes that happen in **one** handler, for example one click, into one re-render; that's *batching*. Socket.IO messages arrive one by one as separate tasks, so 10 messages per second still means about 10 re-renders per second for the screen that uses that number; the author's research found that only a small share happened to be combined. A narrow selector can't prevent it either, because `DeviceDetails` really has to show the new number. The cure for data that truly comes 10 times per second is ***throttle***: collect the readings, then show them at intervals, for example every 500 ms. That's material for [🔬](#-technical-deep-dive-optional) *Data 10 times per second*, not v0.2 code, because our devices only send once per 10 seconds.

**`memo` is no guarantee.** Many tutorials wrap components in `memo` right away, so React skips their re-render while their *props* stay the same. The React documentation calls it an optimization, not a guarantee, and it isn't needed as long as nothing feels slow. v0.2 doesn't use it.

**The chart animation is turned off, but not for speed.** In the author's lab, turning the line animation on made no measurable difference in commits. `isAnimationActive={false}` is kept for visual honesty: a new point mustn't look late or "slide in" from the old value (Concept 9).

**Measure first, then believe.** Guesses about speed are often wrong, so Practice 6 uses two React DevTools 8.0.0 tools (installed since Module 22):

- **Highlight updates when components render** (the **Components ⚛** tab → gear icon → **General**): a brief frame around every component that just re-rendered, from teal (rarely) to yellow-orange (often).
- **Profiler ⚛**: record a few seconds, then read the number of commits and how many times each component rendered.

The absolute numbers depend on the laptop, the browser, and the mode (the kitchen or the ready-to-serve dish); trust the **comparison** under the same conditions. In the author's lab (the kitchen, Edge, the details screen, a 10-second recording), the real rate gave about 3 commits per second, almost all from the clock tick; a fake load of 10 readings per second raised it to about 18–23, with `DeviceDetails` rendering about 8–10 times per second; and a wide selector made `ConnectionBadge` render 104 times in 10 seconds, against 0 times with a narrow selector.

> ⬆️ **Done reading Concept 5?** Continue to [Practice 6 — Measure first: don't re-render 10× per second](#practice-6--measure-first-dont-re-render-10-per-second-25-minutes). [Concept 11 — History from buckets](#11-history-from-buckets-three-ranges-a-paged-table-and-csv) is read before Practice 7.

### 6. Time on the screen: WIB time, relative time, and a tick that isn't polling

Dashboard v0.2 writes times in two ways. **Absolute time** (`updated at 16:33:54 WIB`, the label `16:30` under the chart) answers "when". **Relative time** (`last seen 12 seconds ago`) answers "how long ago", the more important question for a live dashboard.

**Absolute time: always WIB, through `Intl`.** Since Module 22, `wibTime()` has used `toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" })`, so the device's UTC `ts` (ending in `Z`) is always written in WIB, whatever the laptop's or the phone's time zone. In Practice 3 that function moves to `src/time.ts`; Practice 4 adds `wibHourMinute()` for the chart labels (`16:27`); its text formatters (`Intl.DateTimeFormat`) are made once, then reused.

The trap: many tutorials use date-fns's `format()`, which writes the time in the **laptop's zone**. On the author's research laptop, set to UTC+8, `format()` printed `11:15:42` for a reading at `10:15:42 WIB`. Readers in WITA/WIT, or with a laptop in the wrong zone, would see shifted times. So date-fns is only used for relative time and to compute "5 minutes ago" (`subMinutes`, Concept 8).

**Relative time: date-fns in English.** This is `relativeTime()` in `src/time.ts` ([3.1](#31-a-ticking-clock-and-relative-time-srctimets-15-minutes)):

```ts
export function relativeTime(t: number, now: number): string {
  if (now - t < 5000) return "just now";
  return formatDistanceStrict(t, now, { addSuffix: true });
}
```

- `formatDistanceStrict` (no `locale` option: English is date-fns' default) writes exact numbers: `45 seconds ago`, `3 minutes ago`. Its sibling `formatDistance` is too coarse for a dashboard: 5 seconds become `less than a minute ago`, and 45 seconds `1 minute ago`.
- Under 5 seconds we write `just now`. Without that, a reading that has just arrived says `0 seconds ago`, and a server clock slightly ahead of the phone's can make it `in 2 seconds`.
- `now` is handed down from the tick (below), so this text and the stale mark (Concept 7) are counted from the same clock in one render.

**Whose clock?** Three clocks are in play:

| Time | Whose clock | Used for |
| :--- | :--- | :--- |
| `ts` in every reading | the **device's** clock (the ESP32 through NTP since Module 10; the simulator uses the laptop's clock) | `updated at … WIB` and where a point sits on the chart |
| `last_seen` from `GET /devices` | the **server's** clock, when the backend last heard that device | the starting value of "last seen" |
| `Date.now()` | the **browser's** clock (laptop or phone) | when a `telemetry` event arrives, the tick, and the edge of the 5-minute window |

"Last seen" deliberately doesn't use `ts`: it records when the device was **heard**, not when its sensors were read. The store keeps the newer of two sources (Practice 3): the server's clock when the list loads, or the browser's clock when a `telemetry` arrives. Because these clocks are compared with each other, **the laptop's and the phone's clocks must be automatic**: turn on automatic time on both. A clock difference makes the `… ago` text wrong or shifts the chart points ([🚨](#-troubleshooting) *The time on the screen is off by an hour or more…*).

**The tick: a ticking clock, not polling.** The text "12 seconds ago" has to grow by itself even when there's no new data. `useNow()` copies the `useTime` pattern from the React documentation ([Warm-up Step 4](#step-4--a-ticking-clock-setinterval-and-clearinterval-not-polling) already tried it without React):

```ts
export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer); // cleanup: stop the ticking when the component leaves the screen
  }, [everyMs]);
  return now;
}
```

Every second, `setInterval` only reads the browser's clock and writes a small whiteboard; not a single request goes to the backend. That's the difference from the polling forbidden since Module 22: polling asks the server again and again, while the tick only recomputes the text on the screen. New data still only comes through Socket.IO. Each component using `useNow()` runs its own timer (`LastSeen` on every card, then `LiveChart` in Practice 4), and the cleanup removes it when the component leaves the screen. The pull request template ([➕ C](#c-add-the-module-23-items-to-the-pull-request-template)) guards this: `setInterval` may only exist in `src/time.ts`.

Browsers slow down timers in a tab hidden behind others, so `… ago` there can lag for a moment. That's normal; in the tab you're looking at, it's right.

### 7. Alive isn't always fresh: status, last seen, and stale data

A card that says `Online` doesn't necessarily have fresh numbers. That's why every card in the Device List answers three different questions, each with its own mark:

| Question | Its source | The mark on the card |
| :--- | :--- | :--- |
| Still connected to the broker? | the `online`/`offline` status (the MQTT last will, Module 11) | a green `Online` or red `Offline` badge, and a left card edge in the same color |
| When was it last heard? | `last_seen`, then `telemetry` events (Concept 6) | `last seen 12 seconds ago` |
| Are the numbers still fresh? | how long it's been quiet, compared with its device kind's send schedule | `· stale data` in amber |

**The status comes from the last will.** Since Module 11, the broker publishes an `offline` last will when a device's connection drops: if Node 1's USB cable is unplugged, `offline` shows up about 13–23 seconds later; if the simulator is stopped with **Ctrl + C**, `offline` shows up almost at once. Backend v1.0 passes it on as a `status` event to **every** dashboard, but **only when the status changes**; the initial status comes from `GET /devices`. In the author's lab, **Ctrl + C** on the simulator turned the card red `Offline` in ≤ 1.5 seconds, `· stale data` appeared about 30 seconds after the last reading, and the simulator started again turned the card green `Online` about 0.2 seconds later.

**Why the status alone isn't enough.** `online` only means "the connection hasn't dropped yet". Node 2 is even more misleading: it has no MQTT connection of its own, so its status is published by Node 1 and means "Node 1 still hears Node 2". Node 2 sends every 5 minutes and is only declared `offline` after 16 minutes without a packet; if Node 1 itself dies, Node 2 still says `online`. So freshness is measured separately, **per device kind** ([3.2](#32-redgreen-badges-last-seen-and-stale-data-15-minutes)):

```ts
export function staleAfter(kind: Kind): number {
  return kind === "node2" ? 16 * MINUTE : 30 * 1000;
}
```

Node 1 and the simulator send every 10 seconds, so 30 seconds without news means 3 missed messages. Node 2 uses the number of its `offline` rule, 16 minutes. Past that limit, `LastSeen` adds `· stale data`.

**Color always comes with text.** `Online` is green and `Offline` red (in Module 22, `offline` was still gray), and the left edge of a List card follows both. The others, `offline mode` (Module 28's) and `unknown`, stay neutral. The badge's text keeps the status readable for people who find red and green hard to tell apart (Concept 9).

**The key beats the status.** The backend ignores messages from a device whose key is revoked or that isn't registered (Module 21), so its stored status is frozen, may stay `online`, and no events come. As in Module 22, its card has **no** status badge. Now it also has a neutral edge, says `messages ignored by the backend`, and isn't checked for staleness; its "last seen" is still shown as it is.

**Status and readings are two separate events.** Right after turning `Online` again, a card still says `last seen 1 minute ago · stale data` until the first message (≤ 10 seconds). The connection badge stands guard too: while it isn't **Live**, the numbers in the Details are dimmed with the note `live connection lost, these numbers may be stale`.

You test all this in [3.3](#33--stop-the-sender-the-card-turns-red-then-green-again-10-minutes): stop the sender, the card turns red, then green again.

**A v0.2 limit.** A `status` event that passes while the socket is disconnected isn't sent again. The author ran into it: the backend restarted just as the simulator started, and the card stayed red `Offline` for at least 90 seconds though new readings came every 10 seconds; **F5** fixed it. Details in [🔬](#-technical-deep-dive-optional) *Two limits of v0.2*.

> ⬆️ **Done reading Concepts 6–7?** Continue to [Practice 3 — Red/green status cards and "last seen"](#practice-3--redgreen-status-cards-and-last-seen-40-minutes). [Concept 8 — A live line chart](#8-a-live-line-chart-the-5-minute-sliding-window) is read before Practice 4.

### 8. A live line chart: the 5-minute sliding window

The chart in Device Details shows **the last 5 minutes** and slides by itself. Picture a train window: new scenery enters on the right, the old leaves on the left, and the frame is always 5 minutes wide. Node 1 and the simulator send every 10 seconds, so that window holds about 30 points.

**Three steps fill the window** ([4.1](#41-the-sliding-window-in-the-store-first-points-from-the-api-then-live-readings-15-minutes)):

1. **The first points from the API.** The store only collects points since the dashboard connected, yet the database already holds the readings of the last 5 minutes. `getReadingsSince(id, 5)` asks for `GET /devices/<id>/readings?from=…`. Its time is `subMinutes(new Date(), 5)` (date-fns: now minus 5 minutes), written through `toISOString()` so it ends in `Z` and is safe to put in an address (a time in the `+07:00` zone must be written `%2B07:00`, because a `+` in an address is read as a space). The author's research: 30 readings in 10–19 ms. The result is handed to `fillWindow()`.
2. **New points from the socket.** Every `telemetry` event reaches `receive()` in the store, which adds one point. Nothing is asked of the server: this is Concept 1's "pushed".
3. **Trim and tidy.** Both go through one function in `src/store.ts`, the twin of [Warm-up Step 2](#step-2--a-5-minute-sliding-window-add-filter-and-drop-duplicates):

```ts
function merge(old: Point[], incoming: Point[]): Point[] {
  const cutoff = Date.now() - FIVE_MINUTES; // the browser's clock; the points' ts use the device's clock
  const sorted = [...old, ...incoming].filter((p) => p.t >= cutoff).sort((a, b) => a.t - b.t);
  return sorted.filter((p, i) => i === 0 || p.t !== sorted[i - 1].t); // once sorted, double points are always next to each other
}
```

`merge()` copies the old array instead of changing it (Concept 4), drops what's older than 5 minutes, sorts, then drops double points: the same reading can arrive twice, from the API **and** from the socket. The first points are fetched again every time the badge returns to **Live**, because the server doesn't resend messages that passed while the connection was down; points already there aren't recorded twice.

**Drawing honestly.** Four choices in `LiveChart` ([4.2](#42-livechart-a-time-axis-wib-times-and-no-animation-20-minutes)):

- **The time axis is a number**, not a category: `XAxis type="number"` holds `t` in milliseconds, with a `domain` of exactly the last 5 minutes. Recharts' default (`category`) spaces the points evenly, yet an immediate send, for example after a lamp command from Bruno, can come only a few seconds after the previous point. With a number axis, the distance on the screen equals the real time difference.
- **Labels at every whole minute**: `ticks={ticksEvery(start, now, MINUTE)}`. Without that list, Recharts picks label positions itself every second, and the labels jump (a minute vanishes, then reappears). The author watched the version with the list for 195 seconds: the labels only changed at a new minute.
- **Gaps are left open.** More than 25 seconds without a reading means at least 2 missed messages, so `insertGaps()` inserts an empty point (`null`) and the line breaks there. In the author's lab, a simulator stopped for about 40 seconds turned the line into two segments. Why that matters: [Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors).
- **No animation** (`isAnimationActive={false}`): the default 1.5-second animation makes a new point look late.

The vertical axis follows the chosen quantity: **Temperature** (°C, a scale that follows the data), **Light** (0 = dark, 4095 = bright; needed for the LDR pass requirement), and **Humidity** (0–100%). The simulator randomizes light at every message, so its Light line is jagged; that's just the data. The chart's width follows the screen through the `responsive` prop (not `ResponsiveContainer`), so it fits on a 375 px phone screen.

![Diagram of a live chart with the 5-minute sliding window (Concept 8): first points from the API, new points from the socket, the old end cut off; example f00d00000001, illustrative numbers. A line chart Temperature (°C) with a vertical axis from 28 to 32 and a time axis labeled at every whole minute 16:22, 16:23, 16:24, 16:25, 16:26, and 16:27. The left part before 16:22:10 has a gray background: six empty round points joined by a dashed line, the points cut off because they are older than 5 minutes. The rest has a light purple background: the 5-minute window that is drawn. Navy points are the first points from the API (database), purple points are live points from the telemetry event. A gray dashed vertical line labeled screen opened 16:25:40 separates the first points from the live points; a purple vertical line at the right edge is labeled now 16:27:10 WIB. In the middle of the chart is a gap with no points and no line, labeled gap 73 seconds (more than 25 seconds): the line is not joined. On the right, one purple point that came only 6 seconds after the previous one is labeled immediate send (Bruno: lamp), so the spacing is uneven. A gray note under the line: the simulator picks a random 25–33 °C for every message, so the line on your screen will be more jagged. Legend: cut off, older than 5 minutes; first points from the API (database); live point from the telemetry event; the 5-minute window (what is drawn). Below the chart, four numbered boxes with arrows. 1 First points: when the screen opens or is back to Live, getReadingsSince(id, 5) calls GET …/readings?from=…Z, about 30 readings, then fillWindow(), which also fills the card numbers if latest is still empty. 2 A new point: a telemetry event arrives, receive() adds one point, without asking the server (no polling). 3 Cut and tidy up: merge() copies, drops what is older than 5 minutes, sorts, and drops duplicate points (the same ts); the result is always a new array. 4 Draw honestly: X axis type=number for real time spacing, ticks every minute, a gap of more than 25 seconds becomes a null point, and isAnimationActive={false}. Bottom notes: two different clocks, the points use ts from the device's clock while the window's edge uses the browser's clock (Date.now()); messages sent during a drop are not sent again by the server, so the first points are loaded again every time the badge is back to Live; Node 2 sends every 5 minutes, so its live chart would almost always be empty and isn't shown, its chart is in History.](assets/sliding-window-5-minutes.png)

**Two clocks again.** The window's edge uses the browser's clock, while the points use `ts` from the device's clock (Concept 6). If the device's clock runs ahead, a new point hides past the right edge until the browser's clock catches up; if it's more than 5 minutes behind, the point is thrown away at once. The store also only drops old points when a new one comes, so `LiveChart` itself checks for any point in the last 5 minutes; if not, it writes `No readings in the last 5 minutes.` (or `Waiting for the live connection…` while the badge isn't **Live** yet).

**The starting values of the cards and gauges.** The chart and the cards must agree, so the order is:

1. The `follow` answer carries `latest`, the last reading the backend remembers (Practice 2).
2. After the backend restarts, its memory is empty (`latest` is `null`), yet the database still holds readings. So `fillWindow()` also fills the card numbers from the last of the first points, **only** if the cards have no numbers yet, and without inventing the empty columns. The state of the lamp, fan, pump, and curtain isn't stored in the database, so their cards only appear with the next message.
3. Only if even the 5-minute window is empty does the Details write `No reading from this device since the backend started. …`

Without step 2, the screen could say "no reading yet" while its chart holds points. In the author's lab, after the backend restarted, `follow` was answered `{"ok":true,"latest":null}`, but 1.5 seconds later the Details already showed `updated at 14:32:07 WIB`, the time of the last reading in the database.

**Node 2 without a live chart.** Node 2 sends every 5 minutes, so its 5-minute window is almost always empty. Node 2's Details has no `LiveChart`, just one explanatory sentence (from Practice 7 on, that sentence points to the History screen). Without a window, Node 2's starting values only come from `follow`: after the backend restarts, its Details shows a neutral message until Node 2 sends again.

> ⬆️ **Done reading Concept 8?** Continue to [Practice 4 — A 5-minute live line chart](#practice-4--a-5-minute-live-line-chart-55-minutes). Concepts 9–10 are read before Practice 5.

### 9. Honest visuals: scale, units, gaps, and status colors

The eye reads the **picture** before the number. A water-tank gauge whose arc is full reads as "the tank is full", even if `14%` is written in its middle. A smooth line reads as "the data is complete", even if the device was off for two minutes. Such a chart is more dangerous than plain numbers, because you trust it without reading. The Syllabus calls this task "choosing honest visuals (scale, units, status colors)": **the picture must say the same thing as its numbers**. Dashboard v0.2 keeps seven rules.

**1. Write the gauge's scale: 0–100%.** Recharts has no gauge component; we build one from a half-circle `RadialBarChart`. Without a fixed scale, Recharts measures the arc against its own data. The data is just one value, so that value becomes the end of the scale, and the arc is **always full**: in the author's lab, gauges at 32% and 41% were both full. The cure is one line in `Gauge.tsx`:

```tsx
<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
```

`domain={[0, 100]}` means a full arc = 100%, and `tick={false}` hides the scale numbers around the arc. In [5.1](#51-gauge-wrong-first-then-honest-15-minutes), you first write the gauge without this line on purpose, to see the misleading arc yourself. Because its scale is fixed and its number is always written in `%`, a gauge is only used for percentages whose limits really are 0–100: **soil moisture** and **the water tank**. Temperature has no clear upper limit, and light is an ADC number from 0 to 4095, not a percentage, so both stay cards and charts.

**2. A unit on every number, and a deliberate axis scale.** Is the number `30` a temperature, a percentage, or what? Cards, gauges, tooltips, and chart titles always carry their unit (`°C`, `%`), and light gets the caption `Light (0 = dark, 4095 = bright)`. The Y axis is chosen deliberately too. The humidity and soil axes are always 0–100 and the light axis 0–4095, so small ups and downs don't look like spikes. The temperature axis, though, **follows its data** and doesn't start at 0: a 1–2 °C difference inside a house matters, and a 0–40 °C axis would flatten it. That's allowed, as long as the unit is written in the title (`Temperature (°C)`) and the axis numbers can be read. (Honest time distances, through a number X axis, were covered in [Concept 8](#8-a-live-line-chart-the-5-minute-sliding-window).)

**3. Gaps aren't joined, in both charts.** A line chart connects every point to the next. If the simulator is off for two minutes, the last point before is joined straight to the first point after: one straight line that looks as if it held data. In the author's lab, the first version of the live chart did exactly that for a gap of 2 minutes 21 seconds. The cure is a small function, `insertGaps()`: if the distance between two points in a row goes over a limit, it inserts one empty point (`null`) between them, and Recharts breaks the line at a `null` point (`connectNulls` defaults to `false`). The limits:

| Chart | A gap if the distance is more than | Meaning |
| :--- | :--- | :--- |
| Live 5 minutes ([4.2](#42-livechart-a-time-axis-wib-times-and-no-animation-20-minutes)) and History 1 hour | 25 seconds | two 10-second messages missed |
| History 24 hours ([7.3](#73-the-history-screen-devicehistorytsx-and-historycharttsx-25-minutes)) | 22.5 minutes (1.5 × a 15-minute bucket) | a bucket without readings |
| History 7 days | 1.5 hours (1.5 × a 1-hour bucket) | a bucket without readings |

History needs this rule because the backend doesn't send empty buckets at all ([Concept 11](#11-history-from-buckets-three-ranges-a-paged-table-and-csv)). After `insertGaps()` was added, the line in the author's lab broke exactly at the gap.

**4. Color always comes with text.** Many people find it hard to tell red and green apart, so color never works alone. You met the green `Online` and red `Offline` badges in Concept 7. The same rule applies to the gauges: a water tank below 20% turns amber and writes `low (below 20 %)` as well.

**5. Empty is written `—`, not 0.** A sensor that failed to read sends `null` (rule 7 of the data contract). Zero is a real reading, for example truly dry soil, so `null` is written `—`: on the cards (since Module 22), in the middle of a gauge (its arc empty), and in the History table. In the CSV, it becomes an empty cell.

**6. Stale numbers look stale.** Numbers no longer updated still look convincing, so their staleness is written: `· stale data` after 30 seconds without a message (Node 2: 16 minutes), and cards and gauges dimmed with the note `live connection lost, these numbers may be stale` while the badge isn't **Live** ([Concept 7](#7-alive-isnt-always-fresh-status-last-seen-and-stale-data)).

**7. Animation off.** By default, Recharts animates every change for about 1.5 seconds: arcs and lines "slide" from the old value. Meanwhile the screen draws numbers the device never sent, and a new point looks late. So every `Line` and `RadialBar` uses `isAnimationActive={false}`. The reason is honesty, not speed: in the author's lab, turning animation on didn't add re-renders measurably (Concept 5; you can try it in Practice 6).

![Diagram of honest visuals: four misleading and honest pairs (Concept 9) about scale, gaps, status colors, and stale numbers; the numbers are only examples. Each pair has a left panel with a red pill misleading and a right panel with a green pill honest. Pair 1, gauges, the scale must be written: two half-circle Soil moisture gauges reading 14 %. The misleading arc is full from end to end, with the note without a scale, the arc is measured against its own value, so it is always full. The honest arc fills only a little on the left, with the note PolarAngleAxis type=number, domain 0 to 100, tick={false}. Pair 2, gaps are not joined: two line charts with a left and a right group of points. The misleading one uses a long straight line across the gap, with the note the simulator was off for 2 minutes, but a straight line looks like data. The honest line breaks and the gap reads no data, with the note a gap of more than 25 seconds (in History 24 hours and 7 days: more than 1.5 × the bucket width) gets a null point, so the line breaks, in the live chart and History. Pair 3, status colors always come with text: two device cards, Node 1 living room with a green edge and Practice living room with a red edge. The misleading one only uses a green and a red dot, with the note red and green only are hard to tell apart for people who are color-blind. The honest one adds an Online badge with last seen just now, and an Offline badge with last seen 20 seconds ago; its note: the color always comes with text, Online or Offline + last seen. Pair 4, stale numbers must look stale: the details screen of Practice living room, with updated at 16:20:05 WIB above the cards Temperature 30.2 °C and Humidity 71 %. The misleading one shows everything clearly, with the note the connection dropped, but the old numbers still look fresh. The honest one shows the amber badge Reconnecting…, fades everything, and writes updated at 16:20:05 WIB · live connection lost, these numbers may be stale; its note: the card is faded and labeled, and in the List and Details · stale data appears after more than 30 seconds (Node 2: more than 16 minutes). Bottom band, also honest: a unit on every number (°C, %, light 0–4095); null is written as —, not 0; the temperature axis may start above 0 if its unit is written; chart animation is off (isAnimationActive={false}) so a new number doesn't slide in from the old value.](assets/honest-visuals.png)

Some of these rules have been in your code since Practices 3–4: status colors and text, stale numbers, and the gaps and turned-off animation in `LiveChart`. Practice 5 adds honest gauges, and Practices 7–8 use the same rules for History.

### 10. Dark mode: following the phone's and the laptop's setting

At night, the dashboard's white screen is glaring, especially on a phone. Most phones and laptops have a **dark theme** setting, and the browser tells every page about that choice through the CSS feature **`prefers-color-scheme`**. Dashboard v0.2 simply **follows it**: no button, and nothing stored.

**Tailwind is ready.** In Tailwind v4, the `dark:` prefix reads `prefers-color-scheme` by default, without a single line of configuration. As with `sm:` in Module 22, a class without a prefix always applies, and a `dark:` class overrides it in the dark theme. Every background and text color gets a partner, for example `bg-white dark:bg-slate-800` for a card and `text-slate-800 dark:text-slate-100` for a heading. Two additions in `index.html`: `<html lang="en" class="scheme-light dark:scheme-dark">` asks the browser to darken the parts it draws itself too, such as scrollbars and form fields, and `<body class="bg-slate-100 dark:bg-slate-900">` darkens the page background.

**Recharts doesn't know `dark:`.** Charts and gauges are drawn as SVG (pictures made of lines and shapes put together by code) with Recharts' default colors: axis text `#666`, gauge track `#eee`, and a white tooltip with a `#ccc` border. Tailwind classes don't touch those colors, so in the dark theme the gauge track and the tooltip stay glaringly bright. The cure is **CSS variables** that change their own values, in `src/index.css`:

```css
:root {
  --grid-color: var(--color-slate-200);
  --panel-color: var(--color-white);
  --track-color: var(--color-slate-200);
}

@media (prefers-color-scheme: dark) {
  :root {
    --grid-color: var(--color-slate-700);
    --panel-color: var(--color-slate-800);
    --track-color: var(--color-slate-700);
  }
}
```

The chart components use the variable's name, not its color: grid lines and axes `stroke="var(--grid-color)"`, the tooltip background `var(--panel-color)`, and the gauge track `var(--track-color)`. Axis text uses `fill: "currentColor"`, the text color of its container (`text-slate-500 dark:text-slate-400`), so it changes too. The data lines and gauge arcs deliberately keep their colors in both themes: they're marker colors and stay readable on a dark background.

**The trap: write the full color name.** Tailwind only includes the color variables whose names are written out in full in the code. In the author's research, `var(--color-sky-500)` written out in full made it into the built CSS, while an assembled name, for example `` `var(--color-${color}-500)` ``, didn't. That's why every chart color is written out in full. The symptom of breaking this rule is in [🚨](#-troubleshooting) *Dark mode: black chart lines or text on a dark background*.

**Why no light/dark button?** A button needs three things: `@custom-variant` in the CSS (from then on, `dark:` stops following the system setting), a small script in `<head>` so the page doesn't flash white, and **a place to remember the choice**, which in Tailwind's official example is `localStorage`. A theme choice isn't a secret, but this week's safety rules and `frontend/README.md` have already promised: nothing at all in `localStorage`. Rather than make an exception, v0.2 follows the system. How to build the button is in [🔬](#-technical-deep-dive-optional) *A manual theme button*.

In [5.3](#53-dark-mode-dark-classes-and-chart-colors-20-minutes), you add `dark:` classes to Module 22's screens and imitate the dark theme through DevTools without changing the laptop's setting; in [9.6](#96-dark-mode-on-the-phone-and-a-phone-that-falls-asleep-10-minutes), you try it on the phone. An honest note: the author tested it with an emulated dark theme in Edge. Colors from CSS variables inside SVG haven't been tried in Safari on an iPhone.

> ⬆️ **Done reading Concepts 9–10?** Continue to [Practice 5 — Gauges, honest visuals, and dark mode](#practice-5--gauges-honest-visuals-and-dark-mode-45-minutes). Afterwards, go back to [Concept 5](#5-dont-re-render-10-per-second-measure-first-then-believe) before Practice 6.

### 11. History from buckets: three ranges, a paged table, and CSV

The live chart draws every reading, because five minutes are only about 30 points. Seven days of Node 1 readings (every 10 seconds) are already about 60,000, yet a chart on a phone is only a few hundred pixels wide, and the backend sends at most **1,000** readings per request. You built the answer in Module 18: **buckets** ([Module 18 Concept 3](../../phase-3-backend-data/module-18-timescaledb/README.md#3-time_bucket-time-buckets)). All the readings in one time span go into one bucket, then only its summary is sent: the average, lowest, highest, and number of readings. One bucket = one point on the chart.

**One range, one bucket size.** The longer the range, the bigger the bucket, so the number of points stays in the hundreds:

| Button | Request | One point | Points | Read from |
| :--- | :--- | :--- | :---: | :--- |
| **1 hour** | `GET /devices/:id/readings` | one raw reading | about 360 | `readings` (raw readings) |
| **24 hours** | `…/readings?bucket=15m` | a 15-minute bucket | 97 | `readings`, grouped on request |
| **7 days** | `…/readings?bucket=1h` | a 1-hour bucket | 169 | the `readings_hourly` summary book |

97 = 24 × 4 + 1 and 169 = 7 × 24 + 1, because the start of the range is rounded down to the start of a bucket and the bucket in progress counts too. The 7-day axis labels fall at every 00:00 WIB (the start of a WIB day). All three buttons use the **API's defaults**, without `from` and `to`, so they're free of the `+07:00` trap that has to be written `%2B07:00` in an address. The 7-day history is fast because the backend only has to read 169 rows of the summary book ([Module 18 Concept 5](../../phase-3-backend-data/module-18-timescaledb/README.md#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk)), not tens of thousands of raw readings: on the author's laptop, the answer usually takes only a few tens of milliseconds ([7.4](#74--the-7-day-history-loads-in-under-1-second-10-minutes) measures it).

![Diagram of history from buckets: one range, one bucket size (Concept 11), with the API's defaults, without from/to; the longer the range, the bigger the bucket. Top, three cards. Card 1 hour, ±360 points: GET …/readings, raw readings one every 10 seconds, drawn as a dense row of small dots, 1 point = 1 reading; 1 hour ÷ 10 seconds = ±360 readings, turned into the summary shape in the browser (toSummaryPoint()); source: readings (raw readings). Card 24 hours, 97 points: GET …/readings?bucket=15m, 15-minute buckets with average, lowest, highest; a picture of groups of small dots bracketed into one purple point, ±90 readings (every 10 seconds) become 1 summary point; 24 hours × 4 buckets + 1 = 97, because the first bucket is rounded down and the bucket that is still running counts too; source: readings, computed when asked. Card 7 days with a purple frame, 169 points: GET …/readings?bucket=1h, 1-hour buckets with average, lowest, highest; ±360 readings (every 10 seconds) become 1 summary point; 7 days × 24 buckets + 1 = 169; pass requirement: the 7-day history loads in less than 1 second (measured in Practice 7); source: readings_hourly (summary book). Arrows from the first two cards to the blue box readings and from the third card to the blue box readings_hourly. The readings box: raw readings, one row per message (Module 17); a TimescaleDB hypertable, split per day, raw readings kept for 90 days (Module 18); 1 hour uses the raw readings as they are; 24 hours is grouped when asked with time_bucket 15 minutes; a limit of 1,000 readings or buckets per request, all three ranges far below it; the summary book on the right is made from this table, every hour is summarized once, so the 7-day history only reads 169 rows, not tens of thousands of raw readings. The readings_hourly box: the summary book per hour (Module 18), filled by the clerk every 30 minutes, last 3 days only; old data (npm run seed-history) needs CALL refresh_continuous_aggregate('readings_hourly', now() - INTERVAL '8 days', now() - INTERVAL '1 hour'); red text: without it the 7-day chart can have only 2 points, then (after the clerk has run) only the last 3 days filled in. Below, what one summary point (SummaryPoint) holds, the same for all three ranges: time, avg_temp, min_temp, max_temp, avg_humidity, avg_soil, avg_light, and reading_count, with the six quantity columns highlighted purple, then the text only 4 quantities; temperature, air humidity, soil moisture, and light only, while pressure, battery, water tank, and motion aren't in the summary history. Bottom band: the table and the CSV use the same answer, 7 days = 169 rows, 24 rows per page, newest first (Page 1 of 8); Download CSV is made in the browser with a comma separator, a decimal point, and a BOM, for Excel with English settings.](assets/buckets-per-range.png)

**Five traits of the history answer** (backend v1.0, unchanged):

- **Only four quantities are summarized**: temperature (average, lowest, highest), humidity, soil moisture, and light, plus the number of readings per bucket. Air pressure, battery, the water tank, and motion aren't there, so the History screen only offers those four quantities (Node 2 without Light) and says so: `The summary history only keeps temperature, humidity, soil moisture, and light.` The 1-hour raw readings are turned into the same summary shape in the browser (`toSummaryPoint()`), so the chart, the table, and the CSV only need to know one shape.
- **Empty buckets aren't sent.** An hour without readings has no row at all, so the chart inserts its gap itself (Concept 9).
- **An average hides spikes.** A brief 33 °C vanishes inside a one-hour average. That's why the 24-hour and 7-day Temperature charts are drawn with three lines: a thick average, and dashed lowest and highest. A way to thin out points while keeping their original shape is in [🔬](#-technical-deep-dive-optional) Downsampling.
- **At most 1,000 per request.** Raw readings beyond that are cut: the backend sends the 1,000 **oldest** with `truncated: true` (a request for more than 1,000 buckets is refused). Our three ranges are far below that; a way to load more, a little at a time, is in [🔬](#-technical-deep-dive-optional) *Keyset pagination*.
- **The summary book must be refreshed after old data comes in.** The automatic clerk only re-summarizes the last 3 days, every 30 minutes. Old readings that come in all at once (`npm run seed-history`) don't necessarily show in the 7-day History before an 8-day `CALL refresh_continuous_aggregate(…)`: in a database that has been in use for a while, the chart may hold only 2 points. The recipe is in [🧰](#-what-you-need) and [7.1](#71-prepare-7-days-of-data-and-check-it-in-bruno-10-minutes).

**A paged table, done by the browser.** The API has no paging (`limit`, `offset`, or page numbers). No problem: one range is only hundreds of rows (1 hour about 360), and they're all in the browser already. `HistoryTable` reverses a copy (the API always sends oldest first; the table shows **newest first**), then cuts it into **24 rows per page**: one full day of hourly history. 169 rows become `Page 1 of 8`, and the last page holds one row. Changing pages sends no new request, so `loaded in … ms` still measures one request. Thousands of rows shown at once need another approach ([🔬](#-technical-deep-dive-optional) *Virtualized list*).

**CSV made by the browser, for Excel with English regional settings.** The backend has no CSV route, yet the data is already on the screen. So `src/csv.ts` builds the text from the same answer, then asks the browser to save it as a file, without a server. It holds every row of that range, not just the visible page, oldest first. Its format follows Excel's habits with English settings:

- **A comma separator (`,`) and a decimal point (`28.5`).** Excel splits CSV columns with the Windows list separator (Microsoft documentation); English (US/UK) settings use `,` as the list separator and a point as the decimal mark.
- **A BOM at the start of the file**: an invisible mark that tells Excel the content is UTF-8, so that special characters, for example `é` or `°` in a device name, don't look garbled.
- **Lines end in CRLF, and a value that contains `,`, `"`, or a line break is wrapped in quotes** (quotes inside are doubled), following the CSV rules described in RFC 4180, which also uses commas.
- **WIB times** such as `2026-10-17 16:00:00`, and a file name such as `history-f00d00000001-7days-2026-10-24.csv`.

The first two lines of a 7-day CSV in the author's lab:

```text
time_wib,device,avg_temp_c,min_temp_c,max_temp_c,avg_humidity_percent,avg_soil_percent,avg_light,reading_count
2026-10-17 16:00:00,Practice living room,30,29.5,30.4,75,43.3,1392.3,6
```

The table on the screen and the CSV both use a decimal point (`29.5`), like the sensor cards. If your Excel uses a decimal comma (for example Indonesian or many European regional settings), it expects `;` between columns and decimal commas (`28,5`), so open this file with **Data → Get Data → From File → From Text/CSV** and choose the **Comma** delimiter. An honest note: the file's content was checked byte by byte in the lab, but the author has no Excel to open it. In [8.3](#83-open-the-csv-file-and-compare-it-with-the-table-5-minutes), you're the one who tries it; if everything piles up in one column, see [🚨](#-troubleshooting) *The CSV opens as one column in Excel*.

> ⬆️ **Done reading Concept 11?** Continue to [Practice 7 — History of 1 hour, 24 hours, and 7 days](#practice-7--history-of-1-hour-24-hours-and-7-days-55-minutes), then [Practice 8 — A paged table and CSV export](#practice-8--a-paged-table-and-csv-export-40-minutes). Concept 12 is read before Practice 9.

### 12. A phone over home Wi-Fi: phone mode and laptop mode

The pass requirement says "the chart **on your phone**". Until Practice 8, your dashboard only opens on the laptop itself, and that's on purpose: since Module 16 the backend has only listened on `127.0.0.1`, and Vite only serves `localhost`. Module 22 put the phone experiment in 🔬 as an option; this week the steps are official. The React code doesn't change at all; only **how the backend and Vite are run** changes, and that is switched on per session.

**One Wi-Fi, many addresses** (a recap of [Module 10 Concept 1](../../phase-2-connectivity/module-10-wifi-and-http/README.md#1-the-home-network-router-ip-address-and-mac-address)). The router hands out an IP address to every device on the home Wi-Fi, like house numbers in one neighborhood: the laptop is, say, `192.168.1.10` (this module's example; your IP will differ), your phone another number. The phone knocks on the laptop through **the laptop's Wi-Fi IP**, not `localhost`, because to the phone, `localhost` is the phone itself. A laptop can have several adapters (Wi-Fi, WSL, VPN), each with an IP, but the phone only reaches the Wi-Fi one. That IP is lent by the router, so it can change tomorrow.

**The door it listens on: `HOST`.**

| `HOST` in `backend/.env` | Who can knock on the backend | Notes |
| :--- | :--- | :--- |
| `127.0.0.1` (default) | only the laptop itself | **laptop mode** |
| `0.0.0.0` | every address of the laptop, including `127.0.0.1` and the Wi-Fi IP | **phone mode**; the log writes one `Server listening at …` per address |
| `192.168.1.10` | only through the Wi-Fi IP | **wrong**: `localhost:8080` is refused (`ECONNREFUSED`), and the dashboard on the laptop loses its connection |

Vite has the same switch: `npm run dev` serves `localhost` only, while `npm run dev:phone` (= `vite --host`) listens on every address. `vite.config.ts` isn't changed, so its default stays safe. The database isn't opened along with them: it stays `127.0.0.1:5432`, and only the backend uses it.

**A new origin, still one site.** The page `http://192.168.1.10:5173` on the phone calls `http://192.168.1.10:8080` by itself, because `BASE` in `api.ts` follows the page's host name, and the socket uses the same `BASE`. This page's origin is new, so the backend must allow it: add `http://192.168.1.10:5173` to `CORS_ORIGIN`. **That one line is used by `fetch` and Socket.IO alike.** In the author's lab, an IP removed from `CORS_ORIGIN` got the socket refused again and again (Socket.IO calls it `xhr poll error`): the badge stuck at `Reconnecting…`, the **Console** tab wrote a CORS message, and after a reload the box `Can't reach the server at http://192.168.1.10:8080. …` appeared. The **site** of an IP address is the IP itself (the port doesn't count), so `:5173` and `:8080` are one site, and the `SameSite=Strict` cookies still go along, as on `localhost`. Cookies do stick to a host name, though: a login on `localhost` doesn't count at the IP address, even on the same laptop (in the author's lab, the IP address went straight to the login screen). The phone is another browser, so there too you log in yourself ([Module 22 Concept 9](../module-22-react-basics/README.md#9-logging-in-from-the-browser-cookies-cors-and-localhost)).

**Who can knock** (continuing [Module 20's threat model](../../phase-3-backend-data/module-20-user-security/README.md#1-threat-model-who-might-mess-around-and-what-happens-then)). While phone mode is on, **every device on the home Wi-Fi** can open the login form, `/health`, `/docs`, and the Vite kitchen, which serves your source code (safe as long as the frontend holds no secrets). The data stays behind the login, the socket is locked too, and password guessers are held to 10 attempts per minute per IP. What's still missing is encryption: the dashboard is still `http://`, so passwords, wristbands, and live data travel as they are. That's why:

- **Phone mode only on a home Wi-Fi you trust**, not the Wi-Fi of a café, a campus, or a boarding house. HTTPS and access from the internet wait for Module 27.
- **On the phone, log in as viewer**: the smallest rights are enough to look (control buttons come in Module 24).
- **Windows firewall: allow Node.js only for Private networks**, and make sure your home Wi-Fi profile is **Private** (Module 10). On a network with the **Public** profile, that permission doesn't apply. It's a second layer of protection, but don't rely on it alone.

**Phone mode and laptop mode: a switch per session.** The biggest risk isn't hackers but **forgetting to switch back**, so this module names both states:

| Setting | Laptop mode (default, safest) | Phone mode (only during the session) |
| :--- | :--- | :--- |
| `HOST` | `127.0.0.1` | `0.0.0.0` |
| `CORS_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | the same, plus `,http://192.168.1.10:5173` |
| Vite | `npm run dev` | `npm run dev:phone` |
| Opened from | `http://localhost:5173` | phone: `http://192.168.1.10:5173`; the laptop stays on `localhost` |

Phone mode is switched on in [9.2](#92-the-backend-in-phone-mode-host-and-cors_origin-10-minutes) and [9.3](#93-vite-in-phone-mode-npm-run-devphone-and-the-private-firewall-setting-10-minutes), then switched back in [10.4](#104-switch-back-to-laptop-mode-5-minutes), at the end of the session and always before the laptop goes to another network. In the author's lab, once laptop mode was back, the IP address was refused at once (`ERR_CONNECTION_REFUSED`).

![Diagram of a phone over home Wi-Fi: phone mode and laptop mode (Concept 12), with the example laptop IP 192.168.1.10 (yours will differ); still http://, only on the home network. Left, the Phone card (Chrome or Safari): opens http://192.168.1.10:5173; logs in with the viewer account; cookies belong to a host name, so log in again on the phone; check first …:8080/health. From the phone two purple arrows pass the router icon home Wi-Fi (not guest Wi-Fi) to the laptop: the top arrow :5173 page to the Vite box, the bottom arrow :8080 fetch + Socket.IO to the backend box. Right, the big Laptop box with the Wi-Fi IP 192.168.1.10 (example; find it with ipconfig). Inside: the purple Vite box, npm run dev:phone, the same as vite --host, listens on every address; the line you use from its output Network: http://192.168.1.10:5173/ Wi-Fi. The green backend v1.0 box, port 8080, the content of backend/.env in phone mode: HOST=0.0.0.0 and CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173; one CORS_ORIGIN line serves fetch and Socket.IO, and this file stays out of Git. The laptop browser box: still http://localhost:5173; localhost cookies don't work on the IP address, and the other way round. The blue database (Docker) box: still 127.0.0.1:5432, only the backend uses it, the phone can't reach it; an arrow from the backend to the database. A band with a padlock: Windows firewall, allow Node.js JavaScript Runtime, Private only. Below, a settings table with the columns laptop mode (default, safest) and phone mode (only during that session). Backend HOST: 127.0.0.1, versus 0.0.0.0 (every address of the laptop). Backend CORS_ORIGIN: http://localhost:5173,http://127.0.0.1:5173, versus the same plus ,http://192.168.1.10:5173. Vite: npm run dev, versus npm run dev:phone (the same as vite --host). Windows firewall: not needed, versus allow Node.js, Private networks only. Opened from: http://localhost:5173, versus the phone at http://192.168.1.10:5173 while the laptop stays on localhost. Database: 127.0.0.1, versus 127.0.0.1 (unchanged, not opened to the Wi-Fi). Bottom, three boxes. Red, don't use HOST=192.168.1.10: the backend stops listening on 127.0.0.1, so the dashboard on the laptop can't reach it. White, the phone doesn't know localhost: to the phone, localhost is the phone itself, so always write the laptop's IP, and that IP must be in CORS_ORIGIN. Purple, end the session by going back to laptop mode before the laptop goes to another network; internet + HTTPS wait for Module 27.](assets/phone-mode-network.png)

An honest note: the author proved all the steps above from a laptop that opened its own Wi-Fi IP address, not from a real phone, and the laptop's firewall settings were deliberately left untouched ([📚](#-sources--image-credits)). A phone browser has no DevTools; to see its error messages, borrow the laptop's DevTools over a cable ([🔬](#-technical-deep-dive-optional) *Remote debugging*).

> ⬆️ **Done reading Concept 12?** Continue to [Practice 9 — The dashboard on a phone over home Wi-Fi](#practice-9--the-dashboard-on-a-phone-over-home-wi-fi-60-minutes), then [Practice 10 — The pass tests: lint, build, a dress rehearsal, and laptop mode](#practice-10--the-pass-tests-lint-build-a-dress-rehearsal-and-laptop-mode-35-minutes).

## 🔧 Step-by-step practice

Ten practices turn dashboard v0.1, which **asks**, into dashboard v0.2, which is **pushed**, step by step, in the `frontend` folder of the `mini-smart-home` repository, on a new branch, `feature/dashboard-live`; backend v1.0, the firmware, and `tools/` don't change. A practice that changes code ends with a commit to that branch, which is only merged into `main` through the "dashboard v0.2 (live)" pull request in [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home).

The state of the `frontend` folder at the end of every practice is in [`code/stages/`](code/stages/) (stage 6 is the same as stage 5, because Practice 6 only measures), and the final state of v0.2.0 is in [`code/frontend/`](code/frontend/). The stage folders have no `node_modules`, `package-lock.json`, or `README.md`: use them to compare file by file, not to replace your whole folder. The steps marked ⭐ (3.3, 4.4, 7.4, 9.5, and 10.3) are required to pass. Every practice runs on what you started in [Quick Win Step 1](#step-1--start-everything-then-log-in-to-dashboard-v01-4-minutes).

### Practice 1 — A locked socket from the browser (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and three terminals: `backend` (`npm run dev`), `frontend` (Vite), and one free terminal for Git and npm (laptop path: the Quick Win broker and simulator keep running); **Docker Desktop** (`smarthome-db`); and **Chrome** or **Edge** with DevTools (the **Network** and **Console** tabs). Concepts used: 1–2 (a glimpse of 4).

This practice moves the Quick Win socket into the React dashboard the right way: **one** connection for the whole app, opened after the login with the same cookies, recovering by itself after a disconnection, and closed before **Log out**. Its state shows in the dashboard header as a **Live**, **Reconnecting…**, or **Disconnected** badge. The numbers on the cards start moving in Practice 2. The code at the end of this practice: [`code/stages/practice-1/frontend/`](code/stages/practice-1/frontend/).

#### 1.1 Prepare the `feature/dashboard-live` branch (5 minutes)

In the free terminal (the `mini-smart-home` folder), switch to the latest `main`, then create a branch for all of Module 23's work:

```text
git switch main
git pull
git switch -c feature/dashboard-live
```

`git pull` fetches dashboard v0.1 from the Module 22 pull request. Then run `git status`: its answer must be `nothing to commit, working tree clean`. If `frontend/public/try-live.html` is still listed, delete it first (Quick Win Step 5). Then go into the dashboard folder:

```text
cd frontend
```

#### 1.2 Install five packages at their written versions (5 minutes)

First stop Vite in the `frontend` terminal (**Ctrl + C**) so it restarts later with the new packages. Then, in that free terminal (the `frontend` folder), install all five packages of this week at once: the socket (this practice), the store (Practices 1–2), relative time (Practice 3), and the charts and gauges (Practices 4–5; `react-is` is Recharts' partner). You only need the internet once.

```text
npm install socket.io-client@4.8.4 zustand@5.0.16 recharts@3.10.1 react-is@19.3.1 date-fns@4.4.0
```

**Expected output (example):**

```text

added 50 packages, and audited 95 packages in 13s

14 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

It takes a few seconds to a few minutes (the author's very busy laptop once recorded `10m`), without any warning line. `dependencies` in `package.json` now has five new lines, for example `"socket.io-client": "^4.8.4"`; npm adds the `^`, and the exact version is recorded in `package-lock.json`. `"version"` stays `0.1.0` until Practice 10. Run `npm run dev` again in the `frontend` terminal and check that the dashboard still opens at `http://localhost:5173`.

#### 1.3 Share `BASE` and `refreshOnce` from `api.ts` (5 minutes)

The socket in 1.4 needs two things from Module 22's `src/api.ts`: the backend address `BASE` (the socket must connect to the **same** address as `fetch` so the cookies go along) and [`refreshOnce()`](../module-22-react-basics/README.md#65-the-wristband-expires-refresh-once-in-apits-10-minutes). Both are still hidden inside `api.ts`, so put `export` in front of them. Open [`code/stages/practice-1/frontend/src/api.ts`](code/stages/practice-1/frontend/src/api.ts) on GitHub, click **Copy raw file**, then paste it over everything in your `src/api.ts`. `BASE` only gains `export` and one comment. `refreshOnce()` changes a little more: it's exported and now tells **two** failures apart (the `refreshInFlight` variable above it is now typed `Promise<boolean | null> | null` too):

```ts
// Module 23: exported for socket.ts, and it now tells two failures apart: false = REFUSED by the backend (401: the season
// pass has run out, or already logged out), null = the backend can't serve right now (down, unreachable, or another problem).
export function refreshOnce(): Promise<boolean | null> {
  if (refreshInFlight === null) {
    // no body, so also NO JSON Content-Type (if one is given, the backend answers 400)
    refreshInFlight = fetch(BASE + "/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => {
        if (res.ok) return true; // 200 = the new wristband is already on in the browser
        if (res.status === 401) return false; // refused: the season pass has run out, or already logged out
        return null; // another code, for example 500 while the database is down: the session hasn't necessarily expired
      })
      .catch(() => null) // fetch failed completely: the backend is down or can't be reached
      .finally(() => {
        refreshInFlight = null; // done: next time a refresh is allowed again
      });
  }
  return refreshInFlight;
}
```

`true` = a new wristband is on. `false` = **refused** (401: the season pass has run out, or you've already **logged out**, maybe in another tab); only this one means "back to the login". `null` = the backend **can't serve** (down, unreachable, or 500 while the database is down); your session hasn't necessarily expired, so the socket just tries again. In Module 22, any failure was `false`. `request()` isn't changed, because `null` still counts as a failure in the condition `&& (await refreshOnce())`. For the socket, it matters: a restarting backend mustn't kick you out to the login screen. Save (**Ctrl + S**); the dashboard runs as before.

#### 1.4 One socket for the whole app: `src/socket.ts` (10 minutes)

**Step 1 — The event types.** TypeScript needs the event names and their content, so a typo such as `telemetri` is underlined in red right away. Open [`code/stages/practice-1/frontend/src/types.ts`](code/stages/practice-1/frontend/src/types.ts) on GitHub, click **Copy raw file**, then paste it over everything in your `src/types.ts`. The only new part is one block at the end of the file, `// ---- Module 23: Socket.IO events …`, copied from the types in the backend (`backend/src/services/realtime.ts`), so the event names are exactly Module 19's. `ToClient` holds the events from the server to the dashboard:

```ts
// events from the server to the dashboard. The values come one after another, not as one object: telemetry carries TWO values (deviceId, content).
export type ToClient = {
  telemetry: (deviceId: string, content: Telemetry) => void;
  status: (deviceId: string, status: "online" | "offline" | "offline-mode") => void;
  event: (event: SavedEvent) => void;
};
```

Those two values are exactly the `42["telemetry","f00d00000001",{…}]` frame of the Quick Win. `FromClient` is the other direction: `follow` (with a `FollowAnswer` that carries `latest`) and `unfollow`, both used from Practice 2 on. `event` is only used in 🧩 Level 2.

**Step 2 — The socket.** Right-click the **`frontend/src`** folder → **New File…**, name it **`socket.ts`**, then type the code below (or open [`code/stages/practice-1/frontend/src/socket.ts`](code/stages/practice-1/frontend/src/socket.ts) on GitHub, click **Copy raw file**, then paste). The red line under `./store` goes away after 1.5.

```ts
// socket.ts - ONE Socket.IO connection for the whole dashboard (Module 23). Created once here, outside any component,
// so StrictMode (which mounts components twice in dev mode) doesn't create a second connection.
import { useEffect } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { BASE, refreshOnce } from "./api";
import { useLiveStore } from "./store";
import type { FromClient, ToClient } from "./types";

// The address is the SAME as in api.ts (BASE): the page http://<laptop-IP>:5173 on a phone connects to http://<laptop-IP>:8080 by itself.
// withCredentials: true = bring the login cookies to another port (the twin of credentials: "include" in fetch). Without it,
// the backend answers "not logged in" even though fetch works. autoConnect: false = only connect after the login.
export const socket: Socket<ToClient, FromClient> = io(BASE, { withCredentials: true, autoConnect: false });

// useRealtime - called ONCE in App. While logged in: connects and restores the connection.
// On logout: everything is removed. onSessionExpired = App's function that goes back to the login form.
export function useRealtime(loggedIn: boolean, onSessionExpired: () => void) {
  // Effect 1: the connection while logged in. The listeners are named functions, so the cleanup removes EXACTLY the same
  // function (socket.off(name) without a function would remove EVERY listener of that event, other parts' listeners too).
  useEffect(() => {
    if (!loggedIn) return;
    let ignore = false; // becomes true when the effect is cleaned up: a refresh result that arrives late is ignored
    let failStreak = 0; // how many times in a row we were refused even after a refresh

    // Renew the wristband (POST /auth/refresh) first, then connect again: the same pattern as tools/live-terminal.js.
    async function refreshThenConnect() {
      const result = await refreshOnce();
      if (ignore) return;
      if (result === false) onSessionExpired(); // refused: already logged out (maybe in another tab), or the season pass has run out
      else socket.connect(); // true = a new wristband is on; null = the backend can't serve yet (if it's down: Socket.IO keeps trying)
    }

    function onConnect() {
      failStreak = 0;
      useLiveStore.getState().setConnection("live");
    }
    function onDisconnect(reason: string) {
      if (reason === "io client disconnect") {
        useLiveStore.getState().setConnection("disconnected"); // we cut it ourselves (Log out): don't reconnect
        return;
      }
      useLiveStore.getState().setConnection("connecting");
      // "io server disconnect" = the server cut it ON PURPOSE: the 15-minute wristband expired, a logout in another tab, or the
      // backend was stopped gracefully. Socket.IO doesn't reconnect by itself for this reason, so we ask for it.
      // Other reasons (Wi-Fi dropped, the backend died suddenly or was restarted): Socket.IO reconnects by itself.
      if (reason === "io server disconnect") void refreshThenConnect();
    }
    function onConnectError() {
      useLiveStore.getState().setConnection("connecting");
      // socket.active = Socket.IO will still try again by itself (the backend is down, or the page's address isn't allowed)
      if (socket.active) return;
      // Refused by the Socket.IO door guard ("not logged in" or "session expired…"): the wristband expired. Refresh, then connect again.
      failStreak++;
      if (failStreak > 3) {
        useLiveStore.getState().setConnection("disconnected"); // refused again and again even after a refresh: don't loop forever
        return;
      }
      void refreshThenConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    useLiveStore.getState().setConnection("connecting");
    socket.connect();
    // StrictMode in dev mode: connect, disconnect, connect again. Still only ONE connection stays alive.
    return () => {
      ignore = true;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [loggedIn, onSessionExpired]);
}
```

Read it from the top:

- **`io(BASE, { withCredentials: true, autoConnect: false })`** runs **once**, when the file loads, outside any component. StrictMode mounts components twice, but this line doesn't repeat, so there's one socket. `withCredentials: true` = the twin of `credentials: "include"` (without it: `not logged in`); `autoConnect: false` = don't connect before the login.
- **`useRealtime(loggedIn, onSessionExpired)`**, a hook of our own called once in `App`, holds one `useEffect` "while logged in": add three listeners, then `socket.connect()`; its cleanup removes **the same three functions**, then `socket.disconnect()` (Concept 3).
- **Three listeners** handle the badge and the recovery. `connect` → **Live**. `disconnect`: the reason `io client disconnect` (we cut it ourselves, at **Log out**) → **Disconnected**; `io server disconnect` (the wristband expired, a logout in another tab, or the backend stopped gracefully) → **Reconnecting…**, then `refreshThenConnect()`; any other reason (Wi-Fi dropped, the backend died suddenly) → **Reconnecting…**, and Socket.IO reconnects by itself. `connect_error` with `socket.active` = `true` means Socket.IO is still trying by itself; `false` means the door guard refused (`not logged in` or `session expired…`), so refresh, then connect again. Still refused after three refreshes in a row → **Disconnected**.
- **`refreshThenConnect()`**: `false` → `onSessionExpired()` (the login screen); `true` or `null` → `socket.connect()`, and while the backend is down, Socket.IO keeps trying by itself. `ignore` drops a refresh answer that arrives after the effect is cleaned up.

Why refresh first? The Socket.IO door guard only checks the wristband, while `/auth/refresh` checks the session in the database. In a lab test with a slow network, the "just connect" way left a tab whose session had just been deleted from another tab still **Live**; the "refresh first" way didn't ([Concept 2](#2-a-locked-socket-the-same-cookie-the-same-wristband)).

#### 1.5 Connect after login, disconnect before Log out: `ConnectionBadge` (10 minutes)

**Step 1 — A small store for one value.** The badge must know the socket's state, yet `socket.ts`, outside any component, is what changes it. `useState` *state* (a small whiteboard) belongs to one component and can't be written from outside React. That's why we use a Zustand **store**: **a shared notice board** that anyone may write and any screen may read. For now it only needs **one** value, `connection`. Create the file **`src/store.ts`**:

```ts
// store.ts - the shared "store" of live data for the whole dashboard (Zustand). Any component reads it through a
// selector, and socket.ts fills it from outside React (useLiveStore.getState()). It only lives in this tab's memory:
// nothing is saved in localStorage, and everything is gone when the page is reloaded.
import { create } from "zustand";

// the Socket.IO connection state that the badge in the header shows
export type Connection = "connecting" | "live" | "disconnected";

type LiveStore = {
  connection: Connection;
  setConnection: (connection: Connection) => void;
};

// create<LiveStore>()(…): the double parentheses really are how it's written in TypeScript (Zustand 5).
export const useLiveStore = create<LiveStore>()((set) => ({
  connection: "disconnected",

  setConnection: (connection) => set({ connection }),
}));
```

`create<LiveStore>()(…)` makes the store and the `useLiveStore` hook at once. `socket.ts` writes through `useLiveStore.getState().setConnection(…)`, outside React; the badge reads through the **selector** `useLiveStore((s) => s.connection)`, which only reads one line of the notice board, so the badge only re-renders when that value changes. This store grows in Practice 2; the reasons and the full rules are in [Concept 4](#4-one-store-for-every-screen-zustand-and-selectors).

**Step 2 — The badge.** Create the file **`src/components/ConnectionBadge.tsx`**:

```tsx
// ConnectionBadge.tsx - the badge for the live connection state in the dashboard header: Live, Reconnecting…, or Disconnected.
// Numbers that are no longer updated must look stale, and this badge is the first sign of it.
import { useLiveStore } from "../store";
import type { Connection } from "../store";

const BADGES: Record<Connection, { text: string; color: string }> = {
  live: { text: "Live", color: "bg-green-100 text-green-800" },
  connecting: { text: "Reconnecting…", color: "bg-amber-100 text-amber-800" },
  disconnected: { text: "Disconnected", color: "bg-red-100 text-red-800" },
};

export default function ConnectionBadge() {
  // selector: take ONE value from the store. This badge only re-renders when that value changes.
  const connection = useLiveStore((s) => s.connection);
  const { text, color } = BADGES[connection];
  return <span className={"rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " + color}>{text}</span>;
}
```

Three states, three colors (green, amber, red), and **always with text**: color alone can't be read by everyone.

**Step 3 — `App` turns the socket on.** Open [`code/stages/practice-1/frontend/src/App.tsx`](code/stages/practice-1/frontend/src/App.tsx) on GitHub, click **Copy raw file**, then paste it over everything in your `src/App.tsx`. What changes: the imports of `useCallback`, `ConnectionBadge`, `socket`, and `useRealtime`; `<ConnectionBadge />` next to the `Mini Smart Home` heading; and this piece, right after the `handleLogin` function:

```tsx
  // Module 23: useCallback = the SAME function on every App render. Without it, every time App re-renders (for example
  // on a screen change), the effect that depends on handleSessionExpired runs again: the live connection is cut and made again.
  const handleSessionExpired = useCallback(() => {
    setInitialError("Your session has expired. Please log in again.");
    setUser(null);
  }, []);

  // A minimal Log out button (improved in Module 24): delete the session in the backend, then go back to the form.
  async function handleLogout() {
    // Module 23: cut the live connection FIRST (reason "io client disconnect": no reconnect), then delete the session.
    // The other way round, the server cuts us ("io server disconnect"), and then the socket tries to connect again.
    socket.disconnect();
    try {
      await logout();
    } catch {
      // the backend doesn't answer: the screen still goes back to the login form
    }
    setUser(null);
  }

  // Module 23: the live connection (Socket.IO) lives while logged in. A hook is called before any "return".
  const loggedIn = user !== null && user !== "loading";
  useRealtime(loggedIn, handleSessionExpired);
```

- **`useCallback(function, [])`** hands over the **same** `handleSessionExpired` function at every `App` re-render (in Module 22 it was made anew at every render). `useRealtime` uses it as an effect dependency: a new function means the effect runs again, and the socket disconnects and reconnects every time you switch screens.
- **`handleLogout()`** cuts the socket **first**, then `POST /auth/logout`, so the reason for the disconnection is `io client disconnect` and the socket doesn't try to connect again.
- **`useRealtime(…)`** is called before the first `return`, because hooks must be called in the same order at every render. Once `user` is filled, its effect connects; once it's back to `null`, its cleanup disconnects.

Save, then log in with the viewer account if the login form shows.

**Result:** right after logging in, a green `Live` badge appears next to the `Mini Smart Home` heading. The Device List cards are still the same as in Module 22 (status `online` in lower case, no numbers).

#### 1.6 Test the connection: one socket, disconnect and reconnect, and Log out (10 minutes)

First: click **Log out**, open DevTools (**F12**) → the **Network** tab, empty its list with **Clear network log** (🚫), click the **Socket** filter (older versions: **WS**), then log in again with the viewer account.

**Test 1 — One socket despite StrictMode.** The **Socket** filter holds only **one** row, `socket.io/?EIO=4&transport=…`.

**Expected output** (**example**, backend terminal, cut; the times, the account number, and the socket id will certainly differ):

```text
[16:28:22] INFO: POST /auth/login -> 200 (369 ms)
[16:28:22] INFO: GET /devices -> 200 (7 ms)
[16:28:22] INFO: GET /devices -> 200 (7 ms)
[16:28:22] INFO: realtime client connected: w580hr-4zvSdYSm1AAAC (account 2, viewer)
```

`GET /devices` is logged twice because StrictMode runs effects twice in dev mode, but `realtime client connected` only **once**: there's one socket. There's no `follows` line yet; `follow` only comes in Practice 2.

**Test 2 — The backend is stopped.** In the backend terminal, press **Ctrl + C** (if asked `Terminate batch job (Y/N)?`, type **Y**, then **Enter**). The badge turns `Reconnecting…` at once, and the **Console** tab adds a red line with `net::ERR_CONNECTION_REFUSED` every few seconds: Socket.IO is trying by itself. On Windows, the backend **sometimes** manages to write `SIGINT received: the backend is stopping gracefully` (the reason is `io server disconnect`, so the dashboard refreshes first), and **sometimes** goes straight back to the prompt (the reason is `transport close`); the dashboard recovers in both cases. Start it again with `npm run dev`.

**Expected output** (**example**, backend terminal, cut):

```text
[16:28:50] INFO: Server listening at http://127.0.0.1:8080
…
[16:28:55] INFO: realtime client connected: xBdv_y4pM2wTfYJLAAAA (account 2, viewer)
```

The badge is back to `Live` a few seconds after the backend is ready (on the author's laptop 4 and 16 seconds), with no click and no new login.

**Test 3 — A backend file is saved (`--watch`).** Open `backend/src/server.ts` in VS Code, add one empty line at the very end, then save. **Result:** the backend terminal writes `Restarting 'src/server.ts'`, then `realtime client connected: …`; the badge shows `Reconnecting…` for a moment, then `Live` again within a few seconds. Delete that empty line and save again.

**Test 4 — Log out from another tab.** Open a second tab in the same browser at `http://localhost:5173` (logged in at once, badge `Live`), click **Log out** in the **second** tab, then go back to the first tab.

**Result:** the first tab has already moved by itself to the login form with the box `Your session has expired. Please log in again.`, without reconnecting. In the backend terminal (**example**):

```text
[16:29:18] INFO: realtime client disconnected: jA-xwNsq_5yGe1nZAAAB (client namespace disconnect)
[16:29:18] INFO: realtime client disconnected: GaARxOOsX5glbGktAAAA (server namespace disconnect)
[16:29:18] INFO: logout: session 4
[16:29:18] INFO: POST /auth/logout -> 200 (9 ms)
[16:29:18] INFO: POST /auth/refresh -> 401 (2 ms)
```

The second tab cuts its own socket (`client`), the backend cuts the first tab's socket (`server`), then the first tab asks `/auth/refresh` and is refused (`401`). Close the second tab.

**Test 5 — The Log out button.** Log in again in the first tab, then click **Log out**.

**Expected output** (**example**, backend terminal):

```text
[16:29:35] INFO: realtime client disconnected: t0PbSIlkue4BLq7hAAAC (client namespace disconnect)
[16:29:35] INFO: logout: session 5
[16:29:35] INFO: POST /auth/logout -> 200 (13 ms)
```

The socket is cut **first**, then the session is deleted, and no new `realtime client connected` follows.

Two other states needn't be waited for. After 15 minutes, the backend cuts the socket exactly when the wristband expires; the dashboard refreshes once and connects again in the same second. The `Disconnected` badge shows up if the door guard keeps refusing after three refreshes, for example when the wristband expires while the database is down; the dashboard stops trying, so fix the cause, wait for the database, then reload the page (**F5**). A badge that never becomes `Live` is covered in [🚨](#-troubleshooting).

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` should list five changed files (`package.json`, `package-lock.json`, `src/App.tsx`, `src/api.ts`, `src/types.ts`) and three new files (`src/socket.ts`, `src/store.ts`, `src/components/ConnectionBadge.tsx`). If `../backend/src/server.ts` is listed too, run `git restore ../backend/src/server.ts`. Then save:

```text
git add package.json package-lock.json src
git commit -m "Locked socket: one live connection and a connection badge (Module 23 Practice 1)"
```

> ⬆️ **Done with Practice 1?** Your socket is locked and recovers by itself, but the numbers don't move yet: there's no `telemetry` listener and no followed device. Read [Concept 3](#3-useeffect-for-subscribing-add-the-listeners-remove-them-in-the-cleanup) and [Concept 4](#4-one-store-for-every-screen-zustand-and-selectors), then continue to [Practice 2 — A Zustand store: numbers that move by themselves](#practice-2--a-zustand-store-numbers-that-move-by-themselves-50-minutes).

### Practice 2 — A Zustand store: numbers that move by themselves (50 minutes)

> 🖥️ **Tools used:** **VS Code** with Practice 1's terminals still running (`backend` with `npm run dev`, `frontend` with Vite; on the laptop path also the broker and the simulator) plus one free terminal in the `frontend` folder for Git; **Docker Desktop** (`smarthome-db` running); **Chrome or Edge** at `http://localhost:5173` with DevTools (the **Network** tab); and **Bruno** in 2.5. Concepts used: 3–4.

After Practice 1, the badge is **Live**, but the numbers still stand still: the Details fetch the reading **once** through `GET /devices/:id/latest`, exactly as in Module 22. Module 22 promised the numbers would move by themselves in this module, and this practice keeps that promise. The path goes one way:

```text
device → broker → backend → telemetry event → onTelemetry (socket.ts) → receive() → store → selector → card
```

The listener in `src/socket.ts` writes every event to the store, the shared notice board (Concept 4), then every card only reads its own line. No button, no timer. You write two things from the Syllabus here: lightweight *state management* so the live data is available on every screen (2.1), and `useEffect` for subscribing and unsubscribing (2.2–2.3).

#### 2.1 A shared notice board in `src/store.ts`: devices, status, and the latest readings (15 minutes)

Practice 1's store only holds `connection`. Now it gets three more lines, plus the actions that fill them:

| Line | What it holds | Filled by |
| :-- | :-- | :-- |
| `devices` | the list from `GET /devices` (`null` = not loaded yet) | `setDevices`, from the Device List (2.3) |
| `status` | every device's status, keyed by `device_id` | `setDevices` (the initial status from the database), then `setStatus` from the `status` event |
| `latest` | every device's last reading, keyed by `device_id` | `fillLatest` from the `follow` answer, then `receive` from the `telemetry` event |

The file is short and almost all of it changes, so replace everything in `src/store.ts` with the code below (or open [`code/stages/practice-2/frontend/src/store.ts`](code/stages/practice-2/frontend/src/store.ts) on GitHub, click **Copy raw file**, then paste):

```ts
// store.ts - the shared "store" of live data for the whole dashboard (Zustand). Any component reads it through a
// selector, and socket.ts fills it from outside React (useLiveStore.getState()). It only lives in this tab's memory:
// nothing is saved in localStorage, and everything is gone when the page is reloaded.
import { create } from "zustand";
import type { Device, DeviceStatus, Telemetry } from "./types";

// the Socket.IO connection state that the badge in the header shows
export type Connection = "connecting" | "live" | "disconnected";

type LiveStore = {
  connection: Connection;
  devices: Device[] | null; // the GET /devices answer; null = not loaded yet
  // Partial<Record<string, …>> = a "dictionary" keyed by device_id. Partial: an entry may not be there yet (undefined).
  status: Partial<Record<string, DeviceStatus>>;
  latest: Partial<Record<string, Telemetry>>; // each device's last reading
  setConnection: (connection: Connection) => void;
  setDevices: (list: Device[]) => void;
  setStatus: (deviceId: string, status: DeviceStatus) => void;
  fillLatest: (deviceId: string, content: Telemetry) => void;
  receive: (deviceId: string, content: Telemetry) => void;
};

// create<LiveStore>()(…): the double parentheses really are how it's written in TypeScript (Zustand 5).
// set() merges the new values with the old ones, but only ONE level deep: the dictionaries inside (status, latest, …)
// must be copied by us with { ...old, [key]: value }, never changed directly.
export const useLiveStore = create<LiveStore>()((set) => ({
  connection: "disconnected",
  devices: null,
  status: {},
  latest: {},

  setConnection: (connection) => set({ connection }),

  // the list from GET /devices: the status is filled in from the database too
  setDevices: (list) =>
    set((s) => {
      const status = { ...s.status };
      for (const p of list) {
        status[p.device_id] = p.status;
      }
      return { devices: list, status };
    }),

  // the "status" event: the server only sends it when a device's status changes
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),

  // the last reading from the "follow" answer: a starting value, NOT a new message from the device
  fillLatest: (deviceId, content) => set((s) => ({ latest: { ...s.latest, [deviceId]: content } })),

  // the "telemetry" event: a new message from the device
  receive: (deviceId, content) =>
    set((s) => ({
      latest: { ...s.latest, [deviceId]: content },
    })),
}));
```

- **`Partial<Record<string, …>>`** is a dictionary: its key is the `device_id`, its value that device's status or reading. `Partial` means a value may **not exist yet** (`undefined`), so TypeScript forces everyone who reads it to handle that case (`?.temperature`, `?? p.status`, the "no reading yet" message).
- **`setDevices`** copies the `status` dictionary, fills in the initial status from the database for every device, then calls `set` **once** for the whole list. After that, the `status` event only comes when a status changes, and `setStatus` replaces one value of that dictionary.
- **`fillLatest` and `receive`** have the same body for now, but their meanings differ: the first fills the starting value from the backend's memory, the second records a **new** message. From Practice 3 on, only `receive` (not `fillLatest`) updates "last seen", and in Practice 4 only `receive` adds a live point to the chart.
- `lastSeen`, `windows`, and `EMPTY` aren't there yet; they follow in Practices 3 and 4. Everything stays in the tab's memory, not in `localStorage`.

Save (**Ctrl + S**). The screen doesn't change yet, because nothing fills or reads the new lines.

#### 2.2 The `telemetry` and `status` listeners in `useRealtime` (15 minutes)

Open [`code/stages/practice-2/frontend/src/socket.ts`](code/stages/practice-2/frontend/src/socket.ts) on GitHub, click **Copy raw file**, then paste it over everything in your `src/socket.ts`. Practice 1's connection effect (recovery, the badge, **Log out**) doesn't change. What's new: `Device`, `DeviceStatus`, and `Telemetry` in the `import type` line, three functions above `useRealtime`, one `followAll();` line in `onConnect`, two listeners, and a second effect at the very bottom (covered in 2.3).

**Three functions for following devices**, right below the `export const socket` line:

```ts
// Only devices whose messages the backend accepts are followed. Messages from a device whose key is revoked or that
// isn't registered are ignored by the backend (Module 21), so their events would never come.
function mayFollow(p: Device): boolean {
  return p.key === "active" || p.key === "no-key";
}

// "follow" MUST use an ack (an answer): without an answer function, the server quietly doesn't put us in that device's room.
async function follow(deviceId: string) {
  try {
    const answer = await socket.timeout(5000).emitWithAck("follow", deviceId);
    // latest = the last reading the backend remembers; null if the backend has only just started
    if (answer.ok && answer.latest) useLiveStore.getState().fillLatest(deviceId, answer.latest);
  } catch {
    // no answer within 5 seconds (the connection dropped halfway): followed again when it connects again
  }
}

// follow every device in the list. Rooms are lost every time the connection drops, so this is repeated on every "connect".
function followAll() {
  for (const p of useLiveStore.getState().devices ?? []) {
    if (mayFollow(p)) void follow(p.device_id);
  }
}
```

- **`mayFollow()`** only lets through the keys `active` and `no-key` (Node 2, whose data Node 1 passes on). A device whose key is revoked or that isn't registered is still answered `ok`, but its events never come, so there's no need to follow it.
- **`follow()`** waits at most 5 seconds for the answer (`emitWithAck`, Concept 1). `latest` in that answer is the last reading the backend remembers; `fillLatest` puts it in the store as the **starting value**, so the card isn't empty while waiting for the next message. No answer within 5 seconds? The `catch` stays quiet, and `follow` is repeated when it connects again.
- **`void follow(…)`**: `follow()` is an `async` function; `void` means "run it, no need to wait", so all the devices are followed at the same time.
- **`followAll()`** reads the list through `useLiveStore.getState()`, from outside React. It's called in `onConnect`, because the rooms in the backend are lost every time the connection drops: every new connection follows them all again.

**Two new listeners** inside the connection effect, together with Practice 1's three listeners:

```ts
    function onTelemetry(deviceId: string, content: Telemetry) {
      useLiveStore.getState().receive(deviceId, content);
    }
    function onStatus(deviceId: string, status: DeviceStatus) {
      useLiveStore.getState().setStatus(deviceId, status);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("telemetry", onTelemetry);
    socket.on("status", onStatus);
```

`onTelemetry` receives two values one after another, the `device_id` and then its content, exactly the `42["telemetry","f00d00000001",{…}]` frame of the Quick Win, and only passes them on to the store. `onStatus` does the same; the `status` event only comes when a device's status changes. Their partners are in the cleanup, just above `socket.disconnect()`: `socket.off("telemetry", onTelemetry);` and `socket.off("status", onStatus);` (Concept 3's add-and-remove rule).

Save. The screen is unchanged: `devices` in the store is still `null`, so `followAll()` has nothing to follow yet, and without `follow`, the backend doesn't push `telemetry` to your socket.

#### 2.3 The Device List fills the store and follows its devices (10 minutes)

**Step 1 — The list goes into the store.** Replace everything in `src/components/DeviceList.tsx` with [`code/stages/practice-2/frontend/src/components/DeviceList.tsx`](code/stages/practice-2/frontend/src/components/DeviceList.tsx) (**Copy raw file**). This component's own `devices` whiteboard (`useState`) is replaced by two selectors:

```tsx
  const devices = useLiveStore((s) => s.devices); // null = still loading
  const setDevices = useLiveStore((s) => s.setDevices);
```

Its effect still fetches `GET /devices` as in Module 22, but writes the answer to the store, so `socket.ts` knows which devices to follow too. `setDevices` goes into the effect's dependency list (`[onSessionExpired, setDevices]`); a store action never changes, so the list is still fetched once every time this screen opens.

**Every card picks its own data.** The card's content moves into a small component, `DeviceCard`, in the same file, which reads its own status and temperature:

```tsx
function DeviceCard({ p, onSelect }: { p: Device; onSelect: (device: Device) => void }) {
  const status = useLiveStore((s) => s.status[p.device_id]) ?? p.status;
  const temperature = useLiveStore((s) => s.latest[p.device_id]?.temperature); // undefined = no reading yet; null = sensor failed
```

- A selector is a hook, and hooks mustn't be called inside `map`, so every card becomes a component of its own. As a bonus, a message from `f00d00000001` only re-renders `f00d00000001`'s card (Concept 4).
- **`?? p.status`**: until a `status` event comes, use the status from `GET /devices`.
- A new line below the location: `Temperature 28.5 °C`, `Temperature —` (sensor failed), `waiting for a reading…` (no reading since the backend started), or `messages ignored by the backend` for a revoked key or an unregistered device.

**Step 2 — The second effect in `socket.ts`: follow and unfollow.** You already pasted it in 2.2; it's at the very bottom of `useRealtime`:

```ts
  // Effect 2: follow the devices in the list, unfollow them in the cleanup. This selector returns ONE text holding the
  // device_ids separated by commas ("a4cf12e5b7c0,f00d00000001"). The same text = no change, so the effect (and App) only
  // runs again when the device list really changes, not every time a telemetry arrives.
  const idList = useLiveStore((s) => (s.devices ?? []).filter(mayFollow).map((p) => p.device_id).join(","));
  useEffect(() => {
    if (idList === "") return;
    const allIds = idList.split(",");
    // not connected yet? That's fine: onConnect follows them all as soon as it connects
    if (socket.connected) for (const id of allIds) void follow(id);
    return () => {
      if (socket.connected) for (const id of allIds) socket.emit("unfollow", id);
    };
  }, [idList]);
```

This is `useEffect` for subscribing: `follow` every device when the effect runs, `unfollow` the same devices in the cleanup. If the list arrives before the socket connects, this effect sends nothing, and `onConnect` follows them all. `idList` is deliberately a **text**: a new array at every call ends in `Maximum update depth exceeded` (Concept 4), while a text with the same content passes `===`. The `?? []` inside it is safe, because what the selector returns is the text made by `join`.

Save, then press **F5** so the dashboard starts from an empty store. You stay logged in (the cookies are still there) and land on the Device List.

**Result** (**example** from the author's lab, with the simulator `f00d00000001` plus the lab's fake Node 1 and Node 2; `Temperature 33 °C` is left over from an earlier `temp 33` test, yours is random, 25–33 °C; each card's text is read in order, though the screen lays it out over several lines):

```text
Node 2 garden online via linking device garden · 246f28b1c7d4 Temperature 27.4 °C
Node 1 living room online key active living room · a4cf12e5b7c0 Temperature 28.5 °C
Test device (intruder) key revoked workbench · c0ba00000001 messages ignored by the backend
Practice living room online key active living room · f00d00000001 Temperature 33 °C
```

Leave it for about 30 seconds: the temperature of **Practice living room** changes by itself about every 10 seconds. The backend terminal writes one `client … follows …` line for every followed device (three in the author's lab: `246f28b1c7d4`, `a4cf12e5b7c0`, and `f00d00000001`), none for the intruder device. Laptop path: the card of a device that has never sent (Node 1 and Node 2, if they're in your list) says `waiting for a reading…`. Your list may also hold **Practice porch** (`f00d00000002`, not registered since Module 21) with `messages ignored by the backend`; in the author's lab its card only appeared in 7.1.

> [!TIP]
> The badge says **Live**, but every card stays at `waiting for a reading…`? Check `follow` and `onConnect` in [🚨](#-troubleshooting) *The badge says `Live`, but the numbers don't move*.

#### 2.4 Device Details reads from the store (5 minutes)

The Details don't need to ask anymore: the latest reading of every followed device is already in the store.

1. Replace everything in `src/components/DeviceDetails.tsx` with [`code/stages/practice-2/frontend/src/components/DeviceDetails.tsx`](code/stages/practice-2/frontend/src/components/DeviceDetails.tsx) (**Copy raw file**). `useEffect`, three whiteboards (`reading`, `error`, `noReadingYet`), and `getLatest()` are gone, replaced by three selectors:

   ```tsx
     // Narrow selectors: this component only re-renders when a value of THIS device changes.
     const reading = useLiveStore((s) => s.latest[id]); // undefined = no reading yet
     const status = useLiveStore((s) => s.status[id]) ?? device.status;
     const live = useLiveStore((s) => s.connection === "live");
   ```

2. In `src/App.tsx`, delete the line `onSessionExpired={handleSessionExpired}` inside `<DeviceDetails … />`; the one inside `<DeviceList … />` stays. The Details don't ask the backend for anything, so there's no 401 for them to report.
3. In `src/api.ts`, delete the `getLatest()` function at the very bottom together with the two comment lines above it, then change the top `import type` line to `import type { Device, User } from "./types";`. In `src/types.ts`, delete the `LatestReading` type together with the comment `// the GET /devices/:id/latest response` above it. Not sure? Copy those three files whole from [`code/stages/practice-2/frontend/src/`](code/stages/practice-2/frontend/src/).

The Details pick one content, in this order:

- **There's a `reading`**: cards as in Module 22, below the line `node1 · online · updated at … WIB`, whose status now follows the store.
- **None yet, because of the key**: the not-registered message (the same as Module 22) or the revoked one still comes first. The revoked message is now shorter, and the red box above it ends `… so the dashboard doesn't follow it.`
- **None yet, and the badge isn't Live**: `Waiting for the live connection…`, because the starting value comes through the `follow` answer, and `follow` is only sent after connecting.
- **None yet, even though it's Live**: usually the backend has just restarted, so the `follow` answer carries `latest` as `null`. The message is `No reading from this device since the backend started. The numbers appear by themselves as soon as the device sends (Node 1: within 10 seconds; Node 2: 5 minutes).`, and this time you don't need to open the Details again.

So at this stage the starting values come from the `follow` answer. Practice 4 adds a second source, the last reading of the 5-minute chart's first points ([4.1](#41-the-sliding-window-in-the-store-first-points-from-the-api-then-live-readings-15-minutes)), so the Details don't say "no reading yet" while the database still holds one.

Save all the files, then open **Practice living room** (device path: **Node 1 living room**).

**Result (example):** the content shows at once, without `Loading the reading…`: the line `node1 · online · updated at 16:33:05 WIB`, then eight cards, from **Temperature** (still `33` °C in the lab, left over from the earlier test) to **Lamp** `Off` and **Fan** `Off`. In the **Network** tab, opening the Details no longer adds a `latest` row: the numbers have been in the store since the List. About 10 seconds later, without a click, the numbers and the `updated at …` time change.

#### 2.5 Test: `temp 33` and the lamp from Bruno (5 minutes)

Leave the Details of **Practice living room** open (device path: **Node 1 living room**), then test both ways a message travels.

**A scheduled message: `temp 33`** (laptop path). In the simulator terminal, type `temp 33`, press **Enter**, then watch the **Temperature** card.

**Result (example):** the simulator terminal shows what you typed and its answer

```text
temp 33
Temperature: 33.0 °C
```

and the **Temperature** card becomes `33` °C with the **next** message, without a click. In the author's lab, three attempts took 4.9, 3.9, and 4.6 seconds from **Enter**. The delay depends on the time left until the next scheduled message (every 10 seconds), so 0–10 seconds is normal, at most about 11 seconds. Set it back with `temp random` (the simulator answers `Temperature: random 25.0-33.0 °C`).

The device path has no `temp 33` command: just watch Node 1's numbers change about every 10 seconds. Covering the LDR is tried in [4.4](#44--the-line-moves-by-itself-temp-33-the-lamp-or-the-ldr-10-minutes), together with its chart.

**An immediate send: the lamp from Bruno** (both paths).

1. In Bruno (the `backend/bruno` collection, environment `local`), send **`login admin`**: a viewer may only read, while commands to a device need an admin (Module 20). Bruno keeps its own cookies, so the dashboard stays logged in as viewer.
2. Open **`lamp on`**. Laptop path: in its URL, replace `a4cf12e5b7c0` with `f00d00000001` (don't press **Ctrl + S**). Click **Send** while glancing at the **Lamp** card in the dashboard.
3. Do the same with **`lamp off`**.
4. Close both request tabs. If the `Unsaved changes` dialog appears, click **Don't Save**.

**Result (example):** Bruno answers `200` holding the command's `id`, `wait_ms`, and `ack` with `ok` set to `true` and the new `lamp` state. The **Lamp** card changes `Off` → `On`, then `On` → `Off`, practically together with Bruno's answer: in the author's lab 0.01–0.07 seconds after the request was sent. Laptop path: the simulator terminal records every command:

```text
f00d00000001: command c-20261024-093423-1 -> ok=true
f00d00000001: command c-20261024-093429-2 -> ok=true
```

Bruno's command-line version isn't installed on the lab laptop, so the author sent the same requests (address, body, and admin account) by script; the Bruno panel itself wasn't recorded.

**Why is the lamp so much faster?** As soon as an actuator changes, the device sends `telemetry` at once without waiting for the 10-second schedule (an immediate send, since data contract 1.3), while `temp 33` waits for the next scheduled message. The first pass requirement uses this fast route in [4.4](#44--the-line-moves-by-itself-temp-33-the-lamp-or-the-ldr-10-minutes), this time with the chart line.

Want to see the messages? Open DevTools' **Network** tab → the **Socket** filter → the `socket.io/?EIO=4…` row → the **Messages** tab (as in Quick Win Step 4). Each of those changes arrived as `42["telemetry","f00d00000001",{…}]`, and the other followed devices' `telemetry` keep coming too, even though only one Details screen is open.

**Save to the branch.** In the free terminal (the `frontend` folder), run `npm run lint`; its output must include `Found 0 warnings and 0 errors.` Then `git status`: seven files changed (`src/App.tsx`, `src/api.ts`, `src/types.ts`, `src/store.ts`, `src/socket.ts`, and both components), no new files. Save:

```text
git add src/store.ts src/socket.ts src/api.ts src/types.ts src/App.tsx src/components/DeviceList.tsx src/components/DeviceDetails.tsx
git commit -m "Zustand store: numbers that move by themselves (Module 23 Practice 2)"
```

The code at the end of this practice is in [`code/stages/practice-2/frontend/`](code/stages/practice-2/frontend/). Leave everything running if you're continuing right away.

> ⬆️ **Done with Practice 2?** The numbers in the List and the Details now move by themselves, but the cards don't yet say how fresh they are, and the `offline` status still has a gray badge. Read [Concept 6](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling) and [Concept 7](#7-alive-isnt-always-fresh-status-last-seen-and-stale-data), then continue to [Practice 3 — Red/green status cards and "last seen"](#practice-3--redgreen-status-cards-and-last-seen-40-minutes).

### Practice 3 — Red/green status cards and "last seen" (40 minutes)

> 🖥️ **Tools used:** **VS Code** with Practice 2's terminals (`backend`, Vite in `frontend`, and one free terminal in the `frontend` folder for Git; laptop path: the broker in `edge` and the simulator in `tools`), **Docker Desktop** (`smarthome-db`), and **Chrome or Edge** at `http://localhost:5173`. Device path: Node 1 with a USB cable that's easy to unplug. Bruno isn't used. Concepts used: 6–7.
>
> ⭐ **Required** — step 3.3: stop the sender, watch its card turn red and "last seen" keep growing until `stale data`, then start it again until the card is green.

The numbers on your dashboard already move by themselves, but the cards don't yet answer Concept 7's two questions: **how long has it been quiet**, and **are its numbers still fresh**? This practice turns the badges into a green `Online` and a red `Offline` (the card's left edge takes the color too), then adds the text `last seen … ago`, which grows by itself, and the `· stale data` mark. There are no new requests to the backend: the status still comes through the `status` event, readings through `telemetry`, and the seconds on the screen are counted by the browser's clock.

#### 3.1 A ticking clock and relative time: `src/time.ts` (15 minutes)

Many components need the clock: the List and Details cards here, the chart in Practice 4, History in Practice 7. So it's all gathered in one file.

**Step 1 — A new file.** In VS Code, right-click the **`frontend/src`** folder → **New File…**, name it **`time.ts`**, then type the code below (or open [`code/stages/practice-3/frontend/src/time.ts`](code/stages/practice-3/frontend/src/time.ts) on GitHub, click **Copy raw file**, then paste):

```ts
// time.ts - clock matters on the screen: WIB time, "… seconds ago", the stale-data limit, and the 1-second tick.
import { formatDistanceStrict } from "date-fns";
// date-fns writes English by default ("45 seconds ago"), so no locale is imported
import { useEffect, useState } from "react";
import type { Kind } from "./types";

export const MINUTE = 60 * 1000; // in milliseconds, the unit Date.now() uses

// useNow - a ticking clock (the useTime pattern from react.dev). A component that uses it re-renders every second,
// so the text "12 seconds ago" keeps growing. This is a CLOCK, not polling: there's no request to the server.
export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer); // cleanup: stop the ticking when the component leaves the screen
  }, [everyMs]);
  return now;
}

// "16:27:10 WIB", whatever the time zone of the laptop or phone (timeZone written out, as in Module 22)
export function wibTime(t: string | number): string {
  return new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }) + " WIB";
}

// relativeTime - "45 seconds ago", "3 minutes ago" (date-fns in English, its default language).
// Under 5 seconds it writes "just now": date-fns would write "0 seconds ago", and a server clock that runs slightly
// ahead of the phone's clock can make the gap negative ("in 2 seconds").
export function relativeTime(t: number, now: number): string {
  if (now - t < 5000) return "just now";
  return formatDistanceStrict(t, now, { addSuffix: true });
}

// When a reading counts as stale. Node 1 and the simulator send every 10 seconds: 30 seconds without news = 3 missed messages.
// Node 2 sends every 5 minutes and only counts as offline after 16 minutes (DATA-CONTRACT.md).
export function staleAfter(kind: Kind): number {
  return kind === "node2" ? 16 * MINUTE : 30 * 1000;
}
```

Its content is explained in [Concept 6](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling) and [Concept 7](#7-alive-isnt-always-fresh-status-last-seen-and-stale-data):

- **`useNow()`**: a clock that ticks every second; the `clearInterval` cleanup removes it when the component goes. **Not polling**: no request to the backend.
- **`wibTime()`**: moved from `DeviceDetails.tsx`, and now also accepts a number of milliseconds.
- **`relativeTime()`**: `just now` under 5 seconds, then `45 seconds ago`, `3 minutes ago`.
- **`staleAfter()`**: 30 seconds for Node 1 and the simulator (three missed messages), 16 minutes for Node 2.

**Step 2 — `wibTime` moves house.** Open `src/components/DeviceDetails.tsx`. Delete the `wibTime` function with its comment (the four lines above `type Props`), then add this import below the `import type { … } from "../types";` line:

```ts
import { wibTime } from "../time";
```

Save (**Ctrl + S**). The Details screen doesn't change; `updated at … WIB` is still there: the function only moved house. If VS Code underlines `wibTime` in red, the import isn't there yet or the old function hasn't been deleted.

#### 3.2 Red/green badges, last seen, and stale data (15 minutes)

Four files change and one is new, in order from the notice board to the screen.

**Step 1 — The store records "last seen".** Open [`code/stages/practice-3/frontend/src/store.ts`](code/stages/practice-3/frontend/src/store.ts) on GitHub, click **Copy raw file**, then paste it over everything in your `src/store.ts`. What's new: the `lastSeen` dictionary (milliseconds per `device_id`, `{}` at first), filled by two actions. In `setDevices` (the `GET /devices` answer):

```ts
        if (p.last_seen !== null) {
          // take the newer one: the server's clock in the database, or the browser's clock when the last telemetry arrived
          lastSeen[p.device_id] = Math.max(lastSeen[p.device_id] ?? 0, Date.parse(p.last_seen));
        }
```

In `receive` (the `telemetry` event) there's one new line: `lastSeen: { ...s.lastSeen, [deviceId]: Date.now() },`.

- **Two clocks: take the newer one.** `last_seen` uses the **server's** clock (UTC text, turned into milliseconds by `Date.parse`), `Date.now()` the **browser's**. `Math.max` makes sure a list that's loaded again doesn't turn the time back.
- **`fillLatest` doesn't touch it**: the `follow` answer is only a starting value from the backend's memory, not a sign that the device was just heard.

**Step 2 — A new component, `LastSeen`.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`LastSeen.tsx`**, then type it (or copy it from [`code/stages/practice-3/frontend/src/components/LastSeen.tsx`](code/stages/practice-3/frontend/src/components/LastSeen.tsx) with **Copy raw file**):

```tsx
// LastSeen.tsx - "last seen 12 seconds ago", plus a "stale data" mark when the device has been quiet for too
// long. This small component ticks by itself every second, so only this text re-renders,
// not the whole card or the whole screen.
import type { Kind } from "../types";
import { relativeTime, staleAfter, useNow } from "../time";

type Props = {
  t: number | undefined; // when the device was last heard from (milliseconds); undefined = never
  kind: Kind; // sets the stale limit: Node 2 really only sends every 5 minutes
  checkStale: boolean; // false for a device whose messages the backend ignores anyway (revoked, not registered)
};

export default function LastSeen({ t, kind, checkStale }: Props) {
  const now = useNow();
  if (t === undefined) return <span>never seen yet</span>;
  const stale = checkStale && now - t > staleAfter(kind);
  return (
    <span>
      last seen {relativeTime(t, now)}
      {/* "online" doesn't always mean fresh: old numbers that aren't updated must look stale */}
      {stale ? <span className="ml-1 font-medium text-amber-700">· stale data</span> : null}
    </span>
  );
}
```

- **`· stale data`** (amber, `text-amber-700`) shows up when the quiet lasts longer than `staleAfter(kind)`. `checkStale` is `false` for a device whose messages the backend ignores: its quiet is certain anyway.
- **Only this small component ticks**, not the whole card. You measure it yourself in Practice 6.

**Step 3 — Badges with text.** Open `src/components/Badge.tsx`. Replace the whole `const STATUS_COLORS …` block with this block:

```tsx
// Module 23: color ALWAYS comes with text (online green "Online", offline red "Offline"), so it can still be read by
// people who find it hard to tell red and green apart.
const STATUS_BADGES: Record<DeviceStatus, { text: string; color: string }> = {
  online: { text: "Online", color: "bg-green-100 text-green-800" },
  offline: { text: "Offline", color: "bg-red-100 text-red-800" },
  "offline-mode": { text: "offline mode", color: "bg-slate-200 text-slate-700" },
  unknown: { text: "unknown", color: "bg-slate-100 text-slate-500" },
};
```

The body of `StatusBadge` becomes `const { text, color } = STATUS_BADGES[status];`, then `return <span className={SHAPE + " " + color}>{text}</span>;`, the same as `KeyBadge` below it. `offline` is now red (Module 22: gray); `offline mode` (Module 28's; yellow before) and `unknown` are neutral. The whole file: [`code/stages/practice-3/frontend/src/components/Badge.tsx`](code/stages/practice-3/frontend/src/components/Badge.tsx).

**Step 4 — List cards with a colored edge.** Replace everything in `src/components/DeviceList.tsx` with [`code/stages/practice-3/frontend/src/components/DeviceList.tsx`](code/stages/practice-3/frontend/src/components/DeviceList.tsx) (open it on GitHub, click **Copy raw file**, paste). What's new: the imports of `DeviceStatus` and `LastSeen`, the `last` selector, `<LastSeen … />` in the card's bottom line, and the edge dictionary:

```tsx
const LEFT_EDGE: Record<DeviceStatus, string> = {
  online: "border-l-green-500",
  offline: "border-l-red-500",
  "offline-mode": "border-l-slate-400",
  unknown: "border-l-slate-300",
};
```

The card button's classes gain `border-l-4` (a 4 px left edge) and `LEFT_EDGE[status]`, or `border-l-slate-300` for a card whose messages are ignored (still without a status badge, as in Module 22). The class names are written in full in the dictionary because Tailwind only generates classes written out completely.

**Step 5 — The status line in the Details.** In the same way, replace everything in `src/components/DeviceDetails.tsx` with [`code/stages/practice-3/frontend/src/components/DeviceDetails.tsx`](code/stages/practice-3/frontend/src/components/DeviceDetails.tsx) (the 3.1 move is already included). The status moves below the heading, with the same badge as in the List:

```tsx
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
        <span>{device.kind}</span>
        <span>·</span>
        {messagesIgnored ? <span>messages ignored</span> : <StatusBadge status={status} />}
        <span>·</span>
        <LastSeen t={last} kind={device.kind} checkStale={!messagesIgnored} />
      </p>
```

The line above the sensor cards is left with `updated at … WIB`. While the connection badge isn't **Live**, the sensor cards are dimmed (`opacity-60`) and that line gets `· live connection lost, these numbers may be stale`.

Save all the files, then open the Device List.

**Result (example, the author's lab; your seconds and numbers will certainly differ):** a card that sends has a **green** left edge and the `Online` badge, with a bottom line like `Temperature 25.7 °C` · `last seen 10 seconds ago`; the seconds go up by themselves, then go back to `just now` every time a message arrives. **Test device (intruder)** has no status badge and a gray edge: `messages ignored by the backend` · `last seen 2 hours ago`. **Practice porch**: `never seen yet`. On hover, the card's whole frame turns teal, as in Module 22. The Details of **Practice living room**: `node1 · Online · last seen 10 seconds ago`.

#### 3.3 ⭐ Stop the sender: the card turns red, then green again (10 minutes)

This is the Syllabus test "red/green device status cards". Watch it in the open tab; in a background tab, the browser slows the timers down.

1. Open the Device List with the **Live** badge. The **Practice living room** card (device path: **Node 1 living room**) is green.
2. Stop its sender. **Laptop path:** click the simulator terminal, press **Ctrl + C**. **Device path:** unplug Node 1's USB cable.
3. Watch the card for one minute.
4. Start it again. **Laptop path:** in the simulator terminal, press **↑**, then **Enter**. **Device path:** plug the cable back in.
5. Wait for the first message (about 10 seconds).

**Result (example, laptop path, the Practice 3 stage code in the author's lab):**

| When | The **Practice living room** card | Left edge |
| :-- | :-- | :-- |
| before Ctrl + C | `Online` · `Temperature 25.7 °C` · `last seen 10 seconds ago` | green |
| ≤ 1.5 seconds after Ctrl + C | `Offline` · `Temperature 30.9 °C` · `last seen 5 seconds ago` | **red** |
| +15 seconds | `last seen 19 seconds ago` | red |
| +32 seconds | `last seen 36 seconds ago · stale data` | red |
| +65 seconds | `last seen 1 minute ago · stale data` | red |
| ±0.2 seconds after starting it again | `Online` · `Temperature 30.9 °C` · `last seen 1 minute ago · stale data` | **green** |
| first message, ±7 seconds later | `Online` · `Temperature 26.2 °C` · `last seen just now` | green |

**Ctrl + C** prints nothing from the simulator; the prompt comes straight back. After starting it again:

```text
PS C:\Users\you\mini-smart-home\tools> node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1
1 fake device(s) heading to mqtt://127.0.0.1:1883. Type "temp 33" or "temp random". Stop with Ctrl+C.
f00d00000001: online
```

The simulator's connection drops, the broker publishes the `offline` last will, and the backend passes it on as a `status` event: the card turns red almost at once. `Temperature 30.9 °C` **freezes**; that's why `· stale data` is needed. When it connects again, `Online` comes first and the reading follows: two separate events.

**Device path** (the author has no Kit recording for this step, [📚](#-sources--image-credits)): according to Module 11, `Offline` only appears about 13–23 seconds after the cable is unplugged: the broker waits 22.5 seconds without news from Node 1. The **Node 2 garden** card stays `Online` (Node 1 publishes its status), but its `last seen` keeps growing. Plugged in again, Node 1 turns green as soon as it's back on the Wi-Fi and the broker.

A capture of the final v0.2.0 code (its List is the same as at the end of this practice), about 30 seconds after the simulator was stopped:

![Real screenshot of a live Device List (Edge, laptop 1280 px), ±30 seconds after the simulator f00d00000001 was force-stopped (Practice 3); Node 1 and Node 2 are lab fakes. Header: Mini Smart Home, the Live badge (marker 1), Home Guest (viewer), Log out. Five cards: Node 2 garden, Online, via linking device, Temperature 27.4 °C, last seen 14 seconds ago (marker 5), green left edge; Node 1 living room, Online and a green left edge (marker 2), Temperature 28.5 °C, last seen 8 seconds ago; Test device (intruder), a red key revoked badge (marker 6), messages ignored by the backend, last seen 4 hours ago; Practice living room, Offline and a red left edge (marker 3), Temperature 26.7 °C, last seen 34 seconds ago · stale data in amber (marker 4); Practice porch, not registered, never seen yet (marker 7). Legend: 1 Live = the socket connection, not a device status; 2 Online and the green edge from the status event, the color always comes with text; 3 Offline at once through the broker's last will; 4 ticks every second, stale after more than 30 seconds of quiet; 5 the Node 2 stale limit is 16 minutes because the real Node 2 sends every 5 minutes (lab fake 15 seconds); 6 its messages are ignored, neutral edge; 7 not followed by the dashboard (Module 21).](assets/live-device-list-status.png)

**You pass this ⭐ step** when the card whose sender was stopped turns `Offline` with a red edge, its `last seen` keeps growing and then gets `· stale data`, and after the sender is started again, the card turns green `Online` again, then shows `last seen just now` as soon as the first message arrives.

> [!NOTE]
> **A card stays `Offline` even though its numbers move?** A `status` event that passes while the dashboard's socket is disconnected (for example when the backend restarts just as the sender starts) isn't sent again. Press **F5** ([🚨](#-troubleshooting) *A card stays red `Offline`, even though its numbers move*).

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` lists four changed files, plus `src/time.ts` and `src/components/LastSeen.tsx` under `Untracked files`. Then:

```text
git add src
git commit -m "Red/green status cards and last seen (Module 23 Practice 3)"
```

The code at the end of this practice is in [`code/stages/practice-3/frontend/`](code/stages/practice-3/frontend/). Leave the sender running for Practice 4.

> ⬆️ **Done with Practice 3?** Your cards are now honest about being alive and fresh. Read [Concept 8 — A live line chart](#8-a-live-line-chart-the-5-minute-sliding-window), then continue to [Practice 4 — A 5-minute live line chart](#practice-4--a-5-minute-live-line-chart-55-minutes).

### Practice 4 — A 5-minute live line chart (55 minutes)

> 🖥️ **Tools used:** **VS Code** with Practice 3's terminals (`backend`, Vite in `frontend`, and one free terminal in the `frontend` folder for Git; laptop path: the broker in `edge` and the simulator in `tools`), **Docker Desktop** (`smarthome-db`), **Bruno** (the admin account, for the 4.4 test), and **Chrome or Edge** at `http://localhost:5173`. Concepts used: Concept 8.
>
> ⭐ **Required** — step 4.4: the chart line on the laptop moves by itself, triggered by `temp 33` from the simulator, a lamp command from Bruno, or the LDR covered by a hand.

The Details cards only show the last number. This practice adds a line chart of the last 5 minutes, exactly as Concept 8 designed it: the first points from the database, new points from the `telemetry` event, the old end trimmed. Its quantities are **Temperature**, **Light** (for the LDR pass requirement), and **Humidity**. This is the first half of the pass requirement, tested on the laptop first; its phone version is in 9.5. The code at the end of this practice: [`code/stages/practice-4/frontend/`](code/stages/practice-4/frontend/).

#### 4.1 The sliding window in the store: first points from the API, then live readings (15 minutes)

Three existing files grow. For each one, open its link on GitHub, click **Copy raw file**, then paste it over everything in your file of the same name.

**Step 1 — The reading and point types** ([`code/stages/practice-4/frontend/src/types.ts`](code/stages/practice-4/frontend/src/types.ts)). One new block at the end of the file: `Reading` (one raw reading from `GET /devices/:id/readings`, 13 columns, `null` when the device doesn't have it), `ReadingsAnswer` (at most 1,000 readings, oldest first), and `Point`, one chart point: `t` (the reading's time in milliseconds, because an honest time axis needs a number) plus `temperature`, `humidity`, and `light`.

**Step 2 — The first points from the API** ([`code/stages/practice-4/frontend/src/api.ts`](code/stages/practice-4/frontend/src/api.ts)). At the top of the file, `subMinutes` from date-fns and the `ReadingsAnswer` type are imported too; at the end, one new function:

```ts
// Module 23: GET /devices/:id/readings?from=… = raw readings since some minutes ago (the live chart's first points).
export function getReadingsSince(deviceId: string, minutes: number): Promise<ReadingsAnswer> {
  // toISOString() writes UTC time ending in Z, for example 2026-10-24T03:10:00.000Z: safe to put in an address.
  // (A time in the +07:00 zone must be written %2B07:00, because a + in an address is read as a space.)
  const from = subMinutes(new Date(), minutes).toISOString();
  return request<ReadingsAnswer>("/devices/" + deviceId + "/readings?from=" + from);
}
```

It goes through Module 22's `request()`, so an expired wristband is refreshed once automatically.

**Step 3 — The window in the store** ([`code/stages/practice-4/frontend/src/store.ts`](code/stages/practice-4/frontend/src/store.ts)). The additions: the **`windows`** dictionary (chart points per device, like `latest`); **`EMPTY`** for the `?? EMPTY` selector (Concept 4's trap); **`merge()`**, the sliding window dissected in Concept 8; **`toPoint()`** and **`readingToPoint()`**, which turn a `telemetry` and a database reading into a `Point`; **`receive()`**, which now also adds one point every time a `telemetry` event arrives; and a new action, **`fillWindow()`**:

```ts
  fillWindow: (deviceId, readings) =>
    set((s) => {
      const windows = { ...s.windows, [deviceId]: merge(s.windows[deviceId] ?? EMPTY, readings.map(readingToPoint)) };
      const last = readings.at(-1); // readings come oldest first, so the last one = the newest
      const initial = last === undefined ? null : toTelemetry(last);
      if (s.latest[deviceId] !== undefined || initial === null) return { windows };
      return { windows, latest: { ...s.latest, [deviceId]: initial } };
    }),
```

The first line merges the first points with live points that may have come in earlier. The rest fills the cards' starting values (Concept 8): if `latest` is empty because the backend just started, the database's last reading is used, without inventing the empty columns (`toTelemetry()`). `lastSeen` isn't touched: this isn't a new message.

Save the three files (**Ctrl + S**). The screen doesn't change yet, because nothing calls `getReadingsSince()`; the **Console** tab still has no new red messages.

#### 4.2 `LiveChart`: a time axis, WIB times, and no animation (20 minutes)

**Step 1 — Axis labels in `time.ts`.** The file is short, so replace everything in `src/time.ts` with the code below (or open [`code/stages/practice-4/frontend/src/time.ts`](code/stages/practice-4/frontend/src/time.ts) on GitHub, click **Copy raw file**, then paste):

```ts
// time.ts - clock matters on the screen: WIB time, "… seconds ago", the stale-data limit, time-axis labels, and the 1-second tick.
import { formatDistanceStrict } from "date-fns";
// date-fns writes English by default ("45 seconds ago"), so no locale is imported
import { useEffect, useState } from "react";
import type { Kind } from "./types";

export const MINUTE = 60 * 1000; // in milliseconds, the unit Date.now() uses
export const HOUR = 60 * MINUTE;
const WIB = 7 * HOUR; // WIB = UTC + 7 hours all year round (Indonesia doesn't use daylight saving time)

// useNow - a ticking clock (the useTime pattern from react.dev). A component that uses it re-renders every second,
// so the text "12 seconds ago" keeps growing. This is a CLOCK, not polling: there's no request to the server.
export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer); // cleanup: stop the ticking when the component leaves the screen
  }, [everyMs]);
  return now;
}

// "16:27:10 WIB", whatever the time zone of the laptop or phone (timeZone written out, as in Module 22)
export function wibTime(t: string | number): string {
  return new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }) + " WIB";
}

// The time-text formatters are made ONCE here, then reused for every chart label.
const HOUR_MINUTE = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });

export function wibHourMinute(t: number): string {
  return HOUR_MINUTE.format(t); // "16:27"
}

// relativeTime - "45 seconds ago", "3 minutes ago" (date-fns in English, its default language).
// Under 5 seconds it writes "just now": date-fns would write "0 seconds ago", and a server clock that runs slightly
// ahead of the phone's clock can make the gap negative ("in 2 seconds").
export function relativeTime(t: number, now: number): string {
  if (now - t < 5000) return "just now";
  return formatDistanceStrict(t, now, { addSuffix: true });
}

// When a reading counts as stale. Node 1 and the simulator send every 10 seconds: 30 seconds without news = 3 missed messages.
// Node 2 sends every 5 minutes and only counts as offline after 16 minutes (DATA-CONTRACT.md).
export function staleAfter(kind: Kind): number {
  return kind === "node2" ? 16 * MINUTE : 30 * 1000;
}

// ticksEvery - where the time-axis labels go: every multiple of "step" (minutes, hours, or days on the WIB clock) between
// start and end. Without this predefined list, Recharts picks the label spots itself, and the labels jump as the chart moves.
export function ticksEvery(start: number, end: number, step: number): number[] {
  const ticks: number[] = [];
  for (let t = Math.ceil((start + WIB) / step) * step - WIB; t <= end; t += step) ticks.push(t);
  return ticks;
}
```

Three things are new: `HOUR` and `WIB` (7 hours in milliseconds) below `MINUTE`; `wibHourMinute()`, the short label `16:27` from an `Intl` formatter made only once; and `ticksEvery()` at the end, which gives the position of every whole minute inside the window, for example `16:30` to `16:34`. Adding and subtracting `WIB` makes the rounding follow WIB time, not UTC (History in Practice 7 needs labels at exactly 00:00 WIB).

**Step 2 — The component.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`LiveChart.tsx`**, then type the code below (or open [`code/stages/practice-4/frontend/src/components/LiveChart.tsx`](code/stages/practice-4/frontend/src/components/LiveChart.tsx) on GitHub, click **Copy raw file**, then paste). The red line under `./Picker` goes away once that file is created in 4.3.

```tsx
// LiveChart.tsx - a line chart of one device's last 5 minutes. Its first points come from the database (GET …/readings?from=…),
// then it grows by itself every time a telemetry event arrives (see receive() in store.ts). Its time axis moves every second.
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ApiError, getReadingsSince } from "../api";
import { EMPTY, useLiveStore } from "../store";
import type { Point } from "../types";
import { MINUTE, ticksEvery, useNow, wibHourMinute, wibTime } from "../time";
import Picker from "./Picker";

type Quantity = "temperature" | "light" | "humidity";

// Title, unit, scale, and color of each quantity. The temperature scale follows its data (it doesn't start at 0), because
// a change of 1-2 °C matters and the unit is written in the title. Light and humidity have natural limits, so their scale stays the same.
type Setting = { name: string; title: string; unit: string; domain: [number | "auto", number | "auto"]; color: string };
const QUANTITIES: Record<Quantity, Setting> = {
  temperature: { name: "Temperature", title: "Temperature (°C)", unit: " °C", domain: ["auto", "auto"], color: "var(--color-sky-500)" },
  light: { name: "Light", title: "Light (0 = dark, 4095 = bright)", unit: "", domain: [0, 4095], color: "var(--color-amber-500)" },
  humidity: { name: "Humidity", title: "Air humidity (%)", unit: " %", domain: [0, 100], color: "var(--color-teal-500)" },
};

const OPTIONS: { value: Quantity; text: string }[] = [
  { value: "temperature", text: "Temperature" },
  { value: "light", text: "Light" },
  { value: "humidity", text: "Humidity" },
];

// insertGaps - if two points are further apart than "gap", insert one empty point (null) between them.
// Recharts breaks the line at a null point (connectNulls is false by default), so a missing reading shows as a gap,
// not as a straight line that pretends there's data.
function insertGaps(points: Point[], gap: number): Point[] {
  const result: Point[] = [];
  for (const p of points) {
    const prev = result.at(-1); // the last point already added (undefined for the first point)
    if (prev !== undefined && p.t - prev.t > gap) {
      result.push({ t: prev.t + 1, temperature: null, humidity: null, light: null });
    }
    result.push(p);
  }
  return result;
}

export default function LiveChart({ deviceId }: { deviceId: string }) {
  const [quantity, setQuantity] = useState<Quantity>("temperature");
  const [error, setError] = useState<string | null>(null);
  const points = useLiveStore((s) => s.windows[deviceId] ?? EMPTY); // ?? EMPTY, not ?? [] (see store.ts)
  const live = useLiveStore((s) => s.connection === "live");
  const fillWindow = useLiveStore((s) => s.fillWindow);
  const now = useNow();

  // The first points: readings of the last 5 minutes from the database. Repeated every time the connection is Live again,
  // because messages missed while disconnected aren't sent again by the server (the same point isn't stored twice: see merge()).
  useEffect(() => {
    if (!live) return;
    let ignore = false;
    getReadingsSince(deviceId, 5)
      .then((answer) => {
        if (ignore) return;
        fillWindow(deviceId, answer.readings);
        setError(null);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "Couldn't fill the chart.");
      });
    return () => {
      ignore = true;
    };
  }, [deviceId, live, fillWindow]);

  const q = QUANTITIES[quantity];
  const start = now - 5 * MINUTE;
  // more than 25 seconds without a reading = at least 2 missed 10-second messages: the line is broken there
  const data = insertGaps(points, 25 * 1000);
  // the store only drops old points when a new point arrives, so count the points still inside the last 5 minutes
  const anyVisible = points.some((p) => p.t >= start);
  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800">{q.title} · last 5 minutes</h3>
        <Picker label="Chart quantity" options={OPTIONS} selected={quantity} onSelect={setQuantity} />
      </div>
      <div className="mt-3 text-xs">
        {/* responsive + style: the width follows the box (neat on a phone), the height stays 240 px */}
        <LineChart responsive data={data} style={{ width: "100%", height: 240 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200)" />
          {/* The time axis is a NUMBER (milliseconds), not a category: the space between points matches their time difference.
              domain = exactly the last 5 minutes; ticks = a label at every whole minute, so they don't jump around. */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[start, now]}
            allowDataOverflow
            ticks={ticksEvery(start, now, MINUTE)}
            tickFormatter={wibHourMinute}
          />
          <YAxis domain={q.domain} width={44} />
          <Tooltip labelFormatter={(t) => wibTime(Number(t))} />
          {/* isAnimationActive={false}: the default 1.5-second animation makes a new point look late */}
          <Line
            dataKey={quantity}
            name={q.name}
            unit={q.unit}
            stroke={q.color}
            strokeWidth={2}
            dot={{ r: 2, fill: q.color }}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
      {anyVisible ? null : (
        <p className="mt-2 text-sm text-slate-500">
          {live ? "No readings in the last 5 minutes." : "Waiting for the live connection…"}
        </p>
      )}
      {error !== null ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
```

Read it from the top:

- **`QUANTITIES`**: the title, unit, scale, and color of each quantity. Temperature has the scale `"auto"` (a 1–2 °C change matters, and its unit is written in the title); light and humidity have fixed scales (Concept 9).
- **`insertGaps()`**: more than 25 seconds without a reading (at least 2 missed messages) → one `null` point → the line breaks. Don't write `connectNulls`; its default is `false`.
- **The first-points effect** runs when **Live** and runs again every time it's back to **Live**, because messages during a disconnection aren't resent; `ignore` throws away a late answer (the Module 22 pattern).
- **`useNow()`** re-renders the chart every second so its window slides: a clock, not polling.
- **`XAxis`**: `type="number"` with a `domain` of exactly the last 5 minutes; `allowDataOverflow` cuts points outside the window instead of widening the axis; `ticks` at every whole minute; WIB time labels.
- **`LineChart responsive`** + `style={{ width: "100%", height: 240 }}`: its width follows its container, so it fits on a 375 px phone screen.
- **`isAnimationActive={false}`** for visual honesty. The default animation slides the line from its old position for about 1.5 seconds: the screen briefly draws numbers the device never sent, and a new point looks late. Not for speed: in the author's lab, animation on and off made no real difference.
- **`anyVisible`**: without a point in the last 5 minutes, the chart writes `No readings in the last 5 minutes.`, or `Waiting for the live connection…` when not **Live** yet.

Save. The chart doesn't show yet: it isn't on any screen.

#### 4.3 A quantity picker: Temperature, Light, and Humidity (10 minutes)

**Step 1 — Pick-one buttons.** In the same folder, create a new file **`Picker.tsx`** (or copy it from [`code/stages/practice-4/frontend/src/components/Picker.tsx`](code/stages/practice-4/frontend/src/components/Picker.tsx)):

```tsx
// Picker.tsx - a row of "pick one" buttons, for example Temperature / Light / Humidity. The selected button is colored.
// <T extends string> = the type of the option values is filled in by whoever uses the component (for example "temperature" |
// "light"), so TypeScript still makes sure that onSelect only accepts values that really are in the list.
type Props<T extends string> = {
  label: string; // the button group's name for screen readers, for example "Chart quantity"
  options: { value: T; text: string }[];
  selected: T;
  onSelect: (value: T) => void;
};

export default function Picker<T extends string>({ label, options, selected, onSelect }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((p) => (
        <button
          key={p.value}
          type="button"
          aria-pressed={p.value === selected} // tells screen readers which button is selected right now
          onClick={() => onSelect(p.value)}
          className={
            "min-h-11 rounded-lg border px-3 text-sm font-medium " +
            (p.value === selected
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
          }
        >
          {p.text}
        </button>
      ))}
    </div>
  );
}
```

This button row is used again for the History ranges (Practice 7). `<T extends string>` makes TypeScript refuse values outside the list, `aria-pressed` tells screen readers which button is active, and `min-h-11` (44 px) is comfortable for a finger.

**Step 2 — Place it in the Details.** Replace everything in `src/components/DeviceDetails.tsx` with [`code/stages/practice-4/frontend/src/components/DeviceDetails.tsx`](code/stages/practice-4/frontend/src/components/DeviceDetails.tsx) (**Copy raw file**). The chart goes right below the status line:

```tsx
      {/* The 5-minute chart is only for devices that send every 10 seconds (Node 1 and the simulator) */}
      {messagesIgnored ? null : node2 ? (
        <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-600">
          Node 2 sends every 5 minutes, so a chart of the last 5 minutes would almost always be empty and isn't shown.
        </p>
      ) : (
        <LiveChart deviceId={id} />
      )}
```

A device whose messages the backend ignores gets no chart. Also: if the card numbers come from the database (through `fillWindow()`), the sentence `The state of the lamp and fan isn't stored in the database, …` explains why the **Lamp** and **Fan** cards don't show yet.

Save everything, then open the Details of **Practice living room** (device path: **Node 1 living room**).

**Result (example, the author's lab; your times and numbers will certainly differ):** below the status line there's a box `Temperature (°C) · last 5 minutes` with the buttons **Temperature** (active), **Light**, and **Humidity**, a dotted blue line, a time axis labeled per minute (for example `16:30` to `16:34`), and a vertical axis `24 27 30 33 36`. The backend terminal records its first points (another lab run):

```text
[16:46:23] INFO: GET /devices/f00d00000001/readings?from=2026-10-24T09:41:23.545Z -> 200 (7 ms)
[16:46:23] INFO: GET /devices/f00d00000001/readings?from=2026-10-24T09:41:23.551Z -> 200 (5 ms)
```

Two lines: `StrictMode` runs effects twice in dev mode. `from` = 5 minutes before the Details opened, in UTC (`09:41` UTC = `16:41` WIB).

Click **Light**: its title is `Light (0 = dark, 4095 = bright)`, its axis 0–4095, and its line amber and jagged, because the simulator randomizes light at every message. **Humidity** writes `Air humidity (%)`, 0–100. Watch the time axis for a minute or two: its labels slide slowly to the left and only change when a new minute arrives (the author watched for 195 seconds: 3 changes, 0 jumps). The Details of **Node 2 garden** (device path) hold that Node 2 sentence, not a chart.

#### 4.4 ⭐ The line moves by itself: `temp 33`, the lamp, or the LDR (10 minutes)

Leave the Details open with the **Live** badge, then trigger new messages without touching the dashboard.

- **Laptop path, test 1:** on the **Temperature** chart, type `temp 33` in the simulator terminal, then **Enter**. With the next message (usually 0–10 seconds), the **Temperature** card becomes `33` and the right end of the line rises to 33. Set it back with `temp random`.
- **Laptop path, test 2:** in Bruno, send **`login admin`**, open **`lamp on`**, replace `a4cf12e5b7c0` in its URL with `f00d00000001` (don't press **Ctrl + S**), then click **Send**; repeat with **`lamp off`**. A changed actuator makes the simulator send **immediately**, so a new point appears outside the 10-second schedule. Its light value is random: this proves the immediate-send pipeline, not the light sensor.
- **Device path:** pick **Light**; the room must be bright (or shine a flashlight on the LDR), because Node 1 only sends immediately when `light` crosses the 1000 threshold. Cover the LDR with your hand for about 5 seconds: the **Light** line should drop about 1–2 seconds later. The author hasn't recorded it with a real Kit. The line only changes about 10 seconds later? See [🚨](#-troubleshooting) *Covering the LDR doesn't change the chart right away*.

**Result (example, the author's lab during the 2.5 test; the chart points come from the same `telemetry` events as the card numbers):** the **Temperature** card became `33` 3.9–4.9 seconds after **Enter** (three attempts; 0–10 seconds is normal, at most about 11 seconds), and the **Lamp** card changed `Off`/`On` 0.01–0.07 seconds after the command was sent.

**An honest gap (optional).** Stop the sender for about 40 seconds (laptop path: **Ctrl + C** in the simulator terminal; device path: unplug Node 1's USB), then start it again: the line breaks into two segments, not joined by a straight line.

![Real screenshot of the Details of Practice living room (the simulator f00d00000001) in Edge, laptop 1280 px, cropped after the gauges (Practices 3–5). The header with the Live badge (marker 1); ← Back to the list and History → (marker 9); the line node1 · Online · last seen just now (marker 2). The card Temperature (°C) · last 5 minutes with the buttons Temperature, Light, Humidity (marker 3); a blue line with dots, vertical axis 24–36, time axis 06:50 to 06:54 (marker 5); the line breaks between about 06:51:58 and 06:52:55, the empty part boxed (marker 4). Then updated at 06:54:05 WIB (marker 6), the gauges Soil moisture 29 % (marker 7) and Water tank 83 % (marker 8), teal arcs over a gray track. Legend: 1 the socket is alive, turns into Reconnecting… when it drops; 2 moves along with the status and telemetry events; 3 only one line shows; 4 no reading for more than 25 seconds because the simulator was off for ±40 seconds, the line is not joined; 5 the 5-minute sliding window, a label per minute in WIB; 6 the time of the latest reading from the device's ts; 7 scale 0–100 %, the arc as long as the value; 8 below 20 % an amber arc and the text low (below 20 %), not visible in this picture; 9 History of 1 hour, 24 hours, 7 days (Practice 7).](assets/live-details-chart-gauges.png)

A capture of the final dashboard v0.2: the gauges (markers 7–8, Practice 5) and **History →** (marker 9, Practice 7) aren't on your screen yet. Marker 4 = the gap while the simulator was off for about 40 seconds.

**You pass this ⭐ step** when, with the **Live** badge and without reloading the page, the line changes by itself: **Light** in less than 11 seconds after the LDR is covered (usually about 1–2 seconds), or, on the laptop path, **Temperature** rises to 33 in less than 11 seconds after **Enter** and a new point appears as soon as the lamp command is sent. The same test is repeated on the phone ([9.5](#95--the-first-pass-requirement-on-the-phone-record-the-chart-changing-15-minutes)) and during the dress rehearsal ([10.3](#103--a-dress-rehearsal-of-both-pass-requirements-15-minutes)).

In the free terminal, save to the branch:

```text
git add src/types.ts src/api.ts src/store.ts src/time.ts src/components/LiveChart.tsx src/components/Picker.tsx src/components/DeviceDetails.tsx
git commit -m "Live 5-minute line chart (Module 23 Practice 4)"
```

> ⬆️ **Done with Practice 4?** Read [Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors) and [Concept 10](#10-dark-mode-following-the-phones-and-the-laptops-setting), then [Practice 5 — Gauges, honest visuals, and dark mode](#practice-5--gauges-honest-visuals-and-dark-mode-45-minutes).

### Practice 5 — Gauges, honest visuals, and dark mode (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the Practice 4 terminals still running (backend v1.0 and Vite; on the laptop path also the broker and simulator) plus one free terminal in the `frontend` folder for Git; **Docker Desktop** (`smarthome-db` running); and **Chrome or Edge** at `http://localhost:5173` with DevTools (the **Rendering** panel and device mode). Concepts used: 9–10.

This practice completes the Details screen and gives the whole dashboard a dark theme. First, half-circle gauges for **soil moisture** and the **water tank**. You deliberately make them **wrong first**, so you see a misleading arc for yourself, then make it honest with one line ([Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors)). Second, the **Pump** and **Curtain** cards appear too. Third, a **dark mode** that follows the phone's or laptop's setting, including the chart colors that `dark:` classes can't reach ([Concept 10](#10-dark-mode-following-the-phones-and-the-laptops-setting)). The code at the end of this practice: [`code/stages/practice-5/frontend/`](code/stages/practice-5/frontend/).

#### 5.1 `Gauge`: wrong first, then honest (15 minutes)

**Step 1 — The track color first: `src/index.css`.** A gauge draws a gray track behind its arc with `var(--track-color)`, a variable that doesn't exist yet. Open [`code/stages/practice-5/frontend/src/index.css`](code/stages/practice-5/frontend/src/index.css) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/index.css`. It holds the old `@import "tailwindcss";` line, one comment, and the Concept 10 variable block: three colors in `:root` whose values are replaced inside `@media (prefers-color-scheme: dark)`. The gauge uses `--track-color`; `--grid-color`, `--panel-color`, and the `@media` part only matter in 5.3. Save; the dashboard doesn't look any different yet.

**Step 2 — Write `Gauge.tsx`, then break it on purpose.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`Gauge.tsx`**, then type the code below (or open [`code/stages/practice-5/frontend/src/components/Gauge.tsx`](code/stages/practice-5/frontend/src/components/Gauge.tsx) on GitHub, click **Copy raw file**, then paste). **Don't save yet.**

```tsx
// Gauge.tsx - a half-circle gauge (Recharts RadialBarChart) for a quantity with clear limits: 0-100 %.
// The scale MUST be written (domain 0-100). Without it, Recharts measures the arc against its own value, and the gauge
// always looks full even when the value is only 14 %.
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

type Props = {
  label: string; // for example "Soil moisture"
  value: number | null; // percent; null = the sensor failed to read: an empty arc and the number "—"
  lowThreshold?: number; // below this number: a warning color + the word "low"
};

export default function Gauge({ label, value, lowThreshold }: Props) {
  const low = value !== null && lowThreshold !== undefined && value < lowThreshold;
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="relative mx-auto mt-2 max-w-48">
        {/* startAngle 180 -> endAngle 0 = a half circle from left to right; cy="100%" = its center sits on the bottom edge */}
        <RadialBarChart
          responsive
          style={{ width: "100%", aspectRatio: 2 }}
          data={[{ value: value ?? 0 }]}
          startAngle={180}
          endAngle={0}
          cy="100%"
          innerRadius="140%"
          outerRadius="200%"
        >
          {/* the scale stays at 0-100: without this line, the arc is always full */}
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            background={{ fill: "var(--track-color)" }} // the gray track behind the arc
            cornerRadius={6}
            fill={low ? "var(--color-amber-500)" : "var(--color-teal-500)"}
            isAnimationActive={false}
          />
        </RadialBarChart>
        {/* the number + unit in the middle of the arc */}
        <p className="absolute inset-x-0 bottom-0 text-center text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {value ?? "—"}
          {value !== null ? <span className="ml-0.5 text-base font-normal text-slate-400">%</span> : null}
        </p>
      </div>
      {/* color is never alone: the "low" state is written too */}
      {low ? (
        <p className="mt-1 text-center text-sm font-medium text-amber-700 dark:text-amber-400">low (below {lowThreshold} %)</p>
      ) : null}
    </div>
  );
}
```

Before saving, make the "wrong first" version with two changes:

1. Delete these two lines (the comment and `<PolarAngleAxis … />`, right above `<RadialBar`):

   ```tsx
             {/* the scale stays at 0-100: without this line, the arc is always full */}
             <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
   ```

2. Remove `PolarAngleAxis` from the `import` line, so it becomes `import { RadialBar, RadialBarChart } from "recharts";`. If you leave the import, VS Code underlines it in red: this project refuses unused imports (`noUnusedLocals`).

Save (**Ctrl + S**). The browser doesn't change yet, because no screen uses `Gauge` so far. First read its parts:

- **Three props**: `label`, `value` (a percentage, or `null` if the sensor failed to read), and `lowThreshold` (the `?` = it may be left out).
- **`data={[{ value: value ?? 0 }]}`**: Recharts always asks for an array of data, so a gauge is a chart with one row and one arc. `null` is drawn as 0 (an empty arc), while its text becomes `—`.
- **The half-circle shape**: `startAngle={180}` → `endAngle={0}` draws from left to right, with the center on the bottom edge (`cy="100%"`), the height half the width (`aspectRatio: 2`), and the width following the box up to 192 px (`responsive` + `max-w-48`). `innerRadius` and `outerRadius` set the ring's thickness.
- **`<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />`**: the scale stays at 0–100, without scale numbers around the arc. This is the line you just deleted.
- **`<RadialBar>`**: `background` = the gray track, the rest of the scale up to 100%; `cornerRadius` rounds the arc's ends; `fill` is teal, or amber when low; `isAnimationActive={false}` so the arc doesn't "slide" from the old value (Concept 9, rule 7).
- **The number in the middle** (`absolute`, stacked over the chart) always has the `%` unit. When `low`, the amber color comes with the text `low (below 20 %)`: color is never alone.

**Step 3 — Put it in the Details.** Open [`code/stages/practice-5/frontend/src/components/DeviceDetails.tsx`](code/stages/practice-5/frontend/src/components/DeviceDetails.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/components/DeviceDetails.tsx`. Its contents are taken apart in 5.2, and its `dark:` classes in 5.3. Is your laptop on a dark theme? Until 5.3 is done, the Details are half dark and the heading almost disappears: that's normal. Save, then open the **Practice living room** details (device path: **Node 1 living room**).

**Result (example):** under the 5-minute chart there's the line `updated at 06:49:08 WIB`, then two gauges side by side: **Soil moisture** `32%` and **Water tank** `41%`. **Both teal arcs are full** from the left end to the right end, even though the numbers differ.

Without a fixed scale, the one value becomes the end of its scale, so the arc is always full (Concept 9, rule 1). At a glance, you'd think the tank was full.

**Step 4 — Make it honest.** In `Gauge.tsx`, undo both changes: write `PolarAngleAxis, ` again at the start of the import list, then paste the two deleted lines back right above `<RadialBar` (or press **Ctrl + Z** until both are back). Save.

**Result (example; the author captured the wrong and the honest version in two windows after the same message, `updated at 06:49:08 WIB`):** the **Soil moisture** `32%` arc now only fills a short stretch on the left, and **Water tank** `41%` almost half. The rest is the gray track up to the right end. The arc's length now equals its number. On your screen, the numbers change with the next message.

![Composite of two real screenshots: a misleading gauge vs an honest gauge, the same reading, different pictures (Edge, laptop 1280 px, two windows open at the same time on the same message, Practices 5.1–5.2). Top, Wrong first: Gauge.tsx without the PolarAngleAxis line (a temporary copy): updated at 06:49:08 WIB, Soil moisture 32 % (marker 1) and Water tank 41 % (marker 2), both teal arcs full from end to end. Bottom, Right: PolarAngleAxis type number, domain 0 to 100, tick false (the final code): the same updated at 06:49:08 WIB, Soil moisture 32 % with a short arc on the left (marker 3) and Water tank 41 % with an arc of almost half (marker 4), the rest a gray track. Legend: 1 without a scale, Recharts measures the arc against its own value; 2 different numbers but the same picture, the eye reads full; 3 with PolarAngleAxis 0–100 the arc length = the value; 4 the gray track = the rest of the scale up to 100 %, from background on RadialBar.](assets/gauge-wrong-and-right.png)

#### 5.2 Soil and tank gauges, then the Pump and Curtain cards (10 minutes)

The `DeviceDetails.tsx` you pasted in 5.1 brings three changes. Read them with the file open in VS Code.

**1. The `gauges()` function** (above `type Props`) picks the gauges by device kind:

```tsx
// Gauges are only for quantities with clear limits, 0-100 %: soil moisture, and Node 1's water tank.
function gauges(reading: Telemetry, node2: boolean) {
  if (node2) {
    return <Gauge label="Soil moisture" value={(reading as TelemetryNode2).soil} />;
  }
  const t = reading as TelemetryNode1;
  return (
    <>
      <Gauge label="Soil moisture" value={t.soil} />
      {/* the water tank below 20 % = "low" (the data contract's threshold, the same as Node 1's immediate-send rule) */}
      <Gauge label="Water tank" value={t.water_level} lowThreshold={20} />
    </>
  );
}
```

- **Node 1** (and the simulator) gets two gauges; **Node 2** only one, because it has no water tank. Temperature and light don't become gauges: temperature has no clear upper limit, and light is an ADC number from 0 to 4095, not a percentage (Concept 9, rule 1).
- **`lowThreshold={20}`** uses the water tank threshold from the data contract, the same as Node 1's immediate-send rule. Below 20%, the arc is amber **and** it says `low (below 20 %)`. The simulator sends a random water tank level of 30–90%, so on the laptop path this display doesn't appear (the author hasn't seen it on screen); on the device path, it should appear as soon as Node 1 reports a water tank below 20%.
- **`<>…</>`** (a *fragment*) wraps the two gauges without an extra `div`, so they become the two columns of a `grid grid-cols-2` box. That box sits inside the `div` that's faded (`opacity-60`) when the badge isn't **Live**, so the gauges look stale too (Concept 9, rule 6).

The **Soil moisture** card (and, on Node 1, **Water tank**) is removed from the card list: the same number doesn't need to show twice.

**2. The Pump and Curtain cards.** In `cardsNode1()`, after the Lamp and Fan cards:

```tsx
      // Module 23: the pump and the curtain are shown too (their control buttons are still in Module 24)
      { label: "Pump", value: t.state.pump ? "Watering" : "Idle", color: t.state.pump ? "text-sky-600 dark:text-sky-400" : undefined },
      { label: "Curtain", value: t.state.curtain, unit: "°" },
```

Both are only **shown**: the control buttons belong to Module 24. The actuator state isn't stored in the database, so after the backend restarts, the sentence below the cards now reads `The state of the lamp, fan, pump, and curtain isn't stored in the database, so their cards only appear with the next message.`

**3. `dark:` classes** in almost every `className`. Ignore them for now; their meaning is in 5.3.

**Try it.** Look at the **Practice living room** details again (device path: **Node 1 living room**), then wait for a message or two.

**Result (example):** from the top: the `Live` badge in the header, the line `node1 · Online · last seen 10 seconds ago`, the chart `Temperature (°C) · last 5 minutes`, the line `updated at 16:33:54 WIB`, the gauges **Soil moisture** `35%` and **Water tank** `74%`, then the cards `Temperature`, `Humidity`, `Light`, `Motion`, `Lamp`, `Fan`, `Pump`, and `Curtain`. The gauge and card numbers change by themselves with every message. The **Node 2 garden** details (device path) have only one gauge, **Soil moisture**, with the cards `Temperature`, `Humidity`, `Air pressure`, `Soil temperature`, and `Battery` (if its battery gauge is fitted).

This screen appears in the [4.4](#44--the-line-moves-by-itself-temp-33-the-lamp-or-the-ldr-10-minutes) picture: the two gauges = markers 7–8.

#### 5.3 Dark mode: `dark:` classes and chart colors (20 minutes)

Dark mode needs three places: the page (`index.html`), the Recharts charts (CSS variables), and the `dark:` classes on every screen. No button and nothing saved: the dashboard follows the system setting (Concept 10).

**Step 1 — The page: `index.html`.** Open `frontend/index.html` (in the `frontend` folder, not in `src`) and change two lines:

```html
<html lang="en" class="scheme-light dark:scheme-dark">
```

```html
  <body class="bg-slate-100 dark:bg-slate-900">
```

`scheme-light dark:scheme-dark` asks the browser to darken its own parts too, such as scroll bars and form fields. The `body` background makes the whole page dark, not only the React boxes. Save.

**Step 2 — The chart: `LiveChart.tsx`.** Recharts doesn't know `dark:`, so the chart uses the variables from `src/index.css` (5.1). The `@media (prefers-color-scheme: dark)` part of that file replaces their values by itself in the dark theme. Open [`code/stages/practice-5/frontend/src/components/LiveChart.tsx`](code/stages/practice-5/frontend/src/components/LiveChart.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/components/LiveChart.tsx`. Besides the `dark:` classes, what changes are these lines inside `return`:

```tsx
      {/* this box's text color is used by the axis labels (fill: currentColor), so it changes in dark mode too */}
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        …
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
          …
            tick={{ fill: "currentColor" }}
            stroke="var(--grid-color)"
          />
          <YAxis domain={q.domain} width={44} tick={{ fill: "currentColor" }} stroke="var(--grid-color)" />
          <Tooltip
            labelFormatter={(t) => wibTime(Number(t))}
            contentStyle={{ backgroundColor: "var(--panel-color)", borderColor: "var(--grid-color)", borderRadius: 8 }}
          />
```

The grid lines and axis lines use `var(--grid-color)` (slate-200 in the light theme, slate-700 in the dark theme), and the tooltip box has a `var(--panel-color)` background instead of Recharts' default white. The axis labels use `fill: "currentColor"`, the text color of their box (`text-slate-500 dark:text-slate-400`), so they change through ordinary Tailwind classes. The data line colors (`var(--color-sky-500)` and friends, since 4.2) stay: marker colors read well in both themes. The gauge has been ready since 5.1 (`var(--track-color)` and the `dark:` classes in `Gauge.tsx`).

**Step 3 — `dark:` classes on the other screens.** Eight files only gain `dark:` classes (and one comment in `DeviceList.tsx`). For each file, open it on GitHub, click **Copy raw file**, then paste it in place of the whole contents of the same file in your folder: [`src/App.tsx`](code/stages/practice-5/frontend/src/App.tsx), then seven files in `src/components`: [`Login.tsx`](code/stages/practice-5/frontend/src/components/Login.tsx), [`SensorCard.tsx`](code/stages/practice-5/frontend/src/components/SensorCard.tsx), [`Badge.tsx`](code/stages/practice-5/frontend/src/components/Badge.tsx), [`ConnectionBadge.tsx`](code/stages/practice-5/frontend/src/components/ConnectionBadge.tsx), [`LastSeen.tsx`](code/stages/practice-5/frontend/src/components/LastSeen.tsx), [`Picker.tsx`](code/stages/practice-5/frontend/src/components/Picker.tsx), and [`DeviceList.tsx`](code/stages/practice-5/frontend/src/components/DeviceList.tsx). Want to type it yourself? Copy every `dark:` class from the stage 5 files. The pattern is always the same: every light color gets a dark partner.

| Part | Light theme | Added for the dark theme |
| :--- | :--- | :--- |
| Page background | `bg-slate-100` | `dark:bg-slate-900` |
| Header, cards, chart box | `bg-white` `border-slate-200` | `dark:bg-slate-800` `dark:border-slate-700` |
| Headings and numbers | `text-slate-800` | `dark:text-slate-100` |
| Small gray text | `text-slate-500` | `dark:text-slate-400` |
| `Online` / `Live` badge | `bg-green-100 text-green-800` | `dark:bg-green-900 dark:text-green-100` |

There's one trap in `DeviceList.tsx`. The list cards get `dark:border-slate-700`, which colors **all four** sides of the frame, including the left edge. In the author's first version, the green/red left edge from Practice 3 **disappeared** in the dark theme, because that `dark:` class overrode `border-l-green-500`. The fix: repeat the edge color with a `dark:` variant too, in `LEFT_EDGE`:

```tsx
  online: "border-l-green-500 dark:border-l-green-500", // repeated with dark: so the card's dark:border-slate-700 doesn't cover it
  offline: "border-l-red-500 dark:border-l-red-500",
```

After that fix, the left edges measured green and red in the dark theme. The status can also still be read from the badge's text (Concept 9, rule 4).

Save all the files. The light theme doesn't change at all: the classes without a prefix stay the same.

**Step 4 — Try the dark theme without changing the laptop's setting.** DevTools can imitate a dark theme setting for this tab only:

1. In the dashboard tab, open DevTools (**F12**).
2. Click the three-dot button at the top right of DevTools → **More tools** → **Rendering**.
3. In **Rendering**, scroll to **Emulate CSS media feature prefers-color-scheme**, then choose **prefers-color-scheme: dark**.
4. Check the **Device List**, then the **Practice living room** details (device path: **Node 1 living room**). Hover over the chart line so the tooltip appears.
5. Want to see the red edge in the dark theme? Stop the simulator for a moment (**Ctrl + C**, as in 3.3), wait for its card to show `Offline` and `· stale data` (±30 seconds), then start it again. Device path: unplug Node 1's USB cable for a moment.
6. Turn on device mode (**Ctrl + Shift + M**; macOS: **Cmd + Shift + M**), choose **Responsive**, type the width `375`, reload (**F5**), then check the list and the details once more.

**Result (example):** the page background turns a very dark grayish blue, the header and cards slightly lighter, and the text light. The `Live`, `Online`, and `Offline` badges and the yellow `· stale data` text stay readable. The list at laptop width: `Online` cards with a **green** left edge, and **Practice living room** `Offline` with a **red** left edge and `last seen 38 seconds ago · stale data`. The details at 375 px wide: `node1 · Online · last seen 8 seconds ago`, the chart's grid lines and axis labels dimmed, `updated at 06:47:41 WIB`, the gauges `31%` and `37%` with teal arcs over a dark gray track. The tooltip box turns dark too, and there's no horizontal scrolling.

![Composite of two real screenshots, dark mode follows the system setting (Edge emulating prefers-color-scheme: dark, Practice 5.3); left DevTools device mode at 375 px, not a real phone; right a laptop at 1280 px, the lab's Node 1/Node 2 fakes. Left, the Details of Practice living room: the Live badge (marker 4), node1 · Online · last seen 8 seconds ago; the chart Temperature (°C) · last 5 minutes, dimmed grid lines and axis labels, axis 06:43 to 06:47 (marker 2); updated at 06:47:41 WIB; the gauges Soil moisture 31 % and Water tank 37 % (marker 3), teal arcs over a dark track. Right, the Device List: Node 2 garden and Node 1 living room Online with green left edges (marker 5 on Node 1); Test device (intruder) key revoked; Practice living room Offline (marker 4) with a red left edge (marker 5), the gray text last seen 38 seconds ago followed by · stale data in yellow (marker 4); Practice porch, not registered (marker 1). Legend: 1 dark background and cards from Tailwind dark: classes, no button and no localStorage; 2 the --grid-color variable; 3 the --track-color variable, data colors unchanged; 4 the badges and · stale data stay readable; 5 the green/red left edges stay visible, their color repeated with a dark: variant.](assets/dark-mode-phone-and-laptop.png)

When you're done checking (laptop on a dark theme? Look at the light theme too: **prefers-color-scheme: light**), set **Emulate CSS media feature prefers-color-scheme** back to **No emulation**, then turn device mode off (**Ctrl + Shift + M**). The dashboard follows your laptop's setting again.

> [!NOTE]
> The author tested dark mode with an **emulated** `prefers-color-scheme` in Edge 156 (laptop and 375 px device mode), not with a real Windows or phone theme setting. Colors from CSS variables inside SVG haven't been tried in Safari on an iPhone. You try it on a real phone in [9.6](#96-dark-mode-on-the-phone-and-a-phone-that-falls-asleep-10-minutes).

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` should name twelve changed files (`index.html`, `src/index.css`, `src/App.tsx`, and nine files in `src/components`: `DeviceList`, `DeviceDetails`, `LiveChart`, `SensorCard`, `Badge`, `ConnectionBadge`, `Login`, `Picker`, `LastSeen`) and one new file under `Untracked files` (`src/components/Gauge.tsx`). Then save:

```text
git add index.html src
git commit -m "Honest gauges, Pump and Curtain cards, and dark mode (Module 23 Practice 5)"
```

The code at the end of this practice is in [`code/stages/practice-5/frontend/`](code/stages/practice-5/frontend/) to compare with.

> ⬆️ **Done with Practice 5?** Your device details now have a live chart and honest gauges, and the whole dashboard follows the dark theme. Before Practice 6, go back to [Concept 5](#5-dont-re-render-10-per-second-measure-first-then-believe): now there's a chart and gauges to measure. Then continue to [Practice 6 — Measure first: don't re-render 10× per second](#practice-6--measure-first-dont-re-render-10-per-second-25-minutes).

### Practice 6 — Measure first: don't re-render 10× per second (25 minutes)

> 🖥️ **Tools used:** **VS Code** with the Practice 5 terminals still running (backend v1.0 and Vite; on the laptop path also the broker and simulator) plus one free terminal in the `frontend` folder; **Docker Desktop** (`smarthome-db` running); and **Chrome or Edge** with the **Console** tab and two React DevTools tabs: **Components ⚛** and **Profiler ⚛**. Concepts used: Concept 5.

The Syllabus asks for a dashboard that doesn't re-render 10× per second, and [Concept 5](#5-dont-re-render-10-per-second-measure-first-then-believe) says: don't guess, **measure first**. This practice separates three things: how often the screen re-renders at the real pace, what happens when one device sends 10 times per second, and what a narrow selector is good for. No code is left over: the test file is deleted at the end, so the stage `code/stages/practice-6/` is exactly the same as `practice-5/`.

> [!NOTE]
> The numbers in this practice's **Result** boxes are **examples** from the author's laptop: the kitchen (`npm run dev`, with StrictMode), Edge 156, the **Practice living room** details screen, a 10-second recording, counted with a small script that reads the same data as the Profiler. Your numbers will certainly differ; what has to match is the **comparison**.

#### 6.1 React DevTools: highlight re-renders and record with the Profiler (5 minutes)

React DevTools has two measuring tools. **Highlight updates** briefly frames every component that has just re-rendered; the **Profiler** records every commit, that is, every time React writes the result of a re-render to the screen.

1. Open `http://localhost:5173` (log in if needed), click the **Practice living room** card (device path: **Node 1 living room**), and wait for the **Live** badge.
2. **Turn on the highlighting.** Open DevTools (**F12**), click the **Components ⚛** tab, click the gear icon (settings), choose the **General** section, then tick **Highlight updates when components render**. Close the settings and watch the page for ±20 seconds: frames flash every second on the chart and the `last seen` text. The frame color shifts from teal (rarely re-rendered) to yellow-orange (often). If the flashing bothers your eyes, turn it off again and rely on the Profiler alone.
3. **Record 10 seconds.** Click the **Profiler ⚛** tab, click the round record button at the top left (hovering over it shows `Start profiling - Ctrl+E`), wait ±10 seconds, then click the same button to stop. The counter at the top right has the form `1 / N`: N is the number of commits during the recording. In the *flamegraph* below it, one bar = one component. Click the `DeviceDetails` bar, then `LiveChart`: the right panel lists every time that component was rendered (`Rendered at:`), one line per re-render.

**Result (example):** N = `33`, about 3 commits per second. In the author's lab, in those 10 seconds `LastSeen` and `LiveChart` were each rendered 11×, `DeviceDetails` 1×, and `ConnectionBadge` 0×.

Almost all of those commits come from the 1-second clock tick ([Concept 6](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling)), not from data: the simulator only sends once every 10 seconds, and `DeviceDetails` renders once per message. At the real pace, your dashboard is already far from 10× per second.

#### 6.2 A fake load of 10 readings per second (10 minutes)

To see a device that sends 10 times per second, the backend and simulator don't need to change: a temporary file that injects fake readings straight into the store is enough.

1. **Make the file.** In VS Code, create a `loadtest` folder inside `frontend/src`, then a `fakeLoad.ts` file in it. Open [`code/practice-6/src/loadtest/fakeLoad.ts`](code/practice-6/src/loadtest/fakeLoad.ts) on GitHub, click **Copy raw file**, then paste. Its settings are at the top:

```ts
const ID = "f00d00000001"; // the flooded device; with Kit A + B, replace it with Node 1's device_id
const PER_SECOND = 10;
const DURATION_SECONDS = 60;
```

Device path: replace `f00d00000001` with your Node 1's `device_id`. This file doesn't touch the network. As soon as the **Live** badge appears, it calls `useLiveStore.getState().receive(ID, content)`, the same path as the socket's `telemetry` event, 10 times per second for 60 seconds, then stops by itself. Its `setInterval` is only a test pump, not polling (nothing is asked of the backend), and the file is deleted in 6.3. Don't commit it to Git.

2. **Add one line.** In `src/main.tsx`, add one line right below `import App` (single quotes, no semicolon, following that file's style), so it becomes:

```tsx
import App from './App.tsx'
import './loadtest/fakeLoad'
```

3. **Run it.** Save, open the **Console** tab, then press **F5**. The pump starts as soon as the **Live** badge appears and only runs for 60 seconds, so click the **Practice living room** card right away. If the time runs out, press **F5** again.

**Expected output:**

```text
fakeLoad: started, 10 readings per second for 60 seconds for f00d00000001
```

The right end of the 5-minute chart quickly fills with dense points (lab script: ±80–100 new points per 10 seconds).

4. **Measure again.** Record 10 seconds with the Profiler, as in 6.1.

**Result (example):** N = `181` (an earlier recording, with the author's not-yet-final code: `228`), `DeviceDetails` rendered 76× in 10 seconds (that recording: 99×), and `ConnectionBadge` still 0×.

This is what the Syllabus warns about: with data 10 times per second, `DeviceDetails` really does re-render ±8–10× per second. A narrow selector can't prevent it, because that screen really does use the changing numbers; neither can React's *batching*, because every message arrives separately (Concept 5). The cure for data that really is 10 Hz is a *throttle*: collect the readings, then show them, for example, every 500 ms ([🔬](#-technical-deep-dive-optional) *Data 10 times per second*). Mini Smart Home devices usually only send once every 10 seconds, so v0.2 doesn't use one.

#### 6.3 Compare, write it down, then delete the test file (10 minutes)

A narrow selector helps the components that **don't** use the changing data. Prove it in `ConnectionBadge`.

1. In `src/components/ConnectionBadge.tsx`, temporarily replace the line `const connection = useLiveStore((s) => s.connection);` with a wide selector (the whole store), then save:

```tsx
  const { connection } = useLiveStore();
```

2. Press **F5** (the fake load pump runs for 60 seconds again), click **Practice living room**, record 10 seconds with the Profiler, then click the `ConnectionBadge` bar.

**Result (example, an earlier recording):** `ConnectionBadge` re-rendered 104× in 10 seconds (with the narrow selector: 0×), even though its text stays `Live`.

3. Put the original line back (**Ctrl + Z**), then save. Write your three N values (real pace, fake load, wide selector) in your notebook, not in the project. Want to test the animation too? Temporarily delete the `isAnimationActive={false}` line in `LiveChart.tsx` (not its comment), press **F5**, record, then put it back. In the author's lab the difference couldn't be measured, so the line stays for the sake of visual honesty ([Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors)), not speed.
4. **Delete the test file.** Delete the line `import './loadtest/fakeLoad'` from `src/main.tsx`, right-click the `src/loadtest` folder in VS Code's Explorer panel → **Delete** (confirm), and untick **Highlight updates**.
5. **Check.** In the free terminal (the `frontend` folder), run `git status`: the answer must be `nothing to commit, working tree clean`. Still `src/loadtest/` or a `modified` file? Delete the folder or run `git restore <file>`. Practice 6 deliberately leaves no code behind, so there's no Git commit. The pull request template in [➕ C](#c-add-the-module-23-items-to-the-pull-request-template) checks the same thing.

> ⬆️ **Done with Practice 6?** Read [Concept 11 — History from buckets](#11-history-from-buckets-three-ranges-a-paged-table-and-csv), then continue to [Practice 7 — History of 1 hour, 24 hours, and 7 days](#practice-7--history-of-1-hour-24-hours-and-7-days-55-minutes).

### Practice 7 — History of 1 hour, 24 hours, and 7 days (55 minutes)

> 🖥️ **Tools used:** **VS Code** with the Practice 6 terminals still running (backend v1.0 and Vite; on the laptop path also the broker and simulator) plus one free terminal (for `seed-history` in the `backend` folder, then Git in `frontend`); **Docker Desktop** (`smarthome-db` running); **Bruno**; and **Chrome or Edge** at `http://localhost:5173` with the DevTools **Network** tab. Concepts used: Concept 11.
>
> ⭐ **Required** — step 7.4: the 7-day history loads in under 1 second, witnessed by the backend log, the **Network** tab, and the `loaded in … ms` text on the screen.

So far you could only peek at the history through Bruno. This practice adds a third screen, **History**, opened with the **History →** button in the Details. Three range buttons pick the bucket size (Concept 11), and every choice is only **one request** with the API's defaults, without `from` and `to`:

| Button | Request | One point |
| :-- | :-- | :-- |
| **1 hour** | `GET /devices/:id/readings` | one raw reading |
| **24 hours** | `…/readings?bucket=15m` | a 15-minute average |
| **7 days** | `…/readings?bucket=1h` | a 1-hour average |

This is the second half of the pass requirement: **the 7-day history loads in under 1 second**.

#### 7.1 Prepare 7 days of data and check it in Bruno (10 minutes)

The `npm run seed-history` practice data from Module 17 is weeks old by now, so its "last 7 days" are empty or full of holes. Fill it again, then summarize it once (the recipe is also in [🧰](#-what-you-need)).

1. In the free terminal, move to the `backend` folder (`cd ../backend`; the backend keeps running in its own terminal), then run `npm run seed-history`.

   **Expected output (example):**

   ```text
   > mini-smart-home-backend@1.0.0 seed-history
   > node --env-file=.env src/db/seed-history.ts

   f00d00000001: 1109 readings sent, 1109 newly stored
   f00d00000002: 1109 readings sent, 1109 newly stored
   ```

   This script fills in one reading every 10 minutes, from 00:00 WIB seven days ago until now, for the two practice devices. Readings that already exist are skipped, so your "newly stored" number may be smaller.

2. In the same terminal, summarize into the hourly summary book (`readings_hourly`, Module 18):

   ```text
   docker exec -it smarthome-db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
   ```

   **Result:** one line, `CALL`. Docker Desktop may add three lines starting with `What's next:`; that's a small Docker ad, ignore it.

   Why is this needed? The automatic clerk only re-summarizes the last 3 days; old readings that arrive all at once are only recorded through this command. The 8-day window (not `NULL`, as in the backend README) protects old summaries whose raw readings retention has already thrown away.

3. In Bruno (the `backend/bruno` collection, the `local` environment), send **`login viewer`** first. Open **`Node 1 hourly history`**, replace `a4cf12e5b7c0` in its URL with `f00d00000001`, then click **Send**. The device path uses `f00d00000001` too, because the real Node 1's history only holds the hours when Node 1, the backend, and the database were running.

**Result (example):** status `200`, `bucket` is `1h`, and `count` is `169` (7 × 24 + 1: the start of the range is rounded to the start of an hour, and the current hour is included). Every `summary` item looks like this (written on one line):

```text
{"time":"2026-10-17T09:00:00Z","avg_temp":30,"min_temp":29.5,"max_temp":30.4,"avg_humidity":75,"avg_soil":43.3,"avg_light":1392.3,"reading_count":6}
```

`time` is the start of the bucket in UTC (`09:00Z` = 16:00 WIB). Only four quantities are summarized, plus the lowest–highest temperature and the number of readings per bucket.

> [!NOTE]
> **`count` only `2`?** Step 2 was skipped or failed: the summary book still holds the old hours without your new data; only the latest hours are counted straight from the raw readings. Run step 2, then click **Send** again: in the author's lab the count went back to `169`. On a brand-new database, the number may already be `169` without step 2; run that step anyway.

Close the request tab. If the `Unsaved changes` dialog appears, click **Don't Save**: the original URL stays Node 1's.

#### 7.2 The summary types and `getHistory`: a range becomes a `bucket` (10 minutes)

**The shape of the answer.** Open `src/types.ts`, then add this block at the very bottom, after the `Point` type (Practice 4):

```ts
// one summary bucket (bucket=15m or 1h): the average of every reading in that bucket.
// The backend only summarizes these four quantities; pressure, battery, and the water tank aren't in the summary history.
export type SummaryPoint = {
  time: string; // start of the bucket, UTC
  avg_temp: number | null;
  min_temp: number | null;
  max_temp: number | null;
  avg_humidity: number | null;
  avg_soil: number | null;
  avg_light: number | null;
  reading_count: number;
};

// the GET /devices/:id/readings?bucket=… answer  (a bucket without readings isn't sent at all)
export type SummaryAnswer = {
  device_id: string;
  from: string;
  to: string;
  bucket: "15m" | "1h" | "1d";
  count: number;
  summary: SummaryPoint[];
};

// the three range options on the History screen
export type HistoryRange = "1hour" | "24hours" | "7days";

// history already made uniform by api.ts: even raw readings (1 hour) are turned into the SummaryPoint shape
export type HistoryData = {
  from: string;
  to: string;
  points: SummaryPoint[]; // oldest first
};
```

`SummaryPoint` copies one `summary` item you saw in Bruno. `HistoryData` is the **uniform** shape for the screen: the chart (and, in Practice 8, the table and the CSV) only needs to know one shape, whatever the range.

**The history ticket booth.** In `src/api.ts`, replace the `import type` line at the very top with:

```ts
import type { Device, HistoryData, HistoryRange, Reading, ReadingsAnswer, SummaryAnswer, SummaryPoint, User } from "./types";
```

Then add these two functions at the very bottom, below `getReadingsSince()`:

```ts
// one raw reading turned into the shape of a summary point, so the chart, the table, and the CSV only need to know ONE shape
function toSummaryPoint(b: Reading): SummaryPoint {
  return {
    time: b.ts,
    avg_temp: b.temperature,
    min_temp: null, // one reading has no lowest and highest
    max_temp: null,
    avg_humidity: b.humidity,
    avg_soil: b.soil,
    avg_light: b.light,
    reading_count: 1,
  };
}

// Module 23: history for the History screen. The ranges use the API's defaults (no from and to):
// 1 hour = raw readings, 24 hours = average per 15 minutes (bucket=15m), 7 days = average per hour (bucket=1h).
export async function getHistory(deviceId: string, range: HistoryRange): Promise<HistoryData> {
  const path = "/devices/" + deviceId + "/readings";
  if (range === "1hour") {
    const answer = await request<ReadingsAnswer>(path);
    return { from: answer.from, to: answer.to, points: answer.readings.map(toSummaryPoint) };
  }
  const bucket = range === "24hours" ? "15m" : "1h";
  const answer = await request<SummaryAnswer>(path + "?bucket=" + bucket);
  return { from: answer.from, to: answer.to, points: answer.summary };
}
```

- **`getHistory()`** translates the screen's choice into a request. Without `from`, there's no `+07:00` time that has to be written as `%2B` in the URL (Practice 4); the backend works out its default range itself.
- **`toSummaryPoint()`** isn't exported, because it's only used here. One raw reading has no lowest and highest, so both are `null`.

Save both files (**Ctrl + S**). The screen doesn't change yet, because no component calls `getHistory()` so far.

#### 7.3 The History screen: `DeviceHistory.tsx` and `HistoryChart.tsx` (25 minutes)

**Step 1 — New time labels.** Open [`code/stages/practice-7/frontend/src/time.ts`](code/stages/practice-7/frontend/src/time.ts) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/time.ts`. There are three additions: `DAY` (one day in milliseconds), `wibDayDate()` for the 7-day axis labels (`Sat 24`), and `wibDateTime()` for the tooltip (`Sat 24 Oct, 16:00 WIB`). Both use an `Intl` formatter in the `Asia/Jakarta` zone that's made once, like `wibHourMinute()`.

**Step 2 — The chart first.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`HistoryChart.tsx`**, then type the code below (or open [`code/stages/practice-7/frontend/src/components/HistoryChart.tsx`](code/stages/practice-7/frontend/src/components/HistoryChart.tsx), click **Copy raw file**, then paste):

```tsx
// HistoryChart.tsx - a history chart of one quantity: the average line (for temperature also the lowest and highest),
// with honest gaps. Hours without data show as a gap, not as a straight line that pretends there's data.
import { useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryData, HistoryRange, Kind } from "../types";
import { DAY, HOUR, MINUTE, ticksEvery, wibDateTime, wibDayDate, wibHourMinute, wibTime } from "../time";
import Picker from "./Picker";

// The backend only summarizes these four quantities per 15 minutes and per hour.
type Quantity = "temperature" | "humidity" | "soil" | "light";
type Setting = {
  name: string;
  title: string;
  unit: string;
  column: "avg_temp" | "avg_humidity" | "avg_soil" | "avg_light";
  domain: [number | "auto", number | "auto"];
  color: string;
};
// The temperature scale follows its data (its unit is in the title); the other quantities have natural limits, so their scale stays the same.
const QUANTITIES: Record<Quantity, Setting> = {
  temperature: { name: "Temperature", title: "Temperature (°C)", unit: " °C", column: "avg_temp", domain: ["auto", "auto"], color: "var(--color-sky-500)" },
  humidity: {
    name: "Humidity",
    title: "Air humidity (%)",
    unit: " %",
    column: "avg_humidity",
    domain: [0, 100],
    color: "var(--color-teal-500)",
  },
  soil: { name: "Soil", title: "Soil moisture (%)", unit: " %", column: "avg_soil", domain: [0, 100], color: "var(--color-lime-600)" },
  light: {
    name: "Light",
    title: "Light (0 = dark, 4095 = bright)",
    unit: "",
    column: "avg_light",
    domain: [0, 4095],
    color: "var(--color-amber-500)",
  },
};

const OPTIONS: { value: Quantity; text: string }[] = [
  { value: "temperature", text: "Temperature" },
  { value: "humidity", text: "Humidity" },
  { value: "soil", text: "Soil" },
  { value: "light", text: "Light" },
];

// For each range: the largest distance between two points that still count as joined (more than this = some data is
// missing), the distance between time-axis labels, and the label format.
const AXIS: Record<HistoryRange, { gap: number; step: number; label: (t: number) => string }> = {
  "1hour": { gap: 25 * 1000, step: 10 * MINUTE, label: wibHourMinute }, // a reading every 10 seconds: 2 lost messages = a gap
  "24hours": { gap: 1.5 * 15 * MINUTE, step: 3 * HOUR, label: wibHourMinute }, // 15-minute buckets
  "7days": { gap: 1.5 * HOUR, step: DAY, label: wibDayDate }, // 1-hour buckets; a label at every 00:00 WIB
};

type Row = { t: number; avg: number | null; min: number | null; max: number | null };

// insertGaps - if two points are further apart than "gap", insert one empty point (null) between them.
// Recharts breaks the line at a null point (connectNulls is false by default). It works the same as insertGaps in
// LiveChart.tsx (Practice 4); only the shape of its rows differs.
function insertGaps(rows: Row[], gap: number): Row[] {
  const result: Row[] = [];
  for (const r of rows) {
    const prev = result.at(-1); // the last point already added (undefined for the first point)
    if (prev !== undefined && r.t - prev.t > gap) {
      result.push({ t: prev.t + 1, avg: null, min: null, max: null });
    }
    result.push(r);
  }
  return result;
}

type Props = {
  data: HistoryData;
  range: HistoryRange;
  kind: Kind; // Node 2 has no light sensor
};

export default function HistoryChart({ data, range, kind }: Props) {
  const [quantity, setQuantity] = useState<Quantity>("temperature");
  const q = QUANTITIES[quantity];
  const axis = AXIS[range];
  const from = Date.parse(data.from);
  const to = Date.parse(data.to);
  // the lowest and highest only exist in the temperature summary (raw 1-hour readings don't have them)
  const minMax = quantity === "temperature" && range !== "1hour";
  const rows = insertGaps(
    data.points.map((p) => ({
      t: Date.parse(p.time),
      avg: p[q.column],
      min: minMax ? p.min_temp : null,
      max: minMax ? p.max_temp : null,
    })),
    axis.gap,
  );

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{q.title}</h3>
        <Picker
          label="History quantity"
          options={kind === "node2" ? OPTIONS.filter((p) => p.value !== "light") : OPTIONS}
          selected={quantity}
          onSelect={setQuantity}
        />
      </div>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <LineChart responsive data={rows} style={{ width: "100%", height: 260 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
          {/* domain = the range asked for (from … to): a part without data at the start or end still looks empty */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[from, to]}
            ticks={ticksEvery(from, to, axis.step)}
            tickFormatter={axis.label}
            tick={{ fill: "currentColor" }}
            stroke="var(--grid-color)"
          />
          <YAxis domain={q.domain} width={44} tick={{ fill: "currentColor" }} stroke="var(--grid-color)" />
          <Tooltip
            labelFormatter={(t) => (range === "1hour" ? wibTime(Number(t)) : wibDateTime(Number(t)))}
            contentStyle={{ backgroundColor: "var(--panel-color)", borderColor: "var(--grid-color)", borderRadius: 8 }}
          />
          {minMax ? (
            <Line dataKey="max" name="Highest" unit={q.unit} stroke={q.color} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
          <Line
            dataKey="avg"
            name={range === "1hour" ? q.name : q.name + " average"}
            unit={q.unit}
            stroke={q.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {minMax ? (
            <Line dataKey="min" name="Lowest" unit={q.unit} stroke={q.color} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
        </LineChart>
      </div>
      {minMax ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Thick line = average; dashed lines = lowest and highest.</p>
      ) : null}
    </section>
  );
}
```

- **`QUANTITIES`** only holds the four summary quantities. The temperature scale follows its data (`"auto"`, its unit is in the title); humidity and soil are always 0–100, light 0–4095, so small ups and downs don't look like spikes (Concept 9). Node 2 has no light sensor, so the **Light** button is filtered out.
- **`AXIS`** keeps, per range: the largest distance that still counts as joined (25 seconds for a message every 10 seconds; 1.5 × the bucket width for summaries) and the distance between labels (10 minutes, 3 hours, or one day at exactly 00:00 WIB, through Practice 4's `ticksEvery()`).
- **`insertGaps()`**: the API doesn't send empty buckets. Without this function, Recharts draws a straight line across the hours without data. The inserted `null` points break the line, because `connectNulls` is `false` by default; it works the same way as in `LiveChart` (Practice 4).
- **`XAxis type="number"` with `domain={[from, to]}`**: the axis is the range that was asked for, from the API answer, so parts without data at the start or end still look empty.
- **Temperature gets three lines** (`minMax`): a thick average between the dashed lowest and highest; not for 1 hour, because raw readings have neither. `isAnimationActive={false}`: the line is whole in its place at once, without "sliding" as if it hadn't finished loading.
- The grid lines, axes, and tooltip use the Practice 5 dark mode variables (`var(--grid-color)`, `var(--panel-color)`).

**Step 3 — The screen.** In the same way, create **`DeviceHistory.tsx`** in the same folder ([`code/stages/practice-7/frontend/src/components/DeviceHistory.tsx`](code/stages/practice-7/frontend/src/components/DeviceHistory.tsx)):

```tsx
// DeviceHistory.tsx - one device's history screen: pick a range (1 hour / 24 hours / 7 days), then see its chart.
// One range = ONE request to the API; the rest (for example marking gaps) is done by the browser.
import { useEffect, useRef, useState } from "react";
import { ApiError, getHistory } from "../api";
import type { Device, HistoryData, HistoryRange } from "../types";
import HistoryChart from "./HistoryChart";
import Picker from "./Picker";

const OPTIONS: { value: HistoryRange; text: string }[] = [
  { value: "1hour", text: "1 hour" },
  { value: "24hours", text: "24 hours" },
  { value: "7days", text: "7 days" },
];

// what one point means in each range (the defaults of Module 18's backend API)
const CAPTIONS: Record<HistoryRange, string> = {
  "1hour": "Raw readings of the last hour (one point = one message)",
  "24hours": "Average per 15 minutes, last 24 hours (point = start of each 15 minutes)",
  "7days": "Average per hour, last 7 days (point = start of each hour)",
};

type Props = {
  device: Device;
  onBack: () => void;
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

export default function DeviceHistory({ device, onBack, onSessionExpired }: Props) {
  const id = device.device_id;
  const [range, setRange] = useState<HistoryRange>("7days");
  const [data, setData] = useState<HistoryData | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  // when the history request was sent (milliseconds). useRef: the value is kept without re-rendering the screen.
  const startedAt = useRef(0);

  useEffect(() => {
    let ignore = false;
    startedAt.current = performance.now(); // performance.now() = the page's own millisecond clock, for measuring how long
    getHistory(id, range)
      .then((d) => {
        if (!ignore) setData(d);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return onSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the history.");
      });
    return () => {
      ignore = true;
    };
  }, [id, range, onSessionExpired]);

  // An effect runs AFTER React has finished drawing the new data on the screen: that's when the history counts as "loaded".
  useEffect(() => {
    if (data !== null) setDurationMs(Math.round(performance.now() - startedAt.current));
  }, [data]);

  function selectRange(r: HistoryRange) {
    if (r === range) return;
    setRange(r);
    setData(null); // empty it first, so no chart of the old range looks like the new range
    setError(null);
    setDurationMs(null);
  }

  let content;
  if (error !== null) {
    content = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  } else if (data === null) {
    content = <p className="mt-4 text-slate-500 dark:text-slate-400">Loading the history…</p>;
  } else {
    content = (
      <>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {CAPTIONS[range]} · {data.points.length} points
          {/* time from sending the request until React has finished drawing the chart; readable on a phone without DevTools */}
          {durationMs !== null ? " · loaded in " + durationMs + " ms" : null}
        </p>
        {data.points.length === 0 ? (
          <p className="mt-4 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            No data in this range yet.
          </p>
        ) : (
          <HistoryChart data={data} range={range} kind={device.kind} />
        )}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          The summary history only keeps temperature, humidity, soil moisture, and light.
        </p>
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
      >
        ← Back to the details
      </button>
      <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800 dark:text-slate-100">
        History: {device.name ?? id}
      </h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {device.location ?? "no location yet"} · <span className="font-mono text-xs">{id}</span>
      </p>
      <Picker label="Time range" options={OPTIONS} selected={range} onSelect={selectRange} />
      {content}
    </div>
  );
}
```

- **`Picker`** (Practice 4) shows the three range buttons; the default is **7 days**, the range measured in 7.4.
- **The first effect** follows the Module 22 pattern: `ignore` throws away answers that are no longer wanted, for example the first answer when `StrictMode` runs the effect twice in dev mode, or when the range changes before its answer arrives. A 401 (after the refresh failed too) calls `onSessionExpired()`.
- **`useRef`** keeps a number in `startedAt.current` without making the screen re-render, unlike the `useState` whiteboard. `performance.now()` is the page's own *stopwatch*, in milliseconds; it's noted when the request is sent.
- **The second effect** runs after React has finished drawing the new data on the screen. The difference between the two notes is the `loaded in … ms`, which can be read on a phone without DevTools.
- **`selectRange()`** empties the old data first, so the 7-day chart doesn't get the chance to show under the **1 hour** button.

**Step 4 — A button in the Details, a third screen in `App`.** Replace the whole contents of `src/components/DeviceDetails.tsx` with [`code/stages/practice-7/frontend/src/components/DeviceDetails.tsx`](code/stages/practice-7/frontend/src/components/DeviceDetails.tsx) and of `src/App.tsx` with [`code/stages/practice-7/frontend/src/App.tsx`](code/stages/practice-7/frontend/src/App.tsx) (**Copy raw file**). In the Details, the only new things are the prop `onHistory: () => void;`, the **History →** button next to **← Back to the list**, and the Node 2 sentence, which now ends with `Its chart is in History.` In `App`, `View` gets a third option:

```tsx
type View = { name: "list" } | { name: "details"; device: Device } | { name: "history"; device: Device };
```

Three screens are too tangled for nested `? :`, so `App` first picks one into the `currentScreen` variable with `if`/`else` (the `let content` pattern in the Details), then `<main>` only holds `{currentScreen}`. The Details branch passes `onHistory={() => setView({ name: "history", device })}`, and **← Back to the details** in History goes back to the same device. The address stays `http://localhost:5173`; the browser's **Back** button still leaves the dashboard until React Router arrives in Module 24.

Save all the files, then open **Practice living room** → **History →**.

**Result (example):** the heading `History: Practice living room`, the **7 days** button active, the line `Average per hour, last 7 days (point = start of each hour) · 169 points · loaded in 26 ms`, and a **Temperature (°C)** chart with a daily wave: a thick line between two dashed lines, one label per day (`Sun 18` to `Sat 24`), and the note `Thick line = average; dashed lines = lowest and highest.`

Click **24 hours**, then **1 hour** (for 1 hour, use a device that sends every 10 seconds: **Practice living room** with the simulator running on the laptop path, **Node 1** on the device path). **Result (example):** `Average per 15 minutes, last 24 hours (point = start of each 15 minutes) · 97 points · loaded in 13 ms`, then `Raw readings of the last hour (one point = one message) · 298 points · loaded in 35 ms` with only one line, without lowest–highest. The **Node 2** history (device path) only has the quantity buttons **Temperature**, **Humidity**, and **Soil**.

Want to see an honest gap? Laptop path: stop the simulator (**Ctrl + C**), wait about a minute, start it again, then click **24 hours** and go back to **1 hour**: the line breaks in the minutes without data instead of being joined straight.

#### 7.4 ⭐ The 7-day history loads in under 1 second (10 minutes)

Three witnesses see different parts: the **backend log** (how long the backend took to answer), the **Time** column in the **Network** tab (plus the trip over the network), and `loaded in … ms` (from sending the request until React finished drawing its chart).

1. In the **Network** tab, tick **Disable cache**, type `bucket` in the filter box, then click **Clear network log**.
2. In the **Practice living room** history, click **← Back to the details**, then **History →** again: the default **7 days** range loads right away.
3. Write down the numbers from all three witnesses. Repeat step 2 until you have three openings, then use the **slowest** numbers.

**Result** (**example**, dev mode on the author's busy laptop; your numbers will certainly differ): the screen shows `… · 169 points · loaded in 26 ms`; the **Network** tab two `readings?bucket=1h` rows with status `200` and a **Time** of about 13 and 18 ms; the backend terminal:

```text
[16:46:26] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (9 ms)
[16:46:26] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (13 ms)
```

There are two requests because `StrictMode` runs the effect twice in dev mode; the first answer is thrown away by `ignore`. The second and third openings in the lab: `16 ms` and `465 ms`. The last one was held up on a very busy laptop, even though the backend answered in 17 ms; still under 1 second.

![Real screenshot of History 7 days in Edge, laptop 1280 px, the whole page cut in the middle of the table (seed-history data and the refreshed summary book, Practices 7–8). Top: the Live badge, ← Back to the details, History: Practice living room; the buttons 1 hour, 24 hours, and the active 7 days (marker 1); Average per hour, last 7 days (point = start of each hour) · 169 points · loaded in 150 ms (marker 2). The chart Temperature (°C) with the buttons Temperature, Humidity, Soil, Light (marker 3): a thick line in daily waves, about 30 °C by day and about 22 °C at night, between dashed lines, with a jump at the right end from the simulator's last hours; axis Mon 19 to Sun 25 (marker 5); the note Thick line = average; dashed lines = lowest and highest (marker 4). Table (newest first), the header and the first row boxed (marker 6): Sun 25 Oct, 06:00 WIB, 28.5, 22.8–32.9, 70.8, 41.7, 1870.8, 75; other rows cut. Bottom: Sat 24 Oct, 08:00 and 07:00 WIB, ← Previous dimmed, Page 1 of 8, Next → (marker 7), the green Download CSV button (marker 8). Legend: 1 one request per choice; 2 1-hour buckets, measure the less than 1 second rule; 3 summary quantities; 4 the hourly average and its range; 5 one label per day; 6 24 rows per page; 7 169 rows = 8 pages; 8 a CSV file for Excel.](assets/history-7-days-table.png)

This shot was taken after Practice 8, so you only build the table and **Download CSV** (markers 6–8) in the next practice; its `loaded in 150 ms` is simply the load captured in this shot; your number will differ, and it stays well under 1 second.

**You pass this ⭐ step** when all three 7-day openings show `loaded in` under 1,000 ms, the **Time** in Network is under 1 second too, and the backend log records `-> 200`. That's the second pass requirement on the laptop; its dress rehearsal is in [10.3](#103--a-dress-rehearsal-of-both-pass-requirements-15-minutes).

> [!TIP]
> The first opening after the database has just been prepared can be slow (the author's lab: `830 ms`, the backend itself 562 ms). Measure again afterwards, and close heavy programs that keep the laptop busy.

In the free terminal, move to the `frontend` folder (`cd ../frontend`), then save to the branch:

```text
git add src/types.ts src/api.ts src/time.ts src/App.tsx src/components/DeviceDetails.tsx src/components/DeviceHistory.tsx src/components/HistoryChart.tsx
git commit -m "History of 1 hour, 24 hours, and 7 days (Module 23 Practice 7)"
```

The code at the end of this practice is in [`code/stages/practice-7/frontend/`](code/stages/practice-7/frontend/).

> ⬆️ **Done with Practice 7?** The 7-day history now shows in the dashboard and loads well under 1 second. Continue to [Practice 8 — A paged table and CSV export](#practice-8--a-paged-table-and-csv-export-40-minutes): the same numbers show as a table and can be taken home as a CSV file.

### Practice 8 — A paged table and CSV export (40 minutes)

> 🖥️ **Tools used:** **VS Code** with the Practice 7 terminals (backend v1.0 and Vite; on the laptop path also the broker and simulator) plus one free terminal in the `frontend` folder for Git; **Docker Desktop**; **Chrome or Edge** at `http://localhost:5173`; **File Explorer** (macOS: **Finder**); in 8.3, a spreadsheet app if you have one (Excel, LibreOffice Calc, or Google Sheets). Concepts used: Concept 11.

The Practice 7 chart shows the **shape** of the last seven days. The exact numbers are easier to read in a **table**, and numbers you want to work on yourself go to Excel as a **CSV**. The API has neither a page option nor a CSV route ([Concept 11](#11-history-from-buckets-three-ranges-a-paged-table-and-csv)), so both are done by the **browser** from the answer it already has, without a new request to the backend.

Make sure everything is running as in Practice 7, then open **Practice living room** → **History →** (`f00d00000001`, the same as Practice 7).

#### 8.1 `HistoryTable`: newest first, 24 rows per page (20 minutes)

The 7-day history holds 169 points (7 × 24 hours, plus the current hour). A table that long takes a lot of scrolling, especially on a phone. So the table is cut into pages of **24 rows** (in the 7-day range, one page = 24 hours) and reversed to **newest first**, because the latest hours are the ones you look for most often, while the API always sends from the oldest.

**Step 1 — A new component.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`HistoryTable.tsx`**, then type the code below (or open [`code/stages/practice-8/frontend/src/components/HistoryTable.tsx`](code/stages/practice-8/frontend/src/components/HistoryTable.tsx) on GitHub, click **Copy raw file**, then paste):

```tsx
// HistoryTable.tsx - the history as a table, newest first, 24 rows per page. The pages are split in the browser:
// all the data is already at hand (±360 rows for 1 hour of readings every 10 seconds, plus immediate sends; API limit 1,000).
import { useState } from "react";
import type { SummaryPoint } from "../types";
import { wibDateTime, wibTime } from "../time";

const PER_PAGE = 24;

type Props = {
  points: SummaryPoint[]; // oldest first, like the API answer
  raw: boolean; // true = raw readings (1 hour): no lowest-highest and reading-count columns
};

// numbers on the screen use a decimal point, as on the sensor cards; null = "—"
function num(value: number | null): string {
  return value === null ? "—" : String(value);
}

export default function HistoryTable({ points, raw }: Props) {
  const [page, setPage] = useState(1);
  const newestFirst = [...points].reverse(); // a reversed copy: the original order (old -> new) isn't changed
  const pageCount = Math.max(1, Math.ceil(newestFirst.length / PER_PAGE));
  const rows = newestFirst.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const cellClass = "px-3 py-2 text-right whitespace-nowrap";
  const buttonClass =
    "min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50 disabled:opacity-40 " +
    "dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700";

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Table (newest first)</h3>
      {/* overflow-x-auto: on a phone, wide rows scroll inside their own box; the page itself doesn't scroll along */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-200">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-2 text-left whitespace-nowrap">Time</th>
              <th className={cellClass}>Temperature °C</th>
              {raw ? null : <th className={cellClass}>Lowest–highest</th>}
              <th className={cellClass}>Humidity %</th>
              <th className={cellClass}>Soil %</th>
              <th className={cellClass}>Light</th>
              {raw ? null : <th className={cellClass}>Readings</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.time} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="px-3 py-2 whitespace-nowrap">{raw ? wibTime(p.time) : wibDateTime(Date.parse(p.time))}</td>
                <td className={cellClass}>{num(p.avg_temp)}</td>
                {raw ? null : (
                  <td className={cellClass}>
                    {num(p.min_temp)}–{num(p.max_temp)}
                  </td>
                )}
                <td className={cellClass}>{num(p.avg_humidity)}</td>
                <td className={cellClass}>{num(p.avg_soil)}</td>
                <td className={cellClass}>{num(p.avg_light)}</td>
                {raw ? null : <td className={cellClass}>{p.reading_count}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
        <button type="button" className={buttonClass} disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Previous
        </button>
        <span>
          Page {page} of {pageCount}
        </span>
        <button type="button" className={buttonClass} disabled={page === pageCount} onClick={() => setPage(page + 1)}>
          Next →
        </button>
      </div>
    </section>
  );
}
```

- **`[...points].reverse()`**: `reverse()` reverses the **original** array, but the chart and the CSV (8.2) use the same `points` in the old → new order. So it's the copy that gets reversed, like `[...old, ...incoming]` in [Warm-up Step 2](#step-2--a-5-minute-sliding-window-add-filter-and-drop-duplicates).
- **`page`** = the small whiteboard holding the page number. **`pageCount`** = 169 ÷ 24 rounded up = 8 (`Math.max(1, …)`: never "of 0"). **`slice()`** takes rows number 0–23 for page 1 (JavaScript counts from 0); page 8 only has row number 168 left. The buttons at either end are switched off with `disabled`.
- **`raw`** (the 1-hour range): one row = one message, so the **Lowest–highest** and **Readings** columns are hidden and the time only needs the clock (`wibTime`).
- **`num()`**: a decimal point, like the sensor cards; `null` (the sensor failed to read) is written `—`, not zero ([Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors)).
- **`overflow-x-auto`**: on a 375 px screen, the table scrolls inside its own box, not the whole page.

**Step 2 — Put it in `DeviceHistory`.** Open `src/components/DeviceHistory.tsx`. Add `import HistoryTable from "./HistoryTable";` below the line `import Picker from "./Picker";`. Then replace the line `<HistoryChart data={data} range={range} kind={device.kind} />` with this block (`<>…</>` wraps two components into one piece of content):

```tsx
          <>
            <HistoryChart data={data} range={range} kind={device.kind} />
            {/* key = range: a safety net so the rows of another range always start again from page 1 (while loading,
                selectRange has already emptied the data, so the old rows are already gone from the screen) */}
            <HistoryTable key={range} points={data.points} raw={range === "1hour"} />
          </>
```

`key={range}`: a new range = a new table with a clean whiteboard (like the `key` on Module 22's `DeviceDetails`). Save (**Ctrl + S**).

**Result (example):** under the chart, a **Table (newest first)** box appears with the header `Time | Temperature °C | Lowest–highest | Humidity % | Soil % | Light | Readings`, holding 24 rows, with `Page 1 of 8` below it and a dimmed **← Previous** button. Its first row is the current hour, for example `Sat 24 Oct, 16:00 WIB | 29.2 | 25.1–33 | 70 | 38.9 | 2082.4 | 248`; its last row is `Fri 23 Oct, 17:00 WIB`. Click **Next →** seven times: `Page 8 of 8` only holds the oldest hour (`Sat 17 Oct, 16:00 WIB | 30 | 29.5–30.4 | 75 | 43.3 | 1392.3 | 6`), and now **Next →** is the dimmed one. Your dates and numbers will certainly differ.

The **Readings** column answers "the average of how many readings?": hours from `seed-history` hold 6 (one every 10 minutes), hours when the simulator was running far more (a message every 10 seconds). Try **24 hours** and **1 hour** too: the table starts again from page 1, and at **1 hour** those two columns are gone.

#### 8.2 `src/csv.ts` and the Download CSV button (15 minutes)

CSV is plain text: one line per point, with the columns separated by one character (you already put one together in [Warm-up Step 5](#step-5--csv-text-for-excel-commas-decimal-points-and-quotes)). For Excel with English regional settings (Concept 11), our file uses `,`, numbers like `28.5`, Windows line breaks (CRLF), and a **BOM** (*byte order mark*) at the start: three invisible bytes that tell Excel the content is UTF-8, so special characters like `°` don't get garbled.

**Step 1 — `src/csv.ts`.** Right-click the **`frontend/src`** folder → **New File…**, name it **`csv.ts`**, then type (or copy it from [`code/stages/practice-8/frontend/src/csv.ts`](code/stages/practice-8/frontend/src/csv.ts) with **Copy raw file**):

```ts
// csv.ts - builds a CSV file in the browser. The backend has no CSV route: the data is already on the screen, so the browser
// itself puts the text together and saves it as a file. The format is set up for Excel with English (US/UK) regional
// settings: a comma separator (,), a decimal point (28.5), a BOM at the start of the file, and CRLF at the end of every line.

// quote - a value containing , " or a line break is wrapped in double quotes, and the quotes inside are doubled.
// Example: Node 1, living room  ->  "Node 1, living room"
export function quote(text: string): string {
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

// one cell: a number keeps its decimal point (28.5), null (failed sensor or missing column) becomes an empty cell
function cell(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  return quote(value);
}

// toCsv - rows (an array of arrays) become one CSV text
export function toCsv(rows: (string | number | null)[][]): string {
  // "\uFEFF" = BOM: an unseen mark saying the content is UTF-8, so special letters in device names (for example ° or é) stay whole in Excel
  return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

// downloadCsv - ask the browser to save text as a file, without a server
export function downloadCsv(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); // a temporary "blob:http://…" address that points at data in the browser's memory
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.append(a);
  a.click(); // the same as tapping a download link
  a.remove();
  // release that temporary address once the download has started, so its memory can be freed
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// "sv-SE" (Swedish) is used because it happens to format as year-month-day hour:minute:second, easy to sort
const CSV_TIME = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "medium" });

// csvTime - "2026-10-24 16:15:42" in WIB
export function csvTime(t: string | number): string {
  return CSV_TIME.format(new Date(t));
}
```

- **`quote()`** uses the format rule described in RFC 4180 (which uses commas too). In the author's lab, the temporary device name `Porch, "test" quote` came out as `"Porch, ""test"" quote"`: still one cell.
- **`downloadCsv()`**: the text is wrapped in a **`Blob`** (a file in the browser's memory) and given a temporary address, then an `<a download>` link that never shows is "clicked" by the code.

**Step 2 — The button in `DeviceHistory`.** The button isn't printed in full here, so copy the file: open [`code/stages/practice-8/frontend/src/components/DeviceHistory.tsx`](code/stages/practice-8/frontend/src/components/DeviceHistory.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/components/DeviceHistory.tsx` (the 8.1 changes are already in it). What's new: the import `import { csvTime, downloadCsv, toCsv } from "../csv";`, the file's header comment, the `download()` function below `selectRange()`:

```tsx
  // Download every row of this range (not only the page of rows on the screen), oldest first.
  function download() {
    if (data === null) return;
    const deviceName = device.name ?? id;
    const header = [
      "time_wib",
      "device",
      "avg_temp_c",
      "min_temp_c",
      "max_temp_c",
      "avg_humidity_percent",
      "avg_soil_percent",
      "avg_light",
      "reading_count",
    ];
    const rows = data.points.map((p) => [
      csvTime(p.time),
      deviceName,
      p.avg_temp,
      p.min_temp,
      p.max_temp,
      p.avg_humidity,
      p.avg_soil,
      p.avg_light,
      p.reading_count,
    ]);
    // the file name, for example history-f00d00000001-7days-2026-10-24.csv (today's date in WIB)
    downloadCsv("history-" + id + "-" + range + "-" + csvTime(Date.now()).slice(0, 10) + ".csv", toCsv([header, ...rows]));
  }
```

and the teal **Download CSV** button (`onClick={download}`) right below the `<HistoryTable … />` line.

`download()` uses **all** the points of that range, ordered old → new (`data.points`, not the table's reversed copy). Why device names starting with `=` need watching: [🔬](#-technical-deep-dive-optional) *CSV and formula injection*.

Save, then click **Download CSV** on the **7 days** range.

**Result (example):** the browser saves `history-f00d00000001-7days-2026-10-24.csv` (with today's date) to your downloads folder, for example `C:\Users\you\Downloads`. The author recorded this file's name and contents straight from the button, without saving it to disk ([📚](#-sources--image-credits)). Your History screen now looks like the shot in [7.4](#74--the-7-day-history-loads-in-under-1-second-10-minutes), including markers 6–8: the table, the pages, and the **Download CSV** button.

#### 8.3 Open the CSV file and compare it with the table (5 minutes)

Open the downloads folder in **File Explorer**, then drag the `.csv` file into the VS Code window: its contents show as plain text, exactly as they are.

**Result (example, the contents of the author's recorded file):** 170 lines, that is, the header and 169 data lines from the oldest (line 171, which is empty, is only the end of the file). The BOM doesn't show, but it takes up the file's first three bytes.

```text
time_wib,device,avg_temp_c,min_temp_c,max_temp_c,avg_humidity_percent,avg_soil_percent,avg_light,reading_count
2026-10-17 16:00:00,Practice living room,30,29.5,30.4,75,43.3,1392.3,6
2026-10-17 17:00:00,Practice living room,29.3,29,30,78.7,42.2,542,6
…
2026-10-24 16:00:00,Practice living room,29.2,25.1,33,70,38.9,2082.4,248
```

Compare it with the table: the **last** CSV line equals the **first** row of page 1 (`29.2` in the CSV = `29.2` on the screen), and the **first** CSV data line equals the only row on page 8. If History was reloaded in between, the current hour's line may differ, because its bucket is still filling up.

Got Excel? Double-click the file. With Windows set to English (US/UK) regional settings, the columns should be separate and the numbers keep their decimal points, but the author couldn't try it in a real Excel (📚). If everything piles up in column A, follow [🚨](#-troubleshooting) *The CSV opens as one column in Excel, or `°C` looks garbled*. The author didn't try LibreOffice Calc or Google Sheets either; if asked for a separator, choose the comma.

**Save to the branch.** In the free terminal (the `frontend` folder, the `feature/dashboard-live` branch), run `git status`: `src/components/DeviceHistory.tsx` should be changed, with `src/csv.ts` and `src/components/HistoryTable.tsx` under `Untracked files`. The downloaded CSV file is outside the repository, so it doesn't come along. Then:

```text
git add src/csv.ts src/components/HistoryTable.tsx src/components/DeviceHistory.tsx
git commit -m "Paged history table and CSV download (Module 23 Practice 8)"
```

The code at the end of this practice is in [`code/stages/practice-8/frontend/`](code/stages/practice-8/frontend/).

> ⬆️ **Done with Practice 8?** Your History is now complete with a table and a CSV, but it's still opened from the laptop. Read [Concept 12](#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode), then continue to [Practice 9 — The dashboard on a phone over home Wi-Fi](#practice-9--the-dashboard-on-a-phone-over-home-wi-fi-60-minutes).

### Practice 9 — The dashboard on a phone over home Wi-Fi (60 minutes)

> 🖥️ **Tools used:** a **phone** (Android or iPhone) on the **same home Wi-Fi** as the laptop; **VS Code** with the `backend` terminal (backend v1.0, `npm run dev`), the **Vite terminal** in the `frontend` folder, and a **free terminal** in the `frontend` folder for `ipconfig` and Git (the laptop path adds the broker in `edge` and the simulator in `tools`); the `backend/.env` file; **Docker Desktop** (`smarthome-db` running); **Chrome or Edge** on the laptop; **Bruno** with the admin account (laptop path); and a second camera for the video in 9.5 (the laptop's camera or another phone). Concepts used: Concept 12.
>
> ⭐ **Required** — step 9.5: the first half of the pass requirement, on the phone. The live chart on the phone screen changes in **< 1 send interval + 1 second**, and the video is your proof.

Up to Practice 8, your dashboard could only be opened from the laptop itself: the backend listens on `127.0.0.1`, and Vite only serves `localhost`. Yet the pass requirement says "the chart **on your phone** changes". This practice turns on the **phone mode** of [Concept 12](#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode): the backend and Vite are temporarily opened to the home Wi-Fi, then the phone opens the dashboard through the laptop's IP address. No React code changes; the only changes are two lines of `backend/.env`, one npm script, and two comment lines in `.env.example`. Remember the safety rule: phone mode is only for a home Wi-Fi you trust, and it's switched back at the end of the session ([10.4](#104-switch-back-to-laptop-mode-5-minutes)).

> [!IMPORTANT]
> **An honest note: the author hasn't tried this practice with a real phone.** The **Expected output** boxes here were recorded on the author's laptop opening its own Wi-Fi IP address (`http://192.168.1.10:5173`). What's proven: `HOST`, `CORS_ORIGIN`, the login, the cookies, and the socket through the IP address. What was **not** tested: the phone screen, the **Private** firewall permission window, and a phone that falls asleep; the phone steps were put together from the backend v1.0 and dashboard v0.2 code. The details are in [📚 Sources](#-sources--image-credits).

**No phone?** A tablet or a second laptop on the same Wi-Fi can stand in for it, with the same steps. Without a second device, do as the author did: open `http://<laptop-IP>:5173` in your laptop's own browser, then turn on [DevTools device mode](../module-22-react-basics/README.md#71-devtools-device-mode-the-dashboard-at-375-768-and-1280-px-8-minutes) at 375 px wide. This tests the IP address, `CORS_ORIGIN`, and the socket, but does **not** yet prove "on your phone"; write that down honestly in the [✅ Checklist](#-module-23-completion-checklist).

#### 9.1 Find your laptop's Wi-Fi IP (5 minutes)

The phone needs your laptop's "house number", like the ESP32 in Module 10. `localhost` can't be used: to the phone, `localhost` is the phone itself. In the **free terminal**, type:

```text
ipconfig
```

**Expected output (example):** one block per network adapter. The author's laptop has seven blocks; only this one is used:

```text
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : lan
   Link-local IPv6 Address . . . . . : fe80::xxxx:xxxx:xxxx:xxxx%nn
   IPv4 Address. . . . . . . . . . . : 192.168.1.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
```

Read the `IPv4 Address` line in the **`Wireless LAN adapter Wi-Fi:`** block. This module's example is `192.168.1.10` (the same as Modules 10 and 22); your IP will differ, so replace every `192.168.1.10` below with yours. Other blocks, for example `vEthernet (WSL (Hyper-V firewall))` or an `Ethernet 3` that belongs to VirtualBox or a VPN, also have an `IPv4 Address`, but the phone can't reach them. The rule of thumb: the Wi-Fi block that has a `Default Gateway` (your router). macOS: `ipconfig getifaddr en0`.

Write the IP and the time you turned on phone mode in your learning notes ([➕ E](#e-save-your-learning-notes)). The IP is handed out by the router, so it **can change** tomorrow; if the phone suddenly can't open the dashboard, check the IP first.

#### 9.2 The backend in phone mode: `HOST` and `CORS_ORIGIN` (10 minutes)

1. In VS Code, open `backend/.env` (this file never goes into Git). Change the `HOST` and `CORS_ORIGIN` lines to:

   ```text
   HOST=0.0.0.0
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173
   ```

   - **`HOST=0.0.0.0`** means "listen on **all** the laptop's addresses": `127.0.0.1` for the laptop itself, plus the Wi-Fi address for the phone.
   - **The new origin at the end of `CORS_ORIGIN`** = the address of the page the phone will open. Write it exactly: `http`, not `https`, no `/` at the end, separated by commas without spaces. This one line applies to `fetch` **and** Socket.IO.
   - **The database isn't opened along with it:** its container stays at `127.0.0.1:5432`.

2. Save (**Ctrl + S**). A backend started with `npm run dev` restarts by itself because `.env` changed (with `npm start`: **Ctrl + C**, then run it again).

**Expected output (example)** in the `backend` terminal:

```text
Change detected in 'C:\\Users\\you\\mini-smart-home\\backend\\.env'
Restarting 'src/server.ts'
[16:49:53] INFO: database ready
[16:49:53] INFO: rules loaded: 0 active of 0
[16:49:53] INFO: device registry loaded: 4 registered devices
[16:49:53] INFO: Telegram notifications off: TELEGRAM_BOT_TOKEN is empty
[16:49:53] INFO: Server listening at http://127.0.0.1:8080
[16:49:53] INFO: Server listening at http://172.x.x.x:8080
[16:49:53] INFO: Server listening at http://192.168.x.x:8080
[16:49:53] INFO: Server listening at http://192.168.x.x:8080
[16:49:53] INFO: Server listening at http://192.168.1.10:8080
[16:49:53] INFO: API docs: http://0.0.0.0:8080/docs
[16:49:53] INFO: connected to broker mqtt://127.0.0.1:1883 as backend
```

There's one `Server listening at …` line for **every** laptop address; what matters is that `127.0.0.1` and your Wi-Fi IP are there. The `0.0.0.0` in the `API docs:` line only means every door is open, not an address to open (`/docs` stays at `http://localhost:8080/docs`). The double backslashes really look like that on the screen; the rules, devices, Telegram, and broker lines follow your database and `.env`. On the author's laptop, the backend answered through the IP ±4 seconds after the file was saved.

> [!WARNING]
> **Don't write `HOST=192.168.1.10`.** The backend then **only** listens on the Wi-Fi address. On the author's laptop, `localhost:8080` was refused at once (`ECONNREFUSED`), and the dashboard at `http://localhost:5173` showed the box `Can't reach the server at http://localhost:8080. Maybe the backend …`.

3. **In the frontend, no address needs to change.** The `BASE` formula in `api.ts` (Module 22): if `VITE_API_BASE` is empty, the API address = the page's host name + `:8080`. The page `http://192.168.1.10:5173` on the phone automatically calls `http://192.168.1.10:8080`, and `socket` uses the same `BASE` ([1.4](#14-one-socket-for-the-whole-app-srcsocketts-10-minutes)). There's one trap: if your `frontend/.env.local` holds an active `VITE_API_BASE=…` line, put a `#` in front of it; otherwise the phone calls `localhost:8080`, which is the phone itself. So you don't forget, add these two lines to `frontend/.env.example`, right above its last line (`# VITE_API_BASE=http://localhost:8080`):

   ```text
   # Module 23: opening the dashboard from a phone (npm run dev:phone)? Keep the line below commented out with #: the page
   # http://<laptop-IP>:5173 on the phone calls the API at http://<laptop-IP>:8080 by itself, and the live connection follows it.
   ```

   The whole file: open [`code/stages/practice-9/frontend/.env.example`](code/stages/practice-9/frontend/.env.example) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `.env.example`.

#### 9.3 Vite in phone mode: `npm run dev:phone` and the Private firewall setting (10 minutes)

By default, Vite only serves `localhost`, and that's left alone on purpose: `vite.config.ts` is **not** changed, so `npm run dev` stays in laptop mode. For phone mode we add a command named `dev:phone` = Vite with `--host` (listen on all addresses), so you don't mistype `npm run dev -- --host`.

1. In the **Vite terminal**, press **Ctrl + C**.
2. In the same terminal, run these one at a time:

   ```text
   npm pkg set scripts.dev:phone="vite --host"
   npm run dev:phone
   ```

   `npm pkg set` stays silent; it writes `"dev:phone": "vite --host"` at the end of the `scripts` section of `package.json`.

**Expected output (example):**

```text
> mini-smart-home-frontend@0.1.0 dev:phone
> vite --host


  VITE v8.3.5  ready in 855 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://172.x.x.x:5173/  vEthernet (WSL (Hyp…
  ➜  Network: http://192.168.x.x:5173/  Ethernet 3
  ➜  Network: http://192.168.x.x:5173/  Ethernet 4
  ➜  Network: http://192.168.1.10:5173/  Wi-Fi
  ➜  press h + enter to show help
```

Vite 8 writes the adapter's name at the end of each `Network:` line. Use the line ending in **`Wi-Fi`**: its IP must be the same as in 9.1 and as the IP in `CORS_ORIGIN`. Your laptop keeps using `http://localhost:5173`.

3. **Windows: the firewall permission window.** Since the backend restarted in 9.2, Windows may show a **Windows Security** window for **Node.js JavaScript Runtime**. Allow it **only for Private**, and make sure your home Wi-Fi profile is a **Private network**, exactly as in [Module 10 Practice 7.2](../../phase-2-connectivity/module-10-wifi-and-http/README.md#72-start-the-receiver-on-the-laptop) steps 3–5 (which also explains how to unblock it if you once chose **Cancel**). The permission is for the Node.js program, so it covers Vite and the backend at once. **macOS:** if asked about `node`, choose **Allow**.

> [!NOTE]
> **The author didn't test this firewall step.** The firewall settings of the author's laptop were deliberately left untouched (its Wi-Fi profile is *Public*), and no permission window was answered; a laptop that opens its own IP doesn't go through that permission. If your phone can't open the page in 9.4, the firewall is the first suspect.

#### 9.4 Open it from the phone: `/health` first, then log in with the viewer account (10 minutes)

Make sure the phone is on the same home Wi-Fi (not the guest Wi-Fi), and that the VPN is off on both the phone and the laptop.

1. **Test the path first.** In the phone's browser, open `http://192.168.1.10:8080/health` (a route without login).

   **Expected output (example, opened by the author from the laptop's browser through the Wi-Fi IP, not from a phone):**

   ```text
   {"ok":true,"broker":true,"database":true,"received":10,"rejected":0,"ignored":1}
   ```

   Your numbers differ. If the page spins and then fails, the problem is in the network (IP, guest Wi-Fi, firewall, VPN): see [🚨](#-troubleshooting) *The phone can't open the dashboard at the laptop's IP address*. Don't continue before this step works.
2. **Open the dashboard** at `http://192.168.1.10:5173`. The login form appears: cookies are stored per browser and per host name, so the phone's browser doesn't have them yet. Even on the author's laptop, opening the IP address after logging in at `localhost` brought up the login form, because `localhost` and `192.168.1.10` are two different names ([Module 22 Concept 9](../module-22-react-basics/README.md#9-logging-in-from-the-browser-cookies-cors-and-localhost)).
3. **Log in with the viewer account** (`viewer@home.test`). On the phone you only look (the control buttons only come in Module 24), so the smallest possible rights are enough.

**Result (example, on the author's laptop through the IP):** the **Live** badge, and in the **Practice living room** details the text `updated at … WIB` moves forward every ±10 seconds (`16:50:30` → `16:50:40 WIB`). The `access` and `session` cookies for the IP address are still **HttpOnly** and **SameSite=Strict**: `:5173` and `:8080` on the same IP count as one site, like `localhost`. In the `backend` terminal:

```text
[16:50:31] INFO: login: account 2 (viewer), session 21, IP 192.168.1.10
[16:50:31] INFO: realtime client connected: S4c3T03fexbGO0kmAAAB (account 2, viewer)
```

then three `client … follows …` lines and `GET /devices/…/readings?from=…Z -> 200` when the details open. The author opened it from the laptop, so the `IP` in the login line = the laptop's IP; from a phone, it shows your phone's address, proof that it was the phone that logged in.

A `Can't reach the server at http://192.168.1.10:8080. …` box or a badge stuck at `Reconnecting…` → check `CORS_ORIGIN` (on the author's laptop, removing the IP from `CORS_ORIGIN` caused exactly those two symptoms). A box naming `http://localhost:8080` → `VITE_API_BASE` is still active. The fix is in [🚨](#-troubleshooting) *The dashboard opens on the phone, but the login fails or the socket keeps getting `xhr poll error`*.

#### 9.5 ⭐ The first pass requirement on the phone: record the chart changing (15 minutes)

The requirement: covering the LDR changes the chart **on your phone** in **< 1 send interval + 1 second**. Node 1 sends every 10 seconds, so the hard limit is **< 11 seconds**; thanks to Module 11's *report-by-exception*, it's usually ≈ 1–2 seconds. You already tested it on the laptop in [4.4](#44--the-line-moves-by-itself-temp-33-the-lamp-or-the-ldr-10-minutes); now repeat it on the phone while **recording a video** with a second camera that sees both the phone screen and the trigger. At 30 frames per second, a video is precise to ±0.03 seconds.

On the phone, open the **Node 1 living room** details (laptop path: **Practice living room**), with the screen kept on and the dashboard tab in front.

- **Device path:** choose **Light** in the live chart. Make sure the room is bright (or shine a flashlight on the LDR): an immediate send only happens when `light` **crosses** the 1000 threshold. Start recording, cover the LDR with your hand for ±5 seconds, then uncover it. The **Light** line should drop ≈ 1–2 seconds after the LDR is covered. The author has no recording of a real Kit for this step.
- **Laptop path** (a simulator without an LDR), the two tests of [4.4](#44--the-line-moves-by-itself-temp-33-the-lamp-or-the-ldr-10-minutes): (1) start recording, type `temp 33` in the simulator terminal, and press **Enter**: the **Temperature** line on the phone rises to 33 with the next message (on the author's laptop, the card changed 3.9–4.9 seconds after **Enter**); (2) send the lamp-on command from Bruno (the admin account, `f00d00000001`), then turn the lamp off again: a new point appears outside the 10-second schedule and the **Lamp** card changes (on the author's laptop, < 0.1 seconds after the command was sent). The second test proves the immediate-send pipe, not the light sensor.

Play the video slowly, then write the difference between the second of the trigger and the second of the new point in your learning notes.

**You pass this ⭐ step** when your video shows the phone screen with the **Live** badge and **Light** changing less than 11 seconds after the LDR is covered (usually ≈ 1–2 seconds), or, on the laptop path, **Temperature** rising to 33 less than 11 seconds after **Enter** and a new point appearing as soon as the lamp command is sent. Keep the video: it's the proof of the pass requirement and a demo video of your dashboard at the same time. Using a tablet, a second laptop, or device mode? Write that down honestly in ✅.

#### 9.6 Dark mode on the phone, and a phone that falls asleep (10 minutes)

**Dark mode.** The dashboard follows the system setting (Concept 10). Turn on the dark theme in your phone's display settings (its name differs per brand), then go back to the browser. The background and cards should darken, the chart's grid lines dim, and the badges and the green/red left edges of the list cards stay readable, like the picture in [5.3](#53-dark-mode-dark-classes-and-chart-colors-20-minutes), which the author made with DevTools emulation, not a real phone. Something unreadable? See 🚨 *Dark mode: black chart lines or text on a dark background*.

**A phone that falls asleep.** On a device's details, lock the phone screen for ±1 minute, then unlock it. A phone's browser may delay or cut the connection of a page that isn't showing. The author has tested reconnecting on the laptop (backend restarted, the 15-minute wristband expired), not yet with a sleeping phone, so this is what **should** happen:

- If the connection did drop, the badge turns `Reconnecting…`, then **Live** again without reloading. The dashboard sends `follow` again and refills the 5-minute window from the database, so the readings from while the screen was off still show in the chart.
- Asleep for more than 15 minutes? The `access` wristband has expired: the dashboard renews it with the `session` season pass, then reconnects (Concept 2).
- Status changes **while** the connection was down aren't sent again (🔬 *Two limits of v0.2*): if a card looks wrong, open the Device List again or reload the page. Badge stuck at `Reconnecting…`? See [🚨](#-troubleshooting) *On the phone, the badge stays `Reconnecting…` after the screen was locked*.

**Save to the branch.** In the **free terminal** (the `frontend` folder, the `feature/dashboard-live` branch), `git status` should only name `.env.example` and `package.json` as `modified:` (`backend/.env` is ignored by Git).

```text
git add package.json .env.example
git commit -m "Phone mode: the dev:phone script and the VITE_API_BASE note (Module 23 Practice 9)"
```

> ⬆️ **Done with Practice 9?** Leave phone mode on for now: [Practice 10](#practice-10--the-pass-tests-lint-build-a-dress-rehearsal-and-laptop-mode-35-minutes) uses it for the rehearsal, then switches back to laptop mode in [10.4](#104-switch-back-to-laptop-mode-5-minutes). If you stop before Practice 10, switch back to laptop mode now with [10.4](#104-switch-back-to-laptop-mode-5-minutes) and turn phone mode on again (9.2–9.3) when you continue.

### Practice 10 — The pass tests: lint, build, a dress rehearsal, and laptop mode (35 minutes)

> 🖥️ **Tools used:** **VS Code** with the terminals as in Practice 9: the `backend` terminal (backend v1.0, still in phone mode), the **Vite terminal** in the `frontend` folder (first `npm run dev:phone`, then the build, the version, `preview`, and `npm run dev`), and a **free terminal** in the `frontend` folder for `npm run lint` and Git. The laptop path adds the broker terminal (`edge`), the simulator (`tools`), and **Bruno** with the admin account. Then **Docker Desktop** (`smarthome-db` running), **Chrome or Edge** with DevTools, and a **phone** on the same home Wi-Fi (no phone: DevTools device mode). Concepts used: all of them (the rehearsal).
>
> ⭐ **Required** — step 10.3: a dress rehearsal of both Syllabus pass requirements in one go, on the build: the chart on the phone changes < 11 seconds after the LDR is covered (laptop path: after the lamp command from Bruno), and the 7-day history loads in < 1 second.

This last practice adds no features. You check the dashboard like an examiner: oxlint and `npm run build` (10.1), version **0.2.0** (10.2), both pass requirements on the **ready-to-serve dish**, not in the kitchen (10.3), then the laptop is put back into a safe state (10.4).

#### 10.1 `npm run lint` is clean, `npm run build` passes with one warning (10 minutes)

Leave everything running. In the **free terminal** (the `frontend` folder), run:

```text
npm run lint
```

**Expected output (example):**

```text
> mini-smart-home-frontend@0.1.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 72ms on 22 files with 116 rules using 8 threads.
```

**Clean** means `0 warnings and 0 errors`; the duration and threads follow your laptop; 22 files = `vite.config.ts` + 21 `.ts`/`.tsx` files in `src`. If there are findings, compare the files it names with [`code/stages/practice-10/frontend/`](code/stages/practice-10/frontend/), then repeat until there are no errors **and** no warnings.

Then stop `npm run dev:phone` in the **Vite terminal** (**Ctrl + C**; port 5173 is used by the dish in 10.3), and cook the dish:

```text
npm run build
```

**Expected output (example):**

```text
> mini-smart-home-frontend@0.1.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
✓ 943 modules transformed.
computing gzip size...
dist/index.html                   0.54 kB │ gzip:   0.34 kB
dist/assets/index-Bvotokr-.css   19.66 kB │ gzip:   4.74 kB
dist/assets/index-BdL55RMQ.js   679.22 kB │ gzip: 201.47 kB

✓ built in 561ms
[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

Read it from the top:

- **`tsc -b`** stays silent: no type errors.
- **`✓ built in …`**: the dish in `dist/` is ready. The yellow block after it, starting with `[plugin …]`, is a **warning**, not an error; a failed build never gets as far as `✓ built in`.
- **What it says:** the `index-….js` file (679.22 kB) goes over the 500 kB limit Vite uses for its reminder. The main cause is Recharts: in the code stages, this file is ±286 kB at the end of Practice 3, then ±635 kB at the end of Practice 4, when the first chart comes in (v0.1: 230.75 kB).
- **Its suggestions:** splitting the code with `import()` is taken apart in [🔬](#-technical-deep-dive-optional) (*Splitting the bundle with `React.lazy`*); raising `chunkSizeWarningLimit` only silences the warning, and the file stays big, so **don't**.

This module deliberately leaves it, to keep the code simple; the "7-day history < 1 second" requirement in 10.3 is measured on this very dish. This week's benchmark: **the build passes with one size warning that has been explained**; any other warning or error means something is wrong ([🚨](#-troubleshooting), *`npm run build` writes `Some chunks…`*). The pull request template gets the same item in [➕ C](#c-add-the-module-23-items-to-the-pull-request-template). File names, sizes, and the duration may differ on your laptop.

#### 10.2 Dashboard v0.2.0: a new version (5 minutes)

The Syllabus calls this week's result **dashboard v0.2 (live)**. The package name has been `mini-smart-home-frontend` since Module 22, so this time only the version changes. In the Vite terminal, run these one at a time:

```text
npm pkg set version=0.2.0
npm install
```

`npm pkg set` prints nothing when it succeeds. `npm install` is required afterwards, because `npm pkg set` doesn't touch `package-lock.json` (Module 22 Practice 8.3).

**Expected output (example):**

```text
up to date, audited 95 packages in 4s

14 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

`up to date`: no package was installed or removed. In `package.json`, only the `"version": "0.2.0"` line changes; in `package-lock.json`, two version lines.

Run `npm run build` once more. Its first line is now `> mini-smart-home-frontend@0.2.0 build`; the rest is the same, including the file names and the 500 kB warning, because the version isn't cooked into the dish.

#### 10.3 ⭐ A dress rehearsal of both pass requirements (15 minutes)

The Syllabus pass requirement: **covering the LDR with your hand changes the chart on your phone in < 1 send interval + 1 second (with Module 11's *report-by-exception*: about 1–2 seconds), and the 7-day history loads in < 1 second.** Steps [4.4](#44--the-line-moves-by-itself-temp-33-the-lamp-or-the-ldr-10-minutes), [7.4](#74--the-7-day-history-loads-in-under-1-second-10-minutes), and [9.5](#95--the-first-pass-requirement-on-the-phone-record-the-chart-changing-15-minutes) proved it piece by piece; now both are tested in one go, on the phone, on the dish from `npm run build`. If one step fails, fix it, then start again from the beginning.

> [!NOTE]
> The author measured the second requirement on `npm run preview` on the laptop (Edge); the author hasn't tried the rehearsal on a real phone. No phone? Run the same steps on the laptop through `http://<laptop-IP>:5173` with DevTools device mode at 375 px wide ([Module 22 Practice 7.1](../module-22-react-basics/README.md#71-devtools-device-mode-the-dashboard-at-375-768-and-1280-px-8-minutes)); the ✅ Checklist records this path.

**Preparation.**

1. The backend is still in phone mode from 9.2 (`HOST=0.0.0.0`, the laptop's IP in `CORS_ORIGIN`), and its data source is running: Node 1 and Node 2 (device path), or the locked broker and the `f00d00000001` simulator (laptop path).
2. In the Vite terminal, serve the dish to the home Wi-Fi:

```text
npm run preview -- --host
```

`--` passes `--host` on to `vite preview` (like `dev:phone` for the kitchen). The Module 22 line `Network: use --host to expose` now turns into one line per network adapter; use the one ending in `Wi-Fi`, for example `➜  Network: http://192.168.1.10:5173/  Wi-Fi` (your IP from 9.1).

3. On the phone, open `http://192.168.1.10:5173` (use your IP). If the **Device List** shows right away, click **Log out** first: the rehearsal starts from the login form. Log in with the **viewer** account; the **Live** badge must light up.

**Requirement A: the chart on the phone changes in < 11 seconds.**

4. Open the Node 1 details (laptop path: **Practice living room**, `f00d00000001`), then start the video recorder as in 9.5.
5. **Device path:** choose **Light** in the chart picker, then cover the LDR with your hand (in a bright room). **Laptop path:** in Bruno, send **`login admin`**, then **`lamp on`** to `f00d00000001`; the **Lamp** card shows `On` and a new point appears. Then type `temp 33` in the simulator terminal (still 33 from 9.5? `temp random` first, and wait for one message): the **Temperature** line rises with the next message.
6. Play the video, then measure the time from your hand covering the LDR (laptop path: from the Bruno request being sent) until the chart changes.

**Requirement B: the 7-day history in < 1 second.**

7. Click **History →**; the **7 days** range is picked right away. Read the small text above the chart, then click **← Back to the details** and repeat until you've done it three times. Write down the slowest.

**Expected output (example, `npm run preview` on the author's laptop):**

```text
Average per hour, last 7 days (point = start of each hour) · 169 points · loaded in 90 ms
```

Three openings: 90, 40, and 51 ms, far below 1,000 ms. The backend log records **one** line per opening, for example `[16:57:20] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (47 ms)`: the dish has no `StrictMode` shake, unlike the two lines in the kitchen (7.4). A phone has no **Network** tab; that's why the "loaded in" text is part of the v0.2 code.

**You pass this ⭐ step** when, in one go, on the `npm run build` result served by `npm run preview -- --host`: (1) the viewer login on the phone takes you to the **Device List** with the **Live** badge; (2) the video shows the chart on the phone changing in < 11 seconds (usually ≈ 1–2 seconds) after the LDR is covered (laptop path: after the lamp command is sent; this path tests the immediate-send pipe, not the light sensor); and (3) the 7-day history writes `loaded in` under 1,000 ms in all three tries. That's the Module 23 pass requirement.

#### 10.4 Switch back to laptop mode (5 minutes)

Phone mode opens the backend and the dashboard to every device on the Wi-Fi. Turn it off as soon as the session is over, and always before the laptop goes to another network (safety rule number 4).

1. In `backend/.env`, put `HOST` back and delete the IP address you added to `CORS_ORIGIN` in 9.2, then save:

```text
HOST=127.0.0.1
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

The backend restarts by itself; its new log only writes one `Server listening at http://127.0.0.1:8080`, without the Wi-Fi address.

2. In the Vite terminal, stop the dish (**Ctrl + C**), then run `npm run dev`. The line `➜  Network: use --host to expose` appears again.
3. Reload `http://192.168.1.10:5173` on the phone: the page can't be opened anymore (from the laptop, that address is refused with `ERR_CONNECTION_REFUSED`). `http://localhost:5173` on the laptop stays **Live**.

**Save to the branch.** In the free terminal (the `frontend` folder, the `feature/dashboard-live` branch), `git status` only shows `package.json` and `package-lock.json` as `modified:`; `backend/.env` and `dist/` don't go into Git. If `public/try-live.html` or the `src/loadtest/` folder still shows up, delete it first. Save:

```text
git add package.json package-lock.json
git commit -m "Dashboard v0.2.0: clean lint, build passes with one size warning (Module 23 Practice 10)"
```

The Module 23 code is now complete on the `feature/dashboard-live` branch; the only difference from [`code/frontend/`](code/frontend/) is `README.md` (➕ B). `git push` waits for ➕ D.

> ⬆️ **Done with Practice 10?** Your dashboard v0.2.0 is clean, passes the build, has passed the rehearsal, and your laptop is back in laptop mode. Continue to [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home) for the README, the pull request template, and the "dashboard v0.2 (live)" pull request; the [🧩 Independent Challenges](#-independent-challenges) can be done afterwards, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title most like your problem. Vite, Tailwind, and basic login problems are in the [🚨 of Module 22](../module-22-react-basics/README.md#-troubleshooting); backend, database, broker, and simulator problems are in the 🚨 of Modules 16–21. Before that, glance at these five places:

1. **The connection badge** next to the dashboard title: `Live`, `Reconnecting…`, or `Disconnected`?
2. **The backend terminal**: still running, and does every login write one `realtime client connected: …`, then (since Practice 2) one `… follows <device_id>` per device?
3. **The `frontend` terminal**: is Vite running (`npm run dev`, or `npm run dev:phone` in phone mode)?
4. **The Console tab** (**F12**): the top red line usually names the cause.
5. **The Network tab**, the **Socket** filter (**WS** in older versions): click the `socket.io/?EIO=4…` row, then **Messages**. Since Practice 2: is there a `42["telemetry", …]` every ±10 seconds?

Still stuck? Compare your files with [`code/stages/`](code/stages/) at the end of the same practice.

<details>
<summary><b>Old instructions → what's right for our versions (socket.io-client 4.8.4, Zustand 5.0.16, Recharts 3.10.1, date-fns 4.4.0)</b></summary>

Internet tutorials for old versions can fail, or quietly break things, in our project. Replace the left column with the middle one:

| Old instruction | What's right for our versions | Why |
| :--- | :--- | :--- |
| `socket.io-client` 2.x, `io.connect(url)` | `io(BASE, { withCredentials: true, autoConnect: false })` from `socket.io-client@4.8.4` | A v1/v2 client is refused by a v4 server (`Unsupported protocol version`); without `withCredentials`: `not logged in` (Concept 2) |
| `npm install @types/socket.io-client` | Not needed | The types come with the package; that old package can cause errors |
| A token in `query`, `auth`, or `localStorage` | The same `HttpOnly` cookie as `fetch` | XSS (Module 20); `withCredentials` carries it |
| `transports: ["websocket"]` | The default: polling first, then the upgrade to WebSocket | Explained in 🔬 |
| `socket.emit("follow", id)` without an answer | `socket.timeout(5000).emitWithAck("follow", id)` | Without an *ack*, the server quietly doesn't put you in the *room* |
| `setInterval(() => fetch(…), 5000)` | Socket.IO events; `setInterval` only for the clock (`useNow`) | That's polling (Concepts 1 and 6) |
| Redux + `connect()`, or Context for live data | Zustand + selectors | Concept 4; the comparison is in 🔬 |
| `import create from "zustand"` | `import { create } from "zustand"` | Zustand 5 has no *default export* |
| `create((set) => …)` | `create<LiveStore>()((set) => …)` | The double parentheses = the TypeScript way in Zustand 5 |
| The whole `useLiveStore()`, `?? []` in a selector | `useLiveStore((s) => s.connection)`, `?? EMPTY` | Wasted re-renders; a white screen |
| moment.js, `format(date, "HH:mm")` | `wibTime()` (`Intl`, `timeZone: "Asia/Jakarta"`); date-fns 4 for relative time | Without a zone, the time follows the laptop/phone setting |
| `<ResponsiveContainer>` | `responsive` + `style={{ width: "100%", height: 240 }}` | Recharts 3.3+ |
| `activeIndex`, `TooltipProps` | `activeIndex` was removed; a custom tooltip uses `TooltipContentProps` | Recharts 3 |
| `darkMode: 'class'` in `tailwind.config.js` | `dark:` classes directly (following the system setting) | Tailwind v4; a theme button is in 🔬 |
| `` stroke={`var(--color-${color}-500)`} `` | `stroke="var(--color-sky-500)"` (the full name) | Tailwind only outputs the variables that are written out in full |
| `host: true` in `vite.config.ts` | `npm run dev:phone` only when needed | The safety rules (Concept 12) |

</details>

<details>
<summary><b>The socket is refused with <code>not logged in</code>, even though the device list appears</b></summary>

**Symptom:** the device list appears (so `fetch` already carries the cookie), but the badge shows `Reconnecting…`, then `Disconnected`, and the numbers don't move. In **Network**, the answer of the `socket.io/?EIO=4&transport=polling…` row holds `44{"message":"not logged in"}`. In `try-live.html` (Quick Win), `Not connected yet: not logged in` means you haven't logged in to the dashboard yet.

**Cause:** the Socket.IO handshake goes to another port (8080), and the browser only carries the cookie there when asked to. Without `withCredentials: true`, the Socket.IO door guard doesn't see a wristband. The dashboard renews the wristband and tries again, is refused again, and after three times stops at `Disconnected`.

**Steps:** make sure `src/socket.ts` says exactly `io(BASE, { withCredentials: true, autoConnect: false })` ([1.4](#14-one-socket-for-the-whole-app-srcsocketts-10-minutes)), save, then **F5**.

</details>

<details>
<summary><b><code>xhr poll error</code> again and again, or a red CORS message in the Console tab</b></summary>

**Symptom:** the badge is stuck at `Reconnecting…` and never shows `Disconnected`, because Socket.IO keeps trying by itself. Code that prints the `connect_error` message (like `try-live.html`) writes `xhr poll error`. The difference shows in the **Console**:

| The red line contains… | Meaning → step |
| :--- | :--- |
| `net::ERR_CONNECTION_REFUSED` | The backend is down → look at the backend terminal. Once the backend is up, the badge goes back to `Live` by itself. |
| `has been blocked by CORS policy` + `from origin 'http://…'` | The page's origin isn't in `CORS_ORIGIN` → open `http://localhost:5173`; in phone mode, add `http://<laptop-IP>:5173` ([9.2](#92-the-backend-in-phone-mode-host-and-cors_origin-10-minutes)), then **F5**. |

Firefox words the CORS message differently (`CORS header 'Access-Control-Allow-Origin' missing`); it means the same. On reload, the red box `Can't reach the server at …` usually appears too. Don't write `CORS_ORIGIN=*` (the reason is in the 🚨 of Module 22).

</details>

<details>
<summary><b>Every reading shows up twice, or more often each time you switch screens</b></summary>

**Symptom:** a `console.log` in your listener prints twice (or once more every time you switch screens), or the backend log writes `realtime client connected` more than once for one login. What's right (tried by the author, with StrictMode too): one connection per login.

**Causes and steps:**

1. **`io(…)` is written inside a component or an effect**, so every mount makes a new socket. Make only one `socket`, in `src/socket.ts`, outside the components ([1.4](#14-one-socket-for-the-whole-app-srcsocketts-10-minutes)).
2. **`socket.on` without `socket.off` in the cleanup**, so the listeners pile up (remember 🔁 Step 3: `telemetry listeners now: 2`). Remove it with the same named function: `socket.off("telemetry", onTelemetry)`. `socket.off("telemetry")` without a function removes **all** the listeners of that event, including those of other parts.
3. **`handleSessionExpired` in `App.tsx` without `useCallback`.** Every time App re-renders, the connection effect is repeated: the backend log writes `realtime client disconnected`, then `realtime client connected`, every time you switch screens.

</details>

<details>
<summary><b>The badge says <code>Live</code>, but the numbers don't move</b></summary>

Check in order:

1. **The sender really is quiet.** The simulator stopped (its card shows `Offline`), Node 2 only sends every 5 minutes, and a device with `key revoked` or `not registered` deliberately isn't followed (its card says `messages ignored by the backend`). Test with `temp 33` in the simulator terminal: the card changes with the next message, within 0–10 seconds (the author: 3.9–4.9 seconds).
2. **`follow` without an answer (*ack*).** The server quietly ignores it, so the backend log doesn't write `follows`. Use `emitWithAck` ([2.2](#22-the-telemetry-and-status-listeners-in-userealtime-15-minutes)).
3. **`follow` isn't repeated after reconnecting.** The *rooms* are gone every time the connection drops, so the numbers stop after the badge was briefly `Reconnecting…`. `followAll()` must be called in `onConnect`.
4. **The card doesn't read the store.** The details read `useLiveStore((s) => s.latest[id])`, not a state left over from Module 22 ([2.4](#24-device-details-reads-from-the-store-5-minutes)).

</details>

<details>
<summary><b>The badge shows <code>Reconnecting…</code> after the backend is stopped, or about once every 15 minutes</b></summary>

**After the backend was stopped: normal.** While the backend is down, Socket.IO keeps trying by itself (Console: `net::ERR_CONNECTION_REFUSED`). Start the backend again: the badge goes back to `Live` without **F5**, a few to a dozen-odd seconds after `Server listening at …` (the author: 4.0 and 16.4 seconds). On Windows, **Ctrl + C** on `npm run dev` **sometimes** kills the backend abruptly (no stop log; Socket.IO reconnects by itself), and **sometimes** the backend manages to stop gracefully (`SIGINT received: the backend is stopping gracefully`; the dashboard tries to renew the wristband first, then reconnects anyway). With `npm start`, **Ctrl + C** always stops gracefully. Both recover by themselves. Saving a backend file (`--watch`) does the same: `Live` again in ±3 seconds. The author only tested Windows.

**About once every 15 minutes: also normal.** The wristband expires, the server cuts the socket, then the dashboard exchanges the season pass for a new wristband (one `POST /auth/refresh -> 200`) and reconnects in the same second. The badge only blinks.

**Stuck, even though the backend is running?** See the `xhr poll error` problem above.

</details>

<details>
<summary><b>The badge shows <code>Disconnected</code> and the dashboard doesn't reconnect by itself</b></summary>

**Cause:** apart from after **Log out**, `Disconnected` only appears when the door guard refuses the socket **more than 3 times in a row**, even after the wristband was renewed. The dashboard stops on purpose so it doesn't spin forever; v0.2 has no "try again" button yet. Two causes the author tried:

- **The database is down when the wristband has to be renewed.** `POST /auth/refresh -> 500` again and again, then `Disconnected`; the dashboard stays on screen.
- **The socket doesn't carry the cookie** (the `not logged in` problem above).

**Steps:** fix the cause, then reload the page (**F5**). The author: once the database was ready, F5 went straight to `Live` without a login. Back to `Disconnected` within a second? The **Network** tab shows the reason (`44{"message":…}`).

</details>

<details>
<summary><b>Reloaded while the database was still starting: back at the login form without a message</b></summary>

**Symptom:** the `smarthome-db` container has just been started again, you press **F5**, and the login form appears without a message, even though you didn't **Log out**.

**Cause:** for a few seconds after `docker start`, the database is still getting ready (backend log: `the database system is starting up`), so the refresh is answered with 500. Module 22's `request()` path treats that as "not logged in". Your season pass isn't deleted.

**Steps:** wait until `http://localhost:8080/health` says `"database":true`, then press **F5**. Already at the form? Wait until it's ready, then **F5**: you're logged in again without a password (tried by the author).

**Log out while the database doesn't answer** is answered with `POST /auth/logout -> 500` (the author waited ±5 seconds). Your screen still goes back to the form, but the session isn't deleted yet, so other tabs are **not** logged out along with it. Once the database is ready, reload that tab and click **Log out** again.

</details>

<details>
<summary><b>A card stays red <code>Offline</code>, even though its numbers move</b></summary>

**Cause:** a v0.2 limit. The backend sends the `status` event **only when the status changes**. If that change happens right while the socket is down (the backend restarted, the phone's Wi-Fi dropped), the dashboard misses it, and v0.2 doesn't ask for the status again after reconnecting. The author ran into it: a card stayed red `Offline` for more than 90 seconds even though new readings arrived every 10 seconds.

**Steps:** open one device, then go back to the list (the list is fetched fresh from `GET /devices`), or reload the page (**F5**): the card shows `Online`. The opposite can happen too (still `Online` although the device is off), but "last seen" and `· stale data` stay honest. The details are in [🔬](#-technical-deep-dive-optional) *Two limits of v0.2*.

</details>

<details>
<summary><b>A white screen with <code>Maximum update depth exceeded</code> in the Console tab</b></summary>

**Symptom:** a white screen (often right when the Details open). Console: `The result of getSnapshot should be cached to avoid an infinite loop`, then `Uncaught Error: Maximum update depth exceeded…`.

**Cause:** a selector returns a **new** array or object on every call, most often `useLiveStore((s) => s.windows[id] ?? [])` for a device that has no points yet. A new `[]` is never "the same" as the old one, so Zustand 5 thinks the data keeps changing, and React re-renders without end.

**Steps:** use an empty array that's always the same, `?? EMPTY` from `src/store.ts` ([4.1](#41-the-sliding-window-in-the-store-first-points-from-the-api-then-live-readings-15-minutes)). Don't build an object in a selector either (`(s) => ({ a: s.a, b: s.b })`): one value per selector (Concept 4).

</details>

<details>
<summary><b>The chart doesn't appear, or the time labels under it jump around</b></summary>

**An empty chart box without grid lines:** Recharts doesn't draw a chart that has no size. `LineChart` needs `responsive` **and** a height: `style={{ width: "100%", height: 240 }}` ([4.2](#42-livechart-a-time-axis-wib-times-and-no-animation-20-minutes)). The text `No readings in the last 5 minutes.` or `Waiting for the live connection…` isn't an error: the sender is quiet, or the socket isn't `Live` yet.

**Jumping labels** (one minute disappears, then comes back, for example `04:49 | 04:50 | 04:51 | 04:52 | 04:54` becomes `04:49 | 04:50 | 04:51 | 04:53 | 04:54`): an `XAxis` without `ticks`, so Recharts picks the label spots itself every second. Write `ticks={ticksEvery(start, now, MINUTE)}`. The author watched it for 195 seconds: the labels only changed when a new minute began.

</details>

<details>
<summary><b>The time on the screen is off by an hour or more, or the chart points are shifted from the real time</b></summary>

**Off by exactly 1 or 2 hours:** if you're in the WITA/WIT zone, that's deliberate: the dashboard always writes WIB, as in Module 22. If you're in WIB, the time is formatted without a zone (date-fns `format()`, `toLocaleTimeString()` without `timeZone`, `getHours()`), so it follows the laptop/phone setting. Use `wibTime()` and `wibHourMinute()` from `src/time.ts` ([3.1](#31-a-ticking-clock-and-relative-time-srctimets-15-minutes)).

**The newest point appears late, is cut off at the right edge, or is missing:** the time axis uses the **browser's** clock, while the points use the **device's** clock (`ts`). If the device's clock runs ahead, a new point hides at the right edge until the browser's clock catches up; if it lags behind by more than 5 minutes, the point is thrown away at once. Turn on the automatic clock on the laptop (Windows: **Settings → Time & language → Date & time → Set time automatically**) and the automatic date & time setting on the phone.

</details>

<details>
<summary><b>A straight line crosses a gap, or a gauge is always full</b></summary>

**A straight line across a pause without readings:** the empty (`null`) points aren't inserted, or `connectNulls` is written. `LiveChart` must use `const data = insertGaps(points, 25 * 1000);` (`HistoryChart` has a similar function), and `connectNulls` must not be written (its default is `false`). The author: the simulator stopped for 40 seconds → the line breaks into two segments.

**A gauge that's always full:** without `<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />`, the arc's scale is worked out from the data itself, so 32% and 41% are both full (the "wrong first" step in [5.1](#51-gauge-wrong-first-then-honest-15-minutes)). Add that line inside `RadialBarChart`.

</details>

<details>
<summary><b>Dark mode: black chart lines or text on a dark background</b></summary>

**Cause:** Recharts draws SVG with its own colors and doesn't know the `dark:` classes. A black or missing line usually means its color name was put together from pieces (`` `var(--color-${color}-500)` ``): Tailwind only outputs the variables that are written out in full, so that variable doesn't exist.

**Steps** ([5.3](#53-dark-mode-dark-classes-and-chart-colors-20-minutes)): write the full name (`stroke="var(--color-sky-500)"`); the grid lines, the tooltip background, and the gauge track use `var(--grid-color)`, `var(--panel-color)`, and `var(--track-color)` from `src/index.css`; the axis labels use `tick={{ fill: "currentColor" }}` inside a `text-slate-500 dark:text-slate-400` box. The green/red edge of the list cards is gone? The card's `dark:border-slate-700` covers it; repeat its color with a `dark:` variant (`border-l-green-500 dark:border-l-green-500`).

</details>

<details>
<summary><b>The 7-day history only has 2 points</b></summary>

**Cause:** the 7-day history is read from the hourly summary book (Module 18). The automatic clerk had already summarized the old hours before `npm run seed-history` filled them, and it only redoes the last 3 days every 30 minutes; the latest hours are counted directly. On a brand-new database, the result may be full right away.

**Steps:** run `CALL refresh_continuous_aggregate(…)` with the 8-day limit, as in [7.1](#71-prepare-7-days-of-data-and-check-it-in-bruno-10-minutes), then open History again. The author: 2 points before that command, `"count":169` after it (7 × 24 + 1; your number depends on the hour).

</details>

<details>
<summary><b>Bruno answers <code>400</code> for <code>bucket</code> or <code>from</code></b></summary>

- **`bucket`** can only be `15m`, `1h`, or `1d`; any other value is answered with `querystring/bucket Invalid option: …`. A range that needs more than 1,000 buckets is refused too.
- **`from`/`to`** must have a zone (`…Z` or `…+07:00`); without a zone the answer is `querystring/from Invalid ISO datetime`. In Bruno, write `+` as it is (`%2B` is actually refused); the safest is the `Z` ending.

The dashboard isn't affected: History uses the API's defaults without `from`, and the 5-minute chart uses `toISOString()` (ending with `Z`).

</details>

<details>
<summary><b>History doesn't offer air pressure, battery, or (for Node 2) Light</b></summary>

Not an error. The summary book only keeps temperature (average, lowest, highest), air humidity, soil moisture, and light; the History screen says so at the very bottom. Air pressure, battery, and the water tank are only in the live cards. Node 2 has no light sensor, so its choices are **Temperature**, **Humidity**, and **Soil**.

</details>

<details>
<summary><b>The CSV opens as one column in Excel, or <code>°C</code> looks garbled</b></summary>

**One column:** Excel splits CSV columns with the Windows *list separator*. Our CSV uses commas (`,`) and decimal points, which suits English (US/UK) settings; with Indonesian or many European settings the separator is `;`, so the content can pile up in one column. Open it with **Data → Get Data → From File → From Text/CSV**, choose the **Comma** delimiter, and compare the decimals with the table; in LibreOffice or Google Sheets, choose the comma when opening.

**A garbled `°C`** (for example `Â°C`; in our CSV only in device names): the file has no BOM. `toCsv()` must start with `"\uFEFF"` ([8.2](#82-srccsvts-and-the-download-csv-button-15-minutes)); the first three bytes of the author's file are `ef bb bf`. The author hasn't opened it in a real Excel.

</details>

<details>
<summary><b>Covering the LDR doesn't change the chart right away</b></summary>

**Cause:** Node 1 only sends **immediately** when the light crosses the dark/bright threshold (`light` 1000). In a dim room, the number is already below 1000, so covering the LDR doesn't cross that threshold, and the change is only sent on the next 10-second schedule.

**Steps:** light up the LDR first (a room lamp or a phone flashlight) until Light is above 1000, wait for one message, then cover it fully. The simulator doesn't imitate an LDR (its light is random): use the lamp command from Bruno (an immediate send, < 0.1 seconds) or `temp 33` (0–10 seconds), as in [4.4](#44--the-line-moves-by-itself-temp-33-the-lamp-or-the-ldr-10-minutes).

</details>

<details>
<summary><b><code>npm run build</code> writes <code>Some chunks are larger than 500 kB after minification</code></b></summary>

Not an error: the build has already passed (`✓ built in …`), and then Vite reminds you that its JavaScript file is big. Since Practice 4, Recharts is bundled in; the author got `dist/assets/index-BdL55RMQ.js 679.22 kB │ gzip: 201.47 kB` (your numbers may differ slightly). Practices 1–3 don't show it yet.

Leave it: this is the only warning allowed to appear (the template item in [➕ C](#c-add-the-module-23-items-to-the-pull-request-template)). Don't raise `build.chunkSizeWarningLimit` just to hide it; the way to make it disappear by splitting the bundle is in [🔬](#-technical-deep-dive-optional). What is **not** allowed: a `TS…` error, or an `npm run lint` that isn't clean (10.1).

</details>

<details>
<summary><b>The phone can't open the dashboard at the laptop's IP address</b></summary>

The author tested phone mode through the laptop's Wi-Fi IP address from the laptop itself, not yet from a real phone; these three phone problems were put together from that test and the usual symptoms. From the phone, first open `http://<laptop-IP>:8080/health` (it must be `{"ok":true,…}`), then check in order:

1. **The wrong IP.** `npm run dev:phone` writes several `Network:` lines; use the one ending in `Wi-Fi` (in `ipconfig`: the `Wireless LAN adapter Wi-Fi:` block that has a `Default Gateway`). The addresses of other adapters (WSL, Docker, VPN) can't be opened by the phone.
2. **Vite is still in laptop mode.** `npm run dev` writes `Network: use --host to expose`, and the IP address is refused (`ERR_CONNECTION_REFUSED`). Run `npm run dev:phone` ([9.3](#93-vite-in-phone-mode-npm-run-devphone-and-the-private-firewall-setting-10-minutes)).
3. **`/health` doesn't open, but the page does:** the backend's `HOST` is still `127.0.0.1` ([9.2](#92-the-backend-in-phone-mode-host-and-cors_origin-10-minutes)).
4. **A different network:** the phone is on the guest Wi-Fi, mobile data, or a router that isolates devices. Connect the phone to the same Wi-Fi.
5. **A firewall or VPN:** the laptop's Wi-Fi profile must be **Private**, and Node.js must be allowed for Private (9.3); turn off the VPN.
6. **The IP changed** (the router restarted): find it again ([9.1](#91-find-your-laptops-wi-fi-ip-5-minutes)), then update `CORS_ORIGIN` and the address on the phone.

</details>

<details>
<summary><b>The dashboard opens on the phone, but the login fails or the socket keeps getting <code>xhr poll error</code></b></summary>

| What you see on the phone | Cause → step |
| :--- | :--- |
| A red box `Can't reach the server at http://localhost:8080. …` | `VITE_API_BASE` in `frontend/.env.local` is still active: put a `#` in front, stop Vite, then run `npm run dev:phone` again. |
| `Can't reach the server at http://192.168.1.10:8080. …` (your IP differs) | `CORS_ORIGIN` doesn't hold exactly `http://<laptop-IP>:5173` (no `/` at the end, `http`, not `https`), or `HOST` is still `127.0.0.1`. Fix `backend/.env` ([9.2](#92-the-backend-in-phone-mode-host-and-cors_origin-10-minutes)); `npm run dev` restarts by itself when `.env` is saved, `npm start` doesn't. |
| The login works, but the badge is stuck at `Reconnecting…` | The socket doesn't use `BASE` (for example `io("http://localhost:8080")`: to the phone, `localhost` is the phone itself), or `CORS_ORIGIN` was changed after the page was opened. Use `io(BASE, …)`, then **F5**. |
| Asked to log in again, even though you're logged in on the laptop | Normal: cookies stick to a host name (`localhost` ≠ the IP address). Log in once on the phone with the viewer account. |

</details>

<details>
<summary><b>On the phone, the badge stays <code>Reconnecting…</code> after the screen was locked, or the page looks broken in an old browser</b></summary>

**After the screen was locked:** the phone's browser puts the tab to sleep, so its socket drops. When the screen comes on again, Socket.IO tries to reconnect by itself; if the phone slept for more than 15 minutes, the dashboard renews the wristband first, then reconnects (the same path as on the laptop), and the 5-minute chart is refilled as soon as it's `Live`. The author hasn't tried this on a real phone yet. If the badge stays stuck for a long time, make sure the phone is still on the home Wi-Fi and the laptop hasn't gone to sleep or changed its IP, then **F5**. Status changes while the phone slept: see the `Offline` card problem above.

**A plain page without styles:** Tailwind CSS v4 needs Chrome 111+, Safari 16.4+, or Firefox 128+ ([🚨 Module 22](../module-22-react-basics/README.md#-troubleshooting)). Update your phone's browser.

</details>

## 🔬 Technical Deep Dive (optional)

You may skip this: the deeper "why", the honest limits of v0.2, and the other choices used at work. The code here is **only for reading**, or for trying on a branch that isn't merged.

<details>
<summary><b>From polling to WebSocket: reading <code>EIO=4</code> and <code>upgrade</code> in the Network tab</b></summary>

In the **Network** tab (without a filter) while logging in, the socket is born in two stages:

1. **`socket.io/?EIO=4&transport=polling&t=…`**: `EIO=4` = version 4 of the **Engine.IO** protocol, the layer under Socket.IO. The client always starts with HTTP ***long-polling*** (a request the server holds until there's a message), because proxies, firewalls, or antivirus programs sometimes block WebSocket.
2. **`…&transport=websocket&sid=…`** (the **Socket** filter): the client **upgrades**. In **Messages**: `2probe` ↑, `3probe` ↓ (testing the path), then `5` ↑ (switching over).

The first digit of a frame = the Engine.IO packet type (`2` *ping*, `3` *pong*, `4` message), the second digit = the Socket.IO packet type (`1` disconnect, `2` event, `3` answer): `42[…]` an event, `420[…]` an event that asks for answer number 0, `430[…]` its answer, `41` a disconnect. In the author's recording, `2` ↓ and `3` ↑ appear every 25 seconds (the default `pingInterval`); without a *pong* within 20 more seconds (`pingTimeout`), the server closes the connection. `follow` sometimes goes over polling before the upgrade, so it doesn't always show in **Messages**.

This long-polling is the library's business inside one connection, not the polling this module forbids. CORS only guards polling; WebSocket is guarded by the backend through the `Origin` check in `allowRequest`.

</details>

<details>
<summary><b>Context, Zustand, or Redux, and how Zustand subscribes through <code>useSyncExternalStore</code></b></summary>

| | Context | Zustand (this module) | Redux Toolkit |
| :-- | :-- | :-- | :-- |
| Filled from `socket.ts` | has to go through a component | `useLiveStore.getState()` | `store.dispatch(…)` |
| Re-rendered on every reading | **all** its users | those whose selector changed | those whose `useSelector` changed |
| What you need | built into React | `create`, +0.8 kB gzip | `configureStore`, `createSlice`, `<Provider>` |

Context suits values that rarely change (language, theme). The core of the Zustand 5.0.16 hook (`zustand/esm/react.mjs`, shortened):

```js
const slice = React.useSyncExternalStore(
  api.subscribe,                  // "tell me every time the board changes"
  () => selector(api.getState()), // "which line I read"
);
```

`useSyncExternalStore` = React's hook for subscribing to a store outside React. On every `set()`, React calls your selector again and compares the result with the old one (`Object.is`); the same → no re-render (Practice 6). A selector that always returns a **new** array (`?? []`) is never "the same": React writes `The result of getSnapshot should be cached to avoid an infinite loop`, then `Maximum update depth exceeded`. That's the reason for `EMPTY` in `store.ts`.

</details>

<details>
<summary><b>Data 10 times per second: <i>throttle</i> and <code>requestAnimationFrame</code></b></summary>

A narrow selector (Practice 6) doesn't help a screen that really uses those numbers: every socket message arrives as a separate task, so every message = one re-render. The cure: the socket listener only **collects** the readings in a queue outside React, then the queue is poured into the store with **one** `set()`:

- ***Throttle*** (every 250–1,000 ms). The author's research (a fake 10 Hz server, dev mode): a 500 ms *throttle* cut the commits ±3.5–3.7 times; a number is late by at most half a second.
- **`requestAnimationFrame`** (once per screen frame, usually ±60 per second): it only merges the messages within one frame, so it helps when messages come faster than frames, not at 10 per second.
- Zustand's ***transient updates*** (`useLiveStore.subscribe` + `useRef`): no *re-render* at all, but far from the usual React way.

Our devices only send ±0.1 messages per second, so v0.2 uses none of them. Even a *throttle* with `setInterval` would need an exception in the PR template (the Module 23 item: `setInterval` only in `time.ts`).

</details>

<details>
<summary><b>Two limits of v0.2: the store's content after Log out, and status changes missed while disconnected</b></summary>

**1. The store's content after Log out.** **Log out** cuts the socket and deletes the session, but the store isn't emptied: its content stays in the tab's memory until the page is reloaded, so another account that logs in on that tab sees the old list until `GET /devices` answers. Right now every account sees the same devices (nothing leaks); once Module 24 tells roles apart, the store **must** be emptied, for example with `useLiveStore.setState(useLiveStore.getInitialState())` in `handleLogout()` and `handleSessionExpired`. Until then, on a shared device, press **F5** after **Log out**.

**2. Missed status changes.** The backend broadcasts `status` **only when it changes**, and events that went by while disconnected aren't sent again. After reconnecting, `onConnect` only calls `followAll()` (its answers are readings, not status); the status is only refreshed by `GET /devices` when the list is opened. The author ran into it: the backend restarted right while the simulator was starting, the `online` status was sent two seconds before the dashboard reconnected, and the card stayed red `Offline` for more than 90 seconds even though readings arrived every 10 seconds. **F5** fixed it.

**The cure: sync the status after recovering**, in `onConnect`:

```ts
getDevices().then((d) => useLiveStore.getState().setDevices(d)).catch(() => {});
```

That's not polling: it's triggered by the "connected" event (±once per 15 minutes, the wristband cycle), not by a timer. v0.2 doesn't have it yet, because it needs a new lab test (a device going off **while** the backend is down); Module 24 may add it.

</details>

<details>
<summary><b>Page Visibility: the socket while the tab is in the background or the phone is asleep</b></summary>

Browsers save effort on tabs that aren't visible: in the lab, Edge slowed down `setInterval` in a background tab (the `… ago` text fell behind for a while). A locked phone can hold JavaScript completely (**not yet tested by the author on a real phone**). According to Socket.IO's rules:

1. A held page doesn't answer the *ping*; within ±45 seconds (25 + 20) the server closes its connection.
2. When the page is visible again, the client finds its connection dead (`ping timeout` or `transport close`) and reconnects **by itself**; `onConnect` sends `follow` again, and the 5-minute chart is refilled from the API.
3. More than 15 minutes: the wristband has expired, the *handshake* is refused, then it goes as in Concept 2: refresh once, then `socket.connect()`.

So the socket recovers by itself (missed status changes: see limit 2). The **Page Visibility API** (`document.hidden`, the `visibilitychange` event) tells you when the page is hidden, so the socket could be cut to save battery; but `onDisconnect` would have to tell that apart from **Log out** (both are `io client disconnect`). At ±0.1 messages per second, it isn't worth it yet.

</details>

<details>
<summary><b>A <i>virtualized list</i> with <code>@tanstack/react-virtual</code> 3.14.22: when you need one</b></summary>

A *virtualized list* only makes elements for the rows that are **visible** in the scroll box, so thousands of rows stay light:

```tsx
const v = useVirtualizer({ count: rows.length, getScrollElement: () => containerRef.current, estimateSize: () => 40 });
```

then only `v.getVirtualItems()` is drawn. In React 19, if the Console writes `flushSync was called from inside a lifecycle method`, add `useFlushSync: false`. It costs +9.8 kB gzip. It's needed when thousands of rows show **at once**; our table has pages of 24 rows, so v0.2 doesn't use it.

</details>

<details>
<summary><b><i>Keyset pagination</i>: more than 1,000 readings, loaded a little at a time</b></summary>

Without `bucket`, `GET /devices/:id/readings` sends at most **1,000** readings, ordered from the oldest, with no `limit`/`offset`. If there are more, the answer carries `truncated: true` and holds the 1,000 **oldest**. v0.2 is safe: 1 hour of Node 1 is ±360 readings; 24 hours and 7 days use buckets.

For 24 hours of raw readings (±8,640), ***keyset pagination*** starts the next page after the last **key**, that is, the `ts` of the last reading: while `truncated` is still `true`, a **Load more** button asks for `?from=` + `new Date(Date.parse(ts) + 1000).toISOString()`, then joins the results (`ts` has no milliseconds, and it's unique per device). `toISOString()` ends with `Z`, so it's free of the `+07:00` → `%2B` trap.

</details>

<details>
<summary><b>Server-side <i>downsampling</i>: average buckets or important points (LTTB)</b></summary>

Seven days of Node 1 readings = ±60 thousand points, yet the chart on a phone is only a few hundred pixels wide. The 🔬 of Module 18 names two ways to thin them out:

1. **Time buckets** (used by v0.2): `bucket=15m` (24 hours, 97 points) and `bucket=1h` (7 days, 169 points). Fast, but an average can hide a brief spike; that's why the History temperature chart also draws the lowest and highest lines.
2. **LTTB** (*Largest-Triangle-Three-Buckets*): picks the **real** points that best keep the chart's shape, for example 500 out of hundreds of thousands. The `lttb(…)` function is in the TimescaleDB Toolkit (not in our lightweight image), or you write it yourself in the backend.

LTTB keeps spikes with their real values, but it needs a new backend route (backend v1.0 deliberately stays as it is).

</details>

<details>
<summary><b>A lowest–highest band with <code>Area</code></b></summary>

A replacement for the two dashed lines in `HistoryChart`: a faded **band** from the lowest to the highest (Module 18's suggestion). In Recharts 3.10.1, an `Area` whose value at each point is a **pair** `[low, high]` is drawn as a band; its container is a `ComposedChart` (lines and areas mixed):

```tsx
<ComposedChart responsive data={rows} style={{ width: "100%", height: 260 }}>
  <Area dataKey={(p) => [p.min, p.max]} stroke="none" fill={q.color} fillOpacity={0.2} isAnimationActive={false} />
  <Line dataKey="avg" stroke={q.color} strokeWidth={2} dot={false} isAnimationActive={false} />
</ComposedChart>
```

An honest note: "pair = band" was read by the author from the Recharts 3.10.1 code, not drawn yet; check that the gaps still break the band.

</details>

<details>
<summary><b>CSV and <i>formula injection</i>: cells that start with <code>=</code></b></summary>

Excel reads a cell that starts with `=` (also `+`, `-`, `@`) as a **formula**. The `device` column of our CSV holds names typed by an admin; if a name were `=HYPERLINK(…)`, Excel would run it when the file is opened. That's ***CSV injection*** (*formula injection*). On the screen, React shows it as text; the CSV is outside React's watch.

`quote()` in `csv.ts` only handles `,`, `"`, and line breaks. The usual way to tame it: start a **text cell** that begins with `=`, `+`, `-`, or `@` with a single quote `'`. v0.2 doesn't do this yet: only an admin can set names, and that `'` gets read by other programs too (for example pandas). Add it when many people can fill in names.

</details>

<details>
<summary><b>A manual theme button: <code>@custom-variant</code>, the white flash, and why not in <code>localStorage</code></b></summary>

v0.2 follows the system setting: Tailwind v4's built-in `dark:` reads `prefers-color-scheme`. A light/dark button needs three things:

1. **`@custom-variant dark (&:where(.dark, .dark *));`** in `src/index.css`. From then on, `dark:` only obeys a `dark` class on `<html>` and **stops** following the system (the author's research: the `dark:` rules in the built CSS no longer use `prefers-color-scheme`). The chart variables in `index.css` have to move to a `.dark` selector too.
2. **A small script in the `<head>` of `index.html`** that adds that class before the page is first drawn (Tailwind's suggestion). If React adds it after the bundle has loaded, the page is light for an instant: a **white flash** (FOUC).
3. **Remembering the choice**: Tailwind's example script uses `localStorage.theme`.

Item 3 is the one that clashes. A theme choice isn't a secret, but the Module 22 rule can be checked with one command: `git grep -n -e localStorage -e dangerouslySetInnerHTML frontend/src` only finds one comment in `store.ts` (➕ D), and the v0.2 `frontend/README.md` says "Nothing at all is stored in `localStorage`, not even the theme choice." An exception makes that check more complicated. So: keep following the system (this module), a button without memory (back to the system setting on every load), or an exception written into the PR template and the README.

</details>

<details>
<summary><b>Splitting the bundle with <code>React.lazy</code>: the 500 kB warning disappears</b></summary>

The Practice 10 warning appears because the whole dashboard, Recharts included, becomes **one** JS file, even though the login and the list don't use charts. `React.lazy` + `import()` splits it: the code of the Details and History is only downloaded when its screen is first opened. The author's experiment in `App.tsx`:

```tsx
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
// replaces the DeviceDetails and DeviceHistory imports:
const DeviceDetails = lazy(() => import("./components/DeviceDetails"));
const DeviceHistory = lazy(() => import("./components/DeviceHistory"));
// in the return:
<main className="mx-auto max-w-3xl px-4 py-6"><Suspense fallback={<p>Loading…</p>}>{currentScreen}</Suspense></main>
```

**Expected output (example, cut; your numbers differ):**

```text
dist/assets/DeviceHistory-J2rul3AT.js    9.14 kB │ gzip:   3.30 kB
dist/assets/DeviceDetails-UrL_Rc6y.js   38.34 kB │ gzip:  11.55 kB
dist/assets/index-D3Hqaura.js          287.24 kB │ gzip:  90.27 kB
dist/assets/Picker-CUmahwxq.js         348.29 kB │ gzip: 101.61 kB

✓ built in 461ms
```

Two builds, without `(!) Some chunks…`. `Picker-….js` holds Recharts and other shared code (its name comes from the first shared module). With `npm run preview`, the **Network** tab: at first only `index-….js`; the login and the list without new downloads; the Details download `DeviceDetails-….js` + `Picker-….js`; History downloads `DeviceHistory-….js`. The price: the Details wait for ±387 kB the first time, and there's one more concept; v0.2 chooses one file and one warning that has been explained.

</details>

<details>
<summary><b><i>Remote debugging</i>: DevTools for a page that is open on a phone</b></summary>

A phone's browser has no DevTools, yet CORS errors and socket frames need to be seen there. *Remote debugging* borrows the laptop's DevTools over a USB cable:

- **Android + Chrome:** turn on **Developer options** (usually by tapping **Build number** seven times), then **USB debugging**. Connect the cable, allow it on the phone, open `chrome://inspect` in Chrome on the laptop, and click **inspect** under the dashboard tab.
- **iPhone + Safari:** needs a Mac. In the *Advanced* settings, turn on **Web Inspector** (Safari on the iPhone) and the **Develop** menu (Safari on the Mac), then choose your iPhone in that menu.

You get the **Console**, **Network** (**Socket** → **Messages**), and (Chrome) **Application** → **Cookies** of the page on the phone, for example to delete the `access` cookie and test refresh once. The author hasn't tried it (a lab without a phone). DevTools device mode only imitates the phone's screen size.

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** the same as Practice 10 after laptop mode is back: **VS Code** (the `backend` terminal, the Vite terminal with `npm run dev`, and a free terminal in the `frontend` folder; the laptop path adds the broker and the simulator), **Docker Desktop** (`smarthome-db`), and **Chrome or Edge** at `http://localhost:5173` with DevTools.

All three challenges only change the `frontend` folder. Do them **after** [➕ D](#d--merge-featuredashboard-live-into-main-via-the-dashboard-v02-live-pull-request), each on a new branch from `main` (`git switch main`, `git pull`, then `git switch -c feature/<challenge-name>`). Before saving, `npm run lint` must be clean and `npm run build` must pass with the one 500 kB warning ([Practice 10](#practice-10--the-pass-tests-lint-build-a-dress-rehearsal-and-laptop-mode-35-minutes)); its pull request can be used as review practice (the **(Module 23)** items of the PR template).

Unlike Module 22, **all three levels have an answer key** in [`code/challenges/key/`](code/challenges/key/): only the files that change or are new, on top of [`code/frontend/`](code/frontend/) v0.2.0, and all three pass lint and build on the author's laptop. Levels 2 and 3 both change `src/App.tsx`, so keep their branches apart.

### Level 1 — A third gauge: air humidity (a small change, 20 minutes)

Gauges only suit quantities with clear limits ([Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors)). Air humidity is **relative** humidity, always 0–100%, and **both** kinds of device send it (the `humidity` field). Make it the first gauge, in place of the **Humidity** card.

1. Open **`frontend/src/components/DeviceDetails.tsx`**, then find `function gauges`.
2. Add `<Gauge label="Air humidity" … />` with its `value` from `reading.humidity` (valid without `as`: `TelemetryNode1` and `TelemetryNode2` both have `humidity`), in front of **Soil moisture**, for Node 1 **and** Node 2 (the Node 2 branch now needs `<>…</>`).
3. Delete the `{ label: "Humidity", … }` object from `cardsNode1` and `cardsNode2`, so the same number doesn't show twice.
4. Add the `sm:grid-cols-3` class to the `<div>` that wraps `{gauges(reading, node2)}`.
5. Save, then open the Node 1 details (laptop path: `Practice living room`) on the laptop and in DevTools device mode at 375 px wide.

**Result (example, the key on the author's laptop):** `Practice living room` shows three gauges, `75%`, `32%`, and `70%` (air, soil, water tank), in one row at 1280 px and two columns at 375 px, with no horizontal scrolling; the cards left are `Temperature`, `Light`, `Motion`, `Lamp`, `Fan`, `Pump`, and `Curtain`. The author hasn't tried the Node 2 details in the browser.

**You pass when:** the Node 1 details have three gauges and no **Humidity** card, the Node 2 details (if you have them) have two, there's no horizontal scrolling at 375 px, and lint and build pass.

<details>
<summary><b>Level 1 answer key</b></summary>

At the start of the `gauges` function, the key makes `const airGauge = <Gauge label="Air humidity" value={reading.humidity} />;`, then puts `{airGauge}` as the first line inside `<>…</>` in **both** branches: a JSX element can be kept in a constant like an ordinary value. The whole file: [`DeviceDetails.tsx`](code/challenges/key/level-1/frontend/src/components/DeviceDetails.tsx).

</details>

### Level 2 — A live event log (fill in the blanks, 45 minutes)

The backend also broadcasts an **`event`** event to **every** dashboard each time it records a new event, for example a device disconnecting or coming back online. The `SavedEvent` type has been in `src/types.ts` since Practice 1, but nothing listens to it yet. Make a **Latest events** box under every screen: the last 10 events, newest on top, only **since the page was opened** (the backend has no `GET` route for old events). Not a *toast*; that's Module 24.

> [!IMPORTANT]
> **The trigger is a device.** A lamp command from Bruno does **not** make an event; backend v1.0 only records the commands it resends by itself. Stop the simulator (**Ctrl + C**) or unplug Node 1's USB, then start it again, as in [3.3](#33--stop-the-sender-the-card-turns-red-then-green-again-10-minutes).

Create a new file **`frontend/src/components/EventLog.tsx`**, copy this skeleton, then fill in every `____`:

```tsx
import { useEffect, useState } from "react";
import { socket } from "../socket";
import type { SavedEvent } from "../types";
import { wibTime } from "../time";

const LIMIT = 10; // events kept; older ones are dropped

export default function EventLog() {
  const [events, setEvents] = useState<SavedEvent[]>(____); // newest first

  // Subscribe to "event" while this component is shown, stop in the cleanup.
  useEffect(() => {
    // a named function: the cleanup removes EXACTLY this listener, not every "event" listener
    function onEvent(ev: SavedEvent) {
      // a NEW array: the new event in front, then cut to 10. The old array isn't changed.
      setEvents((old) => [____, ...old].slice(0, ____));
    }
    socket.on("____", ____);
    // StrictMode in dev mode: add, remove, add again. Still only ONE listener, so no event shows up twice.
    return () => {
      socket.____("event", ____);
    };
  }, []);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100">Latest events</h2>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No events since this page was opened. Try stopping the simulator (Ctrl + C) or unplugging Node 1's USB, then
          start it again.
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-700">
          {events.map((ev) => (
            // id = its row number in the backend's events log, always unique
            <li key={ev.____} className="flex flex-wrap gap-x-3 py-2">
              <span className="shrink-0 font-mono text-xs leading-5 text-slate-500 dark:text-slate-400">{wibTime(ev.____)}</span>
              {/* the message is shown as plain JSX text: HTML code inside it (for example from a device name) isn't run */}
              <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">{____}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
```

Then, in **`src/App.tsx`**, import the component (`import EventLog from "./components/EventLog";`) and write `<EventLog />` inside `<main>`, **after** `{currentScreen}`, so the box stays on screen (and keeps recording) while you switch screens.

Test it: log in, open **Network** → the **Socket** filter, press **F5** → the `socket.io/?EIO=4…` row → **Messages**, stop the simulator, wait for its card to show `Offline`, start it again, then open that device's details and go back.

**Expected output (example; the author's simulator was force-stopped, then started again):**

```text
Latest events
09:18:30 WIB  f00d00000001 back online
09:18:23 WIB  f00d00000001 disconnected (offline)
```

**Messages** records two `42["event",…]` frames for those two rows: `StrictMode` doesn't double them.

**You pass when:** one event = one row (in development mode too), newest on top, at most 10, the rows stay when you switch screens and are gone after **F5**, and lint and build pass.

<details>
<summary><b>Level 2 answer key</b></summary>

The fill-ins, in order: `[]`, `ev`, `LIMIT`, `event`, `onEvent`, `off`, `onEvent`, `id`, `occurred_at`, `ev.message`. The whole files: [`EventLog.tsx`](code/challenges/key/level-2/frontend/src/components/EventLog.tsx) and [`App.tsx`](code/challenges/key/level-2/frontend/src/App.tsx).

The comments in the skeleton explain every fill-in. Without `off`, the `StrictMode` rehearsal leaves two listeners and every event shows twice ([Concept 3](#3-useeffect-for-subscribing-add-the-listeners-remove-them-in-the-cleanup)). The list only needs `useState`, not the store, because only this component uses it ([Concept 4](#4-one-store-for-every-screen-zustand-and-selectors)).

</details>

### Level 3 — Two devices in one 7-day history chart (from scratch, 60–90 minutes)

**The task.** Make a **Compare** screen in `src/components/CompareHistory.tsx`: the average temperature per hour of **two** devices over 7 days in one chart. Hook it into `App`: `{ name: "compare" }` in the `View` type, a **Compare 7 days →** button next to the **Device List** heading, and one more `currentScreen` branch. It holds two `<select>` boxes (by default the first two devices from `useLiveStore((s) => s.devices)`), a two-line `avg_temp` chart with a legend (`Legend`) holding the device names, and the message `Pick two different devices.` when both choices are the same.

Hints:

- **Two requests at once:** `Promise.all([getHistory(idA, "7days"), getHistory(idB, "7days")])` waits for **both**, and its results come in order ([Module 22 Level 3](../module-22-react-basics/README.md#level-3--a-summary-of-all-the-devices-on-one-screen-from-scratch-6090-minutes)). Still use the `ignore` pattern; 401 → `onSessionExpired`.
- **Combine by time:** one array of `{ t, a, b }` rows through a `Map` keyed by `Date.parse(p.time)`; an hour that only one device has gets `null` for the other.
- **Honest gaps ([Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors)):** an hour that's empty on both devices has no row, so insert a `null` row when two rows are more than 1.5 hours apart.
- **Axis and colors:** copy `HistoryChart` ([7.3](#73-the-history-screen-devicehistorytsx-and-historycharttsx-25-minutes)). Blue (`var(--color-sky-500)`) and orange (`var(--color-amber-500)`) stay distinguishable for most color-blind people, and the names in the legend mean the color is never alone.

**You pass when:** choosing `Practice living room` against `Practice porch` (both filled by `seed-history` in 7.1; device path: Node 1 against Node 2) shows two lines labeled with their names, the gaps look broken, both `readings?bucket=1h` requests in **Network** leave at the same time, there's no horizontal scrolling at 375 px, and lint and build pass.

**Result (example, the key on the author's laptop):** `Practice living room: 168 points · Practice porch: 166 points` (the key writes it above the chart), and the blue line breaks once, in the hours without data between `seed-history` and the simulator.

<details>
<summary><b>Level 3 answer key</b></summary>

The whole files: [`CompareHistory.tsx`](code/challenges/key/level-3/frontend/src/components/CompareHistory.tsx) (new) and [`App.tsx`](code/challenges/key/level-3/frontend/src/App.tsx).

- **The button is dimmed until the list has loaded** (`disabled` while `useLiveStore((s) => s.devices)` is still `null`), because its default choices are taken from that list.
- **The legend text uses the normal text color** (`Legend formatter`): orange text on white is hard to read.

</details>

## ➕ Add-on to "Mini Smart Home"

This week Mini Smart Home's face comes **alive**: dashboard v0.2 (live) receives data through Socket.IO, draws charts, and can be opened from a phone on the home Wi-Fi. Backend v1.0, the broker, the firmware, data contract 1.4, and `tools/` don't change. The Practice 1–10 code is already saved as commits on the `feature/dashboard-live` branch, but that branch has never been sent to GitHub. Step A checks its contents, B and C update two documents, D merges everything into `main` through the "dashboard v0.2 (live)" pull request, and E saves your learning notes. Here's the whole project after this week:

![Project diagram of Mini Smart Home after Module 23: dashboard v0.2 (live) on the laptop and on a phone over home Wi-Fi; dashed lines mean coming soon. The top row is unchanged: Node 2 Garden v1.0.0 with an 18650 battery sends via Node 1 with ESP-NOW; Node 1 Home v1.6.0 (broker key in NVS, account a4cf12e5b7c0, six columns + the RS-485 trio) sends locked MQTT to the Raspberry Pi gateway 192.168.1.37, with Mosquitto, locked (allow_anonymous false, broker-passwd and acl-broker) and Node-RED (the old dashboard, account nodered); top right, a phone for Node-RED and Telegram, and Telegram for alerts and /status. Left: the broker clients on the laptop, unchanged (MQTTX account monitor, the contract checker, the simulator f00d00000001 with its key in tools/.env), each over MQTT with its own account; the purple box Phone on home Wi-Fi, phone mode (Practice 9): http://192.168.1.10:5173, the viewer account, the Live badge, afterwards back to laptop mode, with an arrow to the frontend; then To be honest, v0.2 is still: view only, no control buttons yet (Module 24); minimal login, protected routes and roles come later (Module 24); home Wi-Fi only and still http:// (internet + HTTPS in Module 27); the summary history has only 4 quantities: temperature, humidity, soil, light. Middle, the Laptop box. The green backend v1.0 box, unchanged: Fastify + TypeScript, data contract 1.4, locked (Modules 20–21); Socket.IO rides on the same port 8080 (Module 19); phone mode uses HOST=0.0.0.0 and the laptop IP in CORS_ORIGIN (.env). The API used by dashboard v0.2: POST /auth/login, /auth/refresh, /auth/logout, GET /auth/me, GET /devices, GET /devices/:id/readings, and Socket.IO follow and unfollow toward telemetry and status; GET /devices/:id/readings and Socket.IO are purple, first used in Module 23; commands and rules wait for Module 24. Arrows msh/# and cmd between the broker and the backend; a line to Telegram, internet: outbound HTTPS, long polling. Right of the backend: Docker Desktop smarthome-db, PostgreSQL 17 + TimescaleDB 2.30.2, unchanged; Bruno, small terminal, /docs, unchanged, with Bruno as the laptop path's tester (a lamp command triggers an immediate send). Between the frontend and the backend: fetch (history, first points) + Socket.IO, both carrying the access cookie, and JSON + events back. The purple box frontend v0.2 (live), folder frontend/ 0.2.0 with socket.io-client, Zustand, Recharts, and date-fns: the Vite dev server, npm run dev at http://localhost:5173, and npm run dev:phone (the same as vite --host) only during phone mode; npm run build passes with one warning about the 500 kB size (Recharts) into the dist/ folder; the browser on the laptop or the phone, one socket + one Zustand store, with three mini screens: the live list, Details with a chart + gauges, and History + table; the green pill in the header is the Live badge, dark mode follows the system, the CSV is downloaded from History with a comma separator and a decimal point. Bottom left, GitHub mini-smart-home: branch feature/dashboard-live, pull request dashboard v0.2 (live) to main reviewed with the (Module 23) items, then merged. New or changed files in frontend/: package.json and package-lock.json (0.2.0, + 5 packages, script dev:phone); index.html (scheme-light dark:scheme-dark); index.css (light/dark chart colors); the new socket.ts, store.ts, time.ts, and csv.ts; api.ts, types.ts, and App.tsx with additions; eight new components (ConnectionBadge, LastSeen, Picker, LiveChart, Gauge, DeviceHistory, HistoryChart, HistoryTable); DeviceList and DeviceDetails, now live and red/green; Badge, Login, and SensorCard (status text, dark: classes); .env.example (a phone mode note) and README.md (from a phone, limits of v0.2); plus the pull request template ((Module 23) items). Deleted before the commit: try-live.html (Quick Win) and src/loadtest/ (Practice 6). Never in Git: backend/.env (holds the laptop IP in phone mode), frontend/.env.local, node_modules/, and dist/. Bottom right: Phase 4 under way, dashboard v0.2, numbers move by themselves, the Phase 4 Checkpoint is in Module 25; coming soon Module 24 (control buttons, rule forms, roles, protected routes), Module 25 (Grafana, a device map, reports, Phase 4 Checkpoint), and Module 27 (to the internet: a domain, HTTPS, an app on the phone or PWA).](assets/project-diagram-module-23.png)

Only the purple boxes changed: **frontend v0.2 (live)** and the **phone**. The dashboard now also uses `GET /devices/:id/readings` (the chart and the history) and Socket.IO; `GET /devices/:id/latest` isn't used anymore, because the cards' starting values now come from the `follow` answer. The **To be honest** box matches the **Limits of v0.2** in the step B README.

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and its terminal (first in the `frontend` folder, then at the `mini-smart-home` root), a **browser** already logged in to GitHub, and in step E a second VS Code window with the `learn-iot` folder. The backend, the simulator, and Vite don't need to be running; if Vite is still running, stop it with **Ctrl + C** before step D.
>
> ⭐ **Required** — step D merges dashboard v0.2 into `main`, and Module 24 starts from there.

### A. Match your `frontend/` with dashboard v0.2.0

Your branch must match the reference dashboard [`code/frontend/`](code/frontend/), except for `README.md` (step B). In the terminal of the `frontend` folder, `git status` must name the `feature/dashboard-live` branch with no changed files (Practice 10 has already been committed). The first line of `npm ls --depth=0` must start with `mini-smart-home-frontend@0.2.0`, with all five packages of Practice 1.2 at their exact versions. This is what goes into the pull request:

| Files in the pull request | Step |
| :--- | :--- |
| **New**: `frontend/src/socket.ts`, `store.ts`, `time.ts`, `csv.ts`, and eight components (`ConnectionBadge`, `LastSeen`, `Picker`, `LiveChart`, `Gauge`, `DeviceHistory`, `HistoryChart`, `HistoryTable`) | Practices 1–8 |
| **Changed**: `index.html`, then in `src/`: `index.css`, `App.tsx`, `api.ts`, `types.ts`, and the five Module 22 components | Practices 1–7 |
| `package.json` and `package-lock.json` (five packages, the `dev:phone` script, version **0.2.0**), `.env.example` (the phone mode note) | 1.2, 9, 10.2 |
| `frontend/README.md` | B |
| `.github/pull_request_template.md` | C |

`node_modules/`, `dist/`, `.env.local`, and `backend/.env` **never go into Git**; `public/try-live.html` (Quick Win) and `src/loadtest/` (Practice 6) have already been deleted. Lint and build were already proven in [Practice 10](#practice-10--the-pass-tests-lint-build-a-dress-rehearsal-and-laptop-mode-35-minutes).

### B. Update `frontend/README.md`: opening it from a phone, and the limits of v0.2

The v0.1 README still says the dashboard is static and can only be opened from this laptop. Open [`code/frontend/README.md`](code/frontend/README.md) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of the `README.md` in the `frontend` folder (not the one at the repository root). Save (**Ctrl + S**), then look at it with **Ctrl + Shift + V** (macOS: **Cmd + Shift + V**).

What changed: **How to run it** (the 7-day data recipe as in 7.1, `npm run dev:phone`, `npm run preview -- --host`, the 500 kB warning); a new section, **Opening it from a phone (home Wi-Fi)**, with a laptop mode ↔ phone mode table; **What's in the `src/` folder** and **Login and security** (the locked socket, recovering up to **Disconnected**, no polling); and **Limits of v0.2**: no controls and roles yet (Module 24), home Wi-Fi only and still `http://` (Module 27), the summary history only has four quantities, and messages or status changes that go by while disconnected aren't caught up.

Its last item is honest: the author **hasn't tried** phone mode **on a real phone**. Passed 9.5 on a real phone? Replace that sentence with your result. The README names the accounts, but **never** the passwords or your laptop's IP (just `<laptop-IP>`).

### C. Add the Module 23 items to the pull request template

The dashboard gets five items marked **(Module 23)**. Open [`code/.github/pull_request_template.md`](code/.github/pull_request_template.md) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `.github/pull_request_template.md` (the `.github` folder at the root of `mini-smart-home`, not inside `frontend`). Save. Its contents are exactly the Module 22 template, plus these five lines:

```markdown
- [ ] **(Module 23)** The only warning allowed in `npm run build` is the size warning `Some chunks are larger than 500 kB` (Recharts, explained in Module 23); `npm run lint` still has no warnings
- [ ] **(Module 23)** No polling: new data only comes through Socket.IO, and `git grep -n setInterval frontend/src` only finds the clock in `frontend/src/time.ts`
- [ ] **(Module 23)** Every `socket.on(…)` has a `socket.off(…)` with the same function in its effect's cleanup, and the socket is still created once in `frontend/src/socket.ts` (not inside a component)
- [ ] **(Module 23)** Phone mode has been switched back to laptop mode (`HOST=127.0.0.1`, the IP address removed from `CORS_ORIGIN`, Vite without `--host`), and the `backend/.env` that holds the laptop's IP doesn't go into Git
- [ ] **(Module 23)** No experiment files in the **Files changed** tab: `frontend/public/try-live.html` (Quick Win) and the `frontend/src/loadtest/` folder (Practice 6)
```

The first item is in the **Checklist before merging**, below the unchanged **(Module 22)** build item, and it only makes an exception for the size warning of [10.1](#101-npm-run-lint-is-clean-npm-run-build-passes-with-one-warning-10-minutes). The other four are in the **Security checklist**: no polling (safety rule number 5), socket listeners removed (Concept 3), laptop mode ([10.4](#104-switch-back-to-laptop-mode-5-minutes)), and no experiment files.

### D. ⭐ Merge `feature/dashboard-live` into `main` via the "dashboard v0.2 (live)" pull request

Go up from the `frontend` folder to the repository root, then check:

```text
cd ..
git status
```

There must be exactly two `modified` files: `.github/pull_request_template.md` and `frontend/README.md`. If there are other files, go back to step A. Then save and send the branch:

```text
git add frontend/README.md .github/pull_request_template.md
git commit -m "Dashboard v0.2 docs: the frontend README and the Module 23 items in the pull request template"
git push -u origin feature/dashboard-live
```

This branch's first push carries every commit since Practice 1.

1. **Open a pull request.** On GitHub, click **Compare & pull request** on the yellow `feature/dashboard-live` banner (or **Pull requests** → **New pull request**, **base: `main`** ← **compare: `feature/dashboard-live`**). Give it the title `Dashboard v0.2 (live)`. Under **What changed?**, write, for example: `Dashboard v0.2 (frontend 0.2.0): live data over Socket.IO, red/green status, a 5-minute chart, gauges, history with a table and CSV, dark mode, and phone mode. Backend, tools, and edge unchanged.` GitHub only uses the template that's already on `main`, so copy the five **(Module 23)** items from VS Code to below the description, then click **Create pull request**.
2. **Review with the (Module 23) items.** Tick only what's really met:
   - The **Files changed** tab holds **27 files**: 12 new and 14 changed in `frontend`, plus the template. There **must be no** `try-live.html`, `src/loadtest/`, `backend/.env`, `.env.local`, `node_modules/`, `dist/`, or files from `backend/`, `tools/`, and `edge/`. A different count? Compare with the table in step A.
   - Polling: in the root terminal, `git grep -n setInterval frontend/src` prints only one line, from `frontend/src/time.ts` (the clock tick, Concept 6).
   - The socket: in `frontend/src/socket.ts`, each of the five `socket.on(…)` has a twin `socket.off(…)` with the same function in its cleanup, and `io(` only appears in that file.
   - The **(Module 22)** item: `git grep -n -e localStorage -e dangerouslySetInnerHTML frontend/src` now prints one line, the comment in `frontend/src/store.ts`, which in fact confirms that nothing is stored in `localStorage`.
   - The rest: build and lint pass (10.1), laptop mode is back (10.4), packages at their written versions (1.2), `found 0 vulnerabilities` (10.2); the backend, tools, edge, and `DATA-CONTRACT.md` didn't change.

   Send the summary through **Review changes** → **Comment** → **Submit review**. Did a forbidden file get in? **Don't merge**: remove it with `git rm -r` (for something that has to stay on the laptop, like `backend/.env`: add `--cached`, then change its secrets as in Module 20), commit, and push again.
3. **Merge.** Choose **Create a merge commit**, click **Merge pull request** → **Confirm merge**, then **Delete branch**.
4. **Back to `main`.** In the terminal at the `mini-smart-home` root:

   ```text
   git switch main
   git pull --prune
   git branch -d feature/dashboard-live
   ```

   Right after `git switch main`, the `frontend` folder goes back to v0.1; `git pull --prune` brings v0.2 back without another `npm install` (`node_modules` doesn't go into Git and already holds the five new packages).

**You pass this ⭐ step** when the "dashboard v0.2 (live)" pull request has been reviewed with all five **(Module 23)** items, then merged, and `frontend/package.json` on your laptop's `main` says `"version": "0.2.0"`.

### E. Save your learning notes

Open the **`learn-iot`** repository in a new VS Code window (**File → New Window**, then **File → Open Folder…**), create **`module-23/notes.md`** next to `warmup.js`, then fill it in with the numbers from your own screen:

```markdown
# Module 23 notes — Dashboard v0.2

| What was measured | My number |
| :--- | :--- |
| Delay from covering the LDR → the chart on the phone changes, from the video; laptop path: Bruno lamp → new point (9.5) | … seconds |
| "loaded in" of the 7-day history, the slowest of three: npm run dev (7.4) / preview (10.3) | … ms / … ms |
| Profiler 10 seconds: N real pace / N fake load / ConnectionBadge with a wide selector (Practice 6) | … / … / …× |
| Laptop Wi-Fi IP; time phone mode was turned on (9.2) and switched back (10.4) | … / … WIB / … WIB |
| JavaScript file in dist/, gzip column (10.1) | … kB |
| Files in the Files changed tab of the pull request "dashboard v0.2 (live)" (➕ D) | … files |
| Tested on a real phone, a tablet, or DevTools device mode? (Practice 9) | … |

What surprised me most: …
```

Commit and push in the **`learn-iot`** repository.

**Evidence for passing Module 23** (compare it with ✅ below): the video of the chart on the phone changing in ≈ 1–2 seconds (9.5), the 7-day history in < 1 second (7.4), a dress rehearsal that passed in one go (10.3), and the merged "dashboard v0.2 (live)" pull request (➕ D).

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Event** | A named message over the socket: from the backend `telemetry`, `status`, and `event`; from the browser `follow` and `unfollow`. You listen with `socket.on(name, function)` and stop with `socket.off(name, function)` using the same function. |
| ***Ack*** (answer) | The backend's reply to one event the browser sent. `follow` is sent with `emitWithAck` and answered with `{ ok, latest }`; without an answer function, the backend quietly doesn't put you in the *room*. |
| **CSV** and **BOM** | CSV = text in columns, one line per point. The dashboard puts it together for Excel with English settings: `,` separator, decimal point, BOM, CRLF. BOM (*byte order mark*) = three invisible bytes at the start of the file that mark its content as UTF-8, so `°` doesn't get garbled. |
| **Stale data** | A number that still shows even though its last reading is old: older than 30 seconds (Node 1, the simulator) or 16 minutes (Node 2). Its card gets `· stale data`, even though its status badge may still say `Online`. |
| **Domain** | The range of values of an axis or an arc. A percentage gauge rests on the fixed domain `[0, 100]`; if it's worked out from the data, any value looks full. |
| **Bucket** | A box of time in which the database summarizes readings (average, lowest, highest; Module 18). The 24-hour history = 15-minute buckets (`bucket=15m`), 7 days = 1-hour buckets (`bucket=1h`); 1 hour uses raw readings. |
| **Re-render** and ***commit*** | A re-render = React calls a component function again because the *state*, the *props*, or the part of the store it reads has changed; a commit = the moment the result is written to the screen. |
| **Gauge** | A half-circle indicator for one bounded number, like soil moisture and the water tank at 0–100%; made with Recharts' `RadialBarChart`. |
| **Relative time** | Time written as a distance from now: `last seen 12 seconds ago`, or `just now` under 5 seconds. The `useNow()` tick updates it every second without asking the backend. |
| **Sliding window** | The content of the live chart: only the readings of the last 5 minutes. New readings come in on the right, those older than 5 minutes are dropped on the left, and duplicates are dropped; its first points are fetched with `GET …/readings?from=…`. |
| **LAN**, **IP**, and **`0.0.0.0`** | LAN = the local network of your home Wi-Fi. The laptop's IP on the LAN (example: `192.168.1.10`) is handed out by the router and can change. `HOST=0.0.0.0` = the backend listens on all the laptop's addresses; it's not an address to open. |
| **Connection badge** | `Live` (connected), `Reconnecting…` (disconnected, trying again), or `Disconnected` (stopped trying: after **Log out**, or after being refused again and again; the second needs **F5**). |
| **Dark mode** | A dark display that follows the phone's or laptop's system setting (`prefers-color-scheme`), through Tailwind's `dark:` classes and the chart color variables in `index.css`; no button, no `localStorage`. |
| **Phone mode** and **laptop mode** | Phone mode (temporary, only on the home Wi-Fi): `HOST=0.0.0.0`, the laptop's IP in `CORS_ORIGIN`, `npm run dev:phone`. Laptop mode (the default, safe state): `HOST=127.0.0.1`, `CORS_ORIGIN` without the IP, `npm run dev`. |
| ***Pagination*** | Cutting a long list into pages. `HistoryTable` shows 24 rows per page, newest first, from data already in the browser (the API has no page option). |
| **Polling** | Asking the server again and again with a timer. Not allowed in this dashboard: new data is pushed through Socket.IO, and `setInterval` only moves the clock on the screen. |
| **Private** and **Public network profiles** | A Windows setting per Wi-Fi: **Private** for a home Wi-Fi you trust, **Public** for public Wi-Fi. The Node.js firewall permission for phone mode is only for Private (Module 10). |
| **Profiler** and **Highlight updates** | Two React DevTools measuring tools: **Highlight updates** briefly frames the components that re-render; the **Profiler ⚛** tab counts every commit during a recording. |
| **Room** | A group of sockets in the backend, one per device (`device:<device_id>`). `telemetry` is only sent to its device's room, while `status` and `event` go to everyone. The rooms are gone every time the connection drops, so `follow` is repeated on every `connect`. |
| **Selector** | A small function that picks the part of the store a component reads, for example `useLiveStore((s) => s.connection)`: the component only re-renders when that part changes. Don't return a new array (`?? []`); use `EMPTY`. |
| **Socket.IO** and **socket** | One connection that stays open between the browser and the backend (opened through HTTP, then upgraded to WebSocket). The dashboard makes it once, in `src/socket.ts`, with `withCredentials: true` so the login cookie comes along. |
| **Last seen** | The last time a device was heard from: first `last_seen` from the database (the server's clock), then the browser's clock when its `telemetry` arrives; shown as relative time. |
| **Zustand store** | The "shared notice board" for every screen (`useLiveStore` in `src/store.ts`): the connection, the devices, the status, the latest readings, last seen, and the 5-minute windows. |

## 📝 5-Question Quiz

1. A friend wants the dashboard v0.1 numbers to move with `setInterval(() => fetch(…/latest), 1000)`. (a) What is this called, and what are its two drawbacks? (b) How does v0.2 get new numbers? (c) Why doesn't the `setInterval` in `src/time.ts` break the "no polling" rule?
2. A friend adds a listener in a component: `useEffect(() => { socket.on("telemetry", (id) => console.log("reading", id)); }, []);`. (a) With `npm run dev`, every reading prints twice. Why? (b) With `npm run preview`, only once. Does that mean it's safe? (c) What's the cure?
3. The dashboard is left open on a device's details. (a) About once every 15 minutes, the badge briefly shows `Reconnecting…`, then `Live` again. What's happening, and who reconnects? (b) On Windows, you press **Ctrl + C** on the backend's `npm run dev`, then start it again. What happens to the dashboard's connection? (c) When does the badge become `Disconnected`, and what do you do?
4. The **Water tank** gauge says `14%`, but its arc is full from the left end to the right end. (a) What's missing in `Gauge.tsx`, and why is the arc always full without it? (b) Why is this dangerous? (c) Name three other things in v0.2 that keep the visuals honest.
5. Phone mode is on. (a) A friend types `http://localhost:5173` in their phone's browser: it doesn't open. Why? (b) With `http://192.168.1.10:5173`, the page shows, but the login fails with the box `Can't reach the server at http://192.168.1.10:8080. …`, and the Console writes `blocked by CORS policy`. What was forgotten? (c) Why do they have to log in again on the phone, even though they're logged in on the laptop? (d) What must be done before the laptop is taken to another Wi-Fi?

<details>
<summary><b>Answer key</b></summary>

1. (a) **Polling**: asking again and again. Its drawbacks: almost every question is wasted (the device sends every 10 seconds, so ±9 out of 10 answers are "nothing new yet"), and every phone or tab adds load to the backend. (b) **Pushed**: the browser only has to `follow` once per device, then the backend sends a `telemetry` event through the socket that stays open, as soon as a valid reading arrives. On the author's laptop, a lamp command changed the card in less than 0.1 seconds. (c) That tick only recalculates the time on the screen (`last seen … ago`), without touching the network ([Concept 1](#1-pushed-not-asked-for-live-data-over-socketio), [Concept 6](#6-time-on-the-screen-wib-time-relative-time-and-a-tick-that-isnt-polling)).
2. (a) In development mode, StrictMode rehearses every effect: add, clean up, add again. This effect has no cleanup, so the first listener is never removed: two listeners, exactly the `telemetry listeners now: 2` of 🔁 Step 3. (b) **No.** The listeners still pile up every time the component is mounted again, for example every time you switch screens; StrictMode only makes the bug show up quickly. (c) Use a named function and remove that same function: `function onTelemetry(id: string) {…}`, `socket.on("telemetry", onTelemetry)`, then `return () => { socket.off("telemetry", onTelemetry); };`. Don't use `socket.off("telemetry")` without a function (it removes **all** the listeners of that event, including `useRealtime`'s) ([Concept 3](#3-useeffect-for-subscribing-add-the-listeners-remove-them-in-the-cleanup)).
3. (a) The 15-minute `access` wristband has expired, and the backend cuts its socket **on purpose** (`io server disconnect`). For that reason, Socket.IO doesn't reconnect by itself, so the dashboard asks for it: `refreshOnce()` exchanges the season pass for a new wristband (`POST /auth/refresh -> 200`), the result is `true`, then `socket.connect()`, and `onConnect` sends `follow` again. (b) On Windows, the backend **sometimes** dies abruptly without a stop log (`transport close`): Socket.IO tries again by itself, with pauses. **Sometimes** the backend manages to stop gracefully (`SIGINT received: the backend is stopping gracefully`, then `io server disconnect`): the dashboard tries a refresh first, the backend doesn't answer (`null`), then it calls `socket.connect()` anyway and keeps trying, with pauses. Both go back to `Live` without **F5** a few seconds after the backend is ready (the author: 4.0 and 16.4 seconds). (c) After **Log out** (`socket.disconnect()` first, then `POST /auth/logout`): just log in again. Or when the socket is still refused even after three refreshes (for example, the database is down): fix the cause, then **F5** ([Concept 2](#2-a-locked-socket-the-same-cookie-the-same-wristband)).
4. (a) `<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />`. Without it, the arc's scale is worked out from the data, so the one value becomes the end of its own scale: the arc is always full (in the author's lab, 32% and 41% were both full). (b) The eye reads the picture before the number: an almost empty tank looks full, so it isn't filled in time. (c) For example: a unit on every number (`%`, `°C`); color always comes with text (`low (below 20 %)`, `Online`/`Offline`); `null` is written `—`, not 0; gaps aren't joined in either chart; the animation is off so numbers don't "slide" from the old value ([Concept 9](#9-honest-visuals-scale-units-gaps-and-status-colors)).
5. (a) To the phone, `localhost` is **the phone itself**. Use the laptop's Wi-Fi IP from `ipconfig` (the `Wireless LAN adapter Wi-Fi:` block). (b) `http://192.168.1.10:5173` isn't in `CORS_ORIGIN` (`backend/.env`) yet (or it's mistyped: `https`, a `/` at the end, a space). That line applies to `fetch` **and** the socket; without it, the badge stays stuck at `Reconnecting…` too. (c) Cookies are stored per browser and per host name: the phone's browser doesn't have those cookies yet, and `localhost` ≠ `192.168.1.10`. The viewer account is enough. (d) Switch back to laptop mode: `HOST=127.0.0.1`, remove the IP from `CORS_ORIGIN`, and run `npm run dev` without `--host` ([Concept 12](#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode), [10.4](#104-switch-back-to-laptop-mode-5-minutes)).

</details>

---

## ✅ Module 23 Completion Checklist

The pass requirement from the Syllabus: **covering the LDR with your hand changes the chart on your phone in < 1 send interval + 1 second (with Module 11's *report-by-exception*: about 1–2 seconds), and the 7-day history loads in < 1 second.** **The path without a device:** every item may be ticked with the Module 21 simulator (`f00d00000001`) standing in for Node 1 and Node 2. The first requirement is tested with the lamp command from Bruno (≈ 1–2 seconds; it tests the immediate-send pipe, not the light sensor) and `temp 33` (< 11 seconds).

> [!NOTE]
> **Not on a real phone yet.** The author hasn't tried Practice 9 and the 10.3 rehearsal on a real phone ([📚](#-sources--image-credits)). Without a phone or a second device, do the steps on the laptop through `http://<laptop-IP>:5173` with [DevTools device mode](../module-22-react-basics/README.md#71-devtools-device-mode-the-dashboard-at-375-768-and-1280-px-8-minutes) at 375 px wide, tick the ⭐ items of Practices 9 and 10 with the words "not on a real phone yet" in your learning notes and your pull request, then repeat them on a phone once you have one.

- [ ] `node warmup.js` prints the 5-minute window, `telemetry listeners now: 2`, then `0` after `off`, three WIB ticks, and CSV lines separated by `,`, matching the "Self-test answer key" (🔁).
- [ ] `try-live.html` shows a temperature that changes by itself without a button, `42["telemetry", …]` frames show in the **Network** tab (the **Socket** filter, **WS** in older versions), and then I deleted the file (Quick Win).
- [ ] After logging in, the `Live` badge lights up and the backend log writes `realtime client connected` once, even with StrictMode; backend stopped, then started again → `Reconnecting…` → `Live` again without **F5**; after **Log out**, it doesn't reconnect (Practice 1).
- [ ] The numbers in the list and the details move by themselves: `temp 33` shows up with the next message, and the **Lamp** card changes almost instantly after the command from Bruno (Practice 2).
- [ ] ⭐ Simulator stopped (device path: Node 1's USB unplugged) → the card shows `Offline` with a red edge, `last seen` keeps growing, then `· stale data`; started again → a green `Online` (Practice 3).
- [ ] ⭐ The 5-minute live chart (WIB time per minute; Temperature, Light, Humidity) changes by itself ≈ 1–2 seconds after the LDR is covered (laptop path: after the lamp command) (Practice 4).
- [ ] I saw the soil and tank gauges "wrong first" (full arcs), then honest with the 0–100 domain and `—` for `null`; dark mode follows the system setting, and the chart stays readable (Practice 5).
- [ ] I measured commits with the Profiler (real pace, fake load, wide selector), then deleted `src/loadtest/`; `git status` is clean (Practice 6).
- [ ] ⭐ The 1-hour, 24-hour, and 7-day histories show; 7 days (an average per hour, 169 points if the data is complete) writes `loaded in` under 1,000 ms three times, matching the **Network** tab and the backend log (Practice 7).
- [ ] The table is newest first, 24 rows per page (`Page 1 of 8` for 7 days), and its CSV uses `,` with decimal points, matching the table (Practice 8).
- [ ] ⭐ With phone mode (`HOST=0.0.0.0`, my IP in `CORS_ORIGIN`, `npm run dev:phone`), the viewer account logs in from the phone on the home Wi-Fi with the `Live` badge, and my video shows the chart on the phone changing in ≈ 1–2 seconds (Practice 9).
- [ ] ⭐ `npm run lint` is clean, `npm run build` **passes with one size warning** (`Some chunks are larger than 500 kB`) that has been explained, the version is `0.2.0`, the dress rehearsal of both pass requirements succeeds in one go on `npm run preview -- --host`, and laptop mode is back: the phone can't open the dashboard anymore (Practice 10).
- [ ] My `frontend/` matches v0.2.0, `frontend/README.md` has the sections on opening it from a phone and the limits of v0.2, the pull request template has the **(Module 23)** items, and my learning notes are saved in `learn-iot/module-23/notes.md` (➕ A, B, C, and E).
- [ ] ⭐ All the Module 23 work is on `main` through the "dashboard v0.2 (live)" pull request, reviewed with the **(Module 23)** items: no polling, every `socket.on` has a `socket.off`, and no `backend/.env`, `try-live.html`, or `src/loadtest/` (➕ D).

🎉 **Your dashboard is alive.** Its numbers move by themselves through Socket.IO with the same login cookie, the status cards show which devices are alive and when they were last seen, the 5-minute chart and the gauges are honest about scale and gaps, the 7-day history loads in less than a second, complete with a table and a CSV, dark mode follows the phone's setting, and all of it can be opened from a phone over the home Wi-Fi. This dashboard still only **looks**: there are no control buttons yet, and the viewer and the admin see the same screen. One more module to dashboard v1.0, and two more to the Phase 4 Checkpoint in Module 25.

> ➡️ **Next module:** Module 24 — Controls, Rule Forms, Roles, & Protected Routes. The dashboard can turn the lamp on with a "waiting for confirmation…" status, create automatic rules such as "water when soil < 30%", separate the viewer and admin screens with React Router protected routes, and gets tested by other people from their own phones over the home Wi-Fi.

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- **socket.io-client 4.8.4**: [installation](https://socket.io/docs/v4/client-installation/), [client options](https://socket.io/docs/v4/client-options/), [the socket object and disconnect reasons](https://socket.io/docs/v4/client-socket-instance/), [the client API](https://socket.io/docs/v4/client-api/), [how it works](https://socket.io/docs/v4/how-it-works/), [CORS](https://socket.io/docs/v4/handling-cors/), [connection troubleshooting](https://socket.io/docs/v4/troubleshooting-connection-issues/), and [usage with React](https://socket.io/how-to/use-with-react).
- **Zustand 5.0.16**: [`create`](https://zustand.docs.pmnd.rs/reference/apis/create) and [migrating to v5](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5).
- **Recharts 3.10.1** with `react-is` 19.3.1 ([installation](https://github.com/recharts/recharts#installation)): [migrating to 3.0](https://github.com/recharts/recharts/wiki/3.0-migration-guide), [the 3.3.0 release](https://github.com/recharts/recharts/releases/tag/v3.3.0) (`responsive`), [chart sizes](https://recharts.github.io/en-US/guide/sizes/), [`XAxis`](https://recharts.github.io/en-US/api/XAxis/), [`RadialBarChart`](https://recharts.github.io/en-US/api/RadialBarChart/), and [`PolarAngleAxis`](https://recharts.github.io/en-US/api/PolarAngleAxis/).
- **date-fns 4.4.0**: [the v4 announcement](https://blog.date-fns.org/v40-with-time-zone-support/); `formatDistanceStrict` and its default English wording read from the package code. WIB times still come from `Intl`, as in Module 22.
- **React 19.3.1**: [`useEffect`](https://react.dev/reference/react/useEffect), [`StrictMode`](https://react.dev/reference/react/StrictMode), [*render* and commit](https://react.dev/learn/render-and-commit), [queueing a series of *state* updates](https://react.dev/learn/queueing-a-series-of-state-updates), [`Profiler`](https://react.dev/reference/react/Profiler), plus [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) and [`lazy`](https://react.dev/reference/react/lazy) (🔬). **React DevTools 8.0.0**: the panel texts and the **Highlight updates** colors from [its source code](https://github.com/facebook/react/tree/main/packages/react-devtools-shared/src).
- **Tailwind CSS 4.3.3**: [dark mode](https://tailwindcss.com/docs/dark-mode), [colors](https://tailwindcss.com/docs/colors), [theme variables](https://tailwindcss.com/docs/theme), and [`color-scheme`](https://tailwindcss.com/docs/color-scheme). **Vite 8.3.5**: [the dev server options](https://vite.dev/config/server-options) (`--host`).
- **CSV**: [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180), Microsoft on [CSV UTF-8 and the BOM](https://support.microsoft.com/en-us/office/opening-csv-utf-8-files-correctly-in-excel-8a935af5-3416-4edd-ba7e-3dfd2bc4a032) and [the Windows list separator](https://learn.microsoft.com/office/troubleshoot/excel/formula-errors); MDN [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob), [`URL.createObjectURL`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static), and [`<a download>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a).
- **Only for 🔬**: [@tanstack/react-virtual](https://tanstack.com/virtual/latest/docs/framework/react/react-virtual) 3.14.22, [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), and [*remote debugging*](https://developer.chrome.com/docs/devtools/remote-debugging).
- **Backend v1.0** (read, not changed): the Socket.IO events, *rooms*, and disconnect reasons from [`realtime.ts`](../../mini-smart-home/backend/src/services/realtime.ts); the 15-minute wristband from [`token.ts`](../../mini-smart-home/backend/src/auth/token.ts); the refresh and Log out from [`routes/auth.ts`](../../mini-smart-home/backend/src/routes/auth.ts); the history and `bucket` from [`routes/devices.ts`](../../mini-smart-home/backend/src/routes/devices.ts) and [`003_hourly_summary.sql`](../../mini-smart-home/backend/migrations/003_hourly_summary.sql) (TimescaleDB [*continuous aggregates*](https://www.tigerdata.com/docs/learn/continuous-aggregates)); `HOST` and `CORS_ORIGIN` from [`config/env.ts`](../../mini-smart-home/backend/src/config/env.ts) and [`security.ts`](../../mini-smart-home/backend/src/auth/security.ts); the data shape from [Appendix A, data contract 1.4](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract).
- **Earlier modules**: [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md) (immediate send), [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md) (`seed-history`), [Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md) (buckets), [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md) (Socket.IO), [Module 20](../../phase-3-backend-data/module-20-user-security/README.md) (the wristband), [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md) (backend v1.0), and [Module 22](../module-22-react-basics/README.md) (dashboard v0.1). The pass requirement is quoted from [Syllabus §7, Module 23](../../SYLLABUS.md#module-23--realtime-dashboard-charts-gauges-history--status).

**Images.** The author's diagrams and screenshots are licensed **CC BY 4.0**; the diagrams' `.svg` files are in `assets/`. The screenshots are cropped and rearranged, with titles, numbers, and captions by the author. File by file: [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-23`, `socket-lifecycle`, `store-and-selectors`, `sliding-window-5-minutes`, `honest-visuals`, `buckets-per-range`, `phone-mode-network`, `project-diagram-module-23` (`.png` + `.svg`) | Original diagrams of the curriculum, from the dashboard v0.2 code, the backend v1.0 behavior tested by the author, and the documentation above. The numbers, times, device names, and the IP `192.168.1.10` are **examples**; the phone path in `phone-mode-network` hasn't been tried by the author with a real phone. | CC BY 4.0 |
| `ws-messages-quick-win` | A real screenshot of `try-live.html` against the real backend v1.0, together with that tab's Edge DevTools (**Network** → **Socket** → **Messages**), 1280 px wide. | Titles, numbers, and captions: CC BY 4.0, October 2026. socket.io-client is MIT-licensed; the DevTools interface belongs to Microsoft, shown as it is for educational purposes. |
| `live-device-list-status`, `live-details-chart-gauges`, `gauge-wrong-and-right`, `history-7-days-table` | Real screenshots of dashboard v0.2 ([`code/frontend/`](code/frontend/)) against the real backend v1.0, 1280 px wide: the five Module 21 lab devices, the `f00d00000001` simulator stopped on purpose (a red card, a ±40-second gap); the "wrong first" gauge from a temporary copy of `Gauge.tsx` without `PolarAngleAxis`, on the same message. | CC BY 4.0, October 2026. React, Vite, Tailwind CSS, Recharts, Zustand, and socket.io-client are MIT-licensed. |
| `dark-mode-phone-and-laptop` | Real screenshots of dark mode (emulated `prefers-color-scheme: dark`): the Details at 375 px wide (**DevTools device mode, not a real phone**) and the **Device List** at 1280 px, taken after the fix to the cards' left edge. | The same as the row above. |

**About the Expected output boxes.** All the commands and code of this module were run by the author on Windows 11 25H2 (build 10.0.26200.9711) with Node.js 24.21.0, npm 11.19.0, and Docker Desktop (Engine 29.5.3). The dashboard was tested against the **real Module 21 backend v1.0** (a copy of `mini-smart-home/backend`, `src/` unchanged) and its own `smarthome` database in a new `timescale/timescaledb:2.30.2-pg17` container: 8 migrations, the admin and viewer accounts, four registered devices (`c0ba00000001` revoked) plus the unregistered `f00d00000002`, and history from `npm run seed-history` plus `CALL refresh_continuous_aggregate`. Its MQTT broker is a small locked program that imitates the Module 21 Mosquitto; the senders are fake Node 1 and Node 2 plus the `tools/` simulator for `f00d00000001`, with example sensor numbers.

The terminal boxes were recorded in a Windows PowerShell 5.1 console, not the VS Code terminal, without output redirection, so the `oxlint` summary and the 500 kB warning show as they do on your screen. The lab used other ports for the backend, Vite, the database, and the broker; the boxes write them as usual (`8080`, `5173`, `smarthome-db` at `5432`, and the broker at `:1883`), and no port shows in the pictures. The browser is Microsoft Edge 156.0.4314.42, headless, driven by a script, with the time zone emulated as `Asia/Jakarta`; the 375 px width was imitated with device mode. DevTools is Edge's own, opened in a separate window; Chrome wasn't used, so the name of the **Socket** filter in Chrome hasn't been checked. The React DevTools panels weren't recorded: their texts come from its source code, and the Practice 6 commit numbers were counted by a small script that reads the same data as the Profiler. Bruno wasn't recorded either: its requests (history, lamp) were sent by a Node script with the same method, address, body, and account. The CSV contents were read from the **Download CSV** button without saving to disk. The laptop's Wi-Fi IP is masked as `192.168.1.10` (other adapters `192.168.x.x` and `172.x.x.x`), and folder paths are written `C:\Users\you\…`. The 🧩 keys were tried in the same lab.

The author's laptop is in the UTC+8 zone; the backend ran with `TZ=Asia/Jakarta`, so the backend log times stay WIB. During the module's first recordings, that laptop was **very busy** (the CPU often at 100% from other work): `npm install` took up to `in 10m`, senders sometimes dropped off the broker (`Keepalive timeout`, unintended gaps), and the 7-day History `loaded in … ms` ranged over 16–830 ms. This edition keeps those example values; build file names, sizes, and screen texts come from the English code. So the seconds, milliseconds, `built in …`, times, build file names, and sensor numbers in every box are **examples**. What has to match is the shape of the output and the pass requirement.

**Not** tested: real Android phones and iPhones (Practice 9 was proven from the laptop's browser through its own Wi-Fi IP; the phone screen, a sleeping phone, and the rehearsal on a phone haven't been tried); the **Private** firewall permission window (its settings were deliberately left untouched) and guest Wi-Fi; Safari, including iOS, and Firefox; a difference between the device's clock and the phone's clock; opening the CSV in Excel, LibreOffice, or Google Sheets; cmd.exe (`Terminate batch job (Y/N)?`) and the `Restricted` PowerShell execution policy; Ctrl+C and the commands on macOS or Linux; dark mode from a real system setting (emulated); and real boards and a real LDR (the first pass requirement was proven with `temp 33` and the lamp command).

---

[⬅️ Module 22](../module-22-react-basics/README.md) · [Phase 4](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 24 — Controls, Rule Forms, Roles, & Protected Routes** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-24--controls-rule-forms-roles--protected-routes))
