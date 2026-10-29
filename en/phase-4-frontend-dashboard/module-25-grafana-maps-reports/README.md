# Module 25 — Professional Visualization: Grafana, Device Maps, & Reports

🌐 **English** · [Bahasa Indonesia](../../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md)

*Phase 4 · Week 25 · Hardware: **Kit A + B** (Node 2 on a battery) or the Module 21 simulator + the **mock Garden** · **a Telegram account + the Module 19 bot** · Prerequisites: **Module 24** (dashboard v1.0 + backend 1.1 on `main`), Module 18, Module 19 (vitals & bot), Module 23 · Time: 11–13 hours, spread over the week*

[⬅️ Module 24](../module-24-control-rules-roles/README.md) · [Phase 4](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 26 ➡️](../../phase-5-operations-scale/module-26-docker-compose/README.md)

---

Module 24 ended with a dashboard v1.0 that **commands**: the admin turns on the lamp and creates watering rules, while the viewer only watches. That dashboard was made for the **residents**. [The end of Module 24](../module-24-control-rules-roles/README.md#-module-24-completion-checklist) already named who comes next: for the **technical team**, Grafana, which reads TimescaleDB and sends a Telegram alert when a node goes **silent** for more than 5 minutes, plus a device map and an automatic daily CSV report.

The ingredients were prepared long ago. Counter 3000 has been set aside for Grafana since [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#2-http-once-more-methods-routes-status-codes-and-counters). The `lat` and `lng` columns of the `devices` table have been "prepared for the device map in Phase 4" since [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#3-tables-rows-columns-types-and-the-primary-key), and `device_health` has been [collecting `vitals`](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#57-watch-the-data-arrive) (RSSI, uptime, heap) without you ever seeing them as a chart. Node-RED retired as the brain in Module 16, but this week [its dashboard from Module 13](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#5-dashboard-2-pages-groups-and-widgets) is weighed honestly next to two other dashboards. The question from [🔬 Module 13](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#-technical-deep-dive-optional), "when to buy a ready-made platform, when to build your own", is answered here too.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| RSSI, uptime, and heap are stored in the database, but their history has never been seen. | No screen reads `device_health`; `GET /devices/:id/vitals` only holds the latest reading in memory, empty again every time the backend restarts ([🚨 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-troubleshooting)). | **Grafana** next to the database: panels from SQL and one "System Health" dashboard for every device (Quick Win, Concepts 2–6, Practices 1–2) |
| If Node 2 dies, you only hear about it ±17 minutes after its last packet, and only if the backend is running. | Node 2 wakes up every 300 seconds; its `offline` status is published by Node 1 after 960 seconds without a packet, then the backend waits another 60 seconds. A status published before the backend started isn't reported. | **The "Silent node" alert** from Grafana, calculated from data that stops arriving: for Node 2, 🔴 5.5–11.5 minutes after it dies (Concept 7, Practices 3–5) |
| Grafana needs a database key, but the only key there is allows everything. | The only database account is `postgres`, which may change and delete anything. | **The read-only account `grafana_reader`**: only the columns it needs, refused when writing, without the account, session, and rule tables or the device key columns (Concept 3, Quick Win, Practice 1) |
| The `lat` and `lng` columns have existed since Module 17, but not one point has ever been shown. | Backend 1.1's `GET /devices` doesn't send them, and there's no route to fill them yet. | **Backend 1.2.0** with `lat`/`lng` and the admin route `PUT /devices/:id/location`, then **dashboard 1.1.0** with a **Map** page (react-leaflet, OpenStreetMap tiles; Concepts 8–9, Practices 6–7) |
| You only know yesterday's news if you open the dashboard. | The backend's Telegram messages are only for events as they happen; there's no summary you can keep yet. | **A daily CSV report** from the backend to Telegram at 07:00 WIB, as long as the laptop and the backend are running (Concept 10, Practices 8–9) |
| It's not clear yet when it's better to buy a ready-made platform. | That Module 13 question was postponed until you had your own system to compare with. | **Buy or build**: ready-made platforms, for example ThingsBoard, Home Assistant, Blynk, and Antares, weighed with clear criteria (Concept 11) |

At the end of the week, Grafana tells you when Node 2 stops sending, and yesterday's report waits in Telegram every morning. That's the pass requirement from the [Syllabus](../../SYLLABUS.md#module-25--professional-visualization-grafana-device-maps--reports): **Grafana sends a Telegram alert when you pull out Node 2's battery, and the daily report arrives automatically.** This module splits it into **G1** the Grafana Telegram contact point's test message arrives (the **Test** button, [4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes)), **G2** Node 2's battery pulled out of its holder → Grafana reports 🔴, put back → ✅ ([5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes) and [5.4](#54--put-it-back-two-recovery-messages-and-the-timing-sheet-10-minutes)), and **G3** the daily CSV report arrives on schedule without being touched ([9.1](#91--a-hands-off-dress-rehearsal-a-schedule-3-minutes-ahead-then-back-to-0700-15-minutes)). On the laptop path, it reads: "Grafana sends a Telegram alert when the **mock Garden** stops (`garden pull`), and the daily report arrives automatically." For Node 2, the 🔴 only arrives **5.5–11.5 minutes** after its battery is pulled out (the formula is in [Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)). The Syllabus wording of this module's *practice* was updated (v1.0.27) to RSSI, uptime, and heap of **Node 1** plus the number of packets per hour of **Node 2**, with a "**silent node**" alert, because Node 2 doesn't send `vitals` and only wakes up every 300 seconds ([Concept 6](#6-reading-device-health-rssi-uptime-heap-and-packets-per-hour)–7).

For the Mini Smart Home, the backend moves up to **1.2.0** (device locations through the API and the daily report; no migration, no new package), the dashboard to **1.1.0** (the **Map** page), there's a new **`grafana/`** folder, the simulator in `tools/` gets the **mock Garden**, and `edge/acl-broker` gets a commented block 2b for the laptop path. The data contract stays **1.4**, and the firmware of Node 1 (v1.6.0) and Node 2 (v1.0.0) doesn't change. This module ends with the 🎉 **Phase 4 checkpoint** in [Practice 10](#practice-10--the-phase-4-checkpoint-collect-the-evidence-45-minutes).

![Roadmap of Module 25. Top, the six curriculum phases; Phase 4 Dashboard (Modules 22–25) framed in purple. Modules 1–24 done; Module 25 red, marked YOU ARE HERE, the last module of Phase 4, with the purple flag 🎉 Phase 4 checkpoint at the end of this module (Practice 10). Note: two dashboards, yours for the residents, Grafana for the technical team; a silent node alert to Telegram, a device map, a daily CSV report. Module 25 this week, 11–13 hours, spread out; Kit A + B (Node 2 on a battery) or the Module 21 simulator + the mock Garden, the Module 19 Telegram bot, Module 24 dashboard v1.0 + backend 1.1. Left column: SQL and JavaScript warm-up; Quick Win, the first panel, your home temperature in Grafana; P1 a tidy and safe Grafana (read-only account grafana_reader, 127.0.0.1:3000); P2 the System Health dashboard (RSSI, uptime, heap of Node 1 + the $node variable); P3 the Garden on the technical dashboard (Node 2 packets per hour, reference 12, minutes late); P4 the Silent node alert and a Telegram contact point, G1: the Test button message arrives; P5 pull the Garden battery, G2: 🔴 after 5.5–11.5 minutes, then ✅. Right column: P6 backend 1.2, device locations through the API (lat/lng in GET /devices, PUT /devices/:id/location); P7 the Map page with react-leaflet (OpenStreetMap tiles, colors follow the live status); P8 backend 1.2, a daily CSV report to Telegram; P9 a report that arrives by itself, Grafana as files, G3: a schedule ±3 minutes ahead, hands off; P10 🎉 the Phase 4 checkpoint (quizzes, the Module 24 user test, phone demo video, Grafana JSON); Add-on: the pull request Technical dashboard + map + daily report (Phase 4 checkpoint). Every practice and the pull request carry a star. Bottom, the pass requirement (split of the Syllabus ✅): G1 the Grafana Telegram contact point test message arrives (the Test button); G2 Node 2 battery pulled out (laptop path: the mock Garden, garden pull), Grafana reports 🔴, put back ✅; G3 the daily CSV report arrives on schedule without being touched; the Syllabus ✅ sentence, unchanged in v1.0.27: Grafana sends a Telegram alert when you pull out Node 2's battery, and the daily report arrives automatically. Proven in: G1 Practice 4, G2 Practice 5, G3 Practice 9, all three ticked again in Practice 10. New practice wording (Syllabus v1.0.27): System Health = RSSI, uptime, heap of Node 1 + packets per hour of Node 2; the silent node alert = Node 1 more than 5 minutes without data, Node 2 more than 5 minutes past its wake-up schedule (every 300 seconds). Two data paths: the devices (Kit A + B, Node 2 18650 battery) or the laptop (simulator f00d00000001 + mock Garden f00d000000b2, garden pull). Changed: backend 1.2.0, frontend 1.1.0, new grafana/, tools/, edge/acl-broker; unchanged: data contract 1.4, firmware, database tables. Grafana always on the laptop, http://localhost:3000, by default this laptop only; your dashboard http://localhost:5173.](assets/roadmap-module-25.png)

> [!NOTE]
> **How to use this module.**
>
> - **Two data paths, one Grafana.** **The device path**: Node 1 and Node 2 (**Kit A + B**) through the broker on the Pi; Node 2 runs on an 18650 battery that can be pulled out of its holder. **The laptop path**: Mosquitto on the laptop and the Module 21 simulator (`f00d00000001`), which this week brings the **mock Garden** `f00d000000b2`: a fake Node 2 that wakes up every 300 seconds and "has its battery pulled out" with `garden pull` ([5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes)). On **both** paths, Grafana lives on the laptop, next to the database ([Concept 2](#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway)), and is opened at `http://localhost:3000`. The dashboard you built stays at `http://localhost:5173`.
> - **A direct continuation of Module 24.** Dashboard v1.0 and backend 1.1 on `main`, the Bruno collection, `tools/.env`, and the `admin@home.test` and `viewer@home.test` accounts from Module 20 are used as they are. Grafana has its own `admin` account, separate from the dashboard accounts. This week's work lives on the `feature/grafana-maps-reports` branch, and the results can be compared with `code/stages/practice-N` (Practices 2, 3, 6, 7, and 8).
> - **Evidence table**: where each requirement is proven, and what shows it. All three are ticked again in [10.4](#104--the-final-dress-rehearsal-backend-tests-the-frontend-build-and-the-three-pass-requirements-20-minutes).
>
>   | Requirement | Proven in | What you see |
>   | :-: | :-- | :-- |
>   | G1 | [4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes) | the message `🔴 Notification test` from your bot |
>   | G2 | [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes) and [5.4](#54--put-it-back-two-recovery-messages-and-the-timing-sheet-10-minutes) | `🔴 Garden (mock) (f00d000000b2) is not sending data, 5.8 minutes behind schedule`, then `✅ Garden (mock) is sending data again.` (the names and numbers follow your device) |
>   | G3 | [9.1](#91--a-hands-off-dress-rehearsal-a-schedule-3-minutes-ahead-then-back-to-0700-15-minutes) | the backend log `daily report running on schedule`, then the file `report-YYYY-MM-DD.csv` from your bot |
>
> - **The 🖥️ box of every practice names its tools**: **VS Code** with the `backend` terminal (`npm run dev`, counter 8080), `frontend` (Vite, counter 5173), and on the laptop path `tools` (the simulator) and the broker; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with the `smarthome-db` and `smarthome-grafana` containers; **Chrome or Edge** with Grafana at `http://localhost:3000`; **Bruno**; and **the Telegram app**.
> - **The Expected output boxes.** Outputs and screenshots were recorded by the author on a **Raspberry Pi 5 with Ubuntu 26.04.1 LTS (arm64)** playing the laptop, like English Module 24 (Modules 17–23 were recorded on Windows 11): Docker Engine 29.1.3, Node.js 24.21.0, npm 11.19.0, and Chrome 156.0.8078.47, against a real backend, database, and Grafana 13.2.4. The `docker`, SQL, npm, Bruno, and Grafana screens are the same on Windows, macOS, and Linux (the module's commands deliberately avoid `<`, `>`, `$(…)`, and bind mounts), but **Docker Desktop, PowerShell, and the Bruno app were not recorded by the author**. Telegram in the author's lab is a **mock Bot API server** without a real token (as in [🔬 Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#-technical-deep-dive-optional)), so the message boxes hold the text that mock received, with no screenshots of the Telegram app. The data come from the simulator, the mock Garden, and the `npm run seed-history` history, so the sensor numbers are **examples**; the times, seconds, and file sizes on your screen will differ. Times are written in WIB, and IPs as `192.168.1.10` (details in [📚 Sources](#-sources--image-credits)).
> - **Honest status: the author hasn't tested with a real Telegram, Node 2, or phone.** G1–G3 with your own bot, Node 2 with a real 18650 battery, the demo video from a phone (Practice 10), the CSV in Excel, and Docker Desktop weren't run by the author. All of that is your job; don't tick an item in [✅](#-module-25-completion-checklist) that hasn't really happened.
> - According to the Syllabus, this is the last module of [the path without a Pi](../../SYLLABUS.md#53-kit-b--raspberry-pi-as-the-gateway-needed-from-module-12); the laptop path above is enough to pass.
> - macOS users: replace **Ctrl** with **Cmd** for VS Code and browser shortcuts. **Except in the terminal:** stopping a program is still **Ctrl + C**, on a Mac too.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **Grafana is for this laptop only.** Its counter is `127.0.0.1:3000`, and the `admin` password is changed at the first login with **Submit**, not **Skip** ([Quick Win Step 3](#step-3--log-in-for-the-first-time-and-change-the-admin-password-submit-not-skip-3-minutes), [1.3](#13-grafanas-door-401-without-logging-in-only-from-this-laptop-no-sharing-outside-5-minutes)). Already pressed **Skip**, or forgot the password: [🚨](#-troubleshooting).
> 2. **Grafana reads the database with `grafana_reader`, never with `postgres`** ([Concept 3](#3-the-smallest-possible-rights-grafana-may-only-read), [Quick Win Step 4](#step-4--the-read-only-database-account-grafana_reader-6-minutes), [1.4](#14--test-grafana_reader-in-psql-reading-allowed-writing-refused-10-minutes)).
> 3. **The bot token only in `backend/.env` and in the Grafana contact point**, never in JSON, Git, or a screenshot. The **BOT API Token** field shows the token in **plain text** while you type, so don't screenshot or record that form ([4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes), [10.2](#102-a-6090-second-phone-demo-video-the-script-and-what-must-not-be-recorded-15-minutes)).
> 4. **Home coordinates are personal data.** The module's examples use a fictional point around Monas, Jakarta; round or blur real coordinates before a screenshot is uploaded ([Concept 8](#8-maps-coordinates-tiles-and-attribution), [6.4](#64--version-120-docs-and-the-bruno-request-set-device-location-200-403-400-10-minutes)).
> 5. **OpenStreetMap tiles: the attribution must be visible, and no bulk downloads.** The usage policy of the OSM tile servers forbids bulk downloads and offline use ([Concept 8](#8-maps-coordinates-tiles-and-attribution), [7.2](#72-mapts-and-devicemaptsx-tiles-attribution-and-markers-colored-by-status-22-minutes)).
> 6. **npm packages and Docker images at their written versions**: `grafana/grafana:13.2.4`, `leaflet@1.9.4 react-leaflet@5.0.0`, and `-D @types/leaflet@1.9.22`. As of 26 October 2026, react-leaflet's documentation command (`react-leaflet@next`) installs an old test version (RC), and an image without a tag installs the latest release, whose menus may differ ([🧰](#-what-you-need), [Quick Win Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes), [7.1](#71-three-map-packages-at-their-written-versions-then-lat-and-lng-in-typests-8-minutes), [🚨](#-troubleshooting)).

Like Modules 16–24, this module opens with the [🔁 SQL & JavaScript warm-up](#-sql--javascript-warm-up-40-minutes), this time as groundwork for alerts, reports, and CSV files. The first day only needs the warm-up, the [🏆 Quick Win](#-quick-win-the-first-panel-your-homes-temperature-in-grafana-25-minutes) (the first temperature panel in Grafana), Concepts 1–3, and [Practice 1](#practice-1--a-tidy-and-safe-grafana-30-minutes). The eleven concepts are read alternately with their practices; the order is at the start of [🧠](#-the-why-concepts). The fold-out sections under [🚨](#-troubleshooting) are opened when you need them; the fold-out sections under [🔬](#-technical-deep-dive-optional) may be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 SQL & JavaScript warm-up (40 minutes)](#-sql--javascript-warm-up-40-minutes)
4. [🏆 Quick Win: the first panel, your home's temperature in Grafana (25 minutes)](#-quick-win-the-first-panel-your-homes-temperature-in-grafana-25-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Two dashboards, two audiences](#1-two-dashboards-two-audiences-three-tools-you-already-have) · [2 Grafana next to the database](#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway) · [3 The smallest rights](#3-the-smallest-possible-rights-grafana-may-only-read) · [4 Anatomy of a panel](#4-anatomy-of-a-panel-sql-time-macros-units-and-thresholds) · [5 Variables](#5-variables-one-dashboard-for-every-device) · [6 Device health](#6-reading-device-health-rssi-uptime-heap-and-packets-per-hour) · [7 Alerts when needed](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline) · [8 Maps](#8-maps-coordinates-tiles-and-attribution) · [9 Location through the API](#9-a-location-is-device-data-an-api-not-something-stuck-on-the-screen) · [10 Daily report](#10-the-daily-report-it-arrives-by-itself-every-morning-as-long-as-the-backend-is-running) · [11 Buy or build](#11-buy-or-build-ready-made-iot-platforms)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 A tidy and safe Grafana](#practice-1--a-tidy-and-safe-grafana-30-minutes) · [2 System Health](#practice-2--the-system-health-dashboard-rssi-uptime-heap-and-the-node-variable-50-minutes) · [3 The Garden on the dashboard](#practice-3--the-garden-on-the-technical-dashboard-packets-per-hour-and-minutes-late-35-minutes) · [4 The Silent node alert](#practice-4--the-silent-node-alert-and-a-telegram-contact-point-55-minutes) · [5 Pull the Garden's battery](#practice-5--pull-the-gardens-battery-alert-and-recovery-45-minutes) · [6 Backend 1.2: location](#practice-6--backend-12-device-locations-through-the-api-45-minutes) · [7 The Map page](#practice-7--the-map-page-with-react-leaflet-60-minutes) · [8 CSV report](#practice-8--backend-12-a-daily-csv-report-to-telegram-60-minutes) · [9 Automatic report and export](#practice-9--a-report-that-arrives-by-itself-then-grafana-as-files-35-minutes) · [10 Phase 4 checkpoint](#practice-10--the-phase-4-checkpoint-collect-the-evidence-45-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-25-completion-checklist)

## 🎯 After this module you can…

1. **Install Grafana 13.2.4 next to the database** with one `docker run` and the `smarthome` hallway (network), then guard its door: only `127.0.0.1:3000`, the admin password changed through **Submit**, no sharing outside.
2. **Give Grafana the read-only database account `grafana_reader`** (rights per table and column, read-only transactions, a 10-second limit), then prove in psql that this account is refused when it writes.
3. **Make panels from SQL**: the time macros `$__timeFilter` and `$__timeGroupAlias`, Format `Time series`, units, and thresholds, while understanding why the query is in UTC but the screen in WIB.
4. **Assemble a "System Health" dashboard for every device** with the `$node` variable: Node 1's RSSI, uptime, and heap, Node 2's packets per hour, and the minutes behind schedule.
5. **Read device health from its charts**: a Wi-Fi signal getting weaker, uptime that drops (the device restarted), and heap that keeps falling (a memory leak).
6. **Create a "Silent node" alert** that measures data that stops arriving, not the `offline` status, then sends it to Telegram through a contact point with your own message template.
7. **Tell the backend's 📴 message apart from Grafana's 🔴 alert** ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)): the first means "connection lost", for the residents; the second "data stopped arriving", for the technical team. When Node 2's battery (or the mock Garden's) is pulled out, you measure it yourself: 🔴 arrives 5.5–11.5 minutes after the pull, 📴 ±17 minutes after the last packet.
8. **Move the backend up to 1.2.0**: `lat`/`lng` join `GET /devices`, and the admin route `PUT /devices/:id/location` refuses wrong coordinates with `400` and viewer accounts with `403`.
9. **Draw a Map page** in dashboard 1.1.0 with react-leaflet: OpenStreetMap tiles with their attribution, green or gray markers by live status, for admin and viewer, also on a phone-wide screen.
10. **Send a daily CSV report to Telegram** at 07:00 WIB from the backend, and be honest about its limits: only while the laptop and the backend are running, and a missed report isn't sent afterwards.
11. **Keep Grafana as files in Git** (dashboard JSON, rule YAML as an archive), choose the right dashboard among Node-RED, React, and Grafana, weigh ready-made IoT platforms, then close the 🎉 Phase 4 checkpoint.

## 🧰 What you need

| What you need | Notes |
| :--- | :--- |
| **The result of Module 24** | Dashboard v1.0 (`1.0.0`) and backend 1.1.0 on `main`, the Bruno collection with `backend/bruno/.env`, `tools/.env`, and the `admin@home.test` and `viewer@home.test` accounts. The backend moves up to 1.2.0 in Practices 6 and 8, the dashboard to 1.1.0 in Practice 7. |
| **Docker and `smarthome-db`** | Docker Desktop (Windows, macOS; not recorded by the author) or Docker Engine (Linux) running, `smarthome-db` alive, and new readings still coming in. Keep ±2 GB of disk space free for the Grafana image. |
| **The Module 19 Telegram bot** | `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` filled in `backend/.env`, the bot [greeted with `/start`](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#66-meet-your-bot-start-and-chat_id), and the Telegram app installed. The backend and Grafana use the same bot ([4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes)). |
| **A data path** (choose one) | **The device path:** Node 1 and Node 2 (Kit A + B) through the broker on the Pi; Node 2 registered (`register Node 2 via Node 1`, Module 21) and on an 18650 battery in its holder. **The laptop path:** Mosquitto on the laptop and the simulator `f00d00000001`; its new version, which brings the **mock Garden**, is installed in [5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes). |
| **Node.js 24, VS Code, Git, Bruno** | The same as Module 24; the `learn-iot` repository (folder `module-25`) for 🔁 and ➕ G. |
| **Chrome or Edge** | Grafana at `http://localhost:3000`, the dashboard at `http://localhost:5173`, and DevTools device mode. The author only tested Chrome. |
| **Spreadsheet** | Excel or LibreOffice Calc with English (US/UK) regional settings to open the CSV (8.5); the author tested neither. |
| **Phone** (optional) | For the checkpoint demo video ([10.2](#102-a-6090-second-phone-demo-video-the-script-and-what-must-not-be-recorded-15-minutes)) and the *Grafana from a phone* box; the author didn't record from a phone. |
| **Internet and a GitHub account** | For `docker pull`, `npm install`, map tiles, and Telegram; GitHub for the pull request in ➕ F. |

**Download the Grafana image now**, before the first day. The download is ±445 MB for arm64 processors, for example an Apple silicon Mac (the author didn't measure it for Intel/AMD laptops), and its time isn't counted in [Quick Win Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes). With Docker running, type in any terminal (for example the VS Code terminal):

```text
docker pull grafana/grafana:13.2.4
```

Wait until the prompt comes back, then check:

```text
docker image ls --digests grafana/grafana
```

**Expected output** (example, an arm64 image in the author's lab):

```text
REPOSITORY        TAG       DIGEST                                                                    IMAGE ID       CREATED       SIZE
grafana/grafana   13.2.4    sha256:dbbc38ea21103cefb50396340cd88afec779c7e070b0a7bf5a75b4ce46651d3f   dbbc38ea2110   2 weeks ago   1.81GB
```

What matters is that the `TAG` is `13.2.4`; the other columns may differ on your laptop. Like the TimescaleDB image in Module 17, its size on disk is much bigger than its download.

Versions used in this module (October 2026):

| Component | Version | Notes |
| :--- | :--- | :--- |
| Grafana OSS | **13.2.4** (`grafana/grafana`) | AGPLv3 license; the `grafana/grafana-oss` image of older tutorials stopped at 13.0.2 (June 2026) |
| TimescaleDB | `2.30.2-pg17` | unchanged since Module 17; the migrations don't change |
| leaflet, react-leaflet | **1.9.4**, **5.0.0** | new in dashboard 1.1.0; their licenses are discussed in Concept 8 |
| @types/leaflet | **1.9.22** | TypeScript types for leaflet (`-D`) |
| node-cron, grammY | 4.6.0, 1.46.0 | already there; backend 1.2.0 has **no new package** |
| Node.js | 24 | the author: 24.21.0 with npm 11.19.0 |

The Module 22–24 packages aren't upgraded (react 19.3.1, vite 8.3.5, react-router 8.5.0, zod 4.6.7, and others). The map packages are installed at their written versions in the `frontend` folder in [7.1](#71-three-map-packages-at-their-written-versions-then-lat-and-lng-in-typests-8-minutes), not now:

```text
npm install leaflet@1.9.4 react-leaflet@5.0.0
npm install -D @types/leaflet@1.9.22
```

**The time** is ±11.5 hours, not counting downloads and waiting: warm-up 40 minutes, Quick Win 25, concepts ±110, practices 460, ➕ 30, and the quiz 20.

## 🔁 SQL & JavaScript warm-up (40 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, **Docker Desktop** or **Docker Engine** with `smarthome-db` running (psql inside it), and **Node.js 24**.

Five small skills for alerts, the daily report, and CSV: three in SQL, two in JavaScript, practiced without Grafana and the backend. **Later in …** points to where each one is used.

**Prepare the folder.** Create a **`module-25`** folder in the **`learn-iot`** repository, then in the VS Code terminal:

```text
cd module-25
npm init -y
npm pkg set type=module
```

Create **`warmup.sql`** and **`warmup.js`** there; their contents are in the **The full contents** folds after Steps 3 and 5 (or **Copy raw file** from [`code/warmup/`](code/warmup/)). For Steps 1–3, enter psql as in Module 17:

```text
docker exec -it smarthome-db psql -U postgres -d smarthome
```

The superuser account `postgres` is only for you; Grafana never holds it ([Concept 3](#3-the-smallest-possible-rights-grafana-may-only-read)). For each step, copy the query under `-- Step N.` into psql, press **Enter**, then compare it with the **Result**.

### Step 1 — Every device's last reading: `GROUP BY`, `count(*)`, and `max(received_at)`

An alert asks, "When was this device last heard?" **`GROUP BY device_id`** collects the `readings` rows per device; **`count(*)`** counts the rows, and **`max(received_at)`** picks the newest one. `received_at` = the **server** clock when the reading arrived (`ts` = the device clock). **Expected output (example):**

```text
  device_id   | reading_count |         last_received
--------------+---------------+-------------------------------
 f00d00000001 |          1046 | 2026-10-26 20:33:44.067802+00
 f00d00000002 |          1029 | 2026-10-26 20:20:35.663888+00
 f00d000000b2 |             1 | 2026-10-26 20:31:48.381385+00
(3 rows)
```

`+00` = UTC, seven hours behind WIB (Module 17): `20:33` on the 26th = 03:33 WIB on the 27th. The mock Garden `f00d000000b2` only exists after 5.1; on the device path, there are also rows for your Node 1 and Node 2.

### Step 2 — How many minutes ago: an interval, `EXTRACT`, and `round`

An alert's threshold is in minutes. `now() - max(received_at)` = an **interval**. **`EXTRACT(EPOCH FROM …)`** turns it into seconds, divided by 60 it becomes minutes, and **`round(…, 1)`** keeps one decimal place. **Expected output (example):**

```text
  device_id   | minutes_ago
--------------+-------------
 f00d00000001 |         0.2
 f00d00000002 |        13.3
 f00d000000b2 |         2.1
(3 rows)
```

In the author's lab, `f00d00000001` was running: its number is close to 0. `f00d00000002` wasn't running: it only holds the `npm run seed-history` history, whose `received_at` is the time that script was run (03:20 WIB), so its number keeps rising.

**Later in Grafana:** Steps 1 and 2 become the query of the "Silent node" alert: the `received_at` of every device's latest reading, the same minutes formula minus 5 for Node 2, threshold `> 5`. That query also fills the table in [3.2](#32--the-minutes-late-table-the-same-query-as-the-alert-plus-a-temporary-last_seen-column-15-minutes) ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)).

### Step 3 — "Yesterday" by the WIB clock: `date_trunc` and `AT TIME ZONE`

The 07:00 WIB report contains **yesterday** (00:00–24:00 WIB), but the database stores UTC. Read it from the inside out: `now() AT TIME ZONE 'Asia/Jakarta'` = the Jakarta wall clock now; **`date_trunc('day', …)`** = cut to 00:00 today; `- INTERVAL '1 day'` = 00:00 yesterday; **`AT TIME ZONE`** once more = that wall-clock time turned into a real point in time. **Expected output (example):**

```text
       from_time        |        to_time
------------------------+------------------------
 2026-10-25 17:00:00+00 | 2026-10-26 17:00:00+00
(1 row)
```

17:00 UTC = 00:00 WIB the next day: the range is 26 October 00:00–24:00 WIB, although at that moment (03:33 WIB on the 27th) the UTC date was still the 26th. The second query adds up yesterday's readings from `readings_hourly` (Module 18). **Expected output (example):**

```text
  device_id   | readings_yesterday
--------------+--------------------
 f00d00000001 |                144
 f00d00000002 |                144
(2 rows)
```

Leave psql with `\q`.

**Later in the backend:** `reportRange()` in `services/reports.ts` calculates the same range in JavaScript (the author's lab, at the same moment: `2026-10-25T17:00:00.000Z 2026-10-26T17:00:00.000Z`), then the report reads `readings_hourly` with the same `>=` and `<` ([8.2](#82-servicesreportsts-yesterdays-wib-range-one-query-and-a-schedule-18-minutes), [Concept 10](#10-the-daily-report-it-arrives-by-itself-every-morning-as-long-as-the-backend-is-running)).

<details>
<summary>The full contents of <code>warmup.sql</code></summary>

```sql
-- warmup.sql - an SQL warm-up before Module 25 (steps 1-3). Three small skills that Grafana and the daily report use later:
-- each device's latest reading, "how many minutes ago?", and the "yesterday" range by the WIB clock.
-- Run it in psql as in Module 17:  docker exec -it smarthome-db psql -U postgres -d smarthome
-- then paste one step at a time (every query ends with a semicolon).

-- Step 1. The latest reading of each device. GROUP BY collects the rows per device_id; count(*) counts the rows,
-- max(received_at) picks the newest time. received_at = the SERVER's clock when the reading arrived (Module 17), ts = the device's clock.
SELECT device_id, count(*) AS reading_count, max(received_at) AS last_received
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Step 2. How many minutes ago? now() - a time = an interval. EXTRACT(EPOCH FROM interval) = that interval in
-- seconds; divided by 60 = minutes. round(number, 1) = one digit after the decimal point; this kind of round needs the numeric
-- type, so the division result is converted first with ::numeric. This is the groundwork for the "silent node" alert in Grafana.
SELECT device_id,
       round((EXTRACT(EPOCH FROM now() - max(received_at)) / 60)::numeric, 1) AS minutes_ago
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Step 3. The "yesterday" range by the WIB clock, the groundwork for the daily report.
--   now() AT TIME ZONE 'Asia/Jakarta'   = the wall clock in Jakarta now (without a time zone)
--   date_trunc('day', …)                = cut to 00:00 today (WIB)
--   - INTERVAL '1 day'                  = 00:00 yesterday (WIB)
--   … AT TIME ZONE 'Asia/Jakarta'       = that WIB wall-clock time turned back into a real time (timestamptz)
-- psql prints a real time in its session's zone. In the database container the zone is UTC, so 00:00 WIB is printed as 17:00:00+00
-- the day before: the same moment, only written differently.
SELECT (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta' AS from_time,
       date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta' AS to_time;

-- Yesterday's number of readings of each device, from the hourly summary book readings_hourly (Module 18). "to_time" is not counted
-- (the < sign), so that 00:00 today isn't counted twice (yesterday and today).
SELECT device_id, sum(reading_count) AS readings_yesterday
FROM readings_hourly
WHERE hour >= (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta'
  AND hour <  date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
GROUP BY device_id
ORDER BY device_id;
```

</details>

### Step 4 — One CSV row, English style: commas, a decimal point, and empty cells

The CSV recipe of [Module 23](../module-23-realtime-dashboard/README.md#step-5--csv-text-for-excel-commas-decimal-points-and-quotes) as pure functions in the `// 4.` part: **`quote()`** wraps a text in quotes when it contains `,` or `"`, **`cell()`** turns one value into text (a number keeps its decimal point, so `28.5` stays `28.5`; `null` → an empty cell), and **`csvRow()`** joins the cells with `,`. In the terminal (folder `module-25`), run `node warmup.js`. **Expected output** (first part):

```text
--- 4. One CSV row, English style
device_id,name,avg_temp,avg_rssi
f00d00000001,"Node 1, living room",28.5,-67
f00d000000b2,Garden,27,
```

The Garden doesn't send `vitals`, so its RSSI cell is empty, not `0`.

**Later in the backend:** `quote()` and `cell()` move to `services/csv.ts`, joined by `toCsv()` for many rows ([8.1](#81-servicescsvts-module-23s-csv-recipe-moves-to-the-server-12-minutes)).

### Step 5 — Text becomes a file: `Buffer.from`, a three-byte BOM, and `ENOENT`

Telegram receives a **file**, that is, a series of bytes. In the `// 5.` part, **`Buffer.from(content, "utf8")`** turns text into bytes. The `"\uFEFF"` at the start = the **BOM**, an invisible sign that the content is UTF-8: one character, three bytes. **Expected output** (second part):

```text
--- 5. Text becomes a file
characters: 40 | bytes: 42 | first 3 bytes: <Buffer ef bb bf>
"°" = 1 character, 2 bytes
text taken as a file name -> ENOENT
```

The difference of 2 = the BOM: 1 character, 3 bytes (`ef bb bf`). The last line = the trap: `readFileSync(content)` takes the CSV text as a **file name**, and Node answers `ENOENT` (no such file).

**Later in the backend:** `sendFile()` in `telegram.ts` gives grammY the bytes together with their name, `new InputFile(Buffer.from(content, "utf8"), name)`; `new InputFile("text…")` fails for the same reason ([8.3](#83-sendfile-in-telegramts-an-inputfile-from-bytes-not-from-text-8-minutes), [🚨](#-troubleshooting) *`ENOENT` …*).

<details>
<summary>The full contents of <code>warmup.js</code></summary>

```js
// warmup.js - a JavaScript warm-up before Module 25 (steps 4-5). Two small skills that the daily report in the backend uses
// later: one CSV row in English style, and text that becomes a file (bytes). Run it with: node warmup.js
import { readFileSync } from "node:fs";

// 4. One CSV row in English style (Module 23's csv.ts recipe): a comma separator, a decimal point, an empty cell for null,
//    and text containing , or " wrapped in double quotes. "Pure" functions: input -> text, no database, no network.
console.log("--- 4. One CSV row, English style");
function quote(text) {
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
function cell(value) {
  if (value === null) return ""; // there is no data (for example Node 2 without vitals): an empty cell, NOT 0
  if (typeof value === "number") return String(value); // 28.5 stays "28.5"
  return quote(value);
}
function csvRow(values) {
  return values.map(cell).join(",");
}
console.log(csvRow(["device_id", "name", "avg_temp", "avg_rssi"]));
console.log(csvRow(["f00d00000001", "Node 1, living room", 28.5, -67]));
console.log(csvRow(["f00d000000b2", "Garden", 27, null])); // 27 stays "27"; null -> an empty cell at the end of the row

// 5. Text becomes a file. Telegram receives a FILE (a series of bytes), not text. Buffer.from(text, "utf8") = text -> bytes.
//    "\uFEFF" = BOM: ONE character you can't see, but THREE bytes (EF BB BF). A character like ° is more than one byte too.
console.log("--- 5. Text becomes a file");
const content = "\uFEFF" + csvRow(["device_id", "avg_temp"]) + "\r\n" + csvRow(["f00d00000001", 28.5]) + "\r\n";
const file = Buffer.from(content, "utf8");
console.log("characters:", content.length, "| bytes:", file.length, "| first 3 bytes:", file.subarray(0, 3));
console.log('"°" =', "°".length, "character,", Buffer.from("°", "utf8").length, "bytes");
// Trap: many functions take TEXT as a FILE NAME on the disk. readFileSync(content) looks for a file named
// "\uFEFFdevice_id,avg_temp..." -> error ENOENT (no such file). new InputFile("text…") in grammY (the Telegram bot)
// behaves the same; the cure: give it the bytes, new InputFile(Buffer.from(content, "utf8"), "report.csv").
try {
  readFileSync(content);
} catch (err) {
  console.log("text taken as a file name ->", err.code);
}
```

</details>

<details>
<summary>Self-test answer key</summary>

1. **Step 3 without both `AT TIME ZONE`: which range comes out at 03:33 WIB on the 27th?** The UTC day: 25 Oct 07:00 to 26 Oct 07:00 WIB. The day is wrong, and the boundaries fall at 07:00 too.
2. **Step 4: replace `null` in the Garden row with `0`.** `f00d000000b2,Garden,27,0`: an RSSI of 0 dBm looks real, although there's no data.
3. **Step 5: remove `"\uFEFF" + ` from the `const content` line.** `characters: 39 | bytes: 39 | first 3 bytes: <Buffer 64 65 76>`: without the BOM, one character = one byte (`d`, `e`, `v`).

Put back every line you changed.

</details>

## 🏆 Quick Win: the first panel, your home's temperature in Grafana (25 minutes)

> 🖥️ **Tools used:** **VS Code** in the `mini-smart-home` folder with your data path's terminals and one free terminal; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` running; and **Chrome** or **Edge**.

Twenty-five minutes from now, Grafana runs next to the database, reads TimescaleDB with an account that may only read, then draws the temperature of every device you have. You already downloaded its image in [🧰](#-what-you-need) (if not, Step 2 downloads it). So that the lines keep growing, start your data path as in the [Module 24 Quick Win](../module-24-control-rules-roles/README.md#step-1--start-everything-then-log-in-as-admin-4-minutes) (Node 1, or the broker and the simulator, then the backend). The reason behind every step is in Concepts 2–4.

### Step 1 — The `smarthome` hallway between containers, just once (2 minutes)

Inside a container, `localhost` means that container itself. So Grafana and the database meet in a Docker **hallway** (network), where they call each other by name ([Concept 2](#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway)). In the VS Code terminal, create the hallway:

```text
docker network create smarthome
```

**Expected output (example):** the ID of your new hallway, which will certainly differ:

```text
41f9f7ef6cb812a6286db24d7ab0ca3073e9ab1e8c0d1eb4b054055951a8e297
```

Then connect the running database, without stopping it:

```text
docker network connect smarthome smarthome-db
```

This command succeeds silently, with no output. The connection is stored in the database container, so once is enough.

### Step 2 — Start Grafana with one `docker run` (3 minutes)

Copy this command into the terminal **as one line**, then press **Enter**. It has no password, so there's nothing to edit as in Module 17:

```text
docker run -d --name smarthome-grafana --network smarthome -p 127.0.0.1:3000:3000 -e GF_PLUGINS_PREINSTALL_DISABLED=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_SNAPSHOTS_EXTERNAL_ENABLED=false -e GF_PUBLIC_DASHBOARDS_ENABLED=false -v smarthome-grafana-data:/var/lib/grafana --restart unless-stopped grafana/grafana:13.2.4
```

In short: the container `smarthome-grafana` enters the `smarthome` hallway, counter 3000 is for this laptop only, no plugin downloads and no statistics sent out, and its content lives in the cupboard `smarthome-grafana-data`.

**Expected output (example):** the ID of your new container.

```text
c462533d5744b594ac495f074424da7d1a6674d94ee9a19b0f22d9776de47c04
```

Wait ±10 seconds, then ask about its health (macOS and Linux: `curl`, without `.exe`):

```text
curl.exe http://localhost:3000/api/health
```

**Expected output (the author's lab: `curl` on Linux):**

```text
{
  "database": "ok",
  "version": "13.2.4",
  "commit": "0e79aef9d91abf3bdadae9af15763029072fb45b"
}
```

No answer yet? Wait a moment, then try again. Finally, prove that no plugin was downloaded:

```text
docker exec smarthome-grafana du -sh /var/lib/grafana/plugins
```

**Result:** `4.0K  /var/lib/grafana/plugins`, an empty folder (without `GF_PLUGINS_PREINSTALL_DISABLED`: ±290 MB). Does `docker run` answer with an error? See [🚨](#-troubleshooting) *The Grafana `docker run` fails …* and *Port 3000 is already in use …*.

### Step 3 — Log in for the first time and change the admin password: Submit, not Skip (3 minutes)

1. In Chrome or Edge, open **`http://localhost:3000`**. `Welcome to Grafana` appears, with the fields **Email or username** and **Password**.
2. Fill in `admin` for both, then click **Log in**.
3. The **Update your password** screen says `Continuing to use the default password exposes you to security risks.` Type a new password in **New password** and **Confirm new password**, then click **Submit**.

Don't **Skip**: the `admin` password stays valid if you skip this. Keep your new password in a password manager, not in the repository.

**Result:** the home page with `Welcome to Grafana.`, `Create your first dashboard`, and `Latest from the blog` (a news feed from grafana.com, Concept 2). Already pressed **Skip**, or forgot the password: [🚨](#-troubleshooting) *You forgot the Grafana admin password …*.

### Step 4 — The read-only database account `grafana_reader` (6 minutes)

Grafana must not hold `postgres`, the Module 17 superuser ([Concept 3](#3-the-smallest-possible-rights-grafana-may-only-read)). Its new account is written as an SQL file in your project, without a password, so it's safe in Git. In VS Code's Explorer panel, right-click the empty space below the file list → **New Folder…**, and name it **`grafana`**. Right-click that folder → **New File…**, name it **`grafana-user.sql`**, type its content (or **Copy raw file** from [`code/grafana/grafana-user.sql`](code/grafana/grafana-user.sql)), then save (**Ctrl + S**):

```sql
-- grafana-user.sql - a database account ONLY for Grafana that can only READ (Module 25).
-- Run it ONCE in psql as postgres (how: grafana/README.md). This file deliberately has NO password: the password is typed
-- afterwards with \password grafana_reader, so that it is never stored in Git or in the terminal history.
-- Two layers of protection: (1) every transaction of this account is read-only, (2) its rights are only SELECT on the tables and columns below.

CREATE ROLE grafana_reader LOGIN CONNECTION LIMIT 5;               -- may log in, at most 5 connections at once
ALTER ROLE grafana_reader SET default_transaction_read_only = on;  -- every transaction of it is read-only
ALTER ROLE grafana_reader SET statement_timeout = '10s';           -- a runaway panel query is stopped after 10 seconds
GRANT CONNECT ON DATABASE smarthome TO grafana_reader;
GRANT USAGE ON SCHEMA public TO grafana_reader;
GRANT SELECT ON readings, readings_hourly, device_health, events, commands TO grafana_reader;
-- devices: only these columns, WITHOUT key_hash and key_created_at (Grafana doesn't need to see device key fingerprints).
-- As a result SELECT * FROM devices is refused (permission denied): in Grafana, always write the column names.
GRANT SELECT (device_id, kind, name, location, lat, lng, status, last_seen, created_at, registered_at, revoked_at, linked_via)
  ON devices TO grafana_reader;
-- users, sessions, rules, schema_migrations: NOT granted (password fingerprints and session tokens must not be readable by Grafana)
```

psql inside the container can't see your laptop's folders, so the file is copied in first. In the terminal, from the `mini-smart-home` folder:

```text
docker cp grafana/grafana-user.sql smarthome-db:/tmp/grafana-user.sql
```

**Result:** `Successfully copied 3.07kB to smarthome-db:/tmp/grafana-user.sql`. Then run the file as `postgres`:

```text
docker exec smarthome-db psql -U postgres -d smarthome -f /tmp/grafana-user.sql
```

**Expected output:**

```text
CREATE ROLE
ALTER ROLE
ALTER ROLE
GRANT
GRANT
GRANT
GRANT
```

If you run it again, its first line becomes `psql:/tmp/grafana-user.sql:6: ERROR:  role "grafana_reader" already exists`. That's normal; the other lines still apply. Finally, give this account its own password (not the `postgres` password):

```text
docker exec -it smarthome-db psql -U postgres -d smarthome -c "\password grafana_reader"
```

**Expected output:**

```text
Enter new password for user "grafana_reader":
Enter it again:
```

Type the password twice (the letters aren't shown and don't go into the terminal history), then note it in your password manager for Step 5.

### Step 5 — A PostgreSQL data source through the hallway: `smarthome-db:5432` (5 minutes)

A data source is Grafana's connection to a database. Back in Grafana:

1. Left menu **Connections** → **Data sources** → **Add data source**, type `PostgreSQL` in the search box, then click the **PostgreSQL** card. Grafana immediately creates a data source named `grafana-postgresql-datasource` and opens its form.
2. Fill in **Host URL** `smarthome-db:5432` (the container's name in the hallway, always 5432 even if your counter is 5433; not the field's example `localhost:5432`), **Database name** `smarthome`, **Username** `grafana_reader`, and **Password** from Step 4.
3. **TLS/SSL Mode**: change `require` to `disable`; the connection through the hallway doesn't leave your laptop.
4. **Additional settings**: turn on the **TimescaleDB** switch (**Version** fills itself in with `17`).
5. **Connection limits**: change **Max open** from `100` to `4`, because this account may only have 5 connections (Concept 3; 🚨 *`too many connections …`*).
6. Click **Save & test**.

**Result:** the green box `Database Connection OK`. An error `lookup smarthome-db …` or `connection refused`: [🚨](#-troubleshooting) *Save & test fails …*.

### Step 6 — The first panel: a temperature query with Format `Time series`, then save (6 minutes)

1. Left menu **Dashboards** → the **New** button → **New dashboard**. The canvas says `Add a panel to visualize your data`.
2. In the **Add** bar on the right, click the **Panel** box, then **Configure visualization**. The data source from before is already selected.
3. Below the chart, switch **Builder** to **Code**, then paste this query (the `--` comments may come along; **Copy raw file** from [`code/quick-win/temperature-query.sql`](code/quick-win/temperature-query.sql)):

   ```sql
   -- temperature-query.sql - the first panel's query in Grafana (Module 25, Quick Win): the temperature of every device, from the readings table.
   -- Paste it into the panel's query editor (Code mode), format "Time series". Grafana replaces two macros before the query is sent:
   --   $__timeGroupAlias(ts, $__interval) -> time_bucket('60.000s',ts) AS "time" (example for the range Last 1 hour: the bucket
   --                                         width follows the range at the top right; visible in Query inspector. time_bucket =
   --                                         a TimescaleDB function, because the TimescaleDB switch is on)
   --   $__timeFilter(ts)                  -> ts BETWEEN '…Z' AND '…Z' (the dashboard's time range, written in UTC)
   -- The column device_id AS metric = one line per device. The grafana_reader account is enough: readings may be read (SELECT).
   SELECT
     $__timeGroupAlias(ts, $__interval),
     device_id AS metric,
     avg(temperature) AS temperature
   FROM readings
   WHERE $__timeFilter(ts)
   GROUP BY 1, 2
   ORDER BY 1
   ```

4. Change **Format** from `Table` to **Time series**, then click **Run query**. With `Table`, what gets drawn is ONE `temperature` line jumping between devices (Concept 4).
5. In the bar on the right, click **All visualizations** → **Time series**, then fill in **Title** `Home temperature`. Try the range (the clock button at the top right) **Last 1 hour**, then **Last 24 hours**.
6. Click **Save**, fill in **Title** `First panel` in the `Save dashboard` drawer, then **Save**. Leave with **Back**, then **Exit edit**.

**Result (the author's lab):** one line for every `device_id`: `f00d00000001`, `f00d00000002`, and `f00d000000b2` (the mock Garden of Practice 5, later on; a packet every 5 minutes shows as dots). Your lines follow the devices that sent a temperature in that range; `No data` = nothing has been sent yet.

![Composite of real screenshots of Grafana 13.2.4 in its dark theme in Chrome 156, Linux on a Raspberry Pi 5 playing the laptop, 1280 pixels, Quick Win steps 3, 5, and 6. Top left, step 3, in a fresh Grafana: the card Update your password with the warning Continuing to use the default password exposes you to security risks, the fields New password and Confirm new password filled with dots (number 1), the blue Submit button (number 1) and the Skip link below it. Top middle, step 5: the data source, Connection, Host URL smarthome-db:5432 (number 2), Database name smarthome; Authentication, Username grafana_reader, Password showing configured with a Reset button, TLS/SSL Mode disable (number 3). Top right, the bottom of the same page: the TimescaleDB switch on (number 4), Max open 4 (number 4), Max lifetime 14400, the green box Database Connection OK (number 5) and the buttons Delete, Remove default, Save & test (number 5). Bottom, step 6: the panel editor opened again after saving, the line chart Home temperature with three lines f00d00000001, f00d00000002, f00d000000b2, a time axis from 12:00 on 27 Oct to 10:00 on 28 Oct, a temperature axis 26 to 32 (number 6); below it Format Time series, Run query, Builder and Code, the query SELECT $__timeGroupAlias(ts, $__interval), device_id AS metric, avg(temperature) AS temperature FROM readings WHERE $__timeFilter(ts) GROUP BY 1, 2 (number 7); above, the time picker Last 24 hours (number 8). The lines: the seeded practice history of f00d00000001 and f00d00000002 until 27 Oct 18:10 WIB, then the simulator f00d00000001 and the mock Garden as single points; smarthome-db is a network alias of the lab database.](assets/first-grafana.png)

**A shortcut if Step 6 gets stuck.** **Dashboards** → **New** → **Import dashboard**. Paste the content of [`code/quick-win/first-panel.json`](code/quick-win/first-panel.json) (**Copy raw file**) into the **Import via dashboard JSON model** box, then click the SECOND **Load**, below that box (the first one is for a grafana.com address). Under `Options`, choose the data source from Step 5 in the `DS_GRAFANA-POSTGRESQL-DATASOURCE` box (otherwise: `A data source is required`), then click **Import**. The button says `Import (Overwrite)`? `First panel` already exists; don't overwrite it ([9.3](#93-try-importing-into-the-same-grafana-change-uid-first-optional-8-minutes); 🚨 *Importing a dashboard …*).

In 25 minutes, Grafana draws temperatures from your database with an account that can't write anything. No commit yet: the `grafana/` folder goes onto the new branch in [1.1](#11-the-featuregrafana-maps-reports-branch-and-a-grafana-folder-in-your-project-5-minutes).

> ➡️ **Next:** read [Concept 1](#1-two-dashboards-two-audiences-three-tools-you-already-have) to [Concept 3](#3-the-smallest-possible-rights-grafana-may-only-read), then do [Practice 1](#practice-1--a-tidy-and-safe-grafana-30-minutes). There you check Grafana's door and prove that the `grafana_reader` account really can't write.

## 🧠 The "Why" Concepts

You don't have to read these eleven concepts in one go. They are read in the order of their numbers, in between the practices:

1. Quick Win (already done) → Concepts 1–3 → Practice 1 (a tidy and safe Grafana)
2. Concepts 4–6 → Practice 2 (the "System Health" dashboard) and Practice 3 (the Garden on the technical dashboard)
3. Concept 7 → Practice 4 (the "Silent node" alert and a Telegram contact point) and Practice 5 (pull the Garden's battery); read Concept 8 while you wait for Grafana's message in 5.3
4. Concept 9 → Practice 6 (backend 1.2: device locations through the API), then Practice 7 (the Map page, which uses Concept 8)
5. Concept 10 → Practice 8 (a daily CSV report to Telegram) and Practice 9 (a report that arrives by itself)
6. Concept 11 (free reading) → Practice 10 (the Phase 4 checkpoint)

Concept 1 comes back in Practice 10, when you write your "when to use which" note. You use Concept 7's waiting-time formula in Practice 5. The SQL and code snippets in the concept sections are only for reading; everything is typed and run in the practices.

### 1. Two dashboards, two audiences: three tools you already have

The Syllabus asks for two kinds of dashboards, then asks you to **know when to use which**. They differ because their audiences differ:

- **The React dashboard you built** (Modules 22–24) is for the **residents**. Their questions are about "now": what the room temperature is, whether the lamp is on, water now. Residents also **command**, according to their role (admin or viewer).
- **Grafana** (this module) is for the **technical team**, that is, you yourself when you wear the "maintenance crew" hat. Its questions are "since when" and "how often": Node 1's Wi-Fi signal over the last month, memory that shrinks, Node 2 packets that stop arriving. The technical team also wants to be **woken up** through Telegram without having to open any screen. Grafana only reads; it doesn't command.

The Syllabus calls Grafana a tool for "technical dashboards without coding" ([§3 of the Syllabus](../../SYLLABUS.md#3-technology-choices--why-we-made-them)): panels are assembled with clicks on the screen plus one SQL query, not with new React components. Actually, you already have a third dashboard: [Node-RED Dashboard 2 from Module 13](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#5-dashboard-2-pages-groups-and-widgets) on the Pi. Since Module 16 its automation has [retired as the brain](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#-technical-deep-dive-optional), but its dashboard may stay alive as a backup view. So an honest comparison only needs your own three tools, each with its weaknesses:

| | Node-RED Dashboard 2 (Module 13) | React dashboard (Modules 22–24) | Grafana (Module 25) |
| :--- | :--- | :--- | :--- |
| For whom | you yourself, while building and trying ideas | residents: admin and viewer, on a laptop or a phone | the technical team |
| Made with | drag-and-wire nodes, almost no code | React + TypeScript code | clicks on the screen + an SQL query |
| Lives on | the Pi, `:1880/dashboard` | the laptop, `http://localhost:5173` | the laptop, a container at `http://localhost:3000` |
| Its data come from | MQTT messages passing by | the backend API + Socket.IO | the database directly, read-only account `grafana_reader` |
| Control | switches | lamp, fan, and pump buttons, rule forms (admin) | none: it only reads |
| Accounts & roles | a dashboard without accounts (only its editor has a password) | Module 20 accounts, admin/viewer, the guard's 401/403 | its own Grafana accounts, separate from the Module 20 accounts |
| History | a 1-hour chart in Node-RED's memory | 1 hour, 24 hours, 7 days, four quantities | as long as the database keeps it, any range |
| Messages when something's wrong | — | toasts, only on the screen that's open (the 📴 messages on Telegram come from the backend, not the dashboard) | alerts to Telegram, even if nobody opens a screen |
| Map | — | the **Map** screen ([Practice 7](#practice-7--the-map-page-with-react-leaflet-60-minutes)) | available (Geomap), not used in this module ([🔬](#-technical-deep-dive-optional)) |
| Versions & tests | `edge/node-red-flows.json` in Git | Git, lint, build, `check-schema` | dashboard JSON in Git through an export ([9.2](#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes)) |
| Honest weaknesses | the charts vanish every time Node-RED restarts | every new chart = new code; pressure, battery, and water tank without history | needs SQL; its screens change between releases; uses ±200–470 MiB of RAM (Concept 2) |
| When NOT to use it | for residents, or for years of data | investigating 30 days of RSSI, single-use panels | turning on the lamp, a family screen on a phone |

![Diagram two dashboards, two audiences, three tools you already have (Concept 1). Top: the residents want to know and command now (room temperature, the lamp, watering, from a phone) and use your dashboard (React, Modules 22–24); the technical team (purple) wants to know whether the devices are healthy (signal, memory, data that stopped arriving), told without opening a screen, and uses Grafana (Module 25), next to the database. Table with the columns Node-RED Dashboard 2 (on the Pi, Module 13), your dashboard React (on the laptop), Grafana (on the laptop, purple). For whom: you while building and trying ideas; the residents, admin and viewer, on the laptop or a phone; the technical team, you while looking after the system. Made with: drag-and-connect nodes without code; React + TypeScript code, versioned and checked in Git; clicks on the screen + SQL queries, saved as JSON in grafana/. Its data comes from: MQTT messages directly, a 1-hour chart in memory; backend API + Socket.IO, history of 1 hour, 24 hours, 7 days; TimescaleDB directly with the account grafana_reader, history as long as the data. Strong at: peeking at MQTT traffic, trying ideas; controlling the lamp and pump, rules, roles, the map, from a phone; long trends, signal and memory, alerts to Telegram. Honest weakness: charts lost when Node-RED restarts, automation retired since M16; every new chart = new code, pressure, battery, tank without history; its own accounts (not Module 20), needs SQL, RAM ±200–470 MiB. When NOT to use it (red): for the residents or data over years; investigating 30 days of RSSI or a one-off panel; turning on the lamp (Grafana only reads), the family screen is the phone. Bottom: air pressure, battery, and tank water only show on your dashboard live cards, in Grafana one SQL panel is enough; the lamp button does not fit in Grafana, which reads with a read-only account; Node-RED may stay as a backup display.](assets/two-dashboards-three-tools.png)

Two examples from your own project:

- **A technical question that's expensive in React.** Air pressure, Node 2's battery, and the water tank have been stored in `readings` since Module 17, but the React dashboard only shows them on the live cards (**Limits** in `frontend/README.md`: the summary history covers only four quantities). A 30-day battery chart in React means a new API route, component, tests, and release. In Grafana, one panel with one query is enough, without touching the backend.
- **A button that doesn't fit in Grafana.** Grafana reads the database with an account that really can't write (Concept 3), so it can't and mustn't turn on the lamp. Commands still go through `POST /devices/:id/command`, watched by the role guard. The screen for the family stays React too: Grafana's accounts are separate, and in this module it only opens on the laptop.

The practical rule: **residents ask about "now" → the dashboard you built; the technical team asks "since when" or "how often" → Grafana; trying an idea quickly → Node-RED.** In [10.3](#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes), you rewrite this table in your own words.

### 2. Grafana lives next to the database: one `docker run` and a hallway

Grafana doesn't store sensor data. Every time a panel is drawn, it asks TimescaleDB directly. That database is part of the "brain" that has lived on the laptop since Module 16: since Module 17 it has been in the `smarthome-db` container, and it deliberately opens only counter `127.0.0.1:5432`, for programs on that laptop. So Grafana lives on the laptop too, as a second container next to the database, installed the same way as in Module 17. The four [just-enough Docker](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard) terms still apply; this week adds one:

| Docker term | Imagine | In Module 25 |
| :--- | :--- | :--- |
| **Image** (the mold) | a cake mold that never changes | `grafana/grafana:13.2.4`, downloaded once (±445 MB for arm64) |
| **Container** | the cake made from that mold: the program that's running | `smarthome-grafana` |
| **Port** (the counter) | a counter from outside into the container | `127.0.0.1:3000`, for this laptop only |
| **Volume** (the cupboard) | a cupboard outside the cake: what's in it stays even when the cake is thrown away | `smarthome-grafana-data` |
| **Network** (the hallway), **new** | a hallway inside the building that connects containers, like the hallway between apartments: inside it they call each other by NAME, without going through the laptop's counter | `smarthome`, holding `smarthome-db` and `smarthome-grafana` |

**Why a hallway?** Inside a container, `localhost` means **that container itself**, not your laptop. A data source with **Host URL** `localhost:5432` makes Grafana knock on its own door, but there's no database in the Grafana container. Many tutorials use `host.docker.internal`, a special Docker Desktop name for "the laptop outside the container". These are the answers of the **Save & test** button in the author's lab (Docker Engine on Linux):

| **Host URL** | **Save & test** |
| :--- | :--- |
| `localhost:5432` | `Network error: Failed to connect to the server. Error message: connect: connection refused` |
| `host.docker.internal:5432` | `Network error: Failed to connect to the server. Error message: no such host` |
| `smarthome-db:5432` (through the hallway) | `Database Connection OK` |

The author's research also tried `host.docker.internal` forced to be known (`--add-host`): the database counter, which is only open for `127.0.0.1`, still refused. Docker Desktop on Windows and macOS wasn't tested by the author, so that recipe isn't used. The hallway is Docker's own feature, not a special Docker Desktop name, so the recipe should be the same on every operating system (the author only tested Docker Engine on Linux). With a hallway, the database counter stays `127.0.0.1`, as Module 17's rule says, and inside the hallway its number is always 5432, even if your laptop's counter uses another number. The full deep dive into Docker networks waits in Module 26.

**Once is enough.** `docker network create smarthome` creates the hallway, then `docker network connect smarthome smarthome-db` connects the running database without stopping it (this command succeeds silently, with no output). That connection is stored in its container. In the author's lab, the connection was still there after `docker restart smarthome-db`; in the code test lab, also after both containers were stopped and started again. When Grafana started first there, the data source briefly answered `lookup smarthome-db on 127.0.0.11:53: server misbehaving` (the database container wasn't running yet, so its name wasn't known in the hallway), then recovered by itself as soon as the database started. A Docker restart and a laptop reboot weren't tested by the author; since the connection is stored in the container and both are `--restart unless-stopped`, it should stay too.

![Diagram Grafana lives next to the database, on the laptop (Concept 2). Top: Docker Hub with the mold grafana/grafana:13.2.4 (OSS, AGPLv3), downloaded once, ±445 MB (arm64), an exact tag; Telegram, the Module 19 bot (Grafana 🔴/✅ alerts, backend 📴/✅, 📊 CSV report, /status); Raspberry Pi 192.168.1.37, locked Mosquitto, acl-broker + the laptop-path block. Arrow docker run (one line; download first: docker pull) from Docker Hub to the Grafana container. On the laptop, not containers: the browser (http://localhost:3000 to Grafana, http://localhost:5173 to Vite, your dashboard) and backend 1.2, DATABASE_URL through the counter 127.0.0.1:5432 with the postgres account, not Grafana's. Out of the laptop: Grafana outgoing HTTPS sendMessage for alerts; the backend outgoing HTTPS sendMessage, long polling, and sendDocument; the backend to the Pi over MQTT, logged in. The area Docker Desktop (Windows, macOS) or Docker Engine (Linux), a container = a small Linux inside the laptop, with two counters on its edge, 127.0.0.1:3000 and 127.0.0.1:5432, for programs on this laptop only. In the smarthome hallway (dashed purple): the container smarthome-grafana (Grafana OSS 13.2.4, RAM ±200–470 MiB, reads as grafana_reader, no plugin download through GF_PLUGINS_PREINSTALL_DISABLED, statistics, external snapshots, public dashboards off) with an arrow to smarthome-db:5432, the name = the address; the container smarthome-db (PostgreSQL 17 + TimescaleDB 2.30.2, from Module 17, unchanged, its port in the hallway is always 5432). Below them the cupboards (volumes) joined by -v: smarthome-grafana-data (dashboards, alerts, Grafana accounts; they stay even if the container is made again) and smarthome-data (every table, unchanged). Bottom: why a hallway, because inside the Grafana container localhost:5432 = Grafana itself and host.docker.internal does not reach the 127.0.0.1 counter (proven on Docker Engine Linux); just once, docker network create smarthome, then docker network connect smarthome smarthome-db, kept in the container (lab: still there after docker restart). Dashed: Module 26 Docker Compose writes the containers, the hallway, and the cupboards in one file; the same cupboards, nothing lost.](assets/grafana-beside-the-database.png)

**The [Quick Win Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes) command, part by part.** The parts that are the same as in Module 17 (`docker run`, `-d`, `--restart unless-stopped`) aren't repeated:

| Part | What it means |
| :--- | :--- |
| `--name smarthome-grafana` | the container's name, with the same prefix as `smarthome-db` |
| `--network smarthome` | joins the hallway from the moment it's made |
| `-p 127.0.0.1:3000:3000` | counter 3000 for this laptop only. The number 3000 has been [set aside for Grafana since Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#2-http-once-more-methods-routes-status-codes-and-counters), which is why the backend uses 8080. Phones and other laptops can't open it ([1.3](#13-grafanas-door-401-without-logging-in-only-from-this-laptop-no-sharing-outside-5-minutes); the optional *Grafana from a phone* box in [Practice 10](#practice-10--the-phase-4-checkpoint-collect-the-evidence-45-minutes)) |
| `-e GF_PLUGINS_PREINSTALL_DISABLED=true` | without this, on its first start Grafana downloads ±290 MB of plugins from grafana.com that we don't use, and their versions shift by themselves. The PostgreSQL data source is built in. In the author's lab, the plugin folder is only `4.0K` |
| `-e GF_ANALYTICS_REPORTING_ENABLED=false` | don't send usage statistics to stats.grafana.org (like `TIMESCALEDB_TELEMETRY=off` in Module 17) |
| `-e GF_SNAPSHOTS_EXTERNAL_ENABLED=false` | turn off snapshots (pictures of a dashboard) published to Grafana's server on the internet |
| `-e GF_PUBLIC_DASHBOARDS_ENABLED=false` | turn off public dashboards, which can be opened without logging in |
| `-v smarthome-grafana-data:/var/lib/grafana` | Grafana's cupboard: dashboards, alert rules, contact points, accounts and passwords. The container may be thrown away and made again; Module 26 uses the same cupboard |
| `grafana/grafana:13.2.4` | the OSS edition with an exact tag. The `grafana/grafana-oss` image of older tutorials stopped at 13.0.2 (June 2026), and without a tag you get another version whose menus may differ |

The admin password is deliberately **not** in the command, so that it isn't stored in the terminal history: the password is changed on the **Update your password** screen with **Submit** ([Quick Win Step 3](#step-3--log-in-for-the-first-time-and-change-the-admin-password-submit-not-skip-3-minutes)).

**Honest about what's sent out.** Those three `false` settings were proven to work in the code test lab: compared with a Grafana without them, the share menu loses **Share externally**, and the **Share snapshot** drawer loses **Publish to snapshots.raintank.io**. What **still** contacts the internet: the check for new Grafana and plugin versions at grafana.com, the news feed (the home page shows `Latest from the blog`), and Gravatar avatar images. None of them carry dashboard content or your home's data. How to turn off the version check is in [🔬](#-technical-deep-dive-optional) *Three extra settings …*.

**OSS, not Enterprise.** Grafana's Docker documentation suggests the Enterprise edition as the default. The `grafana/grafana` image we use is the **OSS** edition (open source, AGPLv3 license), and everything in this module works with that edition.

**RAM, and why not on the Pi yet.** Grafana uses ±200–470 MiB, depending on the load: in the author's final lab, 209.5–231.2 MiB with a dashboard open, and the author's research recorded up to ±470 MiB while a six-panel dashboard was loaded again and again and the alert pages were opened (`docker stats`). That's one of the reasons the Syllabus names a [2 GB VPS](../../SYLLABUS.md#55-service-costs-phase-5) for Phase 5. Grafana hasn't moved to the Pi because its database is on the laptop and deliberately closed to the Wi-Fi. Moving it means opening the database to the network or moving the database along, and that's the work of Modules 26–27. As a result, Grafana and its alerts only work while the laptop is on. How to install Grafana without Docker is in [🔬](#-technical-deep-dive-optional) *Grafana without Docker …*.

The details are in [Quick Win Step 1](#step-1--the-smarthome-hallway-between-containers-just-once-2-minutes) and [Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes); you check the container, the cupboard, and the hallway in [1.2](#12-check-the-container-docker-ps-docker-inspect-and-docker-network-inspect-7-minutes), and its door in [1.3](#13-grafanas-door-401-without-logging-in-only-from-this-laptop-no-sharing-outside-5-minutes). If counter 3000 is already used by another program, for example `tools/webhook-receiver.js`, see [🚨](#-troubleshooting).

### 3. The smallest possible rights: Grafana may only read

Up to Module 24, the database had only one account: `postgres`, the Module 17 superuser used by the backend and the migrations. That account may read everything, including password fingerprints (`users.password_hash`), session token fingerprints (`sessions.token_hash`), and device key fingerprints (`devices.key_hash`), and may even `DROP TABLE`. Grafana's own data source form warns about it in the **User Permissions** box: the database account for Grafana `should only be granted SELECT permissions`, because `Grafana does not validate that queries are safe`. Any panel query, `DROP TABLE` included, is run as it is. That's why Grafana gets its own account, **`grafana_reader`**, a kind of "reader's card": it may look at certain shelves, but not write.

The content of `grafana/grafana-user.sql` (you create the whole file in [Quick Win Step 4](#step-4--the-read-only-database-account-grafana_reader-6-minutes)), line by line:

| Line | What it means |
| :--- | :--- |
| `CREATE ROLE grafana_reader LOGIN CONNECTION LIMIT 5;` | a new account that may log in, with at most 5 connections at once |
| `ALTER ROLE grafana_reader SET default_transaction_read_only = on;` | **layer 1**: every transaction of it is read-only |
| `ALTER ROLE grafana_reader SET statement_timeout = '10s';` | a runaway panel query is stopped after 10 seconds, so that it doesn't weigh the database down |
| `GRANT CONNECT ON DATABASE smarthome …` and `GRANT USAGE ON SCHEMA public …` | may enter the `smarthome` database and see what's in its schema |
| `GRANT SELECT ON readings, readings_hourly, device_health, events, commands …` | **layer 2**: may only read these four tables and one summary. New chunks of `readings` that TimescaleDB makes later are readable too; the `readings_hourly` summary ([Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk)) only needs the right on its name |
| `GRANT SELECT (device_id, kind, name, location, lat, lng, status, last_seen, created_at, registered_at, revoked_at, linked_via) ON devices …` | from `devices`, only these 12 columns; not `key_hash` and `key_created_at` |
| (deliberately missing) | `users`, `sessions`, `rules`, and `schema_migrations` are closed completely |

**Two layers, like the guard and the ACL.** You know the pattern already: [the role guard in the backend](../../phase-3-backend-data/module-20-user-security/README.md#6-a-guard-at-every-door-the-admin-and-viewer-roles) (Module 20) and [the ACL in the broker](../../phase-3-backend-data/module-21-device-broker-security/README.md#7-the-access-control-list-acl-every-device-on-its-own-topic) (Module 21). If one layer leaks, the other still holds. In the author's lab, the account itself could switch layer 1 off for its own session, but layer 2 still refused (psql as `grafana_reader`):

```text
smarthome=> SET default_transaction_read_only = off;
SET
smarthome=> INSERT INTO events (kind, source, message) VALUES ('status', 'test', 'try');
ERROR:  permission denied for table events
```

Without that `SET`, `INSERT` and `DROP TABLE` are already refused by layer 1 (`cannot execute … in a read-only transaction`); you try it yourself in [1.4](#14--test-grafana_reader-in-psql-reading-allowed-writing-refused-10-minutes).

![Diagram the smallest possible rights: Grafana may only read (Concept 3); the account grafana_reader from grafana/grafana-user.sql. Left: postgres, the Module 17 superuser, reads every table including users.password_hash, sessions.token_hash, devices.key_hash, may INSERT, UPDATE, DROP TABLE, used by the backend and the migrations; red: Grafana never holds it. Right, purple: grafana_reader, a new account only for Grafana, its password typed with backslash password in psql, not in a file. Layer 1, read-only transactions: default_transaction_read_only = on refuses INSERT, UPDATE, DROP; plus the limits statement_timeout 10s and CONNECTION LIMIT 5. Layer 2, grants per table and column: GRANT SELECT only on the tables that panels, alerts, and reports read; devices without key_hash; every other table closed. Middle, green ticks: readings, readings_hourly, device_health, events, commands; devices only the columns device_id, kind, name, location, lat, lng, status, last_seen, created_at, registered_at, revoked_at, linked_via; closed key_hash, key_created_at. Fully closed: users, sessions, rules. Test table in psql as grafana_reader, exact texts: SELECT count(*) FROM readings answers 2316, allowed; SELECT * FROM devices and SELECT key_hash FROM devices: ERROR: permission denied for table devices (layer 2); users and sessions: permission denied for table users or sessions (layer 2); INSERT INTO events: ERROR: cannot execute INSERT in a read-only transaction (layer 1); DROP TABLE readings: cannot execute DROP TABLE in a read-only transaction (layer 1); SHOW statement_timeout: 10s (limit). Bottom: panel queries always name their columns, never SELECT *; the Grafana data source Max open 4 because this account may hold at most 5 connections; the same pattern as the backend guard (Module 20) and the broker ACL (Module 21).](assets/read-only-rights.png)

**The consequence in Grafana: always write the column names.** Because the rights on `devices` are given per column, `SELECT * FROM devices` is refused, from a Grafana panel too. In the author's lab, that query in **Explore** answered:

```text
db query error: ERROR: permission denied for table devices (SQLSTATE 42501)
```

Every query in this module writes its column names one by one. The four tables and the one summary above got full rights, so `SELECT *` still works there, but the habit of writing column names makes your queries easier to read.

**The connection limit: 5 in the database, 4 in Grafana.** `CONNECTION LIMIT 5` limits this account, while Grafana's data source may open up to 100 connections by default (**Max open** `100`). In the author's code test lab, a script that imitated three tabs loaded the dashboard 10 times at once with that default, and 4 of 180 queries failed with `too many connections for role "grafana_reader"`. With **Max open** `4`, 0 of 180 failed: Grafana queues by itself, and one connection is still left for psql. That's why [Quick Win Step 5](#step-5--a-postgresql-data-source-through-the-hallway-smarthome-db5432-5-minutes) fills in the number `4`.

**The password is never written down.** The file `grafana-user.sql` has no password, so it's safe in Git. The password is typed through `\password grafana_reader` in psql: it isn't shown on the screen and doesn't go into the terminal history. This account is also deliberately not created through a backend migration: passwords must not go into Git, and the Grafana account isn't part of the application's schema. PostgreSQL accounts are stored together with the tables in the `smarthome-data` cupboard, so they move along when the database is moved. Running the file twice only changes the first line of its answer, `CREATE ROLE`, into the message `ERROR:  role "grafana_reader" already exists`; the other lines still apply. One small gap after layer 1 is switched off (creating temporary tables), and how to close it, are in [🔬](#-technical-deep-dive-optional) *Three extra settings …*.

> ⬆️ **Done reading Concepts 1–3?** Continue to [Practice 1](#practice-1--a-tidy-and-safe-grafana-30-minutes). Concepts 4–6 are read before [Practice 2](#practice-2--the-system-health-dashboard-rssi-uptime-heap-and-the-node-variable-50-minutes).

### 4. Anatomy of a panel: SQL, time macros, units, and thresholds

A **panel** is one box on the dashboard that holds **one SQL query + one way of drawing**: a **Time series** line chart, a big **Stat** number, a **Bar chart**, or a **Table**. Grafana doesn't know what "temperature" or "device" means; it only reads the columns your query returns, then draws them. This is your first panel's query from [Quick Win Step 6](#step-6--the-first-panel-a-temperature-query-with-format-time-series-then-save-6-minutes) (`temperature-query.sql`, without its comment lines):

```sql
SELECT
  $__timeGroupAlias(ts, $__interval),
  device_id AS metric,
  avg(temperature) AS temperature
FROM readings
WHERE $__timeFilter(ts)
GROUP BY 1, 2
ORDER BY 1
```

**Three column roles.** For a line chart, the query result is read like this:

| Column | Its role |
| :--- | :--- |
| `time` (made by a macro, see below) | the time axis; the result must be in time order, which is why there's `ORDER BY 1` |
| `metric` | the text that splits the lines: one line for every `device_id` |
| `temperature` | the number that's drawn |

**Format: `Table` or `Time series`.** Above the SQL box, on the same row as **Run query**, there's a **Format** option, and its default is `Table`. With `Table`, the `metric` column isn't used to split the lines: the result is ONE line named `temperature` that jumps back and forth between devices. With **Time series**, every device gets its own line. In this module, the line, Stat, and bar panels use **Time series**; the table panel (Practice 3) and the alert query (Practice 4) use `Table`.

**Macros: pieces that Grafana replaces before the query is sent.** The database never sees the text `$__…`. Grafana replaces it first, and you can peek at the result through the **Query inspector**. The query above, with the range **Last 1 hour**, in the author's lab:

```text
A:29 rows
SELECT
time_bucket('60.000s',ts) AS "time",
device_id AS metric,
avg(temperature) AS temperature
FROM readings
WHERE ts BETWEEN '2026-10-26T19:55:49.344Z' AND '2026-10-26T20:55:49.344Z'
GROUP BY 1, 2
ORDER BY 1
```

- `$__timeFilter(ts)` becomes `ts BETWEEN '…Z' AND '…Z'`: the time range you chose at the top right, written in **UTC** (the `Z` ending).
- `$__timeGroupAlias(ts, $__interval)` becomes `time_bucket('60.000s',ts) AS "time"`, that is, [Module 18's time buckets](../../phase-3-backend-data/module-18-timescaledb/README.md#3-time_bucket-time-buckets). `time_bucket` appears because the **TimescaleDB** switch of the data source is on ([Quick Win Step 5](#step-5--a-postgresql-data-source-through-the-hallway-smarthome-db5432-5-minutes)); without that switch, Grafana writes a plain PostgreSQL formula. `$__interval` follows the range: the longer the range, the wider the buckets, so a chart over a long range doesn't have to load every 10-second reading.

**UTC in the query, WIB on the screen.** The database stores times in UTC ([Module 17 Concept 9](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#9-time-timestamptz-utc-and-wib)), and the macros write UTC too. The chart's axis is drawn in the **dashboard's time zone**. A new dashboard follows the browser's zone; the "System Health" dashboard is set to `Jakarta  WIB  UTC+07:00` in **Settings**, step [2.1](#21-a-new-dashboard-the-folder-the-wib-time-zone-and-the-node-variable-10-minutes), so it shows WIB on any laptop and the setting is saved in the JSON. So on a dashboard in the WIB zone, the times in the Query inspector are 7 hours earlier than the times on the chart, and that isn't a mistake.

**Units and thresholds.** Grafana doesn't know that `uptime_s` means seconds; you tell it through **Standard options → Unit**. In the author's lab, `Time / duration (s)` turns `600` into `10 minutes`, `Energy / Decibel-milliwatt (dBm)` gives an axis of `-60 dbm` (lowercase), and `Data / bytes(SI)` gives an axis in `kB`. **Thresholds** color Stat numbers, table cells, and bars; on a line chart, the line color stays one per device, and a threshold shows as a dashed line when asked for (the RSSI panel). The default thresholds, as Grafana's documentation says: `Base` green, then **red from 80**. Grafana only compares numbers without knowing what they mean, so an uptime Stat panel that hasn't been set up shows a big red `600`, as if there were danger ([2.3](#23-the-uptime-and-heap-panels-the-red-at-80-stat-trap-duration-and-byte-units-13-minutes)). In this module, the thresholds are changed to match their meaning (RSSI `-75`, packets per hour `12`, minutes late `5`), and the uptime Stat uses one fixed color: **Color scheme** `Single color`.

**Gaps: don't fill them with `0`.** `$__timeGroupAlias` has a third argument for filling empty buckets. Filling them with `0` means inventing numbers: a temperature of `0` means zero degrees, not "unknown" (`NULL`, [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#3-tables-rows-columns-types-and-the-primary-key)). In the author's lab, `$__timeGroupAlias(ts, $__interval, 0)` for the practice device `f00d00000002` over the range **Last 6 hours** gave 361 points, 331 of them with the value 0: a jagged chart that falls to 0 °C in every minute without a reading. Without the third argument, Grafana only receives buckets that contain data; if empty points are really needed, fill them with `NULL`, not `0`. The principle is the same as [Module 23's honest visuals](../module-23-realtime-dashboard/README.md#9-honest-visuals-scale-units-gaps-and-status-colors): don't invent numbers for times without a reading.

**Query inspector first, then guess.** Open it through the panel menu → **Inspect** → **Query** → **Refresh**. Every time a panel looks strange (`No data`, shifted times, zigzag lines), first look at the query that was really sent and how many rows came back (`A:29 rows` in the example above).

The details are in [Quick Win Step 6](#step-6--the-first-panel-a-temperature-query-with-format-time-series-then-save-6-minutes) and [2.2](#22-the-rssi-panel-an-sql-query-format-time-series-the-dbm-unit-and-thresholds-12-minutes)–[2.5](#25-no-data-and-shifted-clocks-vitals-every-5-minutes-utc-in-the-query-wib-on-the-screen-5-minutes); you open the Query inspector in [2.4](#24--save-with-a-1-minute-refresh-test-node-then-peek-into-the-query-inspector-10-minutes). This section's three traps are in [🚨](#-troubleshooting): *A strange temperature chart …*, *A Stat number is red although it's normal*, and *The times in the chart or in the Query inspector are shifted by 7 hours*.

### 5. Variables: one dashboard for every device

Your home has several devices: Node 1, Node 2, and on the laptop path the simulator `f00d00000001` and the mock Garden. Without variables, you have two choices that are equally bad: one dashboard for every device (a new device = a new dashboard), or every line piled up in every panel. The **variable** `$node` is "a device picker at the top of the dashboard": one drop-down box named `Node`, and every panel shows the devices chosen there.

**Its list of choices comes from the database.** A variable of the **Query** type fills its list with an SQL query ([2.1](#21-a-new-dashboard-the-folder-the-wib-time-zone-and-the-node-variable-10-minutes)), exactly as in this module's reference dashboard, [`code/grafana/dashboards/system-health.json`](code/grafana/dashboards/system-health.json):

```sql
SELECT coalesce(name, device_id) AS __text, device_id AS __value FROM devices WHERE registered_at IS NOT NULL AND revoked_at IS NULL ORDER BY 1
```

| Part | What it means |
| :--- | :--- |
| `AS __text` | what is **shown** in the picker: the device's name, or its `device_id` if the name is empty (`coalesce`) |
| `AS __value` | what is **sent** to the panel queries: the `device_id`, because that's the column `device_health` and `readings` have |
| `WHERE registered_at IS NOT NULL AND revoked_at IS NULL` | only devices that are registered and whose key isn't revoked ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#72-first-layer-revoke-it-in-the-backend-5-minutes)); the alert query uses the same condition (Concept 7) |

Those columns are among the 12 `devices` columns that `grafana_reader` may read (Concept 3). The list is reloaded every time the dashboard opens (`Refresh` `On dashboard load`), so a newly registered device appears without editing anything. In the author's lab, the **Run query** button in the variable editor wrote `Preview of values (3)`: `Garden (mock)`, `Practice living room`, `Practice porch`.

**One, several, or all.** Two switches make the picker more useful: **Multi-value** allows choosing several devices at once, and **Include All value** adds an `All` choice. In a panel query, the variable is written inside `IN (…)`, for example in the RSSI panel's query:

```sql
SELECT h.ts AS "time", coalesce(d.name, h.device_id) AS metric, h.rssi
FROM device_health h JOIN devices d ON d.device_id = h.device_id
WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
ORDER BY 1
```

Like the macros (Concept 4), `$node` is replaced by Grafana before the query is sent. These are the `WHERE` lines in the author's **Query inspector**, first with `Node` = `All`, then with one device:

```text
WHERE h.ts BETWEEN '2026-10-26T14:55:18.815Z' AND '2026-10-26T20:55:18.815Z' AND h.device_id IN ('f00d000000b2','f00d00000001','f00d00000002')
WHERE h.ts BETWEEN '2026-10-26T14:56:19.127Z' AND '2026-10-26T20:56:19.127Z' AND h.device_id IN ('f00d00000001')
```

`All` means the list of every value, including the Garden, which has no vitals (Concept 6); that's fine, because `IN` only searches.

**Grafana adds the quotes, but only for a Multi-value variable.** According to Grafana's documentation, a variable's values get quotes automatically only when the variable is multi-value. Because `$node` has **Multi-value** on, even a single choice becomes `'f00d00000001'`, and you mustn't add quotes yourself. The trap is in `= $node`. In the author's lab, `h.device_id = $node` still worked as long as one device was chosen (`= 'f00d00000001'`), but as soon as `All` was chosen, the panel answered:

```text
db query error: ERROR: syntax error at or near "," (SQLSTATE 42601)
```

A comma-separated list is only valid inside `IN (…)`. If **Multi-value** is off, according to the documentation the values are pasted in without quotes and the query breaks another way (not tested by the author). The rule: **a device variable is always Multi-value, always `IN ($node)`**.

**Two surprises in Grafana 13.2.** The variable editor now lives in the dashboard's **sidebar**: the **Variables** tab in **Settings** only says `Variable settings have moved to the dashboard's sidebar.` with a **Take me there** button, so older tutorials that fill in variables in that tab no longer fit. Then, after the dashboard was saved for the first time, `Node` in the author's lab held the **first** value of its list (`Garden (mock)`), not `All`, so the RSSI panel said `No data`. Choose `All`, then at **Save** tick **Update default variable values**, so that `All` becomes the default ([2.4](#24--save-with-a-1-minute-refresh-test-node-then-peek-into-the-query-inspector-10-minutes)).

**Variables don't work in alerts.** Grafana's documentation on PostgreSQL alerts says `Template variables aren't supported`. An alert rule is run by Grafana itself without anyone choosing a `Node`, so its query ([4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes)) doesn't use `$node`: it always checks every registered device. Its "now" is simply `now()`; `$__timeFilter` isn't needed. If a panel shows an error or goes empty as soon as its query uses `$node`, see [🚨](#-troubleshooting) *A panel shows an error or goes empty as soon as its query uses `$node`*.

### 6. Reading device health: RSSI, uptime, heap, and packets per hour

Since Module 11, Node 1 sends **`vitals`**, "a device health report" according to [the Syllabus glossary](../../SYLLABUS.md#12-mini-glossary-terms-that-appear-in-this-syllabus): once after it connects, then **every 5 minutes**. The backend stores them in `device_health`, one row per message. Until now, outside SQL queries, you only saw the latest one through `GET /devices/:id/vitals`, which is kept in memory and is empty again every time the backend restarts ([🚨 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-troubleshooting)). Grafana reads their history straight from the table. Its three numbers answer three different questions:

| Quantity (column) | Unit in the panel | What's normal | What's suspicious |
| :--- | :--- | :--- | :--- |
| **RSSI** (`rssi`), the strength of the Wi-Fi signal | `Energy / Decibel-milliwatt (dBm)`, shown as `-60 dbm` | always negative; the closer to 0, the stronger, so −50 is much stronger than −80 | a line that slides down and stays low: the router was moved, a new wall, or the antenna is covered |
| **Uptime** (`uptime_s`), the time running since the last boot | `Time / duration (s)`, shown as `10 minutes`, `2 hours` | keeps growing | a number that suddenly becomes small again: the device just restarted (a power cut, a voltage drop, or a hung program) |
| **Heap** (`heap_free`), the chip's remaining working memory | `Data / bytes(SI)`, shown in `kB` | goes up and down around the same number | keeps falling for hours: some memory is used without being given back (a leak), and in the end the device restarts |

The three explain each other. A shrinking heap followed by an uptime that drops to zero tells one story: the device ran out of memory, then restarted. The backend itself already uses an uptime below 60 seconds as the sign of "just restarted" ([Module 19 Concept 4](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#4-desired-state-versus-reported-state)). For RSSI, the often-used yardstick is **a common convention, not an official standard**: from around −75 dBm down, the connection starts to drop easily. This module's dashboard uses −75 as a warning line (the green dashed line in [2.2](#22-the-rssi-panel-an-sql-query-format-time-series-the-dbm-unit-and-thresholds-12-minutes)), and you may move that number once you know your home.

**Honest about the simulator.** The simulator invents its `vitals`: RSSI is random between −40 and −79 dBm in every message, heap between 180,000 and 200,000 bytes, and uptime is counted from when the simulator was started. The RSSI and heap lines on the laptop path really are meaningless zigzags; real patterns only come from the Node 1 in your home.

**A point every 5 minutes, and "No data".** Because `vitals` arrive every 5 minutes, the chart is a series of points 5 minutes apart, not a dense line like the temperature (10 seconds). That isn't a fault. In the author's lab, the simulator's first `vitals` came in at 03:31:42 WIB, and 25 minutes later the RSSI panel held 6 points. A vitals panel says `No data` when its time range doesn't contain a single message yet, for example in the first 5 minutes after the system starts ([Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#57-watch-the-data-arrive) also says `device_health` only fills up after a few minutes), or when `Node` only holds the Garden. The history from `npm run seed-history` contains no `vitals`. The details are in [2.5](#25-no-data-and-shifted-clocks-vitals-every-5-minutes-utc-in-the-query-wib-on-the-screen-5-minutes) and [🚨](#-troubleshooting) *The RSSI, uptime, or heap panel says `No data`*.

**Node 2 doesn't send `vitals`.** Node 2 runs on a battery and only wakes up every 300 seconds to send one `telemetry` packet through Node 1; the data contract deliberately gives it no `vitals`. So for Node 2, the question changes to: **"does it wake up on schedule?"** A 300-second schedule means **12 packets per hour**. That count is already made by the automatic clerk in the `readings_hourly` summary ([Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk)), so the bar panel only has to read that summary ([3.1](#31-a-bar-panel-of-node-2-packets-per-hour-with-12-as-the-reference-12-minutes)):

```sql
SELECT p.hour AS "time", coalesce(d.name, p.device_id) AS metric, p.reading_count
FROM readings_hourly p JOIN devices d ON d.device_id = p.device_id
WHERE $__timeFilter(p.hour) AND d.kind = 'node2'
ORDER BY 1
```

Its threshold is 12: a green bar means the schedule was kept, an orange bar means some packets didn't arrive, or the hour isn't over yet. In the author's lab, the mock Garden started at 03:31 WIB and was left running for two full hours. The panel drew an orange bar `6` for the 03:00 hour (the first hour really was only half), then two green bars `12` for the 04:00 and 05:00 hours. While there's only one bar, the axis label only says `2026`; hour labels appear as soon as there's a second bar. The second question for Node 2, "how many minutes is it behind its wake-up schedule?", is answered by the minutes-late table, which is also the alert's query (Concept 7).

**Why the Syllabus practice wording was updated.** The Syllabus first asked for an RSSI, uptime, and heap dashboard "for each node" and a "node offline > 5 minutes" alert. For Node 2, neither can be done: it doesn't send `vitals`, it's deliberately silent for 5 minutes between two packets, and its `offline` status is only published by Node 1 after 16 minutes without a packet. That's why the practice wording was updated (v1.0.27): RSSI, uptime, and heap of **Node 1**, the number of packets per hour of **Node 2**, and a "**silent node**" alert (Node 1: more than 5 minutes without data; Node 2: more than 5 minutes past its wake-up schedule). The pass requirement stays: Grafana tells you when Node 2's battery is pulled out.

This concept is used in [2.2](#22-the-rssi-panel-an-sql-query-format-time-series-the-dbm-unit-and-thresholds-12-minutes)–[2.5](#25-no-data-and-shifted-clocks-vitals-every-5-minutes-utc-in-the-query-wib-on-the-screen-5-minutes) and [3.1](#31-a-bar-panel-of-node-2-packets-per-hour-with-12-as-the-reference-12-minutes), then in [🧩 Level 1](#level-1--a-second-alert-a-weak-wi-fi-signal-a-small-change-20-minutes), a second alert for a weak RSSI.

> ⬆️ **Done reading Concepts 4–6?** Continue to [Practice 2](#practice-2--the-system-health-dashboard-rssi-uptime-heap-and-the-node-variable-50-minutes), then [Practice 3](#practice-3--the-garden-on-the-technical-dashboard-packets-per-hour-and-minutes-late-35-minutes). Concept 7 is read before [Practice 4](#practice-4--the-silent-node-alert-and-a-telegram-contact-point-55-minutes).

### 7. Alerts that wake people only when needed: silent is not the same as offline

A dashboard is only useful if someone looks at it. An alert works the other way around: it checks by itself, then **wakes** people up through Telegram. An alert that goes off too often ends up ignored, and that's why the Module 19 backend messages were made [important, fast, and not chatty](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#9-telegram-notifications-important-fast-and-not-chatty). The `Silent node` rule answers just one question: **which node has stopped sending data?** It tells you when a node goes silent (🔴) and when that node sends again (✅).

**A night watchman every minute.** Imagine a night watchman who makes his rounds every minute. This is what Grafana does for that rule, in the order of the form in the **Alerting** → **Alert rules** menu that you fill in at [4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes):

| Stage | Setting | What it means |
| :--- | :--- | :--- |
| 1. Query | evaluation group `node-health`, every `1m`; **Format** `Table` | every minute, Grafana runs one query as `grafana_reader`. One row = one node (an instance); the text columns `device_id` and `node` become its labels |
| 2. Condition | `WHEN` **Last** `OF QUERY` **IS ABOVE** `5` | every row's `minutes_late` number is compared with 5 (Grafana builds this itself as A query → B Reduce → C Threshold) |
| 3. State | **Pending period** `None` | a node goes `Firing` (its alert goes off) right at the first evaluation that passes the threshold. The form's default of `1m` makes the message always a minute late |
| 4. Grouping & pauses | **Group by** `device_id`; `Group wait: 30s, Group interval: 5m, Repeat interval: 4h` | explained below |
| 5. Message | contact point (the address for messages) `Telegram Smart Home` | the Module 19 bot, to your private chat, with its own 🔴/✅ template ([4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes)) |

**Its query: how many minutes behind schedule.** The alert query is exactly the same as the `Minutes behind schedule` table in [3.2](#32--the-minutes-late-table-the-same-query-as-the-alert-plus-a-temporary-last_seen-column-15-minutes), so you can see the number that will wake you up on the dashboard first:

```sql
SELECT d.device_id, coalesce(d.name, d.device_id) AS node,
       round((EXTRACT(EPOCH FROM now() - coalesce(r.received_at, d.registered_at)) / 60
              - CASE WHEN d.kind = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS minutes_late
FROM devices d
LEFT JOIN LATERAL (SELECT received_at FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
WHERE d.registered_at IS NOT NULL AND d.revoked_at IS NULL
```

- `LEFT JOIN LATERAL (… ORDER BY ts DESC LIMIT 1)` takes the **newest** reading of every device, then uses its `received_at` column: the backend's clock when that reading arrived ([Module 17 Concept 9](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#9-time-timestamptz-utc-and-wib)), not the device's clock.
- Because it starts from `devices` with a `LEFT JOIN`, **every** registered device always has one row, dead ones too. A device that has never sent anything is counted from when it was registered (`coalesce(…, d.registered_at)`).
- `- CASE WHEN d.kind = 'node2' THEN 5 ELSE 0 END`: Node 2 is deliberately silent for 5 minutes between two packets, so those 5 minutes aren't lateness. A negative number means the next packet isn't due yet.
- So `> 5` means: Node 1 more than 5 minutes without a reading (±30 messages missed); Node 2 more than 10 minutes since its last packet.

In the author's lab, table 3.2 once showed `Practice porch 32.9` (red: a practice device that's registered but not running), `Garden (mock) -3.3` (its next packet isn't due yet), and `Practice living room 0.1`.

**Grouping: 30 seconds, 5 minutes, 4 hours.** After a node goes `Firing`, its message isn't sent at once. With `device_id` in **Group by** (through **Override grouping**), every node has its own group: the messages of Node 1 and the Garden come as separate messages and don't wait for each other. The three default pauses are already written in the form and don't need changing ([4.4](#44-grouping-notifications-group-wait-group-interval-and-repeat-interval-8-minutes)):

| Pause | What it means |
| :--- | :--- |
| group wait 30 seconds | a group's first message is held for 30 seconds, waiting for similar messages. In the author's lab, the evaluation at 06:07:30 WIB produced a 🔴 at 06:08:00 |
| group interval 5 minutes | the next change in that group, ✅ included, is sent on the 5-minute beat after the previous message |
| repeat interval 4 hours | a node that's still silent is reminded about again every 4 hours (according to the documentation; the author didn't wait for it) |

**The waiting-time formula, for Practice 5.** For Node 2, `minutes_late` passes 5 when its last packet is 10 minutes old (schedule 5 + threshold 5). The next evaluation comes within 0–60 seconds, then the 30-second group wait:

> 🔴 arrives = last packet + 10 minutes + (0–60 seconds of evaluation) + 30 seconds = **10.5–11.5 minutes after the last packet**

The battery can be pulled out any time between two packets, that is, 0–5 minutes after the last packet. So the 🔴 arrives **5.5–11.5 minutes after the battery is pulled out**: at the earliest when it's pulled just before the next packet, at the latest when it's pulled just after a packet. For Node 1, which sends every 10 seconds, the same formula gives ±5.5–6.5 minutes after the last reading. The range of the author's two lab runs: the Garden pulled just after a packet (phase A in the picture) → 🔴 **10 min 52 s – 11 min 10 s**; pulled just before the next packet (phase B) → **5 min 55 s – 6 min 20 s**; the Node 1 simulator stopped with **Ctrl + C** → **5 min 46 s – 5 min 58 s**. Grafana's ✅ waits for the next group interval beat, so it arrives at most about 5 minutes after the evaluation that sees the node recover; in the author's lab, **3 min 22 s – 4 min 26 s** after recovery. The picture below sums up the chain, the Garden's timeline, and this formula; its messages come from a different run than the message table below, so the times and numbers aren't the same.

![Diagram the journey of one alert from a query every minute to Telegram (Concept 7), the Silent node rule; numbers from the author's lab recordings, mock Garden, mock Telegram. Five stages: 1 a query every 1m, group node-health, minutes since the last reading (readings.received_at), Node 2 minus its 5-minute schedule, Format Table = one row per node; 2 the condition, on screen WHEN Last OF QUERY IS ABOVE 5 (YAML, History: A SQL, B Reduce, C Threshold), Pending period None, No data Normal, Error Error; 3 the state per node, Normal then Firing, labels device_id + node, Pending skipped because Pending period is None; 4 Override grouping device_id, Group wait 30s, Group interval 5m, Repeat interval 4h; 5 the contact point Telegram Smart Home (Module 19 bot, Parse Mode None, its own template, HTTPS). The exact messages of one run, Garden pulled then put back: 🔴 Garden (mock) (f00d000000b2) is not sending data, 5.5 minutes behind schedule (Grafana, 10 min 52 s after the pull); 📴 f00d000000b2 offline since 00:17 WIB (backend, 17 minutes after the last packet); ✅ f00d000000b2 back online (offline 1 min) (backend, right away); ✅ Garden (mock) is sending data again. (Grafana, 3 min 49 s after it is put back). Timeline 0–18 minutes after the last packet: the packet at 0, the packets every 300 s no longer come; 5 minutes behind schedule at minute 10; 🔴 arrives between 10.5 and 11.5; the offline status at 16 (960 s, by Node 1); the backend 📴 at 17. Phase A pulled 6.8–8.9 s after a packet: 🔴 10 min 52 s – 11 min 10 s after the pull; phase B pulled 6.3–6.7 s before the next packet: 🔴 5 min 55 s – 6 min 20 s. Formula: last packet + 10 minutes + 0–60 s evaluation + 30 s group wait; the battery is pulled 0–5 minutes after a packet, so 🔴 arrives 5.5–11.5 minutes after the pull. Table who reports what, the range of the author's two lab runs: Node 1 (simulator stopped): Grafana 🔴 data stopped arriving 5 min 46 s – 5 min 58 s, backend 📴 connection lost ±1 minute (the will + 60 s), recovery backend at once, Grafana +3 min 22 s – 4 min 26 s; Node 2 (the Garden pulled): Grafana 5 min 55 s – 11 min 10 s, backend ±17 minutes after the last packet (960 s + 60 s), recovery Grafana +3 min 38 s – 4 min 14 s; two messages on purpose. Three traps: database down, messages without a node name: the rule is Error (DatasourceError), a message without a node name (no value written in square brackets), then ✅ is sending data again without a name; in the lab with a 1m group, the DB down 76 to 80 seconds, a node that was Firing stayed Firing, no false ✅; a false ✅ was only seen in research with an evaluation every 10 seconds, the DB down 2 minutes or more not tested; backend down: every node 🔴 at once, a backend watchdog in Module 30; silent is not the offline status: when the Garden offline status is published, the alert query says 11 minutes late while last_seen is 0 minutes ago, so the alert uses readings.received_at.](assets/alert-journey.png)

**Silent is not the same as offline.** Why not just use the `offline` status? Because those two words answer different questions:

- **The `offline` status** is the official message that the connection is lost: Node 1's MQTT will, or Node 1's message about Node 2 after 960 seconds without a packet. This is what the backend uses for 📴, the badge on the List, and the color of the Map marker.
- **Silent** means there's no new reading in `readings`. This is what Grafana measures.

A device can be `online` and silent at the same time. In the author's lab, when the simulator `f00d00000001` was stopped, the Garden, whose packets that simulator publishes, went silent too for 11 minutes and had already received Grafana's 🔴, but its status stayed `online`: its linking device was dead, so nobody published the Garden's status. During that time, the backend sent no 📴 for the Garden, and its marker on the Map stayed green ([7.4](#74--test-the-map-attribution-live-status-the-viewer-account-a-375-px-phone-and-dark-mode-10-minutes)). A real Node 2 goes through the same thing if Node 1 dies.

The `devices.last_seen` column isn't "the last data" either: the backend moves it forward for every message of that device, including status messages, the will, and retained statuses after the backend restarts. Exactly when the Garden's `offline` status was published, the author ran the query of table 3.2 plus a temporary `last_seen` column, as `grafana_reader` in psql:

```text
  device_id   |         node         | minutes_late |           last_seen           | minutes_since_last_seen 
--------------+----------------------+--------------+-------------------------------+-------------------------
 f00d00000001 | Practice living room |            0 | 2026-10-26 23:34:38.965184+00 |                       0
 f00d000000b2 | Garden (mock)        |           11 | 2026-10-26 23:34:41.376101+00 |                       0
(2 rows)
```

The Garden had been without a packet for 16 minutes (`minutes_late` 11), but its `last_seen` is "0 minutes ago": that's the time of that `offline` status message itself (psql prints UTC; 23:34:41 UTC = 06:34:41 WIB). That column is left as it is in this module; Grafana, the alert, and the report use `readings.received_at`, and the fix is noted for Modules 28 and 30.

**Not Module 23's "stale data".** [Module 23](../module-23-realtime-dashboard/README.md#7-alive-isnt-always-fresh-status-last-seen-and-stale-data) already gave a `· stale data` mark per device kind: 30 seconds for Node 1, 16 minutes for Node 2. That's a **label on the screen**: cheap, allowed to appear quickly, but only there while the screen is open. An alert **wakes people up**, so its threshold is deliberately more patient for Node 1 (5 minutes), and for Node 2 it's actually much faster than 16 minutes, because it's counted from its wake-up schedule, not from the `offline` status.

**The "No data" and MissingSeries trap.** A way that looks simpler, "tell me when the query for the readings of the last 5 minutes is empty", fails silently. A dead node doesn't appear as a row; for Grafana its row is **missing** (a missing series), and a missing instance is considered **resolved** after 2 evaluations (`Normal (Missingseries)`). In the author's research, with that pattern the rule went back to `Normal` as soon as Node 1 sent again, and Node 2, still dead, wasn't reported; its "No Data" message even came without a node name. Our query prevents both, because a dead node still has a row with a number that keeps growing. That's why **No Data** in the form is changed to **Normal** ([4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes)): an empty result only happens when there's no registered device. A row can still go missing in one way: a device's key is revoked while the rule is already active. In the author's code test lab, `Practice porch`, which was 🔴, disappeared from the query once its key was revoked and got the message `✅ Practice porch is sending data again.`, although that device had never sent anything. So the keys of devices you don't run are revoked **before** the rule is created ([4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes)).

**Who reports what.** The Module 19 backend already sends 📴/✅ messages ([Module 19's 6.8](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#68-test-the-offline-message-wait-60-seconds)), and this module doesn't change them, apart from patching a false 📴 after the broker restarts ([6.3](#63-mqttts-no-longer-sends-a-false-offline-message-then-npm-run-check-and-npm-test-10-minutes)). So one event can produce two messages, from the same bot to the same chat. That's on purpose, because they answer different questions for different audiences:

| | Backend (Module 19) | Grafana (this module) |
| :--- | :--- | :--- |
| Its question | has the device's connection been lost? | has the data stopped arriving? |
| Read from | the `offline` status (the will, or Node 1 for Node 2) | `readings.received_at` |
| Its messages | `📴 <id> offline since HH:MM WIB`, then `✅ <id> back online (offline N min)` | `🔴 <name> (<id>) is not sending data, N minutes behind schedule`, then `✅ <name> is sending data again.` |
| Node 1 dies | the will + 60 seconds (±1 minute) | ±5.5–6.5 minutes |
| Node 2 dies | ±17 minutes after the last packet (960 + 60 seconds) | 5.5–11.5 minutes after the pull |
| Recovery | at once | on the group interval beat, at most ±5 minutes |
| Doesn't see | a node that's `online` but silent; a status published while the backend was off | a dead backend (every node looks silent, see risk 2) |
| For | the residents | the technical team |

These are the messages received by the mock Telegram server in the author's lab when the Garden was pulled just after a packet (`garden pull` 06:18:49 WIB, `garden insert` 06:35:46 WIB):

| Time WIB | From | Message |
| :--- | :--- | :--- |
| 06:30:00 | Grafana | `🔴 Garden (mock) (f00d000000b2) is not sending data, 5.8 minutes behind schedule` |
| 06:35:41 | backend | `📴 f00d000000b2 offline since 06:34 WIB` |
| 06:35:46 | backend | `✅ f00d000000b2 back online (offline 1 min)` |
| 06:40:00 | Grafana | `✅ Garden (mock) is sending data again.` |

Grafana reports the 🔴 more than 5 minutes earlier; the backend reports the recovery faster. This split is a small version of the "who watches what" matrix in [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data): the backend for home rules and offline devices, Grafana for technical metrics, and a service watcher for the backend itself.

**Five risks you should know before you trust this alert.**

1. **Format `Table` works, although the documentation says otherwise.** Grafana's documentation on PostgreSQL alerts says `Table formatted queries aren't supported`, but in Grafana 13.2.4 the `Table` format was proven to work in every one of the author's labs, one row per node. A future release may follow its documentation, and a backup in Time series format hasn't been proven yet ([🔬](#-technical-deep-dive-optional) *Three extra settings …*). That's one more reason the version is locked.
2. **A dead backend → every node 🔴.** `readings` is filled by the backend; when the backend stops, there are no new readings, so every node looks silent. In the author's lab, the backend process was frozen (paused) for 18 minutes: Grafana reported 🔴 for Node 1 and the Garden, although both kept sending, their status stayed `online`, the Map stayed green, and there was no 📴. A watcher for the backend itself only comes in Module 30.
3. **A dead database → messages without a node name.** Grafana can't run its query, the rule becomes `Error` (`DatasourceError`), and its message comes without labels: `🔴 [no value] ([no value]) is not sending data,  minutes behind schedule`, then 5 minutes later `✅  is sending data again.` (two spaces, no name). In the author's lab, the database was down for ±80 seconds while Node 1 was 🔴, and Node 1 stayed `Firing`, without a recovery message; a database down for 2 minutes or more wasn't tested. The rule: a message without a node name means a database or Grafana problem, not a node problem.
4. **A registered device that isn't running goes 🔴 at once.** In the author's code test lab, `Practice porch` got a 🔴 `12.5 minutes behind schedule` as soon as the rule was saved. Revoke its key first in [4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes). On the laptop path, **don't** revoke `f00d00000001`: that simulator is also the Garden's linking device.
5. **The decimal point.** The message always writes `5.8` with a decimal point, even on a computer set to a decimal comma: that's how Grafana writes numbers, and this module quotes it as it is.

One more limit from Concept 2: Grafana and its alerts only work while the laptop is on.

This concept is used in [3.2](#32--the-minutes-late-table-the-same-query-as-the-alert-plus-a-temporary-last_seen-column-15-minutes), [4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes)–[4.5](#45-the-status-of-each-node-in-the-instances-tab-normal-and-firing-7-minutes), [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes)–[5.4](#54--put-it-back-two-recovery-messages-and-the-timing-sheet-10-minutes), and [7.4](#74--test-the-map-attribution-live-status-the-viewer-account-a-375-px-phone-and-dark-mode-10-minutes). The related symptoms are collected in the **Alerts and Telegram** group in [🚨](#-troubleshooting).

> ⬆️ **Done reading Concept 7?** Continue to [Practice 4](#practice-4--the-silent-node-alert-and-a-telegram-contact-point-55-minutes), then [Practice 5](#practice-5--pull-the-gardens-battery-alert-and-recovery-45-minutes). Save [Concept 8](#8-maps-coordinates-tiles-and-attribution) for the waiting time in [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes).

### 8. Maps: coordinates, tiles, and attribution

The Syllabus asks for a device map with Leaflet and OpenStreetMap, from the `lat` and `lng` columns of the `devices` table. Those columns were [prepared in Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#3-tables-rows-columns-types-and-the-primary-key) and, until last week, had never appeared on any screen. The **Map** page in dashboard 1.1.0 draws every device that has a point as a colored circle on top of a street map. There are three things to understand before you build it: how a point is written, where the map pictures come from, and the rules for using those pictures.

**Coordinates: two decimal numbers with a point.** A point on Earth is written as a **latitude** (`lat`) and a **longitude** (`lng`), in decimal degrees. Latitude runs from −90 to 90 (negative = south of the equator), longitude from −180 to 180 (positive = east of Greenwich). Jakarta is around latitude `-6.2` and longitude `106.8`. The decimal separator is always a **point**, never a comma: `-6,2` in JSON isn't a number (Concept 9). The database has guarded those ranges since Module 17 (`CHECK (lat BETWEEN -90 AND 90)`).

**Tiles: a map made of picture pieces.** A street map isn't sent as one giant picture. It's cut into **tiles**, square pictures of 256 × 256 px, and the browser only downloads the tiles currently in view. The official OpenStreetMap (OSM) tile address:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

`{z}` is the zoom level: 0 means the whole world in one tile, and every level splits each tile into four; OSM tiles exist up to zoom 19, where one tile is only a few dozen meters wide. `{x}` and `{y}` are the tile's column and row numbers at that level. Leaflet works out by itself which tiles to ask for. Tiles are downloaded **by the browser straight from the OSM server**, not through the backend, so the Map page needs the internet. In the code test lab, when the tiles were blocked (imitating a laptop without internet), the map box turned into gray squares, but the device circles and the attribution were still drawn.

**The OSM tile server is free, with rules.** That server is run by the OpenStreetMap Foundation. Its [tile policy](https://operations.osmfoundation.org/policies/tiles/) (read on 26 Oct 2026) asks for a few things, and this module follows them:

| OSM rule | In our dashboard |
| :--- | :--- |
| use the official address above: `https://`, without `{s}.` (the old `a.`/`b.`/`c.tile…` addresses can be slow or closed) | the constant `MAP.tiles` in `src/map.ts` |
| the OSM attribution **clearly visible** on the map, not hidden behind a button | shown by Leaflet in the bottom-right corner |
| no bulk downloads, no prefetching (downloading in advance), and no offline use | only the tiles in view; nothing is stored |
| no guarantee (no SLA): access can be blocked without notice if the use does harm | one home with two or three points is far below "heavy use" |
| "Avoid hard-coding the tile URL": don't plant the tile address in many places | the address and the attribution are only in one file, `src/map.ts` |

**Attribution: the required credit line.** OSM's map data are collected by its contributors (hence the word *contributors*), and the tile policy requires their license credit to be visible. In the author's lab (the production build, real OSM tiles), the bottom-right corner of the map says:

```text
 Leaflet | © OpenStreetMap contributors
```

The right part comes from `MAP.attribution`, with a link to OSM's copyright page. The left part (the `Leaflet` link and a small flag) is Leaflet 1.9.4's default prefix; we leave it as it is.

**Markers: circles, not icons.** Leaflet has two common ways to mark a point. The default pin icon (`Marker`) is a picture file. In the author's research lab, that icon showed in `npm run dev`, but **disappeared after `npm run build`**, because Vite changes the address of its picture file, and the fix recipe that only uses `mergeOptions` broke dev mode instead. We use **`CircleMarker`**: a circle drawn as SVG, without any picture file, whose color can carry the status. In the author's lab, the production build drew 3 circles and 0 icons.

![Diagram device map: points from the database, colors from the live status (Concepts 8–9). Top, four cards with arrows: the devices table, columns lat, lng since Module 17 (example f00d00000001 -6.1754, 106.8272; f00d00000002 -6.17532, 106.82705; f00d000000b2 -6.17548, 106.82735; fictional points around Monas); backend 1.2, GET /devices carries lat, lng for admin and viewer, PUT /devices/:id/location admin only; the frontend store Zustand, GET /devices fetched again every time the Map opens, the live status from Socket.IO without polling; the /map screen, the Map menu, one circle per device with a point. An illustration of the Map screen, not a screenshot: 256 px tiles, zoom buttons, two green circles and one gray (f00d00000002, not running), the popup Practice living room, living room · f00d00000001, Online, last seen 12 seconds ago, Open details; the attribution Leaflet | © OpenStreetMap contributors. Legend: green online, gray not online or its messages are ignored by the backend; height h-96 = 384 px. Notes: tiles from https://tile.openstreetmap.org/{z}/{x}/{y}.png, needs the internet, no bulk downloads or offline storing, zoom 19 at the closest; the attribution must be visible; CircleMarker, not the Marker icon that disappears after npm run build, green #15803d, gray #64748b; silent is not the status: a pulled Garden stays green until its offline status is published (16 minutes), the Silent node alert is faster. Licenses Leaflet BSD-2, react-leaflet Hippocratic-2.1 (not an OSI license). Bottom, the admin sets the point through Bruno set device location: PUT /devices/f00d00000001/location with lat -6.1754, lng 106.8272; a log without coordinates: map point of f00d00000001 set by account 1; the Bruno file uses a4cf12e5b7c0 (Node 1), laptop path: change it to f00d00000001. Answers: 200 admin; 403 viewer, viewer accounts can only look; commands and changes are admin-only; 400 the text -6,2, body/lat must be a number with a decimal point; 400 the number 91, body/lat latitude at most 90; 404 f00d0000ffff isn't in the device list; 200 lat and lng null, the point is removed. Orange box: home coordinates = personal data; blur them before a screenshot or video is shared.](assets/map-from-the-database.png)

**Just two colors: green and gray.** The map's question is "which ones are healthy?". **Green** (`#15803d`) means the device is `online` and its messages are accepted by the backend. **Gray** (`#64748b`) means everything else: `offline`, offline mode, unknown, or its key is revoked or not registered ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#72-first-layer-revoke-it-in-the-backend-5-minutes)), so the backend ignores its messages. This is deliberately different from the red `Offline` badge on the List cards ([Module 23](../module-23-realtime-dashboard/README.md#7-alive-isnt-always-fresh-status-last-seen-and-stale-data)), which answers "still connected or not". Color is never alone: the legend below the map says `online` and `not online, or its messages are ignored by the backend`, and every marker's popup (the info box that opens when a circle is clicked) shows the name, location, status, and "last seen". The colors follow the live status from Socket.IO, without polling. In the author's lab, after **Ctrl + C** in the simulator terminal, the `f00d00000001` marker turned gray ±0.7 seconds later without a reload. However, **the Garden stays green**: it went silent too because its linking device died, Grafana sent a 🔴 for it ±11 minutes after its last packet, and its status in the database stayed `online`. The map shows the **status**, not "still sending data or not" ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)). In dark mode, the popup goes dark too, but the tiles stay light: we don't invert the tile colors.

**Two libraries, two licenses.** **Leaflet 1.9.4** draws the map (BSD-2-Clause license, a permissive open-source license). Leaflet 2.0 is still alpha, and react-leaflet 5 doesn't support it yet. **react-leaflet 5.0.0** wraps Leaflet into React components (`MapContainer`, `TileLayer`, `CircleMarker`, `Popup`), and the Syllabus names it as this module's tool. The license of react-leaflet and its core library, `@react-leaflet/core`, is the **Hippocratic License 2.1**: free to use, but with an extra condition, namely that it isn't used to violate human rights (the license text refers to the UN Universal Declaration of Human Rights). A conditional license like this isn't on the list of open-source licenses approved by the OSI (Open Source Initiative). This module still uses it because the Syllabus names it, and says so plainly so that you can weigh it yourself. This isn't legal advice: if you build a product one day, read the license. If you'd rather go without a wrapper, plain Leaflet (BSD-2) can be used directly in a React component ([🔬](#-technical-deep-dive-optional) *Leaflet without a wrapper …*).

**Home coordinates are personal data.** Your home's point tells anyone where you live, and an uploaded map screenshot carries that point. Every example in this module uses **fictional points around Monas, Jakarta** (a public place): `f00d00000001` at `-6.1754, 106.8272`, `f00d00000002` at `-6.17532, 106.82705`, and the Garden `f00d000000b2` at `-6.17548, 106.82735`. If you use real points, round or blur them before screenshots and the checkpoint video are shared ([10.2](#102-a-6090-second-phone-demo-video-the-script-and-what-must-not-be-recorded-15-minutes)).

**Honest about its usefulness.** For one home, the points are only a few meters apart, so a map at zoom 18 feels almost empty. A map only becomes really useful when devices are **spread out**: a garden on another plot, the device fleet of Module 28, or a Module 31 final project such as smart farming or a GPS asset tracker. The framework is the same: points in the database, the map in the browser.

The details are in [7.2](#72-mapts-and-devicemaptsx-tiles-attribution-and-markers-colored-by-status-22-minutes) (`map.ts`, `DeviceMap.tsx`), [7.3](#73-maptsx-the-map-route-for-admin-and-viewer-then-the-map-menu-10-minutes) (the route and the menu), and [7.4](#74--test-the-map-attribution-live-status-the-viewer-account-a-375-px-phone-and-dark-mode-10-minutes) (tests). The map inside Grafana itself (Geomap) is discussed in [🔬](#-technical-deep-dive-optional) *Grafana's Geomap versus react-leaflet*; a gray map, a map 0 px tall, or one without markers is in [🚨](#-troubleshooting).

> ⬆️ **Done reading Concept 8?** If you read it while waiting, go back to [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes). The map is only built in [Practice 7](#practice-7--the-map-page-with-react-leaflet-60-minutes), after the backend sends its points in [Practice 6](#practice-6--backend-12-device-locations-through-the-api-45-minutes) (Concept 9).

### 9. A location is device data: an API, not something stuck on the screen

The quickest way to put a point on the map is to write it in the frontend code, for example `{ f00d00000001: [-6.1754, 106.8272] }`. That way breaks quickly: every moved point means editing the code and building again, a new device doesn't appear by itself, and only that screen knows the points. A point is **device data**, just like `name` and `location` ("living room"). Its place is in that device's row of the `devices` table, in columns that have existed since Module 17:

```sql
  lat        double precision CHECK (lat BETWEEN -90 AND 90),
  lng        double precision CHECK (lng BETWEEN -180 AND 180),
```

From there, every reader takes the same point: the admin and viewer dashboards, on a laptop or a phone, even Grafana (`grafana_reader` may read the `lat` and `lng` columns, Concept 3). One source of truth, filled through one door.

**What backend 1.1 doesn't have yet.** `GET /devices` doesn't send `lat` and `lng` yet (neither is in the `COLUMNS` list of `db/devices.ts`), and there's no route to fill them. The only project code that ever wrote those two columns is `npm run seed-history` (Module 17), which gives the two practice devices **exactly the same** point, `-6.2, 106.8`: two markers would pile up. Backend **1.2.0** adds two things:

| Change | For | Content |
| :--- | :--- | :--- |
| `GET /devices` carries `lat` and `lng` | admin and viewer | numbers in decimal degrees, or `null` when not set yet |
| a new route `PUT /devices/:id/location` | admin only | `{ "lat": -6.1754, "lng": 106.8272 }` |

**Two guards you already know.** [Module 20's role guard](../../phase-3-backend-data/module-20-user-security/README.md#6-a-guard-at-every-door-the-admin-and-viewer-roles) already refuses viewers for every request other than reading, so this route needs no new guard code; `PUT` is also already in the backend's list of CORS methods. The body is checked by the Zod schema `LocationBody` ([Module 24 Concept 8](../module-24-control-rules-roles/README.md#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend)): numbers with a decimal point, the same ranges as the database `CHECK`, not `NaN`/`Infinity`, and **in pairs**, because half a point can't be drawn. `{ "lat": null, "lng": null }` removes the point. Other fields, the `location` text included, are refused: this route only moves the point. Its answers in the author's lab (`PUT /devices/f00d00000001/location`):

| Body | Answer |
| :--- | :--- |
| admin, `{"lat": -6.1754, "lng": 106.8272}` | `200`, the device with its new point |
| viewer, the same body | `403` `viewer accounts can only look; commands and changes are admin-only` |
| `{"lat": "-6,2", …}` | `400` `body/lat must be a number with a decimal point, for example -6.1754 (not the text "-6,1754")` |
| `{"lat": 91, …}` | `400` `body/lat latitude at most 90` |
| `PUT /devices/f00d0000ffff/location` | `404` `f00d0000ffff isn't in the device list` |
| `{"lat": null, "lng": null}` | `200`, the point is removed |

The backend log records who moved it, **without** the coordinates (personal data, Concept 8): `map point of f00d00000001 set by account 1`.

**Points aren't live.** Socket.IO only carries telemetry, statuses, and events. Points rarely change, so the Map page simply fetches `GET /devices` again **every time it's opened**. In the code test lab, a point changed through the API while the Map was open didn't move; after switching to the **Devices** menu and back to **Map**, its marker moved without **F5**. If that refetch fails, the map still shows the old points, plus the toast `Couldn't reload the device list: the map points may not be the latest.` The diagram in Concept 8 draws the whole flow: the column → `GET /devices` → [the Zustand store](../module-23-realtime-dashboard/README.md#4-one-store-for-every-screen-zustand-and-selectors) → `/map`, with the `PUT` from Bruno below it.

**Why 1.2.0, and without a migration.** The columns already exist, so there's no new migration. Version numbers in this curriculum have three parts, MAJOR.MINOR.PATCH (the SemVer pattern, covered fully in Module 29): PATCH for fixes without new features (1.1.0 → 1.1.1), MINOR for new features that don't break old users (1.1.0 → 1.2.0), MAJOR for changes that force old users to change too (2.0.0). Map points and the daily report are new features; extra columns and a new route don't break old users (in the code test lab, the `check-schema` of dashboard 1.0.0 against backend 1.2 still said `SAME`). So the backend moves up a MINOR to **1.2.0**, and the dashboard with the Map page to **1.1.0**.

The details are in [6.1](#61-lat-and-lng-join-get-devices-dbdevicests-and-the-device-schema-10-minutes), [6.2](#62-the-locationbody-schema-and-the-admin-route-put-devicesidlocation-15-minutes), and [6.4](#64--version-120-docs-and-the-bruno-request-set-device-location-200-403-400-10-minutes); you test a point that moves after the Map is opened again in [7.4](#74--test-the-map-attribution-live-status-the-viewer-account-a-375-px-phone-and-dark-mode-10-minutes). Confusing `400`/`403`/`404` answers are in [🚨](#-troubleshooting). Moving a point by moving its marker right on the map is [🧩 Level 2](#level-2--move-a-devices-point-right-on-the-map-fill-in-the-blanks-45-minutes).

> ⬆️ **Done reading Concept 9?** Continue to [Practice 6](#practice-6--backend-12-device-locations-through-the-api-45-minutes), then [Practice 7](#practice-7--the-map-page-with-react-leaflet-60-minutes).

### 10. The daily report: it arrives by itself every morning, as long as the backend is running

The backend's 📴 messages (Module 19) and Grafana's 🔴 (Concept 7) wake you up when there's a problem **now**. What's still missing is a summary you can keep: what yesterday's temperature was, how many readings came in, how weak the worst signal was, how many times a device disconnected. This module's daily report is your home's "morning paper": a CSV file that the backend sends to Telegram at 07:00 WIB, without you opening the dashboard.

**Who rings the alarm clock?**

| Option | Used? |
| :--- | :--- |
| node-cron in the backend (`services/reports.ts`) | **yes**: node-cron 4.6.0 has been there since [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#8-scheduling-an-alarm-clock-for-the-server), and the backend already holds the database and the Telegram bot; no new package |
| the operating system's scheduler (cron, a systemd timer, Task Scheduler) running a script | no: the script would need its own database access and token, and the recipe differs per OS; the OS scheduler belongs to Module 30 |
| the backend's schedule rules (Modules 19, 24) | no: their action can only be a command to a device, and a report isn't a command |

**"Yesterday" by the WIB clock, counted from the scheduled time.** The 07:00 WIB report on the 27th contains the 26th, from 00:00 to 24:00 WIB. The database stores UTC, and WIB has no daylight saving time, so 00:00 WIB is always 17:00 UTC the day before. In the author's lab, yesterday's report requested on 27 Oct at 04:08 WIB answered `"file":"report-2026-10-26.csv","from":"2026-10-25T17:00:00Z","to":"2026-10-26T17:00:00Z"`. `reportRange()` finds the WIB date through `Intl`, not from the laptop's zone: the author's laptop uses WITA, and its tests are deliberately run in the New York zone. The reference is the **scheduled** time, not the time when the function runs, so a 23:50 schedule that only runs at 00:01 (the laptop just woke up) still reports the right day. The schedule is given `timezone: "Asia/Jakarta"`; without it, `0 7 * * *` means 07:00 by the laptop's clock (on a WITA laptop: 06:00 WIB). You already tried the same calculation in SQL in [🔁 Step 3](#step-3--yesterday-by-the-wib-clock-date_trunc-and-at-time-zone).

![Diagram the daily report: it arrives by itself every morning, while the backend runs (Concept 10); services/reports.ts, REPORT_SCHEDULE default 0 7 * * * WIB. Steps: 1 schedule 07:00 WIB, node-cron in the backend, timezone Asia/Jakarta (even a WITA laptop sends at 07:00 WIB), a 5-field cron (6 fields refused), log daily report running on schedule; 2 the range yesterday 00:00–24:00 WIB, from 2026-10-25T17:00:00Z to 2026-10-26T17:00:00Z = the content of 26 Oct, sent on the morning of 27 Oct; 3 one query for every registered, unrevoked device: readings_hourly (reading count, temperature, humidity, soil), device_health (RSSI, heap, restarts), events (disconnects); 4 CSV with the Module 23 recipe on the server, example rows f00d00000001 Practice living room node1 with 363 readings, 27.9 and f00d000000b2 Garden (mock) node2 with empty vitals; BOM EF BB BF, comma separator, decimal point, CRLF, 15 columns, file name report-2026-10-26.csv; 5 sendFile() in telegram.ts, sendDocument + InputFile(Buffer, name), the same bot; the trap InputFile with text = a file path. Telegram (purple): report-2026-10-26.csv, 302 bytes, caption 📊 Mini Smart Home daily report 26 Oct 2026: 2 device(s), the text the mock Telegram received (rehearsal 00:04:00 WIB). When it is not usual: the laptop asleep at 07:00 (orange), up to 15 minutes late still runs, longer a log line + a ⏰ message to Telegram, the report NOT sent afterwards: ⏰ The daily report of 27 Oct 2026, 07:00 WIB was missed (laptop asleep or backend busy?). Send it now with POST /reports/send; the backend fully off: no record. Telegram off (empty token): log WARN: daily report skipped: Telegram off (TELEGRAM_BOT_TOKEN is empty), the test button answers 409. The test button POST /reports/send (purple): admin only, viewer 403, Bruno send report now; ?day=today gives report-2026-10-27-partial.csv; a content test, NOT proof of automation. Bottom, the G3 evidence, a hands-off rehearsal: 1 save .env REPORT_SCHEDULE=4 0 * * *; 2 node --watch restarts the backend, next 27 Oct 2026, 00:04 WIB; 3 hands off; 4 at 00:04:00 daily report running on schedule, Telegram sent: file report-2026-10-26.csv (302 bytes); 5 back to REPORT_SCHEDULE=0 7 * * *.](assets/daily-report.png)

The numbers in the picture (a rehearsal at 00:04 WIB, 302 bytes, 363 readings) come from another test run; the times and sizes on your screen will differ.

**Its content: one query, four sources, 15 columns.** One SQL query summarizes every device at once, one row per device:

| Source | Columns |
| :--- | :--- |
| `devices` | `device_id`, `name`, `kind` (only registered devices whose key hasn't been revoked) |
| `readings_hourly`, [Module 18's summary book](../../phase-3-backend-data/module-18-timescaledb/README.md#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk) | `reading_count`, `avg_temp`, `min_temp`, `max_temp`, `avg_humidity`, `avg_soil`, `min_soil` |
| `device_health` (vitals) | `avg_rssi`, `worst_rssi`, `min_heap`, `restarts` (how many times uptime dropped) |
| `events` (the event log) | `disconnects` |

A device that's silent all day still has a row, with a `reading_count` of `0`. Node 2's vitals columns are always empty, because Node 2 doesn't send `vitals`. A device whose key is revoked is **not** included: in the author's lab, yesterday's report held `2 device(s)`, because `f00d00000002` was revoked in [4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes), although it had 144 readings yesterday. If your devices weren't running yesterday, their rows only hold `0` and empty cells; to see numbers, ask for today's partial report (`?day=today`), named `report-YYYY-MM-DD-partial.csv`.

**Module 23's CSV recipe, now on the server.** `services/csv.ts` uses [the `src/csv.ts` recipe of Module 23](../module-23-realtime-dashboard/README.md#82-srccsvts-and-the-download-csv-button-15-minutes): a comma separator, a decimal point, a 3-byte BOM at the start, and every row ending in CRLF, so that the file opens neatly in a spreadsheet with English regional settings. The author tested neither Excel nor LibreOffice; the file is prepared for both. The partial report received by the mock Telegram server in the author's lab (`<BOM>` = the bytes `EF BB BF`):

```text
<BOM>device_id,name,kind,reading_count,avg_temp,min_temp,max_temp,avg_humidity,avg_soil,min_soil,avg_rssi,worst_rssi,min_heap,restarts,disconnects
f00d00000001,Practice living room,node1,246,28.5,21.6,33,70,41.7,20,-59,-79,181094,0,1
f00d000000b2,Garden (mock),node2,8,28.2,26.8,29.4,68,40.6,35,,,,,0
```

**A file, not text.** The same Module 19 bot sends it through Telegram's `sendDocument` (files up to 50 MB, captions up to 1,024 characters). Its new function, `sendFile()` in `telegram.ts`, turns the CSV text into bytes first: `new InputFile(Buffer.from(content, "utf8"), name)`. The trap: grammY takes `new InputFile("text…")` as a **file path** on the disk, so it fails with `ENOENT`, or with `File paths cannot contain carriage-return (\r) or newline (\n) characters!` when the text contains line breaks and no file name is given ([🔁 Step 5](#step-5--text-becomes-a-file-bufferfrom-a-three-byte-bom-and-enoent)). The file is named after the date of its content (`report-2026-10-26.csv`), and its caption is `📊 Mini Smart Home daily report 26 Oct 2026: 2 device(s)`.

**"Automatic", with conditions.** node-cron only rings while the laptop is on and the backend is running. In the author's lab, the default schedule ran at exactly 07:00:00 WIB without being touched. A laptop that's asleep at the scheduled time but wakes up at most 15 minutes later still sends its report. Later than that, the report is **not** sent afterwards and isn't recorded as an event on the dashboard; the backend only writes a log line and sends one message. In the author's lab (test schedule `6 7 * * *`, the backend process frozen for 18 minutes):

```text
⏰ The daily report of 27 Oct 2026, 07:06 WIB was missed (laptop asleep or backend busy?). Send it now with POST /reports/send
```

If the backend is completely off at that time, nobody can report. That's why this concept's title says "as long as the backend is running"; a server that's always on waits in Modules 26–27.

**A five-field cron.** The schedule is set by `REPORT_SCHEDULE` in `.env`, by default `0 7 * * *`: minute, hour, day of month, month, day of week, like the Module 19 schedules. Some tutorials use six fields, with seconds in front. node-cron accepts `0 7 * * * *`, but it means second 0 of minute 7 **of every hour**, that is, 24 reports a day. Backend 1.2 refuses it at startup: `Setting REPORT_SCHEDULE in .env: must have 5 fields: minute hour day month weekday, for example 0 7 * * *`.

**The test button isn't proof of "automatic".** `POST /reports/send` (admin only) sends the same report at once, so that you can check its content; the Bruno request `send report now` adds `?day=today` (a partial report). It answers `409` when Telegram is off (an empty token or chat_id), `502` when Telegram refuses or can't be reached, and `503` when the database can't be reached. The proof of "arrives automatically" (**G3**) is the hands-off dress rehearsal in 9.1: a schedule 3 minutes ahead, then wait without touching anything.

The details are in [8.2](#82-servicesreportsts-yesterdays-wib-range-one-query-and-a-schedule-18-minutes), [8.3](#83-sendfile-in-telegramts-an-inputfile-from-bytes-not-from-text-8-minutes), [8.4](#84-report_schedule-the-post-reportssend-route-and-serverts-12-minutes), and [9.1](#91--a-hands-off-dress-rehearsal-a-schedule-3-minutes-ahead-then-back-to-0700-15-minutes). A PDF report is in [🔬](#-technical-deep-dive-optional) *A PDF report with pdfkit 0.20.2 …*; a report that doesn't arrive or has too few devices, in [🚨](#-troubleshooting); a weekly report is [🧩 Level 3](#level-3--a-weekly-report-every-monday-at-0700-wib-from-scratch-6090-minutes).

> ⬆️ **Done reading Concept 10?** Continue to [Practice 8](#practice-8--backend-12-a-daily-csv-report-to-telegram-60-minutes), then [Practice 9](#practice-9--a-report-that-arrives-by-itself-then-grafana-as-files-35-minutes).

### 11. Buy or build: ready-made IoT platforms

[🔬 Module 13](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#-technical-deep-dive-optional) postponed one question until now: when to buy a ready-made platform, and when to build your own. Now you have something to compare with that you know inside out: the Mini Smart Home, from the firmware to the dashboard. A ready-made IoT platform packs those layers (the data receiver, database, dashboard, rules, notifications, accounts) into one product. The four examples below are the ones the Syllabus names, not a complete list. Their facts were read from official sources on **26 Oct 2026**; licenses and prices can change at any time, so check again before you decide.

| Platform | Form | License and cost | Notes | Source |
| :--- | :--- | :--- | :--- | :--- |
| ThingsBoard CE | self-hosted (Java 17, PostgreSQL 16) | from version 4.4 (latest 4.4.0.1): **Business Source License 1.1** (BSL); production use is free if noncommercial ≤ 1,000 devices, or commercial ≤ 100 devices on one server, with a "Powered by ThingsBoard" logo and a free license key. Releases before 4.4 stay Apache 2.0, and every release becomes Apache 2.0 four years later | its official Pi recipe still installs 4.3.1.7 (Apache 2.0); a Pi with at least 4 GB of RAM | [README & LICENSE](https://github.com/thingsboard/thingsboard), [install on a Pi](https://thingsboard.io/docs/user-guide/install/rpi/) |
| Home Assistant | self-hosted; recommended as Home Assistant OS | Apache 2.0, free (version 2026.10.4) | Pi 5 or Pi 4, at least 2 GB of RAM; already weighed in 🔬 Module 13 and [🔬 Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#-technical-deep-dive-optional) | [home-assistant.io](https://www.home-assistant.io/installation/raspberrypi) |
| Blynk | cloud service | Free plan: 5 devices, 1 user, 1 week of history, 100,000 device messages per month; Starter $29 per month | the server and the data are in the provider's hands | [blynk.io/pricing](https://blynk.io/pricing) |
| Antares | cloud service; an IoT brand of PT Telkom Indonesia | a Free Trial plan exists; prices aren't published on its website or in its documents (plans only show in the console after logging in) | MQTT 1883/8883, HTTP, CoAP, LoRaWAN; ESP32 examples | [antares.id](https://antares.id), [docs.antares.id](https://docs.antares.id) |

**Seven questions before you choose.**

| Question | Mini Smart Home (building) | Ready-made platform (buying) |
| :--- | :--- | :--- |
| Where do the data live, and who holds them? | on your own laptop and Pi | cloud service: on the provider's server; self-hosted: on your server |
| Does the license allow your plan? | your own code on top of free software; the licenses are still read (for example react-leaflet, Concept 8) | read the terms: free plans have limits, the BSL limits production |
| Quotas and cost as devices are added? | no fees, but you pay with your time | free up to a limit, then monthly |
| Is your devices' protocol supported? | MQTT with your own data contract | follow the platform's protocol and format |
| The team's skills? | firmware, backend, and frontend (now you have them) | quick to start with little code |
| How locked in to one provider? | not at all | rules, dashboards, and formats tied to the product; prices and licenses can change one-sidedly |
| How do your data get out? | SQL directly, a daily CSV (Concept 10) | check first: is there an export or an API? |

**Where the Mini Smart Home stands.** This curriculum builds its own because its goal is to **learn** every layer. At work, buying often makes more sense: the deadline is short, the needs are common, the team is small. Building makes sense when the needs are special, the data must stay in your own hands, or the cost per device balloons once there are hundreds. Many teams choose something in between: build what's unique, use ready-made tools for the rest. This week's Grafana is an example: a technical dashboard you don't code, on top of your own database and data contract.

The Node-RED versus Home Assistant table in Module 13 and the discussion of Home Assistant in Module 19 aren't repeated here. Your learning notes in [10.3](#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes) may hold your own answers to these seven questions.

> ⬆️ **Done reading Concept 11?** Continue to [Practice 10](#practice-10--the-phase-4-checkpoint-collect-the-evidence-45-minutes), the Phase 4 checkpoint. If you read it earlier, go back to the practice you're working on.

## 🔧 Step-by-step practice

Ten practices add a technical dashboard, an alert, a map, and a daily report to the Mini Smart Home, in the `mini-smart-home` repository on a new branch, `feature/grafana-maps-reports`. Practices 1–4 and 9.2 are centered on Grafana: the dashboard and the alert are assembled with clicks, without coding, then exported as files. Practices 6 and 8 change the `backend` (up to 1.2.0), Practice 7 changes the `frontend` (up to 1.1.0), and Practice 5 (laptop path) adds the mock Garden to `tools/` and block 2b to `edge/acl-broker`.

All the practices in this module are required, because the Syllabus asks for a dashboard, an alert, a map, and a report all at once. The steps marked ⭐ (1.4, 2.4, 3.2, 4.1, 4.3, 5.3, 5.4, 6.4, 7.4, 8.5, 9.1, 9.2, and 10.4) are the evidence, plus [➕ F](#f--merge-featuregrafana-maps-reports-into-main-via-the-technical-dashboard--map--daily-report-phase-4-checkpoint-pull-request). The only parts you may skip are 3.3 and 9.3 (marked optional), the Grafana-from-a-phone box in Practice 10, 🔬, and 🧩. Pass requirement **G1** is proven in [4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes), **G2** in [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes) and 5.4, and **G3** in [9.1](#91--a-hands-off-dress-rehearsal-a-schedule-3-minutes-ahead-then-back-to-0700-15-minutes); all three are ticked again in Practice 10.

Steps that differ for **the device path** (Kit A + B) and **the laptop path** (simulator + mock Garden) are written separately, mainly in 4.2, Practice 5, and 6.4; the rest is the same. Practices that change project files end with a commit to that branch, which is merged into `main` through a pull request in ➕ F. Practices 2–4 have no commit: the dashboard and the alert rule live in Grafana's cupboard until they're exported to `grafana/` in 9.2.

To compare your work, [`code/stages/`](code/stages/) holds the dashboard JSON at the end of Practices 2 and 3, the `backend` at the end of Practices 6 and 8, and the `frontend` at the end of Practice 7. The final result is in [`code/`](code/): `grafana/`, backend 1.2.0 (`backend/` and its list of changes, `backend-1.2.diff`), dashboard 1.1.0 (`frontend/`), and `tools/` and `edge/` with their diffs. Use them to compare, not to replace your whole folder.

### Practice 1 — A tidy and safe Grafana (30 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and one free terminal for Git, `docker`, and `curl`; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana` from the Quick Win; and **Chrome** or **Edge** with Grafana at `http://localhost:3000`, plus one private window in 1.3. The backend, Vite, and the simulator aren't used in this practice. Concepts used: 2 and 3.
>
> ⭐ **Required** — step 1.4: as `grafana_reader`, a `SELECT` with column names succeeds, while `SELECT *` from `devices`, the `key_hash` column, the `users` and `sessions` tables, `INSERT`, and `DROP TABLE` are refused.

This practice makes sure the Quick Win's result is tidy and safe: its recipe is in Git, the container matches the command, its door is for this laptop only, and its database account really can't write. Haven't done the Quick Win yet? Finish its Steps 1–6 first.

#### 1.1 The `feature/grafana-maps-reports` branch and a `grafana/` folder in your project (5 minutes)

In the free terminal (folder `mini-smart-home`), switch to the latest `main`, then create a branch for all of Module 25's work:

```text
git switch main
git pull
git switch -c feature/grafana-maps-reports
git status
```

`git pull` brings in the result of the Module 24 pull request. `git status` may only name the `grafana/` folder as a new, untracked file: `grafana-user.sql` from [Quick Win Step 4](#step-4--the-read-only-database-account-grafana_reader-6-minutes), which moves along to the new branch. Are other files changed? Sort them out first.

The `grafana/` folder keeps Grafana's **recipe**, without passwords or tokens, so it's safe in Git. Complete it with its instructions. Open [`code/grafana/README.md`](code/grafana/README.md) on GitHub, click **Copy raw file**, then in VS Code right-click the **`grafana`** folder → **New File…**, name it **`README.md`**, paste, and save (**Ctrl + S**). Its content: Quick Win Steps 1–5, how to import again, **Security**, and **Limits**. The two links in its table, `dashboards/system-health.json` and `alerting/silent-node.yaml`, only open after the export in 9.2; this README is reread in [➕ B](#b-reread-grafanareadmemd-how-to-run-it-the-read-only-account-exports-and-limits).

#### 1.2 Check the container: `docker ps`, `docker inspect`, and `docker network inspect` (7 minutes)

These three commands only read. First, the running containers:

```text
docker ps
```

**Expected output (example):**

```text
CONTAINER ID   IMAGE                               COMMAND                  CREATED         STATUS         PORTS                      NAMES
c462533d5744   grafana/grafana:13.2.4              "/run.sh"                4 minutes ago   Up 4 minutes   127.0.0.1:3000->3000/tcp   smarthome-grafana
1f8ff222e902   timescale/timescaledb:2.30.2-pg17   "docker-entrypoint.s…"   9 minutes ago   Up 9 minutes   127.0.0.1:5432->5432/tcp   smarthome-db
```

Both **PORTS** columns start with `127.0.0.1`: their counters are for this laptop only. Does it say `0.0.0.0:3000` (your command used `-p 3000:3000`)? Throw the container away (`docker rm -f smarthome-grafana`), then repeat [Quick Win Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes); Grafana's content is safe in its cupboard. The PORTS column is empty: [🚨](#-troubleshooting) *Port 3000 is already in use …*. Second, the details of the Grafana container:

```text
docker inspect smarthome-grafana
```

Its output is long (±236 lines). Find three parts with **Ctrl + F** in the VS Code terminal: `RestartPolicy`, `Mounts`, and `Env`.

**Expected output (excerpt):**

```text
            "RestartPolicy": {
                "Name": "unless-stopped",
…
        "Mounts": [
…
                "Name": "smarthome-grafana-data",
                "Destination": "/var/lib/grafana",
…
            "Env": [
                "GF_ANALYTICS_REPORTING_ENABLED=false",
                "GF_SNAPSHOTS_EXTERNAL_ENABLED=false",
                "GF_PUBLIC_DASHBOARDS_ENABLED=false",
                "GF_PLUGINS_PREINSTALL_DISABLED=true",
```

Docker starts Grafana again unless you stop it yourself (`unless-stopped`, the same as the Module 17 database), its content is in the cupboard `smarthome-grafana-data`, all four `GF_…` settings are in place, and there's no password in the `Env` list. Third, the hallway:

```text
docker network inspect smarthome
```

**Expected output (excerpt):**

```text
        "Containers": {
            "1f8ff222e902…": {
                "Name": "smarthome-db",
                "IPv4Address": "172.18.0.2/16",
            "c462533d5744…": {
                "Name": "smarthome-grafana",
                "IPv4Address": "172.18.0.3/16",
```

Two containers in one hallway. The `172.18.…` addresses (they may differ on your laptop) are Docker's business; Grafana calls the database by its name (Concept 2).

#### 1.3 Grafana's door: `401` without logging in, only from this laptop, no sharing outside (5 minutes)

**Without logging in.** Press **Ctrl + Shift + N** (macOS: **Cmd + Shift + N**) for a private window (Chrome: Incognito, Edge: InPrivate), then open `http://localhost:3000`. That window doesn't carry your Grafana cookie.

**Result:** the address moves to `/login`: `Welcome to Grafana`, the fields **Email or username** and **Password**, the **Log in** button, and `Forgot your password?`. Not a single dashboard is visible before you log in. Close that window. Programs are refused too; ask the dashboard API without logging in (macOS and Linux: `curl`, without `.exe`):

```text
curl.exe -i http://localhost:3000/api/dashboards/home
```

**Expected output (excerpt; the author's lab: `curl` on Linux):**

```text
HTTP/1.1 401 Unauthorized
…
X-Frame-Options: deny
…
{"extra":null,"message":"Unauthorized","messageId":"auth.unauthorized","statusCode":401,"traceID":""}
```

`401` means the same as with the Module 20 backend guard: not logged in. `X-Frame-Options: deny` forbids the browser from showing Grafana inside another page; that's why Grafana panels aren't planted in the React dashboard yet ([🔬](#-technical-deep-dive-optional) *Grafana panels inside the React dashboard …*).

**Only from this laptop.** Counter `127.0.0.1:3000` doesn't accept visitors from the network, so a phone on the home Wi-Fi can't open `http://<laptop-IP>:3000`. The author didn't test with a phone; in the lab, even the machine itself was refused through its LAN IP: `curl: (7) Failed to connect to 192.168.1.10 port 3000 after 0 ms: Could not connect to server`. Opening it briefly for a phone is in the optional box of [Practice 10](#practice-10--the-phase-4-checkpoint-collect-the-evidence-45-minutes).

**No sharing outside.** Open **Dashboards** → `First panel` from the Quick Win. At the top right, click the small arrow next to the share icon (the icon itself = **Copy link**).

**Result:** its menu only has **Share internally** (sharing inside this Grafana) and **Share snapshot**, without **Share externally**. Click **Share snapshot**: its drawer holds `Snapshot name`, `Expires in`, **Publish snapshot**, `Cancel`, and `View all snapshots`, without **Publish to snapshots.raintank.io**. Those ways out of the laptop are gone because of the `false` settings in `docker run` (Concept 2). Click **Cancel**.

#### 1.4 ⭐ Test `grafana_reader` in psql: reading allowed, writing refused (10 minutes)

Prove Concept 3's promise through psql inside the database container, as `grafana_reader`:

```text
docker exec -it smarthome-db psql -U grafana_reader -d smarthome
```

From inside the container, psql doesn't ask for a password (like the `postgres` psql of Module 17). Make sure the prompt is `smarthome=>`, not `smarthome=#`: `=#` means a superuser, and as `postgres` the `DROP TABLE` query below really deletes the table. Type the queries after `smarthome=>` in the box below one at a time, each followed by **Enter**. Leave with `\q`.

**Expected output (example):**

```text
smarthome=> SELECT count(*) FROM readings;
 count
-------
  2058
(1 row)

smarthome=> SELECT device_id, name, status FROM devices;
  device_id   |         name         | status
--------------+----------------------+---------
 f00d00000001 | Practice living room | unknown
 f00d00000002 | Practice porch       | unknown
(2 rows)

smarthome=> SELECT * FROM devices;
ERROR:  permission denied for table devices
smarthome=> SELECT key_hash FROM devices;
ERROR:  permission denied for table devices
smarthome=> SELECT email FROM users;
ERROR:  permission denied for table users
smarthome=> SELECT count(*) FROM sessions;
ERROR:  permission denied for table sessions
smarthome=> INSERT INTO events (kind, source, message) VALUES ('status', 'test', 'try');
ERROR:  cannot execute INSERT in a read-only transaction
smarthome=> DROP TABLE readings;
ERROR:  cannot execute DROP TABLE in a read-only transaction
smarthome=> SHOW statement_timeout;
 statement_timeout
-------------------
 10s
(1 row)
```

The numbers and devices follow your data. The four `permission denied` refusals come from the rights layer: `devices` may only be read per column and without `key_hash`, while `users` and `sessions` are closed. `INSERT` and `DROP TABLE` are refused by the read-only layer. The rights layer that still holds even when the read-only layer is switched off is in Concept 3.

**You pass this ⭐ step** when the first two `SELECT`s answer with rows, the next six commands are refused with messages like the ones above, and `statement_timeout` is `10s`. psql refuses to log in because the account doesn't exist yet, or even `SELECT device_id, name, status` is refused? Run the [Quick Win Step 4](#step-4--the-read-only-database-account-grafana_reader-6-minutes) commands again ([🚨](#-troubleshooting) *`ERROR:  role "grafana_reader" already exists` or `permission denied …`*).

#### 1.5 The `Mini Smart Home` folder and Grafana's screen language (3 minutes)

This module's dashboard and alert rule are kept in one folder. In Grafana's left menu, click **Dashboards**, then the **New** button at the top right → **New folder**. Fill in **Folder name** `Mini Smart Home`, leave the `Assign an owner to the folder` box empty, then click **Create**. The `+` menu in the page header has no **New folder**.

**Result:** the `Mini Smart Home` page says `Manage folder dashboards and permissions`, with the tabs `Dashboards`, `Panels 0`, and `Alert rules 0`. This folder is chosen again in 2.1 and 4.3.

**Screen language.** Grafana can show Indonesian: the avatar at the top right → **Profile** → the **Preferences** section → **Language** `Bahasa Indonesia` → **Save preferences**. However, about 15% of its text isn't translated yet, and the alert menus (**Alert rules**, **Notification configuration**) stay English. This module and Grafana's documentation use the English names, so it's best to leave **Language** as it is (`Default`; English in the author's lab).

**Max open, if you missed it in the Quick Win.** Open **Connections → Data sources** → `grafana-postgresql-datasource` → **Connection limits**: **Max open** must be `4`, not `100` ([Quick Win Step 5](#step-5--a-postgresql-data-source-through-the-hallway-smarthome-db5432-5-minutes)). After changing it, click **Save & test**. The first answer may be `too many connections for role "grafana_reader"` (old connections haven't been released yet): wait a few seconds, then click again until `Database Connection OK`.

**Save to the branch.** In the free terminal (folder `mini-smart-home`), `git status` only names `grafana/`. Then:

```text
git add grafana
git commit -m "Grafana folder: read-only account and README (Module 25 Practice 1)"
```

> ⬆️ **Done with Practice 1?** Read [Concept 4](#4-anatomy-of-a-panel-sql-time-macros-units-and-thresholds) to [Concept 6](#6-reading-device-health-rssi-uptime-heap-and-packets-per-hour), then continue to [Practice 2](#practice-2--the-system-health-dashboard-rssi-uptime-heap-and-the-node-variable-50-minutes).

### Practice 2 — The "System Health" dashboard: RSSI, uptime, heap, and the `$node` variable (50 minutes)

> 🖥️ **Tools used:** **Chrome** or **Edge** with Grafana at `http://localhost:3000`, logged in as `admin`; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana` running; **VS Code** with the `backend` terminal (backend 1.1, `npm run dev`) kept running, because the backend is what stores `vitals` in `device_health`. Laptop path: the broker and the simulator in the `tools` terminal keep running too; device path: Node 1 is on. Concepts used: 4, 5, and 6.
>
> ⭐ **Required** — step 2.4: the `System Health` dashboard is saved in the `Mini Smart Home` folder with a `1m` refresh and `Node` = `All` as the defaults, choosing a `Node` changes what the panels show, and the Query inspector shows the query really sent to the database.

This practice makes your first technical dashboard: one `Node` device picker and three panels from `device_health`. Practice 3 adds two panels for Node 2. Everything is assembled with clicks, exactly the "technical dashboards without coding" of the [Syllabus](../../SYLLABUS.md#3-technology-choices--why-we-made-them): all you type is the SQL. The panel titles and the SQL below are exactly the same as in the reference dashboard [`code/stages/practice-2/grafana/dashboards/system-health.json`](code/stages/practice-2/grafana/dashboards/system-health.json), so you can compare the result in 2.5.

#### 2.1 A new dashboard: the folder, the WIB time zone, and the `$node` variable (10 minutes)

**Step 1 — an empty dashboard, its title, folder, and time zone.**

1. In Grafana's left menu, click **Dashboards → New → New dashboard**. The empty canvas says `Add a panel to visualize your data`, with a row of icons on the right (**Add**, **Options**, **Code**, …).
2. Click the **Options** icon, fill in **Title** `System Health`, then click **View all settings**. The **Settings** page opens on the **General** tab.
3. In **Folder**, click the button `Select folder: Dashboards currently selected`, then choose `Mini Smart Home` in the folder tree (you made this folder in [1.5](#15-the-mini-smart-home-folder-and-grafanas-screen-language-3-minutes)).
4. In **Time zone**, which was `Browser Time`, type `Jakarta`, then choose the only option, `Jakarta  WIB  UTC+07:00`.

**Result:** the time picker at the top right now says `Last 6 hours WIB`. This zone is saved in this dashboard's JSON, so its axis stays WIB on any laptop ([Concept 4](#4-anatomy-of-a-panel-sql-time-macros-units-and-thresholds)).

**Step 2 — the `$node` variable.** Grafana 13.2 moved the variable editor to the dashboard's sidebar ([Concept 5](#5-variables-one-dashboard-for-every-device)).

1. Still in **Settings**, click the **Variables** tab. It only says `Variable settings have moved to the dashboard's sidebar.`; click **Take me there**.
2. In the sidebar, click **Variable**. Under `Choose variable type`, choose **Query** (`Values are fetched from a data source query`).
3. Change **Name** `query0` to `node`, fill in **Label** `Node`, then turn on **Multi-value** and **Include All value**. The `Custom all value` field that appears stays empty; **Refresh** stays `On dashboard load`.
4. Click **Open variable editor**. In the `Query variable: node` drawer, make sure **Target data source** is `grafana-postgresql-datasource`, click **Code**, then paste this query:

   ```sql
   SELECT coalesce(name, device_id) AS __text, device_id AS __value FROM devices WHERE registered_at IS NOT NULL AND revoked_at IS NULL ORDER BY 1
   ```

5. Click **Run query**.

   **Result (the author's lab):** `Preview of values (3)`: `Garden (mock)`, `Practice living room`, `Practice porch`. In that lab the mock Garden had been registered earlier; on your laptop path, `Garden (mock)` only appears after [5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes); on the device path, the names of your Node 1 and Node 2 appear too. The list is sorted by name because of `ORDER BY 1`.

6. Click **Apply**.

**Step 3 — the first save, then choose `All`.** Click **Save**. The `Save dashboard` drawer shows **Title** `System Health` and **Folder** `Mini Smart Home`; a dashboard that has never been saved has no **Message** field yet. Click **Save**.

**Result (the author's lab):** the address becomes `/d/ad6w2nq/system-health?…&var-node=f00d000000b2` (your uid will differ), and the `Node` picker at the top of the dashboard holds the **first** value of its list, `Garden (mock)`, not `All`. This is Concept 5's trap: the Garden has no `vitals`, so the RSSI panel will say `No data`. Open the `Node` list, tick `All`, then remove the chip of that first value with **×** until only `All` is left (the address becomes `…var-node=$__all`). This choice only becomes the default when you save in [2.4](#24--save-with-a-1-minute-refresh-test-node-then-peek-into-the-query-inspector-10-minutes).

#### 2.2 The RSSI panel: an SQL query, Format `Time series`, the dBm unit, and thresholds (12 minutes)

1. If the dashboard is in view mode, click **Edit**. Then click **Add → Panel**, and in the `New panel` / `No visualization configured` box, click **Configure visualization**.
2. In the query editor, click **Code**, then paste the RSSI query:

   ```sql
   SELECT h.ts AS "time", coalesce(d.name, h.device_id) AS metric, h.rssi
   FROM device_health h JOIN devices d ON d.device_id = h.device_id
   WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
   ORDER BY 1
   ```

3. Change **Format** from `Table` to **Time series** (without it, all devices become one line, [Concept 4](#4-anatomy-of-a-panel-sql-time-macros-units-and-thresholds)), then click **Run query**.
4. In the bar on the right, click **All visualizations** → **Time series**. Fill in **Title** `RSSI (Wi-Fi signal strength)` and **Description** `The closer to 0, the stronger. A common convention: below -75 dBm it starts getting weak (not a standard).`
5. **Standard options → Unit**: type `dBm`, then choose `Energy / Decibel-milliwatt (dBm)`, not `Custom unit: dBm`.

   **Result (the author's lab):** the left axis says `-40 dbm`, `-60 dbm`, `-80 dbm`. The lowercase `dbm` really is how Grafana writes this unit.

6. **Thresholds**: the default is `Base` green and `80` red. Change the number `80` to `-75`, click its color dot and choose green, then click the color dot of `Base` and choose red. That means: −75 and up is green, below it red.
7. **Show thresholds**: choose `As lines (dashed)`.
8. **Axis → Soft min** `-90` and **Soft max** `-30` (soft limits of the axis). Without these limits, the axis is only as wide as the data; if your signal is always above −60, the −75 line lies outside the chart and is never seen.

   **Result:** the axis now runs from `-30 dbm` to `-90 dbm`, with a green dashed line across −75.

9. Click **Back** to return to the dashboard (still in edit mode).

The RSSI points are 5 minutes apart, not a dense line; that's normal ([Concept 6](#6-reading-device-health-rssi-uptime-heap-and-packets-per-hour)). Does the panel say `No data`? Make sure `Node` = `All`, then read [2.5](#25-no-data-and-shifted-clocks-vitals-every-5-minutes-utc-in-the-query-wib-on-the-screen-5-minutes).

#### 2.3 The Uptime and Heap panels: the red-at-80 Stat trap, duration and byte units (13 minutes)

**The Uptime panel.**

1. Click **Add → Panel**, then **Configure visualization**. The box may appear at the bottom of the screen; **Edit visualization** in the `Panel` sidebar opens the same editor.
2. **Code**, paste this query, choose **Format** **Time series**, then **Run query**:

   ```sql
   SELECT h.ts AS "time", coalesce(d.name, h.device_id) AS metric, h.uptime_s
   FROM device_health h JOIN devices d ON d.device_id = h.device_id
   WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
   ORDER BY 1
   ```

3. **All visualizations** → **Stat**. Fill in **Title** `Uptime (time running)` and **Description** `A sudden drop to a small number = the device has just restarted.`

   **Result (the author's lab), before any change:** a big `600` in **red**. Nothing is broken: an uptime of 600 seconds passes the default red threshold at 80 ([Concept 4](#4-anatomy-of-a-panel-sql-time-macros-units-and-thresholds)).

4. **Standard options → Unit**: type `duration`, then choose `Time / duration (s)` (not `(ms)`, `(hh:mm:ss)`, or `(d hh:mm:ss)`).

   **Result:** `10 minutes`, but still red.

5. **Color scheme**: choose `Single color`.

   **Result:** `10 minutes` in a neutral gray. A large uptime isn't dangerous; what's suspicious is a number that suddenly becomes small again.

6. Click **Back**.

**The Heap panel.**

1. **Add → Panel** → **Configure visualization** → **Code**, paste this query, **Format** **Time series**, **Run query**:

   ```sql
   SELECT h.ts AS "time", coalesce(d.name, h.device_id) AS metric, h.heap_free
   FROM device_health h JOIN devices d ON d.device_id = h.device_id
   WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
   ORDER BY 1
   ```

2. **All visualizations** → **Time series**. **Title** `Heap (free memory)`, **Description** `Falling day after day = suspect a memory leak.`
3. **Standard options → Unit**: type `bytes`, then choose `Data / bytes(SI)`. `Data / bytes(IEC)` above it counts in 1024s; the reference dashboard uses SI, in 1000s. The thresholds stay at their defaults, as in the reference.

   **Result (the author's lab):** a left axis of `180 kB` … `195 kB`.

4. Click **Back**.

The three queries only differ in their last column (`rssi`, `uptime_s`, `heap_free`). Is the Stat still red? See [🚨](#-troubleshooting) *A Stat number is red although it's normal*.

#### 2.4 ⭐ Save with a 1-minute refresh, test `$node`, then peek into the Query inspector (10 minutes)

**Step 1 — the refresh, and save.**

1. Click the small arrow next to the **Refresh** button (`Auto refresh turned off. Choose refresh time interval`), then choose `1m`: the panels reload their data every minute.
2. Click **Save**. In the `Save dashboard` drawer (the author's lab: `Changes 7`), tick **Update default refresh value** (make this refresh the default) and **Update default variable values** (make this variable choice the default). Fill in **Message** `Practice 2: variable node + RSSI, uptime, heap`, then click **Save**.
3. Click **Exit edit**. Test the defaults in a **new tab** (**Dashboards** → `System Health`), not with **F5** or the menu in this tab: its address carries `var-node` and `refresh`, and this tab still remembers your choices.

**Result:** in the new tab, the top bar still says `Node` `All`, `Last 6 hours WIB`, and `1m` next to **Refresh**. Without the first tick, `1m` doesn't come along to the new tab ([🚨](#-troubleshooting) *The 1-minute refresh is gone again …*); without the second tick, `Node` goes back to the first value of its list.

**Step 2 — test `$node`.** Open the `Node` list, remove `All`, then tick one device that sends `vitals` (laptop path: `Practice living room`; device path: your Node 1). The three panels now only hold that device. If you have one, also try a device without `vitals`: your Node 2, or the Garden after 5.1.

**Result (the author's lab):** `Node` = `Garden (mock)` makes the RSSI panel say `No data`, because Node 2 (and the Garden) don't send `vitals` ([Concept 6](#6-reading-device-health-rssi-uptime-heap-and-packets-per-hour)). Set it back to `All`; choosing in the list doesn't change the saved default. A panel shows an error as soon as `All` is chosen? See [🚨](#-troubleshooting) *A panel shows an error or goes empty as soon as its query uses `$node`*.

**Step 3 — the Query inspector.** Point the mouse at the RSSI panel, click ⋮ (`Menu`) in its panel header, choose **Inspect**, then the **Query** tab. The drawer only says `No request and response collected yet. Hit refresh button`; click **Refresh**. Repeat with one device in `Node`.

**Expected output (the author's lab), `Node` = `All`, then `Practice living room`:**

```text
A:6 rows
SELECT h.ts AS "time", coalesce(d.name, h.device_id) AS metric, h.rssi
FROM device_health h JOIN devices d ON d.device_id = h.device_id
WHERE h.ts BETWEEN '2026-10-26T14:55:18.815Z' AND '2026-10-26T20:55:18.815Z' AND h.device_id IN ('f00d000000b2','f00d00000001','f00d00000002')
ORDER BY 1
---
A:6 rows
SELECT h.ts AS "time", coalesce(d.name, h.device_id) AS metric, h.rssi
FROM device_health h JOIN devices d ON d.device_id = h.device_id
WHERE h.ts BETWEEN '2026-10-26T14:56:19.127Z' AND '2026-10-26T20:56:19.127Z' AND h.device_id IN ('f00d00000001')
ORDER BY 1
```

This is what the database receives ([Concept 4](#4-anatomy-of-a-panel-sql-time-macros-units-and-thresholds)–[5](#5-variables-one-dashboard-for-every-device)): `$__timeFilter(h.ts)` becomes `BETWEEN '…Z' AND '…Z'` in UTC, and `$node` becomes a list of quoted `device_id`s, one or all. Both answers are 6 rows, because only the simulator sends `vitals`. Without `$__timeGroupAlias` there's no `time_bucket` (Concept 4): every `device_health` row is drawn as it is.

The picture below was taken from the dashboard in the author's lab after 4.2 and 5.1, so its `Node` list holds the Garden but not `Practice porch` (its key was revoked).

![Composite of real screenshots of Grafana 13.2.4 in its dark theme in Chrome 156, Linux on a Raspberry Pi 5 playing the laptop, 1280 pixels, Practice 2. Top: the editor of the panel RSSI (Wi-Fi signal strength) on the System Health dashboard. A line chart Practice living room with the left axis -30 dbm to -90 dbm (number 3) and a green dashed line at -75 (number 4); points from about 09:25 WIB, when the simulator was running. Below it Format Time series (number 2) and the Code query SELECT h.ts AS time, coalesce(d.name, h.device_id) AS metric, h.rssi FROM device_health h JOIN devices d ON d.device_id = h.device_id WHERE $__timeFilter(h.ts) AND h.device_id IN ($node) ORDER BY 1 (number 1); the Query inspector button (number 6). Right, Standard options, Unit Decibel-milliwatt (dBm) (number 3). Top left the Node variable with All (number 5), the time picker Last 6 hours WIB (number 7). Bottom left: the Thresholds section scrolled into view, the threshold -75 with a green dot and Base with a red dot (number 4), Thresholds mode Absolute, Show thresholds As lines (dashed) (number 4). Bottom middle: the Node list opened, Selected (1), All ticked, Garden (mock), Practice living room (number 5). Bottom right: the Inspect drawer, tab Query, A: 14 rows, the SQL sent WHERE h.ts BETWEEN 2026-10-27T22:11:13.525Z AND 2026-10-28T04:11:13.525Z AND h.device_id IN (f00d000000b2, f00d00000001) with single quotes around every id (number 6), the Refresh button (number 6). The dashboard was made through the screens in the lab; the Node list is the lab state after Practices 4 and 5.](assets/panel-editor-and-variable.png)

**You pass this ⭐ step** when the `System Health` dashboard is in the `Mini Smart Home` folder, still has `Node` `All` and a `1m` refresh after being opened in a new tab, choosing one device changes what the three panels show, and the RSSI panel's Query inspector writes `BETWEEN '…Z'` and an `IN ('…')` holding your devices' `device_id`s.

#### 2.5 "No data" and shifted clocks: vitals every 5 minutes, UTC in the query, WIB on the screen (5 minutes)

**"No data" isn't a fault.** `vitals` go into `device_health` every 5 minutes, and only while the device **and** the backend are running. In the author's lab, the simulator's first `vitals` arrived at 03:31:42 WIB, and 25 minutes later the RSSI panel held 6 points. If all three panels say `No data`, check in order: are the simulator (or Node 1) and the backend running, does `Node` hold a device that sends `vitals`, then wait up to 5 minutes ([Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#57-watch-the-data-arrive) already said `device_health` only fills up after a few minutes). Widening the range to a few days doesn't help: the `npm run seed-history` history contains no `vitals`. Still empty? See [🚨](#-troubleshooting) *The RSSI, uptime, or heap panel says `No data`*.

**Clocks: UTC in the query, WIB on the screen.** Compare the Query inspector above with the time picker. `'2026-10-26T14:55:18.815Z'` to `'2026-10-26T20:55:18.815Z'` is 21:55 WIB on the 26th to 03:55 WIB on the 27th: the last six hours, exactly `Last 6 hours WIB`, only written 7 hours earlier. That difference is right. What's wrong is a chart axis shifted 7 hours from your laptop's clock: the dashboard's zone is still UTC, not `Jakarta` yet (2.1 Step 1). See [🚨](#-troubleshooting) *The times in the chart or in the Query inspector are shifted by 7 hours*.

**Compare with the reference.** In the reference file above, look for `"rawSql"` (the queries of the three panels and the variable), `"unit"` (`dBm`, `dtdurations`, `decbytes`: the JSON names of the three units you chose), `"timezone": "Asia/Jakarta"`, and `"refresh": "1m"`. Want to see it run? Import it as a copy: **Dashboards → New → Import dashboard**, paste its content (**Copy raw file**) into **Import via dashboard JSON model**, click the second **Load**, change **Name** to `System Health (reference)`, choose your data source in `DS_GRAFANA-POSTGRESQL-DATASOURCE`, then **Import**. Don't click a button that says `Import (Overwrite)`, because it overwrites another dashboard ([9.3](#93-try-importing-into-the-same-grafana-change-uid-first-optional-8-minutes)). In the author's lab, the imported copy had `Node` `All` straight away. This copy is only for comparison; Practice 3 and 9.2 use the dashboard you made.

Nothing is committed in this practice: the dashboard is stored in Grafana's cupboard (`smarthome-grafana-data`) and only becomes a file in the `grafana/` folder when it's exported in [9.2](#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes).

> ⬆️ **Done with Practice 2?** Continue to [Practice 3](#practice-3--the-garden-on-the-technical-dashboard-packets-per-hour-and-minutes-late-35-minutes). The temporary column in [3.2](#32--the-minutes-late-table-the-same-query-as-the-alert-plus-a-temporary-last_seen-column-15-minutes) is only fully explained in [Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline), which is read after Practice 3.

### Practice 3 — The Garden on the technical dashboard: packets per hour and minutes late (35 minutes)

> 🖥️ **Tools used:** **Chrome** or **Edge** with Grafana at `http://localhost:3000`; **Docker Desktop** or **Docker Engine** with `smarthome-db` and `smarthome-grafana` running; **VS Code** with the `backend` terminal (backend 1.1, `npm run dev`) kept running, because the backend is what writes `readings`. Laptop path: the broker and the simulator in the `tools` terminal keep running; device path: Node 1 and the battery-powered Node 2 are on. Concepts used: 6 and 7 (the temporary column in 3.2).
>
> ⭐ **Required** — step 3.2: the `System Health` dashboard is saved with the message `Practice 3: …` and five panels, including the `Node 2 packets per hour (should be 12)` bars and the `Minutes behind schedule` table, whose query is exactly the same as the alert rule in Practice 4.

Node 2 doesn't send `vitals`, so Practice 2's three panels don't know it. This practice adds two panels for the two questions of [Concept 6](#6-reading-device-health-rssi-uptime-heap-and-packets-per-hour): does Node 2 wake up on schedule (12 packets per hour), and how many minutes is each node behind its schedule. That second number is the one that will later wake you up through the alert. The titles, descriptions, and SQL below are exactly the same as in the reference dashboard [`code/stages/practice-3/grafana/dashboards/system-health.json`](code/stages/practice-3/grafana/dashboards/system-health.json).

**Laptop path:** the mock Garden only starts in [5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes), so the bar panel is still empty and the table has no Garden row yet. Assemble and save both now; their content appears by itself after 5.1. **Device path:** your Node 2 has been registered since Module 21, so both panels fill up right away.

#### 3.1 A bar panel of Node 2 packets per hour, with 12 as the reference (12 minutes)

1. Open the `System Health` dashboard, click **Edit**, then **Add → Panel** → **Configure visualization** (or **Edit visualization**, as in 2.3).
2. Click **Code**, paste this query, change **Format** to **Time series**, then click **Run query**:

   ```sql
   SELECT p.hour AS "time", coalesce(d.name, p.device_id) AS metric, p.reading_count
   FROM readings_hourly p JOIN devices d ON d.device_id = p.device_id
   WHERE $__timeFilter(p.hour) AND d.kind = 'node2'
   ORDER BY 1
   ```

   `reading_count` from the hourly summary book `readings_hourly` ([Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk)) is the number of packets in one hour. This panel deliberately has no `$node`: it always holds every `node2` device.

3. **All visualizations** → **Bar chart**. Fill in **Title** `Node 2 packets per hour (should be 12)` and **Description** `Node 2 wakes up every 300 seconds = 12 packets per hour. An hour with a short bar = the Garden went silent for a while.`

   **Result (the author's lab, 03:51 WIB), before any change:** one green bar `4` for the 03:00 hour (the Garden started at 03:31), the axis label `2026`, and the legend `< 80` / `80+`. The default red threshold at 80 shows up again, as in the Stat panel of 2.3.

4. **Thresholds**: change `80` to `12`, click its color dot and choose green, then click the color dot of `Base` and choose orange. The Bar chart's **Color scheme** is already `From thresholds (by value)`, so the bars follow the thresholds at once.
5. **Show thresholds**: choose `As lines (dashed)`.
6. **Axis → Soft max** `14`. Without this soft limit, the 12 line can't be seen while the bars are still short.
7. **Standard options → Decimals** `0`, because a number of packets is always a whole number.

   **Result (the author's lab, 03:52 WIB):** an orange bar `5`, a dashed line at 12, the legend `< 12` / `12+`. The current hour's bar grows with every packet (the 03:51:48 packet had just come in).

8. Click **Back**. You save it later, at the end of 3.2.

The `2026` label isn't a mistake: that's how a Bar chart writes its axis while its data cover only one hour. In the author's lab, from the second bar on, the labels became `10/27 03:00`, `10/27 04:00`, and at 06:00 WIB the panel drew an orange `6`, then green `12` and `12` (the Garden's first hour was only half an hour). An hour when Node 2 is completely dead has no bar.

#### 3.2 ⭐ The minutes-late table: the same query as the alert, plus a temporary `last_seen` column (15 minutes)

**Step 1 — the table.**

1. **Add → Panel** → **Configure visualization** (or **Edit visualization**) → **Code**, then paste this query. **Format** stays `Table` (its default). Click **Run query**:

   ```sql
   SELECT d.device_id, coalesce(d.name, d.device_id) AS node,
          round((EXTRACT(EPOCH FROM now() - coalesce(r.received_at, d.registered_at)) / 60
                 - CASE WHEN d.kind = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS minutes_late
   FROM devices d
   LEFT JOIN LATERAL (SELECT received_at FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
   WHERE d.registered_at IS NOT NULL AND d.revoked_at IS NULL
   ```

   This is the query of the `Silent node` alert rule in [4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes), letter for letter: one row per registered device whose key hasn't been revoked, with `minutes_late` counted from its newest reading (`readings.received_at`) and, for Node 2, minus the 5 minutes of its wake-up schedule.

2. **All visualizations** → **Table**. Fill in **Title** `Minutes behind schedule` and **Description** `The same query as the Silent node alert rule: more than 5 = the alert fires. Node 2 already has its 5-minute wake-up schedule subtracted.`
3. **Standard options → Decimals** `1`.
4. **Thresholds**: change `80` to `5`; its color stays red and `Base` stays green. This 5 is the same as the alert's threshold.
5. **Cell options → Cell type**: choose `Colored text`, so that the threshold colors show in the table's text.

**Result (the author's lab, ±03:54 WIB):** all the text is green, except the red `32.9`.

```text
device_id      node                   minutes_late
f00d00000002   Practice porch                 32.9
f00d000000b2   Garden (mock)                  -3.3
f00d00000001   Practice living room            0.1
```

`Practice living room` (the simulator) sends every 10 seconds, so its number is almost 0. `Garden (mock)` is negative: its next packet isn't due yet (in that lab the Garden had been started earlier). `Practice porch` is red: a practice device that's registered but not running. As soon as the alert rule is active, a row like this goes 🔴 at once, so its key is revoked first in [4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes). Note the `device_id` of any red row in your table.

**Step 2 — a temporary `last_seen` column.** The device list in the React dashboard writes "last seen" from the `devices.last_seen` column, while this table uses the last reading. To compare the two, clear the editor (**Ctrl + A**, then **Delete**), paste the query with these two extra columns, then **Run query**:

```sql
SELECT d.device_id, coalesce(d.name, d.device_id) AS node,
       round((EXTRACT(EPOCH FROM now() - coalesce(r.received_at, d.registered_at)) / 60
              - CASE WHEN d.kind = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS minutes_late,
       d.last_seen,
       round((EXTRACT(EPOCH FROM now() - d.last_seen) / 60)::numeric, 1)::float8 AS minutes_since_last_seen
FROM devices d
LEFT JOIN LATERAL (SELECT received_at FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
WHERE d.registered_at IS NOT NULL AND d.revoked_at IS NULL
```

**Result** (the author's lab, psql as `grafana_reader`): for Node 1, which is sending, the two numbers are close (`Practice living room` `0` and `0`); for Node 2, the second number is ±5 larger, because it doesn't subtract the 5 minutes of its wake-up schedule (`Garden (mock)` `4.8` and `9.8`). A device that has never connected has an empty `last_seen`. The difference shows when a device is silent while its other messages still arrive. Exactly when the Garden's `offline` status was published in Practice 5, the author's recording wrote `minutes_late` `11` but `minutes_since_last_seen` `0`. Silent isn't the same as offline; [Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline), which you read after this practice, explains why.

Keep this temporary query in your notes (you may use it again in [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes)), then **remove** it from the panel: clear the editor, paste the Step 1 query again, **Run query**, and make sure the table is back to three columns. This panel must be exactly the same as the alert query, so that the number you see is the same number that wakes you up, and the export in 9.2 matches the reference.

**Step 3 — save and compare.**

1. Click **Back**, then **Save**. In the `Save dashboard` drawer (the author's lab: `Changes 4`), fill in **Message** `Practice 3: Node 2 packets per hour + minutes behind schedule`, click **Save**, then **Exit edit**.
2. In the reference file above, look for the `"rawSql"` of the two new panels, `"axisSoftMax": 14`, `"decimals"`, `"mode": "dashed"`, and `"type": "color-text"`. In the author's lab, this assembly through the screens matched the reference in the SQL, `fieldConfig`, and `options` of all five panels.

The picture below was taken in the author's lab after the key of `Practice porch` was revoked (4.2) and the mock Garden was started (5.1), so its table has only two rows.

![Real screenshot of the System Health dashboard in Grafana 13.2.4 in its dark theme, Chrome 156 on Linux, a Raspberry Pi 5 playing the laptop, a 1280 by 1000 pixel window, end of Practice 3, shot at 12:04 WIB. Top bar: the Node variable with All (number 1); the time picker Last 6 hours WIB, Refresh, 1m (number 2), the share and Edit buttons. Top left the panel RSSI (Wi-Fi signal strength): a green line Practice living room going up and down between about -40 and -80 dbm from about 09:25, a green dashed line at -75, the axis -30 dbm to -90 dbm, hours 07:00 to 12:00 (number 3). Top right the Stat panel Uptime (time running) with a big gray 1 hour (number 4). Middle left the panel Heap (free memory), a line going up and down between 180 kB and 200 kB (number 5). Middle right the bar panel Node 2 packets per hour (should be 12): 10/28 09:00 is 4 orange, 10/28 10:00 is 6 orange, 10/28 11:00 is 12 green up to the dashed line 12, 10/28 12:00 is 1 orange; legend less than 12 and 12+ (number 6). Bottom left the table Minutes behind schedule, columns device_id, node, minutes_late: f00d00000001 Practice living room 0.1 and f00d000000b2 Garden (mock) -3.9, green text (number 7). The dashboard was made through the screens in the lab (= the reference JSON of stages/practice-3); Node 1 is the simulator, Node 2 is the mock Garden, running again since 10:43 WIB with its 300-second pause.](assets/system-health-dashboard.png)

**You pass this ⭐ step** when the `System Health` dashboard holds five panels and is saved with the message `Practice 3: …`, the `Minutes behind schedule` table writes one row per registered device with numbers above 5 in red, and its query is back to exactly the alert query (without the `last_seen` column).

Nothing is committed: this dashboard only becomes a file when it's exported to `grafana/` in 9.2.

#### 3.3 A "guarding on its own" table from `offline-report` events (optional, 8 minutes)

[Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#711-its-trail-in-the-database) records every offline-mode report in `events` with the kind `offline-report`, so that one day a dashboard can count how long and how often your home "guarded on its own". This is that panel: **Edit** → **Add → Panel** → **Configure visualization** (or **Edit visualization**) → **Code**, paste the query below, **Format** `Table`, **Run query**, **All visualizations** → **Table**, **Title** for example `Guarding on its own`, then **Back** and **Save**.

```sql
SELECT e.occurred_at AS "time", coalesce(d.name, e.device_id) AS node,
       (e.data->>'offline_s')::int AS offline_seconds, (e.data->>'local_fan')::int AS local_fan_times
FROM events e JOIN devices d ON d.device_id = e.device_id
WHERE e.kind = 'offline-report'
ORDER BY 1 DESC
```

`e.data->>'offline_s'` takes one field of the JSON column `data` as text, then `::int` turns it into a number. Without `$__timeFilter`, every event is shown, the newest at the top.

**Result** (in psql as `grafana_reader`): in the author's lab, a new database without offline-mode events answers `(0 rows)`, so the panel is empty. In the author's code test lab, after the broker was stopped for ±155 seconds, the same query answered with one row: `Practice living room`, `41` seconds, the fan `6` times. Don't stop the broker just to fill it: with backend 1.1, a restarted broker can produce a wrong 📴 message ([🚨](#-troubleshooting) *A false 📴 a minute after the broker is restarted …*). This panel isn't in the reference JSON, so your export in 9.2 will have one panel more; that's allowed.

> ⬆️ **Done with Practice 3?** Read [Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline), then continue to [Practice 4](#practice-4--the-silent-node-alert-and-a-telegram-contact-point-55-minutes).

### Practice 4 — The "Silent node" alert and a Telegram contact point (55 minutes)

> 🖥️ **Tools used:** **Chrome** or **Edge** with Grafana at `http://localhost:3000`, logged in as `admin`; **VS Code** with the `backend/.env` file (the source of the bot token and chat_id) and the `backend` terminal (backend 1.1, `npm run dev`) kept running; **Bruno** (4.2); **the Telegram app** on a phone or laptop; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana` running. Laptop path: the broker and the simulator in the `tools` terminal keep running; device path: Node 1 and Node 2 are on. Concepts used: 7.
>
> ⭐ **Required** — steps 4.1 and 4.3: the **Test** button of the `Telegram Smart Home` contact point sends `🔴 Notification test` to your Telegram (**G1**), and the `Silent node` rule is saved in the `node-health` group with **Pending period** `None` and **Normal** for no data, without a single 🔴 for a device that's running.

This practice sets up the "night watchman" of [Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline) along with the address for its messages. The order matters: the address first (4.1), then clean up the device list (4.2), and only then the rule (4.3); 4.4 and 4.5 read the result. In Grafana 13.2.4 the menu is called **Alerting**, directly in the left menu; instructions on the internet that mention "Alerts & IRM" don't fit this screen ([🚨](#-troubleshooting), the table of old instructions).

#### 4.1 ⭐ The `Telegram Smart Home` contact point: a message template and the Test button (15 minutes)

A contact point is the **address for messages**: where, and how, Grafana sends alerts. Grafana uses the same Module 19 bot as the backend, so there's no new bot.

**Step 1 — prepare the token and chat_id.** In VS Code, open `backend/.env`. You filled in the values of `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#63-telegram-settings-in-env). Copy their values (the part after `=`) one at a time when Step 2 asks for them, straight into the Grafana form, not into a file or another note.

> [!WARNING]
> The **BOT API Token** field is a plain text box: the token shows in **full** as soon as it's pasted, also while the **Edit Message** drawer is open next to it. Don't screenshot, record, or share the screen of this form. After **Save contact point**, the token, when opened again, only says `configured` with a **Reset** button, but **Chat ID** stays visible.

**Step 2 — fill in the form.**

1. In Grafana's left menu, click **Alerting** → **Notification configuration**. This page has the tabs **Contact points**, **Notification policies**, **Templates**, and **Time intervals**. The default card `empty` (`No integrations configured`) is left alone.
2. Click **New contact point** (page title `Create contact point`), then fill in **Name** `Telegram Smart Home`.
3. **Integration** defaults to `Email`: type `Telegram`, then choose **Telegram**.
4. Paste the token into **BOT API Token** and the chat_id into **Chat ID**.
5. Click **Optional Telegram settings**. Under **Parse Mode** (`Default is 'HTML'`), click `Choose`, then choose **None**. With `None`, Grafana doesn't send the `parse_mode` field, so Telegram receives plain text without format marks.
6. Still in that section, click **Edit Message**. In the `Edit Message` drawer, choose **Enter custom message**, paste this template into the **Custom template value** box, then click **Save** in the drawer:

   ```text
   {{ range .Alerts.Firing }}🔴 {{ .Annotations.summary }}{{ "\n" }}{{ end }}{{ range .Alerts.Resolved }}✅ {{ .Labels.node }} is sending data again.{{ "\n" }}{{ end }}
   ```

7. Open **Notification settings**: **Disable resolved message** stays **off**, so that the ✅ messages are sent too.

One message can carry several alerts. The `range .Alerts.Firing` part writes 🔴 followed by the summary that you write in the 4.3 rule; the `range .Alerts.Resolved` part writes ✅, the node's name (the `node` label from your query), then `is sending data again.`; `{{ "\n" }}` ends every alert with a new line. Without this template, Grafana uses its long default message, with `**Firing**` and a `localhost:3000` link that can't be opened from a phone ([🚨](#-troubleshooting) *Grafana sends its long default message …*).

**Step 3 — the Test button (G1), then save.**

1. Click **Test**. In the `Test contact point` dialog, leave `Notification message` on **Predefined**, then click **Send test notification**.

   **Result:** Grafana writes `Test notification sent successfully`, and your bot sends a message to Telegram. This is the text received by the mock Telegram server in the author's lab (03:59:57 WIB):

   ```text
   🔴 Notification test
   ```

   The test alert that Grafana makes has the summary `Notification test`; the 🔴 in front of it comes from your template, so this message also proves that the template is used. The new line from `{{ "\n" }}` is sent too, but isn't visible. The author didn't test a real bot, so check how it looks in your Telegram app yourself. No message, or Grafana writes an error? See [🚨](#-troubleshooting) *The Test button fails …*.

2. Click **Save contact point**.

   **Result:** the contact point list holds `Telegram Smart Home` · `Unused` · `Telegram` · `Sends notifications to Telegram`. It stays `Unused` until the 4.3 rule uses it.

Sharing the same bot is safe, because Grafana only **sends** (the author's reasoning; not tested with the real Telegram).

> [!TIP]
> Want Grafana's messages to go to your team's Telegram group? Add the bot to that group and fill in **Chat ID** with the group's chat_id. The author didn't test this; this module uses your private chat, the same as the backend.

**You pass this ⭐ step** when the message `🔴 Notification test` from your bot arrives in Telegram (**G1**), and `Telegram Smart Home` is saved with **Parse Mode** `None` and the template above.

#### 4.2 First revoke the keys of the devices you don't run (5 minutes)

The alert query gives one row for **every** device that's registered and whose key hasn't been revoked. A registered device you don't run will get a 🔴 as soon as the rule is active, and if its key is only revoked after that, its row disappears, so a false ✅ arrives ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)). So clean up the list **before** [4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes).

1. Open the `System Health` dashboard and look at the `Minutes behind schedule` table ([3.2](#32--the-minutes-late-table-the-same-query-as-the-alert-plus-a-temporary-last_seen-column-15-minutes)). Its rows are exactly the rows the rule will check. A red row whose `device_id` you noted there is usually a device you really don't run.
2. **Device path:** the practice device `f00d00000001` from Module 21 is usually still in the table, without running. In Bruno, send **`login admin`**, then **`revoke practice device key`** as it is ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#72-first-layer-revoke-it-in-the-backend-5-minutes)). Your Node 1 and Node 2 are **not** revoked. A Node 2 that's registered but currently dead will get a 🔴 at once: that message is right, so turn Node 2 on before 4.3.
3. **Laptop path:** **don't** revoke `f00d00000001`. That's your simulator, and in [5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes) it also becomes the mock Garden's linking device. For other devices that aren't running (for example `f00d00000002`, if you ever registered it), send **`login admin`**, clone **`revoke practice device key`**, change its URL to `{{baseUrl}}/devices/f00d00000002/revoke`, send it, then delete the clone again. No other device in the table? Skip this step.

**Expected output (the author's lab, `f00d00000002`):** `200 OK`, with this answer (condensed):

```text
{"device_id":"f00d00000002","revoked_at":"2026-10-26T21:00:24Z","steps":["Remove its account from the broker: mosquitto_passwd -D <broker password file> f00d00000002","Reload the broker (Pi: sudo systemctl reload mosquitto; laptop: Ctrl + C then run it again)"]}
```

The `steps` list reminds you of the second layer, in the broker (Module 21). A device that isn't running isn't connected to the broker, so you may do that layer at any time; the alert only reads the `revoked_at` column. Does it answer `401` `{"message":"not logged in or session expired: log in with POST /auth/login"}`? Your 15-minute access wristband (Module 20) has run out: send `login admin` again, then repeat.

Reload the dashboard. **Result (the author's lab):** the `Practice porch` row (`f00d00000002`), red at `32.9` before, disappears from the table, and from the `Node` list too. On the Map later (Practice 7), that device still shows as a gray circle.

#### 4.3 ⭐ The `Silent node` rule: the query, a 5-minute threshold, the `node-health` group, and two defaults to change (20 minutes)

The rule form is numbered 1–6. Follow it from the top; two default values **must** be changed (**Pending period** and no data), and Concept 7 explains why.

1. In the left menu, click **Alerting → Alert rules** (`Rules that determine whether an alert will fire`), then **New alert rule**.
2. **1. Enter alert rule name** → **Name** `Silent node`.
3. **2. Define query and alert condition**: leave the **Advanced options** switch **off**. The data source `grafana-postgresql-datasource` is already selected, and **Format** `Table` is already the default (don't change it). Switch **Builder** to **Code**, then paste (**Ctrl + V**) the same query as table 3.2 and the reference file [`silent-node.yaml`](code/grafana/alerting/silent-node.yaml):

   ```sql
   SELECT d.device_id, coalesce(d.name, d.device_id) AS node,
          round((EXTRACT(EPOCH FROM now() - coalesce(r.received_at, d.registered_at)) / 60
                 - CASE WHEN d.kind = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS minutes_late
   FROM devices d
   LEFT JOIN LATERAL (SELECT received_at FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
   WHERE d.registered_at IS NOT NULL AND d.revoked_at IS NULL
   ```

   This query has no `$node` (variables don't work in alerts, [Concept 5](#5-variables-one-dashboard-for-every-device)) and no `$__timeFilter`, so it doesn't use the `10m to now` range in **Options**. Click **Run query**.

   **Result (the author's lab):** the `Table` preview holds `{device_id="f00d00000001", node="Practice living room"}` `0` and `{device_id="f00d000000b2", node="Garden (mock)"}` `-0.7`. The Garden was already running earlier in that lab; on your laptop path the Garden row only appears after 5.1, and on the device path you see your Node 1 and Node 2. The Garden's negative number means its next packet isn't due yet. If you skipped 4.2, devices that aren't running show up too: in the author's code test lab, `Practice porch` `9.2`.

4. In **Alert condition**, leave `WHEN` **Last** `OF QUERY` **IS ABOVE**, then change the number `0` to `5`. Click **Preview alert rule condition**.

   **Result (the author's lab):** every node `0` `Normal`. The condition column writes `0` or `1` (over the threshold), not minutes. In that code test lab, the `Practice porch` row was `1` `Firing` at once. Behind the scenes Grafana turns this into three steps, A query → B Reduce **Last** → C Threshold `> 5`; those names A, B, C come back in the **History** tab ([5.5](#55-the-rules-history-in-the-history-tab-2-minutes)) and in the export file (9.2).

5. **3. Add folder and labels** → **Folder**: click `Select folder`, then choose `Mini Smart Home`. Leave **Labels** empty.
6. **4. Set evaluation behavior** → **New evaluation group**. Fill in **Evaluation group name** `node-health`, leave **Evaluation interval** at `1m`, then click **Create**. The screen says `All rules in the selected group are evaluated every 1m.`
7. **Pending period** defaults to `1m`: change it to **None** (the first default to change). With `1m`, every 🔴 comes a minute later than Concept 7's formula. **Keep firing for** stays `None`.
8. Open **Configure no data and error handling**. **Alert state if no data or all values are null** defaults to `No Data`: change it to **Normal** (the second default). **Alert state if execution error or timeout** stays `Error`, and leave **Missing series evaluations to resolve** empty.
9. **5. Configure notifications** → **Contact point**: choose `Telegram Smart Home`. Open **Muting, grouping and timings (optional)**, turn on **Override grouping**, then type `device_id` in **Group by** and press **Enter** (the option `device_id Hit enter to add`). It now holds `grafana_folder`, `alertname`, and `device_id`. Leave **Override timings** off; below it is written `Group wait: 30s, Group interval: 5m, Repeat interval: 4h` (4.4).
10. **6. Configure notification message** → **Summary (optional)**, paste this (leave **Description** and **Runbook URL** empty):

    ```text
    {{ $labels.node }} ({{ $labels.device_id }}) is not sending data, {{ with $values.A }}{{ .Value }}{{ end }} minutes behind schedule
    ```

    `$labels.node` and `$labels.device_id` are the two text columns of your query; `$values.A` is the `minutes_late` number. The 4.1 template puts this sentence after 🔴.

11. Click **Save**.

**Result (the author's lab):** the `Silent node` rule page is `Normal`, with `Notifications are delivered to Telegram Smart Home`, `Evaluation interval Every 1m`, your summary, and the tabs **Query and conditions**, **Instances**, **History**, and **Versions**. The first evaluation runs less than a minute after **Save**, every node is `Normal`, and not a single 🔴 message arrives: the order 4.2 → 4.3 was right.

**You pass this ⭐ step** when the `Silent node` rule is in the `Mini Smart Home` folder, group `node-health` every `1m`, with the state `Normal`, and within 3 minutes after **Save** there's no 🔴 for a device that is running. A 🔴 for a device you don't run anyway? First read [🚨](#-troubleshooting) *🔴 for a device you don't run anyway …* before revoking its key. If it later never fires or always comes a minute late, see *The alert never fires …*.

#### 4.4 Grouping notifications: group wait, group interval, and repeat interval (8 minutes)

This step only reads. You already set the grouping in the rule itself (**Override grouping**, 4.3 item 9), so the **Notification policies** tab isn't touched, and its three default pauses already fit. This is how it works for one node in the author's lab, when the simulator was stopped in Practice 5:

| Time (WIB) | What happens |
| :--- | :--- |
| 06:07:30 | evaluation: `Practice living room` goes over 5 → `Alerting` |
| 06:08:00 | 🔴 sent after the 30-second group wait |
| 06:13:00 | the first group interval tick: nothing has changed yet, no message |
| 06:14:30 | evaluation: the simulator sends again → `Normal` |
| 06:18:00 | ✅ sent on the next tick |

The 4-hour repeat interval is a reminder for a node that is still silent (according to the documentation; the author didn't wait for it).

**Why `device_id`?** The default grouping is only `grafana_folder` and `alertname`, so all nodes are in one group: in the author's research, two silent nodes came in **one** message, and a node that recovered was reported together with another node that was still silent. With `device_id`, every node has its own message and its own ticks.

**The evaluation second.** The group runs on the same second every minute, but Grafana picks the second: in three runs of the author's lab, `:30`, `:50`, and `:00`. The `Created` column in 4.5 shows your group's second. This is the "0–60 seconds of evaluation" in Concept 7's formula.

#### 4.5 The status of each node in the Instances tab: Normal and Firing (7 minutes)

Open the rule page (**Alerting → Alert rules** → `Silent node`), then click the **Instances** tab.

**Result (the author's lab, after 4.3):** `Instances 2`, a table `State` · `Labels` · `Created` · `Destination` with two `Normal` rows: `device_id f00d00000001` `node Practice living room` `+5 common labels` `2026-10-27 07:52:00` `Telegram Smart Home`, and a similar row for `f00d000000b2` `Garden (mock)`. On the laptop path you only see one row for now; the Garden joins by itself after [5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes) without any change to the rule.

- One row = one instance per node. Its labels come from the two text columns of your query; `+5 common labels` = labels that are the same in every row, for example `alertname` and `grafana_folder`.
- The `State` filter lists `Normal`, `Alerting`, `Pending`, `Recovering`, `NoData`, and `Error`. The ones you'll meet: `Normal`; `Alerting` when a node goes silent (the head of the rule page then says `Firing`); and `Error` without a node label when Grafana can't read the database (Concept 7, risk 3). `Pending` stays unused, because **Pending period** is `None`.
- The rule page also sums up `Pending period 0s` and `Keep firing for 0s`: a quick way to make sure the first default in 4.3 was changed.

The picture below combines the 4.3 form, the 4.1 contact point opened again after saving (its token says `configured`), and the **Instances** tab. The bottom right part of the picture = the state after Practice 5.3 (the Garden pulled); in 4.5 both rows are still `Normal`.

![Composite of real screenshots of Grafana 13.2.4 in its dark theme in Chrome 156, Linux on a Raspberry Pi 5 playing the laptop, Practices 4 and 5. Top, step 4.3, the rule Silent node, section 2. Define query and alert condition, the Advanced options switch off: grafana-postgresql-datasource, Options 10m to now, Format Table (number 1), a six-line Code query SELECT d.device_id, coalesce(d.name, d.device_id) AS node, round((EXTRACT(EPOCH FROM now() - coalesce(r.received_at, d.registered_at)) / 60 - CASE WHEN d.kind = node2 THEN 5 ELSE 0 END)::numeric, 1)::float8 AS minutes_late FROM devices d LEFT JOIN LATERAL (SELECT received_at FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true WHERE d.registered_at IS NOT NULL AND d.revoked_at IS NULL (number 1). The preview Table: device_id f00d00000001, node Practice living room, 0 and device_id f00d000000b2, node Garden (mock), -4.2 (number 2). Alert condition: WHEN Last OF QUERY IS ABOVE 5 (number 3); the condition preview, both nodes 0 Normal (number 4). Bottom left, step 4.1, the contact point opened again after saving: Name Telegram Smart Home (number 5), Integration Telegram, BOT API Token showing configured with a Reset button so the token is not visible (number 5), Chat ID 777000111, a fake lab number, Optional Telegram settings open, Message with the start of the template range .Alerts.Firing 🔴 .Annotations.summary … range .Alerts.Resolved ✅ and the Edit Message button (number 6), Parse Mode None (number 6). Bottom right, step 5.3, the rule Silent node with the state Firing in red (number 7), the tab Instances 2, the filter Normal 1 and Alerting 1; the Alerting row device_id f00d000000b2 node Garden (mock) created 2026-10-28 12:14:20 (number 7) and the Normal row device_id f00d00000001 node Practice living room 09:48:20 (number 7), destination Telegram Smart Home. The Alerting state comes from garden pull on the mock Garden; Telegram is a mock Bot API server.](assets/silent-node-alert.png)

Nothing is committed in this practice: the rule and the contact point live in Grafana's cupboard (`smarthome-grafana-data`). The rule is exported as a YAML archive in [9.2](#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes); the contact point, which holds the token, is never exported.

> ⬆️ **Done with Practice 4?** Continue to [Practice 5](#practice-5--pull-the-gardens-battery-alert-and-recovery-45-minutes). Keep [Concept 8](#8-maps-coordinates-tiles-and-attribution) ready to read while you wait for Grafana's message in [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes).

### Practice 5 — Pull the Garden's battery: alert and recovery (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: the `backend` terminal (backend 1.1, `npm run dev`), the `frontend` terminal (Vite), and one free terminal for Git; on the laptop path also the broker terminal (the `edge` folder) and the `tools` terminal (the simulator). **Bruno** (5.1, laptop path); **Chrome** or **Edge** with Grafana at `http://localhost:3000` and the React dashboard at `http://localhost:5173`; the **Telegram app**; **Docker Desktop** or **Docker Engine** with `smarthome-db` and `smarthome-grafana`. Device path: Node 1 on, Node 2 with its 18650 battery in its holder. Concepts used: 7 (Concept 8 is read while you wait).
>
> ⭐ **Required** — steps 5.3 and 5.4: after the Garden's battery is pulled out, Grafana sends 🔴 to your Telegram within 5.5–11.5 minutes (**G2** part 1); after it's put back, ✅ `… is sending data again.` (**G2** part 2), and the times are written on the timing sheet.

This is the Syllabus's real pass requirement: Grafana tells you when Node 2's battery is pulled out. The laptop path "pulls the battery" of the mock Garden with `garden pull`. Most of the time is waiting, because the 300-second wake-up interval is deliberately not shortened: the alert threshold is tied to that schedule.

#### 5.1 Prepare the Garden: a Node 2 that is heard, or the mock Garden from the simulator (15 minutes)

**Device path (about 3 minutes).** Your Node 2 has been registered since Module 21 (Bruno `register Node 2 via Node 1`). Make sure it is heard: the `Minutes behind schedule` table ([3.2](#32--the-minutes-late-table-the-same-query-as-the-alert-plus-a-temporary-last_seen-column-15-minutes)) has its row, and the `Node 2 packets per hour (should be 12)` panel has bars of about 12 for full hours. Bars far above 12 mean Module 14's 60-second test schedule is still in place; set it back to 300 seconds first. ACL block 2b isn't needed. Continue to 5.2.

**Laptop path.** Work in order; the order 2 → 3 → 4 must not be swapped.

1. **The Module 25 simulator.** In the `tools` terminal, press **Ctrl + C**. The Module 24 simulator doesn't know `garden …` yet: open [`code/tools/device-simulator.js`](code/tools/device-simulator.js) on GitHub, click **Copy raw file**, then paste it as the content of your `tools/device-simulator.js` (the changes: [`code/tools.diff`](code/tools.diff)). Don't run it yet. Stopped for more than a minute? The backend sends `📴 f00d00000001 offline since …`, and after about 6 minutes Grafana sends `🔴 Practice living room …`: both are right.
2. **Broker permission.** The block `# 2b) Laptop path (Module 25)` is new in [`code/edge/acl-broker`](code/edge/acl-broker): copy its six lines below item 2 of your `edge/acl-broker`. Remove `# ` (the hash and its space) in front of its last three lines only, not in the explanation lines, so that they become:

   ```text
   user f00d00000001
   topic write msh/f00d000000b2/telemetry
   topic write msh/f00d000000b2/status
   ```

   Save. The simulator account `f00d00000001` may now write the Garden's topics, exactly as Node 1 writes on behalf of Node 2 ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#52-write-the-access-control-list-edgeacl-broker-10-minutes)).
3. **Restart the broker** (restart, not reload; Module 21's rule). In the broker terminal, press **Ctrl + C**, then run `mosquitto -v -c mosquitto-lan.conf` again. Is your broker on the Pi? Copy `acl-broker` to the Pi as in Module 21, then `sudo cp ~/acl-broker /etc/mosquitto/` and `sudo systemctl restart mosquitto`.

   **Result (the author's lab; your Mosquitto version may differ):** the broker writes `mosquitto version 2.0.22 terminating`, then, after the command is typed again, `Config loaded from mosquitto-lan.conf.` and `mosquitto version 2.0.22 running`. While the broker is down, the `backend` terminal repeats `WARN: broker not reachable yet, …` and `ERROR: MQTT error: connect ECONNREFUSED …` (normal), then writes `INFO: connected to broker mqtt://127.0.0.1:1883 as backend`. A typo in `acl-broker` makes the broker fail to start.
4. **Restart the backend too.** In the `backend` terminal, press **Ctrl + C**, then run `npm run dev`.

> [!IMPORTANT]
> Don't skip step 4. Backend 1.1 keeps status messages in its memory. After a broker restart, a device that connects before the backend can make the backend send a **false** `📴 … offline since …` a minute later, and then stay silent when that device really stops (the Garden isn't affected). Restarting the backend clears that memory (also the 📴 memory of step 1, so its ✅ won't come). Backend 1.2 fixes it in [6.3](#63-mqttts-no-longer-sends-a-false-offline-message-then-npm-run-check-and-npm-test-10-minutes); the symptoms are in [🚨](#-troubleshooting) *A false 📴 a minute …*.

5. **Register the Garden.** Create a NEW file in the `backend/bruno` folder, named exactly `register mock Garden.yml`:

   ```yaml
   info:
     name: register mock Garden
     type: http
     seq: 26

   http:
     method: POST
     url: "{{baseUrl}}/devices"
     body:
       type: json
       data: |-
         {
           "device_id": "f00d000000b2",
           "name": "Garden (mock)",
           "location": "garden",
           "linked_via": "f00d00000001"
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

   In Bruno, send **`login admin`**, then **`register mock Garden`**. Its shape is the same as `register Node 2 via Node 1` in [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#18-five-bruno-requests-8-minutes): the Garden `f00d000000b2` has no key, because its data are published by its linking device, `f00d00000001`. So `tools/.env` doesn't change.

   **Expected output (the author's lab; this file's content sent with `curl`, not the Bruno app):** `201` with the answer:

   ```text
   {"device_id":"f00d000000b2","key":null,"steps":["An ESP-NOW device with no key. Make sure these three lines are in the broker ACL file, then restart the broker:","user f00d00000001","topic write msh/f00d000000b2/telemetry","topic write msh/f00d000000b2/status"]}
   ```

   The backend log: `device f00d000000b2 registered by account 1 (via f00d00000001)`. The `steps` list = the three lines you already opened in step 2. The answer is `409`? Read its `message`: the Garden is already registered (just continue), or `f00d00000001` isn't registered or has been revoked (remember 4.2: don't revoke it).
6. **Start the Garden.** In the `tools` terminal, run `node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1`, wait for `f00d00000001: online`, then type `garden start` and press **Enter**.

   **Expected output (exact, the author's lab):**

   ```text
   1 fake device(s) heading to mqtt://127.0.0.1:1883. Type for example "temp 33", "soil 25", "tank 15", "soil random", or "garden start". Stop with Ctrl+C.
   f00d00000001: online
   garden start
   Mock Garden f00d000000b2 started via f00d00000001: one packet now, then every 300 seconds.
   f00d000000b2: the Garden woke up at 03:31:48 WIB, its packet published by f00d00000001
   ```

   The line `the Garden woke up at …` (WIB time) comes again every 300 seconds. Reload the `System Health` dashboard: table 3.2 now has a `Garden (mock)` row with a negative number (its next packet isn't due yet), the bar panel starts filling, and the **Instances** tab of the `Silent node` rule becomes two rows without the rule being changed ([4.5](#45-the-status-of-each-node-in-the-instances-tab-normal-and-firing-7-minutes)).

**If `garden start` is typed before block 2b is open and the broker restarted**, the simulator still writes `the Garden woke up …`, but the broker silently drops the packet. Only the broker terminal knows (the number in front = the time in epoch seconds):

```text
1793046644: Denied PUBLISH from f00d00000001 (d0, q0, r0, m0, 'msh/f00d000000b2/telemetry', ... (127 bytes))
```

Open block 2b, then repeat steps 3 and 4. The next packet, at most 300 seconds later, gets through. Still silent? See [🚨](#-troubleshooting) *The mock Garden isn't heard …*.

#### 5.2 Note the last packet, then pull the battery (3 minutes)

Concept 7's formula counts from the **last packet**, so write down its time first (the 5.4 timing sheet). When you pull it is up to you: just after a packet, 🔴 comes the latest; just before the next packet, the earliest.

- **Laptop path:** the last packet = the last `the Garden woke up at …` line in the `tools` terminal. Type `garden pull`, then press **Enter**. The simulator and its "Node 1" keep running.
- **Device path:** click the dashboard's **Refresh**, then read Node 2's number in table 3.2: the last packet ≈ the time now − (5 + that number) minutes. For example, `-4.3` at 10:00 means about 09:59:20. Then pull the 18650 battery out of its holder the safe way of [Module 14](../../phase-2-connectivity/module-14-node-2-esp-now/README.md#46-node-2-moves-to-the-battery), and make sure Node 2's USB isn't plugged in (USB powers it too). Write down when you pulled it.

**Expected output (exact, the author's lab, pulled 9 seconds after a packet):**

```text
garden pull
Garden battery PULLED at 06:18:49 WIB. Its last packet was at 06:18:40 WIB; the offline status only comes around 06:34:40 WIB (960 seconds after the last packet).
```

#### 5.3 ⭐ Work out the estimate, wait for Grafana's message, then compare it with the backend's (15 minutes)

**Work it out first**, with the formula of [Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline): 🔴 from Grafana = last packet + 10.5–11.5 minutes; 📴 from the backend = last packet + about 17 minutes (960 + 60 seconds). In the author's lab: last packet 06:18:40 → 🔴 06:29:10–06:30:10, 📴 about 06:35:40. Write down your estimate.

**While you wait:**

- Read [Concept 8](#8-maps-coordinates-tiles-and-attribution) (maps), which prepares you for Practice 7.
- On the `System Health` dashboard (refreshed every minute), Node 2's number in table 3.2 rises by about 1 per minute and turns red past 5; this hour's bar stops growing. The **Instances** tab of the `Silent node` rule then says `Alerting`.
- In the React dashboard's device list, your Node 2 card keeps its `Online` badge: silent is not the same as offline. In the author's lab, `GET /devices` still said the Garden was `online` 9 min 41 s after it was pulled, when table 3.2 already showed `4.8`. Its status only becomes `offline` 960 seconds after the last packet. At that exact moment, the temporary 3.2 query (psql as `grafana_reader`, logged in as in [1.4](#14--test-grafana_reader-in-psql-reading-allowed-writing-refused-10-minutes)) writes `minutes_late` `11` but `minutes_since_last_seen` `0`.

**Expected output (as received by the mock Telegram server in the author's lab).** At 06:30:00, 11 min 10 s after `garden pull`, from Grafana:

```text
🔴 Garden (mock) (f00d000000b2) is not sending data, 5.8 minutes behind schedule
```

At 06:34:41 the `tools` terminal writes `f00d000000b2: no Garden packet for 960 seconds: f00d00000001 publishes the offline status at 06:34:41 WIB`, and a minute later (06:35:41, 17 min 0.8 s after the last packet), from the backend:

```text
📴 f00d000000b2 offline since 06:34 WIB
```

`5.8` is the number of minutes past the schedule at the 06:29:30 evaluation (Grafana writes a decimal point). The author's lab used backend 1.2; the 📴/✅ messages for this event are the same as with 1.1. In the second run, the Garden was pulled 6 seconds before its next packet, and 🔴 arrived 6 min 20 s after the pull. Device path (not recorded by the author): the name and `device_id` are your Node 2's. Two messages for one event are deliberate: Grafana for the technical team, more than 5 minutes earlier; the backend for the residents ([🚨](#-troubleshooting) *Two messages for one event …*). No 🔴 yet 12 minutes after the pull? See *The alert never fires …* in 🚨.

**You pass this ⭐ step** when the 🔴 for the Garden or your Node 2 arrives in Telegram 5.5–11.5 minutes after the battery is pulled out (**G2** part 1), and the times of 🔴 and 📴 are written down.

#### 5.4 ⭐ Put it back: two recovery messages and the timing sheet (10 minutes)

Put it back **after** the backend's 📴 has arrived; if you do it earlier, the backend sends neither 📴 nor ✅ for you to compare.

- **Laptop path:** type `garden insert`.
- **Device path:** put the battery back in its holder; Node 2 is heard again as soon as its first packet arrives.

**Expected output (exact, the author's lab):**

```text
garden insert
Garden battery back in at 06:35:46 WIB: the Garden wakes up at once, then every 300 seconds.
f00d000000b2: the Garden woke up at 06:35:46 WIB, its packet published by f00d00000001
```

The mock Telegram server received two recovery messages: at once from the backend, then at 06:40:00 from Grafana.

```text
✅ f00d000000b2 back online (offline 1 min)
✅ Garden (mock) is sending data again.
```

Grafana's ✅ waits: the 06:36:30 evaluation sees the Garden recovered (`Normal`), then its message follows the 5-minute group interval tick counted from the 🔴 at 06:30:00. `offline 1 min` is counted by the backend from the `offline` status, not from the pull.

**The G2 timing sheet.** Copy it into your notes (it goes into `learn-iot/module-25/` later, [➕ G](#g-save-your-learning-notes-and-the-phase-4-checkpoint-evidence)), then fill in the last column:

| Event | The author's lab (WIB) | Difference in the lab | Your time |
| :--- | :--- | :--- | :--- |
| last packet | 06:18:40 | 0 | |
| battery pulled out | 06:18:49 | +9 s | |
| 🔴 Grafana | 06:30:00 | pull + 11 min 10 s | |
| 📴 backend | 06:35:41 | packet + 17 min 0.8 s | |
| battery put back | 06:35:46 | — | |
| ✅ backend | 06:35:46 | at once | |
| ✅ Grafana | 06:40:00 | put back + 4 min 13 s | |

Compare it with your estimate from 5.3. In the author's lab, Grafana's ✅ arrived 3 min 22 s – 4 min 26 s after the recovery; the limit is about 5 minutes after the evaluation that sees it recovered.

**You pass this ⭐ step** when `✅ … is sending data again.` from Grafana arrives within that limit (**G2** part 2), and your timing sheet is filled in. G2 is ticked again in [10.4](#104--the-final-dress-rehearsal-backend-tests-the-frontend-build-and-the-three-pass-requirements-20-minutes).

#### 5.5 The rule's history in the History tab (2 minutes)

Open **Alerting → Alert rules** → `Silent node`, then the **History** tab. It holds one block per instance, with the columns `State` and `Time` (WIB).

**Expected output (the author's lab, the Garden block; the screen writes one value per line, condensed here):**

```text
{alertname=Silent node, device_id=f00d000000b2, grafana_folder=Mini Smart Home, node=Garden (mock)}
Normal                   Silent node - A=-4.300000, B=-4.300000, C=0.000000       2026-10-27 06:36:30
Alerting                 Silent node - A=5.800000, B=5.800000, C=1.000000         2026-10-27 06:29:30
```

A = the query's result (`minutes_late`), B = Reduce **Last**, C = Threshold (`1` = over 5). `Time` = the time of the evaluation, not of the message. A `Normal (Missingseries)` block means the row has disappeared from the query's result, for example because a device key was revoked after the rule became active ([4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes) the wrong way round). An `Error` block without a node label means Grafana couldn't read the database (Concept 7, risk 3).

**An honest note about the mock Garden.** A simulator stopped with **Ctrl + C** makes the Garden go silent too, but its status is left at `online`: the Garden has no will, and its publisher is already dead, exactly like a real Node 2 when Node 1 goes down. The Garden's packets are also lost while the simulator is disconnected from the broker (a real Node 1 keeps them on its holding shelf): a deliberate simplification. In the author's lab, after **Ctrl + C**: 🔴 `Practice living room` 5 min 58 s later, 🔴 Garden 11 min 12 s after its last packet, and never a 📴 for the Garden. You'll see the effect again on the Map, in [7.4](#74--test-the-map-attribution-live-status-the-viewer-account-a-375-px-phone-and-dark-mode-10-minutes).

**Save to the branch (laptop path).** In the free terminal (the `mini-smart-home` folder):

```text
git add tools/device-simulator.js edge/acl-broker backend/bruno
git commit -m "Mock Garden: simulator and ACL block 2b (Module 25 Practice 5)"
```

The device path doesn't change any file in this practice; your `tools/` folder is brought up to date in [➕ A](#a-match-your-project-backend-120-frontend-110-grafana-tools-and-edge).

> ⬆️ **Done with Practice 5?** Read [Concept 9](#9-a-location-is-device-data-an-api-not-something-stuck-on-the-screen), then continue to [Practice 6](#practice-6--backend-12-device-locations-through-the-api-45-minutes). If you didn't get to read [Concept 8](#8-maps-coordinates-tiles-and-attribution) while you waited, read it before [Practice 7](#practice-7--the-map-page-with-react-leaflet-60-minutes).

### Practice 6 — Backend 1.2: device locations through the API (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the `backend` terminal (backend 1.1, `npm run dev`) that **keeps running** and one free terminal in the `backend` folder for `npm` and Git; **Bruno** (6.1, 6.4); **Chrome** or **Edge** for `http://localhost:8080/docs`; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana`. Laptop path: the broker, the simulator, and the mock Garden keep running; device path: Node 1 and Node 2 on. Concepts used: 9.
>
> ⭐ **Required** — step 6.4: `/docs` shows version `1.2.0`, the Bruno request `set device location` gets `200` as admin, `403` as viewer, and `400` for `"-6,2"`, and then every device of yours has a fictional point.

The `lat` and `lng` columns have been waiting since [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#3-tables-rows-columns-types-and-the-primary-key), but backend 1.1 neither sends nor accepts them yet ([Concept 9](#9-a-location-is-device-data-an-api-not-something-stuck-on-the-screen)). This practice raises the backend to **1.2.0**, first stage: map points through the API, plus the `mqtt.ts` fix for the false 📴 you avoided in [5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes). No migration, no new package; the React dashboard isn't touched. The backend's `.env.example` and `README.md` only change in Practice 8 and [➕ C](#c-update-backendreadmemd-bruno-and-docs-to-120). The final state: [`code/stages/practice-6/backend/`](code/stages/practice-6/backend/).

**How to copy.** Each changed piece is shown together with its place. Type that piece, or replace the whole file: open the file of the same name in that stage on GitHub, click **Copy raw file**, then paste it in place of its content in your `backend` folder. A NEW file: right-click its folder → **New File…**.

**Keep the backend running.** `npm run dev` restarts the backend every time a file is saved; work in order, `db/` first, then `routes/`. A backend that is down for more than about 5 minutes makes the Silent node rule send 🔴 for **every** node, then ✅ after it's back (the author's lab: the backend frozen for 18 minutes; [🚨](#-troubleshooting) *Every node 🔴 at once …*).

#### 6.1 `lat` and `lng` join `GET /devices`: `db/devices.ts` and the `Device` schema (10 minutes)

`GET /devices` only reads the columns in the `COLUMNS` list, then builds its answer through `present()` and the `Device` schema. All three, plus the `DeviceRow` type, need `lat` and `lng`.

**`src/db/devices.ts`.** In `interface DeviceRow`, just below `location: string | null;`, add:

```ts
  lat: number | null; // Module 25: latitude of the point on the map, decimal degrees; null = not set yet
  lng: number | null; // Module 25: longitude; the column has existed since migration 001, but it's only read from now on
```

Change the `COLUMNS` line to:

```ts
const COLUMNS = "device_id, kind, name, location, lat, lng, status, last_seen, registered_at, key_created_at, revoked_at, linked_via";
```

Then add this function at the end of the file (the route in 6.2 uses it), and save:

```ts
// Module 25: move a device's point on the map. lat and lng are always written as a pair; null and null = the point is removed.
// The location text ("living room") is not changed. The result is undefined if that device_id isn't in the devices table.
export async function setDeviceLocation(deviceId: string, lat: number | null, lng: number | null): Promise<DeviceRow | undefined> {
  const result = await pool.query<DeviceRow>(
    `UPDATE devices SET lat = $2, lng = $3 WHERE device_id = $1 RETURNING ${COLUMNS}`,
    [deviceId, lat, lng],
  );
  return result.rows[0];
}
```

`$1`–`$3` are filled in safely by `pg`, like `revokeDevice()` above it. `RETURNING` gives back the row after the change, so the route answers at once with its new point; without a matching row, the result is `undefined` (later `404`). A device whose key was revoked may get a point too, because its row still shows in `GET /devices`.

**`src/routes/devices.ts`.** In `const Device = z.object({`, just below `location: z.string().nullable(),`, add:

```ts
  lat: z.number().nullable().describe("Module 25: latitude of the device's point on the map (decimal degrees); null = not set yet"),
  lng: z.number().nullable().describe("Module 25: longitude of the device's point on the map (decimal degrees); null = not set yet"),
```

In the `present()` function, the first line after `return {` becomes:

```ts
    device_id: r.device_id, name: r.name, location: r.location, lat: r.lat, lng: r.lng, kind: r.kind, status: r.status,
```

Save after **both** have changed: the answer's schema and the answer's content must always match. Then in Bruno, send **`login viewer`**, then **`device list`**.

**Result (the author's lab):** every device carries `"lat"` and `"lng"`: `f00d00000001` and `f00d00000002` hold `"lat":-6.2,"lng":106.8` from Module 17's `npm run seed-history` (stacked on top of each other), the Garden `"lat":null,"lng":null`. On the device path, Node 1 and Node 2 are surely still `null` (never filled in). The React dashboard only reads them in [7.1](#71-three-map-packages-at-their-written-versions-then-lat-and-lng-in-typests-8-minutes).

#### 6.2 The `LocationBody` schema and the admin route `PUT /devices/:id/location` (15 minutes)

Still in `src/routes/devices.ts`, three additions. First, the import line from `../db/devices.ts` also brings in `setDeviceLocation`:

```ts
import { revokeDevice, registerDevice, rotateDeviceKey, allDevicesDb, setDeviceLocation } from "../db/devices.ts";
```

Second, the request body's schema, just below the `Registration` schema (before `const NewKey`):

```ts
// Module 25: the body of PUT /devices/:id/location. Numbers with a decimal POINT (JSON has no decimal comma): "-6,2" is text,
// so it is refused with 400. The range is the same as the CHECK in migration 001. Zod 4's z.number() also refuses NaN and Infinity.
// strictObject: other fields (for example the "location" text) are refused with 400; this route ONLY moves the point on the map.
const decimalNumber = (example: string) => z.number({ // error message: field missing, NaN/Infinity, or text
  error: (issue) => issue.input === undefined ? "required: a number, or null to remove the point"
    : typeof issue.input === "number" ? "must be a finite number (not NaN or Infinity)"
      : `must be a number with a decimal point, for example ${example} (not the text "${example.replace(".", ",")}")`,
});
export const LocationBody = z.strictObject({
  lat: decimalNumber("-6.1754").min(-90, "latitude at least -90").max(90, "latitude at most 90").nullable()
    .describe("latitude in decimal degrees, -90 to 90; Jakarta is about -6.2. null = remove the point"),
  lng: decimalNumber("106.8272").min(-180, "longitude at least -180").max(180, "longitude at most 180").nullable()
    .describe("longitude in decimal degrees, -180 to 180; Jakarta is about 106.8. null = remove the point"),
}).refine((l) => (l.lat === null) === (l.lng === null), { // half a point can't be drawn on the map
  message: "lat and lng go in pairs: both numbers, or both null to remove the point", path: ["lng"],
});
```

Third, the route itself, inside `deviceRoutes`, right after the route `app.post("/devices/:id/revoke", …)` ends:

```ts
  // ---- Module 25: the device's point on the map (admin only: the guard refuses viewers for PUT, like POST above) ----

  app.put("/devices/:id/location", {
    schema: {
      tags: ["devices"],
      summary: "Set the device's point on the map: { lat, lng } with a decimal point; { lat: null, lng: null } removes the point",
      params: IdParam,
      body: LocationBody,
      response: {
        200: Device.describe("the device with its new point (the same shape as one row of GET /devices)"),
        404: ErrorBody.describe("that device_id isn't in the device list"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    const { lat, lng } = req.body;
    try {
      const row = await setDeviceLocation(id, lat, lng);
      if (row === undefined) return reply.code(404).send({ message: `${id} isn't in the device list` });
      // the coordinates are deliberately NOT written to the log: a home's point is personal data
      req.log.info(`map point of ${id} ${lat === null ? "removed" : "set"} by account ${req.user.sub}`);
      return present(row);
    } catch (error) {
      req.log.error(`location of ${id} couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });
```

Save. The whole file: [`code/stages/practice-6/backend/src/routes/devices.ts`](code/stages/practice-6/backend/src/routes/devices.ts) (**Copy raw file**). `decimalNumber()` gives three friendly messages, `.min()`/`.max()` are the same as the database's `CHECK`, and `refine` refuses half a point. No new guard: [Module 20's guard](../../phase-3-backend-data/module-20-user-security/README.md#practice-3--a-guard-at-every-door-401-and-403-50-minutes) already refuses viewers for every `PUT`, and `PUT` is already in the CORS method list (`auth/security.ts` isn't touched).

#### 6.3 `mqtt.ts` no longer sends a false offline message, then `npm run check` and `npm test` (10 minutes)

**Why there was a false 📴 in 5.1.** When the broker stops, the simulator's will (`offline`) is published, and the backend starts waiting 60 seconds before it sends 📴 ([Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#68-test-the-offline-message-wait-60-seconds)). When the broker comes back, the simulator can connect **before** the backend, so its `online` message arrives as a retained message (kept by the broker). Backend 1.1 doesn't pass a retained status on to Telegram, so the wait isn't cancelled: a false 📴 is sent, and the next real 📴 is held back until the backend is restarted.

**The fix** is in `src/services/mqtt.ts`, in the `if (kind === "status")` part. Find `notifyStatus(deviceId, result.data);` inside `if (!retained) {`, then replace the closing brace after it with a new branch (two lines of code, two lines of comment):

```ts
        notifyStatus(deviceId, result.data); // Telegram: offline is only reported once it lasts 60 seconds
      } else if (result.data === "online") {
        // Module 25: a retained "online" still cancels a 📴 that is waiting. After a broker restart, a device can connect
        // BEFORE the backend, so its online message arrives as a retained message (without this: a false 📴)
        notifyStatus(deviceId, "online");
      }
```

A retained `offline` is still ignored (an old state). In the author's fix lab, the broker was restarted with the simulator connecting first: no 📴 for more than 70 seconds, then the real 📴 arrived 60.0 seconds after the simulator was stopped.

**Tests.** Copy these three files with **Copy raw file**:

| File | What it holds |
| :-- | :-- |
| [`src/services/mqtt.test.ts`](code/stages/practice-6/backend/src/services/mqtt.test.ts) (NEW) | 2 tests without a broker or Telegram: a retained `online` after the will is still passed on; a retained `offline` isn't reported |
| [`src/routes/location.test.ts`](code/stages/practice-6/backend/src/routes/location.test.ts) (NEW) | 12 tests: limits, `NaN`, `"-6,2"`, half a point, the `location` field; with the real guard: guest `401`, viewer `403`, admin `200`, `404` |
| [`src/routes/devices.test.ts`](code/stages/practice-6/backend/src/routes/devices.test.ts) | its fake row gets `lat: null, lng: null`, to match the new `Device` schema |

In the free terminal (the `backend` folder), run `npm run check` (only two header lines, no errors), then `npm test`. The backend in the `backend` terminal isn't restarted by this.

**Expected output (the author's lab, the Practice 6 stage, trimmed):**

```text
 Test Files  9 passed (9)
      Tests  71 passed (71)
```

Backend 1.1 has 7 files / 57 tests; the additions are 12 location tests and 2 `mqtt.ts` tests. Anything red? Compare your files with the Practice 6 stage.

#### 6.4 ⭐ Version 1.2.0, `/docs`, and the Bruno request `set device location`: 200, 403, 400 (10 minutes)

1. Replace the content of `src/server.ts` with [the Practice 6 stage version](code/stages/practice-6/backend/src/server.ts) (**Copy raw file**): only the header comment, the `/docs` description, and `version: "1.2.0"` change. Then in the free terminal, run `npm pkg set version=1.2.0` (no output), then `npm install` so that `package-lock.json` becomes 1.2.0 too (no new package).
2. Run `npm audit`. **Result (the author's lab, 27 October 2026):** `found 0 vulnerabilities`. The result depends on the date; any findings? `npm audit fix` (not `--force`), then `npm test` again, as in [Module 24](../module-24-control-rules-roles/README.md#64--npm-run-check-npm-test-and-npm-audit-then-bruno-and-docs-110-10-minutes).
3. Open `http://localhost:8080/docs`. **Result (the author's lab):** version `1.2.0`, a description that begins with `Backend v1.2 (Module 25).`, and the route `PUT /devices/{id}/location`.
4. In VS Code, right-click the `backend/bruno` folder → **New File…**, name it exactly `set device location.yml`, fill it with the code below, then save. Its URL uses the collection's example Node 1, `a4cf12e5b7c0`: the laptop path replaces it with `f00d00000001`, the device path with your Node 1's `device_id` if it differs.

   ```yaml
   info:
     name: set device location
     type: http
     seq: 27

   http:
     method: PUT
     url: "{{baseUrl}}/devices/a4cf12e5b7c0/location"
     body:
       type: json
       data: |-
         {
           "lat": -6.1754,
           "lng": 106.8272
         }
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

5. In Bruno: **`login admin`** → **`set device location`** (`200`) → **`login viewer`** → send it again (`403`; the **Tests** tab is red for anything other than `200`: normal) → **`login admin`**, then change it for a moment: `-6.1754` to `"-6,2"` with quotes (`400`), then `91` (`400`). Put `-6.1754` back, then change the id in the URL to `f00d0000ffff` (`404`), then put the URL back.

**Expected output (the author's lab, `f00d00000001`; sent by a lab script equivalent to Bruno, condensed):**

```text
admin         -> 200 {"device_id":"f00d00000001","name":"Practice living room","location":"living room","lat":-6.1754,"lng":106.8272,"kind":"node1","status":"online",…,"key":"active",…}
viewer        -> 403 {"message":"viewer accounts can only look; commands and changes are admin-only"}
"lat": "-6,2" -> 400 {"statusCode":400,"code":"FST_ERR_VALIDATION","error":"Bad Request","message":"body/lat must be a number with a decimal point, for example -6.1754 (not the text \"-6,1754\")"}
"lat": 91     -> 400 …"message":"body/lat latitude at most 90"}
f00d0000ffff  -> 404 {"message":"f00d0000ffff isn't in the device list"}
```

The backend log (WIB times, trimmed) records who did it, without coordinates:

```text
[04:04:49] INFO: map point of f00d00000001 set by account 1
[04:04:49] WARN: refused (403): account 2 (viewer) tried PUT /devices/f00d00000001/location
```

A sudden `401` `not logged in or session expired…`? Your access wristband only lasts 15 minutes (Module 20): send **`login admin`** again.

6. **Fictional points for every device** (around Monas, 20–40 m apart; [Concept 8](#8-maps-coordinates-tiles-and-attribution)). As admin, send **`set device location`** for every device in `GET /devices`:

| `lat`, `lng` | Laptop path | Device path |
| :-- | :-- | :-- |
| `-6.1754`, `106.8272` | `f00d00000001` | your Node 1 |
| `-6.17532`, `106.82705` | `f00d00000002`, if you have it (also when its key was revoked in 4.2) | the practice `f00d00000001`/`f00d00000002`, if you have them |
| `-6.17548`, `106.82735` | the Garden `f00d000000b2` | your Node 2 |

**Result (the author's lab):** the Garden is answered `200` with `"lat":-6.17548,"lng":106.82735` and `"key":"no-key"`. These points only show on the Map in Practice 7; a point moved while the Map is open only shifts after the Map is opened again ([7.4](#74--test-the-map-attribution-live-status-the-viewer-account-a-375-px-phone-and-dark-mode-10-minutes)).

**You pass this ⭐ step** when `/docs` shows version `1.2.0`, Bruno gets `200` (admin), `403` (viewer), and `400` (`"-6,2"`), and every device of yours has a fictional point. Another answer: [🚨](#-troubleshooting) *`PUT /devices/:id/location` answers `400`, `403`, or `404`*.

**Save to the branch.** In the free terminal (the `backend` folder):

```text
git add src bruno package.json package-lock.json
git commit -m "Backend 1.2.0: map points through the API and the false offline fix (Module 25 Practice 6)"
```

> ⬆️ **Done with Practice 6?** Continue to [Practice 7](#practice-7--the-map-page-with-react-leaflet-60-minutes). Tiles, attribution, and marker colors were already explained in [Concept 8](#8-maps-coordinates-tiles-and-attribution).

### Practice 7 — The Map page with react-leaflet (60 minutes)

> 🖥️ **Tools used:** **VS Code** with the `frontend` terminal (Vite) and one free terminal in the `frontend` folder for npm and Git; the `backend` terminal (backend 1.2 from Practice 6) keeps running, as do the broker and the `tools` terminal (the simulator + the mock Garden) on the laptop path, or Node 1 and Node 2 on the device path; **Docker Desktop** or **Docker Engine** (`smarthome-db`); **Bruno** (7.4); **two different browsers**, for example **Chrome** (admin) and **Edge** (viewer), with DevTools; internet for the map tiles. Concepts used: 8.
>
> ⭐ **Required** — step 7.4: the **Map** page draws every device that has a point, with the attribution `© OpenStreetMap contributors`, its marker color changes by itself when the simulator (or Node 1) is stopped, and the page opens for a viewer, at a width of 375 px, and in dark mode.

Backend 1.2 already sends every device's point (Practice 6). Now the dashboard goes up to **1.1.0** with the `/map` screen: three new files, four old files that grow a little, and `package.json`. Tiles, attribution, `CircleMarker`, and the meaning of the colors were already explained in [Concept 8](#8-maps-coordinates-tiles-and-attribution); here we write and test them. The final state: [`code/stages/practice-7/frontend/`](code/stages/practice-7/frontend/).

#### 7.1 Three map packages at their written versions, then `lat` and `lng` in `types.ts` (8 minutes)

In the `frontend` terminal, stop Vite (**Ctrl + C**) and leave it stopped until the end of 7.3: the files of 7.2–7.3 import each other. In the free terminal (the `frontend` folder), install the map packages **with their versions** (the list is in [🧰](#-what-you-need)):

```text
npm install leaflet@1.9.4 react-leaflet@5.0.0
```

**Expected output (the author's lab):**

```text
added 3 packages, and audited 109 packages in 4s

18 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

`added 3 packages` = `leaflet`, `react-leaflet`, and its core library `@react-leaflet/core`. Then the TypeScript types for Leaflet, as a devDependency (`-D`: only used while writing and checking the code):

```text
npm install -D @types/leaflet@1.9.22
```

**Result (the author's lab):** `added 2 packages, and audited 111 packages in 2s` (`@types/leaflet` and `@types/geojson`), the rest the same. The `"version"` in `package.json` stays `1.0.0` until 7.5. Why must the version be written? The react-leaflet documentation (read on 26 October 2026) still tells you to use `react@rc` and `react-leaflet@next`, which that day installed the old test versions 19.0.0-rc.1 and 5.0.0-rc.2 ([🚨](#-troubleshooting), the table of old instructions).

**`src/types.ts`.** Backend 1.2 sends `lat` and `lng` in every row of `GET /devices` ([6.1](#61-lat-and-lng-join-get-devices-dbdevicests-and-the-device-schema-10-minutes)). In `export type Device = {`, just below `location: string | null;`, add:

```ts
  // Module 25: the device's point on the map, in decimal degrees (latitude -90 to 90, longitude -180 to 180).
  // null = the admin hasn't set the point yet. The backend always fills both as a pair (both numbers or both null).
  lat: number | null; // latitude, for example -6.1754
  lng: number | null; // longitude, for example 106.8272
```

The whole file: [`types.ts`](code/stages/practice-7/frontend/src/types.ts) of the Practice 7 stage (**Copy raw file**).

#### 7.2 `map.ts` and `DeviceMap.tsx`: tiles, attribution, and markers colored by status (22 minutes)

**Step 1 — the map settings.** Right-click **`frontend/src`** → **New File…**, name it **`map.ts`**, then fill it in (or **Copy raw file** from [its stage](code/stages/practice-7/frontend/src/map.ts)):

```ts
// map.ts - the device map settings (Module 25) in ONE constant: the tile address, the attribution text, the zoom limits, and the
// marker colors. The OpenStreetMap tile policy asks that the tile address isn't planted in many places ("Avoid hard-coding the tile
// URL"): if you later move to another tile provider, only this file changes.
export const MAP = {
  // The OFFICIAL OpenStreetMap tile address: https, without "{s}." (the old a./b./c.tile... addresses can be slow or closed).
  // {z} = zoom level, {x} and {y} = the tile square's number. The browser downloads tiles straight from the OpenStreetMap server,
  // so the Map page needs the internet. Downloading tiles in bulk or storing them for offline use is FORBIDDEN by this policy.
  tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  // The attribution MUST show on the map (a condition of the OpenStreetMap data license). Leaflet puts it in the bottom
  // right corner as HTML, so its link can be clicked. Single quotes because the text holds double quotes.
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19, // OpenStreetMap tiles exist up to zoom 19 (one tile a few dozen meters wide)
  closeZoom: 18, // when the map is "fitted" to the device points, zoom 18 at the closest: the house and the nearby streets show
  // The fill color of the marker circles. The map's SVG doesn't know Tailwind classes, so the colors are written as color codes.
  // A color is never alone: the marker popup and the legend under the map write the status in words.
  onlineColor: "#15803d", // green (like Tailwind's green-700): the device is online
  otherColor: "#64748b", // gray (like Tailwind's slate-500): offline, offline mode, unknown, or its messages are ignored
};
```

One constant, `MAP`, holds the tile address, the attribution, the zoom limits, and two colors, as the OSM policy's message "Avoid hard-coding the tile URL" asks. The colors are hexadecimal codes because Leaflet draws the map circles as SVG, out of reach of Tailwind's classes.

**Step 2 — the map component.** Right-click **`frontend/src/components`** → **New File…**, name it **`DeviceMap.tsx`**, then fill it in (or **Copy raw file** from [its stage](code/stages/practice-7/frontend/src/components/DeviceMap.tsx)):

```tsx
// DeviceMap.tsx - the device map (Module 25). Every device that has a point (lat, lng from GET /devices, backend
// 1.2) becomes a colored circle on an OpenStreetMap map. Its color follows the LIVE status in the store (Socket.IO events, no
// polling): a device that disconnects turns gray by itself. Tap a circle: name, status, last seen, a link to its details.
// The libraries: Leaflet (the map drawer) + react-leaflet (Leaflet in the form of React components).
import "leaflet/dist/leaflet.css"; // Leaflet's CSS: without it the map tiles are scattered and the zoom buttons have no shape
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router";
import { getDevices, ApiError } from "../api";
import { MAP } from "../map";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";
import type { Device } from "../types";
import { StatusBadge } from "./Badge";
import LastSeen from "./LastSeen";

// A device that SURELY has a point. "p is DeviceWithPoint" tells TypeScript: if this function answers true,
// that device's lat and lng are numbers (not null), so they may be used as coordinates right away.
// typeof (not !== null): backend 1.1 doesn't send lat/lng at all (undefined), and that also means "no point".
type DeviceWithPoint = Device & { lat: number; lng: number };
function hasPoint(p: Device): p is DeviceWithPoint {
  return typeof p.lat === "number" && typeof p.lng === "number";
}

// "lat,lng;lat,lng" -> [[lat, lng], [lat, lng]]: a list of number pairs that Leaflet understands
function toCoordinates(points: string): [number, number][] {
  return points.split(";").map((t) => t.split(",").map(Number) as [number, number]);
}

// Fit the map to all points (fitBounds). points = ONE text "lat,lng;lat,lng" (the same pattern as idList in
// socket.ts): the same text = the same coordinates, so this effect only runs again when a point is moved or added,
// not every time a device status changes. A map the user is dragging or zooming doesn't jump by itself.
function FitMap({ points }: { points: string }) {
  const map = useMap(); // the Leaflet map of the <MapContainer> above it
  useEffect(() => {
    map.fitBounds(toCoordinates(points), { padding: [40, 40], maxZoom: MAP.closeZoom });
  }, [map, points]);
  return null; // this component draws nothing, it only moves the map
}

// One marker. Its own component (like DeviceCard in DeviceList) so that every marker picks its status
// ITSELF from the store: a status change of device A only redraws marker A.
function DevicePoint({ p }: { p: DeviceWithPoint }) {
  const status = useLiveStore((s) => s.status[p.device_id]) ?? p.status;
  const last = useLiveStore((s) => s.lastSeen[p.device_id]);
  // key revoked or not registered = the backend ignores its messages, so its old status isn't trusted (Module 21)
  const messagesIgnored = p.key === "revoked" || p.key === "unregistered";
  const online = status === "online" && !messagesIgnored;

  return (
    // CircleMarker = a circle drawn as SVG, not an icon picture. Leaflet's default marker icon (Marker) uses
    // image files that go missing after npm run build; a circle needs no file at all, and its color can carry the status.
    // pathOptions may change: react-leaflet calls setStyle(), so the color changes without redrawing the map.
    <CircleMarker
      center={[p.lat, p.lng]}
      radius={10}
      pathOptions={{ color: "#ffffff", weight: 3, fillColor: online ? MAP.onlineColor : MAP.otherColor, fillOpacity: 1 }}
    >
      {/* Popup: its content is only drawn when the circle is tapped. A <p> element is deliberately not used: Leaflet's CSS gives
          paragraphs inside a popup a big top and bottom gap. font-sans: the same letters as the dashboard (Leaflet uses
          its own font). The popup box colors are set in index.css (they follow dark mode). */}
      <Popup>
        <div className="flex min-w-48 flex-col gap-1 font-sans text-sm">
          {/* the name is set by the admin through the API; JSX shows it as plain text (safe from XSS) */}
          <strong className="text-base">{p.name ?? p.device_id}</strong>
          <span className="text-slate-500 dark:text-slate-400">
            {p.location ?? "location not set"} · <span className="font-mono">{p.device_id}</span>
          </span>
          <span>{messagesIgnored ? "messages ignored by the backend" : <StatusBadge status={status} />}</span>
          <LastSeen t={last} kind={p.kind} checkStale={!messagesIgnored} />
          {/* an ordinary React Router link: goes to the details screen without reloading the page */}
          <Link to={"/devices/" + p.device_id} className="inline-flex min-h-11 items-center font-medium">
            Open details →
          </Link>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function DeviceMap() {
  const devices = useLiveStore((s) => s.devices); // null = still loading
  const error = useLiveStore((s) => s.devicesError);

  // The device list is fetched AGAIN every time the map is opened (Layout only fetches it once after logging in), so that
  // a point the admin has just set with Bruno (PUT /devices/:id/location) shows at once without F5. Points aren't sent
  // through Socket.IO; the device status stays live. In dev mode, StrictMode runs this effect twice (two GETs).
  useEffect(() => {
    let ignore = false;
    getDevices()
      .then((list) => {
        if (!ignore) useLiveStore.getState().setDevices(list);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        // the old list is already there (fetched by Layout): a toast is enough. DON'T fill devicesError, because the
        // Devices, Details, History screens and the rule form read it too and would switch to a red box although the data is there.
        if (useLiveStore.getState().devices !== null) {
          toast("Couldn't reload the device list: the map points may not be the latest.", "error");
          return;
        }
        useLiveStore.getState().setDevicesError(err instanceof ApiError ? err.message : "Couldn't load the devices.");
      });
    return () => {
      ignore = true; // the Map screen is closed already: an answer that arrives late is ignored
    };
  }, []);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  if (devices === null) return <p className="text-slate-600 dark:text-slate-400">Loading devices…</p>;

  const withPoint = devices.filter(hasPoint);
  const withoutPoint = devices.filter((p) => !hasPoint(p));
  const messageBox = "rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  // backend 1.1 (before Module 25) doesn't send the lat field at all: say so, not just "no point yet"
  if (devices.length > 0 && devices.every((p) => !("lat" in p))) {
    return <p className={messageBox}>The backend doesn't send map points (lat, lng) yet. The Map page needs backend 1.2 (Module 25).</p>;
  }
  if (withPoint.length === 0) {
    return (
      <p className={messageBox}>
        No device has coordinates yet. Set them with the Bruno request <code className="font-mono">set device location</code>.
      </p>
    );
  }

  const points = withPoint.map((p) => p.lat + "," + p.lng).join(";");

  return (
    <>
      {/* The map height MUST be written (h-96 = 24rem = 384 px): without a height, the map box is 0 px tall and can't be seen.
          isolate: Leaflet's layers (z-index 400-1000) stay inside this box, they don't cover the toasts (z-50).
          bounds = the first view; FitMap takes care of points that change afterwards. */}
      <MapContainer
        bounds={toCoordinates(points)}
        boundsOptions={{ padding: [40, 40], maxZoom: MAP.closeZoom }}
        maxZoom={MAP.maxZoom}
        className="isolate h-96 w-full rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <TileLayer url={MAP.tiles} attribution={MAP.attribution} maxZoom={MAP.maxZoom} />
        <FitMap points={points} />
        {withPoint.map((p) => (
          <DevicePoint key={p.device_id} p={p} />
        ))}
      </MapContainer>

      {/* a color legend in words, because color alone can't be read by everyone */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: MAP.onlineColor }} /> online
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: MAP.otherColor }} /> not online,
          or its messages are ignored by the backend
        </span>
      </div>
      {withoutPoint.length > 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No point yet: {withoutPoint.map((p) => p.name ?? p.device_id).join(", ")}.
        </p>
      ) : null}
    </>
  );
}
```

Read from top to bottom:

- **`import "leaflet/dist/leaflet.css"`**: without Leaflet's CSS, the tiles are scattered and the zoom buttons lose their shape. From `react-leaflet` come `MapContainer` (the map box), `TileLayer` (the tile layer), `CircleMarker`, `Popup`, and `useMap()`.
- **`hasPoint()`** filters the devices whose `lat` and `lng` are numbers; `p is DeviceWithPoint` tells TypeScript that once a device passes, both are surely `number`. The check is `typeof`, because backend 1.1 doesn't send the columns at all (`undefined`). **`toCoordinates()`** turns the text `"lat,lng;lat,lng"` into number pairs.
- **`FitMap`** calls `fitBounds()` so that every point fits in the box (a 40 px margin, zoom 18 at the closest). The points are passed as ONE text, so the effect only runs again when a point moves or is added, not every time a status changes: a map you are dragging doesn't jump by itself.
- **`DevicePoint`** = one marker with its own status selector from the [Zustand store](../module-23-realtime-dashboard/README.md#4-one-store-for-every-screen-zustand-and-selectors), like `DeviceCard` in the device list. Green only when `online` **and** its key isn't revoked and it is registered (`messagesIgnored`, Module 21); otherwise gray. A color change only repaints that circle, not the whole map. Its popup: the name, the location · `device_id`, the status badge, "last seen" with Module 23's stale-data rule, and an **Open details →** link 44 px tall.
- **The effect in `DeviceMap`** fetches `GET /devices` again **every time the Map is opened** (`Layout` only does it once after logging in), so that a new point from Bruno shows without **F5** (Concept 9); the `ignore` pattern and `401` → `handleSessionExpired()` are the same as in Modules 23–24. If it fails while the old list is there, an error [toast](../module-24-control-rules-roles/README.md#41-toastts-and-toastregion-at-the-bottom-of-a-phone-at-the-top-right-of-a-wide-laptop-15-minutes) is enough, without `devicesError`: the Devices, Details, and History screens and the rule form read it too and would also switch to a red box.
- **Three messages before the map:** `Loading devices…`, the message for backend 1.1 (`The backend doesn't send map points (lat, lng) yet. The Map page needs backend 1.2 (Module 25).`), and `No device has coordinates yet. …`.
- **`MapContainer`** has the classes `isolate h-96 …`. **`h-96`** (384 px) is a must: without a written height, the map box is 0 px tall. **`isolate`** keeps Leaflet's layers (z-index 400–1000) inside their box, so that the toasts (`z-50`) aren't covered by the map.
- **Below the map**, a color legend in words and the list `No point yet: …`.

#### 7.3 `Map.tsx`, the `/map` route for admin and viewer, then the Map menu (10 minutes)

**Step 1 — the page.** Right-click **`frontend/src/pages`** → **New File…**, name it **`Map.tsx`**, then fill it in:

```tsx
// pages/Map.tsx - the /map screen (Module 25): a title + the device map. Admins and viewers may both look; this map only
// shows. The points are set by the admin through the API (PUT /devices/:id/location), not written in the frontend code.
import DeviceMap from "../components/DeviceMap";

export default function MapPage() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Device Map</h2>
      <DeviceMap />
    </>
  );
}
```

**Step 2 — the address.** In `src/App.tsx`, add the import below `import LoginPage from "./pages/Login";`:

```tsx
import MapPage from "./pages/Map";
```

Then the route, just below the `/devices/:id/history` route, before the `/rules` route:

```tsx
          {/* Module 25: the device map, for admins and viewers (outside the AdminOnly guard) */}
          <Route path="/map" element={<MapPage />} />
```

It is deliberately **outside** the [`AdminOnly`](../module-24-control-rules-roles/README.md#31-useadmin-and-the-second-guard-adminonly-10-minutes) guard: a viewer may look at the map; only the admin moves the points, through the API.

**Step 3 — the menu.** In `src/components/Layout.tsx`, insert this between the **Devices** `NavLink` and the comment above the **Rules** `NavLink`:

```tsx
            {/* Module 25: the device map, for admins and viewers */}
            <NavLink to="/map" className={menuClass}>
              Map
            </NavLink>
```

**Step 4 — the popup in dark mode.** Replace the whole content of `src/index.css` with [its stage](code/stages/practice-7/frontend/src/index.css) (**Copy raw file**). Below its old content there are new rules: the popup link is teal, and the popup box, its tail, its link, and the ✕ button follow dark mode. The selectors start with `.leaflet-container` because Leaflet's CSS is loaded **after** `index.css`. The tiles aren't touched.

The whole files [`App.tsx`](code/stages/practice-7/frontend/src/App.tsx) and [`Layout.tsx`](code/stages/practice-7/frontend/src/components/Layout.tsx): **Copy raw file**. Save everything, then run `npm run dev` again in the `frontend` terminal.

#### 7.4 ⭐ Test the Map: attribution, live status, the viewer account, a 375 px phone, and dark mode (10 minutes)

1. **The first map.** In Chrome, open `http://localhost:5173`, log in as admin, then click the **Map** menu. **Result (the author's lab, laptop path, 1280 px):** the menu `Devices` · `Map` · `Rules`, the heading `Device Map`, a 736 × 384 px map box with three circles (`f00d00000001` and the Garden green, `f00d00000002` gray because its key was revoked in [4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes)), the attribution ` Leaflet | © OpenStreetMap contributors` in the bottom right corner, and the legend `online` · `not online, or its messages are ignored by the backend`. The author's `npm run dev` test already loaded real OSM tiles; 7.5 tests them again in the production build.
2. **Popup.** Click the `f00d00000001` circle. **Result (the author's lab):** `Practice living room` / `living room · f00d00000001` / `Online` / `last seen just now` / `Open details →` (`/` = a new line). **Open details →** opens its details screen without a reload.
3. **Live status.** With the Map open, press **Ctrl + C** in the `tools` terminal. **Result (the author's lab):** about 1 second later, without a reload, the `f00d00000001` circle turns gray and the toast `f00d00000001 disconnected (offline)` appears. **The Garden stays green** although it has gone silent too: its status is published by the simulator that is already dead, without a will ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline): silent is not the same as offline). Within a minute, run the simulator again with the same command, then `garden start`; the backend holds 📴 back for 60 seconds, so no message comes. If more than about 6 minutes pass, Grafana sends 🔴 and then ✅ as in [5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes). Device path: cut Node 1's power; its circle turns gray after its will is published (not recorded by the author).
4. **A moved point.** Still on the Map, send the Bruno request **set device location** (admin) for `f00d00000002` or another device with `{"lat": -6.176, "lng": 106.828}`. In the code test lab, its circle **stays put** (points don't travel through Socket.IO), then moves without **F5** after a click on **Devices** and then **Map**. Put its fictional point back (6.4).
5. **The viewer account.** In the second browser, log in as viewer and open **Map**. **Result (the author's lab):** the header `Home Guest (viewer)`, the same menu and three circles, and the popup still with **Open details →**.
6. **The keyboard.** Press **Tab** repeatedly. **Result (the code test lab):** after `Rules` and `Log out`, the focus goes to the map box, and the arrow keys pan it. The circles can't be reached with **Tab**; their content is also on the **Devices** screen.
7. **A width of 375 px.** In Chrome, turn on [DevTools device mode](../module-22-react-basics/README.md#71-devtools-device-mode-the-dashboard-at-375-768-and-1280-px-8-minutes), **Responsive**, width `375`. **Result (the author's lab, device mode, not a real phone):** a 343 × 384 px map box without horizontal scrolling, the menu on one line, three circles, and the attribution whole.
8. **Dark mode.** DevTools → **Rendering** → **Emulate CSS media feature prefers-color-scheme** → **prefers-color-scheme: dark** ([Module 23](../module-23-realtime-dashboard/README.md#10-dark-mode-following-the-phones-and-the-laptops-setting)), then click a circle. **Result (the author's lab):** the page and the popup are dark, the tiles stay light. Set it back to **No emulation** and turn off device mode.

![Composite of two real screenshots of the Map page of the Mini Smart Home dashboard v1.1, a production build, the admin account, in Chrome 156 (Linux, a Raspberry Pi 5 playing the laptop). Left, laptop 1280 pixels: the header Mini Smart Home, Live, the menu Devices, Map active (number 1), Rules, Home Admin (admin), Log out; the title Device Map; an OpenStreetMap map around Monumen Nasional with the plus and minus buttons; a white popup Practice living room, living room · f00d00000001, the badge Online, last seen just now, the link Open details (number 3); below the popup two green circles (number 2) and one gray circle partly hidden by the popup; the attribution in the bottom right corner: a small flag, Leaflet, © OpenStreetMap contributors (number 4); under the map the legend green dot online and gray dot not online, or its messages are ignored by the backend (number 5). Right, device mode 375 pixels (not a real phone): the menu Devices, Map (number 1), Rules on one row, Home Admin (admin) and Log out on a second row; the map box 343 by 384 (number 6) with three circles: gray f00d00000002, green f00d00000001, green mock Garden (number 2); the same attribution (number 4) and the color legend on two lines. The map points are fictional; f00d00000002 is gray because its key was revoked in Practice 4.2.](assets/map-page.png)

**You pass this ⭐ step** when the Map draws every device of yours that has a point, with the attribution `© OpenStreetMap contributors`, the circle of the simulator (or Node 1) turns gray by itself when it's stopped, and the map also shows for a viewer, at 375 px, and in dark mode. A gray map, toasts covered by the map, or a point that doesn't move: [🚨](#-troubleshooting).

#### 7.5 Dashboard 1.1.0: lint, build, `check-schema`, and `preview` (10 minutes)

In the `frontend` terminal, stop Vite (**Ctrl + C**; port 5173 is used by the dish). In the free terminal, run `npm pkg set version=1.1.0` (no output), then `npm install` so that `package-lock.json` changes too (the author's lab: `up to date, audited 111 packages in 1s`). Then run `npm run lint`.

**Expected output (the author's lab):**

```text
> mini-smart-home-frontend@1.1.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 62ms on 49 files with 116 rules using 4 threads.
```

49 files = Module 24's 46 + the three new files. Then run `npm run build`.

**Expected output (the author's lab, trimmed):**

```text
dist/index.html                     1.18 kB │ gzip:   0.65 kB
dist/assets/index-CtCrLpye.css     39.18 kB │ gzip:  11.88 kB
dist/assets/index-aJ6zWjz4.js   1,039.43 kB │ gzip: 309.38 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
…
✓ built in 1.43s
```

The yardstick is the same as in [Module 24](../module-24-control-rules-roles/README.md#101-dashboard-100-lint-build-check-schema-and-the-version-number-15-minutes): **the build passes with one size warning**. The bundle is about 157 kB (about 46 kB gzip) bigger than dashboard 1.0.0: that's Leaflet, react-leaflet, and the map code ([🔬](#-technical-deep-dive-optional) *Leaflet without a wrapper, and `lazy()` …*). Your file names and numbers may differ. Then run `npm run check-schema`: two `SAME` lines.

Finally, in the `frontend` terminal, run `npm run preview`, then open `http://localhost:5173/map`. Asked to log in? Log in as admin; you're sent back to `/map`. **Result (the author's lab, production build):** 12 real OSM tiles showing the National Monument, three circles, the same attribution, 0 console errors. In the **Console** tab, `document.querySelectorAll("img.leaflet-marker-icon").length` answers `0`: the markers don't use image files, so they don't go missing like `Marker` icons (Concept 8). Lighthouse Accessibility for `/map` ([Module 24](../module-24-control-rules-roles/README.md#91-lighthouse-and-the-color-picker-measure-the-contrast-then-fix-the-colors-15-minutes)) in the author's code lab: 100, light and dark.

Stop the dish (**Ctrl + C**), run `npm run dev` again, then save to the branch from the free terminal (the `frontend` folder):

```text
git add package.json package-lock.json src
git commit -m "Dashboard 1.1.0: the Map page with react-leaflet (Module 25 Practice 7)"
```

The frontend's `README.md` is updated in [➕ D](#d-update-frontendreadmemd-to-11-then-the-tools-and-edge-readmes-and-the-project-readme).

> ⬆️ **Done with Practice 7?** Read [Concept 10](#10-the-daily-report-it-arrives-by-itself-every-morning-as-long-as-the-backend-is-running), then continue to [Practice 8](#practice-8--backend-12-a-daily-csv-report-to-telegram-60-minutes).

### Practice 8 — Backend 1.2: a daily CSV report to Telegram (60 minutes)

> 🖥️ **Tools used:** **VS Code** with the `backend` terminal (backend 1.2 from Practice 6, `npm run dev`) that **keeps running** and one free terminal in the `backend` folder for `npm` and Git; **Bruno** (8.5); the **Telegram** app on your phone or laptop, with the Module 19 bot; **Excel** or **LibreOffice Calc** (8.5); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db`. Laptop path: the broker, the simulator, and the mock Garden keep running; device path: Node 1 and Node 2 on. Concepts used: 10.
>
> ⭐ **Required** — step 8.5: `npm test` passes 14 files / 96 tests, the Bruno request `send report now` is answered `200` and the file `report-….csv` arrives in your Telegram, a viewer is refused with `403`, then the CSV opens in separate columns in a spreadsheet.

The second stage of backend 1.2: three new files, three old files that grow, `.env.example`, one Bruno request, and five test files. No migration and no new package (node-cron and grammY have been there since Module 19); the version stays `1.2.0` from [6.4](#64--version-120-docs-and-the-bruno-request-set-device-location-200-403-400-10-minutes). The reasons are in [Concept 10](#10-the-daily-report-it-arrives-by-itself-every-morning-as-long-as-the-backend-is-running). The final state: [`code/stages/practice-8/backend/`](code/stages/practice-8/backend/) (= the final backend 1.2.0).

**How to copy** is the same as in [Practice 6](#practice-6--backend-12-device-locations-through-the-api-45-minutes) (type the pieces, or **Copy raw file**). The new code of 8.1–8.3 isn't called by anything until `server.ts` changes in 8.4, so the backend keeps running as usual. Hold off on `npm run check` until 8.5: until 8.3 is done, `reports.ts` calls a function that doesn't exist yet.

#### 8.1 `services/csv.ts`: Module 23's CSV recipe moves to the server (12 minutes)

The dashboard builds its CSV in the browser ([Module 23](../module-23-realtime-dashboard/README.md#82-srccsvts-and-the-download-csv-button-15-minutes)). The morning report is built by the backend, when no browser is open, so the recipe moves along: `quote()`, `cell()`, and `toCsv()` are the same as in `frontend/src/csv.ts`; only the type of a cell's content gets a name, `Cell`. `downloadCsv()` and `csvTime()` don't come along, because the server doesn't use them. You already tried the same recipe in [🔁 Step 4](#step-4--one-csv-row-english-style-commas-a-decimal-point-and-empty-cells).

In VS Code, right-click the **`backend/src/services`** folder → **New File…**, name it **`csv.ts`**, then fill it in:

```ts
// csv.ts - builds CSV text on the server (Module 25, for the daily report). Its recipe is the SAME as Module 23's frontend/src/csv.ts,
// so that the file from the dashboard and the one from the Telegram report open just as neatly in Excel or LibreOffice with English
// (US/UK) regional settings: a comma separator (,), a decimal point (28.5), a BOM at the start of the file, and CRLF at the end of every line.
// Every function here is "pure": it only turns its input into text, with no database and no network, so it is easy to test.

export type Cell = string | number | null; // the content of one cell: text, a number, or empty

// quote - a value containing , " or a line break is wrapped in double quotes, and the quotes inside are doubled.
// Example: Node 1, living room  ->  "Node 1, living room"
export function quote(text: string): string {
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

// one cell: a number keeps its decimal point (28.5), null (failed sensor, missing column, or no data) becomes an empty cell
function cell(value: Cell): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  return quote(value);
}

// toCsv - rows (an array of arrays) become one CSV text
export function toCsv(rows: Cell[][]): string {
  // "\uFEFF" = BOM: an unseen mark saying the content is UTF-8, so special letters in device names (for example ° or é) stay whole
  // in Excel. In the file, this BOM becomes 3 bytes: EF BB BF.
  return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
```

Its functions are pure, so they're easy to test. Also create **`src/services/csv.test.ts`** from [its stage](code/stages/practice-8/backend/src/services/csv.test.ts) (**Copy raw file**): four tests for the 3-byte BOM `EF BB BF` + `,` + CRLF, the decimal point, `null` becoming an empty cell, and text containing `,`, `"`, or a line break being wrapped in quotes.

#### 8.2 `services/reports.ts`: yesterday's WIB range, one query, and a schedule (18 minutes)

This file is 186 lines, too long to type. Right-click **`src/services`** → **New File…** → **`reports.ts`**, then fill it with [`code/stages/practice-8/backend/src/services/reports.ts`](code/stages/practice-8/backend/src/services/reports.ts) (**Copy raw file**). Its tests too: **`src/services/reports.test.ts`** from [its stage](code/stages/practice-8/backend/src/services/reports.test.ts). Then read the file together with the three parts below.

**Part 1: the range of "yesterday" by WIB.**

```ts
export function reportRange(now: Date, today = false): ReportRange {
  const todayDate = isoDate.format(now); // the date in WIB, not the date in the laptop's time zone
  const startOfToday = new Date(`${todayDate}T00:00:00+07:00`);
  if (today) return { from: startOfToday, to: now, date: todayDate, today };
  const startOfYesterday = new Date(startOfToday.getTime() - DAY_MS);
  return { from: startOfYesterday, to: startOfToday, date: isoDate.format(startOfYesterday), today };
}
```

`isoDate` is `Intl.DateTimeFormat("sv-SE", …)` with `timeZone: "Asia/Jakarta"`: the Swedish format happens to look like `2026-10-26`, and `timeZone` makes it the WIB date. Add `T00:00:00+07:00` and you get 00:00 WIB, whatever the laptop's time zone. Yesterday = exactly 24 hours back, because WIB has no daylight saving time. `to` itself isn't counted, the same as the `<` in [🔁 Step 3](#step-3--yesterday-by-the-wib-clock-date_trunc-and-at-time-zone). `reportFileName()` names the file after the date of its content (`report-2026-10-26.csv`); a `?day=today` report ends in `-partial.csv`.

**Part 2: one query, 15 columns.** `REPORT_COLUMNS` = the order of the CSV columns, the same as the column names of the result of `REPORT_QUERY`. That query has four `WITH` parts (named in-between results, used like tables): `summary` from [`readings_hourly`](../../phase-3-backend-data/module-18-timescaledb/README.md#5-continuous-aggregates-a-summary-book-written-by-an-automatic-clerk) (the daily average weighted by the number of values per hour), `vitals` and `health` from `device_health`, and `drops` from `events`. Its ending:

```sql
SELECT d.device_id, coalesce(d.name, d.device_id) AS name, d.kind,
       coalesce(r.reading_count, 0) AS reading_count, r.avg_temp, r.min_temp, r.max_temp, r.avg_humidity,
       r.avg_soil, r.min_soil, s.avg_rssi, s.worst_rssi, s.min_heap, s.restarts,
       coalesce(p.disconnects, 0) AS disconnects
FROM devices d
LEFT JOIN summary r ON r.device_id = d.device_id
LEFT JOIN health s ON s.device_id = d.device_id
LEFT JOIN drops p ON p.device_id = d.device_id
WHERE d.registered_at IS NOT NULL AND d.revoked_at IS NULL
ORDER BY d.device_id
```

The query starts from `devices`, and `LEFT JOIN` keeps devices without data: one that was silent all day gets `reading_count` `0` through `coalesce`, while Node 2's vitals stay `NULL` (an empty cell in the CSV). `WHERE` drops devices that aren't registered or whose key is revoked. `restarts` uses `lag(uptime_s)`, the previous vitals uptime of the same device: every time the uptime drops, that device has restarted. `disconnects` counts the status events that say "disconnected". In the author's lab, the CSV numbers of `f00d00000001` matched a raw SQL count from `readings`. This query is deliberately in `services/`, not in `db/*.ts` like the backend's other SQL, so that one file holds the whole report, from the range to the schedule.

**Part 3: send, then schedule.** `sendReport()` checks Telegram first: if it's off, the result is `skipped` without reading the database. If it's on, it works out the range, runs the query, builds the CSV (`makeReportCsv()`), then sends it through `sendFile()` (8.3): `sent` or `failed`. Database errors are deliberately not caught here; the caller decides (the route answers `503`, the schedule writes a log). The schedule is set up by `startReports()`:

```ts
  const task = cron.schedule(schedule, (context) => scheduledReport(context.date), {
    name: "daily-report",
    timezone: ZONE, // without this, "0 7 * * *" means 07:00 in the laptop's time zone (a WITA laptop: 06:00 WIB)
    noOverlap: true, // if the previous report isn't finished yet, don't run two at the same time
    missedExecutionTolerance: 15 * 60_000, // up to 15 minutes late (for example a laptop that has just woken up) still runs
  });
  task.on("execution:missed", (context) => missedReport(context.date));
```

`context.date` = the time written in the schedule, so "yesterday" is counted from the scheduled time, not from the time the function runs. A schedule missed by more than 15 minutes goes to `missedReport()`: one log line and one ⏰ message through `notify()`, with nothing sent afterwards. It stops together with the existing `stopSchedules()`.

#### 8.3 `sendFile()` in `telegram.ts`: an `InputFile` from bytes, not from text (8 minutes)

The Module 19 bot can only send text so far (`sendMessage`). The report needs a **file** (`sendDocument`). Open `src/services/telegram.ts` ([its stage](code/stages/practice-8/backend/src/services/telegram.ts)). The grammY import line becomes:

```ts
// Module 25: the same bot also sends FILES (the daily CSV report) through sendFile().
import { Bot, GrammyError, HttpError, InputFile } from "grammy";
```

Then, right after the `notify()` function ends, add these two functions, and save:

```ts
// Module 25: why can't Telegram be used right now? null = ready to send.
export function telegramOffReason(): string | null {
  if (bot === undefined) return "TELEGRAM_BOT_TOKEN is empty";
  if (ownerChat === undefined) return "TELEGRAM_CHAT_ID is empty";
  return null;
}

// Module 25: send one file to the owner, with a caption under it. Its content is text (for example CSV) wrapped in a
// Buffer: new InputFile("text...") can NOT be used, because grammY takes text as a file PATH on the disk
// (error ENOENT). The file name must be given, so that Telegram shows it as report-2026-10-26.csv.
export async function sendFile(name: string, content: string, caption: string): Promise<boolean> {
  if (bot === undefined || ownerChat === undefined) return false;
  try {
    const file = new InputFile(Buffer.from(content, "utf8"), name); // text -> UTF-8 bytes (the BOM included, 3 bytes)
    await bot.api.sendDocument(ownerChat, file, { caption }); // files up to 50 MB, a caption up to 1024 characters
    log.info(`Telegram sent: file ${name} (${Buffer.byteLength(content, "utf8")} bytes), ${caption}`);
    return true;
  } catch (error) { // the same as notify(): refused by the Bot API, server unreachable, or another error
    if (error instanceof GrammyError) log.error(`Telegram refused the file ${name}: ${error.description}`);
    else if (error instanceof HttpError) log.error(`Telegram server unreachable: ${error.message}`);
    else log.error(`Telegram couldn't send the file ${name}: ${(error as Error).message}`);
    return false;
  }
}
```

`telegramOffReason()` gives the reason for a `409` answer. `sendFile()` uses the same bot and owner chat as the 📴/✅ messages. The key is one line: `Buffer.from(content, "utf8")` turns the text into bytes (the BOM included, 3 bytes), then `InputFile` wraps those bytes **together with their name**. The trap `new InputFile("text…")` = grammY takes your CSV content for a file path on the disk, exactly like `readFileSync(content)` in [🔁 Step 5](#step-5--text-becomes-a-file-bufferfrom-a-three-byte-bom-and-enoent): it fails with `ENOENT` or `File paths cannot contain …` ([🚨](#-troubleshooting)).

Its tests: create **`src/services/telegram.test.ts`** from [its stage](code/stages/practice-8/backend/src/services/telegram.test.ts) (**Copy raw file**). Three tests with a mock `Bot` class, without the network: Telegram off sends nothing; `sendDocument` receives an `InputFile` named `report-2026-10-26.csv`; Module 19's 📴/✅ messages still wait 60 seconds.

#### 8.4 `REPORT_SCHEDULE`, the `POST /reports/send` route, and `server.ts` (12 minutes)

**`src/config/env.ts`.** Below `import { z } from "zod";`, add `import cron from "node-cron";`. Then in `const Settings = z.object({`, just below the line `TELEGRAM_API_ROOT: …`, add:

```ts
  // Module 25: when the daily CSV report is sent to Telegram, a 5-field cron (minute hour day month weekday) in WIB.
  // The default "0 7 * * *" = every day at 07:00 WIB. A 6-field cron ("0 7 * * * *") is also valid for node-cron, but it
  // means something else (second 0, minute 7, EVERY hour), so it is refused here.
  REPORT_SCHEDULE: z.preprocess(empty, z.string().default("0 7 * * *")
    .refine((text) => text.trim().split(/\s+/).length === 5, "must have 5 fields: minute hour day month weekday, for example 0 7 * * *")
    .refine((text) => cron.validate(text), "not a valid cron expression, for example 0 7 * * * (every day at 07:00 WIB)")),
```

An empty line means the default `0 7 * * *`. A six-field schedule is refused when the backend starts: `Setting REPORT_SCHEDULE in .env: must have 5 fields: minute hour day month weekday, for example 0 7 * * *`, and then the backend stops ([🚨](#-troubleshooting)). Its tests: **`src/config/env.test.ts`** from [its stage](code/stages/practice-8/backend/src/config/env.test.ts) (**Copy raw file**, 2 tests).

**`.env.example` and `.env`.** In `.env.example`, just below `TELEGRAM_CHAT_ID=`, add:

```text
# Address of the Bot API server (Module 19). Leave it commented out = the real Telegram server; only filled in for a mock server in the lab.
# TELEGRAM_API_ROOT=
# Module 25: the time of the daily CSV report to Telegram, a 5-field cron (minute hour day month weekday) in WIB: 0 7 * * * = 07:00 WIB
REPORT_SCHEDULE=0 7 * * *
```

Also copy the line `REPORT_SCHEDULE=0 7 * * *` into your `.env` (where Module 19's token and chat_id are), then save; `npm run dev` restarts the backend by itself. Its time is tested in [9.1](#91--a-hands-off-dress-rehearsal-a-schedule-3-minutes-ahead-then-back-to-0700-15-minutes). Leave the `TELEGRAM_API_ROOT` line commented out: your bot uses the real Telegram server.

**`src/routes/reports.ts`** (NEW). Right-click **`src/routes`** → **New File…** → **`reports.ts`**, then fill it in:

```ts
// reports.ts - the /reports routes (Module 25): send the daily CSV report to Telegram NOW, without waiting for its schedule
// (REPORT_SCHEDULE). Its content is exactly the same as the scheduled report; ?day=today sends today's partial report.
// Admins only: the guard (security.ts) refuses viewers for POST before they get here.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { sendReport } from "../services/reports.ts";
import { contractTime } from "../db/archive.ts";

const ErrorBody = z.object({ message: z.string() });
const ReportQuery = z.object({
  day: z.enum(["yesterday", "today"]).default("yesterday")
    .describe("yesterday = 00:00-24:00 WIB yesterday, the same as the scheduled report (default); today = today from 00:00 WIB until now"),
});

export const reportRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/reports/send", {
    schema: {
      tags: ["reports"],
      summary: "Send the daily CSV report to Telegram right now (to test it without waiting for its schedule)",
      querystring: ReportQuery,
      response: {
        200: z.object({
          file: z.string().describe("the file name in Telegram, for example report-2026-10-26.csv"),
          from: z.string().describe("start of the range (UTC): 00:00 WIB = 17:00 UTC the day before"),
          to: z.string().describe("end of the range (UTC), not counted"),
          devices: z.number().describe("number of rows: registered devices whose key isn't revoked"),
          size_bytes: z.number().describe("size of the CSV file, including the 3-byte BOM"),
          caption: z.string().describe("the caption under the file"),
        }).describe("the report was accepted by Telegram"),
        409: ErrorBody.describe("Telegram off: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env is empty"),
        502: ErrorBody.describe("Telegram refused the file or can't be reached (see the backend log)"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      const result = await sendReport(req.query.day === "today");
      if (result.status === "skipped") return reply.code(409).send({ message: `report not sent: ${result.message}` });
      if (result.status === "failed") return reply.code(502).send({ message: result.message });
      req.log.info(`report ${result.file} sent now at the request of account ${req.user.sub}`);
      const { file, range, devices, size_bytes, caption } = result;
      return { file, from: contractTime(range.from), to: contractTime(range.to), devices, size_bytes, caption };
    } catch (error) {
      req.log.error(`report couldn't be read from the database: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });
};
```

The `?day=` option is only `yesterday` (the default, the same as the scheduled report) or `today`; anything else gets `400`. The result of `sendReport()` becomes an HTTP code: `skipped` = `409`, `failed` = `502`, a database error = `503`. There's no role check here: [Module 20's guard](../../phase-3-backend-data/module-20-user-security/README.md#practice-3--a-guard-at-every-door-401-and-403-50-minutes) already refuses viewers for every `POST`. Its tests: **`src/routes/reports.test.ts`** from [its stage](code/stages/practice-8/backend/src/routes/reports.test.ts) (4 tests with the real guard).

**`src/server.ts`.** Replace its content with [the Practice 8 stage version](code/stages/practice-8/backend/src/server.ts) (**Copy raw file**). Besides the comments, the `/docs` description, and two imports, these two lines change:

```ts
await app.register(reportRoutes); // Module 25
```

```ts
startReports(env.REPORT_SCHEDULE); // Module 25: the daily CSV report to Telegram (node-cron, WIB)
```

The first one adds the routes, just below `ruleRoutes`; the second one sets up the schedule, right after `startTelegram(…)`. Save. **Result (the author's lab):** the backend restarts and writes `daily report scheduled: "0 7 * * *" Asia/Jakarta, next 27 Oct 2026, 07:00 WIB` (your date will of course differ).

#### 8.5 ⭐ `npm test`, the Bruno request `send report now`, then open the CSV (10 minutes)

1. In the free terminal (the `backend` folder), run `npm run check` (only two header lines, no errors), then `npm test`. **Expected output (the author's lab, trimmed):**

   ```text
    Test Files  14 passed (14)
         Tests  96 passed (96)
   ```

   From Practice 6's 9 files / 71 tests, five files are added: CSV 4 tests, the report 12, Telegram 3, `REPORT_SCHEDULE` 2, the route 4.
2. Right-click the **`backend/bruno`** folder → **New File…**, name it exactly **`send report now.yml`**, fill it in, then save. Its default is `?day=today`, so that even a system that only started today has content right away.

   ```yaml
   info:
     name: send report now
     type: http
     seq: 28

   http:
     method: POST
     url: "{{baseUrl}}/reports/send?day=today"
     params:
       - name: day
         value: today
         type: query
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

3. In Bruno: **`login admin`** → **`send report now`**. **Expected output (the author's lab, 04:08 WIB; sent by a lab script equivalent to Bruno; your numbers differ):**

   ```text
   200 {"file":"report-2026-10-27-partial.csv","from":"2026-10-26T17:00:00Z","to":"2026-10-26T21:08:32Z","devices":2,"size_bytes":326,"caption":"📊 Mini Smart Home partial report 27 Oct 2026 (00:00–04:08 WIB): 2 device(s)"}
   ```

   `from`/`to` are in UTC (17:00Z = 00:00 WIB). The backend log: `Telegram sent: file report-2026-10-27-partial.csv (326 bytes), 📊 Mini Smart Home partial report …`. The mock Telegram server in the author's lab received one `sendDocument` holding the caption and that file (326 bytes, starting with `ef bb bf`). In your Telegram, the file comes from the Module 19 bot (the app's display wasn't tested by the author). Got `409` `report not sent: Telegram off (TELEGRAM_BOT_TOKEN is empty)`? Fill in the token in `.env`; other codes: [🚨](#-troubleshooting) *`POST /reports/send` answers …*.
4. **Yesterday's report.** Remove `?day=today` from the URL, send it, then put it back. **Result (the author's lab):** `report-2026-10-26.csv`, 295 bytes, `📊 Mini Smart Home daily report 26 Oct 2026: 2 device(s)`. Two, not three: `f00d00000002`'s key was revoked in [4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes). Your system only started today? Then yesterday's rows normally hold `0` and empty cells.
5. **Viewer.** **`login viewer`** → **`send report now`**. **Result (the author's lab):** `403` `{"message":"viewer accounts can only look; commands and changes are admin-only"}`, and no file. Send **`login admin`** again.
6. **Open the CSV.** Download the file from Telegram, then open it with Excel or LibreOffice Calc with English regional settings. Expected: 15 columns, decimal points (`28.5`), and empty Node 2 vitals cells. This step **wasn't tested by the author** (no spreadsheet, a mock Telegram). Only one column, or numbers turning into dates? [🚨](#-troubleshooting) *The CSV opens as one column …*.

The picture below: the answer, the log, and the partial report file as text (`cat`) and as bytes (`xxd`), from another run (11:19 WIB); its numbers differ.

![Composite of real text from a bash terminal and the backend log, not a screenshot of an app, Practice 8.5; the CSV is not opened in Excel or LibreOffice because there is no spreadsheet on the author's machine, and Telegram is a mock Bot API server. Panel 1, the answer of POST http://localhost:8080/reports/send?day=today through curl as admin, like the Bruno request, Response 200, JSON pretty-printed: file report-2026-10-28-partial.csv (number 1), from 2026-10-27T17:00:00Z, to 2026-10-28T04:19:35Z, devices 2, size_bytes 305 (number 2), caption 📊 Mini Smart Home partial report 28 Oct 2026 (00:00–11:19 WIB): 2 device(s) (number 2). Panel 2, the backend log, a long line folded, at 11:19:35 WIB: INFO: Telegram sent: file report-2026-10-28-partial.csv (305 bytes) and its caption (number 3), report sent now at the request of account 1, POST /reports/send?day=today with 200 (48 ms), WARN: refused (403): account 2 (viewer) tried POST /reports/send?day=today (number 4). Panel 3, what the mock received: sendDocument multipart (number 5), the fake chat_id 777000111, the same caption, document report-2026-10-28-partial.csv 305 bytes, starting ef bb bf 64 65 76 69 63, parse_mode not sent (number 5). Panel 4, cat: the header row device_id,name,kind to disconnects with a comma separator (number 6); f00d00000001,Practice living room,node1,421,29.1,25,33,… with the decimal point 29.1 (number 7); f00d000000b2,Garden (mock),node2,14,28.1,…,35,,,,,1 with four empty cells between five commas (number 8). Panels 5 and 6, xxd: 00000000: efbb bf64 6576 … with the BOM efbb bf shown as three dots (number 9); 00000088: … 7473 0d0a 6630 … with the line end 0d0a shown as two dots (number 10) and 29.1 in row b8 (number 7).](assets/csv-report.png)

**You pass this ⭐ step** when `npm test` passes 14 / 96, the admin gets `200` and the file arrives in your Telegram, a viewer gets `403`, and the CSV opens in separate columns.

**Save to the branch.** In the free terminal (the `backend` folder); `.env` isn't included because it's in `.gitignore`:

```text
git add src bruno .env.example
git commit -m "Backend 1.2.0: the daily CSV report to Telegram (Module 25 Practice 8)"
```

The backend's `README.md` is updated in [➕ C](#c-update-backendreadmemd-bruno-and-docs-to-120).

> ⬆️ **Done with Practice 8?** Continue to [Practice 9](#practice-9--a-report-that-arrives-by-itself-then-grafana-as-files-35-minutes): the same report, now arriving by itself without being touched.

### Practice 9 — A report that arrives by itself, then Grafana as files (35 minutes)

> 🖥️ **Tools used:** **VS Code** with the `backend/.env` file, the `backend` terminal (backend 1.2, `npm run dev`) that **keeps running**, and one free terminal in the `mini-smart-home` folder for Git; the **Telegram app** with the Module 19 bot (9.1); **Chrome** or **Edge** with Grafana at `http://localhost:3000`, logged in as `admin` (9.2–9.3); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana`. Laptop path: the broker, the simulator, and the mock Garden keep running; device path: Node 1 and Node 2 on. Concepts used: 10, plus 5 for the dashboard export.
>
> ⭐ **Required** — steps 9.1 and 9.2: the scheduled report arrives in your Telegram without you touching anything (**G3**), then the `System Health` dashboard and the `Silent node` rule are saved as files in `grafana/` and go into the branch, without a token or chat_id.

Practice 8 checked the report's content with a test button. The pass requirement asks for more: the report **arrives automatically**, so in 9.1 the report time is moved to 3 minutes from now, and then you take your hands off. In 9.2, the dashboard and the alert rule, which so far only live in Grafana's cupboard (`smarthome-grafana-data`), are exported as files in Git: assembled without coding, then saved as code. 9.3 tries those files by importing them again.

#### 9.1 ⭐ A hands-off dress rehearsal: a schedule 3 minutes ahead, then back to 07:00 (15 minutes)

Waiting until 07:00 tomorrow is also fine, but a rehearsal is faster. What's tested here is the backend's own clock, not the `POST /reports/send` button of 8.5.

1. **Work out the schedule.** Look at the time now **in WIB**, add 3 minutes, then write it as a five-field cron `minute hour * * *` ([Concept 10](#10-the-daily-report-it-arrives-by-itself-every-morning-as-long-as-the-backend-is-running)). Examples: at 04:12 → `15 4 * * *`; at 09:58 → `1 10 * * *`. This schedule is always read in WIB (`timezone: "Asia/Jakarta"`), whatever your laptop's time zone: on a WITA laptop, subtract 1 hour from its clock; on a WIT laptop, 2 hours. The author's laptop is on WITA.
2. **Change `.env`, then save.** In VS Code, open `backend/.env`, change the line `REPORT_SCHEDULE=0 7 * * *` from [8.4](#84-report_schedule-the-post-reportssend-route-and-serverts-12-minutes) to your schedule, for example `REPORT_SCHEDULE=15 4 * * *`, then press **Ctrl + S** (macOS **Cmd + S**). Don't touch the terminal: `npm run dev` runs `node --watch --env-file=.env`, which restarts the backend by itself every time `.env` is saved.

   **Expected output (the author's lab, trimmed; the log prints the laptop's clock, WIB in the author's lab; your path differs):**

   ```text
   Change detected in '/home/you/mini-smart-home/backend/.env'
   Restarting 'src/server.ts'
   [04:12:21] INFO: SIGTERM received: the backend is stopping gracefully
   …
   [04:12:22] INFO: daily report scheduled: "15 4 * * *" Asia/Jakarta, next 27 Oct 2026, 04:15 WIB
   …
   [04:12:22] INFO: Telegram bot @… ready (long polling)
   ```

   Read the date and time after `next`: they must be **today**, about 3 minutes after the WIB time now. 1 hour later? The WITA time hasn't had 1 hour subtracted (WIT: 2 hours). Tomorrow's date? That minute has already passed; work it out again. No `Change detected`? Make sure `.env` is saved; if it is, your backend isn't running with `npm run dev`: **Ctrl + C**, then `npm run dev`.
3. **Hands off.** Don't click anything and don't send any Bruno request; just watch the `backend` terminal and Telegram. Write down when the file arrives.

   **Expected output (the author's lab, WIB times):**

   ```text
   [04:15:00] INFO: daily report running on schedule
   [04:15:00] INFO: Telegram sent: file report-2026-10-26.csv (295 bytes), 📊 Mini Smart Home daily report 26 Oct 2026: 2 device(s)
   ```

   The mock Telegram server in the author's lab received `sendDocument` at 04:15:00.036 WIB: `report-2026-10-26.csv`, 295 bytes, starting with `ef bb bf`; its name and size are the same as yesterday's report in [8.5](#85--npm-test-the-bruno-request-send-report-now-then-open-the-csv-10-minutes) step 4. In your Telegram, a file `report-YYYY-MM-DD.csv` dated yesterday comes from the Module 19 bot with the caption `📊 Mini Smart Home daily report …` (the app's display wasn't tested by the author); the date in its name will surely differ, and the number of devices and the size may differ. The log writes `daily report skipped: Telegram off (TELEGRAM_BOT_TOKEN is empty)`, or the file doesn't come? See [🚨](#-troubleshooting) *The morning report doesn't arrive …*.
4. **Back to 07:00.** Change it again to `REPORT_SCHEDULE=0 7 * * *`, then save. **Result (the author's lab):** after the restart, `daily report scheduled: "0 7 * * *" Asia/Jakarta, next 27 Oct 2026, 07:00 WIB`. Leave the laptop and the backend running until the next 07:00, and yesterday's report comes by itself. In the author's lab (the rehearsal at 04:12, so its "yesterday" is the same), that report arrived at exactly 07:00:00 WIB, byte for byte the same as the rehearsal file.

**The laptop asleep at report time.** If the laptop only wakes up more than 15 minutes later, that report is **not** sent afterwards; all that comes is the ⏰ message `… was missed (laptop asleep or backend busy?). Send it now with POST /reports/send` (its full example is in Concept 10). Send it yourself with the Bruno request `send report now` without `?day=today`. A backend that is down at that time leaves no message at all.

**You pass this ⭐ step** when `daily report running on schedule` shows up exactly at the minute you chose, the file `report-….csv` arrives in your Telegram without you touching anything (**G3**), and `.env` is back at `0 7 * * *`. Write the schedule time, the log time, and the time the file arrived in your notes; G3 is ticked again in [10.4](#104--the-final-dress-rehearsal-backend-tests-the-frontend-build-and-the-three-pass-requirements-20-minutes). The author proved it with a mock Telegram server; the proof with your own bot is yours.

#### 9.2 ⭐ Export the dashboard (Classic JSON) and the alert rule (archive YAML) to `grafana/` (12 minutes)

As files in Git, the dashboard and the rule can be read in a pull request, compared with the reference files, and become the "Grafana link" of the Phase 4 checkpoint ([10.3](#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes)). Prepare two folders: in VS Code, right-click the **`grafana`** folder → **New Folder…** → `dashboards`, then once more → `alerting`.

**The dashboard as Classic JSON.**

1. Open the `System Health` dashboard in **view mode** (still an **Exit edit** button? click it first).
2. In the right-hand bar, click the **Export** icon → **Export as code**. The `Export dashboard` drawer opens with the default model **V2 Resource** (`"apiVersion": "dashboard.grafana.app/v2"`).
3. Open **Advanced options**, then choose **Classic** under **Model**. The **Format** option disappears, because it's only for V2.
4. Make sure the **Share dashboard with another instance** switch is on, then click **Download file**.
5. Drag that file from the browser's download folder (usually **Downloads**) to the `grafana/dashboards` folder in VS Code's left panel, then right-click → **Rename…** → `system-health.json`.

**Result (the author's lab):** the download `System Health-1793101488289.json`, 17,961 bytes (the number in its name = the download time). Inside it, `"__inputs"` holds one `DS_GRAFANA-POSTGRESQL-DATASOURCE`, and every panel uses `"uid": "${DS_GRAFANA-POSTGRESQL-DATASOURCE}"`, not the uid (unique identifier) of your data source: that's the switch's work, so that the Grafana that imports it asks which data source to use (9.3). The choice of the `Node` variable isn't carried along either (`"current": {}`; [Concept 5](#5-variables-one-dashboard-for-every-device)). Classic is chosen because this is the form widely used to export, import, and share dashboards, the same as the reference file and the Quick Win shortcut; V2 Resource is a new form that is Grafana 13's default.

**The alert rule as an archive YAML.**

1. **Alerting → Alert rules**. Under the `Mini Smart Home` folder, the row of the `node-health` group has **Edit** and **More** buttons. Click **More** → **Export rules group**, the only option.
2. In the `Export node-health rules` drawer, choose **YAML** (the other options: `JSON`, `Terraform (HCL)`), then click **Download**.
3. Drag `node-health.yaml` (the author's lab: 3,570 bytes) to `grafana/alerting`, then rename it to `silent-node.yaml`.

That drawer says `YAML format is only valid for File Provisioning. Read more in the docs.` This means the YAML is an **archive**, not a file to import: the **Import alert rules** menu on the same page only accepts rules in the Prometheus format. Installing it needs file provisioning (Grafana reads YAML from its folder every time it starts; Module 26), which demands that a contact point with the same name already exists and that the `datasourceUid` matches; otherwise Grafana keeps crashing (it restarts over and over) ([🚨](#-troubleshooting) *Grafana keeps crashing after the rule YAML …*, [🔬](#-technical-deep-dive-optional) *Dashboards as code …*). To restore the rule in this module, make it again on the screen as in [4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes), with the YAML as a cheat sheet for the query and the Summary.

**Scan before you commit.** Open both files in VS Code. In each, press **Ctrl + F** (macOS **Cmd + F**) and search for `token`, `password`, then your chat_id number from `backend/.env`: none of them may be found (the author's lab: 0). What does get exported and isn't secret is in the YAML: `datasourceUid` (the random uid of your data source) and `receiver: Telegram Smart Home` (only the contact point's name). The contact point's content, including the bot token, is never exported.

**Compare them with the reference files** [`code/grafana/dashboards/system-health.json`](code/grafana/dashboards/system-health.json) and [`code/grafana/alerting/silent-node.yaml`](code/grafana/alerting/silent-node.yaml). In the author's lab, the exported YAML differed from the reference file in only two lines (apart from its four header comment lines): the rule's `uid` and `datasourceUid`. In the JSON, the queries and settings of the five panels are the same; the dashboard's `uid` (the author's lab: `ad6w2nq`), `version`, and the dashboard's `"description"` (only in the reference file) may differ.

**Save to the branch.** In the free terminal (the `mini-smart-home` folder):

```text
git add grafana
git commit -m "Grafana: export the System Health dashboard and the Silent node rule (Module 25 Practice 9)"
```

**You pass this ⭐ step** when `grafana/dashboards/system-health.json` (Classic, with `__inputs`) and `grafana/alerting/silent-node.yaml` are committed to the branch, without a token, password, or chat_id. A GitHub link to that JSON file is the "Grafana link" for the checkpoint.

#### 9.3 Try importing into the same Grafana: Change uid first (optional, 8 minutes)

You may skip this. It works like the Import shortcut in [Quick Win Step 6](#step-6--the-first-panel-a-temperature-query-with-format-time-series-then-save-6-minutes), plus one trap.

1. **Dashboards → New → Import dashboard**. Copy the whole content of `grafana/dashboards/system-health.json` from VS Code, paste it into the **Import via dashboard JSON model** box, then click the **second** **Load** (below that box).
2. The `Options` part says `Dashboard named 'System Health' in folder 'Mini Smart Home' has the same UID`, and its button is `Import (Overwrite)`. **Don't click it**: that button overwrites your original dashboard. The UID is the dashboard's identifier in its address (`/d/<uid>/…`), and your file carries the original UID.
3. Click **Change uid**, fill in the **Unique identifier (UID)** field with `system-health-import`, then change **Name** to `System Health (import)`. The button now says **Import**.
4. Under `DS_GRAFANA-POSTGRESQL-DATASOURCE`, choose `grafana-postgresql-datasource` (if you skip it, Grafana answers `A data source is required`), then click **Import**.

**Result (the author's lab):** the address `/d/system-health-import/system-health-import?…&var-node=$__all&refresh=1m`, and all five panels show data at once. The copy is in **Folder** `Dashboards` (the default), apart from `Mini Smart Home`. The author also imported the same JSON into a second, still empty Grafana (a lab step, not yours): after its data source was made and then chosen, all five panels showed data. The files in `grafana/` don't change, so there's nothing to commit. Another error: [🚨](#-troubleshooting) *Importing a dashboard: …*.

> ⬆️ **Done with Practice 9?** Read [Concept 11](#11-buy-or-build-ready-made-iot-platforms) (free reading), then continue to [Practice 10](#practice-10--the-phase-4-checkpoint-collect-the-evidence-45-minutes), the Phase 4 checkpoint.

### Practice 10 — The Phase 4 checkpoint: collect the evidence (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the `backend` terminal (backend 1.2, `npm run dev`), the `frontend` terminal (Vite; phone mode in 10.2), and one free terminal for tests and the build; on the laptop path, also the broker, the simulator, and the mock Garden; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana`; **Chrome** or **Edge** with Grafana at `http://localhost:3000`, the dashboard at `http://localhost:5173`, and GitHub; a **phone** on home Wi-Fi with the **Telegram app** (10.2); and your learning notes. Concepts used: 1, 11, and all the others.
>
> ⭐ **Required** — step 10.4: the backend passes `npm run check`, `npm test` (14 / 96), and `npm audit`; the dashboard passes `npm run lint`, `npm run build`, and `npm run check-schema`; G1, G2, and G3 are ticked with their evidence in your notes.

The last practice adds no feature. The Syllabus asks every phase to leave [three pieces of evidence](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase) in your repository. In 10.1–10.3 you collect the Phase 4 evidence, then in 10.4 you check the whole project once more before the pull request in [➕ F](#f--merge-featuregrafana-maps-reports-into-main-via-the-technical-dashboard--map--daily-report-phase-4-checkpoint-pull-request). No project file changes, so there's no commit; the evidence is saved in [➕ G](#g-save-your-learning-notes-and-the-phase-4-checkpoint-evidence).

#### 10.1 Three pieces of Phase 4 evidence: the quizzes, use by someone else, and a video plus a Grafana link (5 minutes)

| Phase 4 evidence (Syllabus §8) | Where it comes from | What you do now |
| :--- | :--- | :--- |
| A quiz for every module: ≥ 4 correct | 📝 [Module 22](../module-22-react-basics/README.md#-5-question-quiz), [23](../module-23-realtime-dashboard/README.md#-5-question-quiz), [24](../module-24-control-rules-roles/README.md#-5-question-quiz), and [25](#-5-question-quiz) | write down your scores; the Module 25 quiz is at the end of this module |
| Project: the dashboard used by someone else without help | [Module 24 Practice 10](../module-24-control-rules-roles/README.md#practice-10--the-pass-test-used-by-someone-else-on-a-phone-70-minutes), L1–L3 | not repeated; write "done" or "not yet" |
| Artifact: a phone demo video and a Grafana link | new this week | [10.2](#102-a-6090-second-phone-demo-video-the-script-and-what-must-not-be-recorded-15-minutes) and [10.3](#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes) |

Copy the **Phase 4 checkpoint evidence sheet** (five items at the end of [`code/checkpoint/video-script.md`](code/checkpoint/video-script.md)) into your notes, then tick only what **has already happened**. Module 24's L1–L3 not yet tested by someone else? The checkpoint may be closed later: do Module 24 Practice 10.2–10.5 as soon as you have a tester. The tasks stay the same on dashboard 1.1, which only adds the **Map** menu.

#### 10.2 A 60–90-second phone demo video: the script and what must not be recorded (15 minutes)

This short video shows that your system is really used from a phone: live numbers, controls, the map, and Telegram messages in one recording without cuts. Open [`code/checkpoint/video-script.md`](code/checkpoint/video-script.md) on GitHub and follow its first four parts:

1. **Before recording (5 minutes).** Start everything: the database, the broker, backend 1.2, the simulator or Node 1 and Node 2, and Grafana. Turn on Module 23's phone mode for the [backend](../module-23-realtime-dashboard/README.md#92-the-backend-in-phone-mode-host-and-cors_origin-10-minutes) (`HOST=0.0.0.0`, the laptop's IP in `CORS_ORIGIN`) and [Vite](../module-23-realtime-dashboard/README.md#93-vite-in-phone-mode-npm-run-devphone-and-the-private-firewall-setting-10-minutes) (`npm run dev:phone`). **Log in on the phone before you start recording**, so that the Login screen isn't recorded. Make sure the points on the **Map** are still the example points, turn on **Do Not Disturb** on the phone, and have the Module 19 bot's chat ready, already holding Grafana's 🔴/✅ (Practice 5) and the 📊 (Practice 9).
2. **The script (60–90 seconds), recorded with the phone's built-in screen recorder.** The **Devices** screen with the **Live** badge → one device with numbers that move by themselves → **Controls**: the lamp turns on after `Waiting for device confirmation…`, then off again → **Map**: green or gray circles, tap one for its popup → Telegram: Grafana's 🔴 and ✅, then the 📊 file `report-….csv` → back to the dashboard. The sentences you may say are in the script's table.
3. **What must NOT be recorded:** any password (the dashboard's and Grafana's Login screens, the keyboard); the bot token and the content of `backend/.env`; the chat_id and the BotFather page; Grafana's contact point form, because the **BOT API Token** field shows the token in plain text; your home's coordinates; your home's public IP (better not to show even the laptop's Wi-Fi IP); private notifications, the Wi-Fi name, email addresses, and the faces or voices of family members who didn't agree to be recorded. Play the video back once from start to end just to look for all of these.
4. **After recording (2 minutes).** Tap **Log out** on the phone, then [switch back to laptop mode](../module-23-realtime-dashboard/README.md#104-switch-back-to-laptop-mode-5-minutes): `HOST=127.0.0.1`, the laptop's IP removed from `CORS_ORIGIN`, and Vite: **Ctrl + C**, then `npm run dev`. Turn off **Do Not Disturb**.

Upload the video as an **unlisted video** (only people with the link can watch it), or keep it in your private storage. The video file must not go into Git; noting its link is enough.

> [!NOTE]
> The author didn't record this video because there's no phone in the author's lab, so this step has no **Expected output** box. Don't have Node 2, Telegram, or a real phone yet? Record the parts you do have, then write honestly in your notes which parts are missing.

#### 10.3 "A Grafana link": JSON on GitHub, a screenshot, and a note on when to use which (5 minutes)

Your Grafana only opens on the laptop itself, and it can only be opened from the internet over HTTPS in Module 27. So in this module, **"a Grafana link" = a GitHub link to `grafana/dashboards/system-health.json`** exported in [9.2](#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes), plus one screenshot of its dashboard. Grafana's built-in sharing features are deliberately not used: an external snapshot sends your home's data to the internet, and a public dashboard is open without logging in; both were turned off in the `docker run` (1.3).

1. **The link.** Your branch is only pushed to GitHub in ➕ F. As soon as its pull request is merged, open that file on the `main` branch (its address looks like `https://github.com/YOUR-USERNAME/mini-smart-home/blob/main/grafana/dashboards/system-health.json`), then copy its address to the evidence sheet.
2. **The screenshot.** Open `System Health` with `Node` **All** and a range that holds data, for example **Last 6 hours**, then capture only the dashboard area with your laptop's built-in screenshot tool (roughly like the picture at the end of 3.2). Check it first: no other tabs, bookmarks, or account email. Keep it for ➕ G.
3. **The "when to use which" note.** Rewrite the table of [Concept 1](#1-two-dashboards-two-audiences-three-tools-you-already-have) in your own words, one row each for Node-RED, the React dashboard, and Grafana: who it's for, the one question from your home that it answers best, one weakness, and when **not** to use it. You may add your answers to the seven questions of [Concept 11](#11-buy-or-build-ready-made-iot-platforms). The gist: the React dashboard for the residents, Grafana for the technical team, Node-RED for trying out ideas quickly.

#### 10.4 ⭐ The final dress rehearsal: backend tests, the frontend build, and the three pass requirements (20 minutes)

Before the pull request, make sure every part still works together. The `backend` and Vite terminals may keep running; the checks run in the free terminal.

1. **The backend.** In the `backend` folder, run `npm run check`, `npm test`, then `npm audit`. **Expected output (the author's lab, trimmed; the backend running in the other terminal isn't restarted):**

   ```text
   > mini-smart-home-backend@1.2.0 check
   > tsc --noEmit

   …
    Test Files  14 passed (14)
         Tests  96 passed (96)
   …
   found 0 vulnerabilities
   ```

   The result of `npm audit` depends on the date; any findings? `npm audit fix` (not `--force`), `npm test` again, then commit `package-lock.json`.
2. **The dashboard.** `cd ../frontend`, then `npm run lint`, `npm run build`, and `npm run check-schema`. The yardstick is the same as in [7.5](#75-dashboard-110-lint-build-check-schema-and-preview-10-minutes): `Found 0 warnings and 0 errors.`, a build that passes with **one** 500 kB size warning, and two `SAME` lines. The `dist/` folder made by the build doesn't go into Git.
3. **The three pass requirements.** Compare your notes with this table, then tick them in [✅](#-module-25-completion-checklist):

   | Requirement | Its evidence in your notes |
   | :-: | :-- |
   | G1 | the message `🔴 Notification test` from your bot ([4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes)) |
   | G2 | the G2 timing sheet: Grafana's 🔴 5.5–11.5 minutes after Node 2's battery is pulled out (laptop path: `garden pull`), then ✅ after it's put back ([5.3](#53--work-out-the-estimate-wait-for-grafanas-message-then-compare-it-with-the-backends-15-minutes), [5.4](#54--put-it-back-two-recovery-messages-and-the-timing-sheet-10-minutes)) |
   | G3 | the schedule time, the line `daily report running on schedule`, and the time the file `report-….csv` arrived without being touched ([9.1](#91--a-hands-off-dress-rehearsal-a-schedule-3-minutes-ahead-then-back-to-0700-15-minutes)) |

4. **The final state.** `backend/.env` holds `REPORT_SCHEDULE=0 7 * * *` and `HOST=127.0.0.1`, the battery of Node 2 or the Garden is in, and the `Silent node` rule in **Alerting → Alert rules** is `Normal`.

**You pass this ⭐ step** when the backend passes `npm run check`, 14 / 96, and `npm audit`, the dashboard passes lint, the build (one warning), and `check-schema`, and G1–G3 are ticked with evidence from your own bot. The author proved G1–G3 with a mock Telegram server and the mock Garden; tick only what really happened to you.

> 🎉 **Phase 4 checkpoint — a home that is watched over and reports by itself.** Module 22 gave the Mini Smart Home a **face**, Module 23 made it **alive** (live numbers, charts, history, the phone), Module 24 made it **take commands** (controls, rules, roles, tried by someone else), and this week your home is **watched over and reported on**: Grafana for the technical team, alerts when a node goes silent, a device map, and a daily report that arrives by itself. The backend is now 1.2.0 and the dashboard 1.1.0. Its brain is still on the laptop, so Grafana, the alerts, and the reports only work while your laptop is on; Phase 5 moves them to a server that is always on, starting with Docker Compose in Module 26. Evidence that hasn't happened yet (the tester, the video, a real bot) may follow later: the checkpoint is closed when its evidence sheet is full.

**Grafana from a phone (optional).** The Syllabus lists Grafana and the map among the results of Phase 4 on a phone. The map already follows your dashboard's phone mode (10.2), while Grafana is deliberately only on `127.0.0.1:3000` ([1.3](#13-grafanas-door-401-without-logging-in-only-from-this-laptop-no-sharing-outside-5-minutes)). The counter of a container that is already running can't be changed, so the container is made again for a while with the same cupboard ([Concept 2](#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway)). In the free terminal, run `docker rm -f smarthome-grafana`, then the command of [Quick Win Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes) with `-p 3000:3000`:

```text
docker run -d --name smarthome-grafana --network smarthome -p 3000:3000 -e GF_PLUGINS_PREINSTALL_DISABLED=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_SNAPSHOTS_EXTERNAL_ENABLED=false -e GF_PUBLIC_DASHBOARDS_ENABLED=false -v smarthome-grafana-data:/var/lib/grafana --restart unless-stopped grafana/grafana:13.2.4
```

On the phone (on the same home Wi-Fi), open `http://<laptop-IP>:3000` and log in as `admin`. Windows may ask for firewall permission: allow only **Private** networks (not tested by the author). Grafana is still plain `http://`, so your password crosses the Wi-Fi unencrypted. When you're done looking, run `docker rm -f smarthome-grafana` again, then the Quick Win Step 2 command **exactly**, until `docker ps` writes `127.0.0.1:3000->3000/tcp` again.

**Result (the author's lab; not a phone, but a second browser through the lab machine's LAN IP):** `docker ps` shows in the PORTS column `0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp`; the second browser logged in with the same password and saw the five panels of `System Health`, the rule `Silent node`, and the contact point `Telegram Smart Home`. The same cupboard, the same content: preparation for Module 26, when Grafana moves to Docker Compose. After going back, `curl` to `http://192.168.1.10:3000` is refused again (`Could not connect to server`).

> ⬆️ **Done with Practice 10?** Continue to [➕ Add-on](#-add-on-to-mini-smart-home); the [🧩 Challenges](#-independent-challenges) can be done after that, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title that looks like your problem. Docker and the database basics are in Module 17's 🚨, the Telegram bot in Module 19's 🚨, the broker and the ACL in Module 21's 🚨, the React dashboard in the 🚨 of Modules 22–24. First glance at `docker ps` (the STATUS and PORTS columns), the `backend` and broker terminals, the Query inspector, and the rule's **Instances** and **History** tabs. Still stuck? Compare your files with [`code/stages/`](code/stages/) at the end of the same practice, and your dashboard or rule with [`code/grafana/`](code/grafana/).

<details>
<summary><b>Old instructions → what's right for our versions (Grafana 13.2.4, leaflet 1.9.4, react-leaflet 5.0.0, node-cron 4.6.0)</b></summary>

| Old instructions | What's right for our versions | Why |
| :--- | :--- | :--- |
| `grafana/grafana-oss`, or an image without a tag | `grafana/grafana:13.2.4` | `grafana-oss` stopped at 13.0.2 (June 2026); without a tag, the menus may differ |
| `grafana-cli …`, `grafana-server` | `grafana cli …`, `grafana server` | The old commands were removed in Grafana 13 |
| Notification channel (old-style alerts) | A contact point + a rule in **Alerting** | The old way no longer exists |
| The "Alerts & IRM" menu | **Alerting** in the left menu | The 13.2.4 menu name |
| Testing a contact point through an old API endpoint | The **Test** button | The old endpoint answers `410` |
| The "Add visualization" button | **Add** → **Panel** → **Configure visualization** | The 13.2.4 button names |
| Host `localhost:5432` or `host.docker.internal` | `smarthome-db:5432` through the hallway | `localhost` in a container = that container itself |
| Tiles `http://{s}.tile.openstreetmap.org/…` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | The official address of the OSM tile policy |
| `react@rc`, `react-leaflet@next` | `leaflet@1.9.4 react-leaflet@5.0.0` + `-D @types/leaflet@1.9.22` | `@next` installs an old test version |
| A `Marker` icon + the `mergeOptions` recipe | `CircleMarker` | The icon goes missing after the build, and the recipe breaks dev mode |
| `new InputFile("CSV content…")` | `new InputFile(Buffer.from(content, "utf8"), name)` | The text is taken for a file path |
| A 6-field cron `0 7 * * * *` | 5 fields `0 7 * * *` | Its first field is seconds: minute 7 of every hour |
| "Import the alert rule YAML" | Make it again on the screen (4.3); the YAML = an archive | **Import alert rules** only takes the Prometheus format |

</details>

**Grafana and Docker**

<details>
<summary><b>The Grafana <code>docker run</code> fails because the <code>smarthome</code> network doesn't exist yet</b></summary>

Run both commands of [Quick Win Step 1](#step-1--the-smarthome-hallway-between-containers-just-once-2-minutes) (`docker network create smarthome`, then `docker network connect smarthome smarthome-db`), then repeat the `docker run` of [Quick Win Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes). Refused because the name `smarthome-grafana` is already in use? A leftover container is there: `docker rm -f smarthome-grafana`, then `docker run` again. Its cupboard isn't deleted with it.

</details>

<details>
<summary><b>Port 3000 is already in use, for example by <code>tools/webhook-receiver.js</code></b></summary>

**Symptom** (the author's lab, Docker Engine): Grafana's `docker run` or `docker start` stops with `… failed to bind host port 127.0.0.1:3000/tcp: address already in use`; the other way round (Grafana already running), `node webhook-receiver.js` (Module 4) answers `Error: listen EADDRINUSE: address already in use :::3000`.

**Steps:** **Ctrl + C** in the webhook-receiver terminal. Then `docker ps`: if the Grafana row is missing or has no `127.0.0.1:3000->3000/tcp`, run `docker rm -f smarthome-grafana` and the Quick Win Step 2 `docker run` exactly. Don't use `docker start`: in the author's lab, after that failed start the container ran **without its counter and its hallway** (PORTS empty, the alert rule `Error`), and `docker restart` didn't help. Its content is safe in the cupboard. Docker Desktop wasn't tested.

</details>

<details>
<summary><b>You forgot the Grafana admin password, or already pressed Skip</b></summary>

After **Skip**, the password `admin` stays valid. Change it from the terminal, with a temporary password (letters and digits) in place of `YourNewPassword`:

```text
docker exec -it smarthome-grafana grafana cli admin reset-admin-password YourNewPassword
```

**Result (the author's code test lab):** the log ends with `Admin password changed successfully ✔`; the old password is refused, the new one accepted. That password is in your terminal history: log in, then change it under the avatar → **Change password**.

</details>

**The data source, the `grafana_reader` account, and panels**

<details>
<summary><b>Save & test fails: <code>lookup smarthome-db on 127.0.0.11:53: server misbehaving</code>, or the Host URL is still <code>localhost:5432</code></b></summary>

- `Network error: Failed to connect to the server. Error message: lookup smarthome-db on 127.0.0.11:53: server misbehaving` (the author's lab: the database not running yet). `docker ps` must show `smarthome-db` as `Up`; if not, `docker start smarthome-db`, and Grafana recovers by itself. `docker network inspect smarthome` must list both; if not, repeat the `docker network connect` of Quick Win Step 1.
- `… Error message: connect: connection refused` (**Host URL** `localhost:5432`) or `… no such host` (`host.docker.internal:5432`, Docker Engine on Linux): change it to `smarthome-db:5432` ([Concept 2](#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway)).
- Anything else: compare with [Quick Win Step 5](#step-5--a-postgresql-data-source-through-the-hallway-smarthome-db5432-5-minutes) (**Username**, the password, **TLS/SSL Mode** `disable`).

</details>

<details>
<summary><b><code>too many connections for role "grafana_reader"</code>, then the panels show <code>No data</code></b></summary>

This account may have 5 connections, while the default data source goes up to 100 (the author's code test lab: three tabs at once, 4 errors out of 180 queries; with **Max open** `4`, zero). Set **Max open** to `4` ([1.5](#15-the-mini-smart-home-folder-and-grafanas-screen-language-3-minutes)) and close any `grafana_reader` psql that is still open (`\q`). The first **Save & test** after that may still fail; click it again until `Database Connection OK`. Two Grafanas with the same account can still go over the limit.

</details>

<details>
<summary><b><code>ERROR:  role "grafana_reader" already exists</code> or <code>permission denied for table devices</code></b></summary>

**`ERROR:  role "grafana_reader" already exists`** when `grafana-user.sql` is run again: normal. The lines after it still run (`ALTER ROLE` ×2, `GRANT` ×4), and its password doesn't change; change the password with `\password grafana_reader` ([Quick Win Step 4](#step-4--the-read-only-database-account-grafana_reader-6-minutes)).

**`db query error: ERROR: permission denied for table devices (SQLSTATE 42501)`** (the author's lab, `SELECT * FROM devices`): the permissions on `devices` are per column, and `key_hash` is deliberately closed. Write the column names ([Concept 3](#3-the-smallest-possible-rights-grafana-may-only-read)). `users`, `sessions`, and `rules` are closed on purpose; `readings` or `device_health` refused = the `GRANT` hasn't run yet, so run the file again.

</details>

<details>
<summary><b>The RSSI, uptime, or heap panel says <code>No data</code></b></summary>

Check in order ([2.5](#25-no-data-and-shifted-clocks-vitals-every-5-minutes-utc-in-the-query-wib-on-the-screen-5-minutes)): (1) the simulator or Node 1 **and** the backend are running, then wait up to 5 minutes; (2) `Node` holds a device that sends `vitals`, not only the Garden or Node 2 (after the first save, `Node` can go back to the first value: choose `All` and remove the other chips (×), then **Save** with **Update default variable values**); (3) the time range covers the time the device was on. An error icon in the corner of the panel = a query error.

</details>

<details>
<summary><b>A strange temperature chart: one <code>temperature</code> line jumping between devices, or dropping to 0 °C</b></summary>

**One line jumping:** **Format** is still `Table`; change it to **Time series**, and make sure the query holds `device_id AS metric` ([Quick Win Step 6](#step-6--the-first-panel-a-temperature-query-with-format-time-series-then-save-6-minutes)). **Dropping to 0 °C:** the macro `$__timeGroupAlias(ts, $__interval, 0)` fills every minute without a reading with 0. In the author's lab, 331 of 361 points became 0 and the chart was jagged. Remove the `, 0`: the gaps are left empty, honestly ([Concept 4](#4-anatomy-of-a-panel-sql-time-macros-units-and-thresholds)).

</details>

<details>
<summary><b>A Stat number is red although it's normal</b></summary>

The panel's default thresholds: green, then **red at 80**. Uptime in seconds is almost always above 80, so the Stat is red even when healthy. Change **Color scheme** to `Single color` ([2.3](#23-the-uptime-and-heap-panels-the-red-at-80-stat-trap-duration-and-byte-units-13-minutes)).

</details>

<details>
<summary><b>The times in the chart or in the Query inspector are shifted by 7 hours</b></summary>

The Query inspector **does** write UTC (`BETWEEN '…Z' AND '…Z'`), 7 hours earlier than WIB: that's correct. The only wrong thing is a **chart axis** that differs from your laptop's clock by 7 hours: **Edit** → the **Options** icon → **View all settings** → **Time zone** `Jakarta  WIB  UTC+07:00`, then **Save** ([2.1](#21-a-new-dashboard-the-folder-the-wib-time-zone-and-the-node-variable-10-minutes)). Don't shift the time in the SQL; the macros already take care of it.

</details>

<details>
<summary><b>A panel shows an error or goes empty as soon as its query uses <code>$node</code></b></summary>

**Symptom** (the author's lab, `h.device_id = $node` with `Node` = `All`):

```text
db query error: ERROR: syntax error at or near "," (SQLSTATE 42601)
```

A comma-separated list is only valid inside `IN (…)`: write `IN ($node)`, without extra quotes ([Concept 5](#5-variables-one-dashboard-for-every-device)). The variable must be **Multi-value** and **Include All value**, and the Query inspector must write `IN ('…')` holding `device_id` values.

</details>

<details>
<summary><b>The 1-minute refresh is gone again after the dashboard is reopened</b></summary>

`1m` only becomes the default when **Update default refresh value** is ticked at **Save** ([2.4](#24--save-with-a-1-minute-refresh-test-node-then-peek-into-the-query-inspector-10-minutes)). Choose `1m` again, save with that box ticked, then open it in a new tab.

</details>

<details>
<summary><b>Importing a dashboard: <code>A Grafana dashboard URL or ID is required</code>, <code>A data source is required</code>, or an <code>Import (Overwrite)</code> button</b></summary>

**`A Grafana dashboard URL or ID is required`:** you pressed the first **Load**; paste the JSON into **Import via dashboard JSON model**, then press the second **Load**. **`A data source is required`:** choose a data source under `DS_GRAFANA-POSTGRESQL-DATASOURCE`. **`Import (Overwrite)`** (`… has the same UID` or `A dashboard or a folder with the same name already exists`) **overwrites** the existing dashboard: click **Change uid**, change **Name**, and only then **Import** ([9.3](#93-try-importing-into-the-same-grafana-change-uid-first-optional-8-minutes)).

</details>

**Alerts and Telegram**

<details>
<summary><b>The alert never fires, or always comes a minute later than estimated</b></summary>

Open the `Silent node` rule, the **Instances** tab. **Your node isn't there:** it isn't registered, or its key was revoked. **`Firing`, but Telegram is silent:** the rule's **Contact point** isn't `Telegram Smart Home` yet, or the contact point fails (*The Test button fails …*). **`Error`:** compare its query with [4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes). **About 1 minute later than the formula:** **Pending period** is still `1m`; change it to **None** (also check no data → **Normal**, 4.3). An "empty when there's no data" query from the internet fails silently (Concept 7).

</details>

<details>
<summary><b>🔴 for a device you don't run anyway, or a false ✅ after its key is revoked</b></summary>

**Symptom** (the author's code test lab): less than a minute after the rule was saved, `🔴 Practice porch (f00d00000002) is not sending data, 12.5 minutes behind schedule`; after its key was revoked, `✅ Practice porch is sending data again.`, and the **History** tab writes `Normal (Missingseries)`. Every registered device is checked, and a row that disappears counts as recovered. That 🔴 is right. Not using the device any more? Revoke its key ([4.2](#42-first-revoke-the-keys-of-the-devices-you-dont-run-5-minutes)) and ignore that one ✅; on the laptop path, don't revoke `f00d00000001`.

</details>

<details>
<summary><b>Every node 🔴 at once, or a <code>🔴 [no value] ([no value]) …</code> message and then a false ✅</b></summary>

**Every node 🔴** (the author's lab, the backend frozen for 18 minutes): `🔴 Practice living room (f00d00000001) is not sending data, 5.5 minutes behind schedule`, then the Garden, while the Map stayed green. The one that's silent is the **backend**: without it, there are no new readings. Start `npm run dev`; ✅ follows. Watching over the backend = Module 30.

**No node name** (the author's lab, `smarthome-db` stopped for about 80 seconds): `🔴 [no value] ([no value]) is not sending data,  minutes behind schedule`, then 5 minutes later `✅  is sending data again.` Grafana couldn't read the database; that ✅ means it can read again, **not** that a node recovered (a node that is 🔴 stays 🔴; a longer outage wasn't tested). `docker start smarthome-db`.

</details>

<details>
<summary><b>Two messages for one event: 📴 from the backend and 🔴 from Grafana</b></summary>

Deliberate ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)). The backend tells the **residents** that the connection is lost: `📴 … offline since …` 60 seconds after the `offline` status (Node 2: about 17 minutes after its last packet), then `✅ … back online …` at once. Grafana tells the **technical team** that data stopped arriving: 🔴 5.5–11.5 minutes after Node 2 is pulled, ✅ within ≤ 5 minutes. Don't turn either of them off: a device can be `online` but silent.

</details>

<details>
<summary><b>Grafana sends its long default message, with <code>**Firing**</code> in it</b></summary>

That's the default template (the author's research: `**Firing**`, `Labels: …`, a `localhost:3000` link). The 4.1 template isn't used yet: **Enter custom message** wasn't chosen, or the `Edit Message` drawer was closed without **Save**. Open the `Telegram Smart Home` contact point again, repeat items 5–6 of [4.1](#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes), **Save contact point**, then **Test**: it must be `🔴 Notification test`.

</details>

<details>
<summary><b>The Test button fails: a wrong token or chat_id, or you never said hello to the bot</b></summary>

According to the documentation (not tested by the author), a wrong token is answered with `Unauthorized`, and a chat that never said hello to the bot with `chat not found`. **Steps:** (1) send `/start` to the bot: an answer `Hello! Your chat_id: …` = the token in `backend/.env` is right, and the number must be the same as `TELEGRAM_CHAT_ID` (Module 19's 🚨); (2) in the contact point, click **Reset** on the token, then paste it again without spaces or quotes, and the **Chat ID** too; (3) Grafana needs the internet. Don't take a screenshot of the form.

</details>

<details>
<summary><b>Grafana keeps crashing after the rule YAML is put in the provisioning folder: <code>receiver Telegram Smart Home does not exist</code></b></summary>

**Symptom** (the author's lab, a second Grafana): the container keeps restarting, and `docker logs smarthome-grafana` holds `… invalid alert rule` / `receiver Telegram Smart Home does not exist`. The exported YAML (9.2) is an archive; provisioning demands a contact point with the same name and a matching `datasourceUid` (Module 26). **Steps:** `docker rm -f smarthome-grafana`, then the Quick Win Step 2 `docker run` exactly: your copied file disappears together with the container, and the cupboard's content stays.

</details>

**The Garden and the broker**

<details>
<summary><b>A false 📴 a minute after the broker is restarted in 5.1, then the backend stays silent when the simulator is really stopped</b></summary>

A shortcoming of backend **1.1**: the simulator connects before the backend, its `online` message arrives as a retained message, and the waiting 📴 isn't cancelled. **Steps:** **Ctrl + C** in the `backend` terminal, then `npm run dev` ([5.1](#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes) step 4); ignore that 📴. The Garden isn't affected (it has no will), so G2 still counts. Fixed in [6.3](#63-mqttts-no-longer-sends-a-false-offline-message-then-npm-run-check-and-npm-test-10-minutes).

</details>

<details>
<summary><b>The mock Garden isn't heard by the backend or by Grafana</b></summary>

Read the `tools` terminal. `The mock Garden isn't running yet: type "garden start" first.`: type that. `The mock Garden needs the fake device f00d00000001 …`: fill in its key in `tools/.env`, and run the simulator with the number `1`. `the Garden woke up …` shows, but table 3.2 has no Garden: the broker writes `Denied PUBLISH from f00d00000001 …` when block 2b isn't open yet or the broker was only reloaded; open it, **restart** the broker, restart the backend, and wait ≤ 300 seconds. Still empty: the Garden isn't registered yet (the Bruno request `register mock Garden`), or the key of `f00d00000001` was revoked by mistake ([a new key, Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#74-the-board-turns-up-restore-it-with-a-new-key-12-minutes)).

</details>

**The map and locations**

<details>
<summary><b>A gray map, a map 0 px tall, or markers gone after <code>npm run build</code></b></summary>

**Can't be seen:** `MapContainer` without `h-96`. **Scattered tiles, zoom buttons without a shape:** `import "leaflet/dist/leaflet.css"` is missing. **A gray box, the circles still there:** the tiles aren't downloaded (no internet, or a wrong address in `map.ts`). **Markers gone after the build:** you used `Marker`; use `CircleMarker` ([7.2](#72-mapts-and-devicemaptsx-tiles-attribution-and-markers-colored-by-status-22-minutes)).

</details>

<details>
<summary><b>The map covers the toasts</b></summary>

Leaflet's layers have a z-index of 400–1000, above the toasts (`z-50`). The `isolate` class on `MapContainer` keeps them inside the map box (7.2).

</details>

<details>
<summary><b><code>The backend doesn't send map points (lat, lng) yet. The Map page needs backend 1.2 (Module 25).</code></b></summary>

`GET /devices` without `lat`/`lng`: the backend that answers is still 1.1. Finish Practice 6, restart the `backend` terminal, make sure `/docs` says `1.2.0`, then open **Map** again.

</details>

<details>
<summary><b>A point on the map doesn't change, or the toast <code>Couldn't reload the device list …</code></b></summary>

Points don't follow the live messages; the Map reads `GET /devices` every time it's opened ([Concept 9](#9-a-location-is-device-data-an-api-not-something-stuck-on-the-screen)). Switch to another menu, then come back to **Map**. The toast `Couldn't reload the device list: the map points may not be the latest.` = that read failed (the backend or the database is down); the map still draws the last points.

</details>

<details>
<summary><b><code>PUT /devices/:id/location</code> answers <code>400</code>, <code>403</code>, or <code>404</code></b></summary>

The author's lab: `body/lat must be a number with a decimal point, for example -6.1754 (not the text "-6,1754")` (`"-6,2"` in quotes); `Body is not valid JSON but content-type is set to 'application/json'` (`-6,2` without quotes); `body/lat latitude at most 90` (out of range, or `lat`/`lng` swapped); `403` for a viewer and `401` for an expired wristband: `login admin`; `404` `… isn't in the device list`: the `device_id` in the URL is wrong.

</details>

**Reports**

<details>
<summary><b><code>POST /reports/send</code> answers <code>400</code>, <code>409</code>, <code>502</code>, or <code>503</code></b></summary>

The author's lab: `400` `querystring/day Invalid option: expected one of "yesterday"|"today"` (`?day=` is only `yesterday` or `today`); `409` `report not sent: Telegram off (TELEGRAM_BOT_TOKEN is empty)` (fill in the token and chat_id in `backend/.env`); `502` = Telegram refused it or can't be reached, read the backend log; `503` (the author's test) `the database can't be reached right now, …` (`smarthome-db` is down).

</details>

<details>
<summary><b>The backend won't start: <code>Setting REPORT_SCHEDULE in .env: must have 5 fields …</code></b></summary>

The author's lab (`0 7 * * * *`): `Setting REPORT_SCHEDULE in .env: must have 5 fields: minute hour day month weekday, for example 0 7 * * *`. A 6-field cron starts with seconds: `0 7 * * * *` = minute 7 of every hour. Write 5 fields. `… not a valid cron expression …` = a number out of range (minute `61`).

</details>

<details>
<summary><b>The morning report doesn't arrive, or it has too few devices</b></summary>

Look at the backend log at the scheduled time. Empty: the backend or the laptop was off at that time, and the report isn't sent afterwards. `⏰ The daily report of … was missed (laptop asleep or backend busy?). …` (also to Telegram): missed by > 15 minutes; send it with the Bruno request `send report now` without `?day=today`. `daily report skipped: Telegram off …`: fill in the token. Is `REPORT_SCHEDULE` still at the 9.1 rehearsal time? Set it back to `0 7 * * *`. **Too few devices** (the lab: `2 device(s)`): the ones whose key was revoked aren't included.

</details>

<details>
<summary><b><code>ENOENT</code> or <code>File paths cannot contain carriage-return (\r) or newline (\n) characters!</code> when sending a file</b></summary>

`InputFile` received text, so grammY looks for a file on the disk named after the CSV content ([🔁 Step 5](#step-5--text-becomes-a-file-bufferfrom-a-three-byte-bom-and-enoent)). Write `new InputFile(Buffer.from(content, "utf8"), name)` ([8.3](#83-sendfile-in-telegramts-an-inputfile-from-bytes-not-from-text-8-minutes)).

</details>

<details>
<summary><b>The CSV opens as one column, or numbers turn into dates</b></summary>

The CSV follows Module 23's recipe (commas, a decimal point, a BOM) for spreadsheets with English (US/UK) regional settings. In other regions (for example Indonesian settings, where the list separator is a semicolon), the columns can pile up or numbers change shape: open it through the CSV import with a comma separator ([🚨 Module 23](../module-23-realtime-dashboard/README.md#-troubleshooting) *The CSV opens as one column in Excel …*). The author tested neither Excel nor LibreOffice.

</details>

## 🔬 Technical Deep Dive (optional)

You may skip this: the Syllabus's three optional choices, roads deliberately not taken, and how the author tested. Nothing here has to be installed; the code pieces are **just for reading**.

<details>
<summary><b>A PDF report with pdfkit 0.20.2, and CSV cells that could be read as formulas</b></summary>

The library is **pdfkit 0.20.2** (MIT), with TypeScript types from **@types/pdfkit 0.17.7**. The author's research confirmed: `doc.table({ data })` already exists and is typed; the built-in Helvetica font writes `°` and `—` correctly, but `✓` and emoji become random letters, so a TTF font that holds those characters is needed; the package is about 11 MB, plus `fontkit` at about 5.7 MB. This library writes a PDF as a stream of bytes, so its chunks are collected into one `Buffer`. A sketch (not run by the author in the backend):

```ts
import PDFDocument from "pdfkit";
function makeReportPdf(rows: ReportRow[]): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4" });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((ok) => doc.on("end", () => ok(Buffer.concat(chunks))));
  doc.on("data", (b: Buffer) => chunks.push(b));
  doc.table({ data: [["Device", "Readings"], ...rows.map((r) => [r.name, String(r.reading_count)])] });
  doc.end();
  return done;
}
```

`sendFile()` ([8.3](#83-sendfile-in-telegramts-an-inputfile-from-bytes-not-from-text-8-minutes)) takes text, so a PDF needs a twin that uses `new InputFile(buffer, "report-….pdf")` directly. Pictures of Grafana panels in the PDF aren't attempted: Grafana 13 removed its image renderer plugin, and its replacement service is advised to have at least 16 GiB of RAM.

One note on the CSV: Module 23's recipe has no formula guard, so a device name that starts with `=`, `+`, `-`, or `@` can be read by a spreadsheet as a formula; this risk is accepted because only the admin fills in names.

</details>

<details>
<summary><b>Grafana panels inside the React dashboard (<i>embedding</i>): why not yet</b></summary>

⚠️ **Read this first.** Embedding a Grafana panel in another page almost always means turning off two safeguards: the ban on being framed (`allow_embedding = false`, the cause of `X-Frame-Options: deny` in [1.3](#13-grafanas-door-401-without-logging-in-only-from-this-laptop-no-sharing-outside-5-minutes)) and the ban on entering without an account (anonymous access). With both open, anyone who reaches Grafana's counter sees **every** dashboard without logging in, and other sites can frame your Grafana to trick clicks (clickjacking). Don't try it on your main Grafana.

Without anonymous access, viewers must already be logged in to Grafana in the same browser, with a Grafana account separate from the Module 20 accounts, and the Grafana cookie must go into the frame. When the sites differ (ports don't count), the default `cookie_samesite = lax` holds that cookie back; its replacement, `SameSite=None`, is only accepted by browsers when it's `Secure`, which means HTTPS (Module 27). Not tested by the author yet. The division of work is clear anyway ([Concept 1](#1-two-dashboards-two-audiences-three-tools-you-already-have)): the residents use the React dashboard, the technical team opens Grafana in its own tab.

</details>

<details>
<summary><b>Central logs: Loki 3.7.9, the retired Promtail, and Alloy</b></summary>

Our logs are still scattered: the backend terminal, the broker screen, Grafana's `docker logs`. **Grafana Loki** collects them so they can be searched from Grafana, for example all of last night's backend `ERROR`s next to the RSSI chart. Loki only indexes **labels** (for example the app's name), not the content of every line, so it saves space.

As of 26 Oct 2026: Loki **3.7.9**, an arm64 image of about 43 MB; in the author's research it was ready about 20–40 seconds after starting, using about 36 MiB of RAM while idle. Its log shipper used to be **Promtail**, which has been retired (end of life) since 2 Mar 2026, so tutorials that still install it are outdated; its replacement is **Grafana Alloy** (1.21.2). Using them means two new services for a problem you don't feel yet; the Syllabus puts Loki again as an option in [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data).

</details>

<details>
<summary><b>Dashboards as code: Grafana file <i>provisioning</i></b></summary>

In this module Grafana is assembled on the screen, then exported ([9.2](#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes)). The other direction is called provisioning: every time it starts, Grafana reads YAML files in `/etc/grafana/provisioning/` (its dashboards are Classic JSON) and creates their content by itself. This means something different from device provisioning (Modules 21 and 28). An example data source from the author's research, names adjusted (just for reading):

```yaml
apiVersion: 1
datasources:
  - name: SmartHome
    uid: msh
    type: grafana-postgresql-datasource
    url: smarthome-db:5432
    user: grafana_reader
    editable: false
    jsonData: { database: smarthome, sslmode: disable, timescaledb: true }
    secureJsonData:
      password: ${GRAFANA_READER_PASSWORD}
```

Traps proven in the author's research and lab:

- `${…}` is replaced by the content of a container environment variable, so the password isn't written in the file. Write `${…}` in block style like `password` above: `{ password: ${…} }` inside curly braces breaks the YAML, and a broken data source YAML makes Grafana **fail to start**.
- In contact point settings (for example the Telegram `message`), `$` is replaced too, so `$labels` is written `$$labels`.
- The rule YAML from 9.2 needs a contact point with the same name and a matching `datasourceUid`. In a clean Grafana of the author's lab, it kept crashing with `receiver Telegram Smart Home does not exist` until its container was made again.

The provisioning folder is usually mounted with a bind mount, which this module deliberately avoids because it differs on every OS. Module 26 tidies this up with Docker Compose.

</details>

<details>
<summary><b>Grafana's Geomap versus react-leaflet</b></summary>

Grafana's built-in map panel, **Geomap**, only needs the query `SELECT name, lat, lng, status FROM devices WHERE lat IS NOT NULL AND lng IS NOT NULL AND registered_at IS NOT NULL` (`grafana_reader` may read the `lat`/`lng` columns). In the author's research (a dashboard made through the Grafana 13.2.4 API, not the screen), this panel with the base layer `osm-standard` (OpenStreetMap) loaded without errors.

Its default base layer is a **CARTO vector** map, and CARTO now asks for an API key: its raster tiles without a key only say "API KEY REQUIRED", while its vector tiles still loaded without a key when checked on 26 Oct 2026. If you try Geomap, choose the OpenStreetMap layer so that the rules are the same as in [Concept 8](#8-maps-coordinates-tiles-and-attribution).

The Syllabus chose react-leaflet because this map is for the residents: the Module 20 admin/viewer accounts, colors that follow the live status, and popups linked to the details screen. Geomap only knows the status from its query at every refresh and is only for Grafana accounts, so it suits the technical team. The author hasn't tried it in this module's Grafana.

</details>

<details>
<summary><b>Grafana without Docker: APT, Homebrew, and the Windows zip</b></summary>

Three official ways, summarized from the documentation and the content of the 13.2.4 packages (not tested by the author; APT and brew install the latest version):

- **Debian, Ubuntu, Raspberry Pi OS 64-bit:** the repository `https://apt.grafana.com stable main` with the key `gpg-full.key` (the official Raspberry Pi tutorial still uses the old key), then `sudo apt-get install grafana` and `sudo systemctl enable --now grafana-server`; about 348 MB to download on arm64, about 1.2 GiB installed. Its version goes up with `apt upgrade`, so its menus may differ from this module.
- **macOS:** `brew install grafana`, then `brew services start grafana`.
- **Windows:** the installer from grafana.com/grafana/download, or the zip. The Windows documentation still mentions `grafana-server.exe`, but the 13.2.4 zip only holds `bin\grafana.exe`: run `grafana.exe server`. Counter 3000 may need extra permission.

Grafana 13 removed `grafana-server`/`grafana-cli`; use `grafana server`/`grafana cli` (its systemd service is still called `grafana-server`). The biggest trap: the default `http_addr` is **empty**, which means open to the whole home Wi-Fi, unlike our `-p 127.0.0.1:3000:3000`; set `http_addr = 127.0.0.1` in the `[server]` part of its configuration file. A directly installed Grafana reaches the database through `localhost:5432` without a hallway, but when it moves into a container in Module 26 its data has to move along, which is why this module uses Docker from the start.

</details>

<details>
<summary><b>How the author tested Telegram without a token: a mock for the backend and for Grafana</b></summary>

As in [Module 19's 🔬](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#-technical-deep-dive-optional), the author didn't use a real bot or token. Both message senders were pointed at a **mock Bot API server** in the lab:

- **The backend** through `TELEGRAM_API_ROOT` (since Module 19; deliberately commented out in `.env.example`). This module's mock also accepts `sendDocument`, so the name, size, and BOM of the report file can be checked.
- **Grafana** has no address setting: `https://api.telegram.org/bot…` is hard-coded. So the mock was put in the lab's hallway with the alias (network alias) `api.telegram.org`, which only applies in that hallway. Its HTTPS certificate was issued by a CA (certificate authority) made in the lab, and the lab Grafana got two options so that it trusts it: `-e SSL_CERT_FILE=/etc/ssl/lab/bundle-grafana.pem` and `-v …/bundle-grafana.pem:/etc/ssl/lab/bundle-grafana.pem:ro` (the image's CA bundle plus the lab CA).

Those two options are **not** in your command: your Grafana talks to the real Telegram. The token and chat_id in the lab are fake. What's proven: the content and time of every delivery (text, files, `User-Agent: Grafana`, no `parse_mode` when **Parse Mode** is `None`). What's **not**: how messages and emoji look in the app, the `Unauthorized` or `chat not found` answers from the real server, group chats, and G1–G3 with your bot. The details are in [📚 Sources](#-sources--image-credits).

</details>

<details>
<summary><b>Leaflet without a wrapper, and <code>lazy()</code> to split the bundle</b></summary>

**Plain Leaflet.** If react-leaflet's Hippocratic License ([Concept 8](#8-maps-coordinates-tiles-and-attribution)) doesn't suit you, Leaflet 1.9.4 (BSD-2-Clause) can be used directly with Module 23's "subscribe and stop" pattern. A sketch (not run by the author; the imports of `useRef`, `useEffect`, and `MAP` aren't written):

```tsx
import L from "leaflet";
import "leaflet/dist/leaflet.css";
function PlainMap({ points }: { points: { device_id: string; lat: number; lng: number }[] }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const map = L.map(box.current!).setView([-6.1754, 106.8272], MAP.closeZoom);
    L.tileLayer(MAP.tiles, { attribution: MAP.attribution, maxZoom: MAP.maxZoom }).addTo(map);
    for (const p of points) {
      L.circleMarker([p.lat, p.lng], { radius: 10, fillColor: MAP.onlineColor, fillOpacity: 1 })
        .bindPopup(p.device_id).addTo(map);
    }
    return () => { map.remove(); }; // stop; StrictMode runs the effect twice
  }, [points]);
  return <div ref={box} className="isolate h-96" />;
}
```

What this sketch doesn't have yet is what react-leaflet does for you: colors that follow the live status (keep every circle, then call `setStyle` yourself), popups holding React components (`bindPopup` text is read as HTML, so `name` must be made safe by hand), and **Open details →** without reloading the page.

**`lazy()`.** The map adds about 157 kB to the bundle (about 46 kB gzip, [7.5](#75-dashboard-110-lint-build-check-schema-and-preview-10-minutes)). As in the `React.lazy` fold of [Module 24's 🔬](../module-24-control-rules-roles/README.md#-technical-deep-dive-optional), the Map can become a chunk of its own that is only downloaded when `/map` is opened (a sketch, not measured by the author):

```tsx
// App.tsx (Map.tsx already uses export default):
const MapPage = lazy(() => import("./pages/Map"));
// Layout.tsx, where <Outlet /> is:
<Suspense fallback={<p>Loading the screen…</p>}><Outlet /></Suspense>
```

The price is also the same: the Map waits for a download the first time it's opened, and there's one more concept. So dashboard 1.1.0 stays one file with one 500 kB warning.

</details>

<details>
<summary><b>Three extra settings for the thorough: the version check, <code>REVOKE TEMPORARY</code>, and a Time series alert</b></summary>

**1. The version check.** The three `false` settings in [Quick Win Step 2](#step-2--start-grafana-with-one-docker-run-3-minutes) don't turn off Grafana's checks for new Grafana and plugin versions at grafana.com. To turn them off, `docker rm -f smarthome-grafana`, then run the Quick Win Step 2 command with this addition before `-v` (the same cupboard, its content stays):

```text
-e GF_ANALYTICS_CHECK_FOR_UPDATES=false -e GF_ANALYTICS_CHECK_FOR_PLUGIN_UPDATES=false
```

In the author's test container, the log wrote `Config overridden from Environment variable` for both, and the settings became `false`; their effect on network traffic wasn't measured. The news feed and Gravatar stay on.

**2. `REVOKE TEMPORARY`.** The author's code reviewer found that a `grafana_reader` that turns off its read-only layer can make **temporary tables** (`CREATE TEMP TABLE`), because the `TEMPORARY` right belongs to every account (`PUBLIC`) by default. Such a table only lives as long as its connection and doesn't touch the home's data. To close this too (not tested by the author; the backend isn't affected because it uses `postgres`):

```text
docker exec smarthome-db psql -U postgres -d smarthome -c "REVOKE TEMPORARY ON DATABASE smarthome FROM PUBLIC;"
```

To undo it, replace the content inside the quotes with `GRANT TEMPORARY ON DATABASE smarthome TO PUBLIC;`. The 10-second limit is also only the account's default, not a lock: like the read-only layer in [Concept 3](#3-the-smallest-possible-rights-grafana-may-only-read), the account itself can change it in its session (`SET statement_timeout = 0`). So its password stays secret.

**3. A Time series alert as a fallback (not proven).** Grafana's PostgreSQL alert documentation only supports time series queries, yet the `Silent node` rule uses `Table` and runs on 13.2.4. If a later release refuses `Table`, a likely way out: add `now() AS "time",` at the start of the `SELECT` of the same query, then choose **Format** `Time series`; every node should still be one series labeled `device_id` and `node`. Check it first with **Preview** before **Save**.

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** **Chrome** or **Edge** with Grafana (Level 1) or the dashboard at `http://localhost:5173` (Level 2); **VS Code** with the `frontend` terminal (Level 2) or the `backend` terminal (Level 3); the **Telegram** app. Docker, the data path, and backend 1.2 are running.

Do these **after** [➕ F](#f--merge-featuregrafana-maps-reports-into-main-via-the-technical-dashboard--map--daily-report-phase-4-checkpoint-pull-request), each on a new branch from `main` (`git switch main`, `git pull`, `git switch -c feature/<challenge-name>`). The author has tried the keys in the lab (a mock Telegram server).

### Level 1 — A second alert: a weak Wi-Fi signal (a small change, 20 minutes)

Make a rule `Weak Wi-Fi signal` like [4.3](#43--the-silent-node-rule-the-query-a-5-minute-threshold-the-node-health-group-and-two-defaults-to-change-20-minutes), in the existing `node-health` group. The differences: its query is the average `rssi` over the last 15 minutes per node from `device_health` (the `device_id` and `node` columns stay); **Alert condition** **IS BELOW** `-75`, a common convention, not a standard ([Concept 6](#6-reading-device-health-rssi-uptime-heap-and-packets-per-hour)); the **Summary** names the node and its average dBm. To try it, **Edit** the rule, change `-75` to `-50`, **Save**, wait about 1.5 minutes, then set it back to `-75` (the simulator's RSSI: −40 to −79 dBm).

**Expected output (the code test lab, as received by the mock Telegram server):** **Save** with `-50` at 02:35:42 WIB, then at 02:37:05:

```text
🔴 Practice living room (f00d00000001): weak Wi-Fi signal, average -60 dBm over the last 15 minutes
```

After `-75` again (02:38:10), `✅ Practice living room is sending data again.` comes at 02:42:05. That ✅ line of the 4.1 template was written for the Silent node rule; here it means "the signal is back above the limit".

**You pass when:** at `-75` the nodes with a good signal are `Normal` (Node 2, without vitals, isn't included), and at `-50` a 🔴 comes with the node's name and its dBm number.

<details>
<summary><b>Level 1 answer key</b></summary>

The query and the form entries are in [`level-1/`](code/challenges/key/level-1/). Grafana 13.2.4 only exports a whole group ([9.2](#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes)), so the `weak-signal.yaml` there holds both Silent node and Weak Wi-Fi signal; your `silent-node.yaml` will too if you export the group again.

</details>

### Level 2 — Move a device's point right on the Map (fill in the blanks, 45 minutes)

The admin moves a point without Bruno: **Move point** in the marker's popup → click the new spot → check its numbers → save it through `PUT /devices/:id/location`. Add `setDeviceLocation(deviceId, lat, lng)` to `api.ts`; make `components/MovePoint.tsx`, a react-hook-form + Zod form ([Module 24](../module-24-control-rules-roles/README.md#7-a-form-that-checks-itself-react-hook-form-not-usestate-per-field)) inside `<Popup>`, placed **inside** `<MapContainer>`, with the ranges and error sentences of `LocationBody` from [6.2](#62-the-locationbody-schema-and-the-admin-route-put-devicesidlocation-15-minutes); then its button in `DeviceMap.tsx` ([7.2](#72-mapts-and-devicemaptsx-tiles-attribution-and-markers-colored-by-status-22-minutes)), for the admin only (`useAdmin()`). The core lines of `MovePoint.tsx`; fill in every `____`:

```tsx
// PointForm:
resolver: ____(MapPoint),
<input type="number" step="any" inputMode="decimal" {...register(field, { ____: true })} className={BOX} />
// save(content): PUT, then a fresh list
await ____(p.device_id, content.lat, content.lng);
useLiveStore.getState().setDevices(await ____());
// MovePoint: a click on the map = the new spot
useMapEvents({ ____: (e) => setClick(e.latlng) });
```

**You pass when:** a click on the map opens a **Move … here?** box holding its latitude and longitude; latitude `91` → `latitude at most 90` without a `PUT` (the **Network** tab); **Save point** moves the marker with the toast `Point of … moved.`; a viewer has no button; `npm run lint` and `npm run build` pass.

<details>
<summary><b>Level 2 answer key</b></summary>

The blanks: `zodResolver`, `valueAsNumber` (a number field becomes a number, not text), `setDeviceLocation`, `getDevices`, `click`. Its whole files (116 new lines) are in [`level-2/`](code/challenges/key/level-2/).

</details>

### Level 3 — A weekly report every Monday at 07:00 WIB (from scratch, 60–90 minutes)

Every Monday at 07:00 WIB, the backend sends **last week's** report (Monday 00:00 to Monday 00:00 WIB) with the same query, CSV, and `sendFile()` as in [8.2](#82-servicesreportsts-yesterdays-wib-range-one-query-and-a-schedule-18-minutes)–[8.4](#84-report_schedule-the-post-reportssend-route-and-serverts-12-minutes), similar to [Module 19's 🧩](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#level-3--a-daily-report-at-2000-wib-from-scratch):

- `config/env.ts`: `WEEKLY_REPORT_SCHEDULE`, default `0 7 * * 1` (the fifth field = the weekday, 1 = Monday).
- `reports.ts`: its query becomes an exported `getReportRows(from, to)`.
- A new `services/weekly-report.ts`: the day counted from the **WIB** date, the name `weekly-report-YYYY-MM-DD.csv` (the starting Monday), node-cron `timezone: "Asia/Jakarta"`, the range from `context.date`; called by `server.ts`.

**You pass when:** `npm run check` and `npm test` pass, then in a rehearsal like 9.1 (a temporary schedule a few minutes ahead, then back to `0 7 * * 1`) the file `weekly-report-….csv` arrives in Telegram without being touched.

<details>
<summary><b>Level 3 answer key</b></summary>

In [`level-3/`](code/challenges/key/level-3/): `weekly-report.ts` + its test, `reports.ts`, `config/env.ts`, `server.ts`, `.env.example`; `npm test` 15 files / 101 tests. **Expected output (the code test lab, schedule `45 2 * * *`, times in WIB):**

```text
[02:45:00] INFO: weekly report running on schedule
[02:45:00] INFO: Telegram sent: file weekly-report-2026-10-19.csv (365 bytes), 📊 Mini Smart Home weekly report 19 Oct 2026 - 25 Oct 2026: 3 device(s)
```

</details>

## ➕ Add-on to "Mini Smart Home"

This week the Mini Smart Home is **watched over and reports by itself**: backend 1.2.0, dashboard 1.1.0, a new `grafana/` folder, the mock Garden in the simulator, and the `2b)` block in `edge/acl-broker`; the firmware, data contract 1.4, and the database migrations stay the same. The code and the Grafana exports are already committed on `feature/grafana-maps-reports` (not on GitHub yet): A matches them, B–E tidy up the documents, F merges it into `main`, and G saves your notes. About 30 minutes.

![Diagram Mini Smart Home after Module 25: Phase 4 complete; dashed = coming soon. Top: Node 2 Garden v1.0.0, an 18650 battery (G2: pulled out of its holder), ESP-NOW to Node 1 Home v1.6.0 (firmware unchanged, publishes Node 2 status, offline after 960 s; vitals RSSI, uptime, heap); MQTT + key to the Pi gateway 192.168.1.37: locked Mosquitto (acl-broker + the Module 25 laptop-path block, commented) and Node-RED unchanged; the phone (Node-RED, Telegram, phone mode); Telegram (backend 📴/✅, /status, 📊 CSV; Grafana 🔴/✅ silent node alert). Left: broker clients (MQTTX, the contract checker, the simulator + the mock Garden f00d000000b2: garden start, pull, insert); the phone on home Wi-Fi, temporary phone mode (http://192.168.1.10:5173, the Map menu, the checkpoint demo video, Grafana from the phone optional through -p 3000:3000, then put back). Still true after Module 25: Grafana, alerts, reports only while the laptop is on (Modules 26–27); backend down = every node looks silent (Module 30); the alert YAML = an archive (Module 26); the map needs the internet; Telegram tested by the author with a mock server. Laptop: backend v1.2.0 changed (lat, lng in GET /devices + the location route; the daily CSV report: reports.ts, csv.ts, REPORT_SCHEDULE, sendFile(); mqtt.ts: the false 📴 after a broker restart fixed; no migration, no new package, contract 1.4), the new routes in purple GET /devices + lat, lng, PUT /devices/:id/location, POST /reports/send, node-cron: rule schedules (old) + the report at 07:00 WIB; HTTPS to Telegram. Docker, the smarthome hallway: smarthome-grafana (13.2.4, new, 127.0.0.1:3000, the System Health dashboard 5 panels + $node, the Silent node alert to Telegram, the cupboard smarthome-grafana-data) reads as grafana_reader from smarthome-db (no migration, + the read-only account). Bruno /docs 1.2.0 + three new requests. Frontend v1.1 (leaflet 1.9.4, react-leaflet 5.0.0, @types/leaflet 1.9.22; lint clean, build with one 500 kB warning, check-schema two SAME, Lighthouse Accessibility /map 100); the browser also opens Grafana http://localhost:3000; mini screens Details + controls, Rules, Map (new). Bottom, GitHub: branch feature/grafana-maps-reports, the pull request Technical dashboard + map + daily report (Phase 4 checkpoint) with the (Module 25) items; files backend (1.2.0, devices.ts, reports.ts + csv.ts, routes/reports.ts, telegram.ts, env.ts, mqtt.ts, + 7 test files, now 14 files 96 tests, bruno, .env.example), frontend (1.1.0, map.ts, types.ts, DeviceMap.tsx + pages/Map.tsx, App.tsx + Layout.tsx, index.css, README v1.1), grafana/ (README, grafana-user.sql, dashboards/system-health.json, alerting/silent-node.yaml archive), tools, edge/acl-broker, the PR template, the project README. Never in Git: backend/.env, the Grafana and grafana_reader passwords, the contact point content, real home coordinates, node_modules/, dist/, a video that shows a password or token. Right: 🎉 Phase 4 complete, the checkpoint: quizzes, use by someone else (Module 24), phone demo video, a GitHub link to the Grafana JSON. Coming soon: Module 26 Docker Compose (Grafana moves with the same cupboard, YAML provisioning); Module 27 internet, HTTPS, PWA, a live Grafana link; Module 28 the fleet, OTA, provisioning, many devices.](assets/project-diagram-module-25.png)

> 🖥️ **Tools used:** **VS Code** (the `mini-smart-home` folder; G: a second window, the `learn-iot` folder) and a **browser** logged in to GitHub. Stop the backend and Vite (**Ctrl + C**) before F.
>
> ⭐ **Required** — step F: the pull request to `main`.

### A. Match your project: `backend/` 1.2.0, `frontend/` 1.1.0, `grafana/`, `tools/`, and `edge/`

After [Practice 10](#practice-10--the-phase-4-checkpoint-collect-the-evidence-45-minutes), the files in your branch's `backend/`, `frontend/`, `grafana/`, and `tools/` must be the same as the folders of the same name in [`code/`](code/), except the READMEs (C–D), the export differences (9.2), and the content of the Bruno location request (6.4); `edge/acl-broker` only needs the `2b)` block. **Device path**, bring things up to date first: copy `tools/device-simulator.js` and `backend/bruno/register mock Garden.yml` (new) from `code/` with **Copy raw file**, then the `2b)` block from [`code/edge/acl-broker`](code/edge/acl-broker) below item 2 of your `edge/acl-broker`, still commented out (don't change your own item 2). In the free terminal (the `mini-smart-home` folder):

```text
git add tools edge backend/bruno
git commit -m "Module 25 laptop-path files"
```

In that terminal, `cd backend`: `git status` must be clean on `feature/grafana-maps-reports`. Run `npm ls --depth=0`, then `cd ../frontend` and repeat. **Expected output (the author's lab, the first line; your path differs):**

```text
mini-smart-home-backend@1.2.0 /home/you/mini-smart-home/backend
mini-smart-home-frontend@1.1.0 /home/you/mini-smart-home/frontend
```

According to the reference code, the pull request holds **43 files** (24 backend, 10 frontend, 4 grafana, 2 tools, 2 edge, the template).

### B. Reread `grafana/README.md`: how to run it, the read-only account, exports, and limits

You copied this file in [1.1](#11-the-featuregrafana-maps-reports-branch-and-a-grafana-folder-in-your-project-5-minutes). It holds: **How to run it** (the hallway, `docker run`, **Submit** not **Skip**, `grafana_reader`, **Max open** `4`, importing with **Change uid**, YAML = an archive), **Security**, and **Limits** (only while the laptop is on; backend down = every node looks silent; a message without a node name = a database or Grafana problem). Is it the same as [its reference file](code/grafana/README.md)? There's nothing to commit.

### C. Update `backend/README.md`, Bruno, and `/docs` to 1.2.0

Open [`code/backend/README.md`](code/backend/README.md) on GitHub, click **Copy raw file**, then paste it as the whole content of `backend/README.md` and save. What's new: `REPORT_SCHEDULE` in **How to run it**, two routes in the API table, the section **Map and daily report (Module 25)**, **Version 1.2 notes** (with the false 📴 fix), and **Limits of v1.2**: the report only while the backend is on, a missed one isn't sent afterwards, one chat, an empty first-day report (`?day=today`), a restarted broker = one disconnect, and `devices.last_seen` isn't "the last data". The rest was already done in [6.4](#64--version-120-docs-and-the-bruno-request-set-device-location-200-403-400-10-minutes) and [8.4](#84-report_schedule-the-post-reportssend-route-and-serverts-12-minutes): three new Bruno requests, `REPORT_SCHEDULE=0 7 * * *` in `.env.example`, and `/docs` `1.2.0`.

### D. Update `frontend/README.md` to 1.1, then the `tools/` and `edge/` READMEs and the project README

In the same way, replace the whole content of `frontend/README.md`, `tools/README.md`, and `edge/README.md` with the reference READMEs of [`frontend/`](code/frontend/README.md), [`tools/`](code/tools/README.md), and [`edge/`](code/edge/README.md). The frontend README v1.1 holds the 🎉 Phase 4 checkpoint, the `/map` route, the section **The device map (Module 25)** with the **licenses** (Leaflet BSD-2-Clause, react-leaflet Hippocratic License 2.1, which isn't an OSI license), four new items in **Limits of v1.1** (the map needs the internet, points aren't live, markers can't be reached with Tab, light tiles in dark mode), and makes clear that Grafana is **not** part of `frontend/`. The `tools/` README gets the section **The mock Garden (Module 25)**, the `edge/` README an item on the `2b)` block. The [reference project README](../../mini-smart-home/README.md) records backend 1.2.0, frontend 1.1.0, and the new `grafana/` row; your repository's root README may stay as it is.

### E. Add the Module 25 items to the pull request template

Replace the whole content of `.github/pull_request_template.md` at the root of the repository with [the reference template](code/.github/pull_request_template.md): the Module 24 template plus six **(Module 25)** items at the end of the **Security checklist**. In short: no password, token, or chat_id; the data source uses `grafana_reader`, not `postgres`; Grafana only on `127.0.0.1:3000`, the `admin` password changed; the two new routes admin only; the CSV follows Module 23's recipe (commas, decimal points, BOM), and the CSV and screenshots hold no personal data; the map packages at written versions, the OSM attribution visible.

### F. ⭐ Merge `feature/grafana-maps-reports` into `main` via the "Technical dashboard + map + daily report (Phase 4 checkpoint)" pull request

In the free terminal (the `mini-smart-home` folder), `git status` must list exactly five `modified` files: the four READMEs (C–D) and the template (E). Then:

```text
git add backend/README.md frontend/README.md tools/README.md edge/README.md .github/pull_request_template.md
git commit -m "Module 25 docs: READMEs and template items"
git push -u origin feature/grafana-maps-reports
```

1. On GitHub, click **Compare & pull request** (base `main`), title `Technical dashboard + map + daily report (Phase 4 checkpoint)`. Write its changes and the G1–G3 evidence as honestly as your notes (for example `G2 with the mock Garden`), copy the six **(Module 25)** items from the E template file (`main` still has the old one), then **Create pull request**.
2. **Review:** **Files changed** about 43 files, without `.env`, `node_modules/`, `dist/`, a video, a password, token, chat_id, or your home's coordinates (Bruno stores the request's content: `set device location.yml` must hold the example point). Tick what is fulfilled, then **Review changes** → **Comment** → **Submit review**. Something forbidden? Don't merge: coordinates → the example point; a forbidden file → `git rm -r --cached` + its name (a secret: change its value too); commit, push again.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. `git switch main`, `git pull --prune`, `git branch -d feature/grafana-maps-reports`, then start the backend again (the 07:00 report needs a running backend).

**You pass this ⭐ step** when that pull request was reviewed with the **(Module 25)** items and merged, and on your laptop's `main`, `backend/package.json` has version `1.2.0`, `frontend/package.json` `1.1.0`, and `grafana/` holds four files. Tick ➕ F in [✅](#-module-25-completion-checklist).

### G. Save your learning notes and the Phase 4 checkpoint evidence

In the `module-25/` folder of the **`learn-iot`** repository, save the checkpoint evidence sheet, the G2 timing sheet, the dashboard screenshot ([10.3](#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes)), and `notes.md`. The video only as its link, unlisted ([10.2](#102-a-6090-second-phone-demo-video-the-script-and-what-must-not-be-recorded-15-minutes)); no password, token, chat_id, or home coordinates.

```markdown
# Module 25 notes — Watched over and reporting by itself

| What was measured | My number |
| :--- | :--- |
| G1: `🔴 Notification test` from my bot (4.1) | yes / not yet |
| G2: 🔴 … minutes after pulling it out, ✅ after putting it back (5.3–5.4) | … |
| G3: schedule … WIB, the file arrived … WIB (9.1) | … |
| Link to the Grafana JSON on `main` (10.3) | … |

When to use which (10.3): …
```

Commit and push.

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Read-only account** (`grafana_reader`) | Grafana's "reader's card": `SELECT` only, on the allowed tables and columns. Writing is refused by two layers (read-only transactions + permissions); `users`, `sessions`, `rules`, and `key_hash` are closed. |
| **Alert rule** | A query + a condition that Grafana runs by itself at every evaluation (group `node-health`, every `1m`), even when nobody opens the screen. One instance per node: `Alerting` (🔴; the head of the rule says `Firing`) or `Normal` (✅ when resolved). |
| **Threshold** | A number limit: in a panel it colors (by default red from 80, the cause of a false red Stat), in an alert it fires the rule (`IS ABOVE 5`). |
| **`CircleMarker`** and **popup** | A circle marker drawn as SVG without an image file (the `Marker` icon goes missing after the build): green = `online` and its messages accepted, gray = anything else. Popup = the information shown when a circle is clicked. |
| **Contact point** | Where Grafana's messages go: the Module 19 bot + your chat_id, **Parse Mode** `None`, its own 🔴/✅ template; the **Test** button = G1. |
| **Five-field cron** | `minute hour day month weekday`: `0 7 * * *` = 07:00 every day. Six fields (`0 7 * * * *`) mean minute 7 of every hour; `REPORT_SCHEDULE` refuses it. |
| **CSV report** | Module 23's recipe: BOM, separator `,`, decimal point, CRLF; 15 columns, one row per device. |
| **Data source** | Grafana's saved connection to the database: `smarthome-db:5432` through the hallway, the `grafana_reader` account, **TimescaleDB** on. |
| **Silent** versus **the offline status** | Silent = no new reading in `readings` (measured by Grafana). The `offline` status = the official message through the will or Node 1 (used by the backend's 📴, the badge, and the Map). A device can be `online` yet silent; even `last_seen` is moved forward by status messages. |
| **Grafana** | The technical team's dashboards and alerts (OSS 13.2.4): assembled with clicks + SQL, reads the database directly, in the `smarthome-grafana` container. |
| **The mock Garden** | A fake Node 2 `f00d000000b2` whose packets are published by the simulator `f00d00000001` every 300 seconds; `garden pull`/`garden insert` = pulling out/putting back the battery. |
| **Latitude** and **longitude** | `lat` (−90 to 90) and `lng` (−180 to 180), decimals with a **point**; set by the admin through `PUT /devices/:id/location`. |
| **Licenses** AGPLv3, BSL 1.1, Hippocratic 2.1 | In order: Grafana OSS (open source); ThingsBoard since 4.4 (production use limited); react-leaflet (free with human-rights conditions, not a license recognized by the OSI). Leaflet itself is BSD-2-Clause. |
| **The hallway** (Docker network) | `smarthome`: the containers inside it call each other by name, without the laptop's counter; `localhost` in a container = that container itself. Dissected in Module 26. |
| **Macro** | A `$__…` piece that Grafana replaces before the query is sent, for example `$__timeFilter(ts)` → `ts BETWEEN '…Z' AND '…Z'` (UTC); the result shows in the **Query inspector**. |
| **Max open** | The data source's connection limit: `100` by default, ours `4`, below `CONNECTION LIMIT 5`, so that `too many connections for role "grafana_reader"` doesn't appear. |
| **No Data** and **MissingSeries** | A query without rows, and an instance whose row has disappeared (resolved after 2 evaluations: `Normal (Missingseries)`). The `Silent node` query starts from `devices`, so a dead node still has a row; **No Data** is changed to **Normal**. |
| **Notification policy** and grouping | The sending rules we don't edit: group wait `30s`, group interval `5m` (also for ✅), repeat interval `4h`. **Group by** `device_id` gives every node its own message. |
| **Panel** | One dashboard box = one SQL query + one way of drawing. **Format** `Time series` splits the lines per `metric`; `Table` for tables and alerts. |
| **Pending period** | How long a condition must hold before `Firing`: `1m` by default, ours `None`, so 🔴 isn't a minute late and `Pending` never shows. |
| **Grafana provisioning** | Installing data sources, dashboards, and rules from files when Grafana starts (🔬, Module 26). Not device provisioning (Modules 21 and 28); here the rule YAML is only an archive. |
| **Reduce** `Last` | Step B that Grafana builds from `WHEN Last OF QUERY`: each instance's last number before it's compared with the threshold (C). **History**: `A=…, B=…, C=…`; C equal to 1 = firing. |
| **`sendDocument`** and **`InputFile`** | Sending a file through the Bot API: `new InputFile(Buffer.from(content, "utf8"), name)`; `new InputFile("text…")` is read as a file path → `ENOENT`. |
| **Tile** and **attribution** | A 256 × 256 px piece of map from `tile.openstreetmap.org`, downloaded directly by the browser (needs the internet, no bulk downloads), with the required visible credit `© OpenStreetMap contributors`. |
| **Variable** `$node` | The device picker at the top of the dashboard: a **Query** from `devices`, **Multi-value** + **Include All value**, written `IN ($node)`; doesn't work in alerts. |
| **Vitals**: RSSI, uptime, heap | Node 1's health report every 5 minutes to `device_health`: the Wi-Fi signal (dBm; the more negative, the weaker), the time running (a sudden drop = a restart), the free memory (falling all the time = a leak). Node 2 has no vitals: packets per hour (should be 12). |

## 📝 5-Question Quiz

1. Which dashboard fits best (Node-RED, React, or Grafana), and why? (a) your younger sibling wants to turn on the porch lamp from a phone; (b) you suspect Node 1's Wi-Fi signal got worse over the last 7 days; (c) you want to be told when the Garden stops sending, even when nobody opens a screen.
2. The database already has the `postgres` account, but Grafana is given `grafana_reader`. (a) Why? (b) What does a panel with `SELECT * FROM devices` answer, and how do you fix it? (c) Someone pastes `DROP TABLE readings;` into a panel query. What's the answer, and what if they first run `SET default_transaction_read_only = off`?
3. Node 2's last packet arrived at 10:00:00 WIB, then you pulled out its battery at 10:01:00; the backend is running. (a) About when does Grafana's 🔴 arrive, and when does the backend's 📴? (b) Why does the 🔴 message say `5.6 minutes behind schedule`, not more than 10? (c) The battery is put back at 10:20. Which recovery message comes first?
4. A friend suggests an alert "tell me when `last_seen` is more than 5 minutes ago". (a) Besides readings, what moves `last_seen` forward? (b) What was recorded in the author's lab exactly when the Garden's `offline` status was published? (c) The simulator `f00d00000001` is stopped with **Ctrl + C**. What happens to the Garden on the Map, in the backend, and in Grafana?
5. The daily report is scheduled `0 7 * * *`. (a) The laptop sleeps from 06:50 to 07:30. Is the report sent, and what do you receive? (b) How do you get that missed report? (c) If the laptop is opened at 07:10, does the report come, and which day does it hold?

<details>
<summary><b>Answer key</b></summary>

1. (a) **The React dashboard**: it's for the residents, can command according to role, and has a phone mode; Grafana only reads, and only opens on the laptop. (b) **Grafana**: "since when" is a technical team question; the RSSI panel with **Last 7 days**, without new code. (c) **A Grafana alert**: it checks by itself every minute and sends to Telegram; a React toast only shows on an open screen ([Concept 1](#1-two-dashboards-two-audiences-three-tools-you-already-have)).
2. (a) `postgres` may read the password hashes, the session token hashes, and the device key hashes, and may also `DROP TABLE`, while Grafana runs panel queries as they are, without checking them. (b) `permission denied for table devices`: the permissions on `devices` are given per column, without `key_hash`. Write the column names. (c) `cannot execute DROP TABLE in a read-only transaction` (layer 1). That account can turn layer 1 off for its session, but layer 2 (the permissions) still refuses; the author's research: `must be owner of table readings` ([Concept 3](#3-the-smallest-possible-rights-grafana-may-only-read)).
3. (a) 🔴 = last packet + 10 minutes (schedule 5 + threshold 5) + 0–60 seconds of evaluation + 30 seconds of group wait = **10:10:30–10:11:30 WIB** (9.5–10.5 minutes after the pull). 📴 = the `offline` status from Node 1 after 960 seconds without a packet (10:16:00) + the backend's 60-second wait = **about 10:17 WIB**. (b) The number is the minutes since the last packet **minus 5**, Node 2's normal pause between its packets; the first evaluation over the threshold writes a number a little above 5 (in the author's lab `5.4`–`5.8`). (c) The backend's ✅, at once when Node 2 is `online` again; Grafana's ✅ waits for the group interval tick, at most about 5 minutes ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)).
4. (a) Every message of that device: its status, its will, and the retained status received again when the backend restarts. (b) `minutes_late` `11`, but `minutes_since_last_seen` `0`: that `offline` message itself moves `last_seen` forward, so your friend's query thinks the Garden has just spoken. (c) The Garden goes silent too (its linking device is dead), but its status stays `online` because nobody publishes it: the Map stays green, without a 📴. Grafana still sends 🔴 about 11 minutes after its last packet, because it measures `readings.received_at` ([Concept 7](#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline)).
5. (a) **No**: a schedule missed by more than 15 minutes isn't sent afterwards. The backend only writes a log and sends `⏰ The daily report of … was missed (laptop asleep or backend busy?). Send it now with POST /reports/send` (in the author's lab: the backend frozen for 18 minutes). (b) The Bruno request `send report now` **without** `?day=today`. (c) It comes, because it's still within 15 minutes, and it holds yesterday: "yesterday" is counted from the **scheduled** time, not from the time the function runs ([Concept 10](#10-the-daily-report-it-arrives-by-itself-every-morning-as-long-as-the-backend-is-running)).

</details>

---

## ✅ Module 25 Completion Checklist

The pass requirement from the Syllabus: **Grafana sends a Telegram alert when you pull out Node 2's battery, and the daily report arrives automatically.** **Laptop path:** "Grafana sends a Telegram alert when the **mock Garden** stops (`garden pull`), and the daily report arrives automatically"; every item may be ticked with the simulator and the mock Garden.

> [!NOTE]
> **The author hasn't tested with a real bot, a Node 2 with an 18650 battery, a phone, Excel, or Docker Desktop.** The author proved G1–G3 with a mock Telegram server and the mock Garden on a Raspberry Pi with Linux ([📚](#-sources--image-credits)). Tick only what has happened to you (G1–G3 with your own bot); write "not yet" for the rest in your notes and your pull request.

- [ ] **G1** The **Test** button of the `Telegram Smart Home` contact point → `🔴 Notification test` arrives from your bot (Practice 4).
- [ ] **G2** Node 2's battery pulled out of its holder (laptop path: `garden pull`) → `🔴 … is not sending data, … minutes behind schedule` within 5.5–11.5 minutes; put back (`garden insert`) → `✅ … is sending data again.` (Practice 5).
- [ ] **G3** Without being touched, at the minute of my schedule: `daily report running on schedule`, then `report-YYYY-MM-DD.csv` arrives from your bot (Practice 9).
- [ ] The warm-up queries in psql and `node warmup.js` match **Expected output** and the "Self-test answer key" (🔁).
- [ ] The Grafana admin password is changed (**Submit**), the data source says `Database Connection OK` as `grafana_reader`, and `First panel` has a temperature line per device (Quick Win).
- [ ] ⭐ `docker ps`: `127.0.0.1:3000->3000/tcp`, the API without logging in → `401`, no **Share externally**; `grafana_reader` reads columns, but `SELECT *` from `devices`, the `users` and `sessions` tables, `INSERT`, and `DROP TABLE` are refused (Practice 1).
- [ ] ⭐ The `System Health` dashboard: the WIB time zone, refresh `1m`, `Node` = `All`, RSSI in `dbm`, Uptime without a false red; the Query inspector writes `BETWEEN '…Z'` and `IN ('…')` (Practice 2).
- [ ] ⭐ Five panels saved with the message `Practice 3: …`, including `Node 2 packets per hour (should be 12)` and `Minutes behind schedule`, whose query is the same as the alert query (Practice 3).
- [ ] ⭐ The keys of devices that aren't running are revoked first; `Silent node` in the `node-health` group (`1m`, **Pending period** `None`, no data → **Normal**, **Group by** `device_id`) is `Normal` (Practice 4).
- [ ] ⭐ The Garden is heard (laptop path: the Module 25 simulator, ACL 2b, restarting the broker and then the backend, `register mock Garden`); the G2 timing sheet is filled in; the **History** tab writes `Alerting` then `Normal` (Practice 5).
- [ ] ⭐ `npm test` 9 / 71, `/docs` 1.2.0, the Bruno request `set device location` → `200` (admin), `403` (viewer), `400` (`"-6,2"`); every device has a fictional point (Practice 6).
- [ ] ⭐ The **Map** for admin and viewer: the attribution visible, the simulator's marker turns gray by itself when it's stopped, tidy at 375 px and in dark mode (Practice 7).
- [ ] ⭐ `npm test` 14 / 96; `send report now` → `200` and its file arrives, viewer `403`; the CSV opens in separate columns (Practice 8).
- [ ] ⭐ `grafana/dashboards/system-health.json` (Classic) and `grafana/alerting/silent-node.yaml` (archive) are in the branch without a token, password, or chat_id (Practice 9).
- [ ] ⭐ The final dress rehearsal passes (backend: `npm run check`, `npm test`, `npm audit`; dashboard: `lint`, `build` with one warning, `check-schema`), and G1–G3 are ticked with their evidence (Practice 10).
- [ ] `backend/` 1.2.0, `frontend/` 1.1.0, `grafana/`, `tools/`, and `edge/` match; the READMEs and the pull request template are updated; the notes and the checkpoint evidence are in `learn-iot/module-25/` (➕ A–E, G).
- [ ] ⭐ The pull request "Technical dashboard + map + daily report (Phase 4 checkpoint)" is merged into `main`, without a password, token, chat_id, or home coordinates in **Files changed** (➕ F).

> 🎉 **Phase 4 checkpoint: three pieces of evidence** ([Syllabus §8](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase); collected in Practice 10)
>
> - [ ] The quizzes of Modules 22, 23, 24, and 25: at least 4 correct in each.
> - [ ] The dashboard used by someone else without help: L1–L3 of Module 24 Practice 10.
> - [ ] A 60–90-second phone demo video (unlisted) and "a Grafana link": a GitHub link to `grafana/dashboards/system-health.json` + a dashboard screenshot.

**Phase 4 is complete: two screens for two audiences.** The residents look, command according to their role, and find their devices on the **Map**; the technical team reads the devices' history and health in Grafana, is woken by alerts when a node goes silent, and receives yesterday's report every morning. The limit: its brain is still on the laptop, so the alerts and the reports go to sleep when the laptop sleeps.

> ➡️ **Next module:** [Module 26 — Docker & Docker Compose: One Command for All Services](../../phase-5-operations-scale/module-26-docker-compose/README.md). Grafana moves to Docker Compose with the same `smarthome-grafana-data` cupboard: your dashboard, rule, and contact point come along.

## 📚 Sources & Image Credits

**Documentation and source code used** (accessed 26–27 Oct 2026):

- **Grafana OSS 13.2.4** (AGPLv3): the image [`grafana/grafana`](https://hub.docker.com/r/grafana/grafana); [Grafana in Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/); the PostgreSQL data source: [its settings](https://grafana.com/docs/grafana/latest/datasources/postgres/configure/) and [its alerts](https://grafana.com/docs/grafana/latest/datasources/postgres/alerting/); alerts: [creating a rule](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/), [No Data and Error](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/), [grouping notifications](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/group-alert-notifications/), and [the Telegram contact point](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/manage-contact-points/integrations/configure-telegram/); export and import: [the dashboard JSON model](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/view-dashboard-json-model/) and [alert provisioning](https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/). The documentation follows the latest release, which may differ from 13.2.4.
- **Maps**: [the OSMF tile policy](https://operations.osmfoundation.org/policies/tiles/) and [OpenStreetMap copyright](https://www.openstreetmap.org/copyright); [Leaflet](https://leafletjs.com/) 1.9.4 (BSD-2-Clause); [react-leaflet](https://react-leaflet.js.org/docs/start-installation/) 5.0.0 with its [LICENSE](https://github.com/PaulLeCam/react-leaflet/blob/master/LICENSE.md) **Hippocratic-2.1** (not an OSI license, see Concept 8).
- **Reports**: [node-cron](https://www.npmjs.com/package/node-cron) 4.6.0 and [its time zones](https://nodecron.com/timezones-and-dst), grammY [files and `InputFile`](https://grammy.dev/guide/files), the Telegram Bot API [`sendDocument`](https://core.telegram.org/bots/api#senddocument).
- **Ready-made platforms** ([Concept 11](#11-buy-or-build-ready-made-iot-platforms)): [ThingsBoard](https://github.com/thingsboard/thingsboard), [Home Assistant](https://www.home-assistant.io/installation/raspberrypi), [Blynk](https://blynk.io/pricing), and [Antares](https://antares.id).
- **Curriculum**: the pass requirement is quoted from [Syllabus §7, Module 25](../../SYLLABUS.md#module-25--professional-visualization-grafana-device-maps--reports); is your `device_health` already a hypertable ([Module 18's 🧩 Level 3](../../phase-3-backend-data/module-18-timescaledb/README.md#level-3--device_health-is-time-series-data-too-from-scratch))? The GRANTs and the queries don't need to change (the code test lab).

**Images.** The author's diagrams are licensed **CC BY 4.0** (their `.svg` files are in `assets/`); on the screenshots, only the titles, numbers, and captions. File by file: [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-25`, `two-dashboards-three-tools`, `grafana-beside-the-database`, `read-only-rights`, `alert-journey`, `map-from-the-database`, `daily-report`, `project-diagram-module-25` | From the author's code and tests. The alert times = the range of two runs (mock Garden, mock Telegram); the IPs and sensor numbers are **examples**; the Map screen in the diagrams = an illustration. | CC BY 4.0 |
| `first-grafana`, `panel-editor-and-variable`, `system-health-dashboard`, `silent-node-alert` | Real screenshots of Grafana 13.2.4 (the default dark theme), 1280 px wide. `System Health` made through the screens (the same as the reference JSON); `Alerting` from `garden pull`; the token isn't visible. | Grafana OSS (Grafana Labs, AGPLv3), shown as it is for educational purposes, October 2026 |
| `map-page` | Real screenshots of dashboard 1.1.0 (a production build) against backend 1.2.0, 1280 and 375 px wide (Chrome device mode, **not a phone**); real OSM tiles; three **fictional** points around Monas. | Map © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) |
| `csv-report` | Real text from a bash terminal and the lab logs (the `curl` answer equivalent to Bruno, the backend log and the mock Telegram, `cat`, `xxd`), laid out by the author. | CC BY 4.0 |

**About the Expected output boxes.** "The author's lab" is mostly the final lab, 27–28 October 2026, on a **Raspberry Pi 5 with Ubuntu 26.04.1 LTS (arm64)** playing the laptop: Docker Engine 29.1.3, Node.js 24.21.0, npm 11.19.0, Google Chrome 156, `grafana/grafana:13.2.4`, `timescale/timescaledb:2.30.2-pg17`, and a real Mosquitto 2.0.22 locked in Module 21's style, in containers. Its code is exactly `code/`: backend 1.2.0 from the start of the lab (also in Practices 1–5, while your backend is still 1.1; plus an English 1.1 copy for the "old backend" cases of 6.3 and 🚨) and dashboard 1.0.0 raised to 1.1.0 through Practice 7's steps. The Grafana and Map screens were clicked and typed by a script through headless Chrome (time zone `Asia/Jakarta`); the Bruno requests were sent with `curl` with the same method, address, body, and account.

The counters are written as yours (3000, 5432, 8080, 5173, 1883); the lab's own counters and its container, cupboard, and hallway names were different and are rewritten to `smarthome…`. Many boxes keep the example values of the Indonesian edition's recordings (made the same way on the same Pi), while the screen texts, the log formats, and the file names and sizes that follow from the English code come from the English lab. Results outside the final lab, for example [3.3](#33-a-guarding-on-its-own-table-from-offline-report-events-optional-8-minutes), the dark-mode Lighthouse score of `/map`, steps 4 and 6 of 7.4, and the false ✅ `Normal (Missingseries)` in 🚨, are quoted from the **code test lab** of the night before (counters and names rewritten too); there, the vitals panels were filled with 288 **synthetic** `device_health` rows (24 hours). The default 07:00 WIB run of 9.1 and the import into a second, empty Grafana (9.3) come from the Indonesian edition's lab. "The author's research" is the test of 26 October with the settings named in its sentence.

The Pi's clock is in the UTC+8 zone (WITA); the backend ran with `TZ=Asia/Jakarta`, so its log times are WIB. The logs of Grafana and the mock server are in UTC (+7 hours = WIB), and Mosquitto writes epoch seconds; the Grafana and Map screens and the backend's messages show WIB. Seconds, differences, file sizes and names, uids, and sensor numbers are **examples**. The LAN IP is written `192.168.1.10`, paths `/home/you/…`.

Telegram is a **mock** Bot API server with a fake token and chat_id, as in [Module 19's 🔬](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#-technical-deep-dive-optional). The backend is pointed at it through `TELEGRAM_API_ROOT`, Grafana through two test options that are **not** in your command: the lab's CA bundle (`SSL_CERT_FILE`) and a mock with the alias `api.telegram.org` in the lab's hallway ([🔬](#-technical-deep-dive-optional)). The message boxes hold the text the mock received. The data are the 7-day history from `npm run seed-history` (`received_at` = the time the script was run), the vitals of the simulator `f00d00000001`, and the mock Garden `f00d000000b2` with its 300-second pause, **not** shortened. G2 was proven with the mock Garden, the laptop asleep was imitated by freezing the backend for 18 minutes, and "Grafana from a phone" with a second browser through the machine's LAN IP.

**Not** tested: the real Telegram (G1–G3 with your bot, how emoji look, `Unauthorized` and `chat not found`, group chats, one token for the backend and Grafana at the same time); Node 2 with an 18650 battery; phones and video; Windows, macOS, Docker Desktop (including `host.docker.internal`), PowerShell, and the firewall; Excel and LibreOffice; a Docker daemon restart and a reboot (the hallway "just once" = reasoning from `docker restart` and stop/start); Edge, Firefox, and Safari; the amd64 image size (the numbers ±445 MB and 1.81 GB = arm64).

**Not yet proven** at publication: the database down for more than about 80 seconds (two or more evaluations); a laptop that really sleeps (the containers sleep too, and the order of the messages may differ); the **Format** `Table` alert in releases after 13.2.4 (proven to work in 13.2.4 although the documentation says time series) and its fallback in 🔬; the code sketches in 🔬 weren't run.

---

[⬅️ Module 24](../module-24-control-rules-roles/README.md) · [Phase 4](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 26 — Docker & Docker Compose: One Command for All Services](../../phase-5-operations-scale/module-26-docker-compose/README.md) ➡️**
