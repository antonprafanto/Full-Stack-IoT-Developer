# Mini Smart Home Backend

🌐 **English** · [Bahasa Indonesia](../../../proyek-rumah-pintar-mini/backend/README.md)

Backend v0.1 of the Mini Smart Home project: a Node.js 24 server in light TypeScript that listens to every `msh/#` MQTT message, checks every message against data contract 1.2 (Zod schemas), keeps the last state of every device in memory, and provides a documented API.

## How to run it

1. Install Node.js 24 LTS.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env`, then fill in `MQTT_URL` with the broker's address.
4. Run `npm run dev`, then open the documentation at `http://127.0.0.1:8080/docs`.

| Command | What it does |
| :--- | :--- |
| `npm run dev` | runs the server and restarts it every time the code is saved |
| `npm start` | runs the server without automatic restarts |
| `npm run check` | checks the TypeScript types (run it before every commit) |

## API

| Route | What it does |
| :--- | :--- |
| `GET /health` | is the server alive? connected to the broker? how many messages were received and rejected? |
| `GET /devices` | every device ever heard |
| `GET /devices/:id/latest` | the latest `telemetry` reading of one device |
| `GET /devices/:id/vitals` | the last health report of one device |
| `POST /devices/:id/command` | sends a `set` command to Node 1, then waits at most 5 seconds for its `ack` |

The Bruno collection for every route is in the `bruno/` folder (choose the `local` environment).

## Limits of v0.1

- The data is only kept in memory, so it's lost when the server stops. A database comes later.
- The server only accepts guests from this laptop (`127.0.0.1`) because the API has no login yet.
