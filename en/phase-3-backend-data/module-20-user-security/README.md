# Module 20 — User Security: Login, JWT in Cookies, Roles, & API Protection

🌐 **English** · [Bahasa Indonesia](../../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md)

*Phase 3 · Week 20 · Hardware: **Kit A + B** (Node 1 and the Pi gateway from Modules 12–15) **or just a laptop** (the Module 19 device simulator) · Prerequisites: **Module 19** (backend v0.4, the `smarthome` database, and the small terminal) · Time: 9–11 hours, spread over the week*

[⬅️ Module 19](../module-19-realtime-rules-notifications/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 21 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-21--device-security-api-keys-simple-provisioning--broker-access-control-acl)

---

Your house now reacts by itself: readings flow live to the terminal, rules turn the fan on, the pump waters every morning, and Telegram tells you when the temperature rises. But there's one question the backend has never asked anyone who knocks on its door: **"Who are you?"** Anyone who can send `POST /devices/:id/command` may turn the pump on. Anyone who can send `PUT /rules/1` may raise the fan threshold to 45 °C, so that the fan almost never turns on again. Anyone who connects to Socket.IO may peek at the temperature, humidity, and motion in your house, and from that guess when the house is empty.

So far that hasn't been a big problem, because the backend only listens on `127.0.0.1`, which means it can only be knocked on from that laptop itself. But that won't last long. Module 22 builds a dashboard in the browser, and Phase 5 moves the backend to a server that can be knocked on from the internet. By the time that happens, the doors must already be locked. This week you install the locks: **accounts with passwords, login, roles, and a guard at every door**, the way real web applications usually do it, and the way job interviews often ask about it.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Anyone who can knock on the API may turn the pump on and change the rules. | The backend doesn't ask who you are. | **Accounts and login** `POST /auth/login`, then a **guard** at every door: without a login, every endpoint (API address) answers **401** (Concepts 2 and 6, Practices 2–3) |
| If account passwords are stored as they are, a leaked database leaks every password. | A database can leak through a backup, a lost laptop, or a small mistake. | **Password fingerprints** with bcrypt: the database only stores the fingerprint, not the password (Concept 3, Practice 1) |
| After logging in, every request has to prove who sent it without sending the password again. | HTTP has no memory: every request stands on its own. | A **JWT** ("a concert wristband") that lasts 15 minutes, kept in an **`httpOnly` cookie** that JavaScript can't read (Concepts 4–5, Practice 2) |
| A leaked wristband stays valid until it runs out, and logging out doesn't really lock anything. | A JWT can't be taken back before it expires. | A **refresh token** ("a season pass") recorded in the `sessions` table: replaced every time it's used, and revoked at logout (Concept 7, Practice 4) |
| Everyone who gets in may do anything. | Permissions aren't divided yet. | **The `admin` and `viewer` roles**: a `viewer` account may only look, and every attempt to change something gets **403** (Concept 6, Practice 3) |
| An automatic password guesser can try thousands of passwords per minute. | There's no limit on attempts. | **Rate limiting**: at most 10 login attempts per minute from one address; the 11th attempt gets **429** (Concept 8, Practice 5) |
| Other web pages in your browser can ride along on your login. | The browser sends cookies automatically. | **CORS** and the **origin check** (the `Origin` header): only the pages you allow may give the backend commands (Concepts 5 and 9, Practice 6) |
| The small terminal sees live data without logging in. | Socket.IO has its own door that the API guard doesn't watch. | **Socket.IO is locked too**: when a terminal or a browser connects, Socket.IO checks the same cookie (Concept 10, Practice 7) |
| Secrets such as the database password, the bot token, and the JWT key can end up on GitHub. | One careless `git add .` is enough. | **`.env` + `.gitignore` + GitHub secret scanning**, and personal data kept to a minimum (Concept 11, Practice 8) |

By the end of the week, **without a login every endpoint answers 401**, **a `viewer` account fails to turn the relay on (HTTP 403)**, and **the 11th login attempt within a minute is refused**. Those are the three pass requirements of this module. The backend goes up to **v0.5: locked for people**. The locks for devices (broker accounts and MQTT topic permissions) follow in Module 21.

![Module 20 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 3 Backend and data, Modules 16 to 21, is highlighted with a green frame. Modules 1 to 19 are marked done, Module 21 is green, and Module 20 is marked YOU ARE HERE with the note: the house is locked for people, that is, accounts, login, roles, and API protection. Below that, the box for this week's Module 20, 9 to 11 hours spread out; Kit A + B or just a laptop, continuing directly from Module 19 with backend v0.4 and the smarthome database. The list of activities: the JavaScript warm-up, that is, fingerprints, random numbers, a mini wristband and a mini guard; Quick Win, your first password fingerprint with bcrypt; Practice 1, the secret, the sessions table, and the first accounts; Practice 2, login, and the wristband in a cookie; Practice 3, a guard at every door, with the pass requirement 401 without a login and 403 for a viewer trying to turn the relay on; Practice 4, refresh and logout; Practice 5, limit login attempts, with the pass requirement the 11th attempt within a minute is refused; Practice 6, CORS and the origin check; Practice 7, Socket.IO is locked too; Practice 8, secrets, privacy, and the pass test; and the Add-on, backend v0.5 and a pull request reviewed with the security checklist. Practices 3, 5, 7, 8, and the Add-on are marked with a star, required to pass. Note at the bottom: two paths, that is, the device (Node 1 and the Pi gateway) or the laptop (a broker on the laptop and the Module 19 simulator), and the firmware doesn't change this week; almost everything happens on the laptop: the backend, the database, Bruno, the terminal, and the browser (Chrome or Edge).](assets/roadmap-module-20.png)

> [!NOTE]
> **How to use this module.**
>
> - **Almost everything happens on the laptop**: the backend, the database, Bruno, the terminal, and the browser. The device is only needed in three places: Practice 3 and 🧩 Level 1, to prove that an account with the right role can still turn the relay on (a command needs an `ack` answer from the device), and Practice 7, for the live data in the small terminal. **The device path** uses Node 1 and the Mosquitto broker on the Pi (Modules 12–15). **The laptop path** uses the Mosquitto service on the laptop and the Module 19 device simulator. The firmware doesn't change this week.
> - **The 🖥️ box of every practice names its tools**: the **VS Code terminal** (in the `backend` or `tools` folder), **psql**, **Bruno**, and the **browser** (Chrome or Edge) with its DevTools. Windows users: use VS Code's built-in terminal (PowerShell), **not Git Bash**, because the password prompt in Practice 1 needs a terminal that can hide what you type.
> - **A direct continuation of Module 19.** The `smarthome-db` container, the `smarthome` database (migrations 001–005 and 007), backend v0.4 on the `main` branch, the Bruno collection, and the `tools` folder are used again as they are.
> - **The address is always `http://127.0.0.1:8080`**, exactly as in Modules 16–19, in Bruno, in the terminal, and in the browser alike. Don't replace it with `localhost:8080`: a cookie sticks to the **host name**, so a login under one name doesn't count under the other.
> - **The Expected output boxes.** The author ran all of this module's commands and code on a Windows laptop with Node.js 24, PowerShell 5.1 and 7, the Bruno CLI, and Chrome. The Bruno desktop app wasn't installed on the author's laptop, so the steps in the Bruno window are written from Modules 16–19 and Bruno's source code (details in 📚 Sources). The times, session numbers, response times (in milliseconds), and token contents on your screen will be different, so outputs like those are marked **example**. Tokens, cookies, and password fingerprints from the author's lab accounts are deliberately cut short with `…`; the only ones shown in full are practice examples that aren't used anywhere. Your own are **secrets**.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in VS Code, the browser, and Bruno. **Except in the terminal:** stopping a running program is still **Ctrl + C**. Terminal commands are exactly the same on Windows and macOS, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **Account passwords are only typed where they're meant to go**: the `npm run users` prompt, a login form (including **Try it out** in `/docs`), your password manager, and files that don't go into Git, namely `backend/bruno/.env`, `tools/.env`, and the `login*.json` test files if you do the optional curl parts. Never write them as a command argument, in code, in a Bruno `.yml` file, or in a screenshot.
> 2. **`JWT_SECRET` is the stamp that makes the wristbands.** Anyone who holds it can make a fake `admin` wristband. Keep it only in the `.env` file. If it has already leaked, make a new one: every old wristband, including fake ones made by other people, becomes invalid at once. The rightful account owners just refresh with their season pass to get a new wristband.
> 3. **Never give the content of the `access` or `session` cookie to anyone else**, including when you ask for help in a forum or a group. Whoever holds that cookie gets in as you until the cookie expires.
> 4. **One padlock isn't enough; security comes in layers.** The backend still only listens on `127.0.0.1` this week (don't change `HOST` to `0.0.0.0`). Opening the backend to the network and the internet only happens in Phase 5, together with HTTPS.
> 5. **The shape of the tables is still changed only through migration files**, as in Modules 17–19.

