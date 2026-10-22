# 🟩 Phase 3 — Backend & Data: Node.js/TypeScript + PostgreSQL (Modules 16–21)

🌐 **English** · [Bahasa Indonesia](../../fase-3-backend-data/README.md)

> **Phase goal:** a "head office" that remembers everything, makes decisions, and has door keys. **The backend and the database are developed on the laptop**, while the Raspberry Pi stays the broker that runs 24 hours a day. Locking down the communication paths with TLS/HTTPS and putting everything on the internet is a job for Phase 5. Every module of this phase starts with a **JavaScript warm-up** of about one hour.

Work through the modules **in order**. One module = one week (6–10 hours, spread out). Click a module title to open its article.

| Week | Module | Hardware | Tools installed in this module | Status |
| :---: | :--- | :--- | :--- | :--- |
| 16 | **[Module 16 — Your First Backend with Light TypeScript: Receiving Data, APIs, & Git for Teams](module-16-backend-typescript-api-git/README.md)** | Kit A + B from Phase 2 (Node 1, Node 2, the Pi gateway), or just a laptop with the 10-device simulator | Fastify 5.12.7, Zod 4.6.7, mqtt.js 5.16.1, TypeScript 7.0.2 (the type checker), Bruno 4.2.1, Git 2.56.0 (Windows) or the Command Line Tools (macOS), GitHub CLI 2.102.0 (macOS) | ✅ available |
| 17 | **[Module 17 — Your First Database: SQL Basics & the "Mini Smart Home" Schema (PostgreSQL via Docker)](module-17-sql-and-database-schema/README.md)** | Kit A + B from Phase 2, or just a laptop with the practice data and the Module 16 simulator | Docker Desktop 4.95, the image `timescale/timescaledb:2.30.2-pg17` (PostgreSQL 17.11 + TimescaleDB 2.30.2), DBeaver Community 26.2.3, `pg` 8.23.1 | ✅ available |
| 18 | **[Module 18 — TimescaleDB: Time-Series Data, Automatic Aggregation, Retention, & Backup](module-18-timescaledb/README.md)** | not needed: the Module 17 practice data and a million rows of test data made in this module | TimescaleDB 2.30.2 (already in the Module 17 image), psql, `pg_dump` and `pg_restore` inside the container; no big downloads | ✅ available |
| 19 | **[Module 19 — Realtime, Two-Way Control, Automation Rules (Cloud & Local), & Notifications](module-19-realtime-rules-notifications/README.md)** | Kit A + B from Phase 2 (Node 1 v1.5.0 and the Pi gateway), or just a laptop with the Module 19 simulator and Wokwi | Socket.IO 4.8.4 (server and `socket.io-client`), node-cron 4.6.0, grammY 1.46.0, Vitest 5.0.5 (with vite 8.3.4), a Telegram account | ✅ available |
| 20 | **[Module 20 — User Security: Login, JWT in Cookies, Roles, & API Protection](module-20-user-security/README.md)** | Kit A + B from Phase 2 (Node 1 v1.5.0 and the Pi gateway), or just a laptop with the Module 19 simulator | bcrypt 6.0.0, @fastify/jwt 10.2.5, @fastify/cookie 11.1.3, @fastify/rate-limit 11.2.1, @fastify/cors 11.3.1, Bruno 4.2.1 | ✅ available |
| 21 | Module 21 — Device Security: API Keys, Simple Provisioning, & Broker Access Control (ACL) | Kit A + B (or a laptop) | Mosquitto (password file and ACL), Zod, Bruno | ⏳ coming soon — [summary](../SYLLABUS.md#module-21--device-security-api-keys-simple-provisioning--broker-access-control-acl) |

## 🎯 Phase 3 completion criteria

Before moving on to Phase 4, make sure this evidence is in your GitHub repository ([Syllabus §8](../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)):

1. The quiz of every module (5 questions): **at least 4 correct**.
2. **Checkpoint project:** a locked-down backend (for people and devices), with automation rules (on the server, plus local safety rules on the devices) and Telegram notifications.
3. **Artifacts:** a Bruno collection, the `/docs` documentation (OpenAPI), the SQL schema, and merged pull requests.

Module 16 opens this phase: Mini Smart Home gets a server you build yourself. Backend v0.1 is written with Node.js 24 and light TypeScript. It listens to every MQTT message from the devices, checks every message against the data contract written as Zod schemas, and provides an API, documented at `/docs`, for reading the devices and for turning on a relay while waiting for its `ack`. That API is tested with Bruno and a simulator of ten fake devices. Its first feature is also built the way a real team does it: through a branch, a pull request, and a review with a checklist. Node-RED retires as the brain: its automation is switched off, while its dashboard stays in use.

Module 17 gives the backend a long-term memory. A PostgreSQL database runs in a Docker container on the laptop, the shape of its tables is written as numbered migrations, and SQL answers real questions such as the average temperature per day or the hour the soil was driest. Backend v0.2 stores every message that passes the contract check, rejects duplicate sends with the `(device_id, ts)` key, records every command, and provides the history API `GET /devices/:id/readings`.

Module 18 gets that history ready to grow for years with TimescaleDB. The readings table becomes a hypertable filed into daily binders, an hourly summary book is updated automatically, raw readings are dropped after 90 days and compressed after 7 days without losing their summaries, and the backup is proven restorable down to an identical fingerprint of the data. The query "the hourly average over the last 7 days" over a million rows finishes far below one second, and backend v0.3 provides the history per 15 minutes, per hour, and per WIB day through `?bucket=`.

Module 19 makes that house react on its own. Readings flow live to the screen through Socket.IO, every command goes through one door that waits for the device's answer and remembers the desired state, automation rules such as "turn on the fan if it's above 30 °C for 2 minutes" are stored in the database and can be changed through the API without a restart, a watering schedule runs every day at 06:00 WIB, and a Telegram bot sends alerts within seconds. Node 1 v1.5.0 keeps guarding the fan when the broker is gone and reports it as soon as it's reconnected. The rules brain is tested with unit tests, and the backend moves up to v0.4.

Module 20 locks that house for people. Everyone signs in with an account, and the password is stored as a bcrypt fingerprint. The JWT wristband lasts 15 minutes and its season pass lives in an `HttpOnly` cookie, the guard at every door answers 401 to guests without a wristband and 403 to `viewer` accounts that try to give commands, password guessers are stopped after 10 attempts per minute, foreign pages can't ride on your login, and Socket.IO takes the same wristband. The backend moves up to v0.5.

## 📂 What each module folder contains

| Content | Purpose |
| :--- | :--- |
| `README.md` | The module article — start reading here. GitHub shows it automatically when you open the module folder. |
| `code/` | The code of every practice stage, ready to compare with yours. In Module 16: `warmup/`, `quick-win/`, `stages/practice-2` to `practice-6` (the state of the backend at the end of each practice), `backend/` (the final state, complete with the Bruno collection), `tools/` (the simulator), `.github/` (the pull request template), and `challenges/key/`. In Module 17: `warmup/`, `stages/practice-3` to `practice-5`, `backend/` (backend v0.2, complete with its migration and the Bruno collection), and `challenges/key/`. In Module 18: `warmup/`, `backend/` (backend v0.3, complete with migrations `002`–`005` and the test-data recipe `test/load-1-million.sql`), and `challenges/key/`. In Module 19: `warmup/`, `backend/` (backend v0.4, complete with migration `007` and the Bruno collection), `tools/` (the Module 19 simulator, contract checker 1.3, and the small terminal), `firmware/node-1-home/` (v1.5.0), and `challenges/key/`. In Module 20: `warmup/`, `backend/` (backend v0.5, complete with migration `008` and the Bruno collection; the Bruno passwords live in your own `bruno/.env`), `tools/` (the small terminal that logs in with a `viewer` account), `.github/` (the pull request template with the security checklist), and `challenges/key/`. A `.env` file is never included: copy `.env.example`, then fill in your own. |
| `assets/` | The article's images, plus `SOURCES.md`, which records the source and license of every image. |

---

[⬅️ Phase 2 — Connectivity](../phase-2-connectivity/README.md) · [Front page](../README.md) · [Syllabus](../SYLLABUS.md) · [Progress tracker](../PROGRESS.md) · **Start: [Module 16](module-16-backend-typescript-api-git/README.md) ➡️**
