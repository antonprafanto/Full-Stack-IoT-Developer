# Mini Smart Home gateway — rebuild recipe

🌐 **English** · [Bahasa Indonesia](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/proyek-rumah-pintar-mini/edge/README.md)

The gateway is the Raspberry Pi that runs the Mini Smart Home MQTT broker 24 hours a day ([Module 12](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md)), and since [Module 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-13-node-red-dashboard/README.md) it also runs Node-RED with the dashboard and the fan automation (the automation has been switched off since [Module 16](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-3-backend-data/module-16-backend-typescript-api-git/README.md), because the brain has moved to the backend); since [Module 14](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-14-node-2-esp-now/README.md), that dashboard has a Garden card for Node 2, and since [Module 15](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-15-modbus-rs485-and-protocols/README.md), an RS-485 Sensor group for the RS-485 soil sensor that Node 1 reads. Since [Module 26](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-5-operations-scale/module-26-docker-compose/README.md), that broker runs as a **Docker container** ([`compose.edge.yml`](compose.edge.yml), the Compose project `smarthome-gateway`; the module calls the Pi **the gateway**), with the same accounts, port, and address, so the firmware doesn't change; the gateway broker forwards the device messages to the **central** broker on the laptop through a bridge. This page is its **main backup**: if the microSD card breaks, the gateway can be rebuilt from a blank card in about an hour with the recipe below. Fill in the table with your own gateway's details.

> [!CAUTION]
> **Never write a password** (the Pi's, the Wi-Fi's, or any other) in this file or anywhere else in the repository.