This module follows the same rhythm as Modules 1–19. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🏆 Quick Win: your first password fingerprint (20 minutes)](#-quick-win-your-first-password-fingerprint-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Threat model](#1-threat-model-who-might-mess-around-and-what-happens-then) · [2 401 versus 403](#2-authentication-and-authorization-401-versus-403) · [3 Password fingerprints](#3-password-fingerprints-store-the-fingerprint-not-the-face) · [4 JWT](#4-jwt-a-concert-wristband) · [5 `httpOnly` cookie](#5-an-httponly-cookie-not-localstorage) · [6 Guard & roles](#6-a-guard-at-every-door-the-admin-and-viewer-roles) · [7 Refresh token & logout](#7-refresh-tokens-and-logout-a-season-pass-at-the-ticket-booth) · [8 Rate limiting](#8-rate-limiting-an-hourglass-for-password-guessers) · [9 CORS](#9-cors-why-the-browser-refuses) · [10 Socket.IO locked](#10-socketio-is-locked-too-the-hall-door-takes-the-same-wristband) · [11 Secrets & privacy](#11-secrets-and-privacy-what-must-not-leak)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 First accounts](#practice-1--the-secret-the-sessions-table-and-the-first-accounts-60-minutes) · [2 Login](#practice-2--login-and-the-wristband-in-a-cookie-50-minutes) · [3 Guard](#practice-3--a-guard-at-every-door-401-and-403-50-minutes) · [4 Refresh & logout](#practice-4--refresh-and-logout-50-minutes) · [5 Rate limit](#practice-5--limit-login-attempts-30-minutes) · [6 CORS](#practice-6--cors-and-the-origin-check-40-minutes) · [7 Socket.IO](#practice-7--socketio-is-locked-too-50-minutes) · [8 Pass test](#practice-8--secrets-privacy-and-the-pass-test-40-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-20-completion-checklist)

## 🎯 After this module you can…

1. **Build a simple threat model** for Mini Smart Home: who might mess around, through which door, and what happens then, and then choose locks that fit.
2. **Store passwords as bcrypt fingerprints**, and explain why a fingerprint can't be reversed, why every fingerprint gets a "salt", and why a long password matters more than a complicated one.
3. **Build a login** `POST /auth/login` that hands out a **JWT in an `httpOnly` cookie**, and explain why that token isn't stored in `localStorage`.
4. **Use a refresh token** that's replaced every time it's used, and a **logout** that really revokes the session in the database.
5. **Lock every endpoint** with one guard (no login → **401**) and **tell the `admin` and `viewer` roles apart** (a `viewer` that tries to change something → **403**).
6. **Limit login attempts** to 10 per minute (the 11th → **429**) and test it with Bruno.
7. **Explain why the browser refuses** cross-origin requests (**CORS**), set the list of allowed origins, and **refuse commands from foreign pages** with an `Origin` check.
8. **Lock Socket.IO** with the same cookie, so that the small terminal has to log in before it may see live data.
9. **Keep secrets safe** (`.env`, `.gitignore`, GitHub secret scanning) and **protect the privacy of user data**, then review a pull request with a **security checklist**.

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **Your Module 19 results** | Docker Desktop with the **`smarthome-db`** container running, the `smarthome` database (migrations 001–005 and 007), **backend v0.4**, merged into `main` in Module 19 ➕ C, and the `tools` folder with the small terminal and the device simulator. |
| **Node.js 24, VS Code, Git, Bruno** | The same as in Modules 16–19. |
| **An MQTT broker and a source of readings** | **The device path:** Mosquitto on the Pi, and Node 1. **The laptop path:** the Mosquitto service on the laptop, and the Module 19 device simulator. Both are only needed to prove that an account with the right role can still give the device commands (Practice 3 and 🧩 Level 1) and for the live data in the small terminal (Practice 7). |
| **The Chrome or Edge browser** | For `/docs` (Practices 3, 6, and 8) and the **Console** tab in **DevTools** (Practice 6). Other browsers can be used, but their DevTools look different from this module. |
| **A terminal that can hide what you type** | **Windows:** the VS Code terminal (PowerShell) or Windows Terminal. **macOS:** the VS Code terminal or the Terminal app. Git Bash isn't used for `npm run users` (Practice 1). |
| **An internet connection** | For `npm install` of five new packages: bcrypt, @fastify/cookie, @fastify/jwt, @fastify/rate-limit, and @fastify/cors. The addition is small: 20 packages (including their supporting packages), and the `node_modules` folder only grows by about 4 MB. |
| **A GitHub account** | You've had it since Module 16. Practice 8 looks at the **Security and quality** tab of the `mini-smart-home` repository, and ➕ merges all the work through a pull request. |

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Node.js 24**, and the `learn-iot` repository folder.

As in Modules 16–19, the Phase 3 modules open with a JavaScript warm-up. Almost every lock this week is built from five small skills that Node.js already has, without installing anything: **fingerprints** (hashes) with `createHash`, **random numbers nobody can guess** with `randomBytes`, **turning an object into text and back** with `Buffer` and base64url, **signatures** with `createHmac`, and a **`Set`** as a guest list. At the end of the warm-up, you put all five together into a mini "concert wristband" and a mini "guard". You install the real versions in the backend in Practices 2–3. Type the code yourself (don't copy and paste), run it after every step, then compare the output.

**Prepare the folder.** Open the **`learn-iot`** repository folder in VS Code, first click the empty space in the Explorer panel, create a new folder **`module-20`**, then run this in the terminal:

```text
cd module-20
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` is needed because this file uses `import` (the same as in the Module 16–19 warm-ups). Then create the file **`warmup.js`** in the `module-20` folder.

### Step 1 — Fingerprints: `createHash`

A **hash** function turns any text into a string of letters and digits that's always the same length. The result is like a **fingerprint**: the same text always gives the same fingerprint, a single different letter gives a completely different fingerprint, and from the fingerprint you **can't compute back** the original text. Type this in `warmup.js`:

```js
// warmup.js - a JavaScript warm-up again before Module 20
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";

// 1. Fingerprints: createHash
const fingerprint = (text) => createHash("sha256").update(text).digest("hex");
console.log(fingerprint("morning coffee"));
console.log(fingerprint("morning coffee"));
console.log(fingerprint("morning coffeE"));
console.log(fingerprint("morning coffee").length, fingerprint("a sentence much longer than morning coffee").length);
```

Save (**Ctrl + S**), then run it in the terminal:

```text
node warmup.js
```

**Expected output:**

```text
e158274c56417fe38452a6aca11ed211072eb3fae4a731860cc32d42a3d4cee2
e158274c56417fe38452a6aca11ed211072eb3fae4a731860cc32d42a3d4cee2
45341b4589a0dc1322b8008fee980e2c91244932bc5a07729024be5abd801f63
64 64
```

- **`node:crypto`** is Node.js's built-in module for cryptography (the science of secret codes). No `npm install` needed.
- **`createHash("sha256")`** picks the fingerprint recipe called **SHA-256**, `.update(text)` feeds in the text, and `.digest("hex")` gives the result as 64 hexadecimal characters (0–9 and a–f).
- The first two lines are exactly the same, even though they were computed separately. The third line differs only by one capital letter at the end (`coffeE`), but its fingerprint changes completely. Short and long texts alike give 64 characters.

A fingerprint can't be computed back, but it can be **guessed**: compute the fingerprint of a guess, then compare. Imagine that the fingerprint of a password has leaked from someone else's database. Add this at the very bottom:

```js
const leaked = "fcf730b6d95236ecd3c9fc2d92d7b6b2bb061514961aec041d6c7a7192f592e4";
const popularPasswords = ["123456", "password", "qwerty", "secret123", "iloveyou"];
for (const guess of popularPasswords) {
  if (fingerprint(guess) === leaked) console.log(`found: ${guess}`);
}
const start = performance.now();
for (let i = 0; i < 100_000; i++) fingerprint(`guess-${i}`);
console.log(`100,000 guesses: ${Math.round(performance.now() - start)} ms`);
```

**Expected output** (the new lines; the number of milliseconds on your laptop will be different):

```text
found: secret123
100,000 guesses: 454 ms
```

- The guesser doesn't need to reverse the fingerprint. Trying popular passwords one by one is enough, and `secret123` is found right away.
- **`performance.now()`** gives the current time in milliseconds, so the difference between two readings is how long a piece of work took. The author's laptop computes 100,000 SHA-256 fingerprints in less than half a second, and an attacker's graphics card can compute billions of fingerprints per second. That's why **SHA-256 is too fast for storing passwords**. The Quick Win in a moment introduces bcrypt, a fingerprint that's **deliberately slow** (Concept 3).

### Step 2 — Random numbers nobody can guess: `randomBytes`

After a login, the backend gives the browser a long identifier that's later exchanged for a new wristband (Concept 7). That identifier must be **random and impossible to guess**. `Math.random()` isn't enough: its numbers are made for games and simulations, not for secrets. Add:

```js
// 2. Random numbers that can't be guessed
const token1 = randomBytes(32).toString("base64url");
const token2 = randomBytes(32).toString("base64url");
console.log(token1);
console.log(token2);
console.log(token1.length, token1 === token2);
```

**Expected output** (the new lines; **example**, your first two lines will certainly be different):

```text
AEawGEod4f2sGj_ny5GyPoHinvN-98qS8s6n7Bkri1s
1nBQzrBXabpoIaNLmtndxHpXRzOfkR4t0remqWoWuu4
43 false
```

- **`randomBytes(32)`** takes 32 random bytes from the operating system's source of randomness, which is made precisely for secrets.
- **`.toString("base64url")`** writes those 32 bytes as 43 characters that are safe to put in a web address and a cookie: uppercase and lowercase letters, digits, `-`, and `_`.
- The chance of two identical tokens is practically zero: there are 2²⁵⁶ possibilities, more than the number of atoms on Earth.

### Step 3 — Making and reading a "wristband"

A **JWT** (Concept 4) is three pieces of base64url text joined by dots: the **header** (the kind of signature), the **payload** (who wears it and until when it's valid), and the **signature**. This step makes a simple wristband with the same recipe. Add:

```js
// 3. Making and reading a "wristband"
const SECRET = "organizers-stamp-only-the-organizers-know";
const toText = (object) => Buffer.from(JSON.stringify(object)).toString("base64url");
const sign = (headerAndPayload) => createHmac("sha256", SECRET).update(headerAndPayload).digest("base64url");
function makeWristband(payload) {
  const headerAndPayload = `${toText({ alg: "HS256", typ: "JWT" })}.${toText(payload)}`;
  return `${headerAndPayload}.${sign(headerAndPayload)}`;
}
const nowSeconds = () => Math.floor(Date.now() / 1000);
const wristband = makeWristband({ sub: "2", role: "viewer", exp: nowSeconds() + 900 });
console.log(wristband);
const [header, payload, signature] = wristband.split(".");
console.log(JSON.parse(Buffer.from(payload, "base64url").toString()));
```

**Expected output** (the new lines; **example**, the `exp` number and the last two pieces on your screen will be different):

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6InZpZXdlciIsImV4cCI6MTc5MjYyOTI2Nn0.sLuCE-0unvCDH5SMQRDUBhaU_BJmigGoBUHlF1cFK9w
{ sub: '2', role: 'viewer', exp: 1792629266 }
```

- **`toText`** turns an object into JSON text, then into base64url. `Buffer.from(…, "base64url").toString()` on the last line turns it back.
- **`createHmac("sha256", SECRET)`** makes a fingerprint **mixed with a secret**. The result is a signature: only whoever holds `SECRET` can make a matching signature.
- **`exp`** (expiry) is the second at which the wristband stops being valid. `Date.now()` gives milliseconds since January 1, 1970, so it's divided by 1,000 and rounded down. `+ 900` means 15 minutes from now.
- **Look at the second line:** the wristband's payload can be read without any secret. A wristband is **signed, not secret**. That's why a JWT's payload must never hold a password, an email, or other personal data.
- The first piece is always `eyJhbGciOi…`. A JWT's header and payload are JSON objects written without spaces, so they always start with `{"`, and in base64url that beginning becomes `eyJ`. If you ever see a long text starting with `eyJ`, it's most likely a JWT, and anyone can read what's in it.

### Step 4 — Checking the wristband: signature and expiry

Anyone can read a wristband's payload, so anyone can also **change it**, for example from `viewer` to `admin`. What they can't do is make a new matching signature, because they don't know `SECRET`. Add:

```js
// 4. Checking a wristband: signature and expiry
function checkWristband(text) {
  const [header, payload, signature] = text.split(".");
  if (sign(`${header}.${payload}`) !== signature) return null; // the signature doesn't match: fake
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (data.exp <= nowSeconds()) return null; // already expired
  return data;
}
const fakeWristband = `${header}.${toText({ sub: "2", role: "admin", exp: nowSeconds() + 900 })}.${signature}`;
const staleWristband = makeWristband({ sub: "2", role: "viewer", exp: nowSeconds() - 1 });
console.log(checkWristband(wristband)?.role, checkWristband(fakeWristband), checkWristband(staleWristband));
assert.equal(checkWristband(fakeWristband), null);
```

**Expected output** (the new line):

```text
viewer null null
```

- **The genuine wristband** passes, and its role can be read: `viewer`.
- **The fake wristband** uses a new payload (`admin`) with the old signature. The signature computed again from the new payload isn't the same as the signature attached to it, so the answer is `null`.
- **The stale wristband** has a genuine signature, but its `exp` passed one second ago, so it's `null` too.
- **`?.`** (Module 17) reads `role` only when the result isn't `null`. The `assert.equal` on the last line stays quiet because the check is right; if a fake wristband ever gets through, that line stops the program.
- The real JWT library you install in Practice 2 does the same checks, plus a few others, for example the kind of signature in the wristband's header.

### Step 5 — A mini guard: a `Set` as the list of open doors

The backend's guard (Concept 6) answers three questions for every request: may this door be passed without a wristband? If not, is the wristband genuine and not stale yet? If so, may its role do this? A **`Set`** is a collection of values without duplicates, a good fit for a guest list that you only need to ask "is it there or not?". Add:

```js
// 5. A mini guard: a Set holding the doors you may pass without a wristband
const OPEN = new Set(["POST /auth/login", "GET /health"]);
function guard(method, route, wristbandText) {
  if (OPEN.has(`${method} ${route}`)) return 200; // an open door
  const wearer = wristbandText === undefined ? null : checkWristband(wristbandText);
  if (wearer === null) return 401; // no wristband, a fake one, or an expired one
  if (wearer.role !== "admin" && method !== "GET") return 403; // a viewer may only look
  return 200;
}
const adminWristband = makeWristband({ sub: "1", role: "admin", exp: nowSeconds() + 900 });
console.log(
  guard("GET", "/health"),
  guard("GET", "/devices"),
  guard("GET", "/devices", wristband),
  guard("POST", "/devices/f00d00000001/command", wristband),
  guard("POST", "/devices/f00d00000001/command", fakeWristband),
  guard("POST", "/devices/f00d00000001/command", adminWristband),
);
```

**Expected output** (the whole output; **example**, the token, wristband, and millisecond lines on your screen will be different):

```text
e158274c56417fe38452a6aca11ed211072eb3fae4a731860cc32d42a3d4cee2
e158274c56417fe38452a6aca11ed211072eb3fae4a731860cc32d42a3d4cee2
45341b4589a0dc1322b8008fee980e2c91244932bc5a07729024be5abd801f63
64 64
found: secret123
100,000 guesses: 454 ms
AEawGEod4f2sGj_ny5GyPoHinvN-98qS8s6n7Bkri1s
1nBQzrBXabpoIaNLmtndxHpXRzOfkR4t0remqWoWuu4
43 false
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicm9sZSI6InZpZXdlciIsImV4cCI6MTc5MjYyOTI2Nn0.sLuCE-0unvCDH5SMQRDUBhaU_BJmigGoBUHlF1cFK9w
{ sub: '2', role: 'viewer', exp: 1792629266 }
viewer null null
200 401 200 403 401 200
```

The guard's six answers, from the left:

1. `GET /health` without a wristband: **200**, that door is open anyway.
2. `GET /devices` without a wristband: **401**, not logged in.
3. `GET /devices` with the `viewer` wristband: **200**, a `viewer` may look.
4. `POST …/command` with the `viewer` wristband: **403**, known, but not allowed.
5. `POST …/command` with the fake wristband: **401**, a fake wristband is the same as no wristband.
6. `POST …/command` with the `admin` wristband: **200**.

Those numbers, 401 and 403, are this module's first two pass requirements. The difference between them is covered in Concept 2.

**Test yourself (10 minutes).** Without looking at the key:

1. Is the fingerprint of `"morning coffee "` (with one space at the end) the same as the fingerprint of `"morning coffee"`? Prove it with one `console.log` line.
2. Make an `admin` wristband for account `"3"`, then ask the guard about `PUT /rules/1` with that wristband and with the `viewer` wristband. What are the two answers?
3. Change **the very last character** of the `viewer` wristband, then ask the guard about `GET /devices`. What is the answer, and why?

<details>
<summary>Self-test answer key</summary>

```js
// test 1: one space at the end
console.log(fingerprint("morning coffee ") === fingerprint("morning coffee"));

// test 2: an admin wristband for account 3
const adminWristband3 = makeWristband({ sub: "3", role: "admin", exp: nowSeconds() + 900 });
console.log(guard("PUT", "/rules/1", adminWristband3), guard("PUT", "/rules/1", wristband));

// test 3: one letter of the signature changed
const broken = wristband.slice(0, -1) + (wristband.endsWith("A") ? "B" : "A");
console.log(guard("GET", "/devices", broken));
```

1. The result is `false`. To a computer, a space is a character too, so the fingerprint is completely different. That's why a password typed with an extra space doesn't match.
2. The result is `200 403`: `admin` may change the rules, `viewer` may not.
3. The result is `401`. The last character of the wristband is part of the signature. A changed signature no longer matches the header and the payload, so the wristband counts as fake. `wristband.endsWith("A") ? "B" : "A"` makes sure the character really changes. A note: this mini guard compares signatures as text. A real JWT library compares them as bytes, and the last character of an HS256 signature only carries 4 bits. So on a real wristband, changing an `A` at the end to a `B` can still pass, because the bytes stay the same. That's not a loophole, because the wristband's payload hasn't changed. To see 401, change a character in the middle of the signature or in the payload.

</details>

The warm-up is done. The `warmup.js` file goes to GitHub along with your learning notes in ➕.

> ➡️ **Continue** to [🏆 Quick Win](#-quick-win-your-first-password-fingerprint-20-minutes).

## 🏆 Quick Win: your first password fingerprint (20 minutes)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder) with one terminal. The backend, the database, and the broker don't need to be running yet.

In 20 minutes, you install **bcrypt** and see for yourself the three properties that make it right for passwords: the same password gives a **different** fingerprint every time, both fingerprints still **match** the original password, and every fingerprint is **deliberately slow** to make.

### Step 1 — Prepare the working branch (2 minutes)

Open the **`mini-smart-home`** folder in VS Code (**File → Open Folder…**), then open a terminal (**Terminal → New Terminal**). A new terminal always starts in the `mini-smart-home` folder. Create this week's working branch from the latest `main`:

```text
git switch main
git pull
git switch -c feature/user-security
```

**Expected output** (the last line):

```text
Switched to a new branch 'feature/user-security'
```

### Step 2 — Install bcrypt (6 minutes)

Go into the `backend` folder, then install bcrypt:

```text
cd backend
npm install bcrypt@6.0.0
```

**Expected output** (**example**; the `audited` number and the number of seconds may be slightly different):

```text
added 3 packages, and audited 209 packages in 17s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   bcrypt@6.0.0 (install: node-gyp-build)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
```

The installation worked (`found 0 vulnerabilities`), but npm added four warning lines. Some npm packages bring an **install script**: a small program that runs automatically when the package is installed. A script like that can run anything on your laptop, so compromised npm packages often use one to steal data. That's why newer versions of npm (11.18 and up) have started asking you to **approve** every package that brings an install script. For now, that request is only a reminder: the script still runs, but npm keeps reminding you until you've checked it, and a later version of npm will hold back scripts that haven't been approved. The bcrypt script only checks whether its ready-made program fits your laptop. The bcrypt 6 package already brings ready-made programs for Windows, macOS, and Linux, so you don't need to install any compiler.

Before you approve it, first install bcrypt's **type definitions** for TypeScript. `-D` means this package is only needed during development (devDependencies), like `typescript` itself:

```text
npm install -D @types/bcrypt@6.0.0
```

**Expected output:** an `added 1 package, …` line and `found 0 vulnerabilities`, then a similar warning appears again (this time it may say `(install: node-gyp rebuild)`; that doesn't mean bcrypt is compiled again). The warning will appear on **every** `npm install` until you approve it. Approve it now:

```text
npm install-scripts approve bcrypt
```

**Expected output:**

```text
Approved bcrypt:
  added bcrypt@6.0.0
```

If npm answers `Unknown command: "install-scripts"` instead, and the `npm warn install-scripts` warning never appeared, your npm is older than 11.18 (check with `npm -v`). Update Node.js 24 to the latest LTS release as in Module 4 Practice 3, then repeat this step. An old Mac that's stuck on Node.js 22 can simply skip the approval step: bcrypt is still fully installed, only the `allowScripts` section below is missing.

Open **`package.json`**. Besides the two new packages in `dependencies` and `devDependencies`, there's now a new section at the very bottom:

```json
  "allowScripts": {
    "bcrypt@6.0.0": true
  }
```

That approval is locked to **version** `6.0.0`. If bcrypt is ever moved up to a new version, npm asks again, because you haven't checked the script of the new version yet. Run `npm install` once more to make sure the warning is gone.

**Expected output** (**example**):

```text
up to date, audited 210 packages in 3s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### Step 3 — The first fingerprint (8 minutes)

In the Explorer panel, first click the empty space, then right-click the **`backend`** folder → **New File…**, and name it **`try-bcrypt.js`**. This file is only for practice and is deleted again at the end of the Quick Win. Type:

```js
// try-bcrypt.js - Module 20 Quick Win: your first password fingerprint. Delete this file when you're done.
import bcrypt from "bcrypt";

const password = "just practice, not my password"; // a practice text: never use it as a real password

console.time("time to make one fingerprint");
const one = await bcrypt.hash(password, 12); // 12 = cost: bcrypt repeats its calculation 2^12 = 4,096 times
console.timeEnd("time to make one fingerprint");
const two = await bcrypt.hash(password, 12); // the SAME password hashed once more

console.log("fingerprint 1:", one);
console.log("fingerprint 2:", two);
console.log("exactly the same?", one === two);
console.log("right password matches?", await bcrypt.compare(password, one));
console.log("wrong password matches?", await bcrypt.compare("just practice, not your password", one));
```

Save (**Ctrl + S**), then run it in the terminal (still in the `backend` folder):

```text
node try-bcrypt.js
```

**Expected output** (**example**; the fingerprints and the time will certainly be different on your laptop):

```text
time to make one fingerprint: 749.301ms
fingerprint 1: $2b$12$RH2LUiS.qIB8wN6UeKnLUOfSpKX1ln7wfIBYD5KGGUDwSn2N4fuTy
fingerprint 2: $2b$12$XrsFo4oMY72Zj0K7pUsMJO7go6s5u.ocaX1UXLzymOReN7J/FS8za
exactly the same? false
right password matches? true
wrong password matches? false
```

That's your quick win. Notice four things:

- **Fingerprints 1 and 2 are different**, even though the password is the same. Every time, bcrypt mixes the password with a new random **salt** (Concept 3). Both texts start with `$2b$12$`: the version of the bcrypt recipe and its cost factor, `12`.
- **`bcrypt.compare()` still answers `true`** for the right password. It reads the salt from the fingerprint text itself, computes again, then compares.
- **One small word different** (`my` versus `your`) is enough for `false`.
- **One fingerprint takes hundreds of milliseconds.** `console.time()` and `console.timeEnd()` measure the time between them. On the author's laptop while it was busy, the number was about 0.75 seconds; on a laptop that isn't busy, about 0.3 seconds. If you run it once more, both fingerprints change again, but the three answers below them stay the same.

Compare that with warm-up step 1: SHA-256 computes 100,000 fingerprints in less than half a second, while bcrypt needs about that long for just **one** fingerprint. For a million guesses, the same laptop needs about 5 seconds with SHA-256, but about 3.5 days with bcrypt.

Delete the practice file: right-click **`try-bcrypt.js`** in the Explorer → **Delete** → **Move to Recycle Bin** (macOS: **Move to Trash**). The changes to `package.json` and `package-lock.json` are saved to Git at the end of Practice 1.

> ➡️ **Continue** to [🧠 The "Why" Concepts](#-the-why-concepts): read Concepts 1–3, then do Practice 1.

## 🧠 The "Why" Concepts

There are eleven concepts. You don't need to read them all at once before the practices. The order:

1. Quick Win (already done) → Concepts 1–3 → Practice 1 (the secret, the sessions table, and the first accounts)
2. Concepts 4–5 → Practice 2 (login, and the wristband in a cookie)
3. Concept 6 → Practice 3 (a guard at every door)
4. Concept 7 → Practice 4 (refresh and logout)
5. Concept 8 → Practice 5 (the login attempt limit)
6. Concept 9 → Practice 6 (CORS and the origin check)
7. Concept 10 → Practice 7 (Socket.IO is locked too)
8. Concept 11 → Practice 8 (secrets, privacy, and the pass test)

The ⬆️/➡️ boxes at the end of every practice and at the end of every group of concepts above take you to the next step. The code snippets in the concepts are only for reading: they're all written and run in the practices.

### 1. Threat model: who might mess around and what happens then

A homeowner doesn't put a bank vault door on the kitchen, but doesn't leave the front door open all night either. The right lock depends on two questions: **who might get in** and **what happens if they succeed**. A simple list with the answers to those two questions is called a **threat model**. It doesn't need to be complicated; four columns are enough. For Mini Smart Home:

| Who might mess around | Through which door | What happens | This week's lock |
| :--- | :--- | :--- | :--- |
| A family member or a guest who likes to mess around, for example a little brother who likes turning off other people's bedroom lights | The API, through Bruno now or through the dashboard from Module 22 on | The lights go out, the fan turns on in the middle of the night, the fan threshold gets changed | Accounts and login (401); the `viewer` role for people who only need to look (403). Concepts 2 and 6 |
| An automatic password guesser (a bot) that tries popular passwords one by one | `POST /auth/login`, especially once the backend can be knocked on from the internet in Phase 5 | The `admin` account is taken over, and with it every actuator and rule | Long passwords, bcrypt fingerprints, and at most 10 attempts per minute. Concepts 3 and 8 |
| Another web page you open in the same browser | The browser, which brings your login cookie automatically | Commands are sent in your name without you noticing | `SameSite`, the origin check, and CORS. Concepts 5 and 9 |
| Someone who gets a copy of the database | A `pg_dump` file in the `backup/` folder (Module 18), or a lost laptop | Every account and session leaks too | The database only stores password fingerprints and refresh token fingerprints. Concepts 3 and 7 |
| Someone peeking at the live data | Socket.IO | The household's habits can be read: when there's motion, when the house is empty | Socket.IO is locked too. Concept 10 |
| You yourself, when you're in a hurry | `git add .`, then a push to GitHub | The database password, the bot token, and `JWT_SECRET` are on display on the internet | `.env`, `.gitignore`, and GitHub secret scanning. Concept 11 |

One thing should be said honestly. Since Module 16, the backend only listens on **`127.0.0.1`** (`HOST=127.0.0.1` in `.env`), so phones or other laptops on your home Wi-Fi can't knock on it at all yet. The threats that really exist **this week** are other programs and web pages on your own laptop, and mistakes such as a secret that ends up on GitHub. The locks are still installed now, because Module 22 brings the dashboard to the browser and Phase 5 brings the backend to the internet. Installing locks while the house is still quiet is much easier than once the guests have started arriving.

Four principles guide every lock this week:

1. **Locked by default** (deny by default). Every door is locked, and only a few are opened on purpose. A new route you add later is locked automatically too, so forgetting to put a padlock on it doesn't leave a door open.
2. **Least privilege**. People and programs that only need to look get a `viewer` account. Even the small terminal you built uses a `viewer` account.
3. **Defense in depth**. One lock may fail; the next lock still holds. Even a weak password is still protected by the attempt limit, and a cookie that gets attached to a request from a foreign page is still stopped by the origin check.
4. **Secrets never live in the code.** Anyone may read the code, because your `mini-smart-home` repository is public. Every secret lives in `.env`.

Some things are **not** locked yet this week: the devices and the MQTT broker (Module 21), encrypting traffic with HTTPS (Phase 5), and two-step verification and logging in with Google (only discussed in 🔬).

![Threat model diagram: who might mess around and what happens then, Concept 1. Every card holds three lines: through which door, what happens, and this week's lock. In the middle, the green Mini Smart Home card with a house icon, backend 127.0.0.1:8080, and the list of what's guarded: actuators (lamp, fan, pump, curtain); rules and schedules (automatic fan, morning watering); live data and history (temperature, humidity, motion); and accounts and secrets (password fingerprints, sessions, .env). Six actor cards with neutral line icons surround it, each with an arrow pointing to the house. Top left, a sibling or a guest who likes to mess around, Concepts 2 and 6: through the API, that is, Bruno or the Module 22 dashboard; what happens: the lights go out and the fan threshold gets changed; the lock: login (401) and the viewer role (403). Middle left, an automatic password guesser (a bot), Concepts 3 and 8: through POST /auth/login, especially in Phase 5; what happens: the admin account is taken over; the lock: long passwords, bcrypt, and 10 attempts per minute. Bottom left, another web page in your browser, Concepts 5 and 9: through the browser, which brings your cookie automatically; what happens: commands are sent in your name; the lock: SameSite, the origin check, and CORS. Top right, someone holding a copy of the database, Concepts 3 and 7: through the backup/ folder (Module 18) or a lost laptop; what happens: every account and session leaks too; the lock: only fingerprints are stored. Middle right, someone peeking at the live data, Concept 10: through Socket.IO; what happens: the household's habits can be read, for example when the house is empty; the lock: Socket.IO is locked too. Bottom right, you yourself when you're in a hurry, Concept 11: through the command git add dot, then a push to GitHub; what happens: secrets are on display on GitHub; the lock: .env, .gitignore, and secret scanning. Below that, the four principles that guide every lock this week: 1, locked by default (deny by default), every door is locked and only a few are opened on purpose; 2, least privilege, whoever only needs to look gets a viewer account, the small terminal too; 3, defense in depth, one lock may fail and the next lock still holds; 4, secrets never live in the code, every secret lives in .env. The honest note box at the very bottom: this week the backend only listens on 127.0.0.1, so phones or other laptops on your home Wi-Fi can't knock on it yet; Module 22 brings the dashboard to the browser and Phase 5 brings the backend to the internet, so the locks are installed now, while the house is still quiet; not locked yet this week: the devices and the MQTT broker (Module 21), and HTTPS (Phase 5).](assets/threat-model.png)

### 2. Authentication and authorization: 401 versus 403

Every door guard actually asks two different questions:

- **Authentication**: "**Who are you?** Prove it." The proof is a login with an email and a password, then the wristband shown with every following request.
- **Authorization**: "**Are you allowed to do this?**" The answer depends on your role.

Imagine a concert. At the entrance gate, a staff member checks your ticket and puts a wristband on your wrist: that's authentication. In front of the backstage door, another staff member looks at the color of your wristband. An audience wristband may not go in, a crew wristband may: that's authorization. The backend answers those two failures with different status codes:

| Code | Its official name | What it means in backend v0.5 | At the concert |
| :--- | :--- | :--- | :--- |
| **401** | `Unauthorized` | not logged in, the wristband is fake, or the wristband has expired | "Where's your wristband?" |
| **403** | `Forbidden` | known, but the role isn't allowed to do that | "Sorry, yours isn't a crew wristband." |
| **429** | `Too Many Requests` | too many login attempts within a minute (Concept 8) | "Get in line and wait for the hourglass to run out." |

The official name of code 401 really is misleading. *Unauthorized* sounds like "not allowed", but what it means is "**it hasn't been proven who you are yet**". Just remember it like this: **401 = "who are you?"**, **403 = "I know who you are, but you're not allowed."**

The order of the checks is always the same: identity first, permission second. Someone who isn't logged in and tries to turn the relay on gets **401**, not 403, because the backend doesn't know who they are yet. Even an address that doesn't exist gets 401 for someone who isn't logged in. That way, strangers can't find out which routes exist on your backend. After logging in, an address that doesn't exist gets `404` as usual.

This module's three pass requirements check those three codes: without a login every endpoint answers **401** (authentication), a `viewer` account fails to turn the relay on with **403** (authorization), and the 11th login attempt within a minute is refused with **429**.

### 3. Password fingerprints: store the fingerprint, not the face

To check a password, the backend has to store **something** about it. But if what it stores is the password itself, anyone who gets a copy of the database immediately knows every password, and many people use the same password for their email and their social media. Locking the database alone isn't enough, because copies of the database can spread through backups, a lost laptop, or a small mistake.

The way out: **store the fingerprint, not the face.** The police can match someone's fingerprints without keeping a photo of their face. The backend works the same way. When an account is created, the backend computes the **fingerprint** (hash) of its password and stores only that fingerprint. At login, the backend computes the fingerprint of the typed password, then compares the two. The original password can't be computed back from the fingerprint.

Warm-up step 1 showed that an ordinary fingerprint such as SHA-256 is too **fast**: even an ordinary laptop can compute hundreds of thousands of guesses per second. That's why passwords get their fingerprints from **bcrypt**, which has two advantages:

1. **Deliberately slow.** The bcrypt algorithm repeats its calculation 2 to the power of the cost times. With a **cost factor** of **12**, that's 4,096 rounds, and one fingerprint takes about 0.3 seconds on the author's laptop (up to about 1 second while the laptop is busy). For a person logging in, 0.3 seconds isn't noticeable. For a guesser, every guess takes that long too: with one processor core, a million guesses take about 3.5 days, and even the fastest graphics card can only try thousands of bcrypt guesses per second, not billions as with SHA-256. Every time the cost goes up by one, it takes twice as long.
2. **Salted.** Before it's computed, every password is mixed with 16 random bytes called a **salt**. As a result, two accounts with the same password still have different fingerprints, and a guesser can't use a "fingerprint dictionary" computed in advance. They have to guess one by one for every account.

The salt doesn't need to be kept secret; it's stored together with the fingerprint in one text that's 60 characters long:

```text
$2b$12$mCgEV8BHKGueg1vUTZtbW.hWprLVUZn6hfQskfy8p9rD0ZJ.8Ayie
```

| Part | What it holds |
| :--- | :--- |
| `$2b$` | the version of the bcrypt recipe |
| `12$` | the cost factor |
| the next 22 characters | the salt |
| the last 31 characters | the password fingerprint, already mixed with the salt |

At login, `bcrypt.compare(typedPassword, storedFingerprint)` reads the version, the cost, and the salt from that text, computes again, then answers `true` or `false`.

Backend v0.5 uses three more rules:

- **At least 15 characters long, with no mixing rules.** The latest password guidelines from NIST (the United States standards agency; NIST SP 800-63B-4, July 2025) require a password that's the only proof of identity to have at least **15 characters**, and they actually **forbid** rules like "must contain a capital letter, a digit, and a symbol", as well as forcing people to change their passwords periodically. A long password is much harder to guess than a short, complicated one, and easier to remember. Use a **passphrase**: a few random words that only you know, for example names of things around you combined with a habit nobody else knows about. Don't use an example from any module, including this one. NIST also requires refusing passwords that appear on lists of popular or leaked passwords; backend v0.5 doesn't check that yet, so that part is still your responsibility when you choose a passphrase.
- **At most 72 bytes long.** The bcrypt algorithm only reads the first 72 bytes and silently throws away the rest. The backend refuses longer passwords, so that nobody thinks the rest of their password is being checked too. One ordinary letter is 1 byte, an accented letter such as `é` is 2 bytes, and one emoji is 4 bytes.
- **A wrong email and a wrong password get exactly the same answer.** Both get `401` with the message `wrong email or password`, and both take **the same time**. For an email that isn't registered, the backend still runs bcrypt on a dummy fingerprint made when the server starts. Without this trick, an unregistered email would be answered within a few milliseconds, while a registered email takes hundreds of milliseconds, and an attacker could find out which emails have an account just from how long the answer takes.

This fingerprint is stored in the new `password_hash` column of the `users` table (Practice 1). An account whose `password_hash` is empty can't log in.

![Password fingerprint diagram: store the fingerprint, not the face, Concept 3. bcrypt is deliberately slow with a cost factor of 12 and adds a salt; the database only stores the fingerprint. Left, when an account is created with npm run users in Practice 1: a passphrase box shown as sixteen dots, at least 15 characters, and a box with a random 16-byte salt that's made automatically, different every time, and not secret because it's stored along with it. Both go into the green bcrypt box: cost factor 12, 2 to the power of 12 equals 4,096 rounds, about 0.3 seconds on the author's laptop. The result is one 60-character text, $2b$12$mCgEV8BHKGueg1vUTZtbW.hWprLVUZn6hfQskfy8p9rD0ZJ.8Ayie, split into four labeled pieces: $2b$, the recipe version; 12$, the cost factor; mCgEV8BHKGueg1vUTZtbW., the salt, 22 characters from 16 random bytes; and hWprLVUZn6hfQskfy8p9rD0ZJ.8Ayie, the password fingerprint, 31 characters already mixed with the salt. Note: the same password made twice gives different fingerprints because the salt is different. The blue database box: stored in the password_hash column of the users table; only this fingerprint, the password itself is never stored. Right, at login with POST /auth/login: the typed password and the stored fingerprint from users.password_hash, which starts with $2b$12$mCgEV8BH, go into the green bcrypt.compare() box, which reads the version, the cost, and the salt from that fingerprint text, then computes again. The result is true (a match), so a session and a wristband are created (Concept 4), or false (no match), so the answer is 401 with the message wrong email or password. Note: the password is never reversed from the fingerprint; what's compared is two fingerprints. Bottom left, why bcrypt, not SHA-256: a red cross for SHA-256 from warm-up step 1, too fast for passwords, 100,000 guesses in less than half a second on the author's laptop, and an attacker's graphics card can try billions of times per second; a green check mark for bcrypt with a cost factor of 12, deliberately slow, about 0.3 seconds for one guess (up to about 1 second while the laptop is busy), a million guesses with one processor core take about 3.5 days, and the fastest graphics card only manages thousands per second; raising the cost factor by one means twice as long. Bottom right, the password rules of backend v0.5 with three check marks: at least 15 characters with no mixing rules, use a passphrase (NIST SP 800-63B-4); at most 72 bytes, anything longer is refused, not silently cut; a wrong email is the same as a wrong password, the same message and the same time thanks to bcrypt on a dummy fingerprint.](assets/password-fingerprint.png)

> ➡️ **Done reading Concepts 1–3?** Continue to [Practice 1 — The secret, the sessions table, and the first accounts](#practice-1--the-secret-the-sessions-table-and-the-first-accounts-60-minutes). Concepts 4–5 are read before Practice 2.

### 4. JWT: a concert wristband

HTTP has no memory. Every request stands on its own, so even after a login the backend doesn't know that the next `GET /devices` comes from the same person. Sending the email and the password with every request is clearly bad: the password travels over the network more and more often, and every request has to wait 0.3 seconds for bcrypt.

Big concerts solve a similar problem with a **wristband**. Your ticket is checked once at the gate, then a wristband is put on your wrist. After that, the staff at every door just look at your wristband without checking the ticket again. The wristband is hard to fake and only valid for that day.

Backend v0.5 uses the same kind of wristband, namely a **JWT** (JSON Web Token, often pronounced "jot"). You already made a simple version of it in warm-up steps 3–4: three pieces of base64url text joined by dots, **header.payload.signature**. The payload of a wristband made by the backend looks like this (**example**):

```json
{"sub":"1","role":"admin","sid":1,"iat":1792638611,"exp":1792639511}
```

| Key | What it means |
| :--- | :--- |
| `sub` | subject (the wristband's owner): the account number in the `users` table, written as text |
| `role` | `admin` or `viewer` (Concept 6) |
| `sid` | the session number in the `sessions` table, that is, the login that produced this wristband (Concept 7) |
| `iat` | issued at: when the wristband was made, in seconds since January 1, 1970 |
| `exp` | when the wristband expires: `iat` + 900 seconds, that is, **15 minutes** |

The signature is made with the **HS256** recipe (HMAC-SHA256, exactly the `createHmac` of the warm-up) and a secret key, **`JWT_SECRET`**, which only exists in the backend's `.env` file. This key is like **the organizers' stamp**. Without the stamp, nobody can make a wristband that passes the check. With the stamp, anyone can make an `admin` wristband for themselves. That's why `JWT_SECRET` is made from 32 random bytes (`randomBytes`, warm-up step 2), kept only in `.env`, and checked when the server starts: if it's empty, too short, or still holds the example text, the server refuses to run.

A wristband has one big advantage and one big weakness:

- **The advantage: it's checked without opening the database.** The guard just computes the signature again and looks at `exp`. That's much faster than looking up the session in the database on every request.
- **The weakness: it can't be taken back.** A wristband that has been handed out stays valid until `exp`, even if its owner has already logged out or their role has been lowered. That's why its lifetime is kept **short**, only 15 minutes. How to extend it without logging in again is covered in Concept 7.

Also remember the lesson of warm-up step 3: a wristband's payload **can be read by anyone** without a key. A wristband is signed, not secret. That's why the wristbands of backend v0.5 only hold the account number, the role, and the session number, with no email, no name, and certainly no password.

### 5. An `httpOnly` cookie, not `localStorage`

The wristband has to be kept in the browser so that it can be shown with every request. Tutorials on the internet usually use one of two places:

- **`localStorage`**: a small drawer that every site has in the browser. JavaScript on that page is free to open the drawer, read what's in it, then attach the wristband to every request itself.
- **A cookie**: a small note that the server leaves with the browser. The server sends it in a `Set-Cookie` response **header** (Module 16 called a header "the letter's head"; in Bruno you see headers in the **Headers** tab), and it's **the browser itself** that attaches it to every following request to the same server, in a `Cookie` header.

The login answer of backend v0.5 holds two `Set-Cookie` headers (**example**; their contents are cut short):

```text
set-cookie: access=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
set-cookie: session=LiQc7smW…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict
```

The `access` cookie holds the wristband (the JWT), and the `session` cookie holds the season pass (Concept 7). Why a cookie and not `localStorage`? Because the two ways fall to different attacks.

**The first attack: XSS** (cross-site scripting). Suppose that one day some foreign JavaScript manages to run on your dashboard page, for example from a compromised npm library or from text that's displayed without being filtered. If the wristband is in `localStorage`, that script just reads the drawer and then sends the wristband anywhere it likes. The thief can use that wristband from their own computer until it expires. A cookie marked **`HttpOnly`** can't be read by JavaScript at all; `document.cookie` doesn't show it. XSS is still dangerous, because the foreign script can still do harm while that page is open, but the wristband can't be carried off.

**The second attack: CSRF** (cross-site request forgery). A cookie's strength is also its weakness: the browser attaches it **automatically**. If you open another page, that page can tell your browser to send a `POST` to your backend, and your cookie gets attached too. The defense has three layers:

1. **`SameSite=Strict`**: the browser doesn't attach the cookie to requests started by a page from another **site**.
2. **The origin check** (the `Origin` header): modern browsers always write an `Origin` header on `POST` and `PUT` requests, and the backend refuses origins it doesn't know. This layer is needed because two pages on `127.0.0.1` with different port numbers still count as one site (Concept 9, Practice 6).
3. **CORS**: before sending a request with JSON content from a foreign page, the browser first asks with a preflight (an advance check), and the backend doesn't allow it; a foreign page also can't read the backend's answers (Concept 9).

| | `localStorage` | `HttpOnly` cookie |
| :--- | :--- | :--- |
| Can the page's JavaScript read it? | Yes | No |
| Attached to requests | By the code you write | Automatically, by the browser |
| Its main weak spot | XSS: the wristband is stolen and used somewhere else | CSRF: requests are sent in your name |
| The defense | Nothing complete, other than preventing XSS entirely | `SameSite`, the origin check, and CORS |

Every attribute in that `Set-Cookie` header has a job:

| Attribute | Its job |
| :--- | :--- |
| `HttpOnly` | JavaScript can't read this cookie |
| `SameSite=Strict` | not attached to requests started by another site |
| `Path=/` | `access` is attached to every backend address. `session` uses `Path=/auth`, so it's only attached to `/auth/…` |
| `Max-Age` | its lifetime in seconds: 900 for `access`, the time the session has left (at most 7 days) for `session` |
| `Secure` | only sent over HTTPS. The backend sets it **automatically** when the request comes over HTTPS (Phase 5; if HTTPS is handled by a proxy in front of the backend, Fastify has to be told so through the `trustProxy` setting); on `http://127.0.0.1` this attribute isn't set yet |

Cookies aren't only the browser's business. **Bruno** stores the cookies from the login answer automatically and attaches them to the following requests. The **curl** command does it when you ask it to (`-c` to save, `-b` to send). **The small terminal** in Practice 7 reads the `Set-Cookie` headers itself.

![JWT diagram: a concert wristband, kept in an httpOnly cookie, Concepts 4 and 5; the wristband is signed, not secret, and it's the browser that attaches it, not JavaScript code. Top: the wristband is a JWT, three pieces of base64url text joined by dots, with the example payload from Concept 4; the payload and signature pieces are cut short. One token row: the header piece eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 on a gray background, a dot, the payload piece eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwic2lk and so on on a light green background, a dot, then the signature piece CaO6abpZ and so on on a dark green background. From each piece, a line goes down to its explanation column. The header column: alg HS256 and typ JWT; its signature recipe is HS256 (HMAC-SHA256, exactly the createHmac of warm-up step 3); a JWT's header and payload are JSON objects written without spaces, so they always start with an opening curly brace and a quotation mark, and in base64url that beginning becomes eyJ; a long text starting with eyJ is most likely a JWT, and anyone can read what's in it. The payload column: sub 1, role admin, sid 1, iat 1792638611, and exp 1792639511, with the meaning of each key: sub, the account number in the users table, as text; role, admin or viewer; sid, the session number in the sessions table (Concept 7); iat, when the wristband was made, in seconds since 1970; exp, the expiry, that is, iat plus 900 seconds, equal to 15 minutes. A green box: anyone can read it, without a key, so no email, no name, and certainly no password. The signature column, with a stamp icon: the organizers' stamp, only the backend knows it; HMAC-SHA256 of header.payload with JWT_SECRET; JWT_SECRET is 32 random bytes that only exist in .env, and if it's empty, short, or still the example text, the server refuses to run; a red cross: if the payload is changed from viewer to admin, the signature no longer matches, and the answer is 401. Bottom: kept in the browser as two cookies, because the login answer holds two Set-Cookie headers. The browser card, which stores them, then attaches them by itself: the access cookie equals the wristband (JWT), with Path=/ and Max-Age=900 (15 minutes); the session cookie equals the season pass (Concept 7), with Path=/auth and a lifetime of at most 7 days; both are HttpOnly and SameSite=Strict; Bruno stores cookies automatically too. A green arrow, attached automatically, in the Cookie header, goes to the backend card 127.0.0.1:8080: the access cookie to every address, the session cookie only to /auth/ and the addresses under it. On the right, a comparison: the localStorage drawer, the way of many tutorials, with a red cross: the page's JavaScript can read it, and its weak spot is XSS, the wristband is stolen and then used somewhere else until it expires; versus the HttpOnly cookie of backend v0.5, with a padlock icon and a green check mark: document.cookie doesn't show it, and what needs guarding is CSRF, requests sent in your name, with the defenses SameSite, the origin check, and CORS.](assets/jwt-wristband.png)

> ➡️ **Done reading Concepts 4–5?** Continue to [Practice 2 — Login, and the wristband in a cookie](#practice-2--login-and-the-wristband-in-a-cookie-50-minutes). Concept 6 is read before Practice 3.

### 6. A guard at every door: the `admin` and `viewer` roles

There are two ways to install locks. The first way: every route checks for itself, for example by adding a wristband check at the start of every route function. The weakness: **forgetting one route** is enough to leave that door wide open. The second way: one **guard** at the building's entrance who checks **every** request before it reaches any route. Backend v0.5 uses the second way, through Fastify's `onRequest` **hook**, which is installed **before** all the routes. A new route you add later is guarded automatically too. This is the **locked by default** principle from Concept 1.

The guard answers three questions in order, exactly like the mini guard in warm-up step 5:

1. **Is this door one of the open doors?** If so, go ahead.
2. **Is the wristband genuine and not expired yet?** If there's no wristband, the wristband is fake, or the wristband is stale: **401**.
3. **Is its role allowed to do this?** A `viewer` account may only look (`GET` and `HEAD`). Anything else: **403**, with the message `viewer accounts can only look; commands and changes are admin-only`.

Practice 6 adds one more question at the very front: which page this request comes from (Concept 9).

Only five doors are opened on purpose, each for a reason:

| Open door | The reason |
| :--- | :--- |
| `POST /auth/login` | If the login door were locked, nobody could log in. This door is guarded by the attempt limit (Concept 8). |
| `POST /auth/refresh` | It's used when the wristband has already expired, so this door can't possibly require a wristband. This door is guarded by the `session` cookie (Concept 7). |
| `POST /auth/logout` | It must always succeed, even with a wristband that's already stale. |
| `GET /health` and `HEAD /health` | Used by monitoring programs and Docker's health checker (Phase 5), which can't log in. It only holds the health status (server, broker, and database) and the numbers of messages received and rejected, with no house data. |
| `/docs` | Only documentation. The **Try it out** button there still knocks on the locked routes, so it still needs a login. |

Every other route is locked, and each role's permissions look like this:

| Route | `admin` | `viewer` |
| :--- | :---: | :---: |
| `GET /devices`, `GET /devices/:id/latest`, `…/vitals`, `…/readings`, `…/state` | ✅ | ✅ |
| `GET /rules` | ✅ | ✅ |
| `GET /auth/me` (who is logged in) | ✅ | ✅ |
| `POST /devices/:id/command` (turning the relay and other actuators on) | ✅ | ❌ 403 |
| `POST /rules`, `PUT /rules/:id`, `POST /rules/:id/run` | ✅ | ❌ 403 |

An account's role is stored in the `role` column of the `users` table, which has existed since Module 17 with two choices, `admin` and `viewer`. At login, that role is written into the wristband. As a result, if someone's role is changed, their old wristband still carries the old role until it expires, at most 15 minutes later. That's a consequence of the wristband's weakness in Concept 4, and another reason why its lifetime is short.

Two last explanations. **The Telegram bot isn't affected**: it has had its own lock since Module 19 (it only serves `TELEGRAM_CHAT_ID`), and its commands come in through the `issueCommand()` function inside the backend, not over HTTP. **Socket.IO has its own door**, one that this guard doesn't watch. That door is covered in Concept 10.

![Diagram of a guard at every door: the admin and viewer roles, Concepts 6 and 10; two doors, one wristband: the API is watched by the guard, Socket.IO by the hall-door guard. At the very top, a green capsule, the access cookie equals one wristband, with two arrows: to the left, shown with every request, toward the HTTP door; to the right, shown once at the handshake, toward the hall door. The left column, the HTTP door: the guard, with a shield icon; the onRequest hook is installed before all the routes, so new routes are guarded automatically too: locked by default. An HTTP request passes the questions in order along one flow line. Step 0, marked Practice 6: is the page's origin known? Only for methods other than GET and HEAD that bring an Origin header; if not, 403. Step 1: an open door? That is, POST /auth/login, /auth/refresh, and /auth/logout, GET and HEAD /health, and /docs; if so, pass. Step 2: is the wristband genuine and not stale? An access cookie with a matching signature and an exp that hasn't passed yet; if not, 401. Step 3: is the role allowed? viewer may only use GET and HEAD; if not, 403 with the message viewer accounts can only look; commands and changes are admin-only. Passed everything: the route runs, 200. Note: the order is always identity first (401), permission second (403); without a login, even an address that doesn't exist gets 401, so strangers can't find out which routes exist; step 0 is added in Practice 6 (Concept 9). The middle column, each role's permissions, stored in the role column of the users table, as a table of routes with admin and viewer columns: GET /devices, GET /devices/:id/latest, and /vitals, /readings, and /state: admin and viewer allowed; GET /rules: both allowed; GET /auth/me (who is logged in): both allowed; POST /devices/:id/command (turning the relay and other actuators on): admin allowed, viewer 403; POST /rules, PUT /rules/:id, and POST /rules/:id/run: admin allowed, viewer 403. Note: at login, the role is written into the wristband; if the role is changed, the old wristband still carries the old role until it expires, at most 15 minutes later, and that's another reason its lifetime is short. A gray box: the Telegram bot isn't affected, because it has had its own lock since Module 19, that is, it only serves TELEGRAM_CHAT_ID, and its commands go through issueCommand() inside the backend, not over HTTP, so they don't pass the guard. The right column, the hall door /socket.io/, with a door icon: Socket.IO answers by itself before Fastify, so the guard never sees this door's guests, and its own guard, in a green box, is allowRequest plus io.use(). Step 0, with a gray circle like the guard's step 0: the page's origin is checked against the same list as the guard's, through allowRequest; a foreign page is refused with 403, while a request without Origin, for example from a Node client, is allowed. Step 1: read the access cookie from the handshake request. Step 2: check the wristband with the same stamp, JWT_SECRET. Step 3, the result: a green box, passed, it joins the room session:sid and its owner is recorded in socket.data; or a red box, refused through connect_error with the message not logged in, or session expired or invalid: refresh or log in again. A gray box: checked once, at the door; the connection is cut when its wristband expires, and at logout or when the backend revokes its session because an old pass was used again, for everything in the room session:sid. Note at the bottom: the small terminal now logs in first with a viewer account.](assets/guard-and-roles.png)

> ➡️ **Done reading Concept 6?** Continue to [Practice 3 — A guard at every door: 401 and 403](#practice-3--a-guard-at-every-door-401-and-403-50-minutes). Concept 7 is read before Practice 4.

### 7. Refresh tokens and logout: a season pass at the ticket booth

Concept 4 left a dilemma. A **short-lived** wristband (15 minutes) is safe, but annoying: every 15 minutes you have to log in again. A **long-lived** wristband (a week) is comfortable, but dangerous: a leaked wristband is valid for a week and can't be taken back.

The way out is **two things** with different jobs. Besides a wristband, visitors of a festival that lasts several days usually carry a **season pass**. The wristband is used at every door and changes every day. The season pass is only shown at the **ticket booth**, to be exchanged for a new wristband, and the organizers record its number in the booth's book.

| | Wristband | Season pass |
| :--- | :--- | :--- |
| Its technical name | access JWT | **refresh token** |
| Its cookie | `access`, `Path=/` | `session`, `Path=/auth` |
| Shown at | every request | only at the `/auth/…` ticket booth |
| Its lifetime | 15 minutes | at most 7 days from login |
| Checked with | the signature and `exp`, without the database | its row in the `sessions` table |
| Can it be revoked? | no; you wait until it expires | yes, delete its row |

The season pass of backend v0.5 **isn't a JWT**. It only holds 32 random bytes (`randomBytes`, warm-up step 2) that mean nothing by themselves. What gives them meaning is **their row in the `sessions` table**, one row for every login in every browser or program. The database doesn't store the pass itself, but its **SHA-256 fingerprint**. This time the fast SHA-256 is enough, because the pass is 256 random bits, not a password made by a human; there's no "popular pass" that could be guessed. Even someone who gets a copy of the database can't use that fingerprint as a pass.

The flow:

1. **Login** (`POST /auth/login`): the backend creates a new session row, then sends two cookies, namely the wristband and the season pass.
2. **For 15 minutes**, every request brings the wristband, and the guard checks it without opening the database.
3. **The wristband expires**: the next request gets **401**. The client then knocks on the `POST /auth/refresh` booth with its season pass. The backend looks up its session row, reads the account again from the `users` table (so role changes take effect here), then hands out a **new wristband** and a **new season pass**. The old pass isn't valid anymore. Replacing the pass every time it's used like this is called **rotation**.
4. **Logout** (`POST /auth/logout`): the session row is deleted, both cookies are emptied, and that session's Socket.IO connections are cut. The season pass dies instantly.
5. **Seven days after the login**, the session ends even if it was refreshed diligently, and you have to log in again.

Rotation has a bonus: **a stolen pass can be detected**. The backend remembers the previous pass in the `previous_token_hash` column. If that old pass shows up at the booth again, most likely two people are holding the same pass: you and the thief. The backend doesn't know which one is genuine, so the session is revoked, and both have to log in again. There's one exception: an old pass that shows up again **less than 30 seconds** after it was replaced counts as normal, for example two browser tabs that happen to refresh at the same time. In that case, the backend just hands out a new wristband, without revoking the session.

There's one limit you need to remember. Logging out kills the season pass, but **a wristband that someone else has already taken stays valid until it expires**, at most 15 minutes. That's the price of a wristband that's checked without the database, and the reason its lifetime is kept short. The same goes for changing a password: every session of that account is revoked, and the wristbands in circulation run out by themselves within 15 minutes.

![Diagram of refresh tokens and logout: a season pass at the ticket booth, Concept 7. The wristband is the access cookie, which lasts 15 minutes; the season pass is the session cookie, which is only sent to /auth/ and lasts at most 7 days. Time runs from top to bottom, with three lifelines: the client (browser, Bruno, small terminal), the backend, and the sessions table (one row per login). There are seven numbered steps. 1, login, with an email and a password checked by bcrypt (Concept 3): the client sends POST /auth/login; the backend writes a new row into the sessions table, with token_hash holding the SHA-256 fingerprint of the pass, then sends two cookies to the client: the wristband (15 minutes) and the season pass. 2, for 15 minutes, every request brings the wristband: GET /devices with the wristband gets 200; the backend only checks the signature and exp, and the database isn't opened. 3, the stale wristband, 15 minutes later: GET /devices with the stale wristband gets 401. 4, refresh with rotation, and the role is read again from the users table: the client sends POST /auth/refresh with the season pass; the backend finds the pass that matches token_hash, then rotates it: previous_token_hash gets token_hash, and token_hash gets the SHA-256 fingerprint of the new pass; the client receives a new wristband and a new pass, and the old pass isn't valid anymore. 5, an old pass used again, for example by its thief: POST /auth/refresh with the old pass matches previous_token_hash. An orange box: less than 30 seconds since it was replaced counts as the grace period, for example two tabs refreshing at the same time, so a new wristband is enough and the session stays. A red box: 30 seconds or more means probably stolen, the session is revoked by deleting its row, and you and the thief both have to log in again. 6, logout, and the season pass dies instantly: POST /auth/logout, the row is deleted from the sessions table, both cookies are emptied, and that session's Socket.IO connections are cut. 7, seven days after the login, even if it was refreshed diligently: POST /auth/refresh with the season pass, the backend sees that the expires_at time has passed, then answers 401: the session is over, log in again. The honest note box at the bottom: logout kills the season pass, but a wristband already in circulation stays valid until it expires, at most 15 minutes; the same goes for changing a password.](assets/wristband-and-season-pass.png)

> ➡️ **Done reading Concept 7?** Continue to [Practice 4 — Refresh and logout](#practice-4--refresh-and-logout-50-minutes). Concept 8 is read before Practice 5.

### 8. Rate limiting: an hourglass for password guessers

The bcrypt fingerprint makes every guess slow, but a guesser can still keep trying, day and night. The login door needs one more lock: an **attempt limit**, or **rate limiting**.

Imagine an **hourglass** at the login booth. Every IP address gets **10 chances** each time the hourglass is turned over, that is, every **60 seconds**. The 11th attempt before the sand runs out gets **429 `Too Many Requests`** with the message `too many attempts: try again in N seconds`. As soon as the sand runs out, the count goes back to zero.

A few things about this hourglass:

- **Every attempt counts**, including successful ones. That keeps the rule simple and fair: anyone only gets 10 knocks per minute. Real users rarely log in more than two or three times a minute.
- **The 11th attempt is refused even if the password is right.** Until the sand runs out, the booth doesn't even check the password. This is what the third pass requirement tests.
- **The answer brings explanatory headers**: `retry-after` (how many seconds until you may try again), and `x-ratelimit-limit`, `x-ratelimit-remaining`, and `x-ratelimit-reset` (the limit, what's left, and when the count starts over). A polite program reads `retry-after` and then waits.
- **The count is kept in the backend's memory**, so it goes back to zero every time the backend restarts. For one backend on a laptop, that's enough. A backend that runs on many servers at once keeps its count in a shared place, for example Redis (Phase 5).

Do a quick calculation. Ten guesses per minute is 14,400 guesses a day from one address. For a 15-character passphrase, that number is meaningless.

Why is the key the **IP address**, not the email being tried? A per-email limit does hold back guessers who use many IP addresses at once, but it has a side effect: **anyone could lock out the real `admin` account** just by deliberately getting it wrong 10 times a minute with the `admin` account's email. This trade-off is discussed further in 🔬.

> ➡️ **Done reading Concept 8?** Continue to [Practice 5 — Limit login attempts](#practice-5--limit-login-attempts-30-minutes). Concept 9 is read before Practice 6.

### 9. CORS: why the browser refuses

From Module 22 on, the React dashboard runs in the browser and calls the backend with JavaScript. By then you'll almost certainly meet a red message in DevTools like `… has been blocked by CORS policy …`. That message isn't a backend error; it's the **browser** that refuses. To understand it, first get to know the term **origin**: the combination of a page's **scheme**, **host name**, and **port**.

| Page address | Its origin |
| :--- | :--- |
| `http://127.0.0.1:8080/docs` | `http://127.0.0.1:8080` |
| `http://localhost:5173/` (Vite, Module 22) | `http://localhost:5173` |
| `http://127.0.0.1:5173/` | `http://127.0.0.1:5173`, **different** from the row above because the host name is different |

The browser follows the **same-origin policy**. JavaScript on a page from origin A may **send** requests to origin B, but **may not read the answers**, unless B allows it with a response header such as `access-control-allow-origin: http://127.0.0.1:5173`. This way of granting permission across origins is what's called **CORS** (Cross-Origin Resource Sharing). Imagine the browser as a **courier** who sticks to the rules: it only hands a reply letter to a page whose name appears on the server's letter of permission.

For "riskier" requests, for example `PUT`, or `POST` with JSON content, the browser even **asks first** before sending. It sends an `OPTIONS` request called a **preflight**: "May the page `http://127.0.0.1:5173` send a `PUT` here, with cookies?" If the answer doesn't contain the permission, the real request is never sent. A preflight doesn't bring cookies, so the CORS permission has to be answered **before** the guard does its work. If the guard works first, the preflight gets 401, and the browser reports it as a `CORS error`.

Backend v0.5 uses **@fastify/cors** with three settings:

- **The list of allowed origins**, from the `CORS_ORIGIN` setting in `.env`. Its default is `http://localhost:5173,http://127.0.0.1:5173`, the Vite addresses that Module 22 uses.
- **`credentials: true`**: pages from those origins may send cookies. For that, the list has to be written out in full. An asterisk (`*`, "every origin") is actually refused by the browser for requests that bring cookies.
- **The allowed methods** get `PUT` added, because the dashboard uses `PUT /rules/:id` too.

Two things often confuse beginners:

1. **CORS isn't a server lock.** CORS is a **browser** rule that protects the browser's users. Bruno, curl, and the small terminal don't care about it at all. The server's locks are still the login and the guard.
2. **A site isn't the same as an origin.** `SameSite` in Concept 5 works per **site**, that is, the scheme and the main domain name, **without the port**. For an IP address such as `127.0.0.1`, the site is the address itself, while `app.home.test` and `api.home.test` are still one site. That's why `http://127.0.0.1:5500` (for example another page on your laptop) and `http://127.0.0.1:8080` are **two different origins, but one site**, and a `SameSite=Strict` cookie is still attached to requests between them. A page like that can't read the backend's answers (CORS holds them back), but its requests still arrive, and turning on a relay doesn't require reading the answer. That's why the guard gets an extra check: for requests other than `GET` and `HEAD`, the `Origin` header written by the browser must be on the list of known origins. If it isn't: **403**.

There's one more practical lesson: `localhost` and `127.0.0.1` are **two different sites** to the browser, even though both point to the same laptop. A cookie received from `http://127.0.0.1:8080` is never sent to `http://localhost:8080`, and a page on `http://localhost:5173` that calls `http://127.0.0.1:8080` doesn't bring the cookie either, even when CORS is set up correctly. That's why this module always uses `127.0.0.1`, and Module 22 makes the dashboard and the API look like one origin through Vite's proxy.

![CORS diagram: why the browser refuses, Concept 9. The browser is a courier who sticks to the rules; the backend at http://127.0.0.1:8080 with the default CORS_ORIGIN. Top left, origin equals scheme plus host name plus port, with two examples whose parts are bracketed: http://127.0.0.1:8080, that is, the scheme http, the host name 127.0.0.1, and the port 8080; and http://localhost:5173, that is, the scheme http, the host name localhost, and the port 5173. Note: a difference in just one part, including the port, means a different origin. Top right, site equals scheme plus main domain name, without the port (for an IP address, the address itself): http://127.0.0.1:5500 and http://127.0.0.1:8080 are two origins, but one site; http://localhost and http://127.0.0.1 are two different sites, even though it's the same laptop; SameSite works per site, CORS works per origin. Middle, three pages in the same browser send requests to the backend. On the left, three page cards; in the middle, a gray band, the browser as the courier, with an envelope icon, which attaches the cookie or doesn't, then decides whether the answer may be handed to the page; on the right, the green backend box http://127.0.0.1:8080. Page a, http://127.0.0.1:5173, is in CORS_ORIGIN and on the same site as the backend: step 1, the OPTIONS preflight asks whether a PUT with a cookie is allowed; @fastify/cors sees that origin on the list and answers with the permission before the guard does its work, that is, access-control-allow-origin http://127.0.0.1:5173 and access-control-allow-credentials true; step 2, PUT /rules/1 with the cookie; the guard sees a valid wristband with the admin role; the 200 answer is handed to the page. Page b, http://prank.test, another site, a foreign page in another tab: GET /devices is sent without the cookie because of SameSite=Strict; the backend answers 401 because there's no cookie, and access-control-allow-origin isn't in the answer; that answer without CORS permission is held back by the courier, with a red cross: a CORS error in DevTools, and the page gets nothing. Page c, http://127.0.0.1:5500, another origin, but the same site, for example another page on your laptop: a POST from a form, and because the site is the same, the cookie comes along; this simple request has no preflight and still arrives; the guard checks the Origin header, http://127.0.0.1:5500 isn't on the list of known origins, so 403, and the command is refused (the guard's step 0, Practice 6). Bottom left, a green box: CORS is a browser rule, not a server lock; Bruno, curl, and the small terminal don't care about it; the server's locks are still the login and the guard. Bottom right: localhost is not the same as 127.0.0.1, two different sites; a cookie from http://127.0.0.1:8080 is never sent to http://localhost:8080, and this module always uses 127.0.0.1.](assets/cors-and-origin.png)

> ➡️ **Done reading Concept 9?** Continue to [Practice 6 — CORS and the origin check](#practice-6--cors-and-the-origin-check-40-minutes). Concept 10 is read before Practice 7.

### 10. Socket.IO is locked too: the hall door takes the same wristband

Socket.IO rides on the same HTTP server as Fastify, but it **answers by itself** every request to `/socket.io/` **before** Fastify sees it. As a result, Fastify's guard never sees the guests who connect to Socket.IO. Even after Practice 3, the Module 19 small terminal can still watch live data without logging in. Our concert building turns out to have a **hall door** at the side, and that door needs a guard of its own.

The good news: that guard can use **the same wristband**. Socket.IO always starts a connection with an ordinary HTTP request called the **handshake**, and that request brings cookies like any other request. The browser attaches them automatically; a Node client such as the small terminal writes them itself. The hall-door guard is installed with **`io.use()`**, which runs once every time a client connects:

1. Read the `access` cookie from the headers of the handshake request.
2. Check the wristband with the same stamp (`JWT_SECRET`).
3. If it passes, record its owner in `socket.data` and put the connection into the room `session:<sid>`. If not, refuse it with the message `not logged in` or `session expired or invalid: refresh or log in again`. The client receives that message through the `connect_error` event.

There's an important difference from HTTP. The HTTP guard checks the wristband on **every** request, while the hall guard only checks it **once**, at the door. A connection that's already inside the hall would stay open for hours, even after its wristband has expired. That's why the backend adds two more rules:

- **When the wristband expires, the connection is cut.** A client that wants to stay connected has to refresh first, then connect again with the new wristband.
- **At logout, or when the backend revokes a session because an old season pass was used again, that session's connections are cut immediately.** That's what the room `session:<sid>` is for: the backend just cuts every connection in that room. A session revoked from outside the backend, for example by `npm run users` when a password is changed, only ends when its wristband expires, because the client can't refresh anymore.

The hall door also uses **the same origin check** as the HTTP guard: a handshake from a page whose origin isn't known is refused, while a Node client that doesn't write an `Origin` header may still connect, as long as its wristband is valid. This check is installed through Socket.IO's `allowRequest` option, which uses the same list of origins as the HTTP guard. The right column of the picture at the end of [Concept 6](#6-a-guard-at-every-door-the-admin-and-viewer-roles) sums up this whole hall-door guard.

The small terminal you built changes too. It now logs in first with a **`viewer`** account (the principle of least privilege: the terminal only needs to look), keeps both cookies from the login answer, then connects. When it's cut off because its wristband has expired, it refreshes by itself and connects again.

> ➡️ **Done reading Concept 10?** Continue to [Practice 7 — Socket.IO is locked too](#practice-7--socketio-is-locked-too-50-minutes). Concept 11 is read before Practice 8.

### 11. Secrets and privacy: what must not leak

From this week on, the backend's `.env` file holds more secrets. So do two new `.env` files:

| Secret | Where it lives | If it leaks |
| :--- | :--- | :--- |
| The database password (in `DATABASE_URL`) | `backend/.env` | The whole database is open to anyone who can reach its port |
| `TELEGRAM_BOT_TOKEN` | `backend/.env` | Other people can send messages in your bot's name |
| `JWT_SECRET` (new) | `backend/.env` | Other people can make fake `admin` wristbands |
| Account passwords for Bruno (new) | `backend/bruno/.env` | The accounts are taken over |
| The small terminal's account password (new) | `tools/.env` | Its `viewer` account is taken over |

Those three files **must not** go into Git. The main defense is still **`.gitignore`**, as it has been since Module 16. Only **`.env.example`** goes into Git: a copy without secrets that shows which settings have to be filled in.

GitHub also has an extra guard: **secret scanning**. For public repositories, GitHub scans every push and looks for text whose **shape** matches hundreds of secret patterns from all kinds of service providers, for example AWS keys or GitHub tokens. What it finds shows up as alerts in the repository's **Security and quality** tab (in GitHub's older layout, this tab is called **Security**). For some patterns, the push is even blocked on the spot (**push protection**). But this guard has its limits: **it only recognizes shapes it already knows.** A Telegram bot token is recognized and gets an alert, but the push isn't blocked. The `JWT_SECRET` you made is just 43 random characters, and a shape like that isn't recognized at all. So secret scanning is the last safety net, not a replacement for `.gitignore`.

If a secret has already been pushed, the order is: **change the secret first**, then clean up. Even if the commit is deleted, a secret that has ever appeared on GitHub must be treated as leaked, because someone may already have taken a copy. For `JWT_SECRET`, make a new one; every old wristband becomes invalid at once. For the bot token, ask for a new token through @BotFather.

**Privacy** is the other side of secrets: data belonging to **other people** that you store. The principle is simple: **store only what you need, guard what you store, and delete what you don't use.** Backend v0.5 applies it like this:

- **The only things stored about each account are the email, the name, the role, the password fingerprint, when the account was created, and when the password was changed.** The `sessions` table deliberately doesn't record IP addresses or browser types.
- **The wristband only holds the account number, the role, and the session number**, because anyone can read its payload.
- **The log never holds passwords, wristbands, or season passes.** The log only records the method (`GET`, `POST`, …), the address, the status code, the account number, and the IP address of login attempts (so that password guessers can be seen). Practice 8 proves it.
- **Deleting an account also deletes all its sessions.**
- **Sensor data is personal data too.** A history of motion and temperature tells when the house is busy and when it's empty. That's why the live data and the history are locked too.

In Indonesia, personal data is protected by **Law Number 27 of 2022 on Personal Data Protection** (*Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi*). For a project in your own home, you don't need to study its articles in depth. The habit of "store only what you need, guard it, delete it" above is already a good first step.

> ➡️ **Done reading Concept 11?** Continue to [Practice 8 — Secrets, privacy, and the pass test](#practice-8--secrets-privacy-and-the-pass-test-40-minutes).

## 🔧 Step-by-step practice

### Practice 1 — The secret, the sessions table, and the first accounts (60 minutes)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder; the terminal in the `backend` folder), **Docker Desktop** with the `smarthome-db` container running, and **psql** inside that container. Windows users: use VS Code's built-in terminal (PowerShell), **not Git Bash**.

The backend can't check anyone yet, because there isn't a single account. This practice prepares three things: **the organizers' stamp** (`JWT_SECRET`) in `.env`, **a place to store password fingerprints and sessions** in the database (migration `008`), and **the first two accounts**, one `admin` and one `viewer`. Accounts are deliberately created through the terminal, not through the API. Only the person who holds the server laptop and its `.env` file may create accounts, so there's no "sign up" door for strangers to knock on.

#### 1.1 Make the organizers' stamp: `JWT_SECRET` (5 minutes)

Open a terminal in the `backend` folder (if the Quick Win terminal is still open, you're already there; if you open a new terminal, first type `cd backend`), then make 32 random bytes:

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

**Expected output** (**example**; yours will certainly be different, and **never use the one printed in this module**):

```text
afECyYqdbI2sLmD3uDDo1wHsarmrX_6xzW7QdzBib70
```

- **`node -e "…"`** runs one line of JavaScript without creating a file. It does the same as warm-up step 2: 32 bytes from the operating system's source of randomness, written as 43 base64url characters.
- The same command works in PowerShell 5.1, PowerShell 7, and the macOS Terminal.

Select the whole output line, then copy it (**Ctrl + C**). Open the **`.env`** file in the `backend` folder, then add these two lines at the very bottom:

```text
# Module 20: the key that signs the wristbands (JWT). Secret: don't share it, don't commit it.
JWT_SECRET=change-this-to-the-output-of-the-command-you-just-ran
```

Replace the text `change-this-to-the-output-of-the-command-you-just-ran` with what you copied (**Ctrl + V**), so that the line becomes `JWT_SECRET=` followed by your own 43 random characters, with no spaces and no quotation marks. Save (**Ctrl + S**). Remember Concept 4: anyone who knows this value can make a fake `admin` wristband. Every laptop or server has its own `JWT_SECRET`, and changing it makes every old wristband invalid, so every client has to refresh first before it can use the backend again.

Your teammates also need to know that this setting is required, without seeing its value. Open **`.env.example`**, then add this at the very bottom:

```text
# Module 20: the JWT signing key, at least 32 random characters. Make your own with this command, then paste the result:
#   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
JWT_SECRET=change-this-to-the-output-of-the-command-above
```

`.env.example` goes into Git, so it only holds an example that's clearly not a secret. The backend will refuse that `change-this-…` text, so that nobody forgets to fill it in.

#### 1.2 Check `.env` with Zod (10 minutes)

Since Module 16, `src/config/env.ts` has only checked whether a setting **exists**. Now `.env` holds a secret that has to meet requirements: `JWT_SECRET` needs at least 32 characters and must not be the example text. The checking is handed to **Zod**, the same checker the data contract has used since Module 16. Open **`src/config/env.ts`**, then replace its whole content with:

```ts
// env.ts - the server settings from .env (read by Node.js through --env-file), checked once by a Zod schema at startup.
// Module 20: .env now also holds a secret (JWT_SECRET), so it is checked as strictly as the messages from devices.
import { z } from "zod";

z.config(z.locales.en()); // Zod error messages in English (this file is read first, before contract.ts)

const empty = (value: unknown) => (value === "" ? undefined : value); // an empty line "NAME=" = not filled in
const required = z.preprocess(empty, z.string({ error: "not filled in" }));

const Settings = z.object({
  MQTT_URL: required, // the broker's address, for example mqtt://192.168.1.37:1883
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

- **`z.config(z.locales.en())`** makes Zod's built-in error messages English. This file is the first one the backend reads, so the language setting applies to every other Zod schema.
- **`empty`** turns a line such as `JWT_SECRET=` (with nothing after it) into "not there", so that it counts as not filled in. **`z.preprocess()`** runs that function before Zod checks the value.
- **`PORT`** is turned from text into a number (`z.coerce.number()`), must be a whole number from 1 to 65,535, and uses `8080` when it's empty.
- **`JWT_SECRET`** is required, needs at least 32 characters, and must not start with `change`, which is how the example text from `.env.example` starts.
- **`safeParse()`** doesn't stop right at the first problem. All the problems are printed at once, then `process.exit(1)` stops the program, because a backend without the right settings must not run.
- The setting names don't change (`env.MQTT_URL`, `env.PORT`, and so on), so no other file needs to change.

Try out the check. In `.env`, put a `#` in front of the `JWT_SECRET=…` line so that the line counts as a comment, save, then run:

```text
npm run dev
```

**Expected output:**

```text
> mini-smart-home-backend@0.4.0 dev
> node --watch --env-file=.env src/server.ts

Setting JWT_SECRET in .env: not filled in
Copy .env.example to .env (or open your .env), fix the settings above, then run again.
Failed running 'src/server.ts'. Waiting for file changes before restarting...
```

The backend refuses to run, and `npm run dev` waits for a file to change. Leave that terminal as it is, then delete the `#` in `.env` again and save. `npm run dev` watches `.env` too, so the backend restarts by itself.

**Expected output** (**example**; the file path on your screen will be different):

```text
Change detected in 'C:\\…\\mini-smart-home\\backend\\.env'
Restarting 'src/server.ts'
[08:56:50] INFO: database ready
[08:56:50] INFO: rules loaded: 2 active of 3
[08:56:50] INFO: schedule of rule 2 (Morning watering) installed: "0 6 * * *" Asia/Jakarta, next 23 Oct 2026, 06:00 WIB
[08:56:52] INFO: Telegram notifications off: TELEGRAM_BOT_TOKEN is empty
[08:56:52] INFO: Server listening at http://127.0.0.1:8080
[08:56:52] INFO: API docs: http://127.0.0.1:8080/docs
[08:56:52] INFO: connected to broker mqtt://127.0.0.1:1883
[08:56:52] INFO: config c-20261022-015652-1 to f00d00000001: temp_fan_on 30 from rule 1 (retained)
```

The backend starts as usual. The `Telegram notifications off` line only appears if your `TELEGRAM_BOT_TOKEN` is empty. Other error messages you might meet:

| What's in `.env` | The message |
| :--- | :--- |
| `JWT_SECRET=change-this-to-the-output-of-the-command-above` (copied from `.env.example`) | `Setting JWT_SECRET in .env: still holds the example from .env.example; make a new secret` |
| `JWT_SECRET=my-secret-123456` (16 characters) | `Setting JWT_SECRET in .env: too short (at least 32 characters); make a new one with the command in .env.example` |
| `JWT_SECRET=` (the line is there, its value is empty) | `Setting JWT_SECRET in .env: not filled in` |
| `MQTT_URL=` empty **and** `JWT_SECRET` still the example | two lines at once: `Setting MQTT_URL in .env: not filled in`, then `Setting JWT_SECRET in .env: still holds the example from .env.example; make a new secret` |

Stop the backend with **Ctrl + C**: the rest of this practice doesn't need it yet.

#### 1.3 Migration `008`: a place for fingerprints and sessions (10 minutes)

In the Explorer panel, first click the empty space, then right-click the **`backend/migrations`** folder → **New File…**, name it **`008_login_and_sessions.sql`**, then type:

```sql
-- 008_login_and_sessions.sql - accounts can log in (Module 20): the password fingerprint (bcrypt hash) in the users table,
-- and a sessions table for refresh tokens. One sessions row = one login that is still active in one browser or device.

-- The users table has been ready since Module 17 (migration 001), but it has no passwords yet. Only their fingerprint is
-- stored (a bcrypt hash, 60 characters, starting with $2b$). An account whose password_hash is empty (NULL) can't log in.
-- Emails are always stored in lowercase, so Budi@Home.test and budi@home.test are the same account.
ALTER TABLE users
  ADD COLUMN password_hash       text CHECK (password_hash ~ '^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$'),
  ADD COLUMN password_changed_at timestamptz,
  ADD CONSTRAINT users_email_lowercase CHECK (email = lower(email));

-- Logins that are still active. The original refresh token (32 random bytes) only lives in the browser's cookie; the
-- database stores its SHA-256, so someone who steals the database content can't use it. Every POST /auth/refresh swaps
-- the old token for a new one (rotation): token_hash is replaced, and the previous token moves to previous_token_hash. If
-- that hash is used again, the token was most likely stolen, so the session is deleted (whoever uses it must log in again).
CREATE TABLE sessions (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             integer NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- account deleted = sessions deleted too
  token_hash          text NOT NULL UNIQUE,                                      -- SHA-256 of the refresh token valid now
  previous_token_hash text,                                                      -- SHA-256 of the previous refresh token
  created_at          timestamptz NOT NULL DEFAULT now(),                        -- when the login happened
  updated_at          timestamptz NOT NULL DEFAULT now(),                        -- when it was last refreshed (rotation)
  expires_at          timestamptz NOT NULL                                       -- 7 days after login: then log in again
);
CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_previous_token_hash_idx ON sessions (previous_token_hash);
```

- **`ALTER TABLE users`** adds two columns to the `users` table that has been ready since Module 17: **`password_hash`** (the bcrypt fingerprint) and **`password_changed_at`** (when the password was last changed).
- **`CHECK (password_hash ~ '…')`** refuses anything that isn't shaped like a 60-character bcrypt fingerprint. If some code ever accidentally tries to store a password as it is, the database refuses it. The `~` sign means "matches the pattern" (a regular expression).
- **`CHECK (email = lower(email))`** makes sure emails are always stored in lowercase, so one person can't have two accounts just because of different capital letters.
- **The `sessions` table** records every login that's still active: its owner (`user_id`), the fingerprint of the current season pass (`token_hash`) and of the previous one (`previous_token_hash`), when it was created, when it was last refreshed, and when it expires (Concept 7). **`ON DELETE CASCADE`** means the sessions are deleted too when their account is deleted.
- **Two indexes** speed up looking up sessions by owner and by old pass.

Run the migration:

```text
npm run migrate
```

**Expected output:**

```text
> mini-smart-home-backend@0.4.0 migrate
> node --env-file=.env src/db/migrate.ts

applied: 008_login_and_sessions.sql
1 new migration(s) applied, 6 applied earlier.
```

The six old migrations are `001`–`005` and `007`. Number `006` doesn't exist in your repository unless you did Module 18's Level 3 Challenge; if you did, the last line says `7 applied earlier`, and then `8 applied earlier` when this command is repeated.

Run it once more to make sure nothing is applied twice:

```text
npm run migrate
```

**Expected output** (the last line):

```text
0 new migration(s) applied, 7 applied earlier.
```

`npm run migrate` also reads `.env` through `src/config/env.ts`. That's why `JWT_SECRET` has to be filled in first: without that setting, even `npm run migrate` stops with the message `Setting JWT_SECRET in .env: not filled in`.

#### 1.4 Password rules and fingerprints: `src/auth/password.ts` (5 minutes)

Create a new folder for everything to do with security: right-click the **`backend/src`** folder → **New Folder…**, and name it **`auth`**. Then right-click the `auth` folder → **New File…**, name it **`password.ts`**, and type:

```ts
// password.ts - the password rules and the password's "fingerprint" (bcrypt hash), Module 20. The database only stores the
// fingerprint: the original password can't be computed back from it, but a typed password can be matched against it.
import bcrypt from "bcrypt";
import { z } from "zod";

// cost 12 = 2^12 rounds: about 0.3 seconds on a 2021 i5 laptop. One step up = twice as long (OWASP: at least 10, < 1 second).
export const COST = 12;

// The rules for a new password (NIST SP 800-63B-4): what matters is LENGTH, not a mix of capitals, digits, and symbols.
// bcrypt only reads the first 72 bytes, so a longer password is refused (instead of being silently cut).
export const Password = z.string()
  .min(15, "the password needs at least 15 characters; use a passphrase: a few words only you know")
  .refine((s) => Buffer.byteLength(s, "utf8") <= 72, "the password can be at most 72 bytes (the bcrypt limit; one emoji = 4 bytes)");

export function makeFingerprint(password: string): Promise<string> {
  return bcrypt.hash(password, COST); // a random salt is made automatically and is stored inside the result
}

// A dummy fingerprint for emails that aren't registered: bcrypt.compare still runs, so "wrong email" takes as long to answer
// as "wrong password", and an attacker can't tell from the response time which emails are registered.
// Made ONCE when the server starts (not when it's first needed: that would make the first attempt twice as slow).
const dummyFingerprint = bcrypt.hash("nobody's password at all", COST);

// The result is true when the password matches. fingerprint undefined/null = no such account or no password yet (still computed).
export async function matchPassword(password: string, fingerprint: string | null | undefined): Promise<boolean> {
  if (fingerprint === null || fingerprint === undefined) {
    await bcrypt.compare(password, await dummyFingerprint); // the result is thrown away: only so that the time is the same
    return false;
  }
  return bcrypt.compare(password, fingerprint);
}
```

- **`COST = 12`** is bcrypt's cost factor from Concept 3.
- **`Password`** is the Zod schema for the password rules: at least 15 characters, and at most 72 bytes long. `Buffer.byteLength(s, "utf8")` counts bytes, not characters, so 19 emoji (38 JavaScript characters, 76 bytes) are refused.
- **`makeFingerprint()`** makes a fingerprint. The random salt is made by bcrypt itself.
- **`dummyFingerprint`** is made **once, when the program starts**, then `matchPassword()` uses it for emails that aren't registered, so that the answer takes as long as for a wrong password (Concept 3). Notice that it's stored as a promise (a result that arrives later) without `await`: the calculation runs in the background when the server starts, and is only waited for the first time it's needed.

#### 1.5 Accounts in the database: `src/db/users.ts` (5 minutes)

Right-click the **`backend/src/db`** folder → **New File…**, name it **`users.ts`**, then type:

```ts
// users.ts - accounts (the users table) and logins that are still active (the sessions table), Module 20. The password
// fingerprint (password_hash) only leaves this file through findForLogin: no other function ever reads it.
import { pool } from "./pool.ts";

export type Role = "admin" | "viewer";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

const COLUMNS = "id, email, name, role";

export async function findForLogin(email: string): Promise<(User & { password_hash: string | null }) | undefined> {
  const result = await pool.query<User & { password_hash: string | null }>(
    `SELECT ${COLUMNS}, password_hash FROM users WHERE email = $1`, [email]);
  return result.rows[0];
}

export async function allUsers(): Promise<(User & { has_password: boolean; active_sessions: number })[]> {
  const result = await pool.query<User & { has_password: boolean; active_sessions: number }>(
    `SELECT u.id, u.email, u.name, u.role, u.password_hash IS NOT NULL AS has_password,
            (SELECT count(*)::int FROM sessions s WHERE s.user_id = u.id AND s.expires_at > now()) AS active_sessions
     FROM users u ORDER BY u.id`);
  return result.rows;
}

export async function addUser(email: string, name: string, role: Role, passwordHash: string): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (email, name, role, password_hash, password_changed_at) VALUES ($1, $2, $3, $4, now()) RETURNING ${COLUMNS}`,
    [email, name, role, passwordHash]);
  return result.rows[0];
}

// Change the password, then revoke all its sessions: anyone still logged in with the old password must log in again.
export async function changePassword(email: string, passwordHash: string): Promise<User | undefined> {
  const result = await pool.query<User>(
    `UPDATE users SET password_hash = $2, password_changed_at = now() WHERE email = $1 RETURNING ${COLUMNS}`, [email, passwordHash]);
  const u = result.rows[0];
  if (u !== undefined) await pool.query("DELETE FROM sessions WHERE user_id = $1", [u.id]);
  return u;
}

export async function changeRole(email: string, role: Role): Promise<User | undefined> {
  const result = await pool.query<User>(`UPDATE users SET role = $2 WHERE email = $1 RETURNING ${COLUMNS}`, [email, role]);
  return result.rows[0];
}

export async function deleteUser(email: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM users WHERE email = $1", [email]); // its sessions are deleted too (CASCADE)
  return result.rowCount === 1;
}
```

- **`COLUMNS`** deliberately doesn't include `password_hash`. Only `findForLogin()` reads the password fingerprint, so no other function can accidentally send it to the API or the log.
- **`allUsers()`** counts the sessions that are still active for every account, and only answers **whether** that account has a password (`has_password`), not its fingerprint.
- **`changePassword()`** also deletes every session of that account, so that anyone still holding an old season pass has to log in again (Concept 7).
- Every query uses the parameters `$1`, `$2`, as in Module 17, so even a strange email can't sneak in an SQL command.

#### 1.6 Managing accounts from the terminal: `npm run users` (10 minutes)

Right-click the **`backend/src/db`** folder → **New File…**, name it **`manage-users.ts`**, then type:

```ts
// manage-users.ts - creating and managing accounts from the terminal (Module 20). There is deliberately NO API route for
// signing up: accounts can only be made by someone who holds the server laptop and its .env file.
// Run from the backend folder:
//   npm run users -- add <email> "<name>" <admin|viewer>     the password is asked for and isn't shown on the screen
//   npm run users -- password <email>                        change the password; all sessions of that account are revoked
//   npm run users -- role <email> <admin|viewer>
//   npm run users -- delete <email>
//   npm run users -- list
// The password is NEVER written as an argument: arguments stay in the terminal history and show up in the process list.
import { z } from "zod";
import { pool } from "./pool.ts";
import { Password, makeFingerprint } from "../auth/password.ts";
import { findForLogin, changeRole, changePassword, deleteUser, allUsers, addUser } from "./users.ts";
import type { Role } from "./users.ts";

const Email = z.email("invalid email").max(254);
const ValidRole = z.enum(["admin", "viewer"], "the role must be admin or viewer");

// Ask for a password without showing it: the terminal is switched to "raw" mode so that every key reaches the program
// without being shown, and the program only writes * for every character.
function askHidden(label: string): Promise<string> {
  const input = process.stdin;
  if (!input.isTTY) { // for example a Git Bash window (mintty): typing can't be hidden there, so don't ask
    throw new Error("this terminal can't hide the password as you type; run this command in the VS Code terminal "
      + "(PowerShell) or the macOS Terminal");
  }
  process.stdout.write(label);
  input.setRawMode(true);
  input.setEncoding("utf8");
  input.resume();
  return new Promise((done) => {
    let content: string[] = [];
    const listen = (data: string) => {
      if (data.startsWith("\u001b")) return; // arrow keys and the like: ignore
      for (const letter of data) {
        if (letter === "\r" || letter === "\n") { // Enter
          input.off("data", listen);
          input.setRawMode(false);
          input.pause();
          process.stdout.write("\n");
          return done(content.join(""));
        }
        if (letter === "\u0003") { // Ctrl + C
          process.stdout.write("\n");
          process.exit(130);
        }
        if (letter === "\u007f" || letter === "\b") { // Backspace (macOS/Linux send \u007f, Windows \b)
          if (content.length > 0) {
            content = content.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (letter < " ") continue; // other control keys (Tab and so on)
        content.push(letter);
        process.stdout.write("*");
      }
    };
    input.on("data", listen);
  });
}

async function askNewPassword(): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const password = await askHidden("New password: ");
    const check = Password.safeParse(password);
    if (!check.success) {
      console.log(check.error.issues[0].message);
      continue;
    }
    if (await askHidden("Type it again: ") !== password) {
      console.log("the two passwords aren't the same, try again");
      continue;
    }
    return password;
  }
  throw new Error("no password was set after 3 attempts");
}

function check<T>(schema: z.ZodType<T>, value: string | undefined): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`${value ?? "(empty)"}: ${result.error.issues[0].message}`);
  return result.data;
}

const USAGE = `Usage (from the backend folder):
  npm run users -- add <email> "<name>" <admin|viewer>
  npm run users -- password <email>
  npm run users -- role <email> <admin|viewer>
  npm run users -- delete <email>
  npm run users -- list`;

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "add" && args.length === 3) {
    const email = check(Email, args[0]).toLowerCase(); // Budi@Home.test and budi@home.test = the same account
    const role: Role = check(ValidRole, args[2]);
    if (await findForLogin(email) !== undefined) throw Object.assign(new Error("already registered"), { code: "23505" });
    const password = await askNewPassword(); // the email is checked first, so that typing the password isn't wasted
    const account = await addUser(email, args[1], role, await makeFingerprint(password));
    console.log(`account ${account.id} created: ${account.email} (${account.name}, ${account.role})`);
  } else if (command === "password" && args.length === 1) {
    const email = check(Email, args[0]).toLowerCase();
    if (await findForLogin(email) === undefined) throw new Error(`${email} isn't registered`);
    const account = await changePassword(email, await makeFingerprint(await askNewPassword()));
    console.log(`password of ${account?.email} changed; all its sessions revoked (must log in again)`);
  } else if (command === "role" && args.length === 2) {
    const email = check(Email, args[0]).toLowerCase();
    const account = await changeRole(email, check(ValidRole, args[1]));
    console.log(account ? `${account.email} is now ${account.role} (takes effect within 15 minutes, when its wristband is renewed)`
      : `${email} isn't registered`);
  } else if (command === "delete" && args.length === 1) {
    const email = check(Email, args[0]).toLowerCase();
    console.log(await deleteUser(email) ? `${email} deleted together with all its sessions` : `${email} isn't registered`);
  } else if (command === "list") {
    console.table(await allUsers()); // the password fingerprints aren't shown
  } else {
    console.log(USAGE);
    process.exitCode = 1;
  }
} catch (error) {
  const code = (error as { code?: string }).code;
  if (code === "23505") console.error("that email is already registered; to change its password: npm run users -- password <email>");
  else console.error(`failed: ${(error as Error).message}`);
  process.exitCode = 1;
}
await pool.end(); // close the pool so that the program ends
```

- The password is **never** passed as a command argument. Arguments are kept in the terminal history (press **↑** and your password shows up again) and can be seen by other programs in the process list.
- **`askHidden()`** hides what you type. `setRawMode(true)` puts the terminal in **raw** mode: every key goes straight to the program **without being shown**, and the program writes a `*` itself for every character. **Enter** finishes, **Backspace** deletes one character, and **Ctrl + C** cancels. A terminal that can't be put in raw mode, for example a Git Bash window, is refused with a clear message, so that the password never becomes visible on the screen.
- **`askNewPassword()`** asks for the password **twice** and checks it with the `Password` schema. There are three tries.
- The email is checked **first** (its shape, then whether it's already registered), so that you don't type a long password for nothing. Emails are always turned into lowercase.
- **`console.table()`** shows the list of accounts as a table, without the password fingerprints.
- **`await pool.end()`** on the last line closes the database connections, so that the program ends by itself.

Now register the script. Open **`package.json`**, then add one line in the `"scripts"` section, right below the `"seed-history"` line (and above the `"test"` line):

```json
    "users": "node --env-file=.env src/db/manage-users.ts",
```

The new line ends with a comma, just like the other lines above `"test"`.

#### 1.7 Create the `admin` and `viewer` accounts (10 minutes)

Create your first `admin` account. You may change the email and the name; this module uses the **`.test`** domain, which is reserved for examples and isn't owned by anyone. **Make a habit of writing the `--`**: it tells npm that the words after it belong to the `users` script, not to npm. Ordinary words are actually passed on even without `--`, but options that start with a minus sign, such as `--reporter=tree` in Practice 4.4, only reach the script if the `--` is there.

```text
npm run users -- add admin@home.test "Home Admin" admin
```

Type your passphrase when asked (at least 15 characters, for example a few random words that only you know; don't use an example from this module), press **Enter**, then type it once more. Only stars are shown.

**Expected output** (**example**; the number of stars follows the length of your password):

```text
> mini-smart-home-backend@0.4.0 users
> node --env-file=.env src/db/manage-users.ts add admin@home.test Home Admin admin

New password: ****************************
Type it again: ****************************
account 1 created: admin@home.test (Home Admin, admin)
```

Repeat for the `viewer` account, with a **different** password:

```text
npm run users -- add viewer@home.test "Home Guest" viewer
```

**Expected output** (**example**):

```text
New password: ****************************
Type it again: ****************************
account 2 created: viewer@home.test (Home Guest, viewer)
```

Write both passwords down in a password manager or on paper that you keep yourself, not in a chat message, a note on your phone, or a file inside the repository folder: both are used again in Practice 2. If something is wrong, the script explains it. For example, when the author tried to create a third account with `npm run users -- add test@home.test "Test Failed" viewer` (you don't need to copy this), the first password was too short, the second was too long, and on the third try, the two entries didn't match:

```text
New password: **************
the password needs at least 15 characters; use a passphrase: a few words only you know
New password: ********************************************************************************
the password can be at most 72 bytes (the bcrypt limit; one emoji = 4 bytes)
New password: ***********************
Type it again: **********************
the two passwords aren't the same, try again
failed: no password was set after 3 attempts
```

An email that's already registered is refused **before** the password is asked for, including when only its capital letters are different (`Admin@Home.TEST` is the same as `admin@home.test`):

```text
that email is already registered; to change its password: npm run users -- password <email>
```

A role other than `admin` and `viewer` is also refused before the password is asked for, for example `failed: guest: the role must be admin or viewer`. If you forget how to use it, run `npm run users` without any words: the script shows all five of its commands.

Look at your list of accounts:

```text
npm run users -- list
```

**Expected output:**

```text
┌─────────┬────┬────────────────────┬──────────────┬──────────┬──────────────┬─────────────────┐
│ (index) │ id │ email              │ name         │ role     │ has_password │ active_sessions │
├─────────┼────┼────────────────────┼──────────────┼──────────┼──────────────┼─────────────────┤
│ 0       │ 1  │ 'admin@home.test'  │ 'Home Admin' │ 'admin'  │ true         │ 0               │
│ 1       │ 2  │ 'viewer@home.test' │ 'Home Guest' │ 'viewer' │ true         │ 0               │
└─────────┴────┴────────────────────┴──────────────┴──────────┴──────────────┴─────────────────┘
```

The `(index)` column is a row number made by `console.table()`, not the account number. `active_sessions` is still `0` because nobody has logged in yet; that number goes up in Practice 2.

#### 1.8 Peek into the `users` table (3 minutes)

Open psql inside the database container, as in Modules 17–19:

```text
docker exec -it smarthome-db psql -U postgres -d smarthome
```

Then run:

```sql
SELECT id, email, name, role, left(password_hash, 7) AS start, length(password_hash) AS length FROM users;
```

**Expected output:**

```text
 id |      email       |    name    |  role  |  start  | length
----+------------------+------------+--------+---------+--------
  1 | admin@home.test  | Home Admin | admin  | $2b$12$ |     60
  2 | viewer@home.test | Home Guest | viewer | $2b$12$ |     60
(2 rows)
```

All that's stored is a 60-character fingerprint starting with `$2b$12$`, not your password. Leave psql with `\q`.

#### 1.9 Password tests with Vitest (5 minutes)

Right-click the **`backend/src/auth`** folder → **New File…**, name it **`auth.test.ts`**, then type:

```ts
// auth.test.ts - unit tests of the login logic (Module 20): password rules and bcrypt fingerprints.
// No database and no server. Run: npm test
import { describe, expect, it } from "vitest";
import { Password, makeFingerprint, matchPassword } from "./password.ts";

describe("password rules (Password)", () => {
  it("14 characters refused, 15 characters accepted", () => {
    expect(Password.safeParse("a".repeat(14)).success).toBe(false);
    expect(Password.safeParse("a b c d e f g h").success).toBe(true); // exactly 15 characters: spaces count too
  });
  it("more than 72 bytes refused: bcrypt would silently cut them", () => {
    expect(Password.safeParse("a".repeat(72)).success).toBe(true);
    expect(Password.safeParse("a".repeat(73)).success).toBe(false);
    expect(Password.safeParse("😀".repeat(19)).success).toBe(false); // 19 emoji = 38 JavaScript characters, but 76 bytes
  });
});

// bcrypt is slow on purpose (about 0.3 seconds per hash on an i5 laptop, >1 second on a busy or slow laptop), so the time
// limit of these tests is raised from Vitest's default 5 seconds to 30 seconds.
const SLOW = 30_000;

describe("password fingerprint (bcrypt)", () => {
  it("the right password matches, a wrong one doesn't, and the fingerprint always differs (random salt)", async () => {
    const one = await makeFingerprint("a password just for this test");
    const two = await makeFingerprint("a password just for this test");
    expect(one).toMatch(/^\$2b\$12\$.{53}$/);
    expect(one).not.toBe(two);
    expect(await matchPassword("a password just for this test", one)).toBe(true);
    expect(await matchPassword("a password just for that test", one)).toBe(false);
  }, SLOW);
  it("no such account (empty fingerprint): the result is false, not an error", async () => {
    expect(await matchPassword("anything", undefined)).toBe(false);
    expect(await matchPassword("anything", null)).toBe(false);
  }, SLOW);
});
```

- The first two tests check the password rules: exactly 14 and 15 characters, 72 and 73 bytes, and 19 emoji.
- The next two tests check bcrypt: the right password matches, a wrong one doesn't, the fingerprint is always different, and an account that doesn't exist gets `false` without an error.
- **`SLOW`** raises the time limit of the bcrypt tests from Vitest's default, 5 seconds, to 30 seconds. The bcrypt algorithm is slow on purpose, and on a busy laptop, one test can take several seconds.

Run all the tests:

```text
npm test
```

**Expected output** (**example**; the number of milliseconds will be different):

```text
> mini-smart-home-backend@0.4.0 test
> vitest run


 RUN  v5.0.5 C:/…/mini-smart-home/backend

 ✓ src/rules/engine.test.ts (11 tests) 260ms
 ✓ src/auth/auth.test.ts (4 tests) 9897ms
   ✓ password fingerprint (bcrypt) (2)
     ✓ the right password matches, a wrong one doesn't, and the fingerprint always differs (random salt) 6801ms
     ✓ no such account (empty fingerprint): the result is false, not an error 3082ms

 Test Files  2 passed (2)
      Tests  15 passed (15)
   Start at  09:28:45
   Duration  18.77s (tests 41%, transform 35%, import 24%)
```

**`Tests  15 passed (15)`**: the 11 tests of the rules brain from Module 19 plus 4 new tests. Vitest only lists the slow tests one by one, and both bcrypt tests really are slow: on the author's laptop while it was busy, one test took almost 7 seconds. That's what the 30-second time limit is for.

#### 1.10 Save to the branch (2 minutes)

```text
git add package.json package-lock.json .env.example src/config/env.ts migrations/008_login_and_sessions.sql src/auth src/db/users.ts src/db/manage-users.ts
git status
git commit -m "Accounts and password fingerprints: JWT_SECRET, env.ts with Zod, migration 008, npm run users (Module 20 Practice 1)"
```

Notice that `.env` is **not** written in the `git add`. The `git status` line in the middle of the block shows what's about to be committed, as has been the habit since Module 16: `.env` must not appear in the `Changes to be committed` list or under `Untracked files`.

> ⬆️ **Done with Practice 1?** Go back to [Concepts 4–5](#4-jwt-a-concert-wristband) before Practice 2.

### Practice 2 — Login, and the wristband in a cookie (50 minutes)

> 🖥️ **Tools used:** **VS Code** (the terminal in the `backend` folder), **Bruno** with the `backend/bruno` collection and the `local` environment, and a second terminal in the `backend` folder for other commands while the backend is running (2.6). The `smarthome-db` container stays running.

The accounts exist. Now the backend needs a **login booth**: `POST /auth/login` checks the email and the password, records a new session in the `sessions` table, then sets two `HttpOnly` cookies, namely the wristband (`access`) and the season pass (`session`). The other doors **aren't** locked yet; the guard only arrives in Practice 3. So at the end of this practice, every old route can still be knocked on without a login, as in Module 19.

#### 2.1 Install `@fastify/cookie` and `@fastify/jwt` (3 minutes)

In the terminal of the `backend` folder:

```text
npm install @fastify/cookie@11.1.3 @fastify/jwt@10.2.5
```

**Expected output** (**example**):

```text
added 14 packages, and audited 224 packages in 10s

54 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

If `npm install` seems to sit quietly for quite a while at the end, it's usually running the packages' security check (the audit) against the npm server. Wait until it's done.

- **`@fastify/cookie`** lets Fastify read the `Cookie` header and send `Set-Cookie` headers.
- **`@fastify/jwt`** makes and checks wristbands. Its version is written **exactly**: version 10.2.5 contains a security fix (in earlier versions, a wristband could be issued without `exp`, that is, one that never expires, if the signing function was called with extra settings), so don't use an older one.
- Neither of them brings an install script, so there's nothing to approve as there was for bcrypt.

#### 2.2 How long the wristband and the season pass last: `src/auth/token.ts` (5 minutes)

Right-click the **`backend/src/auth`** folder → **New File…**, name it **`token.ts`**, then type:

```ts
// token.ts - the lifetimes of the "wristband" (access JWT) and the refresh token (Module 20). Refresh token = 32 random
// bytes, NOT a JWT. Its content means nothing; its row in the sessions table gives it meaning. The database only stores
// its SHA-256: a random 256-bit token can't be guessed, so a fast hash is enough (bcrypt is for human-made passwords).
import { createHash, randomBytes } from "node:crypto";

export const ACCESS_AGE_SECONDS = 15 * 60; // access JWT ("concert wristband"): 15 minutes
export const SESSION_AGE_SECONDS = 7 * 24 * 60 * 60; // refresh token ("season pass"): 7 days from login, then log in again

export function makeSessionToken(): string {
  return randomBytes(32).toString("base64url"); // 43 random characters; safe to put in a cookie
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex"); // 64 hexadecimal characters
}
```

- **`ACCESS_AGE_SECONDS`** and **`SESSION_AGE_SECONDS`** are 15 minutes and 7 days, written in seconds.
- **`makeSessionToken()`** makes a season pass: 32 random bytes, exactly as in warm-up step 2.
- **`hashToken()`** makes the SHA-256 fingerprint of that pass, exactly as in warm-up step 1. Concept 7 explains why the fast SHA-256 is enough for a random pass, even though it isn't enough for passwords.

#### 2.3 The safeguards: `src/auth/security.ts` (8 minutes)

Right-click the **`backend/src/auth`** folder → **New File…**, name it **`security.ts`**, then type:

```ts
// security.ts - API protection (Module 20): cookies and JWT ("concert wristband"). The wristband is signed with JWT_SECRET and
// kept in an httpOnly cookie, so JavaScript on the page can't read it.
import type { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { env } from "../config/env.ts";
import type { Role } from "../db/users.ts";
import { ACCESS_AGE_SECONDS, SESSION_AGE_SECONDS } from "./token.ts";

// the content of the "wristband" (access JWT): the account number (sub), its role, and the session number (sid). Not a
// secret: anyone who holds the token can read it, so never put an email, a name, or other personal data here.
export interface TokenPayload {
  sub: string;
  role: Role;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: TokenPayload; // what reply.jwtSign signs
    user: TokenPayload & { iat: number; exp: number }; // what req.jwtVerify reads into req.user
  }
}

export const ACCESS_COOKIE = "access";
export const SESSION_COOKIE = "session";

// httpOnly: JavaScript on the page can't read the cookie (a thief using XSS doesn't get the token).
// sameSite strict: the browser doesn't send the cookie with requests started by another site (CSRF).
// secure auto: the Secure attribute is set when the request comes over HTTPS (Phase 5); on http://127.0.0.1 it isn't.
const BASE = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const ACCESS_OPTIONS = { ...BASE, path: "/", maxAge: ACCESS_AGE_SECONDS }; // path "/" REQUIRED: else only /auth/...
export const SESSION_OPTIONS = { ...BASE, path: "/auth", maxAge: SESSION_AGE_SECONDS }; // only sent to /auth/...

export async function setupSecurity(app: FastifyInstance): Promise<void> {
  await app.register(cookie); // no secret: the JWT is already signed, and refresh tokens are checked in the database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: ACCESS_COOKIE, signed: false },
    sign: { expiresIn: ACCESS_AGE_SECONDS }, // a number = seconds (900); text such as "1h30m" is refused since 10.2.3
    verify: { onlyCookie: true }, // the wristband is only read from the cookie, not from the Authorization header
  });
}
```

- **`TokenPayload`** describes the wristband's payload to TypeScript: `sub`, `role`, and `sid` (Concept 4). The **`declare module "@fastify/jwt"`** block tells TypeScript that the wristbands that library makes and reads have the shape of `TokenPayload`, so that `req.user.role` in Practice 3 isn't treated as a typo.
- **`BASE`** holds the three attributes that are the same for both cookies: `httpOnly`, `sameSite: "strict"`, and `secure: "auto"` (Concept 5). `as const` makes TypeScript remember the exact values, not just "some text".
- **`ACCESS_OPTIONS`** uses `path: "/"`. This part **must be written**: without `path`, a cookie only applies to the address folder where it was made, which is `/auth`, so the wristband would never be brought along to `/devices`. **`SESSION_OPTIONS`** deliberately uses `path: "/auth"`, so that the season pass is only brought along to the booth.
- **`app.register(cookie)`** is called without a secret. Cookies can also be "signed" on their own, but that isn't needed here: the wristband already carries a JWT signature, and the season pass is checked against the database.
- **`app.register(jwt, …)`** gives the JWT library four settings: its stamp (`JWT_SECRET`), the name of the cookie the wristband is kept in, the wristband's lifetime as a **number of seconds** (`900`), and `onlyCookie: true`, which means the wristband is only read from the cookie, not from the `Authorization` header.

#### 2.4 Record a new session: `createSession()` (3 minutes)

Open **`src/db/users.ts`**, then add this at the very bottom:

```ts
// ---- sessions (refresh tokens) ----

export async function createSession(userId: number, tokenHash: string, ageSeconds: number): Promise<number> {
  await pool.query("DELETE FROM sessions WHERE expires_at < now()"); // cleanup: throw away the sessions that have expired
  const result = await pool.query<{ id: string }>(
    `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))
     RETURNING id`, [userId, tokenHash, ageSeconds]);
  return Number(result.rows[0].id); // bigint arrives from pg as text
}
```

- Before recording a new session, this function **throws away the sessions that have expired**, so the `sessions` table doesn't keep growing.
- **`make_interval(secs => $3)`** turns 604,800 seconds into a PostgreSQL time interval, so that `expires_at` is exactly 7 days after the login.
- The `id` column has the type `bigint`, and the `pg` library delivers it as text so that very large numbers aren't cut off. `Number()` turns it back into an ordinary number.

#### 2.5 The login booth: `src/routes/auth.ts` (8 minutes)

Right-click the **`backend/src/routes`** folder → **New File…**, name it **`auth.ts`**, then type:

```ts
// auth.ts - the /auth routes (Module 20): login. The access JWT (15 minutes) and the refresh token (7 days) are sent as httpOnly
// cookies, never in the body of the answer, so JavaScript on the page can't read them.
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ACCESS_COOKIE, SESSION_COOKIE, ACCESS_OPTIONS, SESSION_OPTIONS } from "../auth/security.ts";
import { matchPassword } from "../auth/password.ts";
import { makeSessionToken, hashToken, SESSION_AGE_SECONDS } from "../auth/token.ts";
import { createSession, findForLogin } from "../db/users.ts";
import type { User } from "../db/users.ts";

const ErrorBody = z.object({ message: z.string() });
const Profile = z.object({
  id: z.number(), email: z.string(), name: z.string(), role: z.enum(["admin", "viewer"]),
}).describe("the account that is logged in");
const LoginBody = z.object({
  email: z.email("invalid email").max(254).describe("the account's email, for example budi@home.test"),
  password: z.string().min(1).max(200).describe("the account's password"),
});

const profile = (u: User) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// sign a new access JWT, then put it in the "access" cookie
async function setAccessCookie(reply: FastifyReply, u: User, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(u.id), role: u.role, sid });
  reply.setCookie(ACCESS_COOKIE, token, ACCESS_OPTIONS);
}

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    schema: {
      tags: ["account"],
      summary: "Log in with email and password; the result is two httpOnly cookies (access 15 minutes, session 7 days)",
      body: LoginBody,
      response: {
        200: Profile,
        401: ErrorBody.describe("wrong email or password (deliberately not told apart)"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const account = await findForLogin(email);
      const match = await matchPassword(req.body.password, account?.password_hash); // no account: still computed, false
      if (account === undefined || !match) {
        req.log.warn(`login failed: ${account === undefined ? "email not registered" : `account ${account.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ message: "wrong email or password" });
      }
      const sessionToken = makeSessionToken();
      const sid = await createSession(account.id, hashToken(sessionToken), SESSION_AGE_SECONDS);
      await setAccessCookie(reply, account, sid);
      reply.setCookie(SESSION_COOKIE, sessionToken, SESSION_OPTIONS);
      req.log.info(`login: account ${account.id} (${account.role}), session ${sid}, IP ${req.ip}`);
      return profile(account);
    } catch (error) {
      req.log.error(`login couldn't be processed: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });
};
```

- **`LoginBody`** checks the request content: a valid email and a password that isn't empty. The 15-character rule is deliberately **not** used here. The booth only matches; the password rules are checked when a password is created.
- The email is turned into lowercase, then **`matchPassword()` always runs**, even for an email that isn't registered (`account?.password_hash` is then `undefined`). That way, the answer takes the same time (Concept 3).
- A wrong email and a wrong password get **exactly the same** answer: `401` with `{"message":"wrong email or password"}`. The real reason is only written in the **backend log**, which guests never see.
- If it matches: a season pass is made, its fingerprint is recorded through `createSession()`, the wristband is signed with **`reply.jwtSign()`** and then set with `reply.setCookie()`, and the season pass is set in the second cookie.
- The answer is only the account's profile (`id`, `email`, `name`, `role`). **The tokens are never written in the body of the answer**; they only exist in the `Set-Cookie` headers, so the page's JavaScript never holds them.
- If the database is down, the answer is `503` with a clear message, not a confusing error 500.

#### 2.6 Connect it in `server.ts` (3 minutes)

Open **`src/server.ts`**, then make four small changes.

1. Below the line `import { env } from "./config/env.ts";`, add:

   ```ts
   import { setupSecurity } from "./auth/security.ts";
   import { authRoutes } from "./routes/auth.ts";
   ```

2. Inside the `onResponse` hook, replace its comment line with the following two lines. The code doesn't change; the comment is a reminder of what must **not** go into the log:

   ```ts
     // ...so it's replaced by one line per request (hook = Fastify's "middleware"). Only the method, the address, and the status
     // code: the request content (passwords!) and the cookies (tokens!) are never written to the log.
   ```

3. Right **before** the line `await app.register(swagger, {`, add:

   ```ts
   await setupSecurity(app); // Module 20: cookies and JWT (BEFORE the routes)
   ```

   The safeguards are installed before Swagger and all the routes, because every route needs the cookies and the JWT to be ready.
4. Right **before** the line `await app.register(healthRoutes);`, add:

   ```ts
   await app.register(authRoutes); // Module 20
   ```

Save everything, then check:

```text
npm run check
```

**Expected output:** only two header lines (`> mini-smart-home-backend@0.4.0 check` and `> tsc --noEmit`), with no error message. Then run the backend with `npm run dev`. Its first log lines are the same as in Practice 1.2. From now on, leave the backend running in this terminal (**the first terminal**). A terminal that's running a program can't take other commands, so open **a second terminal** (**Terminal → New Terminal**), then go into the `backend` folder with `cd backend`. In Practices 2–8, `npm run check`, `npm install`, `npm test`, `npm run users`, curl, and `git` are run in this second terminal, unless stated otherwise.

#### 2.7 Try logging in with Bruno (10 minutes)

Passwords must not be written in Bruno's request files, because those `.yml` files go into Git. Bruno can read passwords from a **`.env`** file in its collection folder.

1. In the VS Code Explorer, first click the empty space, then right-click the **`backend/bruno`** folder → **New File…**, name it **`.env`**, then fill it with the passwords of your two accounts:

   ```text
   ADMIN_PASSWORD=your-admin-account-password
   VIEWER_PASSWORD=your-viewer-account-password
   ```

   Replace both values with the passwords you made in Practice 1.7, then save. If your password contains a `#` sign, wrap the value in double quotes (`ADMIN_PASSWORD="…"`), because without quotes, `#` counts as the start of a comment. This file **doesn't go into Git**: `backend/bruno/.gitignore`, which Bruno created in Module 16, already holds the line `.env*`. Bruno picks this file up right away, so you don't need to close Bruno first.
2. In Bruno, open the `backend/bruno` collection and choose the **`local`** environment. Click the **`lamp on`** request in the sidebar so that its tab opens, then right-click that **tab** (in the row of tabs at the top) and choose **Clone Request**, as in Modules 16–19. In the **Clone Request** dialog, fill in **Request Name** with **`login admin`**, then click **Clone**. The new request opens right away in its own tab. (The **Clone** menu in the sidebar immediately makes a copy named `lamp on copy` without a dialog; if that already happened, right-click the copy → **Rename**.)
3. Change its URL to `{{baseUrl}}/auth/login`, then replace the content of the **Body** tab with:

   ```json
   {
     "email": "admin@home.test",
     "password": "{{process.env.ADMIN_PASSWORD}}"
   }
   ```

   Bruno replaces `{{process.env.ADMIN_PASSWORD}}` with the value of `ADMIN_PASSWORD` from `bruno/.env` when the request is sent. What's stored in the `login admin.yml` file is still the text `{{process.env.ADMIN_PASSWORD}}`, not your password.
4. In the **Assert** tab, the line `res.status` `eq` `200` was copied along from `lamp on`. Add a second line: type `res.body.role` in the **Expr** column, leave **Operator** at `equals` (`eq`), then type `admin` in the **Value** column.
5. Save (**Ctrl + S**), then click **Send**.

**Expected output:** the response panel says `200 OK`, and its content is your account's profile:

```json
{"id":1,"email":"admin@home.test","name":"Home Admin","role":"admin"}
```

The **Tests** tab says `Assertions (2), Passed: 2, Failed: 0`. If your laptop is busy, the login answer can take one to two seconds: bcrypt is deliberately slow (Concept 3).

Now open the **Headers** tab in the response panel. There are two `set-cookie` lines (**example**; their contents are cut short):

```text
set-cookie: access=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwic2lkIjoxLCJpYXQiOjE3OTI2Mzg2MTEsImV4cCI6MTc5MjYzOTUxMX0.CaO6abpZ…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
set-cookie: session=LiQc7smW…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict
```

These are the wristband and the season pass from Concept 5, complete with their attributes. There's no token in the body of the answer; both exist only in the `set-cookie` headers. Bruno stores both cookies automatically, just like a browser, and attaches them to every following request to `127.0.0.1`. To see them, click the **Cookies** button (the cookie icon) in the bottom bar of the Bruno window. The window that opens holds a table with the columns **Name**, **Value**, **Path**, **Expires**, **Secure**, **HTTP Only**, and **Actions**: there's `access` with `Path` `/` and `session` with `Path` `/auth`, both marked **HTTP Only**. The **Value** column and the **Headers** tab hold the contents of your cookies that are still valid, and the **Timeline** tab can show the request content with the password already filled in: don't take pictures of those windows when you ask for help in a group.

Also make a request for the `viewer` account. Right-click the **`login admin`** tab → **Clone Request**, fill in **Request Name** with **`login viewer`**, click **Clone**, then change two things: in the **Body** tab, the email becomes `viewer@home.test` and the password becomes `{{process.env.VIEWER_PASSWORD}}`; in the **Assert** tab, the value `admin` becomes `viewer`. Save, then click **Send**. The result is `200 OK` with `"role":"viewer"`. Because the cookies have the same names, the `viewer` wristband now **replaces** the `admin` wristband in Bruno. From now on, the following Bruno requests run as the account that logged in **last**.

#### 2.8 Read what is on your wristband (5 minutes)

A wristband's payload can be read without a key (Concept 4). Prove it with your own wristband. In the **Headers** tab of the `login admin` answer, copy the wristband text from the line `set-cookie: access=…`: from `eyJ` up to **before** the first semicolon. Then, in the second terminal, type this command and paste your wristband at its end, in place of `YOUR-WRISTBAND`:

```text
node -e "const [header, payload] = process.argv[1].split('.'); console.log(Buffer.from(header, 'base64url').toString()); console.log(Buffer.from(payload, 'base64url').toString())" YOUR-WRISTBAND
```

**Expected output** (**example**):

```text
{"alg":"HS256","typ":"JWT"}
{"sub":"1","role":"admin","sid":1,"iat":1792638611,"exp":1792639511}
```

- The first line is the wristband's header: its signature recipe is HS256.
- The second line is its payload: account number `1`, role `admin`, session number `1`. The difference between `exp` and `iat` is exactly 900 seconds, that is, 15 minutes.
- This command is the same as warm-up step 3, just written on one line. `process.argv[1]` is the text you pasted at the end of the command.
- There's no email, name, or password in it. Still, never paste a wristband **that's still valid** in a forum or a group: anyone who holds it can get in as you until it expires.

#### 2.9 A wrong password and an unknown email (5 minutes)

Now see what happens when the password is wrong. Right-click the **`login admin`** tab → **Clone Request**, fill in **Request Name** with **`wrong login`**, click **Clone**, then change two things:

- In the **Body** tab, replace `"{{process.env.ADMIN_PASSWORD}}"` with a password that's clearly wrong, for example `"not the right password"`. This wrong password may be written directly, because it really isn't a secret.
- In the **Assert** tab, change the value of the first line to `401`, then change the second line to `res.body.message` `eq` `wrong email or password`.

Save, then click **Send**.

**Expected output:** `401 Unauthorized` with this content:

```json
{"message":"wrong email or password"}
```

Replace the email in the **Body** tab with an email that isn't registered, for example `nobody@home.test`, then click **Send** again. The answer is **exactly the same**: an attacker can't tell "no such email" from "wrong password". After that, change the email back to `admin@home.test`, then save (**Ctrl + S**). The `wrong login` request is used again in Practice 5.

Only the backend log knows the difference. In the backend terminal (**example**; the author sent a wrong password, an unregistered email, and the right password in turn through curl; these are the first two rounds):

```text
[10:12:58] WARN: login failed: account 1 (IP 127.0.0.1)
[10:12:58] INFO: POST /auth/login -> 401 (650 ms)
[10:12:59] WARN: login failed: email not registered (IP 127.0.0.1)
[10:12:59] INFO: POST /auth/login -> 401 (946 ms)
[10:13:01] INFO: login: account 1 (admin), session 2, IP 127.0.0.1
[10:13:01] INFO: POST /auth/login -> 200 (1115 ms)
[10:13:02] WARN: login failed: account 1 (IP 127.0.0.1)
[10:13:02] INFO: POST /auth/login -> 401 (518 ms)
[10:13:03] WARN: login failed: email not registered (IP 127.0.0.1)
[10:13:03] INFO: POST /auth/login -> 401 (937 ms)
[10:13:04] INFO: login: account 1 (admin), session 3, IP 127.0.0.1
[10:13:04] INFO: POST /auth/login -> 200 (529 ms)
```

- All three kinds of answers take hundreds of milliseconds, because bcrypt always runs. The numbers go up and down with how busy the laptop is, but none of them is much faster. Without the dummy fingerprint from Practice 1.4, the answer for an unregistered email would come within just a few milliseconds.
- Every successful login creates a new session (`session 2`, `session 3`). The log records the account **number** and the IP address, but never the email that was tried, the password, or the cookie contents (Concept 11).
- Run `npm run users -- list` in the second terminal (the `backend` folder): the `active_sessions` column now counts your logins that are still valid.

#### 2.10 (Optional) Logging in from the terminal: curl and PowerShell

Bruno is enough for this module. This part is for you if you want to see the cookies from the terminal. Because they hold a password and cookies, both test files below are **secret**. So that they can't possibly go into Git, first add these three lines (one comment and two patterns) at the very bottom of **`backend/.gitignore`**:

```text
# Module 20 curl test files: they hold passwords and cookies
login*.json
cookies*.txt
```

The `*` sign means "anything", so `login.json`, `login-wrong.json`, and similar files you make later are ignored too.

Then create the file **`login.json`** in the `backend` folder, holding the email and the password of your `admin` account. Every curl and PowerShell command in this part runs in the second terminal, **in the `backend` folder**: in another folder, curl doesn't find `login.json`, and `cookies.txt` gets created outside the reach of `backend/.gitignore`.

```json
{ "email": "admin@home.test", "password": "your-admin-account-password" }
```

**curl** (**Windows:** type `curl.exe`; **macOS:** just `curl`). `-i` shows the response headers, `-c cookies.txt` saves the cookies to the file `cookies.txt`, and `--data-binary "@login.json"` sends that file's content as it is. Reading the JSON from a file is the only way that gives the same result in Windows PowerShell 5.1 and in PowerShell 7; the two treat quotation marks inside a command differently.

```text
curl.exe -i -c cookies.txt -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login
```

**Expected output** (**example**; the cookie contents are cut short):

```text
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: access=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwic2lkIjo3LCJpYXQi…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
set-cookie: session=KjnqnFQF…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict
content-length: 69
Date: Thu, 22 Oct 2026 03:16:08 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"id":1,"email":"admin@home.test","name":"Home Admin","role":"admin"}
```

Open `cookies.txt` in VS Code to see what's in it, but don't share it: it holds your cookies, which are still valid. Its format is "Netscape", which the next curl commands read with `-b cookies.txt` (Practices 4.6 and 6.6). The `#HttpOnly_` prefix marks an `HttpOnly` cookie, and the third column is its `Path`: `/auth` for `session`, `/` for `access`.

**PowerShell** (Windows only; macOS users can just use curl above) has its own "cookie basket". `-SessionVariable session` stores all the cookies of the answer in the variable `$session`, which is used again later with `-WebSession $session`:

```text
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8080/auth/login -ContentType "application/json" -InFile login.json -SessionVariable session
$session.Cookies.GetCookies("http://127.0.0.1:8080/auth") | Format-Table Name, Path, HttpOnly, Expires
```

**Expected output** (**example**; Windows PowerShell 5.1):

```text
id email           name       role
-- -----           ----       ----
 1 admin@home.test Home Admin admin


Name    Path  HttpOnly Expires
----    ----  -------- -------
session /auth     True 10/29/2026 10:24:17 AM
access  /         True 10/22/2026 10:39:17 AM
```

`access` expires in 15 minutes, while `session` expires in 7 days. PowerShell 7 writes the same dates in a different format and time zone. Every login creates a new session, so don't be surprised if `npm run users -- list` now shows several active sessions.

#### 2.11 Save to the branch (2 minutes)

```text
git add package.json package-lock.json .gitignore src/auth src/routes/auth.ts src/db/users.ts src/server.ts "bruno/login admin.yml" "bruno/login viewer.yml" "bruno/wrong login.yml"
git commit -m "Login: POST /auth/login, JWT in an httpOnly cookie, the season pass in the sessions table (Module 20 Practice 2)"
```

`bruno/.env` isn't written in the `git add`. Even if you wrote `git add bruno`, that file still wouldn't go in, because `bruno/.gitignore` ignores it. If you skipped 2.10, `git add` still accepts the unchanged `.gitignore` without any problem.

> ⬆️ **Done with Practice 2?** Go back to [Concept 6](#6-a-guard-at-every-door-the-admin-and-viewer-roles) before Practice 3.

### Practice 3 — A guard at every door: 401 and 403 (50 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal runs `npm run dev`, the second terminal in the `backend` folder for other commands), **Bruno**, and the **browser** for `/docs`. **The device path:** Node 1 is on. **The laptop path:** the Module 19 simulator runs for one device, so that commands from the `admin` account get an `ack`. Run `node device-simulator.js mqtt://127.0.0.1:1883 1` in a terminal of its own, in the `tools` folder, and don't type other commands in that terminal, because the simulator reads every line as a temperature command.
>
> ⭐ **Required** — the first two pass requirements: without a login every endpoint answers **401**, and a `viewer` account fails to turn the relay on (**403**).

The login booth is open, but the other doors are still wide open. This practice posts the **guard** from Concept 6: one `onRequest` hook that checks every request before it reaches any route.

#### 3.1 Post the guard (15 minutes)

Open **`src/auth/security.ts`**, then replace its whole content with:

```ts
// security.ts - API protection (Module 20): cookies, JWT ("concert wristband"), and the "guard" that checks EVERY HTTP
// request: a login (except on the list of open routes), and that viewer accounts only look.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { env } from "../config/env.ts";
import type { Role } from "../db/users.ts";
import { ACCESS_AGE_SECONDS, SESSION_AGE_SECONDS } from "./token.ts";

// the content of the "wristband" (access JWT): the account number (sub), its role, and the session number (sid). Not a
// secret: anyone who holds the token can read it, so never put an email, a name, or other personal data here.
export interface TokenPayload {
  sub: string;
  role: Role;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: TokenPayload; // what reply.jwtSign signs
    user: TokenPayload & { iat: number; exp: number }; // what req.jwtVerify reads into req.user
  }
}

export const ACCESS_COOKIE = "access";
export const SESSION_COOKIE = "session";

// httpOnly: JavaScript on the page can't read the cookie (a thief using XSS doesn't get the token).
// sameSite strict: the browser doesn't send the cookie with requests started by another site (CSRF).
// secure auto: the Secure attribute is set when the request comes over HTTPS (Phase 5); on http://127.0.0.1 it isn't.
const BASE = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const ACCESS_OPTIONS = { ...BASE, path: "/", maxAge: ACCESS_AGE_SECONDS }; // path "/" REQUIRED: else only /auth/...
export const SESSION_OPTIONS = { ...BASE, path: "/auth", maxAge: SESSION_AGE_SECONDS }; // only sent to /auth/...

// Routes you may knock on WITHOUT logging in. Every other route requires a login, including routes added later.
export const OPEN_ROUTES = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: health checkers such as wget --spider (Docker, Phase 5)
]);
const READ_METHODS = new Set(["GET", "HEAD"]); // the only methods a viewer account may use

export async function setupSecurity(app: FastifyInstance): Promise<void> {
  await app.register(cookie); // no secret: the JWT is already signed, and refresh tokens are checked in the database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: ACCESS_COOKIE, signed: false },
    sign: { expiresIn: ACCESS_AGE_SECONDS }, // a number = seconds (900); text such as "1h30m" is refused since 10.2.3
    verify: { onlyCookie: true }, // the wristband is only read from the cookie, not from the Authorization header
  });
  app.addHook("onRequest", guard); // one guard at the front door: it applies to ALL routes
}

async function guard(req: FastifyRequest, reply: FastifyReply) {
  const url = req.routeOptions.url; // the route pattern, such as /devices/:id/command (undefined = none: guests 401, logged in 404)
  if (OPEN_ROUTES.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // an access cookie? a genuine signature? not expired yet? its content goes into req.user
  } catch {
    return reply.code(401).send({ message: "not logged in or session expired: log in with POST /auth/login" });
  }
  if (req.user.role !== "admin" && !READ_METHODS.has(req.method)) { // checked BEFORE the request content is validated
    req.log.warn(`refused (403): account ${req.user.sub} (${req.user.role}) tried ${req.method} ${req.url}`);
    return reply.code(403).send({ message: "viewer accounts can only look; commands and changes are admin-only" });
  }
}
```

What's new compared with Practice 2:

- **`OPEN_ROUTES`** is the list of open doors from Concept 6, kept as a `Set` as in warm-up step 5. Each member is written in the form `METHOD /pattern`. `POST /auth/refresh` and `POST /auth/logout` are already on the list, even though their routes are only created in Practice 4.
- **`READ_METHODS`** holds the two methods a `viewer` account may use: `GET` and `HEAD`.
- **`app.addHook("onRequest", guard)`** posts the guard for **all** routes. Because `setupSecurity()` is called before any route is registered, no route gets skipped.
- **`req.routeOptions.url`** is the route's **pattern**, for example `/devices/:id/command`, not its full address. With that pattern, one line in the list of open doors applies to every `device_id`. For an address that doesn't exist, its value is `undefined`, so the guard still asks for a wristband and answers 401 (Concept 2).
- **`url === "/docs" || url?.startsWith("/docs/")`** opens every documentation page: its HTML page, its JavaScript and CSS files, and `/docs/json`. The slash in `"/docs/"` is written on purpose, so that another route that happens to start with `/docs`, for example `/docssecret`, stays locked.
- **`req.jwtVerify()`** reads the `access` cookie, checks its signature and its `exp`, then puts the wristband's payload in **`req.user`**. Whatever the problem is (no cookie, a fake signature, a stale wristband), the answer is the same single 401 message.
- **The role check** happens **before** Zod checks the request content. Even a `viewer` account that sends a `POST` with messy content gets 403, not 400, so it can't use Zod's error messages to learn the right shape of the content. Refusals are recorded in the log as `WARN`.

#### 3.2 `GET /auth/me`: who is logged in? (5 minutes)

Now there's `req.user`, so the booth can answer the question "who am I logged in as?". Open **`src/db/users.ts`**, then add this function right below the `findForLogin()` function:

```ts
export async function getUser(id: number): Promise<User | undefined> {
  const result = await pool.query<User>(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return result.rows[0];
}
```

Then open **`src/routes/auth.ts`** and replace its whole content with:

```ts
// auth.ts - the /auth routes (Module 20): login and "who am I". The access JWT (15 minutes) and the refresh token (7 days)
// are sent as httpOnly cookies, never in the body of the answer, so JavaScript on the page can't read them.
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ACCESS_COOKIE, SESSION_COOKIE, ACCESS_OPTIONS, SESSION_OPTIONS } from "../auth/security.ts";
import { matchPassword } from "../auth/password.ts";
import { makeSessionToken, hashToken, SESSION_AGE_SECONDS } from "../auth/token.ts";
import { getUser, createSession, findForLogin } from "../db/users.ts";
import type { User } from "../db/users.ts";

const ErrorBody = z.object({ message: z.string() });
const Profile = z.object({
  id: z.number(), email: z.string(), name: z.string(), role: z.enum(["admin", "viewer"]),
}).describe("the account that is logged in");
const LoginBody = z.object({
  email: z.email("invalid email").max(254).describe("the account's email, for example budi@home.test"),
  password: z.string().min(1).max(200).describe("the account's password"),
});

const profile = (u: User) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// sign a new access JWT, then put it in the "access" cookie
async function setAccessCookie(reply: FastifyReply, u: User, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(u.id), role: u.role, sid });
  reply.setCookie(ACCESS_COOKIE, token, ACCESS_OPTIONS);
}

const OPEN = { security: [] }; // Swagger: this route needs no cookie (no padlock)

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Log in with email and password; the result is two httpOnly cookies (access 15 minutes, session 7 days)",
      body: LoginBody,
      response: {
        200: Profile,
        401: ErrorBody.describe("wrong email or password (deliberately not told apart)"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const account = await findForLogin(email);
      const match = await matchPassword(req.body.password, account?.password_hash); // no account: still computed, false
      if (account === undefined || !match) {
        req.log.warn(`login failed: ${account === undefined ? "email not registered" : `account ${account.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ message: "wrong email or password" });
      }
      const sessionToken = makeSessionToken();
      const sid = await createSession(account.id, hashToken(sessionToken), SESSION_AGE_SECONDS);
      await setAccessCookie(reply, account, sid);
      reply.setCookie(SESSION_COOKIE, sessionToken, SESSION_OPTIONS);
      req.log.info(`login: account ${account.id} (${account.role}), session ${sid}, IP ${req.ip}`);
      return profile(account);
    } catch (error) {
      req.log.error(`login couldn't be processed: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.get("/auth/me", {
    schema: {
      tags: ["account"],
      summary: "Who is logged in (read from the database, not from the content of the JWT)",
      response: { 200: Profile, 401: ErrorBody.describe("not logged in, or the account has been deleted") },
    },
  }, async (req, reply) => {
    const account = await getUser(Number(req.user.sub)); // req.user is filled in by the guard from a valid wristband
    if (account === undefined) return reply.code(401).send({ message: "this account no longer exists" });
    return profile(account);
  });
};
```

- **`GET /auth/me`** isn't one of the open doors, so the guard has already checked the wristband before this route runs. The account number is taken from `req.user.sub`.
- The profile is read from the **database**, not from the wristband's payload. If the account has been deleted, the answer is 401 even though the wristband is still valid.
- **`OPEN`** (`security: []`) marks `POST /auth/login` as a route without a padlock in `/docs` (3.3).

#### 3.3 Padlocks in `/docs` (5 minutes)

Swagger UI can mark which routes need a login with a padlock icon. Open **`src/server.ts`**, then replace the `openapi: { … }` block inside `app.register(swagger, { … })` with:

```ts
  openapi: {
    info: { title: "Mini Smart Home API", description: "Backend v0.4 (Module 19)", version: "0.4.0" },
    components: {
      securitySchemes: { // Module 20: routes with a padlock need the access cookie from POST /auth/login
        accessCookie: { type: "apiKey", in: "cookie", name: "access", description: "access JWT (httpOnly) from POST /auth/login" },
      },
    },
    security: [{ accessCookie: [] }], // default: every route has a padlock; open routes write security: []
  },
```

- **`securitySchemes.accessCookie`** tells Swagger that the routes are locked with a cookie named `access`.
- **`security: [{ accessCookie: [] }]`** means **every** route has a padlock, in line with the locked-by-default principle. An open route writes `security: []` itself.

The `/auth/login` route already got `security: []` through `OPEN` in 3.2. Only `/health` is left. Open **`src/routes/health.ts`**, then add one line right below `tags: ["server"],`:

```ts
      security: [], // Module 20: stays open without a login (monitors and the Docker healthcheck can't log in)
```

Also change the comment on the `await setupSecurity(app);` line in `server.ts`, so that it matches what it does now:

```ts
await setupSecurity(app); // Module 20: cookies, JWT, and the guard on every request (BEFORE the routes)
```

Save everything, then run `npm run check` (no error messages). If `npm run dev` is still running, the backend has already restarted by itself.

#### 3.4 ⭐ Without logging in: every door answers 401 (10 minutes)

Bruno still holds the wristband from Practice 2. To test as a guest without a login, first delete its cookies: click the **Cookies** button (the cookie icon) in Bruno's bottom bar. In the title row of the `127.0.0.1` domain, click the trash can icon, then **Clear All** in the `Clear Domain Cookies` window. (You can also do it one by one: the trash can icon in the **Actions** column of each row, then **Delete**.) Then send the old requests from Modules 16–19 one by one. Don't send `login admin` or `login viewer` yet, because both of them set cookies again.

**Expected output:** `health` still gets `200 OK`, while every other request gets **`401 Unauthorized`** with this content:

```json
{"message":"not logged in or session expired: log in with POST /auth/login"}
```

The **Tests** tab of those old requests is now red (`expected 401 to equal 200`), because their Asserts still expect 200. That's normal: guests really aren't allowed in.

The author also knocked on **every** door of the backend with `curl.exe`, without cookies. The full results:

| Request | The answer without a login |
| :--- | :--- |
| `GET /health`, `HEAD /health` | **200** (an open door) |
| `GET /devices`, `HEAD /devices` | **401** |
| `GET /devices/{id}/latest`, `…/vitals`, `…/readings`, `…/state` | **401** |
| `POST /devices/{id}/command` | **401** |
| `GET /rules`, `POST /rules`, `PUT /rules/1`, `POST /rules/2/run` | **401** |
| `GET /auth/me` | **401** |
| `POST /auth/refresh`, `POST /auth/logout` | **401** (their routes are only created in Practice 4, so for now they're the same as an address that doesn't exist) |
| `GET /not-here` | **401**, not 404 |
| `POST /auth/login` without content | **400** (an open door, but the content isn't valid) |
| `GET /docs`, `GET /docs/json` | **200** (open doors) |
| `GET /socket.io/?EIO=4&transport=polling` | **200** — the hall door is still open! Socket.IO is locked in Practice 7 (Concept 10). |

That's the **first pass requirement**: without a login, every endpoint answers 401, except the doors that are opened on purpose for a clear reason.

#### 3.5 ⭐ The `viewer` account: 403 (10 minutes)

Send **`login viewer`**, then make a new request for the "who am i" booth: open the **`device list`** tab, right-click that tab → **Clone Request**, fill in **Request Name** with **`who am i`**, click **Clone**, change its URL to `{{baseUrl}}/auth/me`, save, then click **Send**. Then send `device list`, `lamp on`, `change fan threshold`, and `run watering schedule`.

**Expected output:**

| Request | Answer | Content |
| :--- | :--- | :--- |
| `login viewer` | **200** | `{"id":2,"email":"viewer@home.test","name":"Home Guest","role":"viewer"}` |
| `who am i` | **200** | the same profile |
| `device list` | **200** | your list of devices |
| `lamp on` | **403** | `{"message":"viewer accounts can only look; commands and changes are admin-only"}` |
| `change fan threshold` | **403** | the same message |
| `run watering schedule` | **403** | the same message |

The lamp relay doesn't "click", and the command is never even sent to the broker. The backend log records every refusal (**example**):

```text
[10:38:10] INFO: login: account 2 (viewer), session 11, IP 127.0.0.1
[10:38:10] INFO: POST /auth/login -> 200 (665 ms)
[10:38:10] INFO: GET /auth/me -> 200 (14 ms)
[10:38:11] INFO: GET /devices -> 200 (4 ms)
[10:38:11] WARN: refused (403): account 2 (viewer) tried POST /devices/a4cf12e5b7c0/command
[10:38:11] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
[10:38:11] WARN: refused (403): account 2 (viewer) tried PUT /rules/1
[10:38:11] INFO: PUT /rules/1 -> 403 (1 ms)
[10:38:11] WARN: refused (403): account 2 (viewer) tried POST /rules/2/run
[10:38:11] INFO: POST /rules/2/run -> 403 (1 ms)
```

A refusal only takes 1 millisecond, because the guard stops before the database or the broker is touched. The **Tests** tab of those three requests is red (`expected 403 to equal 200`): their Asserts were made for the `admin` account, and the red is actually proof that the guard works.

That's the **second pass requirement**: a `viewer` account fails to turn the relay on, with **HTTP 403**.

#### 3.6 The `admin` account is still allowed (5 minutes)

Send **`login admin`**, then `lamp on` and `Node 1 actuator state`. The `admin` wristband replaces the `viewer` wristband in Bruno.

**Expected output** (**example**; the laptop path uses `f00d00000001`, so its `state` may be different):

```json
{"id":"c-20261022-033915-2","wait_ms":16,"ack":{"id":"c-20261022-033915-2","ts":"2026-10-22T03:39:15Z","ok":true,"state":{"fan":false,"lamp":true,"pump":false,"curtain":90}}}
```

The lamp relay "clicks" as usual, and `Node 1 actuator state` shows `"desired":{"lamp":true}` with `"diff":[]`. Every Module 19 feature still works for an account with the right role. Finish with `lamp off`.

#### 3.7 Padlocks in `/docs` and logging in through the browser (5 minutes)

Open `http://127.0.0.1:8080/docs` in the browser. Remember: always `127.0.0.1`, not `localhost`.

![Screenshot of Swagger UI on the author's backend after the guard is in place, Practice 3.7; the backend version in the title is still 0.4.0 and is only raised in Practice 8; the author's lab port 18203, on your laptop 8080. Left: the /docs page titled Mini Smart Home API with the Authorize button marked 3 at the top right, then the groups account, server, and devices. The rows POST /auth/login and GET /health, both marked 2, have no padlock, while GET /auth/me and all the device routes, such as GET /devices, POST /devices/{id}/command, and GET /devices/{id}/state, have a small padlock icon on the right; the padlock in the GET /auth/me row is marked 1. Top right: the Try it out answer of POST /auth/login, code 200 with the content id 1, email admin@home.test, name Home Admin, role admin; the Response headers box marked 4 only holds connection, content-length, content-type, date, and keep-alive, with no set-cookie. Bottom right: Try it out of GET /devices; the Curl box marked 5 holds curl -X GET to http://127.0.0.1:18203/devices with only the accept header, without a cookie; the response code 200 marked 6, with a list of one device, a4cf12e5b7c0, kind node1, status online. The legend below the route list: 1 padlock, this route needs the access cookie, the global security in server.ts; 2 no padlock, two open doors, POST /auth/login and GET /health; 3 Authorize isn't used, the browser carries the cookie by itself; 4 login through Try it out, 200, the browser doesn't show the set-cookie header; 5 the Curl box has no cookie, copied into a terminal it gets 401; 6 GET /devices after logging in, 200, the browser attaches the access cookie.](assets/swagger-padlocks.png)

1. The locked routes now have padlocks (**1**), except the two open doors: `POST /auth/login` and `GET /health` (**2**). The **Authorize** button (**3**) appears because of the new security scheme, but it **isn't used**: that button is for keys you type in yourself, while the cookie is carried by the browser automatically.
2. Open `POST /auth/login`, click **Try it out**, replace the example content with your account's email and password (while that password is still written there, don't take a screenshot or share your screen; how to delete it is in the last item of this list), then click **Execute**. The answer is `200` with the account's profile. Notice that **Response headers** (**4**) doesn't contain `set-cookie`: the browser hides that header from the page's JavaScript, including from Swagger UI. The cookie is still stored in the browser.
3. Open `GET /devices`, click **Try it out**, then **Execute**. The answer is `200` (**6**), because the browser attaches the `access` cookie automatically. The **Curl** box (**5**) doesn't contain the cookie at all: if that command is copied into a terminal, the answer is 401.
4. Delete the password in the **Try it out** box of `POST /auth/login` before you take a screenshot or share your screen: Swagger UI shows your password as it is in the request content box **and** in its **Curl** box.

#### 3.8 Save to the branch (2 minutes)

```text
git add src/auth/security.ts src/db/users.ts src/routes/auth.ts src/routes/health.ts src/server.ts "bruno/who am i.yml"
git commit -m "The guard: 401 without a login, viewer accounts only look (403), padlocks in /docs (Module 20 Practice 3)"
```

> ⬆️ **Done with Practice 3?** Go back to [Concept 7](#7-refresh-tokens-and-logout-a-season-pass-at-the-ticket-booth) before Practice 4.

### Practice 4 — Refresh and logout (50 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal runs `npm run dev`, the second terminal in the `backend` folder for other commands), **Bruno**, and **psql** (in the second terminal). Part 4.6 uses **curl** (optional).

The wristband is now used at every door, but it only lasts 15 minutes, and the booth has no way yet to replace it without a new login. This practice opens the two new booths from Concept 7: **`POST /auth/refresh`** (exchange the season pass for a new wristband, rotating the pass along the way) and **`POST /auth/logout`** (revoke the session). Both have been on the list of open doors since Practice 3.

#### 4.1 The old pass and the 30-second grace period: `src/auth/token.ts` (5 minutes)

Open **`src/auth/token.ts`**, then replace its whole content with:

```ts
// token.ts - the lifetimes of the "wristband" (access JWT) and the refresh token (Module 20). Refresh token = 32 random
// bytes, NOT a JWT. Its content means nothing; its row in the sessions table gives it meaning. The database only stores
// its SHA-256: a random 256-bit token can't be guessed, so a fast hash is enough (bcrypt is for human-made passwords).
import { createHash, randomBytes } from "node:crypto";

export const ACCESS_AGE_SECONDS = 15 * 60; // access JWT ("concert wristband"): 15 minutes
export const SESSION_AGE_SECONDS = 7 * 24 * 60 * 60; // refresh token ("season pass"): 7 days from login, then log in again
export const GRACE_MS = 30_000; // a token that was just replaced may be used again for 30 seconds (two requests at once)

export function makeSessionToken(): string {
  return randomBytes(32).toString("base64url"); // 43 random characters; safe to put in a cookie
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex"); // 64 hexadecimal characters
}

// What to do with a refresh token that matches NO token_hash, but matches the previous_token_hash of a session?
// (pure logic, tested by Vitest)
// - replaced less than GRACE_MS ago: another request from the same browser happened to refresh first
//   (for example two tabs) -> just give it a new access JWT, the session stays;
// - 30 seconds or more: an old token is used again, probably stolen -> revoke its session.
export function judgeOldToken(updatedAt: Date, now: number): "grace" | "stolen" {
  return now - updatedAt.getTime() < GRACE_MS ? "grace" : "stolen";
}
```

- **`GRACE_MS`** is the 30 seconds from Concept 7.
- **`judgeOldToken()`** is a **pure function**, like the Module 19 rules brain: the clock is passed in as a number, so it can be tested without really waiting 30 seconds. An old pass that shows up again **less than** 30 seconds after it was replaced counts as `"grace"`; anything later counts as `"stolen"`.

#### 4.2 Rotate, find, and delete sessions: `src/db/users.ts` (5 minutes)

Open **`src/db/users.ts`**, then add these four functions at the very bottom, below `createSession()`:

```ts
// Rotation: swap the old token for a new token in ONE UPDATE statement. If two requests bring the same token at the same
// time, only one wins; the other no longer finds the row.
export async function rotateSession(oldHash: string, newHash: string):
  Promise<{ id: number; user_id: number; expires_at: Date } | undefined> {
  const result = await pool.query<{ id: string; user_id: number; expires_at: Date }>(
    `UPDATE sessions SET previous_token_hash = token_hash, token_hash = $2, updated_at = now()
     WHERE token_hash = $1 AND expires_at > now()
     RETURNING id, user_id, expires_at`, [oldHash, newHash]);
  const row = result.rows[0];
  return row === undefined ? undefined : { ...row, id: Number(row.id) };
}

// A token that was already replaced (previous_token_hash) used again?
export async function findSessionByOldToken(hash: string): Promise<{ id: number; user_id: number; updated_at: Date } | undefined> {
  const result = await pool.query<{ id: string; user_id: number; updated_at: Date }>(
    "SELECT id, user_id, updated_at FROM sessions WHERE previous_token_hash = $1 AND expires_at > now()", [hash]);
  const row = result.rows[0];
  return row === undefined ? undefined : { ...row, id: Number(row.id) };
}

export async function deleteSession(id: number): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
}

// Logout: delete the session whose current token matches. The result is the number of the deleted session.
export async function deleteSessionByToken(hash: string): Promise<number | undefined> {
  const result = await pool.query<{ id: string }>("DELETE FROM sessions WHERE token_hash = $1 RETURNING id", [hash]);
  return result.rows[0] === undefined ? undefined : Number(result.rows[0].id);
}
```

- **`rotateSession()`** is the heart of rotation: **one** `UPDATE` statement moves the fingerprint of the current pass to `previous_token_hash`, writes the fingerprint of the new pass, and records the time. Because it all happens in one statement, two requests at the same time that bring the same pass can't both win: the second one no longer finds the row, and falls through to the old-pass check.
- **`findSessionByOldToken()`** looks for a session whose **previous** pass matches, to detect an old pass that's used again.
- **`deleteSession()`** and **`deleteSessionByToken()`** revoke a session. The second one is used by logout and gives back the session's number.

#### 4.3 The refresh and logout booths: `src/routes/auth.ts` (10 minutes)

Open **`src/routes/auth.ts`**, then replace its whole content with:

```ts
// auth.ts - the /auth routes (Module 20): login, refresh, logout, and "who am I". The access JWT (15 minutes) and the refresh
// token (7 days) are sent as httpOnly cookies, never in the body of the answer, so JavaScript on the page can't read them.
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ACCESS_COOKIE, SESSION_COOKIE, ACCESS_OPTIONS, SESSION_OPTIONS } from "../auth/security.ts";
import { matchPassword } from "../auth/password.ts";
import { makeSessionToken, hashToken, judgeOldToken, SESSION_AGE_SECONDS } from "../auth/token.ts";
import {
  getUser, createSession, findSessionByOldToken, findForLogin, deleteSession, deleteSessionByToken, rotateSession,
} from "../db/users.ts";
import type { User } from "../db/users.ts";

const ErrorBody = z.object({ message: z.string() });
const Profile = z.object({
  id: z.number(), email: z.string(), name: z.string(), role: z.enum(["admin", "viewer"]),
}).describe("the account that is logged in");
const LoginBody = z.object({
  email: z.email("invalid email").max(254).describe("the account's email, for example budi@home.test"),
  password: z.string().min(1).max(200).describe("the account's password"),
});

const profile = (u: User) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// sign a new access JWT, then put it in the "access" cookie
async function setAccessCookie(reply: FastifyReply, u: User, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(u.id), role: u.role, sid });
  reply.setCookie(ACCESS_COOKIE, token, ACCESS_OPTIONS);
}

// empty both cookies (the same attributes as when they were set; clearCookie itself fills in Max-Age=0)
function clearCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_COOKIE, ACCESS_OPTIONS).clearCookie(SESSION_COOKIE, SESSION_OPTIONS);
}

const OPEN = { security: [] }; // Swagger: this route needs no cookie (no padlock)

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Log in with email and password; the result is two httpOnly cookies (access 15 minutes, session 7 days)",
      body: LoginBody,
      response: {
        200: Profile,
        401: ErrorBody.describe("wrong email or password (deliberately not told apart)"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const account = await findForLogin(email);
      const match = await matchPassword(req.body.password, account?.password_hash); // no account: still computed, false
      if (account === undefined || !match) {
        req.log.warn(`login failed: ${account === undefined ? "email not registered" : `account ${account.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ message: "wrong email or password" });
      }
      const sessionToken = makeSessionToken();
      const sid = await createSession(account.id, hashToken(sessionToken), SESSION_AGE_SECONDS);
      await setAccessCookie(reply, account, sid);
      reply.setCookie(SESSION_COOKIE, sessionToken, SESSION_OPTIONS);
      req.log.info(`login: account ${account.id} (${account.role}), session ${sid}, IP ${req.ip}`);
      return profile(account);
    } catch (error) {
      req.log.error(`login couldn't be processed: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.post("/auth/refresh", {
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Swap the session cookie for a new access JWT (the session cookie is replaced too: rotation)",
      response: {
        200: Profile,
        401: ErrorBody.describe("no session cookie, or it expired, was logged out, or was revoked: log in again"),
      },
    },
  }, async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token === undefined || token === "") return reply.code(401).send({ message: "not logged in: no session cookie" });
    const hash = hashToken(token);
    const newToken = makeSessionToken();
    const session = await rotateSession(hash, hashToken(newToken));
    if (session !== undefined) {
      const account = await getUser(session.user_id); // the role is read again from the database: role changes apply here
      if (account !== undefined) {
        reply.setCookie(SESSION_COOKIE, newToken,
          { ...SESSION_OPTIONS, maxAge: Math.floor((session.expires_at.getTime() - Date.now()) / 1000) }); // the time left
        await setAccessCookie(reply, account, session.id);
        return profile(account);
      }
    } else {
      const old = await findSessionByOldToken(hash);
      if (old !== undefined && judgeOldToken(old.updated_at, Date.now()) === "grace") {
        const account = await getUser(old.user_id); // requests at the same time: a new wristband is enough, the session stays
        if (account !== undefined) {
          await setAccessCookie(reply, account, old.id);
          return profile(account);
        }
      } else if (old !== undefined) {
        await deleteSession(old.id);
        req.log.warn(`old refresh token of session ${old.id} (account ${old.user_id}) used again: session revoked (IP ${req.ip})`);
      }
    }
    clearCookies(reply);
    return reply.code(401).send({ message: "session no longer valid: please log in again" });
  });

  app.post("/auth/logout", {
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Log out: the session in the database is deleted and both cookies are emptied",
      response: { 200: ErrorBody.describe("always succeeds, also when you aren't logged in at all") },
    },
  }, async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    let sid = token ? await deleteSessionByToken(hashToken(token)) : undefined;
    if (sid === undefined) { // no session cookie came along? try the session number of a still-valid access wristband
      try {
        await req.jwtVerify(); // the wristband's content goes into req.user
        sid = req.user.sid;
        await deleteSession(sid);
      } catch { /* not logged in: there is nothing to delete */ }
    }
    if (sid !== undefined) req.log.info(`logout: session ${sid}`);
    clearCookies(reply);
    return { message: "logged out" };
  });

  app.get("/auth/me", {
    schema: {
      tags: ["account"],
      summary: "Who is logged in (read from the database, not from the content of the JWT)",
      response: { 200: Profile, 401: ErrorBody.describe("not logged in, or the account has been deleted") },
    },
  }, async (req, reply) => {
    const account = await getUser(Number(req.user.sub)); // req.user is filled in by the guard from a valid wristband
    if (account === undefined) return reply.code(401).send({ message: "this account no longer exists" });
    return profile(account);
  });
};
```

- **`clearCookies()`** empties both cookies with the same attributes as when they were set. A cookie can only be deleted if its name and its `Path` match.
- **`POST /auth/refresh`** reads the season pass from the `session` cookie, then tries to rotate it with `rotateSession()`. If that works, the account is read **again** from the database (role changes take effect here), the new pass is set with the **remaining** lifetime of its session, and a new wristband is signed.
- If that pass doesn't match any valid pass, the booth checks whether it's the **old pass** of a session. Less than 30 seconds since it was replaced: just hand out a new wristband (the grace period). Exactly 30 seconds or more: the session is revoked, and the log writes a `WARN`. The two other possibilities, a pass that isn't known at all or a session that has already expired, end the same way: both cookies are emptied, and the answer is 401 `session no longer valid: please log in again`.
- **`POST /auth/logout`** deletes the session based on its season pass. If the `session` cookie didn't come along (for example because of its `Path`), the booth uses the session number (`sid`) from a wristband that's still valid. Whatever happens, both cookies are emptied and the answer is 200.
- Both new routes use `...OPEN`, so they show up without a padlock in `/docs`, just like `POST /auth/login`.

#### 4.4 Season pass tests (5 minutes)

Open **`src/auth/auth.test.ts`**, then replace its whole content with:

```ts
// auth.test.ts - unit tests of the login logic (Module 20): password rules, bcrypt fingerprints, refresh tokens, old tokens.
// No database and no server. Run: npm test
import { describe, expect, it } from "vitest";
import { Password, makeFingerprint, matchPassword } from "./password.ts";
import { GRACE_MS, makeSessionToken, hashToken, judgeOldToken } from "./token.ts";

describe("password rules (Password)", () => {
  it("14 characters refused, 15 characters accepted", () => {
    expect(Password.safeParse("a".repeat(14)).success).toBe(false);
    expect(Password.safeParse("a b c d e f g h").success).toBe(true); // exactly 15 characters: spaces count too
  });
  it("more than 72 bytes refused: bcrypt would silently cut them", () => {
    expect(Password.safeParse("a".repeat(72)).success).toBe(true);
    expect(Password.safeParse("a".repeat(73)).success).toBe(false);
    expect(Password.safeParse("😀".repeat(19)).success).toBe(false); // 19 emoji = 38 JavaScript characters, but 76 bytes
  });
});

// bcrypt is slow on purpose (about 0.3 seconds per hash on an i5 laptop, >1 second on a busy or slow laptop), so the time
// limit of these tests is raised from Vitest's default 5 seconds to 30 seconds.
const SLOW = 30_000;

describe("password fingerprint (bcrypt)", () => {
  it("the right password matches, a wrong one doesn't, and the fingerprint always differs (random salt)", async () => {
    const one = await makeFingerprint("a password just for this test");
    const two = await makeFingerprint("a password just for this test");
    expect(one).toMatch(/^\$2b\$12\$.{53}$/);
    expect(one).not.toBe(two);
    expect(await matchPassword("a password just for this test", one)).toBe(true);
    expect(await matchPassword("a password just for that test", one)).toBe(false);
  }, SLOW);
  it("no such account (empty fingerprint): the result is false, not an error", async () => {
    expect(await matchPassword("anything", undefined)).toBe(false);
    expect(await matchPassword("anything", null)).toBe(false);
  }, SLOW);
});

describe("refresh token", () => {
  it("43 base64url characters, never the same", () => {
    const a = makeSessionToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(makeSessionToken()).not.toBe(a);
  });
  it("the SHA-256 hash is always the same for the same token (so it can be looked up in the database)", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashToken("abd")).not.toBe(hashToken("abc"));
  });
  it("old token used again: within 30 seconds = grace, after that = stolen", () => {
    const replaced = new Date("2026-10-22T06:00:00+07:00");
    expect(judgeOldToken(replaced, replaced.getTime() + 5_000)).toBe("grace");
    expect(judgeOldToken(replaced, replaced.getTime() + GRACE_MS)).toBe("stolen");
    expect(judgeOldToken(replaced, replaced.getTime() + 60 * 60_000)).toBe("stolen");
  });
});
```

There are three new tests in the `refresh token` group:

- A season pass is always 43 base64url characters, and two passes are never the same.
- The SHA-256 of the same text is always the same. The value `ba7816bf…` is the official SHA-256 fingerprint of the text `abc`, which many books and standards use to test SHA-256.
- An old pass that shows up again 5 seconds after it was replaced counts as grace, while **exactly** 30 seconds or one hour later counts as stolen.

Run all the tests with their full list:

```text
npm test -- --reporter=tree
```

**Expected output** (**example**, shortened; the number of milliseconds will be different):

```text
 ✓ src/rules/engine.test.ts (11 tests) 29ms
   ✓ fan rule (evaluateThreshold) (8)
     …
   ✓ Telegram alerts (shouldNotify) (1)
     …
   ✓ rule schema (Zod) (2)
     …
 ✓ src/auth/auth.test.ts (7 tests) 2437ms
   ✓ password rules (Password) (2)
     ✓ 14 characters refused, 15 characters accepted 6ms
     ✓ more than 72 bytes refused: bcrypt would silently cut them 1ms
   ✓ password fingerprint (bcrypt) (2)
     ✓ the right password matches, a wrong one doesn't, and the fingerprint always differs (random salt) 1623ms
     ✓ no such account (empty fingerprint): the result is false, not an error 799ms
   ✓ refresh token (3)
     ✓ 43 base64url characters, never the same 2ms
     ✓ the SHA-256 hash is always the same for the same token (so it can be looked up in the database) 1ms
     ✓ old token used again: within 30 seconds = grace, after that = stolen 1ms

 Test Files  2 passed (2)
      Tests  18 passed (18)
```

The `--` after `npm test` passes `--reporter=tree` on to Vitest (the same as `npm run users -- …`), and the `tree` reporter writes out every test, including the fast ones. The `…` lines above are the 11 tests of the Module 19 rules brain that you already know. In total, **18 tests pass**: 11 from Module 19 and 7 from this module.

To see what a boundary test is good for, briefly change one sign in `judgeOldToken()`: replace `<` with `<=`, save, then run `npm test` again.

**Expected output** (**example**, shortened; the separator lines are shortened, and the number of milliseconds will be different):

```text
 ✓ src/rules/engine.test.ts (11 tests) 209ms
 ❯ src/auth/auth.test.ts (7 tests | 1 failed) 5319ms
   ✓ password rules (Password) (2)
     ✓ 14 characters refused, 15 characters accepted 99ms
     ✓ more than 72 bytes refused: bcrypt would silently cut them 19ms
   ✓ password fingerprint (bcrypt) (2)
     ✓ the right password matches, a wrong one doesn't, and the fingerprint always differs (random salt) 3624ms
     ✓ no such account (empty fingerprint): the result is false, not an error 1392ms
   ❯ refresh token (3)
     ✓ 43 base64url characters, never the same 27ms
     ✓ the SHA-256 hash is always the same for the same token (so it can be looked up in the database) 31ms
     × old token used again: within 30 seconds = grace, after that = stolen 102ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/auth/auth.test.ts > refresh token > old token used again: within 30 seconds = grace, after that = stolen
AssertionError: expected 'grace' to be 'stolen' // Object.is equality

Expected: "stolen"
Received: "grace"

 ❯ src/auth/auth.test.ts:51:68
     49|     const replaced = new Date("2026-10-22T06:00:00+07:00");
     50|     expect(judgeOldToken(replaced, replaced.getTime() + 5_000)).toBe("grace");
     51|     expect(judgeOldToken(replaced, replaced.getTime() + GRACE_MS)).toBe("stolen");
       |                                                                    ^
     52|     expect(judgeOldToken(replaced, replaced.getTime() + 60 * 60_000)).toBe("stolen");
     53|   });

 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 17 passed (18)
