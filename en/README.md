# Fullstack IoT Developer: Zero to Expert

🌐 **English** · [Bahasa Indonesia](../README.md)

A self-study curriculum of **32 modules**, from complete beginner to building a full IoT system: sensors → ESP32 → Raspberry Pi → Node.js server → dashboard on your phone. Each module takes one week, so the whole curriculum takes about 8 months. No background in electronics or programming is needed.

**[Syllabus](SYLLABUS.md)** · **[Progress tracker](PROGRESS.md)** · **[Start with Module 1](phase-0-foundations/module-01-big-picture-iot/README.md)** · **[Mini Smart Home project](mini-smart-home/README.md)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/architecture-fullstack-iot-dark.png">
  <img src="assets/architecture-fullstack-iot.png" alt="Architecture of the Mini Smart Home project in five layers. 1, Devices: Node 1 Home (an ESP32 with five sensors, an OLED display, a lamp, a fan, a pump, and a curtain) and Node 2 Garden (a battery-powered ESP32) that sends its data to Node 1 over ESP-NOW. 2, Gateway: a Raspberry Pi with the Mosquitto MQTT broker, optional Node-RED, and a data queue for when the internet is down; Node 1 connects to it with MQTT over Wi-Fi. 3, Backend and data, across the home network boundary: a Node.js server (Fastify and TypeScript) with a REST API, WebSocket, automation rules, Telegram notifications, and login plus device API keys, connected to the gateway with MQTT over TLS and to a PostgreSQL database with TimescaleDB over SQL. 4, Dashboard: a React web app (PWA) over HTTPS and WebSocket, plus Grafana reading the database over SQL. 5, Operations underneath everything: Docker Compose, deployment with HTTPS, OTA firmware, CI/CD and testing, monitoring and backup, and the final project.">
</picture>

