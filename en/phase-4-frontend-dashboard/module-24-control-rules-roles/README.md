# Module 24 — Controls, Rule Forms, Roles, & Protected Routes

🌐 **English** · [Bahasa Indonesia](../../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md)

*Phase 4 · Week 24 · Hardware: **Kit A + B** or the Module 21 simulator (`f00d00000001`), plus a **phone** on the same home Wi-Fi and **one tester** · Prerequisites: **Module 23** (dashboard v0.2 on `main`), **Module 20** · Time: 11–13 hours, spread over the week*

[⬅️ Module 23](../module-23-realtime-dashboard/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 25 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-25--professional-visualization-grafana-device-maps--reports)

---

Module 23 ended with a **live** dashboard: its numbers move by themselves over Socket.IO, complete with charts, history, and phone mode. But that dashboard still only **watches**. To turn on the lamp, you still open Bruno, and the viewer and admin accounts see exactly the same screen.

The lamp button has actually been waiting for a long time. In [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#practice-8--a-lamp-switch-on-your-phone-20-minutes), you turned on the lamp relay from your phone through the `/on` and `/off` links on Node 1's page, which was deliberately plain, with no password: anyone on the home Wi-Fi could use it. In [Module 22](../module-22-react-basics/README.md#practice-1--html-css-and-javascript-by-hand-taking-apart-the-module-10-page-60-minutes), that page was taken apart and given a button you made, but the button only changed the text on the screen. This week that button finally becomes real: through the backend, admin-only, and writing `On` while it waits for device confirmation. With it comes the rest of [the promise at the end of Module 23](../module-23-realtime-dashboard/README.md#-module-23-completion-checklist): rules like "water if soil < 30%", viewer and admin screens kept apart by React Router protected routes, and a test by someone else on their own phone.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| The lamp can only be turned on through Bruno. | Dashboard v0.2 only sends `follow` and `unfollow` over the socket; no button calls `POST /devices/:id/command` yet. | **Lamp and Fan buttons** that switch at once while writing `Waiting for device confirmation…` and roll back by themselves on failure; the **pump** button is deliberately not optimistic (Concepts 1–2, Practice 5) |
| The **Back** button leaves the dashboard, and **F5** on the Details goes back to the List. | Every screen lives at one address, `http://localhost:5173`; the screen shown is only remembered by `App`'s state. | **React Router 8.5.0** (declarative mode): every screen gets its own address (`/devices/:id`), so **Back**, **F5**, and direct links work (Concept 3, Practice 1) |
| After logging in, you always land on the List, and the form is still `useState` per field. | One `if` in `App.tsx` chooses between the login form and the whole dashboard; there's no guard per screen yet. | **Protected routes**: `RequireLogin` takes someone who isn't logged in to `/login`, then back to the screen they wanted; the Login form uses react-hook-form and Zod (Concepts 4 and 7, Practice 2) |
| Viewer and admin see the same screen; the role is only written in the header. | The role is already read from `GET /auth/me`, but it isn't used yet to choose what the screen shows. | **Roles on the screen**: `useAdmin()` and `AdminOnly` hide the control buttons and the admin screens from viewers; the backend's guard still refuses with `403` (Concept 5, Practices 3 and 5) |
| After **Log out**, the previous account's data is still in the tab's memory. | v0.2's **Log out** cuts the socket and deletes the session, but doesn't clear the store (limit 1 of Module 23). | **A complete logout**: the socket is cut, the session deleted, the store cleared through `clearAll`, then the guard takes the screen to `/login` (Concept 6, Practice 3) |
| Rules can only be created through Bruno as JSON, and "water if soil < 30%" can't be created at all yet. | There's no rule screen yet; backend v1.0 only knows "rises above" rules for the fan and the lamp, and the pump can only be scheduled. | **Backend 1.1.0** with "falls below" rules and `DELETE /rules/:id`, then **the rule list in sentences** and **a rule form** checked by the same Zod schema as the backend (Concepts 7–9, Practices 6–8) |
| When a rule turns on or a device disconnects, the dashboard says nothing. | The backend's `event` messages aren't listened to yet, and status changes that happen while the connection is down are missed (limit 2 of Module 23). | **On-screen notices** (toasts): small cards that disappear by themselves, at most two, at the bottom of a phone screen; after the connection recovers, `GET /devices` once (Concept 10, Practice 4) |
| Nobody but you has ever used the dashboard. | Color contrast and focus order have never been measured, and nobody has tried it without help. | **Basic accessibility** with Lighthouse, **a shortcut on the phone's home screen**, and **a user test** on someone else's phone (Concept 11, Practices 9–10) |

At the end of the week, a family member or housemate holds their own phone, logs in to the dashboard, turns on the lamp, and creates a watering rule, while you may only read the tasks aloud. That's the pass requirement from the [Syllabus](../../SYLLABUS.md#module-24--controls-rule-forms-roles--protected-routes): **someone else (not you) can log in from their phone over the home Wi-Fi, turn on the lamp, and create the rule "water if soil < 30%" without help — and a viewer account doesn't see the control buttons.** This module splits it into **L1** logging in from someone else's phone, **L2** turning on the lamp, **L3** the watering rule without help, and **L4** a viewer without control buttons. The Mini Smart Home gets **dashboard v1.0** (`1.0.0`), complete for end users on the home network. The backend moves up to **1.1.0** ("falls below" rules and deleting rules, no migration), the data contract stays **1.4**, the firmware of Node 1 (v1.6.0) and Node 2 (v1.0.0) doesn't change, and the simulator in `tools/` only gets two new typed commands, `soil` and `tank`.

![Roadmap of Module 24. Top, the six curriculum phases, Phase 0 to Phase 5; Phase 4 Dashboard (Modules 22–25) framed in purple. Modules 1–23 done; Module 24 red, marked YOU ARE HERE, Module 25 purple. Note: the dashboard becomes a control tool, with buttons, rules, roles, protected routes, then someone else tries it on their phone. The box Module 24 this week, 11–13 hours, spread out; Kit A + B or the Module 21 simulator (f00d00000001), plus a phone on the home Wi-Fi and one tester. Left column: JavaScript warm-up (an address becomes a screen, a promise that fails, save first, change, roll back, checking input, messages that disappear by themselves); Quick Win, the first lamp from the dashboard (admin: the lamp turns on; viewer: refused with 403); P1 one address for every screen: React Router; P2 protected routes and a better login; P3 roles on the screen and a complete logout, the base of L4 (the screen knows the role through useAdmin, viewer refused with 403 in Bruno); P4 on-screen notices: toasts. Right column: P5 buttons that wait for device confirmation, pass requirements L2 and L4 (a viewer account does not see the control buttons); P6 backend 1.1: falls below rules and deleting rules; P7 the rule list in sentences; P8 the rule form: create, edit, deactivate, delete, pass requirement L3; P9 accessibility, the phone, and the home screen; P10 the pass test: used by someone else on a phone, L1–L4; Add-on: dashboard v1.0 and the pull request dashboard v1.0 (controls & roles) + backend 1.1. P1, P2, P3, P5, P6, P8, P10, and the Add-on pull request carry a star, required to pass. Bottom, the pass requirement from the Syllabus labeled L1–L4: L1 someone else (not you) can log in from their phone over the home Wi-Fi, L2 turn on the lamp, L3 and create the rule water if soil is below 30% without help — L4 and a viewer account does not see the control buttons. Proven in: L1 Practices 9–10, L2 Practice 5, L3 Practices 6 and 8, L4 Practice 5 (its base in Practice 3); all four repeated with the tester in Practice 10. Two data paths: the devices (Kit A + B, the tank filled) or the laptop (simulator + soil 25, Bruno). Changed: frontend 1.0.0, backend 1.1.0, the simulator in tools/ (soil, tank); unchanged: data contract 1.4 and the firmware. The laptop opens http://localhost:5173; the phone opens http://laptop-IP:5173 only in phone mode.](assets/roadmap-module-24.png)

> [!NOTE]
> **How to use this module.**
>
> - **Two data paths, one dashboard.** The dashboard only talks to the backend (the API and Socket.IO), not to the broker or the devices. **The device path**: Node 1 and Node 2 (**Kit A + B**) through the broker on the Pi gateway; the lamp is Node 1's lamp relay, and the pump really waters from the water tank. **The laptop path**: Mosquitto on the laptop and the Module 21 simulator (the `tools` folder, `f00d00000001`), where this week you can type `soil 25` or `tank 15` ([6.5](#65-the-simulator-soil-and-tank-typed-in-the-terminal-5-minutes)) to try the watering rule and a refused pump without Kit A. The simulator has no real lamp or pump; the proof is the card on the screen, the simulator terminal, and the backend log. **Wokwi isn't used.**
> - **On the laptop, always open the dashboard at `http://localhost:5173`**; the phone opens `http://<laptop-IP>:5173` only while **phone mode** is on (Practices 9–10).
> - **A direct continuation of Module 23, with three accounts.** Dashboard v0.2 on `main`, the Bruno collection, and `tools/.env` are used as they are; this week's work lives on the `feature/controls-roles` branch, and the result of every practice can be compared with `code/stages/practice-N` (Practice 6: `code/backend` and `code/tools`). `admin@home.test` and `viewer@home.test` from Module 20 take turns. The third account, **`tester@home.test`** (admin role), is only for the tester: it is created in [10.2](#102-prepare-the-test-the-tester-account-the-starting-state-and-phone-mode-10-minutes) and deleted in [10.5](#105-the-viewer-account-on-the-same-phone-then-delete-the-tester-account-and-switch-back-to-laptop-mode-10-minutes) with [Module 20's `npm run users`](../../phase-3-backend-data/module-20-user-security/README.md#16-managing-accounts-from-the-terminal-npm-run-users-10-minutes), and its password lives only on a paper card. Don't lend out your own admin password.
> - **Evidence table**: where each requirement is proven, and what shows it.
>
>   | Requirement | Proven in | What you see |
>   | :-: | :-- | :-- |
>   | L1 | [9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes) (you) and [10.3](#103--the-user-test-on-the-testers-phone-four-tasks-without-help-25-minutes) (the tester) | backend log `login: account N (admin), session N, IP 192.168.…` with the phone's IP |
>   | L2 | [5.5](#55--the-lamp-from-the-dashboard-rollback-and-a-viewer-account-without-buttons-15-minutes), then 10.3 | `Waiting for device confirmation…`, then `On`; log `lamp = true, ack ok=true in N ms` |
>   | L3 | [6.4](#64--npm-run-check-npm-test-and-npm-audit-then-bruno-and-docs-110-10-minutes) (backend) and [8.5](#85--automatic-watering-from-the-form-soil-25-the-pump-waters-then-its-ready-again-15-minutes) (form), then 10.3 | after `soil 25`, the toast `🌱 Soil 25 % — pump watering for 5 seconds automatically` |
>   | L4 | 5.5 (based on [3.3](#33--switch-accounts-in-the-same-tab-nothing-left-over-admin-only-and-403-in-bruno-15-minutes)), then 10.5 | viewer account: Details without the **Controls** section, `/rules/new` says `Admin only`, Bruno `403` |
>
> - **The 🖥️ box of every practice names its tools**: **VS Code** with the `backend` terminal (`npm run dev`, door 8080), the `frontend` terminal (Vite, door 5173; phone mode: `npm run dev:phone`), and on the laptop path `tools` (the simulator); **Docker Desktop** with `smarthome-db`; **Chrome or Edge** with DevTools; **Bruno**; plus **a phone** and the tester (Practices 9–10).
> - **The Expected output boxes.** Outputs and screenshots of this English edition were recorded by the author on a Raspberry Pi 5 (Ubuntu 26.04.1 arm64) with Node.js 24.21.0, npm 11.19.0, Docker Engine 29.1.3, and Google Chrome 156.0.8078.47, against a real backend and database. Boxes that show a Windows terminal (a PowerShell prompt, Windows paths, `chcp 65001`, `curl.exe`) come from the Indonesian edition's recordings on Windows 11 25H2 with Microsoft Edge 156, translated with their values unchanged. The senders were the simulator `f00d00000001` and a lab mock of Node 1 (a program that imitates firmware v1.6.0), so the sensor numbers are **examples**; the times, ack durations, and build sizes on your screen will differ. IP addresses are written `192.168.1.10`; yours will differ. The phone steps were recorded from the lab computer opening its own Wi-Fi IP, and phone screens were imitated with DevTools device mode (details in [📚 Sources](#-sources--image-credits)).
> - **Honest status: the author hasn't run the test by another person on a real phone.** L2–L4 and logging in over the laptop's Wi-Fi IP were recorded by the author; the test by someone else (L1–L3), the home-screen shortcut on a phone, and a real Kit A were not. That test is your job in [Practice 10](#practice-10--the-pass-test-used-by-someone-else-on-a-phone-70-minutes) (the task sheet and the notes sheet are provided), so this module contains no tester quotes or times. If nobody can test yet, write "L1–L3 not yet tested by someone else" in your notes and don't tick that item in [✅](#-module-24-completion-checklist).
> - macOS users: replace **Ctrl** with **Cmd** for VS Code and browser shortcuts (DevTools: **F12** or **Ctrl + Shift + I**, macOS **Cmd + Option + I**; reload: **F5**, macOS **Cmd + R**). **Except in the terminal:** stopping a program is still **Ctrl + C**, on a Mac too.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **Hiding a button isn't protection.** The screen hides the control buttons from viewers for convenience; what protects is still the backend's guard, which refuses a viewer account's commands with `403`, from Bruno too ([Concept 5](#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security)).
> 2. **Admin from a phone only on a home Wi-Fi you trust**: the dashboard is still `http://` without encryption, and now the admin password travels over the Wi-Fi too. The tester account is only temporary (password on paper, deleted after the test), and laptop mode is switched back at the end of the session ([9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes), [10.5](#105-the-viewer-account-on-the-same-phone-then-delete-the-tester-account-and-switch-back-to-laptop-mode-10-minutes)). Access from the internet waits for HTTPS in Module 27.
> 3. **Still no tokens or roles in `localStorage`, and no secrets in `VITE_…` variables.** The role is read from `GET /auth/me`; the key is still the `HttpOnly` cookie ([Concept 6](#6-a-complete-logout-cut-the-socket-delete-the-session-clear-the-store)).
> 4. **The pump: keep the water tank filled, never run it dry**, because a mini pump is cooled by the water it pumps. The load still gets its power from the MB102, never from an ESP32 pin (the golden power rules; [5.4](#54-pumpbutton-deliberately-not-optimistic-then-the-admin-only-controls-section-10-minutes), [Concept 9](#9-rules-for-humans-rising-or-falling-hysteresis-and-layered-watering)).
> 5. **Still no polling.** Notices come through Socket.IO, and toasts disappear by themselves with `setTimeout`, without network requests ([Concept 10](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone), [4.1](#41-toastts-and-toastregion-at-the-bottom-of-a-phone-at-the-top-right-of-a-wide-laptop-15-minutes)).
> 6. **Install npm packages with the versions written here**: `react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7`. As of 25 October 2026, the command without versions stops with `ERESOLVE`, because the latest `@hookform/resolvers` (6.0.0) clashes with another package ([1.1](#11-the-featurecontrols-roles-branch-and-four-packages-at-their-written-versions-5-minutes), [🚨](#-troubleshooting)).

Like Modules 16–23, this module opens with a [🔁 JavaScript warm-up](#-javascript-warm-up-3045-minutes), this time as preparation for routes, buttons, and forms. The first day only needs the warm-up, the Quick Win (the first lamp from the dashboard), Concept 3, and Practice 1. The eleven concepts are read in pairs with their practices; the order is at the start of [🧠](#-the-why-concepts). The fold-out sections under [🚨](#-troubleshooting) are opened when you need them; the fold-out sections under [🔬](#-technical-deep-dive-optional) may be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 JavaScript warm-up (30–45 minutes)](#-javascript-warm-up-3045-minutes)
4. [🏆 Quick Win: the first lamp from the dashboard (20 minutes)](#-quick-win-the-first-lamp-from-the-dashboard-20-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 From watching to commanding](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack) · [2 Optimistic UI](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic) · [3 One address](#3-one-address-for-one-screen-react-router-in-declarative-mode) · [4 Protected routes](#4-protected-routes-a-guard-at-the-door-of-a-page) · [5 Two-layer roles](#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security) · [6 Logout](#6-a-complete-logout-cut-the-socket-delete-the-session-clear-the-store) · [7 Forms](#7-a-form-that-checks-itself-react-hook-form-not-usestate-per-field) · [8 Two guards](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend) · [9 Rules for humans](#9-rules-for-humans-rising-or-falling-hysteresis-and-layered-watering) · [10 On-screen notices](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone) · [11 Used by someone else](#11-used-by-someone-else-basic-accessibility-the-home-screen-and-a-user-test)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 One address](#practice-1--one-address-for-every-screen-react-router-50-minutes) · [2 Protected routes](#practice-2--protected-routes-and-a-better-login-55-minutes) · [3 Roles and logout](#practice-3--roles-on-the-screen-and-a-complete-logout-40-minutes) · [4 Toasts](#practice-4--on-screen-notices-toasts-40-minutes) · [5 Control buttons](#practice-5--buttons-that-wait-for-device-confirmation-75-minutes) · [6 Backend 1.1](#practice-6--backend-11-falls-below-rules-and-deleting-rules-50-minutes) · [7 Rule list](#practice-7--the-rule-list-in-sentences-30-minutes) · [8 Rule form](#practice-8--the-rule-form-create-edit-deactivate-delete-70-minutes) · [9 Accessibility and phone](#practice-9--accessibility-the-phone-and-the-home-screen-40-minutes) · [10 Pass test](#practice-10--the-pass-test-used-by-someone-else-on-a-phone-70-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-24-completion-checklist)

## 🎯 After this module you can…

1. **Give every screen its own address** with React Router 8.5.0 (declarative mode): `/devices`, `/devices/:id`, `/devices/:id/history`, `/rules`, and a `Page not found` screen for mistyped addresses, so **Back**, **F5**, and direct links work without dropping the live connection.
2. **Guard pages with protected routes**: the `RequireLogin` guard takes someone who isn't logged in to `/login`, then brings them back to the screen they wanted after they log in through a react-hook-form and Zod form.
3. **Tell admin and viewer screens apart** with `useAdmin()` and the `AdminOnly` guard, while understanding that hiding a button is **not** protection: the backend's guard still answers `403`, and you prove it with Bruno.
4. **Log out completely**: cut the socket, close the session with `POST /auth/logout`, clear the store, then let the guard take you to `/login`, so the next account in the same tab sees no leftover data at all.
5. **Make lamp and fan buttons that wait for device confirmation** (`useOptimistic` + `useTransition`): they show "done" first with the text `Waiting for device confirmation…`, roll back by themselves on failure, and give one clear sentence for every answer (refused by the device, `409`, `504`, a silent server). You also know when **not** to be optimistic: the pump button.
6. **Show on-screen notices** (toasts) that screen readers read aloud too (`role="status"` + `aria-live`), at most two at a time and at the bottom of a phone screen. The backend's `event` messages become toasts too, and device statuses refresh by themselves after the connection recovers.
7. **Move the backend up to 1.1.0**: "falls below" rules with hysteresis (on below 30%, ready again above 35%), a command sent once, `DELETE /rules/:id`, tests that still pass, and the `npm audit` habit. In the simulator terminal, you can also type `soil 25` and `tank 15`.
8. **Make a rule form that checks itself** with react-hook-form and a Zod schema that is **the same** as the backend's (an identical copy guarded by `npm run check-schema`): read rules as sentences, then create, edit, deactivate, and delete them, including a "water if soil < 30%" rule that really waters.
9. **Check basic accessibility** with Lighthouse and the Color Picker (4.5:1 contrast, focus rings, the keyboard path, 44 px touch targets), then put a dashboard shortcut on the phone's home screen while knowing why it isn't an installed app yet (a PWA needs HTTPS, Module 27).
10. **Run a simple user test**: someone else logs in from their phone over the home Wi-Fi, turns on the lamp, and creates a watering rule without help, while the viewer account doesn't see the control buttons. After lint and build pass, dashboard v1.0 and backend 1.1 are merged through a pull request.

## 🧰 What you need

| What to prepare | Notes |
| :--- | :--- |
| **The result of Module 23** | Dashboard v0.2 (`0.2.0`) on `main`; backend v1.0 and the **`smarthome-db`** container in Docker Desktop; the Bruno collection with `backend/bruno/.env`; `tools/.env`. The backend moves up to 1.1.0 in [Practice 6](#practice-6--backend-11-falls-below-rules-and-deleting-rules-50-minutes). |
| **The Module 20 accounts** | `admin@home.test` and `viewer@home.test` with their passwords, used from the Quick Win on. The third account, `tester@home.test`, is only created with `npm run users` in 10.2 and deleted in 10.5. |
| **A data source** (pick one path) | **Device path:** Node 1 and Node 2 (Kit A + B), firmware unchanged. **The water tank must hold water**: Node 1 refuses the pump when the level is below 20% (`pump refused: tank water too low`), the pump must never be left running dry, and its power still comes from the MB102, not an ESP32 pin. **Laptop path:** Mosquitto on the laptop and the Module 21 simulator (`tools`) with **`f00d00000001`**; from [6.5](#65-the-simulator-soil-and-tank-typed-in-the-terminal-5-minutes) on, its soil and tank can be typed (`soil 25`, `tank 15`). Wokwi isn't used. |
| **A phone and one tester** | **A phone** (Android or iPhone) on the **same home Wi-Fi**: your phone for 9.3, the tester's phone for [Practice 10](#practice-10--the-pass-test-used-by-someone-else-on-a-phone-70-minutes). **One other person** (family or a housemate) with ±25 minutes to spare (more if tasks are repeated in 10.4), a paper card for the tester account's password, and the sheets in `code/user-test/`. No tester or phone yet? Do Practice 10 as a rehearsal on the laptop (DevTools device mode), don't tick L1–L3 in [✅](#-module-24-completion-checklist) yet, and repeat it when a tester is available. The author hasn't tried Practice 10 with another person, or the 9.3 shortcut on a real phone, either. |
| **Node.js 24, VS Code, Git, Bruno** | The same as Module 23; the `learn-iot` repository (the `module-24` folder) for 🔁 and ➕ F. In Bruno, the viewer account proves the `403` (3.3), and the admin account sends `create soil watering rule` and `delete rule` (6.4). |
| **Chrome or Edge** | DevTools: **Network** (also **Request conditions** in 5.5), **Console**, **Lighthouse**, the **Color Picker**, and device mode. Firefox and Safari haven't been tested. |
| **Internet and a GitHub account** | Internet for `npm install` (1.1) and `npm audit` (6.4); GitHub for the pull request in ➕ E. |

Versions used in this module (October 2026): **Node.js 24** and four new packages installed with written versions in [1.1](#11-the-featurecontrols-roles-branch-and-four-packages-at-their-written-versions-5-minutes): **react-router 8.5.0** (declarative mode; `react-router-dom` isn't installed), **react-hook-form 7.91.0**, **@hookform/resolvers 5.9.2** (the link between the form and Zod; not 6.0.0, which makes `npm install` stop with `ERESOLVE`), and **zod 4.6.7** (the same as the backend). The Module 22–23 packages aren't upgraded: vite 8.3.5, react and react-dom 19.3.1, @vitejs/plugin-react 6.1.2, tailwindcss and @tailwindcss/vite 4.3.3, typescript 6.0.3, oxlint 1.89.0, socket.io-client 4.8.4, zustand 5.0.16, recharts 3.10.1, react-is 19.3.1, and date-fns 4.4.0. No toast library and no Next.js are installed (Next.js only appears in 🔬); backend 1.1.0 has no new packages either. The command is run in the `frontend` folder in step 1.1, not now:

```text
npm install react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7
```

## 🔁 JavaScript warm-up (30–45 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal and **Node.js 24**.

Five small JavaScript skills hold up this module's routes, control buttons, and forms. Practice them in Node.js without React; **Later in React** shows where each one is used.

**Set up the folder.** Create a **`module-24`** folder in the **`learn-iot`** repository, then in the VS Code terminal:

```text
cd module-24
npm init -y
npm pkg set type=module
```

Create **`warmup.js`** in `module-24`. Its code is in the fold-out **The full contents of `warmup.js`** after Step 5, split into `// 1.` to `// 5.`. Type its top four lines, then type each step's own part (don't copy-paste), save (**Ctrl + S**), run `node warmup.js`, and compare the new lines with the **Expected output**.

### Step 1 — An address becomes a screen: `new URL` and the pattern `/devices/:id`

In dashboard v1.0, every screen has an address like `/devices/f00d00000001`. In the `// 1.` part, **`new URL(…)`** splits an address: **`pathname`** = its path, **`searchParams.get("range")`** = the value after `?range=`. **`match(pattern, path)`** cuts both with `split("/")`: the number of segments must be the same, a `:id` segment may be anything (it's recorded), and the other segments must be the same. **`routeMap`** pairs patterns with screens; `/devics` is a deliberate typo. **Expected output:**

```text
--- 1. An address becomes a screen
pathname: /devices/f00d00000001/history
range   : 7days
/devices                         -> Device List {}
/devices/f00d00000001            -> Details {"id":"f00d00000001"}
/devices/f00d00000001/history    -> History {"id":"f00d00000001"}
/devics                          -> Page not found
```

**Later in React:** `<Routes>` in `App.tsx` holds the route map, `useParams()` gives `{ id }`, and an unknown address falls to the `*` route ([Concept 3](#3-one-address-for-one-screen-react-router-in-declarative-mode), [1.3](#13-screens-from-the-address-srcpages-and-useparams-15-minutes)).

### Step 2 — A promise that fails: `res.ok`, `try`, `catch`, and `finally`

A command from a control button can fail. The `// 2.` part uses **`fakeFetch(code)`**, a pretend `fetch` that answers 200, 409, 504, or fails completely (`0`, the backend is down). **`fetch` doesn't throw an error for 409 or 504**, so we are the ones who check **`res.ok`** (true for 200–299) and then throw an error. An error in **`try`** is caught by **`catch`**, and **`finally`** always runs: `waiting` is sure to go back to `false`. **Expected output** (new lines):

```text
--- 2. A promise that fails
200 success: {"ack":{"ok":true}}
   waiting = false
409 failed : 409 device is offline
   waiting = false
504 failed : 504 no ack within 5 seconds
   waiting = false
0 failed : Failed to fetch
   waiting = false
```

**Later in React:** `request()` in `src/api.ts` throws an `ApiError` with a code, and `SwitchButton` picks the toast sentence for each code ([Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack), [5.3](#53-one-sentence-for-every-answer-refused-by-the-device-409-504-and-a-silent-server-10-minutes)).

### Step 3 — Save first, change, roll back: copying an object with the spread syntax

An optimistic button shows `On` before the device answers and rolls back on failure. In the `// 3.` part, **`{ ...reported, lamp: true }`** makes a **new** object: the spread syntax copies `reported`, then `lamp: true` overwrites one of its values. Because of `commandFailed`, `final` rolls back to `reported`, which is still intact. `const wrong = reported` does **not** copy: two names, one object. **Expected output** (new lines):

```text
--- 3. Save first, change, roll back
shown (optimistic): { lamp: true, fan: true } | reported stays: { lamp: false, fan: true }
after the answer  : { lamp: false, fan: true }
without a copy    : { lamp: true, fan: true } <- the reported state changed too, it can't be rolled back anymore
```

**Later in React:** `useOptimistic` in `SwitchButton` keeps the optimistic display, then goes back by itself to the store's value ([Concept 2](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic), [5.2](#52-switchbutton-show-it-first-with-useoptimistic-and-usetransition-25-minutes)).

### Step 4 — Checking input: `Number()`, `Number.isInteger`, and `trim()`

An input box gives **text**, while the backend asks for numbers. The `// 4.` part turns five texts into numbers with **`Number()`**, then asks **`Number.isInteger`** (whole?) and **`Number.isNaN`** (`NaN` = not a number). **`checkRule()`** gives an error per field: a name that is empty after **`trim()`** (which removes the spaces at the edges), `NaN`, and an `off_above` that isn't above `on_below` (hysteresis). **Expected output** (new lines):

```text
--- 4. Checking input
"30"     -> Number: 30   | integer? true | NaN? false
""       -> Number: 0    | integer? true | NaN? false
"  25  " -> Number: 25   | integer? true | NaN? false
"2,5"    -> Number: NaN  | integer? false | NaN? true
"abc"    -> Number: NaN  | integer? false | NaN? true
[]
[
  { field: 'name', message: 'Required' },
  {
    field: 'off_above',
    message: 'must be greater than on_below (hysteresis)'
  }
]
[ { field: 'on_below', message: 'Enter a number' } ]
[]
```

The trap: `"2,5"` becomes `NaN` (`Number()` needs a decimal point), and an empty text becomes `0`, so the last input passes (`[]`).

**Later in React:** `valueAsNumber` in react-hook-form turns an empty box into `NaN` (`Enter a number`), and the errors per field come from the copy of the backend's Zod schema ([Concept 7](#7-a-form-that-checks-itself-react-hook-form-not-usestate-per-field), [8.1](#81-form-ingredients-friendlymessages-and-parse400-in-rulests-and-field-helpers-in-fieldstsx-10-minutes)).

### Step 5 — Messages that disappear by themselves: a queue with `setTimeout`

The `// 5.` part imitates toasts: **`add()`** makes a **new** array holding the three latest messages (`.slice(-MAX_TOASTS)`), and **`setTimeout`** calls `remove()` **once** after 1.5 seconds. Message 2 is closed first: **`clearTimeout`** cancels its timer. At `expired 1`, message 1 has already been pushed out by message 5: `remove()` doesn't find it. **Expected output (example):**

```text
--- 5. Messages that disappear by themselves
  +   0 ms add 1            shown: [Lamp on]
  +   0 ms add 2            shown: [Lamp on | Pump watering]
  + 508 ms closed 2         shown: [Lamp on]
  + 509 ms add 3            shown: [Lamp on | Soil 25 %]
  + 509 ms add 4            shown: [Lamp on | Soil 25 % | Temperature 31 °C]
  + 509 ms add 5            shown: [Soil 25 % | Temperature 31 °C | Fan on]
  +1530 ms expired 1        shown: [Soil 25 % | Temperature 31 °C | Fan on]
  +2025 ms expired 3        shown: [Temperature 31 °C | Fan on]
  +2027 ms expired 4        shown: [Fan on]
  +2028 ms expired 5        shown: []
```

**Later in React:** `src/toast.ts` uses this pattern with `MAX_TOASTS = 2` and 4 seconds ([Concept 10](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone), [4.1](#41-toastts-and-toastregion-at-the-bottom-of-a-phone-at-the-top-right-of-a-wide-laptop-15-minutes)).

<details>
<summary>The full contents of <code>warmup.js</code></summary>

```js
// warmup.js - a JavaScript warm-up before Module 24
// Five small skills that dashboard v1.0 uses later: an address becomes a screen, a promise that fails, save-change-roll back,
// checking input, and messages that disappear by themselves. Run it with: node warmup.js
import { setTimeout as wait } from "node:timers/promises";

// 1. An address becomes a screen: read the parts of an address, then match them with a pattern such as /devices/:id
console.log("--- 1. An address becomes a screen");
const address = new URL("http://localhost:5173/devices/f00d00000001/history?range=7days");
console.log("pathname:", address.pathname); // the path part, without the host name and without ?…
console.log("range   :", address.searchParams.get("range")); // the value after ?range=

// match("/devices/:id", "/devices/abc") -> { id: "abc" }; no match -> null
function match(pattern, path) {
  const patternParts = pattern.split("/"); // "/devices/:id" -> ["", "devices", ":id"]
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null; // they must have the same number of segments
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) params[patternParts[i].slice(1)] = pathParts[i]; // a ":id" segment = anything goes
    else if (patternParts[i] !== pathParts[i]) return null; // an ordinary segment must be exactly the same
  }
  return params;
}
// a small "route map": the first pattern that matches decides the screen. That's the heart of how <Routes> works in React Router.
const routeMap = [
  { pattern: "/devices", screen: "Device List" },
  { pattern: "/devices/:id", screen: "Details" },
  { pattern: "/devices/:id/history", screen: "History" },
];
for (const path of ["/devices", "/devices/f00d00000001", address.pathname, "/devics"]) {
  const hit = routeMap.map((r) => ({ ...r, params: match(r.pattern, path) })).find((r) => r.params !== null);
  console.log(path.padEnd(32), "->", hit ? hit.screen + " " + JSON.stringify(hit.params) : "Page not found");
}

// 2. A promise that fails: fetch does NOT throw an error for 409 or 504; we are the ones who check res.ok
console.log("--- 2. A promise that fails");
// a fake fetch: answers after 300 ms with the code asked for, like POST /devices/:id/command
async function fakeFetch(code) {
  await wait(300);
  if (code === 0) throw new TypeError("Failed to fetch"); // the backend is down: ONLY this makes fetch throw an error
  const bodies = {
    200: { ack: { ok: true } },
    409: { message: "device is offline" },
    504: { message: "no ack within 5 seconds" },
  };
  return { ok: code >= 200 && code < 300, status: code, json: async () => bodies[code] };
}
for (const code of [200, 409, 504, 0]) {
  let waiting = true; // in the dashboard: the text "Waiting for device confirmation…"
  try {
    const res = await fakeFetch(code);
    if (!res.ok) throw new Error(res.status + " " + (await res.json()).message); // turn a failed answer into an error
    console.log(code, "success:", JSON.stringify(await res.json()));
  } catch (err) {
    console.log(code, "failed :", err.message); // in the dashboard: a toast
  } finally {
    waiting = false; // finally ALWAYS runs, success or failure: the "Waiting…" text is sure to go away
    console.log("   waiting =", waiting);
  }
}

// 3. Save first, change, roll back: the basis of the optimistic button and the "rollback"
console.log("--- 3. Save first, change, roll back");
const reported = { lamp: false, fan: true }; // the state the device reports
const shown = { ...reported, lamp: true }; // ... = a NEW copy; the lamp is "on" on the screen at once (optimistic)
console.log("shown (optimistic):", shown, "| reported stays:", reported);
const commandFailed = true; // for example the device answers 409
const final = commandFailed ? reported : shown; // failed: back to what was reported (rollback)
console.log("after the answer  :", final);
const wrong = reported; // NOT a copy: two names for the same thing
wrong.lamp = true;
console.log("without a copy    :", reported, "<- the reported state changed too, it can't be rolled back anymore");

// 4. Checking input: text from an input box becomes a number, then it is checked before it is sent
console.log("--- 4. Checking input");
for (const text of ["30", "", "  25  ", "2,5", "abc"]) {
  const n = Number(text);
  const whole = Number.isInteger(n);
  console.log(JSON.stringify(text).padEnd(8), "-> Number:", String(n).padEnd(4), "| integer?", whole, "| NaN?", Number.isNaN(n));
}
// watch out: Number("") = 0, not "empty". An empty <input type="number"> box is read by react-hook-form (valueAsNumber)
// as NaN, so in the rule form an empty box is still caught ("Enter a number").
// a home-made checker: its result is a list of errors per field, like the one Zod makes later
function checkRule(input) {
  const errors = [];
  if (input.name.trim() === "") errors.push({ field: "name", message: "Required" });
  if (Number.isNaN(input.on_below)) errors.push({ field: "on_below", message: "Enter a number" });
  // two valid numbers, but the "end" limit isn't above the "start" limit: the rule would keep turning on and off
  else if (!(input.off_above > input.on_below)) {
    errors.push({ field: "off_above", message: "must be greater than on_below (hysteresis)" });
  }
  return errors;
}
console.log(checkRule({ name: "Water", on_below: 30, off_above: 35 })); // [] = passes
console.log(checkRule({ name: "   ", on_below: 30, off_above: 25 })); // an empty name + a reversed hysteresis
console.log(checkRule({ name: "Water", on_below: Number("abc"), off_above: 35 })); // NaN is caught
console.log(checkRule({ name: "Water", on_below: Number(""), off_above: 35 })); // []: an EMPTY box passes (0)!

// 5. Messages that disappear by themselves: a message queue with setTimeout (runs ONCE, not setInterval)
console.log("--- 5. Messages that disappear by themselves");
const SHOW_MS = 1500; // milliseconds (in the dashboard: 4000)
const MAX_TOASTS = 3; // (in the dashboard: 2)
let toasts = [];
let lastId = 0;
const start = Date.now();
function print(what) {
  const ms = String(Date.now() - start).padStart(4);
  console.log(`  +${ms} ms ${what.padEnd(16)} shown: [${toasts.map((t) => t.message).join(" | ")}]`);
}
function add(message) {
  const id = ++lastId;
  toasts = [...toasts, { id, message }].slice(-MAX_TOASTS); // more than 3: the oldest is dropped
  const timer = setTimeout(() => remove(id, "expired"), SHOW_MS);
  print("add " + id);
  return timer;
}
function remove(id, cause) {
  toasts = toasts.filter((t) => t.id !== id); // already gone? nothing happens
  print(cause + " " + id);
}
add("Lamp on");
const timerTwo = add("Pump watering");
await wait(500);
clearTimeout(timerTwo); // closed with the ✕ button: its timer is cancelled so it doesn't run for nothing
remove(2, "closed");
add("Soil 25 %");
add("Temperature 31 °C");
add("Fan on"); // the fourth message shown: message number 1 is pushed out
await wait(SHOW_MS + 200); // wait until every timer has finished
```

</details>

<details>
<summary>Self-test answer key</summary>

1. **Add `"/devices/abc"` to Step 1's list of paths. What is printed?** `Details {"id":"abc"}`. The matcher only reads the shape of the address; it's the screen that writes `Device abc not found.`
2. **Delete the line `if (!res.ok) throw …`. What is the 409 line?** `409 success: {"message":"device is offline"}`: a failure recorded as a success.
3. **Swap the order: `{ lamp: true, ...reported }`. What is the `shown (optimistic)` line?** `{ lamp: false, fan: true }`: the later one overwrites the earlier one.
4. **Delete the line `clearTimeout(timerTwo);`. What changes?** `expired 2` appears, but the list stays the same: a late `remove()` is harmless, so `toast.ts` has no `clearTimeout`.

Put back every line you changed.

</details>

## 🏆 Quick Win: the first lamp from the dashboard (20 minutes)

> 🖥️ **Tools used:** **VS Code** in the `mini-smart-home` folder with the `backend` and `frontend` (Vite) terminals and one free terminal for Git, plus the broker and the simulator on the laptop path; **Docker Desktop**; and **Chrome or Edge**.

In dashboard v0.2, the lamp can only be looked at. Before installing any package, prove this week's two core ideas with one temporary button: a command from the browser is a `POST` that waits for the device's answer (the ack), and roles are guarded by the backend, not by the button. Do it in dashboard v0.2 as it is, before the new branch of Practice 1.

### Step 1 — Start everything, then log in as admin (4 minutes)

The same as Module 23's Quick Win; every new terminal starts in the `mini-smart-home` folder.

1. Start `smarthome-db` in Docker Desktop.
2. Device path: turn on Node 1. Laptop path: `cd edge`, then `mosquitto -v -c mosquitto-lan.conf`, then in another terminal `cd tools` and `node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1`; wait for `f00d00000001: online`.
3. `cd backend`, then `npm run dev`; wait for `connected to broker … as backend`.
4. `cd frontend`, then `npm run dev`, open **`http://localhost:5173`**, log in with `admin@home.test`, then click the `f00d00000001` card (device path: your Node 1 card).

### Step 2 — Write `FirstButton.tsx`, then add it to Device Details (6 minutes)

In the VS Code Explorer panel, right-click the **`frontend/src/components`** folder → **New File…**, name it **`FirstButton.tsx`**, then type its contents (or open [`code/quick-win/frontend/src/components/FirstButton.tsx`](code/quick-win/frontend/src/components/FirstButton.tsx) on GitHub, click **Copy raw file**, then paste).

```tsx
// FirstButton.tsx - Module 24 Quick Win: ONE temporary button that tells the backend to turn the lamp on.
// No new packages: only a fetch POST /devices/:id/command, then the backend's answer is written as it is under the button.
// Admin account: 200 + the ack from the device. Viewer account: 403, because the backend guards the roles, not the button.
// When you're done trying, DELETE this file and the two FirstButton lines in DeviceDetails.tsx. The real button
// (with "Waiting for device confirmation…") is made in Practice 5.
import { useState } from "react";
import { BASE } from "../api";

export default function FirstButton({ deviceId }: { deviceId: string }) {
  const [result, setResult] = useState(""); // the backend's answer, written as it is

  async function turnOnLamp() {
    setResult("Sending… (the backend waits for the device's answer, at most 5 seconds)");
    try {
      const res = await fetch(BASE + "/devices/" + deviceId + "/command", {
        method: "POST",
        credentials: "include", // bring the login cookie: that's how the backend knows who we are and what our role is
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "lamp", value: true }), // the same command as Bruno "lamp on"
      });
      // 401 = the 15-minute wristband has expired (this test button doesn't renew it): reload the page, then try again
      setResult(res.status + " " + (await res.text()));
    } catch {
      setResult("Can't reach the backend: is it running?");
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-amber-500 bg-white p-3 dark:bg-slate-800">
      <button
        type="button"
        onClick={turnOnLamp}
        className="min-h-11 rounded-lg bg-amber-400 px-4 font-medium text-slate-900 hover:bg-amber-300"
      >
        Turn on the lamp (test)
      </button>
      <p className="mt-2 font-mono text-xs break-all text-slate-700 dark:text-slate-200">{result}</p>
    </div>
  );
}
```

- **`fetch(BASE + "/devices/" + deviceId + "/command", …)`** calls the same route with the same body as Bruno's `lamp on`. `BASE` from `api.ts` = the backend's address, `http://localhost:8080`.
- **`credentials: "include"`** brings the wristband cookie, so the backend knows who tapped and what their role is. The button itself doesn't check the role.
- **`setResult(res.status + " " + …)`** writes the backend's raw answer under the button.

Then open `frontend/src/components/DeviceDetails.tsx` and add two lines: the import below `import LastSeen …`,

```tsx
import FirstButton from "./FirstButton"; // Module 24 Quick Win (temporary)
```

and the button right below the `</p>` that closes the status line (the one with `<LastSeen … />`), above the chart comment:

```tsx
      <FirstButton deviceId={id} />
```

Save both files (**Ctrl + S**); the full file: [`code/quick-win/frontend/src/components/DeviceDetails.tsx`](code/quick-win/frontend/src/components/DeviceDetails.tsx). Below the Details status line there's now a yellow **Turn on the lamp (test)** button.

### Step 3 — Tap as admin: the lamp turns on, the card changes by itself (4 minutes)

The **Lamp** card says `Off` (not there yet? wait for the next message, ±10 seconds). Tap **Turn on the lamp (test)** once.

**Expected output (example):** for a moment `Sending… (the backend waits for the device's answer, at most 5 seconds)`, then:

```text
200 {"id":"c-20261025-051701-4","wait_ms":12,"ack":{"id":"c-20261025-051701-4","ts":"2026-10-25T05:17:01Z","ok":true,"state":{"fan":false,"lamp":true,"pump":false,"curtain":90}}}
```

The **Lamp** card changes to `On` without a reload (in the lab ±0.1 seconds after the `200`), and the `backend` terminal writes, among other lines:

```text
[12:17:01] INFO: command c-20261025-051701-4 (api) to f00d00000001: lamp = true, ack ok=true in 12 ms
```

`200` = the device answered within 5 seconds, `"ok":true` = the command was accepted, `state` = the state the device reports. On the device path, Node 1's lamp relay turns on too. This button doesn't touch the card: the card changes because the device sends a new reading with `state` right away, which Module 23's socket delivers to the store.

> [!TIP]
> `401 …`? The 15-minute wristband has expired (this button doesn't renew it): press **F5**, open the Details again, then tap again. `409 …`? The device isn't `online` yet, or the open device is Node 2, which doesn't take commands. What every answer means is in [Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack).

### Step 4 — Tap as viewer: `403` from the backend's guard (4 minutes)

1. Click **Log out**, then log in with `viewer@home.test`.
2. Open the `f00d00000001` Details again. The test button still shows, because this button doesn't check the role.
3. Tap the button.

**Expected output:**

```text
403 {"message":"viewer accounts can only look; commands and changes are admin-only"}
```

The **Lamp** card stays `On`, and the `backend` terminal writes (example):

```text
[12:17:02] WARN: refused (403): account 2 (viewer) tried POST /devices/f00d00000001/command
```

There's no `command …` line: the guard refuses before the route runs, so the command never reaches the lamp. Hiding a button is only about convenience; the protection is this guard ([Concept 5](#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security)).

### Step 5 — Delete `FirstButton.tsx` (2 minutes)

That button was rough: it can only turn the lamp on, its answer is raw JSON, and viewers see it too. The real button is built in [5.2](#52-switchbutton-show-it-first-with-useoptimistic-and-usetransition-25-minutes), and test files must not go into Git ([➕ D](#d-add-the-module-24-items-to-the-pull-request-template)).

1. Delete the two `FirstButton` lines in `DeviceDetails.tsx`, then save. Do this first: if the file is deleted first, Vite shows an import error.
2. In the Explorer panel, right-click **`FirstButton.tsx`** → **Delete**, then confirm.
3. In the free terminal, run `git status`: neither file is mentioned anymore.

In 20 minutes, one tap in the browser turned on the lamp through the backend, and the viewer account was refused by the guard.

> ➡️ **Next:** read [Concept 3](#3-one-address-for-one-screen-react-router-in-declarative-mode), then do [Practice 1 — One address for every screen](#practice-1--one-address-for-every-screen-react-router-50-minutes). What happened behind your tap is told in [Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack), which is read together with Concept 2 before Practice 5.

## 🧠 The "Why" Concepts

You don't have to read these eleven concepts in one go, and the reading order isn't their numbering. Read them in pairs with their practice:

1. Quick Win (already done) → Concept 3 → Practice 1 (one address for every screen)
2. Concept 4 and Concept 7 → Practice 2 (protected routes and a better login)
3. Concepts 5–6 → Practice 3 (roles on the screen and a complete logout)
4. Concept 10 → Practice 4 (on-screen notices: toasts)
5. Concepts 1–2 → Practice 5 (buttons that wait for device confirmation)
6. Concept 9 → Practice 6 (backend 1.1: "falls below" rules and deleting rules)
7. Concept 8 → Practice 7 (the rule list in sentences) and Practice 8 (the rule form)
8. Concept 11 → Practice 9 (accessibility, the phone, and the home screen) and Practice 10 (the pass test)

Concepts 1–2 come first in the numbering because they are the heart of this module, from watching to commanding, but they are read after Practice 4, right before the control buttons are made in Practice 5. If you're curious what happened when you tapped the Quick Win button, you may read Concept 1 right now. Concept 7 is used twice: the Login form (Practice 2) and the rule form (Practice 8); Concept 9 is used again in Practices 7 and 8. The code snippets in the concepts only need to be read; everything is written and run in the practices.

### 1. From watching to commanding: the journey of one tap to the ack

Up to Module 23, the dashboard only **watches**. `GET` fetches the list and the history, Socket.IO pushes new readings, and the lamp or the fan shows as a card that can only be read; commands still go through Bruno. In the [Quick Win](#-quick-win-the-first-lamp-from-the-dashboard-20-minutes), the test button `FirstButton` sent the first command from the browser: the admin account got `200` with an `ack`, and the Lamp card changed by itself a moment later, while the viewer account got `403`. This concept tells what happens between that tap and that answer.

**Commands go through `POST`, not through the socket.** Socket.IO in the dashboard stays one-way, from the backend to the screen ([Module 23 Concept 1](../module-23-realtime-dashboard/README.md#1-pushed-not-asked-for-live-data-over-socketio)). The control buttons use the same HTTP route as Bruno, `POST /devices/:id/command`, for two reasons:

1. **The backend's guard checks the role at the HTTP door.** A viewer account is refused with `403` before the command's content is read ([Module 20 Concept 6](../../phase-3-backend-data/module-20-user-security/README.md#6-a-guard-at-every-door-the-admin-and-viewer-roles)). The Socket.IO door checks the wristband, but not the role.
2. **The command's fate comes back in the same answer.** The backend holds the request until the device answers, so one `await` is enough to know the result.

**The journey of one tap.** You already know the pattern from Module 19: command → ack → timeout ([Module 19 Concept 3](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#3-command--ack--timeout-a-command-that-knows-its-fate)). The difference is that now the trigger is a thumb on the screen:

1. **Tap.** The **Lamp** button shows `On` at once, with the text `Waiting for device confirmation…` (this "show it first" approach is discussed in Concept 2).
2. **Send.** `sendCommand()` in `src/api.ts` sends `POST /devices/f00d00000001/command` with `{"target":"lamp","value":true}`, together with the wristband cookie.
3. **To the device.** The guard checks the wristband and the role. After that, the one door `issueCommand()` checks the device: registered, heard from, Node 1, `online`, the broker connected, and no other lamp command still waiting. If everything passes, the backend publishes `cmd` to `msh/<id>/cmd`, then waits.
4. **The device's answer.** Node 1 (or the simulator) carries it out, then publishes an `ack` with the same command `id` to `msh/<id>/ack`, containing `ok` and the `state` of its four actuators. The backend waits at most **5 seconds**.
5. **The HTTP answer.** Only now is that `POST` answered: `200` with the `ack`, or an error code.

In the author's lab, the mock device and the simulator on the same computer answered within a few milliseconds to ±¼ second, and the deliberately slowed mock within ±2.5–3 seconds. The author didn't measure how long a real Node 1 takes to answer over Wi-Fi; what's certain is that the limit is 5 seconds.

![Diagram of one tap on the Lamp button: show it first, then wait for the answer (Concepts 1–2); POST /devices/:id/command waits for the ack for at most 5 seconds; example f00d00000001, the lamp is Off. Top, five stages: 1 Tap, the button turns On at once with the text Waiting for device confirmation… (useOptimistic + useTransition); 2 Send, a POST with target lamp, value true, admin only (viewer 403); 3 To the device, backend 1.1 publishes msh/id/cmd through the broker and waits; 4 Device answers on msh/id/ack with ok and state, at most 5 seconds (lab, mock device on the same machine: 3–60 ms; slowed mock 2.5 seconds); 5 HTTP answer, 200 with the ack or an error code. While waiting the button cannot be tapped again (aria-disabled), so there is no 409 from a double click. A table of five answers, with the button afterwards, the toast (exact text), and what it means. 200 ack.ok true: On, no toast, the state taken from ack.state. 200 ack.ok false: rolls back to Off, toast Lamp: the device refused (…); a real example with the pump: pump refused: tank water too low; not sent again. 409: rolls back, toast Lamp: device is offline, command not sent; the device has just gone offline, its key was revoked, it is Node 2, or another command is still waiting (another tab or phone); usually the button is disabled first; 403, 404, 503 the same, the toast shows the server text. 504 (orange): Off as reported, toast Lamp: not confirmed by the device yet; the server will try again when it hears from the device.; 30 seconds or more later the lamp turns On by itself with the toast lamp f00d00000001 reported false, but true is desired (api); command sent again. NOT cancelled: the server remembers the On wish and sends it again when it hears the device (lab +35.2 seconds). Network error: rolls back, toast Lamp: the server didn't answer.; tried with the DevTools Request conditions drawer. Bottom left: another tab or phone learns it from telemetry, because the server only sends telemetry, status, and event, no ack; state.lamp updates the button on other screens at the latest ±2 seconds later (lab: the other browser changed less than ½ second after the click). Bottom right: the pump is deliberately NOT optimistic, a repeated watering = watering twice; its title stays Idle until ack.ok true, disabled while watering; without an ack, the pump command is not sent again.](assets/command-journey.png)

**`200` doesn't always mean success.** `200` only means "the device answered". The answer can be "yes", or it can be "no". These are all the answers of the command route, with the exact `message` texts from the backend:

| Answer | What it means | Example `message` |
| :--- | :--- | :--- |
| `200`, `ack.ok: true` | the device carried it out; the real state is in `ack.state` | — |
| `200`, `ack.ok: false` | the device **refused**; the reason is in `ack.message` | `pump refused: tank water too low` |
| `409` | not sent, for one of five reasons: the device isn't `online`, its key was revoked, it's Node 2, its kind isn't known yet, or an earlier command for the same actuator is still waiting (for example from another tab or phone) | `device is offline, command not sent`, `the previous lamp command is still waiting for its ack` |
| `404` | the device isn't registered, or hasn't been heard from since the backend started | `device f00d00000009 is not registered` |
| `503` | the backend is disconnected from the broker | `the backend isn't connected to the broker` |
| `504` | 5 seconds passed without an `ack` | `no ack for <command-id> within 5 seconds` |
| `403` | a viewer account, or a page opened from an address that isn't allowed | `viewer accounts can only look; commands and changes are admin-only` |
| `401` | not logged in, or the wristband expired and the refresh failed | `not logged in or session expired: log in with POST /auth/login` |

One more possibility doesn't come from the backend: the request doesn't arrive at all (the backend is down, the Wi-Fi dropped). `request()` in `src/api.ts` reports it as an `ApiError` with code `0`, and the toast writes `Lamp: the server didn't answer.`

Because the `ack` decides how the button looks, its content is really checked, not just trusted. `sendCommand()` (Practice 5.1) checks it with the same `Ack` schema as the backend, the copy of `contract.ts` in `src/schemas/`:

```ts
export async function sendCommand(deviceId: string, command: SetCommand): Promise<Ack> {
  const answer = await request<{ ack?: unknown }>("/devices/" + deviceId + "/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  // The ack's content is checked with the SAME Ack schema as the backend (the copy in schemas/contract.ts), not just trusted.
  // safeParse doesn't throw an error: its result is { success: true, data } or { success: false, error }.
  const result = Ack.safeParse(answer.ack);
  if (!result.success) throw new ApiError(200, "Unknown answer from the server.");
  return result.data;
}
```

- **`request()`** already throws an `ApiError` for every answer other than 2xx, with the backend's `message`. Only `200` answers reach the `Ack.safeParse` line.
- **`Ack.safeParse`** makes sure the `ack` contains `ok`, `state`, and so on. `sendCommand()` returns the `ack`, not `true`/`false`, because the caller still has to read `ack.ok`: a button that gets `ok: false` must roll back (Concept 2).

**Two different acks.** In Module 23, the dashboard already waited for a Socket.IO answer to `follow`, which only means "the backend received your request". The `ack` in this concept comes from the **device** over MQTT and means "the device has carried it out" (or refused, with a reason). The same word, different speakers.

**Other screens find out through `telemetry`.** The `ack` only goes back to the tab that tapped. From the backend to the dashboard there are only three Socket.IO events, `telemetry`, `status`, and `event`; there's no `ack` event. Another tab, or another household member's phone, learns that the lamp is on from the `state` object in the next `telemetry`. Node 1 v1.6.0 and the simulator send `telemetry` right away as soon as an actuator's state changes, so the news arrives at most ±2 seconds later; in the author's lab, the dashboard in another browser switched less than ½ second after the click. Commands from buttons aren't recorded in the event log either (only the commands of rules, schedules, and the server's resends are), so your tap doesn't make a toast appear on someone else's screen.

The details are in [5.1](#51-copy-contractts-then-a-sendcommand-that-checks-the-answer-with-acksafeparse-15-minutes) and [5.3](#53-one-sentence-for-every-answer-refused-by-the-device-409-504-and-a-silent-server-10-minutes). If you want to see the server's wishes and the device's report after a `504` through `GET /devices/:id/state`, open [🔬](#-technical-deep-dive-optional) *After a `504`* and [Module 19 Concept 4](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#4-desired-state-versus-reported-state).

### 2. Optimistic UI: show it first, roll back on failure, and when not to be optimistic

An "honest" button waits for the answer first: tapped, it sits still for up to 5 seconds, and only then changes. For a switch, sitting still like that feels broken, and people tend to tap again. **Optimistic UI** reverses the order. The screen shows **your wish** first, marks that the answer is still awaited, then replaces it with the device's **report** as soon as the `ack` arrives (desired versus reported, [Module 19 Concept 4](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#4-desired-state-versus-reported-state)). If the command fails, the button **rolls back** to the state before the tap, and a toast explains why.

Our optimistic button, `SwitchButton` for the lamp and the fan, keeps three promises:

1. **It switches at once.** `Off` becomes `On` right away.
2. **It's honest that nothing is certain yet.** Below it is written `Waiting for device confirmation…`, and meanwhile the button can't be tapped again (`aria-disabled`), so a double tap doesn't end in a `409`.
3. **The device still has the last word.** As soon as the answer arrives, the button shows the state from the store, that is the content of `ack.state` or `telemetry`, not the earlier guess.

**React 19 does the rolling back.** Two built-in React tools work together: `useOptimistic` (a temporary value while waiting) and `useTransition` (the "waiting" marker). An excerpt of `src/components/SwitchButton.tsx` (Practice 5.2; `…` = skipped lines):

```tsx
  // shown = value, EXCEPT while a command waits for its answer: then shown = our wish (optimistic)
  const [shown, setShown] = useOptimistic(value);
  // waiting = true while the Action below hasn't finished (from the tap until the backend's answer arrives)
  const [waiting, start] = useTransition();
  …
    start(async () => {
      setShown(wanted); // changes on the screen at once, before the device answers
      try {
        const ack = await sendCommand(deviceId, { target, value: wanted });
        …
        useLiveStore.getState().applyState(deviceId, ack.state);
        if (!ack.ok) toast(label + ": the device refused (" + (ack.message ?? "no reason given") + ")", "error");
      } catch (err) {
        toast(failureMessage(err, label), "error");
        …
      }
      …
    });
```

- **`value`** is the state **reported** by the device, read from the store. `useOptimistic(value)` gives `shown`, which equals `value`, **except** while an Action (next point) is running.
- **`start(async () => …)`** runs an Action, that is an `async` function inside a **transition** (an update React may postpone). While it hasn't finished, `waiting` is `true`, and what's shown is the value from `setShown(wanted)`. `wanted` holds `!value`, the opposite of the reported state at the moment of the tap (its line is one of the skipped ones).
- **Success:** `applyState` writes `ack.state` to the store, `value` changes too, the Action finishes, and `shown` equals `value` again: `On`.
- **Failure:** the store doesn't change. As soon as the Action finishes, React throws away the optimistic display and goes back to the old `value`: `Off`. The rollback happens **without a single line of code**. For `ack.ok: false`, the `ack.state` that goes into the store still holds the old state, so the result is the same.
- **`try`/`catch` is a must.** React doesn't ignore an error that escapes an Action; it hands it to an error boundary (a component that catches screen errors). Instead of relying on that, every error is caught here and turned into a toast.

In [🔁 Step 3](#step-3--save-first-change-roll-back-copying-an-object-with-the-spread-syntax), you saved first, changed a copy, then rolled it back by hand; `useOptimistic` does the same thing for you. In the author's test against a real backend, the optimistic display stayed `On` even when a `telemetry` with the old state arrived during the wait, StrictMode still sent one `POST` per tap, and switching screens while waiting was safe: the result still went into the store. From Practice 5 on, `<BrowserRouter useTransitions={false}>` keeps a new screen from waiting for the button (5.2).

**One sentence for every answer.** Look again at the table of five answers in the Concept 1 picture. Their effect on the button:

| Answer | The button afterwards | Toast (exact text) |
| :--- | :--- | :--- |
| `200`, `ack.ok: true` | stays `On` | — |
| `200`, `ack.ok: false` | rolls back to `Off` | `Lamp: the device refused (…)`, with the reason from `ack.message` |
| `409`, `404`, `503`, `403` | rolls back | `Lamp: ` + the backend's message, for example `Lamp: device is offline, command not sent` |
| `504` | the reported state (`Off`) | `Lamp: not confirmed by the device yet; the server will try again when it hears from the device.` |
| code `0` | rolls back | `Lamp: the server didn't answer.` (tried with the DevTools **Request conditions** panel in Practice 5.5) |

**`504` doesn't mean "cancelled".** For the lamp, the fan, and the curtain, the backend records the **wish** (for example `lamp: true`) before sending `cmd`. Without an `ack`, that wish is still remembered. As soon as the device is heard from again and at least 30 seconds have passed since the last attempt, the backend sends the command again by itself (Module 19's reconciliation). In the author's test, the lamp turned on by itself ±31–40 seconds after the tap (the 30-second pause, plus waiting for the device's next message), without anyone touching the button, with a toast from the event log: `lamp <id> reported false, but true is desired (api); command sent again`. That's why the `504` toast deliberately says "the server will try again", not "failed" or "cancelled": the button shows the correct state right now, and the toast says what will happen. If you change your mind, wait until the lamp turns on by itself, then tap to turn it off; tapping while the button still shows `Off` sends `On` again. On the other hand, `ack.ok: false` deletes the wish, so a command the device refused isn't sent again.

**When not to be optimistic: the pump.** "Turn on the lamp" sent twice still means the lamp is on; an operation like this is called **idempotent** ([🔬 Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#-technical-deep-dive-optional)). "Water for 5 seconds" sent twice means watering for 10 seconds, and water that has come out can't be pulled back. That's why `PumpButton` is **deliberately not optimistic**:

| Question | Lamp, fan | Pump |
| :--- | :--- | :--- |
| Is sending it twice the same as once? | yes | no |
| Does the backend remember the wish and send it again after a `504`? | yes | no |
| What's shown while waiting | `On` at once + `Waiting for device confirmation…` | stays `Idle` + `Waiting for device confirmation…` |
| After `ack.ok: true` | the state from `ack.state` | `Watering` + the toast `Pump: watering for 3 seconds.` (the **3 sec** button); the 3, 5, and 10 sec buttons can't be tapped until the pump is idle again |
| After `504` | the "the server will try again" toast | the toast `Pump: not confirmed by the device and not sent again. Check the pump's state before trying again.` |

The pump still uses `useTransition` for the waiting marker and to disable its buttons, but without `useOptimistic`. In the author's test with the simulator's `tank 15`, the title stayed `Idle`, then the toast `Pump: the device refused (pump refused: tank water too low)` appeared.

The details are in [5.2](#52-switchbutton-show-it-first-with-useoptimistic-and-usetransition-25-minutes) and [5.4](#54-pumpbutton-deliberately-not-optimistic-then-the-admin-only-controls-section-10-minutes); the manual pattern without `useOptimistic` is in [🔬](#-technical-deep-dive-optional) *Optimistic without `useOptimistic`*.

> ⬆️ **Done reading Concepts 1–2?** Continue to [Practice 5 — Buttons that wait for device confirmation](#practice-5--buttons-that-wait-for-device-confirmation-75-minutes). [Concept 9](#9-rules-for-humans-rising-or-falling-hysteresis-and-layered-watering) is read before Practice 6.

### 3. One address for one screen: React Router in declarative mode

Up to Module 23, the dashboard's address was always `http://localhost:5173`. `App` picked the screen with the `view` whiteboard, so the browser didn't know the screen had changed. You feel the result every day: the **Back** button leaves the dashboard, **F5** on the Details goes back to the List, and a device's Details can't be sent as a link. The cure: every screen gets its own address. A pair "address pattern → screen" is called a **route**, for example `/devices/:id` → Details; you already matched patterns like that by hand in [🔁 Step 1](#step-1--an-address-becomes-a-screen-new-url-and-the-pattern-devicesid).

**React Router 8.5.0, declarative mode.** React Router is the library that connects the address in the browser with React screens. Its official documentation divides it into three stacked modes: **declarative**, **data**, and **framework**. We use the simplest one: routes are written as `<Routes>` and `<Route>` components, while data is still fetched the ways you already know (effects, the Zustand store, the socket). The old Syllabus called it "library mode", a term from the React Router v7 announcement (2024). How the three differ is in [🔬](#-technical-deep-dive-optional) *The three modes of React Router 8*.

**Why v8, not v7?** v8 has been stable since 17 June 2026, and 8.5.0 (19 October 2026) is the `latest` version on npm, so the official documentation you open shows v8 too. For declarative mode, the code is the same as in v7: everything is imported from `"react-router"`. v8's requirements (Node 22.22 and React 19.2.7 or newer) are already met by your project (Node 24, React 19.3.1). The only thing gone is the `react-router-dom` package, which stopped at 7.18.4. Many tutorials still write `from "react-router-dom"`; in our project, replace it with `from "react-router"` (the "old instructions → what's right" table in [🚨](#-troubleshooting)).

**Seven tools in use:**

| Tool | Its job | Used in |
| :--- | :--- | :--- |
| `<BrowserRouter>` | reads the browser's address and history, then shares them with the whole dashboard | `src/main.tsx`, wrapping `<App />` |
| `<Routes>` + `<Route>` | the list of every address in one place: address pattern (`path`) → screen (`element`) | `src/App.tsx` |
| `<Link>`, `<NavLink>` | links that change the address **without reloading the page**; `NavLink` also knows when its address is open | the menu, the List cards, the back links |
| `useParams()` | reads the changing part of an address, for example `:id` | `pages/Details.tsx`, `pages/History.tsx` |
| `<Outlet />` | the place for the child screen inside a frame | `Layout`, `RequireLogin`, `AdminOnly` |
| `<Navigate>` | moves to another address as soon as it's drawn | `/` → `/devices`, the guards (Concept 4) |
| `useNavigate()` | changes the address from code, for example back to `/rules` after a rule is saved or deleted | `components/RuleForm.tsx` (Practice 8) |

**The list of every address in one place.** This is the route map in the final `src/App.tsx` (from Practice 8 on):

```tsx
  useRealtime(loggedIn, handleSessionExpired);
  …
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireLogin />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DetailsPage />} />
          <Route path="/devices/:id/history" element={<HistoryPage />} />
          <Route path="/rules" element={<RulesPage />} />
          {/* the second guard: screens that change something are for admins only */}
          <Route element={<AdminOnly />}>
            <Route path="/rules/new" element={<RuleFormPage />} />
            <Route path="/rules/:id" element={<RuleFormPage />} />
          </Route>
        </Route>
      </Route>
      {/* any other address that matches no pattern, logged in or not */}
      <Route path="*" element={<NotFound />} />
    </Routes>
```

- **`:id`** marks the part of the address that changes: `/devices/f00d00000001` matches `/devices/:id`, and Details reads `f00d00000001` through `useParams()`.
- **A `<Route>` without `path`** is a **layout route**: it adds nothing to the address, but it draws itself, then puts the matching child screen in its `<Outlet />`. `Layout` is the frame that stays (the header, the **Live** badge, the **Devices** and **Rules** menu, the name and role, **Log out**), while its content changes. `RequireLogin` and `AdminOnly` are guards (Concepts 4 and 5).
- **`useRealtime()` above `<Routes>`**: screens come and go below it, the socket stays (see below).

The map grows with each practice: Practice 1 sets up `/`, `/devices`, `/devices/:id`, `/devices/:id/history`, and `*`; Practice 2 adds `/login`, `RequireLogin`, and `Layout`; Practice 3 adds `AdminOnly` with `/rules/new`; Practice 7 adds `/rules`; Practice 8 adds `/rules/:id`.

![Diagram of the route map: one address for one screen (Concepts 3–4); React Router 8.5.0 declarative mode; every Route in App.tsx. Top, what is mounted ONCE above the tree and not swapped: BrowserRouter in main.tsx (the address and the browser history); GET /auth/me once, user in the store = loading, null, or account + role; useRealtime, one socket (lab: 10 screen switches, 0 new connections). The Routes tree, columns screen and who: /login, the Login screen, someone already logged in goes on to the destination, for everyone. The RequireLogin frame, a route guard without path: loading shows Checking the session…, not logged in Navigate to /login with replace and state from: location, logged in Outlet. Inside it the Layout frame: the header (Live badge, Devices and Rules menu, name and role, Log out), ToastRegion, Outlet, and GET /devices once. Routes for admin and viewer: / redirected to /devices; /devices, Device List; /devices/:id, Details + chart + gauges, control buttons for admin only; /devices/:id/history, History + table + CSV; /rules, rules in sentences, a viewer only reads. The AdminOnly frame, the second guard (a viewer sees the Admin only screen): /rules/new the create form and /rules/:id the edit, deactivate, delete form, admin only. Outside the guards, route *: Page not found + To the device list. Bottom, an example of someone not logged in opening a direct link: 1 a private window opens /devices/f00d00000001/history; 2 RequireLogin redirects to /login (replace, state.from = that address); 3 Log in, Navigate to the destination (destination from state.from); 4 back on History, Back does not bounce to /login. Note: /devices the screen on port 5173, /devices the backend API on port 8080, the same words, a different origin; F5 on a deep address works because Vite sends the same index.html (SPA fallback), other servers need the same rule (Modules 26–27); a NavLink to /devices without end keeps the Devices menu active on Details.](assets/route-map.png)

**Pages and the API don't compete for addresses.** The screens' paths (`/devices`, `/rules`, `/login`) live at `localhost:5173`; the API's paths (`/devices`, `/rules`, `/auth`, `/health`, `/docs`) at `localhost:8080` — some words are the same, but the port (the origin) is different. The dashboard calls the backend directly (CORS), with no Vite proxy, so **F5** on `/devices/…` never lands on the API and shows JSON, the trap discussed in [🔬 Module 22](../module-22-react-basics/README.md#-technical-deep-dive-optional).

**F5 and direct links: the SPA fallback.** When **F5** is pressed at `http://localhost:5173/devices/f00d00000001`, the browser asks the Vite server for that address, yet no file named `devices/f00d00000001` exists. Vite (its default setting is `appType: 'spa'`) doesn't answer 404, but sends the same `index.html`, then React Router reads the address and draws the Details. That's the SPA fallback: a single-page application uses one `index.html` for all its screen addresses, both in `npm run dev` and in `npm run preview`. Two consequences:

- **Vite's `base` stays `/`** (the default). In a build with `base` set to `./`, F5 at an inner address makes the browser ask for `/devices/assets/…`, which is answered 404, and the screen turns white ([🚨](#-troubleshooting) *F5 on `/devices/…` gives a white screen …*).
- **`npm run preview` is only for trying it on the laptop**, not a real (production) server. The server that will one day serve the `dist/` dish (Modules 26–27) must get the same rule: every screen address is answered with `index.html`.

**A screen opened by its address fetches its own data.** In Module 23, the device object was handed from the List to the Details through `view` in `App`. Now the Details can be opened without passing through the List (a link, **F5**, **Back**), so nobody hands it anything. `pages/Details.tsx` reads the `id` with `useParams()`, then looks it up in the device list in the store, which is fetched **once** after logging in (`GET /devices`; in Practice 1 by `App`, from Practice 2 on by the `Layout` frame), not by the List screen ([Module 23's store](../module-23-realtime-dashboard/README.md#4-one-store-for-every-screen-zustand-and-selectors)). An `id` that isn't in the list (for example `/devices/abcdef`) shows `Device abcdef not found.` without asking the API anything.

**Switching screens doesn't drop the live connection.** In the author's test, ten screen switches plus **Back** and **Forward** opened 0 new Socket.IO connections. The condition: switch screens through `<Link>` or `<NavLink>`. An ordinary `<a href>` link and an address typed in the address bar reload the whole page, just like **F5**: a new document, a new socket, the store filled from scratch. That's normal for **F5**, but it mustn't happen on every menu click. One more behavior: in our dashboard, switching screens doesn't scroll the page back to the top. On a phone, Details opened from a List card that was already scrolled opens at that scroll position; scroll up if its title isn't visible.

**`NavLink` and the active menu mark.** `NavLink` calls the function in its `className` prop with `isActive`, and puts `aria-current="page"` on the active link so that screen readers know too. Without the `end` prop, a `NavLink` to `/devices` stays active at `/devices/f00d00000001` and at its History: the **Devices** menu stays marked while the Details is open. That's why the List lives at `/devices` and `/` only redirects; a `NavLink` to `/` is special, only active exactly at `/`.

The details are in [1.2](#12-browserrouter-in-maintsx-and-the-route-map-in-apptsx-10-minutes) to [1.5](#15--back-f5-and-direct-links-the-screen-stays-the-live-connection-doesnt-drop-10-minutes); common symptoms are in [🚨](#-troubleshooting) (*F5 …*, *The Devices menu isn't marked active …*, *The live connection drops …*).

> ⬆️ **Done reading Concept 3?** Continue to [Practice 1 — One address for every screen: React Router](#practice-1--one-address-for-every-screen-react-router-50-minutes). [Concept 4](#4-protected-routes-a-guard-at-the-door-of-a-page) and [Concept 7](#7-a-form-that-checks-itself-react-hook-form-not-usestate-per-field) are read before Practice 2.

### 4. Protected routes: a guard at the door of a page

Once every screen has an address, anyone can open `http://localhost:5173/devices/f00d00000001/history` directly, including someone who isn't logged in. The check doesn't need to be written in every screen. One **route guard** is set up as a layout route that wraps all the guarded screens, like an attendant at the door of a page: check first, then let them in. A route guarded like this is called a **protected route**. This is `src/components/RequireLogin.tsx` in its Practice 2 version:

```tsx
export default function RequireLogin() {
  const user = useLiveStore((s) => s.user);
  const location = useLocation(); // the address being opened, for example /devices/f00d00000001/history

  if (user === "loading") {
    // GET /auth/me isn't answered yet: don't rush to send them to /login, the cookie may still be valid
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Checking the session…</p>;
  }
  if (user === null) {
    // replace = the guarded address isn't left in the browser history, so the Back button doesn't bounce back here
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />; // logged in: show the child screen that matches the address
}
```

- **`"loading"`**: `GET /auth/me` from `App` isn't answered yet, so the screen writes `Checking the session…` and waits. This stage matters on **F5**: a reload empties the store, while the wristband cookie may still be valid, so a guard that decided right away would throw every **F5** to `/login`. The stage already existed in `App` v0.2; Practice 2 moves it into the guard.
- **`null`** (not logged in): move to `/login`, handing over the address from before.
- **Logged in**: `<Outlet />`, that is the child screen that matches the address.

**`state.from`: back to the same screen.** `useLocation()` gives the address being opened, and the guard hands it over to `/login` through the browser history's `state`, which doesn't show in the address bar. The Login screen uses it as the destination (or `/devices` if nothing was handed over), then, after a successful login, draws `<Navigate to={destination} replace />`. In the author's test, a History address opened without a session moved to `/login` with `{"from":{"pathname":"/devices/f00d00000001/history",…}}` handed over, and after **Log in** went back to exactly that History.

**`replace`: the Back button doesn't bounce.** Without `replace`, the browser history holds the guarded address, then `/login`. **Back** from `/login` returns to the guarded address, and the guard throws it right back to `/login`: it bounces. With `replace`, the guarded address is **replaced** by `/login`, and after logging in, `/login` is replaced by the destination, so **Back** from History doesn't return to the Login screen.

**The official pattern, our version.** React Router v8's official example (`react-router-examples/auth`) uses `<Navigate to="/login" state={{ from: location }} replace />` in its guard, then `navigate(from, { replace: true })` after logging in; its login status is kept in a React Context, so a reload is the same as logging out. We follow it, even with the same names (`/login`, `from`), with two differences: the login status lives in the Zustand store, plus a `"loading"` stage, so the guard, the header, and the Login screen read the same shared notice board; and the Login screen also uses `<Navigate>`, because the changing store content already redraws that screen. The API documentation suggests `useNavigate` rather than the `<Navigate>` component (the component is meant for class components), but the official example still uses `<Navigate>` in its guard, and so do we.

**Who's inside, who's outside.** `/login` and `*` are deliberately outside the guard: `/login` is the guard's destination, so someone who isn't logged in must be able to open it, and `Page not found` shows for everyone. Every other screen is inside `RequireLogin` → `Layout` and is guarded without a single check line in the screen itself. Further inside is the second guard, `AdminOnly`, for `/rules/new` and `/rules/:id`: a viewer account sees the `Admin only` screen with a link back, not the form, and isn't moved away silently (Concept 5, Practice 3). The full tree is in the Concept 3 picture.

**A route guard doesn't protect data.** A route guard only arranges screens in the browser, and the browser belongs entirely to its user: its code can be changed, and the API can be called without the dashboard, for example from Bruno. The data is still protected by the backend's guard: without a wristband, `GET /devices` is answered `401`, and a command from a viewer account is answered `403`. The route guard makes the dashboard pleasant to use; the backend's guard makes it safe. The same split applies to roles (Concept 5). Practice 3 adds one small condition after **Log out**: the guard doesn't hand over `from`, so the next person in the same tab doesn't land on the previous person's last screen (Concept 6).

The details are in [2.2](#22-the-guard-and-the-frame-requirelogin-and-layout-15-minutes) and [2.4](#24--a-direct-link-before-logging-in-to-login-then-back-to-the-same-screen-10-minutes).

> ⬆️ **Done reading Concept 4?** Read [Concept 7](#7-a-form-that-checks-itself-react-hook-form-not-usestate-per-field) too (a form that checks itself), then continue to [Practice 2 — Protected routes and a better login](#practice-2--protected-routes-and-a-better-login-55-minutes).

### 5. Two-layer roles: the screen for convenience, the backend's guard for security

Concepts 5 and 6 are read after Practice 2, before Practice 3: by then your dashboard already has route guards and the new Login screen.

Module 20 made two roles because not everyone at home needs to be able to give commands. In Module 20's threat model, "a little brother who likes turning off other people's bedroom lights" ([Module 20 Concept 1](../../phase-3-backend-data/module-20-user-security/README.md#1-threat-model-who-might-mess-around-and-what-happens-then)) only gets a `viewer` account. He may see every number, but every command and change is refused with `403` ([Module 20 Concept 6](../../phase-3-backend-data/module-20-user-security/README.md#6-a-guard-at-every-door-the-admin-and-viewer-roles)). Up to Module 23, admin and viewer saw exactly the same dashboard, and that was fine because the dashboard only watched. This week the dashboard gets lamp, fan, and pump buttons, and a rule form, so two new questions come up: **who sees the buttons, and who is really allowed to use them?** They are answered in different places.

| Layer | Where | Its job | Can it be bypassed? |
| :-- | :-- | :-- | :-- |
| **1. The screen** (convenience) | the browser: `useAdmin()` and the second guard, `AdminOnly` | Viewers aren't given buttons that would be refused anyway, so their screen is honest and not confusing | **Yes.** Anyone can send a request without pressing a button: through Bruno, the **Console** tab, or `curl` |
| **2. The backend's guard** (security) | the server: the `guard` function in `src/auth/security.ts` (Module 20) | Every change from an account that isn't admin is refused with `403`, wherever it comes from | **No**, because it runs on the server, not in the sender's browser |

**Hiding a button isn't protection.** The screen's code runs in its user's own browser, so that user can get around it. What guards your home is still the backend's guard; the screen layer only makes the dashboard pleasant to use. That's why, every time you add an admin button, test the second layer too, with the viewer account in Bruno ([3.3](#33--switch-accounts-in-the-same-tab-nothing-left-over-admin-only-and-403-in-bruno-15-minutes)).

![Diagram of two-layer roles: the screen for convenience, the backend's guard for security (Concept 5). Left, layer 1, the screen: a mini admin Details with buttons in the Controls section (Lamp On, Fan Off, Pump: water for 3 sec, 5 sec, 10 sec, Idle) and a mini viewer Details without buttons, cards only: Lamp On, Fan Off, Pump Idle, Curtain 90° among the Temperature and Humidity sensor cards. Buttons are rendered only when useAdmin() is true, that is when the admin role is certain from GET /auth/me, so no button flashes; a viewer also sees no + New rule and no Edit, and /rules/new shows Admin only. Warning: hiding a button is NOT protection; a viewer can still send a POST through Bruno or the Console. Right, layer 2, the backend's guard onRequest (security.ts) for POST /devices/f00d00000001/command from a viewer, checked in order before the route runs: 1 page of origin (Origin) known? (methods other than GET/HEAD; Bruno sends no Origin), if not 403 request from the page … refused; 2 open route? (/auth/login, /auth/refresh, /auth/logout, /health, /docs) passes without a wristband; 3 wristband (cookie access) valid? if not 401 not logged in or session expired: log in with POST /auth/login; 4 admin role, or GET/HEAD? if not 403 viewer accounts can only look; commands and changes are admin-only. All four passed, then Zod checks the body (400) and the route runs. 403 comes BEFORE the body is checked: a viewer with a wrong body still gets 403, not 400. Bottom, proof in Bruno: login viewer then lamp on, 403 with that message; login admin then lamp on, 200 with the ack. A viewer may still use GET /devices, GET /rules, GET /auth/me, and Socket.IO. A role changed through the CLI (npm run users -- role) is used by the screen after a reload, and by the backend's guard within 15 minutes (the wristband's lifetime).](assets/two-layer-roles.png)

**You've already seen layer 2 at work.** In [Quick Win Step 4](#step-4--tap-as-viewer-403-from-the-backends-guard-4-minutes), the temporary button `FirstButton` was tapped with the viewer account, and the backend answered `403` `viewer accounts can only look; commands and changes are admin-only`. That's the guard's work: one `onRequest` hook (the `guard` function) that checks **every** request before its route runs, in order:

1. A change (`POST`, `PUT`, `DELETE`) from a page whose origin isn't listed in `CORS_ORIGIN` → `403` `request from the page … refused`.
2. Open routes (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/health`, `/docs`) → through without a wristband.
3. No valid wristband → `401` `not logged in or session expired: log in with POST /auth/login`.
4. A role that isn't admin, and a method that isn't `GET`/`HEAD` → `403`.

Step 4 in `backend/src/auth/security.ts` (since Module 20):

```ts
  if (req.user.role !== "admin" && !READ_METHODS.has(req.method)) { // checked BEFORE the request content is validated
    req.log.warn(`refused (403): account ${req.user.sub} (${req.user.role}) tried ${req.method} ${req.url}`);
    return reply.code(403).send({ message: "viewer accounts can only look; commands and changes are admin-only" });
  }
```

Three properties of this step matter this week:

- **The `403` comes before the request content is checked.** A viewer who sends wrong input also gets `403`, not `400`, so they're given no hint at all about the right shape of the input.
- **New routes are guarded without extra code.** Backend 1.1's `DELETE /rules/:id` ([Practice 6](#practice-6--backend-11-falls-below-rules-and-deleting-rules-50-minutes)) is refused for viewers right away; the `routes/rules.test.ts` test proves it with the real guard.
- **The role is read from the wristband** that the backend signed, not from the screen. Even if someone fiddled with the store through the **Console** until the admin buttons appeared, their taps would still be answered `403`.

Socket.IO deliberately doesn't check the role: viewers may see all the live data, the events, and the rule list.

**Layer 1: show it when admin is certain.** How does the screen know your role? When the page opens, `App` asks once, "who am I?", through `GET /auth/me` ([2.1](#21-who-is-logged-in-a-session-slice-in-storets-and-get-authme-once-10-minutes)). The answer, `{ id, email, name, role }`, is kept in the store as `user`. Components don't read `role` directly, but use one small selector in `src/store.ts`:

```ts
export function useAdmin(): boolean {
  return useLiveStore((s) => s.user !== null && s.user !== "loading" && s.user.role === "admin");
}
```

The result is `true` **only** when the admin role is certain. While `GET /auth/me` isn't answered yet (`"loading"`), the result is `false`. Note the direction: "show it when admin is certain", not "hide it when viewer". With the second way, the role isn't known yet during `"loading"`, so the admin buttons get drawn for a moment on the viewer's screen and then disappear: they flicker. The first way never draws a button that hasn't earned its place.

`useAdmin()` is used in three places:

| Place | Admin sees | Viewer sees | Made in |
| :-- | :-- | :-- | :-- |
| Device details | the **Controls** section: the Lamp, Fan, and Pump 3/5/10 sec buttons | the read-only cards `Lamp`, `Fan`, `Pump`, and `Curtain`, without a single control button | [5.4](#54-pumpbutton-deliberately-not-optimistic-then-the-admin-only-controls-section-10-minutes); proven in [5.5](#55--the-lamp-from-the-dashboard-rollback-and-a-viewer-account-without-buttons-15-minutes) |
| `/rules` | the rule list in sentences, the **+ New rule** button, and the **Edit** links | the same sentence list without buttons, so the viewer knows why the fan turned on by itself | [8.3](#83-ruleform-at-rulesnew-useform-with-zodresolver-a-sentence-preview-and-the-save-button-20-minutes) and [8.4](#84-edit-deactivate-and-delete-the-edit-button-and-the-rulesid-route-10-minutes) |
| `/rules/new`, `/rules/:id` | the rule form | the `Admin only` screen | [3.1](#31-useadmin-and-the-second-guard-adminonly-10-minutes) |

The last row is guarded by **the second guard**, `AdminOnly`. Its shape is the same as `RequireLogin` in [Concept 4](#4-protected-routes-a-guard-at-the-door-of-a-page), a layout route that puts its child screen in `<Outlet />`, but its question is different: not "logged in?", but "admin?". A viewer who opens `/rules/new` from a link or the address bar isn't redirected silently. They read `This screen is for admin accounts only. Your account is a viewer: you can see all the data, but you can't change anything.`, with a link back to the device list.

**A changed role.** An account's role is changed from the backend terminal ([Module 20 1.6](../../phase-3-backend-data/module-20-user-security/README.md#16-managing-accounts-from-the-terminal-npm-run-users-10-minutes)). The screen only learns of it after the page is reloaded, because `GET /auth/me` is only asked once, when the page opens. The backend's guard reads the role from the wristband, so there the new role applies at most 15 minutes later, when the wristband is renewed. In between, the screen and the backend's guard can disagree; the backend's guard decides ([🚨](#-troubleshooting) *A viewer account briefly sees the admin buttons, or still sees them after its role was changed*). The role is also never written to `localStorage`: it lives only in the tab's memory, and is thrown away on **Log out** (Concept 6).

### 6. A complete logout: cut the socket, delete the session, clear the store

Module 23's **Log out** button was deliberately minimal: cut the live connection, `POST /auth/logout`, then back to the login form. The store's content (the device list, readings, charts) was still left in the tab's memory until the page was reloaded. Module 23 recorded it as a limit and promised: once roles are told apart, the store **must** be cleared ([🔬 Module 23](../module-23-realtime-dashboard/README.md#-technical-deep-dive-optional) *Two limits of v0.2*). That promise is due now. Picture the admin logging out, then the little brother logging in with the viewer account in the same tab. Without clearing, he could glimpse the admin's leftover data, or even land on the admin's last screen. **A complete logout** means the next person in that tab starts from zero.

**Log out** in dashboard 1.0 (`handleLogout` in `Layout.tsx`, [3.2](#32-a-complete-logout-clearall-and-four-steps-in-order-15-minutes)) has four steps, and their order matters:

| No. | Step | Code | Why in this order |
| :-: | :-- | :-- | :-- |
| 1 | Cut the live connection | `socket.disconnect()` | The disconnect reason is `io client disconnect`, so the socket doesn't reconnect. In the reverse order, the server does the cutting (`io server disconnect`), and then the dashboard tries to reconnect (Module 23). |
| 2 | Delete the session in the backend | `await logout()`, that is `POST /auth/logout` | The backend deletes the season pass in the database, cuts the sockets of that session in every tab, and tells the browser to throw away the `access` and `session` cookies. JavaScript itself can't delete `HttpOnly` cookies ([Module 20 Concept 5](../../phase-3-backend-data/module-20-user-security/README.md#5-an-httponly-cookie-not-localstorage)). |
| 3 | Clear the store | `clearAll(message, true)` | That account's session, devices, readings, charts, and toasts are thrown away at once. |
| 4 | Move to `/login` | done by the `RequireLogin` guard, with `replace` | As soon as the store is empty, the guard sees `user === null`. Thanks to `replace`, the **Back** button doesn't return to the dashboard screen from before. |

Step 3 uses a small function in `src/store.ts`:

```ts
export function clearAll(loginMessage: string | null, loggedOutOnPurpose = false) {
  useLiveStore.setState({ ...useLiveStore.getInitialState(), user: null, loginMessage, loggedOutOnPurpose }, true);
  useToast.setState(useToast.getInitialState(), true); // the previous account's toasts are thrown away too
}
```

The `useToast` line is only added in Practice 4, when toasts (small notice cards, Concept 10) are made. `getInitialState()` is the store's content when it was first created. The second argument, `true`, means **replace** its whole content. Without `true`, `setState` only merges, like an ordinary `set`, and fields that aren't mentioned stay. The same function is used by `handleSessionExpired()` when the wristband can't be renewed anymore, so both ways out are equally clean.

**Why doesn't step 4 call `navigate("/login")`?** The first version did, and the author's test found a flaw: the next person who logged in in the same tab landed on the previous person's last screen (a viewer was greeted straight away by the `Admin only` screen). The reason: `<BrowserRouter>` changes the address through `startTransition` (an update React may postpone), while the Zustand store changes immediately. So the guard first sees an empty store **at the old address**, then moves to `/login` while handing over that address as `from` (Concept 4), and that hand-over overrides the `navigate` from before. The cure: only one party moves the screen. **Log out** clears the store with `loggedOutOnPurpose = true`, then the guard reads it (`RequireLogin.tsx`):

```tsx
    return <Navigate to="/login" replace state={loggedOutOnPurpose ? null : { from: location }} />;
```

After **Log out**, no address is handed over, so the next person starts from `/devices`. After a session expires, the address is deliberately still handed over: usually the same person logs in again and wants to get back to their screen.

**The notice after Log out.** The Login screen shows `You have logged out.` as a line above the form (`role="status"`, read aloud by screen readers), not as a toast, because the toasts are cleared too. If the backend is down when **Log out** is pressed, step 2 fails, and the dashboard says so frankly: `Log out isn't complete: the server didn't answer, so the session on the server hasn't been deleted. When the server is running again, reload this page and press Log out once more.` In the author's test, reloading after the backend was running again did bring you back to `/devices`, because the session was still alive.

In the author's test, the DevTools network log recorded the order: click **Log out**, the Socket.IO disconnect packet 1 ms later, `POST /auth/logout` at 5 ms, the `200` answer at 18 ms, then `/login` with an empty store. A viewer who then logged in in the same tab landed on `/devices` without any leftover admin data. **Log out in another tab** is handled too: the backend cuts the sockets of every tab of that session, the wristband renewal is refused, and this tab moves to `/login` with `Your session has expired. Please log in again.` within 138–630 ms. A tab that isn't being looked at may only "notice" when it's opened again.

Two things can't be fully handled by browser code, and this module writes them down openly.

**First, a wristband that was already copied.** The wristband (the `access` JWT) is checked without the database. **Log out** throws away the cookie in your browser and kills the season pass, but a copy of the wristband that someone else already took is still accepted until it expires, at most 15 minutes ([Module 20 Concept 7](../../phase-3-backend-data/module-20-user-security/README.md#7-refresh-tokens-and-logout-a-season-pass-at-the-ticket-booth)). In the research lab, the old wristband was still answered `200` for `GET /devices` after logout, while its old season pass was refused with `401` `session no longer valid: please log in again`. So **Log out** doesn't immediately kill a wristband that was already copied.

**Second, the Back button and the back/forward cache (bfcache).** When you move to another **document**, for example by typing a new address in the address bar, the browser may keep the old page whole in memory so that **Back** feels instant. In the author's test, before the cure was in place, **Log out** then **Back** restored the admin page, complete with the `Home Admin (admin)` header and the **+ New rule** button, for ±1.2 seconds, until its connection was refused. The cure is one effect in `App.tsx` (Practice 3.2): a page restored from the bfcache is reloaded right away, so `App` asks "who am I?" again.

```tsx
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) location.reload(); // persisted = restored from the bfcache, not freshly loaded
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
```

The rest is written down honestly. The old page still flashes for a moment (0.16–0.5 seconds in the author's test) before it reloads, and someone who presses **Back** and then logs in lands on the address they opened with that **Back** (just the address, not the data). If screens are only switched through the dashboard's menu and links, **Back** after **Log out** is redirected by the guard to `/login` within tens of milliseconds, without any data. On a shared computer, the safest habit is still: **Log out**, then close the tab ([🔬](#-technical-deep-dive-optional) *The back/forward cache and the `pageshow` event after Log out*; [🚨](#-troubleshooting) *After Log out, the Back button briefly shows the old screen*).

> ⬆️ **Done reading Concepts 5–6?** Continue to [Practice 3 — Roles on the screen and a complete logout](#practice-3--roles-on-the-screen-and-a-complete-logout-40-minutes). [Concept 10](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone) is read before Practice 4.

### 7. A form that checks itself: react-hook-form, not `useState` per field

This concept is read together with Concept 4, before Practice 2, and used again in Practice 8.

The Module 22 login form ([Module 22 4.3](../module-22-react-basics/README.md#43-the-login-form-srccomponentslogintsx-then-put-it-in-app-15-minutes)) gave each thing its own small whiteboard: `useState` for the email, the password, the error, and "sending". For two boxes, that's clear and enough. The rule form in Practice 8 is another story: more than a dozen fields, some of which appear and disappear depending on the "When?" and "Then?" choices, and **every** field needs its input, a "touched" mark, its own error message, and accessibility attributes. With `useState` per field, that's dozens of whiteboards and `if`s that must be kept in sync. Almost every form has these needs, so there's a library that handles them: **react-hook-form** 7.91.0.

The division of work: react-hook-form holds the inputs and the form's state, the **Zod schema** decides which inputs are valid (Concept 8), and your component only draws the boxes and their messages. The five tools you use:

| Tool | What it's for |
| :-- | :-- |
| `useForm({ … })` | creates one form: the starting values, the checker (resolver), and when to check (`mode`) |
| `{...register("email")}` | connects one box to the form: `name`, `onChange`, `onBlur`, and `ref` at once |
| `handleSubmit(submit)` | when the form is submitted, every field is checked first; `submit` is **only** called if they all pass |
| `formState` | `errors` (the messages per field) and `isSubmitting` (`true` while `submit` hasn't finished) |
| `setError(…)` | puts an error from the server's answer on its field, or on `root.server` for a general error |

This is the core of the Login form (`src/pages/Login.tsx`, [2.3](#23-the-login-screen-with-react-hook-form-and-zod-schemaslogints-and-pageslogintsx-20-minutes)):

```tsx
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(LoginInput), mode: "onTouched", defaultValues: { email: "", password: "" } });
```

```tsx
  async function submit(input: LoginInput) {
    try {
      // success: the store's user is filled in, this screen is drawn again, then the <Navigate> above moves to the destination
      useLiveStore.getState().setUser(await login(input.email, input.password));
    } catch (err) {
      // 401 "wrong email or password", 429 "too many attempts…", 503, or the backend is down: shown above the button
      setError("root.server", { message: err instanceof ApiError ? err.message : "Couldn't log in." });
    }
  }
```

- **`mode: "onTouched"`**: a field is checked for the first time when you leave it, then every time you type. The default is `"onSubmit"`, which only checks when the button is pressed. With `onTouched`, a half-typed field isn't scolded right away, but its error message goes away as soon as the input is fixed.
- **`defaultValues` holds empty texts**, not `undefined`: react-hook-form wants every field to have a starting value.
- **Every rule is in the schema.** A resolver can't be combined with react-hook-form's built-in checks (`required`, `min`, …), and `<form noValidate>` silences the browser's built-in checks. So every message comes from one source: the schema.
- **`isSubmitting`** replaces a "busy" `useState`: the button becomes `Logging in…` (in the rule form, `Saving…`) and can't be pressed twice.

**Numbers from an input box.** The content of an `<input type="number">` is still text, while the backend's schema asks for `z.number()`. `register(name, { valueAsNumber: true })` reads it as a number; an empty box becomes `NaN`, which Zod refuses with `Enter a number`. The on/off choice uses `setValueAs` so that the text `"true"` becomes `true`. In Chrome (Chromium) with an English UI, `2.5` is two and a half, but a comma is simply dropped: `2,5` becomes `25` without an error message, and `1.000` becomes 1, so write `2.5` and `1000` (Firefox and Safari not tested by the author; [🚨](#-troubleshooting) *A number in the form is read differently …*).

**Accessibility doesn't come automatically.** react-hook-form doesn't set `aria-invalid` and `aria-describedby`. The dashboard sets them itself (in `Login.tsx` directly, in the rule form through `useFieldErrors` in `fields.tsx`), so that screen readers also read the error message aloud when the box is touched. Errors from the server show with `role="alert"`.

**One form, several files.** The rule form (Practice 8) is split into `RuleForm` and three small parts: `WhenSection`, `ThenSection`, and `ConfirmDelete`. `WhenSection` and `ThenSection` use the same form through `<FormProvider>` and `useFormContext`, without passing `register` down through props. When the "When?" choice changes, the whole `condition` content is replaced at once (`setValue`), so that fields belonging to the old choice aren't sent along; the strict schema would refuse them with `Unrecognized key`. In the author's test, after going back and forth through every choice, the `POST /rules` content only held the fields of the last choice, and the backend answered `201`.

| | Module 22 (`components/Login.tsx`) | Module 24 (`pages/Login.tsx`) |
| :-- | :-- | :-- |
| Inputs and state | four `useState`s: `email`, `password`, `error`, `busy` | `useForm` |
| Checks in the browser | `required` and `type="email"`: the browser's built-in bubbles | the `LoginInput` schema, with messages under their field |
| Errors from the server | one `error` | `setError("root.server", …)` |
| After success | the device list | back to the address asked for earlier (`from`, Concept 4) |

**The link: `@hookform/resolvers` 5.9.2.** `zodResolver` comes from a separate package, `@hookform/resolvers`, which translates Zod's check results into react-hook-form `errors`. Its latest version, 6.0.0 (19 Oct 2026), only changes the support for another library (Effect), but it fails to install with npm 11.19.0, which comes with Node 24: `npm error code ERESOLVE` with `peerOptional effect@"^4.0.0"`. A command without a version number fails too, because npm picks 6.0.0. The problem has been reported on GitHub as issue react-hook-form/resolvers#882 (23 Oct 2026), and when this module was written there was no version 6.0.1 yet. That's why Practice 1.1 locks `@hookform/resolvers@5.9.2`, which installs cleanly and supports Zod 4. npm's error message offers `--force` or `--legacy-peer-deps`; don't follow it, because both accept a package set that npm itself says may be broken ([🚨](#-troubleshooting) *`npm install` stops with `npm error code ERESOLVE` …*).

Curious how React 19 makes forms without a library? See [🔬](#-technical-deep-dive-optional) *Optimistic without `useOptimistic`, and forms without react-hook-form through `useActionState`*.

> ⬆️ **Done reading Concept 4 and Concept 7?** Continue to [Practice 2 — Protected routes and a better login](#practice-2--protected-routes-and-a-better-login-55-minutes). Concept 7 is used again in [Practice 8](#practice-8--the-rule-form-create-edit-deactivate-delete-70-minutes).

### 8. One rule, two guards: the same Zod schema in the browser and the backend

This concept is read after Practice 6, before Practice 7. One of the copies it discusses, `contract.ts`, you already used in [5.1](#51-copy-contractts-then-a-sendcommand-that-checks-the-answer-with-acksafeparse-15-minutes).

The Syllabus asks for a rule form with the same Zod validation as the backend. Why check twice, and why must the checks be the same? Because the two checks have different jobs:

| Guard | Where | Its job |
| :-- | :-- | :-- |
| **1. The browser** (experience) | `zodResolver(Rule, { error: friendlyMessages })` in `RuleForm` | Fast and per field: the message shows under the wrong field before anything is sent. In the author's test, wrong input sent `POST /rules` 0 times, and the focus moved to the first wrong field. |
| **2. The backend** (protection) | `schemas/rules.ts` in `POST /rules` and `PUT /rules/:id` | Checks **every** input again, including input that doesn't come through the form (Bruno, the **Console**), then answers `400` per field. |

Guard 1 may be bypassed; guard 2 may not. But if the two guards' rules **differ**, users get confused: the form says everything's fine and then the server refuses, or the form refuses input that is actually valid. That's why both use **one** schema.

**One schema, two identical copies.** In Practice 6.1, backend 1.1 splits its rule schema. `rule-basics.ts` holds every rule shape and only imports `zod` and `contract.ts`, two things that also run in a browser. `rules.ts` is now just an `export *` from that file, plus one server-only check: whether node-cron can really run the cron expression. The frontend copies `contract.ts` (5.1) and `rule-basics.ts` ([7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes)) to `src/schemas/` **without changing a single character**, the header comment included. The explanation "this is a copy" goes in another file, `src/schemas/README.md`, because even one extra comment line would make the copy no longer identical.

![Diagram of one rule, two guards: the same Zod schema in the browser and in the backend (Concept 8). Top: backend/src/schemas/ holds rule-basics.ts (it only imports zod and contract.ts), contract.ts, and rules.ts (export * + the cron check with node-cron, server only); copied to frontend/src/schemas/ as IDENTICAL copies, not to be changed there; login.ts is not a copy. npm run check-schema prints SAME src/schemas/contract.ts and SAME src/schemas/rule-basics.ts; CRLF counts as LF, one changed character gives DIFF … from line N, exit code 1. Middle, guard 1 in the browser: react-hook-form + zodResolver(Rule, { error: friendlyMessages }). A mini form: Rule name Water if soil is below 30 %; Turns on below (%), key on_below, 30; Ends when it rises above (%), key off_above, 25 with a red edge and the message off_above must be greater than on_below (hysteresis); Must last for (seconds, 0 = at once), key for_seconds, 10; the Save rule button. Wrong input: no POST (lab: 0 requests), the focus moves to the wrong field; this hysteresis message is the backend's 400 text. Passes: POST /rules or PUT /rules/:id to guard 2 in the backend: 1 the backend's guard, admin only (403); 2 rules.ts, the SAME schema + the cron check; 3 passes, saved, 201 or 200, the rule-changed event to every dashboard; 4 fails, 400 per field, for example body/condition/cron invalid cron expression. Rules read from the database are checked too; unknown shapes are skipped with a WARN. The answer back to the browser: 201, back to /rules with the toast Rule Water if soil is below 30 % saved.; 400, the message split per field with setError, invalid cron expression under the cron field; an error for a field without a message place shows as Refused by the server: … above the Save rule button. Example table: empty name, browser Required, backend 400 Too small; off_above 25, the same hysteresis message in both; for_seconds 2.5, Enter a whole number (no decimals), backend 400 too; cron 61 * * * *, passes in the browser that only counts 5 fields, backend 400 invalid cron expression under the cron field. Why copied: the backend rules.ts imports node-cron, so in the browser fileURLToPath is not a function and the page never runs (a white screen); the frontend must build without the backend/ folder (Docker, Module 26); the price of a copy is kept in check by npm run check-schema + a PR template item.](assets/two-zod-guards.png)

**Why copied, and not imported straight from `../backend`?** The author's research tried it:

- **`rules.ts` drags node-cron**, a Node-only library, into the browser. `npm run build` still passes, with the yellow warning `Module "path" has been externalized for browser compatibility`, but the page is white with the error `fileURLToPath is not a function` in the **Console** tab, both in `npm run dev` and in `npm run preview` ([🚨](#-troubleshooting) *A white screen with `fileURLToPath is not a function` …*).
- **The backend's files look for `zod` in `backend/node_modules`.** Without `npm install` in the backend, the type check fails with `TS2307: Cannot find module 'zod'`; with it, the bundle may hold **two** copies of Zod unless `vite.config.ts` gets an extra setting.
- **The frontend must be able to build on its own**, without the `backend/` folder, for example when it's packed with Docker in Module 26.

A "one source without copying" way exists, but it needs settings you don't have to think about yet ([🔬](#-technical-deep-dive-optional) *One schema source without copying …*).

**The price of a copy is guarded by a machine.** Two copies can quietly drift apart: the backend changes, the frontend is forgotten. Because the copies are identical byte for byte, a machine can check them. `npm run check-schema` (a small Node script, `frontend/check-schema.js`) compares both files line by line with their originals in `../backend/src/schemas/`. The right result: two `SAME` lines. In the author's test, one number changed in the frontend copy was caught at once, with exit code 1 ([🚨](#-troubleshooting) *`npm run check-schema` writes `DIFF`*):

```text
SAME  src/schemas/contract.ts
DIFF  src/schemas/rule-basics.ts, from line 71:
  backend :   name: z.string().min(1).max(60),
  frontend:   name: z.string().min(1).max(80),
Copy the file again from ../backend/src/schemas/ (don't change it in the frontend), then run this again.
```

Why a script of our own, not `git diff --no-index`? Git for Windows may check out the backend file with CRLF line endings, while a copy from GitHub's **Copy raw file** ends its lines with LF. The content is the same, but `git diff --no-index --exit-code` reports all 102 lines as different: a false failure. `check-schema.js` treats CRLF as equal to LF, points to the first line that really differs, and doesn't need `git`. There's one rule: **change the backend first, copy again, then run `npm run check-schema`**. The header comment of `rule-basics.ts` says so, and the pull request template gets an item for it ([➕ D](#d-add-the-module-24-items-to-the-pull-request-template)).

**The words may differ, the rules may not.** `contract.ts` calls `z.config(z.locales.en())`, so Zod's built-in messages across the dashboard are in English, but stiff: `Too small: expected string to have >=1 characters`. The schema mustn't be changed, because the copy has to be identical. The way out is the `friendlyMessages` message map in `src/rules.ts` ([8.1](#81-form-ingredients-friendlymessages-and-parse400-in-rulests-and-field-helpers-in-fieldstsx-10-minutes)), which is only used when the form checks the input (`…` = skipped lines):

```ts
export const friendlyMessages: z.core.$ZodErrorMap = (issue) => {
  if (issue.code === "invalid_type" && issue.expected === "number") return "Enter a number";
  if (issue.code === "invalid_type" && issue.expected === "int") return "Enter a whole number (no decimals)";
  if (issue.code === "too_small" && issue.origin === "string") return "Required";
  …
  return undefined; // otherwise: Zod's built-in message (in English, from contract.ts)
};
```

This map only replaces Zod's **built-in** messages. Messages that the schema writes itself, such as the hysteresis or the "5 fields" cron message, aren't touched, so their sentences are exactly the same as the server's `400` texts. In the author's test, an emptied number field gave `Invalid input: expected number, received NaN` without the map, and `Enter a number` with it. The Zod 3 style option, `{ errorMap }`, is refused by TypeScript ([🚨](#-troubleshooting) *`npm run build` fails with a type error …*).

One input at both guards, from the author's test:

| Input | Guard 1 (browser) | Guard 2 (backend) |
| :-- | :-- | :-- |
| An empty name | `Required` | `400` `body/name Too small: expected string to have >=1 characters` |
| On below 30, ends above 25 | `off_above must be greater than on_below (hysteresis)` | `400` with the same sentence |
| `for_seconds` 2.5 | `Enter a whole number (no decimals)` | `400` too |
| Schedule `61 * * * *` | passes: the browser only counts 5 fields | `400` `invalid cron expression`, placed under the cron field |

The hysteresis message has one habit: Zod only runs that combined check when all the other fields of the "When?" part are already valid. If the message doesn't show yet, fix the other fields first, then press **Save rule**.

**Errors only the server knows still reach their field.** A `400` answer is one sentence like `body/name Too small: expected string to have >=1 characters, body/condition/cron invalid cron expression`. `parse400()` splits it per field, then `setError` puts each message under its field and moves the focus to the first field. Errors for fields without a place for a message are collected above the **Save rule** button as `Refused by the server: …`, for example `Refused by the server: condition.kind: Invalid discriminator value. Expected 'threshold' | 'schedule'` if your backend turns out to still be version 1.0 ([🚨](#-troubleshooting) *`Refused by the server: condition.kind …`*).

**The other direction is checked too.** The same schemas check the server's **answers**: `Ack.safeParse` for the command answer (5.1) and the `GET /rules` list (Practice 7). Other answers, such as `telemetry` and the history, are still trusted through TypeScript types, as in Module 23. One more thing: `schemas/login.ts` is **not** a copy. The backend's Login form schema lives in `routes/auth.ts`, not in `schemas/`, so its two lines are rewritten in the frontend; the backend still checks again.

> ⬆️ **Done reading Concept 8?** Continue to [Practice 7](#practice-7--the-rule-list-in-sentences-30-minutes), then [Practice 8](#practice-8--the-rule-form-create-edit-deactivate-delete-70-minutes) (Concepts 7 and 9 are used again there).

### 9. Rules for humans: rising or falling, hysteresis, and layered watering

Since Module 19, automation rules have been **data**: one row in the `rules` table that the backend's rules engine evaluates ([Module 19 Concept 5](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#5-the-rules-engine-rules-as-data-not-code)). Until last week, rules could only be created through Bruno, as JSON. The tester in Practice 10 won't write JSON; their task reads "make the plants get watered automatically when the soil is drier than 30 %". That's why one rule now has three forms:

| Form | For whom | The rule "Water if soil < 30 %" |
| :--- | :--- | :--- |
| JSON (`POST /rules`) | the backend and the database | `"condition": { "kind": "below-threshold", "quantity": "soil", "on_below": 30, "off_above": 35, "for_seconds": 10, … }` |
| The form ([Practice 8](#practice-8--the-rule-form-create-edit-deactivate-delete-70-minutes)) | admins | **When a number FALLS below a limit**; 30, 35, 10; then **Send one command, once**: the pump for 5 seconds |
| A sentence (`describeRule()`, [Practice 7](#practice-7--the-rule-list-in-sentences-30-minutes)) | every account, viewers included | `If the soil moisture on Practice living room is below 30 % for 10 seconds, water for 5 seconds (once). The rule is ready again after the soil moisture rises above 35 %.` |

The browser makes that sentence from the same data, so it doesn't read like the backend's log sentence.

**Four questions in one rule.** The form asks them in order:

1. **Rising or falling?** Backend v1.0 only knows the rising direction: a `threshold` condition turns on when the reading is **above** its limit (the fan when the temperature is above 30 °C). For soil that dries out, the number **falls**, so v1.0 refuses a watering rule with `400`. Backend 1.1 ([Practice 6](#practice-6--backend-11-falls-below-rules-and-deleting-rules-50-minutes)) adds the `below-threshold` condition. Its brain isn't rewritten: `evaluateBelowThreshold()` flips the sign of every number, then calls the old `evaluateThreshold()`, like a mirror image ("25 below 30" means the same as "−25 above −30"). Module 19's "for" count, reading gap, and failed-sensor handling apply too, without being copied.
2. **The on limit and the ready-again limit (hysteresis).** With only one number, soil that swings between 29 and 31% makes the pump water every time the number crosses it. That's why there are two limits: water **below 30%**, then **ready again above 35%**. The 30–35 gap is the hysteresis, like 30/28 °C for Module 19's fan. Exactly 30 doesn't water yet (it must be below), and exactly 35 isn't ready again yet (it must be above). Reversed limits are refused with `off_above must be greater than on_below (hysteresis)`, the same sentence in the browser and the backend (Concept 8).
3. **For how many seconds?** A `for_seconds` of 10 means the reading must stay below 30 for 10 seconds without a break. One reading of 30 or more, a failed reading, or a gap of more than 60 seconds without readings restarts the count from zero. In the author's lab, the 🌱 toast appeared ±15 seconds after the simulator was given `soil 25`: the 10 seconds of "for" plus the gap between messages.
4. **Then what?** Two kinds of action, which differ when the rule turns off:

| Action (the choice in the form) | When the rule turns on | When the rule turns off | For |
| :--- | :--- | :--- | :--- |
| `switch` (**Turn on while the rule is on**) | turns on the fan or the lamp | turns it off again | fan, lamp |
| `command` (**Send one command, once**) | sends its command **once**, for example the pump for 5 seconds | sends nothing; the rule is only **ready again** | pump, curtain |

The third choice in the "When?" part (on the screen: **When does this rule turn on?**), **At a set time** (a cron schedule, WIB time), may only be paired with `command`, because a schedule has no end time.

**Once, then wait.** The pump waters for 5 seconds when the rule turns on, then stays idle even if the soil stays at 25%: the decision is only made at the crossing, like Module 19's fan. The simulator doesn't wet its own soil, so in [8.5](#85--automatic-watering-from-the-form-soil-25-the-pump-waters-then-its-ready-again-15-minutes) you type a number above 35 (for example `soil 40`) in place of water. The event sentences from the author's lab recording, which later show up as toasts (Concept 10):

```text
🌱 Soil 25 % — pump watering for 5 seconds automatically
✅ Soil up to 40 % — rule ready again
⚠️ Soil 25 % — pump command refused by the device: pump refused: tank water too low
⚠️ Soil 25 % — pump did NOT answer the command (not sent again)
```

The last two lines show one decision of backend 1.1: a command that the device **refused** (the water tank below 20%) or **didn't answer** within 5 seconds isn't tried again until the soil has risen above 35% or the rule is saved again. Without that, an empty water tank would bring a new ⚠️ every few seconds. As a result, after the water tank is filled, the rule only waters again once it's triggered again ([🚨](#-troubleshooting) *The watering rule doesn't water again …*). The event also carries `data.ok`: `true` if the command was carried out, `false` if it was refused or not answered, `null` if there was no command (ready again). The dashboard colors the toast from this value, not from its sentence. One more thing: the rule's memory (whether it has watered yet) is lost when the backend restarts or the rule is changed, so if the soil is still dry after that, the pump waters once more.

**Deactivate or delete?**

| | Deactivate (**Edit** → untick **Active** → **Save rule**) | Delete (**Edit** → **Delete rule** → **Yes, delete**) |
| :--- | :--- | :--- |
| The rule | stays saved, with an `Inactive` badge, and can be activated again | gone from the `rules` table (`DELETE /rules/:id`) |
| History | stays | stays: its old commands and events are kept without a rule number |
| Acts again? | no; its old commands aren't sent again either when the device restarts | the same |

Neither one turns **off** an actuator that the rule turned on: a fan that's on is left on, as in v1.0 (the server doesn't send any command). Turn it off with the **Fan** button (Practice 5). Deleting or deactivating a fan rule also doesn't remove the `temp_fan_on` threshold already stored in Node 1 for its local safety rule ([🚨](#-troubleshooting) *The fan stays on …*).

**Layered watering: Module 24 revises a Module 19 decision.** Module 19 deliberately didn't give the pump a threshold rule on the server: Node 1 has watered by itself since Module 6, and "two brains for one pump can water twice". That warning is still true. What changed is the need: this module's pass requirement asks someone else to **create** a watering rule from the dashboard, but Node 1's local rule can't be created, seen, or deleted from the dashboard. A rule on the server can: it shows up as a sentence, can be edited and deleted, and every action it takes is recorded in the event log and shows up as a toast. So the pump now has two brains, but **layered**, not equal:

| Layer | Who | Waters when | How |
| :--- | :--- | :--- | :--- |
| Upper | the server rule (backend 1.1) | the soil is below **30%** for 10 seconds | 5 seconds, once; ready again above 35% |
| Lower | Node 1's local safety rule (firmware v1.6.0, unchanged) | the soil is below the local threshold, which you lower to **20%** with `threshold 20` in the Serial Monitor (device path; stored in NVS) | 3 seconds, a 30-second rest, repeated while it's still dry |
| Water tank | Node 1 | the tank water is below 20% | the pump is refused in both layers; a server command is answered with `pump refused: tank water too low` |

While the server is running, drying soil crosses 30% first; the server waters, and the soil rises before it touches 20%. If the server is silent (the backend is down or the Wi-Fi dropped), the soil keeps drying until it's below 20%, then Node 1 waters by itself. The principle is the same as the fan's safety rule ([Module 19 Concept 10](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#10-local-safety-node-1-guards-the-house-when-the-server-is-gone)): the server for the main decisions, the device for the safety net that must never stop. The difference: Node 1's local watering doesn't wait for offline mode; it's always on guard. What keeps the two layers apart is **the numbers**, 30 versus 20. If you forget to type `threshold 20`, the local threshold stays at its old number (usually the default 30%; check it with `threshold`), and both layers act at the same number: double watering ([🚨](#-troubleshooting) *Node 1 waters twice …*).

![Diagram of the layered watering rule: the server decides, Node 1 stands guard (Concept 9); an illustrative chart without a time scale, example soil numbers. A soil moisture chart from 10 to 50 % with three lines: 35 % ready again and 30 % server waters (green, the hysteresis band 30–35 % between them), 20 % Node 1 waters (teal, threshold 20). Left, server online (backend 1.1 running); right on a gray background, server silent: backend stopped or Wi-Fi down. The soil falls from 44 %, below 30 % for 10 seconds, then the server waters at 25 % (marker 1) and the soil rises to 36 %, above 35 % (marker 2). While the server is silent the soil falls below 30 % with nobody watering (marker 3), then below 20 % Node 1 waters (marker 4) and the soil rises again. The pump lane: 5 seconds (server, once) and 3 seconds (Node 1). Notes: 1 below 30 % for 10 seconds, pump 5 seconds ONCE, toast 🌱 Soil 25 % — pump watering for 5 seconds automatically; 2 above 35 %, the rule is ready again, toast ✅ Soil up to 36 % — rule ready again; 3 server silent, nobody waters yet, no event; 4 Node 1 waters by itself for 3 seconds, rests 30 seconds, repeats while still dry. Server card, backend 1.1: below-threshold with on_below 30, off_above 35, for_seconds 10; a command action pump 5 seconds sent ONCE; refused or unanswered, not tried again until the soil is above 35 % or the rule is saved again. Node 1 card, safety rule: firmware v1.6.0 unchanged; default 30 %, type threshold 20 in the Serial Monitor (stored in NVS); if you forget, double watering at 30 %. Tank card: below 20 % Node 1 refuses the pump from the server and locally, pump refused: tank water too low; simulator: tank 15, and since its soil does not get wet by itself, type soil 25, then soil 40. Bottom: Module 19's decision revised, back then the pump had no threshold rule on the server because two brains for one pump could water twice; now layered, one brain while online (server, 30 %) and a local safety rule while it is silent (Node 1, 20 %), like Module 19's safety fan.](assets/layered-watering-rule.png)

To be honest about the proof: the upper layer was proven by the author with the simulator `f00d00000001` and a mock device. The lower layer was read from Node 1's firmware v1.6.0 and **hasn't been tested by the author on a real board**. The simulator has no lower layer (it doesn't water by itself), but it imitates the tank safety check: after `tank 15`, it refuses the pump ([6.5](#65-the-simulator-soil-and-tank-typed-in-the-terminal-5-minutes)).

This concept is used three times: in the schema, engine, and automation of backend 1.1 in [6.1](#61-schema-11-rule-basicsts-without-node-cron-and-a-thin-rulests-10-minutes)–[6.3](#63-two-way-automation-a-one-time-command-and-delete-rulesid-15-minutes), in the rule sentences of Practice 7, and in the "When?" and "Then what happens?" parts of the form in [8.2](#82-three-parts-of-the-form-whensection-thensection-and-confirmdelete-15-minutes).

> ⬆️ **Done reading Concept 9?** Continue to [Practice 6 — Backend 1.1: "falls below" rules and deleting rules](#practice-6--backend-11-falls-below-rules-and-deleting-rules-50-minutes). [Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend) is read before Practice 7.

### 10. On-screen notices: toasts, `aria-live`, and where they go on a phone

Since Module 19, the backend has recorded every important thing in the **event log**: a rule acting, a schedule running, a device disconnecting, a command sent again. The Socket.IO event that carries them, `event`, has reached the dashboard since Module 23, but v0.2 doesn't use it yet; only [🧩 Module 23 Level 2](../module-23-realtime-dashboard/README.md#level-2--a-live-event-log-fill-in-the-blanks-45-minutes) tried it. This week those notices show up as **toasts**: small cards that appear for a moment, then disappear by themselves.

**Two sources of notices.**

| Source | Examples (texts from the author's lab recording) | Shown in |
| :--- | :--- | :--- |
| Answers to your own action (HTTP) | `Rule "Water if soil < 30 %" saved.` · `Lamp: the server didn't answer.` · `Lamp: not confirmed by the device yet; the server will try again when it hears from the device.` | only the tab that acted |
| `event` messages from the backend | `🌱 Soil 25 % — pump watering for 5 seconds automatically` · `f00d00000001 disconnected (offline)` · `lamp f00d00000001 reported false, but true is desired (api); command sent again` | every connected dashboard |

One kind of event is deliberately **not** a toast: `rule-changed`. Whoever saved the rule already gets a toast from their HTTP answer; other dashboards only fetch the rule list again if the **Rules** screen is open. Notices missed while the dashboard's socket was down aren't sent again (Module 23), but device statuses are caught up through one `GET /devices` after reconnecting ([4.3](#43-the-connection-recovers-the-status-is-refreshed-get-devices-once-more-10-minutes)).

**A toast, a message at the field, or a badge?** A toast disappears by itself, so not every notice suits it:

| Notice | Its place |
| :--- | :--- |
| something that **has happened** (saved, watering, disconnected) | a toast |
| wrong form input | under its field, until it's fixed (Concept 7) |
| a state that is **ongoing** (**Live**, `Offline`, `Waiting for device confirmation…`) | a badge or text in its place, for as long as the state holds |

**This dashboard's toast rules** (`src/toast.ts` and `ToastRegion`, [4.1](#41-toastts-and-toastregion-at-the-bottom-of-a-phone-at-the-top-right-of-a-wide-laptop-15-minutes)):

1. **Gone by itself after 4 seconds** through a one-shot `setTimeout` (not `setInterval`, not polling), or sooner through a 44 px wide ✕ button.
2. **At most 2.** A third toast pushes the oldest one out. On a phone, two three-line toasts already take ±212 px, a quarter of an 812 px tall screen. Events that are pushed out are still recorded in the backend's event log.
3. **Color from the data, not from the sentence.** An `event` notice is red if the device's `status` is now offline (read from the store) or the rule's or schedule's `data.ok` is `false` (Concept 9); otherwise it's neutral. The backend's sentences can change words without changing meaning, so guessing from the word "refused" easily misses. Color always comes with an icon (`!`, `i`, `✓`) and text.
4. **One event, one toast.** The `event` listener is a named function removed with `off`, like `telemetry` in Module 23, so StrictMode doesn't double it ([4.2](#42-event-messages-become-toasts-a-named-listener-and-off-10-minutes)). Messages from the server are shown as text, not HTML.

**`aria-live`: a region that's there from the start.** Screen readers read the part that has the focus. A toast appears somewhere else without moving the focus, so someone who can't see the screen doesn't know there's a notice, unless its region is marked as a **live region**: `<div role="status" aria-live="polite">`. New content in that region is read aloud; `polite` means it waits until the sentence being read is finished. The condition: the region must exist **before** its content changes (MDN: *establish the live region before updating its content*). That's why `ToastRegion` is placed once in `Layout` and is always there, even when empty; only its cards come and go. The `Waiting for device confirmation…` note under the control buttons (Practice 5) uses the same `role="status"`. This is a status message according to WCAG 2.2, the web accessibility guidelines (SC 4.1.3, level AA; see Concept 11): announced without moving the focus. The honest limits: it hasn't been tested with a real screen reader (NVDA, VoiceOver), and some screen readers may read the region's whole content again. Keyboard users meet the ✕ of a toast that's showing right after the **Log out** button in the Tab order, even though on a phone the toast appears at the bottom of the screen.

**Its place: at the bottom of a phone screen, at the top right of a wide laptop.** The rule is one sentence: toasts may sit beside the content only if there's empty space beside it (screens of 1280 px and wider); on phones and tablets, toasts sit at the bottom of the screen, and the page gets empty space at the bottom as tall as two toasts. Why not just at the top? In the author's lab, one toast under the page header already covered the **+ New rule** button at widths of 375, 768, and 1024 px; only at 1280 px is there empty space to the right of the content column. The classes that do it:

| File | Classes | What they do |
| :--- | :--- | :--- |
| `ToastRegion.tsx` | `fixed inset-x-0 bottom-0` | below 1280 px, the region sticks to the bottom edge of the screen (`fixed`: it stays put even when the page scrolls) |
| `ToastRegion.tsx` | `xl:sticky xl:top-0 xl:bottom-auto xl:h-0` | from 1280 px on (`xl:`), a region of zero height under the header (`sticky`: it scrolls along, then sticks to the top edge); its cards hang in the empty space on the right |
| `ToastRegion.tsx` | `pointer-events-none` (cards: `pointer-events-auto`) | the region's empty space doesn't block taps |
| `Layout.tsx` (`<main>`) | `pb-64 xl:pb-6` | 16rem (256 px) of empty space at the end of the page: the bottom-most button can be scrolled above the toasts |
| `index.html` (`<html>`) | `scroll-pb-64 xl:scroll-pb-0` | when the browser scrolls **by itself** to a field or button (Tab, a wrongly filled field), it leaves 16rem free at the bottom (not when a thumb scrolls) |

The distance from the bottom edge is at least 1rem, or the height of the phone's system bar or buttons (`env(safe-area-inset-bottom)`, 0 in an ordinary browser). In the author's lab (DevTools device mode, not a real phone), no action button was covered in 153 test positions, at 375 × 812 and 1280 px, light and dark. A button that happens to be right at the bottom edge of the screen when a toast arrives stays covered until the page is scrolled a little, the toast is closed, or 4 seconds pass. On a short phone (375 × 667), two toasts at once can cover the pump row until the page is scrolled ±60 px. On a phone turned sideways or one that's 320 px wide, toasts can cover the Lamp, Fan, or pump buttons ([🚨](#-troubleshooting) *Toasts cover …*): hold the phone upright when testing, and if the tester in Practice 10 gets stuck because of it, record it as a finding.

> ⬆️ **Done reading Concept 10?** Continue to [Practice 4 — On-screen notices: toasts](#practice-4--on-screen-notices-toasts-40-minutes). [Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack) and Concept 2 are read before Practice 5.

### 11. Used by someone else: basic accessibility, the home screen, and a user test

You don't do this module's pass requirement yourself: someone else, with their own phone and without your help, must be able to log in, turn on the lamp, and create a watering rule. You know where every button is because you made them; the tester sees them for the first time. Three things prepare the dashboard for those fresh eyes.

**Basic accessibility: measured, not felt.** Since Modules 22–23, the dashboard has had 44 px finger targets (`min-h-11`), no horizontal scrolling at 375/768/1280 px, and colors that always come with text. This week the rest is measured with the numbers of **WCAG 2.2**, the W3C's web accessibility guidelines. Each of its items is called an SC (success criterion) and has a level, A, AA, or AAA (the strictest); this module aims for AA. Contrast is written as the ratio of the text's lightness to its background's, from 1 : 1 (the same color) to 21 : 1 (black on white). The measuring tools are Lighthouse (an automatic checker in DevTools) and the Color Picker:

| What's checked | The limit | Where |
| :--- | :--- | :--- |
| Text contrast | **4.5 : 1**; large text (≥ 24 px, or ≈ 18.5 px bold) 3 : 1 (SC 1.4.3, AA) | 9.1: Lighthouse, Color Picker |
| Contrast of components and state marks (field edges, focus rings, pressed buttons) | **3 : 1** against the color next to it (SC 1.4.11, AA) | 9.1, 9.2 |
| Touch targets | at least **24 × 24 px** (SC 2.5.8, AA, new in WCAG 2.2); the curriculum uses **44 × 44 px** (SC 2.5.5, AAA; = Apple's default size of 44 pt; Android 48 dp) | 9.2 |
| Visible focus | a focus ring shows when you press Tab (SC 2.4.7, AA) | 9.2 |
| Labels and errors | `<label htmlFor>`; `aria-invalid` + `aria-describedby` when the input is wrong (react-hook-form doesn't set them by itself) | Practices 2 and 8 |

In the author's lab, the dashboard at the Practice 8 stage didn't yet pass several limits: white text on teal-600 was only 3.66 : 1 (the **Log in** and **Save rule** buttons, and the **Lamp** button when it's on), `text-slate-400` on white 2.63 : 1, `text-slate-500` on a `slate-100` background 4.34 : 1, the Login screen had no `<main>`, and a focused field's edge was 2.42 : 1. The fix is three color rules ([9.1](#91-lighthouse-and-the-color-picker-measure-the-contrast-then-fix-the-colors-15-minutes)): white text on teal → **teal-700** (5.36 : 1); dim text on a light gray background → **slate-600**; `slate-400` only for dark mode. The fields' focus ring uses teal-700 too (9.2), and the Login screen is wrapped in `<main>` (9.1). Afterwards Lighthouse gave 100 on every screen, light and dark. Two notes: the score depends on the screen content and the tool version, so what you're after is a failing audit that passes, not the number; and passing Lighthouse means "passes the basic checks", **not** "is accessible" (some audits must be checked by a person).

**The home screen: a shortcut, not an installed app.** You already made home-screen shortcuts in [Module 13](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#34-open-the-dashboard-on-the-laptop-and-the-phone) and [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#practice-8--a-lamp-switch-on-your-phone-20-minutes). What's new:

- **The menu labels have changed.** Chrome Android's official help now writes ⋮ → **Install and create shortcut** → **Create shortcut** → **Add**; that shortcut, with the Chrome logo on it, opens in Chrome. On an iPhone, **Share** → **Add to Home Screen**; since Safari 26 (iOS 26), every site on the home screen opens as a web app by default. For an `http://` address on the home Wi-Fi, neither **has been tested by the author on a real phone**.
- **A shortcut ≠ an installed app.** On a phone, the dashboard is opened through `http://192.168.1.10:5173` (your IP will differ). An `http://` address other than `localhost` isn't a **secure context** (only HTTPS or `localhost` are secure): when the dashboard was opened through the LAN IP in the author's lab, `isSecureContext` was `false` and the service worker (a background script for offline use and notifications) wasn't available. Chrome's install requirements also include HTTPS, so a real PWA (progressive web app, a web app that can be installed) waits for Module 27. All we add in [9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes) is the shortcut's icon and name: `apple-touch-icon.png` 180 × 180 (our own picture) and `<meta name="apple-mobile-web-app-title" content="Smart Home">`. The details are in [🔬](#-technical-deep-dive-optional) *Home-screen shortcuts and installed apps*.
- **The laptop's IP can change**, and the shortcut breaks with it ([🚨](#-troubleshooting) *The home-screen shortcut on the phone …*).

**The user test: someone else, their own phone, no help.** The most honest way to find out whether the dashboard is easy to use is to watch someone else use it. The test in [10.3](#103--the-user-test-on-the-testers-phone-four-tasks-without-help-25-minutes) holds three rules:

1. **Tasks in everyday language.** The task sheet (`code/user-test/task-sheet.md`) holds four tasks: log in, turn on the lamp, "make the plants get watered automatically when the soil is drier than 30 %", and log out. No words like MQTT, ack, or menu names: finding the **Rules** menu by themselves is part of the test.
2. **Talking while doing** (think-aloud). The tester says what they're thinking ("I'm looking for a button…", "what does this mean…"), so you learn **where** they hesitate, not only whether they succeed.
3. **No help.** While a task is running, you may only read its sentence out again: no pointing at the screen, no naming buttons, no holding their phone. Stuck for more than 2 minutes, giving up, or asking directly = that task was **helped**. You may help so the test can go on, but that task hasn't passed: fix what was confusing (a label, a position, a message), then repeat it.

![Diagram of the user test: someone else, their own phone, without help (Concept 11, Practice 10; sheets in code/user-test/). 1 Preparation: a temporary admin tester account with npm run users -- add tester@home.test Tester admin from PowerShell or the macOS Terminal, a password of at least 15 characters on a paper card; starting state lamp off, no watering rule yet, simulator tank random and soil random, the viewer account ready for L4; phone mode (HOST=0.0.0.0, the laptop IP in CORS_ORIGIN, npm run dev:phone), the tester's phone first opens http://laptop-IP:8080/health. 2 Four tasks on the tester's phone: open http://laptop-IP:5173 and log in (L1); turn on the lamp (L2); get the plants watered automatically when the soil is drier than 30 % (L3); log out; the tester thinks aloud while working. 3 The no help rule: the learner only reads the task out again; a time bar, green success up to 2 minutes, after that orange stuck = helped; only success counts as a pass. 4 Write down every task: result, time, quotes without a name, and evidence from the backend log (login: account N (admin), session N, IP 192.168.…; … lamp = true, ack ok=true in N ms; Rule N (…) created through the API; logout: session N). Orange branch, some tasks were helped: 5 fix the confusing label, position, or message and note the change; 6 repeat that task with the same tester after a break or another tester, several rounds allowed, back to the tasks. Green branch, all succeeded: 7 L4, the learner logs in as viewer on the same phone, no control buttons, no + New rule, no Edit; then npm run users -- delete tester@home.test, tear up or keep the password card, back to laptop mode, the phone cannot open it again. Note: filled-in sheets in learn-iot/module-24/ without password, full name, or face photo; recording permission may be refused; with no tester yet, write it honestly, never make up results.](assets/user-test.png)

A tester who gets stuck gives you a finding about **the dashboard**, not about themselves; the task sheet tells the tester so from the start. Write down every task in `notes-sheet.md`: success or helped, the time, quotes without names, and the backend log line as evidence, for example `login: account N (admin), session N, IP 192.168.…` (the tester's phone IP, not the laptop's). One tester already meets the requirement; two or three are recommended. You check the L4 requirement (a viewer account without control buttons) yourself on the same phone afterwards. The tester account (`tester@home.test`, admin role) is only temporary: its password lives on a paper card, and the account is deleted after the test. Ask permission before recording, and keep the sheets without full names, passwords, or face photos.

What's not allowed: making up results. If there's no other person or real phone yet, write "not yet", don't tick. DevTools device mode ([Module 22 7.1](../module-22-react-basics/README.md#71-devtools-device-mode-the-dashboard-at-375-768-and-1280-px-8-minutes)) helps for a rehearsal, but it doesn't replace someone else's phone. The author's own test status is written as it is in the note box at the start of the module and in [📚](#-sources--image-credits).

> ⬆️ **Done reading Concept 11?** Continue to [Practice 9 — Accessibility, the phone, and the home screen](#practice-9--accessibility-the-phone-and-the-home-screen-40-minutes), then [Practice 10 — The pass test: used by someone else on a phone](#practice-10--the-pass-test-used-by-someone-else-on-a-phone-70-minutes).

## 🔧 Step-by-step practice

Ten practices turn dashboard v0.2, which **watches**, into dashboard v1.0, which **commands**, in the `frontend` folder of the `mini-smart-home` repository, on the new `feature/controls-roles` branch. Only Practice 6 changes the `backend` code (up to 1.1.0) and the simulator in `tools/`; the firmware doesn't change. Every practice that changes code ends with a commit to that branch, which is merged into `main` through a pull request in [➕ E](#e--merge-featurecontrols-roles-into-main-via-the-dashboard-v10-controls--roles--backend-11-pull-request).

The state of `frontend` at the end of every practice is in [`code/stages/`](code/stages/); there's no `practice-6`, because Practice 6 only changes the backend and the simulator (its frontend is the same as stage 5). The final result: dashboard 1.0.0 in [`code/frontend/`](code/frontend/), backend 1.1.0 in [`code/backend/`](code/backend/) with its list of changes, [`code/backend-1.1.diff`](code/backend-1.1.diff), and the simulator in [`code/tools/`](code/tools/) with [`code/tools.diff`](code/tools.diff). The stage folders have no `node_modules`, `package-lock.json`, or `README.md`: use them to compare, not to replace your whole folder. The steps marked ⭐ (1.5, 2.4, 3.3, 5.5, 6.4, 8.5, and 10.3) are required to pass, plus ➕ E. Every practice uses the stack from [Quick Win Step 1](#step-1--start-everything-then-log-in-as-admin-4-minutes).

### Practice 1 — One address for every screen: React Router (50 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and the Quick Win terminals: `backend`, `frontend` (Vite), and one free terminal for Git and npm (laptop path: the broker and the simulator in `tools` keep running); **Docker Desktop** (`smarthome-db`); and **Chrome** or **Edge**. Concepts used: 3.
>
> ⭐ **Required** — step 1.5: **Back**, **Forward**, **F5**, and direct links open the same screen, unknown addresses are answered with "not found", and switching screens doesn't add a single new live connection.

This practice gives every screen its own address: the List `/devices`, the Details `/devices/:id`, and the History `/devices/:id/history`, plus a "not found" screen and the **Devices** menu. The login form is still the old one, without a guard per page (Practice 2). The code at the end of this practice: [`code/stages/practice-1/frontend/`](code/stages/practice-1/frontend/).

#### 1.1 The `feature/controls-roles` branch and four packages at their written versions (5 minutes)

In the free terminal (the `mini-smart-home` folder), switch to the latest `main`, then create a branch for all of Module 24's work:

```text
git switch main
git pull
git switch -c feature/controls-roles
git status
```

`git pull` brings in dashboard v0.2 from Module 23's pull request. `git status` must answer `nothing to commit, working tree clean`; if `FirstButton.tsx` or `DeviceDetails.tsx` is still mentioned, finish [Quick Win Step 5](#step-5--delete-firstbuttontsx-2-minutes) first. Then:

```text
cd frontend
```

Stop Vite in the `frontend` terminal (**Ctrl + C**) and leave it stopped until the end of 1.4: the files replaced in 1.2–1.4 depend on each other, so the dashboard only runs again after all of them are saved. Then, in the free terminal (the `frontend` folder), install all four packages at once, **with their versions**:

```text
npm install react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7
```

`react-router` is for this practice; `react-hook-form`, `@hookform/resolvers` (the link between the form and Zod), and `zod` (the same version as the backend) are for the forms in Practices 2 and 8. `react-router-dom` isn't installed: v8 removed it; everything is imported from `"react-router"`.

**Expected output (example):**

```text
added 6 packages, and audited 106 packages in 44s

18 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Six packages = the four you asked for plus two helper packages. It took 9–44 seconds in the author's lab, without warnings. The `dependencies` in `package.json` now hold four new lines, for example `"react-router": "^8.5.0"`; `"version"` stays `0.2.0` until Practice 10. Got `npm error code ERESOLVE`? The `@hookform/resolvers` version is missing from your command ([🚨](#-troubleshooting) *`npm install` stops with `npm error code ERESOLVE` …*; the full versions are in [🧰](#-what-you-need)).

#### 1.2 `BrowserRouter` in `main.tsx` and the route map in `App.tsx` (10 minutes)

**Step 1 — `main.tsx`.** `<BrowserRouter>` reads the browser's address and history (**Back**, **Forward**), then shares them with the whole dashboard, so it wraps `<App />`. Replace the whole content of `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// Module 24: BrowserRouter reads the address in the browser (for example /devices/f00d00000001) and hands it to <Routes> in App
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

What's new: the `BrowserRouter` import, one comment, and the two wrapping lines. Save (**Ctrl + S**). In the `vite.config.ts` comment, change `(Practice 8)` to `(Module 23 Practice 8)` so it doesn't get mixed up with this module's Practice 8, then save.

**Step 2 — the route map in `App.tsx`.** Open [`code/stages/practice-1/frontend/src/App.tsx`](code/stages/practice-1/frontend/src/App.tsx) on GitHub, click **Copy raw file**, then paste it in place of the whole content of your `src/App.tsx`. Module 23's `view` whiteboard and `currentScreen` variable are gone. The content of `<main>` is now the list of every address in one place:

```tsx
        <Routes>
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DetailsPage />} />
          <Route path="/devices/:id/history" element={<HistoryPage onSessionExpired={handleSessionExpired} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
```

- Every `<Route>` = one route: an address pattern (`path`) → a screen (`element`); `:id` = the part of the address that changes.
- `/` is redirected to `/devices` by `<Navigate replace>`; `replace` overwrites the history entry, so **Back** doesn't get stuck at `/`.
- `path="*"` catches every other address (1.4). `HistoryPage` receives `onSessionExpired` like `DeviceHistory` did before (`401` → the login form).
- `useRealtime()` is still called once, above `<Routes>`: screens come and go, the socket stays (Concept 3).

Save. The red lines in VS Code (the `./pages/…` files that don't exist yet, then the missing props) disappear after 1.4.

#### 1.3 Screens from the address: `src/pages/` and `useParams` (15 minutes)

The Details can now be opened without passing through the List (a link, **Back**, **F5**), so it looks up its device itself, from the address.

**Step 1 — `GET /devices` once after logging in.** The `App.tsx` you pasted already does this: the effect below `useRealtime()` calls `getDevices()` every time `loggedIn` becomes `true`, then puts the result (`setDevices`) or its error message (`setDevicesError`) in the [store](../module-23-realtime-dashboard/README.md#4-one-store-for-every-screen-zustand-and-selectors). Replace the whole content of [`src/store.ts`](code/stages/practice-1/frontend/src/store.ts) with this stage's version (**Copy raw file**). The only new things are the `devicesError` field (`null` at first, cleared again by `setDevices`) and its setter:

```ts
  setDevicesError: (message) => set({ devicesError: message }),
```

Do the same for [`src/components/DeviceList.tsx`](code/stages/practice-1/frontend/src/components/DeviceList.tsx): its `getDevices()` effect and its props are dropped, this screen only reads `devices` and `devicesError` from the store, and every card becomes a `<Link>` (1.4).

**Step 2 — the `src/pages/` folder.** Right-click the **`frontend/src`** folder → **New Folder…**, and name it **`pages`**: one thin wrapper file per screen, holding the old component. Create **`src/pages/Devices.tsx`**:

```tsx
// pages/Devices.tsx - the /devices screen: a title + the device cards (Modules 22-23).
// Module 24: every screen has a thin wrapper file in the pages/ folder. Its content is still the old component.
import DeviceList from "../components/DeviceList";

export default function DevicesPage() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Device List</h2>
      <DeviceList />
    </>
  );
}
```

Then **`src/pages/Details.tsx`**, the screen that reads its own address:

```tsx
// pages/Details.tsx - the /devices/:id screen. Its device is looked up from the ADDRESS (useParams), not handed over by the
// Devices screen, so this address can be opened directly, reloaded (F5), or sent to someone else.
import { Link, useParams } from "react-router";
import DeviceDetails from "../components/DeviceDetails";
import { useLiveStore } from "../store";

export default function DetailsPage() {
  const { id } = useParams(); // the :id part of the address, for example "f00d00000001"
  const list = useLiveStore((s) => s.devices); // null = GET /devices not answered yet
  const error = useLiveStore((s) => s.devicesError);
  const device = list?.find((p) => p.device_id === id);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  if (list === null) return <p className="text-slate-500 dark:text-slate-400">Loading devices…</p>;
  // an id that isn't in the list (a typo, a deleted device): nothing is requested from the API
  if (device === undefined) {
    return (
      <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p>
          Device <span className="font-mono">{id}</span> not found.
        </p>
        <Link to="/devices" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
          ← Back to the list
        </Link>
      </div>
    );
  }
  // key = device_id: another device means a new DeviceDetails with fresh state (React's official pattern, Module 22)
  return <DeviceDetails key={device.device_id} device={device} />;
}
```

- `useParams()` gives `{ id: "f00d00000001" }` for the address `/devices/f00d00000001` (the name `id` comes from the pattern `:id`).
- Before the Details is drawn: an error, `Loading devices…` (for example for a moment after **F5**), or `Device … not found.` if the `id` isn't in the list, without asking the API.
- `key={device.device_id}`: another device = a new `DeviceDetails` with fresh state (the Module 22 pattern).

Last, **`src/pages/History.tsx`**, the twin of `Details.tsx` that puts up the `DeviceHistory` component and passes on `onSessionExpired` from `App`. Take its content from [this stage's version](code/stages/practice-1/frontend/src/pages/History.tsx) (**Copy raw file**).

#### 1.4 `Link` and `NavLink`: the menu, the back buttons, and unknown addresses (10 minutes)

Switching screens now = switching addresses. `<Link to="…">` is a real link (it can be opened in a new tab) that changes the address **without reloading the page**, so the store and the socket stay alive.

**Step 1 — the back links.** Replace the whole content of [`src/components/DeviceDetails.tsx`](code/stages/practice-1/frontend/src/components/DeviceDetails.tsx) and [`src/components/DeviceHistory.tsx`](code/stages/practice-1/frontend/src/components/DeviceHistory.tsx) with this stage's versions (**Copy raw file**). The `onBack`/`onHistory` props are dropped: **← Back to the list**, **History →**, and **← Back to the details** are now `<Link>`s, for example `<Link to="/devices">`.

**Step 2 — the "not found" screen.** Create **`src/pages/NotFound.tsx`**:

```tsx
// pages/NotFound.tsx - the screen for an address that isn't on the route map (Route path="*"), for example /devics.
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="mt-1 text-sm">This address doesn't exist in the dashboard. A typo, maybe?</p>
      {/* <Link> = React Router's link: switches screens WITHOUT reloading the page (the live connection stays up) */}
      <Link to="/devices" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
        To the device list
      </Link>
    </div>
  );
}
```

The `path="*"` route puts it up for addresses that don't match, for example the typo `/devics`.

**Step 3 — the `NavLink` menu.** The header of the `App.tsx` you pasted in 1.2 has its first menu item:

```tsx
            <NavLink
              to="/devices"
              className={({ isActive }) =>
                "inline-flex min-h-11 items-center rounded-lg px-3 " +
                (isActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700")
              }
            >
              Devices
            </NavLink>
```

`NavLink` = a `Link` that knows whether its address is open (`isActive`). Without the `end` prop, the **Devices** menu is also active at `/devices/<id>` and its History, and the active link gets `aria-current="page"` for screen readers. The **Rules** menu follows in Practice 7.

**Step 4 — start it.** All the red lines in VS Code should be gone by now. In the `frontend` terminal, run `npm run dev`.

**Expected output (example):**

```text
> mini-smart-home-frontend@0.2.0 dev
> vite

12:21:43 PM [vite] (client) Re-optimizing dependencies because lockfile has changed

  VITE v8.3.5  ready in 452 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

`Re-optimizing dependencies …` shows up once, on the first `npm run dev` after new packages are installed. Open `http://localhost:5173` and log in (if asked): the address becomes `/devices` and the **Devices** menu is marked. Tap a card: the address is `/devices/<device_id>`, and the menu stays marked.

#### 1.5 ⭐ Back, F5, and direct links: the screen stays, the live connection doesn't drop (10 minutes)

Put the `backend` terminal next to the browser, then:

1. On the List, tap the **Practice living room** card (device path: your Node 1), then **History →**. Press **Back**, then **Forward**, then go back and forth again through the links and the **Devices** menu (the author: ten screen switches).
2. Press **F5** on the Details, then on the History.
3. Copy the Details address, open a new tab in the same browser, paste it, then press **Enter** (for when you're not logged in yet, see [2.4](#24--a-direct-link-before-logging-in-to-login-then-back-to-the-same-screen-10-minutes)).
4. Type `localhost:5173/devices/abcdef` in the address bar, then `localhost:5173/not/there`, then `localhost:5173/`.

**Result:** **Back** from the History returns to the Details `/devices/f00d00000001`, **Forward** to its History again. **F5** and the new tab stay at their address: the Details shows again with `Online`, the History with `1 hour`, `24 hours`, `7 days`. `/devices/abcdef` writes `Device abcdef not found.`; `/not/there` writes `Page not found` and `This address doesn't exist in the dashboard. A typo, maybe?` with the link **To the device list** (the **Devices** menu isn't marked); `/` moves to `/devices` by itself. In the `backend` terminal (**example**):

```text
[12:22:03] INFO: realtime client connected: 50pyM87L9Clt-WxEAAAC (account 1, admin)
…
[12:22:08] INFO: GET /devices/f00d00000001/readings?from=2026-10-25T05:17:08.692Z -> 200 (6 ms)
[12:22:08] INFO: GET /devices/f00d00000001/readings?from=2026-10-25T05:17:08.700Z -> 200 (4 ms)
[12:22:09] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (34 ms)
[12:22:09] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (18 ms)
…
[12:22:24] INFO: GET /auth/me -> 200 (4 ms)
[12:22:24] INFO: GET /auth/me -> 200 (2 ms)
[12:22:24] INFO: realtime client connected: nZ8woxccz_w9_NkNAAAD (account 1, admin)
```

While you switch screens there are only `GET …/readings` lines: the Details' 5-minute chart (`from=…`) and the History's hourly averages (`bucket=1h`), each twice because of StrictMode in dev mode. There's no new `realtime client disconnected` or `connected` line; in the author's test, ten screen switches added 0 connections. The last three lines belong to the first **F5**: reloading creates a new document, so `GET /auth/me` asks again and a new socket connects. That's normal for **F5**, a new tab, and a typed address, but not for links and the menu.

**You pass this ⭐ step** when **Back**, **Forward**, **F5**, and a new tab always show the screen that matches the address, both unknown addresses are answered with "not found" without a white screen, and the backend log doesn't write a new `realtime client connected` while you switch screens through links and the menu. Other symptoms are in [🚨](#-troubleshooting): *F5 on `/devices/…` gives a white screen …*, *The Devices menu isn't marked active …*, and *The live connection drops …*.

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` names nine changed files (`package.json`, `package-lock.json`, `vite.config.ts`, `main.tsx`, `App.tsx`, `store.ts`, and three components) and `src/pages/` under `Untracked files`. Then:

```text
git add package.json package-lock.json vite.config.ts src
git commit -m "React Router: one address for every screen (Module 24 Practice 1)"
```

> ⬆️ **Done with Practice 1?** Every screen now has an address, but it isn't guarded yet: the old login form still decides everything. Read [Concept 4](#4-protected-routes-a-guard-at-the-door-of-a-page) and [Concept 7](#7-a-form-that-checks-itself-react-hook-form-not-usestate-per-field), then continue to [Practice 2 — Protected routes and a better login](#practice-2--protected-routes-and-a-better-login-55-minutes).

### Practice 2 — Protected routes and a better login (55 minutes)

> 🖥️ **Tools used:** **VS Code** with Practice 1's terminals still running (`backend` v1.0 with `npm run dev`, Vite in `frontend`; on the laptop path also the broker and the simulator) plus one free terminal in the `frontend` folder for Git; **Docker Desktop** (`smarthome-db` running); and **Chrome** or **Edge** at `http://localhost:5173` with DevTools (the **Console** and **Network** tabs) and a private window in 2.4. Concepts used: 4 and 7.
>
> ⭐ **Required** — step 2.4: a History address opened without logging in moves to `/login`, then goes back to the same History after you log in.

After Practice 1, every screen has an address, but there's still only one door: an `if` in `App.tsx` picks Module 22's `Login.tsx` or the whole dashboard. This practice puts a guard at the door of the pages (Concept 4) and adds a Login screen that checks its own input (Concept 7). The packages were already installed in [1.1](#11-the-featurecontrols-roles-branch-and-four-packages-at-their-written-versions-5-minutes). The order of pasting matters: the new `App.tsx` imports `pages/Login.tsx`, so it's replaced last, at the end of 2.3. Until then, the old `App.tsx` keeps running your dashboard, and red lines in the editor are normal.

#### 2.1 Who is logged in: a session slice in `store.ts` and `GET /auth/me` once (10 minutes)

In Practice 1, `user` was still `App`'s small whiteboard (`useState`), and `App` passed `handleSessionExpired` to the History through props. Now the guard, the frame, and the Login screen also need to know who's logged in. Instead of passing it down a chain, the answer goes on the shared notice board, the Zustand store, as a **session slice** (the part of the store that handles the session).

**Step 1 — The store.** Open [`code/stages/practice-2/frontend/src/store.ts`](code/stages/practice-2/frontend/src/store.ts) on GitHub, click **Copy raw file**, then paste it in place of the whole content of your `src/store.ts`. The `LiveStore` type gets four new fields, and their starting values are:

```ts
  user: "loading",
  loginMessage: null,
  setUser: (user) => set({ user, loginMessage: null }),
  setNotLoggedIn: (message) => set({ user: null, loginMessage: message }),
```

`user` has three states: `"loading"` (`GET /auth/me` isn't answered yet, which is why it's the starting value), `null` (not logged in), or an object `{ id, email, name, role }`. `loginMessage` is the line above the Login form: `setNotLoggedIn` fills it (or sets it to `null`), and `setUser` clears it. At the very bottom of the file is a new function, `handleSessionExpired()`, which calls `setNotLoggedIn("Your session has expired. Please log in again.")`. Because it's outside any component, this function is never created again, so Module 23's `useCallback` isn't needed anymore. The role still lives only in the tab's memory, never in `localStorage`.

**Step 2 — The History takes `handleSessionExpired` from the store.** Replace the whole content of `src/pages/History.tsx` with [its stage version](code/stages/practice-2/frontend/src/pages/History.tsx) (**Copy raw file**): the `onSessionExpired` prop is gone, and `handleSessionExpired` is imported from `../store`. In `src/socket.ts` only one comment changes; copy it from [its stage version](code/stages/practice-2/frontend/src/socket.ts) too, so it's exactly the same.

**What fills `user`** is a `useEffect` in `App`, once when the page opens, as in Modules 22–23. The difference is that its result is now written to the store: the `GET /auth/me` answer → `setUser(p)`; `401` → `setNotLoggedIn(null)`; other trouble, for example the backend is down → `setNotLoggedIn(message)`. This effect is in the new `App.tsx` (2.3); until then, the red line under the `onSessionExpired` prop in `App.tsx` is normal.

#### 2.2 The guard and the frame: `RequireLogin` and `Layout` (15 minutes)

**Step 1 — The guard.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`RequireLogin.tsx`**, then type the code below (or open [`code/stages/practice-2/frontend/src/components/RequireLogin.tsx`](code/stages/practice-2/frontend/src/components/RequireLogin.tsx) on GitHub, click **Copy raw file**, then paste):

```tsx
// RequireLogin.tsx - a route guard (protected route). Mounted as a layout route in App: every screen inside it only shows
// for someone who is logged in. Someone who isn't is moved to /login, carrying the address they wanted (from), so after
// logging in they come back to the screen they had opened.
import { Navigate, Outlet, useLocation } from "react-router";
import { useLiveStore } from "../store";

export default function RequireLogin() {
  const user = useLiveStore((s) => s.user);
  const location = useLocation(); // the address being opened, for example /devices/f00d00000001/history

  if (user === "loading") {
    // GET /auth/me isn't answered yet: don't rush to send them to /login, the cookie may still be valid
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Checking the session…</p>;
  }
  if (user === null) {
    // replace = the guarded address isn't left in the browser history, so the Back button doesn't bounce back here
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />; // logged in: show the child screen that matches the address
}
```

Its three branches are discussed in [Concept 4](#4-protected-routes-a-guard-at-the-door-of-a-page): `"loading"` → `Checking the session…`; `null` → to `/login`, handing over the address from before as `from`; logged in → `<Outlet />`.

**Step 2 — The frame.** The dashboard's header (the title, the **Live** badge, the **Devices** menu, the name and role, **Log out**) moves from `App` to the **layout**: a frame that stays while its content changes. Right-click **`frontend/src/components`** → **New File…**, name it **`Layout.tsx`**, open [`code/stages/practice-2/frontend/src/components/Layout.tsx`](code/stages/practice-2/frontend/src/components/Layout.tsx) on GitHub, click **Copy raw file**, then paste. Its content: the `<header>` from Practice 1's `App.tsx` (its **Log out** button now calls `handleLogout`); a `<main>` holding `<Outlet />`, where React Router puts the List, the Details, or the History; `GET /devices` **once** every time the frame appears (after logging in), so that a Details opened through a link, **Back**, or **F5** still has the device list; and a minimal **Log out** that deliberately isn't complete yet:

```tsx
  async function handleLogout() {
    // Module 23: cut the live connection FIRST (reason "io client disconnect": no reconnect), then delete the session.
    socket.disconnect();
    try {
      await logout();
    } catch {
      // the backend doesn't answer: the screen still goes back to the login form
    }
    useLiveStore.getState().setNotLoggedIn(null);
  }
```

There's no `navigate("/login")`: as soon as `user` becomes `null`, `RequireLogin` itself moves the screen. Two things are still left over, and they're dealt with in [3.2](#32-a-complete-logout-clearall-and-four-steps-in-order-15-minutes): the device data is still in the store, and the guard also hands over the last address, so the **next** person in the same tab lands on the previous person's last screen.

**Step 3 — Page not found.** The `*` route will be outside the guard and the frame, so it shows without a header. Replace the whole content of `src/pages/NotFound.tsx` with [its stage version](code/stages/practice-2/frontend/src/pages/NotFound.tsx) (**Copy raw file**): it's now wrapped in its own `<main>`, and its title is an `<h1>`.

The dashboard hasn't changed yet: the old `App.tsx` doesn't use `RequireLogin` and `Layout` yet.

#### 2.3 The Login screen with react-hook-form and Zod: `schemas/login.ts` and `pages/Login.tsx` (20 minutes)

**Step 1 — The input schema.** Right-click **`frontend/src`** → **New Folder…**, and name it **`schemas`**. Right-click that folder → **New File…**, name it **`login.ts`**, then type (or open [its stage version](code/stages/practice-2/frontend/src/schemas/login.ts) on GitHub, click **Copy raw file**, then paste):

```ts
// login.ts - the Log in form's input as a Zod schema. It mirrors the LoginBody schema in backend/src/routes/auth.ts (Module 20):
// a valid email of at most 254 characters, a password of 1-200 characters. That schema isn't in backend/src/schemas/, so it
// can't be copied whole; its two lines are written again here with friendly messages. The backend still checks again.
import { z } from "zod";

export const LoginInput = z.object({
  email: z.email("Not a valid email, for example admin@home.test").max(254, "Email is too long"),
  password: z.string().min(1, "Password is required").max(200, "Password is too long"),
});

export type LoginInput = z.infer<typeof LoginInput>; // { email: string; password: string }
```

Its rules are the same as the backend's Module 20 `LoginBody` schema, which lives inside the route file, not in `schemas/`. That's why it's written again with messages for humans, not copied; the backend still checks again. Identical copies from the backend only start in [5.1](#51-copy-contractts-then-a-sendcommand-that-checks-the-answer-with-acksafeparse-15-minutes) and are guarded by `npm run check-schema` in [7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes) ([Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend)). `LoginInput` is used twice: as a value it's the schema, as a type it's the shape of the input.

**Step 2 — The Login screen.** Right-click **`frontend/src/pages`** → **New File…**, name it **`Login.tsx`**, open [`code/stages/practice-2/frontend/src/pages/Login.tsx`](code/stages/practice-2/frontend/src/pages/Login.tsx) on GitHub, click **Copy raw file**, then paste. You already read its core (`useForm` and `submit`) in [Concept 7](#7-a-form-that-checks-itself-react-hook-form-not-usestate-per-field). Above it, this screen picks up what the guard handed over:

```tsx
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const destination = from ? from.pathname + from.search : "/devices";
```

After `useForm`:

```tsx
  if (user !== null && user !== "loading") return <Navigate to={destination} replace />;
```

`submit` only writes `setUser(…)` to the store. The changed store redraws this screen, then `<Navigate>` moves you to the `destination`, with `replace` so that **Back** doesn't return to the form. `useForm` is written before any `return`, because hooks must be called on every redraw. The rest of the file: `<form noValidate>` (every message comes from the schema, not from the browser's bubbles); every box with a `<label htmlFor>`, `{...register("email")}`, and `aria-invalid` and `aria-describedby`; `autoComplete="username"` and `"current-password"` for password managers; `errors.root?.server` (`role="alert"`) above the button; `loginMessage` (`role="status"`); and the `Logging in…` button while `isSubmitting`.

**Step 3 — A nested route map.** Replace the whole content of `src/App.tsx` with the code below (or open [its stage version](code/stages/practice-2/frontend/src/App.tsx) on GitHub, click **Copy raw file**, then paste):

```tsx
// App.tsx - the root of the dashboard. Its three jobs, each done ONCE for the whole dashboard:
// 1. asking the backend "who am I?" (GET /auth/me) when the page opens;
// 2. keeping the live connection (Socket.IO) while logged in (Module 23);
// 3. holding the route map (Module 24): which address shows which screen, and which screens are guarded.
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { ApiError, whoAmI } from "./api";
import RequireLogin from "./components/RequireLogin";
import Layout from "./components/Layout";
import DevicesPage from "./pages/Devices";
import DetailsPage from "./pages/Details";
import LoginPage from "./pages/Login";
import HistoryPage from "./pages/History";
import NotFound from "./pages/NotFound";
import { useRealtime } from "./socket";
import { handleSessionExpired, useLiveStore } from "./store";

export default function App() {
  // Once when App appears ([] = no dependencies): check whether the login cookie from an earlier visit is still valid.
  // Its result is written to the store, where the route guard (RequireLogin) and the Log in screen read it.
  useEffect(() => {
    let ignore = false;
    whoAmI()
      .then((p) => {
        if (!ignore) useLiveStore.getState().setUser(p);
      })
      .catch((err) => {
        if (ignore) return;
        // 401 = simply not logged in: just show the form. Anything else (backend or database down): say so.
        const notLoggedIn = err instanceof ApiError && err.code === 401;
        useLiveStore.getState().setNotLoggedIn(notLoggedIn ? null : err instanceof ApiError ? err.message : "Couldn't check the login.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Module 23: the live connection (Socket.IO) lives while logged in. Module 24: this hook stays here, ABOVE <Routes>,
  // so switching screens doesn't cut the live connection.
  const loggedIn = useLiveStore((s) => s.user !== null && s.user !== "loading");
  useRealtime(loggedIn, handleSessionExpired);

  // The route map: every <Route> pairs one address pattern with one screen. :id = the part of the address that changes,
  // read by its screen with useParams(). A Route without a path (RequireLogin, Layout) = a "layout route": it draws
  // itself, then puts the matching child screen where its <Outlet /> is.
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireLogin />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DetailsPage />} />
          <Route path="/devices/:id/history" element={<HistoryPage />} />
        </Route>
      </Route>
      {/* any other address that matches no pattern, logged in or not */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

`App` shrinks from 155 to 61 lines: the user `useState`, `useCallback`, `logout`, the header, and the `if` that picked the form move to the store, `Layout`, and `RequireLogin`. In `<Routes>`, `/login` and `*` are outside; every dashboard screen is inside `RequireLogin` → `Layout`. These two wrappers without a `path` don't change the address: both draw themselves, then put the matching child screen in `<Outlet />`.

**Step 4 — Delete the old form.** In the VS Code Explorer, right-click `src/components/Login.tsx` → **Delete**.

Save everything; Vite updates the browser by itself (HMR). As long as Practice 1's cookie is still valid, you stay logged in. Now try the form:

1. Click **Log out**. The address becomes `/login`.
2. Click **Log in** with both boxes empty.
3. Type `admin@home` in **Email**, fill in any **Password**, and click **Log in**.
4. Type `admin@home.test` with a wrong password, and click **Log in**.
5. Log in with the right password.

**Result (example, the Practice 2 stage code in the author's lab):**

| Step | On the screen |
| :-- | :-- |
| 1 | `Mini Smart Home`, `Log in with your Module 20 account to see the dashboard.`, the **Email** and **Password** boxes, the **Log in** button |
| 2 | under Email `Not a valid email, for example admin@home.test`, under Password `Password is required` |
| 3 | only `Not a valid email, for example admin@home.test` |
| 4 | a red box above the button: `wrong email or password` (`401`); `backend` log: `WARN: login failed: account 1 (IP 127.0.0.1)` |

Steps 2–3 don't reach the backend: `handleSubmit` only calls `submit` if the schema lets the input through. After step 5 you go back to the last screen before **Log out**, not always to the List: that's the handed-over `from` at work.

> [!NOTE]
> **Want to see `429`?** Click **Log out**, then repeat step 4. In the author's lab, ten attempts within a minute were answered `wrong email or password`, and the 11th `too many attempts: try again in 51 seconds` (log: `POST /auth/login -> 429 (2 ms)`; Module 20's limit). The number of seconds is what's left of the 60-second window. Until it runs out, even the right password is refused, because the request is refused before the password is checked: wait first.

Red lines under `useForm` or `zodResolver`? See [🚨](#-troubleshooting) *`npm run build` fails with a type error in `useForm` or `zodResolver`*.

#### 2.4 ⭐ A direct link before logging in: to `/login`, then back to the same screen (10 minutes)

This is the Syllabus's protected route test. A private window doesn't bring along your normal window's cookies, so there you're really not logged in.

1. Press **Ctrl + Shift + N** (macOS: **Cmd + Shift + N**) for a private window (Chrome: Incognito, Edge: InPrivate), then **F12** → the **Console** tab.
2. Open `http://localhost:5173/devices/f00d00000001/history` (device path: replace it with your Node 1's `device_id`).
3. In the **Console**, type `JSON.stringify(history.state.usr)`, then press **Enter** (`usr` = where React Router puts the `state` the guard handed over).
4. Log in as `admin@home.test`, then repeat step 3.
5. Press the browser's **Back**, then **Forward**, then **F5**.
6. (Optional) In the **Network** tab, replace **No throttling** with a slow profile, press **F5**, then set it back to **No throttling**. Close the private window.

**Result (example, a new window without a cookie in the author's lab):**

| Step | What you see |
| :-- | :-- |
| 2 | the address changes by itself to `/login`; the Login form shows |
| 3 | `{"from":{"pathname":"/devices/f00d00000001/history","search":"","hash":"","state":null,"key":"default"}}` |
| 4 | back at `/devices/f00d00000001/history`: `← Back to the details`, `History`, `Practice living room`, `1 hour` `24 hours` `7 days`; `history.state.usr` is now `null` |
| 5 | the tab history holds only the window's first page and the History (`/login` was replaced), so **Back** doesn't go to the form; **F5** stays on the History |
| 6 | an empty screen while Vite sends dozens of files, then `Checking the session…` for ±3 seconds (a lab-made profile: a 1.5-second pause), then the header with `Reconnecting…` → `Live` |

The `backend` log:

```text
[12:24:57] INFO: GET /auth/me -> 401 (1 ms)
[12:24:57] INFO: POST /auth/refresh -> 401 (0 ms)
…
[12:26:11] INFO: login: account 1 (admin), session 5, IP 127.0.0.1
[12:26:11] INFO: POST /auth/login -> 200 (269 ms)
[12:26:11] INFO: realtime client connected: 2g0SdiJdkyGhx9_OAAAM (account 1, admin)
```

`GET /auth/me` and one refresh are answered `401`, so `App` writes `setNotLoggedIn(null)` and the guard moves you. As soon as you log in, the live connection connects right away, without a reload.

**You pass this ⭐ step** when the History address in the private window moves to `/login`, after logging in you're back at the same History without typing its address again, **Back** doesn't take you to the form, and **F5** stays on the History.

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` names five changed files, `components/Login.tsx` deleted, and `RequireLogin.tsx`, `Layout.tsx`, `pages/Login.tsx`, and the `schemas/` folder untracked. Then (`git add src` also records the deleted file):

```text
git add src
git commit -m "Protected routes and a react-hook-form Login form (Module 24 Practice 2)"
```

The state of the code at the end of this practice is in [`code/stages/practice-2/frontend/`](code/stages/practice-2/frontend/).

> ⬆️ **Done with Practice 2?** Every screen is now guarded, but the admin and viewer accounts still see the same screen, and **Log out** isn't complete yet. Read [Concept 5](#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security) and [Concept 6](#6-a-complete-logout-cut-the-socket-delete-the-session-clear-the-store), then continue to [Practice 3 — Roles on the screen and a complete logout](#practice-3--roles-on-the-screen-and-a-complete-logout-40-minutes).

### Practice 3 — Roles on the screen and a complete logout (40 minutes)

> 🖥️ **Tools used:** **VS Code** with Practice 2's terminals (`backend` v1.0, Vite in `frontend`; on the laptop path also the broker and the simulator) and a free terminal in `frontend` for Git; **Docker Desktop** (`smarthome-db`); **Chrome** or **Edge** with DevTools; and **Bruno** (3.3). Concepts used: 5 and 6.
>
> ⭐ **Required** — step 3.3: after the admin **Log out**, a viewer in the same tab lands on `/devices` with nothing left over from the admin's screen, `/rules/new` answers `Admin only`, and Bruno's `lamp on` as a viewer is answered `403`.

The store already knows who's logged in and what their role is, but no screen uses it yet, and **Log out** still leaves the data and the last address behind. There are no admin buttons yet (the control buttons come in Practice 5, **+ New rule** in Practice 8), so what's guarded now is the **address** of the screen that changes things, `/rules/new`. The code at the end of this practice: [`code/stages/practice-3/frontend/`](code/stages/practice-3/frontend/).

#### 3.1 `useAdmin()` and the second guard, `AdminOnly` (10 minutes)

**Step 1 — The store.** Open [`code/stages/practice-3/frontend/src/store.ts`](code/stages/practice-3/frontend/src/store.ts) on GitHub, click **Copy raw file**, then paste it in place of the whole content of your `src/store.ts`. What's added: the `loggedOutOnPurpose` field and the `clearAll` function for 3.2, and `useAdmin()` at the bottom, exactly as in [Concept 5](#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security): `true` only when the admin role is certain.

**Step 2 — The second guard.** Right-click the **`frontend/src/components`** folder → **New File…**, name it **`AdminOnly.tsx`**, then type (or open [its stage version](code/stages/practice-3/frontend/src/components/AdminOnly.tsx) on GitHub, click **Copy raw file**, then paste):

```tsx
// AdminOnly.tsx - the second guard (RequireLogin's partner): a layout route for screens that change something (the rule form).
// Admin accounts see the screen; viewer accounts see an "Admin only" explanation instead of a form that would be refused anyway.
// This is screen convenience, NOT protection: if a viewer sends a change some other way (Bruno, the Console), the backend's
// guard still answers 403.
import { Link, Outlet } from "react-router";
import { useAdmin } from "../store";

export default function AdminOnly() {
  const admin = useAdmin();
  if (admin) return <Outlet />;
  return (
    <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Admin only</h2>
      <p className="mt-1">
        This screen is for admin accounts only. Your account is a viewer: you can see all the data, but you can't change anything.
      </p>
      <Link to="/devices" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
        ← Back to the device list
      </Link>
    </div>
  );
}
```

It's the twin of `RequireLogin`: a layout route without a `path`. An admin gets `<Outlet />` (its child screen); other accounts get an explanation and a link back, instead of being redirected silently. A `"loading"` branch isn't needed, because `AdminOnly` is always inside `RequireLogin`.

**Step 3 — A placeholder for the rule form.** Right-click **`frontend/src/pages`** → **New File…**, name it **`RuleForm.tsx`**, then type:

```tsx
// pages/RuleForm.tsx - the /rules/new screen (admin-only). Practice 3 only sets up the address and its guard, so that
// the role restriction can be tried; the form itself is built in Practice 8.
export default function RuleFormPage() {
  return (
    <p className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      The new-rule form (built in Practice 8).
    </p>
  );
}
```

One sentence is enough to try the role restriction now; the real form replaces it in [8.3](#83-ruleform-at-rulesnew-useform-with-zodresolver-a-sentence-preview-and-the-save-button-20-minutes).

**Step 4 — The route map.** Replace the whole content of `src/App.tsx` with [its stage version](code/stages/practice-3/frontend/src/App.tsx) (**Copy raw file**). It gains two imports, the `pageshow` effect (3.2), and one branch below the History route:

```tsx
          {/* the second guard: screens that change something are for admins only */}
          <Route element={<AdminOnly />}>
            <Route path="/rules/new" element={<RuleFormPage />} />
          </Route>
```

The order: `RequireLogin` ("logged in?") → `Layout` → `AdminOnly` ("admin?") → the screen. Save everything. There's no menu to this address yet, so type `localhost:5173/rules/new` in the address bar, still as admin.

**Result:** below the dashboard header it says `The new-rule form (built in Practice 8).` The viewer account is tried in 3.3.

#### 3.2 A complete logout: `clearAll` and four steps in order (15 minutes)

Practice 2's **Log out** cuts the socket and the session, but doesn't clear the store; now every step of [Concept 6](#6-a-complete-logout-cut-the-socket-delete-the-session-clear-the-store) gets its place.

**Step 1 — The store clearer.** It was already pasted along with `store.ts` (3.1):

```ts
export function clearAll(loginMessage: string | null, loggedOutOnPurpose = false) {
  useLiveStore.setState({ ...useLiveStore.getInitialState(), user: null, loginMessage, loggedOutOnPurpose }, true);
}
```

`user: null` is written separately because its starting value is `"loading"`: without it, the guard would write `Checking the session…` forever. `handleSessionExpired()` now uses it too, with the sentence `Your session has expired. Please log in again.`

**Step 2 — Four steps in `Layout`.** Replace the whole content of `src/components/Layout.tsx` with [its stage version](code/stages/practice-3/frontend/src/components/Layout.tsx) (**Copy raw file**). The only changes are the `clearAll` import and this function:

```tsx
  async function handleLogout() {
    // 1. Cut the live connection FIRST (reason "io client disconnect": not reconnected). The other way round, the server
    //    cuts us off ("io server disconnect"), and then the socket tries to reconnect (Module 23).
    socket.disconnect();
    // 2. Delete the session in the backend. JavaScript can't delete HttpOnly cookies; only the backend's answer deletes them.
    let message = "You have logged out.";
    try {
      await logout();
    } catch {
      message =
        "Log out isn't complete: the server didn't answer, so the session on the server hasn't been deleted. When the server " +
        "is running again, reload this page and press Log out once more.";
    }
    // 3. Clear everything in the store: the next person in this tab sees no leftover data or buttons of the previous account.
    //    true = logged out on purpose: this screen's address isn't handed to the Log in screen (see RequireLogin).
    clearAll(message, true);
    // 4. Moving to the Log in screen: done by the route guard (RequireLogin) as soon as the store is empty, with replace. Back
    //    doesn't return to the dashboard screen; even if Back is used, the guard still redirects to /login.
  }
```

Step 4 isn't code, and there's no `navigate` (the reason is in Concept 6). If `POST /auth/logout` fails, steps 3 and 4 still run; only the sentence changes.

**Step 3 — A guard that doesn't hand over the address.** Replace the whole content of `src/components/RequireLogin.tsx` with:

```tsx
// RequireLogin.tsx - a route guard (protected route). Mounted as a layout route in App: every screen inside it only shows
// for someone who is logged in. Someone who isn't is moved to /login, carrying the address they wanted (from), so after
// logging in they come back to the screen they had opened.
import { Navigate, Outlet, useLocation } from "react-router";
import { useLiveStore } from "../store";

export default function RequireLogin() {
  const user = useLiveStore((s) => s.user);
  const loggedOutOnPurpose = useLiveStore((s) => s.loggedOutOnPurpose); // Module 24 Practice 3: just pressed Log out?
  const location = useLocation(); // the address being opened, for example /devices/f00d00000001/history

  if (user === "loading") {
    // GET /auth/me isn't answered yet: don't rush to send them to /login, the cookie may still be valid
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Checking the session…</p>;
  }
  if (user === null) {
    // replace = the guarded address isn't left in the browser history, so the Back button doesn't bounce back here.
    // state.from = the address to go to after logging in; not handed over after the Log out button (a clean start).
    return <Navigate to="/login" replace state={loggedOutOnPurpose ? null : { from: location }} />;
  }
  return <Outlet />; // logged in: show the child screen that matches the address
}
```

Two lines of code change: `loggedOutOnPurpose` is read from the store, and `state` becomes `null` after **Log out**. After a session expires, `from` is still handed over.

**The `pageshow` effect** is already in `App.tsx` (3.1): a page restored by the back/forward cache after **Log out** is reloaded right away (Concept 6; [🔬](#-technical-deep-dive-optional)).

Save everything, then test, still as admin on the **Practice living room** Details (device path: your Node 1):

1. Click **Log out**.
2. In the **Console** tab, type `JSON.stringify(history.state.usr)`, then press **Enter**.
3. Press **Back**.

**Result (example, the Practice 3 stage code in the author's lab):** `/login` with the line `You have logged out.` above the form, and the **Console** answers `null`: no address was handed over. **Back** goes to the previous address, but the guard redirects to `/login` again right away: the form stays, without the header and the data. The `backend` log:

```text
[12:28:53] INFO: realtime client disconnected: bzXO6ZjuLrYRwS29AAAV (client namespace disconnect)
[12:28:53] INFO: logout: session 10
[12:28:53] INFO: POST /auth/logout -> 200 (5 ms)
```

`client namespace disconnect` = the dashboard itself closed its socket (step 1), before its session was deleted (step 2).

**Log out while the backend is down.** Log in again as admin, then:

1. In the `backend` terminal, press **Ctrl + C**. Wait until the badge changes to `Reconnecting…`.
2. Click **Log out**.
3. In the `backend` terminal, run `npm run dev` again; wait for `Server listening at http://127.0.0.1:8080`.
4. Press **F5** on the Login screen, then click **Log out** once more.

**Result (a later recording by the author on the final code; the sentence is the same in this stage):** step 2 still takes you to `/login` and clears the store, but the gray line above the form (not a toast, not red) says it frankly:

```text
Log out isn't complete: the server didn't answer, so the session on the server hasn't been deleted. When the server is running again, reload this page and press Log out once more.
```

The **Console** records `net::ERR_CONNECTION_REFUSED` for `/auth/logout`. **F5** in step 4 takes you straight to `/devices` as `Home Admin (admin)` (log: `GET /auth/me -> 200`): the old session really is still alive, exactly as the warning says. The second **Log out** writes `You have logged out.`, and the log records `logout: session 6` and `POST /auth/logout -> 200 (7 ms)`.

#### 3.3 ⭐ Switch accounts in the same tab: nothing left over, `Admin only`, and `403` in Bruno (15 minutes)

Two accounts take turns in one tab, then Bruno:

1. Log in as `admin@home.test`, open the **Practice living room** Details, then click **Log out**.
2. In the same tab, without **F5**, log in as `viewer@home.test`.
3. Type `localhost:5173/rules/new` in the address bar.
4. In Bruno, send **`login viewer`**, then **`lamp on`**.
5. Send **`login admin`**, so that the next Bruno requests run as admin again.

**Result (example, the author's lab; the Bruno `.yml` files were sent as they are by a script, not by the Bruno app):**

| Step | What you see |
| :-- | :-- |
| 1 | `/login` with `You have logged out.` |
| 2 | `/devices`, not the Details from before; the header says `Home Guest (viewer)` with the **Live** badge |
| 3 | `Admin only`, `This screen is for admin accounts only. Your account is a viewer: you can see all the data, but you can't change anything.`, and the link **← Back to the device list** |
| 4 | `login viewer` → `200` with `"role":"viewer"`; `lamp on` → `403` `{"message":"viewer accounts can only look; commands and changes are admin-only"}` |

The `backend` log:

```text
[12:28:56] INFO: realtime client connected: 0U-L2HERnXh9eWb3AAAW (account 2, viewer)
…
[12:29:11] WARN: refused (403): account 2 (viewer) tried POST /devices/a4cf12e5b7c0/command
[12:29:11] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
```

The viewer starts from zero: the admin's name is gone, the Details address from before isn't handed over, and the socket belongs to `account 2, viewer`. Bruno shows the second layer: without any screen, the backend's guard still refuses before the route runs (there's no `command …` line). The **Tests** tab of `lamp on` is red because it expects `200` (admin): that's normal.

**Log out in another window (optional).** Click **Log out**, log in as admin, then open the History. Press **Ctrl + N** (macOS: **Cmd + N**), open `localhost:5173` in the new window, put the two side by side, then click **Log out** there. In the author's test, the first window moved to `/login` with `Your session has expired. Please log in again.` 138 ms later, and after logging in it went back to the History: the session-expired path still hands over the address.

The picture below sums up the guards of Practices 1–3: `/login` with the original address (here after **Log out** in another window), `Admin only`, and the `*` route.

![Four real screenshots, laptop 1280 pixels cropped, Google Chrome 156, a fresh browser profile; from the final code: the Rules menu only comes in Practice 7, and before Practice 9 the teal and gray text are slightly lighter. Top left, /login with the original address /devices/f00d00000001/history: the card Mini Smart Home, Log in with your Module 20 account to see the dashboard., the message box Your session has expired. Please log in again. (number 1), the Email and Password fields and the Log in button (number 2). An arrow Log in to the top right: after Log in the address is /devices/f00d00000001/history, header Home Admin (admin), Back to the details, History: Practice living room, living room · f00d00000001 (number 3), the choices 1 hour, 24 hours, 7 days, and Average per hour, last 7 days (point = start of each hour) · 169 points · loaded in 141 ms. Bottom left, the viewer account opens /rules/new: Home Guest (viewer) (number 4) and the Admin only box: This screen is for admin accounts only. Your account is a viewer: you can see all the data, but you can't change anything., with the link Back to the device list (number 5). Bottom right, /not/there without the dashboard header: Page not found (number 6), This address doesn't exist in the dashboard. A typo, maybe?, the link To the device list (number 7). Note: a deep link opened with no session at all gives the same form without the message box, with the same destination. Legend: RequireLogin leaves the original address in state.from; Navigate to the destination from state.from with replace; the second guard AdminOnly, the backend's guard still answers 403; the star route outside the guards; a React Router Link without reloading the page.](assets/routes-login-admin-only-404.png)

**You pass this ⭐ step** when, after **Log out**, a viewer in the same tab lands on `/devices` with nothing left over from the admin's screen, `/rules/new` writes `Admin only`, and Bruno's `lamp on` as a viewer is answered `403`. This is the **basis** of L4; the proof itself, a viewer's Details without a single control button, is in [5.5](#55--the-lamp-from-the-dashboard-rollback-and-a-viewer-account-without-buttons-15-minutes). Other symptoms: [🚨](#-troubleshooting) *A viewer account briefly sees the admin buttons …* and *After Log out, the Back button briefly shows the old screen*.

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` names four changed files (`App.tsx`, `store.ts`, `RequireLogin.tsx`, `Layout.tsx`) and `AdminOnly.tsx` and `pages/RuleForm.tsx` untracked. Then:

```text
git add src
git commit -m "Roles on the screen and a complete logout (Module 24 Practice 3)"
```

> ⬆️ **Done with Practice 3?** The dashboard now tells admin and viewer apart, and **Log out** is complete, but important notices, such as a device disconnecting, don't show on the screen yet. Read [Concept 10](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone), then continue to [Practice 4 — On-screen notices: toasts](#practice-4--on-screen-notices-toasts-40-minutes).

### Practice 4 — On-screen notices: toasts (40 minutes)

> 🖥️ **Tools used:** **VS Code** with Practice 3's terminals still running (`backend` v1.0 with `npm run dev`, Vite in `frontend`; laptop path: also the broker in `edge` and the simulator in `tools`) plus a free terminal in the `frontend` folder for Git; **Docker Desktop** (`smarthome-db`); and **Chrome** or **Edge** at `http://localhost:5173`, logged in as admin, with DevTools (the **Console** and **Network** tabs). Concepts used: 10.

Since Module 23, the backend has sent `event` messages to the dashboard (a device disconnected, a rule acted, a schedule ran), but the dashboard ignores them. This practice adds toasts ([Concept 10](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone)) and refreshes the device status after the connection recovers. Six files change: two new (`src/toast.ts`, `src/components/ToastRegion.tsx`) and four existing (`src/store.ts`, `src/components/Layout.tsx`, `index.html`, `src/socket.ts`). Paste them in the order of the steps: a file that imports `toast.ts` is pasted only after `toast.ts` exists.

#### 4.1 `toast.ts` and `ToastRegion`: at the bottom of a phone, at the top right of a wide laptop (15 minutes)

**Step 1 — The toast store.** Right-click **`frontend/src`** → **New File…**, name it **`toast.ts`**, then type (or open [`code/stages/practice-4/frontend/src/toast.ts`](code/stages/practice-4/frontend/src/toast.ts) on GitHub, click **Copy raw file**, then paste):

```ts
// toast.ts - "on-screen notices" (toasts): short messages that show for a moment (at the bottom of a phone screen, top right
// on a wide laptop) and then disappear by themselves after 4 seconds.
// Their store is separate from store.ts so it stays small and easy to read. Like the main store, it only lives in this tab's memory.
import { create } from "zustand";

export type ToastKind = "info" | "success" | "error";
export type Toast = { id: number; message: string; kind: ToastKind };

const SHOW_MS = 4000; // milliseconds
const MAX_TOASTS = 2; // beyond that, the oldest is dropped: on a phone, two toasts are already a quarter of the screen high

type ToastStore = {
  toasts: Toast[];
  add: (message: string, kind: ToastKind) => void;
  remove: (id: number) => void;
};

let lastId = 0; // a unique number for every toast: used as the React key and to remove it

export const useToast = create<ToastStore>()((set, get) => ({
  toasts: [],
  add: (message, kind) => {
    const id = ++lastId;
    // slice(-2) = keep the last two (the newest)
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }].slice(-MAX_TOASTS) }));
    // setTimeout = runs ONCE, not setInterval: in 4 seconds this toast is dropped. If it was already closed before that,
    // remove() doesn't find it and nothing happens.
    setTimeout(() => get().remove(id), SHOW_MS);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// a shorthand, so other parts only need to write toast("Rule saved", "success")
export function toast(message: string, kind: ToastKind = "info") {
  useToast.getState().add(message, kind);
}
```

The pattern is the same as the `// 5.` part of the [warm-up](#step-5--messages-that-disappear-by-themselves-a-queue-with-settimeout), now in a small Zustand store. `add()` gives a unique number, makes a **new** array holding at most the two newest toasts (`MAX_TOASTS = 2`; 3 in the warm-up), then sets a `setTimeout` that **runs once**: 4 seconds later `remove()` is called. A toast that was already closed with ✕ or pushed out isn't found by `remove()`, so no `clearTimeout` is needed. Other parts only write `toast("…", "error")`; the kind (`info`, `success`, `error`) sets the color and the icon. Why not use a ready-made toast library? See [🔬](#-technical-deep-dive-optional) *Ready-made toast libraries*.

**Step 2 — Log out throws the toasts away too.** Open `src/store.ts`. Below `import { create } from "zustand";`, add:

```ts
import { useToast } from "./toast";
```

Then inside `clearAll`, right below the `useLiveStore.setState(…)` line, add:

```ts
  useToast.setState(useToast.getInitialState(), true); // the previous account's toasts are thrown away too
```

This is the line [Concept 6](#6-a-complete-logout-cut-the-socket-delete-the-session-clear-the-store) promised: the last account's toasts don't carry over to the next person in the same tab. (You may also replace everything in `src/store.ts` with [its stage version](code/stages/practice-4/frontend/src/store.ts), **Copy raw file**.)

**Step 3 — The region.** Right-click **`frontend/src/components`** → **New File…**, name it **`ToastRegion.tsx`**, open [`code/stages/practice-4/frontend/src/components/ToastRegion.tsx`](code/stages/practice-4/frontend/src/components/ToastRegion.tsx) on GitHub, click **Copy raw file**, then paste. Its core is one `<div>` that is **always** drawn, even when empty:

```tsx
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 xl:sticky xl:top-0 xl:bottom-auto xl:h-0"
    >
```

`role="status"` and `aria-live="polite"` make a screen reader read its new content out, as long as the region already exists before its content changes. What the classes mean (the Concept 10 table): below 1280 px it sticks to the bottom edge of the screen, from 1280 px (`xl:`) it hangs at the top right, and `pointer-events-none` keeps its empty space from blocking taps. Inside, `toasts.map(…)` draws every card: the icon `i`, `✓`, or `!`, the color from `STYLES[t.kind]`, the text `{t.message}`, and a ✕ button labeled `Close message` (`min-h-11 min-w-11` = 44 × 44 px). The cards' distance from the bottom edge: `max(1rem,env(safe-area-inset-bottom))`. The server's message is written as JSX text, not HTML.

**Step 4 — Put it in the frame.** Replace everything in `src/components/Layout.tsx` with [its stage version](code/stages/practice-4/frontend/src/components/Layout.tsx) (**Copy raw file**). The difference: `import ToastRegion from "./ToastRegion";`, then `<ToastRegion />` between `</header>` and `<main>`, whose classes change from `py-6` to `pt-6 pb-64 xl:pb-6`. The region goes in the frame, not in `App`: it only exists after logging in, and it isn't mounted again when you switch screens, because the frame stays while the content changes through `<Outlet />`.

**Step 5 — Scroll space.** Replace everything in `frontend/index.html` (outside the `src` folder) with:

```html
<!doctype html>
<html lang="en" class="scheme-light dark:scheme-dark scroll-pb-64 xl:scroll-pb-0">
  <head>
    <meta charset="UTF-8" />
    <!-- Module 24: scroll-pb-64 = when the browser scrolls BY ITSELF to a button or field (the Tab key, a field with an error), it
         leaves 16rem free at the bottom, where the toasts sit on phones and tablets. From 1280 px the toasts are beside the content: xl:scroll-pb-0. -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mini Smart Home</title>
  </head>
  <body class="bg-slate-100 dark:bg-slate-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Only the `<html>` classes (`scroll-pb-64 xl:scroll-pb-0`) and two comment lines change. `pb-64` gives room when a thumb scrolls; `scroll-pb-64` when the browser scrolls **by itself** to a button or field (the Tab key, a field with an error).

Save everything. Nothing calls `toast()` yet, so there are no cards yet; what you can check is the region. In the **Console** tab, type, then **Enter**:

```js
document.querySelectorAll("[role=status][aria-live=polite]").length
```

**Result (the author's test, final code):** `1` after logging in and `0` after **Log out** (`/login`), because the region only exists in `Layout`. On a phone turned sideways or a 320 px screen, toasts can still cover buttons: see [🚨](#-troubleshooting) *Toasts cover the Lamp, Fan, or pump buttons …*.

#### 4.2 `event` messages become toasts: a named listener and `off` (10 minutes)

Replace everything in `src/socket.ts` with [`code/stages/practice-4/frontend/src/socket.ts`](code/stages/practice-4/frontend/src/socket.ts) (**Copy raw file**), then save. This file also contains 4.3. Inside `useRealtime`, below `onStatus`, there's a new listener:

```ts
    function onEvent(ev: SavedEvent) {
      if (ev.kind === "rule-changed") return;
      toast(ev.message, toastKind(ev));
    }
```

Its partners are `socket.on("event", onEvent)` in the listener list and `socket.off("event", onEvent)` in the cleanup, exactly like Module 23's `telemetry` and `status`. In dev mode, StrictMode mounts the effect, takes it down, then mounts it again; without `off`, the first listener is left behind and every event shows twice ([🚨](#-troubleshooting) *Every event shows up as two toasts*). The `SavedEvent` type has been in `types.ts` since Module 23. `rule-changed` is skipped: whoever saved the rule already got a toast from its HTTP answer.

**The color comes from the data, not from the sentence.** The `toastKind()` function above `useRealtime` picks `error` (red, `!`) for a `status` event if that device in the store is now not `online`; the `status` message arrives before its event, so the store is already right. `rule` and `schedule` events become `error` if `data.ok` is `false` or `data.result` is `no-ack`/`not-sent`; everything else is `info`. Because `data` has the type `unknown`, it's first checked with a small Zod schema, `ActionData` (`safeParse`), not simply trusted. `ok` is only sent by backend 1.1 ([Practice 6](#practice-6--backend-11-falls-below-rules-and-deleting-rules-50-minutes)); until then, `result` already marks commands that weren't answered or weren't sent.

#### 4.3 The connection recovers, the status is refreshed: `GET /devices` once more (10 minutes)

That `socket.ts` also pays off Module 23's limit 2 ([🔬 Module 23](../module-23-realtime-dashboard/README.md#-technical-deep-dive-optional) *Two limits of v0.2*): the server broadcasts `status` only when it **changes**, and doesn't repeat it for a new connection. If a device goes down while the backend is down, the dashboard is never told and keeps writing `Online`. The cure is a function inside `useRealtime` (not exported):

```ts
    async function syncDevices() {
      try {
        const list = await getDevices();
        if (!ignore) useLiveStore.getState().setDevices(list); // logged out in the meantime? ignore it
      } catch {
        // failed (for example the backend has just gone down again): leave it; the next restored connection tries again
      }
    }
```

It's called by the last two lines of `onConnect`:

```ts
      if (everConnected) void syncDevices();
      everConnected = true;
```

`everConnected` starts as `false` every time the effect runs (after logging in). The first connection is skipped because `Layout` has just fetched the device list; every `connect` after that means the connection has **recovered**, so `GET /devices` once. This isn't polling: the trigger is the "connected again" event, not a timer. `ignore` from Module 23 throws away answers that arrive after **Log out**. Only the status is caught up; `event` messages that passed while disconnected still aren't sent again.

#### 4.4 Test: stop the simulator, then stop and restart the backend (5 minutes)

Open the details of **Practice living room** (device path: **Node 1 living room**). Device path: replace the simulator's **Ctrl + C** with unplugging Node 1's USB, and **↑** then **Enter** with plugging it in again; the `disconnected` notice only comes ±13–23 seconds after unplugging ([Module 23 3.3](../module-23-realtime-dashboard/README.md#33--stop-the-sender-the-card-turns-red-then-green-again-10-minutes)). The author hasn't recorded this path with the Kit.

1. Simulator terminal: **Ctrl + C**. Wait for its toast to disappear, then **↑** and **Enter**.
2. `backend` terminal: **Ctrl + C**. Then the simulator terminal: **Ctrl + C** (device path: unplug, then wait ±30 seconds).
3. `backend` terminal: **↑** then **Enter** (`npm run dev`). Don't press **F5**.
4. Simulator terminal: **↑** then **Enter**.

**Result (example, 1280 px, the author's lab):**

| Step | On the screen |
| :-- | :-- |
| 1 | a moment later (under 1 second, an estimate) a red toast `f00d00000001 disconnected (offline)` (icon `!`) at the top right and the status `Offline`; ±4 seconds later the toast disappears by itself; after the simulator runs again, a neutral toast `f00d00000001 back online` (icon `i`) and `Online` |
| 2 | the badge `Reconnecting…`; the status stays `Online`, the last one the screen knew; no toast |
| 3 | the log writes `Server listening …` (±7.7 seconds after typing, busy lab laptop); ±1 second later the badge `Live`, then the status `Offline` without **F5**; **Network** tab: one `GET /devices` → `200` |
| 4 | the toast `f00d00000001 back online`, the status `Online` |

In the **Network** tab → the **Socket** filter → `socket.io/?EIO=4…` → **Messages**, step 1 gives two `42["event",{…,"kind":"status",…}]` messages and exactly two toasts, even though dev mode uses StrictMode. In step 3, the `disconnected` notice doesn't become a toast: the change happened while the dashboard wasn't connected, and missed notices aren't sent again. That `Offline` status comes with `last seen just now`: backend v1.0 behavior, not the dashboard code. With the Practice 3 stage code (without 4.3), the status stays `Online` until the simulator sends again. (Optional: repeat step 1 in DevTools device mode at 375 px wide; the cards are at the bottom of the screen.)

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` lists four changed files and two untracked ones (`toast.ts`, `ToastRegion.tsx`). Then:

```text
git add index.html src
git commit -m "Toasts, events, and a status refresh after reconnecting (Module 24 Practice 4)"
```

The code at the end of this practice is in [`code/stages/practice-4/frontend/`](code/stages/practice-4/frontend/).

> ⬆️ **Done with Practice 4?** The dashboard now gives notices, but it can't command yet. Read [Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack) and [Concept 2](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic), then continue to [Practice 5 — Buttons that wait for device confirmation](#practice-5--buttons-that-wait-for-device-confirmation-75-minutes).

### Practice 5 — Buttons that wait for device confirmation (75 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and the terminals `backend` (still v1.0, `npm run dev`), `frontend` (Vite), and one free terminal for Git (laptop path: the broker in `edge` and the old simulator in `tools` keep running); **Docker Desktop** (`smarthome-db`); and **two different browsers**, for example **Chrome** and **Edge**, the first with DevTools (the **Network** tab and the **Request conditions** panel in 5.5). Concepts used: 1 and 2, plus 5 for the **Controls** section.
>
> ⭐ **Required** — step 5.5: the **Lamp** button changes at once with `Waiting for device confirmation…`, then follows the device's answer, rolls back by itself when the network is blocked, and a viewer account doesn't see the **Controls** section (proof of **L2** and **L4**).

This practice replaces the admin's Lamp, Fan, and Pump cards with real buttons, in place of the Quick Win's rough button. How they work is in Concepts 1–2; here you paste and test them. Both new buttons are put in through `DeviceDetails.tsx` at the end of 5.4; until then the screen doesn't change, and that's expected. The code at the end of this practice: [`code/stages/practice-5/frontend/`](code/stages/practice-5/frontend/).

#### 5.1 Copy `contract.ts`, then a `sendCommand()` that checks the answer with `Ack.safeParse` (15 minutes)

**Step 1 — A copy of the schema from the backend.** In VS Code's Explorer panel, right-click `backend/src/schemas/contract.ts` → **Copy**, then right-click the `frontend/src/schemas` folder (holding `login.ts` from Practice 2) → **Paste**. Don't change a single character, not even its header comment: this file is an **identical copy**, and its checker (`npm run check-schema`) comes in [7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes). Why it's copied rather than imported from the `backend` folder is discussed in [Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend), read before Practice 7. It only needs `zod`, installed in 1.1 at the same version as the backend's. Used now: `Ack` (the device's answer) and `SetCommand` (the command's content).

**Step 2 — `src/api.ts`.** Open [`code/stages/practice-5/frontend/src/api.ts`](code/stages/practice-5/frontend/src/api.ts) on GitHub, click **Copy raw file**, then paste it over everything in your `src/api.ts`. Only three places change. At the top, two imports from that copy:

```ts
import { Ack } from "./schemas/contract";
import type { SetCommand } from "./schemas/contract";
```

In `request()`, Module 23's promise in a comment ("a real check with Zod only comes in Module 24") is now kept, partly: the answer that decides the control buttons is checked by Zod, other answers are still trusted through their type. After `getDevices()` there's a new function, `sendCommand()`, exactly the one you read in [Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack): `POST /devices/:id/command` through `request()`, then `Ack.safeParse(answer.ack)`.

**Step 3 — `src/store.ts`.** Replace everything in it with [its stage version](code/stages/practice-5/frontend/src/store.ts) (**Copy raw file**). The `LiveStore` type gets one line, `applyState: (deviceId: string, state: State) => void;`, and its body is below `fillWindow`:

```ts
  // Module 24: the actuator state from an ack (the device's answer to our command). Written into the latest reading so the cards
  // and buttons are right at once, without waiting for the next telemetry (which brings the same state ±1-2 seconds later).
  applyState: (deviceId, state) =>
    set((s) => {
      const old = s.latest[deviceId];
      // no reading yet, or Node 2 (it has pressure, no actuators): nothing to change
      if (old === undefined || "pressure" in old) return s;
      return { latest: { ...s.latest, [deviceId]: { ...old, state } } };
    }),
```

This function copies the device's last reading, then replaces only its `state` (the pattern of [🔁 Step 3](#step-3--save-first-change-roll-back-copying-an-object-with-the-spread-syntax)). Save all three files; the screen doesn't change yet.

#### 5.2 `SwitchButton`: show it first with `useOptimistic` and `useTransition` (25 minutes)

Right-click the **`frontend/src/components`** folder → **New File…**, name it **`SwitchButton.tsx`**, then type the code below (or open [`code/stages/practice-5/frontend/src/components/SwitchButton.tsx`](code/stages/practice-5/frontend/src/components/SwitchButton.tsx) on GitHub, click **Copy raw file**, then paste):

```tsx
// SwitchButton.tsx - an on/off button for the lamp or the fan, with "optimistic UI" (Module 24).
// As soon as it is tapped, its look changes at once and it writes "Waiting for device confirmation…". After the device
// answers (ack), the REAL state from that answer is used. If the command fails, the look goes back by itself (rollback).
// The lamp and fan may be optimistic because their command is safe to repeat: "turn on" twice is still on.
import { useId, useOptimistic, useTransition } from "react";
import { ApiError, sendCommand } from "../api";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";

type Props = {
  deviceId: string;
  target: "lamp" | "fan";
  label: string; // the text on the button, for example "Lamp"
  value: boolean; // the state the device REPORTS (telemetry or ack): its source of truth
  disabledReason: string | null; // why the button can't be used (for example the device is offline); null = usable
};

// the toast sentence for a failed command, according to the backend's answer
function failureMessage(err: unknown, label: string): string {
  if (!(err instanceof ApiError)) return label + ": the command failed.";
  // 504 is NOT "cancelled": the backend remembers our wish and sends it again by itself when it hears from the device again
  if (err.code === 504) return label + ": not confirmed by the device yet; the server will try again when it hears from the device.";
  if (err.code === 0) return label + ": the server didn't answer.";
  return label + ": " + err.message; // 409 "device is offline, …", 404, 503, 403
}

export default function SwitchButton({ deviceId, target, label, value, disabledReason }: Props) {
  // shown = value, EXCEPT while a command waits for its answer: then shown = our wish (optimistic)
  const [shown, setShown] = useOptimistic(value);
  // waiting = true while the Action below hasn't finished (from the tap until the backend's answer arrives)
  const [waiting, start] = useTransition();
  const noteId = useId(); // a unique id that links the button with its note (aria-describedby)
  const usable = disabledReason === null && !waiting;

  function tap() {
    // A waiting button can't be tapped again: this prevents the 409 "the previous command is still waiting for its ack".
    if (!usable) return;
    const wanted = !value;
    // Action = an async function inside startTransition. While it runs, setShown(wanted) is what counts.
    start(async () => {
      setShown(wanted); // changes on the screen at once, before the device answers
      try {
        const ack = await sendCommand(deviceId, { target, value: wanted });
        // The device's real state goes into the store, so the value prop changes too. (The Zustand store changes at once,
        // it isn't React state, so it doesn't need wrapping in startTransition again.)
        useLiveStore.getState().applyState(deviceId, ack.state);
        if (!ack.ok) toast(label + ": the device refused (" + (ack.message ?? "no reason given") + ")", "error");
      } catch (err) {
        toast(failureMessage(err, label), "error");
        if (err instanceof ApiError && err.code === 401) handleSessionExpired();
      }
      // The Action is finished: React drops the optimistic look and uses the value from the store again. If the command
      // failed, the value in the store didn't change, so the button goes back to its earlier state (rollback) with no extra code.
    });
  }

  let note = "";
  if (waiting) note = "Waiting for device confirmation…";
  else if (disabledReason !== null) note = disabledReason;

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* aria-pressed = a toggle button: screen readers say "pressed" (on) or "not pressed" (off).
          aria-disabled (not disabled): the button can still get keyboard focus, so the focus isn't lost while waiting. */}
      <button
        type="button"
        onClick={tap}
        aria-pressed={shown}
        aria-disabled={usable ? undefined : true}
        aria-describedby={noteId}
        className={
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 font-medium " +
          (shown
            ? "border-teal-600 bg-teal-600 text-white"
            : "border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100") +
          (usable ? " hover:opacity-90" : " cursor-not-allowed opacity-70")
        }
      >
        <span>{label}</span>
        {/* the state for the eyes; screen readers already get it from aria-pressed */}
        <span aria-hidden="true" className="text-sm">
          {shown ? "On" : "Off"}
        </span>
      </button>
      {/* role="status": "Waiting for device confirmation…" is read out by screen readers too, without moving the focus */}
      <p id={noteId} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {note}
      </p>
    </div>
  );
}
```

The core of `tap()`, namely `useOptimistic`, `start(async () => …)`, and rolling back without extra code, was discussed in [Concept 2](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic). What's new in the whole file:

- **One component, two actuators** through the `target` and `label` props. `value` = the **reported** state, from the store; `disabledReason` from `DeviceDetails` (5.4).
- **`usable`** is `false` if there's a reason to disable **or** a command is still awaited. `tap()` stops at once (`if (!usable) return;`), so a second tap doesn't end in `409 … still waiting for its ack` (unless you leave Details and come back before the device answers; see [🚨](#-troubleshooting)).
- **`aria-disabled`, not `disabled`.** A `disabled` button can't get keyboard focus, so the focus is lost when the button starts waiting. With `aria-disabled`, the focus stays on the button (the author's keyboard test: one `POST`), and it's faded with `opacity-70`. `min-h-11` = 44 px high (Concept 11).
- **`aria-pressed`** makes it a toggle button: a screen reader says "pressed" (on) or "not pressed". The text `On`/`Off` gets `aria-hidden` so it isn't read twice.
- **The note under the button** (`<p role="status">`) holds `Waiting for device confirmation…` while waiting, or the reason the button is disabled. `useId()` gives it a unique id for `aria-describedby`, because the same button shows twice on one screen.
- **`401`** (the wristband expired and the refresh failed) calls `handleSessionExpired()` from the store: you're taken to `/login` with `Your session has expired. Please log in again.`

Save. This button isn't visible anywhere until 5.4.

**Then `src/main.tsx`.** By default, switching screens in `<BrowserRouter>` is also a React transition, which waits for the button's Action too: if you click the menu **while** the button is waiting, the address changes, but the new screen only shows after the device answers (the author's test: ±2.4 seconds with a slow device; up to the `504`: ±4.7 seconds). So that switching screens doesn't wait for the button, replace the content of `src/main.tsx` with [its stage version](code/stages/practice-5/frontend/src/main.tsx) (**Copy raw file**): `<BrowserRouter>` is now `<BrowserRouter useTransitions={false}>`. In the author's test, the new screen then showed ±20 ms after the click, and the command's result and its toast still arrived.

#### 5.3 One sentence for every answer: refused by the device, `409`, `504`, and a silent server (10 minutes)

Two places in the `SwitchButton.tsx` you just wrote pick the toast sentence for a failed command. Read both with the answer table of [Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack) at hand:

1. **Inside `try`:** a `200` answer with `ack.ok: false` isn't an error, so `catch` isn't called. Its own line writes `Lamp: the device refused (…)` with the reason from `ack.message`.
2. **In `failureMessage()`:** every `ApiError`. `504` and code `0` get their own sentence; the rest use the backend's message (`err.message`) after the button's name. Other errors (rare) become `Lamp: the command failed.`

| Answer | Toast | Where you see it |
| :--- | :--- | :--- |
| code `0` (the request didn't get there) | `Lamp: the server didn't answer.` | 5.5, network blocked by DevTools |
| `200`, `ack.ok: false` | `Pump: the device refused (pump refused: tank water too low)` | [6.5](#65-the-simulator-soil-and-tank-typed-in-the-terminal-5-minutes), with `tank 15` (the pump has its own sentence picker, 5.4) |
| `409` | `Lamp: ` + the backend's message | for example an old screen that still has buttons after the device's key was revoked (5.4) |
| `504` | `Lamp: not confirmed by the device yet; the server will try again when it hears from the device.` | the author's recording in 5.5 |
| `200`, unknown `ack` | `Lamp: Unknown answer from the server.` | rare, for example when the backend and its schema copy differ |

The `504` sentence deliberately doesn't use the words "failed" or "cancelled": the backend still remembers your wish and sends it again by itself ([Concept 2](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic); details in [🔬](#-technical-deep-dive-optional) *After a `504`*). Its red color comes from the `"error"` kind sent to `toast()`, not from the sentence. There's nothing to save in this step.

#### 5.4 `PumpButton`, deliberately not optimistic, then the admin-only Controls section (10 minutes)

**Step 1 — The pump button.** Right-click **`frontend/src/components`** → **New File…**, name it **`PumpButton.tsx`**, open [`code/stages/practice-5/frontend/src/components/PumpButton.tsx`](code/stages/practice-5/frontend/src/components/PumpButton.tsx) on GitHub, click **Copy raw file**, then paste. Its shape is like `SwitchButton`, with three deliberate differences (Concept 2: watering twice isn't the same as watering once):

```tsx
  const usable = disabledReason === null && !waiting && !watering;
```

1. **Only `useTransition`, no `useOptimistic`.** The card title stays `Idle` until the `ack` arrives; while waiting there's only `Waiting for device confirmation…`.
2. **Disabled while watering.** `usable` also checks `watering` (`state.pump` from the device), so the **3 sec**, **5 sec**, and **10 sec** buttons (`SECOND_OPTIONS`) only come alive again after the device reports its pump idle.
3. **Its own sentences.** Even success gets a toast, `"Pump: watering for " + seconds + " seconds."`, and `504` reads `Pump: not confirmed by the device and not sent again. Check the pump's state before trying again.`, because the backend really doesn't send pump commands again.

> [!WARNING]
> Device path: this button turns on a real pump. Tap it only if the water tank has water (a mini pump is cooled by the water it pumps), and its power still comes from the MB102, not an ESP32 pin.

**Step 2 — Put them in Details.** Replace everything in `src/components/DeviceDetails.tsx` with [its stage version](code/stages/practice-5/frontend/src/components/DeviceDetails.tsx) (**Copy raw file**). The new part is right below the status line (`<LastSeen … />`), above the chart:

```tsx
      {/* Module 24: the Controls section, admin-only, for Node 1 and the simulator (Node 2 takes no commands) */}
      {admin && !node2 && !messagesIgnored ? (
        <section aria-labelledby="controls-title" className="mt-4">
          …
          {state === undefined ? (
            …
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <SwitchButton deviceId={id} target="lamp" label="Lamp" value={state.lamp} disabledReason={reason} />
              <SwitchButton deviceId={id} target="fan" label="Fan" value={state.fan} disabledReason={reason} />
              <PumpButton deviceId={id} watering={state.pump} disabledReason={reason} />
            </div>
          )}
        </section>
      ) : null}
```

- **`admin`** from `useAdmin()` (Practice 3) is `true` only when the admin role is certain, so a viewer account doesn't briefly see this section when the page opens. This is the screen layer of [Concept 5](#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security); the backend's guard still answers `403` ([Quick Win Step 4](#step-4--tap-as-viewer-403-from-the-backends-guard-4-minutes)).
- **`!node2`**: Node 2 takes no commands. **`!messagesIgnored`**: if the device's key is revoked, the whole Controls section disappears (after the screen is reloaded). A screen that's already open still has buttons, and a tap there is answered `409` (in the author's test: `Lamp: device f00d00000001 key has been revoked`, the button rolls back).
- **`state`** = the `state` of the last reading; before there is one, this section writes `The control buttons appear as soon as the device reports the state of its lamp, fan, and pump (its next message).`
- **`whyDisabled()`** fills `reason`, for example `The device is offline: commands can't be sent.` The backend refuses too (`409`), but the button tells you first.
- **`cardsNode1(t, admin)`**: the Lamp, Fan, and Pump cards are now only for the viewer, so the admin doesn't see the same state twice. The curtain stays a card; its button is [Challenge Level 1](#level-1--a-curtain-button-0180-a-small-change-20-minutes).

Save. As admin, open the details of **Practice living room** (device path: your Node 1).

**Result (example, the author's lab):** under the status line there's the heading `Controls`, the buttons `Lamp` `Off` and `Fan` `Off` side by side, then the card `Pump: water for` `Idle` with the buttons `3 sec` `5 sec` `10 sec`. For admin, the Lamp, Fan, and Pump cards no longer show; the Curtain card stays. On Node 2's Details, there's no Controls section.

#### 5.5 ⭐ The lamp from the dashboard, rollback, and a viewer account without buttons (15 minutes)

Set up two dashboards side by side, **browser 1** (for example Chrome) and **browser 2** (for example Edge), both logged in as `admin@home.test` on the details of **Practice living room** (device path: your Node 1). Use two browsers, not two tabs: a tab in the background can be put on hold by the browser. In browser 1, press **F12** → the **Network** tab. The recordings below use the new simulator from 6.5; the old simulator handles the commands it receives the same way.

1. **Lamp and fan.** In browser 1, tap **Lamp**, then **Fan**, then both once more. Watch browser 2 and the `backend` terminal.

   **Result (example, the author's lab):** the button shows `On` at once, faded, with `Waiting for device confirmation…`; ±¼ second later that text disappears and the button stays `On`. Browser 2 follows 172–356 ms after the click, without **F5**. The log of each tap holds a line like:

   ```text
   [12:45:43] INFO: command c-20261025-054543-11 (api) to f00d00000001: lamp = true, ack ok=true in 9 ms
   ```

   The simulator terminal writes `f00d00000001: command c-20261025-054543-11 -> ok=true`; on the device path, Node 1's lamp relay turns on too.
2. **Pump.** Tap **5 sec** (device path: only if the water tank has water). **Result (example):** the title stays `Idle` with `Waiting for device confirmation…`, then the toast `Pump: watering for 5 seconds.`, the title `Watering`, the note `The pump is watering…`, all three buttons faded, and ±5 seconds later `Idle` again; log `pump = 5, ack ok=true in 10 ms`.
3. **Rollback.** Make sure the Lamp is `Off`. In the **Network** tab, right-click the last `command` row → **Block request**. The **Request conditions** drawer (DevTools' bottom panel; formerly *Network request blocking*) opens with that address, and the **Enable blocking and throttling** box is ticked. Tap **Lamp**.

   **Result:** a red toast `Lamp: the server didn't answer.`, and the button stays `Off`; the rollback is too fast to see (lab: the toast 39 ms after the tap). The `backend` log stays silent, because the request never left the browser. Then untick **Enable blocking and throttling** (closing DevTools turns it off too). The menu labels above come from the Chrome DevTools documentation; in the lab, the author blocked the same address through the equivalent DevTools command.

![Real screenshots, DevTools device mode 375 pixels (not a real phone), Google Chrome 156, admin account, Details of Node 1 living room; the lab's mock Node 1 deliberately answers 3 seconds late so the middle frame could be shot; from the final code: the Rules menu only comes in Practice 7, and before Practice 9 the teal and gray text are slightly lighter. Top, three crops of the Controls section with arrows: 1 before the tap, Lamp Off next to Fan Off; 2 about 0.9 seconds after the tap, Lamp On at once in faded teal with the text Waiting for device confirmation… under it; 3 about 3.9 seconds, the device has answered, Lamp On in solid teal without the text. Bottom left, the whole phone screen: the lamp turned off first, then tapped again while the network was blocked; Lamp back at the reported state, Off (number 4), and the red toast at the bottom of the screen Lamp: the server didn't answer. with its close button (number 5). Legend: 1 the state the device reported, aria-pressed false; 2 shown 5 ms after the tap through useOptimistic and useTransition, the button faded and not tappable again; 3 the state taken from ack.state, the waiting text gone; 4 the tap asked for On, but the command failed on the network, so the button rolled back to the reported Off; the network blocked with the pattern */command, the same as the DevTools Request conditions drawer; 5 a toast at the bottom of a phone screen, top right on a laptop from 1280 pixels, gone after 4 seconds or when closed.](assets/button-waiting-for-confirmation.png)

4. **Viewer account.** In browser 2, click **Log out**, log in as `viewer@home.test`, then open the same Details.

   **Result (example):** no **Controls** section; the chart right under the status line, and below it the read-only cards `Lamp` `Off`, `Fan` `Off`, `Pump` `Idle`, `Curtain` `90°`. Not one Lamp, Fan, or pump button; the chart pickers Temperature, Light, Humidity stay, because they aren't controls.

![Two real screenshots of the same Node 1 living room Details page, DevTools device mode 375 pixels wide (not a real phone), from two browser sessions on the same message, Google Chrome 156; Node 1 living room = the lab's mock Node 1, sensor numbers are examples; from the final code: the Rules menu only comes in Practice 7, and before Practice 9 the teal and gray text on your screen are slightly lighter. Left, the admin account: header Mini Smart Home, Live, menu Devices and Rules, Home Admin (admin), Log out (number 1); Back to the list, History, Node 1 living room, key active, node1 Online, last seen just now; the Controls section with the buttons Lamp Off and Fan Off (number 2) and Pump: water for 3 sec, 5 sec, 10 sec, Idle (number 3); the Temperature chart of the last 5 minutes, updated at 17:28:53 WIB (number 6), the gauges soil moisture 45 % and water tank 60 %, the cards Temperature 28.3 °C, Humidity 70 %, Light 2000, Motion No. Right, the viewer account: Home Guest (viewer) (number 1); no Controls section, the chart right under the status line (number 4); updated at 17:28:53 WIB (number 6); the same cards, then the read-only cards Lamp Off and Fan Off, and Pump Idle next to Curtain 90° (number 5). Legend: name and role from the backend (the login answer, or /auth/me when the page opens); SwitchButton Lamp and Fan; PumpButton 3, 5, 10 sec, not optimistic; viewer without Controls; read-only cards; the same message. Note: no buttons are drawn for the viewer, and the backend's guard still refuses with 403 if a viewer sends a command another way.](assets/details-admin-vs-viewer.png)

> [!NOTE]
> **A `504` in the author's lab** (you don't need to repeat it; it needs a device that's `online` but silent, here the mock Node 1): the toast `Lamp: not confirmed by the device yet; the server will try again when it hears from the device.` 5.05 seconds after the tap, the button back to the reported state (`Off`), log `WARN: … no ack within 5 seconds` and `POST /devices/a4cf12e5b7c0/command -> 504 (5018 ms)`. 40.0 seconds after the tap, the lamp turns on by itself with the toast `lamp a4cf12e5b7c0 reported false, but true is desired (api); command sent again`. The red line `Failed to load resource: … 504 (Gateway Timeout)` in the **Console** is expected. On the other hand, while the simulator is stopped (**Ctrl + C**), all three buttons are faded with `The device is offline: commands can't be sent.` and a tap sends nothing.

**You pass this ⭐ step** when the Lamp in browser 1 changes at once with `Waiting for device confirmation…`, then follows the device's answer (log `lamp = true, ack ok=true`), browser 2 follows without **F5**, the blocked tap rolls back by itself with `Lamp: the server didn't answer.`, and the viewer account doesn't see the **Controls** section.

**Save to the branch.** In the free terminal (the `frontend` folder), `git status` lists `main.tsx`, `api.ts`, `store.ts`, and `DeviceDetails.tsx` as changed, and `contract.ts`, `SwitchButton.tsx`, and `PumpButton.tsx` as untracked. Then:

```text
git add src
git commit -m "Control buttons that wait for device confirmation (Module 24 Practice 5)"
```

> ⬆️ **Done with Practice 5?** The lamp now turns on from the dashboard, and the viewer only reads. Read [Concept 9](#9-rules-for-humans-rising-or-falling-hysteresis-and-layered-watering), then continue to [Practice 6 — Backend 1.1](#practice-6--backend-11-falls-below-rules-and-deleting-rules-50-minutes). L2 and L4 are repeated with the tester in [10.3](#103--the-user-test-on-the-testers-phone-four-tasks-without-help-25-minutes) and [10.5](#105-the-viewer-account-on-the-same-phone-then-delete-the-tester-account-and-switch-back-to-laptop-mode-10-minutes).

### Practice 6 — Backend 1.1: "falls below" rules and deleting rules (50 minutes)

> 🖥️ **Tools used:** **VS Code** with the `backend` terminal (stopped in 6.1, started again in 6.4), the Vite terminal in `frontend` (keeps running; the dashboard is still at the Practice 5 stage), and on the laptop path the broker and the simulator in `tools` (replaced in 6.5); **Docker Desktop** (`smarthome-db`); **Bruno** (6.4); **Chrome or Edge** at `http://localhost:5173` (6.5); device path: the **Arduino IDE** Serial Monitor for Node 1 (6.5). Concepts used: 9.
>
> ⭐ **Required** — step 6.4: `npm audit fix` has been run, `npm test` passes 57 tests, and Bruno creates and then deletes the watering rule, while the viewer account is refused with `403`.

Backend v1.0 refuses the rule "water if soil < 30%" with `400` and can't delete rules yet ([Concept 9](#9-rules-for-humans-rising-or-falling-hysteresis-and-layered-watering)). This practice raises it to **1.1.0**: 16 files are copied from `code/backend/` (five of them new), then the version and the lock are changed with npm. No database migration, no new package, the data contract stays 1.4, and the dashboard isn't touched. All the changes (18 files, including `package.json` and the lock) are in [`code/backend-1.1.diff`](code/backend-1.1.diff).

**How to copy, the same for every file:** open its link on GitHub, click **Copy raw file**, then paste it over everything in the file with the same name in your `backend` folder. A NEW file is created first: right-click its folder → **New File…**.

#### 6.1 Schema 1.1: `rule-basics.ts` without node-cron and a thin `rules.ts` (10 minutes)

1. In the `backend` terminal, press **Ctrl + C**. `npm run dev` restarts the backend every time a file is saved, but halfway through the copying, a new file calls functions that haven't been copied yet. The dashboard badge becomes **Reconnecting…** until 6.4, and that's expected.
2. Create the NEW file `src/schemas/rule-basics.ts` from [`code/backend/src/schemas/rule-basics.ts`](code/backend/src/schemas/rule-basics.ts). It holds every rule shape of Module 19, plus one condition:

   ```ts
   export const BelowThresholdCondition = z.strictObject({
     kind: z.literal("below-threshold"),
     device_id: DeviceId,
     quantity: Quantity,
     on_below: z.number(),
     off_above: z.number(),
     for_seconds: z.number().int().min(0).max(3600),
   }).refine((c) => c.off_above > c.on_below, {
     message: "off_above must be greater than on_below (hysteresis)",
     path: ["off_above"],
   });
   ```

   The condition–action pairs are loosened too: a rising/falling threshold + a command (for example the pump for 5 seconds) is now valid, and the only refused pair left is a schedule + a switch, with the message `a schedule condition goes with a command action; a switch action only goes with a threshold or below-threshold condition`.
3. Replace everything in `src/schemas/rules.ts` with this code:

   ```ts
   // rules.ts - the automation rule schema for the SERVER (Module 19). Module 24: every rule shape moved to rule-basics.ts, which
   // has no node-cron, so the dashboard can use a copy of it in the browser. Only one check that needs node-cron is added here:
   // can the cron expression of a schedule rule really be run?
   import type { z } from "zod";
   import cron from "node-cron";
   import { Rule as BaseRule } from "./rule-basics.ts";

   // Everything in rule-basics.ts is available from this file too (ThresholdCondition, BelowThresholdCondition, SwitchAction,
   // RuleFields, their types, and so on), so the other backend files keep importing from rules.ts as they have since Module 19.
   // The Rule below replaces the Rule of rule-basics.ts: a name written in this file itself always wins.
   export * from "./rule-basics.ts";

   // The body of POST /rules and PUT /rules/:id on the server: the basic shape + a cron expression node-cron can really run.
   export const Rule = BaseRule.refine((a) => a.condition.kind !== "schedule" || cron.validate(a.condition.cron), {
     message: "invalid cron expression",
     path: ["condition", "cron"],
   });

   export type Rule = z.infer<typeof Rule>; // the same name for the value and its type, as in rule-basics.ts
   ```

Why split it in two? The cron check uses node-cron, which only runs in Node.js, while the dashboard will later check the form with an **identical** copy of `rule-basics.ts` ([7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes)). So that file only imports `zod` and `contract.ts`, while `rules.ts` passes everything on (`export *`) and adds the server-only check, `invalid cron expression`. Other files still import from `rules.ts`.

#### 6.2 `evaluateBelowThreshold` in `rules/engine.ts` and its tests (10 minutes)

Replace the content of `src/rules/engine.ts` with [`code/backend/src/rules/engine.ts`](code/backend/src/rules/engine.ts). The new function is right below `evaluateThreshold`:

```ts
export function evaluateBelowThreshold(c: BelowThresholdCondition, memory: Memory, value: number | null, now: number):
  { memory: Memory; decision: Decision } {
  const mirror: ThresholdCondition = {
    kind: "threshold", device_id: c.device_id, quantity: c.quantity, for_seconds: c.for_seconds,
    on_above: -c.on_below, // below 30  ->  above -30
    off_below: -c.off_above, // above 35   ->  below -35
  };
  return evaluateThreshold(mirror, memory, value === null ? null : -value, now);
}
```

This is the mirror of Concept 9: Module 19's brain isn't rewritten, it's only given numbers with the opposite sign. Also replace `src/rules/engine.test.ts` with [its 1.1 version](code/backend/src/rules/engine.test.ts): 11 new tests, for example exactly 30 doesn't water yet, 25% for 20 seconds gives `turn-on` only once, and exactly 35 isn't ready again yet. They all run in 6.4.

#### 6.3 Two-way automation, a one-time command, and `DELETE /rules/:id` (15 minutes)

Copy these seven existing files and two NEW test files (all in `src/`):

| File | What changes |
| :-- | :-- |
| [`services/automation.ts`](code/backend/src/services/automation.ts) | picks `evaluateThreshold` or `evaluateBelowThreshold` by `condition.kind`; a `command` action is sent once when the rule turns on; the 🌱/✅ sentences; `deleteRule()`; `data.ok` |
| [`services/commands.ts`](code/backend/src/services/commands.ts) | `forgetRuleWishes()` |
| [`services/schedule.ts`](code/backend/src/services/schedule.ts) | `data.ok` in schedule events |
| [`db/archive.ts`](code/backend/src/db/archive.ts) | `deleteRuleDb()` |
| [`routes/rules.ts`](code/backend/src/routes/rules.ts) | `DELETE /rules/:id`: `200`, `404` (`rule N doesn't exist`), or `503` |
| [`auth/security.ts`](code/backend/src/auth/security.ts) | `"DELETE"` in the CORS `methods` |
| [`server.ts`](code/backend/src/server.ts) | version `1.1.0` in `/docs` |
| [`services/automation.test.ts`](code/backend/src/services/automation.test.ts) (NEW) | 5 tests: waters once, ready again, refused, deleted, deactivated |
| [`routes/rules.test.ts`](code/backend/src/routes/rules.test.ts) (NEW) | 6 tests, the real guard: not logged in `401`, viewer `403`, admin `200` then `404`, the `DELETE` preflight |

Deleting a rule is put together in `automation.ts`, so the rule stops right away, not after the backend restarts:

```ts
export async function deleteRule(id: number): Promise<{ id: number; name: string } | undefined> {
  const row = await deleteRuleDb(id);
  if (row === undefined) return undefined;
  rules = rules.filter((a) => a.id !== row.id); // stops being evaluated NOW, before the database is read again
  memory.delete(row.id);
  forgetRuleWishes(row.id); // a device that restarts doesn't receive this rule's command again
  await loadRules(); // the list in memory and the schedule tasks are updated too
  const message = `Rule ${row.id} (${row.name}) deleted through the API`;
  log.info(message);
  recordEvent({ device_id: null, kind: "rule-changed", source: "api", rule_id: null, message,
    data: { id: row.id, name: row.name, deleted: true } });
  sendAllConfigs();
  return row;
}
```

The event's `rule_id` is `null` because its row no longer exists; its number goes along in `data`. Then one line in `security.ts`:

```ts
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
```

Without `"DELETE"`, the browser already refuses at the preflight even though the route exists; Bruno isn't affected (it isn't a browser). The other consequences (actuators left as they are when their rule is deleted, `data.ok`, watering that isn't tried again) are discussed in Concept 9.

#### 6.4 ⭐ `npm run check`, `npm test`, and `npm audit`, then Bruno and `/docs` 1.1.0 (10 minutes)

1. Copy the last three files: [`README.md`](code/backend/README.md) and two NEW files in the `bruno` folder, named exactly `create soil watering rule.yml` and `delete rule.yml` (without a body and `Content-Type`):

   ```yaml
   info:
     name: create soil watering rule
     type: http
     seq: 24

   http:
     method: POST
     url: "{{baseUrl}}/rules"
     body:
       type: json
       data: |-
         {
           "name": "Water if soil < 30 %",
           "active": true,
           "condition": {
             "kind": "below-threshold",
             "device_id": "a4cf12e5b7c0",
             "quantity": "soil",
             "on_below": 30,
             "off_above": 35,
             "for_seconds": 10
           },
           "action": {
             "kind": "command",
             "device_id": "a4cf12e5b7c0",
             "command": {
               "target": "pump",
               "value": 5
             },
             "notify": true
           }
         }
     auth: inherit

   runtime:
     assertions:
       - expression: res.status
         operator: eq
         value: "201"

   settings:
     encodeUrl: true
     timeout: 0
     followRedirects: true
     maxRedirects: 5
     forwardAuthorizationHeader: true
   ```

   ```yaml
   info:
     name: delete rule
     type: http
     seq: 25

   http:
     method: DELETE
     url: "{{baseUrl}}/rules/4"
     auth: inherit

   runtime:
     assertions:
       - expression: res.status
         operator: eq
         value: "200"

   settings:
     encodeUrl: true
     timeout: 0
     followRedirects: true
     maxRedirects: 5
     forwardAuthorizationHeader: true
   ```

2. In the `backend` terminal, run `npm audit` (if there's only a spinning animation, `npm audit --no-progress`, as in Module 20).

   **Expected output (25 October 2026, trimmed):**

   ```text
   # npm audit report

   fast-uri  3.0.0 - 3.1.8 || 4.0.0 - 4.2.2
   Severity: moderate
   …
   fix available via `npm audit fix`
   …
   1 moderate severity vulnerability
   ```

   This vulnerability was already in the v1.0 lock; it isn't caused by Module 24. The result of `npm audit` depends on the date: on your laptop it may be zero, or more. The habit being practiced: read the package name and the severity, run `npm audit fix` (not `--force`), then prove the tests still pass.
3. Run `npm audit fix`, then `npm audit` once more. **Result:** `changed 3 packages, and audited 226 packages in 4s` … `found 0 vulnerabilities`, then `found 0 vulnerabilities`.
4. Raise the version: `npm pkg set version=1.1.0` (no output), then `npm install` so the lock becomes 1.1.0 too (`up to date, audited 226 packages` … `found 0 vulnerabilities`).
5. Run `npm run check` (only two header lines, no errors), then `npm test`. **Expected output (trimmed):**

   ```text
    ✓ src/services/automation.test.ts (5 tests) 111ms
    ✓ src/routes/rules.test.ts (6 tests) 69ms
   …
    Test Files  7 passed (7)
         Tests  57 passed (57)
   ```

   v1.0 had only 5 files / 35 tests. The order and the ms numbers change on every run.
6. Run `npm run dev`. **Result (trimmed):** `> mini-smart-home-backend@1.1.0 dev`, `rules loaded: 2 active of 3` (the three Module 19 rules loaded whole; rule 3 inactive), then `Server listening at http://127.0.0.1:8080`. The dashboard badge is back to **Live**.

   > [!TIP]
   > The backend log holds 🌱, ✅, `—`, and `°`. If a Windows console shows them garbled, for example `≡ƒî▒ Soil 25 % ΓÇö …` (the dashboard is still right), stop the backend, type `chcp 65001` (the UTF-8 code page, only for that window), then `npm run dev` again. Proven by the author in Windows PowerShell 5.1; the VS Code terminal and Windows Terminal haven't been tested.
7. In Bruno: **login admin** → **create soil watering rule** → **login viewer** → **delete rule** → **login admin** → **delete rule** twice (the **Tests** tab is red for `403` and `404`: expected). The `delete rule` address ends with `/rules/4` (the Module 19 rules use 1–3); if the `id` in your 201 answer is different, change the number to your id (not 1–3). Its content uses Node 1 `a4cf12e5b7c0`; the backend doesn't check the device, so the laptop path gets `201` too. On the device path, soil that happens to be dry can trigger one watering before that rule is deleted.

   **Expected output (the author's lab recording; the `.yml` files sent as they are by a script, not the Bruno app):**

   ```text
   create soil watering rule -> 201 {"id":4,"name":"Water if soil < 30 %","active":true,"condition":{"kind":"below-threshold",…},…}
   viewer, delete rule       -> 403 {"message":"viewer accounts can only look; commands and changes are admin-only"}
   admin, delete rule        -> 200 {"id":4,"name":"Water if soil < 30 %","message":"rule 4 (Water if soil < 30 %) deleted"}
   admin, once more          -> 404 {"message":"rule 4 doesn't exist"}
   ```

   Backend log (trimmed): `WARN: refused (403): account 2 (viewer) tried DELETE /rules/4`, `INFO: Rule 4 (Water if soil < 30 %) deleted through the API`.
8. Open `http://localhost:8080/docs`: its version is `1.1.0`, and there's `DELETE /rules/{id}` with the description `Delete one rule; it stops applying right away. Its command and event history stays`.

**You pass this ⭐ step** when `npm audit fix` has been run, `npm test` writes `Tests  57 passed (57)`, `/docs` has version `1.1.0`, and Bruno gets `201`, `403` for the viewer, `200`, then `404`. Something failed? See [🚨](#-troubleshooting) *Deleting a rule fails …*.

> [!NOTE]
> **Going back to v1.0 is still safe, with one surprise.** Backend v1.0 doesn't crash when it reads a rule of the new shape; it skips it, for example `WARN: rule 5 skipped: condition.kind: Invalid discriminator value. Expected 'threshold' | 'schedule'` in the author's lab. The surprise: v1.0's `GET /rules` doesn't show that rule either, as if it were gone. Its data is intact in the database and shows again as soon as you go up to 1.1. While on v1.0, don't save a rule with that number through `PUT`: its content would be overwritten with the v1.0 shape.

#### 6.5 The simulator: `soil` and `tank` typed in the terminal (5 minutes)

**Laptop path.** The Module 21 simulator reads a random soil value of 20–60% and always accepts pump commands.
1. In the `tools` terminal, press **Ctrl + C**. Replace `device-simulator.js` and `README.md` in the `tools` folder with [`code/tools/device-simulator.js`](code/tools/device-simulator.js) and [`code/tools/README.md`](code/tools/README.md) (the changes: [`code/tools.diff`](code/tools.diff)), then run `node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1` again.
2. Type these one at a time, each followed by Enter: `soil 25`, `soil random`, `tank 15`, `tank random`, `soil 101`.

**Expected output (exact, two parts of the author's lab recording):**

```text
1 fake device(s) heading to mqtt://127.0.0.1:1883. Type for example "temp 33", "soil 25", "tank 15", or "soil random". Stop with Ctrl+C.
f00d00000001: online
soil 25
Soil: 25 %
soil random
Soil: random 20-60 %
tank 15
Tank: 15 % (below 20 %: pump commands will be refused)
tank random
Tank: random 30-90 %
soil 101
Type for example: temp 33, temp random, soil 25, soil random, tank 15, or tank random (soil and tank: whole numbers 0-100)
```

A typed number goes along with the next message (at most 10 seconds), input outside 0–100 only brings up the help, and a restarted simulator goes back to random. The soil doesn't get wet by itself after the pump runs; you type "the soil is wet again" (`soil 40`) in [8.5](#85--automatic-watering-from-the-form-soil-25-the-pump-waters-then-its-ready-again-15-minutes).

3. **A pump that's really refused.** Type `tank 15`, open the details of **Practice living room** as admin, then tap **5 sec** on the pump card.

**Result (example, the author's lab; recorded while the backend was still v1.0, and this command path doesn't change in 1.1):** `Waiting for device confirmation…`, the pump title stays `Idle`, then the red toast `Pump: the device refused (pump refused: tank water too low)`. The simulator terminal:

```text
f00d00000001: pump REFUSED: tank water only 15 %
f00d00000001: command c-20261025-054313-6 -> ok=false
```

Backend log: `pump = 5, ack ok=false in 17 ms` and `POST /devices/f00d00000001/command -> 200 (61 ms)`. This is the `200` answer with `ack.ok: false` from [Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack): the server delivers, the device refuses. In [5.5](#55--the-lamp-from-the-dashboard-rollback-and-a-viewer-account-without-buttons-15-minutes) the lamp button rolled back because its request was blocked; here the device itself refuses, and the pump, which isn't optimistic (Concept 2), simply stays `Idle`. **Type `tank random` before you continue**: while the tank is at 15, the watering rule in 8.5 is refused too, and then not tried again (Concept 9).

**Device path.** The soil and the tank are read by sensors; don't drain the tank to test the refusal (the pump must not run dry). Required: lower Node 1's local watering threshold to 20% so the server rule (30%) acts first (the Module 19 revision, Concept 9). In Node 1's Serial Monitor, type `threshold`, then `threshold 20`. According to the firmware v1.6.0 code, Node 1 answers `threshold: soil_watering = 20 % (from NVS)`, the number is kept even through a power cut, and `threshold default` brings it back to 30%. This step was read from the firmware and **hasn't been tested by the author on a real board**.

**Save to the branch.** In the free terminal, `cd ../backend`, then:

```text
git add src bruno README.md package.json package-lock.json ../tools/device-simulator.js ../tools/README.md
git commit -m "Backend 1.1.0 and the soil/tank simulator (Module 24 Practice 6)"
```

The final state is in [`code/backend/`](code/backend/) and [`code/tools/`](code/tools/); the dashboard stays at the Practice 5 stage.

> ⬆️ **Done with Practice 6?** Backend 1.1 is ready, but the dashboard doesn't show a single rule yet. Read [Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend), then continue to [Practice 7 — The rule list in sentences](#practice-7--the-rule-list-in-sentences-30-minutes).

### Practice 7 — The rule list in sentences (30 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and the terminals `backend` (`npm run dev`), `frontend` (Vite), and one free terminal for npm and Git (laptop path: the broker and the simulator keep running); **Docker Desktop** (`smarthome-db`); **Bruno**; and **two different browsers**, for example **Edge** and **Chrome**. Concepts used: 8 and 9.

So far, rules have only been visible as JSON in Bruno. This practice shows them on a new screen, `/rules`, as cards in plain sentences, for the admin **and** the viewer: now the viewer knows why the fan turned on by itself, too. Creating and editing rules from the screen comes in Practice 8. Your frontend is still in its end-of-Practice-5 state, because Practice 6 only changed the backend. The code at the end of this practice: [`code/stages/practice-7/frontend/`](code/stages/practice-7/frontend/).

#### 7.1 Copy `rule-basics.ts`, then guard both copies with `npm run check-schema` (10 minutes)

Why it's copied rather than imported (node-cron causes a white screen), and why it's checked by our own script rather than `git diff --no-index` (false reports on CRLF), is in [Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend). The steps:

1. **Copy with VS Code, don't retype.** In the Explorer panel, right-click `backend/src/schemas/rule-basics.ts` (Practice 6) → **Copy**, then right-click the `frontend/src/schemas` folder → **Paste**. Don't change a single character, including the header comment and the `./contract.ts` import; the copy of `contract.ts` from [5.1](#51-copy-contractts-then-a-sendcommand-that-checks-the-answer-with-acksafeparse-15-minutes) is already there. Take it from your own backend, not from GitHub, because the checker compares with your backend.
2. **A "this is a copy" note.** Right-click the `frontend/src/schemas` folder → **New File…**, name it **`README.md`**, then fill it in (or open [`code/stages/practice-7/frontend/src/schemas/README.md`](code/stages/practice-7/frontend/src/schemas/README.md) on GitHub, click **Copy raw file**, then paste):

   ```markdown
   # `src/schemas/` — schema copies from the backend

   `contract.ts` and `rule-basics.ts` in this folder are **COPIES** of `backend/src/schemas/` (Module 24). With these copies, the form in the browser checks the input with exactly the same rules as the backend, and the `ack` answer is checked with the same schema the server uses.

   - **Don't change the copies here.** Change the backend first, copy both files to this folder again, then run `npm run check-schema` from the `frontend` folder. The right result: two `SAME` lines. CRLF (Windows) and LF line endings count as the same.
   - **Why copied, not imported from `../backend`?** `backend/src/schemas/rules.ts` uses node-cron, which can't run in a browser (the page turns white). The frontend must also build on its own, without the `backend` folder and its `node_modules`. The backend still checks every input again, including the cron expression that can't be checked in the browser.
   - Both copies import with the `.ts` ending (`./contract.ts`), the same style as the backend. The frontend allows it through `allowImportingTsExtensions` in `tsconfig.app.json`; the other frontend files still import without the ending.
   - `contract.ts` calls `z.config(z.locales.en())`, so every built-in Zod error message in the dashboard is in English.
   - `login.ts` is **not** a copy: the Log in form's schema is written by hand, mirroring the `LoginBody` schema in `backend/src/routes/auth.ts`.
   ```

3. **The checker.** Right-click the **`frontend`** folder (not `src`) → **New File…**, name it **`check-schema.js`**, then type (or **Copy raw file** from [`code/stages/practice-7/frontend/check-schema.js`](code/stages/practice-7/frontend/check-schema.js)):

   ```js
   // check-schema.js - checks that the schema copies in src/schemas/ are EXACTLY THE SAME as the originals in the backend (Module 24).
   // Run it from the frontend folder with "npm run check-schema". Exit code 0 = all the same, 1 = something differs.
   // CRLF (Windows) and LF line endings count as the same: Git on Windows can change them quietly, while the content stays the same.
   import { readFileSync } from "node:fs";

   const ORIGINAL = "../backend/src/schemas/"; // the backend folder next to the frontend folder
   const COPY = "src/schemas/";
   const FILES = ["contract.ts", "rule-basics.ts"];
   const BOM = String.fromCharCode(0xfeff); // the BOM mark: unseen, some editors put it at the start of a file

   // a file's content as a list of lines, with CRLF line endings turned into LF
   function readLines(path) {
     try {
       return readFileSync(path, "utf8").replaceAll("\r\n", "\n").split("\n");
     } catch {
       console.error("Can't read " + path + ". Run this from the frontend folder, with the backend folder next to it.");
       process.exit(1);
     }
   }

   let allSame = true;
   for (const name of FILES) {
     const original = readLines(ORIGINAL + name);
     const copy = readLines(COPY + name);
     // find the first line that differs
     let firstDiff = -1;
     for (let i = 0; i < Math.max(original.length, copy.length); i++) {
       if (original[i] !== copy[i]) {
         firstDiff = i;
         break;
       }
     }
     if (firstDiff === -1) {
       console.log("SAME  " + COPY + name);
       continue;
     }
     allSame = false;
     console.log("DIFF  " + COPY + name + ", from line " + (firstDiff + 1) + ":");
     console.log("  backend : " + (original[firstDiff] ?? "(end of file)"));
     console.log("  frontend: " + (copy[firstDiff] ?? "(end of file)"));
     // two differences the eye can't see: a BOM mark (U+FEFF) at the start of a file, and the line break at the end of a file
     if (firstDiff === 0 && (original[0].startsWith(BOM) || copy[0].startsWith(BOM))) {
       console.log("  (an unseen difference: one file starts with a BOM; save it again as UTF-8 without BOM)");
     } else if (original[firstDiff] === undefined || copy[firstDiff] === undefined) {
       console.log("  (a difference at the end of the file: its last line break is missing or extra)");
     }
   }

   if (!allSame) console.log("Copy the file again from " + ORIGINAL + " (don't change it in the frontend), then run this again.");
   process.exit(allSame ? 0 : 1);
   ```

   This Node script needs no extra package. `FILES` names both copies, so `contract.ts` is checked too; CRLF counts as the same as LF. Exit code `1` means something differs.
4. **Give the command a name.** In `frontend/package.json`, the `"scripts"` part, add one line after `"dev:phone"` (don't forget the comma at the end of the `"dev:phone"` line):

   ```json
       "dev:phone": "vite --host",
       "check-schema": "node check-schema.js"
   ```

5. **Run it.** In the free terminal, make sure you're in the `frontend` folder (from the `backend` folder: `cd ../frontend`), then type `npm run check-schema`.

   **Expected output:**

   ```text
   > mini-smart-home-frontend@0.2.0 check-schema
   > node check-schema.js

   SAME  src/schemas/contract.ts
   SAME  src/schemas/rule-basics.ts
   ```

   `0.2.0` stays that way until Practice 10. If `Can't read ../backend/src/schemas/contract.ts. …` shows up, the `backend` folder isn't next to the `frontend` folder.
6. **Prove the checker works.** In the **copy** `frontend/src/schemas/rule-basics.ts`, change `.max(60)` on line 71 to `.max(80)`, save, then run `npm run check-schema` again.

   **Expected output** (exit code 1):

   ```text
   > mini-smart-home-frontend@0.2.0 check-schema
   > node check-schema.js

   SAME  src/schemas/contract.ts
   DIFF  src/schemas/rule-basics.ts, from line 71:
     backend :   name: z.string().min(1).max(60),
     frontend:   name: z.string().min(1).max(80),
   Copy the file again from ../backend/src/schemas/ (don't change it in the frontend), then run this again.
   ```

   Put `60` back (**Ctrl + Z**), save, then run it again until you get two `SAME` lines. `DIFF` on line 1 with no visible difference, or at the end of the file? See [🚨](#-troubleshooting) *`npm run check-schema` writes `DIFF`*.

From now on there's one rule: change the schema in the backend first, copy it again (delete the old copy first: **Paste** doesn't overwrite, it makes `rule-basics copy.ts` instead), then run `npm run check-schema`. This item goes into the pull request template in [➕ D](#d-add-the-module-24-items-to-the-pull-request-template).

#### 7.2 Four rule functions in `api.ts` and sentences from `describeRule()` (10 minutes)

**Step 1 — `src/rules.ts`.** Create the new file **`src/rules.ts`**: open [`code/stages/practice-7/frontend/src/rules.ts`](code/stages/practice-7/frontend/src/rules.ts) on GitHub, click **Copy raw file**, then paste. It has two parts:

- **`FullRule`**: the shape of one row of the `GET /rules` answer, namely the rule's content from the schema copy (`...RuleFields.shape`) plus `id`, `created_at`, `updated_at`, and `next_run` (an active schedule: when it runs again; otherwise `null`). Written by hand because the backend's route file can't be copied.
- **`describeRule(rule, nameOf)`**: a pure function that turns a rule's JSON into a sentence. `QUANTITIES` gives the name and unit (`soil` → "soil moisture", ` %`), `num()` writes English style (`28.5`, `3,500`), the cron `0 6 * * *` becomes `Every day at 06:00 WIB`, and a command becomes a verb (`water for 5 seconds`). The direction follows Concept 9: `threshold` writes "is above", `below-threshold` "is below". A `switch` action ends the sentence with "… turns off again after …", a `command` action with "(once). The rule is ready again after …".

**Step 2 — `src/api.ts`.** Open [`code/stages/practice-7/frontend/src/api.ts`](code/stages/practice-7/frontend/src/api.ts) on GitHub, click **Copy raw file**, then paste it over everything in your `src/api.ts`. What's new: two imports, a comment in `request()`, and four functions after `sendCommand()`. Two of them (`…` = lines skipped):

```ts
export async function getRules(): Promise<FullRule[]> {
  const answer = await request<unknown>("/rules");
  const result = FullRule.array().safeParse(answer); // .array() = an array whose every item is a FullRule
  if (!result.success) throw new ApiError(200, "Unknown answer from the server (rule list).");
  return result.data;
}
…
export function deleteRule(id: number): Promise<{ id: number; name: string; message: string }> {
  return request<{ id: number; name: string; message: string }>("/rules/" + id, { method: "DELETE" });
}
```

Like `Ack.safeParse` in 5.1, the rule list is checked by Zod; other answers, such as the history, are still trusted through their type. `createRule()` (`POST`) and `updateRule()` (`PUT /rules/:id`) send JSON for the Practice 8 form. `deleteRule()` deliberately has **no** `Content-Type` and no body, like `logout()`: a `DELETE` that claims to carry JSON while it's empty is answered `400` `FST_ERR_CTP_EMPTY_JSON_BODY` ([🚨](#-troubleshooting) *Deleting a rule fails …*). Save; the screen doesn't change yet.

#### 7.3 The `/rules` screen and the Rules menu: sentence cards that stay fresh (10 minutes)

**Step 1 — the "rules changed" signal.** When a rule is created, changed, or deleted, the backend broadcasts a `rule-changed` event to **every** dashboard. Replace everything in `src/store.ts` and `src/socket.ts` with the stage 7 versions ([`store.ts`](code/stages/practice-7/frontend/src/store.ts), [`socket.ts`](code/stages/practice-7/frontend/src/socket.ts); **Copy raw file**). The store gets a counter (its type goes into `type LiveStore` too):

```ts
  rulesVersion: 0,
  rulesChanged: () => set((s) => ({ rulesVersion: s.rulesVersion + 1 })),
```

`onEvent` in `socket.ts` raises it, still without a toast ([Concept 10](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone)):

```ts
      if (ev.kind === "rule-changed") {
        useLiveStore.getState().rulesChanged();
        return;
      }
```

**Step 2 — the screen, the address, and the menu.** Create two new files with **Copy raw file**, [`src/components/RuleList.tsx`](code/stages/practice-7/frontend/src/components/RuleList.tsx) and [`src/pages/Rules.tsx`](code/stages/practice-7/frontend/src/pages/Rules.tsx), then replace everything in `src/App.tsx` and `src/components/Layout.tsx` with the stage 7 [`App.tsx`](code/stages/practice-7/frontend/src/App.tsx) and [`Layout.tsx`](code/stages/practice-7/frontend/src/components/Layout.tsx).

- **`RuleList`**: one card per rule with the name, an **Active**/**Inactive** badge (the color always comes with text), the `describeRule()` sentence with the device names from the store, and for an active schedule `Runs again: …` in WIB time. An empty list: `No automation rules yet.`
- **`RulesPage`** calls `getRules()` in a `useEffect` that depends on `[rulesVersion]`: every time the number goes up, the list is fetched again. This isn't polling; a request is only sent when there's news of a change, and the old list stays on the screen until the new one arrives.
- **`App`** gets `<Route path="/rules" element={<RulesPage />} />` outside the `AdminOnly` guard, because the viewer may read too. **`Layout`** adds a **Rules** `NavLink`, also without `end`, so it stays active on `/rules/new`.

**Step 3 — test with two dashboards.** Save all the files.

1. In **Edge**, log in as admin, then click the **Rules** menu.

   **Result (example):** the heading `Automation rules`, the sentence `The backend runs the rules, even while this dashboard is closed: …`, then one card per Module 19 rule of yours. In the author's lab (`/` = a new line in the card):

   ```text
   Automatic fan / Active / If the temperature on Node 1 living room is above 30 °C for 120 seconds, turn on the fan. The fan turns off again after the temperature falls below 28 °C. Notify via Telegram.
   Morning watering / Active / Every day at 06:00 WIB, water for 10 seconds on Node 1 living room. Notify via Telegram. / Runs again: Mon 26 Oct, 06:00 WIB
   Schedule test / Inactive / …
   ```

   This recording uses the Practice 8 code, which adds **+ New rule** ([8.3](#83-ruleform-at-rulesnew-useform-with-zodresolver-a-sentence-preview-and-the-save-button-20-minutes)) and **Edit** ([8.4](#84-edit-deactivate-and-delete-the-edit-button-and-the-rulesid-route-10-minutes)); the card sentences are the same.
2. In **another browser** (for example Chrome), log in as viewer and open **Rules**: the menu is there (`… Devices | Rules | Home Guest (viewer) | Log out`), and the cards are the same. Put both windows side by side; not two tabs in one browser: their cookies are the same (only one account), and a tab in the background can be put on hold.
3. In Bruno, run `login admin`, then open `create soil watering rule` (6.4). In the **Body** tab, change `"active": true` to `false` so the rule doesn't act, then **Send**: `201`. Note its `"id"` (your id, for example 5). Without **F5**, a `Water if soil < 30 %` card with the **Inactive** badge shows up in both dashboards.
4. Open `delete rule`, replace the `4` at the end of the address with your id, then **Send**: `200`; the card disappears again. Put `true` and `4` back as they were.

**Result** (the author's test): the inactive rule created and then deleted through the API appears and disappears without **F5** (checked 1.5 seconds after the `201` and the `200`), with exactly one `GET /rules` per `rule-changed` event (the **Network** tab) and no toast. The second dashboard in the other browser (viewer) followed within tens of milliseconds after the server answered; that's a lab example, not a promise.

In the free terminal (the `frontend` folder), save to the branch:

```text
git add package.json check-schema.js src
git commit -m "The rule list in sentences and npm run check-schema (Module 24 Practice 7)"
```

> ⬆️ **Done with Practice 7?** Every account can now read the rules as sentences, and their copies are guarded by `npm run check-schema`. Continue to [Practice 8](#practice-8--the-rule-form-create-edit-deactivate-delete-70-minutes): the same schema becomes a form, and the admin gets **+ New rule** and **Edit**.

### Practice 8 — The rule form: create, edit, deactivate, delete (70 minutes)

> 🖥️ **Tools used:** **VS Code** with the terminals `backend` (1.1.0), `frontend` (Vite), one free terminal for Git, and on the laptop path the broker plus the 6.5 simulator in the `tools` terminal; **Docker Desktop** (`smarthome-db`); **two different browsers** as in Practice 7: **Edge** (admin, DevTools **Network** tab) and **Chrome** (viewer). Concepts used: 7, 8, and 9.
>
> ⭐ **Required** — step 8.5: the rule "Water if soil < 30 %" is created from a new form, then `soil 25` brings up the 🌱 toast and the pump waters once, while `soil 40` brings up ✅ (L3, before the tester repeats it in Practice 10).

Since Practice 7 the rules can be read. Now the admin gets a form to create, edit, deactivate, and delete them; the input is checked by the same schema as the backend (Concept 8). The form is split into several small files and written **from the bottom up**: the ingredients (8.1), three parts (8.2), then `RuleForm`, which puts everything together (8.3), so the form only shows at the end of 8.3. The code at the end of this practice: [`code/stages/practice-8/frontend/`](code/stages/practice-8/frontend/).

**How to copy a long file:** open its link on GitHub, click **Copy raw file**, then paste it over everything in the file with the same name in `frontend/src/`. A NEW file is created first: right-click its folder → **New File…**.

#### 8.1 Form ingredients: `friendlyMessages` and `parse400` in `rules.ts`, and field helpers in `fields.tsx` (10 minutes)

**Step 1 — `src/rules.ts`.** Replace everything in it with [stage 8](code/stages/practice-8/frontend/src/rules.ts). Below the line `// ---- Practice 8: the rule form ----` there are new ingredients:

- **Default content.** `defaultRule()` fills a new form with a Module 19-style fan rule. `defaultCondition()`, `defaultAction()`, and `defaultCommand()` give every option its starting content (falling: soil 30, 35, 10 seconds; a one-time command: the pump for 5 seconds). `toFormValues()` cuts a stored rule down to the four fields that may be sent; the `id` and its times are the backend's business.
- **Devices.** `deviceNameOf()` swaps a `device_id` for its name from the store; `deviceOptions()` drops Node 2 from the acting options, because Node 2 takes no commands.
- **Messages.** You've read `friendlyMessages` in [Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend); its full version has six sentences. `parse400()` splits the backend's `400` sentence, for example `body/condition/cron invalid cron expression, body/name …`, into a list of `{ field, message }` with dotted field names (`condition.cron`), the same as the names in `register`.

**Step 2 — `src/fields.tsx` (new).** Right-click `frontend/src` → **New File…**, name it **`fields.tsx`**, then type (or **Copy raw file** from [its stage version](code/stages/practice-8/frontend/src/fields.tsx)):

```tsx
// fields.tsx - small helpers for the rule form's fields (Module 24): the box and label styles, each field's id, and each
// field's error message with its accessibility attributes. Used by RuleForm and its parts (WhenSection, ThenSection).
import { get, useFormState } from "react-hook-form";
import type { Control, FieldError } from "react-hook-form";
import type { Rule } from "./schemas/rule-basics";

// the input box style; aria-[invalid=true]: = a red edge when the field is marked wrong
export const BOX =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:aria-[invalid=true]:border-red-400";
export const LABEL = "mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200";

// a unique id for every field, from its name: "condition.cron" -> "field-condition-cron"
export const fieldId = (name: string) => "field-" + name.replaceAll(".", "-");

// useFieldErrors - each field's error message (from the schema in the browser, or from the backend's 400 answer). Without
// control, useFormState reads the nearest form (from <FormProvider> in RuleForm), so any part can use it without props.
// RuleForm itself is OUTSIDE its own <FormProvider>, so it passes its form's control.
export function useFieldErrors(control?: Control<Rule>) {
  const { errors } = useFormState({ control });
  const error = (name: string): string | undefined => get<typeof errors, FieldError | undefined>(errors, name)?.message;
  // the input box's accessibility attributes: aria-invalid + aria-describedby ONLY while its field is wrong
  const aria = (name: string) =>
    error(name) ? { "aria-invalid": true, "aria-describedby": fieldId(name) + "-error" } : { "aria-invalid": undefined, "aria-describedby": undefined };
  const showError = (name: string) =>
    error(name) ? (
      <p id={fieldId(name) + "-error"} className="mt-1 text-sm text-red-700 dark:text-red-300">
        {error(name)}
      </p>
    ) : null;
  return { aria, showError };
}
```

- **`BOX` and `LABEL`**: the style of every field. `min-h-11` = 44 px high (a touch target, Concept 11); `aria-[invalid=true]:` gives a wrong field a red edge.
- **`fieldId()`**: a unique id from the field's name, for `<label htmlFor>` and its error message.
- **`useFieldErrors()`** reads `errors` through `useFormState`, then gives `aria()` (`aria-invalid` and `aria-describedby` only while the field is wrong) and `showError()` (the red message under the box), the accessibility that react-hook-form doesn't add by itself (Concept 7). Without `control`, it reads the nearest form from `<FormProvider>` (8.3). Its ending is `.tsx` because it has JSX (`<p>`).

Save both files. The screen doesn't change yet: nothing imports these ingredients yet.

#### 8.2 Three parts of the form: `WhenSection`, `ThenSection`, and `ConfirmDelete` (15 minutes)

All three live in `src/components/` and only show after 8.3 puts them in.

**Step 1 — `WhenSection.tsx` (new, [**Copy raw file**](code/stages/practice-8/frontend/src/components/WhenSection.tsx)).** The **When does this rule turn on?** group (`<fieldset>` + `<legend>`, read out by screen readers as one group) holds three cards: **When a number RISES above a limit**, **When a number FALLS below a limit**, and **At a set time**. These cards aren't `register`ed; picking one calls `RuleForm`'s `changeWhen`. The fields below follow the choice: a schedule gets a cron field (WIB time) and three ready-to-click examples (**Every day 06:00**, …); rising or falling gets **Measured device**, **Measured quantity**, two limit fields (falling: **Turns on below** and **Ends when it rises above**), and **Must last for**.

All four limit fields are drawn by one helper, `limitField()`: a number may have decimals, read with `valueAsNumber`. The end of its label shows the small key name (`on_below`), so the hysteresis message, which uses key names, is easy to match. The "last for" field must be a whole number. For light, the label writes `0-4095, no thousands separator`, because `1.000` is read as 1 ([🚨](#-troubleshooting) *A number in the form is read differently …*).

**Step 2 — `ThenSection.tsx` (new, [**Copy raw file**](code/stages/practice-8/frontend/src/components/ThenSection.tsx)).** The **Then what happens?** group holds the cards **Turn on while the rule is on** (lamp or fan) and **Send one command, once**. For a schedule, the first card is disabled with the reason `Not for schedules: a schedule has no end time.` (Concept 9). Below them come **Acting device** and the action's content; for a one-time command, **The command** (**Pump (water)**, **Lamp**, **Fan**, **Curtain**) changes the value field, for example **Watering time (seconds, 1-10)**. Last, two checkboxes: the Telegram notification and **Active (untick to pause without deleting)**, which is used in 8.4.

Both parts get `register` through `useFormContext<Rule>()` and the error messages through `useFieldErrors()`, so their props are only the current content and the functions that change it.

**Step 3 — `ConfirmDelete.tsx` (new).** The **Delete rule** button with its "are you sure?" box. Type (or **Copy raw file** from [its stage version](code/stages/practice-8/frontend/src/components/ConfirmDelete.tsx)):

```tsx
// ConfirmDelete.tsx - the "Delete rule" button with its "are you sure?" box in the edit-rule form (Module 24). This box is
// part of the page, not the browser's confirm() window: its Cancel button gets the focus at once, and after Cancel the focus
// returns to the Delete rule button, so keyboard users aren't thrown back to the top of the page.
import { useRef, useState } from "react";

type Props = {
  name: string; // the rule's name, for the question sentence
  deleting: boolean; // true while DELETE /rules/:id is running
  onDelete: () => void; // called by the "Yes, delete" button
};

export default function ConfirmDelete({ name, deleting, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false); // the "are you sure?" box is showing
  const deleteButton = useRef<HTMLButtonElement>(null); // ref = a handle on the button in the page, to move the focus

  function cancel() {
    setConfirming(false);
    deleteButton.current?.focus(); // the Delete rule button is still in the page, so the focus can go straight back to it
  }

  return (
    <>
      <button
        ref={deleteButton}
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-11 rounded-lg border border-red-600 px-4 font-medium text-red-700 hover:bg-red-50 sm:ml-auto dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950"
      >
        Delete rule
      </button>
      {confirming ? (
        // role="alertdialog" + aria-labelledby/aria-describedby: screen readers read the question out as soon as the focus
        // moves to the Cancel button. basis-full = this box drops to a row of its own, under the form's buttons.
        <div
          role="alertdialog"
          aria-labelledby="delete-title"
          aria-describedby="delete-body"
          className="basis-full rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p id="delete-title" className="font-medium">
            Delete rule "{name}"?
          </p>
          <p id="delete-body" className="mt-1">
            Its command and event history stays saved. If you only want to pause it, untick Active and
            save.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="min-h-11 rounded-lg bg-red-700 px-4 font-medium text-white hover:bg-red-800 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              autoFocus
              onClick={cancel}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
```

- The box is part of the page, not the browser's `confirm()` window, so it can get `role="alertdialog"`: a screen reader reads the question (`aria-labelledby`) and its explanation (`aria-describedby`) out.
- `autoFocus` on **Cancel**: an **Enter** pressed by accident cancels instead of deleting.
- `useRef` holds the **Delete rule** button; after **Cancel**, the focus goes back there, so keyboard users aren't thrown to the top of the page.
- `deleting` turns **Yes, delete** into `Deleting…` and disables it while the `DELETE` runs.

Save all three; the screen is still the same.

#### 8.3 `RuleForm` at `/rules/new`: `useForm` with `zodResolver`, a sentence preview, and the Save button (20 minutes)

**Step 1 — `src/components/RuleForm.tsx` (new, [**Copy raw file**](code/stages/practice-8/frontend/src/components/RuleForm.tsx)).** Its props are `id` (`null` = a new rule through `POST`; a number = edit that rule through `PUT`) and `initial` (the starting content). The core:

```tsx
  const form = useForm({ resolver: zodResolver(Rule, { error: friendlyMessages }), mode: "onTouched", defaultValues: initial });
  const { register, control, handleSubmit, setValue, unregister, setError, clearErrors, formState } = form;
```

`Rule` = the backend's schema copy, `friendlyMessages` = the 8.1 message map, `mode: "onTouched"` = like the Login form (Concept 7). The rest:

- **`useWatch`** watches `condition` and `action`, so the fields shown and the **Preview** box (the `describeRule()` sentence, the same as on the list card) change along.
- **`changeWhen`, `changeAction`, `changeTarget`** replace one whole object with `setValue`, so the fields of an earlier choice aren't sent ([🚨](#-troubleshooting) *`Unrecognized key` …*). A schedule forces the action to a one-time command; `unregister("action.command.value")` keeps `valueAsNumber` from carrying over to the on/off choice.
- **`save`** is called by `handleSubmit` only when the input passes the schema: `createRule()` or `updateRule()`, the toast `Rule "…" saved.`, then `navigate("/rules", { replace: true })` (**Back** doesn't open the saved form again). A `400` answer is split by `parse400()`: messages for the 11 fields that have a place (`SHOWN_FIELDS`) are set with `setError` on their field, with the focus on the first one; the rest go into `root.server` and show above the button: `Refused by the server: …`.
- **`handleDelete`**: `deleteRule()`, the toast `Rule "…" deleted.`, back to `/rules` with `replace`.
- **`<FormProvider>`** shares the form with both parts. The buttons are **Save rule** (`Saving…` while `isSubmitting`), **Cancel**, and `ConfirmDelete` when `id` isn't `null`.

**Step 2 — `src/pages/RuleForm.tsx`.** Practice 3's placeholder sentence (`The new-rule form (built in Practice 8).`) is replaced by a real wrapper: replace everything in it with [stage 8](code/stages/practice-8/frontend/src/pages/RuleForm.tsx). This page waits for the device list from the store (`Loading devices…`); for a numbered address, it looks the number up in `GET /rules` (`Rule … not found.` if it isn't there). Its last part (`…` = skipped):

```tsx
  else if (ruleId === null) content = <RuleForm id={null} initial={defaultRule(devices)} />;
  …
  // the form is mounted AFTER its rule has arrived, so its starting content is right at once (no follow-up reset() needed).
  // key = the rule number: another rule means a new form with fresh input.
  else content = <RuleForm key={rule.id} id={rule.id} initial={toFormValues(rule)} />;
```

This page is already ready for `/rules/:id`; its route is added in 8.4.

**Step 3 — the `+ New rule` button.** Replace everything in `src/pages/Rules.tsx` with [stage 8](code/stages/practice-8/frontend/src/pages/Rules.tsx): next to the heading there's now a `<Link to="/rules/new">` **+ New rule**, drawn only when `useAdmin()` is `true` (Practice 3).

**Step 4 — try it.** Save all the files. On the laptop path, first type `soil 40` in the `tools` terminal, so the rule you'll save doesn't water right away. In **Edge** (admin), open **Rules** → **+ New rule** and the **Network** tab (**F12**).

1. **Result (example):** the heading `New rule`, the **When a number RISES above a limit** card selected, and the preview of the default fan rule, in the author's lab `If the temperature on Node 1 living room is above 30 °C for 60 seconds, turn on the fan. …`
2. Make mistakes on purpose: click **Rule name**, press **Tab**; choose **When a number FALLS below a limit** (its limits become soil 30, 35, 10); empty **Turns on below**; type `2.5` in **Must last for**; choose **Send one command, once** (Pump, 5 seconds), then change its time to `11`. Click **Save rule**.

   **Result:** no new `rules` row in the **Network** tab, the focus moves to **Rule name**, and four red-edged boxes with the messages `Required`, `Enter a number`, `Enter a whole number (no decimals)`, and `At most 10`.
3. Correct them: the name `Water if soil < 30 %`, the limit `30`, the duration `10`, the time `5`. Then type `25` in **Ends when it rises above** and leave the field: `off_above must be greater than on_below (hysteresis)`, the same sentence as the server's `400`. Not shown yet? Click **Save rule** (Concept 8). Put `35` back.
4. *(Optional, the second guard.)* Choose **At a set time**, type `61 * * * *`, **Save rule**: the browser lets it through, the backend answers `400`, and `invalid cron expression` shows under the schedule field (the author's test). Choose **When a number FALLS below a limit** again (back to 30, 35, 10).
5. Pick **Practice living room** in both device fields (device path: **Node 1 living room**); leave **soil moisture** and **Active** as they are.

   **Result:** the preview `If the soil moisture on Practice living room is below 30 % for 10 seconds, water for 5 seconds (once). The rule is ready again after the soil moisture rises above 35 %.`
6. Click **Save rule**.

   **Result (the author's lab):** `POST /rules` → `201`, back to `/rules` with the toast `Rule "Water if soil < 30 %" saved.`, and a new card with the `Active` badge. What it sent (the `rules` row with status `201`, the **Payload** tab) only holds the keys of the last choices, with numbers as numbers, not text:

   ```text
   {"name":"Water if soil < 30 %","active":true,"condition":{"kind":"below-threshold","device_id":"f00d00000001","quantity":"soil","on_below":30,"off_above":35,"for_seconds":10},"action":{"kind":"command","device_id":"f00d00000001","command":{"target":"pump","value":5},"notify":false}}
   ```

   Does `Refused by the server: condition.kind: Invalid discriminator value. Expected 'threshold' | 'schedule'` show above the button? Your backend is still 1.0 ([🚨](#-troubleshooting) *`Refused by the server: condition.kind …`*).

![Real screenshots of the /rules/new form, laptop 1280 pixels, Google Chrome 156, the form card cropped, admin account; colors from the final code, before Practice 9 the teal button, gray text, and field focus line are slightly lighter. Left, right inputs: Rule name Water if soil is below 30 % (number 1); When does this rule turn on? with When a number FALLS below a limit selected (number 2) between When a number RISES above a limit and At a set time; Measured device Practice living room, Measured quantity soil moisture; Turns on below on_below 30, Ends when it rises above off_above 35, Must last for for_seconds 10 (number 3); Then what happens? with Send one command, once selected, Acting device Practice living room, The command Pump (water), Watering time 5 (number 4); Telegram unticked, Active ticked; Preview: If the soil moisture on Practice living room is below 30 % for 10 seconds, water for 5 seconds (once). The rule is ready again after the soil moisture rises above 35 %. (number 5); the buttons Save rule and Cancel. Right, wrong inputs after Save rule was clicked, red-edged boxes with the message under them: Required on the now focused name (number 6), Enter a number on the empty limit (number 7), Enter a whole number (no decimals) on for_seconds 2.5 (number 8), At most 10 on a watering time of 11 (number 9); the preview writes … and 2.5 seconds. Bottom right, the hysteresis crop: on 30, off 25, the message off_above must be greater than on_below (hysteresis) (number 10). Legend: no POST while an input is wrong; the hysteresis message appears once the other number fields are right.](assets/watering-rule-form.png)

#### 8.4 Edit, deactivate, and delete: the Edit button and the `/rules/:id` route (10 minutes)

**Step 1 — the route.** In `src/App.tsx`, add the `/rules/:id` line inside the second guard (the only change to this file):

```tsx
          {/* the second guard: screens that change something are for admins only */}
          <Route element={<AdminOnly />}>
            <Route path="/rules/new" element={<RuleFormPage />} />
            <Route path="/rules/:id" element={<RuleFormPage />} />
          </Route>
```

One page serves both; `useParams()` gives an `id` only at `/rules/:id`. Inside `AdminOnly`, this address is closed to the viewer, and the backend's guard still refuses a viewer's `PUT`/`DELETE` with `403` (6.4).

**Step 2 — the Edit link.** Replace everything in `src/components/RuleList.tsx` with [stage 8](code/stages/practice-8/frontend/src/components/RuleList.tsx): every card gets an **Edit** `<Link>` to `/rules/<number>`, only for the admin, with the `aria-label` `Edit rule <name>` so a screen reader doesn't hear "Edit, Edit, Edit". Deactivating and deleting are inside the edit form, so the list stays simple.

**Step 3 — try it.** Save. Put Chrome (viewer, the **Rules** screen) next to Edge (admin).

1. **Edit.** In Edge, click **Edit** on the `Water if soil < 30 %` card: its form is filled in, with the heading `Edit rule <number>` (lab: `Edit rule 4`; yours for example 6). Change **Watering time** to `8`, then **Save rule**.

   **Result (example):** `PUT /rules/4` → `200`, the toast `Rule "Water if soil < 30 %" saved.`, and the card says `… water for 8 seconds (once). …`. In Chrome the same card changes without **F5** and without a toast (lab: 22 ms; an example, not a promise).
2. **Deactivate.** **Edit** again, untick **Active**, then **Save rule**. **Result:** the same toast, and the `Inactive` badge in both browsers.
3. **Delete.** **Edit** again → **Delete rule** (the button with the red outline). **Result:** a box inside the page, with the focus on **Cancel**:

   ```text
   Delete rule "Water if soil < 30 %"?
   Its command and event history stays saved. If you only want to pause it, untick Active and save.
   ```

   Press **Enter**: the box closes, and the focus returns to **Delete rule**. Click **Delete rule** again, then **Yes, delete**. **Result:** `DELETE /rules/4` → `200`, the toast `Rule "Water if soil < 30 %" deleted.`, the card disappears in both browsers, and **Back** in Edge stays on the list, not the deleted rule's form.
4. **Viewer.** In Chrome there's neither **+ New rule** nor **Edit**. Type `http://localhost:5173/rules/1`: `Admin only`.

The watering rule is deleted on purpose: in 8.5 you create it again from a new form.

#### 8.5 ⭐ Automatic watering from the form: `soil 25`, the pump waters, then it's ready again (15 minutes)

This is your own version of L3: the watering rule is created from a new form without opening the 8.3 steps, like the tester's task in [10.3](#103--the-user-test-on-the-testers-phone-four-tasks-without-help-25-minutes).

1. In the `tools` terminal, make sure the soil is wet (`soil 40`) and the tank has enough water (`tank random`, 6.5).
2. In Edge: **Rules** → **+ New rule**. Fill it in only from this sentence: *water for 5 seconds if the soil moisture of Practice living room is below 30% for 10 seconds, ready again above 35%*. Check the preview, then **Save rule**: a card with the `Active` badge appears.
3. Leave the **Rules** screen open, type `soil 25` in the `tools` terminal, then wait.

**Result (example, the author's lab; rule number 5):** ±15 seconds later (14–19 seconds in the lab) the toast `🌱 Soil 25 % — pump watering for 5 seconds automatically` appears. The simulator terminal:

```text
soil 25
Soil: 25 %
f00d00000001: command c-20261025-055634-5 -> ok=true
```

Backend log (trimmed):

```text
[12:56:24] INFO: rule 5 (Water if soil < 30 %): soil 25 below 30; pump watering for 5 seconds if it lasts 10 seconds
[12:56:34] INFO: command c-20261025-055634-5 (rule) to f00d00000001: pump = 5, ack ok=true in 4 ms
```

Why ±15 seconds? A typed number only goes along with the simulator's next message (at most 10 seconds), then the soil has to stay below 30 for 10 seconds. The pump waters **once**: the soil stays at 25%, but there's no second 🌱 (Concept 9). The messages after it carry `"pump":true`, then `false` again as soon as the 5 seconds are over.

![Real screenshots of the /rules page, admin account, Google Chrome 156: left laptop 1280 pixels (whole page, left side cropped), right DevTools device mode 375 pixels (not a real phone); simulator f00d00000001 got soil 25 about 14 seconds before; colors from the final code, before Practice 9 the teal and gray text are slightly lighter. Laptop: Automation rules, the + New rule button (number 1), the line The backend runs the rules, even while this dashboard is closed. Four rule cards in sentences: Automatic fan, Active, If the temperature on Node 1 living room is above 30 °C for 120 seconds, turn on the fan. The fan turns off again after the temperature falls below 28 °C. Notify via Telegram. (number 2); Morning watering, Active, Every day at 06:00 WIB, water for 10 seconds on Node 1 living room, Runs again: Tue 27 Oct, 06:00 WIB (number 3); Schedule test, Inactive (number 4), Every day at 07:04 WIB, water for 2 seconds on Practice living room; Water if soil is below 30 %, Active, If the soil moisture on Practice living room is below 30 % for 10 seconds, water for 5 seconds (once). The rule is ready again after the soil moisture rises above 35 %. (number 5); each card with an Edit button (number 6). Top right, outside the content column: the toast 🌱 Soil 25 % — pump watering for 5 seconds automatically (number 7). Phone: the same list; the same toast at the bottom of the screen, covering the lower edge of a card (number 8). Legend: + New rule and Edit are admin only; the sentences come from describeRule in the browser; Runs again from the backend next_run field in WIB; badges always carry a word; what a phone toast covers can be scrolled a little, or the toast closed.](assets/rules-and-toast.png)

4. Type `soil 40`. **Result:** with the next message (±5 seconds in the lab), `✅ Soil up to 40 % — rule ready again` appears. Both toasts are neutral, because `data.ok` isn't `false`. Type `soil 25` once more: 🌱 appears again ±15 seconds later, proof that "ready again" works. Finish with `soil 40`.

**Device path.** The same rule, with **Node 1 living room** in both device fields; the water tank has water, and Node 1's local threshold is already 20% (6.5) so the server rule acts first ([🚨](#-troubleshooting) *Node 1 waters twice …*). Potting soil can't be typed, so the test waits for the soil to really dry out; this path hasn't been tested by the author on a real board. The ⭐ step may be passed with the simulator.

**You pass this ⭐ step** when the rule from the new form waters exactly once after `soil 25` (the 🌱 toast and `-> ok=true` in the simulator terminal), `soil 40` brings up ✅, and the next `soil 25` waters again. No 🌱? See [🚨](#-troubleshooting) *The watering rule doesn't water again …* (for example the tank is still at 15). You may leave the rule; [10.2](#102-prepare-the-test-the-tester-account-the-starting-state-and-phone-mode-10-minutes) deletes it before the test.

In the free terminal (the `frontend` folder), save to the branch:

```text
git add src
git commit -m "Rule form: create, edit, deactivate, delete (Module 24 Practice 8)"
```

> ⬆️ **Done with Practice 8?** Read [Concept 11](#11-used-by-someone-else-basic-accessibility-the-home-screen-and-a-user-test), then [Practice 9](#practice-9--accessibility-the-phone-and-the-home-screen-40-minutes): the dashboard is measured and tidied up so it's pleasant for someone else to use, from a phone too.

### Practice 9 — Accessibility, the phone, and the home screen (40 minutes)

> 🖥️ **Tools used:** **VS Code** with the terminals `backend` (`npm run dev`), `frontend` (Vite), and one free terminal in the `frontend` folder for `ipconfig`, curl, and Git (laptop path: the broker and the simulator keep running); **Docker Desktop** (`smarthome-db`); **Chrome or Edge** with DevTools (**Lighthouse**, **Elements** → **Styles**, device mode); and a **phone** on the same home Wi-Fi. Concepts used: 11.

Before someone else uses your dashboard in Practice 10, check three things from [Concept 11](#11-used-by-someone-else-basic-accessibility-the-home-screen-and-a-user-test): the text has enough contrast, everything can be used with a keyboard and a thumb, and the admin can use it from a phone, complete with a shortcut icon. Only color and focus classes, `<main>`, an icon, and `index.html` change. The code at the end of this practice: [`code/stages/practice-9/frontend/`](code/stages/practice-9/frontend/).

#### 9.1 Lighthouse and the Color Picker: measure the contrast, then fix the colors (15 minutes)

Measure first, then fix: the stage 8 code deliberately still uses the old colors.

**Step 1 — Lighthouse.**

1. Click **Log out**, then open `http://localhost:5173/login`. Open DevTools (**F12**) and pick the **Lighthouse** tab (not visible? click **»** in the row of tabs). Three red `Failed to load resource: … 401 (Unauthorized)` lines in the **Console** are expected before logging in.
2. Pick **Mode** `Navigation`, **Device** `Mobile`, tick only **Accessibility** under **Categories**, then click **Analyze page load**.

   **Expected output (example, the stage 8 code):** an **Accessibility** score of `88` with two failed audits:

   ```text
   Background and foreground colors do not have a sufficient contrast ratio.
   Fix any of the following:   Element has insufficient color contrast of 3.66 (foreground color: #ffffff, background color: #009689, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1
   Document does not have a main landmark.
   ```

   The first = the **Log in** button, white on `teal-600`, below 4.5 : 1; the second = the Login screen without `<main>`, the "main content" landmark that screen readers jump to. The score depends on the screen content and the tool version (another lab of the author: 93 for the same finding), so the failing audit is the reference.
3. Log in as admin, then repeat it on the `f00d00000001` Details and on `/rules/new`.

   **Result (example):** both `96`, only because of contrast. Three kinds of findings, each with its fix rule:

   | Ratio in the report | Colors | Example elements | Fix rule |
   | :-- | :-- | :-- | :-- |
   | 3.66 : 1 | white on `teal-600` (light and dark) | **Log in**, **Save rule**, a **Lamp** that is on, a pressed chart picker | 1. white text on teal → `teal-700` |
   | 4.34 : 1 | `text-slate-500` on the `slate-100` page background (light) | `living room · f00d00000001`, `last seen …` | 2. dim text on a light gray background → `slate-600` |
   | 2.63 : 1 | `text-slate-400` on white (light) | `(admin)` in the header, the unit `°C` | 3. `slate-400` only for dark mode |

**Step 2 — the Color Picker for one button.** Click **Log out** again. In DevTools, click the arrow icon **Select an element in the page to inspect it** (**Ctrl + Shift + C**), then click the **Log in** button: the **Elements** tab opens with the button selected. In the **Styles** panel, find the `.text-white` rule, click the small color box in front of `var(--color-white)`, then in the Color Picker click the `Contrast ratio` row to open its details.

**Result:** `Contrast ratio 3.65`, with `AA: 4.5` and `AAA: 7.0` marked as not passed. The Color Picker calculates from Tailwind 4's real colors (`oklch`), Lighthouse from the hex `#009689`; the rounding differs, the conclusion is the same.

**Step 3 — fix one button by hand.** In `src/pages/Login.tsx`, on the `type="submit"` button, change `bg-teal-600` to `bg-teal-700` and `hover:bg-teal-700` to `hover:bg-teal-800`:

```tsx
          className="mt-5 min-h-11 w-full rounded-lg bg-teal-700 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
```

Save, select the **Log in** button again, and open its Color Picker.

**Result:** `Contrast ratio 5.38`, `AA: 4.5` passed. `AAA: 7.0` still doesn't pass; this module aims for AA.

**Step 4 — the rest, then measure again.** The other changes are mechanical: every changed line follows one of the three rules in the table, plus `<main>` on the Login screen. From the [`code/stages/practice-9/frontend/src/`](code/stages/practice-9/frontend/src/) folder on GitHub, replace everything in these 16 files (**Copy raw file**):

- `pages/`: `Login.tsx`, `Rules.tsx`, `Details.tsx`, `RuleForm.tsx`, `History.tsx`;
- `components/`: `SwitchButton.tsx`, `Picker.tsx`, `RuleForm.tsx`, `DeviceHistory.tsx`, `DeviceDetails.tsx`, `DeviceList.tsx`, `Layout.tsx`, `SensorCard.tsx`, `Gauge.tsx`, `Badge.tsx`, `RequireLogin.tsx`.

`RuleForm.tsx` is in both folders; don't mix them up. The stage 9 `Login.tsx` already holds your button from above, `<main>`, and the field focus line from 9.2. Then measure all six screens: `/login`, `/devices`, Details, History, `/rules`, and `/rules/new`.

**Result (example):** `100` on all six screens; both audits from before move to **Passed audits**.

![Real screenshots. Top: the Lighthouse 13.5.0 HTML report, Accessibility category, for the /login screen, light, opened in Google Chrome 156. Left, before (the Practice 8 stage): the score 88 in orange (number 1); under CONTRAST the failed audit Background and foreground colors do not have a sufficient contrast ratio., the Failing Elements table pointing at the Log in button with the class bg-teal-600 (number 2); under BEST PRACTICES the failed audit Document does not have a main landmark. (number 3). Right, after (final code) with Passed audits (12) opened: the score 100 in green (number 4); in the passed list Background and foreground colors have a sufficient contrast ratio and Document has a main landmark. (number 5). Bottom: the real DevTools Color Picker of Google Chrome 156, the Styles panel rule .text-white, color: var(--color-white), with the small color box that was clicked (number 6). Left, the Log in button bg-teal-600: Contrast ratio 3.65, AA: 4.5 and AAA: 7.0 marked as not passed (number 7). Right, bg-teal-700: Contrast ratio 5.38, AA: 4.5 marked as passed, AAA: 7.0 not passed (number 8). Note: DevTools writes 3.65 and 5.38, axe in Lighthouse writes 3.66. Legend: the final code uses bg-teal-700 and a main wrapper; AAA 7.0 is not the goal.](assets/accessibility-lighthouse.png)

**Dark theme.** The dashboard follows the laptop's theme, so Lighthouse measures the theme in use. Switch your laptop's theme to dark (Windows 11: **Settings** → **Personalization** → **Colors**), measure again, then switch it back. Before the fix, the dark theme's contrast only fails on rule 1; after it, it's `100` too. The author used Lighthouse 13.5.0 from the command line (the same engine as the **Lighthouse** tab) in Chrome 156.

#### 9.2 Keyboard and thumb: the Tab order, focus rings, and 44 px targets (10 minutes)

**Step 1 — the input fields' focus ring.** In stage 8, the field being typed in only has a `teal-500` edge (2.42 : 1 against white, below the 3 : 1 limit) with an almost invisible `teal-200` ring. In `src/fields.tsx`, change the content of `BOX` to:

```tsx
export const BOX =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-teal-400 dark:focus:outline-teal-400 dark:aria-[invalid=true]:border-red-400";
```

`focus:outline-2 focus:outline-offset-2 focus:outline-teal-700` = a 2 px outline in `teal-700`, 2 px away from the box's edge; `dark:focus:…teal-400` for the dark theme. `Login.tsx` from 9.1 already uses the same focus line. The whole file: [`code/stages/practice-9/frontend/src/fields.tsx`](code/stages/practice-9/frontend/src/fields.tsx) (**Copy raw file**).

**Result (the author's lab calculation from the hex colors):** the focus line is 5.36 : 1 in the light theme, 7.84 : 1 in the dark theme.

**Step 2 — the keyboard path.** Put the mouse away. From `/login`: **Tab** to Email and Password, type, **Enter**. In the List, **Tab** to a device card, **Enter**. In Details, **Tab** to **Lamp**, press **Space** twice. **Shift + Tab** to the **Rules** menu, **Enter**; **Tab** to **Edit** on one of the rules, **Enter**; **Tab** through every field up to **Save rule**, **Enter**. The "When?" and "Then?" options are one **Tab** stop per group; switch the option with the arrow keys.

**Result (the author's test, 1280 px):** the whole path is done without a mouse. Every stop has a ring (input boxes with a teal line, buttons and links with the browser's default dark ring); the order is the header first (**Devices**, **Rules**, **Log out**), then the content. The first **Space**: `Lamp On`, the second: `Lamp Off`; the focus stays on the button. With a slow mock device, the focus also stays during `Waiting for device confirmation…` (`aria-disabled`, not `disabled`), and **Space** while waiting is ignored (one `POST`). **Save rule** takes you to `/rules` with the toast `Rule "…" saved.` Expected: after a screen change (a link, **Save**) or a toast's ✕, the focus falls to the page (React Router doesn't move it), and the chart and the two Recharts gauges add three stops on Details.

**Step 3 — 44 px targets.** Turn on device mode (**Ctrl + Shift + M**) at 375 px wide, open Details, then point the arrow icon (**Ctrl + Shift + C**) at **Lamp**, a pump button, and a toast's ✕ if there is one: its info box writes width × height. For the round options and checkboxes in the rule form, measure their labels, because the label is what gets tapped.

**Result (measured by the author at 375 and 1280 px):** no target under 44 px. At 375 px: **Lamp** 139.5 × 44, the pump buttons 100.3 × 44, ✕ (**Close message**) 44 × 44, the round options 20 × 20 with labels of 309 × 66–86. Lighthouse's `target-size` audit passes too.

#### 9.3 Phone mode for the admin account and a home-screen shortcut (15 minutes)

**Step 1 — the shortcut's icon and name.** Open [`code/stages/practice-9/frontend/public/apple-touch-icon.png`](code/stages/practice-9/frontend/public/apple-touch-icon.png) on GitHub, click **Download raw file**, and save it in the `frontend/public` folder under that name (an outline house with a teal door, 180 × 180 px, drawn by the author). In `frontend/index.html`, right below the `<link rel="icon" …>` line, add:

```html
    <!-- Module 24: an icon (180 x 180 px) and a short name for the "Add to Home Screen" shortcut on an iPhone. Only a shortcut,
         not an installed app (a PWA needs HTTPS: Module 27). -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="Smart Home" />
```

`apple-touch-icon` = the icon image; `apple-mobile-web-app-title` = the name under it (without this tag: the `<title>` content). The content of `public` is served at the root of the address: `http://localhost:5173/apple-touch-icon.png` shows the house.

**Step 2 — Module 23's phone mode.** Repeat Module 23's [9.2](../module-23-realtime-dashboard/README.md#92-the-backend-in-phone-mode-host-and-cors_origin-10-minutes) and [9.3](../module-23-realtime-dashboard/README.md#93-vite-in-phone-mode-npm-run-devphone-and-the-private-firewall-setting-10-minutes): check your IP with `ipconfig` (it can change), set `HOST=0.0.0.0` and `CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173` (your IP) in `backend/.env`, save, then in the Vite terminal **Ctrl + C** and `npm run dev:phone`. The backend restarts by itself when `.env` is saved; wait for the line `Server listening at http://192.168.1.10:8080`, and in the Vite terminal use the `Network:` line ending in `Wi-Fi`.

**Step 3 — admin from the phone.** In the phone's browser, open `http://192.168.1.10:5173`, log in as **admin** (the password goes over plain `http://`: only on a home Wi-Fi you trust), open Details, then tap **Lamp**.

**Result (example, the author's machine opening its own IP, not a phone):** the **Live** badge, and in the `backend` terminal:

```text
[13:12:40] INFO: login: account 1 (admin), session 28, IP 192.168.1.10
…
[13:12:42] INFO: OPTIONS /devices/f00d00000001/command -> 204 (1 ms)
[13:12:42] INFO: command c-20261025-061242-2 (api) to f00d00000001: lamp = true, ack ok=true in 10 ms
[13:12:42] INFO: POST /devices/f00d00000001/command -> 200 (14 ms)
```

In Module 23, the phone only did `GET`; now `POST`, `PUT`, and `DELETE` too. The browser asks first with an `OPTIONS` preflight (`204`), then the guard matches the `Origin` header (`http://192.168.1.10:5173`) against `CORS_ORIGIN`. From your phone, the `IP` in the `login:` line is the phone's IP: proof of your part of L1.

**Step 4 — a negative test.** In the free terminal, pretend to be a page that isn't in `CORS_ORIGIN` (macOS: `curl`):

```text
curl.exe -s -X POST http://localhost:8080/devices/f00d00000001/command -H "Origin: http://192.0.2.7:5173"
```

**Result** (the author sent the same `Origin` from a Node script): `{"message":"request from the page http://192.0.2.7:5173 refused"}`, and the backend writes `WARN: refused (403): POST /devices/f00d00000001/command from the page http://192.0.2.7:5173`. The guard refuses before checking the login. Is your own phone refused like this? See [🚨](#-troubleshooting) *`403 request from the page …`*.

**Step 5 — a shortcut on the home screen.** Log in on the phone first, then:

- **Android, Chrome:** ⋮ → **Install and create shortcut** → **Create shortcut** → **Add**. This shortcut with the Chrome logo opens in Chrome. Not **Install**: installing an app needs HTTPS (Module 27).
- **iPhone, Safari:** **Share** → **Add to Home Screen**, then follow the screen. Since iOS 26, the icon opens as a web app by default; you may have to log in again inside it.

> [!IMPORTANT]
> **The shortcut hasn't been tested by the author on a real phone.** The Android labels come from Google's official help; the iPhone steps haven't been confirmed from Apple's guide. Neither has been tried for `http://` on a home Wi-Fi. A shortcut only stores `http://192.168.1.10:5173`: if the laptop's IP changes or laptop mode is switched back, it fails to open ([🚨](#-troubleshooting) *The home-screen shortcut on the phone …*).

Phone mode stays on for Practice 10. In the free terminal (the `frontend` folder), save to the branch:

```text
git add index.html public src
git commit -m "Contrast, focus, and the home-screen icon (Module 24 Practice 9)"
```

> ⬆️ **Done with Practice 9?** Practice 10 starts on the laptop (10.1), then uses phone mode again for the tester (10.2) and switches back to laptop mode in [10.5](#105-the-viewer-account-on-the-same-phone-then-delete-the-tester-account-and-switch-back-to-laptop-mode-10-minutes). If you stop before [Practice 10](#practice-10--the-pass-test-used-by-someone-else-on-a-phone-70-minutes), switch back to laptop mode now (how: 10.5) and turn phone mode on again ([9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes)) when you continue.

### Practice 10 — The pass test: used by someone else on a phone (70 minutes)

> 🖥️ **Tools used:** **VS Code** with the `backend` terminal (`npm run dev`; phone mode in 10.2–10.5), the Vite terminal in `frontend` (build, `preview`, then `npm run dev` again), and a free terminal for the accounts and Git; on the laptop path also the broker and the simulator; **Docker Desktop** (`smarthome-db`); **Chrome or Edge** at `http://localhost:5173`; **the tester's phone** on the same home Wi-Fi, **one tester** (±25 minutes), a paper card, a clock, and the sheets in [`code/user-test/`](code/user-test/). Concepts used: all of them, especially 11.
>
> ⭐ **Required** — step 10.3: someone else, on their own phone and without help, logs in, turns on the lamp, and creates the "below 30%" watering rule (L1–L3); L4 is repeated in 10.5.

The last practice adds no features: the dashboard is checked and numbered 1.0.0 (10.1), tried by someone else (10.2–10.4), and then you close it with the viewer account and a cleanup (10.5). The order of 10.2–10.5 is the same as the user test picture in [Concept 11](#11-used-by-someone-else-basic-accessibility-the-home-screen-and-a-user-test).

#### 10.1 Dashboard 1.0.0: lint, build, `check-schema`, and the version number (15 minutes)

The tester should meet a dashboard that has passed its checks. In the Vite terminal, stop Vite (**Ctrl + C**; port 5173 will be used by the dish later), then run `npm run lint`.

**Expected output (example):**

```text
> mini-smart-home-frontend@0.2.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 89ms on 46 files with 116 rules using 8 threads.
```

**Clean** means `0 warnings and 0 errors`; the duration and the number of threads follow your laptop. Any findings? Compare your files with [`code/stages/practice-10/frontend/`](code/stages/practice-10/frontend/). Then cook the dish with `npm run build`.

**Expected output (example):**

```text
> mini-smart-home-frontend@0.2.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
✓ 1140 modules transformed.
computing gzip size...
dist/index.html                   1.18 kB │ gzip:   0.65 kB
dist/assets/index-DuyG4OCj.css   23.24 kB │ gzip:   5.44 kB
dist/assets/index-C2-B42Ot.js   881.98 kB │ gzip: 263.23 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 958ms
```

The `(!)` block is the same **warning** as in Module 23. The bundle is now 881.98 kB (v0.2: ±680 kB), and its biggest jump is in the Practice 1–2 stages, when React Router, react-hook-form, and Zod come in. The yardstick stays the same: **the build passes with one size warning** (the Module 23 template item in [➕ D](#d-add-the-module-24-items-to-the-pull-request-template)). Don't raise `chunkSizeWarningLimit`; how to split the bundle is in [🔬](#-technical-deep-dive-optional) *`React.lazy` per route*.

Then, in the same terminal:

1. `npm run check-schema` → two `SAME` lines, as in [7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes).
2. `npm pkg set version=1.0.0` (it prints nothing), then `npm install` so `package-lock.json` changes too.

   **Expected output (example):**

   ```text
   up to date, audited 106 packages in 2s

   18 packages are looking for funding
     run `npm fund` for details

   found 0 vulnerabilities
   ```

3. `npm run lint` and `npm run build` once more: the header is now `> mini-smart-home-frontend@1.0.0 …`, the rest is the same, file names included, because the version isn't cooked into the dish.
4. Serve the dish to the home Wi-Fi with `npm run preview -- --host` (the `--` passes `--host` on to `vite preview`).

   **Expected output (example):**

   ```text
   > mini-smart-home-frontend@1.0.0 preview
   > vite preview --host

     ➜  Local:   http://localhost:5173/
     ➜  Network: http://172.30.x.x:5173/  vEthernet (WSL (Hyp…
     ➜  Network: http://192.168.x.x:5173/  Ethernet 3
     ➜  Network: http://192.168.x.x:5173/  Ethernet 4
     ➜  Network: http://192.168.1.10:5173/  Wi-Fi
     ➜  press h + enter to show help
   ```

   No `VITE … ready in …` line, unlike `npm run dev`. Use the line ending in **Wi-Fi** (your laptop may have only one `Network` line; your IP will differ). On the laptop, open `http://localhost:5173`, log in as admin, and make sure the **Live** badge is on. Leave this dish running: this is the 1.0.0 dashboard the tester opens.

#### 10.2 Prepare the test: the tester account, the starting state, and phone mode (10 minutes)

Open [`task-sheet.md`](code/user-test/task-sheet.md); part A is your preparation list.

1. **The tester account.** In the free terminal, go to the `backend` folder (`cd ../backend`; PowerShell/macOS Terminal, not Git Bash, because the password is asked in the terminal), then run `npm run users -- add tester@home.test "Tester" admin`. Type its new password (at least 15 characters) twice.

   **Expected output:**

   ```text
   > mini-smart-home-backend@1.1.0 users
   > node --env-file=.env src/db/manage-users.ts add tester@home.test Tester admin

   New password: **************************************
   Type it again: **************************************
   account 3 created: tester@home.test (Tester, admin)
   ```

   The number of stars = the length of your password, and the account number may differ. Write the email and the password only on a **paper card**, not in a file, a chat, or a photo.
2. **The starting state.** On the laptop (admin), make sure the **Lamp** is `Off`, and delete Practice 8's practice watering rule (**Edit** → **Delete rule** → **Yes, delete**): the tester has to create it themselves. Laptop path: type `tank random` and `soil 45` in the simulator terminal. The task sheet says `soil random`, but a random number of 20–60% can trigger the tester's rule before its time.
3. **Phone mode.** If phone mode from [9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes) has been turned off, change `backend/.env` again: `HOST=0.0.0.0` and `http://<laptop-IP>:5173` in `CORS_ORIGIN`. The backend restarts by itself (no **Ctrl + C**); wait for the line `Server listening at http://192.168.1.10:8080` with your IP. The 10.1 dish keeps running. (The task sheet mentions `npm run dev:phone`, which works too; the 1.0.0 dish is the better one to test.)
4. Ask the tester to open `http://<laptop-IP>:8080/health` on their phone: the answer is JSON starting with `{"ok":true`. Write your IP in part B of the task sheet, then get [`notes-sheet.md`](code/user-test/notes-sheet.md) and a clock ready. Want to record the screen or their voice? Ask for permission; they may say no.

#### 10.3 ⭐ The user test on the tester's phone: four tasks without help (25 minutes)

> [!NOTE]
> The author hasn't run this test with another person on a real phone yet. The author only recorded a rehearsal: the four tasks were done by an **automated script, not a person**, on the 1.0.0 dish in a browser on the author's computer at 375 × 812 pixels. A script never gets confused, so that rehearsal only proves the flow works. No tester or phone yet? Do the tasks yourself with DevTools device mode, and leave L1–L3 empty in the [✅](#-module-24-completion-checklist).

1. Read the opening of part B to the tester, give them the card, then read task 1. The clock starts as soon as you finish reading the task.
2. Watch and listen, then note where they hesitate. You may only read the task again. Stuck for more than 2 minutes, giving up, or asking directly = **helped**.
3. Every task leaves a trace in the `backend` terminal; copy its lines into the notes sheet. The IP in the `login` line must be the tester's phone's, not `127.0.0.1` or your laptop's IP.
4. After task 3, type `soil 25` in the simulator terminal (device path: soil that really is dry). Shortly after (±15 seconds in the lab), the tester's phone shows the toast `🌱 Soil 25 % — pump watering for … seconds automatically`. Type `soil 45` again, then read task 4.

The tester turns the phone sideways, and then a toast covers a button? That's a finding to note, not their mistake ([🚨](#-troubleshooting) *Toasts cover …*).

**Expected output** (the backend log of the author's scripted rehearsal; the script ran on the machine itself, so the IP is `127.0.0.1`):

```text
[13:18:28] INFO: login: account 3 (admin), session 31, IP 127.0.0.1
[13:18:28] INFO: command c-20261025-061828-4 (api) to f00d00000001: lamp = true, ack ok=true in 12 ms
[13:18:35] INFO: Rule 6 (Automatic watering (test)) created through the API: pump f00d00000001 = 5 once when soil f00d00000001 is below 30 for 10 seconds, ready again above 35
[13:18:36] INFO: logout: session 31
```

**You pass this ⭐ step** when the tester (not you), on their own phone over the home Wi-Fi, completes tasks 1–3 with the result **success** (allowed after the 10.4 fixes), the `login` line in the notes sheet holds their phone's IP, and `soil 25` brings up 🌱.

#### 10.4 Fix what was confusing, then repeat the tasks that needed help (10 minutes)

Every task a **success**? Write "none" in the fixes table of the notes sheet, then continue to 10.5. For every task that was **helped** or **failed**:

1. Find the cause in your notes: a label that wasn't understood, a place that wasn't found, or a message that didn't explain the next step. What gets fixed is the dashboard; the task sentences don't change.
2. Change as little as possible in `src`. In the Vite terminal: **Ctrl + C**, `npm run lint`, `npm run build`, then `npm run preview -- --host` again.
3. Ask the tester to reload the page (their phone still holds the old dashboard), then repeat only that task, with the same tester after a break or with another tester; note the result.

Your fixes make `src` differ from `code/frontend/` (expected in ➕ A); mention them in the ➕ E pull request.

#### 10.5 The viewer account on the same phone, then delete the tester account and switch back to laptop mode (10 minutes)

1. **L4.** With the tester's permission, log in on their phone as **viewer** (decline the offer to save the password). In Details, Lamp, Fan, and Pump are only cards, without the **Controls** section; **Rules** has no **+ New rule** and no **Edit**. Then **Log out**. The author's scripted rehearsal (375 px) got the same.
2. **Tidy up the house.** The tester's rule really works: on the laptop, check its sentence in **Rules**, edit or delete it if you don't want it, and turn the lamp off.
3. **Delete the tester account.** In the free terminal (the `backend` folder), run `npm run users -- delete tester@home.test`.

   **Expected output:**

   ```text
   > mini-smart-home-backend@1.1.0 users
   > node --env-file=.env src/db/manage-users.ts delete tester@home.test

   tester@home.test deleted together with all its sessions
   ```

   `npm run users -- list` now names only `admin@home.test` and `viewer@home.test`. Tear up the password card.
4. **Laptop mode.** Put `backend/.env` back:

   ```text
   HOST=127.0.0.1
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
   ```

   The backend restarts by itself and now only writes `Server listening at http://127.0.0.1:8080`. In the Vite terminal: **Ctrl + C**, then `npm run dev`; the line `➜  Network: use --host to expose` shows again. Reload the dashboard on the tester's phone: the page can't be opened anymore, while `http://localhost:5173` on the laptop stays **Live**.
5. **Save to the branch.** In the free terminal, `cd ../frontend`, then:

   ```text
   git add package.json package-lock.json src
   git commit -m "Dashboard v1.0.0: clean lint, build passes, user test (Module 24 Practice 10)"
   ```

   `backend/.env` and `dist/` don't go into Git; the filled-in notes sheet is saved in ➕ F.

> ⬆️ **Done with Practice 10?** Your dashboard 1.0.0 has passed its checks, has been tried by someone else (or honestly noted as "not yet"), and your laptop is safe again. Continue to [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home); the [🧩 Independent Challenges](#-independent-challenges) can be done afterwards, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title most like your problem. Vite, Tailwind, and basic login problems are in the [🚨 of Module 22](../module-22-react-basics/README.md#-troubleshooting); the socket, the store, and basic phone mode in the [🚨 of Module 23](../module-23-realtime-dashboard/README.md#-troubleshooting); the backend, the broker, and the simulator in the 🚨 of Modules 16–21. First glance at the address bar, the `backend` terminal (since Practice 6 its header is `…@1.1.0 dev`), the simulator terminal (`-> ok=true` or `-> ok=false`), the **Console** tab (a red `Failed to load resource: … 403` or `504` line is expected for a refused answer), and the **Network** tab (the code and content of the `command` or `rules` answer). Still stuck? Compare your files with [`code/stages/`](code/stages/) at the end of the same practice (Practice 6: [`code/backend/`](code/backend/)).

Two terminal displays that are **not** errors:

- **The backend log holds `≡ƒî▒ Soil 25 % ΓÇö …`** while the dashboard is right: the Windows console uses an old code page. Stop the backend, type `chcp 65001`, then `npm run dev` again. Proven by the author in Windows PowerShell 5.1; Windows Terminal and the VS Code terminal haven't been tested.
- **`Change detected in '…\\node_modules\\…'` then `Restarting 'src/server.ts'`** without you changing anything: the Windows file watcher reports wrongly, and the backend comes back up by itself. Harmless.

<details>
<summary><b>Old instructions → what's right for our versions (react-router 8.5.0, react-hook-form 7.91.0, @hookform/resolvers 5.9.2, Zod 4.6.7)</b></summary>

| Old instruction | What's right for our versions | Why |
| :--- | :--- | :--- |
| `npm install react-router-dom` | `react-router@8.5.0`, imported from `"react-router"` | v8 removed `react-router-dom` |
| `<Switch>`, `<Route exact component={Detail}>` | `<Routes>`, `<Route path="/devices/:id" element={<DetailsPage />} />` | The v5 way |
| `useHistory()`, `<Redirect>` | `<Link>`/`<NavLink>`; `useNavigate()` after an action; `<Navigate replace>` in a guard | v5 names |
| `createBrowserRouter`, `loader` | `<BrowserRouter>` (declarative mode) | The other modes are in 🔬 |
| `base: './'` | The default `base`, `/` | F5 turns white |
| `ref={register}`, `register("x", { required: true })` | `{...register("name")}`, the rules in the Zod schema | A resolver can't be combined with the built-in checks |
| `@hookform/resolvers` without a version | `@hookform/resolvers@5.9.2` | 6.0.0 → `ERESOLVE` |
| Zod 3: `z.string().email()`, `{ errorMap }` | Zod 4: `z.email()`, `{ error: friendlyMessages }` | TypeScript refuses `errorMap` |
| `z.coerce.number()` in the schema | `{ valueAsNumber: true }` in `register` | The schema copy must be identical |
| Importing `../../backend/src/schemas/rules` | The copies in `src/schemas/` + `npm run check-schema` | node-cron → a white screen |
| A token/role in `localStorage`, `role !== "viewer"` | An `HttpOnly` cookie; `useAdmin()` from `GET /auth/me` | XSS; flickering buttons |
| `setInterval(() => fetch(…), 5000)` | `event` messages, `GET /devices` once after recovering | Polling |
| DevTools **Network request blocking** | **Request conditions** | Renamed in DevTools 144 |

</details>

<details>
<summary><b><code>npm install</code> stops with <code>npm error code ERESOLVE</code> and <code>peerOptional effect@"^4.0.0"</code></b></summary>

**Symptom** (the author's recording, the command without versions; trimmed):

```text
npm error code ERESOLVE
…
npm error Could not resolve dependency:
npm error peerOptional effect@"^4.0.0" from @hookform/resolvers@6.0.0
```

**Cause:** without a version, npm takes `@hookform/resolvers` 6.0.0, whose package requirements clash in npm 11 (issue `react-hook-form/resolvers#882`). **Steps:** repeat the [1.1](#11-the-featurecontrols-roles-branch-and-four-packages-at-their-written-versions-5-minutes) command exactly, with `@hookform/resolvers@5.9.2`. Don't use the `--force` or `--legacy-peer-deps` its message offers.

</details>

<details>
<summary><b>F5 on <code>/devices/…</code> gives a white screen, or another server answers <code>404</code></b></summary>

**White after F5** (usually in the build): `base` in `vite.config.ts` was changed to `./`, so the page asks for `/devices/assets/index-….js` and gets `404`. Remove `base`, then build again. **`404` from another server** (for example `dist/` opened by a plain file server): it looks for a file named `devices/…`. `npm run dev` and `npm run preview` answer every screen address with `index.html` (the SPA fallback, Concept 3); a real server comes in Modules 26–27. **White in `npm run dev` too?** Read the red lines in the **Console**.

</details>

<details>
<summary><b>The Devices menu isn't marked active while Details or History is open</b></summary>

One of these: (1) the list is at `/` with `<NavLink to="/">`, which is only active exactly at `/` (our route map puts the list at `/devices`); (2) `<NavLink to="/devices" end>`: remove `end`; (3) the menu uses `<Link>`: change it to `<NavLink>` ([1.4](#14-link-and-navlink-the-menu-the-back-buttons-and-unknown-addresses-10-minutes)). The active menu item has `aria-current="page"` (the **Elements** tab); in the author's test, **Devices** has it on Details.

</details>

<details>
<summary><b>The live connection drops and reconnects every time you switch screens</b></summary>

**Symptom:** the badge briefly shows `Reconnecting…`, and the backend log writes `realtime client disconnected` then `connected` on every screen change. The author's test: 10 screen changes, 0 new connections. **Cause:** (1) `useRealtime(…)` is called inside a page; call it once in `App.tsx`, above `<Routes>` ([1.2](#12-browserrouter-in-maintsx-and-the-route-map-in-apptsx-10-minutes)). (2) Switching through `<a href>` or `location.href`: the whole page reloads, the same as **F5**. Use `<Link>`/`<NavLink>`.

</details>

<details>
<summary><b><code>npm run build</code> fails with a type error in <code>useForm</code> or <code>zodResolver</code></b></summary>

What the author tried (TypeScript 6.0.3): (1) the Zod 3 style `zodResolver(Rule, { errorMap: … })` is refused; write `{ error: friendlyMessages }` ([8.1](#81-form-ingredients-friendlymessages-and-parse400-in-rulests-and-field-helpers-in-fieldstsx-10-minutes)). (2) A field name from text, `setError(f.field, …)`, can't be checked; write `f.field as FieldPath<Rule>`, as in `save()`. (3) A field name that doesn't exist in any branch is still refused: check its spelling (`condition.on_below`). Also make sure `npm ls @hookform/resolvers react-hook-form zod` writes `5.9.2`, `7.91.0`, `4.6.7`.

</details>

<details>
<summary><b>A viewer account briefly sees the admin buttons, or still sees them after its role was changed</b></summary>

**Briefly after the page opens:** the condition is the wrong way round, for example `user?.role !== "viewer"`. While `GET /auth/me` hasn't answered yet (`"loading"`), "not a viewer" is true. Use `useAdmin()` ([3.1](#31-useadmin-and-the-second-guard-adminonly-10-minutes)). **After the role was changed** (`npm run users -- role <email> viewer`): the screen asks for the role once, when it opens; press **F5** or log in again. The guard reads the role from the wristband, so there the new role applies within 15 minutes at the latest; until then, taps from the old screen can still be accepted (Concept 5).

</details>

<details>
<summary><b>After Log out, the Back button briefly shows the old screen</b></summary>

**For a moment (the author's test: ±0.16–0.5 seconds): expected.** A page whose address was once typed can be restored whole from the back/forward cache; the `pageshow` effect in `App.tsx` ([3.2](#32-a-complete-logout-clearall-and-four-steps-in-order-15-minutes)) reloads it, then the guard takes you to `/login`. **Longer, or its buttons can be clicked:** that effect is missing or mistyped (it should be `if (e.persisted) location.reload()`); without it, the old page stays for ±1.2 seconds and the next person can land on the previous person's screen. On a shared computer: **Log out**, then close the tab ([🔬](#-technical-deep-dive-optional)).

</details>

<details>
<summary><b>Every event shows up as two toasts</b></summary>

The right result (the author's test, also with StrictMode): one `event` frame = one toast. The causes: (1) `socket.on("event", …)` without `socket.off("event", onEvent)` in the cleanup, while StrictMode mounts the effect twice ([4.2](#42-event-messages-become-toasts-a-named-listener-and-off-10-minutes)); (2) a second listener in a page (one is enough, in `useRealtime`); (3) two notices for one save, `Rule "…" saved.` and `Rule 4 (…) changed through the API: …`: `onEvent` doesn't skip `rule-changed`.

</details>

<details>
<summary><b>Toasts cover the Lamp, Fan, or pump buttons on a phone turned sideways or a 320 px screen</b></summary>

**Symptom:** a toast shows right on top of Lamp/Fan or a pump button, and the next tap lands on the toast: the command isn't sent. **Cause:** below 1280 px, toasts stick to the bottom of the screen, with free space as high as two toasts ([4.1](#41-toastts-and-toastregion-at-the-bottom-of-a-phone-at-the-top-right-of-a-wide-laptop-15-minutes)); on a phone turned sideways or at 320 px that space isn't enough. At 320 px, two long toasts (rule names of ±39 letters and up) can cover **Save rule** through **Yes, delete** even when the page is scrolled all the way down. **Steps:** press **✕** or wait 4 seconds; hold the phone upright; use short rule names. Did the Practice 10 tester get stuck because of it? Note it as a finding. The author's proof comes from DevTools emulation, not a real phone.

</details>

<details>
<summary><b>A <code>409</code> answer: <code>the previous lamp command is still waiting for its ack</code></b></summary>

**Symptom:** the toast `Lamp: the previous lamp command is still waiting for its ack`, and the button goes back. The raw answer (the author's research test, a second command 300 ms after the first): `409 {"message":"the previous lamp command is still waiting for its ack"}`. **Cause:** one actuator may only have one unanswered command (≤ 5 seconds). Your button ignores taps while waiting (`if (!usable) return;`, [5.2](#52-switchbutton-show-it-first-with-useoptimistic-and-usetransition-25-minutes)), so the trigger is a second dashboard, a phone, Bruno, a rule at the same moment, or a Details screen you left and opened again before the device answered (its button is created anew without the waiting mark; the first command still runs). **Steps:** wait for the first answer, look at the card, then tap again.

</details>

<details>
<summary><b>The answer is <code>200</code>, but the button goes back by itself and <code>the device refused</code> appears</b></summary>

**Symptom** (the author's recording in [6.5](#65-the-simulator-soil-and-tank-typed-in-the-terminal-5-minutes), `tank 15`): `command` is answered `200`, the red toast `Pump: the device refused (pump refused: tank water too low)`, log `pump = 5, ack ok=false in 17 ms`. **Cause:** `200` means the command arrived and the device answered, but the answer is "no" (`ack.ok: false`). The button follows `ack.state` (Concept 1): Lamp/Fan roll back, the pump stays `Idle`. Most often: the tank is below 20%, or its sensor can't be read (`pump refused: tank level unreadable`). **Steps:** simulator: `tank random` (or 20 and up); device: fill the tank, and never run the pump dry.

</details>

<details>
<summary><b><code>Lamp: not confirmed by the device yet…</code>, then the lamp turns on by itself a little later</b></summary>

**Symptom** (the author's recording, a silent mock Node 1): ±5 seconds after the tap, the toast `Lamp: not confirmed by the device yet; the server will try again when it hears from the device.` and the button back to `Off`; 40.0 seconds after the tap, the lamp turns on by itself with the toast `lamp a4cf12e5b7c0 reported false, but true is desired (api); command sent again`. Log: `… -> 504 (5018 ms)`, then `WARN: reconcile: lamp … command sent again`. **Cause: on purpose.** `504` = not confirmed yet, not cancelled: the backend remembers your wish and sends it again when it hears from the device again, at the earliest 30 seconds after the last try (Concept 2). **Steps:** leave it. Want it to stay off? Wait for the lamp to turn on, then tap; a tap while it's `Off` sends `On` again. The pump isn't sent again (`Pump: not confirmed by the device and not sent again. …`).

</details>

<details>
<summary><b>Deleting a rule fails: <code>404</code> in Bruno, <code>FST_ERR_CTP_EMPTY_JSON_BODY</code>, or a red CORS message in the Console tab</b></summary>

| What you see | Cause → steps |
| :--- | :--- |
| Bruno: `404 {"message":"rule 4 doesn't exist"}` | `/rules/4` isn't your rule's id (numbers are never reused, so your id may be 5): use the `id` from the **create soil watering rule** answer. A second `404` after a success is right. |
| `404` `Route DELETE:/rules/… not found` | The backend is still 1.0; the `npm run dev` header must say `@1.1.0` ([6.4](#64--npm-run-check-npm-test-and-npm-audit-then-bruno-and-docs-110-10-minutes)). |
| `400` `FST_ERR_CTP_EMPTY_JSON_BODY` (`Body cannot be empty when content-type is set to 'application/json'`) | The `DELETE` carries `Content-Type: application/json` without a body: remove that header (`deleteRule()` without `headers`). |
| **Yes, delete** → `Can't reach the server at …` + a red CORS message, even though the backend is running | The preflight is answered `GET, HEAD, POST, PUT` (backend 1.0, no `DELETE`): copy the 1.1 `src/auth/security.ts`, restart the backend. |

</details>

<details>
<summary><b>The fan stays on after its rule was deleted or deactivated</b></summary>

**Not an error**, the same as in backend 1.0: a deleted or deactivated rule stops acting, but an actuator it's keeping on is left as it is, and a device that restarts doesn't receive its command again (the author's test). Turn it off with the **Fan** button. The `temp_fan_on` threshold that was once sent to Node 1 isn't taken back; Node 1 only uses it when the broker can't be reached (Module 19 Concept 10).

</details>

<details>
<summary><b>The watering rule doesn't water again after the device refused once or didn't answer</b></summary>

**Symptom:** one red toast `⚠️ Soil 25 % — pump command refused by the device: pump refused: tank water too low` (or `… pump did NOT answer the command (not sent again)`), then 🌱 never comes even though the tank has been filled. **Cause: on purpose.** A rule whose command was refused or not answered doesn't try again until the soil rises above its upper limit (for example 35%) or the rule is saved again; without that, ⚠️ would repeat every few seconds (Concept 9). **Steps:** fill the tank (`tank random`), then trigger it again: `soil 40`, wait for ✅, then `soil 25`, or **Edit** → **Save rule** even without changes. 🌱 comes ±15 seconds later. No ⚠️ at all? Check: the rule is `Active`, the measured device = the one whose soil you changed, the backend is `1.1.0`.

</details>

<details>
<summary><b>Node 1 waters twice: once from the server, once from its local safety rule</b></summary>

**Symptom (device path):** after one dry spell, the pump runs from the server rule (🌱) and from Node 1 itself (3 seconds, repeated every 30 seconds while dry). The simulator has no local watering. **Cause:** Node 1's local threshold (30% by default) is the same as the server's: two brains, one pump (Module 19). **Steps:** in Node 1's Serial Monitor, type `threshold`, then `threshold 20` ([6.5](#65-the-simulator-soil-and-tank-typed-in-the-terminal-5-minutes)); the server's threshold stays above it. Read from firmware v1.6.0, not yet tested by the author on a real board.

</details>

<details>
<summary><b>A white screen with <code>fileURLToPath is not a function</code> in the Console tab</b></summary>

**Symptom:** a white screen; the **Console** in `npm run dev`: `Cannot access "url.fileURLToPath" in client code.`, then `Uncaught TypeError: (0 , import_browser_external_url.fileURLToPath) is not a function` (in the build, the name before `.fileURLToPath` changes). `npm run build` still passes, with the warning `Module "path" has been externalized for browser compatibility`. **Cause:** a file imports `../../backend/src/schemas/rules`, which drags node-cron into the browser (Concept 8). **Steps:** import from the copy, `from "../schemas/rule-basics"` ([7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes)); find the rest with **Ctrl + Shift + F**, search word `backend/src`.

</details>

<details>
<summary><b><code>npm run check-schema</code> writes <code>DIFF</code></b></summary>

**Symptom** (the author's recording, one number changed in the copy; exit code `1`; trimmed):

```text
DIFF  src/schemas/rule-basics.ts, from line 71:
  backend :   name: z.string().min(1).max(60),
  frontend:   name: z.string().min(1).max(80),
Copy the file again from ../backend/src/schemas/ (don't change it in the frontend), then run this again.
```

1. **The copy was changed or is stale:** copy it again from your `backend/src/schemas/` as in 7.1.
2. **Line 1 looks the same, with `(an unseen difference: … BOM …)`:** the file was saved with a BOM, for example through `Set-Content -Encoding utf8` in PowerShell 5.1. In VS Code, click `UTF-8 with BOM` in the status bar → **Save with Encoding** → **UTF-8**.
3. **`(a difference at the end of the file: …)`:** copy the whole file again.
4. **`Can't read ../backend/…`:** run it from the `frontend` folder, with the `backend` folder next to it.

CRLF line endings do **not** cause a `DIFF`, unlike `git diff --no-index`, which reports wrongly there (Concept 8).

</details>

<details>
<summary><b><code>npm run lint</code> warns about <code>only-export-components</code></b></summary>

**Symptom:** not `Found 0 warnings and 0 errors.`, but the `only-export-components` warning: `Fast refresh only works when a file only exports components…` (the author's research test). **Cause:** a `.tsx` component file also exports a function, for example `export function failureMessage` in `SwitchButton.tsx`; fast refresh can only update files that hold nothing but components (simple constants are allowed). **Steps:** don't export the function, or move it to a `.ts` file such as `rules.ts`. Lint must be clean in [10.1](#101-dashboard-100-lint-build-check-schema-and-the-version-number-15-minutes).

</details>

<details>
<summary><b><code>Refused by the server: condition.kind: Invalid discriminator value. Expected 'threshold' | 'schedule'</code> when saving the watering rule</b></summary>

**Symptom:** **Save rule** with the **When a number FALLS below a limit** option brings up that red text above the button (the author's test against backend 1.0: `400 "body/condition/kind Invalid discriminator value. Expected 'threshold' | 'schedule'"`). **Cause:** the running backend is still 1.0. **Steps:** in the `backend` terminal, **Ctrl + C**, then `npm run dev`; its header must be `…@1.1.0 dev` and `/docs` must say `1.1.0` ([6.4](#64--npm-run-check-npm-test-and-npm-audit-then-bruno-and-docs-110-10-minutes)), then save again. The other way round, backend 1.0 hides rules of the new shape without a message (log `WARN: rule 5 skipped: condition.kind: Invalid discriminator value. Expected 'threshold' | 'schedule'`); don't save rules through 1.0.

</details>

<details>
<summary><b><code>Unrecognized key</code> when saving a rule</b></summary>

**Symptom:** `400` with `Unrecognized key`, for example `body/ Unrecognized key: "extra"` (the author's research test), usually in Bruno. **Cause:** the schema uses `strictObject`, so a key that belongs to another option is refused, for example `on_above`, which belongs to the rising condition, in a `below-threshold` condition. **Steps:** in Bruno, the complete example is in **create soil watering rule**. In the form code, replace the whole object at once (`setValue("condition", defaultCondition(…))` in `changeWhen()`, [8.3](#83-ruleform-at-rulesnew-useform-with-zodresolver-a-sentence-preview-and-the-save-button-20-minutes)), not only `condition.kind`. In our form, the schema copy refuses it first, so `POST /rules` isn't sent.

</details>

<details>
<summary><b>A number in the form is read differently: <code>1.000</code> becomes 1, or <code>2,5</code> becomes 25</b></summary>

- **`1.000` is read as 1** (a point is the decimal mark; the preview writes "above 1"): write `1000`. The light field's label reminds you: `0-4095, no thousands separator`. (`1,000` happens to give 1000, only because an English-language Chrome drops every comma.)
- **`2,5` is read as 25:** an English-language Chrome drops the comma, without an error message, in both kinds of field. Write a decimal point: `2.5` is accepted in a limit field and refused in **Must last for** with `Enter a whole number (no decimals)`.
- **An empty field** → `Enter a number`. Does `Invalid input: expected number, received NaN` show instead? `{ error: friendlyMessages }` isn't in place yet ([8.1](#81-form-ingredients-friendlymessages-and-parse400-in-rulests-and-field-helpers-in-fieldstsx-10-minutes)).

Tested in Chrome 156 with an English interface; Firefox, Safari, and phone keyboards haven't been tested.

</details>

<details>
<summary><b><code>403 request from the page http://192.168.1.10:5173 refused</code> when the admin presses a button on the phone</b></summary>

**Cause:** the phone page's origin, `http://<laptop-IP>:5173`, isn't **exactly** in `CORS_ORIGIN`. The guard refuses `POST`, `PUT`, and `DELETE` from an origin that isn't listed. The full `403` text can be read in the backend log (`WARN: refused (403): … from the page …`) and with `curl` and an `Origin` header ([9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes)). In the phone's browser, the refusal usually comes earlier (a preflight without permission for the origin), so the dashboard writes `Lamp: the server didn't answer.` or `Can't reach the server at …`. **Steps:** one origin in `CORS_ORIGIN` must match the phone's address bar letter for letter: `http://`, the IP of the `Wi-Fi` adapter from `ipconfig` (your IP differs), `:5173`, no `/` at the end. Save `.env` (the backend restarts by itself), wait for `Server listening at http://<laptop-IP>:8080`, then **F5** on the phone.

</details>

<details>
<summary><b>The home-screen shortcut on the phone doesn't open the dashboard anymore</b></summary>

Not tested by the author on a real phone yet. Possible causes: laptop mode has been switched back ([10.5](#105-the-viewer-account-on-the-same-phone-then-delete-the-tester-account-and-switch-back-to-laptop-mode-10-minutes)), so turn phone mode on again ([9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes)); the laptop's IP changed, so update `CORS_ORIGIN`, delete the old shortcut, then make it again; the laptop is asleep, or the phone is on another Wi-Fi. On an iPhone (iOS 26) the shortcut opens as its own web app, so you may have to log in again. A real installed app needs HTTPS (Module 27).

</details>

## 🔬 Technical Deep Dive (optional)

You may skip this: a deeper "why", other choices in the working world, and the honest limits of v1.0. Nothing needs installing: Next.js, sonner, and react-hot-toast are only compared. The code pieces are **for reading**, or for trying on a branch that isn't merged.

<details>
<summary><b>Next.js 16: when you need a <i>framework</i>, and why our dashboard stays Vite + React Router</b></summary>

This continues the "Next.js and the like" fold in the [🔬 of Module 22](../module-22-react-basics/README.md#-technical-deep-dive-optional). As of 25 October 2026, its latest version is `next` **16.4.3**; the 16 series was announced on 21 October 2025. According to [its official blog](https://nextjs.org/blog/next-16), Turbopack becomes the default bundler of new projects, `middleware.ts` is replaced by `proxy.ts`, caching through Cache Components is opt-in (without it, dynamic code runs on every request), and it needs Node 20.9 or newer.

If our dashboard were rewritten with the Next.js App Router, the route map in `App.tsx` would move into a **folder layout** (just read it):

```text
app/
├── layout.tsx                       ← the frame, like Layout
├── login/page.tsx                   ← /login
├── devices/page.tsx                 ← /devices
├── devices/[id]/page.tsx            ← /devices/:id
├── devices/[id]/history/page.tsx    ← /devices/:id/history
└── rules/…                          ← /rules, /rules/new, /rules/:id
proxy.ts                             ← runs on the server before the page
```

By default, every component there is a **server component** (React Server Components): it runs on the server, and its JavaScript isn't sent to the browser. The HTML is made per request (**SSR**) or once at build time (**SSG**). A component that uses `useState`, the socket, or Zustand must be marked `"use client"`.

| Next.js helps with… | Our dashboard |
| :-- | :-- |
| a public site that must show up on Google | every screen is behind a login |
| a fast first view for new visitors | few users, on the home Wi-Fi |
| an API (Route Handlers) and the screens in one Node project | the API, the login, and Socket.IO are already handled by Fastify (Modules 16–21) |
| HTML that holds data straight from the server | live numbers come through the socket and are still drawn in the browser |

The practical reason: Vite's `dist/` is just static files for the web server of Modules 26–27, while SSR needs a second Node process to look after. Next.js can be exported statically (`output: 'export'`), but then its server features don't apply, so the result is back to something like Vite. The react.dev site recommends a framework for **new** apps, and says building your own with Vite is valid for learning the basics of React. The table above is **the author's judgment** for this project, not a verdict on which is better.

</details>

<details>
<summary><b>The three modes of React Router 8 (declarative, data, <i>framework</i>) and how v7 differs from v8</b></summary>

The [React Router docs](https://reactrouter.com/start/modes) now use three mode names, and their features stack:

| Mode | Set up with | Its features |
| :-- | :-- | :-- |
| **Declarative** (this module) | `<BrowserRouter>` | `<Routes>`, `NavLink`, `useParams`, `useNavigate` |
| **Data** | `createBrowserRouter` + `<RouterProvider>` | + loaders (fetch data before a screen shows), actions (submit forms), `useFetcher` |
| **Framework** (Remix's successor) | a Vite plugin | + SSR/SSG, one file per route; in Next.js's class |

The "library mode" of the old Syllabus comes from the v7 announcement (2024) and means "without a framework". We picked declarative because the login, the one-time refresh, the store, and the socket have lived **outside** the router since Modules 22–23; data mode would move `GET /devices` into each route's loader, and every screen would be rewritten. When react.dev says React Router can be paired with Vite to become a framework, it means the third mode.

**v7 versus v8.** v8 has been stable since 17 June 2026, and major releases now come once a year; v7 still gets security fixes. For declarative mode, the upgrade guide only lists minimum requirements (Node 22.22, React 19.2.7; "Vite 7+" only for framework mode) and the removal of `react-router-dom`. Importing from `"react-router"` already worked in v7, so this module's code would be exactly the same with 7.18.4.

**A lab finding.** Before 5.2, `<BrowserRouter>` wrapped address changes in `React.startTransition`, while the Zustand store changes at once. When **Log out** still called `navigate("/login")`, `RequireLogin` first saw `user === null` at the OLD address and handed it over as `from`, so the next person landed on the previous person's screen. That's where `loggedOutOnPurpose` comes from ([Concept 6](#6-a-complete-logout-cut-the-socket-delete-the-session-clear-the-store)).

</details>

<details>
<summary><b>Optimistic without <code>useOptimistic</code>, and forms without react-hook-form through <code>useActionState</code></b></summary>

Before React 19, an optimistic button was written with plain state, exactly like Warm-up Step 3 (save, change, roll back). A sketch for `SwitchButton` (not run by the author):

```tsx
const [wish, setWish] = useState<boolean | null>(null); // null = not waiting
const shown = wish ?? value;
async function tap() {
  setWish(!value);
  try { /* sendCommand, applyState, toast */ }
  finally { setWish(null); } // forget this line = a stuck button
}
```

Its rollback depends on a `finally` you have to remember yourself, and so does the double-tap guard. `useOptimistic` throws the optimistic view away as soon as the Action ends (success or failure); `useTransition` gives the waiting mark. The condition: `setShown` is called inside an Action; otherwise React warns `An optimistic state update occurred outside a Transition or Action.`

React 19 also has `<form action={fn}>` and `useActionState` (the last submission's result + a waiting mark, no library). Its checking only happens on submit: you turn the `FormData` (all text) into a nested object with numbers yourself before `Rule.safeParse`. Our rule form needs a message per field as soon as the field is left (`mode: "onTouched"`), fields that branch with `condition.kind`, and `valueAsNumber`; react-hook-form + `zodResolver` already handle all of that. On the other hand, `handleSubmit` isn't an Action, so optimism in a react-hook-form form must be wrapped in `startTransition` yourself; for rules, `isSubmitting` and a toast are enough.

</details>

<details>
<summary><b>One schema source without copying: cross-folder imports, <code>resolve.dedupe</code>, and <i>workspaces</i></b></summary>

Three "single source" routes the author tried or read about during research:

1. **A cross-folder import** (`../../backend/src/schemas/…`). With v1.0's `rules.ts` the result is a white screen (`node-cron` gets bundled too); that's why backend 1.1 splits off `rule-basics.ts`. Even a pure Zod file (tested with `contract.ts`) brings two traps: its `zod` is looked up in `backend/node_modules`, so the bundle holds two copies of Zod (≈ 20–25 kB gzip bigger) until `vite.config.ts` gets `resolve: { dedupe: ['zod'] }`; and without `backend/node_modules`, `tsc -b` fails with `TS2307: Cannot find module 'zod'`, so the frontend's `npm run build` depends on `npm install` in the backend.
2. **A local package** `"file:../schemas"`: fails with the same `TS2307`, because that folder has no `node_modules`.
3. **npm workspaces**: a `package.json` at the root with `"workspaces"` and one `package-lock.json` for every folder. Tidy for a team, but the way of installing since Module 16 (`cd backend && npm install`) changes too. Not tested by the author.

For beginners, a copy **checked by a machine** ([7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes)) is cheaper than one source that needs three settings, and the frontend can still be built on its own. The backend stays the last guard.

</details>

<details>
<summary><b>After a <code>504</code>: the server's wishes and the device's report in <code>GET /devices/:id/state</code></b></summary>

Since [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#4-desired-state-versus-reported-state), the server records the **wish** (desired) for the lamp, fan, and curtain before sending a command, and a `504` doesn't erase it. Every time telemetry arrives, the wish is compared with the device's **report** (reported); if they differ and the last try was more than 30 seconds ago, the command is sent again without anyone tapping. The backend log writes `WARN: reconcile …`, and events of the `command` kind show up as toasts ([4.2](#42-event-messages-become-toasts-a-named-listener-and-off-10-minutes)). The pump isn't recorded, and `ack.ok: false` erases the wish, so a device's refusal isn't repeated.

Both records can be read by anyone logged in, the viewer included, through `GET /devices/:id/state` (Bruno: **Node 1 actuator state**), for example after a `504` while the device doesn't answer.

**Expected output (an example from the author's research, backend v1.0 with the same route; trimmed):**

```text
{"desired":{"lamp":true},"reported":{…"lamp":false…},"diff":["lamp"]}
```

The dashboard could ask for it **once** after a `504`, then write "On requested, not confirmed yet" until `telemetry.state` matches; triggered by an event, not polling. v1.0 doesn't have it yet: the `504` toast and the `command` event toast already get the point across.

</details>

<details>
<summary><b>Ready-made toast libraries: sonner and react-hot-toast</b></summary>

The author's research (25 October 2026, all three measured in one small test app):

| | home-made | react-hot-toast 2.6.1 | sonner 2.0.8 |
| :-- | :-- | :-- | :-- |
| Extra bundle (gzip) | ±0.6–0.7 kB | ±4.7 kB (including `goober`) | ±9.2 kB |
| Screen reader | a `role="status"` region | `role="status"` per toast | an `aria-live="polite"` region |
| Defaults to watch | — | shown for 2 s (success) / 4 s (error) | a light theme (use `theme="system"`), bottom right, no close button |

Both are fine in other projects. Here, the home-made one teaches more: you see the `aria-live` region that must exist before its content changes, the colors follow Tailwind and dark mode, the "at most 2, at the bottom of a phone screen" rule ([Concept 10](#10-on-screen-notices-toasts-aria-live-and-where-they-go-on-a-phone)) is only a few lines, and no new package is needed.

</details>

<details>
<summary><b><code>React.lazy</code> per route: splitting the bundle that carries Recharts</b></summary>

The [🔬 of Module 23](../module-23-realtime-dashboard/README.md#-technical-deep-dive-optional) already proved that `React.lazy` makes the 500 kB warning disappear. The v1.0 bundle has grown: ±882 kB (gzip ±263 kB, [10.1](#101-dashboard-100-lint-build-check-schema-and-the-version-number-15-minutes)), from ±680 kB in v0.2, even though Login, the List, and Rules don't use charts. With a router, the cutting point is clear: one route, one chunk. A sketch (not measured by the author):

```tsx
// App.tsx (the same for History):
const DetailsPage = lazy(() => import("./pages/Details"));
// Layout.tsx, where <Outlet /> is:
<Suspense fallback={<p>Loading the screen…</p>}><Outlet /></Suspense>
```

`Suspense` goes around `<Outlet />`, not `<Routes>`, so the header, the menu, **Log out**, and the toasts stay on the screen while Details is downloaded for the first time. The price is the same as in Module 23 (the first Details waits for a download, one more concept), so v1.0 stays one file with one warning.

</details>

<details>
<summary><b>The <i>back/forward cache</i> and the <code>pageshow</code> event after Log out</b></summary>

A browser keeps a page you leave **whole in memory** so Back feels instant. Inside the dashboard, Back usually only changes the address: the guard reads the empty store, then goes to `/login` (lab: 35 ms). But an address once **typed in the address bar** is a document of its own, and after **Log out**, Back restores it from that cache. The author's lab before the fix: the header `Home Admin (admin)` and the **+ New rule** button showed again for ±1.2 seconds until `POST /auth/refresh` was answered `401` (if the backend is down, they can stay), and the next person landed on the previous person's screen.

The cure is the `pageshow` effect in `App.tsx` ([3.2](#32-a-complete-logout-clearall-and-four-steps-in-order-15-minutes)): `e.persisted` is `true` when the page was restored from the cache, and then `location.reload()` makes `App` ask "who am I?" again. After that, the old page only **flashes** for 0.16–0.5 seconds before `/login` shows, and the next person who presses Back and then logs in still arrives at the old address (lab: `/rules`), without the old data: an honest limit. Emptying the screen on `pagehide`, or `Cache-Control: no-store` from the server, is more complicated or outside this module's code.

</details>

<details>
<summary><b>Home-screen shortcuts and installed apps: <i>manifest</i>, <i>service worker</i>, and a secure context</b></summary>

Step [9.3](#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes) only makes a **shortcut** to `http://<laptop-IP>:5173` (Chrome on Android: ⋮ → **Install and create shortcut** → **Create shortcut**). Since iOS 26, Safari opens a site on the Home Screen as a web app without an address bar. For `http://` on a LAN, neither has been **tested by the author** on a real phone, including whether the login carries over.

An **installed app** (a PWA) needs a manifest (a name, 192 and 512 px icons, a start address), HTTPS so Chrome offers **Install**, and a service worker (a background script for offline use and push notifications), which only runs in a **secure context**: HTTPS or `localhost`.

**Expected output (the author's recording on the machine itself through the LAN IP; your IP will differ):**

```text
isSecureContext at http://192.168.1.10:5173 = false; crypto.randomUUID exists = false; serviceWorker exists = false
```

On the laptop, `localhost` counts as secure; an IP address opened by a phone doesn't. So a real PWA waits for HTTPS in Module 27.

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** the same as Practice 10 after laptop mode is back: **VS Code** (the `backend` terminal, the Vite terminal with `npm run dev`, and a free terminal in the `frontend` folder; on the laptop path also the broker and the simulator), **Docker Desktop**, and **Chrome or Edge** at `http://localhost:5173` with DevTools.

All three challenges only change the `frontend` folder. Do them **after** [➕ E](#e--merge-featurecontrols-roles-into-main-via-the-dashboard-v10-controls--roles--backend-11-pull-request), each on a new branch from `main` (`git switch main`, `git pull`, then `git switch -c feature/<challenge-name>`). Before saving, `npm run lint` must be clean and `npm run build` must pass with one 500 kB warning ([10.1](#101-dashboard-100-lint-build-check-schema-and-the-version-number-15-minutes)).

All three have keys in [`code/challenges/key/`](code/challenges/key/): only the changed or new files, on top of [`code/frontend/`](code/frontend/) 1.0.0. All three keys pass lint and build on the author's machine, but haven't been tried by someone else. So there are no **Expected output** boxes here, only **You pass when** conditions.

### Level 1 — A curtain button, 0–180° (a small change, 20 minutes)

The curtain is still only a card, even though the backend already accepts `{"target":"curtain","value":120}`. "Turn to 120°" is safe to repeat, so the curtain may be optimistic like the lamp ([Concept 2](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic)).

1. Copy `src/components/SwitchButton.tsx` ([5.2](#52-switchbutton-show-it-first-with-useoptimistic-and-usetransition-25-minutes)) to **`CurtainButton.tsx`**, then make `value` a number and its command `{ target: "curtain", value: angle }`.
2. Add a slider, `<input type="range" min={0} max={180} step={10} />`, that only **picks** the angle, and a **Set to N°** button that **sends**. A slider that sends right away turns one slide into a dozen commands, and those that come while the previous command is waiting for its ack are refused with `409`.
3. In `DeviceDetails.tsx`, put `<CurtainButton deviceId={id} value={state.curtain} disabledReason={reason} />` in the **Controls** section, then make the **Curtain** card viewer-only, like Lamp, Fan, and Pump.

**You pass when:** as admin, **Set to 120°** writes `Now 120°` at once with `Waiting for device confirmation…`, which disappears when the ack arrives; the viewer only sees the **Curtain** card; the `504` sentence in your code says "not confirmed yet", not "cancelled".

<details>
<summary><b>Level 1 answer key</b></summary>

The whole files: [`CurtainButton.tsx`](code/challenges/key/level-1/frontend/src/components/CurtainButton.tsx) (new) and [`DeviceDetails.tsx`](code/challenges/key/level-1/frontend/src/components/DeviceDetails.tsx).

There are two states: `useOptimistic(value)` = the angle **shown**, `useState(value)` = the angle **chosen** and not sent yet. The `504` sentence is the same as the lamp's, because the backend also remembers the curtain's wish and sends it again when it hears from the device.

</details>

### Level 2 — The history range in the address: `?range=7days` (fill in the blanks, 45 minutes)

Pick **24 hours** in History, then press **F5**: the range goes back to 7 days, because that choice only lives in state. Keep it in the address (`…/history?range=24hours`) with `useSearchParams` (a `useState` for the `?…` part of the address). In `src/components/DeviceHistory.tsx`, fill in every `____`:

```tsx
import { Link, ____ } from "react-router";

function readRange(text: string | null): HistoryRange {
  return text === "1hour" || text === "24hours" || text === "7days" ? ____ : "____";
}
// in DeviceHistory(), replacing the useState<HistoryRange>("7days") line:
const [searchParams, setSearchParams] = ____();
const range = readRange(searchParams.____("range"));
// in selectRange(r), replacing setRange(r):
setSearchParams({ range: ____ }, { ____: true });
```

**You pass when:** the address changes along; **F5** and the link in a new tab open the same range; **Back** goes back to Details; `?range=nonsense` = 7 days.

<details>
<summary><b>Level 2 answer key</b></summary>

The blanks: `useSearchParams`, `text`, `7days`, `useSearchParams`, `get`, `r`, `replace`. The whole file: [`DeviceHistory.tsx`](code/challenges/key/level-2/frontend/src/components/DeviceHistory.tsx). `replace` replaces the browser history entry instead of adding one, so **Back** goes straight back to Details. `readRange` exists because anyone can type an address.

</details>

### Level 3 — A beginner-friendly schedule builder: a time and days become cron (from scratch, 60–90 minutes)

A beginner doesn't know that `30 17 * * 1,3` means Monday and Wednesday at 17:30. Make `src/components/ScheduleBuilder.tsx`: an `<input type="time">` time box (WIB), seven day checkboxes (**Monday first**), the schedule sentence, and a **Use this schedule** button. Put it in `WhenSection.tsx`, below the cron field.

- Cron day numbers: 0 = Sunday, 1 = Monday, …, 6 = Saturday. None ticked = `*`.
- The sentence: extend `describeCron` in `rules.ts`, then export it.
- Check it with the same schema ([Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend)): `ScheduleCondition.safeParse({ kind: "schedule", cron })`.
- Write it into the form like the schedule example buttons: `setValue("condition.cron", cron, { shouldValidate: true, shouldDirty: true })`.

**You pass when:** Monday + Wednesday at 17:30 → `30 17 * * 1,3` and `Every Monday, Wednesday at 17:30 WIB`; Saturday + Sunday → `… * * 0,6` and `Every Saturday, Sunday …`; **Use this schedule** fills the cron field.

<details>
<summary><b>Level 3 answer key</b></summary>

The whole files: [`ScheduleBuilder.tsx`](code/challenges/key/level-3/frontend/src/components/ScheduleBuilder.tsx) (new), [`rules.ts`](code/challenges/key/level-3/frontend/src/rules.ts) (`makeCron`, `describeCron` exported), and [`WhenSection.tsx`](code/challenges/key/level-3/frontend/src/components/WhenSection.tsx). The days are sorted Monday first with `(h + 6) % 7`; the sentences were tried by the author in Node.

</details>

## ➕ Add-on to "Mini Smart Home"

This week Mini Smart Home starts **giving commands**: dashboard 1.0.0 with controls and roles, backend 1.1.0, and a simulator that knows `soil` and `tank`; the firmware, the broker, and data contract 1.4 stay the same. Everything is already committed on `feature/controls-roles` (not on GitHub yet): A matches it, B–D tidy up the documents, E merges it into `main`, and F saves your notes.

![Diagram of the Mini Smart Home after Module 24: dashboard v1.0 with controls, rules, roles, and routes, on the laptop and on a phone over home Wi-Fi; dashed lines = coming soon. Top, unchanged: Node 2 Garden v1.0.0 through Node 1 (ESP-NOW); Node 1 Home v1.6.0, unchanged firmware, the device path uses Serial threshold 20, now dashboard-controlled; the Pi gateway with the locked Mosquitto and Node-RED; the phone and Telegram. Left: broker clients (MQTTX, contract checker, simulator + soil 25 and tank 15); the phone on home Wi-Fi, phone mode, http://192.168.1.10:5173, the tester then the viewer, the tester account deleted after the test. The honest box, v1.0 is still: home Wi-Fi only with plain http:// (HTTPS in Module 27); the home-screen shortcut is only a bookmark (PWA in Module 27); only the ack and the rule list are checked with Zod; a new role takes up to 15 minutes; the test by someone else is as honest as the notes sheet. Laptop: backend v1.1.0, changed in Practice 6: falls below rules (below-threshold) + a one-time command, DELETE /rules/:id and CORS DELETE, schemas/rule-basics.ts without node-cron copied to the frontend, no migration, data contract 1.4. The routes used: auth login, refresh, logout, me, GET /devices, readings, and the new ones in purple POST /devices/:id/command, GET and POST /rules, PUT and DELETE /rules/:id; Socket.IO telemetry, status, + event for toasts. The database smarthome-db unchanged. Bruno + create soil watering rule and delete rule, /docs 1.1.0; login viewer then lamp on = 403. Frontend v1.0, complete for end users on the home network: 1.0.0 + react-router 8.5.0, react-hook-form 7.91.0, @hookform/resolvers 5.9.2, zod 4.6.7; the Vite dev server (laptop localhost:5173, phone npm run dev:phone during the test); lint clean, build passes with one 500 kB warning, check-schema two SAME; the browser with the route map and the role from /auth/me, three mini screens: Details + controls, Rules in sentences, Rule form; buttons and forms for admin only; Log out clears the store; toasts at most 2, at the bottom below 1280 px or top right from 1280 px. Browser to backend: fetch + Socket.IO with the access cookie. Bottom left, GitHub: branch feature/controls-roles, the pull request dashboard v1.0 (controls & roles) + backend 1.1 with the (Module 24) items; backend 1.1.0 files (rule-basics.ts new, a thin rules.ts, engine, automation, archive, routes/rules.ts + security.ts, Bruno, README v1.1), frontend 1.0.0 files (App.tsx, pages/, components/Login.tsx replaced by pages/Login.tsx with react-hook-form + Zod, check-schema.js + schemas/ with the identical copies + login.ts, toast.ts, rules.ts, api, store, socket, RequireLogin, Layout, AdminOnly, SwitchButton, PumpButton, ToastRegion, DeviceDetails + the admin-only Controls section, the rule list and form, apple-touch-icon.png, README v1.0), the simulator + soil, tank, the PR template + (Module 24); FirstButton.tsx deleted before the commit; never in Git: backend/.env, frontend/.env.local, node_modules/, dist/, photos or copies of the tester's password card. Bottom right: Phase 4 under way, the Phase 4 Checkpoint in Module 25; coming soon Module 25 Grafana, device map, reports; Module 26 Docker Compose; Module 27 internet, HTTPS, PWA; Module 28 fleet, OTA, provisioning.](assets/project-diagram-module-24.png)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder; F: a second window with the `learn-iot` folder) and a **browser** already logged in to GitHub. Stop the servers (**Ctrl + C**) before E.
>
> ⭐ **Required** — step E: the pull request into `main`.

### A. Match your project: `frontend/` 1.0.0, `backend/` 1.1.0, and the simulator in `tools/`

Your branch must match [`code/frontend/`](code/frontend/) (except `README.md` and the 10.4 fixes), [`code/backend/`](code/backend/), and [`code/tools/`](code/tools/). In the free terminal (the `frontend` folder), `git status` is clean on `feature/controls-roles` (Practice 10 has already been committed). Run `npm ls --depth=0` there, then `cd ../backend` and repeat it. **Expected output (the first lines):**

```text
mini-smart-home-frontend@1.0.0 C:\Users\you\mini-smart-home\frontend
mini-smart-home-backend@1.1.0 C:\Users\you\mini-smart-home\backend
```

According to the reference code, the pull request holds **66 files**: 45 in `frontend` (27 new, 17 changed including `README.md`, and `Login.tsx` deleted), 18 in `backend`, 2 in `tools`, and the template.

### B. Update `frontend/README.md`: the route map, roles, and the limits of v1.0

Open [`code/frontend/README.md`](code/frontend/README.md) on GitHub, click **Copy raw file**, then paste it in place of the whole contents of `frontend/README.md` and save. Its new parts start from **Route map**; **Limits of v1.0** says that a test by someone else on a real phone **hasn't been tried by the author**. Passed 10.3? Replace that sentence with your result, without the tester's name, a password, or an IP.

### C. Update `backend/README.md`, Bruno, and `/docs` to 1.1.0

Already done in [6.4](#64--npm-run-check-npm-test-and-npm-audit-then-bruno-and-docs-110-10-minutes); just check: `backend/README.md` holds **Version 1.1 notes**, `backend/bruno/` has two new requests, and `/docs` says `1.1.0`. Not yet? Copy them as in 6.4, then commit.

### D. Add the Module 24 items to the pull request template

In the same way, replace the whole contents of `.github/pull_request_template.md` at the repository root with [`code/.github/pull_request_template.md`](code/.github/pull_request_template.md). Its contents are the Module 23 template plus these seven lines:

```markdown
- [ ] **(Module 24)** If `backend/src/schemas/contract.ts` or `rule-basics.ts` changed: their copies in `frontend/src/schemas/` are updated too, and `npm run check-schema` in the `frontend` folder prints two `SAME` lines
- [ ] **(Module 24)** Every new HTTP method the dashboard calls (for example `DELETE`) is in the backend's CORS `methods` (`src/auth/security.ts`), and it was tried from the browser, not only from Bruno (Bruno doesn't send a preflight)
- [ ] **(Module 24)** Control buttons and admin menus are only drawn when the admin role is certain (`useAdmin()`), AND the backend still refuses them: checked in Bruno with `login viewer` then `lamp on` (and every new route that changes something) → 403. Hiding a button is not protection
- [ ] **(Module 24)** **Log out** and an expired session clear the WHOLE store (`clearAll()`): after the admin logs out, a viewer account that logs in in the same tab sees no leftover data, toasts, or admin buttons
- [ ] **(Module 24)** Roles and tokens are still never stored in `localStorage`; the role is read from `GET /auth/me` / the login answer
- [ ] **(Module 24)** No experiment file `frontend/src/components/FirstButton.tsx` (Quick Win) in the **Files changed** tab; the user-test tester account has been deleted (`npm run users -- delete …`) and phone mode has been switched back
- [ ] **(Module 24)** No install command without a version in the text, README, or notes, and no `--legacy-peer-deps`/`overrides` to "force" an install (example: `@hookform/resolvers@5.9.2`, not the latest version that fails with ERESOLVE)
```

Their proof: `check-schema` ([7.1](#71-copy-rule-basicsts-then-guard-both-copies-with-npm-run-check-schema-10-minutes)), Bruno `403` ([3.3](#33--switch-accounts-in-the-same-tab-nothing-left-over-admin-only-and-403-in-bruno-15-minutes)), the empty store ([3.2](#32-a-complete-logout-clearall-and-four-steps-in-order-15-minutes)), the tester account and laptop mode ([10.5](#105-the-viewer-account-on-the-same-phone-then-delete-the-tester-account-and-switch-back-to-laptop-mode-10-minutes)).

### E. ⭐ Merge `feature/controls-roles` into `main` via the "dashboard v1.0 (controls & roles) + backend 1.1" pull request

At the repository root (`cd ..`), `git status` must name exactly two `modified` files: `.github/pull_request_template.md` and `frontend/README.md`. Then:

```text
git add frontend/README.md .github/pull_request_template.md
git commit -m "Dashboard v1.0 docs and the Module 24 items"
git push -u origin feature/controls-roles
```

1. On GitHub, click **Compare & pull request** (base `main`), with the title `Dashboard v1.0 (controls & roles) + backend 1.1`. Write its changes and your user test results as honestly as your notes sheet (for example `L1–L3 not yet tested by someone else`), copy the seven **(Module 24)** items from D (the template on `main` is still the old one), then **Create pull request**.
2. **Review:** **Files changed** = 66 files, without `FirstButton.tsx`, `.env`, `node_modules/`, or `dist/`. `git grep -n setInterval frontend/src` now gives two lines: the clock in `time.ts` and a comment in `toast.ts`. Tick what's met, then **Review changes** → **Comment** → **Submit review**. A forbidden file got in? Don't merge: `git rm -r --cached <file>` (`.env`: change its secrets too), commit, and push again.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. `git switch main`, `git pull --prune`, `git branch -d feature/controls-roles`.

**You pass this ⭐ step** when that pull request has been reviewed with the **(Module 24)** items and merged, and on your laptop's `main`, `frontend/package.json` has version `1.0.0` and `backend/package.json` `1.1.0`.

### F. Save your learning notes and your user test sheet

In the `module-24/` folder of the **`learn-iot`** repository (from 🔁), save the filled-in [`notes-sheet.md`](code/user-test/notes-sheet.md) ([10.3](#103--the-user-test-on-the-testers-phone-four-tasks-without-help-25-minutes); without the tester's full name, a password, or photos) and `notes.md`:

```markdown
# Module 24 notes — Dashboard v1.0

| What was measured | My number |
| :--- | :--- |
| Lamp: ack ok=true in … ms (5.5) | … |
| User test: success / helped / failed (10.3) | … / … / … |
| L1–L3 tested by someone else on their phone? | yes / not yet |

What confused the tester most: …
```

Commit and push.

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Device ack** | The device's answer over MQTT to one command: `ok` and the `state` of its actuators. The backend waits for it for at most 5 seconds, then answers the button with `200` (with `ack.ok` `true`, or `false` = refused) or `504`. Not Module 23's Socket.IO ack for `follow`. |
| **`aria-live`** | A mark on the toast region (`role="status"`, `aria-live="polite"`) so a screen reader reads its new content out without moving the focus. The region must already exist before its content changes. |
| **Hysteresis** | The gap between the turn-on limit and the ready-again limit, so an actuator doesn't keep switching on and off while the number swings: water **below 30%**, ready again **above 35%** (Module 19's fan: 30 and 28 °C). |
| **Idempotent** | A command whose result is the same even if it's sent twice: "turn on the lamp" twice is still on, so the lamp and the fan may be optimistic and sent again after a `504`. "Water for 5 seconds" twice = 10 seconds: not idempotent. |
| **On-screen notice** (toast) | A small card that disappears by itself after 4 seconds (or when closed with ✕): the result of your tap, or an `event` message from the backend. At most 2; on phones and tablets at the bottom of the screen, on a wide laptop (1280 px and up) at the top right. |
| **Contrast** | How bright text (or an edge) is compared with its background. The WCAG AA limits: text 4.5 : 1; components and focus rings 3 : 1. Measured with Lighthouse and the Color Picker in DevTools. |
| **Optimistic UI** and **rollback** | The button shows your wish at once while writing `Waiting for device confirmation…`, then follows the device's report as soon as the ack arrives; on failure, it rolls back to the reported state, and a toast explains why. The lamp and the fan use `useOptimistic` + `useTransition`; the pump is deliberately not optimistic. |
| **Two-layer roles** | The role (`admin`/`viewer`) is used twice: the screen (from `GET /auth/me`) hides the control buttons and the admin screens from the viewer (convenience), and the backend's guard (from the wristband) refuses a viewer's requests that change something with `403` (security). Hiding isn't protection. |
| **Home-screen shortcut** | An icon on the phone's home screen that opens the dashboard's address in the browser, with `apple-touch-icon.png` as its picture. Not an installed app (a PWA needs HTTPS, Module 27); it breaks if the laptop's IP changes. |
| **Resolver** | The link between react-hook-form and an outside checker: `zodResolver(schema)` from `@hookform/resolvers` 5.9.2 runs the Zod schema and turns its result into errors per field. |
| **Route** and `<Routes>` | One address for one screen (`/devices/:id` → Details). `<Routes>` in `App.tsx` = the list of every address in one place (React Router 8.5.0, declarative mode), so **Back**, **F5**, and direct links work. A screen address (5173) is not an API address (8080), even when the words match. |
| **Layout route** and `<Outlet />` | A `<Route>` without a `path` that draws a frame that stays (`Layout`: the header, the menu, **Log out**) and puts the child screen in its `<Outlet />`; the content changes without cutting the socket. |
| **Protected route** and **route guard** | A screen watched by a guard at the door of the page: `RequireLogin` takes a visitor to `/login`, then back to the address they came from after logging in; `AdminOnly` shows `Admin only` to the viewer. |
| **Schema** and **identical copy** | Rules for the shape of data, checked by a machine. One rule, two guards: the browser (fast, per field) and the backend (protection). `contract.ts` and `rule-basics.ts` are copied exactly into `src/schemas/`; `npm run check-schema` makes sure both are `SAME`. |
| **SPA fallback** | A screen address that isn't a file is answered with the same `index.html`, then React Router draws its screen. Vite does this in `dev` and `preview`; other servers (Modules 26–27) must be given the same rule. |
| **Touch target** | The area a finger can tap: WCAG 2.2 AA asks for at least 24 × 24 px; the curriculum uses 44 × 44 px. |
| **User test** and **think aloud** | Someone else does real tasks without help while saying what they're thinking (think aloud). You only read the task again; stuck for more than 2 minutes = "helped". |

## 📝 5-Question Quiz

1. A friend says, "The control buttons are already hidden from the viewer, so the backend doesn't need to check the role anymore." (a) How can a viewer still try to turn on the lamp? (b) Who's on guard, and what's its answer? (c) An account's role is changed from the terminal. When do the screen and the guard find out?
2. You want the pump's **5 sec** button to write `Watering` at once, like the Lamp button. (a) Why is that wrong? (b) What shows from the moment the pump button is tapped until it's done? (c) With `tank 15` in the simulator, the pump command is answered `200`, but the pump stays idle. Why?
3. Node 1 isn't answering, and you tap **Lamp**. (a) What shows until the backend answers `504`, and after that? (b) Tens of seconds later, the lamp turns on by itself. Why? (c) Why doesn't the toast say "cancelled"?
4. (a) **F5** at `http://localhost:5173/devices/f00d00000001`: Vite has no file with that name, yet Details shows. Why? (b) `dist/` is copied to another static server, and **F5** at that address is answered `404`. What's missing? (c) What happens to the build if `base` is set to `./`?
5. (a) Why does the rule form check the input with Zod, when the backend checks it again anyway? (b) Why is `rule-basics.ts` copied rather than imported from `../backend`? (c) What keeps both copies the same, and what's the sign that they differ?

<details>
<summary><b>Answer key</b></summary>

1. (a) The dashboard's code runs in anyone's browser, so the screen can be bypassed, for example through Bruno with `login viewer` then `lamp on`. (b) The backend's guard, which checks the wristband and the role on **every** request: `403` `viewer accounts can only look; commands and changes are admin-only`. (c) The screen after the page is reloaded (`GET /auth/me` is only asked once); the guard within 15 minutes at the latest, when the wristband is renewed ([Concept 5](#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security)).
2. (a) The pump isn't idempotent: "water for 5 seconds" sent twice means 10 seconds, and water that came out can't be pulled back. (b) The card stays `Idle` with `Waiting for device confirmation…`; after an `ok` ack: the toast `Pump: watering for 5 seconds.`, the card `Watering`, all three seconds buttons disabled, then `Idle` again. (c) `200` only means "the device answered", and its answer is `ack.ok: false`: the toast `Pump: the device refused (pump refused: tank water too low)` ([Concept 2](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic)).
3. (a) The button shows `On` at once with `Waiting for device confirmation…`. Without an ack within 5 seconds, the backend answers `504`; the button goes back to the reported state (`Off`) with the toast `Lamp: not confirmed by the device yet; the server will try again when it hears from the device.` (b) The backend remembers the **wish** `lamp: true`. As soon as it hears from the device again and at least 30 seconds have passed since the last try, the backend sends it again by itself, with the toast `lamp … reported false, but true is desired (api); command sent again`. (c) Because it really isn't cancelled ([Concept 1](#1-from-watching-to-commanding-the-journey-of-one-tap-to-the-ack), [Concept 2](#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic)).
4. (a) The SPA fallback: for an address that isn't a file, Vite sends the same `index.html`, then React Router draws Details, which looks up its device in the store through `useParams()`. (b) The same rule on that server: every screen address is answered with `index.html` (Modules 26–27). (c) The browser asks for `/devices/assets/…`, gets `404`, and the screen is white; `base` stays `/` ([Concept 3](#3-one-address-for-one-screen-react-router-in-declarative-mode)).
5. (a) One rule, two guards: in the browser for the experience (fast, per field, wrong input isn't sent), in the backend for security (anyone can send through Bruno). (b) The backend's `rules.ts` drags node-cron into the browser: a white screen with `fileURLToPath is not a function`; besides, the frontend must build without the `backend/` folder. (c) `npm run check-schema`: two `SAME` lines. If they differ: `DIFF  src/schemas/rule-basics.ts, from line …` and exit code 1; copy it again from the backend ([Concept 8](#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend)).

</details>

---

## ✅ Module 24 Completion Checklist

The pass requirement from the Syllabus: **someone else (not you) can log in from their phone over the home Wi-Fi, turn on the lamp, and create the rule "water if soil < 30%" without help — and a viewer account doesn't see the control buttons.** **The path without a device:** every item may be ticked with the simulator `f00d00000001`. The lamp proof = the `On` card and `f00d00000001: command c-… -> ok=true` in the simulator terminal; the watering proof = `soil 25` in the simulator terminal, then the toast `🌱 Soil 25 % — pump watering for 5 seconds automatically`.

> [!NOTE]
> **No tester or phone yet?** The author hasn't tested with another person on a real phone, nor tried the home-screen shortcut on a phone ([📚](#-sources--image-credits)). Tick L1–L3 only after **someone else** has done them on their own phone without help. Without a tester or a phone, do the steps yourself through `http://<laptop-IP>:5173` with [DevTools device mode](../module-22-react-basics/README.md#71-devtools-device-mode-the-dashboard-at-375-768-and-1280-px-8-minutes) at 375 px, leave L1–L3 and the Practice 10 ⭐ unticked, write "L1–L3 not yet tested by someone else" in your notes and your pull request, then repeat them once you have one.

- [ ] **L1** The tester logs in from their phone over the home Wi-Fi with `tester@home.test`, without help; the backend log `login: account N (admin), session N, IP 192.168.…` holds their phone's IP (Practice 10).
- [ ] **L2** The tester turns on the lamp without help: `On` at once with `Waiting for device confirmation…`; log `lamp = true, ack ok=true` (Practice 10; my own version in Practice 5).
- [ ] **L3** The tester creates the "below 30%" watering rule without help, and the rule works: after `soil 25` (or dry Kit A soil), `🌱 Soil … — pump watering for … seconds automatically` appears (Practice 10; my own version in Practice 8).
- [ ] **L4** The viewer account: Details without the **Controls** section, **Rules** without **+ New rule** and **Edit**, `/rules/new` writes `Admin only`, Bruno `lamp on` → `403` (Practices 5 and 10).
- [ ] `node warmup.js` prints `--- 1. An address becomes a screen` through `--- 5. Messages that disappear by themselves`, matching the "Self-test answer key" (🔁).
- [ ] The temporary button turns on the lamp as admin and is refused with `403` as viewer, then I deleted `FirstButton.tsx` (Quick Win).
- [ ] ⭐ The four packages are installed at their written versions; **Back**, **F5**, and direct links open the same screen; an unknown address says "not found"; switching screens doesn't cut the socket (Practice 1).
- [ ] ⭐ Without logging in, `/devices/f00d00000001/history` takes me to `/login`, then back to History after logging in (Practice 2).
- [ ] ⭐ **Log out** → `You have logged out.`; a viewer in the same tab sees no leftover admin data; `/rules/new` → `Admin only`; Bruno as viewer → `403` (Practice 3).
- [ ] Simulator stopped → the toast `f00d00000001 disconnected (offline)`; backend stopped, then started → the right status without **F5** (Practice 4).
- [ ] ⭐ The lamp and the fan change at once with `Waiting for device confirmation…`, then follow the ack, in the second window too; **Request conditions** → the button rolls back with `Lamp: the server didn't answer.`; the pump isn't optimistic (Practice 5).
- [ ] ⭐ Backend 1.1.0: `npm test` `Tests  57 passed (57)`, `npm audit` → `npm audit fix` has been run; Bruno creates and deletes the watering rule; `/docs` 1.1.0; the simulator accepts `soil` and `tank` (Practice 6).
- [ ] `npm run check-schema` → two `SAME`; `/rules` shows the rules as sentences (Practice 7).
- [ ] ⭐ "Water if soil < 30 %" from the form: `soil 25` → 🌱 and the pump waters, `soil 40` → `✅ Soil up to 40 % — rule ready again`; the rule can be edited, deactivated, and deleted (Practice 8).
- [ ] Lighthouse Accessibility 100, light and dark; focus rings are visible; the admin turns on the lamp in phone mode (Practice 9).
- [ ] ⭐ `npm run lint` is clean, `npm run build` **passes with one size warning** (`Some chunks are larger than 500 kB after minification`), version `1.0.0`; the user test is noted in the notes sheet; the tester account is deleted and laptop mode is back (Practice 10).
- [ ] `frontend/` 1.0.0 and `backend/` 1.1.0 match, the README and the pull request template are updated, and the notes and the user test sheet (without the tester's full name) are saved in `learn-iot/module-24/` (➕ A–D, F).
- [ ] ⭐ All the Module 24 work is on `main` through the "dashboard v1.0 (controls & roles) + backend 1.1" pull request, reviewed with the **(Module 24)** items (➕ E).

🎉 **Your dashboard now commands, not just watches.** Every screen has an address that survives **Back** and **F5**, a guard at its door, and a complete logout. The admin turns on the lamp with a button that honestly waits for the device, creates a watering rule from a form checked by the same schema as the backend, and gets on-screen notices; the viewer sees everything without a single control button, and the backend's guard still keeps watch. This dashboard v1.0 still lives on the home Wi-Fi over plain `http://`; HTTPS and access from the internet wait for Module 27. One more module to the Phase 4 Checkpoint.

> ➡️ **Next module:** Module 25 — Professional Visualization: Grafana, Device Maps, & Reports (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-25--professional-visualization-grafana-device-maps--reports)). The dashboard you built stays for the people of the house; for the technical team comes Grafana, which reads TimescaleDB and sends a Telegram alert when a node has been silent for more than 5 minutes, plus a device map and automatic daily CSV reports.

## 📚 Sources & Image Credits

**Documentation and source code used** (accessed October 2026; package versions checked with `npm view` on 25 October 2026):

- **React Router 8.5.0**: [the three modes](https://reactrouter.com/start/modes), [routing](https://reactrouter.com/start/declarative/routing) and [navigating](https://reactrouter.com/start/declarative/navigating) in declarative mode, [the v8 announcement](https://remix.run/blog/react-router-v8), [upgrading from v7](https://reactrouter.com/upgrading/v7), and [the official auth example](https://github.com/remix-run/react-router-examples/tree/main/auth).
- **react-hook-form 7.91.0**: [`useForm`](https://react-hook-form.com/docs/useform). **@hookform/resolvers 5.9.2**: [`zodResolver`](https://github.com/react-hook-form/resolvers#zod) and [issue #882](https://github.com/react-hook-form/resolvers/issues/882) (`ERESOLVE` in 6.0.0). **React 19.3.1**: [`useOptimistic`](https://react.dev/reference/react/useOptimistic) and [`useTransition`](https://react.dev/reference/react/useTransition). **Vite 8.3.5**: [`appType`](https://vite.dev/config/shared-options.html#apptype) (the SPA fallback) and [`base`](https://vite.dev/config/shared-options.html#base).
- **Accessibility**: WCAG 2.2 [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html); MDN [live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions); DevTools [contrast](https://developer.chrome.com/docs/devtools/accessibility/contrast) and [**Request conditions**](https://developer.chrome.com/docs/devtools/request-conditions).
- **Phones and browsers**: [Chrome shortcuts on Android](https://support.google.com/chrome/answer/15085120?hl=en&co=GENIE.Platform%3DAndroid), [Safari 26](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/), [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), and the [bfcache](https://web.dev/articles/bfcache). **Only for 🔬**: [Next.js 16](https://nextjs.org/blog/next-16).
- **Backend 1.1**: [`backend-1.1.diff`](code/backend-1.1.diff) on top of Module 21's backend v1.0; the data shapes stay [contract 1.4](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract); Node 1 v1.6.0's local safety rule (Serial `threshold 20`) read from [`rules.cpp`](../../mini-smart-home/firmware/node-1-home/rules.cpp) and `commands.cpp`. The pass requirement is quoted from [Syllabus §7, Module 24](../../SYLLABUS.md#module-24--controls-rule-forms-roles--protected-routes).

**Images.** The author's diagrams and screenshots are licensed **CC BY 4.0**; the diagrams' `.svg` files are in `assets/`. File by file: [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-24`, `command-journey`, `route-map`, `two-layer-roles`, `two-zod-guards`, `layered-watering-rule`, `user-test`, `project-diagram-module-24` | Original diagrams from this module's code and the author's tests. The numbers, times, and IPs are **examples**; the real Node 1 was read from the firmware; `user-test` shows a way of working, not a test result. | CC BY 4.0 |
| `details-admin-vs-viewer`, `button-waiting-for-confirmation`, `watering-rule-form`, `rules-and-toast`, `routes-login-admin-only-404` | Real screenshots of dashboard v1.0 against backend 1.1 in Google Chrome 156, 1280 and 375 px wide (**DevTools device mode, not a real phone**), from the final code: before Practice 9 the colors on your screen are slightly lighter, and the **Rules** menu only comes in Practice 7. | CC BY 4.0, October 2026. React, React Router, react-hook-form, @hookform/resolvers, Zod, Vite, Tailwind CSS, Recharts, Zustand, and socket.io-client are MIT-licensed. |
| `accessibility-lighthouse` | The real Lighthouse 13.5.0 report and the real DevTools Color Picker of Google Chrome 156. | Titles, numbers, and captions: CC BY 4.0. Lighthouse is Apache-2.0-licensed; DevTools belongs to Google, shown as it is for educational purposes. |

**About the Expected output boxes.** Apart from the Windows boxes described below, the commands of this English edition were run by the author on a Raspberry Pi 5 (Ubuntu 26.04.1 LTS arm64) with Node.js 24.21.0, npm 11.19.0, and Docker Engine 29.1.3, against a real backend (1.1.0, plus a v1.0 copy for the "old backend" cases) and a real TimescaleDB database. Its MQTT broker is a small locked program that imitates Mosquitto. The senders are the simulator `f00d00000001` and a mock Node 1 that imitates firmware v1.6.0 and can be made slow or silent (for `504`); for the middle frame of the button picture, the mock Node 1 was deliberately slowed down by 3 seconds. The sensor numbers are **examples**.

The English edition's terminal boxes were recorded in a real terminal on the Pi (a TTY, so the oxlint summary and the 500 kB warning show as on your screen); its ports were different and are written as usual (`8080`, `5173`, `1883`, the database at `5432`), and no port shows in the pictures. Boxes that show a Windows terminal (a PowerShell prompt, Windows paths `C:\Users\you\…`, `chcp 65001`, `curl.exe`, `ipconfig`) keep the Indonesian edition's recordings on Windows 11 with PowerShell 5.1, translated with their values unchanged; that Windows lab didn't touch the firewall. Logs with emoji, `—`, or `°` are quoted with the right text; a code page 437 console shows them garbled until `chcp 65001` ([🚨](#-troubleshooting)). The browser is Google Chrome 156.0.8078.47, headless, driven by a script, with the time zone emulated as `Asia/Jakarta`; the 375 px width and dark mode were emulated too. **Request conditions** was replaced by the equivalent DevTools command (its menus weren't clicked), Lighthouse 13.5.0 was run from the command line, and the Bruno requests were sent by a script with the same method, address, body, and account. The phone steps were recorded on the lab computer opening its own Wi-Fi IP (written `192.168.1.10`).

The Pi's clock is in the UTC+8 zone; the backend used `TZ=Asia/Jakarta`, so the log times are WIB. Many boxes keep the example values of the Indonesian edition's recordings (on a laptop that was busy with other work, made before `useTransitions={false}` was put in at Practice 5; the author re-tested that fix by switching screens while a button waited), while the screen texts, log formats, and the build file names and sizes (10.1) come from the English code and lab. So the seconds, milliseconds, `in 44s`, clock times, rule ids, and build file names in every box are **examples**; the time numbers in the diagrams come from other runs. What has to match is the shape of the output and the pass requirements.

**Not** tested: real Android and iPhone phones, including the home-screen shortcut and iOS 26; a test by another person (the Practice 10 rehearsal was done by a script); Kit A and the real Node 1 (the lamp relay, pump, tank, Serial `threshold 20`); Firefox and Safari; Windows Terminal, the VS Code terminal, and macOS. (The Indonesian edition was recorded on Windows with Edge, this English edition on Linux with Chrome.)

---

[⬅️ Module 23](../module-23-realtime-dashboard/README.md) · [Phase 4](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 25 — Professional Visualization: Grafana, Device Maps, & Reports** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-25--professional-visualization-grafana-device-maps--reports))
