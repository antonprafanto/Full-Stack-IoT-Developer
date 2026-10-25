# Module 22 — HTML, CSS, & React (TypeScript) from Scratch for an IoT Dashboard

🌐 **English** · [Bahasa Indonesia](../../../fase-4-frontend-dashboard/modul-22-react-dasar/README.md)

*Phase 4 · Week 22 · Hardware: **not required** — the dashboard only reads backend v1.0 on the laptop; its data comes from Node 1 and Node 2 (**Kit A + B**) **or** the Module 21 simulator · Prerequisites: **Module 21** (the locked backend v1.0) · Time: 9–11 hours, spread over the week*

[⬅️ Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 23 ➡️](../module-23-realtime-dashboard/README.md)

---

Welcome to **Phase 4**. During Phase 3 you built the **brain** of the Mini Smart Home and then locked it, but that brain doesn't have a **face** yet. To find out the garden's temperature, you still open Bruno, log in, send `GET /devices/246f28b1c7d4/latest`, then read JSON full of curly braces. To you that's normal; to a family member who only wants to know whether the water tank still holds water, it's a puzzle.

Phase 4 gives this house a face: **a dashboard that's pleasant to use on a phone or a laptop, by people who don't know what MQTT is**. Module 21 closed Phase 3 with a note that the origin `http://localhost:5173` has been in `CORS_ORIGIN` since Module 20, waiting. You build the page at that address from scratch: hand-written HTML, CSS, and JavaScript (including taking apart the Module 10 `/on` `/off` switch, which you once pasted in with the note "a pretty design waits for Module 22"), then React and TypeScript, up to a small login form for your locked API. There's no new firmware and the backend code doesn't change; the new project lives in the `frontend/` folder.

This week you put on its first face:

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Your home's data can only be read through Bruno, `/docs`, and the small terminal. | There's no web page of your own that reads the locked API yet. | **Dashboard v0.1**: a **Vite** project with **React 19** and **TypeScript** in the `frontend/` folder (Concepts 4–5, Practice 2) |
| The Module 10 `/on` `/off` switch page works, but what's inside is still a black box. | Its HTML, CSS, and JavaScript have never been taken apart. | **HTML the skeleton, CSS the skin, JavaScript the muscles**: the Module 10 page is taken apart with DevTools, then given skin and muscles (Concepts 1–2, Practice 1) |
| A neat card in plain CSS needs long rules and an invented name for every box. | Styles are written from scratch, separate from the HTML. | **Tailwind CSS v4**: small classes like `rounded-xl p-4` right on the element, without `tailwind.config.js` (Concept 3, Practice 2) |
| The card for every sensor is copied over and over, and the typo `humidty` (should be `humidity`) only shows up when its card is empty. | There's no reusable brick yet, and the page doesn't know the shape of the data. | **A `SensorCard` component** with *props* typed from Appendix A (`src/types.ts`): the typo is flagged by the editor and by `npm run build` (Concepts 5–6, Practice 3) |
| Since Module 20 the API answers **401** to anyone who isn't logged in, and the wristband only lives for 15 minutes. | The backend only trusts the wristband it put on (the `access` cookie), and `localhost:5173` is a different origin from `localhost:8080`. | **A minimal login form** with `useState` (polished in Module 24), `fetch` with `credentials: "include"` through the CORS from Module 20, and **refresh once** with the season pass (the `session` cookie), as Module 20 promised (Concepts 7 and 9, Practices 4 and 6) |
| When the backend is slow, down, or has just restarted, the page is empty or freezes without any explanation. | Fetching data takes time and can fail; after the backend restarts, `/latest` answers 404 until the first reading arrives. | **Three states**: loading, error, and empty; the data is fetched by `useEffect` after the screen appears (Concepts 8 and 10, Practices 5–6) |
| Times in the JSON are written in UTC (ending in `Z`), and a device whose key has been revoked (Module 21) can still be `online`. | Modules 10–21 deliberately left these two jobs to the dashboard. | **A device list and details** with "updated at … WIB" from `ts` and a `key` badge that makes a `revoked` device stand out (Practices 5–6) |
| Device names and locations are typed by people; a careless page can end up running a malicious script hidden in them (XSS). | Text inserted as HTML can become code; Module 20 postponed XSS in the dashboard to here. | **JSX escapes text automatically** (no `dangerouslySetInnerHTML`); the tokens stay in `HttpOnly` cookies, not in `localStorage` (Concepts 5 and 9) |
| The dashboard has to read well on a phone, yet it's written on a laptop. | Cards that are neat on a laptop can be cut off or force the phone screen to scroll sideways. | **A responsive layout**, *mobile first*, with Tailwind's grid, checked in DevTools device mode at widths of 375, 768, and 1280 pixels (Concept 11, Practice 7) |

At the end of the week you log in at `http://localhost:5173` with your Module 20 account, then see all of Node 1's readings (or `f00d00000001`'s) as cards with WIB times. That's the pass requirement from the Syllabus: **after logging in, the dashboard shows the latest readings of all the sensors from the API, laid out neatly on a phone screen.** The phone screen is checked with DevTools device mode (a real phone: optional, in 🔬). The Mini Smart Home gets **dashboard v0.1** (`0.1.0`): still static (numbers that move by themselves and charts come in Module 23), but already with a login. The backend stays v1.0, the data contract stays 1.4.

![Roadmap of Module 22. At the top, the six phases of the curriculum from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 4 Dashboard, Modules 22 to 25, is highlighted with a purple frame. Modules 1 to 21 are marked done; Module 22 is red and marked YOU ARE HERE, Modules 23 to 25 are purple, and to their right a purple label, Phase 4 begins (Modules 22–25), points back at that row. The note next to the marker: the house gets a face, the first React dashboard in the browser with a login, the device list, and the latest readings of all the sensors. Below it, the box Module 22 this week, 9 to 11 hours spread out; hardware not required, a direct continuation of Module 21 with the locked backend v1.0 and the accounts admin@home.test and viewer@home.test. The activity list: the JavaScript warm-up, that is destructuring, map, the operators ? :, &&, and ??, spread ..., and fetch to /health; Quick Win, your first sensor card in the browser without installing anything; Practice 1, HTML, CSS, and JavaScript by hand, taking apart the Module 10 page; Practice 2, your first Vite project with React, TypeScript, and Tailwind v4; Practice 3, the first component SensorCard and types from the data contract; Practice 4, state and the login form, with the pass requirement part after logging in; Practice 5, useEffect, who am I, and the device list; Practice 6, device details, the latest readings of all the sensors, with the pass requirement part the latest readings of all the sensors from the API; Practice 7, neat on a phone screen, with the pass requirement part neat on a phone screen, checked in DevTools device mode; Practice 8, the pass tests, build, lint, and a dress rehearsal, that is a dress rehearsal of the three pass requirements after npm run lint and npm run build; and the Add-on, dashboard v0.1 and the pull request dashboard v0.1. Practices 4, 6, 7, 8, and the Add-on carry a star, required to pass. Notes at the bottom: the pass requirement from the Syllabus, after logging in, the dashboard shows the latest readings of all the sensors from the API, laid out neatly on a phone screen; two data paths, the devices (Node 1 and Node 2 via the Pi gateway) or the laptop (the Module 21 simulator, practice device f00d00000001); no Wokwi needed; always open http://localhost:5173, not 127.0.0.1, because the login cookies only come along if the page and the API share a host name.](assets/roadmap-module-22.png)

> [!NOTE]
> **How to use this module.**
>
> - **Two data paths, one dashboard.** As Module 11 laid down, the dashboard doesn't connect to the broker or to the devices, only to the backend v1.0 API. **The device path**: Node 1 and Node 2 (**Kit A + B**) send through the broker on the Pi gateway, as at the end of Module 21. **The laptop path**: Mosquitto on the laptop and the Module 21 simulator (the `tools` folder) with the practice device `f00d00000001`, which is already registered. The simulator only imitates Node 1, so the parts that are only about Node 2 are just for reading; you still meet the pass requirement. **Wokwi isn't used** (there's no new firmware).
> - **Always open the dashboard at `http://localhost:5173`**, the address Vite prints, not `127.0.0.1:5173` (on the author's Windows laptop that address doesn't even open with Vite's default settings; 🚨). The dashboard knocks on the backend at `http://localhost:8080` (the same host name as its page), while Bruno and `/docs` stay at `http://127.0.0.1:8080`. Because cookies stick to a host name, a login in `/docs` doesn't count in the dashboard, and the other way round (Concept 9).
> - **The 🖥️ box of every practice names its tools**: **VS Code** with the `backend` terminal (backend v1.0, `npm run dev`, door 8080), the `frontend` terminal (Vite, also `npm run dev`, door 5173), and on the laptop path the `tools` terminal (the simulator); **Docker Desktop** with `smarthome-db` running; **Chrome or Edge** with DevTools (the **Elements**, **Console**, **Network**, and **Application** tabs) and the **React DevTools** extension (Practice 2); and **Bruno** to check the numbers on the screen against the API.
> - **A direct continuation of Module 21.** The `smarthome-db` container (the `admin@home.test` and `viewer@home.test` accounts), backend v1.0 on `main`, the Bruno collection with `backend/bruno/.env`, and `tools/.env` (the practice device's key) are used as they are. The dashboard lives in the **`frontend/`** folder of the `mini-smart-home` repository, next to `backend/` and `tools/`, on the `feature/dashboard` branch.
> - **The Expected output boxes.** The outputs and screenshots were recorded by the author on Windows 11 25H2 (build 10.0.26200.9711) with Node.js 24.21.0, npm 11.19.0, Docker Engine 29.5.3, and Edge 155.0.4283.62 against the real Module 21 backend v1.0 (the DevTools panel layouts were also checked in Chrome 156.0.8078.47 in earlier recordings); the Node 1 and 2 numbers come from the lab simulator, so they're fixed (details in 📚 Sources). The times, load times, build sizes, and sensor numbers on your screen will certainly be different; outputs like these are marked **example**.
> - macOS users: replace **Ctrl** with **Cmd** for VS Code and browser shortcuts (DevTools: **F12** or **Ctrl + Shift + I**, macOS **Cmd + Option + I**; reload: **F5**, macOS **Cmd + R**). **Except in the terminal:** stopping a program (the backend, Vite, the simulator) is still **Ctrl + C**, on a Mac too. Terminal commands are the same on Windows and macOS, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The dashboard doesn't store passwords or tokens.** A password only lives in the login form while it's being typed. The wristband and the season pass are `HttpOnly` cookies that the browser takes care of and JavaScript can't read. Don't write a password or a token in the code, let alone store it in `localStorage` (Concept 9).
> 2. **Every `VITE_…` variable is sent to the browser**, embedded in JavaScript that anyone can read. It may only hold addresses like `VITE_API_BASE`, never secrets (Concept 4).
> 3. **`.env.local` doesn't go into Git.** The Vite template ignores files ending in `.local`, and in Practice 2 you add `.env` to `.gitignore`. Only `.env.example` goes to GitHub.
> 4. **The backend and the dashboard are for your laptop only.** Don't change the backend's `HOST` to `0.0.0.0` or run Vite with `--host`, except in the optional part "trying it on a real phone" in 🔬 (then put the settings back). Phones over the home Wi-Fi become official in Module 23; the internet waits for HTTPS in Module 27.
> 5. **Install npm packages with the versions written here** (for example `npm create vite@9.3.1`). Copy package names from the module, not from memory: a package with a similar name can be made by someone else.

Like Modules 16–21, this module opens with a **🔁 JavaScript warm-up**, this time as preparation for React. The first day (the warm-up, the Quick Win, Concepts 1–2, Practice 1) needs only HTML, CSS, and JavaScript, without installing any packages; React only arrives in Practice 2. The fold-out sections under 🚨 (click the heading) are opened when you need them; the fold-out sections under 🔬 may be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🏆 Quick Win: your first sensor card in the browser (20 minutes)](#-quick-win-your-first-sensor-card-in-the-browser-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Three layers](#1-a-web-page-html-the-skeleton-css-the-skin-javascript-the-muscles) · [2 DevTools](#2-the-browser-and-devtools-taking-apart-the-module-10-switch) · [3 Tailwind](#3-tailwind-css-v4-skin-made-of-small-classes) · [4 Vite](#4-vite-and-the-frontend-folder-the-development-kitchen-at-localhost5173) · [5 React and JSX](#5-react-and-jsx-a-page-made-of-lego-bricks) · [6 *Props* and types](#6-props-and-types-data-handed-down-shaped-by-the-data-contract) · [7 *State*](#7-state-and-usestate-a-screen-that-remembers) · [8 `useEffect`](#8-useeffect-and-fetch-fetching-data-after-the-screen-appears) · [9 Logging in from the browser](#9-logging-in-from-the-browser-cookies-cors-and-localhost) · [10 Three states](#10-loading-error-and-empty-three-states-you-always-prepare-for) · [11 Responsive](#11-responsive-one-page-for-phones-and-laptops)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 HTML by hand](#practice-1--html-css-and-javascript-by-hand-taking-apart-the-module-10-page-60-minutes) · [2 Vite project](#practice-2--your-first-vite-project-react-typescript-and-tailwind-v4-45-minutes) · [3 `SensorCard`](#practice-3--the-first-component-sensorcard-and-types-from-the-data-contract-45-minutes) · [4 Login](#practice-4--state-and-the-login-form-60-minutes) · [5 Device list](#practice-5--useeffect-who-am-i-and-the-device-list-60-minutes) · [6 Device details](#practice-6--device-details-the-latest-readings-of-all-the-sensors-60-minutes) · [7 Phone screen](#practice-7--neat-on-a-phone-screen-40-minutes) · [8 Pass tests](#practice-8--the-pass-tests-build-lint-and-a-dress-rehearsal-35-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-22-completion-checklist)

## 🎯 After this module you can…

1. **Explain the three layers of a web page** (HTML the skeleton, CSS the skin, JavaScript the muscles), then **take apart the Module 10 `/on` `/off` switch page** with the browser's DevTools: the **Elements**, **Console**, and **Network** tabs.
2. **Add skin with Tailwind CSS v4** through small classes right in the HTML, without a `tailwind.config.js` file.
3. **Create a Vite project from the `react-ts` template** and understand the `frontend` folder: the `npm run dev` "kitchen" at `http://localhost:5173` and the `npm run build` "ready-to-serve dish" in `dist/`.
4. **Split a screen into reusable components**, such as `SensorCard`, with *props* typed from the Appendix A data contract (`src/types.ts`).
5. **Use `useState`** for the login form and **`useEffect`** to fetch data after the screen appears: the device list (with the Module 21 `key` badge) and the latest readings of all the sensors, with WIB times.
6. **Log in from the browser with the Module 20 cookies**: `fetch` with `credentials: "include"` to the backend at `localhost` (not `127.0.0.1`), without storing a token in `localStorage`, and explain how JSX protects the dashboard from XSS.
7. **Keep the session alive by refreshing once**: when the 15-minute wristband expires (401), the dashboard knocks on `POST /auth/refresh` one time, then repeats its request, as Module 20 promised.
8. **Prepare three states on every screen** (loading, error, and empty), including a session that has really expired (401) and a device that has no reading yet.
9. **Lay out the dashboard so it's neat on phones and laptops** (375–1280 px), then make sure `npm run lint` is clean and `npm run build` passes before dashboard v0.1 is merged through a pull request.

## 🧰 What you need

| What to prepare | Notes |
| :--- | :--- |
| **The result of Module 21** | The **`smarthome-db`** container running in Docker Desktop, **backend v1.0** on `main` (Module 21 ➕ E), the `admin@home.test` and `viewer@home.test` accounts from Module 20 with their passwords (to log in in Practice 4), and `tools/.env`. |
| **A data source** (pick one path) | **Device path:** Node 1 v1.6.0 and Node 2 (Kit A + B) running and registered in the backend since Module 21, with the locked broker on the Pi gateway. **Laptop path:** Mosquitto on the laptop and the Module 21 version of `tools/device-simulator.js` with the practice device **`f00d00000001`**, which is already registered. Wokwi and the Arduino IDE aren't used. |
| **Node.js 24, VS Code, Git, Bruno** | Vite 8 needs Node.js **20.19+ or 22.12+**, so any Node.js 24 is enough. A Mac stuck on Node.js 22 since Module 4 can still join in if its version is **22.18 or newer**, the backend's requirement since Module 16. Bruno is used again from Practice 4 on. |
| **Google Chrome or Microsoft Edge** | To open the dashboard, together with its built-in **DevTools**. Firefox and Safari haven't been tested. |
| **React DevTools** | A free browser extension from the React team that adds a few tabs to DevTools, among them **Components**: the component tree with its *props* and *state*. Installed in Practice 2. |
| **The `learn-iot` folder** and **the Module 4 tools** | The warm-up, the Quick Win, and Practice 1 work in `learn-iot/module-22` without new packages. Two Module 4 tools in `mini-smart-home/tools` are used again: `webhook-receiver.js` (Practice 1) and `generate-dummy.js` (Practice 3). |
| **An internet connection** | For `npm create vite@9.3.1`, `npm install`, and React DevTools. Together with Tailwind, `frontend/node_modules` takes about **100 MB** (measured on the author's Windows laptop). After that, the dashboard doesn't need the internet anymore. |
| **A GitHub account** | Set up since Module 16; used for the "dashboard v0.1" pull request in ➕. |

Versions used in this module (October 2026): **Node.js 24**, **create-vite 9.3.1** (the project creator, through `npm create vite@9.3.1`), **vite 8.3.5**, **react** and **react-dom 19.3.1**, **@vitejs/plugin-react 6.1.2**, **tailwindcss** and **@tailwindcss/vite 4.3.3**, **typescript 6.0.3**, **oxlint 1.89.0**, **@types/node 24.19.2**, and the **React DevTools 8.0.0** extension. You don't install them one by one: the `react-ts` template writes them in `package.json` as ranges (for example `"vite": "^8.3.4"`), then `npm install` in Practice 2 picks the newest version with the same leading number; in October 2026 the result is exactly the list above. Only Tailwind is installed by you, with a written version (`npm install tailwindcss@4.3.3 @tailwindcss/vite@4.3.3`). **oxlint** is the template's built-in code tidiness checker (*linter*), which replaces the ESLint of older tutorials (🚨).

> [!NOTE]
> **Why is the frontend's TypeScript 6.0.3 while the backend's is 7.0.2?** The create-vite 9.3.1 template pins it to `~6.0.3`; the backend has used **7.0.2** since Module 16. Each one lives in its own folder's `node_modules`, so they don't get in each other's way and don't need to match.

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, and the `learn-iot` repository folder. For Step 5 only: the Module 21 backend v1.0 in a second VS Code window (the `mini-smart-home/backend` folder) and **Docker Desktop** with the `smarthome-db` container. The browser isn't used yet.

A React component is basically a JavaScript function that returns what to show, and TypeScript is just JavaScript with type labels (Module 16). So, like Modules 16–21, we start with a warm-up: five small skills used in almost every dashboard component (see the **Later in React** notes). The code runs in Node.js in the terminal. Type it yourself, don't copy-paste, then compare the result of each step.

**Set up the folder.** Open the **`learn-iot`** repository in VS Code, click an empty spot in the Explorer panel, create a new folder **`module-22`**, then run in the terminal:

```text
cd module-22
npm init -y
npm pkg set type=module
```

`type=module` makes the `.js` files here modules (*ES modules*); Step 5 needs it. Then create **`warmup.js`** in `module-22` (this folder is used again in the Quick Win and Practice 1).

### Step 1 — A reading object and destructuring

The backend sends readings shaped by Appendix A: `device_id`, then `telemetry` holding `ts`, `fw`, and the sensor fields. **Destructuring** takes several fields at once into variables with the same names. Type in `warmup.js`:

```js
// warmup.js - a JavaScript warm-up before Module 22
// Five small skills that come back later in the dashboard's React components.

// 1. A reading object and destructuring
const reading = {
  device_id: "a4cf12e5b7c0",
  telemetry: { ts: "2026-10-23T09:41:30Z", fw: "1.5.0", temperature: 28.5, humidity: 71, light: 3094, soil: 37, motion: false, water_level: 52 },
};
const { temperature, humidity } = reading.telemetry; // take two fields at once into variables with the same names
console.log("Temperature:", temperature, "°C, humidity:", humidity, "%");
// destructuring also works right in a function's parameters, exactly the way a React component receives props
function card({ label, value, unit }) {
  return `${label}: ${value} ${unit}`;
}
console.log(card({ label: "Temperature", value: temperature, unit: "°C" }));
```

Save (**Ctrl + S**), then run in the terminal:

```text
node warmup.js
```

**Expected output:**

```text
Temperature: 28.5 °C, humidity: 71 %
Temperature: 28.5 °C
```

- **`const { temperature, humidity } = reading.telemetry;`** is the same as `const temperature = reading.telemetry.temperature;` plus a similar line for `humidity`. The names must be exact: the typo `humidty` quietly becomes `undefined` (in Practice 3, TypeScript catches it).
- **`function card({ label, value, unit })`** unpacks the object right in the parameter.

**Later in React:** a component receives what is handed down to it (*props*) as one object and unpacks it like this: `function SensorCard({ label, value, unit, color = "text-slate-800" }: Props)` (Practice 3, Concept 6). The array version uses square brackets, by position: `const [email, setEmail] = useState("");` (Concept 7).

### Step 2 — From an array to a list: `map`

`GET /devices` answers with an array, one object per device. `map` (Module 16) turns each item into something else. Add at the very bottom:

```js
// 2. From an array to a list: map
const devices = [
  { device_id: "a4cf12e5b7c0", name: "Node 1 living room", status: "online" },
  { device_id: "246f28b1c7d4", name: "Node 2 garden", status: "online" },
  { device_id: "f00d00000001", name: "Practice living room", status: "unknown" },
];
const lines = devices.map((p) => `${p.name} (${p.status})`); // one object in, one line of text out
console.log(lines);
console.log(devices.map((p) => p.device_id).join(", ")); // device_id is unique: later it becomes the key in React
```

Save, then run `node warmup.js` again. **Expected output** (new lines):

```text
[
  'Node 1 living room (online)',
  'Node 2 garden (online)',
  'Practice living room (unknown)'
]
a4cf12e5b7c0, 246f28b1c7d4, f00d00000001
```

**`map`** calls its arrow function once per device and produces a new array of the same length; `devices` doesn't change. **`.join(", ")`** joins the items of the array into one text.

**Later in React:** `DeviceList` (Practice 5) uses `devices.map` to make one `<li>` per device; `DeviceDetails` (Practice 6) uses `cards.map` to put up the `SensorCard`s. Every item made by `map` must carry a unique, stable **`key`** (Concept 5): `key={p.device_id}`.

### Step 3 — Choosing what to show: `? :`, `&&`, and `??`

A dashboard screen keeps choosing: a number or "—"? An error box or not? The choice is often about `null`, the sign of a failed reading (rule 7 of the data contract). Add:

```js
// 3. Choosing what to show: ? :, &&, and ??
const failed = { temperature: null, humidity: null, light: 2310, soil: 0, motion: true, water_level: null }; // rule 7: failed = null
console.log("Temperature:", failed.temperature ?? "—"); // ?? replaces null (and undefined) with "—"
console.log("Soil:", failed.soil ?? "—", "not", failed.soil || "—"); // || replaces 0 too, yet 0 % is a valid reading
console.log(failed.motion ? "Motion detected" : "No motion"); // ? : picks one of two
const error = "Can't reach the server";
console.log(error && `Red box: ${error}`); // && : if the left side holds something, the result is the right side
const noError = null;
console.log(noError && `Red box: ${noError}`); // if the left side is null, it stops at the left (React draws nothing)
```

**Expected output** (new lines):

```text
Temperature: —
Soil: 0 not —
Motion detected
Red box: Can't reach the server
null
```

- **`a ?? b`**: use `a`, unless `a` is `null` or `undefined` (Module 17).
- **`a || b`** also replaces `0`, yet a soil reading of 0% is valid (see `Soil: 0 not —`).
- **`condition ? a : b`**: `a` if it's true, `b` if not.
- **`a && b`**: if `a` holds something, the result is `b`; if it's empty (for `&&` and `||`: `null`, `undefined`, `false`, `0`, an empty text), the result is `a` itself, hence the `null`.

**Later in React:** all of them are used inside JSX's curly braces (Concept 5): `SensorCard` writes `{value ?? "—"}` so that `0` still shows, and the login button writes `busy ? "Logging in…" : "Log in"`. Watch out: a number `0` on the left of `&&` gets drawn on the screen too.

### Step 4 — Copying while changing: *spread* `...`

*State*, a component's whiteboard, is never scribbled on directly; when it changes, you hand over a **new** board (Concept 7). The tool for that is ***spread*** `...` (Module 17). The example is the state of Node 1's actuators (the `state` field, Appendix A). Add:

```js
// 4. Copying while changing: spread ...
const oldState = { fan: false, lamp: true, pump: false, curtain: 90 };
const newState = { ...oldState, fan: true }; // a new copy, one field replaced
console.log(oldState.fan, newState.fan); // the old one doesn't change
console.log(oldState === newState); // false: two different objects, so React knows something is new
const newDevices = [...devices, { device_id: "c0ba00000001", name: null, status: "unknown" }];
console.log(devices.length, newDevices.length);
```

**Expected output** (new lines):

```text
false true
false
3 4
```

- **`{ ...oldState, fan: true }`** pours all four fields into a new object, then `fan: true` overwrites one of them. The old one stays `false`.
- **`===` on objects** asks "exactly the same object?"; it doesn't compare the contents. A *spread* copy is always another object.
- **`[...devices, …]`** makes a new array: the three old devices plus one.

**Later in React:** *spread* guarantees that your board is a new object, so React knows something changed. `request()` in `src/api.ts` (Practice 4) uses it too: `{ credentials: "include", ...options }` always carries `credentials: "include"` plus each request's own options, for example `method: "POST"`.

### Step 5 — Asking the backend: `fetch`, `res.ok`, and `try`/`catch`

All the dashboard's data comes through `fetch` (Module 16). This time you ask your own backend v1.0 at **`GET /health`**, the door that has been open without a login since Module 20.

**Start the backend first.** With Docker Desktop running, open `mini-smart-home` in a second VS Code window (**File → New Window**), then in its terminal type `cd backend` and `npm run dev`, as in Module 21. Leave it running, then add at the very bottom of `warmup.js`:

```js
// 5. Asking the backend: fetch, res.ok, and try/catch
// GET /health is open without login. Node has no CORS: that rule belongs to the browser (Concept 9).
try {
  const res = await fetch("http://127.0.0.1:8080/health");
  if (!res.ok) {
    console.log("The backend answers, but with code", res.status); // fetch does NOT throw an error for 404 or 500
  } else {
    const health = await res.json();
    console.log("Backend alive:", health.ok, "| broker:", health.broker, "| database:", health.database);
  }
} catch (err) {
  // fetch only throws an error when the server can't be reached at all (down or a wrong address)
  console.log("The backend can't be reached. Start it first with npm run dev in the backend folder.");
  console.log("Details:", err.cause?.code ?? err.message);
}
```

Run `node warmup.js` again in the `learn-iot` window. **Expected output** (new line, backend running):

```text
Backend alive: true | broker: true | database: true
```

- **`await`** waits for `fetch`'s *Promise* until the answer comes; it's allowed outside a function because the file is a module. If Node.js rejects this `await`, `npm pkg set type=module` was skipped: run it in the `module-22` folder, then try again.
- **`res.ok`** is only `true` for statuses 200–299. **`fetch` only throws an error when the backend can't be reached** (caught by `catch`, Module 17), not for 401, 404, or 500, so checking `res.ok` is your job. `res.json()` reads the body into an object.
- **There's no CORS in Node.js.** CORS is a browser rule; Node.js, Bruno, and curl don't care about it (Module 20 Concept 9). The dashboard in the browser does obey CORS later, and it knocks on `localhost`, not `127.0.0.1` (Concept 9).

A `false` for `broker` or `database` means the backend is alive but not connected yet; for the warm-up, that's fine.

**Now try the failure path.** Stop the backend (**Ctrl + C** in its terminal), then run `node warmup.js` again in the `learn-iot` window. **Expected output** (replacing the `Backend alive` line):

```text
The backend can't be reached. Start it first with npm run dev in the backend folder.
Details: ECONNREFUSED
```

`ECONNREFUSED` (connection refused): no program is listening at door 8080. `err.cause?.code` reads it safely: `?.` stops without an error if there's no `cause`, then `??` uses `err.message`. The backend may stay stopped until Practice 4.

**Later in React:** `request()` in `src/api.ts` (Practice 4) is the grown-up version of this step: `fetch` inside `try`/`catch` (a total failure becomes an `ApiError` with code 0), then `if (!res.ok) {` (an `ApiError` with the HTTP code), and only then `res.json()`; from Practice 6 on it tries to refresh once on a 401. The difference: it runs in the **browser** from `http://localhost:5173`, carries the wristband (`credentials: "include"`), and obeys CORS. A response held back by CORS also makes `fetch` fail completely, and JavaScript isn't told how that differs from a stopped backend; that's why you check the DevTools **Console** tab first (Concept 9, 🚨).

If your output is different, compare what you typed with [code/warmup/warmup.js](code/warmup/warmup.js).

<details>
<summary>The full contents of <code>warmup.js</code></summary>

```js
// warmup.js - a JavaScript warm-up before Module 22
// Five small skills that come back later in the dashboard's React components.

// 1. A reading object and destructuring
const reading = {
  device_id: "a4cf12e5b7c0",
  telemetry: { ts: "2026-10-23T09:41:30Z", fw: "1.5.0", temperature: 28.5, humidity: 71, light: 3094, soil: 37, motion: false, water_level: 52 },
};
const { temperature, humidity } = reading.telemetry; // take two fields at once into variables with the same names
console.log("Temperature:", temperature, "°C, humidity:", humidity, "%");
// destructuring also works right in a function's parameters, exactly the way a React component receives props
function card({ label, value, unit }) {
  return `${label}: ${value} ${unit}`;
}
console.log(card({ label: "Temperature", value: temperature, unit: "°C" }));

// 2. From an array to a list: map
const devices = [
  { device_id: "a4cf12e5b7c0", name: "Node 1 living room", status: "online" },
  { device_id: "246f28b1c7d4", name: "Node 2 garden", status: "online" },
  { device_id: "f00d00000001", name: "Practice living room", status: "unknown" },
];
const lines = devices.map((p) => `${p.name} (${p.status})`); // one object in, one line of text out
console.log(lines);
console.log(devices.map((p) => p.device_id).join(", ")); // device_id is unique: later it becomes the key in React

// 3. Choosing what to show: ? :, &&, and ??
const failed = { temperature: null, humidity: null, light: 2310, soil: 0, motion: true, water_level: null }; // rule 7: failed = null
console.log("Temperature:", failed.temperature ?? "—"); // ?? replaces null (and undefined) with "—"
console.log("Soil:", failed.soil ?? "—", "not", failed.soil || "—"); // || replaces 0 too, yet 0 % is a valid reading
console.log(failed.motion ? "Motion detected" : "No motion"); // ? : picks one of two
const error = "Can't reach the server";
console.log(error && `Red box: ${error}`); // && : if the left side holds something, the result is the right side
const noError = null;
console.log(noError && `Red box: ${noError}`); // if the left side is null, it stops at the left (React draws nothing)

// 4. Copying while changing: spread ...
const oldState = { fan: false, lamp: true, pump: false, curtain: 90 };
const newState = { ...oldState, fan: true }; // a new copy, one field replaced
console.log(oldState.fan, newState.fan); // the old one doesn't change
console.log(oldState === newState); // false: two different objects, so React knows something is new
const newDevices = [...devices, { device_id: "c0ba00000001", name: null, status: "unknown" }];
console.log(devices.length, newDevices.length);

// 5. Asking the backend: fetch, res.ok, and try/catch
// GET /health is open without login. Node has no CORS: that rule belongs to the browser (Concept 9).
try {
  const res = await fetch("http://127.0.0.1:8080/health");
  if (!res.ok) {
    console.log("The backend answers, but with code", res.status); // fetch does NOT throw an error for 404 or 500
  } else {
    const health = await res.json();
    console.log("Backend alive:", health.ok, "| broker:", health.broker, "| database:", health.database);
  }
} catch (err) {
  // fetch only throws an error when the server can't be reached at all (down or a wrong address)
  console.log("The backend can't be reached. Start it first with npm run dev in the backend folder.");
  console.log("Details:", err.cause?.code ?? err.message);
}
```

</details>

<details>
<summary>Self-test answer key</summary>

1. **What does `card({ label: "Light", value: 3094 })` give, and why doesn't the Motion card suffer the same fate?** `Light: 3094 undefined`, because no `unit` was passed. `SensorCard` marks `unit?: string` (may be left out) and only writes it when `unit && value !== null`, so the Motion card (without a `unit`, Practice 3) just writes `Yes` or `No`.
2. **Why is the device list's `key` taken from `device_id`, not from `name`?** `name` is typed by people: it may be `null` (like `c0ba00000001`'s) and two devices can share one. A `key` must be unique and must not change (Concept 5).
3. **What does `failed.soil && "Soil read"` give, and what does that do in JSX?** `0`, because for `&&` the number `0` counts as empty. React doesn't draw `null`, but `0` **is still drawn** on the screen. Don't put a number on the left of `&&` (Concept 5); write `failed.soil !== null` or use `? :`.
4. **A friend writes `const copy = oldState;` and then `copy.fan = true;`. What does `console.log(oldState.fan, copy === oldState)` print, and why is that wrong for *state*?** `true true`: `copy` is just a second name for the same object. That's "scribbling on the board" (Concept 7): React sees the same object and doesn't redraw the screen. The right way: `{ ...oldState, fan: true }`.
5. **Replace `/health` with `/devices`, then run it with the backend running. What is printed, and what's missing?** `The backend answers, but with code 401`: `catch` isn't called, but `res.ok` is `false`. What's missing is the wristband, because the guard has watched over `GET /devices` since Module 20. In the dashboard, logging in (Practice 4) makes the backend put on a wristband, and `credentials: "include"` makes the browser attach it (Concept 9). Change the address back to `/health`.

</details>

## 🏆 Quick Win: your first sensor card in the browser (20 minutes)

> 🖥️ **Tools used:** **VS Code** in the `learn-iot/module-22` folder (the same as the warm-up) and the **Google Chrome** or **Microsoft Edge** browser with its DevTools. The backend doesn't need to be running.

Before meeting Vite, React, and TypeScript, first prove that a web page needs nothing but a text editor and a browser. You write one **sensor card** by hand (a label, a temperature number, and its unit), like one card on this week's dashboard.

### Step 1 — Write its skeleton: `card.html` (5 minutes)

In VS Code, right-click the **`module-22`** folder in the Explorer panel → **New File…**, name it **`card.html`**, then type its contents. (If you skipped the warm-up, first create the `module-22` folder inside `learn-iot`.)

```html
<!DOCTYPE html>
<!--
  card.html - Module 22 Quick Win: your first sensor card, written by hand.
  Nothing to install: save this file, then open it with a double-click.
  Step 1 writes the SKELETON (HTML), step 3 adds the SKIN (CSS inside <style>).
-->
<html lang="en">
<head>
  <meta charset="utf-8"> <!-- characters are saved as UTF-8: the degree sign shows correctly -->
  <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- fits a phone screen -->
  <title>Sensor card</title> <!-- the text on the browser tab -->
</head>
<body>
  <!-- Step 1: SKELETON. One card holds a label, a number, and a unit. -->
  <div class="card">
    <p class="label">Living room temperature</p>
    <p class="value">28.5<span class="unit">°C</span></p>
    <p class="caption">Node 1 · an example number, not from a sensor yet</p>
  </div>
</body>
</html>
```

Save (**Ctrl + S**). This is the **skeleton** (HTML): which parts there are and in what order (the details are in Concept 1):

- **`<!-- … -->`** is a comment: a note for people that isn't shown, like `//` in JavaScript.
- **`<head>`** holds information for the browser that doesn't show on the page (what each line is for is written in the comment at its end). `<html lang="en">` tells the browser the page is in English.
- **`<body>`** holds everything that shows: **`<div>`**, a box that wraps one card; three **`<p>`** (paragraphs); and **`<span>`**, a small piece inside a line that wraps `°C` so it can get a look of its own.
- **`class="…"`** gives names that the skin in step 3 uses to find the elements. `label`, `value`, and `unit` deliberately match the props of `SensorCard`, the component that rewrites this card in Practice 3.
- The number **`28.5`** uses a decimal point (not a comma), like the numbers in the backend's JSON.

> [!TIP]
> The `°` and `·` signs aren't on the keyboard, so just copy those lines; type the rest yourself. VS Code often adds closing tags by itself (for example `</p>`); compare your file with the code above so the closing tags aren't doubled.

### Step 2 — Open it with a double-click (3 minutes)

Right-click `card.html` in the Explorer panel → **Reveal in File Explorer** (macOS: **Reveal in Finder**), then double-click `card.html` in that folder window (Windows usually shows it as `card` with a browser icon, without `.html`). If what opens isn't Chrome or Edge, drag the file into a window of one of them.

**Result:** the browser tab says `Sensor card`, and the page holds three lines of plain black text on a white background, namely `Living room temperature`, `28.5°C`, and `Node 1 · an example number, not from a sensor yet`, in a serif font with the browser's default spacing between paragraphs.

There's no card yet: without skin, `<div class="card">` has no border, no color, and is as wide as the page. That's the **browser's default style**. The browser reads the file directly, without packages, a server, or the internet. Leave that tab open.

### Step 3 — Give it skin with `<style>` (7 minutes)

Go back to VS Code. Click at the end of the `<title>` line, press **Enter** twice (one empty line), then type the **skin** block right before `</head>`, from the comment `<!-- Step 3: SKIN …` to `</style>`. Apart from that block, the whole file below is the same as your skeleton:

```html
<!DOCTYPE html>
<!--
  card.html - Module 22 Quick Win: your first sensor card, written by hand.
  Nothing to install: save this file, then open it with a double-click.
  Step 1 writes the SKELETON (HTML), step 3 adds the SKIN (CSS inside <style>).
-->
<html lang="en">
<head>
  <meta charset="utf-8"> <!-- characters are saved as UTF-8: the degree sign shows correctly -->
  <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- fits a phone screen -->
  <title>Sensor card</title> <!-- the text on the browser tab -->

  <!-- Step 3: SKIN. Every rule applies to the elements with the same class name.
       The colors are almost the same as the Tailwind colors (slate and teal) we use in the dashboard later. -->
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 24px;
      background: #f1f5f9; /* slate-100 */
    }
    .card {
      max-width: 220px;
      padding: 16px;
      background: white;
      border: 1px solid #e2e8f0; /* slate-200 */
      border-radius: 12px; /* rounded corners */
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* a thin shadow */
    }
    .label {
      margin: 0;
      font-size: 14px;
      color: #64748b; /* slate-500 */
    }
    .value {
      margin: 4px 0 0;
      font-size: 32px;
      font-weight: 600; /* semi-bold */
      color: #0d9488; /* teal-600 */
    }
    .unit {
      margin-left: 4px;
      font-size: 16px;
      font-weight: normal;
      color: #94a3b8; /* slate-400 */
    }
    .caption {
      margin: 8px 0 0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <!-- Step 1: SKELETON. One card holds a label, a number, and a unit. -->
  <div class="card">
    <p class="label">Living room temperature</p>
    <p class="value">28.5<span class="unit">°C</span></p>
    <p class="caption">Node 1 · an example number, not from a sensor yet</p>
  </div>
</body>
</html>
```

VS Code may add `</style>` or `}` by itself; don't let them double up. If in doubt, just replace the whole contents of your file with the code above.

This is the **skin** (CSS). Every rule holds a pointer to elements (a ***selector***), then a list of `property: value;` inside curly braces:

- **`body`** (without a dot) applies to `<body>`: a font without serifs, 24 px of space from the edge of the screen, and a very light gray background.
- **`.card`** (with a dot) means "the elements that have `class="card"`": at most 220 px wide (without `max-width`, a `<div>` is as wide as the page), 16 px from the content to the edge (`padding`), a white background, a border (`border`), rounded corners (`border-radius`), and a thin shadow (`box-shadow`).
- **`.label`, `.value`, `.unit`, and `.caption`** set the size (`font-size`), weight (`font-weight`), and color (`color`) of the text, plus the spacing (`margin`). `margin: 0` removes the default spacing of `<p>`; `margin: 4px 0 0` means 4 px on top only.
- `<span class="unit">` sits **inside** `<p class="value">`, so it inherits its parent's big, bold, colored text; `.unit` makes it small, not bold, and gray again.
- **`#0d9488`** is a hexadecimal color code (a mix of red, green, and blue). CSS comments are wrapped in `/*` and `*/`; `/* teal-600 */` names the almost identical color in the **Tailwind** palette. [Concept 3](#3-tailwind-css-v4-skin-made-of-small-classes) shows how Tailwind shortens these rules into a row of short classes.

Save (**Ctrl + S**), switch to the browser, then reload with **F5** (macOS: **Cmd + R**).

**Result:** the plain text becomes a white card with rounded corners, a thin border, and a thin shadow on a light gray background, no longer as wide as the screen. `Living room temperature` is small and gray; `28.5` is big, semi-bold, and teal, followed by a smaller gray `°C`; the caption is the smallest and wraps onto two lines because the card's content is at most 220 px wide.

> [!NOTE]
> **If nothing changes**, make sure the file is saved (a ● dot on the VS Code tab means it isn't), the page is reloaded (**F5**), and the class names match the skeleton exactly, including upper and lower case (`.value` doesn't match `class="Value"`). If only part of it changes, look for a missing or doubled `{` or `}` near the first rule that has no effect.

### Step 4 — Change its number through DevTools (5 minutes)

Now change the number **without** touching the file.

1. On the card page, right-click right on the number `28.5` → **Inspect**. DevTools opens on the **Elements** tab, with the `<p class="value">` line highlighted. (**F12**, macOS **Cmd + Option + I**, opens DevTools without that highlight.)
2. That line is still collapsed. Click the small triangle on its left; the text `28.5` and the line `<span class="unit">°C</span>` appear below it.
3. Double-click the text `28.5` in the **Elements** tab until it can be edited. Delete `28.5`, type `31.0`, then press **Enter**.

**Result:** the number on the card instantly becomes `31.0°C`, even though you didn't touch `card.html`.

Try changing the skin too. Click the `<p class="value">` line once so it's selected, then find the `.value` rule in the **Styles** section (beside or below the element tree). Click the value `#0d9488` in the `color` line, type `red`, then press **Enter**: the number turns red. DevTools then opens an empty line for a new property; press **Esc** to close it.

Now reload the page with **F5** (macOS: **Cmd + R**).

**Result:** the number is back to `28.5`, in teal. All the DevTools changes are gone, and `card.html` in VS Code is still intact.

Why? DevTools changes the **copy of the page** being shown (which [Concept 2](#2-the-browser-and-devtools-taking-apart-the-module-10-switch) calls the **DOM**), not the file. On a reload, the browser reads `card.html` again and builds a new copy. So DevTools is a safe operating table: nothing gets saved.

Close DevTools with **F12** (macOS: **Cmd + Option + I**) or the **×** button in its corner, and leave `card.html` in the `module-22` folder.

In 20 minutes you've written two of the three layers of a web page: the **skeleton** (HTML) and the **skin** (CSS). But that `28.5` is a **dead number**, written by hand, not a real Node 1 reading. The dashboard needs a page that fetches the latest reading from the backend and writes it to the screen by itself. **The number comes back on a reload: that's why we need JavaScript, the third layer this card doesn't have yet, and React, which helps it.**

> ➡️ **Next:** read [Concepts 1–2](#1-a-web-page-html-the-skeleton-css-the-skin-javascript-the-muscles), then do [Practice 1 — HTML, CSS, and JavaScript by hand: taking apart the Module 10 page](#practice-1--html-css-and-javascript-by-hand-taking-apart-the-module-10-page-60-minutes).

## 🧠 The "Why" Concepts

You don't need to read these eleven concepts all at once. Read them in pairs with their practices:

1. The Quick Win (already done) → Concepts 1–2 → Practice 1 (HTML, CSS, and JavaScript by hand)
2. Concepts 3–4 → Practice 2 (the first Vite project)
3. Concepts 5–6 → Practice 3 (the first component, `SensorCard`)
4. Concepts 7 and 9 → Practice 4 (*state* and the login form)
5. Concepts 8 and 10 → Practice 5 (who am I, and the device list) and Practice 6 (device details)
6. Concept 11 → Practice 7 (neat on a phone screen) and Practice 8 (the pass tests)

Concept 9 is read **before** Concept 8, because the login form is built first. The code pieces in the concepts are just for reading; everything is written and run in the practices.

### 1. A web page: HTML the skeleton, CSS the skin, JavaScript the muscles

Every web page, from Node 1's switch in Module 10 to this week's dashboard, is made of **three languages**, each with its own job. The Syllabus borrows three words from the human body to remember them by, and a house helps you picture them:

| Layer | Language | Its job | In a house | Example |
| :--- | :--- | :--- | :--- | :--- |
| **Skeleton** | HTML | which parts there are and their order: headings, paragraphs, links, buttons | the frame, the pillars, the rooms | `<h2>Node 1 Home</h2>` |
| **Skin** | CSS | looks and position: colors, font sizes, spacing | the paint, the tiles, where the furniture goes | `font-size: 20px;` |
| **Muscles** | JavaScript | reactions and data: text that changes when a button is clicked, data fetched from the backend | the electricity that turns a lamp on when the switch is pressed | "when the button is clicked, change `OFF` to `ON`" |

![Diagram of the three layers of a web page, using the Module 10 Node 1 page as the example (networking.cpp lines 80–97). Top left, a code box titled The page's code, exactly as in Module 10 (without the C++ wrapper), sent by the ESP32 every time the browser asks for /, /on, or /off. It holds 18 lines numbered 80 to 97: DOCTYPE html, the html tag, head, meta charset utf-8, meta viewport, title Node 1 Home, body with the style attribute font-family: sans-serif; font-size: 20px; padding: 16px, h2 Node 1 Home, a Lamp paragraph with the bold placeholder %LAMP%, a link to /on Turn the lamp on, a link to /off Turn the lamp off, the line Temperature %TEMPERATURE% degrees C, humidity %HUMIDITY% percent, Light %LIGHT%, soil %SOIL% percent, Water tank %WATER% percent, and the small text Firmware %FW%, %TIME%. The style attribute is highlighted purple and marked 2, the eight percent placeholders have white boxes and are marked 3, and the link lines are marked 1. The key: 1 skeleton, almost every line, no script tag at all; 2 the only CSS, the style attribute on body; 3 the percent placeholders, filled in by the ESP32 before the page is sent. Bottom left, What the phone browser shows, example numbers the same as the Module 10 illustration: the address bar node1.local/off, the bold heading Node 1 Home, Lamp: OFF, two blue underlined links Turn the lamp on and Turn the lamp off, Temperature 28.4 °C, humidity 71 %, Light 2310, soil 37 %, Water tank 64 %, and Firmware 1.1.0, 17-10-2026 08:32 WIB. Notes next to it: the bold heading and the line spacing are the browser's default style; the blue underlined links are a default style too; tapping Turn the lamp on equals GET /on, and the ESP32 sends a whole new page. Right, three numbered purple cards. Card 1, HTML = skeleton, the frame of a house: sets the content and its order, that is headings, paragraphs, links; example tags h2 heading, p paragraph, a href link, b bold; an element is the opening tag, the content, and the closing tag, and an attribute is extra information in the opening tag, for example href=/on; on the Module 10 page almost all of its 18 lines are skeleton; from Module 22 on, the skeleton is written as JSX inside React components. Card 2, CSS = skin, paint and walls: sets the look, that is fonts, sizes, colors, spacing, and layout; on the Module 10 page just one style attribute on body, holding font-family: sans-serif; font-size: 20px; padding: 16px; the rest is the browser's default style, like bold headings and blue links; from Module 22 on, a style block and classes (Practice 1), then short Tailwind classes, for example rounded-xl p-4 text-2xl (Concept 3); even without skin the page still shows, just plain. Card 3, JavaScript = muscles, wiring and switches: makes the page move, changing part of its content without reloading; on the Module 10 page there is no script tag at all, its muscles are in the ESP32 (C++), not in the browser: server.on for /on means a tap equals a GET /on request, html.replace turns %LAMP% into ON and fills in a placeholder, then the whole page is sent to the browser again; from Module 22 on, the muscles move to the browser through addEventListener and textContent (Practice 1), then React re-renders the parts that changed (Concept 7). Bottom, two comparison boxes. Left: Module 10, every tap equals a new page; tap Turn the lamp on, then GET /on, the ESP32 fills in the placeholders, then the whole page is sent again and the address bar ends in /on. Right, purple: from Module 22 on, the page stays and its parts change; in Practice 1 a button changes the Lamp text without reloading, and the real lamp does not move (control comes in Module 24).](assets/web-page-three-layers.png)

`card.html` from the Quick Win only has two layers: the skeleton and the skin. Its number is a dead number. For the screen to always show the latest reading, the page needs muscles that fetch the data from the backend and write it to the screen. That's JavaScript's job, and React helps it.

**The skeleton: tags, elements, and attributes.** HTML is written with ***tags***, names wrapped in angle brackets `< >`. Take one line from the Module 10 switch page:

```html
<a href="/on">Turn the lamp on</a>
```

- **`<a …>`** is the opening tag and **`</a>`** its closing tag (notice the slash). The letter `a` (*anchor*) means a link. **`Turn the lamp on`** is its content, the text shown on the screen.
- **`href="/on"`** is an **attribute**: extra information inside the opening tag, always shaped `name="value"`, here the address the link goes to. Two other attributes you'll see often: `id` (a unique name for one element) and `class` (a group name that may be put on many elements).
- Everything from the opening tag to the closing tag is called one **element**. Elements without content, like `<br>` and `<meta …>`, have no closing tag. Elements can be nested: `<p><a href="/on">Turn the lamp on</a></p>` is a link **inside** a paragraph, so the whole page forms a tree (Concept 2).

**The skin: CSS rules.** CSS is written as **rules**: a ***selector*** that points at which elements get the skin, then a list of `property: value;` inside curly braces.

```css
.card {                /* selector: every element that has class="card" */
  padding: 16px;       /* the space from the content to the edge of the box */
  border-radius: 12px; /* rounded corners */
}
```

The dot in front of `card` means "the class named `card`". Rules can be put in the `style` attribute of one element (the Module 10 way), in a `<style>` block (the Quick Win way), or in a separate `.css` file (the Vite project way, `src/index.css`). The `class` attribute is the glue between the skeleton and the skin: the skeleton gives a name, the skin gives that name a look.

**The muscles: JavaScript that touches the page.** In the browser, the JavaScript you've known since Module 4 gets extra abilities: **finding**, **listening to**, and **changing** elements on the screen (`querySelector`, `addEventListener`, and `textContent`). You take them apart and try them in Practice 1.5. In React you almost never write them again, because React does it for you (Concept 5).

The three are kept apart so that each layer can change without breaking the others. In React the three live close together in one `.tsx` file (the skeleton as JSX, the skin as Tailwind classes, the muscles as TypeScript functions), but they still have three jobs.

### 2. The browser and DevTools: taking apart the Module 10 switch

In Module 10 you turned the ESP32 into a **web server**: the phone opens Node 1's address, then Node 1 answers with a page. Its first version is in [Module 10 Practice 8](../../phase-2-connectivity/module-10-wifi-and-http/README.md#practice-8--a-lamp-switch-on-your-phone-20-minutes). Its older sibling, the **Node 1 v1.1** page from [➕ F "Turn the lamp off from your phone"](../../phase-2-connectivity/module-10-wifi-and-http/README.md#f--turn-the-lamp-off-from-your-phone), is stored in the firmware as a text called `PAGE`, in `networking.cpp` lines 80–97:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Home</title>
</head>
<body style="font-family: sans-serif; font-size: 20px; padding: 16px">
<h2>Node 1 Home</h2>
<p>Lamp: <b>%LAMP%</b></p>
<p><a href="/on">Turn the lamp on</a></p>
<p><a href="/off">Turn the lamp off</a></p>
<p>Temperature %TEMPERATURE%&nbsp;&deg;C, humidity %HUMIDITY%&nbsp;%<br>
Light %LIGHT%, soil %SOIL%&nbsp;%<br>
Water tank %WATER%&nbsp;%</p>
<p><small>Firmware %FW%, %TIME%</small></p>
</body>
</html>
```

Right above that text, the firmware has the comment `// A ready-to-paste page; a pretty design waits for Module 22.`, and the Module 10 README promised that a pretty page would be built with HTML, CSS, and React in Module 22. That promise is kept this week. First take its contents apart:

- **`<!DOCTYPE html>`** marks modern HTML; **`<html>`** is the root. **`<head>`** holds information that isn't shown: `charset="utf-8"` (so that `°` shows correctly), the `viewport` line (so that it fits the width of a phone screen, Concept 11), and `<title>` (the text on the browser tab).
- **`<body>`** holds what's shown: `<h2>` a heading, `<p>` a paragraph, `<b>` bold text, `<br>` a line break, `<small>` small text. `&nbsp;` is a space that must not be split across two lines, and `&deg;` is the degree sign.
- **`%LAMP%`, `%TEMPERATURE%`, and their friends aren't HTML**: they're placeholders the ESP32 replaces through `html.replace()` before the page is sent.
- The layers: the **skeleton** is almost every line; the **skin** is only one `style` attribute on `<body>` (the rest is the browser's default style, like the blue underlined links); the **muscles** aren't in the browser at all, because they live in the ESP32: `server.on("/on", handleOn)` handles the tap, and `html.replace()` fills in the data.

**The `/on` link is a `GET` request.** Those two "buttons" are really **plain links**, with no form and no JavaScript. Tapping **Turn the lamp on** makes the browser send **`GET /on`**. The ESP32 turns the relay on, then sends the **whole page** again with `%LAMP%` replaced by `ON`. The address bar still ends with `/on`, so **reloading that page means giving the command again**, even if you've already turned the lamp off with the D13 button. Yet `GET` should only ask for data (Module 16, Concept 2); the consequences are discussed in Module 10's 🔬 "Why the `/on` and `/off` links aren't quite right".

So in Module 10, **the server draws the whole page** every time it's tapped. This week's dashboard is the reverse: the page is loaded **once**, then the **browser** fetches data with `fetch` and replaces only the parts that change. Dashboard v0.1 **only shows** the lamp and the fan; real control buttons (through `POST`, admin only, waiting for an `ack`) are only built in Module 24.

**From text to a tree: the DOM.** The browser reads the HTML text from top to bottom, then builds a **tree of elements** in its memory, called the **DOM** (*Document Object Model*). For the Node 1 page with its placeholders filled in, the tree looks roughly like this:

```text
html
├── head ── meta, meta, title
└── body
    ├── h2 ── "Node 1 Home"
    ├── p ── "Lamp: " + b ── "OFF"
    ├── p ── a (href="/on") ── "Turn the lamp on"
    ├── p ── a (href="/off") ── "Turn the lamp off"
    ├── p ── "Temperature 28.4 °C, …" + br + …
    └── p ── small ── "Firmware 1.1.0, …"
```

What's drawn on the screen is the DOM, not the file, and JavaScript and DevTools work on the DOM too. React's job, basically, is to keep the DOM matching the data (Concept 5).

**DevTools: the browser's built-in dissection kit.** Chrome and Edge have built-in developer tools (DevTools). Open them with **F12** or **Ctrl + Shift + I** (macOS: **Cmd + Option + I**), or right-click on the page and choose **Inspect**. Its three main panels:

| Panel | What it holds | Used for |
| :--- | :--- | :--- |
| **Elements** | the DOM tree, with the CSS rules of every element; it can be changed directly, but only temporarily | taking apart the skeleton and the skin (Practice 1), checking Tailwind classes |
| **Console** | JavaScript messages and errors; you can also type JavaScript there | reading CORS errors (Practice 1) and errors from React |
| **Network** | every request the page sends: the address, method, status code, headers, and body | looking at `POST /auth/login`, `GET /devices`, and their CORS headers (Practices 4–6) |

One habit for the **Network** panel: open DevTools first, then reload the page, so that every request from the start gets recorded. The **Application** panel (to see the cookies, Practice 4), device mode (to imitate a phone screen, Concept 11), and the **React DevTools** extension (Practice 2) follow when they're needed.

> ⬆️ **Done reading Concepts 1–2?** Continue to [Practice 1 — HTML, CSS, and JavaScript by hand: taking apart the Module 10 page](#practice-1--html-css-and-javascript-by-hand-taking-apart-the-module-10-page-60-minutes). Concepts 3–4 are read before Practice 2.

### 3. Tailwind CSS v4: skin made of small classes

The dashboard has a form, a list, badges, a dozen or more cards, and phone and laptop layouts. With plain CSS you have to keep inventing class names and keep switching between the HTML and the CSS.

**Tailwind CSS** provides **small ready-made classes** (*utility classes*), each for **one** thing, written right on the element you want to give skin to. Picture a paint catalog with standard codes: you don't mix the colors yourself, you just write the code on the wall. A temperature card that needs its own `.card { … }` rule in plain CSS is written with Tailwind as just `<div class="rounded-xl border border-slate-200 p-4">`. This small dictionary connects your hand-written CSS with Tailwind classes (values from Tailwind 4.3.3's default theme):

| Plain CSS | Tailwind class | Its value |
| :--- | :--- | :--- |
| `padding: 16px` | `p-4` | 4 × 0.25 rem = 1 rem (16 px) |
| `gap: 12px` | `gap-3` | 3 × 0.25 rem = 0.75 rem (12 px) |
| `border-radius: 12px` | `rounded-xl` | 0.75 rem (12 px) |
| `border: 1px solid …` | `border border-slate-200` | a 1 px line, a light gray from the Tailwind palette |
| `font-size: 14px` | `text-sm` | 0.875 rem (14 px) |
| `font-size: 24px; font-weight: 600` | `text-2xl font-semibold` | 1.5 rem (24 px), weight 600 |
| `display: flex; flex-wrap: wrap` | `flex flex-wrap` | — |
| `@media (min-width: 1024px) { … }` | the `lg:` prefix | from a width of 64 rem (1024 px) |

**rem** follows the browser's base font size, which is 16 px by default. The number after spacing classes like `p-`, `m-`, and `gap-` is multiplied by 0.25 rem, or 4 px: `p-2` = 8 px, `p-6` = 24 px. Prefixes like `sm:` and `lg:` make a class apply from a certain screen width on ([Concept 11](#11-responsive-one-page-for-phones-and-laptops)).

**CSS is only made for the classes you write.** Tailwind classes aren't built into the browser, so `class="p-4"` in `card.html` does nothing at all. In a Vite project, the `@tailwindcss/vite` plugin reads your project files **as plain text** during `npm run dev` and `npm run build`, then makes CSS **only** for the class names it finds. Tailwind doesn't run code, so a joined string like `"bg-" + color + "-100"` is never recognized as `bg-green-100`. The rule: **write class names in full**, then let the code choose, like `STATUS_COLORS` in `src/components/Badge.tsx` (Practice 5), for example `online: "bg-green-100 text-green-800"`. If the same row of classes repeats, don't copy it: wrap it in one **component**, for example `SensorCard` (Concept 5).

**Version 4 doesn't need `tailwind.config.js`.** Many tutorials on the internet still use Tailwind v3: `npx tailwindcss init -p`, the files `tailwind.config.js` and `postcss.config.js`, and three `@tailwind …;` lines. In v4 none of that is needed. Installing it takes just three steps (Practice 2.4): install the `tailwindcss` and `@tailwindcss/vite` packages, add `tailwindcss()` to the plugin list in `vite.config.ts`, then write one line, `@import "tailwindcss";`, in `src/index.css`. Your own colors or sizes, if you ever need them, are written in the CSS file with `@theme`. The full list of "old instructions → what's right for our versions" is at the top of [🚨 Troubleshooting](#-troubleshooting).

### 4. Vite and the `frontend` folder: the development kitchen at `localhost:5173`

Our dashboard is written in **TypeScript** (Module 16), **JSX** (Concept 5), and **Tailwind** classes (Concept 3), yet the browser only understands plain HTML, CSS, and JavaScript. What processes them is **Vite**, which has two working modes, like a restaurant kitchen:

- **`npm run dev` is the kitchen.** Ingredients are cooked when they're ordered. Vite runs a ***dev server*** at `http://localhost:5173`, translates your files, and watches for changes. As soon as a file is saved, the changed part is swapped in the browser right away, without reloading the page: **HMR** (*Hot Module Replacement*).
- **`npm run build` is the ready-to-serve dish.** Everything is checked, cooked, then packed into the **`dist/`** folder, which any web server can serve without Vite.

| Command | What it runs in `package.json` | The analogy | Used in |
| :--- | :--- | :--- | :--- |
| `npm run dev` | `vite` | the kitchen | Practices 2–7 |
| `npm run build` | `tsc -b && vite build` | the ready-to-serve dish in `dist/` | Practices 2.7, 3 (catching a typo), and 8 |
| `npm run preview` | `vite preview` | tasting the dish on your own laptop; not a real server | Practice 8 |
| `npm run lint` | `oxlint` | the kitchen's tidiness inspector: looks for bad habits in the code | Practice 8 |

**Why always port 5173?** The backend only allows pages from the origins listed in `CORS_ORIGIN`, which since Module 20 holds `http://localhost:5173,http://127.0.0.1:5173`. If port 5173 is taken, Vite with its default settings moves by itself to the next port, for example 5174, and the backend refuses that new origin. That's why Practice 2 adds `server: { port: 5173, strictPort: true }` to `vite.config.ts`, so that Vite **stops** with an error message instead of moving. Always open the address Vite prints, `http://localhost:5173`, not `127.0.0.1` as you got used to in Modules 16–21; on the author's Windows laptop, `http://127.0.0.1:5173` doesn't even open with Vite's default settings. The reason, and why `localhost` matters for cookies, is in [Concept 9](#9-logging-in-from-the-browser-cookies-cors-and-localhost).

**One module style for Node.js and the browser.** `index.html` in the `frontend` folder is the project's entrance. Vite reads it first, then follows these two important lines:

```html
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
```

- **`<div id="root"></div>`** is the empty box where React draws the whole dashboard: `src/main.tsx` finds it with `document.getElementById('root')`, then draws the `App` component inside it, wrapped in `<StrictMode>` (Concept 8).
- **`type="module"`** tells the browser that this script uses `import` and `export`, the **ES Modules** from Module 4. Back then, Module 4 wrote that `import`/`export` "works the same way both in Node.js and in the browser (Module 22)". Here's the proof: `main.tsx` imports `App`, then `App` imports other components, just like the backend files.

**Vite removes the type labels, but doesn't check them.** In Module 16 (Concept 4), Node.js 24 ran `.ts` files by **removing their type labels** (*type stripping*) without checking them, and one 🔬 section of that module promised: "The React dashboard in Module 22 will use a tool that erases type labels in a similar way." That tool is Vite: according to its documentation, Vite only translates `.ts` files and does **not** check their types. As a result, a type error does **not** stop `npm run dev`: the page still shows, and the mistake only comes out when that code runs. There are two checkers: **VS Code**, which draws a red line as you type, and **`tsc -b`**, the first step of `npm run build`, which prints the error and stops, so `vite build` isn't run (Practice 3). In the backend, its partner is `npm run check` (`tsc --noEmit`).

Two other differences from the backend: imports of your own files are written **without** an extension (`./api`, `./components/Login`; the template's `./App.tsx` is accepted too), and its TypeScript is the template's 6.0.3, not 7.0.2 (🧰). `enum` is still forbidden ([Concept 6](#6-props-and-types-data-handed-down-shaped-by-the-data-contract)).

**What's in the `frontend` folder.** The command `npm create vite@9.3.1 frontend -- --template react-ts` (Practice 2) creates 18 files. Here's the map after `npm install`:

```text
frontend/
├── index.html          the entrance: <div id="root"> and <script type="module">
├── package.json        name, version, four npm run commands, and the package list
├── package-lock.json   the exact version of every package
├── vite.config.ts      Vite settings
├── tsconfig.json       points to the two files below
├── tsconfig.app.json   TypeScript rules for src/, including "types": ["vite/client"]
├── tsconfig.node.json  TypeScript rules for vite.config.ts
├── .oxlintrc.json      oxlint rules (npm run lint)
├── .gitignore          what stays out of Git: node_modules, dist, *.local
├── README.md           the template's own notes
├── public/             favicon.svg, icons.svg
├── node_modules/       packages from npm install, not in Git
└── src/                main.tsx (starts React), App.tsx (the parent component),
                        index.css, App.css, assets/ (demo images)
```

You add the other files yourself, one job per file, like the Module 16 backend (Concept 5): `src/types.ts` and `src/components/SensorCard.tsx` (Practice 3), `src/api.ts` and `Login.tsx` (Practice 4), `DeviceList.tsx` and `Badge.tsx` (Practice 5), and `DeviceDetails.tsx` (Practice 6). The `frontend` folder itself lives in the `mini-smart-home` repository, next to `backend`: two projects, two terminals, and they only talk through HTTP, like Bruno with the backend.

One thing often confuses readers of older tutorials: **there's no `src/vite-env.d.ts`**. Vite's own types, such as `import.meta.env`, now come in through `"types": ["vite/client"]` in `tsconfig.app.json`.

**`VITE_…`: settings that get sent to the browser.** The backend's `.env` file (Module 16) holds secrets such as the database password and `JWT_SECRET`, and it's never sent to anyone. The frontend can read `.env` too, with two big differences:

1. **Only variables starting with `VITE_` reach the code**, through `import.meta.env.VITE_…`. Other variables, for example `DB_PASSWORD`, are deliberately `undefined`.
2. **Their values are embedded in the JavaScript sent to the browser**, so anyone who opens DevTools can read them. `VITE_…` is **not a place for secrets**: never fill it with a password, a device key, an *API key*, or a token. Our dashboard's only variable, `VITE_API_BASE`, just holds the backend's address.

| File | Read by Vite? | Goes into Git? |
| :--- | :--- | :--- |
| `.env` | yes, always | **yes**, unless it's ignored. The template doesn't ignore it, so Practice 2 adds it to `.gitignore`. |
| `.env.local` | yes, always | no: the template's `.gitignore` ignores every file ending in `.local` |
| `.env.example` | no | yes: an example that is copied to `.env.local` if your backend is at another address (Practice 4) |

Vite reads those files when `npm run dev` starts, and every value is text. After changing them, stop the *dev server* with **Ctrl + C**, then run it again (Vite 8 can also restart by itself; this way is certain). If `VITE_API_BASE` isn't set, the dashboard uses a default address that follows the page's host name, on port 8080 (Concept 9).

> ⬆️ **Done reading Concepts 3–4?** Continue to [Practice 2 — Your first Vite project: React, TypeScript, and Tailwind v4](#practice-2--your-first-vite-project-react-typescript-and-tailwind-v4-45-minutes). Concepts 5–6 are read before Practice 3.

### 5. React and JSX: a page made of LEGO bricks

In Practice 1 you change the page by hand: find the element (`querySelector`), then replace its `textContent`. For a dashboard, that quickly gets tiresome: there are a dozen or more identical cards, forgetting one update line means a stale number, and the screen keeps switching (login, list, details) without reloading the page.

**React** is a JavaScript library that takes care of all that: the data is kept in one place (*state*, Concept 7), every card is made from one mold (a component), and the screen is redrawn every time its data changes. React finds and changes the elements for you, only the parts that differ, so an input box you're typing in doesn't lose its cursor (🔬 *Virtual DOM*).

**Components: LEGO bricks.** A LEGO brick has a fixed shape, can be used again and again, and small bricks are put together into a big building. So are React **components**. Dashboard v0.1 is made of `App` (the root: it checks whether you're logged in, then picks the screen), `Login`, `DeviceList` (`GET /devices`), `DeviceDetails` (`GET /devices/:id/latest`), `SensorCard` (one card for one reading, used many times), and `StatusBadge` and `KeyBadge` (the file `Badge.tsx`). Put together, they form a **component tree**:

![The dashboard v0.1 component tree, LEGO bricks that hand things down (Concepts 5–6): props flow down from parent to child, events flow up through callbacks, and state is a small whiteboard. At the very top, a gray band: index.html has a div with the id root, src/main.tsx mounts App inside it, wrapped in StrictMode (effects run twice in development mode). Below it, the wide purple App box (src/App.tsx), which picks one of three screens with plain state (React Router only comes in Module 24). The whiteboard (state) owned by App: user, which is loading, not logged in, or the logged-in account (GET /auth/me); view, which is list or details plus the chosen device; initialError, the message above the form when the backend or the database is down at start, or the session expired. On the right side of the App box: the page header shows the account name and role; the Log out button calls POST /auth/logout (polished in Module 24); on opening, App asks GET /auth/me, logged in? From App, three purple arrows (props) go down and three dashed navy arrows (events) come up, to three children. To Login: the props initialError and onLogin; the event onLogin(user) when logged in successfully. To DeviceList: the props onSelect and onSessionExpired; the events onSelect(device) when a card is clicked and onSessionExpired() on 401. To DeviceDetails: the props device, onBack, and onSessionExpired, plus key, which is not a prop; the events onBack() from the back button and onSessionExpired() on 401. The Login box (components/Login.tsx): shown when not logged in; its own state email, password, error, busy; sends POST /auth/login; controlled inputs with required. The DeviceList box (components/DeviceList.tsx): shown when view = list; its own state devices, error; fetches GET /devices; the status and key badges use StatusBadge and KeyBadge, both from components/Badge.tsx. The DeviceDetails box (components/DeviceDetails.tsx): shown when view = details; its own state reading, error, and noReadingYet; fetches GET /devices/:id/latest; the heading holds the name, the location, and KeyBadge. From DeviceDetails a purple arrow labeled label, value, unit (+ color) goes down to the box SensorCard: one brick, used many times (components/SensorCard.tsx), holding six Node 1 sensor cards with example numbers: Temperature 28.5 °C, Humidity 71 %, Light 3094 /4095, Soil moisture 37 %, Motion No, and Water tank 52 %; below them an example of SensorCard with the label Temperature, the value 28.5, and the unit °C, and the note Lamp, Fan, the RS-485 trio, and Node 2 use the same mold. Bottom left, the box How to read this tree: a purple arrow down, props are handed down from parent to child, as data (device) or a function (onSelect), and the child only reads what it is given, it never changes it; a dashed arrow up, events are the child calling that handed-down function, for example onSelect(device), and the parent changes its own state; a light purple box, state is a small whiteboard owned by one component, it changes through a set… function, then React re-renders that component together with its children; key={view.device.device_id} means another device equals a new DeviceDetails and its old state is dropped; the same tree shows up in React DevTools, in the Components tab (Practice 2).](assets/component-tree.png)

Data flows **down** from parent to child through *props* (Concept 6); events such as "this device was clicked" flow **up** through a callback handed down. The same tree shows in the React DevTools **Components** tab (Practice 2).

**A component is a function** that returns what to show. Here's `SensorCard` from Practice 3 (Practice 7 adds `min-w-0` and `truncate` for phone screens):

```tsx
export default function SensorCard({ label, value, unit, color = "text-slate-800" }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {/* ?? = if the value is null, write "—" (not 0: the number 0 is still a valid reading) */}
        <span className={value === null ? "text-slate-400" : color}>{value ?? "—"}</span>
        {/* the unit is only written when there is a number */}
        {unit && value !== null ? <span className="ml-1 text-base font-normal text-slate-400">{unit}</span> : null}
      </p>
    </div>
  );
}
```

A component is used like an HTML tag: `<SensorCard label="Temperature" value={28.1} unit="°C" />`. The rules: its name **starts with a capital letter** (a lowercase `<div>` is taken as an HTML tag), a view of several lines is **wrapped in parentheses**, `return (` … `);` (without them, the lines after `return` are ignored), and components are written **at the top level of the file**.

**JSX: "HTML" inside TypeScript.** That HTML-like writing is called **JSX**, and its files end in `.tsx`. The browser doesn't know JSX; Vite translates it into plain JavaScript (Concept 4). How it differs from HTML:

| In HTML | In JSX | Why |
| :--- | :--- | :--- |
| `<div class="card">` | `<div className="card">` | `class` is a reserved word in JavaScript |
| `<input type="email">` | `<input type="email" />` | every tag must be closed (`<br />`, `<img … />`) |
| several elements side by side | one wrapper, or `<>` … `</>` (a *fragment*) | a function returns one value |
| `addEventListener("click", changeText)` | `<button onClick={changeText}>` | events are written in *camelCase*: `onClick`, `onChange`, `onSubmit` |
| `<p id="temperature">` + `textContent` | `<p>{temperature}</p>` | the content comes straight from the data |
| `<!-- comment -->` | `{/* comment */}` | a JavaScript comment |

The trap: **hand over the function, don't call it**. `onClick={changeText()}` (with parentheses) runs right away when React draws, before anyone clicks. If the function needs an argument, wrap it in an arrow function, as in `DeviceList`: `onClick={() => onSelect(p)}`.

**Curly braces `{ }`: a window into JavaScript**, as content (`<p>{label}</p>`) or as an attribute value (`className={color}`); `className="{color}"` (in quotes) is just literal text. Three tools from warm-up Step 3 show up here often: **`? :`** picks one of two, **`??`** gives a stand-in for `null` (`{value ?? "—"}`), and **`&&`** means "show it if…". **Don't put a number on the left of `&&`**: `{devices.length && <ul>…</ul>}` writes `0` when the list is empty; write `{devices.length > 0 && <ul>…</ul>}`.

**Lists and `key`.** Every element made by `map` (warm-up Step 2) must be given a **`key`**, an identifier that is unique among its siblings and never changes, so that React knows which item is which when the list changes. `DeviceList` uses the database ID: `<li key={p.device_id}>`. Don't use `map`'s index (it shifts) or `Math.random()` (it changes on every *render*). Without a `key`, the **Console** tab warns `Each child in a list should have a unique "key" prop.`

**JSX escapes text: built-in protection from XSS.** The OWASP table in Module 20 holds a promise: "XSS in the dashboard comes up in Module 22". **XSS** (*cross-site scripting*) happens when foreign JavaScript runs on your page (Module 20 Concept 5), most often through **outside text pasted in as HTML**. Your dashboard shows text you didn't write: the device `name` and `location` typed by an admin through `POST /devices` (Module 21), the backend's error messages, account names. Suppose a device's `name` holds `<img src=x onerror="alert(1)">`. If it's pasted in through `innerHTML`, the browser reads it as a tag: the image `x` fails to load, then the contents of `onerror`, which can be any JavaScript at all, are run.

A value inside `{ }` is always put in as **text**: React **escapes** HTML's special characters such as `<`, `>`, and quotes. The author tested it with React 19.3.1: `<p>{name}</p>` holding that name produces `<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>` (`&lt;` = `<` as text), so the screen only writes the text and no script runs. React's way of pasting raw HTML is deliberately given a scary name, **`dangerouslySetInnerHTML`**; in the same test, that name went through whole and became a real `<img onerror=…>`. The React documentation warns that using it risks opening an XSS hole; it's only for trusted data that has been cleaned.

> [!IMPORTANT]
> **The Mini Smart Home dashboard doesn't use `dangerouslySetInnerHTML` at all**, let alone for device data or API responses. All text from the backend is shown through plain `{ }`. A tutorial that uses it for data from a server is a red flag.

Another door, an npm library that has been tampered with, is guarded by habits from Module 16 (exact versions, `package-lock.json`, `npm audit`). The next layer is in Concept 9: the wristband and the season pass sit in `HttpOnly` cookies that JavaScript can't read, so even a foreign script can't run off with them. That's why tokens are never stored in `localStorage`.

### 6. *Props* and types: data handed down, shaped by the data contract

***Props* are what a parent hands down to a child**, like a packed lunch for a child setting off to school: "Here's the label, here's the number, here's the unit." With props, one `SensorCard` mold is used six times in `App.tsx` (Practice 3) with different contents:

```tsx
<SensorCard label="Temperature" value={reading.temperature} unit="°C" color="text-teal-600" />
<SensorCard label="Humidity" value={reading.humidity} unit="%" />
```

Text is written in quotes, JavaScript values inside `{ }`. On the child's side, the props are unpacked with destructuring (warm-up Step 1): `{ label, value, unit, color = "text-slate-800" }`. `color = …` is a **default value**, used only if that prop is missing (`undefined`), not if it holds `null` or `0`; the second card above uses it.

**Props are read-only**: the React documentation calls props a snapshot in time that can only be read. If the number has to change, the parent hands down a new number. What changes because of the component's own doing is kept in *state* (Concept 7).

**A prop can also be a function**, and that's how a child reports back. `DeviceList` calls the `onSelect` prop with the device that was clicked, then `App` shows the details screen. Its label, `onSelect: (device: Device) => void`, means "takes one `Device`, returns nothing"; `Login` receives a similar `onLogin`. In short: **data flows down through *props*, events flow up through a callback handed down.**

**A type label for props: `type Props`.** `SensorCard` writes down the shape of its props:

```tsx
type Props = {
  label: string; // the small text on top, for example "Temperature"
  value: number | string | null; // a number or text; null = the sensor failed to read (rule 7)
  unit?: string; // the ? mark = may be left out (the "Motion" card has no unit)
  color?: string; // the Tailwind color class for the number, for example "text-teal-600"
};
```

`|` means "one of" (as in the Module 16 backend), and `?` means it may be left out. VS Code immediately flags a required prop that was forgotten, a misspelled name (`lable`), or a value of the wrong kind (`value={true}`). Vite itself doesn't check types (Concept 4): the page still shows in `npm run dev`, but `npm run build` refuses (Practice 3).

**Its shape comes from the data contract: `src/types.ts`.** Instead of guessing, the dashboard copies the shape of the data from Appendix A (data contract 1.4) and from the Module 16–21 backend responses into type labels: `Device` (one row of `GET /devices`, including `key` from Module 21), `TelemetryNode1` and `TelemetryNode2` (the contents of `telemetry`; `Telemetry` = one of the two), `State` (the `state` of the four actuators, contract 1.3), `LatestReading` (`GET /devices/:id/latest`), `User` (`POST /auth/login`, `GET /auth/me`), and the choice lists `Kind`, `DeviceStatus`, and `KeyStatus`. The field names are exactly the same as what the backend sends, so the typo `reading.humidty` (quietly `undefined` in plain JavaScript) is flagged red right away. The type labels also tell apart three kinds of readings:

| How it's written | What it means | Example |
| :--- | :--- | :--- |
| `number` | always there | Node 1's `light`, `soil` |
| `number \| null` | the field is always there; a failed reading = `null` (rule 7) | `temperature`, `pressure` |
| `battery?: number \| null` | the field may be missing | Node 2's `battery`; Node 1's RS-485 trio and `state` |

That's why `SensorCard` writes `null` as "—", not `0`: a soil moisture of 0% is a valid reading.

**Fixed choice lists: text unions, not `enum`.** A field that may only hold a handful of texts is written as a union of texts (a *union literal*):

```ts
export type DeviceStatus = "online" | "offline" | "offline-mode" | "unknown";
```

The typo `"onlen"` is flagged right away; `"unknown"` = registered but has never sent a status (like a device that was just registered in Module 21).

In `Badge.tsx` (Practice 5), an object of type `Record<DeviceStatus, string>` holds a row of Tailwind classes written **in full** for each status, because Tailwind only makes classes that are written out completely, not joined pieces like `"bg-" + color`; `Record` demands a color for every choice.

Other tutorials may write `enum Status { Online, Offline }`, but our template turns on `erasableSyntaxOnly`, which only allows TypeScript that can simply be erased. `enum` produces real code, so it's refused with the error `TS1294` (🚨), as in the Module 16 backend.

**`import type`: types are only labels.** When Vite prepares the code for the browser, everything marked `type` is removed. Because the template turns on `verbatimModuleSyntax`, an import that holds only types **must** use `import type`, for example in `DeviceList.tsx`:

```ts
import type { Device } from "../types";
```

Without the word `type`, `npm run build` refuses with `TS1484` (`'Device' is a type and must be imported using a type-only import …`). Types from packages work the same way: `Login.tsx` writes `import { useState } from "react";` and then `import type { SubmitEvent } from "react";` on a separate line. Imports of your own files are written **without** the `.ts` extension (`"../types"`), because Vite finds the file for you; the template's `main.tsx` writes `./App.tsx`, and both are valid.

Remember the limit: **a type label is a promise, not a check.** While the page runs, the labels are already gone, so the contents of the `GET /devices` response aren't checked. For now that's enough, because the backend has checked every message with Zod since Module 16; Zod in the browser only comes in Module 24. The two copies of the types (backend and frontend) must also be kept the same; a way to share one copy is in 🔬.

> ⬆️ **Done reading Concepts 5–6?** Continue to [Practice 3 — The first component: `SensorCard` and types from the data contract](#practice-3--the-first-component-sensorcard-and-types-from-the-data-contract-45-minutes). Concepts 7 and 9 are read before Practice 4.

### 7. *State* and `useState`: a screen that remembers

The login form has to remember what's in the email and password boxes, whether the **Log in** button is waiting, and the error message. A plain variable like `let busy = false` can't do it: changing it **doesn't make React redraw**, and every *render* calls your component function from the start, so its value goes **back to `false`**.

***State* is a component's own small whiteboard.** React keeps it outside the component function, so its content survives from one *render* to the next. You don't scribble on it directly; you hand over new writing through a special function, then React redraws. Here are the four whiteboards in `Login.tsx` (Practice 4):

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [busy, setBusy] = useState(false); // true while waiting for the backend's answer
```

`useState("")` makes a board with the starting content `""` and returns **its current content** (`password`) and **the function that replaces it** (`setPassword`). The label between `< >` names what the board holds (a message text, or `null`). A whiteboard belongs to one component; if two components need the same data, the board moves up to their shared parent and is handed down, like the `user` board in `App`. A board may get its starting content from what's handed down: in Practice 5, the starting content of `error` in `Login` becomes `initialError`, handed down by `App`, for example the session-expired message.

**The rules of hooks.** `useState` and `useEffect` (Concept 8) are called ***hooks***, React functions whose names start with `use`. Call them only at the top level of a component, not inside an `if`, a loop, a `try`/`catch`, or after a conditional `return`. `npm run lint` watches over this (the `react/rules-of-hooks` rule in the template's `.oxlintrc.json`).

**Replace the board, don't scribble on it.** For text, numbers, and `true`/`false`, just call `setBusy(true)`. For objects and arrays, hand over a **new** copy with *spread* (warm-up Step 4):

| ❌ Scribbling on the board (the screen doesn't change) | ✅ Handing over a new board |
| :--- | :--- |
| `user.name = "Ani";` | `setUser({ ...user, name: "Ani" });` |
| `devices.push(newDevice);` | `setDevices([...devices, newDevice]);` |

React compares the old board with the new one; the same object, scribbled on, counts as unchanged. *Spread* only copies one level, so also copy the objects inside it if you want to change them.

**New content shows on the next *render*.** After `setBusy(true)`, `busy` on the next line is **still** `false`; React redraws after the event handler has finished. If the new content is calculated from the old content, hand over an **updater function**, like the **Count is 0** button in the Vite template (Practice 2): `setCount((count) => count + 1)`.

**A controlled form** (*controlled input*): the box's content is controlled by the whiteboard. This is the password box in Practice 4's `Login.tsx` (Practice 7 adds `min-h-11`):

```tsx
<input
  id="password"
  type="password"
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete="current-password"
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
/>
```

Typing one letter → `onChange` → `setPassword(e.target.value)` → React redraws → the box shows `value={password}`. The box's content always equals the board, so when **Log in** is pressed, `email` and `password` are ready to be taken. Without `onChange`, nothing can be typed into the box. Its starting content is `""`; React complains about `undefined`/`null`. `required` makes the browser refuse an empty form before the `fetch` sets off.

**Submitting the form: `onSubmit` and `preventDefault()`.** By default, submitting a form makes the browser move to another page (remember the form to `webhook-receiver.js` in Practice 1). `<form onSubmit={handleSubmit}>` calls `handleSubmit`, which cancels that with `e.preventDefault()`, then clears the old error, calls `setBusy(true)` so the button isn't pressed twice, calls `login(email, password)`, and calls `setBusy(false)` whatever the result. React 19 also knows `<form action={…}>`, but `onSubmit` works in every version.

> ⬆️ **Done reading Concept 7?** Skip Concept 8 for now, then read [Concept 9 — Logging in from the browser](#9-logging-in-from-the-browser-cookies-cors-and-localhost) before [Practice 4 — *State* and the login form](#practice-4--state-and-the-login-form-60-minutes). Concept 8 waits for you after Practice 4.

### 8. `useEffect` and `fetch`: fetching data after the screen appears

As soon as the login succeeds, `DeviceList` has to ask `GET /devices` without any button being pressed. Its `fetch` does **not** go in the body of the component, which runs on every *render*: the answer fills the board → React redraws → the `fetch` sets off again, forever.

**`useEffect`: sit down first, then order.** At a food stall, you sit down first, then order. React likewise draws the component first, complete with its loading text; after the screen appears, the effect runs and the `fetch` sets off (a *Promise*, the "buzzer" from Module 4); when the answer arrives, the whiteboard is replaced and the screen is redrawn. This is the effect in `DeviceList.tsx` (Practice 5):

```tsx
useEffect(() => {
  let ignore = false; // becomes true when the effect is cleaned up: an answer that arrives late is ignored
  getDevices()
    .then((list) => {
      if (!ignore) setDevices(list);
    })
    .catch((err) => {
      if (ignore) return;
      if (err instanceof ApiError && err.code === 401) return onSessionExpired();
      setError(err instanceof ApiError ? err.message : "Couldn't load the devices.");
    });
  return () => {
    ignore = true; // cleanup: React runs it before the effect repeats or when this component leaves the screen
  };
}, [onSessionExpired]);
```

`getDevices()` (in `src/api.ts`) goes through one door, `request()`, which always carries the cookies (Concept 9) and checks `res.ok`, because `fetch` doesn't treat a 404 or a 500 as a failure (warm-up Step 5).

**The list at the end of the effect** decides when the effect runs:

| Written as | The effect runs |
| :--- | :--- |
| without a list: `useEffect(fn)` | after **every** *render* |
| `[]` | once, after the component first appears |
| `[a, b]` | after it first appears, then every time `a` or `b` changes |

Every value from outside the effect that is used inside it, such as props or a callback handed down, is written in the list too: the effect above uses `onSessionExpired`, while `App`'s effect (`GET /auth/me`) reads no props or whiteboards, so its list is `[]`.

**Effects are for the outside world, not for buttons.** An effect keeps the screen in step with something outside React, such as the backend. A user's action belongs in an event handler: the login is sent from `onSubmit` (Concept 7). Without an outside world, no effect is needed.

**Want to use `await`?** The effect function isn't written as `async`, because it may only return a cleanup, not a *Promise*. Make an `async` function inside the effect, then call it right away (the React documentation names it `startFetching()`); `.then()` is valid too.

**`StrictMode`: twice in development mode.** The template's `src/main.tsx` wraps `<App />` in `<StrictMode>`. In development mode (`npm run dev`), `StrictMode` deliberately **mounts every component, unmounts it, then mounts it again**, once, after it first appears. As a result, every effect, including those with `[]`, runs twice: the **Network** tab shows `GET /devices` **twice** (Practice 5), and `GET /auth/me` too. The React documentation calls this normal; in the build it happens only once. This check only happens in the kitchen, not in the ready-to-serve dish, to flush out effects that forget to clean up after themselves. So don't remove `<StrictMode>`; prepare your effects for it.

**The `ignore` cleanup: an old answer must not overwrite a new one.** A `fetch` that has set off can't be called back; its answer still comes. In development mode, the first `GET /devices` belongs to an effect that has already been unmounted. Even outside `StrictMode`, if an effect fetches again because the values in its list changed, an old answer can arrive late and overwrite the new one. A mistake caused by an unpredictable order of arrival like this is called a ***race condition***. The cure is the official pattern from the React documentation, used in the effect above:

- The function an effect returns is called a ***cleanup***. React calls it before running that effect again and when its component leaves the screen.
- Every effect has its own `ignore`. The cleanup switches on the old effect's `ignore`, so its answer (in `.then` as well as `.catch`) is ignored: the old order is still delivered, but it isn't put on your new table.
- In `.catch`, a 401 means the session has expired, so `DeviceList` reports it through `onSessionExpired`; other errors are written on the `error` board (Concept 10).
- The name `ignore` is the same as in the React documentation's example. `AbortController`, which really cancels a request, is in 🔬.

The order of events when `DeviceList` appears in development mode:

| Step | What happens |
| :---: | :--- |
| 1 | It appears with the loading text; the first effect runs, and the first `GET /devices` sets off. |
| 2 | `StrictMode` unmounts it: the cleanup switches on the first effect's `ignore`. |
| 3 | `StrictMode` mounts it again: the second effect runs, and the second `GET /devices` sets off. |
| 4 | The first answer is ignored; the second answer fills the whiteboard and the list appears (the order they arrive in may be swapped). |

In the build there's only the first effect, and its answer is put up right away.

**`key` to start from an empty board.** When the device in `DeviceDetails` changes, its whiteboards must be empty again so that the old device's numbers don't get a chance to show. Clearing them at the start of the effect (`setReading(null)`) gets a warning from `npm run lint`. The way React recommends: `App` mounts `DeviceDetails` with `key={view.device.device_id}`, so another device means a **new** component with empty boards and an effect from the start (Practice 6), like the `key` in a list (Concept 5).

**Just once, without refreshing.** Dashboard v0.1 fetches the data **once**, when the screen appears; for a new reading, open the details again. A **Reload** button of your own is 🧩 Level 2, and numbers that change by themselves through Socket.IO come in Module 23. The loading, error, empty, and success states are discussed in Concept 10.

> ⬆️ **Done reading Concept 8?** Also read [Concept 10 — Loading, error, and empty](#10-loading-error-and-empty-three-states-you-always-prepare-for), then do [Practice 5 — `useEffect`: who am I, and the device list](#practice-5--useeffect-who-am-i-and-the-device-list-60-minutes) and [Practice 6 — Device details: the latest readings of all the sensors](#practice-6--device-details-the-latest-readings-of-all-the-sensors-60-minutes).

### 9. Logging in from the browser: cookies, CORS, and `localhost`

In Module 20, Bruno stored the cookies from the login response, then attached them to the next requests. From this week on, that job is done by the **browser**, on your dashboard's orders. The backend doesn't change, so the cookies are exactly the same (Module 20 Concepts 4–7): the **wristband** `access` (a JWT, 15 minutes, sent to every backend address because of `Path=/`) and the **season pass** `session` (a *refresh token*, at most 7 days, only sent to the `/auth/…` ticket booths because of `Path=/auth`), both `HttpOnly; SameSite=Strict`.

What's new is the **browser's rules**: three conditions that must all be met **at once**. If even one is missed, the login fails, or it seems to succeed but the next request is answered with 401.

**Condition one: ask the browser to carry the cookies.** The dashboard at `http://localhost:5173` and the backend at `http://localhost:8080` have different ports, so they're different origins (Module 20 Concept 9). For cross-origin requests, a default `fetch` (whose `credentials` is `same-origin` by default) does **not** carry cookies and doesn't store the cookies from the response, so even a 200 login leaves no wristband. The dashboard has to ask for it:

```ts
res = await fetch(BASE + path, { credentials: "include", ...options });
```

That's why every request goes through one door, `request()` in `src/api.ts`, which always adds this option (Practice 4).

**Condition two: the backend allows the page's origin (CORS).** The browser only hands a response to a page from another origin if the backend allows it. That permission was set up in Module 20 (Practice 6):

- **`CORS_ORIGIN`** in the backend's `.env`, by default `http://localhost:5173,http://127.0.0.1:5173`.
- **`credentials: true`** in @fastify/cors: the response holds `access-control-allow-origin: http://localhost:5173` (not `*`) and `access-control-allow-credentials: true`.
- **The guard's origin check**: a `POST` from that origin to the `/auth/…` ticket booths gets through instead of getting a 403.

For "risky" requests, the browser first asks through an `OPTIONS` *preflight* (Module 20). In dashboard v0.1, only the login triggers one:

| Dashboard request | A *preflight*? | Why |
| :--- | :--- | :--- |
| `POST /auth/login` (a JSON body) | Yes: `OPTIONS` without cookies, answered `204` | `Content-Type: application/json` isn't a "simple" type |
| `GET /auth/me`, `GET /devices`, `GET /devices/:id/latest` | No | a `GET` without extra headers |
| `POST /auth/refresh`, `POST /auth/logout` | No | no body and no `Content-Type` |

The browser remembers a preflight answer for a short while: if you try again within a few seconds (about 5 seconds), the `OPTIONS` row may not appear. The table's last row hides a trap (Practice 4): `Content-Type: application/json` is only sent **together with a body**, because the backend refuses an empty `POST` labeled as JSON with a 400.

**Condition three: the page and the API are one site (`SameSite=Strict`).** A `Strict` cookie only goes along on requests from a page of the **same site**, and a **site** looks at the scheme and the domain name, **without the port** (Module 20 Concept 9). So `localhost:5173` and `localhost:8080` are **two origins but one site**: CORS is needed, and the cookies still go along. On the other hand, `localhost` and `127.0.0.1` are **two different sites**, even though they point to the same laptop:

| Page opened at | API knocked on | One site? | The result |
| :--- | :--- | :--- | :--- |
| `http://localhost:5173` | `http://localhost:8080` | ✅ yes | The cookies are stored and sent: this module's path. |
| `http://127.0.0.1:5173` | `http://localhost:8080` (an address hard-coded in the code) | ❌ no | The login gets a 200, but its cookies aren't stored; `GET /devices` is answered with 401 and you're back at the form: **a login loop** (🚨). |
| `http://127.0.0.1:5173` | `http://127.0.0.1:8080` | ✅ yes | It works, as long as the page can be opened (see below). |

That's why `src/api.ts` doesn't hard-code the backend's address. **The API address follows the page's host name**:

```ts
const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");
```

A page at `localhost` knocks on `localhost:8080`, a page at `127.0.0.1` knocks on `127.0.0.1:8080` (`location.hostname`), so it's always one site. `VITE_API_BASE` is only set if your backend is at another address (Practice 4), with the same host name as the page. `.replace(…)` drops a trailing slash (the backend doesn't know `//auth/login`).

Even so, get used to one address: **`http://localhost:5173`**, the one Vite prints. On the author's Windows laptop, default Vite only listens on the IPv6 address `[::1]`, so `http://127.0.0.1:5173` doesn't open at all (Module 20's CORS diagram uses it only as an example). The backend's `HOST` is **not changed** (still `127.0.0.1` since Module 16), and the browser still gets there: Chrome and Edge try `::1` first, then `127.0.0.1`, so the first connection is only about 0.3 seconds slower. Bruno and curl keep using `http://127.0.0.1:8080`.

Many tutorials use the **Vite proxy** (`server.proxy`) so that the dashboard and the API look like one origin. We don't use it, because the direct CORS path has been ready since Module 20; the proxy way is in [🔬 Technical Deep Dive](#-technical-deep-dive-optional).

When all three conditions are met, **Log in** triggers `OPTIONS /auth/login` (`204`), then `POST /auth/login` (`200`, your account's profile, and two `Set-Cookie` headers that the browser stores). After that, `GET /devices` and the other requests carry the wristband automatically.

![Sequence diagram of logging in from the browser (Concept 9): wristband = the access cookie (15 minutes), season pass = the session cookie (7 days, only to /auth/…). Two lifelines: left, the dashboard page at http://localhost:5173, opened from Vite (npm run dev); right, backend v1.0 at http://localhost:8080, unchanged since Module 21. Six steps from top to bottom. Step 1, preflight: the browser asks first because the body is JSON; the page sends OPTIONS /auth/login with the headers Origin: http://localhost:5173, Access-Control-Request-Method: POST, and Access-Control-Request-Headers: content-type; the backend answers in green 204, this origin is allowed and cookies may come along. Backend note: @fastify/cors answers before the guard steps in, with access-control-allow-origin: http://localhost:5173 and access-control-allow-credentials: true. Step 2, log in: click Log in on the form, with credentials: include; the page sends POST /auth/login with the email viewer@home.test and the password; the backend checks the password (Module 20), then makes a wristband (JWT) and a season pass (a new row in the sessions table), and answers in green 200 with id, email, name, role plus two Set-Cookie headers: access=…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict and session=…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict. A light purple box: the browser keeps the access wristband and the session season pass; because of HttpOnly, even the page's own JavaScript cannot read them. Step 3, for 15 minutes every request carries the wristband: GET /devices with Cookie: access=…; a GET without special headers needs no preflight; the guard sees a valid wristband and the viewer account may read; the answer is green 200, the device list (JSON). Step 4, the wristband expires: 15 minutes later the browser drops access; GET /devices is sent without a cookie, the guard finds no wristband, and the answer is red 401, not logged in or session expired. Step 5, refresh once, done by api.ts by itself, without the form: POST /auth/refresh with Cookie: session=…; no body, so no preflight, and session comes along because its address starts with /auth; the backend checks the season pass in the sessions table and swaps it for a new one (rotation, Module 20), and answers in green 200 with a new wristband and a new season pass. Step 6, repeat once: the earlier request is sent again, GET /devices with Cookie: access=… (the new wristband), answered in green 200, so the screen stays open; all of this happens inside request(), and components only see the result. A red note: if the refresh gets 401 too (season pass expired), only then the login screen shows. The purple band below: fetch(BASE + path, { credentials: include }) in src/api.ts; without credentials, the browser does not attach cookies to another origin and ignores the Set-Cookie in its response; tokens are never stored in localStorage. Bottom left, the box A different origin, the same site: an origin is the scheme, the host name, and the port, so localhost:5173 differs from localhost:8080 and needs CORS permission (the backend's CORS_ORIGIN has included it since Module 20); a site does not look at the port, so localhost equals localhost and SameSite=Strict cookies still come along. Bottom right, the red box Trap: 127.0.0.1 and localhost are two sites; a page at http://127.0.0.1:5173 that calls the API on localhost gets its cookies neither stored nor sent, so the login answers 200 and then goes straight back to the login screen. The fix: always open http://localhost:5173; the default API address follows the page's host name (location.hostname).](assets/browser-login-flow.png)

**The wristband expires: refresh once.** Fifteen minutes after logging in, the browser throws the wristband away (`Max-Age=900`), and the next request is answered with 401. The season pass is still valid, so the user doesn't need to type the password again. Module 20 (Practice 4) already promised: "if the answer is 401, knock on `refresh` once, then repeat the request". `src/api.ts` keeps that promise (Practice 6):

1. A normal request, for example `GET /devices`, is answered with **401**.
2. `request()` knocks on `POST /auth/refresh` **one time** through `refreshOnce()`. The browser attaches the season pass, because the path is under `/auth`.
3. If the ticket booth answers **200**, the browser receives a new wristband and a new season pass (rotation, Module 20 Concept 7), then the earlier request is **repeated once**. The user doesn't notice a thing, even the next day.
4. If the ticket booth also answers **401** (the season pass is past its 7 days, revoked, or missing), only then is the 401 passed on to the screen: the login form (in the middle of use, with the box `Your session has expired. Please log in again.`; Concept 10).

`/auth/login`, `/auth/refresh`, and `/auth/logout` never trigger a refresh (the `NO_REFRESH` list): a 401 from the login booth means the password is wrong, and one from the refresh booth means the pass has already expired. The repeat also happens only once, so the dashboard doesn't go around in circles forever.

Two 401s that arrive at the same time (for example because of `StrictMode`, Concept 8) **wait for the same single refresh** in `refreshOnce()`, because every knock at the booth replaces the pass. Sometimes the second 401 only arrives after the first refresh has finished, so when the page is opened in development mode, the refresh usually shows up once, sometimes twice; in the build, once.

**`HttpOnly` cookies: the dashboard never holds a token.** JavaScript can't read `HttpOnly` cookies. Type `document.cookie` in the **Console** tab while you're logged in: `access` and `session` don't appear (usually it's an empty text). Not a single line of our React code touches a token. As a result, the dashboard has to ask through `GET /auth/me` to know whether it's logged in, the first step of `App.tsx` in Practice 5.

Many React tutorials store the token in `localStorage`. Don't follow that part: a foreign script that manages to run on the page (XSS) just has to read `localStorage` and send the token anywhere it likes (Module 20 Concept 5). The ways in are real: text from the API (device names and locations) and dozens of npm packages in `node_modules` (`audited 45 packages` in Practice 2), any one of which could be tampered with. The first defense is JSX escaping text (Concept 5). The second is the `HttpOnly` cookies: a foreign script is still dangerous while the page is open, but it can't run off with the wristband.

This week's login form is deliberately minimal. Protected routes, separate views for `admin` and `viewer`, and a more complete logout come in Module 24.

> ⬆️ **Done reading Concepts 7 and 9?** Continue to [Practice 4 — *State* and the login form](#practice-4--state-and-the-login-form-60-minutes). Concepts 8 and 10 are read before Practice 5.

### 10. Loading, error, and empty: three states you always prepare for

Picture **the information board at a train station**: it says "loading" while the timetable is being fetched, "disruption" when its system has a problem, and "no departures" when the trains have finished for the day, and shows the timetable only when everything is fine. A dashboard screen is the same: `fetch` takes time, the backend can be down, and a list can really be empty. Without preparation, the screen goes white, gets stuck on the loading text, or is empty as if it were broken. That's why every component that fetches data prepares **three states** next to its result:

| State | When it happens | What shows | Example in the dashboard |
| :--- | :--- | :--- | :--- |
| **Loading** | The answer hasn't come yet | A calm (gray) loading text | Right after **Log in** or picking a device |
| **Error** | `fetch` failed completely, or the answer has an error code | A box with a message saying what went wrong | The backend is down; the database is down (503) |
| **Empty** | Success, but with no content | A sentence that explains why it's empty | `GET /devices` answers `[]` |
| **Success** | Success, with content | The data | The device list, the sensor cards |

A component like `DeviceList` only needs two small whiteboards (*state*, Concept 7): **the data** (still `null` while loading) and **the error message**. The order to check them in: **error first, then loading, then empty, and only then the content**. If the error is checked last, a screen that failed gets stuck on the loading text.

`api.ts` takes the error message from the `message` field: our backend and Fastify's built-in errors (400, 429, 500) both put the text in `message`, so one check is enough. It then throws an `ApiError` holding that message and its HTTP `code`. If `fetch` fails completely, `api.ts` writes a friendly message that names the backend's address. With `code`, the screen can tell apart two answers that **aren't ordinary errors**:

- **A 401 means the session has really expired**, because `api.ts` has already tried to refresh and failed (Concept 9). The screen goes back to the login form with the box `Your session has expired. Please log in again.`, not to an error box on the data screen. When the page has just been opened, a 401 from `GET /auth/me` means you aren't logged in yet: a plain form; other errors become an `initialError` above it (Practice 5).
- **A 404 from `GET /devices/:id/latest` means there's no reading yet, not that something is broken.** The latest reading is kept in the backend's **memory**, so after the backend restarts, every device is answered with 404 `no telemetry from <id> yet` until its next message; a newly registered device is the same. `DeviceDetails` shows a neutral note, not a red box (Practice 6).

One more small state lives inside the cards: a sensor reading that failed is written as `null`, not 0 (rule 7 of the data contract). `SensorCard` shows it as a gray **"—"** without a unit, so a sensor that failed to read doesn't look the same as a temperature of 0 °C.

![Diagram of the three screen states (Concept 10), like a station information board that always tells you something, with the component DeviceList and GET /devices as the example. The top band: 1 the screen shows first, 2 useEffect calls GET /devices, 3 the response arrives, then setDevices(…) or setError(…), 4 React re-renders. Below it, four phone screens headed Mini Smart Home and Device List. First, the gray pill loading: the screen says Loading devices…; its condition is devices === null; the response has not arrived yet, so say so and do not leave the screen blank. Second, the red pill error: a red box saying Can't reach the server at http://localhost:8080. Maybe the backend isn't running yet, or this page was opened from an address the backend doesn't allow (open http://localhost:5173, see CORS_ORIGIN).; its condition is error !== null; backend down, wrong address, or refused, so show a message the user can act on. Third, the gray pill empty: the screen says No registered devices yet (registering devices: Module 21).; its condition is devices.length === 0; it worked, but the list is empty because no devices are registered yet (Module 21). Fourth, the green pill success, with the note names from Module 21: three device cards in device_id order, each with the name, then the location and the device_id, then badges. Node 2 garden (garden, 246f28b1c7d4) with the badges online and via linking device, Node 1 living room (living room, a4cf12e5b7c0) with the badges online and key active, and Practice living room (living room, f00d00000001) with the badges online and key active; its condition is devices.map(…); one card per device, and a clicked card opens Device Details. A note in the middle: the order of the checks in the code is if (error !== null), then if (devices === null), then if (devices.length === 0), then the list. Bottom, three special cases. Left, the red pill 401, session expired: the wristband expired, and even the one refresh failed (Concept 9), so onSessionExpired() makes App show the login screen again, with the message Your session has expired. Please log in again.; not an error box on the list screen. Middle, the gray pill 404 on /devices/:id/latest: a neutral white box saying No reading from this device since the backend started. Wait for its next message, then open it again.; the backend has just started and the device has not sent a reading yet, so this is a neutral note, not an error. Right, the gray pill null turning into a dash: a Humidity card showing —, because the sensor failed to read (rule 7 of the data contract); the card shows —, not 0, because zero is a real reading, for example soil that is truly bone dry.](assets/three-screen-states.png)

> ⬆️ **Done reading Concepts 8 and 10?** Continue to [Practice 5 — `useEffect`: who am I, and the device list](#practice-5--useeffect-who-am-i-and-the-device-list-60-minutes), then [Practice 6 — Device details: the latest readings of all the sensors](#practice-6--device-details-the-latest-readings-of-all-the-sensors-60-minutes). Concept 11 is read before Practice 7.

### 11. Responsive: one page for phones and laptops

This module's pass requirement ends with **laid out neatly on a phone screen**. In Practice 7 you check the dashboard at **375 px** (a phone), **768 px** (a tablet), and **1280 px** (a laptop): not three pages, but **one page whose layout adapts to the screen width**. That's **responsive**, like a newspaper spread out on a table and folded in your hand.

**Start from the phone screen (*mobile first*).** In Tailwind, a class **without a prefix** applies at **every** screen width, phones included. A class with a prefix, for example `sm:`, only applies **from** a certain width **upward**. Those width points are called ***breakpoints*** (`rem` follows the browser's base font size; by default 1rem = 16 px):

| Prefix | Applies from a width of | Its CSS rule |
| :--- | :--- | :--- |
| `sm:` | 40rem (640 px) | `@media (width >= 40rem)` |
| `md:` | 48rem (768 px) | `@media (width >= 48rem)` |
| `lg:` | 64rem (1024 px) | `@media (width >= 64rem)` |

The trap: **`sm:` doesn't mean "on small screens"**, but "from `sm` upward". So the styles for phones are written **without a prefix**, and wider screens get a prefix:

- `text-center sm:text-left`: centered on a phone, left-aligned from 640 px.
- `grid grid-cols-1 sm:grid-cols-2`: one column on a phone, two columns side by side from 640 px.

**The viewport meta tag: one line that must be there.** The Vite template already writes it in the `<head>` of `index.html` (the Module 10 switch page has a similar line too, Concept 2):

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Without that line, a phone browser may draw the page in a virtual window wider than its screen, then shrink it: the text becomes tiny, and `sm:` and `md:` switch on as well. The line asks for the page width to equal the screen width (`width=device-width`), without zooming in or out (`initial-scale=1.0`). When you tidy up `index.html` in Practice 2, **don't delete this line**.

**Trying a phone width without a phone: DevTools device mode.** In Chrome or Edge, open DevTools (**F12**), then press **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**). The page appears in a frame whose width you can type, for example `375` (Practice 7). This is only a **first estimate**, because the code still runs on the laptop, but it's enough for the layout. A real phone over Wi-Fi needs the backend and Vite opened up to the network, which this week's safety rules forbid. How to do it is in [🔬 Technical Deep Dive](#-technical-deep-dive-optional) as an option; it becomes official in Module 23.

**Signs that the dashboard is neat on a phone** (checked in Practice 7):

- **No horizontal scrolling.** The page can only be scrolled down.
- **Whole cards**, not cut off at the edge of the screen.
- **Long text doesn't spill over.** A long device name or `device_id` is cut off with an ellipsis (`truncate`, helped by `min-w-0` inside a grid or a *flex* row), and the header (the title, the account name, the **Log out** button) doesn't overflow.
- **Buttons big enough for fingers.**

Two notes for phones. Tailwind v4's `hover:` styles are only active on devices that have a pointer, so don't hide important information behind them. Tailwind v4 also needs Chrome 111+, Safari 16.4+, or Firefox 128+, so on a very old phone the dashboard may appear without styles (🚨).

> ⬆️ **Done reading Concept 11?** Continue to [Practice 7 — Neat on a phone screen](#practice-7--neat-on-a-phone-screen-40-minutes), then [Practice 8 — The pass tests: build, lint, and a dress rehearsal](#practice-8--the-pass-tests-build-lint-and-a-dress-rehearsal-35-minutes).

## 🔧 Step-by-step practice

Eight practices build dashboard v0.1 little by little. **Practice 1** is done by hand in the `learn-iot` practice repository, without installing any packages; its files are in [`code/practice-1/`](code/practice-1/). From **Practice 2** on, all the work lives in the `frontend` folder of the `mini-smart-home` repository, on the `feature/dashboard` branch. Every practice ends with a commit to that branch, which is only merged into `main` through the "dashboard v0.1" pull request in [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home).

The state of the `frontend` folder at the end of Practices 2 to 7 is in [`code/stages/`](code/stages/) (for example `code/stages/practice-4/frontend/`), and the final v0.1.0 state is in [`code/frontend/`](code/frontend/). The stage folders have no `node_modules` or `package-lock.json`, so use them to compare file by file, not to replace your whole folder. The steps marked ⭐ (4.4, 6.4, 7.4, and 8.4) are the proof of the pass requirement.

### Practice 1 — HTML, CSS, and JavaScript by hand: taking apart the Module 10 page (60 minutes)

> 🖥️ **Tools used:** **VS Code** with the `learn-iot` repository folder (in 1.6, plus a second window with the `mini-smart-home` folder to run the Module 4 `webhook-receiver.js`), **File Explorer** (macOS: **Finder**) to open files with a double-click, and the **Google Chrome** or **Microsoft Edge** browser with its DevTools: the **Elements** and **Console** tabs, and device mode. The backend, Docker, and Vite aren't used yet. Concepts used: 1–2.

This practice keeps Module 10's promise: Node 1's switch page is taken apart layer by layer, given **skin** (CSS) and **muscles** (JavaScript) of your own, then tried at a phone width, and along the way you see **the browser itself** hold back a request because of CORS. Node 1 doesn't need to be on, and its lamp buttons only change the text on the screen; real control from the dashboard only comes in Module 24.

#### 1.1 Prepare the `pages` folder (3 minutes)

Open the **`learn-iot`** folder in VS Code (**File → Open Folder…**); the `module-22` folder already holds the results of the 🔁 warm-up and the 🏆 Quick Win. Right-click the **`module-22`** folder in the Explorer panel → **New Folder…**, then name it **`pages`**:

```text
learn-iot/
└── module-22/
    ├── package.json                     🔁 Warm-up
    ├── warmup.js                        🔁 Warm-up
    ├── card.html                        🏆 Quick Win
    └── pages/                           NEW
        ├── page-m10-original.html       step 1.2
        ├── page-m10-skin-muscles.html   steps 1.4–1.5
        └── webhook-form.html            step 1.6
```

#### 1.2 Copy the Node 1 page from Module 10: `page-m10-original.html` (5 minutes)

Right-click the **`pages`** folder → **New File…**, name it **`page-m10-original.html`**, then type or paste this text exactly as it is:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Home</title>
</head>
<body style="font-family: sans-serif; font-size: 20px; padding: 16px">
<h2>Node 1 Home</h2>
<p>Lamp: <b>OFF</b></p>
<p><a href="/on">Turn the lamp on</a></p>
<p><a href="/off">Turn the lamp off</a></p>
<p>Temperature 28.4&nbsp;&deg;C, humidity 71&nbsp;%<br>
Light 2310, soil 37&nbsp;%<br>
Water tank 64&nbsp;%</p>
<p><small>Firmware 1.1.0, 17-10-2026 08:32 WIB</small></p>
</body>
</html>
```

Save (**Ctrl + S**). Its content is the same as the `PAGE` text from `networking.cpp` in [Concept 2](#2-the-browser-and-devtools-taking-apart-the-module-10-switch), except that the eight `%…%` placeholders are already filled in like the illustration in [Module 10 ➕ F](../../phase-2-connectivity/module-10-wifi-and-http/README.md#f--turn-the-lamp-off-from-your-phone) (`%LAMP%` becomes `OFF`, `%TEMPERATURE%` becomes `28.4`, and so on), exactly what `html.replace()` does in the ESP32. This is the letter the phone's browser used to receive from Node 1. The page is copied because the `/on` `/off` web server was retired in Module 11. Don't tidy anything up: `<html>` without `lang`, the `<h2>` heading, and the `/on` `/off` links are material for the dissection.

#### 1.3 Reading its skeleton in the Elements tab (10 minutes)

**Open the page.** Right-click `page-m10-original.html` in the Explorer panel → **Reveal in File Explorer** (macOS: **Reveal in Finder**), then double-click the file. If another browser opens, drag the file into a Chrome or Edge window.

**Result:** the tab says `Node 1 Home` and holds a plain view like the Module 10 illustration: a bold heading, `Lamp: OFF`, two blue underlined links, three reading lines, and the small line `Firmware 1.1.0, 17-10-2026 08:32 WIB`. The address starts with `file:///`: this page is read from a file, not from a server.

**View its source.** Press **Ctrl + U** (macOS: **Cmd + Option + U**). A new tab shows the page's **source**: 18 lines, exactly the same as your file. Close that tab.

**Take the skeleton apart.** Press **F12** (macOS: **Cmd + Option + I**), then choose the **Elements** tab. Open the small triangle in front of `<body …>` if needed, then move the pointer over the `<h2>`, `<p>`, and `<a>` lines: the matching part of the page is highlighted too. That's the DOM tree from Concept 2.

**Look for its skin and muscles.** Click the `<body style="…">` line. In the **Styles** section, the `element.style` box holds `font-family: sans-serif;`, `font-size: 20px;`, and `padding: 16px;`: that's **all the skin** this page has. The rules below it are labeled `user agent stylesheet` (the browser's default style), and so are the blue color and underline of `<a href="/on">` if you click its line. There's no `<script>` anywhere in the tree: the muscles live in the ESP32. The result of the dissection: almost all skeleton, one attribute of skin, no muscles.

**Tap a link.** Click **Turn the lamp on** on the page.

**Result:** the browser moves to `file:///C:/on` (macOS: `file:///on`) and shows an error page with the code `ERR_FILE_NOT_FOUND`. In Chrome its heading is `Your file couldn’t be accessed`, and in Edge it's `File not found`.

A link asks for a **new page** from the address `/on` on the "server" the page came from. On the phone, the server is Node 1, which turns the relay on and then sends a new page; on the laptop, the "server" is the disk, and of course there's no file `on` at the root of the drive. Press **Alt + ←** (macOS: **Cmd + [**) to go back.

#### 1.4 Skin: `<style>` and classes (12 minutes)

Create a new file **`page-m10-skin-muscles.html`** in the **`pages`** folder, then fill it with the code below: the same page after it gets skin (this step) **and** muscles (1.5). The file has 220 lines, full of explanatory comments; type it yourself, or open [`code/practice-1/page-m10-skin-muscles.html`](code/practice-1/page-m10-skin-muscles.html) on GitHub, click **Copy raw file**, then paste.

```html
<!DOCTYPE html>
<!--
  page-m10-skin-muscles.html - Module 22 Practice 1: the Node 1 Home page from Module 10, after it was given
  SKIN (CSS, step 1.4) and MUSCLES (JavaScript, step 1.5).
  The original is in page-m10-original.html: the PAGE text in Node 1 v1.1's networking.cpp as the phone's browser gets it,
  that is, after the ESP32 replaced the %LAMP%, %TEMPERATURE% placeholders and friends with example numbers.
  This version stands on its own: just double-click the file. No ESP32, no internet.
  The parts that differ from the original are marked DIFF-1 to DIFF-7, each with its reason.
  The buttons only change what this screen shows. No relay moves (control from the dashboard: Module 24).
-->
<!-- DIFF-1: the original has just <html>. lang="en" tells the browser and screen readers that the content is in English. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Home</title>

<!-- ===================== SKIN (CSS), step 1.4 ===================== -->
<!-- DIFF-2: the original has only one style="..." attribute on <body>. Here every display rule is gathered
     inside <style>, then applied through class names. The skeleton becomes clean, and one rule
     (for example .card) applies to many elements at once. -->
<style>
  * {
    box-sizing: border-box; /* a box's width already includes padding and border (box model) */
  }
  body {
    font-family: sans-serif; /* these three lines are exactly the original style="..." */
    font-size: 20px;
    padding: 16px;
    margin: 0;               /* from here on: additions to the plain version */
    color: #1e293b;
    background: #f1f5f9;
  }
  .page {
    max-width: 480px;        /* on a laptop it doesn't spread out all over */
    margin: 0 auto;          /* auto left and right = centered */
  }
  h1 {
    font-size: 28px;
    margin: 0 0 12px;
  }
  .state b {
    padding: 2px 10px;
    border-radius: 999px;    /* very round corners = a capsule shape */
    background: #e2e8f0;
  }
  .state b.on {              /* the "on" class is added by JavaScript when the lamp is on */
    background: #fde68a;
    color: #78350f;
  }
  .button-row {
    display: flex;           /* flexbox: its children line up side by side */
    gap: 8px;
    margin-bottom: 16px;
  }
  .button {
    flex: 1;                 /* the two buttons share the width equally */
    min-height: 44px;        /* big enough for a thumb */
    font: inherit;
    font-size: 16px;
    color: inherit;          /* a button doesn't inherit the page's text color by itself */
    border: 1px solid #94a3b8;
    border-radius: 8px;
    background: white;
    cursor: pointer;
  }
  .button:hover {
    background: #e2e8f0;
  }
  .button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .card-list {
    display: flex;
    flex-wrap: wrap;         /* if they don't fit, cards move down to the next row */
    gap: 8px;
  }
  .card {
    flex: 1 1 130px;         /* a base width of 130px, may grow to fill the rest of the row */
    padding: 12px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
  }
  .card-label {
    display: block;
    font-size: 14px;
    color: #64748b;
  }
  .card-value {
    font-size: 26px;
    font-weight: 600;
  }
  .card-unit {
    margin-left: 4px;
    font-size: 16px;
    color: #94a3b8;
  }
  .note {
    color: #64748b;
  }
</style>
</head>
<body>

<!-- ===================== SKELETON (HTML), from the original page ===================== -->
<main class="page">
  <!-- DIFF-3: the original uses <h2>. A page's main heading should be <h1>. -->
  <h1>Node 1 Home</h1>

  <!-- DIFF-4: in the original networking.cpp this is %LAMP%, a placeholder the ESP32 replaces before sending the page.
       A local file has no ESP32, so the starting text is written in directly,
       then JavaScript replaces it through id="lamp-text". -->
  <p class="state">Lamp: <b id="lamp-text">OFF</b></p>

  <!-- DIFF-5: the original has two links, <a href="/on"> and <a href="/off">. A link asks the server for a NEW PAGE.
       From a local file, the browser looks for a file named "on" at the root of the drive instead, and fails.
       For an ACTION (changing something), a <button> fits better: it doesn't move to another page,
       so reloading the page doesn't send the command once more (see the 🔬 in Module 10). -->
  <div class="button-row">
    <button type="button" class="button" id="button-on">Turn the lamp on</button>
    <button type="button" class="button" id="button-off">Turn the lamp off</button>
  </div>

  <!-- DIFF-6: the original has one paragraph with <br>. Here every reading becomes a "card" with the same pattern:
       label, number, unit. This repeating pattern is the seed of the SensorCard component in React. -->
  <div class="card-list">
    <div class="card">
      <span class="card-label">Temperature</span>
      <span class="card-value" id="value-temperature">--</span><span class="card-unit">&deg;C</span>
    </div>
    <div class="card">
      <span class="card-label">Humidity</span>
      <span class="card-value" id="value-humidity">--</span><span class="card-unit">%</span>
    </div>
    <div class="card">
      <span class="card-label">Light</span>
      <span class="card-value" id="value-light">--</span><span class="card-unit">/4095</span>
    </div>
    <div class="card">
      <span class="card-label">Soil</span>
      <span class="card-value" id="value-soil">--</span><span class="card-unit">%</span>
    </div>
    <div class="card">
      <span class="card-label">Water tank</span>
      <span class="card-value" id="value-water">--</span><span class="card-unit">%</span>
    </div>
  </div>

  <p class="note"><small>Firmware <span id="fw-text">--</span>, <span id="time-text">clock not set yet</span></small></p>
</main>

<!-- ===================== MUSCLES (JavaScript), step 1.5 ===================== -->
<!-- DIFF-7: the original has NO JavaScript at all. Its "muscles" are in the ESP32: html.replace() fills in the placeholders,
     and server.on() handles /on and /off. Here the muscles move to the browser: the data is kept in one object,
     then the show() function writes it to the screen every time the data changes. -->
<script>
  // Example data, the same as the numbers in Module 10's phone-node1.png illustration.
  // In the original version, the sensors read these numbers and the ESP32 inserts them into the page before sending it.
  const state = {
    lamp: false,
    temperature: 28.4,
    humidity: 71,
    light: 2310,
    soil: 37,
    water_level: 64,
    fw: "1.1.0",
    time: "17-10-2026 08:32 WIB",
  };

  // Just like numberOrDash() in networking.cpp: a failed reading (null) is written as "--".
  function numberOrDash(value) {
    if (value === null) {
      return "--";
    }
    return String(value);
  }

  // Write the WHOLE state to the screen. Called once at the start, then every time the state changes.
  function show() {
    const lampText = document.querySelector("#lamp-text");
    lampText.textContent = state.lamp ? "ON" : "OFF";
    lampText.classList.toggle("on", state.lamp); // add the class when the lamp is on, remove it when it's off

    document.querySelector("#button-on").disabled = state.lamp;   // the button that's no use right now is dimmed
    document.querySelector("#button-off").disabled = !state.lamp;

    let temperatureText = "--";
    if (state.temperature !== null) {
      temperatureText = state.temperature.toFixed(1); // one digit after the decimal point, like String(b.temperature, 1) on the ESP32
    }
    document.querySelector("#value-temperature").textContent = temperatureText;
    document.querySelector("#value-humidity").textContent = numberOrDash(state.humidity);
    document.querySelector("#value-light").textContent = String(state.light);
    document.querySelector("#value-soil").textContent = String(state.soil);
    document.querySelector("#value-water").textContent = numberOrDash(state.water_level);
    document.querySelector("#fw-text").textContent = state.fw;
    document.querySelector("#time-text").textContent = state.time;
  }

  // The original version: the browser moves to /on, the ESP32 turns the relay on, then sends a whole new page.
  // This version: just change the data, then show it again. The page isn't reloaded.
  function setLamp(isOn) {
    state.lamp = isOn;
    if (isOn) {
      console.log("The original version would request GET /on from the ESP32");
    } else {
      console.log("The original version would request GET /off from the ESP32");
    }
    show();
  }

  document.querySelector("#button-on").addEventListener("click", () => setLamp(true));
  document.querySelector("#button-off").addEventListener("click", () => setLamp(false));

  show(); // the first display
</script>
</body>
</html>
```

Save, then open it in the browser as in 1.3.

**Result:** the same page now has skin. Its background is light gray, its content is one column 480 px wide in the middle, and `OFF` sits inside a gray capsule. Below it, two white rounded buttons of equal width side by side (**Turn the lamp off** looks dimmed), then five white cards holding a label, a number, and a unit, from `Temperature` `28.4` `°C` to `Water tank` `64` `%`, and the small firmware line.

The comments `DIFF-1` to `DIFF-7` mark every difference from the original, each with its reason. Four of them take care of the skeleton and the skin: `DIFF-1` (lines 11–12) adds `lang="en"`, `DIFF-2` (19–103) moves the skin from the `style` attribute to a `<style>` block applied through `class` names, `DIFF-3` (109–110) replaces `<h2>` with `<h1>`, and `DIFF-6` (126–149) splits the paragraph with its `<br>`s into five `.card` boxes holding a label, a number, and a unit, the forerunner of `SensorCard` in Practice 3.

The most important rules inside `<style>`:

- **Lines 34–37:** `.page` is at most 480 px wide, and `margin: 0 auto` puts it in the middle of the screen.
- **Lines 51–85:** `display: flex` (***flexbox***) makes a container's children line up side by side. `flex: 1` splits the width of the two buttons evenly, and `min-height: 44px` is big enough for a thumb (in Practice 7 this becomes the Tailwind class `min-h-11`). `flex: 1 1 130px` makes a card start at 130 px and then widen to fill the row, and `flex-wrap: wrap` moves cards that don't fit down to the next row (you see it in 1.7).
- **Lines 42–50:** `.state b` (a descendant *selector*) means "a `<b>` that sits **inside** an element with `class="state"`". `.state b.on` colors it yellow, but only if that `<b>` also has the class `on`, which the muscles only add in 1.5. In lines 67–73, `:hover` and `:disabled` are button **states**: when the pointer is over it, and when the button is disabled.

**`class`** is used by the skin for many elements at once (`class="card"` appears five times), while **`id`** marks just one element (`id="value-temperature"`) that the muscles look for in 1.5. [Concept 3](#3-tailwind-css-v4-skin-made-of-small-classes) shortens rules like these into short classes, for example `gap: 8px` becomes `gap-2`.

Now take the skin apart in DevTools:

1. Right-click the **text** `Temperature` on the first card → **Inspect**. In the **Elements** tab, click the `<div class="card">` line right above the highlighted line. In the **Styles** section, move the pointer over the `border` line of the `.card` rule, then uncheck the small box in front of it: the border of **all five** cards disappears at once, because one rule applies to all of them. Check it again.
2. Click the `<div class="card-list">` line, then uncheck `display: flex`. Without *flexbox*, the cards stack downward, each as wide as the column.
3. Press **F5** (macOS: **Cmd + R**). Everything comes back, because DevTools only changes the browser's copy of the page; changes you want to keep are written in the file through VS Code.

#### 1.5 Muscles: buttons that change the text without reloading (12 minutes)

Scroll to the `<script>` block (lines 158–218). The three remaining marks take care of the muscles: `DIFF-4` (112–115) replaces the `%LAMP%` placeholder with a starting text that JavaScript later replaces through an `id`; `DIFF-5` (117–124) replaces the links with `<button type="button" …>`, because a link means **moving to another page** and a button means **an action**, so reloading no longer gives any command (Module 10 🔬); and `DIFF-7` (155–218) moves the muscles from the ESP32 to the browser:

- **`const state = { … }`** (lines 161–170) keeps **all** the screen's data in one object. A reading that's `null` is written as `--` by `numberOrDash()`, a copy of the function with the same name in `networking.cpp`.
- **`show()`** (181–200) writes the contents of `state` to the screen. `document.querySelector("#lamp-text")` finds the element whose `id` is `lamp-text` (`#` means `id`, as in CSS), `.textContent = …` replaces its text, `classList.toggle("on", state.lamp)` adds or removes the class `on`, and `.disabled` dims a button.
- **`setLamp(isOn)`** (204–212) changes the data, logs it through `console.log`, then calls `show()`. Lines 214–215 register it: `addEventListener("click", () => setLamp(true))` means "when this button is clicked, run `setLamp(true)`", similar to `server.on("/on", handleOn)` in the ESP32.
- **`show();`** (217) draws the screen for the first time, so the cards show numbers right away even though the skeleton writes `--`. The `<script>` block is placed at the end of `<body>` so that the elements above it already exist.

Now try the muscles:

1. Open the **Console** tab in DevTools (**F12** if it isn't open yet). Click **Turn the lamp on**, then **Turn the lamp off**.

   **Result:** `OFF` changes to `ON` inside a yellow capsule, **Turn the lamp on** dims, and **Turn the lamp off** becomes active; the second click puts everything back, without reloading and without changing the address. The Console records two lines, each linked at the far right to its `console.log` line (`page-m10-skin-muscles.html:207` and `:209`):

   ```text
   The original version would request GET /on from the ESP32
   The original version would request GET /off from the ESP32
   ```

2. In the **Elements** tab, click the two buttons in turn. On the `<b id="lamp-text">` line, **Turn the lamp on** makes `class="on"` appear, and **Turn the lamp off** removes the word `on`, leaving an empty `class`. The dimmed button gets the `disabled` attribute. That's how JavaScript changes the DOM, and the skin from 1.4 follows it right away.

3. Go back to the **Console** tab and type the following lines one by one, each ending with **Enter**. Type them yourself, don't paste: while you've only used the Console a little, Chrome and Edge refuse pastes with a warning (a protection against scammers), until you type `allow pasting` or have typed five commands yourself.

   ```text
   state.temperature = 31.2
   show()
   state.humidity = null
   state.fw = "<b>bold?</b>"
   show()
   ```

   After the first line, the Console answers `31.2`, but the Temperature card **still** shows `28.4`: nothing redrew it, so the screen is **stale**. After `show()`, the card becomes `31.2` (the reply `undefined` means the function doesn't return a value). After the second `show()`, Humidity writes `--`, and the firmware line writes `<b>bold?</b>` as it is, not in bold, because `textContent` always puts in **text**, not HTML; this property is what protects the dashboard from XSS ([Concept 5](#5-react-and-jsx-a-page-made-of-lego-bricks)). **F5** puts everything back, because `state` only lives in the page's memory.

The pattern **change the data first, then redraw the screen** is React's basic idea. Here you have to remember to call `show()` yourself; in React, changing *state* redraws the screen automatically ([Concept 7](#7-state-and-usestate-a-screen-that-remembers)). Unlike Module 10, which asks for a whole new page on every tap, this page is loaded once, then only the parts that change are replaced, like the dashboard later.

> [!NOTE]
> **If the buttons do nothing**, look at the **Console** tab. `Cannot read properties of null (reading 'addEventListener')` means `querySelector` didn't find the element (usually the `id` in the skeleton and the one in `"#button-on"` aren't exactly the same), and an error ending in `is not defined` means a misspelled name. The line number at the far right of the error points to the spot.

At a phone width of 375 px, the original page and your page, before and after **Turn the lamp on** is tapped, look like this (captured through a small server on `localhost`, not with a double-click, but the content is the same):

![Composite of three real screenshots in Microsoft Edge phone mode, 375 px; the Practice 1 files are opened through http://localhost, not file://; title: The Module 10 switch page taken apart: a plain skeleton, then skin and muscles. Left, Original: the Module 10 Node 1 page, a white background with the browser's default style: the bold heading Node 1 Home, Lamp: OFF, two blue underlined links Turn the lamp on and Turn the lamp off (marked 1), three lines Temperature 28.4 °C, humidity 71 %, Light 2310, soil 37 %, Water tank 64 % (marked 2), and Firmware 1.1.0, 17-10-2026 08:32 WIB. Middle, With skin + muscles (start), a light gray background: the heading Node 1 Home, Lamp: with a gray OFF capsule (marked 3), two framed buttons of the same width, Turn the lamp on active and Turn the lamp off dimmed (marked 4), five white cards with the pattern label, number, unit: Temperature 28.4 °C, Humidity 71 %, Light 2310 /4095, Soil 37 %, Water tank 64 % (marked 5), and the same Firmware line. Right, After tapping Turn the lamp on, both marked 6: the capsule turns yellow and says ON, and the Turn the lamp on button is now dimmed while Turn the lamp off is active, without reloading the page. The key: 1 the browser's default blue links, the a tag with href /on, a tap equals a new GET request to the ESP32; 2 numbers filled in by the ESP32 before sending, through the %TEMPERATURE% placeholder and its friends; 3 skin, the capsule from the .state b rule, all the styles gathered in the style tag; 4 the button tag replaces the links and there is no page change (DIFF-5); 5 cards with one pattern, label, number, unit, the seed of the SensorCard component; 6 muscles, addEventListener changes the text through textContent and classList, without reloading.](assets/module-10-switch-taken-apart.png)

#### 1.6 A form to the Module 4 receiver, then a `fetch` blocked by CORS (10 minutes)

A web page also sends data, like the dashboard's login form in Practice 4. Before that, try two ways of sending data to `webhook-receiver.js` from [Module 4 Practice 9](../../phase-0-foundations/module-04-javascript-nodejs/README.md#practice-9--a-mini-server-webhook-receiverjs-and-send-datajs-25-minutes), which prints whatever is sent to it.

**Start the receiver.** Open a second VS Code window (**File → New Window**), open the **`mini-smart-home`** folder in that window (**File → Open Folder…**), open its terminal (**Terminal → New Terminal**), then run:

```text
cd tools
node webhook-receiver.js
```

**Expected output:**

```text
Receiver ready at http://localhost:3000 — press Ctrl + C to stop.
```

Leave the receiver running; the files are still written in the `learn-iot` window.

**Write the page.** In the `learn-iot` window, create a new file **`webhook-form.html`** in the **`pages`** folder, then fill it with this code (or copy it from [`code/practice-1/webhook-form.html`](code/practice-1/webhook-form.html) with **Copy raw file**):

```html
<!DOCTYPE html>
<!--
  webhook-form.html - Module 22 Practice 1, step 1.6: two ways a page sends data to a server.
  First get the Module 4 receiver ready. In a terminal, go to the tools folder (mini-smart-home/tools), then run:
      node webhook-receiver.js
  Once "Receiver ready at http://localhost:3000 — press Ctrl + C to stop." appears, open this file with a double-click.
    A. A plain form: the browser MOVES to the server's answer page, and the receiver prints the form's content.
    B. fetch() with JSON: the page stays where it is, but the browser asks first (preflight OPTIONS).
       The Module 4 receiver doesn't send CORS headers, so the browser blocks it. Look at the Console (F12).
  Don't type a real password here: the receiver prints everything it receives exactly as it is.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Send to the Module 4 receiver</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    font-family: sans-serif;
    font-size: 18px;
    margin: 0;
    padding: 16px;
    color: #1e293b;
    background: #f1f5f9;
  }
  .page {
    max-width: 480px;
    margin: 0 auto;
  }
  h1 {
    font-size: 24px;
    margin: 0 0 12px;
  }
  h2 {
    font-size: 18px;
    margin: 0 0 8px;
  }
  .box {
    margin-bottom: 16px;
    padding: 16px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
  }
  label {
    display: block;
    margin-top: 8px;
    font-size: 14px;
    color: #475569;
  }
  input {
    width: 100%;
    min-height: 44px;
    padding: 8px;
    font: inherit;
    border: 1px solid #94a3b8;
    border-radius: 8px;
  }
  button {
    width: 100%;
    min-height: 44px;
    margin-top: 12px;
    font: inherit;
    font-size: 16px;
    border: 1px solid #94a3b8;
    border-radius: 8px;
    background: white;
    cursor: pointer;
  }
  .note {
    margin: 12px 0 0;
    font-size: 14px;
    color: #64748b;
  }
</style>
</head>
<body>
<main class="page">
  <h1>Send to the Module 4 receiver</h1>

  <section class="box">
    <h2>A. A plain form</h2>
    <!-- method="post": the content is sent in the body of the HTTP letter. action: the receiver's address (port 3000; any path).
         The name attribute of every input box becomes the name of the field that is sent: email=...&password=... -->
    <form method="post" action="http://localhost:3000/form">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" value="viewer@home.test" required>
      <label for="password">Password (pretend)</label>
      <input id="password" name="password" type="password" value="not-a-real-password" required>
      <button type="submit">Send the form</button>
    </form>
    <p class="note">After sending, the browser moves to the receiver's answer page. Press <b>Alt + ←</b> (macOS: <b>Cmd + [</b>) to go back.</p>
  </section>

  <section class="box">
    <h2>B. fetch() with JSON</h2>
    <button type="button" id="fetch-button">Send with fetch()</button>
    <p class="note" id="fetch-result">Not sent yet.</p>
  </section>
</main>

<script>
  const result = document.querySelector("#fetch-result");

  document.querySelector("#fetch-button").addEventListener("click", async () => {
    result.textContent = "Sending…";
    // the form boxes above, turned into an object, then into JSON text
    const content = {
      email: document.querySelector("#email").value,
      password: document.querySelector("#password").value,
    };
    try {
      const reply = await fetch("http://localhost:3000/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // this header is what makes the browser ask first (preflight)
        body: JSON.stringify(content),
      });
      result.textContent = "Success, code " + reply.status + "."; // never gets this far with the Module 4 receiver
    } catch (err) {
      // The browser refuses: the receiver's OPTIONS answer has no Access-Control-Allow-Origin header,
      // so the POST is never sent. (If the receiver is down, the error is the same: Failed to fetch.)
      result.textContent = "Failed: " + err.message + ". Open the Console (F12) to read why.";
      console.log("Look for the red message containing 'blocked by CORS policy' above this line.");
    }
  });
</script>
</body>
</html>
```

**Part A** (lines 88–94) is a plain form: `action` is its destination address, `method="post"` sends its content in the body of the HTTP letter, the `name` of each box becomes a field name, and `required` refuses an empty box. The password, already filled in through `value`, is **pretend**. **Part B** (lines 105–129) sends the same content through `fetch()` as JSON, exactly the shape of Module 4's `send-data.js`, which got through to the same receiver back then.

> [!WARNING]
> **Don't type a real password on this page.** The receiver prints everything it's sent in the terminal, exactly as it is, and the content sets off as plain text.

**Send the form (A).** Open `webhook-form.html` with a double-click, then click **Send the form**. If the browser offers to save the password, just decline.

**Result (example):** the browser **moves** to `localhost:3000/form`, which only holds `{"ok":true}`, the receiver's answer. New lines appear in the receiver's terminal (the times follow your laptop's clock):

```text
[8:02:19 PM] POST /form
email=viewer%40home.test&password=not-a-real-password
[8:02:19 PM] GET /favicon.ico
```

The form's content sets off as `name=value` pairs joined by `&` (`%40` is an encoded `@`), and the password can be read in plain text, like the device key you saw through the sniffer in Module 21 Practice 8: as long as the address is `http://`, what's sent isn't encrypted, and HTTPS only comes in Module 27. `GET /favicon.ico` is the request for the tab icon, as in Module 4. Press **Alt + ←** (macOS: **Cmd + [**) to go back to the form.

**Send with `fetch()` (B).** Open the **Console** tab in DevTools (**F12**), then click **Send with fetch()**.

**Result (example):** this time the page does **not** move. The text below the button becomes `Failed: Failed to fetch. Open the Console (F12) to read why.`, and the receiver's terminal prints only one new line:

```text
[8:02:23 PM] OPTIONS /json
```

The Console writes two red lines, then one ordinary line from your page's own code (line 126):

```text
Access to fetch at 'http://localhost:3000/json' from origin 'null' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
POST http://localhost:3000/json net::ERR_FAILED
Look for the red message containing 'blocked by CORS policy' above this line.
```

Why does A get through while B doesn't? A plain form means **moving to another page**, like the `/on` link in Module 10: the browser sends it without asking, and no code reads the answer. `fetch()`, on the other hand, wants to **read** an answer from another origin, yet a file opened with a double-click has no host name and port like a web address, so the browser records its origin as `null`. This is where **CORS** applies (Module 20 Concept 9): the browser only hands over the answer if the server allows that page's origin through the `Access-Control-Allow-Origin` header, and because the content is JSON, the browser first asks through an `OPTIONS` *preflight*. The Module 4 receiver answers it without the permission header, so the `POST` never sets off.

Yet `send-data.js` in Module 4 sent the same JSON `POST`, and it got through. So CORS is a **browser** rule, not a server rule, there so that no page you open can secretly read another server's answers in your name; Node.js and Bruno aren't browsers. Backend v1.0 has sent the permission header since Module 20, but only for the origins in `CORS_ORIGIN` (`http://localhost:5173` and `http://127.0.0.1:5173`). That's why, from Practice 2 on, the dashboard is served by Vite at `http://localhost:5173`, not opened with a double-click ([Concept 9](#9-logging-in-from-the-browser-cookies-cors-and-localhost)).

**Try one more thing.** Stop the receiver (**Ctrl + C**), then click **Send with fetch()** again. The text on the page is **exactly the same**; only the Console differs: its new red line is `POST http://localhost:3000/json net::ERR_CONNECTION_REFUSED`, with no CORS message. To JavaScript, "held back by CORS" and "server down" are both `Failed to fetch`. Remember this in Practice 4: if the dashboard writes that the server can't be reached, the cause may be a stopped backend, or it may be a page address that isn't allowed, and the **Console** tab tells you which one it is.

#### 1.7 Phone width in device mode (5 minutes)

In the `page-m10-skin-muscles.html` tab, open DevTools (**F12**), then press **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**) or click the button with a phone-and-tablet icon in the DevTools top bar (Chrome calls it **Toggle device toolbar**, Edge **Toggle device emulation**). In the device mode bar (the **Responsive** option), type **`375`** in the width box, then press **Enter** ([Concept 11](#11-responsive-one-page-for-phones-and-laptops)).

**Result:** the two buttons stay side by side and share the screen width. The cards are arranged two per row, while `Water tank` is alone on the third row and widens to fill it. Nothing is cut off, and the page can't be scrolled sideways.

The math: 375 px minus 16 px of space on the left and on the right leaves 343 px. Two 130 px cards plus an 8 px gap fit, three cards (406 px) don't, so the third card moves down, then every card widens to fill its row. Without a single phone-only line, the layout adapts by itself.

At a width of **`1280`**, the column stops at 480 px in the middle (`max-width`), with the cards 3 + 2 (if your browser window is narrower, the page is shrunk to fit). Finally, open `page-m10-original.html` in device mode at 375 wide as before: its text is neat thanks to the `viewport` line it has had since Module 10, but its two links are only as tall as one line of text (22 px), much smaller than your 44 px buttons.

Close device mode with **Ctrl + Shift + M** again. In Practice 7, the dashboard is checked the same way at three widths.

#### 1.8 Save it in `learn-iot` (3 minutes)

Stop the receiver (**Ctrl + C**) if it's still running, then save your work from the terminal of the `learn-iot` window (first go up with `cd ..` if you're still in the `module-22` folder):

```text
git add module-22
git status
git commit -m "Take apart the Module 10 page with HTML, CSS, and JavaScript (Module 22 Practice 1)"
git push
```

`git add module-22` also includes the warm-up files and `card.html`, which haven't been committed yet, and `git status` shows at least three new files in `module-22/pages/`. GitHub Desktop users: commit and push in the **`learn-iot`** repository as usual.

<details>
<summary>Extra first-day exercises (optional, about 4 hours)</summary>

The Syllabus gives **one day** to the basics of HTML, CSS, and JavaScript. If HTML is really new to you, five files in [`code/practice-1/exercises/`](code/practice-1/exercises/) fill the rest of that day: copy them into a new folder, `module-22/pages/exercises` (**Copy raw file**), open them in VS Code **and** in the browser, read the comments, then do their `TRY` tasks:

1. [`exercise-1-skeleton.html`](code/practice-1/exercises/exercise-1-skeleton.html) (45 minutes): the document structure and the basic tags.
2. [`exercise-2-skin.html`](code/practice-1/exercises/exercise-2-skin.html) (60 minutes): *selectors*, the *box model*, *flexbox*, and `@media`.
3. [`exercise-3-muscles.html`](code/practice-1/exercises/exercise-3-muscles.html) (60 minutes): events and creating new elements.
4. [`exercise-4-fetch.html`](code/practice-1/exercises/exercise-4-fetch.html) (45 minutes): `fetch` with three states (needs the internet; part 2 needs backend v1.0 running).
5. [`bridge-handmade-components.html`](code/practice-1/exercises/bridge-handmade-components.html) (30 minutes): React's pattern with plain JavaScript; read the list of what still "hurts" at its end before [Concept 5](#5-react-and-jsx-a-page-made-of-lego-bricks).

</details>

> ⬆️ **Done with Practice 1?** Read [Concept 3](#3-tailwind-css-v4-skin-made-of-small-classes) and [Concept 4](#4-vite-and-the-frontend-folder-the-development-kitchen-at-localhost5173), then continue to [Practice 2 — Your first Vite project: React, TypeScript, and Tailwind v4](#practice-2--your-first-vite-project-react-typescript-and-tailwind-v4-45-minutes).

### Practice 2 — Your first Vite project: React, TypeScript, and Tailwind v4 (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the **`mini-smart-home`** repository folder and one terminal (first in the `mini-smart-home` folder, then in the `frontend` folder), the **Google Chrome** or **Microsoft Edge** browser with its DevTools, and the **React DevTools** extension, installed in 2.6. The backend, Docker Desktop, the simulator, and Bruno are only used from Practice 4 on.

From this practice on, you work in the **`mini-smart-home`** repository, in a new **`frontend`** folder: the dashboard's home until Module 25. The project creator **create-vite** prepares a React + TypeScript template, then you install Tailwind v4 (Concept 3), tidy up the template, and lock the *dev server* to port 5173 (Concept 4). The code at the end of this practice: [`code/stages/practice-2/frontend/`](code/stages/practice-2/frontend/) (without `node_modules`, `package-lock.json`, and the template's `README.md`).

#### 2.1 Prepare the `feature/dashboard` branch (2 minutes)

In VS Code, choose **File → Open Folder…**, open the **`mini-smart-home`** folder (not `learn-iot`), then open a new terminal (**Terminal → New Terminal**), which always starts in that folder. Check your Node.js version:

```text
node --version
```

The number must start with `v24` (a Mac stuck on Node.js 22: at least `v22.18`, see 🧰); Vite 8 needs Node.js 20.19+ or 22.12+. Then, from the latest `main`, create a branch for all of Module 22's work:

```text
git switch main
git pull
git switch -c feature/dashboard
```

`git pull` makes sure backend v1.0 from the Module 21 "device security" pull request is on your laptop. This branch is only merged into `main` in ➕ C, through the "dashboard v0.1" pull request.

#### 2.2 Create the `frontend` folder with create-vite (5 minutes)

Still in the `mini-smart-home` folder (not inside `backend`), type:

```text
npm create vite@9.3.1 frontend -- --template react-ts
```

- **`npm create vite@9.3.1`** runs **create-vite** 9.3.1, Vite's official project creator (npm downloads it for this one use; it isn't installed).
- **`frontend`**: the name of the new folder, and the package name too.
- **`--`**: everything after it is passed on to create-vite instead of being read by npm.
- **`--template react-ts`**: the React template with TypeScript.

create-vite then asks at most three questions (`◆` = waiting for an answer, `◇` = already answered; in the old Windows console, these are replaced by `*`, the letter `o`, and a `|` line):

1. **`Ok to proceed? (y)`** appears if npm first needs to download create-vite 9.3.1. Type **y**, then press **Enter**.
2. **`Which linter to use?`** asks for a code tidiness checker (*linter*) for `npm run lint`. Leave `● Oxlint` (a full dot = the active choice; used in Practice 8), then press **Enter**. If you've already picked `ESLint`, the old tutorials' choice, delete the `frontend` folder that was just created (right-click it in the Explorer panel → **Delete**), then repeat the command.
3. **`Install with npm and start now?`** (`● Yes / ○ No`): press just the letter **n**, without **Enter**, so that it locks to **No**; we do this ourselves in 2.3 so that its output can be read. If you've already chosen Yes and the *dev server* is running, stop it with **Ctrl + C**, then continue from 2.3.

**Expected output (example):**

```text
Need to install the following packages:
create-vite@9.3.1
Ok to proceed? (y) y

> npx
> cva frontend --template react-ts


create-vite v9.3.1

│
◇  Which linter to use?
│  Oxlint
│
◇  Install with npm and start now?
│  No
│
◇  Scaffolding project in C:\Users\you\mini-smart-home\frontend...
│
└  Done. Now run:

  cd frontend
  npm install
  npm run dev
```

The first three lines only appear the first time create-vite 9.3.1 is downloaded. The `Scaffolding project in` path follows where your folder is (macOS: `/Users/…`). An `npm notice` line offering a new npm version can be ignored; don't update npm in the middle of a module. The Explorer panel now shows the **`frontend`** folder with 18 template files (its map is in [Concept 4](#4-vite-and-the-frontend-folder-the-development-kitchen-at-localhost5173)).

#### 2.3 Install the packages, then start the kitchen (6 minutes)

Go into that new folder, then install the packages listed in `package.json`:

```text
cd frontend
npm install
```

**Expected output (example):**

```text
added 27 packages, and audited 28 packages in 45s

9 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

npm downloads React, Vite, TypeScript, oxlint, and their friends into **`node_modules`**, then records their exact versions in **`package-lock.json`**, like the Module 16 backend. The number of packages depends on the npm version (above: npm 11.19); what matters is `found 0 vulnerabilities`. Now start the kitchen:

```text
npm run dev
```

**Expected output (example):**

```text
> frontend@0.0.0 dev
> vite


  VITE v8.3.5  ready in 1385 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

- **`Local: http://localhost:5173/`** is the dashboard's address; the `ready in … ms` time differs every time. If the port isn't **5173** (for example 5174), another program is using 5173: stop Vite (**Ctrl + C**), close that program, then repeat `npm run dev`. The setting in 2.5 makes Vite stop with an error message instead of quietly moving.
- **`Network: use --host to expose`**: only this laptop can open it. Don't add `--host` (safety rule number 4).

Leave this terminal running the kitchen. Open the address in Chrome or Edge (**Ctrl** + click the address in the terminal; macOS: **Cmd** + click). Always `localhost`, not `127.0.0.1`.

**Result:** the Vite template's welcome page: a picture of two layered plates with the React and Vite logos, the heading **Get started**, the sentence `Edit src/App.tsx and save to test HMR`, and the **Count is 0** button. On a laptop in dark mode, the page appears dark; the template's demo CSS is replaced in 2.4.

![Real screenshot of the first page of the create-vite 9.3.1 react-ts template (Vite 8.3.5, React 19.3.1) in Microsoft Edge at a laptop width of 1280 px, after npm run dev in Practice 2.3; title: The first page of the Vite react-ts template at http://localhost:5173. From the top: a two-layer picture with the React and Vite logos (marked 1); the big heading Get started (marked 2); the sentence Edit src/App.tsx and save to test HMR (marked 3); the light purple button Count is 0 (marked 4); then two columns, Documentation, Your questions, answered, with the buttons Explore Vite and Learn more, and Connect with us, Join the Vite community, with the buttons GitHub, Discord, X.com, and Bluesky (marked 5). The key: 1 template images from src/assets/, that is hero.png, react.svg, and vite.svg, deleted in Practice 2.5; 2 Get started is the default src/App.tsx, one React component that returns JSX; 3 edit src/App.tsx, save, and HMR changes the page without reloading; 4 Count is 0 is a button with state, useState, a click adds one and a reload goes back to 0; 5 documentation and community links, part of the template, cleaned up in Practice 2.5.](assets/vite-template-first-page.png)

Try three small things:

1. **Click Count is 0 a few times.** The number goes up without reloading the page, thanks to `onClick={() => setCount((count) => count + 1)}` in `src/App.tsx`: that's *state*, a component's own small whiteboard (Concept 7).
2. **Test HMR.** In `src/App.tsx`, change `Get started` in the line `<h1>Get started</h1>` to `Hello, Mini Smart Home`, then save (**Ctrl + S**). The heading in the browser changes right away, without **F5** (HMR, Concept 4). This is only a test; the contents of `App.tsx` are replaced in 2.5.
3. **Peek at the Console tab** (**F12**): there's an invitation in bold from React, `Download the React DevTools for a better development experience: https://react.dev/link/react-devtools`. You install that extension in 2.6.

#### 2.4 Install Tailwind CSS v4 (7 minutes)

Stop the kitchen first (click the terminal, **Ctrl + C**, on a Mac too): packages and Vite settings are safest to install while the *dev server* is stopped. Installing takes three steps ([Concept 3](#3-tailwind-css-v4-skin-made-of-small-classes)).

**Step 1: the packages.** **`tailwindcss`** is Tailwind itself, and **`@tailwindcss/vite`** is the plugin that makes Vite create CSS for every class you write. Install both with exact versions (safety rule number 5):

```text
npm install tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
```

**Expected output (example):**

```text
added 17 packages, and audited 45 packages in 16s

12 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Older npm versions write bigger numbers (for example `audited 109 packages`). `package.json` now holds `"@tailwindcss/vite": "^4.3.3"` and `"tailwindcss": "^4.3.3"`; the `^` sign is added by npm, while the exact versions are recorded in `package-lock.json`.

**Step 2: the plugin in `vite.config.ts`.** Open `frontend/vite.config.ts`. Right below the line `import react from '@vitejs/plugin-react'`, add:

```ts
import tailwindcss from '@tailwindcss/vite'
```

Then change the line `plugins: [react()],` to:

```ts
  plugins: [react(), tailwindcss()],
```

Save. Leave this template file's style as it is (single quotes, no semicolons); the files you write use semicolons like the backend, and both are valid.

**Step 3: `@import` in `src/index.css`.** Open `src/index.css` (111 lines of the template's demo CSS), delete everything (**Ctrl + A**, then **Delete**), type this one line, then save:

```css
@import "tailwindcss";
```

`src/main.tsx` has imported `index.css` from the start, so it doesn't need to change. Done, without `tailwind.config.js` or `postcss.config.js`. Don't start the kitchen yet: the template's `App.tsx` still uses `App.css`, which depends on the demo CSS you just deleted.

#### 2.5 Tidy up the template (10 minutes)

Work in this order, so that no file points to a picture that has already been deleted.

**1. Replace the contents of `src/App.tsx`.** Delete everything in it, then type:

```tsx
// App.tsx - the dashboard's top component. For now it only holds one heading,
// just proof that React and Tailwind already work. Other components follow from Practice 3 on.
export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      {/* className = the class attribute in HTML; it holds Tailwind's small classes */}
      <h1 className="text-3xl font-bold text-teal-700">Mini Smart Home</h1>
      <p className="mt-2 text-slate-600">Dashboard v0.1 is under construction.</p>
    </main>
  );
}
```

- **`export default function App()`** is a component (Concept 5): a function with a capitalized name that returns what to show. `src/main.tsx` tells React to draw it in `<div id="root">`.
- **`className`** is the JSX version of the `class` attribute, holding Tailwind classes: `min-h-screen` (a background as tall as the screen), `bg-slate-100` (a very light bluish gray), `p-6` (inner spacing of 6 × 4 px = 24 px), `text-3xl font-bold text-teal-700` (big, bold, dark teal text), `mt-2` (8 px of space on top), and `text-slate-600` (gray text).
- **`{/* … */}`** is a comment inside JSX. The template's imports (`useState`, three pictures, `./App.css`) are gone too, because they aren't needed.

**2. Delete the demo files.** In the Explorer panel, right-click → **Delete** (agree to move them to the **Recycle Bin**; macOS: **Trash**) for `src/App.css`, the `src/assets` folder (`hero.png`, `react.svg`, `vite.svg`), and `public/icons.svg`. Keep `public/favicon.svg`, the browser tab icon. The `src` folder now only holds `App.tsx`, `index.css`, and `main.tsx`. Leave the template's `README.md` for now; ➕ A replaces it.

**3. Lock port 5173 in `vite.config.ts`.** The backend only serves the origins listed in `CORS_ORIGIN`, meaning the Vite page on port 5173 ([Concept 4](#4-vite-and-the-frontend-folder-the-development-kitchen-at-localhost5173)). Replace the whole contents of `vite.config.ts` with this version (what's new: two comment lines and the `server` line):

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Module 22: always on port 5173 (the address the backend's CORS_ORIGIN allows).
  // If that port is in use, stop with an error, don't quietly move to 5174.
  server: { port: 5173, strictPort: true },
})
```

**`strictPort: true`** makes Vite **stop** with an error message if port 5173 is taken. Without it, Vite quietly moves to 5174, an origin that isn't in `CORS_ORIGIN`, and from Practice 4 on the dashboard fails to talk to the backend.

**4. The page's language and title in `index.html`.** Open `frontend/index.html` (outside the `src` folder), then replace its whole contents with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mini Smart Home</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Only the tab title changes, to **`Mini Smart Home`** (it was `frontend`); the template's **`lang="en"`**, the sign for the browser and screen readers that this page is in English, already fits.

**5. `.env` stays out of Git.** Open `frontend/.gitignore`, find the line `*.local`, then add two lines below it so that it becomes:

```text
*.local
# Module 22: local settings files stay out of Git (.env.local is already caught by *.local above)
.env
```

`*.local` already guards `.env.local`; the `.env` line closes the remaining gap (Concept 4). Its contents really aren't secret (every `VITE_…` is sent to the browser anyway), but your laptop's settings don't need to go to GitHub.

Save everything (**File → Save All**), run `npm run dev` again (its output is as in 2.3), then reload the `http://localhost:5173` tab (**F5**).

**Result:** the tab says `Mini Smart Home`, and the whole page has a very light bluish-gray background. At the top left, 24 px from the edges, there's the heading **Mini Smart Home**, big, bold, and dark teal, with the gray sentence `Dashboard v0.1 is under construction.` below it. The tab icon is still the Vite logo (`public/favicon.svg`).

Make sure Tailwind works: right-click the heading → **Inspect**. The **Elements** tab highlights `<h1 class="text-3xl font-bold text-teal-700">Mini Smart Home</h1>`: the `className` in JSX has become a plain `class` attribute in the DOM. The **Styles** section next to it holds the rules `.text-teal-700`, `.font-bold`, and `.text-3xl` made by Tailwind, each under the small heading `Layer utilities` and linked to `<style>`; the color is written as a variable, `var(--color-teal-700)`. If the heading is black on a white background, Tailwind isn't working yet: check the three steps of 2.4 again, or open [🚨 Troubleshooting](#-troubleshooting).

#### 2.6 Install React DevTools and look at the component tree (8 minutes)

**React DevTools**, a free extension from the React team, doesn't see a page as a tree of HTML elements (the DOM), as the built-in DevTools does, but as a **component tree**: the LEGO bricks it's made of, with the *props* and *state* of every brick.

> [!WARNING]
> A browser extension can read the pages you open. Install React DevTools only from your browser's official store, through the links below or in the React documentation ([react.dev/learn/react-developer-tools](https://react.dev/learn/react-developer-tools)), not from search results or other sites.

1. **Install the extension.**
   - **Chrome:** open [React Developer Tools in the Chrome Web Store](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi), click **Add to Chrome**, then confirm with **Add extension**.
   - **Edge:** open [React Developer Tools in Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil), click **Get**, then confirm with **Add extension**.
2. **Reload the dashboard.** In the `http://localhost:5173` tab, close DevTools if it's open, press **F5**, then open DevTools again (**F12**). A new extension only works on pages loaded after it was installed.
3. **Find the Components tab.** The row of DevTools tabs now has **Components ⚛** and **Profiler ⚛**, plus **Suspense ⚛** since version 8 (the atom symbol = a tab from React DevTools), usually at the far right; if your DevTools is narrow, click the **»** sign. On a page without React, these tabs are still there, but they only hold `Looks like this page doesn't have React, or it hasn't been loaded yet.`
4. **Look at the tree.** Click the **Components** tab. For now the tree holds only one brick, **`App`** (the `StrictMode` wrapper from `main.tsx` isn't shown). Click `App`: the right panel shows its *props* (what's handed down) and its *state*, both still nearly empty.
5. **Find who owns an element.** Click the picker button at the top left of the **Components** tab (a box icon with an arrow, labeled `Select an element in the page to inspect it` when you point at it), then click the heading **Mini Smart Home** on the page. React DevTools highlights `App`, the brick that draws it.

From Practice 3 on, this tree grows ([the diagram in Concept 5](#5-react-and-jsx-a-page-made-of-lego-bricks)). The **Profiler** and **Suspense** tabs aren't used in this module. If the **Components** tab still doesn't appear, open [🚨 Troubleshooting](#-troubleshooting).

#### 2.7 Taste it with `npm run build`, then save to the branch (7 minutes)

Before saving, make sure your project can also be cooked into a ready-to-serve dish (Concept 4). Stop the *dev server* (**Ctrl + C**), then run:

```text
npm run build
```

**Expected output (example):**

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 16 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-CiJyPGsd.css    6.80 kB │ gzip:  2.06 kB
dist/assets/index-BF9-iAsp.js   219.77 kB │ gzip: 68.72 kB

✓ built in 1.70s
```

- `tsc -b` checks the types (silent: no errors), then `vite build` processes **16 modules**: your files and the React modules. In the VS Code terminal, the `transforming...` and `rendering chunks...` lines may be overwritten and disappear.
- The new **`dist/`** folder holds `index.html`, `favicon.svg`, one CSS file (only 6.80 kB, because Tailwind only makes CSS for the classes you write), and one JavaScript file (219.77 kB, almost all of it React and React DOM). The `gzip` column is the size after compression.
- `frontend@0.0.0` is the package's name and version; Practice 8 changes them to `mini-smart-home-frontend` version `0.1.0`.

What's in `dist/` is taken apart in [🔬 Technical Deep Dive](#-technical-deep-dive-optional); this folder can be recreated at any time and doesn't go into Git. Then check how tidy the code is:

```text
npm run lint
```

**Expected output:**

```text
> frontend@0.0.0 lint
> oxlint
```

No warnings: clean. In the VS Code terminal, oxlint usually ends with a summary like `Found 0 warnings and 0 errors.` and `Finished in 30ms on 3 files with 116 rules using 8 threads.` (the numbers follow your laptop); those three files are `src/App.tsx`, `src/main.tsx`, and `vite.config.ts`.

Now save to the branch (the terminal is still in the `frontend` folder):

```text
git add .
git status
```

**Expected output:**

```text
On branch feature/dashboard
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   .gitignore
	new file:   .oxlintrc.json
	new file:   README.md
	new file:   index.html
	new file:   package-lock.json
	new file:   package.json
	new file:   public/favicon.svg
	new file:   src/App.tsx
	new file:   src/index.css
	new file:   src/main.tsx
	new file:   tsconfig.app.json
	new file:   tsconfig.json
	new file:   tsconfig.node.json
	new file:   vite.config.ts
```

As usual since Module 16, read the list before committing: exactly **14 new files**, **without `node_modules` and `dist`** (both are ignored by the template's `.gitignore`). If one of them got in, empty the basket with `git restore --staged .`, check your `.gitignore`, then repeat `git add .`. On Windows, `git add .` may first print thirteen lines like `warning: in the working copy of 'frontend/.gitignore', LF will be replaced by CRLF the next time Git touches it`. As in Module 16, that's only a notice about line endings; just ignore it.

If the list is right, make the commit:

```text
git commit -m "Dashboard: Vite react-ts project, Tailwind v4, and port 5173 (Module 22 Practice 2)"
```

No `git push` needed yet: this branch is only sent to GitHub in ➕ C, together with its pull request.

> ⬆️ **Done with Practice 2?** Read [Concept 5](#5-react-and-jsx-a-page-made-of-lego-bricks) and [Concept 6](#6-props-and-types-data-handed-down-shaped-by-the-data-contract), then continue to [Practice 3 — The first component: `SensorCard` and types from the data contract](#practice-3--the-first-component-sensorcard-and-types-from-the-data-contract-45-minutes).

### Practice 3 — The first component: `SensorCard` and types from the data contract (45 minutes)

> 🖥️ **Tools used:** **VS Code** with two terminals: the first keeps running `npm run dev` in the `frontend` folder since Practice 2, the second is for `generate-dummy.js` (the `tools` folder), then `npm run build` and `git` (the `frontend` folder). A **browser**, Chrome or Edge, at `http://localhost:5173` with the **Components** tab of React DevTools. The backend, Docker Desktop, and the simulator **aren't** needed yet. Concepts used: Concepts 5–6.

This practice puts in the first LEGO brick: type labels from the data contract in `src/types.ts`, the `SensorCard` mold, then six cards in `App.tsx` holding one example reading from `generate-dummy.js`, your tool from Module 4 (the backend is only connected in Practice 4). At the end, you deliberately make the typo `humidty` and see who catches it. The state of the code at the end of this practice is in [`code/stages/practice-3/frontend/`](code/stages/practice-3/frontend/).

#### 3.1 The shape of the data from the contract: `src/types.ts` (10 minutes)

Make sure the kitchen is still running: `http://localhost:5173` shows the heading `Mini Smart Home` from Practice 2. If it isn't, in the terminal (which starts in the `mini-smart-home` folder) type `cd frontend`, then `npm run dev`.

Also open `DATA-CONTRACT.md` at the root of the repository: data contract 1.4 from Module 21, your project's version of [Appendix A of the Syllabus](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract). Every row of the table in section 4 (`telemetry`) becomes one type-label line.

Right-click the **`frontend/src`** folder → **New File…**, name it **`types.ts`**, then fill it with the following code. Typing it yourself trains your eyes to read types (the quick copy: [`code/stages/practice-3/frontend/src/types.ts`](code/stages/practice-3/frontend/src/types.ts)).

```ts
// types.ts - data shapes from the data contract (Syllabus Appendix A, DATA-CONTRACT.md 1.4) and from the backend v1.0 API responses.
// The field names are exactly the ones the backend sends, so data from the server "fits" right away.
// This file only holds types (labels for TypeScript): when the page runs in the browser, Vite has already removed all these lines.
// Value choices are written as unions of text ("a" | "b"), not enums: our template forbids enums (erasableSyntaxOnly).

// the device kind according to the backend
export type Kind = "node1" | "node2" | "unknown";

// the status from the msh/<device_id>/status topic; "unknown" = registered, but it has never sent a status
export type DeviceStatus = "online" | "offline" | "offline-mode" | "unknown";

// the key field in GET /devices (Module 21)
export type KeyStatus = "active" | "revoked" | "no-key" | "unregistered";

// one row of the GET /devices response
export type Device = {
  device_id: string; // 12 hexadecimal digits in lower case, for example "a4cf12e5b7c0"
  name: string | null; // null = the admin hasn't named it yet
  location: string | null;
  kind: Kind;
  status: DeviceStatus;
  last_seen: string | null; // UTC time, for example "2026-10-23T09:41:30Z"
  key: KeyStatus;
  registered_at: string | null;
  key_created_at: string | null;
  revoked_at: string | null;
  linked_via: string | null; // Node 2 only: the device_id of the Node 1 that forwards its data
};

// the state of Node 1's four actuators (contract 1.3)
export type State = {
  fan: boolean;
  lamp: boolean;
  pump: boolean;
  curtain: number; // the curtain servo's angle, 0-180 degrees
};

// Node 1's telemetry. "| null" = the sensor failed to read (rule 7)
export type TelemetryNode1 = {
  ts: string; // reading time in UTC, made by the device (rule 1)
  fw: string; // firmware version
  temperature: number | null; // °C
  humidity: number | null; // %
  light: number; // 0 (pitch dark) to 4095 (very bright)
  soil: number; // % soil moisture
  motion: boolean;
  water_level: number | null; // % of the water tank filled
  // the ? mark = the field may be missing entirely
  soil_rs485?: number | null; // RS-485 soil sensor (contract 1.2): these three fields always come together
  soil_temperature?: number | null; // °C
  ec?: number | null; // µS/cm
  state?: State; // contract 1.3
};

// Node 2's telemetry (contract 1.1), forwarded by Node 1 through ESP-NOW
export type TelemetryNode2 = {
  ts: string;
  fw: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null; // hPa
  soil_temperature: number | null;
  soil: number | null;
  battery?: number | null; // volts; the field is missing if no battery meter is fitted
};

export type Telemetry = TelemetryNode1 | TelemetryNode2;

// the GET /devices/:id/latest response
export type LatestReading = {
  device_id: string;
  kind: Kind;
  status: DeviceStatus;
  telemetry: Telemetry;
};

// the response of POST /auth/login, POST /auth/refresh, and GET /auth/me
export type User = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "viewer";
};
```

Save, then compare it with the contract:

- **`Kind`, `DeviceStatus`, `KeyStatus`** are fixed choice lists, written as text unions, not as an `enum` (Concept 6). The four choices of `KeyStatus` are the same as the `key` field of `GET /devices` since Module 21; their badge is made in Practice 5.
- **`Device`** = one row of `GET /devices`. Fields that can be empty get `| null`, for example a `name` the admin hasn't filled in yet.
- **`TelemetryNode1`** = the table in section 4. Its "If the reading fails" column decides the types: `temperature`, `humidity`, and `water_level` can be `null`, while `light`, `soil`, and `motion` never are. The RS-485 trio (contract 1.2) and `state` (contract 1.3) are marked `?` because they're only there if the sensor is installed or the firmware is new enough. **`TelemetryNode2`** follows contract 1.1.
- **`LatestReading`** = the `GET /devices/:id/latest` response; **`User`** = the `POST /auth/login`, `POST /auth/refresh`, and `GET /auth/me` response, with `role` `"admin"` or `"viewer"` (Module 20).

Most of them are only used later (`User` in Practice 4, `Device` in Practice 5, `LatestReading` in Practice 6). `noUnusedLocals` doesn't complain about them because they all have `export`.

> [!NOTE]
> **Why copy it instead of taking it from the backend?** The backend keeps the same shape as Zod schemas in `backend/src/schemas/contract.ts`, but `backend` and `frontend` are two separate projects. Copying is the simplest for now; the price is that two copies must be kept the same, with `DATA-CONTRACT.md` as the reference (change the contract first, then both copies). A way to share one copy is in [🔬 Technical Deep Dive](#-technical-deep-dive-optional).

#### 3.2 The first brick: `src/components/SensorCard.tsx` (10 minutes)

Right-click the **`frontend/src`** folder → **New Folder…**, name it **`components`** (the home of all the bricks). Right-click that folder → **New File…**, name it **`SensorCard.tsx`**, then fill it in:

```tsx
// SensorCard.tsx - one card for one sensor reading: label, number, and unit.
// Reused across the whole dashboard (LEGO bricks): there is one mold, and its content is handed down through props.
type Props = {
  label: string; // the small text on top, for example "Temperature"
  value: number | string | null; // a number or text; null = the sensor failed to read (rule 7)
  unit?: string; // the ? mark = may be left out (the "Motion" card has no unit)
  color?: string; // the Tailwind color class for the number, for example "text-teal-600"
};

export default function SensorCard({ label, value, unit, color = "text-slate-800" }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {/* ?? = if the value is null, write "—" (not 0: the number 0 is still a valid reading) */}
        <span className={value === null ? "text-slate-400" : color}>{value ?? "—"}</span>
        {/* the unit is only written when there is a number */}
        {unit && value !== null ? <span className="ml-1 text-base font-normal text-slate-400">{unit}</span> : null}
      </p>
    </div>
  );
}
```

You already took its contents apart in Concepts 5–6. Remember: the file name is the same as the component's name (a capital letter, `.tsx`); `{value ?? "—"}` writes a gray `—` without a unit for a sensor that failed (`null`), while `0` stays `0`; Tailwind classes are written in full so that `@tailwindcss/vite` finds them (Concept 3). Save. The screen doesn't change yet, because the mold hasn't been put in place.

#### 3.3 Six cards from one `generate-dummy.js` reading (10 minutes)

The comment at the top of `generate-dummy.js` has promised this meeting since Module 4 ("Used again in Modules 10, 16, and 22."): the tool fills the dashboard before there are real sensors.

**Make one example reading.** Open a second terminal (**Terminal → New Terminal**), then type:

```text
node --version
cd tools
node generate-dummy.js
```

The first line must be `v24…`. **Expected output (example):** the numbers are random, and `ts` follows the time you run it.

```text
Done: 100 readings written to data/readings.json
Example of the first reading: {
  ts: '2026-10-23T09:56:59Z',
  fw: '0.1.0',
  temperature: 28.1,
  humidity: 71,
  light: 473,
  soil: 38,
  motion: false,
  water_level: 57
}
```

Of the hundred readings in `tools/data/readings.json`, we only need the printed one.

> [!NOTE]
> **Nothing printed?** `generate-dummy.js` uses `import.meta.main`, which has only existed since Node.js 24.2 (and 22.18). With Node.js 22.17, this command stays silent, even though Vite 8 still runs. The fix is in [Module 4's 🚨](../../phase-0-foundations/module-04-javascript-nodejs/README.md#-troubleshooting), the problem "`node generate-dummy.js` prints nothing".

**Put six cards in `App.tsx`.** Almost all of its contents change. Open [`code/stages/practice-3/frontend/src/App.tsx`](code/stages/practice-3/frontend/src/App.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/App.tsx` (**Ctrl + A**, then **Ctrl + V**). If you type it yourself, Vite's error box may flash up because Auto Save saves unfinished typing; the box disappears as soon as your typing is complete.

Its two main parts: at the top, after `import SensorCard from "./components/SensorCard";` (without `{ }`: the main export, `export default`) and `import type { TelemetryNode1 } from "./types";` (Concept 6):

```tsx
const reading: TelemetryNode1 = {
  ts: "2026-10-23T09:56:59Z",
  fw: "0.1.0",
  temperature: 28.1,
  humidity: 71,
  light: 473,
  soil: 38,
  motion: false,
  water_level: 57,
};
```

The `TelemetryNode1` label makes TypeScript check every field against the contract; `state` and the RS-485 trio may be missing thanks to the `?` mark. The numbers are **copied**, not `import`ed, because `generate-dummy.js` uses `node:fs`, which doesn't exist in the browser. Replace the values with the reading from your terminal, or leave them. Node.js's single quotes (`'0.1.0'`) are replaced by double quotes, as in the Module 16 backend; both are valid.

Inside `<main>`, the heading is wrapped in `<div className="mx-auto max-w-3xl">` together with a small `fw` and `ts` line, then comes the grid of six cards:

```tsx
        <div className="mt-4 grid grid-cols-3 gap-3">
          <SensorCard label="Temperature" value={reading.temperature} unit="°C" color="text-teal-600" />
          <SensorCard label="Humidity" value={reading.humidity} unit="%" />
          <SensorCard label="Light" value={reading.light} unit="/4095" />
          <SensorCard label="Soil moisture" value={reading.soil} unit="%" />
          <SensorCard label="Motion" value={reading.motion ? "Yes" : "No"} />
          <SensorCard label="Water tank" value={reading.water_level} unit="%" />
        </div>
```

One mold, six different things handed down. The Motion card turns `true`/`false` into text with `? :` (warm-up Step 3). The UTC time `ts` is shown as it is; "updated at … WIB" comes later in `DeviceDetails` (Practice 6). `max-w-3xl` limits the content to at most 768 px wide; three columns that are too narrow on a phone are fixed in Practice 7.

Save. Thanks to HMR, the browser changes right away.

**Result (example):** under the heading there's a small gray line `Example reading from generate-dummy.js (not from the API yet) · firmware 0.1.0 · ts 2026-10-23T09:56:59Z`, then six white cards in two rows of three columns in the middle of the screen: `Temperature` `28.1` `°C` (a teal number), `Humidity` `71` `%`, `Light` `473` `/4095`, `Soil moisture` `38` `%`, `Motion` `No` (without a unit), and `Water tank` `57` `%`. The other numbers are dark; their units are small and gray.

**Peek at what's handed down.** In DevTools (**F12**), on the **Components** tab, `App` holds six `SensorCard`s; click one of them to see its *props* (`label`, `value`, `unit` when there is one, `color` on the Temperature card). The first whiteboard (*state*) only appears in Practice 4.

#### 3.4 A typo that TypeScript catches (8 minutes)

Concept 4 said that Vite removes the type labels **without** checking them. Prove it with the most common slip in this dashboard, one missing letter: `humidty` (the field name in the contract: `humidity`).

**Make the typo.** In the Humidity card's line, replace `reading.humidity` with `reading.humidty`, then save.

**Look at VS Code.** `humidty` gets a wavy red underline. Point the mouse at it: that field doesn't exist in `TelemetryNode1`, and VS Code suggests `humidity`. The **Problems** panel (**Ctrl + Shift + M**) lists it with its line number.

**Look at the browser.** No Vite error box, and the **Console** tab is calm: no red or yellow lines. Only the Humidity card changes, to `—%`: the `—` mark is dark like the other numbers (not gray), and the `%` stays attached.

Why? In JavaScript, `reading.humidty` is just `undefined` ("this field doesn't exist"). `SensorCard` prepares the gray color and hides the unit only for `null`; `undefined` slips through, then `??` turns it into `—`. The card looks like a broken sensor; you could spend days checking the DHT22 wiring when the mistake is one letter.

> [!IMPORTANT]
> **A red line in VS Code doesn't stop the kitchen.** `npm run dev` keeps serving the wrong page (Concept 4). There are only two type checkers: VS Code while you type, and `tsc -b` at the start of `npm run build`.

**Run the checker** in the second terminal (still in the `tools` folder):

```text
cd ../frontend
npm run build
```

**Expected output:**

```text
> frontend@0.0.0 build
> tsc -b && vite build

src/App.tsx:31:55 - error TS2551: Property 'humidty' does not exist on type 'TelemetryNode1'. Did you mean 'humidity'?

31           <SensorCard label="Humidity" value={reading.humidty} unit="%" />
                                                         ~~~~~~~

  src/types.ts:43:3
    43   humidity: number | null; // %
         ~~~~~~~~
    'humidity' is declared here.


Found 1 error.
```

The error line names the file, line, and column of the typo, the code `TS2551`, and the suggestion `humidity`; below it, `tsc` points to where `humidity` is written in `src/types.ts`. After `Found 1 error.`, npm prints nothing more. Because `tsc -b` failed, `&&` stops the next step: `vite build` doesn't run, and `dist/` isn't updated.

**Fix it, then repeat.** Change it back to `humidity`, save (the red line disappears, the number comes back), then run `npm run build` again.

**Expected output (example):** the file names, sizes, and duration may differ.

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 17 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-BlS5-9Xz.css   10.14 kB │ gzip:  2.70 kB
dist/assets/index-DiY7wK_q.js   220.95 kB │ gzip: 69.19 kB

✓ built in 749ms
```

`tsc -b` prints nothing, a sign that there are no type errors, then `vite build` packs the dashboard into `dist/` (taken apart in 🔬; it doesn't go into Git). The CSS file grows from 6.80 kB in Practice 2 to 10.14 kB because Tailwind also makes the new classes in `SensorCard` and `App` (Concept 3). In the VS Code terminal, the `transforming...` and `rendering chunks...` lines may be overwritten and disappear.

**Try this too (optional).** Change it to `humidity: null`: no red line, and the card shows a gray `—` **without** `%`, the look of a sensor that really failed (rule 7). `light: null` gets a red line, because according to the contract `light` is never `null`. Put it back as it was.

Get used to glancing at the red lines and running `npm run build` before saving to Git; in Practice 8 and ➕ B, `npm run build` and `npm run lint` become requirements. Other type errors (`TS1484`, `TS1294`, `TS6133`) are in [🚨 Troubleshooting](#-troubleshooting).

#### 3.5 Save to the branch (7 minutes)

Make sure `App.tsx` uses `humidity` again and the last `npm run build` passed. In the second terminal (the `frontend` folder):

```text
git add src/types.ts src/components/SensorCard.tsx src/App.tsx
git status
git commit -m "SensorCard and types from the data contract: six cards from an example reading (Module 22 Practice 3)"
```

`git status` shows three files ready to be committed: two new ones and the changed `App.tsx`. `dist/`, `node_modules`, and `tools/data/` are ignored by `.gitignore`.

> ⬆️ **Done with Practice 3?** Read [Concept 7 — *State* and `useState`](#7-state-and-usestate-a-screen-that-remembers) and [Concept 9 — Logging in from the browser](#9-logging-in-from-the-browser-cookies-cors-and-localhost), then continue to [Practice 4 — *State* and the login form](#practice-4--state-and-the-login-form-60-minutes). These example cards still show after the login in Practice 4, are replaced by the device list in Practice 5, and `SensorCard` is used again for real numbers from the API in Practice 6.

### Practice 4 — *State* and the login form (60 minutes)

> 🖥️ **Tools used:** **VS Code** with a terminal in the `backend` folder (backend v1.0, `npm run dev`, port 8080), a terminal in the `frontend` folder (Vite, port 5173), and one empty terminal in the `frontend` folder for Git; the laptop path adds a broker terminal (the `edge` folder) and a simulator terminal (the `tools` folder). Then **Docker Desktop**, a **Chrome or Edge browser** with DevTools (the **Network** and **Console** tabs, the **Application** panel) and React DevTools, and **Bruno**. Concepts used: Concepts 7 and 9.
>
> ⭐ **Required** — step 4.4: log in from the browser with your Module 20 account, then prove for yourself in DevTools that the cookies really arrive.

Up to Practice 3, the dashboard has never talked to the backend. This practice opens the door: **one door** to the backend, `src/api.ts`, which always carries the cookies, then your first **login form**, `src/components/Login.tsx`. At the end of the practice, the browser holds the same wristband and season pass that Bruno held in Module 20.

#### 4.1 Start backend v1.0 and its data source (8 minutes)

From this week on, the backend (Fastify, the `backend` folder) and the dashboard (Vite, the `frontend` folder) run **at the same time**, each with `npm run dev` in its own terminal. A new terminal in VS Code (**Terminal → New Terminal**) starts in the `mini-smart-home` folder.

1. **Database.** In Docker Desktop, start the `smarthome-db` container with the **▶** button, or run `docker start smarthome-db` (Module 17).
2. **Broker and devices.** The device path: turn on Node 1 and Node 2 (the broker on the Pi is already running as a service). The laptop path: in a new terminal, start the locked broker as in Module 21 Practice 4.5, unless you already use the permanent Mosquitto service from Module 21's 🔬:

   ```text
   cd edge
   mosquitto -v -c mosquitto-lan.conf
   ```

3. **Backend.** In a new terminal, type `cd backend`, then `npm run dev`; wait for `Server listening at http://127.0.0.1:8080` and `connected to broker … as backend`. The Module 21 backend v1.0 code isn't changed at all this week.
4. **The laptop path: the simulator** for one practice device (Module 21 Practice 7.1), in a new terminal:

   ```text
   cd tools
   node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1
   ```

   Wait for `f00d00000001: online`, then leave it running.
5. **Bruno.** Send **`health`**: its answer must hold `"database": true` and `"broker": true`.
6. **Vite.** If it has stopped, run `npm run dev` again in the `frontend` folder's terminal, then open **`http://localhost:5173`**.

The login doesn't use the data source yet, but its readings are needed in Practices 5–6.

#### 4.2 One door to the backend: `src/api.ts` and `.env.example` (12 minutes)

Every knock on the backend (`/auth/login`, then `/auth/me`, `/devices`, `/devices/:id/latest`) needs the backend's address, `credentials: "include"`, and a way to read errors. It's all gathered in **one door**, `src/api.ts`: components just call named functions like `login(email, password)`, and the refresh once (Practice 6) goes in here.

Right-click the **`frontend/src`** folder → **New File…**, name it **`api.ts`**, then type:

```ts
// api.ts - one door to the backend: every request to the API goes through the request() function in this file.
// Login uses the backend's HttpOnly cookies (Module 20). JavaScript can't read them; the browser stores them
// and sends them, as long as every fetch carries credentials: "include".
import type { User } from "./types";

// Backend address. Default: this page's host name + port 8080, so the page http://localhost:5173 -> API http://localhost:8080.
// The same host name matters: a SameSite=Strict cookie only goes along when the page and the API are one site
// (localhost with localhost, 127.0.0.1 with 127.0.0.1). Another address can be set with VITE_API_BASE in .env.local.
// The trailing slash is removed: the backend answers "//auth/login" as an unknown route (401).
const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");

// An error that knows its HTTP code, so a screen can tell "not logged in" (401) apart from other problems.
// Code 0 = the server can't be reached at all.
export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

// request() sends one request, then returns the JSON content of the response or throws an ApiError.
// <T> = the shape of the response content, filled in by the calling function (for example User).
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    // credentials: "include" = bring the cookies even though the API is another origin (port 8080, not 5173)
    res = await fetch(BASE + path, { credentials: "include", ...options });
  } catch {
    // fetch failed completely: backend down, wrong address, or blocked by CORS. The browser deliberately doesn't tell
    // JavaScript which one (a CORS error looks the same as a backend that is down); the details are only in the Console tab.
    throw new ApiError(
      0,
      "Can't reach the server at " + BASE + ". Maybe the backend isn't running yet, or this page was opened from " +
        "an address the backend doesn't allow (open http://localhost:5173, see CORS_ORIGIN).",
    );
  }
  if (!res.ok) {
    // fetch does NOT throw an error for 401, 404, or 500: we are the ones who check res.ok
    let message = "Something went wrong (" + res.status + ").";
    try {
      const body = await res.json();
      // our backend's errors and Fastify's built-in ones (400, 429, 500) both carry the text in the message field
      if (typeof body?.message === "string") message = body.message;
    } catch {
      // the response isn't JSON: use the default message above
    }
    throw new ApiError(res.status, message);
  }
  // as T = "trust me, the content has the shape T". TypeScript doesn't check JSON content while the page runs;
  // we rely on the backend's API contract (a real check with Zod only comes in Module 24).
  return (await res.json()) as T;
}

// POST /auth/login. The JSON Content-Type header is only set on requests that really carry a JSON body:
// a POST that claims to be JSON but has an empty body is refused by the backend (400).
export function login(email: string, password: string): Promise<User> {
  return request<User>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}
```

- **`BASE`** follows the page's host name (Concept 9): the page `http://localhost:5173` knocks on `http://localhost:8080`, unless `.env.local` sets `VITE_API_BASE`. It's deliberately `||` (warm-up Step 3), not `??`: the line `VITE_API_BASE=` with nothing after it gives `""`, and `??` would accept that as an address. The `: string` label is added because TypeScript doesn't know the type of `VITE_…` variables.
- **`ApiError`** is an error *class* (an object mold) that inherits from `Error` and adds a **`code`** field: its HTTP code, or **0** if the server can't be reached at all, so that a screen can tell "wrong password" apart from "backend down" (Concept 10). The `constructor` runs on `new ApiError(…)`: `super(message)` passes the message on to `Error` (`err.message`), and `this.code` stores the code. The shorthand `constructor(public code…)` is refused (`TS1294`, 🚨).
- **`request<T>()`** is the heart of it. `<T>` is a "type hole" that the caller fills: `request<User>(…)` means "the response has the shape `User`".
  1. `fetch` always gets `credentials: "include"`; the *spread* `...options` (warm-up Step 4) adds `method`, `headers`, and `body`.
  2. If `fetch` **fails completely** (for example, the backend is down), `catch` turns it into an `ApiError` with code 0 and a message that names the `BASE` address and two possible causes (4.5).
  3. `fetch` does **not** throw an error for 401, 404, or 500, so `request()` checks `res.ok` itself, like `warmup.js` (Step 5). The message is taken from the `message` field: our backend (for example `wrong email or password`) and Fastify's built-in errors (400, 429, 500) both put the text there, so one check is enough.
  4. `as T` means "trust me, its shape is `T`": nothing checks the data from the network, so `types.ts` must match the data contract.
- **`login()`** (exported; `request()` isn't) sends `POST /auth/login` with `{ email, password }`, short for `{ email: email, password: password }`. Only this request carries content, so only here is `Content-Type: application/json` set; that header is what triggers the *preflight*. The logout and the refresh later go without that header, because the backend refuses an empty `POST` labeled as JSON.

Then right-click the **`frontend`** folder (not `src`) → **New File…**, name it **`.env.example`** (it starts with a dot), then type:

```text
# .env.example - example dashboard settings. This file goes into Git; your copy (.env.local) does NOT.
# Without .env.local, the dashboard calls the backend at the page's host name + port 8080:
# the page http://localhost:5173 -> API http://localhost:8080. That already matches the Module 21 backend.
# Is your backend at another address? Copy this file to .env.local, remove the # in front of the last line,
# change the address, then stop npm run dev (Ctrl + C) and run it again.
# Remember: every VITE_... value is built into the JavaScript sent to the browser. Put an address here, NEVER a secret.
# VITE_API_BASE=http://localhost:8080
```

This file is only an **example** (Vite doesn't read it) for teammates, or for you later if the backend is at another address. The `VITE_API_BASE` line is deliberately a comment, so that a copy taken as it is doesn't pin the backend's address, and the API address keeps following the page's host name.

> [!IMPORTANT]
> **Don't create `.env.local` this week.** Without that file, the dashboard already knocks on `http://localhost:8080`. If you need it later: the host name in `VITE_API_BASE` must be the same as the page's host name, Vite only reads it when it starts (**Ctrl + C**, then `npm run dev` again), and its content is sent to the browser, so it may only be an address, never a secret.

Save both files (**Ctrl + S**). The screen doesn't change yet, because `api.ts` isn't used yet.

#### 4.3 The login form: `src/components/Login.tsx`, then put it in `App` (15 minutes)

Right-click the **`frontend/src/components`** folder → **New File…**, name it **`Login.tsx`**, then type:

```tsx
// Login.tsx - a minimal login form: email + password to POST /auth/login. On success, the backend sets the
// login cookies in the browser, then the parent component is told through onLogin. Improved in Module 24.
import { useState } from "react";
import type { SubmitEvent } from "react"; // React's type for the "form submitted" event
import { ApiError, login } from "../api";
import type { User } from "../types";

type Props = {
  onLogin: (user: User) => void; // called after a successful login, carrying the account from the backend
};

export default function Login({ onLogin }: Props) {
  // A controlled form: what the box holds is always the same as the state, and every keystroke updates the state.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); // true while waiting for the backend's answer

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // don't let the browser reload the page (a form's default behavior)
    setError(null);
    setBusy(true);
    try {
      onLogin(await login(email, password));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-slate-800">Mini Smart Home</h1>
        <p className="mt-1 text-sm text-slate-500">Log in with your Module 20 account to see the dashboard.</p>

        {/* htmlFor = the for attribute in HTML: tapping the label moves the cursor into its box */}
        <label htmlFor="email" className="mt-5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="viewer@home.test"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        <label htmlFor="password" className="mt-4 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        {error ? <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
```

Its four whiteboards, the controlled form, and `handleSubmit()` were already taken apart in Concept 7. Things to notice:

- **Two import lines from `"react"`.** `import { useState } from "react";` takes a function, while `import type { SubmitEvent } from "react";` only takes a label, so it uses `import type` (Concept 6). `ApiError` and `login` are imported without `type`, because both are **values**: `login` is called (the component `Login`, capital L, calls the helper `login()` from `api.ts`), and `err instanceof ApiError` checks whether the error was made by `request()` (if not: `Couldn't log in.`).
- **`SubmitEvent<HTMLFormElement>`** is the label for the "form submitted" event. Old tutorials use `FormEvent`, which @types/react 19.3 marks as deprecated (VS Code strikes it through). Without the `import type { SubmitEvent }` line, TypeScript uses the browser's own `SubmitEvent`, which doesn't accept `<…>`, and `npm run build` fails with `TS2315` `Type 'SubmitEvent' is not generic.` (🚨).
- **`htmlFor` and `id`**: `htmlFor` is the JSX version of the HTML `for` attribute (like `className`). This pair links a label to its box: clicking the text **Email** moves the cursor into its box, and screen readers for blind users read out the right label. Without it, Chrome and Edge record a suggested fix in the DevTools **Issues** panel, for example `No label associated with a form field`.
- **`type="email"`, `type="password"`, and `required`** make the browser refuse an empty box and an email without `@` before `fetch` sets off, and show the password as dots. **`autoComplete`** guides password managers; **`placeholder`** is only a gray example. The pink box `{error}` is only drawn when there's a message, and its text is escaped by JSX (Concept 5). While `busy`, the button fades and says `Logging in…`.

Now put `Login` in **`src/App.tsx`**, which only changes a little. In the imports at the very top, `useState`, `Login`, and the `User` label are taken in too:

```tsx
import { useState } from "react";
import SensorCard from "./components/SensorCard";
import Login from "./components/Login";
import type { TelemetryNode1, User } from "./types";
```

At the start of the `App` function, before the old `return`:

```tsx
export default function App() {
  // null = not logged in. After login, it holds the account from the POST /auth/login answer.
  const [user, setUser] = useState<User | null>(null);

  if (user === null) {
    return <Login onLogin={setUser} />;
  }
```

Below the heading there's a new greeting paragraph, and the `Example reading…` paragraph after it now has the class `mt-4`:

```tsx
        <p className="mt-2 text-slate-600">
          Hello, {user.name}! You're logged in as <span className="font-semibold">{user.role}</span>.
        </p>
        <p className="mt-4 text-sm text-slate-500">
```

The comment at the top of the file changes too: it records one weakness that's deliberately left in (you try it at the end of 4.4). The safest way: open [`code/stages/practice-4/frontend/src/App.tsx`](code/stages/practice-4/frontend/src/App.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/App.tsx`.

While the `user` board holds `null`, the screen holds only the form. What's handed down as `onLogin` is `setUser` itself (data flows down through *props*, events flow up through a callback handed down, Concept 6): as soon as `Login` reports back with the account from the backend, the board is filled, React redraws `App`, and the greeting and the cards appear without "moving to another page".

Save both files. Vite updates the browser by itself.

**Result:** at `http://localhost:5173`, the Practice 3 cards are replaced by a form in the middle of a light gray screen: a white card with rounded corners holding the heading `Mini Smart Home`, the sentence `Log in with your Module 20 account to see the dashboard.`, an **Email** box with the gray example `viewer@home.test`, a **Password** box, and a teal **Log in** button.

Try two small things before logging in:

1. **`required` works without the backend.** Open DevTools (**F12**; macOS: **Cmd + Option + I**) on the **Network** tab, then click **Log in** with both boxes empty. A small bubble appears at the **Email** box, and there's no new row in the **Network** tab. The bubble's text follows your browser's language, for example `Please fill out this field.` Type `abc`, then click **Log in** again: this time the bubble asks for an `@`.
2. **The whiteboards can be peeked at.** On the **Components** tab of React DevTools, click `Login`. The **hooks** section in the right panel holds four `State` rows numbered 1 to 4, in the same order as the `useState` calls in `Login.tsx` (`email`, `password`, `error`, `busy`). Type in the **Email** box: the first row changes along with it, letter by letter. Type a few random letters in the **Password** box: the second row shows them **as they are**, so don't take pictures of DevTools while typing a real password. Empty both boxes again.

#### 4.4 ⭐ Log in: `POST /auth/login` in the Network tab, the cookies in the Application panel (10 minutes)

Open DevTools before logging in, so that the **Network** tab records from the start (Concept 2).

1. On the **Network** tab, make sure the request type button **All** (the default, next to **Fetch/XHR**, **Doc**, and others) is selected, so that the *preflight* shows too. Clear the old rows with **Clear network log**, the circle-with-a-slash icon to the right of the red record button (**Ctrl + L**; macOS: **Cmd + K**).
2. Type `viewer@home.test` in the **Email** box, then paste the password of the Module 20 `viewer` account into the **Password** box: from your password manager, or the `VIEWER_PASSWORD` value in `backend/bruno/.env` (without quotes). The `viewer` account is enough for a dashboard that only looks; get used to using the smallest permission that's enough.
3. Click **Log in**.

**Result:** the button briefly says `Logging in…` and can't be pressed (the backend deliberately checks the password with slow bcrypt, Module 20), then the form is replaced by the heading `Mini Smart Home`, the greeting `Hello, Home Guest! You're logged in as viewer.` (holding the name of your `viewer` account from Module 20), and the six example cards. The backend terminal writes (**example**; the clock and the numbers differ on your laptop):

```text
[23:08:26] INFO: OPTIONS /auth/login -> 204 (1 ms)
[23:08:26] INFO: login: account 2 (viewer), session 8, IP 127.0.0.1
[23:08:26] INFO: POST /auth/login -> 200 (304 ms)
```

Now check three pieces of evidence.

**First evidence: the Network tab.** There are **two** rows named `login` (Edge may add a row starting with `data:image/svg+xml`; ignore it):

| **Status** | **Type** | What it means |
| :--- | :--- | :--- |
| `204` | `preflight` | `OPTIONS`: the browser first asks (without cookies) whether `http://localhost:5173` may send a `POST` with JSON |
| `200` | `fetch` | `POST`: the actual login; the **Initiator** column points to `api.ts:29`, the `fetch` line in `request()` |

The `fetch` row may show **above** `preflight` (in the author's Chrome and Edge), even though the *preflight* sets off first. Only one row? Make sure **All** is selected: the `preflight` type is hidden when **Fetch/XHR** is selected. Repeating the login within about 5 seconds can also go without a *preflight*, because the browser still remembers its answer (Concept 9).

Click the `preflight` row, then the **Headers** tab. Under `Request headers`, the browser states its intention (`Access-Control-Request-Method` `POST`); under `Response headers`, the backend gives permission from Module 20's `CORS_ORIGIN` (`Access-Control-Allow-Origin` `http://localhost:5173`, `Access-Control-Allow-Credentials` `true`).

Then click the `fetch` row:

- **Headers** tab: `Response headers` holds two `Set-Cookie` headers, the wristband `access=…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict` and the season pass `session=…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict`, plus the same CORS permission (without that permission, the browser doesn't hand the response to `api.ts` and doesn't store its cookies). `X-Ratelimit-Limit` `10` is the limit of logins per minute (4.5).
- **Payload** tab: what your form sent, `email` and `password`.
- **Response** (or **Preview**) tab: your account's profile.

**Expected output** (**example**; `id` and `name` follow your account):

```json
{"id":2,"email":"viewer@home.test","name":"Home Guest","role":"viewer"}
```

There's no token in the content: the wristband and the season pass only come through `Set-Cookie`, as in Bruno (Module 20).

> [!WARNING]
> **DevTools shows your secrets as they are.** The **Payload** tab shows your password without dots, while `Set-Cookie` and the **Application** panel show the contents of your wristband and season pass. Don't take pictures of them or paste them into a group chat when you ask for help, just like Bruno's **Cookies** window in Module 20. That password also travels in plain text to the backend, although only inside your laptop; HTTPS only comes in Module 27.

**Second evidence: the Application panel** (the **Application** tab; if you can't see it, click **»**). In the list on the left, in the **Storage** group (not the **Storage** item in the **Application** group above it), open **Cookies**, then click `http://localhost:5173`.

**Result (example):** without the **Value** column and a few other columns.

| Name | Domain | Path | Expires / Max-Age | Size | HttpOnly | SameSite |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `access` (wristband) | `localhost` | `/` | `2026-10-23T16:23:26.886Z` | `181` | ✓ | `Strict` |
| `session` (season pass) | `localhost` | `/auth` | `2026-10-30T16:08:26.886Z` | `50` | ✓ | `Strict` |

The times are in UTC (the `Z` ending): `16:23:26` UTC = 23:23:26 WIB, 15 minutes after logging in. The cookies from `localhost:8080` show up under `http://localhost:5173`, because cookies aren't separated by port (Concept 9). The **Value** column (and `Cookie Value` below the table when a row is clicked) holds tokens that are still valid: don't let them end up in a picture.

**Third evidence: the Console tab.** Type `document.cookie`, then press **Enter**.

**Result:** `''`, a pair of single quotes with nothing inside. `HttpOnly` cookies aren't visible to JavaScript: the browser holds them and attaches them, not the dashboard's code.

**You pass this ⭐ step** when you see these three things: the greeting holds your account's name; on the **Network** tab, `POST /auth/login` (the `fetch` row) has status 200, usually preceded by an `OPTIONS` *preflight* with status 204; and on the **Application** panel, the cookies `access` and `session` are marked **HttpOnly**.

> [!NOTE]
> **The greeting appears, but the Cookies table is empty?** Almost certainly the host name in `VITE_API_BASE` (`.env.local`) is different from the page's host name, so the browser refuses `SameSite=Strict` cookies from another site (Concept 9); from Practice 5 on, the result is a login loop. Open `http://localhost:5173`, delete `.env.local` if there is one, then restart Vite ([🚨](#-troubleshooting)).

Finally, try the weakness recorded in the `App.tsx` comment: reload the page with **F5** (macOS: **Cmd + R**).

**Result:** the login form is empty again, even though the **Cookies** table still holds `access` and `session`. Reloading starts `App` from scratch (the `user` board goes back to `null`), and the dashboard can't peek at `HttpOnly` cookies, so it has to **ask the backend**: `GET /auth/me` in Practice 5.

#### 4.5 A wrong password (401) and a stopped backend: messages people understand (8 minutes)

Try the two most common failures, with DevTools still open.

**A wrong password.**

1. Type `viewer@home.test` in the **Email** box and an obviously wrong password in the **Password** box, for example `not the right password` (you can type it in directly; it's nobody's secret).
2. Click **Log in**.

**Result:** `Logging in…` briefly, then the pink box says `wrong email or password`. On the **Network** tab, the `login` row of type `fetch` has status `401`; the **Console** tab records one red line `POST http://localhost:8080/auth/login 401 (Unauthorized)` with `api.ts:29` at its far right. The backend terminal writes `WARN: login failed: account 2 (IP 127.0.0.1)` and `POST /auth/login -> 401`.

The capture below sums up the four states of the login form: empty, wrong password, backend down (in a moment), and session expired (Practice 6):

![Composite of four real screenshots of the dashboard v0.1 login form in Microsoft Edge at a laptop width of 1280 px, connected to the real backend v1.0 from Module 21; title: The dashboard v0.1 login form: empty, and three error messages. Every panel shows the same white card: the heading Mini Smart Home, the sentence Log in with your Module 20 account to see the dashboard., the Email box, the Password box, and the teal Log in button. Top left, Empty, when first opened: the Email box holds the gray text viewer@home.test, which is only an example, marked 1. Top right, Wrong password: the email admin@home.test, the password shown as dots, and a pink box saying wrong email or password, marked 2. Bottom left, Backend down when the page opens: a pink box holding Can't reach the server at http://localhost:8080. Maybe the backend isn't running yet, or this page was opened from an address the backend doesn't allow (open http://localhost:5173, see CORS_ORIGIN)., marked 3. Bottom right, Session expired in the middle of use: a pink box saying Your session has expired. Please log in again., marked 4. The key: 1 an empty box, the gray text is only an example, that is a placeholder, not content, and required blocks an empty form; 2 wrong password (401), the message field from the backend shown as it is, email and password not told apart; 3 total failure (code 0) has two possibilities, the backend is down or the page address is not allowed (CORS_ORIGIN); 4 session expired because even the refresh is refused, the screen goes back to the form with just one message box.](assets/dashboard-login.png)

The sentence `wrong email or password` is written by the backend in the `message` field, the same for a wrong email and a wrong password (Module 20), so that a visitor can't guess which email has an account. The red line in the **Console** is only the browser's standard note for a response with an error code, **not** a sign that your code is broken. The message always shows in **one** box: every click on **Log in** clears the old message first (`setError(null)`), and the message that `App` hands down in Practice 5 goes into that box too.

Two other messages use the same `message` field, in Fastify's built-in error shape; just recognize them, no need to try them:

- **`body/email invalid email`** (400): an email like `admin@home` passes the browser's check, but the Zod checker in the backend refuses it. The message is shown raw, with the technical prefix `body/email` (the `email` field in the request body); the code deliberately leaves it that way.
- **`too many attempts: try again in N seconds`** (429), Module 20's login hourglass: from the 11th attempt within a minute from the same laptop, and **successful** logins count too. `N` is the number of seconds left, for example `54` in the author's run.

**The backend is down.**

3. In the backend terminal, press **Ctrl + C**. Docker, the broker, and the simulator stay on.
4. In the dashboard, type the correct `viewer` password, then click **Log in**.

**Expected output:** one pink box holding the code-0 message from `api.ts`:

```text
Can't reach the server at http://localhost:8080. Maybe the backend isn't running yet, or this page was opened from an address the backend doesn't allow (open http://localhost:5173, see CORS_ORIGIN).
```

The **Console** tab writes `POST http://localhost:8080/auth/login net::ERR_CONNECTION_REFUSED`: no program answers on port 8080. On the **Network** tab, both `login` rows are red; in Chrome, their **Status** column says `(failed) net::ERR_CONNECTION_REFUSED`.

Why two possibilities? If the backend is running but the page's address isn't listed in `CORS_ORIGIN`, the screen shows exactly the same message (the author tried it). For security, the browser doesn't tell JavaScript **why** a cross-origin request failed; the details are only in the **Console** tab ([MDN: CORS errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors)). So every time the code-0 message appears, open the **Console** tab: `net::ERR_CONNECTION_REFUSED` means the backend is down or the port is wrong, while `has been blocked by CORS policy` means the page's origin was refused ([🚨 Troubleshooting](#-troubleshooting)).

5. Start the backend again with `npm run dev` (or **↑**, then **Enter**), then wait for `Server listening at http://127.0.0.1:8080`.
6. Click **Log in** again. The pink box disappears (`handleSubmit()` empties the `error` board before trying), and the greeting appears without reloading the dashboard.

#### 4.6 Save to the branch (7 minutes)

In the empty terminal (the `frontend` folder, the `feature/dashboard` branch from Practice 2), check the changes:

```text
git status
```

There are three new files under `Untracked files` (`.env.example`, `src/api.ts`, `src/components/Login.tsx`) and one changed file (`src/App.tsx`). `.env.local` doesn't appear, because the template's `.gitignore` ignores files ending in `.local`. Then save:

```text
git add .env.example src/api.ts src/components/Login.tsx src/App.tsx
git commit -m "Login form and one door to the API (Module 22 Practice 4)"
```

The state of the code at the end of this practice is in [`code/stages/practice-4/frontend/`](code/stages/practice-4/frontend/). If you want to stop for now, stop every terminal with **Ctrl + C** (the database may stay on).

> ⬆️ **Done with Practice 4?** Your dashboard can log in now, but it forgets as soon as the page is reloaded. Go back to [Concept 8](#8-useeffect-and-fetch-fetching-data-after-the-screen-appears) and [Concept 10](#10-loading-error-and-empty-three-states-you-always-prepare-for), then continue to [Practice 5 — `useEffect`: who am I, and the device list](#practice-5--useeffect-who-am-i-and-the-device-list-60-minutes).

### Practice 5 — `useEffect`: who am I, and the device list (60 minutes)

> 🖥️ **Tools used:** **VS Code** with the Practice 4 terminals (backend v1.0 and Vite; on the laptop path also the broker and simulator) plus one free terminal in the `frontend` folder for `npm run lint` and Git; **Docker Desktop** (`smarthome-db` running); **Chrome or Edge** at `http://localhost:5173` with DevTools and the React DevTools **Components** tab. Concepts: 8, 10, and 9.

Practice 4 ended with one weakness: press **F5**, and the login form is empty again, even though your cookies are still stored. The dashboard can't peek at an `HttpOnly` cookie, so it has to **ask the backend**:

1. **`App` asks "who am I?"** (`GET /auth/me`), then picks a screen: login or the device list (5.1).
2. **`DeviceList`** shows `GET /devices` with `status` and `key` badges (Module 21's promise: a device whose key was revoked stands out, it doesn't pretend to be `online`), plus the loading, error, and empty states (5.2).
3. **The Network tab** proves `GET /devices` leaves twice in development mode (5.3).
4. **A simple Log out button** (5.4).

> [!NOTE]
> **Just opened your laptop again?** Start everything as in [Practice 4.1](#41-start-backend-v10-and-its-data-source-8-minutes), then open `http://localhost:5173`.

#### 5.1 Who am I? `App.tsx` asks `GET /auth/me` (15 minutes)

> [!NOTE]
> **The dashboard breaks for a while, and that's normal.** The new `App.tsx` uses `DeviceList`, which is only created in 5.2. As soon as `App.tsx` is saved, the browser shows a dark error box starting with `[plugin:vite:import-analysis] Failed to resolve import "./components/DeviceList"`, and the `frontend` terminal logs the same error. Ignore it for now; during 5.2 the page may switch between the error box and a white page. **F5** in 5.2 Step 3 fixes it.

**Step 1 — three new ticket booths in `src/api.ts`.** Open **`src/api.ts`**, then add the `Device` label to the `import type` line at the very top:

```ts
import type { Device, User } from "./types";
```

Also add these three functions at the very bottom, after `login()` (the whole file: [`code/stages/practice-5/frontend/src/api.ts`](code/stages/practice-5/frontend/src/api.ts)):

```ts
// GET /auth/me: "who am I?" Answered with 401 when not logged in.
export function whoAmI(): Promise<User> {
  return request<User>("/auth/me");
}

// POST /auth/logout: no body, so also NO JSON Content-Type (if one is given, the backend answers 400).
export function logout(): Promise<unknown> {
  return request<unknown>("/auth/logout", { method: "POST" });
}

// GET /devices: the device list from the backend's database
export function getDevices(): Promise<Device[]> {
  return request<Device[]>("/devices");
}
```

`whoAmI()` is the same as the **`who am i`** request in Bruno (Module 20). Each of the three takes one line thanks to the one door, `request()`: the cookies go along, and a 401, 404, or 500 becomes an `ApiError`. `logout()` has no body, so no `Content-Type` (the 400 trap, Concept 9); its answer isn't used, so it's labeled `Promise<unknown>` ("contents not known yet").

**Step 2 — `Login` takes a message from `App`.** Open **`src/components/Login.tsx`**, then change three things (the whole file: [`code/stages/practice-5/frontend/src/components/Login.tsx`](code/stages/practice-5/frontend/src/components/Login.tsx)):

1. In `type Props`, above the `onLogin` line, add:

   ```tsx
     initialError: string | null; // a message from App (for example backend down or session expired), shown before logging in
   ```

2. In the line `export default function Login(…)`, replace `{ onLogin }` with `{ initialError, onLogin }`.
3. The starting value of the `error` whiteboard changes from `null` to `initialError`:

   ```tsx
     const [error, setError] = useState<string | null>(initialError); // its starting value comes from App; replaced on a login try
   ```

`initialError` is handed down from `App`: a message shown **before** you try to log in. A whiteboard may take its starting value from what is handed down (Concept 7). Its box is the same as the wrong-password box, and `handleSubmit()` empties it every time **Log in** is pressed, so messages don't pile up (Practice 4.5).

**Step 3 — `App` asks "who am I?".** Almost all of `src/App.tsx` changes. Open [`code/stages/practice-5/frontend/src/App.tsx`](code/stages/practice-5/frontend/src/App.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/App.tsx` (**Ctrl + A**, then **Ctrl + V**). Read it from the top:

```tsx
  // "loading" = asking the backend; null = not logged in; an object = logged in
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [initialError, setInitialError] = useState<string | null>(null); // a problem other than 401, written above the form
```

- **One whiteboard, three possible contents**; its label is a union of choices, like `DeviceStatus` (Concept 6). Its starting value is deliberately `"loading"`: if it were `null`, the login form would flash for a moment every time the page reloads.
- **An effect with `[]`: ask once, after the screen appears** (`Loading…` is drawn first). The pattern is the effect from Concept 8, including the `ignore` cleanup; the list is `[]` because this effect reads no props or whiteboards. The difference is in `.catch`:

```tsx
      .catch((err) => {
        if (ignore) return;
        // 401 = simply not logged in: just show the form. Anything else (backend or database down): say so.
        if (!(err instanceof ApiError && err.code === 401)) {
          setInitialError(err instanceof ApiError ? err.message : "Couldn't check the login.");
        }
        setUser(null);
      });
```

- **Only 401 means "not logged in".** `!` means "not": an error other than 401, for example the backend down (code 0) or the database down (500), is written to `initialError`. Without this distinction, a stopped backend looks like "not logged in", and you might think your password is wrong (Concept 10).
- **Events flow up.** `handleLogin` (handed to `Login` as `onLogin`) clears the old message, then fills the `user` whiteboard; `handleSessionExpired` (handed to `DeviceList` as `onSessionExpired`) writes `Your session has expired. Please log in again.` to `initialError`, then goes back to the form. The child only reports; the board is changed by its owner (Concept 6).
- **Three `return`s, three screens:** `Loading…`; `Login` with `initialError`; or the page header (heading, account, **Log out** button) and `DeviceList` under the heading `Device List`. React Router only comes in Module 24. `SensorCard.tsx` is kept for Practice 6.

Save the three files (**Ctrl + S**), then continue to 5.2.

#### 5.2 The device list: `Badge.tsx` and `DeviceList.tsx` (20 minutes)

**Step 1 — small badges: `Badge.tsx`.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`Badge.tsx`**, then type:

```tsx
// Badge.tsx - small colored badges for a device's status and key.
// Used in the device list (Practice 5) and next to the device details heading (Practice 6).
import type { DeviceStatus, KeyStatus } from "../types";

// The Tailwind classes are written WHOLE here, not joined ("bg-" + color): Tailwind only makes classes that are written in full.
const STATUS_COLORS: Record<DeviceStatus, string> = {
  online: "bg-green-100 text-green-800",
  offline: "bg-slate-200 text-slate-700",
  "offline-mode": "bg-amber-100 text-amber-800",
  unknown: "bg-slate-100 text-slate-500",
};

// The text and color for every value of the key field (Module 21).
const KEY_BADGES: Record<KeyStatus, { text: string; color: string }> = {
  active: { text: "key active", color: "bg-teal-50 text-teal-800" },
  revoked: { text: "key revoked", color: "bg-red-600 text-white" }, // the most eye-catching one
  "no-key": { text: "via linking device", color: "bg-sky-50 text-sky-800" }, // Node 2: its data is forwarded by Node 1
  unregistered: { text: "not registered", color: "bg-amber-100 text-amber-800" },
};

const SHAPE = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function StatusBadge({ status }: { status: DeviceStatus }) {
  return <span className={SHAPE + " " + STATUS_COLORS[status]}>{status}</span>;
}

export function KeyBadge({ keyStatus }: { keyStatus: KeyStatus }) {
  const { text, color } = KEY_BADGES[keyStatus];
  return <span className={SHAPE + " " + color}>{text}</span>;
}
```

- **Two small bricks in one house**, exported **by name** (`export function …`), so they're imported with curly braces: `import { KeyBadge, StatusBadge } from "./Badge";`. There's only one `default` export per file; named exports can be many. A single prop may be labeled directly: `{ status }: { status: DeviceStatus }`.
- **`STATUS_COLORS`** holds whole Tailwind classes for the four `status` values (Concept 6), including `unknown` (no `status` message ever). Joining two strings of whole classes (`SHAPE + " " + STATUS_COLORS[status]`) is safe; cutting a class name (`"bg-" + color`) isn't.
- **`KEY_BADGES`** gives every value of the `key` field (Module 21) its own text and color:

| `key` | Badge | Color | Meaning (Module 21) |
| :--- | :--- | :--- | :--- |
| `active` | `key active` | pale teal | registered, with its own key |
| `revoked` | `key revoked` | **solid red** | its key was revoked; its messages are ignored |
| `no-key` | `via linking device` | light blue | Node 2, its data is forwarded by Node 1 over ESP-NOW |
| `unregistered` | `not registered` | yellow | never registered through `POST /devices`; its messages are ignored |

`revoked` is deliberately the only badge with a dark background: it's the most important news in the list. The file is separate because `KeyBadge` is used again in the device details (Practice 6).

**Step 2 — `DeviceList.tsx`.** Right-click the **`frontend/src/components`** folder again → **New File…**, name it **`DeviceList.tsx`**, then type:

```tsx
// DeviceList.tsx - fetches GET /devices, then shows the answer as device cards.
// Three states are always prepared: loading, error, and empty (the pattern every screen that fetches data uses).
import { useEffect, useState } from "react";
import { ApiError, getDevices } from "../api";
import type { Device } from "../types";
import { KeyBadge, StatusBadge } from "./Badge";

type Props = {
  onSessionExpired: () => void; // called if the backend answers 401 (not logged in or session expired)
};

export default function DeviceList({ onSessionExpired }: Props) {
  const [devices, setDevices] = useState<Device[] | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);

  // Fetch the data AFTER the screen appears. In development mode, StrictMode runs this effect twice (normal).
  // [onSessionExpired] at the end of the effect: the effect uses that callback handed down from App, so it must be listed
  // (npm run lint warns if it's forgotten). While the list is shown, App's state doesn't change, so the effect doesn't repeat.
  useEffect(() => {
    let ignore = false; // becomes true when the effect is cleaned up: an answer that arrives late is ignored
    getDevices()
      .then((list) => {
        if (!ignore) setDevices(list);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return onSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the devices.");
      });
    return () => {
      ignore = true; // cleanup: React runs it before the effect repeats or when this component leaves the screen
    };
  }, [onSessionExpired]);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>;
  if (devices === null) return <p className="text-slate-500">Loading devices…</p>;
  if (devices.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600">No registered devices yet (registering devices: Module 21).</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {devices.map((p) => (
        // key = the name tag of each list item; device_id is always unique
        <li key={p.device_id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {/* the name and location are filled in by the admin through the API; JSX shows them as plain text, so HTML code inside them is not run (safe from XSS) */}
            <span className="font-semibold text-slate-800">{p.name ?? p.device_id}</span>
            <span className="flex gap-1">
              {/* a revoked key or an unregistered device = the backend ignores its messages, so its old status
                  (possibly still "online") is misleading and isn't shown */}
              {p.key === "revoked" || p.key === "unregistered" ? null : <StatusBadge status={p.status} />}
              <KeyBadge keyStatus={p.key} />
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {p.location ?? "no location yet"} · <span className="font-mono">{p.device_id}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
```

The effect is the example from Concept 8, complete with the `ignore` cleanup. The rest:

- **A 401 doesn't become a red box**: `return onSessionExpired();` reports to `App`. The checks go in order: error, loading (`devices` still `null`), empty, and only then the content (Concept 10).
- **`[onSessionExpired]`, not `[]`**, because the effect uses that callback; if it's deleted, `npm run lint` warns about it (`exhaustive-deps`). The effect still doesn't repeat, because `handleSessionExpired` doesn't change while the list is shown.
- **`key={p.device_id}`** is each card's unique name tag (Concept 5). Don't confuse it with the device field `key` (its key status, Module 21): the two have nothing to do with each other, which is why the badge prop is called `keyStatus`, never `key`. **`??`** fills in a field that's `null`: no name, and the heading is the `device_id`; no location, and it says `no location yet`.
- **A revoked key or an unregistered device: no status badge.** `p.key === "revoked" || p.key === "unregistered" ? null : <StatusBadge status={p.status} />`. The backend ignores messages from both, so their stored `status` can't be trusted: an old status from Modules 16–20 may still be `online`, and a device whose account is revoked is disconnected by the broker without an `offline` will (Module 21). Go by the `key` field.
- **Text from the API stays text**: JSX escapes `name` and `location`, so HTML inside them isn't run (Concept 5). Never replace it with `dangerouslySetInnerHTML`.
- **`grid-cols-2`** is deliberately written for a laptop; on a phone the cards are cramped until Practice 7.

Save both files. The 5.1 error box is gone, but the page may still be white, and the **Console** may hold a red line `does not provide an export named 'default'` (from when `DeviceList.tsx` was still empty). **F5** in Step 3 clears it.

**Step 3 — try it.**

1. **Press F5** at `http://localhost:5173`. `Loading…` shows for a moment, then the **device list** appears without typing a password, if the Practice 4 wristband (15 minutes) is still valid. If it has run out, you get the **login form without a message** (the refresh only comes in Practice 6): log in with `viewer@home.test`; the button briefly says `Logging in…`, then the page header appears with `Loading devices…`.

**Result** (**example**; the contents depend on the devices you registered in Module 21): a white page header with `Mini Smart Home` on the left, `Home Guest (viewer)` and the **Log out** button on the right; below it, the heading `Device List` and white cards, two per row, ordered by `device_id` (Node 2, `246f…`, before Node 1, `a4cf…`). The image below was taken with the admin account on the module's final code, whose **Log out** button was already made bigger in Practice 7; the list and badges are the same:

![Real screenshot of the dashboard v0.1 Device List screen in Microsoft Edge at a laptop width of 1280 px, with five rows from GET /devices of the real backend v1.0 from Module 21; title: The Device List from GET /devices: status badges and key badges. The page header: Mini Smart Home on the left; on the right Home Admin (admin) and the Log out button, marked 7. Below it the heading Device List and five cards in two columns, in device_id order. Card 1, Node 2 garden, a green online badge and a light blue via linking device badge (marked 3), then the small line garden · 246f28b1c7d4 with the device_id in monospace (marked 6). Card 2, Node 1 living room, an online badge (marked 1) and a key active badge (marked 2), living room · a4cf12e5b7c0. Card 3, Test device (intruder), only one solid red key revoked badge (marked 4), workbench · c0ba00000001. Card 4, Practice living room, online and key active, living room · f00d00000001. Card 5, Practice porch, only a yellow not registered badge (marked 5), porch · f00d00000002. The key: 1 online is the status badge, the device's latest news over MQTT, stored by the backend; 2 key active is the key badge from Module 21, meaning registered with a valid key; 3 via linking device means no-key, Node 2 has no key and Node 1 forwards its data; 4 key revoked is red with no status badge, because the backend ignores its messages and its old status is hidden; 5 not registered has no status badge either, f00d00000002 was not registered in Module 21; 6 the device_id in monospace after the location, and the card order is the device_id order from the backend; 7 the account name, the role, and the Log out button, still minimal and polished in Module 24.](assets/dashboard-device-list.png)

| Card | Small line under the name | Badges |
| :--- | :--- | :--- |
| `Node 2 garden` | `garden · 246f28b1c7d4` | `online` (green) and `via linking device` |
| `Node 1 living room` | `living room · a4cf12e5b7c0` | `online` (green) and `key active` |
| `Test device (intruder)` | `workbench · c0ba00000001` | only `key revoked` (red) |
| `Practice living room` | `living room · f00d00000001` | `online` (green) and `key active` |
| `Practice porch` | `porch · f00d00000002` | only `not registered` (yellow) |

`Test device (intruder)` (Module 21 Practice 6, whose key you revoked in Practice 7.5) carries only the red badge: Module 21's promise is kept. `Practice porch` is deliberately not registered. **Your list may differ:** on the laptop path, Node 1 and Node 2 are only there if you registered them back then, and old rows such as `beef00000001` (the Module 18 load test) show `not registered`.

2. **Press F5 once more.** **Result:** `Loading…` for a moment, the page header with `Loading devices…`, then the same list, with no form. The Practice 4 weakness is fixed. Want to peek? In the React DevTools **Components** tab, click `DeviceList`: in the right panel, under **hooks**, the first `State` row holds the device array from the backend.

3. **The backend is down when the dashboard opens.** In the backend terminal, press **Ctrl + C**, then press **F5** in the browser.

**Result:** the login form with one pink box, **before** you type anything, holding the code 0 message from Practice 4.5: `Can't reach the server at http://localhost:8080. Maybe the backend isn't running yet, …`. The **Console** tab logs two red lines `GET http://localhost:8080/auth/me net::ERR_CONNECTION_REFUSED`. This is `initialError`: the error isn't a 401, so the problem is in the backend, not your password. Pressing **Log in** now doesn't add a second box.

Start the backend again (`npm run dev`, wait for `Server listening at http://127.0.0.1:8080`), then press **F5**: the device list is back, as long as your wristband hasn't run out.

4. **Two states you haven't seen yet:** the empty list (only if the `devices` table is empty) and the list's error box (the backend has a problem while the list is fetched; in Practice 6, stop the backend before going back from the details). Both are in the Concept 10 picture.

#### 5.3 Two `GET /devices` in the Network tab (8 minutes)

Prove Concept 8's promise: in development mode, every effect runs twice.

1. Open DevTools (**F12**), the **Network** tab, then choose **Fetch/XHR** in its top bar (it only filters the view down to the dashboard's `fetch` requests). Empty it with **Clear network log** (Practice 4.4).
2. Press **F5**.

**Result:** four rows with status `200` and Type `fetch`: two `me` rows, then two `devices` rows. If the login form shows instead (both `me` rows `401`), your wristband has run out; log in again, and the two `devices` rows appear after `login`.

Two `me` from `App`'s effect, two `devices` from `DeviceList`'s effect: `StrictMode` mounts, unmounts, then mounts **every** component again when it first appears. `devices` only leaves after `me` is answered, because `DeviceList` is only drawn once `App` knows who you are.

Click one of the `devices` rows:

- **Headers**: the **Response headers** part holds `Access-Control-Allow-Origin` `http://localhost:5173` and `Access-Control-Allow-Credentials` `true`, the same CORS permission as the login answer in Practice 4.4.
- **Cookies**: only `access` is sent. `session` doesn't go along because its `Path=/auth` doesn't cover `/devices` (Concept 9); tick **Show filtered-out request cookies** to see it as a yellow row whose path doesn't match.
- **Response** (or **Preview**): the same JSON array as **`device list`** in Bruno.

The backend terminal logs everything twice as well. **Expected output** (**example**: the author's backend log for the same F5):

```text
[23:20:42] INFO: GET /auth/me -> 200 (3 ms)
[23:20:42] INFO: GET /auth/me -> 200 (3 ms)
[23:20:42] INFO: GET /devices -> 200 (3 ms)
[23:20:42] INFO: GET /devices -> 200 (3 ms)
```

No `OPTIONS` line: a `GET` without extra headers doesn't trigger a *preflight* (Concept 9).

> [!NOTE]
> **Two requests are normal, and only happen in the kitchen.** The React documentation calls two `fetch`es in the **Network** tab normal in development mode. In the author's backend log, `GET /auth/me` and `GET /devices` are logged twice with `npm run dev`, but once in the build (`npm run preview`); you prove it in Practice 8. Don't remove `<StrictMode>` for a tidier **Network** tab; the reason is in [🔬 Technical Deep Dive](#-technical-deep-dive-optional).

#### 5.4 The Log out button (8 minutes)

The code is already in the `App.tsx` you pasted in 5.1:

```tsx
  // A minimal Log out button (improved in Module 24): delete the session in the backend, then go back to the form.
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // the backend doesn't answer: the screen still goes back to the login form
    }
    setUser(null);
  }
```

`logout()` knocks on `POST /auth/logout`: the backend deletes your session and tells the browser to throw away both cookies. If the backend doesn't answer, the code 0 `ApiError` is caught by a `catch` that holds only a comment (no unhandled error in the **Console**), then `setUser(null)` still shows the form.

1. With the **Network** tab (**Fetch/XHR**) open, click **Log out**. **Result:** an empty login form, with no message box, and one new row, `logout`, with status `200`. The backend log below has no `OPTIONS`: a `POST` without a body and without `Content-Type` doesn't trigger a *preflight* (Concept 9).
2. Click the `logout` row, then check:
   - **Response**: `{"message":"logged out"}`.
   - **Headers**: **Response headers** hold two empty `Set-Cookie`s with `Max-Age=0` ("throw it away now") and an `Expires` already in the past. **Expected output:**

     ```text
     access=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
     session=; Max-Age=0; Path=/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
     ```

   - **Cookies**: this time `access` **and** `session` are sent, because `/auth/logout` is under `Path=/auth`; the backend needs that season pass to know which session to end.
3. Open the **Application** panel → **Cookies** → `http://localhost:5173`. **Result:** the table is empty.
4. Press **F5**. **Result:** the login form without a message. Both `me` rows have status `401`, and the **Console** tab logs two red lines `GET http://localhost:8080/auth/me 401 (Unauthorized)`: the browser's own notes, not damage (Practice 4.5).

The backend log records your logout. **Expected output** (**example**; `session 13` is the session number in the database):

```text
[23:20:51] INFO: logout: session 13
[23:20:51] INFO: POST /auth/logout -> 200 (4 ms)
```

> [!NOTE]
> **A minimal Log out, improved in Module 24.** This button can only clear the cookies if the backend answers. If the backend is down when you click **Log out**, the screen still goes back to the form (the **Console** only logs one red line containing `net::ERR_CONNECTION_REFUSED`), but both cookies stay stored, so once the backend is up again, **F5** can take you straight back to the list as long as the wristband hasn't run out. Protected routes and a more complete logout come in Module 24.

#### 5.5 Check, then save to the branch (9 minutes)

In the free terminal (`frontend` folder), run the code checker:

```text
npm run lint
```

**Result:** no warnings or errors (the output is discussed in Practice 8.1). An `exhaustive-deps` warning means an effect uses a value you forgot to write in the list at its end.

Then run `git status`: there are two new files under `Untracked files` (`src/components/DeviceList.tsx` and `src/components/Badge.tsx`) and three changed files (`src/App.tsx`, `src/api.ts`, and `src/components/Login.tsx`). Save all five:

```text
git add src/api.ts src/App.tsx src/components/Login.tsx src/components/Badge.tsx src/components/DeviceList.tsx
git commit -m "Who am I, device list, and Log out button (Module 22 Practice 5)"
```

The state of the code at the end of this practice is in [`code/stages/practice-5/frontend/`](code/stages/practice-5/frontend/); compare your files with it if something doesn't work. Leave everything running if you go straight on to Practice 6.

> ⬆️ **Done with Practice 5?** Your dashboard now remembers who you are, shows every device with its badges, and has a **Log out** button. Its cards can't be tapped yet. Continue to [Practice 6 — Device details: the latest readings of all the sensors](#practice-6--device-details-the-latest-readings-of-all-the-sensors-60-minutes), where every card opens its device's latest reading.

### Practice 6 — Device details: the latest readings of all the sensors (60 minutes)

> 🖥️ **Tools used:** **VS Code** with the Practice 4–5 terminals (backend v1.0 in the `backend` folder, Vite in the `frontend` folder, one free terminal in `frontend` for Git; laptop path: the broker in `edge` and the simulator in `tools`), **Docker Desktop** (the `smarthome-db` container running), **Chrome or Edge** with DevTools (the **Network** and **Console** tabs, the **Application** panel) and React DevTools, and **Bruno** to check the numbers. Concepts used: Concepts 8, 9, and 10.
>
> ⭐ **Required** — step 6.4: all of one device's sensors appear from the API, and their numbers match the `GET /devices/:id/latest` answer in Bruno exactly.

This practice adds the **device details** screen: tap a device, the dashboard requests `GET /devices/:id/latest`, then puts in one `SensorCard` (the Practice 3 mold, unchanged) for every reading from the API. You also prepare the "no reading yet" state (404) and keep Module 20's promise: **refresh once** in `api.ts`, so a wristband that runs out every 15 minutes doesn't throw you back to the login form. This is the first half of the pass requirement: **after logging in, the dashboard shows the latest readings of all the sensors from the API** (neat on a phone follows in Practice 7).

Make sure the backend, the data source, and Vite are running as in 4.1, open `http://localhost:5173`, then log in with the `viewer` account if asked.

#### 6.1 The details screen: `src/components/DeviceDetails.tsx`, then connect it to the list (20 minutes)

**Step 1 — A new ticket booth in `api.ts`.** Open `src/api.ts`. Add `LatestReading` to the `import type` line at the very top:

```ts
import type { Device, LatestReading, User } from "./types";
```

Then add this function at the very bottom of the file, below `getDevices()`:

```ts
// GET /devices/:id/latest: one device's latest reading, from the backend's memory
// (404 if that device hasn't sent a reading since the backend started)
export function getLatest(deviceId: string): Promise<LatestReading> {
  return request<LatestReading>("/devices/" + deviceId + "/latest");
}
```

Its answer, `LatestReading` (Practice 3), holds only `device_id`, `kind`, `status`, and `telemetry`, **without** the name, location, or `key`; those three are only in the `GET /devices` answer.

**Step 2 — A new component.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`DeviceDetails.tsx`**, then type the code below (or open [`code/stages/practice-6/frontend/src/components/DeviceDetails.tsx`](code/stages/practice-6/frontend/src/components/DeviceDetails.tsx) on GitHub, click **Copy raw file**, then paste it):

```tsx
// DeviceDetails.tsx - the latest reading of ALL of one device's sensors (GET /devices/:id/latest), one SensorCard per field.
// The cards that appear follow the device kind (Node 1 or Node 2) and the fields that were really sent (Appendix A).
import { useEffect, useState } from "react";
import { ApiError, getLatest } from "../api";
import type { Device, LatestReading, TelemetryNode1, TelemetryNode2 } from "../types";
import SensorCard from "./SensorCard";
import { KeyBadge } from "./Badge";

// the content of one card: the same shape as SensorCard's props
type Card = { label: string; value: number | string | null; unit?: string; color?: string };

function cardsNode1(t: TelemetryNode1): Card[] {
  const cards: Card[] = [
    { label: "Temperature", value: t.temperature, unit: "°C", color: "text-teal-600" },
    { label: "Humidity", value: t.humidity, unit: "%" },
    { label: "Light", value: t.light, unit: "/4095" },
    { label: "Soil moisture", value: t.soil, unit: "%" },
    { label: "Motion", value: t.motion ? "Yes" : "No", color: t.motion ? "text-amber-600" : undefined },
    { label: "Water tank", value: t.water_level, unit: "%" },
  ];
  // The RS-485 soil sensor (Module 15) is only there if it's fitted; its three fields always come together (rule 11).
  if (t.soil_rs485 !== undefined) {
    cards.push(
      { label: "RS-485 soil", value: t.soil_rs485, unit: "%" },
      { label: "Soil temperature", value: t.soil_temperature ?? null, unit: "°C" },
      { label: "Soil EC", value: t.ec ?? null, unit: "µS/cm" },
    );
  }
  // The actuator state is only SHOWN; its control buttons are only made in Module 24.
  if (t.state !== undefined) {
    cards.push(
      { label: "Lamp", value: t.state.lamp ? "On" : "Off", color: t.state.lamp ? "text-amber-600" : undefined },
      { label: "Fan", value: t.state.fan ? "On" : "Off", color: t.state.fan ? "text-teal-600" : undefined },
    );
  }
  return cards;
}

function cardsNode2(t: TelemetryNode2): Card[] {
  const cards: Card[] = [
    { label: "Temperature", value: t.temperature, unit: "°C", color: "text-teal-600" },
    { label: "Humidity", value: t.humidity, unit: "%" },
    { label: "Air pressure", value: t.pressure, unit: "hPa" },
    { label: "Soil temperature", value: t.soil_temperature, unit: "°C" },
    { label: "Soil moisture", value: t.soil, unit: "%" },
  ];
  // The battery meter is optional: if it isn't fitted, the field isn't there at all.
  if (t.battery !== undefined) {
    cards.push({ label: "Battery", value: t.battery, unit: "V" });
  }
  return cards;
}

// A device's ts is always UTC (the Z at the end). Show it as a WIB time whatever the laptop's time zone (en-GB = 24-hour clock).
function wibTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }) + " WIB";
}

type Props = {
  device: Device; // sent from the list: the name, location, and key are already there, no need to ask again
  onBack: () => void;
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

export default function DeviceDetails({ device, onBack, onSessionExpired }: Props) {
  const [reading, setReading] = useState<LatestReading | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);
  const [noReadingYet, setNoReadingYet] = useState(false); // 404: no reading yet since the backend started
  const id = device.device_id;

  // The starting values of the state above are already "clean" for one device. For another device, App sets key={device_id},
  // so React makes a new DeviceDetails with fresh state; this effect doesn't need to empty the state itself.
  // The dependency list at the end of the effect = every outside value the effect uses (npm run lint warns about forgotten ones).
  useEffect(() => {
    let ignore = false;
    getLatest(id)
      .then((b) => {
        if (!ignore) setReading(b);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return onSessionExpired();
        if (err instanceof ApiError && err.code === 404) return setNoReadingYet(true); // normal, not a fault
        setError(err instanceof ApiError ? err.message : "Couldn't load the reading.");
      });
    return () => {
      ignore = true;
    };
  }, [id, onSessionExpired]);

  // Pick ONE content to show under the heading: loading, error, no reading yet, or the cards.
  let content = <p className="mt-4 text-slate-500">Loading the reading…</p>;
  if (error !== null) {
    content = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>;
  } else if (noReadingYet) {
    // 404 = no reading in the backend's memory yet. Will a reading come? That depends on the key field (Module 21):
    // messages from a device that isn't registered or whose key was revoked are IGNORED by the backend, so waiting is pointless.
    let message = "No reading from this device since the backend started. Wait for its next message, then open it again.";
    if (device.key === "unregistered") {
      message = "This device isn't registered, so the backend ignores its messages (register it first, as in Module 21).";
    } else if (device.key === "revoked") {
      message = "There's no stored reading from this device, and no new reading will come while its key is revoked.";
    }
    content = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600">{message}</p>;
  } else if (reading !== null) {
    // kind tells the shape of its telemetry: node2 -> the Node 2 fields, anything else the Node 1 fields
    const cards =
      reading.kind === "node2"
        ? cardsNode2(reading.telemetry as TelemetryNode2)
        : cardsNode1(reading.telemetry as TelemetryNode1);
    // A revoked key or an unregistered device: the backend ignores its messages (Module 21), so the stored status
    // (possibly still "online") is misleading. The status isn't shown; "messages ignored" takes its place.
    const messagesIgnored = device.key === "revoked" || device.key === "unregistered";
    content = (
      <>
        <p className="mt-4 text-sm text-slate-500">
          {reading.kind} · {messagesIgnored ? "messages ignored" : reading.status} · updated at{" "}
          {wibTime(reading.telemetry.ts)}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {cards.map((k) => (
            <SensorCard key={k.label} label={k.label} value={k.value} unit={k.unit} color={k.color} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm font-medium text-teal-700 hover:underline">
        ← Back to the list
      </button>
      <div className="mt-2 flex items-center gap-2">
        <h2 className="text-xl font-semibold text-slate-800">{device.name ?? id}</h2>
        <KeyBadge keyStatus={device.key} />
      </div>
      <p className="text-sm text-slate-500">
        {device.location ?? "no location yet"} · <span className="font-mono text-xs">{id}</span>
      </p>
      {device.key === "revoked" ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          This device's key has been revoked: the backend ignores its messages. The reading below (if any) is the last
          one sent before the key was revoked.
        </p>
      ) : null}
      {content}
    </div>
  );
}
```

- **`cardsNode1()` and `cardsNode2()`** (plain functions, not components) turn `telemetry` into a `Card` array, shaped like `SensorCard`'s props; `cards.push(…)` adds cards only if their field is there. **`t.soil_rs485 !== undefined`** tells a field that **isn't there** (Module 15's RS-485 soil sensor isn't fitted: its three cards aren't made) from a field holding **`null`** (the sensor failed to read, rule 7: the card stays and shows "—"). The three RS-485 fields always come together (rule 11). `?? null` (warm-up Step 3) swaps `undefined` for `null`, which `value` accepts.
- **Motion, Lamp, and Fan** are turned from `true`/`false` into text with `? :`. Lamp and Fan are only **shown**; their buttons come in Module 24 (commands to a device need an `admin` account and extra safeguards). The pump and curtain cards are [🧩 Level 1](#-independent-challenges).
- **`wibTime()`**: a device's `ts` is always UTC (rule 1; the letter `Z` at its end), for example `2026-10-23T12:21:59Z`. The option `timeZone: "Asia/Jakarta"` in `toLocaleTimeString("en-GB", …)` writes it as a 24-hour WIB time with colons (`en-GB`; UTC + 7 hours), `19:21:59`, not the laptop's local time. The promise of Modules 10, 16, and 17 (local time is the dashboard's job) is kept here.
- **`type Props`**: `DeviceDetails` takes the **whole `Device` object** from the list, because the list already holds the name, location, and `key`. Events (`onBack`, `onSessionExpired`) flow up to `App` (Concept 6).
- **The effect** uses `DeviceList`'s pattern (`ignore`, a 401 to `onSessionExpired`) with one new branch: **a 404 turns on the `noReadingYet` whiteboard**, not `error` (Concept 10). `[id, onSessionExpired]` holds every outside value the effect uses; `npm run lint` warns about forgotten ones (Practice 8). There's no `setReading(null)` at the start of the effect: another device means a **new** `DeviceDetails` through `key` in `App` (Concept 8). An early version that emptied the state inside the effect got a `react(set-state-in-effect)` warning from `npm run lint` in the author's lab.
- **`let content`** starts as `Loading the reading…`, then is replaced by the error, the no-reading-yet note, or the cards; the error is checked first (Concept 10). **Its 404 message depends on `key`**: the Module 21 backend ignores messages from a device that isn't registered or is revoked, so telling you to wait for its reading means telling you to wait forever (the three messages are in 6.3). `reading.kind === "node2"` picks the card builder; `as TelemetryNode2` means "trust me, it's Node 2's shape", like `as T` in `request()`.
- **The small line above the cards**, for example `node1 · online · updated at 19:21:59 WIB`, holds the time **the device read its sensors**. `{" "}` is a space written out explicitly, because JSX drops spaces at the end of a line. **`messagesIgnored`**: for a `revoked` **or** `unregistered` key, the stored status (possibly still `online` from Modules 16–20) is replaced by `messages ignored`, like the `status` badge hidden in the list (Practice 5).
- **`cards.map`** puts in a `SensorCard` with `key={k.label}` (labels are never duplicated). `grid-cols-3` is narrow on a phone; fixed in Practice 7.
- **The heading** is `device.name ?? id` with `KeyBadge` (the same brick as in the list), then the location and `device_id` (`font-mono`) small underneath. API text inside `{ }` is escaped by JSX (Concept 5). A `revoked` key adds a red box (6.3).

**Step 3 — The list cards become buttons.** Open [`code/stages/practice-6/frontend/src/components/DeviceList.tsx`](code/stages/practice-6/frontend/src/components/DeviceList.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/components/DeviceList.tsx`. What changed: a new prop `onSelect: (device: Device) => void;` in `Props` (also in the function's parameters), and the contents of every `<li>` are now wrapped in a button:

```tsx
          <button
            type="button"
            onClick={() => onSelect(p)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-400 hover:shadow-md"
          >
```

- **`onClick={() => onSelect(p)}`** only calls `onSelect` when the card is clicked; `onClick={onSelect(p)}` would call it while the list is being drawn.
- **`<button type="button">`** can be tapped, clicked, or chosen with **Tab** then **Enter**, without submitting a form. Its contents are now `span`s, not `div` and `p`, because inside a `<button>` HTML only allows inline elements; the `block` class moves the location to a second line. `cursor-pointer` is written by hand, because Tailwind v4 no longer gives a `button` the pointer cursor automatically.

**Step 4 — `App` switches screens.** In the same way, replace the whole contents of `src/App.tsx` with [`code/stages/practice-6/frontend/src/App.tsx`](code/stages/practice-6/frontend/src/App.tsx). What's new: the `DeviceDetails` import, `Device` in `import type`, `type View = { name: "list" } | { name: "details"; device: Device };`, a third whiteboard `view`, and the screen choice inside `<main>`:

```tsx
          <DeviceDetails
            key={view.device.device_id}
            device={view.device}
            onBack={() => setView({ name: "list" })}
            onSessionExpired={handleSessionExpired}
          />
```

- **`type View`**: only the `"details"` choice carries a device; after `view.name === "list" ? … : …`, TypeScript knows `view.device` exists in the second branch.
- **`onSelect={(device) => setView({ name: "details", device })}`** opens the details; **← Back to the list** and `handleLogin()` bring back `{ name: "list" }`. The address stays `http://localhost:5173`; real routes such as `/devices/a4cf12e5b7c0` come with React Router in Module 24.
- **`key={view.device.device_id}`** (Concept 8): another device means a new component with clean whiteboards. To be honest: the details → list → details flow always makes a new details screen anyway; `key` stands guard for buttons that will later jump straight between devices.

Save all the files (**Ctrl + S**).

**Result:** the cursor becomes a pointer and the card's border turns teal on hover. Click **Node 1 living room**: `Loading the reading…` for a moment, then the `← Back to the list` button, the heading `Node 1 living room` with the `key active` badge, the line `living room · a4cf12e5b7c0`, the line `node1 · online · updated at 23:24:28 WIB` (your time will certainly differ), and eleven cards (eight without RS-485) in three columns. Laptop path: **Practice living room** shows `living room · f00d00000001` and eight cards.

In the **Network** tab, every time the details open, **two** `latest` rows with status `200` appear (`StrictMode`'s doing, Concept 8), with no *preflight*: a `GET` without extra headers is a simple request (Concept 9). After **← Back to the list**, two `devices` rows appear again: the new list fetches its data from scratch.

> [!NOTE]
> **Suddenly back at the login form with the box `Your session has expired. Please log in again.`?** Your wristband is past its 15 minutes, and `api.ts` can't refresh yet. Just log in again; step 6.5 fixes it.

#### 6.2 Node 1 and Node 2: different sensors, different cards (8 minutes)

`DeviceDetails` builds the cards from the fields that **really arrive** (Appendix A). Open the details of every device that sends data, one by one:

| Device | Cards shown |
| :--- | :--- |
| **Node 1** (device path) | `Temperature`, `Humidity`, `Light`, `Soil moisture`, `Motion`, `Water tank`; then `RS-485 soil`, `Soil temperature`, and `Soil EC` if the Module 15 RS-485 sensor is fitted; then `Lamp` and `Fan` |
| **Node 2** (device path) | `Temperature`, `Humidity`, `Air pressure`, `Soil temperature`, `Soil moisture`; then `Battery` if the battery meter is fitted |
| **Practice living room**, `f00d00000001` (laptop path) | the six Node 1 readings, then `Lamp` and `Fan`. The simulator doesn't imitate the RS-485 sensor, so its three cards don't appear. |

**Result (example):** Node 1 with the RS-485 sensor shows eleven cards. Node 2 shows six cards, the `via linking device` badge in its heading (its data is forwarded by Node 1, Module 21), and a small line starting with `node2`, for example `node2 · online · updated at 23:24:28 WIB`. `f00d00000001` shows eight cards.

Notice two things:

- **A missing card is different from a "—" card.** Node 1 without the RS-485 sensor has only eight cards, because those three fields aren't sent. A gray "—" card without a unit means its field was sent holding `null`. Node 2's `soil` may be `null` (contract 1.1), so Node 2's `Soil moisture` may show "—".
- **The numbers don't move by themselves.** The reading is fetched **once**, when the details appear (Concept 8); for new numbers, go back to the list and open it again. Numbers that move by themselves come in Module 23.

**Peek at its `key` in React DevTools.** In the **Components** tab, click `DeviceDetails`: next to its name is `key="…"` holding its `device_id`, for example `key="a4cf12e5b7c0"`. In the right panel, the **props** part holds `device`, the whole object from the list, and the **hooks** part holds three `State` rows numbered 1 to 3 (`reading`, `error`, `noReadingYet` in `useState` order, without their variable names), then an `Effect` from `useEffect`.

#### 6.3 No reading yet (404): a neutral note, not an error (6 minutes)

The backend keeps the latest reading in **memory**, not in the database (Concept 10). Try what that means.

> [!TIP]
> **Laptop path: no need to race the clock.** Stop the simulator with **Ctrl + C** before step 1, so the backend's memory isn't filled. Start it again (the 4.1 command) before step 3.

1. In the backend terminal, press **Ctrl + C**, then run `npm run dev` again right away (or **↑** then **Enter**). Wait for the log `Server listening at http://127.0.0.1:8080`. Device path: leave Node 1 and Node 2 running.
2. **Quickly** open the Node 1 details (laptop path: **Practice living room**). On the device path you only have a few seconds; if the cards already show, repeat from step 1.

**Result:** no red box. Under the heading with the `key active` badge is a white note in gray text: `No reading from this device since the backend started. Wait for its next message, then open it again.` In the **Network** tab, two `latest` rows with status `404`; their **Response** tab holds `{"message":"no telemetry from a4cf12e5b7c0 yet"}`. The **Console** tab logs two red lines `GET http://localhost:8080/devices/a4cf12e5b7c0/latest 404 (Not Found)` (laptop path: `f00d00000001`). Like the 401 lines in Practice 4, those are the browser's own notes, not a sign your code is broken.

3. Wait about ten seconds, click **← Back to the list**, then open the same device again. This time the cards show, because the first message after the backend started has filled its memory.

**Messages for devices that will never send.** After Module 21, your list also holds **Practice porch** (`f00d00000002`, not registered) and **Test device (intruder)** (`c0ba00000001`, whose key you revoked in Module 21 Practice 7). Open both.

**Result:**

- **Practice porch**: the yellow badge `not registered`, then the white note `This device isn't registered, so the backend ignores its messages (register it first, as in Module 21).`
- **Test device (intruder)**: the red badge `key revoked`, then a **red box** `This device's key has been revoked: the backend ignores its messages. The reading below (if any) is the last one sent before the key was revoked.`, then the white note `There's no stored reading from this device, and no new reading will come while its key is revoked.`

That red box always appears for a `revoked` key: a revoked device's old reading stays in the backend's memory until the backend restarts, and if it's still there, its cards show under the red box with `messages ignored` in the small line (seen in the author's lab, for example `node1 · messages ignored · updated at 06:06:04 WIB`). All three messages come from the same 404; the only difference is the `key` field the list has handed down since 6.1.

#### 6.4 ⭐ All the sensors from the API, checked against Bruno (10 minutes)

A tidy dashboard isn't necessarily right: cards can mix up their fields (for example the `soil` number in the `Water tank` card) and still look convincing. So compare every card with the source you've trusted since Module 16: the `GET /devices/:id/latest` answer in Bruno.

1. In Bruno, open the `backend/bruno` collection and choose the **`local`** environment. Send **`login viewer`** first: Bruno's wristband is separate from the browser's and isn't refreshed by itself.
2. Open **`Node 1 latest reading`**.
   - **Device path:** click **Send** as it is.
   - **Laptop path:** in its URL, replace Node 1's `device_id` with `f00d00000001`, then click **Send**. Don't press **Ctrl + S**: this change is only temporary.
3. **Quickly** switch to the dashboard, click **← Back to the list**, then open the same device.
4. Compare **the time first**: add 7 hours to `ts` in Bruno, then match it with `updated at … WIB`. If they're the same, **every number must match exactly**. If they differ by a few seconds, the device managed to send a new reading; repeat steps 2 and 3 faster.
5. Match every field with its card, using the table below.

**Result** (**example**: the right column holds the real backend v1.0 answer for the Node 1 simulator with the RS-485 sensor in the author's lab, fetched through a script with the `viewer` account, not from the Bruno screen; your numbers and time will certainly differ):

| Field in the Bruno answer | Where on the dashboard | Example → on the dashboard |
| :--- | :--- | :--- |
| `kind`, `status` | the small line above the cards | `node1 · online` |
| `telemetry.ts` | small line, `updated at … WIB` | `"2026-10-23T12:21:59Z"` → `19:21:59 WIB` (UTC + 7 hours) |
| `temperature` | `Temperature` card | `28.5` °C |
| `humidity` | `Humidity` card | `71` % |
| `light` | `Light` card | `2310` /4095 |
| `soil` | `Soil moisture` card | `37` % |
| `motion` | `Motion` card | `false` → `No` |
| `water_level` | `Water tank` card | `64` % |
| `soil_rs485`, `soil_temperature`, `ec` | `RS-485 soil`, `Soil temperature`, `Soil EC` cards | `58.5` %, `25.3` °C, `1200` µS/cm |
| `state.lamp`, `state.fan` | `Lamp` and `Fan` cards | `false` → `Off` |
| `state.pump`, `state.curtain` | no card yet ([🧩 Level 1](#-independent-challenges)) | `false`, `90` → — |
| `fw` | not shown | `"1.6.0"` → — |

A field holding `null` in Bruno must show "—" on its card. The dashboard doesn't round numbers: `28.5` in Bruno stays `28.5` on the card.

6. **Device path: repeat for Node 2.** Replace the `device_id` in the URL with your Node 2's (for example `246f28b1c7d4`), click **Send**, then open the Node 2 details. Besides `temperature` and `humidity`, the pairs are: `pressure` → `Air pressure` (hPa), `soil_temperature` → `Soil temperature`, `soil` → `Soil moisture`, `battery` → `Battery` (V). Node 2 doesn't send `state`, so there's no `Lamp` or `Fan`.
7. Close the **`Node 1 latest reading`** tab in Bruno. If you changed its URL, the `Unsaved changes` dialog appears: click **Don't Save**, as in Module 16.

**You pass this ⭐ step** when, after logging in, the Node 1 details (laptop path: `f00d00000001`) and the Node 2 details (device path) show **every sensor** in the Bruno answer, every number matches its field exactly, the `updated at … WIB` time equals `ts` plus 7 hours, and the heading holds that device's name, location, and `key` badge. This is the proof of the first half of this module's pass requirement.

#### 6.5 The wristband expires: refresh once in `api.ts` (10 minutes)

The wristband (`access`) only lasts 15 minutes, while the season pass (`session`) is valid for up to 7 days, but `api.ts` has never exchanged it. Don't wait 15 minutes: imitate an expired wristband by deleting the `access` cookie yourself.

**See the problem first.**

1. With the device list screen showing, open the **Application** panel → **Cookies** → `http://localhost:5173` in DevTools, as in Practice 4.4.
2. Click the **`access`** row, then press the **Delete** key on the keyboard (or right-click → **Delete**, or the **Delete selected** button, the ✕ icon, in the table's top bar). Leave the `session` row.
3. Tap **Node 1 living room** (laptop path: **Practice living room**).

**Result:** after `Loading the reading…` for a moment, you're back at the login form with the box `Your session has expired. Please log in again.` The **Network** tab only gains two `latest` rows with status `401`, no `refresh`. Users get kicked out like this every 15 minutes, even though their season pass is still valid.

**Install refresh once** (the flow is in Concept 9). Open [`code/stages/practice-6/frontend/src/api.ts`](code/stages/practice-6/frontend/src/api.ts) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `src/api.ts` (`getLatest()` from 6.1 is already in it). What's new: the list `const NO_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"];` (three ticket booths that never trigger a refresh), the variable `let refreshInFlight: Promise<boolean> | null = null;`, the function `refreshOnce()`, a third parameter `mayRetry = true` on `request()`, and one `if` right after the `try`/`catch` block in `request()`:

```ts
function refreshOnce(): Promise<boolean> {
  if (refreshInFlight === null) {
    // no body, so also NO JSON Content-Type (if one is given, the backend answers 400)
    refreshInFlight = fetch(BASE + "/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => res.ok) // 200 = the new wristband is already on in the browser
      .catch(() => false) // backend down = refresh failed
      .finally(() => {
        refreshInFlight = null; // done: next time a refresh is allowed again
      });
  }
  return refreshInFlight;
}
```

```ts
  if (res.status === 401 && mayRetry && !NO_REFRESH.includes(path) && (await refreshOnce())) {
    return request<T>(path, options, false);
  }
```

- **`refreshOnce()`** knocks on `POST /auth/refresh` without a body, so without `Content-Type` and without a *preflight*. The season pass goes along because the path starts with `/auth`. A 200 answer (`true`) means the browser already has the new wristband and season pass; any other answer, or a stopped backend (`.catch`), gives `false`.
- **`refreshInFlight`** lives outside every function, so it lasts as long as the page is open. It holds the "buzzer" (*Promise*, Module 4) of the refresh in progress; a second 401 waits for that buzzer too instead of knocking again, because every knock replaces the season pass (rotation, Module 20). `.finally(…)` empties it when it's done.
- **`mayRetry = true`** is a default value, so `getLatest()` and friends don't write it. `&&` stops at the first condition that isn't met: `refreshOnce()` only runs for a 401 that may be retried and whose path isn't in `NO_REFRESH`. If it succeeds, `request()` calls **itself** with `mayRetry` set to `false`, so it retries only once. If it fails, the 401 `ApiError` reaches `onSessionExpired`, and now it means **the session has really expired**. `GET /auth/me` gets refreshed too, so the next day you're logged straight in.

Save (**Ctrl + S**), then log in again with the `viewer` account if the login form is still showing.

**Test refresh once.**

4. Empty the **Network** tab with **Clear network log**.
5. In the **Application** panel, delete only the **`access`** row again.
6. Tap **Node 1 living room** (laptop path: **Practice living room**).

**Result:** after `Loading the reading…` for a moment, the details screen appears without typing a password. The **Network** tab holds five rows in order: two `latest` `401`, one `refresh` `200`, then two `latest` `200`. The **Console** tab logs two red lines `GET http://localhost:8080/devices/a4cf12e5b7c0/latest 401 (Unauthorized)`; that's normal. In the **Application** panel, `access` is back with an **Expires** (in UTC) 15 minutes after the refresh. The value of `session` changes (rotation), but its **Expires** doesn't grow: the 7-day limit counts from your first login.

**Expected output** (**example**, the backend terminal on the device path; the laptop path writes `f00d00000001`, and your times and durations will certainly differ):

```text
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 401 (1 ms)
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 401 (1 ms)
[19:04:35] INFO: POST /auth/refresh -> 200 (7 ms)
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 200 (1 ms)
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 200 (1 ms)
```

**If the season pass runs out too**, for example 7 days after logging in or after your session is revoked:

7. In the **Application** panel, delete **both** rows, `access` and `session`.
8. Click **← Back to the list**.

**Result:** after `Loading devices…` for a moment, the login form appears with the box `Your session has expired. Please log in again.` The **Network** tab holds two `devices` `401` and one `refresh` `401`, and the **Console** logs all three as red lines.

**Expected output** (**example**, the backend terminal):

```text
[23:25:33] INFO: GET /devices -> 401 (1 ms)
[23:25:33] INFO: GET /devices -> 401 (1 ms)
[23:25:33] INFO: POST /auth/refresh -> 401 (1 ms)
```

Usually there's only one refresh, because both 401s arrive while the refresh is still running. Now and then the second 401 only arrives after the first refresh is done, so the refresh shows up twice (Concept 9). Both are correct.

> [!NOTE]
> The box `Your session has expired. Please log in again.` only appears if the session expires **while the dashboard is in use**. A dashboard opened without a valid session (for example after **Log out** then **F5**) shows the plain form (Concept 10), preceded by two `me` and one `refresh` (sometimes two), all `401`.

Log in again with the `viewer` account, then close the **Application** panel. Its **Value** column holds your still-valid wristband and season pass, so don't take a screenshot of it.

#### 6.6 Save to the branch (6 minutes)

In the free terminal (`frontend` folder, branch `feature/dashboard`), run `git status`: there should be three changed files and `src/components/DeviceDetails.tsx` under `Untracked files`. If `../backend/bruno/Node 1 latest reading.yml` is mentioned too, your Bruno URL change got saved: undo it with `git restore "../backend/bruno/Node 1 latest reading.yml"`. Then save:

```text
git add src/api.ts src/App.tsx src/components/DeviceList.tsx src/components/DeviceDetails.tsx
git commit -m "Device details and refresh once (Module 22 Practice 6)"
```

The state of the code at the end of this practice is in [`code/stages/practice-6/frontend/`](code/stages/practice-6/frontend/) for comparison. Leave everything running if you go straight on; if you stop for now, stop every terminal with **Ctrl + C** (the database container may keep running).

> ⬆️ **Done with Practice 6?** Your dashboard now shows the latest readings of all the sensors from the API, and stays logged in even when the wristband runs out. Peek at a phone-wide screen: in DevTools, press **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**), then type the width `375`. The cards are cramped and the content is wider than the screen: that's the next job. Read [Concept 11 — Responsive](#11-responsive-one-page-for-phones-and-laptops), then continue to [Practice 7 — Neat on a phone screen](#practice-7--neat-on-a-phone-screen-40-minutes).

### Practice 7 — Neat on a phone screen (40 minutes)

> 🖥️ **Tools used:** **VS Code** with the terminals as in Practice 6 (backend v1.0, Vite, and one free terminal in the `frontend` folder for `npm run build` and Git; the laptop path adds the broker and simulator), **Docker Desktop** (the `smarthome-db` container running), and **Chrome or Edge** with DevTools: device mode, the **Console** tab, and the **Elements** tab. Concepts used: Concept 11 and the Tailwind class dictionary from Concept 3.
>
> ⭐ **Required** — step 7.4: in device mode at 375, 768, and 1280 px wide, the dashboard can't be scrolled horizontally, every card is whole, and long text is cut off neatly.

Since Practice 3, your dashboard has been written "laptop style": three columns of sensor cards, two columns of devices, and a one-row page header. This practice checks it at phone width, measures the parts that are messy, then fixes them the *mobile first* way from [Concept 11](#11-responsive-one-page-for-phones-and-laptops). There are no new features, and `api.ts` isn't touched: only Tailwind classes change, in `App.tsx` and four components.

#### 7.1 DevTools device mode: the dashboard at 375, 768, and 1280 px (8 minutes)

Make sure everything is still running as at the end of Practice 6, then open **`http://localhost:5173`** (log in with the `viewer` account if needed).

1. Open DevTools (**F12**; macOS: **Cmd + Option + I**), then press **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**), as in Practice 1. Another way: click the button with the phone-and-tablet icon in the DevTools top bar (**Toggle device toolbar** in Chrome, **Toggle device emulation** in Edge).
2. In the device mode bar that appears above the page, make sure the choice is **Responsive**. Type `375` in the width box, then press **Enter**; the height box can stay as it is.
3. Look at the **Device List** screen.

**Result (example):**

- **Header:** the heading wraps onto two lines (`Mini Smart` / `Home`), and so does `Home Guest` / `(viewer)`, squeezed next to it. The **Log out** button wraps too (`Log` / `out`) and looks squeezed.
- **List:** the cards are still in two columns. The device names wrap word by word (`Node` / `2` / `garden`), so the cards grow tall, and the badges stick out past the card's right edge, even past the screen. Device mode may shrink the whole page a little to fit, so the text looks smaller and the gray background doesn't reach the right edge.

Eyes can be fooled, so measure too. In the **Console** tab, type this line, then press **Enter**:

```js
document.documentElement.scrollWidth
```

`document.documentElement` is the `<html>` element, the root of the DOM tree ([Concept 2](#2-the-browser-and-devtools-taking-apart-the-module-10-switch)), and `scrollWidth` is the width of **all** its content, including what sticks out of the screen. If nothing sticks out, the number equals the screen width.

**Result (example):** `399`, which means the content is 24 px wider than the screen. Your number may differ, depending on what's in your list, but it will certainly be **bigger** than 375.

Measure the **Log out** button too: `querySelector("header button")` finds the first button inside `<header>`, and `offsetHeight` is its height in pixels.

```js
document.querySelector("header button").offsetHeight
```

**Result:** `50`. Don't be fooled: the words `Log out` wrap onto two lines in the squeezed header, so the height comes from cramped text, not from a deliberate touch size like the 44 px button you made in Practice 1. 7.2 and 7.3 make it a proper 44 px button.

4. Tap **Node 1 living room** (laptop path: **Practice living room**) to open its details.

**Result (example):** the sensor cards stay in three columns, ±106 px. The labels `Soil moisture` and `Soil temperature` wrap, and the number and unit on the **Light** and **Soil EC** cards stick out past the card's right edge (Soil EC is only there if the RS-485 sensor is fitted, and Light on `f00d00000001` is random, so it may fit). **← Back to the list** is only 20 px tall. The details `scrollWidth` is `375`: the overflow is only inside the cards.

5. Type `768` in the width box, then `1280`, and check the list and the details.

**Result:** a one-row header, the list in two columns (362 px), the sensor cards in three columns (±237 px), and `scrollWidth` equal to the width. At 1280 px, the content is 768 px wide in the middle of the screen (`max-w-3xl`, Practice 3). If your browser window is narrower than the width you typed, DevTools shrinks the page picture to fit; the layout stays the same.

So the problem is only on narrow screens: `grid-cols-2` and `grid-cols-3` **have no prefix**, so they apply on a phone too (Concept 11). Step 7.2 fixes the grids and the header; 7.3 the long text and small buttons. Set the width back to `375` and leave device mode on; thanks to HMR, your changes show at once.

#### 7.2 A grid that adapts and a header that doesn't spill over (12 minutes)

The *mobile first* way flips the habit of Practices 3–6: the phone layout is written **without a prefix**, then the layout for wider screens gets the `sm:` prefix (from 640 px).

Replace the whole contents of the three files below: open each link on GitHub, click **Copy raw file**, then paste it in place of the whole contents of the same file in your project. They already hold **all** the Practice 7 fixes, including the 7.3 classes; the logic doesn't change, only `className` and comments. Copying is safer: a mistyped class such as `sm:grid-col-2` gives no error; Tailwind just quietly doesn't make its CSS (Concept 3).

**Device list:** [`code/stages/practice-7/frontend/src/components/DeviceList.tsx`](code/stages/practice-7/frontend/src/components/DeviceList.tsx). `grid` without `grid-cols-…` already means one column:

```tsx
    // mobile first: one column on a phone; from the sm width (640 px) up, two columns
    <ul className="grid gap-3 sm:grid-cols-2">
```

**Device details:** [`code/stages/practice-7/frontend/src/components/DeviceDetails.tsx`](code/stages/practice-7/frontend/src/components/DeviceDetails.tsx). On a phone the sensor cards are in two columns, not one, because the cards are small: ±166 px is roomy enough for the number and its unit.

```tsx
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
```

**Page header:** [`code/stages/practice-7/frontend/src/App.tsx`](code/stages/practice-7/frontend/src/App.tsx).

```tsx
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
```

At 375 px, the header's content area is only 375 − 2 × 16 = 343 px (`px-4`): the heading and the account group don't fit side by side, yet the Practice 6 flex row isn't allowed to wrap. **`flex-wrap`** moves the account group down to a second row, like the third card in Practice 1. **`gap-x-4`** gives 16 px of space when the two sit side by side, **`gap-y-1`** 4 px between rows, and `py-2` (before: `py-3`) keeps the header from getting too tall.

Save the three files. Vite updates the browser by itself.

**Result (example)** at 375 px:

- **Header:** `Mini Smart Home` on the first row; `Home Guest (viewer)` and **Log out** on the second.
- **List:** one card per row, 343 px wide. A name that's too long would be cut off with `…`; the Module 21 names all still fit.
- **Details:** sensor cards in two columns, ±166 px, equal heights, no overflow.
- **`scrollWidth`**: `375` (in the **Console**, **↑** brings back the previous command).

#### 7.3 Touch size and long text: `min-h-11`, `truncate`, and `min-w-0` (8 minutes)

**Fingers** need a big enough target, and **text** whose length can't be guessed (device names, account names, locations) mustn't break the layout. Four classes take care of both:

| Class | Its CSS | Meaning |
| :--- | :--- | :--- |
| `min-h-11` | `min-height`: 11 × 0.25 rem = 2.75 rem (44 px) | at least 44 px tall |
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` | one line only; what doesn't fit becomes `…` |
| `min-w-0` | `min-width: 0` | may shrink smaller than its content |
| `shrink-0` | `flex-shrink: 0` | never shrinks |

**Why is `min-w-0` needed?** In a flex row, every child has an invisible default rule: it **won't shrink smaller than its content** that can't be broken. The badges are deliberately not allowed to wrap (`whitespace-nowrap` in `Badge.tsx`), so in Practice 6 the badges stuck out of the card. `min-w-0` lifts that rule on the element that **may** shrink, then `truncate` cuts its text. On a device card, the **name** gives way, while the **badges** stay whole (`shrink-0`), because `key revoked` is the most important information (Practice 5). The location line gets `truncate` too.

```tsx
              <span className="min-w-0 truncate font-semibold text-slate-800">{p.name ?? p.device_id}</span>
              <span className="flex shrink-0 gap-1">
```

In the header, the same pair cuts a long account name so **Log out** isn't pushed off the screen:

```tsx
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate text-slate-600">
```

On the details page, the device's full name needs to be readable, so its heading **isn't** cut: `flex-wrap` moves the key badge below the heading if it doesn't fit, and `break-words` (`overflow-wrap: break-word`) lets a word that's too long be broken (the Tailwind v4 documentation now calls it `wrap-break-word`; the CSS is the same).

```tsx
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800">{device.name ?? id}</h2>
```

**A 44 px finger target.** `min-h-11` equals the `min-height: 44px` of your button in Practice 1. **Log out** gets `min-h-11 shrink-0` and `px-4` (before: `px-3`). **← Back to the list** still looks like a link, but `inline-flex min-h-11 items-center` puts its text in the middle of a 44 px tall box.

Two files to go, the same way.

**Sensor card:** [`code/stages/practice-7/frontend/src/components/SensorCard.tsx`](code/stages/practice-7/frontend/src/components/SensorCard.tsx). At 375 px, even the longest label, `Soil temperature`, still fits; `truncate` here is a seat belt for narrower phones.

```tsx
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="truncate text-sm text-slate-500">{label}</p>
```

**Login form:** [`code/stages/practice-7/frontend/src/components/Login.tsx`](code/stages/practice-7/frontend/src/components/Login.tsx). `min-h-11` is added after `mt-1` in the **Email** and **Password** boxes, and on the **Log in** button:

```tsx
          className="mt-5 min-h-11 w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
```

Save, then run `document.querySelector("header button").offsetHeight` in the **Console** again.

**Result:** `44`.

**Try a very long name**, the Quick Win way (Step 4): change the text in DevTools, without touching the file.

1. On **Device List** (375 px), right-click the first device name → **Inspect**. In the **Elements** tab, the name is inside a `<span>` whose classes start with `min-w-0 truncate`.
2. Double-click the name text, replace it with, for example, `Node 2 garden at the back near the water pump and the east tank`, then press **Enter**.

**Result:** the name stays on one line and ends with `…`, its badges stay whole inside the card, and `scrollWidth` stays `375`.

Press **F5** (macOS: **Cmd + R**): React draws the list again from `GET /devices`, so the real name comes back.

A card border that doesn't change color on hover in device mode is normal too: its default setting imitates a touch screen (the cursor becomes a circle), and `hover:` only works on devices with a pointer (Concept 11).

#### 7.4 ⭐ Check at three widths (5 minutes)

At every width, check **Device List**, the **Node 1 living room** details (laptop path: **Practice living room**), and the **Node 2 garden** details (device path). On every screen, measure `scrollWidth` in the **Console** and check by eye.

**Result:** on the author's laptop (Edge), the list and the details of Node 1 and `f00d00000001` all give these numbers:

| Width | Header | List | Sensor cards | **Log out**, **← Back** | `scrollWidth` |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `375` (phone) | two rows | 1 column, 343 px | 2 columns, ±166 px | 44 px | `375` (Practice 6: `399`) |
| `768` (tablet) | one row | 2 columns, 362 px | 3 columns, ±237 px | 44 px | `768` |
| `1280` (laptop) | one row; content 768 px wide in the middle | 2 columns, 362 px | 3 columns, ±237 px | 44 px | `1280` |

The same details at 375 px and 1280 px, side by side:

![Composite of two real screenshots of the dashboard v0.1 details screen of Node 1 living room in Microsoft Edge, with data from GET /devices/a4cf12e5b7c0/latest of the backend v1.0 from Module 21; the numbers come from the lab simulator; title: Node 1 details: one code, two screen widths. Left, marked 4, a 375 px phone with a 2-column grid, full page: the header Mini Smart Home with Home Admin (admin) and the Log out button on a second row; the link ← Back to the list (marked 6); the heading Node 1 living room with the key active badge and the line living room · a4cf12e5b7c0 (marked 5); the line node1 · online · updated at 05:28:35 WIB (marked 1); then eleven cards, two per row: Temperature 28.5 °C, Humidity 71 %, Light 2310 /4095, Soil moisture 37 %, Motion No, Water tank 64 %, RS-485 soil 58.5 %, Soil temperature 25.3 °C, Soil EC 1200 µS/cm (these three RS-485 cards are marked 2), Lamp Off and Fan Off (marked 3). Right, marked 4, a 1280 px laptop with a 3-column grid from the sm width, 640 px: a one-row header with the account name and the Log out button on the right, the same content with the line node1 · online · updated at 05:27:25 WIB (marked 1), cards three per row with RS-485 soil, Soil temperature, and Soil EC in one row (marked 2), then Lamp and Fan (marked 3). The key: 1 the WIB time from the device's ts in UTC, through toLocaleTimeString with en-GB and the time zone Asia/Jakarta; 2 the RS-485 soil trio from Module 15, which appears when the soil_rs485 field exists and always comes as three; 3 Lamp and Fan are only shown, their control buttons come in Module 24; 4 grid-cols-2 sm:grid-cols-3, mobile first, no horizontal scrolling at 375 px; 5 the heading holds the name, the key badge, and the device_id from the Device object handed down from the list; 6 ← Back to the list is 44 px tall thanks to min-h-11, easy to tap with a thumb.](assets/dashboard-details-phone-and-laptop.png)

If your phone is narrower, for example 360 px, try that width too. The login screen at 375 px also has a `scrollWidth` of `375` (click **Log out**, then log in again).

**You pass this ⭐ step** when, at all three widths: there's **no horizontal scrolling** (`scrollWidth` equals the width you typed), **every card is whole**, and **long text is cut off neatly** without making the page header spill over. The 44 px buttons are a bonus for your thumb.

**Try also (optional, 2 minutes).** Type `639`, then `640`. Right at the `sm` breakpoint (40 rem), the list jumps to two columns and the sensor cards to three: all the `sm:` classes apply at once. A list card at 640 px is only 298 px wide, so names like `Node 1 living room` are already cut off with `…`: that's `truncate` working, not an error.

> [!NOTE]
> **Device mode only imitates a phone's screen width;** for the pass requirement, that's enough. A real phone is used officially from Module 23. If you're curious, see [🔬 Technical Deep Dive](#-technical-deep-dive-optional), the part "Trying it on a real phone over home Wi-Fi (optional)": that step opens the backend and Vite to the home network for a while, so read its warning first.

Close device mode with **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**).

#### 7.5 Save to the branch (7 minutes)

In the free terminal (`frontend` folder, branch `feature/dashboard`), check the types first, as you have since Practice 3:

```text
npm run build
```

**Result (example):** `tsc -b` prints nothing (no type errors), then Vite writes three `dist/` file lines and closes them with `✓ built in 322ms`. If there's an error or the screen looks different, a file usually wasn't saved or got cut off: compare with [`code/stages/practice-7/frontend/`](code/stages/practice-7/frontend/), the state of the code at the end of this practice.

```text
git status
```

**Result:** `On branch feature/dashboard`, then five `modified:` lines in `src/`: `App.tsx`, `components/DeviceDetails.tsx`, `components/DeviceList.tsx`, `components/Login.tsx`, and `components/SensorCard.tsx`. No new files; `dist/` is ignored by the template's `.gitignore`. Save:

```text
git add src/App.tsx src/components/DeviceList.tsx src/components/DeviceDetails.tsx src/components/SensorCard.tsx src/components/Login.tsx
git commit -m "Tidy on a phone screen: mobile-first grids, long text, and 44 px buttons (Module 22 Practice 7)"
```

If you go straight on, leave everything running. If you stop for now, stop every terminal with **Ctrl + C**; the database container may keep running.

> ⬆️ **Done with Practice 7?** Your dashboard is now neat from a phone screen to a laptop, and you've proven the last part of the pass requirement. Continue to [Practice 8 — The pass tests: build, lint, and a dress rehearsal](#practice-8--the-pass-tests-build-lint-and-a-dress-rehearsal-35-minutes), where dashboard v0.1.0 is tested from start to finish.

### Practice 8 — The pass tests: build, lint, and a dress rehearsal (35 minutes)

> 🖥️ **Tools used:** **VS Code** with the terminals as in Practice 7: the `backend` terminal (backend v1.0), the **Vite terminal** in the `frontend` folder (first running `npm run dev`, then `npm run build`, `npm run preview`, and `npm pkg set`), and the **free terminal** in the `frontend` folder for `npm run lint` and Git. The laptop path adds the broker terminal (`edge`) and the simulator (`tools`). Then **Docker Desktop** (the `smarthome-db` container running) and **Chrome or Edge** with DevTools: the **Network** and **Console** tabs, and device mode. Concepts used: 4, 9, and 11.
>
> ⭐ **Required** — step 8.4: a dress rehearsal of the Syllabus pass requirement in one go, on the build: login → the latest readings of all the Node 1 and Node 2 sensors from the API → neat at 375 px wide.

This last practice adds no features. You check the dashboard like an examiner: oxlint checks the code's tidiness (8.1), `npm run build` checks the types and cooks the **ready-to-serve dish** in `dist/`, which you taste with `npm run preview` (8.2), the dashboard gets version **0.1.0** (8.3), then the pass requirement is tested on that dish, not in the kitchen (8.4). The final state of the code is in [`code/frontend/`](code/frontend/).

#### 8.1 The code tidiness checker: `npm run lint` (5 minutes)

Leave the backend and Vite running. In the **free terminal** (`frontend` folder), run:

```text
npm run lint
```

**Expected output (example):**

```text
> frontend@0.0.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 24ms on 10 files with 116 rules using 8 threads.
```

The two `>` lines are written by npm: the package name and version (changed in 8.3) and the contents of the `lint` script. **Clean** means `0 warnings and 0 errors`; the time and the number of threads depend on your laptop. The ten files are `vite.config.ts` and the nine `.ts`/`.tsx` files in `src`. `index.css` isn't counted, because oxlint only checks JavaScript and TypeScript.

oxlint is the **kitchen tidiness inspector** from [Concept 4](#4-vite-and-the-frontend-folder-the-development-kitchen-at-localhost5173): it reads your code without running it and looks for habits that tend to cause trouble. It does **not** check types; that's the job of `tsc -b` in 8.2. A few of its rules have been guarding you from the start:

| Rule | What it guards | Related |
| :--- | :--- | :--- |
| `rules-of-hooks` | hooks are only called at the top level of a component (level **error** in `.oxlintrc.json`) | Concept 7 |
| `exhaustive-deps` | the list at the end of `useEffect` holds every outside value its effect uses, for example `[onSessionExpired]` | Practice 5 |
| `set-state-in-effect` | state isn't changed directly in an effect's body; that's why `DeviceDetails` is reset through `key` | Practice 6.1 |
| `only-export-components` | a component file exports only components, so HMR can work | Concept 4 |

If something is found, oxlint writes the rule, the file, and the line. Fix it (compare with [`code/stages/practice-7/frontend/`](code/stages/practice-7/frontend/)), then repeat until there are no errors **and** no warnings.

**Try it once (optional, 2 minutes).** In `src/components/DeviceList.tsx`, replace `}, [onSessionExpired]);` with `}, []);`, save, then run `npm run lint`. You get `⚠ react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'onSessionExpired'` pointing at `src/components/DeviceList.tsx:34:6`, closed by `Found 1 warning and 0 errors.` npm doesn't treat it as a failure, and the dashboard seems to run as usual. That's exactly the danger: this mistake isn't visible on screen, until the effect uses a value that has gone stale. Undo it (**Ctrl + Z**, **Ctrl + S**), then run `npm run lint` again until it's clean.

#### 8.2 The ready-to-serve dish: `npm run build`, then taste it with `npm run preview` (8 minutes)

**1. Stop the kitchen.** Click the Vite terminal, then press **Ctrl + C**. `npm run preview` will also use port 5173, so the two can't run at the same time.

**2. Give `npm run preview` port 5173.** Open `vite.config.ts`, then replace its whole contents with:

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Module 22: always on port 5173 (the address the backend's CORS_ORIGIN allows).
  // If that port is in use, stop with an error, don't quietly move to 5174.
  server: { port: 5173, strictPort: true },
  // npm run preview (Practice 8) is on 5173 too: its default port (4173) isn't in CORS_ORIGIN, so login would be refused.
  // Stop npm run dev first before running preview.
  preview: { port: 5173, strictPort: true },
})
```

The only new things are two comment lines and the **`preview`** line, the setting for `npm run preview` (`server` sets up the kitchen). Without it, the dish is served on the default port **4173**, which isn't in the backend's `CORS_ORIGIN` ([Concept 9](#9-logging-in-from-the-browser-cookies-cors-and-localhost)): the login form shows the code 0 message right away (the second possibility in Practice 4.5), and the **Console** tab writes `… from origin 'http://localhost:4173' has been blocked by CORS policy …`. `strictPort: true` makes `npm run preview` stop with an error if port 5173 is in use, instead of quietly moving. Save (**Ctrl + S**).

**3. Cook the dish.** Still in the Vite terminal:

```text
npm run build
```

**Expected output (example):**

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
✓ 22 modules transformed.
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-D271euGi.css   15.27 kB │ gzip:  3.84 kB
dist/assets/index-BuiDj2HR.js   230.75 kB │ gzip: 72.08 kB

✓ built in 316ms
```

Its shape is like Practice 2.7, without the `transforming...` and `rendering chunks...` lines that get overwritten in place; its contents are now the whole dashboard:

- **`tsc -b`** is silent: no type errors. If there were any, `vite build` wouldn't run (Practice 3.4).
- **22 modules**, not 16: the extras are `api.ts` and the five components. `types.ts` isn't counted because it's only imported with `import type`, which is removed in the build ([Concept 6](#6-props-and-types-data-handed-down-shaped-by-the-data-contract)).
- CSS goes up from 6.80 to 15.27 kB (more Tailwind classes); JavaScript from 219.77 to 230.75 kB. The dashboard you built is only ±11 kB; the rest is React.
- The file names, sizes, and time may differ on your laptop.

The **`dist`** folder now looks faded in the Explorer because `.gitignore` ignores it (its contents are taken apart in [🔬 Technical Deep Dive](#-technical-deep-dive-optional), "What's in the `dist/` folder"). Don't open `dist/index.html` with a double-click; this dish is made to be served by a server. Note the `.js` size and the build time for ➕ D.

**4. Taste the dish.** Still in the Vite terminal:

```text
npm run preview
```

**Expected output:**

```text
> frontend@0.0.0 preview
> vite preview

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

There's no `VITE v8.3.5  ready in …` line, because `npm run preview` doesn't cook anything; it only serves `dist/`. If the address is `:4173/`, the step 2 setting wasn't saved. If you see `Error: Port 5173 is already in use`, `npm run dev` is still running: stop it first ([🚨 Troubleshooting](#-troubleshooting)).

In the `http://localhost:5173` tab, open the **Network** tab (filter **All**), click **Clear network log**, then press **F5**.

**Result:** the dashboard appears as in the kitchen, without logging in again, because the `access` and `session` cookies are held by the browser for `localhost`, not by Vite. The difference is in the **Network** tab:

| In the **Network** tab | Kitchen (`npm run dev`) | Dish (`npm run preview`) |
| :--- | :--- | :--- |
| Dashboard code | one row per file (`main.tsx`, `App.tsx`, `api.ts`, components) plus React and Vite modules | one `index-….js` and one `index-….css` |
| `me` (`GET /auth/me`) | twice | **once** |
| `devices` (`GET /devices`) | twice | **once** |

The backend log records the same. The double requests in the kitchen are `StrictMode`'s doing in development mode ([🔬](#-technical-deep-dive-optional), "Why effects run twice"). If your wristband is past its 15 minutes, there's also a `me` 401, one `refresh`, then `me` again (Practice 6.5). The dish has no HMR: code changes only go in after another `npm run build`.

**5. Stop the dish** with **Ctrl + C**. It's started again in 8.4.

#### 8.3 Dashboard v0.1.0: the official name and version (4 minutes)

Your `package.json` is still named `frontend`, version `0.0.0`, from the template. The backend has been named `mini-smart-home-backend` since Module 16 (now 1.0.0); the dashboard gets its partner, **`mini-smart-home-frontend`** version **0.1.0**: the Syllabus's "dashboard v0.1". The 0 in front means it's still young and will change a lot. In the Vite terminal, run these one at a time:

```text
npm pkg set name=mini-smart-home-frontend version=0.1.0
npm install
npm run build
```

- **`npm pkg set`** changes `package.json` without opening it, like `npm pkg set type=module` in Module 16. If it works, the screen stays empty. (`npm version` from Module 21 only changes the version, not the name.)
- **`npm install`** is required afterwards, because `npm pkg set` does **not** touch `package-lock.json`. Without installing any new package, it matches `name` and `version` in two places in `package-lock.json`, answers `up to date, audited 45 packages in …`, and ends with `found 0 vulnerabilities`.
- **`npm run build`** cooks the dish again. Its top two lines are now:

**Expected output:**

```text
> mini-smart-home-frontend@0.1.0 build
> tsc -b && vite build
```

The rest is the same as 8.2, even the names of the `.js` and `.css` files: your code didn't change, and the package name isn't cooked in. Those random letters are a fingerprint of the file's contents (🔬, "What's in the `dist/` folder").

Check `package.json`; only the `"name"` and `"version"` lines changed:

```json
{
  "name": "mini-smart-home-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "oxlint": "^1.88.0",
    "typescript": "~6.0.3",
    "vite": "^8.3.4"
  }
}
```

Don't change anything else. Ranges such as `"vite": "^8.3.4"` are how the template writes them ([🧰](#-what-you-need)); the exact installed versions are recorded in `package-lock.json`. `"private": true` stops your package from being published to the npm registry by accident.

#### 8.4 ⭐ A dress rehearsal of the pass requirements (10 minutes)

The Syllabus pass requirement: **after logging in, the dashboard shows the latest readings of all the sensors from the API, laid out neatly on a phone screen.** Practices 4, 6, and 7 proved it piece by piece; now test all three in one go, on the **dish**, because that's what will be handed over. If one step fails, fix it, then start again from the beginning.

**Preparation.**

1. Make sure backend v1.0 and its data source are running: Node 1 and Node 2 (device path), or the locked broker and the `f00d00000001` simulator (laptop path).
2. In the Vite terminal, start `npm run preview` again.
3. Open **`http://localhost:5173`** with device mode **off**. If **Device List** shows right away, click **Log out** first: the rehearsal starts from the login form.
4. In DevTools, choose the **Network** tab (filter **All**), then click **Clear network log**.

**Requirement 1: login.**

5. Log in with `viewer@home.test` and its password, as in Practice 4.4.

**Result:** the **Device List** screen. In the **Network** tab there are two `login` rows, one of type `preflight` with status 204 and one of type `fetch` with status 200 (their order may swap), then **one** `devices` row with status 200: the dish, without the `StrictMode` shake. Edge may add a `data:image/svg+xml;…` row; ignore it.

**Requirement 2: the latest readings of all the sensors, from the API.**

6. Click the Node 1 card (laptop path: **Practice living room**, `f00d00000001`).

**Result:** the heading with the device name and its `key` badge, the location and `device_id` line, a small line like `node1 · online · updated at … WIB`, then the sensor cards as in the Practice 6.2 table. The **Network** tab gains exactly one `latest` row with status 200.

7. Check it against the API, this time without Bruno: click the `latest` row, then the **Preview** tab (it has the same name in Chrome and Edge). Open `telemetry` and check it with the pairs in the Practice 6.4 table: every sensor field has its card, the numbers match exactly, `null` shows "—", and the `updated at … WIB` time equals `ts` plus 7 hours.
8. **Device path:** click **← Back to the list**, open Node 2, then check it the same way. **Laptop path:** there's no Node 2; just read along.

If a note says there's no reading since the backend started, wait for the next message, then open it again from the list (Practice 6.3).

**Requirement 3: neat on a phone screen.**

9. Leave the details open. Turn on device mode (**Ctrl + Shift + M**; macOS: **Cmd + Shift + M**), choose **Responsive**, then type the width `375` (Practice 7.1).
10. In the **Console** tab, run `document.documentElement.scrollWidth`. The answer must be `375`. Also check: the sensor cards are in two columns and whole, a long heading wraps to a new line, and the header has two rows (the heading `Mini Smart Home`, then the account name and **Log out**).
11. Click **← Back to the list**: the cards are in one column, and a name that's too long is cut off with `…`. Run `scrollWidth` again, open the Node 1 details again (laptop path: `f00d00000001`), then run it once more. All three must be `375`.

**You pass this ⭐ step** when all three requirements are met in one go, on the `npm run build` output served by `npm run preview`: (1) logging in with a Module 20 account takes you to **Device List**; (2) the Node 1 and Node 2 details (laptop path: `f00d00000001`) show a card for every sensor in `telemetry`, with numbers that match the **Preview** tab exactly and the right WIB time; and (3) at 375 px wide, `scrollWidth` is `375` on both the list and the details, every card is whole, and the page header doesn't spill over. That's the Module 22 pass requirement.

> [!TIP]
> **Want to keep a screenshot of the rehearsal as proof?** Take it after the login is done, and make sure the **Payload** tab and the **Application** panel aren't in the picture. Both show your password and cookie values as they are (Practice 4.4).

When the rehearsal is done, turn off device mode and stop the dish (**Ctrl + C**). To change the code again, start the kitchen (`npm run dev`); both use the same port, so start only one of them.

#### 8.5 Save to the branch (8 minutes)

In the free terminal (`frontend` folder, branch `feature/dashboard`), check what changed:

```text
git status
```

There are three `modified:` files, namely `package-lock.json`, `package.json`, and `vite.config.ts`, and no new files. `dist` isn't mentioned because `.gitignore` ignores it. If `dist/` or `.env.local` shows up too, check your `.gitignore` first (Practice 2.5). Then save:

```text
git add package.json package-lock.json vite.config.ts
git commit -m "Dashboard v0.1.0: preview on port 5173, clean lint and build (Module 22 Practice 8)"
```

All the Module 22 code is now saved on the `feature/dashboard` branch; compare it with [`code/frontend/`](code/frontend/) if something doesn't work. The only thing still different is `README.md` (yours is still the template's README; ➕ A replaces it). No `git push` yet: the branch is sent in ➕ C together with its pull request. If you want to stop for now, stop every terminal with **Ctrl + C**; the database container may keep running.

> ⬆️ **Done with Practice 8?** Your dashboard v0.1.0 is clean according to oxlint, passes the build, and passes the dress rehearsal of the pass requirement. Continue to [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home): there `frontend/README.md` is written, the pull request template gets the **(Module 22)** items, and all of this week's work is merged into `main` through the "dashboard v0.1" pull request. The [🧩 Independent Challenges](#-independent-challenges) may be done afterwards, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title most like your problem (backend, database, broker, and simulator problems are in the 🚨 of Modules 16–21). Before that, glance at these four places:

1. **The backend terminal**: still running (`Server listening at http://127.0.0.1:8080`), and its last line isn't an error?
2. **The `frontend` terminal**: is Vite running at `Local: http://localhost:5173/`?
3. **The address bar**: `localhost:5173`, not `127.0.0.1:5173`, `localhost:5174`, `localhost:4173`, or `file:///…`?
4. **The Console tab** (**F12**): its red line almost always names the cause that the screen only describes in general terms.

Still stuck? Compare your files with [`code/stages/`](code/stages/) at the end of the same practice.

<details>
<summary><b>Old instructions → what's right for our versions (create-vite 9.3.1, React 19, Tailwind CSS v4)</b></summary>

Internet tutorials for old versions can fail, or quietly break things, in our project. Replace the left column with the middle one:

| Old instruction | What's right for our versions | Why |
| :--- | :--- | :--- |
| `npx create-react-app dashboard` | `npm create vite@9.3.1 frontend -- --template react-ts` | Concept 4 |
| `npm start`, port 3000 | `npm run dev`, `http://localhost:5173` | 3000 isn't in `CORS_ORIGIN` (Concept 9) |
| Vite moves to port `5174` | `server: { port: 5173, strictPort: true },` in `vite.config.ts` | Practice 2.5 |
| `http://127.0.0.1:5173` | `http://localhost:5173` | Two sites, as far as cookies are concerned (Concept 9) |
| `.eslintrc`, ESLint packages | `npm run lint` (**oxlint**) | Practice 8.1 |
| `src/vite-env.d.ts` | Not needed | `"types": ["vite/client"]` (Concept 4) |
| `npx tailwindcss init -p`, `tailwind.config.js`, `postcss.config.js`, `autoprefixer` | `npm install tailwindcss@4.3.3 @tailwindcss/vite@4.3.3`, then `tailwindcss()` in `vite.config.ts` | v4 finds the classes by itself (Concept 3) |
| `@tailwind base;` `@tailwind components;` `@tailwind utilities;` | `@import "tailwindcss";` in `src/index.css` | Practice 2.4 |
| `focus:outline-none` | `focus:outline-hidden` | v4's `outline-none` removes the focus ring completely, even in high-contrast mode |
| `hover:shadow` on `shadow-sm` | `hover:shadow-md` | In v4, `hover:shadow` is no different from `shadow-sm` |
| Buttons get a hand cursor automatically | `cursor-pointer` (the `DeviceList.tsx` cards) | v4 no longer gives `<button>` `cursor: pointer` |
| `ReactDOM.render(<App />, …)` | `createRoot(…).render(…)` in `src/main.tsx` | Gone in React 19 |
| `import React from "react"` | Not needed | `"jsx": "react-jsx"`; an unused import = `TS6133` |
| `class="…"` in JSX | `className="…"` | ``Invalid DOM property `class`. Did you mean `className`?`` |
| `enum Status { Online, Offline }` | `"online" \| "offline"` | `TS1294` (Concept 6) |
| `import { Device } from "../types";` | `import type { Device } from "../types";` | `TS1484` (Concept 6) |
| `FormEvent<HTMLFormElement>` | `SubmitEvent<HTMLFormElement>` + `import type { SubmitEvent } from "react";` | Deprecated in @types/react 19.3 |
| `process.env.REACT_APP_API_URL` | `import.meta.env.VITE_API_BASE` (usually empty) | Concept 9 |
| A token in `localStorage` | An `HttpOnly` cookie from the backend | XSS (Concept 9) |
| A plain `fetch(url)`, `axios` + `withCredentials` | `credentials: "include"` through `request()` | Practice 4.2 |
| The Vite proxy (`server.proxy`) | Call the backend directly | CORS was prepared in Module 20; the proxy trap is in [🔬](#-technical-deep-dive-optional) |
| `react-router-dom` | The `view` state in `App` | Module 24 |
| `npm run dev -- --host` for a phone | DevTools device mode | The safety rules; a real phone in 🔬 |

</details>

<details>
<summary><b>Node.js is too old: Vite writes <code>Vite requires Node.js version 20.19+ or 22.12+</code>, or <code>node generate-dummy.js</code> prints nothing</b></summary>

**Cause:** your Node.js is older than Node.js 24 (Module 4). Vite 8, create-vite 9.3.1, and oxlint need 20.19+ or 22.12+; `generate-dummy.js` needs 24.2+ (or 22.18+) because of `import.meta.main`. With Node.js 22.17, the author saw Vite start, but `generate-dummy.js` stayed silent.

**Steps:** `node --version` must be `v24…`. If it isn't, install Node.js 24 as in Module 4 Practice 3, close VS Code **completely**, open it again, and check again (details and older macOS: [🚨 Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md#-troubleshooting)). Ignore any other errors after Vite's warning until the version is fixed.

**create-vite asks something that isn't in Practice 2.2?** Usually the `frontend` folder already exists from an old attempt: **Ctrl + C**, delete or rename that folder, and try again.

</details>

<details>
<summary><b><code>npm run dev</code> stops with <code>Port 5173 is already in use</code>, or Vite moves to port <code>5174</code> by itself</b></summary>

**Symptom:** with `server: { port: 5173, strictPort: true },` (Practice 2.5), the terminal writes `error when starting dev server:`, then `Error: Port 5173 is already in use` and five trace lines `at …`. Without that line, Vite writes `Port 5173 is in use, trying another one...`, moves to `http://localhost:5174/`, and every request to the backend fails (Console: `from origin 'http://localhost:5174'`).

**Cause:** almost always **another Vite** you forgot about: in another terminal, the Practice 2.2 terminal (if you answered **Yes** to `Install with npm and start now?`), `npm run preview`, or another VS Code window.

**Steps:** add that line if you haven't (Practice 2.5 step 3). Click the terminals in the list on the right of the terminal panel one by one; stop the one that shows `Local: http://localhost:5173/` with **Ctrl + C**, then run `npm run dev` again. Still clashing? Windows: `netstat -ano | findstr :5173` (the last number on the `LISTENING` line = the process number, PID), then `taskkill /PID 23188 /F` (replace 23188 with your PID). macOS: `sudo lsof -nP -iTCP:5173 -sTCP:LISTEN`, then `kill` the PID in the second column. Don't add another port to `CORS_ORIGIN`.

</details>

<details>
<summary><b><code>http://127.0.0.1:5173</code> won't open (<code>ERR_CONNECTION_REFUSED</code>), even though Vite is running</b></summary>

**Symptom:** Edge writes `Hmmm… can't reach this page`, Chrome `This site can’t be reached`, with `127.0.0.1 refused to connect.` and the code `ERR_CONNECTION_REFUSED`.

**Cause:** not CORS; nothing answers at that address. Vite listens on `localhost` by default, which on the author's Windows laptop is only the IPv6 address `[::1]` (`netstat` only shows `[::1]:5173`), while `127.0.0.1` is an IPv4 address. On macOS it may open; the author only tested Windows.

**Steps:** open **`http://localhost:5173`**, so the page and the API are one site (Concept 9). To test `127.0.0.1`, run `npm run dev -- --host 127.0.0.1`: `api.ts` calls `http://127.0.0.1:8080` and the login works (tried by the author), but you have to log in again. Afterwards, go back to `npm run dev`. Don't write `--host` without an address: the Vite kitchen opens to the whole network (safety rule number 4).

</details>

<details>
<summary><b>A blank white screen, or a Vite error box covers the page (<code>Failed to resolve import …</code>)</b></summary>

**The Vite error box.** **Cause:** Vite failed to translate your code; the top line of the box (also `[vite] Internal server error: …` in the `frontend` terminal) names the cause, the file, and the line. Most often: `[plugin:vite:import-analysis] Failed to resolve import "./App.css" from "src/App.tsx". Does the file exist?`, because `App.css` was deleted before `App.tsx` was replaced, or an import path is mistyped (`./component/Login`). An unclosed tag (Auto Save, Practice 3.3) causes it too. **Steps:** replace `App.tsx` first (Practice 2.5 step 1), fix the path, or finish typing; the box goes away by itself. Closing it (`Click outside, press Esc key, or fix the code to dismiss.`) only hides the problem.

**A white screen without a box.** **Cause:** the code failed while running. **Steps:** read the top red line in the **Console**. `Target container is not a DOM element.`: `<div id="root"></div>` in `index.html` is gone (compare with [`code/stages/practice-2/frontend/index.html`](code/stages/practice-2/frontend/index.html)). `Cannot read properties of null (reading 'length')` + `An error occurred in the <DeviceDetails> component.`: a component reads inside a `null`, for example `device.name.length`; the link on the right of the red line takes you to the code. The address is `file:///…`? See the `file://` problem.

</details>

<details>
<summary><b>Tailwind has no effect: a plain black heading on a white background, or one class does nothing</b></summary>

**No class has any effect.** **Cause:** a step of Practice 2.4 was skipped. **Steps:** check in order, then restart Vite and press **F5**:

1. `frontend/package.json` holds `"tailwindcss": "^4.3.3"` and `"@tailwindcss/vite": "^4.3.3"`. Not there? It may have been installed in another folder: in `backend`, undo it with `npm uninstall tailwindcss @tailwindcss/vite`; in `mini-smart-home`, delete the `package.json`, `package-lock.json`, and `node_modules` that just appeared. Repeat the install in the `frontend` folder.
2. `vite.config.ts` holds `import tailwindcss from '@tailwindcss/vite'` and `plugins: [react(), tailwindcss()],`.
3. `src/index.css` holds `@import "tailwindcss";`, and `src/main.tsx` holds `import './index.css'`.

**One class has no effect.** Right-click → **Inspect**, find the class in **Styles**. No rule: a typo (`text-teal-70`), a joined name (`"bg-" + color`, Concept 3), or a v3 name (the table at the top). The rule is crossed out: another class sets the same thing; use one. `hover:` doesn't show on a phone: in v4 it only works on devices with a pointer (Concept 11). In `card.html` and Practice 1, Tailwind classes really have no effect (no plugin, Concept 3).

</details>

<details>
<summary><b>React DevTools' Components tab doesn't appear</b></summary>

Check in order:

1. **Not reloaded yet.** Close DevTools, press **F5** in the `http://localhost:5173` tab, open DevTools again (Practice 2.6).
2. **Hidden** behind the **»** mark if DevTools is narrow.
3. **The tab is there, but only says `Looks like this page doesn't have React, or it hasn't been loaded yet.`** React DevTools 8.0.0 adds its tab on every page; on a page without React (`card.html`, Practice 1), that text is normal. Make sure you're in the dashboard tab.
4. **The extension isn't active.** Does the Console still write `Download the React DevTools for a better development experience: …`? Then React did **not** find the extension: it's installed in another browser or profile, turned off in `chrome://extensions` (`edge://extensions`), or you're in an incognito window. For that window, on the extensions page click **Details** → **Allow in Incognito** (Chrome) or **Allow in InPrivate** (Edge).
5. **Too old.** The Console writes `The installed version of React DevTools is too old and will not work with the current version of React. …`: update the extension.

The ⭐ steps don't use React DevTools, so don't get stuck here.

</details>

<details>
<summary><b><code>npm run build</code> fails with type errors (<code>TS1484</code>, <code>TS1294</code>, <code>TS6133</code>, <code>TS2315</code>, …), even though <code>npm run dev</code> works</b></summary>

**Cause:** in `npm run dev`, Vite only removes the type labels; it's `tsc -b` at the start of `npm run build` that checks them (Concept 4). The VS Code **Problems** panel holds the same errors. **Steps:** find the code, fix it, and run `npm run build` again:

| Code | Message (example) | Cause → cure |
| :--- | :--- | :--- |
| `TS1484` | `'Device' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.` | A type imported without `type` → `import type { Device } from "../types";` |
| `TS1294` | `This syntax is not allowed when 'erasableSyntaxOnly' is enabled.` | `enum`, or `constructor(public code: number, …)` → `"online" \| "offline"`, and class fields written separately like `ApiError` (Practice 4.2) |
| `TS6133` | `'useState' is declared but its value is never read.` | An unused import, variable, or parameter (for example a template leftover, `import React`) → delete it or use it; its relatives are `TS6192`, `TS6196` |
| `TS2315` | `Type 'SubmitEvent' is not generic.` | `SubmitEvent` isn't imported from `react`, so the browser's version is used → `import type { SubmitEvent } from "react";` (Practice 4.3) |
| `TS2307` | `Cannot find module './components/Badg' or its corresponding type declarations.` | A mistyped path (upper and lower case count), or a package not installed in `frontend` |

You already met `TS2551` (a mistyped field name) in Practice 3.4. `npm run lint` (Practice 8.1) checks risky habits, for example `useState` inside an `if` (`react/rules-of-hooks`). If oxlint asks you to add a value to an effect's dependency list, add it (like `[onSessionExpired]`); don't empty it to `[]`.

</details>

<details>
<summary><b>The red box <code>Can't reach the server at …</code>: is the backend down, or did CORS refuse it? Open the Console tab</b></summary>

**Symptom:** `Can't reach the server at http://localhost:8080. Maybe the backend isn't running yet, or this page was opened from an address the backend doesn't allow (open http://localhost:5173, see CORS_ORIGIN).`

**Cause:** the `fetch` failed completely (code 0). The dashboard **can't** tell the two possibilities apart, because the browser deliberately doesn't tell JavaScript why a cross-origin request failed (Practices 1.6, 4.5). The difference shows in the red **Console** line:

| The red line contains… | Meaning → steps |
| :--- | :--- |
| `net::ERR_CONNECTION_REFUSED` | Nothing answers: the backend is down or the port is wrong → look at the backend terminal, `npm run dev` again. The address in the message isn't `http://localhost:8080`? Check `VITE_API_BASE` in `.env.local`. |
| `has been blocked by CORS policy` + `No 'Access-Control-Allow-Origin' header is present on the requested resource` | The backend answers (its log still records `GET /auth/me`), but the browser holds back the answer: the origin after `from origin` isn't in `CORS_ORIGIN` → see below. |
| `Response to preflight request doesn't pass access control check` | The same, held back at the `OPTIONS` *preflight* on **Log in**; `POST /auth/login` isn't sent. |
| `net::ERR_FAILED` | The companion of a nearby CORS error. |

**Steps by origin:** `http://localhost:5174` → the port 5173 problem; `http://localhost:4173` → the `npm run preview` problem; `http://127.0.0.1:5173` → open `http://localhost:5173`; `null` → the `file://` problem; `http://192.168.…:5173` → a real phone, follow 🔬. The default `CORS_ORIGIN` value is enough for this module.

**Don't:** `CORS_ORIGIN=*` (refused by the browser for requests with cookies); `mode: "no-cors"` (the answer becomes *opaque*: JavaScript can't read its headers or body); a "CORS unblock" extension (it loosens the protection of every site); changing `security.ts` (the backend isn't changed this week).

</details>

<details>
<summary><b>A login loop: <code>POST /auth/login</code> is answered with 200, but you land back on the login form with <code>Your session has expired. Please log in again.</code></b></summary>

**Symptom** (the author's recording in Edge, `VITE_API_BASE=http://127.0.0.1:8080`): `Logging in…`, `Loading devices…` for a moment, then the form with that message. **Network**: `login` *preflight* 204, `login` 200, `devices` 401 twice, `refresh` 401. (In Practice 4: the greeting appears, but **Cookies** in **Application** is empty.)

**Cause:** the page's host name differs from the API's host name (Concept 9), so the browser refuses to store a `SameSite=Strict` wristband and season pass from another site. The next requests and the refresh are then 401 too.

**Steps:**

1. Make sure: **Network** → the `login` row (200) → the **Cookies** tab. In `Response cookies`, `access` and `session` have a yellow background; the (i) icon in the SameSite column writes `This attempt to set a cookie via a "Set-Cookie" header was blocked because it had the "SameSite=Strict" attribute but came from a cross-site response which was not the response to a top-level navigation`.
2. Delete `frontend/.env.local`, or put a `#` in front of `VITE_API_BASE` as in `.env.example`.
3. Restart Vite so `.env.local` is surely read again, open **`http://localhost:5173`**, and log in again.

Does `VITE_API_BASE` need a value? Use the same host name: `http://localhost:8081`, not `http://127.0.0.1:8081`. Did the message appear after the dashboard was left alone for a long time (the season pass is past 7 days)? That's normal: log in again.

</details>

<details>
<summary><b>A page opened with a double-click (<code>file:///…</code>): origin <code>null</code>, <code>403</code> <code>request from the page null refused</code>, or a white page</b></summary>

**Cause:** a `file:///…` page has the origin `null` (Practice 1.6), and the backend doesn't trust it. A plain `POST` is refused by the guard: **403** `{"message":"request from the page null refused"}` (Bruno and curl aren't affected, because they aren't browsers). A JSON `fetch` is held back at the *preflight* (`from origin 'null'`, `has been blocked by CORS policy`). A double-clicked `dist/index.html` is white, because `/assets/…` is looked for from the root of the disk ([🔬 Technical Deep Dive](#-technical-deep-dive-optional), the `dist/` part).

**Steps:** everything that talks to the backend is served by Vite at `http://localhost:5173`; the build is opened through `npm run preview` (Practice 8.2). Don't add `null` to `CORS_ORIGIN`: every file from any folder, and also a *sandboxed* page that any site can embed, has the origin `null`, and the guard would let their `POST`s through too, because it uses the same list. MDN also advises against using `null`.

</details>

<details>
<summary><b>The Console tab shows red <code>401 (Unauthorized)</code> or <code>404 (Not Found)</code> lines, even though the dashboard works normally</b></summary>

**Cause:** the browser logs **every** answer with an error code as a red line, even when your code catches it. It looks like `GET http://localhost:8080/auth/me 401 (Unauthorized)`, with the file and line of the `fetch` caller at the far right, for example `api.ts:52` (`api.ts:24` for the refresh), or `index-….js:9` in the build. These are **normal**:

- **Before logging in:** `GET …/auth/me 401 (Unauthorized)` (twice in development mode), then `POST …/auth/refresh 401 (Unauthorized)`; the form shows without an error box.
- **A wrong password:** `POST …/auth/login 401 (Unauthorized)` (Practice 4.5).
- **The wristband ran out or `access` was deleted (Practice 6.5):** `GET …/latest 401 (Unauthorized)` (twice in development mode), then a refresh 200 without a red line, and the request is repeated.
- **Details without a reading:** `GET …/devices/f00d00000002/latest 404 (Not Found)` (twice in development mode).

**Steps:** leave them. These are **not** normal: `net::ERR_…`, `blocked by CORS policy`, lines starting with `Uncaught`, and `Each child in a list should have a unique "key" prop.` (Concept 5).

</details>

<details>
<summary><b>Every request shows up twice in the Network tab and in the backend log (<code>GET /auth/me</code>, <code>GET /devices</code>, <code>GET …/latest</code>)</b></summary>

**Cause:** normal in development mode: `<StrictMode>` in `src/main.tsx` mounts, unmounts, then mounts every component again, so effects run twice (Concept 8, 🔬); `ignore` makes sure only the second effect's answer is used. In the author's backend log: `GET /auth/me` and `GET /devices` twice with `npm run dev`, once with `npm run preview`; `POST /auth/login` always once (from `onSubmit`, not an effect); `POST /auth/refresh` usually once, sometimes twice in development mode.

**Steps:** leave `<StrictMode>` in. The number really sent to users is seen with `npm run preview` (Practice 8.2).

</details>

<details>
<summary><b>The device list is empty: <code>No registered devices yet (registering devices: Module 21).</code></b></summary>

**Cause:** the backend reads the list from the **database**, not from the devices that are running (stopping the simulator doesn't empty it). So the database really is empty.

**Steps:**

1. In Bruno, send **`login viewer`**, then **`device list`**. Also `[]`? The problem is in the backend or database.
2. When it starts, the backend log writes `device registry loaded: … registered devices`. Zero? Check `DATABASE_URL` in `backend/.env` and the container in Docker Desktop: it must be `smarthome-db` from Modules 17–21.
3. Not registered yet? Register Node 1, Node 2, and `f00d00000001` as in [Module 21 Practice 1.9](../../phase-3-backend-data/module-21-device-broker-security/README.md#19-register-your-devices-10-minutes), then **F5**.

The red box `the database can't be reached right now, try again shortly` means the database is down: start `smarthome-db`, then reload.

</details>

<details>
<summary><b>Device details without cards: <code>No reading from this device since the backend started.</code>, <code>This device isn't registered…</code>, or <code>…while its key is revoked.</code></b></summary>

**Cause:** `GET /devices/:id/latest` is answered with **404**. The latest reading is kept in the backend's **memory** (empty again every time the backend restarts, Concept 10) and is only accepted from registered devices with a valid key (Module 21). The message follows the `key` badge:

| Badge | Message | Steps |
| :--- | :--- | :--- |
| **key active**, **via linking device** | `No reading from this device since the backend started. Wait for its next message, then open it again.` | Start the simulator or Node 1 (Node 2 goes through Node 1), wait about 10 seconds, then tap the device again: dashboard v0.1 doesn't refresh by itself. |
| **not registered** | `This device isn't registered, so the backend ignores its messages (register it first, as in Module 21).` | Waiting is pointless. On the laptop path, choose `f00d00000001`, not `f00d00000002`. |
| **key revoked** | `There's no stored reading from this device, and no new reading will come while its key is revoked.` | Use it again with a new key ([Module 21 Practice 7.4](../../phase-3-backend-data/module-21-device-broker-security/README.md#74-the-board-turns-up-restore-it-with-a-new-key-12-minutes)). |

Is Bruno (**`Node 1 latest reading`**, the same `device_id`) 404 too? Then your dashboard is right.

</details>

<details>
<summary><b>A card shows <code>—</code>, or a card you expect doesn't appear</b></summary>

- **A gray `—` without a unit:** the backend sent `null`, because the sensor failed to read (rule 7). Your dashboard is right; check in Bruno (**`Node 1 latest reading`**), then check the sensor in the 🚨 of the module that installed it. The number `0` still shows `0`.
- **A dark `—` with a unit:** the field isn't there (`undefined`), usually a mistyped field name in the code (`humidty`, Practice 3.4); VS Code and `npm run build` catch it.
- **A card doesn't appear:** cards are only made for fields that are sent (Practice 6): the RS-485 trio needs the Module 15 soil sensor, `Battery` needs Node 2's battery meter, `Lamp` and `Fan` need `state` from Node 1, and Node 2 has no `Light`, `Motion`, or `Water tank`. Compare with `telemetry` in Bruno.

</details>

<details>
<summary><b><code>npm run preview</code> problems: the login is refused at <code>http://localhost:4173</code>, <code>Port 5173 is already in use</code>, or <code>The directory "dist" does not exist</code></b></summary>

- **`The directory "dist" does not exist. Did you build your project?`** You haven't run `npm run build`, or the build failed (the type errors problem). Build until `✓ built in …`, and only then `npm run preview`; after changing the code, build again.
- **`error when starting preview server:` then `Error: Port 5173 is already in use`.** `npm run dev` is still running on the same port: stop it with **Ctrl + C**.
- **The address `http://localhost:4173/`.** The form shows the code 0 message right away, the Console mentions `from origin 'http://localhost:4173'`, and **Log in** is held back at the *preflight* (tried by the author in Edge). That default `vite preview` port isn't in `CORS_ORIGIN`: add `preview: { port: 5173, strictPort: true },` under the `server` line as in Practice 8.2 ([`code/frontend/vite.config.ts`](code/frontend/vite.config.ts)). Don't add 4173 to `CORS_ORIGIN`.

</details>

<details>
<summary><b>On an old phone or browser, the dashboard appears without styles</b></summary>

**Cause:** Tailwind CSS v4 only supports **Chrome 111+**, **Safari 16.4+**, and **Firefox 128+** (Concept 11); older browsers show a plain dashboard. DevTools device mode still uses your laptop's browser, so this problem only shows up on a real phone (🔬, optional).

**Steps:** update the phone's browser (Chrome through the Play Store; Safari comes with iOS 16.4+), or use another phone. The pass requirement is still checked with device mode (Practice 7).

</details>

## 🔬 Technical Deep Dive (optional)

This part may be skipped: it holds the deeper "why" and other options used in professional work. Only the **real phone** part changes any settings, and even that is optional.

<details>
<summary><b>The <i>Virtual DOM</i>: what happens when React draws again (<i>render</i> and <i>commit</i>)</b></summary>

Tutorials often mention the ***Virtual DOM***, while react.dev itself names three steps: **trigger**, ***render***, and ***commit***.

1. **Trigger:** the first display (`createRoot(…).render(…)` in `main.tsx`) or a state change, for example when `DeviceList` stores the `GET /devices` answer.
2. ***Render*:** React calls your components. Every JSX tag is compiled into a `jsx(…)` call that produces a **plain JavaScript object**. The author's test with React 19.3.1 (shortened):

   ```text
   jsx("p", { className: "text-sm", children: "Temperature" })
   → { type: "p", key: null, props: { className: "text-sm", children: "Temperature" }, … }
   ```

   This tree of objects is what's called the *Virtual DOM*: cheap to make, and the screen hasn't changed yet.
3. ***Commit*:** React compares the new render with the previous one, then changes only the DOM nodes that differ.

In Practice 1.5, you replaced `textContent` yourself; for dozens of cards, that's easy to get wrong. Two of this module's habits serve the commit: a `key` holding the `device_id` tells React which card is which (Concept 5), and the changing `key` on `DeviceDetails` (Practice 6.1) makes React treat it as a **different** component, so the old state is thrown away without being emptied inside an effect.

Want to see it? After `npm run build`, open the `.js` file in `dist/assets/` with VS Code, then search (**Ctrl + F**) for `.jsx)(`. The result looks like `(0,x.jsx)(…)`; the letter may differ.

</details>

<details>
<summary><b>One set of types for the backend and frontend: a simple <i>monorepo</i> with npm <i>workspaces</i></b></summary>

In Practice 3, `src/types.ts` was **copied** from Appendix A. The backend has its own copy in `backend/src/schemas/contract.ts`: Zod schemas whose types are derived with `z.infer` (Module 16):

```ts
export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
```

If the backend adds a field and `types.ts` isn't updated, TypeScript in the frontend doesn't know; the only guard is the rules of `DATA-CONTRACT.md`. The way out in professional work: a ***monorepo*** (one repository, several packages that use each other) with npm ***workspaces***. In outline (**just read it**):

1. The `package.json` at the root of `mini-smart-home` lists `"workspaces": ["backend", "frontend", "contract"]`.
2. A `contract/` package (`npm init -w ./contract`) holds the Zod schemas and the `z.infer` types. `npm install` at the root links it (a *symlink*) into the root `node_modules`, so the backend and frontend can import it (with a few settings).
3. The backend uses the **schemas**; the frontend only the **types**: `import type { TelemetryNode1 } from "contract";`. A `type` import is dropped when compiling (`verbatimModuleSyntax`), so no Zod goes along to the browser. Scripts can also be run from the root (`npm run dev --workspace=backend`).

Why does this module still copy? Each folder can still run on its own, as in Modules 16–21. The backend (plain Node.js, TypeScript 7.0.2, imports ending in `.ts`) and the frontend (TypeScript 6.0.3, imports without an extension) are two worlds whose joining the author hasn't tested yet. Besides, the `GET /devices` schema writes `status` as `z.string()`, while `types.ts` is more precise (four choices). Zod only comes to the frontend in Module 24.

</details>

<details>
<summary><b>Why effects run twice: <code>StrictMode</code> in development mode</b></summary>

`<StrictMode>` in `src/main.tsx` deliberately **shakes** your components during `npm run dev`: every component is mounted, unmounted (the effect's cleanup runs), then mounted again, like an **evacuation drill**, so every effect runs twice, even an effect with `[]`. Component functions and updaters such as `n => n + 1` are also called twice to catch the ones that aren't pure. All of this happens **only in development mode**; the build sends one request.

This is how the `GET /devices` effect in `DeviceList` (Practice 5) goes, thanks to the `ignore` variable (Concept 8):

```text
mount    → effect 1  : its ignore is false, GET /devices no. 1 leaves
unmount  → cleanup 1 : effect 1's ignore becomes true
mount    → effect 2  : a new ignore is false, GET /devices no. 2 leaves
answer 1 arrives → its ignore is true  → thrown away
answer 2 arrives → its ignore is false → stored in state, the screen updates
```

Another way, `AbortController`, really **cancels** the request, but its `AbortError` has to be filtered out so it doesn't show as a red box. This module chooses `ignore`, the simpler pattern from the react.dev examples.

For **refresh once** (Practice 6.5), when the wristband runs out, two twin requests that are both answered with 401 could knock on `POST /auth/refresh` with the same season pass. The Module 20 backend forgives an old pass that shows up again within 30 seconds, but two knocks at almost the same moment haven't been tested by the author. So `refreshOnce()` in `api.ts` keeps **one shared promise**: the second request waits for the refresh in progress. Usually one refresh is logged; now and then two in a row (the second 401 arrives after the first refresh is done), and that's harmless.

Don't turn off StrictMode for a clean **Network** tab: the double requests never reach users, while the mistakes it catches would. This drill becomes even more valuable in Module 23, when effects open a *live* data connection that must be closed again.

</details>

<details>
<summary><b>The Vite proxy: another way without CORS, and why this module doesn't use it</b></summary>

Our dashboard calls the backend **cross-origin** (Concept 9). Many tutorials use a **proxy** in the Vite kitchen: the browser only talks to Vite, which forwards the requests to the backend like a receptionist. For example (**just read it, don't type it**):

```ts
  server: {
    port: 5173,
    strictPort: true,
    // EXAMPLE, not used in this module
    proxy: {
      '/auth': 'http://127.0.0.1:8080',
      '/devices': 'http://127.0.0.1:8080',
    },
  },
```

The page and the API are then **one origin**: no CORS, no *preflight*, no `credentials: "include"`, and no `localhost`/`127.0.0.1` trap. This module still chooses direct CORS because:

1. **The way is already prepared.** Since Module 20 (Practice 6), the default `CORS_ORIGIN` holds `http://localhost:5173`, and `localhost:5173` and `localhost:8080` are **one site**, so the `SameSite=Strict` cookies are still attached.
2. **The proxy only exists in Vite.** The dish in `dist/` is served by another server with its own forwarding rules (Modules 26–27), while the CORS lesson applies every time the page and the API have different addresses.
3. **Pages and data fight over addresses.** If the details screen later has the address `/devices/a4cf12e5b7c0` (React Router, Module 24), pressing **F5** there is forwarded by the proxy to the backend, and what shows is JSON, not the dashboard.
4. **The `Path=/auth` cookie.** The usual cure for number 3 is a `/api/…` prefix that the proxy removes (`rewrite`). But the season pass (the `session` cookie) is only attached to addresses starting with `/auth`, not `/api/auth/refresh`, so the refresh is always 401 and you're thrown back to the login screen every 15 minutes.

Note: Module 20's Concept 9 once said this module uses the Vite proxy; that sentence has been corrected.

</details>

<details>
<summary><b>No token in <code>localStorage</code>: XSS in more depth</b></summary>

A follow-up to Module 20's Concept 5 (`localStorage` can be read by JavaScript, an `HttpOnly` cookie can't): where XSS gets in, and what it can still do.

**Three ways in for XSS.**

1. **The data that's shown.** `name` and `location` are typed by the admin (Module 21). The author tested a `location` holding `<img src=x onerror="alert(1)">` with React 19.3.1, rendering the component to HTML text:

   ```text
   plain text   : <p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>
   dangerously  : <p><img src=x onerror="alert(1)"></p>
   ```

   Text in JSX (`<p>{location}</p>`) is escaped, so it shows as **writing**. `dangerouslySetInnerHTML` pastes it in as HTML, and `onerror` is ready to run; the React documentation warns about its XSS hole. Never use it for device or API data.
2. **npm libraries** run with full rights; that's why their versions are written down and there are few packages.
3. **Pasted code:** don't paste someone else's code into the **Console** tab while logged in.

**What can a foreign script still do?** While the tab is open, it can send requests in your name and read the answers (the origin `http://localhost:5173` is allowed by CORS), but it **can't** carry your wristband or season pass away. If the season pass (7 days) were in `localStorage`, a thief would only need to read it once, then exchange it again and again from their own computer; the Module 20 rotation alarm only goes off when a pass that was already replaced is used again.

See for yourself after logging in (Practice 4.4): in the **Console** tab, type `document.cookie`: the answer is `''` (empty); in the **Application** panel → **Cookies** → `http://localhost:5173`, `access` and `session` are ticked in the **HttpOnly** column; under **Local storage** there's no token. `HttpOnly` limits the damage, but the main rule stays: **show data as text inside `{ }`, not as HTML**.

</details>

<details>
<summary><b>What's in the <code>dist/</code> folder: the ready-to-serve dish</b></summary>

`npm run build` (Practice 8.2) cooks the **ready-to-serve dish**: `tsc -b` checks the types (an error stops the build), then `vite build` packs everything into `dist/`:

```text
dist/
├── index.html
├── favicon.svg                 ← copied from public/
└── assets/
    ├── index-<fingerprint>.js  ← your code, React, and React DOM
    └── index-<fingerprint>.css ← CSS made by Tailwind
```

- **`index.html`** now calls `/assets/index-….js` and `/assets/index-….css` (both `crossorigin`, in `<head>`), not `/src/main.tsx`.
- **`.js`**: all the modules are stitched together, then **compressed**: type labels, comments, and spaces are dropped, JSX becomes `jsx(…)`, and variable names are shortened.
- **`.css`**: only the Tailwind classes written whole in your code; that's why `STATUS_COLORS` in `Badge.tsx` doesn't join `"bg-" + color`.
- **The random letters** (for example `index-BuiDj2HR.js`) are a **fingerprint of the contents**: two separate builds of the final code get the same name, and changed contents get another name, so the browser doesn't mix it up with an old copy.
- **Without a `.map`** (*source map*), the code is hard to read, but it isn't secret: anyone can download it from the **Network** tab. That's why `VITE_…` **isn't a place for secrets**; its value is written straight into the `.js`.

`dist/` is in `.gitignore` and can be made again at any time. Open it through `npm run preview`, not by double-clicking `dist/index.html`: the address `/assets/…` means "from the root of the site", so the files are made to be served by a server. Even `vite preview` is only for checking (according to the Vite documentation, not for a real server); how to serve `dist/` is covered in Modules 26–27.

</details>

<details>
<summary><b>Trying it on a real phone over home Wi-Fi (optional)</b></summary>

> 🖥️ **Tools used:** a phone (Android or iPhone) connected to the **same home Wi-Fi** as the laptop, the VS Code `backend` and `frontend` terminals, and the `backend/.env` file.

The pass requirement uses DevTools device mode (Practice 7), because since Module 16 the backend only listens on `127.0.0.1`. This step opens it **for a while**, only to the home Wi-Fi; Module 23 opens it officially, and the internet follows in Module 27 together with HTTPS.

**Understand the risks first.**

- **Every device on the home Wi-Fi can knock on the backend and the Vite kitchen** (the login page, `/docs`, `/health`). The data stays behind the login and the guard, and a password guesser is held to 10 attempts per minute per IP address (Module 20).
- **It's still `http://`:** passwords and wristbands travel without encryption. Only do this on a home Wi-Fi you trust, not on café, campus, or boarding-house Wi-Fi.
- **The Vite kitchen serves your source code** to anyone; that's safe as long as there are no secrets in the frontend (Concept 4).
- **The most dangerous part is forgetting to undo it.** Do step 5 on the same day.

**The steps.**

1. **Find your laptop's IP address** (Module 10 Practice 7.1): `ipconfig` on Windows (the `IPv4 Address` line under `Wireless LAN adapter Wi-Fi:`), or `ipconfig getifaddr en0` on macOS. The example here is `192.168.1.10`; replace it with your address.
2. **Open the backend to the Wi-Fi.** In `backend/.env`, change `HOST` and add the phone page's origin to the end of `CORS_ORIGIN`:

   ```text
   HOST=0.0.0.0
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173
   ```

   `0.0.0.0` means "listen on all the laptop's doors", including the Wi-Fi; without the new origin in `CORS_ORIGIN`, the phone's browser holds back the backend's answers (Concept 9). Save, stop the backend (**Ctrl + C**), then run `npm run dev` again. The `API docs:` log line now writes `http://0.0.0.0:8080/docs`, a sign that every door is open (not an address to open).
3. **Open the Vite kitchen to the Wi-Fi.** If you ever filled in `VITE_API_BASE` in `frontend/.env.local`, put a `#` in front of that line first. In the `frontend` terminal, stop Vite (**Ctrl + C**), then run:

   ```text
   npm run dev -- --host
   ```

   (A `--` on its own passes `--host` on to Vite.) **Windows:** if a firewall permission window appears for **Node.js JavaScript Runtime**, allow it only for **Private** networks, and make sure your home Wi-Fi has the **Private network** profile (Module 10 Practice 7.2, steps 3–5). **macOS:** if you're asked whether `node` may accept incoming connections, choose **Allow**.
4. **Open on the phone** `http://192.168.1.10:5173` (not `localhost`: to the phone, `localhost` is the phone itself), then log in with `viewer@home.test`. Without changing the code, `api.ts` automatically calls `http://192.168.1.10:8080` (Concept 9); the page and the API are one site (the port doesn't count), so the `SameSite=Strict` cookies still work.
5. **Put everything back** on the same day:
   - In `backend/.env`, set `HOST=127.0.0.1` back and delete `,http://192.168.1.10:5173` from `CORS_ORIGIN`, then restart the backend.
   - Remove the `#` from `VITE_API_BASE` again (if there is one), then restart Vite with `npm run dev` without `--host`.
   - Check: `http://192.168.1.10:5173` on the phone no longer opens.

**If it doesn't work:** the page doesn't open → make sure it's the same Wi-Fi (not a guest network), the laptop's IP hasn't changed, the VPN is off, and the firewall allows Node.js. The message `Can't reach the server at http://localhost:8080` → `VITE_API_BASE` is still active; `… at http://192.168.1.10:8080` → check `HOST`, restart the backend, and check `CORS_ORIGIN` (no slash at the end). No styles → the phone is too old for Tailwind v4 ([🚨](#-troubleshooting)).

An honest note: the author hasn't tried this step with a real phone yet. Steps 2–4 were put together from the backend v1.0 code and this module's `api.ts`. If something is different on your phone, Module 23 covers it in full.

</details>

<details>
<summary><b>Next.js and similar frameworks (in brief)</b></summary>

React tutorials often use **Next.js**, a framework on top of React. According to [its documentation](https://nextjs.org/docs), a page's address is decided by the folder layout, and by default pages are **drawn on the server** (SSR).

| | Vite + React (this module) | Next.js |
| :--- | :--- | :--- |
| What arrives first | an almost empty `index.html`; React draws it in the browser | HTML with text in it, drawn on the server |
| Needs a special server? | No; `dist/` is enough as static files | Yes, for pages drawn on the server |
| Good for | dashboards behind a login, internal tools | public sites that search engines must find (SEO) |

Our dashboard is behind a login (SEO means nothing there), and the API and the login are already handled by the Fastify backend (Modules 16–21), so a second server only adds more to look after. The Syllabus places Next.js as background knowledge; the full dissection is in Module 24.

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** the same as Practice 6. **VS Code** with the `backend` terminal (backend v1.0, port 8080), the `frontend` terminal (Vite, port 5173), and one free terminal in the `frontend` folder for Git, `npm run lint`, and `npm run build`; the laptop path keeps the broker and simulator running. Then **Docker Desktop** (the `smarthome-db` container running), **Chrome or Edge** at `http://localhost:5173` with DevTools, and **Bruno** for the optional Level 1 experiment.

All three challenges change only the `frontend` folder. Do them **after** ➕ C, each on a new branch from `main` (`git switch main`, `git pull`, then `git switch -c feature/<challenge-name>`, for example `feature/pump-curtain-cards`), as in Modules 16–20. Before saving to the branch, `npm run lint` and `npm run build` must pass with no errors or warnings ([Practice 8](#practice-8--the-pass-tests-build-lint-and-a-dress-rehearsal-35-minutes)). If it's tidy, open its pull request as review practice with the **(Module 22)** items in the PR template.

The Level 1 and 2 keys (whole `DeviceDetails.tsx` files, built on top of [`code/frontend/`](code/frontend/) v0.1.0) are in [`code/challenges/key/`](code/challenges/key/). Both change the same file, so do them on two separate branches. Level 3 deliberately has no key.

### Level 1 — Pump and Curtain cards (a small change, 20 minutes)

Since Module 19 (contract 1.3), the `state` object in Node 1's `telemetry` holds **four** actuators: `fan`, `lamp`, `pump`, and `curtain`. The `State` type in `src/types.ts` already knows all four, but the device details only show **Lamp** and **Fan**. Add the other two:

| Card | Contents | Unit | Number color |
| :--- | :--- | :--- | :--- |
| **Pump** | `Watering` if `pump` is `true`, `Idle` if `false` | no unit | one Tailwind color of your choice while watering, the default color while idle |
| **Curtain** | the curtain servo's angle, from 0 to 180 | `°` | the default color |

1. Open **`frontend/src/components/DeviceDetails.tsx`**, then find the block `if (t.state !== undefined) {` in the `cardsNode1` function.
2. Add two new objects below the **Fan** object, still inside the same `cards.push(…)` parentheses. Follow the **Lamp** object (`label`, `value` with `? :` from warm-up Step 3, and `color`). **Curtain** only needs `label`, `value` from `t.state.curtain`, and `unit`.
3. Save (**Ctrl + S**). If the new cards don't show yet, go back to the list, then open the Node 1 details again (laptop path: `Practice living room`).
4. Open the Node 2 details too. The Pump and Curtain cards must **not** appear there.
5. Check in DevTools device mode at 375 px wide, as in Practice 7.

Hint: write the color as one **whole** Tailwind class, for example `"text-sky-600"` (Concept 3). The `label` is also the card's `key`, so it must differ from the other labels. The pump and curtain control buttons are only made in Module 24.

**You pass when:** the Node 1 (or `Practice living room`) details show **Pump** and **Curtain** after **Lamp** and **Fan**, the Node 2 details don't change, there's no horizontal scrolling at 375 px wide, and `npm run lint` and `npm run build` pass.

**Optional experiment: prove the number comes from the API.** First note the number on your **Curtain** card, then change the angle from Bruno, as in Modules 19–20.

1. In Bruno (the **`local`** environment), send **`login admin`**. Only an `admin` may command devices.
2. Open the **`lamp on`** request, right-click its **tab** → **Clone Request**, fill in **Request Name** with **`set practice curtain`**, then click **Clone**.
3. Change its URL to `{{baseUrl}}/devices/f00d00000001/command` (device path: use your Node 1's `device_id`; its servo really turns). Fill the **Body** tab with `{"target":"curtain","value":45}`, save (**Ctrl + S**), then click **Send**. The answer is 200, with `"ok": true` inside `ack`.
4. On the dashboard, go back to the list, then open the same device's details again. The **Curtain** card now says `45`.
5. Replace `45` in the **Body** with the angle you noted (simulator: `90`), then **Send** again. Don't leave it at 45: the backend remembers that angle as the desired state (Module 19), and sends it again if Node 1 or its simulator is restarted later and its curtain goes back to its starting position.

<details>
<summary><b>Level 1 answer key</b></summary>

Two new objects (plus one comment) go below the **Fan** object; the first and last lines below are already there. The whole file: [`code/challenges/key/level-1/frontend/src/components/DeviceDetails.tsx`](code/challenges/key/level-1/frontend/src/components/DeviceDetails.tsx).

```tsx
      { label: "Fan", value: t.state.fan ? "On" : "Off", color: t.state.fan ? "text-teal-600" : undefined },
      // Level 1 challenge: the two other actuators from the same state object (contract 1.3)
      { label: "Pump", value: t.state.pump ? "Watering" : "Idle", color: t.state.pump ? "text-sky-600" : undefined },
      { label: "Curtain", value: t.state.curtain, unit: "°" }, // the curtain servo's angle, 0-180 degrees
    );
```

- **Node 2 doesn't change**, because it never sends `state` and its details are built by `cardsNode2`.
- While the pump is idle, `color` is `undefined`, so `SensorCard` uses its default color.
- `Practice living room` now has ten cards. The simulator starts with the pump idle and the curtain at 90 degrees, so its new cards usually say `Idle` and `90`.
- **`Watering` is rarely seen**, because a pump command is only a 1–10 second pulse (Module 19), while the reading is fetched once when the details open. Send `{"target":"pump","value":10}` through `set practice curtain`, then reopen the details right away.

</details>

### Level 2 — A "Reload" button (fill in the blanks, 45 minutes)

Dashboard v0.1 fetches the reading **once**, when the details open (Concept 8), yet Node 1 and the simulator send a new reading every 10 seconds. Add a **Reload** button next to **← Back to the list**: every tap fetches `GET /devices/:id/latest` **once more**.

> [!IMPORTANT]
> **Manual, not automatic.** One tap, one request. Don't use `setInterval` to make the dashboard ask every few seconds (*polling*). Numbers that change by themselves are Module 23's material, through Socket.IO.

The way uses two new whiteboards (Concept 7), **`reloadCount`** and **`reloading`**. An effect runs again, complete with its `ignore` protection, every time the contents of its list change (Concept 8), so it's enough to write `reloadCount` in that list.

Fill in every `____`. All the changes are in **`frontend/src/components/DeviceDetails.tsx`**, from top to bottom.

**Blank 1**, right below the line `const [noReadingYet, setNoReadingYet] = useState(false); …`:

```tsx
  const [reloadCount, setReloadCount] = useState(____); // Challenge 2: goes up by 1 every time the Reload button is tapped
  const [reloading, setReloading] = useState(____); // Challenge 2: true while waiting for the reload's answer
```

**Blank 2.** Inside the effect, replace the lines from `setError(err instanceof …` to `}, [id, onSessionExpired]);` with this block. `.catch(…)` is now followed by `.finally(…)`, which runs after the promise settles, whether it succeeded or failed (as in `refreshOnce()`, Practice 6).

```tsx
        setError(err instanceof ApiError ? err.message : "Couldn't load the reading.");
      })
      .finally(() => {
        if (!ignore) setReloading(____); // Challenge 2: success or failure, the button works again
      });
    return () => {
      ignore = true;
    };
  }, [id, onSessionExpired, ____]); // Challenge 2: reloadCount changes = the effect runs again = the reading is fetched again
```

**Blank 3**, right below the effect, before the comment `// Pick ONE content …`:

```tsx
  // Challenge 2: called by the Reload button. Changing state in a click handler like this is fine;
  // fetching the data is still done by the effect above. The old cards stay on screen until the new answer arrives.
  function reload() {
    setError(null); // clear a leftover error or "no reading yet" from the previous try
    setNoReadingYet(false);
    setReloading(____);
    setReloadCount((n) => ____); // an updater function: take the latest value, add one
  }
```

**Blank 4.** In the `return` part, write `<div className="flex items-center justify-between gap-2">` right above the comment `{/* min-h-11 = … */}`, so the Back button shares a row with the new button. The first line of this block, the Back button's `</button>`, is already there; add the rest below it (the contents of the `<div>` may be moved two spaces to the right):

```tsx
        </button>
        {/* Challenge 2: a MANUAL reload; the button is dimmed while waiting so it isn't tapped again and again */}
        <button
          type="button"
          onClick={____}
          disabled={____}
          className="min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-4 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {reloading ? "Loading…" : "Reload"}
        </button>
      </div>
```

**Finally,** in the line `let message = "No reading …`, replace `then open it again.` with `then tap Reload.`.

Save, then test:

1. Open the Node 1 details (laptop path: `Practice living room`) and the **Network** tab (**Fetch/XHR**). Note the `updated at … WIB` time.
2. Wait about 10 seconds, then tap **Reload**. The time changes, and the old cards stay on screen while waiting. `Loading…` may only flash for a moment, because the backend on your laptop answers very fast.
3. Count the `latest` rows: two when the details first open (`StrictMode`), then **exactly one** per tap.
4. Stop the backend (**Ctrl + C**), then tap: a red box with the code 0 message replaces the cards, and the button works again. Start the backend (`npm run dev`), wait for `Server listening at http://127.0.0.1:8080`, then tap again. The backend's reading memory is empty after a restart, so usually the neutral note ending in `then tap Reload.` (404) appears. Wait at most 10 seconds, tap again: the cards are back, without **F5**.

**You pass when:** every tap sends exactly one `GET …/latest` and updates the time; the button can't be tapped while waiting; from both the error box and the "no reading yet" note, the screen recovers with **Reload** alone; and `npm run lint` and `npm run build` pass.

<details>
<summary><b>Level 2 answer key</b></summary>

The order of the answers: `0`, `false`, `false`, `reloadCount`, `true`, `n + 1`, `reload`, `reloading`. The whole file: [`code/challenges/key/level-2/frontend/src/components/DeviceDetails.tsx`](code/challenges/key/level-2/frontend/src/components/DeviceDetails.tsx). This key has no Pump and Curtain cards, so compare only the parts that changed.

- **`reloadCount` in the effect's list** is the heart of it: the effect doesn't read it, but runs again every time its number changes. The cleanup turns on the old effect's `ignore`, so a late old answer doesn't overwrite the new number. `npm run lint` only complains about the opposite: a value the effect reads but that isn't written in the list.
- **`setReloadCount((n) => n + 1)`** uses an updater function (Concept 7), which receives the board's latest contents.
- **`setReloading(true)` in the click handler** is exactly where it belongs; what `npm run lint` objects to is emptying a board at the start of an effect (Concept 8).
- **`setError(null)` and `setNoReadingYet(false)`** clear what's left from the previous try; without them, the red box or the "no reading yet" note keeps covering the cards (Concept 10).
- **`onClick={reload}`, without parentheses** (Concept 5). `onClick={reload()}` runs the function every time React draws; because it changes a board, React draws again, and so on until it's stopped with an error.
- **`disabled={reloading}`** turns the button off while waiting; `disabled:opacity-60` dims it.

</details>

### Level 3 — A summary of all the devices on one screen (from scratch, 60–90 minutes)

Make a **Summary** screen that shows the most important readings of **all** the devices at once, so every room's temperature can be seen without opening the details one by one.

**The task.** Make `src/components/Summary.tsx`, then put it in `App`. Every device from `GET /devices` gets one small card holding:

- the name (or the `device_id` if it has no name yet) and the badges from `Badge.tsx`, with `DeviceList`'s rule: a `revoked` or `unregistered` key gets no `status` badge;
- the latest temperature and humidity ("—" for `null`) and the `updated at … WIB` time;
- or, for a device answered with 404, a note such as `no reading yet`.

**New material: `Promise.all`.** With `await` inside a loop, the second `getLatest()` request only leaves after the first answer arrives. Remember the Module 4 buzzer: ordering at five stalls means holding five buzzers. `Promise.all(…)` takes that array of promises and gives you **one** buzzer that buzzes after **all** the orders are ready, holding an array of results in the **same order** as the promises.

Careful: as soon as **one** promise is rejected, that big buzzer is "rejected" too, and the other results are lost. Yet there's almost certainly a device that's answered with 404 (not registered, its key revoked, or just after the backend restarted). Try it first without handling it, so you see the effect yourself.

Hints:

- **Give every `getLatest(p.device_id)` its own `.catch`** before it goes into `Promise.all`: an `ApiError` with code 404 → return `null`; any other error → `throw err`, so a 401 still reaches `onSessionExpired` and a stopped backend still shows as an error box. (Another way: `Promise.allSettled`; look it up on MDN.)
- **One effect, two stages:** `getDevices()` first, then `Promise.all`. For `await`, make an `async` function inside the effect, then call it right away (Concept 8). The `ignore` pattern is still required; check it after the list arrives too, so an effect cleaned up by `StrictMode` doesn't send a single `latest`.
- **`reading.telemetry.temperature` is valid without checking the kind**, because `TelemetryNode1` and `TelemetryNode2` both have `temperature` and `humidity`.
- **Move `wibTime()`** to a new file, for example `src/time.ts`, then import it in both components. If you instead give it an `export` in `DeviceDetails.tsx`, `npm run lint` warns `Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.`
- **Put it in `App`:** add `{ name: "summary" }` to the `View` type, and two buttons, **List** and **Summary**. VS Code then underlines `view.device` in red, because the new choice has no `device`: TypeScript makes you handle the new screen explicitly.
- **The three states and the phone screen:** prepare loading, error, and empty (Concept 10); lay it out *mobile first*, for example `grid gap-3 sm:grid-cols-2`, with `min-w-0` and `truncate` (Practice 7).
- **Not allowed yet:** automatic refreshing, relative times such as "10 seconds ago", and charts (Module 23).

**You pass when:**

- **Summary** shows every device in **Device List**, and the ones answered with 404 still show with their note without breaking the screen.
- In **Network**, all the `latest` requests leave at almost the same moment, right after `devices` is answered. In development mode `devices` is logged twice (`StrictMode`), but every `latest` only once.
- If the backend is down, **Summary** shows an error box, not a loading text that never ends.
- After the `access` cookie is deleted in the **Application** panel (as in Practice 6), opening **Summary** again still works, without going back to the login form. **Network** usually logs **one** `refresh`, even though `devices` is answered with 401 twice; now and then two, one after the other, if the second 401 only arrives after the first `refresh` is done. That's normal too.
- At 375 px wide there's no horizontal scrolling, and `npm run lint` and `npm run build` pass.

**Reflect.** With a hundred devices, opening the summary means 101 requests, even though the hundred readings are in the same backend memory. Is it better to build the summary in the browser, or with one backend route that answers all at once? What are the pros and cons for the backend, for a phone on a slow network, and for your `api.ts`?

## ➕ Add-on to "Mini Smart Home"

This week Mini Smart Home gets a **face**: dashboard v0.1 in the browser, still static, but already logging in through an `HttpOnly` cookie and neat on both a phone and a laptop. The backend, broker, firmware, and data contract don't change at all. All the Practice 2–8 work is already saved as commits on the `feature/dashboard` branch, but that branch has never been sent to GitHub. Steps A and B prepare two documents, step C merges everything into `main` through the "dashboard v0.1" pull request, and step D saves your learning notes. Here's the whole project after this week:

![Project diagram of Mini Smart Home after Module 22. Subtitle: the house gets a face, dashboard v0.1 in the browser; dashed lines mean coming soon. The top row, all unchanged: Node 2 Garden, firmware v1.0.0 with an 18650 battery, unchanged and sending via Node 1 over ESP-NOW; Node 1 Home, firmware v1.6.0 with the broker key in NVS, account a4cf12e5b7c0, six columns (+ RS-485 trio), unchanged, sending MQTT with its key to the Raspberry Pi gateway 192.168.1.37. Inside the Pi: Mosquitto, locked, with allow_anonymous false, broker-passwd and acl-broker, unchanged (Module 21); and Node-RED with the old dashboard, the Garden card, and the RS-485 Sensor group, account nodered, unchanged. Top right: the Phone for Node-RED and Telegram; Telegram for alerts and /status, unchanged. Left: the box Broker clients on the laptop, unchanged (Module 21): MQTTX with the monitor account that reads only, the contract checker with the checker account, and the simulator (laptop path) f00d00000001 with its key in tools/.env; all of them connected over MQTT, each with its own account. Below it, the box To be honest, v0.1 is still: static, the numbers are fetched when the screen opens (live in Module 23); view only, no control buttons yet (Module 24); laptop only, phones over the home Wi-Fi from Module 23 and the internet in Module 27; minimal login, protected routes and roles come later (Module 24). Middle, the big Laptop box (backend + dashboard). Inside it, the green box backend v1.0, unchanged: Fastify + TypeScript, data contract 1.4, locked for people and devices (Modules 20–21); CORS_ORIGIN has included http://localhost:5173 since Module 20, ready and waiting; the access and session cookies are HttpOnly and SameSite=Strict. The API used by the dashboard: POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me, GET /devices, and GET /devices/:id/latest; the rest (commands, rules, history) waits for Modules 23–24. Green arrows msh/# from the broker to the backend and cmd from the backend to the broker; a green line from the backend to Telegram labeled internet: outbound HTTPS, long polling. To the right of the backend: the blue box Docker Desktop smarthome-db, PostgreSQL 17 + TimescaleDB 2.30.2, unchanged; and the box Bruno, small terminal, /docs, still usable, as in Modules 16–21, unchanged. Below the backend, the purple box frontend v0.1 (new): folder frontend/, React 19 + TypeScript + Tailwind CSS v4, set up by Vite 8. A purple arrow from the frontend to the backend labeled fetch + cookie access, credentials: include, CORS, and a green arrow back labeled JSON. Inside the frontend box: Vite dev server, npm run dev, run in the frontend folder, serves http://localhost:5173 as HTML, JavaScript, and CSS, and changes at once when a file is saved (HMR); npm run build checks the types (tsc -b), then prepares the ready-to-serve dish in the dist/ folder. An arrow to the box browser (Chrome or Edge): dashboard v0.1 at http://localhost:5173 with three mini screens in a row, Login (two input fields and a Log in button), Device List, and Device Details (a grid of cards for Node 1 living room); neat on a phone, checked in DevTools device mode (375 px); React DevTools shows its component tree. Bottom left, the box GitHub mini-smart-home, branch feature/dashboard heading for a pull request to main; the pull request dashboard v0.1 reviewed with the (Module 22) items, then merged. The new or changed files: frontend/package.json and package-lock.json, mini-smart-home-frontend 0.1.0; frontend/vite.config.ts, Tailwind and port 5173 strictPort; frontend/index.html, the title Mini Smart Home; frontend/src/index.css, @import tailwindcss; frontend/src/main.tsx, from the template; frontend/src/types.ts, types from Appendix A; frontend/src/api.ts, one door, refresh once; frontend/src/App.tsx, login, list, then details with plain state; frontend/src/components/SensorCard.tsx, Login.tsx, and Badge.tsx, new; frontend/src/components/DeviceList.tsx and DeviceDetails.tsx, new; frontend/.env.example, example VITE_API_BASE; frontend/.gitignore, plus .env; frontend/README.md, how to run it, accounts, and the limits of v0.1; frontend/tsconfig*.json, .oxlintrc.json, and public/favicon.svg, from the template; .github/pull_request_template.md, plus dashboard items (Module 22). Removed from the template: src/App.css, src/assets/, and public/icons.svg. A padlock box: never in Git, frontend/.env.local, frontend/node_modules/, and frontend/dist/. Bottom right, the purple card Phase 4 begins: the house gets a face, dashboard v0.1; the Phase 4 Checkpoint is in Module 25. Below it, three dashed cards coming soon: Module 23, live data, charts, gauges, history, status, and phones over Wi-Fi; Module 24, control buttons, rule forms, roles, and protected routes; Module 25, Grafana, a device map, reports, and the Phase 4 Checkpoint.](assets/project-diagram-module-22.png)

Only the purple **frontend v0.1** box is new. The dashboard uses six backend routes: the three `/auth` ticket booths (log in, exchange the season pass for a new wristband, log out), `GET /auth/me`, `GET /devices`, and `GET /devices/:id/latest`. The **To be honest, v0.1 is still:** box matches the **Limits of v0.1** section of the step A README, and the three dashed cards at the bottom right follow in Modules 23–25.

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and its terminal (first in the `frontend` folder, then at the `mini-smart-home` root), a **browser** already logged in to GitHub, and in step D a second VS Code window with the `learn-iot` folder. The backend, simulator, and Vite don't need to be running. If Vite is still running, stop it with **Ctrl + C** before step C.
>
> ⭐ **Required** — step C merges dashboard v0.1 into `main`, and Module 23 starts from there.

| Files in the pull request | Step |
| :--- | :--- |
| From the template and `npm install`: `frontend/package.json`, `package-lock.json` (version **0.1.0**), `vite.config.ts`, `index.html`, `src/index.css`, `.gitignore`, plus the unchanged `src/main.tsx`, `tsconfig*.json`, `.oxlintrc.json`, and `public/favicon.svg` | Practices 2 and 8 |
| **New**: `frontend/src/types.ts`, `src/api.ts`, `.env.example`, five components in `src/components/`, and the rewritten `src/App.tsx` | Practices 2–7 |
| `frontend/README.md` | A |
| `.github/pull_request_template.md` | B |

`frontend/node_modules/`, `dist/`, and `.env.local` (if it exists) **never go into Git**; `frontend/.gitignore` ignores all three.

### A. Write `frontend/README.md`

A teammate who clones your repository has to know what can't be guessed from the code: the dashboard needs backend v1.0 running with its data source, must be opened at `http://localhost:5173` (not `127.0.0.1`), and logs in with a Module 20 account. Your `frontend/README.md` is still the Vite template's default notes. Open [`code/frontend/README.md`](code/frontend/README.md) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of the `README.md` inside the `frontend` folder (not the one at the repository root). Save (**Ctrl + S**).

What's in it: **How to run it** (five steps up to logging in, plus a table of four npm commands), **Backend address** (`.env.local` is optional, Concept 9), **What's in the `src/` folder**, **Login and security**, and an honest **Limits of v0.1**, like the backend README since Module 16: static, no control buttons, only from this laptop, and "tidy on a phone" only checked with DevTools device mode so far. This README names the accounts, but **never** their passwords (safety rule number 1). Press **Ctrl + Shift + V** (macOS: **Cmd + Shift + V**) to see it as it looks on GitHub.

### B. Add the dashboard items to the pull request template

Since Module 16, every pull request holds the checklist from `.github/pull_request_template.md`, and Modules 20–21 added backend security items. The dashboard gets three items of its own, marked **(Module 22)**. Open [`code/.github/pull_request_template.md`](code/.github/pull_request_template.md) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of your `.github/pull_request_template.md` (the `.github` folder is at the root of `mini-smart-home`, not inside `frontend`). Save. Its contents are exactly the Module 21 template, plus these three items:

```markdown
- [ ] **(Module 22)** If `frontend/` changed: in the `frontend` folder, `npm run build` and `npm run lint` pass with no errors and no warnings
- [ ] **(Module 22)** No secrets in `VITE_…` variables (they all go to the browser), and `frontend/.env.local` doesn't go into Git; only `frontend/.env.example` without secret values may
- [ ] **(Module 22)** The dashboard doesn't keep passwords or tokens in `localStorage` (login only through the backend's `HttpOnly` cookie, `fetch` with `credentials: "include"`), and API data is shown as JSX text, without `dangerouslySetInnerHTML`
```

The first item is in the **Checklist before merging**, right below `npm run check`: the frontend's type checker is `npm run build` (`tsc -b`, Concept 4). The other two follow the three Module 21 items in the **Security checklist** (safety rules 1–3).

### C. ⭐ Merge `feature/dashboard` into `main` via the "dashboard v0.1" pull request

First go up from the `frontend` folder to the repository root, then check what changed:

```text
cd ..
git status
```

There must be exactly two files with the status `modified`: `.github/pull_request_template.md` and `frontend/README.md`. If there are other files, for example `frontend/package.json`, first do the save step at the end of Practice 8. Once the list is right, save both documents and send the branch to GitHub:

```text
git add frontend/README.md .github/pull_request_template.md
git commit -m "Dashboard v0.1 docs: frontend README and Module 22 items in the pull request template"
git push -u origin feature/dashboard
```

This is this branch's first push (`-u` records its partner on GitHub), and it also carries every commit since Practice 2.

1. **Open a pull request.** On GitHub, click **Compare & pull request** on the yellow banner of the `feature/dashboard` branch (or the **Pull requests** tab → **New pull request**, **base: `main`** ← **compare: `feature/dashboard`**). Give it the title `Dashboard v0.1`. Under **What changed?**, write, for example: `Dashboard v0.1 (frontend 0.1.0, React + TypeScript + Tailwind CSS v4): login with an HttpOnly cookie, the device list, and the latest reading of every sensor, tidy at 375 px wide. Plus the frontend README and three (Module 22) items in the pull request template. Backend, tools, edge, and DATA-CONTRACT.md unchanged.` GitHub only uses the template that's already on `main` (Module 16 Practice 8.1), so the new **(Module 22)** items only appear by themselves in the next pull request. This time, copy the three of them from `.github/pull_request_template.md` in VS Code to below the description, then click **Create pull request**.
2. **Review with the (Module 22) items.** Tick only what's really met:
   - The **Files changed** tab holds **23 files**: 22 new files in the `frontend` folder plus the pull request template. There **must be no** `frontend/.env.local`, `frontend/.env`, `frontend/node_modules/`, `frontend/dist/`, or files from `backend/`, `tools/`, and `edge/`. In `frontend/.env.example`, the `VITE_API_BASE` line still starts with `#`. If the count differs, compare with [`code/frontend/`](code/frontend/).
   - Build and lint: the proof is Practices 8.1 and 8.2, and the two documents after that don't change the code.
   - `VITE_…` and `.env.local`: ask Git whether both settings files are ignored. This command works even if you never made `.env.local`:

     ```text
     git check-ignore -v frontend/.env.local frontend/.env
     ```

     **Expected output:**

     ```text
     frontend/.gitignore:13:*.local	frontend/.env.local
     frontend/.gitignore:15:.env	frontend/.env
     ```

     Each line names the rules file, the line number, and the rule that catches it. If one of the files isn't mentioned, that file is **not** ignored; check `frontend/.gitignore` again (Practice 2.5).
   - `localStorage`: search the dashboard code for the two forbidden words:

     ```text
     git grep -n -e localStorage -e dangerouslySetInnerHTML frontend/src
     ```

     This command must print nothing. The search is limited to `frontend/src`, because the README does mention both. You've already seen the rest of the proof: the `access` cookie in the **Application** tab (Practice 4.4) and refresh once without a token in JavaScript (Practice 6.5).
   - The old items: the backend, tools, edge, and `DATA-CONTRACT.md` didn't change, so their items (`npm run check`, `npm test`, `allowScripts`, Bruno, `/docs`, the three **(Module 21)** items) may be ticked. You didn't change `CORS_ORIGIN`; `http://localhost:5173` has been there since Module 20. The `frontend` packages were installed with exact versions (Practice 2), recorded in `package-lock.json`, and `npm install` answers `found 0 vulnerabilities`.

   Send the summary through **Review changes** → **Comment** → **Submit review**. If a forbidden file got in, **don't merge**: take it out with `git rm --cached frontend/.env.local` (a folder: `git rm -r --cached frontend/node_modules`), make sure `frontend/.gitignore` catches it, then commit and push again. If what got in is a password or token, treat it as leaked and change it first, as in Module 20.
3. **Merge.** Choose **Create a merge commit**, click **Merge pull request** → **Confirm merge**, then **Delete branch**.
4. **Back to `main`.** In the terminal at the `mini-smart-home` root (Vite already stopped):

   ```text
   git switch main
   git pull --prune
   git branch -d feature/dashboard
   ```

   Don't be surprised if, right after `git switch main`, the `frontend` folder is almost empty: `main` on your laptop doesn't know the dashboard yet, so only what never went into Git is left (`node_modules`, plus `dist` and `.env.local` if they exist). `git pull --prune` fetches the merge from GitHub, and all the files come back without another `npm install`. If the backend is running, `npm run dev` in the `frontend` folder shows the dashboard exactly as before.

The backend, database, and broker aren't affected: the `backend` folder is the same on both branches, and the Module 21 devices stay registered.

### D. Save your learning notes

Open the **`learn-iot`** repository in a new VS Code window (**File → New Window**, then **File → Open Folder…**), create **`module-22/notes.md`** next to `warmup.js` and `card.html`, then fill it in with the numbers from your own screen:

```markdown
# Module 22 notes — Dashboard v0.1

| What I measured | My number |
| :--- | :--- |
| Sensor cards on the Node 1 details, or f00d00000001 on the laptop path (Practice 6) | … cards |
| The "updated at … WIB" time on those details, and my laptop's clock at that moment (Practice 6) | … WIB / … |
| GET /devices rows in the Network tab when the dashboard opens with npm run dev (Practice 5) | … times |
| New requests in the Network tab after I deleted the access cookie and tapped the device again (Practice 6) | … |
| The JavaScript file in dist/ (gzip column) and the npm run build time (Practice 8) | … kB, … ms |
| Files in the Files changed tab of the "dashboard v0.1" pull request (➕ C) | … files |

What surprised me most: …
```

If your laptop uses WITA or WIT, the second row shows the difference, because the dashboard always writes WIB time. Commit and push in the **`learn-iot`** repository.

**Evidence for passing Module 22** (compare it with ✅ below): after logging in, the Node 1 and Node 2 details (laptop path: `f00d00000001`) show the latest readings of all the sensors from the API, matching Bruno's answer (Practice 6); the dashboard is neat with no horizontal scrolling at 375 px wide (Practice 7); the dress rehearsal of the pass requirement succeeds in one go (Practice 8); and the "dashboard v0.1" pull request has been reviewed with the **(Module 22)** items, then merged (➕ C).

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Build** and **`dist/`** | `npm run build` checks the types (`tsc -b`), then Vite packs the "ready-to-serve dish" in `dist/`, which you taste with `npm run preview`. |
| **`HttpOnly` cookie** and **`SameSite=Strict`** | Marks on the wristband and season pass: JavaScript can't read them, and they're only attached to requests from a page on the same site (`localhost` with `localhost`, not `127.0.0.1`). |
| **CORS** (*Cross-Origin Resource Sharing*) | Permission in the backend's response headers so a page from another origin, such as `http://localhost:5173`, may read the response; the list is in `CORS_ORIGIN` (Module 20). |
| **`credentials: "include"`** | A `fetch` option so the browser stores and attaches cookies for a backend at another origin; without it, the wristband never reaches the guard. |
| **CSS** (*Cascading Style Sheets*) | The page's "skin": rules for color, size, spacing, and layout. |
| **DevTools** | The built-in tools of Chrome and Edge (**F12**): **Elements**, **Console**, **Network**, **Application** (cookies), and device mode to imitate a phone's width. |
| **DOM** (*Document Object Model*) | The tree of elements the browser builds from HTML, which JavaScript can change; the **Elements** tab shows it. |
| **`fetch`** | The built-in function for sending HTTP requests; it only fails if the server can't be reached or CORS blocks it, so you check 401 and 404 yourself with `res.ok`. |
| **HMR** (*Hot Module Replacement*) | Vite puts newly saved code into the open page without reloading it. |
| **HTML** (*HyperText Markup Language*), **tag**, **element**, and **attribute** | HTML is the page's "skeleton", written with tags such as `<p>` and `</p>`; an element is one whole part, from the opening tag to the closing tag, with its contents; an attribute is extra information in the opening tag, such as `href="/on"`. |
| **JavaScript** | The page's "muscles": code in the browser that responds to clicks, fetches data, and changes the page's contents without reloading. |
| **JSX** | HTML-like writing in `.tsx` files, with `className` instead of `class` and `{}` as a window into JavaScript. |
| **Class** and ***utility class*** | A name on an element (in JSX: `className`) that CSS rules use; each Tailwind *utility class* sets one thing, such as `p-4` or `text-2xl`. |
| **`key`** | A unique name tag for every element made by `map()`, so React knows which item is which; the dashboard uses `device_id`. |
| **Component** | A "LEGO brick" of the display: a function starting with a capital letter, such as `SensorCard`, that returns JSX and can be used many times. |
| **Lint** and **oxlint** | Checking for error-prone habits without running the code; the create-vite 9.3.1 template uses oxlint through `npm run lint`. |
| ***Props*** | What a parent component "hands down" to a child, such as `label`, `value`, and `unit` for `SensorCard`; the child only reads them. |
| **React** | A library for building a display out of components; it draws again when state changes and only changes the parts that differ. |
| **React DevTools** | A browser extension that adds the **Components** tab (the component tree, props, state) and **Profiler** to DevTools. |
| **Refresh token** ("season pass") | The `session` cookie (at most 7 days), only carried to the `/auth/…` ticket booths; when the 15-minute wristband runs out, `api.ts` exchanges it once at `POST /auth/refresh` for a new wristband. |
| ***Render*** | When React calls a component function to work out its display; the parts that differ are only written to the page in the commit phase. |
| **Responsive**, ***mobile first***, and **breakpoint** | The page layout adapts to the screen width, starting from the phone: styles without a prefix apply at every width, and styles with a prefix apply from their breakpoint up (`sm:` 40rem/640 px, `md:` 48rem/768 px, `lg:` 64rem/1024 px). |
| ***State*** and **`useState`** | A component's "small whiteboard", `const [value, setValue] = useState(initial)`: its contents are remembered between two renders, and `setValue` makes the screen draw again. |
| **StrictMode** | `<StrictMode>` in `main.tsx`: only in development mode, every component is remounted once, so effects run twice and `GET /devices` shows twice in the **Network** tab; in the build, only once. |
| **Tailwind CSS** | A collection of ready-made utility classes; version 4 only needs the `@tailwindcss/vite` plugin and `@import "tailwindcss";`, without `tailwind.config.js`. |
| **The three states** | Loading, error, and empty: always prepared on every screen that fetches data, besides its result (the station information board). |
| **`useEffect`** | A hook for work after the screen appears ("sit down first, then order"); with `[]` it runs once when the component is mounted, and the `ignore` cleanup throws away late answers. |
| **Vite** | The `npm run dev` "kitchen" at `http://localhost:5173`, and also the packer of the build; it removes TypeScript type labels without checking them. |
| **`VITE_…`** and **`.env.local`** | Variables starting with `VITE_`, such as `VITE_API_BASE`, are built into the JavaScript sent to the browser, so they're only for addresses, never secrets; `.env.local` is where you write them, and it doesn't go into Git. |
| **XSS** (*cross-site scripting*) | A foreign script that manages to run in your page; JSX blocks it by escaping text from the API (device names show as plain writing), as long as `dangerouslySetInnerHTML` isn't used. |

## 📝 5-Question Quiz

1. Open `page-m10-original.html` from Practice 1 again. (a) Which parts are its skeleton, skin, and muscles? (b) Do its muscles work in the browser or in the ESP32? (c) Why can reloading the page after tapping **Turn the lamp on** command the lamp once more? (d) How is that different from the buttons with `addEventListener` in Practice 1?
2. In dashboard v0.1: (a) Props or state, and which component's: the contents of the email box in the login form; `Temperature` and `28.1` in a `SensorCard`; the device list from `GET /devices`; `DeviceList`'s error message when the database is down? (b) A friend keeps the email in a plain variable `let email = ""` and changes it in `onChange`, without `useState`. Why doesn't it work? (c) Another friend writes `value={email}` from `useState`, but forgets `onChange`. What happens when they type?
3. The `GET /auth/me` effect in `App.tsx` ends with `[]`, and `DeviceList` fetches `GET /devices` in a `useEffect` with an `ignore` cleanup. (a) What does `[]` mean? (b) When the dashboard is opened while already logged in, the **Network** tab shows `GET /auth/me` and `GET /devices` twice each. Why, and is that an error? How many times with `npm run preview`? (c) What does `ignore` prevent? (d) Why is `POST /auth/login` sent from `onSubmit`, not from `useEffect`?
4. A friend runs `npm run dev -- --host 127.0.0.1` with `VITE_API_BASE=http://localhost:8080` in `.env.local`, opens `http://127.0.0.1:5173`, then logs in: `POST /auth/login` is answered with **200**, the device list screen appears for a moment, then it goes back to the login form. (a) Why? (b) Why doesn't refresh once in `api.ts` help? (c) Name two ways to fix it. (d) Without `--host`, why doesn't `http://127.0.0.1:5173` open on the author's Windows laptop?
5. What shows, and which state is it (loading, error, empty, success, or back to the login)? (a) Just after you tap Node 1, before its answer arrives. (b) The backend was just restarted, then you open the `f00d00000001` details before the simulator sends again. (c) You stop the `smarthome-db` container, then go back from the details to the list. (d) The dashboard has been open for 20 minutes, then you tap Node 1 again (what do you see in the **Network** tab?). (e) You last logged in 8 days ago, and you open `http://localhost:5173`. (f) Which three signs do you check in device mode at 375 px wide?

<details>
<summary><b>Answer key</b></summary>

1. (a) The **skeleton (HTML)** is almost all of it: `<head>`, `<h2>`, `<p>`, `<b>`, the links `<a href="/on">` and `<a href="/off">`, `<br>`, and `<small>`. The **skin (CSS)** is only the `style` attribute on `<body>` plus the browser's default styles. **Muscles (JavaScript)**: **none**. (b) In the **ESP32**: `server.on("/on", …)` handles the tap, then `html.replace(…)` fills in placeholders such as `%LAMP%` and sends a whole new page (Concept 2). (c) The link sends **`GET /on`**, and the ESP32 answers with a new page without redirecting, so the address bar still ends with `/on`; reloading = `GET /on` again. (d) The buttons with `addEventListener` work **in the browser**: the text is replaced through `textContent`, without a request to the server and without reloading. The muscles move to the browser: the leap that React carries on (Practice 1).
2. (a) The email box contents: ***state*** of `Login`. `Temperature` and `28.1`: the ***props*** `label` and `value` from its parent (`App` in Practice 3, `DeviceDetails` since Practice 6), which `SensorCard` only reads. The device list (`null` while loading) and its error message: ***state*** of `DeviceList` (Concepts 6–7). (b) A plain variable **isn't remembered** between two renders (`email` goes back to `""` every time the component function is called), and changing it **doesn't make the screen draw again**. (c) The box **can't be typed in**, because it's locked to a state that never changes, and the **Console** warns about a read-only field (`This will render a read-only field.`). A controlled form always needs the `value` and `onChange` pair (Practice 4).
3. (a) An empty dependency list: the effect runs **once**, after `App` first appears (Concept 8). (b) In development mode, `<StrictMode>` remounts every component once: the effect runs, is cleaned up, then runs again, to catch effects that forget to clean up. **Not an error.** With `npm run preview`, each shows up **once**. (c) **An old answer overwriting a newer state**: after the cleanup, `ignore` is `true`, so a late answer doesn't reach `setDevices`. (d) Logging in is a **user action** (the **Log in** button is pressed), not something to sync every time the screen appears. In an effect, it would run by itself, even twice in development mode; it belongs in an event handler such as `onSubmit` (Concepts 7–8).
4. (a) `127.0.0.1` and `localhost` are **two different sites**. CORS allows `http://127.0.0.1:5173` (it's in the default `CORS_ORIGIN`), so the login is answered with **200**, but the browser **doesn't store** the `SameSite=Strict` cookies from that cross-site response. `GET /devices` leaves without a wristband and is answered with **401** (Concept 9). (b) The season pass (`session`) was never stored either, so `POST /auth/refresh` is **401** too, and `DeviceList` sends your friend back to the form: **a login loop** (🚨). (c) First: run `npm run dev` without `--host` and open **`http://localhost:5173`**. Second: delete or empty `VITE_API_BASE` in `.env.local`, stop `npm run dev` (**Ctrl + C**), then run it again; the API address goes back to **following the page's host name** (`127.0.0.1:5173` knocks on `127.0.0.1:8080`). If `VITE_API_BASE` needs a value, use the same host name as the page. (d) With the default settings, Vite listens on `localhost`, which on the author's Windows laptop is only the IPv6 `[::1]`; `127.0.0.1` is IPv4, so nothing answers (Concept 9).
5. (a) **Loading**: the loading text, because the data is still `null`. (b) The backend keeps the latest reading in **memory**, so `GET /devices/f00d00000001/latest` is answered with **404** until the simulator sends again. `DeviceDetails` shows a **neutral note** (no reading since the backend started), not a red error box (Concept 10, Practice 6). (c) **Error**: `GET /devices` is answered with **503**, and the error box holds `the database can't be reached right now, try again shortly`. If you press **F5**, `GET /auth/me` fails too (not a 401), and its message shows as `initialError` above the login form (Practice 5). (d) **Success**, without you noticing. The browser threw the wristband away after 15 minutes, so `GET …/latest` is answered with **401**; `api.ts` knocks on **`POST /auth/refresh`** once (200), then repeats the request. In the **Network** tab, that refresh shows between the 401 and the 200 `latest` rows (Concept 9, Practice 6). (e) **Back to the login**: the browser has thrown away the season pass (at most 7 days), so `GET /auth/me` and the refresh are both 401, and the form shows without an error box, because an expired session isn't a fault. (f) **No horizontal scrolling**, **every card whole**, and **long text** (device names, `device_id`) cut off neatly without making the page header spill over (Concept 11, Practice 7).

</details>

---

## ✅ Module 22 Completion Checklist

The pass requirement from the Syllabus: **after logging in, the dashboard shows the latest readings of all the sensors from the API, laid out neatly on a phone screen.** **The path without a device:** every item may be ticked with the Module 21 simulator and the practice device `f00d00000001`, which stand in for Node 1 and Node 2 (the Node 2-only parts can just be read). **The phone screen** is checked with DevTools device mode; a real phone over Wi-Fi is optional, in 🔬.

- [ ] `warmup.js` gets the `GET /health` answer from backend v1.0 without logging in, and my answers match the "Self-test answer key" (🔁).
- [ ] `card.html` shows in the browser without installing anything, and the number I changed in the **Elements** tab goes back when the page is reloaded (Quick Win).
- [ ] I've taken apart the Module 10 Node 1 page in **Elements** and given it skin (`<style>`, classes) and muscles (buttons that change the text without reloading); the plain form's contents are printed by `webhook-receiver.js`, and a JSON `fetch` from the same page is refused by CORS in the **Console** (Practice 1).
- [ ] The `frontend` project made with `npm create vite@9.3.1` runs at `http://localhost:5173` with Tailwind v4 and no `tailwind.config.js`, React DevTools shows its component tree, and `git status` on the `feature/dashboard` branch doesn't mention `node_modules` (Practice 2).
- [ ] `SensorCard` is reused for every reading with props typed from `src/types.ts`, and the typo `humidty` is marked by VS Code right away and refused by `npm run build` (Practice 3).
- [ ] ⭐ The login form logs me in with a Module 20 account: **Network** shows `POST /auth/login` (usually preceded by an `OPTIONS` *preflight*) answered with 200, the `access` cookie shows in **Application**, and a wrong password or a stopped backend is answered with a message people understand (Practice 4).
- [ ] When it opens, the dashboard asks `GET /auth/me`, then picks the login form or the device list by itself; the list shows the `status` and `key` badges (`revoked` stands out) and the loading, error, and empty states; I know why `GET /devices` shows up twice in development mode, and **Log out** takes me back to the form (Practice 5).
- [ ] ⭐ After logging in, the Node 1 and Node 2 details show **all their sensors** from `GET /devices/:id/latest`, with the device's name and location in the heading, the "updated at … WIB" time, and "—" for a `null` reading, matching Bruno's answer (Practice 6).
- [ ] A device with no reading since the backend started shows a neutral note (404), and after I delete the `access` cookie in **Application**, tapping a device again still works, with `POST /auth/refresh` in **Network** (Practice 6).
- [ ] ⭐ In DevTools device mode at 375 px, 768 px, and 1280 px wide, the dashboard can't be scrolled horizontally, every card is whole, and long text is cut off neatly without making the page header spill over (Practice 7).
- [ ] ⭐ `npm run lint` is clean, `npm run build` passes, `npm run preview` serves what's in `dist/`, `package.json` has version `0.1.0`, and the dress rehearsal of the pass requirement succeeds in one go: login → all the Node 1 and Node 2 sensors → 375 px wide (Practice 8).
- [ ] `frontend/README.md` exists, the pull request template has the **(Module 22)** items, and my learning notes are saved in `learn-iot/module-22/notes.md` (➕ A, B, and D).
- [ ] ⭐ All the Module 22 work is on `main` through the "dashboard v0.1" pull request, reviewed with the **(Module 22)** items: no `.env.local`, no secrets in `VITE_…`, and no token in `localStorage` (➕ C).

🎉 **Phase 4 begins.** Mini Smart Home now has a face: a page you built that asks for a login, keeps the session without ever holding a token, shows every device with its key badge, and serves the latest readings of all the sensors with a WIB time, neat on both a phone and a laptop. Its numbers still stand still: a card only changes when its device's details are opened again. Making them move by themselves is the next module's job; three more modules lead to the Phase 4 Checkpoint in Module 25: a dashboard other people can use from a phone without help.

> ➡️ **Next module:** Module 23 — Realtime Dashboard: Charts, Gauges, History, & Status. The dashboard's numbers move by themselves as soon as a reading arrives through Socket.IO (with the same login cookie), a *live* temperature chart and 7 days of history can be read and explored, status cards show which devices are alive and when they were last seen, and the dashboard starts being opened from a real phone over the home Wi-Fi.

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- **React 19.3.1** ([react.dev](https://react.dev/learn)): [JSX](https://react.dev/learn/writing-markup-with-jsx), [props](https://react.dev/learn/passing-props-to-a-component), [lists and `key`](https://react.dev/learn/rendering-lists), [state](https://react.dev/learn/state-a-components-memory), [preserving state](https://react.dev/learn/preserving-and-resetting-state), [effects and fetching data](https://react.dev/learn/synchronizing-with-effects) (the `ignore` pattern), [`StrictMode`](https://react.dev/reference/react/StrictMode), [the rules of hooks](https://react.dev/reference/rules/rules-of-hooks), [render and commit](https://react.dev/learn/render-and-commit), and [React DOM element attributes](https://react.dev/reference/react-dom/components/common) (`dangerouslySetInnerHTML`). JSX escaping text was tested by the author with `react-dom/server` (Concept 5 and 🔬).
- **Vite 8.3.5** ([vite.dev](https://vite.dev/guide/), requires Node.js 20.19+ or 22.12+): [features](https://vite.dev/guide/features) (HMR, TypeScript without type checking), [environment variables](https://vite.dev/guide/env-and-mode), the [dev server](https://vite.dev/config/server-options) and [preview](https://vite.dev/config/preview-options) options; [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) 6.1.2.
- **create-vite 9.3.1**: [source code](https://github.com/vitejs/vite/tree/main/packages/create-vite) and the `react-ts` template, read from the project it makes.
- **Tailwind CSS 4.3.3**: [installing with Vite](https://tailwindcss.com/docs/installation/using-vite), [upgrading from v3](https://tailwindcss.com/docs/upgrade-guide) (requires Chrome 111+, Safari 16.4+, Firefox 128+), [utility classes](https://tailwindcss.com/docs/styling-with-utility-classes) and [how they're detected](https://tailwindcss.com/docs/detecting-classes-in-source-files), [responsive design](https://tailwindcss.com/docs/responsive-design), and [`hover` and `focus`](https://tailwindcss.com/docs/hover-focus-and-other-states).
- **TypeScript 6.0.3**: the [`tsconfig` reference](https://www.typescriptlang.org/tsconfig/) and the [6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/). **oxlint 1.89.0**: the [Oxc linter documentation](https://oxc.rs/docs/guide/usage/linter).
- **MDN Web Docs**: [HTML, CSS, and JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development), [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) and [`credentials`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) (and the `null` value in [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin)), [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [site](https://developer.mozilla.org/en-US/docs/Glossary/Site), [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting), and [`toLocaleTimeString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString) (`en-GB` for a 24-hour clock); [RFC 6265 §8.5](https://www.rfc-editor.org/rfc/rfc6265#section-8.5) (cookies aren't separated by port).
- **Browser DevTools**: Chrome DevTools ([Console](https://developer.chrome.com/docs/devtools/console), [Network](https://developer.chrome.com/docs/devtools/network/reference), [device mode](https://developer.chrome.com/docs/devtools/device-mode), and [cookies in Application](https://developer.chrome.com/docs/devtools/application/cookies)) and [Microsoft Edge DevTools](https://learn.microsoft.com/en-us/microsoft-edge/devtools/landing/).
- **React DevTools 8.0.0**: the [guide](https://react.dev/learn/react-developer-tools), the [release notes](https://github.com/facebook/react/blob/main/packages/react-devtools/CHANGELOG.md), and its source code in the same repository.
- **npm 11**: [`npm pkg`](https://docs.npmjs.com/cli/v11/commands/npm-pkg) (Practice 8.3) and [workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces) (🔬).
- **Next.js 16** (background only, in 🔬): [routes from the folder layout](https://nextjs.org/docs/app/getting-started/layouts-and-pages), [server components](https://nextjs.org/docs/app/getting-started/server-and-client-components), and [static exports](https://nextjs.org/docs/app/guides/static-exports).
- **Backend v1.0** (read, not changed): login, cookies, the guard, and CORS from [`security.ts`](../../mini-smart-home/backend/src/auth/security.ts) and [`routes/auth.ts`](../../mini-smart-home/backend/src/routes/auth.ts) with [@fastify/cors](https://github.com/fastify/fastify-cors) 11.3.1; `GET /devices` and `…/latest` from [`routes/devices.ts`](../../mini-smart-home/backend/src/routes/devices.ts); the data shape from [Appendix A, data contract 1.4](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract) and [`DATA-CONTRACT.md`](../../mini-smart-home/DATA-CONTRACT.md).
- **Earlier modules**: [Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md) (`webhook-receiver.js`, `generate-dummy.js`, ES modules); [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md) (the Node 1 switch page, `networking.cpp` lines 80–97); [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md) (TypeScript, Bruno, Zod); [Module 20](../../phase-3-backend-data/module-20-user-security/README.md) (the wristband, the season pass, `CORS_ORIGIN`, the guard, the promises of refresh once and XSS safety for the dashboard); [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md) (backend v1.0, `key`, `f00d00000001`, the simulator). The pass requirement is quoted from [Syllabus §7, Module 22](../../SYLLABUS.md#module-22--html-css--react-typescript-from-scratch-for-an-iot-dashboard).

**Images.** The original diagrams and the author's dashboard screenshots are licensed **CC BY 4.0**; the diagrams' `.svg` files are in the `assets/` folder so you can edit them. The screenshots are cropped and rearranged, with titles, numbers, and captions by the author. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-22`, `web-page-three-layers`, `component-tree`, `browser-login-flow`, `three-screen-states`, `project-diagram-module-22` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum, from the backend v1.0 behavior tested by the author, the Module 10 Node 1 page, the dashboard v0.1 code, and the documentation above. The device names, numbers, and screen contents are **examples**. | CC BY 4.0 |
| `dashboard-login`, `dashboard-device-list`, `dashboard-details-phone-and-laptop` | Real screenshots of dashboard v0.1 ([`code/frontend/`](code/frontend/)) against the real backend v1.0, in headless Edge 155, light theme, scale 2: the login form at 1280 px wide in four states (empty, wrong password `401`, backend down with the code 0 message, session expired; the "backend down" panel was taken with `http://localhost:8080` blocked inside the browser, which gives the same page text as a stopped backend); the five devices in their final Module 21 state with `status` and `key` badges; the Node 1 details at a phone width of 375 px (device mode, full page) and at 1280 px. | CC BY 4.0, October 2026. React, React DOM, Vite, and Tailwind CSS are MIT-licensed. Example accounts `@home.test`, passwords only as dots, sensor numbers from simulators. |
| `module-10-switch-taken-apart` | Real screenshots of three Practice 1 panels at a phone width of 375 px: the Module 10 Node 1 page as it is (`page-m10-original.html`: the `PAGE` text in `networking.cpp` lines 80–97 with illustration numbers), the version with skin and muscles (`page-m10-skin-muscles.html`), and after **Turn the lamp on** is tapped. Taken in headless Edge 155, with the pages served by a small server at `http://localhost`, not `file://`; the page contents are the same. | The pages and their code are part of this curriculum. CC BY 4.0, October 2026 |
| `vite-template-first-page` | A real screenshot of the untouched welcome page of the create-vite 9.3.1 `react-ts` template, through `npm run dev` at `http://localhost:5173` (Practice 2.3), in headless Edge 155, 1280 px wide, light theme. | The create-vite template, Vite, and React are MIT-licensed; the Vite, React, GitHub, Discord, X, and Bluesky logos belong to their respective owners, shown as they are as template content. For educational purposes, October 2026. Titles, numbers, and captions: CC BY 4.0 |

**About the Expected output boxes.** All the commands and code of this module were run by the author on Windows 11 25H2 (build 10.0.26200.9711) with Node.js 24.21.0, npm 11.19.0, and Docker Engine 29.5.3. The dashboard was tested against the **real Module 21 backend v1.0**: a copy of `backend/` and `tools/` in their final Module 21 state, a `.env` from `.env.example` (the default `CORS_ORIGIN`; only the database and broker addresses, the broker password, and `JWT_SECRET` were changed), and its own `smarthome` database in a `timescale/timescaledb:2.30.2-pg17` container holding the final Module 21 state: migrations up to `010_device_keys.sql`, example history, the admin and viewer accounts, four registered devices with `c0ba00000001`'s key revoked, and `f00d00000002` not registered. The lab's MQTT broker is a small mock broker that imitates the locked Module 21 Mosquitto (the dashboard never talks to the broker). Node 1 and Node 2 are lab simulators with fixed numbers, while `f00d00000001` is sent by `tools/device-simulator.js` with random numbers. The real boards and the Pi gateway weren't tried again, because the dashboard only reads the API.

The dashboard (Practices 4–8) and all the screenshots were recorded in Microsoft Edge 155.0.4283.62, headless, through the DevTools Protocol, with the browser's time zone emulated as `Asia/Jakarta`; phone and tablet widths were imitated with device mode. That recording gives the requests, statuses, cookies, and Console lines of Practices 4–8; the layout of the **Network**, **Console**, and **Application** panels (columns, Initiator, tooltips) and the Chrome-only texts come from earlier recordings with Edge 155 and Google Chrome 156.0.8078.47, which read the real DevTools UI in a separate tab, not the **F12** window, so the layout may look slightly different. What can't be recorded headless was written from other sources: the right-click menu label (**Inspect**) from the browser's language files, the device mode bar from its documentation, the validation bubble text from `validationMessage`, the React DevTools panels from the source of release 8.0.0, and the **Issues** titles from the DevTools code. The Bruno screen wasn't recorded either; the same requests were sent by a script.

`npm` output and the `TS2551` error (Practice 3.4) were recorded in a Windows PowerShell 5.1 console, not the VS Code terminal (except the 2.7 `npm` box and the successful 3.4 build: through a script, so `transforming...` still shows); create-vite was recorded with the VS Code terminal settings, so it shows the symbols `◇` and `│` (an old Windows console: `o` and `|`). Git output was recorded in a throw-away practice repository with git 2.51.1; the warning `LF will be replaced by CRLF` only appears if `core.autocrlf=true`. The author's lab used other ports (for example Vite `5873` and the backend `5882`), written here as `5173`, `8080`, and `3000` (the Module 4 receiver). The 🧩 challenge keys were only checked with `npm run build` and `npm run lint`. The author's laptop is in the WITA zone, so log clocks were printed with `TZ=Asia/Jakarta` or rewritten in WIB.

**Not** tested: Firefox and Safari, including their cookies and CORS; Google Chrome for the recordings of this edition (only Edge 155 ran; Chrome texts come from the earlier recordings); a real phone over Wi-Fi (🔬); browser time zones other than `Asia/Jakarta` (the code always uses that zone); a wristband that really runs out after 15 minutes and a season pass after 7 days (imitated by deleting cookies, as in Practice 6.5); the details of an `unregistered` device that still has a reading in memory, and a revoked device that's still `online` (the details' `messages ignored` line was seen in the lab on a revoked device); dark mode; and the macOS commands, which are written from Modules 16–21. The clock, load times, build file names and sizes, npm package counts, and sensor numbers on your screen will certainly differ, so output like that is marked **example**.

---

[⬅️ Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md) · [Phase 4](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 23 — Realtime Dashboard: Charts, Gauges, History, & Status](../module-23-realtime-dashboard/README.md) ➡️**
