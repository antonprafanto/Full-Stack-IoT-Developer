# Mini Smart Home Backend

🌐 **English** · [Bahasa Indonesia](../../../../../fase-3-backend-data/modul-18-timescaledb/kode/backend/README.md)

Backend v0.3 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.2 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database with the TimescaleDB add-on (through Docker), and provides a documented API. The reading history can be requested raw or already summarized per 15 minutes, per hour, or per day.

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
7. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts |
| `npm run check` | checks the TypeScript types (run it before every commit) |
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
| `POST /devices/:id/command` | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table |

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

## Limits of v0.3

- `GET /devices`, `latest`, and `vitals` are still read from memory, so they are empty again after every server restart. The reading history and the commands are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- Raw readings are only kept for 90 days; for older times, only their hourly summaries remain.
- The days of the `1d` summary are WIB days (`Asia/Jakarta`), also for devices in WITA or WIT.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API has no login yet.
