# 🧰 Mini Smart Home helper tools

🌐 **English** · [Bahasa Indonesia](../../../proyek-rumah-pintar-mini/alat/README.md)

This folder contains small Node.js programs that you create in [Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md), [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md), and [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md), then use again and again in later modules. All of them have been tested with **Node.js 24.21.0**. The first three need no libraries from npm; `contract-checker.js` and `device-simulator.js` need the **mqtt** 5.16.1 library (see "How to use").

| File | What it does | Used again in |
| :--- | :--- | :--- |
| [`generate-dummy.js`](generate-dummy.js) | Generates fake sensor readings shaped exactly like the [data contract](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract). Run it directly to write `data/readings.json`, or borrow its function: `import { buildTelemetry } from "./generate-dummy.js";` | Module 10 (test data before the sensors are ready), Module 16 (a device simulator for the backend), Module 22 (the dashboard before there are real sensors) |
| [`webhook-receiver.js`](webhook-receiver.js) | A mini server on port 3000 that prints everything it receives and replies with `{"ok":true}`. | Module 10 (the ESP32 sends its first reading over Wi-Fi to your laptop), then Module 22 as a test receiver |
| [`send-data.js`](send-data.js) | A test sender: it pretends to be an ESP32 and sends 3 readings to `http://localhost:3000/telemetry`. | Module 10, to test a receiver without a board |
| [`contract-checker.js`](contract-checker.js) | The data contract's security guard: it subscribes to `msh/#` on the MQTT broker, then stamps every message **PASS** or **FAIL** according to [`DATA-CONTRACT.md`](../DATA-CONTRACT.md), with the reasons and how long each `ack` reply took. | Module 11 (a Node 1 v1.2 completion requirement), Module 14 (version 1.1: Node 2's `telemetry` is checked against its own fields), Module 15 (version 1.2: the three RS-485 sensor fields in Node 1's `telemetry`), then every time the firmware changes or a new device is added |
| [`device-simulator.js`](device-simulator.js) | Ten fake devices (`f00d00000001` to `f00d00000010`) that speak MQTT exactly as the data contract says: the `online`/`offline` status (through the *Last Will*), `telemetry` every 10 seconds from `buildTelemetry()`, `vitals` on connecting and every 5 minutes, and an `ack` answer to every command. The `clean` mode deletes their retained status from the broker. | Module 16 (testing the backend without a board), then every module that needs many devices |

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

```bash
node contract-checker.js
```

With nothing added, the checker connects to the broker on the same laptop (`127.0.0.1`) and checks every `msh/#` topic; for a broker on another computer, add its address, for example `node contract-checker.js 192.168.1.10`. On a public broker (the Wokwi path), also add your device's `device_id` so only its messages are checked, for example `node contract-checker.js broker.emqx.io 240ac45e114b`. Stop it with **Ctrl + C**; before stopping, it prints a PASS/FAIL summary. The explanation is in Module 11, Practice 8.

The simulator uses the same library. Write the broker's full address (starting with `mqtt://`) after its file name. The second value (optional) is the number of fake devices, for example `3`. Run it like this, then stop it with **Ctrl + C** when you're done:

```bash
node device-simulator.js mqtt://192.168.1.37:1883
```

The word `clean` in the place of the second value deletes the fake devices' retained status from the broker, then the program ends by itself:

```bash
node device-simulator.js mqtt://192.168.1.37:1883 clean
```

The simulator is explained in Module 16, Practice 7.

## Notes

- The `package.json` in this folder contains `"type": "module"` so that `import`/`export` can be used. It was created with `npm init -y`, followed by `npm pkg set type=module`, just like in Module 4. Since Module 11, it also records the `mqtt` library under `dependencies`, and `package-lock.json` records the exact version of every helper library.
- `.gitignore` tells Git to ignore `node_modules/` and `data/`: fake data doesn't need to be stored in the project repository.
- **This receiver is deliberately bare-bones:** anyone who can reach your laptop can send it anything, without a password. Use it only on your home network. How to lock it down is covered in Modules 20, 21, and 27.

---

[⬅️ Back to the project](../README.md) · [Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md) · [Syllabus](../../SYLLABUS.md)
