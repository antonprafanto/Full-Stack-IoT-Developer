# Mini Smart Home Backend

🌐 **English** · [Bahasa Indonesia](../../../proyek-rumah-pintar-mini/backend/README.md)

Backend v1.3 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.4 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database with the TimescaleDB add-on (through Docker), and provides a documented API. The reading history can be requested raw or already summarized per 15 minutes, per hour, or per day. Since Module 19, readings also flow live through Socket.IO, every command goes through one door (with the desired and the reported state), automation rules and schedules are stored in the database and can be changed through the API without restarting the server, every important event is recorded, and alerts are sent through Telegram. Since Module 20, the API and Socket.IO are **locked for people**: guests must log in first, `viewer` accounts can only look, login attempts are limited, and other web pages can't make the server act on a user's behalf. Since Module 21, the backend is also **locked for devices**: only devices an admin has registered (with a per-device key) have their data processed, messages from unregistered or revoked devices are ignored, and the backend itself connects to the broker with its own account. 🎉 **Phase 3 checkpoint: the house is locked for people and for devices.**

**v1.1 (Module 24)** adds three small things dashboard v1.0 needs: **below-threshold** rules (for example water when the soil is below 30%), threshold rules that **send a command once** (for example the pump for 5 seconds), and **deleting rules** (`DELETE /rules/:id`). No database migration and no data-contract change (still 1.4); details in [Version 1.1 notes](#version-11-notes).

**v1.2 (Module 25)** adds two things for the device map and the daily report: `GET /devices` now carries each device's **map point** (`lat`, `lng`), and the admin moves it with `PUT /devices/:id/location`; the backend also sends a **daily CSV report** through the Telegram bot every morning (default 07:00 WIB, setting `REPORT_SCHEDULE`), and `POST /reports/send` sends it right now. No database migration, no new npm package, the data contract stays 1.4; details in [Map and daily report](#map-and-daily-report-module-25) and [Version 1.2 notes](#version-12-notes).

**v1.3 (Module 26)** lets the backend run as a **Docker container** in `compose.cloud.yml` (the project root), together with the database, the central broker, the dashboard, and Grafana: one command, `docker compose up -d`, starts everything, and a backend that stops by itself is started again by Docker. The changes are small: `pino-pretty` moves to `dependencies` (it's used while the server runs), the npm scripts no longer fail when there is no `.env`, successful `/health` knocks no longer fill the log, plus a `Dockerfile` and a `.dockerignore`. No database migration, no new npm package, the data contract stays 1.4; details in [Version 1.3 notes](#version-13-notes).

There are two ways to run the backend, and **only one may run** at a time (two backends with the same Telegram token fight each other, `409 Conflict`; two backends also fight over counter 8080):

| Way | When | Its settings come from |
| :--- | :--- | :--- |
| **Home mode** (Docker Compose) | every day: the home is on, the dashboard at `http://localhost` | `.env` at the **project root** (its example is the root `.env.example`) |
| **Dev mode** (`npm run dev`) | while changing the backend code | `backend/.env` (its example is `backend/.env.example` in this folder) |

## How to run it with Docker Compose (Module 26)

All the commands in this section are typed from the **project root** (the folder that holds `compose.cloud.yml`), the same in PowerShell, the macOS Terminal, and Linux. The full steps, including moving the old database and Grafana into Compose without losing data, are in [Module 26](../../phase-5-operations-scale/module-26-docker-compose/README.md).

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
| `docker compose build backend` then `docker compose up -d backend` | rebuilds the image after the code changed (tag = `version` in `package.json`) |
| `docker compose stop backend` / `docker compose start backend` | stops it and starts it again; a container stopped with `stop` is NOT started again by Docker itself |

The API docs stay at the old counter, **`http://localhost:8080/docs`** (not `127.0.0.1`: in the container the backend listens on `0.0.0.0`, so a login through **Try it out** from the page `http://127.0.0.1:8080/docs` is refused with `403`). If `PORT_BACKEND` in the root `.env` isn't 8080 (for example 8082), add `http://localhost:8082` to `CORS_ORIGIN` in that `.env`, then `docker compose up -d`; without it, a login from `http://localhost:8082/docs` is refused with `403` too. The Bruno collection (`baseUrl` `http://127.0.0.1:8080`) and `tools/live-terminal.js` keep working unchanged. The dashboard calls the backend through Caddy at `http://localhost/api/…`.

The backend image is built from the [`Dockerfile`](Dockerfile) (two `node:24.22.1-alpine3.24` stages, `npm ci --omit=dev`, the user `node`, `CMD ["node", "src/server.ts"]`); the [`.dockerignore`](.dockerignore) keeps out `.env`, `node_modules`, `backup`, Bruno, the load test, and the test files. Inside the container, the settings come from `compose.cloud.yml` (`HOST=0.0.0.0`, `MQTT_URL=mqtt://mosquitto:1883`, `DATABASE_URL=…@db:5432/…`, `TZ=Asia/Jakarta`), not from `backend/.env`.

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
| `npm test` | runs the unit tests with Vitest: the rules engine and the rule schema (`src/rules/*.test.ts`; since Module 24 also below-threshold rules), login (`src/auth/auth.test.ts`), device keys (`src/auth/key.test.ts`, Module 21), the guest book and second layer (`src/services/registry.test.ts`), the registration routes (`src/routes/devices.test.ts`), the delete-rule route with its guard: guest 401, viewer 403, the `DELETE` preflight (`src/routes/rules.test.ts`, Module 24), and a running watering rule: the pump sent once, turning off without a command, a refused command marked `ok: false`, a deleted or deactivated rule no longer acting (`src/services/automation.test.ts`, Module 24), then (Module 25) the map point: the location schema and the `PUT /devices/:id/location` route with its guard (`src/routes/location.test.ts`), the CSV maker (`src/services/csv.test.ts`), the daily report: yesterday's WIB range, the CSV content, Telegram off or refusing, a late WIB schedule still reporting the right day, a missed schedule only reported (`src/services/reports.test.ts`), the `POST /reports/send` route (`src/routes/reports.test.ts`), a report file sent with its name and the 📴/✅ messages after 60 seconds (`src/services/telegram.test.ts`), a retained `online` status after a broker restart (`src/services/mqtt.test.ts`), the `REPORT_SCHEDULE` setting (`src/config/env.test.ts`), and (Module 26) the log filter: successful `/health` knocks aren't logged (`src/services/log.test.ts`) |
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
- **Open routes** (no login): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET`/`HEAD /health`, and `/docs`. Every other route, including new routes and URLs that don't exist, answers guests with `401`.
- **Roles**: `admin` may do everything; `viewer` only `GET`/`HEAD` (anything else gets `403`).
- **Rate limit**: at most 10 `POST /auth/login` attempts per minute from the same IP address; the 11th attempt gets `429` with a `retry-after` header. The counts live in memory: a server restart = starting from zero.
- **CORS and the page's origin**: web pages in `CORS_ORIGIN` (`.env`, default `http://localhost:5173,http://127.0.0.1:5173` for Module 22; home mode: `http://localhost,http://127.0.0.1` from the root `.env`) may call the API from a browser with cookies. Requests other than `GET`/`HEAD` that carry an `Origin` header from another page are refused with `403`; curl, Bruno, and Node don't send `Origin`, so they aren't affected.
- **Bruno**: the `bruno/` collection has the requests `login admin`, `login viewer`, `wrong login`, `who am i`, `refresh`, and `logout`, plus (Module 21) `register Node 1`, `register Node 2 via Node 1`, `register practice device`, `rotate practice device key`, and `revoke practice device key`, and (Module 24) `create soil watering rule` and `delete rule` (replace the number in the `delete rule` address with the `id` from the `create soil watering rule` answer; it defaults to `4`, the first rule number after the three Module 19 rules), plus (Module 25) `register mock Garden` (fake Node 2 `f00d000000b2` via `f00d00000001`, for the path without a Node 2; see `tools/README.md`), `set device location`, and `send report now` (`?day=today`). Their passwords are read from `bruno/.env` (not in Git) holding `ADMIN_PASSWORD=…` and `VIEWER_PASSWORD=…`. Send `login admin` or `login viewer` first; the other requests use its cookie automatically.

## API

| Route | Who | What it does |
| :--- | :--- | :--- |
| `POST /auth/login` | open | logs in with `{ "email": …, "password": … }`; the answer is `{ id, email, name, role }` + the `access` and `session` cookies |
| `POST /auth/refresh` | open (`session` cookie) | a new wristband + a new season pass |
| `POST /auth/logout` | open | deletes the session and both cookies; always `{"message":"logged out"}` |
| `GET /auth/me` | login | the account that is logged in (read from the database) |
| `GET /health` | open | is the server alive? connected to the broker and the database? how many messages were `received`, `rejected` (failed the contract), and `ignored` (from unregistered/revoked devices, Module 21)? |
| `GET /devices` | login | the devices from the database: the registered ones, the revoked ones, and old rows that aren't registered; the `key` column marks `active`/`revoked`/`no-key`/`unregistered` (the key fingerprint is never included); since Module 25 also the map point `lat`/`lng` (`null` = not set yet) |
| `POST /devices` | admin | register a device (Module 21): the answer carries the 43-character `key` **shown only this once** and the next `steps`; `linked_via` for an ESP-NOW device (Node 2) whose data Node 1 publishes (no key) |
| `POST /devices/:id/key` | admin | make a new key (the old key stops working at once); also brings a revoked device back to life |
| `POST /devices/:id/revoke` | admin | revoke the key of a lost or stolen device: the backend ignores its data at once, commands to it are answered 409 |
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

The Bruno collection for every route is in the `bruno/` folder (choose the `local` environment).

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

## Limits of v1.3

- `GET /devices/:id/latest`, `vitals`, and `state` are still read from memory, so they are empty again after every server restart. The desired state (`desired`) and the "for" count of every rule are also lost when the server restarts; the reading history, the commands, the rules, the events, the accounts, and the sessions are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- Raw readings are only kept for 90 days; for older times, only their hourly summaries remain.
- The days of the `1d` summary are WIB days (`Asia/Jakarta`), also for devices in WITA or WIT. Rule schedules are counted in WIB too.
- Rules and schedules only run while the backend is running. A schedule that is more than 15 minutes late (for example a laptop asleep at 06:00) isn't run afterwards, only recorded; if the backend is off at that time, nothing is recorded. When the broker can't be reached, Node 1 runs its own fan safety with the threshold from `config`.
- **The daily report is also only sent while the backend is on** (Module 25). A laptop that sleeps more than 15 minutes past `REPORT_SCHEDULE` doesn't send it afterwards: the log and Telegram only record `⏰ The daily report of … was missed`; send it by hand with `POST /reports/send`. If the backend is off at that time, nothing is recorded at all. Since Module 26, a backend in a container that stops by itself is started again by Docker, but only while Docker (Docker Desktop on the laptop) is running: a sleeping laptop still misses the schedule. A server that is always on follows in Module 27. The report is only sent to one chat (`TELEGRAM_CHAT_ID`), and the first day's report (no data yesterday yet) is really empty: use `?day=today`. A broker restart counts as one disconnect (`disconnects`) for every Node 1 connected at that moment: its `offline` will really is published.
- **`devices.last_seen` isn't "the last data"**: this column is moved forward by EVERY message of a registered device, `status` messages included (the broker's `offline` will, Node 2's status published by Node 1, and retained statuses the broker sends again when the backend starts). For "when did the device last send data" (for example the "silent node" alert in Grafana, Module 25), use `readings.received_at` of its latest reading. This column's behavior is deliberately not changed in v1.2.
- Changes made to the rules directly in the database (for example through DBeaver) are only read when the server restarts or when another rule is changed through the API; use the `/rules` API.
- **Automation rules are loaded once, when the server starts.** If the database can't be reached at that moment, the log writes `automation rules couldn't be loaded yet: …` and doesn't try again (the device registry is retried every 10 seconds): the rules don't act and the **Rules** screen is empty, while the backend stays `(healthy)`. In Compose, `docker compose up` waits for the database to be ready first, but after the laptop restarts or Docker Desktop opens, Docker starts every container at once without that order. Seeing that? `docker compose restart backend`.
- A rule with a `command` action (for example the pump, once) only acts when the rule changes state. Because its count is lost when the server restarts or the rule is changed, its command is sent once more if its condition still holds after that.
- Deactivating or deleting a fan rule does **not** withdraw the retained `temp_fan_on` `config` already sent: Node 1 keeps using that last number as its local safety rule while the broker can't be reached.
- Deleting or deactivating a `switch` rule that is on does **not** turn its actuator off: the fan or lamp is left in its last state (the server sends no command at all). Turn it off with the dashboard button or `POST /devices/:id/command`.
- The backend only sends `temp_fan_on`, never `soil_watering`. Node 1 v1.6.0 still waters by itself (3 seconds, then a 30-second pause) when the soil is below its local threshold, 30% by default, even while the backend is running. To let the server's watering rule act first, lower the local threshold below the server rule's threshold in the Serial Monitor (`threshold 20`); local watering then only acts if the soil keeps drying to below 20%, for example when the backend is off or the Wi-Fi drops. The firmware's tank safety check (`pump refused: tank water too low` below 20%) still protects both.
- A wristband (access JWT) that was handed out stays valid until it expires (15 minutes at most), also after a logout, a role change, a password change, or a deleted account; a Socket.IO connection that is running is only cut when its wristband runs out too (except a logout of that very session, or an old season pass used again 30 seconds or more after it was replaced, which cut it right away).
- The rate-limit counts are kept in the memory of one server: a restart = zero, and they don't fit several servers at once.
- The cookies aren't `Secure` yet because the server is still `http://`; HTTPS comes in Module 27. Dev mode: the server only accepts guests from this laptop (`HOST=127.0.0.1`). Home mode: inside the container `HOST=0.0.0.0` (so that Caddy and the healthcheck can get in), but the counter on the laptop stays `127.0.0.1:8080`, and the dashboard through Caddy is only on `127.0.0.1:80` unless `WEB_ADDRESS` is changed (phone mode).
- **Behind Caddy, the backend doesn't use `trustProxy` yet** (Module 27, together with HTTPS). By the way Fastify works, without that setting the visitor address it reads is the Caddy container's address, so the Module 20 login limiter (10 attempts per minute per address) counts every dashboard visitor as one address (author's lab: after 10 wrong logins through the dashboard, even a correct login from another visitor got `429` until the minute had passed, while Bruno on the backend counter could still log in), and `secure: "auto"` never sets `Secure` even once Caddy has HTTPS later.
- **`/health` always answers 200**, also while the broker or the database is down (its content is `broker: false` / `database: false`). The Docker healthcheck only proves "the process is alive and answers", and an `unhealthy` status doesn't make Docker restart the container. A `/health` that answers 503 when something is down, and a real monitor, follow in Module 30.
- **Swagger UI can't be used through Caddy** (`http://localhost/api/docs`): its page assets are looked for at the wrong address, and the **Try it out** button calls the API without the `/api` prefix. Use the backend counter: `http://localhost:8080/docs`.
- **MQTT (and HTTP) traffic is still unencrypted.** The username and the device key travel in the clear on the LAN: anyone who can see the packets on the same network can read them (prove it yourself with `tools/sniffer.js`). On a closed home network the risk is still small, but **TLS is a must before opening it to the internet** (Module 27). A key in the ESP32's NVS is also readable by anyone who holds the board (*flash encryption*, 🔬).
- The registry of registered devices is loaded into memory when the server starts; changes to `devices` made directly in the database (not through the API) are only read when the server restarts. `GET /devices` itself is always read fresh from the database.
