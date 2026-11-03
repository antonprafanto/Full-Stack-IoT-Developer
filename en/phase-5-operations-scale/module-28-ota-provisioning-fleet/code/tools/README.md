# 🧰 Mini Smart Home helper tools

🌐 **English** · [Bahasa Indonesia](../../../../../fase-5-operasi-skala/modul-28-ota-provisioning-fleet/kode/alat/README.md)

This folder contains small Node.js programs that you create in [Module 4](../../../../phase-0-foundations/module-04-javascript-nodejs/README.md), [Module 11](../../../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md), [Module 16](../../../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md), [Module 19](../../../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md), [Module 20](../../../../phase-3-backend-data/module-20-user-security/README.md), and [Module 21](../../../../phase-3-backend-data/module-21-device-broker-security/README.md) (the simulator is updated again in [Module 24](../../../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md) and [Module 25](../../../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md)), then use again and again in later modules. All of them have been tested with **Node.js 24.21.0**. The first three need no libraries from npm; `contract-checker.js` and `device-simulator.js` need the **mqtt** 5.16.1 library, and `live-terminal.js` needs **socket.io-client** 4.8.4 (see "How to use").

| File | What it does | Used again in |
| :--- | :--- | :--- |
| [`generate-dummy.js`](../../../../mini-smart-home/tools/generate-dummy.js) | Generates fake sensor readings shaped exactly like the [data contract](../../../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract). Run it directly to write `data/readings.json`, or borrow its function: `import { buildTelemetry } from "./generate-dummy.js";` | Module 10 (test data before the sensors are ready), Module 16 (a device simulator for the backend), Module 22 (the dashboard before there are real sensors) |
| [`webhook-receiver.js`](../../../../mini-smart-home/tools/webhook-receiver.js) | A mini server on port 3000 that prints everything it receives and replies with `{"ok":true}`. | Module 10 (the ESP32 sends its first reading over Wi-Fi to your laptop), then Module 22 as a test receiver |
| [`send-data.js`](../../../../mini-smart-home/tools/send-data.js) | A test sender: it pretends to be an ESP32 and sends 3 readings to `http://localhost:3000/telemetry`. | Module 10, to test a receiver without a board |
| [`contract-checker.js`](contract-checker.js) | The data contract's security guard: it subscribes to `msh/#` on the MQTT broker, then stamps every message **PASS** or **FAIL** according to [`DATA-CONTRACT.md`](../DATA-CONTRACT.md), with the reasons and how long each `ack` reply took. | Module 11 (a Node 1 v1.2 completion requirement), Module 14 (version 1.1: Node 2's `telemetry` is checked against its own fields), Module 15 (version 1.2: the three RS-485 sensor fields in Node 1's `telemetry`), Module 19 (version 1.3: `state` in `telemetry` and `ack`, the offline-mode report in `vitals`, the content of `config`, a retained `set`), Module 21 (version 1.4: it connects to a locked broker with the `checker` account from `tools/.env`; the address may carry a port), Module 28 (version 1.6: `reset_reason` + `fw` + the `ota` report in `vitals`, the `update` command and `intervals` in `config`; a retained `update` is marked FAIL), then every time the firmware changes or a new device is added |
| [`device-simulator.js`](device-simulator.js) | Ten fake devices (`f00d00000001` to `f00d00000010`) that speak MQTT exactly as the data contract says: the `online`/`offline` status (through the *Last Will*), `telemetry` every 10 seconds from `buildTelemetry()` (since Module 19 with `state` and an immediate send when an actuator changes), `vitals` on connecting and every 5 minutes, and an `ack` answer to every command, `config` included (stored in `data/simulator-store.json`). Since Module 19, the temperature can be set from the terminal (`temp 33`, `temp random`), and when the broker is unreachable for 2 minutes, the simulator enters offline mode, runs the safety fan, then reports through `vitals` about 10 seconds after it reconnects. Since Module 21, each fake device connects to the broker with its own account (username = `device_id`, the key from `tools/.env`); a device with no key is not started, and a key the broker rejects is retried 60 seconds later. Since Module 24, the soil moisture and the tank level can be set from the terminal too (`soil 25`, `tank 15`), and a pump command is refused like on Node 1 (`pump refused: tank water too low`) when the tank is below 20%. Since Module 25, the first fake device can also carry the **mock Garden** `f00d000000b2`, a fake Node 2 whose data it publishes the way a real Node 1 publishes Node 2's data (`garden start`, `garden pull`, `garden insert`). The `clean` mode deletes their retained status from the broker. | Module 16 (testing the backend without a board), Module 19 (automation rules and the "broker off" test), Module 24 (the "water if soil < 30%" rule and a refused pump button, without Kit A), Module 25 (the "silent node" alert and "pull out Node 2's battery" without Kit B), Module 28 (SIMULATED firmware updates, a simulated rollback, claim codes, and a fleet of many devices, without a board), then every module that needs many devices |
| [`make-fake-bin.js`](make-fake-bin.js) | Makes **FAKE** `.bin` files (not firmware) to practice firmware updates without a board: the first byte `0xE9` and the text "NOT REAL FIRMWARE", a default size of 1,196,032 bytes, the `--test` option for rollback practice. It needs no npm library; its test is `node --test make-fake-bin.test.js`. See "Fake firmware files for the path without a Kit (Module 28)" below. | Module 28 (the path without a Kit: uploaded on the Fleet screen, then "installed" by the simulated devices of the simulator) |
| [`live-terminal.js`](../../../../mini-smart-home/tools/live-terminal.js) | A "small terminal" that connects to the backend through Socket.IO, follows one device (`follow`), then shows each of its readings as soon as it arrives, the status changes of every device, and the event log. It reconnects by itself when the backend restarts. Since Module 20, this terminal first logs in with the account from `tools/.env` (a `viewer` account is enough), then renews its wristband by itself (refresh) every time the server cuts it off because it expired. | Module 19, Module 20 (Socket.IO locked), then Module 23 (the live dashboard uses the same events) |

## How to use

Open this `tools` folder in a terminal (for example, **Terminal → New Terminal** in VS Code, then `cd tools`), then:

```bash
node generate-dummy.js 3
```

```bash
node webhook-receiver.js
```

Leave the receiver running, then open a second terminal (**Terminal → Split Terminal**). Glance at its prompt: if it doesn't end with `tools` yet (usually on Windows), type `cd tools` first; if it already does (usually on macOS and Linux), go straight ahead. Then run:

```bash
node send-data.js
```

Stop the receiver with **Ctrl + C**. A full explanation of every line is in Module 4, Practice 4 and Practice 9.

For `contract-checker.js`, install its library once (in this `tools` folder), then run it while the MQTT broker is on:

```bash
npm install mqtt@5.16.1
```

Since Module 21, the home broker is locked, so the checker and the simulator need a broker account. Since Module 26, the laptop broker is the **central broker** of Docker Compose (the `mosquitto` service in `compose.cloud.yml`; from this laptop its address is `127.0.0.1:1883`): its accounts are made inside the container, from the project root, with `docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd checker` (then the practice device account, for example `f00d00000001`, with its key), then `docker compose restart mosquitto`. Data from the Pi gateway broker also reaches the central broker through the bridge, so a checker connected to the central broker sees the real devices' messages too. Copy `.env.example` to `.env` in this `tools` folder (if you haven't yet), then fill in `CHECKER_KEY` with the password of the `checker` account (an account that may only read `msh/#`, made on the broker with `mosquitto_passwd`) and `KEY_F00D00000001` with the practice device's key from the `POST /devices` answer in the backend. The `.env` file doesn't go into Git. Run both with `--env-file=.env`:

