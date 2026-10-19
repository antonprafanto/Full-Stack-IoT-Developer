# Module 14 — Node 2 "Garden": Battery-Powered Sensors via ESP-NOW

🌐 **English** · [Bahasa Indonesia](../../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md)

*Phase 2 · Week 14 · Hardware: **Kit A Stage 2** — a second ESP32 board (Node 2) with the battery circuit from Module 9, a BME280, a DS18B20, a second capacitive soil sensor, and an INA219; plus Node 1, the Pi gateway, and the phone from Modules 12–13 · Prerequisites: **Module 13** (the Node-RED dashboard) and **Module 9** (power supply and low power) · Time: 8–10 hours, spread over the week, plus 1–3 hours of charging the battery while someone watches it*

[⬅️ Module 13](../module-13-node-red-dashboard/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 15 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-15--modbus-rturs-485-lab--choosing-the-right-protocol)

---

Inside the house, Mini Smart Home is now complete: Node 1 reads five sensors and switches the relays, the Pi gateway runs the broker and Node-RED, and your phone shows it all. What about the **garden**? A garden is usually far from a wall socket, and the Wi-Fi signal out there is often weak. In Module 9 you already prepared the Node 2 skeleton: a second ESP32 board that runs on an 18650 battery, wakes up briefly, reads the DS18B20, then goes back to sleep. Unfortunately, its readings only show up in the Serial Monitor. This week, Node 2 **talks**.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Node 2's readings can only be seen in the laptop's Serial Monitor. | Node 2 doesn't send anything yet. | **ESP-NOW**: Node 2 sends one small packet straight to Node 1, without a router (Concepts 1–2, Quick Win) |
| If Node 2 connected to the Wi-Fi like Node 1, it would spend several seconds with its radio on every time it woke up, and the Wi-Fi password would have to be stored on a board lying out in the garden. | Ordinary Wi-Fi is made for devices that are always on. | ESP-NOW doesn't need to connect to the router and **doesn't need the Wi-Fi password** (Concepts 2, 10) |
| ESP-NOW and the home Wi-Fi compete for the one radio in Node 1; when the router is off, Node 1 can "wander off" its channel (radio channel). | An ESP32's radio can only be on one channel at a time. | Node 2 **finds the router's channel** by scanning for the Wi-Fi name, and Node 1 **no longer scans nonstop** (Concept 3, Practices 1 and 3) |
| Node 2 only has a DS18B20 so far. | The BME280 and the second soil sensor aren't connected yet. | **The full set of garden sensors** with a power-saving wake sequence, packed into a **33-byte packet** (Concepts 4–5, Practice 2) |
| The broker and the dashboard don't know Node 2. | Node 2 never connects to the broker. | **Node 1 becomes a bridge**: it publishes Node 2's data according to data contract 1.1, and holds it back while the router is off (Concepts 6–8, Practices 3–6) |
| Node 2's battery life has never been worked out with its real load. | The sensors and the radio are only added this week. | **Measure the current with the INA219** and work out the battery life (Concept 9, Practice 7) |
| Anyone with an ESP32 can send fake packets to Node 1. | The ESP-NOW packets have no key. | **ESP-NOW encryption** with keys that never go to GitHub (Concept 10, Practice 8) |

By the end of the week, **Node 2 v1.0.0** wakes up every 5 minutes, reads the air temperature and humidity, the air pressure, the soil temperature, and the soil moisture, sends **one ESP-NOW packet** to Node 1, then goes back to sleep. **Node 1 v1.3.0** receives that packet and publishes it to the broker on behalf of Node 2, with Node 2's own `device_id`. Node-RED shows it on the **Garden** card on your phone. When the router is switched off, Node 2's packets still reach Node 1 and show up on the dashboard as soon as the router is back on, at the time they happened. One 18650 battery lasts about **one to one and a half weeks**.

