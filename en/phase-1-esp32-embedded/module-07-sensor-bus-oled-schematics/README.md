# Module 7 — Sensor Bus Protocols: I2C, 1-Wire, SPI, OLED Display, & Reading Schematics

🌐 **English** · [Bahasa Indonesia](../../../fase-1-esp32-embedded/modul-07-bus-sensor-oled-skematik/README.md)

*Phase 1 · Week 7 · Hardware: **Kit A Stage 2** (see 🧰) — you can also try almost every practice in Wokwi · Prerequisite: **Module 6** (Node 1 v0.3.0 with five sensors) · Time: 8–10 hours, spread over the week*

[⬅️ Module 6](../module-06-reading-sensors/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 8 ➡️](../module-08-robust-firmware/README.md)

---

Last week, Node 1 got five senses. Every sensor took a pin of its own, so fewer and fewer ESP32 pins are still free. This week we learn the trick that almost every modern electronic device uses to save wires: the **bus**, a shared line that many devices use at the same time. Compare it with roads: instead of building a private road to every house, we build one toll road with many exits.

There are four new parts from Kit A Stage 2, and each one uses one of three kinds of bus:

| New part | Bus | What it does for our project |
| :--- | :--- | :--- |
| 0.96-inch **OLED display** | **I2C** — 2 data wires | Node 1 can show its own readings, without a laptop. |
| **BME280** | **I2C** — the **same** 2 wires as the display | Practice for Node 2 in the garden: temperature, humidity, and air pressure. |
| Waterproof **DS18B20** | **1-Wire** — 1 data wire | Water or soil temperature; several sensors can share one wire. |
| **microSD module** (optional) | **SPI** — 4 data wires | An offline notebook: the readings stay saved even when the internet is down. |

By the end of the week, Node 1 v0.4.0 has a **status display** with a layout you designed yourself and, if you connect the microSD module, it logs its readings to the card. You also learn a skill you'll keep using: **reading schematics**, the circuit "maps" found in every datasheet and product page. With this skill, you can finally see what's inside the relay module you've been using since Module 5.

![Module 7 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations to Phase 5 Operations and scale; Phase 1 ESP32, Modules 5 to 9, is highlighted, Modules 1 to 6 are marked done, and Module 7 is marked YOU ARE HERE with the note many devices, few wires. Bottom: the box for this week's Module 7, about 8 to 10 hours spread over the week with Kit A Stage 2, holding ten things: QW, the Quick Win, your first OLED display in Wokwi; P1, the OLED display and the I2C scanner; P2, the display toolbox: text, coordinates, and icons; P3, the BME280 on the same bus; P4, the DS18B20 on the 1-Wire bus; P5, optional, a CSV log on a microSD card; P6, a Node 1 status display of your own design; P7, reading the relay module's schematic and redrawing Node 1; P8, saving to GitHub; and a plus sign, the Add-on: Node 1 version 0.4.0 and PIN-MAP.md version 3. Stars mark P6 and P7 as part of the completion requirements](assets/roadmap-module-07.png)

> [!NOTE]
> **How to use this module.**
>
> - Every code box has a copy button in its top right corner. All the sketches are also available as files in the [`code/`](code/) folder, complete with `diagram.json` (and `libraries.txt` where needed) for Wokwi.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing.
> - **Don't have Kit A Stage 2 yet?** The OLED display, the DS18B20, and the microSD module are all available in Wokwi. Only the BME280 isn't there yet; the Practice 3 Wokwi diagram uses its older cousin, the **BMP180**, as a stand-in (explained in Practice 3). For reading schematics, paper and a pencil are enough.
> - **The ESP32 board in Wokwi is still turned on its side**, as in Module 6: the USB connector on the left, the VIN…EN row of pins at the top, and the 3V3…D23 row at the bottom.
> - Wokwi's free servers are sometimes busy. If a `Build Servers Busy` window appears, your program is waiting in line to be built: wait a few minutes. If the simulation still doesn't start, click **CLOSE**, stop the simulation (the **■** button), and try again later. Sketches that use many libraries, like Node 1, get stuck in this queue most often.
> - macOS users: replace **Ctrl** with **Cmd** to save, copy, and paste.

> [!WARNING]
> **Three safety rules this week.**
>
> 1. **Before you connect or move any wire, turn off the MB102, then unplug the USB.** Turning things back on has an order too: plug in the USB first, then turn on the MB102 (golden rule number 5 from Module 5).
> 2. **The OLED display, the BME280, and the DS18B20 get 3.3 V from the bottom rail, never 5 V.** On many modules, the pull-up resistors on the data lines are connected to the module's VCC pin. If VCC gets 5 V, the data lines rise to 5 V too, but the ESP32's pins can't handle 5 V. The only exception is the regulated microSD module (Practice 5): its VCC pin really does need 5 V, but its signals stay at 3.3 V because the module has its own voltage translator.
> 3. **Only the steel tip of the DS18B20 probe and part of its black cable may get wet.** The wire ends in the screw terminal, the adapter, and the breadboard stay dry. Put the glass of water for the experiments on a tray, away from the breadboard and the laptop, as in Module 6.