```bash
node --env-file=.env contract-checker.js
```

With nothing added, the checker connects to the broker on the same laptop (`127.0.0.1`; since Module 26 = the Compose central broker) and checks every `msh/#` topic; for a broker on another computer, add its address, for example `node --env-file=.env contract-checker.js 192.168.1.10`, and for a port other than 1883 add the port too, for example `127.0.0.1:1884`. If the broker rejects its account, the checker stops with the message `Broker 127.0.0.1:1883 rejected the checker account (code 5). …`. On a public broker (the Wokwi path), also add your device's `device_id` so only its messages are checked, for example `node contract-checker.js broker.emqx.io 240ac45e114b` (without `--env-file`: that public broker isn't locked). Stop it with **Ctrl + C**; before stopping, it prints a PASS/FAIL summary. The explanation is in Module 11, Practice 8, and Module 21.

The simulator uses the same library. Write the broker's full address (starting with `mqtt://`) after its file name: since Module 26 usually the central broker on this laptop, `mqtt://127.0.0.1:1883` (before, the Pi's broker, for example `mqtt://192.168.1.37:1883`, which you may still use: its data reaches the center through the bridge). The second value (optional) is the number of fake devices, for example `1`. Only devices whose key is in `tools/.env` (`KEY_F00D00000001=…`, `KEY_F00D00000002=…`, and so on) are started; the others are skipped with the message `no key in tools/.env`. Run it like this, then stop it with **Ctrl + C** when you're done:

