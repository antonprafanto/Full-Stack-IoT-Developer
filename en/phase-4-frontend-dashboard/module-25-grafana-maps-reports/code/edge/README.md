# Mini Smart Home gateway — rebuild recipe

🌐 **English** · [Bahasa Indonesia](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/proyek-rumah-pintar-mini/edge/README.md)

The gateway is the Raspberry Pi that runs the Mini Smart Home MQTT broker 24 hours a day ([Module 12](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md)), and since [Module 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-13-node-red-dashboard/README.md) it also runs Node-RED with the dashboard and the fan automation (the automation has been switched off since [Module 16](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-3-backend-data/module-16-backend-typescript-api-git/README.md), because the brain has moved to the backend); since [Module 14](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-14-node-2-esp-now/README.md), that dashboard has a Garden card for Node 2, and since [Module 15](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-15-modbus-rs485-and-protocols/README.md), an RS-485 Sensor group for the RS-485 soil sensor that Node 1 reads. This page is its **main backup**: if the microSD card breaks, the gateway can be rebuilt from a blank card in about an hour with the recipe below. Fill in the table with your own gateway's details.

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
| Broker | Mosquitto 2.0.21 from the Debian package, systemd service `mosquitto`, settings in [`gateway-pi.conf`](../../../../mini-smart-home/edge/gateway-pi.conf) |
| Built | (date) |

## Files in this folder

| File | Used on | Contents |
| :--- | :--- | :--- |
| [`mosquitto-lan.conf`](../../../../mini-smart-home/edge/mosquitto-lan.conf) | the laptop ([Module 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md); locked in Module 21) | `mosquitto -v -c mosquitto-lan.conf` in a terminal |
| [`gateway-pi.conf`](../../../../mini-smart-home/edge/gateway-pi.conf) | the Pi gateway (Module 12; locked in Module 21) | on the Pi: `/etc/mosquitto/conf.d/gateway-pi.conf` |
| [`acl-broker`](acl-broker) | the Pi gateway and the laptop ([Module 21](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-3-backend-data/module-21-device-broker-security/README.md)) | the broker access list (ACL): a device only writes its own topics. On the Pi: `/etc/mosquitto/acl-broker` (OUTSIDE `conf.d`) |
| `broker-passwd` | the Pi gateway and the laptop (Module 21) | **not in Git** (`.gitignore`): the broker accounts' password file, made **on the broker machine** with `mosquitto_passwd` |
| [`node-red-flows.json`](../../../../mini-smart-home/edge/node-red-flows.json) | the Pi gateway (Module 13) | all the Node-RED flows; restored through **Import** in the editor (step 11) |

## Rebuild recipe

1. **Write the card** with Raspberry Pi Imager: **Raspberry Pi 5** → **Raspberry Pi OS (other)** → **Raspberry Pi OS Lite (64-bit)** → the microSD card. In **Customisation**: hostname `gateway`, **Capital city** set to **Jakarta (Indonesia)**, user `budi` with a strong password, the home Wi-Fi (the backup path), **Enable SSH** with **Use password authentication**, and **Raspberry Pi Connect** left off.
2. **Start** the Pi with a LAN cable to the router. From the laptop: `ssh budi@gateway.local`. Because the card is new, the laptop may refuse with `REMOTE HOST IDENTIFICATION HAS CHANGED!`; first run `ssh-keygen -R gateway.local` and `ssh-keygen -R 192.168.1.37` on the laptop (step 6 uses the IP address).
3. **Update** (steps 3–5 are typed on the Pi, in that SSH terminal, except the `ssh` command for logging in again, which is typed on the laptop): `sudo apt update`, then `sudo apt full-upgrade`, then `sudo reboot`. Wait about one minute, then log in again with `ssh budi@gateway.local`.
4. **Fixed address**. For Option A, make sure the reservation of `192.168.1.37` on the router uses this Pi's `eth0` MAC address (`ip link show eth0`; this address only changes if the Pi board itself is replaced); or Option B:

   ```bash
   sudo nmcli connection modify "netplan-eth0" ipv4.method manual ipv4.addresses 192.168.1.37/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.1
   ```

   then run `sudo nmcli connection up "netplan-eth0"`. If the name of the `eth0` connection in `nmcli device status` is different, use that name. An SSH terminal that goes over the cable may freeze when the address moves; close its window, then log in again with `ssh budi@192.168.1.37`.
5. **Install the broker**: `sudo apt install mosquitto mosquitto-clients`.
6. **Restore the broker settings** from this folder. On the laptop, from the `mini-smart-home` folder:

   ```bash
   scp edge/gateway-pi.conf budi@192.168.1.37:
   ```

   Then on the Pi:

   ```bash
   sudo cp ~/gateway-pi.conf /etc/mosquitto/conf.d/
   ```

   ```bash
   sudo systemctl restart mosquitto
   ```

7. **Test**: `systemctl status mosquitto` says `enabled` and `active (running)`; MQTTX on the laptop connects to `192.168.1.37:1883`; Node 1 greets the broker (`sudo tail -f /var/log/mosquitto/mosquitto.log`).

## Monthly check

| Command (on the Pi) | What to look for |
| :--- | :--- |
| `vcgencmd get_throttled` | `throttled=0x0`: never short of voltage, never overheated |
| `df -h /` | `Use%` below 80% |
| `systemctl list-units --failed` | `0 loaded units listed.` |
| `sudo apt update`, then `sudo apt full-upgrade` | updates installed; `sudo reboot` if there was a kernel update |

