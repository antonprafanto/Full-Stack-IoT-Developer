# Module 26 Level 1 answer key: the Compose dashboard from a phone (phone mode through .env)

**Task:** open the home-mode dashboard (Caddy in `compose.cloud.yml`) from a phone on the home Wi-Fi, **only by changing the root `.env`**,
without touching `compose.cloud.yml`, the Caddyfile, or the code. If port 80 on your laptop is already used by another program, use web counter 8081.
After trying it, go back to laptop mode.

Key file: [`env-phone-mode.example`](env-phone-mode.example) (the changed `.env` lines, with the example IP `192.168.1.20`).

## Two settings, two guards

| Setting in the root `.env` | Laptop mode (default) | Phone mode (temporary) | What it guards |
| :--- | :--- | :--- | :--- |
| `WEB_ADDRESS` | `127.0.0.1` | `0.0.0.0` | **the counter**: who can knock on the dashboard. `127.0.0.1` = this laptop only; `0.0.0.0` = every device on the same network |
| `CORS_ORIGIN` | `http://localhost,http://127.0.0.1` | plus `http://<laptop-IP>` | **the backend's guard**: which pages may log in and send commands. Without this line, the page opens on the phone, but **Log in** is answered with `403` |
| `PORT_WEB` (if 80 is taken) | `80` | `8081` | the counter number on the laptop. A page's origin = scheme + host name + port, so a port other than 80 MUST be written in **every** `CORS_ORIGIN` address, `localhost` included |

Only the web counter is opened. The backend (`127.0.0.1:8080`), the database, and Grafana stay `127.0.0.1` (safety rule number 1): the phone doesn't
need them all, because the page and the API arrive through one door, Caddy. The web counter still gets no port forwarding on the router: there's no
HTTPS yet (Module 27), so passwords cross the Wi-Fi without encryption. For a tester, use a temporary account and delete it afterwards.

## Steps

1. Find the laptop's Wi-Fi IPv4: Windows `ipconfig` (the `Wireless LAN adapter Wi-Fi` part), macOS `ipconfig getifaddr en0`, Linux/Pi
   `hostname -I` (the first address).
2. In the root `.env` change two lines (the full example is in `env-phone-mode.example`):
   ```text
   WEB_ADDRESS=0.0.0.0
   CORS_ORIGIN=http://localhost,http://127.0.0.1,http://192.168.1.20
   ```
   With counter 8081:
   ```text
   WEB_ADDRESS=0.0.0.0
   PORT_WEB=8081
   CORS_ORIGIN=http://localhost:8081,http://127.0.0.1:8081,http://192.168.1.20:8081
   ```
3. From the project root: `docker compose up -d`. Compose only recreates the services whose settings changed, marked `Recreate` /
   `Recreated`: `backend` and `migrate` (both use `CORS_ORIGIN` through `x-backend-settings`) and `web` (its counter). The database,
   the broker, and Grafana stay `Running`; the one-off services run once more, then `Exited`. `web` only starts again after
   the backend is `(healthy)` again.
4. `docker compose ps web` → the PORTS column `0.0.0.0:80->80/tcp` (or `0.0.0.0:8081->80/tcp`).
5. On the phone (the same home Wi-Fi, not a guest Wi-Fi): `http://192.168.1.20` (or `http://192.168.1.20:8081`), then **Log in**. The login on
   the laptop doesn't carry over to the phone: cookies stick to the host name. Try the **Live** badge and F5 on the **Map** screen.
6. Put it back: `WEB_ADDRESS=127.0.0.1`, `CORS_ORIGIN` without the IP address (and the original `PORT_WEB` if you changed it), then `docker compose
   up -d` again. Do it too before the laptop goes to another network. The IP address can change tomorrow; if the phone can't open it any more,
   look up the IP again and change `CORS_ORIGIN`.

## Expected output (the author's lab)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 29 Oct 2026 ±09:40 WIB. Lab counter **6114** replaces
8081 (ports 80/8081 on the author's machine aren't the lab's to use), and "the phone" is played by requests to the machine's Wi-Fi IP address from that
machine itself; **a real phone wasn't tested by the author**. The IP is sanitized to `<laptop-IP>`.

The home was already running with the laptop-mode settings, then `.env` was changed (`PORT_WEB` and `CORS_ORIGIN`) and `docker compose up -d`
was run again: **17.7 seconds**, `Recreate` → `Recreated` for `migrate`, `backend`, and `web`; `db`, `mosquitto`, `grafana`
`Running`; `broker-account` and `grafana-account` `Started` → `Exited`. Then with `WEB_ADDRESS=0.0.0.0`:

```text
$ docker compose ps web
web   Up 3 seconds   443/tcp, 2019/tcp, 443/udp, 0.0.0.0:6114->80/tcp
$ ss -ltn | grep 6114
LISTEN 0      4096         0.0.0.0:6114       0.0.0.0:*
```

| Request | Answer |
| :--- | :--- |
| `http://<laptop-IP>:6114/map` | `200` (the dashboard page) |
| `POST http://<laptop-IP>:6114/api/auth/login`, page `http://<laptop-IP>:6114` | `200` (logged in) |
| the same, page `http://localhost:6114` | `200` |
| the same, page `http://<laptop-IP>` (the port forgotten in `CORS_ORIGIN`) | `403 {"message":"request from the page http://<laptop-IP> refused"}` |

Note: with `WEB_ADDRESS=0.0.0.0`, Docker on Linux opens the counter for IPv4 only (`0.0.0.0:6114`), unlike the broker, which is
written without an address (`0.0.0.0:…` and `[::]:…`). Windows and macOS (Docker Desktop) weren't tested: Windows may ask for firewall
permission, and Mac Docker Desktop 4.97 has a new setting for opening ports below 1024 to the network (see Module 26).
