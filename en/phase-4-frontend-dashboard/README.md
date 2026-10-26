# 🟪 Phase 4 — Frontend: Realtime React Dashboard (Modules 22–25)

🌐 **English** · [Bahasa Indonesia](../../fase-4-frontend-dashboard/README.md)

> **Phase goal:** the face of the product — a dashboard that's pleasant to use on a phone or a laptop, by people who don't know what MQTT is. The dashboard is built on the laptop and gets its data from the backend v1.0 you built in Phase 3. For now it's still opened over the home network; "open it from anywhere" follows in Module 27.

Work through the modules **in order**. One module = one week (6–10 hours, spread out). Click a module title to open its article.

| Week | Module | Hardware | Tools installed in this module | Status |
| :---: | :--- | :--- | :--- | :--- |
| 22 | **[Module 22 — HTML, CSS, & React (TypeScript) from Scratch for an IoT Dashboard](module-22-react-basics/README.md)** | not required: data from backend v1.0 on the laptop together with the Module 21 device simulator (or Kit A + B, already running) | Vite 8.3.5 (the `react-ts` template from create-vite 9.3.1), React 19.3.1, Tailwind CSS 4.3.3 (`@tailwindcss/vite`), React DevTools | ✅ available |
| 23 | **[Module 23 — Realtime Dashboard: Charts, Gauges, History, & Status](module-23-realtime-dashboard/README.md)** | Kit A + B, or backend v1.0 on the laptop together with the Module 21 device simulator; plus a phone on the same home Wi-Fi (optional) | socket.io-client 4.8.4, Zustand 5.0.16, Recharts 3.10.1, date-fns 4.4.0 | ✅ available |
| 24 | **[Module 24 — Controls, Rule Forms, Roles, & Protected Routes](module-24-control-rules-roles/README.md)** | Kit A + B, or the backend on the laptop (v1.0, upgraded to 1.1 in Practice 6) together with the Module 21 device simulator; plus a phone on the same home Wi-Fi and one tester | React Router 8.5.0, react-hook-form 7.91.0, @hookform/resolvers 5.9.2, Zod 4.6.7 (same as the backend) | ✅ available |
| 25 | Module 25 — Professional Visualization: Grafana, Device Maps, & Reports | Kit A + B (or the simulator) | Grafana, react-leaflet | ⏳ coming soon — [summary](../SYLLABUS.md#module-25--professional-visualization-grafana-device-maps--reports) |

## 🎯 Phase 4 completion criteria

Before moving on to Phase 5, make sure this evidence is in your GitHub repository ([Syllabus §8](../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)):

1. The quiz of every module (5 questions): **at least 4 correct**.
2. **Checkpoint project:** the dashboard is used by someone else **without help**.
3. **Artifacts:** a demo video on a phone and a Grafana link.

Module 22 opens this phase: Mini Smart Home gets its first face. You start from the basics by taking apart the Module 10 switch page with HTML (the skeleton), CSS (the skin), and JavaScript (the muscles) in the browser's DevTools. Then you build **dashboard v0.1** in the `frontend` folder with Vite, React, TypeScript, and Tailwind CSS v4. The dashboard *logs in* with the *cookie* from Module 20, shows the device list together with each device's key badge from Module 21, and then opens the latest readings of all the sensors of each device. It stays neat on a phone screen. The data is fetched once when a screen opens; numbers that move by themselves come in Module 23.

Module 23 brings that face to life. The dashboard no longer asks just once: the backend **pushes** every new reading through one Socket.IO connection locked with the same *cookie*, and a Zustand store shares it with every screen. Device cards are now red or green with a "last seen" note, the device details get a 5-minute line chart and *gauges*, and the History screen shows 1 hour, 24 hours, or 7 days from TimescaleDB buckets, complete with a paged table and CSV export. You also learn to choose honest visuals, measure re-renders with React DevTools, turn on dark mode, and open the dashboard from your phone over the home Wi-Fi, then put it back into laptop mode.

Module 24 lets that dashboard **give commands**, not just watch. Every screen now has its own address, so **Back**, **F5**, and direct links work; a guard at the door of a page sends people who haven't logged in to the Login screen. The admin account turns on the lamp and the fan with buttons that switch at once while waiting for device confirmation and roll back by themselves on failure, whereas the viewer account doesn't see a single control button (the backend still refuses its commands). The backend moves up to 1.1 so that rules like "water if soil < 30%" can be created from a form checked by the same Zod schema as the backend. Important events, for example a rule turning on or a device disconnecting, now appear as short on-screen notices (*toasts*). At the end of the week, you check its basic accessibility, then someone else tries your dashboard from their own phone over the home Wi-Fi without help.

## 📂 What each module folder contains

| Content | Purpose |
| :--- | :--- |
| `README.md` | The module article — start reading here. GitHub shows it automatically when you open the module folder. |
| `code/` | The code of every practice stage, ready to compare with yours. In Module 22: `warmup/`, `quick-win/`, `practice-1/` (the Module 10 page taken apart, plus its extra exercises), `stages/practice-2` to `practice-7` (the state of `frontend` at the end of each practice), `frontend/` (dashboard v0.1, the final state), `.github/` (the pull request template), and `challenges/key/`. In Module 23: `warmup/`, `quick-win/` (`try-live.html`), `stages/practice-1` to `practice-10` (the state of `frontend` at the end of each practice), `practice-6/` (the temporary Practice 6 test files), `frontend/` (dashboard v0.2, the final state), `.github/` (the pull request template), and `challenges/key/`. In Module 24: `warmup/`, `quick-win/` (`FirstButton.tsx` and the `DeviceDetails.tsx` that adds it), `stages/practice-1` to `practice-10` without `practice-6` (the state of `frontend` at the end of each practice; Practice 6 changes only the backend and the simulator), `backend/` (backend 1.1.0, the final state) plus `backend-1.1.diff` (its changes from v1.0), `tools/` (the simulator with the `soil` and `tank` commands) plus `tools.diff`, `frontend/` (dashboard v1.0, the final state), `user-test/` (the user test task sheet and notes sheet), `.github/` (the pull request template), and `challenges/key/`. A `.env` file is never included: copy `.env.example`, then fill in your own. |
| `assets/` | The article's images, plus `SOURCES.md`, which records the source and license of every image. |

---

[⬅️ Phase 3 — Backend & Data](../phase-3-backend-data/README.md) · [Front page](../README.md) · [Syllabus](../SYLLABUS.md) · [Progress tracker](../PROGRESS.md) · **Start: [Module 22](module-22-react-basics/README.md) ➡️**
