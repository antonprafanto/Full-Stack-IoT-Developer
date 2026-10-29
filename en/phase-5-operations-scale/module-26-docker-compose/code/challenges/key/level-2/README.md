# Module 26 Level 2 answer key: Uptime Kuma (the monitoring profile) and one monitor through a service name

**Task:** start the `uptime-kuma` service that is already written in `compose.cloud.yml` with the `monitoring` profile, finish its wizard
(an SQLite database + an admin account), then make **one** HTTP monitor that checks the backend through its **service name**. No notifications and
no other monitors: real monitoring (Telegram, a status page, broker and database monitors) is Module 30.

There's no key file: everything is set on the Uptime Kuma screens, and its data is stored in the `kuma-data` cupboard (it belongs to Compose).

## Steps

1. From the project root: `docker compose --profile monitoring up -d`. Only `uptime-kuma` is created new; the other services stay `Running`
   (the one-off ones run once more, then `Exited`). The first download of `louislam/uptime-kuma:2.5.8-slim` is about 183 MB (878 MB on disk).
   Another way: write `COMPOSE_PROFILES=monitoring` in the root `.env`, then plain `docker compose up -d` is enough.
2. Wait until `docker compose ps uptime-kuma` writes `Up …` (about 10 seconds until the page can be opened; the `(healthy)` mark only
   shows later), then open **`http://localhost:3001`** on the laptop (its counter is `127.0.0.1:3001`, this laptop only).
3. The first screen **Which database would you like to use?**: choose **SQLite** (not **MariaDB/MySQL**), then **Next**. Uptime Kuma
   prepares its database (about 15 seconds).
4. The **Create your admin account** screen: fill in **Username**, **Password**, **Repeat Password** (a new password from the password manager, not
   another password of yours), then **Create**. The button names in this key = the English screen (the author's lab browser); the screen's language can be
   changed through the **Language** choice (it has **Bahasa Indonesia**), and it may follow your browser's language right away.
5. On the dashboard (**No Monitors, please add one**): **Add New Monitor**.
   - **Monitor Type**: leave **HTTP(s)** (the default).
   - **Friendly Name**: `Backend`.
   - **URL**: **`http://backend:8080/health`**.
   - **Heartbeat Interval**: leave `60` (once a minute). **Notifications**: don't set them.
   - **Save**.
6. Within a few seconds the **Backend** monitor turns green: **Up**, the message `200 - OK`.

**Why `backend:8080`, not `localhost:8080`?** Uptime Kuma runs in its own container; inside that container, `localhost`
is Uptime Kuma itself. Because `uptime-kuma` is written in `compose.cloud.yml`, it joins the home hallway `smarthome_default`, and in
that hallway every service is known by its name: `backend` = the backend container, port `8080` = the port INSIDE its container (not the laptop
counter). This monitor uses `GET /health`; backend 1.3.0 doesn't log successful `/health` knocks, so the backend log stays
clean even though it's knocked on every minute.

**The limit of this monitor:** the `/health` of backend 1.3.0 answers `200` as long as its process is alive, also while the broker or the database is down (its content
`"broker":false` / `"database":false`). So this monitor only answers "is the backend alive?", not yet "is the home healthy?". A more
honest check and messages to Telegram are covered in Module 30.

## Stopping and cleaning up

- **Important:** `docker compose down` **without** `--profile monitoring` does NOT stop Uptime Kuma. In the author's lab its container stayed
  `Up`, and the home hallway couldn't be removed (`Network smarthome_default  Resource is still in use`). Use
  `docker compose --profile monitoring down` (or `COMPOSE_PROFILES=monitoring` in `.env`).
- Stopping only Uptime Kuma: `docker compose --profile monitoring stop uptime-kuma`.
- The account and the monitors are stored in Compose's `kuma-data` cupboard; they're only deleted by `down -v` (which stays forbidden).

## Expected output (the author's lab)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, headless Chrome 156, 29 Oct 2026 ±09:43–09:46 WIB.
Lab project `m26en` and lab counter `127.0.0.1:6109` (instead of 3001).

- `--profile monitoring up -d` 6.3 seconds (the image was already there); `uptime-kuma Up 4 seconds (health: starting)`. The page `/` answers
  `302` to `/setup-database` at the first check, 28 seconds after the container was created. Log: `Starting Setup Database`, `Waiting for user action...`.
- Before the wizard, from inside the Uptime Kuma container: `docker compose exec uptime-kuma curl -sS http://backend:8080/health` →
  `{"ok":true,"broker":true,"database":true,"received":7,"rejected":0,"ignored":0}` (200), and `getent hosts backend` → the address of the
  backend container in the hallway.
- The wizard (exact screens): **Which database would you like to use?** → the choices **MariaDB/MySQL** and **SQLite** → **Next** → **Create
  your admin account** (**Username**, **Password**, **Repeat Password**, **Create**) → the dashboard **No Monitors, please add one** →
  **Add New Monitor** (**Monitor Type** default `HTTP(s)`, **Friendly Name**, **URL**, **Heartbeat Interval (Check every 60 seconds)**)
  → **Save**.
- The monitor (its screens were shot in the same lab for the `uptime-kuma-wizard` picture): **Backend**, `http://backend:8080/health`,
  **Check every 60 seconds (1 minute)**, **Up**, the event row `Up` · date and time · `200 - OK`. The backend log in those 3 minutes: 0 `/health` lines.
- Uptime Kuma RAM ±200 MiB (no other monitors).
- `docker compose down` without `--profile`: every default service `Removed`, but `m26en-uptime-kuma-1 Up About a minute (healthy)` and
  `Network m26en_default  Resource is still in use` (exit 0). `docker compose --profile monitoring … down` → `uptime-kuma Removed`,
  `Network … Removed`.
