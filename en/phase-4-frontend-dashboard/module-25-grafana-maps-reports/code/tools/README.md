# 🧰 Mini Smart Home helper tools

🌐 **English** · [Bahasa Indonesia](../../../../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/kode/alat/README.md)

This folder contains small Node.js programs that you create in [Module 4](../../../../phase-0-foundations/module-04-javascript-nodejs/README.md), [Module 11](../../../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md), [Module 16](../../../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md), [Module 19](../../../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md), [Module 20](../../../../phase-3-backend-data/module-20-user-security/README.md), and [Module 21](../../../../phase-3-backend-data/module-21-device-broker-security/README.md) (the simulator is updated again in [Module 24](../../../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md) and [Module 25](../../../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md)), then use again and again in later modules. All of them have been tested with **Node.js 24.21.0**. The first three need no libraries from npm; `contract-checker.js` and `device-simulator.js` need the **mqtt** 5.16.1 library, and `live-terminal.js` needs **socket.io-client** 4.8.4 (see "How to use").

| File | What it does | Used again in |
| :--- | :--- | :--- |
| [`generate-dummy.js`](generate-dummy.js) | Generates fake sensor readings shaped exactly like the [data contract](../../../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract). Run it directly to write `data/readings.json`, or borrow its function: `import { buildTelemetry } from "./generate-dummy.js";` | Module 10 (test data before the sensors are ready), Module 16 (a device simulator for the backend), Module 22 (the dashboard before there are real sensors) |
| [`webhook-receiver.js`](webhook-receiver.js) | A mini server on port 3000 that prints everything it receives and replies with `{"ok":true}`. | Module 10 (the ESP32 sends its first reading over Wi-Fi to your laptop), then Module 22 as a test receiver |
| [`send-data.js`](send-data.js) | A test sender: it pretends to be an ESP32 and sends 3 readings to `http://localhost:3000/telemetry`. | Module 10, to test a receiver without a board |
| [`contract-checker.js`](contract-checker.js) | The data contract's security guard: it subscribes to `msh/#` on the MQTT broker, then stamps every message **PASS** or **FAIL** according to [`DATA-CONTRACT.md`](../../../../mini-smart-home/DATA-CONTRACT.md), with the reasons and how long each `ack` reply took. | Module 11 (a Node 1 v1.2 completion requirement), Module 14 (version 1.1: Node 2's `telemetry` is checked against its own fields), Module 15 (version 1.2: the three RS-485 sensor fields in Node 1's `telemetry`), Module 19 (version 1.3: `state` in `telemetry` and `ack`, the offline-mode report in `vitals`, the content of `config`, a retained `set`), Module 21 (version 1.4: it connects to a locked broker with the `checker` account from `tools/.env`; the address may carry a port), then every time the firmware changes or a new device is added |
| [`device-simulator.js`](device-simulator.js) | Ten fake devices (`f00d00000001` to `f00d00000010`) that speak MQTT exactly as the data contract says: the `online`/`offline` status (through the *Last Will*), `telemetry` every 10 seconds from `buildTelemetry()` (since Module 19 with `state` and an immediate send when an actuator changes), `vitals` on connecting and every 5 minutes, and an `ack` answer to every command, `config` included (stored in `data/simulator-store.json`). Since Module 19, the temperature can be set from the terminal (`temp 33`, `temp random`), and when the broker is unreachable for 2 minutes, the simulator enters offline mode, runs the safety fan, then reports through `vitals` about 10 seconds after it reconnects. Since Module 21, each fake device connects to the broker with its own account (username = `device_id`, the key from `tools/.env`); a device with no key is not started, and a key the broker rejects is retried 60 seconds later. Since Module 24, the soil moisture and the tank level can be set from the terminal too (`soil 25`, `tank 15`), and a pump command is refused like on Node 1 (`pump refused: tank water too low`) when the tank is below 20%. Since Module 25, the first fake device can also carry the **mock Garden** `f00d000000b2`, a fake Node 2 whose data it publishes the way a real Node 1 publishes Node 2's data (`garden start`, `garden pull`, `garden insert`). The `clean` mode deletes their retained status from the broker. | Module 16 (testing the backend without a board), Module 19 (automation rules and the "broker off" test), Module 24 (the "water if soil < 30%" rule and a refused pump button, without Kit A), Module 25 (the "silent node" alert and "pull out Node 2's battery" without Kit B), then every module that needs many devices |
| [`live-terminal.js`](live-terminal.js) | A "small terminal" that connects to the backend through Socket.IO, follows one device (`follow`), then shows each of its readings as soon as it arrives, the status changes of every device, and the event log. It reconnects by itself when the backend restarts. Since Module 20, this terminal first logs in with the account from `tools/.env` (a `viewer` account is enough), then renews its wristband by itself (refresh) every time the server cuts it off because it expired. | Module 19, Module 20 (Socket.IO locked), then Module 23 (the live dashboard uses the same events) |

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

Since Module 21, the home broker is locked, so the checker and the simulator need a broker account. Copy `.env.example` to `.env` in this `tools` folder (if you haven't yet), then fill in `CHECKER_KEY` with the password of the `checker` account (an account that may only read `msh/#`, made on the broker with `mosquitto_passwd`) and `KEY_F00D00000001` with the practice device's key from the `POST /devices` answer in the backend. The `.env` file doesn't go into Git. Run both with `--env-file=.env`:

```bash
node --env-file=.env contract-checker.js
```

With nothing added, the checker connects to the broker on the same laptop (`127.0.0.1`) and checks every `msh/#` topic; for a broker on another computer, add its address, for example `node --env-file=.env contract-checker.js 192.168.1.10`, and for a port other than 1883 add the port too, for example `127.0.0.1:1884`. If the broker rejects its account, the checker stops with the message `Broker 127.0.0.1:1883 rejected the checker account (code 5). …`. On a public broker (the Wokwi path), also add your device's `device_id` so only its messages are checked, for example `node contract-checker.js broker.emqx.io 240ac45e114b` (without `--env-file`: that public broker isn't locked). Stop it with **Ctrl + C**; before stopping, it prints a PASS/FAIL summary. The explanation is in Module 11, Practice 8, and Module 21.

The simulator uses the same library. Write the broker's full address (starting with `mqtt://`) after its file name. The second value (optional) is the number of fake devices, for example `1`. Only devices whose key is in `tools/.env` (`KEY_F00D00000001=…`, `KEY_F00D00000002=…`, and so on) are started; the others are skipped with the message `no key in tools/.env`. Run it like this, then stop it with **Ctrl + C** when you're done:

```bash
node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 1
```

If the broker rejects a fake device's key (the key is wrong, not yet installed on the broker, or revoked), the simulator writes `f00d00000001: REJECTED by broker (code 5): wrong key, not registered, or revoked. Retrying in 60 seconds.` and retries every 60 seconds.

The word `clean` in the place of the second value deletes the fake devices' retained status from the broker (each device connects with its own account), then the program ends by itself. Since Module 25, the mock Garden's status is deleted too, through `f00d00000001` (only if the Garden's ACL block is open). The retained `config` on the `cmd` topic is not deleted: only the `backend` and `nodered` accounts may write `cmd`, and that config can only be read by the device itself.

```bash
node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 clean
```

While the simulator runs, type `temp 33` and then **Enter** in the same terminal so that every fake device reads 33.0 °C (use a point for decimals, for example `temp 29.5`); `temp random` brings back a random temperature of 25.0–33.0 °C. The simulator is explained in Module 16, Practice 7, and in Module 19.

Since Module 24, two more values can be set the same way, as whole numbers 0–100:

| Type | What happens |
| :--- | :--- |
| `soil 25` | every fake device reads a soil moisture of 25% (to test the "water if soil < 30%" rule); `soil random` brings back a random soil reading of 20–60%. The simulator does **not** wet the soil after the pump runs: type `soil 40` yourself for "the soil is wet again" |
| `tank 15` | the tank level (`water_level`) is 15%. While it is below 20%, every pump command gets an `ack` with `"ok": false` and `"message": "pump refused: tank water too low"`, exactly like Node 1, and the simulator's terminal writes `f00d00000001: pump REFUSED: tank water only 15 %`. `tank random` brings back a random tank level of 30–90% (always enough) |

A typed number goes out with the next `telemetry` (at most 10 seconds later), while a pump refusal applies at once.

### The mock Garden (Module 25)

For readers **without a real Node 2**: the first fake device `f00d00000001` plays the Node 1 that publishes the data of a fake Node 2 `f00d000000b2` ("the mock Garden"), exactly like a real Node 1 publishes Node 2's data ([`DATA-CONTRACT.md`](../../../../mini-smart-home/DATA-CONTRACT.md) sections 1 and 5). Set it up once:

1. **Broker permission.** In `edge/acl-broker`, delete `# ` (the hash and its space) in front of the three lines of the block `2b) Laptop path (Module 25)`: `user f00d00000001`, `topic write msh/f00d000000b2/telemetry`, and `topic write msh/f00d000000b2/status`. Save, then **restart** the broker (not reload; see `edge/README.md`). Without this step the broker drops the Garden's data silently, with no error message in the simulator.
2. **Register the Garden** in the backend as an ESP-NOW device with the linking device `f00d00000001`: Bruno `register mock Garden` (`POST /devices` with `"device_id": "f00d000000b2"` and `"linked_via": "f00d00000001"`). The Garden has no key, so `tools/.env` doesn't change; the one required is still `KEY_F00D00000001`.
3. Run the simulator as usual (one fake device is enough: the second value `1`), then type in the same terminal:

| Type | What happens |
| :--- | :--- |
| `garden start` | The Garden starts: one Node 2 `telemetry` packet now, then every **300 seconds**. The first packet makes `f00d00000001` publish the Garden's `online` status (retained). The terminal writes `f00d000000b2: the Garden woke up at 21:18:05 WIB, its packet published by f00d00000001` every time the Garden wakes up |
| `garden pull` | "pulls out the Garden's battery": its packets stop. The terminal writes the time of the last packet and the expected time of the `offline` status, for example `Garden battery PULLED at 21:23:06 WIB. Its last packet was at 21:23:05 WIB; the offline status only comes around 21:39:05 WIB (960 seconds after the last packet).` |
| `garden insert` | "puts the battery back": the Garden wakes up at once and sends a packet (the status goes back to `online`), then every 300 seconds |

A Garden packet is a contract 1.1 Node 2 `telemetry`, for example `{"ts":"2026-10-26T14:18:05Z","fw":"1.0.0","temperature":28,"humidity":67,"pressure":1008.2,"soil_temperature":25.6,"soil":44}`: it has `pressure` (that's how the backend recognizes Node 2), no `battery`, no `vitals`, and its `ts` is made by "Node 1" when the packet is received. The `offline` status is published by `f00d00000001` after **960 seconds** without a packet (3 × 300 seconds + 1 minute), the same as the Node 1 v1.6.0 bridge.

The 300-second interval **deliberately can't be sped up**: the "silent node" alert in Grafana (Module 25) counts Node 2's delay from this 5-minute schedule, so waiting a few minutes really is part of the test. If the simulator is stopped (**Ctrl + C**), the Garden goes silent too, but its last status stays `online` on the broker: Node 2 has no last will, and its publisher is already off, exactly like a real Node 2 when Node 1 is off. A status that is no longer honest like that is why the Grafana alert uses the time of the last data, not the status. This simulator doesn't keep Garden packets while the broker is unreachable (a real Node 1 keeps them on its shelf, then publishes them later).

`live-terminal.js` needs a running backend and its library (just once, in this `tools` folder):

```bash
npm install socket.io-client@4.8.4
```

Since Module 20, the backend's Socket.IO is locked, so this terminal needs an account. Copy `.env.example` to `.env` in this `tools` folder, then fill in `TERMINAL_EMAIL` (for example `viewer@home.test`, an account with the `viewer` role) and `TERMINAL_PASSWORD` (that account's password). The `.env` file doesn't go into Git (see `.gitignore`). Run it with `--env-file=.env`:

```bash
node --env-file=.env live-terminal.js http://127.0.0.1:8080 f00d00000001
```

The first value is the backend's address, the second the `device_id` of the device you want to follow. This terminal logs in by itself; when the server cuts it off because its wristband expired (every 15 minutes), it renews its wristband (refresh) and connects again. If the login is refused (for example because its password was changed), it stops with the message `login refused (401). Check TERMINAL_EMAIL and TERMINAL_PASSWORD in tools/.env.` The explanation is in Module 19, Practice 1, and in Module 20, Practice 7.

## Notes

- The `package.json` in this folder contains `"type": "module"` so that `import`/`export` can be used. It was created with `npm init -y`, followed by `npm pkg set type=module`, just like in Module 4. Since Module 11, it also records the `mqtt` library under `dependencies`, and `package-lock.json` records the exact version of every helper library.
- `.gitignore` tells Git to ignore `node_modules/` and `data/`: fake data doesn't need to be stored in the project repository. Since Module 20, Git also ignores `.env` (the `live-terminal.js` account, which holds a password; since Module 21 also the checker's broker account and the practice device keys); its example is in `.env.example`.
- **This receiver is deliberately bare-bones:** anyone who can reach your laptop can send it anything, without a password. Use it only on your home network. How to lock it down is covered in Modules 20, 21, and 27.

---

[⬅️ Back to the project](../../../../mini-smart-home/README.md) · [Module 4](../../../../phase-0-foundations/module-04-javascript-nodejs/README.md) · [Syllabus](../../../../SYLLABUS.md)
