# Module 26 warm-up: just-enough Docker & YAML

Material for the 🔁 Module 26 warm-up (±35 minutes, 5 steps). Nothing is started, deleted, or changed in these steps:
everything only **reads** the state of your laptop and practices writing YAML.

| File | What it holds |
| :--- | :--- |
| [`inventory.md`](inventory.md) | your home's inventory sheet (containers, cupboards, hallways, counters, the old database container's settings) to fill in |
| [`practice.yaml`](practice.yaml) | a small Compose file for practicing YAML and variables; only read with `docker compose … config`, never started |
| [`practice.env`](practice.env) | example variables for `practice.yaml` (no secrets) |

## Steps

1. **Your home's inventory** (sheet part 1): `docker ps -a`, `docker volume ls`, `docker network ls`, `docker image ls`, `docker system
   df`. Write down the names of the containers, cupboards, and hallways that already exist. Why: Practice 4 takes over these
   `smarthome-data` and `smarthome-grafana-data` cupboards, and clashing names are the most common cause of errors in Module 26.
2. **Who uses a counter?** (sheet part 2). What Docker opens shows in `docker ps --format 'table {{.Names}}\t{{.Ports}}'`.
   Other programs (an old laptop broker, `npm run dev`, IIS):
   - Linux / Raspberry Pi: `ss -ltnp` (the fourth column = address:counter; add `sudo` to see the names of other users' programs).
   - macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(not tested by the author)*.
   - Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,1883,3000,5173,5432,8080` *(not tested by the author)*.
3. **YAML from scratch** with `practice.yaml`. Read its comments from top to bottom, then from this folder:
   `docker compose -f practice.yaml config`. Compose stops, because `OWNER` is required (the `${OWNER:?…}` form). Then try the
   YAML trap in your own copy of the file: replace the two spaces in front of `image:` with one Tab, run `config` again, read the
   error, put it back.
4. **Environment variables** (following Module 16 `--env-file` and Module 20 Zod): `docker compose -f practice.yaml --env-file practice.env
   config`. Compare what is written in the file with what Compose prints: `${GREETING:-hello}` becomes `good morning`, `CITY` is empty
   with a warning, an unquoted `007` becomes `"7"`, an unquoted `1.10` becomes `"1.1"`. Then change `GREETING` in `practice.env`
   to the empty line `GREETING=` and see the default `hello` used.
5. **The old database container's settings** (sheet part 3): the five `docker inspect --format …` commands on the inventory sheet.
   The environment-variable command deliberately prints only the variable NAMES: `docker inspect smarthome-db` without `--format`
   prints the content of `POSTGRES_PASSWORD` as it is, so don't paste it into a forum or an AI.

## Expected output (the author's lab)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 29 Oct 2026 ±08:14 WIB. The time before the warnings is cut.

```text
$ docker compose -f practice.yaml config
level=warning msg="The \"CITY\" variable is not set. Defaulting to a blank string."
error while interpolating services.greet.environment.OWNER: required variable OWNER is missing a value: fill in OWNER in practice.env

$ docker compose -f practice.yaml --env-file practice.env config
level=warning msg="The \"CITY\" variable is not set. Defaulting to a blank string."
name: practice-yaml
services:
  greet:
    command:
      - sh
      - -c
      - echo $$GREETING, $$OWNER
    environment:
      CITY: ""
      CODE: "007"
      CODE_UNQUOTED: "7"
      GREETING: good morning
      OWNER: Budi
      TELEMETRY: "off"
      VERSION: "1.10"
      VERSION_UNQUOTED: "1.1"
    image: eclipse-mosquitto:2.1.2-alpine
    logging:
      driver: json-file
      options:
        max-file: "3"
        max-size: 10m
    networks:
      default: null
    ports:
      - mode: ingress
        host_ip: 127.0.0.1
        target: 1883
        published: "1885"
        protocol: tcp
networks:
  default:
    name: practice-yaml_default
```

The `CITY` warning line of the first command sometimes shows and sometimes doesn't (in the author's lab: 10 of 30 times). Compose
stops at the first required variable it meets, and the order of its checks is random. What is always there is the line `error while
interpolating … OWNER …`. With the second command (with `--env-file`), the `CITY` warning always shows.

Notice: Compose sorts the keys alphabetically, drops the comments, and writes the counter `"127.0.0.1:1885:1883"` in its long
form (`host_ip`, `published`, `target`). The YAML errors in a copy of `practice.yaml` (Compose 2.40.3):

| Mistake | Error text |
| :--- | :--- |
| A Tab in front of `image:` (step 3) | `yaml: line 18: found character that cannot start any token` (line 18 = the `image:` line) |
| `ports:` indented one space too far | `yaml: line 17: did not find expected key` |
| `0x1F` / `1e3` without quotes | read as numbers: `"31"` / `"1000"` (no error) |
| `off`, `on`, `yes`, `no`, `true` without quotes | stay the text `"off"`, `"on"`, `"yes"`, `"no"`, `"true"` in Compose 2.40.3 (YAML 1.2), no error |
| a key without content (`EMPTY:`) or `~` | `null` (no value), no error |

The line number and the error text depend on where the mistake is; what's certain is that Compose always names the line number.
Start checking from that line and the line right above it.

The `docker inspect --format …` commands on the inventory sheet were tested by the author on a Module 17-style practice container
(bash on Linux). The quotes in PowerShell and CMD can differ and were **not tested by the author**; if a command writes `template
parsing error`, run it from Git Bash, or just run `docker inspect smarthome-db` and look for the `RestartPolicy`, `Mounts`, and
`PortBindings` parts by eye (without sharing the `Env` part).
