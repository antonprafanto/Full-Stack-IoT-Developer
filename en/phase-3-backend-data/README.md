# 🟩 Phase 3 — Backend & Data: Node.js/TypeScript + PostgreSQL (Modules 16–21)

🌐 **English** · [Bahasa Indonesia](../../fase-3-backend-data/README.md)

> **Phase goal:** a "head office" that remembers everything, makes decisions, and has door keys. **The backend and the database are developed on the laptop**, while the Raspberry Pi stays the broker that runs 24 hours a day. Locking down the communication paths with TLS/HTTPS and putting everything on the internet is a job for Phase 5. Every module of this phase starts with a **JavaScript warm-up** of about one hour.

Work through the modules **in order**. One module = one week (6–10 hours, spread out). Click a module title to open its article.

| Week | Module | Hardware | Tools installed in this module | Status |
| :---: | :--- | :--- | :--- | :--- |
| 16 | **[Module 16 — Your First Backend with Light TypeScript: Receiving Data, APIs, & Git for Teams](module-16-backend-typescript-api-git/README.md)** | Kit A + B from Phase 2 (Node 1, Node 2, the Pi gateway), or just a laptop with the 10-device simulator | Fastify 5.12.7, Zod 4.6.7, mqtt.js 5.16.1, TypeScript 7.0.2 (the type checker), Bruno 4.2.1, Git 2.56.0 (Windows) or the Command Line Tools (macOS), GitHub CLI 2.102.0 (macOS) | ✅ available |
| 17 | **[Module 17 — Your First Database: SQL Basics & the "Mini Smart Home" Schema (PostgreSQL via Docker)](module-17-sql-and-database-schema/README.md)** | Kit A + B from Phase 2, or just a laptop with the practice data and the Module 16 simulator | Docker Desktop 4.95, the image `timescale/timescaledb:2.30.2-pg17` (PostgreSQL 17.11 + TimescaleDB 2.30.2), DBeaver Community 26.2.3, `pg` 8.23.1 | ✅ available |
| 18 | Module 18 — TimescaleDB: Time-Series Data, Automatic Aggregation, Retention, & Backup | — (data from the backend or the simulator) | TimescaleDB, DBeaver, `pg_dump` | ⏳ coming soon — [summary](../SYLLABUS.md#module-18--timescaledb-time-series-data-automatic-aggregation-retention--backup) |
| 19 | Module 19 — Realtime, Two-Way Control, Automation Rules (Cloud & Local), & Notifications | Kit A + B (or a laptop) | Socket.IO, node-cron, grammY, Vitest | ⏳ coming soon — [summary](../SYLLABUS.md#module-19--realtime-two-way-control-automation-rules-cloud--local--notifications) |
| 20 | Module 20 — User Security: Login, JWT in Cookies, Roles, & API Protection | Kit A + B (or a laptop) | bcrypt, @fastify/jwt, @fastify/cookie, @fastify/rate-limit, @fastify/cors | ⏳ coming soon — [summary](../SYLLABUS.md#module-20--user-security-login-jwt-in-cookies-roles--api-protection) |
| 21 | Module 21 — Device Security: API Keys, Simple Provisioning, & Broker Access Control (ACL) | Kit A + B (or a laptop) | Mosquitto (password file and ACL), Zod, Bruno | ⏳ coming soon — [summary](../SYLLABUS.md#module-21--device-security-api-keys-simple-provisioning--broker-access-control-acl) |

## 🎯 Phase 3 completion criteria

Before moving on to Phase 4, make sure this evidence is in your GitHub repository ([Syllabus §8](../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)):

1. The quiz of every module (5 questions): **at least 4 correct**.
2. **Checkpoint project:** a locked-down backend (for people and devices), with automation rules (on the server, plus local safety rules on the devices) and Telegram notifications.
3. **Artifacts:** a Bruno collection, the `/docs` documentation (OpenAPI), the SQL schema, and merged pull requests.

Module 16 opens this phase: Mini Smart Home gets a server you build yourself. Backend v0.1 is written with Node.js 24 and light TypeScript. It listens to every MQTT message from the devices, checks every message against the data contract written as Zod schemas, and provides an API, documented at `/docs`, for reading the devices and for turning on a relay while waiting for its `ack`. That API is tested with Bruno and a simulator of ten fake devices. Its first feature is also built the way a real team does it: through a branch, a pull request, and a review with a checklist. Node-RED retires as the brain: its automation is switched off, while its dashboard stays in use.

Module 17 gives the backend a long-term memory. A PostgreSQL database runs in a Docker container on the laptop, the shape of its tables is written as numbered migrations, and SQL answers real questions such as the average temperature per day or the hour the soil was driest. Backend v0.2 stores every message that passes the contract check, rejects duplicate sends with the `(device_id, ts)` key, records every command, and provides the history API `GET /devices/:id/readings`.

## 📂 What each module folder contains

| Content | Purpose |
| :--- | :--- |
| `README.md` | The module article — start reading here. GitHub shows it automatically when you open the module folder. |
| `code/` | The code of every practice stage, ready to compare with yours. In Module 16: `warmup/`, `quick-win/`, `stages/practice-2` to `practice-6` (the state of the backend at the end of each practice), `backend/` (the final state, complete with the Bruno collection), `tools/` (the simulator), `.github/` (the pull request template), and `challenges/key/`. In Module 17: `warmup/`, `stages/practice-3` to `practice-5`, `backend/` (backend v0.2, complete with its migration and the Bruno collection), and `challenges/key/`. A `.env` file is never included: copy `.env.example`, then fill in your own. |
| `assets/` | The article's images, plus `SOURCES.md`, which records the source and license of every image. |

---

[⬅️ Phase 2 — Connectivity](../phase-2-connectivity/README.md) · [Front page](../README.md) · [Syllabus](../SYLLABUS.md) · [Progress tracker](../PROGRESS.md) · **Start: [Module 16](module-16-backend-typescript-api-git/README.md) ➡️**