Every time the settings on the Pi change, copy the file to this folder again (`scp budi@192.168.1.37:/etc/mosquitto/conf.d/gateway-pi.conf edge/`), then make a commit.

## Locking the broker (Module 21)

Up to Module 20, the broker let anyone in without a password (`allow_anonymous true`). [Module 21](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-3-backend-data/module-21-device-broker-security/README.md) locks it: every program (device, backend, Node-RED, monitor) connects with its own account, and the access list (ACL) limits the topics each account may write or read. `gateway-pi.conf` and `mosquitto-lan.conf` already contain `allow_anonymous false`, `password_file`, `acl_file`, and `use_username_as_clientid true`.

- **The password file `broker-passwd`** holds a fingerprint (not the real password) of every account. It is made with `mosquitto_passwd` **on the machine where the broker runs** (on the Pi over SSH; a Mosquitto 2.1 password file on the laptop **can't** be used by the Pi's 2.0.21, and the other way around). The first account with `-c` (create the file), the rest without `-c`:

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

- **The mock Garden, the path without a Node 2 ([Module 25](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md)).** The simulator `tools/device-simulator.js` can run a fake Node 2 `f00d000000b2` whose data is published by the fake device `f00d00000001`. For the broker to allow it, open the block `2b) Laptop path (Module 25)` in `acl-broker`: delete `# ` (the hash and its space) in front of the three lines `user f00d00000001`, `topic write msh/f00d000000b2/telemetry`, and `topic write msh/f00d000000b2/status`, save, then **restart** the broker. Laptop broker (`mosquitto -v -c mosquitto-lan.conf`): **Ctrl + C**, then run the same command again. Broker on the Pi: copy `acl-broker` to the Pi as above, `sudo cp ~/acl-broker /etc/mosquitto/`, then `sudo systemctl restart mosquitto`. Readers with a real Node 2 don't need this block (leave it commented out). How to use the mock Garden is in `tools/README.md`.

Its traffic is still unencrypted: the key travels in the clear on the LAN (see `tools/sniffer.js`). That's fine for now on a closed home network, but TLS is a must before the broker is opened to the internet (Module 27) — don't set up port forwarding to the Pi.

## Node-RED and the dashboard (Module 13)

Node-RED runs on this same gateway, as the systemd service `nodered` ([Module 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-13-node-red-dashboard/README.md)). All its flows, that is, dashboard v0 (with the Garden card since Module 14 and the RS-485 Sensor group since Module 15) and the fan automation (switched off since Module 16, because Mini Smart Home's brain has moved to the backend), are saved in [`node-red-flows.json`](../../../../mini-smart-home/edge/node-red-flows.json). The editor password and the passphrase are never exported; never write them down here.

| Part | This gateway |
| :--- | :--- |
| Node-RED | 5.0.8, installed with the official `install-update-nodered-deb` script (together with Node.js 24), service `nodered`, editor `http://192.168.1.37:1880` |
| Editor user | `admin` (the password isn't recorded here) |
| Dashboard | FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) 1.33.0, `http://192.168.1.37:1880/dashboard/home` |
| Automation | switched off since Module 16: the four nodes of section 2 (fan on above 30 °C, off below 28 °C) are marked `"d": true` and look faded in the editor |

The recipe continues, after step 7 above:

8. **Install Node-RED** on the Pi, as `budi` and **without** `sudo`:

   ```bash
   bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
   ```

   Type `y` for the first question (within 30 seconds) and `n` for the *Pi-specific nodes*. In `node-red admin init`, answer exactly as in the Quick Win table of Module 13: `Share Anonymouse Usage Information` **No, do not send my usage data**; `Do you want to setup user security?` **Yes**, with **Username** `admin` and a new editor password; `Do you want to enable the Projects feature?` **No**; fill in a passphrase (keep it somewhere safe, not here); `Allow Function nodes to load external modules?` **No**; then press **Enter** for the other questions. Don't just press **Enter** for every question: the default choice for the usage data and for the external modules is `Yes`, and an empty passphrase makes the credentials get saved without encryption.
9. **Start the service**: `sudo systemctl enable --now nodered.service`.
10. **Install Dashboard 2**: on the laptop, open `http://192.168.1.37:1880` and log in. Main menu → **Manage palette** → the **Install** tab → search for `@flowfuse/node-red-dashboard` → click **install** on the package whose name is **exactly** that (not `@flowfuse/node-red-dashboard-2-…`) → click **Install** in the confirmation window.
11. **Restore the flows**: main menu → **Import** → **select a file to import** → choose `edge/node-red-flows.json` from the `mini-smart-home` folder on the laptop → **Import**, then **Deploy**.
12. **Test**: `systemctl status nodered` says `enabled` and `active (running)`; the phone opens the dashboard; the **Fan** switch moves the relay and slides over after the `ack` arrives; the **Garden** card fills in again as soon as Node 2 wakes up (within 5 minutes at most); the **RS-485 Sensor** group says `reading`, `no reading`, or `not in use`, depending on the sensor's state.

Every time the flows change, export them again from the editor (main menu → **Export** → **all flows** → **formatted** → **Download**), overwrite `edge/node-red-flows.json`, then make a commit.
