# Module 26 Quick Win: two services, one command

Material for the 🏆 Module 26 Quick Win (±25 minutes). One file, [`compose.yaml`](compose.yaml), holds **two services**: `broker`
(a practice MQTT broker) and `sender` (sends one message to the broker every 2 seconds). One command starts both, and the sender
finds the broker only by its **service name**, `broker`. The "Mini Smart Home" project isn't touched at all: your real data only
moves in Practice 4.

| File | What it holds |
| :--- | :--- |
| `compose.yaml` | two services from the same image, `eclipse-mosquitto:2.1.2-alpine` (the project's central broker image, about 13 MB to download) |

**Practice only.** This broker has **no accounts** (the image's own `/mosquitto-no-auth.conf` settings), unlike the Module 21 rule "a broker
is always locked". That's safe here because its counter is only `127.0.0.1:1884` (this laptop only, not the home Wi-Fi), and everything is
taken down in step 6.

## Steps

Before (in 🧰, outside the 25 minutes): `docker pull eclipse-mosquitto:2.1.2-alpine`. Copy this `quick-win` folder into your
practice folder (for example `learn-iot/module-26/quick-win`), then open a terminal in that folder.

1. **Start it:** `docker compose up -d`. No `-f`, because `compose.yaml` is Compose's default file name. The project name = the folder
   name (`quick-win`): Compose creates the hallway `quick-win_default`, then the containers `quick-win-broker-1` and
   `quick-win-sender-1` (the broker first, because of `depends_on`).
2. **See their state:** `docker compose ps`. Two `Up` rows; the broker's counter is `127.0.0.1:1884->1883/tcp`. The sender has no counter on
   the laptop (the PORTS column only says `1883/tcp`, a note the image ships with): it only talks inside the hallway.
3. **Read the sender's log:** `docker compose logs -f sender` → `sent message 1`, `2`, … every 2 seconds. **Ctrl + C** only
   stops reading the log; the container keeps running.
4. **See the messages from the laptop** (MQTTX): a new connection, **Host** `127.0.0.1`, **Port** `1884`, no **Username**/**Password**, then
   **Connect** and subscribe to `practice/#`. The message `hello from the sender container, message …` arrives every 2 seconds. MQTTX uses counter
   1884 on the laptop, while the sender uses `broker:1883` inside the hallway: different places, so different addresses.
5. **Go into the broker container:** `docker compose exec broker sh`. You're now inside the broker's own small Linux: `ls /` (it has
   `mosquitto-no-auth.conf`), `getent hosts sender` (another service's name is known as an address in the hallway), then `exit`.
6. **Take it down:** `docker compose down`. The two containers and their hallway are removed; nothing is left behind (the broker's data and log
   folders only live in memory, `tmpfs`). Counter 1884 is free again, and MQTTX says its connection was lost.

## Expected output (the author's lab)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 29 Oct 2026 ±08:15 WIB. In the author's lab the project was
named `m26en-quick-win` (not `quick-win`) and its counter was `127.0.0.1:6110` (not 1884), because port 1884 on the author's machine
isn't the lab's to use; otherwise the file is exactly the same.

```text
$ docker compose up -d          # 2.7 seconds (the image was already there)
 Network m26en-quick-win_default  Creating
 Network m26en-quick-win_default  Created
 Container m26en-quick-win-broker-1  Creating
 Container m26en-quick-win-broker-1  Created
 Container m26en-quick-win-sender-1  Creating
 Container m26en-quick-win-sender-1  Created
 Container m26en-quick-win-broker-1  Starting
 Container m26en-quick-win-broker-1  Started
 Container m26en-quick-win-sender-1  Starting
 Container m26en-quick-win-sender-1  Started
$ docker compose ps
NAME                       IMAGE                            COMMAND                  SERVICE   CREATED         STATUS         PORTS
m26en-quick-win-broker-1   eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   broker    8 seconds ago   Up 7 seconds   127.0.0.1:6110->1883/tcp
m26en-quick-win-sender-1   eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   sender    8 seconds ago   Up 6 seconds   1883/tcp
$ docker compose logs sender
sender-1  | sent message 1
sender-1  | sent message 2
$ docker compose exec broker mosquitto_sub -h localhost -t 'practice/#' -v -C 2
practice/greet hello from the sender container, message 6
practice/greet hello from the sender container, message 7
$ docker compose down           # 1.6 seconds
```

The broker log (`docker compose logs broker`) starts with `mosquitto version 2.1.2 starting`, `Config loaded from
/mosquitto-no-auth.conf.`, `Opening ipv4 listen socket on port 1883.`, then every 2 seconds three lines for one message of the sender:
`New connection from 172.19.0.3:… on port 1883.`, `New client connected from … as auto-…`, `Client auto-… disconnected.`. The number in
front of every line (for example `1793236620`) is Mosquitto's kind of clock: the number of seconds since 1 January 1970. The line `Opening http api
listen socket on port 9883` = a new Mosquitto 2.1 feature inside the container; that counter isn't opened to the laptop. RAM: the broker ±12 MiB,
the sender ±0.9 MiB. The messages could also be read from the laptop's side on the lab counter (an MQTT client on the machine's network, in MQTTX's role).

## Traps seen in the lab

- **`init: true` in the sender service.** Without that line, `sh` becomes the first process in the container and ignores the stop signal, so
  `docker compose down` waits 10 seconds before killing it by force (lab: 11.8 seconds, with `init: true` 1.6 seconds).
- **`tmpfs`.** The Mosquitto image declares `/mosquitto/data` and `/mosquitto/log` as cupboards. Without `tmpfs`, every `up` makes
  nameless cupboards (long rows of letters and digits in `docker volume ls`) that are NOT removed by `docker compose down`.
- **`$$` in the sender's command** = a `$` sign for `sh`. With a single `$`, Compose fills in `$n` itself (from `.env` or the
  terminal's environment) before `sh` gets to see it: every `docker compose` command (`up` too) writes `level=warning msg="The \"n\" variable is not set.
  Defaulting to a blank string."` twice, and the message sent becomes `message ` without a number.
- Counter 1884 already in use? Change the left number in `ports` (for example `"127.0.0.1:1885:1883"`) and the port in MQTTX.