```

That test checks **exactly** second 30. With `<=`, a pass used again exactly 30 seconds later still counts as grace, even though the rule says "less than 30 seconds". Vitest points to the line (`auth.test.ts:51`), the expected value (`"stolen"`), and the value it got (`"grace"`). Change `<=` back to `<`, then make sure `npm test` says `Tests  18 passed (18)` again.

#### 4.5 Try it in Bruno: `refresh` and `logout` (10 minutes)

Make two new requests in Bruno with **Clone Request** (right-click the tab of an old request → **Clone Request** → fill in **Request Name** → **Clone**), as in Module 19:

| New request | Cloned from | Change to |
| :--- | :--- | :--- |
| `refresh` | `login admin` | URL `{{baseUrl}}/auth/refresh`; the **Body** tab changed to **No Body**; in the **Assert** tab, delete the `res.body.role` line (`res.status` `eq` `200` is enough) |
| `logout` | `refresh` | URL `{{baseUrl}}/auth/logout`; in the **Assert** tab, add `res.body.message` `eq` `logged out` |

Save both. Then send them in order: `login admin`, `refresh`, `who am i`, `logout`, and `device list`.

**Expected output:**

| Request | Answer |
| :--- | :--- |
| `login admin` | **200**, two new cookies |
| `refresh` | **200**, the `admin` profile; the **Headers** tab holds two **new** `set-cookie` lines: the season pass has been replaced |
| `who am i` | **200** with the new wristband |
| `logout` | **200** `{"message":"logged out"}` |
| `device list` | **401**: the wristband and the season pass have been thrown away |

To see the rotation in the database, send `login admin` and `refresh` once more, then open psql in the second terminal as in Practice 1.8 (`docker exec -it smarthome-db psql -U postgres -d smarthome`) and run:

```sql
SELECT id, user_id, left(token_hash, 12) AS token_hash, left(previous_token_hash, 12) AS previous_token_hash,
       date_trunc('second', now() - created_at) AS since_login,
       date_trunc('second', expires_at - now()) AS time_left