```bash
node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 1
```

**To a broker on the internet (Module 27, the center on a VPS).** The same simulator can connect straight to the VPS's TLS door, without changing its code: write `mqtts://` (not `mqtt://`), the broker's **name** (not an IP: its certificate is only valid for that name), and port 8883. The account and key of every fake device must exist on the VPS broker (`mosquitto_passwd` on the VPS) and the device must be registered in the VPS backend. Node.js checks the VPS certificate against its built-in list of CA roots, which already holds the Let's Encrypt root (ISRG Root X1), so no CA file is needed:

```bash
node --env-file=.env device-simulator.js mqtts://mqtt.yourname.my.id:8883 1
```

In the author's lab (a simulated VPS and a stand-in for Let's Encrypt, Pebble), Node was given the stand-in root CA through `NODE_EXTRA_CA_CERTS=<root file>`; the result was `f00d00000001: online`, and the VPS broker log wrote `Client f00d00000001 negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384`. Not tested by the author with real Let's Encrypt yet. `contract-checker.js` still only speaks plain (`mqtt://`): run it on the same network as the broker.

If the broker rejects a fake device's key (the key is wrong, not yet installed on the broker, or revoked), the simulator writes `f00d00000001: REJECTED by broker (code 5): wrong key, not registered, or revoked. Retrying in 60 seconds.` and retries every 60 seconds.