| Part | This gateway |
| :--- | :--- |
| Board | Raspberry Pi 5 (2 GB) |
| Card | 32 GB *high-endurance* microSD |
| Operating system | Raspberry Pi OS Lite (64-bit), release 2026-10-06 (the `Released:` date in Imager), Debian 13 "Trixie" (`cat /etc/os-release`) |
| Hostname | `gateway` |
| User | `budi` (the password isn't recorded here) |
| Fixed address | `192.168.1.37`, over the LAN cable (Option A: a reservation on the router / Option B: `nmcli`) |
| Docker | Docker Engine 29 from Docker's apt repository (the Debian guide) + the `docker compose` plugin |
| Broker | Mosquitto 2.1.2 in a container (`eclipse-mosquitto:2.1.2-alpine`, [`compose.edge.yml`](compose.edge.yml) + [`gateway.conf`](gateway.conf)), since Module 26; before that Mosquitto 2.0.21 from the Debian package, systemd service `mosquitto`, [`gateway-pi.conf`](gateway-pi.conf) |
| Central broker (the bridge's target) | laptop `192.168.1.20`, counter 1883 (`CENTER_ADDRESS` in `edge/.env`) |
| Built | (date) |

## Files in this folder

| File | Used on | Contents |
| :--- | :--- | :--- |
| [`compose.edge.yml`](compose.edge.yml) | the Pi gateway (Module 26) | the `mosquitto` service (the gateway broker + the bridge); `cloudflared` (profile `tunnel`, Module 27) and `nodered` (profile `nodered`, optional) are only written, not started |
| [`.env.example`](.env.example) | the Pi gateway (Module 26) | the example of `edge/.env`: `COMPOSE_FILE=compose.edge.yml`, `CENTER_ADDRESS` (the center laptop's IP), `PORT_GATEWAY`. `edge/.env` is **not in Git** |
| [`gateway.conf`](gateway.conf) | the Pi gateway (Module 26) | the gateway broker's settings inside the container: accounts, ACL, persistence, log to the container's screen, the `bridge/` folder |
| [`center.conf`](center.conf) | the laptop (Module 26) | the CENTRAL broker's settings inside the container (the `mosquitto` service in `compose.cloud.yml` at the project root) |
| [`bridge.example.conf`](bridge.example.conf) | the Pi gateway (Module 26) | an example bridge gateway → center (the `pi-bridge` account, without a password); its copy `bridge/center.conf` holds the password and is **not in Git** |
| [`bridge/`](bridge/README.md) | the Pi gateway (Module 26) | the folder the gateway broker reads (`include_dir`); only its `README.md` is in Git |
| [`acl-broker`](acl-broker) | the gateway and central brokers ([Module 21](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-3-backend-data/module-21-device-broker-security/README.md); block `7) pi-bridge` since Module 26) | the broker access list (ACL): a device only writes its own topics. Both containers read it straight from this folder (read-only) |
| `broker-passwd` | the gateway and central brokers (Module 21) | the broker accounts' password file. Since Module 26 it lives in each broker's **cupboard** (volume) (`/mosquitto/data/broker-passwd` inside the container), made with `mosquitto_passwd` inside the container; never in Git |
| [`gateway-pi.conf`](gateway-pi.conf) | the Pi gateway **without Docker** (before Module 26; Module 12, locked in Module 21) | on the Pi: `/etc/mosquitto/conf.d/gateway-pi.conf`; kept for a Pi that hasn't moved yet and as a way back |
| [`mosquitto-lan.conf`](mosquitto-lan.conf) | the laptop **without Docker** (before Module 26; [Module 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md), locked in Module 21) | `mosquitto -v -c mosquitto-lan.conf` in a terminal; since Module 26 replaced by the Compose central broker |
| [`node-red-flows.json`](node-red-flows.json) | the Pi gateway (Module 13) | all the Node-RED flows; restored through **Import** in the editor (step 13) |

## Rebuild recipe

1. **Write the card** with Raspberry Pi Imager: **Raspberry Pi 5** → **Raspberry Pi OS (other)** → **Raspberry Pi OS Lite (64-bit)** → the microSD card. In **Customisation**: hostname `gateway`, **Capital city** set to **Jakarta (Indonesia)**, user `budi` with a strong password, the home Wi-Fi (the backup path), **Enable SSH** with **Use password authentication**, and **Raspberry Pi Connect** left off.
2. **Start** the Pi with a LAN cable to the router. From the laptop: `ssh budi@gateway.local`. Because the card is new, the laptop may refuse with `REMOTE HOST IDENTIFICATION HAS CHANGED!`; first run `ssh-keygen -R gateway.local` and `ssh-keygen -R 192.168.1.37` on the laptop (step 6 uses the IP address).
3. **Update** (steps 3–9 are typed on the Pi, in that SSH terminal, except the `ssh` command for logging in again, which is typed on the laptop): `sudo apt update`, then `sudo apt full-upgrade`, then `sudo reboot`. Wait about one minute, then log in again with `ssh budi@gateway.local`.
4. **Fixed address**. For Option A, make sure the reservation of `192.168.1.37` on the router uses this Pi's `eth0` MAC address (`ip link show eth0`; this address only changes if the Pi board itself is replaced); or Option B:

   ```bash
   sudo nmcli connection modify "netplan-eth0" ipv4.method manual ipv4.addresses 192.168.1.37/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.1
   ```

   then run `sudo nmcli connection up "netplan-eth0"`. If the name of the `eth0` connection in `nmcli device status` is different, use that name. An SSH terminal that goes over the cable may freeze when the address moves; close its window, then log in again with `ssh budi@192.168.1.37`.
5. **Install Docker Engine** from Docker's apt repository, following the official **Debian** page (<https://docs.docker.com/engine/install/debian/>, the section *Install using the apt repository*): the 64-bit Raspberry Pi OS is Debian, while the "Raspberry Pi OS" page on Docker's site is only for 32-bit (`dpkg --print-architecture` must answer `arm64`). That page first asks you to remove the conflicting default packages (`docker.io docker-compose docker-doc docker-buildx podman-docker containerd runc`), install Docker's key and repository source, then `sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`. We don't use the `get.docker.com` script (its official docs: not recommended for machines in real use). After installing: `sudo usermod -aG docker $USER`, leave SSH and log in again, then check `docker version` and `docker compose version`. The `docker` group equals **root**: only for the Pi's own user. Docker starts by itself every time the Pi starts.
6. **Get the project and prepare its settings**: `sudo apt install git` (if it isn't there yet), `git clone https://github.com/YOUR-USERNAME/mini-smart-home.git` (your repo), then `cd mini-smart-home/edge`. Copy `.env.example` to `.env` (`cp .env.example .env`), fill in `CENTER_ADDRESS` with the IP of the laptop that runs `compose.cloud.yml` (a fixed address in the router), then `chmod 600 .env`. Copy the bridge example: `cp bridge.example.conf bridge/center.conf`, replace `replace-with-the-pi-bridge-account-password` with the password of the `pi-bridge` account (that account is made on the **central** broker, see Locking the broker), then `chmod 600 bridge/center.conf`.
7. **The broker password file into the gateway cupboard.** An old Pi moving from the apt Mosquitto: copy its password file (the Mosquitto 2.0 format is read by Mosquitto 2.1.2 as it is), then stop the old broker so that counter 1883 is free:

   ```bash
   sudo cat /etc/mosquitto/broker-passwd | docker compose run --rm -T --no-deps mosquitto sh -c 'cat > /mosquitto/data/broker-passwd && chmod 600 /mosquitto/data/broker-passwd'
   ```

   ```bash
   sudo systemctl disable --now mosquitto
   ```

   A new card (the old file is gone with the card): make the first account in the gateway cupboard with `docker compose run --rm --no-deps -u mosquitto mosquitto mosquitto_passwd -c /mosquitto/data/broker-passwd nodered` (the password is typed twice; `-c` = create a new file), then the device accounts and the other accounts after the broker is running (Locking the broker). The way back if something goes wrong: `docker compose down`, then `sudo systemctl enable --now mosquitto` (the old apt broker starts again with its old file).
8. **Start it**: `docker compose up -d` (from the `edge` folder; the `COMPOSE_FILE` line in `.env` makes `-f compose.edge.yml` unnecessary).
9. **Test**: `docker compose ps` shows `mosquitto` `Up`; `docker compose logs mosquitto` writes `Connecting bridge center (center:1883)`, and on the laptop `docker compose logs mosquitto` (project root) writes `New bridge connected … as pi-bridge`; MQTTX on the laptop connects to `192.168.1.37:1883`; Node 1 greets the gateway broker (`docker compose logs -f mosquitto`, **Ctrl + C** only stops reading).

## Monthly check

| Command (on the Pi) | What to look for |
| :--- | :--- |
| `vcgencmd get_throttled` | `throttled=0x0`: never short of voltage, never overheated |
| `df -h /` | `Use%` below 80% |
| `systemctl list-units --failed` | `0 loaded units listed.` |
| `docker compose ps` (in the `edge` folder) | `mosquitto` `Up`, not `Restarting` |
| `docker system df` | reasonable image and cupboard sizes; each container's log is already limited to 3 × 10 MB by `compose.edge.yml`. Don't run an automatic prune |
| `sudo apt update`, then `sudo apt full-upgrade` | updates installed (Docker Engine from Docker's repository too); `sudo reboot` if there was a kernel update. `restart: unless-stopped` containers start again by themselves after a reboot |

Since Module 26, the gateway broker's settings live in the repo cloned on the Pi: change `gateway.conf` or `acl-broker` on the laptop, commit and push, then on the Pi `git pull` and `docker compose restart mosquitto`. Without Docker (before Module 26): copy the file from the Pi again (`scp budi@192.168.1.37:/etc/mosquitto/conf.d/gateway-pi.conf edge/`), then make a commit.

## Locking the broker (Module 21)

Up to Module 20, the broker let anyone in without a password (`allow_anonymous true`). [Module 21](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-3-backend-data/module-21-device-broker-security/README.md) locks it: every program (device, backend, Node-RED, monitor) connects with its own account, and the access list (ACL) limits the topics each account may write or read. `gateway.conf`, `center.conf`, `gateway-pi.conf`, and `mosquitto-lan.conf` all contain `allow_anonymous false`, `password_file`, `acl_file`, and `use_username_as_clientid true`.

**Since Module 26 (the broker in a container)**, the commands are typed from the folder of its Compose project: the `edge` folder on the Pi for the gateway broker, the project root on the laptop for the central broker. The password file lives in that broker's cupboard, so `mosquitto_passwd` runs **inside the container**, as the user `mosquitto` (the file's owner; without `-u mosquitto`, `mosquitto_passwd` warns `owner is not root`):

```bash
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd a4cf12e5b7c0
```

```bash
docker compose restart mosquitto
```

The password is typed twice (it doesn't show). Revoking an account: `docker compose exec -u mosquitto mosquitto mosquitto_passwd -D /mosquitto/data/broker-passwd <device_id>`, then `restart`. In a container, **always `docker compose restart mosquitto`** after changing an account, `acl-broker`, or a `*.conf` (a restart reads the file the editor has just saved; don't use `docker compose kill -s SIGHUP` as a reload: Docker treats it as a manual stop). Accounts per broker:

- **The gateway broker (Pi):** the device accounts (`device_id`), `nodered`, `monitor`, `checker`. It doesn't need the `backend` account any more: the backend now connects to the central broker.
- **The central broker (laptop):** `backend` (made automatically by the `broker-account` service from `MQTT_PASSWORD` in the root `.env`), `pi-bridge` (its password is also written in `edge/bridge/center.conf` on the Pi; its rights are block `7) pi-bridge` in `acl-broker`), and the `tools/` simulator devices for the laptop path.

**Without Docker (before Module 26)**, the steps are as below.

- **The password file `broker-passwd`** holds a fingerprint (not the real password) of every account. It is made with `mosquitto_passwd` **on the machine where the broker runs** (on the Pi over SSH; a Mosquitto 2.1 password file on the laptop **can't** be used by Mosquitto 2.0.21, but the Module 26 Mosquitto 2.1.2 in a container reads both the 2.0 and the 2.1 format). The first account with `-c` (create the file), the rest without `-c`:

  ```bash
  sudo mosquitto_passwd -c /etc/mosquitto/broker-passwd backend
  sudo mosquitto_passwd /etc/mosquitto/broker-passwd nodered
  sudo mosquitto_passwd /etc/mosquitto/broker-passwd monitor
  ```

  Then one account for each device (username = `device_id`), paste the 43-character key from the `POST /devices` answer twice:

  ```bash
  sudo mosquitto_passwd /etc/mosquitto/broker-passwd a4cf12e5b7c0
  ```

  `mosquitto_passwd -b file name password` puts the password straight on the command line — avoid it, because the password stays in the terminal history. Revoking an account: `sudo mosquitto_passwd -D /etc/mosquitto/broker-passwd <device_id>`.

- **File permissions (Pi).** Mosquitto 2.0 drops its privileges to the `mosquitto` user right after reading the configuration, so `broker-passwd` and `acl-broker` must be readable by it:

  ```bash
  sudo chown mosquitto:mosquitto /etc/mosquitto/broker-passwd /etc/mosquitto/acl-broker
  sudo chmod 600 /etc/mosquitto/broker-passwd /etc/mosquitto/acl-broker
  ```

- **Copy the ACL** to the Pi (outside `conf.d` so it isn't read as a setting): `scp edge/acl-broker budi@192.168.1.37:` then `sudo cp ~/acl-broker /etc/mosquitto/`. `acl-broker` may go into Git (no secrets); `broker-passwd` never.

- **Restart, not reload, every time the ACL changes** (`sudo systemctl restart mosquitto`): on Mosquitto 2.0.21, an ACL file with a typo that is then *reloaded* makes the broker run **with no ACL at all**, while a typo on *restart* makes the service fail to start — clearly visible in `systemctl status`. **Adding or removing an account only** (the password file) only needs `sudo systemctl reload mosquitto`; a client whose key was just revoked is disconnected at once. A safe order: make the `backend` and `nodered` accounts **before** locking, so neither is refused right away.

- **The account for each program.** Backend: `backend` (`.env`, `MQTT_USERNAME`/`MQTT_PASSWORD`). Node-RED: `nodered`, filled in on the **Security** tab of the broker node (double-click the "Mosquitto on the gateway" node → **Security** → Username `nodered` + Password → **Done** → **Deploy**); those credentials are stored encrypted in `flows_cred.json`, **not** in `node-red-flows.json`, so exporting the flows stays safe. MQTTX for monitoring: the `monitor` account (may read `msh/#` and `$SYS/#`, may not write). The `contract-checker.js` tool: the `checker` account (reads `msh/#` only).

- **The mock Garden, the path without a Node 2 ([Module 25](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md)).** The simulator `tools/device-simulator.js` can run a fake Node 2 `f00d000000b2` whose data is published by the fake device `f00d00000001`. For the broker to allow it, open the block `2b) Laptop path (Module 25)` in `acl-broker`: delete `# ` (the hash and its space) in front of the three lines `user f00d00000001`, `topic write msh/f00d000000b2/telemetry`, and `topic write msh/f00d000000b2/status`, save, then **restart** the broker. The Compose central broker (Module 26, the laptop path): `docker compose restart mosquitto` from the project root. Before Module 26: the laptop broker (`mosquitto -v -c mosquitto-lan.conf`) **Ctrl + C**, then run the same command again; the broker on the Pi: copy `acl-broker` to the Pi as above, `sudo cp ~/acl-broker /etc/mosquitto/`, then `sudo systemctl restart mosquitto`. Readers with a real Node 2 don't need this block (leave it commented out). How to use the mock Garden is in `tools/README.md`.

Its traffic is still unencrypted: the key travels in the clear on the LAN (see `tools/sniffer.js`), and so does the gateway → center bridge (Module 26). That's fine for now on a closed home network, but TLS is a must before the broker is opened to the internet (Module 27) — don't set up port forwarding to the Pi or to the laptop. The Module 26 bridge also doesn't yet hold messages while the central broker is down (a sleeping laptop = the telemetry of that time is lost); the bridge's queue and TLS follow in Module 27.

## Node-RED and the dashboard (Module 13)

Node-RED runs on this same gateway, as the systemd service `nodered` ([Module 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-13-node-red-dashboard/README.md)). All its flows, that is, dashboard v0 (with the Garden card since Module 14 and the RS-485 Sensor group since Module 15) and the fan automation (switched off since Module 16, because Mini Smart Home's brain has moved to the backend), are saved in [`node-red-flows.json`](node-red-flows.json). The editor password and the passphrase are never exported; never write them down here.

| Part | This gateway |
| :--- | :--- |
| Node-RED | 5.0.8, installed with the official `install-update-nodered-deb` script (together with Node.js 24), service `nodered`, editor `http://192.168.1.37:1880` |
| Editor user | `admin` (the password isn't recorded here) |
| Dashboard | FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) 1.33.0, `http://192.168.1.37:1880/dashboard/home` |
| Automation | switched off since Module 16: the four nodes of section 2 (fan on above 30 °C, off below 28 °C) are marked `"d": true` and look faded in the editor |

Since Module 26, Node-RED **stays** a systemd service: the broker node in the flows (`localhost:1883`) now connects to the gateway broker in the container through the Pi's counter 1883, with the `nodered` account from the password file moved in step 7. Node-RED in a container (the `nodered` profile in `compose.edge.yml`) is optional and not used yet: before starting it, the systemd `nodered` service must be stopped (counter 1880 clashes), the flows and their credentials moved, and the broker address in the flows changed from `localhost` to `mosquitto`.

The recipe continues, after step 9 above:

10. **Install Node-RED** on the Pi, as `budi` and **without** `sudo`:

   ```bash
   bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
   ```

   Type `y` for the first question (within 30 seconds) and `n` for the *Pi-specific nodes*. In `node-red admin init`, answer exactly as in the Quick Win table of Module 13: `Share Anonymouse Usage Information` **No, do not send my usage data**; `Do you want to setup user security?` **Yes**, with **Username** `admin` and a new editor password; `Do you want to enable the Projects feature?` **No**; fill in a passphrase (keep it somewhere safe, not here); `Allow Function nodes to load external modules?` **No**; then press **Enter** for the other questions. Don't just press **Enter** for every question: the default choice for the usage data and for the external modules is `Yes`, and an empty passphrase makes the credentials get saved without encryption.
11. **Start the service**: `sudo systemctl enable --now nodered.service`.
12. **Install Dashboard 2**: on the laptop, open `http://192.168.1.37:1880` and log in. Main menu → **Manage palette** → the **Install** tab → search for `@flowfuse/node-red-dashboard` → click **install** on the package whose name is **exactly** that (not `@flowfuse/node-red-dashboard-2-…`) → click **Install** in the confirmation window.
13. **Restore the flows**: main menu → **Import** → **select a file to import** → choose `edge/node-red-flows.json` from the `mini-smart-home` folder on the laptop → **Import**, then **Deploy**.
14. **Test**: `systemctl status nodered` says `enabled` and `active (running)`; the phone opens the dashboard; the **Fan** switch moves the relay and slides over after the `ack` arrives; the **Garden** card fills in again as soon as Node 2 wakes up (within 5 minutes at most); the **RS-485 Sensor** group says `reading`, `no reading`, or `not in use`, depending on the sensor's state.

Every time the flows change, export them again from the editor (main menu → **Export** → **all flows** → **formatted** → **Download**), overwrite `edge/node-red-flows.json`, then make a commit.
