# Mini Smart Home gateway — rebuild recipe

🌐 **English** · [Bahasa Indonesia](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/proyek-rumah-pintar-mini/edge/README.md)

The gateway is the Raspberry Pi that runs the Mini Smart Home MQTT broker 24 hours a day ([Module 12](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md)), and since [Module 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-13-node-red-dashboard/README.md) it also runs Node-RED with the dashboard and the fan automation. This page is its **main backup**: if the microSD card breaks, the gateway can be rebuilt from a blank card in about an hour with the recipe below. Fill in the table with your own gateway's details.

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
| Broker | Mosquitto 2.0.21 from the Debian package, systemd service `mosquitto`, settings in [`gateway-pi.conf`](gateway-pi.conf) |
| Built | (date) |

## Files in this folder

| File | Used on | Contents |
| :--- | :--- | :--- |
| [`mosquitto-lan.conf`](mosquitto-lan.conf) | the laptop ([Module 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md)) | `mosquitto -v -c mosquitto-lan.conf` in a terminal |
| [`gateway-pi.conf`](gateway-pi.conf) | the Pi gateway (Module 12) | on the Pi: `/etc/mosquitto/conf.d/gateway-pi.conf` |
| [`node-red-flows.json`](node-red-flows.json) | the Pi gateway (Module 13) | all the Node-RED flows; restored through **Import** in the editor (step 11) |

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

## Node-RED and the dashboard (Module 13)

Node-RED runs on this same gateway, as the systemd service `nodered` ([Module 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-13-node-red-dashboard/README.md)). All its flows, that is, dashboard v0 and the fan automation, are saved in [`node-red-flows.json`](node-red-flows.json). The editor password and the passphrase are never exported; never write them down here.

| Part | This gateway |
| :--- | :--- |
| Node-RED | 5.0.8, installed with the official `install-update-nodered-deb` script (together with Node.js 24), service `nodered`, editor `http://192.168.1.37:1880` |
| Editor user | `admin` (the password isn't recorded here) |
| Dashboard | FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) 1.33.0, `http://192.168.1.37:1880/dashboard/home` |
| Automation | fan on above 30 °C, off below 28 °C |

The recipe continues, after step 7 above:

8. **Install Node-RED** on the Pi, as `budi` and **without** `sudo`:

   ```bash
   bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
   ```

   Type `y` for the first question (within 30 seconds) and `n` for the *Pi-specific nodes*. In `node-red admin init`, answer exactly as in the Quick Win table of Module 13: `Share Anonymouse Usage Information` **No, do not send my usage data**; `Do you want to setup user security?` **Yes**, with **Username** `admin` and a new editor password; `Do you want to enable the Projects feature?` **No**; fill in a passphrase (keep it somewhere safe, not here); `Allow Function nodes to load external modules?` **No**; then press **Enter** for the other questions. Don't just press **Enter** for every question: the default choice for the usage data and for the external modules is `Yes`, and an empty passphrase makes the credentials get saved without encryption.
9. **Start the service**: `sudo systemctl enable --now nodered.service`.
10. **Install Dashboard 2**: on the laptop, open `http://192.168.1.37:1880` and log in. Main menu → **Manage palette** → the **Install** tab → search for `@flowfuse/node-red-dashboard` → click **install** on the package whose name is **exactly** that (not `@flowfuse/node-red-dashboard-2-…`) → click **Install** in the confirmation window.
11. **Restore the flows**: main menu → **Import** → **select a file to import** → choose `edge/node-red-flows.json` from the `mini-smart-home` folder on the laptop → **Import**, then **Deploy**.
12. **Test**: `systemctl status nodered` says `enabled` and `active (running)`; the phone opens the dashboard; the **Fan** switch moves the relay and slides over after the `ack` arrives.

Every time the flows change, export them again from the editor (main menu → **Export** → **all flows** → **formatted** → **Download**), overwrite `edge/node-red-flows.json`, then make a commit.
