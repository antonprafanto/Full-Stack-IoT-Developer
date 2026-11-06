# Mini Smart Home Backend

🌐 **English** · [Bahasa Indonesia](../../../../../fase-5-operasi-skala/modul-29-testing-cicd/kode/backend/README.md)

Backend 2.0 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.6 (Zod schemas; messages of the old shape stay valid), keeps the last state of every device in memory, archives every message in a PostgreSQL database with the TimescaleDB add-on (through Docker), and provides a documented API. The reading history can be requested raw or already summarized per 15 minutes, per hour, or per day. Since Module 19, readings also flow live through Socket.IO, every command goes through one door (with the desired and the reported state), automation rules and schedules are stored in the database and can be changed through the API without restarting the server, every important event is recorded, and alerts are sent through Telegram. Since Module 20, the API and Socket.IO are **locked for people**: guests must log in first, `viewer` accounts can only look, login attempts are limited, and other web pages can't make the server act on a user's behalf. Since Module 21, the backend is also **locked for devices**: only devices an admin has registered (with a per-device key) have their data processed, messages from unregistered or revoked devices are ignored, and the backend itself connects to the broker with its own account. 🎉 **Phase 3 checkpoint: the house is locked for people and for devices.**

**v1.1 (Module 24)** adds three small things dashboard v1.0 needs: **below-threshold** rules (for example water when the soil is below 30%), threshold rules that **send a command once** (for example the pump for 5 seconds), and **deleting rules** (`DELETE /rules/:id`). No database migration and no data-contract change (still 1.4); details in [Version 1.1 notes](#version-11-notes).

**v1.2 (Module 25)** adds two things for the device map and the daily report: `GET /devices` now carries each device's **map point** (`lat`, `lng`), and the admin moves it with `PUT /devices/:id/location`; the backend also sends a **daily CSV report** through the Telegram bot every morning (default 07:00 WIB, setting `REPORT_SCHEDULE`), and `POST /reports/send` sends it right now. No database migration, no new npm package, the data contract stays 1.4; details in [Map and daily report](#map-and-daily-report-module-25) and [Version 1.2 notes](#version-12-notes).

**v1.3 (Module 26)** lets the backend run as a **Docker container** in `compose.cloud.yml` (the project root), together with the database, the central broker, the dashboard, and Grafana: one command, `docker compose up -d`, starts everything, and a backend that stops by itself is started again by Docker. The changes are small: `pino-pretty` moves to `dependencies` (it's used while the server runs), the npm scripts no longer fail when there is no `.env`, successful `/health` knocks no longer fill the log, plus a `Dockerfile` and a `.dockerignore`. No database migration, no new npm package, the data contract stays 1.4; details in [Version 1.3 notes](#version-13-notes).

**v1.4 (Module 27)** gets the backend ready for the **internet**, behind Caddy, which adds HTTPS (a VPS, or a Raspberry Pi with Cloudflare Tunnel): the new setting `TRUST_PROXY` makes the backend trust what Caddy says about its visitors, so the login cookies get the `Secure` attribute on an `https://` page and the login limiter (10 attempts per minute) counts **per visitor**, not every visitor as one address. `CORS_ORIGIN` now has its form checked when the server starts (a dashboard address such as `https://iot.yourname.my.id`, without a `/` at the end), and a manual command the device doesn't answer is no longer quietly sent again long after the dashboard reported it as failed (for example while the home internet is down). No database migration and no new npm package; the data contract moves up to **1.5** without any change to the message shapes. Details in [On the internet, behind Caddy HTTPS](#on-the-internet-behind-caddy-https-module-27) and [Version 1.4 notes](#version-14-notes).

**v1.5 (Module 28)** makes the backend look after a **fleet of devices**: the admin uploads a `.bin` firmware file, then orders Node 1 to update itself **over the air** (OTA) one at a time, a canary device first, then all of them; the device downloads the file through the **locked** route `/fw/node-1/<version>.bin` (the Module 21 device key, not a public file) and reports the result (`succeeded`, `rollback`, `failed`) in `vitals`. The dashboard's `/fleet` page reads `GET /fleet` (the version, the health including the restart reason, and the last update of every device). A new device registers itself within one minute with a single-use **claim code** made by the admin, every device's broker account is created and deleted **automatically** through Mosquitto's dynamic security plugin (the setting `AUTO_BROKER_ACCOUNTS`), and a lost device can be **deactivated**: the broker disconnects it at once. A new migration `011_ota_and_fleet.sql`, no new npm package; the data contract moves up to **1.6**. Details in [Firmware updates, the fleet, and claim codes](#firmware-updates-the-fleet-and-claim-codes-module-28) and [Version 1.5 notes](#version-15-notes).

**2.0.0 (Module 29)** adds no route or table. `2.0.0` is **one product version number** for the backend and the dashboard (the same as the image tag and the Git tag `v2.0.0`), and the backend is now **tested by the robot** before it is deployed automatically to the VPS and the Pi. `GET /health` names the running `version` and the `/docs` documentation uses the same number (both read from `package.json`); the server assembly moved to `src/app.ts` (`buildApp()`), so that **20 integration tests** with a test database (`src/integration/`) test the same assembly as production; `npm run lint` (oxlint) checks the code too; the `Dockerfile` builds molds for two kinds of processor (amd64 and arm64) without emulation. No database migration, no new production package (oxlint is only a developer tool), the data contract stays 1.6. Details in [Tested with a test database](#tested-with-a-test-database-module-29) and [Version 2.0 notes](#version-20-notes).

There are two ways to run the backend, and **only one may run** at a time (two backends with the same Telegram token fight each other, `409 Conflict`; two backends also fight over counter 8080):

| Way | When | Its settings come from |
| :--- | :--- | :--- |
| **Home mode** (Docker Compose) | every day: the home is on, the dashboard at `http://localhost` | `.env` at the **project root** (its example is the root `.env.example`) |
| **Dev mode** (`npm run dev`) | while changing the backend code | `backend/.env` (its example is `backend/.env.example` in this folder) |

## How to run it with Docker Compose (Module 26)

All the commands in this section are typed from the **project root** (the folder that holds `compose.cloud.yml`), the same in PowerShell, the macOS Terminal, and Linux. The full steps, including moving the old database and Grafana into Compose without losing data, are in [Module 26](../../../module-26-docker-compose/README.md).

1. Copy the root `.env.example` to `.env`, then fill in its secrets and `IMAGE_REGISTRY` (`ghcr.io/` + your GitHub account name in lowercase; not a secret). Moving from Module 25: `POSTGRES_PASSWORD` = your **old** postgres password (the `smarthome-data` cupboard already stores it). On Linux, macOS, and the Pi: `chmod 600 .env`.
2. New laptop only (the Module 17 and 25 cupboards don't exist yet): `docker volume create smarthome-data` and `docker volume create smarthome-grafana-data`.
3. `docker compose up -d`. The first time, Compose pulls the backend and dashboard images from the image shop, or builds them itself from the `Dockerfile` when the shop doesn't have them yet (a few minutes). The `migrate` service applies the new `migrations/` files and then stops by itself; the backend starts after it. `docker compose ps -a` shows `backend` `(healthy)` and `migrate` `Exited (0)` (without `-a`, one-off services that are done don't show).
4. The first account (the password is asked twice): `docker compose exec backend node src/db/manage-users.ts add admin@home.test "Home Admin" admin`. Accounts already in the old cupboard stay valid.

| Command (from the project root) | What it does |
| :--- | :--- |
| `docker compose ps -a` | the state of every service, including one-off services that are done (`Exited (0)`): `(healthy)` = the backend answers `HEAD /health` |
| `docker compose logs -f backend` | the backend log (WIB times); **Ctrl + C** only stops reading, the backend keeps running. `--since 10m` = the last 10 minutes |
| `docker compose exec backend node src/db/manage-users.ts <command>` | every `npm run users -- …` command of the Dev mode table (`npm run users -- …` also works in the container, with the line `.env not found. Continuing without it.`) |
| `docker compose exec backend node src/db/seed-history.ts` | 7 days of practice data (a laptop without history), then summarize it once with the command of Dev mode step 7 |
| `docker compose build backend` then `docker compose up -d backend` | **on the laptop**: rebuilds the image after the code changed (tag = `version` in `package.json`). Since Module 29, the VPS and the Pi don't build: they pull the molds the robot builds (`sh scripts/deploy.sh`) |
| `docker compose stop backend` / `docker compose start backend` | stops it and starts it again; a container stopped with `stop` is NOT started again by Docker itself |

The API docs stay at the old counter, **`http://localhost:8080/docs`** (not `127.0.0.1`: in the container the backend listens on `0.0.0.0`, so a login through **Try it out** from the page `http://127.0.0.1:8080/docs` is refused with `403`). If `PORT_BACKEND` in the root `.env` isn't 8080 (for example 8082), add `http://localhost:8082` to `CORS_ORIGIN` in that `.env`, then `docker compose up -d`; without it, a login from `http://localhost:8082/docs` is refused with `403` too. The Bruno collection (`baseUrl` `http://127.0.0.1:8080`) and `tools/live-terminal.js` keep working unchanged. The dashboard calls the backend through Caddy at `http://localhost/api/…`.

The backend image is built from the [`Dockerfile`](Dockerfile) (two `node:24.22.1-alpine3.24` stages, `npm ci --omit=dev`, the user `node`, `CMD ["node", "src/server.ts"]`; since Module 29 the `packages` stage runs on the processor of the building machine through `FROM --platform=$BUILDPLATFORM` and the final stage has no `RUN`, so one machine builds the amd64 and arm64 molds without emulation); the [`.dockerignore`](.dockerignore) keeps out `.env`, `node_modules`, `backup`, Bruno, the load test, the test files, and (Module 29) the `src/integration/` folder. Inside the container, the settings come from `compose.cloud.yml` (`HOST=0.0.0.0`, `MQTT_URL=mqtt://mosquitto:1883`, `DATABASE_URL=…@db:5432/…`, `TZ=Asia/Jakarta`), not from `backend/.env`.

## On the internet, behind Caddy HTTPS (Module 27)

On the VPS (or on the Pi on the free path), visitors from the internet never connect to the backend directly: every request goes into Caddy (the `web` service), and Caddy forwards `/api/…` to `backend:8080` over plain HTTP in the Docker hallway. The backend only sees **Caddy** as its visitor. Caddy passes on what it knows about the real visitor in the headers `X-Forwarded-For` (the visitor's IP address) and `X-Forwarded-Proto` (`https`), but anyone can write such headers, so the backend only trusts them from the proxies named in **`TRUST_PROXY`**:

| `TRUST_PROXY` | Meaning | Used in |
| :--- | :--- | :--- |
| empty (the backend default) | trusts no proxy at all: the visitor's address = the connection's address, the protocol = `http` | dev mode (`npm run dev`, without Caddy) |
| `uniquelocal` | trusts a proxy at a private address (`10.x`, `172.16–31.x`, `192.168.x`, `fc00::/7`), including the Docker hallway where Caddy is | **`compose.cloud.yml`** (its default, on the laptop, the VPS, and the Pi) |
| `true` | trusts anyone, including a visitor who fakes the headers | avoid it |
| address/CIDR, comma-separated | for example `172.18.0.0/16`; `loopback` and `linklocal` are allowed too | if you want something narrower than `uniquelocal` |

A number (a hop count, the old recipe `trustProxy: 1`) is **refused** when the server starts: Fastify 5 deliberately doesn't trust proxies that are only counted, so that setting would silently do nothing. A wrong value stops the server with its reason, for example `Setting TRUST_PROXY in .env: a number (a hop count) isn't used by Fastify 5 (it trusts nothing at all); behind Caddy write uniquelocal`. The setting that was read is written once in the log at startup: `trusted proxies (TRUST_PROXY): uniquelocal`.

What this means behind Caddy HTTPS:

- The `access` and `session` cookies get the **`Secure`** attribute (the browser only sends them over HTTPS). `secure: "auto"` in `src/auth/security.ts` has been there since Module 20; the only thing missing was the `https` information from Caddy. On `http://localhost` (the laptop) the cookies stay without `Secure`, so logging in on the laptop still works.
- The login limiter counts **per visitor**: 10 wrong logins from one phone don't make other visitors get `429`. The log line `login failed: … (IP …)` also writes the visitor's address, not Caddy's.
- **`CORS_ORIGIN`** in the root `.env` = the dashboard address the visitor types, exactly, for example `CORS_ORIGIN=https://iot.yourname.my.id` (several allowed, comma-separated). Without it, a login from the dashboard is refused by the guard with `403` (`request from the page https://iot.yourname.my.id refused`). A slash at the end (`https://iot.yourname.my.id/`), a path, or an address without `http(s)://` is refused when the server starts, because a browser never sends an `Origin` of that form.

Tested in `src/config/env.test.ts` (every form of `TRUST_PROXY` and `CORS_ORIGIN`) and `src/routes/proxy.test.ts` (the real login route with a fake "Caddy": `Secure` cookies, `429` per visitor, fake headers from a direct visitor not trusted, and the old behavior without `trustProxy` for comparison). The steps for moving the center to a VPS are in [Module 27](../../../module-27-deploy-internet-tls-pwa/README.md).

## Dev mode (without the backend container)

To change the backend code, run the backend directly with Node on the laptop, using the database and the central broker from Compose. Start from the project root: `docker compose up -d`, then `docker compose stop backend web` (the backend and dashboard containers are stopped; the database, the broker, and Grafana keep running). Done developing: **Ctrl + C** in the `npm run dev` terminal, then `docker compose start backend web`.

1. Install Node.js 24 LTS and Docker Desktop.
2. The database = the `db` service in `compose.cloud.yml`, on the old counter `127.0.0.1:5432` (previous section). Before Module 26, the database was started on its own, just once: `docker run -d --name smarthome-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=change-this-password -e POSTGRES_DB=smarthome -e TIMESCALEDB_TELEMETRY=off -v smarthome-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17` (password: only letters, digits, and hyphens). Don't run that container together with Compose: its cupboard has the same name.
3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env`, then fill in the database password in `DATABASE_URL` (= `POSTGRES_PASSWORD` in the root `.env`). `MQTT_URL` already points at the central broker on this laptop (`mqtt://127.0.0.1:1883`); before Module 26 it held the Pi's IP address. Fill in `MQTT_PASSWORD` with the password of the broker account `backend` (= `MQTT_PASSWORD` in the root `.env`; the `broker-account` service makes the account). If your broker isn't locked yet, `MQTT_USERNAME` and `MQTT_PASSWORD` may be left empty (the backend connects without an account, with a warning).
5. Make the JWT signing key with this command, then paste the result (43 random characters) into `JWT_SECRET` in `.env`. This step is required **before** the next ones: the server, `npm run migrate`, and `npm run users` refuse to run when `JWT_SECRET` is empty, shorter than 32 characters, or still holds the example.

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

6. Create the tables with `npm run migrate` (in Compose, the `migrate` service has already done it; repeating it is safe).
7. The summary clerk only summarizes the last 3 days again. Older history that arrives all at once (readings that were there before migration `003`, the practice data from `npm run seed-history`, or the load test below) only gets into the hourly summary book when it is summarized **once** with this command (from the project root), after the data is in:

   ```text
   docker compose exec db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', NULL, now() - INTERVAL '1 hour');"
   ```

   Don't repeat this command after retention (migration `004`) has dropped old data: a `NULL` window also deletes the old summaries whose raw readings have already been dropped.
8. Create the first accounts: one `admin` and (preferably) one `viewer`. The password is asked for twice and only shows up as `*`; run it in the VS Code terminal (PowerShell) or the macOS Terminal, not in a Git Bash window.

   ```text
   npm run users -- add admin@home.test "Home Admin" admin
   npm run users -- add viewer@home.test "Home Guest" viewer
   ```

9. (Optional) For Telegram alerts, fill in `TELEGRAM_BOT_TOKEN` (the token from @BotFather) and `TELEGRAM_CHAT_ID` (the number the bot answers when you send `/start`) in `.env`. Empty = Telegram notifications off. That token is a secret, like a password. Since Module 25, the same bot also sends the daily CSV report every morning; its time is set by `REPORT_SCHEDULE` in `.env` (a 5-field cron in WIB, default `0 7 * * *` = 07:00 WIB). Leave the line `# TELEGRAM_API_ROOT=` in `.env.example` commented out: it is only used for a mock Bot API server in the lab.
10. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`. To try the routes with a padlock there, log in first with **Try it out** on `POST /auth/login`; the browser keeps the cookie and sends it by itself to the other routes (the **Authorize** button isn't used).

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code or `.env` is saved |
| `npm start` | runs the server without automatic restarts (since 1.3 also without a `.env` file, for example in a container); **Ctrl + C** stops it gracefully (on Windows, `npm run dev` + **Ctrl + C** kills the server at once) |
| `npm run check` | checks the TypeScript types, test files included (run it before every commit) |
| `npm run lint` | Module 29: checks the code with oxlint ([`.oxlintrc.json`](.oxlintrc.json)) for common mistakes that slip past the type checker; the expected output is `Found 0 warnings and 0 errors.`. Even one warning makes it fail (`--deny-warnings`), so the robot is red too |
| `npm test` | runs the unit tests with Vitest: the rules engine and the rule schema (`src/rules/*.test.ts`; since Module 24 also below-threshold rules), login (`src/auth/auth.test.ts`), device keys (`src/auth/key.test.ts`, Module 21), the guest book and second layer (`src/services/registry.test.ts`), the registration routes (`src/routes/devices.test.ts`), the delete-rule route with its guard: guest 401, viewer 403, the `DELETE` preflight (`src/routes/rules.test.ts`, Module 24), and a running watering rule: the pump sent once, turning off without a command, a refused command marked `ok: false`, a deleted or deactivated rule no longer acting (`src/services/automation.test.ts`, Module 24), then (Module 25) the map point: the location schema and the `PUT /devices/:id/location` route with its guard (`src/routes/location.test.ts`), the CSV maker (`src/services/csv.test.ts`), the daily report: yesterday's WIB range, the CSV content, Telegram off or refusing, a late WIB schedule still reporting the right day, a missed schedule only reported (`src/services/reports.test.ts`), the `POST /reports/send` route (`src/routes/reports.test.ts`), a report file sent with its name and the 📴/✅ messages after 60 seconds (`src/services/telegram.test.ts`), a retained `online` status after a broker restart (`src/services/mqtt.test.ts`), the `REPORT_SCHEDULE` setting (`src/config/env.test.ts`), and (Module 26) the log filter: successful `/health` knocks aren't logged (`src/services/log.test.ts`). Module 29: when `DATABASE_URL_TEST` is filled in, the 20 integration tests (`src/integration/`) run too; without it they're skipped (`Tests  203 passed \| 20 skipped (223)`) |
| `npm run test:integration` | Module 29: only the 20 integration tests with a test database; needs `DATABASE_URL_TEST` (see [Tested with a test database](#tested-with-a-test-database-module-29)) |
| `npm run migrate` | runs the new SQL files in the `migrations/` folder (safe to repeat) |
| `npm run seed-history` | fills in 7 days of practice data for the practice devices `f00d00000001` and `f00d00000002` |
| `npm run users -- add <email> "<name>" <admin\|viewer>` | creates an account; the password is asked for and only shows up as `*` (at least 15 characters, at most 72 bytes) |
| `npm run users -- password <email>` | changes the password; all sessions of that account are revoked (it must log in again) |
| `npm run users -- role <email> <admin\|viewer>` | changes the role (takes effect within 15 minutes, when its wristband is renewed) |
| `npm run users -- delete <email>` | deletes the account together with all its sessions |
| `npm run users -- list` | shows every account (without the password fingerprints) |

For a load test, `backend/test/load-1-million.sql` loads 1,036,801 fake readings (one every 10 seconds for 120 days) for the test device `beef00000001`. Run it from the project root (the database = the Compose `db` service):

```text
docker compose cp backend/test/load-1-million.sql db:/tmp/load-1-million.sql
docker compose exec db psql -U postgres -d smarthome -f /tmp/load-1-million.sql
```

## Login and protection

- **Accounts** are only made from the terminal (`npm run users`); there is no sign-up route in the API. The database stores the password fingerprint (bcrypt, cost 12), not the password.
- **`POST /auth/login`** answers with two `HttpOnly; SameSite=Strict` cookies: `access` (a 15-minute JWT, `Path=/`) and `session` (a 7-day refresh token, `Path=/auth`; the database only stores its SHA-256). A wrong email and a wrong password get the same answer: `401 {"message":"wrong email or password"}`. Through Caddy (home mode, Module 26) the addresses start with `/api`, so Caddy rewrites the path of the `session` cookie to `Path=/api/auth` (`frontend/caddy/Caddyfile`); the backend itself doesn't change.
- **Wristband ran out?** `POST /auth/refresh` swaps the `session` cookie for a new wristband and a new season pass (rotation). An old season pass that is used again 30 seconds or more after it was replaced counts as stolen: its session is revoked. **`POST /auth/logout`** deletes the session, empties both cookies, and cuts that session's Socket.IO connections.
- **Open routes** (no login): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET`/`HEAD /health`, and `/docs`. Since Module 28 also two routes for **devices** that do their own, stricter checks: the firmware download `GET`/`HEAD /fw/:folder/:file` (device key + MAC) and `POST /provision/claim` (a claim code, 10 attempts per minute per IP address). Every other route, including new routes and URLs that don't exist, answers guests with `401`.
- **Roles**: `admin` may do everything; `viewer` only `GET`/`HEAD` (anything else gets `403`).
- **Rate limit**: at most 10 `POST /auth/login` attempts per minute from the same IP address; the 11th attempt gets `429` with a `retry-after` header. The counts live in memory: a server restart = starting from zero. Behind Caddy, "the same IP address" only means "the same visitor" when `TRUST_PROXY` is filled in (Module 27; `compose.cloud.yml` fills it with `uniquelocal`).
- **CORS and the page's origin**: web pages in `CORS_ORIGIN` (`.env`, default `http://localhost:5173,http://127.0.0.1:5173` for Module 22; home mode: `http://localhost,http://127.0.0.1` from the root `.env`; on the internet, Module 27: `https://iot.yourname.my.id`) may call the API from a browser with cookies. Requests other than `GET`/`HEAD` that carry an `Origin` header from another page are refused with `403`; curl, Bruno, and Node don't send `Origin`, so they aren't affected.
- **Bruno**: the `bruno/` collection has the requests `login admin`, `login viewer`, `wrong login`, `who am i`, `refresh`, and `logout`, plus (Module 21) `register Node 1`, `register Node 2 via Node 1`, `register practice device`, `rotate practice device key`, and `revoke practice device key`, and (Module 24) `create soil watering rule` and `delete rule` (replace the number in the `delete rule` address with the `id` from the `create soil watering rule` answer; it defaults to `4`, the first rule number after the three Module 19 rules), plus (Module 25) `register mock Garden` (fake Node 2 `f00d000000b2` via `f00d00000001`, for the path without a Node 2; see `tools/README.md`), `set device location`, and `send report now` (`?day=today`). Their passwords are read from `bruno/.env` (not in Git) holding `ADMIN_PASSWORD=…` and `VIEWER_PASSWORD=…`. Send `login admin` or `login viewer` first; the other requests use its cookie automatically.

## API

| Route | Who | What it does |
| :--- | :--- | :--- |
| `POST /auth/login` | open | logs in with `{ "email": …, "password": … }`; the answer is `{ id, email, name, role }` + the `access` and `session` cookies |
| `POST /auth/refresh` | open (`session` cookie) | a new wristband + a new season pass |
| `POST /auth/logout` | open | deletes the session and both cookies; always `{"message":"logged out"}` |
| `GET /auth/me` | login | the account that is logged in (read from the database) |
| `GET /health` | open | is the server alive? which version (`version`, Module 29, from `package.json`)? connected to the broker and the database? how many messages were `received`, `rejected` (failed the contract), and `ignored` (from unregistered/revoked devices, Module 21)? |
| `GET /devices` | login | the devices from the database: the registered ones, the revoked ones, and old rows that aren't registered; the `key` column marks `active`/`revoked`/`no-key`/`unregistered` (the key fingerprint is never included); since Module 25 also the map point `lat`/`lng` (`null` = not set yet) |
| `POST /devices` | admin | register a device (Module 21): the answer carries the 43-character `key` **shown only this once** and the next `steps`; `linked_via` for an ESP-NOW device (Node 2) whose data Node 1 publishes (no key) |
| `POST /devices/:id/key` | admin | make a new key (the old key stops working at once); also brings a revoked device back to life |
| `POST /devices/:id/revoke` | admin | revoke the key of a lost or stolen device: the backend ignores its data at once, commands to it are answered 409. Since Module 28 = **Deactivate** on `/fleet`: its broker account is deleted too (the device is disconnected at once), its status is written `offline`, and its retained `config` is deleted |
| `PUT /devices/:id/location` | admin | sets the device's point on the map (Module 25): `{ "lat": -6.1754, "lng": 106.8272 }` with a decimal **point**; `{ "lat": null, "lng": null }` removes the point. The answer is one device row as in `GET /devices`; the `location` text doesn't change |
| `GET /devices/:id/latest` | login | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | login | the last health report of one device |
| `GET /devices/:id/readings?from=…&to=…` | login | the raw reading history from the database (default: the last hour; at most 1,000 readings) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | login | a summary of the history per 15 minutes, per hour, or per WIB day (default: the last 1 day, 7 days, or 30 days; at most 1,000 buckets) |
| `POST /devices/:id/command` | admin | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table (with `source` `api`); an unregistered device is answered 404, one whose key has been revoked 409 |
| `GET /devices/:id/state` | login | the actuator state: what the server wants (`desired`), what the device reported last (`reported`, from `telemetry.state` or `ack.state`), when that report arrived, and the actuators that don't match yet (`diff`) |
| `GET /rules` | login | every automation rule the server is using right now; schedule rules also carry `next_run` (UTC) |
| `POST /rules` | admin | creates a new rule: a rising threshold (`condition.kind` `threshold`) or, since Module 24, a falling one (`below-threshold`) with a `switch` or a `command` action (sent once), or a schedule (`schedule` + `command`); it applies right away |
| `PUT /rules/:id` | admin | replaces the whole content of one rule; it applies right away without restarting the server, and the threshold of a fan rule is sent to the device as a retained `config` |
| `DELETE /rules/:id` | admin | deletes one rule (Module 24); it stops applying right away, and the answer is `{ id, name, message }`. Its desired state is forgotten too, so a device that restarts doesn't receive that rule's command again; an actuator it turned on is left as it is. Its command and event history stays (its `rule_id` column becomes empty). To keep a rule without running it, use `PUT` with `"active": false` |
| `POST /rules/:id/run` | admin | runs the action of one schedule rule right now (to test it, without waiting for its time) |
| `POST /reports/send` | admin | sends the daily CSV report to Telegram right now (Module 25), with the same content as the scheduled report (yesterday 00:00–24:00 WIB); `?day=today` = today's partial report since 00:00 WIB. The answer is `{ file, from, to, devices, size_bytes, caption }` |
| `POST /firmware/:kind/:version` | admin | Module 28: upload a firmware file (`kind` = `node1`). The body = the file's content as it is (`Content-Type: application/octet-stream`, at most 2 MiB), `?notes=…&test=true` optional. Refused with `400` if its first byte isn't `0xE9` (for example a `.merged.bin`) or it is bigger than one program shelf (1,966,080 bytes); `409` if that version already exists (a version can't be overwritten). The server computes the SHA-256 |
| `GET /firmware` | login | Module 28: the release list (the "manifest" from the database): version, size, SHA-256, notes, `test`, `withdrawn_at`, the download address, the canary summary (`canary_succeeded`, `canary_failed`, `can_update_all`), and `latest` (the highest release that isn't a test and isn't withdrawn) |
| `POST /firmware/:kind/:version/withdraw` | admin | Module 28: withdraw a bad release: it isn't sent anymore and can't be downloaded anymore |
| `GET`/`HEAD /fw/node-1/<version>.bin` | **device** | Module 28: the firmware download. Basic Auth `device_id:key` + the `x-ESP32-STA-MAC` header of that device (exactly the HTTPUpdate request). `200` + `Content-Length` + `x-SHA256`, `304` if `x-ESP32-version` is the same, `403` a wrong key/deactivated/another MAC, `404` the version doesn't exist/is withdrawn |
| `GET /fleet` | login | Module 28: the data of the `/fleet` page: `latest_release`, `settings` (`ota_ready`, `broker_accounts`), and every registered device with `fw`, `needs_update`, `health` (RSSI, heap, uptime, `reset_reason`), the last `update`, `canary`, `vitals_interval_s`, `can_update` + `blocked_reason` |
| `POST /devices/:id/update` | admin | Module 28: update the firmware of one Node 1 (`{ "version": "1.7.1" }`, a downgrade needs `"force": true`). `202` = the device **accepted** the command (not finished); `409` if it isn't online, is already updating, already runs that version, is a Node 2, or is deactivated; `422` if the device refuses (for example the 60-second trial period) |
| `POST /fleet/update` | admin | Module 28: `{ "version", "target": "canary" \| "all" }`. `all` is only allowed after at least one canary has run that version successfully and no canary ended in `rollback`/`failed`; a test release is always refused. The answer is `sent` and `skipped` (with the reasons) |
| `GET /devices/:id/updates` | login | Module 28: the update history of one device (the last 20) |
| `PUT /devices/:id/canary` | admin | Module 28: `{ "canary": true }` marks a test device that gets new releases first |
| `PUT /devices/:id/intervals` | admin | Module 28: `{ "vitals_s": 60 }` (60–3600) Node 1's `vitals` interval, sent in the combined retained `config`; `telemetry` stays 10 seconds |
| `POST /provision/code` | admin | Module 28: create a single-use claim code `XXXX-XXXX` (`{ name, location, minutes }`, 5–60 minutes, default 30); the code is **shown only once** |
| `GET /provision/code` | login | Module 28: the recent claim codes without the code itself: `valid`, `used` (by which device), or `expired` |
| `POST /provision/claim` | **device** | Module 28: `{ "code", "device_id" }` → `201 { device_id, key, mqtt_username }`. `403` a wrong/expired/used code (one answer), `409` the device is still active, `429` the 11th attempt within a minute, `503` a broker/database problem (the code is **not** used up). Through Caddy: `POST /api/provision/claim` |

"login" = any account that is logged in (`admin` or `viewer`). Live data is available through **Socket.IO** at the same address (`/socket.io/`), also with the `access` cookie: send `follow` with a `device_id` (its answer carries the last reading) to receive that device's `telemetry` events; the `status` and `event` events go to every client. Without the cookie, the connection is refused (`connect_error` `not logged in`); when the wristband expires, the server cuts the connection and the client must refresh, then connect again. An example client: `tools/live-terminal.js` (its account is read from `tools/.env`).

Automation rules are stored in the `rules` table as JSON data checked by Zod. A threshold rule turns on when its quantity stays **above** `on_above` continuously for `for_seconds` seconds, then turns off **below** `off_below`. Schedule rules use a 5-field cron and are always counted in WIB (`Asia/Jakarta`), whatever the laptop's time zone. An example fan rule:

```json
{"name":"Automatic fan","active":true,
 "condition":{"kind":"threshold","device_id":"a4cf12e5b7c0","quantity":"temperature","on_above":30,"off_below":28,"for_seconds":120},
 "action":{"kind":"switch","device_id":"a4cf12e5b7c0","target":"fan","notify":true}}
```

Since Module 24 (v1.1), a threshold rule can also point **downwards** (`below-threshold`): it turns on when its quantity stays **below** `on_below` continuously for `for_seconds` seconds, then turns off (ready again) **above** `off_above`, which must be greater than `on_below` (hysteresis). Both threshold directions may use a `switch` action (the fan or lamp is on while the rule is on) or a `command` action, which is sent **once** when the rule turns on; nothing is sent when the rule turns off. A schedule may still only use a `command` action. An example, "water if soil < 30%":

```json
{"name":"Water if soil < 30 %","active":true,
  "condition":{"kind":"below-threshold","device_id":"a4cf12e5b7c0","quantity":"soil","on_below":30,"off_above":35,"for_seconds":10},
  "action":{"kind":"command","device_id":"a4cf12e5b7c0","command":{"target":"pump","value":5},"notify":true}}
```

When the soil stays below 30% for 10 seconds, the pump waters for 5 seconds and the event `🌱 Soil 25 % — pump watering for 5 seconds automatically` is recorded. The pump doesn't water again until the soil has risen above 35% (`✅ Soil up to 36 % — rule ready again`); a decision is only made when the rule changes state. If the device refuses the command (for example `pump refused: tank water too low`) or doesn't answer within 5 seconds, the event reads `⚠️ Soil 25 % — pump command refused by the device: pump refused: tank water too low` (or `… pump did NOT answer the command (not sent again)`), and the rule only waters again at the next dry spell or after the rule is saved again (for example deactivated, then activated again); without this pause, an empty tank would trigger the same event every few seconds.

The rule shapes are written in `src/schemas/rule-basics.ts` (without node-cron, so the dashboard can use an identical copy in the browser, Module 24); `src/schemas/rules.ts` uses all of it, then adds one check that only works on the server: the content of the cron expression (`invalid cron expression`).

With `bucket`, the answer has the shape `{ device_id, from, to, bucket, count, summary: [ { time, avg_temp, min_temp, max_temp, avg_humidity, avg_soil, avg_light, reading_count } ] }`. `time` is the start of the bucket (UTC), and `from` is rounded down to the start of a bucket. The 15-minute summary is computed directly from the raw readings, the hourly summary is read from `readings_hourly`, and the daily summary combines the hourly summaries into WIB days. Its daily averages are exactly the same as a calculation from the raw readings, because every hour stores an average and the number of values (`avg_temp` and `temp_n`, and so on).

The Bruno collection for every route is in the `bruno/` folder (choose the `local` environment). Since Module 27 there is an `internet` environment (`baseUrl` `https://iot.yourname.my.id/api`, through Caddy on the VPS; replace the domain name with yours); the `session` cookie there has the path `/api/auth`, the same as in the dashboard.

## Map and daily report (Module 25)

**Map point.** The `lat` (latitude) and `lng` (longitude) columns have been in the `devices` table since migration `001`; since v1.2 both come with `GET /devices`, so the dashboard's Map page can draw every device. The point is set by the admin with `PUT /devices/:id/location` (Bruno: `set device location`):

```json
{ "lat": -6.1754, "lng": 106.8272 }
```

The numbers are decimal degrees with a **point**, because JSON has no decimal comma. `lat` −90 to 90 (Jakarta about −6.2) and `lng` −180 to 180 (Jakarta about 106.8), both filled in as a pair; `{ "lat": null, "lng": null }` removes the point. Other fields are refused, so the `location` text ("living room") doesn't change. The possible answers:

| Code | Example `message` |
| :--- | :--- |
| `200` | one device row, the same as `GET /devices`, with its new point |
| `400` | `body/lat must be a number with a decimal point, for example -6.1754 (not the text "-6,1754")`, `body/lat latitude at most 90`, `body/lng lat and lng go in pairs: both numbers, or both null to remove the point`; `{"lat": -6,2}` without quotes isn't even JSON: `Body is not valid JSON but content-type is set to 'application/json'` |
| `403` | a `viewer` account (the Module 20 guard) |
| `404` | `f00d0000ffff isn't in the device list` |

A home's point is personal data: the backend log only records `map point of <device_id> set by account 1`, without the numbers. For examples and screenshots, use a fictional point in a public place (the example above: around Monas, Jakarta).

**Daily CSV report.** Every day at `REPORT_SCHEDULE` (default `0 7 * * *` = 07:00 WIB; a **5**-field cron, always counted in WIB whatever the laptop's time zone), the backend summarizes **yesterday 00:00–24:00 WIB** for every registered device whose key isn't revoked, then the Module 19 Telegram bot sends it to the owner's chat as the file `report-YYYY-MM-DD.csv` (date = the day reported) with the caption `📊 Mini Smart Home daily report 26 Oct 2026: 3 device(s)`. Everything is counted in one SQL query (`src/services/reports.ts`):

| Column | What it holds | Source |
| :--- | :--- | :--- |
| `device_id`, `name`, `kind` | the device (`name` empty → `device_id`) | `devices` |
| `reading_count` | the number of `telemetry` messages that day (Node 1 about 8,640, Node 2 about 288; 0 = silent all day) | `readings_hourly` |
| `avg_temp`, `min_temp`, `max_temp`, `avg_humidity`, `avg_soil`, `min_soil` | the daily summary (an exact average from the hourly averages × the number of values, like `bucket=1d`) | `readings_hourly` |
| `avg_rssi`, `worst_rssi`, `min_heap`, `restarts` | health from `vitals`; `restarts` = how many times `uptime_s` dropped. Empty for Node 2 (it doesn't send `vitals`) | `device_health` |
| `disconnects` | how many times its status became `offline`/`offline-mode` | `events` |

The format is the same as the dashboard's Module 23 CSV download (`src/services/csv.ts`): a comma separator, a decimal point, a BOM at the start of the file, CRLF at the end of every line; it's set up for Excel or LibreOffice Calc with English regional settings. The file is sent as a `Buffer` (`new InputFile(Buffer.from(content, "utf8"), name)`): `new InputFile("text…")` is taken as a file path by grammY and fails (`ENOENT`).

To test it without waiting for its time, send `POST /reports/send` (Bruno: `send report now`). Without a choice, its content is the same yesterday's report; `?day=today` sends today's partial report since 00:00 WIB (the file `report-YYYY-MM-DD-partial.csv`), useful when your system has only been on since today. If `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` is empty, this route answers `409 {"message":"report not sent: Telegram off (TELEGRAM_BOT_TOKEN is empty)"}` and the scheduled report only writes `daily report skipped: Telegram off (…)` to the log; Telegram refusing or unreachable = `502`, the database down = `503`.

An example of the backend log when the scheduled report runs (test schedule `20 21 * * *`, then set back to `0 7 * * *`):

```text
INFO: daily report scheduled: "20 21 * * *" Asia/Jakarta, next 26 Oct 2026, 21:20 WIB
INFO: daily report running on schedule
INFO: Telegram sent: file report-2026-10-25.csv (357 bytes), 📊 Mini Smart Home daily report 25 Oct 2026: 3 device(s)
```

## Firmware updates, the fleet, and claim codes (Module 28)

The full steps (the installation order, Node 1 firmware 1.7.0, the 1.7.1 practice and the 1.7.2-test rollback, the box) are in Module 28. Here is a summary of the server side.

| Setting (`.env`) | Content | Default |
| :--- | :--- | :--- |
| `SERVER_URL` | the server address for **devices**: the `url` in an `update` command = `SERVER_URL` + `/fw/node-1/<version>.bin`, and **exactly the same** address is typed in the portal's **Server address** field (also when claiming). Firmware 1.7.0 (contract 1.6) only downloads from the server address stored on it: another `url` is answered `ack ok:false` `url is not this home's server`. VPS: `https://iot.yourname.my.id`; the home network only: `http://<home IP address>` (only `10.x`, `172.16–31.x`, `192.168.x`, because the device key is sent along; any other address with `http://` is refused when the server starts), for example the free-path Pi `http://192.168.1.37` (without `:8081`: that is the door inside the container). Its form must be storable by Node 1 as it is, so the backend refuses to start if the address is longer than **64 characters**, has capital letters, ends in `/` or has a path (`/api`), has a server name with anything other than lowercase letters, digits, dots, and `-` (for example an underscore `_`), or has a port outside `1`–`65535`; the message names the reason (`Setting SERVER_URL in .env: "…" …`) | empty = over-the-air updates **off** (`/fleet` writes `ota_ready: false`) |
| `AUTO_BROKER_ACCOUNTS` | `center` (devices connect straight to the central broker), `gateway:<name>` (devices connect to the Pi gateway broker of that name, for example `gateway:pi1`; the account commands go through the bridge), or `off` | `off` = broker accounts made by hand as in Module 21 |
| `FIRMWARE_DIR` | the folder of the uploaded `.bin` files. In the container: `/app/firmware-data` = the `firmware-data` cupboard | `firmware-data` (relative to the backend folder; not in Git) |
| `OTA_TIMEOUT_MINUTES` | an update with no word for that long is marked `expired` | 10 |

**The flow of one update** (contract 1.6). `POST /devices/:id/update` publishes the `cmd` `{"action":"update","version","url","sha256","size"}` (QoS 1, **never** retained) and records one row in the `updates` table:

| Status | It means | How the backend knows |
| :--- | :--- | :--- |
| `sent` | the command was published | — |
| `accepted` | the device answered `ack ok:true` within 5 seconds: the command was **accepted**, not finished yet | `ack` |
| `downloading` | the valid device started fetching the file | the `/fw` route |
| `rejected` | `ack ok:false` (for example still in the 60-second trial period after the previous update) | `ack` |
| `succeeded` / `rollback` / `failed` | the new firmware is valid; the new firmware failed and the device went back to the old version by itself; the download/check failed and the old version keeps running | `vitals.ota` (the device repeats it in at most 3 `vitals`); if the report is lost, the backend **concludes** it from the `vitals` after the device restarts (a new `fw` = succeeded, the old `fw` = failed; the message starts with `concluded by the server:`) |
| `expired` | no word for `OTA_TIMEOUT_MINUTES` minutes | the watcher, every 30 seconds |

A device may only have **one** update running (the unique index `updates_one_running`). A device that isn't `online` at the moment (`offline-mode` too) is answered `409`: an update command is **not queued**. Every status change is recorded in the event log (`kind` `ota`) and broadcast through Socket.IO as the **`ota`** event `{ device_id, id, status, from, to, message, time }`, so the `/fleet` page changes without polling.

**Canary.** Mark one Node 1 with `PUT /devices/:id/canary`. `POST /fleet/update` with `target: "canary"` sends to every canary; `target: "all"` only opens after at least one canary `succeeded` with that version and no canary ended in `rollback`/`failed`. A **test** release (`?test=true` when uploading, for example a 1.7.2 broken on purpose) can only be sent through Update per device and never counts as "latest".

**Uploading from a terminal** (without the dashboard; the cookie from a `curl` login as in Module 20, in the file `cookies.txt`, not in Git):

```text
curl -s -b cookies.txt -H "Content-Type: application/octet-stream" --data-binary @node-1-home.ino.bin "http://127.0.0.1:8080/firmware/node1/1.7.1?notes=OTA%20practice"
```

**Checking a download the way a device does** (the device key from `POST /devices` or a claim; don't write it to a file or a shared history):

```text
curl --http1.0 -sI -u a4cf12e5b7c0:<key> -H "x-ESP32-STA-MAC: A4:CF:12:E5:B7:C0" -H "x-ESP32-version: 1.7.0" https://iot.yourname.my.id/fw/node-1/1.7.1.bin
```

The right answer: `200`, `content-type: application/octet-stream`, `content-length` = the file size, `x-sha256`, **without** `content-encoding`. Without a matching key or MAC: `403`; a version that doesn't exist: `404` (not a dashboard page: Caddy checks the `/fw/*` block in `frontend/caddy/Caddyfile` before the page fallback, wherever it sits in that file). Redirects (3xx) are never used: HTTPUpdate doesn't follow them.

**Claim codes** (a new device within one minute): the admin `POST /provision/code` → a code `XXXX-XXXX` (shown once, 5–60 minutes, default 30; the database only stores its SHA-256) → the code is typed in the new board's portal → the device `POST <SERVER_URL>/api/provision/claim` `{code, device_id}` → `201 {device_id, key, mqtt_username}`. In one transaction: the code is locked, the device is registered (a device that is **still active** can't be claimed: `409`), the code is marked used, the broker account is created. The broker account fails (the gateway doesn't answer within 3 seconds, tried once more) = `503` and **the code isn't used up**. A claim needs the `/api` prefix from Caddy: in dev mode without Caddy (`http://127.0.0.1:8080`) that address is answered `401 not logged in…`, so test claims through Compose (`http://127.0.0.1`), or register a fake device with `POST /devices`.

**Automatic broker accounts** (dynamic security). With `AUTO_BROKER_ACCOUNTS` other than `off`, registration (`POST /devices`), key rotation, claims, and Deactivate create/change/delete the device's broker account inside the same database transaction: the broker fails = the database doesn't change (`503`). A command already sent through a stuck bridge can still be carried out by the broker as soon as its connection is back, so repeat the same step after the broker answers again (`edge/README.md`, the "Honest limits" part). The commands are JSON on the control topic `$CONTROL/dynamic-security/v1` (`center`) or `msh-gateway/<name>/dynamic-security/v1` (`gateway:<name>`, moved by the bridge to the gateway broker); their permissions are two pairs of lines for the `backend` account in `edge/acl-broker`. A device's topic permissions, for writing **and** reading, stay the `%u` pattern of Module 21: before it creates any account, the backend sends `setDefaultACLAccess` (the default read permission for accounts without a role = deny; the plugin's default = allow, so without it a device account could read the `msh/#` of other devices, an M28 verification finding). Broker account steps run one at a time (a queue): at most one database transaction waits for the broker, and a step that waits for its turn longer than 5 seconds is answered `503` without being carried out. Old Module 21 device accounts (the password file) are unknown to dynamic security: Deactivate answers `broker_account: "none"` and the steps `mosquitto_passwd -D` + a broker restart. Moving to an automatic account: rotate that device's key (`POST /devices/:id/key` through Bruno; `/fleet` has no key rotation button), type its new key over Serial, delete its old line with `mosquitto_passwd -D`, then restart the broker (see `edge/README.md`).

**Stopping on purpose.** The device publishes the `status` `offline-mode` before it installs new firmware (and before a `restart` from Serial), then disconnects from MQTT cleanly (the `offline` will isn't published). Telegram writes `🔄 <device_id> stopped on purpose (firmware update or restart), back online shortly`, then `✅ … online again after stopping on purpose (N seconds)`; `📴 … hasn't come back after stopping on purpose` is only sent if the device isn't `online` within **3 minutes** (a rollback takes about 70 seconds). The daily report doesn't count it in `disconnects`.

## Tested with a test database (Module 29)

The 203 old unit tests (`npm test`) use mock tables (`vi.mock`) and a server without a network (`app.inject`): fast and without Docker, but they never run a single SQL query, so a mistake in the `src/db/` layer slips past them. An example the author proved: if `src/db/devices.ts` writes the key fingerprint with `upper($5)` (capitals), the 203 tests stay green, but `CHECK (key_hash ~ '^[0-9a-f]{64}$')` in migration `010` refuses the row and `POST /devices` is answered with `503`. **20 integration tests** in [`src/integration/`](src/integration) catch it: the same routes, through the same server assembly as production (`buildApp()` in [`src/app.ts`](src/app.ts)), with a **real** TimescaleDB database that is empty and thrown away afterwards.

1. Start the test database (one line, the same in PowerShell, the macOS Terminal, and Linux). Its data lives in `--tmpfs` (memory), so it's gone when the container stops; counter `5433` so it doesn't clash with the home database on `5432`; the password isn't a secret because this database only holds test data and can only be reached from this laptop:

   ```text
   docker run --rm -d --name smarthome-db-test -p 127.0.0.1:5433:5432 --tmpfs /var/lib/postgresql/data -e POSTGRES_PASSWORD=test-not-a-secret -e POSTGRES_DB=smarthome_test -e TIMESCALEDB_TELEMETRY=off timescale/timescaledb:2.30.2-pg17
   ```

2. Wait until it's ready (about 5 seconds): repeat this command until it answers `accepting connections`.

   ```text
   docker exec smarthome-db-test pg_isready -h 127.0.0.1 -U postgres -d smarthome_test
   ```

3. Run the tests from the `backend` folder:

   ```bash
   DATABASE_URL_TEST=postgres://postgres:test-not-a-secret@127.0.0.1:5433/smarthome_test npm run test:integration
   ```

   ```powershell
   $env:DATABASE_URL_TEST = "postgres://postgres:test-not-a-secret@127.0.0.1:5433/smarthome_test"
   npm run test:integration
   ```

   Every test file runs the migrations `001`–`011` first (the same program as the `migrate` service in Compose; when already complete: `0 new migration(s) applied`), then its tests. The result is `Test Files  6 passed (6)` and `Tests  20 passed (20)`. With `DATABASE_URL_TEST` filled in, `npm test` runs the 203 unit tests and the 20 integration tests together (`Tests  223 passed (223)`), like the robot; without it `npm test` still runs without Docker (`Tests  203 passed | 20 skipped (223)`).
4. Done: `docker stop smarthome-db-test` (the container deletes itself because of `--rm`, its data is gone with `--tmpfs`). PowerShell: also remove the setting from that window, `Remove-Item Env:DATABASE_URL_TEST`; without that, the next `npm test` in the same window looks for the test database that has already stopped (`the test database can't be reached`). In bash that setting only applies to one command.

| File in `src/integration/` | Tests | What only a real database can prove |
| :--- | :---: | :--- |
| `devices.test.ts` | 4 | register → only the SHA-256 fingerprint is stored (`CHECK key_hash`); registering again `409` without overwriting the row; `GET /devices` with neither the key nor its fingerprint (without a login: `401`), and `GET /health` names the `package.json` version + `"database":true`; revoke → the fingerprint deleted, the status `offline`, the event `revoked` in `events` |
| `readings.test.ts` | 3 | the history of the last hour in time order (`ORDER BY ts`); the 15-minute summary with TimescaleDB's `time_bucket()` only for that device; a double delivery = one row (`PRIMARY KEY` + `ON CONFLICT`) |
| `login.test.ts` | 4 | login (bcrypt; the session stored as the refresh token's SHA-256); a wrong password and an unknown email both `401`; refresh rotates the token in one `UPDATE`; logout deletes its row |
| `rules.test.ts` | 3 | the rule stored as JSONB, an invalid body `400` without a new row; replace → the `updated_at` column moves forward, an unknown number `404`; delete → its event stays with `rule_id` `NULL` (`ON DELETE SET NULL`) |
| `claims.test.ts` | 3 | a code exchanged once in one transaction, the database only stores the code's fingerprint; a used code `403`, an active device can't be taken over with a new code (`409`, the code isn't used up); an expired code `403` |
| `firmware-fleet.test.ts` | 3 | upload: the size and SHA-256 stored, the same version `409`, a device downloads with its key (`403` for another key); a test release never becomes the latest release, a withdrawn release leaves the count; `GET /fleet` reads the LATEST health and the last update (`LATERAL`) |

The rules of the integration tests (all in [`src/integration/setup.ts`](src/integration/setup.ts)):

- **Only a `…_test` database.** The database name in `DATABASE_URL_TEST` must end in `_test` (checked before connecting, then once more with `current_database()`), because the tests write and delete rows. The address of your home database is refused with `DATABASE_URL_TEST points at the database "smarthome", not a test database …`.
- **No broker, no Telegram, no real secrets.** The test settings are rewritten before the server code is imported: `MQTT_URL` a dead address, `JWT_SECRET` random and single-use, `FIRMWARE_DIR` a temporary folder, `AUTO_BROKER_ACCOUNTS=off`, Telegram empty.
- **Every test stands alone.** Every file uses `device_id`s, emails, rule names, and firmware versions of its own, cleans them up before every test, and leaves the database empty again. Vitest runs the test files at the same time; their migrations are queued with `pg_advisory_lock`. One exception: "the latest release" is computed from ALL rows of the `firmware` table, so only `firmware-fleet.test.ts` may write to that table, and its tests stop with a clear message (`the firmware table in the test database holds other releases …`) when the test database was once used to upload other firmware.
- **On the robot, no test may be skipped.** The job `test` is red when the `npm test` output reports skipped tests, a count such as `20 skipped` (for example `DATABASE_URL_TEST` mistyped in `ci.yml`, so the 20 integration tests are quietly skipped).

**Version.** [`src/config/server-version.ts`](src/config/server-version.ts) reads `version` from `package.json` when the server starts; that number shows in `GET /health` (`"version":"2.0.0"`), in the `/docs` title, and in the log line `Mini Smart Home backend 2.0.0 started`. Raising the version (for example 2.0.0 → 2.0.1): in the `backend` AND `frontend` folders, `npm version 2.0.1 --no-git-tag-version` (it changes `package.json` and two places in `package-lock.json`, without a commit or a tag), then the three `image:` lines in `compose.cloud.yml` and a new `CHANGELOG.md` entry in the project root; the robot checks that they're all the same (`scripts/check-version.mjs`).

**Lint.** `npm run lint` runs oxlint 1.89.0, the same version as the frontend (ESLint isn't used: `typescript-eslint` doesn't accept TypeScript 7 yet), with [`.oxlintrc.json`](.oxlintrc.json): oxlint's default rules (the `correctness` group: the core rules plus the `typescript` and `oxc` plugins), the same as the frontend without `react`; the default `unicorn` plugin is on purpose not used (the `plugins` list replaces the default). All those rules are warnings, so the script uses `--deny-warnings`: even one warning gives `npm run lint` exit code 1 and the robot turns red. One rule is switched off on purpose on one line, with its reason, in `src/services/version.test.ts` (a comparison of two fixed texts that is exactly what is being tested).

## Device and broker security (Module 21)

Up to Module 20, the backend created a `devices` row automatically for **any** device that sent a message, and anyone who could reach the broker could publish to any topic. Module 21 closes both.

- **Official registry + per-device key.** A device must be registered by an admin through `POST /devices`. The answer carries a **key** of 32 random *bytes* (43 `base64url` characters) **shown only this once**; the database stores only its SHA-256 fingerprint (like a refresh token in Module 20). `POST /devices/:id/key` makes a new key (the old one dies at once), `POST /devices/:id/revoke` revokes it. The registration answer also carries `steps`: install the same key on the device (type `key <value>` in the Serial Monitor, or `KEY_<DEVICE_ID>=…` in `tools/.env` for the simulator) and on the broker (`mosquitto_passwd` on the broker machine). An ESP-NOW device (Node 2) is registered with `linked_via` (Node 1's device_id) and gets **no** key: its data is published by Node 1.
- **A second layer in the backend.** Even though the broker already guards the door, the backend checks again: a message from a device that is **not registered** or has been **revoked** is ignored at once (logged `IGNORED …` at most once a minute per device, counted at `/health` as `ignored`), commands to it are answered 404/409, and the backend **no longer** creates a `devices` row automatically. So even if the broker password file and the database are briefly out of sync, a device that isn't allowed is still refused.
- **The backend's own broker account.** The backend connects to the broker with its own account (`MQTT_USERNAME`/`MQTT_PASSWORD` in `.env`, **not** inside `MQTT_URL`), not as a device or a person. If the broker rejects its account (CONNACK 5), the backend logs it once and retries every 60 seconds; as soon as its account is fixed on the broker and the broker is reloaded, the backend recovers by itself without being restarted.
- **The broker (outside the backend).** The example files `edge/mosquitto-lan.conf`, `edge/gateway-pi.conf`, and `edge/acl-broker` lock the broker with `allow_anonymous false`, `password_file`, `acl_file` (the `%u` pattern = `device_id`), and `use_username_as_clientid`; since Module 26 their container versions are `edge/center.conf` (the Compose central broker, where the backend connects as `mqtt://mosquitto:1883`) and `edge/gateway.conf` (the Pi gateway broker). See `edge/README.md`.

**🎉 Phase 3 checkpoint.** The house is now locked for people (accounts, login, roles, API protection — Module 20) *and* for devices (a per-device key, the second layer, a broker account, the ACL — Module 21). What is **not** secure yet, named honestly: MQTT and HTTP traffic is still unencrypted on the LAN (a key is readable in the clear by a sniffer on the same network) — TLS is a must before opening it to the internet (Module 27); a key in the ESP32's NVS is readable by anyone who holds the board (*flash encryption*, 🔬); and the rate-limit counts are still in memory.

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
| `010_device_keys.sql` | the key columns in `devices`: `registered_at`, `key_hash` (SHA-256, 64 hexadecimal characters), `key_created_at`, `revoked_at`, and `linked_via` (Node 2 → Node 1); four `CHECK`s that keep the key, the revocation, and the linking consistent (number 009 is skipped on purpose: it belongs to the Level 3 Challenge of Module 20) |
| `011_ota_and_fleet.sql` | Module 28: the tables `firmware` (releases: version, size ≤ 1,966,080, SHA-256, notes, `test`, uploader, `withdrawn_at`), `updates` (the history per device: from/to version, status, message, `canary`; one running per device), `claim_codes` (the code's SHA-256, expiry ≤ 60 minutes, single use); the columns `devices.fw`, `fw_seen_at`, `reset_reason`, `canary`, `vitals_interval_s` (`fw` filled in from the latest reading), `device_health.reset_reason` and `fw`; the event kinds `ota`, `provisioning`, `revoked`. It only adds things: backend 1.4.0 still runs on top of it |

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

Since Module 26 the database is the `db` service in `compose.cloud.yml`, so the commands use `docker compose exec db` and `docker compose cp db:…` (typed from the **project root**; the `backup/` folder there isn't tracked by Git). A photocopy of the whole database is made **inside the container** (with a `pg_dump` whose version is sure to match), then copied to the `backup/` folder:

```text
docker compose exec db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
mkdir backup
docker compose cp db:/tmp/smarthome.dump backup/smarthome-2026-10-28.dump
```

Replace `2026-10-28` in the file name with today's date so that later backups don't overwrite each other. On later backups, you can skip `mkdir backup` because the folder already exists. Since Module 20, this photocopy also holds the accounts and their password fingerprints: keep it as safe as `.env`. The database accounts (the roles `postgres`, `grafana_reader`) are **not** in a one-database `pg_dump`: in a truly new database, `grafana_reader` is made again by the `grafana-account` service at `docker compose up -d`. Don't back up the database cupboard by copying its contents (`tar`) while the database is running: the result can be corrupt; use `pg_dump`.

The commands in this section are exactly the same in PowerShell (Windows), the macOS Terminal, and Linux. `pg_dump` writes one *circular foreign-key constraints* warning (`detail: continuous_agg`) with two `hint` lines; that's normal. Don't create the dump file with `>` (for example `pg_dump … > file.dump`): in Windows PowerShell 5.1 the file gets corrupted, so always use `-f` and then `docker compose cp`. In Git Bash, write `//tmp/…` (two slashes) because Git Bash turns `/tmp/…` into a Windows folder. Before Module 26 (the `smarthome-db` container from `docker run`), the commands were the same with `docker exec smarthome-db` and `docker cp smarthome-db:…`.

Rebuilding it in a new database `smarthome_restored` (in the same container; TimescaleDB must be the same version, 2.30.2):

```text
docker compose cp backup/smarthome-2026-10-28.dump db:/tmp/restore.dump
docker compose exec db createdb -U postgres -T template0 smarthome_restored
docker compose exec db psql -U postgres -d smarthome_restored -c "CREATE EXTENSION timescaledb;"
docker compose exec db psql -U postgres -d smarthome_restored -c "SELECT timescaledb_pre_restore();"
docker compose exec db pg_restore -U postgres -d smarthome_restored /tmp/restore.dump
docker compose exec db psql -U postgres -d smarthome_restored -c "SELECT timescaledb_post_restore();"
```

Don't use `pg_restore -j`, and don't skip `timescaledb_pre_restore()` or `timescaledb_post_restore()`. To prove that the data is the same, first run `CALL run_job(…);` in `smarthome` with the number of the `Retention Policy` job (you can see the number with the `timescaledb_information.jobs` query in the Database section). The copy runs its retention job as soon as it is restored, so the original database must already have dropped the same binders. Then run this query in psql on `smarthome` and on `smarthome_restored`, and compare the single row:

```sql
SELECT (SELECT count(*) FROM readings) AS readings,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS fingerprint,
       (SELECT count(*) FROM readings_hourly) AS summaries,
       (SELECT count(*) FROM show_chunks('readings')) AS chunks,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS jobs;
```

Once it is proven, delete the copy with `docker compose exec db dropdb -U postgres smarthome_restored`. A restore test into a separate Compose project with its own cupboard (without touching the `smarthome-data` cupboard) is in Module 26 Practice 9. Never use `docker compose down -v`, `docker volume rm smarthome-data`, or `docker system prune --volumes` on a laptop that holds the real history.

## Version 2.0 notes

Backend 2.0.0 was made in Module 29 so that every change is tested by the robot, packed into molds for two kinds of processor, and deployed automatically to the VPS and the Pi. Its number is MAJOR because the way of deploying changed, not the API.

- **One product version number**: backend 1.5.0 and dashboard 1.4.0 become `2.0.0`, the same as the image tag in `compose.cloud.yml`, the Git tag `v2.0.0`, and the top entry of `CHANGELOG.md` in the project root. `package-lock.json` gets the same number (two places).
- **`src/app.ts` (new)**: `buildApp()` assembles the server (the log, the guard, `/docs`, every route) without starting it; its content moved as it is from `src/server.ts`, with the option `log: "errors-only"` for the tests. `src/server.ts` only starts the database, the rules, Socket.IO, MQTT, Telegram, the reports, and the update watcher, then listens at its counter, plus one log line at startup: `Mini Smart Home backend 2.0.0 started`.
- **`src/config/server-version.ts` (new)**: the version from `package.json` for `GET /health` (the `version` field; its status code still always stays `200`) and OpenAPI `info.version` (before, `1.5.0` was written by hand; the `/docs` description no longer says "Backend v1.4" either).
- **`src/integration/` (new)**: `setup.ts` + 6 files, 20 integration tests with a test database ([Tested with a test database](#tested-with-a-test-database-module-29)).
- **`package.json`**: the scripts `lint` (oxlint) and `test:integration`; the new developer tool `oxlint` 1.89.0 (an exact version, the same as the frontend lock). No new production package. **`.oxlintrc.json` (new)**.
- **`Dockerfile`**: the `packages` stage = `FROM --platform=$BUILDPLATFORM`; the folder `/app/firmware-data` is made in that stage and then copied with `COPY --chown=node:node` (the final stage has no `RUN`). The mold's content is the same, the firmware folder still belongs to `node`. **`.dockerignore`**: also holds back `src/integration` and `.oxlintrc.json`.
- No database migration, the data contract stays 1.6, Bruno doesn't change. **Going down a version**: the 1.5.0 mold still runs on the same database (its schema doesn't change); the only thing missing is `version` in `/health`.
- **Tests**: the 203 old unit tests in 25 files stay green (the only change: one oxlint comment in `src/services/version.test.ts`), plus 20 integration tests in 6 files.

## Version 1.5 notes

Backend 1.5.0 was made in Module 28 so that Node 1 can be updated over the air, new devices can register themselves, and the admin can see and look after the whole fleet.

- **Migration `011_ota_and_fleet.sql`** (the tables `firmware`, `updates`, `claim_codes`; columns for the version, the restart reason, the canary, the vitals interval; new event kinds). It only adds things, so backend 1.4.0 still runs on top of it (the way back).
- **Data contract 1.6** (`src/schemas/contract.ts`, copied exactly to the dashboard): `vitals` may carry `reset_reason` + `fw` (always together) and the `ota` report (`id`, `result` `succeeded`/`rollback`/`failed`, `version`, `message` ≤ 80 characters); the schemas `CmdUpdate` and `Intervals`. **Backend 1.4.0 refuses the `vitals` of firmware 1.7.0** (`Unrecognized keys: …`), so install backend 1.5.0 **before** firmware 1.7.0. `ack` doesn't change.
- **New routes**: `src/routes/firmware.ts` (upload, list, withdraw, the locked download `/fw`), `src/routes/fleet.ts` (`/fleet`, update one/canary/all, history, canary, interval), `src/routes/claims.ts` (claim codes). Uploads use a 2 MiB `bodyLimit` **only on that route** and a raw `application/octet-stream` body (no multipart package).
- **New services**: `src/services/ota.ts` (the sending conditions `blockedReason()`, send + wait for the ack, the `vitals.ota` reports, concluding, the expiry watcher), `src/services/broker-accounts.ts` (dynamic security: a 3-second answer limit, tried once more; the timer is set **after** publishing, the unhandled rejection lesson from the lab's draft code), `src/services/version.ts` (`compareVersions()`, without the `semver` package), `src/auth/claim-code.ts`, `src/db/fleet.ts`, `src/db/claims.ts`, `withTransaction()` in `src/db/pool.ts`.
- **Changed**: `mqtt.ts` (`sendUpdate` not retained, the combined thresholds + intervals `config`, `clearConfig`, the broker account control topic, `fw` from `telemetry` and `vitals`, the "stopped on purpose" sentence for `offline-mode`), `automation.ts` (the combined `config` per device, only for registered devices), `archive.ts` (`device_health.reset_reason`/`fw`; **status messages no longer move `last_seen` forward**), `routes/devices.ts` + `db/devices.ts` (the broker account inside the transaction; revoke = Deactivate: status `offline`, `config` deleted, a `revoked` event), `telegram.ts` (`offline-mode`), `realtime.ts` (the `ota` event), `security.ts` (`OPEN_ROUTES` + `/fw` and claims), `env.ts`, `server.ts` (two log lines at startup: the firmware download address and where the broker accounts live).
- **Tests**: 8 new test files (`version`, `claim-code`, `contract`, `broker-accounts`, `ota`, the `firmware`, `fleet`, and `claims` routes) and 6 older files extended; `src/services/mqtt.test.ts` now mocks its new neighbors (without that, the test file fails to load because of `env.ts`).
- **Bruno**: 11 new requests (fleet, releases, update, history, canary, update canary/all, withdraw, create code, claim a simulated device, interval). Uploading a binary file: the `curl` above.
- `Dockerfile`: the folder `/app/firmware-data` owned by the user `node` (a `firmware-data` cupboard that is still empty inherits its owner). `.dockerignore` and `.gitignore`: `firmware-data`. No new npm package (`package-lock.json` only changes its version number). Version `1.5.0` in `package.json`, `/docs`, and the image tag.
- **Downgrading**: the 1.4.0 image still runs on top of the 011 schema (the new columns are ignored), but it refuses the `vitals` of firmware 1.7.0 and has no fleet routes.
- **Fixes after the code verification** (still 1.5.0, not yet published): the default read permission of dynamic security device accounts = deny (`setDefaultACLAccess` before `createClient`); broker account steps one at a time (a queue, so the database pool doesn't run out while the broker is silent); an upload with a wrong version/kind is answered `400` (not `500`); the temporary upload file has a unique name (two uploads of the same version at once no longer damage the cupboard's content); release versions without leading zeros (also the CHECK of migration 011); a `vitals.ota` report with a foreign id = a warning + an `ota` event; the canary `409` sentence without API terms. Before the freeze: `SERVER_URL` is checked with the limits firmware 1.7.0 can store (at most 64 characters, lowercase, a server name without `_`, port 1–65535, no `/` at the end; the same rules as Node 1's portal and the simulator). 203 tests in 25 files.

## Version 1.4 notes

Backend 1.4.0 was made in Module 27 so that the backend can be opened safely from the internet behind Caddy HTTPS.

- **`TRUST_PROXY`** (`src/config/env.ts`, Zod schema): empty/`false` = off, `true`, `uniquelocal`/`loopback`/`linklocal`, or addresses/CIDRs, comma-separated (capitals and spaces tidied); a number is refused with its reason. The result is used by `Fastify({ trustProxy })` in `src/server.ts`, plus one log line `trusted proxies (TRUST_PROXY): …` at startup. `compose.cloud.yml` fills it with `uniquelocal` (section [On the internet, behind Caddy HTTPS](#on-the-internet-behind-caddy-https-module-27)). The cookie and login-limiter code doesn't change; the comments in `src/auth/security.ts` are updated.
- **`CORS_ORIGIN` has its form checked**: every address must be `http(s)://name[:port]` without a `/` at the end and without a path; anything else stops the server with the message `Setting CORS_ORIGIN in .env: "…" is not a page address: …`. Values that were already right (Modules 20–26) are still accepted.
- **A stale manual command isn't sent again** (`src/services/commands.ts`). Since Module 19, a lamp, fan, or curtain command the device doesn't answer within 5 seconds stays "desired" by the server and is sent again when the device is heard again (reconciliation). While the home internet is down, the dashboard on the VPS reports that command as failed, and then the late arrivals that come in afterwards make the command go out again, maybe hours later. Since v1.4, a command from the dashboard/API or Telegram that the device has **never** carried out is only sent again if the device is heard within **2 minutes** of the last attempt; after that it is forgotten with the log line `command lamp = true (api) to … not carried out for more than 2 minutes: not sent again`. The wishes of automation rules and schedules, and a state that was carried out once and then lost because the device restarted, are still reconciled as in Module 19. Tested in `src/services/commands.test.ts`.
- **A persistent MQTT session** (`src/services/mqtt.ts`, `clean: false` when the backend logs in with an account, with client name = account name, for example `backend`): the central broker remembers the backend's subscription and holds QoS 1 messages while the backend isn't connected, then sends them as soon as the backend is back. Without this, the Pi bridge's queue that arrives just after the central broker restarts (`docker compose restart mosquitto`, a VPS reboot), before the backend does, is lost without a trace; so are the readings that arrive while the backend container is being recreated. The broker log writes `c0` (a persistent session) in the line `New client connected … as backend (p4, c0, …)`. A backend without an account (the old mode, a random client name) keeps a clean session. This session is only safe when no other client can use the name `backend`: the central broker writes `use_username_as_clientid true` on **every** door, including the TLS door 8883 on the VPS (`edge/center-internet.conf`).
- **New tests**: `src/routes/proxy.test.ts` (7 tests), `src/services/commands.test.ts` (4 tests), 6 more tests in `src/config/env.test.ts`, and 2 more in `src/services/mqtt.test.ts` (the client name and session). 118 tests in 17 files in all.
- **Bruno**: a new environment `bruno/environments/internet.yml` (`baseUrl` `https://iot.yourname.my.id/api`).
- **No database migration and no new npm package** (`package-lock.json` only changes its version number). The data contract moves up to **1.5** (the broker address on the internet and the bridge's store-and-forward rule) without any change to the message shapes, so the schemas in `src/schemas/contract.ts` don't change; the firmware doesn't change.
- **Downgrading**: backend 1.3 still runs with the same database and `.env` (the `TRUST_PROXY` setting is ignored); it just goes back to cookies without `Secure` and a shared login limiter behind Caddy.
- The contents of `Dockerfile` and `.dockerignore` don't change (only the version comment at the top of the `Dockerfile`). Version `1.4.0` in `package.json`, in `/docs`, and in the image tag (`…/mini-smart-home-backend:1.4.0`).

## Version 1.3 notes

Backend 1.3.0 was made in Module 26 so that the backend can be packed into an image (mold) and run by Docker Compose together with the other services.

- **`pino-pretty` moved from `devDependencies` to `dependencies`** (`package.json` + `package-lock.json`: the version stays 13.2.0, only the `"dev": true` flags of it and its dependencies are gone). The logger of `src/server.ts` uses it while the server runs, so an image that only installs the production packages (`npm ci --omit=dev`) fails with version 1.2: `Error: unable to determine transport target for "pino-pretty"`.
- **The `start`, `migrate`, `seed-history`, and `users` scripts use `--env-file-if-exists=.env`** (Node 24): without a `.env` file (in a container the settings come from Compose) the script still runs with the message `.env not found. Continuing without it.`, instead of stopping with `node: .env: not found`. `dev` keeps `--env-file=.env`: dev mode must have a `.env`.
- **Successful `/health` knocks aren't logged** (`shouldLog()` in `src/services/log.ts`, tested in `src/services/log.test.ts`): the Docker healthcheck knocks `HEAD /health` every 15 seconds. A failed `/health` (code 400 and up) and every other address are still logged.
- **A new `Dockerfile` and `.dockerignore`** (section [How to run it with Docker Compose](#how-to-run-it-with-docker-compose-module-26)). The healthcheck is written in `compose.cloud.yml`, not in the `Dockerfile`, so that it lives in one place.
- **`.env.example`** is now for dev mode: `MQTT_URL=mqtt://127.0.0.1:1883` (the central broker on the laptop, the Compose `mosquitto` service; before, the Pi's IP address), comments about the root `.env` and the one-backend rule.
- The `OPEN_ROUTES` comment in `src/auth/security.ts` is updated (the Docker healthcheck uses `HEAD /health`); the guard's code doesn't change.
- **No database migration and no new npm package.** The data contract stays **1.4**; the firmware doesn't change.
- **Downgrading**: backend 1.2 still runs in dev mode with the same database; as a container (`--omit=dev`) 1.2 fails because of `pino-pretty`.
- Version `1.3.0` in `package.json`, in `/docs`, and in the image tag (`…/mini-smart-home-backend:1.3.0`).

## Version 1.2 notes

Backend 1.2.0 was made in Module 25 so that dashboard 1.1 can draw the device map and so that the daily report arrives by itself through Telegram.

- **`lat` and `lng` in `GET /devices`** (`DeviceRow` and `COLUMNS` in `src/db/devices.ts`, the `Device` schema and `present()` in `src/routes/devices.ts`). The other answer shapes don't change; an old client simply ignores these two new fields.
- **`PUT /devices/:id/location`** (admin): the `LocationBody` schema (Zod: `lat` −90..90, `lng` −180..180, finite numbers, in pairs; `null` + `null` removes the point; other fields refused) and `setDeviceLocation()` in `src/db/devices.ts`. `PUT` has been in the CORS `methods` since Module 19, so the dashboard can call it from a browser without a change to `src/auth/security.ts`.
- **Daily report**: `src/services/csv.ts` (Module 23's CSV recipe on the server), `src/services/reports.ts` (yesterday's WIB range, the summary query, `makeReportCsv()`, the node-cron schedule `timezone: "Asia/Jakarta"` with `noOverlap` and a missed-schedule recorder like `src/services/schedule.ts`), `sendFile()` and `telegramOffReason()` in `src/services/telegram.ts` (the same bot, `sendDocument`), `REPORT_SCHEDULE` in `src/config/env.ts` (a 5-field cron; 6 fields are refused because they mean something else), and the `POST /reports/send` route (`src/routes/reports.ts`). The report schedule stops neatly too through `stopSchedules()` (`cron.shutdown()`).
- **`.env.example`**: `REPORT_SCHEDULE=0 7 * * *` and the commented-out line `# TELEGRAM_API_ROOT=` (a setting that has existed since Module 19 but was never written down).
- **No database migration and no new npm package**: `lat`/`lng` have existed since migration `001`, node-cron 4.6.0 and grammY 1.46.0 have been used since Module 19. The data contract stays **1.4**; the firmware doesn't change.
- **Downgrading**: a 1.1 backend that receives the same database keeps running (the map points are stored in columns that already existed); only the report and its new routes are gone.
- **Fix: a false 📴 after a broker restart** (`src/services/mqtt.ts`). When the broker stops, every device's `offline` will is published and the backend starts waiting 60 seconds before sending 📴. If the device connects again BEFORE the backend, its `online` message arrives as a retained message, and v1.1 ignored retained messages for Telegram: a false 📴 was sent a minute later, and the next 📴 for that device never came until the backend restarted. Since v1.2, a retained `online` also cancels a 📴 that is waiting (two lines, tested by `src/services/mqtt.test.ts`).
- **The report schedule uses its scheduled time**: a schedule that only runs a few minutes later (for example `REPORT_SCHEDULE=50 23 * * *` and a laptop that only wakes up at 00:01) still reports the day before that scheduled time, not the day that has just ended.
- Version `1.2.0` in `package.json` and in `/docs`.

## Version 1.1 notes

Backend 1.1.0 was made in Module 24 so that dashboard v1.0 can create the rule "water if soil < 30%" and delete rules.

- **The `below-threshold` condition** (`on_below`, `off_above`, `for_seconds`), evaluated by the same brain as the `threshold` condition (`evaluateBelowThreshold` in `src/rules/engine.ts`).
- **A `command` action for threshold conditions** (rising or falling): sent once when the rule turns on. The only refused pair left is schedule + switch, with the new `400` message `a schedule condition goes with a command action; a switch action only goes with a threshold or below-threshold condition` (v1.0: `a threshold condition goes with a switch action; a schedule condition with a command action`, and threshold + command was still refused).
- **`DELETE /rules/:id`** (admin), and `DELETE` added to the CORS `methods` in `src/auth/security.ts` so that the browser passes the preflight. The `rule-changed` event of a deleted rule is written with an empty `rule_id` (its number is in `data.id`), because its row no longer exists. Commands and events of a rule deleted while its command is still waiting for an ack are recorded too, with an empty `rule_id`.
- **A deleted or deactivated rule doesn't act anymore**, also not through reconciliation: its desired state is forgotten (`forgetRuleWishes()` in `src/services/commands.ts`). In v1.0, a lamp turned on by a rule that was later deactivated was turned on again when its device restarted.
- **`data.ok` in `rule` and `schedule` events**: `true` if the device answered ok, `false` if the command was refused, not answered, not sent, or the schedule was missed, `null` if no command was sent (the rule is ready again). Dashboard v1.0 uses it for the color of the notice, without guessing from the sentence.
- **The Telegram reminder** of a `command` rule reads `… — rule "Water if soil < 30 %" not ready again yet (waiting for soil above 35) (reminder)`, not "still on": the pump turned off long ago.
- **The schema is split in two**: `src/schemas/rule-basics.ts` (every rule shape, needs only `zod` and `contract.ts`, copied identically to `frontend/src/schemas/`) and `src/schemas/rules.ts` (adds the cron check with node-cron, only on the server). The other backend files still import from `rules.ts`.
- **No database migration**: conditions and actions are stored as JSON (`jsonb`), and `commands.rule_id` and `events.rule_id` have been `ON DELETE SET NULL` since migration `007`. The data contract stays **1.4**; the firmware doesn't change.
- **Downgrading**: a v1.0 backend that reads a rule of the new shape doesn't crash; that rule is skipped with the warning `rule N skipped: …` (see `loadRules()`), and the other rules keep running. A skipped rule is NOT shown by `GET /rules` in v1.0 either (the dashboard seems to lose it); its data stays whole in the database and shows again once you move up to 1.1. Don't save that rule number through a v1.0 `PUT`: its content would be overwritten with a v1.0 shape.
- Version `1.1.0` in `package.json` and in `/docs`.

<a id="limits-of-v15"></a>

## Limits of v2.0

- `GET /devices/:id/latest`, `vitals`, and `state` are still read from memory, so they are empty again after every server restart. The desired state (`desired`) and the "for" count of every rule are also lost when the server restarts; the reading history, the commands, the rules, the events, the accounts, and the sessions are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- Raw readings are only kept for 90 days; for older times, only their hourly summaries remain.
- The days of the `1d` summary are WIB days (`Asia/Jakarta`), also for devices in WITA or WIT. Rule schedules are counted in WIB too.
- Rules and schedules only run while the backend is running. A schedule that is more than 15 minutes late (for example a laptop asleep at 06:00) isn't run afterwards, only recorded; if the backend is off at that time, nothing is recorded. When the broker can't be reached, Node 1 runs its own fan safety with the threshold from `config`.
- **The daily report is also only sent while the backend is on** (Module 25). A laptop that sleeps more than 15 minutes past `REPORT_SCHEDULE` doesn't send it afterwards: the log and Telegram only record `⏰ The daily report of … was missed`; send it by hand with `POST /reports/send`. If the backend is off at that time, nothing is recorded at all. Since Module 26, a backend in a container that stops by itself is started again by Docker, but only while Docker (Docker Desktop on the laptop) is running: a sleeping laptop still misses the schedule. Since Module 27, the backend can live on a VPS (or a Pi) that is always on. The report is only sent to one chat (`TELEGRAM_CHAT_ID`), and the first day's report (no data yesterday yet) is really empty: use `?day=today`. A broker restart counts as one disconnect (`disconnects`) for every Node 1 connected at that moment: its `offline` will really is published.
- **`devices.last_seen`** is only moved forward by `telemetry` and `vitals` since v1.5, no longer by `status` messages (the broker's `offline` will, Node 2's status published by Node 1, retained statuses the broker sends again when the backend starts). For "when did the device last send a READING" (for example the "silent node" alert in Grafana, Module 25), still use `readings.received_at` of its latest reading.
- Changes made to the rules directly in the database (for example through DBeaver) are only read when the server restarts or when another rule is changed through the API; use the `/rules` API.
- **Automation rules are loaded once, when the server starts.** If the database can't be reached at that moment, the log writes `automation rules couldn't be loaded yet: …` and doesn't try again (the device registry is retried every 10 seconds): the rules don't act and the **Rules** screen is empty, while the backend stays `(healthy)`. In Compose, `docker compose up` waits for the database to be ready first, but after the laptop restarts or Docker Desktop opens, Docker starts every container at once without that order. Seeing that? `docker compose restart backend`.
- A rule with a `command` action (for example the pump, once) only acts when the rule changes state. Because its count is lost when the server restarts or the rule is changed, its command is sent once more if its condition still holds after that.
- Deactivating or deleting a fan rule does **not** withdraw the retained `temp_fan_on` `config` already sent: Node 1 keeps using that last number as its local safety rule while the broker can't be reached.
- Deleting or deactivating a `switch` rule that is on does **not** turn its actuator off: the fan or lamp is left in its last state (the server sends no command at all). Turn it off with the dashboard button or `POST /devices/:id/command`.
- The backend only sends `temp_fan_on`, never `soil_watering`. Node 1 v1.6.0 still waters by itself (3 seconds, then a 30-second pause) when the soil is below its local threshold, 30% by default, even while the backend is running. To let the server's watering rule act first, lower the local threshold below the server rule's threshold in the Serial Monitor (`threshold 20`); local watering then only acts if the soil keeps drying to below 20%, for example when the backend is off or the Wi-Fi drops. The firmware's tank safety check (`pump refused: tank water too low` below 20%) still protects both.
- A wristband (access JWT) that was handed out stays valid until it expires (15 minutes at most), also after a logout, a role change, a password change, or a deleted account; a Socket.IO connection that is running is only cut when its wristband runs out too (except a logout of that very session, or an old season pass used again 30 seconds or more after it was replaced, which cut it right away).
- The rate-limit counts are kept in the memory of one server: a restart = zero, and they don't fit several servers at once.
- The cookies are only `Secure` behind HTTPS with `TRUST_PROXY` filled in (Module 27); on `http://localhost` and in phone mode (`http://<laptop IP>`) they stay without `Secure`. Dev mode: the server only accepts guests from this laptop (`HOST=127.0.0.1`). Home mode: inside the container `HOST=0.0.0.0` (so that Caddy and the healthcheck can get in), but the counter on the laptop (and on the VPS) stays `127.0.0.1:8080`, and the dashboard through Caddy is only on `127.0.0.1` unless `WEB_ADDRESS` is changed (phone mode, or `0.0.0.0` on the VPS).
- **`TRUST_PROXY=uniquelocal` trusts ALL private addresses**, not only Caddy. On the VPS, a program running on that VPS itself that knocks on the counter `127.0.0.1:8080` through Docker also comes from a private hallway address, so it could write a fake `X-Forwarded-For` (for example to get past the login limiter). Only someone with access to the VPS can do that. Visitors from the internet always come through Caddy, which overwrites their fake headers.
- **When the home internet is down, the backend on the VPS doesn't know.** The devices still show `online` (the retained status from the bridge) with frozen numbers, the server's automation rules are silent (no new readings, and the rules ignore late arrivals older than 60 seconds), and Node 1's local safety does NOT switch on, because the Pi's broker can still be reached (local watering keeps running). Once connected again, the late arrivals go into the database with their original `ts` (no duplicates: `duplicate skipped`) and are broadcast to the live dashboard all at once, oldest first. The bridge status message (`$SYS/broker/connection/pi-bridge/state`) isn't read by the backend yet. While the backend isn't connected, the central broker only holds QoS 1 messages (the ones through the bridge), at most 1000 messages (Mosquitto's default); QoS 0 messages that go straight into the central broker (devices without a gateway) are still lost.
- **A manual command that isn't answered** is only sent again if the device is heard within 2 minutes (v1.4); within those 2 minutes, a command already reported as failed can still be carried out later.
- **`/health` always answers 200**, also while the broker or the database is down (its content is `broker: false` / `database: false`). The Docker healthcheck only proves "the process is alive and answers", and an `unhealthy` status doesn't make Docker restart the container. A `/health` that answers 503 when something is down, and a real monitor, follow in Module 30.
- **Swagger UI can't be used through Caddy** (`http://localhost/api/docs`): its page assets are looked for at the wrong address, and the **Try it out** button calls the API without the `/api` prefix. Use the backend counter: `http://localhost:8080/docs`.
- **On the home network, MQTT traffic is still unencrypted** (Node 1 to the Pi's broker, port 1883): the username and the device key travel in the clear on the LAN (prove it yourself with `tools/sniffer.js`). What goes out to the internet since Module 27 is encrypted: the dashboard and the API over HTTPS (Caddy), the Pi → VPS bridge over TLS on port 8883. The backend itself still uses plain `mqtt://mosquitto:1883` inside the Docker hallway (it never leaves the VPS). A key in the ESP32's NVS is also readable by anyone who holds the board (*flash encryption*, 🔬).
- **Firmware updates are only for Node 1** (Node 2 on ESP-NOW isn't connected to the router: update it by cable). An update command is only for a device that is `online` at that moment: it isn't queued. The final result depends on the device's report (`vitals.ota`); without a report, the backend concludes it from the version after the device restarts, or marks it `expired`. The backend can't prove by itself that a rollback happened on the board.
- **Firmware files live only in the `firmware-data` cupboard**, not in the database: `docker compose down -v` deletes them (upload **exactly the same** file again: restored with `200`; other content with the same version is still refused with `409`). Include that cupboard in the backup recipe.
- **The SHA-256 in an update command = an integrity check, not a signature.** Anyone who holds a dashboard admin account can upload any firmware (signed firmware = 🔬 Module 28).
- **Automatic broker accounts**: anyone who may write the control topic (`$CONTROL/dynamic-security/v1`, `msh-gateway/+/dynamic-security/v1`) is the admin of the broker accounts; in `edge/acl-broker` only the `backend` account. Device keys travel through that topic (inside the Docker hallway, and through the TLS bridge on 8883 on the main path). While the bridge is down, account commands aren't held (tried once more, then `503`). Old Module 21 accounts in the password file must be moved by hand.
- **A deactivated device**: its old retained `online` status can stay behind at the broker (the `backend` account may not write the `status` topic); the backend ignores it (the second layer). Grafana's "Silent node" can send `✅ … is sending data again.` when a device that is 🔴 is deactivated (that device disappears from the query): that message means "no longer watched", not "back". Fixing the alert = Module 30.
- **Claim codes** are limited to 10 attempts per minute per IP address, in memory (a restart = zero). Devices behind one home router share one IP address.
- **Accounts that may write `msh/+/cmd`** (backend, `nodered` from Module 13) can now also order firmware updates. Firmware 1.7.0 only downloads from the server address stored on it and checks the SHA-256, so such an account can't install a file from outside or harvest keys, but it can still make a device install another release that is on the server (for example an old version that isn't withdrawn yet). An update report whose id this server never sent is recorded as a warning + an `ota` event. Guard the `nodered` password; withdraw bad old releases.
- **Broker account steps one at a time.** While the broker or the bridge is silent, the second and later steps (register, key rotation, claim, Deactivate) wait for their turn at most 5 seconds, then `503` without being carried out: repeat after the broker answers again.
- **Going back with the broker** (back to the Module 27 `edge/*.conf` without the dynamic security plugin): every device account created, changed, or claimed in Module 28 disappears from authentication. Keep the two `plugin …` lines, or first make those accounts with `mosquitto_passwd` (see `edge/README.md`).
- **The integration tests don't cover all the fleet and claim SQL yet** (Module 29). Tested with a test database: single-use claim codes, expired codes, an active device that can't be taken over, releases and the test mark, the locked download, the `/fleet` query. Still only proven in the author's lab with a real database (the Module 28 labs; this edition's lab re-ran the 20 integration tests on 6 November 2026): one running update per device (a unique index), two devices exchanging the same code at the same time (`FOR UPDATE`), a report that overwrites `expired`, and concluding an update's result.
- **The integration tests need Docker and the `timescale/timescaledb:2.30.2-pg17` image** (a download of about 535–552 MB, about 2 GB installed). Without `DATABASE_URL_TEST` those tests are skipped on the laptop, but the robot runs them on every pull request.
- **Release versions without leading zeros.** Uploads and update commands only accept `x.y.z` without leading zeros and at most 5 digits per part (`1.07.1` is refused with `400`); the version a device REPORTS still follows the data contract (an ordinary `x.y.z`, so older firmware isn't suddenly refused).
- The registry of registered devices is loaded into memory when the server starts; changes to `devices` made directly in the database (not through the API) are only read when the server restarts. `GET /devices` itself is always read fresh from the database.
- **`npm audit` writes `4 moderate severity vulnerabilities`** (as of 4 Nov 2026; oxlint, the new developer tool of Module 29, adds none). The robot is only red for `high` or `critical` holes in production packages (`npm audit --omit=dev --audit-level=high`, exit code `0` as of 4 Nov 2026); the full report is still read by a human through the pull request item. All four are one chain that belongs to the `/docs` page: `@fastify/swagger-ui` 6.1.2 → `@fastify/static` 10.1.6 → `glob` 13.0.6 → `minimatch` 10.2.6 ([GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)). The fix only exists in `glob` 14.0.2 and `minimatch` 11.0.1 (new major versions), while every `@fastify/static` version, the newest (10.1.8) too, still asks for `glob` 13: `npm update` within the version ranges of `package.json` removes none of them. **Don't** run `npm audit fix --force`: according to its `Will install …` line, that "fix" installs the ancient `@fastify/swagger-ui` 2.1.0. In this backend `glob` is never called: `@fastify/static` only uses it for the option `wildcard: false`, while Swagger UI uses the default `wildcard: true`. Wait for a `@fastify/static` release that uses `glob` 14.
