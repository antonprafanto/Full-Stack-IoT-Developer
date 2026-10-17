# 🟦 Phase 2 — Connectivity: Wi-Fi, MQTT, Raspberry Pi Gateway, & Field Protocols (Modules 10–15)

🌐 **English** · [Bahasa Indonesia](../../fase-2-konektivitas/README.md)

> **Phase goal:** your devices "talk" to the outside world with standard protocols, there's a local "post office" (a Raspberry Pi), and you get to know the protocols that are really used in the field. **Everything still stays on your home network**: opening devices to the internet is a job for Phase 5.

Work through the modules **in order**. One module = one week (6–10 hours, spread out). Click a module title to open its article.

| Week | Module | Hardware | Tools installed in this module | Status |
| :---: | :--- | :--- | :--- | :--- |
| 10 | **[Module 10 — Wi-Fi & HTTP: Devices Start Talking to the Network](module-10-wifi-and-http/README.md)** | Kit A with no new parts, plus a laptop, a phone, and 2.4 GHz Wi-Fi (some practices also work in Wokwi) | WiFiManager and ArduinoJson libraries; WiFi, HTTPClient, WebServer, and ESPmDNS (built into the esp32 package) | ✅ available |
| 11 | Module 11 — MQTT: The Official Language of IoT & the Project Data Contract | Kit A + a laptop as the broker | Mosquitto, MQTTX, PubSubClient library | ⏳ coming soon — [summary](../SYLLABUS.md#module-11--mqtt-the-official-language-of-iot--the-project-data-contract) |
| 12 | Module 12 — Raspberry Pi & Linux Basics: A Gateway That's Always On | Kit B (or a laptop / Pi Zero 2 W) | Raspberry Pi Imager, SSH, Mosquitto | ⏳ coming soon — [summary](../SYLLABUS.md#module-12--raspberry-pi--linux-basics-a-gateway-thats-always-on) |
| 13 | Module 13 — Node-RED & Dashboard 2: Your First Dashboard Without Coding | Kit B (or a laptop) | Node-RED + `@flowfuse/node-red-dashboard` | ⏳ coming soon — [summary](../SYLLABUS.md#module-13--node-red--dashboard-2-your-first-dashboard-without-coding) |
| 14 | Module 14 — Node 2 "Garden": Battery-Powered Sensors via ESP-NOW | Kit A Stage 2 (2 ESP32s, battery) | the esp_now library built into the esp32 package, INA219 | ⏳ coming soon — [summary](../SYLLABUS.md#module-14--node-2-garden-battery-powered-sensors-via-esp-now) |
| 15 | Module 15 — Modbus RTU/RS-485 Lab & Choosing the Right Protocol | Kit A Stage 2 (2 ESP32s, 2 MAX485s) | ModbusMaster, eModbus, MAX485 module | ⏳ coming soon — [summary](../SYLLABUS.md#module-15--modbus-rturs-485-lab--choosing-the-right-protocol) |

## 🎯 Phase 2 completion criteria

Before moving on to Phase 3, make sure this evidence is in your GitHub repository ([Syllabus §8](../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)):

1. The quiz of every module (5 questions): **at least 4 correct**.
2. **Checkpoint project:** Node 1 + Node 2 + the Raspberry Pi gateway + the Modbus lab.
3. **Artifacts:** `DATA-CONTRACT.md` and a Node-RED flow (JSON).

Module 10 opens this phase: Node 1 v1.1 connects to your home Wi-Fi without a password in its code, knows the exact time, sends its readings as JSON that follows the data contract, and its lamp can be turned off from a phone. From Module 11 on, the same messages travel over MQTT.

## 📂 What each module folder contains

| Content | Purpose |
| :--- | :--- |
| `README.md` | The module article — start reading here. GitHub shows it automatically when you open the module folder. |
| `code/` | One folder per sketch, ready to open in the Arduino IDE. Sketches that connect to Wi-Fi come with a `secrets.h` tab that holds a **sample** Wi-Fi name and password: replace them with your own Wi-Fi on your own laptop, and never commit a `secrets.h` that contains a real password. The `node-1-home` folder also has a `diagram.json` and a `libraries.txt` for trying it in Wokwi. |
| `assets/` | The article's images, plus `SOURCES.md`, which records the source and license of every image. |

---

[⬅️ Phase 1 — ESP32 Embedded](../phase-1-esp32-embedded/README.md) · [Front page](../README.md) · [Syllabus](../SYLLABUS.md) · [Progress tracker](../PROGRESS.md) · **Start: [Module 10](module-10-wifi-and-http/README.md) ➡️**