This module follows the same rhythm as Modules 1–6. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools and parts it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: your first OLED display, right in Wokwi (10 minutes)](#-quick-win-your-first-oled-display-right-in-wokwi-10-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Bus](#1-bus-a-private-road-or-a-toll-road) · [2 I2C](#2-i2c-two-wires-many-addresses) · [3 OLED display](#3-the-oled-display-pixels-coordinates-and-the-drawing-paper) · [4 BME280](#4-bme280-three-sensors-in-one-tiny-box--and-its-deceptive-twin) · [5 1-Wire](#5-1-wire-many-sensors-one-wire-and-serial-numbers) · [6 SPI & microSD](#6-spi-and-the-microsd-card-more-wires-more-speed) · [7 Combining devices](#7-combining-many-devices-without-them-interfering-with-each-other) · [8 Schematic symbols](#8-reading-schematics-the-basic-symbols) · [9 Relay module schematic](#9-reading-a-modules-schematic-taking-apart-the-relay-module)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 OLED & I2C scanner](#practice-1--the-oled-display-and-the-i2c-scanner-35-minutes) · [2 Display toolbox](#practice-2--the-display-toolbox-text-coordinates-and-icons-25-minutes) · [3 BME280](#practice-3--the-bme280-on-the-same-bus-30-minutes) · [4 DS18B20](#practice-4--the-ds18b20-water-temperature-over-one-wire-30-minutes) · [5 microSD (optional)](#practice-5--optional-a-csv-log-on-a-microsd-card-35-minutes) · [6 Node 1 status display ⭐](#practice-6--a-node-1-status-display-of-your-own-design-40-minutes) · [7 Schematics ⭐](#practice-7--reading-schematics-and-redrawing-node-1-45-minutes) · [8 GitHub](#practice-8--save-to-github-15-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-7-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

- **Explain why buses exist** and tell this week's three buses apart: **I2C** (two data wires, every device has an address), **1-Wire** (one data wire, every sensor has a serial number), and **SPI** (four data wires, every device has its own "pick me" pin).
- **Connect several I2C devices to the same two wires** and find their addresses with an I2C scanner, including reading hexadecimal addresses such as `0x3C`.
- **Show text, big numbers, lines, percent bars, and icons of your own** on a 128 × 64 pixel OLED display.
- **Read a BME280 and make sure its chip is genuine**, not a BMP280 sold under a similar name.
- **Read several DS18B20s on one wire** by their serial numbers, and recognize this sensor's two typical "lying" numbers: 85 °C and −127 °C.
- (Optional) **Log readings to a microSD card** as a CSV file you can open on your laptop.
- **Combine many devices without them interfering with each other.**
- **Read schematics with basic symbols**, including a relay module's schematic, and **redraw Node 1 as a schematic**.

---

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **The workbench from Module 6** | Two breadboards, the ESP32 board, the MB102 + 5 V 2 A adapter + USB A–A cable, and all the Node 1 parts (five sensors and all the actuators). **Leave everything connected.** This week we only add bus devices in front of the lower breadboard. |
| **Kit A Stage 2 — the parts you start using this week** | A four-pin **0.96-inch SSD1306 I2C OLED display** with soldered headers (rows of pins); a **BME280 I2C** module with soldered headers; a **waterproof DS18B20** sensor with its **adapter module**; (optional) an **SPI microSD module** + a 4–16 GB microSD card. |
| **Jumper wires** | 2 **male–male** wires for the I2C bus bridges, and about 10 **male–female** wires: 4 for the display (they stay connected), the rest used in turn for the BME280 (4), the DS18B20 (3), and the microSD module (6). |
| **4.7 kΩ resistor** | From the Kit A Stage 1 resistor pack. Only needed if your DS18B20 has no adapter module (Practice 4). |
| **A glass of water + a tray + a cloth** | For dipping the tip of the DS18B20 probe (Practice 4). |
| **Small screwdriver** | The small flat-head screwdriver from Module 5, for the screw terminal of the DS18B20 adapter (Practice 4). |
| **Laptop + Arduino IDE 2 + USB data cable** | Installed since Module 2. New libraries are installed in Practices 1, 3, and 4. |
| **microSD card reader** | Optional, for opening the log file on your laptop (Practice 5). Many laptops have an SD card slot; a microSD card fits into it through the SD adapter that usually comes in the card's package. |
| **Graph paper (or plain paper) + a pencil** | For designing the display layout (Practice 6) and drawing the schematic (Practice 7). If you'd rather draw on your laptop, you can also use the free [diagrams.net](https://app.diagrams.net) site for Practice 7. |
| **Browser + Wokwi** | For the Quick Win and for trying every practice before you build it. |

> [!TIP]
> **Check what arrived in your Kit A Stage 2 package before you start.**
>
> - **Display:** its size is **0.96 inch**, its chip is the **SSD1306**, and it has **four** pins (labeled "GND VCC SCL SDA" or "VCC GND SCL SDA"). A **1.3-inch** display usually uses a different chip, the **SH1106**, which doesn't work with this week's library: its picture comes out shifted or garbled. A display with seven pins is the SPI version, which isn't the one we use either.
> - **"Two-color" displays:** many 0.96-inch displays show the top 16 rows of pixels in **yellow** and the rest in **blue**. Those colors are built into the glass; code can't change them, and it isn't a defect. There's a thin gap between the yellow and the blue band, so a character that crosses the boundary looks split into two colors. That isn't a defect either.
> - **BME280:** sellers often ship a **BMP280** (without a humidity sensor) under a similar name. No need to worry yet; Concept 4 and Practice 3 teach you how to make sure.
> - **DS18B20:** the "module" or "adapter" version has a screw terminal and three header pins, so it just plugs in. On the bare-cable version, the wire ends are stranded wires that are hard to plug into a breadboard.

![Collage titled Get to know the Stage 2 parts, four cards. One: a photo of a blue 0.96-inch OLED display with four pins labeled GND, VCC, SCL, SDA, showing a list of files; note: 128 by 64 pixels, SSD1306 chip, I2C bus, the pin order can differ. Two: a photo of a red SparkFun BME280 board with a small metal sensor box in the middle; note: temperature, humidity, pressure, I2C bus, the module in the kit is usually a purple board labeled GY-BME280, and the sensor is a small square metal box. Three: a photo of a waterproof DS18B20: a long black cable with a steel tube at its tip and three wires, red, black, and yellow, plus a close-up of the ends of those three wires; note: 1-Wire bus, red VCC, black GND, yellow or white DATA, an adapter makes it plug-in ready. Four: an illustration of a blue six-pin microSD module labeled GND, VCC, MISO, MOSI, SCK, CS, with a card slot; note: SPI bus, 4 to 16 GB card, FAT32 format, optional](assets/meet-the-stage-2-parts.jpg)

*Photos from Wikimedia Commons: the OLED display is cropped from a photo by Turbospok (CC BY-SA 4.0), the BME280 is by SparkFun (CC BY 2.0), and the DS18B20 is by Leonardo Postay (CC BY-SA 4.0); the microSD module illustration and the collage layout are by the author. Details in [📚 Sources & Image Credits](#-sources--image-credits).*

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. |
| **esp32 by Espressif Systems** board package | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. It already includes the **Wire** (I2C), **SPI**, and **SD** libraries, so you don't need to install those three. |
| **Adafruit SSD1306** library | **2.5.17** | Installed in Practice 1. |
| **Adafruit GFX Library** | **1.12.6** | A required companion of SSD1306; offered along with it when you install SSD1306. |
| **Adafruit BusIO** library | **1.17.4** | A required companion of GFX and BME280; offered along with them. |
| **Adafruit BME280 Library** | **2.3.0** | Installed in Practice 3. |
| **Adafruit Unified Sensor** library | **1.1.15** | From Module 6; used again by the BME280. |
| **OneWire** library | **2.3.8** | Installed in Practice 4. **You must install it yourself**: DallasTemperature doesn't offer it. |
| **DallasTemperature** library | **4.0.6** | Installed in Practice 4. |
| **DHT sensor library** and **ESP32Servo** libraries | **1.4.7** and **3.2.1** | From Modules 6 and 5; used again by Node 1. |

---

## 🏆 Quick Win: your first OLED display, right in Wokwi (10 minutes)

For six modules, the ESP32 could only "talk" through the Serial Monitor on your laptop. Now it gets a display of its own. We start in Wokwi so you see the result right away, without building anything.

> 🖥️ **Tools used in this section:** a browser and the [Wokwi](https://wokwi.com) site. No kit needed, nothing to install.

1. Open **https://wokwi.com/projects/new/esp32** in your browser. An empty ESP32 project appears: code on the left, the board on the right.
2. Right-click the link [`code/module07_first_oled/diagram.json`](code/module07_first_oled/diagram.json) → **Open link in new tab**, then click the **Copy raw file** button (the two-squares icon) at the top right of the file contents. Go back to the Wokwi tab, click the **`diagram.json`** tab above the editor, select all its contents (**Ctrl + A**), then paste (**Ctrl + V**). On the right, the ESP32 board is now on its side, and below it is a blue OLED display with four pins. A blue wire connects the display's **SDA** pin to **D21**, a yellow wire connects **SCL** to **D22**, and the other two pins go to power symbols: ▽ for GND and VCC for 3.3 V. The blue and yellow wires cross once; that's on purpose, and Practice 1 explains why.
3. Click the **`sketch.ino`** tab, delete its contents, then paste this code:

   ```cpp
   // Module 7 - Quick Win: your first OLED display
   // 0.96" OLED display (SSD1306 chip, 128 x 64 pixels) on the I2C bus: SDA to D21, SCL to D22.
   // Library: Adafruit SSD1306 2.5.17 (installed with it: Adafruit GFX Library 1.12.6 and Adafruit BusIO 1.17.4).

   #include <Wire.h>
   #include <Adafruit_GFX.h>
   #include <Adafruit_SSD1306.h>

   const int PIN_SDA = 21;              // D21: I2C data line (canonical pin map)
   const int PIN_SCL = 22;              // D22: I2C clock line (canonical pin map)
   const byte DISPLAY_ADDRESS = 0x3C;   // the display's "home address" on the I2C bus

   Adafruit_SSD1306 display(128, 64, &Wire, -1);  // width 128, height 64, on the I2C bus, no reset pin

   void setup() {
     Serial.begin(115200);
     Wire.begin(PIN_SDA, PIN_SCL);
     display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS);  // SWITCHCAPVCC: the display makes its own high voltage

     display.clearDisplay();               // 1. clear the "drawing paper" in the ESP32's memory
     display.setTextColor(SSD1306_WHITE);  //    white text (= pixels on)
     display.setTextSize(2);               //    text size 2: 16 pixels tall
     display.setCursor(0, 0);              //    start at the top left corner
     display.println("Hello,");            // 2. draw the text
     display.println("Node 1!");
     display.display();                    // 3. send that picture to the display over I2C

     Serial.println("OLED display ready.");
     delay(2000);
   }

   void loop() {
     display.clearDisplay();
     display.setTextSize(1);
     display.setCursor(0, 0);
     display.println("Seconds since start:");
     display.setTextSize(4);   // big number: 32 pixels tall
     display.setCursor(0, 20);
     display.println(millis() / 1000);
     display.display();
     delay(1000);
   }
   ```

4. This sketch uses extra libraries, so Wokwi needs to know the list. Click the **Library Manager** tab → the round **+** button → type **Adafruit SSD1306** → click the result. Once the `libraries.txt` tab appears, replace all its contents with the contents of [`libraries.txt`](code/module07_first_oled/libraries.txt) from the Quick Win folder, which lists all three libraries with their versions:

   ```text
   # Libraries for this sketch (used by Wokwi). In the Arduino IDE, install them through the Library Manager.
   Adafruit SSD1306@2.5.17
   Adafruit GFX Library@1.12.6
   Adafruit BusIO@1.17.4
   ```

5. Click the green **▶** button. The first time, Wokwi needs one to two minutes to build the program. After that, the display shows `Hello,` and `Node 1!` in big letters for two seconds. Then the text changes to `Seconds since start:` with a big number below it that goes up every second. In the Serial Monitor (below the simulation panel), a few lines of the ESP32's built-in startup messages appear first, for example `entry 0x400805dc`; your sketch prints only one line, the last one: `OLED display ready.`.

![Cropped and rearranged screenshot of the Wokwi Quick Win. Top left, the circuit in the simulation panel: the ESP32 board on its side with a blue OLED display below it on the right; the blue wire from D21 to the SDA pin and the yellow wire from D22 to the SCL pin cross once (marker 1); the VCC pin goes to the VCC symbol and the GND pin to the triangle symbol, with a note below saying that both are Wokwi power symbols. Top right, two close-ups of the display: for the first two seconds it shows Hello, and Node 1! in big letters, then the text Seconds since start: with a big number 6 below it. Bottom, the Serial Monitor: a few lines of the ESP32's built-in startup messages, then OLED display ready. (marker 2)](assets/wokwi-first-oled.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

Congratulations — Node 1 has a display! Notice three things in the code:

- **`display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS)`** turns the display on. `0x3C` is the display's **address** on the I2C bus, like a house number. The `SSD1306_SWITCHCAPVCC` part tells the library that the display itself raises the 3.3 V to the high voltage its pixels need. Concept 2 explains addresses, and Concept 3 explains the display.
- **The picture is prepared first, then sent.** `clearDisplay()` clears the "drawing paper" in the ESP32's memory, `print` and its friends draw on that paper, and only `display()` sends the whole picture to the display. If you forget to call `display()`, the display doesn't change at all.
- **`setTextSize(4)`** makes the number four times bigger than normal text: 32 pixels tall, half the height of the display.

Curious? Replace `"Hello,"` with your name, or replace `setTextSize(4)` with `setTextSize(5)`, then click **▶** again. Size 5 numbers still fit three digits; also try size 8 and see what happens when the number is wider than the display.

---

## 🧠 The "Why" Concepts

Nine concepts, one per section — **no need to read them all at once**. Concepts and practices take turns in this order:

1. Concepts 1–2 → Practice 1 (the OLED display and the I2C scanner)
2. Concept 3 → Practice 2 (the display toolbox)
3. Concept 4 → Practice 3 (BME280)
4. Concept 5 → Practice 4 (DS18B20)
5. Concept 6 → Practice 5 (microSD log, optional)
6. Concept 7 → Practice 6 (the Node 1 status display)
7. Concepts 8–9 → Practices 7–8 (schematics and GitHub)
8. 🧩 Challenges → ➕ Mini Smart Home → 📝 Quiz → ✅ Checklist

At every switching point there's a ➡️ box (forward to the practice) and a ⬆️ box (back to the concepts) with links you can simply click.

> 🖥️ **Want to try the code in the Concepts section?** It's not required — you'll run all the code in the Practices. The code in the Concepts section is only snippets; the full versions are in the Practice sketches, which you can try in Wokwi with the `diagram.json` from the [`code/`](code/) folder, exactly like the Quick Win.

### 1. Bus: a private road or a toll road?

Up to Module 6, every part got a **private road**: one or two ESP32 pins used only by that part. For example, the status LED on D4, the DHT22 on D14, the PIR on D34, and so on. This is easy to understand, but wasteful. Node 1 already uses 13 pins, and there are only about 22 safe pins (Module 5).

Now imagine the OLED display. It has 128 × 64 = 8,192 dots of light. There's no way every dot could get its own pin. That's why devices with lots of data "chat" with the ESP32 over just a few wires, and other devices can share those wires. These shared wires are called a **bus**.

A bus is like a **toll road**. One road is used by many vehicles, there are rules about who may pass, and every destination has its own "exit". On a bus, the rules are simple: the ESP32 directs the traffic, and only one device may talk at a time. The destination device is chosen in one of three ways: by **address**, by **serial number**, or by a dedicated **"pick me" wire**.

![Two-panel diagram. Left, Private roads, as in Modules 5 and 6: an ESP32 with four separate lines, D4 to the status LED, D14 to the DHT22, D34 to the PIR, and D32 and D33 to the relays; note: one device uses one pin or more, so the pins run out fast. Right, The toll road, also called a bus, in Module 7: an ESP32 with two lines, SDA from D21 and SCL from D22, shared by the OLED display at address 0x3C, the BME280 at address 0x76, and a dashed box for the next device at address 0x??; note: two wires for everyone, every device has a house number. Below them, a table of this week's three buses: I2C with two data wires, SDA and SCL, chooses by a 7-bit address such as 0x3C, 100 to 400 thousand bits per second, for the OLED display and the BME280; 1-Wire with one DATA wire, chooses by a 64-bit serial number, about 16 thousand bits per second, for the DS18B20; SPI with four wires, SCK, MOSI, MISO, and CS, chooses by its own CS wire, millions of bits per second, for the microSD card](assets/bus-toll-road.png)

This week you use three buses:

| | **I2C** | **1-Wire** | **SPI** |
| :--- | :--- | :--- | :--- |
| Data wires | 2: SDA and SCL | 1: DATA (also called DQ) | 4: SCK, MOSI, MISO, CS |
| How a device is chosen | a 7-bit **address**, for example `0x3C` | a 64-bit factory **serial number** | its own **CS** ("pick me") wire for each device |
| Approximate speed | 100–400 thousand bits per second | about 16 thousand bits per second | millions of bits per second |
| Used this week for | OLED display, BME280 | DS18B20 | microSD card |

Besides the data wires, every device still needs **power**, that is, VCC and GND. There's one more "bus" you've actually been using since Module 2 without realizing it: **UART**, the `Serial` line to your laptop. UART only connects two devices, so it isn't a real bus; its story is in 🔬.

### 2. I2C: two wires, many addresses

**I2C** (pronounced *eye-squared-see* or *eye-two-see*) uses two data wires:

- **SCL** (*serial clock*): the ESP32 sends steady beats on this wire, like a drummer keeping the tempo.
- **SDA** (*serial data*): on every beat, one bit of data travels on this wire, from the ESP32 to a device or the other way around.

On the ESP32 DevKit V1, I2C uses **D21 for SDA** and **D22 for SCL**. This pair has been reserved in `PIN-MAP.md` since Module 5, and in code it's written `Wire.begin(21, 22)`. `Wire` is the name of the built-in I2C library in the esp32 package.

**Addresses.** Every I2C device has a 7-bit address, a number from 0 to 127, like a house number on a street. Ordinary devices use the addresses 8 to 119 (`0x08`–`0x77`); the rest are reserved for special purposes. An OLED display usually has the address `0x3C`, while a BME280 has the address `0x76` or `0x77`. When the ESP32 wants to talk to the display, it "calls" the address `0x3C` over SDA. Every device hears the call, but only the owner of that address answers "yes, I'm here". That short answer is called an **ACK** (*acknowledge*). As a result, **two devices with the same address must not be on one bus**: both would answer at the same time, just like two houses with the same number that confuse the courier.

**Why write `0x3C` instead of 60?** The `0x` prefix marks a **hexadecimal** number (base 16). This number system uses sixteen symbols: 0–9, then A–F (A = 10, B = 11, …, F = 15). Datasheets almost always write addresses this way, because every hexadecimal digit stands for exactly four bits. To turn it into an ordinary number, multiply the left digit by 16, then add the right digit.

| Written | The math | Ordinary number | Who? |
| :--- | :--- | ---: | :--- |
| `0x3C` | 3 × 16 + 12 (C) | 60 | OLED display |
| `0x76` | 7 × 16 + 6 | 118 | BME280 (SDO pin to GND) |
| `0x77` | 7 × 16 + 7 | 119 | BME280 (SDO pin to VCC) |

In code, `0x3C` and `60` mean exactly the same thing; we use `0x3C` so it matches the datasheet.

**Pull-up resistors.** I2C devices never "push" the SDA or SCL wire up to 3.3 V. They can only **pull the wire down to 0 V** or let go of it. What brings the wire back to 3.3 V when every device lets go is a pair of pull-up resistors, resistors from SDA and SCL to VCC. They work like the spring that closes a door by itself after you let go. Almost every I2C display and sensor module already has these resistors. Because they're usually connected to the module's VCC pin, **our I2C modules always get 3.3 V**: with 5 V, SDA and SCL would be pulled up to 5 V too, and the ESP32's pins could be damaged.

![I2C bus diagram. On the left, the ESP32 as the bus controller, with D21 for SDA (data) and D22 for SCL (clock). Two horizontal bus lines, SDA in blue and SCL in yellow, each pulled up to 3.3 volts by a pull-up resistor; a note at the top right: the pull-up resistors are usually already on the module and bring the wire back to 3.3 volts, while the devices only pull the wire down to 0 volts; the VCC and GND of each device aren't drawn. Two devices hang below the bus: the OLED display at address 0x3C and the BME280 at address 0x76. Speech bubbles below the bus: the ESP32 asks, 0x3C, are you there?; below the display, ACK: yes, I'm here; below the BME280, silent: not my address. At the very bottom, a box on reading hexadecimal: 0x3C equals 3 times 16 plus 12 (C) equals 60, 0x76 equals 118, and 0x77 equals 119; A to F mean 10 to 15, and the 0x prefix marks a hexadecimal number](assets/i2c-addresses.png)

**The I2C scanner.** If you don't know a module's address, the ESP32 can "knock" on every address from 1 to 126, one by one (addresses 0 and 127 have special jobs, so there's no need to knock on them), and note which ones answer. The heart of the sketch is just two lines:

```cpp
Wire.beginTransmission(address);      // knock on this address's door
byte reply = Wire.endTransmission();  // 0 = someone answered "yes, I'm here"
```

This scanner is the first tool technicians reach for when an I2C module "won't work". If the scanner finds nothing, the problem is almost certainly in the wiring, the power, or the module itself (for example, the seven-pin SPI version of the display, or a broken module), not in the display code.

**Bridge wires on the breadboard.** The D21 and D22 pins are in the **bottom** row of pins of the ESP32 board, in holes 14b and 17b of the lower breadboard. The only holes in their strips that are sure to be free are in rows d and e (row c is sometimes covered by the edge of the board, as in Module 5), which isn't enough for many devices. So that several I2C devices can plug in neatly, we build our own "toll road" on the lower breadboard with two jumper (bridge) wires: **strip 19 (rows f–j) becomes SCL** and **strip 20 (rows f–j) becomes SDA**. Every I2C device just plugs its SCL wire into strip 19 and its SDA wire into strip 20. Practice 1 shows you how.

**I2C is for short distances.** I2C was designed for devices on one board or inside one box. With ordinary jumper wires, try to keep the whole bus shorter than about 50 cm. Wires that are too long make readings fail now and then.

> ➡️ **Ready to practice?** Continue to [Practice 1 — The OLED display and the I2C scanner](#practice-1--the-oled-display-and-the-i2c-scanner-35-minutes). When you're done, come back to [Concept 3](#3-the-oled-display-pixels-coordinates-and-the-drawing-paper).

### 3. The OLED display: pixels, coordinates, and the "drawing paper"

An **OLED** (*organic light-emitting diode*) display is a display in which every pixel gives off its own light, with no backlight. As a result, black parts are truly black, and text stays sharp even on a small display. Our display has **128 × 64 pixels**. Each pixel can only be on or off; there are no other colors. Behind the glass sits an **SSD1306** chip that controls all those pixels, and that chip is what the ESP32 talks to over I2C at address `0x3C`.

**Coordinates.** Every pixel has a coordinate (x, y). Pixel (0, 0) is in the **top left corner**. x grows to the right up to 127, while y grows **downward** up to 63. This y direction is the opposite of the graphs from school math, so it often confuses people at first.

**The "drawing paper" in memory.** The Adafruit library keeps a copy of all 8,192 pixels in the ESP32's memory. This copy is called a *buffer*. Each pixel only needs 1 bit (on or off), and 8 bits = 1 byte, so the copy is only 1,024 bytes. All the drawing commands change only this copy. The display itself only changes when `display()` is called and the whole copy is sent over I2C. You've already seen this pattern in the Quick Win:

```cpp
display.clearDisplay();   // 1. clear the drawing paper
display.setCursor(0, 0);  // 2. draw as much as you like...
display.print("28.5");
display.display();        // 3. ...then send it to the display once
```

Because the picture is sent all at once, the display doesn't flicker even if you draw dozens of things. On the other hand, if you forget to call `display()`, the display doesn't change at all.

**Text.** The library's built-in font fits each character in a box of **6 × 8 pixels** (5 pixels for the character + 1 pixel of spacing). `setTextSize(n)` makes that box n times bigger:

| Size | One character | Fits per line | Fits per display |
| :---: | :---: | :---: | :---: |
| 1 | 6 × 8 pixels | 21 characters | 8 lines |
| 2 | 12 × 16 pixels | 10 characters | 4 lines |
| 3 | 18 × 24 pixels | 7 characters | 2 lines |
| 4 | 24 × 32 pixels | 5 characters | 2 lines |

`setCursor(x, y)` sets the **top left corner** of the first character. At size 1, the 22nd character and beyond wrap to the next line, so design your text to fit.

**Shapes.** Besides text, the library offers lines (`drawLine`), boxes (`drawRect` for an outline, `fillRect` for a filled box), and circles (`drawCircle`). With `drawRect` and `fillRect`, you can make a **percent bar** like the battery indicator on a phone.

**The degree sign.** The characters on this display follow an old computer character table called **CP437**. The ° sign is number 248 in it, so you write it with `display.write(248)`, not `print("°")`. If you type `°` directly in the code, the display shows two strange characters: in the code, that sign is stored as two bytes. To make sure number 248 really is ° in this library, call `display.cp437(true)` once in `setup()`.

**Icons.** Small icons are made from a **bitmap**: every row of pixels is written as a binary number, with 1 meaning on and 0 meaning off. An 8 × 8 icon means eight numbers of eight digits each. You can design it on graph paper, then copy it row by row:

```cpp
const unsigned char ICON_SUN[] = {
  0b00011000,  //    ##
  0b01000010,  //  #    #
  0b00111100,  //   ####
  0b10111101,  // # #### #
  0b10111101,  // # #### #
  0b00111100,  //   ####
  0b01000010,  //  #    #
  0b00011000,  //    ##
};
display.drawBitmap(0, 0, ICON_SUN, 8, 8, SSD1306_WHITE);  // draw at (0, 0), size 8 x 8
```

**Inverted text.** A white box (`fillRect`) with black text on it (`setTextColor(SSD1306_BLACK)`) catches the eye immediately. This works well for alerts such as "DETECTED".

![Diagram of the 128 by 64 pixel OLED display. Top left, a coordinate grid: pixel 0, 0 in the top left corner, x growing to the right from 0 to 127, the y arrow pointing down, the bottom right corner 127, 63, and a sample pixel 64, 32 in the middle; the band of the top 16 rows is labeled as the yellow band on a two-color display. Top right, the setTextSize text sizes: size 1 is 6 by 8 pixels, size 2 is 12 by 16 pixels, and size 3 is 18 by 24 pixels; the red dot at the top left corner of each box is setCursor. Middle, the drawing paper or buffer in the ESP32's memory, 128 by 64 pixels times 1 bit equals 1,024 bytes, in three steps: one, clearDisplay clears the paper; two, print, drawLine, fillRect, and other commands draw as much as you like; three, display sends the whole paper over I2C. Bottom, an 8 by 8 sun icon on a grid, with eight rows of binary numbers next to it that are the same as ICON_SUN in the code, 1 meaning the pixel is on and 0 off, the command drawBitmap(0, 0, ICON_SUN, 8, 8, SSD1306_WHITE), and a tip: on graph paper, shade the squares you want to light up, then write each row from left to right as 0s and 1s](assets/oled-coordinates.png)

**Designing a display that's easy to read.** A small display fills up fast, so use these three simple rules:

1. **The most important thing is the biggest.** Temperature and humidity, for example, are written with big numbers, while their units can be small.
2. **Line up the columns.** Put the names on the left, right-align the numbers, and put the bars at the far right, so the eye doesn't have to search.
3. **Plan for the worst case.** The longest numbers (for example `-40.0` or `100%`) and failed readings (`--`) must still fit and must not overlap.

If your display is two-color, put the title or the main numbers in the **top 16 rows**, which are yellow.

> ➡️ **Ready to practice?** Continue to [Practice 2 — The display toolbox: text, coordinates, and icons](#practice-2--the-display-toolbox-text-coordinates-and-icons-25-minutes). When you're done, come back to [Concept 4](#4-bme280-three-sensors-in-one-tiny-box--and-its-deceptive-twin).

### 4. BME280: three sensors in one tiny box — and its deceptive twin

The **BME280**, made by Bosch, measures three things at once: **temperature**, **humidity**, and **air pressure**. The sensor itself is only 2.5 × 2.5 mm and sits on a small module that can talk over I2C. In our project, the BME280 will later go on **Node 2 in the garden** (Module 14). This week you practice with it on Node 1 first, next to the DHT22.

| Quantity | Range | Accuracy (datasheet) | Unit in the code |
| :--- | :--- | :--- | :--- |
| Temperature | −40 to +85 °C | ±1 °C | °C from `readTemperature()` |
| Relative humidity | 0–100% | ±3% | % from `readHumidity()` |
| Air pressure | 300–1,100 hPa | ±1 hPa | pascals from `readPressure()`, divided by 100 to get hPa |

**Air pressure** is the weight of the air above the sensor. At the seashore it's about 1,013 hPa (hectopascals), and the higher you go, the smaller it gets: it **drops by about 12 hPa for every 100 meters you climb**. That's why a BME280 in Bandung or Malang shows a much smaller number than one in Jakarta or Surabaya. A change in pressure over a few hours can also be a sign that the weather is about to change.

**Two possible addresses.** A BME280 can have the address `0x76` or `0x77`, depending on how its **SDO** pin is connected on the module. The purple modules labeled "GY-BME280" are usually `0x76`; Adafruit modules are usually `0x77`. The Practice 3 sketch tries both, so you don't have to guess.

**The deceptive twin: the BMP280.** Bosch also makes the **BMP280**, a sensor that only measures temperature and pressure, **with no humidity**. Its module looks almost exactly the same, its addresses are the same (`0x76`/`0x77`), and sellers often list both as "BME/BMP280". Fortunately, every Bosch chip has a **chip ID**: a number inside the chip that can be read like an ID card.

| Chip | Chip ID | Measures |
| :--- | :---: | :--- |
| **BME280** | `0x60` | temperature, humidity, pressure |
| BMP280 | `0x58` (early factory samples: `0x56` or `0x57`) | temperature, pressure |
| BMP180 | `0x55` | temperature, pressure (older generation) |
| BME680 | `0x61` | temperature, humidity, pressure, gas |

The Adafruit library reads this chip ID during `bme.begin()` and **rejects** a chip whose ID isn't `0x60`. You can see the ID it read with `bme.sensorID()`. There's also a visible clue, although it isn't always easy to see without a magnifying glass: the BME280's metal box is **square** (2.5 × 2.5 mm), while the BMP280's metal box is **rectangular** (2.0 × 2.5 mm).

![Comparison of the BME280 and the BMP280 titled Look at the shape of the metal box; both are made by Bosch and can use the same I2C address, 0x76 or 0x77. Left, a macro photo of a BME280 chip on a module board: a square 2.5 by 2.5 mm metal box with a small hole in its lid where the air gets in, chip ID 0x60, measures temperature, humidity, and pressure; in real life this box is smaller than a grain of rice. Right, a photo of a blue BMP280 module with a red circle around its metal sensor box: rectangular, 2.0 by 2.5 mm, chip ID 0x58, measures temperature and pressure without humidity; note: the text on the module board, for example GY-BMP280, may not match the chip that is actually mounted. Bottom, a box with the surest way: run the Practice 3 sketch; chip ID 0x60 means your sensor is a genuine BME280, while chip ID 0x58 means a BMP280 that only reads temperature and pressure](assets/bme-vs-bmp.jpg)

*Photos: the BME280 chip by Laserlicht (CC BY-SA 4.0) and the BMP280 module by AGermanBeck (CC BY-SA 4.0), Wikimedia Commons; labels by the author.*

**DHT22 or BME280?** Both measure temperature and humidity. The BME280 reacts faster, is more stable, and can read pressure, which makes it better suited to Node 2 outdoors. The DHT22 stays on duty on Node 1. In Practice 3, both are read side by side so you can see that two healthy sensors rarely show exactly the same numbers. A difference of about 1 °C and a few percent of humidity is still normal, because each one has its own accuracy limits.

**Keep it away from warm things.** A temperature sensor measures the air **near it**. If the BME280 module touches the ESP32 board or a warm regulator, its temperature reads too high. Place the module a few centimeters away from the board.

> ➡️ **Ready to practice?** Continue to [Practice 3 — The BME280 on the same bus](#practice-3--the-bme280-on-the-same-bus-30-minutes). When you're done, come back to [Concept 5](#5-1-wire-many-sensors-one-wire-and-serial-numbers).

### 5. 1-Wire: many sensors, one wire, and serial numbers

**1-Wire** is the thriftiest bus: just **one data wire** (plus GND and usually VCC). The best-known 1-Wire sensor is the **DS18B20**, a temperature sensor often sold as a **waterproof probe**: its tiny chip is sealed in a steel tube and connected to a long cable. This probe is great for measuring the temperature of the water in the tank or of the soil, and it will later go on Node 2.

| | DS18B20 |
| :--- | :--- |
| Range | −55 to +125 °C |
| Accuracy | ±0.5 °C (from −10 to +85 °C) |
| Smallest step | 0.0625 °C at 12-bit resolution |
| Measurement time | up to 750 ms at 12-bit resolution |
| Power | 3.0–5.5 V; in our project **always 3.3 V** |

**Factory serial numbers.** Every DS18B20 has a **64-bit serial number** built in when it's made, and no two sensors have the same number. The number is written as eight pairs of hexadecimal digits, for example `28-FF-64-1E-0F-6A-D3-3C`. The first pair (`28`) is the DS18B20 family code, the next six pairs are the actual serial number, and the last pair is a check number (CRC, *cyclic redundancy check*) for detecting data damaged along the way. So if there are three probes on one wire (for example in the tank, in a pot, and outdoors), the ESP32 can ask each one by its serial number.

**The 4.7 kΩ pull-up resistor.** Just like with I2C, the devices only pull the DATA wire down to 0 V; what brings it back to 3.3 V is a 4.7 kΩ resistor from DATA to VCC. The DS18B20 **adapter module** already has this resistor. If your probe has no adapter, you have to add the resistor yourself (see Practice 4).

**How it's read: all of them measure at the same time, then each one is asked in turn.**

```cpp
tempSensors.requestTemperatures();                           // call out to ALL the sensors: "measure now!" (up to 750 ms)
float temperature = tempSensors.getTempC(serialNumbers[0]);  // ask one sensor by its serial number
```

Two libraries work in layers. **OneWire** handles the 1-Wire "wire language", while **DallasTemperature** turns that language into easy commands such as `requestTemperatures()` and `getTempC()`. Both must be installed. The trap: at the time this module was written, DallasTemperature 4.0.6 **doesn't offer** OneWire as a companion, so you have to install OneWire yourself (Practice 4).

**Two "lying" numbers worth memorizing.**

- **85.00 °C** is the built-in value of a sensor that has **just powered up** and hasn't measured anything yet. It shows up again every time the sensor restarts, for example because its power keeps cutting in and out or is too weak.
- **−127 °C** isn't a temperature at all, but a sign from the library that the reading **can't be trusted**. Its official name is `DEVICE_DISCONNECTED_C`. The most common cause: the sensor doesn't answer because a wire is loose, the pull-up is missing, or the sensor is broken.

There's one surprise. DallasTemperature 4.0.6 already recognizes the built-in 85.00 °C value (and also a sign of too little power) from the contents of the sensor's memory, and then reports it as **−127**. So with this week's library, even a sensor that has just restarted usually shows up as −127; a raw 85.00 °C only slips through now and then, for example with clone sensors. The Practice 4 sketch still catches both numbers and prints a clear message, in the spirit of Module 6's Concept 11: a sensor that lies must be **flagged**, not just trusted.

![1-Wire bus diagram. On the left, the ESP32 with the RX2 pin, GPIO 16. A single purple DATA (DQ) line runs to the right, pulled up to 3.3 volts by a 4.7 kilohm pull-up resistor. Three DS18B20 probes hang on that line: a tank probe, a pot probe, and an outdoor probe, each with a different serial number, for example 28-FF-64-1E-0F-6A-D3-3C; a small note: the VCC and GND of each probe aren't drawn. A box below takes that number apart: 28 is the DS18B20 family code, the six middle pairs are the serial number, and the last pair, 3C, is the CRC check number. Bottom left, a box on how to read: one, requestTemperatures, all the sensors measure at the same time, for up to 750 milliseconds; two, getTempC with a serial number, the sensors are asked one by one. At the very bottom, a box with the two lying numbers: 85.00 degrees Celsius is the built-in value of a sensor that has just powered up, and library 4.0.6 usually reports it as minus 127; minus 127 degrees Celsius means the reading can't be trusted because of a loose wire, no pull-up, a broken sensor, or a sensor that has just restarted](assets/onewire-ds18b20.png)

**Probe wire colors.** Most probes use **red = VCC**, **black = GND**, and **yellow** (sometimes white) **= DATA**. Still check against the labels on the adapter or the seller's description, because some manufacturers use other colors.

**Why RX2 (GPIO 16)?** On Node 1, GPIO 16 and 17 (RX2 and TX2) are reserved for RS-485 in Module 15. Until then, GPIO 16 may be **borrowed** for the DS18B20 practice, as noted in `PIN-MAP.md`. On Node 2, the DS18B20 will later get its own permanent pin, GPIO 27.

> ➡️ **Ready to practice?** Continue to [Practice 4 — The DS18B20: water temperature over one wire](#practice-4--the-ds18b20-water-temperature-over-one-wire-30-minutes). When you're done, come back to [Concept 6](#6-spi-and-the-microsd-card-more-wires-more-speed).

### 6. SPI and the microSD card: more wires, more speed

**SPI** (*serial peripheral interface*) uses four data wires; in return, it's fast:

| Wire | Stands for | Job | Our ESP32 pin |
| :--- | :--- | :--- | :--- |
| **SCK** | *serial clock* | the clock from the ESP32 | D18 |
| **MOSI** | *master out, slave in* | data **from** the ESP32 **to** the device | D23 |
| **MISO** | *master in, slave out* | data **from** the device **to** the ESP32 | D19 |
| **CS** | *chip select* | "pick me": `LOW` = this is the device being talked to | D5 |

These four pins are the ESP32's default SPI pins, and they've been reserved for the microSD module in `PIN-MAP.md` since Module 5. If there are several SPI devices, the first three wires are shared, while every device gets **its own CS wire**. A device whose CS is `HIGH` stays quiet, like a student whose name hasn't been called. On some modules and datasheets, MOSI and MISO go by other names: **DI** (*data in*) and **DO** (*data out*), as seen from the card's side, or **SDI**/**SDO**. Wokwi uses the names DI and DO.

The **microSD card** is a good match for SPI because it can hold a lot of data. The card works on **3.3 V**. The common six-pin microSD module comes with two "helpers":

- a **regulator** that lowers 5 V to 3.3 V for the card, which is why this module's VCC pin actually **needs 5 V**;
- a **voltage translator** on the data lines, so the signals to the ESP32 stay at 3.3 V.

There are also modules without a regulator that get 3.3 V directly. How to tell them apart: a regulated module has a regulator chip with three legs and one wide tab (usually labeled "AMS1117-3.3") and one more chip with many legs, which is its voltage translator. Practice 5.2 guides you through checking it. If you're still unsure, choose 3.3 V first: that choice can't damage anything; at worst, the card isn't detected.

**What's on the card: files and folders.** Like a flash drive, the card uses a **file system**, a way of organizing data so that a laptop can read it. The ESP32's **SD** library reads cards formatted as **FAT32**. Cards of 4–16 GB usually come formatted as FAT32 from the factory; cards of 64 GB and up are usually exFAT and need reformatting, so use a 4–16 GB card, as the Syllabus suggests. The code for writing one line to a file looks like this:

```cpp
File file = SD.open("/log.csv", FILE_APPEND);  // the file name always starts with "/"
file.println("15,3094");                       // write one line
file.close();                                  // REQUIRED: only after closing is the content saved
```

`FILE_APPEND` means "add to the end"; the old contents aren't lost. A line that hasn't been `close()`d yet can be lost if the power suddenly goes out.

**CSV: a table in text form.** **CSV** (*comma-separated values*) is a plain text file in which every line holds one record, and the columns are separated by commas. The first line holds the column names:

```text
uptime_s,light
6,3094
11,3102
16,1450
```

A file like this can be opened in Notepad or loaded into a spreadsheet program such as Excel or Google Sheets and then turned into a chart. The `uptime_s` column holds the **seconds since the board was turned on**; its name is the same as the `uptime_s` field in the data contract (Syllabus Appendix A). Because the board doesn't have a real clock yet, this number goes back to zero every time the board restarts. In Module 10, the ESP32 gets the time from the internet, and this column is replaced with the real time.

![Diagram of SPI and the microSD module. Left, the ESP32 with four arrowed wires: SCK, the clock, from D18 to the module; MOSI from D23, from the ESP32 to the card; MISO from the card to D19; and CS from D5, LOW means pick me. Middle, a box for the regulated microSD module containing a 5 volt to 3.3 volt regulator, a voltage translator, and a 3.3 volt microSD card formatted as FAT32; a note below it: this module's VCC is 5 volts from the MB102 on the top rail, while a module without a regulator gets 3.3 volts from the bottom rail. Top right, log.csv opened in Notepad: the header line uptime_s comma light, then 6,3094; 11,3102; 16,1450; and 21,3088. Bottom right, the same file opened in a spreadsheet as a line chart of the light, which dips briefly when the LDR is covered by a hand. Bottom, a Remember box: with several SPI devices, SCK, MOSI, and MISO are shared and every device has its own CS; the file name always starts with a slash, FILE_APPEND adds to the end, and close() is required for the data to be saved; uptime_s is the seconds since the board was turned on, it goes back to 0 at every restart, and the real clock comes in Module 10](assets/spi-microsd.png)

**Cards wear out too.** Each part of a card can only be rewritten so many thousand times. Practice 5 writes every 5 seconds so you see results quickly. Node 1 writes about every 30 seconds; for practice use, that number of writes is still far from the card's wear limit.

**Optional, and you may remove it later.** The microSD module uses four pins. The Syllabus calls it optional: the module may be removed after Module 11, once Node 1 sends its data to the server.

> ➡️ **Ready to practice?** Continue to [Practice 5 — (Optional) A CSV log on a microSD card](#practice-5--optional-a-csv-log-on-a-microsd-card-35-minutes). When you're done (or if you skip it), come back to [Concept 7](#7-combining-many-devices-without-them-interfering-with-each-other).

### 7. Combining many devices without them interfering with each other

After this week, Node 1 has the five Module 6 sensors, a display on the I2C bus, and maybe a microSD card on the SPI bus. To keep them all getting along, follow these seven rules:

1. **One pin, one job.** Check `PIN-MAP.md` before you use any pin (the Module 5 rule). Buses have fixed pins too: I2C on D21/D22, SPI on D18/D19/D23/D5.
2. **I2C addresses must be unique.** The display at `0x3C` and the BME280 at `0x76` can share a bus, but two displays at `0x3C` can't. Many modules have a jumper or solder pads for changing the address.
3. **1-Wire serial numbers are already unique from the factory**, so you can add as many probes to the same wire as you like.
4. **Every SPI device has its own CS**, and all the other CS wires must be `HIGH` while one device is being talked to. The library takes care of this as long as every device gets a different CS pin.
5. **All signals must be 3.3 V, and all GNDs are joined.** A device powered with 5 V (such as the regulated microSD module) may only connect to the ESP32 if its signals have already been translated to 3.3 V.
6. **Keep the bus wires as short as possible**, especially for I2C (Concept 2).
7. **Count the time.** Every job takes time: the DS18B20 up to 750 ms, one `display()` about 25 ms, one CSV line a few to a few dozen milliseconds (sometimes longer, while the card is tidying up its contents). Node 1 still uses `delay()`, so slow readings make the button feel sluggish. Module 8 teaches you how to solve this without `delay()`.

![Bus map of Node 1 version 0.4.0; dashed lines mean only during the Module 7 practice. In the middle, the ESP32. Top left, the I2C bus from D21 (SDA) and D22 (SCL) through strips 19 and 20 of the lower breadboard: the OLED display at 0x3C is connected, and the BME280 at 0x76 is drawn dashed, for practice; it will go on Node 2 in Module 14. Bottom left, the 1-Wire bus from RX2, GPIO 16, to a dashed DS18B20 that is only borrowed for now; GPIO 16 goes back to RS-485 in Module 15. Top right, the fixed pins from Modules 5–6, the private roads: sensors D14 DHT22, VP LDR, VN soil, D34 PIR, D15 and D35 HC-SR04; actuators D32 and D33 relays, D25 pump, D26 servo, D27 buzzer, D4 LED, D13 button. Bottom right, the SPI bus from D18, D19, D23, and CS D5 to the optional microSD module, which may be removed after Module 11. Bottom, a box titled To get along: unique I2C addresses on one bus, every SPI device has its own CS, all signals 3.3 volts and all GNDs joined, and one pin, one job according to PIN-MAP.md](assets/node1-bus-map.png)

> ➡️ **Ready to practice?** Continue to [Practice 6 — A Node 1 status display of your own design](#practice-6--a-node-1-status-display-of-your-own-design-40-minutes). When you're done, come back to [Concept 8](#8-reading-schematics-the-basic-symbols).

### 8. Reading schematics: the basic symbols

The workbench pictures in this module show **where** things go: hole 19j, the bottom rail at column 17, and so on. A **schematic** shows something else: **what is connected to what**. Compare a route map of the KRL commuter line or the MRT with a street map. The route map ignores the bends of the tracks and the real distances; what matters is the order of the stations and where you change lines. A schematic works the same way, so a circuit can be read quickly anywhere, no matter what its breadboard looks like.

Almost every datasheet, product page, and module documentation uses schematics. Once you can read them, you no longer depend on photos of other people's builds.

**Six rules for reading a schematic:**

1. **Line = connection.** The length and the bends of a line mean nothing.
2. **A thick dot at a crossing = connected.** Two lines that cross **without** a dot are **not** connected; one wire just jumps over the other.
3. **A GND symbol** (stepped lines or a triangle) anywhere means a connection to the same GND. That's why a schematic doesn't need to draw long GND wires.
4. **A power symbol** (an arrow or a short bar) labeled `3V3` or `5V` means a connection to that voltage source.
5. **The same label means connected**, even if there's no line between them. The label `SDA` near the ESP32 and the label `SDA` near the display are the same wire. Labels like this are called ***net labels***.
6. **Every part has a code and a value.** R1 = the first resistor, C2 = the second capacitor, D1 = a diode, Q1 = a transistor, U1 = a chip, K1 = a relay, J1 = a connector, SW1 = a switch. The values are written in short form: `10k` = 10 kΩ, `4k7` = 4.7 kΩ (the letter k takes the place of the decimal point), `100n` = 100 nF.

![A sheet of basic schematic symbols in a grid of three columns and six rows. Almost every box holds a symbol, its name, its letter code, and an example of that part from the kit: wire and junction dot, with the example that two crossing lines without a dot are not connected; a box-style and a zigzag-style resistor; potentiometer; LDR, a resistor with two incoming light arrows; an ordinary capacitor and an electrolytic capacitor marked plus; LED with two outgoing arrows; diode with anode and cathode; push button; switch, with the MB102 switch as the example; battery; GND as stepped lines and as a triangle; the 3V3 and 5V power symbols; NPN transistor with the legs B, C, E; N-channel MOSFET with the legs G, D, S; motor, a circle with the letter M; relay, a coil and the contacts COM, NO, NC; optocoupler, an LED and a phototransistor in one box; and module, a box with pin names. Bottom, the Module 6 LDR voltage divider drawn twice. Left, a piece of the lower breadboard, columns 29 to 37: the 10 kilohm resistor from 30g to 34g, the 104 capacitor in 34h and 36h, the LDR in 34i and 36i, an orange wire from 30j to the plus rail, a black wire from 36j to the minus rail, and a gray wire from 34f up to VP. Right, its schematic: 3V3, R1 10 kilohms, the midpoint to the ESP32's VP pin, then the LDR and C1 100 nanofarads to one GND symbol. Numbered markers 1 to 6 point to the same things in both pictures](assets/schematic-symbols.png)

Look at the example at the bottom of the picture: the LDR circuit you built in Module 6 needs only five symbols in the schematic. That's the power of a schematic — the same circuit, but far more compact.

**How to read a schematic you don't know yet:**

1. **Find the power first.** Find all the VCC and GND symbols. Now you know which voltages are used and which parts are "on top" or "at the bottom".
2. **Follow the signal path.** Schematics are usually drawn from left (input) to right (output). Start from a pin you know, for example `IN` or `SDA`, then follow its line, part by part.
3. **Read the codes and values.** Match them with the small print on the real board; codes like "R3" or "C1" are usually printed next to their parts.

### 9. Reading a module's schematic: taking apart the relay module

In Module 5, what's inside the relay module was only described in words: there's an *optocoupler*, a transistor, a *flyback* diode, and an LED. Now you can see its **schematic**. The picture below is a simplified schematic of one channel of an active-LOW relay module with an optocoupler, like the one in the kit.

![Simplified schematic of one channel of an active-LOW relay module, split over two backgrounds: the input side from the ESP32 on the left and the 5 volt coil side on the right, separated by a dashed line. Bottom left, connector J1 with the pins VCC, IN, and GND. From the 5 volt VCC, current flows through resistor R1 1 kilohm, the indicator LED LED1, then the LED inside optocoupler U1 PC817, and ends at the IN pin; marker 1 on the IN path. Inside U1, two light arrows cross the dividing line to the phototransistor; marker 2. Top, a jumper connects VCC to JD-VCC right on the dividing line; marker 5. Right, from JD-VCC, the phototransistor turns on NPN transistor Q1 S8050 through resistor R2 1 kilohm; Q1 pulls relay coil K1 down to GND; diode D1 1N4148 is mounted in reverse, parallel to the coil, with its cathode bar on the JD-VCC side; marker 3. A dashed line from the coil to the contact lever: with no current, COM touches NC; the NC, NO, and COM terminals at the right edge; marker 4. Bottom, the explanations of the five markers. Note: the component values and the layout of your module may differ slightly](assets/relay-module-schematic.png)

Follow the current path with the picture's five markers:

1. **Why active LOW?** Current from VCC (5 V) flows through R1, the indicator LED, and the LED inside the optocoupler, then leaves through the **IN** pin. The current can only leave if IN is pulled down to 0 V (`LOW`). When IN is `HIGH`, the voltage difference across that path is too small to light both LEDs, so no current flows; Module 5 already explained why even the ESP32's `HIGH` of only 3.3 V is usually enough to switch the relay off. That's why your module is active LOW, and why its indicator LED lights up as soon as IN gets `LOW`.
2. **Two sides separated by light.** The LED inside the optocoupler shines on the phototransistor next to it. The command crosses over through **light**, not through a wire. That's why voltage spikes from the relay coil don't go straight into the IN pin and the ESP32's pin. Full separation only happens if the JD-VCC jumper is removed and the coil side gets a power supply with its own GND. On our workbench, the jumper is in place, so both sides still share 5 V and GND, and the main protection is still diode D1.
3. **The flyback diode D1.** When transistor Q1 switches the coil off, the coil briefly "kicks" back with a high voltage. D1, mounted in reverse next to the coil, gives that kick a path, so Q1 isn't damaged. Remember the pump MOSFET in Module 5? The 1N4007 diode there has exactly the same job.
4. **The COM, NO, NC contacts.** As soon as the coil becomes a magnet, the lever inside the relay moves from NC to NO, exactly like the picture of how a relay works in Module 5.
5. **The JD-VCC jumper.** This jumper connects the coil power (JD-VCC) to VCC. If it's removed, the coil gets no power: the indicator LED still lights up, because the input side still has power, but the relay doesn't "click". That's the symptom discussed in Module 5's 🚨 Troubleshooting.

**Where do you find a module's schematic?** Start with the product page and its datasheet. Makers of open-source modules, such as Adafruit and SparkFun, always publish their schematics. Cheap unbranded modules often have no documentation at all. In that case, look for the schematic of a similar module (search for the module's name + *schematic*), then match it with your board: read the codes on the parts and check the connections with your multimeter's continuity (beep) mode from Module 2, **while the module has no power**. A schematic from the internet is only **similar** to your module, so always check it first.

> ➡️ **Ready to practice?** Continue to [Practice 7 — Reading schematics and redrawing Node 1](#practice-7--reading-schematics-and-redrawing-node-1-45-minutes), then Practice 8. After that, go on to [🧩 Independent Challenges](#-independent-challenges).

---

## 🔧 Step-by-step practice

Eight practices, **in order**. The OLED display you connect in Practice 1 stays connected until the end and becomes part of Node 1. The BME280 (Practice 3) and the DS18B20 (Practice 4) are only borrowed for a while, then removed and stored for Node 2. The microSD module (Practice 5) is optional. The practices marked ⭐ in the table of contents are part of the completion requirements:

1. **Practice 6** — the OLED display shows all of Node 1's readings in a layout you designed yourself.
2. **Practice 7** — you can read the relay module's schematic and redraw Node 1 as a schematic.

You can try every practice in Wokwi first, exactly like the Quick Win: open a new ESP32 project, paste in that practice's `diagram.json` from the [`code/`](code/) folder, then paste its code into the `sketch.ino` tab. If the practice has a `libraries.txt`, bring up that tab through **Library Manager** → **+** as in step 4 of the Quick Win, then replace all its contents. Only after that, build it on the real board. Steps that can only be done on the real board are marked.

> [!TIP]
> **How to save this week's sketches.** For each sketch, choose **File → New Sketch** in Arduino IDE, delete its default contents (**Ctrl + A**, then **Delete**), paste the code (**Ctrl + V**), then choose **File → Save** and give it the name mentioned in the practice, for example `module07_i2c_scanner`. When you save the first sketch (Practice 1), first create a `module-07` folder in **Documents → GitHub → learn-iot** with the **New folder** button in the Save window, then save all of this week's sketches there. Commit every time you finish a practice.
>
> **Before clicking Upload**, make sure the board box in Arduino IDE's top bar says **DOIT ESP32 DEVKIT V1** and that the port is correct. Stuck at `Connecting…`? Hold **BOOT** as soon as `Connecting…` appears, and release it when `Writing at …` starts running. The Serial Monitor is always at **115200 baud**.
>
> **Can't see the first lines in the Serial Monitor?** Messages from `setup()` are printed only once, right when the board powers up, and they're often gone before the Serial Monitor is open. Press the **EN** button on the ESP32 board to restart the program from the beginning; the Serial Monitor stays connected and prints them again.
>
> **Opening an old sketch again:** choose **File → Open Recent**, or **File → Open…** and then open **Documents → GitHub → learn-iot → module-07**. This week's sketches don't appear in **File → Sketchbook**, because they're saved outside the Sketchbook folder.

> [!IMPORTANT]
> **This week's building habit** (the same as in Modules 5–6): **before connecting or moving a wire, turn off the MB102, then unplug the USB.** When you've finished building, plug in the USB first, then turn on the MB102. Practices 1–4 only use 3.3 V from the ESP32, so the MB102 can stay off until Practice 5.
>
> **How to read hole names** is the same too: number = column, letter = row. All of this week's new holes are on the **lower breadboard**, except one: the VCC wire of the regulated microSD module goes to the **top rail** (Practice 5). Example: **19j** means column 19, row j, lower breadboard. The workbench picture in each practice shows the old parts faded, and its close-up box writes the names of the ESP32 pins above the columns that line up with those pins.

By the end of the module, your practice folder contains:

```text
learn-iot/
└── module-07/
    ├── module07_i2c_scanner/       ← Practice 1
    ├── module07_first_oled/        ← Practice 1 (the Quick Win sketch)
    ├── module07_oled_layout/       ← Practice 2
    ├── module07_bme280/            ← Practice 3
    ├── module07_ds18b20/           ← Practice 4
    ├── module07_microsd_log/       ← Practice 5 (optional)
    ├── module07_node1_display/     ← Practice 6 ⭐
    ├── schematic-node1.jpg         ← Practice 7 ⭐ (a photo or image export of your schematic)
    └── notes-module07.md           ← Practice 8 (addresses, serial numbers, and your Practice 7 answers)
```

### Practice 1 — The OLED display and the I2C scanner (35 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (with the **Library Manager**) or Wokwi, the 0.96-inch OLED display, 2 **male–male** jumper wires (blue and yellow), and 4 **male–female** jumper wires (black, orange, yellow, blue). Concepts used: 1 and 2.

#### 1.1 Install the Adafruit SSD1306 library

1. In Arduino IDE, click the **Library Manager** icon in the left sidebar (the third icon, a picture of books), just like in Module 6.
2. Type **Adafruit SSD1306** in the search box. Choose the entry named exactly **Adafruit SSD1306** with **by Adafruit** written under its title. There are a few similar names, for example **Adafruit SSD1306 Wemos Mini OLED**, **Adafruit SSD1306 EMULATOR**, and **ESP8266 and ESP32 OLED driver for SSD1306 displays**; those aren't the one we use.
3. In the version menu, choose **2.5.17**, then click **INSTALL**.
4. An `Install library dependencies` window appears with the message `The library Adafruit SSD1306:2.5.17 needs some other dependencies currently not installed:`, followed by a list with **Adafruit BusIO** and **Adafruit GFX Library**, then the question `Would you like to install all the missing dependencies?`. Click **INSTALL ALL**: SSD1306 needs GFX for drawing, and GFX needs BusIO for talking over I2C.
5. Wait until the **Output** panel at the bottom prints `Installed Adafruit SSD1306@2.5.17` and the notification `Successfully installed library Adafruit SSD1306:2.5.17` appears in the bottom right corner.

![Illustration of the Arduino IDE 2 Library Manager. Marker 1 on the books icon of the Library Manager in the left sidebar. The search box holds Adafruit SSD1306; the entry Adafruit SSD1306 by Adafruit with the version menu at 2.5.17 and the INSTALL button, marked with marker 2; below it the entry Adafruit SSD1306 Wemos Mini OLED by Adafruit + mcauser with the note not this one, and ESP8266 and ESP32 OLED driver for SSD1306 displays with the note not this one either. On the right, the Install library dependencies window with the message The library Adafruit SSD1306:2.5.17 needs some other dependencies currently not installed, minus Adafruit BusIO, minus Adafruit GFX Library, Would you like to install all the missing dependencies, with two buttons, INSTALL WITHOUT DEPENDENCIES and INSTALL ALL; marker 3 on INSTALL ALL. Below, the Output panel with the Downloading, Installing, and Installed lines for Adafruit BusIO@1.17.4, Adafruit GFX Library@1.12.6, and Adafruit SSD1306@2.5.17. Marker labels: choose 2.5.17, click INSTALL; then click INSTALL ALL. A note below the picture: an illustration, not a screenshot](assets/arduino-library-ssd1306.png)

If you've already clicked **INSTALL WITHOUT DEPENDENCIES**, compiling will fail later with the message `fatal error: Adafruit_GFX.h: No such file or directory`. The fix: find and install **Adafruit GFX Library** version 1.12.6 and **Adafruit BusIO** version 1.17.4 in the Library Manager.

#### 1.2 Connect the bus bridge wires and the display

Make sure the MB102 is off and the USB is unplugged. First look at the labels on your display's four pins. The most common order is **GND, VCC, SCL, SDA**, but some displays use the order **VCC, GND, SCL, SDA**. Follow the **labels**, not the order in the picture. On a display with the order VCC, GND, SCL, SDA, the black and orange wires will cross. That's fine, as long as the **GND** pin goes to the (−) rail at column 17 and the **VCC** pin to the (+) rail at column 18.

| Part | From | To | Purpose |
| :--- | :--- | :--- | :--- |
| **Blue** wire (male–male) | 14d | 20f | connects the strip of the D21 (SDA) pin to strip 20, rows f–j |
| **Yellow** wire (male–male) | 17e | 19f | connects the strip of the D22 (SCL) pin to strip 19, rows f–j |
| **Black** wire (male–female) | the display's **GND** pin | bottom rail **(−)** column 17 | GND |
| **Orange** wire (male–female) | the display's **VCC** pin | bottom rail **(+)** column 18 | 3.3 V from the ESP32 |
| **Yellow** wire (male–female) | the display's **SCL** pin | 19j | the SCL strip |
| **Blue** wire (male–female) | the display's **SDA** pin | 20j | the SDA strip |

The female ends go on the display's pins; the male ends plug into the breadboard. Place the display on the table in front of the lower breadboard, face up, so it's easy to read from where you sit.

![Illustration of the workbench after Practice 1, seen from above. The Module 5 and 6 parts are drawn faded. The new additions in bright colors on the lower breadboard: a blue wire from 14d to 20f and a yellow wire from 17e down across the center channel to 19f. In front of the lower breadboard, the blue OLED display faces up with four pins along its top edge: a black wire from GND to the bottom rail minus at column 17, orange from VCC to the bottom rail plus at column 18, yellow from SCL to 19j, and blue from SDA to 20j, all four straight, without crossing. Labels: strip 19, rows f to j, equals SCL; strip 20, rows f to j, equals SDA; the display gets 3.3 volts from the bottom rail. A close-up box of columns 12 to 22 with four markers explains both bridge wires and the four display wires. A purple note box: strip 19, rows f to j, equals SCL and strip 20, rows f to j, equals SDA, this is your I2C toll road; holes 19g to 19i and 20g to 20i are still empty for the next I2C devices; the D21 pin is at 14b and the D22 pin at 17b, in the bottom row of pins of the ESP32 board](assets/workbench-oled.png)

**Why do the SCL and SDA wires cross in Wokwi but not on your workbench?** On the ESP32 board, D21 (SDA) is to the **left** of D22 (SCL). On the display, the order is reversed: SCL is to the left of SDA. In Wokwi, the display's wires go straight to D21 and D22, so they have to cross. On the workbench, the two bridge wires have already "swapped" the order: the SCL strip (19) is to the left of the SDA strip (20). Crossed or not, the electrical connection is the same; what matters is that every end goes into the right hole.

#### 1.3 Find the display's address with the I2C scanner

1. Plug the laptop's USB cable into the ESP32 board. The MB102 can stay off.
2. Create a new sketch `module07_i2c_scanner` (and create the `module-07` folder at the same time; see the **Tip** box above), paste this code, then click **Upload**:

   ```cpp
   // Module 7 - Practice 1: I2C scanner
   // "Knocks on the door" of addresses 1 to 126 one by one, then prints the addresses that answer.
   // I2C bus: SDA to D21, SCL to D22. No extra library needed: Wire already comes with the esp32 package.

   #include <Wire.h>

   const int PIN_SDA = 21;  // D21: I2C data line (canonical pin map)
   const int PIN_SCL = 22;  // D22: I2C clock line (canonical pin map)

   // Guesses the device's name from its address. It only knows the devices in this curriculum.
   String guessName(byte address) {
     if (address == 0x3C || address == 0x3D) {
       return "SSD1306 OLED display";
     }
     if (address == 0x76) {
       return "BME280 or BMP280 (SDO pin to GND)";
     }
     if (address == 0x77) {
       return "BME280 or BMP280 (SDO pin to VCC), or BMP180";
     }
     return "another device (check its datasheet)";
   }

   // Prints the address as a two-digit hexadecimal number, for example 0x3C or 0x08.
   void printAddress(byte address) {
     Serial.print("0x");
     if (address < 0x10) {
       Serial.print("0");
     }
     Serial.print(address, HEX);
   }

   void setup() {
     Serial.begin(115200);
     Wire.begin(PIN_SDA, PIN_SCL);
     delay(500);
     Serial.println();
     Serial.println("I2C scanner ready.");
   }

   void loop() {
     Serial.println("Scanning addresses 0x01 to 0x7E...");
     int count = 0;
     for (byte address = 1; address < 127; address++) {
       Wire.beginTransmission(address);      // knock on this address's door
       byte reply = Wire.endTransmission();  // 0 = someone answered "yes, I'm here"
       if (reply == 0) {
         Serial.print("  Device found at ");
         printAddress(address);
         Serial.print(" -> ");
         Serial.println(guessName(address));
         count++;
       }
     }
     if (count == 0) {
       Serial.println("  Nobody answered. Check the SDA, SCL, VCC, and GND wires.");
     } else {
       Serial.print("Done: ");
       Serial.print(count);
       Serial.println(" device(s) found.");
     }
     Serial.println();
     delay(5000);  // scan again every 5 seconds, so the result stays visible even if you open the Serial Monitor late
   }
   ```

3. Open the Serial Monitor (**115200 baud**). A scan result appears every 5 seconds.

**Expected output:**

```text
I2C scanner ready.
Scanning addresses 0x01 to 0x7E...
  Device found at 0x3C -> SSD1306 OLED display
Done: 1 device(s) found.
```

The line `I2C scanner ready.` only shows up if the Serial Monitor is already open when the board powers up; it's fine if you miss it. The display itself is still dark: this sketch only knocks on addresses, it doesn't turn the display on. If your result is different:

- **`0x3D` instead of `0x3C`:** a small number of displays use this address. Remember the number; in every sketch this week, replace `0x3C` in the line `const byte DISPLAY_ADDRESS = 0x3C;` with `0x3D`.
- **`Nobody answered.`:** check the SDA, SCL, VCC, and GND wires, and both bridge wires. Open 🚨 as well.
- **Does the back of your display say "0x78" or "0x7A"?** That's the same address in 8-bit form: `0x3C` × 2 = `0x78`, and `0x3D` × 2 = `0x7A`. In the code, still write the address the scanner found.

**Make the most common mistake on purpose.** Unplug the USB, then swap the ends of the yellow and blue wires from the display (yellow to 20j, blue to 19j). Plug the USB back in: the scanner prints `Nobody answered.`. The reason: the display now receives the drumbeats (the clock) on its SDA pin and the data on its SCL pin, so it never "hears" its address being called. Remember this explanation; the completion checklist asks about it. Unplug the USB, put both wires back in their places (yellow 19j, blue 20j), then plug in the USB: `0x3C` shows up again. This mistake happens often, and the scanner catches it within seconds.

**In Wokwi:** use the Practice 1 [`diagram.json`](code/module07_i2c_scanner/diagram.json) (the same as the Quick Win's). This sketch doesn't need a `libraries.txt`, because the **Wire** library already comes with the esp32 package. The result is exactly the same.

#### 1.4 Turn on your real display

1. Create a new sketch `module07_first_oled`, paste the [Quick Win](#-quick-win-your-first-oled-display-right-in-wokwi-10-minutes) code (or copy it from the file [`code/module07_first_oled/module07_first_oled.ino`](code/module07_first_oled/module07_first_oled.ino)), then click **Upload**.
2. The display shows `Hello,` and `Node 1!` for two seconds, then a seconds count in big numbers — the same as in Wokwi. Is the display still dark? Open [🚨 Troubleshooting](#-troubleshooting), the section **The display stays dark**.

If your display is two-color, `Hello,` appears in yellow and `Node 1!` in blue: size 2 text is 16 pixels tall, so the first line exactly fills the yellow band. A display that a sketch doesn't use keeps showing its last picture until the power is cut. So if you later upload another sketch that doesn't use the display, the last number frozen on it is normal.

> ⬆️ **Done with Practice 1?** Go back to [Concept 3](#3-the-oled-display-pixels-coordinates-and-the-drawing-paper) (the ➡️ there will take you to Practice 2).

### Practice 2 — The display toolbox: text, coordinates, and icons (25 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (or Wokwi) and the Practice 1 circuit. No new wires. Concepts used: 3.

#### 2.1 Upload the three-page sketch

Create a new sketch `module07_oled_layout`, paste this code, then click **Upload**:

```cpp
// Module 7 - Practice 2: the OLED display toolbox
// Three "pages" take turns every 3 seconds: text sizes, coordinates, then icons and a big number.
// OLED display: SDA to D21, SCL to D22.
// Library: Adafruit SSD1306 2.5.17 (installed with it: Adafruit GFX Library 1.12.6 and Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;             // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;             // D22: I2C clock line (canonical pin map)
const byte DISPLAY_ADDRESS = 0x3C;  // the display's "home address" on the I2C bus

Adafruit_SSD1306 display(128, 64, &Wire, -1);

// 8 x 8 pixel icons. Each binary number is one row: 1 = pixel on, 0 = pixel off.
const unsigned char ICON_THERMOMETER[] = {
  0b00011000,
  0b00100100,
  0b00100100,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b00111100,
};
const unsigned char ICON_DROP[] = {
  0b00011000,
  0b00011000,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b01111110,
  0b00111100,
};
const unsigned char ICON_SUN[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char ICON_PLANT[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char ICON_TANK[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char ICON_PERSON[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

int page = 1;            // the page being shown: 1, 2, or 3
int samplePercent = 45;  // sample number for the percent bar; goes up by 10 every time page 3 is shown

// Page 1: three text sizes. One size-1 character = 6 x 8 pixels (including the gap between characters).
void textSizePage() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("Size 1: small");
  display.setTextSize(2);
  display.setCursor(0, 16);  // start below the yellow band of a two-color display
  display.print("Size 2");
  display.setTextSize(3);
  display.setCursor(0, 40);  // 40 + 24 = 64: right down to the bottom row
  display.print("Size 3");
}

// Page 2: coordinates. x grows to the right, y grows DOWNWARD.
void coordinatePage() {
  display.drawRect(0, 0, 128, 64, SSD1306_WHITE);   // frame around the edge of the display
  display.setTextSize(1);
  display.setCursor(3, 3);
  display.print("(0,0)");
  display.setCursor(44, 3);
  display.print("x");
  display.write(26);                                 // right arrow (code 26 in the character table)
  display.setCursor(3, 28);
  display.print("y");
  display.write(25);                                 // down arrow (code 25)
  display.drawLine(60, 32, 68, 32, SSD1306_WHITE);   // + sign in the middle of the display
  display.drawLine(64, 28, 64, 36, SSD1306_WHITE);
  display.setCursor(70, 24);
  display.print("(64,32)");
  display.setCursor(76, 53);
  display.print("(127,63)");
}

// Page 3: icons, a big number with a small unit, a percent bar, and inverted text.
void iconPage() {
  display.drawBitmap(0, 0, ICON_THERMOMETER, 8, 8, SSD1306_WHITE);
  display.drawBitmap(14, 0, ICON_DROP, 8, 8, SSD1306_WHITE);
  display.drawBitmap(28, 0, ICON_SUN, 8, 8, SSD1306_WHITE);
  display.drawBitmap(42, 0, ICON_PLANT, 8, 8, SSD1306_WHITE);
  display.drawBitmap(56, 0, ICON_TANK, 8, 8, SSD1306_WHITE);
  display.drawBitmap(70, 0, ICON_PERSON, 8, 8, SSD1306_WHITE);

  display.setTextSize(3);         // big number: one character is 18 x 24 pixels
  display.setCursor(0, 16);
  display.print("28.5");
  display.setTextSize(1);         // small unit at the top right of the number
  display.setCursor(74, 16);
  display.write(248);             // degree sign (code 248 in the character table)
  display.print("C");

  display.fillRect(88, 30, 40, 11, SSD1306_WHITE);      // white box...
  display.setTextColor(SSD1306_BLACK);                  // ...with black text on it = inverted text
  display.setCursor(91, 32);
  display.print("MOTION");
  display.setTextColor(SSD1306_WHITE);                  // back to white text

  display.setCursor(0, 46);
  display.print("Soil ");
  display.print(samplePercent);
  display.print("%");
  display.drawRect(0, 56, 128, 8, SSD1306_WHITE);               // bar frame
  display.fillRect(2, 58, 124 * samplePercent / 100, 4, SSD1306_WHITE);  // fill the bar to match the percent

  samplePercent = samplePercent + 10;
  if (samplePercent > 100) {
    samplePercent = 0;
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS);
  display.cp437(true);  // use the correct CP437 character table, so that code 248 = the degree sign
  display.setTextColor(SSD1306_WHITE);
  Serial.println("Display toolbox ready. The page changes every 3 seconds.");
}

void loop() {
  display.clearDisplay();
  if (page == 1) {
    textSizePage();
  } else if (page == 2) {
    coordinatePage();
  } else {
    iconPage();
  }
  display.display();
  Serial.print("Page ");
  Serial.println(page);

  page++;
  if (page > 3) {
    page = 1;
  }
  delay(3000);
}
```

The display changes pages every 3 seconds, and the Serial Monitor prints `Page 1`, `Page 2`, `Page 3`, then goes back to `Page 1`.

![Screenshot of the Practice 2 Wokwi run: the OLED display on all three pages, side by side. Page 1, text sizes: Size 1: small in small letters, Size 2 bigger, and Size 3 the biggest. Page 2, coordinates: a frame around the edge of the display, (0,0) in the top left corner with an x arrow pointing right, a y arrow pointing down, a plus sign at (64,32), and (127,63) in the bottom right corner. Page 3: six small icons in a row at the top, a big 28.5 with a small degree C, an inverted white box with the word MOTION, and Soil 45% with a percent bar](assets/wokwi-oled-layout.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

| Page | What it shows | Its key commands |
| :---: | :--- | :--- |
| 1 | three text sizes: small, medium, large | `setTextSize()`, `setCursor()` |
| 2 | coordinates: (0, 0) at the top left, x to the right, y **down**, (127, 63) at the bottom right | `drawRect()`, `drawLine()`, `write(26)` and `write(25)` for the arrows |
| 3 | six icons, a big number with a small °C, the inverted text `MOTION`, and a percent bar | `drawBitmap()`, `write(248)`, `fillRect()` |

The `Soil` bar on page 3 grows by 10% every time that page appears, starting at 45%, and goes back to 0% after it passes 100%. Look at the length of its fill: `124 * samplePercent / 100` pixels out of the 124 pixels of width inside the frame.

**In Wokwi:** use the Practice 2 [`diagram.json`](code/module07_oled_layout/diagram.json) and [`libraries.txt`](code/module07_oled_layout/libraries.txt).

#### 2.2 Experiment

Change one thing, click **Upload**, look at the result, then move on to the next change:

1. **Your name on page 1.** Replace `"Size 1: small"` with your name. One line at size 1 holds 21 characters; the 22nd character and beyond wrap to the next line.
2. **Move the + sign on page 2** to the point (100, 20). The sign is made of two lines: change the line `display.drawLine(60, 32, 68, 32, SSD1306_WHITE);` to `display.drawLine(96, 20, 104, 20, SSD1306_WHITE);`, and the line `display.drawLine(64, 28, 64, 36, SSD1306_WHITE);` to `display.drawLine(100, 16, 100, 24, SSD1306_WHITE);`. The text `(64,32)` doesn't move with it, because text has its own `setCursor`; change it too if you like.
3. **An icon of your own.** Draw an 8 × 8 box on graph paper, shade the squares you want to light up, then write each row as a binary number. For example, a heart icon:

   ```cpp
   const unsigned char ICON_PERSON[] = {  // its contents are replaced with a heart; the name stays, so the rest of the code doesn't need to change
     0b01100110,
     0b11111111,
     0b11111111,
     0b11111111,
     0b01111110,
     0b00111100,
     0b00011000,
     0b00000000,
   };
   ```

   Replace the contents of `ICON_PERSON` with your own design, then look at the sixth icon on page 3.

> ⬆️ **Done with Practice 2?** Go back to [Concept 4](#4-bme280-three-sensors-in-one-tiny-box--and-its-deceptive-twin) (the ➡️ there will take you to Practice 3).

### Practice 3 — The BME280 on the same bus (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (with the **Library Manager**) or Wokwi, the BME280 module, 4 **male–female** jumper wires (orange, black, yellow, blue), and the Practice 1 circuit (the display stays connected). The DHT22 from Module 6 is read too, for comparison. Concepts used: 2 and 4.

#### 3.1 Install the Adafruit BME280 library

1. In the **Library Manager**, type **Adafruit BME280**. Choose **Adafruit BME280 Library** with **by Adafruit** written under its title, version **2.3.0**, then click **INSTALL**.
2. The `Install library dependencies` window appears again, listing **Adafruit BusIO** and **Adafruit Unified Sensor**, even though both are already installed (Unified Sensor since Module 6, BusIO since Practice 1). Arduino IDE 2.3.10 really does still show this window. Click **INSTALL ALL**; the versions are the same, so nothing breaks.

#### 3.2 Connect the BME280 to the bus strips

Make sure the MB102 is off and the USB is unplugged. The BME280 module in the kit usually has **four pins** (VCC or VIN, GND, SCL, SDA). If your module has **six pins** (VCC, GND, SCL, SDA, CSB, SDO), **leave** the last two **unconnected**.

| Wire (male–female) | From the BME280 pin | To | Purpose |
| :--- | :--- | :--- | :--- |
| **Orange** | **VCC** (or VIN) | bottom rail **(+)** column 14 | 3.3 V from the ESP32 |
| **Black** | **GND** | bottom rail **(−)** column 14 | GND |
| **Yellow** | **SCL** | 19h | the SCL strip, the same strip as the display's SCL at 19j |
| **Blue** | **SDA** | 20i | the SDA strip, the same strip as the display's SDA at 20j |

The other empty holes in strip 19 (19g, 19i) and strip 20 (20g, 20h) work too; what matters is SCL in strip 19 and SDA in strip 20. Place the BME280 module a few centimeters away from the ESP32 board, so it doesn't get warmed up by it (Concept 4).

![Illustration of the workbench after Practice 3. The old parts, including the OLED display and both bridge wires, are drawn faded. In front of the lower breadboard, a little farther away than the display, a purple BME280 module with four pins, VCC, GND, SCL, SDA. An orange wire from VCC goes up through the gap at column 13, then curves into the bottom rail plus at column 14; a black wire from GND goes straight to the bottom rail minus at column 14; a yellow wire from SCL goes up to row h, then right to 19h; a blue wire from SDA goes up to row i, then right to 20i. A close-up box of columns 12 to 22 with four markers explains the four wires; note: two devices, the same two data wires, that's a bus](assets/workbench-bme280.png)

#### 3.3 Scan again: two devices, one bus

Plug in the USB, then open the `module07_i2c_scanner` sketch again: **File → Open Recent → module07_i2c_scanner** (or **File → Open…** → **Documents → GitHub → learn-iot → module-07 → module07_i2c_scanner**). Click **Upload**, then open the Serial Monitor (**115200 baud**).

**Expected output** (your BME280's address may be `0x76` or `0x77`):

```text
Scanning addresses 0x01 to 0x7E...
  Device found at 0x3C -> SSD1306 OLED display
  Device found at 0x76 -> BME280 or BMP280 (SDO pin to GND)
Done: 2 device(s) found.
```

Two devices answer from the same wires. That's the I2C bus: shared wires, different addresses. The scanner only knows **addresses**; it can't tell a BME280 from a BMP280 yet. That's the job of the next step.

#### 3.4 Read the BME280 and compare it with the DHT22

Create a new sketch `module07_bme280`, paste this code, then click **Upload**:

```cpp
// Module 7 - Practice 3: the BME280 on the I2C bus, compared with the DHT22
// BME280: SDA to D21, SCL to D22 (the same bus as the OLED display). The DHT22 stays on D14.
// Libraries: Adafruit BME280 Library 2.3.0 (installed with it: Adafruit Unified Sensor 1.1.15 and Adafruit BusIO 1.17.4)
//            and DHT sensor library 1.4.7 (from Module 6).

#include <Wire.h>
#include <Adafruit_BME280.h>
#include <DHT.h>

const int PIN_SDA = 21;  // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;  // D22: I2C clock line (canonical pin map)
const int PIN_DHT = 14;  // D14: DHT22 (canonical pin map)

Adafruit_BME280 bme;
DHT dht(PIN_DHT, DHT22);
bool bmeReady = false;  // true if a genuine BME280 was found

// Returns true if a device responds at that address (the I2C scanner's trick).
bool deviceAt(byte address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

void printHex(int value) {
  Serial.print("0x");
  if (value < 0x10) {
    Serial.print("0");
  }
  Serial.print(value, HEX);
}

// Looks for the BME280 at both of its addresses, then checks its "ID card" (the chip ID).
bool setupBme() {
  byte address = 0;
  if (deviceAt(0x76)) {
    address = 0x76;
  } else if (deviceAt(0x77)) {
    address = 0x77;
  }
  if (address == 0) {
    Serial.println("No device at 0x76 or 0x77. Check the four BME280 wires.");
    return false;
  }
  Serial.print("Device found at ");
  printHex(address);
  Serial.println(". Checking its chip ID...");

  if (bme.begin(address)) {
    Serial.println("Chip ID 0x60: a genuine BME280 (temperature, humidity, and pressure).");
    return true;
  }
  int id = bme.sensorID();  // the chip ID that was just read from that device
  Serial.print("Its chip ID is ");
  printHex(id);
  Serial.print(", not 0x60. ");
  if (id == 0x56 || id == 0x57 || id == 0x58) {
    Serial.println("This is a BMP280: temperature and pressure only, NO humidity.");
  } else if (id == 0x55) {
    Serial.println("This is a BMP180: the BME280's older cousin, temperature and pressure only.");
  } else if (id == 0x61) {
    Serial.println("This is a BME680: it has a gas sensor too and needs a different library.");
  } else {
    Serial.println("Unknown chip.");
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Wire.begin(PIN_SDA, PIN_SCL);
  dht.begin();
  bmeReady = setupBme();
  Serial.println("The first reading appears in 2 seconds.");
}

void loop() {
  delay(2000);  // the DHT22 can be read at most once every 2 seconds

  float dhtTemperature = dht.readTemperature();
  float dhtHumidity = dht.readHumidity();

  Serial.print("DHT22 : temperature=");
  if (isnan(dhtTemperature) || isnan(dhtHumidity)) {
    Serial.println("-- (read failed)");
  } else {
    Serial.print(dhtTemperature, 1);
    Serial.print(" C  humidity=");
    Serial.print(dhtHumidity, 0);
    Serial.println(" %");
  }

  if (!bmeReady) {
    Serial.println("BME280: not ready (see the message above)");
    return;
  }
  float bmeTemperature = bme.readTemperature();    // degrees Celsius
  float bmeHumidity = bme.readHumidity();          // percent
  float pressure = bme.readPressure() / 100.0;     // pascals divided by 100 = hPa
  Serial.print("BME280: temperature=");
  Serial.print(bmeTemperature, 1);
  Serial.print(" C  humidity=");
  Serial.print(bmeHumidity, 0);
  Serial.print(" %  pressure=");
  Serial.print(pressure, 1);
  Serial.println(" hPa");

  if (!isnan(dhtTemperature) && !isnan(dhtHumidity)) {
    Serial.print("difference: temperature ");
    Serial.print(fabs(bmeTemperature - dhtTemperature), 1);  // fabs = absolute value, always positive
    Serial.print(" C, humidity ");
    Serial.print(fabs(bmeHumidity - dhtHumidity), 0);
    Serial.println(" %");
  }
  Serial.println();
}
```

Once `Done uploading` appears, open the Serial Monitor (**115200 baud**). A new sketch always opens in its own Arduino IDE window, so you need to open its Serial Monitor again. The chip ID lines are printed only **once**, right after the board powers up. If all you can see are `DHT22 :` and `BME280:` lines, press the **EN** button on the ESP32 board: the program starts over and prints the chip ID lines again.

**Expected output** on a real board, roughly like this (your numbers will certainly be different):

```text
Device found at 0x76. Checking its chip ID...
Chip ID 0x60: a genuine BME280 (temperature, humidity, and pressure).
The first reading appears in 2 seconds.
DHT22 : temperature=28.5 C  humidity=71 %
BME280: temperature=29.1 C  humidity=66 %  pressure=1009.6 hPa
difference: temperature 0.6 C, humidity 5 %
```

If you get `Its chip ID is 0x58, not 0x60. This is a BMP280: temperature and pressure only, NO humidity.`, your sensor is a BMP280. Save a photo of that message as evidence in case you want to complain to the seller. A BMP280 can still be used for temperature and pressure, but it needs a different library. Besides, Node 2 needs a genuine BME280. You can still continue with this module: skip experiment 3.5 (this sketch only reads a genuine BME280), and for the checklist it's enough to explain what chip ID `0x58` means. A genuine BME280 is only needed in Module 14, so there's still time to exchange it or buy one.

**In Wokwi:** use the Practice 3 [`diagram.json`](code/module07_bme280/diagram.json) and [`libraries.txt`](code/module07_bme280/libraries.txt). Wokwi doesn't have a BME280 yet, so that diagram puts a **BMP180** on the I2C bus (besides the display and the DHT22). The BMP180 is an older-generation pressure sensor from Bosch, with the address `0x77` and the chip ID `0x55`. The result shows that the chip ID check works, exactly as it would when it catches a fake sensor:

```text
Device found at 0x77. Checking its chip ID...
Its chip ID is 0x55, not 0x60. This is a BMP180: the BME280's older cousin, temperature and pressure only.
The first reading appears in 2 seconds.
DHT22 : temperature=28.5 C  humidity=71 %
BME280: not ready (see the message above)
DHT22 : temperature=28.5 C  humidity=71 %
BME280: not ready (see the message above)
```

![Cropped screenshot of the Practice 3 Wokwi run, with markers. The circuit: the DHT22 above the ESP32 board with a yellow data wire to D14 (marker 2); a blue BMP180 module at the bottom left with VCC, GND, SCL, and SDA wires, standing in for the BME280 because Wokwi doesn't have a BME280 yet, address 0x77 (marker 1); and the OLED display at the bottom right on the same I2C bus, address 0x3C, not used by this sketch (marker 3). Bottom, the Serial Monitor: Device found at 0x77. Checking its chip ID..., then the boxed line, Its chip ID is 0x55, not 0x60. This is a BMP180: the BME280's older cousin, temperature and pressure only. (marker 4: the chip ID check works), and The first reading appears in 2 seconds.](assets/wokwi-bme280.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

Run the scanner sketch with the same diagram too: stop the simulation (**■**), replace the contents of the `sketch.ino` tab with the Practice 1.3 scanner code, then click **▶**. Wokwi finds two devices, `0x3C` (the display) and `0x77` (the BMP180).

#### 3.5 Experiment (real board)

1. **Breathe** gently toward both sensors from about 10 cm away. The humidity of both goes up. Notice which one reacts first: usually the BME280.
2. **Hold the BME280 between two fingers** for half a minute. Its temperature goes up, while the DHT22's doesn't, because you're only warming the BME280.
3. **Compare the pressure** with an online weather forecast for your city, which usually gives the pressure in hPa or mbar (1 hPa is the same as 1 mbar). If your city is in the highlands, the BME280's number is much smaller, because weather forecasts give the pressure recalculated as if it were measured at sea level. The difference is about 12 hPa for every 100 meters of your city's altitude.

#### 3.6 Remove and store the BME280

When you're done, turn off the MB102 (if it's on), unplug the USB, then remove the BME280's four wires. Store the module in a dry box for Node 2 (Module 14). The display and both bridge wires stay connected.

> ⬆️ **Done with Practice 3?** Go back to [Concept 5](#5-1-wire-many-sensors-one-wire-and-serial-numbers) (the ➡️ there will take you to Practice 4).

### Practice 4 — The DS18B20: water temperature over one wire (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (with the **Library Manager**) or Wokwi, the waterproof DS18B20 probe + its adapter module, 3 **male–female** jumper wires (orange, purple, black), a small screwdriver for the adapter's screw terminal, a glass of water on a tray, and a cloth. The display stays connected; the BME280 has already been removed. Concepts used: 5.

#### 4.1 Install two libraries at once: OneWire and DallasTemperature

1. In the **Library Manager**, type **OneWire**. Choose the one named exactly **OneWire**, whose list of authors starts with **Jim Studt, Tom Pollard, …**, version **2.3.8**, then click **INSTALL**. Don't choose **OneWireNg**, **OneWireHub**, or **MAX31850 OneWire**.
2. Type **DallasTemperature**. Choose **DallasTemperature**, whose list of authors starts with **Miles Burton**, version **4.0.6**, then click **INSTALL**.

This time there's **no** `Install library dependencies` window: DallasTemperature 4.0.6 doesn't list OneWire as its companion. That's why OneWire is installed separately in step 1. If you forget to install OneWire, compiling fails with the message `fatal error: OneWire.h: No such file or directory`.

#### 4.2 Connect the adapter and the probe

Make sure the MB102 is off and the USB is unplugged.

1. **Connect the probe to the adapter.** Loosen the three screws of the adapter's green terminal, insert the probe's wire ends according to the labels next to it (usually red to VCC, black to GND, yellow or white to DAT), then tighten them again. Gently tug each wire to make sure it's held firmly.
2. **Connect the adapter to the breadboard:**

| Wire (male–female) | From the adapter pin | To | Purpose |
| :--- | :--- | :--- | :--- |
| **Orange** | **VCC** | bottom rail **(+)** column 14 | 3.3 V from the ESP32, **not 5 V** |
| **Purple** | **DAT** (sometimes labeled DQ, OUT, or S) | **9e** | the strip of the RX2 (GPIO 16) pin |
| **Black** | **GND** | bottom rail **(−)** column 16 | GND |

> [!CAUTION]
> **9e, not 9f–9j.** The RX2 pin is at 9b, and its strip is rows a–e only. Column 9 below the center channel (rows f–j) is the strip of the cathode leg of the status LED connected in Module 5, and that strip is connected to GND. A DAT wire plugged in there means the sensor is never detected.

![Illustration of the workbench after Practice 4. The BME280 has been removed; the OLED display and both bridge wires are drawn faded. In front of the lower breadboard, a blue DS18B20 adapter with three pins, VCC, DAT, GND, and a green screw terminal; the black cable of the waterproof probe comes out of the terminal and ends in the steel tip. An orange wire from VCC goes straight to the bottom rail plus at column 14; a purple wire from DAT goes up in column 15 to the center channel, then left to column 9 and up to 9e; a black wire from GND goes straight to the bottom rail minus at column 16. Labels: DAT to 9e, the RX2 (GPIO 16) strip, above the center channel; the DS18B20 gets 3.3 volts from the bottom rail, not 5 volts. A close-up box of columns 7 to 17 with the ESP32 pin names above it and three markers for the three wires. A purple note box: watch out, 9e above the center channel isn't the same as 9f to 9j below it, because column 9, rows f to j, is the status LED's cathode strip, which is connected to GND; the 4.7 kilohm resistor is already on the adapter, so you don't need to add another one](assets/workbench-ds18b20.png)

**A probe without an adapter?** Its wire ends are stranded wires that are hard to plug into a breadboard. The easiest options are to buy the adapter or to ask someone to solder the wire ends to header pins. If your wire ends can already be plugged in, connect the red wire to the bottom rail (+) at column 14, the black wire to the bottom rail (−) at column 16, and the yellow wire to **9e**. Then add a **4.7 kΩ** resistor yourself (4 bands: yellow-violet-red; 5 bands: yellow-violet-black-brown) from **9d** to **4d**. Hole 4d is in the strip of the ESP32's 3V3 pin, so the resistor pulls the DATA wire up to 3.3 V. While you wait for an adapter or for help with soldering, do the Wokwi version (at the end of 4.3), so you can still continue with this module.

#### 4.3 Read the temperature

Plug in the USB, then briefly touch the adapter and the probe. If anything feels warm, unplug the USB right away: VCC and GND are probably swapped. Create a new sketch `module07_ds18b20`, paste this code, then click **Upload**:

```cpp
// Module 7 - Practice 4: the DS18B20 temperature sensor on the 1-Wire bus
// DS18B20 DATA pin to RX2 (GPIO 16, borrowed for now). A 4.7 kOhm pull-up resistor from DATA to 3.3 V
// (the adapter module usually has one already). The DS18B20 gets 3.3 V, NOT 5 V.
// Libraries: OneWire 2.3.8 and DallasTemperature 4.0.6. Install BOTH: DallasTemperature doesn't offer OneWire.

#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_ONE_WIRE = 16;  // RX2: 1-Wire bus (borrowed for now, see PIN-MAP.md)
const int MAX_SENSORS = 4;    // this sketch keeps track of at most 4 sensors

OneWire oneWire(PIN_ONE_WIRE);               // the 1-Wire "road"
DallasTemperature tempSensors(&oneWire);     // the DS18B20 "translator" that uses that road
DeviceAddress serialNumbers[MAX_SENSORS];    // where each sensor's serial number (8 bytes) is kept
int sensorCount = 0;

// Prints the 8-byte serial number, for example 28-FF-64-1E-0F-6A-D3-3C.
void printSerialNumber(DeviceAddress number) {
  for (int i = 0; i < 8; i++) {
    if (number[i] < 0x10) {
      Serial.print("0");
    }
    Serial.print(number[i], HEX);
    if (i < 7) {
      Serial.print("-");
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  tempSensors.begin();  // walks along the bus and counts the sensors that answer
  sensorCount = tempSensors.getDeviceCount();
  if (sensorCount > MAX_SENSORS) {
    sensorCount = MAX_SENSORS;
  }
  Serial.print("Found ");
  Serial.print(sensorCount);
  Serial.println(" DS18B20 sensor(s).");
  for (int i = 0; i < sensorCount; i++) {
    tempSensors.getAddress(serialNumbers[i], i);
    Serial.print("  Sensor ");
    Serial.print(i + 1);
    Serial.print(": serial number ");
    printSerialNumber(serialNumbers[i]);
    Serial.println();
  }
  if (sensorCount == 0) {
    Serial.println("Check the DATA wire (RX2), VCC (3.3 V), GND, and the 4.7 kOhm resistor, then press EN.");
  }
}

void loop() {
  if (sensorCount == 0) {  // no sensor yet: remind every 5 seconds, in case the message in setup() was missed
    Serial.println("No DS18B20 detected yet. Unplug the USB, check the wires, then plug it back in.");
    delay(5000);
    return;
  }
  tempSensors.requestTemperatures();  // call out to ALL the sensors at once: "measure now!" (up to 750 ms)
  for (int i = 0; i < sensorCount; i++) {
    float temperature = tempSensors.getTempC(serialNumbers[i]);  // ask them one by one, by serial number
    Serial.print("Sensor ");
    Serial.print(i + 1);
    Serial.print(": ");
    if (temperature == DEVICE_DISCONNECTED_C) {  // -127: the library doesn't trust this reading
      Serial.println("unreadable! Is a wire loose, or is the power cutting in and out?");
    } else if (temperature == 85.0) {            // 85: the default value of a sensor that has just powered up (library 4.0.6 usually replaces it with -127)
      Serial.println("85.00 C (suspicious: the sensor just powered up, or its power is too weak)");
    } else {
      Serial.print(temperature, 2);
      Serial.println(" C");
    }
  }
  delay(2000);
}
```

Open the Serial Monitor (**115200 baud**). The list of sensors and their serial numbers is printed only **once**, right when the board powers up; after that, only the temperatures appear, every 2 seconds. If you can't see the line `Found … DS18B20 sensor(s).` and the serial numbers, press the **EN** button on the ESP32 board to restart the program from the beginning.

**Expected output** on a real board, roughly like this (your serial number and temperatures will certainly be different):

```text
Found 1 DS18B20 sensor(s).
  Sensor 1: serial number 28-FF-64-1E-0F-6A-D3-3C
Sensor 1: 27.94 C
Sensor 1: 27.94 C
Sensor 1: 28.00 C
```

Do you get `Found 0 DS18B20 sensor(s).` (and every 5 seconds `No DS18B20 detected yet…`)? Unplug the USB, then check the DAT wire: it must be at **9e**, not 9f–9j. Other causes are in [🚨 Troubleshooting](#-troubleshooting), the DS18B20 section.

First copy your sensor's serial number onto paper or into Notepad (select the text in the Serial Monitor, then **Ctrl + C**). The file `notes-module07.md` is only created in Practice 8, and you'll use that number again for Node 2.

**In Wokwi:** use the Practice 4 [`diagram.json`](code/module07_ds18b20/diagram.json) and [`libraries.txt`](code/module07_ds18b20/libraries.txt). That diagram puts **two** DS18B20s on one DATA wire, plus a 4.7 kΩ pull-up resistor, so you can see two serial numbers at once. Click one of the sensors: a `DALLAS DS18B20 TEMPERATURE SENSOR` window appears with a **Temperature** slider. Move the slider, and a few seconds later the Serial Monitor prints that sensor's new temperature.

```text
Found 2 DS18B20 sensor(s).
  Sensor 1: serial number 28-3A-2B-1C-0D-0E-0F-13
  Sensor 2: serial number 28-7F-6E-5D-4C-3B-2A-8D
Sensor 1: 26.50 C
Sensor 2: 31.25 C
```

![Cropped screenshot of the Practice 4 Wokwi run, with markers. Top, the DALLAS DS18B20 TEMPERATURE SENSOR window that appears after the first sensor is clicked: the Temperature slider moved to 60.0°C (marker 1), with Device Address 28 3A 2B 1C 0D 0E 0F. Middle, the circuit: the ESP32 board with an orange wire from RX2 to the data pins of both DS18B20s (marker 3); a 4.7 kilohm pull-up resistor from that wire to the VCC symbol (marker 2); the VCC pins of both sensors to the VCC symbol and their GND pins to the triangle symbol. Bottom, the Serial Monitor: Found 2 DS18B20 sensor(s)., two serial number lines, 28-3A-2B-1C-0D-0E-0F-13 and 28-7F-6E-5D-4C-3B-2A-8D (marker 4), the first readings, Sensor 1: 26.50 C and Sensor 2: 31.25 C, then Sensor 1: 60.00 C (marker 5) and Sensor 2: 31.25 C](assets/wokwi-ds18b20.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

#### 4.4 Experiment (real board)

1. **Hold the steel tip of the probe in your hand.** The temperature rises slowly toward your hand's temperature (about 33–35 °C), then falls again after you let go. Notice that the number moves in small steps of about 0.06 °C: that's the 0.0625 °C step at 12-bit resolution.
2. **Dip the steel tip into a glass of water** on the tray. Only the steel tip and part of its cable may go into the water; the adapter and the breadboard stay dry. Wait about a minute until the number settles.
3. **Add a few ice cubes** to the glass, then watch the temperature drop. Don't use hot or boiling water: a cheap probe's cable isn't necessarily heat resistant.

**The −127 and 85 numbers in real life.** If you see `unreadable! …`, first check the DAT and GND connections (the terminal screws, hole 9e), then the sensor's power (the VCC wire to the bottom rail (+)). Library 4.0.6 also reports −127 for a sensor that has restarted because its power keeps cutting in and out. The message `85.00 C (suspicious: …)` rarely appears with this library; if it keeps appearing, it means the same thing: the power keeps cutting in and out. Don't try to provoke this message by pulling wires while the board is on; remember this week's building rule.

#### 4.5 Remove and store the DS18B20

Turn off the MB102 (if it's on), unplug the USB, then remove the adapter's three wires. Dry the probe with the cloth, then store it with its adapter for Node 2.

> ⬆️ **Done with Practice 4?** Go back to [Concept 6](#6-spi-and-the-microsd-card-more-wires-more-speed) (the ➡️ there will take you to Practice 5).

### Practice 5 — (Optional) A CSV log on a microSD card (35 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** or Wokwi, the microSD module, a 4–16 GB microSD card **that may be erased**, 6 **male–female** jumper wires (black, red, blue, green, gray, purple), a card reader for your laptop, and the MB102 (the regulated module needs 5 V from the top rail). No new libraries: **SD** and **SPI** already come with the esp32 package. Concepts used: 6.
>
> This practice is **optional**. If you don't have a microSD module, do only its Wokwi version, or go straight on to Concept 7.

#### 5.1 Prepare the card (on your laptop)

> [!WARNING]
> **Formatting a card erases everything on it.** Use an empty card or a card whose contents you've already moved elsewhere. Make sure the drive you're about to format really is the microSD card, not a flash drive or another hard drive.

1. Insert the card into your laptop's card reader (use the SD adapter if needed).
2. **Windows:** open **File Explorer**, right-click the card's drive → **Properties**. If the **File system** line says `FAT32`, the card is ready; skip step 3. If it says another format (for example `exFAT`), continue with step 3.
   **macOS:** open **Disk Utility** and select the card in the left sidebar. If its format is `MS-DOS (FAT32)`, the card is ready.
3. **Format it as FAT32.** Windows: right-click the card's drive → **Format…** → under **File system**, choose **FAT32** → **Start**. macOS: **Disk Utility** → select the card → **Erase** → **Format: MS-DOS (FAT)** → **Erase**. If Windows doesn't offer FAT32, your card is bigger than 32 GB; use a 4–16 GB card.
4. Eject the card safely (Windows: right-click the card's drive in **File Explorer** → **Eject**; macOS: the **⏏** button next to the card's name in **Finder**), then insert it into the microSD module's slot with **its gold contacts facing the module board** (the printed side facing up) until you hear a small "click". Some slots don't click; just push until the card won't go in any further.

#### 5.2 Connect the microSD module

Make sure the MB102 is off and the USB is unplugged. The DS18B20 was already removed in Practice 4. Place the microSD module on the table in front of the lower breadboard, to the right of the display.

**Before connecting the red wire, find out what kind of module you have.**

- Its power pin is labeled "VCC" or "5V", and its board has a small black chip labeled "AMS1117-3.3" (three legs on one side, one wide tab on the other): this is a **regulated** module. The red wire goes to the **top** rail (+) at column 22, the 5 V rail from the MB102 on the upper breadboard.
- Its power pin is labeled "3V3" or "3.3V", or its board has no regulator chip: this is a **3.3 V-only** module. The red wire goes to the **bottom** rail (+) at column 21.
- **Still unsure? Start with the bottom rail (3.3 V).** If your module turns out to be regulated, the worst that can happen is that the card isn't detected, and you just move the red wire to the top rail (with the MB102 off and the USB unplugged). The other way around, 5 V on a 3.3 V module can damage the card and the ESP32's pins.

Then connect all six wires according to the **labels on your module**:

| Wire (male–female) | From the module pin | To | Purpose |
| :--- | :--- | :--- | :--- |
| **Black** | **GND** | bottom rail **(−)** column 21 | GND |
| **Red** | **VCC** | regulated module: **top** rail **(+)** column 22; 3.3 V-only module: **bottom** rail **(+)** column 21 | the module's power (see the explanation above the table) |
| **Blue** | **MISO** (sometimes labeled **DO**) | 13e | the D19 strip: data from the card to the ESP32 |
| **Green** | **MOSI** (sometimes labeled **DI**) | 18e | the D23 strip: data from the ESP32 to the card |
| **Gray** | **SCK** (sometimes **CLK**) | 12e | the D18 strip: the clock |
| **Purple** | **CS** | 11e | the D5 strip: "pick me" |

The red wire to the top rail is long enough to go past the ESP32 board; tuck it in along the right side of the board. The module's wires may cross each other.

![Wiring map of the microSD module. Top, a large blue microSD module, a six-pin example, with a regulator, a voltage translator, and a microSD card; its six pins are on the right side, each connected by a colored line to its destination box: GND, black, to the bottom rail minus at column 21, shared GND; VCC, red, to the top rail plus at column 22, 5 volts from the MB102 for a regulated module, usually six pins, with a note that a 3.3 volt module without a regulator goes to the bottom rail plus at column 21; MISO, blue, to 13e, the D19 strip, data from the card to the ESP32; MOSI, green, to 18e, the D23 strip, data from the ESP32 to the card; SCK, gray, to 12e, the D18 strip, the SPI clock; CS, purple, to 11e, the D5 strip, pick me. Bottom, a close-up of the lower breadboard, columns 8 to 23, with the ESP32 pin names, D4 to D23, above columns 8 to 18; the OLED display wires and both bridge wires are drawn faded. Colored circles mark 11e CS, 12e SCK, 13e MISO, 18e MOSI, the bottom rail minus at column 21 for GND, and the bottom rail plus at column 21 for the VCC of a 3.3 volt module. A tips box: before connecting, turn off the MB102, then unplug the USB; when you're done, plug in the USB, turn on the MB102, then press EN on the ESP32 board, because the program looks for the card only once and a regulated module only comes alive with power from the MB102; microSD card 4 to 16 GB, FAT32 format. Bottom note: the module's wires may cross or run under the arches of the bridge wires](assets/microsd-wiring-map.png)

#### 5.3 Write your first log

1. Plug in the USB first, **then turn on the MB102** (the regulated module needs 5 V from the top rail).
2. Create a new sketch `module07_microsd_log`, paste this code, then click **Upload**:

   ```cpp
   // Module 7 - Practice 5 (optional): logging readings to a microSD card as a CSV file
   // microSD module on the SPI bus: SCK to D18, MISO to D19, MOSI to D23, CS to D5.
   // The light sensor (LDR) stays on VP, as in Module 6.
   // No libraries to install: SD and SPI already come with the esp32 package.

   #include <SPI.h>
   #include <SD.h>

   const int PIN_SD_CS = 5;    // D5: "pick me" for the microSD card (canonical pin map)
   const int PIN_LDR = 36;     // VP: LDR (canonical pin map)
   const char* FILE_NAME = "/log.csv";  // file name on the card, always starts with a slash
   const int SECONDS_PER_LOG = 5;       // one line every 5 seconds

   bool cardReady = false;

   // Prints the whole file to the Serial Monitor.
   void printFileContents() {
     File file = SD.open(FILE_NAME, FILE_READ);
     if (!file) {
       Serial.println("(the file doesn't exist yet)");
       return;
     }
     while (file.available()) {
       Serial.write(file.read());  // copy it character by character, exactly as it is
     }
     file.close();
   }

   // Adds one line at the end of the file. Returns true if it worked.
   bool appendLine(String line) {
     File file = SD.open(FILE_NAME, FILE_APPEND);  // APPEND = add to the end, the old content stays
     if (!file) {
       return false;
     }
     file.println(line);
     file.close();  // REQUIRED: only after closing is the content really saved on the card
     return true;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     if (!SD.begin(PIN_SD_CS)) {
       Serial.println("microSD card not detected! Check the card (FAT32), all six wires, and the module's power.");
       return;  // cardReady stays false, so loop() won't try to write
     }
     cardReady = true;
     Serial.print("Card detected, size ");
     Serial.print(SD.cardSize() / (1024 * 1024));
     Serial.println(" MB.");

     if (!SD.exists(FILE_NAME)) {
       appendLine("uptime_s,light");  // first CSV line = the column names
       Serial.println("New file created: log.csv");
     }
     Serial.println("---- current contents of log.csv ----");
     printFileContents();
     Serial.println("---- end of file ----");
   }

   void loop() {
     if (!cardReady) {  // card not detected yet: remind every 5 seconds, in case the message in setup() was missed
       Serial.println("Card not detected yet. Just turned on the MB102? Press EN. Still failing? Turn off the MB102, unplug the USB, then check the card and the wires.");
       delay(5000);
       return;
     }
     delay(SECONDS_PER_LOG * 1000);
     unsigned long seconds = millis() / 1000;        // seconds since the board was turned on
     int light = 4095 - analogRead(PIN_LDR);         // inverted as in Module 6: the brighter it is, the bigger the number
     String line = String(seconds) + "," + String(light);
     if (appendLine(line)) {
       Serial.print("written: ");
       Serial.println(line);
     } else {
       Serial.println("Write failed! Was the card removed?");
     }
   }
   ```

3. Open the Serial Monitor (**115200 baud**). Every 5 seconds, one new line is written to the card. The first lines, from `Card detected…` to `---- end of file ----`, are printed only once when the board powers up; if you can't see them, press **EN**. If you get `Card not detected yet…` every 5 seconds, see [🚨 Troubleshooting](#-troubleshooting), the microSD section.

**Expected output** the first time you run it with an 8 GB card, roughly like this (your size and light numbers will certainly be different):

```text
Card detected, size 7580 MB.
New file created: log.csv
---- current contents of log.csv ----
uptime_s,light
---- end of file ----
written: 6,3094
written: 11,3102
written: 16,1450
```

The line `16,1450` in this example was written while the LDR was covered by a hand. The card size is printed in MB as computers count it (1 MB = 1,048,576 bytes), so an "8 GB" card reads a little under 8,000 MB.

#### 5.4 Prove the log survives

1. Press the **EN** button on the ESP32 board. The program starts over, then prints the old contents of the file: all the earlier lines are still there. New lines are added below them, with an `uptime_s` that starts again from a small number, because the board has just restarted.
2. Turn off the MB102, unplug the USB, and wait a few seconds. Power up again in the usual order: plug in the USB first, turn on the MB102, **then press the EN button** on the ESP32 board. You need to press EN because the program looks for the card only once, right after the board powers up. When the USB has just been plugged in, the regulated microSD module doesn't get 5 V from the MB102 yet, so the Serial Monitor may print `microSD card not detected!` and then `Card not detected yet…`; that's normal. After you press EN, the Serial Monitor prints the old contents of the file: everything is still intact. That's what the card is for: the log isn't lost even when the power goes out. (With a 3.3 V-only module, the card is detected right away, and pressing EN doesn't hurt either.)

#### 5.5 Open the log on your laptop

1. **Turn off the MB102, then unplug the USB.** Don't pull the card out while the board is on; a card can be damaged if it's pulled out while it's being written.
2. Take the card out of the module, insert it into your laptop's card reader, then open the file `log.csv`:
   - **Notepad** (Windows) or **TextEdit** (macOS): its contents are exactly the same as what was printed in the Serial Monitor.
   - **Excel:** open a blank Excel workbook, choose **Data → From Text/CSV** (in Excel set to Indonesian: **Data → Dari Teks/CSV**), choose `log.csv`, make sure **Delimiter** (**Pemisah**) says **Comma** (**Koma**), then click **Load** (**Muat**). Don't open a CSV file by double-clicking it: Excel with Indonesian regional settings uses a semicolon as the separator, so everything can end up in a single column.
   - **Google Sheets:** **File → Import → Upload**, choose `log.csv`, choose **Comma** under **Separator type**, then click **Import data**.
   - The `uptime_s` and `light` columns appear as a table, and you can make a line chart of them.
3. Eject the card safely, then put it back into the module's slot.

**In Wokwi:** use the Practice 5 [`diagram.json`](code/module07_microsd_log/diagram.json). That diagram has a microSD card and a light sensor module. Wokwi's card is 8 MB, and its contents are recreated every time the simulation starts, so `New file created` always appears at the beginning. That's why step 5.4 can only be proven on a real board: clicking the small button in the picture of Wokwi's ESP32 board doesn't make it restart, while pressing **▶** again means a new, empty card.

```text
Card detected, size 8 MB.
New file created: log.csv
---- current contents of log.csv ----
uptime_s,light
---- end of file ----
written: 6,3094
written: 11,3094
written: 16,3094
```

![Cropped screenshot of the Practice 5 Wokwi run, with markers. The circuit: a light sensor module above the ESP32 board with its AO pin to VP (marker 2); a red microSD card at the bottom right of the board with its CS pin to D5, DI to D23, SCK to D18, DO to D19, VCC to the VCC symbol, and GND to the triangle symbol (marker 1: Wokwi's 8 MB microSD card; DI is MOSI, DO is MISO). Bottom, the Serial Monitor: Card detected, size 8 MB., New file created: log.csv (marker 3: Wokwi's card is always empty when the simulation starts), the file contents, a header line uptime_s,light, then written: 6,3094 and written: 11,3094 (marker 4: one new CSV line every 5 seconds)](assets/wokwi-microsd.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

**Leave the microSD module connected** if you want Node 1 v0.4.0 to log its readings (the ➕ section). If not, turn off the MB102, unplug the USB, then remove the module.

> ⬆️ **Done with Practice 5?** Go back to [Concept 7](#7-combining-many-devices-without-them-interfering-with-each-other) (the ➡️ there will take you to Practice 6).

### Practice 6 — A Node 1 status display of your own design (40 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** or Wokwi, the display circuit from Practice 1, graph paper (or plain paper), and a pencil. No new wires. Concepts used: 3 and 7.
>
> ⭐ **Required** — the first completion requirement: the OLED display shows all of Node 1's readings in a layout you designed yourself.

This is the first completion requirement: a display that shows **all of Node 1's readings** (temperature, humidity, light, soil, motion, and water level) in a layout **you designed yourself**. To make it easy, we design with **sample readings** first. The real sensor readings only come in the ➕ section; the sensors themselves have been connected since Module 6, so there are no wires to connect.

#### 6.1 Design it on paper first

Draw a rectangle of 128 × 64 squares on graph paper (one square = one pixel; on millimeter paper, that rectangle is 12.8 × 6.4 cm). Then decide:

1. **What matters most?** Show it biggest and at the top. If your display is two-color, the top 16 rows are yellow.
2. **How long is the longest number of each reading?** The temperature can be `-40.0` to `80.0` (the DHT22's limits), the humidity up to `100`, the light up to `4095`, the soil and the water level up to `100%`.
3. **How do you show a failed reading?** The Module 6 data contract marks it with `NAN` and `-1`; on the display, write `--` so it doesn't look like a real number.

As an example, the reference design in the following sketch puts the temperature and the humidity in big numbers in the top band, three readings with icons and percent bars in the middle, and a motion row that is **inverted** (white background) when someone is there.

![Reference design of the Node 1 status display on a grid of 128 by 64 pixels; the sizes and coordinates are taken from the Practice 6 sketch. Top band, y 0 to 15: temperature 28.5 and humidity 71 in size 2 numbers; the temperature starts at x 0, the humidity is right-aligned up to x 122, while degree C and percent are size 1. A divider line at y 17, drawFastHLine(0, 17, 128, …). Three size 1 rows at y 21, 32, and 43: the icon at x 0, the name at x 11, the number right-aligned up to x 82, and a percent bar starting at x 86, 42 pixels wide, whose fill is 38 times percent divided by 100 pixels, for Light 3094, Soil 45 percent, and Tank 80 percent. The motion row at y 54 with a person icon, inverted to a white background with the text Motion: DETECTED when there is motion. Bottom, a box for testing the worst cases before you use your design: the longest numbers, -40.0 degrees C and 100 percent in the top band, still leave a gap; the largest light value, 4095, still ends at x 82, before the bar; failed sensors, the temperature NAN becomes --.-, the humidity and water level -1 become -- with an empty bar; two-color display, the main numbers in the top 16 rows, which are yellow, and the rest blue; your own design, change at least two things, then repeat the test with the four Practice 6 samples](assets/node1-display-design.png)

#### 6.2 Upload the reference design

Create a new sketch `module07_node1_display`, paste this code, then click **Upload**:

```cpp
// Module 7 - Practice 6: designing the Node 1 status display
// The OLED display shows the readings of Node 1's five sensors. To design it, we use SAMPLE readings that change
// every 3 seconds, including the "worst cases": the longest possible numbers and sensors that fail to read.
// OLED display: SDA to D21, SCL to D22.
// Library: Adafruit SSD1306 2.5.17 (installed with it: Adafruit GFX Library 1.12.6 and Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;             // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;             // D22: I2C clock line (canonical pin map)
const byte DISPLAY_ADDRESS = 0x3C;  // the display's "home address" on the I2C bus

// The sensor data form, exactly the same as Node 1's (Module 6).
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

// Four sample readings. Their values are in the same order as the fields of the form above:
// temperature, humidity, light, soil, motion, water_level.
SensorReading samples[4] = {
  {28.5, 71, 3094, 45, false, 80},     // 1. a normal day
  {26.0, 78, 157, 44, true, 79},       // 2. night, someone walks by
  {-40.0, 100, 4095, 100, true, 100},  // 3. longest case: every number as long as possible
  {NAN, -1, 0, 0, false, -1},          // 4. the DHT22 and the HC-SR04 fail to read
};
const char* sampleNames[4] = {"normal day", "night, someone walks by", "longest case", "sensors failed"};
int sampleIndex = 0;

// ---------- Module 7: OLED display ----------
Adafruit_SSD1306 display(128, 64, &Wire, -1);  // width 128, height 64, on the I2C bus, no reset pin
bool displayFound = false;                     // true if the display answers at address 0x3C

// 8 x 8 pixel icons: 1 = pixel on, 0 = pixel off.
const unsigned char ICON_SUN[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char ICON_PLANT[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char ICON_TANK[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char ICON_PERSON[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

// Looks for the display on the I2C bus, then turns it on. Without a display, the program keeps running.
void setupDisplay() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.beginTransmission(DISPLAY_ADDRESS);
  displayFound = Wire.endTransmission() == 0;  // did anything answer at 0x3C?
  if (!displayFound) {
    Serial.println("OLED display not found at 0x3C. Node 1 keeps running without a display.");
    return;
  }
  display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS);
  display.cp437(true);  // the correct CP437 character table, so that code 248 = the degree sign
  display.setTextColor(SSD1306_WHITE);
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Node 1 Home");
  display.println("waiting for data...");
  display.display();
}

// Prints right-aligned text: its last character ends just before x = right.
void printRightAligned(String text, int right, int y, int size) {
  display.setTextSize(size);
  display.setCursor(right - text.length() * 6 * size, y);  // one character = 6 pixels x size
  display.print(text);
}

// Percent bar: a frame "width" pixels wide, filled as far as the percent. A percent below 0 = empty.
void drawBar(int x, int y, int width, int percent) {
  display.drawRect(x, y, width, 8, SSD1306_WHITE);
  if (percent > 0) {
    display.fillRect(x + 2, y + 2, (width - 4) * percent / 100, 4, SSD1306_WHITE);
  }
}

// One display row: icon, name, right-aligned number, then the percent bar.
// The * in "const unsigned char* icon" means this function accepts any icon you pass to it
// (like const char* for text in Module 3). Just leave it as it is.
void barRow(int y, const unsigned char* icon, String name, String number, int percent) {
  display.drawBitmap(0, y, icon, 8, 8, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(11, y);
  display.print(name);
  printRightAligned(number, 82, y, 1);
  drawBar(86, y, 42, percent);
}

void showOnDisplay(SensorReading b) {
  if (!displayFound) {
    return;
  }
  display.clearDisplay();

  // Top row: temperature on the left and humidity on the right. Big numbers, small units.
  String temperatureText = "--.-";
  if (!isnan(b.temperature)) {
    temperatureText = String(b.temperature, 1);
  }
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(temperatureText);
  display.setTextSize(1);
  display.write(248);  // degree sign
  display.print("C");

  String humidityText = "--";
  if (b.humidity >= 0) {
    humidityText = String(b.humidity);
  }
  printRightAligned(humidityText, 122, 0, 2);
  display.setTextSize(1);
  display.setCursor(122, 0);
  display.print("%");

  display.drawFastHLine(0, 17, 128, SSD1306_WHITE);  // divider line

  // Three rows with percent bars. Light (0-4095) is first turned into 0-100 for its bar.
  barRow(21, ICON_SUN, "Light", String(b.light), b.light * 100 / 4095);
  barRow(32, ICON_PLANT, "Soil", String(b.soil) + "%", b.soil);
  String waterText = "--";
  if (b.water_level >= 0) {
    waterText = String(b.water_level) + "%";
  }
  barRow(43, ICON_TANK, "Tank", waterText, b.water_level);

  // Motion row: inverted (white background) when there is motion, so it catches the eye at once.
  if (b.motion) {
    display.fillRect(0, 53, 128, 10, SSD1306_WHITE);
    display.drawBitmap(0, 54, ICON_PERSON, 8, 8, SSD1306_BLACK);
    display.setTextColor(SSD1306_BLACK);
    display.setCursor(11, 54);
    display.print("Motion: DETECTED");
    display.setTextColor(SSD1306_WHITE);
  } else {
    display.drawBitmap(0, 54, ICON_PERSON, 8, 8, SSD1306_WHITE);
    display.setCursor(11, 54);
    display.print("Motion: none");
  }

  display.display();
}
// ---------- End of the display part. Everything from "8 x 8 pixel icons" down to here moves to Node 1 later. ----------

// ---------- Practice 6 test stage: setup() and loop() below do NOT move. ----------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  setupDisplay();
  delay(1000);
}

void loop() {
  Serial.print("Sample ");
  Serial.print(sampleIndex + 1);
  Serial.print(": ");
  Serial.println(sampleNames[sampleIndex]);
  showOnDisplay(samples[sampleIndex]);

  sampleIndex++;
  if (sampleIndex > 3) {
    sampleIndex = 0;
  }
  delay(3000);
}
```

The part from the line `// 8 x 8 pixel icons: 1 = pixel on, 0 = pixel off.` to the closing brace of the `showOnDisplay()` function (just above the comment `// ---------- End of the display part. … ----------`) moves to Node 1 later, in the ➕ section. The `setup()` and `loop()` below it **don't** move: they're only a "test stage" that shows the four sample readings in turn, every 3 seconds, and prints the sample's name in the Serial Monitor:

| Sample | What it holds | What it tests |
| :---: | :--- | :--- |
| 1 | normal day | the normal view |
| 2 | night, someone walks by | low light and the inverted motion row |
| 3 | longest case | `-40.0`, `100`, `4095`, `100%`: does everything fit? |
| 4 | sensors failed | the DHT22 and the HC-SR04 fail: `--.-`, `--`, and an empty bar |

![Screenshot of the Practice 6 Wokwi run: the OLED display for all four sample readings, arranged two by two. Sample 1, normal day: 28.5 degrees C and 71 percent, big, at the top, then Light 3094, Soil 45 percent, and Tank 80 percent, each with an icon and a percent bar, and Motion: none. Sample 2, night, someone walks by: 26.0 degrees C and 78 percent, Light 157 with an almost empty bar, Soil 44 percent, Tank 79 percent, and an inverted Motion: DETECTED row on a white background. Sample 3, longest case: -40.0 degrees C and 100 percent, Light 4095, Soil 100 percent, Tank 100 percent, and Motion: DETECTED; everything fits. Sample 4, sensors failed: --.- degrees C and -- percent, Light 0, Soil 0 percent, Tank -- with an empty bar, and Motion: none](assets/wokwi-node1-display.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

**In Wokwi:** use the Practice 6 [`diagram.json`](code/module07_node1_display/diagram.json) and [`libraries.txt`](code/module07_node1_display/libraries.txt).

#### 6.3 Make the design your own

Change the sketch until it matches your paper design. Make at least **two changes**, for example:

- move the humidity into the middle rows and give it a drop icon. First copy the `ICON_DROP` array from the Practice 2 sketch and paste it next to the other icons, below the line `// 8 x 8 pixel icons: …`; without it, **Verify** fails with the message `'ICON_DROP' was not declared in this scope`. Because the middle rows now hold four readings, each 8 pixels tall, shift their y values so they don't overlap;
- replace the percent bars with big numbers, or the other way around;
- show the light as the words `bright`/`dim`/`dark`, with thresholds of your own. A complete example: inside `showOnDisplay()`, replace the line `barRow(21, ICON_SUN, "Light", String(b.light), b.light * 100 / 4095);` with

  ```cpp
  String lightText = "bright";
  if (b.light < 1000) {
    lightText = "dark";
  } else if (b.light < 2500) {
    lightText = "dim";
  }
  barRow(21, ICON_SUN, "Light", lightText, b.light * 100 / 4095);
  ```

  The row name can stay `Light`: the longest word, `bright` (6 letters, right-aligned to x = 82), starts at x = 46, five pixels after `Light` ends at x = 41, so the two don't touch. A longer row name, such as `Brightness`, would run into it. That's what testing the worst case is for. The number 1000 is written directly (instead of using a new constant name) so it doesn't clash with Node 1's `DARK_THRESHOLD` when you move the code later;
- change the text of the motion row, or replace its icon with your own design.

Put all your additions (icons, helper functions) between the line `// 8 x 8 pixel icons: …` and the end of the `showOnDisplay()` function, so they move to Node 1 with the rest in the ➕ section.

Every time you finish a change, click **Upload** and wait for all four samples to go by. **Your design passes** if, in all four samples, every reading is clearly readable, no text overlaps or is cut off at the edge of the display, and failed readings show up as `--`, not as strange numbers. Save the final sketch; its contents will move to Node 1 in the ➕ section.

> ⬆️ **Done with Practice 6?** Go back to [Concept 8](#8-reading-schematics-the-basic-symbols) and read through Concept 9 (the ➡️ there will take you to Practice 7).

### Practice 7 — Reading schematics and redrawing Node 1 (45 minutes)

> 🖥️ **Tools and parts:** paper (graph paper is nicer) and a pencil — or the [diagrams.net](https://app.diagrams.net) site on your laptop — the relay module from Module 5, which **stays connected** on the workbench, and a phone flashlight for reading the tiny print (a magnifying glass, if you have one). Turn off the MB102 and unplug the USB while you look at the module. Concepts used: 8 and 9.
>
> ⭐ **Required** — the second completion requirement: you can read the relay module's schematic from its documentation and redraw Node 1 as a schematic.

This is the second completion requirement: reading a module's schematic from its documentation, then using the same symbols to draw your own circuit.

#### 7.1 Read the relay module's schematic

Open the relay module schematic in [Concept 9](#9-reading-a-modules-schematic-taking-apart-the-relay-module) again, then **cover the numbered explanations at the bottom of the picture** (scroll so that only the schematic is visible, or cover them with a sheet of paper). What you're practicing here is tracing lines, not copying explanations. Answer these six questions **in your own words** while pointing at the lines with the tip of your pencil, on paper or in `notes-module07.md` (Practice 8), and only then open the answer key:

1. Through which parts does the current flow from VCC to the IN pin?
2. Why is this module active LOW?
3. Which part separates the ESP32 side from the relay coil side, and how?
4. What could happen to transistor Q1 if diode D1 weren't there?
5. Suppose the JD-VCC jumper is removed and the JD-VCC pin gets no power. What do you see when IN gets `LOW`?
6. Q1's emitter has no line to the GND pin of J1. Are they connected? How do you know?

<details>
<summary><b>Answer key</b></summary>

1. Through **R1**, the **indicator LED**, and the **LED inside optocoupler U1**, in that order.
2. Current only flows if the IN pin is pulled down to 0 V. When IN is `HIGH`, the voltage difference is too small to light both LEDs, so the relay stays off.
3. **Optocoupler U1.** The LED inside it shines on the phototransistor next to it, so the command crosses over through light, with no direct wire from the IN pin to the coil side. (As long as the JD-VCC jumper is in place, both sides still share VCC and GND; full separation only happens if the jumper is removed and the coil side gets its own power supply.)
4. When the coil is switched off, it kicks back a brief high voltage. Without D1, that kick hits Q1 and can eventually damage it.
5. The indicator LED lights up, because the input side still has power, but the relay does **not** "click", because its coil gets no power. This is the same symptom discussed in Module 5's 🚨 Troubleshooting.
6. **Yes.** Both end at a GND symbol, and all GND symbols are connected to the same GND (Concept 8, rule 3).

</details>

#### 7.2 Match it with your real module

Look at the relay module on your workbench from above. The print on its parts is very small, so use a phone flashlight. Look for these parts and tick off the ones you find:

- **Optocoupler:** a small black chip with four legs, one for each channel. Its print often contains the number "817" (for example "PC817" or "EL817").
- **Transistor:** a very small black part with three legs near the relay. On many modules, its code is "J3Y", the short code of the S8050 transistor.
- **Diode:** a small part with a stripe at one end, located near the legs of the relay coil.
- **Resistor:** a tiny block printed with three digits, for example "102" (meaning 10 followed by two zeros, which is 1,000 Ω = 1 kΩ).
- The **indicator LED** and the **JD-VCC jumper**: you've known them since Module 5.

Not every code will match the examples above; modules from different factories use different parts. What matters is that you can point and say "this is the optocoupler, this is the transistor, this is the diode", and match them with the symbols in the schematic.

#### 7.3 Redraw Node 1 as a schematic

Now it's your turn to make a schematic. You don't need to draw everything at once; follow this order:

1. **The ESP32 box in the middle.** Draw a large rectangle, then write the names of the pins Node 1 uses along its edges: the sensor and display pins on one side, the actuator pins on the other. The list is in `PIN-MAP.md`.
2. **Power symbols.** Draw a `3V3` symbol and a `GND` symbol near the ESP32. For the loads, draw a `5V` symbol with the note "from the MB102".
3. **Simple parts with their symbols.** Draw the status LED + 220 Ω resistor on D4; the D13 button to GND; the LDR + 10 kΩ resistor + 100 nF capacitor on VP; the 4.7 kΩ + 10 kΩ divider on D35 (HC-SR04 ECHO); the MOSFET with a 220 Ω resistor from D25 to its gate and a 10 kΩ resistor from D25 to GND, the 1N4007 diode, and the pump; the buzzer + 220 Ω resistor on D27; the 100 µF electrolytic capacitor on the servo's power pins.
4. **Modules as boxes with labeled pins.** The DHT22, the soil sensor, the PIR, the HC-SR04, the relay module, the servo, and the OLED display can simply be drawn as boxes with their pin names, for example an "OLED" box with the pins GND, VCC, SCL, SDA.
5. **Use name labels for far-apart connections**, such as `SDA`, `SCL`, and `5V`, so your drawing doesn't fill up with crossing lines (Concept 8, rule 5).
6. **Check once more.** Make sure every part has a path to power and to GND, and that every wire on your workbench is in the drawing.

When you're done, compare it with the reference schematics below. Your drawing may look different, as long as the connections are the same. If you used the JD-VCC fix from Module 5's 🚨 Troubleshooting, draw the relay module's VCC pin to `3V3` and its JD-VCC pin to `5V` (with the jumper removed), to match your build.

![Reference schematic of Node 1, the sensor and display part. In the middle, the ESP32 DevKit V1 box with a 3V3 symbol above it and GND below it; its pins are arranged to keep things tidy, not in the order on the board. Left: the LDR voltage divider, from 3V3 through R1 10 kilohms to the midpoint that goes into VP, then the LDR to GND, with C1 100 nanofarads from VP to GND; the capacitive soil sensor with AOUT to VN and 3V3 power; the PIR HC-SR501 with OUT to D34 and 5V power, with the note that its OUT output is only 3.3 volts; the DHT22 with out to D14 and 3V3 power. Right: the SSD1306 OLED display at address 0x3C with SCL to D22 and SDA to D21, 3V3 power; the HC-SR04 with Trig from D15 and Echo through R2 4.7 kilohms to D35, plus R3 10 kilohms from D35 to GND, 5V power; the optional microSD module drawn dashed, with CS on D5, SCK on D18, MOSI on D23, and MISO on D19, 5V power, with the note that a 3.3 volt-only module goes to 3V3. Bottom, notes: 3V3 from the ESP32's 3V3 pin on the bottom rail, 5V from the MB102's top rail, the ESP32 from the laptop's USB, all GNDs joined; dashed means optional (Practice 5); the SCL and SDA labels are just wire names; the status LED is on the actuator schematic](assets/node1-schematic-sensors.png)

![Reference schematic of Node 1, the actuator part. In the middle, the ESP32 box with GND below it. Top left: the two-channel active-LOW relay module as a box with VCC to 5V, IN1 from D32 for the lamp, IN2 from D33 for the fan, and GND; 5V goes into COM2, NO2 goes to the fan, then to GND; note: the contacts of relay 1 aren't used yet. Bottom left: the pump from 5V to the D pin of MOSFET Q1 IRLZ44N, diode D2 1N4007 parallel to the pump with its cathode bar on the 5V side, the gate from D25 through R5 220 ohms, and R6 10 kilohms from the point between D25 and R5 to GND, the same as the Module 5 build; the S pin to GND. Right: the SG90 servo with its orange signal wire from D26, its red plus wire to 5V, its brown minus wire to GND, and electrolytic capacitor C2 100 microfarads between 5V and GND; the passive buzzer from D27 to its plus pin, its minus pin through R7 220 ohms to GND; the button from D13 to GND with the note INPUT_PULLUP; the status LED from D4 through R4 220 ohms and the LED to GND. Bottom, notes: 5V from the MB102's top rail for all the loads, never from the ESP32; all GNDs joined](assets/node1-schematic-actuators.png)

**Want to draw on your laptop?** Open **https://app.diagrams.net**. When it asks where to save, choose **Device** (this computer), then create a blank diagram. Type keywords such as **resistor**, **led**, or **ground** into the shape search box in the left panel. When you're done, save the picture with **File → Export as → PNG…**.

#### 7.4 Save the result

Photograph your paper drawing from above in bright light, or export your diagrams.net drawing. Name it **`schematic-node1.jpg`** (or `.png`), then copy it into the `module-07` folder. This photo is committed in Practice 8.

To move the photo from your phone to your laptop, use whatever method you know best: the phone's USB cable, Google Drive, or WhatsApp Web (send it to yourself **as a document**, so the picture isn't shrunk). Make sure the file name is exactly `schematic-node1.jpg`, all lowercase.

### Practice 8 — Save to GitHub (15 minutes)

> 🖥️ **Tools used:** **Arduino IDE**, **VS Code** (from Module 4), and **GitHub Desktop** (from Module 3). Concepts used: no new concepts.

1. **Save the sketches to the repository.** Have you been saving straight into the `module-07` folder from the start (the **Tip** box at the beginning of the Practice section)? Skip this step. If not, open the sketches one by one (**File → Sketchbook**), then choose **File → Save As…** and save them to **Documents → GitHub → learn-iot → module-07**. The one that must be there: `module07_node1_display` (your design from Practice 6).
2. **Write this week's notes.** In VS Code, open the `learn-iot` folder (**File → Open Folder…**). Click the `module-07` folder in the Explorer panel, then click the **New File…** icon and name the file `notes-module07.md`. Fill it in with what you found, for example:

   ```markdown
   # Module 7 Notes

   | Device | Bus | Address or serial number |
   | --- | --- | --- |
   | OLED display | I2C | 0x3C |
   | BME280 | I2C | 0x76, chip ID 0x60 |
   | DS18B20 | 1-Wire | 28-FF-64-1E-0F-6A-D3-3C |

   ## Practice 7.1 answers
   1. ...
   ```

   Save with **Ctrl + S**. You'll use these addresses and serial numbers again when you build Node 2.
3. Make sure `schematic-node1.jpg` from Practice 7 is already in the `module-07` folder. In GitHub Desktop, **Repository → Show in Explorer** opens the right repository folder (macOS: **Show in Finder**).
4. In GitHub Desktop, make sure the **Current repository** box says **learn-iot**. The **Changes** tab lists the new files in `module-07`. macOS users: untick `.DS_Store` if it shows up.
5. Fill in **Summary** with `Module 7: OLED display, I2C/1-Wire/SPI buses, Node 1 schematic`, click **Commit … to main**, then **Push origin**.
6. Click **Repository → View on GitHub** and open the `module-07` folder: your sketches, notes, and schematic picture are there.

No GitHub Desktop? Use the alternative route in the final note of [Module 4 Practice 10](../../phase-0-foundations/module-04-javascript-nodejs/README.md#practice-10--save-to-github-the-phase-0-checkpoint-15-minutes).

> ➡️ **After Practice 8:** do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home) — that's where your display design goes into Node 1 — then finish with the [📝 Quiz](#-5-question-quiz) and the [✅ Completion checklist](#-module-7-completion-checklist). Open the 🚨 and 🔬 sections in between only when you need them.

---

## 🚨 Troubleshooting

Start with the **I2C scanner** (Practice 1.3) for every display and BME280 problem: if the scanner doesn't find the device, the problem is almost certainly in the wiring, the power, or the module itself, not in the code. Click a problem's title to open its explanation.

> [!IMPORTANT]
> Every time you check or move a wire: **turn off the MB102, then unplug the USB**. When you're done, plug in the USB first, then turn on the MB102.

<details>
<summary><b><code>Build failed!</code> / <code>Compilation error</code> — this week's error messages</b></summary>

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `fatal error: Adafruit_SSD1306.h: No such file or directory` | The display library isn't installed. | Practice 1.1. In Wokwi, fill `libraries.txt` with the three lines from the practice's folder. |
| `fatal error: Adafruit_GFX.h: No such file or directory` | The companion **Adafruit GFX Library** isn't installed (usually because **INSTALL WITHOUT DEPENDENCIES** was clicked). | Install **Adafruit GFX Library** 1.12.6 and **Adafruit BusIO** 1.17.4 in the Library Manager. |
| `fatal error: Adafruit_I2CDevice.h: No such file or directory` | The companion **Adafruit BusIO** isn't installed. | Install **Adafruit BusIO** 1.17.4. |
| `fatal error: Adafruit_BME280.h: No such file or directory` | The BME280 library isn't installed. | Practice 3.1. |
| `fatal error: OneWire.h: No such file or directory` | **OneWire** isn't installed. DallasTemperature 4.0.6 doesn't offer it. | Practice 4.1, step 1: install **OneWire** 2.3.8. |
| `fatal error: DallasTemperature.h: No such file or directory` | The DallasTemperature library isn't installed. | Practice 4.1, step 2. |
| `'display' was not declared in this scope` | The line `Adafruit_SSD1306 display(...)` is missing or in the wrong place, or its name is misspelled. | Compare the top of your sketch with the code in the module. |
| `'ICON_DROP' was not declared in this scope` | An icon is used before its array has been pasted into the sketch. | Copy the `ICON_DROP` array from the Practice 2 sketch to below the line `// 8 x 8 pixel icons: …` (Practice 6.3). |
| `redefinition of 'void setup()'` or `redefinition of 'const int …'` | A name is written twice, usually because `setup()`/`loop()` or a constant from the Practice 6 sketch was copied into Node 1 too. | Delete the duplicate. From the Practice 6 sketch, only the icons, the helper functions, and `showOnDisplay()` move over (➕ Step 4). |

</details>

<details>
<summary><b>The display stays dark</b></summary>

1. **Run the I2C scanner.** If `0x3C` doesn't show up, check the wiring (see the problem "I2C scanner" below).
2. **The scanner finds `0x3D`**: replace `0x3C` with `0x3D` in the `const byte DISPLAY_ADDRESS` line of your sketch.
3. **The scanner finds `0x3C`, but the display stays dark**: make sure the sketch you uploaded calls `display.begin(...)` and `display.display()`. The scanner sketch really doesn't turn the display on.
4. **VCC and GND swapped**: on a display with the order VCC-GND-SCL-SDA, the wires to the rails must follow the **labels** on the display. This mistake can damage the display within seconds. Turn off the MB102 (if it's on), then **immediately** unplug the USB, fix it, and try again. If the scanner now finds `0x3C`, but the display stays dark with the correct sketch, the display may already be damaged.
5. **The protective plastic film** on the display's glass doesn't block the picture; you can peel it off or leave it on.

</details>

<details>
<summary><b>The display lights up, but the picture is shifted, has random lines, or is cut off</b></summary>

- **Most of the display is full of random pixels (like snow on a TV) and only one band changes, or the picture is shifted by about two pixels with random lines at the right edge:** your display most likely uses the **SH1106** chip (common on 1.3-inch displays), not the SSD1306. This week's library is for the SSD1306 only. Swap it for a 0.96-inch SSD1306 display, or look for a library made for the SH1106 after you finish this module.
- **Your display turns out to be 0.91 inch** (128 × 32 pixels, long and narrow): change `Adafruit_SSD1306 display(128, 64, &Wire, -1);` to `Adafruit_SSD1306 display(128, 32, &Wire, -1);` and redesign the layout for four lines of size 1 text.
- **Text cut off on the right or wrapping to the next line:** your text is too long for its size. See the text size table in Concept 3.
- **The degree sign shows up as two strange characters:** you typed `°` directly in `print()`. Use `display.write(248)` and make sure `display.cp437(true)` is called in `setup()`.

</details>

<details>
<summary><b>I2C scanner: <code>Nobody answered</code>, or random addresses keep appearing</b></summary>

- **SDA and SCL swapped** (the most common): the SCL wire must be in strip 19 and SDA in strip 20, both from the display and from the BME280.
- **Bridge wires in the wrong holes:** blue must go 14d → 20f, yellow 17e → 19f. Holes 14a–14e are in the same strip as the D21 pin, and 17a–17e in the same strip as D22; rows f–j of columns 14 and 17 are **not** connected to those pins.
- **Power:** VCC to the bottom rail (+), GND to the bottom rail (−). The bottom rail gets 3.3 V through the orange wire at 4e from Module 5; if the Module 6 sensors on the same rail work, that rail is healthy.
- **Random addresses keep appearing** (for example `0x08`, `0x51`, `0x7E`, changing every time): a connection is loose. Press every end of the bus wires in firmly.
- **Wires too long**: try to keep all the bus wires under about 50 cm in total.

</details>

<details>
<summary><b>BME280: <code>No device at 0x76 or 0x77</code>, a chip ID that isn't <code>0x60</code>, or strange numbers</b></summary>

- **No device:** check the four wires as in the scanner problem above. On a **six-pin** module, don't connect the **CSB** pin to GND: a `LOW` CSB switches the BME280 to SPI mode, so it doesn't answer on I2C. Leave CSB and SDO unconnected.
- **`Its chip ID is 0x58`** (or `0x56`, `0x57`): that's a BMP280, with no humidity sensor. See Practice 3.4.
- **`Its chip ID is 0xFF`**, or another number that isn't in the Concept 4 table: the communication is disturbed. Check the wires, then press **EN**.
- **The BME280's temperature is 1–3 °C higher than the DHT22's:** the module is probably being warmed by the ESP32 board or by your hand, or slightly by its own measuring (the Adafruit library makes the sensor measure continuously). Move the module a few centimeters away and wait a few minutes. A difference of up to about 1 °C is still normal.
- **The pressure is much lower than in the weather forecast:** that's normal in the highlands (Practice 3.5).

</details>

<details>
<summary><b>DS18B20: <code>Found 0 DS18B20 sensor(s)</code>, <code>unreadable!</code>, or <code>85.00 C</code></b></summary>

- **`Found 0 DS18B20 sensor(s).`** The most common cause: the DAT wire went into **9f–9j**, not **9e** (see the warning in Practice 4.2). Also check the probe wires in the adapter's screw terminal: tighten the screws and make sure the colors match the labels. For a probe without an adapter, make sure the 4.7 kΩ resistor is connected from 9d to 4d. As long as no sensor is detected, the sketch reminds you every 5 seconds with `No DS18B20 detected yet…`. Fix the wiring with the USB unplugged (see the box at the start of this section), plug it back in, then press **EN** if you missed the `Found … DS18B20 sensor(s).` line.
- **`unreadable! …`** (the value −127): the sensor was detected at power-up, then disappeared or restarted. A connection is loose (usually in the screw terminal), or the sensor's power keeps cutting in and out. Check the probe's DAT, GND, and VCC wires, and make sure VCC comes from the bottom rail (+).
- **`85.00 C (suspicious: …)`** over and over (rare with library 4.0.6, more common with clone sensors): the sensor keeps restarting because its power keeps cutting in and out. Check the same things.
- **The probe or the adapter feels warm:** VCC and GND are probably reversed. Turn off the MB102 (if it's on), then **immediately** unplug the USB, and check the wire colors against the labels on the adapter again.
- **The number jumps back and forth by 0.06 °C:** that's normal; the sensor's smallest step really is 0.0625 °C.

</details>

<details>
<summary><b>microSD: <code>microSD card not detected!</code>, <code>Card not detected yet…</code>, or <code>Write failed!</code></b></summary>

- **The MB102 wasn't on yet when the program looked for the card:** the regulated module needs 5 V from the top rail, and the program looks for the card only once, right after the board powers up. Because the power-up order is always the USB first, then the MB102, **press the EN button after the MB102 is on** so the program looks for the card again.
- **A regulated module gets 3.3 V** (VCC on the bottom rail): its regulator needs an input higher than its output, so the card gets too low a voltage and isn't detected. Move VCC to the top rail (+) at column 22 (with the MB102 off and the USB unplugged).
- **MISO and MOSI swapped:** on a module labeled "DI" and "DO", DO (data out of the card) is MISO, going to 13e, and DI (data into the card) is MOSI, going to 18e.
- **The card isn't formatted as FAT32**, or it's bigger than 32 GB: see Practice 5.1.
- **The card isn't pushed in all the way to the "click"**, or its contacts are dirty: turn off the MB102 and unplug the USB first, then take the card out. Clean its gold contacts with a dry cloth, insert it again until it clicks, then power up (USB first, then the MB102, then press **EN**).
- **`Write failed! Was the card removed?`** while it's running: the card was pulled out, or its connection is shaky. Turn off the MB102, unplug the USB, fix it, then power up again (USB first, then the MB102, then press **EN**).
- **A file name without a slash** (for example `"log.csv"`): on the ESP32, a file name must start with `/`.

</details>

<details>
<summary><b>Node 1 v0.4.0: no display, the card isn't detected, or Node 1 feels slower</b></summary>

- **The Serial Monitor prints `OLED display not found at 0x3C. Node 1 keeps running without a display.`** Node 1 looks for the display only once, when it powers up. Turn off the MB102 and unplug the USB, fix the display wiring, then power up again (USB first, then the MB102); Node 1 looks for its display again when it starts. If you missed the first lines in the Serial Monitor, press **EN**.
- **`microSD card not detected: CSV logging is off.`** This is normal if you didn't connect a microSD module. If the module is connected, this message appears every time Node 1 is powered up in the order "USB first, then the MB102", because at that moment the regulated module has no power yet. Press **EN** after the MB102 is on. If the message still appears, see the microSD problem above.
- **The first lines (firmware version, display, card) don't show up in the Serial Monitor:** they're all printed once when Node 1 powers up, often before the Serial Monitor has connected. Press **EN** to print them again.
- **Node 1 takes about a second longer to start** if no microSD module is connected: the program tries to reach the card a few times before it gives up. That's normal.
- **The D13 button feels a little less responsive:** every 2 seconds, Node 1 reads all the sensors and updates the display; during that time, the button isn't checked. Press the button a little longer. Module 8 removes this pause with `millis()`.

</details>

<details>
<summary><b>Wokwi only</b></summary>

- **A `Build Servers Busy` window appears**: Wokwi's free build servers are busy, and your program is still waiting in line. Wait a few minutes. If the simulation still doesn't start, click **CLOSE**, stop the simulation (the **■** button), and try again later. Sketches with many libraries, like Node 1, get stuck in this queue most often; the smaller practice sketches usually go through smoothly.
- **`Failed to fetch` after a long wait**: the connection to the Wokwi server was lost. Click **▶** again.
- **Part of the circuit is cut off outside the panel**: click an empty spot in the simulation panel, then press **F** so the whole circuit fits. If the cursor is still in the code editor, the letter f gets typed into your sketch instead; delete it again.
- **The SDA and SCL wires in the Wokwi diagram cross**: that's on purpose (Practice 1.2 explains why).
- **Practice 3 in Wokwi shows a BMP180, not a BME280**: Wokwi doesn't have a BME280 yet. The message `Its chip ID is 0x55` actually shows that the chip ID check works.
- **The Wokwi display has only one color**: Wokwi doesn't imitate the yellow-blue two-color display.
- **The file on Wokwi's microSD card is gone after the simulation stops**: Wokwi's card really is recreated every time the simulation starts. Proof that the log survives a restart (Practice 5.4) can only be seen on a real board.
- **The combined diagrams use the ▽ and VCC symbols**: triangle = GND, VCC = 3.3 V from the board, the same as in Module 6.

</details>

## 🔬 Technical Deep Dive (optional)

This section is for the curious. Nothing here is required, and the next modules don't depend on it.

<details>
<summary><b>UART: the oldest "bus", which you've been using since Module 2</b></summary>

Every time you open the Serial Monitor, the ESP32 talks over **UART** (*universal asynchronous receiver-transmitter*). This way of communicating dates back to the age of long-distance typewriters (*teletypes*), decades before I2C and SPI existed.

- **No clock wire.** UART has only two data wires: **TX** (transmit) and **RX** (receive). Because there's no clock, both sides must **agree in advance** on the speed, the *baud rate*. That's why the number `115200` must be the same in `Serial.begin(115200)` and in the corner of the Serial Monitor. If they differ, what comes out is random characters.
- **Every byte is wrapped.** One byte is sent as 10 bits: 1 start bit, 8 data bits, and 1 stop bit. So 115,200 bits per second means about 11,520 characters per second.
- **The wires cross.** One device's TX goes into the other device's RX, and the other way around. On the ESP32 board, TX0 and RX0 (GPIO 1 and 3) are connected to the USB chip (CP2102 or CH340), which passes the data on to the laptop. That's why those two pins are avoided in `PIN-MAP.md`.
- **Only two at a time.** UART connects only two devices, so it isn't a real bus. In Module 15, you'll use **RS-485**: UART sent over a special pair of wires, so it can reach hundreds of meters and be shared by many devices, taking turns.

The ESP32 has three UARTs. UART2 comes out on the RX2 and TX2 pins (GPIO 16 and 17), which are reserved for RS-485 and borrowed this week for the DS18B20.

</details>

<details>
<summary><b><i>Pull-up</i> resistors: why 4.7 kΩ, and what happens with too many modules</b></summary>

On I2C and 1-Wire, the data wire only gets back to 3.3 V through the pull-up resistor. The wires and the pins of every device store a little electric charge (capacitance), so the voltage rises slowly, like a bucket being filled through a small tap:

- **Resistor too large** (tap too small): the wire's voltage rises too slowly, especially at 400 kHz. The I2C specification limits this rise time to at most 1,000 ns at 100 kHz and 300 ns at 400 kHz.
- **Resistor too small** (tap too big): the devices have to pull a large current to bring the wire down to 0 V. The I2C specification only guarantees the ability to pull 3 mA, so at 3.3 V, the resistor should be no smaller than about 1 kΩ.

4.7 kΩ is a safe middle ground for short wires. The catch: **every module brings its own pair of pull-ups**, and those resistors are connected in parallel. Two 10 kΩ pull-ups in parallel equal 5 kΩ, while four 4.7 kΩ pull-ups equal about 1.2 kΩ, already close to the lower limit. For two or three modules, as on Node 1, there's no problem. If one day you connect many I2C modules, remove some of their pull-ups; many modules provide a jumper or solder pads for that.

</details>

<details>
<summary><b><i>Clock stretching</i>: when an I2C device asks you to "wait a moment"</b></summary>

Normally, the ESP32 sets the tempo on the SCL wire. But some I2C devices sometimes need time, for example a sensor that's busy measuring. A device like that may **hold SCL at 0 V** after receiving a byte. While SCL is held, the ESP32 can't continue its clock and automatically waits. This technique is called ***clock stretching*** (the clock is "stretched" longer).

The SSD1306 display and the BME280 don't use it, but some humidity sensors and gas sensors do. On the ESP32, what decides how long to wait is the I2C hardware itself: with the esp32 3.3.x package, an SCL held for more than about **2 ms** counts as stuck, and the conversation fails. `Wire.setTimeOut()` (50 ms by default) only sets the time limit for a whole conversation, so it doesn't help here. If your I2C sensor ever fails often for no clear reason, read its datasheet: sensors like that usually have a mode without clock stretching (for example "no hold master"), and their library can be set to use that mode.

</details>

<details>
<summary><b>Why <code>display()</code> takes about 25 ms, and why our display uses 400 kHz</b></summary>

Every `display()` sends the whole "drawing paper": 1,024 bytes plus a few control bytes. Every byte on I2C takes 9 clock beats (8 bits + 1 ACK bit), so the total is about 9,400 beats. At the standard speed of 100 kHz, that's almost 0.1 seconds. That's why the Adafruit SSD1306 library quietly raises the bus speed to **400 kHz** during `display()`, then lowers it back to 100 kHz. As a result, one `display()` takes only about 25 ms.

The lesson: updating the display is "expensive". Node 1 only needs to update it every 2 seconds, together with the sensor report, not on every pass of `loop()`.

</details>

<details>
<summary><b>1-Wire in more depth: the reset pulse, parasite power, and the CRC check number</b></summary>

- **Every conversation starts with a reset pulse.** The ESP32 pulls the DATA wire down to 0 V for about 480 microseconds, then lets go. Every sensor that's present answers by briefly pulling the wire down ("I'm here"). After that, every bit is sent in a time window of about 60–120 microseconds, so the speed is only about 16 thousand bits per second.
- **Parasite power.** The DS18B20 can work with **just two wires** (DATA and GND): it stores a little power from the DATA wire while that wire is `HIGH`. This saves one wire, but it's less reliable with long wires or many sensors. Our project always uses three wires (normal power).
- **CRC.** The last pair of digits of the serial number is a **check number**, and so is one byte in every temperature reading. The library recalculates that number, but at different moments. The serial number's CRC is checked when the sensors are searched for (`begin()`): a sensor with a broken CRC isn't counted. The reading's CRC is checked every time the temperature is read: if it doesn't match because the data got damaged along the way, the reading counts as failed, and the result is −127 °C.

</details>

<details>
<summary><b>Why the microSD card uses SPI, even though the ESP32 has a dedicated SD card interface</b></summary>

The ESP32 has a faster, dedicated SD card interface, **SDMMC** (the `SD_MMC` library), with four data wires at once. But that interface uses fixed pins: GPIO 2, 4, 12, 13, 14, and 15. On Node 1, all six of those pins are already in use or deliberately avoided: the status LED (4), the button (13), the DHT22 (14), TRIG (15), RS-485 (2), and GPIO 12, which is dangerous at power-up (Module 5). SPI can use any pins we choose, and for logging one line every 30 seconds, its speed is more than enough.

There's one note for the future. On some cheap microSD modules, the voltage translator **never lets go** of the MISO wire, even when CS is `HIGH`. As long as that card is the only SPI device, that's no problem. If you later add another SPI device on the same wires and that device can't be read, suspect the microSD module's MISO.

</details>

---

## 🧩 Independent Challenges

Three levels, starting with the easiest. Do at least Level 1. They all use the `module07_node1_display` sketch from Practice 6, so you can try them in Wokwi without building anything.

> 🖥️ **Tools:** **Arduino IDE** and the display circuit from Practice 1, or Wokwi with the Practice 6 [`diagram.json`](code/module07_node1_display/diagram.json) and [`libraries.txt`](code/module07_node1_display/libraries.txt). Before you change anything, open `module07_node1_display` (**File → Open Recent**), then **right away** choose **File → Save As…** and save it in the `module-07` folder under a new name, for example `module07_challenge1`.

**Level 1 — A small change: dim the display at night.** A brightly lit display in a dark bedroom is dazzling. Hints:

- Add `const int DARK_THRESHOLD = 1000;` at the top (the same number as in Node 1). If you later move this challenge's result into Node 1, don't copy this line along: Node 1 already has `DARK_THRESHOLD`.
- At the start of `showOnDisplay()`, after the `displayFound` check, call `display.dim(true)` if `b.light < DARK_THRESHOLD`, and `display.dim(false)` if not. The `dim()` function dims the whole display.
- It works if the display dims when sample 2 (night, light `157`) and sample 4 (light `0`) are shown, then gets bright again for samples 1 and 3. In Wokwi, this difference in brightness may not be visible; check it on a real display.

**Level 2 — Combine: an empty-tank alert.** Use the Module 6 rule: the pump refuses to run if the tank's water is below 20%. Make the display warn you too. Hints:

- Add a fifth sample to the `samples` array, for example `{27.0, 65, 2500, 25, false, 12}` (water 12%), and its name to `sampleNames`. Also change `[4]` to `[5]` in both arrays, and `sampleIndex > 3` to `sampleIndex > 4` in `loop()`.
- In `showOnDisplay()`, if `b.water_level` is between 0 and 19, draw the "Tank" row as inverted text (white background), for example `FILL TANK!`, like the motion row.
- It works if the alert appears for the fifth sample but **not** for sample 4 (a water level of `-1` means unreadable, not empty).

**Level 3 — Your own design: a display that doesn't "burn in".** OLED pixels that show the same picture for months gradually dim and leave a ghost image behind (*burn-in*). Node 1 will run 24 hours a day. Design a way to make its display last. Starting hints:

- `display.ssd1306_command(SSD1306_DISPLAYOFF)` turns the display off without erasing its picture, and `display.ssd1306_command(SSD1306_DISPLAYON)` turns it back on.
- Idea: turn the display off if there's been no motion for a few minutes, then turn it back on when the PIR sees motion. Another idea: shift the whole layout by one pixel every hour.
- Think about it: what should stay visible while the display is off, so the people at home know Node 1 is still alive? (Hint: the status LED.)

There's no answer key for Level 3 — if your display stays informative when it's needed and rests when nobody's looking, you got it right.

---

## ➕ Add-on to "Mini Smart Home"

Module 7's contribution to the running project: the `showOnDisplay()` shelf, empty since Module 3, finally holds **your status display design**, and Node 1 can (optionally) **log its readings to a microSD card**. The result: Node 1 **v0.4.0**. The complete reference version is in [`mini-smart-home/firmware/node-1-home/`](../../mini-smart-home/firmware/node-1-home/node-1-home.ino).

> 🖥️ **Tools used:** **Arduino IDE** (with the libraries from Modules 5–6 and **Adafruit SSD1306** from Practice 1), **VS Code**, **GitHub Desktop**, and the complete circuit with the OLED display (the microSD module is optional). No board? You can test every step in Wokwi with Node 1's [`diagram.json`](code/node-1-home/diagram.json) and [`libraries.txt`](code/node-1-home/libraries.txt); start the simulation, click an empty spot in the simulation panel, then press **F** to see the whole circuit (if the cursor is still in the code editor, the letter f gets typed into your code instead). That diagram is the same as in Module 6, plus the OLED display below the board; the status LED was moved down a little so that the display's wires have room. That diagram also deliberately leaves out the microSD module.

### A. Update `PIN-MAP.md`

1. In VS Code, open your project's repository folder (**File → Open Folder…** → **Documents → GitHub → mini-smart-home**), then open `PIN-MAP.md`.
2. Open the reference version of [`PIN-MAP.md`](../../mini-smart-home/PIN-MAP.md) in a new tab, click **Copy raw file**, then replace all the contents of your file with it (**Ctrl + A**, then **Ctrl + V**). What changed:
   - the I2C row is now **connected** (the OLED display, the bus strips in columns 19 and 20);
   - the microSD row says how to connect it, including the habit of pressing EN for a regulated module;
   - the GPIO 16 note says that the DS18B20 practice is finished;
   - the **Power rails on the workbench** table now lists the OLED display on the bottom rail and the (optional) microSD module on the top rail or the bottom rail;
   - there's a new **Buses on the breadboard** table;
   - the **History** table gets a version 3 row.
3. Save (**Ctrl + S**).

### B. Fill the display shelf: Node 1 becomes v0.4.0

Open **`node-1-home.ino`** in Arduino IDE: **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home**. Make the following changes from top to bottom. After each step, click **Verify** (✓). The steps are ordered so that every Verify along the way succeeds; if an error appears, check the step you just did.

**Step 1 — The very top: comments, libraries, and version.** Replace every line from the first line through `const String FIRMWARE_VERSION = "0.3.0";` with this block:

```cpp
// Node 1 "Home" - firmware v0.4.0 (updated in Module 7)
// The running project: Mini Smart Home.
//
// New in v0.4.0: the OLED display shows all the readings about every 2 seconds, and (optionally)
// the readings are logged to a microSD card as one CSV line about every 30 seconds.
// Without the display or without the card, Node 1 keeps running just like v0.3.0.
// You can still try the actuators from the Serial Monitor, for example:
// lamp on, fan off, pump 3, curtain 90, beep, status.
//
// Libraries: ESP32Servo version 3.2.1, DHT sensor library version 1.4.7
// (installed with it: Adafruit Unified Sensor version 1.1.15), Adafruit SSD1306 version 2.5.17
// (installed with it: Adafruit GFX Library version 1.12.6 and Adafruit BusIO version 1.17.4).
// Wire, SPI, and SD already come with the esp32 package.

#include <ESP32Servo.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <SD.h>
#include <esp_system.h>  // esp_reset_reason()

const String FIRMWARE_VERSION = "0.4.0";
```

**Step 2 — The pin map.** Below the line `const int PIN_ECHO = 35; …`, there are three comment lines that start with `// Reserved for later modules`, `// Module 7:`, and `// Module 15:`. Replace all three with this block:

```cpp
const int PIN_SDA = 21;            // Module 7, I2C: OLED display
const int PIN_SCL = 22;            // Module 7, I2C: OLED display
const int PIN_SD_CS = 5;           // Module 7, microSD (optional); SCK = 18, MISO = 19, MOSI = 23
// Reserved for later modules (don't use them for anything else):
// Module 15: RS-485 RX = 16, TX = 17, DE/RE = 2
```

**Step 3 — Module 7's things.** Right below the line `int loopCount = 0;`, add one empty line, then this block:

```cpp
// ---------- Module 7: OLED display and (optional) microSD card ----------
const byte DISPLAY_ADDRESS = 0x3C;             // the OLED display's address on the I2C bus
const int REPORTS_PER_LOG = 15;                // 15 reports x 2 seconds = about 30 seconds
const char* LOG_FILE_NAME = "/node1.csv";      // file name on the card, always starts with a slash
Adafruit_SSD1306 display(128, 64, &Wire, -1);  // width 128, height 64, on the I2C bus, no reset pin
bool displayFound = false;                     // true if the display answers at address 0x3C
bool cardFound = false;                        // true if the microSD card was detected at power-up
int reportCount = 0;                           // reports since the last CSV line
```

**Step 4 — Fill the display shelf.** Find the empty shelf that has been waiting since Module 3:

```cpp
// ---------- Module 7: show the reading on the OLED display ----------
void showOnDisplay(SensorReading b) {
  // not filled in yet
}
```

Replace those four lines with the block below. Its contents are the same as the part of the Practice 6 sketch from the line `// 8 x 8 pixel icons: …` to the end of the `showOnDisplay()` function; the lines `Adafruit_SSD1306 display…` and `bool displayFound…` already went in during Step 3.

**If you changed the layout in Practice 6 (and that's the Module 7 completion requirement), use your own version, not the block below:**

1. Open your `module07_node1_display` sketch (**File → Open Recent**).
2. Select from the line `// 8 x 8 pixel icons: 1 = pixel on, 0 = pixel off.` to the closing brace `}` of the `showOnDisplay()` function, just above the comment `// ---------- End of the display part. … ----------`. The lines `Adafruit_SSD1306 display…` and `bool displayFound…`, as well as `setup()` and `loop()`, are **not** part of the selection. Copy it (**Ctrl + C**).
3. Go back to `node-1-home.ino`. Keep the comment line `// ---------- Module 7: show the reading on the OLED display ----------`; select the three empty-shelf lines below it (from `void showOnDisplay(SensorReading b) {` to `}`), then paste (**Ctrl + V**).
4. Click **Verify**. If you get `redefinition of …`, a name is duplicated, for example a constant of yours whose name already exists in Node 1 (such as `DARK_THRESHOLD`). Delete your copy and use the existing one, or rename yours.

If your layout is the same as the reference, paste this block:

```cpp
// ---------- Module 7: show the reading on the OLED display ----------
// 8 x 8 pixel icons: 1 = pixel on, 0 = pixel off.
const unsigned char ICON_SUN[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char ICON_PLANT[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char ICON_TANK[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char ICON_PERSON[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

// Looks for the display on the I2C bus, then turns it on. Without a display, the program keeps running.
void setupDisplay() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.beginTransmission(DISPLAY_ADDRESS);
  displayFound = Wire.endTransmission() == 0;  // did anything answer at 0x3C?
  if (!displayFound) {
    Serial.println("OLED display not found at 0x3C. Node 1 keeps running without a display.");
    return;
  }
  display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS);
  display.cp437(true);  // the correct CP437 character table, so that code 248 = the degree sign
  display.setTextColor(SSD1306_WHITE);
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Node 1 Home");
  display.println("waiting for data...");
  display.display();
}

// Prints right-aligned text: its last character ends just before x = right.
void printRightAligned(String text, int right, int y, int size) {
  display.setTextSize(size);
  display.setCursor(right - text.length() * 6 * size, y);  // one character = 6 pixels x size
  display.print(text);
}

// Percent bar: a frame "width" pixels wide, filled as far as the percent. A percent below 0 = empty.
void drawBar(int x, int y, int width, int percent) {
  display.drawRect(x, y, width, 8, SSD1306_WHITE);
  if (percent > 0) {
    display.fillRect(x + 2, y + 2, (width - 4) * percent / 100, 4, SSD1306_WHITE);
  }
}

// One display row: icon, name, right-aligned number, then the percent bar.
// The * in "const unsigned char* icon" means this function accepts any icon you pass to it
// (like const char* for text in Module 3). Just leave it as it is.
void barRow(int y, const unsigned char* icon, String name, String number, int percent) {
  display.drawBitmap(0, y, icon, 8, 8, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(11, y);
  display.print(name);
  printRightAligned(number, 82, y, 1);
  drawBar(86, y, 42, percent);
}

void showOnDisplay(SensorReading b) {
  if (!displayFound) {
    return;
  }
  display.clearDisplay();

  // Top row: temperature on the left and humidity on the right. Big numbers, small units.
  String temperatureText = "--.-";
  if (!isnan(b.temperature)) {
    temperatureText = String(b.temperature, 1);
  }
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(temperatureText);
  display.setTextSize(1);
  display.write(248);  // degree sign
  display.print("C");

  String humidityText = "--";
  if (b.humidity >= 0) {
    humidityText = String(b.humidity);
  }
  printRightAligned(humidityText, 122, 0, 2);
  display.setTextSize(1);
  display.setCursor(122, 0);
  display.print("%");

  display.drawFastHLine(0, 17, 128, SSD1306_WHITE);  // divider line

  // Three rows with percent bars. Light (0-4095) is first turned into 0-100 for its bar.
  barRow(21, ICON_SUN, "Light", String(b.light), b.light * 100 / 4095);
  barRow(32, ICON_PLANT, "Soil", String(b.soil) + "%", b.soil);
  String waterText = "--";
  if (b.water_level >= 0) {
    waterText = String(b.water_level) + "%";
  }
  barRow(43, ICON_TANK, "Tank", waterText, b.water_level);

  // Motion row: inverted (white background) when there is motion, so it catches the eye at once.
  if (b.motion) {
    display.fillRect(0, 53, 128, 10, SSD1306_WHITE);
    display.drawBitmap(0, 54, ICON_PERSON, 8, 8, SSD1306_BLACK);
    display.setTextColor(SSD1306_BLACK);
    display.setCursor(11, 54);
    display.print("Motion: DETECTED");
    display.setTextColor(SSD1306_WHITE);
  } else {
    display.drawBitmap(0, 54, ICON_PERSON, 8, 8, SSD1306_WHITE);
    display.setCursor(11, 54);
    display.print("Motion: none");
  }

  display.display();
}
```

**Step 5 — The CSV log (optional, but paste it anyway).** Right below the block you just pasted in Step 4 (its last line is the `}` after `display.display();`) and above the comment `// ---------- Modules 6 & 19: automation rules (watering, lamp, fan) ----------`, add one empty line, then this block. Without a microSD module, this code only prints one message at power-up and does nothing else:

```cpp
// ---------- Module 7 (optional): CSV log on the microSD card ----------
// If the card is detected at power-up, logging is turned on. Without a card, Node 1 keeps running.
void setupCard() {
  cardFound = SD.begin(PIN_SD_CS);
  if (!cardFound) {
    Serial.println("microSD card not detected: CSV logging is off.");
    return;
  }
  if (!SD.exists(LOG_FILE_NAME)) {
    File file = SD.open(LOG_FILE_NAME, FILE_WRITE);
    file.println("uptime_s,temperature,humidity,light,soil,motion,water_level");  // column header line
    file.close();
  }
  Serial.println("microSD card ready: readings are logged to node1.csv about every 30 seconds.");
}

// One CSV line every REPORTS_PER_LOG reports. Failed readings are written as empty cells.
void logToCard(SensorReading b) {
  if (!cardFound) {
    return;
  }
  reportCount++;
  if (reportCount < REPORTS_PER_LOG) {
    return;
  }
  reportCount = 0;

  String line = String(millis() / 1000) + ",";  // uptime_s: seconds since the board was turned on
  if (!isnan(b.temperature)) {
    line += String(b.temperature, 1);
  }
  line += ",";
  if (b.humidity >= 0) {
    line += String(b.humidity);
  }
  line += "," + String(b.light) + "," + String(b.soil) + ",";
  if (b.motion) {
    line += "true";
  } else {
    line += "false";
  }
  line += ",";
  if (b.water_level >= 0) {
    line += String(b.water_level);
  }

  File file = SD.open(LOG_FILE_NAME, FILE_APPEND);  // APPEND = add to the end of the file
  if (!file) {
    Serial.println("Could not write to the microSD card (removed?). CSV logging stopped.");
    cardFound = false;
    return;
  }
  file.println(line);
  file.close();  // only after closing is the content really saved on the card
}
```

**Step 6 — Call everything.** In `setup()`, add two lines between `setupPins();` and `printStatus();`:

```cpp
  setupPins();
  setupDisplay();  // Module 7
  setupCard();     // Module 7 (optional)
  printStatus();
```

In `loop()`, add one line right below `showOnDisplay(reading);`:

```cpp
    showOnDisplay(reading);
    logToCard(reading);
```

`showOnDisplay(reading)` itself has been called since Module 3, about every 2 seconds. Ever since then, this function has just been waiting to be filled — and this week, you fill it.

### C. Test Node 1

1. Click **Verify**. If an error appears, compare the line the error message points to with the [reference version](../../mini-smart-home/firmware/node-1-home/node-1-home.ino).
2. Make sure the tank has water in it and the soil sensor is stuck in moist soil (as in Module 6). Plug in the USB, turn on the MB102, then click **Upload**. Open the Serial Monitor (**New Line**, **115200 baud**).

   **Expected output** (without a microSD module; your numbers will certainly be different):

   ```text
   Node 1 Home - firmware 0.4.0
   Last restart reason: POWERON
   microSD card not detected: CSV logging is off.
   status: lamp=off fan=off curtain=90
   temperature=28.4 C  humidity=71 %  light=2744  soil=63 %  motion=no  water_level=96 %
   ```

   With a microSD module connected, the line `microSD card not detected: …` is replaced by `microSD card ready: readings are logged to node1.csv about every 30 seconds.`. **A new habit while a regulated microSD module is connected:** every time you power up Node 1 (USB first, then the MB102), press **EN** once so that Node 1 finds its card. Without that, Node 1 prints `microSD card not detected: CSV logging is off.` and logs nothing. Right after an upload finishes, you don't need to press EN, because the board restarts by itself, and by then the MB102 is already on. If you can't see the first lines above in the Serial Monitor, the EN button prints them again too.
3. **The display.** Right after power-up, the display shows `Node 1 Home` and `waiting for data...`. Two seconds later, your status display appears with **real** readings and updates about every two seconds.
4. **Test every row:** cover the LDR (the light bar gets shorter); breathe on the DHT22 (the humidity goes up); wave your hand in front of the PIR (the motion row turns inverted); lift the soil sensor into the air (the soil bar heads toward 0%, and within 2 seconds the pump runs for 3 seconds, as in Module 6). **As soon as the pump stops, stick the sensor back into moist soil** (or dip it into the glass of water). If you leave it in the air, the pump waters again about every 30 seconds, and your plant's glass can overflow.
5. **The Module 5–6 commands still work:** type `status`, `lamp on`, `lamp off`, and `pump 2`.
6. **(With microSD)** Let Node 1 run for a few minutes, then turn off the MB102, unplug the USB, take out the card, and open `node1.csv` on your laptop. Its first line holds the column names `uptime_s,temperature,humidity,light,soil,motion,water_level`, and every line after it holds the numbers in the same order, for example `32,28.4,71,2744,63,false,96`. Failed readings show up as empty cells, for example `92,,,2744,63,false,`. If your Google Sheets or Excel uses Indonesian regional settings, numbers with a decimal point, such as `28.4`, may be read wrongly, for example as text or as a date. The easiest way, also for Excel users: create a blank spreadsheet in Google Sheets, first change **File → Settings → Locale** to **United States**, then import `node1.csv` through **File → Import → Upload**. Under **Import location**, choose **Replace current sheet** so that the data goes into the spreadsheet whose settings you just changed.
7. **Node 1 keeps running even without the display.** Turn off the MB102, unplug the USB, then remove the display's SDA wire from 20j. Power up again (USB first, then the MB102), then press **EN** so that the startup message is printed while the Serial Monitor is connected: `OLED display not found at 0x3C. Node 1 keeps running without a display.`. All the automation rules still work. After that, turn off the MB102, unplug the USB, put the wire back, then power up again (USB, the MB102, then EN).

![Screenshot of the complete Node 1 v0.4.0 in Wokwi, zoomed out with the F key and then cropped; the white part-name labels were added by the author. The circuit: the ESP32 board in the middle with the OLED display and the D4 status LED below it; on the left and at the top, the D13 button, the DHT22, the buzzer, the curtain servo, LED = pump, relay + LED = fan, and relay + LED = lamp; at the top right, the PIR (D34), the potentiometer standing in for the soil sensor, the LDR (VP), and the HC-SR04 (tank). Bottom left, a close-up of the display after the PIR was clicked and then the Simulate motion button: 28.5 degrees C, 71 percent, Light 3094, Soil 70 percent, Tank 52 percent, and an inverted Motion: DETECTED row on a white background (marker 1). Bottom right, the Serial Monitor: Node 1 Home - firmware 0.4.0, Last restart reason: POWERON, microSD card not detected: CSV logging is off., status: lamp=off fan=off curtain=90, then report lines that change from motion=no to motion=yes (marker 2). Note: the other readings are the sensors' starting values in the Wokwi diagram](assets/wokwi-node-1-v4.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

### D. Commit and push

1. In GitHub Desktop, choose **`mini-smart-home`** in the **Current repository** box — always check this box before you commit!
2. The **Changes** tab lists two changed files: `PIN-MAP.md` and `firmware/node-1-home/node-1-home.ino`.
3. Fill in **Summary** with `Node 1 v0.4.0: OLED status screen and optional CSV log (Module 7)`, click **Commit 2 files to main**, then **Push origin**.

> [!IMPORTANT]
> **Extra devices must never bring Node 1 to a halt.** The display and the microSD card are "bonuses": if either one is missing or broken, Node 1 prints one message and keeps doing its main job — reading the sensors and looking after the pump. The same principle applies in Module 11: when the internet goes down, Node 1 keeps working at home.

---

## 📖 Glossary

| Term | Short meaning |
| :--- | :--- |
| **Bus** | A shared wire used by many devices at the same time, with rules about who may talk. |
| **UART** | A communication line between two devices over TX and RX, for example `Serial` to the laptop. It has no clock wire, so its speed (*baud rate*) must be agreed on in advance. |
| **I2C** | A bus with two data wires (SDA and SCL). Every device has a 7-bit address. |
| **SDA** / **SCL** | *Serial data* (the data line) and *serial clock* (the clock line) of I2C. On our ESP32: D21 and D22. |
| **I2C address** | A device's "house number" on the I2C bus, for example `0x3C` for the OLED display. |
| **ACK** | The short "yes, I'm here" answer from the device whose address was called. |
| **Hexadecimal** | A way of writing numbers in base 16 (0–9, then A–F), marked with the `0x` prefix. `0x3C` = 60. |
| **I2C scanner** | A sketch that "knocks" on every address and notes which ones answer. |
| **Bridge wire** | A male–male wire that connects the strip of the D21/D22 pin to the bus strip in column 20/19, so that many I2C devices can plug into the same strips. |
| ***Pull-up*** | A resistor that brings a data wire back to 3.3 V when no device is pulling it down to 0 V. |
| **OLED** | A display in which every pixel gives off its own light, with no backlight. |
| **SSD1306** | The controller chip of the 128 × 64 pixel OLED display we use. 1.3-inch displays often use the SH1106, which is different. |
| ***Buffer*** (drawing paper) | A copy of all the display's pixels in the ESP32's memory. You draw on it first, then send it with `display()`. |
| ***Bitmap*** | A picture stored as a series of binary numbers: 1 = pixel on, 0 = pixel off. |
| **CP437** | The old computer character table that our display uses; the ° sign is number 248. |
| **BME280** | A Bosch sensor for temperature, humidity, and air pressure; chip ID `0x60`. |
| **BMP280** | The BME280's "twin" without a humidity sensor; chip ID `0x58`. |
| **Chip ID** | An identity number inside a chip that can be read to confirm what type of chip it is. |
| **hPa** (hectopascal) | A unit of air pressure. About 1,013 hPa at the seashore; 1 hPa is the same as 1 mbar. |
| **1-Wire** | A bus with one data wire. Every device has a 64-bit factory serial number. |
| **DS18B20** | A 1-Wire temperature sensor, often sold as a waterproof probe. |
| **Serial number** | The DS18B20's unique 64-bit factory code, for example `28-FF-64-1E-0F-6A-D3-3C`; the datasheet calls it the *ROM code*. |
| **CRC** | A check number at the end of the serial number and in every DS18B20 reading, for detecting data damaged along the way. |
| **SPI** | A fast bus with four data wires (SCK, MOSI, MISO, CS). |
| **MOSI** / **MISO** | The data line from the ESP32 to the device, and from the device to the ESP32. On microSD modules, they're often labeled DI and DO. |
| **CS** (*chip select*) | The "pick me" wire of SPI; `LOW` means that this device is the one being talked to. |
| **Regulator** | A part that lowers a voltage, for example from 5 V to 3.3 V. A regulated microSD module needs 5 V on its VCC pin. |
| **Voltage translator** (*level shifter*) | A part that turns 5 V signals into 3.3 V signals or the other way around, so that the ESP32's pins stay safe. |
| **FAT32** | The file system that the ESP32's **SD** library understands. Cards of 4–16 GB usually come in this format already. |
| **CSV** | A text file that holds a table; its columns are separated by commas, and the first line holds the column names. |
| **`uptime_s`** | Seconds since the board was turned on; the same name as the field in the data contract (Appendix A). |
| **Schematic** | A circuit drawing with symbols that shows what is connected to what, not where things are. |
| ***Net label*** | A name label in a schematic; the same label means connected, even without a line. |
| ***Optocoupler*** | An LED and a phototransistor in one package; it separates two circuits with light. |
| ***Flyback* diode** | A diode next to a coil (relay, pump) that absorbs the voltage kick when the coil is switched off. |
| ***Burn-in*** | A permanent ghost image on an OLED display, caused by the same picture being lit for too long. |

---

## 📝 5-Question Quiz

1. The OLED display (`0x3C`) and the BME280 (`0x76`) are connected to the same SDA and SCL wires. (a) How does the ESP32 know which device it's talking to? (b) What happens if you add a second OLED display that also has the address `0x3C`?
2. (a) Convert `0x3C` and `0x77` into ordinary numbers, then explain why datasheets prefer to write addresses in hexadecimal. (b) Your sketch calls `display.print("28.5");`, but the OLED display doesn't change at all, even though the scanner finds `0x3C`. Which command did you probably forget to call, and why is it needed?
3. The Practice 3 sketch prints `Its chip ID is 0x58, not 0x60.`. (a) Which sensor is connected? (b) Which reading can't you get from it? (c) Why can't the I2C scanner alone tell them apart?
4. The DS18B20 in the tank sometimes reports `-127`, then goes back to normal, then `-127` again. Name two possible meanings. Which part of the circuit would you check first?
5. In the relay module's schematic, (a) which parts make this module active LOW? (b) What is the job of the diode mounted in reverse next to the coil? (c) Why doesn't a schematic need to draw long GND wires to every part?

<details>
<summary><b>Answer key & explanations</b></summary>

1. (a) Every conversation starts with an **address**. All the devices hear it, but only the owner of that address answers with an ACK. (b) Both displays answer with an ACK and receive the same commands, so both show **exactly the same** picture: you can't control them separately. For devices that are also **read**, such as sensors, their two answers collide, so the data gets garbled. That's why addresses on one bus must be unique. Change the address of one of them (many displays have `0x3C`/`0x3D` solder pads) or move it to a second I2C bus (the ESP32 has two).
2. (a) `0x3C` = 3 × 16 + 12 = **60**; `0x77` = 7 × 16 + 7 = **119**. Every hexadecimal digit stands for exactly four bits, so the bit pattern inside the chip is easier to read from a hexadecimal number. (b) **`display.display()`**. Drawing commands such as `print()` only change the "drawing paper" (*buffer*) in the ESP32's memory; the display only changes once `display()` sends that whole paper over I2C.
3. (a) **A BMP280.** (b) **Humidity**; the BMP280 only measures temperature and pressure. (c) The scanner only asks for the **address**, and the BMP280 uses the same addresses as the BME280 (`0x76`/`0x77`). The type of chip can only be found from the **chip ID**.
4. `-127` means the library **doesn't trust** the reading. There are two possibilities: the sensor **didn't answer** (a loose DAT or GND connection), or the sensor **has just restarted** because its power keeps cutting in and out (library 4.0.6 turns the built-in 85.00 °C value into −127). Both point to the **connections**: check the screws of the adapter's terminal and the probe's VCC, DAT, and GND wires.
5. (a) The path **R1 → indicator LED → the LED inside the optocoupler → the IN pin**: current only flows if IN is pulled down to 0 V. (b) **To absorb the voltage kick** from the coil when it's switched off, so the transistor isn't damaged (the *flyback* diode). (c) Because all the **GND symbols** are considered connected to the same GND; a schematic just puts that symbol next to each part.

</details>

---

## ✅ Module 7 Completion Checklist

Check them all before you move on to Module 8:

- [ ] The I2C scanner found my OLED display at address `0x3C` (or `0x3D`), and I can explain why SDA and SCL must not be swapped.
- [ ] I can show text, big numbers, percent bars, and icons of my own on the OLED display.
- [ ] The BME280 reads with chip ID `0x60`, **or** I can explain what the other chip ID that showed up means (Wokwi is enough if I don't have a BME280 yet).
- [ ] The DS18B20 reads, along with its serial number (Wokwi is enough if my probe can't be connected yet), and I know what 85 °C and −127 °C mean.
- [ ] (Optional) The CSV log on the microSD card is still there after the board restarts, and I can open it on my laptop.
- [ ] ⭐ **The OLED display shows all of Node 1's readings** (temperature, humidity, light, soil, motion, water level) in **a layout I designed myself**, stays neat for all four Practice 6 samples, and is already running in Node 1 v0.4.0.
- [ ] ⭐ **I can read the relay module's schematic** (all six Practice 7.1 questions answered) and **redraw Node 1 as a schematic**.
- [ ] `PIN-MAP.md` version 3 and Node 1 v0.4.0 are committed and pushed to the `mini-smart-home` repository; my sketches, notes, and schematic picture are in `learn-iot/module-07`.
- [ ] The BME280 and the DS18B20 have been removed and stored for Node 2.
- [ ] ⭐ **Quiz: at least 4 of 5 correct.**

**You pass when** (according to the Syllabus): *the OLED shows all of Node 1's readings in a layout you designed yourself, and you can read the schematic of a relay/sensor module from its documentation.*

**Toward the Phase 1 completion criteria** ([Syllabus §8](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)): Node 1 can now show its own readings, and the Node 1 schematic you drew adds to the photo of the Phase 1 circuit. The robust firmware v1.0 that can run for 24 hours comes in Module 8, the measured battery sketch in Module 9, and the 30-second video at the end of Phase 1.

Everything checked? Congratulations — Node 1 now has a display of its own, and you can read the "maps" of electronic circuits. In **Module 8**, Node 1 learns to be robust: without `delay()`, with a guard that restarts a stuck program, and with settings that stay saved even when the power goes out.

---

## 📚 Sources & Image Credits

**Datasheets and documentation used** (accessed October 2026):

- [BME280 datasheet (Bosch Sensortec, PDF)](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf) — the range, accuracy, package size, I2C address, chip ID `0x60`, and the CSB/SDO pins.
- [BMP280 datasheet (Bosch Sensortec, PDF)](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmp280-ds001.pdf) — the 2.0 × 2.5 mm package size and chip ID `0x58`.
- [DS18B20 datasheet (Maxim Integrated, now Analog Devices; SparkFun copy, PDF)](https://cdn.sparkfun.com/datasheets/Sensors/Temp/DS18B20.pdf) — the range, accuracy, resolution, conversion time, the 64-bit serial number, the 85 °C power-up value, and parasite power.
- [SSD1306 datasheet (Solomon Systech)](https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf) — the addresses `0x3C`/`0x3D` (in 8-bit form: `0x78`/`0x7A`) and how the display chip works.
- [Heltec 0.96-inch OLED display documentation](https://github.com/Heltec-Aaron-Lee/heltec0.96OLED) — the warning that swapped VCC and GND can damage the display in less than a second.
- Library source code: [Adafruit SSD1306](https://github.com/adafruit/Adafruit_SSD1306) 2.5.17, [Adafruit GFX Library](https://github.com/adafruit/Adafruit-GFX-Library) 1.12.6, [Adafruit BME280 Library](https://github.com/adafruit/Adafruit_BME280_Library) 2.3.0, [DallasTemperature](https://github.com/milesburton/Arduino-Temperature-Control-Library) 4.0.6, [OneWire](https://github.com/PaulStoffregen/OneWire) 2.3.8, and [arduino-esp32](https://github.com/espressif/arduino-esp32) 3.3.12 (the `Wire`, `SPI`, and `SD` libraries, plus the I2C driver `esp32-hal-i2c-ng.c`), together with [ESP-IDF](https://github.com/espressif/esp-idf) 5.5 (the default SCL hold limit in `hal/esp32/include/hal/i2c_ll.h`).
- [I2C bus specification (NXP UM10204)](https://www.nxp.com/docs/en/user-guide/UM10204.pdf) — the signal rise time, the 3 mA pull-down current, and clock stretching.

**Images.** The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The two images that contain Wikimedia Commons photos (`meet-the-stage-2-parts` and `bme-vs-bmp`) are licensed **CC BY-SA 4.0**, following the license of their photos, and are only available as `.jpg`. The illustrations of the workbench, the modules, and the Arduino IDE window are redrawn to match the real things; the size and layout of real parts may differ slightly from one manufacturer to another. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-07`, `bus-toll-road`, `node1-bus-map`, `node1-display-design` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The bus speeds come from the NXP I2C specification and the DS18B20 datasheet. | CC BY 4.0 |
| `i2c-addresses`, `oled-coordinates`, `onewire-ds18b20`, `spi-microsd` (`.png` + `.svg`) | Original diagrams. The display's address and size from the SSD1306 datasheet; the addresses `0x76`/`0x77` from the BME280 datasheet; the pull-ups from the NXP I2C specification; the text sizes and the 1,024-byte buffer from the source code of Adafruit GFX 1.12.6 and Adafruit SSD1306 2.5.17; the 64-bit serial number, the conversion time, and the 85 °C value from the DS18B20 datasheet, and how the library flags −127 from the DallasTemperature 4.0.6 source code; the SPI pins from the source code of the Arduino-ESP32 `SD` library. | CC BY 4.0 |
| `schematic-symbols`, `relay-module-schematic`, `node1-schematic-sensors`, `node1-schematic-actuators` (`.png` + `.svg`) | Original diagrams. The relay module schematic is **simplified** from the common layout of relay modules with an optocoupler (PC817, S8050 transistor, flyback diode); the component values of your module may differ. The Node 1 schematics are drawn from `PIN-MAP.md` version 3. | CC BY 4.0 |
| `workbench-oled`, `workbench-bme280`, `workbench-ds18b20`, `microsd-wiring-map` (`.png` + `.svg`) | Original illustrations of the two-breadboard workbench (continuing the workbench of Modules 5–6), drawn hole by hole according to the tables in this module. | CC BY 4.0 |
| `arduino-library-ssd1306` (`.png` + `.svg`) | An original illustration redrawn from the Library Manager of Arduino IDE 2.3.10 (not a screenshot). The dialog text is taken from the Arduino IDE source code; the library names and sentences from the `library.properties` files of Adafruit SSD1306 2.5.17 and Adafruit SSD1306 Wemos Mini OLED 1.1.2. | CC BY 4.0 for the illustration |
| `meet-the-stage-2-parts.jpg` | A collage of Wikimedia Commons photos: the [OLED display](https://commons.wikimedia.org/wiki/File:MicroSD_card_connected_to_Arduino_nano_with_OLED_display.jpg), cropped from a photo by Turbospok (CC BY-SA 4.0), the [BME280](https://commons.wikimedia.org/wiki/File:SparkFun_Atmospheric_Sensor_Breakout_-_BME280_13676.jpg) by SparkFun ([CC BY 2.0](https://creativecommons.org/licenses/by/2.0/deed.en)), and the [DS18B20](https://commons.wikimedia.org/wiki/File:Sensor_DS18B20.jpg) by Leonardo Postay (CC BY-SA 4.0). The microSD module illustration and the collage layout by the author. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en), following its photos |
| `bme-vs-bmp.jpg` | Wikimedia Commons photos: the [BME280 chip](https://commons.wikimedia.org/wiki/File:BME280.jpg) by Laserlicht (CC BY-SA 4.0) and the [BMP280 module](https://commons.wikimedia.org/wiki/File:BMP280Sensor.jpg) by AGermanBeck (CC BY-SA 4.0), both cropped; labels by the author. The package sizes and chip IDs from the Bosch datasheets. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en), following its photos |
| `wokwi-first-oled.png`, `wokwi-oled-layout.png`, `wokwi-bme280.png`, `wokwi-ds18b20.png`, `wokwi-microsd.png`, `wokwi-node1-display.png`, `wokwi-node-1-v4.png` | Screenshots of the [Wokwi](https://wokwi.com) simulator (October 2026) running this module's code and `diagram.json` files, cropped and rearranged. Markers and labels by the author. | © Wokwi (CodeMagic LTD); used for educational purposes. |

All the sketches in this module, including Node 1 v0.4.0, have been run in Wokwi with version 3 of the esp32 package and the library versions in the 🧰 table, and every intermediate step of the ➕ section has been checked with the compiler. The error messages quoted here follow the output of the GCC compiler in the esp32 package.

---

[⬅️ Module 6](../module-06-reading-sensors/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 8 — Robust Firmware: millis(), State Machines, Modular Code, Watchdog, & Debugging](../module-08-robust-firmware/README.md) ➡️**
