# Mini Smart Home Backend

🌐 **English** · [Bahasa Indonesia](../../../proyek-rumah-pintar-mini/backend/README.md)

Backend v0.4 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.3 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database with the TimescaleDB add-on (through Docker), and provides a documented API. The reading history can be requested raw or already summarized per 15 minutes, per hour, or per day. Since Module 19, readings also flow live through Socket.IO, every command goes through one door (with the desired and the reported state), automation rules and schedules are stored in the database and can be changed through the API without restarting the server, every important event is recorded, and alerts are sent through Telegram.

## How to run it

1. Install Node.js 24 LTS and Docker Desktop.
2. Start the database, just once (replace `change-this-password` with your password; use only letters, digits, and hyphens):

   ```text
   docker run -d --name smarthome-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=change-this-password -e POSTGRES_DB=smarthome -e TIMESCALEDB_TELEMETRY=off -v smarthome-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env`, then fill in `MQTT_URL` (the broker's address) and the database password in `DATABASE_URL`.
5. Create the tables with `npm run migrate`.
6. The summary clerk only summarizes the last 3 days again. Older history that arrives all at once (readings that were there before migration `003`, the practice data from `npm run seed-history`, or the load test below) only gets into the hourly summary book when it is summarized **once** with this command, after the data is in:

   ```text
   docker exec smarthome-db psql -U postgres -d smarthome -c "CALL refresh_continuous_aggregate('readings_hourly', NULL, now() - INTERVAL '1 hour');"
   ```

   Don't repeat this command after retention (migration `004`) has dropped old data: a `NULL` window also deletes the old summaries whose raw readings have already been dropped.
7. (Optional) For Telegram alerts, fill in `TELEGRAM_BOT_TOKEN` (the token from @BotFather) and `TELEGRAM_CHAT_ID` (the number the bot answers when you send `/start`) in `.env`. Empty = Telegram notifications off. That token is a secret, like a password.
8. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts; **Ctrl + C** stops it gracefully (on Windows, `npm run dev` + **Ctrl + C** kills the server at once) |
| `npm run check` | checks the TypeScript types, test files included (run it before every commit) |
| `npm test` | runs the unit tests of the rules engine (`src/rules/*.test.ts`) with Vitest |
| `npm run migrate` | runs the new SQL files in the `migrations/` folder (safe to repeat) |
| `npm run seed-history` | fills in 7 days of practice data for the practice devices `f00d00000001` and `f00d00000002` |

For a load test, `test/load-1-million.sql` loads 1,036,801 fake readings (one every 10 seconds for 120 days) for the test device `beef00000001`. Run it from this folder:

```text
docker cp test/load-1-million.sql smarthome-db:/tmp/load-1-million.sql
docker exec smarthome-db psql -U postgres -d smarthome -f /tmp/load-1-million.sql
```

## API

| Route | What it does |
| :--- | :--- |
| `GET /health` | is the server alive? connected to the broker and the database? how many messages were received and rejected? |
| `GET /devices` | every device heard since the server started |
| `GET /devices/:id/latest` | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | the last health report of one device |
| `GET /devices/:id/readings?from=…&to=…` | the raw reading history from the database (default: the last hour; at most 1,000 readings) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | a summary of the history per 15 minutes, per hour, or per WIB day (default: the last 1 day, 7 days, or 30 days; at most 1,000 buckets) |
| `POST /devices/:id/command` | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table (with `source` `api`) |
| `GET /devices/:id/state` | the actuator state: what the server wants (`desired`), what the device reported last (`reported`, from `telemetry.state` or `ack.state`), when that report arrived, and the actuators that don't match yet (`diff`) |
| `GET /rules` | every automation rule the server is using right now; schedule rules also carry `next_run` (UTC) |
| `POST /rules` | creates a new rule: a threshold rule (`condition.kind` `threshold` + `action.kind` `switch`) or a schedule rule (`schedule` + `command`); it applies right away |
| `PUT /rules/:id` | replaces the whole content of one rule; it applies right away without restarting the server, and the threshold of a fan rule is sent to the device as a retained `config` |
| `POST /rules/:id/run` | runs the action of one schedule rule right now (to test it, without waiting for its time) |

Live data is available through **Socket.IO** at the same address (`/socket.io/`): send `follow` with a `device_id` (its answer carries the last reading) to receive that device's `telemetry` events; the `status` and `event` events go to every client. An example client: `tools/live-terminal.js`.

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

Replace `2026-10-20` in the file name with today's date so that later backups don't overwrite each other. On later backups, you can skip `mkdir backup` because the folder already exists.

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

## Limits of v0.4

- `GET /devices`, `latest`, `vitals`, and `state` are still read from memory, so they are empty again after every server restart. The desired state (`desired`) and the "for" count of every rule are also lost when the server restarts; the reading history, the commands, the rules, and the events are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- Raw readings are only kept for 90 days; for older times, only their hourly summaries remain.
- The days of the `1d` summary are WIB days (`Asia/Jakarta`), also for devices in WITA or WIT. Rule schedules are counted in WIB too.
- Rules and schedules only run while the backend is running. A schedule that is more than 15 minutes late (for example a laptop asleep at 06:00) isn't run afterwards, only recorded; if the backend is off at that time, nothing is recorded. When the broker can't be reached, Node 1 runs its own fan safety with the threshold from `config`.
- Changes made to the rules directly in the database (for example through DBeaver) are only read when the server restarts or when another rule is changed through the API; use the `/rules` API.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API and Socket.IO have no login yet.
