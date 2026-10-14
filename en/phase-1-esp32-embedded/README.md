# 🟧 Phase 1 — ESP32 Embedded: Sensors, Actuators, & Robust Firmware (Modules 5–9)

🌐 **English** · [Bahasa Indonesia](../../fase-1-esp32-embedded/README.md)

> **Phase goal:** a standalone Node 1 "Home" — it senses its surroundings, shows the data on a screen, moves things, runs on its own power supply, and has firmware that doesn't hang easily — plus the low-power skills you need for Node 2.

Work through the modules **in order**. One module = one week (6–10 hours, spread out). Click a module title to open its article.

| Week | Module | Hardware | Tools installed in this module | Status |
| :---: | :--- | :--- | :--- | :--- |
| 5 | **[Module 5 — ESP32 Anatomy, the Canonical Pin Map, Power Supply, & Controlling the Real World](module-05-gpio-and-pin-map/README.md)** | Kit A Stage 1 + a USB A–A cable (most practices also work in Wokwi) | ESP32Servo library | ✅ available |
| 6 | **[Module 6 — Reading Sensors: Analog, Digital, & Calibration](module-06-reading-sensors/README.md)** | Kit A Stage 1 (most practices also work in Wokwi) | DHT sensor library (Adafruit) + Adafruit Unified Sensor, Serial Plotter | ✅ available |
| 7 | **[Module 7 — Sensor Bus Protocols: I2C, 1-Wire, SPI, OLED Display, & Reading Schematics](module-07-sensor-bus-oled-schematics/README.md)** | Kit A Stage 2 (almost every practice also works in Wokwi) | Adafruit SSD1306 + GFX + BusIO, Adafruit BME280, OneWire + DallasTemperature libraries; SD is built into the esp32 package | ✅ available |
| 8 | **[Module 8 — Robust Firmware: millis(), State Machines, Modular Code, Watchdog, & Debugging](module-08-robust-firmware/README.md)** | Kit A, no new parts (every practice also works in Wokwi) | Preferences library (built into the esp32 package) | ✅ available |
| 9 | **[Module 9 — Power Supply & Low Power: Adapters, Batteries, Deep Sleep, & Measuring Current](module-09-power-and-low-power/README.md)** | Kit A Stage 2: 2nd ESP32, INA219, 18650 + TP4056 + MT3608, mini breadboard (most practices need a real board) | Adafruit INA219 library; Preferences (built into the esp32 package) | ✅ available |

## 🎯 Phase 1 completion criteria

Before moving on to Phase 2, make sure this evidence is in your GitHub repository ([Syllabus §8](../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)):

1. The quiz of every module (5 questions): **at least 4 correct**.
2. **Checkpoint project:** Node 1 running on its own for 24 hours from an adapter, plus a battery sketch with a measured current.
3. **Artifacts:** Node 1 firmware v1.0, a photo of the circuit, `PIN-MAP.md`, and a 30-second video.

Module 5 already gives you your first two artifacts: **`PIN-MAP.md`** and a **photo of the circuit** on your workbench. Module 6 adds a photo of your sensor build and your calibration notes. Module 7 adds a schematic of Node 1 that you draw yourself. Module 8 completes **Node 1 firmware v1.0** together with the notes of its 24-hour test. Module 9 closes this phase: Node 1 moves to its own adapter and passes the 24-hour test, the battery sketch's sleep current is measured, and you record a **30-second video**.

## 📂 What each module folder contains

| Content | Purpose |
| :--- | :--- |
| `README.md` | The module article — start reading here. GitHub shows it automatically when you open the module folder. |
| `code/` | One folder per sketch, ready to open in the Arduino IDE. Each folder also has a `diagram.json` (and a `libraries.txt` when libraries are needed) for trying it in Wokwi. The exception is Module 9's deep-sleep and current-meter sketches: their folders contain only the `.ino` file because those sketches only run correctly on a real board. Folders starting with `wokwi-` hold only a Wokwi circuit for a challenge, without a sketch. |
| `assets/` | The article's images, plus `SOURCES.md`, which records the source and license of every image. |

---

[⬅️ Phase 0 — Foundations](../phase-0-foundations/README.md) · [Front page](../README.md) · [Syllabus](../SYLLABUS.md) · [Progress tracker](../PROGRESS.md) · **Start: [Module 5](module-05-gpio-and-pin-map/README.md) ➡️**
