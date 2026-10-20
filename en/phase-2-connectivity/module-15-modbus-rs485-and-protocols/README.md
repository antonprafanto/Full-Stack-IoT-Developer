# Module 15 — Modbus RTU/RS-485 Lab & Choosing the Right Protocol

🌐 **English** · [Bahasa Indonesia](../../../fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md)

*Phase 2 · Week 15 · Hardware: **Kit A Stage 2** — two MAX485 RS-485 modules, a 5 m UTP cable, and a second ESP32 board (the Node 2 board, borrowed from the garden for a while); plus Node 1, the Pi gateway, and the phone from Modules 12–14 · Prerequisites: **Module 14** (two boards and Node 1 v1.3.0), **Module 7** (buses and schematics), and the voltage divider of **Module 6** · Time: 8–10 hours, spread over the week*

[⬅️ Module 14](../module-14-node-2-esp-now/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 16 ➡️](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md)

---

Mini Smart Home now has two devices: Node 1 inside the house and Node 2 in the garden, which talk to each other through the air. In the working world, especially in modern farming, greenhouses, and factories, you'll often run into yet another kind of device: **industrial sensors**. NPK soil sensors on an oil palm plantation, water flow meters, and pump speed controllers (inverters) rarely use Wi-Fi. They talk over a **two-wire cable that can be hundreds of meters long** (it's called **RS-485**) in a "language" that factories have used since 1979 (it's called **Modbus**). This week, Node 1 learns that language.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Node 1 can only read sensors connected directly to its pins, a few tens of centimeters away at most. | Ordinary sensor cables (1-Wire, I2C, analog) can't cope with long distances and electrical noise. | **RS-485**: two twisted wires that carry a **differential** signal and work over hundreds of meters (Concepts 1–3, Quick Win) |
| One cable is used in both directions, but two devices must never "talk" at the same time. | Two-wire RS-485 has only one path. | **The MAX485 module and the DE/RE pin**: a walkie-talkie's talk button (Concept 2, Practice 1) |
| An industrial sensor sends nothing until it's asked. | Sensors like that use **Modbus RTU**: they only answer questions. | Node 1 learns to ask: the address, the function code, the **register** numbers, and the CRC (Concepts 4–6, Practices 2–4) |
| Every sensor brand puts its data in different registers, with a different scale. | The register map is set by the maker, not by a standard. | **Reading an RS-485 sensor's datasheet** (Concept 7) |
| The dashboard doesn't know about industrial sensors yet. | The data contract has no fields for them yet. | **Node 1 v1.4.0** and **data contract 1.2**: the Modbus readings join the `telemetry` and show up in Node-RED (Practices 5–6) |
| You don't have a "map" yet for choosing a protocol: Wi-Fi, ESP-NOW, RS-485, LoRa, Zigbee, or NB-IoT. | Every protocol has its own strengths and its own price. | **A protocol decision table** and five practice scenarios (Concept 8, Practice 7) |

By the end of the week, the borrowed Node 2 board plays the part of a **mock RS-485 soil sensor**: it keeps the soil moisture, the soil temperature, and the EC (electrical conductivity) in Modbus registers, exactly like an industrial soil sensor. **Node 1 v1.4.0** asks it every 10 seconds over a 5 m UTP cable, puts the answer into its `telemetry`, and Node-RED shows it in the **RS-485 Sensor** group on your phone. When the lab is over, the Node 2 board goes back to the garden, while Node 1 stays ready to read a real RS-485 sensor later (for example for a smart farming capstone in Module 31, Phase 5).

![Module 15 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 2 Connectivity, Modules 10 to 15, is highlighted. Modules 1 to 14 are marked done, and Module 15 is marked YOU ARE HERE with the note: Node 1 reads an industrial sensor over an RS-485 cable, the Phase 2 checkpoint. Below that, the box for this week's Module 15, 8 to 10 hours spread out, with Kit A Stage 2: two MAX485 modules, a 5 m UTP cable, 4.7 kilohm and 10 kilohm resistors, and the second board (Node 2, borrowed). The list of activities: Quick Win, hello over two wires; Practice 1, walkie-talkie, taking turns to talk (DE/RE); Practice 2, a mock RS-485 soil sensor on the second board; Practice 3, Modbus frames by hand; Practice 4, ModbusMaster reading three registers; Practice 5, Node 1 v1.4.0, the RS-485 sensor joins the telemetry; Practice 6, the RS-485 Sensor group in Node-RED with the 5 m cable; Practice 7, choosing a protocol for five scenarios; and the Add-on: contract 1.2, pin map 6, save. Practices 5, 6, 7, and the Add-on are marked with a star, required to pass. Note at the bottom: Wokwi has no RS-485 parts yet and can't connect two ESP32s yet; the Wokwi path uses the mock RS-485 Soil Sensor chip to test its Modbus language (Practices 3–5); the 5 m cable and two boards talking over a cable need real boards.](assets/roadmap-module-15.png)

> [!NOTE]
> **How to use this module.**
>
> - **Two boards, two windows.** As in Module 14, you'll often have two ESP32s plugged into the laptop at the same time: the **Node 1** board and the **second** board (the borrowed Node 2 board, or a third ESP32 if you have one). Open each sketch in **its own Arduino IDE window**: every window has its own board choice, port, and Serial Monitor.
> - **Every command box says where it's used:** **Node 1's Serial Monitor**, **the second board's Serial Monitor**, the **Node-RED editor** (the browser), **On the Pi** (the SSH terminal), or **On the laptop**. The address `192.168.1.37` and Node 1's `device_id` `a4cf12e5b7c0` are only examples; use your own.
> - **The Expected output boxes.** All of this module's sketches and firmware have been compiled with the esp32 package 3.3.12. The sketches that can be simulated have been run in Wokwi with a mock "RS-485 soil sensor", and the mock sensor sketch itself has been tested in Wokwi with two crossed UARTs. The output of two real boards connected by an RS-485 cable is marked **example**: the millisecond numbers on your screen may be slightly different. The Node-RED screenshots are real screenshots with data from a mock Node 1.
> - **No MAX485 modules or second board yet?** Follow the **Wokwi path**. Wokwi has no RS-485 parts and can't connect two ESP32s yet, so this module provides a **mock chip**, the "RS-485 Soil Sensor", for Wokwi. That chip imitates the Modbus language (frames, the CRC, addresses, registers), not the electricity in the cable. The 5 m cable test still needs real boards. The pass criteria for the Wokwi path are in ✅.
> - **No Raspberry Pi yet?** Follow the **laptop path** as in Modules 12–14: the broker and Node-RED run on the laptop, and the address `192.168.1.37` is replaced with your laptop's IP address ([table 8.2 of Module 13](../module-13-node-red-dashboard/README.md#82-adjust-the-addresses-in-every-step)).
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in the browser and in the Node-RED editor, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The MAX485 module gets 5 V, and its RO pin always goes through a voltage divider.** RO puts out almost 5 V, but an ESP32 pin can only tolerate up to 3.6 V. The divider is the same as the one on the HC-SR04's ECHO pin in Module 6: 4.7 kΩ and 10 kΩ (Quick Win step 3). Don't give the MAX485 module 3.3 V: it's made for 5 V.
> 2. **The golden power rules of Module 5 still apply to Node 1.** Node 1's MAX485 module gets 5 V from the top rail (MB102). The order: USB first, then the MB102; turn off the MB102 first, then unplug the USB.
> 3. **The battery rules of Module 9 still apply to the Node 2 board.** Before you plug the Node 2 board into the laptop, first unplug its VIN and GND wires from the battery circuit. During the lab, that board runs on the laptop's USB.
> 4. **Unplug the power before you change any wires** (the safety rule of Module 5), including when you swap wires A and B.
> 5. **Real RS-485 sensors often need 12–24 V** from their own adapter. Never connect such a sensor's power wires to an ESP32 pin or to a breadboard rail. Concept 7 and 🧩 Level 3 explain how to connect one safely.

This module follows the same rhythm as Modules 1–14. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: hello over two wires (55 minutes)](#-quick-win-hello-over-two-wires-55-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Industrial sensors](#1-industrial-sensors-and-cables-hundreds-of-meters-long) · [2 Half duplex](#2-one-pair-of-wires-two-directions-the-max485-and-the-dere-talk-button) · [3 RS-485 bus](#3-the-rs-485-bus-a-chain-terminators-and-a-shared-gnd) · [4 Modbus](#4-modbus-rtu-asking-for-numbered-registers) · [5 Frames & CRC](#5-frames-and-the-crc-a-sealed-letter) · [6 Numbers in registers](#6-numbers-in-registers-16-bits-scale-sign-and-shifted-numbering) · [7 Datasheet](#7-reading-an-rs-485-sensors-datasheet) · [8 Choosing a protocol](#8-choosing-the-right-protocol)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Walkie-talkie](#practice-1--walkie-talkie-taking-turns-to-talk-over-one-pair-of-wires-30-minutes) · [2 Mock sensor](#practice-2--a-mock-rs-485-soil-sensor-on-the-second-board-30-minutes) · [3 Frames by hand](#practice-3--modbus-frames-by-hand-40-minutes) · [4 ModbusMaster](#practice-4--modbusmaster-reading-three-registers-40-minutes) · [5 Node 1 v1.4.0](#practice-5--node-1-v140-the-rs-485-sensor-joins-the-telemetry-50-minutes) · [6 Dashboard & 5 m cable](#practice-6--the-rs-485-sensor-group-in-node-red-and-the-5-m-cable-test-45-minutes) · [7 Choosing a protocol](#practice-7--choosing-a-protocol-the-decision-table-and-five-scenarios-40-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-15-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

1. **Explain why farm and factory sensors use RS-485**: a differential signal on a twisted pair of wires that resists noise over hundreds of meters, and why one cable is used in turns (half duplex).
2. **Build two MAX485 modules** with the DE/RE pin and a voltage divider on the RO pin, then set the talking direction from code without cutting off the last letter.
3. **Understand Modbus RTU down to the byte**: the client and the server (formerly called master and slave), addresses, function codes 03, 04, and 06, holding and input registers, the CRC, exceptions (an official refusal), and timeouts (the waiting time runs out).
4. **Turn an ESP32 into a mock Modbus sensor** with the **ModbusRTUSlave** library and read it with the **ModbusMaster** library.
5. **Read a real RS-485 sensor's datasheet**: power supply, wire colors, baud rate, address, register map, scale, and numbering that is shifted by one.
6. **Put Modbus readings into the `telemetry`** according to data contract 1.2 and show them on the Node-RED dashboard.
7. **Choose the right protocol** (Wi-Fi, ESP-NOW, RS-485/Modbus, LoRa/LoRaWAN, Zigbee/Thread, NB-IoT/LTE-M) for a real problem with a decision table.

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **Two "TTL to RS485" MAX485 modules** | A small blue board with a MAX485 chip, four pins on one side (**RO**, **RE**, **DE**, **DI**), four pins on the other side (**VCC**, **B**, **A**, **GND**), and **A** and **B** screw terminals. One for Node 1, one for the second board. |
| **The second board** | The Node 2 board from Module 14, borrowed during the lab. Its sensors can stay connected. Have a third ESP32? Use that one so that Node 2 stays in the garden, and get a spare 400-hole breadboard ready for its divider (Quick Win step 4). |
| **Resistors** | 2 × **4.7 kΩ** (yellow-violet-red, or yellow-violet-black-brown for the 5-band code) and 2 × **10 kΩ** (brown-black-orange, or brown-black-black-red). One pair for each MAX485 module. |
| **Jumper wires** | 12 male–female, 4 female–female, and 2 male–male, plus a few spares. 20 cm ones give you more room. For the VCC wire of Node 1's module (Quick Win step 3), use the longest one: that wire runs along the left side of the workbench up to the top rail. |
| **A 5 m UTP cable (LAN cable)** | For Practice 6. A used LAN cable is fine too: cut off its connectors, then strip about 7 mm from the ends of its wires. Solid UTP wires can be plugged straight into the breadboard. Stranded wires (a flexible LAN cable) can't: for its GND wire, twist the stranded end tightly around the metal pin of a male–male jumper wire, wrap it with tape, then plug in that jumper wire (Practice 6.4). |
| **A small flat-head screwdriver** | For the MAX485 module's screw terminals. |
| **Wire strippers** (or side cutters and a utility knife) | For Practice 6: stripping about 3 cm of the UTP cable's outer jacket and about 7 mm from the ends of three of its wires. |
| **Multimeter** | For measuring the second board's VIN voltage and checking the voltage divider. |
| **Node 1 v1.3.0, the Pi gateway, Node-RED, and the phone** | All from Modules 12–14. |
| **Laptop** | **Arduino IDE 2** with the **esp32 3.3.12** package, the libraries from Modules 6–14, **MQTTX**, a terminal for SSH to the Pi, **VS Code** with the `mini-smart-home` folder, and **GitHub Desktop**. |
| **Two USB data cables** | So that Node 1 and the second board can be plugged in at the same time. |
| **Wokwi path** (without MAX485 modules or without a second board) | A [Wokwi](https://wokwi.com) account as in Modules 2–14. The mock "RS-485 Soil Sensor" chip is in the [`code/wokwi-rs485-soil-sensor`](code/wokwi-rs485-soil-sensor) folder. |
| **Optional** | A USB–RS485 converter (IDR 15,000–30,000) to read the bus from a laptop (🔬), a real RS-485 soil sensor (IDR 150,000–250,000, with a 12 V adapter) for 🧩 Level 3, and two 470–560 Ω resistors (🚨). |

**Install two new libraries.** Click the **Library Manager** icon in Arduino IDE's left sidebar, then:

1. Type `ModbusMaster`, find the entry **ModbusMaster by Doc Walker**, choose version **2.0.1**, then click **INSTALL**. Node 1 uses this library to **ask**.
2. Type `ModbusRTUSlave`, find the entry **ModbusRTUSlave by C. M. Bulliner**, choose version **3.1.2**, then click **INSTALL**. If an `Install library dependencies` window appears, click **INSTALL ALL**: this library needs three small libraries by the same author (**ModbusADU**, **ModbusRTUComm**, and **ModbusSlaveLogic**). The second board uses this library to **answer**.

Versions used in this module (October 2026): the **esp32 3.3.12** package, **ModbusMaster 2.0.1**, **ModbusRTUSlave 3.1.2** (installed along with it: **ModbusADU 1.0.2**, **ModbusRTUComm 1.3.2**, **ModbusSlaveLogic 1.0.1**), and Node 1's libraries from Modules 6–14. The Syllabus originally named the **eModbus** library for the second board. This module replaces it with **ModbusRTUSlave**, because eModbus isn't in the Library Manager and needs a more complicated manual installation; 🔬 discusses when eModbus is worth using.

---

## 🏆 Quick Win: hello over two wires (55 minutes)

The goal: the second board sends `hello 1`, `hello 2`, and so on over **two wires** (A and B), and Node 1's Serial Monitor shows them. Along the way, both MAX485 modules get connected properly and are ready to use for the rest of the week.

> 🖥️ **Tools:** **Arduino IDE** with two windows, the Node 1 board and the second board plugged into the laptop over USB, a multimeter, and a small screwdriver. From the Quick Win until Practice 4, the Node 1 board runs practice sketches, so the dashboard shows Node 1 as `offline` and the fan automation stops. That's normal; Practice 5 puts Node 1's firmware back, this time version 1.4.0. The Wi-Fi name and password saved on the Node 1 board stay safe as long as the option **Tools → Erase All Flash Before Sketch Upload** stays **Disabled** (its default).
>
> 🖥️ **Wokwi path:** the Quick Win and Practice 1 need two boards talking over a cable, and Wokwi can't connect two ESP32s yet (checked in the Wokwi FAQ, October 2026). Read the steps and their results, then continue with Concepts 1–3. Also create `notes-module15.md` as at the end of step 4 (without the VIN number): Practice 7 and 🧩 use it. The Wokwi path starts being used in Practice 3.

### Step 1 — Prepare both boards (5 minutes)

1. Stick the labels **Node 1** and **second board** on the two boards and their USB cables. The **Node 2** label from Module 14 can stay; during the lab, we call that board "the second board".
2. **The second board:** using a third ESP32? Skip this item: Node 2 stays in the garden, and step 4 explains the breadboard for your third ESP32. Using the Node 2 board? Bring that board in from where it's installed. First remove the two wires that go to the battery circuit (the rule of Module 9, as in Module 14): the wire from the **VIN** pin to the top rail (+) at column 29, and the wire from the **GND** pin of the left row (just above VIN) to the top rail (−) at column 28. Unplug both ends of each wire (from the board's pin and from the top rail), then put the wires away: the **VIN** pin is used by the MAX485 module in step 4. **Don't** unplug the black wire from the **GND** pin of the right row (above 3V3) to the bottom rail (−): that's the wire that gives GND to the MAX485 module in step 4. You don't need to plug in its USB yet. The battery can stay in its holder, but as long as it does, the top rail (+) still carries 5.0 V, so don't plug anything into the top rail. The battery circuit isn't used during the lab. Node 2's sensors can stay connected too.
3. **The Node 1 board:** first turn off the workbench's MB102, then unplug the board's USB cable from its charger. Don't plug it into the laptop yet: steps 2 and 3 change wires, so the board must have no power.

Once the Node 2 board is disconnected from its battery, Node 1 no longer hears its ESP-NOW packets. If Node 1 is still running firmware v1.3.0, Node 2's status on the dashboard changes to `offline` after 16 minutes. That's normal: reporting a Node 2 that can't be heard is exactly Node 1's job.

### Step 2 — Move Node 1's status LED one column to the left (5 minutes)

From this week on, pin **D4** sets the talking direction of the MAX485 module (the DE/RE pin, Concept 2). The status LED that has been on D4 until now moves to **D2**. Why doesn't the MAX485 module just use D2? The MAX485 module pulls its DE/RE pin up to 5 V through a resistor. If that pin were D2, the board could fail to enter upload mode (🚨 has the story). D4 doesn't have that problem.

All the connections in this step are on the **lower breadboard**, and the Node 1 board's USB stays unplugged.

| Part | Old position | New position |
| :--- | :--- | :--- |
| 220 Ω resistor | 8e → 8g | **7e → 7g** (7e = the D2 pin's strip) |
| Red LED | long leg 8i, short leg 9i | long leg **7i**, short leg **8i** |
| Black wire | 9j → bottom rail (−) | **8j** → bottom rail (−); the end in the rail doesn't need to move |

After this step, **the column 8, rows f–j strip is the LED's cathode strip (GND)**, while column 9, rows f–j is empty and ready for step 3.

### Step 3 — Build the MAX485 module onto Node 1 (15 minutes)

The MAX485 module isn't plugged into the breadboard. Its pins are too far apart, so they're connected with male–female wires: the female end on the module's pin, the male end in the breadboard. Put the module on the table along the bottom edge of the lower breadboard, as in the picture (not underneath the breadboard), with its screw terminals facing outward. Before you start, make sure the Node 1 board's USB is still unplugged and the MB102 is off.

![Illustration of the Node 1 workbench after Step 3, seen from above, with the old parts faded. On the lower breadboard, the new parts are highlighted: the status LED moved to D2, that is, the 220 ohm resistor from 7e to 7g, the red LED with its long leg in 7i and its short leg in 8i, and the black wire from 8j to the bottom rail minus at column 8; a brown-black-orange 10 kilohm resistor lying along row c from 5c to 9c; a yellow-violet-red 4.7 kilohm resistor from 9e to 9g crossing the center channel. The blue MAX485 module lies on the table along the bottom edge of the lower breadboard (not underneath it), with its DI, DE, RE, and RO pins facing the breadboard and its screw terminals facing outward. Its wires: green RO to 9i, yellow DE to 8e, pink RE to 8d, blue DI to 10e, black GND to the bottom rail minus at column 14, and red VCC running along the left side of the table to the top rail plus at column 3, which carries 5 volts from the MB102. Pins A and B aren't connected yet. A zoom box of columns 3 to 15 numbers the connections inside the box 1 to 7 (the VCC wire is mentioned in the side note), and stresses that column 9, rows a to e, is the RX2 strip, the divider's midpoint, while column 9, rows f to j, is the RO strip, connected only through the 4.7 kilohm resistor; hole 8c under the body of the 10 kilohm resistor is left empty.](assets/rs485-circuit-node1.png)

| Part | From | To | What it's for |
| :--- | :--- | :--- | :--- |
| **10 kΩ** resistor (brown-black-orange) | 9c | 5c | the divider's bottom resistor: from the RX2 strip to the GND strip |
| **4.7 kΩ** resistor (yellow-violet-red) | 9e | 9g | the divider's top resistor; it crosses the center channel |
| Male–female wire | the module's **RO** pin | 9i | the module's receiver output (5 V) goes into the divider |
| Male–female wire | the module's **DE** pin | 8e | the D4 strip |
| Male–female wire | the module's **RE** pin | 8d | the D4 strip too: DE and RE are now joined by the column 8 strip |
| Male–female wire | the module's **DI** pin | 10e | the TX2 strip (GPIO 17) |
| **Black** male–female wire | the module's **GND** pin | bottom rail (−) column 14 | shared GND |
| **Red** male–female wire | the module's **VCC** pin | top rail (+) column 3 | 5 V from the MB102, **not** the 3.3 V bottom rail |

This divider pattern is the same as the HC-SR04's ECHO divider in Module 6: from 5 V, its midpoint gets 5 × 10 / (4.7 + 10) ≈ **3.4 V**, which is safe for an ESP32 pin. The midpoint is the RX2 strip (column 9, rows a–e), where the board's RX2 pin is plugged in.

> 💡 **Watch out for the two halves of column 9.** Column 9 **above** the channel (9a–9e) is the strip of the **RX2** pin. Column 9 **below** the channel (9f–9j) is the strip of the module's **RO** pin. The only link between them is the 4.7 kΩ resistor. If the RO wire is plugged into 9a–9e, almost 5 V goes straight into RX2.

Check before you power up (with your eyes and fingers):

- The module's red VCC wire goes into the **top** rail (+), labeled **5V**, not the bottom rail (+), labeled **3V3**.
- Hole **8c**, right under the body of the 10 kΩ resistor (9c–5c), stays empty: the DE wire is in **8e**, RE in **8d**.
- The RO wire is in 9i, **not** 9a–9e.

### Step 4 — Build the MAX485 module onto the second board (10 minutes)

The second board isn't plugged into a breadboard, so its voltage divider goes on the **lower half of the mini breadboard** (rows f–j), which is still empty. The battery circuit on the upper half isn't touched. Make sure the second board's USB is unplugged. Using a third ESP32? Get a 400-hole breadboard ready like Node 2's mini breadboard, first connect the board's **GND** pin (right row, above 3V3) to the bottom rail (−) at column 28 with a black male–female wire as in Module 14 Practice 2.2, then follow the table below. Step 1 item 2 and ➕ A steps 2–5 don't apply to you, but you still do ➕ A step 1 (`rs485 off` and removing the UTP cable from Node 1).

![Illustration of Step 4 in two panels. Top panel, a zoom of the lower half of the mini breadboard, columns 11 to 30, rows f to j and the bottom rail, with markers 1 to 8: the module's green RO wire goes into 14f; a yellow-violet-red 4.7 kilohm resistor from 14h to 18h; a brown-black-orange 10 kilohm resistor from 18i to 22i; a black wire from 22j to the bottom rail minus at column 22; a purple wire from 18f to the board's RX2 pin; the yellow DE wire to 24f and the pink RE wire to 24g; a brown wire from 24i to the board's D4 pin; the module's black GND wire to the bottom rail minus at column 23. The faded wires are Module 14 wires that stay connected: Node 2's sensors, the board's 3V3 on the plus rail at column 29, and the board's GND on the minus rail at column 28. The upper half holds Module 9's battery circuit and isn't touched. Bottom panel, a wiring map between the MAX485 module and the second board: a blue DI wire to the TX2 pin and a red VCC wire to the VIN pin, both female–female; the ends of the DE, RE, and RO wires go to 24f, 24g, and 14f; the module's GND goes to the bottom rail minus 23; the board's RX2 and D4 pins receive the wires from 18f and 24i; pins A and B are only connected in Step 5. The second board's USB to the laptop is plugged in after all the wires are in place.](assets/rs485-circuit-second-board.png)

| Part | From | To | What it's for |
| :--- | :--- | :--- | :--- |
| Male–female wire | the module's **RO** pin | 14f | the module's receiver output goes into the divider |
| **4.7 kΩ** resistor | 14h | 18h | the divider's top resistor |
| **10 kΩ** resistor | 18i | 22i | the divider's bottom resistor |
| **Black** male–male wire | 22j | bottom rail (−) column 22 | the divider's end to GND |
| Male–female wire | 18f | the board's **RX2** pin | the divider's midpoint (about 3.2 V) to RX2 (GPIO 16) |
| Male–female wire | the module's **DE** pin | 24f | |
| Male–female wire | the module's **RE** pin | 24g | DE and RE are joined by the column 24 strip |
| Male–female wire | 24i | the board's **D4** pin | the DE/RE strip to D4 |
| Female–female wire | the module's **DI** pin | the board's **TX2** pin | TX2 (GPIO 17) |
| **Red** female–female wire | the module's **VCC** pin | the board's **VIN** pin | 5 V from the laptop's USB, through the VIN pin |
| **Black** male–female wire | the module's **GND** pin | bottom rail (−) column 23 | shared GND |

The mini breadboard's bottom rail (−) is already connected to the board's GND through Module 14's black wire. The **top** rail (−) isn't: the GND wire to the battery circuit was removed in step 1, so don't use the top rail.

Now measure the VIN voltage. The module's VCC and GND pins are already covered by the wires' female ends, so measure on the second board. Plug one spare wire into an empty hole in the mini breadboard's bottom rail (−) as a probe extension (Module 5). Plug the second board's USB into the laptop, then turn the multimeter to **V⎓ 20** (the red probe in the **VΩmA** jack, not **10A**). Touch the black probe to the metal end of that spare wire and the red probe to the solder point of the **VIN** pin on the top surface of the second board (next to the VIN label). Careful: the tip of the red probe must not also touch the **GND** solder point right next to it. The display usually shows **about 4.6–4.8 V**, not 5.0 V, because the ESP32 board has a protection diode between the USB socket and the VIN pin. The MAX485 datasheet asks for 4.75–5.25 V; for a lab on the table with a 5 m cable at 9600 baud, a number slightly below that is still enough. If you install it permanently later, give the module a full 5 V as on Node 1. A negative number? The red and black probes are swapped. The number is **0**? Unplug the USB, make sure the spare wire is in the bottom rail (−) and Module 14's black wire from the **GND** pin of the right row to the bottom rail (−) is still in place, plug the USB back in, then measure again with the tip of the red probe pressed firmly on the VIN solder point. Also look at the small light on the second board's MAX485 module: as long as the USB is plugged in, that light must be on. If it's off, unplug the USB, then check the module's VCC wire to the **VIN** pin and the module's GND wire to the bottom rail (−) at column 23.

Create the file `notes-module15.md` in the `module-15` folder of the `learn-iot` repository (**Documents → GitHub → learn-iot → module-15**; create the folder if it doesn't exist yet, as in Module 14). In VS Code: **File → New Text File**, then **File → Save As…**. Write that VIN number in it. This file is used again in Practices 6 and 7.

### Step 5 — Connect the two modules (5 minutes)

Unplug the second board's USB again, then also pull the spare probe wire out of the mini breadboard's bottom rail (−). From the Quick Win until Practice 5, the two modules are connected with short wires; the 5 m UTP cable only goes in during Practice 6. So put the second board's mini breadboard right next to the lower breadboard of the Node 1 workbench, with the two MAX485 modules close together: the three wires below are only about 20 cm long.

1. Connect a female–female wire from pin **A** of Node 1's module to pin **A** of the second board's module.
2. Connect a female–female wire from pin **B** of Node 1's module to pin **B** of the second board's module.
3. Connect a black male–male wire from the **bottom rail (−) at column 15** of the Node 1 workbench to the **bottom rail (−) at column 20** of the mini breadboard. This is the third wire, the **shared GND** (Concept 3).

**A to A, B to B.** Don't cross them. If your two modules are exactly the same (usually bought as a pair from the same seller), their A and B labels match. Modules from another maker? Still start with A to A. If the `hello` messages don't appear in step 6, swap A and B on one of the modules with the power unplugged, as in step 7: swapping them doesn't damage anything. Leave the small resistor marked "121" near the screw terminal (the 120 Ω terminator) alone: two modules at the two ends of a cable really do need two terminators (Concept 3).

### Step 6 — Upload the sketches and see the `hello` (10 minutes)

1. Plug the **second board**'s USB into the laptop. In the first Arduino IDE window, open **File → New Sketch**, delete its contents, then paste the code below. Save it as `module15_hello_send` in the `module-15` folder. Choose **DOIT ESP32 DEVKIT V1** and the second board's port, then click **Upload**.

   ```cpp
   // Module 15 - Quick Win, the SECOND board (the borrowed Node 2 board): the sender.
   // Every second it sends one line of text through the MAX485 module onto the RS-485 cable.
   // This board "talks all the time": DE/RE is set HIGH once in setup() and never brought down.
   // esp32 package 3.3.12; no extra library needed.

   const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module (via a voltage divider); not used in this sketch yet
   const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together

   unsigned long number = 0;

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // HIGH = the module's transmitter is on: this board holds the cable to talk
     // The pins MUST be written: without them, the esp32 3.x package uses GPIO 4 and 25 for Serial2, not 16 and 17.
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
     Serial.println();
     Serial.println("Second board ready to send over RS-485 (9600 baud).");
   }

   void loop() {
     number++;
     Serial2.printf("hello %lu from the second board\n", number);  // onto the RS-485 cable
     Serial.printf("sent: hello %lu\n", number);                   // to this board's Serial Monitor
     delay(1000);
   }
   ```

2. Plug the **Node 1 board**'s USB into the laptop, **then** turn on the MB102 (the golden rule: USB first, then the MB102). Node 1's MAX485 module now gets 5 V; the small light on the module turns on.
3. Open **File → New Sketch** again. Arduino IDE opens a second window. Delete its contents, paste the code below, then save it as `module15_hello_listen` in the `module-15` folder. In this second window, choose **DOIT ESP32 DEVKIT V1** and the Node 1 board's port (a small practice sketch fits in the default program shelf, as in Module 14), click **Upload**, then open this window's **Serial Monitor** (115200 baud). Not sure which port it is? Unplug the second board for a moment: the port that stays is Node 1's.

   ```cpp
   // Module 15 - Quick Win, the NODE 1 board: the listener.
   // Shows every line of text that arrives over the RS-485 cable. This board "stays quiet all the time":
   // DE/RE is set LOW once in setup(), so its MAX485 module's transmitter never turns on.
   // esp32 package 3.3.12; no extra library needed.

   const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
   const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module; not used in this sketch yet
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together

   char line[80];  // the letters collected so far, up to the end-of-line mark
   int length = 0;
   unsigned long lastLetterTime = 0;
   unsigned long lastPrintTime = 0;

   // Prints the content of "line". If a letter is unreadable, all of it is printed as hexadecimal numbers.
   void printLine(bool complete) {
     bool allText = complete;
     for (int i = 0; i < length; i++) {
       uint8_t b = (uint8_t)line[i];
       if (b < 32 || b > 126) {
         allText = false;
       }
     }
     line[length] = '\0';
     if (allText) {
       Serial.printf("received: %s\n", line);
     } else {
       Serial.print("received, but not intact text:");
       for (int i = 0; i < length; i++) {
         Serial.printf(" %02X", (uint8_t)line[i]);
       }
       Serial.println();
     }
     length = 0;
     lastPrintTime = millis();
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // LOW = the module's receiver on, its transmitter off: this board only listens
     // The pins MUST be written: without them, the esp32 3.x package uses GPIO 4 and 25 for Serial2, not 16 and 17.
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
     Serial.println();
     Serial.println("Node 1 board listening to the RS-485 cable (9600 baud)...");
     lastPrintTime = millis();
   }

   void loop() {
     while (Serial2.available() > 0) {
       char letter = Serial2.read();
       lastLetterTime = millis();
       if (letter == '\n') {
         printLine(true);  // one complete line
       } else if (letter != '\r') {
         line[length] = letter;
         length++;
         if (length >= (int)sizeof(line) - 1) {
           printLine(false);  // too long without an end of line: surely not a proper message
         }
       }
     }
     if (length > 0 && millis() - lastLetterTime > 200) {
       printLine(false);  // a piece without an end of line, then the cable went quiet
     }
     if (millis() - lastPrintTime > 3000) {
       Serial.println("... 3 seconds without a message. Check wires A, B, GND, and the power of both modules.");
       lastPrintTime = millis();
     }
   }
   ```

4. **Expected output** in Node 1's Serial Monitor (example):

   ```text
   Node 1 board listening to the RS-485 cable (9600 baud)...
   received: hello 37 from the second board
   received: hello 38 from the second board
   received: hello 39 from the second board
   ```

   The numbers don't start at 1 because the second board has been sending for a while already. The first line may be cut off (for example `received: lo 36 from the second board`): Node 1 started listening in the middle of a sentence. The second board's Serial Monitor (the first window) prints `sent: hello 37`, `sent: hello 38`, and so on.

   All you see is `... 3 seconds without a message. Check wires A, B, GND, and the power of both modules.`? Open the collapsible section "Quick Win: nothing arrives at all" in [🚨](#-troubleshooting).

### Step 7 — Experiment: swap A and B (5 minutes)

1. Turn off the MB102, then unplug the USB from both boards (the safety rule: unplug the power before you change any wires).
2. On the second board's module only, swap the two wires: the wire from Node 1's A now goes to pin **B**, and the wire from Node 1's B to pin **A**.
3. Plug in the second board's USB, plug in the Node 1 board's USB, then turn on the MB102. Node 1's Serial Monitor now prints strange lines like `received, but not intact text: 00 F5 ...` (the numbers on your screen will certainly be different), or only `... 3 seconds without a message`.
4. Turn off the MB102, unplug both USB cables, put the wires back as they were before item 2 (A to A and B to B, unless you really had to swap them in step 6), then power everything up again as in step 6. The `hello` messages appear again.

Swapped A and B wires don't damage anything; only the content gets flipped. Remember this symptom: later, when you connect a sensor from another maker, swapped A and B are suspect number one.

**What just happened?** `Serial2` on the second board sends letters as usual through the TX2 pin, but the MAX485 module turns them into **two opposite signals** on wires A and B. The MAX485 module on Node 1 reads the **difference** between the two wires and turns it back into letters on the RX2 pin. This time the talking direction is locked: the second board always talks (DE/RE is set HIGH once in `setup()`), while Node 1 always listens (DE/RE LOW). It's like a radio broadcast: one transmitter, one listener. Practice 1 makes the two **take turns** talking.

> ➡️ **Done with the Quick Win?** Read [Concept 1](#1-industrial-sensors-and-cables-hundreds-of-meters-long) to [Concept 3](#3-the-rs-485-bus-a-chain-terminators-and-a-shared-gnd), then do the practices in the order given at the start of 🧠 Concepts. Leave this circuit in place: every practice this week uses it.

---

## 🧠 The "Why" Concepts

The eight concepts below explain **why** industrial sensors are connected this way, one per section, and **you don't need to read them all at once**. Concepts and practices take turns, in this order:

1. Quick Win → **Concepts 1–3** → Practice 1 (walkie-talkie)
2. **Concepts 4–6** → Practices 2, 3, and 4 (the mock sensor, frames by hand, ModbusMaster)
3. **Concept 7** → Practices 5 and 6 (Node 1 v1.4.0, the dashboard, the 5 m cable)
4. **Concept 8** → Practice 7 (choosing a protocol) → 🧩 Challenges → ➕ Add-on

> 🖥️ **Want to try something in the Concepts section?** It's not required. The code snippets in the Concepts section are taken from the sketches and firmware you use in the Practices.

### 1. Industrial sensors and cables hundreds of meters long

Imagine a half-hectare melon greenhouse. Ten soil sensors are buried in the beds, and the control panel is in the shed, 200 meters from the farthest bed. Near the beds there's a water pump and big fans whose motors spread electrical noise. How does the data from those ten sensors reach the panel?

- **Wi-Fi?** The signal weakens among the steel frames and wet leaves, every sensor needs power for its radio, and every device needs the Wi-Fi password.
- **Ordinary sensor cables** like Node 1's (analog, 1-Wire, I2C)? This kind of cable only works over a few meters, or even less. The signal is measured against GND. On a 200 m cable, the noise from the motors clings to the signal wire, and even the GND at the two ends can differ, so the 0s and 1s get mixed up.

Industry uses a third way: **RS-485**. Every bit is sent over **a twisted pair of wires** (A and B) with two **opposite** voltages: when A goes up, B goes down. The receiver doesn't care what voltage each wire has; it only reads the **difference** between A and B. Noise from a motor hits both tightly twisted wires **equally**, so the difference doesn't change. This is called a **differential signal**.

![Diagram of an ordinary signal and a differential signal. Left, an ordinary signal, one wire plus GND: the receiver reads the wire's voltage against GND, and two red noise spikes cross the threshold line, so they're marked with a cross; a 0 is read as a 1 and the other way around. This works for short wires on a board or a breadboard (UART, I2C, analog sensors), not for hundreds of meters. Right, differential RS-485 with two twisted wires: wires A and B are always opposite, and the noise hits both of them with the same spike. The receiver reads A minus B, so the spikes disappear and every bit gets a check mark; the receiver can still reliably read a difference as small as 0.2 volts. Note at the bottom: an RS-485 cable can be about 1,200 m long at low speeds (Modbus specification: 1,000 m at 9600 baud).](assets/differential-signal.png)

The analogy is two passengers in a boat whose heights differ by 10 cm. The waves lift and drop the boat, but the difference in their heights stays 10 cm. An RS-485 receiver only measures that difference, and it still reads it reliably even when the difference shrinks to **0.2 V**. As a result, RS-485 can reach **about 1,200 meters** at low speeds. The Modbus specification states **1,000 m** at 9600 baud, and about 600 m with an ordinary category 5 (Cat5) LAN cable. One pair of wires can also be shared in turns by many devices, up to 32 devices that use a standard transceiver chip (transmitter and receiver in one) like the MAX485 (Concept 3).

RS-485 only defines the **electricity**: how bits travel along the cable. What is said is set by another protocol. In farming and factories, the protocol most often used on top of RS-485 is **Modbus RTU** (Concept 4). Think of RS-485 as the **phone line**, and Modbus as the **rules for talking** on that phone. Here's what you build this week:

![Diagram of the journey of one soil sensor reading from a two-wire cable to MQTT, then to the dashboard. Left, the second board as a mock soil sensor, labeled Modbus server (formerly slave): register 0 holds 585, which means 58.5 percent, register 1 holds 253, which means 25.3 degrees Celsius, register 2 EC 1,200 microsiemens per centimeter, register 3 address 1; it answers only when asked. The RS-485 A/B cable (5 m UTP plus GND, Modbus RTU 9600 8N1), with a MAX485 module at each end, leads to Node 1 Home v1.4.0, labeled Modbus client (formerly master), which asks every 10 seconds: server 1, function 03, registers 0 to 2, then adds three fields to the telemetry: soil_rs485, soil_temperature, and ec. An MQTT arrow over Wi-Fi goes to the Pi gateway 192.168.1.37, which holds Mosquitto and Node-RED with the RS-485 Sensor group, then on to the phone with the Home dashboard. Note: RS-485 is the phone line (the electricity in the cable), Modbus RTU is the rules for talking on that line; the MAX485 modules at both ends turn the UART letters into a differential signal on wires A and B. A real RS-485 soil sensor works exactly like the second board: a small microcontroller inside reads the electrodes, stores the results in registers, then answers over RS-485.](assets/from-rs485-sensor-to-phone.png)

| | The second board (mock sensor) | Node 1 "Home" | Pi gateway |
| :--- | :--- | :--- | :--- |
| Its role | **Modbus server**: keeps the soil moisture, soil temperature, and EC in registers, then answers when asked | **Modbus client**: asks every 10 seconds, then puts the answer into its `telemetry` | the broker and Node-RED, as usual |
| Talks to | Node 1, over the RS-485 cable | the second board (RS-485) and the broker (MQTT over Wi-Fi) | Node 1 and the phone |
| Cable | MAX485 module | MAX485 module | — |

A real RS-485 soil sensor works exactly like the second board: inside it there's a small microcontroller that reads its soil electrodes, stores the results in registers, then answers over RS-485. So this week you also get to see the "insides" of an industrial sensor.

### 2. One pair of wires, two directions: the MAX485 and the DE/RE talk button

The ESP32 can't "speak RS-485" directly. It only has UARTs: a TX pin for sending and an RX pin for receiving, each one wire measured against GND (Module 7). The **MAX485 module** acts as the translator:

| Module pin | Full name | Connected to | Its job |
| :--- | :--- | :--- | :--- |
| **DI** | Driver Input | TX2 (GPIO 17) | the letters from the ESP32 to be sent onto the cable |
| **RO** | Receiver Output | RX2 (GPIO 16), through the voltage divider | the letters from the cable for the ESP32 |
| **DE** | Driver Enable | D4 | HIGH = the module's transmitter is on |
| **RE** | Receiver Enable (active LOW) | D4, joined with DE | LOW = the module's receiver is on |
| **A**, **B** | — | the bus cable | the differential pair of wires |
| **VCC**, **GND** | — | 5 V and GND | the module's power |

Wires A and B are only **one pair**. If two devices send at the same time, their signals collide and the content is ruined. That's why two-wire RS-485 works **half duplex**: taking turns, like a **walkie-talkie**. Press the talk button, talk, release it, then listen for the answer. On the MAX485 module, that talk button is the **DE** and **RE** pins joined together:

- **D4 HIGH** = DE active and RE off: the module **talks**. The letters from TX2 go out onto the cable, and the module doesn't hear anything.
- **D4 LOW** = DE off and RE active: the module **listens**. The letters from the cable come into RX2, and the module's transmitter stays quiet so it doesn't disturb other devices.

![Diagram of the MAX485 module and the DE/RE talk button: one pair of wires used in turns, like a walkie-talkie. Left, D4 HIGH means talk: the ESP32's TX2 (GPIO 17) goes into the DI pin, the transmitter is on and sends the letters onto wires A and B at the same time, with voltages that are always opposite, while the receiver (the RO pin to RX2, GPIO 16) is off. Right, D4 LOW means listen: the transmitter is quiet, and the receiver reads the difference, wire A minus B, then passes the letters on to RX2. The DE and RE pins are joined and connected to D4. A box with the correct talking order: 1 D4 HIGH, press the talk button; 2 Serial2.print, hand the letters over to the UART queue; 3 Serial2.flush, wait for the last letter to go out; 4 D4 LOW, release and go back to listening. A voltage box: the MAX485 module gets 5 volts; DI, DE, and RE already treat 2.0 volts as HIGH, so 3.3 volts from the ESP32 is enough; RO puts out almost 5 volts, which the 4.7 kilohm plus 10 kilohm divider turns into about 3.4 volts at RX2, safe for an ESP32 pin; the RX and TX pins of Serial2 are always written: Serial2.begin(9600, SERIAL_8N1, 16, 17).](assets/max485-and-de-re.png)

There's one important timing trap. On the ESP32, `Serial2.print()` doesn't wait for its letters to actually go out; it only hands them over to the UART's send queue and returns right away. If the talk button is released immediately, the letters still waiting in the queue get cut off halfway. The cure is `Serial2.flush()`: in the esp32 3.x package, this function waits until the queue is empty **and** the last bit has left the pin. The order is always this:

```cpp
digitalWrite(PIN_RS485_DE_RE, HIGH);  // press the talk button
Serial2.print(text);
Serial2.flush();                      // wait until the last letter has really gone out onto the cable
digitalWrite(PIN_RS485_DE_RE, LOW);   // release the talk button: back to listening
```

Practice 1 proves it: without `flush()`, the reply is lost.

Three more things about this blue module:

- **This module needs 5 V** (MAX485 datasheet: 4.75–5.25 V). The DI, DE, and RE inputs already treat 2.0 V as HIGH, so 3.3 V from the ESP32 is enough. The RO output is another story: its voltage is almost 5 V, while an ESP32 pin's safe limit is 3.6 V. That's why RO always goes through the **4.7 kΩ + 10 kΩ voltage divider**, the same as the HC-SR04's ECHO divider in Module 6.
- **While the module talks, RO floats** (its receiver is off), and a resistor on the module pulls it up. After the divider, RX2 only gets about 2 V, a "gray-zone" value that can be read as garbage letters. That's why, every time it finishes talking, our code **throws away the contents of the receive queue** before listening for the answer.
- **This module pulls DE and RE up to 5 V through a 10 kΩ resistor.** If its DE/RE pin were D2, the board could fail to enter upload mode, because D2 is a strapping pin that must be LOW or floating when the board enters upload mode (Module 5). That's why D4 is used for DE/RE and the status LED moves to D2. `PIN-MAP.md` goes up to version 6.

> ⚠️ **Write the `Serial2` pins every time.** In the esp32 3.x package, `Serial2.begin(9600)` without pins uses **GPIO 4 and 25**, not 16 and 17 as in old tutorials (the 2.x package). On Node 1, GPIO 25 is the gate of the **pump**'s MOSFET! So in this module it's always written in full: `Serial2.begin(9600, SERIAL_8N1, 16, 17)`, that is, the speed, the format, the RX pin, then the TX pin.

### 3. The RS-485 bus: a chain, terminators, and a shared GND

One pair of RS-485 wires can be shared by many devices. The group of devices on one cable is called a **bus**, like the I2C bus in Module 7, only much longer. There are four rules that keep a long bus healthy:

1. **Its shape is a chain** (a daisy chain): the main cable runs from device to device. A branch from the main cable to a device must be short (Modbus specification: at most 20 m), and a star shape (many cables from one point) isn't allowed.
2. **A 120 Ω terminator at both ends of the main cable, and only there.** A signal that reaches the end of a cable can bounce back, like a wave hitting the wall of a pool. A 120 Ω resistor, the same as the cable's "resistance", damps that reflection. The blue MAX485 module already carries one terminator (the small resistor marked "121" near the screw terminal). Two modules at the two ends of the cable = exactly two terminators. If a third device is ever added in the middle, that device's terminator must be removed.
3. **There's a third wire: the shared GND.** An RS-485 receiver can tolerate a GND difference of up to a few volts between two devices, but it still needs a reference. The Modbus specification asks for a third wire that connects the GND of all the devices. In a UTP cable, that wire is taken from another pair.
4. **The letters A and B aren't the same at every maker.** According to the MAX485 datasheet, A is the "non-inverting" wire, but some makers name them the other way around, and the Modbus specification uses the names D0 and D1. The rule of thumb is simple: between identical modules, A to A and B to B; with a device from another maker, if there's no answer at all, swap A and B (Quick Win step 7 already proved that nothing gets damaged).

![Diagram of an RS-485 bus, one pair of wires for many devices. Node 1 as the client at the left end, then the main A and B cable runs to the right with short branches to sensors 1 to 4 at addresses 1 to 4; sensor 4 is at the right end. A 120 ohm terminator sits between A and B only at the two ends of the main cable, and a third wire, GND, joins all the devices. Notes: the shape is a chain, not a star; one client, up to 32 standard loads; the main cable up to about 1,200 m at low speeds, the faster, the shorter; the branch to each device is kept short, at most 20 m according to the Modbus specification. The letters A and B aren't the same at every maker: with a device from another maker, if there's no answer at all, swap A and B.](assets/rs485-bus.png)

According to the standard, one RS-485 bus can serve **32 loads**. One MAX485 chip counts as one load, so one bus can hold up to 32 devices like this; other, "lighter" chips allow more. For this week's lab, our bus only has two devices and a 5 m cable, so reflections and loads aren't a problem yet. The rules are still applied from the start so that you build the right habits.

> ➡️ **Time to practice!** Concepts 1–3 are enough for [Practice 1 — Walkie-talkie](#practice-1--walkie-talkie-taking-turns-to-talk-over-one-pair-of-wires-30-minutes). After that, come back to Concept 4.

### 4. Modbus RTU: asking for numbered registers

**Modbus** was created by the company Modicon in 1979 for PLCs (factory control computers), and to this day it's the "language" most widely used by industrial devices. The version that runs over a serial cable such as RS-485 is called **Modbus RTU**. The version for Ethernet or Wi-Fi networks is called Modbus TCP (🔬).

Its conversation rules are like questions and answers at a service counter:

- On one bus there's only **one asker**, called the **client**: in this module, Node 1. A device that gets asked is called a **server**: the soil sensor (the second board). Old documents, many libraries, and cheap sensor datasheets still use the old terms **master** (for the client) and **slave** (for the server); the Modbus organization replaced them in 2020. This module uses client and server, but mentions the old terms whenever you're about to run into them, for example in the name of the **ModbusMaster** library.
- **A server never talks first.** It only answers the questions addressed to it, and a server never talks to another server. So there are no collisions: the client decides whose turn it is.
- Every server has an **address** from 1 to 247, unique on that bus. Address 0 is a **broadcast** to all servers: only for write commands, and nobody answers.

A sensor's data is kept in **numbered registers**, like a row of numbered lockers. Each register holds one 16-bit number (0 to 65,535). There are two register cabinets you'll often come across:

| Cabinet | What's in it | Read with | Written with |
| :--- | :--- | :--- | :--- |
| **Holding registers** | numbers that may be read and written, for example the address or baud rate setting; many cheap sensors also put their measurements here | **function 03** | **function 06** (one register) |
| **Input registers** | measured numbers, read-only | **function 04** | — |

Besides those, there are coils and discrete inputs, which hold only 1 bit (on-off) and are used for relays, for example. This week we only need 16-bit registers.

A Modbus question goes roughly like this: **"Server 1, function 03: read me 3 registers starting at register 0."** The answer: "Server 1, function 03, 6 bytes: 585, 253, 1,200." If the question can't be carried out, for example because the requested register doesn't exist, the server answers with an **exception** (an official refusal) along with the reason. If the server doesn't answer at all, the client waits until its time limit runs out (a **timeout**). Concept 5 takes that question and answer apart down to the byte.

### 5. Frames and the CRC: a sealed letter

Modbus RTU questions and answers are sent as a row of bytes called a **frame**. Every frame is always built the same way: the **server address** (1 byte), the **function code** (1 byte), the **data** (its length depends on the function), then the **CRC** (2 bytes). Bytes are usually written in **hexadecimal**: two characters (0–9 and A–F) per byte, from `00` (0) to `FF` (255). Here's the question "server 1, function 03, read me 3 registers starting at register 0" and its answer, exactly as they travel along the cable (you'll see them yourself in Practice 3):

![Diagram of Modbus RTU frames for the question server 1, function 03, read me 3 registers starting at register 0, from the Practice 3 recording. Node 1's question, 8 bytes: 01 server address 1; 03 function read holding; 00 00 starting at register 0; 00 03 a count of 3 registers; 05 CB the CRC with the low byte first. The server's answer, 11 bytes: 01 from server 1; 03 function 03, normal; 06 six bytes of data; 02 49 register 0 equals 585, that is, 58.5 percent; 00 FD register 1 equals 253, that is, 25.3 degrees Celsius; 04 B0 register 2 equals 1,200; 6F DD the CRC. A refusal, or exception, answer, 5 bytes: 01 server 1; 83, that is, 03 plus 80, meaning refused; 02 the code for register does not exist; C0 F1 the CRC. A box on how to read a register's two bytes: high byte first, 02 49 equals 2 times 256 plus 73, that is, 585, because hexadecimal 49 equals 4 times 16 plus 9, that is, 73; the CRC is computed from all the bytes before it, and a broken frame is silently thrown away, so the asker gets a timeout.](assets/modbus-frame.png)

| Node 1's question | `01` | `03` | `00 00` | `00 03` | `05 CB` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Meaning | server address 1 | function 03: read holding registers | starting at register 0 | a count of 3 registers | CRC |

| The server's answer | `01` | `03` | `06` | `02 49` | `00 FD` | `04 B0` | `6F DD` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Meaning | from server 1 | function 03 (normal answer) | 6 bytes of data | register 0 = 585 | register 1 = 253 | register 2 = 1,200 | CRC |

Each register holds two bytes, **high byte first**. How to work it out: multiply the first byte by 256, then add the second byte. So `02 49` = 2 × 256 + 73 = **585** (hexadecimal `49` = 4 × 16 + 9 = 73), `00 FD` = **253**, and `04 B0` = 4 × 256 + 176 = **1,200**.

The last two bytes are the **CRC** (Cyclic Redundancy Check), a kind of **seal** computed from all the bytes before it with a fixed formula. The receiver recomputes that seal from the bytes it received. If the result is different (even a single bit changed on the way), the frame is considered broken. A broken question is **silently thrown away** by the server: it doesn't answer at all, and the client only sees a **timeout**. A broken answer is rejected by the client as a CRC error (in ModbusMaster, code `0xE3`). Curiously, the CRC is written **low byte first**: the seal `0xCB05` is sent as `05 CB`. You don't need to compute the CRC by hand; the library and the Practice 3 sketch do that.

How does a receiver know where a frame ends? Modbus RTU has no start mark or end mark. The marker is **silence**: a frame counts as finished when the cable stays quiet for at least **3.5 characters**. At 9600 baud, one byte takes about 1.04 ms (8 data bits plus a start bit and a stop bit), so 3.5 characters ≈ **4 ms**. On the other hand, a gap of more than 1.5 characters in the **middle** of a frame makes that frame count as broken.

From those numbers, you can work out how long one question and answer takes:

![Diagram of how long one Modbus question and answer takes at 9600 baud; one byte takes about 1.04 milliseconds (8 data bits plus a start bit and a stop bit); the numbers come from Wokwi test recordings. Three traces on an axis from 0 to 30 milliseconds: D4 (DE/RE) HIGH from 0 to about 8.3 milliseconds, then LOW; DI (TX2) sends 01 03 00 00 00 03 05 CB for about 8.3 milliseconds; RO (RX2) receives 01 03 06 02 49 00 FD 04 B0 6F DD for about 11.5 milliseconds after about 4 milliseconds of silence. The total is about 24 milliseconds with the Wokwi chip and about 28 milliseconds with the second board's sketch. Red note: if the server doesn't answer, the ModbusMaster library waits 2,000 milliseconds before giving up with code 0xE2, about 70 times longer than a successful question and answer, and all that time Node 1's loop() stands still.](assets/transaction-timing.png)

The 8-byte question takes about 8.3 ms, the server waits about 4 ms for the cable to go quiet, then the 11-byte answer takes about 11.5 ms. The total is **about 24–28 ms** (in the Wokwi tests: 24 ms with the mock chip, 28 ms with the second board's sketch). If the server doesn't answer, the ModbusMaster library waits **2 seconds** before giving up. The gap between "28 ms" and "2,000 ms" matters: Concept 6 and Practice 5 use it.

If the server refuses a question, its answer is short, for example `01 83 02 C0 F1`: the function code is `83` (= `03` + `80`, the sign of a refusal), followed by the **exception code** `02`. There are four codes you should know:

| Code | Official name | Meaning |
| :---: | :--- | :--- |
| `01` | ILLEGAL FUNCTION | the server doesn't know that function code |
| `02` | ILLEGAL DATA ADDRESS | the requested register doesn't exist (or is partly out of range) |
| `03` | ILLEGAL DATA VALUE | the request's content isn't valid, for example a register count of 0 |
| `04` | SERVER DEVICE FAILURE | the server failed to carry it out |

### 6. Numbers in registers: 16 bits, scale, sign, and shifted numbering

A register only holds a 16-bit whole number. A soil sensor needs to store fractions and negative numbers. For that, there are four conventions that are always written in the datasheet:

1. **Scale.** Fractions are stored as a multiplied whole number. A moisture of 58.5% is stored as **585** with a ×10 scale, so the code divides by 10: `getResponseBuffer(0) / 10.0`. The datasheet writes it as, for example, "unit 0.1 %RH" or "×10". Every sensor's scale is different: some are ×10, some are ×100.
2. **Sign.** Negative numbers are stored as **two's complement**: −5.0 °C = −50 is stored as `FF CE` (65,486 if read as it is). The code must tell the ESP32 to read that number as a **signed** 16-bit number: `(int16_t)getResponseBuffer(1) / 10.0`. Forgot `(int16_t)`? A temperature of −5.0 °C is read as 6,548.6 °C.
3. **Two registers for one number.** A number that needs more than 16 bits (an energy counter, for example) uses two consecutive registers. The order of those two registers isn't set by the standard and differs between makers (🔬).
4. **Numbering shifted by one.** Inside a frame, the first register is number **0**. But many datasheets and old applications write Modicon-style numbers: **40001** for the first holding register and **30001** for the first input register. So "40001" in the datasheet = register **0** in the code, and "40003" = register 2. If the datasheet writes a hexadecimal address like `0x0012` or `0012H`, that's usually already the number inside the frame: use it as it is. Still not sure? Try N and N−1, then pick the one whose result makes sense.

The datasheet of our mock sensor, which you'll install on the second board in Practice 2:

![Datasheet of the mock RS-485 soil sensor: server address 1, 9600 baud 8N1, two cabinets of 16-bit registers. The holding register cabinet, read with function 03, register 3 written with function 06: register 0 holds 585, the soil moisture times 10, so 58.5 percent; register 1 holds 253, the soil temperature times 10 and signed, so 25.3 degrees Celsius; register 2 holds 1,200, the EC in microsiemens per centimeter with no multiplier; register 3 holds 1, the server address 1 to 247, writable. The input register cabinet, read with function 04 and read-only: registers 0 to 2 hold the same as the holding registers. A box on negative numbers, two's complement: minus 5.0 degrees times 10 equals minus 50, stored as FF CE, or 65,486; read with int16_t it becomes minus 50, then minus 5.0 degrees; forget int16_t and it reads 6,548.6 degrees. Note at the bottom: old-style datasheets write 40001 for the first holding register, which is register 0 in the code; registers outside 0 to 3 (function 03) or 0 to 2 (function 04) get exception 02, and write commands to registers 0 to 2 are ignored.](assets/modbus-register-cabinet.png)

Finally, tell the two kinds of failure apart, because their symptoms on the screen are very different:

| | **Exception** | **Timeout** |
| :--- | :--- | :--- |
| Meaning | the server is alive, hears you, and refuses with a reason | no valid answer at all |
| Example causes | the register doesn't exist (`02`), unknown function (`01`) | wrong server address, A and B swapped, a different baud rate, the question was damaged on the way (wrong CRC), the server is off, a broken cable |
| How long it takes in ModbusMaster | fast, about 20 ms | **2 seconds**, then code `0xE2` |
| What to do | fix the question (register number, function) | check the cable, the address, and the serial settings |

> ➡️ **Time to practice!** Concepts 4–6 are enough for [Practice 2 — A mock RS-485 soil sensor](#practice-2--a-mock-rs-485-soil-sensor-on-the-second-board-30-minutes), [Practice 3 — Modbus frames by hand](#practice-3--modbus-frames-by-hand-40-minutes), and [Practice 4 — ModbusMaster](#practice-4--modbusmaster-reading-three-registers-40-minutes). After that, come back to Concept 7.

### 7. Reading an RS-485 sensor's datasheet

One day you'll buy a real RS-485 soil sensor for a smart farming project. A sensor like that comes with a datasheet (often just a PDF from the seller). These are the five things you must find first, before you connect any wire:

1. **Power supply.** Many industrial sensors need **12–24 V**, not 5 V. The JXCT soil sensor's datasheet, for example, says *"Power supply 12-24V DC"*. A sensor like this needs its own adapter. Only A, B, and GND are connected to the RS-485 bus (the adapter's GND is joined to the bus GND), and the 12 V power wire **never** touches an ESP32 pin or a breadboard rail.
2. **Wire colors.** Usually brown = power (+), black = power (−), yellow = A, blue = B. But not always: the Seeed sensor uses yellow = A and **white** = B, plus a green wire for its setup mode. JXCT even warns that a wrong connection can burn out the device.
3. **Serial settings and address.** Most cheap sensors use **9600 baud, 8N1** (8 data bits, no parity, 1 stop bit) and the default address **1**. Some use 4800 baud. The Modbus specification itself names 19200 baud with even parity as the default; what matters is that the settings on both sides **must be exactly the same**.
4. **Supported function codes.** JXCT only accepts function 03; other sensors accept 03 and 04.
5. **Register map, scale, and sign.** This is the part that differs most between makers:

| | JXCT JXBS-3001 (NPK/7-in-1 soil) | Seeed S-Temp&VWC&EC-02 | This module's mock sensor |
| :--- | :--- | :--- | :--- |
| Power | 12–24 V | 3.6–30 V (the number from the Seeed wiki for its successor series, -02A) | 5 V from the board |
| A / B wires | yellow / blue | yellow / white | — |
| Default settings | 9600 8N1, address 1 | 9600 8N1 | 9600 8N1, address 1 |
| Soil moisture | register `0x0012`, ×10 | register `0x0001`, ×100 | register 0, ×10 |
| Soil temperature | register `0x0013`, ×10, signed | register `0x0000`, ×100, signed | register 1, ×10, signed |
| EC (µS/cm) | register `0x0015` | register `0x0002` | register 2 |
| Server address stored in | register `0x0100` | register `0x0200` | register 3 (not kept after a restart) |

Notice: the order, the register numbers, and the scales are all different. Code that reads sensor A can't be used as it is for sensor B. That's why Node 1 v1.4.0 keeps its register map in one place (`rs485.cpp`).

One more lesson: **cheap datasheets can be wrong.** The JXCT datasheet gives the example request `01 03 00 12 00 02 65 CB`, but the correct CRC seal for those bytes is `64 0E`; `65 CB` is the seal for register `0x0002`, a copy-paste leftover from another document. If you copy that example as it is into a test tool, the sensor stays silent. So don't copy hexadecimal frames from a PDF; let the library or the tool compute the CRC.

> ➡️ **Time to practice!** Concept 7 is enough for [Practice 5 — Node 1 v1.4.0](#practice-5--node-1-v140-the-rs-485-sensor-joins-the-telemetry-50-minutes) and [Practice 6 — The RS-485 Sensor group in Node-RED](#practice-6--the-rs-485-sensor-group-in-node-red-and-the-5-m-cable-test-45-minutes). After that, come back to Concept 8.

### 8. Choosing the right protocol

Mini Smart Home now uses three "roads" at once: **Wi-Fi** (Node 1 to the router), **ESP-NOW** (Node 2 to Node 1), and **RS-485/Modbus** (an industrial sensor to Node 1). Out there, there's also LoRa, Zigbee, Thread, Matter, BLE (Bluetooth Low Energy), and NB-IoT. No single protocol is best for every need. Every protocol pays for one strength with a weakness somewhere else: the longer the range, the less data you can usually send; the more it saves the battery, the more it usually needs a special connecting device.

The safest way to choose is to **answer a few questions first**, and only then look at the table. The decision tree after the following list sums up those questions as a shortcut, and the table below it gives the numbers. The questions:

1. **How far** is the sensor from whatever collects its data (router, gateway, Pi)?
2. **Is there power, or must it run on a battery?** A big battery (18650) or a coin cell (CR2032)?
3. **How often does it send, and how much data?** A few numbers per minute, or a photo every second?
4. **Is there Wi-Fi or a cellular signal where the sensor is?** If cellular, are you ready to pay for the operator's data plan every month?
5. **How many nodes?** One or two, or dozens?
6. **Do you need to send commands back** (turning on a pump) quickly?
7. **Can you run a cable?**

![Decision tree for choosing a protocol: answer the questions from top to bottom and stop at the first yes. 1, can the sensor be wired, and is the environment industrial with a lot of noise? Yes: RS-485 / Modbus RTU, or Modbus TCP if there's already Ethernet or a PLC. 2, is there Wi-Fi at the location, and is there power? Yes: Wi-Fi, straight to MQTT like Node 1. 3, less than about 150 m from an ESP32 that's connected to Wi-Fi, and running on an 18650 battery? Yes: ESP-NOW, like Node 2 in Module 14. 4, a smart home device, or must it last a long time on a coin cell? Yes: Zigbee / Thread with Matter, which needs a hub or a border router. 5, devices spread over a wide area or moving, with a cellular operator's signal, and ready to pay for a data plan? Yes: NB-IoT, with a special SIM card; LTE-M isn't listed for Indonesia yet. 6, kilometers, small data, rare sends, no power? Yes: LoRa / LoRaWAN, 920–923 MHz (AS923-2), at most 1 percent of the time. Note at the bottom: to talk to a phone nearby, for example a scale, a watch, or a device's first setup, use BLE; this tree is a simplification, and the final answer is still weighed against the Concept 8 table and the costs where you are.](assets/protocol-decision-tree.png)

| Protocol | Typical range | Power | Speed and message size | Device cost (October 2026 estimate) | Topology and infrastructure | Good for |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Wi-Fi 2.4 GHz** | tens of meters inside a house (through 1–2 walls) | power-hungry: the ESP32's radio up to 240 mA, 1–3 seconds to connect → best for devices with **mains power** | very fast (ESP32 about 20 Mbit/s); free-form messages | ESP32 IDR 45,000–90,000; the router is already there | a star around the **router**; straight to IP and MQTT | powered devices near the router (Node 1) |
| **ESP-NOW** | about 150 m reliably in the open (limit about 300 m) | the same radio as Wi-Fi, but it's only on for **milliseconds** → an 18650 battery works | about 200 kbit/s; 250 bytes per packet (ESP-NOW version 2: up to 1,470 bytes) | a second ESP32 IDR 45,000–90,000 | ESP32 to ESP32, **no router**; needs a gateway ESP32 to reach the internet | battery sensors in the yard or a garden near the house (Node 2) |
| **RS-485 / Modbus RTU** | up to about 1 km of **cable** at 9600 baud | the sensor usually gets its power through the cable (often 12–24 V) | slow but enough: 9,600–19,200 bit/s; frames of at most 256 bytes | MAX485 module IDR 5,000–20,000 + cable; industrial sensor IDR 500,000–2,000,000 | a **cable bus**, one client, up to 32 loads; no radio license | **industrial** sensors and machines, places where a cable can be run and there's a lot of electrical noise |
| **LoRa / LoRaWAN** | about 1–5 km in a city, up to about 15 km in the countryside (high antenna, clear line of sight) | sending about 120 mA but only briefly, sleeping 0.2 µA → the battery lasts for years if it sends rarely | **very slow**: 0.25–5.5 kbit/s; 51–242 bytes; in Indonesia, sending at most 1% of the time | module about IDR 120,000; LoRaWAN gateway IDR 2,700,000–5,000,000 | LoRa: point-to-point; LoRaWAN: node → **gateway** → network server | **remote sensors without power** (rice fields, tanks), sending rarely and little |
| **Zigbee** | tens of meters per hop; a **mesh** network (every device helps pass on the other devices' messages) extends it | very frugal (the chip about 7 mA while sending, under 1 µA on standby) → **coin cell** | 250 kbit/s over the air (about 17 kbit/s in practice); at most 127 bytes | a ready-made sensor about IDR 200,000; a coordinator dongle (USB stick) about IDR 500,000 | **mesh** + **hub** (coordinator); an ESP32 DevKit **can't** | smart homes with many battery-powered sensors and switches |
| **Thread + Matter** | like Zigbee | Thread is frugal (coin cell); Matter over Wi-Fi is as power-hungry as Wi-Fi | 250 kbit/s over the air | ESP32-C6/H2 board IDR 100,000–300,000 | Thread: mesh + **border router** (the gateway from the Thread network to the home network); Matter: a shared language across brands on top of Wi-Fi or Thread | **cross-brand** smart home products |
| **BLE** | a few meters to tens of meters | dedicated chips are very frugal; on the ESP32 about 130 mA | 1 Mbit/s over the air; 20 bytes per notification by default | already in the ESP32 | **phone ↔ device** | talking to a phone, a device's first setup |
| **NB-IoT / LTE-M** | as far as the **operator's signal** reaches (kilometers, better through buildings) | sleeping 0.8–3.2 µA, sending hundreds of mA → a claimed 10-year battery life | NB-IoT about 127–158 kbit/s peak | module IDR 500,000–1,300,000 + **SIM card and data plan** | a star around the **operator's cell tower**; no gateway of your own | devices **spread widely or moving** in an area with signal |

The numbers in the table are **rough guides**, not promises: range depends heavily on the antenna, how high it's mounted, and obstacles, while prices change quickly. The currents in the table are the currents of the chip or radio module, not of a whole board. Remember the lesson of Modules 9 and 14: a DevKit board by itself draws about 4–5 mA while asleep. That much current drains a CR2032 coin cell (about 235 mAh) in about two days, so coin-cell sensors always use a dedicated radio chip, not an ESP32 DevKit.

A few things that are often misunderstood:

- **LoRa isn't the same as LoRaWAN.** LoRa is the **kind of radio**: two LoRa modules can talk directly, without the internet. LoRaWAN is the **network**: LoRa node → gateway (turns radio packets into IP packets) → network server on the internet.
- **LoRa in Indonesia** uses the **920–923 MHz** band, and the official LoRaWAN frequency plan for Indonesia is **AS923-2**. According to Kominfo Ministerial Regulation 2/2023 (Permen Kominfo 2/2023, still in force as of October 2026), end devices may transmit at most 20 dBm EIRP (the transmit power after counting the antenna's gain) and at most 1% of the time (a 1% duty cycle). The 433 MHz band is also legal, but its power is limited to much less (12.15 dBm EIRP), and a 433 MHz module (SX1278) can't be moved to 920–923 MHz. Watch out for a trap: The Things Network's list of frequency plans (July 2026) still links Indonesia to `Asia 923-925 MHz`, whose channels are outside the legal band; choose **Asia 920-923 MHz (AS923 Group 2)**.
- **The 1% limit is real.** One 12-byte message at LoRa's slowest setting (SF12) takes about 1.5 seconds on air, so at most about 24 messages per hour. A sensor that sends every 15 minutes is fine; LoRa for photos or for sending every second isn't.
- **The ESP32 DevKit V1 can't use Zigbee or Thread**, because it has no IEEE 802.15.4 radio. The boards that can are the ESP32-C6 and the ESP32-H2. Zigbee also always needs a **hub** (a coordinator), and Thread needs a **border router** (often already built into a smart speaker or hub). Matter over Wi-Fi can run on the ESP32, but its official examples ask for a different partition scheme (with no OTA space) and for erasing the whole flash before uploading, including the Wi-Fi name and password stored in NVS. So **don't** put Matter on Node 1.
- **NB-IoT only works through a cellular operator** (Permen Kominfo 2/2023, Article 10): it needs a special SIM card and a data plan, which in Indonesia are sold as a business service through a consultation. The GSMA list (November 2025) only records NB-IoT from Telkomsel and XL Axiata for Indonesia; **LTE-M isn't listed yet**. A 4G signal on your phone doesn't necessarily mean there's an NB-IoT signal.
- **The word "gateway" has four meanings in this curriculum.** Node 1 is an ESP-NOW to MQTT gateway (Module 14); a LoRaWAN gateway turns LoRa radio into internet packets; a Modbus gateway translates Modbus TCP to Modbus RTU (🔬). The Pi gateway (Module 12) is the home's door to the outside world.

The part about regulations above is background knowledge, not legal advice. For products that are sold, radio devices must be certified and outdoor use may have to be registered; that's usually handled by the manufacturer or the importer.

> ➡️ **Time to practice!** Concept 8 is enough for [Practice 7 — Choosing a protocol](#practice-7--choosing-a-protocol-the-decision-table-and-five-scenarios-40-minutes).

---

## 🔧 Step-by-step practice

Seven practices, **in order**. The practices with a ⭐ in their 🖥️ box are part of the completion requirements.

> [!IMPORTANT]
> **This week, the Node 1 board changes programs several times.** From the Quick Win until Practice 4, the Node 1 board runs practice sketches (board choice **DOIT ESP32 DEVKIT V1**). Practice 5 uploads **Node 1 v1.4.0** (board choice **ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**, as since Module 10), the firmware used from then on. While the Node 1 board runs practice sketches, the dashboard shows Node 1 as `offline`; that's normal. The Wi-Fi name and password saved on the Node 1 board stay safe as long as **Tools → Erase All Flash Before Sketch Upload** stays **Disabled**.
>
> **So does the second board.** The Quick Win and Practice 1 use text sketches; from Practice 2 on, the second board runs the **mock soil sensor** until the lab is over (➕ A turns it back into Node 2).

### Practice 1 — Walkie-talkie: taking turns to talk over one pair of wires (30 minutes)

> 🖥️ **Tools:** **Arduino IDE** with two windows, the Node 1 board and the second board plugged into the laptop, the Quick Win circuit, and the MB102 turned on. Concepts used: 1–3.
>
> 🖥️ **Wokwi path:** this practice needs two boards talking over a cable. Read the steps and their results, then continue with Concept 4.

This time the two boards **take turns** talking on the same cable. Node 1 sends `ping 1`, then immediately goes quiet and listens. The second board listens, then replies `pong 1`. Both use the same `sendLine()` function: press the talk button, send, wait for the last letter to go out, release the talk button.

#### 1.1 The second board: the replier

1. In the second board's Arduino IDE window, open **File → New Sketch**, delete its contents, then paste this code. Save it as `module15_pong` in the `module-15` folder.

   ```cpp
   // Module 15 - Practice 1, the SECOND board: "pong".
   // Listens all the time. Each time a complete "ping N" line arrives, this board talks briefly to answer "pong N",
   // then goes back to listening. The DE/RE pin sets the direction: HIGH = talk, LOW = listen.
   // esp32 package 3.3.12; no extra library needed.

   const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
   const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together

   char line[40];  // the letters collected so far, up to the end-of-line mark
   int length = 0;

   // Talk briefly, then go back to listening. Just like the talk button of a walkie-talkie.
   void sendLine(const char* text) {
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // press the talk button
     Serial2.print(text);
     Serial2.flush();                      // wait until the last letter has really gone out onto the cable
     digitalWrite(PIN_RS485_DE_RE, LOW);   // release the talk button: back to listening
     while (Serial2.available() > 0) {
       Serial2.read();  // throw away any garbage read while this board was talking
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // start by listening
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // the pins must be written (esp32 3.x package)
     Serial.println();
     Serial.println("Second board listening; every ping will be answered with a pong.");
   }

   void loop() {
     while (Serial2.available() > 0) {
       char letter = Serial2.read();
       if (letter == '\n') {
         line[length] = '\0';
         if (strncmp(line, "ping ", 5) == 0) {
           char answer[48];
           snprintf(answer, sizeof(answer), "pong %s\n", line + 5);  // the same number as the ping
           sendLine(answer);
           Serial.printf("heard \"%s\" -> replied \"pong %s\"\n", line, line + 5);
         } else {
           Serial.printf("heard something that is not a ping: \"%s\"\n", line);
         }
         length = 0;
       } else if (letter != '\r' && length < (int)sizeof(line) - 1) {
         line[length] = letter;
         length++;
       }
     }
   }
   ```

2. Make sure the **DOIT ESP32 DEVKIT V1** board and the second board's port are selected, click **Upload**, then open its Serial Monitor (115200 baud). Its first line reads `Second board listening; every ping will be answered with a pong.` If you missed that line, press **EN** on the second board.

Look at the end of `sendLine()`. After the talk button is released, the sketch throws away the contents of the receive queue. While this board talks, its module's receiver is off and RX2 may read garbage letters (Concept 2). Those garbage letters must not stick to the front of the next `ping`.

#### 1.2 The Node 1 board: the asker

1. In the Node 1 board's Arduino IDE window, open **File → New Sketch**, delete its contents, paste this code, then save it as `module15_ping` in the `module-15` folder.

   ```cpp
   // Module 15 - Practice 1, the NODE 1 board: "ping".
   // Every 2 seconds it talks briefly ("ping N"), then listens for the reply "pong N" from the second board,
   // over the SAME single pair of wires. The DE/RE pin sets the direction: HIGH = talk, LOW = listen.
   // esp32 package 3.3.12; no extra library needed.

   const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
   const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
   const unsigned long PING_INTERVAL = 2000;   // one ping every 2 seconds
   const unsigned long WAIT_TIMEOUT = 500;     // wait at most 0.5 seconds for the reply

   unsigned long number = 0;

   // Talk briefly, then go back to listening. Just like the talk button of a walkie-talkie.
   void sendLine(const char* text) {
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // press the talk button
     Serial2.print(text);
     Serial2.flush();                      // wait until the last letter has really gone out onto the cable
     digitalWrite(PIN_RS485_DE_RE, LOW);   // release the talk button: back to listening
     while (Serial2.available() > 0) {
       Serial2.read();  // throw away any garbage read while this board was talking
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // start by listening
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // the pins must be written (esp32 3.x package)
     Serial2.setTimeout(WAIT_TIMEOUT);
     Serial.println();
     Serial.println("Node 1 board ready: a ping every 2 seconds.");
   }

   void loop() {
     number++;
     char text[24];
     snprintf(text, sizeof(text), "ping %lu\n", number);
     while (Serial2.available() > 0) {
       Serial2.read();  // throw away old leftover letters so that the reply read is really the reply to this ping
     }
     unsigned long start = millis();
     sendLine(text);
     String answer = Serial2.readStringUntil('\n');  // waits at most WAIT_TIMEOUT
     unsigned long elapsed = millis() - start;
     if (answer.length() == 0) {
       Serial.printf("ping %lu -> no reply within %lu ms\n", number, WAIT_TIMEOUT);
     } else if (answer.startsWith("pong ")) {
       Serial.printf("ping %lu -> %s (%lu ms round trip)\n", number, answer.c_str(), elapsed);
     } else {
       Serial.printf("ping %lu -> broken reply (%u letters)\n", number, answer.length());
     }
     delay(PING_INTERVAL);
   }
   ```

2. Choose **DOIT ESP32 DEVKIT V1** and the Node 1 board's port, click **Upload**, then open its Serial Monitor.

`Serial2.readStringUntil('\n')` waits until the end-of-line mark arrives, at most `WAIT_TIMEOUT` (half a second, set with `Serial2.setTimeout()` in `setup()`). Waiting like this is fine for a practice sketch; Node 1's firmware must not wait that long in `loop()`, and Practice 5 discusses what happens if it does.

#### 1.3 The results

Node 1's Serial Monitor (example):

```text
Node 1 board ready: a ping every 2 seconds.
ping 1 -> pong 1 (15 ms round trip)
ping 2 -> pong 2 (15 ms round trip)
ping 3 -> pong 3 (15 ms round trip)
```

The second board's Serial Monitor (example):

```text
heard "ping 1" -> replied "pong 1"
heard "ping 2" -> replied "pong 2"
heard "ping 3" -> replied "pong 3"
```

Why about 15 ms? `ping 1` plus the end-of-line mark is 7 letters, and each letter at 9600 baud takes about 1.04 ms: roughly 7 ms there. The reply `pong 1` is also 7 letters: roughly 7 ms back. Almost all of the time is spent on the cable. The number on your screen may differ by a millisecond or two.

You see `ping 1 -> no reply within 500 ms`? First check the second board's Serial Monitor. If the second board prints `heard "ping 1" ...`, Node 1's message arrived but the reply didn't: open the collapsible section "Practice 1: the ping arrives, the pong does not" in [🚨](#-troubleshooting). If the second board prints nothing, go back to the Quick Win: the `hello` messages must appear first. The `hello` messages appear, but the second board still doesn't hear the ping? The `hello` messages only test the direction second board → Node 1. Turn off the MB102 and unplug both USB cables, then check the wires that are only now used in the other direction: Node 1's DI wire in **10e**, the second board's divider (14f, the resistors 14h–18h and 18i–22i, the black wire 22j, and the 18f wire to the **RX2** pin), and above all the wire from 24i to the second board's **D4** pin. Without that wire, the resistor on the module holds DE and RE HIGH, so the second board's receiver stays off all the time.

#### 1.4 Experiment: release the talk button too early

1. In the `module15_pong` window (the second board), turn the `Serial2.flush();` line into a comment by adding `//` in front of it:

   ```cpp
   //  Serial2.flush();                      // wait until the last letter has really gone out onto the cable
   ```

2. Click **Upload**. Now Node 1's Serial Monitor prints (example):

   ```text
   ping 12 -> no reply within 500 ms
   ping 13 -> no reply within 500 ms
   ```

   Strangely, the second board's Serial Monitor still prints `heard "ping 12" -> replied "pong 12"`. The second board **thinks** it has replied. In fact, `Serial2.print()` only hands the letters of `pong 12` over to the UART queue, and then D4 is brought down right away. The module's transmitter is already off before the first letter can go out. On your screen, `broken reply` sometimes appears instead of `no reply`: a few letters slipped through.

3. Remove the `//` in front of `Serial2.flush();` again, then click **Upload**. The replies are back.

This is why both of this week's Modbus libraries (ModbusRTUSlave in Practice 2 and ModbusMaster in Practice 4), and the Practice 3 sketch too, always wait for the last letter to go out before bringing DE/RE down. If you ever write your own RS-485 code, the order "talk → send → `flush()` → listen" must never be reversed.

> ⬆️ **Done with Practice 1?** Go back to [Concept 4](#4-modbus-rtu-asking-for-numbered-registers).

### Practice 2 — A mock RS-485 soil sensor on the second board (30 minutes)

> 🖥️ **Tools:** **Arduino IDE** (the second board's window), the **ModbusRTUSlave** 3.1.2 library (🧰), and the Quick Win circuit. Concepts used: 4–6.
>
> 🖥️ **Wokwi path:** in Wokwi, the soil sensor's part is played by the **mock chip** "RS-485 Soil Sensor", with exactly the same datasheet (step 2.1). You add that chip in Practice 3. Read this practice to understand the datasheet and the code.

The second board now becomes a **Modbus server**: it keeps its readings in registers and only answers when asked. Like a real sensor, it comes with a datasheet.

#### 2.1 The mock RS-485 soil sensor's datasheet

| Item | Content |
| :--- | :--- |
| Interface | two-wire RS-485 (MAX485 module), Modbus RTU |
| Serial settings | **9600 baud, 8N1** (8 data bits, no parity, 1 stop bit) |
| Default server address | **1** (can be changed to 1–247 through register 3) |
| Function codes | **03** (read holding registers), **04** (read input registers), **06** (write one holding register) |
| Power | 5 V through the board's VIN pin |

| Register | Content | Scale | Function | Example |
| :---: | :--- | :--- | :--- | :--- |
| 0 | soil moisture | ×10, unit % | 03 or 04 | 585 = 58.5% |
| 1 | soil temperature | ×10, unit °C, **signed** | 03 or 04 | 253 = 25.3 °C; 65,486 (`FF CE`) = −5.0 °C |
| 2 | EC (the soil's electrical conductivity) | ×1, unit µS/cm | 03 or 04 | 1,200 |
| 3 | server address | 1–247 | 03 (read), 06 (write) | 1 |

Datasheet notes:

- Registers 0–2 are **read-only**. A write command to those registers gets an answer as if it succeeded, but its content is ignored; the second board's Serial Monitor logs it.
- Register 3 only exists in the holding register cabinet. A new address takes effect right after the answer is sent, but it **isn't saved**: after the board restarts, the address goes back to 1. Real sensors usually save it permanently.
- Requests for registers outside 0–3 (or outside 0–2 for function 04) get exception `02`. Other functions, for example 05 (write coil), get exception `01`.
- The blue light on the board blinks every time the board answers.

#### 2.2 Upload the mock sensor sketch

1. In the second board's Arduino IDE window, open **File → New Sketch**, delete its contents, then paste this code. Save it as `module15_mock_sensor` in the `module-15` folder.

   ```cpp
   // Module 15 - Practice 2, the SECOND board: a mock "RS-485 soil sensor" (Modbus RTU server).
   // This board answers Modbus requests from Node 1 through the MAX485 module, just like an industrial soil sensor.
   // Its datasheet is in the Module 15 README (Practice 2): server address 1, 9600 baud 8N1, registers 0-3.
   // Its readings can be changed from this board's Serial Monitor: moisture 62.5, temperature -5.0, ec 800, info.
   // Library: ModbusRTUSlave version 3.1.2 (installed with it: ModbusADU version 1.0.2, ModbusRTUComm version 1.3.2,
   // and ModbusSlaveLogic version 1.0.1). esp32 package 3.3.12.

   #include <ModbusRTUSlave.h>

   const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
   const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
   const int PIN_LED = 2;          // the board's blue LED: blinks every time this board answers
   const unsigned long RS485_BAUD = 9600;
   const uint8_t DEFAULT_ADDRESS = 1;

   ModbusRTUSlave server(Serial2, PIN_RS485_DE_RE);  // the library itself raises DE/RE when it answers

   // Modbus "registers". Registers 0-2 hold the readings and are in two cabinets: holding registers (function 03)
   // and input registers (function 04). Holding register 3 holds the server address and may be written (function 06).
   uint16_t holdingRegisters[4];
   uint16_t inputRegisters[3];

   // The "true" readings of this mock sensor, already multiplied by 10 as in its datasheet.
   int moisture10 = 585;     // 58.5 %
   int temperature10 = 253;  // 25.3 °C (may be negative)
   int ec = 1200;            // µS/cm, no multiplier
   uint8_t address = DEFAULT_ADDRESS;

   unsigned long replyCount = 0;
   unsigned long ledOnTime = 0;
   char line[41];  // a command from the Serial Monitor, at most 40 letters
   int lineLength = 0;

   // Copies the true readings into the registers. A negative temperature is two's complement: -5.0 °C = -50 = 0xFFCE.
   void fillRegisters() {
     holdingRegisters[0] = inputRegisters[0] = (uint16_t)moisture10;
     holdingRegisters[1] = inputRegisters[1] = (uint16_t)temperature10;
     holdingRegisters[2] = inputRegisters[2] = (uint16_t)ec;
     holdingRegisters[3] = address;
   }

   // Called after every request: registers 0-2 are read-only, register 3 may hold a new address 1-247.
   void checkWrites() {
     uint16_t expected[3] = {(uint16_t)moisture10, (uint16_t)temperature10, (uint16_t)ec};
     for (int i = 0; i < 3; i++) {
       if (holdingRegisters[i] != expected[i]) {
         Serial.printf("Someone wrote register %d: ignored, registers 0-2 are read-only.\n", i);
       }
     }
     if (holdingRegisters[3] != address) {
       if (holdingRegisters[3] >= 1 && holdingRegisters[3] <= 247) {
         address = holdingRegisters[3];
         server.begin(address, RS485_BAUD);  // from now on only the new address is answered
         Serial.printf("Server address changed to %u (back to %u after a restart).\n", address, DEFAULT_ADDRESS);
       } else {
         Serial.printf("Address %u refused: must be 1 to 247.\n", holdingRegisters[3]);
       }
     }
     fillRegisters();
   }

   void printInfo() {
     Serial.printf("info: address %u, moisture %.1f %%, temperature %.1f C, ec %d uS/cm, answered %lu requests\n",
                   address, moisture10 / 10.0, temperature10 / 10.0, ec, replyCount);
   }

   // Turns text into a number. Returns false if the text is not a number (for example "abc").
   bool readNumber(const char* text, float& result) {
     char* end;
     result = strtof(text, &end);
     return end != text && *end == '\0';
   }

   void runCommand() {
     float number = 0;
     if (strcmp(line, "info") == 0) {
       printInfo();
       return;
     }
     if (strncmp(line, "moisture ", 9) == 0) {
       if (!readNumber(line + 9, number) || number < 0 || number > 100) {
         Serial.println("Need a number 0 to 100. Example: moisture 62.5");
         return;
       }
       moisture10 = lroundf(number * 10);
     } else if (strncmp(line, "temperature ", 12) == 0) {
       if (!readNumber(line + 12, number) || number < -40 || number > 80) {
         Serial.println("Need a number -40 to 80. Example: temperature -5.0");
         return;
       }
       temperature10 = lroundf(number * 10);
     } else if (strncmp(line, "ec ", 3) == 0) {
       if (!readNumber(line + 3, number) || number < 0 || number > 20000) {
         Serial.println("Need a number 0 to 20000. Example: ec 800");
         return;
       }
       ec = lroundf(number);
     } else {
       Serial.println("Unknown command. Examples: moisture 62.5 | temperature -5.0 | ec 800 | info");
       return;
     }
     fillRegisters();  // the new readings go into the registers right away
     printInfo();
   }

   // Collects letters from the Serial Monitor without waiting; a complete line is carried out right away.
   void checkSerial() {
     while (Serial.available() > 0) {
       char letter = Serial.read();
       if (letter == '\n') {
         line[lineLength] = '\0';
         lineLength = 0;
         runCommand();
       } else if (letter != '\r' && lineLength < 40) {
         line[lineLength] = letter;
         lineLength++;
       }
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_LED, OUTPUT);
     fillRegisters();
     server.configureHoldingRegisters(holdingRegisters, 4);
     server.configureInputRegisters(inputRegisters, 3);
     // The order matters: Serial2 is started first (the pins must be written), then server.begin().
     Serial2.begin(RS485_BAUD, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
     server.begin(address, RS485_BAUD);
     Serial.println();
     Serial.println("Mock RS-485 soil sensor ready (Modbus RTU, 9600 baud 8N1).");
     Serial.println("Register 0 = moisture x10, 1 = temperature x10, 2 = EC, 3 = server address (writable).");
     printInfo();
   }

   void loop() {
     if (server.poll()) {  // true = there was a request for this address, now answered
       replyCount++;
       Serial.printf("[%lu] answered a client request\n", replyCount);
       digitalWrite(PIN_LED, HIGH);
       ledOnTime = millis();
       checkWrites();
     }
     if (digitalRead(PIN_LED) == HIGH && millis() - ledOnTime >= 50) {
       digitalWrite(PIN_LED, LOW);  // a short 50 ms blink
     }
     checkSerial();
   }
   ```

2. Choose **DOIT ESP32 DEVKIT V1** and the second board's port, click **Upload**, then open its Serial Monitor. **Expected output** (Wokwi test recording):

   ```text
   Mock RS-485 soil sensor ready (Modbus RTU, 9600 baud 8N1).
   Register 0 = moisture x10, 1 = temperature x10, 2 = EC, 3 = server address (writable).
   info: address 1, moisture 58.5 %, temperature 25.3 C, ec 1200 uS/cm, answered 0 requests
   ```

   Compiling fails with the message `ModbusRTUSlave.h: No such file or directory`? The library isn't installed yet (🧰).

The Node 1 board is still running the `module15_ping` sketch from Practice 1. Now its `ping` isn't answered anymore: the second board now only speaks Modbus, not "ping-pong". Leave it; Practice 3 replaces Node 1's sketch.

#### 2.3 The important parts of the code

- **`ModbusRTUSlave server(Serial2, PIN_RS485_DE_RE);`** — the library is told its **path** in and out (`Serial2`) and its **talk button** (D4). When it answers, the library itself raises D4, sends, waits for the last letter to go out, then brings D4 down.
- **`configureHoldingRegisters(holdingRegisters, 4)`** and **`configureInputRegisters(inputRegisters, 3)`** — the library is given two register cabinets in the form of `uint16_t` arrays. The register number = the array's drawer number: register 0 = `holdingRegisters[0]`, and so on. Their contents are filled in by `fillRegisters()`.
- **`Serial2.begin(...)` before `server.begin(address, RS485_BAUD)`** — this library doesn't start `Serial2` by itself. `server.begin()` only records the address, works out how long "a quiet cable" is from the baud rate (Concept 5), and throws away old leftover letters. So `Serial2` must already be running, complete with pins 16 and 17.
- **`server.poll()` in `loop()`** — if there's no question, this function returns right away without waiting. If there is one, it reads the frame, checks the CRC and the address, fills in the answer from the register arrays, sends it, then returns `true`. Questions for other addresses are ignored (`false`).
- **`(uint16_t)temperature10`** — a temperature of −5.0 °C (−50) is stored as two's complement, `FF CE` (Concept 6). It's the reader that must turn it back with `(int16_t)`.
- **`checkWrites()`** — the library writes whatever register function 06 asks for. This function is what keeps registers 0–2 read-only and applies a new address from register 3.

#### 2.4 Change its readings from the Serial Monitor

Make sure the line-ending option at the top of the second board's Serial Monitor is **New Line**, as in Module 8: without an end-of-line mark, this week's sketches never carry out your command. Then type in its send box and press **Enter**:

| Type | What it means |
| :--- | :--- |
| `moisture 62.5` | the soil moisture becomes 62.5% (register 0 = 625) |
| `temperature -5.0` | soil temperature −5.0 °C (register 1 = 65,486) |
| `ec 800` | EC 800 µS/cm |
| `info` | show all the readings, the address, and the number of answers |

Use a **point** as the decimal mark, because the ESP32 only understands numbers written with a point. **Expected output** after typing `temperature -5.0`, `moisture 62.5`, then `ec 800`, in that order (Wokwi test recording; the `answered` number on your screen is still 0):

```text
info: address 1, moisture 58.5 %, temperature -5.0 C, ec 1200 uS/cm, answered 15 requests
info: address 1, moisture 62.5 %, temperature -5.0 C, ec 1200 uS/cm, answered 16 requests
info: address 1, moisture 62.5 %, temperature -5.0 C, ec 800 uS/cm, answered 16 requests
```

A typo is answered with a correct example, for instance `Need a number 0 to 100. Example: moisture 62.5` for `moisture 150`.

When you're done trying, press **EN** on the second board so that its readings go back to 58.5%, 25.3 °C, and 1,200 µS/cm. The examples in Practices 3 and 4 use those numbers.

Nobody has asked this mock sensor anything yet. Practice 3 asks its first question, byte by byte.

### Practice 3 — Modbus frames by hand (40 minutes)

> 🖥️ **Tools:** **Arduino IDE** with two windows; the Node 1 board and the second board plugged into the laptop, and the MB102 on (USB first, then the MB102); the second board runs `module15_mock_sensor` (Practice 2); the Node 1 board will run a new sketch. Concepts used: 5–6.
>
> 🖥️ **Wokwi path:** from this practice on, the Wokwi path runs in full. Set up the project in step 3.1W, then do steps 3.2–3.4 with Wokwi's Serial Monitor. All the **Expected output** boxes in this practice are Wokwi test recordings.

Before using a library, you'll send Modbus questions **byte by byte** and read the answers yourself. This time Node 1's sketch only does three things: it adds the CRC to the bytes you type, sends them with the talk button used correctly, then prints the answer that arrives.

#### 3.1 Upload the frame sketch to the Node 1 board

1. In the Node 1 board's Arduino IDE window, open **File → New Sketch**, delete its contents, paste this code, then save it as `module15_raw_frame` in the `module-15` folder.

   ```cpp
   // Module 15 - Practice 3, the NODE 1 board: Modbus frames "by hand".
   // Type the request bytes WITHOUT the CRC in the Serial Monitor, for example:  01 03 00 00 00 03
   // This sketch computes the CRC, sends the frame over RS-485, then prints the server's reply byte by byte.
   // Add an x at the end of the line to break the CRC on purpose, for example:  01 03 00 00 00 03 x
   // esp32 package 3.3.12; no extra library needed.

   const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
   const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
   const unsigned long WAIT_TIMEOUT = 1000;  // wait at most 1 second for the reply
   const unsigned long END_GAP = 5;          // the cable quiet for over 5 ms after the last byte = reply complete

   char line[100];  // a command from the Serial Monitor
   int lineLength = 0;

   // CRC-16/MODBUS: start at 0xFFFF, polynomial 0xA001 (Modbus serial line specification, Appendix B).
   uint16_t computeCrc(const uint8_t* data, size_t length) {
     uint16_t crc = 0xFFFF;
     for (size_t i = 0; i < length; i++) {
       crc ^= data[i];
       for (int bit = 0; bit < 8; bit++) {
         if (crc & 1) {
           crc = (crc >> 1) ^ 0xA001;
         } else {
           crc = crc >> 1;
         }
       }
     }
     return crc;
   }

   void printBytes(const char* title, const uint8_t* data, size_t length) {
     Serial.printf("%s (%u bytes):", title, (unsigned)length);
     for (size_t i = 0; i < length; i++) {
       Serial.printf(" %02X", data[i]);
     }
     Serial.println();
   }

   const char* exceptionName(uint8_t code) {
     if (code == 0x01) {
       return "ILLEGAL FUNCTION: the server does not know the function code";
     }
     if (code == 0x02) {
       return "ILLEGAL DATA ADDRESS: the requested register does not exist";
     }
     if (code == 0x03) {
       return "ILLEGAL DATA VALUE: the request content is not valid";
     }
     if (code == 0x04) {
       return "SERVER DEVICE FAILURE: the server failed to carry it out";
     }
     return "another code";
   }

   // Explains the server's reply. "first" = the number of the first register asked for (functions 03 and 04).
   void explainReply(const uint8_t* r, size_t n, uint16_t first) {
     if (n < 4 || computeCrc(r, n) != 0) {  // the CRC over the whole frame, its 2 CRC bytes included: result 0 = intact
       Serial.println("  Reply CRC WRONG: this frame was damaged on the way.");
       return;
     }
     Serial.println("  Reply CRC matches: the frame is intact.");
     uint8_t function = r[1];
     if (function & 0x80) {
       Serial.printf("  Exception: function %02X refused with code %02X = %s\n", function & 0x7F, r[2], exceptionName(r[2]));
     } else if (function == 0x03 || function == 0x04) {
       int count = r[2] / 2;  // 2 bytes per register
       for (int i = 0; i < count && 4 + 2 * i < (int)n - 2; i++) {
         uint16_t value = (r[3 + 2 * i] << 8) | r[4 + 2 * i];  // high byte first (big-endian)
         Serial.printf("  register %u: %02X %02X = %u", first + i, r[3 + 2 * i], r[4 + 2 * i], value);
         if (value > 32767) {
           Serial.printf(" (if signed: %d)", (int16_t)value);
         }
         Serial.println();
       }
     } else if (function == 0x06) {
       Serial.println("  Function 06 succeeded: its normal reply is an echo (an exact copy) of the request.");
     }
   }

   // Turns text like "01 03 00 00 00 03 x" into bytes. Returns false if something is mistyped.
   bool readRequest(char* text, uint8_t* frame, size_t& n, bool& broken) {
     n = 0;
     broken = false;
     char* token = strtok(text, " ");
     while (token != nullptr) {
       if (strcmp(token, "x") == 0 || strcmp(token, "X") == 0) {
         broken = true;
       } else {
         char* end;
         long value = strtol(token, &end, 16);
         if (*end != '\0' || strlen(token) > 2) {
           Serial.printf("\"%s\" is not a hexadecimal byte (00 to FF).\n", token);
           return false;
         }
         if (n >= 30) {
           Serial.println("Too long: 30 bytes at most.");
           return false;
         }
         frame[n] = (uint8_t)value;
         n++;
       }
       token = strtok(nullptr, " ");
     }
     if (n < 2) {
       Serial.println("At least 2 bytes: the server address and the function code. Example: 01 03 00 00 00 03");
       return false;
     }
     return true;
   }

   void sendAndListen() {
     uint8_t frame[32];
     size_t n = 0;
     bool broken = false;
     if (!readRequest(line, frame, n, broken)) {
       return;
     }
     uint16_t first = (n >= 4) ? (frame[2] << 8) | frame[3] : 0;
     uint16_t crc = computeCrc(frame, n);
     if (broken) {
       crc = crc ^ 0xFFFF;  // broken on purpose: all its bits flipped
     }
     frame[n] = crc & 0xFF;  // the LOW byte of the CRC is sent first
     frame[n + 1] = crc >> 8;
     n = n + 2;

     while (Serial2.available() > 0) {
       Serial2.read();  // throw away old leftovers
     }
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // talk
     Serial2.write(frame, n);
     Serial2.flush();                      // wait for the last byte to go out
     digitalWrite(PIN_RS485_DE_RE, LOW);   // listen
     while (Serial2.available() > 0) {
       Serial2.read();  // throw away any garbage read while this board was talking (Concept 2)
     }
     if (broken) {
       printBytes("sent, CRC broken on purpose", frame, n);
     } else {
       printBytes("sent", frame, n);
     }

     uint8_t reply[64];
     size_t m = 0;
     unsigned long start = millis();
     unsigned long lastByteTime = start;
     while (true) {
       if (Serial2.available() > 0) {
         uint8_t b = Serial2.read();
         if (m < sizeof(reply)) {
           reply[m] = b;
           m++;
         }
         lastByteTime = millis();
       } else if (m == 0 && millis() - start > WAIT_TIMEOUT) {
         break;  // not a single byte
       } else if (m > 0 && millis() - lastByteTime > END_GAP) {
         break;  // the cable is quiet: the reply is complete
       }
     }
     if (m == 0) {
       Serial.printf("received: no reply within %lu ms (timeout)\n", WAIT_TIMEOUT);
       return;
     }
     Serial.printf("received within %lu ms after the request ended.\n", lastByteTime - start);
     printBytes("received", reply, m);
     explainReply(reply, m, first);
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // start by listening
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // the pins must be written (esp32 3.x package)
     Serial.println();
     Serial.println("Type the request bytes without the CRC, then Enter. Example: 01 03 00 00 00 03");
   }

   void loop() {
     while (Serial.available() > 0) {
       char letter = Serial.read();
       if (letter == '\n') {
         line[lineLength] = '\0';
         lineLength = 0;
         Serial.printf("> %s\n", line);
         sendAndListen();
       } else if (letter != '\r' && lineLength < (int)sizeof(line) - 1) {
         line[lineLength] = letter;
         lineLength++;
       }
     }
   }
   ```

2. Choose **DOIT ESP32 DEVKIT V1** and the Node 1 board's port, click **Upload**, then open its Serial Monitor. Its first line reads `Type the request bytes without the CRC, then Enter. Example: 01 03 00 00 00 03`.

The `computeCrc()` function is the Modbus CRC-16 recipe from its specification: start at `0xFFFF`, then "stir" every byte eight times with the number `0xA001`. You don't need to memorize it. What matters: the CRC is computed from **all** the bytes before it, and computing the CRC over a whole intact frame (including its two CRC bytes) always gives 0. That's how `explainReply()` checks an answer.

#### 3.1W The Wokwi path: a project with the "RS-485 Soil Sensor" chip

The mock Wokwi chip is made of two files: `soil-sensor.chip.json` (its pin names and sliders) and `soil-sensor.chip.c` (its behavior). Both are in the [`code/wokwi-rs485-soil-sensor`](code/wokwi-rs485-soil-sensor) folder, together with the project's `diagram.json`.

1. Open a new ESP32 project on [wokwi.com](https://wokwi.com).
2. In the **`diagram.json`** tab, replace its whole content with the content of [`code/wokwi-rs485-soil-sensor/diagram.json`](code/wokwi-rs485-soil-sensor/diagram.json) (open it on GitHub, click **Copy raw file**, then paste).
3. Create the file **`soil-sensor.chip.json`** with **▾ → New file...** (the small arrow at the right end of the row of tabs), then paste the content of [`soil-sensor.chip.json`](code/wokwi-rs485-soil-sensor/soil-sensor.chip.json) into that new tab.
4. In the same way, create the file **`soil-sensor.chip.c`** and paste the content of [`soil-sensor.chip.c`](code/wokwi-rs485-soil-sensor/soil-sensor.chip.c). The two file names must be exact, because `diagram.json` looks for a chip named `soil-sensor`. The circuit picture is only complete once both files exist.
5. In the **`sketch.ino`** tab, replace its whole content with the `module15_raw_frame` code from step 3.1.
6. Click **▶** (Start the simulation). Wokwi compiles the ESP32 sketch **and** the chip, so wait longer than usual. The chip shows up as a green board labeled "RS-485 Soil Sensor (mock)", connected to RX2, TX2, and D4 like a real MAX485 module.

Under the simulation there are now two tabs: **SERIAL MONITOR** (the ESP32) and **CHIPS CONSOLE** (messages from the mock chip, for example `Mock RS-485 soil sensor ready: address 1, 9600 baud 8N1.`). Save this project (**SAVE**): Practice 4 uses it again. This project also carries a purple **Logic Analyzer** (number 3 in the picture) for 🔬. Because of that, every time the simulation is stopped, the browser downloads a `wokwi-logic.vcd` file. That's normal and safe; you can delete that file if you don't use it.

![Wokwi screenshot of the Practice 3 project with five numbered markers. Left, the circuit: 1 the ESP32, the Node 1 board on the Wokwi path; 2 the green mock chip labeled RS-485 Soil Sensor (mock), made from soil-sensor.chip.json and soil-sensor.chip.c, connected to RX2, TX2, and D4 like a real MAX485 module, with its VCC pin connected to Wokwi's VCC symbol; 3 Wokwi Logic, the purple Logic Analyzer that records DI, RO, and DE/RE for the Technical Deep Dive. Right, 4 the two tabs under the simulation: SERIAL MONITOR for the ESP32's messages and CHIPS CONSOLE for the mock chip's messages. Bottom, 5 the slider panel that appears when you click the chip while the simulation runs: Soil moisture (%) 62.5, Soil temperature (°C) -5, and EC (µS/cm) 1200 as an example; the defaults are 58.5 percent, 25.3 degrees Celsius, and 1,200 microsiemens per centimeter.](assets/wokwi-rs485-soil-sensor.png)

This chip imitates the **Modbus language** (frames, the CRC, the 3.5-character gap, addresses, registers, exceptions) and the DE/RE talk button: if D4 is still HIGH when the chip answers, the answer is lost, exactly as with a real module. What it **doesn't** imitate is the electricity: wires A and B, terminators, cable length, and supply voltage. The chip's VCC pin only needs to be connected to Wokwi's VCC symbol, while a real MAX485 module must still get 5 V. Its readings can be changed with the sliders: click the chip while the simulation runs.

#### 3.2 The first question: "server 1, read me 3 registers starting at register 0"

On real boards, make sure the line-ending option in Node 1's Serial Monitor is also **New Line** (as in 2.4). Then type in its send box and press **Enter**:

```text
01 03 00 00 00 03
```

**Expected output** (Wokwi test recording):

```text
> 01 03 00 00 00 03
sent (8 bytes): 01 03 00 00 00 03 05 CB
received within 15 ms after the request ended.
received (11 bytes): 01 03 06 02 49 00 FD 04 B0 6F DD
  Reply CRC matches: the frame is intact.
  register 0: 02 49 = 585
  register 1: 00 FD = 253
  register 2: 04 B0 = 1200
```

The sketch adds `05 CB` (the CRC) after the six bytes you typed, exactly as in the Concept 5 table. The answer is exactly the same as that table too. On real boards, the second board's blue light blinks once and its Serial Monitor prints `[1] answered a client request`. The millisecond number is a little larger, about 18 ms, because the second board's sketch waits a little longer for a quiet cable than the Wokwi chip does.

Compare with the datasheet (Practice 2.1): 585 ÷ 10 = 58.5%, 253 ÷ 10 = 25.3 °C, and EC 1,200 µS/cm.

#### 3.3 Six more questions

Type them one at a time. Every line in the second column is a Wokwi test recording; on real boards the result is the same, except for the millisecond numbers.

| Type | Expected output | What it means |
| :--- | :--- | :--- |
| `01 04 00 00 00 03` | `sent (8 bytes): 01 04 00 00 00 03 B0 0B`, then `received (11 bytes): 01 04 06 02 49 00 FD 04 B0 2E 3B` | function 04 (input registers) gives the same content; its CRC is different because one byte changed |
| `01 03 00 03 00 01` | `received (7 bytes): 01 03 02 00 01 79 84` and `register 3: 00 01 = 1` | register 3 holds the server address |
| `01 03 00 05 00 01` | `received (5 bytes): 01 83 02 C0 F1` and `Exception: function 03 refused with code 02 = ILLEGAL DATA ADDRESS: the requested register does not exist` | register 5 doesn't exist; the server is alive and refuses quickly |
| `01 03 00 00 00 03 x` | `sent, CRC broken on purpose (8 bytes): 01 03 00 00 00 03 FA 34`, then `received: no reply within 1000 ms (timeout)` | a broken seal: the server throws the frame away and stays silent (in Wokwi, the **CHIPS CONSOLE** prints `Broken frame or wrong CRC (8 bytes): staying silent, like a real device.`) |
| `02 03 00 00 00 03` | `sent (8 bytes): 02 03 00 00 00 03 05 F8`, then `received: no reply within 1000 ms (timeout)` | there's no server at address 2: nobody answers |
| `01 05 00 00 FF 00` | `received (5 bytes): 01 85 01 83 50` and `Exception: function 05 refused with code 01 = ILLEGAL FUNCTION: the server does not know the function code` | function 05 (write coil) is unknown to this sensor |

Notice the two timeouts in that table. From Node 1's side, "a broken seal" and "a wrong address" look **exactly the same**: silence. That's why a timeout always makes us check the cable, the address, and the serial settings (Concept 6), while an exception makes us check the question.

#### 3.4 Change the sensor's address with function 06

In the field, two soil sensors bought from the same shop usually both have address 1. Before both go on one bus, the address of one of them must be changed, and the way to do that is to write its address register with function 06. Try it on your mock sensor:

1. Type `01 06 00 03 00 02` ("server 1, write the number 2 into register 3"). **Expected output:**

   ```text
   > 01 06 00 03 00 02
   sent (8 bytes): 01 06 00 03 00 02 F8 0B
   received within 11 ms after the request ended.
   received (8 bytes): 01 06 00 03 00 02 F8 0B
     Reply CRC matches: the frame is intact.
     Function 06 succeeded: its normal reply is an echo (an exact copy) of the request.
   ```

   The answer to function 06 is an **echo**: an exact copy of the question. The second board's Serial Monitor prints `Server address changed to 2 (back to 1 after a restart).` (in Wokwi, the **CHIPS CONSOLE** prints `Server address changed to 2 (a new simulation = back to 1).`).

2. Type `01 03 00 00 00 03` again. This time it's a **timeout**: server 1 no longer exists.
3. Type `02 03 00 03 00 01` ("server 2, read me register 3"). **Expected output:** `received (7 bytes): 02 03 02 00 02 7D 85` and `register 3: 00 02 = 2`.
4. Set the address back: type `02 06 00 03 00 01`. The answer is the echo `02 06 00 03 00 01 B8 39`, and the sensor has address 1 again.

Now you can read and write Modbus frames by hand. In real firmware, nobody types bytes one at a time: Practice 4 hands that job over to a library.

### Practice 4 — ModbusMaster: reading three registers (40 minutes)

> 🖥️ **Tools:** **Arduino IDE** with two windows, the **ModbusMaster** 2.0.1 library (🧰), the Node 1 board and the second board plugged into the laptop, and the MB102 turned on; the second board runs `module15_mock_sensor` (press **EN** on the second board first so that its readings go back to the default numbers). Concepts used: 4–6.
>
> 🖥️ **Wokwi path:** open the Practice 3 project again. Replace the contents of the **`sketch.ino`** tab with the code in step 4.1, then add the library through the **Library Manager** tab → **+** → type `ModbusMaster` → click the **ModbusMaster** entry (or create a **`libraries.txt`** file with the same contents as [`code/wokwi-rs485-soil-sensor/libraries.txt`](code/wokwi-rs485-soil-sensor/libraries.txt)). The mock sensor's readings are changed with the chip's sliders, not through the Serial Monitor.

In Practice 3, you put the bytes together yourself. The **ModbusMaster** library does all of that for you: it builds the frame, computes the CRC, presses and releases the talk button through the functions you give it, waits for the reply, checks its CRC and address, then hands you the register contents as numbers. The library's name still uses the old term: "master" = client.

#### 4.1 Upload the reader sketch

1. In the Node 1 board's Arduino IDE window, open **File → New Sketch**, delete its contents, paste this code, then save it as `module15_read_registers` in the `module-15` folder.

   ```cpp
   // Module 15 - Practice 4, the NODE 1 board: reading the "RS-485 soil sensor" with the ModbusMaster library.
   // Every 5 seconds it reads registers 0-2, turns them into the real numbers, and prints how long it took.
   // Commands in the Serial Monitor: function 3 | function 4 | server 2 | register 3 | write 3 2
   // Library: ModbusMaster version 2.0.1 (Doc Walker). esp32 package 3.3.12.

   #include <ModbusMaster.h>

   const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
   const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
   const unsigned long READ_INTERVAL = 5000;

   ModbusMaster sensor;
   uint8_t serverAddress = 1;  // the address of the sensor being asked (datasheet: default 1)
   uint8_t functionCode = 3;   // 3 = read holding registers, 4 = read input registers
   unsigned long lastReadTime = 0;
   char line[41];
   int lineLength = 0;

   // Called by ModbusMaster right before it sends a request.
   void beforeSend() {
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // press the talk button
   }

   // Called by ModbusMaster after Serial2.flush(): the last byte of the request has gone out.
   void afterSend() {
     digitalWrite(PIN_RS485_DE_RE, LOW);  // release the talk button: listen for the reply
     while (Serial2.available() > 0) {
       Serial2.read();  // throw away any garbage read while this board was talking
     }
   }

   const char* resultMeaning(uint8_t code) {
     switch (code) {
       case ModbusMaster::ku8MBSuccess: return "success";
       case ModbusMaster::ku8MBIllegalFunction: return "exception 01: function unknown to the server";
       case ModbusMaster::ku8MBIllegalDataAddress: return "exception 02: the requested register does not exist";
       case ModbusMaster::ku8MBIllegalDataValue: return "exception 03: the request content is not valid";
       case ModbusMaster::ku8MBSlaveDeviceFailure: return "exception 04: server failure";
       case ModbusMaster::ku8MBInvalidSlaveID: return "reply server address wrong";
       case ModbusMaster::ku8MBInvalidFunction: return "reply function code wrong";
       case ModbusMaster::ku8MBResponseTimedOut: return "no reply (timeout)";
       case ModbusMaster::ku8MBInvalidCRC: return "reply CRC wrong";
       default: return "another code";
     }
   }

   // Reads registers 0-2 with the function chosen now, then prints the result.
   void readSensor() {
     unsigned long start = millis();
     uint8_t result;
     if (functionCode == 4) {
       result = sensor.readInputRegisters(0, 3);    // from register 0, 3 of them
     } else {
       result = sensor.readHoldingRegisters(0, 3);  // from register 0, 3 of them
     }
     unsigned long elapsed = millis() - start;
     if (result == ModbusMaster::ku8MBSuccess) {
       float moisture = sensor.getResponseBuffer(0) / 10.0;  // datasheet: x10
       float temperature = (int16_t)sensor.getResponseBuffer(1) / 10.0;  // x10 and SIGNED: it can be below zero
       uint16_t ec = sensor.getResponseBuffer(2);            // no multiplier
       Serial.printf("server %u, function %02u: moisture %.1f %%, temperature %.1f C, EC %u uS/cm (%lu ms)\n", serverAddress,
                     functionCode, moisture, temperature, ec, elapsed);
     } else {
       Serial.printf("server %u, function %02u: FAILED, code 0x%02X = %s (%lu ms)\n", serverAddress, functionCode, result,
                     resultMeaning(result), elapsed);
     }
   }

   // Reads just one register and prints its content as it is.
   void readOneRegister(uint16_t number) {
     uint8_t result;
     if (functionCode == 4) {
       result = sensor.readInputRegisters(number, 1);
     } else {
       result = sensor.readHoldingRegisters(number, 1);
     }
     if (result == ModbusMaster::ku8MBSuccess) {
       Serial.printf("register %u (function %02u) holds %u\n", number, functionCode, sensor.getResponseBuffer(0));
     } else {
       Serial.printf("register %u (function %02u): FAILED, code 0x%02X = %s\n", number, functionCode, result, resultMeaning(result));
     }
   }

   void writeRegister(uint16_t number, uint16_t value) {
     uint8_t result = sensor.writeSingleRegister(number, value);  // function 06
     Serial.printf("write register %u = %u to server %u: %s\n", number, value, serverAddress, resultMeaning(result));
   }

   void runCommand() {
     unsigned int a = 0;
     unsigned int b = 0;
     if (sscanf(line, "function %u", &a) == 1 && (a == 3 || a == 4)) {
       functionCode = a;
       Serial.printf("From now on using function %02u.\n", functionCode);
     } else if (sscanf(line, "server %u", &a) == 1 && a >= 1 && a <= 247) {
       serverAddress = a;
       sensor.begin(serverAddress, Serial2);  // change the address being asked
       Serial.printf("From now on asking server %u.\n", serverAddress);
     } else if (sscanf(line, "register %u", &a) == 1 && a <= 65535) {
       readOneRegister(a);
     } else if (sscanf(line, "write %u %u", &a, &b) == 2 && a <= 65535 && b <= 65535) {
       writeRegister(a, b);
     } else {
       Serial.println("Commands: function 3 | function 4 | server 2 | register 3 | write 3 2");
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // start by listening
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // the pins must be written (esp32 3.x package)
     sensor.begin(serverAddress, Serial2);
     sensor.preTransmission(beforeSend);
     sensor.postTransmission(afterSend);
     Serial.println();
     Serial.println("Reading the RS-485 soil sensor every 5 seconds.");
   }

   void loop() {
     if (millis() - lastReadTime >= READ_INTERVAL) {
       lastReadTime = millis();
       readSensor();
     }
     while (Serial.available() > 0) {
       char letter = Serial.read();
       if (letter == '\n') {
         line[lineLength] = '\0';
         lineLength = 0;
         runCommand();
       } else if (letter != '\r' && lineLength < 40) {
         line[lineLength] = letter;
         lineLength++;
       }
     }
   }
   ```

2. Select **DOIT ESP32 DEVKIT V1** and the Node 1 board's port, click **Upload**, then open its Serial Monitor.

   If **Compiler warnings** in **File → Preferences** is set to **More** or **All** (Module 8), Arduino IDE prints two warnings from inside the ModbusMaster library: `'uint16_t crc16_update(uint16_t, uint8_t)' defined but not used` and `'read' is used uninitialized`. Both are in parts of the library that this sketch doesn't use, so they're safe to ignore. With Arduino IDE's default choice (**None**) or with **Default**, neither of them appears.

#### 4.2 The results

Every 5 seconds, Node 1's Serial Monitor prints (a Wokwi test recording):

```text
Reading the RS-485 soil sensor every 5 seconds.
server 1, function 03: moisture 58.5 %, temperature 25.3 C, EC 1200 uS/cm (24 ms)
server 1, function 03: moisture 58.5 %, temperature 25.3 C, EC 1200 uS/cm (24 ms)
```

On a real board, the number in parentheses is about **28 ms**, a little larger, because the second board's sketch waits longer for the cable to go quiet than the Wokwi chip does (this number was measured by running the second board's sketch in Wokwi; see "About the Expected output boxes" in 📚). The second board's blue LED blinks every 5 seconds. These 24–28 ms match the calculation in Concept 5.

#### 4.3 The important parts of the code

- **`sensor.begin(serverAddress, Serial2);`** — the library is told the address of the server it asks and which serial port to use. You still have to start `Serial2` yourself, complete with pins 16 and 17.
- **`sensor.preTransmission(beforeSend);`** and **`sensor.postTransmission(afterSend);`** — the library doesn't know your DE/RE pin, so you give it two functions: "press the talk button" and "release the talk button". The library calls `beforeSend()` right before it sends, then calls `Serial2.flush()` and `afterSend()` after the last byte has gone out. `afterSend()` also throws away garbage letters, like `sendLine()` in Practice 1.
- **`sensor.readHoldingRegisters(0, 3)`** — function 03, from register 0, 3 of them. What it returns is a **result code**, not the register contents. `ku8MBSuccess` (0) means success; any other code is translated by `resultMeaning()`. The register contents are only taken afterwards with **`sensor.getResponseBuffer(0)`**, `(1)`, and `(2)`, and **only** if the result code means success. If it failed, the reply buffer (where the library puts the register contents) still holds old numbers that must not be used.
- **`(int16_t)sensor.getResponseBuffer(1) / 10.0`** — the temperature must be read as a signed number, then divided by 10 (Concept 6).

#### 4.4 Try it yourself

Type these commands in Node 1's Serial Monitor, one at a time. The results in the second column are Wokwi test recordings.

| Type | Expected output | The lesson |
| :--- | :--- | :--- |
| `register 3` | `register 3 (function 03) holds 1` | the server address is stored in register 3 |
| `register 5` | `register 5 (function 03): FAILED, code 0x02 = exception 02: the requested register does not exist` | an exception comes back fast |
| `function 4` | `From now on using function 04.`, then every 5 seconds `server 1, function 04: moisture 58.5 %, …` | the input register cabinet holds the same readings |
| `register 3` (still function 04) | `register 3 (function 04): FAILED, code 0x02 = exception 02: the requested register does not exist` | the address register only exists in the holding register cabinet |
| `function 3` | `From now on using function 03.` | back to function 03 |
| `write 0 999` | `write register 0 = 999 to server 1: success`, but the next reading is still `moisture 58.5 %` | register 0 is read-only; the second board (Wokwi: the **CHIPS CONSOLE** tab) prints `Someone wrote register 0: ignored, registers 0-2 are read-only.` |

Then change the sensor's readings. **Real board:** type `temperature -5.0` in the **second board's** Serial Monitor. **Wokwi:** click the chip, then slide **Soil temperature (°C)** to −5. Node 1's next reading: `temperature -5.0 C`. Now prove why `(int16_t)` matters: delete `(int16_t)` from the temperature line in `readSensor()`, then upload again (Wokwi: stop the simulation, click **▶** again, click the chip, then slide **Soil temperature (°C)** to −5 again). The reading becomes `temperature 6548.6 C`, because `FF CE` is read as 65,486 and then divided by 10. Put `(int16_t)` back, upload again, then set the temperature back to 25.3 °C (`temperature 25.3` on the second board, or press **EN** on the second board).

#### 4.5 How slow a timeout is

1. Type `write 3 2`: the sensor's address becomes 2. The result is `write register 3 = 2 to server 1: success`.
2. Wait for the next reading. **Expected output** (a Wokwi test recording):

   ```text
   server 1, function 03: FAILED, code 0xE2 = no reply (timeout) (2009 ms)
   ```

   Node 1 is still asking server 1, which no longer exists. The library waits a full **2 seconds** before it gives up. During those two seconds, this sketch's `loop()` **stops**: no Serial command gets carried out.

3. Type `server 2`. The next reading succeeds again: `server 2, function 03: moisture 58.5 %, temperature 25.3 C, EC 1200 uS/cm (24 ms)`.
4. Put everything back: type `write 3 1`, then `server 1`.

**Real board:** also try removing wire **A** for a moment. Turn off the MB102 first, unplug both USB cables, remove wire A at one of the modules, then plug both USB cables back in and turn on the MB102 (the safety rule and the golden power rules). The result is the same: `FAILED, code 0xE2` after about 2,000 ms. To put the wire back, repeat the same order: turn off the MB102, unplug both USB cables, reconnect wire A, plug in both USB cables, then turn on the MB102. The readings come back.

Compare these two numbers: a successful question and answer takes about **28 ms**, while a timeout takes **2,009 ms**, seventy times as long. That 2-second limit is built into the ModbusMaster library and can't be changed from the sketch. Node 1 v1.4.0 in Practice 5 is designed so that a timeout like this doesn't keep making Node 1 stall.

> ⬆️ **Done with Practices 2–4?** Go back to [Concept 7](#7-reading-an-rs-485-sensors-datasheet).

### Practice 5 — Node 1 v1.4.0: the RS-485 sensor joins the telemetry (50 minutes)

> 🖥️ **Tools:** **Arduino IDE** with `node-1-home.ino` from the `mini-smart-home` repository, the Node 1 board (USB to the laptop, MB102 on), the second board running `module15_mock_sensor`, a browser to open the curriculum files on GitHub, **MQTTX**, and a terminal for the contract checker. Concepts used: 6–7.
>
> ⭐ **Required** — the Module 15 completion requirement asks for the Modbus readings to show up on the dashboard, and the way there goes through Node 1's `telemetry`.
>
> 🖥️ **Wokwi path:** make all the changes in your Wokwi Node 1 project (Modules 11–14), with `USE_WOKWI` still `true`; the changes for `node-1-home.ino` (step 5.6) are made in the `sketch.ino` tab. Also add the mock chip and the ModbusMaster library as in step 5.8W **before** you click **▶**: step 5.8W replaces step 1 of 5.7 (uploading from Arduino IDE), while steps 2–3 of 5.7 still apply. In step 5.10, use the public broker as in Module 14: `node contract-checker.js broker.emqx.io` followed by your simulated Node 1's `device_id`, and the **Public broker** connection in MQTTX. Every **Expected output** box in this practice is a Wokwi test recording.

From Practice 4, you know two things: a successful question and answer only takes about 28 ms, but a timeout makes `loop()` stand still for **2 seconds**. Node 1's firmware must not stand still that long very often, because the button, the display, MQTT, and the Node 2 bridge all run in the same `loop()` (Module 8). That's why Node 1 v1.4.0 is designed like this:

- The RS-485 sensor is read **every 10 seconds**, the same as the `telemetry` schedule, not every 2 seconds like the other sensors.
- If the sensor doesn't answer **three times in a row**, Node 1 only tries **every 60 seconds** until the sensor answers again. A reply that was damaged on the way (a wrong CRC, address, or function code in the reply) is tried once more after the cable has been quiet for a moment. The cause is sometimes one "ghost byte" read while the cable changes direction; the collapsible sections 🚨 "Now and then `reply CRC wrong` …" and 🔬 "Terminators, bias, and ghost bytes" explain it.
- There's a **switch**: the Serial commands `rs485 on` and `rs485 off`, saved in NVS like `threshold` in Module 8. It's **off** by default, because a Node 1 that has no RS-485 sensor yet doesn't need to ask questions over an empty cable.
- When the switch is on, `telemetry` gets three new fields under **data contract 1.2**: `soil_rs485`, `soil_temperature`, and `ec`. If the last reading failed, all three are `null`. When the switch is off, none of the three is written at all.

Node 1 v1.4.0 = v1.3.0 + **two new files** + **small changes in six files**:

| File | Change | How |
| :--- | :--- | :--- |
| `rs485.h` / `.cpp` | **new**: reading the RS-485 sensor, the `rs485 on`/`off` switch, the `telemetry` fields | copy them from the curriculum (step 5.1) |
| `config.h` | version `1.4.0`, the status LED moves to D2, the RS-485 pins and schedule | type (step 5.2) |
| `settings.h` / `.cpp` | the `rs485` switch in NVS | type (step 5.3) |
| `commands.cpp` | the `rs485`, `rs485 on`, and `rs485 off` commands | type (step 5.4) |
| `networking.cpp` | three new fields in `telemetry`, a bigger JSON container | type (step 5.5) |
| `node-1-home.ino` | calls `setupRS485()` and `updateRS485()` | type (step 5.6) |

#### 5.1 Two new files

1. In Arduino IDE, open **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home** → `node-1-home.ino`.
2. Create two new tabs (**⋯ → New Tab**, type the name complete with its ending, then click **OK**; in Wokwi: **▾ → New file...**): **`rs485.h`** and **`rs485.cpp`**.
3. Fill both of them as in Module 14: open each file below in a new browser tab, click the **Copy raw file** icon, go back to Arduino IDE, then paste (**Ctrl + V**).
   - [`code/node-1-home/rs485.h`](code/node-1-home/rs485.h)
   - [`code/node-1-home/rs485.cpp`](code/node-1-home/rs485.cpp)
4. Take a moment to read `rs485.cpp`. `beforeSend()` and `afterSend()` are the same as in Practice 4. `readRegisters()` asks "function 03, registers 0–2" (the constants `FIRST_REGISTER` and `REGISTER_COUNT` at the top of the file). If the reply was damaged on the way, it waits for the cable to be quiet for a moment (20 ms at 9600 baud), then asks once more. `updateRS485()` handles the 10-second and 60-second schedules, keeps the result, and logs errors. `writeRS485Fields()` writes the three `telemetry` fields. Its register map (register 0 divided by 10, register 1 divided by 10 and signed, register 2 as it is) follows the mock sensor's datasheet; for a real sensor, this is the part you adapt (🧩 Level 3).

#### 5.2 `config.h`

1. Change its version number:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.3.0";
   ```

   to:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.4.0";
   ```

2. Move the status LED to D2 (you already moved it on the breadboard in the Quick Win). Change:

   ```cpp
   const int PIN_STATUS_LED = 4;      // Module 2
   ```

   to:

   ```cpp
   const int PIN_STATUS_LED = 2;      // Module 2; moved from D4 to D2 in Module 15 (D4 is now the RS-485 DE/RE)
   ```

3. Replace these two "reserved" comment lines:

   ```cpp
   // Reserved for later modules (don't use them for anything else):
   // Module 15: RS-485 RX = 16, TX = 17, DE/RE = 2
   ```

   with three pin lines:

   ```cpp
   const int PIN_RS485_RX = 16;       // Module 15, RX2 <- RO of the MAX485 module through a 4.7 kΩ + 10 kΩ voltage divider
   const int PIN_RS485_TX = 17;       // Module 15, TX2 -> DI of the MAX485 module
   const int PIN_RS485_DE_RE = 4;     // Module 15, D4 -> DE and RE of the MAX485 module, joined together
   ```

4. At the **very bottom** of the file, after the `NODE2_OFFLINE_MARGIN` line, add:

   ```cpp

   // ---------- Module 15: RS-485 soil sensor (Modbus RTU) ----------
   // Whether it is used is set with the Serial command "rs485 on" / "rs485 off" (saved in NVS).
   const unsigned long RS485_BAUD = 9600;                 // sensor datasheet: 9600 baud, 8N1
   const uint8_t RS485_SENSOR_ADDRESS = 1;                // the sensor's server address (datasheet: default 1)
   const unsigned long RS485_READ_INTERVAL = 10000;       // the sensor is read every 10 seconds
   const unsigned long RS485_SLOW_READ_INTERVAL = 60000;  // after 3 times without a reply: every 60 seconds
   ```

#### 5.3 `settings.h` and `settings.cpp`

1. In **`settings.h`**, below the line `unsigned long bootCount();`, add:

   ```cpp
   bool rs485SensorEnabled();                    // Module 15: true after the "rs485 on" command
   void saveRs485SensorEnabled(bool enabled);    // Module 15: "rs485 on" / "rs485 off", saved in NVS
   ```

2. In **`settings.cpp`**, below the line `static unsigned long bootNumber = 0;`, add:

   ```cpp
   static bool useRS485 = false;  // Module 15: not in use by default (no sensor connected yet)
   ```

3. Still in `settings.cpp`, in the `loadSettings()` function, right below the line `logInfo("Boot #%lu. …`, add:

   ```cpp
     useRS485 = archive.getBool("rs485", false);  // label never written = not in use
   ```

4. At the **very bottom** of `settings.cpp`, after the `bootCount()` function, add:

   ```cpp

   bool rs485SensorEnabled() {
     return useRS485;
   }

   void saveRs485SensorEnabled(bool enabled) {
     if (enabled == useRS485 && archive.isKey("rs485")) {
       return;  // already the same: no need to write it again (flash can only be written so many times)
     }
     archive.putBool("rs485", enabled);
     useRS485 = enabled;
     logInfo("RS-485 sensor %s (saved to NVS)", enabled ? "in use" : "not in use");
   }
   ```

   This pattern is the same as `saveSoilWateringThreshold()` from Module 8: the label `rs485` in the `node1` folder, and NVS is only written when its content changes.

#### 5.4 `commands.cpp`

1. Below the line `#include "bridge.h"`, add:

   ```cpp
   #include "rs485.h"
   ```

2. Find the line `} else if (command == "send") {`, then insert **above it**:

   ```cpp
     } else if (command == "rs485") {
       printRS485Info();  // Module 15: RS-485 soil sensor
       return;
     } else if (command == "rs485 on") {
       useRS485(true);  // Module 15: start reading the sensor every 10 seconds
       printRS485Info();
       return;
     } else if (command == "rs485 off") {
       useRS485(false);  // Module 15: stop reading; its fields disappear from telemetry
       printRS485Info();
       return;
   ```

3. In the command list at the very bottom, change the line:

   ```cpp
       Serial.println("send, node2, node2 reset, restart");
   ```

   to:

   ```cpp
       Serial.println("send, node2, node2 reset, rs485, rs485 on, rs485 off, restart");
   ```

#### 5.5 `networking.cpp`

1. Below the line `#include "display.h"`, add:

   ```cpp
   #include "rs485.h"
   ```

2. In the `publishTelemetry()` function, find the line `char content[192];`, then replace that one line with these two lines:

   ```cpp
     writeRS485Fields(doc);  // Module 15: soil_rs485, soil_temperature, ec (only when the RS-485 sensor is in use)
     char content[256];  // Module 15: enlarged from 192 for the three RS-485 fields
   ```

   A `telemetry` message with the three new fields is about 180 characters long, too tight for a 192-byte container.

#### 5.6 `node-1-home.ino`

1. Replace the first line:

   ```cpp
   // Node 1 "Home" - firmware v1.3.0 (Module 14: the ESP-NOW bridge for Node 2 "Garden")
   ```

   with:

   ```cpp
   // Node 1 "Home" - firmware v1.4.0 (Module 15: RS-485 soil sensor over Modbus RTU)
   ```

   Then, above the line `// New in v1.3.0: …`, insert these three lines:

   ```cpp
   // New in v1.4.0: Node 1 is now a Modbus RTU client. Every 10 seconds it reads three registers of the RS-485 soil sensor
   // (via the MAX485 module on Serial2) and adds soil_rs485, soil_temperature, and ec to telemetry (data contract 1.2).
   // The sensor is used after the "rs485 on" command. The status LED moves to D2 because D4 is now the DE/RE pin.
   ```

2. In the command list, replace the line:

   ```cpp
   // threshold, threshold 35, threshold default, log debug, log info, log error, wifi, wifi forget, send, node2, node2 reset, restart.
   ```

   with two lines:

   ```cpp
   // threshold, threshold 35, threshold default, log debug, log info, log error, wifi, wifi forget, send, node2,
   // node2 reset, rs485, rs485 on, rs485 off, restart.
   ```

3. In the list of libraries, replace `WiFiManager version 2.0.17, ArduinoJson version 7.4.3, and PubSubClient3 version 3.3.2.` with `WiFiManager version 2.0.17, ArduinoJson version 7.4.3, PubSubClient3 version 3.3.2, and ModbusMaster version 2.0.1.`.
4. Below the line `#include "bridge.h"   // Module 14: Node 2 over ESP-NOW`, add:

   ```cpp
   #include "rs485.h"    // Module 15: RS-485 soil sensor
   ```

5. In `setup()`, below the line `setupBridge();   // Module 14: after the WiFi is on`, add:

   ```cpp
     setupRS485();    // Module 15
   ```

6. In `loop()`, below the line `runCycle();`, add:

   ```cpp
     updateRS485();         // Module 15: the RS-485 sensor every 10 seconds; waits up to 2 seconds if the sensor is silent
   ```

#### 5.7 Upload

1. Make sure the selected board is **ESP32 Dev Module**, with **Partition Scheme** **Minimal SPIFFS** and **Flash Mode** **DIO** (Node 1's settings since Module 10), and the port is the **Node 1** board's. Click **Upload**. Arduino IDE prints something like `Sketch uses 1187604 bytes (60%) of program storage space. Maximum is 1966080 bytes.`
2. Open Node 1's Serial Monitor. Among its first lines you'll find (example):

   ```text
   [00:00:02] INFO  Node 1 Home - firmware 1.4.0
   …
   [00:00:03] INFO  RS-485 sensor not in use. Is it connected? Type: rs485 on
   ```

   Does compiling fail with `ModbusMaster.h: No such file or directory`? Install the library (🧰). Does it fail with `'writeRS485Fields' was not declared in this scope`? The line `#include "rs485.h"` in `networking.cpp` (step 5.5) was missed. A similar message for `printRS485Info` or `useRS485` means that line was missed in `commands.cpp` (step 5.4), and for `setupRS485` or `updateRS485`, in `node-1-home.ino` (step 5.6).

3. The status LED now blinks on **D2**, and the board's built-in blue LED blinks along with it. If the red LED on the breadboard doesn't blink, check Quick Win step 2.

#### 5.8W The Wokwi path: add the chip to the Node 1 project

1. In your Wokwi Node 1 project, create the files **`soil-sensor.chip.json`** and **`soil-sensor.chip.c`** through **▾ → New file...**, with the same contents as in step 3.1W.
2. In the **`diagram.json`** tab, replace its whole content with the content of [`code/node-1-home/diagram.json`](code/node-1-home/diagram.json). It holds the Module 14 Node 1 circuit with the status LED on D2 and the soil sensor chip on RX2, TX2, and D4. Before you replace it, copy the `"macAddress": …` line from your project's `diagram.json` tab (the MAC address you chose yourself in Module 11), then paste it into `notes-module15.md` so that it isn't lost when you click **Copy raw file** (step 5.11 uses it again). The new content uses the default `24:0a:c4:00:01:10`, so put your own line back after pasting. Without that, your simulated Node 1's `device_id` changes, could be the same as someone else's on the public broker, and no longer matches the topics in your Node-RED.
3. In the **`libraries.txt`** tab, replace its whole content with the content of [`code/node-1-home/libraries.txt`](code/node-1-home/libraries.txt) (the same as in Module 14, plus `ModbusMaster@2.0.1`).
4. Click **▶**.

#### 5.9 Turn the switch on

Type this in the send box of Node 1's Serial Monitor:

```text
rs485
```

The answer is `rs485: not in use, so its fields are not in telemetry. Is the sensor connected? Type: rs485 on`. Now type:

```text
rs485 on
```

**Expected output** (a Wokwi test recording):

```text
[00:00:22] INFO  RS-485 sensor in use (saved to NVS)
rs485: in use, server 1, 9600 baud 8N1, read every 10 seconds
rs485: no reading yet
rs485: succeeded 0, timeouts 0, other errors 0
[00:00:22] INFO  RS-485: soil_rs485=58.5 %  soil_temperature=25.3 C  ec=1200 uS/cm  (24 ms)
…
[00:00:32] INFO  RS-485: soil_rs485=58.5 %  soil_temperature=25.3 C  ec=1200 uS/cm  (24 ms)
```

On a real board, the number in parentheses is about 28 ms. Because the switch is saved in NVS, Node 1 keeps reading the RS-485 sensor after a restart or a power cut, until you type `rs485 off`. Wokwi is a different story: NVS is empty again every time the simulation is stopped and started again (Module 8), so type `rs485 on` again every time you start a new simulation. To imitate a power cut in Wokwi, type `restart`.

#### 5.10 Check the `telemetry` and data contract 1.2

1. **Update the contract checker to version 1.2.** Since contract 1.2, the `soil_temperature` field can come from Node 1, while checker version 1.1 treats `soil_temperature` as the mark of Node 2's `telemetry`. Open [`mini-smart-home/tools/contract-checker.js`](../../mini-smart-home/tools/contract-checker.js) on GitHub, click **Copy raw file**, then in VS Code replace the whole content of `tools/contract-checker.js` in your `mini-smart-home` repository with what you just copied, and save.
2. Run the checker **on the laptop** (in the `tools` folder), as in Modules 13–14 (Wokwi path: replace the address with `broker.emqx.io`, then add your simulated Node 1's `device_id`):

   ```bash
   node contract-checker.js 192.168.1.37
   ```

   **Expected output** (a test recording on the lab broker): `msh/a4cf12e5b7c0/telemetry  PASS` appears every 10 seconds. Checker version 1.2 also makes sure the three RS-485 fields always come together.

3. In **MQTTX**, subscribe to `msh/a4cf12e5b7c0/telemetry` (replace `a4cf12e5b7c0` with your Node 1's `device_id`). **Expected output** (a Wokwi test recording; the sensor fields from your own house will surely be different):

   ```json
   {"ts":"2026-10-19T08:56:11Z","fw":"1.4.0","temperature":28.5,"humidity":71,"light":3094,"soil":70,"motion":false,"water_level":52,"soil_rs485":58.5,"soil_temperature":25.3,"ec":1200}
   ```

#### 5.11 The dead-sensor test

Now prove that a dead sensor doesn't keep making Node 1 stall.

1. Unplug the **second board's** USB. The mock sensor and its MAX485 module go off, like a real sensor whose power has been cut. **Wokwi:** connections can't be removed while the simulation is running. Stop the simulation, click the soil sensor chip in the circuit, press **Delete**, then click **▶** and type `rs485 on` again (Wokwi's NVS is always empty in a new simulation).
2. Wait about 40 seconds (in Wokwi it can take up to about 2 minutes, because the simulation runs slower than real time). **Expected output** (a Wokwi test recording, with the chip removed from the circuit; the clock times at the start of the lines will of course be different):

   ```text
   [00:00:23] ERROR RS-485 failed: no reply (timeout) (code 0xE2, 2010 ms)
   …
   [00:00:35] ERROR RS-485 failed: no reply (timeout) (code 0xE2, 2010 ms)
   …
   [00:00:47] ERROR RS-485 failed: no reply (timeout) (code 0xE2, 2009 ms)
   [00:00:47] ERROR RS-485 sensor did not answer 3 times in a row: from now on it is tried every 60 seconds.
   ```

   The lines are 12 seconds apart, not 10: the 10-second schedule is counted from the **end** of the previous reading, and every failed reading takes 2 seconds. Type `rs485`, and the answer is now `rs485: in use, server 1, 9600 baud 8N1, read every 60 seconds`, `rs485: last reading FAILED: no reply (timeout) (code 0xE2, 0 s ago)`, and `rs485: succeeded 0, timeouts 3, other errors 0` (on a real board, the `succeeded` number is larger, because the sensor had already been read; in Wokwi it stays 0, as in the recording).

   `telemetry` now carries `"soil_rs485":null,"soil_temperature":null,"ec":null`, and the contract checker still prints `PASS`: a failed reading must be written as `null` (data contract, rule 7).

3. Type `info`. The `longest loop() pass` line now shows about **2,000 ms** or a little more: that's the ModbusMaster timeout. (In Wokwi, this number is about 2,000 ms from the start, because connecting to the public broker also takes about 2 seconds; the test recording shows 2,026 ms.) That's still far below the 5-second watchdog limit, and after three failures, an event like that only happens again every 60 seconds.
4. Plug the second board's USB back in. Within a minute, Node 1's Serial Monitor prints `RS-485: soil_rs485=58.5 % …` again, and its schedule goes back to every 10 seconds. **Wokwi:** stop the simulation, paste the `diagram.json` from step 5.8W again (with your `macAddress`), click **▶**, then type `rs485 on`.

> ➡️ **Continue** to [Practice 6 — The RS-485 Sensor group in Node-RED](#practice-6--the-rs-485-sensor-group-in-node-red-and-the-5-m-cable-test-45-minutes) without going back to the concepts.

### Practice 6 — The RS-485 Sensor group in Node-RED and the 5 m cable test (45 minutes)

> 🖥️ **Tools:** the laptop's browser with the Node-RED editor (Module 13), a phone connected to the home Wi-Fi, Node 1 v1.4.0 with `rs485 on`, the second board running the mock sensor, the 5 m UTP cable, a wire stripper, a small screwdriver, and Node 1's charger. Concepts used: 6–7.
>
> ⭐ **Required** — the Module 15 completion requirement asks for the Modbus values to show up on the dashboard and to be read over an RS-485 cable at least 5 m long.
>
> 🖥️ **Laptop path and Wokwi path:** the steps are the same, in the Node-RED on your laptop (Practice 8 of Module 13). In step 6.2, choose the same **Server** as in your `telemetry Node 1` node, and fill in the topic with your Node 1's `device_id` (Wokwi path: the simulated board's `device_id`). Steps 6.4 and 6.5 (the 5 m cable) are only for real boards; in Wokwi, click the chip, slide **Soil moisture (%)** or **Soil temperature (°C)**, then watch the number change on the phone.

This new group holds nine nodes plus one configuration node (the group itself), so, as in Module 14, you **import** it from the curriculum.

#### 6.1 Import the RS-485 Sensor flow piece

1. Open [`code/node-red-rs485-sensor.json`](code/node-red-rs485-sensor.json) on GitHub, then click the **Copy raw file** icon.
2. In the Node-RED editor, open the **Mini Smart Home** tab, then scroll the workspace down until there's empty space below section 5 (Garden).
3. Open the main menu (the three-line icon at the top right) → **Import**, or press **Ctrl + I**. Paste (**Ctrl + V**) into the text box of the `Import nodes` window, then click **Import**.
4. Move the mouse to that empty space, then click once to drop the nodes that are stuck to the mouse pointer.

As in Module 14, some nodes have a red triangle: their broker settings and their dashboard page aren't connected to yours yet.

#### 6.2 Connect it to the broker and to your Node 1's `device_id`

1. Double-click the **telemetry Node 1 (RS-485)** node. In the empty **Server** list, choose **Mosquitto on the gateway** (the broker settings from Module 13). Don't click the **+** button next to it.
2. In the **Topic** field, replace `a4cf12e5b7c0` with your Node 1's `device_id`, then click **Done**.
3. Double-click any widget in section 6, for example the **Sensor state** text. Click the pencil icon next to the **Group** line, choose **Home [/dashboard/home]** in the **Page** list, then click **Update** and **Done**. The red triangles on all four widgets disappear at once.
4. Click **Deploy**.

The `telemetry Node 1 (RS-485)` node subscribes to the same topic as the `telemetry Node 1` node in section 1. That's fine: one broker connection can be used by many nodes, and every message reaches both of them.

#### 6.3 See the RS-485 Sensor group on the phone

Open the dashboard on the phone (`http://192.168.1.37:1880/dashboard/home`), then scroll to the very bottom. The **RS-485 Sensor** group appears below the **Garden** card and fills in within 10 seconds.

![Two screenshots of the Home dashboard, taken in a laptop browser at the width of a phone screen (412 pixels), each framed as a phone, scrolled to the very bottom so that the RS-485 Sensor group shows below the Garden chart. Left, the sensor is read: Sensor state reading, the Soil moisture (RS-485) gauge at 58.5 percent, the Soil temperature (RS-485) gauge at 25.3 degrees Celsius, and EC (electrical conductivity) 1200 µS/cm. Right, the sensor doesn't answer: Sensor state no reading, both gauges still point at 58.5 and 25.3, and EC holds only a dash. Three numbers are explained on the right: 1 Sensor state, which is reading, no reading if its fields are null (the last reading failed), or not in use if the fields are missing (rs485 off); 2 the two gauges, RS-485 soil moisture and soil temperature, which freeze at the last valid value because the switch node holds back null; 3 EC, a JSONata text in µS/cm, holding a dash if null. Message: because the gauges can freeze, always read the Sensor state line first. Data from a mock Node 1 in the author's lab.](assets/phone-rs485-sensor.png)

| Widget | Where its value comes from | Notes |
| :--- | :--- | :--- |
| **Sensor state** | whether `soil_rs485` is in the `telemetry` | `reading`; `no reading` if the field is `null` (the last reading failed); `not in use` if the field is missing (`rs485 off`) |
| **Soil moisture (RS-485)** | `soil_rs485` | guarded by the **switch** node `RS-485 moisture present?` (the rule **is not null**) |
| **Soil temperature (RS-485)** | `soil_temperature` | guarded by the **switch** node `RS-485 soil temperature present?` |
| **EC (electrical conductivity)** | `ec` | text made with JSONata; `-` if it's `null` |

Why is there a **Sensor state** widget? Because the switch nodes hold back messages with `null`, the gauges keep pointing at the last valid number when the sensor is dead. Without the state line, a "frozen" gauge looks like a fresh reading. Step 6.5 shows it.

#### 6.4 ⭐ Replace the short wires with the 5 m UTP cable

This is the real test: two devices with **separate power sources**, connected by an RS-485 cable 5 m long.

1. Turn off the MB102, then unplug the USB from both boards (the safety rule).
2. Remove both female–female wires, A–A and B–B, and also the black shared GND wire from Quick Win step 5.
3. Prepare the UTP cable: strip its outer jacket about 3 cm at both ends. Inside are **four pairs** of twisted wires. Choose **one pair** for A and B, for example **blue** (A) and **white-blue** (B), then one wire from another pair for GND, for example **brown**. Strip the ends of those three wires about 7 mm. Stranded wire? Twist the end of each wire tightly so that no strand sticks out toward the next terminal. For the brown wire, use the trick from 🧰 (wrap it around the leg of a male–male jumper wire and cover it with tape), then in steps 4 and 5 plug in the other end of that jumper wire. Cut the other wires short or fold them back so that they don't touch anything.
4. **Node 1 side:** loosen the **A** screw terminal of the MAX485 module, insert the blue wire, and tighten it. Repeat for the white-blue wire in terminal **B**. Plug the brown wire into **bottom rail (−) column 15** of the Node 1 workbench.
5. **Second board side:** insert the blue wire into terminal **A** and the white-blue wire into terminal **B**, then plug the brown wire into **bottom rail (−) column 20** of the mini breadboard. The same color must go into the same letter at both ends. If you really had to swap A and B in the Quick Win, swap them here too.
6. Gently pull each wire in the screw terminals: none of them may come out.
7. Stretch the cable out, or put the two boards as far apart as the cable allows. A neat coil is fine too: what's being tested is the length of the wire.
8. Plug the second board's USB into the laptop. Plug the Node 1 board's USB into **its own charger**, not into the laptop, then turn on the MB102. Now the two boards have different power sources, and it's the brown wire that joins their GNDs.
9. Wait about a minute (Node 1 connects to the Wi-Fi and the broker). The **RS-485 Sensor** group on the phone says `reading` again, with the numbers 58.5%, 25.3 °C, and 1,200 µS/cm. The second board's blue LED also blinks every 10 seconds.

Want to see the statistics? The contract checker on the laptop keeps printing `PASS` for every `telemetry`. To read the success and timeout counts, move Node 1's USB from its charger to the laptop for a while: turn off the MB102, move the USB plug, then turn the MB102 back on. The board restarts and its counts start from 0, so wait a few minutes before you open the Serial Monitor and type `rs485`. During that time, both boards get their power from the same laptop, so these counts only test the cable length, not the separate power sources. After that, put Node 1's USB back on its charger in the same order.

#### 6.5 The silent-sensor test on the dashboard

1. Unplug the **second board's** USB. Within about 20 seconds, **Sensor state** changes to `no reading` and **EC** to `-`, but both gauges stay at the last number.
2. Plug the second board's USB back in. Within about a minute (remember the 60-second schedule after three timeouts, plus the 10-second `telemetry` schedule), **Sensor state** goes back to `reading`.

If steps 6.4 and 6.5 worked, the hardware part of the Module 15 completion requirement is met: **Node 1 reads Modbus registers from a second ESP32 over a 5 m cable, and their values show up on the dashboard.** Write in `notes-module15.md`: the test date, the cable length, and the color pair you used for A and B.

> ⬆️ **Done with Practices 5–6?** Go back to [Concept 8](#8-choosing-the-right-protocol).

### Practice 7 — Choosing a protocol: the decision table and five scenarios (40 minutes)

> 🖥️ **Tools:** `notes-module15.md`, and the decision table and decision tree in Concept 8. No board needed. Concepts used: 8.
>
> ⭐ **Required** — the Module 15 completion requirement asks you to choose the right protocol for five scenarios.

For each scenario, do three things in `notes-module15.md` **before** you open its answer key:

1. First answer the relevant deciding questions of Concept 8 (distance, power, how often, signal and willingness to pay for a plan, number of nodes, commands back, cables).
2. Write down the protocol you choose.
3. Write down **at least two reasons**, each pointing to a deciding question.

Your answer counts as correct if its protocol is the same as in the key (or is one of two answers that are both correct) **and** at least two of your reasons make sense. Memorizing the key is pointless: it's your reasoning that's assessed.

#### Scenario 1 — A rice field 3 km from home, with no electricity

Mr. Darto in Klaten wants to monitor the soil moisture and temperature of his rice field, about 3 km from his home. There's no grid power (PLN) and no Wi-Fi at the field. It's enough to send the data every 15 minutes and show it on a dashboard at home. Mr. Darto doesn't want to pay a monthly subscription.

<details>
<summary>Answer key, scenario 1</summary>

**LoRa**, in the **920–923 MHz** band: point-to-point to a receiver module at home, or LoRaWAN with your own gateway on the roof of the house.

- **A distance of kilometers.** Wi-Fi and ESP-NOW only reach about 150–300 m in open space; LoRa can reach several kilometers, especially if the antenna at home is mounted high.
- **No electricity.** A LoRa radio sleeps at 0.2 µA and is only on briefly, so it suits a battery (plus a small solar panel).
- **Small, infrequent data.** One 12-byte message every 15 minutes uses far less than the 1% transmit-time limit.
- **Tempting alternatives:** NB-IoT is out because Mr. Darto doesn't want to pay a monthly subscription; besides, there may not even be an NB-IoT signal at the rice field. 433 MHz modules are legal, but their power is limited to much less, and they don't fit Indonesia's LoRaWAN networks.

</details>

#### Scenario 2 — A temperature sensor in the room next to the router

Rina wants to monitor the temperature and humidity of her bedroom. The Wi-Fi router is in the living room, one wall away from the bedroom. The sensor is plugged into a phone charger.

<details>
<summary>Answer key, scenario 2</summary>

**Wi-Fi**, like Node 1: ESP32 → Wi-Fi → MQTT.

- **Close to the router.** Tens of meters inside a house are still within Wi-Fi's reach.
- **There's power.** The Wi-Fi radio's appetite for power doesn't matter when the sensor is plugged into a charger.
- **No extra equipment.** No gateway or new subscription is needed; the data goes straight to the broker on the Pi.
- **Tempting alternatives:** ESP-NOW needs a second ESP32 as a bridge (overkill); LoRa and NB-IoT are for much greater distances; BLE only if it's enough to look at the data on a phone while you're near the sensor.

</details>

#### Scenario 3 — Ten industrial soil sensors in a 200 m greenhouse

A melon greenhouse in Lembang installs ten industrial soil sensors (moisture, temperature, EC) with **RS-485** outputs, lined up along 200 m. There are many electric pumps and fans there. Cables may be run along the racks.

<details>
<summary>Answer key, scenario 3</summary>

**RS-485 / Modbus RTU**: one bus shaped like a chain, addresses 1–10, for example 9600 8N1, 120 Ω terminators at both ends.

- **The sensors already speak Modbus RTU** over RS-485; they only need to be connected and asked in turn.
- **Cables may be run.** A length of 200 m is still far below the limit of about 1 km at 9600 baud.
- **Lots of electrical noise.** A differential signal on twisted wires resists the noise from the pump and fan motors (Concept 1).
- **Ten nodes** are still far below 32 loads per bus, and one client reads all of them in turn.
- **Tempting alternatives:** Wi-Fi or ESP-NOW would mean making every sensor wireless and giving each one its own power; LoRa is slow and limited to 1% transmit time for ten sensors that are read often.

</details>

#### Scenario 4 — A door sensor on a coin cell, in a home that already has a hub

The Wijaya family already has a smart home hub that supports Zigbee, Thread, and Matter. They want a small door sensor with a **CR2032 coin cell** that lasts a long time.

<details>
<summary>Answer key, scenario 4</summary>

**Zigbee**, or **Thread/Matter** if the hub also works as a Thread border router. Both are correct.

- **A small coin cell.** A CR2032 only holds about 235 mAh. A Zigbee/Thread chip draws about 7 mA while sending and under 1 µA on standby, so it fits.
- **An ESP32 DevKit doesn't fit.** The board's sleep current is about 4.9 mA (Module 14), so that battery would run out in about two days (235 ÷ 4.9 ≈ 48 hours). Besides, the classic ESP32 has no 802.15.4 radio.
- **The hub is already there.** The sensor just gets paired with the hub, and the mesh network is made stronger by smart lamps or smart plugs.
- **Tempting alternatives:** Wi-Fi uses too much power; ESP-NOW needs an ESP32 on both sides, and the board's sleep current is large; LoRa is overkill for one house.

</details>

#### Scenario 5 — A cattle tracker on a wide pasture with cellular signal

A rancher on Sumba lets fifty head of cattle roam a pasture of tens of square kilometers. He wants the GPS position of every cow sent every 30 minutes. Phones still get a cellular operator's signal on that pasture, and he's willing to pay for a monthly data plan for each tracker.

<details>
<summary>Answer key, scenario 5</summary>

**NB-IoT**. LTE-M would actually be the best fit for things that move, but as of October 2026 it isn't listed as available in Indonesia.

- **An area of tens of kilometers, and the cattle keep moving.** Building your own gateways everywhere is expensive, while the operators' networks already exist.
- **Small, infrequent data.** A position and a battery voltage are only tens of bytes; an NB-IoT module sleeps at about 0.8–3.2 µA between sends.
- **The requirements:** a SIM card and an NB-IoT plan from an operator, and the NB-IoT coverage at the site must be checked first (not just the 4G signal on a phone).
- **Tempting alternatives:** LoRaWAN is also possible if there's no NB-IoT signal (a gateway on a hill), but you have to build and maintain the network yourself; Wi-Fi, ESP-NOW, and BLE don't reach that far.

</details>

#### Extra exercises (optional)

**A. A chili pot at the far end of the yard.** A soil moisture sensor powered by an 18650 battery in a chili pot, about 40 m from the house. The Wi-Fi signal there is weak, but inside the house there's an ESP32 (Node 1) connected to the Wi-Fi and the broker.

<details>
<summary>Answer key, exercise A</summary>

**ESP-NOW**, exactly Node 2's pattern in Module 14: wake up, send one packet to Node 1 in milliseconds, then go back to sleep. No router or Wi-Fi password is needed in the garden, and 40 m is still far below the limit of about 150 m. Ordinary Wi-Fi needs 1–3 seconds to connect every time it wakes up, so it wastes power; LoRa is overkill, because it needs extra modules on both sides.

</details>

**B. Five catfish ponds, 800 m from the house.** The ponds run along the field dikes and a village road. There's grid power (PLN) at the pond hut. What needs to be monitored: the water temperature and dissolved oxygen every 5 minutes, plus turning on an aerator from the house.

<details>
<summary>Answer key, exercise B</summary>

**RS-485/Modbus RTU or LoRa: both are correct**, and it's the reasons that are assessed. The deciding question: **may an 800 m cable be run, and is it safe to run it?**

- **RS-485** is correct if a cable may be run and it's safe. 800 m is still below about 1 km at 9600 baud, as long as the cable is a twisted pair made for RS-485; ordinary Category 5 LAN cable is only recommended up to about 600 m (Concept 1). RS-485 is reliable, has no frequency rules to deal with, and the aerator command arrives instantly. Its drawback is the cost of the cable: even ordinary UTP cable costs about IDR 7,250 per meter, or about IDR 5,800,000 for 800 m, and cable made for RS-485 is usually more expensive. Also add lightning protection for a cable that runs outdoors.
- **LoRa** is correct if a cable is hard to run (across other people's land or a road, at risk of being cut): two 920–923 MHz modules and their antennas are much cheaper, and the receiver at the hut can keep listening for aerator commands because there's grid power.

</details>

> ➡️ **Done with Practice 7?** Do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1), then the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home).

---

## 🚨 Troubleshooting

Many MAX485 and Modbus tutorials on the internet were written for the Arduino Uno or for esp32 package 2.x. If a tutorial does it the way in the left column, translate it into this week's way:

| Old tutorial | The way now (this module, esp32 package 3.3) |
| :--- | :--- |
| `Serial2.begin(9600);` without pins | `Serial2.begin(9600, SERIAL_8N1, 16, 17);` — without pins, package 3.x uses GPIO 4 and 25 (on Node 1: DE/RE and the **pump**) |
| `SoftwareSerial rs485(10, 11);` (Arduino Uno) | the ESP32 has hardware UARTs: use `Serial2` |
| `node.begin(1, Serial);` (the Uno has only one UART) | `sensor.begin(1, Serial2);`; `Serial` stays for the Serial Monitor |
| the module's RO straight to the RX pin | RO through the 4.7 kΩ + 10 kΩ divider (Concept 2) |
| the MAX485 module powered with 3.3 V | the MAX485 module powered with **5 V**; for 3.3 V, buy a MAX3485 or SP3485 module |
| DE/RE on GPIO 2 | DE/RE on **D4**; D2 is a strapping pin (the collapsible section "Upload fails" below) |
| `digitalWrite(DE, LOW)` right after `print()` | `flush()` first, then DE/RE LOW (Practice 1.4); Modbus libraries already do this |
| a register address "40001" from a datasheet used as it is | "40001" = register **0** in the code (Concept 6) |
| eModbus's `RTUserver` example copied as it is | that example refuses register 0 and uses RX 17, TX 16, 19200 baud: adapt it first (🔬) |

The sections below are collapsed; click a title to open it.

<details>
<summary><b>Quick Win: nothing arrives at all</b></summary>

Node 1's Serial Monitor only prints `... 3 seconds without a message. Check wires A, B, GND, and the power of both modules.` Check these one by one, with the power unplugged every time you change a wire:

1. **Is the small LED on both modules lit?** If the Node 1 module's LED is off, the MB102 isn't on yet, or its VCC wire isn't plugged into the top rail (+). If the second board's module LED is off, check the VCC wire to the **VIN** pin, the module's GND wire to the mini breadboard's bottom rail (−), and the black Module 14 wire from the board's right-row **GND** pin to bottom rail (−) column 28 (that's the wire that must not be removed in Quick Win step 1).
2. **Is the second board really sending?** Its Serial Monitor must print `sent: hello …` every second. If it doesn't, the sketch hasn't been uploaded to the right board.
3. **DI on the TX2 strip, RO on the RX2 strip through the divider?** On Node 1: DI in 10e, RO in 9i, the 4.7 kΩ resistor at 9e–9g, and the 10 kΩ at 9c–5c. On the second board: DI to the **TX2** pin, and the divider's midpoint (column 18) to the **RX2** pin. RX and TX swapped is the most common wrong connection.
4. **Are DE and RE both connected?** If only DE is connected, a resistor on the module pulls RE HIGH, and its receiver is **always off**. On Node 1, DE is in 8e and RE in 8d; on the second board, both are in column 24, which is connected to **D4**.
5. **The divider voltage.** With a multimeter (**V⎓ 20**), measure between the RX2 strip and Node 1's bottom rail (−) while the second board keeps sending. Prepare the measuring points first with the power unplugged (turn off the MB102 first, then unplug both USB cables): plug two spare wires into **9d** (an empty hole in the RX2 strip) and into the bottom rail (−). Plug both USB cables back in, turn on the MB102, then touch the red probe to the wire in 9d and the black probe to the rail wire. The number should be about 3.3–3.4 V. More than 3.6 V (usually about 4 V, because the protection diode inside the RX2 pin holds it there) means the RO wire is plugged in on the wrong side (9a–9e): turn off the MB102 and unplug the USB right away, then move the RO wire to 9i. 0 V means the 4.7 kΩ resistor isn't crossing the center channel. When you're done, turn off the MB102, unplug both USB cables, then remove both spare wires.
6. **A to A, B to B?** Try swapping them once (Quick Win step 7). It doesn't damage anything.

</details>

<details>
<summary><b>Strange lines: <code>received, but not intact text: …</code></b></summary>

Letters arrive, but their content is damaged. The causes, from the most common:

- **A and B are swapped** (the bits are inverted). Swap them at one end.
- **The baud rates differ.** Both sketches must use `Serial2.begin(9600, …)`.
- **The shared GND came loose** while the two boards use different power sources (Practice 6). Check the GND wire at both rails (−).

One strange line **right after the board powers up** is normal: Node 1 starts listening in the middle of a letter.

</details>

<details>
<summary><b>Upload fails: <code>Wrong boot mode detected</code> or <code>Failed to connect to ESP32</code></b></summary>

A message containing `Wrong boot mode detected` means the board didn't enter upload mode. The typical cause this week: **a MAX485 module's DE/RE wire is on pin D2**. The blue MAX485 module pulls DE and RE up to 5 V through a 10 kΩ resistor, while D2 must be LOW (or floating) for the board to be able to enter upload mode (esptool documentation, "Boot Mode Selection").

- Make sure DE/RE is on **D4** (Node 1: 8e and 8d; second board: column 24 → D4), and the status LED on **D2** (7e).
- For an ordinary `Failed to connect` message, use the Module 2 trick: hold **BOOT** as soon as `Connecting…` appears, then let go when `Writing at …` starts running.

</details>

<details>
<summary><b>Practice 1: the ping arrives, the pong does not</b></summary>

The second board prints `heard "ping …" -> replied "pong …"`, but Node 1 prints `no reply within 500 ms`. The message goes out fine, so wires A, B, and GND are already right; the problem is on the way back:

1. **`Serial2.flush();` in `module15_pong` is still commented out** (the Practice 1.4 experiment hasn't been undone).
2. **The second board's DE/RE wire (column 24 to pin D4) is loose or has come off.** Without that wire, a resistor on the module pulls DE and RE HIGH: the second board's transmitter stays on, and its receiver stays off. If that wire is off completely, the symptom is actually different: the second board doesn't hear the ping at all (Practice 1.3), even though the `hello` messages of the Quick Win still showed up, because there DE/RE is HIGH all the time anyway. If the wire is loose, the symptom can come and go. Check the wires at 24f, 24g, and from 24i to pin **D4**.
3. **The second board's DI isn't on TX2.**
4. **Node 1's RO divider** (9e–9g and 9c–5c) isn't connected properly: Node 1 can send, but it can't hear.

</details>

<details>
<summary><b>Practices 3–6: always a timeout (<code>no reply</code>, code <code>0xE2</code>)</b></summary>

A timeout means there's no valid reply at all (Concept 6). Check:

1. **Is the second board running `module15_mock_sensor`?** Its Serial Monitor prints `[n] answered a client request` every time it answers. If that line doesn't appear, the question isn't arriving, or the address is wrong.
2. **Does the address match?** Type `info` in the second board's Serial Monitor; the address may still be 2 from Practice 3.4 or 4.5. Press **EN** on the second board to go back to address 1.
3. **Wires and baud rate:** check them as in the collapsible Quick Win section above. If the Quick Win and Practice 1 worked before and the wires haven't changed since then, the wires aren't the main suspect. **Just connected the 5 m UTP cable (Practice 6.4)?** Then that cable is the first suspect: the same color must go into the same letter at both ends (for example blue in A, white-blue in B), the screw terminals must clamp the wire's copper (not its plastic jacket), and the brown wire must be plugged into bottom rail (−) column 15 of Node 1 **and** bottom rail (−) column 20 of the mini breadboard. Turn off the power before you fix it.
4. **Wokwi:** open the **CHIPS CONSOLE** tab. The message `The ESP32's DE/RE is still HIGH: its receiver is off, this reply will be lost.` means `afterSend()` isn't bringing D4 down. The message `Broken frame or wrong CRC` means the frame that arrived wasn't intact.

</details>

<details>
<summary><b>Now and then <code>reply CRC wrong</code> (<code>0xE3</code>) or <code>reply address wrong</code> (<code>0xE0</code>)</b></summary>

Sometimes one "ghost byte" appears just as the cable changes direction: both modules carry a 120 Ω terminator, but the bias resistors on the modules are too weak to hold the quiet cable in the "1" state (🔬 works it out). Node 1 v1.4.0 already repeats a reading like this once, automatically.

It happens too often if `other errors` in the `rs485` command keeps growing, or if the number in parentheses on the `RS-485:` lines is often about 60–80 ms instead of about 28 ms (the first reading was damaged, then repeated). In that case, fit **two bias resistors** on Node 1's module only, with the power unplugged (turn off the MB102 first, then unplug the USB): 470–560 Ω from leg **A** to 5 V and 470–560 Ω from leg **B** to GND. One pair for the whole bus is enough (the Modbus specification asks for 450–650 Ω).

</details>

<details>
<summary><b>The temperature reads <code>6548.6 C</code>, or the number is ten times too large</b></summary>

- `6548.6` = −5.0 °C read **without a sign**. Make sure there's `(int16_t)` before `getResponseBuffer(1)` (Concept 6).
- Does 585 show up instead of 58.5? The division by 10 was missed. Remember: each sensor's scale is set by its datasheet (×10 or ×100).

</details>

<details>
<summary><b><code>exception 02: the requested register does not exist</code></b></summary>

The register number is wrong, or the count goes past the limit. The mock sensor only has registers 0–3 (function 03) and 0–2 (function 04). For a real sensor, check its datasheet again: "40001" means register 0 (Concept 6), and a hexadecimal address like `0x0012` is used as it is.

</details>

<details>
<summary><b>Node 1 v1.4.0: the RS-485 fields do not appear in the <code>telemetry</code></b></summary>

Type `rs485` in Node 1's Serial Monitor. If the answer is `rs485: not in use …`, type `rs485 on`. The switch is saved in NVS, so a board that was once given `rs485 off` stays off until it's switched on again. If the answer says `in use`, but the `telemetry` in MQTTX still has no RS-485 fields, check step 5.5: the line `writeRS485Fields(doc);` must come **before** `char content[256];`.

</details>

<details>
<summary><b>Contract checker: Node 1's <code>telemetry</code> is marked <code>FAIL  (telemetry Node 2)</code></b></summary>

Below it, the checker prints `field "pressure" is missing`, `field "light" is not in the data contract`, and so on. Your contract checker is still version 1.1: that version treats every message containing `soil_temperature` as Node 2's `telemetry`, then checks it against Node 2's field list. Update it to version 1.2 (Practice 5.10).

</details>

<details>
<summary><b>Dashboard: the RS-485 Sensor group is empty, or it says <code>not in use</code></b></summary>

- **Completely empty:** the **Topic** field of the `telemetry Node 1 (RS-485)` node doesn't hold your Node 1's `device_id` yet, or its **Server** hasn't been chosen (Practice 6.2).
- **`not in use`:** Node 1 isn't writing the RS-485 fields. Type `rs485 on` in Node 1's Serial Monitor.
- **`no reading`:** Node 1 writes the fields, but they hold `null` because the sensor doesn't answer. See the collapsible timeout section above.

</details>

<details>
<summary><b>Wokwi: the chip does not appear, or compiling the chip fails</b></summary>

- The two files must be named exactly **`soil-sensor.chip.json`** and **`soil-sensor.chip.c`**, because `diagram.json` uses the part type `chip-soil-sensor`.
- The content of the `.chip.c` file must be complete, from the first line to `chip_init`. Copy it again with **Copy raw file**.
- A simulation with a chip takes longer to compile. Wait until the **▶** button turns into a stop button.

</details>

<details>
<summary><b>The second board often fails to reply, although Node 1 is fine</b></summary>

The second board's MAX485 module gets its power from the VIN pin, about 4.6–4.8 V (Quick Win step 4). That's usually enough, but if your number is well below that (for example because of a long, thin USB cable), the module may only half work. Try a shorter USB cable, or plug the second board into a good 5 V phone charger.

</details>

<details>
<summary><b>A real RS-485 sensor stays silent</b></summary>

1. **Enough power?** Many sensors need 12–24 V from their own adapter (Concept 7). The adapter's GND must be joined with the bus GND.
2. **Its serial settings?** Try 9600, then 4800 baud; almost all cheap sensors use 8N1.
3. **Its address?** Usually 1. The JXCT and Seeed sensor datasheets name their address register (`0x0100` and `0x0200`).
4. **A and B?** Yellow is usually A and blue B (Seeed: white). If there's no reply at all, swap them once.
5. **Function and register?** JXCT only accepts function 03. Read one register first (Practice 4: `register 18`, because `0x0012` = 18) before you read many.
6. **An example frame in its PDF?** Don't copy it as it is: the CRC in a datasheet example can be wrong (Concept 7).

</details>

---

## 🔬 Technical Deep Dive (optional)

You may skip this section. Every item is collapsed; click a title to open it.

<details>
<summary><b>Modbus TCP: the same question, a different envelope</b></summary>

In factories, PLCs, power meters, and inverters are often connected to an Ethernet network, not to an RS-485 cable. The language is still Modbus, but in its **Modbus TCP** version: the messages are sent over TCP/IP to **port 502**. The content of the question (function code, register number, count) is **exactly the same** as in Modbus RTU. Only the envelope changes:

| | Modbus RTU (RS-485) | Modbus TCP (Ethernet/Wi-Fi) |
| :--- | :--- | :--- |
| Destination address | the server address, 1–247, in the first byte | the device's IP address, plus a 1-byte Unit Identifier |
| Damage check | a 2-byte CRC | no Modbus CRC; TCP and Ethernet take care of it |
| Frame separator | the cable quiet for 3.5 characters | the Length field in the frame header |
| Frame header | — | a 7-byte **MBAP**: Transaction Identifier (2), Protocol Identifier (2, always 0), Length (2), Unit Identifier (1) |
| Maximum size | 256 bytes | 260 bytes |

The question "read me 3 registers starting at register 0" in both versions:

```text
RTU:  01 03 00 00 00 03 05 CB
TCP:  00 01 00 00 00 06 01 03 00 00 00 03
      \___/ \___/ \___/ \/ \_____________/
        |     |     |   |        +-- the same content: function 03, from register 0, 3 of them
        |     |     |   +----------- Unit Identifier 1
        |     |     +--------------- Length: 6 bytes after it
        |     +--------------------- Protocol Identifier: 0 = Modbus
        +--------------------------- Transaction Identifier 1, copied by the server into its reply
```

The reply: `00 01 00 00 00 09 01 03 06 02 49 00 FD 04 B0`, that is, the same register contents as in Practice 3, without a CRC. This frame was worked out and compared with the official example in the *MODBUS Messaging on TCP/IP Implementation Guide* V1.0b.

Modbus TCP also often shows up as a Modbus **gateway**: a small box (or an ESP32) that receives Modbus TCP from the network, then passes it on as Modbus RTU to the RS-485 bus behind it. The Unit Identifier decides which RS-485 server it goes to. For a device that speaks Modbus TCP directly (without a gateway), the specification recommends the Unit Identifier `0xFF`, but many devices accept 0 or 1; check the datasheet.

To try it from the laptop or the Pi, the command-line tool **mbpoll** can speak Modbus TCP: `mbpoll -m tcp -a 1 -t 4 -r 1 -c 3 192.168.1.50` (`-t 4` = holding registers, `-r 1` = register 0, because mbpoll starts counting from 1). In Node-RED, there's the **node-red-contrib-modbus** node. ESP32 libraries that can act as a Modbus TCP server include **eModbus** and **modbus-esp8266**; their example sketches compiled with the esp32 3.3.12 package during the research for this module, but they haven't been tested on a board. In Mini Smart Home, the main path is still MQTT (`telemetry`), not Modbus TCP.

</details>

<details>
<summary><b>Terminators, bias, and "ghost bytes": working out a silent cable</b></summary>

When nobody is talking, both modules are only listening. The voltage difference between A and B at that moment is set by the bias resistors on each module (20 kΩ from A to VCC and 20 kΩ from B to GND, according to the module schematic that's in circulation) and by the two 120 Ω terminators.

- Two modules in parallel: 10 kΩ up, 10 kΩ down, and 120 Ω ∥ 120 Ω = 60 Ω between A and B.
- The A–B difference while the cable is quiet: 5 V × 60 / (10,000 + 60 + 10,000) ≈ **15 mV**.
- A MAX485 receiver is only **guaranteed** to read "1" if the difference is at least **200 mV**. Below that, the only thing holding it is the receiver's small hysteresis.

So, right after one device finishes talking, a receiver can now and then read one false byte, for example `00`. The library reports it as a wrong CRC or a wrong address, and Node 1 v1.4.0 repeats the reading once. The proper cure is **one pair of strong bias resistors for the whole bus**: for example, 560 Ω from A to 5 V and 560 Ω from B to GND on Node 1's module make the quiet difference 5 × 60 / (560 + 60 + 560) ≈ **254 mV**, above 200 mV. The Modbus specification asks for 450–650 Ω, only one pair per bus.

Why isn't the 5 m cable in the lab bothered by reflections? A MAX485 signal edge rises within a dozen or so nanoseconds, and the reflections in a 5 m cable die down in less than 1 µs. One bit at 9600 baud lasts 104 µs, and the UART samples in the middle of the bit, so the reflections are long gone when the bit is read. Terminators only really matter for cables hundreds of meters long or for high speeds. On a long cable, the rules of Concept 3 (a chain, short branches, terminators only at the two ends) become a must.

</details>

<details>
<summary><b>Reading the bus from a laptop: a USB–RS485 converter, QModMaster, and mbpoll</b></summary>

A USB–RS485 converter (about IDR 15,000–30,000) turns a laptop into a Modbus client. Most of them use a CH340 or FT232 USB-serial chip; the driver is the same as for the CH340 ESP32 boards in Module 2. Connect A to A, B to B, and GND if the converter has a GND terminal.

**An important rule: one bus, one client.** Stop Node 1's reading first (`rs485 off`) before the laptop asks, so that two clients never talk at the same time.

- **Windows: QModMaster** (free, open source). Its settings are the same as the mock sensor's: RTU mode, the converter's COM port, 9600 baud 8N1, server address 1, function 03 (read holding registers), from register 0, 3 of them. Its bus traffic window shows the raw frames, just like Practice 3.
- **Linux, macOS, and the Raspberry Pi: mbpoll.** The command for the mock sensor:

  ```bash
  mbpoll -m rtu -a 1 -b 9600 -P none -t 4 -r 1 -c 3 /dev/ttyUSB0
  ```

  `-m rtu` is required (its default is TCP), `-P none` is required (its default is even parity), `-b 9600` is required (its default is 19200), and `-r 1` means register 0, because mbpoll starts counting from 1.

The recommended checking (debugging) order for a new sensor: read it from the laptop first (this proves the power, the baud rate, the address, and A/B), and only then connect it to Node 1.

</details>

<details>
<summary><b>An automatic talk button: the ESP32's hardware RS-485 mode</b></summary>

In this module, the DE/RE pin is controlled by the code (`preTransmission`/`postTransmission`). The ESP32's UART can also control it by itself through the RTS pin:

```cpp
Serial2.begin(9600, SERIAL_8N1, 16, 17);
Serial2.setPins(-1, -1, -1, 4);                // RTS = D4, wired to DE and RE
Serial2.setMode(UART_MODE_RS485_HALF_DUPLEX);  // RTS HIGH while sending, LOW after the last bit
```

In this mode, the ESP-IDF UART driver raises RTS every time it fills the send queue and lowers it after the last bit has gone out, and it also throws away the letters read while sending. ModbusMaster no longer needs to be given `preTransmission` and `postTransmission`. This version of the sketch compiled during the research for this module, but the author hasn't tested it on a board yet, so this module keeps using the manual way, whose idea is easy to see.

</details>

<details>
<summary><b>eModbus: non-blocking server and client libraries</b></summary>

The original Syllabus named **eModbus** for the second board. It's a good library: its client doesn't block (replies come through a callback, like ESP-NOW in Module 14), and it can also speak Modbus TCP. For beginners, though, there are four obstacles (checked in October 2026):

1. **It isn't in the Library Manager.** It has to be downloaded as a ZIP from the GitHub release `v1.7.6.stable`, then installed through **Sketch → Include Library → Add .ZIP Library…**.
2. **It needs the "Async TCP" library**, even when it's only used for RTU; without it, compiling fails with `AsyncTCP.h: No such file or directory`. Install **Async TCP** by **ESP32Async** (version 3.5.0), not another library with a similar name.
3. **Its official example has to be adapted**: the `RTUserver` example refuses register 0 and uses RX 17, TX 16, and 19200 baud.
4. **It can't be used in free Wokwi**, because free Wokwi only knows libraries from the Library Manager.

That's why this module uses **ModbusRTUSlave** for the second board. If one day Node 1 has to read many sensors without ever stalling for 2 seconds, the eModbus client (or **ModbusRTUMaster**, whose time limit can be set) is worth trying.

</details>

<details>
<summary><b>32-bit numbers: two registers and differing word orders</b></summary>

Power meters and flow meters often store big numbers (for example kWh, or a decimal number as a float) in **two consecutive registers**. The Modbus specification only sets the byte order **inside** one register (high byte first). The order of **the two registers** isn't defined, so some manufacturers put the upper half in the first register ("ABCD") and some do the opposite ("CDAB", often called a word swap). A good datasheet says which one. If yours doesn't, read both registers, then try both orders and pick the one whose result makes sense.

</details>

<details>
<summary><b>Seeing frames in Wokwi with the Logic Analyzer</b></summary>

The Wokwi project `code/wokwi-rs485-soil-sensor` includes an eight-channel **Logic Analyzer** that records three lines: DI (TX2), RO (RX2), and DE_RE (D4). Its small light blinks green when there's a signal.

1. Run the simulation with the Practice 4 sketch until the Serial Monitor prints the first `server 1, function 03: …` line (5 seconds by the simulation clock; Wokwi runs slower than real time, so you may wait about 15 seconds), then **stop** it. According to the Wokwi documentation, the browser downloads a file named `wokwi-logic.vcd`.
2. Open that file with **PulseView** (free): click the small arrow next to the **Open** button → **Import Value Change Dump data...**. Fill in **Downsampling factor** with 50 so that it doesn't get heavy.
3. Add a **UART** decoder on the DI and RO lines, 9600 baud. You'll see `01 03 00 00 00 03 05 CB` pass on DI while DE_RE is high, then the reply `01 03 06 …` on RO after DE_RE goes low.

</details>

<details>
<summary><b>Master/slave and client/server</b></summary>

In July 2020, the Modbus organization announced that it was replacing the terms "master-slave" with "client-server" in all its documents. Client = the device that starts the question (formerly master); server = the device that answers (formerly slave). The older version of the serial line specification, many libraries (ModbusMaster, ModbusRTUSlave), and sensor datasheets still use the old terms, so you'll keep running into both. They mean the same thing.

</details>

---

## 🧩 Independent Challenges

Three levels, from changing a little to building your own. The answer keys for Levels 1 and 2 are in collapsible sections; Level 3 deliberately only gets hints. Do at least Level 1. Levels 1 and 2 can be done on the Wokwi path, except the proof in step 3 of Level 1: the chip in the Node 1 project always starts at address 1, and Node 1 v1.4.0 has no command for writing a register, so in Wokwi it's enough to type `rs485 on` (Wokwi's NVS is always empty in a new simulation) and make sure the answer says `server 7` (its readings do time out, as expected).

### Level 1 — Two sensors on one bus (a small change)

A greenhouse owner wants to add a second sensor to the same bus. Both sensors are new, and both have address 1.

1. If Node 1 is on its charger, plug it into the laptop first: turn off the MB102, move its USB plug from the charger to the laptop, then turn the MB102 back on. Upload the `module15_read_registers` sketch (Practice 4) to the Node 1 board again (board option **DOIT ESP32 DEVKIT V1**; Wokwi: the Practice 3–4 project), change your mock sensor's address to **7**, then read registers 0–2 from that new address. Don't press **EN** on the second board until step 3 is done: the new address is lost after a restart.
2. Explain in `notes-module15.md`: what happens if two sensors with the same address are connected to one bus, and the client asks that address?
3. Change `RS485_SENSOR_ADDRESS` in Node 1's `config.h` so that Node 1 v1.4.0 reads the sensor at address 7, then upload Node 1 v1.4.0 again with the Practice 5.7 settings (**ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**). After that, set everything back to address 1 and upload again.

<details>
<summary><b>Level 1 answer key</b></summary>

1. Type `write 3 7` (still asking server 1), then `server 7`. The next reading: `server 7, function 03: moisture 58.5 %, …`. In Wokwi, the **CHIPS CONSOLE** prints `Server address changed to 7 (a new simulation = back to 1).`
2. Both answer **at the same time**. Both transmitters turn on at the same moment, their signals collide, and the client receives a damaged frame (a wrong CRC) or nothing at all. That's why every new sensor's address is changed **before** it's connected to the bus, one at a time, while it's alone on the cable.
3. Write `const uint8_t RS485_SENSOR_ADDRESS = 7;`, upload, then check with the `rs485` command: `rs485: in use, server 7, …`. Set the mock sensor's address back by pressing **EN** on the second board (after a restart, its address goes back to 1; `write 3 1` only works while the Practice 4 sketch is still on Node 1), then write `RS485_SENSOR_ADDRESS = 1` again and upload Node 1 v1.4.0.

</details>

### Level 2 — A 24-hour chart of RS-485 soil moisture (fill in the blanks)

Add a 24-hour chart to the **RS-485 Sensor** group, with a time axis from `ts` like the Garden chart in Module 14. Fill in the blanks (`____`) of this design:

```text
[telemetry Node 1 (RS-485)] → [switch "RS-485 moisture present?"]
                                  → [change "reading time (ms)": Set msg.payload.time to ____ ]
                                      → [chart "RS-485 soil moisture (24 hours)": X: key: ____ , Y: key: ____ ]
```

<details>
<summary><b>Level 2 answer key</b></summary>

- The change node: **Set** `msg.payload.time` **to the value** of type **J: expression**, holding `$toMillis(payload.ts)`.
- The chart node: **Group** `RS-485 Sensor`, **Type** `Line`; in the **Properties** section, **Series:** of type **a**z (text) holding `Soil moisture`, **X:** of type **key:** holding `time`, and **Y:** of type **key:** holding `soil_rs485`; **X-Axis Limit** `last` `24` `Hours`.
- Why does the switch come first? So that `null` points (the sensor didn't answer) don't go into the chart as the number 0.

</details>

### Level 3 — A real RS-485 soil sensor (from scratch)

Do you have a real RS-485 soil sensor, for example one from the JXCT series? Replace the mock sensor with it.

Hints:

1. **Read its datasheet first** (Concept 7): the power supply (often 12–24 V), the colors of the A and B wires, the baud rate, the address, the function code, and the register map with its scales.
2. **Its power:** a separate 12 V adapter for the sensor. The sensor's power wires go **only** to the adapter; the adapter's GND is joined with the bus GND (Node 1's bottom rail (−)); the sensor's A and B go to the A and B terminals of Node 1's MAX485 module. The second board isn't used, and the 120 Ω terminator on Node 1's module stays in place (the other end of the bus is the sensor).
3. **Test it first with `module15_read_registers`:** read one register (`register 18` for `0x0012`), and only then many registers.
4. **Change `rs485.cpp`:** change `FIRST_REGISTER` and `REGISTER_COUNT` at the top of the file to match the datasheet (JXCT: moisture `0x0012`, temperature `0x0013`, EC `0x0015`, so `FIRST_REGISTER = 0x0012` and `REGISTER_COUNT = 4`). In `updateRS485()`, adapt the `getResponseBuffer()` indexes and their scales.
5. The `telemetry` field names do **not** change: `soil_rs485`, `soil_temperature`, and `ec` keep the same meaning, whatever sensor they come from (data contract 1.2).

---

## ➕ Add-on to "Mini Smart Home"

This week, Node 1 learns the language of industry: **Node 1 v1.4.0** can read an RS-485 soil sensor over Modbus RTU and put its readings into `telemetry`. The dashboard gets an **RS-485 Sensor** group. Three project documents go up a version too: data contract 1.2, pin map 6, and contract checker 1.2. The Node 2 board goes back to the garden.

![Diagram of Mini Smart Home after Module 15; a dashed line means it comes later. Node 2 "Garden" v1.0.0 with its 18650 battery, back in the garden after being borrowed by the lab, sends ESP-NOW to Node 1 "Home" v1.4.0: five sensors, actuators, and the Node 2 bridge as before, the status LED on D2, and the new RS-485 sensor part: a MAX485 on RX2/TX2 with DE/RE on D4, Modbus RTU every 10 seconds, the NVS switch rs485 on / off, and telemetry plus soil_rs485, soil_temperature, and ec. A dashed RS-485 soil sensor box connects to Node 1 through a dashed line labeled A/B (later): in the lab, the mock second board; later, a real sensor for a smart farming capstone. Node 1 sends MQTT to the Raspberry Pi gateway at 192.168.1.37, holding Mosquitto and Node-RED (the dashboard, the Garden card, the new RS-485 Sensor group, and the fan automation), then on to the phone. Bottom, GitHub mini-smart-home: firmware/node-1-home v1.4.0, firmware/node-2-garden v1.0.0, DATA-CONTRACT.md 1.2, PIN-MAP.md 6, tools/contract-checker.js 1.2, and edge/node-red-flows.json plus RS-485 Sensor. A Phase 2 checkpoint box: Wi-Fi, MQTT, the Pi gateway, Node-RED, ESP-NOW, and RS-485 are now all in one project. Dashed boxes for Module 16, backend, and Module 17, database, come later.](assets/project-diagram-module-15.png)

> 🖥️ **Tools used:** **Arduino IDE** with `node-2-garden.ino` (Module 14) and `node-1-home.ino`, the Node 1 board and the second board, a small screwdriver, a phone charger if Node 2's battery needs charging (Module 9), the Node-RED editor, **VS Code** with the `mini-smart-home` folder, and **GitHub Desktop**.
>
> **Wokwi path:** do B, C, and D. Step A is only for real boards. Make sure the Practice 5 changes are also saved in your repository's `firmware` folder, with `USE_WOKWI` left at `false` in the repository. Don't copy the Wokwi-only files (`diagram.json`, `libraries.txt`, `soil-sensor.chip.json`, and `soil-sensor.chip.c`) into that folder: Arduino IDE would also compile `soil-sensor.chip.c` and fail with `wokwi-api.h: No such file or directory`.
>
> ⭐ **Required** — step D is a Module 15 completion requirement.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `firmware/node-1-home/` | **v1.4.0**: the new `rs485.h` and `rs485.cpp`, small changes in six files (Practice 5) |
| `tools/contract-checker.js` | version 1.2 (Practice 5.10) |
| `DATA-CONTRACT.md` | version 1.2 (step B) |
| `PIN-MAP.md` | version 6 (step B) |
| `edge/node-red-flows.json` | section 6, RS-485 Sensor, added (step C) |

### A. Turn the second board back into Node 2

1. **On Node 1**, turn off the RS-485 sensor reading, because the sensor is leaving: type `rs485 off` in Node 1's Serial Monitor (if Node 1 is on its charger, plug it into the laptop for a while: turn off the MB102 first, then turn it back on once the laptop's USB is plugged in). The RS-485 fields disappear from `telemetry`, and the **RS-485 Sensor** group says `not in use`. The MAX485 module and its divider **stay connected** on Node 1 (`PIN-MAP.md` version 6), ready for a real sensor later. Remove the UTP cable with no power at either end: turn off the MB102, unplug Node 1's USB, then also unplug the second board's USB. Loosen the **A** and **B** screw terminals of Node 1's module, pull out the blue and white-blue wires, then pull the brown wire out of bottom rail (−) column 15 (the cable's end at the second board is only removed in step 2). After that, plug Node 1's USB into its own charger, and only then turn on the MB102 (the golden power rules).
2. **On the second board** (its USB was already unplugged in step 1), remove the MAX485 module, both resistors, and their wires from the mini breadboard and from the board's pins (RX2, TX2, D4, VIN), including the UTP wires and the lab's GND wires in bottom rail (−) columns 20, 22, and 23. Don't remove the Module 14 wires on the bottom rail (the sensor wires and the board's 3V3 and GND wires in columns 28–29). Keep the module and the UTP cable.
3. Plug the second board's USB back into the laptop (the VIN and GND wires to the battery circuit aren't connected yet). Open `node-2-garden.ino` from the `mini-smart-home` repository (the `firmware/node-2-garden` folder), select **DOIT ESP32 DEVKIT V1** and the second board's port, then click **Upload**. This board is now **Node 2 v1.0.0** again.
4. Unplug its USB. If its battery hasn't been charged for a long time, charge it fully first through the TP4056's USB port, staying with it while it charges, as in Module 14 ➕ A step 2. Then reconnect the two wires you kept in Quick Win step 1, as in Module 14 ➕ B: from the board's **VIN** pin to top rail (+) column 29, and from the board's **GND** pin (left row, above VIN) to top rail (−) column 28 of the mini breadboard. After that, put Node 2 back in its spot in the garden.
5. Within a few minutes, the **Garden** card on the phone is `online` again, with new readings.

### B. Data contract 1.2 and pin map 6

1. In VS Code with the `mini-smart-home` folder, open `DATA-CONTRACT.md`, then first copy the contents of the **My devices** table (at the very bottom) into `notes-module15.md`: the replacement below empties that table too. Open [`mini-smart-home/DATA-CONTRACT.md`](../../mini-smart-home/DATA-CONTRACT.md) in a new tab, click **Copy raw file**, then replace the whole content of your file with it (**Ctrl + A**, then **Ctrl + V**). Fill in the **My devices** table again from your notes, then save (**Ctrl + S**). Version 1.2 adds the section **RS-485 sensor fields in Node 1 `telemetry`** and the 1.2 history row.
2. Do the same for `PIN-MAP.md` with [`mini-smart-home/PIN-MAP.md`](../../mini-smart-home/PIN-MAP.md). Version 6 records the status LED on **D2**, the RS-485 DE/RE on **D4**, RX2/TX2 now connected, the new section **RS-485 on the Node 1 workbench**, and the version 6 history row.

### C. Export the Node-RED flows again

1. **In the Node-RED editor**, make sure the comment node `6 · RS-485 Sensor: three Modbus fields in Node 1 telemetry (Module 15)` sits above the section 6 nodes, and that the debug node `watch RS-485 fields` is faded (off). Click **Deploy** if you changed anything.
2. Export as in ➕ D of Module 13: main menu → **Export** → **all flows** → **formatted** → **Download**.
3. In the **Downloads** folder, rename `flows.json` to `node-red-flows.json`, then move it to **Documents → GitHub → mini-smart-home → edge** and choose **Replace the file in the destination** (macOS: **Replace**).
4. In VS Code, open `edge/node-red-flows.json`, press **Ctrl + F**, then search for `RS-485 Sensor`: it must be found. Also search for `password`: it must not be found.

### D. ⭐ Save to GitHub

1. In GitHub Desktop, choose the **`mini-smart-home`** repository. The **Changes** list holds `firmware/node-1-home` (two new files and six changed files), `tools/contract-checker.js`, `DATA-CONTRACT.md`, `PIN-MAP.md`, and `edge/node-red-flows.json`. Fill in **Summary** with `Module 15: Node 1 v1.4.0 reads the RS-485 sensor (Modbus RTU), contract 1.2, pin map 6`, click **Commit … to main**, then **Push origin**.
2. In the **`learn-iot`** repository, the `module-15` folder holds your practice sketches (`module15_hello_send`, `module15_hello_listen`, `module15_ping`, `module15_pong`, `module15_mock_sensor`, `module15_raw_frame`, and `module15_read_registers`) and `notes-module15.md`. Commit and push those too.

**Evidence for passing Module 15** (compare it with ✅ below): Modbus values from the second board show up in the RS-485 Sensor group over a 5 m cable (Practice 6), your answers for the five scenarios with their reasons are in `notes-module15.md` (Practice 7), and everything is saved in the repository (step D).

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **RS-485** | An electrical standard for sending data over a pair of twisted wires (A and B) with a differential signal, up to about 1,200 m. It only sets the electrical side, not the content of the messages. |
| **Differential signal** | A way of sending bits as two opposite voltages on two wires; the receiver only reads their difference, so noise that hits both wires equally has no effect. |
| **Half duplex** | One line used in both directions, taking turns, like a walkie-talkie. |
| **MAX485** | A chip that translates between a UART (TX/RX) and RS-485 (A/B). Its blue module carries a 120 Ω terminator and needs 5 V. |
| **DE/RE** | Driver Enable and Receiver Enable: the "talk button" pins of the MAX485 module. Joined together: HIGH = talk, LOW = listen. |
| **Terminator** | A 120 Ω resistor at each end of an RS-485 cable that damps signal reflections. |
| **Bias** | A pair of resistors that holds an RS-485 cable in the "1" state while nobody is talking. |
| **Bus** | One line shared by many devices; for RS-485, it's shaped like a chain (daisy chain). |
| **Modbus RTU** | An industrial question-and-answer protocol, sent as binary bytes over a serial cable such as RS-485. |
| **Modbus TCP** | The version of Modbus for TCP/IP networks (Ethernet or Wi-Fi), on port 502, with an MBAP header and no CRC. |
| **Client/server** | The client asks, the server answers. The old terms are master (client) and slave (server). |
| **Server address** | A number from 1 to 247, unique for every server on one bus; 0 = broadcast. |
| **Register** | A numbered place, like a locker, for one 16-bit number inside a Modbus server. Holding registers may be read and written; input registers are read-only. |
| **Function code** | The second byte of a frame, which names the kind of question: 03 reads holding registers, 04 reads input registers, 06 writes one holding register. |
| **Frame** | One complete Modbus message: address, function code, data, and CRC. |
| **CRC** | Two "seal" bytes calculated from the content of the frame; the receiver calculates them again to make sure no bit changed on the way. |
| **Exception** | An official refusal from the server, with a reason code (01–04). |
| **Timeout** | The client stops waiting because there's no valid reply; in ModbusMaster, after 2 seconds (code `0xE2`). |
| **Scale** | The multiplier used to store a fraction in a register, for example ×10: 58.5% is stored as 585. |
| **Two's complement** | The way negative numbers are stored in binary; −50 is stored as `FF CE` and read with `(int16_t)`. |
| **EC** (electrical conductivity) | A measure of how easily the soil conducts electricity, in µS/cm; the more salt and fertilizer are dissolved in it, the larger the number. In this module's mock sensor, it's in register 2. |
| **LoRa / LoRaWAN** | LoRa: a long-range, low-power radio. LoRaWAN: a network on top of LoRa (node → gateway → network server). In Indonesia: 920–923 MHz, the AS923-2 plan. |
| **Duty cycle** | The share of time a device may spend transmitting; for LoRa in Indonesia, 1% at most. |
| **Mesh network** | A network in which every device also passes on other devices' messages, so its reach grows with every new device. |
| **Zigbee** | A very low-power mesh network protocol for smart homes; it needs a hub (coordinator). |
| **Thread / Matter** | Thread: a low-power IPv6 mesh network that needs a border router. Matter: a shared language for smart home devices across brands, running over Wi-Fi or Thread. |
| **NB-IoT / LTE-M** | Cellular networks made for power-saving IoT devices; they need a SIM card and a plan from an operator. |
| **BLE** (Bluetooth Low Energy) | Power-saving Bluetooth for talking to a phone at close range, for example during a device's initial setup. |

## 📝 5-Question Quiz

1. Why are ten soil sensors in a 200 m greenhouse connected with RS-485, and not with an ordinary UART cable (TX, RX, and GND) made longer? Explain it using the word "difference".
2. Node 1 prints `FAILED, code 0xE2 = no reply (timeout)` every time it asks. Name three possible causes, and explain why a mistake like that never shows up as an exception.
3. A mock sensor replies `01 03 06 02 49 FF CE 04 B0 …` (`…` stands for the two CRC bytes). What are its soil moisture, soil temperature, and EC according to the Practice 2 datasheet? Show your calculation for the temperature.
4. Sensor A's datasheet says "40001 = soil moisture (×10)", while sensor B's datasheet says "address `0x0012` = soil moisture (×10)". Which register number goes into `readHoldingRegisters()` for each of them?
5. A friend writes RS-485 sending code like this: `digitalWrite(DE_RE, HIGH); Serial2.print(text); digitalWrite(DE_RE, LOW);`, and connects DE/RE to D2. Name two problems your friend will run into, and how to fix them.

<details>
<summary><b>Answer key</b></summary>

1. An ordinary UART cable carries a signal measured against GND. On a 200 m cable near pumps and fans, noise gets onto the signal wire, and even the GNDs at the two ends can differ, so 0s and 1s get mixed up. RS-485 sends every bit as two opposite voltages on a pair of twisted wires, and its receiver only reads the **difference** between them. Noise hits both wires equally, so the difference stays the same. The receiver can still reliably read a difference as small as 0.2 V, so the cable can be hundreds of meters long (Concept 1).
2. For example: a wrong server address (or one that has been changed), A and B swapped, a different baud rate or serial format, DE/RE not connected, a dead server, or a broken cable. All of them keep the server from receiving an intact frame addressed to it, or keep its reply from arriving. An exception can only be sent by a server that **received and understood** the question and then refuses it; a damaged frame, or one with the wrong address, is thrown away silently instead (Concepts 5–6).
3. Moisture: `02 49` = 585 → **58.5%**. Temperature: `FF CE` = 65,486 if read without a sign; as a signed 16-bit number, 65,486 − 65,536 = −50, then divided by 10 → **−5.0 °C**. EC: `04 B0` = 4 × 256 + 176 = **1,200 µS/cm**.
4. Sensor A: "40001" is the Modicon style for the first holding register, so its register is **0**. Sensor B: a hexadecimal address is usually already the number used inside the frame, so its register is **`0x0012`** (18). If the result makes no sense, try N and N−1 (Concept 6).
5. First, without `Serial2.flush()`, DE/RE goes down before the letters have finished going out, so the message gets cut off or lost (Practice 1.4); the fix is `flush()` before `digitalWrite(DE_RE, LOW)`. Second, the MAX485 module pulls DE/RE up to 5 V, while D2 must be LOW or floating for the board to enter upload mode, so uploads can fail with `Wrong boot mode detected`; the fix is to use a pin that isn't a strapping pin, for example D4. (Bonus: `Serial2.begin()` must also name pins 16 and 17.)

</details>

---

## ✅ Module 15 Completion Checklist

The completion requirement from the Syllabus: **Node 1 can read Modbus registers from the second ESP32 and the values show up on the dashboard, and you can choose the right protocol for five scenario questions.** Wokwi path: the library, Practice 3, Practice 4, ⭐ Practice 5, ⭐ Practice 7, and ⭐ ➕ D items can be ticked without a board (Practices 3–5 with the mock chip), and you may first prove the RS-485 Sensor group with the mock chip in the Node-RED on your laptop (Practice 6). The Quick Win, Practice 1, Practice 2, ➕ A, and the 5 m cable test of Practice 6.4 can only be ticked once you have your second board and your MAX485 modules.

- [ ] The ModbusMaster 2.0.1 and ModbusRTUSlave 3.1.2 libraries are installed (🧰).
- [ ] Both MAX485 modules are connected with a voltage divider on RO and DE/RE on D4, Node 1's status LED has moved to D2, and the second board sends `hello` to Node 1 over two wires (Quick Win).
- [ ] Ping-pong works, and I can explain why `flush()` must be called before the talk button is released (Practice 1).
- [ ] The second board has become a mock RS-485 soil sensor, and I can read its datasheet (Practice 2).
- [ ] I sent Modbus frames by hand, read the replies byte by byte, and can tell an exception from a timeout (Practice 3).
- [ ] ModbusMaster reads three registers complete with scale and sign, and I changed the sensor's address with function 06 (Practice 4).
- [ ] ⭐ Node 1 v1.4.0 writes `soil_rs485`, `soil_temperature`, and `ec` to `telemetry` after `rs485 on`, and contract checker 1.2 prints `PASS` (Practice 5).
- [ ] ⭐ The RS-485 Sensor group on the dashboard shows Modbus values from the second board over a UTP cable at least 5 m long, with the two boards on different power sources (Practice 6).
- [ ] ⭐ I chose the right protocol for the five scenarios of Practice 7, each with at least two reasons that make sense.
- [ ] The second board is back in the garden as Node 2 v1.0.0, and Node 1 has been given `rs485 off` (➕ A).
- [ ] ⭐ Node 1 v1.4.0, `DATA-CONTRACT.md` 1.2, `PIN-MAP.md` 6, contract checker 1.2, and the Node-RED flows are committed and pushed to `mini-smart-home` (➕ D).

🎉 **Phase 2 checkpoint complete.** In six weeks, Node 1 learned Wi-Fi and HTTP, spoke MQTT following the data contract, got a Raspberry Pi gateway and a Node-RED dashboard, became Node 2's bridge over ESP-NOW, and now reads an industrial sensor over RS-485. Look at the [Phase 2 page](../README.md) again and tick all its modules in the [Progress tracker](../../PROGRESS.md).

> ➡️ **Next module:** Module 16 — Your First Backend with Light TypeScript. Phase 3 begins: you build a Node.js server that listens to every Mini Smart Home MQTT message, checks it against the data contract, and provides a documented API, complete with a Git workflow for teams.

---

## 📚 Sources & Image Credits

**Documentation, specifications, source code, and datasheets used** (accessed October 2026):

- The Modbus specifications from [modbus.org](https://www.modbus.org/modbus-specifications): *MODBUS Application Protocol Specification* V1.1b3 (the data model, function codes, exceptions, byte order), *MODBUS over Serial Line Specification and Implementation Guide* V1.02 (addresses, the RTU frame, the 3.5-character gap, CRC, speeds, terminators, bias, cable length, shared GND), and *MODBUS Messaging on TCP/IP Implementation Guide* V1.0b (MBAP, port 502, Unit Identifier); *Modicon Modbus Protocol Reference Guide* PI-MBUS-300 Rev. J ([archived copy](https://web.archive.org/web/20191201000251id_/http://www.modbus.org/docs/PI_MBUS_300.pdf); the 40001 numbering); the [modbus.org press release of July 2020](https://www.modbus.org/news/modbus-organization-replaces-master-slave-with-client-server) (the client/server terms).
- Texas Instruments: [*The RS-485 Design Guide*](https://www.ti.com/lit/pdf/slla272) (SLLA272D) and [*RS-422 and RS-485 Standards Overview*](https://www.ti.com/lit/pdf/slla070) (SLLA070D): differential signals, loads, distance, terminators, bias. The [MAX481/MAX483/MAX485](https://www.analog.com/media/en/technical-documentation/data-sheets/MAX1487-MAX491.pdf) datasheet (Maxim/Analog Devices, 19-0122 Rev 10): the 4.75–5.25 V supply, the 200 mV threshold, the input VIH, fail-safe. The schematic of the blue MAX485 module from the [ProtoSupplies](https://protosupplies.com/product/max485-ttl-to-rs-485-interface-module/) store (a store document, checked against the resistor codes in a photo of the module).
- Espressif: the [ESP32 Series Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) v5.3 (the GPIO 2 strapping pin, the input voltage limits), [esptool: Boot Mode Selection](https://docs.espressif.com/projects/esptool/en/latest/esp32/advanced-topics/boot-mode-selection.html), the source code of [arduino-esp32 3.3.12](https://github.com/espressif/arduino-esp32/tree/3.3.12) (`HardwareSerial`: Serial2's default pins, `flush()`, `setMode()`) with its 2.x to 3.0 migration guide, and the UART documentation of [ESP-IDF v5.5.5](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/peripherals/uart.html) (the RS-485 half-duplex mode).
- Libraries: [ModbusMaster](https://github.com/4-20ma/ModbusMaster) 2.0.1 (the 2-second time limit, the result codes), [ModbusRTUSlave](https://github.com/CMB27/ModbusRTUSlave) 3.1.2 (with [ModbusRTUComm](https://github.com/CMB27/ModbusRTUComm), [ModbusSlaveLogic](https://github.com/CMB27/ModbusSlaveLogic), and [ModbusADU](https://github.com/CMB27/ModbusADU)), [ModbusRTUMaster](https://github.com/CMB27/ModbusRTUMaster), [eModbus](https://emodbus.github.io) 1.7.6, and [Async TCP](https://github.com/ESP32Async/AsyncTCP) (ESP32Async).
- Sensor datasheets: *JXBS-3001 Soil Sensor User Manual* (JXCT, version 2.0, 2020; [a copy on a forum](https://embdev.net/attachment/640888/7_in_Soil_Sensor_Datasheet.pdf)) and the [*Soil Moisture & Temperature & EC Sensor User Manual* S-Temp&VWC&EC-02](https://files.seeedstudio.com/wiki/Soil_Moisture_Temperature_EC_Sensor/SoilMoisture_Temperature_ECSensorUserManual-S-Temp&VWC&EC-02.pdf) with its [wiki](https://wiki.seeedstudio.com/Sensor/SenseCAP/SenseCAP_Probe/Soil-Moisture-Temperature-EC-Sensor/) (Seeed).
- Tools: [QModMaster](https://sourceforge.net/projects/qmodmaster/), [mbpoll](https://github.com/epsilonrt/mbpoll), [PulseView](https://sigrok.org/wiki/Downloads), [node-red-contrib-modbus](https://www.npmjs.com/package/node-red-contrib-modbus).
- Wokwi: the [FAQ](https://docs.wokwi.com/faq) (several microcontrollers in one project aren't supported yet), the [Chips API](https://docs.wokwi.com/chips-api/getting-started) ([UART](https://docs.wokwi.com/chips-api/uart), [attributes](https://docs.wokwi.com/chips-api/attributes)), the [Logic Analyzer Guide](https://docs.wokwi.com/guides/logic-analyzer), and the [library guide](https://docs.wokwi.com/guides/libraries).
- Choosing a protocol: [Minister of Communication and Informatics Regulation No. 2 of 2023](https://peraturan.go.id/files/permenkominfo-no-2-tahun-2023.pdf) (its status at [JDIH Komdigi](https://jdih.komdigi.go.id/produk_hukum/view/id/862/t/peraturan+menteri+komunikasi+dan+informatika+nomor+2+tahun+2023): in force), [LoRaWAN Regional Parameters RP002-1.0.5](https://resources.lora-alliance.org/document/rp002-1-0-5-lorawan-regional-parameters) and [About LoRaWAN](https://lora-alliance.org/about-lorawan/) (LoRa Alliance), [The Things Network's frequency plans](https://github.com/TheThingsNetwork/lorawan-frequency-plans) and [its duty cycle policy](https://www.thethingsnetwork.org/docs/lorawan/duty-cycle/), [Antares](https://antares.id/product/connectivity) (Telkom), the [Mobile IoT Network Launches](https://www.gsma.com/solutions-and-impact/technologies/internet-of-things/mobile-iot-commercial-launches/) list (GSMA), [Telkomsel NB-IoT](https://www.telkomsel.com/enterprise/product-list-iot/nb-iot), the datasheets of the Semtech SX1276/77/78/79, the TI CC2652R, the Nordic nRF52840 (product brief), and the Energizer CR2032, the [arduino-esp32 3.3.12](https://github.com/espressif/arduino-esp32/blob/3.3.12/docs/en/libraries.rst) documentation (Zigbee, Thread, and Matter support), [CSA: Matter](https://csa-iot.org/all-solutions/matter/) and [Zigbee](https://csa-iot.org/all-solutions/zigbee/), the [Thread Group](https://www.threadgroup.org/What-is-Thread/Overview), [Bluetooth SIG: range](https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/), [3GPP: NB-IoT](https://www.3gpp.org/news-events/3gpp-news/nb-iot-complete), and [ESP-Techpedia: comparing mesh solutions](https://docs.espressif.com/projects/esp-techpedia/en/latest/esp-friends/solution-introduction/mesh/mesh-comparison.html). Device prices are October 2026 market estimates from online stores and the Syllabus shopping list, not official prices.

**Images.** The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full list, file by file, is in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-15`, `from-rs485-sensor-to-phone`, `differential-signal`, `max485-and-de-re`, `rs485-bus` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The behavior of RS-485 and the MAX485 from the TI guides and the MAX485 datasheet; the module's pin layout from the ProtoSupplies store schematic. | CC BY 4.0 |
| `modbus-frame`, `transaction-timing`, `modbus-register-cabinet`, `protocol-decision-tree`, `project-diagram-module-15` (`.png` + `.svg`) | Original diagrams. The frames and timings from the Modbus specifications and the Wokwi test recordings of Practices 3–4; the decision tree summarized from the "Choosing a protocol" sources above. | CC BY 4.0 |
| `rs485-circuit-node1`, `rs485-circuit-second-board` (`.png` + `.svg`) | Original illustrations, with the holes and pins exactly as in the Quick Win tables; the workbench continues the illustrations of Modules 5–7, and the mini breadboard continues those of Modules 9 and 14. | CC BY 4.0 |
| `phone-rs485-sensor.png` | Real screenshots of FlowFuse Dashboard 1.33.0 at the width of a phone screen (412 pixels) from the author's laptop, with mock Node 1 data; title, phone frame, numbers, and captions by the author. | FlowFuse Dashboard is licensed Apache 2.0; image: CC BY 4.0 |
| `wokwi-rs485-soil-sensor.png` | Screenshots of the [Wokwi](https://wokwi.com) simulator (October 2026) running the `code/wokwi-rs485-soil-sensor` project, cropped and rearranged; the "RS-485 Soil Sensor (mock)" chip is made by the curriculum. Title, numbers, and captions by the author. | © Wokwi (CodeMagic LTD); used for educational purposes. Title, numbers, and captions: CC BY 4.0 |

**About the Expected output boxes.** Every sketch and firmware in this module has been compiled with the esp32 package 3.3.12 for the board used in its practice (Node 1 v1.4.0: 1,187,604 bytes). The client sketches (Practices 3–4) and Node 1 v1.4.0 were run in Wokwi with the mock chip; the mock sensor sketch (Practice 2) was run in Wokwi with two UARTs on one ESP32, crossed over to a ModbusMaster client. The output of two real boards connected by an RS-485 cable (the Quick Win, Practice 1, the millisecond numbers of real boards, and the 5 m cable test) hasn't been recorded by the author on real boards yet, so it's marked **example**. The dashboard screenshots were taken from Node-RED on the author's laptop with a mock Node 1.

---

[⬅️ Module 14](../module-14-node-2-esp-now/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 16 — Your First Backend with Light TypeScript](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md) ➡️**