FROM sessions ORDER BY id DESC LIMIT 3;
```

The top row has a filled-in `previous_token_hash`: the fingerprint of the pass from before the refresh. `time_left` is close to `6 days 23:59`, and keeps shrinking until the 7 days are up. Leave psql with `\q` before you continue: the second terminal is used again for curl (4.6), PowerShell (4.7), and `git` (4.9).

#### 4.6 (Optional) An old pass used again

Bruno always uses the **newest** season pass it has stored, so an old pass is hard to use again from Bruno. With curl, you can write the old pass into the `Cookie` header yourself. If you created `login.json` in Practice 2.10, run these steps in the second terminal, in the `backend` folder (macOS: `curl`, not `curl.exe`); if not, just read the author's results below. Step 3 has to be done within 30 seconds after step 2. The easiest way: type the command of step 2, then `;`, then the command of step 3 with T0 already filled in, all on one line, and only then press **Enter** once; the two commands run one after the other. The answer of step 3 continues right on the same line as the end of step 2's answer (`…"role":"admin"}HTTP/1.1 200 OK`), because the backend's answer body doesn't end with a new line.

1. Log in and save its cookies: `curl.exe -i -c cookies.txt -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login`. Write down the content of the `session` cookie from the line `set-cookie: session=…` (up to before the semicolon). Let's call that pass **T0**.
2. Refresh with that pass, and save the new pass to the same file: `curl.exe -i -b cookies.txt -c cookies.txt -X POST http://127.0.0.1:8080/auth/refresh`.
3. **Within 30 seconds**, use T0 once more: `curl.exe -i -X POST http://127.0.0.1:8080/auth/refresh -H "Cookie: session=T0"` (replace `T0` with the pass you wrote down).
4. Wait **more than 30 seconds**, then run the command of step 3 **only** once more, by typing or pasting it again. Don't call up the combined line from before with **↑**. That line would run step 2 again too, so your season pass would be rotated once more. As a result, T0 wouldn't be recognized at all, the session wouldn't be revoked, and the result wouldn't match the table below.
5. Try to refresh with the valid pass (the one stored in `cookies.txt`): run the command of step 2 again, only step 2.

