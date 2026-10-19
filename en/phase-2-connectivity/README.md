# 🟦 Phase 2 — Connectivity: Wi-Fi, MQTT, Raspberry Pi Gateway, & Field Protocols (Modules 10–15)

🌐 **English** · [Bahasa Indonesia](../../fase-2-konektivitas/README.md)

> **Phase goal:** your devices "talk" to the outside world with standard protocols, there's a local "post office" (a Raspberry Pi), and you get to know the protocols that are really used in the field. **Everything still stays on your home network**: opening devices to the internet is a job for Phase 5.

Work through the modules **in order**. One module = one week (6–10 hours, spread out). Click a module title to open its article.

| Week | Module | Hardware | Tools installed in this module | Status |
| :---: | :--- | :--- | :--- | :--- |
| 10 | **[Module 10 — Wi-Fi & HTTP: Devices Start Talking to the Network](module-10-wifi-and-http/README.md)** | Kit A with no new parts, plus a laptop, a phone, and 2.4 GHz Wi-Fi (some practices also work in Wokwi) | WiFiManager and ArduinoJson libraries; WiFi, HTTPClient, WebServer, and ESPmDNS (built into the esp32 package) | ✅ available |
| 11 | **[Module 11 — MQTT: The Official Language of IoT & the Project Data Contract](module-11-mqtt-and-data-contract/README.md)** | Kit A with no new parts, plus a laptop as the broker (every sketch can be tried in Wokwi with a public broker) | Mosquitto, MQTTX, PubSubClient3 library, `mqtt` library for Node.js | ✅ available |
| 12 | **[Module 12 — Raspberry Pi & Linux Basics: A Gateway That's Always On](module-12-raspberry-pi-and-linux/README.md)** | Kit B: a Raspberry Pi 5 or Pi 4, a *high-endurance* microSD card, the official power supply, a LAN cable (laptop path available; Wokwi doesn't simulate the Pi) | Raspberry Pi Imager 2.0.12, SSH, Mosquitto 2.0.21 on Raspberry Pi OS Trixie | ✅ available |
| 13 | **[Module 13 — Node-RED & Dashboard 2: Your First Dashboard Without Coding](module-13-node-red-dashboard/README.md)** | Kit B: the Pi gateway from Module 12, Node 1, a phone (laptop path available) | Node-RED 5.0.8 and FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) 1.33.0 | ✅ available |
| 14 | **[Module 14 — Node 2 "Garden": Battery-Powered Sensors via ESP-NOW](module-14-node-2-esp-now/README.md)** | Kit A Stage 2: the second ESP32 board with the Module 9 battery circuit, BME280, DS18B20, a second soil sensor, INA219 (partial Wokwi path) | ESP-NOW built into the esp32 3.3.12 package, Adafruit BME280, OneWire + DallasTemperature, Adafruit INA219 | ✅ available |
| 15 | **[Module 15 — Modbus RTU/RS-485 Lab & Choosing the Right Protocol](module-15-modbus-rs485-and-protocols/README.md)** | Kit A Stage 2: the second board (Node 2, borrowed), two MAX485 modules, a 5 m UTP cable, 4.7 kΩ and 10 kΩ resistors (partial Wokwi path: a mock chip) | ModbusMaster 2.0.1, ModbusRTUSlave 3.1.2, a mock Wokwi chip | ✅ available |

## 🎯 Phase 2 completion criteria

Before moving on to Phase 3, make sure this evidence is in your GitHub repository ([Syllabus §8](../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)):

1. The quiz of every module (5 questions): **at least 4 correct**.
2. **Checkpoint project:** Node 1 + Node 2 + the Raspberry Pi gateway + the Modbus lab.
3. **Artifacts:** `DATA-CONTRACT.md` and a Node-RED flow (JSON).

Module 10 opens this phase: Node 1 v1.1 connects to your home Wi-Fi without a password in its code, knows the exact time, sends its readings as JSON that follows the data contract, and its lamp can be turned off from a phone. Module 11 moves all of its communication to MQTT: Node 1 v1.2 talks through a Mosquitto broker with the data contract used until the end of the curriculum, and the phase's first artifact, `DATA-CONTRACT.md`, starts living in your project. Module 12 moves that broker to a Raspberry Pi gateway that runs 24 hours with a fixed address, as a service that starts and gets back up by itself, complete with a recipe to rebuild it in `edge/README.md`: Node 1 v1.2.1 stays connected even when the laptop is off. Module 13 gives that gateway a face and a first brain: Node-RED shows all five of Node 1's sensors on a phone dashboard, sends commands that follow the data contract from switches and buttons, and turns the fan on by itself with hysteresis, without changing a single line of Node 1's firmware. Module 14 adds a second device: Node 2 "Garden" runs on a battery, reads a BME280, a DS18B20, and a second soil sensor, and talks directly to Node 1 over ESP-NOW without a router. Node 1 v1.3.0 becomes its bridge to the broker and keeps hearing Node 2 while the router is off, and Node-RED shows it on the Garden card with Node 2's own `device_id`. Module 15 closes this phase with an industrial language: over one pair of RS-485 wires and a MAX485 module, Node 1 v1.4.0 asks the mock soil sensor on the second board with Modbus RTU, puts its answers into `telemetry` (data contract 1.2), and the RS-485 Sensor group in Node-RED shows them over a 5 m cable. The module also gives you a map for choosing the right protocol: Wi-Fi, ESP-NOW, RS-485, LoRa/LoRaWAN, Zigbee/Thread and Matter, NB-IoT, and BLE.

## 📂 What each module folder contains

| Content | Purpose |
| :--- | :--- |
| `README.md` | The module article — start reading here. GitHub shows it automatically when you open the module folder. |
| `code/` | One folder per sketch, ready to open in the Arduino IDE. Sketches that connect to Wi-Fi come with a `secrets.h` tab that holds a **sample** Wi-Fi name and password: replace them with your own Wi-Fi on your own laptop, and never commit a `secrets.h` that contains a real password. The `node-1-home` folder also has a `diagram.json` and a `libraries.txt` for trying it in Wokwi. |
| `assets/` | The article's images, plus `SOURCES.md`, which records the source and license of every image. |

---

[⬅️ Phase 1 — ESP32 Embedded](../phase-1-esp32-embedded/README.md) · [Front page](../README.md) · [Syllabus](../SYLLABUS.md) · [Progress tracker](../PROGRESS.md) · **Start: [Module 10](module-10-wifi-and-http/README.md) ➡️**
