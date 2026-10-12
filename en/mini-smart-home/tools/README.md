# 🧰 Mini Smart Home helper tools

🌐 **English** · [Bahasa Indonesia](../../../proyek-rumah-pintar-mini/alat/README.md)

This folder contains three small Node.js programs that you create in [Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md) and use again and again in later modules. All three have been tested with **Node.js 24.21.0** and need no libraries from npm.

| File | What it does | Used again in |
| :--- | :--- | :--- |
| [`generate-dummy.js`](generate-dummy.js) | Generates fake sensor readings shaped exactly like the [data contract](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract). Run it directly to write `data/readings.json`, or borrow its function: `import { buildTelemetry } from "./generate-dummy.js";` | Module 10 (test data before the sensors are ready), Module 16 (a device simulator for the backend), Module 22 (the dashboard before there are real sensors) |
| [`webhook-receiver.js`](webhook-receiver.js) | A mini server on port 3000 that prints everything it receives and replies with `{"ok":true}`. | Module 10 (the ESP32 sends its first reading over Wi-Fi to your laptop), then Modules 16 and 22 as a test receiver |
| [`send-data.js`](send-data.js) | A test sender: it pretends to be an ESP32 and sends 3 readings to `http://localhost:3000/telemetry`. | Modules 10 and 16, to test a receiver without a board |

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

## Notes

- The `package.json` in this folder contains `"type": "module"` so that `import`/`export` can be used. It was created with `npm init -y`, followed by `npm pkg set type=module`, just like in Module 4.
- `.gitignore` tells Git to ignore `node_modules/` and `data/`: fake data doesn't need to be stored in the project repository.
- **This receiver is deliberately bare-bones:** anyone who can reach your laptop can send it anything, without a password. Use it only on your home network. How to lock it down is covered in Modules 20, 21, and 27.

---

[⬅️ Back to the project](../README.md) · [Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md) · [Syllabus](../../SYLLABUS.md)