**Expected output** on the author's laptop (**example**; the cookie contents are cut short):

| Step | Answer | What the `sessions` table holds afterwards |
| :--- | :--- | :--- |
| 1. login | **200**, two `set-cookie` lines (the wristband and pass T0) | session row `18`, `token_hash` `ba1af888b290…`, `previous_token_hash` empty |
| 2. refresh with T0 | **200**, two new `set-cookie` lines: `session=mL3MgSB8…; Max-Age=604784` and a new wristband | `token_hash` `b542afb2cf6b…`, `previous_token_hash` `ba1af888b290…` (rotation) |
| 3. T0 again, 2 seconds later | **200**, only a new wristband (the grace period) | unchanged |
| 4. T0 again, 40 seconds later | **401** `{"message":"session no longer valid: please log in again"}`, two emptying `set-cookie` lines | **the row is gone**: the session is revoked |
| 5. the valid pass (T1) | **401**, the same message | no row |

Notice `Max-Age=604784` in step 2: the new pass doesn't get a full 7 days, but the **time its session has left**. The absolute lifetime of 7 days counts from the login and isn't extended by a refresh.

The backend log records what happened (**example**):

```text
[11:01:08] INFO: login: account 1 (admin), session 18, IP 127.0.0.1
[11:01:08] INFO: POST /auth/login -> 200 (1075 ms)
[11:01:23] INFO: POST /auth/refresh -> 200 (13 ms)
[11:01:25] INFO: POST /auth/refresh -> 200 (17 ms)
[11:02:06] WARN: old refresh token of session 18 (account 1) used again: session revoked (IP 127.0.0.1)
[11:02:06] INFO: POST /auth/refresh -> 401 (21 ms)
[11:02:07] INFO: POST /auth/refresh -> 401 (16 ms)
```

This is the theft detection from Concept 7. The backend doesn't know who's genuine, so **everyone** holding that session, including its rightful owner in step 5, has to log in again. A refresh only takes a dozen or so milliseconds, much faster than a login, because the season pass is checked with SHA-256, not bcrypt.

#### 4.7 Logout

Send **`logout`** in Bruno.

**Expected output:** `200 OK` with `{"message":"logged out"}`. The **Headers** tab holds two **emptying** `set-cookie` lines:

```text
set-cookie: access=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
set-cookie: session=; Max-Age=0; Path=/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
```

`Max-Age=0` and the expiry date of January 1, 1970 tell the browser and Bruno to **throw away** both cookies right then. Their attributes (`Path`, `HttpOnly`, `SameSite`) are the same as when they were set, because a cookie is only deleted if its name, `Path`, and domain match. The session row is also gone from the `sessions` table. Now send **`who am i`**: the answer is **401**.

Logout always answers 200, even for someone who isn't logged in at all. There's no point in telling a stranger whether a session still exists.

PowerShell users from Practice 2.10: Fastify refuses a `POST` without content (`415 Unsupported Media Type` in Windows PowerShell 5.1, `400 … Body cannot be empty when content-type is set to 'application/json'` in PowerShell 7), because PowerShell writes a `content-type` header that doesn't fit. Send an empty JSON body:

```text
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8080/auth/logout -ContentType "application/json" -Body "{}" -WebSession $session
```

The answer is `logged out`, and `$session` no longer holds any cookies.

**The wristband's limit, proven.** Before logging out, the author copied the content of the `access` wristband, then used it again **after** the logout (**example**):

| Request with the copied wristband | Answer |
| :--- | :--- |
| `GET /auth/me` | **200** `{"id":1,"email":"admin@home.test","name":"Home Admin","role":"admin"}` |
| `POST /auth/refresh` | **401** `{"message":"not logged in: no session cookie"}` |

A wristband that has already been copied stays valid until its `exp`, at most 15 minutes, because the guard checks it without opening the database (Concepts 4 and 7). But it can't be extended: its season pass is already dead. That's why wristbands are short-lived, and a wristband that's still valid must never be shared with anyone.

#### 4.8 A wristband that really expires

One more test needs patience: let the wristband really expire. Send `login admin`, do something else for **more than 15 minutes** (for example, go on reading Concept 8), then send `device list`, `refresh`, and `device list` once more.

**Expected output:**

| Request | Answer |
| :--- | :--- |
| `device list` (more than 15 minutes after the login) | **401** `not logged in or session expired: log in with POST /auth/login` |
| `refresh` | **200**: the season pass is still valid, a new wristband is set |
| `device list` | **200** |

Bruno itself had already thrown that wristband away because its `Max-Age=900` ran out, so the first request left without a wristband. The author also tried to force the stale wristband through with curl: the guard still answered 401, because its `exp` had passed. The backend log (**example**):

```text
[11:49:29] INFO: GET /devices -> 401 (1 ms)
[11:49:31] INFO: GET /devices -> 401 (2 ms)
[11:49:32] INFO: POST /auth/refresh -> 200 (192 ms)
[11:49:33] INFO: GET /devices -> 200 (2 ms)
```

This is the pattern the React dashboard will later follow automatically (Module 22): if the answer is 401, knock on `refresh` once, then repeat the request. Only if `refresh` also gets 401, show the login form.

#### 4.9 Save to the branch (2 minutes)

```text
git add src/auth/token.ts src/auth/auth.test.ts src/db/users.ts src/routes/auth.ts bruno/refresh.yml bruno/logout.yml
git commit -m "Refresh with rotation, logout, and season pass tests (Module 20 Practice 4)"
```

> ⬆️ **Done with Practice 4?** Go back to [Concept 8](#8-rate-limiting-an-hourglass-for-password-guessers) before Practice 5.

### Practice 5 — Limit login attempts (30 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal runs `npm run dev`, the second terminal is in the `backend` folder for other commands) and **Bruno**. Section 5.5 uses **curl** (optional).
>
> ⭐ **Required** — the third pass requirement: the 11th login attempt within a minute is refused.

The login booth can still be knocked on without end. This practice puts up the hourglass from Concept 8: at most **10 attempts per minute** from one IP address.

#### 5.1 Install `@fastify/rate-limit` (2 minutes)

```text
npm install @fastify/rate-limit@11.2.1
```

**Expected output** (**example**):

```text
added 1 package, and audited 225 packages in 4s

55 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 5.2 The hourglass in `src/auth/security.ts` (8 minutes)

Open **`src/auth/security.ts`**, then replace its whole content with:

```ts
// security.ts - API protection (Module 20): cookies, JWT ("concert wristband"), rate limit, and the "guard" that checks
// EVERY HTTP request: a login (except on the list of open routes), and that viewer accounts only look.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.ts";
import type { Role } from "../db/users.ts";
import { ACCESS_AGE_SECONDS, SESSION_AGE_SECONDS } from "./token.ts";

// the content of the "wristband" (access JWT): the account number (sub), its role, and the session number (sid). Not a
// secret: anyone who holds the token can read it, so never put an email, a name, or other personal data here.
export interface TokenPayload {
  sub: string;
  role: Role;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: TokenPayload; // what reply.jwtSign signs
    user: TokenPayload & { iat: number; exp: number }; // what req.jwtVerify reads into req.user
  }
}

export const ACCESS_COOKIE = "access";
export const SESSION_COOKIE = "session";

// httpOnly: JavaScript on the page can't read the cookie (a thief using XSS doesn't get the token).
// sameSite strict: the browser doesn't send the cookie with requests started by another site (CSRF).
// secure auto: the Secure attribute is set when the request comes over HTTPS (Phase 5); on http://127.0.0.1 it isn't.
const BASE = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const ACCESS_OPTIONS = { ...BASE, path: "/", maxAge: ACCESS_AGE_SECONDS }; // path "/" REQUIRED: else only /auth/...
export const SESSION_OPTIONS = { ...BASE, path: "/auth", maxAge: SESSION_AGE_SECONDS }; // only sent to /auth/...

// Routes you may knock on WITHOUT logging in. Every other route requires a login, including routes added later.
export const OPEN_ROUTES = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: health checkers such as wget --spider (Docker, Phase 5)
]);
const READ_METHODS = new Set(["GET", "HEAD"]); // the only methods a viewer account may use

export async function setupSecurity(app: FastifyInstance): Promise<void> {
  await app.register(cookie); // no secret: the JWT is already signed, and refresh tokens are checked in the database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: ACCESS_COOKIE, signed: false },
    sign: { expiresIn: ACCESS_AGE_SECONDS }, // a number = seconds (900); text such as "1h30m" is refused since 10.2.3
    verify: { onlyCookie: true }, // the wristband is only read from the cookie, not from the Authorization header
  });
  await app.register(rateLimit, {
    global: false, // only routes that ask for it (POST /auth/login); counts are kept in memory: restart = start from zero
    errorResponseBuilder: (_req, context) => Object.assign(
      new Error(`too many attempts: try again in ${Math.ceil(context.ttl / 1000)} seconds`),
      { statusCode: context.statusCode }, // 429
    ),
  });
  app.addHook("onRequest", guard); // one guard at the front door: it applies to ALL routes
}

async function guard(req: FastifyRequest, reply: FastifyReply) {
  const url = req.routeOptions.url; // the route pattern, such as /devices/:id/command (undefined = none: guests 401, logged in 404)
  if (OPEN_ROUTES.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // an access cookie? a genuine signature? not expired yet? its content goes into req.user
  } catch {
    return reply.code(401).send({ message: "not logged in or session expired: log in with POST /auth/login" });
  }
  if (req.user.role !== "admin" && !READ_METHODS.has(req.method)) { // checked BEFORE the request content is validated
    req.log.warn(`refused (403): account ${req.user.sub} (${req.user.role}) tried ${req.method} ${req.url}`);
    return reply.code(403).send({ message: "viewer accounts can only look; commands and changes are admin-only" });
  }
}
```

- **`global: false`** means the hourglass is **not** put on every route, only on the routes that ask for it. Reading the house's data with Bruno or the dashboard doesn't need a limit; only the login door needs guarding.
- **`errorResponseBuilder`** writes the 429 answer in this backend's own words. `context.ttl` is the time left on the hourglass in milliseconds, so it's divided by 1,000 and rounded up to whole seconds.
- The count is kept in the backend's **memory** (Concept 8).

#### 5.3 Put the hourglass on the login door (5 minutes)

Open **`src/routes/auth.ts`**. Inside `app.post("/auth/login", { … })`, add the `config` line right **above** the `schema: {` line, then add the `429` answer to the `response` list, so that the start of that route becomes:

```ts
  app.post("/auth/login", {
    config: { rateLimit: { max: 10, timeWindow: 60_000 } }, // the 11th attempt within a minute from the same IP: 429
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Log in with email and password; the result is two httpOnly cookies (access 15 minutes, session 7 days)",
      body: LoginBody,
      response: {
        200: Profile,
        401: ErrorBody.describe("wrong email or password (deliberately not told apart)"),
        429: z.object({ statusCode: z.number(), error: z.string(), message: z.string() })
          .describe("more than 10 login attempts within a minute from the same IP address"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
```

- **`config.rateLimit`** is this route's own setting: `max: 10` attempts within `timeWindow: 60_000` milliseconds, which is one minute.
- The **`429`** answer is recorded in the schema so that it shows up in `/docs`, complete with its description.

Save, then run `npm run check` (no error messages). `npm run dev` restarts the backend by itself.

#### 5.4 ⭐ The 11th attempt is refused (10 minutes)

Use two requests from Practice 2: **`wrong login`** (a wrong password) and **`login admin`** (the right password).

1. Click **Send** on `wrong login` **ten times** in a row, within less than a minute. Each time, the answer is `401 Unauthorized`. Open the **Headers** tab of the last answer: `x-ratelimit-remaining` is already `0`. If a 429 answer shows up before the tenth click, you've already logged in a few times within the last minute: **every** attempt counts, including the successful ones. Wait a minute, then try again.
2. Right away, click **Send** on **`login admin`**, whose password is **right**.

**Expected output:** `429 Too Many Requests`, with this content (**example**; the number of seconds differs):

```json
{"statusCode":429,"error":"Too Many Requests","message":"too many attempts: try again in 49 seconds"}
```

The **Tests** tab of `login admin` is red (`expected 429 to equal 200`) because its Assert expects a successful login. Here, red is actually the sign that the hourglass works.

The **Headers** tab of that answer holds:

```text
x-ratelimit-limit: 10
x-ratelimit-remaining: 0
x-ratelimit-reset: 49
retry-after: 49
```

That's the **third pass requirement**: the 11th attempt within a minute is refused **even though the password is right**. Until the hourglass runs out, the booth doesn't even check the password. The backend log shows the difference (**example**):

```text
[12:08:40] WARN: login failed: account 1 (IP 127.0.0.1)
[12:08:40] INFO: POST /auth/login -> 401 (410 ms)
[12:08:40] INFO: POST /auth/login -> 429 (4 ms)
```

The 10th attempt still runs bcrypt (410 ms), while the 11th attempt is refused within 4 milliseconds, before it touches the database or bcrypt.

3. Wait until `retry-after` has run out (less than a minute), then click **Send** on `login admin` again. The answer is **200** again, and the `x-ratelimit-remaining` header becomes `9`.

#### 5.5 (Optional) Eleven attempts from the terminal

If you created `login.json` in Practice 2.10, also make a copy of it named **`login-wrong.json`** in the `backend` folder, then replace the password inside it with a wrong one. Git already ignores that file through the `login*.json` line in `backend/.gitignore`. Run the command below in the second terminal (the `backend` folder). In PowerShell, `1..10 | ForEach-Object { … }` runs the command inside the curly braces ten times, and `-w "%{http_code} "` makes curl write only the answer's status code:

```text
1..10 | ForEach-Object { curl.exe -s -o NUL -w "%{http_code} " -H "content-type: application/json" --data-binary "@login-wrong.json" http://127.0.0.1:8080/auth/login }; curl.exe -i -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login
```

**Expected output** (**example**; Windows PowerShell 5.1 and PowerShell 7 give the same result):

```text
401 401 401 401 401 401 401 401 401 401 HTTP/1.1 429 Too Many Requests
x-ratelimit-limit: 10
x-ratelimit-remaining: 0
x-ratelimit-reset: 29
retry-after: 29
content-type: application/json; charset=utf-8
content-length: 101
Date: Thu, 22 Oct 2026 05:15:47 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"statusCode":429,"error":"Too Many Requests","message":"too many attempts: try again in 29 seconds"}
```

**macOS:** replace `1..10 | ForEach-Object { … }` with `for i in 1 2 3 4 5 6 7 8 9 10; do …; done`, `curl.exe` with `curl`, and `NUL` with `/dev/null`. Another way, with the Bruno CLI, is in 🔬.

#### 5.6 The hourglass lives in memory

The hourglass is kept in the backend's memory. Prove it: wait a minute after your last login so that the hourglass is empty, then send `wrong login` three times (the `x-ratelimit-remaining` header drops to `7`), stop the backend with **Ctrl + C**, run `npm run dev` again, then send `login admin`.

**Expected output:** `200 OK`, and `x-ratelimit-remaining` is back at `9`. The old count disappeared together with the backend process that was stopped.

For one backend on a laptop, that's not a problem: a password guesser can't turn off your backend. A backend that runs on several servers at once (Phase 5) keeps its count in a shared place, for example Redis, so that every server sees the same number.

#### 5.7 Save to the branch (2 minutes)

```text
git add package.json package-lock.json src/auth/security.ts src/routes/auth.ts
git commit -m "A limit of 10 login attempts per minute, the 11th attempt is answered 429 (Module 20 Practice 5)"
```

> ⬆️ **Done with Practice 5?** Go back to [Concept 9](#9-cors-why-the-browser-refuses) before Practice 6.

### Practice 6 — CORS and the origin check (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal runs `npm run dev`, the second terminal is in the `backend` folder for other commands), a **browser** (Chrome or Edge) with its **DevTools**, and **Bruno**. Sections 6.5 and 6.6 use **curl** (optional).

This practice puts up two things from Concept 9. First, **CORS**: the list of web pages that may read the backend's answers from a browser, prepared for the Module 22 dashboard. Second, **the origin check**: the guard refuses commands from pages it doesn't know, even when your cookie is carried along.

#### 6.1 Install `@fastify/cors` (2 minutes)

```text
npm install @fastify/cors@11.3.1
```

**Expected output** (**example**):

```text
added 1 package, and audited 226 packages in 2s

56 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 6.2 The `CORS_ORIGIN` setting (5 minutes)

The list of allowed origins is kept in `.env` so that it can be changed without touching the code. Open **`src/config/env.ts`**, then add these three lines (one comment and two lines of code) inside `z.object({ … })`, right below the `JWT_SECRET` setting:

```ts
  // Module 20: web page addresses (origins) that may call this API from a browser, comma-separated. Module 22: Vite, 5173.
  CORS_ORIGIN: z.preprocess(empty, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((text) => text.split(",").map((origin) => origin.trim()).filter((origin) => origin !== ""))),
```

- If `CORS_ORIGIN` isn't written in `.env`, its value is `http://localhost:5173,http://127.0.0.1:5173`: the Vite addresses that Module 22 uses.
- **`.transform()`** splits the comma-separated text into a list (an array), then removes spaces and empty entries. As a result, `env.CORS_ORIGIN` in the rest of the code is already a list of origins.

Also add these two lines at the very bottom of **`.env.example`**, so that your teammates know the setting exists:

```text
# Module 20: web pages (origins) that may call the API from a browser, comma-separated (Module 22: Vite on port 5173)
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Your own `.env` doesn't need to change now: the default value is already right.

#### 6.3 CORS and the origin check in `src/auth/security.ts` (10 minutes)

Open **`src/auth/security.ts`**, then replace its whole content with:

```ts
// security.ts - API protection (Module 20): CORS, cookies, JWT ("concert wristband"), rate limit, and the "guard" that checks
// EVERY HTTP request: the page's origin (Origin), a login (except on the list of open routes), and that viewer accounts only
// look.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.ts";
import type { Role } from "../db/users.ts";
import { ACCESS_AGE_SECONDS, SESSION_AGE_SECONDS } from "./token.ts";

// the content of the "wristband" (access JWT): the account number (sub), its role, and the session number (sid). Not a
// secret: anyone who holds the token can read it, so never put an email, a name, or other personal data here.
export interface TokenPayload {
  sub: string;
  role: Role;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: TokenPayload; // what reply.jwtSign signs
    user: TokenPayload & { iat: number; exp: number }; // what req.jwtVerify reads into req.user
  }
}

export const ACCESS_COOKIE = "access";
export const SESSION_COOKIE = "session";

// httpOnly: JavaScript on the page can't read the cookie (a thief using XSS doesn't get the token).
// sameSite strict: the browser doesn't send the cookie with requests started by another site (CSRF).
// secure auto: the Secure attribute is set when the request comes over HTTPS (Phase 5); on http://127.0.0.1 it isn't.
const BASE = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const ACCESS_OPTIONS = { ...BASE, path: "/", maxAge: ACCESS_AGE_SECONDS }; // path "/" REQUIRED: else only /auth/...
export const SESSION_OPTIONS = { ...BASE, path: "/auth", maxAge: SESSION_AGE_SECONDS }; // only sent to /auth/...

// Routes you may knock on WITHOUT logging in. Every other route requires a login, including routes added later.
export const OPEN_ROUTES = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: health checkers such as wget --spider (Docker, Phase 5)
]);
const READ_METHODS = new Set(["GET", "HEAD"]); // the only methods a viewer account may use
// Web pages (origins) that may CHANGE something through a browser: the CORS list + this server itself (Swagger UI at /docs).
export const ALLOWED_ORIGINS = new Set([...env.CORS_ORIGIN, `http://${env.HOST}:${env.PORT}`, `http://localhost:${env.PORT}`]);

export async function setupSecurity(app: FastifyInstance): Promise<void> {
  // CORS goes FIRST: a preflight (OPTIONS) from the browser carries no cookie, so it must be answered before the guard.
  await app.register(cors, {
    origin: env.CORS_ORIGIN, // an exact list, not "*": with credentials, browsers refuse "*"
    credentials: true, // let the browser send cookies from pages at those origins
    methods: ["GET", "HEAD", "POST", "PUT"], // PUT /rules/:id; the plugin's default is only GET, HEAD, POST
  });
  await app.register(cookie); // no secret: the JWT is already signed, and refresh tokens are checked in the database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: ACCESS_COOKIE, signed: false },
    sign: { expiresIn: ACCESS_AGE_SECONDS }, // a number = seconds (900); text such as "1h30m" is refused since 10.2.3
    verify: { onlyCookie: true }, // the wristband is only read from the cookie, not from the Authorization header
  });
  await app.register(rateLimit, {
    global: false, // only routes that ask for it (POST /auth/login); counts are kept in memory: restart = start from zero
    errorResponseBuilder: (_req, context) => Object.assign(
      new Error(`too many attempts: try again in ${Math.ceil(context.ttl / 1000)} seconds`),
      { statusCode: context.statusCode }, // 429
    ),
  });
  app.addHook("onRequest", guard); // one guard at the front door: it applies to ALL routes
}

