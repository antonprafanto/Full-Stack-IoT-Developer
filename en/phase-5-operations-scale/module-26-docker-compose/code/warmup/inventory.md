# Your home's inventory sheet (Module 26 warm-up, steps 1–2 and 5)

Copy this sheet into your study notes (for example `learn-iot/module-26/inventory.md`), then fill in the **On your laptop** column.
The **Example** column = what a reader who finished Modules 17 and 25 exactly as written usually has; yours may differ,
and what differs is exactly what must be written down before Practice 4. **Don't** copy passwords, tokens, or `.env` content into this sheet.

## 1. Docker things that already exist

| What to note | Command | Example (a Module 25 reader) | On your laptop |
| :--- | :--- | :--- | :--- |
| Docker and Compose versions | `docker version`, `docker compose version` | Docker Desktop 4.96.2 or newer; `Docker Compose version v5.…` (Linux distro package: `2.40.…`) | |
| Database container | `docker ps -a` | `smarthome-db`, `Up …`, image `timescale/timescaledb:2.30.2-pg17`, `127.0.0.1:5432->5432/tcp` | |
| Grafana container | `docker ps -a` | `smarthome-grafana`, `Up …`, image `grafana/grafana:13.2.4`, `127.0.0.1:3000->3000/tcp` | |
| Other containers | `docker ps -a` | (none, or leftovers from practices of older modules) | |
| Cupboards (volumes) | `docker volume ls` | `smarthome-data` (history since Module 17), `smarthome-grafana-data` (Module 25) | |
| Hallways (networks) | `docker network ls` | `smarthome` (Module 25), besides Docker's own `bridge`, `host`, `none` | |
| Molds (images) | `docker image ls` | `timescale/timescaledb:2.30.2-pg17`, `grafana/grafana:13.2.4` | |
| Docker's disk space | `docker system df` | the **SIZE** and **RECLAIMABLE** columns; only read them, NEVER `prune` | |

## 2. Counters (ports) already in use

The Module 26 Compose uses counters 80 (dashboard), 8080 (backend), 5432 (database), 3000 (Grafana), and 1883 (central broker). Vite in dev
mode uses 5173. What is in use now must be written down: later it is stopped, or its Compose counter is changed through `.env`.

| Counter | Used by whom now? (example) | Plan in Module 26 | On your laptop |
| :--- | :--- | :--- | :--- |
| 80 | (free; on Windows sometimes IIS/"World Wide Web Publishing Service") | the Caddy dashboard; if taken: `PORT_WEB=8081` | |
| 1883 | an old laptop broker (the Module 12 laptop path), or free (broker on the Pi) | the Compose central broker; the old broker is stopped | |
| 3000 | `smarthome-grafana` | Compose Grafana (the old container is removed in Practice 4) | |
| 5173 | Vite (`npm run dev` of the frontend) while it runs | still Vite, only in dev mode | |
| 5432 | `smarthome-db` | the Compose database (the old container is removed in Practice 4) | |
| 8080 | the backend's `npm run dev` while it runs | the Compose backend (dev mode and home mode must not run together) | |

## 3. The old database container's settings (step 5)

| What to note | Command | Example | On your laptop |
| :--- | :--- | :--- | :--- |
| Restart policy | `docker inspect --format '{{json .HostConfig.RestartPolicy}}' smarthome-db` | `{"Name":"unless-stopped","MaximumRetryCount":0}` | |
| Mounted cupboard | `docker inspect --format '{{range .Mounts}}{{.Type}} {{.Name}} -> {{.Destination}}{{println}}{{end}}' smarthome-db` | `volume smarthome-data -> /var/lib/postgresql/data` | |
| Counter | `docker inspect --format '{{json .HostConfig.PortBindings}}' smarthome-db` | `{"5432/tcp":[{"HostIp":"127.0.0.1","HostPort":"5432"}]}` | |
| Environment variable NAMES (without their content) | `docker inspect --format '{{range .Config.Env}}{{index (split . "=") 0}}{{println}}{{end}}' smarthome-db` | `POSTGRES_PASSWORD`, `POSTGRES_DB`, `TIMESCALEDB_TELEMETRY`, then the image's own variables (`PATH`, …) | |
| Hallways it joins | `docker inspect --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' smarthome-db` | `bridge smarthome` | |

The **old postgres password** (the value of `POSTGRES_PASSWORD` when the cupboard was created in Module 17) and the old **Grafana admin
password** aren't written here: make sure both are in your password manager. Practice 4 uses that OLD postgres password in `.env`. You
don't need to look for the old `grafana_reader` password: in Practice 7, the `grafana-account` service sets it to `GRAFANA_READER_PASSWORD` in `.env`.
