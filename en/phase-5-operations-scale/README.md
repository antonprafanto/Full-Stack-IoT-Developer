# ⬛ Phase 5 — Operations & Scale: Deploy, OTA, CI/CD, & Capstone (Modules 26–32)

🌐 **English** · [Bahasa Indonesia](../../fase-5-operasi-skala/README.md)

> **Phase goal:** from "it runs on my home network" to "it runs on the internet, 24/7, encrypted, updatable, and never loses data", and then proving it with a final project. This phase starts on the home network: Module 26 wraps the whole system in Docker Compose, and the internet, HTTPS, and TLS follow in Module 27.

Work through the modules **in order**. One module = one week, spread out; the time each module takes is written at the top of its article, and Module 31 may take 2–3 weeks. Click a module title to open its article.

| Week | Module | Hardware | Tools installed in this module | Status |
| :---: | :--- | :--- | :--- | :--- |
| 26 | **[Module 26 — Docker & Docker Compose: One Command for All Services](module-26-docker-compose/README.md)** | Kit B (64-bit Raspberry Pi OS), or just a laptop with the Module 21 simulator and the mock Garden; plus the result of Module 25 on `main` and ±6 GB of disk space | Docker Desktop ≥ 4.96.2 or Docker Engine 29 (Pi: Docker's apt repository), Docker Compose, Caddy 2.11.7 (`caddy:2.11.7-alpine`), Mosquitto 2.1.2 in a container (`eclipse-mosquitto:2.1.2-alpine`), `node:24.22.1-alpine3.24` (the base of the molds), GHCR (manual) | ✅ available |
| 27 | Module 27 — To the Internet: VPS, Domain, HTTPS, MQTT over TLS, Pi → VPS Bridge, & a Phone App (PWA) | Kit A + B + a 2 GB VPS (highly recommended) + a domain | Caddy (HTTPS), Cloudflare Tunnel, Let's Encrypt, `WiFiClientSecure` on the ESP32, vite-plugin-pwa | ⏳ coming soon — [summary](../SYLLABUS.md#module-27--to-the-internet-vps-domain-https-mqtt-over-tls-pi--vps-bridge--a-phone-app-pwa) |
| 28 | Module 28 — OTA Updates, Provisioning, Fleets, & From Breadboard to Enclosure | Kit A (2 ESP32s, project box) + server | the ESP32 Update/HTTPUpdate libraries, Preferences, WiFiManager | ⏳ coming soon — [summary](../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure) |
| 29 | Module 29 — Testing & CI/CD: Every Change Tested and Deployed Automatically | server | Vitest, GitHub Actions, GHCR, `docker buildx`, systemd timer | ⏳ coming soon — [summary](../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) |
| 30 | Module 30 — Monitoring, Backup, Runbooks: Know First, Never Lose Data | server | Uptime Kuma, Grafana alerting, rclone, cron/systemd timer | ⏳ coming soon — [summary](../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data) |
| 31 | Module 31 — Capstone: Design & Build Your Final Project | your choice | everything you've learned | ⏳ coming soon — [summary](../SYLLABUS.md#module-31--capstone-design--build-your-final-project) |
| 32 | Module 32 — Portfolio, Cost & Scale, & Career Steps | — | GitHub (README, releases), a screen recorder | ⏳ coming soon — [summary](../SYLLABUS.md#module-32--portfolio-cost--scale--career-steps) |

## 🎯 Phase 5 completion criteria

This last phase closes with a final project. Before you call yourself a Fullstack IoT Developer 🎓, make sure this evidence is in your GitHub repository ([Syllabus §8](../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)):

1. The quiz of every module (5 questions): **at least 4 correct**, for Modules 26–30.
2. **Checkpoint project:** an online system + TLS + OTA + CI/CD + monitoring + capstone.
3. **Artifacts:** a product README + a runbook + a 3-minute demo video.

Module 26 opens this phase: the whole Mini Smart Home is **wrapped in Docker** and starts with one command. Backend 1.3.0 and dashboard 1.2.0 now have two-stage molds (images); the dashboard is served by Caddy at `http://localhost` without Vite, and F5 is safe at every address. One file, `compose.cloud.yml`, starts the database, the central broker, the backend, the web service, and Grafana with `docker compose up -d`, plus three one-off services that prepare the accounts and the migrations. The history and Grafana move into Compose on top of the same cupboards without losing data, proven by a history fingerprint that stays exactly the same, and Grafana now starts complete from files (provisioning). The services come back to life by themselves thanks to health checks and restart policies. On the Pi, the gateway broker moves into a container through `edge/compose.edge.yml` and forwards the data to the laptop through a LAN bridge, without new firmware; without a Pi, the simulator and the mock Garden take its place. You also back up the cupboards and test restoring them, drop the molds off at the GHCR image shop, then run the "clean laptop" test: from `git clone` to the **Login** page in < 10 minutes, with the history still there after `docker compose down` and then `up -d`. Everything is still on the home network, and a sleeping laptop puts the bot, the alerts, and the morning report to sleep with it; the internet, HTTPS, and TLS follow in Module 27.

## 📂 What each module folder contains

| Content | Purpose |
| :--- | :--- |
| `README.md` | The module article — start reading here. GitHub shows it automatically when you open the module folder. |
| `code/` | The code of every practice stage, ready to compare with yours. In Module 26: `warmup/` (the inventory sheet, `practice.yaml`, and `practice.env`), `quick-win/` (a two-service `compose.yaml`: a practice broker and a sender), `stages/practice-4` and `practice-5` (`compose.cloud.yml` at the end of each of those practices), the project root files (`compose.cloud.yml`, `.env.example`, `.gitignore`, `.gitattributes`, `README.md`, and `scripts/fingerprint.sql`), `backend/` (backend 1.3.0 with a `Dockerfile`, the final state) plus `backend-1.3.diff` (its changes from v1.2), `frontend/` (dashboard 1.2.0 with a `Dockerfile` and `caddy/Caddyfile`, the final state) plus `frontend-1.2.diff`, `grafana/` (the provisioning files) plus `grafana.diff`, `edge/` (`compose.edge.yml`, `center.conf`, `gateway.conf`, `bridge.example.conf`, `bridge/README.md`, `.env.example`, `acl-broker` with block `7) pi-bridge`, as well as `gateway-pi.conf` and `mosquitto-lan.conf` labeled "WITHOUT DOCKER") plus `edge.diff`, `tools/` (the README for the central broker), `.github/` (the pull request template), and `challenges/key/` (phone mode through `.env`, Uptime Kuma, and the simulator in a container). The files `.env`, `edge/.env`, and `edge/bridge/center.conf` are never included: copy `.env.example` (at the root and in `edge/`), then fill in your own. |
| `assets/` | The article's images, plus `SOURCES.md`, which records the source and license of every image. |

---

[⬅️ Phase 4 — Frontend Dashboard](../phase-4-frontend-dashboard/README.md) · [Front page](../README.md) · [Syllabus](../SYLLABUS.md) · [Progress tracker](../PROGRESS.md) · **Start: [Module 26](module-26-docker-compose/README.md) ➡️**