async function guard(req: FastifyRequest, reply: FastifyReply) {
  // CSRF: a <form> on another page on the same host (for example another app at http://127.0.0.1:3000) still carries the
  // SameSite=Strict cookies, because it is still the same "site". Browsers always write the Origin header on POST/PUT; curl,
  // Bruno, and Node don't write it, so they aren't affected.
  const origin = req.headers.origin;
  if (!READ_METHODS.has(req.method) && origin !== undefined && !ALLOWED_ORIGINS.has(origin)) {
    req.log.warn(`refused (403): ${req.method} ${req.url} from the page ${origin}`);
    return reply.code(403).send({ message: `request from the page ${origin} refused` });
  }
  const url = req.routeOptions.url; // the route pattern, such as /devices/:id/command (undefined = none: guests 401, logged in 404)
  if (OPEN_ROUTES.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // an access cookie? a genuine signature? not expired yet? its content goes into req.user
  } catch {
    return reply.code(401).send({ message: "not logged in or session expired: log in with POST /auth/login" });
  }
  if (req.user.role !== "admin" && !READ_METHODS.has(req.method)) { // checked BEFORE the request content is validated
    req.log.warn(`refused (403): account ${req.user.sub} (${req.user.role}) tried ${req.method} ${req.url}`);
    return reply.code(403).send({ message: "viewer accounts can only look; commands and changes are admin-only" });
  }
}
```

- **`ALLOWED_ORIGINS`** is the list of pages that may **change** something through a browser: the content of `CORS_ORIGIN`, plus the backend itself, that is, `http://127.0.0.1:8080` and `http://localhost:8080`. The last two let **Try it out** in `/docs` keep sending `POST` requests.
- **`app.register(cors, …)`** goes **first**, before the cookies, the JWT, and the guard. A preflight `OPTIONS` request from the browser carries no cookie, so it must be answered before the guard gets the chance to refuse it with 401 (Concept 9). `credentials: true` lets pages from those origins send cookies, and `PUT` is added to `methods` for `PUT /rules/:id`.
- **The guard's first step now checks the origin.** For requests other than `GET` and `HEAD`, if there's an `Origin` header and it isn't in `ALLOWED_ORIGINS`, the answer is **403** `request from the page … refused`, and the log records a `WARN` line. Requests **without** an `Origin` header, like those from Bruno, curl, and the small terminal, aren't affected, because only browsers write that header.

Save, then run `npm run check` (no error messages).

#### 6.4 "Why does the browser refuse?" in DevTools (10 minutes)

CORS messages only appear in the browser, so look at them right there. For this test we use a rule from Concept 9: `http://localhost:8080` and `http://127.0.0.1:8080` are **two different origins**, even though the backend is the same.

