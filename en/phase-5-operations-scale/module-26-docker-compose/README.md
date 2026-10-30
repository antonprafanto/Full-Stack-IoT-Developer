# Module 26 — Docker & Docker Compose: One Command for All Services

🌐 **English** · [Bahasa Indonesia](../../../fase-5-operasi-skala/modul-26-docker-compose/README.md)

*Phase 5 · Week 26 · Hardware: **Kit B** (Raspberry Pi) or a laptop only · Prerequisites: **Module 25** (backend 1.2.0, frontend 1.1.0, Grafana on `main`), Module 17 (just enough Docker), Module 21 (the locked broker) · Time: 10–12 hours, spread over the week (the ⭐ path ±9 hours)*

[⬅️ Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 27 ➡️](../module-27-deploy-internet-tls-pwa/README.md)

---

[Module 25 closed](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#-module-25-completion-checklist) with one promise: Grafana moves into Docker Compose with the same `smarthome-grafana-data` cupboard, and your dashboards, rules, and contact point come along. With that promise, **Phase 5 opens**. According to the [Syllabus](../../SYLLABUS.md#-phase-5--operations--scale-deploy-ota-cicd--capstone-modules-2632), this phase takes your system from "it runs on my home network" to "it runs on the internet, 24/7, encrypted, updatable, and never loses data". Module 26 is its first step: **wrapping the whole system** so it can be started with one command and carried to another machine. Everything is **still on the home network**; the internet, HTTPS, and TLS wait in Module 27.

Many old promises are paid off this week. [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard) used Docker "just enough" and postponed what's inside a container, your own images, and Docker Compose until Module 26; the Syllabus also writes ["full Compose comes in Module 26"](../../SYLLABUS.md#3-technology-choices--why-we-made-them). [Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md#9-backup-and-restore-photocopy-the-archive-then-prove-it-can-be-restored) said that a backup that has never been restored is the same as having no backup. [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#6-a-guard-at-every-door-the-admin-and-viewer-roles) prepared `HEAD /health` for Docker's health checker. Module 22 and [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#3-one-address-for-one-screen-react-router-in-declarative-mode) waited for a real server that serves `dist/` and still answers F5 at every address. [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway) postponed taking the `smarthome` hallway apart and called its alert rule YAML an archive until provisioning in Module 26.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Starting the home needs two `docker run` commands, two or three `npm run dev` terminals, and a broker managed by systemd on the Pi. | Every part has its own starting recipe, scattered over 25 modules. | **One `docker compose up -d`** starts everything, from the database to Grafana ([Concept 5](#5-one-file-for-one-home-docker-compose), [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes)) |
| A friend's laptop can't run your project: "it works on my laptop". | Program versions, the operating system, and settings differ on every machine; the starting order only exists in your head. | Backend and web **molds**, one Compose file, and `.env.example` ([Concept 1](#1-it-works-on-my-laptop-a-shipping-container-for-programs)–5, Practices 2–3, [Practice 11](#practice-11--the-clean-laptop-test-45-minutes)) |
| The dashboard only lives while Vite is running. | `vite preview` isn't a real server, and `dist/` has no server yet. | **Caddy** serves `dist/` and forwards `/api` to the backend ([Concept 4](#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy), Practice 3) |
| Grafana is assembled by clicking; the Module 25 YAML export is only an archive. | There are no files yet that Grafana reads when it starts. | **Grafana as files** (provisioning) from the `grafana/` folder ([Concept 9](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning), [Practice 7](#practice-7--grafana-as-files-provisioning-and-a-one-off-grafana_reader-account-40-minutes)) |
| A program stops = the system is dead until you start it again. | Nobody watches the programs in your terminal. | **A restart policy** and **a health check** ([Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs), [Practice 8](#practice-8--coming-back-to-life-by-itself-and-data-that-stays-30-minutes)) |
| The whole history depends on one cupboard on one laptop. | The Module 18 backup was made once by hand, and its recipe doesn't know Compose yet. | **Cupboard backups and a restore test** in a separate project ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups), [Practice 9](#practice-9--backing-up-the-cupboards-and-a-restore-test-in-a-separate-project-35-minutes)) |

At the end of the week, one command starts your whole home, and that home can be carried to another laptop. That's the pass requirement from the [Syllabus](../../SYLLABUS.md#module-26--docker--docker-compose-one-command-for-all-services): **on a "clean" laptop (or a friend's), `git clone` + `docker compose up -d` runs the whole system in < 10 minutes, and the history data is still there after `docker compose down && up`.** This module splits it into four proofs:

- **L1** a clean laptop in < 10 minutes: a stopwatch from `git clone` to the **Login** page at `http://localhost` (11.2). Write down two numbers, **total** and **without downloads**, plus your internet speed. Installing Docker and Git and making a GitHub account don't count.
- **L2** the default services are up: `db`, `mosquitto`, `backend`, `web`, and `grafana` running, while `broker-account`, `migrate`, and `grafana-account` show `Exited (0)` in `docker compose ps -a` (11.3). The optional services (`uptime-kuma`, `cloudflared`, `nodered`) aren't part of L2.
- **L3** the history fingerprint is the same after `docker compose down` and then `docker compose up -d`, not `down -v` (8.4 and 11.4).
- **L4** (Kit B) the Pi runs `edge/compose.edge.yml`. Node 1 (and Node 2 through Node 1) connects to the broker container with its old address and account, without changing the firmware; its data shows live on the laptop dashboard through the bridge, and the lamp button is answered with an `ack` (6.6).

On the **laptop path**, it reads L1 + L2 + L3, and the stand-in for L4 is the simulator and the mock Garden publishing to the central broker and showing live ([5.5](#55--live-data-through-the-central-broker-the-simulator-the-mock-garden-and-the-lamp-button-7-minutes)); the gateway may be tried on the same laptop, the way the author tested it ([6.7](#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)). The ✅ sentence stays, but it's read honestly: between `git clone` and `up -d` comes filling in `.env` (secrets don't go into Git) and, on a new laptop, two `docker volume create` commands. The Syllabus (v1.0.28) records this L1–L4 split, the laptop-path wording, and the ±1.1 GB download assumption in its ✅ line. The author's "warm" test on the same machine (the official images already there) reached the **Login** page in 62.3 seconds.

For Mini Smart Home, the backend moves up to **1.3.0** (ready to be packed in a Docker mold; no migration, no new package), the dashboard to **1.2.0** (three lines of `socket.ts` and a Caddy mold), the `grafana/` folder becomes provisioning files, and there are new files at the project root (among them `compose.cloud.yml` and `.env.example`) and in `edge/` (`compose.edge.yml`). The data contract stays **1.4**, and the firmware of Node 1 (v1.6.0) and Node 2 (v1.0.0) doesn't change. Module 26 isn't a checkpoint: its quiz counts toward the [Phase 5 completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase) at the end of the phase.

![Module 26 roadmap. Top, the six curriculum phases; Phase 5 Operations and scale (Modules 26–32) framed in berry with the flag Phase 5 opens. Modules 1–25 done; Module 26 red, marked YOU ARE HERE, Modules 27–32 not yet. Note: the whole home in Docker Compose, one command on the laptop and on the Pi; backend and web images (molds), Grafana from files, still on the home network. The Module 26 this week box, 10–12 hours spread out, the star path ±9 hours; Kit B or a laptop only, Docker Desktop 4.96.2+ or Engine 29, disk ±6 GB, the Module 25 result on main. Left: just-enough Docker and YAML warm-up; Quick Win, two services, one command; P1 the workbench and the old data's fingerprint; P2 the backend 1.3.0 mold; P3 the web 1.2.0 mold, Vite to Caddy; P4 the cupboards move, database and Grafana into Compose; P5 the whole home in one command. Right: P6 the Pi gateway, edge/compose.edge.yml + a bridge (laptop path: the simulator); P7 Grafana as files, the takeover of the rule, the contact point, then the old data source; P8 coming back to life by itself, data that stays; P9 backing up the cupboards and a restore test; P10 the image shop, GHCR by hand, arm64 versus amd64; P11 the clean-laptop test; Add-on: the pull request The whole system in Docker Compose. Stars (required): P1–P8, P11, the pull request. Bottom, the pass requirement split from the Syllabus ✅: L1 a clean laptop, from git clone to the Login page in less than 10 minutes, write down the total, without downloads, and the internet speed; L2 the default services are up, db, backend, grafana healthy, mosquitto, web, the one-offs Exited (0); L3 the same history fingerprint after docker compose down and then up -d, not down -v; L4 Kit B, the Pi runs edge/compose.edge.yml, Node 1 connects with its old address and account (firmware unchanged), data live. Laptop path: L1 + L2 + L3, the stand-in for L4 the simulator on the central broker. The Syllabus ✅ sentence: on a clean laptop (or a friend's), git clone + docker compose up -d runs the whole system in less than 10 minutes, and the history data is still there after docker compose down && up; note in v1.0.28: prerequisites don't count, ±1.1 GB download. Proven in: L1, L2 Practice 11; L3 Practices 8 and 11; L4 Practice 6; the author's lab warm, 62.3 s to the Login page. Changed: backend 1.3.0, frontend 1.2.0, grafana/ becomes provisioning, two new Compose files. Unchanged: data contract 1.4, firmware, migrations 001–010. The internet, HTTPS, MQTT TLS, and a bridge that survives outages come in Module 27.](assets/roadmap-module-26.png)

> [!NOTE]
> **How to use this module.**
>
> - **Two paths, one center.** On both paths, the laptop runs the center, `compose.cloud.yml` ([Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway)). **Kit B**: the Pi runs the gateway, a Mosquitto broker in a container that Node 1 connects to as usual ([Practice 6](#practice-6--the-pi-gateway-kit-b-docker-engine-edgecomposeedgeyml-and-a-lan-bridge-70-minutes-laptop-path-25-minutes)). **Laptop path**: the simulator and the mock Garden publish straight to the central broker.
> - **Home mode and dev mode.** Home mode = Compose: `backend` and `web` in containers, the dashboard at `http://localhost`. Dev mode = `npm run dev` and Vite as in Modules 16–25, for changing code. **Only one backend runs**, home mode OR dev mode ([5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes)).
> - **The move.** Your old home stops at 1.2 and only starts again at [5.3](#53--one-command-starts-the-whole-home-docker-compose-up--d---build-and-ps--a-10-minutes) (device path: Node 1's data only arrives again at 6.6). Meanwhile no readings are recorded, and the old Grafana rule sends a real 🔴 "Silent node"; ✅ comes by itself after the data is back.
> - **Proof table**: where each requirement is proven, and its sign.
>
>   | Requirement | Proven in | What you see |
>   | :-: | :-- | :-- |
>   | L1 | [11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes) | the **Login** page at `http://localhost/login`, before the stopwatch passes 10 minutes |
>   | L2 | [11.3](#113--l2-the-default-services-are-up-grafana-from-files-and-sample-history-8-minutes) | `docker compose ps -a`: five services `Up` (three `(healthy)`) and three one-off services `Exited (0)` |
>   | L3 | [8.4](#84--l3-the-same-fingerprint-after-docker-compose-down-and-then-up--d-8-minutes), [11.4](#114--l3-at-the-test-place-the-fingerprint-before-and-after-down-7-minutes) | `readings` and `fingerprint` after `down` and then `up -d` equal the ones before |
>   | L4 | [6.6](#66--l4-node-1-connects-with-its-old-account-live-data-on-the-dashboard-and-the-lamps-ack-12-minutes) (laptop path: 5.5) | the laptop broker's log `New bridge connected … as pi-bridge`, the **Live** badge, and the lamp's `ack` |
>
> - **The 🖥️ box in each practice names its tools**: **VS Code** in the `mini-smart-home` project (a terminal at the **project root** for every central `docker compose`, also the `backend`, `frontend`, and `tools` terminals); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux); **an SSH terminal to the Pi** (Kit B); **Chrome** or **Edge**; **Bruno**; **MQTTX**; **GitHub**; and **Telegram**.
> - **The Expected output boxes.** The author recorded the outputs on a **Raspberry Pi 5 with Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3 (the Ubuntu package), and Chrome 156. That one machine played the laptop AND the Pi (two Compose projects, the gateway on another counter). The `docker compose` commands are the same on every OS; according to the official documentation, Compose 5.6.1 in Docker Desktop works the same as v2. Progress lines such as `[+] Running 11/11` may look different in your version; what you read is the state word: `Created`, `Started`, `Healthy`, `Exited`. Telegram in the author's lab is a **mock Bot API server**, and GHCR is played by a **mock image shop** (`registry:3.1.2` at `127.0.0.1`). The lab's names, counters, IPs, and paths are disguised, times are written in WIB, and sizes and times are only **examples** (details in [📚 Sources](#-sources--image-credits)).
> - **Honest status: the author hasn't tested** Docker Desktop (Windows, macOS), PowerShell and CMD, a real Raspberry Pi OS, a real ESP32 against the containerized broker, two machines on a LAN, a real phone, the MQTTX app, amd64 images, the real GHCR and GitHub, a Docker restart or a reboot, or a friend's laptop with home internet. All of that is your job; don't tick an item in [✅](#-module-26-completion-checklist) that hasn't really happened.
> - macOS users: replace **Ctrl** with **Cmd** for VS Code and browser shortcuts. **Except in the terminal:** stopping a program is still **Ctrl + C**, on a Mac too.

> [!WARNING]
> **This week's safety rules.**
>
> 1. **The database, Grafana, backend, and Uptime Kuma counters are `127.0.0.1` only.** The broker and the web are opened to the home network only when needed, **without port forwarding** (no TLS until Module 27). The central broker deliberately listens on every interface because the Pi gateway and the ESP32 come in from the LAN; on public Wi-Fi, stop it with `docker compose stop mosquitto` ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door), [5.1](#51-the-central-broker-edgecenterconf-the-pi-bridge-acl-block-and-the-broker-account-and-mosquitto-services-12-minutes)).
> 2. **`.env` (also `edge/.env`) never goes into Git** and is never pasted into a forum or an AI. The same goes for the output of `docker compose config`, which prints every secret ([Concept 9](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning)).
> 3. **Never `docker compose down -v`, `docker volume rm smarthome-…`, or `docker system prune --volumes`** on the laptop that holds your real history: your broker accounts or your history get deleted too ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups), [8.5](#85-never-down--v-then-optional-restart-docker-or-reboot-the-pi-4-minutes)).
> 4. **A public image can be opened by anyone.** Set up `.dockerignore` first, check `docker history --no-trunc` first, and only then push and make it public (2.2, [2.4](#24--docker-build-the-image-size-and-a-docker-history-without-secrets-10-minutes), [10.3](#103-check-docker-history-then-make-the-package-public-8-minutes)).
> 5. **The `docker` group on the Pi equals root.** Add only your own account ([6.1](#61-pi-docker-engine-from-dockers-apt-repository-the-docker-group-and-git-20-minutes), [🔬](#-technical-deep-dive-optional)).
> 6. **Only one backend runs**, home mode OR dev mode. Two backends kick each other off the broker, and Telegram answers `409 Conflict` ([5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes)).

As in Modules 16–25, this module starts with the [🔁 Just-enough Docker & YAML warm-up](#-just-enough-docker--yaml-warm-up-35-minutes). On the first day, the warm-up, the [🏆 Quick Win](#-quick-win-two-services-one-command-25-minutes), Concepts 1–4, [1.1](#11-the-featuredocker-compose-branch-and-the-moving-plan-3-minutes), then [Practice 2](#practice-2--the-backend-130-mold-45-minutes) and [Practice 3](#practice-3--the-web-120-mold-vite--caddy-45-minutes) are enough: your old home keeps running. [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes) to [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes) are done in one sitting, ±2.5 hours. The eleven concepts are read in between their practices; the order is at the start of [🧠](#-the-why-concepts). The folded parts in [🚨](#-troubleshooting) are opened when needed; the folded parts in [🔬](#-technical-deep-dive-optional) can be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 Just-enough Docker & YAML warm-up (35 minutes)](#-just-enough-docker--yaml-warm-up-35-minutes)
4. [🏆 Quick Win: two services, one command (25 minutes)](#-quick-win-two-services-one-command-25-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 A shipping container for programs](#1-it-works-on-my-laptop-a-shipping-container-for-programs) · [2 A mold in layers](#2-a-mold-in-layers-image-tag-digest-and-architecture) · [3 `Dockerfile`](#3-the-molds-recipe-dockerfile-and-dockerignore) · [4 The kitchen and the serving table](#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy) · [5 Docker Compose](#5-one-file-for-one-home-docker-compose) · [6 Cupboards and windows](#6-cupboards-and-windows-volumes-bind-mounts-and-backups) · [7 The hallway up close](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door) · [8 Starting in order](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs) · [9 `.env` and provisioning](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning) · [10 The center and the gateway](#10-two-files-until-the-end-the-center-and-the-gateway) · [11 The image shop](#11-the-image-shop-ghcr-and-architecture)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 The old data's fingerprint](#practice-1--the-workbench-and-the-old-datas-fingerprint-20-minutes) · [2 The backend mold](#practice-2--the-backend-130-mold-45-minutes) · [3 The web mold](#practice-3--the-web-120-mold-vite--caddy-45-minutes) · [4 The cupboards move](#practice-4--the-cupboards-move-the-database-and-grafana-into-compose-without-losing-data-50-minutes) · [5 The whole home](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes) · [6 The Pi gateway](#practice-6--the-pi-gateway-kit-b-docker-engine-edgecomposeedgeyml-and-a-lan-bridge-70-minutes-laptop-path-25-minutes) · [7 Grafana as files](#practice-7--grafana-as-files-provisioning-and-a-one-off-grafana_reader-account-40-minutes) · [8 Back to life by itself](#practice-8--coming-back-to-life-by-itself-and-data-that-stays-30-minutes) · [9 Backup and restore test](#practice-9--backing-up-the-cupboards-and-a-restore-test-in-a-separate-project-35-minutes) · [10 The image shop](#practice-10--the-image-shop-ghcr-by-hand-35-minutes) · [11 The clean-laptop test](#practice-11--the-clean-laptop-test-45-minutes)
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-26-completion-checklist)

## 🎯 After this module you can…

1. **Explain "it works on my laptop" in your own words**: the mold (image), the container, the cupboard (volume), and the hallway (network) as a shipping container that can be carried to any machine, while the data and the secrets (`.env`) deliberately stay outside it.
2. **Write a two-stage `Dockerfile`** (multi-stage) for backend 1.3.0 and dashboard 1.2.0, with a `.dockerignore` that keeps secrets out of the mold (proven by an `/app` without `.env`); the dashboard is served by Caddy at `http://localhost` without Vite, F5 safe at every address.
3. **Start the whole home with one `docker compose up -d`** from `compose.cloud.yml`: the database, the broker, the backend, the web, and Grafana, plus three one-off services that prepare the accounts and the migrations, then go home with `Exited (0)`.
4. **Move the history and Grafana into Compose without losing data**, on the same old cupboards, then prove it with a history fingerprint that's exactly the same before and after the move.
5. **Make Grafana start complete from files** (provisioning): the data source, the dashboard, the contact point, and the "Silent node" rule are read from the `grafana/` folder, after you take over its old content without double alerts.
6. **Make services come back to life by themselves** with a health check, a starting order, and a restart policy, then prove the difference between a program that stops by itself (alive again) and `docker compose stop` (stays off).
7. **Run the gateway broker on the Pi in a container** (Kit B) through `edge/compose.edge.yml` and a LAN bridge to the laptop; Node 1 still connects with its old address and account, without new firmware.
8. **Switch between home mode and dev mode**: Compose to run the home, `npm run dev` to change code, and always only one backend running.
9. **Back up the cupboards and test restoring them** in a separate project, without touching your real history.
10. **Drop the molds off at the image shop** (registry) GHCR, then test "a clean laptop": from `git clone` to the **Login** page in < 10 minutes, with the history still there after `docker compose down` and then `up -d`.

## 🧰 What you need

| What to prepare | Details |
| :--- | :--- |
| **The Module 25 result** on `main` | Backend 1.2.0, frontend 1.1.0, and the `grafana/` folder, plus the old home running: the containers `smarthome-db` and `smarthome-grafana`, the `smarthome` hallway, and the cupboards `smarthome-data` and `smarthome-grafana-data` (checked in [🔁 Step 1](#step-1--your-homes-inventory-containers-cupboards-hallways-molds-and-disk-space)). |
| **Docker** | [Docker Desktop](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#-setup-installing-docker-desktop-3045-minutes-only-once) ≥ 4.96.2 (Windows, macOS; it brings Engine 29.9.2 and Compose 5.6.1; not tested by the author) or Docker Engine 29 with the Compose plugin (Linux). The command is `docker compose` with a space; `docker-compose` (version 1) isn't used. |
| **±6 GB of disk space** | For all the images (TimescaleDB and Grafana are already ±4 GB), your two molds, and backups. |
| **Old passwords** from your password manager | The postgres password (Module 17) for `.env` in [4.2](#42-git-hygiene-first-gitignore-gitattributes-then-env-with-the-old-postgres-password-5-minutes), and the Grafana admin password (Module 25) from 1.3 to [7.4](#74--docker-compose-up--d-provisioned-the-test-button-and-a-refused-save-10-minutes). The old cupboards keep using the old passwords. |
| **A data path** (pick one) | **Kit B:** Node 1 (and Node 2) plus a Pi with **64-bit** Raspberry Pi OS (`dpkg --print-architecture`: `arm64`), SSH, the `sudo` password, and Git ([6.1](#61-pi-docker-engine-from-dockers-apt-repository-the-docker-group-and-git-20-minutes)). 32-bit Pi OS is only supported up to Docker Engine 28, so use the laptop path. **Laptop path:** the simulator `f00d00000001` and the mock Garden. |
| **Node.js 24, VS Code, Git, Bruno, Chrome/Edge** | Same as Module 25, plus MQTTX ([Quick Win Step 4](#step-4--mqttx-through-counter-1884-messages-from-the-sender-container-6-minutes)) and the `learn-iot` repository (folder `module-26`). |
| **A GitHub account** | The branch and the pull request (➕ E); the GHCR image shop in [Practice 10](#practice-10--the-image-shop-ghcr-by-hand-35-minutes) (optional). |
| **The Module 19 Telegram bot** (optional) | The same [token and `chat_id`](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#63-telegram-settings-in-env), copied later into the root `.env`. |

**Download three small images now**, before the first day: ±100 MB (TimescaleDB and Grafana have been there since Modules 17 and 25), and the time doesn't count in [Quick Win Step 1](#step-1--read-composeyaml-then-start-it-with-docker-compose-up--d-8-minutes). With Docker running, type in any terminal (for example the VS Code terminal) **one command per image**, and wait for the prompt to come back before the next command:

```text
docker pull eclipse-mosquitto:2.1.2-alpine
```

```text
docker pull caddy:2.11.7-alpine
```

```text
docker pull node:24.22.1-alpine3.24
```

`docker pull` only takes one name; three names at once are refused with `docker: 'docker pull' requires 1 argument`. All three now show in `docker image ls`. Then check Compose:

```text
docker compose version
```

**Expected output** (example, the author's lab):

```text
Docker Compose version 2.40.3+ds1-0ubuntu1
```

In Docker Desktop the number is 5.x; what matters is that the command is recognized. The versions this module uses (October 2026; Syllabus v1.0.28 also records Caddy and these versions in Module 26's tool list):

| Component | Version | Note |
| :--- | :--- | :--- |
| Docker Engine, Docker Desktop | 29.x, ≥ 4.96.2 | Pi: Docker's apt repository; the author: Engine 29.1.3, Ubuntu's `docker.io` package |
| `docker compose` | 5.6.1 (Desktop), 2.40.3 (the author) | functionally identical, according to the official documentation |
| `timescale/timescaledb` | `2.30.2-pg17` | unchanged; not 2.31.0, `-oss`, or `-pg18` |
| `grafana/grafana` | `13.2.4` | unchanged; 13.2.5 and 13.3.0 exist, but aren't used |
| `eclipse-mosquitto` | `2.1.2-alpine` | new: the central and the gateway broker |
| `caddy` | `2.11.7-alpine` | new: the web server, without HTTPS |
| `node` | `24.22.1-alpine3.24` | new: the base of the backend and web molds |
| `louislam/uptime-kuma`, `cloudflare/cloudflared`, `nodered/node-red` | `2.5.8-slim`, `2026.10.5`, `5.0.9-24` | only in profiles that stay off (Module 30 and 🧩 Level 2, Module 27, optional) |

There's no new npm package (`pino-pretty` 13.2.0 only moves to `dependencies`), and Node.js stays 24 (the author: 24.21.0).

**The time** is ±11.4 hours, not counting downloads and waiting: the warm-up 35 minutes, the Quick Win 25, the concepts ±100, the practices 475, ➕ 30, and the quiz and checklist 20. The ⭐ path alone takes ±9 hours.

## 🔁 Just-enough Docker & YAML warm-up (35 minutes)

> 🖥️ **Tools used:** **VS Code** with its terminal, and **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana` running.

Five things to bring before Compose: nothing is started, deleted, or changed. **Later in …** points to where each one is used. Create a folder **`module-26/warmup`** in the **`learn-iot`** repository, open a VS Code terminal there, and copy the [`inventory.md`](code/warmup/inventory.md) sheet (**Copy raw file**) into `module-26`. The **On your laptop** column is filled in during the warm-up, without passwords, tokens, or `.env` content.

### Step 1 — Your home's inventory: containers, cupboards, hallways, molds, and disk space

Run them one by one for part 1 of the inventory sheet:

```text
docker ps -a
docker volume ls
docker network ls
docker image ls
docker system df
```

After Module 25 there are usually the containers `smarthome-db` and `smarthome-grafana` (`Up`), the `smarthome` hallway (besides Docker's own `bridge`, `host`, `none`), and two cupboards. **Expected output** of `docker volume ls` (example, cut):

```text
DRIVER    VOLUME NAME
local     smarthome-data
local     smarthome-grafana-data
```

`docker image ls` in the author's Docker Engine 29.1.3 has the columns `DISK USAGE` (on disk) and `CONTENT SIZE` (≈ the download size); other versions may differ. `docker system df` is only read, without prune (safety rule 3). The names that differ from the example are what you write down.

**Later in [4.3](#43--remove-the-old-containers-keep-their-cupboards-docker-stop-docker-rm-and-docker-network-rm-8-minutes):** the old containers are removed, and Compose uses both cupboards as they are. Clashing names are this week's most common cause of errors.

### Step 2 — Who is using counters 80, 1883, 3000, 5173, 5432, and 8080?

Compose uses counters 80 (dashboard), 8080 (backend), 5432 (database), 3000 (Grafana), and 1883 (central broker); Vite stays at 5173. The counters Docker opened:

```text
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

**Expected output (example):**

```text
NAMES               PORTS
smarthome-grafana   127.0.0.1:3000->3000/tcp
smarthome-db        127.0.0.1:5432->5432/tcp
```

Programs outside Docker (an old laptop broker, `npm run dev`, IIS):

- Linux and the Pi: `ss -ltnp`. Counters opened by Docker show without a program name, and the backend's `npm run dev` shows as `"MainThread"`.
- macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(not tested by the author)*.
- Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,1883,3000,5173,5432,8080` *(not tested by the author)*.

Write them down in part 2 of the inventory sheet. Counter 80 taken? Later, `PORT_WEB=8081` and `CORS_ORIGIN` in `.env`. **Later in [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes):** the old laptop-path broker (Modules 11/12) on 1883 is stopped in its opening box.

### Step 3 — YAML from scratch: `practice.yaml`, required variables, and the Tab trap

Compose files are written in **YAML**. Create **`practice.yaml`** in the `warmup` folder, then read its comments from top to bottom: they are the lesson.

```yaml
# practice.yaml - Module 26 warm-up, steps 3-4: YAML and environment variables in one small Compose file.
# This file is NOT meant to be started. Just ask Compose to READ it with "config": Compose prints its content again as it
# understands it (variable values filled in, numbers turned into text), without starting anything. From this folder:
#   docker compose -f practice.yaml config                           -> error: OWNER isn't filled in (see ${OWNER:?...})
#   docker compose -f practice.yaml --env-file practice.env config   -> works, with the values from practice.env
#
# YAML rules used here:
# - "key: value" = a map (pairs of a name and its content). Content indented to the right under a key belongs to that key.
# - Indent with SPACES (2 per level in this file), NEVER a Tab: a Tab makes Compose stop with the error
#   "found character that cannot start any token".
# - A line that starts with "- " = one list item.
# - A # sign = a comment to the end of the line; Compose ignores it.
name: practice-yaml

services:
  greet:
    # plain text may go without quotes
    image: eclipse-mosquitto:2.1.2-alpine
    # a list may be written downward (with "- ") or on one line inside [ ]. $$ = a $ sign for sh, not for Compose.
    command: ["sh", "-c", "echo $$GREETING, $$OWNER"]
    environment:
      # Three variable forms. The value is looked up in the terminal's environment, then in .env of this folder (or --env-file):
      #   ${NAME:-default}  the default is used when NAME is empty or missing
      #   ${NAME:?message}  Compose STOPS with that message when NAME is empty or missing (for required secrets)
      #   ${NAME}           when missing: the warning "variable is not set", then filled in with empty text
      GREETING: ${GREETING:-hello}
      OWNER: ${OWNER:?fill in OWNER in practice.env}
      CITY: ${CITY}
      # An unquoted number is read as a NUMBER first, then turned into text: leading and trailing zeros are lost.
      CODE_UNQUOTED: 007          # becomes "7"
      CODE: "007"                 # stays "007"
      VERSION_UNQUOTED: 1.10      # becomes "1.1"
      VERSION: "1.10"             # stays "1.10"
      # Compose 2.40.3 reads off even without quotes as the text "off", but older YAML readers read it as "false".
      # Quotes make it text for sure everywhere (our project writes TIMESCALEDB_TELEMETRY: "off").
      TELEMETRY: "off"
    ports:
      # "laptop-counter:container-port". Always quoted: it holds colons and is more than a plain word.
      - "127.0.0.1:1885:1883"
    logging:
      driver: json-file
      options:
        max-size: 10m
        # quotes: Docker's log settings only accept text; Compose 2.40.3 turns 3 into "3" by itself, but the quotes
        # make the intent clear
        max-file: "3"
```

`-f` = the file's name (without `-f`, Compose looks for `compose.yaml`); `config` prints its content again as Compose understands it:

```text
docker compose -f practice.yaml config
```

**Expected output** (Compose stops, exit code 1):

```text
WARN[0000] The "CITY" variable is not set. Defaulting to a blank string.
error while interpolating services.greet.environment.OWNER: required variable OWNER is missing a value: fill in OWNER in practice.env
```

The `error` line always shows: `${OWNER:?…}` stops Compose with your message. The `WARN` line only shows sometimes (the author's lab: 10 of 30 times). **Later in [Concept 5](#5-one-file-for-one-home-docker-compose):** the project's required secrets use `:?`, so an incomplete `.env` is caught before anything starts.

**The Tab trap.** A Tab in front of `image:` (usually carried in from copied text) → `yaml: line 18: found character that cannot start any token`. Try moving `ports:` one space to the right, save, and run `config` again → `yaml: line 17: did not find expected key`. The line number can come before the wrong line (`ports:` is on line 37): check from there downward. Put it back.

### Step 4 — Environment variables from `practice.env`: default values, empty values, and unquoted numbers

Create **`practice.env`** in the same folder; its shape is the same as the project's `.env`:

```text
# practice.env - example variables for practice.yaml (Module 26 warm-up, step 4). Its shape is the same as the project's .env:
# one NAME=value per line, no spaces around the = sign, no quotes. There are no secrets here.
OWNER=Budi
GREETING=good morning
# CITY is deliberately not written: config then warns that the variable CITY is not set (and fills in an empty text)
```

`--env-file` takes the values from that file (like `node --env-file=.env` in the backend):

```text
docker compose -f practice.yaml --env-file practice.env config
```

**Expected output** (cut; exit code 0):

```text
WARN[0000] The "CITY" variable is not set. Defaulting to a blank string.
…
      - echo $$GREETING, $$OWNER
    environment:
      CITY: ""
      CODE: "007"
      CODE_UNQUOTED: "7"
      GREETING: good morning
      OWNER: Budi
      TELEMETRY: "off"
      VERSION: "1.10"
      VERSION_UNQUOTED: "1.1"
```

The keys are sorted alphabetically, the comments are dropped, `${GREETING:-hello}` becomes `good morning`, and `CITY` is empty. **YAML's real trap is numbers:** without quotes, `007` becomes `"7"` and `1.10` becomes `"1.1"`. Unquoted `off` stays text for Compose 2.40.3, but another YAML reader may read it as `false`; that's why it's quoted.

Change the `GREETING` line in `practice.env` to `GREETING=` and run it again: `GREETING: hello`. Put it back. **Later in [5.1](#51-the-central-broker-edgecenterconf-the-pi-bridge-acl-block-and-the-broker-account-and-mosquitto-services-12-minutes):** `$$` = one `$` sign for `sh` inside the container, used by `broker-account`.

### Step 5 — Reading the old container's settings with `docker inspect`, without leaking passwords

The settings of Module 17's `docker run` now only live in the `smarthome-db` container ([Module 25's 1.2](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#12-check-the-container-docker-ps-docker-inspect-and-docker-network-inspect-7-minutes) checked Grafana this way). Run the five commands of part 3 of the inventory sheet one by one. **Expected output** (example; the restart policy, the cupboard, then the variable names):

```text
{"Name":"unless-stopped","MaximumRetryCount":0}
volume smarthome-data -> /var/lib/postgresql/data
POSTGRES_PASSWORD
POSTGRES_DB
TIMESCALEDB_TELEMETRY
…
```

The variables command deliberately prints only the **names**: `docker inspect smarthome-db` without `--format` prints the content of `POSTGRES_PASSWORD`, so don't paste it into a forum or an AI. The `'{{…}}'` quotes (Step 2 too) weren't tested by the author in PowerShell/CMD; if you get an error, use Git Bash.

Make sure the old postgres and Grafana admin passwords are in your password manager. **Later in [4.1](#41-composecloudyml-first-stage-db-and-grafana-on-two-external-cupboards-10-minutes):** these settings become the `db` service (the old postgres password goes into `.env` in 4.2).

<details>
<summary>Self-test answer key</summary>

1. **Step 1: why doesn't a stopped container show in `docker ps`?** Without `-a`, only running ones show. A finished one-off service (`Exited (0)`) will also only show in `docker compose ps -a`.
2. **Step 4: replace the unquoted `007` and `1.10` with `0x1F` and `1e3`.** `"31"` and `"1000"`, without an error: they're read as numbers.
3. **Step 4: remove the quotes in `TELEMETRY: "off"`.** Still `"off"` in Compose 2.40.3, without an error.

Put back every line you changed.

</details>

## 🏆 Quick Win: two services, one command (25 minutes)

> 🖥️ **Tools used:** **VS Code** in the `learn-iot` repository with its terminal, **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux), and **MQTTX**.

In these 25 minutes, one file starts two containers at once: a practice MQTT broker and a sender that publishes a message to that broker every 2 seconds. The sender finds the broker only by its **service name**. The "Mini Smart Home" project isn't touched yet, and you already downloaded the image of both containers in [🧰](#-what-you-need).

> [!NOTE]
> **Practice only.** This broker has **no accounts**, against the [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#6-the-brokers-doorkeeper-a-password-file-and-one-account-per-program) rule: a broker is always locked. It's safe here because its counter is only `127.0.0.1:1884` (this laptop only, not the home Wi-Fi) and it's taken down in Step 6. Your project's central broker stays locked ([5.1](#51-the-central-broker-edgecenterconf-the-pi-bridge-acl-block-and-the-broker-account-and-mosquitto-services-12-minutes)).

### Step 1 — Read `compose.yaml`, then start it with `docker compose up -d` (8 minutes)

1. In the **`learn-iot`** repository, create the folder **`module-26/quick-win`**.
2. In that folder, create the file **`compose.yaml`**, fill it with the following file (**Copy raw file** from [`code/quick-win/compose.yaml`](code/quick-win/compose.yaml)), then save (**Ctrl + S**):

```yaml
# compose.yaml - Quick Win of Module 26: two services, one command.
# This file's name is Docker Compose's DEFAULT name, so in this folder this is enough: docker compose up -d   (without -f)
# PRACTICE ONLY: the broker below has NO accounts (allow_anonymous), can only be reached from this laptop (127.0.0.1), and
# is taken down in the last step with: docker compose down
# The Compose project is named after this folder (quick-win).
services:
  # Service 1: the practice MQTT broker. An official image, an exact tag (the same as the project's central broker), no "latest".
  broker:
    image: eclipse-mosquitto:2.1.2-alpine
    # the default settings file inside this image: listener 1883 without accounts (allow_anonymous true)
    command: ["mosquitto", "-c", "/mosquitto-no-auth.conf"]
    ports:
      # left = the counter on your laptop (1884, so it doesn't clash with a 1883 broker that may already exist),
      # right = the port inside the container. 127.0.0.1 = this laptop only, not the whole Wi-Fi.
      - "127.0.0.1:1884:1883"
    # The Mosquitto image declares its data and log folders as cupboards. In this practice both can live in memory (tmpfs):
    # gone when the container is removed, and no nameless cupboards are left behind after "docker compose down".
    tmpfs:
      - /mosquitto/data
      - /mosquitto/log

  # Service 2: the sender. The same image (already on the laptop, no new download), but it runs mosquitto_pub.
  sender:
    image: eclipse-mosquitto:2.1.2-alpine
    # The broker's address = the SERVICE NAME "broker": in the Compose hallway (network), every service is known by its name.
    # Port 1883 = the port INSIDE the broker container, not counter 1884 on the laptop. $$ = a $ sign for sh, not for Compose.
    command:
      - sh
      - -c
      - |
        n=0
        while true; do
          n=$$((n + 1))
          mosquitto_pub -h broker -p 1883 -t practice/greet -m "hello from the sender container, message $$n"
          echo "sent message $$n"
          sleep 2
        done
    # start the broker first (only the starting order: it doesn't wait for the broker to be "ready" yet, that's Concept 8)
    depends_on:
      - broker
    # sh as the first process ignores the stop signal; this small init passes it on, so "down" doesn't wait 10 seconds
    init: true
    tmpfs:
      - /mosquitto/data
      - /mosquitto/log
```

What to take away:

- **One mold, two containers.** `broker` and `sender` use the same mold. The broker's `command` points to `/mosquitto-no-auth.conf`, a settings file without accounts that's already inside that mold.
- **The counter** `"127.0.0.1:1884:1883"`: left = counter 1884 on the laptop (not 1883, so it doesn't clash with your old broker), right = the port inside the container.
- **The service name is the address.** The sender calls the broker with `-h broker -p 1883` in the hallway Compose made ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)). `$$` = a `$` sign for `sh`, not for Compose ([🔁 Step 4](#step-4--environment-variables-from-practiceenv-default-values-empty-values-and-unquoted-numbers)). `depends_on` only sets the starting order.
- **Two settings proven necessary.** Without `tmpfs` (a temporary folder in memory), every `up` leaves nameless cupboards behind ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)). Without `init: true`, `sh` as the first process ignores the stop signal, so `down` waits for the 10-second limit, then kills it by force (±12 seconds in the author's lab; [Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs)).

3. In the Explorer panel, right-click the `quick-win` folder → **Open in Integrated Terminal**. Every Quick Win command runs in this terminal:

```text
docker compose up -d
```

No `-f`, because `compose.yaml` is Compose's default file name. The project's name = the folder's name, so its hallway is `quick-win_default`. The broker starts first because of `depends_on`.

**Expected output** (example; ±2.4 seconds in the author's lab because the image was already there):

```text
[+] Running 3/3
 ✔ Network quick-win_default       Created      0.2s
 ✔ Container quick-win-broker-1    Started      1.1s
 ✔ Container quick-win-sender-1    Started      1.3s
```

### Step 2 — `docker compose ps`: the broker has a counter, the sender doesn't (2 minutes)

```text
docker compose ps
```

**Expected output** (example):

```text
NAME                 IMAGE                            COMMAND                  SERVICE   CREATED          STATUS          PORTS
quick-win-broker-1   eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   broker    23 seconds ago   Up 23 seconds   127.0.0.1:1884->1883/tcp
quick-win-sender-1   eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   sender    23 seconds ago   Up 22 seconds   1883/tcp
```

Two `Up` rows. Only the broker has a counter on the laptop (`127.0.0.1:1884->1883/tcp`). The `1883/tcp` on the sender is only a note the image ships with: the sender only talks inside the hallway.

### Step 3 — Read the sender's log with `docker compose logs -f` (3 minutes)

```text
docker compose logs -f sender
```

**Expected output** (example; the old lines show at once, then one new line every 2 seconds):

```text
sender-1  | sent message 1
sender-1  | sent message 2
…
sender-1  | sent message 18
^C
```

`-f` = keep following. **Ctrl + C** only stops the reading; the container keeps running.

### Step 4 — MQTTX through counter 1884: messages from the sender container (6 minutes)

1. In MQTTX, create a new connection (the **+** icon, as in [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#23-connect-mqttx-to-the-laptop-broker)): **Name** `Practice QW`, **Host** `127.0.0.1`, **Port** `1884`, **Username** and **Password** empty. Click **Connect**.
2. Click **New Subscription**, set **Topic** to `practice/#`, then **Confirm**.

**Expected output** (the author's lab, without the MQTTX app: its role is played by a command-line MQTT client on the same machine):

```text
practice/greet hello from the sender container, message 26
practice/greet hello from the sender container, message 27
practice/greet hello from the sender container, message 28
```

A message arrives every 2 seconds. MQTTX comes in through **counter 1884 on the laptop**, while the sender calls **`broker:1883` inside the hallway**: different places, so different addresses.

### Step 5 — Go inside the broker container: the service name is the address (4 minutes)

```text
docker compose exec broker sh
```

The prompt changes to `/ #`: you're inside the broker's own small Linux. Type `ls /`, then `getent hosts sender`, then `exit`.

**Expected output** (example, cut; your hallway IP differs):

```text
/ # ls /
…
dev                     lib                     mosquitto-no-auth.conf  run                     tmp
…
/ # getent hosts sender
172.20.0.3        sender  sender
/ # exit
```

There's `mosquitto-no-auth.conf`, the settings file the broker uses. `getent` answers with an IP for the name `sender`: in the hallway, other services are known by their names. `exit` goes back to the laptop's terminal.

### Step 6 — Take it down with `docker compose down`, leaving nothing behind (2 minutes)

```text
docker compose down
```

**Expected output** (example; ±1.7 seconds in the author's lab):

```text
[+] Running 3/3
 ✔ Container quick-win-sender-1    Removed      0.4s
 ✔ Container quick-win-broker-1    Removed      0.4s
 ✔ Network quick-win_default       Removed      0.2s
```

Both containers and their hallway are gone, counter 1884 is free again, and no cupboard is left behind, because the broker's data folder only lived in memory (`tmpfs`; in the author's lab, `docker volume ls` afterward was the same as before). One mold, two containers, one hallway, one command: `compose.cloud.yml` later does the same for your whole home.

> ➡️ **Next:** read [Concept 1](#1-it-works-on-my-laptop-a-shipping-container-for-programs), then create a new branch in [1.1](#11-the-featuredocker-compose-branch-and-the-moving-plan-3-minutes). Your old home keeps running until [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes): the two molds of [Practice 2](#practice-2--the-backend-130-mold-45-minutes) and [Practice 3](#practice-3--the-web-120-mold-vite--caddy-45-minutes) come first.

## 🧠 The "Why" Concepts

You don't have to read these eleven concepts in one go. Read them in between the practices:

1. Quick Win (already done) → Concept 1 → 1.1 (a new branch; your old home keeps running)
2. Concepts 2–4 (fine while a build runs) → Practice 2 (the backend mold) and Practice 3 (the web mold)
3. Concepts 5–8, then Concept 10 → 1.2–1.4, Practice 4 (the cupboards move), and Practice 5 (the whole home) in one sitting, ±2.5 hours
4. Practice 6 (the Pi gateway for Kit B; on the laptop path 6.7 is enough), using Concept 10
5. Concept 9 → Practice 7 (Grafana as files)
6. Practice 8 (back to life by itself) uses Concept 8; Practice 9 (backups, optional) uses the backup part of Concept 6
7. Concept 11 → Practice 10 (the image shop, optional) and Practice 11 (the clean-laptop test)

Your old home stops at 1.2 and only starts again at 5.3, so Concepts 5–8 and 10 are read before 1.2, not in the middle of the move. The YAML, `Dockerfile`, and command snippets in the concepts are only for reading; everything is typed and run in the practices.

Module 17 promised that what's inside a container, making your own image, and Docker Compose would be "taken apart in Module 26" ([Just enough Docker](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard)). Concepts 1–4 take the shipping container apart; Concepts 5–11 build the home.

### 1. "It works on my laptop": a shipping container for programs

Imagine a friend wants to run Mini Smart Home on their laptop. Up to Module 25, they'd have to repeat everything you collected over 25 modules: Node.js 24 and `npm install` in `backend` and `frontend`; the TimescaleDB 2.30.2 database through `docker run` (Module 17); Grafana 13.2.4 with the `smarthome` hallway (Module 25); a locked Mosquitto broker (on the Pi through an apt package, or on the laptop as a service); a `.env` file with passwords that, on purpose, aren't in Git; then two or three `npm run dev` terminals. Miss just one, and they'll say the sentence every programmer knows: **"It works on my laptop, so why not on yours?"**

Even a small difference is enough: a Mosquitto 2.0 broker refuses a password file made by Mosquitto 2.1 with `not authorised` (Concept 10). The problem isn't your code but the **environment**: program versions, the operating system, settings, and starting steps scattered over 25 modules and inside your head.

**A shipping container.** Goods on ships used to be packed each in its own way: sacks, wooden crates, drums. Every port had to know how to lift all of them. The standard-size shipping container ended that hassle: whatever is inside, ships and cranes only need to know one shape. The Syllabus calls Docker containers "shipping containers" for the same reason. A program is packed **together with everything it needs** (a small Linux, an exact Node.js version, libraries, code, and how to start it) in a standard shape, so any "ship" can carry it without caring what's inside: Docker on your laptop, on a friend's laptop, on the Pi, and later on a VPS (Module 27).

In Module 17 you met the container as a cake made from a mold. A shipping container is the same cake seen from the other side: not "made from what", but "can be carried anywhere". Our working word stays **container**.

**A container isn't a virtual machine.** A virtual machine (VirtualBox, for example) runs a complete guest operating system with its own kernel. The kernel is the core of the operating system that manages the processor, memory, and disk. A container is much lighter: it holds only the program and its libraries, while the kernel is shared with the machine that runs it. Because there's no operating system to boot, a container is ready in seconds. That kernel must be Linux. On Linux and the Pi, containers use the machine's own kernel. On Windows and macOS, as [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard) said, Docker Desktop quietly runs one small Linux (on Windows through WSL 2), and every container lives inside it.

**What deliberately does NOT go into the container.** These three things stay outside, and that's what lets the container be thrown away and made again at any time:

- **Data** stays in the cupboards. Your reading history stays in `smarthome-data`, and Grafana's content in `smarthome-grafana-data`, the same old cupboards ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)).
- **Secrets** stay in `.env`. A mold can be shared with anyone, even shown publicly on the internet, so passwords and tokens must not be inside it. Docker Compose hands them over when the container starts ([Concept 9](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning)), and `.dockerignore` makes sure they don't slip in ([Concept 3](#3-the-molds-recipe-dockerfile-and-dockerignore)).
- **Your home's settings** stay in repo files (`edge/center.conf`, `frontend/caddy/`, `grafana/provisioning/`) mounted read-only into the containers. Changing a setting doesn't need a new mold.

One honest note: "the same everywhere" holds for **the same kind of processor**. A mold you build on the Pi or on an Apple silicon Mac is refused by an Intel or AMD laptop. The reason is in Concept 2, the way out in [Concept 11](#11-the-image-shop-ghcr-and-architecture).

The Docker dictionary of Modules 17 and 25 still applies. This week adds one word, **shop**:

| Term | Imagine | In Module 26 |
| :--- | :--- | :--- |
| **Mold** (image) | a cake mold: it holds everything that's needed and never changes | your own: `mini-smart-home-backend:1.3.0` ([Practice 2](#practice-2--the-backend-130-mold-45-minutes)) and `mini-smart-home-web:1.2.0` ([Practice 3](#practice-3--the-web-120-mold-vite--caddy-45-minutes)); ready-made: `timescale/timescaledb:2.30.2-pg17`, `grafana/grafana:13.2.4`, `eclipse-mosquitto:2.1.2-alpine` |
| **Container** | a cake made from the mold; seen from the "carried anywhere" side, a shipping container | `smarthome-db-1`, `smarthome-backend-1`, and their friends |
| **Counter** (port) | a counter from outside into the container | `127.0.0.1:5432`, `127.0.0.1:8080`, and `http://localhost` (counter 80) |
| **Cupboard** (volume) | a cupboard outside the cake: its content stays even when the cake is thrown away | `smarthome-data` and `smarthome-grafana-data`, your old cupboards |
| **Hallway** (network) | a hallway between containers; inside it they call each other by NAME | `smarthome_default`, made by Compose ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)) |
| **The image shop** (registry), **new** | a shop where molds are dropped off (push) and picked up (pull) | Docker Hub, where every ready-made mold has come from since Module 17; GHCR, GitHub's shop for your own molds ([Concept 11](#11-the-image-shop-ghcr-and-architecture)) |

![Diagram a shipping container for programs (Concept 1). Left, without a shipping container: your laptop works (Node.js 24 installed, npm install on this laptop, the database, broker, Grafana you assembled in Modules 12–25, .env with your passwords); a friend's laptop doesn't work, because of another Node.js version or none installed yet, no database, broker, Grafana yet, and no .env (passwords are never in Git). It works on my laptop, why not on yours? The steps to start your home are spread over 25 modules and your head. Right, with a shipping container (berry): the mold (image) mini-smart-home-backend:1.3.0 in layers, from the bottom: small Alpine Linux (the base of the mold), Node.js 24.22.1 (exact version), node_modules (186 packages, for Linux), src/ + migrations/ (backend code), how it starts node src/server.ts. An arrow docker run to the container, a running one, ticked on Windows, macOS, Linux, and Raspberry Pi: the same contents wherever there is Docker, for the same processor type (Concept 11); the ship doesn't care what's inside, the size is standard. Middle, a container is not a virtual machine: two virtual machines, each bringing a complete guest OS, on a virtual machine manager (hypervisor); five containers db, mosquitto, backend, web, grafana, only the program + its libraries, on Docker Engine and the SAME Linux kernel. Docker Desktop (Windows, macOS): the containers run inside one small Linux that Docker Desktop prepares, Windows through WSL 2; Linux and the Pi: directly. Bottom, what deliberately does NOT go in: data to the cupboards (volumes) smarthome-data and smarthome-grafana-data, the history stays when the container goes; secrets to .env, not in Git and not in the mold (.dockerignore), Compose hands them over; the home settings to repo files edge/center.conf, frontend/caddy/, grafana/provisioning/ mounted read-only.](assets/shipping-container-for-programs.png)

> ⬆️ **Done reading Concept 1?** Do only [1.1](#11-the-featuredocker-compose-branch-and-the-moving-plan-3-minutes) for now (a new branch; your old home keeps running), then read Concepts 2–4 before [Practice 2](#practice-2--the-backend-130-mold-45-minutes).

### 2. A mold in layers: image, tag, digest, and architecture

A mold isn't one big lump. It's made of **layers**: each step of the recipe that makes it (Concept 3) stores the files that step added as one layer, stacked on the layer before. Your backend 1.3.0 mold, from the bottom: the layers of the base mold `node:24.22.1-alpine3.24` (a small Alpine Linux and Node.js 24.22.1), then `node_modules`, `package.json`, `migrations/`, `src/`, and the note on how to start it. The `docker history` command shows the stack, the last step at the top.

**Expected output (example, cut):**

```text
$ docker history mini-smart-home-backend:1.3.0
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
13aa9992d8ac   42 seconds ago   CMD ["node" "src/server.ts"]                    0B        buildkit.dockerfile.v0
<missing>      42 seconds ago   EXPOSE [8080/tcp]                               0B        buildkit.dockerfile.v0
<missing>      42 seconds ago   USER node                                       0B        buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY src ./src # buildkit                       315kB     buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY migrations ./migrations # buildkit         45.1kB    buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY package.json ./ # buildkit                 12.3kB    buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY /app/node_modules ./node_modules # buil…   64.6MB    buildkit.dockerfile.v0
…
```

`<missing>` in the `IMAGE` column isn't an error; the layer is still inside the mold. Look at the `SIZE` column: `node_modules` is 64.6 MB, while the `src` code is only 315 kB. These numbers explain why the order of the recipe's steps matters.

**Layers are kept as a cache.** When rebuilding, Docker checks the recipe step by step. If a step and every step before it haven't changed, its layer is taken from storage (the build screen says `CACHED`). As soon as one step changes, that step and every step after it are done again. That's why our recipe copies `package.json` and `package-lock.json` first, installs the libraries with `npm ci`, and only then copies the code. Changing one file in `src/` only remakes the `COPY src` layer; the `npm ci` layer stays `CACHED`. On the author's Pi 5, a build without the layer cache takes 45.8 seconds, more than half of it for `npm ci`. If nothing changed at all, every step is `CACHED` and the build finishes in 1.9 seconds. The numbers on your laptop will differ; the pattern is the same.

**Name, tag, and digest.** A mold's name has two parts separated by a colon: the name and the **tag**, for example `node:24.22.1-alpine3.24` or `eclipse-mosquitto:2.1.2-alpine`. A tag is a label stuck on by the mold's owner, and a label **can be moved** to different content. A real example while this module was being written: the owner rebuilt the `postgres:17.11-trixie` mold on 28 October 2026, so from that day the same tag points to different content. What never moves is the **digest**, the fingerprint of the mold's content (`sha256:…`): change the content even a little, and the digest is different. The backend build log records the digest of the base mold actually used, `node:24.22.1-alpine3.24@sha256:06d7adf3…8b53`. How to pin a mold with its digest is in [🔬](#-technical-deep-dive-optional).

**The `latest` trap.** Without a tag, Docker uses the tag `latest`. It means "whatever has that label today", not "the newest stable version", and its content can change without you noticing. While this module was being written, `eclipse-mosquitto:latest` pointed to 2.1.2. Even more of a trap, `louislam/uptime-kuma:latest` points to the old series 1, while our Uptime Kuma is series 2 (`2.5.8-slim`). That's why this curriculum **always writes an exact tag**, and so do you.

**Architecture.** The program inside a mold has already been translated into machine language for one kind of processor. Two kinds we meet: **amd64** (Intel or AMD laptops and PCs) and **arm64** (a 64-bit Raspberry Pi, an Apple silicon Mac, Snapdragon laptops). Official molds such as `node`, `caddy`, `timescale/timescaledb`, `grafana/grafana`, and `eclipse-mosquitto` are published as a **multi-architecture index**: one tag holds several versions, and Docker automatically picks the one that matches your machine. That's why the same command works on the laptop and on the Pi. Your own molds are a different story: `docker build` on the Pi makes an arm64-only mold. What that means for a friend's laptop, and the way out, is in [Concept 11](#11-the-image-shop-ghcr-and-architecture).

![Diagram a mold in layers, the kitchen and the serving table (Concepts 2–4), the author's build numbers on a Raspberry Pi 5 (arm64); the Dockerfile lines are shortened, copy them from the file. Left, backend 1.3.0, backend/Dockerfile: stage packages (the kitchen, thrown away after the build) FROM node:24.22.1-alpine3.24 AS packages, COPY package.json package-lock.json, RUN npm ci --omit=dev (186 packages, no developer tools); only node_modules is carried to the final stage (the serving table = the image contents): FROM node:24.22.1-alpine3.24, ENV NODE_ENV=production, COPY --from=packages /app/node_modules ./node_modules, COPY src ./src (also package.json, migrations), USER node (not root, uid 1000), CMD node src/server.ts, no npm start. Result 313 MB on disk, 71.9 MB compressed download. Right, web 1.2.0, frontend/Dockerfile: stage build (the Node.js kitchen) COPY package.json package-lock.json, RUN npm ci (110 packages, + TypeScript, Vite), COPY . ., ARG VITE_API_BASE=/api (baked into the JavaScript), RUN npm run build to dist/ ±1.1 MB; only dist/ is carried to the final stage FROM caddy:2.11.7-alpine, COPY caddy/Caddyfile, COPY --from=build /app/dist /srv; no CMD (the Caddy image already brings one), Compose mounts the frontend/caddy/ folder over it. Result 90.4 MB on disk, 24 MB download, without Node.js. Middle left, layers and the cache (simplified): the base, COPY package.json package-lock.json, RUN npm ci --omit=dev (slow, 24.6 s) stay CACHED, COPY src is rebuilt: changing one file in src/ repeats only that layer; a second build without changes 1.9 s, without the layer cache (base present) 45.8 s; web first 103 s (npm ci 49.5 s + npm run build 49.3 s), a code change ±50 s. Middle right, size bars: backend two stages 313 MB / 71.9 MB; backend full npm ci with the developer tools (research test, base 24.21.0) 404 MB / 94.8 MB; web Caddy + dist/ 90.4 MB / 24 MB. Bottom: the --omit=dev trap, a library used while the server runs must be in dependencies, the 1.2 mold dies with unable to determine transport target for pino-pretty, backend 1.3.0 moves it; tag and digest, the tag node:24.22.1-alpine3.24 can be moved, the digest sha256:06d7adf3…8b53 never changes; .dockerignore keeps out .env, node_modules, backup, bruno, test; latest can change silently (Mosquitto latest = 2.1, Uptime Kuma latest = series 1), write an exact tag.](assets/layers-and-multi-stage.png)

### 3. The mold's recipe: `Dockerfile` and `.dockerignore`

Up to Module 25 you only used molds made by others. This week you make two molds yourself. The recipe is written in a file named **`Dockerfile`** (no extension) in the program's folder, `backend/Dockerfile` and `frontend/Dockerfile`, and it runs in order from top to bottom, one layer per step (see the picture in Concept 2). The words you'll meet:

| Instruction | Meaning | Example from `backend/Dockerfile` |
| :--- | :--- | :--- |
| `FROM` | start from this base mold | `FROM node:24.22.1-alpine3.24` |
| `WORKDIR` | the working folder inside the mold (created if missing) | `WORKDIR /app` |
| `COPY` | copy files from your project folder into the mold | `COPY package.json package-lock.json ./` |
| `RUN` | run a command during the build; the result is kept as a layer | `RUN npm ci --omit=dev` |
| `ENV` | an environment variable built into the mold | `ENV NODE_ENV=production` |
| `LABEL` | a note stuck on the mold (used by GHCR, Concept 11) | `LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home"` |
| `USER` | run the program as this user, not root | `USER node` |
| `EXPOSE` | a note "this program listens on this port inside the container"; it opens no counter | `EXPOSE 8080` |
| `CMD` | the command run when the container starts | `CMD ["node", "src/server.ts"]` |

There's no TypeScript compile step: Node 24 runs `.ts` files directly (Module 16), so the mold just carries `src/` as it is. The order of the lines is the order of the layers: what rarely changes goes first, the code later (Concept 2). Every block in both `Dockerfile`s has a "why" comment in English; you read them block by block in [2.3](#23-a-two-stage-dockerfile-block-by-block-10-minutes) and [3.3](#33-the-web-dockerfile-and-dockerignore-then-docker-build-from-the-frontend-folder-12-minutes).

**Why `CMD ["node", "src/server.ts"]`, not `npm start`?** Two reasons.

1. **The stop signal.** When a container is stopped, Docker sends the `SIGTERM` signal to its main program, then waits for it to stop by itself. Your backend has handled it since [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#610-stopping-cleanly): `SIGTERM received: the backend is stopping gracefully`. If `npm start` were run, the main program would be npm, so the signal would reach npm, not Node; the official Node.js guide for Docker advises running `node` directly so that npm doesn't swallow the signal. The list form `["node", "src/server.ts"]` (the exec form) makes `node` itself the main program, with no shell in between. The same guide warns that Node isn't designed to be the first program (PID 1) in a container: a first program that doesn't install its own signal handler ignores `SIGTERM`. Our backend is safe because it installs its handler, while `sh` in the Quick Win's `sender` service gets `init: true` ([Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs)).
2. **The old npm scripts required `.env`.** Backend 1.2's `start` script reads `node --env-file=.env src/server.ts`. Inside the container there's no `.env` (secrets don't travel in the container), so Node stops at once with `node: .env: not found` (exit code 9). In a container, the settings come from Compose as environment variables. Backend 1.3.0 changes four scripts (`start`, `migrate`, `seed-history`, `users`) to `--env-file-if-exists=.env`: if the file doesn't exist, Node just writes `.env not found. Continuing without it.` and carries on. The `dev` script stays `--env-file=.env` because dev mode really must have a `.env` ([2.1](#21-backend-130-pino-pretty-moves-npm-scripts-without-a-required-env-and-a-log-without-health-10-minutes)).

**`.dockerignore`: what must not go in.** When `docker build ./backend` runs, Docker first sends the content of the `backend` folder (called the **build context**) to the machine that makes the mold, and `COPY` can only take from that delivery. The `.dockerignore` file, shaped like `.gitignore`, filters out what must not be sent ([2.2](#22-dockerignore-secrets-and-node_modules-stay-out-of-the-mold-5-minutes)):

- your laptop's `node_modules`. It's made again inside the mold by `npm ci`, because some libraries carry machine code specific to your laptop's operating system. In the author's lab, the laptop's `node_modules` alone was ±127 MB, while the context sent with the filter was only 338.61 kB.
- `.env` and `.env.*` (except `.env.example`), `backup`, `bruno`, `test`, `login*.json`, and `cookies*.txt`, because they hold passwords, tokens, and cookies.
- `src/**/*.test.ts`, test files the server doesn't use.

Why so strict? **A shared mold can be taken apart by anyone, layer by layer.** If `.env` ever got copied into a layer, deleting it in a later step doesn't help, because the old layer is still inside the mold. The author built the mold from a copy of the project that still held `backend/.env` and `node_modules/`, then checked its content: the `/app` folder only held `migrations`, `node_modules`, `package.json`, and `src`, and a search for `.env*` files in the whole mold found nothing. You check it yourself with `docker history --no-trunc` in [2.4](#24--docker-build-the-image-size-and-a-docker-history-without-secrets-10-minutes), before the mold goes on display in the shop ([Practice 10](#practice-10--the-image-shop-ghcr-by-hand-35-minutes)).

**`USER node`.** The `node` base mold already brings an ordinary user named `node` (uid 1000; uid = a user's number in Linux, Concept 6). The backend doesn't need root rights, so the recipe switches to that user before `CMD`: if there's ever a hole in the program, the damage is smaller. The proof is in [2.5](#25-a-mold-without-secrets-a-docker-run-that-refuses-to-start-then-the-node-user-10-minutes): `uid=1000(node) gid=1000(node) groups=1000(node),1000(node)`.

**No `HEALTHCHECK` in the `Dockerfile`.** A recipe may hold a health check command, but we deliberately keep it in one place only: the Compose file, together with the starting order that uses it ([Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs)).

### 4. The kitchen and the serving table: multi-stage, small images, and Caddy

In [Module 22](../../phase-4-frontend-dashboard/module-22-react-basics/README.md#82-the-ready-to-serve-dish-npm-run-build-then-taste-it-with-npm-run-preview-8-minutes), `npm run dev` was the kitchen and `npm run build` made the ready-to-serve dish. Making a mold has a similar problem: cooking needs many tools (TypeScript, Vite, Vitest, dozens of helper libraries), while serving only needs the dish. If the kitchen is carried to the table, the mold becomes big, slow to download, and full of tools a server doesn't need. The way out is **multi-stage**: one `Dockerfile` with two `FROM`s. The first stage is the **kitchen**: it installs the tools and cooks. The second stage is the **serving table**: it starts again from a clean base mold, then copies only the cooked result from the kitchen (`COPY --from=…`). The kitchen is thrown away and doesn't go into the final mold. The picture in Concept 2 shows both recipes side by side.

**Backend: a kitchen named `packages`.** The `packages` stage only runs `npm ci --omit=dev`, that is, it installs 186 packages exactly as `package-lock.json` says, without the developer tools. The final stage takes the `node_modules` folder from there, then copies `package.json`, `migrations/`, and `src/`. The sizes on the author's Pi 5 (arm64; they'll differ on your laptop):

| Mold | On disk | Downloaded (compressed) |
| :--- | ---: | ---: |
| `node:24.22.1-alpine3.24` (base) | 239 MB | 62.6 MB |
| `mini-smart-home-backend:1.3.0` (two stages, `--omit=dev`) | 313 MB | 71.9 MB |
| backend with a full `npm ci`, developer tools included (research prototype, base Node 24.21.0) | 404 MB | 94.8 MB |
| `caddy:2.11.7-alpine` (base) | 89.2 MB | 24 MB |
| `mini-smart-home-web:1.2.0` (Caddy + `dist/`) | 90.4 MB | 24 MB |

You see the size of both your molds yourself with `docker image ls` in [2.4](#24--docker-build-the-image-size-and-a-docker-history-without-secrets-10-minutes) and 3.3: in the author's Docker Engine 29, the columns are called `DISK USAGE` and `CONTENT SIZE`; the names may differ in other Docker versions. The "downloaded" number is what decides how long a friend's laptop waits.

**The `--omit=dev` trap: the story of `pino-pretty`.** Libraries in `devDependencies` don't go to the serving table. Backend 1.2 put `pino-pretty` (the log prettifier) there, although it's used **while the server runs**. In the author's lab, a mold with the 1.2 `package.json` broke down the moment it started: `Error: unable to determine transport target for "pino-pretty"`. The rule: a library used while the server runs must be in `dependencies`. Backend 1.3.0 moves it ([2.1](#21-backend-130-pino-pretty-moves-npm-scripts-without-a-required-env-and-a-log-without-health-10-minutes)); its version stays 13.2.0, it only changes block.

**Alpine, not Debian.** Our base mold is the **Alpine** variant, a small Linux that uses a C library called musl, not glibc like Debian, Ubuntu, and Raspberry Pi OS. For most Node programs there's no difference, except libraries that carry machine code, such as bcrypt. bcrypt 6.0.0 brings a ready-made build for musl, and in the author's arm64 mold it runs without a compiler. The author hasn't run the musl build for amd64, because the author's lab has no Intel or AMD machine.

**Web: a Node kitchen, a Caddy serving table.** After `npm run build`, the React dashboard is just static files: `index.html`, one JavaScript file of ±1 MB, CSS, and icons. Serving them doesn't need Node at all. The `build` stage in `frontend/Dockerfile` installs all the tools (`npm ci`, 110 packages) and runs `npm run build`; the final stage starts from the **Caddy** mold, copies the `Caddyfile`, and takes only the content of `dist/` from the kitchen into `/srv`. The result is almost as big as Caddy alone, and there's no `node` inside. The kitchen is what takes time: the first web build on the author's Pi 5 took 103 seconds, split almost evenly between `npm ci` and `npm run build`. Its build context is only the `frontend` folder, without the `backend` folder, so [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend)'s promise that the frontend can be built on its own is kept in [3.3](#33-the-web-dockerfile-and-dockerignore-then-docker-build-from-the-frontend-folder-12-minutes). An honest note: Caddy in this mold runs as root, the Caddy mold's default, unlike the backend, which uses `USER node`.

**`VITE_API_BASE` is baked in at build time.** As in [Module 22](../../phase-4-frontend-dashboard/module-22-react-basics/README.md#4-vite-and-the-frontend-folder-the-development-kitchen-at-localhost5173), every `VITE_…` is replaced with fixed text during `npm run build`, then sent along to the browser. In the web mold, the line `ARG VITE_API_BASE=/api` sets its value: the dashboard calls the API at **the `/api` path on the same address** as its page. Changing the value means rebuilding the mold; it holds an address, not a secret.

**Caddy, a real server for `dist/`.** Modules 22 and 24 promised: `npm run preview` is only for tasting, and a real server for `dist/` must answer every screen address with `index.html`. **Caddy** is that small web server. Its settings file, `frontend/caddy/Caddyfile` ([3.2](#32-frontendcaddycaddyfile-the-api-door-missing-assets-and-the-spa-fallback-10-minutes)), gives it three jobs:

1. **The front door** (reverse proxy): one address, `http://localhost`, for the pages and the API. A visitor to `/api/…` is walked to the `backend` service; the details are in [Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door).
2. **Assets** at `/assets/…` are served as they are, and a file that doesn't exist gets `404`.
3. **The SPA fallback**: screen addresses such as `/map` or `/devices/f00d00000001` aren't files, so they're answered with `index.html` through `try_files {path} /index.html`, then React Router picks the screen. F5 on any screen keeps working, as [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#3-one-address-for-one-screen-react-router-in-declarative-mode) promised.

**Just HTTP, for now.** Caddy is famous for setting up HTTPS by itself, but at home we don't have a domain name yet. So the site address in the Caddyfile is written **`:80`**: plain HTTP on the container's port 80, for any address typed in the browser. Many tutorials use `auto_https off`, but according to Caddy's documentation that setting only turns off the certificates and the redirects; it doesn't make the site served over HTTP. What decides is the `:80` address. When it starts, Caddy writes four warnings (`warn`) that are normal in this situation: `admin endpoint disabled`, `server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server`, `HTTP/2 skipped because it requires TLS`, and `HTTP/3 skipped because it requires TLS`. You see them yourself in [3.4](#34--test-the-web-mold-on-its-own-at-counter-8088-200-404-and-an-expected-502-8-minutes). In Module 27, `:80` is simply replaced with a domain name, and Caddy sets up HTTPS by itself.

The tool list in [Syllabus §5.1](../../SYLLABUS.md#51-software-all-free-installed-right-when-needed) puts Caddy in Module 27 (for HTTPS), while the Syllabus's Module 26 details already put it into `compose.cloud.yml`. Syllabus v1.0.28 records both: Caddy is the web server from Module 26 (without HTTPS, also in Module 26's tool list), and HTTPS stays in Module 27.

> ⬆️ **Done reading Concepts 2–4?** Continue to [Practice 2](#practice-2--the-backend-130-mold-45-minutes) and [Practice 3](#practice-3--the-web-120-mold-vite--caddy-45-minutes). Concepts 5–8 and [Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway) are read before [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes), because 1.2 to [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes) are done in one sitting.

### 5. One file for one home: Docker Compose

Up to Module 25, starting your home meant remembering many things: two long `docker run` commands with their hallway, two or three `npm run dev` terminals, and a broker running as a system service on the Pi or the laptop. On a friend's laptop, all of it has to be typed again, exactly and in order. **Docker Compose** writes that whole home in **one** YAML **file**. Each part of the home becomes one **service**: `db`, `mosquitto`, `backend`, `web`, `grafana`, and so on. Compose reads that file, then creates the hallway, the cupboards, and the containers for all of them with one command. You already tried it with two services in the [Quick Win](#-quick-win-two-services-one-command-25-minutes); your project's `compose.cloud.yml` holds eight default services and one service with a profile (Concept 10).

**From `docker run` to a file.** Every part of the [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard) command has its own place:

| Module 17's `docker run` | In `compose.cloud.yml` |
| :--- | :--- |
| `--name smarthome-db` | the service name `db`; its container is named `smarthome-db-1` (project name + service + a sequence number) |
| `timescale/timescaledb:2.30.2-pg17` | `image:` |
| `-e POSTGRES_PASSWORD=…` | `environment:`, its value from `.env` |
| `-p 127.0.0.1:5432:5432` | `ports:` (Concept 7) |
| `-v smarthome-data:/var/lib/postgresql/data` | `volumes:` (Concept 6) |
| `--restart unless-stopped` | `restart:` (Concept 8) |
| `docker network create` + `connect` (Module 25) | not needed (Concept 7) |

**The file's skeleton.** The `compose.cloud.yml` excerpt below drops the comments and some parts (`# …`); you write the whole file step by step in Practices 4, 5, and 7:

```yaml
name: smarthome

x-backend-settings: &backend-settings
  MQTT_URL: mqtt://mosquitto:1883
  # …
  JWT_SECRET: ${JWT_SECRET:?fill in JWT_SECRET in .env}
  # …

services:
  # …
  backend:
    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-backend:1.3.0
    build: ./backend
    environment: *backend-settings
    ports:
      - "127.0.0.1:${PORT_BACKEND:-8080}:8080"
    # …
```

- `name: smarthome` = the name of the **Compose project**, the prefix of everything it creates: the container `smarthome-backend-1`, the hallway `smarthome_default`, the cupboard `smarthome_broker-data`. Without `name:`, the project name = the folder name (Quick Win: `quick-win`). The test projects of Practice 9 (`-p restore-test`) and Practice 11 (`COMPOSE_PROJECT_NAME`) use the same file with another project name, so they don't collide with your home.
- `x-backend-settings: &backend-settings` = a reference block (anchor): a part starting with `x-` isn't a service; `&` gives it a name, and `*backend-settings` uses it. The backend settings are written only once for `backend` and `migrate`; the log limit `x-log` (Concept 8) is used by every service the same way.
- `image:` = the mold's name; `build: ./backend` = the folder of its recipe (`backend/Dockerfile`, Concept 3) for building that mold (the `IMAGE_REGISTRY` paragraph below).
- `docker compose …` uses **service names** (`docker compose exec db …`); plain `docker` uses **container names** (`docker inspect smarthome-backend-1`).

**`.env` and the `${…}` signs.** Compose fills in every `${…}` from the `.env` file in the same folder, the project root (its content in [4.2](#42-git-hygiene-first-gitignore-gitattributes-then-env-with-the-old-postgres-password-5-minutes), its role in Concept 9). You already tried the forms in the 🔁 warm-up:

| Written as | When empty or missing in `.env` | In the project |
| :--- | :--- | :--- |
| `${X}` | filled in empty (if the line is missing: with a warning) | not used (the example is `CITY` in the warm-up) |
| `${X:-default}` | its default value is used | `${PORT_DB:-5432}`, `${DB_VOLUME:-smarthome-data}` |
| `${X:?message}` | Compose **stops** and shows the message | the required secrets, and `IMAGE_REGISTRY` |
| `$$` | not a variable: one `$` sign passed on to `sh` inside the container | `"$$MQTT_PASSWORD"` in the `broker-account` service |

In the author's lab, with `IMAGE_REGISTRY` in `.env` still empty:

```text
$ docker compose config --quiet
error while interpolating services.migrate.image: required variable IMAGE_REGISTRY is missing a value: fill in IMAGE_REGISTRY in .env
```

When several lines are still empty, the variable named in that message can change on every try: fill them all in.

**The file name and `COMPOSE_FILE`.** Without `-f`, Compose looks for the default file name `compose.yaml` (the Quick Win). Our file is named `compose.cloud.yml`, as in the Syllabus, because this project has two Compose files (Concept 10); the line `COMPOSE_FILE=compose.cloud.yml` in `.env` tells Compose that name, so `docker compose up -d` at the project root is enough. No `.env` yet, or your terminal is in another folder? Compose answers `no configuration file provided: not found`: move to the project root and create `.env` (4.2); `-f compose.cloud.yml` alone still stops. The `edge` folder has its own `.env` and `COMPOSE_FILE`.

**Everyday commands**, all from the project root (used from [4.4](#44--docker-compose-up--d-the-old-cupboards-are-recognized-skipping-initialization-8-minutes) and [5.3](#53--one-command-starts-the-whole-home-docker-compose-up--d---build-and-ps--a-10-minutes) on):

| Command | What it's for |
| :--- | :--- |
| `docker compose up -d` | create and start the default services; repeated after the file or `.env` changes, it only recreates the services whose settings changed |
| `docker compose up -d --build` | rebuild the molds from `build:` first |
| `docker compose up -d --wait` | return to the terminal after every service is healthy (Concept 8) |
| `docker compose ps -a` | the project's containers, including finished one-off services |
| `docker compose logs <service>` | read the log (Concept 8) |
| `docker compose exec <service> <command>` | run a command in a running container |
| `docker compose stop` / `start` | stop, or start again, without removing |
| `docker compose down` | remove the containers and the hallway; the cupboards stay (Concept 6); the `monitoring` profile running? `docker compose --profile monitoring down` |
| `docker compose config --quiet` | check the file and `.env`; silence means all is well |

**Don't forget `--quiet`.** Without it, `docker compose config` prints the whole file with the `.env` content already filled in, every password and token included. Its output must never be pasted into a forum, a GitHub issue, or an AI.

**Old tutorials and Compose versions.** Many tutorials open their file with `version: "3.8"`; Compose now ignores that line and warns ``WARN … the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion`` (`…` = your file's path), so our file has no `version:`. The command is `docker compose` with a space, not `docker-compose` (Compose version 1). The author's recordings use Compose 2.40.3 (the Ubuntu package); Docker Desktop brings Compose 5.x (5.6.1 at the time of writing), which its official documentation calls "functionally identical to Compose v2". Its progress lines may look different; read the state word: `Created`, `Started`, `Healthy`, `Exited`.

**`IMAGE_REGISTRY` is required.** The `backend`, `migrate`, and `web` services hold `image:` **and** `build:`. If that mold isn't on the laptop yet, Compose first tries to **pull** it from the image shop at the `image:` address; if that fails, it only warns, then builds it itself from `build:` (proven in the author's lab with a mock image shop that was down and one that was empty; the real GHCR's `denied` answer wasn't tested). That's why `IMAGE_REGISTRY`, the image shop's address plus your shelf, deliberately has **no default value**: a default such as `ghcr.io/your-account` could make Compose pull someone else's image that happens to have the same name. You fill it in in [5.2](#52-composecloudyml-second-stage-migrate-backend-web-and-image_registry-in-env-15-minutes) with `ghcr.io/<lowercase-account>`. It isn't a secret: after [10.2](#102-docker-login-ghcrio-then-docker-compose-build-and-push-13-minutes) fills the shop, a friend's laptop in [11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes) just pulls your images (Concept 11). `migrate` and `backend` use the same mold, so it's built only once.

The picture below sums up `compose.cloud.yml`: the services, the hallway, the counters, and the cupboards that Concepts 6 and 7 take apart.

![Diagram the anatomy of compose.cloud.yml (Concepts 5–7), project smarthome. Top: Docker Hub and the image shop, pulled at the first up, official images with exact tags, backend and web from IMAGE_REGISTRY or built (build:); home Wi-Fi, the Pi gateway 192.168.1.37 through the bridge to 192.168.1.10:1883, a phone only in phone mode (WEB_ADDRESS=0.0.0.0). On the laptop: the project root (compose.cloud.yml + .env with the secrets, counters, COMPOSE_FILE, IMAGE_REGISTRY, then docker compose up -d); the browser (http://localhost to the dashboard, http://localhost:3000 to Grafana) comes in through counters :80 and :3000; the tools (Bruno and Swagger localhost:8080/docs, DBeaver :5432, the simulator :1883, npm run dev) through counters :8080, :5432, :1883. In Docker, the hallway smarthome_default made by Compose, the service name = the address. Row one: web (Caddy, front door + pages, image …/mini-smart-home-web:1.2.0, build ./frontend, files ./frontend/caddy to /etc/caddy, Up, counter 127.0.0.1:80) with an arrow /api/* to backend:8080; backend (API + Socket.IO, image …-backend:1.3.0, build ./backend, HOST=0.0.0.0, healthy, counter 127.0.0.1:8080) to mosquitto:1883; mosquitto the central broker (eclipse-mosquitto:2.1.2-alpine, files ./edge/center.conf and ./edge/acl-broker read-only, Up) with counter 1883 on all interfaces (berry). Backend to db:5432. Row two: grafana 13.2.4 (files ./grafana/provisioning and ./grafana/dashboards, healthy, counter 127.0.0.1:3000) to db:5432 as grafana_reader; db with the old alias smarthome-db (timescale/timescaledb:2.30.2-pg17, the POSTGRES_… form only for an empty cupboard, healthy, counter 127.0.0.1:5432); uptime-kuma faded, profile monitoring, off on a plain up -d, set up in Module 30, counter 127.0.0.1:3001. One-offs, dashed, Exited (0): grafana-account, migrate, broker-account; seen with docker compose ps -a. Cupboards: smarthome-grafana-data and smarthome-data external, yours, never created or deleted by Compose; smarthome_broker-data, Compose's own, deleted too by docker compose down -v. Bottom: a 127.0.0.1 counter = only programs on the laptop, no IP = the home Wi-Fi too and past the firewall, HOST=0.0.0.0 inside opens nothing; localhost in a container = that container itself; down removes the containers and the hallway, the cupboards stay, down -v deletes Compose's own cupboards, the external cupboards survive.](assets/compose-cloud-anatomy.png)

### 6. Cupboards and windows: volumes, bind mounts, and backups

A container may be thrown away and made again at any time: `docker compose down` removes it, `up -d` makes it again. What must last is stored outside the container. You've known the **cupboard** (volume) since Module 17. What's new is the **window** (bind mount): a file or folder of your project seen from inside the container, for example `edge/center.conf`, which the broker reads. `compose.cloud.yml` uses four kinds of places:

| Kind | In the project | Owner | Hit by `down -v`? |
| :--- | :--- | :--- | :--- |
| an `external` cupboard | `smarthome-data` (the database), `smarthome-grafana-data` | you | never |
| Compose's cupboard | `smarthome_broker-data` (the broker password file), `smarthome_kuma-data` | Compose | **deleted too** |
| a window | `./edge/center.conf`, `./edge/acl-broker`, `./frontend/caddy`, `./grafana/provisioning` | the Git repo | no |
| `tmpfs` | Mosquitto's log folder, the `grafana-account` data folder | memory (temporary) | — |

**Your own cupboards: `external`.** The `volumes:` part at the end of the file, without comments:

```yaml
volumes:
  db-data:
    external: true
    name: ${DB_VOLUME:-smarthome-data}
  grafana-data:
    external: true
    name: ${GRAFANA_VOLUME:-smarthome-grafana-data}
  broker-data:
  kuma-data:
```

`external: true` means the cupboard is yours: Compose uses it, but never creates or deletes it. On your laptop both have existed since Modules 17 and 25, so the [4.1](#41-composecloudyml-first-stage-db-and-grafana-on-two-external-cupboards-10-minutes) file uses your old history and Grafana straight away. On a new laptop, `up -d` stops with `external volume "…" not found` until you create them once with two `docker volume create` commands ([11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes)). Their names come from `.env` (`DB_VOLUME`, `GRAFANA_VOLUME`), so that the test projects of Practices 9 and 11 can use other cupboards. Forgot to write `external`? Compose still uses that old cupboard, with the warning ``already exists but was not created by Docker Compose. Use `external: true` to use an existing volume``, which in a normal terminal is often overwritten by the progress lines. That cupboard then counts as part of the project: in the author's lab test project, `down -v` deleted it too (`Volume … Removed`).

> [!WARNING]
> **Never `docker compose down -v`, `docker volume rm smarthome-…`, or `docker system prune --volumes`** on the laptop that holds your real history. A plain `down` only removes the containers and the hallway; `-v` also deletes Compose's cupboards. With `-v` your history survives thanks to `external` (proven in the author's lab), but the broker password file is gone: `broker-account` only remakes the `backend` account, so the device accounts (the simulator's too) and `pi-bridge` have to be added again one by one. The proof is in [8.5](#85-never-down--v-then-optional-restart-docker-or-reboot-the-pi-4-minutes).

**The form is only for an empty cupboard.** As in Module 17, `POSTGRES_PASSWORD` is only read while the database cupboard is still empty. Your old cupboard already holds a password, so `.env` holds the **old** postgres password; changing that line doesn't change the password in the database. The [4.4](#44--docker-compose-up--d-the-old-cupboards-are-recognized-skipping-initialization-8-minutes) log proves it: `PostgreSQL Database directory appears to contain a database; Skipping initialization`. A `.env` password that doesn't match makes `migrate` fail to log in (`password authentication failed for user "postgres"`, the author's lab). Grafana is the same: `GRAFANA_ADMIN_PASSWORD` only applies to an empty Grafana cupboard (Concept 9).

**The windows: configuration from the repo.** A window is written `./path/in/project:/path/in/container`, relative to the folder of `compose.cloud.yml`; the `:ro` ending = the container may only read. The configuration goes into Git and is changed in the repo. Three things the author tested on Docker Engine for Linux (Docker Desktop wasn't tested):

1. **A single file versus a folder.** Some editors (and `sed -i`) save by making a new file that replaces the old one. A container that mounts a **single file** keeps reading the **old** content until `docker compose restart <service>` (a restart is enough); one that mounts a **folder** sees the new content at once. The Caddyfile is mounted as the folder `./frontend/caddy`; Mosquitto uses single files, so after changing `edge/acl-broker` or `edge/center.conf`: `docker compose restart mosquitto` ([5.5](#55--live-data-through-the-central-broker-the-simulator-the-mock-garden-and-the-lamp-button-7-minutes)), like Module 21's "restart, not reload" rule.
2. **A source folder that doesn't exist yet** is created by Docker as an empty folder owned by `root`, and you can't write into it (`Permission denied`). That's why `edge/bridge/README.md` goes into Git: the `bridge/` folder already exists after `git clone` (Concept 10).
3. **File owners.** A program in a container runs as a numbered user (uid): postgres 70, Grafana 472, Mosquitto 1883, the backend's `node` 1000; on Linux and the Pi, that number decides who may read. The broker password file is kept in a cupboard (`/mosquitto/data/broker-passwd`), not a window: in the author's lab, a `600` file owned by the laptop's user and mounted as a window made Mosquitto keep crashing and restarting with `Unable to open pwfile`.

**`tmpfs` prevents nameless cupboards.** The recipes of the Mosquitto and TimescaleDB images mark some folders as cupboards. Without a place for those folders, Docker makes a nameless cupboard (a long string of letters and digits in `docker volume ls`) every time the container is recreated, and `down` doesn't remove it (the author's code lab: ±3 per cycle; with `tmpfs`: 0). `tmpfs` gives a temporary folder in memory, as in the Quick Win; in the project it's mounted in `broker-account`, `mosquitto`, and `grafana-account`.

**A cupboard isn't a backup.** A cupboard survives `down`, but not a broken disk, a lost laptop, or a wrong command, and [Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md#9-backup-and-restore-photocopy-the-archive-then-prove-it-can-be-restored)'s rule still holds: a backup that has never been restored is the same as having no backup. The database is backed up with `pg_dump` inside the `db` service, even while it's running. The Grafana cupboard may be packed with `tar` after its service is `stop`ped (the author's lab: stopped, copied, and running again in ±9 seconds), using an image that runs as root (`node:24.22.1-alpine3.24`), not the Grafana image (uid 472: `tar: can't open … Permission denied`). A database cupboard in use must **never** be packed with `tar`: its files are being written, so the copy may be incomplete. [Practice 9](#practice-9--backing-up-the-cupboards-and-a-restore-test-in-a-separate-project-35-minutes) makes both and restores the database archive into a separate project; automatic and off-site backups wait for Module 30.

### 7. The hallway up close: the Compose network, counters, and the front door

In Module 25 you made the `smarthome` hallway by hand, and [Module 25's Concept 2](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway) promised to take it apart here. Compose makes its own hallway for every project, named `<project>_default`; for your home, `smarthome_default`. Every service in the file goes there, and inside it **the service name is the address**, just as `sender` called `broker` in [Quick Win Step 5](#step-5--go-inside-the-broker-container-the-service-name-is-the-address-4-minutes): `backend` and `migrate` call `db:5432` and `mosquitto:1883` (`x-backend-settings`), Caddy in `web` calls `backend:8080`, and `grafana-account` calls `db`.

**An alias: the old name is still known.** The data source you made on screen in Module 25 points to `smarthome-db:5432`, but the database container is now named `smarthome-db-1`. The `db` service gets a second name (alias) in the hallway:

```yaml
    networks:
      default:
        aliases:
          - smarthome-db
```

In the author's lab, that old data source still answered `Database Connection OK` after the move ([4.5](#45--the-fingerprint-after-equals-the-one-before-then-check-grafana-in-the-same-cupboard-12-minutes)), until the files replaced it in Practice 7.

**The inside port versus the counter.** Module 25's rule still holds: inside a container, `localhost` is that container itself, so `127.0.0.1` in a health check (Concept 8) really does mean "me", and other services are always called by name. In a `ports` line, the **right** number is the port inside the container (always the same: db 5432, backend 8080, Grafana 3000), and the **left** number is the counter on the laptop, which you can change through `PORT_*` in `.env`. In the hallway, the inside port is used: changing `PORT_BACKEND` doesn't change `backend:8080`. Services without `ports` (`migrate`, `broker-account`, `grafana-account`) have no counter on the laptop at all.

**`HOST=0.0.0.0` doesn't open the backend to the Wi-Fi.** As [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#1-threat-model-who-might-mess-around-and-what-happens-then) said, the backend listens on `HOST=127.0.0.1` so that only that laptop can knock on it. In a container, `HOST: 0.0.0.0` means listening on every interface **inside** the container, so that Caddy and the health check can get in. Who outside the laptop can knock is decided by the counter, and the backend's counter `127.0.0.1:${PORT_BACKEND:-8080}:8080` is for this laptop only. Module 20's promise holds.

**A counter without an IP = the whole Wi-Fi.** A counter without an address (`"${PORT_MQTT:-1883}:1883"`) opens on every interface of the laptop and, according to Docker's documentation, also goes around the laptop's firewall. `docker compose ps` tells them apart: `127.0.0.1:8080->8080/tcp` versus `0.0.0.0:1883->1883/tcp, [::]:1883->1883/tcp`. Only the central broker is like that on purpose, because the Pi gateway and the laptop path's ESP32 come in from the home Wi-Fi; it has accounts (Module 21) and still no port forwarding on the router (no TLS yet, Module 27). This broker also runs on any Wi-Fi: on public Wi-Fi `docker compose stop mosquitto`, at home `docker compose start mosquitto`. The web counter is only opened to the Wi-Fi in phone mode ([🧩 Level 1](#level-1--the-dashboard-from-a-phone-phone-mode-through-env-a-small-change-20-minutes)).

**Caddy, the front door.** The `web` service is the front door (reverse proxy): one address, `http://localhost`, for the pages and the API. A visitor to `/api/…` is walked to `backend:8080` (the `/api` prefix is dropped), every other visitor gets the dashboard page. The page and the API now share one origin, so Module 20's `SameSite=Strict` cookie travels along without cross-port CORS trouble. Four consequences, written honestly:

1. **The cookie path patch.** The backend sets the `session` cookie with the path `/auth`, but the browser calls it through `/api/auth`. One `header_down` line in the Caddyfile rewrites its path ([3.2](#32-frontendcaddycaddyfile-the-api-door-missing-assets-and-the-spa-fallback-10-minutes)): a patch at the front door, not a backend change.
2. **Socket.IO.** Socket.IO reads `io("/api")` as a namespace (a room's name), not a path, so frontend 1.2.0 connects through the path `/api/socket.io` (three lines of `socket.ts`, [3.1](#31-frontend-120-three-lines-of-socketts-then-lint-build-and-check-schema-10-minutes)).
3. **The login limit is shared by every web visitor.** [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#8-rate-limiting-an-hourglass-for-password-guessers)'s limit of 10 tries per minute per IP now sees one IP for every web visitor: the IP of the `web` container (the author's lab backend log: `IP 172.19.0.7`). One password guesser makes every resident who logs in through `http://localhost` get refused with `429` (`too many attempts: try again in …`) for up to a minute, while Bruno through the backend's counter still gets in. The cure, `trustProxy`, waits for Module 27 together with HTTPS.
4. **Swagger through the backend's counter.** Behind `/api`, the Swagger page breaks (its assets are answered with the dashboard page), so open **`http://localhost:8080/docs`** ([5.4](#54--log-in-through-caddy-at-httplocalhost-f5-bruno-and-swagger-8-minutes)). From `http://127.0.0.1:8080/docs`, logging in with **Try it out** is refused with `403` `request from the page http://127.0.0.1:8080 refused`: with `HOST=0.0.0.0`, that page is no longer one of the origins the backend knows, unless you add it to `CORS_ORIGIN`.

**Calling the laptop from a container.** A gateway tried on the same laptop ([6.7](#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)) has to knock on the machine Docker runs on, not on a service in the hallway: `extra_hosts` `center:${CENTER_ADDRESS}` with `CENTER_ADDRESS=host-gateway`, Docker's special name for that machine itself (on the Pi, it holds the laptop's IP; Concept 10). Docker Desktop also knows `host.docker.internal` (not tested by the author; Docker Engine on Linux doesn't know it, Module 25's Concept 2). Other counter and name symptoms are in [🚨](#-troubleshooting).

### 8. Starting in order and coming back to life by itself: healthcheck, `depends_on`, restart policy, and logs

**"Running" isn't necessarily "ready".** A database that has just started needs a few seconds before it accepts visitors; on a new cupboard, Postgres even runs a temporary server first. In the author's research prototype, a `migrate` that only waited for the database to be "running" started 0.3 seconds after it and failed with `ECONNREFUSED` (exit 1). That's why three services get a **health check** (`healthcheck`): a command Docker runs regularly inside the container, asking "still healthy?". The answer shows in `docker compose ps` as `(healthy)` or `(health: starting)`:

| Service | Check | Interval |
| :--- | :--- | :--- |
| `db` | `pg_isready -h 127.0.0.1 -U postgres -d smarthome` (without `-h`, it can pass while that temporary server is still running) | 5 seconds |
| `backend` | `node -e "fetch('http://127.0.0.1:8080/health',{method:'HEAD'})…"` = the `HEAD /health` that [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#6-a-guard-at-every-door-the-admin-and-viewer-roles) promised for Docker's checker (the Node image has no `curl`) | 15 seconds |
| `grafana` | `curl -fsS http://127.0.0.1:3000/api/health` | 15 seconds |
| `mosquitto`, `web` | none | — |

Right after starting, the backend and Grafana are checked every 2 seconds; since 1.3.0, the backend's log doesn't record successful `/health` checks.

**`depends_on`: who waits for whom.** In the Quick Win, `depends_on` only set the starting order. The project uses three conditions: **`service_started`** (it's enough that it's running: `backend` waits for `mosquitto`, because the backend reconnects by itself every 5 seconds), **`service_healthy`** (wait until healthy: `migrate` and `backend` wait for `db`, `web` waits for `backend`), and **`service_completed_successfully`** (wait for a one-off service to finish with code 0: `mosquitto` waits for `broker-account`, `backend` for `migrate`, `grafana` for `grafana-account`).

**One-off services** are like a handyman who comes, does one job, then goes home: `broker-account` makes the broker account `backend`, `migrate` applies the new `migrations/*.sql` files, `grafana-account` makes the `grafana_reader` account. All three create what's missing and skip what exists, so they're safe to repeat (`broker password file already exists: skipped`, `0 new migration(s) applied, 8 applied earlier.`, `account grafana_reader already exists: skipped`). After going home, their status is `Exited (0)`, and they only show in **`docker compose ps -a`** ([5.3](#53--one-command-starts-the-whole-home-docker-compose-up--d---build-and-ps--a-10-minutes)). `docker compose start` also runs the handymen in the `depends_on` chain again, and that's safe. `docker compose up -d --wait` waits for everything to be healthy: a one-off service that's `Exited (0)` doesn't count as failed, and a service without a check is written `Healthy` as soon as it runs ([11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes)).

In the author's lab (full cupboards, images already there), `up -d` in [8.4](#84--l3-the-same-fingerprint-after-docker-compose-down-and-then-up--d-8-minutes) goes like this: `broker-account` `Exited` 3.2 s → `mosquitto` `Started` 3.4 s; `db` `Healthy` 9.1 s → `migrate` `Exited` 10.1 s → `grafana-account` `Exited` 11.3 s → `grafana` `Started` 11.6 s; `backend` `Healthy` 20.5 s → `web` `Started` 21.1 s; ±24 seconds in all. With `--wait` (the Practice 11 test project) ±25.6 seconds, and Grafana is the last to be healthy. The numbers on your laptop will differ.

**The restart policy.** `restart:` decides when Docker brings a stopped container back. The one-off services use `"no"`, the others `unless-stopped` (the same as Module 17):

| Event | `"no"` | `on-failure` | `always` | `unless-stopped` |
| :--- | :---: | :---: | :---: | :---: |
| the program inside stops by itself, code 0 (`exec backend kill 1`) ¹ | off | off | back | **back** |
| the program crashes, a code other than 0 ² | off | back | back | back |
| `docker compose stop` ¹ | off | off | off | **off** |
| `docker kill` / `docker compose kill` ³ | off | off | off | off |
| Docker restarts (reboot) while the service runs ² | off | ⁴ | back | back |
| Docker restarts after the service was `stop`ped ² | off | ⁴ | back | off |

¹ recorded by the author for `unless-stopped` ([8.1](#81--docker-compose-exec-backend-kill-1-the-backend-comes-back-to-life-by-itself-8-minutes), [8.2](#82-for-comparison-after-docker-compose-stop-backend-the-backend-stays-off-6-minutes)); ² Docker's documentation and code, not recorded; ³ the research prototype and Docker's code; ⁴ Docker's documentation and code disagree, and this module doesn't use it.

The Syllabus asks for "stopping one container and watching it come back to life by itself". Docker respects `stop` and `kill` as your decision, so what's meant is **the program inside the container stopping by itself**. `docker compose exec backend kill 1` asks the container's first process (the backend) to stop from inside; the backend [stops cleanly](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#610-stopping-cleanly) with code 0, then `unless-stopped` brings it back (the author's lab: `RestartCount` 1, ready again in ±7 seconds). That imitates a program that stops by itself, not a crash: `kill -SEGV 1` from inside is ignored (the research prototype). A program that keeps falling over is tried again with ever longer pauses, up to 1 minute (Docker's code).

**The first process and `init: true`.** A container's first process only reacts to the stop signals it handles itself. The backend has handled them since Module 19, so `stop` finishes at once; `sh` in the Quick Win's `sender` doesn't, so Docker waits for the 10-second limit, then kills it by force. `init: true` puts a small program in front of `sh` that passes the signal on (the lab: `down` 11.8 → 1.6 seconds). Even `db` with ±1.04 million readings stops in 1.8 seconds, so `stop_grace_period` (a longer waiting limit) isn't needed.

**Healthy doesn't mean the home is fine.** `unhealthy` does **not** make Docker restart the container (Docker's code; not tested by the author); the health check is only used for the order, `ps`, and `--wait`. `/health` also answers 200 even when the broker and the database are disconnected (the author's lab: `{"ok":true,"broker":false,"database":false,…}`). A monitor that tells people waits for [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data). A limit of backend 1.3: the automation rules are loaded once when the backend starts (failing if the database isn't ready yet), and after the laptop or Docker restarts, Docker may start the containers without the `depends_on` order. The **Rules** screen is empty although the backend is `(healthy)`? `docker compose restart backend` ([🚨](#-troubleshooting); not recorded by the author).

**Laptop asleep, home asleep.** `unless-stopped` covers "forgot to start the backend" and "the program stopped by itself", but as [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard) said, everything only lives while Docker is running, and a sleeping laptop puts the bot, the alerts, and the morning report to sleep too. [A server that's always on](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#9-telegram-notifications-important-fast-and-not-chatty) only comes in Module 27. You may try a Docker restart and a reboot in [8.5](#85-never-down--v-then-optional-restart-docker-or-reboot-the-pi-4-minutes).

**Logs.** Docker keeps everything a container writes to its screen, with no limit by default; the `x-log` anchor limits it to 3 files × 10 MB per container. Reading them ([5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes)): `docker compose logs backend`, plus `-f` (keep following; **Ctrl + C** only stops the reading), `--since 5m` (the last 5 minutes), `-n 50` (the last 50 lines), or `-t` (Docker's timestamps, UTC). The backend's log times are already WIB thanks to `TZ: Asia/Jakarta`; Mosquitto and Caddy write the number of seconds since 1 January 1970, while Grafana uses UTC (WIB = UTC + 7).

![Diagram starting in order, coming back to life by itself (Concept 8). Top, the docker compose up -d timeline in the author's lab (Pi 5, cupboards full, images present); number = bar end, seconds on Compose's screen; bar start inferred from depends_on. db starts at once, Healthy 9.1 s, then keeps running; broker-account Exited 3.2 s; mosquitto waits for broker-account, Started 3.4 s; migrate waits for db healthy, Exited 10.1 s; grafana-account waits for migrate, Exited 11.3 s; grafana waits for grafana-account, Started 11.6 s; backend waits for db healthy, migrate done, mosquitto started, Healthy 20.5 s; web waits for backend healthy, Started 21.1 s. How to read it: bar = starting until Started or Healthy, line = keeps running, dashed box = one-off then Exited, dashed line = waiting for a condition. With --wait everything is awaited healthy, lab 25.6 s, Grafana last at 23.1 s. Without service_healthy, migrate starts 0.3 s after db and fails ECONNREFUSED, exit 1 (research test). Middle: running doesn't mean ready, health checks db pg_isready -h 127.0.0.1 every 5 s, backend HEAD /health through node -e, grafana curl -fsS …/api/health, mosquitto and web without a healthcheck; unhealthy does NOT restart, the healthcheck is only for the order, ps, and --wait, /health stays 200 even when the broker or the DB is cut off, a real monitor is Module 30; one-offs are safe to repeat: broker password file already exists: skipped, 0 new migration(s) applied, 8 applied earlier, account grafana_reader already exists: skipped. Bottom, the table who comes back to life by itself, columns restart no (one-offs), unless-stopped (the 5 Module 26 services), always (for comparison): exec backend kill 1 from inside, no, back to life, back to life, recorded (unless-stopped) Up 2 seconds, RestartCount 1; a crash with a non-zero code, no, back to life, back to life, both with a longer and longer pause up to 1 minute, docs + Docker code; docker compose stop backend, no in all three, recorded (unless-stopped) Exited (0), wait for start; docker compose kill backend, no in all three, research test; reboot while the service runs, no, back to life, back to life, docs, not recorded; reboot after the service was stopped with stop, no, no, back to life, docs. kill 1 imitates a program that stops by itself, not a crash. After docker compose down nothing comes back; a sleeping laptop = everything sleeps, 24 hours = Module 27.](assets/starting-in-order.png)

> ⬆️ **Done reading Concepts 5–8?** Read [Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway) too; [Concept 9](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning) waits until just before [Practice 7](#practice-7--grafana-as-files-provisioning-and-a-one-off-grafana_reader-account-40-minutes). After that, do [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes) to [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes) in one sitting.

### 9. Secrets and configuration as files: `.env` and Grafana provisioning

Besides the data in the cupboards, Concept 1 left two things outside the shipping container: the secrets in `.env` and the home's settings in repo files. Grafana is the biggest example: in Module 25 you assembled it by clicking; from Practice 7 on, it's assembled from files.

**Three `.env` files, three readers.**

| File | Read by | Content |
| :--- | :--- | :--- |
| `.env` at the project root ([4.2](#42-git-hygiene-first-gitignore-gitattributes-then-env-with-the-old-postgres-password-5-minutes)) | the central Compose, home mode | all the home's secrets, plus `COMPOSE_FILE`, `IMAGE_REGISTRY`, the counters, and the cupboard names |
| `backend/.env` ([5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes)) | `npm run dev`, dev mode | the backend settings only |
| `edge/.env` ([6.3](#63-pi-the-branch-from-github-edgeenv-bridgecenterconf-and-whats-in-composeedgeyml-8-minutes)) | the gateway Compose on the Pi | `CENTER_ADDRESS`, `PORT_GATEWAY`, `TUNNEL_TOKEN` (empty) |

The backend in a container doesn't read `backend/.env`: its settings come from the root `.env` through `x-backend-settings` (Concept 5). The postgres password (written inside `DATABASE_URL` in `backend/.env`) and `MQTT_PASSWORD` must be the same in both files, because there's only one database and one broker account `backend`.

**The same rules for all three.** Not in Git: `.gitignore` holds back `.env` and `.env.*`, and only `.env.example` goes in, with the line names but no secret values. On Linux, macOS, and the Pi, the file gets mode `600` (`chmod 600 .env`) so that only its owner can read it; Windows doesn't use `chmod` (not tested by the author). The old cupboard's postgres password (4.2), `JWT_SECRET` (5.2), and the Telegram token are kept; the other new secrets are made randomly with the recipe from `.env.example`:

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

The result is 43 characters of only letters, digits, `-`, and `_`. The postgres password is also written inside the database address (`postgres://postgres:<password>@db:5432/smarthome`), so an `@`, `:`, or `/` in the password would break the address, while Compose reads `$` as the start of a variable. A laptop without Node.js runs the same line through `docker run --rm node:24.22.1-alpine3.24 node -e "…"` ([11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes); its quotes weren't tested by the author in PowerShell and CMD).

**One file leaks, everything leaks.** The root `.env` holds the postgres password, the JWT key, the broker password, the `grafana_reader` password, the Grafana admin password, and the Telegram token all at once. Don't paste it into a forum, a GitHub issue, or an AI, nor the output of `docker compose config` without `--quiet` (Concept 5) or of `docker inspect` without `--format` ([🔁 Step 5](#step-5--reading-the-old-containers-settings-with-docker-inspect-without-leaking-passwords)). Compose also has a secrets feature; why this project still uses `.env` is in [🔬](#-technical-deep-dive-optional).

**Grafana from files.** Module 25's Grafana content (the data source, the dashboard, the contact point, and the alert rule) is stored in the `smarthome-grafana-data` cupboard, while the files in the `grafana/` folder are only an archive ([Module 25's 9.2](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes)). `git clone` on a friend's laptop only gives an empty Grafana. **Provisioning** (setting things up from files) turns that around: every time it starts, Grafana installs everything written in the provisioning folder. `compose.cloud.yml` mounts `./grafana/provisioning` and `./grafana/dashboards` as read-only windows (Concept 6), keeping the promise of Module 25's [🔬](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#-technical-deep-dive-optional) *Dashboards as code*. What's in `grafana/provisioning` ([7.1](#71-provisioning-files-the-smarthome-db-data-source-the-dashboard-the-contact-point-and-the-rule-12-minutes)):

| File | Installs | What matters |
| :--- | :--- | :--- |
| `datasources/smarthome.yaml` | the data source `smarthome-db` | its uid (identifying code) fixed as `smarthome-db`, `url: db:5432`, the account `grafana_reader`, `maxOpenConns: 4` (Module 25) |
| `dashboards/smarthome.yaml` | every `.json` in `grafana/dashboards`, into the folder `Mini Smart Home` | `allowUiUpdates: false`, `disableDeletion: true`, `updateIntervalSeconds: 30` |
| `alerting/silent-node.yaml` | the rule `Silent node` | moved from `grafana/alerting/`; `datasourceUid: smarthome-db` |
| `alerting/telegram-contact.yaml` | the contact point `Telegram Smart Home` | the Module 25 template; the token and chat_id from `.env` |
| `plugins/no-plugins.yaml` | an empty plugin list | removes the only `level=error` in Grafana's log |

**A fixed uid.** Panels and rules point to a data source by its uid, not its name. A data source made on screen gets a random uid that differs in every Grafana; the Module 26 file gives it the fixed uid `smarthome-db`, and the dashboard JSON (in 11 places) and `silent-node.yaml` point to that uid. As a result, everything connects at once in any Grafana, including a Grafana with an empty cupboard on a friend's laptop ([11.3](#113--l2-the-default-services-are-up-grafana-from-files-and-sample-history-8-minutes)).

**Why the Module 25 files can't be installed as they are.** The Module 25 JSON export writes the data source as `${DS_GRAFANA-POSTGRESQL-DATASOURCE}`, a blank that the **Import** screen normally fills with the data source you pick. Provisioning doesn't ask, so the blank is installed as it is. In the author's separate test project (an empty cupboard), the dashboard was installed, but the Node variable and all five panels carried a red triangle (`Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found`) and were empty (`No data`). The Module 25 rule YAML is more dangerous: its `datasourceUid` is the random uid of your on-screen data source, which doesn't exist in another Grafana. That rule errors, and Grafana then sends a fake 🔴 (the author's lab, to the mock Telegram server): `🔴 [no value] ([no value]) is not sending data,  minutes behind schedule`. The third trap: a Telegram contact point without a token makes Grafana keep crashing and restarting with `could not find Bot Token in settings`. Telegram has been optional since Module 19, so when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are empty, `compose.cloud.yml` gives the safe defaults `not-set-yet` and `0`: Grafana still starts and alerts are still recorded; only their delivery to Telegram fails.

![Real screenshot of Grafana 13.2.4 in its dark theme in Chrome 156, Linux on a Raspberry Pi 5 playing the laptop, 1280 pixels, from a separate TEST project with empty cupboards: in the provisioning folder only the dashboard file is replaced by the raw Module 25 export; the rule and the contact point stay the Module 26 files, Telegram the lab's mock server. The breadcrumb at the top: Dashboards, Mini Smart Home, System Health (number 5): the dashboard itself was installed from the file into the Mini Smart Home folder. The Node variable at the top left has a red triangle and is empty (number 1); the time picker Last 6 hours WIB, Refresh 1m, Edit. All five panels, RSSI (Wi-Fi signal strength), Uptime (time running), Heap (free memory), Node 2 packets per hour (should be 12), and Minutes behind schedule, each have a red triangle at the left of their title (number 2). The mouse hovers over the triangle of the RSSI panel and the tooltip Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found appears (number 3). In the middle of the panel it says No data (number 4), although the query never reached the database. The fix: every data source uid in the JSON becomes smarthome-db, as in the Module 26 file.](assets/grafana-provisioning-wrong.png)

**Secrets stay in `.env`.** Provisioning files go into Git, so they only hold variable names: `password: $GRAFANA_READER_PASSWORD`, `bottoken: $TELEGRAM_BOT_TOKEN`, `chatid: "$TELEGRAM_CHAT_ID"`. The values flow from `.env` into the `grafana` service's `environment:`, and Grafana reads them inside the container. The form is `$NAME`, not `${NAME}`: according to Grafana's documentation, the braced form can be read twice if the value itself holds a `$`. The database account `grafana_reader` is handled by the one-off service `grafana-account`: created if missing, then its password is synced with `GRAFANA_READER_PASSWORD` at every `up`, so even a new random password is fine.

**"Provisioned" means locked on screen.** Rules and contact points from files carry the **Provisioned** mark, and the contact point's **Edit** button becomes **View**. The dashboard isn't marked in its list, but **Save** is refused with a drawer that starts "This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source." ([7.4](#74--docker-compose-up--d-provisioned-the-test-button-and-a-refused-save-10-minutes)). Its data source is locked too (`editable: false`). That's on purpose: the files in Git become the single source of truth. To change something after Module 26: try it on screen, export it as in 7.3 (a), overwrite its file in `grafana/`, run `docker compose restart grafana`, then commit.

**The old cupboard: take it over first.** Your Module 25 cupboard already holds the `Silent node` rule, the `Telegram Smart Home` contact point, and a data source made on screen. If the files are simply installed on top of it, the on-screen content and the file content get mixed: in the author's research prototype, that contact point held two Telegram integrations, so **every alert was sent twice**. That's why [7.3](#73--the-takeover-delete-the-rule-then-the-contact-point-then-the-old-data-source-10-minutes) does a **takeover** once, in the Grafana that's still running:

1. **Alerting** → **Alert rules**: delete the `Silent node` rule.
2. **Alerting** → **Notification configuration** → **Contact points**: delete `Telegram Smart Home`.
3. **Connections** → **Data sources**: delete `grafana-postgresql-datasource`.
4. `docker compose up -d` with the final `compose.cloud.yml`: the files install all three again.

The order matters because the rule uses the contact point. While the rule still exists, Grafana 13.2.4 refuses to delete the contact point: **Delete** in the **More** menu is grayed out, with the note "Contact point is referenced by one or more alert rules" (through the API: `409` `Receiver is used by 1 rule(s)`). **Notification policies** don't need to be touched. The `System Health` dashboard isn't deleted: the files take it over without making a twin, as long as the dashboard's uid in the JSON equals the uid in the cupboard, that is, your own Module 25 export (the author's lab: `ad6w2nq`; yours differs). The `First panel` from the Module 25 Quick Win loses its data source too ([7.4](#74--docker-compose-up--d-provisioned-the-test-button-and-a-refused-save-10-minutes)). In the author's lab, after the takeover, every silent node got exactly one 🔴 and one ✅.

**The Grafana admin password and key.** `GRAFANA_ADMIN_PASSWORD` (passed on as `GF_SECURITY_ADMIN_PASSWORD`) is only used while the Grafana cupboard is still empty, like `POSTGRES_PASSWORD` in Concept 6: on the Module 25 cupboard, admin still logs in with the old password (the author's lab: the `.env` password refused with `401`). Don't add `GF_SECURITY_SECRET_KEY`: your old cupboard encrypts passwords and tokens with Grafana's default key, and according to its documentation that key can't be changed without filling everything in again.

**Two meanings of provisioning.** In Grafana: installing Grafana's content from files. In [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#3-the-registry-and-simple-provisioning) and Module 28: preparing a new device with its key and its rights. The same name, different jobs.

**Module 25's promise changes.** The rule YAML that used to be an archive now moves from `grafana/alerting/silent-node.yaml` to `grafana/provisioning/alerting/silent-node.yaml` and is really installed; its only content change is `datasourceUid: smarthome-db`.

![Diagram Grafana assembled from files, provisioning (Concept 9, Practice 7). Left, the repo folder grafana/, in Git without secrets: datasources (smarthome-db, fixed uid, db:5432), dashboards (folder Mini Smart Home, allowUiUpdates: false), dashboards/system-health.json (uid = your Module 25 export), alerting/silent-node.yaml (datasourceUid: smarthome-db), telegram-contact.yaml (token $TELEGRAM_BOT_TOKEN), plugins/no-plugins.yaml, grafana-user.sql (the grafana_reader account). Below it .env, not in Git: GRAFANA_READER_PASSWORD, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (empty: not-set-yet, 0), GRAFANA_ADMIN_PASSWORD only for an empty cupboard. Middle, docker compose up -d: the one-off grafana-account syncs the grafana_reader password with .env, grafana 13.2.4 mounts both folders read-only. Right, the result without a click in the same smarthome-grafana-data cupboard: data source smarthome-db, Database Connection OK; dashboard System Health with data, Save refused: This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source; rule Silent node Provisioned, Normal; contact point Telegram Smart Home Provisioned, Used by 1 alert rules; admin, the old password (200), GRAFANA_ADMIN_PASSWORD ignored (401). Bottom middle, the takeover once in the Grafana of Practice 4, before provisioning is mounted: 1 delete the rule Silent node (dashboard changed since Module 25? export it again first); 2 delete the contact point Telegram Smart Home; 3 delete the old data source grafana-postgresql-datasource (First panel of the Module 25 Quick Win breaks too: delete it or change its data source first); 4 docker compose up -d, the files replace the rule, the contact point, the dashboard. The wrong order is refused: on screen the contact point Delete is grayed out, tooltip Contact point is referenced by one or more alert rules; API: 409 Receiver is used by 1 rule(s); without the takeover every alert is sent twice. Not deleted: the System Health dashboard is taken over when the uid in your JSON = the uid in the cupboard (the author's lab ad6w2nq), a JSON with another uid can make two dashboards with the same name; the notification policies stay default. Bottom, traps: the random uid of the raw file, red panels Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found and a false 🔴 from the rule; an empty token, Grafana crash-loops with could not find Bot Token in settings; changing after Module 26: try it on the screen, export, overwrite the file, docker compose restart grafana, commit.](assets/grafana-from-files.png)

> ⬆️ **Done reading Concept 9?** Continue to [Practice 7](#practice-7--grafana-as-files-provisioning-and-a-one-off-grafana_reader-account-40-minutes). The takeover order in [7.3](#73--the-takeover-delete-the-rule-then-the-contact-point-then-the-old-data-source-10-minutes) is the same as in the picture above.

### 10. Two files until the end: the center and the gateway

The Syllabus promises **two Compose files used until the end**, and your project now has them. **The center** runs the home's brain. **The gateway**, this module's word for the Pi, runs the broker the devices connect to. The split is exactly the Module 26 row of the [Syllabus §2.2](../../SYLLABUS.md#22-where-the-brain-runs-over-time) table: the broker on the Pi, the brain on the laptop, still on the home network.

| | The center | The gateway |
| :--- | :--- | :--- |
| File, started from | `compose.cloud.yml`, the project root | `edge/compose.edge.yml`, the `edge` folder |
| Compose project | `smarthome` | `smarthome-gateway` |
| Runs on | the laptop (Module 27: a VPS) | the Raspberry Pi, Kit B |
| Default services | `db`, `broker-account`, `mosquitto`, `migrate`, `backend`, `web` (Caddy), `grafana-account`, `grafana` | `mosquitto` (the gateway broker + the bridge) |
| With a profile, off | `uptime-kuma` (profile `monitoring`) | `cloudflared` (profile `tunnel`), `nodered` (profile `nodered`) |

That's the Syllabus's list: the center = Mosquitto, the API, the database, Grafana, the web with Caddy, and Uptime Kuma; the gateway = Mosquitto with the bridge, cloudflared, and optional Node-RED. Grafana stays next to the database: [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway) called moving it to the Pi "the work of Modules 26–27", and Grafana only lives on the Pi if you choose Module 27's free path, which runs the whole center on the Pi. The gateway only uses official multi-architecture molds, so the Pi doesn't need your own molds.

**A profile: a switch inside the file.** A service marked with `profiles:` is already written, but stays off until its profile is named:

```yaml
  uptime-kuma:
    image: louislam/uptime-kuma:2.5.8-slim
    profiles: ["monitoring"]
    # …
```

`docker compose --profile monitoring up -d` starts it, and `docker compose --profile monitoring down` stops the whole home, Uptime Kuma too. Without `--profile`, `down` leaves Uptime Kuma running, and its hallway too (`Resource is still in use`, the author's lab). Why write it now? So that both files are complete from Module 26 on, without downloading or starting anything before its time: Uptime Kuma is only set up in [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data) (the author's lab: ±196 MiB of RAM, not pulled by `docker compose pull` without its profile); cloudflared needs Module 27's Cloudflare token (`TUNNEL_TOKEN` deliberately empty, its profile isn't started in this module); Node-RED stays the Module 13 systemd service (moving it into a container: [🔬](#-technical-deep-dive-optional)). [🧩 Level 2](#level-2--uptime-kuma-the-monitoring-profile-and-one-monitor-through-a-service-name-fill-in-the-blanks-40-minutes) starts `monitoring` with one monitor; [🧩 Level 3](#level-3--the-simulator-in-a-container-the-simulation-profile-in-an-extra-compose-file-from-scratch-6090-minutes) makes its own profile.

> [!NOTE]
> **A note on terms.** The Syllabus first wrote that you would understand "the two 'profiles' that will be used until the end". It meant these two Compose files, not the `profiles:` feature above. Because the two are easily mixed up, Syllabus v1.0.28 writes it as "two Compose files", and this module uses the word **profile** only for the service switch.

**The first LAN bridge.** On the Kit B path, Node 1 still connects to the Pi's IP on port 1883 with its old account, so the firmware doesn't change; only the broker on the Pi changes, from an apt package to a container. Its data reaches the backend on the laptop through **the bridge**: the gateway broker opens one connection to the central broker as a client with the account `pi-bridge`, then passes on the chosen topics. The content of `edge/bridge.example.conf` without comments (`# …` = the password line):

```text
connection center
address center:1883
remote_clientid pi-bridge
remote_username pi-bridge
# …
topic msh/+/telemetry out 1
topic msh/+/status out 1
topic msh/+/vitals out 1
topic msh/+/ack out 1
topic msh/+/cmd in 1
```

- `out` = up from the gateway to the center, `in` = down to the gateway (the backend's commands); `1` = QoS 1. On the central broker, the `7) pi-bridge` block in `edge/acl-broker` lets that account write the four upward topics and read `msh/+/cmd` ([Module 21's ACL](../../phase-3-backend-data/module-21-device-broker-security/README.md#7-the-access-control-list-acl-every-device-on-its-own-topic)); each device is still checked by the gateway broker with its old block.
- Mosquitto doesn't read variables in a `.conf`, so Compose points the name `center` at the laptop's IP through `extra_hosts` `center:${CENTER_ADDRESS}`. The laptop's IP can change, as in [Module 23's phone mode](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode), and the bridge breaks with it: reserve a fixed address in the router, like the Pi in Module 12.
- `remote_clientid` keeps the bridge client's name fixed, even when its container is recreated. The copy with the password, `edge/bridge/center.conf`, doesn't go into Git.

In the author's lab, the central broker logged `New bridge connected from <IP>:<port> as pi-bridge (p4, c0, k60, u'pi-bridge').`, and a lamp command sent through the API went through the center, the bridge, and the gateway, then came back as an `ack` in 17 milliseconds ([6.5](#65--start-the-gateway-connecting-bridge-on-the-pi-and-new-bridge-connected-on-the-laptop-10-minutes), [6.6](#66--l4-node-1-connects-with-its-old-account-live-data-on-the-dashboard-and-the-lamps-ack-12-minutes)).

**The first bridge's honest limits.** No TLS yet: messages and passwords travel over the Wi-Fi without encryption, and port 8883, promised since Module 11, waits for Module 27, so the broker must not be opened to the internet through port forwarding. It doesn't hold data yet: the bridge reconnects by itself, but telemetry sent while the center is down is lost (the author's research prototype); laptop asleep = Kit B readings aren't recorded. A bridge that stores messages and passes them on later (store-and-forward) is the core of Module 27.

**Mosquitto 2.1.2 on both sides.** The Module 12 Pi uses Mosquitto 2.0.21 from apt, and the Module 11 Windows and macOS laptops use 2.1.2. A 2.0 broker can't read a password file made by 2.1 (the author's lab: `Connection Refused: not authorised`), while 2.1.2 reads both. That's why the center and the gateway both use `eclipse-mosquitto:2.1.2-alpine`, and the gateway uses the Pi's old password file as it is, copied into its data cupboard (6.4): Node 1 and Node-RED log in with their old accounts.

**Home mode and dev mode.** The center runs `backend` and `web` in containers: **home mode**, at `http://localhost`. When changing code, you use **dev mode** as in Modules 16–25 (`npm run dev` and Vite) against `db` and the central broker ([5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes)). The rule: **only one backend**. To switch: `docker compose stop backend web`, then `npm run dev`. To go back: **Ctrl + C**, then `docker compose start backend web`. Two backends at once kick each other off the broker (`session taken over`), and Telegram refuses one of them with `409 Conflict` (the author's lab, mock Telegram: the losing bot doesn't recover by itself).

**After Module 26: still these two files.** Module 27 moves the center to a VPS with a domain and HTTPS through Caddy, upgrades the bridge to TLS that holds data while the internet is down, and installs the dashboard as an app on the phone (PWA); its free path runs everything on the Pi with Cloudflare Tunnel (the `tunnel` profile). [Module 29](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) builds and pushes the images automatically for two kinds of processors. Module 30 starts Uptime Kuma and automatic backups. The Caddyfile, `edge/*.conf`, `edge/acl-broker`, and Grafana's provisioning files (Concept 9) are only supporting configuration mounted as windows, not a third Compose file.

![Diagram two files until the end, the center and the gateway (Concept 10), also the state of the project after Module 26. Left: Node 2 Garden v1.0.0 over ESP-NOW to Node 1 Home v1.6.0, firmware unchanged, still to 192.168.1.37:1883 with the old account. Raspberry Pi gateway 192.168.1.37: edge/compose.edge.yml, project smarthome-gateway; the gateway mosquitto (eclipse-mosquitto:2.1.2-alpine, counter 1883 for the devices, files gateway.conf, acl-broker, bridge/center.conf not in Git, a cupboard with the Pi's old password file); faded: cloudflared profile tunnel and nodered profile nodered, off; Node-RED systemd stays, not a container; the apt package mosquitto turned off. Middle, the LAN bridge plain 1883, no TLS yet, account pi-bridge: out QoS 1 msh/+/telemetry, status, vitals, ack; in QoS 1 msh/+/cmd; remote_clientid pi-bridge kept; center down = messages lost, holding messages in Module 27; CENTER_ADDRESS in edge/.env = the laptop IP. Right, the center laptop 192.168.1.10: compose.cloud.yml, project smarthome, one docker compose up -d; the central mosquitto to backend 1.3.0 to db; web 1.2.0 Caddy to backend; grafana 13.2.4 to db; uptime-kuma profile monitoring off; one-offs broker-account, migrate, grafana-account; the external cupboards smarthome-data and smarthome-grafana-data. Bottom middle: the browser http://localhost and :3000, a phone through phone mode; Telegram over outgoing HTTPS, the token only in .env; one backend only, home mode or dev mode (stop backend web, then npm run dev), two backends kick each other off the broker. Bottom left, GitHub branch feature/docker-compose, pull request The whole system in Docker Compose, 16 rows of files: Compose 9 services (uptime-kuma in profile monitoring), .env.example, the Dockerfiles and the Caddyfile, backend 1.3.0 (99 tests pass), frontend 1.2.0, Grafana provisioning, edge (compose.edge.yml, center.conf, bridge, edge/.env.example, bridge/README.md, acl-broker), scripts/fingerprint.sql, .gitignore, the PR template; unchanged: data contract 1.4, firmware, migrations. Never in Git: .env, edge/.env, edge/bridge/center.conf, backup/, the cupboards' contents. Bottom right, coming later: Module 27 VPS, HTTPS, MQTT TLS 8883, a bridge that holds messages; Module 29 GitHub Actions, multi-architecture images; Module 30 Uptime Kuma, automatic backups, runbooks. Honestly: a sleeping laptop = everything sleeps; a password guesser can lock out every web visitor; an image only for the architecture that built it; Docker Desktop not tested yet.](assets/two-files-center-gateway.png)

> ⬆️ **Done reading Concept 10?** If Concepts 5–8 are done too, do [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes) to [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes) in one sitting, then [Practice 6](#practice-6--the-pi-gateway-kit-b-docker-engine-edgecomposeedgeyml-and-a-lan-bridge-70-minutes-laptop-path-25-minutes) (Kit B) or [6.7](#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes) (the laptop path).

### 11. The image shop: GHCR and architecture

The Syllabus calls a registry [the "store" where those packages are kept](../../SYLLABUS.md#12-mini-glossary-terms-that-appear-in-this-syllabus). The official molds have come from the Docker Hub shop since Module 17, but your own two molds only exist on your laptop, so a friend's laptop has to build them itself. **GHCR** (GitHub Container Registry, `ghcr.io`) is GitHub's shop: you drop molds off there (push), and others pick them up (pull). In Module 26 everything is done by hand ([Practice 10](#practice-10--the-image-shop-ghcr-by-hand-35-minutes)); Module 29 automates it.

**The shelf address.** A mold's full name in the shop, `ghcr.io/<lowercase-account>/mini-smart-home-backend:1.3.0`, is made of the shop, your shelf (your GitHub account name in lowercase), the mold's name, and the tag, which is the version in `package.json` (web: `mini-smart-home-web:1.2.0`); never `latest`. Compose puts it together from `IMAGE_REGISTRY` in `.env` (Concept 5). It isn't a secret: write it in your own `.env.example`, so that a friend's laptop pulls your images at once. Capital letters are refused: `docker compose config --quiet` stays silent, but `up` stops with `invalid reference format: repository name (…) must be lowercase` (the author's lab). The account `Budi-Santoso` is written `ghcr.io/budi-santoso`.

**The shop's key: a classic PAT.** According to GitHub's documentation, GHCR only accepts a personal access token (PAT) of the classic kind, a sort of special password for tools. Give it only the `write:packages` permission; if the GitHub page also ticks `repo`, untick it. Pick a short expiration, keep it in your password manager, then run `docker login ghcr.io -u <account>` and paste the token when asked ([10.1](#101-a-github-token-classic-pat-with-writepackages-without-repo-7-minutes)).

**Private first, public forever.** A package's first upload to GHCR is always private. So that a friend's laptop can pull without `docker login`, make it public through **Package settings** → **Change visibility** → **Public**. This step is one-way ("Once you make a package public, you cannot make it private again."), and a public mold can be taken apart by anyone, so `.dockerignore` (Concept 3) and `docker history --no-trunc` ([10.3](#103-check-docker-history-then-make-the-package-public-8-minutes)) are checked first. The `LABEL org.opencontainers.image.source` line in both `Dockerfile`s links the package to your repo. GHCR storage and transfer are **free for now**, public or private ([Syllabus §5.5](../../SYLLABUS.md#55-service-costs-phase-5)); GitHub promises at least a month's notice before the rules change.

**One mold, one kind of processor.** Official molds hold versions for several architectures (Concept 2), but `docker build` only makes a mold for the processor of the machine that builds it: an Intel or AMD laptop = `linux/amd64`; an Apple silicon Mac, a Snapdragon laptop, and a 64-bit Pi = `linux/arm64`. Check your machine with `docker version --format '{{.Server.Arch}}'` (the author's lab: `arm64`). A mold made on a Pi or a Mac and pulled by an Intel laptop is refused (the author's lab, `docker pull --platform linux/amd64` from the mock shop):

```text
Error response from daemon: no matching manifest for linux/amd64 in the manifest list entries: no match for platform in manifest: not found
```

The way out in Module 26: a friend with a different processor builds them with `docker compose up -d --build`, which takes longer and needs npm downloads (not yet tested by the author on an amd64 laptop; [10.4](#104-architecture-arm64-versus-amd64-and-a-way-out-for-a-friends-laptop-7-minutes)). One image for two architectures is made automatically in Module 29; a peek at the manual command is in [🔬](#-technical-deep-dive-optional).

**What the author recorded.** The author's lab used a mock GHCR (`registry:3.1.2` at `127.0.0.1`, without an account): pushing both molds took 3.7 seconds, and the clean-laptop test that pulled them (warm: the official images already there) reached the **Login** page in 62.3 seconds ([11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes)). The PAT, `docker login ghcr.io`, the package page, and pulling without logging in from a public GHCR weren't recorded; the GitHub menu names are taken from its documentation.

![Diagram the image shop, from your laptop to a friend's laptop (Concept 11, Practices 10–11). Top, four steps: 1 your laptop builds, IMAGE_REGISTRY=ghcr.io/account in .env (all lowercase), docker compose build, the result …/mini-smart-home-backend:1.3.0 and …-web:1.2.0, before pushing check .dockerignore and docker history --no-trunc without passwords; 2 into the shop, a classic PAT token with only write:packages (untick repo if it comes along), a short expiry, docker login ghcr.io -u account, docker compose push backend web; 3 GHCR, the first package is always private, Package settings, Change visibility, Public, CANNOT be undone, LABEL org.opencontainers.image.source links the package to the repo, GHCR currently free, public and private; 4 a friend's laptop, git clone, .env with the same IMAGE_REGISTRY, docker compose up -d pulls the backend and web images without a login and the official images from Docker Hub, no Node.js and no build, if the processor is the same. The author's lab: GHCR played by registry:3.1.2 on 127.0.0.1, docker compose push 3.7 s; the login, the package page, and public GHCR not recorded. Middle, a mold is made for one processor type: an Intel or AMD laptop linux/amd64; Mac Apple silicon and Windows Snapdragon linux/arm64; Raspberry Pi 64-bit OS linux/arm64 (the author's lab: a Pi 5 with Ubuntu 26.04); check the machine docker version --format {{.Server.Arch}}, check an image docker image inspect --format {{.Os}}/{{.Architecture}}; the official images TimescaleDB, Grafana, Mosquitto, Caddy are multi-architecture. An image built on a Pi or a Mac (arm64) pulled by an Intel laptop: docker pull --platform linux/amd64 fails, Error response from daemon: no matching manifest for linux/amd64 in the manifest list entries: no match for platform in manifest: not found (recorded against the stand-in registry). The Module 26 remedy: the friend's laptop builds them itself with docker compose up -d --build, takes time and npm downloads, not tested by the author on an amd64 laptop; one image for both architectures = Module 29. Bottom: image: + build: in the same service, Compose pulls first, an image not in the shop gives a warning and then Compose builds it itself (proven), that's why IMAGE_REGISTRY is required and has no default, so that Compose doesn't pull someone else's image with the same name; frequent errors: required variable IMAGE_REGISTRY is missing a value means the .env line is not filled in, invalid reference format … must be lowercase means the account name must be lowercase.](assets/image-shop-and-architecture.png)

> ⬆️ **Done reading Concept 11?** Continue to [Practice 10](#practice-10--the-image-shop-ghcr-by-hand-35-minutes) (optional) and [Practice 11](#practice-11--the-clean-laptop-test-45-minutes). If you read it earlier, go back to the practice you're working on.

## 🔧 Step-by-step practice

Practices 1–8 and 11 are required; Practice 6 is required for Kit B, while the laptop path replaces it with [5.5](#55--live-data-through-the-central-broker-the-simulator-the-mock-garden-and-the-lamp-button-7-minutes) (and, if you like, [6.7](#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)). The steps marked ⭐ (1.2, 2.4, 3.4, 4.3, 4.4, 4.5, 5.3, 5.4, 5.5, 6.4, 6.5, 6.6, 7.3, 7.4, 8.1, 8.4, 11.2, 11.3, and 11.4) are the proof, plus [➕ E](#e--merge-featuredocker-compose-into-main-with-the-pull-request-the-whole-system-in-docker-compose). Practice 9 (backups) is optional but highly recommended, and Practice 10 (the image shop) is the suggested way, so that a friend's laptop just pulls your images. Also fine to skip: the optional parts of 8.5 and 9.4, 🔬, and 🧩. The pass requirement: **L1** in 11.2, **L2** in 11.3, **L3** in 8.4 and 11.4, **L4** in 6.6 (laptop path: 5.5).

Every central `docker compose` runs from the **project root** (the `mini-smart-home` folder, where `compose.cloud.yml` will be); only Practice 6 uses the `edge` folder on the Pi. Before 1.2 your home runs in dev mode (`npm run dev`); from 5.3 on in home mode, and how to switch is in 5.6. Practices that change files end with a commit; the `feature/docker-compose` branch is pushed to GitHub in 6.2 (so the Pi can fetch the gateway files) and 11.1 (before the clean-laptop test), then merged into `main` through a pull request in ➕ E. For comparison: [`code/stages/`](code/stages/) holds `compose.cloud.yml` at the end of Practices 4 and 5, and [`code/`](code/) holds the final result (with `backend-1.3.diff` and `frontend-1.2.diff`). Don't overwrite your whole folder with it.

> [!IMPORTANT]
> **The move: the old home stops at 1.2 and only starts again at [5.3](#53--one-command-starts-the-whole-home-docker-compose-up--d---build-and-ps--a-10-minutes)** (device path: Node 1's data only reaches the backend again at 6.6). Meanwhile no readings are recorded, and the old Grafana rule sends a real 🔴 "Silent node". That's normal; ✅ comes by itself after the data is back (proven in the author's lab). Practices 2 and 3 don't need the home switched off, so split it like this: **1.1 → Practice 2 → Practice 3** (the old home keeps running), then **1.2–1.4 → Practice 4 → Practice 5 in one sitting**, ±2.5 hours.

### Practice 1 — The workbench and the old data's fingerprint (20 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: a terminal at the **project root** (Git and `docker`) plus the `backend`, `frontend`, and (laptop path) `tools` terminals of the old home; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana` running; **Chrome** or **Edge** (Grafana `http://localhost:3000`); **Telegram**. Concepts used: 1 and 6.
>
> ⭐ **Required** — step 1.2: the history fingerprint row saved in your notes, taken after the backend (and the simulator) stopped.

#### 1.1 The `feature/docker-compose` branch and the moving plan (3 minutes)

In the project-root terminal, get the latest `main`, then create a branch for all the Module 26 work:

```text
git switch main
git pull
git switch -c feature/docker-compose
```

**Expected output** (the last line): `Switched to a new branch 'feature/docker-compose'`. `git status` afterward must be clean. The moving plan: the box **The move** above; set aside ±2.5 hours without a break for 1.2 to Practice 5.

> ➡️ **Stop here for now.** Your old home keeps running while you make the two molds: read Concepts 2–4, do [Practice 2](#practice-2--the-backend-130-mold-45-minutes) and [Practice 3](#practice-3--the-web-120-mold-vite--caddy-45-minutes), then read Concepts 5–8 and [Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway) before coming back to [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes).

#### 1.2 ⭐ Stop the data writers, then take the history's fingerprint with `scripts/fingerprint.sql` (8 minutes)

Only the backend writes readings into the database. Press **Ctrl + C** in:

1. the `backend` terminal (`npm run dev`) → `SIGINT received: the backend is stopping gracefully` (the author's lab; it doesn't show on Windows, Module 19 6.10);
2. the `frontend` terminal (Vite): without the backend, the old dashboard is no use;
3. laptop path: the `tools` terminal (the simulator and the mock Garden). Kit B: Node 1 and the Pi broker may keep running.

`smarthome-db` and `smarthome-grafana` **stay running**: they're the ones being checked. In the VS Code Explorer, create a folder **`scripts`** at the project root (**New Folder…**), then a file **`fingerprint.sql`** inside it (**New File…**), paste this content, and save (**Ctrl + S**):

```sql
-- fingerprint.sql - the Mini Smart Home history "fingerprint" (Module 26): one row of numbers that proves the history
-- in the database was NOT lost and did NOT change after the move into Docker Compose (Practices 1 and 4) or after
-- "docker compose down" then "up" (Practice 8). Based on the Module 18 Practice 7.2 query, plus the number of accounts and devices.
--
-- Run it BEFORE and AFTER, with the backend and the simulator stopped (no new readings in between), from the project root.
-- Save its output to a file, then compare:
--   Linux, macOS, Pi (bash/zsh):
--     docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
--   PowerShell (Windows; not tested by the author):
--     Get-Content scripts/fingerprint.sql | docker compose exec -T db psql -U postgres -d smarthome
--   Before Module 26 (the old container smarthome-db): replace "docker compose exec -T db" with "docker exec -i smarthome-db".
-- (-T / -i = the content of this file is sent to psql through standard input, without a terminal screen in the container.)
--
-- What decides: the readings and fingerprint columns MUST be exactly the same (accounts and devices too). The summaries column may
-- differ without any data being lost: a TimescaleDB background job (see the jobs column) can summarize the hourly summary
-- book again between two measurements.
SELECT (SELECT count(*) FROM readings) AS readings,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS fingerprint,
       (SELECT count(*) FROM readings_hourly) AS summaries,
       (SELECT count(*) FROM show_chunks('readings')) AS chunks,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS jobs,
       (SELECT count(*) FROM users) AS accounts,
       (SELECT count(*) FROM devices) AS devices;
```

The first five columns = the proof query of [Module 18's 7.2](../../phase-3-backend-data/module-18-timescaledb/README.md#72-the-original-databases-fingerprint): `readings` (the number of `readings` rows), `fingerprint` (the md5 of every row, sorted by device and time; change one number, and the fingerprint is different), `summaries`, `chunks`, and `jobs`. The new columns: `accounts` and `devices` (every `devices` row). Before Compose, run it from the project-root terminal (bash/zsh: Linux, macOS):

```text
docker exec -i smarthome-db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

`<` sends the file's content to `psql` through `-i`. PowerShell (not tested by the author):

```text
Get-Content scripts/fingerprint.sql | docker exec -i smarthome-db psql -U postgres -d smarthome
```

**Expected output** (the author's lab; your numbers will differ):

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2318 | aa2aa442bf9868ca730b42ccab4cffba |       379 |      9 |    3 |        2 |       3
(1 row)
```

In the lab: 2 × 1,132 rows of sample history + 54 simulator readings, the admin and viewer accounts, three devices. Copy the column headings and the row (not with `>`) into `learn-iot/module-26/fingerprint.md`, under the heading "Before the move" with its time (WIB).

Later, what decides: `readings`, `fingerprint`, `accounts`, and `devices` are **exactly the same**. `summaries` may change without data being lost, because a TimescaleDB background job can summarize the hourly summary book again in between (the author's lab: 379 became 145, without a single reading lost). This row is only compared in [4.5](#45--the-fingerprint-after-equals-the-one-before-then-check-grafana-in-the-same-cupboard-12-minutes). Don't go past 07:00 WIB before 4.5: Module 18's daily retention can drop old binders. `scripts/` is only committed in 4.6.

**You pass this ⭐ step** when the backend (and the simulator) have stopped, and the full fingerprint row is saved in `fingerprint.md`.

#### 1.3 Grafana's fingerprint: dashboards, rules, contact point, and the Test button (5 minutes)

In Chrome, open `http://localhost:3000`, log in as `admin` with your old password, then write down in `fingerprint.md`:

- **Dashboards**: `System Health` (folder `Mini Smart Home`) and `First panel` (the Module 25 Quick Win).
- **Alerting → Alert rules**: `Silent node` in the group `node-health`, `Normal` or already `Firing` (that's normal, see below).
- **Alerting → Notification configuration → Contact points**: `Telegram Smart Home`.
- **Connections → Data sources**: `grafana-postgresql-datasource`.

On the `Telegram Smart Home` row, click **Edit** → **Test** → **Send test notification**, and write down the time.

**Result:** `Test notification sent successfully`, then `🔴 Notification test` arrives from your bot (the author's lab: a second later at the mock Telegram server). About six minutes after the backend stopped, a 🔴 arrives for each device (the author's lab, mock Telegram):

```text
🔴 Practice living room (f00d00000001) is not sending data, 5.9 minutes behind schedule
```

That's the sign of the move. These Grafana notes are compared again in 4.5 and 7.4.

#### 1.4 Disk space with `docker system df`, without prune (4 minutes)

```text
docker system df
```

**Expected output** (the author's lab, example; the machine holds leftovers of other labs):

```text
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          9         5         7.259GB   6.038GB (83%)
Containers      10        5         401.4kB   176.1kB (43%)
Local Volumes   36        11        436MB     215.6MB (49%)
Build Cache     94        0         1.99GB    572.3MB
```

`RECLAIMABLE` is only Docker's estimate of what could be thrown away. This module never uses prune (safety rule 3); old things are removed one by one, by name. Then check the remaining disk: `df -h /` (Linux, macOS; the `Avail` column) or File Explorer → **This PC** (Windows, not recorded by the author). You need ±6 GB free; write down both.

> ⬆️ **Done with Practice 1?** Your fingerprint is recorded and the old home is stopped: continue straight to [Practice 4](#practice-4--the-cupboards-move-the-database-and-grafana-into-compose-without-losing-data-50-minutes). Haven't done Practices 2 and 3 (right below) yet? Do them now; neither uses the database.

### Practice 2 — The backend 1.3.0 mold (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: the `backend` terminal of the old home (it may keep running; after 1.2 leave it off), one free terminal in the **`backend`** folder for `npm` and Git (right-click the `backend` folder → **Open in Integrated Terminal**), and a terminal at the **project root** for `docker`; **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux); internet for `npm`. This practice doesn't touch the database. Concepts used: 2, 3, and 4.
>
> ⭐ **Required** — step 2.4: the `mini-smart-home-backend:1.3.0` mold built from the project root, its size shown in `docker image ls`, and a `docker history --no-trunc` without passwords or tokens.

The backend moves up to **1.3.0** with three small changes, without a migration or a new npm package, then gets packed into your first mold. Its final state: [`code/backend/`](code/backend/); all its changes: [`code/backend-1.3.diff`](code/backend-1.3.diff). **How to copy:** type the snippets shown, or open the file of the same name in `code/backend/` on GitHub, click **Copy raw file**, then paste it over the content. The old backend that's still running (`npm run dev`) restarts by itself every time a `src/` file is saved; let it.

#### 2.1 Backend 1.3.0: `pino-pretty` moves, npm scripts without a required `.env`, and a log without `/health` (10 minutes)

**(a) `pino-pretty` into `dependencies`.** This log prettifier is used while the server runs, so it must not stay behind in the kitchen ([Concept 4](#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy)). In the free terminal (the `backend` folder):

```text
npm install --save-prod pino-pretty@13.2.0
```

**Expected output** (the author's lab):

```text
npm warn idealTree Removing devDependencies.pino-pretty in favor of dependencies.pino-pretty

up to date, audited 226 packages in 5s

56 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

That `npm warn` is what we asked for: `pino-pretty` changes block. `up to date` = nothing was downloaded. In `package-lock.json`, 12 `"dev": true` lines disappear (`pino-pretty` and its 11 helper libraries now go to production), without a single version changing.

**(b) Four scripts without a required `.env`** ([Concept 3](#3-the-molds-recipe-dockerfile-and-dockerignore)). Open `backend/package.json`. In the `"scripts"` block, change `--env-file=.env` to `--env-file-if-exists=.env` in `start`, `migrate`, `seed-history`, and `users`, then save (**Ctrl + S**). `dev` **stays** `--env-file=.env` because dev mode really must have a `.env`. The result:

```json
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.ts",
    "start": "node --env-file-if-exists=.env src/server.ts",
    "check": "tsc --noEmit",
    "migrate": "node --env-file-if-exists=.env src/db/migrate.ts",
    "seed-history": "node --env-file-if-exists=.env src/db/seed-history.ts",
    "users": "node --env-file-if-exists=.env src/db/manage-users.ts",
    "test": "vitest run"
  },
```

**(c) A log without the `/health` knocks.** In Compose, the health check knocks `HEAD /health` every 15 seconds ([Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs)): 5,760 identical lines every day, and the important lines drown. Replace the content of `src/services/log.ts` with [`code/backend/src/services/log.ts`](code/backend/src/services/log.ts) (**Copy raw file**). The only new part is a pure function at its end, under four lines of "why" comments:

```ts
// …
export function shouldLog(method: string, url: string, code: number): boolean {
  const path = url.split("?")[0]; // without the ?… behind it
  const healthKnock = (method === "GET" || method === "HEAD") && path === "/health";
  return !(healthKnock && code < 400);
}
```

A `/health` that **fails** is still logged, so the problem shows. Its user is one line in the `onResponse` hook. Replace the content of `src/server.ts` with [`code/backend/src/server.ts`](code/backend/src/server.ts) (**Copy raw file**); the only changes are the header comment, the import, one line in the hook (and its two comment lines), and the description and `version: "1.3.0"` in `/docs`:

```ts
import { useLog, shouldLog } from "./services/log.ts";
// …
app.addHook("onResponse", async (req, reply) => {
  // …
  if (!shouldLog(req.method, req.url, reply.statusCode)) return;
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
```

Two more files through **Copy raw file**: [`src/services/log.test.ts`](code/backend/src/services/log.test.ts) (NEW: right-click `src/services` → **New File…**; 3 tests for that rule, including look-alike addresses such as `/healthz`) and [`src/auth/security.ts`](code/backend/src/auth/security.ts) (only the `OPEN_ROUTES` comment is updated).

**The version number and the tests.** In the free terminal, one by one:

```text
npm pkg set version=1.3.0
```

```text
npm install
```

`npm pkg set` prints nothing and only changes `package.json`; `npm install` brings `package-lock.json` in line (without it, in the author's lab that file still said `1.2.0` in two places). **Result:** `up to date, audited 226 packages in 5s` … `found 0 vulnerabilities`. Then:

```text
npm run check
```

```text
npm test
```

**Expected output** (the author's lab, cut):

```text
> mini-smart-home-backend@1.3.0 check
> tsc --noEmit
```

```text
 Test Files  15 passed (15)
      Tests  99 passed (99)
```

Backend 1.2.0 had 14 files / 96 tests; the addition is the 3 tests of `log.test.ts`. Anything red? Compare your files with `code/backend/`.

#### 2.2 `.dockerignore`: secrets and `node_modules` stay out of the mold (5 minutes)

In the Explorer, right-click the **`backend`** folder → **New File…**, name it **`.dockerignore`** (starting with a dot, no extension), fill it with this file (**Copy raw file** from [`code/backend/.dockerignore`](code/backend/.dockerignore)), then save:

```text
# .dockerignore - files that are NOT sent to docker build (Module 26). A shared image (public GHCR) can be taken apart by
# anyone, layer by layer: secrets must not get in, not even into a stage that is thrown away later.
# Libraries from npm install on the laptop: never copied into the image (the Dockerfile installs its own: npm ci --omit=dev);
# left out so that the build context stays small.
node_modules
# The dev-mode secrets (.env) and their copies; only the example (.env.example) may go in.
.env
.env.*
!.env.example
# Database photocopies, the Bruno collection, the load test, and the Module 20 curl test files (they hold passwords and cookies).
backup
bruno
test
login*.json
cookies*.txt
# Vitest test files aren't used by the running server.
src/**/*.test.ts
```

Its shape is like `.gitignore`: one pattern per line, `#` a comment, `!` an exception. It lives in the `backend` folder, the folder sent as the build context in 2.4. Three groups are held back, for the reasons in [Concept 3](#3-the-molds-recipe-dockerfile-and-dockerignore): your laptop's `node_modules` (made again inside the mold), everything that holds passwords, tokens, or cookies (`.env`, `backup`, `bruno`, `test`, `login*.json`, `cookies*.txt`), and the Vitest test files. `.env` stays on your laptop for dev mode; it just doesn't go into the mold.

#### 2.3 A two-stage `Dockerfile`, block by block (10 minutes)

Right-click **`backend`** → **New File…**, name it **`Dockerfile`** (capital D, no extension), fill it in (**Copy raw file** from [`code/backend/Dockerfile`](code/backend/Dockerfile)), then save:

```dockerfile
# Dockerfile - the backend image (mold) of Mini Smart Home 1.3.0 (Module 26). Two stages ("multi-stage"):
#   stage "packages": installs the npm libraries exactly as package-lock.json says, WITHOUT the developer tools (TypeScript, Vitest, Vite)
#   final stage     : Node.js 24 + the libraries from the "packages" stage + the src/ and migrations/ code, running as the user "node" (not root)
# No compile stage: Node 24 runs the .ts files directly (type stripping, Module 16).
# Built from the project folder with: docker compose build backend   (or: docker build -t mini-smart-home-backend:1.3.0 ./backend)

# An exact tag, not "latest" or "24-alpine": the same mold today and next month. Alpine = the smallest Node image;
# bcrypt ships a ready-made build for Alpine (musl), so no compiler is needed.
FROM node:24.22.1-alpine3.24 AS packages
WORKDIR /app
# package*.json is copied BEFORE the code: as long as the library list doesn't change, the "npm ci" layer comes from the cache
# and a rebuild after changing the code takes only a few seconds.
COPY package.json package-lock.json ./
# --omit=dev: the developer tools stay out. Since 1.3.0, pino-pretty is in "dependencies" because it's used while the server runs
# (without it the server in the container fails: unable to determine transport target for "pino-pretty"). The npm cache doesn't
# need cleaning: this stage is thrown away, only the node_modules folder is carried to the final stage.
RUN npm ci --omit=dev

FROM node:24.22.1-alpine3.24
# Links the image on GHCR to your GitHub repository (Module 26 Practice 10). Replace <account> with your GitHub account name
# (lowercase) and mini-smart-home with your repository's name if it's different. Without this label, the GHCR package isn't linked.
LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=packages /app/node_modules ./node_modules
COPY package.json ./
COPY migrations ./migrations
COPY src ./src
# The user "node" (uid 1000) already exists in the node image. The server needs no root rights: if there's a hole, the damage is smaller.
USER node
# Only a note: "this server listens on 8080 inside the container". The counter on the laptop is set by compose.cloud.yml (ports).
EXPOSE 8080
# The list (exec) form, not "npm start": Docker's stop signal (SIGTERM) goes straight to Node, so the backend stops
# gracefully. No --env-file: in a container, the settings come from Docker Compose (environment), not from .env.
CMD ["node", "src/server.ts"]
```

Read its comments from top to bottom. What to take away:

- **Two `FROM`s, two stages.** `FROM … AS packages` is the kitchen: only `package.json`, `package-lock.json`, and `npm ci --omit=dev`. The second `FROM` is the serving table, starting again from a clean base mold; because it has no name, the build log calls it `stage-1`.
- **`COPY --from=packages`** takes the `node_modules` cooked in the kitchen; the rest of the kitchen stays behind. Then come `package.json`, `migrations/`, and `src/`: what changes most often goes at the bottom ([Concept 2](#2-a-mold-in-layers-image-tag-digest-and-architecture)).
- **`LABEL … <account>`**: leave it as it is. [10.2](#102-docker-login-ghcrio-then-docker-compose-build-and-push-13-minutes) replaces it with your GitHub account name (lowercase); until then this label doesn't disturb anything.
- **`ENV NODE_ENV=production`** (advised by the official `node` guide), **`USER node`**, **`EXPOSE 8080`**, and **`CMD`**: the reasons are in Concept 3.
- **What isn't there:** `.env`, passwords, `HEALTHCHECK` (in Compose only), and `npm cache clean --force` (the npm cache is thrown away together with the kitchen).

#### 2.4 ⭐ `docker build`, the image size, and a `docker history` without secrets (10 minutes)

In the **project root** terminal (the `mini-smart-home` folder):

```text
docker build -t mini-smart-home-backend:1.3.0 ./backend
```

`-t` gives the name and the tag (= the version in `package.json`); `./backend` is the build context, the folder holding `Dockerfile` and `.dockerignore`. You already downloaded the base mold `node:24.22.1-alpine3.24` in [🧰](#-what-you-need), so only the npm libraries are downloaded.

**Expected output** (the author's lab, cut). The author's machine still kept layers from earlier tests, so the first build was measured with an extra `--no-cache`; your laptop does the same steps:

```text
[+] Building 44.7s (13/13) FINISHED                                                                       docker:default
 => [internal] load build context                                                                                    0.1s
 => => transferring context: 338.61kB                                                                                0.1s
 => [packages 3/4] COPY package.json package-lock.json ./                                                            0.3s
 => [packages 4/4] RUN npm ci --omit=dev                                                                            24.6s
 => [stage-1 3/6] COPY --from=packages /app/node_modules ./node_modules                                              3.3s
 => [stage-1 6/6] COPY src ./src                                                                                     0.1s
 => exporting to image                                                                                              13.2s
 => => naming to docker.io/library/mini-smart-home-backend:1.3.0                                                     0.0s
```

±45 seconds in all on the author's Pi 5, more than half of it `npm ci`. `transferring context: 338.61kB` = the delivery already filtered by `.dockerignore`. The line `npm notice New major version of npm available! 11.19.1 -> 12.2.1`, if it shows, can be ignored: don't update npm inside the mold. Run the same command once more: every step `CACHED`, done in ±2 seconds (the lab: 1.9 s).

Then look at its size:

```text
docker image ls mini-smart-home-backend
```

**Expected output** (the author's lab, arm64, cut; example):

```text
IMAGE                           ID             DISK USAGE   CONTENT SIZE   EXTRA
mini-smart-home-backend:1.3.0   13aa9992d8ac        313MB         71.9MB
```

313 MB on disk, 71.9 MB downloaded, as in the Concept 4 table; the column names may differ in other Docker versions. Last, read the whole recipe recorded in the mold:

```text
docker history --no-trunc mini-smart-home-backend:1.3.0
```

The `CREATED BY` column holds every step of the recipe. Look for passwords, tokens, or `.env` content in the `ENV`, `ARG`, `LABEL`, and `RUN` lines. From your recipe there's only `ENV NODE_ENV=production` and the `LABEL` with `<account>`; the bottom lines belong to the `node` base mold. Notice too: there's no `RUN npm ci`, because that step belonged to the kitchen that was thrown away; what's left is its result, `COPY /app/node_modules ./node_modules`. In the author's lab, the 20 lines of the backend's `docker history --no-trunc` were checked against every password and token of the lab: not one showed up.

**You pass this ⭐ step** when `docker build` finishes without an error, `docker image ls` shows `mini-smart-home-backend:1.3.0` with its size, and `docker history --no-trunc` holds no password, token, or `.env` content.

#### 2.5 A mold without secrets: a `docker run` that refuses to start, then the `node` user (10 minutes)

Start the mold without any settings (`--rm` = the container is removed as soon as it stops):

```text
docker run --rm mini-smart-home-backend:1.3.0
```

**Expected output** (the author's lab; exit code 1):

```text
Setting MQTT_URL in .env: not filled in
Setting DATABASE_URL in .env: not filled in
Setting JWT_SECRET in .env: not filled in
Copy .env.example to .env (or open your .env), fix the settings above, then run again.
```

This is a **good** sign: the mold carries no secrets, so the backend stops at [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#12-check-env-with-zod-10-minutes)'s settings checker. The message mentions `.env` because it was written for dev mode; in a container, the settings come from Compose ([Concept 3](#3-the-molds-recipe-dockerfile-and-dockerignore)). The code deliberately isn't changed.

If `pino-pretty` had stayed in `devDependencies`, even complete settings wouldn't help: as soon as Fastify creates its logger, Node stops. The proof from the author's comparison mold (the 1.2 `package.json` and `package-lock.json`; cut), only to read:

```text
Error: unable to determine transport target for "pino-pretty"
    at fixTarget (/app/node_modules/pino/lib/transport.js:295:13)
```

`--entrypoint` replaces the program the mold runs, just this once; `id` names its user:

```text
docker run --rm --entrypoint id mini-smart-home-backend:1.3.0
```

**Result:** `uid=1000(node) gid=1000(node) groups=1000(node),1000(node)`, not root. Then peek into its working folder:

```text
docker run --rm --entrypoint ls mini-smart-home-backend:1.3.0 -a /app
```

**Result** (the author's lab, built from a copy that has `backend/.env` and `node_modules`): only `.`, `..`, `migrations`, `node_modules`, `package.json`, and `src`. No `.env`: `.dockerignore` works. This name without a prefix is only for testing; in [5.2](#52-composecloudyml-second-stage-migrate-backend-web-and-image_registry-in-env-15-minutes), Compose builds the same mold with a name prefixed by `IMAGE_REGISTRY`.

**Save to the branch.** In the `backend` folder terminal (branch `feature/docker-compose`):

```text
git add package.json package-lock.json src Dockerfile .dockerignore
```

```text
git commit -m "Backend 1.3.0: a two-stage Docker image, pino-pretty in dependencies, a log without /health (Module 26 Practice 2)"
```

> ⬆️ **Done with Practice 2?** Continue to [Practice 3](#practice-3--the-web-120-mold-vite--caddy-45-minutes): the second mold, for the dashboard.

### Practice 3 — The web 1.2.0 mold: Vite → Caddy (45 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: the `frontend` terminal of the old home (Vite may keep running) and one free terminal in the **`frontend`** folder for `npm`, `docker`, and Git (right-click the `frontend` folder → **Open in Integrated Terminal**); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux); **Chrome** or **Edge**; internet for `npm`. This practice doesn't touch the database either. Concepts used: 4 and 7.
>
> ⭐ **Required** — step 3.4: the `mini-smart-home-web:1.2.0` mold runs on its own at counter 8088, then answers `200` for `/` and `/map`, `404` for an asset that doesn't exist, and `502` for `/api/health`.

The dashboard moves up to **1.2.0**: three lines of code, three new files, no new npm package. Its final state: [`code/frontend/`](code/frontend/); all its changes: [`code/frontend-1.2.diff`](code/frontend-1.2.diff). The way to copy is the same as in Practice 2.

#### 3.1 Frontend 1.2.0: three lines of `socket.ts`, then lint, build, and `check-schema` (10 minutes)

In the web mold, the dashboard calls the API at the `/api` path on its page's own address ([Concept 4](#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy)). That's enough for `fetch`, but Socket.IO reads `io("/api")` as a namespace (a room's name), not a path ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)). Open `src/socket.ts`, replace line 16 (`export const socket … = io(BASE, { withCredentials: true, autoConnect: false });`) with these six lines, then save:

```ts
// Module 26: in the Docker image, BASE = "/api" (a path on this page's address, forwarded by Caddy to the backend). io("/api") would
// read it as a Socket.IO namespace, not a path, so the path is given through the path option: /api/socket.io/.
// An empty BASE (VITE_API_BASE=/) = the API at the root of this page's address: the path is /socket.io/.
export const socket: Socket<ToClient, FromClient> = BASE === "" || BASE.startsWith("/")
  ? io({ path: `${BASE}/socket.io`, withCredentials: true, autoConnect: false })
  : io(BASE, { withCredentials: true, autoConnect: false });
```

`BASE` = `/api` (the mold) → the path `/api/socket.io` on this page's address; a full address such as `http://localhost:8080` (dev mode) → the old line. So the dev-mode dashboard (Vite) still connects as before.

Then the version number. In the free terminal (the `frontend` folder), one by one:

```text
npm pkg set version=1.2.0
```

```text
npm install
```

**Result** (the author's lab): `npm pkg set` is silent; `npm install` writes `up to date, audited 111 packages in 3s` … `found 0 vulnerabilities`. In `package-lock.json`, only two `version` lines change. Don't use `npm install --package-lock-only` in this folder: in the author's lab, it added 60 unused lock lines.

The three checks of [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#101-dashboard-100-lint-build-check-schema-and-the-version-number-15-minutes), one by one:

```text
npm run lint
```

```text
npm run build
```

```text
npm run check-schema
```

**Expected output** (the author's lab, cut; the three commands in order):

```text
Found 0 warnings and 0 errors.

dist/index.html                     1.18 kB │ gzip:   0.65 kB
dist/assets/index-CtCrLpye.css     39.18 kB │ gzip:  11.88 kB
dist/assets/index-Ckrb8SqJ.js   1,039.52 kB │ gzip: 309.44 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
…
✓ built in 5.58s

SAME  src/schemas/contract.ts
SAME  src/schemas/rule-basics.ts
```

The benchmark: lint clean, the build passes with one size warning, two `SAME` (the hashed names and the numbers may differ). This `dist/` is only proof; the mold cooks its own `dist/` in 3.3.

#### 3.2 `frontend/caddy/Caddyfile`: the `/api` door, missing assets, and the SPA fallback (10 minutes)

In the Explorer, right-click the **`frontend`** folder → **New Folder…**, name it **`caddy`**. Right-click `caddy` → **New File…**, name it **`Caddyfile`** (capital C, no extension), fill it in (**Copy raw file** from [`code/frontend/caddy/Caddyfile`](code/frontend/caddy/Caddyfile)), then save:

```text
# Caddyfile - the front door of the Mini Smart Home dashboard (Module 26): serves the files of dist/ and forwards /api/... to the backend.
# A copy of this file is built into the web image. Docker Compose mounts the FOLDER frontend/caddy/ over it (not a single
# file), so the file in this repo is the one that's used. After changing it: docker compose restart web
{
	# Caddy usually opens an "admin counter" (2019) to change settings while running. We don't use it: the settings are only
	# read from this file when Caddy starts.
	admin off
}

# ":80" = plain HTTP on port 80 inside the web service, for any address typed in the browser (localhost, the laptop's IP).
# Module 27 replaces ":80" with a domain name, then Caddy sets up HTTPS by itself. ("auto_https off" does NOT make Caddy
# serve HTTP; this ":80" address is what does.)
:80 {
	# answers are compressed before they're sent: the dashboard's ±1 MB of JavaScript reaches the browser as about 300 kB
	encode zstd gzip

	# /api/devices -> backend:8080/devices (the /api prefix is removed first). The live connection too: /api/socket.io/ -> backend:8080/socket.io/
	# "backend" = the service's name in compose.cloud.yml (the Compose hallway), not localhost.
	handle_path /api/* {
		reverse_proxy backend:8080 {
			# The backend sets the "session" cookie (the 7-day season pass) with the path /auth, but the browser calls it through
			# /api/auth. Without this line the browser doesn't send that cookie to /api/auth/refresh, and you're thrown back to
			# the Login screen every 15 minutes. This line changes the path in the backend's answer: Path=/auth -> Path=/api/auth.
			header_down Set-Cookie "Path=/auth" "Path=/api/auth"
		}
	}

	# /assets/...: the JavaScript and CSS from the build. Their names carry a fingerprint (for example index-BAET4URZ.js) and
	# change with every build, so the browser may keep them long. A file that doesn't exist gets 404 (not index.html): an honest error.
	handle /assets/* {
		root * /srv
		file_server
	}

	# Everything except /api and /assets: the dashboard files in /srv (from dist/). Screen addresses such as /map or
	# /devices/f00d00000001 aren't files, so they are answered with index.html, then React Router picks the screen ("SPA
	# fallback", Module 24's promise). Without this, F5 on any screen other than / answers 404.
	handle {
		root * /srv
		# no-cache = the browser must ask Caddy first before using its saved index.html (Caddy answers 304 when it hasn't
		# changed). Without it, after the web image is rebuilt the browser can keep showing the OLD dashboard until F5.
		header Cache-Control "no-cache"
		try_files {path} /index.html
		file_server
	}
}
```

Its comments explain every line; in short:

- **The `{ admin off }` block** turns off Caddy's admin counter (port 2019): Caddy only reads this file when it starts, so after the file changes, run `docker compose restart web` (from Practice 5 on).
- **`:80`** = plain HTTP on the container's port 80, for any address ([Concept 4](#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy)). `encode zstd gzip` shrinks the ±1 MB of JavaScript to about 300 kB on the way.
- **Three mutually exclusive `handle` blocks:** every request goes into exactly one block, and the block without a pattern takes the rest. `handle_path /api/*` removes the `/api` prefix, then `reverse_proxy backend:8080` walks the request to the `backend` service in the Compose hallway; the `header_down` line is the cookie path patch (3.5). `handle /assets/*` serves JavaScript and CSS as they are, so a missing asset gets `404`. The last block is the SPA fallback: `try_files {path} /index.html`, plus `Cache-Control "no-cache"` so that the browser always asks first before using its saved `index.html` (the story is in [🔬](#-technical-deep-dive-optional)).

Why one `caddy/` folder, not a loose file in `frontend/`? Compose will later mount this **folder** into the `web` container: a folder shows new content at once, while a mounted single file may keep being read with its old content ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)). The copy inside the mold is only used when the mold is tried on its own, as in 3.4.

#### 3.3 The web `Dockerfile` and `.dockerignore`, then `docker build` from the `frontend` folder (12 minutes)

Right-click **`frontend`** → **New File…**, name it **`Dockerfile`**, fill it in (**Copy raw file** from [`code/frontend/Dockerfile`](code/frontend/Dockerfile)), then save:

```dockerfile
# Dockerfile - the web image (mold) of Mini Smart Home 1.2.0 (Module 26). Two stages ("multi-stage"):
#   stage "build": Node.js turns the React + TypeScript code into ready-to-serve files (npm run build -> the dist/ folder)
#   final stage  : only Caddy + the files of dist/. Node.js, node_modules, and the source code stay behind in the build stage.
# Built from the project folder with: docker compose build web   (or from this folder only, without the backend folder:
# docker build -t mini-smart-home-web:1.2.0 .)

# An exact tag (the same as the backend image), not "latest": the same mold today and next month.
FROM node:24.22.1-alpine3.24 AS build
WORKDIR /app
# package*.json is copied BEFORE the code: as long as the library list doesn't change, the "npm ci" layer comes from the cache
# and a rebuild after changing the code is much faster. Every library goes in (the TypeScript and Vite developer tools too),
# because this stage really builds; none of them goes into the final image.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The API address is BUILT INTO the JavaScript at build time: Vite replaces import.meta.env.VITE_API_BASE with this text. "/api" =
# a path on the same page's address, forwarded by Caddy to the backend (caddy/Caddyfile). Changing it = rebuilding the image.
# It holds an address, NOT a secret: every VITE_... value is sent to anyone's browser.
ARG VITE_API_BASE=/api
RUN npm run build

# Final stage: Caddy (no Node.js). An exact tag.
FROM caddy:2.11.7-alpine
# Links the image on GHCR to your GitHub repository (Module 26 Practice 10). Replace <account> with your GitHub account name
# (lowercase) and mini-smart-home with your repository's name if it's different. The description replaces the Caddy
# image's own description, so that your package page on GHCR doesn't say it only holds "the Caddy web server".
LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home" \
      org.opencontainers.image.description="Mini Smart Home dashboard (React) served by Caddy"
# The Caddyfile is built into the image, so that this image can be tried on its own (docker run). Docker Compose mounts the
# caddy/ folder of the repo over it.
COPY caddy/Caddyfile /etc/caddy/Caddyfile
# Only the build result is carried over from the build stage: the HTML, CSS, JavaScript, and icon files (about 1 MB).
COPY --from=build /app/dist /srv
# No CMD and EXPOSE: the Caddy image already brings them ("caddy run --config /etc/caddy/Caddyfile --adapter caddyfile",
# port 80 inside the running image). The counter on the laptop is set by compose.cloud.yml (ports).
```

The pattern is the same as the backend recipe, with three differences:

- **Its kitchen installs every library** (`npm ci` without `--omit=dev`), because TypeScript and Vite really are used for cooking. None of them goes to the serving table.
- **`ARG VITE_API_BASE=/api` after `npm ci`.** `ARG` is a value that only exists during the build; Vite bakes it into the JavaScript. It sits below `npm ci`, so changing the address doesn't throw the `npm ci` layer out of the cache.
- **Its serving table is Caddy**, not Node: `COPY caddy/Caddyfile` and `COPY --from=build /app/dist /srv`, without `CMD` and `EXPOSE` (both come with the Caddy mold). `LABEL` sets two labels: `source` (`<account>` is replaced in 10.2, as in the backend) and `description`, which overrides Caddy's own description.

Then create **`.dockerignore`** in `frontend` the same way (**Copy raw file** from [`code/frontend/.dockerignore`](code/frontend/.dockerignore)), then save:

```text
# .dockerignore - files that are NOT sent to docker build (Module 26). A shared image (public GHCR) can be taken apart by
# anyone: private settings files must not get in, not even into the build stage that is thrown away later.
# Libraries from npm install on the laptop: the build stage installs its own (npm ci); COPY . . must not mix them
# with the laptop's (the versions can differ; Windows/macOS machine code doesn't run on Linux).
node_modules
# An old build result on the laptop: the image builds its own.
dist
# Local dev-mode settings (.env.local holds your laptop's VITE_API_BASE). Only the example (.env.example) may go in.
.env
.env.*
!.env.example
*.local
```

The most important line is `*.local`: your `.env.local` (the dev-mode API address) never goes in, so the mold always uses `/api`. Also replace the content of `frontend/.env.example` (**Copy raw file** from [`code/frontend/.env.example`](code/frontend/.env.example)). What's new: two comment lines (that file is for dev mode only).

In the `frontend` folder terminal (the dot at the end = this folder as the build context):

```text
docker build -t mini-smart-home-web:1.2.0 .
```

**Expected output** (the author's lab, cut; as in 2.4, the first build was measured with `--no-cache`):

```text
[+] Building 102.6s (15/15) FINISHED                                                                      docker:default
 => [build 4/6] RUN npm ci                                                                                          49.5s
 => [build 6/6] RUN npm run build                                                                                   49.3s
```

103 seconds on the author's Pi 5, split almost evenly between `npm ci` and `npm run build`. The context is only the `frontend` folder, without the `backend` folder: [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#8-one-rule-two-guards-the-same-zod-schema-in-the-browser-and-the-backend)'s promise that the frontend can be built on its own is now proven. Run it again without changes: everything `CACHED`, ±2 seconds (the lab: 2.3 seconds). After the code changes, only `npm run build` is repeated (the lab: ±50 seconds); that also happens when you change the `LABEL` line in the `Dockerfile`, because `COPY . .` copies it too. Then:

```text
docker image ls mini-smart-home-web
```

**Expected output** (the author's lab, arm64; example):

```text
IMAGE                       ID             DISK USAGE   CONTENT SIZE   EXTRA
mini-smart-home-web:1.2.0   bc2f69743174       90.4MB           24MB
```

Almost the same as the Caddy mold alone (the Concept 4 table): no Node, `node_modules`, or source code. This name without a prefix is only for testing; in 5.3 Compose builds the same mold with the `IMAGE_REGISTRY` prefix.

#### 3.4 ⭐ Test the web mold on its own at counter 8088: 200, 404, and an expected 502 (8 minutes)

Before going into Compose, the mold is tested on its own at counter 8088, which the old home doesn't use:

```text
docker run -d --rm --name try-web -p 127.0.0.1:8088:80 mini-smart-home-web:1.2.0
```

This command only prints a long ID. `--rm` = the container is removed as soon as it stops; `-p 127.0.0.1:8088:80` = counter 8088 on this laptop to the container's port 80. Ask for the status code of four addresses, one by one (`-sI` = only the answer's headers; PowerShell: `curl.exe`, not tested by the author):

```text
curl -sI http://localhost:8088/
```

```text
curl -sI http://localhost:8088/map
```

```text
curl -sI http://localhost:8088/assets/missing.js
```

```text
curl -sI http://localhost:8088/api/health
```

**Expected output** (the author's lab; the first line of each answer, in order):

```text
HTTP/1.1 200 OK
HTTP/1.1 200 OK
HTTP/1.1 404 Not Found
HTTP/1.1 502 Bad Gateway
```

`/` and `/map` are both answered with `index.html` (`Content-Length: 1184`, `Cache-Control: no-cache`): `/map` isn't a file, so the SPA fallback works, and F5 on any screen is safe. A missing asset gets `404`. The `502` is expected: Caddy tries to walk `/api/health` to `backend`, but outside Compose there's no service by that name. Through Compose ([5.4](#54--log-in-through-caddy-at-httplocalhost-f5-bruno-and-swagger-8-minutes)), `/api` reaches the backend. Then read its log:

```text
docker logs try-web
```

**Expected output** (the author's lab, cut):

```text
{"level":"warn",…,"msg":"admin endpoint disabled"}
{"level":"warn",…,"msg":"server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server",…}
{"level":"warn",…,"msg":"HTTP/2 skipped because it requires TLS",…}
{"level":"warn",…,"msg":"HTTP/3 skipped because it requires TLS",…}
{"level":"error",…,"msg":"dial tcp: lookup backend on 192.168.1.1:53: no such host",…,"status":502,…}
```

Those four `warn` lines are normal ([Concept 4](#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy)). The `error` line is the `502` from before: a plain `docker run` container isn't in a Compose hallway, so the name `backend` is looked up in your network's DNS and isn't found. The DNS address differs on every laptop. In Chrome, `http://localhost:8088/map` loads the dashboard, then moves to the **Login** screen with the message `Something went wrong (502).`, because `/api/auth/me` is answered with `502` too (from the code; not recorded by the author). Done; stop it:

```text
docker stop try-web
```

Its answer is `try-web`; thanks to `--rm`, the container is removed too and counter 8088 is free again.

**You pass this ⭐ step** when the four `curl` commands answer `200`, `200`, `404`, and `502`, and `try-web` has been stopped.

#### 3.5 Two traps already fixed: Socket.IO behind `/api` and the path of the `session` cookie (5 minutes)

Only to read: both were found in the author's lab and are already fixed in version 1.2.0.

1. **Without the three lines of 3.1.** Frontend 1.1 built with `VITE_API_BASE=/api` asks for the namespace `/api` through the path `/socket.io/`, and Caddy answers that path with `index.html`. The Socket.IO client in the author's lab: `connect_error: server error`, over and over; the badge never becomes **Live**.
2. **Without `header_down`.** The backend sets the `session` cookie with `Path=/auth`, so the browser doesn't send it to `/api/auth/refresh`. In the author's lab, `POST /api/auth/refresh` was answered `401` `{"message":"not logged in: no session cookie"}`: as soon as the 15-minute `access` wristband runs out, you're thrown back to the **Login** screen. With the patch, the answer is `200`.

Both work in 5.4; their symptoms are in [🚨](#-troubleshooting). **Save to the branch.** In the `frontend` folder terminal:

```text
git add package.json package-lock.json .env.example src/socket.ts caddy Dockerfile .dockerignore
```

```text
git commit -m "Frontend 1.2.0: a Docker image with Caddy, Socket.IO through /api (Module 26 Practice 3)"
```

> ⬆️ **Done with Practice 3?** Read [Concept 5](#5-one-file-for-one-home-docker-compose) to [Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs) and [Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway), then do [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes) to [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes) in one sitting (±2.5 hours).

### Practice 4 — The cupboards move: the database and Grafana into Compose without losing data (50 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: a terminal at the **project root** (Git and `docker`) and the `backend` terminal (4.6); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with `smarthome-db` and `smarthome-grafana` still running; **Chrome** or **Edge** (Grafana `http://localhost:3000`); **Telegram**; your password manager (the old postgres and Grafana admin passwords). Concepts used: 5, 6, and 7.
>
> ⭐ **Required** — steps 4.3, 4.4, and 4.5: the old containers are removed while both their cupboards stay, `docker compose up -d` uses the old cupboards (`Skipping initialization`), and the fingerprint after the move equals the one from 1.2.

This practice keeps two promises: the [Syllabus](../../SYLLABUS.md#module-26--docker--docker-compose-one-command-for-all-services)'s ("the database & Grafana move into containers without losing data") and [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway)'s (the same `smarthome-grafana-data` cupboard). How: the old containers are thrown away, and Compose uses their cupboards as they are. Your old home has been stopped since 1.2 and only starts again at 5.3.

#### 4.1 `compose.cloud.yml`, first stage: `db` and `grafana` on two `external` cupboards (10 minutes)

In the VS Code Explorer, create a new file (**New File…**) at the project root (next to the `backend` folder) named **`compose.cloud.yml`**, paste this content (**Copy raw file** from [`code/stages/practice-4/compose.cloud.yml`](code/stages/practice-4/compose.cloud.yml)), then save (**Ctrl + S**):

```yaml
# compose.cloud.yml - STAGE of Module 26 Practice 4: only the database and Grafana, on the two OLD cupboards (Modules 17 and 25).
# Its content is written at the project root (not in this stage folder). The final Module 26 file: ../../compose.cloud.yml.
# Run it from the project root:  docker compose up -d   (.env holds COMPOSE_FILE=compose.cloud.yml and the OLD postgres password)
# Before that, the old containers are stopped and removed (their cupboards stay): docker stop + docker rm smarthome-grafana smarthome-db
name: smarthome

services:
  # The TimescaleDB database (Modules 17-18), the same smarthome-data cupboard since Module 17.
  db:
    image: timescale/timescaledb:2.30.2-pg17
    environment:
      # This form is only read while the cupboard is still EMPTY. An old cupboard already holds the password: write the OLD one in .env.
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?fill in POSTGRES_PASSWORD in .env}
      POSTGRES_DB: smarthome
      TIMESCALEDB_TELEMETRY: "off"
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      # 127.0.0.1 = this laptop only (DBeaver, psql, npm run dev). Without 127.0.0.1, Docker opens the counter to the whole Wi-Fi.
      - "127.0.0.1:${PORT_DB:-5432}:5432"
    networks:
      default:
        # the old container name of Modules 17-25: the screen-made Grafana data source (host smarthome-db:5432) stays connected
        aliases:
          - smarthome-db
    healthcheck:
      # "running" doesn't mean "ready for visitors"; -h 127.0.0.1 so that it doesn't pass too early while a new cupboard is filled
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U postgres -d smarthome"]
      interval: 5s
      timeout: 3s
      retries: 30
      start_period: 60s
    restart: unless-stopped

  # Grafana 13.2.4 (Module 25) with exactly the Module 25 settings and the same smarthome-grafana-data cupboard: your dashboards,
  # rules, contact point, and old admin account come along. Assembled from files (provisioning) only in Practice 7.
  grafana:
    image: grafana/grafana:13.2.4
    environment:
      GF_PLUGINS_PREINSTALL_DISABLED: "true"
      GF_ANALYTICS_REPORTING_ENABLED: "false"
      GF_SNAPSHOTS_EXTERNAL_ENABLED: "false"
      GF_PUBLIC_DASHBOARDS_ENABLED: "false"
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "127.0.0.1:${PORT_GRAFANA:-3000}:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  # The history cupboards belong to YOU ("external"): Compose never creates or deletes them, not even with "down -v".
  db-data:
    external: true
    name: ${DB_VOLUME:-smarthome-data}
  grafana-data:
    external: true
    name: ${GRAFANA_VOLUME:-smarthome-grafana-data}
```

Read its comments from the top, then compare it with your inventory sheet ([🔁 Step 5](#step-5--reading-the-old-containers-settings-with-docker-inspect-without-leaking-passwords)):

- **`db`** = [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#2-just-enough-docker-the-mold-the-container-the-counter-and-the-cupboard)'s `docker run` rewritten (the Concept 5 table): the same mold, cupboard, and `unless-stopped`. Its counter stays `127.0.0.1`: Module 17's promise holds, the database is for this laptop only. What's new: the second name `smarthome-db` in the hallway (Concept 7) and the health check (Concept 8).
- **`grafana`** brings Module 25's four `GF_…` settings exactly ([Module 25's 1.2](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#12-check-the-container-docker-ps-docker-inspect-and-docker-network-inspect-7-minutes)) and only starts after `db` is healthy (`service_healthy`). Its health check comes in 5.2, its provisioning in Practice 7.
- **`volumes:`**: two `external` cupboards (Concept 6), never created and never deleted by Compose. Their names come from `DB_VOLUME` and `GRAFANA_VOLUME` in `.env`, with the cupboard names of Modules 17 and 25 as the defaults.

This file grows in 5.2 and 7.2.

#### 4.2 Git hygiene first: `.gitignore`, `.gitattributes`, then `.env` with the old postgres password (5 minutes)

The `.env` you're about to create holds the postgres password, but Module 25's root `.gitignore` only holds back `keys.h` and `edge/broker-passwd` (the backend's `.env` is held back by `backend/.gitignore`). So **the fence goes up first, then the secret is written.**

**(a) `.gitignore`.** Replace the content of the root `.gitignore` with [`code/.gitignore`](code/.gitignore) (**Copy raw file**): its four old lines stay, plus a commented Module 26 block. Its new rules, without comments:

```text
.env
.env.*
!.env.example
edge/bridge/*.conf
backup/
```

`.env` and its copies don't go into Git in any folder; `!` = an exception for `.env.example`. The last two lines are for Practices 6 and 9.

**(b) `.gitattributes`.** A new file at the project root, named **`.gitattributes`** (starting with a dot), filled through **Copy raw file** from [`code/.gitattributes`](code/.gitattributes):

```text
# .gitattributes - Module 26: files read by programs INSIDE a Linux container must end their lines with LF (not CRLF).
# Git for Windows can turn LF into CRLF at checkout (core.autocrlf); the lines below prevent it for these files,
# because that invisible CR character breaks sh scripts. (Mosquitto 2.1.2, Caddy 2.11.7, and Compose proved tolerant in the
# Module 26 lab, but not every program is that tolerant: it's safer to keep all of these files LF.)
*.sh text eol=lf
*.conf text eol=lf
Caddyfile text eol=lf
acl-broker text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
.env.example text eol=lf
Dockerfile text eol=lf
.dockerignore text eol=lf
```

Meaning: those files always end their lines with LF (the Linux style), on Windows too. In the author's lab, CRLF (the Windows style) only broke `.sh` scripts, and this project has no `.sh`; LF is still chosen for tidiness.

**(c) `.env.example`.** A new file at the project root, named **`.env.example`**, filled through **Copy raw file** from [`code/.env.example`](code/.env.example):

```text
# .env.example - the Docker Compose settings of the Mini Smart Home CENTER (Module 26) for compose.cloud.yml in this folder.
# Copy it to .env (cp .env.example .env), fill in the empty lines, then on Linux/macOS/Pi: chmod 600 .env
# .env holds ALL your home's secrets: it never goes into Git (see .gitignore) and is never pasted into a forum, an issue, or an AI.
# The same goes for the output of "docker compose config": that command prints every secret below as it is.
#
# Make every random password/secret with one of these commands, then paste the result (43 characters: letters, digits, - and _
# only, so it's safe in a database address and in YAML):
#   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
#   docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
# (the second line is for a laptop without Node.js; its image is the same as the backend mold's base)

# The Compose file's name. With this line, "docker compose up -d" in this folder is enough (without -f compose.cloud.yml).
COMPOSE_FILE=compose.cloud.yml

# The image shop (Practice 10): ghcr.io/ + your GitHub account name in lowercase, for example ghcr.io/budi-santoso. Not a secret:
# you may write it straight into your own .env.example, so that a friend's laptop that copies it pulls your images at once.
IMAGE_REGISTRY=

# --- Secrets (required) ---
# The postgres password. The smarthome-data cupboard from Module 17 ALREADY stores its password: write your OLD one here (changing
# this line does NOT change the password in the database). A new laptop (an empty cupboard): a new random password.
POSTGRES_PASSWORD=
# The backend's JWT signing key (Module 20), at least 32 random characters.
JWT_SECRET=
# The password of the broker account "backend". The broker-account service uses it to make that account ONCE, while the broker
# cupboard is still empty. Changing this password later: change this line, then (from this folder)
#   docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd backend   (type the new password 2x)
#   docker compose restart mosquitto      (the broker reads the new password file)
#   docker compose up -d                  (the backend is recreated with the new password from .env)
# Dev mode (backend/.env) uses the same account: change MQTT_PASSWORD there too.
MQTT_PASSWORD=
# The password of the database account grafana_reader (Module 25). May be a NEW (random) password, also when moving from Module 25:
# the grafana-account service syncs this account's password in the database with this line at every "docker compose up", and the
# Grafana data source from the files (grafana/provisioning) uses the same line.
GRAFANA_READER_PASSWORD=
# The Grafana admin password, only used while the Grafana cupboard is still empty. The Module 25 cupboard keeps your old admin password.
GRAFANA_ADMIN_PASSWORD=

# --- Telegram (optional; Modules 19 and 25). Empty = backend notifications off, Grafana's messages to Telegram fail. ---
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
# The time of the daily CSV report, a 5-field cron in WIB (default 07:00 WIB).
REPORT_SCHEDULE=0 7 * * *
# Only for a mock Bot API server in the lab; leave it commented out.
# TELEGRAM_API_ROOT=

# --- Page address and counters (ports) on this laptop ---
# Pages (origins) that may log in from a browser, comma-separated. If PORT_WEB isn't 80, write its port too,
# for example http://localhost:8081,http://127.0.0.1:8081. Phone mode: add http://<laptop-IP>, for example http://192.168.1.20
CORS_ORIGIN=http://localhost,http://127.0.0.1
# 127.0.0.1 = the dashboard can only be opened from this laptop. 0.0.0.0 = phone mode: every device on the home Wi-Fi can open it.
WEB_ADDRESS=127.0.0.1
# Change the number on the left if that counter is already used by another program on your laptop (for example PORT_WEB=8081).
PORT_WEB=80
# PORT_BACKEND isn't 8080 (for example 8082)? Add http://localhost:8082 to CORS_ORIGIN, so that a login through
# Try it out at http://localhost:8082/docs isn't refused with 403. Bruno and tools/live-terminal.js aren't affected.
PORT_BACKEND=8080
PORT_DB=5432
PORT_GRAFANA=3000
PORT_MQTT=1883
PORT_KUMA=3001

# --- History cupboards (volumes), created ONCE with "docker volume create <name>" (the Module 17 and 25 cupboards already exist) ---
DB_VOLUME=smarthome-data
GRAFANA_VOLUME=smarthome-grafana-data

# --- Profiles that start with "docker compose up -d". Empty = only the default services. monitoring = Uptime Kuma (Module 30).
# Without this line, a profile is started with "docker compose --profile monitoring up -d" and stopped with
# "docker compose --profile monitoring down" (without --profile, Uptime Kuma keeps running).
# COMPOSE_PROFILES=monitoring
```

A list of the home's settings without a single secret value, so it's safe in Git. From the top: the random-secret recipe (Concept 9), `COMPOSE_FILE` (Concept 5), `IMAGE_REGISTRY`, the required secrets, Telegram, the addresses and counters, the cupboard names, the profiles. Of the secrets, only `POSTGRES_PASSWORD` is used now; the rest are filled in when they're used: [5.1](#51-the-central-broker-edgecenterconf-the-pi-bridge-acl-block-and-the-broker-account-and-mosquitto-services-12-minutes), [5.2](#52-composecloudyml-second-stage-migrate-backend-web-and-image_registry-in-env-15-minutes), and [7.2](#72-the-final-composecloudyml-the-grafana-account-service-and-grafanas-secrets-in-env-8-minutes).

**(d) Your own `.env`.** In the project-root terminal (Linux, macOS, Pi; Windows: `copy .env.example .env`, not tested by the author):

```text
cp .env.example .env
```

Open `.env` in VS Code and fill in:

1. **`POSTGRES_PASSWORD=`** with the **old** postgres password (Module 17), not a new one: the old cupboard already stores its password (Concept 6). That password is also written in `backend/.env`, in `DATABASE_URL` between `//postgres:` and `@`. A typo doesn't show yet in this practice; only in 5.3 does the `migrate` service fail to log in (`password authentication failed for user "postgres"`).
2. Did you use counter 5433 or 5434 in Module 17? Change `PORT_DB=5432` to your number, so that DBeaver and `backend/.env` still match.
3. Are the cupboard names in your inventory ([🔁 Step 1](#step-1--your-homes-inventory-containers-cupboards-hallways-molds-and-disk-space)) different? Write them in `DB_VOLUME` and `GRAFANA_VOLUME`. A name that doesn't exist makes Compose refuse to start (`external volume "…" not found`) without touching any cupboard.

Save, then lock the file (Linux, macOS, Pi; Windows has no `chmod`):

```text
chmod 600 .env
```

**(e) Check.** Before anything is deleted, make sure Compose can read the file and your `.env`:

```text
docker compose config --quiet
```

**Result:** no output (the author's lab: exit code 0). `POSTGRES_PASSWORD` still empty? Compose stops with a message ending in `fill in POSTGRES_PASSWORD in .env`. Without `--quiet`, your password gets printed. Last, `git status` must list `.gitignore` (modified) and `.gitattributes`, `.env.example`, `compose.cloud.yml`, and `scripts/` (new), **without `.env`** (the author's lab: `.env` doesn't show). Its commit is in 4.6.

#### 4.3 ⭐ Remove the old containers, keep their cupboards: `docker stop`, `docker rm`, and `docker network rm` (8 minutes)

This step is **required before 4.4**. The container is the cake, and the cupboard stands outside the cake (Module 17): only the cake is removed. The command is `docker rm`, **not** `docker volume rm` (safety rule number 3). In the project-root terminal, one at a time:

```text
docker stop smarthome-grafana smarthome-db
```

```text
docker rm smarthome-grafana smarthome-db
```

**Result** (the author's lab): each command prints both names again. Are the cupboards still there?

```text
docker volume ls --filter name=smarthome
```

**Expected output** (the author's lab, without the lab tools' cupboard):

```text
DRIVER    VOLUME NAME
local     smarthome-data
local     smarthome-grafana-data
```

Then the hallway you made by hand in Module 25; Compose makes its own hallway (Concept 7):

```text
docker network rm smarthome
```

**Result:** `smarthome`. Refused with `… network smarthome has active endpoints (name:"…" …)`? Another container (its name is in `name:"…"`) is still attached: if it's a leftover of your experiments, stop and remove it as above, then try again. An old hallway left behind doesn't disturb Compose either (the author's code lab).

> [!WARNING]
> **Why 4.3 must not be skipped.** While the old `smarthome-db` holds counter 5432, `docker compose up -d` stops with `Bind for 127.0.0.1:5432 failed: port is already allocated` (the author's lab). The new container never ran Postgres, so the cupboard is safe, and `docker compose down` cleans up the rest. The dangerous case is a **different** counter, for example the old container on 5433 while `PORT_DB` is 5432: the new `db` still starts, and two Postgres servers could use one cupboard at the same time. The author didn't try it; the order 4.3 → 4.4 prevents it. Similar errors: [🚨](#-troubleshooting) *Old containers in the way …*.

**You pass this ⭐ step** when `docker ps -a` no longer lists `smarthome-db` and `smarthome-grafana`, while both of their cupboards are still there.

#### 4.4 ⭐ `docker compose up -d`: the old cupboards are recognized, `Skipping initialization` (8 minutes)

In the project-root terminal (no `-f`: `COMPOSE_FILE` in `.env` points to the file):

```text
docker compose up -d
```

**Expected output** (the author's lab; one line of a lab-only service removed):

```text
[+] Running 3/3
 ✔ Network smarthome_default      Created    0.2s
 ✔ Container smarthome-db-1       Healthy    7.1s
 ✔ Container smarthome-grafana-1  Started    7.4s
```

A new hallway is created, and Grafana waits for `db` to be `Healthy`; ±9 seconds in all in the lab, with no cupboard warning (both are `external`). Then:

```text
docker compose ps
```

**Expected output** (the author's lab, cut):

```text
NAME                  IMAGE                               COMMAND                  SERVICE   CREATED          STATUS                    PORTS
smarthome-db-1        timescale/timescaledb:2.30.2-pg17   "docker-entrypoint.s…"   db        30 seconds ago   Up 29 seconds (healthy)   127.0.0.1:5432->5432/tcp
smarthome-grafana-1   grafana/grafana:13.2.4              "/run.sh"                grafana   29 seconds ago   Up 22 seconds             127.0.0.1:3000->3000/tcp
```

The container name is now `smarthome-db-1` (Concept 5), both counters are on `127.0.0.1`, and only `db` has a health check. Proof that the database wasn't created from scratch:

```text
docker compose logs db
```

**Expected output** (the author's lab, two lines; search with **Ctrl + F** in the VS Code terminal):

```text
db-1  | PostgreSQL Database directory appears to contain a database; Skipping initialization
db-1  | 2026-10-28 14:00:17.683 UTC [1] LOG:  database system is ready to accept connections
```

"It already contains a database; initialization skipped": the `POSTGRES_…` form isn't read, and the old cupboard is used as it is (Concept 6). The database log clock is UTC (14:00 UTC = 21:00 WIB).

**You pass this ⭐ step** when `db` has the status `(healthy)` and its log contains `Skipping initialization`.

#### 4.5 ⭐ The fingerprint after equals the one before, then check Grafana in the same cupboard (12 minutes)

The script of 1.2, now through the `db` service (`-T`: its input comes from a file, not the keyboard). bash/zsh:

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

PowerShell (not tested by the author):

```text
Get-Content scripts/fingerprint.sql | docker compose exec -T db psql -U postgres -d smarthome
```

**Expected output** (the author's lab; exactly the same as its row in 1.2):

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2318 | aa2aa442bf9868ca730b42ccab4cffba |       379 |      9 |    3 |        2 |       3
(1 row)
```

Compare it with the "Before the move" row in `fingerprint.md` ([1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes)). `readings`, `fingerprint`, `accounts`, and `devices` exactly the same = **your history moved without losing a single reading**; `summaries` may differ. Save the row with the title "After the move (4.5)". Different? Don't go on yet: make sure no other backend is running and that `DB_VOLUME` points to your old cupboard.

Then Grafana. Open `http://localhost:3000`, log in as `admin` with the **old** password (`GRAFANA_ADMIN_PASSWORD` in `.env` is only for an empty cupboard), and repeat the notes of [1.3](#13-grafanas-fingerprint-dashboards-rules-contact-point-and-the-test-button-5-minutes):

- **Dashboards**: `System Health` and `First panel`.
- **Alerting → Alert rules**: `Silent node`, now probably `Firing`: the 🔴 during the move (1.3) comes from here. That's normal; the ✅ comes after the data are back.
- **Alerting → Notification configuration → Contact points** → `Telegram Smart Home` → **Test** → **Send test notification** → `Test notification sent successfully`, then `🔴 Notification test` arrives.
- **Connections → Data sources** → `grafana-postgresql-datasource` → **Save & test** → `Database Connection OK`. This data source points to `smarthome-db:5432`, the container you've just removed; what answers now is the `db` service through its second name (Concept 7).

**Result** (the author's lab, through the same API as the screen): the old admin password accepted, the contents exactly the same as in 1.3, `Database Connection OK`, and the **Test** at 21:01:12 WIB received by the mock Telegram server a second later.

**You pass this ⭐ step** when the four deciding columns equal 1.2, and Grafana is intact: the old admin password, two dashboards, the `Silent node` rule, and the **Test** arrives.

#### 4.6 Dev mode still works against the `db` service (7 minutes)

`backend/.env` points to counter `127.0.0.1:5432`, which now belongs to the `db` service; nothing needs to change. In the `backend` terminal:

```text
npm run dev
```

**Expected output** (the author's lab, cut; times in WIB):

```text
> mini-smart-home-backend@1.3.0 dev
> node --watch --env-file=.env src/server.ts

[21:01:31] INFO: database ready
[21:01:31] INFO: rules loaded: 0 active of 0
[21:01:31] INFO: device registry loaded: 2 registered devices
[21:01:31] INFO: daily report scheduled: "0 7 * * *" Asia/Jakarta, next 29 Oct 2026, 07:00 WIB
[21:01:31] INFO: Server listening at http://127.0.0.1:8080
[21:01:31] INFO: API docs: http://127.0.0.1:8080/docs
```

`database ready` = backend 1.3.0 is connected to the Compose database; the other lines (cut) name your old broker (`MQTT_URL`). Press **Ctrl + C** (`SIGINT received: the backend is stopping gracefully`): home mode starts in 5.3, and how to switch modes is in [5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes). Readings that came in meanwhile don't matter, because the 4.5 fingerprint is already written down.

**Save to the branch.** In the project-root terminal (file names one by one, without `.env`):

```text
git add compose.cloud.yml .env.example .gitignore .gitattributes scripts
```

```text
git commit -m "Compose stage 1: db and Grafana on the old volumes, .env.example, .gitignore, .gitattributes (Module 26 Practice 4)"
```

`git status` afterwards must not mention `.env`.

> ⬆️ **Done with Practice 4?** Go straight on to [Practice 5](#practice-5--the-whole-home-in-one-command-the-central-broker-migrations-backend-and-web-60-minutes). The dashboard and the backend only start again in [5.3](#53--one-command-starts-the-whole-home-docker-compose-up--d---build-and-ps--a-10-minutes).

### Practice 5 — The whole home in one command: the central broker, migrations, backend, and web (60 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: a terminal at the **project root** (`docker compose` and Git), the `tools` terminal (5.5), and the `backend` and `frontend` terminals (5.6); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux); **Chrome** or **Edge**; **Bruno**; **Telegram**; your password manager. Concepts used: 5, 7, 8, and 10.
>
> ⭐ **Required** — steps 5.3, 5.4, and 5.5: one `docker compose up -d --build` starts the whole home (`docker compose ps -a`), you log in through Caddy at `http://localhost`, then live data flow through the central broker and the lamp is answered with an `ack`.

Next to `db` and `grafana` there are now the central broker, `migrate`, `backend`, and `web` (Caddy). In 5.3 your home starts again, entirely in containers: **home mode**. As in the table of [Syllabus §2.2](../../SYLLABUS.md#22-where-the-brain-runs-over-time), the brain is on the laptop, the Kit B devices' broker stays on the Pi (Practice 6), and everything is still on the home network.

> [!IMPORTANT]
> **Counter 1883 must be free first.** Your inventory sheet ([🔁 Step 2](#step-2--who-is-using-counters-80-1883-3000-5173-5432-and-8080)) wrote down who uses it, usually the old laptop-path broker from [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#3-a-broker-on-the-laptop-mosquitto-two-configuration-lines-and-the-firewall) or [Module 12 Practice 7](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#practice-7--laptop-path-mosquitto-as-a-service-30-minutes). Stop it with the commands of those two modules (*not tested by the author in this module*): in the VS Code terminal, **Ctrl + C**; Linux `sudo systemctl disable --now mosquitto`; macOS `brew services stop mosquitto`; Windows, in **Terminal (Admin)** from `C:\Program Files\Mosquitto`, `net stop mosquitto` and then `.\mosquitto uninstall` (so it doesn't start again with Windows). Don't delete its old files: they're your way back. Kit B: the Pi broker keeps running until 6.4.

#### 5.1 The central broker: `edge/center.conf`, the `pi-bridge` ACL block, and the `broker-account` and `mosquitto` services (12 minutes)

**(a) `edge/center.conf`.** Right-click the **`edge`** folder → **New File…**, name it **`center.conf`**, fill it in (**Copy raw file** from [`code/edge/center.conf`](code/edge/center.conf)), then save:

```text
# center.conf - the Mini Smart Home CENTRAL broker inside a container (Module 26, the mosquitto service in compose.cloud.yml).
# Runs on the laptop (Module 26) and later on a VPS (Module 27). The backend connects through the service name mosquitto:1883; the
# Pi gateway through the bridge with the pi-bridge account; the tools/ simulator through the laptop's counter 1883. Paths below = INSIDE the container.
# After changing this file or acl-broker: docker compose restart mosquitto (restart, not reload).
listener 1883
# without a registered username and password, no one may connect (Module 21)
allow_anonymous false
# the password file lives in the broker-data cupboard (made by mosquitto_passwd INSIDE the container; the image hands it to the
# mosquitto user every time it starts, so there's no file-owner trouble on the laptop)
password_file /mosquitto/data/broker-passwd
acl_file /mosquitto/config/acl-broker
# the client name is always = the username: no one can pretend to be or kick out another client
use_username_as_clientid true
# retained messages (device statuses, the backend's config) and sessions are kept in the cupboard: not lost when the container is recreated
persistence true
persistence_location /mosquitto/data/
# log to the container's screen: read it with docker compose logs mosquitto (limited to 3 x 10 MB by compose.cloud.yml)
log_dest stdout
log_type error
log_type warning
log_type notice
log_type information
# remove the # in front of the line below to also see the messages REFUSED by the access list (Denied PUBLISH, Module 21);
# the log gets much busier
# log_type debug
```

At heart it's the same as `mosquitto-lan.conf` from [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#6-the-brokers-doorkeeper-a-password-file-and-one-account-per-program). What's new: the password file in a cupboard, `persistence true` (retained messages survive when the container is recreated), and logging to the container's screen. The paths = paths **inside** the container.

**(b) The ACL block `7) pi-bridge`.** Open your `edge/acl-broker`, don't overwrite it (block 2 holds your device_id; the laptop path also has block 2b from [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#51-prepare-the-garden-a-node-2-that-is-heard-or-the-mock-garden-from-the-simulator-15-minutes)). Add block 7 from [`code/edge/acl-broker`](code/edge/acl-broker) at the very bottom (`# …` = its two lines of explanation), then save; the account is created in [6.2](#62-laptop-the-gateway-files-in-edge-the-pi-bridge-account-then-push-the-branch-5-minutes):

```text
# 7) The Pi gateway bridge (Module 26): applies on the CENTRAL broker (compose.cloud.yml), where the bridge logs in with this account.
# …
user pi-bridge
topic write msh/+/telemetry
topic write msh/+/status
topic write msh/+/vitals
topic write msh/+/ack
topic read msh/+/cmd
```

**(c) Two broker services** (already in the 5.2 file; comments removed, `# …` = skipped):

```yaml
  broker-account:
    # …
    environment:
      MQTT_PASSWORD: ${MQTT_PASSWORD:?fill in MQTT_PASSWORD in .env}
    command:
      - sh
      - -c
      - |
        set -e
        if [ -f /mosquitto/data/broker-passwd ]; then
          echo "broker password file already exists: skipped"
        else
          mosquitto_passwd -b -c /mosquitto/data/broker-passwd backend "$$MQTT_PASSWORD"
          chmod 600 /mosquitto/data/broker-passwd
          echo "broker account backend created"
        fi
    # …
    tmpfs:
      - /mosquitto/log
    restart: "no"
    # …
  mosquitto:
    # …
    volumes:
      - ./edge/center.conf:/mosquitto/config/mosquitto.conf:ro
      - ./edge/acl-broker:/mosquitto/config/acl-broker:ro
      - broker-data:/mosquitto/data
    # …
    ports:
      - "${PORT_MQTT:-1883}:1883"
    depends_on:
      broker-account:
        condition: service_completed_successfully
    # …
```

`broker-account` = a **one-off** service: it creates the `backend` account only when the password file in the `broker-data` cupboard doesn't exist yet. `$$` = a `$` sign for `sh` ([🔁 Step 4](#step-4--environment-variables-from-practiceenv-default-values-empty-values-and-unquoted-numbers)); `tmpfs` prevents nameless cupboards ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)). `mosquitto` mounts two repo files read-only (`:ro`). Its counter has no `127.0.0.1`, so it's open to the home Wi-Fi for the Pi gateway and the ESP32 ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)); on public Wi-Fi, `docker compose stop mosquitto` (safety rule number 1).

**(d) The `backend` account's password.** In the project-root terminal, the `JWT_SECRET` command from [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#11-make-the-organizers-stamp-jwt_secret-5-minutes):

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Paste the result into the root `.env`, on the line `MQTT_PASSWORD=`, save, and note it in your password manager. `broker-account` uses it once, when the broker's cupboard is empty (changing the password later: the `.env.example` comment).

#### 5.2 `compose.cloud.yml`, second stage: `migrate`, `backend`, `web`, and `IMAGE_REGISTRY` in `.env` (15 minutes)

Open [`code/stages/practice-5/compose.cloud.yml`](code/stages/practice-5/compose.cloud.yml) on GitHub, click **Copy raw file**, then paste it in place of the **entire** content of your `compose.cloud.yml` and save. Every service now uses the `x-log` log limit, and `grafana` gets a `curl` health check (provisioning waits for Practice 7). The new pieces:

```yaml
x-backend-settings: &backend-settings
  MQTT_URL: mqtt://mosquitto:1883
  # …
  DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD:?fill in POSTGRES_PASSWORD in .env}@db:5432/smarthome
  HOST: 0.0.0.0
  # …
  TZ: Asia/Jakarta
# …
services:
  # …
  migrate:
    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-backend:1.3.0
    build: ./backend
    command: ["node", "src/db/migrate.ts"]
    environment: *backend-settings
    # …
  backend:
    # …
    ports:
      - "127.0.0.1:${PORT_BACKEND:-8080}:8080"
    depends_on:
      db:
        condition: service_healthy
      mosquitto:
        condition: service_started
      migrate:
        condition: service_completed_successfully
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8080/health',{method:'HEAD'}).then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
      # …
  web:
    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-web:1.2.0
    build:
      context: ./frontend
      args:
        VITE_API_BASE: /api
    volumes:
      - ./frontend/caddy:/etc/caddy:ro
    ports:
      - "${WEB_ADDRESS:-127.0.0.1}:${PORT_WEB:-80}:80"
    depends_on:
      backend:
        condition: service_healthy
    # …
```

The backend's settings come from the root `.env`, not `backend/.env`; the addresses are service names, and `HOST: 0.0.0.0` only applies inside the container ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)). `migrate` = the backend mold with another command. `backend` is healthy when `HEAD /health` is answered, the knock that [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#6-a-guard-at-every-door-the-admin-and-viewer-roles) promised; `web` waits for it, so `/api` is no longer `502` as in [3.4](#34--test-the-web-mold-on-its-own-at-counter-8088-200-404-and-an-expected-502-8-minutes). At the end of the file, `uptime-kuma` has the `monitoring` profile and stays off until it's switched on ([🧩 Level 2](#level-2--uptime-kuma-the-monitoring-profile-and-one-monitor-through-a-service-name-fill-in-the-blanks-40-minutes)); with `web` (Caddy), the center file's contents now match the Syllabus ([Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway)).

Then fill in two more lines in the root `.env`:

1. **`JWT_SECRET=`**: copy it from `backend/.env`, as in the author's lab. A new secret = everyone has to **Log in** again.
2. **`IMAGE_REGISTRY=ghcr.io/<lowercase-account>`**, for example `ghcr.io/budi-santoso`. Required even though the image shop is only used in [10.2](#102-docker-login-ghcrio-then-docker-compose-build-and-push-13-minutes), so that Compose never pulls someone else's image ([Concept 5](#5-one-file-for-one-home-docker-compose)).

Telegram may stay empty until [7.2](#72-the-final-composecloudyml-the-grafana-account-service-and-grafanas-secrets-in-env-8-minutes) (backend log: `Telegram notifications off: TELEGRAM_BOT_TOKEN is empty`; the old Grafana keeps sending). Check:

```text
docker compose config --quiet
```

**Result:** silence (the author's lab: exit code 0). Something still empty? For example:

```text
error while interpolating services.migrate.image: required variable IMAGE_REGISTRY is missing a value: fill in IMAGE_REGISTRY in .env
```

The front part changes from run to run (the author's lab); read its end, `fill in <NAME> in .env`.

#### 5.3 ⭐ One command starts the whole home: `docker compose up -d --build` and `ps -a` (10 minutes)

This is the Syllabus's command. In the project-root terminal (`--build` = build the `backend` and `web` molds first):

```text
docker compose up -d --build
```

**Expected output** (the author's lab, cut; the lab's stand-in image shop written as `ghcr.io/<account>`, the lab's mock Telegram line removed):

```text
[+] Building 5.5s (30/30) FINISHED
…
 ✔ ghcr.io/<account>/mini-smart-home-backend:1.3.0  Built              0.0s
 ✔ ghcr.io/<account>/mini-smart-home-web:1.2.0      Built              0.0s
 ✔ Volume smarthome_broker-data                     Created            0.0s
 ✔ Container smarthome-db-1                         Healthy           11.2s
 ✔ Container smarthome-broker-account-1             Exited             4.8s
 ✔ Container smarthome-mosquitto-1                  Started            5.0s
 ✔ Container smarthome-grafana-1                    Started            9.2s
 ✔ Container smarthome-migrate-1                    Exited            11.7s
 ✔ Container smarthome-backend-1                    Healthy           21.6s
 ✔ Container smarthome-web-1                        Started           21.9s
```

The layers of Practices 2–3 are still stored, so everything is `CACHED` (±31 seconds in all); without them, the molds are cooked from scratch as in 2.4 and 3.3 (the author's Pi 5: 45.8 and 103 seconds). `db` and `grafana` are recreated; their cupboards stay. `address already in use`? Counter 1883 or 80 is still taken ([🚨](#-troubleshooting)). Then:

```text
docker compose ps -a
```

**Expected output** (the author's lab, example):

```text
NAME                         IMAGE                                                COMMAND                  SERVICE          CREATED          STATUS                      PORTS
smarthome-backend-1          ghcr.io/<account>/mini-smart-home-backend:1.3.0      "docker-entrypoint.s…"   backend          29 seconds ago   Up 17 seconds (healthy)     127.0.0.1:8080->8080/tcp
smarthome-broker-account-1   eclipse-mosquitto:2.1.2-alpine                       "/docker-entrypoint.…"   broker-account   31 seconds ago   Exited (0) 26 seconds ago
smarthome-db-1               timescale/timescaledb:2.30.2-pg17                    "docker-entrypoint.s…"   db               30 seconds ago   Up 26 seconds (healthy)     127.0.0.1:5432->5432/tcp
smarthome-grafana-1          grafana/grafana:13.2.4                               "/run.sh"                grafana          29 seconds ago   Up 20 seconds (healthy)     127.0.0.1:3000->3000/tcp
smarthome-migrate-1          ghcr.io/<account>/mini-smart-home-backend:1.3.0      "docker-entrypoint.s…"   migrate          29 seconds ago   Exited (0) 17 seconds ago
smarthome-mosquitto-1        eclipse-mosquitto:2.1.2-alpine                       "/docker-entrypoint.…"   mosquitto        30 seconds ago   Up 25 seconds               0.0.0.0:1883->1883/tcp, [::]:1883->1883/tcp
smarthome-web-1              ghcr.io/<account>/mini-smart-home-web:1.2.0          "caddy run --config …"   web              28 seconds ago   Up 6 seconds                443/tcp, 2019/tcp, 443/udp, 127.0.0.1:80->80/tcp
```

`mosquitto` and `web` have no health check on purpose. The two one-off services are `Exited (0)`: they went home with the job done; without `-a` they don't show. Only the broker is open to the Wi-Fi (`0.0.0.0`); the `443` and `2019` on the `web` line are defaults of the Caddy image, not opened. Finally:

```text
docker compose logs migrate broker-account
```

**Expected output** (the author's lab):

```text
migrate-1         | 0 new migration(s) applied, 8 applied earlier.
broker-account-1  | Adding password for user backend
broker-account-1  | broker account backend created
```

`migrate` fails with `password authentication failed for user "postgres"`? `POSTGRES_PASSWORD` isn't the old password ([4.2](#42-git-hygiene-first-gitignore-gitattributes-then-env-with-the-old-postgres-password-5-minutes)).

**You pass this ⭐ step** when `ps -a` shows three `(healthy)`, `mosquitto` and `web` `Up`, the two one-off services `Exited (0)`, and `migrate` writes `0 new migration(s) applied`.

#### 5.4 ⭐ Log in through Caddy at `http://localhost`: F5, Bruno, and Swagger (8 minutes)

In Chrome, open **`http://localhost`** (counter 80, Caddy's front door) → `/login`. **Log in** with your **old** account: accounts are stored in the database cupboard. **Result:** `/devices` with the **Live** badge and `Home Admin (admin)`; in the author's lab, the old account from the Module 17–25 cupboard was accepted through Caddy (`/auth/me`: role `admin`). Your devices only become `Online` in 5.5 or 6.6.

Type `http://localhost/map` and `http://localhost/devices/f00d00000001` directly, then press **F5**: the page stays whole, and the F5 promise of [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#15--back-f5-and-direct-links-the-screen-stays-the-live-connection-doesnt-drop-10-minutes) is kept (the author's lab: five addresses `200` `text/html`). Bruno, environment `local` (`http://127.0.0.1:8080`): **`login admin`** then **`device list`** → `200` through the backend's counter (the author's lab: through `curl`). Swagger: **`http://localhost:8080/docs`**, not `127.0.0.1` (the **Try it out** login gets `403`, [Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)); ignore `0.0.0.0` in the backend log. Finally (PowerShell: `curl.exe`, not tested by the author):

```text
curl -I http://localhost:8080/health
```

**Expected output** (the author's lab, first line): `HTTP/1.1 200 OK`. `-I` = `HEAD`, the health check's knock every 15 seconds, and backend 1.3.0 doesn't log it: `docker compose logs backend | grep -c /health` (bash) answers `0` in the author's lab. The author's lab picture (the 5.5 simulator already running; bottom right = [🧩 Level 1](#level-1--the-dashboard-from-a-phone-phone-mode-through-env-a-small-change-20-minutes)):

![Composite of four real screenshots of the Mini Smart Home dashboard v1.2 in its light theme, served by Caddy in Docker Compose, in Chrome 156, Linux on a Raspberry Pi 5 playing the laptop, Practice 5.4. Top left, http://localhost/login: the card Mini Smart Home, Log in with your Module 20 account to see the dashboard, Email admin@home.test, Password with dots, the green Log in button (number 1). Top right, http://localhost/devices after Log in: the header Mini Smart Home with the green Live badge (number 2), the menu Devices, Map, Rules, Home Admin (admin), Log out; Device List with the card Practice living room, Online, key active, living room · f00d00000001, Temperature 30.5 °C, last seen 8 seconds ago (number 3); the card Practice porch, not registered, messages ignored by the backend, never seen yet; the card Garden (mock), Online, via linking device (number 3), Temperature 29.3 °C, last seen 4 minutes ago. Bottom left, the details page opened directly at http://localhost/devices/f00d00000001 as after F5: Back to the list, History, the title Practice living room (number 4) with key active, node1, Online, last seen just now, Controls Lamp Off and Fan Off, Pump: water for 3, 5, 10 sec, the line chart card Temperature (°C) · last 5 minutes with the buttons Temperature, Light, Humidity, axis 24 to 36 and times 11:41 to 11:45 (number 5), below it updated at 11:44:56 WIB (number 5). Bottom right, Level 1 phone mode, Chrome device mode 375 pixels on the same machine, not a real phone, address http://192.168.1.10/devices: the header Mini Smart Home with Live (number 6), the menu on more rows, Device List with three stacked cards, Practice living room Temperature 30.8 °C and Garden (mock) Temperature 27 °C. Data from the simulator f00d00000001 and the mock Garden since 11:20 WIB; the lab machine LAN IP is sanitized to 192.168.1.10.](assets/dashboard-through-caddy.png)

**You pass this ⭐ step** when you log in through `http://localhost` with your old account, F5 still shows the dashboard, Bruno answers `200`, and `curl -I` gives `200 OK`.

#### 5.5 ⭐ Live data through the central broker: the simulator, the mock Garden, and the lamp button (7 minutes)

The central broker only knows the `backend` account so far. The practice device `f00d00000001` ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#38-the-module-21-device-simulator-and-contract-checker-8-minutes)) needs its own account, with the password `KEY_F00D00000001` from `tools/.env`. In the project-root terminal (paste the key twice):

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd f00d00000001
```

**Result:** `Password:`, `Reenter password:`, `Adding password for user f00d00000001`. Without `-u mosquitto` (the password file's owner), the warning `owner is not root` appears. Then a restart, not a reload ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#44-device-path-lock-the-door-then-restart-10-minutes)):

```text
docker compose restart mosquitto
```

The backend writes `broker not reachable yet, retrying in 5 seconds`, then `connected to broker mqtt://mosquitto:1883 as backend` (the author's lab). The other accounts (`checker`, `monitor`, Node 1, `pi-bridge` in 6.2) are created with the same two commands. In the `tools` terminal:

```text
node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1
```

After `f00d00000001: online`, the laptop path types `garden start` (Kit B doesn't; block 2b is laptop path only). **Expected output** (the author's lab, cut):

```text
f00d00000001: online
garden start
Mock Garden f00d000000b2 started via f00d00000001: one packet now, then every 300 seconds.
f00d000000b2: the Garden woke up at 21:08:56 WIB, its packet published by f00d00000001
```

The laptop path's address stays the same; what answers now is the container broker. Dashboard: **Live**, `Practice living room` `Online`, the Garden `Online` `via linking device`. In the details of `Practice living room`, in the **Controls** section, tap **Lamp**: `Off` becomes `On` after the `ack`. The author's lab sent the same command through the API behind Caddy; the backend log:

```text
backend-1  | [21:09:53] INFO: command c-20261028-140953-1 (api) to f00d00000001: lamp = true, ack ok=true in 19 ms
```

Then the old Grafana's ✅ arrives by itself, as received by the mock Telegram server in the author's lab: `✅ Practice living room is sending data again.` (the Garden too). Kit B: Node 1 and Node 2 in 6.6. The laptop path with a real ESP32 (not tested by the author): the firmware stays; Node 1's account on the central broker is enough. For the laptop path, this step is **the stand-in for L4** ([Syllabus §5.3](../../SYLLABUS.md#53-kit-b--raspberry-pi-as-the-gateway-needed-from-module-12)); the gateway on the same laptop is in [6.7](#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes).

**You pass this ⭐ step** when the **Live** badge lights up, the practice device (and the Garden) are `Online`, and the lamp is answered with an `ack`.

#### 5.6 Container logs, then switching between home mode and dev mode (8 minutes)

```text
docker compose logs -f backend
```

**Expected output** (the author's lab, cut; times in WIB thanks to `TZ`):

```text
backend-1  | [21:04:52] INFO: database ready
…
backend-1  | [21:04:52] INFO: connected to broker mqtt://mosquitto:1883 as backend
backend-1  | [21:05:38] INFO: login: account 1 (admin), session 2, IP 172.19.0.7
```

**Ctrl + C** only stops the reading; its variations are `--since 5m`, `-n 50`, `-t` ([Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs)). The IP `172.19.0.7` = Caddy.

**Dev mode** (changing code, as in Modules 16–25), **only one backend**:

1. Root terminal: `docker compose stop backend web` (the author's lab: both `Stopped`).
2. Copy [`code/backend/.env.example`](code/backend/.env.example) (**Copy raw file**) to `backend/.env.example`. In your `backend/.env`: `MQTT_URL=mqtt://127.0.0.1:1883` (Kit B: it used to be the Pi's IP) and `MQTT_PASSWORD` = the one in the root `.env`; `DATABASE_URL` and `PORT=8080` stay.
3. `npm run dev` in the `backend` terminal (the author's lab: `connected to broker mqtt://127.0.0.1:1883 as backend`) and in `frontend`, then `http://localhost:5173` → **Log in** → **Live**. Is there a `frontend/.env.local`? It must contain `VITE_API_BASE=http://localhost:8080`; with `127.0.0.1`, the cookies aren't sent (`Your session has expired`, [Module 22](../../phase-4-frontend-dashboard/module-22-react-basics/README.md#9-logging-in-from-the-browser-cookies-cors-and-localhost)).
4. Going back: **Ctrl + C** in both (`SIGINT received: the backend is stopping gracefully`), then `docker compose start backend web` (the author's lab: `broker-account` and `migrate` run along and then `Exited`, which is safe).

> [!WARNING]
> **Two backends at once?** On the same counter, `npm run dev` fails with `address already in use 127.0.0.1:8080`. On another counter, the two kick each other off the broker (`session taken over`, `broker not reachable yet`), and when the Telegram token is filled in (7.2), Telegram refuses one of them with `409: Conflict` (the author's lab, mock Telegram); the losing bot only comes back after `docker compose restart backend`.

Save to the branch from the root terminal (`.env` is held back by `.gitignore`):

```text
git add compose.cloud.yml edge/center.conf edge/acl-broker backend/.env.example
```

```text
git commit -m "The whole home in Docker Compose: the central broker, migrate, backend, web (Module 26 Practice 5)"
```

> ⬆️ **Done with Practice 5?** Continue to [Practice 6](#practice-6--the-pi-gateway-kit-b-docker-engine-edgecomposeedgeyml-and-a-lan-bridge-70-minutes-laptop-path-25-minutes) if you have Kit B, or go straight to [6.7](#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes) without a Pi. The basis is in [Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway).

### Practice 6 — The Pi gateway (Kit B): Docker Engine, `edge/compose.edge.yml`, and a LAN bridge (70 minutes; laptop path 25 minutes)

> 🖥️ **Tools used:** an **SSH terminal to the Pi** ([Module 12](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#4-ssh-a-remote-terminal)), from 6.3 on in the folder `mini-smart-home/edge`; **VS Code** on the laptop with a terminal at the **project root** (6.2 and the central broker's log in 6.5); **Docker Desktop** or **Docker Engine** on the laptop with the Compose home running since 5.3; **Chrome** or **Edge** (`http://localhost`); Node 1 and Node 2 switched on; your password manager. Laptop path: VS Code with the `tools` terminal is enough (6.7). Concepts used: 10.
>
> ⭐ **Required for Kit B** — steps 6.4, 6.5, and 6.6: the Pi's old password file copied into the gateway's cupboard, the gateway's bridge connected to the central broker, and Node 1 connecting with its old account until its data show live on the laptop dashboard (**L4**). The laptop path replaces it with 5.5.

> [!NOTE]
> **Not recorded by the author on Raspberry Pi OS.** The Pi steps are written from Docker's official documentation and the recipe in [`code/edge/README.md`](code/edge/README.md). In the author's lab, one Linux machine played the laptop AND the Pi: the gateway ran as a second Compose project on counter 1884 with `CENTER_ADDRESS=host-gateway` (exactly 6.7), `sudo cat` and `systemctl` were replaced by lab files and containers, and Node 1 was played by the simulator. 6.1 wasn't run at all; a real ESP32, real GitHub, two machines on a LAN, and Node-RED on the Pi haven't been tested by the author either (details in [📚 Sources](#-sources--image-credits)).

The Syllabus asks for one command on the laptop **and** on the Pi. On the Pi, the apt Mosquitto broker from Module 12 is replaced by the same broker inside a container: the address, port 1883, and the old accounts stay, so the firmware isn't touched. The only new thing is the first LAN bridge to the central broker on the laptop, which has no TLS yet and doesn't hold data while the laptop is off yet: both are Module 27 ([Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway)).

#### 6.1 Pi: Docker Engine from Docker's apt repository, the `docker` group, and Git (20 minutes)

Log in to the Pi over SSH, then make sure its system is 64-bit:

```text
dpkg --print-architecture
```

It must say `arm64`; `armhf` means a 32-bit Pi OS (`uname -m` may still say `aarch64`), which is only supported up to Docker Engine 28: use the laptop path (6.7).

Install Docker Engine from **Docker's apt repository** with the official page for **Debian**, <https://docs.docker.com/engine/install/debian/>, the section *Install using the apt repository*. 64-bit Raspberry Pi OS is Debian; the "Raspberry Pi OS" page on Docker's site is for 32-bit only. Copy the commands from that page:

1. Remove the old conflicting packages (`docker.io`, `docker-compose`, `docker-doc`, `docker-buildx`, `podman-docker`, `containerd`, `runc`) with the page's opening command.
2. Install the key and the source of Docker's repository (*Set up Docker's apt repository*).
3. Install the packages:

```text
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

We don't use the `get.docker.com` script that tutorials often use: according to its documentation, it "isn't recommended for production environments" and isn't designed to update a Docker that's already installed.

So that `docker` works without `sudo`, add your user to the `docker` group:

```text
sudo usermod -aG docker $USER
```

Leave SSH (`exit`), then log in again: the new group membership applies after logging in again. **The `docker` group equals root** (Docker's documentation): its members can take over the whole Pi through Docker, so it's only for your own user ([🔬](#-technical-deep-dive-optional)). Check:

```text
docker version
```

```text
docker compose version
```

**Expected result** (not recorded on a Pi): the `Client` and `Server` parts both say `linux/arm64`, then one line `Docker Compose version …`. Refused with a `permission denied` that names `docker.sock`? You haven't logged out of SSH and back in yet ([🚨](#-troubleshooting) *On the Pi, every `docker` command is refused without `sudo`*). Docker starts by itself every time the Pi is switched on (Docker's documentation).

Finally, Git (Pi OS Lite doesn't necessarily have it):

```text
sudo apt install git
```

The clone waits for 6.3, after the laptop pushes its branch.

#### 6.2 Laptop: the gateway files in `edge/`, the `pi-bridge` account, then push the branch (5 minutes)

The Pi gets its files from GitHub, so the gateway files are written on the laptop first. In the VS Code Explorer, create these five files, each through **Copy raw file** from its link:

- [`edge/compose.edge.yml`](code/edge/compose.edge.yml), [`edge/gateway.conf`](code/edge/gateway.conf), [`edge/bridge.example.conf`](code/edge/bridge.example.conf), and [`edge/.env.example`](code/edge/.env.example), which are read in 6.3;
- [`edge/bridge/README.md`](code/edge/bridge/README.md), in a new folder `edge/bridge`. Git doesn't store empty folders; without this file, `bridge/` doesn't exist on the Pi (the `cp` of 6.3 fails), and if Docker creates it first, the folder belongs to `root` (the author's lab).

`edge/center.conf` and the block `7) pi-bridge` in `edge/acl-broker` you already wrote in [5.1](#51-the-central-broker-edgecenterconf-the-pi-bridge-acl-block-and-the-broker-account-and-mosquitto-services-12-minutes).

**The `pi-bridge` account on the central broker.** Make a random password like `MQTT_PASSWORD` in 5.1 (d) and keep it in your password manager (it's used again in 6.3). Then, in the project-root terminal, with the pattern of the simulator's account in 5.5:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd pi-bridge
```

Paste the password twice (it doesn't show). **Expected output** (the author's lab):

```text
Password:
Reenter password:
Adding password for user pi-bridge
```

The password file has changed, so the broker is restarted ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#44-device-path-lock-the-door-then-restart-10-minutes): a restart, not a reload):

```text
docker compose restart mosquitto
```

**Expected output** (the author's lab):

```text
[+] Restarting 1/1
 ✔ Container smarthome-mosquitto-1  Started    1.1s
```

**Save to the branch, then push.** One at a time:

```text
git add edge
```

```text
git commit -m "Pi gateway: compose.edge.yml, gateway.conf, a bridge example (Module 26 Practice 6)"
```

```text
git push -u origin feature/docker-compose
```

That's this branch's first push ([8.5 of Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#85-commit-and-push-the-branch)); GitHub answers with a summary of the push. Without the push, the Pi only gets `main` as it was in Module 25, because this branch is only merged in [➕ E](#e--merge-featuredocker-compose-into-main-with-the-pull-request-the-whole-system-in-docker-compose).

#### 6.3 Pi: the branch from GitHub, `edge/.env`, `bridge/center.conf`, and what's in `compose.edge.yml` (8 minutes)

In the SSH terminal to the Pi, from the home folder (`~`), one at a time:

```text
git clone https://github.com/<account>/mini-smart-home.git
```

```text
cd mini-smart-home
```

```text
git switch feature/docker-compose
```

**Expected output** (the author's lab, the last command):

```text
branch 'feature/docker-compose' set up to track 'origin/feature/docker-compose'.
Switched to a new branch 'feature/docker-compose'
```

The `mini-smart-home` repo has been public since Module 3, so the clone doesn't ask for a login ([8.4 of Module 20](../../phase-3-backend-data/module-20-user-security/README.md#84-github-keeps-watch-too-5-minutes)); a repo you made private asks for one. Then go into the gateway folder with `cd edge`.

**(a) `edge/.env`.** Its example:

```text
# edge/.env.example - the Docker Compose settings of the Mini Smart Home GATEWAY (Raspberry Pi) (Module 26), for compose.edge.yml.
# On the Pi, from the edge folder: cp .env.example .env, fill in the empty lines, then chmod 600 .env. edge/.env isn't in Git.

# The Compose file's name. With this line, "docker compose up -d" in the edge folder is enough (without -f compose.edge.yml).
COMPOSE_FILE=compose.edge.yml

# The CENTRAL broker's address = the IP of the laptop that runs compose.cloud.yml, for example 192.168.1.20 (a fixed address in the router,
# like Module 23's phone mode: if the laptop's IP changes, the bridge breaks). The gateway tried on the same laptop: host-gateway
CENTER_ADDRESS=

# The gateway broker's counter. On the Pi: 1883 (the Node 1 firmware uses 1883). The gateway tried on the same laptop as
# compose.cloud.yml: 1884, because 1883 is already used by the central broker.
PORT_GATEWAY=1883

# Module 27 (not used in Module 26): the Cloudflare Tunnel token for the "tunnel" profile. Secret.
TUNNEL_TOKEN=
# Node-RED in a container (the "nodered" profile, optional; Module 26 keeps using the systemd Node-RED): the editor's counter.
PORT_NODERED=1880

# Profiles that start with "docker compose up -d". Empty = only the gateway broker.
# COMPOSE_PROFILES=nodered
```

```text
cp .env.example .env
```

Open it with `nano .env`, fill in `CENTER_ADDRESS=` with the laptop's IP, e.g. `CENTER_ADDRESS=192.168.1.10` (your IP differs; find it as in [Module 23's phone mode](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode); reserve its address in the router like the Pi in Module 12). `PORT_GATEWAY` stays 1883, the port the Node 1 firmware connects to. Save (**Ctrl + O**, **Enter**, **Ctrl + X**), then:

```text
chmod 600 .env
```

**(b) `bridge/center.conf`.** Its example:

```text
# bridge.example.conf - an EXAMPLE bridge from the Pi gateway broker to the central broker on the laptop (Module 26).
# Copy it to edge/bridge/center.conf (cp bridge.example.conf bridge/center.conf), then replace the password. That copy
# holds a password, so it isn't in Git. This first bridge is still plain (no TLS yet) and doesn't yet hold messages while the center
# is down: both are Module 27.
connection center
# "center" = the name compose.edge.yml points at CENTER_ADDRESS in edge/.env (the IP of the laptop that runs compose.cloud.yml).
# Leave "center" written here; what you change is the address in edge/.env. 1883 = the central broker's PORT_MQTT counter.
address center:1883
# the bridge's client name is made fixed. Its default holds the container name, which changes every time the container is recreated.
remote_clientid pi-bridge
# the pi-bridge account on the CENTRAL broker (made with mosquitto_passwd in the central container; its rights are block 7 of acl-broker)
remote_username pi-bridge
remote_password replace-with-the-pi-bridge-account-password
# device messages go up to the center (out), commands from the backend come down to the devices (in), QoS 1
topic msh/+/telemetry out 1
topic msh/+/status out 1
topic msh/+/vitals out 1
topic msh/+/ack out 1
topic msh/+/cmd in 1
```

```text
cp bridge.example.conf bridge/center.conf
```

With `nano bridge/center.conf`, replace `replace-with-the-pi-bridge-account-password` with the password from 6.2. Leave the line `address center:1883` as it is: the address comes from `.env`. Save, then `chmod 600 bridge/center.conf`. The broker can still read it, because Mosquitto reads its configuration before dropping its rights to the `mosquitto` user (the author's lab). `git status --short --ignored` marks both of these secret files `!!`, meaning Git ignores them.

**(c) Two files the gateway broker reads.** Just read them; their comments explain every line:

```text
# gateway.conf - the Mini Smart Home GATEWAY broker on the Raspberry Pi, inside a container (Module 26, edge/compose.edge.yml).
# Replaces the apt Mosquitto package + /etc/mosquitto/conf.d/gateway-pi.conf (Modules 12 and 21). Devices keep connecting to the
# Pi's IP on port 1883 with their old accounts, so the firmware doesn't change. Paths below = INSIDE the container.
# After changing this file, acl-broker, or bridge/center.conf: docker compose restart mosquitto (restart, not reload).
listener 1883
# without a registered username and password, no one may connect (Module 21)
allow_anonymous false
# the password file lives in the broker-data cupboard; the Pi's old file (/etc/mosquitto/broker-passwd, 2.0 format) is read by Mosquitto 2.1.2
password_file /mosquitto/data/broker-passwd
acl_file /mosquitto/config/acl-broker
# the client name is always = the username (device_id): no one can pretend to be or kick out another device
use_username_as_clientid true
# retained messages and sessions are kept in the cupboard (like the apt Mosquitto on the Pi, which saves them when it stops)
persistence true
persistence_location /mosquitto/data/
# log to the container's screen: read it with docker compose logs mosquitto (limited to 3 x 10 MB by compose.edge.yml)
log_dest stdout
log_type error
log_type warning
log_type notice
log_type information
# remove the # in front of the line below to also see the messages REFUSED by the access list (Denied PUBLISH, Module 21);
# the log gets much busier
# log_type debug
# the bridge to the central broker: every .conf file in this folder is read (edge/bridge/center.conf, holds a password, not in Git)
include_dir /mosquitto/config/bridge
```

```yaml
# compose.edge.yml - the Mini Smart Home GATEWAY services on the Raspberry Pi (Module 26), the partner of compose.cloud.yml on the laptop.
# Run it on the Pi, from the edge folder:  docker compose up -d
#   The line COMPOSE_FILE=compose.edge.yml in edge/.env makes -f unnecessary (its example is edge/.env.example).
# The Mosquitto gateway broker (replacing the Module 12 apt package) + the bridge to the central broker on the laptop (bridge/center.conf).
# cloudflared (Module 27) and Node-RED (optional) only start when their profile is named, for example:
#   docker compose --profile nodered up -d
# In Module 26 neither of them is started. NEVER "docker compose down -v": -v deletes the cupboard holding the broker password file.
name: smarthome-gateway

# Each container's log is limited to 3 files x 10 MB. Docker's default has NO limit: the Pi's microSD card can fill up slowly.
x-log: &log
  driver: json-file
  options:
    max-size: 10m
    max-file: "3"

services:
  # The gateway broker: Node 1 (and Node 2 through Node 1) keeps connecting to the Pi's IP on port 1883 with its old account.
  # Mosquitto 2.1.2 reads the Pi's old password file (2.0 format) as it is.
  mosquitto:
    image: eclipse-mosquitto:2.1.2-alpine
    volumes:
      # The configuration and the access list from the repo (read-only). After changing either: docker compose restart mosquitto
      - ./gateway.conf:/mosquitto/config/mosquitto.conf:ro
      - ./acl-broker:/mosquitto/config/acl-broker:ro
      # the bridge folder: holds center.conf (the bridge password, not in Git)
      - ./bridge:/mosquitto/config/bridge:ro
      # the password file (moved from /etc/mosquitto/broker-passwd), retained messages, and sessions
      - broker-data:/mosquitto/data
    # The Mosquitto image declares its log folder as a cupboard, while our log shows on the screen (docker compose logs).
    # tmpfs = a temporary folder in RAM: without it Docker makes a nameless cupboard every time this container is recreated.
    tmpfs:
      - /mosquitto/log
    ports:
      # all interfaces: devices connect from the home Wi-Fi. The firmware uses 1883, so on the Pi don't change this number.
      - "${PORT_GATEWAY:-1883}:1883"
    extra_hosts:
      # the name "center" in bridge/center.conf points at the IP of the laptop that runs compose.cloud.yml (CENTER_ADDRESS in
      # edge/.env). The gateway tried on the same laptop (laptop path): CENTER_ADDRESS=host-gateway (= this machine itself).
      - "center:${CENTER_ADDRESS:?fill in CENTER_ADDRESS in edge/.env (the center laptop's IP)}"
    restart: unless-stopped
    logging: *log

  # The Cloudflare tunnel (Module 27, the free path): needs TUNNEL_TOKEN in edge/.env. The "tunnel" profile = doesn't start
  # until it's called: docker compose --profile tunnel up -d
  cloudflared:
    image: cloudflare/cloudflared:2026.10.5
    profiles: ["tunnel"]
    # the image's starting program is already "cloudflared --no-autoupdate"; this is what follows it
    command: ["tunnel", "run"]
    environment:
      TUNNEL_TOKEN: ${TUNNEL_TOKEN:-}
    restart: unless-stopped
    logging: *log

  # Node-RED in a container (optional). Module 26 keeps using the systemd Node-RED of Module 13. Before using this profile,
  # stop the systemd nodered service (counter 1880 clashes), move the flows and their credentials, then change the broker
  # address in the flows from localhost to mosquitto (inside a container, localhost = the Node-RED container itself).
  nodered:
    image: nodered/node-red:5.0.9-24
    profiles: ["nodered"]
    environment:
      TZ: Asia/Jakarta
    volumes:
      - nodered-data:/data
    ports:
      - "${PORT_NODERED:-1880}:1880"
    restart: unless-stopped
    logging: *log

volumes:
  # Compose's cupboards: the gateway broker's password file + retained messages, and the Node-RED data (if its profile is used).
  broker-data:
  nodered-data:
```

- `gateway.conf` = the Module 21 settings (no anonymous visitors, a password file, the ACL, `use_username_as_clientid`) with paths inside the container. Its password file lives in the `broker-data` cupboard, and `include_dir` reads every `.conf` in the `bridge/` folder.
- `extra_hosts` points the name `center` at `CENTER_ADDRESS`. Empty? Compose refuses to start with `required variable CENTER_ADDRESS is missing a value: fill in CENTER_ADDRESS in edge/.env (the center laptop's IP)` (the author's lab).
- The counter `${PORT_GATEWAY:-1883}` has no `127.0.0.1`, because the devices come in from the home Wi-Fi.
- `cloudflared` (the `tunnel` profile, Module 27) and `nodered` (the `nodered` profile) are written, but off.

#### 6.4 ⭐ Pi: match the ACL, copy the old password file into the gateway's cupboard, then turn off the apt broker (10 minutes)

**(a) Match the ACL.** The gateway broker now reads `edge/acl-broker` from the repo, not `/etc/mosquitto/acl-broker`. If you once changed block 2 (the device_ids of your real Node 1 and Node 2, [5.2 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#52-write-the-access-control-list-edgeacl-broker-10-minutes)) only in the Pi's copy, Node 2's data through Node 1 will be refused. Compare them, from the `edge` folder:

```text
sudo diff /etc/mosquitto/acl-broker acl-broker
```

Lines starting with `>` exist only in the repo (block 7, maybe 2b too): that's fine. Lines starting with `<` exist only on the Pi; if there's a `user …` or `topic …` among them, the repo copy isn't the same yet. Fix it **on the laptop** (`edge/acl-broker` in VS Code), commit, `git push`, then `git pull` on the Pi. Don't edit `acl-broker` on the Pi, so the next `git pull` doesn't clash. This flow, plus `docker compose restart mosquitto`, applies from now on to `gateway.conf` and `acl-broker`; automatic updates wait for Module 29. This step wasn't tested by the author.

**(b) Copy the old password file.** Type `sudo -v` first (the Pi may ask for a password), then this long command:

```text
sudo cat /etc/mosquitto/broker-passwd | docker compose run --rm -T --no-deps mosquitto sh -c 'cat > /mosquitto/data/broker-passwd && chmod 600 /mosquitto/data/broker-passwd'
```

`sudo cat` reads the Module 21 password file, then `|` streams it into a one-time container (`run --rm`, `--no-deps`; `-T` = accepts the `|` stream) that writes it into the `broker-data` cupboard with mode `600`. The old file stays where it is as a way back. Mosquitto 2.1.2 reads this 2.0-format file as it is (Concept 10), so all the old accounts come along: the devices, `nodered`, `monitor`, `checker`.

**Expected output** (the author's lab; a 2.0-format lab file instead of `sudo cat`):

```text
[+] Creating 2/2
 ✔ Network smarthome-gateway_default     Created    0.1s
 ✔ Volume smarthome-gateway_broker-data  Created    0.0s
```

On the Pi, the download lines of the Mosquitto image (±13 MB) show too. The gateway's hallway and cupboard are created; the one-time container is already thrown away. A new microSD card without the old file? Make the accounts from scratch with step 7 of the recipe in [`code/edge/README.md`](code/edge/README.md).

**(c) Turn off the apt broker** so counter 1883 is free and that broker doesn't start again when the Pi is switched on:

```text
sudo systemctl disable --now mosquitto
```

From now on Node 1 has lost its broker until 6.5. **The way back** if something goes wrong: in the `edge` folder, `docker compose down` (without `-v`: the gateway's cupboard keeps the password file), then `sudo systemctl enable --now mosquitto`.

**You pass this ⭐ step** when the copy command finishes without an error and `systemctl is-active mosquitto` answers `inactive`.

#### 6.5 ⭐ Start the gateway: `Connecting bridge` on the Pi and `New bridge connected` on the laptop (10 minutes)

On the Pi, in the `edge` folder (no `-f`: `COMPOSE_FILE` is in `.env`):

```text
docker compose up -d
```

**Result** (the author's lab): `✔ Container smarthome-gateway-mosquitto-1  Started    1.1s`. Then:

```text
docker compose logs mosquitto
```

**Expected output** (the author's lab, cut):

```text
mosquitto-1  | 1793196841: Loading config file '/mosquitto/config/bridge/center.conf'
mosquitto-1  | 1793196841: mosquitto version 2.1.2 starting
mosquitto-1  | 1793196841: Warning: File /mosquitto/config/acl-broker has world readable permissions. Future versions will refuse to load this file.
mosquitto-1  | 1793196841: Opening ipv4 listen socket on port 1883.
mosquitto-1  | 1793196841: Connecting bridge center (center:1883)
mosquitto-1  | 1793196841: mosquitto version 2.1.2 running
```

The number at the front = Mosquitto's clock, seconds since 1 January 1970. ACL warnings like `world readable` (three in the lab) can be ignored ([🚨](#-troubleshooting) *Safe to ignore …*). On the laptop, in the project-root terminal, the command is the same:

```text
docker compose logs mosquitto
```

Search for `bridge` with **Ctrl + F**. **Expected output** (the author's lab):

```text
mosquitto-1  | 1793196841: New bridge connected from 172.19.0.1:42854 as pi-bridge (p4, c0, k60, u'pi-bridge').
```

The address after `from` differs in your home (in the lab: a Docker hallway address); what matters is `as pi-bridge`. Not there? Check `CENTER_ADDRESS`, the password in `bridge/center.conf`, and the laptop's IP ([🚨](#-troubleshooting) *The bridge doesn't connect …*).

**You pass this ⭐ step** when the Pi logs `Connecting bridge center (center:1883)` and the laptop `New bridge connected … as pi-bridge`.

#### 6.6 ⭐ L4: Node 1 connects with its old account, live data on the dashboard, and the lamp's `ack` (12 minutes)

On the Pi, follow the gateway's log with `docker compose logs -f mosquitto` until Node 1 connects (more than two minutes? unplug its power and plug it back in). **Expected output** (the author's lab; the simulator plays Node 1 with an old 2.0-format account):

```text
mosquitto-1  | 1793196879: New client connected from 172.20.0.1:56778 as f00d00000001 (p4, c1, k15, u'f00d00000001').
```

On your Pi, Node 1's address and `device_id` show. **Ctrl + C** only stops the reading. Then on the laptop, Chrome `http://localhost`:

1. The **Live** badge lights up, and Node 1's temperature on its details page moves (the author's lab: `27.3`, ten seconds later `32.7`).
2. Click the **Lamp** switch: Node 1's lamp turns on, and the switch moves after the `ack` arrives through the gateway and the bridge (the author's lab: `"wait_ms":17`, a round trip of 17 milliseconds).
3. The Garden card (Node 2 through Node 1) is back `Online` `via linking device` within ±5 minutes, because Node 2 wakes up every 300 seconds. Never comes? ACL block 2 isn't the same yet (6.4).
4. The systemd Node-RED of Module 13 keeps receiving data: `localhost:1883` on the Pi is now the gateway container's counter, and the `nodered` account was copied along. In the lab, an MQTT client with the old `nodered` account received `msh/…/telemetry` through the gateway's counter; a real Node-RED hasn't been tested yet.

**You pass this ⭐ step (L4)** when the gateway's log records Node 1, the **Live** badge lights up with a moving temperature, and the **Lamp** switch is answered with an `ack`, without a single line of firmware changed. The move of the device path is done: Node 1's readings are recorded again, and Grafana's ✅ arrives by itself.

#### 6.7 Laptop path: the stand-in for L4, then the gateway on the same laptop (5–25 minutes)

Without a Pi, **the stand-in for L4 is already proven in [5.5](#55--live-data-through-the-central-broker-the-simulator-the-mock-garden-and-the-lamp-button-7-minutes)**. **Optional (±20 minutes):** the gateway on the same laptop, the way the author tested this practice. Commands in the `edge` folder handle the gateway; at the project root, the center.

1. Do [6.2](#62-laptop-the-gateway-files-in-edge-the-pi-bridge-account-then-push-the-branch-5-minutes) on the laptop; its push may wait until [11.1](#111-choose-where-to-test-a-friends-laptop-a-second-account-or-another-folder-and-cupboards-5-minutes).
2. A new terminal, `cd edge`, `cp .env.example .env` (Windows: `copy`, not tested by the author); fill in `CENTER_ADDRESS=host-gateway` (this laptop itself, seen from the container) and `PORT_GATEWAY=1884` (1883 belongs to the central broker).
3. `cp bridge.example.conf bridge/center.conf` and replace its password as in 6.3 (b); `address center:1883` stays.
4. The gateway's cupboard is still empty. Create the simulator's account with its key from `tools/.env` (`KEY_F00D00000001`):

   ```text
   docker compose run --rm --no-deps -u mosquitto mosquitto mosquitto_passwd -b -c /mosquitto/data/broker-passwd f00d00000001 <key>
   ```

   `-c` = a new file; `-b` = the password on the command line, briefly visible in the process list and left behind in the terminal history, so only for this exercise. **Result** (the author's lab, another account): `Adding password for user …`.
5. `docker compose up -d`, then check both logs as in 6.5.
6. In the `tools` terminal, stop the simulator (**Ctrl + C**), run `node --env-file=.env device-simulator.js mqtt://127.0.0.1:1884 1`, then `garden start`. The gateway uses the same `edge/acl-broker`, so block 2b is already open. The dashboard stays **Live** and **Lamp** is answered with an `ack` through the bridge, exactly the boxes of 6.5–6.6, which were recorded this way.

Done? `docker compose down` in the `edge` folder (without `-v`), then the simulator goes back to `mqtt://127.0.0.1:1883`. `host-gateway` in Docker Desktop wasn't tested by the author.

> ⬆️ **Done with Practice 6?** Read [Concept 9](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning), then continue to [Practice 7](#practice-7--grafana-as-files-provisioning-and-a-one-off-grafana_reader-account-40-minutes).

### Practice 7 — Grafana as files: provisioning and a one-off `grafana_reader` account (40 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder and a terminal at the **project root** (Git and `docker compose`); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux); **Chrome** or **Edge** (Grafana `http://localhost:3000`); **Telegram**; your password manager (the **old** Grafana admin password). Concepts used: 9.
>
> ⭐ **Required** — steps 7.3 and 7.4: the old rule, contact point, and data source deleted in order, then one `docker compose up -d` installs everything again from files: **Provisioned**, the **Test** arrives, and the dashboard's **Save** is refused.

Your Compose Grafana is still the Module 25 Grafana: its contents are the result of clicks in the `smarthome-grafana-data` cupboard. This practice hands it over to the files in `grafana/` ([Concept 9](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning)), so that Grafana on any laptop, a friend's laptop included, starts complete without a click. 7.1–7.2 only write files; the old Grafana keeps running until 7.4.

#### 7.1 Provisioning files: the `smarthome-db` data source, the dashboard, the contact point, and the rule (12 minutes)

The new files go into a new folder `grafana/provisioning/`; don't mix it up with `grafana/dashboards/` (the Module 25 JSON). For each file: right-click the **`grafana`** folder in VS Code → **New File…**, type its path (the folders are created along with it), paste the **Copy raw file** content of the file with the same path in [`code/grafana/provisioning/`](code/grafana/provisioning/), then save.

**(a) `provisioning/datasources/smarthome.yaml`:**

```yaml
# smarthome.yaml - the Mini Smart Home PostgreSQL data source as a provisioning file (Module 26). Its fields are the same as the
# Module 25 screen (Connections -> Data sources), plus the FIXED uid smarthome-db: the dashboard and the alert rule in the repo
# point at this uid, so both are connected at once in any Grafana started from compose.cloud.yml.
# The grafana_reader password is NOT written here: Grafana takes it from the variable GRAFANA_READER_PASSWORD (from .env through
# compose.cloud.yml). Written $GRAFANA_READER_PASSWORD, not ${...}: the braced form can be read twice if the password holds a $.
apiVersion: 1
datasources:
  - name: smarthome-db
    uid: smarthome-db
    type: grafana-postgresql-datasource
    # db = the database service's name in compose.cloud.yml (the Compose hallway), counter 5432 inside the hallway
    url: db:5432
    user: grafana_reader
    jsonData:
      database: smarthome
      sslmode: disable
      timescaledb: true
      # the grafana_reader account may hold at most 5 connections: Grafana uses 4, one stays free for psql (Module 25)
      maxOpenConns: 4
    secureJsonData:
      password: $GRAFANA_READER_PASSWORD
    # locked on the screen: changes go through this file, then docker compose restart grafana
    editable: false
```

Its settings = the Module 25 data source screen (`grafana_reader`, **Max open** 4, [Concept 3 of Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#3-the-smallest-possible-rights-grafana-may-only-read)); the differences: a fixed uid `smarthome-db`, the address `db:5432` (a service name), and the password as a variable name.

**(b) `provisioning/dashboards/smarthome.yaml`:**

```yaml
# smarthome.yaml - the dashboard provider (Module 26): Grafana installs every .json file in /etc/grafana/dashboards
# (= the grafana/dashboards folder in the repo, mounted by compose.cloud.yml) into the "Mini Smart Home" folder.
apiVersion: 1
providers:
  - name: smarthome
    folder: Mini Smart Home
    type: file
    # a dashboard from a file can't be deleted on the screen
    disableDeletion: true
    # false = the Save button on the screen is refused ("This dashboard cannot be saved from the Grafana UI because it has been
    # provisioned from another source"). Changing the dashboard: change it on the screen, Export ->
    # Export as JSON (Classic), overwrite the file in grafana/dashboards, then docker compose restart grafana.
    allowUiUpdates: false
    # files from a folder mounted by Docker are checked again every 30 seconds (more than 10, as Grafana's docs recommend)
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/dashboards
```

`/etc/grafana/dashboards` = the `grafana/dashboards` folder, seen from inside the container (7.2). The menu its comment names, **Export as JSON**, is called **Export as code** in Grafana 13.2.4 (7.3).

**(c) `provisioning/alerting/telegram-contact.yaml`:**

```yaml
# telegram-contact.yaml - the "Telegram Smart Home" contact point as a provisioning file (Module 26). Its fields are the same as
# the Module 25 Practice 4.1 screen: the Telegram integration, Parse mode None, the 🔴/✅ message template, the "resolved" message still sent.
# The bot token and chat_id are NOT written here: Grafana takes them from the variables TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
# (from .env through compose.cloud.yml). Empty in .env = compose.cloud.yml gives "not-set-yet" and 0, because a Telegram contact point
# without a token makes Grafana fail to start.
apiVersion: 1
contactPoints:
  - orgId: 1
    name: Telegram Smart Home
    receivers:
      - uid: telegram-smart-home
        type: telegram
        settings:
          bottoken: $TELEGRAM_BOT_TOKEN
          chatid: "$TELEGRAM_CHAT_ID"
          parse_mode: None
          message: '{{ range .Alerts.Firing }}🔴 {{ .Annotations.summary }}{{ "\n" }}{{ end }}{{ range .Alerts.Resolved }}✅ {{ .Labels.node }} is sending data again.{{ "\n" }}{{ end }}'
        disableResolveMessage: false
```

Its settings = the screen of [Module 25 4.1](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#41--the-telegram-smart-home-contact-point-a-message-template-and-the-test-button-15-minutes): **Parse Mode** `None`, the 🔴/✅ template exactly; the token and chat_id are only variable names.

**(d) The `Silent node` rule, moved.** Its destination folder has existed since (c). In the project-root terminal:

```text
git mv grafana/alerting/silent-node.yaml grafana/provisioning/alerting/silent-node.yaml
```

Git records it as a rename (success = no answer). The `grafana/alerting` folder left empty may be deleted. Replace the **entire** content of the moved file with the **Copy raw file** content of [`code/grafana/provisioning/alerting/silent-node.yaml`](code/grafana/provisioning/alerting/silent-node.yaml). Compared with your export from [Module 25 9.2](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#92--export-the-dashboard-classic-json-and-the-alert-rule-archive-yaml-to-grafana-12-minutes), the differences are the header comment, the rule's `uid` (from the author's file, the one that was tested), and one line:

```yaml
              datasourceUid: smarthome-db
```

**(e) The dashboard JSON.** Open **your own** `grafana/dashboards/system-health.json`: the dashboard uid on the bottom `"uid"` line is the same as the uid in your cupboard, and that's the condition for a takeover without a twin. The author's file (uid `ad6w2nq`) could become a twin (not tested). Press **Ctrl + H** (macOS **Cmd + Option + F**), make sure the regex icon `.*` is off, search for `${DS_GRAFANA-POSTGRESQL-DATASOURCE}`, replace it with `smarthome-db`, click **Replace All**, then save. In the Module 25 key file, 11 lines change to:

```json
        "uid": "smarthome-db"
```

That key file is now byte for byte the same as [`code/grafana/dashboards/system-health.json`](code/grafana/dashboards/system-health.json); your export may differ in the dashboard's `uid`, `version`, and `description`. `__inputs` (without `${…}`) isn't replaced and does no harm.

**(f) `provisioning/plugins/no-plugins.yaml`:** below its comment there's only `apiVersion: 1` and `apps: []`. Without this file, Grafana's log writes one `level=error` about the `plugins` folder.

#### 7.2 The final `compose.cloud.yml`: the `grafana-account` service and Grafana's secrets in `.env` (8 minutes)

Open [`code/compose.cloud.yml`](code/compose.cloud.yml) on GitHub, click **Copy raw file**, then paste it in place of the **entire** content of your `compose.cloud.yml` and save: this is the final file of Module 26. What differs from 5.2 (comments removed, `# …` = skipped):

```yaml
  grafana-account:
    image: timescale/timescaledb:2.30.2-pg17
    environment:
      # …
      GRAFANA_READER_PASSWORD: ${GRAFANA_READER_PASSWORD:?fill in GRAFANA_READER_PASSWORD in .env}
    command:
      - sh
      - -c
      - |
        set -e
        if [ "$$(psql -tAc "SELECT 1 FROM pg_roles WHERE rolname = 'grafana_reader'")" = "1" ]; then
          echo "account grafana_reader already exists: skipped"
        else
          psql -v ON_ERROR_STOP=1 -f /grafana/grafana-user.sql
        fi
        echo "ALTER ROLE grafana_reader PASSWORD :'password';" | psql -v ON_ERROR_STOP=1 -v password="$$GRAFANA_READER_PASSWORD"
        echo "grafana_reader password synced with GRAFANA_READER_PASSWORD in .env"
    volumes:
      - ./grafana:/grafana:ro
    tmpfs:
      - /var/lib/postgresql/data
    depends_on:
      migrate:
        condition: service_completed_successfully
    restart: "no"
    # …
  grafana:
    # …
    environment:
      # …
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:?fill in GRAFANA_ADMIN_PASSWORD in .env}
      GRAFANA_READER_PASSWORD: ${GRAFANA_READER_PASSWORD:?fill in GRAFANA_READER_PASSWORD in .env}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:-not-set-yet}
      TELEGRAM_CHAT_ID: ${TELEGRAM_CHAT_ID:-0}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/etc/grafana/dashboards:ro
    # …
    depends_on:
      grafana-account:
        condition: service_completed_successfully
```

`grafana-account` = the third one-off service. It only borrows `psql` from the database image (`tmpfs` prevents nameless cupboards), creates `grafana_reader` if it doesn't exist yet, then on **every** `up` syncs its password with `.env` through a `psql` variable (never printed). You don't need to look for the old password. `grafana` gets four variables and two read-only windows (Concept 6), then waits for `grafana-account` to go home with the job done.

Fill in these lines in the root `.env` (random secrets: the command of [5.1](#51-the-central-broker-edgecenterconf-the-pi-bridge-acl-block-and-the-broker-account-and-mosquitto-services-12-minutes) (d)), save, and note them in your password manager:

1. **`GRAFANA_READER_PASSWORD=`**: a **new** secret.
2. **`GRAFANA_ADMIN_PASSWORD=`**: a new secret. It must be filled in, but only a Grafana with an empty cupboard uses it (a friend's laptop); in your cupboard, the old admin password still applies.
3. **`TELEGRAM_BOT_TOKEN=`** and **`TELEGRAM_CHAT_ID=`**: copy them from `backend/.env` ([Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#63-telegram-settings-in-env)). Even empty, Grafana still starts (defaults `not-set-yet` and `0`); only its sending fails. Filled in, the home-mode backend uses that bot too: two backends at once are now refused by Telegram with `409: Conflict` (5.6).

```text
docker compose config --quiet
```

**Result:** silence (the author's lab: exit code 0). A forgotten line is answered as in 5.2, ending with `fill in <NAME> in .env`.

> [!WARNING]
> **Don't `docker compose up -d` yet.** This file on top of a cupboard that hasn't been taken over makes the `Telegram Smart Home` contact point hold two integrations, and every alert is sent twice (the author's research prototype). Do 7.3 first.

#### 7.3 ⭐ The takeover: delete the rule, then the contact point, then the old data source (10 minutes)

In the Grafana that's still running (`http://localhost:3000`, `admin` with the old password), in the order of Concept 9. The dashboard isn't deleted; **Notification policies** don't need to be touched (proven).

**(a) Has the dashboard changed since the Module 25 9.2 export?** Export it again: the **Export** icon → **Export as code** → **Advanced options** → **Model** **Classic**, the **Share dashboard with another instance** switch on → **Download file**. Overwrite `grafana/dashboards/system-health.json`, then repeat 7.1 (e). Not changed? Skip it.

**(b) The rule.** **Alerting → Alert rules**. The `node-health` group (folder `Mini Smart Home`) is folded; click its arrow. On the `Silent node` row: **More** → **Delete** → the `Delete rule` dialog → **Yes, delete**. The list is only clean after **F5**; the rule moves to the **Recently deleted** tab and doesn't disturb the files.

**(c) The contact point.** **Alerting → Notification configuration → Contact points**. `Telegram Smart Home` is now `Unused`: **More** → **Delete** → the `Delete contact point` dialog → **Yes, delete contact point**.

**(d) The old data source.** **Connections → Data sources** → `grafana-postgresql-datasource` → the **Delete** button at the bottom of the page → the `Delete` dialog → **Delete**.

**Result** (the author's lab, through the screen): `No data sources defined`. The wrong order was tried too: while the rule still exists, the contact point's **Delete** is grayed out, and hovering over it shows:

```text
Contact point cannot be deleted for the following reasons:
Contact point is referenced by one or more alert rules
```

See this? The rule isn't deleted yet; repeat (b). (Through the API, the wrong order is answered with `409` `Receiver is used by 1 rule(s)`.)

**You pass this ⭐ step** when the old rule, contact point, and data source are deleted in that order, while the `System Health` dashboard is still there.

#### 7.4 ⭐ `docker compose up -d`: Provisioned, the Test button, and a refused Save (10 minutes)

In the project-root terminal:

```text
docker compose up -d
```

**Expected output** (the author's lab, cut):

```text
 ✔ Container smarthome-migrate-1          Exited                                   5.1s
 ✔ Container smarthome-backend-1          Healthy                                 15.2s
 ✔ Container smarthome-grafana-account-1  Exited                                   6.2s
 ✔ Container smarthome-grafana-1          Started                                  6.7s
…
```

`grafana` is recreated with the files; `migrate` and `backend` are recreated too if you've just filled in `TELEGRAM_*` (the Garden card briefly says `waiting for a reading…`). Then:

```text
docker compose logs grafana-account
```

**Expected output** (the author's lab):

```text
grafana-account-1  | account grafana_reader already exists: skipped
grafana-account-1  | ALTER ROLE
grafana-account-1  | grafana_reader password synced with GRAFANA_READER_PASSWORD in .env
```

Check `docker compose ps -a`: `grafana-account` `Exited (0)`, `grafana` `(healthy)` (wait ±13 seconds). At `http://localhost:3000`, the login session is still valid (the author's lab); if asked to log in, use the **old** admin password (the `.env` password is refused). Compare with your notes from [1.3](#13-grafanas-fingerprint-dashboards-rules-contact-point-and-the-test-button-5-minutes):

- **Connections → Data sources**: only `smarthome-db` · `PostgreSQL` · `db:5432` · `default` (the author's lab, through the API: `Database Connection OK`).
- **Alert rules**, the `node-health` group: `Silent node` **Provisioned**, `Normal`, no **Edit** button.
- **Contact points**: `Telegram Smart Home` · `Used by 1 alert rules` · **Provisioned**; **Edit** is replaced by **View**. **View** → the banner `This contact point cannot be edited through the UI` → **Test** → **Send test notification** → `Test notification sent successfully`, and `🔴 Notification test` arrives (the author's lab: the mock Telegram server, 11:53:46 WIB).
- **Dashboards → Mini Smart Home → System Health**: only one, with no **Provisioned** mark, its panels filled.

In `System Health`, click **Edit** → **Save**. **Expected output** (the author's lab, cut), the drawer on the right:

```text
Save dashboard
System Health
This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source. Copy the JSON or save it to a file below, then you can update your dashboard in the provisioning source.
See documentation for more information about provisioning.
File path:
```

Not an error: a deliberate lock (`allowUiUpdates: false`). Click **Cancel** → **Exit edit**. Don't overwrite the repo file through **Save JSON to file** in that drawer: its format is `dashboard.grafana.app/v2`, not Classic. Changing it later: try it on the screen, export as in 7.3 (a), then replace every `${DS_…}` with `smarthome-db` (the rule: edit `silent-node.yaml`), `docker compose restart grafana`, then commit (not tested by the author).

**`First panel` is red.** The practice dashboard of the [Module 25 Quick Win](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#step-6--the-first-panel-a-temperature-query-with-format-time-series-then-save-6-minutes) still points to the deleted data source (the author's lab: `No data`; API: `Data source not found`). It isn't locked: edit its panel, choose `smarthome-db`, then **Save**; or delete that dashboard.

**Proof of "no doubles" (optional, ±15 minutes).** Stop the data flow (laptop path: **Ctrl + C** in the simulator; Kit B: unplug Node 1's power, not tested by the author), wait for each node's 🔴, then switch it on again. Each node gets exactly one 🔴 and one ✅ from Grafana, as received by the mock Telegram server in the author's lab (the first 🔴 5 min 39 s after the last reading; the backend's 📴/✅ messages are separate):

```text
🔴 Practice living room (f00d00000001) is not sending data, 5.1 minutes behind schedule
🔴 Garden (mock) (f00d000000b2) is not sending data, 5.2 minutes behind schedule
✅ Practice living room is sending data again.
✅ Garden (mock) is sending data again.
```

![Composite of real screenshots of Grafana 13.2.4 in its dark theme in Chrome 156, Linux on a Raspberry Pi 5 playing the laptop, Practice 7.4, after the Module 25 rule, contact point, and old data source were deleted (the lab used the API) and docker compose up -d with grafana/provisioning. Top left, Alerting, Alert rules: Grafana-managed, folder Mini Smart Home, group node-health 1m with only More; the rule row with a green tick, Silent node with the purple Provisioned badge (number 1), the summary template, the data source smarthome-db (number 1), and only the More button, no Edit (number 1). Below it, Contact points: Telegram Smart Home, Used by 1 alert rules, Provisioned (number 2), the View button instead of Edit (number 2). Below it, View: the blue banner This contact point cannot be edited through the UI, This contact point has been provisioned, that means it was created by config. Please contact your server admin to update this contact point (number 3), Name Telegram Smart Home, the Test button (number 3), then Integration Telegram, BOT API Token showing configured, not the token, and Chat ID 777000222 (number 3). Top right, the Save dashboard drawer, System Health, Details tab: This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source. Copy the JSON or save it to a file below, then you can update your dashboard in the provisioning source. See documentation for more information about provisioning (number 4); File path empty, Advanced options, Update default variable values; the JSON editor starting apiVersion dashboard.grafana.app/v2 (number 5), kind Dashboard, name ad6w2nq; the buttons Cancel, Copy JSON to clipboard, Save JSON to file. Bottom, the System Health dashboard shot at 13:00 WIB with the left menu closed: the breadcrumb Dashboards, Mini Smart Home, System Health (number 6), the variable Node All (number 6), Last 6 hours WIB, Refresh 1m, Edit; the RSSI panel with the Practice living room line between about -40 and -78 dbm from about 08:40 on and the dashed line -75 (number 7), Uptime 1 hour (number 7), Heap 180 to 200 kB (number 7), the table Minutes behind schedule: f00d00000001 Practice living room 0.2 and f00d000000b2 Garden (mock) -0.1 (number 7), and Node 2 packets per hour (should be 12) with five bars, 1, 7, 6, and 7 in orange for 08:00 to 11:00 and 12 in green for 12:00 at the dashed line 12, legend less than 12 and 12+ (number 8). Telegram is the lab's mock server; Chat ID 777000222 is a fake number.](assets/grafana-provisioned.png)

Save to the branch from the root terminal (`.env` is still held back by `.gitignore`):

```text
git add grafana compose.cloud.yml
```

```text
git commit -m "Grafana as files: provisioning and the grafana_reader account (Module 26 Practice 7)"
```

**You pass this ⭐ step** when `grafana-account` is `Exited (0)`, `grafana` `(healthy)`, the only data source left is `smarthome-db`, the rule and the contact point are **Provisioned**, the **Test** arrives, the dashboard's **Save** is refused, and `grafana/` is committed.

> ⬆️ **Done with Practice 7?** Continue to [Practice 8](#practice-8--coming-back-to-life-by-itself-and-data-that-stays-30-minutes). The restart policy table in [Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs) is used there.

### Practice 8 — Coming back to life by itself, and data that stays (30 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: a terminal at the **project root** (`docker`) and the `tools` terminal (simulator); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with the Compose home running; Kit B: an **SSH terminal to the Pi** in the folder `mini-smart-home/edge`; **Chrome** or **Edge** (`http://localhost`). Concepts used: 6 and 8.
>
> ⭐ **Required** — steps 8.1 and 8.4: after `docker compose exec backend kill 1`, the backend comes back to life by itself (`RestartCount` goes up by one), and the history fingerprint after `docker compose down` and then `up -d` is exactly the same as before (**L3**).

Two promises of Compose are tested: a program that stops by itself comes back to life, and the history stays when the home is taken down and built again. Your guide is the restart policy table in [Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs).

#### 8.1 ⭐ `docker compose exec backend kill 1`: the backend comes back to life by itself (8 minutes)

All commands from the project-root terminal. First, how many times Docker has already restarted the backend container:

```text
docker inspect -f '{{.RestartCount}}' smarthome-backend-1
```

**Result** (the author's lab): `0`. The `'{{…}}'` quotes weren't tested by the author in PowerShell/CMD. Now ask the backend to stop **from inside** its container:

```text
docker compose exec backend kill 1
```

The terminal prints nothing. `kill 1` sends a stop signal to process number 1 in that container, which is the backend itself. Check right away:

```text
docker compose ps backend
```

**Result** (the author's lab, two seconds later): the `STATUS` column says `Up 2 seconds (health: starting)`, while `CREATED` stays `19 minutes ago`. The container is the same; only its program has just started. Then the count:

```text
docker inspect -f '{{.RestartCount}}' smarthome-backend-1
```

**Result:** `1`. What happened, according to the log:

```text
docker compose logs --since 1m backend
```

**Expected output** (the author's lab, cut; times in WIB):

```text
backend-1  | [21:37:53] INFO: SIGTERM received: the backend is stopping gracefully
backend-1  | [21:37:53] INFO: backend stopped
backend-1  | [21:38:00] INFO: database ready
…
backend-1  | [21:38:00] INFO: connected to broker mqtt://mosquitto:1883 as backend
```

The backend receives `SIGTERM` and [stops cleanly](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#610-stopping-cleanly) as in Module 19, with exit code 0. Because it wasn't you who told Docker to stop it, `restart: unless-stopped` brings it back to life; ±7 seconds later it's ready. This is the Syllabus's "stopping one container and watching it come back to life by itself": the program inside the container stops by itself. It isn't a crash (Concept 8), but the same policy also helps a program that crashes.

**You pass this ⭐ step** when `RestartCount` goes up by one (the author's lab: `0` became `1`), `STATUS` says `Up … seconds` while `CREATED` hasn't changed, and the log contains `SIGTERM received: the backend is stopping gracefully` and then `database ready`.

#### 8.2 For comparison: after `docker compose stop backend`, the backend stays off (6 minutes)

```text
docker compose stop backend
```

**Result** (the author's lab): `✔ Container smarthome-backend-1  Stopped  0.7s`. The dashboard at `http://localhost` writes `Something went wrong (502).` when it asks for data (from the code, not recorded): Caddy is running, the backend behind it isn't. Wait 15 seconds, then:

```text
docker compose ps -a backend
```

**Result** (the author's lab): `STATUS` `Exited (0) 15 seconds ago`, and `RestartCount` (the 8.1 command) stays `1`. Without `-a`, a stopped container doesn't show at all. Its exit code is the same as in 8.1 (0), but this time Docker doesn't bring it back, because `stop` is your decision: the `docker compose stop` row in the table of Concept 8. Start it again:

```text
docker compose start backend
```

**Expected output** (the author's lab):

```text
[+] Running 4/4
 ✔ Container smarthome-db-1              Healthy                                1.6s
 ✔ Container smarthome-broker-account-1  Exited                                 1.1s
 ✔ Container smarthome-migrate-1         Exited                                 2.6s
 ✔ Container smarthome-backend-1         Started                                0.6s
```

`start` also calls the two one-off helpers in the `depends_on` chain (`broker-account`, `migrate`); that's safe, because both skip what already exists.

#### 8.3 Bonus: the broker stops for a moment, the backend and the bridge reconnect by themselves (4 minutes)

This time it's the central broker that stops by itself:

```text
docker compose exec mosquitto kill 1
```

Wait ±8 seconds, then `docker compose ps mosquitto`. **Result** (the author's lab): `STATUS` `Up 8 seconds`, `CREATED` `35 minutes ago`. Right away (`--since 30s` = the last 30 seconds), run `docker compose logs --since 30s mosquitto`. **Expected output** (the author's lab, cut; ACL warnings removed):

```text
mosquitto-1  | 1793198363: mosquitto version 2.1.2 terminating
…
mosquitto-1  | 1793198364: Restored 2 retained messages
…
mosquitto-1  | 1793198367: New bridge connected from 172.19.0.1:34254 as pi-bridge (p4, c0, k60, u'pi-bridge').
mosquitto-1  | 1793198368: New client connected from 172.19.0.5:60550 as backend (p4, c1, k60, u'backend').
```

The broker is back to life within ±1 second, and its cupboard's contents (the password file, the retained messages) stay. `docker compose logs --since 30s backend` writes `broker not reachable yet, retrying in 5 seconds`, then `connected to broker mqtt://mosquitto:1883 as backend`: ±5 seconds after the broker stopped, without you touching anything. Kit B: `docker compose logs --since 40s mosquitto` in the Pi's `edge` folder writes `Bridge center next backoff will be 5000 ms`, then `Connecting bridge center (center:1883)`; in the author's lab, the bridge was connected again 4 seconds after the central broker stopped. The address after `from` differs in your home, as in 6.5. The laptop path without a gateway has no `pi-bridge` line.

#### 8.4 ⭐ L3: the same fingerprint after `docker compose down` and then `up -d` (8 minutes)

Pass requirement **L3**: the history data are still there after `docker compose down` and then `up -d`. So that the number of readings stays still during the test, stop the data flow first:

- the laptop path, and also Kit B if its 5.5 simulator is still running: **Ctrl + C** in the `tools` terminal;
- Kit B: on the Pi, in the `edge` folder, `docker compose stop mosquitto` (the gateway stops, Node 1 and the Garden can't send), or unplug Node 1's power. This way wasn't tested by the author on a Pi.

Then take the fingerprint with the script of [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes) (the PowerShell variant in [4.5](#45--the-fingerprint-after-equals-the-one-before-then-check-grafana-in-the-same-cupboard-12-minutes)):

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

Save the row in `fingerprint.md` as "Before down (8.4)". Take the whole home down:

```text
docker compose down
```

Have you ever switched on the `monitoring` profile ([🧩 Level 2](#level-2--uptime-kuma-the-monitoring-profile-and-one-monitor-through-a-service-name-fill-in-the-blanks-40-minutes))? Use `docker compose --profile monitoring down`; a plain `down` leaves Uptime Kuma and its hallway behind (`Resource is still in use`, the author's lab). **Expected output** of a plain `down` (the author's lab, cut):

```text
 ✔ Container smarthome-grafana-1          Removed                              1.0s
…
 ✔ Container smarthome-db-1               Removed                              0.8s
 ✔ Container smarthome-broker-account-1   Removed                              0.1s
 ✔ Network smarthome_default              Removed                              0.2s
```

Eight containers and their hallway are removed, but **there isn't a single `Volume` line**: the `external` cupboards aren't touched, and without `-v`, Compose's own cupboard (`smarthome_broker-data`) isn't either. Build it again:

```text
docker compose up -d
```

(Or `up -d --wait`, Concept 8.) ±24 seconds in the author's lab, in exactly the order of the Concept 8 timeline. Take the fingerprint again with the same command. **Expected output** (the author's lab; before `down` and after `up -d` exactly the same):

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2433 | 22cde451b345407a8f85777ba6a1ef9b |       145 |      9 |    3 |        2 |       3
(1 row)
```

Compare it with the "Before down" row you just saved, not the 1.2 row: since 5.5 new readings have kept coming in (lab: 2,318 became 2,433), and `summaries` went from 379 to 145 because of the background job explained in 1.2. Save it as "After up (8.4, L3)". Then switch the data flow on again: run the simulator you stopped again in the `tools` terminal (5.5; the laptop path also `garden start`); Kit B `docker compose start mosquitto` in the `edge` folder (or plug Node 1's power back in). The dashboard is **Live** again. Stopped for more than ±5 minutes? A 🔴 "Silent node" may come; the ✅ follows, as during the move.

**You pass this ⭐ step (L3)** when `readings`, `fingerprint`, `accounts`, and `devices` after `up -d` are exactly the same as the row before `down`, and the output of `down` doesn't contain a single `Volume` line.

#### 8.5 Never `down -v`, then (optional) restart Docker or reboot the Pi (4 minutes)

> [!WARNING]
> **`down -v` also deletes Compose's own cupboards.** Proof from the author's lab in a separate test project, with a named cupboard that was not given `external` ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)):
>
> ```text
>  ✔ Container red-test-fill-1  Removed                                          0.5s
>  ✔ Network red-test_default   Removed                                          0.2s
>  ✔ Volume red-test-data       Removed                                          0.0s
> ```
>
> In the author's clean-laptop test project (Practice 11), `down -v` deleted `…_broker-data`, while the two `external` cupboards survived. In your home, that means the broker's password file is gone: every broker account other than `backend` (e.g. the simulator, `checker`, `pi-bridge`) has to be created again as in 5.5. So `down` is always without `-v`, and never `docker volume rm smarthome-…` or `docker system prune --volumes` on the laptop that holds your real history.

**Optional: restart Docker or reboot.**

> [!NOTE]
> **Not recorded by the author.** The results below = what to expect according to Docker's documentation and code.

1. Docker Desktop: right-click the whale icon in the notification area (macOS: click its icon in the menu bar) → **Quit Docker Desktop**, open it again, and wait until its icon stops moving ([Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#-setup-installing-docker-desktop-3045-minutes-only-once)). Docker Engine (Linux): `sudo systemctl restart docker`. Kit B: `sudo reboot` in the SSH terminal, wait ±1 minute, then SSH in again.
2. `docker compose ps -a` (project root; on the Pi the `edge` folder): the `unless-stopped` services that were running are back `Up` without `up -d`, the services you `stop`ped yourself stay off, and the one-off helpers stay `Exited`. Docker Engine on the Pi starts by itself at boot; Docker Desktop only when its app is opened.
3. This time Docker may start the containers without the `depends_on` order (Concept 8). If the backend starts before the database, its log writes `automation rules couldn't be loaded yet: …` and the dashboard's **Rules** screen is empty although the backend is `(healthy)`. The cure is `docker compose restart backend` ([🚨](#-troubleshooting)).

This practice doesn't change any file, so there's no commit.

> ⬆️ **Done with Practice 8?** Continue to [Practice 9](#practice-9--backing-up-the-cupboards-and-a-restore-test-in-a-separate-project-35-minutes) (optional, highly recommended: a backup that's proven to restore). If you skip it, read [Concept 11](#11-the-image-shop-ghcr-and-architecture), then do [Practice 11](#practice-11--the-clean-laptop-test-45-minutes).

### Practice 9 — Backing up the cupboards and a restore test in a separate project (35 minutes)

> 🖥️ **Tools used:** **VS Code** with the `mini-smart-home` folder: a terminal at the **project root** and, for the laptop path, the `tools` terminal (simulator); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with the Compose home running; Kit B: an **SSH terminal to the Pi** in the folder `mini-smart-home/edge`. Concepts used: 6.

Optional, but highly recommended, because the rule of [Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md#9-backup-and-restore-photocopy-the-archive-then-prove-it-can-be-restored) still holds: a backup that has never been restored is the same as having no backup. The recipe is Module 18's recipe in its Compose version, but the archive is restored into a **separate Compose project** in a new cupboard: your home keeps running.

#### 9.1 `pg_dump` inside the container, then `docker compose cp` to `backup/` (8 minutes)

`pg_dump` may run while data are coming in, but the 9.3 fingerprint only matches when the data are still. Stop the data flow as in 8.4 (laptop path: **Ctrl + C** in `tools`; Kit B: `docker compose stop mosquitto` in the Pi's `edge`).

The copy runs the retention when it's restored, and at every 07:00 WIB one binder of the Module 18 test data passes 90 days. So that the 9.3 fingerprint matches, first run the home's retention as in 7.2 of Module 18 (your job number is in 6.3 of Module 18; not recorded by the author), and finish 9.1–9.3 before the next 07:00 WIB. From the project-root terminal:

```text
docker compose exec db psql -U postgres -d smarthome -c "CALL run_job(1001);"
```

Its answer is `CALL`, as in Module 18. Then the archive:

```text
docker compose exec db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
```

As in Module 18: `-Fc` = the packed format; `-f /tmp/…` = a file inside the container (`>` damages the file in PowerShell 5.1). **Result** (the author's lab): four normal lines (Module 18), starting with `pg_dump: warning: there are circular foreign-key constraints …`.

Create a `backup` folder at the project root (`mkdir backup`), then copy the archive out. Use today's date in its name; the following commands follow that name:

```text
docker compose cp db:/tmp/smarthome.dump backup/smarthome-2026-10-28.dump
```

`docker compose cp <service>:<path> <destination>` = the `docker cp` of Module 18, with a service name. **Result** (the author's lab): `✔ smarthome-db-1 copy … Copied`; the archive is ±98 KB for 2,382 readings (recorded before 8.4). Note its versions: an archive is restored into the same TimescaleDB version (Concept 9 of Module 18):

```text
docker compose exec db postgres --version
```

```text
docker compose exec db psql -U postgres -d smarthome -c "\dx timescaledb"
```

**Result** (the author's lab): `postgres (PostgreSQL) 17.11` and the line `timescaledb | 2.30.2 | public | …`. Take the home's fingerprint while its data are still (PowerShell: the 4.5 variant):

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

Save the row in `fingerprint.md` as "At backup time (9.1)", together with the archive's name and both versions. After that, the data flow may be switched on again (8.4). Finally:

```text
git status --short --ignored
```

**Result:** among the `!!` lines (ignored by Git) there's `!! backup/`, thanks to [4.2](#42-git-hygiene-first-gitignore-gitattributes-then-env-with-the-old-postgres-password-5-minutes). The archive holds your whole history and your accounts: keep it as private data, and copy it to a flash drive too, as in Module 18.

#### 9.2 The `restore-test` project in a new cupboard: the TimescaleDB restore recipe (15 minutes)

A test project = the same `compose.cloud.yml`, other settings. Copy `.env` (Linux, macOS, Pi; Windows: `copy .env .env.restore`, not tested by the author):

```text
cp .env .env.restore
```

Open `.env.restore` in VS Code, change these six lines, then save:

```text
DB_VOLUME=restore-test-data
PORT_WEB=8091
PORT_BACKEND=8090
PORT_DB=5442
PORT_GRAFANA=3010
PORT_MQTT=1893
```

The new cupboard protects your real history; other counters (any other numbers will do) prevent clashes with your home, which keeps running. The password lines stay. `.env.restore` isn't in Git (`.env.*`). Create its cupboard:

```text
docker volume create restore-test-data
```

**Result:** its own name, `restore-test-data`. Start **only** the test project's `db` service:

```text
docker compose -p restore-test --env-file .env.restore up -d db
```

`-p restore-test` = another project name, replacing `name: smarthome` (Concept 5); `--env-file .env.restore` = the settings from that file, not `.env`. Both are required in **every** command of the test project. **Result** (the author's lab): the hallway `restore-test_default` `Created`, the container `restore-test-db-1` `Started`.

Don't `up -d` the test project without a service name: `GRAFANA_VOLUME` isn't changed, so a second Grafana would start on top of your real Grafana cupboard. The cupboard is empty, so the `POSTGRES_…` form is read: the database `smarthome` already exists, complete with TimescaleDB 2.30.2, and the recipe of [7.4 of Module 18](../../phase-3-backend-data/module-18-timescaledb/README.md#74-build-a-new-archive-restore-into-smarthome_restored) is used without `createdb` and `CREATE EXTENSION` (the author's code lab). `up -d` doesn't wait for that filling; repeat this command until `STATUS` says `(healthy)`:

```text
docker compose -p restore-test --env-file .env.restore ps db
```

Then four commands, one at a time; as in Module 18, what's restored is the archive on the laptop:

```text
docker compose -p restore-test --env-file .env.restore cp backup/smarthome-2026-10-28.dump db:/tmp/restore.dump
```

**Result** (the author's lab): `✔ restore-test-db-1 copy … Copied`. Ask TimescaleDB to get ready:

```text
docker compose -p restore-test --env-file .env.restore exec db psql -U postgres -d smarthome -c "SELECT timescaledb_pre_restore();"
```

**Result:** a one-row table holding `t`. Rebuild its contents:

```text
docker compose -p restore-test --env-file .env.restore exec db pg_restore -U postgres -d smarthome /tmp/restore.dump
```

**Expected output** (the author's lab, ±2 seconds; cut):

```text
pg_restore: error: could not execute query: ERROR:  role "grafana_reader" does not exist
Command was: GRANT USAGE ON SCHEMA public TO grafana_reader;
…
pg_restore: warning: errors ignored on restore: 31
```

Its exit code is 1, and that's **normal**: `pg_dump` copies one database, while database accounts such as `grafana_reader` belong to the whole server, so they aren't in the archive. Only the 31 grants (`GRANT`) for that account fail; the data are intact (9.3). An error that says something **else** deserves suspicion, for example a skipped `timescaledb_pre_restore()` ([🚨](#-troubleshooting)). Finally:

```text
docker compose -p restore-test --env-file .env.restore exec db psql -U postgres -d smarthome -c "SELECT timescaledb_post_restore();"
```

**Result:** `t` again.

#### 9.3 The test project's fingerprint matches, then `grafana_reader` is made again (5 minutes)

The same fingerprint script of [1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes), against the test project. bash/zsh:

```text
docker compose -p restore-test --env-file .env.restore exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

PowerShell (not tested by the author):

```text
Get-Content scripts/fingerprint.sql | docker compose -p restore-test --env-file .env.restore exec -T db psql -U postgres -d smarthome
```

**Expected output** (the author's lab; exactly the same as "At backup time"):

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2382 | a0cdbd6fcf0203d0f1b9dd0572058678 |       145 |      9 |    3 |        2 |       3
(1 row)
```

Save it as "Test project (9.3)". Then `grafana_reader`, the database account that isn't in the archive:

```text
docker compose -p restore-test --env-file .env.restore up -d grafana-account
```

**Result** (the author's lab): `restore-test-db-1` `Healthy`, `restore-test-migrate-1` `Exited`, `restore-test-grafana-account-1` `Started` (`up -d` doesn't wait for one-off helpers). Read their logs:

```text
docker compose -p restore-test --env-file .env.restore logs migrate grafana-account
```

**Expected output** (the author's lab, cut):

```text
grafana-account-1  | CREATE ROLE
…
grafana-account-1  | grafana_reader password synced with GRAFANA_READER_PASSWORD in .env
migrate-1          | 0 new migration(s) applied, 8 applied earlier.
```

`grafana-account` creates `grafana_reader` from `grafana/grafana-user.sql` (Module 25), as on a new laptop. `migrate` runs along (the `depends_on` chain) without new migrations, because the migration records are in the archive.

**Your backup is proven** when `readings`, `fingerprint`, `accounts`, and `devices` of "Test project" equal "At backup time" (`summaries` may differ, 1.2) and `grafana_reader` has been made again.

#### 9.4 Clean up only the test project, then (optional) back up Grafana's cupboard (7 minutes)

> [!WARNING]
> Type the command below **in full**. Without `-p restore-test`, `down` takes down your home (the cupboards are safe, the services are off until `up -d`). Don't `down -v`, don't `docker volume rm` any cupboard other than `restore-test-…`, don't prune (Concept 6).

```text
docker compose -p restore-test --env-file .env.restore down
```

**Result** (the author's lab): three `restore-test-…` containers and the hallway `restore-test_default` `Removed`. The test cupboard is `external`, so `down` doesn't touch it; remove it by its full name:

```text
docker volume rm restore-test-data
```

**Result:** `restore-test-data`. The author's lab: no other cupboard was left behind (`tmpfs`, Concept 6). Also remove `restore-test_broker-data` if it exists (it's created if the test `mosquitto` was ever started). You may keep `.env.restore` for the next exercise.

**Optional: back up Grafana's cupboard.** The dashboards, rules, and contact point are now files in Git (Practice 7), but Grafana's accounts and alert history only exist in its cupboard. That cupboard is `tar`red after Grafana has stopped ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)), with the tool `node:24.22.1-alpine3.24`: it's already there, it carries `tar`, and it runs as root. Three commands, one at a time (bash/zsh):

```text
docker compose stop grafana
```

```text
docker run --rm -v smarthome-grafana-data:/data:ro -v "$PWD/backup":/backup node:24.22.1-alpine3.24 tar czf /backup/grafana-2026-10-28.tgz -C /data .
```

```text
docker compose start grafana
```

The Grafana cupboard (a different name? write that one; a wrong name = a new empty cupboard) is mounted read-only at `/data`, your `backup` at `/backup`; `tar czf` packs it, and `--rm` throws the tool away. `start` also calls `migrate` and `grafana-account` (safe). **Result** (the author's lab): ±9 seconds from `stop` until it's running again; the archive is ±140 KB, owned by root on Linux, but you can delete it.

PowerShell: quote it whole, `-v "${PWD}/backup:/backup"` (not tested by the author). Without `$PWD`: after `stop`, `docker compose cp grafana:/var/lib/grafana backup/grafana-cp`, then `start` (the author's lab: 1.7 MB, the files are yours). Restoring Grafana from these two copies wasn't recorded by the author.

Don't use the Grafana image as the tool: it runs as uid 472 and is refused writing to your folder on Linux (`tar: can't open '/backup/grafana-wrong.tgz': Permission denied`, the author's lab). A database cupboard that's running must never be `tar`red; for that, always `pg_dump`. Automatic backups outside the home and scheduled restore tests wait for Module 30.

No commit: `backup/` and `.env.restore` are ignored by Git.

> ⬆️ **Done with Practice 9?** Read [Concept 11](#11-the-image-shop-ghcr-and-architecture), then continue to [Practice 10](#practice-10--the-image-shop-ghcr-by-hand-35-minutes) and [Practice 11](#practice-11--the-clean-laptop-test-45-minutes).

### Practice 10 — The image shop: GHCR by hand (35 minutes)

> 🖥️ **Tools used:** **Chrome** or **Edge** with your GitHub account (already logged in); **VS Code** with the `mini-smart-home` folder and a terminal at the **project root** (`docker`, Git); **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) with the Compose home running; your password manager; the internet. Concepts used: 11 (and 2 for the layers).

> [!NOTE]
> **Not recorded by the author on the real GHCR.** The author's lab used a stand-in image shop (`registry:3.1.2` on `127.0.0.1`, without an account) on the same machine: `docker compose build`, `push`, `docker history`, and the architecture checks below were recorded there. Creating the PAT, `docker login ghcr.io`, GitHub's package page, and pulling without a login from a public GHCR weren't recorded; GitHub's menu names are taken from GitHub's official documentation (details in [📚 Sources](#-sources--image-credits)).

This practice is **optional**, but it's the recommended road to [Practice 11](#practice-11--the-clean-laptop-test-45-minutes): a friend's laptop only has to pull your two molds from GHCR, without `npm ci` and a build. Without Practice 10, your friend builds them (10.4). One of its steps is permanent: a public package can't be made private again ([Concept 11](#11-the-image-shop-ghcr-and-architecture)), so 10.3 checks its contents first.

#### 10.1 A GitHub token (classic PAT) with `write:packages`, without `repo` (7 minutes)

To log in to Git, you've used Git Credential Manager or GitHub CLI since [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#13-sign-in-to-github-from-the-terminal). Docker needs its own key: according to GitHub's documentation, GHCR only accepts a *classic* personal access token (PAT), a kind of tool-only password whose rights are limited and whose lifetime is set.

1. In Chrome or Edge, open `https://github.com/settings/tokens/new?scopes=write:packages`. This address opens the form for a new classic token with the `write:packages` right already chosen. The long way: **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token** → **Generate new token (classic)**.
2. **Note**: a name to recognize it, for example `docker mini-smart-home`.
3. **Expiration**: short, for example 30 days. An expired token is simply made again.
4. **Select scopes**: `write:packages` ticked (may upload and download molds). If `repo` on the very top line is ticked too, **untick it**: according to GitHub's documentation, that right is broad and not needed.
5. Click **Generate token**, copy the token with the copy icon next to it, then keep it in your password manager. This is your only chance to see it.

Treat the token like a password: it doesn't go into `.env`, Git, a chat, a forum, or an AI. Leaked anyway? Revoke it on the **Tokens (classic)** page, then make a new one.

#### 10.2 `docker login ghcr.io`, then `docker compose build` and `push` (13 minutes)

**(a) Log in to the shop.** In the project-root terminal (`<account>` = your GitHub account name; in the address `ghcr.io/<account>/…` all lowercase):

```text
docker login ghcr.io -u <account>
```

Docker asks for a password: paste the token from your password manager (it doesn't show when pasted), then **Enter**. According to GitHub's documentation, the answer is `Login Succeeded`. This way is the same on every OS; GitHub's documentation also writes a bash variant `echo $CR_PAT | docker login ghcr.io -u <account> --password-stdin` (the token is first stored in the variable `CR_PAT`; if it's typed in the terminal, the history stores the token too). Docker Desktop stores the credentials in the OS keychain, while Docker Engine on Linux without a credential store keeps them in `~/.docker/config.json` as base64: easy to read back, not encryption (Docker's documentation). That's why 10.3 ends with `docker logout`.

**(b) Link the molds to your repo.** In `backend/Dockerfile`, replace `<account>` on this line with your account name in lowercase, and `mini-smart-home` with your repo's name if it differs ([2.3](#23-a-two-stage-dockerfile-block-by-block-10-minutes)):

```dockerfile
LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home"
```

Do the same in `frontend/Dockerfile` (the first `LABEL` line; leave the `description` line below it), then save both. Without this label, the packages on GHCR aren't linked to any repo.

**(c) Check the shelf address.** In the root `.env`, `IMAGE_REGISTRY` from [5.2](#52-composecloudyml-second-stage-migrate-backend-web-and-image_registry-in-env-15-minutes) must be `ghcr.io/` followed by the same account, in lowercase, for example `ghcr.io/budi-santoso` (uppercase is refused, [Concept 11](#11-the-image-shop-ghcr-and-architecture)).

**(d) Build molds with the shop's name.**

```text
docker compose build
```

**Expected output** (the author's lab, cut; the lab's stand-in image shop written as `ghcr.io/<account>`):

```text
[+] Building 2/2
 ✔ ghcr.io/<account>/mini-smart-home-backend:1.3.0  Built                    0.0s
 ✔ ghcr.io/<account>/mini-smart-home-web:1.2.0      Built                    0.0s
```

±50 seconds in the lab. The backend's kitchen layers come from the cache, but the web's `vite build` runs again: `frontend/.dockerignore` doesn't hold back `Dockerfile`, so `COPY . .` changes too when its label is replaced ([Concept 2](#2-a-mold-in-layers-image-tag-digest-and-architecture)). That's normal.

**(e) Drop them off at the shop.** Only `backend` and `web`; `migrate` uses the same mold as `backend`:

```text
docker compose push backend web
```

**Result** (the author's lab, the stand-in shop): the progress lines overwrite each other; what remains is `[+] Pushing 18/18` and 18 `Pushed` lines (9 backend layers, 9 web), done in 3.7 seconds because the shop is on the same machine. To GHCR, ±96 MB compressed travels over your internet, so it takes longer. Refused with `denied` or `unauthorized`? See [🚨](#-troubleshooting).

**(f) Containers follow the new molds.** The running containers still use the old molds, so the `IMAGE` column in `docker compose ps` now says `sha256:…` (the author's lab). This command recreates the containers whose molds changed (the same contents, only the label):

```text
docker compose up -d
```

#### 10.3 Check `docker history`, then make the package public (8 minutes)

A public mold can be downloaded and taken apart by anyone. Check its recipe once more as in [2.4](#24--docker-build-the-image-size-and-a-docker-history-without-secrets-10-minutes), now with its shop name, one at a time:

```text
docker history --no-trunc ghcr.io/<account>/mini-smart-home-backend:1.3.0
```

```text
docker history --no-trunc ghcr.io/<account>/mini-smart-home-web:1.2.0
```

In the `CREATED BY` column, the `LABEL` line now contains your account name; the other lines belong to your recipe (`COPY`, `ENV NODE_ENV=production`) or to the base molds `node` and `caddy`. In the author's lab, the 20 backend lines and 26 web lines were matched against every lab password and token: not one showed up. Is there a password or token? **Stop here**: remove it from the `ENV`, `ARG`, `LABEL`, or `RUN` line in the `Dockerfile`, delete the package (**Package settings** → **Delete this package**; the old versions stay stored there), build and push again, then change that secret.

Then on GitHub, for **each** package (`mini-smart-home-backend` and `mini-smart-home-web`; both still private):

1. Click your profile photo at the top right → **Your profile** → the **Packages** tab.
2. Click the package name, then **Package settings** (the gear icon) on the right side.
3. At the very bottom, in the "Danger Zone" section, click **Change visibility**, choose **Public**, type the package name as confirmation, then click **I understand the consequences, change package visibility**. This can't be undone.

Thanks to `LABEL`, the package is linked to your repo (GitHub's documentation). Now prove that the mold can be pulled even without a login, and remove the credentials from the laptop at the same time:

```text
docker logout ghcr.io
```

```text
docker pull ghcr.io/<account>/mini-smart-home-web:1.2.0
```

Finishing without an error (the mold is already on your laptop, so its layers aren't downloaded again) = a friend's laptop can do it too (not recorded by the author). `denied` or `unauthorized` usually means that package is still private ([🚨](#-troubleshooting)).

#### 10.4 Architecture: arm64 versus amd64, and a way out for a friend's laptop (7 minutes)

Your mold only fits the processor type of the laptop that built it ([Concept 11](#11-the-image-shop-ghcr-and-architecture)). Check it (the `'{{…}}'` quotes weren't tested by the author in PowerShell/CMD):

```text
docker image inspect --format '{{.Os}}/{{.Architecture}}' ghcr.io/<account>/mini-smart-home-backend:1.3.0
```

**Result** (the author's lab): `linux/arm64`. Then the processor type of the Docker machine on your laptop:

```text
docker version --format '{{.Server.Arch}}'
```

**Result** (the author's lab): `arm64`. An Intel or AMD laptop answers `amd64`. Write down your answer, then compare it with your friend's laptop:

| Your friend's laptop compared with yours | What it means in [11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes) |
| :-- | :-- |
| Both `amd64` (Intel, AMD) or both `arm64` (Mac with Apple silicon, Snapdragon, Pi) | `docker compose up -d` pulls your molds from GHCR |
| Different | The pull is refused; your friend adds `--build` and builds them |

You can see what the refusal says yourself. If your laptop is `arm64`:

```text
docker pull --platform linux/amd64 ghcr.io/<account>/mini-smart-home-backend:1.3.0
```

**Expected output** (the author's lab, from the stand-in shop; exit code 1):

```text
Error response from daemon: no matching manifest for linux/amd64 in the manifest list entries: no match for platform in manifest: not found
```

Your laptop is `amd64`? Write `linux/arm64`; the error is similar, with that architecture's name (not recorded by the author).

**The way out for a friend with a different one:** `docker compose up -d --build` builds both molds from the `Dockerfile`s in the repo (it needs npm downloads and a few minutes; note it in L1). Even without `--build`, Compose builds them by itself when the pull fails: proven in the author's lab when the stand-in shop didn't hold the image yet or wasn't running (`failed to resolve reference …`, then a build). The real GHCR's answer and a pull of another architecture haven't been tested yet, so write `--build`. One mold for two architectures is made automatically in Module 29; the manual command is previewed in [🔬](#-technical-deep-dive-optional).

Want a friend's laptop to pull your images directly? First fill in `IMAGE_REGISTRY=ghcr.io/<lowercase-account>` in `.env.example` (it isn't a secret; the comment above it suggests the same). Then save to the branch from the root terminal:

```text
git add backend/Dockerfile frontend/Dockerfile .env.example
```

```text
git commit -m "Images linked to the GitHub repo through LABEL, IMAGE_REGISTRY in .env.example (Module 26 Practice 10)"
```

> ⬆️ **Done with Practice 10?** Continue to [Practice 11](#practice-11--the-clean-laptop-test-45-minutes): a friend's laptop pulls the images from the shop you've just stocked.

### Practice 11 — The clean-laptop test (45 minutes)

> 🖥️ **Tools used:** a test laptop (11.1) with **Docker Desktop** (Windows, macOS) or **Docker Engine** (Linux) and Git, a **VS Code** terminal in the **test folder**; the **project-root** terminal on your laptop (`git push`); **Chrome** or **Edge**; a stopwatch (a phone clock is enough); an internet speed-test site. Concepts used: 5 and 11.
>
> ⭐ **Required** — steps 11.2, 11.3, and 11.4: from `git clone` to the **Login** page in < 10 minutes (**L1**), the default services up (**L2**), and the same fingerprint after `down` and then `up -d` at the test place (**L3**).

This is the Syllabus's pass requirement, tested in a place that has never seen your project. Read honestly: installing Docker and Git doesn't count, but filling in `.env` (the secrets aren't in Git) and the two `docker volume create` commands do count, and a truly clean laptop downloads ±1.1 GB of molds (the Syllabus v1.0.28 notes this on its ✅ line).

#### 11.1 Choose where to test: a friend's laptop, a second account, or another folder and cupboards (5 minutes)

From the most honest:

1. **A friend's laptop, or a new virtual machine (VM)**: without this project's molds, cupboards, and copy. A second OS account is only equivalent if its Docker is separate (Docker Engine on Linux is shared by all accounts: use the option 2 lines; Docker Desktop wasn't tested by the author).
2. **Your own laptop, a new folder, other names**: the project is cloned into a new folder with another project name, cupboards, and counters; your home keeps running and isn't touched. The official molds are already there, so the result is **"warm"**: write it that way. This is the author's way.
3. **Not allowed:** cleaning up your main laptop so that it's "clean".

> [!WARNING]
> Don't `docker compose down -v`, `docker volume rm smarthome-…`, or prune on the laptop that holds your real history ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)). Without a backup, that history is gone.

Option 2: in the test folder's `.env` (11.2), add the first line and change the other eight (any other counter numbers will do; `CORS_ORIGIN` follows `PORT_WEB`):

```text
COMPOSE_PROJECT_NAME=clean-test
DB_VOLUME=clean-test-data
GRAFANA_VOLUME=clean-test-grafana-data
CORS_ORIGIN=http://localhost:8086,http://127.0.0.1:8086
PORT_WEB=8086
PORT_BACKEND=8087
PORT_DB=5436
PORT_GRAFANA=3006
PORT_MQTT=1886
```

`COMPOSE_PROJECT_NAME` replaces `name: smarthome` (Concept 5). Fill it in **before** `up -d`: without it, your home's containers are recreated with the test `.env`; without `DB_VOLUME`/`GRAFANA_VOLUME`, the test `db` uses your real cupboard (4.3).

Your molds are already on GHCR (10.2), and you want to really pull them like a friend's laptop? Do as the author did: at the project root, `docker compose down` (the cupboards are safe; readings aren't recorded meanwhile), then remove the project's molds (the last two names = Practices 2–3; they share layers, so they must go too):

```text
docker image rm ghcr.io/<account>/mini-smart-home-backend:1.3.0 ghcr.io/<account>/mini-smart-home-web:1.2.0 mini-smart-home-backend:1.3.0 mini-smart-home-web:1.2.0
```

**Result** (the author's lab): `Untagged: …` and `Deleted: sha256:…` lines.

**Finally, send the commits of Practices 7–10 to GitHub**, because what's tested is GitHub's content, not your folder. In the project-root terminal on your laptop:

```text
git push
```

GitHub answers with a summary of the push. Never pushed this branch before (6.2 skipped)? `git push -u origin feature/docker-compose` ([8.5 of Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#85-commit-and-push-the-branch)). Files you forgot to commit will show up in 11.2.

#### 11.2 ⭐ L1: a stopwatch from `git clone` to the Login page (20 minutes)

On the test laptop, open a terminal in an empty folder (option 2: a new folder outside `mini-smart-home`, for example `clean-test`; in VS Code **File → New Window**, **File → Open Folder…**, **Terminal → New Terminal**). Write down the start time or start the stopwatch, then one at a time:

```text
git clone https://github.com/<account>/mini-smart-home.git
```

```text
cd mini-smart-home
```

```text
git switch feature/docker-compose
```

The result is as in 6.3. After ➕ E merges this branch, `git clone` alone is enough. Then `.env` (4.2; Windows: `copy`, not tested by the author):

```text
cp .env.example .env
```

Open `.env`. The five secrets (`POSTGRES_PASSWORD`, `JWT_SECRET`, `MQTT_PASSWORD`, `GRAFANA_READER_PASSWORD`, `GRAFANA_ADMIN_PASSWORD`) are filled with new random text, one command per secret, without Node.js on the laptop (the PowerShell/CMD quotes weren't tested by the author):

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Paste each result (43 characters) on its line. `IMAGE_REGISTRY` is already filled in if you wrote it in `.env.example` (10.4); if not, fill in `ghcr.io/<lowercase-account>`. Leave Telegram empty: in option 2, the same token makes two backends fight over the bot (5.6). Option 2: match 11.1. Save, then (Linux, macOS):

```text
chmod 600 .env
```

Compose never creates an `external` cupboard (Concept 6), so create two empty cupboards (option 2: `clean-test-data` and `clean-test-grafana-data`):

```text
docker volume create smarthome-data
```

```text
docker volume create smarthome-grafana-data
```

**Result:** the cupboard's name. Then the Syllabus's command, with `--wait`:

```text
docker compose up -d --wait
```

Your molds aren't on GHCR yet (Practice 10 skipped), or the test laptop has a different architecture (10.4)? Add `--build`; the build time counts too. **Expected output** (the author's lab, option 2, the last part; before it, `Pulled` lines: the project's molds were pulled from the stand-in shop):

```text
[+] Running 10/10
 ✔ Network clean-test_default              Created                                    0.2s
 ✔ Volume clean-test_broker-data           Created                                    0.0s
 ✔ Container clean-test-broker-account-1   Exited                                    27.7s
 ✔ Container clean-test-db-1               Healthy                                   27.7s
 ✔ Container clean-test-mosquitto-1        Healthy                                   26.7s
 ✔ Container clean-test-migrate-1          Exited                                    26.6s
 ✔ Container clean-test-grafana-account-1  Exited                                    26.3s
 ✔ Container clean-test-backend-1          Healthy                                   26.3s
 ✔ Container clean-test-web-1              Healthy                                   26.0s
 ✔ Container clean-test-grafana-1          Healthy                                   43.4s
```

`--wait` waits until everything is ready; `mosquitto` and `web` (without a health check) are written `Healthy` = running. Grafana takes longest because its cupboard is empty. In Chrome, open `http://localhost/login` (option 2: `http://localhost:8086/login`). The **Login** screen shows = stop the stopwatch: that's your **L1 time**. An empty cupboard has no account yet; create the first admin ([`manage-users.ts`](code/backend/src/db/manage-users.ts)):

```text
docker compose exec backend node src/db/manage-users.ts add admin@home.test "Home Admin" admin
```

Type its password twice. **Expected output** (the author's lab):

```text
New password: ************************
Type it again: ************************
account 1 created: admin@home.test (Home Admin, admin)
```

**Log in** with that account: the device list is still empty (`No registered devices yet…`). The author's lab (option 2; the official images already there; the stand-in shop; a script typed the commands and filled in `.env`; the lab repo already on `main`, without `git switch`): **62.3 seconds** to the Login page, 71.2 seconds to the admin account. A friend's laptop with home internet wasn't tested by the author. Finally, the download sizes:

```text
docker compose images
```

The `SIZE` column (the author's Engine 29) = the compressed size that's downloaded; the author's lab (arm64): timescaledb `535MB`, grafana `445MB`, backend `71.9MB`, web `24MB`, mosquitto `13.2MB` = ±1,089 MB (amd64 ±1.14 GB, calculated), + 62.6 MB of `node:24.22.1-alpine3.24`, the secret maker.

**You pass this ⭐ step (L1)** when the **Login** page opens < 10 minutes after `git clone`, and the admin account can log in.

#### 11.3 ⭐ L2: the default services are up, Grafana from files, and sample history (8 minutes)

```text
docker compose ps -a
```

**Result** (the author's lab): `backend`, `db`, and `grafana` `Up … (healthy)`; `mosquitto` and `web` `Up`; `broker-account`, `migrate`, and `grafana-account` `Exited (0)`. Grafana (`http://localhost:3000`; option 2: counter 3006): log in as `admin` with `GRAFANA_ADMIN_PASSWORD` from the test `.env`. Without a single click, its contents come from the files of Practice 7: **Connections → Data sources** only `smarthome-db` (the author's lab, through the API: `Database Connection OK`); one dashboard, `System Health`; the rule `Silent node` (the author's code lab: `Normal (NoData)` = no data yet) and the contact point `Telegram Smart Home` marked **Provisioned**.

The test laptop has no history yet. Fill in 7 days of practice data ([`seed-history.ts`](code/backend/src/db/seed-history.ts)), now from inside the container:

```text
docker compose exec backend node src/db/seed-history.ts
```

The summary clerk only summarizes the last 3 days, so summarize the practice data once by hand:

```text
docker compose exec db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', NULL, NULL);"
```

**Expected output** (the author's lab, two commands):

```text
f00d00000001: 1139 readings sent, 1139 newly stored
f00d00000002: 1139 readings sent, 1139 newly stored
CALL
```

Open `http://localhost/devices/f00d00000001/history` (option 2: counter 8086): the 7-day chart is filled (the author's code lab: `Average per hour, last 7 days … 169 points`). In `System Health`, the RSSI, Uptime, and Heap panels are red instead, `db query error: ERROR: syntax error at or near ")" (SQLSTATE 42601)`: those panels wait for **registered** devices, which the practice data don't create ([🚨](#-troubleshooting), *Red panels …*). The honest L2 sentence: the history is filled; Grafana is connected, its panels wait for registered devices.

**You pass this ⭐ step (L2)** when `ps -a` shows five services `Up` (three `(healthy)`) and three `Exited (0)`, Grafana is complete without a click, and the History chart is filled.

#### 11.4 ⭐ L3 at the test place: the fingerprint before and after `down` (7 minutes)

The recipe of [8.4](#84--l3-the-same-fingerprint-after-docker-compose-down-and-then-up--d-8-minutes), now in the test folder without a data flow (PowerShell: the 4.5 variant):

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

Save its row, then one at a time:

```text
docker compose down
```

```text
docker compose up -d --wait
```

Take the fingerprint again. **Expected output** (the author's lab; before `down` and after `up` exactly the same):

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2278 | 223334dfd3e1f0a6a773c57733116b8a |       380 |      9 |    3 |        1 |       2
(1 row)
```

Its contents: 2 × 1,139 readings and two practice devices, one admin account. `down` removes eight containers and their hallway without a `Volume` line; `up -d --wait` ±26 seconds.

**You pass this ⭐ step (L3)** when `readings`, `fingerprint`, `accounts`, and `devices` after `up` are exactly the same as before `down`.

#### 11.5 Learning notes: three numbers, `docker stats`, then clean up the test project (5 minutes)

Write three numbers in `learn-iot/module-26/`: the **total** (11.2); **without downloads**: after the cleanup below, repeat 11.2 in a new empty folder with the option 2 lines (the molds are already there, new cupboards), then clean up again; and **your internet download speed** (any speed-test site). ±1,089 MB takes ±3 minutes at 50 Mbit/s, ±7.3 minutes at 20 Mbit/s, and ±14.5 minutes at 10 Mbit/s. Total over 10 minutes, but without downloads far below it? What's slow is the download, not your system; write both down as they are. Then:

```text
docker stats --no-stream
```

**Result** (the author's lab, five `clean-test-…` lines, the `MEM USAGE / LIMIT` column): backend ±77 MiB, db ±148, grafana ±244, mosquitto ±3.7, web ±12.5; together ±486 MiB, the budget for Module 27's [2 GB VPS](../../SYLLABUS.md#55-service-costs-phase-5) (without Kubernetes: [🔬](#-technical-deep-dive-optional)).

**Clean up ONLY the test project.** Option 2, in the test folder's terminal, type in full:

```text
docker compose down
```

```text
docker volume rm clean-test-data clean-test-grafana-data clean-test_broker-data
```

**Result:** the name of each removed cupboard. Don't `down -v` in your home's folder. The test folder (holding the test `.env`) may be deleted. The home you took `down` in 11.1: `docker compose up -d` at the project root (its molds are already there from the test). A friend's laptop: `docker compose down` is enough; a command to remove the `smarthome-…` cupboards is deliberately not written in this module.

> ⬆️ **Done with Practice 11?** Continue to the [➕ Add-on](#-add-on-to-mini-smart-home); the [🧩 Challenges](#-independent-challenges) can be done afterwards, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title closest to your problem; basic Docker is in the 🚨 of Module 17, the broker in the 🚨 of Module 21, Grafana in the 🚨 of Module 25. First glance at `docker compose ps -a` and `docker compose logs <service>` at the project root (the gateway: the `edge` folder on the Pi), then compare your files with [`code/`](code/). The errors are quoted from the author's lab (Linux, Compose 2.40.3). Asking on a forum or an AI? Paste the log, never `.env` or the output of `docker compose config`.

<details>
<summary><b>Old instructions → what's right for our versions (<code>docker compose</code>, Mosquitto 2.1.2, Caddy 2.11.7, Uptime Kuma 2.5.8)</b></summary>

| Old instruction | What's right for our versions | Why |
| :--- | :--- | :--- |
| `docker-compose up` | `docker compose up` | version 1 is retired |
| `version: "3.8"` | remove it | ``the attribute `version` is obsolete`` |
| `links:` | the service name (`db:5432`) | the Compose hallway |
| `image: …:latest`, e.g. `eclipse-mosquitto:latest` | an exact tag: `eclipse-mosquitto:2.1.2-alpine` | `latest` changes by itself |
| `louislam/uptime-kuma:latest` or `:1` | `louislam/uptime-kuma:2.5.8-slim` | `latest` = the old series 1 |
| `depends_on: [db]` | `condition: service_healthy` | started doesn't mean ready |
| `CMD npm start` | `CMD ["node", "src/server.ts"]` | npm swallows the stop signal |
| `docker exec smarthome-db …`, `docker logs smarthome-grafana` | `docker compose exec db …`, `docker compose logs grafana` | service names |
| `localhost:5432` inside a container | `db:5432` | `localhost` = that container |
| Pi: `sudo systemctl restart mosquitto`, `sudo tail -f /var/log/mosquitto/…` | the `edge` folder: `docker compose restart mosquitto`, `docker compose logs -f mosquitto` | the Pi broker is a container now |
| `kill -s SIGHUP` (reload) | `docker compose restart <service>` | [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#44-device-path-lock-the-door-then-restart-10-minutes) |
| `auto_https off` | the site address `:80` | Concept 4 |
| `docker pull a b c` | one image per command | `'docker pull' requires 1 argument` |
| Pi: the `get.docker.com` script, the `docker.io` package | Docker's apt repository (6.1) | Docker's documentation |
| `down -v` or `prune` | `docker compose down` | the cupboards get deleted too |

</details>

**Compose files and `.env`**

<details>
<summary><b><code>no configuration file provided: not found</code></b></summary>

Your terminal isn't at the project root (the gateway: `edge`), or `.env` doesn't exist yet, so `COMPOSE_FILE` isn't read (Concept 5). Change folder; create `.env` as in [4.2](#42-git-hygiene-first-gitignore-gitattributes-then-env-with-the-old-postgres-password-5-minutes).

</details>

<details>
<summary><b><code>required variable … is missing a value</code>: <code>MQTT_PASSWORD</code>, <code>IMAGE_REGISTRY</code>, or <code>CENTER_ADDRESS</code> not filled in</b></summary>

The author's lab, `.env.example` as it is: `error while interpolating x-backend-settings.MQTT_PASSWORD: required variable MQTT_PASSWORD is missing a value: fill in MQTT_PASSWORD in .env`. The variable's name may differ each time; fill in **all** empty lines (the random-secret recipe: the head of `.env.example`). `IMAGE_REGISTRY=ghcr.io/<lowercase-account>` ([5.2](#52-composecloudyml-second-stage-migrate-backend-web-and-image_registry-in-env-15-minutes)) isn't a secret, but it deliberately has no default so that Compose doesn't pull someone else's image. The gateway: `… fill in CENTER_ADDRESS in edge/.env (the center laptop's IP)`: write the laptop's IP (6.3; on the same laptop `host-gateway`). `docker compose config --quiet` silent = all good.

</details>

**Counters and names**

<details>
<summary><b>Old containers in the way: <code>port is already allocated</code>, <code>The container name "/smarthome-db" is already in use</code>, or <code>docker network rm</code> fails</b></summary>

- `Bind for 127.0.0.1:5432 failed: port is already allocated`: the old `smarthome-db` is still running ([4.3](#43--remove-the-old-containers-keep-their-cupboards-docker-stop-docker-rm-and-docker-network-rm-8-minutes) skipped). The cupboards are safe: `docker compose down`, do 4.3, `up -d` again.
- `Conflict. The container name "/smarthome-db" is already in use …`: the `docker run` of Module 17 was typed again. Your home is now started by Compose.
- `network smarthome has active endpoints (name:"…" …)`: the container in `name:"…"` is still attached; `docker stop` and `docker rm` first (its cupboard stays).

</details>

<details>
<summary><b>Counter 1883 or 80 is already used by another program: the old laptop broker or IIS</b></summary>

`failed to bind host port …: address already in use` (the author's lab). Find who uses it (🔁 Step 2). **1883**: the old laptop-path broker; stop it as in the box at the start of Practice 5. **80** (on Windows often IIS): `PORT_WEB=8081` and `CORS_ORIGIN=http://localhost:8081,http://127.0.0.1:8081` in `.env`, `docker compose up -d`, open `http://localhost:8081` (not tested by the author). **8080**: *Two backends at once …*.

</details>

**Cupboards and data**

<details>
<summary><b><code>external volume "smarthome-data" not found</code>, or the warning <code>already exists but was not created by Docker Compose</code></b></summary>

- `external volume "…" not found`: the `DB_VOLUME`/`GRAFANA_VOLUME` cupboard doesn't exist yet. A new laptop: the two `docker volume create` commands ([11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes)). Your old laptop: find the old cupboard's name in `docker volume ls` and write it in `.env`; an empty cupboard = a home without history.
- ``… already exists but was not created by Docker Compose. Use `external: true` …``: your file has no `external: true`, so `down -v` deletes that cupboard too (the author's lab). The warning may be overwritten by the progress lines; use the `volumes:` of the module's file.

</details>

<details>
<summary><b>The password in <code>.env</code> doesn't work: postgres refuses the login, or Grafana's admin keeps the old password</b></summary>

**Postgres** (the author's lab): `service "migrate" didn't complete successfully: exit 1`; the `migrate` log: `password authentication failed for user "postgres"`. `POSTGRES_PASSWORD` is only read for an empty cupboard (Concept 6): write the **old** password from your password manager, then `docker compose up -d`. **Grafana's admin:** the same (the author's lab: the `.env` password refused with `401`). Forgotten? `docker compose exec grafana grafana cli admin reset-admin-password <new-password>` (not recorded by the author), then change it under the avatar → **Change password**.

</details>

<details>
<summary><b>A row of nameless cupboards in <code>docker volume ls</code></b></summary>

A file without `tmpfs` leaves one cupboard with a 64-character name each time `broker-account`, `mosquitto`, or `grafana-account` is created; the module's file: zero (the author's lab). Match your file; leftovers of exercises that you recognize: `docker volume rm <name>`, one at a time. Don't prune.

</details>

<details>
<summary><b>Backups: <code>pg_restore</code> ends with exit 1, or <code>tar: can't open … Permission denied</code></b></summary>

- Exit 1 with 31 × `ERROR:  role "grafana_reader" does not exist` (the author's lab) = normal: database accounts aren't in the archive; the 9.3 fingerprint is the proof. Another error (e.g. a skipped `timescaledb_pre_restore()`): clean up the test project ([9.4](#94-clean-up-only-the-test-project-then-optional-back-up-grafanas-cupboard-7-minutes)) and repeat 9.2 with a new cupboard.
- `tar: can't open '/backup/grafana-wrong.tgz': Permission denied` (the author's lab): the Grafana image (uid 472) may not write to your folder; use `node:24.22.1-alpine3.24` (9.4).

</details>

<details>
<summary><b>Your database is on the Pi, or your Grafana was installed without Docker</b></summary>

- **The database on the Pi** (🔬 [Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#-technical-deep-dive-optional)): `pg_dump` on the Pi, copy the archive to the laptop, restore it into a new `smarthome-data` cupboard (the recipe of Practice 9), and compare the fingerprints (not tested by the author).
- **Grafana without Docker** (🔬 [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#-technical-deep-dive-optional)): stop its old service, `docker volume create smarthome-grafana-data` before 4.4, skip 7.3; its contents come from the files, and the admin logs in with `admin`/`admin` (4.1 without `GRAFANA_ADMIN_PASSWORD`; not tested by the author).

</details>

**Molds and builds**

<details>
<summary><b>The backend in a container stops right away: <code>unable to determine transport target for "pino-pretty"</code> or <code>node: .env: not found</code></b></summary>

The first message = a backend 1.2 mold (the log prettifier still in the kitchen); the second (exit 9) = the 1.2 npm scripts in a container without `.env`. Do 2.1, then `docker compose up -d --build`.

</details>

<details>
<summary><b>A <code>.sh</code> script fails with <code>not found</code> or <code>illegal option -</code>: CRLF line endings</b></summary>

The author's lab (the test script `try.sh`): `exec: line 11: /try.sh: not found` or `/try.sh: set: line 2: illegal option -`; `file try.sh` writes `with CRLF line terminators`. This project has no `.sh`; `.conf`, the ACL, the Caddyfile, `.env`, YAML, and `.dockerignore` were proven to cope. Your scripts: in VS Code click `CRLF` in the status bar → `LF`, save; `.gitattributes` (4.2) keeps it that way (Windows not tested).

</details>

**Web, Caddy, and logging in**

<details>
<summary><b>The screen says <code>Something went wrong (502).</code> and the Caddy log says <code>no such host</code> or <code>connection refused</code></b></summary>

Caddy can't reach `backend:8080`; read `docker compose logs web`. `lookup backend … server misbehaving` or `no such host`: there's no backend in the hallway (normal in 3.4); `docker compose up -d`. `connect: connection refused`: the backend has only just started (wait), or `HOST` in your file is `127.0.0.1`, so the backend is `(healthy)` but closed to Caddy (the author's lab): put back `HOST: 0.0.0.0` (Concept 7).

</details>

<details>
<summary><b><code>request from the page … refused</code> (403) when logging in or in Swagger, and a broken <code>/api/docs</code></b></summary>

The page's address isn't in `CORS_ORIGIN` (the author's lab: `{"message":"request from the page http://localhost refused"}`). Add it exactly as in the browser's address bar, separated by commas, then `docker compose up -d`: another `PORT_WEB` → `http://localhost:8081,http://127.0.0.1:8081`; phone mode → `http://<laptop-IP>` (+ `:port`, [🧩 Level 1](#level-1--the-dashboard-from-a-phone-phone-mode-through-env-a-small-change-20-minutes)); another `PORT_BACKEND` → `http://localhost:<port>`. Swagger: `http://localhost:8080/docs`, not `127.0.0.1` ([5.4](#54--log-in-through-caddy-at-httplocalhost-f5-bruno-and-swagger-8-minutes)). `/api/docs` really is broken (a limit, ➕ B).

</details>

<details>
<summary><b>Thrown back to the Login page every 15 minutes, or <code>Your session has expired</code> in dev mode</b></summary>

- **Home mode:** your Caddyfile has lost the patch `header_down Set-Cookie "Path=/auth" "Path=/api/auth"`, so the `session` pass doesn't go along to `/api/auth/refresh` (the author's lab: `not logged in: no session cookie`). Match it with the module's Caddyfile (3.2), then `docker compose restart web`.
- **Dev mode:** the page `http://localhost:5173` calls `http://127.0.0.1:8080`, two different addresses for cookies (Module 22 Concept 9). Fill in `VITE_API_BASE=http://localhost:8080` in `frontend/.env.local`, then restart `npm run dev`.

</details>

<details>
<summary><b>The Live badge never lights up: <code>connect_error: server error</code></b></summary>

A web mold from frontend 1.1: Socket.IO knocks on `/socket.io` outside the `/api` door and is answered with the dashboard page (the author's lab). Match `socket.ts` with 3.1, then `docker compose up -d --build`.

</details>

<details>
<summary><b>F5 answers 404, or the old page still shows after a new image</b></summary>

- **F5 404:** the Caddyfile has no `try_files {path} /index.html` in its last `handle` block (3.2); match it, then `docker compose restart web`.
- **The old page:** since 1.2, Caddy sends `Cache-Control: no-cache` (the author's lab: the new version right away). Still old? `docker compose up -d --build`, or **Ctrl + F5** (macOS **Cmd + Shift + R**).

</details>

<details>
<summary><b><code>too many attempts: try again in …</code> (429) for every web visitor at once</b></summary>

Module 20's login limiter counts per IP, and through Caddy every visitor has the same IP. The author's lab: after 10 wrong logins through `http://localhost`, even a correct login was answered with `… try again in 56 seconds`; through counter 8080 it worked. Wait, or log in through Bruno. The cure is in Module 27.

</details>

**Brokers and the bridge**

<details>
<summary><b>The broker's password file: <code>Unable to open pwfile</code> then <code>Restarting</code>, or the warning <code>owner is not root</code></b></summary>

- `Restarting` with the log `password-file: Error: Unable to open pwfile "/mosquitto/config/broker-passwd".` (the author's lab): your own 600 password file mounted from the project folder, which Mosquitto in the container can't read. The project's password file lives in the broker's cupboard (made by `broker-account`): match the `volumes:` of the `mosquitto` service; the Pi's old accounts come in through [6.4](#64--pi-match-the-acl-copy-the-old-password-file-into-the-gateways-cupboard-then-turn-off-the-apt-broker-10-minutes).
- `… owner is not root. …` = `mosquitto_passwd` without `-u mosquitto`. Cosmetic (the author's lab); use the 5.5 command.

</details>

<details>
<summary><b><code>Connection Refused: not authorised</code>: a Mosquitto 2.1 password file read by a 2.0 broker</b></summary>

The account was made with `mosquitto_passwd` 2.1.2 in the container (the password stored as `$7$1000$…`), then the file was read by the apt 2.0 broker (`$7$101$…`): refused (the author's lab). The other direction is safe (6.4). As long as the apt broker is still in use, create its accounts on the Pi as in Module 21.

</details>

<details>
<summary><b>The bridge doesn't connect, or Node 1's data doesn't reach the dashboard</b></summary>

The gateway keeps repeating `Connecting bridge center (center:1883)`, and the laptop never writes `New bridge connected … as pi-bridge` ([6.5](#65--start-the-gateway-connecting-bridge-on-the-pi-and-new-bridge-connected-on-the-laptop-10-minutes)). Check in order (Kit B not tested by the author): (1) `CENTER_ADDRESS` in `edge/.env` = the laptop's IP **now** (reserve a fixed address in the router), then `docker compose up -d` in `edge`; (2) the laptop: `docker compose ps` writes `0.0.0.0:1883->1883/tcp`, and the firewall doesn't block it; (3) the `pi-bridge` account and password are the same on the central broker (6.2) and in `edge/bridge/center.conf`, and the ACL block `7) pi-bridge` exists; then `docker compose restart mosquitto`. Connected, but Node 1's data don't arrive: match the repo's ACL with the old `/etc/mosquitto/acl-broker` (6.4 (a)).

</details>

<details>
<summary><b>Two backends at once: counter 8080 is already in use, <code>session taken over</code>, or Telegram <code>409 Conflict</code></b></summary>

The one-backend rule ([5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes)). The author's lab: the same counter → `npm run dev` stops at `listen EADDRINUSE: address already in use 127.0.0.1:8080`; another counter → the broker writes `Client backend … disconnected: session taken over.` alternately every 5 seconds, and the home-mode backend writes `ERROR: Telegram bot stopped: Call to 'getUpdates' failed! (409: Conflict: …)` (mock Telegram). **Ctrl + C** in dev mode, then `docker compose restart backend` (the bot doesn't recover by itself). 8080 used by another program? Change `PORT_BACKEND`.

</details>

**Grafana provisioning**

<details>
<summary><b>Grafana keeps crashing and restarting: <code>could not find Bot Token in settings</code></b></summary>

The author's lab: `grafana` was created 38 seconds earlier, but says `Up 4 seconds (health: starting)`. The `environment:` of `grafana` in your file has lost the defaults `${TELEGRAM_BOT_TOKEN:-not-set-yet}` and `${TELEGRAM_CHAT_ID:-0}`; match it (7.2), then `docker compose up -d`.

</details>

<details>
<summary><b>Every panel red with <code>Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found</code>, then 🔴 <code>[no value]</code></b></summary>

The Module 25 export file was installed raw, without the uid `smarthome-db` (Concept 9). The rule errors too and sends a false 🔴 (the author's lab, mock Telegram): `🔴 [no value] ([no value]) is not sending data, …`. Repeat 7.1 (d) and (e), then `docker compose restart grafana`.

</details>

<details>
<summary><b>The takeover gets stuck: a grayed-out Delete button (<code>Contact point is referenced by one or more alert rules</code>), or alerts sent twice</b></summary>

- **Delete grayed out:** the `Silent node` rule still exists (through the API: `409` `Receiver is used by 1 rule(s)`). The order of [7.3](#73--the-takeover-delete-the-rule-then-the-contact-point-then-the-old-data-source-10-minutes): the rule → the contact point → the old data source.
- **Twice:** the final file was started before 7.3: the contact point holds two integrations (the author's research prototype; fixing that hasn't been tested, so 7.3 must come first); or two Grafanas are running: stop the old one.

</details>

<details>
<summary><b>Red panels: <code>First panel</code> lost its data source, or <code>syntax error at or near ")"</code> on a new laptop</b></summary>

- `First panel` (the Module 25 Quick Win) points to the data source deleted in 7.3: edit its panel, choose `smarthome-db`, **Save**; or delete it ([7.4](#74--docker-compose-up--d-provisioned-the-test-button-and-a-refused-save-10-minutes)).
- `… syntax error at or near ")" (SQLSTATE 42601)` on a new laptop (the author's lab): no device is registered yet, so the `Node` variable is empty. That's normal ([11.3](#113--l2-the-default-services-are-up-grafana-from-files-and-sample-history-8-minutes)) until the first device is registered.

</details>

<details>
<summary><b>The dashboard can't be saved: <code>This dashboard cannot be saved from the Grafana UI …</code></b></summary>

Not an error: a dashboard from files is deliberately locked (`allowUiUpdates: false`). **Cancel** → **Exit edit**, then change it through the files (7.4); don't overwrite the repo through **Save JSON to file**.

</details>

**Back to life by itself, and logs**

<details>
<summary><b>The migration fails with <code>ECONNREFUSED</code>: <code>depends_on</code> without <code>service_healthy</code></b></summary>

`migrate` exits with code 1 before the database is ready (the author's research prototype: `Error: connect ECONNREFUSED 172.21.0.2:5432`), so the backend isn't started. `migrate` must wait for `db` with `condition: service_healthy`, and `db` needs the health check `pg_isready -h 127.0.0.1 …` (Concept 8); match it, then `docker compose up -d`.

</details>

<details>
<summary><b>The Rules screen is empty after the laptop restarts</b></summary>

After a Docker restart or a reboot, the backend may start before the database: the log says `automation rules couldn't be loaded yet: …`, and the rules are only loaded once (a limit, ➕ B). The cure is `docker compose restart backend` (8.5; from the code, not recorded).

</details>

<details>
<summary><b>Uptime Kuma keeps running after <code>docker compose down</code>: <code>Resource is still in use</code></b></summary>

`down` without the profile skips Uptime Kuma: `! Network smarthome_default  Resource is still in use` (the author's lab, exit code 0). Use `docker compose --profile monitoring down`.

</details>

**The image shop, architecture, and Docker Hub**

<details>
<summary><b><code>no matching manifest for linux/amd64 …</code> on a friend's laptop</b></summary>

The image in the shop was built on arm64 (Pi, Mac with Apple silicon), your friend's laptop is amd64 (Intel/AMD); in the author's lab the message ends with `no match for platform in manifest: not found`. Your friend builds them: `docker compose up -d --build` ([10.4](#104-architecture-arm64-versus-amd64-and-a-way-out-for-a-friends-laptop-7-minutes)). Multi-architecture: 🔬, Module 29.

</details>

<details>
<summary><b><code>invalid reference format: repository name (…) must be lowercase</code></b></summary>

`IMAGE_REGISTRY` with uppercase letters: `config --quiet` passes, `up` fails (the author's lab). Write your account all in lowercase, e.g. `ghcr.io/budi-santoso`.

</details>

<details>
<summary><b>A pull is refused: GHCR <code>denied</code> or <code>unauthorized</code>, or Docker Hub's pull limit</b></summary>

- **GHCR** (documentation; not recorded by the author): on a push = no `docker login ghcr.io` yet, a token without `write:packages` or expired, or an `IMAGE_REGISTRY` that isn't your account (10.2); on a pull = the package is still private (10.3).
- **Docker Hub** limits pulls without an account (its documentation: 100 per IP address per 6 hours); its message hasn't been recorded by the author. Wait, then try again.

</details>

**The Pi, Docker Engine, and Docker Desktop**

<details>
<summary><b>On the Pi, every <code>docker</code> command is refused without <code>sudo</code></b></summary>

A `permission denied` that names `docker.sock` (not recorded by the author): the `docker` group ([6.1](#61-pi-docker-engine-from-dockers-apt-repository-the-docker-group-and-git-20-minutes)) only applies after logging in again. `exit`, SSH in again; `groups` must contain `docker`.

</details>

<details>
<summary><b>Docker Desktop runs out of RAM or disk space</b></summary>

Not tested by the author. The default home uses ±485 MiB of RAM in the author's lab, disk ±6 GB (🧰). Check `docker system df` (1.4), take down the practice projects and the `monitoring` profile, then raise its limits in **Settings** → **Resources** (Windows WSL 2: the `.wslconfig` file; the Docker Desktop documentation). Don't prune cupboards.

</details>

**Messages you can ignore**

<details>
<summary><b>Safe to ignore: <code>npm notice New major version …</code>, <code>.env not found. Continuing without it.</code>, four Caddy <code>warn</code> lines, and the ACL warning <code>world readable</code></b></summary>

- `npm notice …`: don't update npm in the mold. `.env not found …`: the container's settings come from Compose.
- Caddy: `admin endpoint disabled`, `server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server`, `HTTP/2 skipped because it requires TLS`, `HTTP/3 skipped because it requires TLS`: HTTP only until Module 27.
- Mosquitto: `Warning: File /mosquitto/config/acl-broker has world readable permissions. …` (also `owner is not mosquitto`, `group is not mosquitto`): the repo's ACL is mounted read-only, and it still applies (the author's lab).

</details>

## 🔬 Technical Deep Dive (optional)

Safe to skip: the Syllabus's two optional choices (Kubernetes, multi-architecture images), roads deliberately not taken yet, and two stories behind our files. No required steps. Unless marked "the author's lab", the contents come from official documentation and **haven't been run by the author**: **just read them**.

<details>
<summary><b>Compose versus Kubernetes and k3s: when you don't need them yet</b></summary>

Compose manages containers on **one machine**. **Kubernetes** manages **a group of machines** (a cluster): it picks a machine for each container, moves it when a machine dies, runs many copies (replicas) of one service, and (according to its documentation) kills containers that fail their health check so they're replaced with new ones, something Compose doesn't do ([Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs)). **k3s**, a lightweight Kubernetes, according to its documentation needs at least 2 processor cores and 2 GB of RAM for its server, the kernel feature `cgroups`, which isn't switched on in standard Raspberry Pi OS, and an SSD, because an SD card can't take its write load.

Our home is one Pi and one laptop (later a 2 GB VPS), one copy per service, ±485 MiB of RAM in the author's lab; a k3s server alone asks for all of those 2 GB. Many copies of the backend aren't possible yet either: the login limiter of [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#8-rate-limiting-an-hourglass-for-password-guessers) counts in each copy's memory (many servers need a shared place to count, for example Redis), and two backends kick each other off the broker and the Telegram bot (`409 Conflict`). So it stays **one** backend. Kubernetes is on the Syllabus's [roadmap for going further](../../SYLLABUS.md#10-after-expert-a-roadmap-for-going-further), for millions of devices and big teams.

</details>

<details>
<summary><b>One image for two architectures: <code>docker buildx build --platform</code></b></summary>

`docker build` makes a mold for its machine's processor only ([Concept 11](#11-the-image-shop-ghcr-and-architecture), [10.4](#104-architecture-arm64-versus-amd64-and-a-way-out-for-a-friends-laptop-7-minutes)). **Buildx** (it comes with Docker Desktop; on the Pi the package `docker-buildx-plugin` from 6.1) can build both at once as one multi-architecture index, like the official molds:

```text
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/<lowercase-account>/mini-smart-home-backend:1.3.0 --push ./backend
```

`--push` sends it straight to the shop (after `docker login ghcr.io`, 10.2). The other architecture is built through QEMU **emulation**: Docker Desktop already brings it, while on Linux and the Pi the emulator must first be registered with the kernel (Docker's documentation: the image `tonistiigi/binfmt` with `--privileged`). The author didn't do it, because it changes a system setting; `docker buildx ls` on the author's Pi only lists `linux/arm64`. Emulation is also much slower, while the web build on a Pi 5 without emulation already takes 103 seconds. Our amd64 image (including bcrypt for musl x64) has never been run by the author. [Module 29](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) makes both automatically.

</details>

<details>
<summary><b>The <code>docker</code> group equals root, and <i>rootless</i> Docker</b></summary>

Docker's documentation is frank: Docker's core program (the daemon) runs as root, and the `docker` group gives its members root-level rights, because anyone who may command Docker can start a container that mounts any folder of the Pi, `/` included, and then change its contents. That's why in [6.1](#61-pi-docker-engine-from-dockers-apt-repository-the-docker-group-and-git-20-minutes) only your own account joins the group (or no group: `sudo docker …`). The same goes for `/var/run/docker.sock`, Docker's command door: a tool or container given access to it becomes root-equivalent too.

**Rootless Docker** runs the daemon and its containers as an ordinary user. It needs the `uidmap` package and at least 65,536 spare user numbers (subuid/subgid) for your account; to start along when the Pi is switched on, its documentation uses `sudo loginctl enable-linger <account>`. The price: counters below 1024 are refused (its documentation's example: `cannot expose privileged port 80`): the gateway broker's 1883 is fine, `web` on counter 80 isn't. This module keeps using ordinary Docker.

</details>

<details>
<summary><b><code>docker compose watch</code> for dev mode</b></summary>

Our dev mode ([5.6](#56-container-logs-then-switching-between-home-mode-and-dev-mode-8-minutes)) runs `npm run dev` on the laptop. Another way, from Compose: a `develop:` → `watch:` section in the Compose file, then `docker compose watch`. As soon as a file on the laptop changes, Compose runs its action: `sync` (copy into the running container), `sync+restart` (copy, then restart), or `rebuild` (rebuild the mold, replace its container); only for services with `build:`. A sketch for the backend:

```yaml
  backend:
    # …
    develop:
      watch:
        - action: sync+restart
          path: ./backend/src
          target: /app/src
        - action: rebuild
          path: ./backend/package.json
```

Why stay with `npm run dev`? (1) Its documentation requires the container's user (`USER`) to be able to write to the target folder, while `backend/Dockerfile` copies `src` as root and then switches to `USER node`: it needs `COPY --chown` (a change to the mold). (2) `node_modules/` mustn't be synced: npm packages can carry machine code that isn't cross-platform (bcrypt). (3) The web mold only holds `dist/` without Vite: every dashboard change = a `rebuild`, ±50 seconds on the author's Pi, not the instant refresh of Vite.

</details>

<details>
<summary><b>Node-RED in a container: the <code>nodered</code> profile</b></summary>

`edge/compose.edge.yml` already holds a `nodered` service (`nodered/node-red:5.0.9-24`, the `nodered-data` cupboard, counter 1880) in the `nodered` profile, but Module 26 keeps using the systemd Node-RED of [Module 13](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#3-node-red-on-the-gateway-service-files-and-password) ([Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway)). The recipe for moving it:

1. In the old editor, export the latest flow to `edge/node-red-flows.json` (how: [`code/edge/README.md`](code/edge/README.md)). Then in the Pi's SSH terminal: `sudo systemctl disable --now nodered`, because counter 1880 only fits one Node-RED.
2. Still on the Pi, in the `edge` folder: `docker compose --profile nodered up -d`.
3. A new cupboard = a new Node-RED: no flow, no Dashboard palette, and its editor **without a password** (Node-RED's documentation: anyone who can reach its IP can change the flows). Set up its protection first (the official guide "Securing Node-RED"), then `@flowfuse/node-red-dashboard` through **Manage palette**, then **Import** `node-red-flows.json`.
4. In the broker node, change the server `localhost` to `mosquitto`, because inside a container `localhost` = that Node-RED container itself. Fill in the `nodered` account again on the **Security** tab (its credentials are in `flows_cred.json`, not in the export), then **Deploy**.

Mounting the Pi's `~/.node-red` folder directly (a bind mount) works too, as long as its owner is uid 1000, the user inside the image. The way back: `docker compose stop nodered`, then `sudo systemctl enable --now nodered`. Don't `docker compose --profile nodered down`: the gateway broker goes down with it.

</details>

<details>
<summary><b>Compose <i>secrets</i> versus <code>.env</code></b></summary>

The contents of `.env` go into the container as environment variables, which leak easily: `docker inspect` without `--format` prints them ([🔁 Step 5](#step-5--reading-the-old-containers-settings-with-docker-inspect-without-leaking-passwords)), and according to Compose's documentation they can be printed in logs while debugging. The ***secrets*** feature mounts each secret as a **file** `/run/secrets/<name>`, only in the services given permission. The program must know how to read a file: the Postgres image knows `POSTGRES_PASSWORD_FILE`, Grafana `GF_SECURITY_ADMIN_PASSWORD__FILE` (two underscores). This project keeps using `.env` ([Concept 9](#9-secrets-and-configuration-as-files-env-and-grafana-provisioning)) for two reasons:

- **Backend 1.3.0 only reads environment variables**, and the postgres password is tucked into `DATABASE_URL`. Moving to secrets means changing the backend's code.
- **The file's owner.** Secrets from files are mounted as they are (a bind mount): `uid`, `gid`, and `mode` (default `0444`) are ignored. Grafana reads its file as uid 472, so your `chmod 600` file (uid 1000) can't be read by it; the Postgres entrypoint reads it as root before switching to uid 70. Not tested by the author yet (Docker Desktop may differ).

</details>

<details>
<summary><b>Pinning the <i>digest</i>: <code>image: repo:tag@sha256:…</code></b></summary>

A tag can be moved by its owner ([Concept 2](#2-a-mold-in-layers-image-tag-digest-and-architecture)). To guarantee the mold's contents stay the same, write the digest after the tag: the tag is for humans to read, the digest is what Docker uses.

```yaml
    image: eclipse-mosquitto:2.1.2-alpine@sha256:860aeb5d63ce509508f6dcfb2bc8a1c1dd2bc60555b562b45ce90e52d8dabb0f
```

The digests of the molds already on your laptop (the `{{…}}` quotes in PowerShell haven't been tested by the author):

```text
docker image ls --digests --format 'table {{.Repository}}:{{.Tag}}\t{{.Digest}}\t{{.Size}}'
```

**Expected output** (the author's lab, cut):

```text
REPOSITORY:TAG                      DIGEST                                                                    SIZE
eclipse-mosquitto:2.1.2-alpine      sha256:860aeb5d63ce509508f6dcfb2bc8a1c1dd2bc60555b562b45ce90e52d8dabb0f   43.2MB
caddy:2.11.7-alpine                 sha256:eb4d35b7452d1ab6171fbdbe8d9275b2301dad6dad92115d91e19fb9b24d510f   89.2MB
```

For official images, that's the digest of the multi-architecture index, the same on the Pi and on an amd64 laptop; when checked on 28 October 2026, the digest of every tag of this module on Docker Hub was still the same as in the author's lab. The price: security updates don't come by themselves; you replace it yourself.

</details>

<details>
<summary><b>Grafana <code>-slim</code>: lighter, not yet tested with our dashboard</b></summary>

The Grafana image has a `-slim` twin that, according to its documentation, doesn't carry the bundled plugins. On Docker Hub at the time of writing, `grafana/grafana:13.2.5-slim` is ±301 MB to download on arm64 (±325 MB amd64), its full version ±448 MB (±485 MB): a saving of ±145–160 MB, including in the L1 download. Not used yet: not tested with the **System Health** dashboard, the PostgreSQL data source, and our rule (13.2.5 hasn't been tested on top of a 13.2.4 cupboard either). Want to try it? Change the tag at a test place with new cupboards as in [11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes), not in your home's Grafana cupboard, then check every panel.

</details>

<details>
<summary><b>Why a new dashboard shows up right away: <code>Cache-Control: no-cache</code> and a 404 for missing assets</b></summary>

The browser keeps a copy of the page (a cache), and without a hint from the server, Chrome may use it without asking. The author's code checker proved it with an early Caddyfile: after the contents of `index.html` were replaced (imitating a rebuild), `/map`, which had been opened before, stayed the old version until F5 (0 bytes from the server), while `/`, never opened before, was already the new version. Two blocks in `frontend/caddy/Caddyfile` ([3.2](#32-frontendcaddycaddyfile-the-api-door-missing-assets-and-the-spa-fallback-10-minutes)) fix it:

- **`index.html` with `Cache-Control: no-cache`**, meaning "ask first before using the stored copy", not "don't store it". The browser names its stored version (`If-None-Match`); if it hasn't changed, Caddy answers `304` without contents.
- **`/assets/*` without a fallback.** Build file names carry a fingerprint (`index-BAET4URZ.js`) and change with every build, so a new `index.html` points to new names. A file that doesn't exist is answered with `404`, not with an `index.html` disguised as JavaScript.

**Expected output** (the author's lab, the `web` container, cut):

```text
/                                    200 Cache-Control: no-cache Content-Type: text/html; charset=utf-8
/assets/index-BAET4URZ.js            200 Content-Type: text/javascript; charset=utf-8      (no no-cache)
/assets/missing.js                   404
/map If-None-Match "<etag>"          304
```

Then the page title in the container was replaced (imitating a new image), and Chrome opened `/map` normally, without F5:

```text
navigate /map after the change -> Mini Smart Home NEW | transferSize=1000 | /map
navigate /map again            -> Mini Smart Home NEW | transferSize=300 | /map
```

The new version shows right away; the next opening only needs ±300 bytes (`304`). The `index-…` file name on your laptop is different.

</details>

<details>
<summary><b>Mosquitto 3.0 one day: <code>password_file</code> retires</b></summary>

The release notes of Mosquitto 2.1.0 (29 January 2026) mark `password_file` and `acl_file` as deprecated: both will be removed in 3.0, replaced by the `password-file` and `acl-file` plugins, whose code is the same. `center.conf` and `gateway.conf` still use the old form, and in 2.1.2 both run without a deprecation warning in the log (the author's lab). The plugin's traces already show: the password-file error in 2.1.2 starts with `password-file:` (🚨). This is what an exact tag is for: `2.1.2-alpine` stays version 2.1.2, while `latest` will one day become 3.0. When 3.0 comes out, read its release notes, change those two lines, test it in a separate project, and only then change the tag.

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** **VS Code** with a terminal at the **project root**; **Chrome** or **Edge**; a phone on the home Wi-Fi (Level 1). The Compose home running.

Levels 1 and 2 only change `.env` (not in Git) and screens. Level 3 adds files: do it after ➕ E below, on a new branch from `main` (`git switch main`, `git pull`, `git switch -c feature/<challenge-name>`).

### Level 1 — The dashboard from a phone: phone mode through `.env` (a small change, 20 minutes)

Open the home-mode dashboard from a phone **only by changing the root `.env`**. Port 80 on your laptop taken? Use web counter 8081. There are two gatekeepers ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)): the **counter** `WEB_ADDRESS` (`127.0.0.1` = only this laptop, `0.0.0.0` = the whole Wi-Fi) and **the guard** `CORS_ORIGIN` ([Module 20](../../phase-3-backend-data/module-20-user-security/README.md#9-cors-why-the-browser-refuses)), which matches the page's origin exactly: scheme + host name + port. Find the laptop's IP as in [Module 23's phone mode](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode), then `docker compose up -d`. Only the web counter is opened. No port forwarding on the router: there's no HTTPS yet (Module 27), so passwords cross the Wi-Fi unencrypted. When you're done trying, put `.env` back to laptop mode and run `docker compose up -d` again, also before the laptop goes to another Wi-Fi.

**Result** (the author's lab, counter 80): only `migrate`, `backend`, and `web` are recreated; `docker compose ps web` writes `0.0.0.0:80->80/tcp`. The "phone" is Chrome's device mode at 375 pixels on the same machine, not a real phone: `http://192.168.1.10` (your IP differs) → **Log in** → `/devices` with **Live** (bottom right of the [5.4](#54--log-in-through-caddy-at-httplocalhost-f5-bruno-and-swagger-8-minutes) picture). The Garden card briefly said `waiting for a reading…` (the backend had just been recreated).

**You pass when:** the phone logs in through `http://<laptop-IP>` (or `:8081`) and sees **Live**; after putting it back, `docker compose ps web` writes `127.0.0.1:80->80/tcp` again.

<details>
<summary><b>Level 1 answer key</b></summary>

From `env-phone-mode.example` in [`level-1/`](code/challenges/key/level-1/) (also the 8081 version and laptop mode):

```text
WEB_ADDRESS=0.0.0.0
CORS_ORIGIN=http://localhost,http://127.0.0.1,http://<laptop-IP>
```

Counter 8081: add `PORT_WEB=8081` and write `:8081` in **all three** addresses. An origin that isn't exactly the same is answered with `403` (the author's lab: `{"message":"request from the page http://192.168.1.10 refused"}`).

</details>

### Level 2 — Uptime Kuma: the `monitoring` profile and one monitor through a service name (fill in the blanks, 40 minutes)

The `uptime-kuma` service is already written in `compose.cloud.yml`, off behind its profile ([Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway)). Switch it on (the first download ±183 MB), open `http://localhost:3001`, at **Which database would you like to use?** choose **SQLite** → **Next**, create the admin account at **Create your admin account** (a new password) → **Create**. Make **one** monitor: **Add New Monitor**, **Monitor Type** `HTTP(s)`, **Friendly Name** `Backend`, **URL** to the backend's `/health` through the **service name** ([Quick Win Step 5](#step-5--go-inside-the-broker-container-the-service-name-is-the-address-4-minutes)), **Save**. No notifications: that's Module 30. Fill in every `____` (the last line = taking the home down later; a plain `down` leaves Uptime Kuma behind):

```text
docker compose --profile ____ up -d
http://____:____/health
docker compose --profile ____ down
```

**You pass when:** the **Backend** monitor is green **Up** with `200 - OK`.

<details>
<summary><b>Level 2 answer key</b></summary>

The answers: `monitoring`, `backend`, `8080`. In the Uptime Kuma container, `localhost` is Uptime Kuma itself; in the hallway `smarthome_default`, `backend` = the backend container and `8080` = the port inside it, not the laptop's counter. **Result** (the author's lab; the backend log without `/health`): the wizard from **SQLite** to **Up** `200 - OK`:

![Composite of real screenshots of Uptime Kuma 2.5.8 in its light theme in Chrome 156, Linux on a Raspberry Pi 5 playing the laptop, 1280 pixels, for Level 2 after docker compose --profile monitoring up -d and opening http://localhost:3001. Top left, the setup-database page: the logo, the title Uptime Kuma, Language English, the question Which database would you like to use?, the buttons MariaDB/MySQL and SQLite, selected in green (number 1), the note A simple database file, recommended for small-scale deployments, then the Next button (number 1). Top middle, the setup page: Create your admin account, the field Username holding admin, Password and Repeat Password with dots (number 2), the Create button (number 2). Top right, Add New Monitor, section General: Monitor Type HTTP(s), Friendly Name Backend and URL http://backend:8080/health (number 3), Heartbeat Interval (Check every 60 seconds) 60. Bottom, the monitor page after Save: the left list Backend 100%, the title Backend #1, the link http://backend:8080/health (number 3), the buttons Pause, Edit, Clone, Delete, the big green Up badge (number 4), Check every 60 seconds (1 minute) (number 4), Response 17ms, Uptime 100%. A cut of the bottom of the same page: the table Status, DateTime, Message with the row Up, 2026-10-29 11:42:09, 200 - OK (number 5). The monitor URL uses the service name backend in the Compose hallway, not localhost; no notifications. The admin account is a lab test account.](assets/uptime-kuma-wizard.png)

Its limit: the 1.3.0 `/health` stays `200` as long as its process is alive, even when the broker or the database is disconnected (`"broker":false`): this monitor answers "is the backend alive?", not yet "is the home healthy?" (Module 30). You may leave it running (the author's lab: ±196 MiB of RAM). The full steps: [`level-2/`](code/challenges/key/level-2/).

</details>

### Level 3 — The simulator in a container: the `simulation` profile in an extra Compose file (from scratch, 60–90 minutes)

A friend's laptop without Node.js and without a Kit still gets live data from one fake device. `compose.cloud.yml` isn't changed; create:

- a one-stage `tools/Dockerfile` (without the kitchen of Practice 2) from `node:24.22.1-alpine3.24`, `USER node`, a `data/` folder owned by `node`, plus `tools/.dockerignore`.
- `compose.simulation.yml` at the root: a `simulator` service with the `simulation` profile, `image: mini-smart-home-tools:1.0.0` + `build: ./tools`, one device to `mqtt://mosquitto:1883`, `init: true` (without it, `stop` waits 10 seconds), full `logging` (the `x-log` anchor can't be read from another file), and `${KEY_F00D00000001:-}`, not `:?`: Compose checks the variables of the whole file, profiled services that are off included, so `:?` makes a plain `up -d` fail.
- the root `.env`: `COMPOSE_FILE=compose.cloud.yml:compose.simulation.yml` ([Concept 5](#5-one-file-for-one-home-docker-compose); Windows uses `;`, not tested by the author) and the `KEY_F00D00000001` line from `tools/.env` (the Module 21 device, its broker account from [5.5](#55--live-data-through-the-central-broker-the-simulator-the-mock-garden-and-the-lamp-button-7-minutes)). Stop the Node simulator in the `tools` terminal first (**Ctrl + C**): its client name is the same.

Then `docker compose --profile simulation up -d`. The first warning `pull access denied for mini-smart-home-tools` is normal: Compose looks for it on Docker Hub first, then builds it.

**You pass when:** `docker compose logs simulator` writes `f00d00000001: online`, `received` in `http://localhost/api/health` goes up, and after `docker compose --profile simulation stop simulator`, `up -d` without the profile doesn't start it. Before switching to `main`, put back `COMPOSE_FILE=compose.cloud.yml`.

<details>
<summary><b>Level 3 answer key</b></summary>

The files and their README (also registering the device in a new database): [`level-3/`](code/challenges/key/level-3/). **Expected output** (the author's lab, a test project, cut):

```text
simulator-1  | f00d00000001: online
{"ok":true,"broker":true,"database":true,"received":4,"rejected":0,"ignored":0}
```

</details>

## ➕ Add-on to "Mini Smart Home"

This week Mini Smart Home is **wrapped in Docker, ready to move anywhere**: backend 1.3.0, dashboard 1.2.0, and Grafana from files in `compose.cloud.yml`, the Pi gateway in `edge/compose.edge.yml`; data contract 1.4, the firmware, and the migrations stay. The code is already committed on `feature/docker-compose`. A matches, B–D tidy up the documents, E merges into `main`, F saves your notes (±30 minutes). The picture of [Concept 10](#10-two-files-until-the-end-the-center-and-the-gateway) is now also the picture of your project's state after Module 26:

![Diagram two files until the end, the center and the gateway (Concept 10), also the state of the project after Module 26. Left: Node 2 Garden v1.0.0 over ESP-NOW to Node 1 Home v1.6.0, firmware unchanged, still to 192.168.1.37:1883 with the old account. Raspberry Pi gateway 192.168.1.37: edge/compose.edge.yml, project smarthome-gateway; the gateway mosquitto (eclipse-mosquitto:2.1.2-alpine, counter 1883 for the devices, files gateway.conf, acl-broker, bridge/center.conf not in Git, a cupboard with the Pi's old password file); faded: cloudflared profile tunnel and nodered profile nodered, off; Node-RED systemd stays, not a container; the apt package mosquitto turned off. Middle, the LAN bridge plain 1883, no TLS yet, account pi-bridge: out QoS 1 msh/+/telemetry, status, vitals, ack; in QoS 1 msh/+/cmd; remote_clientid pi-bridge kept; center down = messages lost, holding messages in Module 27; CENTER_ADDRESS in edge/.env = the laptop IP. Right, the center laptop 192.168.1.10: compose.cloud.yml, project smarthome, one docker compose up -d; the central mosquitto to backend 1.3.0 to db; web 1.2.0 Caddy to backend; grafana 13.2.4 to db; uptime-kuma profile monitoring off; one-offs broker-account, migrate, grafana-account; the external cupboards smarthome-data and smarthome-grafana-data. Bottom middle: the browser http://localhost and :3000, a phone through phone mode; Telegram over outgoing HTTPS, the token only in .env; one backend only, home mode or dev mode (stop backend web, then npm run dev), two backends kick each other off the broker. Bottom left, GitHub branch feature/docker-compose, pull request The whole system in Docker Compose, 16 rows of files: Compose 9 services (uptime-kuma in profile monitoring), .env.example, the Dockerfiles and the Caddyfile, backend 1.3.0 (99 tests pass), frontend 1.2.0, Grafana provisioning, edge (compose.edge.yml, center.conf, bridge, edge/.env.example, bridge/README.md, acl-broker), scripts/fingerprint.sql, .gitignore, the PR template; unchanged: data contract 1.4, firmware, migrations. Never in Git: .env, edge/.env, edge/bridge/center.conf, backup/, the cupboards' contents. Bottom right, coming later: Module 27 VPS, HTTPS, MQTT TLS 8883, a bridge that holds messages; Module 29 GitHub Actions, multi-architecture images; Module 30 Uptime Kuma, automatic backups, runbooks. Honestly: a sleeping laptop = everything sleeps; a password guesser can lock out every web visitor; an image only for the architecture that built it; Docker Desktop not tested yet.](assets/two-files-center-gateway.png)

> 🖥️ **Tools used:** **VS Code** in the `mini-smart-home` folder with a terminal at the **project root** (F: a second window, the `learn-iot` folder); **Chrome** or **Edge** logged in to GitHub; Kit B: the SSH terminal to the Pi (E). The Compose home may keep running.
>
> ⭐ **Required** — step E: the pull request to `main`.

### A. Match your project: the root files, `backend/` 1.3.0, `frontend/` 1.2.0, `grafana/`, and `edge/`

After Practice 11, your branch's files must be the same as the files with the same names in [`code/`](code/), except the READMEs and the template (B, D) and what really is yours: your account name on the `LABEL` line of the backend and web `Dockerfile` (10.2), `IMAGE_REGISTRY` in `.env.example` if you filled it in (10.4), your exported dashboard JSON (7.1), and `edge/acl-broker` (block 2 holds your device_id; laptop path: block `2b)` open). Check in the VS Code Explorer:

- root: `compose.cloud.yml`, `.env.example`, `.gitignore`, `.gitattributes`, `scripts/fingerprint.sql`;
- `backend/` and `frontend/`: `Dockerfile`, `.dockerignore`, versions `1.3.0` and `1.2.0` in `package.json`, plus `frontend/caddy/Caddyfile`;
- `grafana/provisioning/` (four folders, including the moved `silent-node.yaml`);
- `edge/`: `center.conf`, the block `7) pi-bridge`, and the five gateway files of 6.2.

**The laptop path that skipped 6.2 and 6.7:** create those five gateway files now (**Copy raw file**; the `pi-bridge` account isn't needed): the reference project holds them for everyone. **Everyone:** copy lines 2–3 (`# WITHOUT DOCKER (before Module 26): …`) from [`code/edge/gateway-pi.conf`](code/edge/gateway-pi.conf) and [`code/edge/mosquitto-lan.conf`](code/edge/mosquitto-lan.conf) below the first line of your files with the same names (now only a way back), then replace line 4 of your `edge/acl-broker` with lines 4–5 of the reference.

### B. Update the project README, then the READMEs of `backend/`, `frontend/`, `grafana/`, `edge/`, and `tools/`

**The root README.** Open the [reference README](code/README.md) on GitHub, click **Raw**, select the section `## How to run the whole system with one command (Module 26)` up to just before `## Coming later`, copy it, then paste it at the end of your repository's root `README.md`: five clean-laptop steps (= [11.2](#112--l1-a-stopwatch-from-git-clone-to-the-login-page-20-minutes)), a command table, and the ban on `down -v` ([8.5](#85-never-down--v-then-optional-restart-docker-or-reboot-the-pi-4-minutes)). Replace the path in the brackets of `[Module 26](…)` inside it with this page's address (from the address bar).

**Five folder READMEs** ([`backend/`](code/backend/README.md), [`frontend/`](code/frontend/README.md), [`grafana/`](code/grafana/README.md), [`edge/`](code/edge/README.md), [`tools/`](code/tools/README.md)): replace their whole contents with the reference version (**Copy raw file**). What's new:

- `backend/`: Compose, dev mode, backups, **Version 1.3 notes**, and **Limits of v1.3**: a sleeping laptop = a sleeping backend (always on in Module 27); behind Caddy, the login limiter counts every web visitor as one address (`trustProxy`, Module 27); `/health` always 200 (Module 30); Swagger only at `http://localhost:8080/docs`, not through `/api`; automation rules loaded once at startup (the cure: `docker compose restart backend`).
- `frontend/` v1.2, **Limits of v1.2**: HTTP only (HTTPS in Module 27); the image is for one `/api` prefix and one architecture; the cookie path is patched in Caddy; it doesn't refresh itself like Vite (rebuild); `VITE_API_BASE` is only a path or an address without a path.
- `grafana/`: Compose, the takeover, the token in `.env`. The menu it writes, **Export → Export as JSON** = the **Export** icon → **Export as code** in Grafana 13.2.4 (7.3).
- `edge/`: the Pi recipe with Docker, the bridge, the way back. Kit B: fill in its head table again with your Pi's data.
- `tools/`: the simulator and the checker to the central broker `127.0.0.1:1883`.

### C. Complete the root and `edge/` `.env.example` files: commented, without home IP addresses

Both have existed since 4.2 and 6.2 (laptop path: A). Compare them with [`code/.env.example`](code/.env.example) and [`code/edge/.env.example`](code/edge/.env.example): every key commented, the secrets and `CENTER_ADDRESS` empty, no IP of your laptop or Pi. Trial settings (phone mode, another counter, `COMPOSE_PROFILES`) stay in `.env`; the only value of yours that may go in is `IMAGE_REGISTRY` (not a secret). A provision for the Module 31 capstone.

### D. Add the Module 26 items to the pull request template

Replace the whole content of `.github/pull_request_template.md` with the [reference template](code/.github/pull_request_template.md) (**Copy raw file**): eight **(Module 26)** items, four in **Checklist before merging** and four in **Security checklist**. In short: `docker compose config --quiet` passes and `ps -a` has no `unhealthy`/`Restarting`; exact tags without `latest`; the web image rebuilt when `frontend/` changes; one backend only; `.dockerignore` and `docker history --no-trunc` clean before a push; the database, Grafana, backend, and Uptime Kuma counters only on `127.0.0.1`, no port forwarding; `.env`, `edge/.env`, `edge/bridge/*.conf`, `backup/` not included; no `down -v`, `volume rm`, or `prune`. Two Grafana **(Module 25)** items are adjusted to Compose as well.

### E. ⭐ Merge `feature/docker-compose` into `main` with the pull request "The whole system in Docker Compose"

In the project-root terminal, `git status` may only mention the files of A–D; `.env`, `backup/`, and `edge/bridge/center.conf` don't show (ignored since [4.2](#42-git-hygiene-first-gitignore-gitattributes-then-env-with-the-old-postgres-password-5-minutes)). Then one at a time:

```text
git add README.md .env.example backend/README.md frontend/README.md grafana/README.md tools/README.md edge .github/pull_request_template.md
```

```text
git commit -m "Module 26 docs: READMEs, the PR template, and the gateway files"
```

```text
git push
```

1. On GitHub, click **Compare & pull request** (base `main`), title `The whole system in Docker Compose`. Write the changes and the L1–L4 proof as honestly as your notes (for example `L4 laptop path: simulator`), copy the eight **(Module 26)** items from the D template (`main` still uses the old one), then **Create pull request**.
2. **Review:** **Files changed** ±43 files (the reference code), without `.env`, passwords, tokens, chat_id, `docker compose config` output, or home IPs in `.env.example`. Tick what's met, then **Review changes** → **Comment** → **Submit review**. Something forbidden? Don't merge: `git rm -r --cached` + the file's name (secrets: change their values too), commit, push again.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. The project-root terminal, one at a time: `git switch main`, `git pull --prune`, `git branch -d feature/docker-compose`. Kit B, the Pi's SSH terminal (the `mini-smart-home` folder): `git switch main` then `git pull`. From then on, change the gateway files on the laptop, commit, push, then on the Pi `git pull` and `docker compose restart mosquitto` from the `edge` folder (the `edge/README.md` flow).

The buttons are the same as in [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#86-open-a-pull-request-on-github); the author tested this merge in a local git repo, not on GitHub.

**You pass this ⭐ step** when that pull request has been reviewed with the **(Module 26)** items and merged, and your laptop's `main` holds `compose.cloud.yml`, backend `1.3.0`, and frontend `1.2.0`. Tick ➕ E in the [✅](#-module-26-completion-checklist).

### F. Save your learning notes: the fingerprints, the L1 numbers, and `docker stats`

In `module-26/` of the **`learn-iot`** repository there are already `fingerprint.md` ([1.2](#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes), 4.5, 8.4) and the three numbers of [11.5](#115-learning-notes-three-numbers-docker-stats-then-clean-up-the-test-project-5-minutes). Add `notes.md`, without passwords, tokens, chat_id, or `.env` contents:

```markdown
# Module 26 notes — Wrapped in Docker, ready to move

| What was measured | My number |
| :--- | :--- |
| Fingerprint 1.2 = 4.5; before `down` = after `up -d` (8.4) | same / different |
| L1 total / without downloads / internet speed (11.5) | … / … / … |
| `docker stats`: RAM of the default services (11.5) | … MiB |
| L4 (6.6) or the laptop-path stand-in (5.5) | … |
| Not tested by me yet: a friend's laptop, Docker Desktop, GHCR, reboot | … |
```

Below the table, paste the output of `docker compose ps -a` as a code block (without secrets). Commit and push.

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Alias** | An extra name of a service in the hallway: `db` is also `smarthome-db`, so the screen-made data source of Module 25 stays connected. |
| **Architecture** (amd64, arm64) | The processor type: amd64 = Intel or AMD; arm64 = a 64-bit Pi, a Mac with Apple silicon. Official molds are multi-architecture; yours only fit the processor that built them. |
| **Restart policy** | When Docker brings a stopped container back to life. `unless-stopped`: stops by itself → comes back to life, `stop` → stays off. |
| **The mold** (image) | A package of a program with everything it needs, never changing, for example `mini-smart-home-backend:1.3.0`. |
| **Digest** | The fingerprint of a mold's contents (`sha256:…`); unlike a tag, it can't be moved. |
| **Docker Compose** | One file for one home (`compose.cloud.yml`): services, cupboards, counters, and the starting order, run with `docker compose up -d` from the project root. |
| **`Dockerfile`** | The mold's recipe (`FROM`, `COPY`, `RUN`, `USER`, `CMD`, …), one layer per step. |
| **`.dockerignore`** | The build context's filter: `.env`, `node_modules`, `backup`, and test files aren't sent to the mold builder; required before a public mold. |
| **`.env` and `${…}`** | The secrets file, never in Git: the root one (home mode), `backend/.env` (dev mode), `edge/.env` (the gateway). `${X:-default}` = a default value, `${X:?message}` = stop when empty. |
| **The gateway** and **the center** | The gateway = the Pi with `edge/compose.edge.yml`, the broker the devices connect to; the center = `compose.cloud.yml` on the laptop (Module 27: a VPS), the home's brain. |
| **The bridge** | The connection from the gateway broker to the central broker (the `pi-bridge` account), forwarding chosen topics. The first LAN bridge: no TLS yet, doesn't yet hold data while disconnected (store-and-forward = Module 27). |
| **Window** (bind mount) | A repo file or folder visible from inside the container, usually `:ro` (`./edge/center.conf`, `./frontend/caddy`). A single file that changed: `docker compose restart <service>`. |
| **Container** (shipping container) | The cake from the mold (Module 17) that can be carried anywhere; it may be thrown away and made again, because the data are in the cupboards and the secrets in `.env`. |
| **Layer** | The result of one recipe step, stored as a cache; reused (`CACHED`) when it and the steps before it haven't changed. |
| **A clean laptop** | The L1 test place without this project's molds and cupboards; **warm** = the official molds are already there (the author: 62.3 seconds), **cold** = everything is downloaded (±1.1 GB). |
| **Service** | One part of the home in the Compose file (`db`, `backend`, `web`, …); its name = its address in the hallway (`db:5432`). |
| **One-off service** | A handyman who does one job and goes home (`broker-account`, `migrate`, `grafana-account`): each creates what's missing and skips what's already there; `Exited (0)` in `docker compose ps -a`. |
| **The cupboard** (volume) | Data outside the container, safe from `down`. Your own (`external`, for example `smarthome-data`) are never deleted by Compose; Compose's own (`smarthome_broker-data`) are deleted by `down -v`. |
| **The counter** (port) | The left number in `ports` = the door on the laptop (`PORT_*`), the right number = the port inside the container. `127.0.0.1:` = only this laptop; without an IP = the whole Wi-Fi. |
| **The hallway** (network) | `smarthome_default`, made by Compose; services call each other by name, and `localhost` = that container itself. |
| **Home mode** and **dev mode** | Compose at `http://localhost` versus `npm run dev` and Vite for changing code; always only one backend. |
| **Multi-stage** (the kitchen and the serving table) | The kitchen stages (`packages`, `build`) are thrown away, and only the dish goes up into the final mold: backend 71.9 MB, web 24 MB compressed (the author's lab). |
| **Classic PAT** | A tool-only password that GHCR accepts: only the `write:packages` right, a short lifetime. |
| **Health check** (healthcheck) | Docker's regular question, "still healthy?" (`(healthy)`), for the starting order and `--wait`; `unhealthy` doesn't restart. A monitor that tells people = Module 30. |
| **The front door** (reverse proxy) | Caddy in `web`: one address `http://localhost`; `/api/…` is walked to `backend:8080`, the rest gets the dashboard page. HTTP only (`:80`). |
| **Profile** (profiles) | A switch for a service in the same file (`monitoring`, `tunnel`, `nodered`): off until `--profile <name>`. Not the old Syllabus's "two profiles" (= two Compose files). |
| **Grafana provisioning** | Grafana installs the data source, dashboard, contact point, and rule from `grafana/provisioning/` every time it starts; its rule and contact point are marked **Provisioned**. Not device provisioning (Modules 21 and 28). |
| **Compose project** | The name of the home (`name: smarthome`): the prefix of the containers, the hallway, and Compose's own cupboards; a test project uses another name (`-p`, `COMPOSE_PROJECT_NAME`). |
| **History fingerprint** | One row from `scripts/fingerprint.sql`: `readings`, `fingerprint`, `accounts`, and `devices` the same = no data lost (`summaries` may change). |
| **SPA fallback** | A screen address that isn't a file (`/map`) is answered with `index.html`, so F5 is safe; a missing asset is still `404`. |
| **Tag** | A version label (`caddy:2.11.7-alpine`) that its owner can move; no tag = `latest`, so always write an exact tag. |
| **`tmpfs`** | A temporary folder in memory, so nameless cupboards don't pile up every time a container is made anew. |
| **The image shop** (registry) | Where molds are dropped off (push) and picked up (pull): Docker Hub for official molds, **GHCR** (free for now) for yours. `IMAGE_REGISTRY=ghcr.io/<lowercase-account>` is required in `.env`; not a secret. |

## 📝 5-Question Quiz

[Phase 5's completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase) ask for at least 4 correct answers in every quiz of Modules 26–30.

1. Your laptop holds the real history. (a) What does `docker compose down` remove, and what stays? (b) What's lost with `down -v`, and why is your history still safe? (c) When is that history really lost?
2. In Module 20 the backend used `HOST=127.0.0.1`, in `compose.cloud.yml` `HOST: 0.0.0.0`. (a) Why? (b) Why can a phone on the home Wi-Fi still not open `http://<laptop-IP>:8080`? (c) Which counter is deliberately open to the Wi-Fi?
3. `docker compose stop backend` versus `docker compose exec backend kill 1`. (a) What do `ps -a`, the log, and `RestartCount` say after each? (b) Both exit codes are 0. Why does only one come back to life by itself?
4. Your molds were built on a MacBook M3 and dropped off at GHCR; your friend uses an Intel laptop. (a) What happens, and why does `grafana/grafana:13.2.4` have no problem? (b) What's the way out in Module 26?
5. The backend package is about to be made public. (a) Why must `.dockerignore` exist before `docker build`, even though `.env` could be deleted in a later recipe step? (b) What's checked first, and why before it goes public?

<details>
<summary><b>Answer key</b></summary>

1. (a) The containers and the hallway; every cupboard stays, so the fingerprint is the same after `up -d` (L3). (b) Compose's own cupboards, including the broker's password file in `smarthome_broker-data`: `broker-account` only recreates the `backend` account, so the device accounts and `pi-bridge` are lost. The history and Grafana are safe because their cupboards are `external`. (c) If `external: true` was forgotten, `down -v` deletes it too (the author's lab, a test project), or through `docker volume rm smarthome-…`. Without a tested backup (Practice 9), it's gone ([Concept 6](#6-cupboards-and-windows-volumes-bind-mounts-and-backups)).
2. (a) Inside a container, `127.0.0.1` = that container itself, so Caddy, calling `backend:8080` through the hallway, can't get in; `0.0.0.0` = every interface **inside** the container. (b) What decides is its counter, `127.0.0.1:${PORT_BACKEND:-8080}:8080`: only this laptop. (c) The central broker, without an IP, for the Pi gateway and the ESP32: `0.0.0.0:1883->1883/tcp, [::]:1883->1883/tcp` in `docker compose ps`. On public Wi-Fi: `docker compose stop mosquitto` ([Concept 7](#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)).
3. (a) `kill 1`: `SIGTERM received: the backend is stopping gracefully`, then `Up … seconds` again with `RestartCount` 1 (the author's lab: ±7 seconds). `stop`: `Exited (0) … ago`, it stays off. (b) `unless-stopped` brings back a program that stopped by itself, but respects `stop` as your decision; what makes the difference is who stopped it. That's why `kill 1` from inside is the proof for the Syllabus's "watching it come back to life by itself" ([Concept 8](#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs)).
4. (a) The M3 = arm64, and `docker build` only makes a `linux/arm64` mold, so the Intel laptop's pull (`linux/amd64`) is refused (the author's lab: `no matching manifest for linux/amd64 …`). Official molds are multi-architecture: Docker picks the version that fits. (b) Your friend runs `docker compose up -d --build` and builds them from the `Dockerfile`s in the repo, which takes longer (an amd64 laptop hasn't been tested by the author). One mold for two architectures: automatic in Module 29 ([Concept 11](#11-the-image-shop-ghcr-and-architecture)).
5. (a) `docker build` sends the folder's contents (the build context), and `COPY` takes from there. Without a filter, `.env` can be copied into a layer, and that layer stays even if a later step deletes the file; anyone can take a public mold apart. (b) `docker history --no-trunc` without passwords or tokens (2.4, 10.3), because a public package can't be made private again ([Concept 3](#3-the-molds-recipe-dockerfile-and-dockerignore)).

</details>

---

## ✅ Module 26 Completion Checklist

The Syllabus's pass requirement: **on a "clean" laptop (or a friend's), `git clone` + `docker compose up -d` runs the whole system in < 10 minutes, and the history data is still there after `docker compose down && up`.** **Laptop path:** L1 + L2 + L3, with the simulator and the mock Garden as the stand-in for L4.

> [!NOTE]
> **The author hasn't tested Docker Desktop, Raspberry Pi OS with a real ESP32, the real GHCR and GitHub, a friend's laptop, or a Docker restart or reboot.** The Expected output boxes were recorded on one Raspberry Pi 5 (Ubuntu) playing the laptop and the Pi, with a stand-in image shop and a mock Telegram; the author's L1 is "warm" too ([📚](#-sources--image-credits)). Tick only what has really happened for you; for the rest, write "not yet" in your notes and your pull request.

- [ ] **L1** `git clone` to the **Login** page in < 10 minutes, the admin account logs in; two numbers (total, without downloads), the internet speed, and the test place written down (11.2).
- [ ] **L2** `docker compose ps -a`: three `(healthy)`, `mosquitto` and `web` `Up`, three one-off services `Exited (0)`; Grafana complete without a click (11.3).
- [ ] **L3** The same fingerprint after `docker compose down` and then `up -d`, with no `Volume` line in the output of `down` (8.4, 11.4).
- [ ] **L4** (Kit B) The Pi runs `edge/compose.edge.yml`; Node 1 connects with its old account without new firmware, **Live** lights up, **Lamp** is answered with an `ack` (6.6). **Laptop path:** the simulator and the mock Garden live through the central broker, the lamp answered with an `ack` (5.5).
- [ ] The warm-up matches the "Self-test answer key" (🔁).
- [ ] MQTTX receives the `sender` container's messages at counter 1884, then `down` leaves nothing behind (Quick Win).
- [ ] ⭐ The `feature/docker-compose` branch; the history's and Grafana's fingerprints written down after the data writers stopped (Practice 1).
- [ ] ⭐ `npm test` 15 files / 99 tests; the backend 1.3.0 mold without secrets in `docker history --no-trunc`, running as `node` (Practice 2).
- [ ] ⭐ Lint clean, two `SAME`; the web 1.2.0 mold at counter 8088 answers `200`, `200`, `404`, `502` (Practice 3).
- [ ] ⭐ The old containers removed, the cupboards kept; `Skipping initialization`; the fingerprint the same as in 1.2; Grafana intact (Practice 4).
- [ ] ⭐ `docker compose up -d --build`; **Log in** through `http://localhost`, F5 safe, Bruno `200`; live data through the central broker; dev mode with one backend (Practice 5).
- [ ] ⭐ (Kit B) The old password file in the gateway's cupboard, the apt broker `inactive`, `Connecting bridge` on the Pi and `New bridge connected` on the laptop (Practice 6).
- [ ] ⭐ The takeover in order; the only data source left is `smarthome-db`, the rule and the contact point **Provisioned**, the **Test** arrives, the dashboard's **Save** refused (Practice 7).
- [ ] ⭐ `exec backend kill 1` → back to life (`RestartCount` 1); `stop backend` → stays `Exited (0)` (Practice 8).
- [ ] The `pg_dump` archive restored into the `restore-test` project with the same fingerprint; only the test project cleaned up (Practice 9, optional).
- [ ] Two molds on GHCR, `docker history` checked before going public, the architecture written down (Practice 10, optional).
- [ ] ⭐ Commits pushed before the test, the test place chosen honestly, the test project removed by its cupboards' full names (Practice 11).
- [ ] Project matches `code/`; README, `.env.example`, and the pull request template updated; notes in `learn-iot/module-26/` (➕ A–D, F).
- [ ] ⭐ The pull request "The whole system in Docker Compose" merged into `main`, without `.env`, passwords, tokens, or home IPs in **Files changed** (➕ E).

**Phase 5 opens: the whole home in one package.** One command starts everything, the history and Grafana moved without losing data, and another laptop runs it from `git clone`. Its limits: everything is still on the home network without HTTPS and TLS, and a sleeping laptop puts the bot, the alerts, and the morning report to sleep too.

> ➡️ **Next module:** [Module 27 — To the Internet: VPS, Domain, HTTPS, MQTT over TLS, Pi → VPS Bridge, & a Phone App (PWA)](../module-27-deploy-internet-tls-pwa/README.md). The same `compose.cloud.yml` moves to a VPS with a domain and HTTPS (in the Caddyfile, `:80` is replaced by the domain name), the Pi bridge moves up to TLS and learns to hold data while the internet is down, and the dashboard becomes an app on your phone. Its free path: everything on the Pi, through Cloudflare Tunnel (the `tunnel` profile).

## 📚 Sources & Image Credits

**Official sources** (read 28 Oct 2026; their contents follow the latest release):

- **Docker**: [`docker compose` and `COMPOSE_FILE`](https://docs.docker.com/reference/cli/docker/compose/), [services](https://docs.docker.com/reference/compose-file/services/) (`depends_on`, healthcheck, `restart`, profiles), [`external` cupboards](https://docs.docker.com/reference/compose-file/volumes/), [`down`](https://docs.docker.com/reference/cli/docker/compose/down/), [restart policy](https://docs.docker.com/engine/containers/start-containers-automatically/), [Compose version history](https://docs.docker.com/compose/intro/history/) (v5 "functionally identical" to v2), [Engine on Debian](https://docs.docker.com/engine/install/debian/) and [the `docker` group](https://docs.docker.com/engine/install/linux-postinstall/), [Desktop release notes](https://docs.docker.com/desktop/release-notes/). [Docker Desktop license](https://docs.docker.com/subscription/desktop-license/): free for personal use, education, non-commercial open source, and businesses under 250 employees and US$10 million of revenue a year; beyond that, government agencies included, it's paid. Docker Engine (Linux, Pi) isn't affected.
- **Images** (tags and digests checked on Docker Hub): [timescaledb](https://hub.docker.com/r/timescale/timescaledb/tags), [grafana](https://hub.docker.com/r/grafana/grafana/tags), [eclipse-mosquitto](https://hub.docker.com/_/eclipse-mosquitto/tags), [caddy](https://hub.docker.com/_/caddy/tags), [node](https://hub.docker.com/_/node/tags), [uptime-kuma](https://hub.docker.com/r/louislam/uptime-kuma/tags), [cloudflared](https://hub.docker.com/r/cloudflare/cloudflared/tags), [node-red](https://hub.docker.com/r/nodered/node-red/tags); [Node.js Docker best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md) (PID 1, `USER node`).
- **Caddy**: [Caddyfile](https://caddyserver.com/docs/caddyfile), [`handle_path`](https://caddyserver.com/docs/caddyfile/directives/handle_path), [`reverse_proxy` + `header_down`](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [automatic HTTPS](https://caddyserver.com/docs/automatic-https) (`:80` = HTTP only), [its image notes](https://github.com/docker-library/docs/blob/master/caddy/content.md) ("Do not mount the Caddyfile directly"). **Grafana 13.2**: [provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/) and [alert provisioning](https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/). **Mosquitto 2.1**: [`mosquitto.conf`](https://mosquitto.org/man/mosquitto-conf-5.html) (bridges) and [ChangeLog](https://github.com/eclipse-mosquitto/mosquitto/blob/master/ChangeLog.txt) (`password_file` deprecated, gone in 3.0).
- **GHCR** (not recorded): [Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) (classic PAT), [visibility](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility), [billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages) (images currently free). **Backups**: [TimescaleDB](https://www.tigerdata.com/docs/deploy/self-hosted/backup-and-restore/logical-backup), [`pg_dump`](https://www.postgresql.org/docs/17/app-pgdump.html), [`pg_restore`](https://www.postgresql.org/docs/17/app-pgrestore.html). The pass requirement from [Syllabus §7, Module 26](../../SYLLABUS.md#module-26--docker--docker-compose-one-command-for-all-services) (v1.0.28).

**Images.** File by file: [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| 8 diagrams (`roadmap-module-26` … `image-shop-and-architecture`) | Original diagrams from `code/` and the author's tests; numbers and IPs = **examples**; the reboot and GHCR from documents, **not tested**. | CC BY 4.0 (`.svg` in `assets/`) |
| `grafana-provisioning-wrong`, `dashboard-through-caddy`, `grafana-provisioned`, `uptime-kuma-wizard` | Real Chrome 156 screenshots on the recording machine (1280 px wide; 375 px = Chrome's device mode, **not a phone**): Grafana 13.2.4 (the red panels from a separate test project), dashboard v1.2 through Caddy, Uptime Kuma 2.5.8. Lab test accounts; passwords and tokens not visible. | Grafana OSS (AGPLv3), Caddy (Apache-2.0), Uptime Kuma and React (MIT) shown as they are for educational purposes; titles, numbers, captions CC BY 4.0 |

**About the Expected output boxes.** "The author's lab" is mostly the **English lab** of 29 October 2026, on exactly `code/`, on a **Raspberry Pi 5 16 GB with Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3 (the Ubuntu package), Node.js 24.21.0, and Google Chrome 156 without a screen (time zone `Asia/Jakarta`). Many boxes keep the example values of the Indonesian edition's recordings (its final lab of the evening of 28 October 2026, made the same way on the same Pi), while the wording, the log formats, the names, and the file names and sizes that follow from the English code come from the English lab. A few results come from the Indonesian edition's code lab (afternoon) or research prototype (midday) of that day on the same machine, e.g. the alerts sent twice without a takeover.

That machine played the laptop AND the Pi: the center and the gateway = two Compose projects, the gateway on another counter with `CENTER_ADDRESS=host-gateway` (written 1884, as in 6.7). Its starting point was "a mock Module 25 reader", put together with the commands of Modules 17 and 25 as they are, except: the "old Pi" broker = an `eclipse-mosquitto:2.0.22` container with a 2.0-format password file, `sudo cat` and `systemctl` replaced by lab files and containers, and Grafana's contents made through the same API as its screens. Node 1 = the simulator `f00d00000001`, Node 2 = the mock Garden, MQTTX and Node-RED = an MQTT client on that machine, Bruno = `curl` with the same requests.

The counters in the text = your counters; the lab used its own counters, and the backend was recorded on another counter (8080 on the author's machine is used by another program), then written as 8080. The lab's Docker names are rewritten to `smarthome…`, `quick-win`, `restore-test`, `clean-test`, or `red-test` only on lines that are otherwise identical. The LAN IP = `192.168.1.10` (DNS `192.168.1.1`), paths = `/home/you/…`. Times are written in WIB (the machine is WITA), except the database log (UTC, given with its WIB equivalent) and Mosquitto (epoch seconds). Seconds, sizes, uids, and sensor numbers = **examples**.

Telegram = a **mock** Bot API server (a fake token and chat_id): the backend through `TELEGRAM_API_ROOT`, Grafana through a lab-only addition to `docker run` and Compose (the alias `api.telegram.org` + a lab CA) that is **not** in your project; the message boxes = the text the mock received; the `409 Conflict` of two backends is the mock's too. GHCR = `registry:3.1.2` on `127.0.0.1` without an account: `ghcr.io/<account>` is only written on lines that don't depend on the shop; the push and pull progress is shortened. GitHub = a local git repository: `git clone`/`git push` to a local path are written `https://github.com/<account>/mini-smart-home.git`; the pull request of ➕ E = a branch merge in that repo. The author's L1 is **warm**, the weakest test (the same machine, another folder/names/counters, the official images already there); the cold download of ±1,089 MB is only calculated. The first builds (45.8 s, 103 s) were measured with `--no-cache` because the lab's earlier cache was still there.

**Not** tested: Docker Desktop (Windows, macOS), PowerShell and CMD, Raspberry Pi OS with Docker Engine from the apt repository and `systemctl` (6.1 wasn't run), a real ESP32 to the container broker, two machines on a LAN, a real phone, the real GHCR and GitHub, a Docker restart and a reboot, amd64 images (bcrypt for musl x64), a cold L1 with home internet, the real Telegram and MQTTX.

**Not yet proven** at publication: Grafana 13.2.5 on top of a 13.2.4 cupboard; the systemd Node-RED on the Pi to the gateway broker (lab: an MQTT client); stopping the old laptop broker (every OS); Compose 5.x; Windows- and Mac-specific things (port 80, ports < 1024, `$PWD`, Git for Windows CRLF); and GHCR's `denied` answer.

---

[⬅️ Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 27 — To the Internet: VPS, Domain, HTTPS, MQTT over TLS, Pi → VPS Bridge, & a Phone App (PWA)](../module-27-deploy-internet-tls-pwa/README.md) ➡️**