<sub>The five system layers you build throughout the curriculum; the layer numbers follow the order of the phases. Each layer is explained in [Syllabus §2](SYLLABUS.md#2-the-big-picture-what-we-will-build).</sub>

## At a glance

- **Hardware.** Two ESP32 DevKit V1 boards (Node "Home" and Node "Garden") and a Raspberry Pi 5 as the gateway (a Pi 4 is still supported). About 90% of Modules 1–9 can be done without any hardware, using the Wokwi simulator.
- **Software.** A little C++ (Arduino) for the chips, then light JavaScript/TypeScript for everything else: Node.js 24, Fastify, PostgreSQL + TimescaleDB, MQTT (Mosquitto), Modbus RTU, React 19, and Docker.
- **Running project.** "Mini Smart Home" grows from a blinking LED (Module 1) into an online system with TLS, OTA, CI/CD, and monitoring (Module 30), and then into your own final project (Modules 31–32). Everything is low voltage (USB 5 V); this curriculum never touches 220 V mains power.
- **Cost.** Starts at IDR 0 with the simulator; about IDR 500,000–950,000 for the ESP32 kit (two boards); about IDR 1,300,000–2,200,000 if you want a real Raspberry Pi; an optional VPS and domain in the last two months. Prices are from Indonesian marketplaces.
- **Language.** The curriculum was written in Indonesian; this English edition is a complete translation, including the code, the images, and the project's data contract.

## Where to start

1. Read **[SYLLABUS.md](SYLLABUS.md)**: the full map of the 6 phases and 32 modules, prerequisites, the tools you need, and how to learn (about 20 minutes). Beginners only need §1, §2, §4, and §5 at first; there is a glossary in §12 and the project's "data contract" in Appendix A.
2. Copy **[PROGRESS.md](PROGRESS.md)** into your own notes (or fork this repository) to tick off your progress.
3. Open **[Module 1](phase-0-foundations/module-01-big-picture-iot/README.md)** and work through the modules in order. Each module takes one week, 6–10 hours (Module N = Week N).

## Available modules

> [!NOTE]
> Syllabus v1.0 was approved on 9 October 2026, and the modules are written in order. Available now: **Modules 1–11 of 32**: all of Phase 0 and Phase 1, plus Modules 10–11 of Phase 2. The full list of 32 modules is in [PROGRESS.md](PROGRESS.md).

| Module | Title | After this module you can… | Main tools |
| :---: | :--- | :--- | :--- |
| 1 | **[The Big Picture of IoT & Your First Win in 10 Minutes](phase-0-foundations/module-01-big-picture-iot/README.md)** | explain IoT in everyday language, make an LED blink in a simulator, and save your first piece of work on GitHub | Wokwi, a GitHub account |
| 2 | **[Electricity for Beginners, Breadboards, & Your First Upload to a Real ESP32](phase-0-foundations/module-02-electricity-and-first-upload/README.md)** | build an LED circuit on a breadboard without short circuits, calculate resistors, and upload a program to a real ESP32 | Arduino IDE 2, a multimeter, Kit A |
| 3 | **[C++ Programming for the ESP32 from Scratch](phase-0-foundations/module-03-cpp-for-esp32/README.md)** | write your own C++ programs (variables, `if`, loops, functions, arrays, `struct`), read error messages, use libraries, and save your progress with GitHub Desktop | Wokwi, Arduino IDE 2, GitHub Desktop |
| 4 | **[JavaScript & Node.js from Scratch (the Language for Servers & Dashboards)](phase-0-foundations/module-04-javascript-nodejs/README.md)** | open a terminal without fear, write JavaScript in Node.js (variables, JSON, `map`/`filter`, `async`/`await`), install libraries with npm, and build a mini server that receives data from other programs | Visual Studio Code, Node.js 24, the terminal |
| 5 | **[ESP32 Anatomy, the Canonical Pin Map, Power Supply, & Controlling the Real World](phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md)** | choose safe ESP32 pins, power loads without making the ESP32 restart, read buttons without bounce, and control LEDs, a buzzer, a servo, relays, a fan, and a pump | Arduino IDE 2, Wokwi, Kit A + MB102 |
| 6 | **[Reading Sensors: Analog, Digital, & Calibration](phase-1-esp32-embedded/module-06-reading-sensors/README.md)** | read five sensors (light, soil moisture, air temperature and humidity, motion, distance), turn raw numbers into percentages through calibration, reduce noise, and build automatic watering that refuses to run when the water tank is empty | Arduino IDE 2 + Serial Plotter, Wokwi, Kit A + multimeter |
| 7 | **[Sensor Bus Protocols: I2C, 1-Wire, SPI, OLED Display, & Reading Schematics](phase-1-esp32-embedded/module-07-sensor-bus-oled-schematics/README.md)** | connect several devices to shared wires (I2C, 1-Wire, SPI), show all Node 1 readings on an OLED display in a layout you design yourself, log readings to a microSD card (optional), and read schematics | Arduino IDE 2, Wokwi, Kit A Stage 2 |
| 8 | **[Robust Firmware: millis(), State Machines, Modular Code, Watchdog, & Debugging](phase-1-esp32-embedded/module-08-robust-firmware/README.md)** | write firmware that does many things "at the same time" without `delay()`, split a program into several files, keep settings in NVS so they survive a power cut, install a *watchdog* that restarts a stuck program, and hunt bugs systematically | Arduino IDE 2, Wokwi, Kit A |
| 9 | **[Power Supply & Low Power: Adapters, Batteries, Deep Sleep, & Measuring Current](phase-1-esp32-embedded/module-09-power-and-low-power/README.md)** | power a device safely without a laptop, make the ESP32 sleep and wake up by itself, build a safe 18650 battery supply, measure current with the INA219 and calculate battery life, and complete the Phase 1 *checkpoint* | Arduino IDE 2, multimeter, Kit A Stage 2 (2nd ESP32, INA219, 18650 + TP4056 + MT3608) |
| 10 | **[Wi-Fi & HTTP: Devices Start Talking to the Network](phase-2-connectivity/module-10-wifi-and-http/README.md)** | connect the ESP32 to your home Wi-Fi without writing the password in the code, make it reconnect by itself when the Wi-Fi drops, get the time from the internet, send sensor readings to a laptop over HTTP, and turn the lamp on from a phone browser | Arduino IDE 2, Kit A, laptop + Node.js, phone |
| 11 | **[MQTT: The Official Language of IoT & the Project Data Contract](phase-2-connectivity/module-11-mqtt-and-data-contract/README.md)** | run your own MQTT broker on the laptop, make the ESP32 publish readings and receive commands through the broker, get automatic *online*/*offline* status and commands that are always answered with an `ack`, and keep the project's data contract together with its checker | Mosquitto, MQTTX, Kit A, laptop + Node.js |
| 12 | Raspberry Pi & Linux Basics: A Gateway That's Always On | coming soon — [read the summary in the Syllabus](SYLLABUS.md#module-12--raspberry-pi--linux-basics-a-gateway-thats-always-on) | Raspberry Pi (Kit B), SSH, Mosquitto |

The modules of each phase are also listed on the phase pages: **[Phase 0 — Foundations](phase-0-foundations/README.md)**, **[Phase 1 — ESP32 Embedded](phase-1-esp32-embedded/README.md)**, and **[Phase 2 — Connectivity](phase-2-connectivity/README.md)**.

## Curriculum map

| Phase | Modules (= Weeks) | Focus | Real outcome |
| :---: | :---: | :--- | :--- |
| 0 | 1–4 | Foundations: beginner-friendly electricity & a first upload to the ESP32, C++, JavaScript/Node.js, tools installed when needed | An LED blinking in the simulator and on your desk; comfortable reading code |
| 1 | 5–9 | ESP32 embedded: canonical pin map, power supply, sensors, I2C/1-Wire/SPI, OLED, robust firmware, low power & batteries | A standalone Node 1 "Home" that runs 24 hours without restarting; the know-how for a battery-powered Node 2 |
| 2 | 10–15 | Connectivity: Wi-Fi & HTTP, MQTT + data contract, Raspberry Pi & Linux, Node-RED, Node 2 via ESP-NOW, Modbus RTU/RS-485 lab | Two nodes + a Pi gateway on your home network |
| 3 | 16–21 | Backend & data: Fastify + light TypeScript + OpenAPI, SQL & schemas, TimescaleDB, realtime & automation rules (cloud + local safety), user & device security | A server that remembers, decides, and is locked down |
| 4 | 22–25 | Frontend: realtime React dashboard, controls, roles, Grafana & maps | A phone dashboard that other people can use |
| 5 | 26–32 | Operations: Docker Compose, deployment to the internet + TLS/HTTPS + Pi→VPS bridge + PWA, OTA & fleets, testing & CI/CD, monitoring & backup, **capstone** & portfolio | An encrypted online system running 24/7 + a portfolio project |

Details of every module (goals, core concepts, tools, practice, and completion criteria) are in [Syllabus §7](SYLLABUS.md#7-the-32-modules-in-detail).

## Finding your way around

- **Navigation lines** at the start and end of every module: ⬅️ previous module · Syllabus · Progress tracker · next module ➡️.
- **Table of contents** at the start of every article. On GitHub, the **Outline** button (the lines icon at the top right of the file view) also lists every heading.
- **Code** for each module is in that module's `code/` folder. Open a file, then click the copy icon (**Copy raw file**) at the top right of the file view to copy its entire contents.
- **Images** are in each module's `assets/` folder, with their sources and licenses in `assets/SOURCES.md`.
- **The running project** "Mini Smart Home" in its latest version is in [`mini-smart-home/`](mini-smart-home/README.md).

## Repository structure

```
en/                                      ← English edition (this folder); the Indonesian edition is at the repository root
├── phase-0-foundations/ … phase-5-operations-scale/   ← 32 module folders: README.md (article) + assets/ + code/
├── phase-0-foundations/README.md        ← the module list of one phase (every phase has such a page)
├── mini-smart-home/                     ← running-project code (firmware for 2 nodes, tools, edge, backend, frontend, compose)
└── assets/                              ← cross-module images
```

The full folder structure is described in [Syllabus §9](SYLLABUS.md#9-repository-folder-structure). The folder of a new phase is created when its first module is published.

## Images and credits

Images from the internet are used only when their license allows it, and they **always** come with their source and license right below the image (and in each module's `assets/SOURCES.md`). Our own diagrams are licensed **CC BY 4.0**; their `.svg` files are included so you can edit them.

## Contributing

Found a typo, a confusing explanation, or a circuit that doesn't work? Open an issue or a pull request. Feedback from beginners is the most valuable input for beginner-friendly material.

## License

Text and diagrams: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en) · Example code: [MIT](https://opensource.org/licenses/MIT). Third-party images follow their own licenses as stated.

---

Created by [antonprafanto](https://github.com/antonprafanto) · Kodingindonesia