1. Make sure `npm run dev` is running, then open **`http://localhost:8080/docs`** in Chrome or Edge. This time it's `localhost` on purpose, so that this page has a different origin.
2. Press **F12** (macOS: **Cmd + Option + I**) to open DevTools, then choose the **Console** tab.
3. **Type** this command (don't paste it; Chrome refuses code pasted into the Console until you type `allow pasting`), then press **Enter**:

   ```js
   await (await fetch("http://127.0.0.1:8080/health")).json()
   ```

   A page from the origin `http://localhost:8080` asks for an answer from the origin `http://127.0.0.1:8080`, and the page's origin isn't in `CORS_ORIGIN` yet. The Console writes a red message: that's exactly what we expect, and what it means is explained below the picture.
4. Open `.env` in the `backend` folder (not `bruno/.env`), add the line `CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080`, then save. `npm run dev` restarts the backend.
5. Go back to the Console, press **↑** to bring back the command from before, then press **Enter**.

![Screenshot of Chrome DevTools, the Console tab, Practice 6.4; the author's lab port 18206, on your laptop 8080. Top, marked 1, before: the origin http://localhost:18206 isn't in CORS_ORIGIN yet. The Console shows the red line Access to fetch at http://127.0.0.1:18206/health from origin http://localhost:18206 has been blocked by CORS policy: No Access-Control-Allow-Origin header is present on the requested resource, then Failed to load resource: net::ERR_FAILED, the same blocked by CORS policy line once more, and the line GET http://127.0.0.1:18206/health net::ERR_FAILED 200 (OK); the first line and the last line are framed. Bottom, marked 2, after: that page's origin is added to CORS_ORIGIN, and the backend has restarted. The Console shows the command await (await fetch(http://127.0.0.1:18206/health)).json() and its result ok: true, broker: true, database: true, received: 270, rejected: 0, which is framed. Captions at the bottom: 1, red, blocked by CORS policy; the line GET …/health … 200 (OK) means the backend answered and the browser held it back; 2, the answer now reaches the page, because the backend's answer carries the access-control-allow-origin header.](assets/cors-in-devtools.png)

- **Before** (**1**): the Console writes `Access to fetch at 'http://127.0.0.1:8080/health' from origin 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.` Your own command ends with the error `TypeError: Failed to fetch`. Also notice the line `GET http://127.0.0.1:8080/health net::ERR_FAILED 200 (OK)`. The backend has already answered **200**, and the backend log even records `GET /health -> 200`, but the browser refuses to hand that answer over to the page. That's the heart of CORS: it's the **browser** that holds the answer back, not the backend. In capture **1**, the author's script ran `fetch` twice, so the red message appears twice, while the command line and its `TypeError` error don't show.
- **After** (**2**): the page's origin is registered now, so the backend adds the header `access-control-allow-origin: http://localhost:8080` to its answer, and the content reaches the page: `{ok: true, broker: true, database: true, …}`.

Delete the `CORS_ORIGIN` line you just added to `.env` again (the default value is already right), then save. From now on, if Module 22 says `CORS error`, you know where to look: the page's origin, the content of `CORS_ORIGIN`, and the order, with CORS before the guard.

#### 6.5 (Optional) Seeing the preflight with curl

The browser sends the preflight without you seeing it. With curl, you can send one yourself and look at the answer. First, a registered origin:

```text
curl.exe -i -X OPTIONS http://127.0.0.1:8080/devices/a4cf12e5b7c0/command -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

**Expected output** (**example**):

```text
HTTP/1.1 204 No Content
vary: Origin, Access-Control-Request-Headers
access-control-allow-origin: http://localhost:5173
access-control-allow-credentials: true
access-control-allow-methods: GET, HEAD, POST, PUT
access-control-allow-headers: content-type
content-length: 0
```

Repeat it with `-H "Origin: http://prank.test"`. The answer is still `204`, but the **`access-control-allow-origin` line is gone**. Without that line, the browser refuses to send the real request. Notice too that the preflight is answered without a cookie and without a wristband: CORS really does work before the guard.

#### 6.6 Commands from a foreign page are refused (5 minutes)

Imitate a browser that sends a command from another page on your laptop, for example `http://127.0.0.1:5500`. If you created `login.json` in Practice 2.10, also create the file **`command.json`** in the `backend` folder, holding `{"target":"lamp","value":true}` (it isn't a secret; you can delete it afterward). Log in first, then send the lamp command with the `admin` cookie **and** the foreign page's `Origin` header:

```text
curl.exe -s -o NUL -c cookies.txt -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login
curl.exe -i -b cookies.txt -H "Origin: http://127.0.0.1:5500" -H "content-type: application/json" --data-binary "@command.json" http://127.0.0.1:8080/devices/a4cf12e5b7c0/command
```

Run both commands in the second terminal (the `backend` folder). The laptop path uses `f00d00000001` instead of `a4cf12e5b7c0`, and macOS users write `curl` and `-o /dev/null` instead of `curl.exe` and `-o NUL`. The JSON content is read from a file on purpose, because Windows PowerShell 5.1 and PowerShell 7 treat quotation marks inside a command differently (Practice 2.10).

**Expected output** (**example**):

```text
HTTP/1.1 403 Forbidden
vary: Origin
access-control-allow-credentials: true
content-type: application/json; charset=utf-8
content-length: 65

{"message":"request from the page http://127.0.0.1:5500 refused"}
```

The cookie is valid and its role is `admin`, but the guard refuses the request **before** the wristband is checked, because the origin isn't known. Bruno isn't affected: send `lamp on` as `admin` in Bruno, and the answer is still 200, because Bruno doesn't write an `Origin` header. If Node 1 or the simulator isn't running at the moment, the command route answers 409, 503, or 504, but still not 403.

**Proof from a real browser.** The author ran a small page at `http://127.0.0.1:8202` (another address on the same laptop) that automatically sends a `<form method="POST" enctype="text/plain">` to `http://127.0.0.1:8080/rules/3/run` while the same browser is logged in as `admin`. Its content is plain text on purpose, because an ordinary form (`application/x-www-form-urlencoded`) is already answered with `415` by Fastify before it reaches the route, while plain text is accepted (🔬 "Extra layers against CSRF"). The result:

| Backend code | The answer shown in the browser |
| :--- | :--- |
| Practice 5 (without the origin check) | `{"message":"rule 3 is not active"}`: the request **reaches the route**, because the `admin` cookie is carried along (same site). If rule 3 were active, the pump would water too. |
| Practice 6 (with the origin check) | `{"message":"request from the page http://127.0.0.1:8202 refused"}`: the guard refuses it **before** the route runs. |

The backend log of the Practice 6 version (**example**):

```text
[12:35:37] WARN: refused (403): POST /rules/3/run from the page http://127.0.0.1:8202
[12:35:37] INFO: POST /rules/3/run -> 403 (1 ms)
```

This is the same-site gap from Concept 9: `SameSite=Strict` doesn't hold back another page on the same host, but the origin check does.

#### 6.7 Save to the branch (2 minutes)

```text
git add package.json package-lock.json .env.example src/config/env.ts src/auth/security.ts
git commit -m "CORS for the dashboard and the origin check in the guard (Module 20 Practice 6)"
```

> ⬆️ **Done with Practice 6?** Go back to [Concept 10](#10-socketio-is-locked-too-the-hall-door-takes-the-same-wristband) before Practice 7.

### Practice 7 — Socket.IO is locked too (50 minutes)

> 🖥️ **Tools used:** **VS Code** with several terminals: the backend (`npm run dev`, the `backend` folder), a second terminal in the `backend` folder for `npm run check`, `npm run users`, and `git`, and the small terminal (the `tools` folder). **The device path:** Node 1 is on. **The laptop path:** the Module 19 simulator for `f00d00000001` runs in its own terminal (the `tools` folder, with the command `node device-simulator.js mqtt://127.0.0.1:1883 1` as in Practice 3); don't type other commands in the simulator's terminal, because the simulator reads every line as a temperature command.
>
> ⭐ **Required** — the API and the realtime connections are both locked.

The table in Practice 3.4 left one door open: `/socket.io/` is answered with 200 without a login. This practice posts the hall-door guard from Concept 10, then updates the small terminal so that it logs in before it connects.

#### 7.1 The hall-door guard: `src/services/realtime.ts` (15 minutes)

Open **`src/services/realtime.ts`**, then replace its whole content with:

```ts
// realtime.ts - Socket.IO: data flows to the terminal and the browser without a refresh (Module 19), locked in Module 20.
// Every device has one room named "device:<device_id>". A client that wants to watch one device sends
// "follow", and then receives only that device's telemetry. Status changes and the event log go to every client.
// Socket.IO answers /socket.io/ requests itself BEFORE Fastify sees them, so the Fastify guard (onRequest hook) does NOT
// guard this door: Socket.IO has its own guard (allowRequest + io.use) with the same rules and the same cookie.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/contract.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import type { SavedEvent } from "../db/archive.ts";
import { findDevice } from "./store.ts";
import { env } from "../config/env.ts";
import { ALLOWED_ORIGINS, ACCESS_COOKIE } from "../auth/security.ts";
import type { TokenPayload } from "../auth/security.ts";

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
  event: (event: SavedEvent) => void;
}

// events from the client to the server; "respond" is the Socket.IO ack
interface FromClient {
  follow: (deviceId: string, respond: (answer: FollowAnswer) => void) => void;
  unfollow: (deviceId: string) => void;
}

// Module 20: the data the server remembers for every client: the content of its wristband (access JWT) when it connected
interface SocketData {
  user: TokenPayload & { iat: number; exp: number };
}

let io: Server<FromClient, ToClient, Record<string, never>, SocketData> | undefined;

export function startRealtime(app: FastifyInstance): void {
  io = new Server<FromClient, ToClient, Record<string, never>, SocketData>(app.server, { // rides on Fastify's HTTP server
    cors: { origin: env.CORS_ORIGIN, credentials: true }, // the same origin list as the API (Module 22)
    // Module 20: the page's origin follows the SAME rule as the guard: no Origin = a Node client (the small terminal)
    allowRequest: (req, callback) => callback(null, req.headers.origin === undefined || ALLOWED_ORIGINS.has(req.headers.origin)),
  });
  // Module 20: the Socket.IO door guard. It runs once when a client connects (the handshake), with the same cookie.
  io.use((socket, next) => {
    const cookie = app.parseCookie(socket.request.headers.cookie ?? "");
    const token = cookie[ACCESS_COOKIE];
    if (token === undefined) return next(new Error("not logged in"));
    try {
      socket.data.user = app.jwt.verify<TokenPayload & { iat: number; exp: number }>(token);
      next();
    } catch {
      next(new Error("session expired or invalid: refresh or log in again"));
    }
  });
  io.on("connection", (socket) => {
    const { sub, role, sid, exp } = socket.data.user;
    app.log.info(`realtime client connected: ${socket.id} (account ${sub}, ${role})`);
    void socket.join(`session:${sid}`); // logging out of this session = cut all its connections (disconnectSession)
    // the wristband is only checked at the door: when it expires, the connection is cut; the client refreshes, reconnects
    const expiry = setTimeout(() => socket.disconnect(true), exp * 1000 - Date.now());
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
    socket.on("disconnect", (reason) => {
      clearTimeout(expiry);
      app.log.info(`realtime client disconnected: ${socket.id} (${reason})`);
    });
  });
  // When the server is closed gracefully, disconnect every Socket.IO client first; otherwise app.close() waits for them.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
}

// Module 20: a logout or a revoked session -> cut all the Socket.IO connections of that session
export function disconnectSession(sid: number): void {
  io?.in(`session:${sid}`).disconnectSockets(true);
}

// send one telemetry ONLY to the clients that follow that device
export function broadcastTelemetry(deviceId: string, content: Telemetry): void {
  io?.to(`device:${deviceId}`).emit("telemetry", deviceId, content);
}

// send a status change to ALL clients
export function broadcastStatus(deviceId: string, status: Status): void {
  io?.emit("status", deviceId, status);
}

// send one row of the event log to ALL clients
export function broadcastEvent(event: SavedEvent): void {
  io?.emit("event", event);
}
```

What's new compared with Module 19:

- **`allowRequest`** checks the page's origin with the same **`ALLOWED_ORIGINS`** list as the HTTP guard. Clients without an `Origin` header, like the small terminal, may go on to the wristband check; browser pages from an unknown origin are refused with `403` here.
- **`cors`** uses the same `CORS_ORIGIN` as the API, for the Module 22 dashboard.
- **`io.use()`** is the hall-door guard. It reads the `Cookie` header of the handshake request with `app.parseCookie()`, takes the `access` wristband, then checks it with `app.jwt.verify()`, that is, with the same stamp as the guard. If there's no wristband, the client is refused with `not logged in`; if the wristband is fake or stale, with `session expired or invalid: refresh or log in again`. If it passes, the content of the wristband is stored in `socket.data.user`.
- **`socket.join("session:<sid>")`** puts every connection into the room of its session, and **`disconnectSession()`** cuts all the connections in that room.
- **`setTimeout(…, exp * 1000 - Date.now())`** cuts the connection right when its wristband expires (`exp` is in seconds, `Date.now()` in milliseconds), and `clearTimeout()` cancels it if the client has already disconnected before that.
- The `realtime client connected` log line now names the account number and its role.

#### 7.2 Logout and a stolen pass cut the connection too (5 minutes)

The `/auth` booth needs to tell the hall door when a session ends. Open **`src/routes/auth.ts`**, then make three small changes:

1. Below the line `import type { User } from "../db/users.ts";`, add:

   ```ts
   import { disconnectSession } from "../services/realtime.ts";
   ```

2. In the `POST /auth/refresh` route, find the line `await deleteSession(old.id);` (the part for an old pass that's suspected of being stolen), then add one line right below it:

   ```ts
           disconnectSession(old.id); // Module 20 Practice 7: that session's Socket.IO connections are cut too
   ```

3. In the `POST /auth/logout` route, replace the line `if (sid !== undefined) req.log.info(`… with:

   ```ts
       if (sid !== undefined) {
         disconnectSession(sid); // Module 20 Practice 7: this session's Socket.IO connections are cut too
         req.log.info(`logout: session ${sid}`);
       }
   ```

   Also adjust that route's `summary`, so that `/docs` explains it: `"Log out: the session in the database is deleted, both cookies are emptied, its Socket.IO connections are cut"`.

In `src/server.ts`, just update the comment on the line `startRealtime(app);` to `// Module 19: Socket.IO at the address /socket.io/ (Module 20: locked too)`. The code itself doesn't change, because `realtime.ts` now reads `env` and `ALLOWED_ORIGINS` by itself.

Save everything, then run `npm run check` (no error messages).

#### 7.3 The Module 19 terminal is now refused (3 minutes)

Open a new terminal for the small terminal (**Terminal → New Terminal**; a new terminal always starts in the `mini-smart-home` folder), go into the `tools` folder, then run the **Module 19 version** of the small terminal as usual (for the device path, use your Node 1's `device_id`):

```text
cd tools
node live-terminal.js http://127.0.0.1:8080 f00d00000001
```

**Expected output** (**example**):

```text
[1:34:36 PM] can't connect yet: not logged in
```

That terminal writes one line, then ends by itself. The hall-door guard refuses it because it carries no wristband, and Socket.IO doesn't try to connect again after the guard has refused it: repeating the same request wouldn't change the answer.

#### 7.4 The Module 20 small terminal (15 minutes)

The small terminal now has to log in by itself. It uses a **`viewer`** account: that terminal only looks, so it doesn't need `admin` rights (least privilege, Concept 1).

1. In the Explorer, first click an empty spot, then right-click the **`tools`** folder → **New File…**, name it **`.env.example`**, and type:

   ```text
   # Copy this file to .env (in the tools folder), then fill in the account for live-terminal.js. The .env file doesn't go into Git.
   # Use a viewer account: the small terminal only looks, so it doesn't need admin rights.
   TERMINAL_EMAIL=viewer@home.test
   TERMINAL_PASSWORD=
   ```

2. Open **`tools/.gitignore`**, then add these two lines at the very bottom, so that `tools/.env` never goes into Git, even before that file exists:

   ```text
   # Module 20: the live-terminal.js account (it holds a password), the example is in .env.example
   .env
   ```

3. Now create **`tools/.env`** with the same content as `.env.example`, then fill in `TERMINAL_PASSWORD=` with the password of the `viewer` account from Practice 1.7. If your password contains a `#` sign, put the value between double quotation marks (`TERMINAL_PASSWORD="…"`), as in `bruno/.env`: without quotation marks, Node.js throws away everything after the `#`.

4. Open **`tools/live-terminal.js`**, then replace its whole content with:

   ```js
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
   ```

- **`--env-file=.env`** makes Node.js read `tools/.env`, exactly like the backend does. The email and the password are never written in the command.
- **`cookies`** is a `Map` (the Module 19 warm-up) where the terminal keeps its own cookies. **`saveCookies()`** reads every `Set-Cookie` header with `getSetCookie()`, then keeps the part before the first semicolon. A cookie that the backend empties is deleted too.
- **`login()`** and **`refresh()`** knock on the same booths as Bruno. The season pass is sent by hand in the `cookie` header, because Node.js has no "cookie basket" like a browser's.
- **`io(address, { autoConnect: false })`** keeps Socket.IO from connecting before the wristband is ready. **`socket.io.opts.extraHeaders`** attaches the `access` wristband to every handshake, reconnections included.
- **`refreshThenConnect()`** tries a refresh first, and only logs in again if the refresh fails. That way, a terminal that runs for hours doesn't create a new session row every 15 minutes. If the backend can't be reached yet (a `TypeError` from `fetch`), it tries again every 5 seconds; if it's refused three times in a row even with a new wristband, it stops.
- When the server cuts the connection (`io server disconnect`) or a guard refuses it (`connect_error` with `socket.active` set to `false`), the terminal renews its wristband, then connects again.

In the same small terminal (the `tools` folder), run the new version. For the device path, replace `f00d00000001` with your Node 1's `device_id`:

```text
node --env-file=.env live-terminal.js http://127.0.0.1:8080 f00d00000001
```

**Expected output** (**example**; the device path shows your Node 1's readings):

```text
[1:37:05 PM] logged in as viewer@home.test
[1:37:05 PM] connected to http://127.0.0.1:8080 (websocket)
[1:37:05 PM] following f00d00000001
[1:37:05 PM] f00d00000001  temp 30.9 °C  humidity 75 %  soil 37 %  fan off  lamp off  (last reading)
[1:37:06 PM] f00d00000001  temp 26.5 °C  humidity 82 %  soil 21 %  fan off  lamp off
[1:37:16 PM] f00d00000001  temp 27.1 °C  humidity 84 %  soil 57 %  fan off  lamp off
```

The backend log records who connected (**example**):

```text
[13:37:05] INFO: login: account 2 (viewer), session 34, IP 127.0.0.1
[13:37:05] INFO: POST /auth/login -> 200 (662 ms)
[13:37:05] INFO: realtime client connected: pGSZ4nPaofFSwoaHAAAB (account 2, viewer)
[13:37:05] INFO: client pGSZ4nPaofFSwoaHAAAB follows f00d00000001
```

If the terminal stops right away with `Fill in TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env, …`, the `tools/.env` file hasn't been filled in yet. If Node.js writes `.env: not found`, that file hasn't been created in the `tools` folder yet, or you ran the command from another folder.

#### 7.5 Cut off when the wristband expires, then connected again (20 minutes of waiting)

Leave the small terminal running for more than 15 minutes after the line `logged in as …`. You can work on other parts while you wait.

**Expected output** (**example**; exactly 15 minutes after logging in):

```text
[1:52:00 PM] f00d00000001  temp 27.1 °C  humidity 81 %  soil 48 %  fan off  lamp off
[1:52:05 PM] disconnected: io server disconnect
[1:52:05 PM] wristband renewed (refresh)
[1:52:05 PM] connected to http://127.0.0.1:8080 (polling)
[1:52:05 PM] transport upgraded to websocket
[1:52:05 PM] following f00d00000001
[1:52:05 PM] f00d00000001  temp 27.1 °C  humidity 81 %  soil 48 %  fan off  lamp off  (last reading)
```

In the backend log (**example**):

```text
[13:52:05] INFO: realtime client disconnected: pGSZ4nPaofFSwoaHAAAB (server namespace disconnect)
[13:52:05] INFO: POST /auth/refresh -> 200 (258 ms)
[13:52:05] INFO: realtime client connected: xIGejogS7aYmtyWlAAAG (account 2, viewer)
[13:52:05] INFO: client xIGejogS7aYmtyWlAAAG follows f00d00000001
```

The hall-door guard cuts the connection right when the wristband expires (`server namespace disconnect`). The small terminal swaps its season pass for a new wristband, then connects again with a new connection id in less than a second, without logging in again and without a new session row.

**(Optional, up to 15 minutes) The password is changed from outside the backend.** While the small terminal is running, change the `viewer` account's password from the second terminal (the `backend` folder, not the simulator's terminal) with `npm run users -- password viewer@home.test`, then note the new password in your password manager. That script deletes every `viewer` session in the database, but it runs in a separate process, so it can't cut connections inside the backend. The small terminal keeps showing readings until its wristband runs out, then (**example**):

```text
[2:07:05 PM] disconnected: io server disconnect
[2:07:05 PM] refresh refused (401), logging in again
[2:07:05 PM] login refused (401). Check TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env.
```

Its season pass has been revoked, and the old password in `tools/.env` no longer works, so the terminal stops. Update `TERMINAL_PASSWORD` in `tools/.env` and `VIEWER_PASSWORD` in `backend/bruno/.env` with the new password, then run the small terminal again. This is the honest limit from Concept 10: a session that's revoked from outside the backend only ends when its wristband expires.

#### 7.6 Logout cuts that session's connection

The small terminal has its own session, separate from Bruno's, so logging out in Bruno doesn't cut it. The author tested this cut with a small script that logs in, connects to Socket.IO, then logs out of **the same session** (**example**, the backend log):

```text
[13:39:44] INFO: login: account 1 (admin), session 35, IP 127.0.0.1
[13:39:44] INFO: realtime client connected: ngJH1yG4nMyvPMQ2AAAD (account 1, admin)
[13:39:47] INFO: realtime client disconnected: ngJH1yG4nMyvPMQ2AAAD (server namespace disconnect)
[13:39:47] INFO: logout: session 35
[13:39:47] INFO: POST /auth/logout -> 200 (105 ms)
```

The connection is cut **right away**, before the logout answer is sent. The same happens when an old season pass is used again 30 seconds or more after it was replaced: the log writes `realtime client disconnected: … (server namespace disconnect)` right before `old refresh token of session 36 (account 1) used again: session revoked`.

One limit still applies (Concept 7): that script also tried to connect again **after** logging out, with a copy of a wristband that hadn't expired yet, and it succeeded, because the hall-door guard only checks the wristband. But that wristband can't be extended: a refresh with its season pass is answered with `401 session no longer valid: please log in again`, and the connection is cut at the latest when that wristband expires.

#### 7.7 (Optional) The hall door from curl

Socket.IO always starts a connection with an ordinary HTTP request (Module 19). Without a cookie, that first request is still answered with `200`, because the `io.use()` guard only works when the client asks to enter the hall. What's interesting is the page's origin:

```text
curl.exe -i "http://127.0.0.1:8080/socket.io/?EIO=4&transport=polling" -H "Origin: http://prank.test"
```

**Expected output** (**example**):

```text
HTTP/1.1 403 Forbidden
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json
Date: Thu, 22 Oct 2026 06:38:38 GMT
Connection: keep-alive
Keep-Alive: timeout=72
Transfer-Encoding: chunked

{"code":4,"message":"Forbidden"}
```

This is the answer of `allowRequest`: the origin `http://prank.test` isn't in `ALLOWED_ORIGINS`. With `-H "Origin: http://localhost:5173"`, the origin registered for Module 22, the answer is `200` and carries `Access-Control-Allow-Origin: http://localhost:5173`. When the author continued that connection without a cookie until it asked to enter the hall, the answer carried the `not logged in` message from `io.use()`.

#### 7.8 Save to the branch (2 minutes)

Run this in the second terminal, the one in the `backend` folder (not in the terminal running the backend, the small terminal, or the simulator). The files in the `tools` folder are written with the path `../tools/…`:

```text
git add src/services/realtime.ts src/routes/auth.ts src/server.ts ../tools/live-terminal.js ../tools/.env.example ../tools/.gitignore
git commit -m "Socket.IO locked too; the small terminal logs in with a viewer account (Module 20 Practice 7)"
```

Make sure `tools/.env` isn't included: `git status` must not mention it.

> ⬆️ **Done with Practice 7?** Go back to [Concept 11](#11-secrets-and-privacy-what-must-not-leak) before Practice 8.

### Practice 8 — Secrets, privacy, and the pass test (40 minutes)

> 🖥️ **Tools used:** **VS Code** (the first terminal runs `npm run dev`, and the second terminal is for the checks and Git), **Bruno**, and a **browser** that's already signed in to GitHub.
>
> ⭐ **Required** — proof that secrets get into neither the log nor Git, and a dress rehearsal of all three Module 20 pass requirements in one go.

All the locks are in place. Before this week's work is sent to GitHub, the backend gets its version number, then you check three things that can't be seen from the outside: the log doesn't leak secrets, the `.env` files don't go into Git, and GitHub keeps watch too. Finally, the three pass requirements are tested in a row, like an inspector who comes to check your house.

#### 8.1 Backend v0.5.0 (5 minutes)

Leave `npm run dev` running in the first terminal. In the second terminal, make sure you're in the `backend` folder: its command line must end with `backend>` (macOS: `backend %`). Then run:

```text
npm version 0.5.0 --no-git-tag-version
```

**Expected output:**

```text
v0.5.0
```

As in Module 19, `npm version` changes the version number in `package.json` and `package-lock.json` at once, and `--no-git-tag-version` stops it from making a commit by itself. Then update the three places that still mention the old version:

1. In **`backend/package.json`**, replace the `"description"` line with:

   ```json
     "description": "Mini Smart Home backend (Modules 16-20): listens to MQTT, checks the data contract, stores every message in a time-series database, and provides a history API, realtime data, commands, automation rules, schedules, and Telegram notifications, plus login with admin and viewer roles",
   ```

2. In **`backend/src/server.ts`**, replace the two comment lines at the very top with:

   ```ts
   // server.ts - the entry point of the Mini Smart Home backend v0.5 (Module 20: login, JWT in cookies, roles, and API protection,
   // on top of Module 19: realtime data, a single door for commands, automation rules, schedules, and Telegram notifications).
   ```

   Also replace the line `await setupSecurity(app);` together with its comment, because the guard is now helped by CORS and the hourglass:

   ```ts
   await setupSecurity(app); // Module 20: CORS, cookies, JWT, rate limit, and the guard on every request (BEFORE the routes)
   ```

3. Still in `server.ts`, replace the line `info: { title: "Mini Smart Home API", description: "Backend v0.4 (Module 19)", version: "0.4.0" },` with:

   ```ts
       info: {
         title: "Mini Smart Home API",
         description: "Backend v0.5 (Module 20). Every route needs a login, except the ones without a padlock. Log in first with "
           + "POST /auth/login (Try it out): the browser keeps the access cookie and sends it by itself to the other routes. "
           + "Viewer accounts can only look (GET); commands and changes are answered with 403.",
         version: "0.5.0",
       },
   ```

Save, then run `npm run check` in the second terminal (no error messages). The backend in the first terminal has already restarted by itself when `server.ts` was saved. Open `http://127.0.0.1:8080/docs`: its title now says `0.5.0`, and below it is written how to log in with **Try it out**. A teammate who opens `/docs` for the first time knows right away that the doors are locked and how to get in.

#### 8.2 A log that leaks nothing (5 minutes)

Concept 11 promised that the log only records the method, the address, the answer code, the account number, and the IP address of login attempts. Prove it with your own log.

1. In Bruno, send these in a row: **`login admin`**, **`refresh`**, **`who am i`**, **`wrong login`**, and **`logout`**. The backend log now holds a successful login, a replaced season pass, a failed login, and a logout.
2. Click inside the terminal where `npm run dev` is running, then press **Ctrl + F** (macOS: **Cmd + F**). A search box appears at the top right corner of the terminal.
3. Type the words below one at a time. Each time, the search box must say `No results`:
   - `eyJ`, the start of every JWT wristband (warm-up step 3);
   - `access=` and `session=`, the names of both cookies;
   - `@home.test`, or the end of your account's email;
   - the first eight letters of your `admin` password (not too short: three or four letters may match an ordinary word in the log by chance, for example `login` or `session`).

What **is** in the log is only lines like these (**example**; the author recorded them after the 8.5 dress rehearsal, so the times and the session number are higher than in the 8.5 log):

```text
[14:32:01] INFO: login: account 1 (admin), session 38, IP 127.0.0.1
[14:32:01] INFO: POST /auth/login -> 200 (313 ms)
[14:32:01] INFO: POST /auth/refresh -> 200 (8 ms)
[14:32:02] INFO: GET /auth/me -> 200 (6 ms)
[14:32:02] WARN: login failed: account 1 (IP 127.0.0.1)
[14:32:02] INFO: POST /auth/login -> 401 (429 ms)
[14:32:02] INFO: logout: session 38
[14:32:02] INFO: POST /auth/logout -> 200 (5 ms)
```

Accounts are named by their **number**, not by email. Even a login with an unregistered email is only written as `email not registered`, without the email that was tried (Practice 2). The IP address is recorded for login attempts on purpose, so that password guessers can be seen. The author ran the same search over **all** the backend logs from the time this module was written, 740 lines: not a single line contains `eyJ`, `access=`, `session=`, the word `cookie`, `@home.test`, the word `password`, or the content of the lab's passwords and `JWT_SECRET`.

Compare that with a **careless** log. Many examples on the internet write the whole content of every request to the log, "so that errors are easy to find". If your backend did that, every login would leave a real email and password in the log, which would then be copied to wherever that log is sent.

#### 8.3 Secret files stay out of Git (5 minutes)

In the second terminal (the `backend` folder), first go up to the `mini-smart-home` folder, because the file paths in this command are written from there. Leave `npm run dev` running in the first terminal.

```text
cd ..
git check-ignore -v backend/.env backend/bruno/.env tools/.env
```

**Expected output:**

```text
backend/.gitignore:4:.env       backend/.env
backend/bruno/.gitignore:2:.env*        backend/bruno/.env
tools/.gitignore:4:.env tools/.env
```

`git check-ignore -v` answers the question "does Git ignore this file, and because of which line?". Every line of its answer has the shape `.gitignore file:line number:pattern`, followed by the name of the file that's held back. The three `.env` files are held back by three different `.gitignore` files: the backend's, since Module 16; the Bruno collection's (made by Bruno itself); and the one in `tools` (you added its `.env` line in Practice 7). **If one of the files doesn't appear in the answer, that file isn't held back.** Add its name to the `.gitignore` in the same folder before you run any `git add`.

`.gitignore` only holds back files that Git has **never** tracked. A file that was already committed is still tracked by Git, even if its name is written in `.gitignore` later. So also check the list of files that are already tracked:

```text
git ls-files "*.env"
```

This command **writes nothing at all** if not a single `.env` file is tracked by Git. That's the right answer. If a file name does appear, for example `backend/.env`, that file was already pushed in one of the earlier modules. Follow 🚨 "`.env`, `JWT_SECRET`, or a password was already pushed to GitHub": change the secret first, then take the file out of Git with `git rm --cached`.

If you did the optional curl parts, also check their test files: `git check-ignore -v backend/login.json backend/login-wrong.json backend/cookies.txt` answers with three lines from `backend/.gitignore` (line 8 for `login*.json` and line 9 for `cookies*.txt`).

#### 8.4 GitHub keeps watch too (5 minutes)

Open the `mini-smart-home` repository on GitHub. Below the repository's name, click the **Security and quality** tab (if you don't see it, click **⋯** at the end of the row of tabs), then in the menu on the left, under **Vulnerability alerts**, click **Secret scanning**.

- **The list is empty:** no secret with a recognized shape has ever been pushed to this repository. Remember its limit (Concept 11): the `JWT_SECRET` you made will never show up here, because its shape isn't recognized, so the main defense is still `.gitignore` and the check in 8.3.
- **There's an alert**, for example **Telegram Bot Token**: that token was pushed at some point, no matter on which branch or how long ago. Treat it as leaked: get a new token with `/token` at @BotFather, write it in `backend/.env`, then close the alert. GitHub doesn't tell Telegram, so the old token only stops working once you replace it yourself.

Secret scanning is free for **public** repositories, and `mini-smart-home` has been public since Module 3. If your repository is private, that menu may not be available. Besides that, your own GitHub account turns on **push protection** by default: a push to a public repository that contains a secret with a recognized shape, for example a GitHub token, is refused before it arrives. The setting is under your profile picture → **Settings** → **Code security**, in the **Push protection for yourself** section. Leave it on.

#### 8.5 ⭐ A dress rehearsal of the three pass requirements (10 minutes)

Do this in Bruno, with the backend still running. Requirement 3 needs an empty hourglass: there must be no login within the minute before step 3. Section 8.2 has just sent two logins (`login admin` and `wrong login`), so do requirement 1 first, without hurrying. The **Expected output** boxes below come from one and the same dress rehearsal on the author's laptop, with this module's final code.

**Requirement 1 — without a login, every endpoint answers 401.**

1. Send **`logout`**, so that Bruno no longer keeps any wristband.
2. Send **`device list`**, **`lamp on`**, **`change fan threshold`**, **`Node 1 actuator state`**, and **`who am i`**. All of them are answered with **401** and `{"message":"not logged in or session expired: log in with POST /auth/login"}`, and the relay doesn't click at all. Also send **`health`**: its answer is still **200**.

With the final code, the author knocked on every door from Practice 3.4 again. The eleven requests to the data and command endpoints (including `HEAD /devices`), `GET /auth/me`, and an address that doesn't exist (`GET /not-here`) answer **401**, while `GET /health`, `HEAD /health`, and `/docs` still answer **200**. The two booths that are open now behave as designed in Practice 4: `POST /auth/refresh` without a season pass is answered with **401** by the booth itself, and `POST /auth/logout` always answers **200**. The Socket.IO hall door was already proven in Practice 7: without a wristband, its connection is refused with `not logged in`.

**Requirement 3 — the 11th login attempt within a minute is refused.**

3. Click **Send** on **`wrong login`** ten times in a row, within less than a minute. All ten are answered with `401`.
4. Right away, send **`login admin`**, whose password is right. Its answer is **`429 Too Many Requests`**:

   ```json
   {"statusCode":429,"error":"Too Many Requests","message":"too many attempts: try again in 56 seconds"}
   ```

5. Wait until `retry-after` has run out (less than a minute). The hourglass will also count the login in the next requirement.

**Requirement 2 — a `viewer` account fails to turn on the relay.**

6. Send **`login viewer`** (200), then **`lamp on`**. Its answer is **`403 Forbidden`**:

   ```json
   {"message":"viewer accounts can only look; commands and changes are admin-only"}
   ```

7. Send **`logout`** to close the dress rehearsal.

**Expected output** in the backend log (**example**, starting from requirement 3; the third to the seventh wrong logins are shortened to `…`):

```text
[14:15:13] WARN: login failed: account 1 (IP 127.0.0.1)
[14:15:13] INFO: POST /auth/login -> 401 (346 ms)
[14:15:13] WARN: login failed: account 1 (IP 127.0.0.1)
[14:15:13] INFO: POST /auth/login -> 401 (334 ms)
…
[14:15:16] WARN: login failed: account 1 (IP 127.0.0.1)
[14:15:16] INFO: POST /auth/login -> 401 (360 ms)
[14:15:16] WARN: login failed: account 1 (IP 127.0.0.1)
[14:15:16] INFO: POST /auth/login -> 401 (401 ms)
[14:15:17] WARN: login failed: account 1 (IP 127.0.0.1)
[14:15:17] INFO: POST /auth/login -> 401 (358 ms)
[14:15:17] INFO: POST /auth/login -> 429 (2 ms)
[14:16:16] INFO: login: account 2 (viewer), session 37, IP 127.0.0.1
[14:16:16] INFO: POST /auth/login -> 200 (385 ms)
[14:16:16] WARN: refused (403): account 2 (viewer) tried POST /devices/a4cf12e5b7c0/command
[14:16:16] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
[14:16:16] INFO: logout: session 37
[14:16:16] INFO: POST /auth/logout -> 200 (7 ms)
```

Each of the ten wrong logins takes about 350 ms because bcrypt is at work, while the 11th is refused within 2 ms, without checking the password. One minute later, the `viewer` login is accepted, and its command is refused by the guard within 1 ms, before it touches the broker. All three pass requirements are proven.

#### 8.6 Automatic checks (5 minutes)

In the second terminal, go into the `backend` folder again, then run these three checks:

```text
cd backend
npm run check
npm test
npm audit
```

`npm run check` finishes without an error message, and the `npm test` summary contains **`Tests  18 passed (18)`**: the 11 rules-brain tests from Module 19, plus this module's 7 security tests (4 password tests from Practice 1, that is, 2 tests of the password rules and 2 tests of the bcrypt fingerprint, and 3 season-pass tests from Practice 4). `npm audit` sends the list of installed packages to the npm server, then compares it with the list of known vulnerabilities. **Expected output:**

```text
found 0 vulnerabilities
```

This check needs the internet. If all you see is a small spinning line for more than a minute, press **Ctrl + C**, then run `npm audit --no-progress`. That option turns off the spinning animation. On the author's laptop, `npm audit` without that option got stuck again and again in the PowerShell terminal, while `npm audit --no-progress` in the same terminal finished in 7 seconds with the same result.

If `npm audit` finds a vulnerability one day, first read the package's name and how severe the problem is. `npm audit fix` only raises versions that still match `package.json`, while `npm audit fix --force` may jump to a new major version that can break your code. Don't run the second one without reading the list. For this module, every package version was chosen so that it had no known vulnerabilities at the time the module was written.

#### 8.7 Save to the branch and push to GitHub (5 minutes)

Still in the second terminal, type:

```text
cd ..
git add backend/package.json backend/package-lock.json backend/src/server.ts
git status
git commit -m "Backend v0.5.0: login, roles, and API safeguards (Module 20 Practice 8)"
git push -u origin feature/user-security
```

In the `Changes to be committed` part, `git status` names only those three files. Make sure there's no `.env` anywhere in its list. If you did Practice 6.6, `backend/command.json` may show up in the `Untracked files` part. Leave it there: that file is left out of `git add` on purpose, and it gets deleted in ➕ C.

This is the first push of the `feature/user-security` branch. `-u` records that branch on GitHub as the partner of your local branch, so after this, `git push` is enough. If GitHub refuses the push because it found a secret (push protection), **don't** force it through. The refusal message names the file and its line, and that secret must be replaced (🚨).

> ➡️ **Done with Practice 8?** Do Level 1 of the [🧩 Independent Challenges](#-independent-challenges), then steps A–E of the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home): there, all the Module 20 work is merged into `main` through the "user security" pull request, reviewed with the security checklist. Levels 2 and 3 come after that, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title of the problem that looks most like yours.

<details>
<summary><b><code>npm install</code> says <code>npm warn install-scripts … not yet covered by allowScripts</code>, <code>npm install-scripts</code> is unknown, bcrypt fails to install, or <code>npm audit</code> never finishes</b></summary>

- **A four-line `npm warn install-scripts` warning on every `npm install`** means that the approval of bcrypt's install script hasn't been recorded yet. Run `npm install-scripts approve bcrypt` in the `backend` folder (Quick Win step 2), then make sure `package.json` contains `"allowScripts": { "bcrypt@6.0.0": true }`. That approval goes into Git, so your teammates don't need to approve it again.
- **`npm install-scripts approve bcrypt` is answered with `Unknown command: "install-scripts"`**: your npm is older than 11.18 (check with `npm -v`) and doesn't know this approval yet. The bcrypt package is already fully installed, because older npm versions run install scripts without asking. Update Node.js 24 to the latest LTS release as in Module 4 Practice 3, then run `npm install-scripts approve bcrypt` again. An old Mac that's stuck on Node.js 22 can simply skip the approval step.
- **`npm install bcrypt@6.0.0` fails with many `gyp ERR!` lines**: bcrypt 6 brings no ready-made program for your laptop's system (its ready-made programs only exist for Windows, macOS, and Linux on common processors), so npm tries to compile it by itself and can't find a compiler. Use a replacement that needs no compiler, **bcryptjs**: run `npm uninstall bcrypt @types/bcrypt`, then `npm install bcryptjs@3.0.3`, and in `src/auth/password.ts` (or in `try-bcrypt.js` if you're still in the Quick Win) replace the line `import bcrypt from "bcrypt";` with `import bcrypt from "bcryptjs";`. The bcryptjs package carries no install script, so `npm install-scripts approve bcrypt` and the `allowScripts` part aren't needed. It's used the same way, and the fingerprints made by either one match each other. Because it's written in pure JavaScript, bcryptjs is a bit slower.
- **`npm install` stays silent for a long time at the end**: npm is running its security check of the packages (the audit) against the npm server. Wait until it finishes. If your network keeps dropping, that check can fail because it times out; run `npm install` again as soon as the network is stable.
- **`npm audit` (Practice 8.6) only shows a small spinning line** for more than a minute: press **Ctrl + C**, then run `npm audit --no-progress`. On the author's laptop, this finished within a few seconds, while `npm audit` without that option got stuck again and again in the same PowerShell terminal.

</details>

<details>
<summary><b>The backend, <code>npm run migrate</code>, or <code>npm run users</code> stops with <code>Setting JWT_SECRET in .env: …</code></b></summary>

Since Module 20, every backend program checks `.env` through `src/config/env.ts`, including `npm run migrate` and `npm run users`. Read the end of the message's line:

| Message | What it means | The fix |
| :--- | :--- | :--- |
| `not filled in` | the `JWT_SECRET=` line is missing, empty, or starts with `#` | make it with the command in Practice 1.1, then paste it into `.env` |
| `still holds the example from .env.example; make a new secret` | its content is still `change-this-…` | replace it with the 43 random characters from that command |
| `too short (at least 32 characters); …` | its content is shorter than 32 characters | make it again with the command; don't make one up yourself |

If there are several problems at once, all of them are written in order, for example `Setting MQTT_URL in .env: not filled in` above the `JWT_SECRET` message. Also make sure `.env` is in the `backend` folder (not in `mini-smart-home`) and has been saved.

</details>

<details>
<summary><b><code>npm run users</code> refuses, or isn't found</b></summary>

- **`failed: this terminal can't hide the password as you type; run this command in the VS Code terminal (PowerShell) or the macOS Terminal`**: you ran it in a window that can't hide what you type, for example Git Bash (mintty). Open the built-in VS Code terminal (PowerShell) or Windows Terminal, then repeat the command.
- **`npm error Missing script: "users"`**: the `"users": …` line hasn't been added to `package.json` yet (Practice 1.6), or `package.json` hasn't been saved. Check the comma at the end of that line.
- **The usage is printed, and nothing happens**: the number of arguments isn't right, for example one argument is missing, or a name with spaces isn't between double quotation marks, so it counts as two arguments. The form is `npm run users -- add <email> "<name>" <admin|viewer>`, with the name between double quotation marks if it contains spaces.
- **`that email is already registered; …`**: that account really does exist already, maybe with different capital letters. Look at `npm run users -- list`. To change its password: `npm run users -- password <email>`.
- **`failed: no password was set after 3 attempts`**: three times, the password was too short or too long, or the two typings weren't the same. Repeat the command; the messages above that line give the reason for every attempt.

</details>

<details>
<summary><b>Login always gets <code>401</code> <code>wrong email or password</code>, even though the password is right</b></summary>

- **A typo in the email**: see the list of the right emails with `npm run users -- list`. Capital and small letters don't matter.
- **`bruno/.env` doesn't match**: the setting names must be exactly `ADMIN_PASSWORD` and `VIEWER_PASSWORD`, the file must be in the `backend/bruno` folder (next to `opencollection.yml`), and it must be saved. If your password contains `#`, put the value between double quotation marks: without quotation marks, everything after the `#` counts as a comment and is thrown away.
- **Hidden spaces**: spaces at the start or the end of the password count too. Write the line again without extra spaces.
- **Still unsure?** Make a new password with `npm run users -- password <email>`, then copy that password into `bruno/.env`.

</details>

<details>
<summary><b>Login succeeds (<code>200</code>), but the next requests still get <code>401</code></b></summary>

- **The wristband is older than 15 minutes**: send `refresh`, then repeat the request (Practice 4.8).
- **Mixed addresses**: you logged in through `http://127.0.0.1:8080`, but the next requests go to `http://localhost:8080` (or the other way around). Cookies stick to the host name. In Bruno, check the `local` environment: `baseUrl` must be `http://127.0.0.1:8080`. In the browser, open `/docs` through `127.0.0.1`.
- **Bruno doesn't send cookies**: open **Preferences → General**, then make sure **Store Cookies automatically** and **Send Cookies automatically** are ticked.
- **The wristband doesn't reach `/devices`**: if you retyped `security.ts`, make sure `ACCESS_OPTIONS` contains `path: "/"`. Without it, the `access` cookie only applies to `/auth/…`.
- **The logged-in account has been deleted**: `GET /auth/me` answers `this account no longer exists`. Log in with another account.

</details>

<details>
<summary><b><code>403</code> <code>viewer accounts can only look; …</code>, but I want to change something</b></summary>

Bruno uses the wristband from the **last** login. If the last one you sent was `login viewer`, every request after it runs as `viewer`. Send `login admin`, then repeat the request. If the role was just changed with `npm run users -- role …`, send `refresh` first: the old wristband still carries the old role until it's replaced (Concept 6).

</details>

<details>
<summary><b><code>429 Too Many Requests</code> after only one wrong password</b></summary>

The hourglass counts **every** login attempt from your IP address within the last 60 seconds, including the successful ones, and including the attempts from Bruno, curl, `/docs`, and the small terminal all together. Wait as long as `retry-after` says (one minute at most), or restart the backend: the count is kept in memory, so it goes back to zero (Practice 5.6).

</details>

<details>
<summary><b>The browser says <code>blocked by CORS policy</code>, or the backend answers <code>403</code> <code>request from the page … refused</code></b></summary>

- **`blocked by CORS policy`**: that page's origin isn't in `CORS_ORIGIN`. Remember that an origin includes the port: `http://localhost:5173` and `http://localhost:5174` are two origins. Add the right origin to `CORS_ORIGIN` in `.env`, separated by a comma, then save. If you retyped `security.ts`, make sure `app.register(cors, …)` comes **before** the guard; if the order is reversed, the preflight is answered with 401, and the browser reports it as a CORS error.
- **`403` `request from the page … refused`**: a `POST` or `PUT` request came from a browser page whose origin isn't known. If that page really is yours, for example the Module 22 dashboard on another port, add its origin to `CORS_ORIGIN`. If the origin is written as `null`, the request came from an HTML file that was opened straight from a folder (its address starts with `file://`); run that page through a local server, like Vite in Module 22. Bruno, curl, and the small terminal never get this refusal.

</details>

<details>
<summary><b>The small terminal says <code>not logged in</code>, <code>.env: not found</code>, or <code>login refused</code></b></summary>

- **`can't connect yet: not logged in`** (one line, then it ends by itself): `tools/live-terminal.js` is still the Module 19 version, which never logs in. Replace its content with the code of Practice 7.4.
- **`node.exe: .env: not found`** (macOS: `node: .env: not found`): the `tools/.env` file hasn't been created yet, or the command was run from another folder. The command line must end with `tools>` (macOS: `tools %`).
- **`Fill in TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env, …`**: the file exists, but one of the settings is empty, its name has a typo, the file hasn't been saved, or the command was written without `--env-file=.env`.
- **`login refused (401). Check TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env.`**: the email or the password is wrong, or that account's password was just changed with `npm run users -- password`. Try the same pair with `login viewer` in Bruno. If the password contains `#`, put the value between double quotation marks.
- **`login refused (429). …`**: the ten login attempts were used up before the sand ran out, for example because you were just testing Practice 5. Wait a minute, then run it again.
- **`can't reach the backend yet, trying again in 5 seconds`** over and over: the backend isn't running yet, or the address in the command is wrong. The terminal keeps trying by itself.
- **`disconnected: io server disconnect` every 15 minutes**, followed by `wristband renewed (refresh)` and `connected to …`: nothing is wrong. The server really does cut the connection when the wristband expires, and the terminal renews its wristband by itself (Practice 7.5).

</details>

<details>
<summary><b><code>git check-ignore</code> doesn't list one of the <code>.env</code> files, or <code>git ls-files "*.env"</code> lists a file</b></summary>

- **`tools/.env` isn't listed**: the two lines from Practice 7.4 aren't in `tools/.gitignore` yet, or that file hasn't been saved. Add them, save, then run `git check-ignore -v` again.
- **`backend/bruno/.env` isn't listed**: the file `backend/bruno/.gitignore`, which Bruno created together with its collection in Module 16, doesn't exist or doesn't contain `.env*`. Create that file (or add the line) with this one line: `.env*`.
- **`backend/.env` isn't listed**: the `.env` line from Module 16 is missing from `backend/.gitignore`. Add it again.
- **`git ls-files "*.env"` lists a file**: that file is already tracked by Git, so `.gitignore` no longer holds it back, and its content is already on GitHub if it was ever pushed. Follow the last collapsible section of this 🚨, "`.env`, `JWT_SECRET`, or a password was already pushed to GitHub": change the secret first, then take the file out with `git rm --cached`.

</details>

<details>
<summary><b>PowerShell answers <code>415 Unsupported Media Type</code> or <code>Body cannot be empty …</code> for <code>POST /auth/logout</code> or <code>/auth/refresh</code></b></summary>

`Invoke-RestMethod` without a body writes a `content-type` header that doesn't fit: Windows PowerShell 5.1 gets `415`, and PowerShell 7 gets `400` `FST_ERR_CTP_EMPTY_JSON_BODY`. Send an empty JSON body: `-ContentType "application/json" -Body "{}"` (Practice 4.7). Bruno and `/docs` don't have this problem.

</details>

<details>
<summary><b>The bcrypt tests in <code>npm test</code> fail with <code>Test timed out in 5000ms</code></b></summary>

Vitest's default time limit is 5 seconds, while bcrypt on a busy laptop can take longer. Make sure both bcrypt tests in `src/auth/auth.test.ts` end with `}, SLOW);`, as in the code of Practice 1.9, and that the constant `SLOW` is `30_000`.

</details>

<details>
<summary><b>Forgot the <code>admin</code> account's password</b></summary>

There's no "forgot password" button, and that's on purpose: only whoever holds the server laptop and its `.env` file may manage the accounts. In a terminal in the `backend` folder, run `npm run users -- password admin@home.test` (your `admin` account's email), then type the new password twice. All the sessions of that account are revoked too, so every place that's still logged in with that account must log in again. Also update `ADMIN_PASSWORD` in `bruno/.env`.

</details>

<details>
<summary><b><code>.env</code>, <code>JWT_SECRET</code>, or a password was already pushed to GitHub</b></summary>

A secret that has ever appeared on GitHub must be treated as leaked, even if you delete its commit. The order:

1. **Change the secret first.** A new `JWT_SECRET`: make it with the command of Practice 1.1, save it in `.env`, then restart the backend; every old wristband is invalid at once. An account password: `npm run users -- password <email>`. The Telegram bot token: get a new one with `/token` at @BotFather. The database password: change it in the container, then in `DATABASE_URL`.
2. **Take the file out of Git** without deleting it from your laptop: in the `backend` folder, run `git rm --cached .env` (or `git rm --cached bruno/.env`; for `tools/.env`, run `git rm --cached .env` in the `tools` folder), make sure its name is in `.gitignore`, then commit and push.
3. **Cleaning the history**: reading about it in 🔬 is enough; after step 1, the old secret in the history is useless to anyone.

</details>

## 🔬 Technical Deep Dive (optional)

This section is for the curious. Nothing here is required, and the next modules don't depend on it.

<details>
<summary><b>OWASP Top 10:2025 for beginners</b></summary>

**OWASP** (Open Worldwide Application Security Project) is an open community that, among other things, publishes a list of the **ten security risks found most often in web applications**. This list often comes up in job interviews. Its newest version is the **OWASP Top 10:2025**. Here are all ten, linked to Mini Smart Home (the right column is the author's interpretation, not OWASP's text):

| Code | Its official name | An example in Mini Smart Home |
| :--- | :--- | :--- |
| A01 | Broken Access Control | A `viewer` account can turn on the relay, or a route was forgotten and left unlocked. This is the heart of this module: a guard that's locked by default, 401, and 403. |
| A02 | Security Misconfiguration | CORS with `*` and cookies, `/docs` opened on the internet without a second thought, `HOST=0.0.0.0` before there's a login, error messages that leak details about the server. |
| A03 | Software Supply Chain Failures | npm packages that have been tampered with or are outdated. The habits since Module 16 help: exact versions, `package-lock.json`, and `npm audit`. |
| A04 | Cryptographic Failures | Passwords stored as they are or with a fast fingerprint such as SHA-256, a short `JWT_SECRET`, or no HTTPS on the internet (Phase 5). |
| A05 | Injection | SQL put together by joining pieces of text. Already prevented since Module 17 with the parameters `$1`, `$2`. XSS in the dashboard comes up in Module 22. |
| A06 | Insecure Design | A login door with no limit on attempts, or a system that was built without ever thinking about its threat model. |
| A07 | Authentication Failures | Weak passwords are accepted, wristbands never expire, or a logout that doesn't revoke anything. |
| A08 | Software or Data Integrity Failures | Over-the-air firmware updates without a check that they're genuine (Module 28), or a JWT that's accepted without checking its signature. |
| A09 | Security Logging and Alerting Failures | Failed logins and 429 answers are never recorded. On the other hand, passwords and tokens must not end up in the record either. |
| A10 | Mishandling of Exceptional Conditions | An unhandled error kills the server, or a role check that throws an error and is then simply skipped ("failing open"). |

Compared with the 2021 version, A10 is a new category, A03 was widened from "vulnerable and outdated components" to the whole supply chain, and SSRF (Server-Side Request Forgery) is now part of A01. For IoT devices themselves, OWASP has a separate list, the **OWASP IoT Top 10**, which is covered in Module 21.

</details>

<details>
<summary><b>"Sign in with Google": OAuth 2.0 and OpenID Connect</b></summary>

Many apps offer a "Sign in with Google" button. Behind it are two standards: **OAuth 2.0** (how an app asks for permission on a user's behalf) and **OpenID Connect**, or OIDC (a layer on top of OAuth that answers "who is this person?").

Imagine **a building's receptionist who phones the office that issues national ID cards**. The receptionist doesn't keep your ID card's data; they just ask, "Is the person in front of me really the owner of ID card number such-and-such?" If the ID office answers "yes", the receptionist gives you a visitor card **made by the building itself**. Google's official flow for servers has six steps:

1. The backend makes a random **anti-forgery token**, called the state.
2. The browser is sent to a Google page. The user logs in there, and the password never passes through your backend.
3. Google sends the browser back to the registered **redirect URI**, carrying a code and that state. The backend makes sure the state is the same.
4. The backend trades that code, directly with Google's server, for an **ID token**.
5. The backend reads the identity from the ID token. What it uses is `sub` (the Google account number), not the email, because an email can change.
6. The backend **creates its own session**: a wristband in the `access` cookie and a season pass, exactly as in this module.

Step 6 is the important lesson: signing in with Google **doesn't replace** what you built this week. Google only replaces the password check. The wristband, the season pass, the guard, and the roles still belong to your backend. This module doesn't practice it, because it needs a Google Cloud account and project, the flow is easiest to test from the frontend (Module 22), and a local smart home should still open when the internet is down. If you build it one day, follow **RFC 9700** (the best current practice for OAuth 2.0 security, January 2025): use PKCE (Proof Key for Code Exchange), and the redirect URI must be HTTPS, except for `localhost`.

</details>

<details>
<summary><b>Two-step verification (2FA) with a six-digit code</b></summary>

**Two-step verification** (2FA, two-factor authentication) asks for two proofs of different kinds: something you **know** (a password) and something you **have** (a phone). The most common one is a six-digit code from an app such as Google Authenticator, Microsoft Authenticator, or Aegis. Its standard is called **TOTP** (Time-based One-Time Password, RFC 6238).

It works like **two twin watches that hold the same secret recipe**. When 2FA is turned on, the server and the app on the phone share one secret key, usually through a QR code. Every **30 seconds**, both of them compute a six-digit number from "the secret key + the current time" with HMAC, a close relative of the wristband's signature in warm-up step 3. If the number you type matches the server's calculation, you're holding that phone. Nothing is sent over the internet during the calculation, so the app keeps working in airplane mode, as long as the phone's clock is right.

According to OWASP, layered verification like this is the best defense against most password attacks. But there are some notes:

- **Codes can be phished**: a fake site can ask for the code and then use it within 30 seconds.
- **A lost phone means being locked out.** That's why, when 2FA is turned on, the user gets a few one-time **recovery codes** to keep in a safe place.
- An even stronger step is a **passkey**, which fake sites can't phish.

NIST's guidelines also tell a password without a second factor apart from one with it: a password that's the only factor must have at least 15 characters, while a password that comes with a second factor only needs at least 8 characters.

</details>

<details>
<summary><b>bcrypt, Argon2id, and how to raise the cost later</b></summary>

The bcrypt algorithm was born in 1999 and is still very widely used. OWASP's password storage guide now puts **Argon2id** first (with at least 19 MiB of memory, 2 iterations, 1 degree of parallelism), then scrypt, and names bcrypt as an option for "legacy systems", on the condition of a cost of at least 10 and passwords of at most 72 bytes. The advantage of Argon2id: it uses **a lot of memory**, so a guesser's graphics card can't run thousands of guesses at once as easily as with bcrypt.

This module still uses bcrypt because the Syllabus asks for it, its package brings ready-made programs for Windows and macOS (no compiler needed), and with a cost of 12 it's still more than enough for a smart home.

Laptops get faster every year, so the cost should be raised one day. The old fingerprints don't need to be thrown away. A bcrypt text stores its own cost (`$2b$12$…`), so here's how: when someone logs in successfully, check the cost of their fingerprint; if it's still lower than the new cost, compute the fingerprint again from the password they just typed, then store it. Within a few weeks, every active account has moved to the new cost without anyone noticing.

</details>

<details>
<summary><b>A per-email attempt limit: why it isn't used</b></summary>

Backend v0.5's hourglass counts per **IP address**. A guesser who has many IP addresses, for example a network of computers that have been broken into, can try 10 passwords per minute from **each** of its addresses. That's why OWASP's authentication guide recommends a failure counter that's attached to the **account**, not to the IP address.

The author tried a per-email limit on the lab laptop. The result showed its dark side: anyone who knows the `admin` account's email can **lock the owner of that account out** by getting it wrong on purpose 10 times every minute. This is called a denial-of-service attack on the account. That's why big systems use a mix of gentler methods:

- **Pauses that get longer and longer** for an account that keeps failing (1 second, 2 seconds, 4 seconds, …), instead of a total lockout.
- **An extra challenge**, such as a CAPTCHA, after a few failures.
- **A notice to the account's owner** when there are many failed attempts.
- **Two-step verification**, so that a password that was guessed right isn't enough on its own.

For a backend on a laptop that can only be knocked on from `127.0.0.1`, a per-IP limit already matches the threat. This choice is revisited when the backend moves to the internet in Phase 5.

</details>

<details>
<summary><b>Extra layers against CSRF</b></summary>

Backend v0.5 holds back CSRF with three layers: `SameSite=Strict`, the `Origin` check, and CORS. You'll often come across two other layers in tutorials:

- **Closing the plain-text door.** An ordinary HTML form can only send three kinds of content: `application/x-www-form-urlencoded`, `multipart/form-data`, and `text/plain`. By default, Fastify refuses the first two, but **accepts `text/plain`**. Because the Mini Smart Home API only speaks JSON, one line, `app.removeContentTypeParser("text/plain")`, makes plain-text content get `415 Unsupported Media Type`. This layer isn't in the main code, because a script on another page can still send a `POST` without a body and without a `content-type` header, and routes that really need no body, for example `POST /rules/:id/run`, accept requests like that. From another site, such a request is already held back by `SameSite=Strict`. But from a page on the same site, for example `http://127.0.0.1:5500`, only the `Origin` check holds it back.
- **A CSRF token.** The server gives the page a random token that must be sent along in a request header, for example `x-csrf-token`. A foreign page can't read that token, so its requests are refused. This adds work to every form and every client. For Mini Smart Home, `SameSite=Strict` plus the `Origin` check already held back every attempt in the author's lab. But OWASP's CSRF guide calls `SameSite` only an extra layer, unless all of its conditions are met, including "not sharing a site with services you don't fully control". That's why big systems with many subdomains or classic HTML forms still use CSRF tokens.

</details>

<details>
<summary><b>Taking a wristband back before it expires: a JWT blocklist</b></summary>

A wristband (JWT) can't be taken back before its `exp`. If 15 minutes is still too long, for example because you want a deleted account to be locked out right away, there are two ways:

1. **A blocklist.** Keep the session numbers (`sid`) that have been revoked, and have the guard check them on every request. That list only needs to hold the sessions revoked less than 15 minutes ago, because older wristbands have already expired by themselves.
2. **Check the session on every request.** The guard looks up the `sessions` row for every wristband. This means the wristband check is no longer "without the database".

Both ways trade speed for certainty: every request now opens the database or Redis. For Mini Smart Home, a wristband life of 15 minutes is a common compromise. If you want to try it, the first way can be built with a `Set` in memory, like the list of open doors in the warm-up.

</details>

<details>
<summary><b>Testing the attempt limit automatically with Bruno</b></summary>

Clicking **Send** eleven times is enough for one test. If you want a test that can be repeated with one command, use the **Bruno CLI** from Module 16's 🔬. The option `--iteration-count 11` runs the same request eleven times in a row. The Bruno CLI runs from the collection folder `backend/bruno` in the second terminal (the backend keeps running in the first terminal). If the command line ends with `backend>` (macOS: `backend %`), as during Practice 5, go in with `cd bruno` and come back afterward with `cd ..`. If it still says `mini-smart-home>` (macOS: `mini-smart-home %`), for example after Practice 8.7, go in with `cd backend/bruno` and come back with `cd ../..`. The command:

```text
npx @usebruno/cli@4.2.1 run "wrong login.yml" --env local --iteration-count 11
```

**Expected output** (**example**, shortened):

```text
Iteration: 1

wrong login (401 Unauthorized) - 1655 ms
Assertions
   ✓ res.status: eq 401
   ✓ res.body.message: eq wrong email or password
Ran all requests - 1655 ms

…

Iteration: 11

wrong login (429 Too Many Requests) - 8 ms
Assertions
   ✕ res.status: eq 401
      expected 429 to equal 401
   ✕ res.body.message: eq wrong email or password
      expected 'too many attempts: try again in 56 se…' to equal 'wrong email or password'
Ran all requests - 8 ms
```

The summary table at the end says `11 (10 Passed, 1 Failed)`. The 11th iteration fails because the Asserts of `wrong login` expect 401 and the text `wrong email or password`, while the answer is 429 and its `message` holds the hourglass's text (Bruno shortens it with `…`); that failure is exactly the proof that the hourglass works. For an automatic test that's all green, make a separate request with the Assert `res.status` `eq` `429`. Bruno also provides `bru.runner.setNextRequest()` in the **Script** tab to control the order and the repetition of requests in the **Runner**; see [Bruno's script documentation](https://docs.usebruno.com/testing/script/javascript-reference). Remember, the hourglass counts per IP address: after this command, wait a minute before you log in again.

</details>

<details>
<summary><b>Cleaning secrets out of the Git history</b></summary>

If a secret was already pushed, the first step is always **to change the secret** (Concept 11). GitHub's own documentation says that rewriting the Git history is often not worth the trouble, because a secret that has been changed is no longer useful to anyone.

If you still want to remove it from the history, for example because that file also holds personal data, the tool GitHub recommends is **`git-filter-repo`** (version 2.47 or newer) with the `--sensitive-data-removal` option, followed by a force push. Its side effects are big: every commit hash changes, other people's clones can bring the old history back, forks keep their copies, and open pull requests must be closed first. That's why this section is only for reading. Prevention is much cheaper: `.gitignore` from the start, and a look at the **Files changed** tab before you merge.

</details>

## 🧩 Independent Challenges

Level 1 can be done through Bruno and the terminal alone, without changing code. Levels 2 and 3 change the backend's code, so do them **after** ➕ D (once the `feature/user-security` branch has been merged), on a new branch from `main`, as in Modules 16–19: `git switch main`, `git pull`, then `git switch -c feature/<challenge-name>`. Levels 1 and 2 have answer keys; the complete content of the Level 2 key files is in [`code/challenges/key/`](code/challenges/key/).

### Level 1 — The wristband that finds out late (20 minutes)

Concept 6 says that a role change only takes effect after the wristband is replaced. Prove it yourself, with the backend running and Node 1 connected (for the laptop path, the Module 19 simulator as in Practice 3), because step 4 needs an `ack` answer:

1. In Bruno, send `login viewer`, then `lamp on`. The answer is **403**.
2. In the second terminal, first go into the `backend` folder (after Practice 8.7, that terminal is still in the `mini-smart-home` folder, so type `cd backend`), then raise that account's role with `npm run users -- role viewer@home.test admin`.
3. Send `lamp on` again **without** logging in again. What's the answer, and why?
4. Send `refresh`, then `lamp on` once more. What has changed? After that, send `lamp off` so that the lamp is off again.
5. Set the role back (`npm run users -- role viewer@home.test viewer`), then send `refresh` and `lamp on`. Make sure the answer is **403** again.

<details>
<summary><b>Level 1 answer key</b></summary>

1. `login viewer` is answered with 200, and `lamp on` with **403** `{"message":"viewer accounts can only look; commands and changes are admin-only"}`, as in Practice 3.5.
2. The terminal answers `viewer@home.test is now admin (takes effect within 15 minutes, when its wristband is renewed)`. That message already gives the answer away.
3. **Still 403.** The guard doesn't ask the database. It only reads the wristband, and the wristband you're holding was printed when you logged in at step 1, with `"role":"viewer"` inside it. That wristband stays valid until its `exp`, 15 minutes at most. Try sending `who am i` between steps 3 and 4: its answer already says `"role":"admin"`, because that booth reads the `users` table, while the guard still reads the old wristband.
4. The refresh booth reads your account again from the `users` table (Concept 7), then prints a new wristband with `"role":"admin"`. This time `lamp on` is answered with **200**, and the lamp relay goes "click". Also send `lamp off` before you go on, because soon this account may no longer give commands.
5. After the role is set back and the wristband is renewed, `lamp on` is answered with **403** again.

The backend log of the author's test (**example**; the lines of `who am i` and `lamp off` aren't shown):

```text
[15:37:31] INFO: login: account 2 (viewer), session 43, IP 127.0.0.1
[15:37:31] INFO: POST /auth/login -> 200 (869 ms)
[15:37:35] WARN: refused (403): account 2 (viewer) tried POST /devices/a4cf12e5b7c0/command
[15:37:35] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (7 ms)
[15:39:11] WARN: refused (403): account 2 (viewer) tried POST /devices/a4cf12e5b7c0/command
[15:39:11] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
[15:39:50] INFO: POST /auth/refresh -> 200 (115 ms)
[15:39:52] INFO: command c-20261022-083952-2 (api) to a4cf12e5b7c0: lamp = true, ack ok=true in 34 ms
[15:39:52] INFO: POST /devices/a4cf12e5b7c0/command -> 200 (54 ms)
[15:41:41] INFO: POST /auth/refresh -> 200 (72 ms)
[15:41:43] WARN: refused (403): account 2 (viewer) tried POST /devices/a4cf12e5b7c0/command
[15:41:43] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
```

The second `-> 403` refusal happens **after** the role in the database was changed. That's "the wristband that finds out late". The opposite is more important: an account that's **lowered** from `admin` to `viewer` can still give commands until its wristband is renewed, 15 minutes at most. That's the price of a wristband that's checked without the database (Concept 7). If that account must be locked out completely, also change its password (`npm run users -- password …`), so that its season pass is revoked too. The wristband it's holding stays valid until it runs out, 15 minutes at most; how to take a wristband back sooner is covered in 🔬 "Taking a wristband back before it expires: a JWT blocklist".

</details>

### Level 2 — Log out everywhere (45–60 minutes)

Your phone is lost, and you're still logged in on it. Add a route **`POST /auth/logout-all`** that revokes **every** session of the account that's logged in, cuts all its Socket.IO connections, empties both cookies, then answers `{"message":"all sessions of this account have been revoked","count":<how many sessions>}`.

Hints:

- In `src/db/users.ts`, write a function `deleteAllSessions(userId)` that deletes every `sessions` row of that account with `DELETE … RETURNING id`, then returns the list of their numbers.
- In `src/routes/auth.ts`, write the route. The account number is in `req.user.sub` (as text, so convert it with `Number()`). Call `disconnectSession()` for every session number, then empty the cookies as `POST /auth/logout` does.
- This route is **not** one of the open doors, because only someone who is logged in may use it. But a `viewer` account must also be allowed to log out of all its devices, while the guard refuses a `POST` from a `viewer`. Add a small exception to the guard for this route.
- Test it with two sessions at once: log in with Bruno **and** run the small terminal with the same account. After `logout-all` from Bruno, the small terminal must be cut off right away, and a refresh from either place is answered with 401. The small terminal then logs in again by itself with the password in `tools/.env` and connects again with a new session. That's normal, because `logout-all` revokes sessions, not passwords.

<details>
<summary><b>Level 2 answer key</b></summary>

The complete content of the three key files is in [`code/challenges/key/backend/`](code/challenges/key/backend/): `src/db/users.ts`, `src/routes/auth.ts`, and `src/auth/security.ts`, plus the Bruno request `bruno/logout all.yml`. The important parts:

- **`deleteAllSessions()` needs only one query:** `DELETE FROM sessions WHERE user_id = $1 RETURNING id`. `RETURNING id` returns the number of every deleted session, and `Number()` turns it into a number, because a `bigint` comes from pg as text.
- **The order in the route matters:** delete the sessions first, and only then call `disconnectSession()` for every number. A client that's cut off usually tries a refresh right away, and by then its season pass must already be gone.
- **The guard's exception is only one line**, written **after** the wristband is checked and **before** the role check:

  ```ts
  if (`${req.method} ${url}` === "POST /auth/logout-all") return;
  ```

  Because it sits there, a guest without a wristband still gets 401, a foreign page still gets 403 (the origin check is at the very top), and every other `POST` from a `viewer` account still gets 403. This route also doesn't get `OPEN`, so it has a padlock in `/docs`.

**Expected output** (**example**). `login viewer` in Bruno, the small terminal running with the same account, then `logout all`:

```json
{"message":"all sessions of this account have been revoked","count":2}
```

In the small terminal:

```text
[4:00:06 PM] disconnected: io server disconnect
[4:00:07 PM] refresh refused (401), logging in again
[4:00:08 PM] logged in as viewer@home.test
[4:00:08 PM] connected to http://127.0.0.1:8080 (websocket)
[4:00:08 PM] following a4cf12e5b7c0
```

In the backend log:

```text
[16:00:06] INFO: realtime client disconnected: WxF1am_8GbdzD58lAAAA (server namespace disconnect)
[16:00:06] INFO: logout all: account 2, 2 session(s) revoked
[16:00:06] INFO: POST /auth/logout-all -> 200 (67 ms)
[16:00:07] INFO: POST /auth/refresh -> 401 (123 ms)
[16:00:08] INFO: login: account 2 (viewer), session 46, IP 127.0.0.1
[16:00:08] INFO: POST /auth/login -> 200 (1349 ms)
```

Afterward, `refresh` in Bruno is answered with 401 `{"message":"not logged in: no session cookie"}`, because both cookies have been emptied. An old season pass that someone managed to copy is answered with 401 `session no longer valid: please log in again`. The `admin` account can use this route too: with one session, the answer says `"count":1`.

Look at the small terminal above. Its connection really was cut, and its refresh was refused, but it logged in again right away, because its password is stored in `tools/.env`. So logging out everywhere revokes **sessions**, not **passwords**. If the lost phone holds your password, or you suspect that someone knows it, change the password with `npm run users -- password <email>`: every session is revoked too, and the old password can't be used to log in anymore. The limit is the same as for an ordinary logout (Concept 7): the wristband that device is holding is still valid for 15 minutes at most, including for connecting to Socket.IO again (Practice 7.6). After that, its refresh is refused and its login fails, so that device is really locked out.

</details>

### Level 3 — Who pressed the button? (60–90 minutes)

Since Module 19, the `commands` table records the **source** of every command (`api`, `rule`, `schedule`, or `telegram`), but not yet **who** pressed the button. Make that record:

- Write a migration **`009_user_in_commands.sql`** that adds a `user_id` column to the `commands` table, pointing to `users (id)` with `ON DELETE SET NULL`, so that the command history isn't lost when an account is deleted.
- Give `issueCommand()` one optional parameter for the account number, then fill it in from `req.user.sub` in the `POST /devices/:id/command` route. Commands from rules, schedules, and Telegram stay without an account number.
- Write a query that answers "who turned on the lamp today, and at what time?", with the account's name from the `users` table.

Number `009` is used by this challenge. If you skip it, that's fine: Module 21's main migration still has the number `010`, and `npm run migrate` applies the files in the order of their numbers, even when a number is missing. Level 3 has no answer key on purpose; compare your result with Concept 11 (only the data you need) and with your own pull request.

## ➕ Add-on to "Mini Smart Home"

This week, Mini Smart Home is **locked for people**. Only registered accounts can get in, their passwords are stored as fingerprints, the 15-minute wristband and its season pass live in `HttpOnly` cookies, the guard watches every HTTP door, the Socket.IO hall door takes the same wristband, password guessers are held back by the hourglass, and foreign pages can't ride along on your login.

![Project diagram of Mini Smart Home after Module 20: the house is now locked for people, that is, accounts, login, roles, and API protection; a dashed line means optional, retired, or coming later. Top row, from the left: Node 2 "Garden" v1.0.0 with its 18650 battery, unchanged, sends over ESP-NOW to Node 1 "Home" v1.5.0, which has the local fan safety, offline mode, and config into NVS from Module 19, and is unchanged this week. Node 1 sends MQTT to the Raspberry Pi gateway at 192.168.1.37, which holds Mosquitto, the MQTT broker that isn't locked yet, and Node-RED with the dashboard, the Garden card, and the RS-485 Sensor group, while the fan automation stays retired since Module 16. The Pi is connected to the phone (Node-RED and Telegram); Telegram, with alerts and /status, is unchanged. Middle left, the dashed card of the Module 19 simulator (optional), stand-ins for real devices, f00d00000001 to f00d00000010, unchanged because the devices and the broker are only locked in Module 21, with a dashed MQTT line to the broker. Below it, an honest-note box with four items: the backend is still only at 127.0.0.1 (the laptop); a wristband that was already copied stays valid, 15 minutes at most; the hourglass count is kept in memory and is back at zero when the backend restarts; MQTT and the broker aren't locked yet (Module 21). The big Laptop box, the backend at 127.0.0.1:8080, receives msh/# from the broker, sends cmd (set, config), and is connected to Telegram over the internet, outgoing HTTPS with long polling. Inside it, the green backend v0.5 box, locked for people: Fastify and TypeScript with data contract 1.3, then what's new: accounts and login with bcrypt fingerprints; JWT in an httpOnly cookie; refresh tokens and the sessions table; a 401 and 403 guard; the admin and viewer roles; a login rate limit of 10 per minute; CORS and the origin check; Socket.IO locked too; a .env checked by Zod; and Vitest with 18 tests, including 7 new security tests; plus what stays: realtime, rules, schedules, the Telegram bot, and 0.5.0 in /docs. The API list has two parts. Open without a login: GET /health, GET /docs, and the new POST /auth/login, POST /auth/refresh, and POST /auth/logout. Needing a login, marked with a padlock, for everything else: the new GET /auth/me, GET /devices, GET /devices/:id/latest, /vitals, /readings, and /state, GET /rules, POST /devices/:id/command, POST /rules, PUT /rules/:id, and POST /rules/:id/run; POST and PUT for admin only. The backend is connected through pg (pool) to the blue Docker Desktop box, the smarthome-db container: PostgreSQL 17 and TimescaleDB 2.30.2, the smarthome-data volume, counter 127.0.0.1:5432; the new sessions table, holding the SHA-256 of the season passes, which last 7 days; users plus password_hash and password_changed_at; the example accounts admin@home.test (admin) and viewer@home.test (viewer); and, unchanged, readings, events, commands, rules, and the clerks. On the right, the backend's guests: the small terminal, which logs in with the viewer account from tools/.env, then uses the same cookie in the Socket.IO handshake, and receives live data; Bruno, which stores cookies automatically, with 6 new requests and the passwords in bruno/.env, which isn't in Git; and the browser, which opens /docs and uses Try it out on POST /auth/login first, after which the browser sends the cookie by itself; a note: all of them carry the access cookie, that is, the wristband. For the database: DBeaver via counter 5432, psql via docker exec, and the backup/ folder with the pg_dump files from Module 18. Bottom left, the GitHub mini-smart-home card: the feature/user-security branch becomes a pull request to main, and the "user security" pull request is reviewed with the security checklist, then merged. The new or changed files: backend/package.json, plus 5 packages, allowScripts for bcrypt, the users script, and version 0.5.0; backend/migrations/008_login_and_sessions.sql, new; backend/src/routes/auth.ts, new; backend/src/auth/, new, holding password.ts, token.ts, security.ts, and auth.test.ts; backend/src/db/users.ts and manage-users.ts, new; backend/src/services/realtime.ts, locked; backend/src/config/env.ts and .env.example, with Zod plus JWT_SECRET and CORS_ORIGIN; backend/src/routes/health.ts, /health open; backend/.gitignore, plus the curl test file patterns login star .json and cookies star .txt; backend/src/server.ts, security before the routes, padlocks in /docs, and version 0.5.0; backend/bruno/, plus 6 requests; backend/README.md, v0.5; tools/live-terminal.js, login with the viewer account; tools/.env.example, new; tools/.gitignore, plus .env; and .github/pull_request_template.md, plus the Security checklist. A box with a padlock: never in Git: backend/.env, backend/bruno/.env, tools/.env, and the test files login star .json and cookies star .txt. Bottom right, three dashed coming-next cards: Module 21, device keys, that is, API keys, provisioning, and broker access control (ACL); Module 22, a React dashboard that starts with a minimal login form, with the Vite origin 5173 already in CORS_ORIGIN; Phase 5, HTTPS and Secure cookies when the backend is opened to the internet.](assets/project-diagram-module-20.png)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder and its terminal) and a **browser** that's already signed in to GitHub.
>
> ⭐ **Required** — step D merges all the Module 20 work into `main`, and Module 21 starts from there.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `backend/package.json`, `package-lock.json` | the bcrypt (with `allowScripts`), @fastify/cookie, @fastify/jwt, @fastify/rate-limit, and @fastify/cors packages; `@types/bcrypt` as a development tool; the `users` script; version 0.5.0 (Quick Win, Practices 1, 2, 5, 6, and 8) |
| `backend/src/config/env.ts`, `.env.example` | the whole `.env` is checked by Zod at startup, plus the `JWT_SECRET` and `CORS_ORIGIN` settings (Practices 1 and 6) |
| `backend/migrations/008_login_and_sessions.sql` | **new**: password fingerprints in the `users` table, and the `sessions` table for season passes (Practice 1) |
| `backend/src/auth/password.ts`, `token.ts`, `auth.test.ts` | **new**: password fingerprints, season passes, and 7 unit tests (Practices 1, 2, and 4) |
| `backend/src/auth/security.ts` | **new**: cookies, the JWT, the guard, the hourglass, CORS, and the origin check (Practices 2, 3, 5, and 6) |
| `backend/src/db/users.ts`, `manage-users.ts` | **new**: accounts and sessions in the database, and the `npm run users` command (Practices 1–4) |
| `backend/src/routes/auth.ts` | **new**: `POST /auth/login`, `/auth/refresh`, `/auth/logout`, and `GET /auth/me` (Practices 2–5 and 7) |
| `backend/src/routes/health.ts` | `/health` stays open, without a padlock in `/docs` (Practice 3) |
| `backend/src/services/realtime.ts` | Socket.IO locked too (Practice 7) |
| `backend/src/server.ts` | security set up before the routes, padlocks in `/docs`, Socket.IO locked, and version 0.5.0 (Practices 2, 3, 7, and 8) |
| `backend/.gitignore` | the curl test files `login*.json` and `cookies*.txt` (Practice 2) |
| `backend/bruno/` | six new requests: `login admin`, `login viewer`, `wrong login`, `who am i`, `refresh`, and `logout` (Practices 2–4); their passwords are in `bruno/.env`, which isn't in Git |
| `tools/live-terminal.js`, `.env.example`, `.gitignore` | the small terminal that logs in with a `viewer` account; `tools/.env` isn't in Git (Practice 7) |
| `backend/README.md` | how to run and use backend v0.5 (step A) |
| `.github/pull_request_template.md` | the **Security checklist** section (step B) |

### A. Update `backend/README.md`

A teammate who clones your repository now needs to know things that can't be guessed from the code: `JWT_SECRET` must be filled in before anything runs, the first accounts are created with `npm run users`, and almost every route needs a login. Replace the content of `backend/README.md` with:

````markdown
# Mini Smart Home Backend

Backend v0.5 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.3 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database with the TimescaleDB add-on (through Docker), and provides a documented API. The reading history can be requested raw or already summarized per 15 minutes, per hour, or per day. Since Module 19, readings also flow live through Socket.IO, every command goes through one door (with the desired and the reported state), automation rules and schedules are stored in the database and can be changed through the API without restarting the server, every important event is recorded, and alerts are sent through Telegram. Since Module 20, the API and Socket.IO are **locked**: guests must log in first, `viewer` accounts can only look, login attempts are limited, and other web pages can't make the server act on a user's behalf.

## How to run it

1. Install Node.js 24 LTS and Docker Desktop.
2. Start the database, just once (replace `change-this-password` with your password; use only letters, digits, and hyphens):

   ```text
   docker run -d --name smarthome-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=change-this-password -e POSTGRES_DB=smarthome -e TIMESCALEDB_TELEMETRY=off -v smarthome-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env`, then fill in `MQTT_URL` (the broker's address) and the database password in `DATABASE_URL`.
5. Make the JWT signing key with this command, then paste the result (43 random characters) into `JWT_SECRET` in `.env`. This step is required **before** the next ones: the server, `npm run migrate`, and `npm run users` refuse to run when `JWT_SECRET` is empty, shorter than 32 characters, or still holds the example.

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

6. Create the tables with `npm run migrate`.
7. The summary clerk only summarizes the last 3 days again. Older history that arrives all at once (readings that were there before migration `003`, the practice data from `npm run seed-history`, or the load test below) only gets into the hourly summary book when it is summarized **once** with this command, after the data is in:

   ```text
   docker exec smarthome-db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', NULL, now() - INTERVAL '1 hour');"
   ```

   Don't repeat this command after retention (migration `004`) has dropped old data: a `NULL` window also deletes the old summaries whose raw readings have already been dropped.
8. Create the first accounts: one `admin` and (preferably) one `viewer`. The password is asked for twice and only shows up as `*`; run it in the VS Code terminal (PowerShell) or the macOS Terminal, not in a Git Bash window.

   ```text
   npm run users -- add admin@home.test "Home Admin" admin
   npm run users -- add viewer@home.test "Home Guest" viewer
   ```

9. (Optional) For Telegram alerts, fill in `TELEGRAM_BOT_TOKEN` (the token from @BotFather) and `TELEGRAM_CHAT_ID` (the number the bot answers when you send `/start`) in `.env`. Empty = Telegram notifications off. That token is a secret, like a password.
10. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`. To try the routes with a padlock there, log in first with **Try it out** on `POST /auth/login`; the browser keeps the cookie and sends it by itself to the other routes (the **Authorize** button isn't used).

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code or `.env` is saved |
| `npm start` | runs the server without automatic restarts; **Ctrl + C** stops it gracefully (on Windows, `npm run dev` + **Ctrl + C** kills the server at once) |
| `npm run check` | checks the TypeScript types, test files included (run it before every commit) |
| `npm test` | runs the unit tests of the rules engine (`src/rules/*.test.ts`) and of the login (`src/auth/*.test.ts`) with Vitest |
| `npm run migrate` | runs the new SQL files in the `migrations/` folder (safe to repeat) |
| `npm run seed-history` | fills in 7 days of practice data for the practice devices `f00d00000001` and `f00d00000002` |
| `npm run users -- add <email> "<name>" <admin\|viewer>` | creates an account; the password is asked for and only shows up as `*` (at least 15 characters, at most 72 bytes) |
| `npm run users -- password <email>` | changes the password; all sessions of that account are revoked (it must log in again) |
| `npm run users -- role <email> <admin\|viewer>` | changes the role (takes effect within 15 minutes, when its wristband is renewed) |
| `npm run users -- delete <email>` | deletes the account together with all its sessions |
| `npm run users -- list` | shows every account (without the password fingerprints) |

For a load test, `test/load-1-million.sql` loads 1,036,801 fake readings (one every 10 seconds for 120 days) for the test device `beef00000001`. Run it from this folder:

```text
docker cp test/load-1-million.sql smarthome-db:/tmp/load-1-million.sql
docker exec smarthome-db psql -U postgres -d smarthome -f /tmp/load-1-million.sql
```

## Login and protection

- **Accounts** are only made from the terminal (`npm run users`); there is no sign-up route in the API. The database stores the password fingerprint (bcrypt, cost 12), not the password.
- **`POST /auth/login`** answers with two `HttpOnly; SameSite=Strict` cookies: `access` (a 15-minute JWT, `Path=/`) and `session` (a 7-day refresh token, `Path=/auth`; the database only stores its SHA-256). A wrong email and a wrong password get the same answer: `401 {"message":"wrong email or password"}`.
- **Wristband ran out?** `POST /auth/refresh` swaps the `session` cookie for a new wristband and a new season pass (rotation). An old season pass that is used again 30 seconds or more after it was replaced counts as stolen: its session is revoked. **`POST /auth/logout`** deletes the session, empties both cookies, and cuts that session's Socket.IO connections.
- **Open routes** (no login): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET`/`HEAD /health`, and `/docs`. Every other route, including new routes and URLs that don't exist, answers guests with `401`.
- **Roles**: `admin` may do everything; `viewer` only `GET`/`HEAD` (anything else gets `403`).
- **Rate limit**: at most 10 `POST /auth/login` attempts per minute from the same IP address; the 11th attempt gets `429` with a `retry-after` header. The counts live in memory: a server restart = starting from zero.
- **CORS and the page's origin**: web pages in `CORS_ORIGIN` (`.env`, default `http://localhost:5173,http://127.0.0.1:5173` for Module 22) may call the API from a browser with cookies. Requests other than `GET`/`HEAD` that carry an `Origin` header from another page are refused with `403`; curl, Bruno, and Node don't send `Origin`, so they aren't affected.
- **Bruno**: the `bruno/` collection has the requests `login admin`, `login viewer`, `wrong login`, `who am i`, `refresh`, and `logout`. Their passwords are read from `bruno/.env` (not in Git) holding `ADMIN_PASSWORD=…` and `VIEWER_PASSWORD=…`. Send `login admin` or `login viewer` first; the other requests use its cookie automatically.

## API

| Route | Who | What it does |
| :--- | :--- | :--- |
| `POST /auth/login` | open | logs in with `{ "email": …, "password": … }`; the answer is `{ id, email, name, role }` + the `access` and `session` cookies |
| `POST /auth/refresh` | open (`session` cookie) | a new wristband + a new season pass |
| `POST /auth/logout` | open | deletes the session and both cookies; always `{"message":"logged out"}` |
| `GET /auth/me` | login | the account that is logged in (read from the database) |
| `GET /health` | open | is the server alive? connected to the broker and the database? how many messages were received and rejected? |
| `GET /devices` | login | every device heard since the server started |
| `GET /devices/:id/latest` | login | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | login | the last health report of one device |
| `GET /devices/:id/readings?from=…&to=…` | login | the raw reading history from the database (default: the last hour; at most 1,000 readings) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | login | a summary of the history per 15 minutes, per hour, or per WIB day (default: the last 1 day, 7 days, or 30 days; at most 1,000 buckets) |
| `POST /devices/:id/command` | admin | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table (with `source` `api`) |
| `GET /devices/:id/state` | login | the actuator state: what the server wants (`desired`), what the device reported last (`reported`, from `telemetry.state` or `ack.state`), when that report arrived, and the actuators that don't match yet (`diff`) |
| `GET /rules` | login | every automation rule the server is using right now; schedule rules also carry `next_run` (UTC) |
| `POST /rules` | admin | creates a new rule: a threshold rule (`condition.kind` `threshold` + `action.kind` `switch`) or a schedule rule (`schedule` + `command`); it applies right away |
| `PUT /rules/:id` | admin | replaces the whole content of one rule; it applies right away without restarting the server, and the threshold of a fan rule is sent to the device as a retained `config` |
| `POST /rules/:id/run` | admin | runs the action of one schedule rule right now (to test it, without waiting for its time) |

"login" = any account that is logged in (`admin` or `viewer`). Live data is available through **Socket.IO** at the same address (`/socket.io/`), also with the `access` cookie: send `follow` with a `device_id` (its answer carries the last reading) to receive that device's `telemetry` events; the `status` and `event` events go to every client. Without the cookie, the connection is refused (`connect_error` `not logged in`); when the wristband expires, the server cuts the connection and the client must refresh, then connect again. An example client: `tools/live-terminal.js` (its account is read from `tools/.env`).

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
| `008_login_and_sessions.sql` | `users.password_hash` (the bcrypt fingerprint) and `users.password_changed_at`, lowercase emails required, the `sessions` table (the SHA-256 of the current and the previous refresh token, expiring after 7 days; deleted together with its account) |

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

Replace `2026-10-20` in the file name with today's date so that later backups don't overwrite each other. On later backups, you can skip `mkdir backup` because the folder already exists. Since Module 20, this photocopy also holds the accounts and their password fingerprints: keep it as safe as `.env`.

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

## Limits of v0.5

- `GET /devices`, `latest`, `vitals`, and `state` are still read from memory, so they are empty again after every server restart. The desired state (`desired`) and the "for" count of every rule are also lost when the server restarts; the reading history, the commands, the rules, the events, the accounts, and the sessions are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- Raw readings are only kept for 90 days; for older times, only their hourly summaries remain.
- The days of the `1d` summary are WIB days (`Asia/Jakarta`), also for devices in WITA or WIT. Rule schedules are counted in WIB too.
- Rules and schedules only run while the backend is running. A schedule that is more than 15 minutes late (for example a laptop asleep at 06:00) isn't run afterwards, only recorded; if the backend is off at that time, nothing is recorded. When the broker can't be reached, Node 1 runs its own fan safety with the threshold from `config`.
- Changes made to the rules directly in the database (for example through DBeaver) are only read when the server restarts or when another rule is changed through the API; use the `/rules` API.
- A wristband (access JWT) that was handed out stays valid until it expires (15 minutes at most), also after a logout, a role change, a password change, or a deleted account; a Socket.IO connection that is running is only cut when its wristband runs out too (except a logout of that very session, or an old season pass used again 30 seconds or more after it was replaced, which cut it right away).
- The rate-limit counts are kept in the memory of one server: a restart = zero, and they don't fit several servers at once.
- The cookies aren't `Secure` yet because the server is still `http://`; HTTPS comes in Phase 5. The server still only accepts guests from this laptop (`HOST=127.0.0.1`); the devices (MQTT) don't have their own keys yet (Module 21).
````

Then save it to the `feature/user-security` branch. In the second terminal, make sure you're in the `backend` folder: its command line must end with `backend>` (macOS: `backend %`). If it still says `mini-smart-home>` (macOS: `mini-smart-home %`) because you've come straight from Practice 8.7, type `cd backend` first. Then run:

```text
git add README.md
git commit -m "Backend README v0.5 (Module 20)"
cd ..
```

### B. Add the security checklist to the pull request template

Since Module 16, every pull request in your repository automatically contains the checklist from `.github/pull_request_template.md`. The Syllabus asks for this week's pull request to be reviewed with a **security checklist**. Instead of writing it out just once, add that checklist to the template, so that every later pull request gets checked the same way. Open **`.github/pull_request_template.md`**, then add this at the very bottom:

```markdown
## Security checklist

<!-- Since Module 20. Only tick what you have really checked. -->

- [ ] No `.env`, `bruno/.env`, `tools/.env`, `login*.json`, `cookies*.txt`, passwords, or tokens in the **Files changed** tab; passwords in Bruno requests are written as `{{process.env.…}}`
- [ ] New secret settings (if any) are added to `.env.example` without their real values, and checked by Zod in `src/config/env.ts`
- [ ] New routes were tried in Bruno after `logout` (answered with 401), then with a `viewer` account (403 if the route changes something)
- [ ] No new route in `OPEN_ROUTES` without a reason written in this pull request; routes that check passwords are guarded by the hourglass too (`config.rateLimit`)
- [ ] New logs don't record passwords, wristbands, season passes, cookies, emails, or request contents; an account is mentioned by its number only
- [ ] Passwords and refresh tokens are only stored as fingerprints, new personal data is only stored when it is really used, and new live data is only sent to the Socket.IO rooms that may receive it
- [ ] `CORS_ORIGIN` only holds the addresses of pages we really run, one by one, and never `*`
- [ ] `npm test` passes, new npm packages are installed with an exact version (`npm install name@version`) and recorded in `package-lock.json`, `npm audit` answers `found 0 vulnerabilities`, and `allowScripts` only grows for packages that really need an install script
```

Its items answer the rows of the threat model in Concept 1, plus one item for the npm packages you install. Save, then send it to GitHub:

```text
git add .github/pull_request_template.md
git commit -m "Pull request template: security checklist (Module 20)"
git push
```

### C. Delete the test files from your laptop

If you did the optional curl parts in Practices 2, 4, 5, and 6, the `backend` folder now holds test files such as `login.json` and `login-wrong.json` (holding an email and a password), `cookies.txt` (holding the cookies from a login), and `command.json`. The `login*.json` and `cookies*.txt` lines in `backend/.gitignore` already keep the first three out of Git, but their content is still **secret**. `command.json` isn't secret, but `.gitignore` doesn't hold it back either, so a hurried `git add .` could take it along. Delete all four now through the VS Code Explorer (right-click → **Delete**): you can make them again at any time.

### D. ⭐ Merge `feature/user-security` into `main` through the "user security" pull request

1. **Open a pull request.** In the `mini-smart-home` repository on GitHub, click **Compare & pull request** on the yellow banner of the `feature/user-security` branch. If the banner is already gone, open the **Pull requests** tab → **New pull request**, then choose **base: `main`** ← **compare: `feature/user-security`**. Give it the title `User security`. Under **What changed?**, write, for example: `Backend v0.5: accounts and login (bcrypt fingerprints), JWT in an httpOnly cookie, refresh tokens with rotation and a sessions table, a 401/403 guard for the admin and viewer roles, a limit of 10 login attempts per minute, CORS and the origin check, Socket.IO locked too, and a .env checked by Zod. The small terminal logs in with a viewer account.` GitHub only uses the template that's already on the `main` branch (Module 16 Practice 8.1), so this description box only holds the old checklist for now; the **Security checklist** from step B only shows up by itself in the next pull request, after this branch has been merged. For this pull request, copy the **Security checklist** section from `.github/pull_request_template.md` in VS Code to the bottom of the description, then click **Create pull request**.
2. **Review with the security checklist.** Go through it item by item, then tick the ones that are really met:
   - In the **Files changed** tab, make sure there's **no** `backend/.env`, `backend/bruno/.env`, `tools/.env`, `login.json`, or `cookies.txt`. Also open the Bruno requests `login admin.yml` and `login viewer.yml`: their password must be `{{process.env.ADMIN_PASSWORD}}` and `{{process.env.VIEWER_PASSWORD}}`, not a real password.
   - The secret settings item: `.env.example` contains `JWT_SECRET` and `CORS_ORIGIN` without real values, and both are checked by Zod in `src/config/env.ts` (Practices 1 and 6).
   - The new routes item: the proof is the dress rehearsal of Practice 8.5. The new `/auth` route that isn't open, `GET /auth/me`, is answered with 401 without a login. The only additions to `OPEN_ROUTES` are the three `/auth` booths; the reason is written in Concept 6, and the login booth is guarded by the hourglass.
   - The npm packages item: `npm test` passes 18 tests, the five new packages were installed with an exact version (`npm install name@version`) and are locked in `package-lock.json` (in `package.json`, npm writes them with a `^` prefix, for example `"^10.2.5"`), `npm audit` answers `found 0 vulnerabilities` (Practice 8.6), and only `bcrypt@6.0.0` is in `allowScripts`.
   - You've already proven the other items yourself this week: the log in Practice 8.2, the fingerprints in Practices 1 and 4, Socket.IO in Practice 7, and `CORS_ORIGIN` in Practice 6.

   Send a summary through **Review changes** → **Comment** → **Submit review**. If a secret file did show up in **Files changed**, **don't merge**: change the secret first (Concept 11), remove that file from Git with `git rm --cached <file name>`, then commit and push again.
3. **Merge.** Choose **Create a merge commit**, click **Merge pull request** → **Confirm merge**, then **Delete branch**.
4. **Back to `main` on the laptop.** In the terminal:

   ```text
   git switch main
   git pull --prune
   git branch -d feature/user-security
   ```

The database isn't affected by this branch switch. Migration `008` is already recorded in `schema_migrations`, and the accounts you created are still there.

### E. Save your learning notes

Open the **`learn-iot`** repository in a new VS Code window (**File → New Window**, then **File → Open Folder…**), create the file **`module-20/notes.md`** next to `warmup.js` from 🔁, then fill it in with the numbers from your own screen:

```markdown
# Module 20 notes — User security

| What I measured | My numbers |
| :--- | :--- |
| How long making one bcrypt fingerprint with cost 12 took (Quick Win) | … ms |
| How long the login answer took with a wrong email versus a wrong password (Practice 2) | … ms versus … ms |
| Unit tests that are green (Practice 4) | … of … |
| retry-after on the 11th login attempt (Practice 5) | … seconds |
| How many minutes the small terminal stayed connected before it was cut because its wristband expired (Practice 7) | … minutes |

What surprised me most: …
```

Commit and push in the **`learn-iot`** repository, with GitHub Desktop or the terminal.

**Evidence for passing Module 20** (compare it with ✅ below): the 401 answers of every route without a login and the 403 for `lamp on` from a `viewer` account (Practice 3), the 429 answer on the 11th login attempt within a minute (Practice 5), and the "user security" pull request, reviewed with the security checklist and then merged.

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Threat model** | A simple list: who might mess around, through which door, what happens then, and which lock fits. |
| **Authentication** | Proving who you are, for example by logging in and then showing your wristband. When it fails: **401**. |
| **Authorization** | Deciding what you're allowed to do, based on your role. When it fails: **403**. |
| **401 `Unauthorized`** | Not logged in yet, or the wristband is fake or has expired. It means "who are you?", not "you're not allowed". |
| **403 `Forbidden`** | Already known, but not allowed to do that, for example a `viewer` account that tries to turn on the relay. |
| **429 `Too Many Requests`** | Too many requests in a short time; in this module, the 11th login attempt within a minute. |
| **Fingerprint** (hash) | The result of a one-way function, always of the same length: the same text gives the same fingerprint; one letter different, and the fingerprint changes completely; it can't be computed backward. |
| **bcrypt** | A fingerprint recipe made especially for passwords: it's slow on purpose and always uses a salt. Its result is a 60-character text that starts with `$2b$`. |
| **Salt** | A random number of 16 bytes that's mixed into every password before it's computed, so that the same password gives different fingerprints. |
| **Cost factor** (cost) | How hard bcrypt works: 2 to the power of cost rounds. This module uses 12; one step up means it takes twice as long. |
| **Passphrase** | A long password made of several words that its owner remembers easily. Stronger than a short, complicated password. |
| **JWT** (JSON Web Token) | "A concert wristband": three pieces of base64url text (header, payload, signature). Anyone can read its content, but nobody can change it without being found out. |
| **`JWT_SECRET`** | The secret key for signing wristbands ("the organizers' stamp"). It only exists in the backend's `.env`. |
| **HMAC** (hash-based message authentication code) | A fingerprint mixed with a secret key. Used as the JWT signature (HS256). |
| **SHA-256** | A fast fingerprint recipe whose result is 64 hexadecimal characters. Good for random season passes, but too fast for passwords. |
| **base64url** | A way to write any bytes as letters, digits, `-`, and `_`, so that they're safe to put in web addresses and cookies. |
| **Header** | A line of information at the start of an HTTP request or answer, for example `Set-Cookie`, `Cookie`, `Origin`, and `retry-after`. In Bruno, you see them in the **Headers** tab. |
| **Cookie** | A small note that the server leaves with the browser through `Set-Cookie`, and that the browser then attaches automatically to every later request to the same server. |
| **`HttpOnly`** | A cookie attribute: the page's JavaScript can't read the cookie. |
| **`SameSite`** | A cookie attribute: whether the cookie is attached to requests started by another site. `Strict` means never. |
| **XSS** (cross-site scripting) | Foreign JavaScript that manages to run on your page. It can steal a token in `localStorage`, but it can't read an `HttpOnly` cookie. |
| **CSRF** (cross-site request forgery) | Another page makes your browser send a request to your backend, with your cookie attached. |
| **Refresh token** ("season pass") | A long-lived random token (7 days at most) that's only shown at the `/auth/refresh` booth, to be swapped for a new wristband. The database only stores its SHA-256 fingerprint. |
| **Session** | One login in one browser or program; one row in the `sessions` table. Revoked on logout, when the password is changed, or when an old season pass is used again. |
| **Rotation** | Replacing the season pass every time it's used, so that a stolen pass can be found out. |
| **Role** | An account's rights: `admin` may do everything, `viewer` may only look (`GET` and `HEAD`). |
| **Guard** | Fastify's `onRequest` hook that checks every HTTP request before it reaches a route: the origin, the open doors, the wristband, then the role. |
| **Locked by default** (deny by default) | Every door is locked, except the ones opened on purpose. New routes are locked automatically too. |
| **Least privilege** | Every person and program only gets the rights they really need, for example the small terminal uses a `viewer` account. |
| **Rate limiting** | Limiting the number of requests per unit of time. In this module: 10 login attempts per minute from one IP address ("the hourglass"). |
| **Origin** | The combination of a page's scheme, host name, and port, for example `http://localhost:5173`. |
| **Site** | The scheme and the main domain name, without the port (for an IP address, the address itself). `http://127.0.0.1:5500` and `http://127.0.0.1:8080` are two origins, but one site. |
| **CORS** (Cross-Origin Resource Sharing) | The way a server allows pages from another origin to read its answers. A browser rule, not a server lock. |
| **Preflight** (an advance check) | An `OPTIONS` request that the browser sends before a "risky" cross-origin request, to ask for permission. |
| **Handshake** | Socket.IO's first HTTP request. It carries cookies like any other request, so it can be used to check the wristband. |
| **Secret scanning** | A GitHub feature that looks for the secret patterns it knows in repositories and pushes. The last safety net, not a replacement for `.gitignore`. |
| **Push protection** | The part of secret scanning that refuses a push containing a secret with a recognized shape right away, before it reaches GitHub. |
| **OWASP** | An open application security community that publishes, among other things, the OWASP Top 10 list. Covered in 🔬. |

## 📝 5-Question Quiz

1. Write down the status code you get, with the reason, for these five requests: (a) `GET /rules` without a cookie; (b) `PUT /rules/1` from a `viewer` account; (c) `GET /devices` with an `admin` wristband that expired two minutes ago; (d) the 11th login attempt within a minute, with the **right** password; (e) `GET /not-here` without logging in.
2. Your father and mother happen to use the same password, and then a copy of the `users` table leaks. (a) Are their `password_hash` columns the same? Why? (b) Why can't a guesser simply match them against a ready-made list of the fingerprints of popular passwords? (c) Which of these does `npm run users` accept as a new password: `Coffee Time #1`, `morning coffee on the porch`, or a password made of 20 emoji? Why?
3. A tampered npm library manages to run its JavaScript on your dashboard page. What could it do if the wristband were stored in `localStorage`? What can it **not** do, because the wristband is stored in an `HttpOnly` cookie? What can it **still** do?
4. A thief manages to copy your `session` cookie at 09:00. Your browser refreshes at 09:15, then the thief tries to refresh with the stolen pass at 09:20. What happens at 09:20? And what if the order is reversed: the thief refreshes first, at 09:10, and then your browser at 09:15?
5. You're opening another web project at `http://127.0.0.1:5500`, and that page turns out to hold a script that sends a `POST` to `http://127.0.0.1:8080/devices/f00d00000001/command` with cookies. (a) Does `SameSite=Strict` hold it back? (b) Does CORS hold it back? (c) Which layer finally refuses it, and with which code? (d) What's different if that page is opened from `http://localhost:5500`?

<details>
<summary><b>Answer key</b></summary>

1. (a) **401**: not logged in. (b) **403**: known, but a `viewer` may only use `GET`/`HEAD`. (c) **401**: an expired wristband is the same as no wristband; the client needs to refresh through `POST /auth/refresh` (Concept 7). (d) **429**: until the hourglass runs out, the booth doesn't check the password at all (Concept 8). (e) **401**, not 404: the guard won't tell strangers which routes exist (Concept 2).
2. (a) **Not the same**, because every bcrypt fingerprint uses its own random salt (Concept 3, Quick Win). (b) A ready-made list of fingerprints is only useful for fingerprints without salt. With salt, the guesser has to compute every guess again for every account, and every bcrypt calculation takes about 0.3 seconds. (c) Only **`morning coffee on the porch`** (27 characters). `Coffee Time #1` is refused because it's shorter than 15 characters, even though it has capital letters, a digit, and a symbol. The password of 20 emoji is refused because 20 × 4 = 80 bytes, more than bcrypt's limit of 72 bytes. Remember: never use an example password from a module.
3. With `localStorage`, that script could **read the wristband and send it anywhere**, and then the thief uses that wristband from their own computer until it expires. With an `HttpOnly` cookie, that script **can't read** the wristband. But as long as the page is open, the script **can still** send requests in your name, because the browser still attaches the cookie. `HttpOnly` makes the damage smaller; preventing XSS is still a must (Concept 5).
4. At 09:15, that pass has already been replaced (rotation) and moved to the `previous_token_hash` column. At 09:20, more than 30 seconds later, the old pass shows up again, so the backend treats it as **stolen and revokes the session**. The thief is refused (401), and your browser has to log in again too. The reversed order ends the same way: at 09:10 the thief gets a new wristband and a new pass, then at 09:15 your browser shows a pass that was replaced 5 minutes earlier, so the session is revoked. The difference: the thief still holds a valid wristband until **09:25** (15 minutes after 09:10), because wristbands can't be taken back (Concept 7).
5. (a) **No**: `127.0.0.1:5500` and `127.0.0.1:8080` are one site, so the `SameSite=Strict` cookie is still attached. (b) **Not completely**: CORS only stops that page from reading the answer. A "simple" request is still sent, and a request with a JSON body is indeed held back by the preflight, but a malicious script doesn't have to use JSON. (c) **The origin check in the guard**: the browser writes `Origin: http://127.0.0.1:5500`, which isn't on the list, so the guard answers **403** before the request reaches the route (Practice 6). (d) `localhost` and `127.0.0.1` are **two different sites**, so your cookie isn't attached at all (Concept 9). Still, the answer is **403**: the origin check is the guard's first step, and `http://localhost:5500` isn't on the list of origins either. If there were no origin check, the answer would be **401**, because that request carries no wristband.

</details>

---

## ✅ Module 20 Completion Checklist

The completion requirement from the Syllabus: **without a login every endpoint answers 401, a `viewer` account fails to turn on the relay (HTTP 403), and the 11th login attempt within a minute is refused.** **The path without a device:** every item may be ticked with the Module 19 simulator (the laptop path).

- [ ] The JavaScript warm-up is done, and I've checked my "Test yourself" answers against their key (🔁).
- [ ] I gave the same password a bcrypt fingerprint twice, and the results were different, but both of them match that password (Quick Win).
- [ ] The backend refuses to start without a proper `JWT_SECRET`, migration `008_login_and_sessions.sql` has been applied, and I have an `admin` and a `viewer` account that I created with `npm run users` (Practice 1).
- [ ] Logging in gives two `HttpOnly` cookies, a wrong email and a wrong password get the same answer, and I've read the content of my own wristband (Practice 2).
- [ ] ⭐ Without a login, every endpoint answers **401**, except the doors that are open on purpose, and a `viewer` account that tries to turn on the relay gets **403** (Practice 3).
- [ ] A refresh replaces both cookies, an old season pass that's used again revokes its session, a logout locks things again, and `npm test` reports 18 green tests (Practice 4).
- [ ] ⭐ The 11th login attempt within a minute is refused with **429**, even though the password is right (Practice 5).
- [ ] A page from an allowed origin gets CORS permission, and a `POST` request from an unknown origin is refused with **403** (Practice 6).
- [ ] ⭐ A small terminal without a login is refused by Socket.IO, while the Module 20 small terminal logs in with a `viewer` account, shows live data, and reconnects by itself after its wristband expires (Practice 7).
- [ ] ⭐ The backend log contains no passwords or tokens, all three `.env` files are held back by `.gitignore` (`git check-ignore -v` lists all three, and `git ls-files "*.env"` writes nothing), and the dress rehearsal of the three pass requirements succeeds in one go (Practice 8).
- [ ] ⭐ The pull request template has a **security checklist**, and all the Module 20 work is on `main` through the "user security" pull request, reviewed with that checklist, without any `.env` file (➕).

🎉 **Mini Smart Home is now locked for people.** Only registered accounts can get in, every role may only do its own part, password guessers are held back by the hourglass, foreign pages can't ride along on your login, and the live data is locked too. One door is still open: **the MQTT broker**. Any device on your home Wi-Fi can still publish messages in Node 1's name or send a `cmd` to the relay without going through the backend at all.

> ➡️ **Next module:** Module 21 — Device Security: API Keys, Simple Provisioning, & Broker Access Control (ACL). Every device gets its own key, may only talk on its own topics, and fake devices can't sneak in.

---

## 📚 Sources & Image Credits

**Documentation, specifications, and source code used** (accessed October 2026):

- Backend packages: [bcrypt](https://github.com/kelektiv/node.bcrypt.js) 6.0.0, [@fastify/jwt](https://github.com/fastify/fastify-jwt) 10.2.5, [@fastify/cookie](https://github.com/fastify/fastify-cookie) 11.1.3, [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit) 11.2.1, and [@fastify/cors](https://github.com/fastify/fastify-cors) 11.3.1; [Fastify hooks](https://fastify.dev/docs/latest/Reference/Hooks/) (`onRequest`); Socket.IO 4.8.4: [middlewares](https://socket.io/docs/v4/middlewares/) (`io.use`) and [server options](https://socket.io/docs/v4/server-options/) (`cors`, `allowRequest`); [cookie authentication in OpenAPI](https://swagger.io/docs/specification/v3_0/authentication/cookie-authentication/).
- Node.js 24.21.0: [the `crypto` module](https://nodejs.org/docs/latest-v24.x/api/crypto.html) (`createHash`, `createHmac`, `randomBytes`).
- Specifications: [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) (JWT), [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725) (JWT best current practices), [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238) (TOTP), [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) (the best current practice for OAuth 2.0 security), and [RFC 2606](https://datatracker.ietf.org/doc/html/rfc2606) (the `.test` domain name for examples).
- Guidelines: [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) (password rules, July 2025); the OWASP Cheat Sheet Series: [password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), and [multifactor authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html); [OWASP Top 10:2025](https://top10.owasp.org/2025/).
- MDN: [HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies), [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [the `Origin` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin), [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin), and [site](https://developer.mozilla.org/en-US/docs/Glossary/Site).
- GitHub: [secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), [push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection), [the list of supported patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns), and [removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
- Bruno: [cookies](https://docs.usebruno.com/send-requests/res-data-cookies/cookies), [the `.env` file for secrets](https://docs.usebruno.com/secrets-management/dotenv-file), and [the `bru run` options](https://docs.usebruno.com/bru-cli/run/options).
- Further reading for 🔬: [OpenID Connect at Google](https://developers.google.com/identity/openid-connect/openid-connect).
- [Law Number 27 of 2022 on Personal Data Protection](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) (Indonesia's *Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi*; JDIH BPK).

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-20`, `threat-model`, `password-fingerprint`, `jwt-wristband`, `guard-and-roles`, `wristband-and-season-pass`, `cors-and-origin`, `project-diagram-module-20` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The behavior of bcrypt, JWT, cookies, CORS, and Socket.IO from the documentation and specifications above; the numbers and messages from the author's lab for this module (backend v0.5). The example fingerprints, wristbands, and season passes in the pictures were made just for the examples; they don't belong to any real account. | CC BY 4.0 |
| `swagger-padlocks.png` | Real screenshots of the Swagger UI (`/docs`) of the author's Mini Smart Home backend in Google Chrome, after the guard was put in place in Practice 3; cropped and rearranged, with title, numbers, and captions by the author. | Swagger UI is licensed Apache-2.0; screenshot October 2026, used for educational purposes, annotations by the author. Title, numbers, and captions: CC BY 4.0 |
| `cors-in-devtools.png` | Real screenshots of the Google Chrome DevTools Console on the author's laptop, before and after the page's origin was added to `CORS_ORIGIN` (Practice 6.4); cropped and rearranged, with title, numbers, and captions by the author. | Google Chrome DevTools screenshot, © Google LLC, October 2026; used for educational purposes, annotations by the author. Title, numbers, and captions: CC BY 4.0 |

**About the Expected output boxes.** Every command and all the code of this module were run by the author on a Windows 11 laptop with Node.js 24.21.0 and npm 11.19.0, the database in a lab container of `timescale/timescaledb:2.30.2-pg17` holding the final state of Module 19, a small MQTT broker on the laptop, and the Module 19 device simulator, following exactly the same order of steps as this module. The terminal commands were tested in Windows PowerShell 5.1 and PowerShell 7.6 with curl 8.21.0, and the `/docs` page and DevTools were opened in Google Chrome. Bruno's desktop version isn't installed on the author's laptop: the steps in the Bruno window were written from Modules 16–19 and the source code of Bruno 4.2.1, while the answers and the Assert results were taken from the Bruno CLI 4.2.1 (`bru run`) with the same collection. GitHub's **Security and quality** tab and its push protection setting were written from GitHub's official documentation above, without a test account. The macOS commands and the device path (a real Node 1 and Pi) weren't tried again in this module; the backend commands Node 1 through the same path as in Module 19. The author used another port in the lab (`8201`), which is written as `8080` here, except in the two screenshots (the English screenshots show the lab ports `18203` and `18206`). The times in the example logs are written in WIB. The times, session numbers, answer times, `retry-after` numbers, and wristband contents on your screen will certainly be different, so outputs like those are marked **example**.

---

[⬅️ Module 19](../module-19-realtime-rules-notifications/README.md) · [Phase 3](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 21 — Device Security: API Keys, Simple Provisioning, & Broker Access Control (ACL)** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-21--device-security-api-keys-simple-provisioning--broker-access-control-acl))
