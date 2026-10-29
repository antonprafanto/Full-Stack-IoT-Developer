# Module 26 Level 3 answer key: the simulator in a container (the simulation profile)

**Task:** a friend's laptop without Node.js, Kit A, or Kit B still gets live data from one fake device. Make a mold
for the `tools/` folder (`tools/Dockerfile`), then a `simulator` service with the `simulation` profile that sends data to the central broker. The
main file `compose.cloud.yml` **isn't changed**: the new service is written in an extra Compose file.

| Key file | Goes into the project as |
| :--- | :--- |
| [`tools/Dockerfile`](tools/Dockerfile) | `tools/Dockerfile` (one `node:24.22.1-alpine3.24` stage, `npm ci --omit=dev`, a `data/` folder owned by `node`, `USER node`) |
| [`tools/.dockerignore`](tools/.dockerignore) | `tools/.dockerignore` (`node_modules`, `.env`, `data`) |
| [`compose.simulation.yml`](compose.simulation.yml) | `compose.simulation.yml` at the project root, next to `compose.cloud.yml` |

## Steps

1. Copy the three files above to their places.
2. In the root `.env`, change the `COMPOSE_FILE` line so that Compose reads both files at once (separator `:` on Linux, macOS, and the Pi; `;` on
   Windows):
   ```text
   COMPOSE_FILE=compose.cloud.yml:compose.simulation.yml
   ```
3. Register the practice device `f00d00000001` (only once per database), as an admin: Bruno `register practice device` (counter
   `127.0.0.1:8080`), or without Bruno through `http://localhost:8080/docs` → `POST /auth/login`, then `POST /devices` with **Try it out**.
   The answer is `201` and holds `key` (shown once). Keep it in the password manager.
4. Make the broker account `f00d00000001` on the central broker with the password = that key, then restart the broker (from the project root):
   ```text
   docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd f00d00000001
   docker compose restart mosquitto
   ```
5. Add the key to the root `.env`: `KEY_F00D00000001=<the key from step 3>`.
6. `docker compose --profile simulation up -d`. The first time, Compose first looks for the image `mini-smart-home-tools:1.0.0` on Docker Hub
   (`simulator Warning pull access denied for mini-smart-home-tools, repository does not exist or may require 'docker login'`: normal,
   this image really only exists on your laptop), then builds it from `tools/Dockerfile` (`mini-smart-home-tools:1.0.0  Built`).
7. `docker compose logs simulator` → `1 fake device(s) heading to mqtt://mosquitto:1883. …` and `f00d00000001: online`. The
   `received` count at `http://localhost/api/health` goes up every 10 seconds, and on the dashboard (`http://localhost`) that device shows
   **Online** with moving data, like the simulator of Modules 22–25.
8. Stopping: `docker compose --profile simulation stop simulator` (or `--profile simulation down` together with the whole home; `down` without
   `--profile simulation` leaves the simulator running).

## Things to watch out for

- **`init: true`.** The simulator has no stop-signal handler, and Node as the first process in the container (PID 1) ignores
  SIGTERM. Without `init: true`, `docker compose stop simulator` waits 10 seconds, then kills it by force (lab: 11.5 seconds); with
  `init: true`, 1.3 seconds. The device's `offline` status is still published through the will (*Last Will*) the broker sends.
- **`${KEY_F00D00000001:-}`, not `:?`.** Compose checks the variables of the WHOLE file, profile services that aren't
  started included. With `:?`, even a plain `docker compose up -d` (without the simulator) stops with `required variable KEY_F00D00000001 is
  missing a value`. Without a key, by its code the simulator writes `f00d00000001: no key in tools/.env …` (in a container that means
  the root `.env`), then stops with code 1, and Docker tries it again with longer and longer pauses (not tested in the lab).
- **`image:` + `build:` with a local name and an exact tag.** Without `image:`, Compose names the mold itself with the tag `latest`.
  The *pull access denied* warning only shows while the image isn't on the laptop yet.
- **`logging` is written in full.** The `*log` anchor of `compose.cloud.yml` can't be referred to from another file.
- **Typing simulator commands** (`temp 33`, `garden start`) isn't possible in this container (no terminal is attached). For that,
  run the simulator with Node as usual (`tools/README.md`).
- Another way that is also right: pasting the `simulator` block into `compose.cloud.yml`. This key uses a separate file so that the main
  file stays the same as your classmates'.

## Expected output (the author's lab)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 29 Oct 2026 ±10:38–10:46 WIB. Lab project `m26en-t3` (counters
6134–6139), the key files used as they are, copied into a clone of the lab repo (no third lab-only `-f` file was needed). The device
was registered through `POST /api/devices` (Caddy) → `201` + `key`; the broker account → `Adding password for
user f00d00000001`.

```text
$ docker compose --profile simulation up -d          # 36.0 seconds (npm ci 12.5 seconds), exit 0
 simulator Pulling
 simulator Warning pull access denied for mini-smart-home-tools, repository does not exist or may require 'docker login'
 ...
#9 11.97 added 51 packages, and audited 52 packages in 11s
 ...
 mini-smart-home-tools:1.0.0  Built
 Container m26en-t3-simulator-1  Started
$ docker compose logs simulator
simulator-1  | 1 fake device(s) heading to mqtt://mosquitto:1883. Type for example "temp 33", "soil 25", "tank 15", "soil random", or "garden start". Stop with Ctrl+C.
simulator-1  | f00d00000001: online
$ curl -s http://localhost/api/health
{"ok":true,"broker":true,"database":true,"received":20,"rejected":0,"ignored":0}
```

The dashboard wasn't opened in this test (what was checked: the simulator log and `received` in `/health`, 20 readings after ±3 minutes, then more).
Image `mini-smart-home-tools:1.0.0`: 267 MB on disk, 67.6 MB compressed, `arm64`, `User=node`. Simulator RAM ±27 MiB. The next `up -d`
(the image is already there): `simulator Running`, no warning. With `--profile simulation` alone (no extra file in
`COMPOSE_FILE`) Compose doesn't know the `simulator` service at all (`no such service: simulator`).