![Module 14 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 2 Connectivity, Modules 10 to 15, is highlighted. Modules 1 to 13 are marked done, and Module 14 is marked YOU ARE HERE with the note: Node 2 in the garden, on a battery, talks directly to Node 1. Bottom: the box for this week's Module 14, 8 to 10 hours spread out, Kit A Stage 2: a second ESP32 board with a battery, BME280, DS18B20, second soil sensor, INA219; ⭐ means required to pass. Left: QW, the Quick Win, two ESP32s talk without a router; P1, the router's channel and scanning for the Wi-Fi name; P2, Node 2's sensors and the 33-byte packet; P3, Node 1 v1.3.0, the ESP-NOW to MQTT bridge ⭐; P4, Node 2 v1.0.0, wake, send, sleep ⭐. Right: P5, the Garden card in Node-RED ⭐; P6, the router-off test ⭐; P7, measuring the current and the battery life; P8, ESP-NOW encryption; plus, Add-on: Node 2 installed for good and a 72-hour test ⭐. Note at the bottom: Wokwi can't yet run ESP-NOW between boards or deep sleep, and it has no BME280 yet; the Wokwi path tests part of Node 2's sensors and the Node 1 bridge with a mock Node 2; the router, current, and battery tests need real boards.](assets/roadmap-module-14.png)

> [!NOTE]
> **How to use this module.**
>
> - **Two boards, two ports.** From this week on, you'll often have two ESP32s plugged into the laptop at the same time. Stick a piece of paper tape labeled **Node 1** or **Node 2** on each board and on its cable. Open each sketch in **its own Arduino IDE window**: every window has its own board, port, and Serial Monitor. Not sure which port belongs to which board? Unplug one board, then see which port disappears from the list.
> - **Every command box says where it's used:** **Node 1's Serial Monitor** or **Node 2's Serial Monitor** (the command is typed into the send box), the **Node-RED editor** (the browser), **On the Pi** (the SSH terminal), or **On the laptop**. The address `192.168.1.37`, the Wi-Fi name `OurHome`, Node 1's `device_id` `a4cf12e5b7c0`, and Node 2's `device_id` `246f28b1c7d4` are only examples; use your own.
> - **The Expected output boxes are examples.** All of this module's sketches and firmware have been compiled with the esp32 package 3.3.12, and the parts that can be simulated have been run in Wokwi. But the numbers from two real boards (MAC addresses, channels, signal strength, how long they stay awake, current) **will certainly be different** on your screen. The Node-RED screenshots are real screenshots with data from a mock Node 2.
> - **No second board yet?** Follow the **Wokwi path** in every practice. Wokwi can't yet connect two ESP32s over ESP-NOW, can't do deep sleep yet, and has no BME280. So the Wokwi path tests part of Node 2's sensors (the DS18B20, and a potentiometer as the soil sensor) and the Node 1 bridge with a **mock Node 2** inside Node 1. The router, current, and battery tests need real boards. The pass criteria are in ✅.
> - **No Raspberry Pi yet?** Follow the **laptop path** as in Modules 12–13: the Mosquitto broker and Node-RED run on the laptop. In every step, replace the address `192.168.1.37` with your laptop's IP address (the contract checker on the same laptop uses `127.0.0.1`), the MQTTX connection **Pi gateway** with **Via laptop IP**, and the commands **On the Pi** with a terminal on the laptop, exactly as in [table 8.2 of Module 13](../module-13-node-red-dashboard/README.md#82-adjust-the-addresses-in-every-step). Practice 6 and ➕ B have special notes for the laptop path.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in the browser and in the Node-RED editor, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The battery rules of Module 9 still apply.** Only use a genuine 18650 battery with a protected TP4056, never charge the battery without someone watching it, and **while Node 2 runs on the battery, its board's USB is unplugged**. Want to upload a program to Node 2? First unplug the VIN and GND wires from the battery circuit, and only then plug in the USB.
> 2. **The mini breadboard's top rail carries 5.0 V, its bottom rail carries 3.3 V.** From this week on, the bottom rail is used for sensors. The BME280 and the DS18B20 may only get 3.3 V from the bottom rail, never 5 V (the rule of Module 7).
> 3. **Only the soil sensor gets its power from a GPIO pin (D32).** It draws about 5 mA, still far below the safe limit of one pin. No other sensor may be connected to a GPIO pin as its power source.
> 4. **Node 2 never stores the Wi-Fi password, and no password of any kind is ever sent over ESP-NOW.** The ESP-NOW encryption keys (Practice 8) are kept in `keys.h`, which doesn't go to GitHub, like `secrets.h` in Module 10.
> 5. **Only change router settings on your own router,** or with its owner's permission. If you can't, Practice 1.5 gives you another way.

This module follows the same rhythm as Modules 1–13. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: two ESP32s talk without a router (30 minutes)](#-quick-win-two-esp32s-talk-without-a-router-30-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Sensor & gateway nodes](#1-sensor-nodes-and-gateway-nodes-the-pattern-in-almost-every-iot-product) · [2 ESP-NOW](#2-esp-now-a-letter-delivered-directly-without-a-post-office) · [3 Channels](#3-channels-one-radio-one-frequency) · [4 Wake sequence](#4-wake-briefly-sleep-long-node-2s-wake-sequence) · [5 33-byte packet](#5-the-33-byte-packet-the-same-form-at-both-ends) · [6 Callbacks 3.x](#6-callbacks-the-esp32-3x-way-drop-it-in-the-mailbox-process-it-in-loop) · [7 Node 1 as a bridge](#7-node-1-as-a-bridge-timestamps-the-holding-shelf-and-node-2s-status) · [8 Reliability](#8-reliability-ack-retries-and-counting-lost-packets) · [9 Battery life](#9-battery-life-sleep-is-what-decides-it) · [10 Security](#10-security-esp-now-encryption-and-secrets-you-never-broadcast)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Router channel](#practice-1--the-routers-channel-and-scanning-for-the-wi-fi-name-40-minutes) · [2 Sensors & packet](#practice-2--node-2s-sensors-and-the-33-byte-packet-60-minutes) · [3 Node 1 v1.3.0](#practice-3--node-1-v130-the-esp-now-to-mqtt-bridge-40-minutes) · [4 Node 2 v1.0.0](#practice-4--node-2-v100-wake-send-sleep-40-minutes) · [5 Garden card](#practice-5--the-garden-card-in-node-red-30-minutes) · [6 Router test](#practice-6--the-router-off-test-70-minutes) · [7 Current & battery](#practice-7--measure-the-current-and-work-out-the-battery-life-50-minutes) · [8 Encryption](#practice-8--esp-now-encryption-30-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-14-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

1. **Explain the sensor node → gateway node pattern** and why this pattern is used in almost every IoT product.
2. **Send data straight from ESP32 to ESP32 with ESP-NOW**, without a router and without a password, and understand what an ACK (an acknowledgement) means and where its limits are.
3. **Avoid the channel trap**: Node 2 finds the router's channel by scanning for the Wi-Fi name and remembers it in RTC memory, while Node 1 keeps listening even when the router is off.
4. **Write ESP-NOW callbacks the esp32 3.x way**, safely: drop it in the mailbox (a queue), process it in `loop()`.
5. **Build a battery-powered Node 2** with a BME280, a DS18B20, and a second soil sensor whose power is switched off during sleep, then pack its readings into a 33-byte packet.
6. **Turn Node 1 into a bridge to MQTT** according to data contract 1.1: timestamps, Node 2's status, and a holding shelf while the router is off, then show Node 2 in Node-RED.
7. **Measure Node 2's current with the INA219, work out its battery life, and encrypt ESP-NOW.**

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **Node 2 from Module 9** | The second ESP32 board with the battery circuit on the mini breadboard (18650 → TP4056 → MT3608 5.0 V → VIN) and the DS18B20 with its adapter module. Fully charge its battery before Practice 4: it takes 1–3 hours and must be watched (Module 9). |
| **BME280** (with soldered headers) | The one you used for practice in Module 7. Make sure it really is a BME280, not a BMP280 (Module 7 already showed you how to check). |
| **A second capacitive soil sensor** and a glass of water | The twin of Node 1's sensor (Module 6). The glass of water is for calibration. |
| **Jumper wires** | For Node 2's sensors (Practice 2): 6 male–female, 2 female–female (yellow and blue; the DS18B20's DAT wire from Module 9 stays in use), and 1 male–male. For Practice 7.5: 1 more male–male. Have a few spare wires ready too. |
| **INA219** | The current meter from Module 9 with its wires (6 male–female, and 1 male–male for the shared GND), for Practice 7. |
| **Node 1 v1.2.1, the Pi gateway, Node-RED, and the phone** | All from Modules 12–13: Node 1 runs from its charger, the gateway is on, and dashboard v0 opens on the phone. |
| **Laptop** | **Arduino IDE 2** with the **esp32 3.3.12** package from Module 2 (see below), the libraries from Modules 6–9, **MQTTX**, a terminal for SSH to the Pi, **VS Code** with the `mini-smart-home` folder, and **GitHub Desktop**. |
| **Two USB data cables** | So that Node 1 and Node 2 can be plugged in at the same time. If you only have one, plug the boards in one at a time. |
| **Paper tape and a marker** | For the labels **Node 1**, **Node 2**, and **3V3**. |
| **Access to your router's settings page** (recommended) | To lock the Wi-Fi channel (Practice 1.5). It's usually opened from a browser at an address like `192.168.1.1`. Can't do it? There's another way. |
| **Wokwi path** (without a second board) | A [Wokwi](https://wokwi.com) account as in Modules 2–13, Node-RED from Module 13 (on the Pi or on the laptop), and the public broker `broker.emqx.io`. |

**Check the esp32 package version first.** The ESP-NOW code in this module is written the way the esp32 package **3.3** expects it, and it needs at least version **3.3.7**. Click the **Boards Manager** icon in Arduino IDE's left sidebar, type `esp32`, then look at the entry **esp32 by Espressif Systems**. If it says `3.3.12 installed`, you're ready. If the version is older, choose **3.3.12** in the version menu, then click **UPDATE** (or **INSTALL**). Why does the version matter so much? Concept 6 explains it, and 🚨 has a cure for the error that appears if your version is behind.

Versions used in this module (October 2026): the **esp32 3.3.12** package (based on ESP-IDF v5.5.5), **Adafruit BME280 Library 2.3.0** (installed along with it: **Adafruit Unified Sensor 1.1.15** and **Adafruit BusIO 1.17.4**, already there since Module 7), **OneWire 2.3.8** and **DallasTemperature 4.0.6** (Module 7), **Adafruit INA219 1.2.3** (Module 9), and Node 1's libraries from Modules 6–11. ESP-NOW and Wi-Fi come with the esp32 package, so there are no new libraries this week.

---

## 🏆 Quick Win: two ESP32s talk without a router (30 minutes)

The goal: the Node 1 board shows a greeting that the Node 2 board sends through the air, **without a router and without a password**, and you see for yourself what "ACK" (acknowledgement) means.

> 🖥️ **Tools:** **Arduino IDE** with two windows, and the Node 1 board and the Node 2 board plugged into the laptop over USB. From the Quick Win until Practice 2, the Node 1 board runs practice sketches, so the dashboard shows Node 1 as `offline` and the fan automation stops. That's normal; Practice 3 brings Node 1's firmware back. The Wi-Fi name and password saved on the Node 1 board stay safe as long as the option **Tools → Erase All Flash Before Sketch Upload** stays **Disabled** (its default).
>
> 🖥️ **Wokwi path:** do step 2 in a new ESP32 project in Wokwi; the simulated board has the MAC address `24:0A:C4:00:01:10`, unless you give it your own `macAddress` in `diagram.json` as in Module 11. Step 3 can be tried in a second Wokwi project, but **its result is misleading**: Wokwi always prints `sent: the receiver replied with an ACK` even when there's no receiver at all. The simulator can't connect two ESP32s over ESP-NOW yet (tested in October 2026). So just read steps 3–4 and their results.

### Step 1 — Label and prepare the two boards (5 minutes)

1. Stick the labels **Node 1** and **Node 2** on the two boards and on their USB cables.
2. **The Node 1 board:** first turn off the workbench's MB102, unplug the board's USB cable from its charger, then plug it into the laptop (the power on/off order of Module 5). This week's practice sketches don't use the relays, so the MB102 can stay off until Practice 3.
3. **The Node 2 board:** if it's still connected to the battery circuit from Module 9, first unplug its VIN and GND wires from the mini breadboard. Only after that, plug its USB cable into the laptop.

### Step 2 — The receiver board: get to know its MAC address (10 minutes)

1. In Arduino IDE, open **File → New Sketch**, delete its contents, then paste this code. Save it as `module14_receiver` in the `module-14` folder of the `learn-iot` repository (create the folder if it isn't there yet).

   ```cpp
   // Module 14 - Quick Win, the RECEIVER board (the Node 1 board).
   // Prints this board's MAC address, then shows every ESP-NOW packet that arrives.
   // No router and no password: the WiFi radio is on as a station (STA), but not connected to anything.
   // Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>
   #include <esp_mac.h>

   // One packet that the "WiFi task" hands over to loop().
   struct Parcel {
     uint8_t mac[6];    // the sender's address
     int8_t rssi;       // signal strength, dBm (the closer to 0, the stronger)
     int length;        // how many bytes arrived
     char content[64];  // its content, as text
   };

   QueueHandle_t mailbox;  // FreeRTOS queue: from the WiFi task to loop()
   unsigned long packetCount = 0;

   // Called by the WiFi task (not loop()) every time a packet arrives. Just copy, hand over, done.
   void onReceived(const esp_now_recv_info_t *info, const uint8_t *data, int length) {
     Parcel p;
     memcpy(p.mac, info->src_addr, 6);
     p.rssi = info->rx_ctrl->rssi;
     p.length = length;
     int copyLength = length < 63 ? length : 63;
     memcpy(p.content, data, copyLength);
     p.content[copyLength] = '\0';
     xQueueSend(mailbox, &p, 0);  // 0 = don't wait; if the mailbox is full, this packet is skipped
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     mailbox = xQueueCreate(8, sizeof(Parcel));
     WiFi.mode(WIFI_STA);  // the radio is on, but not connected to any router

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     Serial.println();
     Serial.printf("This board's MAC: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     Serial.printf("Copy this line into the sender sketch: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n", mac[0], mac[1],
                   mac[2], mac[3], mac[4], mac[5]);

     if (esp_now_init() != ESP_OK) {
       Serial.println("ESP-NOW failed to start. Press the EN button to try again.");
       return;
     }
     esp_now_register_recv_cb(onReceived);
     Serial.printf("Waiting for ESP-NOW packets on channel %d...\n", WiFi.channel());
   }

   void loop() {
     Parcel p;
     while (xQueueReceive(mailbox, &p, 0) == pdTRUE) {  // take every parcel that is already there
       packetCount++;
       Serial.printf("Packet #%lu from %02X:%02X:%02X:%02X:%02X:%02X, %d bytes, signal %d dBm: \"%s\"\n", packetCount,
                     p.mac[0], p.mac[1], p.mac[2], p.mac[3], p.mac[4], p.mac[5], p.length, p.rssi, p.content);
     }
   }
   ```

2. In this window, choose the board **DOIT ESP32 DEVKIT V1** and the **Node 1** board's port, then click **Upload**. Not sure which port? Unplug the Node 2 board for a moment: the port that stays is Node 1's. If the upload stops at `Connecting…`, hold **BOOT** as soon as `Connecting…` appears, then release it when `Writing at …` starts running.
3. Open the **Serial Monitor** (115200 baud). If you can't see the first line, press the **EN** button on the Node 1 board.

   **Expected output** (example; your MAC address is different):

   ```text
   This board's MAC: A4:CF:12:E5:B7:C0
   Copy this line into the sender sketch: {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0}
   Waiting for ESP-NOW packets on channel 1...
   ```

   Look at the MAC address: it's Node 1's `device_id`, which you noted down in Module 11 (`a4cf12e5b7c0`), only written in capital letters, with a colon after every two digits. Its mailbox is already open on channel 1, the default channel of an ESP32 that isn't connected to any router.

### Step 3 — The sender board: send a greeting to that address (10 minutes)

1. Open **File → New Sketch** again. Arduino IDE opens a **second window**. Delete its contents, paste this code, then save it as `module14_sender` in the `module-14` folder.

   ```cpp
   // Module 14 - Quick Win, the SENDER board (the Node 2 board).
   // Every 2 seconds sends a greeting over ESP-NOW straight to the receiver board's MAC address,
   // then reports whether the receiver's radio replied "got it" (ACK).
   // Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>

   // REPLACE with the line "Copy this line into the sender sketch" from the receiver board's Serial Monitor:
   const uint8_t MAC_RECEIVER[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};

   volatile bool sendDone = false;  // set by the WiFi task, read by loop()
   volatile bool gotAck = false;
   unsigned long number = 0;

   // Called by the WiFi task once the radio knows the packet's fate: an ACK from the receiver, or none.
   void onSent(const esp_now_send_info_t *info, esp_now_send_status_t status) {
     gotAck = (status == ESP_NOW_SEND_SUCCESS);
     sendDone = true;
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     WiFi.mode(WIFI_STA);  // the radio is on, without a router
     if (esp_now_init() != ESP_OK) {
       Serial.println("ESP-NOW failed to start. Press the EN button to try again.");
       return;
     }
     esp_now_register_send_cb(onSent);

     esp_now_peer_info_t peer = {};  // the "address book": all fields set to zero first
     memcpy(peer.peer_addr, MAC_RECEIVER, 6);
     peer.channel = 0;          // 0 = the channel this board's radio is using now
     peer.ifidx = WIFI_IF_STA;  // send through the station (STA) interface
     peer.encrypt = false;      // no encryption yet (Practice 8)
     if (esp_now_add_peer(&peer) != ESP_OK) {
       Serial.println("Failed to add the receiver's address. Check MAC_RECEIVER.");
       return;
     }
     Serial.println();
     Serial.printf("Ready to send to %02X:%02X:%02X:%02X:%02X:%02X on channel %d.\n", MAC_RECEIVER[0], MAC_RECEIVER[1],
                   MAC_RECEIVER[2], MAC_RECEIVER[3], MAC_RECEIVER[4], MAC_RECEIVER[5], WiFi.channel());
   }

   void loop() {
     number++;
     char content[32];
     snprintf(content, sizeof(content), "hello from the garden #%lu", number);
     sendDone = false;
     esp_err_t result = esp_now_send(MAC_RECEIVER, (const uint8_t *)content, strlen(content) + 1);  // +1: send the end-of-text mark too
     if (result != ESP_OK) {
       Serial.printf("#%lu could not be sent: %s\n", number, esp_err_to_name(result));
     } else {
       unsigned long start = millis();
       while (!sendDone && millis() - start < 200) {  // wait for the radio's report, 200 ms at most
         delay(1);
       }
       if (sendDone && gotAck) {
         Serial.printf("#%lu sent: the receiver replied with an ACK.\n", number);
       } else {
         Serial.printf("#%lu FAILED: no ACK (receiver off, too far away, or on a different channel).\n", number);
       }
     }
     delay(2000);
   }
   ```

2. Replace what's inside the curly braces of the `MAC_RECEIVER` line with what's inside the curly braces of the `Copy this line…` line in Node 1's Serial Monitor: highlight it in the Serial Monitor (from the first `0x` to the last number), copy it (**Ctrl + C**), then paste it over the contents of the curly braces in the code. The rest of that code line, including the semicolon at its end, doesn't change.
3. In this second window, choose **DOIT ESP32 DEVKIT V1** and the **Node 2** board's port, click **Upload**, then open this window's **Serial Monitor** (115200 baud). If you missed the `Ready to send …` line, press **EN** on the Node 2 board.

   **Expected output** in Node 2's Serial Monitor (example):

   ```text
   Ready to send to A4:CF:12:E5:B7:C0 on channel 1.
   #1 sent: the receiver replied with an ACK.
   #2 sent: the receiver replied with an ACK.
   #3 sent: the receiver replied with an ACK.
   ```

   At the same time, in Node 1's Serial Monitor (example):

   ```text
   Packet #1 from 24:6F:28:B1:C7:D4, 25 bytes, signal -41 dBm: "hello from the garden #1"
   Packet #2 from 24:6F:28:B1:C7:D4, 25 bytes, signal -42 dBm: "hello from the garden #2"
   Packet #3 from 24:6F:28:B1:C7:D4, 25 bytes, signal -41 dBm: "hello from the garden #3"
   ```

4. **Note down the sender's address.** The address after the word `from` is the Node 2 board's MAC address, Node 2's future `device_id` (example: `24:6F:28:B1:C7:D4` becomes `246f28b1c7d4`). Create a file `notes-module14.md` in the `module-14` folder (in VS Code: **File → New Text File**, then **File → Save As…**), then write both MAC addresses in it. You'll use both of them again in Practices 1–4.

### Step 4 — Prove what ACK means (5 minutes)

1. Unplug the USB cable of the **Node 1** board. Within two seconds, Node 2's Serial Monitor prints (example):

   ```text
   #9 FAILED: no ACK (receiver off, too far away, or on a different channel).
   #10 FAILED: no ACK (receiver off, too far away, or on a different channel).
   ```

2. Plug the Node 1 board back in. As soon as the board is on, Node 2's report goes back to `sent: the receiver replied with an ACK.`

**What just happened?** No router, no IP address, and no password. The Node 2 board sent 25 bytes (24 characters, that is, letters, a number, spaces, and the `#` sign, plus one end-of-text mark) straight to the Node 1 board's **MAC address**, both on channel 1. As soon as its radio frame is received whole, the Node 1 board's **radio** replies right away with a small acknowledgement: the **ACK**. Without an ACK, Node 2 knows its send failed and can try again. This is the basis of Node 2 v1.0.0: send, wait for the ACK, try again if needed, then sleep.

> ➡️ **Done with the Quick Win?** Read [Concept 1](#1-sensor-nodes-and-gateway-nodes-the-pattern-in-almost-every-iot-product) to [Concept 3](#3-channels-one-radio-one-frequency), then do the practices in the order given at the start of 🧠 Concepts. Leave both boards plugged in: Practice 1 uses them right away.

---

## 🧠 The "Why" Concepts

The ten concepts below explain **why** Node 2 is built this way, one per section, and **you don't need to read them all at once**. Concepts and practices take turns, in this order:

1. Quick Win → **Concepts 1–3** → Practice 1 (the router's channel)
2. **Concepts 4–5** → Practice 2 (Node 2's sensors and the 33-byte packet)
3. **Concepts 6–7** → Practices 3, 4, and 5 (Node 1 v1.3.0, Node 2 v1.0.0, the Garden card)
4. **Concept 8** → Practice 6 (the router-off test)
5. **Concept 9** → Practice 7 (current and battery life)
6. **Concept 10** → Practice 8 (encryption) → 🧩 Challenges → ➕ Add-on

> 🖥️ **Want to try something in the Concepts section?** It's not required. The code snippets in the Concepts section are taken from the sketches and firmware you use in the Practices.

### 1. Sensor nodes and gateway nodes: the pattern in almost every IoT product

Look at the IoT products around you: a smart home door sensor, a room thermometer connected to an app, or a soil sensor on an oil palm plantation. Almost all of them are made up of two kinds of devices.

- **Sensor node**: small, cheap, battery-powered, and **asleep almost all the time**. It wakes up briefly to read its sensors, sends one short message over a short-range radio, then sleeps again. It doesn't need to know anything about the internet.
- **Gateway node**: on permanent power, **always awake**, listening to the sensor nodes, then passing their messages on to a bigger network. A smart home hub (control center) plugged into a wall socket is an example.

Why separate them? Because the two jobs are opposites. A Wi-Fi radio that's always listening draws about 100 mA, so a device that's always connected to Wi-Fi won't last long on a battery. In Module 9 you measured it yourself: a sleeping board uses far less power than an awake one. So the battery-powered device is made as simple and as brief as possible, while the work that needs a device that's always awake is handed to a device with permanent power.

In Mini Smart Home, this pattern shows up at two levels:

![Diagram from the garden to the phone, the chain of Node 2's messages. Left, Node 2 Garden: a second ESP32 on an 18650 battery, carrying a BME280, a DS18B20, and the second soil sensor; it wakes every 5 minutes for about half a second, then sleeps; label sensor node. An ESP-NOW arrow, one 33-byte packet, no router, to Node 1 Home: powered by a charger, always awake, connected to the home Wi-Fi; new job: an ESP-NOW to MQTT bridge; label gateway node, tier 1. An MQTT arrow over the home Wi-Fi to the Raspberry Pi gateway 192.168.1.37 with Mosquitto and Node-RED; label home gateway, tier 2. A web arrow to the phone, which opens the dashboard with the Garden card. Below Node 1, a box joined by a dashed line: Node 1 publishes on behalf of Node 2 to msh/246f28b1c7d4/telemetry and msh/246f28b1c7d4/status. Note at the bottom: Node 2 never connects to the router and doesn't know the Wi-Fi password; Node 2's data still uses Node 2's own device_id even though Node 1 is the one publishing it.](assets/from-garden-to-phone.png)

| | Node 2 "Garden" | Node 1 "Home" | Pi gateway |
| :--- | :--- | :--- | :--- |
| Power | 18650 battery | charger | the Pi's official adapter |
| Always awake? | no: wakes every 5 minutes, for about half a second | yes | yes |
| Talks to | Node 1, over ESP-NOW | Node 2 (ESP-NOW) and the broker (MQTT over Wi-Fi) | Node 1, Node-RED, and the phone (MQTT, web) |
| Its role | **sensor node** | home sensors + actuators, and at the same time the **gateway node** for Node 2 | **home gateway** (Module 12), later the bridge to the internet (Module 27) |

Node 2 never connects to the broker. **Node 1 publishes its messages on behalf of Node 2**, still with Node 2's own `device_id`: `msh/246f28b1c7d4/telemetry`. To the broker, Node-RED, and later the database, Node 2 is still a device of its own. This is a data contract rule from Module 11 that only now gets used.

### 2. ESP-NOW: a letter delivered directly, without a post office

In Module 10, Node 1 connected to the home Wi-Fi the usual way: first it **registers** with the router using the Wi-Fi name and password, gets an IP address, and only then may it talk. All its messages go through the router, like letters that always go through the post office. That suits a device that's always on, but it's expensive for Node 2: every time it wakes up, connecting to the router takes several seconds with the radio on, and the Wi-Fi password would have to be stored on a board lying out in the garden.

**ESP-NOW** is a protocol made by Espressif, the maker of the ESP32 chip. With ESP-NOW, one ESP32 sends a **special Wi-Fi frame** straight to another ESP32's **MAC address**, without a router, without an IP address, and without registering. Imagine tossing a note straight through your neighbor's open window. Your neighbor shouts "got it!", and that shout is the **ACK** (acknowledgement) you saw in the Quick Win.

![Diagram of two ways to send a message from the garden. Top, ordinary Wi-Fi, three numbered steps: 1, register with the router using the Wi-Fi name and password; 2, ask for an IP address (DHCP); 3, only then send messages through the router to Node 1 or the broker; about 1 to 3 seconds with the radio on; every message goes through the router, and if the router is off, messages can't be sent. Bottom, ESP-NOW: Node 2 sends one frame straight to Node 1's MAC address, A4:CF:12:E5:B7:C0, without a router and without the Wi-Fi password; the router icon above the arrow is crossed out and labeled router not used; Node 1's radio replies with an ACK; the send and the ACK take only a few milliseconds; as long as both are on the same channel, ESP-NOW keeps working even when the router is off. Note: unicast to one address gets an ACK; a broadcast to FF:FF:FF:FF:FF:FF never gets an ACK.](assets/esp-now-vs-wifi.png)

| | Ordinary Wi-Fi (Node 1 to the router) | ESP-NOW (Node 2 to Node 1) |
| :--- | :--- | :--- |
| Does the router have to be on? | yes | **no** |
| Needs the Wi-Fi name and password? | yes | **no** |
| Before it can send | register with the router and ask for an IP address: usually 1–3 seconds | right away: a few milliseconds |
| Destination address | an IP address (for example the broker `192.168.1.37`) | the destination board's **MAC address** |
| Size of one message | large, you hardly notice the limit | up to **250 bytes** per packet (up to 1,470 bytes in the newest version); Node 2's packet is only 33 bytes |
| Proof of delivery | from the TCP connection and, for MQTT, from the QoS | an **ACK** from the receiver's radio for every unicast packet |
| Can it reach the internet? | yes, through the router | no; it needs a gateway node (Node 1) |

A few important things about ESP-NOW:

- **Unicast and broadcast.** A packet sent to one MAC address (unicast) is answered with an ACK by the receiver's radio. A packet to the broadcast address `FF:FF:FF:FF:FF:FF` (broadcast) is received by every ESP32 nearby that's listening, but it **never** gets an ACK. Node 2 uses unicast to Node 1 so that it knows its packet arrived.
- **An ACK means "the radio received it", not "the program has processed it".** The ACK is sent by the receiver's radio as soon as the frame arrives whole, before the program on that board touches its content. That's why Node 2 also gives every packet a **sequence number**, so that Node 1 can count the lost packets and throw away duplicates (Concept 8).
- **Range.** According to Espressif, ESP-NOW is fairly stable up to about 150 m in open space and can reach 300 m. At home, walls and floors shorten that a lot. You can see the signal strength yourself from the `signal … dBm` number in Node 1's Serial Monitor: close to 0 means strong, around −80 dBm is still comfortable, and close to −90 dBm it starts getting shaky.
- **They must be on the same channel.** This is ESP-NOW's biggest trap. Concept 3 covers it.

### 3. Channels: one radio, one frequency

2.4 GHz Wi-Fi is divided into several ***channels***, each about 20 MHz wide. Indonesia uses channels 1–13, and your home router picks one of them, often automatically (**Auto**). As with FM radio stations, you only hear the broadcast on the frequency you're tuned to.

An ESP32 has only **one radio**, and at any moment that radio is on only **one channel**. An ESP-NOW packet is only heard if the sender and the receiver are on the same channel. In the Quick Win, neither board was connected to a router, so both stayed on the default channel, channel 1. That's why the Quick Win worked right away.

The real Node 1 is **connected to the router**, so its radio follows the router's channel, for example channel 6. Node 2 has to send on channel 6 too. But Node 2 never connects to the router, so nobody tells it which channel that is. The way out:

1. **Node 2 scans for the home Wi-Fi's name**, only its name (for example `OurHome`), without the password. The scan result tells it that router's channel, and that's Node 1's channel.
2. Scanning takes about **2.2–2.4 seconds** with the radio on, roughly three to four times the energy of one ordinary wake. So Node 2 **remembers that channel in RTC memory** (the memory that survives deep sleep, Module 9) and uses it again without scanning.
3. Node 2 only **scans again after two failed wakes in a row**. If the Wi-Fi name isn't found, for example because the router is off, the old channel is kept: Node 1 is still waiting there.

![Radio channel diagram. Top, the 2.4 GHz Wi-Fi band with channels 1 to 13; the router OurHome on channel 6, highlighted. Node 1, connected to the router, has its radio on channel 6. Node 2, not connected: on its first wake it scans for the name OurHome, finds channel 6, stores it in RTC memory, then sends on channel 6; the next wakes use channel 6 right away without scanning, and it only scans again after two failed wakes in a row. Bottom, two timelines from 0 to 120 seconds while the router is off, with dashed lines at the moments Node 2 sends (an example, spaced closer together): Node 1 v1.2.1 scans all the channels nonstop, about 2.4 seconds per attempt, so it's hardly ever on channel 6 and Node 2's packets are lost; Node 1 v1.3.0 only tries every 60 seconds, then goes back to channel 6, so Node 2's packets are still received. Red note: a router on channel 12 or 13 is refused by an ESP32 that isn't connected (the world rule, channels 1 to 11); lock the router on channel 1, 6, or 11.](assets/radio-channel.png)

There are three traps you need to know about:

- **A router on channel 12 or 13.** An ESP32 that isn't connected to a router uses the "world" country rule, which only allows channels 1–11. Node 2 can **find** your router on channel 12, but it **isn't allowed to move** there. This module's sketches print `Channel 12 refused by the ESP32…`; the cure: change the router's channel to 1, 6, or 11.
- **A router with an automatic channel.** A router that restarts may pick another channel. Node 2 only notices after two failed wakes (10 minutes on a 5-minute schedule). That's why Practice 1.5 recommends **locking the router's channel** on 1, 6, or 11.
- **Node 1 while the router is off.** In Module 10, Node 1 learned to reconnect by itself: every time it fails, the esp32 package tries again right away, and every attempt **scans all the channels** for about 2.4 seconds. While the router is off, Node 1's radio is hardly ever on its old channel, so Node 2's packets aren't heard. Node 1 v1.3.0 (Practice 3) switches that automatic reconnect off (`WiFi.setAutoReconnect(false)`), hands the job to the 60-second guard from Module 10, and after every attempt puts the radio back on the router's channel. Node 1 also no longer lets its radio take little naps (`WiFi.setSleep(false)`), so that no Node 2 packet is missed. A board powered by a charger doesn't need to save power.

> ➡️ **Time to practice!** Concepts 1–3 are enough for [Practice 1 — The router's channel and scanning for the Wi-Fi name](#practice-1--the-routers-channel-and-scanning-for-the-wi-fi-name-40-minutes). After that, come back to Concept 4.

### 4. Wake briefly, sleep long: Node 2's wake sequence

In Module 9 you learned that a board in deep sleep uses far less power than an awake board. You also saw for yourself that the Node 2 skeleton back then stayed awake for about 0.8 seconds, mostly waiting for the DS18B20 to measure at full resolution (Module 9, Practice 4). This week Node 2 carries three sensors and a radio, so the **order** of its work while awake also decides the battery life.

![Diagram of Node 2 v1.0.0's wake sequence with an estimated current graph. A time axis from 0 to about 0.6 seconds. Steps in order: 1, the blue LED turns on and pin D32 goes HIGH, so the soil sensor starts getting power; 2, the DS18B20 starts measuring without being waited for, 10 bits, 188 ms at most; 3, the BME280 is looked for, then measures once in forced mode, and then sleeps by itself; 4, wait for the DS18B20 to finish and the soil sensor to settle, at least 300 ms after D32 turned on; then 20 soil sensor readings and D32 LOW; 5, the radio turns on last: the channel from RTC memory, send one packet, wait for the ACK for 200 ms at most; 6, the radio is turned off, the LED goes out, sleep for 300 seconds. The current graph below it: about 50 mA while reading the sensors, jumping to about 100 to 130 mA only while the radio is on, then dropping to the board's sleep current of about 4 to 5 mA. Note: the current figures are estimates on the 5 V side, including the DevKit V1 board's regulator and LED; measure them yourself with the INA219 in Practice 7; in Practice 2, the BME280 finishes about 120 ms and the DS18B20 about 190 ms after waking.](assets/node2-wake-sequence.png)

The principle: **sensors first, the radio last**, and every part is switched off as soon as its job is done. The radio draws the most current, so it's turned on for as short a time as possible. A bonus: the soil sensor's ADC reading isn't disturbed by radio noise. There are three small decisions with a big effect:

1. **The soil sensor gets its power from pin D32, not from 3V3.** A capacitive soil sensor draws about 5 mA nonstop for as long as it has power. The board's 3V3 pin stays powered even when the ESP32 sleeps (the board's regulator doesn't sleep, Module 9), so a sensor connected to 3V3 stays on all the time too. Node 2's sleep current then rises from about 5 mA to about 10 mA, and the battery life is cut in half. With VCC from D32, the sensor is only on while Node 2 is awake: `digitalWrite(32, HIGH)` at the start, `digitalWrite(32, LOW)` after it has been read. A current of 5 mA is still far below the safe limit of one ESP32 pin.
2. **The BME280 is read in forced mode** (measure once). `bme.begin()` alone makes the BME280 measure nonstop (normal mode), and it can then draw up to about 0.5 mA while Node 2 sleeps. In forced mode, the BME280 measures once, then goes to sleep by itself, drawing about 0.1 µA:

   ```cpp
   bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                   Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
   if (!bme.takeForcedMeasurement()) {
     return;
   }
   ```

   This setting (measure once, no smoothing filter) is the one Bosch, the maker of the BME280, recommends for weather stations: enough for a reading every few minutes. Remember too: `readPressure()` gives a number in **pascals**, so it's divided by 100 to become **hPa** (`1008.6`, not `100860`).
3. **The DS18B20 is set to 10 bits.** At a resolution of 12 bits (the default), the DS18B20 needs up to 750 ms for one reading in steps of 0.0625 °C. Yet the sensor's own accuracy is ±0.5 °C (Module 7), so such fine numbers only look precise. At 10 bits, one reading takes 188 ms at most, in steps of 0.25 °C: honest, and faster. `setResolution(10)` is safe to call on every wake: the **DallasTemperature** 4.0.6 library only writes to the sensor's memory if the resolution really is different. Then `setWaitForConversion(false)` makes the DS18B20 measure **while** Node 2 reads the BME280.

Two other habits save power too: `WiFi.persistent(false)`, so that the Wi-Fi settings aren't written to flash memory on every wake (the rule of Module 9: don't write to NVS over and over), and scanning for the channel only when needed (Concept 3). But don't expect too much: the DevKit V1 board's own sleep current (about 4–5 mA, because of its regulator and its red LED) is still the biggest part. Concept 9 works it out.

### 5. The 33-byte packet: the same form at both ends

What does Node 2 send? It could be JSON text as in MQTT, about 140 bytes, which would still fit in 250 bytes. But Node 2 sends a **binary packet**: a row of bytes with a fixed layout, like a form whose fields are already printed. The reasons:

- **Node 1 can check it easily.** A valid packet is always exactly 33 bytes, starting with the mark `0x52` and the form version number `1`. Any other packet is rejected at once.
- **The data contract rules only have to be enforced in one place.** Node 1 builds the JSON: it adds `ts`, rounds the numbers, and writes `null` for failed readings. Node 2 doesn't need a JSON library.
- **It stays small.** One packet is on the air for less than a millisecond.

The form is written once as a `struct` in the file `node2-packet.h`, and **exactly the same** file is used in the firmware folders of Node 1 and Node 2:

```cpp
// node2-packet.h - the "form" of the ESP-NOW packet from Node 2 "Garden" to Node 1 "Home" (Module 14).
// This file is EXACTLY THE SAME in the node-1-home and node-2-garden folders. If you change its layout, change BOTH
// and raise PACKET_VERSION, so that Node 1 rejects old packets with a clear message.
// Both ends are ESP32s (little-endian, same compiler), so the struct may be sent as it is.
#pragma once
#include <stdint.h>

const uint8_t PACKET_MARK = 0x52;  // the letter 'R' (Rumah, Indonesian for home): someone else's ESP-NOW packets are rejected at once
const uint8_t PACKET_VERSION = 1;  // raise it every time the form's layout changes

// __attribute__((packed)) = no gaps between fields: the size is exactly the same at the sender and the receiver.
struct __attribute__((packed)) Node2Packet {
  uint8_t mark;              // always PACKET_MARK
  uint8_t version;           // always PACKET_VERSION
  uint8_t fw[3];             // Node 2's firmware version: major, minor, patch, for example {1, 0, 0}
  uint16_t session;          // a new random number every time Node 2 powers up from OFF (not from sleep)
  uint32_t sequence;         // the packet number: goes up by 1 every time Node 2 wakes up
  uint16_t intervalSeconds;  // Node 2's wake schedule (for example 300); Node 1 uses it for the "offline" limit
  uint8_t attempt;           // which send of this wake it is (1 = it worked straight away)
  float temperature;         // degrees Celsius from the BME280; NAN = could not be read
  float humidity;            // percent from the BME280; NAN = could not be read
  float pressure;            // hPa from the BME280; NAN = could not be read
  float soilTemperature;     // degrees Celsius from the DS18B20; NAN = could not be read
  int8_t soil;               // percent 0-100 from the second soil sensor; -1 = could not be read
  uint16_t batteryMv;        // battery voltage in millivolts; 0 = not measured
};
static_assert(sizeof(Node2Packet) == 33, "Node2Packet size changed: make both files the same and raise PACKET_VERSION");
```

A few words that may be new:

- **`uint8_t`, `uint16_t`, `uint32_t`, `int8_t`**: whole numbers with an exact size (8, 16, or 32 bits, that is, 1, 2, or 4 bytes). The letter `u` means unsigned: no minus sign. A `float` is always 4 bytes on the ESP32.
- **`__attribute__((packed))`**: tells the compiler to lay out the fields **tightly, with no gaps**. Without it, the compiler may insert empty bytes so that the `float` fields land on addresses that are multiples of four, and the struct becomes bigger than 33 bytes.
- **`static_assert`**: a check **at compile time**. If the struct's size isn't 33 bytes, for example because you added a field in one folder only, Arduino IDE refuses to compile and shows the sentence inside those double quotes.
- **`NAN`** (*not a number*): the mark of a failed `float` reading. When Node 1 builds the JSON, the **ArduinoJson** library writes `NAN` as `null`, exactly as the data contract rule says. For `soil`, the mark is `-1`; for the battery, `0` means "not measured", so the `battery` field isn't written at all.

![Diagram of the 33-byte packet map, read from left to right like a row of boxes numbered 0 to 32. Byte 0, the mark 0x52, the letter R; byte 1, form version 1; bytes 2 to 4, Node 2's firmware version, 1.0.0; bytes 5 to 6, session; bytes 7 to 10, sequence; bytes 11 to 12, the wake interval in seconds; byte 13, attempt; bytes 14 to 17, air temperature; bytes 18 to 21, humidity; bytes 22 to 25, pressure; bytes 26 to 29, soil temperature, 4 bytes each; byte 30, soil in percent; bytes 31 to 32, battery in millivolts. The boxes hold a real example from Wokwi, Practice 2, without a BME280, with the DS18B20 at 27.0 degrees and the potentiometer at 55 percent: 52 01 01 00 00 AD 9C 01 00 00 00 2C 01 01 00 00 C0 7F 00 00 C0 7F 00 00 C0 7F 00 00 D8 41 37 00 00, read as: AD 9C is session 0x9CAD; 01 00 00 00 is sequence 1; 2C 01 is 300 seconds; three times 00 00 C0 7F is NAN because Wokwi has no BME280; 00 00 D8 41 is 27.0 degrees; 37 is 55 percent soil; 00 00 means the battery isn't measured. Note: numbers longer than one byte are written smallest byte first (little-endian), so 2C 01 means 0x012C = 300.](assets/packet-map-33-bytes.png)

One more thing in the picture looks odd: the number 300 is written `2C 01`, not `01 2C`. The ESP32 stores numbers longer than one byte with the **smallest byte first** (*little-endian*): `0x012C` is stored as `2C`, then `01`. Because Node 1 and Node 2 are both ESP32s with the same compiler, this layout matches at both ends, and the struct may be sent as it is. If the receiver is ever something other than an ESP32, the byte order has to be taken care of.

The `session` and `sequence` fields are covered in Concept 8. The lesson for now: **change `node2-packet.h` in both folders at once, and raise `PACKET_VERSION` every time its layout changes.** Node 1 rejects packets of another version with a clear message, instead of misreading the bytes.

> ➡️ **Time to practice!** Concepts 4–5 are enough for [Practice 2 — Node 2's sensors and the 33-byte packet](#practice-2--node-2s-sensors-and-the-33-byte-packet-60-minutes). After that, come back to Concept 6.

### 6. Callbacks the esp32 3.x way: drop it in the mailbox, process it in `loop()`

A ***callback*** is a function you register, which the system then calls when something happens. You already used one in Module 10: the Wi-Fi event function `onWiFiEvent` is called by the esp32 package every time the Wi-Fi connects or disconnects. ESP-NOW has two callbacks:

- the **send *callback***, called once the radio knows the packet's fate (an ACK or not), registered with `esp_now_register_send_cb()`;
- the **receive *callback***, called every time a packet arrives, registered with `esp_now_register_recv_cb()`.

**Where do they run?** Not in `loop()`. Both are run by **the Wi-Fi task**, a high-priority task belonging to the esp32 package on core 0, while `loop()` runs on core 1. The Wi-Fi task and `loop()` really do run **at the same time**. As a result, there are two rules:

1. **A callback must be short.** The ESP-IDF documentation advises against using callbacks for long work: just hand the data you need over to a **queue**, and let another task process it. So no `Serial.print()`, no building JSON, and no `mqtt.publish()` inside a callback.
2. **Copy the data, don't keep its pointer.** The sender's address and the packet's content are only valid while the callback runs. After that, their place in memory is reused.

For one small signal, a `volatile bool` **flag** is enough, as in Module 10 and in the Quick Win sender sketch (`sendDone`, `gotAck`). But a packet's content is dozens of bytes. Copying it through a few ordinary variables is dangerous: `loop()` might read half of an old packet and half of a new one. The right tool is a **FreeRTOS queue**: a **mailbox** that copies every parcel whole, one at a time.

![Diagram of the mailbox for the ESP-NOW callback. Left, core 0: the Wi-Fi task, high priority. An ESP-NOW packet arrives and the callback onEspNowReceive is called: check that the packet isn't a broadcast and is exactly 33 bytes long, copy the packet's content, the sender's address, and the signal strength, note millis, then xQueueSend with a wait time of 0 into the mailbox. Middle, the mailbox, a FreeRTOS queue with 8 slots, three of them holding packets. Right, core 1: loop. updateBridge takes what's in the mailbox with xQueueReceive without waiting, then checks the MAC, the mark, and the version, throws away duplicate packets while counting the lost ones, puts the readings on the holding shelf, publishes over MQTT, at most 3, and prints a log to the Serial Monitor; a green check mark: all the long work happens here. Red crosses inside the callback: no Serial.print, no mqtt.publish, no building JSON, no waiting. Note: the callback and loop run at the same time on two cores; the mailbox copies every parcel whole.](assets/callback-mailbox.png)

The pattern, as in the Quick Win receiver sketch:

```cpp
QueueHandle_t mailbox = xQueueCreate(8, sizeof(Parcel));  // 8 slots, each slot the size of one Parcel

void onReceived(const esp_now_recv_info_t *info, const uint8_t *data, int length) {
  Parcel p;
  memcpy(p.mac, info->src_addr, 6);  // copy: info and data are valid only while the callback runs
  // ... copy the packet content ...
  xQueueSend(mailbox, &p, 0);        // 0 = don't wait; a full mailbox = this packet is skipped
}

void loop() {
  Parcel p;
  while (xQueueReceive(mailbox, &p, 0) == pdTRUE) {  // take only what is already there, don't wait
    // ... only here may you print, build JSON, and publish ...
  }
}
```

**Why do tutorials on the internet often fail to compile?** The shape (signature) of both callbacks has changed twice. Arduino IDE with the esp32 package 3.3 only accepts the newest shape:

| esp32 package | Receive callback | Send callback |
| :--- | :--- | :--- |
| 2.0.x (old tutorials) | `(const uint8_t *mac, const uint8_t *data, int len)` | `(const uint8_t *mac, esp_now_send_status_t status)` |
| 3.0–3.2 | `(const esp_now_recv_info_t *info, const uint8_t *data, int len)` | still `(const uint8_t *mac, esp_now_send_status_t status)` |
| **3.3** (this module) | `(const esp_now_recv_info_t *info, const uint8_t *data, int len)` | **`(const esp_now_send_info_t *info, esp_now_send_status_t status)`** |

Old tutorial code compiled with the 3.3 package stops with a message like this one (tested):

```text
error: invalid conversion from 'void (*)(const uint8_t*, esp_now_send_status_t)' {aka 'void (*)(const unsigned char*, esp_now_send_status_t)'} to 'esp_now_send_cb_t' {aka 'void (*)(const wifi_tx_info_t*, esp_now_send_status_t)'} [-fpermissive]
```

The cure: **change the function's shape** as in the last row of the table. Don't patch it by writing `esp_now_send_cb_t(...)` in front of the function's name (a cast, which forces the type). That patch does compile, but the printed MAC address turns into random numbers, because the first parameter no longer holds a MAC address. A silent mistake is more dangerous than a clear error.

One more small warning: increasing a `volatile` variable with `++` makes the compiler of the esp32 3.3 package (which uses C++20) warn `'++' expression of 'volatile'-qualified type is deprecated`. That's why Node 1's firmware writes `droppedByWifiTask = droppedByWifiTask + 1;`.

### 7. Node 1 as a bridge: timestamps, the holding shelf, and Node 2's status

Node 1 v1.3.0 gets one new module, `bridge.cpp`. Its job: receive Node 2's packets, then publish them to the broker **on behalf of Node 2**, according to the data contract. It works like this:

1. The **receive *callback*** throws away broadcast packets, then copies a packet of exactly 33 bytes, the sender's address, the signal strength, and its arrival time (`millis()`) into the mailbox (Concept 6).
2. **`loop()` checks** that packet: it must come from the address `MAC_NODE2` in `config.h`, carry the mark `0x52`, and have form version `1`. Duplicate packets are thrown away, lost packets are counted (Concept 8).
3. A valid packet is put on the **holding shelf**: a place in RAM that holds up to **96 readings** (8 hours on a 5-minute schedule, about 4 KB).
4. As long as the Wi-Fi and the broker are connected and Node 1's clock is set, Node 1 publishes **at most the three oldest readings per pass of `loop()`**, as JSON to `msh/<device_id Node 2>/telemetry`. `loop()` stays nimble, and the watchdog isn't disturbed.

**Who makes `ts`?** The Module 11 data contract says: `ts` is made by the device, not by the server, so that late data is recorded at the time it happened. Node 2 has no clock it can trust: it never connects to the internet for NTP, and the clock inside its chip drifts while it sleeps. So **Node 1 makes Node 2's `ts`**, from the time the packet **arrived**:

```text
ts = Node 1's clock now − (millis() now − millis() when the packet arrived)
```

If the broker can be reached, that difference is only a few milliseconds. If the router is off for 30 minutes, the readings wait on the shelf, and when they're finally published, their `ts` is **set back** by the age of each reading. A reading from 10:05 WIB is still stamped 10:05 WIB, even though it's only published once the router is back on at 10:36 WIB, as in the next picture. This is the change to rule 1 in **data contract version 1.1**.

![Diagram of the Node 1 bridge and the holding shelf, three panels side by side. Panel 1, router on: a Node 2 packet arrives at 10:00, goes onto the holding shelf, and is published right away with ts 10:00. Panel 2, router off from 10:05 to 10:35: the packets still arrive over ESP-NOW at 10:05, 10:10, up to 10:35, and pile up on the holding shelf, 7 of 96 used; the broker can't be reached. Panel 3, router back on at 10:36: Node 1 reconnects, then publishes the shelf's contents starting with the oldest, at most 3 per pass of loop, each with its ts set back to its arrival time, 10:05, 10:10, and so on; a Node-RED chart that uses ts shows those points at the time they happened. Note at the bottom: ts = Node 1's clock now minus (millis() now minus millis() when the packet arrived); the holding shelf is in RAM, so its contents are lost if Node 1 restarts; a full shelf, 96 readings, means the oldest reading is evicted.](assets/bridge-holding-shelf.png)

That's why **the Garden chart in Node-RED must use `ts` as its time axis**, not the time the message arrives. The picture below is a screenshot from the author's lab: a mock Node 2 publishes 24 hours of history at once, like late data after the router comes back on. The history is deliberately longer than what the holding shelf holds (only 96 readings, or 8 hours) so that the difference is clear.

![Two screenshots of a Dashboard 2 chart at the width of a phone screen, side by side, with a title and captions; the subtitle: 24 hours of mock Node 2 history published at once, deliberately longer than the holding shelf. Left, with a green check mark: X axis = ts (reading time), the X field of type key: with the value time; a blue air temperature line and a red soil temperature line spread across 24 hours, with the axis labels 18 (midnight), 04:00, 08:00, 12:00, 16:00, 20:00; the air temperature is about 20 degrees before dawn and about 30 degrees in the afternoon, while the soil temperature changes more slowly. Right, with a red cross: X axis = message arrival time, the X field of type timestamp (the default); the lines have the same shape, but the axis labels are 03:24:26, 03:24:27, 03:24:28, so the 24 hours of history pile up in about 2 seconds as the messages arrive. The axis labels of both charts are framed: green on the left, red on the right. Caption at the bottom: late data must be drawn by ts (reading time), not by the time the message arrives.](assets/chart-ts-vs-arrival.png)

*Real screenshots of FlowFuse Dashboard 1.33.0 (Apache 2.0 license) from the author's laptop browser, narrowed to the width of a phone screen, with data from a mock Node 2; title, marks, and captions by the author.*

**Node 2's status.** Node 1 has an MQTT last will (Module 11), but Node 2 never connects to the broker, so it has no will of its own. Its status is worked out by Node 1 and published retained to `msh/<device_id Node 2>/status`:

- `online` as soon as the first valid packet from Node 2 arrives;
- `offline` if there's no packet for **three times Node 2's wake schedule plus one minute**. On a 5-minute schedule, the limit is 16 minutes, so one lost packet doesn't make Node 2 count as dead. The schedule is read from the packet (`intervalSeconds`), so this limit adjusts by itself when the schedule is changed for a test.

In other words, Node 2's status really means **"Node 1 still hears Node 2"**. If Node 1 itself is `offline`, Node 2's status can't be trusted anymore. That's why the Garden card on the dashboard shows Node 2's status, and the Sensors card still shows Node 1's status.

**Data contract 1.1** only adds things; it doesn't change Node 1's data:

| Part | Change in contract 1.1 |
| :--- | :--- |
| `telemetry` fields | new: `pressure` (hPa), `soil_temperature` (°C), and `battery` (volts, optional); `temperature`, `humidity`, and `soil` are reused with the same meaning |
| Fields by device | each device only writes the sensor fields it has: Node 1 never writes `pressure`, Node 2 never writes `light` |
| Node 2's `ts` | made by Node 1 when the packet is received (rule 1) |
| Node 2's `status` | published by Node 1: `online` on the first packet, `offline` after 3 × the schedule + 1 minute |
| Node 2's `soil` | may be `null` if the raw value is impossible (sensor unplugged) |
| Who writes to Node 2's topics | Node 1, as an exception to rule 6 (recorded in the broker's access list in Module 21) |

An example of a Node 2 message published by Node 1 (according to contract 1.1):

```json
{"ts":"2026-10-25T01:30:12Z","fw":"1.0.0","temperature":29.4,"humidity":78,"pressure":1008.6,"soil_temperature":27.3,"soil":41}
```

Look at `fw`: it holds the firmware version of **Node 2**, carried in the packet, not Node 1's version. One more thing has to be admitted honestly: the holding shelf is in **RAM**. If Node 1 restarts while the router is off, the shelf's contents are lost, and so is the router channel it remembered (also in RAM). As a result, Node 1 only hears Node 2 again once the router is back on. If Node 1 has just powered up while the internet is down, its clock isn't set yet, and Node 2's readings wait on the shelf until NTP succeeds.

> ➡️ **Time to practice!** Concepts 6–7 are enough for [Practice 3 — Node 1 v1.3.0](#practice-3--node-1-v130-the-esp-now-to-mqtt-bridge-40-minutes), [Practice 4 — Node 2 v1.0.0](#practice-4--node-2-v100-wake-send-sleep-40-minutes), and [Practice 5 — The Garden card in Node-RED](#practice-5--the-garden-card-in-node-red-30-minutes). After that, come back to Concept 8.

### 8. Reliability: ACK, retries, and counting lost packets

ESP-NOW doesn't promise that every packet arrives. Packets can get lost because of distance, walls, interference from other devices, or because Node 1's radio is busy scanning other channels. Node 2 v1.0.0 deals with this in three ways.

**1. Retries with chosen pauses.** Every time it wakes up, Node 2 tries to send at most three times: the first attempt, a second attempt 100 ms later, and a third attempt 2.5 seconds after that. Why is the last pause long? While the router is off, Node 1 tries to reconnect every 60 seconds, and every attempt scans all the channels for about 2.4 seconds (Concept 3). If Node 2 happens to send inside that 2.4-second window, the third attempt usually falls after the scan has finished. Usually, not always: if Node 1's radio is only put back on the router's channel a few seconds after the scan (Practice 3.4), all three attempts can fail. That packet is counted as `lost`, and the 90% requirement of the Practice 6 test leaves room for that. The long pause rarely costs battery either: Node 2 only waits for it if the first two attempts fail.

**2. Sequence numbers and session numbers.** Every packet carries:

- **`sequence`**: goes up by one every time Node 2 wakes up, is kept in RTC memory, and does **not** change for the retries within one wake;
- **`session`**: a random number made fresh every time Node 2 powers up from **off**, for example after the battery is removed or the EN button is pressed. RTC memory is empty again after events like that (Module 9), and `sequence` starts again from 1.

With those two numbers, Node 1 can tell four situations apart:

| What arrives at Node 1 | What it means | What Node 1 does |
| :--- | :--- | :--- |
| same session, `sequence` = last + 1 | the next packet, normal | accepted |
| same session, `sequence` ≤ last | a **duplicate**: the ACK got lost, so Node 2 resent a packet that had actually arrived | thrown away, counted in `duplicates` |
| same session, `sequence` jumps, for example from 41 to 44 | two packets (42 and 43) were **lost** | accepted; `lost` goes up by 2 |
| a different session | Node 2 restarted | the sequence count starts again |

Espressif's own ESP-NOW documentation recommends sequence numbers like these to throw away duplicate data. The `node2` command in Node 1's Serial Monitor shows all the counts, including the **percentage of packets that arrived** = received ÷ (received + lost).

**3. Finding the channel again after two failures.** This one was already covered in Concept 3.

**An honest "router off" test.** The Syllabus asks: when the router is switched off, at least 90% of Node 2's packets still arrive, and the data shows up on the Pi again when the router comes back on. In Practice 6, this test is measured with the **sequence numbers**, not by feel. One thing has to be worked out first: if Node 2 wakes every 5 minutes, it only sends **6 packets** while the router is off for 30 minutes. A single lost packet drops the figure to 83%: a fail. That's why, during the test, Node 2's schedule is temporarily changed to **60 seconds**: about 30 packets in 30 minutes, and the 90% requirement means at most 3 packets may be lost. Because ESP-NOW doesn't need a router, Node 2's packets must **arrive at Node 1** right on schedule even while the router is off. Only the trip from Node 1 to the Pi is delayed, and that's exactly the holding shelf's job (Concept 7).

> ➡️ **Time to practice!** Concept 8 is enough for [Practice 6 — The router-off test](#practice-6--the-router-off-test-70-minutes). After that, come back to Concept 9.

### 9. Battery life: sleep is what decides it

In Module 9 you already got the battery life formula. This week, that formula is used with Node 2's real load. One Node 2 cycle lasts 5 minutes (300 seconds):

- **awake**: less than one second, including the time the board takes to start up before `setup()` runs. The current is about 50 mA while reading the sensors and more than 100 mA while the radio is on (on the 5 V side). The charge is about **50–90 mA·s**;
- **asleep**: about 299.5 seconds at the DevKit V1 board's sleep current of about 4.9 mA (the example measurement from Module 9). The charge is about **1,470 mA·s**.

So about **95%** of the battery's charge is used while Node 2 is **asleep**. Making the awake time shorter does help, but only a little. What matters most is **what stays on during sleep**.

![Diagram of Node 2's battery life. Top, one 300-second cycle drawn as a bar of charge: the awake part, about 50 to 90 mA times seconds, is thin, and the asleep part, about 1,470 mA times seconds, fills almost the whole bar; text: about 95 percent of the charge is used while asleep. Bottom, the estimated life of a genuine 2,500 mAh 18650 battery in six situations, as horizontal bars: this module's design, the soil sensor powered from D32, BME280 forced, DS18B20 10 bits, about 10 days; the soil sensor on 3V3, about 5 days; the BME280 left in normal mode, about 9.4 days; scanning for the channel on every wake, about 8.9 days; all three mistakes at once, about 4.6 days; waking every 30 minutes instead of every 5 minutes, only about 10.6 days. A red dashed line at 3 days: the Syllabus pass requirement. Note: the figures are estimates with a board sleep current of 4.9 mA and the factor 1.6 from Module 9; measure your own in Practice 7.](assets/node2-battery-life.png)

Estimates for a genuine **2,500 mAh** 18650 battery (2,000 mAh usable, the 80% rule of Module 9), with the factor 1.6 from Module 9 for the MT3608 and a board sleep current of 4.9 mA:

| Situation | Average on the 5 V side | Battery side (× 1.6) | Estimated life |
| :--- | :---: | :---: | :---: |
| **This module's design** (soil from D32, BME280 forced, DS18B20 10 bits) | 5.06 mA | 8.1 mA | **about 10 days** |
| Soil sensor connected to 3V3 | 10.05 mA | 16.1 mA | about 5 days |
| BME280 left in normal mode | 5.52 mA | 8.8 mA | about 9.4 days |
| Scanning for the channel on every wake | 5.85 mA | 9.4 mA | about 8.9 days |
| All three of those mistakes at once | 11.26 mA | 18.0 mA | about 4.6 days |
| This module's design, but waking every **30 minutes** | 4.93 mA | 7.9 mA | about 10.6 days |
| This module's design with a fake "9,900 mAh" battery (really about 1,000 mAh) | 5.06 mA | 8.1 mA | about 4 days |

Three lessons from that table:

1. **One wire can cut the battery life in half.** A soil sensor on 3V3 draws 5 mA nonstop, as much as the whole board's sleep current.
2. **Waking less often hardly helps** on the DevKit V1: going from 5 minutes to 30 minutes only raises the life from about 10 to about 10.6 days, because the board's sleep current stays the same. A life of months needs a board that's really designed for low power (Module 9 🔬).
3. **The pass requirement "lasts ≥ 3 days" has a big margin.** Three days from 2,000 usable mAh means the average current on the battery side may be up to about 28 mA, while this design draws about 8 mA. Node 2 only fails if its battery is fake **and** there's a design mistake at the same time.

Those figures are estimates. In Practice 7 you measure your own Node 2's current with the INA219 and work it out again.

> ➡️ **Time to practice!** Concept 9 is enough for [Practice 7 — Measure the current and work out the battery life](#practice-7--measure-the-current-and-work-out-the-battery-life-50-minutes). After that, come back to Concept 10.

### 10. Security: ESP-NOW encryption and secrets you never broadcast

Without encryption, ESP-NOW packets can be heard by any ESP32 around your home, as long as that ESP32 is on the same channel. They only hold garden data, so that's no big secret. The more real problem: **anyone can send fake packets**. It's true that Node 1 only accepts packets from the address `MAC_NODE2`, but a MAC address can be faked. Without a key, Node 1 can't tell the real Node 2 from an impostor.

**ESP-NOW encryption** uses two keys of **exactly 16 bytes** each (16 letters or digits):

- **PMK** (*Primary Master Key*, the master key): the same for all your ESP-NOW devices. This key is used to protect the LMK.
- **LMK** (*Local Master Key*, the pair key): the same at both ends of one pair, here Node 1 and Node 2. This is the key that locks the content of every packet.

A locked packet can't be read without the key, and a packet that's changed along the way is rejected by the receiver. There are a few rules:

- **Only unicast packets can be encrypted.** Broadcast packets (`FF:FF:FF:FF:FF:FF`) are always open and still reach the receive callback even when encryption is set up. That's why Node 1 throws away every broadcast packet: without this filter, an impostor would only need to broadcast packets with Node 2's sender address.
- **The receiver must register the sender as an encrypted peer** with the same LMK. That's why Node 1 has to know Node 2's MAC address, and it already does (`MAC_NODE2`).
- **If the keys differ by even one character, the packets disappear without a clear error message.** Node 1 doesn't mention the key at all; it just stops receiving, and a few minutes later declares Node 2 `offline`. That's why encryption is set up **last of all** (Practice 8), after the unencrypted path has been proven to work, so that you have something to compare with.
- The esp32 3.3.12 package allows up to twenty ESP-NOW peers, seven of them encrypted. That's more than enough for Mini Smart Home.

**Where are the keys kept?** In the file **`keys.h`**, which does **not** go to GitHub because its name is written in `.gitignore`, exactly like `secrets.h` in Module 10. The repository only keeps an example of it, `keys.example.h`. As long as `keys.h` doesn't exist, the Node 1 and Node 2 firmware still compile and run **without** encryption. If your key isn't 16 letters or digits long, Arduino IDE refuses to compile, with the message `KEY_PMK in keys.h must be exactly 16 letters/digits` (the `static_assert` check, Concept 5).

**"Never broadcast credentials."** A credential is anything that opens access: a Wi-Fi password, an MQTT password, or a key. The rule is simple:

1. Node 2 **doesn't need** the Wi-Fi password at all. It only needs the Wi-Fi **name** to find the channel. The Wi-Fi password only lives on Node 1, saved in NVS through the portal (Module 10). The Wi-Fi name itself isn't a credential, because the router broadcasts it to every phone around the house, so `WIFI_NAME` in `node-2-garden.ino` may go to GitHub; in Module 10, the Wi-Fi name was kept in `secrets.h` only because it always comes paired with its password. Just remember that your repository is public: if your Wi-Fi name contains your full name or your home address, anyone can read it on GitHub.
2. A Wi-Fi or MQTT password is **never** sent over ESP-NOW, let alone in a broadcast, which can't be locked and can be picked up by any ESP32 around the house.
3. The ESP-NOW keys only live in `keys.h` on your laptop and inside the two boards: not on GitHub, not in your module notes, and not in screenshots you share.

> ➡️ **Time to practice!** Concept 10 is enough for [Practice 8 — ESP-NOW encryption](#practice-8--esp-now-encryption-30-minutes).

---

## 🔧 Step-by-step practice

Eight practices, **in order**. The practices with a ⭐ in their 🖥️ box are part of the completion requirements.

> [!IMPORTANT]
> **This week, the Node 1 board changes programs several times.** From the Quick Win until Practice 2, the Node 1 board runs practice sketches (Practice 2 doesn't upload anything to Node 1). Practice 3 uploads **Node 1 v1.3.0**, the firmware used from then on. Practice 7 borrows the Node 1 board for a while for the current-meter sketch, then v1.3.0 is uploaded again. While the Node 1 board runs another sketch, the dashboard shows Node 1 as `offline`; that's normal. The Wi-Fi name and password saved on the Node 1 board aren't lost as long as **Erase All Flash Before Sketch Upload** stays **Disabled**.

### Practice 1 — The router's channel and scanning for the Wi-Fi name (40 minutes)

> 🖥️ **Tools:** **Arduino IDE** with two windows, the Node 1 board and the Node 2 board plugged into the laptop, and `notes-module14.md`. Concepts used: 1–3.
>
> 🖥️ **Wokwi path:** step 1.3 can be tried in Wokwi with `WIFI_NAME` set to `"Wokwi-GUEST"`, the name of Wokwi's simulated Wi-Fi. Its result is below step 1.3. Remember two limits of Wokwi: the `sent, got an ACK` report there is fake (there's no receiver), and deep sleep in Wokwi ends in a restart, so RTC memory is always empty.

#### 1.1 The Node 1 board connects to the home Wi-Fi

1. In the Node 1 board's Arduino IDE window, open **File → New Sketch**, delete its contents, then paste this code. Save it as `module14_home_receiver` in the `module-14` folder.

   ```cpp
   // Module 14 - Practice 1, the RECEIVER board (the Node 1 board): connected to the home WiFi like Node 1,
   // while still listening for ESP-NOW packets. Its radio channel is now SET BY THE ROUTER.
   // There is no password in this sketch: WiFi.begin() with nothing inside uses the WiFi saved on the board
   // since the WiFi portal of Module 10 (Node 1 keeps it in NVS).
   // Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>
   #include <esp_mac.h>

   struct Parcel {
     uint8_t mac[6];
     int8_t rssi;
     uint8_t channel;  // the channel this packet was received on
     int length;
     char content[64];
   };

   QueueHandle_t mailbox;
   unsigned long packetCount = 0;

   void onReceived(const esp_now_recv_info_t *info, const uint8_t *data, int length) {
     Parcel p;
     memcpy(p.mac, info->src_addr, 6);
     p.rssi = info->rx_ctrl->rssi;
     p.channel = info->rx_ctrl->channel;
     p.length = length;
     int copyLength = length < 63 ? length : 63;
     memcpy(p.content, data, copyLength);
     p.content[copyLength] = '\0';
     xQueueSend(mailbox, &p, 0);
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     mailbox = xQueueCreate(8, sizeof(Parcel));
     WiFi.setSleep(false);  // the radio always listens (no modem sleep); set BEFORE WiFi.mode()
     WiFi.mode(WIFI_STA);

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     Serial.println();
     Serial.printf("This board's MAC: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

     WiFi.begin();  // no name and no password: use the WiFi saved on this board
     Serial.print("Connecting to the saved home WiFi");
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
       delay(500);
       Serial.print(".");
     }
     Serial.println();
     if (WiFi.status() == WL_CONNECTED) {
       Serial.printf("Connected to \"%s\". The router uses channel %d.\n", WiFi.SSID().c_str(), WiFi.channel());
     } else {
       Serial.println("Not connected yet. No saved WiFi yet? Upload Node 1 v1.2.1 again, fill in the WiFi portal");
       Serial.println("(Module 10), then upload this sketch again. Meanwhile the radio stays on channel 1.");
     }

     if (esp_now_init() != ESP_OK) {
       Serial.println("ESP-NOW failed to start. Press the EN button to try again.");
       return;
     }
     esp_now_register_recv_cb(onReceived);
     Serial.printf("Waiting for ESP-NOW packets on channel %d...\n", WiFi.channel());
   }

   void loop() {
     Parcel p;
     while (xQueueReceive(mailbox, &p, 0) == pdTRUE) {
       packetCount++;
       Serial.printf("Packet #%lu from %02X:%02X:%02X:%02X:%02X:%02X on channel %u, signal %d dBm: \"%s\"\n", packetCount,
                     p.mac[0], p.mac[1], p.mac[2], p.mac[3], p.mac[4], p.mac[5], p.channel, p.rssi, p.content);
     }
   }
   ```

2. In this new window, choose **DOIT ESP32 DEVKIT V1** and the **Node 1** board's port (a new window doesn't necessarily remember the other window's choices), click **Upload**, then open its Serial Monitor. If you missed the `This board's MAC` line, press **EN** on the Node 1 board. You can close the `module14_receiver` window from the Quick Win so that you don't mix up Node 1's Serial Monitors.

   **Expected output** (example; your Wi-Fi name and channel may be different):

   ```text
   This board's MAC: A4:CF:12:E5:B7:C0
   Connecting to the saved home WiFi....
   Connected to "OurHome". The router uses channel 6.
   Waiting for ESP-NOW packets on channel 6...
   ```

3. Write that channel number in `notes-module14.md`. If you see `Not connected yet…`, follow the instructions on the screen: the Node 1 board hasn't saved a Wi-Fi name and password yet (for example after the `wifi forget` command).

#### 1.2 The Quick Win sender now fails

Look at the Serial Monitor of **Node 2**: that board is still running `module14_sender` from the Quick Win. As soon as the Node 1 board moves to the router's channel, its report changes (example):

```text
#58 FAILED: no ACK (receiver off, too far away, or on a different channel).
#59 FAILED: no ACK (receiver off, too far away, or on a different channel).
```

The Node 2 board is still sending on channel 1, while the Node 1 board is now listening on channel 6. Does your router happen to be on channel 1? Then the sends still work; just carry on, but imagine what would happen if the router moved to another channel one day.

#### 1.3 Node 2 finds the channel by itself

1. In the Node 2 board's window, open **File → New Sketch**, delete its contents, paste this code, then save it as `module14_find_channel` in the `module-14` folder.

   ```cpp
   // Module 14 - Practice 1, the SENDER board (the Node 2 board): finds the router's channel by scanning for the home WiFi's NAME,
   // keeps it in RTC memory, then wakes, sends, and sleeps every 10 seconds.
   // Node 2 does NOT need the WiFi password: the WiFi name is enough, only to learn which channel the router (and Node 1) uses.
   // Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>

   // REPLACE these two lines:
   const uint8_t MAC_RECEIVER[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // the Node 1 board's MAC
   const char WIFI_NAME[] = "YourHomeWiFiName";                              // the home WiFi's name (SSID), exactly

   const int FAILS_BEFORE_SCAN = 2;    // after 2 failed wakes in a row, find the channel again
   const uint64_t SLEEP_SECONDS = 10;  // short so you see results quickly; the real Node 2 uses 300 seconds

   // RTC memory: survives deep sleep, lost when the board is unplugged or the EN button is pressed (Module 9).
   RTC_DATA_ATTR uint8_t channel = 0;  // 0 = not known yet
   RTC_DATA_ATTR uint8_t failStreak = 0;
   RTC_DATA_ATTR uint32_t number = 0;

   volatile bool sendDone = false;
   volatile bool gotAck = false;

   void onSent(const esp_now_send_info_t *info, esp_now_send_status_t status) {
     gotAck = (status == ESP_NOW_SEND_SUCCESS);
     sendDone = true;
   }

   // Scans for one WiFi name only. The result is that router's channel, or 0 if it isn't found.
   uint8_t findChannel() {
     unsigned long start = millis();
     int count = WiFi.scanNetworks(false, false, false, 120, 0, WIFI_NAME);
     uint8_t result = 0;
     for (int i = 0; i < count; i++) {
       if (WiFi.SSID(i) == WIFI_NAME) {
         result = WiFi.channel(i);
         break;
       }
     }
     WiFi.scanDelete();
     if (result != 0) {
       Serial.printf("Scanning \"%s\": found on channel %u (%lu ms).\n", WIFI_NAME, result, millis() - start);
     } else {
       Serial.printf("Scanning \"%s\": not found (%lu ms).\n", WIFI_NAME, millis() - start);
     }
     return result;
   }

   bool sendGreeting() {
     if (WiFi.setChannel(channel) != ESP_OK) {
       Serial.printf("Channel %u refused by the ESP32. Is the router on channel 12 or 13? Change the router to 1, 6, or 11.\n", channel);
       return false;
     }
     if (esp_now_init() != ESP_OK) {
       return false;
     }
     esp_now_register_send_cb(onSent);
     esp_now_peer_info_t peer = {};
     memcpy(peer.peer_addr, MAC_RECEIVER, 6);
     peer.channel = 0;  // 0 = the radio's current channel (the one just set)
     peer.ifidx = WIFI_IF_STA;
     peer.encrypt = false;
     if (esp_now_add_peer(&peer) != ESP_OK) {
       return false;
     }
     char content[32];
     snprintf(content, sizeof(content), "hello from the garden #%lu", (unsigned long)number);
     sendDone = false;
     if (esp_now_send(MAC_RECEIVER, (const uint8_t *)content, strlen(content) + 1) != ESP_OK) {
       return false;
     }
     unsigned long start = millis();
     while (!sendDone && millis() - start < 200) {  // never wait forever: Node 2 must still be able to sleep
       delay(1);
     }
     return sendDone && gotAck;
   }

   void setup() {
     Serial.begin(115200);
     delay(200);
     number++;
     WiFi.persistent(false);  // WiFi settings in RAM only: the flash memory isn't written on every wake
     WiFi.mode(WIFI_STA);     // the radio is on, WITHOUT WiFi.begin(): Node 2 never connects to the router

     if (channel == 0 || failStreak >= FAILS_BEFORE_SCAN) {
       uint8_t found = findChannel();
       if (found != 0) {
         channel = found;  // nothing found (router off)? The old channel is kept: Node 1 is still waiting there
       }
       failStreak = 0;
     } else {
       Serial.printf("Channel %u taken from RTC memory, without scanning.\n", channel);
     }

     bool success = (channel != 0) && sendGreeting();
     failStreak = success ? 0 : failStreak + 1;
     Serial.printf("Wake #%lu: %s on channel %u (failures in a row: %u). Awake %lu ms, sleeping %lu seconds.\n",
                   (unsigned long)number, success ? "sent, got an ACK" : "FAILED", channel, failStreak, millis(),
                   (unsigned long)SLEEP_SECONDS);
     Serial.flush();

     esp_now_deinit();
     WiFi.mode(WIFI_OFF);  // turn the radio off before sleeping
     esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Never runs: on every wake from deep sleep, the board starts again from setup().
   }
   ```

2. Fill in the two lines marked `REPLACE`: `MAC_RECEIVER` with the Node 1 board's MAC address from the Quick Win, and `WIFI_NAME` with your home Wi-Fi's name, **exactly**, down to capital and small letters, as it appears on your phone (Module 10). The password isn't needed.
3. In this new window, choose **DOIT ESP32 DEVKIT V1** and the **Node 2** board's port, click **Upload**, then open its Serial Monitor. You can close the `module14_sender` window now. Between the reports, the Serial Monitor also shows the lines `ets …` and `rst:0x5 (DEEPSLEEP_RESET)` every time the board wakes up; that's normal (Module 9).

   **Expected output** in Node 2's Serial Monitor (example):

   ```text
   Scanning "OurHome": found on channel 6 (2231 ms).
   Wake #1: sent, got an ACK on channel 6 (failures in a row: 0). Awake 2466 ms, sleeping 10 seconds.
   Channel 6 taken from RTC memory, without scanning.
   Wake #2: sent, got an ACK on channel 6 (failures in a row: 0). Awake 232 ms, sleeping 10 seconds.
   ```

   In Node 1's Serial Monitor (example):

   ```text
   Packet #1 from 24:6F:28:B1:C7:D4 on channel 6, signal -44 dBm: "hello from the garden #1"
   Packet #2 from 24:6F:28:B1:C7:D4 on channel 6, signal -45 dBm: "hello from the garden #2"
   ```

   Compare how long the first and the second wake take: scanning uses up more than two seconds with the radio on, and the next wake needs only a tenth of that, because the channel is taken from RTC memory.

   **Wokwi path** (`WIFI_NAME` = `"Wokwi-GUEST"`, real output from the simulator, October 2026):

   ```text
   Scanning "Wokwi-GUEST": found on channel 6 (2224 ms).
   Wake #1: sent, got an ACK on channel 6 (failures in a row: 0). Awake 4005 ms, sleeping 10 seconds.
   ```

   The scan is real: `Wokwi-GUEST` really is on channel 6. The `sent, got an ACK` report is fake, and after "sleeping", Wokwi restarts the board (`rst:0x8 (TG1WDT_SYS_RESET)`), so RTC memory is always empty and every "wake" scans again. The line `E (…) phy_init: … calibration data MAC check failed …` that appears after that restart is also a quirk of the simulator; ignore it. Carry on by reading 1.4 and 1.5.

#### 1.4 Fail twice, then scan again

1. Unplug the USB cable of the **Node 1** board. Node 2 keeps waking up every 10 seconds (example):

   ```text
   Channel 6 taken from RTC memory, without scanning.
   Wake #7: FAILED on channel 6 (failures in a row: 1). Awake 434 ms, sleeping 10 seconds.
   Channel 6 taken from RTC memory, without scanning.
   Wake #8: FAILED on channel 6 (failures in a row: 2). Awake 433 ms, sleeping 10 seconds.
   Scanning "OurHome": found on channel 6 (2229 ms).
   Wake #9: FAILED on channel 6 (failures in a row: 1). Awake 2662 ms, sleeping 10 seconds.
   ```

   After two failed wakes, Node 2 scans again to make sure the router hasn't moved to another channel. The router is still on channel 6, so the channel stays the same.
2. Plug the Node 1 board back in. As soon as that board is connected to the Wi-Fi (a few seconds), Node 2 prints `sent, got an ACK` again.

#### 1.5 Lock the router's channel (recommended)

A router whose channel is on **Auto** may move to another channel every time it restarts, and Node 2 can't use a router on channel 12 or 13 at all (Concept 3). If the router is your own:

1. Open the router's settings page from a browser. Its address is usually written on a sticker under the router, for example `192.168.1.1`. Log in with the router's admin name and password (yours; don't write them in your module notes).
2. Look for the 2.4 GHz Wi-Fi menu (its name differs from brand to brand, for example **Wireless**, **WLAN**, or **WiFi Settings**), then look for the **Channel** option.
3. Replace **Auto** with **1**, **6**, or **11**; the easiest is to choose the channel in use now (from step 1.1) if it's one of those three. Save. The router usually drops the Wi-Fi for a moment.
4. Press **EN** on the Node 1 board, then make sure its Serial Monitor shows the channel you just chose. If the channel changed, Node 2 will find it by itself after two failed wakes (step 1.4).

**Can't open the router's settings** (the router belongs to your internet provider, or it isn't yours)? Leave it on **Auto**. As a result, every time the router restarts and moves to another channel, Node 2 loses about two packets before it looks for the channel again. Only if the router is on channel **12 or 13** and can't be changed is Node 2 really unusable in that home. Ask the router's owner for help.

> ⬆️ **Done with Practice 1?** Go back to [Concept 4](#4-wake-briefly-sleep-long-node-2s-wake-sequence).

### Practice 2 — Node 2's sensors and the 33-byte packet (60 minutes)

> 🖥️ **Tools:** **Arduino IDE** (the Node 2 board's window), the Node 2 board with the mini breadboard from Module 9 (the VIN and GND wires to the battery circuit **removed**; the USB cable unplugged while you connect the wires, and only plugged in again in 2.7), the BME280, the DS18B20 with its adapter module, the second soil sensor, a glass of water, jumper wires (6 male–female, 2 female–female, 1 male–male; the DS18B20's DAT wire from Module 9 stays in use), and tape labeled **3V3**. Concepts used: 4–5.
>
> 🖥️ **Wokwi path:** open a new ESP32 project in Wokwi. In the **`diagram.json`** tab, replace its whole content with the content of [`code/module14_garden_sensors/diagram.json`](code/module14_garden_sensors/diagram.json) (open the file on GitHub, click the **Copy raw file** icon, then paste). The circuit: the DS18B20 on D27, and a potentiometer as the soil sensor, with its VCC pin connected to **D32**. Wokwi has no BME280, so its readings will be printed as `nan`. Skip steps 2.1–2.5 and the calibration step with water; start from 2.6: paste the code into the `sketch.ino` tab, create the file `node2-packet.h`, add the three libraries, then click **▶** to start the simulation. Its result is at the end of 2.8.

#### 2.1 Prepare the Node 2 board

1. Unplug the Node 2 board's USB from the laptop (if it's still plugged in since Practice 1), then make sure its VIN and GND wires are **not** connected to the mini breadboard (safety rule 1). All the wires in 2.2–2.5 are connected while the Node 2 board has no power, following the safety rule of Module 5: before you change any wiring, unplug the power. The top rail still carries 5.0 V as long as the battery is in its holder, so during Practice 2 don't plug anything into the top rail. The USB is only plugged in again in 2.7.
2. The DS18B20 from Module 9 is still connected with female–female wires directly to the board's 3V3, GND, and D27 pins. The bottom rail needs those 3V3 and GND pins in step 2.2, but one pin only fits one female end. So unplug the DS18B20's **VCC** (orange) and **GND** (black) wires now, both from the board's pins and from its adapter module, and set them aside; step 2.4 replaces them with male–female wires. The **DAT** wire (purple) stays on D27.

All the connections of steps 2.2–2.5 are in the picture and the table below. The picture shows how things look at the end of Practice 2, once the USB has been plugged in again in 2.7; while you connect the wires, the USB stays unplugged. The Node 2 board is still **not plugged into** the breadboard, as in Module 9. From the mini breadboard, we only use the **bottom rail**, as the 3.3 V and GND lines for the sensors.

![Illustration of the Node 2 circuit on the mini breadboard after Practice 2, with four numbered markers. The upper half and the top rail hold Module 9's battery circuit, drawn faded: the 18650 holder, the TP4056, the MT3608, and the capacitor; the top rail plus is labeled 5.0 V. The Node 2 board stands to the right of the breadboard, not plugged into it, with its USB plugged into the laptop; red crosses on the VIN and GND pins of the left row mean their wires to the top rail are unplugged. The new parts are drawn bright. Marker 1: the bottom rail plus gets a 3V3 sticker and is connected with an orange wire from the board's 3V3 pin (right row, at the very bottom) to column 29; the bottom rail minus is connected with a black wire from the GND pin above it to column 28; both wires run past the right side of the board, down, then come in from below. Marker 2, the BME280 below the breadboard: VIN, an orange wire to the bottom rail plus at column 15, GND, a black wire to the bottom rail minus at column 16, and SCL, a yellow wire, and SDA, a blue wire, which loop around the bottom and the right side to the D22 and D21 pins, crossing once near the board. Marker 3, the DS18B20 adapter module on the far right: VCC, an orange wire to the bottom rail plus at column 24, GND, a black wire to the bottom rail minus at column 27, and DAT, a purple wire to the D27 pin; its metal tip hangs down, to be buried in the soil later. Marker 4, the second soil sensor between the BME280 and the DS18B20: a red VCC wire runs over the lower half of the breadboard to the D32 pin, a green AOUT wire to the VN pin, the two crossing once, and a black GND wire to the bottom rail minus at column 21. Red caption at the bottom: top rail plus 5.0 V, bottom rail plus 3.3 V, don't mix them up; the soil sensor gets its power from D32, not from 3V3. Below it, two gray notes: the purple, red, and green wires only run over the breadboard, none of them is plugged into its holes; the soil sensor's wire colors may be different, so follow the labels on the sensor board.](assets/node2-circuit.png)

| Step | From | To | Wire |
| :---: | :--- | :--- | :--- |
| 2.2 | the board's **3V3** pin (right row, at the very bottom) | bottom rail (+) column 29 | male–female, orange |
| 2.2 | the board's **GND** pin (right row, just above 3V3) | bottom rail (−) column 28 | male–female, black |
| 2.3 | BME280 **VIN** | bottom rail (+) column 15 | male–female, orange |
| 2.3 | BME280 **GND** | bottom rail (−) column 16 | male–female, black |
| 2.3 | BME280 **SCL** | the board's **D22** pin | female–female, yellow |
| 2.3 | BME280 **SDA** | the board's **D21** pin | female–female, blue |
| 2.4 | DS18B20 adapter **VCC** | bottom rail (+) column 24 | male–female, orange |
| 2.4 | DS18B20 adapter **GND** | bottom rail (−) column 27 | male–female, black |
| 2.4 | DS18B20 adapter **DAT** | the board's **D27** pin (unchanged) | female–female, purple |
| 2.5 | soil sensor **VCC** (the end of its wire) | the board's **D32** pin, directly | — |
| 2.5 | soil sensor **AOUT** (the end of its wire) | the board's **VN** pin, directly | — |
| 2.5 | soil sensor **GND** (the end of its wire) | bottom rail (−) column 21 | male–male, black |

#### 2.2 The bottom rail becomes the 3.3 V line

1. Stick the tape labeled **3V3** next to the bottom rail (+). The top rail (+) carries 5.0 V from the MT3608; don't mix them up.
2. Connect the board's **3V3** pin (in the right row, at the very bottom, near the USB socket) to the bottom rail (+) at **column 29** with an orange male–female wire: the female end on the board's pin, the male end in the rail's hole.
3. Connect the **GND** pin next to it (right row, just above 3V3) to the bottom rail (−) at **column 28** with a black male–female wire.

#### 2.3 BME280

Connect the BME280's four pins according to **the labels on its module**, not according to the order in the picture, because the pin order differs from manufacturer to manufacturer: **VIN** (sometimes labeled **VCC**) to the bottom rail (+) at column 15, **GND** to the bottom rail (−) at column 16, **SCL** directly to the **D22** pin, and **SDA** directly to the **D21** pin. If your module has six pins, leave the **CSB** and **SDO** pins empty; its address (`0x76` or `0x77`) is already set by the circuit on the module, and the sketch tries both.

#### 2.4 The DS18B20 moves to the bottom rail

The board's 3V3 pin now powers the bottom rail, so the DS18B20 takes its power from there too. Its old **VCC** and **GND** wires were already unplugged in 2.1. Connect two new male–female wires to its adapter module: **VCC** to the bottom rail (+) at column 24, **GND** to the bottom rail (−) at column 27. The **DAT** wire stays on the **D27** pin.

#### 2.5 The second soil sensor: power from D32

1. Plug the sensor's own cable into its three-pin socket (if it isn't already). Follow **the labels on the sensor board** (GND, VCC, AOUT), not the wire colors, as in Module 6.
2. Plug the end of the wire from the **VCC** pin directly onto the board's **D32** pin, and the end of the wire from the **AOUT** pin directly onto the **VN** pin.
3. Push one black male–male jumper into the end of the wire from the **GND** pin, then push its other end into the bottom rail (−) at **column 21**.

**Don't** connect the soil sensor's VCC to 3V3 as on Node 1. On Node 1 that's no problem, because Node 1 runs from a charger; on Node 2, a sensor that's always on cuts the battery life in half (Concepts 4 and 9).

#### 2.6 The Node 2 sensor sketch

1. In the Node 2 board's window, open **File → New Sketch**, delete its contents, then paste this code. Save it as `module14_garden_sensors` in the `module-14` folder.

   ```cpp
   // Module 14 - Practice 2: the sensors of Node 2 "Garden" are read in a power-saving order, then packed into a 33-byte packet.
   // No radio and no sleep yet: every 5 seconds one "fake wake", its results printed so you can check them.
   // Circuit (PIN-MAP version 5): BME280 SDA -> D21, SCL -> D22; DS18B20 DAT -> D27; second soil sensor AOUT -> VN (GPIO 39),
   // VCC -> D32 (NOT 3V3), GND -> GND. The BME280 and DS18B20 get 3.3 V from the mini breadboard's bottom rail (+).
   // Libraries: Adafruit BME280 Library 2.3.0 (installed with it: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
   // OneWire 2.3.8, DallasTemperature 4.0.6.

   #include <Wire.h>
   #include <OneWire.h>
   #include <DallasTemperature.h>
   #include <Adafruit_BME280.h>
   #include "node2-packet.h"

   // ---------- Replace with your own ----------
   const bool CALIBRATION_MODE = false;  // true = only print the second soil sensor's raw values (the calibration step)
   const int SOIL_DRY = 3000;            // raw value in air, measured with power from D32
   const int SOIL_WET = 1300;            // raw value in water

   // ---------- Fixed ----------
   const int PIN_ONE_WIRE = 27;            // DS18B20
   const int PIN_SDA = 21;                 // BME280
   const int PIN_SCL = 22;
   const int PIN_SOIL = 39;                // VN: the second soil sensor's AOUT
   const int PIN_SOIL_POWER = 32;          // D32: the soil sensor's power, on only when needed
   const unsigned long SOIL_SETTLE_MS = 300;  // wait after switching the soil sensor on before reading it
   const uint8_t DS18B20_RESOLUTION = 10;  // 0.25 degrees, 188 ms at most

   OneWire oneWire(PIN_ONE_WIRE);
   DallasTemperature tempSensors(&oneWire);
   Adafruit_BME280 bme;
   uint16_t session = 0;
   uint32_t sequence = 0;

   static bool deviceAt(uint8_t address) {
     Wire.beginTransmission(address);
     return Wire.endTransmission() == 0;
   }

   // BME280 forced mode: measure once, then the sensor goes back to sleep by itself (0.1 uA) until told again.
   static void readBme280(Node2Packet &p) {
     p.temperature = NAN;
     p.humidity = NAN;
     p.pressure = NAN;
     uint8_t address = deviceAt(0x76) ? 0x76 : (deviceAt(0x77) ? 0x77 : 0);
     if (address == 0) {
       Serial.println("BME280 not found at 0x76 or 0x77: check SDA to D21, SCL to D22, VCC, and GND.");
       return;
     }
     if (!bme.begin(address)) {
       Serial.printf("The chip at 0x%02X is not a BME280 (chip ID 0x%02X; 0x58 = BMP280, no humidity).\n", address,
                     (unsigned int)bme.sensorID());
       return;
     }
     bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                     Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
     if (!bme.takeForcedMeasurement()) {
       Serial.println("BME280 did not finish measuring.");
       return;
     }
     p.temperature = bme.readTemperature();
     p.humidity = bme.readHumidity();
     p.pressure = bme.readPressure() / 100.0f;  // the library gives pascals; divided by 100 it becomes hPa
   }

   // Average of 20 readings. An impossible raw value (sensor unplugged or without power) is sent as -1.
   static int8_t readSoil(int &raw) {
     long sum = 0;
     for (int i = 0; i < 20; i++) {
       sum += analogRead(PIN_SOIL);
       delay(2);
     }
     raw = sum / 20;
     if (raw < SOIL_WET - 300 || raw > SOIL_DRY + 300) {
       return -1;
     }
     return constrain(map(raw, SOIL_DRY, SOIL_WET, 0, 100), 0, 100);
   }

   static void calibrate() {
     digitalWrite(PIN_SOIL_POWER, HIGH);
     unsigned long start = millis();
     const unsigned long POINTS[] = {10, 50, 100, 200, 400};
     Serial.print("Raw soil sensor values since switching on:");
     for (unsigned long t : POINTS) {
       while (millis() - start < t) {
         delay(1);
       }
       Serial.printf("  %lu ms: %d", t, analogRead(PIN_SOIL));
     }
     digitalWrite(PIN_SOIL_POWER, LOW);
     Serial.println();
   }

   static void fakeWake() {
     unsigned long t0 = millis();
     digitalWrite(PIN_SOIL_POWER, HIGH);  // 1. the soil sensor is switched on FIRST OF ALL: it needs time to settle

     Node2Packet p = {};
     p.mark = PACKET_MARK;
     p.version = PACKET_VERSION;
     p.fw[0] = 1;
     p.fw[1] = 0;
     p.fw[2] = 0;
     p.session = session;
     p.sequence = ++sequence;
     p.intervalSeconds = 300;
     p.attempt = 1;

     tempSensors.requestTemperatures();  // 2. the DS18B20 starts measuring, without waiting
     unsigned long dsStart = millis();
     readBme280(p);                      // 3. the BME280 is read while the DS18B20 is still measuring
     unsigned long tBme = millis() - t0;
     while (!tempSensors.isConversionComplete() && millis() - dsStart < 800) {  // 4. wait for the DS18B20 to finish
       delay(5);
     }
     float soilTemperature = tempSensors.getTempCByIndex(0);  // -127 if the sensor does not answer
     p.soilTemperature = (soilTemperature == DEVICE_DISCONNECTED_C) ? NAN : soilTemperature;
     unsigned long tDs = millis() - t0;
     while (millis() - t0 < SOIL_SETTLE_MS) {  // 5. has the soil sensor been on long enough?
       delay(1);
     }
     int raw = 0;
     p.soil = readSoil(raw);
     digitalWrite(PIN_SOIL_POWER, LOW);  // 6. the soil sensor is switched off again
     unsigned long tDone = millis() - t0;

     Serial.printf("Fake wake #%lu: BME280 done %lu ms, DS18B20 %lu ms, soil %lu ms.\n", (unsigned long)sequence,
                   tBme, tDs, tDone);
     Serial.printf("  temperature %.1f C, humidity %.0f %%, pressure %.1f hPa, soil temperature %.2f C, soil %d %% (raw %d)\n",
                   p.temperature, p.humidity, p.pressure, p.soilTemperature, p.soil, raw);
     const uint8_t *b = (const uint8_t *)&p;  // look at the packet byte by byte
     Serial.print("  packet 33 bytes:");
     for (size_t i = 0; i < sizeof(p); i++) {
       Serial.printf(" %02X", b[i]);
     }
     Serial.println();
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_SOIL_POWER, OUTPUT);
     digitalWrite(PIN_SOIL_POWER, LOW);
     Wire.begin(PIN_SDA, PIN_SCL);
     tempSensors.begin();
     tempSensors.setResolution(DS18B20_RESOLUTION);  // the sensor's EEPROM is only written if the resolution differs
     tempSensors.setWaitForConversion(false);        // requestTemperatures() returns at once
     session = (uint16_t)(esp_random() | 1);
     Serial.println();
     Serial.printf("Practice 2: size of Node2Packet = %u bytes. DS18B20 found: %u.\n", (unsigned int)sizeof(Node2Packet),
                   (unsigned int)tempSensors.getDeviceCount());
   }

   void loop() {
     if (CALIBRATION_MODE) {
       calibrate();
       delay(1600);
     } else {
       fakeWake();
       delay(5000);
     }
   }
   ```

2. Create a new tab for the packet's form: click the **⋯** button (three dots) at the right end of the row of tabs, choose **New Tab** (**Ctrl + Shift + N**), type **`node2-packet.h`** complete with its ending, then click **OK**. Paste the content of `node2-packet.h` from [Concept 5](#5-the-33-byte-packet-the-same-form-at-both-ends) into that new tab, then save (**Ctrl + S**). In Wokwi: **▾ → New file...**, name it `node2-packet.h`, then paste its content.
3. The libraries it uses have been installed since Module 7: **Adafruit BME280 Library**, **OneWire**, and **DallasTemperature**. If Arduino IDE says `No such file or directory` for one of them, install it through the **Library Manager** as in Module 7. In Wokwi, add all three through the **Library Manager** tab.

#### 2.7 Calibrate the second soil sensor with power from D32

Node 1's `SOIL_DRY` and `SOIL_WET` values don't apply to the second sensor: every sensor is different (Module 6), and the power from pin D32 is a little below 3.3 V, so the sensor's output shifts too. The calibration is repeated **with the final circuit**.

1. Plug the Node 2 board's USB into the laptop (its VIN and GND wires stay disconnected from the mini breadboard). Change `CALIBRATION_MODE = false` to `CALIBRATION_MODE = true`. In the `module14_garden_sensors` window, choose **DOIT ESP32 DEVKIT V1** and the **Node 2** board's port, click **Upload**, then open its Serial Monitor. If you missed the first line, press **EN** on the Node 2 board.
2. Leave the sensor in the air, dry. **Expected output** (example):

   ```text
   Practice 2: size of Node2Packet = 33 bytes. DS18B20 found: 1.
   Raw soil sensor values since switching on:  10 ms: 2612  50 ms: 2988  100 ms: 3010  200 ms: 3014  400 ms: 3015
   Raw soil sensor values since switching on:  10 ms: 2598  50 ms: 2985  100 ms: 3009  200 ms: 3013  400 ms: 3015
   ```

   Each line is one time the sensor is switched on through D32, read five times, then switched off again. The values **rise first, then settle**: the circuit inside the sensor needs a moment after it gets power. That's why Node 2 switches the soil sensor on first of all and only reads it at least 300 ms later (`SOIL_SETTLE_MS`). **Check your numbers:** if the values in the 200 ms and 400 ms columns still differ by more than 20, note that down too; in Practice 4 you'll raise `SOIL_SETTLE_MS` to `500`.
3. Note the value in the **400 ms** column as the **dry value**.
4. Dip the sensor into the glass of water **up to its limit line** (no further, Module 6). Wait a few lines, then note the value in the 400 ms column as the **wet value**.
5. The difference between the dry value and the wet value should be more than 500, as in Module 6. Less than that? Check the wiring and the chip label on the sensor (🚨).
6. Write both values in `notes-module14.md`, then fill them into `SOIL_DRY` and `SOIL_WET` in the sketch. Dry the sensor.

#### 2.8 Fake wakes and the 33-byte packet

1. Change `CALIBRATION_MODE = true` back to `CALIBRATION_MODE = false`, upload again, then open the Serial Monitor. The first line (`Practice 2: size of Node2Packet …`) is only printed once, when the board powers up; if you missed it, press **EN** on the Node 2 board.

   **Expected output** (example; every 5 seconds):

   ```text
   Practice 2: size of Node2Packet = 33 bytes. DS18B20 found: 1.
   Fake wake #1: BME280 done 121 ms, DS18B20 191 ms, soil 341 ms.
     temperature 29.4 C, humidity 78 %, pressure 1008.6 hPa, soil temperature 27.25 C, soil 41 % (raw 2303)
     packet 33 bytes: 52 01 01 00 00 3F 5A 01 00 00 00 2C 01 01 A4 70 EB 41 71 3D 9C 42 7B 24 7C 44 00 00 DA 41 29 00 00
   ```

   The first line confirms that the form's size is exactly 33 bytes. The `Fake wake` line shows the order of Concept 4: the BME280 finishes at about 120 ms, the DS18B20 at about 190 ms (10 bits), and the soil sensor is read after 300 ms, then switched off. The soil temperature is printed in steps of 0.25 °C (`27.25`), the sign of a 10-bit resolution.
2. Compare your packet with the [packet map in Concept 5](#5-the-33-byte-packet-the-same-form-at-both-ends): byte 0 is `52` (the mark), bytes 11 and 12 are `2C 01` (300 seconds), and byte 30 is your soil percentage in hexadecimal (`29` = 2 × 16 + 9 = 41, the way of counting from Module 7).
3. Try two failures, so that you'll recognize them later. As in the failure tests of Module 6, first unplug the Node 2 board's USB every time you unplug or connect a wire, then plug it back in. The Serial Monitor usually reconnects by itself; if it doesn't, choose its port again in the top bar of Arduino IDE, as in Module 8. First, unplug the BME280's **SDA** wire (the line `BME280 not found…`, then `temperature nan`, and three groups of `00 00 C0 7F` in the packet). Second, also unplug the end of the soil sensor's **VCC** wire from the D32 pin (the sensor has no power, so its raw value is close to 0: `soil -1 %` and the byte `FF`). Finally, connect both again.

**Wokwi path** (real output from the simulator, October 2026; in Wokwi, a potentiometer stands in for the soil sensor):

```text
Practice 2: size of Node2Packet = 33 bytes. DS18B20 found: 1.
BME280 not found at 0x76 or 0x77: check SDA to D21, SCL to D22, VCC, and GND.
Fake wake #1: BME280 done 3 ms, DS18B20 224 ms, soil 340 ms.
  temperature nan C, humidity nan %, pressure nan hPa, soil temperature 27.00 C, soil 55 % (raw 2050)
  packet 33 bytes: 52 01 01 00 00 D1 D2 01 00 00 00 2C 01 01 00 00 C0 7F 00 00 C0 7F 00 00 C0 7F 00 00 D8 41 37 00 00
…
Fake wake #4: BME280 done 3 ms, DS18B20 224 ms, soil 340 ms.
  temperature nan C, humidity nan %, pressure nan hPa, soil temperature 27.00 C, soil -1 % (raw 4095)
  packet 33 bytes: 52 01 01 00 00 D1 D2 04 00 00 00 2C 01 01 00 00 C0 7F 00 00 C0 7F 00 00 C0 7F 00 00 D8 41 FF 00 00
```

Wokwi has no BME280, so its three fields hold `NAN` (`00 00 C0 7F`). The simulated DS18B20 is set to 27.1 °C, but it's printed as `27.00`: a 10-bit resolution only has steps of 0.25. The potentiometer in the middle gives a raw value of about `2050`, which is 55% (`37` in hexadecimal). Fake wake #4 happened after the potentiometer had been turned all the way: the raw value `4095` is outside the calibration range, so it's sent as `-1` (`FF`). Try it yourself by clicking the potentiometer and dragging its knob.

> ⬆️ **Done with Practice 2?** Go back to [Concept 6](#6-callbacks-the-esp32-3x-way-drop-it-in-the-mailbox-process-it-in-loop).

### Practice 3 — Node 1 v1.3.0: the ESP-NOW to MQTT bridge (40 minutes)

> 🖥️ **Tools:** **Arduino IDE** with `node-1-home.ino` from the `mini-smart-home` repository, the Node 1 board (USB to the laptop), a browser to open the curriculum files on GitHub, and `notes-module14.md`. Concepts used: 6–7.
>
> ⭐ **Required** — the Module 14 completion requirement asks for Node 2's data to show up in Node-RED, and the way there goes through Node 1.
>
> 🖥️ **Wokwi path:** make all the changes in your Wokwi Node 1 project (Modules 11–13). The changes for `node-1-home.ino` (step 3.5) are made in the `sketch.ino` tab, and `USE_WOKWI` in `config.h` stays `true`, as it has since Module 11. In Wokwi mode, Node 1's `loop()` drops a **mock Node 2** packet into the same mailbox every 30 seconds, because there's no real Node 2 in Wokwi; the rest of the bridge works exactly the same and publishes it to `broker.emqx.io`. Replace the last three pairs of `MAC_NODE2` with numbers of your own choice, like `macAddress` in Module 11, so that your mock Node 2's topics don't clash with someone else's on the public broker.

Node 1 v1.3.0 = v1.2.1 + **three new files** + **small changes in five files**. As in Modules 10–11, the new files are copied whole from the curriculum, and you type the small changes yourself.

| File | Change | How |
| :--- | :--- | :--- |
| `node2-packet.h` | **new**: the 33-byte packet form (Concept 5) | copy it from the curriculum (step 3.1) |
| `bridge.h` / `.cpp` | **new**: the mailbox, the holding shelf, `ts`, Node 2's status, the `node2` command (Concepts 6–7) | copy them from the curriculum (step 3.1) |
| `config.h` | version `1.3.0`, `MAC_NODE2`, the holding shelf's size | type (step 3.2) |
| `networking.h` / `.cpp` | `setSleep(false)`, `setAutoReconnect(false)`, the router's channel, two functions for the bridge | type (steps 3.3–3.4) |
| `node-1-home.ino` | calls `setupBridge()` and `updateBridge()` | type (step 3.5) |
| `commands.cpp` | the Serial commands `node2` and `node2 reset` | type (step 3.6) |

> 📝 **Note for the English edition:** before 19 October 2026, Node 1's `networking.h` and `networking.cpp` were called `network.h` and `network.cpp`. If your tabs still have the old names, rename them before you start, as the note in [Module 10, step B](../module-10-wifi-and-http/README.md#b-create-two-new-files-and-change-configh) explains: the new `bridge.cpp` of this practice includes `networking.h`.

#### 3.1 Three new files

1. In Arduino IDE, open **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home** → `node-1-home.ino`. The Node 1 sketch opens with all its tabs.
2. Create three new tabs (**⋯ → New Tab**, type the name complete with its ending, then click **OK**; in Wokwi: **▾ → New file...**): **`node2-packet.h`**, **`bridge.h`**, and **`bridge.cpp`**.
3. Fill each one the same way: right-click the file's name below → **Open link in new tab**, click the **Copy raw file** icon, go back to Arduino IDE, then paste (**Ctrl + V**).
   - [`code/node-1-home/node2-packet.h`](code/node-1-home/node2-packet.h) (exactly the same as the content in Concept 5)
   - [`code/node-1-home/bridge.h`](code/node-1-home/bridge.h)
   - [`code/node-1-home/bridge.cpp`](code/node-1-home/bridge.cpp)
4. Take five minutes to read `bridge.cpp`. Its comments follow Concepts 6–7: `onEspNowReceive()` only copies 33-byte packets that aren't broadcasts into the mailbox, `acceptPacket()` checks and counts, `buildNode2Json()` builds the JSON along with the `ts` that's set back, and `publishShelf()` publishes at most three readings per pass. The `mockNode2()` function only works in Wokwi mode.

#### 3.2 `config.h`

1. Change its version number:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.2.1";
   ```

   to:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.3.0";
   ```

2. At the **very bottom** of the file, after the `VITALS_INTERVAL` line, add:

   ```cpp

   // ---------- Module 14: ESP-NOW bridge for Node 2 "Garden" ----------
   // Node 2's WiFi MAC address, printed by Node 2 when it first powers up. ESP-NOW packets from other addresses are rejected.
   const uint8_t MAC_NODE2[6] = {0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4};  // REPLACE with your Node 2's MAC
   const int NODE2_SHELF_SIZE = 96;  // holding shelf: Node 2 readings kept while the broker is unreachable (8 hours at a 5-minute interval)
   const unsigned long NODE2_OFFLINE_MARGIN = 60000;  // Node 2 is "offline" after 3 x its interval + 1 minute
   ```

3. Replace what's inside the curly braces of `MAC_NODE2` with the Node 2 board's MAC address from `notes-module14.md` (Quick Win step 3), written two digits at a time with `0x` in front, for example `24:6F:28:B1:C7:D4` becomes `{0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4}`.

#### 3.3 `networking.h`

At the very bottom, after the line `void forgetWiFi();`, add two lines:

```cpp
bool mqttReady();                    // Module 14: true when WiFi and MQTT are both connected
bool publishTo(const char* topic, const char* content, bool retained);  // Module 14: publish on behalf of Node 2
```

#### 3.4 `networking.cpp` (seven small changes)

1. **Remembering the router's channel.** Find the line:

   ```cpp
   static unsigned long lastGuardTime = 0;
   ```

   then add **below it**:

   ```cpp
   static uint8_t routerChannel = 0;  // Module 14: the router's channel at the last connection; ESP-NOW follows this channel
   ```

2. **The radio doesn't sleep and doesn't reconnect by itself.** In the `setupNetwork()` function, find the line `WiFi.setHostname(DEVICE_NAME);`, then insert these three lines **between** that line and the line `WiFi.mode(WIFI_STA);`:

   ```cpp
     WiFi.setSleep(false);           // Module 14: the radio always listens for ESP-NOW (set BEFORE WiFi.mode)
     WiFi.setAutoReconnect(false);   // Module 14: when the router is off, the esp32 package doesn't scan nonstop;
                                     // only the 60-second guard in guardConnection() tries again
   ```

   The order matters: both are set **before** `WiFi.mode(WIFI_STA)` so that they apply from the moment the radio first turns on.
3. **The guard puts the channel back.** Above the `guardConnection()` function, below the comment line `// The guard (Module 10, Concept 4): …`, add one comment line:

   ```cpp
   // Since v1.3.0 (Module 14) this guard is the only one that orders a reconnect: setAutoReconnect(false).
   ```

   Then, inside that function, insert this block right **after** the line `unsigned long now = millis();` and **before** the line `if (now - lastEvent >= NO_ATTEMPT_TIMEOUT`:

   ```cpp
     // Module 14: 3 seconds without a WiFi event and 3 seconds after the guard's attempt = the radio isn't scanning.
     // Put the radio back on the router's channel so that Node 2's ESP-NOW packets are still heard while the router is off.
     if (routerChannel != 0 && now - lastEvent >= 3000 && now - lastGuardTime >= 3000
         && WiFi.channel() != routerChannel) {
       WiFi.setChannel(routerChannel);
     }
   ```

   The "3 seconds without an event" condition makes sure the radio isn't scanning: `WiFi.setChannel()` must not be called in the middle of a scan.
4. **An honest disconnect message.** In the `updateNetwork()` function, replace:

   ```cpp
         logError("WiFi DISCONNECTED (reason %u: %s). Node 1 keeps working; the esp32 package is trying to reconnect.", disconnectReason,
                  reasonName(disconnectReason));
   ```

   with:

   ```cpp
         logError("WiFi DISCONNECTED (reason %u: %s). Node 1 keeps working and retries every %lu seconds.", disconnectReason,
                  reasonName(disconnectReason), NO_ATTEMPT_TIMEOUT / 1000);
   ```

5. **Remember the channel when connected.** Still in `updateNetwork()`, find the line `connected = true;` (inside `if (gotIpFlag)`), then add **below it**:

   ```cpp
         routerChannel = WiFi.channel();  // Module 14: remembered for ESP-NOW
   ```

   Then, a few lines further down, replace the first "connected" log:

   ```cpp
           logInfo("WiFi connected to \"%s\": IP %s, signal %d dBm", WiFi.SSID().c_str(),
                   WiFi.localIP().toString().c_str(), WiFi.RSSI());
   ```

   with:

   ```cpp
           logInfo("WiFi connected to \"%s\": IP %s, signal %d dBm, channel %u", WiFi.SSID().c_str(),
                   WiFi.localIP().toString().c_str(), WiFi.RSSI(), routerChannel);
   ```

6. **The `wifi` command mentions the channel.** In the `printNetworkInfo()` function, below the line that prints `wifi: device_id %s, name %s, time %s`, add:

   ```cpp
     Serial.printf("wifi: radio channel %ld, router channel %u (0 = never connected)\n", (long)WiFi.channel(),
                   routerChannel);  // Module 14
   ```

7. **Two functions for the bridge.** At the **very bottom** of the file, after the `forgetWiFi()` function, add:

   ```cpp

   // ---------- Module 14: used by the Node 2 bridge (bridge.cpp) ----------
   bool mqttReady() {
     return connected && mqtt.connected();
   }

   bool publishTo(const char* topic, const char* content, bool retained) {
     if (!mqttReady()) {
       return false;
     }
     return mqtt.publish(topic, content, retained);
   }
   ```

   `bridge.cpp` doesn't touch the `mqtt` object directly. It asks `networking.cpp` for help through these two functions, following the division of jobs between the files that we've had since Module 8.

#### 3.5 `node-1-home.ino`

1. Replace the first line:

   ```cpp
   // Node 1 "Home" - firmware v1.2.1 (Module 12: the broker moves to the Raspberry Pi gateway)
   ```

   with:

   ```cpp
   // Node 1 "Home" - firmware v1.3.0 (Module 14: the ESP-NOW bridge for Node 2 "Garden")
   ```

   Then, above the line `// New in v1.2.0: …`, insert these three lines:

   ```cpp
   // New in v1.3.0: Node 1 listens for ESP-NOW packets from Node 2 "Garden" and publishes them to the broker on behalf of
   // Node 2 (msh/<device_id Node 2>/telemetry and /status), including readings held back while the router was off.
   // The radio no longer sleeps (setSleep false) and doesn't reconnect by itself: the 60-second guard retries.
   ```

   In the line with the list of commands, replace `wifi, wifi forget, send, restart.` with `wifi, wifi forget, send, node2, node2 reset, restart.`.
2. Below the line `#include "networking.h"  // Modules 10-11`, add:

   ```cpp
   #include "bridge.h"   // Module 14: Node 2 over ESP-NOW
   ```

3. In `setup()`, below the line `setupNetwork();  // Module 10: …`, add:

   ```cpp
     setupBridge();   // Module 14: after the WiFi is on
   ```

4. In `loop()`, below the line `updateNetwork();       // Modules 10-11: …`, add:

   ```cpp
     updateBridge();        // Module 14: Node 2 packets -> holding shelf -> broker; never waits
   ```

#### 3.6 `commands.cpp`

1. Below the line `#include "networking.h"`, add `#include "bridge.h"`.
2. Find the block of the `wifi forget` command, then insert two new commands **between** that block and the `send` block, so that this part becomes:

   ```cpp
     } else if (command == "wifi forget") {
       forgetWiFi();  // Module 10: erases the saved WiFi, then restarts into the portal
       return;
     } else if (command == "node2") {
       printNode2Info();  // Module 14: Node 2 packet statistics
       return;
     } else if (command == "node2 reset") {
       resetNode2Counters();  // Module 14: the counters start from zero, for example right when the router is unplugged
       printNode2Info();
       return;
     } else if (command == "send") {
   ```

3. In the `Unknown command` message, replace the line `Serial.println("send, restart");` with `Serial.println("send, node2, node2 reset, restart");`.

You can also compare all these changes with the reference version in [`code/node-1-home/`](code/node-1-home/), or in the project folder `mini-smart-home/firmware/node-1-home/` once this module is published.

#### 3.7 Upload and check

1. Make sure the selected board is **ESP32 Dev Module**, with **Partition Scheme** **Minimal SPIFFS** and **Flash Mode** **DIO** (Node 1's settings since Module 10), and that the port is the **Node 1** board's. Click **Upload**. Arduino IDE prints something like `Sketch uses 1182724 bytes (60%) of program storage space`; the number on your screen may be slightly different. Does compiling stop with an error? Read the **first error message**, then compare the tab it names with the [reference version](code/node-1-home/), as in Module 11. The most common causes: a new tab was named without `.h` or `.cpp` (Arduino IDE then makes an `.ino` file, and `bridge.h: No such file or directory` appears), or one line from steps 3.2–3.6 was missed (`'…' was not declared in this scope` appears).
2. Turn the MB102 on Node 1's workbench back on (the order: USB first, then the MB102). From now on, Node 1 is fully working again. Leave the Node 1 board plugged into the laptop until section ➕ B, because you'll often read its Serial Monitor.
3. Open the **Serial Monitor**, then press **EN** on the Node 1 board. Node 1 restarts so that its first lines are shown, and the regulated microSD module, which only got power after the MB102 was turned on, is found as well (the habit from Module 7). **Expected output** (example, shortened; the reading lines every 2 seconds aren't quoted):

   ```text
   [00:00:01] INFO  Node 1 Home - firmware 1.3.0
   [00:00:02] INFO  device_id a4cf12e5b7c0
   [00:00:02] INFO  Connecting to the saved WiFi "OurHome" (without waiting)...
   [00:00:02] INFO  Node 2 bridge ready: listening for ESP-NOW from 246f28b1c7d4, encryption off.
   [00:00:02] INFO  Watchdog active: automatic restart if loop() is stuck for more than 5 seconds.
   [00:00:04] INFO  WiFi connected to "OurHome": IP 192.168.1.23, signal -58 dBm, channel 6
   [00:00:04] INFO  MQTT connected to broker 192.168.1.37:1883 in 41 ms, as a4cf12e5b7c0
   ```

4. Type `wifi` in the Serial Monitor's send box, then press **Enter**. Its new line (example):

   ```text
   wifi: radio channel 6, router channel 6 (0 = never connected)
   ```

5. Type `node2`. Node 2 isn't running its firmware yet, so the result looks like this (example):

   ```text
   node2: device_id 246f28b1c7d4, not heard yet, radio channel 6, encryption off
   node2: received 0, lost 0, duplicates 0, rejected 0, dropped 0
   node2: published 0, waiting on the shelf 0 of 96, evicted 0
   ```

   All the numbers are 0 because the Node 2 board is still running the Practice 2 sensor sketch, which doesn't use the radio. Is the `dropped` number going up? Then an ESP32 on this channel is sending broadcast packets, or packets that aren't 33 bytes long, to Node 1, for example a board that's still running `module14_find_channel` (the text `hello from the garden`). Node 1's Wi-Fi task throws them away at once: that's the bridge's first check. If Node 2 still hasn't sent anything 16 minutes after Node 1 powered up, Node 1 prints `ERROR Node 2 OFFLINE: no packet for 960 seconds.` That's normal: the status changes to `online` as soon as Node 2's first packet arrives.

**Wokwi path** (`USE_WOKWI = true`; real output from the simulator, October 2026, shortened):

```text
[00:00:03] INFO  Node 2 bridge ready: listening for ESP-NOW from 246f28b1c7d4, encryption off.
[00:00:03] INFO  Wokwi mode: a mock Node 2 sends a packet every 30 seconds.
[00:00:03] INFO  Node 2: packet #1 received (attempt 1, signal -58 dBm).
[00:00:03] INFO  Node 2 ONLINE.
[00:00:04] INFO  WiFi connected to "Wokwi-GUEST": IP 10.10.0.1, signal -76 dBm, channel 6
[00:00:07] INFO  MQTT connected to broker broker.emqx.io:1883 in 2504 ms, as 240ac45e114c
[00:00:09] INFO  Clock set from the internet: 2026-10-18T23:20:48Z
[00:00:33] INFO  Node 2: packet #2 received (attempt 1, signal -58 dBm).
```

Then the `node2` command (after about 50 seconds):

```text
node2: device_id 246f28b1c7d4, online, radio channel 6, encryption off
node2: received 2, lost 0, duplicates 0, rejected 0, dropped 0
node2: packets arrived 100.0 %
node2: published 2, waiting on the shelf 0 of 96, evicted 0
node2: last packet #2, 17 seconds ago, attempt 1, signal -58 dBm, interval 30 seconds
```

Look at packet `#1`: it arrived **before** the Wi-Fi connected and before the clock was set, waited on the shelf, and was still published once everything was ready (`published 2`). That's the holding shelf at work, a small version of the router test in Practice 6.

> ➡️ **Continue** to [Practice 4 — Node 2 v1.0.0](#practice-4--node-2-v100-wake-send-sleep-40-minutes) without going back to the concepts.

### Practice 4 — Node 2 v1.0.0: wake, send, sleep (40 minutes)

> 🖥️ **Tools:** **Arduino IDE** with `node-2-garden.ino` from the `mini-smart-home` repository, the Node 2 board (USB to the laptop), the Node 1 v1.3.0 board with its Serial Monitor, **MQTTX**, and **VS Code** with the `mini-smart-home` folder for the contract checker. Concepts used: 4–7.
>
> ⭐ **Required** — the Module 14 completion requirement asks for Node 2's data to show up in Node-RED with its own `device_id`.
>
> 🖥️ **Wokwi path:** Node 2 v1.0.0 needs a real board (ESP-NOW to another board, deep sleep, and the BME280). Read steps 4.1–4.3 to understand its firmware, then do steps 4.4–4.5 with the mock Node 2 from Practice 3: in MQTTX, use the **Public broker** connection and the topic `msh/` + your mock Node 2's `device_id` + `/#`; run the contract checker with `broker.emqx.io` and that `device_id`, for example `node contract-checker.js broker.emqx.io 246f28a1b2c3` (use your own mock Node 2's `device_id`). The mock Node 2 also always sends the `battery` field (`3.92`), so its messages have one more field than the 4.4 example, and checker version 1.0 in 4.5 step 1 prints one extra line: `field "battery" is not in the data contract`.

Node 2 v1.0.0 completely replaces the v0.1.0 skeleton from Module 9. You already know almost all of its parts: the wake sequence from Practice 2, the channel search from Practice 1, and sending with an ACK from the Quick Win.

#### 4.1 Replace the contents of `node-2-garden.ino`

1. In the Node 2 board's window, open **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-2-garden** → `node-2-garden.ino`. This is the v0.1.0 skeleton from Module 9.
2. Select all its contents (**Ctrl + A**), then replace them with this code:

   ```cpp
   // Node 2 "Garden" - Mini Smart Home - firmware v1.0.0 (Module 14): a battery-powered sensor over ESP-NOW
   // Every 5 minutes: wake up -> read the BME280 + DS18B20 + second soil sensor (+ battery, if fitted) -> send one
   // ESP-NOW packet to Node 1 -> sleep again. The order is deliberate: all sensors first (radio still off), the radio briefly, sleep.
   // Node 2 never connects to the router and doesn't know the WiFi password: the home WiFi's NAME is enough, to find the channel.
   // Pins as in PIN-MAP.md version 5, Node 2 section. Board: DOIT ESP32 DEVKIT V1 (the default program shelf is enough).
   // Libraries: Adafruit BME280 Library 2.3.0 (installed with it: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
   // OneWire 2.3.8, DallasTemperature 4.0.6. WiFi and ESP-NOW come with the esp32 package (version 3.3.7 or newer).

   #include <Wire.h>
   #include <WiFi.h>
   #include <esp_now.h>
   #include <esp_mac.h>
   #include <OneWire.h>
   #include <DallasTemperature.h>
   #include <Adafruit_BME280.h>
   #include "node2-packet.h"

   // Practice 8: the ESP-NOW encryption keys live in keys.h, which does NOT go to GitHub (.gitignore).
   // As long as that file doesn't exist, ESP-NOW runs without encryption.
   #if __has_include("keys.h")
   #include "keys.h"
   #else
   const bool USE_ENCRYPTION = false;
   const char KEY_PMK[] = "";
   const char KEY_LMK[] = "";
   #endif
   static_assert(!USE_ENCRYPTION || sizeof(KEY_PMK) == 17, "KEY_PMK in keys.h must be exactly 16 letters/digits");
   static_assert(!USE_ENCRYPTION || sizeof(KEY_LMK) == 17, "KEY_LMK in keys.h must be exactly 16 letters/digits");

   // ---------- Replace with your own ----------
   const uint8_t MAC_NODE1[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // Node 1's WiFi MAC (= Node 1's device_id), 2 digits at a time
   const char WIFI_NAME[] = "YourHomeWiFiName";  // the name of the home WiFi that Node 1 is connected to, EXACTLY; the password is NOT needed
   const uint8_t FIXED_CHANNEL = 0;              // 0 = find it by itself through WIFI_NAME; 1-11 = always use this channel
   const int SOIL_DRY = 3000;                    // calibration of the SECOND soil sensor with power from D32 (Practice 2)
   const int SOIL_WET = 1300;
   const uint16_t INTERVAL_SECONDS = 300;        // wake every 5 minutes; "router off" test (Practice 6): 60
   const bool HAS_BATTERY_DIVIDER = false;       // true if the battery voltage divider is connected to VP (technical deep dive)
   const float DIVIDER_FACTOR = 2.0;             // two equal resistors; correct it with a multimeter

   // ---------- Fixed ----------
   const uint8_t FW_VERSION[3] = {1, 0, 0};
   const int PIN_AWAKE_LED = 2;              // built-in blue LED: on while awake
   const int PIN_ONE_WIRE = 27;              // DS18B20
   const int PIN_SDA = 21;                   // BME280
   const int PIN_SCL = 22;
   const int PIN_SOIL = 39;                  // VN: the second soil sensor's AOUT
   const int PIN_SOIL_POWER = 32;            // D32: the soil sensor's power, on only while awake
   const int PIN_BATTERY = 36;               // VP: the voltage divider's midpoint (optional)
   const unsigned long SOIL_SETTLE_MS = 300; // wait after switching the soil sensor on before reading it
   const uint8_t DS18B20_RESOLUTION = 10;    // 0.25 degrees, 188 ms at most
   const int MAX_ATTEMPTS = 3;               // send again if Node 1's radio ACK doesn't come
   const int FAILS_BEFORE_SCAN = 2;          // after 2 failed wakes in a row, find the channel again

   // ---------- RTC memory: survives deep sleep, lost when the battery is removed or EN is pressed ----------
   RTC_DATA_ATTR uint16_t session = 0;  // 0 = the board just powered up from off
   RTC_DATA_ATTR uint32_t sequence = 0;
   RTC_DATA_ATTR uint8_t channel = 0;  // the channel used last (0 = not known yet)
   RTC_DATA_ATTR uint8_t failStreak = 0;

   OneWire oneWire(PIN_ONE_WIRE);
   DallasTemperature tempSensors(&oneWire);
   Adafruit_BME280 bme;

   volatile bool sendDone = false;  // set by the WiFi task, read by setup()
   volatile bool sendOk = false;

   // Called by the WiFi task after the radio receives (or doesn't receive) an ACK from Node 1.
   static void onSendDone(const esp_now_send_info_t *info, esp_now_send_status_t status) {
     sendOk = (status == ESP_NOW_SEND_SUCCESS);
     sendDone = true;
   }

   static bool deviceAt(uint8_t address) {
     Wire.beginTransmission(address);
     return Wire.endTransmission() == 0;
   }

   // BME280 forced mode: measure once, then the sensor goes back to sleep by itself (0.1 uA) while Node 2 sleeps.
   static void readBme280(Node2Packet &p) {
     p.temperature = NAN;
     p.humidity = NAN;
     p.pressure = NAN;
     Wire.begin(PIN_SDA, PIN_SCL);
     uint8_t address = deviceAt(0x76) ? 0x76 : (deviceAt(0x77) ? 0x77 : 0);
     if (address == 0) {
       Serial.println("BME280 not found at 0x76 or 0x77: check SDA to D21, SCL to D22, VCC, and GND.");
       return;
     }
     if (!bme.begin(address)) {
       Serial.printf("The chip at 0x%02X is not a BME280 (chip ID 0x%02X; 0x58 = BMP280, no humidity).\n", address,
                     (unsigned int)bme.sensorID());
       return;
     }
     bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                     Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
     if (!bme.takeForcedMeasurement()) {
       return;
     }
     p.temperature = bme.readTemperature();
     p.humidity = bme.readHumidity();
     p.pressure = bme.readPressure() / 100.0f;  // the library gives pascals; divided by 100 it becomes hPa
   }

   // Average of 20 readings. An impossible raw value (sensor unplugged or without power) is sent as -1.
   static int8_t readSoil() {
     long sum = 0;
     for (int i = 0; i < 20; i++) {
       sum += analogRead(PIN_SOIL);
       delay(2);
     }
     int raw = sum / 20;
     if (raw < SOIL_WET - 300 || raw > SOIL_DRY + 300) {
       Serial.printf("Soil sensor: raw value %d is impossible, sent as failed.\n", raw);
       return -1;
     }
     return constrain(map(raw, SOIL_DRY, SOIL_WET, 0, 100), 0, 100);
   }

   static uint16_t readBatteryMv() {
     if (!HAS_BATTERY_DIVIDER) {
       return 0;  // 0 = not measured; Node 1 doesn't write the battery field
     }
     uint32_t sum = 0;
     for (int i = 0; i < 8; i++) {
       sum += analogReadMilliVolts(PIN_BATTERY);
     }
     return (uint16_t)(sum / 8 * DIVIDER_FACTOR);
   }

   // Scans for one WiFi name only: that router's channel = Node 1's channel (Node 1 is connected to the router).
   static uint8_t findChannel() {
     int count = WiFi.scanNetworks(false, false, false, 120, 0, WIFI_NAME);
     uint8_t result = 0;
     for (int i = 0; i < count; i++) {
       if (WiFi.SSID(i) == WIFI_NAME) {
         result = WiFi.channel(i);
         break;
       }
     }
     WiFi.scanDelete();
     if (result == 0) {
       Serial.printf("WiFi \"%s\" not found: is the router off, or is the name misspelled?\n", WIFI_NAME);
     }
     return result;
   }

   static bool setupEspNow() {
     if (WiFi.setChannel(channel) != ESP_OK) {
       Serial.printf("Channel %u refused by the ESP32. Is the router on channel 12 or 13? Change the router to 1, 6, or 11.\n", channel);
       return false;
     }
     if (esp_now_init() != ESP_OK) {
       return false;
     }
     esp_now_register_send_cb(onSendDone);
     esp_now_peer_info_t peer = {};
     memcpy(peer.peer_addr, MAC_NODE1, 6);
     peer.channel = 0;  // 0 = the radio's current channel (the one just set)
     peer.ifidx = WIFI_IF_STA;
     peer.encrypt = USE_ENCRYPTION;
     if (USE_ENCRYPTION) {  // Practice 8: the PMK and LMK must be exactly the same as Node 1's
       esp_now_set_pmk((const uint8_t *)KEY_PMK);
       memcpy(peer.lmk, KEY_LMK, ESP_NOW_KEY_LEN);
     }
     return esp_now_add_peer(&peer) == ESP_OK;
   }

   static bool sendOnce(const Node2Packet &p) {
     sendDone = false;
     if (esp_now_send(MAC_NODE1, (const uint8_t *)&p, sizeof(p)) != ESP_OK) {
       return false;
     }
     unsigned long start = millis();
     while (!sendDone && millis() - start < 200) {  // never wait forever: Node 2 must still be able to sleep
       delay(1);
     }
     return sendDone && sendOk;
   }

   void setup() {
     pinMode(PIN_AWAKE_LED, OUTPUT);
     digitalWrite(PIN_AWAKE_LED, HIGH);
     pinMode(PIN_SOIL_POWER, OUTPUT);
     digitalWrite(PIN_SOIL_POWER, HIGH);  // 1. the soil sensor is switched on FIRST OF ALL: it needs time to settle
     unsigned long soilOnAt = millis();
     Serial.begin(115200);
     if (session == 0) {  // just powered up from off: a new notebook
       session = (uint16_t)(esp_random() | 1);
       sequence = 0;
       uint8_t mac[6];
       esp_read_mac(mac, ESP_MAC_WIFI_STA);
       Serial.printf("\nNode 2 Garden v%u.%u.%u, MAC %02X:%02X:%02X:%02X:%02X:%02X (device_id %02x%02x%02x%02x%02x%02x)\n",
                     FW_VERSION[0], FW_VERSION[1], FW_VERSION[2], mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], mac[0],
                     mac[1], mac[2], mac[3], mac[4], mac[5]);
       Serial.printf("Copy into MAC_NODE2 in Node 1's config.h: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n",
                     mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     }
     sequence++;

     Node2Packet p = {};
     p.mark = PACKET_MARK;
     p.version = PACKET_VERSION;
     memcpy(p.fw, FW_VERSION, 3);
     p.session = session;
     p.sequence = sequence;
     p.intervalSeconds = INTERVAL_SECONDS;

     // 2. The DS18B20 starts measuring (without waiting), while the other sensors are read.
     tempSensors.begin();
     tempSensors.setResolution(DS18B20_RESOLUTION);  // the sensor's EEPROM is only written if the resolution differs
     tempSensors.setWaitForConversion(false);
     tempSensors.requestTemperatures();
     unsigned long dsStart = millis();

     // 3. The BME280 and the battery, while the radio is still off.
     readBme280(p);
     p.batteryMv = readBatteryMv();

     // 4. Wait for the DS18B20 to finish, then read the soil sensor and switch it off again.
     while (!tempSensors.isConversionComplete() && millis() - dsStart < 800) {
       delay(5);
     }
     float soilTemperature = tempSensors.getTempCByIndex(0);  // -127 if the sensor does not answer
     p.soilTemperature = (soilTemperature == DEVICE_DISCONNECTED_C) ? NAN : soilTemperature;
     while (millis() - soilOnAt < SOIL_SETTLE_MS) {
       delay(1);
     }
     p.soil = readSoil();
     digitalWrite(PIN_SOIL_POWER, LOW);

     // 5. The radio only briefly: find the channel if needed, send, wait for the ACK, try again if it fails.
     WiFi.persistent(false);  // WiFi settings in RAM only: the flash memory isn't written on every wake
     WiFi.mode(WIFI_STA);     // the radio is on WITHOUT WiFi.begin(): Node 2 never connects to the router
     if (FIXED_CHANNEL != 0) {
       channel = FIXED_CHANNEL;
     } else if (channel == 0 || failStreak >= FAILS_BEFORE_SCAN) {
       uint8_t found = findChannel();
       if (found != 0) {
         channel = found;  // nothing found (router off)? The old channel is kept: Node 1 is still waiting there
       }
       failStreak = 0;
     }
     bool sent = false;
     if (channel != 0 && setupEspNow()) {
       for (int i = 1; i <= MAX_ATTEMPTS && !sent; i++) {
         p.attempt = i;
         sent = sendOnce(p);
         if (!sent && i < MAX_ATTEMPTS) {
           delay(i == 1 ? 100 : 2500);  // the last one about 2.6 seconds after the first: to get past Node 1's scan
         }
       }
     }
     failStreak = sent ? 0 : failStreak + 1;
     esp_now_deinit();
     WiFi.mode(WIFI_OFF);  // ESP-IDF: turn the WiFi off before sleeping

     // 6. Report, then sleep.
     Serial.printf("#%lu %s (attempt %u), channel %u. Temperature %.1f C, humidity %.0f %%, %.1f hPa, soil %.1f C / %d %%. "
                   "Awake %lu ms.\n",
                   (unsigned long)sequence, sent ? "sent" : "FAILED", p.attempt, channel, p.temperature, p.humidity,
                   p.pressure, p.soilTemperature, p.soil, millis());
     Serial.flush();
     digitalWrite(PIN_AWAKE_LED, LOW);
     esp_sleep_enable_timer_wakeup(INTERVAL_SECONDS * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Never runs: Node 2 always starts from setup() every time it wakes up.
   }
   ```

3. Create a new tab **`node2-packet.h`** (**⋯ → New Tab**), then fill that tab with a file that's **exactly the same** as Node 1's: open [`code/node-2-garden/node2-packet.h`](code/node-2-garden/node2-packet.h), click **Copy raw file**, then paste. Save (**Ctrl + S**).

The parts of `setup()` are numbered 1–6 in their comments, in exactly the same sequence as in Concept 4: the soil sensor is switched on first of all, the DS18B20 starts measuring, the BME280 and the battery are read, the soil sensor is read and switched off again, the radio is on briefly, then sleep. Compared with the practice sketches, four parts are really new: **retries** (`MAX_ATTEMPTS`, Concept 8), the **encryption keys**, which are only used in Practice 8, `FIXED_CHANNEL` (🚨), and the battery reading, which is still switched off (`HAS_BATTERY_DIVIDER`, 🔬).

#### 4.2 Fill in the "Replace with your own" section

| Constant | What to fill in | Where it comes from |
| :--- | :--- | :--- |
| `MAC_NODE1` | the Node 1 board's MAC address, two digits at a time, for example `{0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0}` | Quick Win step 2 |
| `WIFI_NAME` | the home Wi-Fi's name, **exactly**, for example `"OurHome"` | Practice 1.3 |
| `FIXED_CHANNEL` | leave it at `0` (Node 2 finds the channel by itself). Fill in the router's channel number only if your home uses several Wi-Fi access points with the same name (mesh Wi-Fi or range extenders), see 🚨 | Practice 1.1 or Node 1's `wifi` command |
| `SOIL_DRY`, `SOIL_WET` | the dry and wet values of the second soil sensor | Practice 2.7 |
| `INTERVAL_SECONDS` | **change it to `60` for now** so that you see results quickly and are ready for the router test in Practice 6. Section ➕ puts it back to `300`. | — |

In Practice 2.7, did your soil sensor's 200 ms and 400 ms values differ by more than 20? Then also change `SOIL_SETTLE_MS` (in the "Fixed" section) from `300` to `500`.

#### 4.3 Upload and read both Serial Monitors

1. Select **DOIT ESP32 DEVKIT V1** and the **Node 2** board's port, then click **Upload**. The Node 2 firmware is only about 940,000 bytes, so it still fits in the default program shelf.
2. Open Node 2's Serial Monitor. When the board has just powered up, Node 2 introduces itself, then a report appears every time it wakes up (example; the `ets …` and `rst:0x5 (DEEPSLEEP_RESET)` lines between the reports, as in Practice 1.3, aren't quoted):

   ```text
   Node 2 Garden v1.0.0, MAC 24:6F:28:B1:C7:D4 (device_id 246f28b1c7d4)
   Copy into MAC_NODE2 in Node 1's config.h: {0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4}
   #1 sent (attempt 1), channel 6. Temperature 29.4 C, humidity 78 %, 1008.6 hPa, soil 27.5 C / 41 %. Awake 2843 ms.
   #2 sent (attempt 1), channel 6. Temperature 29.4 C, humidity 78 %, 1008.6 hPa, soil 27.5 C / 41 %. Awake 552 ms.
   ```

   The first wake takes longer because it scans for the channel; the following wakes take about half a second. The two introduction lines are only printed when Node 2 powers up from off; if you missed them because you only just opened the Serial Monitor, press **EN** on the Node 2 board. If `MAC_NODE2` in Node 1 isn't the same as this second line yet, fix it first (Practice 3.2), then upload Node 1 again.
3. In the **Node 1** Serial Monitor (example; the sensor reading lines every 2 seconds and `Published telemetry` aren't quoted):

   ```text
   [00:14:31] INFO  Node 2: packet #1 received (attempt 1, signal -47 dBm).
   [00:14:31] INFO  Node 2 ONLINE.
   [00:15:32] INFO  Node 2: packet #2 received (attempt 1, signal -46 dBm).
   ```

4. Type `node2` in Node 1's Serial Monitor (example):

   ```text
   node2: device_id 246f28b1c7d4, online, radio channel 6, encryption off
   node2: received 2, lost 0, duplicates 0, rejected 0, dropped 0
   node2: packets arrived 100.0 %
   node2: published 2, waiting on the shelf 0 of 96, evicted 0
   node2: last packet #2, 21 seconds ago, attempt 1, signal -46 dBm, interval 60 seconds
   ```

#### 4.4 See Node 2 on the broker with MQTTX

1. In MQTTX, on the **Pi gateway** connection (Module 12), add the subscription `msh/246f28b1c7d4/#` (**New Subscription**, as in Module 11; use your Node 2's `device_id`).
2. A `status` message marked retained, holding `online`, appears right away. Every time Node 2 wakes up, one `telemetry` message follows (example):

   ```json
   {"ts":"2026-10-17T03:12:45Z","fw":"1.0.0","temperature":29.4,"humidity":78,"pressure":1008.6,"soil_temperature":27.5,"soil":41}
   ```

   There's no `battery` field because the battery voltage divider isn't fitted yet (`HAS_BATTERY_DIVIDER = false`). `fw` holds the version of **Node 2**, `1.0.0`, not Node 1's `1.3.0`.

#### 4.5 Contract checker version 1.1

The contract checker from Module 11 still uses contract 1.0. Run it first without changing it, so you can see why the checker needs an update:

1. In VS Code with the `mini-smart-home` folder, open a terminal (**Terminal → New Terminal**), go into the `tools` folder (`cd tools`), then run `node contract-checker.js 192.168.1.37` (your gateway's address). Wait until Node 2 wakes up again.

   **Expected output** for the Node 2 message (the real output of checker version 1.0):

   ```text
   [11:04:13 PM] msh/246f28b1c7d4/telemetry  FAIL
      - field "light" is missing
      - field "motion" is missing
      - field "water_level" is missing
      - field "pressure" is not in the data contract
      - field "soil_temperature" is not in the data contract
   ```

   Checker version 1.0 thinks every `telemetry` message belongs to Node 1. Press **Ctrl + C** to stop it.
2. Open `tools/contract-checker.js` in VS Code, select all its contents, then replace them with version 1.1 from the curriculum: open [`mini-smart-home/tools/contract-checker.js`](../../mini-smart-home/tools/contract-checker.js), click **Copy raw file**, then paste and save (**Ctrl + S**). The change is small: there are now two `telemetry` field lists, one for Node 1 and one for Node 2, and Node 2 is recognized by its typical fields (`pressure` or `soil_temperature`).
3. Run `node contract-checker.js 192.168.1.37` again. **Expected output** (example, shortened; Node 1's `telemetry` actually appears every 10 seconds):

   ```text
   Contract checker ready on broker 192.168.1.37:1883 (subscribed to msh/#) — press Ctrl + C to stop.
   [10:31:02 AM] msh/a4cf12e5b7c0/status  PASS  [retained]
   [10:31:02 AM] msh/246f28b1c7d4/status  PASS  [retained]
   [10:31:05 AM] msh/a4cf12e5b7c0/telemetry  PASS
   [10:31:38 AM] msh/246f28b1c7d4/telemetry  PASS  (telemetry Node 2)
   ```

   The same checker also catches Node 2's typical mistakes: a pressure that wasn't divided by 100 (`"pressure" must be a number from 300 to 1100 or null, got 100860`) or a Node 1 field that strayed into a Node 2 message (`field "motion" is not in the data contract`). Press **Ctrl + C** when you're done.

#### 4.6 Node 2 moves to the battery

1. Unplug the Node 2 board's USB cable.
2. Connect the board's VIN wire to the top rail (+) at column 29 again, and the GND wire (left row, above VIN) to the top rail (−) at column 28, as in Module 9. The 3.3 V bottom rail gets power too, because the board's regulator now gets 5.0 V from the MT3608.
3. Look at Node 2's blue LED: it lights up briefly every 60 seconds. In Node 1's Serial Monitor, Node 2's packets keep coming in. Node 2's Serial Monitor is now silent because its USB is unplugged; the Node 1 window and the `node2` command become your eyes and ears.

> ➡️ **Continue** to [Practice 5 — The Garden card in Node-RED](#practice-5--the-garden-card-in-node-red-30-minutes) without going back to the concepts.

### Practice 5 — The Garden card in Node-RED (30 minutes)

> 🖥️ **Tools:** the laptop's browser with the Node-RED editor (Module 13), a phone connected to the home Wi-Fi, Node 1 v1.3.0, and Node 2 v1.0.0 waking up every 60 seconds. Concepts used: 7.
>
> ⭐ **Required** — the Module 14 completion requirement asks for Node 2's data to show up in Node-RED with its own `device_id`.
>
> 🖥️ **Laptop path and Wokwi path:** the steps are the same, in the Node-RED on your laptop (Practice 8 of Module 13). In step 5.2, choose the same **Server** as in your `telemetry Node 1` node. In the topic, use your Node 2's `device_id` (laptop path with a real board) or the `device_id` of the mock Node 2 from Practice 3 (Wokwi path). The mock Node 2 always sends a `battery` of 3.92 V, so on the Wokwi path the **Battery** line on your card gets filled in too.

In Module 13 you built the widgets one by one. The Garden card holds nineteen nodes, so this week you **import** it from the curriculum, then connect it to your own flow. Because you built your Module 13 flow yourself, this piece doesn't know your broker settings and your dashboard page yet. There are three small things you need to connect yourself, and Node-RED marks all of them with a red triangle.

#### 5.1 Import the Garden flow piece

1. Open [`code/node-red-garden.json`](code/node-red-garden.json) on GitHub, then click the **Copy raw file** icon.
2. In the Node-RED editor, open the **Mini Smart Home** tab, then scroll the workspace down until there's empty space below section 4 (`4 · Node 1 replies (ack) …`).
3. Open the main menu (the three-line icon at the top right) → **Import**, or press **Ctrl + I**. The `Import nodes` window opens. Paste (**Ctrl + V**) into its text box, then click **Import**.
4. The imported nodes are now **stuck to the mouse pointer**. Move the mouse to that empty space, then click once to drop them there. The notice `Imported:` appears with `18 nodes` and `1 configuration node` (the **Garden** group).

Notice the small red triangle in the corner of some nodes: a sign that their settings are incomplete. Node-RED still lets you **Deploy**, but a node with a red triangle won't work. Steps 5.2–5.3 get rid of all those triangles.

![Three numbered screenshots of the Node-RED 5.0.8 editor after the Garden flow piece is imported. Panel 1, left: the Imported notice with 18 nodes and 1 configuration node, framed in orange; below it, section 5 Garden with the mqtt in nodes telemetry Node 2 and status Node 2, four read? switches, the change node reading time (ms), the debug node watch Node 2 telemetry, and nine widgets: Air temperature, Air humidity, Garden soil, Soil temperature, Last reading, Air pressure, Battery, the chart Air & soil temperature (24 h), and Node 2 (via Node 1). Small red triangles sit in the top right corner of both MQTT nodes and all nine widgets; some are circled in red. Panel 2, top right: the Properties of the mqtt in node telemetry Node 2, with an empty Server list outlined in red and the Topic field msh/246f28b1c7d4/telemetry, both marked; caption: pick Mosquitto on the gateway, then change the device_id in Topic. Panel 3, bottom right: the Edit gauge node > Edit ui-group node window with the Delete, Cancel, and Update buttons, the Name field Garden, and an empty Page list outlined in red and marked; caption: from any widget, click the pencil next to Group, pick Home [/dashboard/home], then Update.](assets/import-garden.png)

*Real screenshots of the Node-RED 5.0.8 editor (Apache 2.0 license) from the author's laptop; title, numbers, marks, and captions by the author.*

#### 5.2 Connect both MQTT nodes to the broker and to your Node 2's `device_id`

1. Double-click the **telemetry Node 2** node. The **Server** list is empty and outlined in red: choose **Mosquitto on the gateway** (the broker settings from Module 13; the name may be a little different if you named it differently back then). Don't click the **+** button next to it; that button creates a second broker setting.
2. In the **Topic** field, replace `246f28b1c7d4` with your Node 2's `device_id` (from `notes-module14.md`) so that it becomes `msh/<your Node 2's device_id>/telemetry`. Click **Done**.
3. Do the same for the **status Node 2** node: choose the **Server**, replace the `device_id` in the **Topic** field, then click **Done**.

#### 5.3 Put the Garden group on the Home page

1. Double-click any widget in section 5, for example the **Air temperature** gauge. The **Group** line says `[] Garden`: the empty square brackets mean this group doesn't have a page yet.
2. Click the pencil icon next to the **Group** line. The group's settings window opens with the title `Edit ui-group node`. In the **Page** list (empty, outlined in red), choose **Home [/dashboard/home]**, then click **Update**.
3. Back in the widget's window, click **Done**. The red triangles on **all nine** widgets disappear at once, because all nine use the same group.
4. Click **Deploy**. The notice `Successfully deployed` appears. If there's still a red triangle somewhere, double-click that node and look for the field outlined in red.

#### 5.4 See the Garden card on the phone

Open the dashboard on the phone (`http://192.168.1.37:1880/dashboard/home`), then scroll down. The **Garden** card appears below the **Chart** card. It fills in as soon as Node 2 next wakes up (within about a minute). Still empty? In the Node-RED editor, click the faded button on the right side of the debug node `watch Node 2 telemetry` until it turns green (this flow piece brings it in switched off, like the debug nodes you faded in ➕ A of Module 13), then open the **debug** panel on the right side: every time Node 2 wakes up, one message appears there. A panel that stays silent means the **Server** or the **Topic** from 5.2 isn't right yet; also see 🚨 "Node 1 receives Node 2's packets, but nothing shows up in MQTTX or Node-RED".

![Two screenshots of the Garden card on the Home dashboard, taken in a laptop browser at the width of a phone screen (412 pixels), each framed as a phone, with five markers. Left phone, the top of the card: marker 1 at the Node 2 (via Node 1) line, which shows online, the status published by Node 1; marker 2 at the Last reading line 10/18 21:33, the WIB time from ts; marker 3 at four half-circle gauges: Air temperature 24.2 degrees, Air humidity 78 percent, Garden soil 36 percent, and Soil temperature 27.8 degrees. Right phone, after scrolling: marker 4 at the Air pressure line 1009.1 hPa and the Battery line 3.92 V; marker 5 at the Air & soil temperature (24 h) chart with a blue temperature line and a red soil_temperature line, rising and falling with day and night, time axis 18, 04:00 to 20:00. The captions on the right explain the five markers; data from a mock Node 2 in the author's lab. On your dashboard, Battery shows not measured as long as the voltage divider isn't fitted.](assets/phone-garden-card.png)

*Real screenshots of FlowFuse Dashboard 1.33.0 (Apache 2.0 license) from the author's laptop browser, narrowed to the width of a phone screen, with data from a mock Node 2; title, phone frame, numbers, and captions by the author.*

What's on the card, from the top:

| Widget | Where its value comes from | Notes |
| :--- | :--- | :--- |
| **Node 2 (via Node 1)** | `msh/<device_id Node 2>/status` | `online` or `offline`, published by **Node 1** (Concept 7). Also see Node 1's status on the Sensors card. |
| **Last reading** | `ts` inside the message | the **WIB** time from `ts`, not the time the message arrived. If you live in the WITA or WIT time zone, double-click this widget and replace `"+0700"` in the **Value** field with `"+0800"` or `"+0900"`. |
| **Air temperature**, **Air humidity**, **Garden soil**, **Soil temperature** | `temperature`, `humidity`, `soil`, `soil_temperature` | each gauge is guarded by a **switch** node `… read?` (the rule **is not null**): a message with `null` doesn't reach the gauge, just like `DHT22 read?` in Module 13. |
| **Air pressure** | `pressure` | text made with JSONata; `unreadable` if it's `null`. |
| **Battery** | `battery` | `not measured` as long as the battery voltage divider isn't fitted (🔬). A percentage on a battery gauge would only mislead (Module 9), so it's shown in volts. |
| **Air & soil temperature (24 h)** | `temperature` and `soil_temperature` | its time axis comes from `ts` through the **change** node `reading time (ms)`, so late data is drawn at the hour it happened (Concept 7). With Node 2 waking every 60 seconds, the chart fills up slowly. |

Double-click the **change** node `reading time (ms)`. It has only one rule, which copies `ts` as a number of milliseconds: `$toMillis(payload.ts)` is stored in `msg.payload.time`. Then double-click the chart: in the **Properties** section, the **X:** field is of type **key:** and holds `time`, not of type **timestamp**. The **timestamp** type means "the time the message arrived in Node-RED", which in Concept 7 piled 24 hours of history into two seconds.

> ⬆️ **Done with Practices 3–5?** Go back to [Concept 8](#8-reliability-ack-retries-and-counting-lost-packets).

### Practice 6 — The router-off test (70 minutes)

> 🖥️ **Tools:** your home Wi-Fi router (its power plug), the Node 1 v1.3.0 board plugged into the laptop with its Serial Monitor open, Node 2 v1.0.0 on the battery with `INTERVAL_SECONDS = 60` (Practice 4), the Pi gateway, which stays on, an SSH terminal to the Pi, a clock, and `notes-module14.md`. Concepts used: 7–8.
>
> ⭐ **Required** — the Module 14 completion requirement asks for ≥ 90% of Node 2's packets to arrive while the router is off, and for their data to show up on the Pi again once the router is back on.
>
> 🖥️ **Laptop path** (the broker on the laptop): your laptop loses its Wi-Fi too when the router is off, but the broker keeps running on the laptop. Run the logger command from step 6.1 in a terminal on the laptop, without `nohup` and without the `&` at the end, then leave its window open. To read what's in `garden.log`, open a second terminal window in the same folder; Windows PowerShell doesn't know `tail`, so replace `tail -n 3 garden.log` with `Get-Content garden.log -Tail 3`, and `tail -n 35 garden.log` in 6.4 with `Get-Content garden.log -Tail 35`. In 6.4, the logger is stopped with **Ctrl + C** in the first window, not with `kill`, and there's no `nohup: ignoring input` line. Also make sure your laptop's IP address is reserved on the router (*DHCP reservation*, Module 11): after the router restarts, the laptop's address may change, and then Node 1 can't find its broker anymore. **Wokwi path:** this test needs real boards; read the steps and look at the example results.

Why is the Pi left on even though the router is off? The Pi is connected to the router with a LAN cable, but the broker and Node-RED run **inside the Pi**. While the router is off, nothing can reach the Pi, including Node 1 and your laptop, but what's inside the Pi keeps working. As soon as the router is back on, everything connects again. This test proves two things: Node 1 **keeps hearing** Node 2 while the router is off, and the readings it held back **still reach the Pi** with the time they happened.

#### 6.1 Preparation (10 minutes)

1. Make sure Node 2 already wakes up every 60 seconds (Practice 4) and that the router's channel is locked (Practice 1.5). A router with its channel on **Auto** may pick another channel when it's switched on again, and the next two packets are lost before Node 2 finds it. Also make sure the laptop won't go to sleep for about an hour: the Node 1 board gets its power from the laptop's USB, and a Node 1 that restarts loses what's on its holding shelf. Finally, tell the people at home that the internet will be off for about 30 minutes.
2. **On the Pi** (the SSH terminal), start a logger that keeps running even if your SSH connection drops (replace the `device_id`):

   ```bash
   nohup mosquitto_sub -h localhost -t "msh/246f28b1c7d4/telemetry" -F "%I %p" > garden.log 2>&1 &
   ```

   - `-h localhost`: subscribes to the broker on the Pi itself, which doesn't need the router.
   - `-F "%I %p"`: every message is written as its **arrival time on the Pi** (`%I`) followed by **the message's content** (`%p`).
   - `> garden.log 2>&1`: everything is written to the file `garden.log`, not to the screen.
   - `nohup` and the `&` at the end: the command runs in the background and **keeps running even when the SSH window closes**. This matters: SSH from the laptop to the Pi goes through the router, so your SSH window drops as soon as the router is switched off.

   **Expected output** (example): `[1] 4721`. The second number is the logger's process number; write it in your notes.
3. Wait two minutes, then check: `tail -n 3 garden.log`. **Expected output** (example):

   ```text
   nohup: ignoring input
   2026-10-18T10:12:33+0700 {"ts":"2026-10-18T03:12:33Z","fw":"1.0.0","temperature":29.6,"humidity":77,"pressure":1008.5,"soil_temperature":27.3,"soil":41}
   2026-10-18T10:13:33+0700 {"ts":"2026-10-18T03:13:33Z","fw":"1.0.0","temperature":29.6,"humidity":77,"pressure":1008.5,"soil_temperature":27.3,"soil":41}
   ```

   The `nohup: ignoring input` line is `nohup`'s own note; ignore it. Look at the two times on every line: the arrival time on the Pi in WIB (`10:12:33+0700`), and `ts` in UTC (`03:12:33Z`, the same as 10:12:33 WIB). While the router is on, the two are almost the same.

#### 6.2 Turn the router off for 30 minutes

1. Pick a time that's easy to remember, for example 10:15 WIB. Right at that time, **unplug the router's power plug**, then immediately type `node2 reset` in Node 1's Serial Monitor. All the `node2` counts start from zero right when the router goes off. Write down the time.
2. Within a few seconds, Node 1 notices that the router is gone (example; the sensor reading lines every 2 seconds aren't quoted):

   ```text
   [01:02:11] ERROR WiFi DISCONNECTED (reason 200: BEACON_TIMEOUT). Node 1 keeps working and retries every 60 seconds.
   [01:02:11] ERROR MQTT disconnected as well because the WiFi disconnected.
   [01:02:34] INFO  Node 2: packet #61 received (attempt 1, signal -52 dBm).
   [01:03:13] INFO  WiFi guard: 60 seconds without a new attempt, trying to reconnect.
   [01:03:34] INFO  Node 2: packet #62 received (attempt 1, signal -53 dBm).
   [01:04:15] INFO  WiFi guard: 60 seconds without a new attempt, trying to reconnect.
   [01:04:34] INFO  Node 2: packet #63 received (attempt 1, signal -52 dBm).
   ```

   Node 2's packets **are still received** even though the Wi-Fi is disconnected: ESP-NOW doesn't need the router. Now and then you see `attempt 2` or `3`: Node 2's first send got no ACK, for example because Node 1 was scanning (a few seconds after a `WiFi guard` line) or because of a brief disturbance, and it worked on a later attempt (Concept 8). While the router is off, your phone and laptop can't reach the Pi either, so the dashboard can't be opened; that's normal. Inside the Pi, the broker marks Node 1 `offline` about 20 seconds after the router goes off (the last will of Module 11), and after the router is back on, the Sensors card may still show `offline` for a little while until Node 1 connects again. (Laptop path: the dashboard can still be opened on the laptop itself at `http://localhost:1880/dashboard/home`.)
3. About every 10 minutes, type `wifi` and `node2` (example after 20 minutes, shortened; the `wifi: device_id …` line and the two `mqtt:` lines aren't quoted):

   ```text
   wifi: DISCONNECTED, last reason 201 (NO_AP_FOUND)
   wifi: radio channel 6, router channel 6 (0 = never connected)
   node2: device_id 246f28b1c7d4, online, radio channel 6, encryption off
   node2: received 20, lost 0, duplicates 0, rejected 0, dropped 0
   node2: packets arrived 100.0 %
   node2: published 0, waiting on the shelf 20 of 96, evicted 0
   node2: last packet #80, 41 seconds ago, attempt 1, signal -52 dBm, interval 60 seconds
   ```

   `radio channel 6, router channel 6`: between the guard's attempts, Node 1's radio goes back to the router's channel (Concept 3). `waiting on the shelf 20`: Node 2's readings are kept on the holding shelf and can't be published yet (Concept 7).

#### 6.3 Turn the router back on

1. After 30 minutes, plug the router's power plug back in. Write down the time.
2. The router needs one to three minutes to get ready. Node 1's guard tries every 60 seconds, so Node 1 connects at most about one minute after the router is ready (example; the sensor reading lines every 2 seconds aren't quoted):

   ```text
   [01:34:11] INFO  WiFi guard: 60 seconds without a new attempt, trying to reconnect.
   [01:34:14] INFO  WiFi connected AGAIN after 1923 seconds: IP 192.168.1.23
   [01:34:15] INFO  MQTT connected to broker 192.168.1.37:1883 in 38 ms, as a4cf12e5b7c0
   ```

3. As soon as MQTT is connected, Node 1 publishes what's on the shelf, three readings per pass of `loop()`; about thirty readings are done in less than a second. Type `node2` (example):

   ```text
   node2: device_id 246f28b1c7d4, online, radio channel 6, encryption off
   node2: received 32, lost 1, duplicates 0, rejected 0, dropped 0
   node2: packets arrived 97.0 %
   node2: published 32, waiting on the shelf 0 of 96, evicted 0
   node2: last packet #93, 12 seconds ago, attempt 1, signal -52 dBm, interval 60 seconds
   ```

#### 6.4 Count the results honestly

1. **The percentage of packets that arrived**, from Node 1: the `packets arrived` number in `node2`. It's calculated from the **sequence numbers** since `node2 reset`: received ÷ (received + lost). In the example above: 32 ÷ 33 = 97.0%, which passes the ≥ 90% requirement. If you only type `node2` a few minutes after the router is back on, the number also includes the packets after that; that's fine, but write down the time.
2. **The data reached the Pi**, from `garden.log`. Log in to the Pi over SSH again (the old window has dropped), then show the lines that arrived after the router came back on: `tail -n 35 garden.log`. **Expected output** (example, shortened):

   ```text
   2026-10-18T10:14:34+0700 {"ts":"2026-10-18T03:14:34Z","fw":"1.0.0","temperature":29.7,…}
   2026-10-18T10:47:15+0700 {"ts":"2026-10-18T03:15:34Z","fw":"1.0.0","temperature":29.7,…}
   2026-10-18T10:47:15+0700 {"ts":"2026-10-18T03:16:34Z","fw":"1.0.0","temperature":29.8,…}
   2026-10-18T10:47:15+0700 {"ts":"2026-10-18T03:17:34Z","fw":"1.0.0","temperature":29.8,…}
   …
   2026-10-18T10:47:16+0700 {"ts":"2026-10-18T03:46:35Z","fw":"1.0.0","temperature":30.1,…}
   2026-10-18T10:47:35+0700 {"ts":"2026-10-18T03:47:35Z","fw":"1.0.0","temperature":30.1,…}
   ```

   Look at the lines with the arrival time `10:47:15`: they all **arrived** at the Pi at once after the router came back on, but their `ts` values go up one minute at a time during the router outage (`03:15:34Z` = 10:15 WIB, and so on). That's the proof of the holding shelf and of the `ts` that's set back. Count the lines whose `ts` lies between the time the router went off and the time it came back on: there should be as many as the packets Node 1 received while the router was off. One fewer is still normal: a reading that arrived in the first few seconds, before Node 1 printed `WiFi DISCONNECTED`, was already sent over an MQTT connection that was in fact already dead.
3. **The data shows up in Node-RED**: the chart on the Garden card runs on without a gap through the hours the router was off, because its time axis uses `ts`.
4. Stop the logger. **On the Pi**: `kill 4721` (the process number from step 6.1). Forgot the number? `pgrep -af mosquitto_sub` shows the number and the command.
5. Write in `notes-module14.md`: the time the router went off, the time it came back on, the last `node2` output, and the percentage of packets that arrived. This is your evidence for ✅.

Is your result below 90%? See 🚨 "Router test: fewer than 90% of packets arrive".

> ⬆️ **Done with Practice 6?** Go back to [Concept 9](#9-battery-life-sleep-is-what-decides-it).

### Practice 7 — Measure the current and work out the battery life (50 minutes)

> 🖥️ **Tools:** **Arduino IDE** (two windows), the INA219 and the measuring circuit from [Module 9 Practice 6](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md#practice-6--node-1-becomes-a-current-meter-ina219-45-minutes), the Node 1 board (USB to the laptop; the Node 1 workbench's MB102 stays off while measuring, as in Module 9), Node 2 on the battery, one spare male–male jumper wire, and `notes-module14.md`. Concepts used: 9.
>
> 🖥️ **Wokwi path:** not available; Wokwi can't measure current or run deep sleep yet. Read the steps, then do the 7.4 calculation with the example numbers.

In Module 9, the Node 1 board became a current meter for the second board. This week works the same way, with one important addition: **the Node 1 board must keep listening for ESP-NOW**. Otherwise Node 2's sends get no ACK, Node 2 retries and searches for the channel, and what you measure is the worst wake, not the usual one.

#### 7.1 Prepare Node 2 and the measuring circuit

1. **A short schedule for measuring.** Remove Node 2's VIN and GND wires from the mini breadboard, plug in its USB, then in `node-2-garden.ino` change `INTERVAL_SECONDS = 60` to `INTERVAL_SECONDS = 30`. Upload, then unplug its USB again. With a 30-second schedule, a summary line appears every half minute; later the results are recalculated for the 5-minute schedule.
2. **Connect the INA219** with the Node 1 workbench powered off: turn off the MB102, then unplug the Node 1 board's USB (the safety rule of Module 5, as in Module 9 Practice 6.2). After that, connect it exactly as in Module 9 Practice 6: its four I2C wires to the Node 1 workbench ([6.2](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md#62-connect-the-ina219-to-node-1s-i2c-bus)), and its **VIN+**/**VIN−** pins inserted in the Node 2 board's 5 V wire ([6.3](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md#63-insert-the-ina219-in-the-second-boards-5-v-line)): VIN+ from the top rail (+) at column 29 and VIN− to 27a. The Node 2 board's VIN wire goes into 27e later, but as in Module 9, it's only plugged in after the meter sketch is running (7.2 step 3). The Node 2 board's GND goes back to the top rail (−) at column 28, and the black male–male shared GND wire connects the Node 1 workbench's bottom rail (−) at column 30 to the mini breadboard's **top** rail (−), for example column 9, not to the mini breadboard's bottom rail. As in Module 9, no (+) rail of the mini breadboard is connected to the Node 1 workbench. Node 2's sensors and its bottom rail don't change.

#### 7.2 A current-meter sketch that also listens to ESP-NOW

1. In the Node 1 board's window, open **File → New Sketch**, delete its contents, then copy in the contents of [`code/module14_current_meter/module14_current_meter.ino`](code/module14_current_meter/module14_current_meter.ino) (open it on GitHub, click **Copy raw file**, then paste). Save it as `module14_current_meter` in the `module-14` folder of the `learn-iot` repository.

   It's the `module09_current_meter` sketch from Module 9, plus a few parts for ESP-NOW. The four most important ones:

   ```cpp
   #include <WiFi.h>
   #include <esp_now.h>  // Module 14: this board also "listens" to Node 2 so that its sends get an ACK

   volatile uint32_t node2Packets = 0;  // Module 14: ESP-NOW packets received while measuring

   // Called by the WiFi task every time an ESP-NOW packet arrives: just count, no Serial.
   void onEspNowReceive(const esp_now_recv_info_t* info, const uint8_t* data, int length) {
     node2Packets = node2Packets + 1;  // not ++: C++20 warns about ++ on a volatile
   }

   // ... in setup():
     WiFi.setSleep(false);
     WiFi.mode(WIFI_STA);
     WiFi.begin();  // the home WiFi saved since the portal of Module 10: the radio moves to the router's channel, the same as Node 2
     if (esp_now_init() == ESP_OK) {
       esp_now_register_recv_cb(onEspNowReceive);
     }
   ```

   `WiFi.begin()` with nothing inside uses the home Wi-Fi saved on the Node 1 board, so its radio is on the router's channel, the channel Node 2 uses. With ESP-NOW running on that channel, Node 2's sends get an ACK as usual, and the callback only needs to count the packets. The cycle summary also gets one new line: the charge of one wake and the number of Node 2 packets received.
2. Plug the Node 1 board's USB back in (the MB102 stays off), select **DOIT ESP32 DEVKIT V1** and the **Node 1** board's port, then click **Upload**. While you're measuring, the Node 1 firmware isn't running, so the dashboard shows Node 1 as `offline`.
3. When the upload has finished, open the Node 1 board's **Serial Monitor** (115200 baud). Its first line must be `Practice 7 - INA219 current meter ready…`; if you missed it because the Serial Monitor only just opened, press **EN** on the Node 1 board now, while Node 2 is still off. After that, plug the Node 2 board's VIN wire into **27e**. Node 2 powers up from the battery, and its current now goes through the INA219.

#### 7.3 Read the results

**Expected output** in the Node 1 board's Serial Monitor (example; one line appears every second, and every time Node 2 wakes up again, a summary of the previous cycle appears):

```text
Practice 7 - INA219 current meter ready, also listening for ESP-NOW. Wake threshold: 20 mA.
…
[  104 s]   4.93 mA (min 4.80, max 5.10)  5.01 V  asleep
CYCLE: awake 0.62 seconds, average 78.4 mA | asleep 29.91 seconds, average 4.95 mA | cycle average 6.44 mA
       awake charge 49 mA.s | Node 2 packets received so far: 3
[  105 s]  50.94 mA (min 4.85, max 248.30)  4.97 V  AWAKE
[  106 s]   4.95 mA (min 4.80, max 5.15)  5.01 V  asleep
```

Wait for three `CYCLE` lines, then write down the numbers from the **last** one in your notes: the **awake** time, the average **awake** current, and the average **sleep** current. The first line summarizes Node 2's first wake after its power was connected again, which also scans for the channel, so its numbers are much bigger. The `max 248.30` in the awake second is the burst while the radio transmits, and `Node 2 packets received so far` proves that Node 2 got an ACK. If that number stays at 0, see 🚨.

#### 7.4 Work out the battery life for a 5-minute schedule

The formula is the same as in Module 9, with one extra step: the measurements with the 30-second schedule are used to calculate the 300-second schedule. With the example numbers above:

| Step | Formula | Example |
| :---: | :--- | :--- |
| 0 | the charge of one wake = awake time × awake current | 0.62 seconds × 78.4 mA ≈ 48.6 mA·s |
| 1 | the 5 V side average for a 300-second schedule = (awake charge + sleep current × (300 − awake time)) ÷ 300 | (48.6 + 4.95 × 299.38) ÷ 300 ≈ 5.10 mA |
| 2 | the battery side current = the 5 V side average × 1.6 (MT3608, Module 9) | 5.10 × 1.6 ≈ 8.16 mA |
| 3 | usable capacity = printed capacity × 0.8 | 2,500 × 0.8 = 2,000 mAh |
| 4 | battery life = usable capacity ÷ battery side current | 2,000 ÷ 8.16 ≈ 245 hours ≈ **10 days** |

Is your result around one to one and a half weeks? That matches Concept 9. Also compare the awake charge with the sleep charge in one 5-minute cycle: 48.6 mA·s compared with 4.95 × 299.38 ≈ 1,482 mA·s. Sleep is what decides it.

#### 7.5 Proof in numbers: the soil sensor on 3V3 (10 minutes, highly recommended)

1. First unplug the Node 2 board's VIN wire from 27e (Node 2 goes off; the safety rule of Module 5). Pull the end of the soil sensor's **VCC** wire off the Node 2 board's D32 pin. Plug the spare male–male jumper wire into the end of that wire, then plug its other end into the **bottom rail (+)** (3.3 V), for example column 18. Plug the VIN wire back into 27e. The soil sensor is now on all the time, as on Node 1.
2. Wait for three `CYCLE` lines, then use the last one. The first one appears as soon as VIN is plugged back in and still summarizes the old cycle, including the time Node 2 was off; the second one also scans for the channel, because Node 2 has just powered up again. **Expected output** (example):

   ```text
   CYCLE: awake 0.62 seconds, average 83.1 mA | asleep 29.91 seconds, average 9.87 mA | cycle average 11.36 mA
          awake charge 52 mA.s | Node 2 packets received so far: 9
   ```

   The sleep current goes up by about 5 mA, almost double. Redo steps 1–4 with these numbers: the battery life drops to about **five days**.
3. Unplug the Node 2 board's VIN wire from 27e again, put the end of the soil sensor's VCC wire back on the **D32** pin, put the jumper wire away, then plug VIN back into 27e.

#### 7.6 Put everything back

1. Unplug the Node 1 board's USB (the MB102 is still off). Unplug the Node 2 board's VIN wire from 27e (Node 2 goes off), then remove the INA219: the VIN+ and VIN− wires from the mini breadboard, the four I2C wires from the Node 1 workbench, and the shared GND wire (put the INA219 away). Finally, plug the Node 2 board's VIN wire into the top rail (+) at column 29, the hole the INA219's VIN+ wire just left, as in ➕ A of Module 9.
2. Plug the Node 1 board's USB back in, then **upload Node 1 v1.3.0 again** (**ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**). Turn on the MB102 (if you have a regulated microSD module, press **EN** on the Node 1 board afterwards, as in Module 12). The dashboard shows Node 1 as `online` again.
3. Leave Node 2's `INTERVAL_SECONDS` at `30` for now; Practice 8 uploads Node 2 again, and section ➕ puts it back to `300`.

> ⬆️ **Done with Practice 7?** Go back to [Concept 10](#10-security-esp-now-encryption-and-secrets-you-never-broadcast).

### Practice 8 — ESP-NOW encryption (30 minutes)

> 🖥️ **Tools:** **GitHub Desktop** with the `mini-smart-home` repository, **Arduino IDE** with two windows (`node-1-home.ino` and `node-2-garden.ino`), the Node 1 board and the Node 2 board plugged into the laptop (Node 2's VIN and GND wires removed from the battery circuit), and your password manager or private notes (not the module notes). Concepts used: 10.
>
> 🖥️ **Wokwi path:** Node 1 in Wokwi can be compiled with `keys.h` (step 8.3), but the mock Node 2 doesn't go through the radio, so the encryption can't be tested. Do 8.1–8.3 to practice keeping secrets, then read the rest.

The Node 1 v1.3.0 and Node 2 v1.0.0 firmware is already ready for encryption. As long as there's no **`keys.h`** file, both run without encryption. As soon as `keys.h` is created in both folders with the same content, ESP-NOW is locked.

#### 8.1 Put the `.gitignore` guard in place first

Just like `secrets.h` in Module 10, the guard goes in **before** the file is created, so that `keys.h` never gets a chance to be committed. The difference: this time the guard goes into the `mini-smart-home` repository, not `learn-iot`.

1. In GitHub Desktop, choose the **`mini-smart-home`** repository.
2. Open the menu **Repository → Repository settings…** (macOS: **Repository Settings…**), then choose the **Ignored files** tab (macOS: **Ignored Files**). Its text box is probably still empty, because this repository was created without a `.gitignore` in Module 3.
3. Write `keys.h` in that text box (if there's already something in it, add it on the very bottom line), then click **Save**.
4. The **Changes** list now holds `.gitignore`, plus the files you changed in Practices 3–4 (the Node 1 and Node 2 firmware, and `tools/contract-checker.js`). This commit is only for `.gitignore`: click the checkbox above the list until all the checkmarks are gone, then check `.gitignore` only. Fill in **Summary** with `Ignore keys.h (Module 14)`, click **Commit … to main**, then **Push origin**. The other files keep waiting in **Changes** and are committed together in ➕ E.

#### 8.2 Make two 16-character keys

Make two strings of **exactly 16** letters and digits, different from each other, for example with the password generator in your password manager (choose a length of 16, letters and digits only, no symbols). One is for the **PMK**, the other for the **LMK** (Concept 10). Keep both in your password manager or your private notes, **not** in `notes-module14.md` and not in the repository.

#### 8.3 Create `keys.h` in both firmware folders

1. In the `node-1-home` window, create a new tab (**⋯ → New Tab**) named **`keys.h`**, then fill it with this text. Replace the two example strings with your keys, keeping them inside the double quotes:

   ```cpp
   // keys.h - ESP-NOW encryption keys (Module 14, Practice 8). Does NOT go to GitHub: its name is in .gitignore.
   // Its content must be EXACTLY THE SAME in the node-1-home and node-2-garden folders.
   #pragma once
   const bool USE_ENCRYPTION = true;
   const char KEY_PMK[] = "ReplaceWith16Chr";  // exactly 16 letters/digits
   const char KEY_LMK[] = "AlsoReplace16Chr";  // exactly 16 letters/digits
   ```

2. Save (**Ctrl + S**). In the `node-2-garden` window, create a **`keys.h`** tab with **exactly the same** content, then save.
3. Also create a **`keys.example.h`** tab in both windows, then fill it with [`code/node-1-home/keys.example.h`](code/node-1-home/keys.example.h) (open it on GitHub, click **Copy raw file**, then paste). Its content is like `keys.h`, but with `USE_ENCRYPTION = false` and example keys. No code uses this file. It may go to GitHub, and it's useful as a reminder: if one day you copy the project to another laptop, you know which file you have to create.

Is your key not 16 characters long? Arduino IDE refuses to compile and prints (real output, with the folder path cut off):

```text
bridge.cpp:22:31: error: static assertion failed: KEY_PMK in keys.h must be exactly 16 letters/digits
```

#### 8.4 Upload Node 1, then Node 2

1. Upload **Node 1** first (**ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**). Among its first lines, Node 1's Serial Monitor prints (example, shortened):

   ```text
   [00:00:02] INFO  Node 2 bridge ready: listening for ESP-NOW from 246f28b1c7d4, encryption on.
   ```

2. Node 2 is still running firmware **without** the keys. Wait one minute, then type `node2` in Node 1's Serial Monitor: the `received` number **stays at 0**, and its first line still says `not heard yet` (Node 1 has just restarted because of the upload, so its counts start from zero). A Node 1 that has registered Node 2 as an encrypted peer only accepts encrypted packets from that address. This is exactly what stops an impostor who doesn't know the keys.
3. Remove the Node 2 board's VIN and GND wires from the mini breadboard, and only then plug its USB into the laptop (safety rule 1). Upload **Node 2** (**DOIT ESP32 DEVKIT V1**). As soon as Node 2 is on again, Node 1's Serial Monitor prints (example; the sensor reading lines every 2 seconds and `Published telemetry` aren't quoted):

   ```text
   [00:03:41] INFO  Node 2: packet #1 received (attempt 1, signal -47 dBm).
   [00:03:41] INFO  Node 2 ONLINE.
   ```

   Type `node2`: its first line says `encryption on`, and the `received` number goes up again every time Node 2 wakes up.

#### 8.5 Test a key that is one character off

1. In **Node 2's** `keys.h` only, change one character of `KEY_LMK`, then upload it to Node 2.
2. Watch **Node 1's** Serial Monitor: there are no more `Node 2: packet … received` lines, and the `node2` command shows a `received` number that has stopped going up. There's no message about a wrong key: packets with the wrong key are simply thrown away (Concept 10). About 2.5 minutes later (3 × the 30-second schedule + 1 minute), Node 1 only prints `ERROR Node 2 OFFLINE: no packet for 150 seconds.` To Node 1, it's as if Node 2 had gone silent.
3. Also watch **Node 2's** Serial Monitor. Its report probably still says `sent`, because Node 1's radio sends the ACK as soon as the frame arrives, before its content is unlocked (Concept 2). So the only evidence you can trust is the count on Node 1.
4. Put that character back, upload Node 2 again, and make sure Node 1 prints `Node 2: packet #… received` again.
5. Leave Node 2 plugged into USB. Section ➕ A uploads it once more with the 5-minute schedule, then connects it to the battery for good.

#### 8.6 Make sure `keys.h` never goes to GitHub

Open GitHub Desktop. The **Changes** list may hold `keys.example.h` and other firmware files you changed, but it **must not** hold `keys.h`. If `keys.h` shows up, don't commit it: check the `keys.h` line in **Ignored files** again (step 8.1). All the Module 14 changes are committed together in section ➕ E.

> ➡️ **Done with Practice 8?** Do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1), then the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home).

---

## 🚨 Troubleshooting

Many ESP-NOW tutorials on the internet were written for esp32 package 2.x. If a tutorial does it the way in the left column, translate it into this week's way:

| Old tutorial | The way now (this module, esp32 package 3.3) |
| :--- | :--- |
| the receive callback `OnDataRecv(const uint8_t *mac, const uint8_t *incomingData, int len)` | `(const esp_now_recv_info_t *info, const uint8_t *data, int len)`; the sender's address is in `info->src_addr` (Concept 6) |
| the send callback `OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status)` | `(const esp_now_send_info_t *info, esp_now_send_status_t status)` |
| `esp_now_register_send_cb(esp_now_send_cb_t(OnDataSent))` (forced with a cast) | no cast: change the function's shape (Concept 6) |
| `Serial.print()` inside the callback | hand it over to a queue, print in `loop()` (Concept 6) |
| `WiFi.macAddress()` called before `WiFi.mode()` | the result is `00:00:00:00:00:00`; use `esp_read_mac(mac, ESP_MAC_WIFI_STA)` as in the Quick Win sketch, which can be called at any time |
| `esp_now_peer_info_t peerInfo;`, then a few fields filled in | `esp_now_peer_info_t peer = {};` so that all fields are zeroed first, then `peer.ifidx = WIFI_IF_STA;` |
| `struct struct_message { … }` without `packed` | `struct __attribute__((packed)) …` together with a `static_assert` of its size (Concept 5) |
| the sender uses a guessed channel (often channel 1) | the sender finds the router's channel by scanning for the Wi-Fi name (Concept 3) |

The sections below are collapsed; click a title to open it.

<details>
<summary><b>Compilation fails: <code>invalid conversion from 'void (*)(const uint8_t*, …)' … to 'esp_now_send_cb_t'</code></b></summary>

- You're using code from an old tutorial. Change the callback's shape following the last row of the table in [Concept 6](#6-callbacks-the-esp32-3x-way-drop-it-in-the-mailbox-process-it-in-loop). Don't patch it with a cast.
- Your code is exactly as in this module, but the error mentions `esp_now_send_info_t` or `esp_now_recv_info_t`? Then the esp32 package in your Arduino IDE is still an old version that doesn't know those names yet. Open the **Boards Manager**, search for `esp32`, then install **3.3.12** ([🧰](#-what-you-need)).

</details>

<details>
<summary><b>Node 2 keeps printing <code>FAILED</code></b></summary>

`FAILED` means Node 1's radio didn't reply with an ACK in three attempts. Check these one by one:

1. **Is the Node 1 board on and running a program that connects to the Wi-Fi?** While the Node 1 board runs another sketch that doesn't connect to the router, its radio stays on channel 1.
2. **Is the channel the same?** Compare the `channel` number in Node 2's report with the `router channel` from the `wifi` command in Node 1's Serial Monitor. If they differ, press **EN** on the Node 2 board: its RTC memory is emptied, and Node 2 scans again.
3. **Is `MAC_NODE1` right?** It must hold the Node 1 board's MAC address from Quick Win step 2, which is Node 1's `device_id` (`a4cf12e5b7c0` becomes `{0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0}`). Get just one digit wrong, and the packet flies off to an address that doesn't exist.
4. **Too far away?** Bring the two boards closer, then look at the `signal` number in Node 1's log. Around −90 dBm is already risky.
5. **Still failing?** For now, set `FIXED_CHANNEL` in Node 2 to Node 1's `router channel` number. If that works, the problem is in the channel search; see the next two sections.

</details>

<details>
<summary><b>Node 2: <code>WiFi "…" not found: is the router off, or is the name misspelled?</code></b></summary>

- `WIFI_NAME` must be **exactly** the same as your home Wi-Fi's name, including uppercase and lowercase letters, spaces, and punctuation. Copy it from the Wi-Fi list on your phone.
- Does your router have two names, for example `OurHome` and `OurHome_5G`? Use the **2.4 GHz** name. The ESP32 can't see 5 GHz Wi-Fi (Module 10).
- Is your Wi-Fi name hidden (*hidden SSID*)? This module's scan doesn't find it. Set `FIXED_CHANNEL` to the router's channel (the `wifi` command on Node 1), and lock the router's channel so that it doesn't change (Practice 1.5).
- Is the router off right now? That's fine: Node 2 keeps using its old channel and tries again later.

</details>

<details>
<summary><b>A home with several Wi-Fi access points with the same name (<i>mesh</i> Wi-Fi or range extenders)</b></summary>

Node 2's scan takes the first Wi-Fi access point it finds with that name. If your home uses mesh Wi-Fi or range extenders, that access point may be on a different channel from the access point Node 1 is connected to. The symptom: `FAILED` again and again, even though the `channel` number in Node 2's report looks normal.

1. Type `wifi` in Node 1's Serial Monitor, then write down the `router channel`.
2. Set `FIXED_CHANNEL` in Node 2 to that number, then upload Node 2 again.
3. A mesh system may move Node 1 to another access point, and the channel changes with it. If your mesh router's app can lock the 2.4 GHz channel, lock it on 1, 6, or 11.

</details>

<details>
<summary><b>Node 2: <code>Channel 12 refused by the ESP32. Is the router on channel 12 or 13? …</code></b></summary>

An ESP32 that isn't connected to a router may only use channels 1–11 (Concept 3). Change the router's channel to 1, 6, or 11 (Practice 1.5). If you can't change that router, Node 2 can't talk to Node 1 as long as Node 1 is connected to that router.

</details>

<details>
<summary><b>Node 1: <code>ESP-NOW from … rejected: not MAC_NODE2 in config.h.</code></b></summary>

- Is the address in that message your Node 2's? Then `MAC_NODE2` in `config.h` hasn't been replaced yet, or one of its digits is wrong. Copy the line `Copy into MAC_NODE2 in Node 1's config.h: {…}` from Node 2's Serial Monitor (first remove its VIN and GND wires, plug in the USB, then press **EN** on the Node 2 board so that the line appears again), then upload Node 1 again.
- Is it a stranger's address? Broadcast packets have already been thrown away before this (the `dropped` count), so this packet was sent straight to Node 1's address. Usually the sender is another ESP32 of yours that still holds this board's `MAC_NODE1`, for example an old board that once ran Node 2. Node 1 has already rejected it; switch that board off or upload a different program to it. This message appears at most once a minute, so that the log doesn't fill up.

</details>

<details>
<summary><b>Node 1: <code>Node 2 packet with mark … version … rejected</code>, or the <code>dropped</code> count keeps growing</b></summary>

- `Node 2 packet with mark 0x52 version 2 rejected` (or another version): the contents of `node2-packet.h` differ between the two folders. Copy the same file from the curriculum into `node-1-home` and `node-2-garden` again, then upload both.
- `dropped` grows every time Node 2 wakes up: the packets arriving aren't 33 bytes or were sent as a broadcast, so Node 1's Wi-Fi task throws them away before they're checked. Usually the Node 2 board is still running a practice sketch (`module14_find_channel` sends the text `hello from the garden`). Upload Node 2 v1.0.0. If `dropped` keeps growing without following Node 2's wake schedule, another ESP-NOW device near your home is broadcasting packets on the same channel. Node 1 already throws them away; you don't need to do anything.

</details>

<details>
<summary><b>Node 1 receives Node 2's packets, but nothing shows up in MQTTX or Node-RED</b></summary>

Type `node2` in Node 1's Serial Monitor, then look at the line `published … waiting on the shelf …`:

- **`waiting on the shelf` keeps growing, `published` stays the same:** Node 1 can't publish yet. Type `wifi`: the Wi-Fi and MQTT must be connected, and the clock must be set. A Node 1 that has just powered up without internet holds back every reading until its clock is set from NTP (Concept 7).
- **`published` grows, but MQTTX is silent:** check your subscription topic. Node 2's `device_id` is written **in lowercase letters without colons**, for example `msh/246f28b1c7d4/#`, not `msh/24:6F:28:B1:C7:D4/#`. Also make sure MQTTX is connected to the same broker as Node 1.
- **MQTTX receives, but the Garden card is empty:** the topics in the `telemetry Node 2` and `status Node 2` nodes still hold the curriculum's `246f28b1c7d4` (Practice 5.2), or you haven't clicked **Deploy** yet.

</details>

<details>
<summary><b>The contract checker prints <code>FAIL</code> for Node 2's messages</b></summary>

- `field "light" is missing` … `field "pressure" is not in the data contract`: your checker is still version 1.0. Replace it with version 1.1 (Practice 4.5).
- `"pressure" must be a number from 300 to 1100 or null, got 100860`: the pascal value from `readPressure()` wasn't divided by 100 (Concept 4). The v1.0.0 firmware from the curriculum already divides it; check the changes you made yourself.
- `field "motion" is not in the data contract` (or another Node 1 field): a Node 1 field was sent along in a Node 2 message. Contract 1.1 sets the fields **per device** (Concept 7).

</details>

<details>
<summary><b>BME280: <code>BME280 not found …</code> or <code>The chip at 0x76 is not a BME280 (chip ID 0x58 …)</code></b></summary>

- **Not found:** check its four wires against the labels printed on the BME280 module (Practice 2.3). SDA to D21, SCL to D22, and VIN to the bottom rail (+), which only has power if the board's 3V3 pin is already connected to that rail (Practice 2.2). A loose rail connection is the main suspect.
- **Chip ID `0x58`:** your module is a BMP280, not a BME280. The BMP280 has no humidity sensor, and the BME280 library refuses it, so the temperature, humidity, and pressure are sent as `null`. Node 2 keeps running and its soil data still shows up, but replace the sensor with a real BME280 (Module 7 already showed how to check it before you buy).

</details>

<details>
<summary><b>Soil temperature <code>nan</code></b></summary>

The DS18B20 isn't answering: the library marks that with `-127`, and the firmware turns it into `NAN`. Check the connections from Practice 2.4: the adapter's VCC to the bottom rail (+), GND to the bottom rail (−), DAT still to **D27**. If your sensor worked before Practice 2 and doesn't after it, most likely the VCC or GND wire that was moved to the rail isn't pushed in far enough.

</details>

<details>
<summary><b>Soil <code>-1 %</code>, or a soil percentage that makes no sense</b></summary>

- **`Soil sensor: raw value … is impossible, sent as failed.`** The raw value is far outside the calibration range. The causes: the AOUT end isn't plugged onto **VN**, the VCC end isn't on **D32**, or `SOIL_DRY` and `SOIL_WET` still hold Node 1's values. Repeat the Practice 2.7 calibration with the final circuit.
- **The dry and wet values differ by less than 500:** read the label on the eight-legged chip on the sensor. An NE555 chip isn't suitable for 3.3 V (Module 6, Concept 6). Did you already use your second sensor for Node 1 because the first one had an NE555? Get one sensor with a TLC555 chip ready for Node 2.
- **The percentage goes up and down on every wake even though the soil doesn't change:** the sensor hasn't settled yet when it's read. Raise `SOIL_SETTLE_MS` to `500` (Practice 4.2).

</details>

<details>
<summary><b>Node 2 on battery never wakes up again: the blue LED no longer blinks</b></summary>

1. Look at Node 1's Serial Monitor: when did the last packet arrive (`node2` → `last packet … seconds ago`)?
2. Measure the battery voltage with a multimeter (Module 9). Below about 3.3 V, the battery is almost empty; if it keeps dropping, the TP4056's protection chip cuts the power completely. Recharge it while someone watches it.
3. Measure the MT3608's output on the top rail (+): it must be 5.0 V. If it's much lower, the board's regulator doesn't work properly (Module 9).
4. Check the board's VIN wire to the top rail (+) at column 29 and its GND wire to the top rail (−) at column 28.
5. Still not waking up even with a full battery? Remove VIN and GND, plug in the USB, then look at Node 2's Serial Monitor (press **EN** if needed). If Node 2 wakes up normally on USB, the problem is in the battery supply (items 2–4); if it doesn't, its wake report usually shows the problem.

</details>

<details>
<summary><b>Node 2's battery runs out much faster than expected</b></summary>

In order, from the most common:

1. **The soil sensor's VCC is connected to 3V3, not D32.** The sleep current goes up by about 5 mA, and the battery life drops to half (Practice 7.5).
2. **Node 2 scans for the channel on every wake.** Node 2's report shows `Awake` above 2,000 ms again and again. The cause is usually sends that keep ending in `FAILED` (see the section above): after two failures, Node 2 scans again, and every failure adds two retries.
3. **A fake battery.** A "9,900 mAh" battery usually holds only about 1,000 mAh (Module 9).
4. **The BME280 code was changed** so that `setSampling(… MODE_FORCED …)` is gone and the BME280 measures nonstop.

The best evidence: measure its sleep current with the INA219 (Practice 7). A sleep current above 6 mA means something stays on while Node 2 sleeps.

</details>

<details>
<summary><b>Router test: fewer than 90% of packets arrive</b></summary>

Look at Node 1's log and the `node2` command, then match them with these symptoms:

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| Almost every packet is lost from the moment the router is unplugged | Node 1 keeps scanning: the line `WiFi.setAutoReconnect(false);` isn't in place yet, or Node 1 is still v1.2.1. On an incomplete v1.3.0, `wifi` during the router outage often shows a `radio channel` that differs from the `router channel` (v1.2.1 doesn't have that line yet). | Check step 3.4, items 2 and 3, then upload Node 1 v1.3.0 again |
| One packet lost every few minutes, many `attempt 3` | Node 2 happens to send while Node 1 is scanning (Concept 8) | Normal if it's rare. If it's frequent, move Node 2 closer so that its signal is stronger |
| Every packet is lost **after** the router is back on | A router with its channel on **Auto** picked another channel when it powered up, and Node 2 only searches again after two failures | Lock the router's channel (Practice 1.5), then repeat the test |
| The `node2` counts go back to zero in the middle of the test | Node 1 restarted (for example, its USB cable got bumped). The counts and the holding shelf live in RAM. | Repeat the test without touching the Node 1 board |
| The percentage is small even though only one or two packets were lost | Node 2 still wakes every 300 seconds, so there are too few packets (Concept 8) | Change `INTERVAL_SECONDS` to `60` during the test |
| `signal` below −85 dBm | Node 2 is too far away or blocked by walls | Move Node 2 closer for this test |

</details>

<details>
<summary><b>After the router comes back, the data from while it was off is incomplete on the Pi or on the chart</b></summary>

- **`evicted` is above 0:** the holding shelf was full. The shelf holds 96 readings, so with the 60-second test schedule, a router that's off for more than 96 minutes always pushes out the oldest readings.
- **The `node2` counts went back to zero:** Node 1 restarted at some point, and what was on its shelf (in RAM) is lost.
- **`garden.log` on the Pi stops in the middle:** the logger was started without `nohup … &`, so it died along with the SSH window when that dropped (Practice 6.1).
- **The data is in `garden.log`, but the Garden chart has a gap, or all its points pile up at one moment:** the chart's **X:** field is still of type **timestamp**. Change it to **key:** `time` (Practice 5.4).

</details>

<details>
<summary><b>Encryption (Practice 8): after <code>keys.h</code> is added, Node 1 receives nothing</b></summary>

- Both `keys.h` files must be **exactly the same**: open them side by side, then compare them character by character, including uppercase and lowercase.
- `USE_ENCRYPTION = true` must be in **both** files. Keys on one side only are the same as different keys.
- Is `keys.h` in both folders? If Node 2 doesn't find it, Node 2 runs without encryption and doesn't show any message. Look at the row of tabs in the `node-2-garden` window.
- The keys may only hold plain letters and digits. A letter like `é` takes up two bytes, so `static_assert` refuses it even though it looks like 16 characters.
- Does Node 1 print `Failed to register Node 2 as an encrypted peer.`? Check `MAC_NODE2`, then upload Node 1 again.

</details>

<details>
<summary><b>Uploading to Node 2 fails, or the Node 2 board keeps <i>restarting</i></b></summary>

- The battery circuit's VIN and GND wires **must be removed** before the USB is plugged in (safety rule 1). Two power sources at once can fight each other.
- Does the upload stop at `Connecting…` because Node 2 is asleep? Hold **BOOT** as soon as `Connecting…` appears, then let go when `Writing at …` starts running.
- While the USB is plugged in and the Serial Monitor is open, Node 2 prints a report every time it wakes up, with `rst:0x5 (DEEPSLEEP_RESET)` in between. That isn't a restart caused by a problem; it's how deep sleep works (Module 9).

</details>

<details>
<summary><b>Yellow warnings while compiling: <code>extra tokens at end of #undef directive</code> or <code>-Wdeprecated-enum-enum-conversion</code></b></summary>

Those warnings come from the **OneWire** 2.3.8 and **Adafruit INA219** 1.2.3 libraries, not from your code, and they only show up if the **Compiler warnings** option in **File → Preferences** isn't set to **None**. The esp32 package 3.3 uses newer C++ rules than when those libraries were written. As long as `Sketch uses …` appears at the end, the compilation succeeded.

</details>

<details>
<summary><b>Wokwi: <code>sent: the receiver replied with an ACK</code>, although there is no receiver</b></summary>

The Wokwi simulator (tried in October 2026) always reports an ESP-NOW send as successful, even when there's no receiving board. ACK reports from Wokwi can't be trusted. Testing the ACK, failures, and the channel needs two real boards. This module's Wokwi path uses a **mock Node 2** inside the Wokwi Node 1 (Practice 3) to test the bridge, the holding shelf, and Node-RED.

</details>

<details>
<summary><b>Practice 7: <code>Node 2 packets received so far: 0</code></b></summary>

The current-meter sketch isn't receiving Node 2's sends, so Node 2 gets no ACK, and what you measure is the worst wake.

- The Node 1 board must hold the home Wi-Fi's name and password (from the Wi-Fi portal of Module 10). If they were erased, for example because **Erase All Flash Before Sketch Upload** was set to **Enabled** at some point, or because of the `wifi forget` command, `WiFi.begin()` with nothing inside doesn't connect anywhere, and its radio stays on channel 1. Upload Node 1 v1.3.0 again, fill in the Wi-Fi portal, then upload the meter sketch again.
- The router must be on while you measure.
- Node 2 must be running v1.0.0 with the Node 1 board's `MAC_NODE1`.

</details>

---

## 🔬 Technical Deep Dive (optional)

You may skip this section. It's for the curious, and the next modules don't depend on it.

<details>
<summary><b>Measuring Node 2's battery voltage on the VP pin</b></summary>

The Garden card already has a **Battery** line, and Node 1 already knows how to publish the `battery` field. The only thing missing is the circuit. Its design was covered in Module 9 🔬: a **voltage divider** of two equal resistors from the TP4056's **OUT+** to its **OUT−**, with the midpoint going to the **VP** pin (GPIO 36). A 4.2 V battery becomes 2.1 V at the midpoint, safe for the ADC.

**Parts:** two **100 kΩ** resistors (bought separately, very cheap) and one **100 nF** capacitor from the kit (Module 6). The kit's 10 kΩ resistors work too, but they draw about 0.2 mA all the time, ten times as much, so the battery life drops by about 2–3%. Resistors as big as 100 kΩ make the midpoint "weak", so the 100 nF capacitor is **required** for the ADC to read a steady number.

**Install it with the battery taken out of its holder** (the Module 9 rule), on the top half of the mini breadboard:

| Part | First leg | Second leg |
| :--- | :--- | :--- |
| First 100 kΩ resistor | 12a (the same column as the TP4056's OUT+) | 16a |
| Second 100 kΩ resistor | 16b | top rail (−), around column 17 |
| 100 nF capacitor | 16c | top rail (−), around column 18 |
| Male–female wire | 16e | the Node 2 board's **VP** pin |

Column 16 becomes its midpoint. Don't connect this divider to B+/B− (it would keep draining the battery even after the protection has cut it off) or to the top rail (+) (always 5.0 V, however full the battery is).

**The program:** in `node-2-garden.ino`, change `HAS_BATTERY_DIVIDER = false` to `true`, then upload (first remove the battery circuit's VIN and GND). When the upload has finished, unplug the Node 2 board's USB, put the battery back in, then connect VIN and GND (safety rule 1). As soon as Node 2 wakes up, the `telemetry` message in MQTTX gets a new field, for example `"battery":3.98`, and the Garden card shows `Battery 3.98 V`. The function `readBatteryMv()` reads VP eight times with `analogReadMilliVolts()`, **before** the radio turns on, because the battery voltage dips for a moment every time the radio transmits.

**Correct it with a multimeter.** The ESP32's ADC can be off by about 0.1 V on the battery side. Measure the voltage between OUT+ and OUT− with a multimeter, then compare it with `battery` in MQTTX. For example, the multimeter shows 4.05 V, while MQTTX shows 3.98 V: calculate 2.0 × 4.05 ÷ 3.98 ≈ 2.035, then change `DIVIDER_FACTOR` to `2.035` (in the code, always with a decimal point) and upload again.

This number is good enough to know when to recharge (for example below 3.5 V), but it isn't an accurate "percent remaining" (Module 9). As a bonus, the 72-hour test in ➕ B shows a voltage line that slowly goes down.

</details>

<details>
<summary><b>BLE basics: reading the garden temperature on a phone with nRF Connect</b></summary>

Besides Wi-Fi and ESP-NOW, the ESP32's radio can also speak **Bluetooth Low Energy** (BLE), the protocol used by smartwatches and Bluetooth thermometers. BLE works with a ***peripheral*** (a small device that provides data) and a ***central*** (the phone that reads it). Its data is grouped into **services**, which hold **characteristics**, each with its own number (a UUID). For environmental data, there are standard numbers: the service `0x181A` (*Environmental Sensing*) with the temperature characteristic `0x2A6E` (*Temperature*), in units of 0.01 °C.

The sketch [`code/module14_ble_temperature/module14_ble_temperature.ino`](code/module14_ble_temperature/module14_ble_temperature.ino) turns the Node 2 board into a peripheral named `Garden-BLE` that provides the DS18B20 temperature and notifies the phone every 2 seconds.

1. Remove Node 2's VIN and GND from the battery circuit, plug in the USB, then upload that sketch to the Node 2 board. The sketch uses the BLE library built into the esp32 package, so you don't need to install a new library. It's about 1.1 million bytes (83%), much bigger than the ESP-NOW sketches.
2. Install **nRF Connect for Mobile** (Nordic Semiconductor) from the Play Store or the App Store on your phone.
3. On the **SCANNER** tab, tap **SCAN** (iPhone: the **Play** icon at the top right), look for `Garden-BLE`, then tap **CONNECT**.
4. Open the service numbered `0x181A` (usually called *Environmental Sensing*), then the characteristic `0x2A6E` (*Temperature*). Tap the **single down arrow** icon to read its value once, or the **multiple down arrows** icon to turn on notifications. The value shows up as raw bytes, for example `(0x) A5-0A`. Node 2's Serial Monitor prints how to read it, for example `Temperature 27.25 C -> BLE value 2725 = 0x0AA5, sent low byte first: A5-0A`. So `0x0AA5` = 2,725 hundredths of a degree, which is 27.25 °C. The smallest byte comes first, just like in the 33-byte packet (Concept 5). Depending on its version, the app may also show the number in degrees.
5. When you're done trying it, upload Node 2 v1.0.0 again, unplug its USB, then put it back on the battery as in Practice 4.6.

**Why a separate sketch, not merged into Node 1 or Node 2?** BLE and Wi-Fi share one radio, so the two take turns using the radio's time, and Node 1 could miss ESP-NOW packets. The program also swells: even a BLE sketch this small is already about 1.1 million bytes. And Wokwi can't simulate Bluetooth yet. BLE suits devices that a phone reads from close by, for example while you install a device in the garden; it isn't meant for sending data to the gateway every 5 minutes.

</details>

<details>
<summary><b>The <code>ESP_NOW</code> library built into the esp32 package: the class way</b></summary>

The esp32 package 3.x also comes with an Arduino-style ESP-NOW library (`#include <ESP32_NOW.h>`), with its examples under **File → Examples → ESP_NOW**. This module deliberately uses the `esp_now_*` C functions from ESP-IDF, because that library demands a C++ concept we haven't learned yet: derived classes.

```cpp
#include <WiFi.h>
#include <ESP32_NOW.h>

// The library requires a derived class: ESP_NOW_Peer's send() may not be called from outside the class.
class PeerNode1 : public ESP_NOW_Peer {
public:
  PeerNode1(const uint8_t *mac, uint8_t channel) : ESP_NOW_Peer(mac, channel, WIFI_IF_STA, nullptr) {}
  bool registerPeer() { return add(); }
  bool sendPacket(const uint8_t *data, size_t length) { return send(data, length) == length; }
  void onSent(bool success) override { /* called by the WiFi task, just like the send callback */ }
};
```

Its advantages: the library adapts itself to the ESP-IDF version (its users aren't hit by the callback change in package 3.3), and `ESP_NOW.getMaxDataLen()` tells you the packet limit: 250 bytes, or 1,470 bytes for ESP-NOW version 2. There are two traps the author has tested:

- The default interface of the `ESP_NOW_Peer` constructor is `WIFI_IF_AP`. A sketch that uses STA mode must write `WIFI_IF_STA`, as above.
- The library's documentation writes `onReceive(const uint8_t *data, int len, bool broadcast)`, while the library's code uses `size_t len`. If you follow the documentation and write `override`, compilation fails with `marked 'override', but does not override`. If you leave out `override`, compilation **still succeeds**, but your function is never called. The only sign is one yellow warning, `… onReceive(const uint8_t*, size_t, bool)' was hidden`, which appears because **Compiler warnings** in **File → Preferences** has been set to **More** since Module 8; with Arduino IDE's default setting (**None**), even that warning doesn't appear. Always write `override`: a clear error is better than a function that quietly doesn't work.

</details>

<details>
<summary><b>ESP-NOW "mesh": when you need it, and which ones really are ESP-NOW</b></summary>

Mini Smart Home has only one sensor node, and Node 1 hears it directly. If the garden is far away and there are many sensor nodes, packets need to be **relayed** from node to node: that's a mesh (a net-like network). A few names that often come up together with ESP-NOW:

| Name | Built on | Notes |
| :--- | :--- | :--- |
| The `ESP_NOW_Network` example (esp32 package) | ESP-NOW | The nodes pick one "leader" and send to it; no multi-hop relaying yet. |
| The `espressif/esp-now` component | ESP-NOW + extra layers | Multi-hop relaying, Wi-Fi provisioning, OTA, and its own encryption. An ESP-IDF component, not an Arduino library. |
| ESP-WIFI-MESH (ESP-IDF) | ordinary Wi-Fi | Not ESP-NOW. Every node must always be awake, so it doesn't suit batteries. |
| painlessMesh (Library Manager) | ordinary Wi-Fi + TCP | Not ESP-NOW, with the same need to stay awake. |

According to Espressif, ESP-NOW suits networks of fewer than about 100 devices. A node that acts as a "relay" must always be awake to listen, so it needs a fixed power supply, just like Node 1.

</details>

<details>
<summary><b><i>Long Range</i> (LR) mode: a range of up to about 1 km</b></summary>

The ESP32 has a special Espressif radio mode, **LR** (*Long Range*), which trades speed for distance. Its rate is only 0.5 or 0.25 Mbps, but its receiver is more sensitive, so the range can be more than double, up to about 1 km in open space with no obstacles.

Why don't we use it? The Arduino function `WiFi.enableLongRange(true)` puts the radio **only** in LR mode, but ordinary routers don't know LR. A Node 1 that uses it can no longer connect to the home Wi-Fi. The official ESP-IDF example uses LR together with the normal mode, and **both** boards must turn it on. For a garden in the yard, ordinary ESP-NOW is enough. For rice fields kilometers away, there's another protocol: LoRa, covered in Module 15.

</details>

<details>
<summary><b>Why updating Node 2's program over the air (OTA) is tricky</b></summary>

Node 1 will learn to receive a new program over Wi-Fi in Module 28 (*Over-The-Air*, OTA). For Node 2, the story is much harder:

1. **Node 2 is almost always asleep.** It only listens for a moment after sending. Node 1 would have to "cut in" exactly in that window, for example by replying "don't sleep yet, there's a new program".
2. **The program is big.** The Node 2 firmware is about 940,000 bytes, the same as about 3,800 ESP-NOW packets of 250 bytes. Every packet must be numbered, answered, sent again if it's lost, and written to memory, and then the whole program must be checked for completeness before the board restarts. The radio stays on for tens of seconds, and the battery must last until it's done.
3. **If Node 2 connected to the router for OTA**, it would need the Wi-Fi password, but Node 2 deliberately never knows that password (Concept 10).
4. **A program that isn't signed** can be replaced by anyone who can send packets to Node 2. Signing programs is covered in Module 28.

The official `espressif/esp-now` component even needs "resume from where it broke off" and "roll back to the old program" features for OTA over ESP-NOW, a sign that this really isn't a small job. For now, updating Node 2 over a USB cable is enough.

</details>

<details>
<summary><b>Why the 33-byte packet has no CRC and no "application ACK"</b></summary>

The official ESP-NOW example in ESP-IDF adds a **CRC** (a check number for completeness) to every packet, and its documentation recommends an **application ACK**: the receiver replies with its own packet after it has really processed the data. Node 2 uses neither. The reasons:

- Every Wi-Fi frame already carries its own check number (FCS, 4 bytes). A frame damaged in the air doesn't pass that check, gets no ACK, and is sent again by Node 2. With encryption (Practice 8), a packet that's changed along the way is rejected too.
- Node 1 throws away broadcast packets, then checks the length (exactly 33 bytes), the mark `0x52`, the form's version, and the sender's address. The `sequence` number makes lost packets and duplicate packets countable (Concept 8).
- An application ACK means Node 2 has to keep its radio on longer to wait for the reply, and Node 1 has to send that reply. For garden data every 5 minutes, one reading lost now and then does no harm, and the `lost` count makes it visible.

For data that must never be lost, for example a command to open a water valve, an application ACK and resending really are required. The Module 11 data contract does this for `cmd` commands through `ack`.

</details>

---

## 🧩 Independent Challenges

Three levels, from changing a little to building your own. The answer keys for Levels 1 and 2 are in collapsible sections; Level 3 deliberately only gets hints. Do at least Level 1. Levels 2 and 3 are done in the Node-RED editor, so readers on the Wokwi path can do them with the mock Node 2.

### Level 1 — Wake every 10 minutes (a small change)

A friend says, "Just make the schedule 10 minutes; the battery will surely last twice as long." Prove or disprove it with numbers:

1. Use your measurements from Practice 7 (or the example numbers in 7.4), then calculate the battery life for `INTERVAL_SECONDS = 600`.
2. Compare it with your result for 300 seconds. What's the difference in percent?
3. If Node 2's schedule really were changed to 600 seconds, how many minutes without a packet would it take before Node 1 considers it `offline`?

<details>
<summary><b>Level 1 answer key</b></summary>

With the example numbers from Practice 7 (awake 0.62 seconds, awake charge 48.6 mA·s, sleep current 4.95 mA):

| Step | 300-second schedule | 600-second schedule |
| :--- | :--- | :--- |
| 5 V side average | (48.6 + 4.95 × 299.38) ÷ 300 ≈ 5.10 mA | (48.6 + 4.95 × 599.38) ÷ 600 ≈ 5.03 mA |
| Battery side (× 1.6) | ≈ 8.16 mA | ≈ 8.04 mA |
| Battery life (2,000 mAh usable) | ≈ 245 hours ≈ 10.2 days | ≈ 249 hours ≈ 10.4 days |

The difference is only about **1.5%**, not double. The average current is almost the same as the sleep current, because sleep uses up almost all the charge (Concept 9). The price: the garden data only comes every 10 minutes, and Node 1 only prints `Node 2 OFFLINE` after 3 × 600 seconds + 1 minute = **31 minutes** without a packet. Your friend would be right for a board with a very small sleep current (Module 9 🔬), but not for the DevKit V1.

</details>

### Level 2 — A "Node 2 offline" alert on the dashboard (fill in the blanks)

Add a notification that pops up on the phone's screen when Node 1 declares Node 2 `offline`. Dashboard 2 has a **notification** widget (category `dashboard 2`) that shows a notification box on every screen that currently has the dashboard open. Fill in the blanks (`____`) of this design:

```text
[status Node 2] → [switch "offline?": Property msg.payload
                    rule 1: ____ ]
                        output 1 → [change: Set msg.payload to the value ____ ]
                                         → [notification "Garden alert": UI ____ , Timeout (S) 10]
```

To test it, switch Node 2 off: unplug its USB if it's still plugged in since Practice 8, or remove its VIN wire from the top rail (+) if it's already running on the battery. With the 30-second schedule from Practice 7, Node 1 declares it `offline` after 3 × 30 + 60 = 150 seconds; with the 300-second schedule from ➕ A, after 16 minutes. After that, switch Node 2 on again. Wokwi path: the mock Node 2 can't be switched off, so test your alert by publishing the text `offline` to `msh/<your mock Node 2's device_id>/status` from MQTTX (the **Public broker** connection), then publish `online` to put it back.

<details>
<summary><b>Level 2 answer key</b></summary>

- The switch node `offline?`: **Property** `msg.payload`, rule 1 **==** of type **a**z (text) `offline`. Only output 1 is connected.
- The change node: **Set** `msg.payload` **to the value** of type **a**z (text), for example `Node 2 (garden) not heard for more than 3 wake schedules. Check its battery.` Want to include the time? Use the type **J: expression** with `"Node 2 offline since " & $now("[H01]:[m01]", "+0700") & " WIB"`.
- The notification node: **UI** `Mini Smart Home` (the dashboard settings from Module 13), **Position** `Top Right`, **Timeout (S)** `10`, and **Allow Manual Dismissal** left ticked so that the box can be closed with the **Close** button.

There are two things to be aware of. First, Node 2's `status` is a retained message: every time Node-RED restarts or you click **Deploy**, the last status is sent again, so the alert can pop up again even though nothing new happened. Add a **filter** node (`block unless value changes`) before the switch if that bothers you. Second, this notification only shows on screens that **currently** have the dashboard open. Alerts that reach the phone even when the dashboard isn't open, through Telegram, are covered in Module 19.

</details>

### Level 3 — Water the garden from Node 2's sensor (from scratch)

Imagine that Node 1's pump hose has been moved to the garden. Build a flow in Node-RED that sends a **water for 5 seconds** command to Node 1 when Node 2's `soil` is below 30%, but **at most once every 30 minutes**.

Hints:

1. Listen to Node 2's `telemetry`, then filter it with a switch node: `msg.payload.soil` **is not null** and **<** `30`.
2. A **delay** node can limit the rate: **Action** `Rate Limit`, `All messages`, `1` message per `30` minutes, and tick **drop intermediate messages** so that the messages during those 30 minutes are thrown away, not piled up.
3. Send the command through the `make cmd` node you've had since Module 13 (`msg.topic` `pump`, `msg.payload` `5`).
4. **The late-data trap.** After the router has been off overnight, Node 1 publishes dozens of old readings at once (Concept 7). If one of them says the soil is dry, the garden gets watered because of data that's hours old. Reject readings whose `ts` is older than 10 minutes. Hint: in the switch node, choose the type **J: expression** for **Property**, then write `$toMillis(payload.ts) > $millis() - 600000`, with the rule **is true**.
5. Think about "two brains": Node 1 already waters its own pot based on Node 1's soil sensor, and it still refuses to water when the water tank is low. Why does that refusal by Node 1 matter precisely because the garden watering rule lives somewhere else?

---

## ➕ Add-on to "Mini Smart Home"

This week, Mini Smart Home gets its second device: **Node 2 "Garden" v1.0.0**, which runs on a battery and talks over ESP-NOW. **Node 1 v1.3.0** becomes its bridge to the broker, and the dashboard on the phone gets a **Garden** card. Three project documents go up a version too: data contract 1.1, pin map 5, and contract checker 1.1.

![Diagram of Mini Smart Home after Module 14; a dashed line means it comes later. Left, Node 2 "Garden" v1.0.0, new, in the garden: an 18650 battery through the TP4056 and the MT3608 at 5.0 V, the BME280, the DS18B20, and the second soil sensor powered from D32; it wakes every 5 minutes, sends one packet, then sleeps. An ESP-NOW arrow, 33 bytes, locked with the PMK and LMK, to Node 1 "Home" v1.3.0: five sensors and actuators as before, plus the Node 2 bridge (new) with a holding shelf of 96 readings, ts set back, and Node 2's status. An MQTT arrow to the Raspberry Pi gateway at 192.168.1.37, holding Mosquitto (the MQTT broker) and Node-RED with dashboard v0, the new Garden card, and the fan automation. An arrow to the phone, which opens the Garden card. Below Node 1 and the gateway, a list of topics: msh/a4cf12e5b7c0/… belongs to Node 1, and msh/246f28b1c7d4/telemetry and …/status belong to Node 2, published by Node 1. Bottom, the GitHub repository mini-smart-home: firmware/node-1-home v1.3.0, firmware/node-2-garden v1.0.0, DATA-CONTRACT.md 1.1, PIN-MAP.md 5, tools/contract-checker.js 1.1, edge/node-red-flows.json with the Garden section, and .gitignore holding keys.h, so that keys.h itself never goes to GitHub. Bottom right, coming later: Module 15, RS-485 Modbus, and Module 16, backend. Notes: data contract 1.1 only adds, Node 1's data doesn't change, and Node 2 gets its own fields; Node 2 never knows the Wi-Fi password, and the ESP-NOW keys only live in keys.h on your laptop and on both boards.](assets/project-diagram-module-14.png)

> 🖥️ **Tools used:** **Arduino IDE** with `node-2-garden.ino`, the Node 1 and Node 2 boards, a phone charger for charging Node 2's battery (Module 9), a used plastic container for Node 2, an SSH terminal to the Pi, the Node-RED editor and the phone, **VS Code** with the `mini-smart-home` folder, and **GitHub Desktop**.
>
> **Laptop path** (the broker and Node-RED on the laptop): step B needs a laptop that stays on for 72 hours; the details are in that step. **Wokwi path:** do C, D, and E. Steps A and B need the second board, so they can only be proven once you have your board. Make sure the Practice 3 changes and the contents of Node 2 v1.0.0 (Practice 4.1) are saved in your repository's `firmware` folder too, with `USE_WOKWI` left at `false` in the repository.
>
> ⭐ **Required** — steps B and E are Module 14 completion requirements.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `firmware/node-1-home/` | **v1.3.0**: the new `node2-packet.h`, `bridge.h`, and `bridge.cpp`, small changes in five files (Practice 3), and `keys.example.h` (Practice 8) |
| `firmware/node-2-garden/` | **v1.0.0** replaces the v0.1.0 skeleton: `node-2-garden.ino`, `node2-packet.h`, and `keys.example.h` (Practices 4 and 8) |
| `.gitignore` | **new**: the line `keys.h` (Practice 8.1, already committed) |
| `tools/contract-checker.js` | version 1.1: fields per device (Practice 4.5) |
| `DATA-CONTRACT.md` | version 1.1 (step C) |
| `PIN-MAP.md` | version 5 (step C) |
| `edge/node-red-flows.json` | section 5, Garden, added (step D) |

### A. Prepare Node 2 for its permanent spot

1. **Back to the 5-minute schedule.** The Node 2 board should still be plugged into USB since Practice 8. If you've already put it back on the battery (for example after the 🔬 BLE section), first remove its VIN and GND wires, and only then plug in the USB (safety rule 1). In `node-2-garden.ino`, change `INTERVAL_SECONDS = 30` to `INTERVAL_SECONDS = 300`, then upload. If you raised `SOIL_SETTLE_MS` to `500` in Practice 4.2, make sure that number is still there.
2. **Charge the battery fully.** Unplug the Node 2 board's USB (its VIN and GND wires stay removed), then charge the battery through the TP4056's USB port with a phone charger, staying with it while it charges, as in Module 9. As soon as the TP4056's light shows that it's full, unplug the charger. A full battery is a requirement for an honest 72-hour test.
3. **Choose its spot.** The garden here can be a pot on the porch or a small bed in the yard. The requirements:
   - **Shaded and dry**, for example under the porch roof or a canopy. The board and the breadboard aren't waterproof, and a Li-ion battery must not overheat in direct sunlight (Module 9).
   - **Close to the plants**, because the sensor wires are only about 20 cm long.
   - **Still within Node 1's reach.** The `signal` number in Node 1's log should be stronger than −85 dBm (step B.3 checks it).
4. **Prepare its container.** A used plastic container, for example a food container, is enough for the mini breadboard and the Node 2 board. Make a few small holes in its bottom so that air can move in and out and water doesn't pool, and don't close it tightly: trapped damp air makes condensation. Make one more hole in the side of the container for the sensor wires.

### B. ⭐ Install Node 2 and run a 72-hour test

The completion requirement asks Node 2 to last **at least 3 days** on one 18650 battery. The Concept 9 calculation estimates about 10 days, but the real proof is data that keeps coming in for 72 hours.

1. **On the Pi**, start the logger as in Practice 6.1, with a new file name (replace the `device_id`):

   ```bash
   nohup mosquitto_sub -h localhost -t "msh/246f28b1c7d4/telemetry" -F "%I %p" > test72.log 2>&1 &
   ```

   Write down its process number (for example `[1] 5120`).
2. **Connect Node 2 to the battery:** connect the board's VIN wire to the top rail (+) at column 29 and its GND wire to the top rail (−) at column 28 (Practice 4.6). The blue LED lights up briefly: Node 2 wakes up right away and sends its first packet. Write the time and date in `notes-module14.md` as the **start of the test**.
3. **Take Node 2 to its spot.** Put the mini breadboard and the board into the container, then lead the sensor wires out through the side hole:
   - Push the **soil sensor** into the soil up to its limit line, no further (Module 6).
   - Bury the metal tip of the **DS18B20** about 5–10 cm into the soil. Its metal tip is waterproof, but its adapter module isn't: leave that module inside the container.
   - Hang the **BME280** outside the container, on the shaded side, so that it reads the garden air, not the air inside the container.

   Five minutes later, type `node2` in Node 1's Serial Monitor and look at the `signal` number in the `last packet` line. Weaker than −85 dBm, or do `attempt 2` and `3` show up often? Move Node 2 closer to the house.
4. **Put Node 1 back on its charger.** The order is as in Module 5: turn off the MB102, unplug the Node 1 board's USB from the laptop, plug it into the charger, then turn the MB102 back on (if you have a regulated microSD module, press **EN** afterwards, as in Module 12). Node 1 restarts, connects to the Wi-Fi, and listens to Node 2 again.
5. **Every day**, open the **Garden** card on the phone. The signs that Node 2 is still healthy: the status says `online`, and **Last reading** is no more than 5 minutes ago. You don't need to touch anything.
6. **After at least 72 hours**, log in to the Pi over SSH, then run these three commands one by one:

   ```bash
   wc -l test72.log
   head -n 2 test72.log
   tail -n 1 test72.log
   ```

   **Expected output** (example):

   ```text
   867 test72.log
   nohup: ignoring input
   2026-10-19T08:02:14+0700 {"ts":"2026-10-19T01:02:14Z","fw":"1.0.0","temperature":27.9,"humidity":81,"pressure":1009.4,"soil_temperature":26.8,"soil":47}
   2026-10-22T08:07:31+0700 {"ts":"2026-10-22T01:07:31Z","fw":"1.0.0","temperature":28.3,"humidity":79,"pressure":1008.9,"soil_temperature":27.3,"soil":44}
   ```

   - `wc -l` counts the file's lines. One line is `nohup: ignoring input`, so there are 866 messages. In 72 hours and 5 minutes, a Node 2 that wakes every 5 minutes should send about 866 packets; a slightly different number is normal: every wake adds about half a second to the 300-second schedule, the ESP32's sleep clock isn't as accurate as a wall clock, and now and then a packet is lost. What matters is that the messages keep coming in until the end of the test, without gaps of hours.
   - The first message line (from `head`) and the last one (from `tail`) show the start and the end of the test: October 19 at 08:02 WIB to October 22 at 08:07 WIB, more than 72 hours on one battery charge.
7. Stop the logger with `kill 5120` (the process number from step 1). Write in `notes-module14.md`: the start of the test, the end of the test, the number of lines in `test72.log`, and the battery voltage at the end of the test if you measured it with a multimeter or fitted the voltage divider (🔬). Node 2 may keep working; recharge its battery, while someone watches it, before its voltage drops below about 3.3 V (Module 9).

Did the battery run out before 72 hours? See 🚨 "Node 2's battery runs out much faster than expected".

**Laptop path** (the broker and Node-RED on the laptop): run the logger command in a terminal on the laptop, without `nohup` and without `&`, then leave its window open. The laptop must stay on for those 72 hours: plug in its charger, and temporarily change your laptop's power settings so that it doesn't go to sleep by itself. Change those settings back after the test. At the end of the test, stop the logger with **Ctrl + C**, then read the file from the same terminal. Windows PowerShell doesn't know `wc`, `head`, and `tail`; use `(Get-Content test72.log).Count`, `Get-Content test72.log -TotalCount 1`, and `Get-Content test72.log -Tail 1`. The number of lines is one fewer than in the Pi example, because without `nohup` there's no `nohup: ignoring input` line.

### C. Data contract 1.1 and pin map 5

These two documents are what the next modules rely on, so your copy must be the same as the reference version.

1. In VS Code with the `mini-smart-home` folder, open `DATA-CONTRACT.md`, then first copy the Node 1 row of the **My devices** table (at the very bottom) into `notes-module14.md`: the replacement below empties that table too. Open [`mini-smart-home/DATA-CONTRACT.md`](../../mini-smart-home/DATA-CONTRACT.md) in a new tab, click **Copy raw file**, then replace the whole content of your file with it (**Ctrl + A**, then **Ctrl + V**). After that, fill in the **My devices** table again: the Node 1 row from your notes, then the Node 2 "Garden" row with Node 2's `device_id` from `notes-module14.md` and the note "via Node 1 (ESP-NOW)". Save. The changes were already explained in Concept 7: the new fields `pressure`, `soil_temperature`, and `battery`, fields per device, Node 2's `ts` and `status` made by Node 1, and the version history at the end.
2. Do the same for `PIN-MAP.md` with [`mini-smart-home/PIN-MAP.md`](../../mini-smart-home/PIN-MAP.md). Version 5 records the new Node 2 table (the BME280 on D21/D22, the second soil sensor on VN with VCC from D32, VP optional), the new **Node 2 sensors** section with the Practice 2 connections, and the history row for version 5. The Node 1 section doesn't change.
3. Do you still have `notes-module14.md` with the soil calibration, the router's channel, and the test results? Compare it once more with your `node-2-garden.ino`: the numbers in the notes and in the code must be the same.

### D. Export the Node-RED flows again

Your flow gained one section in Practice 5, so the `edge/node-red-flows.json` backup from Module 13 needs to be updated.

1. **In the Node-RED editor**, tidy up section 5 as in ➕ A of Module 13. The flow piece from the curriculum already brings its own title, the comment node `5 · Garden: Node 2 telemetry and status (published by Node 1 on behalf of Node 2)`; make sure it sits above the section 5 nodes. If the button on the right side of the debug node `watch Node 2 telemetry` is still green, click it until it fades, then click **Deploy**.
2. Export as in ➕ D of Module 13: main menu → **Export** → **all flows** → **formatted** → **Download**.
3. In the **Downloads** folder, rename `flows.json` to `node-red-flows.json`, then move it to **Documents → GitHub → mini-smart-home → edge** and choose **Replace the file in the destination** (macOS: **Replace**).
4. In VS Code, open `edge/node-red-flows.json`, press **Ctrl + F**, then search for `Garden`: it must be found. Also search for `password`: it must not be found.

### E. ⭐ Save to GitHub

1. In GitHub Desktop, choose the **`mini-smart-home`** repository. The **Changes** list holds the files in `firmware/node-1-home` (three new files, five changed files, and `keys.example.h`), `firmware/node-2-garden` (`node-2-garden.ino`, `node2-packet.h`, and `keys.example.h`), `tools/contract-checker.js`, `DATA-CONTRACT.md`, `PIN-MAP.md`, and `edge/node-red-flows.json`. **Check once more: `keys.h` must not be in the list** (Practice 8.6). Fill in **Summary** with `Module 14: Node 2 Garden v1.0.0 via ESP-NOW, Node 1 v1.3.0 bridge`, click **Commit … to main**, then **Push origin**.
2. In the **`learn-iot`** repository, the `module-14` folder holds your practice sketches (`module14_receiver`, `module14_sender`, `module14_home_receiver`, `module14_find_channel`, `module14_garden_sensors`, and `module14_current_meter`) and `notes-module14.md`. Make sure those notes don't hold the encryption keys, then commit and push those too.

**Evidence for passing Module 14** (compare it with ✅ below): Node 2's data shows up on the Garden card with its own `device_id` (Practice 5), ≥ 90% of the packets arrive while the router is off and the late data shows up on the Pi (Practice 6), Node 2 lasts ≥ 3 days on one battery (step B), and everything is saved in the repository without `keys.h` (step E).

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Sensor node** | A small battery-powered device that sleeps almost all the time and wakes briefly to read its sensors and send one short message. In our project: Node 2. |
| **Gateway node** | A device on a fixed power supply that's always awake, listens to the sensor nodes, then passes their messages on to a bigger network. In our project: Node 1, for Node 2. |
| **ESP-NOW** | A protocol made by Espressif for sending small packets (up to 250 bytes) straight from one ESP32 to another, without a router, an IP address, or a Wi-Fi password. |
| **MAC address** | The hardware address of a Wi-Fi radio, 6 bytes, for example `24:6F:28:B1:C7:D4`. ESP-NOW sends to this address; the `device_id` is the MAC address written in lowercase without colons. |
| **ACK** (acknowledgement) | A small reply from the receiving radio as soon as a frame arrives intact. An ACK means "the radio received it", not "the program has processed it". |
| ***Unicast*** and **broadcast** | Unicast: a packet to one MAC address, answered with an ACK, and it can be encrypted. Broadcast: a packet to `FF:FF:FF:FF:FF:FF` for everyone who's listening, without an ACK and without encryption. |
| ***Channel*** | A slice of the 2.4 GHz Wi-Fi frequency band (1–13 in Indonesia). An ESP-NOW sender and receiver must be on the same channel; an ESP32 that isn't connected to a router may only use 1–11. |
| ***Callback*** | A function that's registered with the system and then called when something happens, for example when an ESP-NOW packet arrives. ESP-NOW callbacks are run by the Wi-Fi task, not by `loop()`. |
| **FreeRTOS queue** | A "mailbox" that copies every parcel in full from one task to another, for example from a callback to `loop()`. |
| **`packed` struct** | A data layout whose fields sit tightly together, without gaps, so that its size is exactly the same at the sender and the receiver (Node 2's packet: 33 bytes). |
| **`static_assert`** | A check at compile time. If its condition isn't met, Arduino IDE refuses to compile and shows its message. |
| ***Little-endian*** | A way of storing a number of more than one byte with the smallest byte first: 300 (`0x012C`) is stored as `2C 01`. |
| **`NAN`** (*not a number*) | The marker for a failed `float` reading. When Node 1 builds the JSON, `NAN` is written as `null`. |
| ***Forced* mode** (BME280) | The BME280 measures once, then sleeps by itself until it's told to measure again. Its opposite is normal mode, which measures nonstop. |
| **Holding shelf** (store-and-forward) | A place in Node 1's RAM that holds up to 96 Node 2 readings while the broker can't be reached; its contents are published once the connection is back, with the `ts` of the time they happened. |
| **`session` and `sequence`** | Two numbers in every Node 2 packet. `sequence` goes up by one on every wake; `session` changes every time Node 2 powers up from off. With both, Node 1 counts lost packets and throws away duplicates. |
| **PMK and LMK** | The two ESP-NOW encryption keys, exactly 16 bytes each. The PMK (the master key) protects the LMK; the LMK (the pair key) locks the content of the packets between Node 1 and Node 2. |
| **Credential** | Anything that opens access: a Wi-Fi password, an MQTT password, or an encryption key. It's never sent over ESP-NOW and never goes to GitHub. |

## 📝 5-Question Quiz

1. Node 2 reports packet #57 as `sent`, which means there was an ACK. However, that reading never shows up in MQTTX. Name two possible causes, and explain why an ACK alone isn't enough to prove that the data arrived.
2. Your home router turns out to have picked channel 11 after a restart, while it was on channel 6 before. (a) What happens to Node 2's next sends, and roughly how many packets are lost on the 5-minute schedule? (b) How do you prevent it? (c) Node 2 finds the new channel by scanning for the Wi-Fi name. Why doesn't it need the Wi-Fi password for that?
3. Why does Node 1's ESP-NOW receive callback only copy the packet into the mailbox (the queue), instead of calling `mqtt.publish()` right away?
4. The router is off from 10:05 to 10:35 WIB. A Node 2 reading from 10:10 WIB is only published to the broker at 10:37 WIB. What time is written in its `ts`, who makes it, and what happens to the Node-RED chart if its **X:** field is of type **timestamp**?
5. A friend connects the VCC of Node 2's soil sensor to 3V3 "so that the code is simpler". Use the table in Concept 9 to estimate what that does to the battery life. Why doesn't changing the wake schedule to 30 minutes save it?

<details>
<summary><b>Answer key</b></summary>

1. The ACK is sent by Node 1's **radio** as soon as the frame arrives intact, before Node 1's program touches its content (Concept 2). After that, Node 1's program can still reject the packet because its sender's address isn't `MAC_NODE2` (`rejected`) or because its form version is different, or throw it away as a duplicate packet (`duplicates`). A packet with the wrong key also gets an ACK and is then thrown away (Practice 8). Even if the packet was accepted, the reading may still be waiting on the shelf because Node 1's Wi-Fi, MQTT, or clock isn't ready, or MQTTX is subscribed to the wrong topic. The real proof of arrival is the `node2` count on Node 1 and the message on the broker.
2. (a) Node 1 moves to channel 11 along with the router, while Node 2 still sends on channel 6 from its RTC memory, so its sends end in `FAILED`. After two failed wakes in a row, Node 2 scans again, finds channel 11, and succeeds again: about **two packets** are lost (10 minutes). (b) Lock the router's channel on 1, 6, or 11 (Practice 1.5). (c) The router broadcasts its name and its channel in frames that are open to every device; that's what you see when a phone shows its list of Wi-Fi networks. Reading that list doesn't need a password; a password is only needed to connect, and Node 2 never connects to the router (Concepts 3 and 10).
3. The callback is run by the Wi-Fi task, a high-priority task on core 0, at the same time as `loop()` on core 1. Long work there holds up the Wi-Fi task, while the next packet may be arriving right then, and the MQTT connection isn't designed to be used from two tasks at once. The packet's data is also only valid while the callback runs. So the callback only copies into the queue, and `loop()` is what checks it, builds the JSON, and publishes it (Concept 6).
4. Its `ts` stays **10:10 WIB** (written in UTC: `03:10Z`). Node 1 makes it, from the time the packet **arrived** at Node 1: the clock now minus the reading's age on the shelf (Concept 7). If the chart's **X:** field is of type **timestamp**, all the late readings are drawn at the time the messages arrived in Node-RED (around 10:37 WIB) and pile up in one spot, so those 30 minutes of history seem to be missing.
5. The soil sensor draws about 5 mA all the time, also while Node 2 sleeps, because the 3V3 pin always has power. The average current goes up from about 5.1 mA to about 10 mA on the 5 V side, and the battery life drops from about 10 days to about **5 days**. A 30-minute schedule doesn't help, because almost all the charge is used up during sleep (Concept 9): the swollen sleep current stays just as big whatever the schedule is, so the battery life stays at about 5 days. The fix: put the VCC wire back on D32 (Practice 7.5).

</details>

---

## ✅ Module 14 Completion Checklist

The completion requirement from the Syllabus: **Node 2's data shows up in Node-RED with its own `device_id`, ≥ 90% of the packets arrive while the router is off, and Node 2 lasts ≥ 3 days on one 18650 battery.** Wokwi path: the esp32 package item can be ticked without a board, and the Node 1 v1.3.0, Garden card, and commit items can be proven with the mock Node 2 (Practices 3–5, ➕ C–E); the items for the two boards, the channel, the sensors, the current, the encryption, the router test, and the 72-hour test come later, once you have your second board. Laptop path: every item applies, with the laptop in place of the Pi (`garden.log` and `test72.log` are logged on the laptop).

- [ ] The esp32 package 3.3.12 is installed, and I can explain why ESP-NOW code from old tutorials fails to compile (🧰, Concept 6).
- [ ] The Node 2 board sends a greeting to the Node 1 board over ESP-NOW without a router, and I saw `FAILED` when the receiving board was unplugged (Quick Win).
- [ ] Node 2 finds the router's channel by scanning for the Wi-Fi name, remembers it in RTC memory, and scans again after two failures (Practice 1).
- [ ] Node 2's sensors are read in a power-saving wake sequence (the BME280 in forced mode, the DS18B20 at 10 bits, the soil sensor powered from D32), and I can read its 33-byte packet (Practice 2).
- [ ] Node 1 v1.3.0 publishes Node 2's data to `msh/<device_id Node 2>/telemetry` and `/status`, and contract checker 1.1 prints `PASS  (telemetry Node 2)` (Practices 3–4).
- [ ] ⭐ The Garden card in Node-RED shows Node 2's data with its own `device_id`, and its chart uses `ts` as the time axis (Practice 5; Wokwi path: with the mock Node 2).
- [ ] ⭐ While the router is off for 30 minutes, at least 90% of Node 2's packets arrive at Node 1 according to the `node2` command, and the readings show up on the Pi with the `ts` of the time they happened (Practice 6).
- [ ] I measured Node 2's current with the INA219, calculated its battery life, and proved with numbers why the soil sensor must not be on 3V3 (Practice 7).
- [ ] ESP-NOW is encrypted with a `keys.h` that `.gitignore` guards, and a key that's one character off makes Node 1 stop receiving (Practice 8).
- [ ] ⭐ Node 2 lasts at least 72 hours on one charge of its 18650 battery, as `test72.log` proves (➕ B).
- [ ] Node 1 v1.3.0, Node 2 v1.0.0, `DATA-CONTRACT.md` 1.1, `PIN-MAP.md` 5, contract checker 1.1, and the Node-RED flows are committed and pushed to `mini-smart-home`, without `keys.h` (➕ E).

> ➡️ **Next module:** Module 15 — Modbus RTU/RS-485 Lab & Choosing the Right Protocol. Node 1 learns to read an "industrial sensor" over a two-wire RS-485 cable that can be hundreds of meters long, and you put together a map for choosing the right protocol: Wi-Fi, ESP-NOW, RS-485, LoRa, Zigbee, or NB-IoT. Module 15 is the Phase 2 checkpoint.

---

## 📚 Sources & Image Credits

**Documentation, source code, and datasheets used** (accessed October 2026):

- The ESP-IDF 5.5.5 documentation: [ESP-NOW](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/network/esp_now.html) (the frame format, the ACK, the PMK and LMK, the limit of 20 peers and 7 encrypted peers, the advice on sequence numbers and queues), [Wi-Fi Driver](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/wifi.html) (scanning, the country rule "01" with channels 1–11, the power-saving modes, reconnecting), [Sleep Modes](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/sleep_modes.html) (turning off the Wi-Fi before deep sleep), and the official [wifi/espnow](https://github.com/espressif/esp-idf/tree/v5.5.5/examples/wifi/espnow) example (CRC and sequence numbers, the advice to turn off modem sleep on the receiver). The source code of `esp_now.h` and `Kconfig` from [ESP-IDF](https://github.com/espressif/esp-idf/tree/v5.5.5) v5.5.5, compared with versions 4.4 to 6.0 for the history of the callback shape.
- [ESP-FAQ: ESP-NOW](https://docs.espressif.com/projects/esp-faq/en/latest/application-solution/esp-now.html) (ESP-NOW v2 with 1,470 bytes, the number of encrypted peers, Wi-Fi and ESP-NOW at the same time) and [ESP-Techpedia: comparing mesh solutions](https://docs.espressif.com/projects/esp-techpedia/en/latest/esp-friends/solution-introduction/mesh/mesh-comparison.html) (an ESP-NOW range of about 150 m stable and 300 m in open space, fewer than 100 devices). The report [espressif/esp-idf#8577](https://github.com/espressif/esp-idf/issues/8577) (an encrypted peer that used to still accept packets without the key, fixed by Espressif in 2022), the [ESP-IDF 5.0 migration guide: Networking](https://github.com/espressif/esp-idf/blob/v5.5.5/docs/en/migration-guides/release-5.x/5.0/networking.rst) (ESP-NOW broadcast packets can stay unencrypted even when encryption is set up; `des_addr` in the receive callback to tell them apart), and the report [espressif/esp-idf#8574](https://github.com/espressif/esp-idf/issues/8574) (a 2022 request for the receive callback to be able to tell unencrypted broadcast packets apart: an impostor can broadcast packets with the sender address of a device that's already paired).
- The source code of [arduino-esp32](https://github.com/espressif/arduino-esp32/tree/3.3.12) 3.3.12 and [its release notes](https://github.com/espressif/arduino-esp32/releases/tag/3.3.12): `WiFiScan`, `WiFiGeneric` (`setChannel`, `setSleep`), `STA.cpp` (automatic reconnecting), the `ESP_NOW` library and its examples, the `BLE` library, and the [`setSleep()` fix in 3.3.7](https://github.com/espressif/arduino-esp32/pull/12296). The [espressif/esp-now](https://github.com/espressif/esp-now) component (relaying, provisioning, and OTA over ESP-NOW).
- The [ESP32 Series Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) v5.3 (transmit and receive currents, pin output current, the ADC range), and the datasheets of the [BME280](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf) (Bosch: forced mode, the *weather monitoring* recommendation, the chip ID), the [DS18B20](https://cdn-shop.adafruit.com/datasheets/DS18B20.pdf) (the measuring time for each resolution), and the [DFRobot SEN0193 capacitive soil sensor](https://wiki.dfrobot.com/Capacitive_Soil_Moisture_Sensor_SKU_SEN0193) (a current of about 5 mA).
- Libraries: [Adafruit BME280](https://github.com/adafruit/Adafruit_BME280_Library) 2.3.0 (including the `advancedsettings` example), [DallasTemperature](https://github.com/milesburton/Arduino-Temperature-Control-Library) 4.0.6 (`setResolution()`, which only writes if the value differs), [OneWire](https://github.com/PaulStoffregen/OneWire) 2.3.8, [Adafruit INA219](https://github.com/adafruit/Adafruit_INA219) 1.2.3, and [ArduinoJson](https://github.com/bblanchon/ArduinoJson) 7.4.3 (`NAN` written as `null`, `float` numbers without trailing zeros).
- [FlowFuse Dashboard](https://dashboard.flowfuse.com/) 1.33.0: the [chart](https://dashboard.flowfuse.com/nodes/widgets/ui-chart.html) widget (the **X:** field of type **key:**) and the [notification](https://dashboard.flowfuse.com/nodes/widgets/ui-notification.html) widget; the [JSONata](https://docs.jsonata.org/date-time-functions) date functions (`$toMillis`, `$millis`); the [mosquitto_sub](https://mosquitto.org/man/mosquitto_sub-1.html) manual page (the `-F` output format with `%I` and `%p`).
- BLE: [nRF Connect for Mobile](https://www.nordicsemi.com/Products/Development-tools/nRF-Connect-for-mobile) and the [Bluetooth Low Energy Fundamentals](https://academy.nordicsemi.com/courses/bluetooth-low-energy-fundamentals/) course (Nordic Semiconductor), plus the [bluetooth-numbers-database](https://github.com/NordicSemiconductor/bluetooth-numbers-database) (`0x181A` *Environmental Sensing*, `0x2A6E` *Temperature*).
- Wokwi: [ESP32 Simulation](https://docs.wokwi.com/guides/esp32) (the supported features), [ESP32 WiFi Networking](https://docs.wokwi.com/guides/esp32-wifi) (`Wokwi-GUEST` on channel 6), and the still-open feature request for [ESP-NOW between boards](https://github.com/wokwi/wokwi-features/issues/446). Mesh Wi-Fi: [painlessMesh](https://gitlab.com/painlessMesh/painlessMesh).

**Images.** The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The screenshots of Node-RED and the dashboard were taken from Node-RED 5.0.8 and FlowFuse Dashboard 1.33.0 running on the author's laptop, with data from a mock Node 2; Node-RED and FlowFuse Dashboard are licensed Apache 2.0, and "Node-RED" is a trademark of the OpenJS Foundation. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-14`, `from-garden-to-phone`, `esp-now-vs-wifi`, `radio-channel`, `callback-mailbox` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The behavior of ESP-NOW, channels, and callbacks from the ESP-IDF 5.5.5 documentation and the arduino-esp32 3.3.12 source code; the addresses and `device_id`s are only examples. | CC BY 4.0 |
| `node2-wake-sequence`, `packet-map-33-bytes`, `bridge-holding-shelf`, `node2-battery-life`, `project-diagram-module-14` (`.png` + `.svg`) | Original diagrams. The wake sequence and the packet layout from the Node 2 v1.0.0 firmware; the example byte sequence from Practice 2 in Wokwi; the currents and battery life are estimates made the Concept 9 way, not recordings from a measuring tool. | CC BY 4.0 |
| `node2-circuit` (`.png` + `.svg`) | Original illustration, with the holes and pins exactly as in the Practice 2 table; the battery circuit continues the Module 9 illustration. | CC BY 4.0 |
| `chart-ts-vs-arrival.png`, `phone-garden-card.png` | Real screenshots of FlowFuse Dashboard 1.33.0 at the width of a phone screen (412 pixels) from the author's laptop, with mock Node 2 data; titles, marks, and captions by the author, plus the phone frame and numbers in `phone-garden-card.png`. | FlowFuse Dashboard is licensed Apache 2.0; images: CC BY 4.0 |
| `import-garden.png` | Real screenshots of the Node-RED 5.0.8 editor from the author's laptop while the Garden flow piece was being imported; title, numbers, marks, and captions by the author. | Node-RED is licensed Apache 2.0 ("Node-RED" is a trademark of the OpenJS Foundation); image: CC BY 4.0 |

**About the Expected output boxes.** Every sketch and firmware in this module has been compiled with the esp32 package 3.3.12 for the board used in its practice (Node 1 v1.3.0: 1,182,724 bytes without `keys.h` and 1,185,316 bytes with `keys.h`; Node 2 v1.0.0: 939,732 bytes). What can be simulated has been run in Wokwi: the `Wokwi-GUEST` channel search, part of Node 2's sensors (Practice 2), and the Node 1 bridge with the mock Node 2 (Practice 3); their output is quoted as it is. Contract checkers 1.0 and 1.1 were run on the author's laptop against a test broker, and the Garden flow was tested in Node-RED 5.0.8 with FlowFuse Dashboard 1.33.0. The author's desk doesn't have two ESP32 boards or a Raspberry Pi, so the **Expected output** boxes from two real boards and from the Pi are marked **example**: the layout and text of every line come from the same code, while the addresses, channels, signal strengths, times, and current numbers are only examples.

---

[⬅️ Module 13](../module-13-node-red-dashboard/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 15 — Modbus RTU/RS-485 Lab & Choosing the Right Protocol** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-15--modbus-rturs-485-lab--choosing-the-right-protocol))
