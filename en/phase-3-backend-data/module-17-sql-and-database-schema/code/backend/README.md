# Mini Smart Home Backend

🌐 **English** · [Bahasa Indonesia](../../../../../fase-3-backend-data/modul-17-sql-dan-skema-database/kode/backend/README.md)

Backend v0.2 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.2 (Zod schemas), keeps the last state of every device in memory, archives every message in a PostgreSQL database (the TimescaleDB image, through Docker), and provides a documented API.

## How to run it

1. Install Node.js 24 LTS and Docker Desktop.
2. Start the database, just once (replace `change-this-password` with your password; use only letters, digits, and hyphens):

   ```text
   docker run -d --name smarthome-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=change-this-password -e POSTGRES_DB=smarthome -e TIMESCALEDB_TELEMETRY=off -v smarthome-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env`, then fill in `MQTT_URL` (the broker's address) and the database password in `DATABASE_URL`.
5. Create the tables with `npm run migrate`.
6. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts |
| `npm run check` | checks the TypeScript types (run it before every commit) |
| `npm run migrate` | runs the new SQL files in the `migrations/` folder (safe to repeat) |
| `npm run seed-history` | fills in 7 days of practice data for the practice devices `f00d00000001` and `f00d00000002` |

## API

| Route | What it does |
| :--- | :--- |
| `GET /health` | is the server alive? connected to the broker and the database? how many messages were received and rejected? |
| `GET /devices` | every device heard since the server started |
| `GET /devices/:id/latest` | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | the last health report of one device |
| `GET /devices/:id/readings?from=…&to=…` | the reading history from the database (default: the last hour; at most 1,000 readings) |
| `POST /devices/:id/command` | sends a `set` command to Node 1, waits at most 5 seconds for its `ack`, then records it in the `commands` table |

The Bruno collection for every route is in the `bruno/` folder (choose the `local` environment).

## Database

The shape of the tables is written as numbered SQL files in the `migrations/` folder. A file that has already been applied must never be changed; every new change goes into a file with the next number. The tables: `devices`, `readings`, `device_health`, `commands`, `users` and `rules` (prepared for later modules), and `schema_migrations` (the record of the migrations already applied).

## Limits of v0.2

- `GET /devices`, `latest`, and `vitals` are still read from memory, so they are empty again after every server restart. The reading history and the commands are stored permanently in the database.
- Readings that arrive while the database can't be reached aren't stored.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API has no login yet.