The word `clean` in the place of the second value deletes the fake devices' retained status from the broker (each device connects with its own account), then the program ends by itself. Since Module 25, the mock Garden's status is deleted too, through `f00d00000001` (only if the Garden's ACL block is open). The retained `config` on the `cmd` topic is not deleted: only the `backend` and `nodered` accounts may write `cmd`, and that config can only be read by the device itself.

```bash
node --env-file=.env device-simulator.js mqtt://127.0.0.1:1883 clean
```

While the simulator runs, type `temp 33` and then **Enter** in the same terminal so that every fake device reads 33.0 °C (use a point for decimals, for example `temp 29.5`); `temp random` brings back a random temperature of 25.0–33.0 °C. The simulator is explained in Module 16, Practice 7, and in Module 19.

Since Module 24, two more values can be set the same way, as whole numbers 0–100:

| Type | What happens |
| :--- | :--- |
| `soil 25` | every fake device reads a soil moisture of 25% (to test the "water if soil < 30%" rule); `soil random` brings back a random soil reading of 20–60%. The simulator does **not** wet the soil after the pump runs: type `soil 40` yourself for "the soil is wet again" |
| `tank 15` | the tank level (`water_level`) is 15%. While it is below 20%, every pump command gets an `ack` with `"ok": false` and `"message": "pump refused: tank water too low"`, exactly like Node 1, and the simulator's terminal writes `f00d00000001: pump REFUSED: tank water only 15 %`. `tank random` brings back a random tank level of 30–90% (always enough) |

A typed number goes out with the next `telemetry` (at most 10 seconds later), while a pump refusal applies at once.

### The mock Garden (Module 25)

For readers **without a real Node 2**: the first fake device `f00d00000001` plays the Node 1 that publishes the data of a fake Node 2 `f00d000000b2` ("the mock Garden"), exactly like a real Node 1 publishes Node 2's data ([`DATA-CONTRACT.md`](../DATA-CONTRACT.md) sections 1 and 5). Set it up once:

1. **Broker permission.** In `edge/acl-broker`, delete `# ` (the hash and its space) in front of the three lines of the block `2b) Laptop path (Module 25)`: `user f00d00000001`, `topic write msh/f00d000000b2/telemetry`, and `topic write msh/f00d000000b2/status`. Save, then **restart** the broker (not reload; see `edge/README.md`): the Compose central broker (Module 26) with `docker compose restart mosquitto` from the project root. Without this step the broker drops the Garden's data silently, with no error message in the simulator.
2. **Register the Garden** in the backend as an ESP-NOW device with the linking device `f00d00000001`: Bruno `register mock Garden` (`POST /devices` with `"device_id": "f00d000000b2"` and `"linked_via": "f00d00000001"`). The Garden has no key, so `tools/.env` doesn't change; the one required is still `KEY_F00D00000001`.
3. Run the simulator as usual (one fake device is enough: the second value `1`), then type in the same terminal:

| Type | What happens |
| :--- | :--- |
| `garden start` | The Garden starts: one Node 2 `telemetry` packet now, then every **300 seconds**. The first packet makes `f00d00000001` publish the Garden's `online` status (retained). The terminal writes `f00d000000b2: the Garden woke up at 21:18:05 WIB, its packet published by f00d00000001` every time the Garden wakes up |
| `garden pull` | "pulls out the Garden's battery": its packets stop. The terminal writes the time of the last packet and the expected time of the `offline` status, for example `Garden battery PULLED at 21:23:06 WIB. Its last packet was at 21:23:05 WIB; the offline status only comes around 21:39:05 WIB (960 seconds after the last packet).` |
| `garden insert` | "puts the battery back": the Garden wakes up at once and sends a packet (the status goes back to `online`), then every 300 seconds |

A Garden packet is a contract 1.1 Node 2 `telemetry`, for example `{"ts":"2026-10-26T14:18:05Z","fw":"1.0.0","temperature":28,"humidity":67,"pressure":1008.2,"soil_temperature":25.6,"soil":44}`: it has `pressure` (that's how the backend recognizes Node 2), no `battery`, no `vitals`, and its `ts` is made by "Node 1" when the packet is received. The `offline` status is published by `f00d00000001` after **960 seconds** without a packet (3 × 300 seconds + 1 minute), the same as the Node 1 v1.6.0 bridge.

The 300-second interval **deliberately can't be sped up**: the "silent node" alert in Grafana (Module 25) counts Node 2's delay from this 5-minute schedule, so waiting a few minutes really is part of the test. If the simulator is stopped (**Ctrl + C**), the Garden goes silent too, but its last status stays `online` on the broker: Node 2 has no last will, and its publisher is already off, exactly like a real Node 2 when Node 1 is off. A status that is no longer honest like that is why the Grafana alert uses the time of the last data, not the status. This simulator doesn't keep Garden packets while the broker is unreachable (a real Node 1 keeps them on its shelf, then publishes them later).

### Simulated firmware updates, simulated rollback, and claim codes (Module 28)

Since Module 28, every fake device imitates the **design of the Node 1 1.7.0 firmware** ([`DATA-CONTRACT.md`](../DATA-CONTRACT.md) 1.6). The simulator doesn't flash anything, and the file it "installs" is only checked, not run; all its time numbers are simulator numbers on the lab network, **not** ESP32 numbers over Wi-Fi.

- **Version.** A fake device that has never stored a version starts with firmware **1.7.0** (`telemetry.fw`, `vitals` with `reset_reason` and `fw`). `--fw=1.6.0` anywhere on the command makes a new device use the old firmware (no `reset_reason`/`fw` in `vitals`, refuses `update` with `action update not supported yet (Module 28)`), to test the install order "backend first, then firmware". The installed version is stored in `data/simulator-store.json` (the NVS stand-in).
- **The server address.** Every fake device stores **the home server address** in "NVS", like the **Server address** field in the Node 1 1.7.0 portal (or the Serial command `server`): the address from `claim` (below), or type `server http://192.168.1.10` in the simulator's terminal, or its default `SERVER_URL` in `tools/.env` (the stand-in for the default value in `config.h`). It must be **exactly the same** as `SERVER_URL` in the root `.env` (without a `/` at the end). What is typed (also the default from `tools/.env`) is tidied and checked exactly like the Node 1 portal and the backend's `SERVER_URL`: spaces at the edges and a `/` at the end are dropped, uppercase becomes lowercase, then at most 64 characters, `http://` or `https://`, a server name with only lowercase letters, digits, dots, and `-` (no `_`), port 1–65535 if written, no path; `http://` only to a home IP address (the simulator also `127.x`). A default in the wrong form isn't used, like on a real board: the simulator prints `SERVER_URL in tools/.env isn't used: …` when it starts. The device only downloads firmware from `<server address>/fw/node-1/<version>.bin`: an `update` command with a `url` to another server is answered `ack ok:false` `url is not this home's server` and its key is never sent (without this rule, another account that may write `msh/+/cmd`, for example `nodered`, could harvest device keys through a fake server). Not set yet = `server address not set (Serial: server <address>)`.
- **The `update` command** (from the **Update** button on `/fleet` or `POST /devices/:id/update`): its content is checked (version, `url` = `<server address>/fw/node-1/<version>.bin`, `sha256`, `size`, `http://` only to a home IP address; the simulator also accepts `127.x` because it runs on the same machine as the lab server), answered `ack ok:true` at once (= **accepted**), then the device publishes `offline-mode`, closes MQTT cleanly (without the will), and downloads the file **like HTTPUpdate of Arduino-ESP32 3.3.12**: `GET … HTTP/1.0`, `User-Agent: ESP32-http-Update`, Basic Auth `device_id:key`, `x-ESP32-STA-MAC` in uppercase, `x-ESP32-version`. The conditions are the same too: `200` + `Content-Length` (without it `-101`), the first byte `0xE9` (`-106`), SHA-256 = the command's (`Update 15`); `304` = no update, `403` = `-103`, `404` = `-102`; a server silent 8 seconds before answering = `-11`. A failure = the old version stays, connects again, `vitals.ota` `failed` with its reason. Data that stops **in the middle** of the file: over `https://` it fails after 30 seconds (`Update 6`); over `http://` the device is "restarted" by the watchdog after 60 seconds (`reset_reason` `WDT`, the report `failed` `restarted while downloading (WDT)`), the same as a real Node 1. A second `update` before the first download is over = `another update is running`; a `version` below 1.7.0 is refused (that firmware has no rollback). Success = a "restart" of 5 seconds with the new version (`reset_reason` `SW`).
- **The 60-second trial period.** The new version is **valid** as soon as the broker accepts its key, the device subscribes to `cmd`, and publishes `online` (the firmware's rule, not waiting for PUBACK); its report is `succeeded`. A FAKE file with the `TEST_WRONG_KEY` marker imitates firmware 1.7.2-test (the switch `TEST_WRONG_KEY 1`): its broker key is broken in RAM, the broker refuses it (`REJECTED by broker (code 5)`), 60 seconds pass, and the device "goes back by itself" to the old version (`rollback`). The `ota` report rides along with at most 3 `vitals`. A simulator stopped in the middle of the trial period also goes back to the old version when it runs again (like a power cut).
- **`config`** may carry `intervals.vitals_s` (60–3600): that device's `vitals` interval changes and is stored. `telemetry` stays every 10 seconds.
- Type **`restart`** = every fake device stops on purpose (`offline-mode`, a clean disconnect), then restarts (like the Serial command `restart` of firmware 1.7.0); **`ota`** = the version, the server address, the trial period, and the waiting report of every fake device; **`server http://192.168.1.10`** = the home server address of every running fake device (stored in `data/`).
- **Claim codes** ("a new board" without the portal): make a code on `/fleet` (or the Bruno request `create claim code`), then:

```bash
node device-simulator.js mqtt://127.0.0.1:1883 claim 7K2M-QF9D http://127.0.0.1 f00d00000003
```

  The arguments: the broker address the device connects to (the Pi gateway, or the central broker), the word `claim`, the code, **the server address** (the one also typed in the portal; without a `/` at the end), and the `device_id` (`f00d00000003` by default). The simulator calls `POST <server address>/api/provision/claim`, stores the key and that server address in `data/simulator-store.json` (the key is never printed), then connects at once: `f00d00000003: claim SUCCEEDED in … ms`, then `f00d00000003: online (firmware 1.7.0)`. Its broker account is made by the backend itself if `AUTO_BROKER_ACCOUNTS` in the root `.env` isn't `off`. A code that is wrong, expired, or already used: `claim REFUSED 403: …`. After that, the same device is run as usual (its key is taken from `data/`, `tools/.env` doesn't need to change).

A claim needs the `/api` prefix in front of `provision/claim`, that is, the way through Caddy (`http://127.0.0.1`, Docker Compose home mode). The dev-mode backend without Caddy (`npm run dev`, `http://127.0.0.1:8080`) has no such prefix and answers `401 not logged in…`: for dev mode, register the fake device with `POST /devices` (Bruno) as in Module 21.

The content of `data/simulator-store.json` (version, the key from a claim, the server address, the update plan) is the "NVS" of every fake device and **holds keys**: the `data/` folder doesn't go into Git. Delete that file to bring every fake device back to its factory state.

`live-terminal.js` needs a running backend and its library (just once, in this `tools` folder):

```bash
npm install socket.io-client@4.8.4
```

Since Module 20, the backend's Socket.IO is locked, so this terminal needs an account. Copy `.env.example` to `.env` in this `tools` folder, then fill in `TERMINAL_EMAIL` (for example `viewer@home.test`, an account with the `viewer` role) and `TERMINAL_PASSWORD` (that account's password). The `.env` file doesn't go into Git (see `.gitignore`). Run it with `--env-file=.env`:

```bash
node --env-file=.env live-terminal.js http://127.0.0.1:8080 f00d00000001
```

The first value is the backend's address, the second the `device_id` of the device you want to follow. This terminal logs in by itself; when the server cuts it off because its wristband expired (every 15 minutes), it renews its wristband (refresh) and connects again. If the login is refused (for example because its password was changed), it stops with the message `login refused (401). Check TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env.` The explanation is in Module 19, Practice 1, and in Module 20, Practice 7.

### Fake firmware files for the path without a Kit (Module 28)

Without an ESP32 and the Arduino IDE, you can still try the whole firmware update path (uploading on the **Fleet** screen, the SHA-256 fingerprint, the locked download, the trial period, and rollback) with the simulated devices of the simulator. All that's needed is a `.bin` file to upload, and `make-fake-bin.js` makes it with Node.js only, without npm libraries.

> [!WARNING]
> **Not real firmware.** It only holds one line of marker text and random bytes; an ESP32 can't run it. Don't flash it to a board (Arduino IDE, `esptool`, or the **Upload** button) and don't send it to a real board through **Update**: this file is only for the simulated devices of the simulator.

From the `tools` folder, make two files: a normal release 1.7.1, and a test release 1.7.2 for rollback practice. `../../fake-firmware` is the folder `fake-firmware` next to your repository folder (outside Git), and it is made by itself if it doesn't exist yet:

```bash
node make-fake-bin.js 1.7.1 ../../fake-firmware
node make-fake-bin.js 1.7.2 ../../fake-firmware --test
```

The output of the first command in the author's lab. The first line writes the full path on your computer (in this example the project folder is `/home/house/mini-smart-home`; on Windows for example `C:\Users\…\fake-firmware\…`):

```text
FAKE file created: /home/house/fake-firmware/node-1-1.7.1-FAKE.bin
  version      1.7.1 (normal release)
  size         1196032 bytes (61% of one program shelf, 1966080 bytes)
  first byte   0xE9, then the text "NOT REAL FIRMWARE ..."
  SHA-256      1aff82c7b69ed34c6d7bdda531b8e4ec21c671bdcfb2aacff2168a9fa91311ab
Upload it on the Fleet screen (Upload Node 1 firmware) with the version 1.7.1. The SHA-256 the server shows must be the same as above.
NOT real firmware: don't flash it to a board and don't send it to a real board. Only for simulated devices (the simulator).
```

Its content is always the same for the same version, size, and options, so the SHA-256 above is also the one that shows on your computer. Real firmware isn't like that: the compile time is built into it, so its fingerprint changes with every compile. The second file (`node-1-1.7.2-TEST-FAKE.bin`, SHA-256 `b2a0836e651080973916d8b852ef299cef0c2ed65bd0986367a61c8be86f86a2`) carries the `TEST_WRONG_KEY` marker in its first 512 bytes.

| Argument | What it's for |
| :--- | :--- |
| the first argument (required) | the version x.y.z without leading zeros, for example `1.7.1`. The rule is the same as the server's: `1.07.1` or `v1.7.1` is refused |
| the second argument | the destination folder; by default the folder the command runs in |
| `--test` | the `TEST_WRONG_KEY` marker: a simulated device that installs it imitates firmware 1.7.2-test (a wrong broker key, the 60-second trial period passes, then it goes back by itself to the old version). Upload it with **A test release** ticked |
| `--size=1300000` | another size in bytes (1,024 to 4,194,304). Above 1,966,080 (one program shelf) the file is still made, to see it refused: the **Fleet** screen writes `Too big: …` before uploading; through Bruno/`curl` the server answers `400` (too big), or `413` above 2,097,152 bytes (the upload limit) |

After that: (1) on the **Fleet** screen, open **Upload Node 1 firmware**, choose the file, fill in its version (for the `TEST` file, also tick **A test release**), then click **Upload firmware**. The SHA-256 shown under the form (computed by the server from the file it received) must be the same as the tool's output. (2) Run the simulator with `SERVER_URL` in `tools/.env` (the Module 28 section above), then click **Update** on the card of the simulated device, exactly as for Node 1. In the author's lab (backend 1.5.0 behind Caddy, the simulated device `f00d00000001`; simulator numbers, not an ESP32 over Wi-Fi), the 1.7.1 upload was answered `201` with `"sha256":"1aff82c7b69ed34c6d7bdda531b8e4ec21c671bdcfb2aacff2168a9fa91311ab"`, the same as the tool's output; 1.7.2 with the test box ticked was answered `201` with `"test":true`; the update to 1.7.1 `succeeded` within 5 seconds, and the one to 1.7.2 went back to the old version (`rollback`, `not connected to the broker within 60 seconds`) within 71 seconds.

What this tool guards:

- It **never overwrites** a file that already exists (`… already exists: not overwritten.`). The server never overwrites a version that was already uploaded either, so what you usually need is a new version.
- **`.bin` files don't go into Git.** Since Module 28, the `.gitignore` at the project root ignores `*.bin`. If the destination folder is inside a Git repository whose `.gitignore` doesn't have the line `*.bin` yet, the tool refuses and suggests a folder outside the repository. Inside a repository that is already safe, the file is still made, with the note "tidier outside the repository".
- You can check a file's fingerprint yourself: `sha256sum <file>` (Linux), `shasum -a 256 <file>` (macOS), or `Get-FileHash <file>` (PowerShell on Windows; it prints the letters in uppercase).

Its test uses Node.js's own test runner (also without npm libraries). From the `tools` folder:

```bash
node --test make-fake-bin.test.js
```

The result in the author's lab: `ℹ tests 7`, `ℹ pass 7`, `ℹ fail 0`.

## Notes

- The `package.json` in this folder contains `"type": "module"` so that `import`/`export` can be used. It was created with `npm init -y`, followed by `npm pkg set type=module`, just like in Module 4. Since Module 11, it also records the `mqtt` library under `dependencies`, and `package-lock.json` records the exact version of every helper library.
- `.gitignore` tells Git to ignore `node_modules/` and `data/`: fake data doesn't need to be stored in the project repository. Since Module 20, Git also ignores `.env` (the `live-terminal.js` account, which holds a password; since Module 21 also the checker's broker account and the practice device keys); its example is in `.env.example`.
- **This receiver is deliberately bare-bones:** anyone who can reach your laptop can send it anything, without a password. Use it only on your home network. How to lock it down is covered in Modules 20, 21, and 27.
- **`sniffer.js` in front of the TLS door 8883 (Module 27):** `node sniffer.js <broker address> 8883 1884`. A client that tries **without TLS** on 8883 still sends its username and key in the clear (the sniffer prints them) before the broker refuses it: test "without TLS is refused" only with a test account such as `checker`, never with a device key. You don't need to repeat the TLS part: a TLS client that knocks on the sniffer at `127.0.0.1` refuses to connect, because the broker's certificate is only valid for the name `mqtt.…` (that name check is what protects you from a sniffer). In the author's lab (the sniffer and its client on the same machine), the name check was deliberately switched off for this test only, and the result: the TLS client was only recorded as `new connection from … -> …:8883`, without a username or a key (its content is encrypted).

---

[⬅️ Back to the project](../README.md) · [Module 4](../../../../phase-0-foundations/module-04-javascript-nodejs/README.md) · [Syllabus](../../../../SYLLABUS.md)
