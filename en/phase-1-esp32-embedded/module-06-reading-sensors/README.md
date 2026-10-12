# Module 6 — Reading Sensors: Analog, Digital, & Calibration

🌐 **English** · [Bahasa Indonesia](../../../fase-1-esp32-embedded/modul-06-membaca-sensor/README.md)

*Phase 1 · Week 6 · Hardware: **Kit A Stage 1** (see 🧰) — every practice can also be tried in Wokwi · Prerequisite: **Module 5** (the two-breadboard workbench and Node 1 v0.2.0) · Time: 8–10 hours, spread over the week*

[⬅️ Module 5](../module-05-gpio-and-pin-map/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 7 ➡️](../module-07-sensor-bus-oled-schematics/README.md)

---

Last week, Node 1 got its "hands": relays, a pump, a servo, and a buzzer. But hands without senses can only wait for orders. This week we give Node 1 its **five senses**, so it can **feel** what's going on in the house by itself:

| Sense | Sensor | The question it answers |
| :--- | :--- | :--- |
| Skin | **DHT22** | What are the temperature and humidity of the air in the room? |
| Eyes | **LDR** | Is the room bright or dark? |
| Plant roots | **Capacitive soil sensor** | Is the soil in the pot still wet, or dry already? |
| Motion "radar" | **PIR** | Is someone walking by? |
| Echo ruler | **HC-SR04** | How much water is left in the pump's water tank? |

These five sensors "talk" in different ways: some put out a **voltage** (analog), some only say **yes/no** (digital), and some send **pulses or a string of data**. This week you learn to listen to all three, to turn their raw numbers into units that humans understand (°C, %, cm), and — most important of all — **to recognize when a sensor is "lying"**: a loose wire, a wobbly reading, or a number that hasn't been calibrated.

By the end of the week, Node 1 v0.3.0 has its first two automation rules: **automatic watering** when the soil is dry — which **refuses** to run the pump if there's only a little water left in the tank — and an **automatic lamp** when there's motion in the dark.

![Module 6 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations to Phase 5 Operations and scale; Phase 1 ESP32, Modules 5 to 9, is highlighted, Modules 1 to 5 are marked done, and Module 6 is marked YOU ARE HERE with the note five senses for Node 1. Bottom: the Module 6 box for this week, about 8 to 10 hours spread out, with Kit A Stage 1, holding eleven items: QW, Quick Win, a light sensor in Wokwi; P1, LDR and voltage divider; P2, noise, moving average, and the Serial Plotter; P3, calibrating the soil sensor with a glass of water; P4, DHT22 with a library; P5, the PIR motion sensor; P6, HC-SR04 and a voltage divider for the water tank level; P7, the five-sensor monitor; P8, automatic watering and automatic lamp; P9, saving to GitHub; and a plus sign, Add-on: Node 1 version 0.3.0 and PIN-MAP.md version 2. A star marks P3, P6, and P8 as part of the completion requirements](assets/roadmap-module-06.png)

> [!NOTE]
> **How to use this module.**
>
> - Every code box has a copy button in its top right corner. All the sketches are also available as files in the [`code/`](code/) folder, complete with `diagram.json` (and `libraries.txt` when needed) for Wokwi.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing.
> - **Don't have all the sensors yet?** Every practice can be tried in Wokwi. In Wokwi, the soil sensor is replaced by a **potentiometer** (Wokwi doesn't have a soil sensor yet), and you change the values of the other sensors by dragging a slider. The only things that can't be simulated are real-world matters: noise, the glass of water, and the multimeter. Those parts are clearly marked.
> - **This week the ESP32 board in Wokwi is turned sideways**: the USB connector on the left, the VIN…EN row of pins at the top, and the 3V3…D23 row at the bottom — exactly like the board on your breadboard. So the sensor wires in Wokwi go into the same row as on your desk.
> - macOS users: replace **Ctrl** with **Cmd** to save, copy, and paste.

> [!WARNING]
> **Three safety rules for this week.**
>
> 1. **Before you change any wire, turn off the MB102, then unplug the USB** (golden power rule 5 from Module 5). Turning things back on also has an order: plug in the USB first, then turn on the MB102.
> 2. **ESP32 pins can't tolerate 5 V.** Signals from sensors powered with 5 V (the PIR and the HC-SR04) may only reach a pin along a safe path: the PIR already puts out 3.3 V, while the HC-SR04's ECHO **must** go through a voltage divider (Concept 3). The DHT22, the LDR, and the soil sensor always get **3.3 V from the bottom rail**, never 5 V.
> 3. **Keep water away from electricity.** The glass of water for calibration and the pump's water tank sit on a tray, far from the breadboard, the adapter, and the laptop. The electronic part of the soil sensor (the top part with the chip and the connector) must not get wet (Concept 6).

This module has the same rhythm as Modules 1–5. Open the collapsible sections in 🚨 (click a title to expand it) only when you need them; the collapsible sections in 🔬 can be skipped. Every practice starts with a **🖥️** box that names the tools and parts it uses.

## Contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: your first light sensor, right in Wokwi (10 minutes)](#-quick-win-your-first-light-sensor-right-in-wokwi-10-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Node 1's five senses](#1-node-1s-five-senses-three-ways-sensors-talk) · [2 ADC](#2-the-adc-a-12-bit-ruler-and-its-limitations) · [3 Voltage divider](#3-the-voltage-divider-one-formula-two-uses) · [4 Noise](#4-noise-the-moving-average-and-the-100-nf-capacitor) · [5 Calibration](#5-from-raw-numbers-to-units-map-constrain-and-two-point-calibration) · [6 Soil sensor](#6-the-capacitive-soil-moisture-sensor) · [7 Datasheet](#7-reading-a-datasheet-five-things-to-look-for) · [8 DHT22](#8-dht22-the-single-wire-protocol-and-the-library) · [9 PIR](#9-pir-a-motion-sensor-that-just-says-yes-or-no) · [10 HC-SR04](#10-hc-sr04-measuring-distance-with-an-echo) · [11 Data contract](#11-the-data-contract-and-when-sensors-lie)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 LDR](#practice-1--ldr-and-voltage-divider-30-minutes) · [2 Noise & Serial Plotter](#practice-2--noise-the-moving-average-and-the-serial-plotter-25-minutes) · [3 Soil calibration ⭐](#practice-3--calibrating-the-soil-sensor-with-a-glass-of-water-30-minutes) · [4 DHT22](#practice-4--dht22-temperature-and-humidity-with-a-library-25-minutes) · [5 PIR](#practice-5--pir-the-motion-sensor-and-its-1-minute-warm-up-20-minutes) · [6 Water tank level ⭐](#practice-6--hc-sr04-and-the-voltage-divider-the-water-tank-level-40-minutes) · [7 Five-sensor monitor](#practice-7--five-sensor-monitor-one-neat-line-every-2-seconds-20-minutes) · [8 Automatic watering & lamp ⭐](#practice-8--automatic-watering-and-automatic-lamp-30-minutes) · [9 GitHub](#practice-9--save-to-github-15-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-6-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---
## 🎯 After this module you can…

- **Read three kinds of sensor output**: an analog voltage (`analogRead`), a yes/no digital signal (`digitalRead`), and pulses and strings of data (`pulseIn` and the DHT library).
- **Explain how the ESP32's 12-bit ADC works, including its limitations**, and make sure **all your analog sensors are on ADC1 pins**.
- **Build a voltage divider** for the LDR and for bringing the HC-SR04's 5 V ECHO signal down to about 3.4 V, which is safe for the ESP32 — then prove it with a multimeter.
- **Tame noise** with averaging and a 100 nF capacitor, then see the difference in the Serial Plotter.
- **Calibrate sensors** with two reference points: the soil sensor (air 0%, water 100%) and the water tank (empty 0%, full 100%), using `map()` and `constrain()`.
- **Read a sensor's datasheet** — just the parts that matter.
- **Fill in `struct SensorReading` exactly as the data contract says** (Syllabus Appendix A), and flag failed readings so nobody trusts them blindly.
- **Write two safe automation rules**: automatic watering that refuses to run the pump when the water tank is almost empty, and an automatic lamp.

---

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **The workbench from Module 5** | Two breadboards, the ESP32 board, the MB102 + a 5 V 2 A adapter + a USB A–A cable, and all the Node 1 parts (button, buzzer, servo, relay module, fan, pump + MOSFET). **Leave everything connected**; this week we only add sensors. The only thing you remove is the potentiometer on the lower breadboard (Practice 3). |
| **Kit A Stage 1 — the parts you start using this week** | A **DHT22** module (3 pins); a 5 mm **LDR**; a **capacitive** soil moisture sensor v1.2 or v2.0; an **HC-SR501** PIR motion sensor; an **HC-SR04** ultrasonic distance sensor (the regular version, the HC-SR04+/HC-SR04P, or the RCWL-1601 — in this module they're all wired the same way); a **100 nF** ceramic capacitor (printed with "104"); **10 kΩ** resistors (2) and a **4.7 kΩ** resistor (1); male–male and male–female jumper wires (about 10 male–male and 10–14 male–female). |
| **A container for the water tank** | A used plastic container, for example a 1-liter ice cream tub or a small basin, **at least 10 cm wide and 10 cm deep**. The pump from Module 5 moves into this container, and the HC-SR04 is mounted above it (Practice 6). A drinking glass is too narrow, because the echo bounces off its walls. Also have a piece of thick cardboard (or a spare ruler) ready as a "bridge" that holds the sensor above the container, some tape, and a ruler for measuring. |
| **A glass of water + a tray + a cloth** | For calibrating the soil sensor (Practice 3). A pot of soil (optional) for a real-world test. |
| **Soil sensor protection** (optional, highly recommended) | Heat-shrink tubing plus a hair dryer to shrink it, or clear nail polish, to coat the electronic part and the edges of the soil sensor board (Concept 6). A marker pen to mark the limit line. |
| **A small screwdriver** | A small flat-head or Phillips screwdriver for turning the PIR's knobs (Practice 5). |
| **Multimeter** | From Module 2. Used in Practices 1 and 6. |
| **Laptop + Arduino IDE 2 + a USB data cable** | Installed since Module 2. The Serial Plotter is already built into Arduino IDE; the new library is installed in Practice 4. |
| **Browser + Wokwi** | For the Quick Win and for trying each practice before you build it. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. The Serial Plotter is in the **Tools** menu. |
| **esp32 by Espressif Systems** board package | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. |
| **DHT sensor library** (Adafruit) | **1.4.7** | Installed in Practice 4. |
| **Adafruit Unified Sensor** library | **1.1.15** | A required companion of the DHT library; it's offered along with it when you install the DHT library. |
| **ESP32Servo** library | **3.2.1** | From Module 5; used again by Node 1. |

---

## 🏆 Quick Win: your first light sensor, right in Wokwi (10 minutes)

Last week, the ESP32 read a potentiometer knob with `analogRead()`. Now it reads a real sensor whose value can be **anything** in its range: the brightness of light. We start in Wokwi so you see the result right away, without building anything.

> 🖥️ **Tools used in this section:** a browser and the [Wokwi](https://wokwi.com) website. No kit needed, nothing to install.

1. Open **https://wokwi.com/projects/new/esp32** in your browser. An empty ESP32 project appears: code on the left, the board on the right.
2. Right-click the link [`code/module06_first_light/diagram.json`](code/module06_first_light/diagram.json) → **Open link in new tab**, then click the **Copy raw file** button (the two-squares icon) at the top right of the file contents. Go back to the Wokwi tab, click the **`diagram.json`** tab above the editor, select everything in it (**Ctrl + A**), then paste (**Ctrl + V**). On the right, the ESP32 board now lies sideways — just like on your breadboard — and above it stands a light sensor module whose AO pin goes down to the **VP** pin (its VCC and GND pins loop around to 3V3 and GND in the bottom row).
3. Click the **`sketch.ino`** tab, delete its contents, then paste this code:

   ```cpp
   // Module 6 - Quick Win: your first light reading
   // Light sensor (LDR) on VP (GPIO 36). The brighter it is, the SMALLER the raw number,
   // so we invert it: light = 4095 - raw (the brighter it is, the bigger the number).

   const int PIN_LDR = 36;  // VP: LDR (canonical pin map)

   void setup() {
     Serial.begin(115200);
     Serial.println("Light sensor ready. Change the brightness, then watch the numbers.");
   }

   void loop() {
     int raw = analogRead(PIN_LDR);  // 0 to 4095
     int light = 4095 - raw;         // inverted: the brighter it is, the bigger the number
     Serial.print("raw = ");
     Serial.print(raw);
     Serial.print("   light = ");
     Serial.println(light);
     delay(500);
   }
   ```

4. Click the green **▶** button. After `Light sensor ready. …` appears in the Serial Monitor (below the simulation panel), `raw = 1001   light = 3094` is printed every half second.
5. **Click the light sensor module** in the simulation panel. A small window titled `Photoresistor (LDR)` appears with an **ILLUMINATION (LUX)** slider — the brightness of the light in lux. Drag it to the left (dark), then to the right (bright), while you watch the Serial Monitor. Close that window with the **✕** in its right corner.

![Wokwi screenshot: the ESP32 board lying sideways with the light sensor module standing above it; the AO pin is connected to VP, while the VCC and GND pins loop around to the 3V3 and GND pins in the bottom row. Marker 1: the small red LDR at the top end of the module; the module was clicked, so the Photoresistor (LDR) window is open. Marker 2: the ILLUMINATION (LUX) slider dragged to the left, to about 10 lux. Marker 3: the Serial Monitor shows raw = 3413 and light = 682; before that, raw = 1001 and light = 3094](assets/wokwi-first-light.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

**Expected output**, roughly like this (the Wokwi slider can't always stop exactly on a round number, so your numbers may be slightly different):

| Slider position | Similar to | `raw` | `light` |
| :--- | :--- | ---: | ---: |
| about 1 lux | a dark bedroom at night | about 3938 | about 157 |
| about 10 lux | a dimly lit room | about 3413 | about 682 |
| 500 lux (starting position) | a well-lit room | 1001 | 3094 |
| about 10,000 lux | near a window in the daytime | about 156 | about 3939 |

Congratulations — your ESP32 can now "see" light and dark! Two things in that code deserve your attention:

- **`analogRead(PIN_LDR)`** reads the **voltage** on the VP pin and answers with a number from **`0` to `4095`**. The pin doesn't need `pinMode` first. Concept 2 explains where the number `4095` comes from.
- **The numbers run backward**: the brighter it is, the **smaller** `raw` gets. Concept 3 explains why. Because humans find "the brighter, the bigger" easier to think about, we invert it with `light = 4095 - raw`. The name `light` isn't a coincidence: our project's data contract (Syllabus Appendix A) uses the same column name.

Curious? Drag the slider all the way to the right (100,000 lux, as bright as the midday sun), then all the way to the left. Notice that near both ends the number barely moves, even though the brightness changes as much as tenfold. Sensors have limits too — this is one of the ways a sensor "lies", covered in Concept 11.

---
## 🧠 The "Why" Concepts

Eleven concepts, one per section — **you don't need to read them all at once**. Concepts and practices take turns, in this order:

1. Concepts 1–3 → Practice 1 (LDR)
2. Concept 4 → Practice 2 (noise and the Serial Plotter)
3. Concepts 5–6 → Practice 3 (calibrating the soil sensor)
4. Concepts 7–8 → Practice 4 (DHT22)
5. Concept 9 → Practice 5 (PIR)
6. Concept 10 → Practice 6 (HC-SR04 and the water tank level)
7. Concept 11 → Practices 7–9 (five-sensor monitor, automation rules, GitHub)
8. 🧩 Challenges → ➕ Mini Smart Home → 📝 Quiz → ✅ Checklist

At every switching point there's a ➡️ box (on to the practice) and a ⬆️ box (back to the concepts) with a link you just click.

> 🖥️ **Want to try the code in the Concepts section?** Not required — you'll run all the code in the Practices. The code in the Concepts is only snippets; the complete versions are in the Practice sketches, which you can try in Wokwi with the `diagram.json` from the [`code/`](code/) folder, exactly like the Quick Win.

### 1. Node 1's five senses: three ways sensors talk

A **sensor** is a component that turns something in the real world — brightness, heat, wetness, distance, motion — into an **electrical signal**. The ESP32 can't feel heat or see light; it can only read the electricity on its pins. So our job is to understand each sensor's "electrical language". There are three languages:

1. **Analog** — a voltage that can have **any value** between 0 and 3.3 V, like a faucet you can open little by little. As things get brighter, wetter, or farther away, the voltage shifts with them. The LDR and the soil sensor speak this language. The ESP32 reads it with **`analogRead()`** and answers with a number from `0` to `4095`.
2. **Digital** — only **two states**, HIGH or LOW, like a switch. The PIR speaks this language: HIGH = motion. The ESP32 reads it with **`digitalRead()`**, exactly like the button in Module 5.
3. **Pulses and data** — the signal is still digital (HIGH/LOW), but **the information is stored in its timing**. The HC-SR04 answers with a single pulse: the longer the pulse stays HIGH, the farther away the object is. The DHT22 sends a string of 40 short and long pulses that encode the temperature and humidity numbers. The ESP32 reads them with **`pulseIn()`** or with the help of a library.

| Sensor | Measures | Language | Pin (canonical pin map) | Power |
| :--- | :--- | :--- | :--- | :--- |
| **DHT22** | air temperature and humidity | digital data over a single wire | D14 | 3.3 V |
| **LDR** + 10 kΩ resistor | light and dark | analog (through a voltage divider) | VP (GPIO 36) | 3.3 V |
| **Capacitive soil sensor** | soil moisture | analog | VN (GPIO 39) | 3.3 V |
| **PIR HC-SR501** | the motion of people or animals | digital | D34 | 5 V (its output is still 3.3 V) |
| **HC-SR04** | distance, for the water tank level | pulse | TRIG on D15, ECHO on D35 (through a voltage divider) | 5 V |

Never seen these sensors before? This is what they look like — compare them with what's in your kit:

![Photo collage of the Node 1 sensors, titled Know your sensors. From the left: the DHT22 module, a white sensor with a grille on a small black board with three pins labeled plus, out, minus; a 5 millimeter LDR, a round orange head with a squiggly line and two long legs; the HC-SR501 PIR module seen from the back, a white board with blue printing and two orange knobs, the white dome behind it, and three pins with yellow bases; the blue HC-SR04 module with two metal mesh cylinders and four pins labeled Vcc, Trig, Echo, Gnd; and an illustration of the capacitive soil sensor, a long black board with a pointed tip. Caption: the real thing may look slightly different from one manufacturer to another](assets/photo-node-1-sensors.jpg)

*Photos: [Suyash Dwivedi](https://commons.wikimedia.org/wiki/File:AM2302_%28DHT22%29_digital_temperature_and_humidity_sensor_module.jpg) (DHT22, CC BY-SA 4.0), [Nevit Dilmen](https://commons.wikimedia.org/wiki/File:LDR_1480405_6_7_HDR_Enhancer_1.jpg) (LDR, CC BY-SA 3.0), [Sjilla](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg) (PIR, CC BY-SA 4.0), and [Nevit Dilmen](https://commons.wikimedia.org/wiki/File:HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg) (HC-SR04, CC BY-SA 3.0), all from Wikimedia Commons; soil sensor illustration and collage layout by the author. The photos were cropped and scaled down. Photo licenses: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en) and [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en); this collage is licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en).*

![The five Node 1 sensors grouped by language. Analog column: the LDR with a 10 kilohm resistor to VP, or GPIO 36, and the capacitive soil sensor to VN, or GPIO 39; both get 3.3 volts and are read by analogRead as a number from 0 to 4095. Digital column: the PIR HC-SR501 to D34, powered with 5 volts but putting out 3.3 volts, read by digitalRead as HIGH or LOW. Pulses and data column, read with pulseIn() or a library because the information is in the timing: the HC-SR04 for distance and the water tank level, with TRIG on D15 and ECHO through a voltage divider to D35, powered with 5 volts; and the DHT22 for air temperature and humidity on D14, powered with 3.3 volts. Bottom note: the analog pins are all on ADC1; ECHO goes through a voltage divider, so only about 3.4 volts are left; the signals that reach the ESP32 pins are always below the 3.6 volt limit](assets/five-sensors-node-1.png)

These pins have been **reserved** in `PIN-MAP.md` since Module 5, and every choice has a reason:

- **The LDR and the soil sensor on VP and VN** — both are ADC1 pins, the only analog reader that keeps working while Wi-Fi is on (Concept 2).
- **The PIR and ECHO on D34 and D35** — input-only pins that suit sensors. They were picked instead of VP/VN because of a note in the *ESP32 Series SoC Errata*: a digital input on GPIO 36 and 39 can be briefly pulled low while the ADC or Wi-Fi is active (Module 5).
- **The DHT22 on D14** — a safe pin that can be an input and an output; the DHT22 needs both (Concept 8).
- **TRIG on D15** — a strapping pin that's safe to use as an **output**. TRIG is only ever an output.

One more thing will keep coming up this week: **sensors can "lie"**. A loose wire, a wobbly number, an uncalibrated sensor, or a sensor that somebody forgot to power all still produce numbers — wrong numbers. Concept 11 teaches you how to tell honest numbers from lying ones.

### 2. The ADC: a 12-bit ruler and its limitations

The **ADC** (*Analog-to-Digital Converter*) is the part of the chip that measures the voltage on a pin and answers with a number. Picture a **ruler**: it runs from 0 to about 3.3 V, and it has **4,096** tick marks, numbered `0` to `4095`. The number 4,096 comes from **12 bits**: twelve 2s multiplied together (2 × 2 × … × 2 = 2¹² = 4,096). The tick marks are very close together, about 3.3 V ÷ 4095 ≈ 0.8 mV apart.

For a rough estimate, you can turn the raw number back into a voltage:

```cpp
float voltage = raw * 3.3 / 4095;  // rough estimate: 1001 -> about 0.81 V
```

Unfortunately, the ESP32's ADC ruler **isn't perfect**. There are four things you should know:

1. **Its ends are blunt.** With the default settings, the ESP32's ADC only reads well between about 0.15 V and about 3.1 V. Every voltage below about 0.15 V reads as `0`, and everything above about 3.1 V is already `4095`. Even in the middle, the tick marks aren't perfectly evenly spaced (the ruler is **not linear**). On a real board, the numbers usually come out a little smaller than a straight ruler would give, and they differ from chip to chip: the same voltage might read `1850` on one board and `1950` on another. For decisions like "dark or bright", or for percentages calibrated against real conditions (Concept 5), that doesn't matter. If you need a more accurate voltage, there's `analogReadMilliVolts()` (🔬).
2. **The numbers wobble.** Even when the voltage holds still, consecutive readings can differ by anything from about ten to several dozen. This is **noise** (Concept 4).
3. **ADC2 goes on strike while Wi-Fi is on.** The ESP32 has two ADCs. ADC2 (GPIO 0, 2, 4, 12–15, 25–27; GPIO 0 isn't broken out on 30-pin boards) is borrowed by the Wi-Fi radio, so `analogRead()` on those pins fails while Wi-Fi is on — and from Module 10 on, Wi-Fi is always on. That's why **all of our project's analog sensors are on ADC1**: GPIO 32–39, which on our board means GPIO 32, 33, 34, 35, 36 (VP), and 39 (VN).
4. **The voltage limit.** ESP32 pins are designed for 3.3 V at most. According to the ESP32 datasheet, the upper limit for an input voltage is 3.3 V + 0.3 V = **3.6 V**. A 5 V signal has to be brought down first (Concept 3).

![The ESP32's 12-bit ADC ruler, an approximate drawing. The voltage axis from 0 to 3.3 volts is mapped to the numbers 0 to 4095. The gray dashed line is the ideal straight ruler, the same way Wokwi calculates; a blue dot marks the example, 0.81 volts is about 1001. The red line of the real ESP32 is flat at 0 below about 0.15 volts, then runs slightly below the ideal line for most of the range, rises more steeply near 3.1 volts, and is flat at 4095 above that. Beside it, a green ADC1 box labeled keeps working while Wi-Fi is on: GPIO 32, 33, 34, 35, 36 or VP for the LDR, and 39 or VN for the soil sensor, with the note GPIO 34 to 39 are input only; a gray ADC2 box labeled goes on strike while Wi-Fi is on: GPIO 0, 2, 4, 12 to 15, and 25 to 27, with the note GPIO 0 isn't broken out on 30-pin boards; and a red box, the pin voltage limit, 3.3 plus 0.3 equals 3.6 volts](assets/adc-ruler.png)

> [!IMPORTANT]
> **Completion requirement: all your analog sensors are on ADC1 pins.** On Node 1, the LDR is on **VP (GPIO 36)** and the soil sensor on **VN (GPIO 39)** — both ADC1. If you ever add another analog sensor, pick it from GPIO 32–39 too, and check `PIN-MAP.md` first.

In Wokwi, the ADC is simulated as a perfectly straight, calm ruler. So for the same situation, the numbers in Wokwi and on a real board can differ by up to about 200 — that's normal. On a real board, the raw number is usually a little smaller than the straight-ruler calculation.

### 3. The voltage divider: one formula, two uses

An **LDR** (*Light Dependent Resistor*) is a resistor whose resistance changes with the light. In a lit room, its resistance is a few kilohms; in total darkness it can be 1 MΩ (one million ohms) or more. The common GL5528 type, for example, has a resistance of about 10–20 kΩ at 10 lux. The problem: **the ESP32 can't measure resistance** — only voltage. So we turn that resistance into a voltage with a **voltage divider**.

A voltage divider is just **two resistors connected in series** between a voltage source and GND. The same current flows through both, and the voltage is **split in proportion to their resistances**: the resistor with the larger resistance gets a bigger share of the voltage. The voltage at the junction in the middle equals the share that the bottom resistor receives:

```text
V_mid = V_in × R_bottom ÷ (R_top + R_bottom)
```

**Use 1: the LDR.** In our circuit, a **10 kΩ** resistor is on top (to 3.3 V) and the **LDR** on the bottom (to GND), and the midpoint goes to VP:

| Condition | LDR resistance (approx.) | Midpoint voltage | `raw` (approx.) | `light` (approx.) |
| :--- | ---: | ---: | ---: | ---: |
| Near a window, daytime | 1 kΩ | 3.3 × 1 ÷ 11 = 0.30 V | 370 (real board: about 200) | 3725 |
| A lit room | 5 kΩ | 3.3 × 5 ÷ 15 = 1.10 V | 1365 | 2730 |
| Dim | 20 kΩ | 3.3 × 20 ÷ 30 = 2.20 V | 2730 | 1365 |
| A dark bedroom | 200 kΩ | 3.3 × 200 ÷ 210 = 3.14 V | 3897 (real board: stuck at 4095) | 198 (real board: 0) |

*(The `raw` numbers are calculated with the straight ruler, `voltage × 4095 ÷ 3.3`; your real board will be slightly different.)*

Now you know why the numbers in the Quick Win ran backward: the brighter it is, the smaller the LDR's resistance, so the bottom resistor gets a **smaller** share of the voltage. If the LDR were on top and the 10 kΩ resistor on the bottom, the number would go up in brighter light instead. We picked the first arrangement on purpose, because the light sensor module in Wokwi is arranged the same way, so the same sketch works in Wokwi and on a real board.

**Use 2: bringing the 5 V ECHO signal down.** The HC-SR04 is powered with 5 V, so the pulse on its ECHO pin is 5 V too — too high for an ESP32 pin. The **same** formula comes to the rescue: a **4.7 kΩ** resistor on top (from ECHO) and a **10 kΩ** resistor on the bottom (to GND):

```text
V_mid = 5 V × 10 ÷ (4.7 + 10) = 5 × 10 ÷ 14.7 ≈ 3.40 V
```

A voltage of 3.40 V is below the 3.6 V limit, but still high enough to be read as HIGH (the ESP32 treats anything from about 0.75 × 3.3 V ≈ 2.5 V up as HIGH). If the two resistors are **swapped**, the result is 5 × 4.7 ÷ 14.7 ≈ 1.60 V: safe, but below the guaranteed HIGH threshold (about 2.5 V), so the pulse may not be read at all (`No echo`) or may be read erratically (the distance jumps around). If you **forget the 10 kΩ resistor**, the pin receives 5 V through the 4.7 kΩ resistor — exactly what we must prevent. That's why, in Practice 6, the voltage divider is measured with a multimeter before you trust it.

![Two voltage dividers with the same formula. Left, the LDR divider: 3.3 volts to a 10 kilohm resistor on top, the midpoint to VP or GPIO 36, then the LDR on the bottom to GND; in bright light the LDR is about 1 kilohm, so the midpoint is about 0.30 volts, in the dark about 200 kilohms, so about 3.14 volts. Right, the ECHO divider: the 5 volt pulse from the HC-SR04's ECHO pin to a 4.7 kilohm resistor on top, the midpoint to D35, then a 10 kilohm resistor on the bottom to GND; the result is about 3.40 volts, below the 3.6 volt limit and above the HIGH threshold of about 2.5 volts. Above both drawings is the formula V mid equals V in times R bottom divided by R top plus R bottom. Note at the bottom right: if the resistors are swapped, the result is about 1.60 volts, safe, but below the HIGH threshold](assets/voltage-divider.png)

> ➡️ **Ready to practice?** Continue to [Practice 1 — LDR and voltage divider](#practice-1--ldr-and-voltage-divider-30-minutes). When you're done, come back to [Concept 4](#4-noise-the-moving-average-and-the-100-nf-capacitor).

### 4. Noise, the moving average, and the 100 nF capacitor

In Practice 1 you'll see it for yourself: even when nobody touches the LDR and the lights stay the same, the `raw` number on a real board never holds still. It wobbles up and down by anything from about ten to several dozen. That random wobble is called **noise**. It comes from many sources: the Wi-Fi radio inside the ESP32 itself, small ripples in the power supply, long jumper wires that "pick up" interference like an antenna, and — for the LDR in particular — the electric lights in your house, which actually flicker 100 times per second: too fast for the eye, but not for a sensor.

Noise looks harmless, but it can cause trouble. Picture an automatic lamp with a dark threshold of `1000`: if the light reading wobbles between `990` and `1010`, the lamp might switch on and off again and again. There are three cures, and this week we use all three:

**1. A quick average** (*oversampling*). Read the sensor 20 times quickly in a row, then take the average. The upward and downward wobbles cancel each other out. This is used in Practice 3 and in Node 1:

```cpp
// Averages 20 analog readings in a row to smooth out the noise.
int readAnalogAverage(int pin) {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(pin);
    delay(2);
  }
  return sum / 20;
}
```

**2. A moving average.** Keep the **last 10 readings** in an array — the row of numbered drawers from Module 3. Every time a new reading comes in, the drawer holding the **oldest** reading is overwritten, and the average of all ten drawers is calculated again. The result is a smooth line that still follows real changes, just a little late. The drawer number goes around 0, 1, 2, …, 9 and back to 0, thanks to the `%` operator (remainder, Module 3):

```cpp
sum -= history[position];                  // take the oldest reading out of the sum,
history[position] = raw;                   // overwrite its drawer with the new reading,
sum += raw;                                // then add the new reading to the sum
position = (position + 1) % SAMPLE_COUNT;  // next drawer; after drawer 9, back to 0
int average = sum / SAMPLE_COUNT;
```

The more drawers, the smoother the line, but the slower it follows changes. Ten drawers at 20 readings per second means the average of the last half second — enough for the sensors in a house.

**3. A 100 nF capacitor** — the hardware cure. A small ceramic capacitor printed with "104" goes between the midpoint of the voltage divider (the point that goes into the ADC pin) and GND. In Module 5, a 100 µF capacitor was a "small reservoir" that held back the servo's current surges; here a much smaller capacitor acts as a **shock absorber** for the voltage: it soaks up fast spikes before they reach the ADC. Espressif itself, the maker of the ESP32 chip, recommends a 100 nF capacitor on the ADC pin plus repeated readings (*multisampling*, the same as the quick average above) to reduce noise. The marking "104" means the digits 10 followed by four zeros, in picofarads: 100,000 pF = 100 nF. Ceramic capacitors have no polarity, so their legs can go either way.

![Graph of noise and a moving average. The horizontal axis is time, about 6 seconds; the vertical axis is the analogRead number, about 1950 to 2150. A thin jagged line labeled raw wobbles roughly plus or minus 30 around 2000; in the middle of the graph its value jumps up to about 2100 because a hand covers the LDR. A thick smooth line labeled average of 10 readings runs through the middle of the wobble and rises more gently, about half a second after the jump. Below the graph, ten drawers numbered 0 to 9 with a position arrow that wraps back to 0 after drawer 9, labeled the oldest drawer is overwritten by the new reading. On the right, a ceramic capacitor printed with 104 between the divider midpoint and GND, labeled 100 nF shock absorber](assets/noise-moving-average.png)

To see noise clearly, numbers alone don't help much. Arduino IDE has a **Serial Plotter** that draws the numbers coming in over Serial as lines on a graph — we use it in Practice 2.

> ➡️ **Ready to practice?** Continue to [Practice 2 — Noise, the moving average, and the Serial Plotter](#practice-2--noise-the-moving-average-and-the-serial-plotter-25-minutes). When you're done, come back to [Concept 5](#5-from-raw-numbers-to-units-map-constrain-and-two-point-calibration).

### 5. From raw numbers to units: `map()`, `constrain()`, and two-point calibration

Numbers like `2915` or `1301` mean nothing to a human. What we want to know is "soil moisture 37%" or "the water tank is 64% full". Turning raw numbers into real units is called **calibration**, and the simplest way to do it is **two-point calibration**:

1. Measure the raw number in **two situations whose answers we know**. For the soil sensor: in air (the driest, which we call 0%) and in water (the wettest, 100%).
2. Draw a **straight line** between those two points. Every situation in between can be translated with that line.

The **`map()`** function from Module 5 does exactly the second step. For example, say your soil sensor reads `3000` in air and `1300` in water:

```cpp
int percent = map(raw, 3000, 1300, 0, 100);  // 3000 -> 0, 1300 -> 100, 2150 -> 50
```

The "backward" order (from `3000` down to `1300`) is no problem: `map()` still draws the line from the first point to the second. Inside, `map()` just calculates this formula with **whole numbers** (the fraction is thrown away — remember Surprise 1 in Module 3):

```text
result = (value − fromA) × (toB − toA) ÷ (fromB − fromA) + toA
```

One important trap: **`map()` doesn't fence its result in.** If the air is very dry one afternoon and the sensor reads `3500` — drier than during calibration — `map()` answers `-29`. If the sensor is pushed in too deep and reads `1000`, the answer is `117`. A moisture of −29% or 117% obviously makes no sense. That's why the result of `map()` is always fenced in with **`constrain()`** (also from Module 5):

```cpp
int soil = constrain(percent, 0, 100);  // -29 becomes 0, 117 becomes 100
```

![Two-point calibration of the soil sensor. The horizontal axis is the raw number from 0 to 4095; the vertical axis is labeled soil moisture in percent. A red dry point at raw 3000, 0 percent, labeled in air; a blue wet point at raw 1300, 100 percent, labeled in water. A straight line connects the two; the midpoint, 2150, becomes 50 percent. Beyond the two points, a dashed line continues to minus 29 percent at 3500 and 117 percent at 1000, labeled map() result only; thick horizontal lines at 0 and 100 percent are labeled after constrain](assets/two-point-calibration.png)

Two more notes:

- **Every sensor is different**, even two sensors from the same bag. The numbers `3000` and `1300` above are just examples; you'll measure your own in Practice 3, then write them into the code as constants.
- **`map()` only works with whole numbers.** For decimal numbers, such as a distance of 12.4 cm, we write the same formula ourselves with `float` (Practice 6).

### 6. The capacitive soil moisture sensor

There are two kinds of cheap soil moisture sensors. The **resistive** kind has two bare metal prongs and measures the current that flows through the soil. The problem: metal carrying a current in wet soil rusts quickly — sometimes within weeks. This curriculum uses the **capacitive** kind (v1.2 or v2.0), which has **no exposed metal** at all.

**How it works.** Inside the long part of the board are two copper areas covered by the board's coating. Together they form a **capacitor**, and the soil around them becomes the "filling" between the two areas. Water is much better at storing electric charge than air (about 80 times better), so the wetter the soil, the larger the capacitor's value. A small timer chip (from the 555 family) at the top of the board turns the size of that capacitor into a voltage on the **AOUT** pin: **the wetter, the lower the voltage**. Just like the LDR, the numbers run backward — and `map()` from Concept 5 sorts that out.

On an ESP32 with a 3.3 V supply, the sensor usually reads about `2800`–`3300` in air, and about `1200`–`1600` in water. The exact numbers differ for every sensor. That's why every sensor must be calibrated.

| Pin (printed on the board) | Connected to | Notes |
| :--- | :--- | :--- |
| **GND** | bottom rail (−) | |
| **VCC** | bottom rail (+), 3.3 V | The sensor works on 3.3–5.5 V; its output is about 3 V at most. |
| **AOUT** | VN (GPIO 39) | Analog output. |

**Protecting its electronics.** Only the long part may go into soil or water. The top part — where the chip, the small components, and the cable connector are — **isn't waterproof**. The sensor's maker warns against pushing the sensor in past the limit line printed on the board (some sensors have no line; in that case, draw your own 2 cm below the electronics zone). Four good habits:

1. **Push it in only up to the limit line.** When you water the plant, water the soil, not the top of the sensor.
2. **Coat the top part** with heat-shrink tubing, heated until it shrinks, or paint it with **clear nail polish**. Also paint the cut **edges of the board** along the part that goes into the soil: the board's fibers at the edges soak up water and make the reading drift slowly.
3. **Make a drip loop**: let the sensor cable dip a little lower than its connector before it rises to the breadboard, so water drips off the lowest point of the cable instead of creeping into the connector.
4. **Don't leave the sensor in water for hours** during calibration; a few dozen seconds is enough.

![Illustration of a capacitive soil moisture sensor v1.2 standing upright. The top part is labeled electronics zone, keep it dry, and holds an eight-pin timer chip marked TLC555, a small regulator, and a three-pin connector labeled GND, VCC, AOUT. Below it, a white line labeled limit line, don't push it in past this line. The long part below is labeled sensing zone, may go into soil or water, no exposed metal. Beside it, three ways to protect it (the colors are only markers): heat-shrink tubing covering the electronics zone, clear nail polish on the cut edges of the board, and a cable with a drip loop. Bottom note: if the chip is marked NE555, the sensor may not work at 3.3 volts](assets/capacitive-soil-sensor.png)

**Watch out for sensors with "factory defects".** This sensor is widely copied, and some of the copies have problems:

- **The timer chip is an NE555**, not a TLC555. Look at the marking on the eight-pin chip at the top of the sensor. The NE555 needs at least 4.5 V, but the regulator on the sensor board only gives it about 3 V, so the sensor may not work at all — the number barely changes between air and water.
- **The 1 MΩ resistor on its output line isn't connected**, so the reading changes very slowly.

Kit A contains **two** soil sensors (one of them is for Node 2 in Module 14), so if the first one is faulty, try the second.

Finally, remember that this sensor's percentage is **relative**: the type of soil, how tightly packed it is, and its temperature also affect the reading. For decisions like "dry, needs watering" or "still wet", that's more than enough.

Wokwi doesn't have a soil sensor yet, so a **potentiometer** takes its place: turning the knob is the same as making the soil wetter or drier.

> ➡️ **Ready to practice?** Continue to [Practice 3 — Calibrating the soil sensor with a glass of water](#practice-3--calibrating-the-soil-sensor-with-a-glass-of-water-30-minutes). When you're done, come back to [Concept 7](#7-reading-a-datasheet-five-things-to-look-for).

### 7. Reading a datasheet: five things to look for

A **datasheet** is the official document from a component's maker: its size, its voltage limits, and how to use it. It's usually a PDF in English, 5–30 pages long, full of tables and graphs. The good news: a beginner only needs to look for **five things**. In parentheses are the keywords that usually appear in a datasheet, so you can find them easily with **Ctrl + F**:

1. **Operating voltage** (*operating voltage*, *power supply*, VCC, VDD) — how many volts may this sensor be given?
2. **Output type and level** (*output signal*, *logic level*) — is the output analog, digital, or pulses? How many volts high? If it's more than 3.3 V, you need a voltage divider.
3. **Range and accuracy** (*range*, *accuracy*, *resolution*) — what can it measure, from what to what, and how far off can it be at most?
4. **Timing** (*sampling period*, *trigger pulse*, *response time*, *initialization*) — how long a pause does it need between readings? Does it need a warm-up?
5. **Pins** (*pin definition*, pinout) — which pin does what? Still check against the labels on your own module: the pin order of a **module** can differ between manufacturers even when the sensor is the same.

You can write what you find as a "summary card". Here are the summary cards for this week's five sensors, taken from their datasheets (the links are in 📚):

| Sensor | Operating voltage | Output | Range and accuracy | Timing that matters |
| :--- | :--- | :--- | :--- | :--- |
| DHT22 (AM2302) | 3.3–5.5 V (5 V recommended) | digital, single wire | −40 to 80 °C, ±0.5 °C; 0–100%RH (relative humidity), ±2%RH | at least 2 seconds between readings |
| HC-SR04 | 5 V | an ECHO pulse as high as its supply voltage (5 V!) | 2 cm to 4 m | a 10 µs TRIG pulse; at least 60 ms between measurements |
| PIR HC-SR501 | 4.5–20 V | HIGH 3.3 V, LOW 0 V | a range of about 3–7 m, a viewing angle of up to 110° | a warm-up of about 1 minute; HIGH lasts about 5 seconds to 5 minutes |
| Capacitive soil sensor v1.2 | 3.3–5.5 V | analog 0–3 V | relative, must be calibrated | — |
| LDR GL5528 | — (a passive component) | a resistance | 10–20 kΩ at 10 lux; 1 MΩ or more in total darkness | takes 20–30 ms to change |

![DHT22 datasheet summary card. Left, a mock-up of an English datasheet page with five parts highlighted in color: Power supply 3.3 to 5.5 V DC (recommended 5 V), Output signal digital signal via single-bus, Measuring range, Accuracy, and Resolution, Sensing period average 2 s, and a drawing of four pins numbered 1 VDD, 2 DATA, 3 NULL, 4 GND. Right, a summary card with five matching numbered rows: operating voltage 3.3 to 5.5 volts, 5 volts recommended, 3.3 volts in this curriculum; output digital, single wire; range minus 40 to 80 degrees Celsius plus or minus 0.5 degrees and 0 to 100 percent plus or minus 2 percent; timing at least 2 seconds between readings; pins a 3-pin module, read the labels on your module. Note: this picture is a summary in our own words, not a copy of the datasheet](assets/datasheet-dht22.png)

Notice one interesting detail in the DHT22 row: its maker **recommends 5 V**, but we give it **3.3 V**. Both are within its operating voltage range, and we have a strong reason to choose 3.3 V (Concept 8). That's what reading a datasheet is for: you learn the safe limits, then choose what fits your circuit best.

One more thing people often get wrong: **resolution isn't accuracy**. The DHT22 shows the temperature in steps of 0.1 °C (resolution), but its reading can be off by up to ±0.5 °C from the real temperature (accuracy). The 🔬 section goes into this further.

### 8. DHT22: the single-wire protocol and the library

The **DHT22** (also sold as the AM2302; it's **white**) measures air temperature and humidity. Inside its case are a humidity sensor, a temperature sensor, and a small chip that measures both and sends the result as **digital data** over **just one wire**. The same wire is used in both directions, taking turns, like a conversation over a *walkie-talkie*:

1. **The ESP32 knocks**: it pulls the DATA wire LOW for at least 1 ms ("hello, please measure"), then lets go.
2. **The DHT22 answers**: LOW for 80 µs, then HIGH for 80 µs ("ready, here's the data").
3. **The DHT22 sends 40 bits.** Each bit starts with LOW for 50 µs, then HIGH. A **short** HIGH (about 26 µs) means **0**, a **long** HIGH (about 70 µs) means **1**.
4. Those forty bits are **16 bits of humidity + 16 bits of temperature + an 8-bit *checksum***. A *checksum* is a check number: the sum of the earlier parts. If the sum doesn't match, some bit got damaged along the way, and that reading is thrown away.

The whole conversation is over in about 5 ms. That's why the DHT22 needs a pin that can be both an **output** (to knock) and an **input** (to hear the answer) — and D14 can do both.

![Timing diagram of the DHT22's conversation over a single wire. The DATA signal line from left to right: the ESP32 knocks part, LOW for at least 1 millisecond, then released HIGH for 20 to 40 microseconds; the DHT22 answers part, LOW for 80 microseconds, then HIGH for 80 microseconds; then a row of bits, each starting with LOW for 50 microseconds, with a short HIGH of about 26 microseconds labeled bit 0 and a long HIGH of about 70 microseconds labeled bit 1. Below it, the 40 bits are split into three boxes: 16 bits of humidity, 16 bits of temperature, and an 8-bit checksum. Note: about 5 milliseconds in total, not to scale](assets/dht22-single-wire.png)

Timing things in microseconds like that is exhausting, so we use a **library**: the **DHT sensor library** made by Adafruit, which needs a companion called **Adafruit Unified Sensor**. Using it takes only a few lines:

```cpp
#include <DHT.h>

DHT dht(14, DHT22);  // DATA pin on GPIO 14, the sensor type is DHT22

// in setup():
dht.begin();

// in loop(), at most once every 2 seconds:
float temperature = dht.readTemperature();  // degrees Celsius
float humidity = dht.readHumidity();        // percent
```

Three ground rules for the DHT22:

- **At least 2 seconds between readings.** If you ask sooner, the library doesn't measure again; it returns the previous reading.
- **If a reading fails, the answer is `NAN`** (*Not a Number*): the DATA wire is loose, the sensor has no power yet, or the *checksum* doesn't match. `NAN` can't be compared like an ordinary number, so we check for it with the **`isnan()`** function: `if (isnan(temperature)) { … }`.
- **The 3-pin module already has a pull-up resistor** (usually 10 kΩ) from DATA to VCC, so the DATA wire stays HIGH when nobody is talking. As a result, the voltage on the DATA wire **equals the module's VCC**. If the module gets 5 V, pin D14 gets 5 V too — that's why our DHT22 module **always gets 3.3 V**.

The order and labels of the pins on 3-pin modules vary from one manufacturer to another — some are labeled "+ out −", some "VCC DATA GND", and some use "S" for signal. Always read the labels on your own module. One more thing: if your sensor is **blue**, it's a **DHT11**, its cheaper, less accurate sibling. This curriculum uses the DHT22, but the same library can read a DHT11 if you replace `DHT22` with `DHT11` in the code.

> ➡️ **Ready to practice?** Continue to [Practice 4 — DHT22: temperature and humidity with a library](#practice-4--dht22-temperature-and-humidity-with-a-library-25-minutes). When you're done, come back to [Concept 9](#9-pir-a-motion-sensor-that-just-says-yes-or-no).

### 9. PIR: a motion sensor that just says "yes" or "no"

Every warm object — including your body — gives off **infrared rays**, "heat light" that the eye can't see. A **PIR** (*Passive Infrared*) sensor doesn't send out anything; it only **receives**. Behind its white dome is a sensor split in two. When a warm object **moves** across its view, the two halves receive different amounts of heat, and the circuit on the board turns that difference into a **HIGH** signal on the **OUT** pin. The white dome is a **Fresnel lens**: a ridged lens that splits the sensor's view into many "tiles", so movement from tile to tile is easy to detect. Because it only detects motion, a person who stands still stops being detected after a while.

The **HC-SR501** module we use:

- Gets **5 V from the top rail** (MB102). Its operating voltage range is 4.5–20 V, so 3.3 V isn't enough.
- Its output is **HIGH 3.3 V** (the PIR board has its own 3.3 V regulator) and **LOW 0 V**, so the OUT pin is **safe to connect directly** to D34, without a voltage divider.
- Needs a **warm-up** of about **1 minute** after it gets power. During that time, OUT may go HIGH on its own a few times. Stay away from the front of the sensor while you wait.

On the back of the board are three adjusters:

| Adjuster | What it does | Suggestion for this module |
| :--- | :--- | :--- |
| **Sx** knob (sensitivity) | The detection range, roughly 3–7 m. | First turn it fully **counterclockwise**: a range of about 3 m is enough for testing on a desk. |
| **Tx** knob (time) | How long OUT stays HIGH after motion, roughly 5 seconds to 5 minutes. | Turn it fully **counterclockwise** (seen from the back of the board); on most modules, that's the shortest time (about 5 seconds), which makes testing easy. Later, for a real lamp, make it longer, for example 1 minute. |
| **H / L** jumper or solder pads | **H**: retriggerable — OUT stays HIGH as long as there's still motion. **L**: single trigger — OUT goes back to LOW when the Tx time runs out, even if the motion continues. | **H** (usually the default; the solder pads are usually connected to H at the factory). |

After OUT goes back to LOW, the PIR is "blind" for about 2.5 seconds and can't detect anything. That's normal.

![Photo of the HC-SR501 PIR module from the back with three markers. Marker 1 on the two orange knobs: Sx sets the distance, about 3 to 7 meters, Tx sets how long it stays HIGH, about 5 seconds to 5 minutes, and the order of the knobs differs between manufacturers. Marker 2, a ring in the top right corner, circles the L and H option: H means retriggerable, usually the default; it's either a yellow jumper or solder pads labeled L and H, as in the photo. Marker 3 on the three pins at the bottom edge, VCC, OUT, and GND; the labels are on the front side and are often hidden by the dome. Right, a graph of the OUT pin to D34: LOW, rising to HIGH 3.3 volts when there's motion, staying there for the Tx time, dropping to LOW, then blind for about 2.5 seconds. Bottom strip: after power-up, a warm-up of about 1 minute, and OUT may go HIGH on its own](assets/pir-anatomy.jpg)

*Photo: [Sjilla](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg), Wikimedia Commons, CC BY-SA 4.0; markers and graph by the author. The photo was cropped and scaled down. This combined image is licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en).*

The VCC, OUT, and GND labels are usually hidden under the dome. **Gently take the dome off** (just pull it straight up; it's only clipped on) to read them, then put it back. The pin order isn't always the same between manufacturers. The same goes for the Sx and Tx labels: they aren't always printed, and the order of the two knobs varies. That's fine — in Practice 5 you'll identify the Tx knob by testing.

Reading a PIR is as easy as reading a button: `digitalRead(34) == HIGH` means motion. In Wokwi, the PIR module has a **Simulate motion** button that makes OUT HIGH for 5 seconds, with no warm-up needed.

> ➡️ **Ready to practice?** Continue to [Practice 5 — PIR: the motion sensor and its 1-minute warm-up](#practice-5--pir-the-motion-sensor-and-its-1-minute-warm-up-20-minutes). When you're done, come back to [Concept 10](#10-hc-sr04-measuring-distance-with-an-echo).

### 10. HC-SR04: measuring distance with an echo

Ever shouted in a cave and heard the echo? The farther away the cave wall, the longer the echo takes to come back. The **HC-SR04** works exactly like that — and bats have been using this trick for millions of years. The sensor's two "eyes" are actually a speaker (T, *transmitter*) and a microphone (R, *receiver*) for **ultrasound**: sound at 40,000 vibrations per second (40 kHz), far above the limit of human hearing.

1. The ESP32 sends a **10 µs HIGH** pulse to the **TRIG** pin — the "shout" command.
2. The sensor sends out eight ultrasonic vibrations, then raises the **ECHO** pin to HIGH while it waits.
3. As soon as the echo comes back, ECHO drops to LOW again. **How long ECHO stays HIGH = the time the sound takes to reach the object and come back.**

The speed of sound in air is about 343 m/s (at 20 °C), or 0.0343 cm per microsecond. Because the sound travels there and back, the distance is half the trip:

```text
distance (cm) = ECHO time (µs) × 0.0343 ÷ 2 = ECHO time (µs) ÷ 58 (approximately)
```

That number 58 is also the one given in the HC-SR04 datasheet. For example, ECHO HIGH for 580 µs means 10 cm.

The ESP32 measures how long a pulse lasts with **`pulseIn()`**:

```cpp
unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);  // microseconds; gives up after 30 ms
if (duration == 0) {
  // no echo: too far, blocked, or a loose wire
}
float distance = duration / 58.0;
```

`pulseIn()` waits for ECHO to go HIGH, counts how many microseconds it stays HIGH, then answers with that number. If no pulse arrives within 30,000 µs (30 ms, the equivalent of a distance of about 5 m), it gives up and answers `0`.

**Its limits.** The HC-SR04 measures from 2 cm to 4 m. Its sound beam is narrow (about 15°) and bounces back best from a flat surface that faces the sensor squarely — and a water surface is a good reflector. Slanted or soft surfaces (cloth, foam) can deflect or absorb the sound. Leave at least 60 ms between measurements so an old echo doesn't get mixed up with a new one.

**Measuring how full the water tank is.** The sensor is mounted **above the tank, facing down**. The fuller the tank, the closer the water surface and the shorter the distance. This is two-point calibration again (Concept 5):

- **`DISTANCE_EMPTY`** — the distance from the sensor to the bottom of the container (an empty tank, 0%).
- **`DISTANCE_FULL`** — the distance from the sensor to the water surface when the tank is full (100%). Leave at least 3 cm between the sensor and the water, because the HC-SR04 can't measure distances that are too short.

```text
water level (%) = (DISTANCE_EMPTY − distance) ÷ (DISTANCE_EMPTY − DISTANCE_FULL) × 100
```

For example, `DISTANCE_EMPTY` is 20 cm and `DISTANCE_FULL` is 5 cm. If the sensor measures 12.4 cm, the tank is (20 − 12.4) ÷ 15 × 100 ≈ 50% full.

![How the HC-SR04 works and how the water tank is measured. Top left, a timing diagram: TRIG gets a 10 microsecond HIGH pulse, the sensor sends out eight 40 kilohertz vibrations, then ECHO is HIGH for the sound's round trip, for example 580 microseconds for 10 centimeters; the formula distance equals ECHO time divided by 58. Right, the HC-SR04 above a water tank container holding water and the pump, facing down, taped under a cardboard bridge across the container's opening; a DISTANCE_EMPTY arrow from the sensor to the bottom of the container, 20 centimeters; a DISTANCE_FULL arrow from the sensor to the water surface when full, 5 centimeters; an arrow for the current distance to the water surface, 12.4 centimeters; the result, a water level of about 50 percent. Note: leave at least 3 centimeters between the sensor and the water, and the 5 volt ECHO pin must go through a voltage divider](assets/hc-sr04-echo.png)

**About the voltage.** The regular HC-SR04 needs 5 V, and its ECHO pulse is 5 V too — that's why ECHO **must** go through the 4.7 kΩ + 10 kΩ voltage divider (Concept 3). Some versions can work on 3.3 V, such as the HC-SR04+ (or HC-SR04P) and the RCWL-1601; with 3.3 V, their ECHO is 3.3 V too. So that every learner has the same circuit, **in this curriculum every version gets 5 V from the top rail, and its ECHO always goes through the voltage divider**. That's safe and works for every version.

The speed of sound also depends on the air temperature (it rises by about 0.6 m/s for every 1 °C). In an ordinary room, the effect on our water tank is only a few millimeters. The 🔬 section shows how to use the DHT22's temperature to correct for it.

> ➡️ **Ready to practice?** Continue to [Practice 6 — HC-SR04 and the voltage divider: the water tank level](#practice-6--hc-sr04-and-the-voltage-divider-the-water-tank-level-40-minutes). When you're done, come back to [Concept 11](#11-the-data-contract-and-when-sensors-lie).

### 11. The data contract and when sensors "lie"

Starting in Module 10 (over HTTP; Module 11 moves it to MQTT), Node 1 sends its readings to the server as JSON messages. The server, database, and dashboard built in the following modules have already agreed on the name and unit of every column — that agreement is called the **data contract**, and it's written down in [Syllabus Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract):

```jsonc
{ "ts": "2026-10-09T09:41:30Z", "fw": "1.0.0",
  "temperature": 28.5, "humidity": 71, "light": 412, "soil": 37, "motion": false, "water_level": 64 }
```

That's why the `struct SensorReading` you've known since Module 3 now uses **exactly** those column names for its fields — including `water_level`, which uses an underscore. We usually write variable names in the `waterLevel` style; for the data contract columns, we follow the contract letter for letter.

```cpp
// The sensor data form. Its field names match the data contract (Syllabus Appendix A) EXACTLY.
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};
```

| Column | Type | Unit and meaning | If the reading fails |
| :--- | :--- | :--- | :--- |
| `temperature` | `float` | degrees Celsius, one digit after the decimal point | `NAN` |
| `humidity` | `int` | percent air humidity (%RH) | `-1` |
| `light` | `int` | `0` (pitch dark) to `4095` (very bright) | — |
| `soil` | `int` | percent: `0` = as dry as air, `100` = as wet as water | — |
| `motion` | `bool` | `true` = motion | — |
| `water_level` | `int` | percent of the tank filled: `0` = empty, `100` = full | `-1` |

**When do sensors "lie"?** A faulty sensor rarely goes silent; it keeps answering — with wrong numbers. Some cases you'll run into:

- **The DHT22's DATA wire comes loose** → the library answers `NAN`.
- **The HC-SR04 hears no echo** (too far, blocked, a loose ECHO wire, or the MB102 isn't on yet) → `pulseIn()` answers `0`.
- **An analog sensor's wire comes loose** → the ADC pin floats, and its number jumps around for no reason.
- **Outside the calibration range** → `map()` produces −29% if it isn't fenced in with `constrain()`.
- **Noise** → the number wobbles around the true value.
- **Not calibrated yet** → the percentage is way off.
- **A PIR that was just switched on** → false motion during the first minute.
- **At the end of the sensor's range** → the number gets stuck or barely changes: an LDR in blazing sunlight, the ADC above about 3.1 V, an object closer than 2 cm for the HC-SR04.

Our rule is simple: **never treat a failed reading as a valid one.** Flag it with a special value — `NAN` for `temperature`, `-1` for `humidity` and `water_level` — and print `--` in the Serial Monitor. (How to write those failed values in JSON is covered in Module 11.) Then make the automation rules choose the **safe action** when a reading is unknown. Take the pump: the rule "refuse if the tank is less than 20% full" automatically refuses when the tank level can't be read too, because `-1` is smaller than `20`. One `if` guards against two dangers at once. This is Node 1's first local safety rule; in Module 19, rules like this can be set from the server.

![The data contract in three parts. Left, the struct SensorReading form with six fields: temperature 28.5 degrees Celsius, humidity 71 percent, light 412 on a scale of 0 to 4095, soil 37 percent, motion false, and water_level 64 percent. Middle, an arrow labeled Modules 10–11 leading to a JSON telemetry message with exactly the same column names. Top right, a box of failed readings: temperature NAN, humidity minus 1, and water_level minus 1, which show up in the Serial Monitor as temperature=-- C and water_level=-- %. Bottom right, the pump rule: if water_level is less than 20, the pump is REFUSED; minus 1, which means unreadable, is also less than 20, so it is refused too](assets/data-contract-reading.png)

> ➡️ **Ready to practice?** Continue to [Practice 7 — Five-sensor monitor, one neat line every 2 seconds](#practice-7--five-sensor-monitor-one-neat-line-every-2-seconds-20-minutes), then Practices 8 and 9. After that, move on to the [🧩 Independent Challenges](#-independent-challenges).

---
## 🔧 Step-by-step practice

Nine practices, **in order**: each sensor is connected on the same workbench from Module 5 and left in place, so by the end of the module all five are part of Node 1. The practices marked ⭐ in the table of contents are part of the completion requirements:

1. **Practice 3** — the soil sensor reads about 0% in air and about 100% in water.
2. **Practices 6 and 8** — the water tank level is measured, then the pump refuses to run when the tank is empty.
3. The third requirement, **all analog sensors on ADC1 pins**, is met automatically if you follow the wiring tables: the LDR on VP and the soil sensor on VN (Concept 2).

You can try each practice in Wokwi first with the `diagram.json` from the [`code/`](code/) folder, exactly like the Quick Win, then build it on the real board. Steps that only work on a real board (multimeter, glass of water, capacitor) are marked.

> [!TIP]
> **How to save this week's sketches.** For each sketch, choose **File → New Sketch** in Arduino IDE, delete its default contents (**Ctrl + A**, then **Delete**), paste the code (**Ctrl + V**), then choose **File → Save** and give it the name mentioned in the practice, for example `module06_ldr_divider`. When you save the first sketch (Practice 1), first create a `module-06` folder in **Documents → GitHub → learn-iot** with the **New folder** button in the Save window, then save all of this week's sketches there (the same way as in Module 5 Practice 9). Commit each time you finish a practice.
>
> **Before you click Upload**, make sure the board box in the top bar of Arduino IDE says **DOIT ESP32 DEVKIT V1** and that the port is right. Stuck at `Connecting…`? Hold **BOOT** as soon as `Connecting…` appears, and release it when `Writing at …` starts running. The Serial Monitor is always at **115200 baud**.

> [!IMPORTANT]
> **This week's building habit** (the same as in Module 5): **before you connect or move any wire, turn off the MB102, then unplug the USB.** When you're done building, plug in the USB first, then turn on the MB102. Practices 1–4 only use 3.3 V from the ESP32, so the MB102 can stay off until Practice 5.
>
> **How to read hole names** is the same too: number = column, letter = row, and the note (upper) or (lower) tells you which breadboard. Example: **34g (lower)** means column 34, row g, lower breadboard. Holes already used by Module 5 parts are never used again, except the potentiometer's holes, which are freed up in Practice 3; the workbench picture in each practice shows the old parts in faded colors.

At the end of the module, your practice folder contains:

```text
learn-iot/
└── module-06/
    ├── module06_ldr_divider/           ← Practice 1
    ├── module06_noise_plotter/         ← Practice 2
    ├── module06_soil_calibration/      ← Practice 3 ⭐
    ├── module06_dht22/                 ← Practice 4
    ├── module06_pir_motion/            ← Practice 5
    ├── module06_tank_distance/         ← Practice 6 ⭐
    ├── module06_five_sensor_monitor/   ← Practice 7
    ├── module06_auto_water_lamp/       ← Practice 8 ⭐
    ├── calibration-notes.md            ← Practice 9 (numbers from Practices 1, 3, and 6)
    └── sensor-workbench.jpg            ← Practice 9 (a photo of your build)
```

### Practice 1 — LDR and voltage divider (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (or Wokwi), the LDR, a **10 kΩ** resistor (4 bands: brown-black-orange; 5 bands: brown-black-black-red; not sure? measure it first with the multimeter in Ω mode), three male–male jumper wires (orange, black, and a long gray one, about 20 cm), the multimeter + two spare wires as probe extensions, and a phone flashlight. Concepts used: 1–3.

#### 1.1 Build the LDR voltage divider

Make sure the MB102 is off and the USB is unplugged. All the parts below go on the **lower breadboard**, to the right of the Module 5 potentiometer, except the end of the gray wire, which goes up to the **upper breadboard**.

| Part | From | To | Purpose |
| :--- | :--- | :--- | :--- |
| **Orange** wire | 30j | bottom rail **(+)** | 3.3 V to the top end of the divider |
| **10 kΩ** resistor | 30g | 34g | the divider's top resistor |
| **LDR** | one leg in 34i | the other leg in 36i | the divider's bottom resistor; the LDR has no polarity, so its legs can go either way |
| **Black** wire | 36j | bottom rail **(−)** | the bottom end of the divider to GND |
| **Gray** wire (long) | 34f | **17f (upper)** | the divider's midpoint to **VP (GPIO 36)** |

Column 34 is the **midpoint** of the voltage divider: holes 34f, 34g, and 34i are connected inside the breadboard (Module 2: the five holes of one column = one strip). Spread the LDR's legs a little wider so they fit 34i and 36i, then push it in gently with the LDR's head facing up, toward the room light. The gray wire crosses over to the upper breadboard past the right end of the ESP32 board, alongside the potentiometer's green wire from Module 5.

![Illustration of the workbench after Practice 1, seen from above. The Module 5 parts are drawn faded. On the lower breadboard, the new additions in bright colors: an orange wire from 30j to the bottom rail plus, a 10 kilohm resistor from 30g to 34g, the LDR with its legs in 34i and 36i, a black wire from 36j to the bottom rail minus, and a long gray wire from 34f going up past the right end of the ESP32 board to 17f on the upper breadboard, right above the VP pin. Labels: column 34, the divider's midpoint, with a pointer line to 34f; bottom rail, 3.3 volts from the ESP32. The Module 5 servo, relays, fan, and pump aren't drawn, only the ends of their wires](assets/workbench-ldr.png)

#### 1.2 Measure the midpoint with a multimeter (real board only)

1. With the USB still unplugged, plug one spare wire into the **bottom rail (−)** and another into **34h (lower)** — an empty hole in the midpoint column.
2. Plug the laptop's USB into the ESP32 board (the bottom rail now has 3.3 V). Turn the multimeter dial to **V⎓ 20**, then touch the black probe to the wire in the (−) rail and the red probe to the wire in 34h.
3. Note the number under normal conditions. Then **cover the LDR with your palm** (dark) and note it again. Finally, **shine the phone flashlight on the LDR** (bright) and note it.

In a lit room, the number is usually about 0.5–1.5 V; covered by your hand, it rises toward 3 V; with the flashlight on it, it drops to a few tenths of a volt. Exactly like the table in Concept 3: **dark = high voltage, bright = low voltage**. When you're done, unplug the USB first, then remove the two spare wires.

#### 1.3 Read it with the ESP32

1. Plug the USB back into the ESP32 board. Create a new sketch `module06_ldr_divider`, paste this code, then click **Upload**:

   ```cpp
   // Module 6 - Practice 1: LDR and voltage divider
   // Circuit: 3.3 V -> 10 kiloohm resistor -> midpoint -> LDR -> GND.
   // Midpoint to VP (GPIO 36). The brighter it is, the smaller the LDR's resistance,
   // the lower the midpoint voltage, and the lower the raw number.

   const int PIN_LDR = 36;             // VP: LDR (canonical pin map)
   const int DARK_THRESHOLD = 1000;    // light below this counts as dark (adjust it to your room)
   const int BRIGHT_THRESHOLD = 2500;  // light above this counts as bright

   void setup() {
     Serial.begin(115200);
   }

   void loop() {
     int raw = analogRead(PIN_LDR);     // 0 to 4095
     float voltage = raw * 3.3 / 4095;  // rough estimate with the "straight ruler" (Concept 2)
     int light = 4095 - raw;            // inverted: the brighter it is, the bigger the number

     Serial.print("raw=");
     Serial.print(raw);
     Serial.print("  voltage~");
     Serial.print(voltage, 2);  // 2 digits after the decimal point
     Serial.print(" V  light=");
     Serial.print(light);
     if (light < DARK_THRESHOLD) {
       Serial.println("  (dark)");
     } else if (light < BRIGHT_THRESHOLD) {
       Serial.println("  (dim)");
     } else {
       Serial.println("  (bright)");
     }
     delay(500);
   }
   ```

2. Open the Serial Monitor (115200 baud). One line appears every half second, for example:

   **Expected output** (your numbers will certainly differ, depending on the lights in your room):

   ```text
   raw=1342  voltage~1.08 V  light=2753  (bright)
   raw=1355  voltage~1.09 V  light=2740  (bright)
   raw=1331  voltage~1.07 V  light=2764  (bright)
   ```

3. Cover the LDR with your hand, then shine the flashlight on it. The label at the end of the line switches between `(dark)`, `(dim)`, and `(bright)`.

Three things to notice:

- **Arduino writes decimals with a point**, never with a comma: `1.08` means 1.08 V — even if your own country writes it as 1,08.
- **Compare `voltage~` with the multimeter's number** from step 1.2. `voltage~` is usually a little lower than the multimeter, by 0.05–0.2 V — that's the imperfect ADC ruler (Concept 2). For dark-or-bright decisions, that difference doesn't matter. Curious how to correct it? See 🔬.
- **The `raw` number never holds still**, even when your hand doesn't move. That's noise, the topic of Practice 2.

#### 1.4 Set the dark threshold for your room

Note the `light` number in two situations: the room light **on** and the room light **off** (or the curtains closed). A good dark threshold lies between the two, closer to the "off" number. For example, light on `2750` and light off `300`: a threshold of `1000` fits. If `1000` doesn't suit your room, change the number in the line `const int DARK_THRESHOLD = 1000;`, click **Upload**, then make sure the `(dark)` label appears when the light is off. For now, write both numbers down on paper or in a notes app on your phone; in Practice 9 you move them into the file `calibration-notes.md`. Practice 8 uses them again.

**In Wokwi:** use the Practice 1 [`diagram.json`](code/module06_ldr_divider/diagram.json) (it's the same as the Quick Win's). Drag the lux slider: at about 500 lux it reads `raw=1001  voltage~0.81 V  light=3094  (bright)`, at about 100 lux `raw=2045  voltage~1.65 V  light=2050  (dim)`, and at about 10 lux `raw=3413  voltage~2.75 V  light=682  (dark)`. In Wokwi, the numbers hold perfectly still — Wokwi doesn't simulate noise.

> ⬆️ **Done with Practice 1?** Go back to [Concept 4](#4-noise-the-moving-average-and-the-100-nf-capacitor) (the ➡️ there will take you to Practice 2).

### Practice 2 — Noise, the moving average, and the Serial Plotter (25 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** with the **Serial Plotter** (or Wokwi), the LDR circuit from Practice 1, and the **100 nF** ceramic capacitor (printed with "104"). Concepts used: 4.

#### 2.1 Upload the graph-drawing sketch

Create a new sketch `module06_noise_plotter`, paste this code, then click **Upload**:

```cpp
// Module 6 - Practice 2: noise, the moving average, and the Serial Plotter
// Reads the LDR 20 times per second, then sends two lines to the Serial Plotter:
// "raw" (as it is) and "average" (the average of the last 10 readings).
// Wokwi has no noise: change ARTIFICIAL_NOISE to 150 so you can see the effect.

const int PIN_LDR = 36;          // VP: LDR (canonical pin map)
const int SAMPLE_COUNT = 10;     // how many of the latest readings are averaged
const int ARTIFICIAL_NOISE = 0;  // 0 for the real board; 150 to try it in Wokwi

int history[SAMPLE_COUNT];  // 10 drawers holding the latest readings
int position = 0;           // number of the drawer to overwrite next
long sum = 0;               // the sum of what's in all the drawers

void setup() {
  Serial.begin(115200);
  // Fill every drawer with the first reading so the average doesn't start at 0.
  int start = analogRead(PIN_LDR);
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    history[i] = start;
    sum += start;
  }
}

void loop() {
  int raw = analogRead(PIN_LDR) + random(-ARTIFICIAL_NOISE, ARTIFICIAL_NOISE + 1);

  sum -= history[position];                  // take the oldest reading out of the sum,
  history[position] = raw;                   // overwrite its drawer with the new reading,
  sum += raw;                                // then add the new reading to the sum
  position = (position + 1) % SAMPLE_COUNT;  // next drawer; after drawer 9, back to 0
  int average = sum / SAMPLE_COUNT;

  // Serial Plotter format: name:value, separated by commas. Don't print any other text in this sketch.
  Serial.print("raw:");
  Serial.print(raw);
  Serial.print(",average:");
  Serial.println(average);
  delay(50);  // 20 readings per second
}
```

Every line it sends looks like `raw:1342,average:1338`. The Serial Plotter understands that **`name:value`** format, separated by commas: each name becomes one colored line. That's why this sketch deliberately prints no sentences at all — the Serial Plotter would treat every word as a new line named `value 1`, `value 2`, and so on.

`random(-ARTIFICIAL_NOISE, ARTIFICIAL_NOISE + 1)` adds a random number from −150 to 150 if you change `ARTIFICIAL_NOISE` to 150 (remember Module 3: the upper limit of `random()` is never picked). On a real board, leave it at `0`: real noise is already there on its own.

#### 2.2 Open the Serial Plotter

1. If the Serial Monitor is still open, just leave it; both can be open at the same time.
2. Choose **Tools → Serial Plotter**, or click the graph icon in the top right corner of Arduino IDE (to the left of the Serial Monitor's magnifying glass icon). A new window opens.
3. Check the speed setting in the bottom right corner of that window: it must be **115200 baud**.

Two lines scroll from right to left: **raw** and **average**, with their names and colors at the top. The Serial Plotter always shows the last 50 points, so the graph keeps shifting.

![Illustration of the Serial Plotter window in Arduino IDE 2. At the top, a legend with two colored checkboxes, raw and average; at the top right, the Interpolate switch, the STOP button, and a clear icon. In the middle, a graph with a vertical axis from about 1300 to 1400: the raw line jagged up and down by about plus or minus 20, the smooth average line through its middle. At the bottom, the Type Message box with the Send button, the line ending selector, and the 115200 baud selector. Markers: 1, the legend, click a checkbox to hide a line; 2, STOP to freeze the graph; 3, the vertical axis numbers, watch the scale; 4, the speed must be 115200 baud. Labeled as an illustration](assets/arduino-serial-plotter.png)

#### 2.3 Experiment with noise

1. **Leave it alone.** The raw line is jagged; the average line runs smoothly through its middle. Look at the numbers on the left axis: the Serial Plotter automatically zooms in so both lines fill the screen, so even a wobble of ±10 looks like a big wave. Always read the scale.
2. **Cover the LDR with your hand, then uncover it.** Both lines jump. Notice that the average line catches up a little late, about half a second — that's the price it pays for being smooth.
3. **Bring a desk lamp (LED or fluorescent) close to the LDR** — not sunlight, which doesn't flicker. Under some LED or fluorescent lamps, the raw line wobbles harder because the lamp flickers 100 times per second.
4. **Click the raw checkbox** in the legend to hide that line, then click it again to bring it back. The **STOP** button freezes the graph so you can study it; **RUN** starts it again.

#### 2.4 Add the 100 nF capacitor (real board only)

1. Close the Serial Plotter window, then unplug the USB (the MB102 is still off anyway).
2. Plug in the **"104"** ceramic capacitor with one leg in **34h (lower)** and the other in **36h (lower)**: from the midpoint column to the GND column. Ceramic capacitors have no polarity.
3. Plug the USB back in, then open **Tools → Serial Plotter** again.

Compare the raw line before and after. The wobble usually gets smaller, for example from ±20 to ±5. If your room is quiet anyway, the difference may be small — that's a correct result too. **Leave the capacitor in place**: it becomes a permanent part of Node 1.

![Close-up of the lower breadboard, columns 23 to 41, after Practice 2; the Module 5 parts are drawn faded. The Practice 1 parts are drawn normally: the orange wire 30j to the plus rail, the 10 kilohm resistor 30g to 34g, the LDR at 34i and 36i, the black wire 36j to the minus rail, the gray wire from 34f. The new addition is circled: an orange ceramic capacitor printed with 104, with its legs in 34h and 36h, right above the LDR. Labels: column 34 midpoint, column 36 GND, the capacitor has no polarity](assets/workbench-capacitor.png)

**In Wokwi:** use the Practice 2 [`diagram.json`](code/module06_noise_plotter/diagram.json) and change `ARTIFICIAL_NOISE` to `150`. Wokwi has a graph plotter too: run the simulation, then click the **graph icon** in the bottom right corner of Wokwi's Serial Monitor. The raw line is jagged by ±150, while the average line is much calmer. Wokwi doesn't show the names of the lines; in this screenshot, green = `raw` and orange = `average`. Drag the lux slider to watch the average line catch up. There's no need to try the capacitor in Wokwi, because Wokwi has no noise.

![Wokwi screenshot: the Serial Monitor has switched to the Serial plotter graph with two lines, raw in green, jagged by about plus or minus 150 around 1001, and average in orange, much smoother, with axis numbers of about 850 at the bottom and 3560 at the top; in the middle of the graph both rise because the lux slider was dragged toward dark. Marker 1: the graph icon in the bottom right corner of the Serial Monitor; marker 2: the raw line with artificial noise; marker 3: the average line catching up a little late; marker 4: the lux slider in the Photoresistor window dragged to about 10 lux](assets/wokwi-plotter.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

> ⬆️ **Done with Practice 2?** Go back to [Concept 5](#5-from-raw-numbers-to-units-map-constrain-and-two-point-calibration) and read through Concept 6 (the ➡️ there will take you to Practice 3).

### Practice 3 — Calibrating the soil sensor with a glass of water (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (or Wokwi, with a potentiometer standing in for the soil sensor), the capacitive soil moisture sensor with the cable it came with, three male–male jumper wires (preferably black, green, and orange), a glass of water on a tray, a cloth, a marker pen, and — if you have them — heat-shrink tubing (plus a hair dryer) or clear nail polish. Concepts used: 5 and 6.
>
> ⭐ **Required** — the first completion requirement: the soil sensor reads about 0% in air and about 100% in water.

#### 3.1 Check your sensor first

1. **Read the marking on the eight-pin chip** at the top of the sensor. If it says "TLC555" (or ends in "555C"), good. If it says "NE555", that sensor may not work at 3.3 V (Concept 6); get the second sensor from the kit ready (the kit has two soil sensors; the second one is really meant for Node 2 in Module 14).
2. **Find the limit line** on the sensor board. No line? Draw one with the marker **2 cm below the electronics zone**, then only push the sensor in up to that line.
3. **Protect its electronics** before you use it for the first time (optional, highly recommended). First plug the sensor's own cable into its three-pin connector, then slide the heat-shrink tubing on until it covers the electronics zone and the base of the connector, and heat it gently with the hair dryer until it shrinks (don't use a flame). If the tubing won't shrink, just use clear nail polish: paint the electronics zone and the edges of the board. Nail polish takes about 30 minutes to dry; meanwhile, do step 3.2, but don't dip the sensor until the polish is dry.

#### 3.2 Replace the potentiometer with the soil sensor

Turn off the MB102 and unplug the USB first. The potentiometer from Module 5 was a "practice sensor" for the VN pin; now the real sensor arrives.

1. **Remove the potentiometer** from 24h, 26h, and 28h (lower). **Leave its three wires** — black in 24j, green in 26j, and orange in 28j — where they are. Those wires now become the soil sensor's connections.
2. **Prepare the sensor cable.** Plug its own cable into the sensor's three-pin connector (if you haven't yet). The other end is usually three female sockets. Plug one male–male jumper wire into each socket. Follow the **labels on the sensor board** (GND, VCC, AOUT), not the colors of the sensor's own cable, because those colors aren't the same from one manufacturer to another. Trace each wire from the pin labeled GND, VCC, and AOUT to its female socket: the socket from GND gets the **black** jumper, the one from AOUT the **green** jumper, and the one from VCC the **orange** jumper. The order of the sensor's pins (GND, VCC, AOUT) differs from the order of columns 24, 26, 28, so the green and orange jumpers cross — that's correct.
3. **Plug them into the lower breadboard:**

   | Sensor pin | Jumper | To | Which connects it to |
   | :--- | :--- | :--- | :--- |
   | **GND** | black | **24h** (lower) | the bottom rail (−), through the black wire in 24j |
   | **AOUT** | green | **26h** (lower) | **VN (GPIO 39)**, through the green wire 26j → 16f (upper) |
   | **VCC** | orange | **28h** (lower) | the bottom rail (+), 3.3 V, through the orange wire in 28j |

4. Lay the sensor, still dry, on the tray, far from the breadboard. Give its cable a **drip loop** (Concept 6).

![Illustration of the workbench after Practice 3. The parts from Module 5 and Practices 1–2 are drawn faded; the potentiometer is gone. On the lower breadboard, three new male–male wires, black in 24h, green in 26h, and orange in 28h, slightly to the side of the old wires: black 24j to the minus rail, green 26j going up to 16f above the VN pin, and orange 28j to the plus rail. The three new wires go into the female end of the sensor cable, whose sockets are in the order GND, VCC, AOUT: black from GND to 24h, orange from VCC to 28h, and green from AOUT to 26h, so the green and orange wires cross. The capacitive soil sensor lies on a tray below the workbench, with a drip loop in its cable. A glass of water next to it. Label: follow the labels on the sensor board, not the wire colors](assets/workbench-soil.png)

#### 3.3 Upload the calibration sketch

Plug in the USB. Create a new sketch `module06_soil_calibration`, paste this code, then click **Upload**:

```cpp
// Module 6 - Practice 3: calibrating the capacitive soil moisture sensor
// Sensor on VN (GPIO 39). The wetter it is, the SMALLER the raw number.
// How to calibrate: (1) note the raw number with the sensor in air -> DRY;
// (2) note the raw number with the sensor dipped in water up to the limit line -> WET;
// (3) write both numbers below, then upload again. Result: air 0%, water 100%.

const int PIN_SOIL = 39;    // VN: soil sensor (canonical pin map)
const int DRY = 3000;       // raw number in air (replace it with your own note)
const int WET = 1300;       // raw number in water (replace it with your own note)
const int READ_COUNT = 20;  // how many readings are averaged

// Reads the sensor 20 times in a row, then returns the average.
int readSoilRaw() {
  long sum = 0;
  for (int i = 0; i < READ_COUNT; i++) {
    sum += analogRead(PIN_SOIL);
    delay(5);
  }
  return sum / READ_COUNT;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Soil sensor calibration: note the raw number in air and in water.");
}

void loop() {
  int raw = readSoilRaw();
  int percent = map(raw, DRY, WET, 0, 100);  // DRY -> 0, WET -> 100
  int soil = constrain(percent, 0, 100);     // fence it in so it stays 0-100

  Serial.print("raw=");
  Serial.print(raw);
  Serial.print("  map result=");
  Serial.print(percent);
  Serial.print("  soil=");
  Serial.print(soil);
  Serial.println(" %");
  delay(1000);
}
```

Open the Serial Monitor. Every second, a line appears with three numbers: `raw` (the average of 20 readings), `map result` (before it's fenced in), and `soil` (after it's fenced in).

#### 3.4 Note the air number and the water number

1. **Air.** Hang the sensor by holding its **cable** (don't hold the board — your hand gets measured too), or lay it on the dry tray without touching anything. Wait 10 seconds until the number settles, then note the `raw` number that shows up most often. That's your `DRY` value, for example `2948`.
2. **Water.** Dip the sensor into the glass of water **exactly up to the limit line** — no further. Wait 10 seconds, then note its `raw` number. That's your `WET` value, for example `1352`.
3. Lift the sensor out and dry it with the cloth.

**Expected output**, roughly like this, still with the example numbers `3000` and `1300` in the code:

```text
raw=2948  map result=3  soil=3 %
raw=2951  map result=2  soil=2 %
raw=1352  map result=96  soil=96 %
raw=1349  map result=97  soil=97 %
```

Write both of your numbers down on paper or in a notes app on your phone; in Practice 9 you move them into `calibration-notes.md`. If the difference between the air number and the water number is **less than 500**, your sensor is probably faulty (Concept 6) — try the second sensor.

#### 3.5 Put your numbers in the code, then prove it

1. Change `const int DRY = 3000;` to your air number, and `const int WET = 1300;` to your water number. For example: `const int DRY = 2948;` and `const int WET = 1352;`.
2. Click **Upload** again.
3. Repeat step 3.4: in air, the Serial Monitor now shows **`soil=0 %`** or a number close to it; in water, **`soil=100 %`** or close to it (for example 98 or 99).

**That's the first completion requirement. ⭐** A difference of a few percent is normal: the raw number wobbles a little (noise), and `map()` cuts off fractions (99.9 becomes 99). Also look at the `map result` column: if the sensor is a little drier than during calibration, for example because a fan is blowing on it, `map result` can be `-2`, but `soil` stays `0` thanks to `constrain()`.

Want to try it in real soil? Push the sensor into a pot of soil up to the limit line. Dry soil usually reads 10–30%, and 60–90% after watering. Wait a few minutes after watering so the water can soak in.

**In Wokwi:** use the Practice 3 [`diagram.json`](code/module06_soil_calibration/diagram.json). The potentiometer above the VN pin plays the part of the soil sensor.

1. Run the simulation. In the starting position it reads `raw=3002  map result=0  soil=0 %` — think of this as "air".
2. Click the potentiometer, then turn its knob to the left (drag it with the mouse, or press the **←** arrow key repeatedly) until `raw` is about `1300` ("water"): `soil` becomes about 99%.
3. Press **End** to turn it all the way to the right: `raw=4095  map result=-64  soil=0 %`. Press **Home** to turn it all the way to the left: `raw=0  map result=176  soil=100 %`. That's how `constrain()` rescues impossible numbers.

> ⬆️ **Done with Practice 3?** Go back to [Concept 7](#7-reading-a-datasheet-five-things-to-look-for) and read through Concept 8 (the ➡️ there will take you to Practice 4).

### Practice 4 — DHT22: temperature and humidity with a library (25 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (with the **Library Manager**) or Wokwi, the 3-pin DHT22 module, and three male–female jumper wires (orange, black, and yellow). Concepts used: 7 and 8.

#### 4.1 Install the DHT sensor library

1. In Arduino IDE, click the **Library Manager** icon in the left sidebar (the third icon, a picture of books), just like in Modules 3 and 5.
2. Type **DHT sensor library** in the search box. Pick the **DHT sensor library** entry that says **by Adafruit** under its title — there are several other DHT libraries with similar names.
3. Make sure its version menu shows **1.4.7** (pick it from the list if a newer version already exists), then click **INSTALL**.
4. An `Install library dependencies` window appears with the message `The library DHT sensor library:1.4.7 needs another dependency currently not installed:` and below it `- Adafruit Unified Sensor`. This means the DHT library needs one companion library. Click **INSTALL ALL** — **not** **INSTALL WITHOUT DEPENDENCIES**. (Arduino IDE 2.3.10 still shows this window even if Adafruit Unified Sensor was installed before. Just click **INSTALL ALL**; nothing breaks.)
5. Wait until the notification `Successfully installed library DHT sensor library:1.4.7` appears at the bottom right, the **Output** panel contains the lines `Installed Adafruit Unified Sensor@1.1.15` and `Installed DHT sensor library@1.4.7`, and the entry says `1.4.7 installed`.

![Illustration of the Arduino IDE 2 Library Manager. Marker 1 on the Library Manager books icon in the left sidebar. The search box holds DHT sensor library; the entry DHT sensor library by Adafruit with the version menu at 1.4.7 and the INSTALL button, marked with marker 2, pick 1.4.7, then click INSTALL. Below it, another entry, DHT sensor library for ESPx by beegee_tokyo, with the note not this one. On the right, the Install library dependencies window with the message The library DHT sensor library:1.4.7 needs another dependency currently not installed, minus Adafruit Unified Sensor, Would you like to install the missing dependency, with two buttons, INSTALL WITHOUT DEPENDENCIES and INSTALL ALL; marker 3 on INSTALL ALL. At the bottom, the Output panel with the Downloading, Installing, and Installed lines for Adafruit Unified Sensor@1.1.15 and DHT sensor library@1.4.7. Labeled as an illustration](assets/arduino-library-dht.png)

If you already clicked **INSTALL WITHOUT DEPENDENCIES**, compiling will fail later with the message `fatal error: Adafruit_Sensor.h: No such file or directory`. The fix: search for **Adafruit Unified Sensor** in the Library Manager, then install version **1.1.15**.

**In Wokwi**, libraries aren't installed through Arduino IDE's Library Manager but through a `libraries.txt` file. The steps are at the end of this practice.

#### 4.2 Connect the DHT22 module

Turn off the MB102 and unplug the USB. First read the labels on your DHT22 module: usually "+", "out", and "−", or "VCC", "DATA", and "GND". Use male–female wires: the female end goes on the module's pin, the male end into the breadboard.

| Module pin | Wire | To | Notes |
| :--- | :--- | :--- | :--- |
| **+** / VCC | **orange** | bottom rail **(+)**, column 11 | 3.3 V — **not** the top rail, which is 5 V |
| **−** / GND | **black** | bottom rail **(−)**, column 12 | |
| **out** / DATA | **yellow** | **8f (upper)** | right above the **D14** pin |

Place the DHT22 module slightly outside the workbench, away from the ESP32 board and the MB102, which get warm while they work. Let the module hang from its wires or stand next to the breadboard — a temperature sensor that's too close to a warm chip will "report" the chip's temperature, not the room's. With 3.3 V, the DHT22's cable may be at most 1 m long (AM2302 datasheet); 20 cm jumper wires are safe.

![Illustration of the workbench after Practice 4. The old parts are drawn faded. The white DHT22 module outside the breadboard, at the bottom left, with three new male–female wires: orange from the plus pin to the bottom rail plus at column 11, black from the minus pin to the bottom rail minus at column 12, and yellow from the out pin going up past the left end of the ESP32 board to 8f on the upper breadboard, right above the D14 pin. Labels: 3.3 volts from the bottom rail, not 5 volts; keep the sensor away from warm chips](assets/workbench-dht22.png)

#### 4.3 Read the temperature and humidity

Plug in the USB. Create a new sketch `module06_dht22`, paste this code, then click **Upload**:

```cpp
// Module 6 - Practice 4: temperature and humidity with the DHT22
// The DATA pin of the DHT22 module goes to D14. The DHT22 module gets 3.3 V, NOT 5 V.
// Library: DHT sensor library by Adafruit 1.4.7 (installed with it: Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

const int PIN_DHT = 14;  // D14: DHT22 (canonical pin map)

DHT dht(PIN_DHT, DHT22);  // the sensor "object": where its DATA pin is connected and which type it is

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("DHT22 ready. The first reading appears in 2 seconds.");
}

void loop() {
  delay(2000);  // the DHT22 can be read at most once every 2 seconds

  float temperature = dht.readTemperature();  // degrees Celsius
  float humidity = dht.readHumidity();        // percent

  if (isnan(temperature) || isnan(humidity)) {  // NAN = "not a number": the reading failed
    Serial.println("Failed to read the DHT22! Check the DATA, VCC, and GND wires.");
    return;  // skip the rest of loop(); the next pass tries again
  }

  Serial.print("temperature=");
  Serial.print(temperature, 1);  // 1 digit after the decimal point
  Serial.print(" C  humidity=");
  Serial.print(humidity, 0);
  Serial.println(" %");
}
```

**Expected output** in the Serial Monitor (your numbers follow the weather at your home):

```text
DHT22 ready. The first reading appears in 2 seconds.
temperature=28.4 C  humidity=71 %
temperature=28.4 C  humidity=71 %
```

There are three new things in that code:

- **`DHT dht(PIN_DHT, DHT22);`** creates an "object" called `dht` — a kind of assistant that knows how to talk to the DHT22 on pin 14. Like `Servo curtainServo;` in Module 5.
- **`return;`** inside `loop()` means "skip the rest of this pass". `loop()` then starts again from the top, waits 2 seconds, and tries again.
- **`isnan()`** answers `true` if the value is `NAN` (Concept 8). The `||` sign means "or" (Module 3).

#### 4.4 Test the sensor

1. **Breathe gently** toward the sensor from about 10 cm away. Within a few readings, the humidity rises (it can go above 90%) and the temperature rises a little. After a minute, the numbers return to what they were.
2. **Hold the sensor between two fingers** for half a minute: the temperature rises slowly.
3. **Failure test:** turn off the MB102 (if it's on) and unplug the USB, then pull the end of the yellow wire out of 8f. Plug the USB back in: every 2 seconds, `Failed to read the DHT22! Check the DATA, VCC, and GND wires.` appears. That's what `NAN` looks like from the outside. Unplug the USB, push the yellow wire back into 8f, then plug in the USB: normal readings return.

**In Wokwi:**

1. Open a new ESP32 project in Wokwi, then replace the contents of the `diagram.json` tab with the Practice 4 [`diagram.json`](code/module06_dht22/diagram.json).
2. Replace the contents of the `sketch.ino` tab with the code from step 4.3.
3. Click the **Library Manager** tab → the round **+** button → type **DHT sensor library** → click the result. When the `libraries.txt` tab appears, replace everything in it with the contents of [`libraries.txt`](code/module06_dht22/libraries.txt) from this practice's folder, which lists both libraries with their versions:

   ```text
   # Libraries for this sketch (used by Wokwi). In the Arduino IDE, install them through the Library Manager.
   DHT sensor library@1.4.7
   Adafruit Unified Sensor@1.1.15
   ```

4. Click the green **▶** button to run the simulation.
5. Click the DHT22 sensor in the simulation panel: an `Editing DHT22` window appears with **Temperature** and **Humidity** sliders. Drag both; two seconds later, the Serial Monitor follows.

In Wokwi, the DHT22 is drawn as a four-pin sensor without a pull-up resistor (its third pin, NC, isn't used); the 3-pin module in your kit already has that resistor.

![Wokwi screenshot: the ESP32 board lying sideways, the white DHT22 sensor above it with its SDA pin going straight down to D14, VCC looping around the left side to 3V3, and GND looping around the right side to GND in the bottom row. Marker 1: the DHT22 sensor was clicked, and the Editing DHT22 window is open; marker 2: the Temperature slider at 35.0 degrees Celsius and Humidity at 40.0 percent; marker 3: the Serial Monitor changes from temperature=28.5 C humidity=71 percent to temperature=35.0 C humidity=40 percent](assets/wokwi-dht22.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

> ⬆️ **Done with Practice 4?** Go back to [Concept 9](#9-pir-a-motion-sensor-that-just-says-yes-or-no) (the ➡️ there will take you to Practice 5).

### Practice 5 — PIR: the motion sensor and its 1-minute warm-up (20 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (or Wokwi), the **HC-SR501** PIR module, three male–female jumper wires (red, black, and blue), the small screwdriver, and the MB102 — the PIR needs 5 V from the top rail. Concepts used: 9.

#### 5.1 Prepare the PIR

1. **Gently take off its white dome** (pull it straight up) and read the labels next to the three pins: "VCC", "OUT", and "GND". Remember their order.
2. On the back of the board, find the **L/H** option. If it's a yellow **jumper**, make sure it's in the **H** position (move it with a fingernail or tweezers if it's on L). If it's **solder pads** labeled L and H without a jumper, leave it alone: it's usually connected to H at the factory.
3. With the small screwdriver, turn **both knobs** fully **counterclockwise**. On most modules, that gives the shortest HIGH time (about 5 seconds) and the shortest range (about 3 m) — just right for testing on a desk. You don't need to know yet which knob is Sx and which is Tx; step 5.4 will reveal it.
4. Put the dome back on.

#### 5.2 Connect the PIR

Turn off the MB102 and unplug the USB. Use male–female wires: the female end goes on the PIR's pin, the male end into the upper breadboard.

| PIR pin | Wire | To | Notes |
| :--- | :--- | :--- | :--- |
| **VCC** | **red** | top rail **(+)**, column 20 | 5 V from the MB102 |
| **GND** | **black** | top rail **(−)**, column 21 | if that rail hole is already taken (for example by a wire from the Module 5 Level 3 Challenge), use the nearest empty (−) rail hole |
| **OUT** | **blue** | **15f (upper)** | right above the **D34** pin; OUT is only 3.3 V, so it's safe to connect it straight to the pin |

Point the PIR away from you, for example toward the door or into the room, so you can test it by walking around or waving your hand.

![Illustration of the workbench after Practice 5. The old parts are drawn faded. The HC-SR501 PIR module with its white dome above the upper breadboard, off the board, with three new male–female wires: red from VCC to the top rail plus at column 20, black from GND to the top rail minus at column 21, and blue from OUT coming down to 15f, right above the D34 pin. Label: the PIR gets 5 volts from the MB102, and its output is 3.3 volts, so it's safe to connect straight to the pin](assets/workbench-pir.png)

#### 5.3 Upload and wait for the warm-up

Plug in the USB, **turn on the MB102** (the PIR only gets power while the MB102 is on), then create a new sketch `module06_pir_motion`, paste this code, and click **Upload**:

```cpp
// Module 6 - Practice 5: the HC-SR501 PIR motion sensor
// The PIR's OUT pin goes to D34. The status LED on D4 is on while the PIR sees motion.
// The PIR needs a "warm-up" of about 1 minute after it gets power.

const int PIN_PIR = 34;         // D34: PIR (canonical pin map), input only
const int PIN_LED = 4;          // status LED
const int WARMUP_SECONDS = 60;  // change it to 3 if you try it in Wokwi

bool previousMotion = false;  // the PIR's state on the previous pass

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);  // no pull-up: the PIR itself outputs HIGH or LOW
  pinMode(PIN_LED, OUTPUT);
  Serial.print("PIR warm-up: ");
  Serial.print(WARMUP_SECONDS);
  Serial.println(" seconds. Stay away from the front of the sensor...");
  for (int remaining = WARMUP_SECONDS; remaining > 0; remaining--) {
    if (remaining % 10 == 0) {  // report every 10 seconds
      Serial.print("  ");
      Serial.print(remaining);
      Serial.println(" seconds left");
    }
    delay(1000);
  }
  Serial.println("PIR ready. Wave your hand in front of it!");
}

void loop() {
  bool motion = digitalRead(PIN_PIR) == HIGH;  // HIGH = motion
  if (motion) {
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }

  // Print only when the state CHANGES, so the Serial Monitor isn't flooded.
  if (motion && !previousMotion) {
    Serial.println("Motion detected!");
  }
  if (!motion && previousMotion) {
    Serial.println("All quiet again.");
  }
  previousMotion = motion;
  delay(50);
}
```

Open the Serial Monitor and stay away from the front of the PIR during the countdown.

**Expected output:**

```text
PIR warm-up: 60 seconds. Stay away from the front of the sensor...
  60 seconds left
  50 seconds left
  40 seconds left
  30 seconds left
  20 seconds left
  10 seconds left
PIR ready. Wave your hand in front of it!
Motion detected!
All quiet again.
```

This code uses the same idea as the button in Module 5: **react to changes, not to states**. The `previousMotion` variable remembers the state from the previous pass, so `Motion detected!` is printed only once when OUT goes up, and `All quiet again.` once when OUT goes down.

#### 5.4 Experiment with the PIR

1. **Wave your hand** about 1–2 m in front of the PIR: `Motion detected!` appears and the D4 status LED (the red LED on the lower breadboard, in place since Module 2) lights up.
2. **Hold still**, then wait: about 5 seconds later `All quiet again.` appears and the LED goes off. For about 2.5 seconds after that, the PIR is "blind".
3. **Keep moving** for 15 seconds: with the jumper on H, OUT stays HIGH as long as you move, and `All quiet again.` only appears about 5 seconds after you stop.
4. **Identify the Tx knob.** Turn one of the knobs a little clockwise, then test again. If the wait before `All quiet again.` gets longer, that's **Tx**; if it doesn't change, it's **Sx** (range). You may turn the knobs while the circuit is on; use the screwdriver and don't touch the pins on the board. Turn the knob back to where it was when you're done.

**In Wokwi:** use the Practice 5 [`diagram.json`](code/module06_pir_motion/diagram.json), then change `WARMUP_SECONDS` to `3` — the Wokwi PIR needs no warm-up. Click the PIR module: a `PIR Motion Sensor` window appears with a **Simulate motion** button. Click that button: `Motion detected!` is printed and the status LED lights up, then about 5 seconds later `All quiet again.` appears. In Wokwi, the PIR takes its power from the VIN pin in place of the 5 V top rail; on your desk, it still comes from the MB102.

![Wokwi screenshot: the ESP32 board lying sideways, the PIR module above it with its OUT pin going straight down to D34, VCC to VIN, and GND to GND in the top row; a resistor and the red status LED below the board, connected to D4. Marker 1: the PIR module was clicked, and the PIR Motion Sensor window with the Simulate motion button is open; marker 2: the D4 status LED is on; marker 3: the Serial Monitor shows PIR ready. Wave your hand in front of it, then Motion detected](assets/wokwi-pir.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

> ⬆️ **Done with Practice 5?** Go back to [Concept 10](#10-hc-sr04-measuring-distance-with-an-echo) (the ➡️ there will take you to Practice 6).

### Practice 6 — HC-SR04 and the voltage divider: the water tank level (40 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (or Wokwi), the **HC-SR04** sensor, a **4.7 kΩ** resistor (4 bands: yellow-violet-red; 5 bands: yellow-violet-black-brown) and a **10 kΩ** resistor (4 bands: brown-black-orange; 5 bands: brown-black-black-red; not sure? measure it first with the multimeter in Ω mode), four male–female jumper wires (red, black, purple, white) plus a few spares as extensions if the water tank is a bit far away, two male–male wires (one short black one, one red one for a temporary test), the multimeter + two spare wires, the water tank container + water, thick cardboard (or a spare ruler) + tape for the bridge, a ruler for measuring, a glass, and the pump from Module 5. Concepts used: 3 and 10.
>
> ⭐ **Required** — groundwork for the second completion requirement: the water tank level is measured, then used in Practice 8 to refuse to run the pump.

#### 6.1 Build the voltage divider on the D35 strip

Turn off the MB102 and unplug the USB. All the parts in this step go on the **upper breadboard**.

| Part | From | To | Purpose |
| :--- | :--- | :--- | :--- |
| **10 kΩ** resistor (brown-black-orange) | 14e | 14g | the divider's bottom resistor; it crosses the center channel |
| Short **black** wire | 14a | top rail **(−)**, column 15 | the bottom end of the divider to GND |
| **4.7 kΩ** resistor (yellow-violet-red) | 14h | 19h | the divider's top resistor |

Why column 14? Column 14, rows f–j, is the strip of the **D35** pin (the pin itself is in 14i). So the divider's midpoint sits right on the D35 strip, with no extra wire. The 10 kΩ resistor crosses the center channel: its GND-side leg (in 14e) goes into the column 14, rows a–e strip, which the black wire from 14a connects to GND. The 4.7 kΩ resistor stretches from the D35 strip (14h) to column 19 (19h); later, the ECHO wire goes into that column 19. Remember, "top" and "bottom" in a voltage divider describe a resistor's role in the formula (near the source or near GND), not where it sits on the breadboard.

**Are your ESP32's pins in row h** (only rows f and g free, Module 5 Practice 1.3)? Put the 10 kΩ in 14d–14f and the 4.7 kΩ in 14g–19g; the black wire still runs from 14a, and the ECHO wire still goes into 19f. In step 6.2, touch the red probe directly to the resistor leg in 14g.

**Only row f free?** Make the a–e half of column 14 the midpoint: put a short wire from 14e to 14f (connecting it to the D35 strip), the 10 kΩ resistor from 14b to 17b, a black wire from 17a to the top rail (−) at column 17, and the 4.7 kΩ resistor from 14d to 19d. The ECHO wire and the temporary red wire then go into **19a** (not 19f), and in step 6.2 you measure at 14a.

**Check the color bands twice.** If the two resistors are swapped, pin D35 only receives about 1.6 V — below the guaranteed HIGH threshold — so the echo may not be read (Concept 3).

![Illustration of the workbench after Practice 6, with a zoom box of columns 13 to 21 of the upper breadboard. The old parts are drawn faded. The new additions are highlighted: a brown-black-orange 10 kilohm resistor from 14e to 14g crossing the center channel, a short black wire from 14a to the top rail minus at column 15, a yellow-violet-red 4.7 kilohm resistor from 14h to 19h, and the HC-SR04 sensor off the board with four male–female wires: red VCC to the top rail plus at column 26, black GND to the top rail minus at column 27, white ECHO to 19f, and purple TRIG down to 6e on the lower breadboard, right below the D15 pin. In the zoom box, marker 1 the 10 kilohm resistor, 2 the short black wire, 3 the 4.7 kilohm resistor, and 4 the white ECHO wire in 19f. Labels: column 14, rows f to j, is the D35 strip, the divider's midpoint; the 5 volt ECHO becomes about 3.4 volts](assets/workbench-hcsr04.png)

#### 6.2 Measure the voltage divider first (real board only)

Before connecting the HC-SR04, we pretend to be an ECHO pin that's HIGH: we put 5 V on the top end of the divider, then measure the result.

> [!CAUTION]
> Column **18**, just to the left of column 19, is the **EN** pin. Count the columns from the numbers printed on the breadboard: the temporary red wire and the ECHO wire carry 5 V and must go into column **19**.

1. With the MB102 off and the USB unplugged, plug the temporary **red** wire from the top rail **(+)**, column 22, into **19f (upper)**.
2. Plug one spare wire into **14f (upper)**, an empty hole on the D35 strip, and another into an empty hole in the **top rail (−)**. Keep the free ends of both away from the (+) rail and from the red wire.
3. Plug in the USB, then turn on the MB102.
4. Turn the multimeter to **V⎓ 20**, then touch the red probe to the wire in 14f and the black probe to the wire in the (−) rail.
5. The correct reading: **about 3.1–3.6 V** (the calculation gives 3.40 V; resistor tolerances and the adapter's voltage shift it a little).
   - **About 1.6 V**: the two resistors are swapped. Turn off the MB102, unplug the USB, swap them, then measure again.
   - **Above 3.6 V** (it could be about 3.8 V, or as much as about 5 V): the 10 kΩ resistor or the black wire at 14a isn't connected. **Turn off the MB102 right away**, unplug the USB, check, then measure again. Don't continue until the number is below 3.6 V. (The circuit is right, but it's still above 3.6 V? Measure the top rail: your adapter may be putting out more than 5.2 V. If so, use a different 5 V adapter; don't continue as long as the number is above 3.6 V.)
   - **0 V**: the red wire isn't in the top rail (+), the MB102 isn't on, or the 4.7 kΩ resistor doesn't reach column 19. Turn off the MB102 and unplug the USB before you fix it.
6. Turn off the MB102, unplug the USB, then **remove the temporary red wire** and both spare wires.

#### 6.3 Connect the HC-SR04

Make sure the MB102 is still off and the USB still unplugged. Use male–female wires: the female end goes on the HC-SR04's pin, the male end into the breadboard.

| HC-SR04 pin | Wire | To | Notes |
| :--- | :--- | :--- | :--- |
| **VCC** | **red** | top rail **(+)**, column 26 | 5 V from the MB102 — also for the HC-SR04+ and the RCWL-1601 |
| **TRIG** | **purple** | **6e (lower)** | right below the **D15** pin |
| **ECHO** | **white** | **19f (upper)** | to the top end of the 4.7 kΩ resistor, **never directly to a pin** |
| **GND** | **black** | top rail **(−)**, column 27 | |

Are the wires too short to reach the water tank later? Join two male–female wires: plug the male end of the first wire into the female end of the second.

#### 6.4 Try measuring distance on the desk

Plug in the USB, then turn on the MB102 (the HC-SR04 only gets power while the MB102 is on). Create a new sketch `module06_tank_distance`, paste this code, then click **Upload**:

```cpp
// Module 6 - Practice 6: the HC-SR04 as a water tank level gauge
// TRIG on D15. ECHO through a voltage divider (4.7 kiloohm + 10 kiloohm) to D35.
// The sensor faces down, above the water tank (the pump's water container).

const int PIN_TRIG = 15;            // D15: HC-SR04 TRIG (canonical pin map)
const int PIN_ECHO = 35;            // D35: HC-SR04 ECHO, through a voltage divider
const float DISTANCE_EMPTY = 20.0;  // cm from the sensor to the bottom of the tank (measure it yourself)
const float DISTANCE_FULL = 5.0;    // cm from the sensor to the water surface when the tank is full (measure it yourself)

// Measures the distance once, in cm. Returns -1 if the echo doesn't come back.
float measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);  // the "shout" command: HIGH for 10 microseconds
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);  // length of the ECHO pulse; wait at most 30 ms
  if (duration == 0) {
    return -1;  // no echo: too far, blocked, or a loose wire
  }
  return duration / 58.0;  // every 58 microseconds = 1 cm (the sound travels there and back)
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
}

void loop() {
  delay(1000);  // measure once every second
  float distance = measureDistanceCm();
  if (distance < 0) {
    Serial.println("No echo. Check the wires and which way the sensor faces.");
  } else {
    // The formula is the same as map(distance, DISTANCE_EMPTY, DISTANCE_FULL, 0, 100), but for decimal numbers.
    int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
    int waterLevel = constrain(percent, 0, 100);
    Serial.print("distance=");
    Serial.print(distance, 1);
    Serial.print(" cm  water_level=");
    Serial.print(waterLevel);
    Serial.println(" %");
  }
}
```

Point the sensor at a wall or a book, then open the Serial Monitor. For now, only watch the `distance` number; `water_level` only means something after you calibrate it in step 6.6.

**Expected output** (the sensor facing a book about 30 cm in front of it):

```text
distance=30.6 cm  water_level=0 %
distance=30.4 cm  water_level=0 %
```

Move your hand back and forth in front of the sensor, then check against a ruler: at 10 cm, `distance` should read about 10 cm (a difference of a few millimeters is normal). Does `No echo. …` keep appearing? See 🚨.

Three new things in that code:

- **`delayMicroseconds(10)`** waits 10 **micro**seconds — one millionth of a second, times ten. An ordinary `delay()` is too coarse for such a short pulse.
- **`unsigned long`** is a big whole number that's never negative — just right for holding a pulse length in microseconds.
- **The `water_level` formula** is what's inside `map()`, rewritten with `float` (Concept 5). The result is stored in an `int`, so the fraction is thrown away, then fenced in with `constrain()`.

#### 6.5 Mount it above the water tank

1. Turn off the MB102 and unplug the USB. **Move the pump** from the glass (Module 5) into the **water tank container**, with the end of its hose still in the glass or the "plant" pot. First pour the old glass's water into the tank; the now-empty glass becomes the "plant glass", so it won't overflow when it gets watered. Fill the container with water up to the level you consider **full** — leave at least 3 cm of space below where the sensor will be.
2. Build the **bridge**: lay the thick cardboard (or spare ruler) across the container's opening, then tape both ends to the rim so it doesn't slide. Tape the HC-SR04 to the underside of the bridge, with its **"eyes" facing down** and not covered by anything. Choose a spot that isn't right above the pump or the hose, because they reflect sound too.
3. Put the water tank on the tray, as far as possible from the breadboard, the adapter, and the laptop (extend the wires if needed).

![Side view illustration of the water tank, not to scale: a container of water on a tray with the pump on the bottom at the left; the pump's hose goes up and then down into the plant glass to the left of the container. Across the container's opening, thick cardboard as a bridge, with the HC-SR04 taped underneath it facing down, not right above the pump or the hose. The sensor's four wires leave to the right, toward the workbench. A blue dashed line marks the full level. Measuring arrows: DISTANCE_FULL from the sensor's face to the water when full, DISTANCE_EMPTY from the sensor's face to the bottom of the container. Notes: leave at least 3 centimeters between the sensor and the water, not right above the pump or the hose, a container at least 10 centimeters wide with the sensor pointing straight down, and the pump must never run when the tank is empty](assets/water-tank-hcsr04.png)

#### 6.6 Calibrate the tank: full and empty

1. Plug in the USB, then turn on the MB102. Wait until the water surface is calm (ripples make the number jump around).
2. **Full.** Note the `distance` number when the tank is full, for example `6.2`. That's your `DISTANCE_FULL` value.
3. **Empty.** Turn off the MB102, unplug the USB, then scoop all the water out of the tank with the glass without moving the bridge (leave the pump inside). Plug in the USB, turn on the MB102, then note its `distance`, for example `19.5`. That's your `DISTANCE_EMPTY` value. Check it with the ruler, from the sensor's face (the front of the "eyes", with the mesh) to the bottom of the container: if the sensor's number is shorter than the ruler's by 2 cm or more, the sensor is "seeing" the pump or the hose — move the sensor (step 6.5), then measure again. After that, turn off the MB102, unplug the USB, and put the water back — **the pump must never be turned on while the tank is empty**.
4. Plug in the USB and turn on the MB102, then change the constants in the code, for example `const float DISTANCE_EMPTY = 19.5;` and `const float DISTANCE_FULL = 6.2;`, and click **Upload**.
5. Test it: a full tank reads about 100%; scoop out water with the glass until it's about half full, and it reads about 50%; almost empty, it reads close to 0%.

**Expected output** (after calibration, with the water taken out little by little):

```text
distance=6.3 cm  water_level=99 %
distance=12.8 cm  water_level=50 %
distance=17.9 cm  water_level=12 %
```

Write down both of your tank calibration numbers on paper or on your phone; in Practice 9 you move them into `calibration-notes.md`.

**In Wokwi:** use the Practice 6 [`diagram.json`](code/module06_tank_distance/diagram.json). That diagram deliberately includes both divider resistors so the circuit matches the one on your desk (Wokwi itself doesn't need them). In Wokwi, the HC-SR04 takes its power from the VIN pin in place of the 5 V top rail.

1. Run the simulation, then click the HC-SR04: an `Editing Ultrasonic Distance Sensor` window appears with a **Distance** slider (2–400 cm).
2. At the starting position of 12 cm, it reads `distance=12.1 cm  water_level=52 %` (the digit after the decimal point may be slightly different, for example `12.2`).
3. Drag it to the right to 20 cm or more: `water_level=0 %`. Drag it all the way to the left (2 cm): `water_level=100 %`.

![Wokwi screenshot: the HC-SR04 above the sideways ESP32 board, its ECHO pin going down through an upright 4.7 kilohm resistor to D35, a horizontal 10 kilohm resistor from the midpoint to GND, TRIG looping around the left end of the board to D15 in the bottom row, VCC to VIN, and GND to the bottom row. Marker 1: the HC-SR04 was clicked, and the Editing Ultrasonic Distance Sensor window is open; marker 2: the Distance slider at 12 centimeters; marker 3: the Serial Monitor shows distance=12.1 cm water_level=52 percent](assets/wokwi-hcsr04.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

> ⬆️ **Done with Practice 6?** Go back to [Concept 11](#11-the-data-contract-and-when-sensors-lie) (the ➡️ there will take you to Practice 7).

### Practice 7 — Five-sensor monitor, one neat line every 2 seconds (20 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (or Wokwi) and the five sensors connected in Practices 1–6, with the MB102 on (the PIR and the HC-SR04 need 5 V). No new wires. Concepts used: 11 (and all the earlier concepts).

Right now, each of the five sensors works on its own. Time to bring their readings together in one `SensorReading` form whose field names match the data contract exactly, then print it neatly every 2 seconds.

1. Create a new sketch `module06_five_sensor_monitor` and paste the code below.
2. **Before you click Upload**, replace the four numbers in the `Your calibration results` section with your notes from Practices 3 and 6.
3. Plug in the USB, turn on the MB102, then click **Upload**.

```cpp
// Module 6 - Practice 7: Node 1's five-sensor monitor, one neat line every 2 seconds
// All readings go into one SensorReading form whose field names
// match the data contract (Syllabus Appendix A) exactly: temperature, humidity, light, soil, motion, water_level.
// Library: DHT sensor library by Adafruit 1.4.7 (+ Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

// ---------- Canonical pin map (Module 6 sensors) ----------
const int PIN_DHT = 14;   // D14: DHT22
const int PIN_LDR = 36;   // VP: LDR
const int PIN_SOIL = 39;  // VN: capacitive soil sensor
const int PIN_PIR = 34;   // D34: PIR
const int PIN_TRIG = 15;  // D15: HC-SR04 TRIG
const int PIN_ECHO = 35;  // D35: HC-SR04 ECHO, through a voltage divider

// ---------- Your calibration results (Practices 3 and 6) ----------
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

DHT dht(PIN_DHT, DHT22);

// The sensor data form. Its field names match the data contract (Syllabus Appendix A) EXACTLY.
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

// Averages 20 analog readings in a row to smooth out the noise (Concept 4).
int readAnalogAverage(int pin) {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(pin);
    delay(2);
  }
  return sum / 20;
}

int readLight() {
  return 4095 - readAnalogAverage(PIN_LDR);  // inverted: the brighter it is, the bigger the number
}

int readSoilPercent() {
  int percent = map(readAnalogAverage(PIN_SOIL), SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

// Measures the distance once, in cm. Returns -1 if the echo doesn't come back.
float measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) {
    return -1;
  }
  return duration / 58.0;
}

int readWaterLevel() {
  float distance = measureDistanceCm();
  if (distance < 0) {
    return -1;  // unknown
  }
  int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
  return constrain(percent, 0, 100);
}

// Fills in the form with the readings of all five sensors.
SensorReading readSensors() {
  SensorReading b;
  b.temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(humidity)) {
    b.humidity = -1;
  } else {
    b.humidity = round(humidity);  // rounded to the nearest whole number
  }
  b.light = readLight();
  b.soil = readSoilPercent();
  b.motion = digitalRead(PIN_PIR) == HIGH;
  b.water_level = readWaterLevel();
  return b;
}

// Prints a number, or "--" if the value is not valid (less than 0).
void printValue(int value) {
  if (value < 0) {
    Serial.print("--");
  } else {
    Serial.print(value);
  }
}

void printReading(SensorReading b) {
  Serial.print("temperature=");
  if (isnan(b.temperature)) {
    Serial.print("--");
  } else {
    Serial.print(b.temperature, 1);
  }
  Serial.print(" C  humidity=");
  printValue(b.humidity);
  Serial.print(" %  light=");
  Serial.print(b.light);
  Serial.print("  soil=");
  Serial.print(b.soil);
  Serial.print(" %  motion=");
  if (b.motion) {
    Serial.print("yes");
  } else {
    Serial.print("no");
  }
  Serial.print("  water_level=");
  printValue(b.water_level);
  Serial.println(" %");
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
  Serial.println("Node 1 five-sensor monitor. One line every 2 seconds.");
}

void loop() {
  delay(2000);  // also meets the DHT22's rule: at most once every 2 seconds
  SensorReading reading = readSensors();
  printReading(reading);
}
```

**Expected output** (one line every 2 seconds; your numbers follow the conditions in your home):

```text
Node 1 five-sensor monitor. One line every 2 seconds.
temperature=28.4 C  humidity=71 %  light=2744  soil=37 %  motion=no  water_level=64 %
temperature=28.4 C  humidity=71 %  light=2751  soil=37 %  motion=yes  water_level=64 %
```

This code is long, but it's just pieces from Practices 1–6, rearranged:

- **Each sensor has its own reading function** (`readLight()`, `readSoilPercent()`, `readWaterLevel()`), which already takes care of noise, calibration, and inverting the numbers.
- **`readSensors()` fills in one complete form** and returns it — exactly the pattern of `readFakeSensor()` in Module 3, but this time with real readings.
- **Invalid values are flagged**, not hidden: `humidity` and `water_level` become `-1`, `temperature` stays `NAN`, and `printReading()` prints `--` for all three. `round()` rounds the humidity to the nearest whole number (71.6 becomes 72), because the data contract uses whole numbers.

**The "lying sensor" test.** Every time you pull out or plug in a wire, turn off the MB102 and unplug the USB first, then power up again in this order: USB first, then the MB102:

1. Pull the DHT22's yellow wire out of 8f: the temperature and humidity fields become `temperature=-- C  humidity=-- %`. Put it back.
2. Pull the white ECHO wire out of 19f: `water_level=-- %`. Put it back.
3. Turn off only the MB102 (leave the USB plugged in): the PIR and the HC-SR04 lose power, so you get `water_level=-- %` and `motion=no`. A sensor without power can't tell you it's dead — it just goes quiet. Turn the MB102 back on.

**In Wokwi:** use the Practice 7 [`diagram.json`](code/module06_five_sensor_monitor/diagram.json) and [`libraries.txt`](code/module06_five_sensor_monitor/libraries.txt).

1. Run the simulation. This diagram is wide; **click an empty area of the simulation panel, then press the F key** on your keyboard so the whole circuit is visible (**-** and **+** zoom out and in).
2. Click each sensor to change its value, as in Practices 1–6; the potentiometer in this diagram starts in a "moist" position (about 70%).

To keep things tidy, the power wires in this combined diagram are drawn as **symbols**: an upside-down triangle (▽) means GND, and an arrow labeled **VCC** means 3.3 V from the board. In Wokwi, the PIR and the HC-SR04 use that VCC symbol too and still work; **on your desk, both still get 5 V from the top rail.**

> ➡️ **Done with Practice 7?** Go straight on to [Practice 8](#practice-8--automatic-watering-and-automatic-lamp-30-minutes).

### Practice 8 — Automatic watering and automatic lamp (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (or Wokwi) and the whole workbench: the five sensors, the pump in the water tank (Practice 6), and the lamp relay on D32 from Module 5. Also have the glass of water ready for the soil sensor, plus a bottle cap or a small cup that doesn't let light through, to cover the LDR. Concepts used: 5 and 11.
>
> ⭐ **Required** — the second completion requirement: the pump refuses to run when the water tank is empty.

Node 1's first two automation rules:

- **Automatic watering.** If the soil is drier than 30% (the `soil_watering` number in Appendix A), run the pump for 3 seconds — **but** check the water tank right before the pump starts. If the tank is less than 20% full, or can't be read, **refuse**. After an attempt (pumped or refused), wait 15 reports (about 30 seconds) before trying again, so the water has time to soak in and the Serial Monitor isn't flooded with messages.
- **Automatic lamp.** If the PIR sees motion **and** the room is dark, switch on the lamp relay. When it's quiet again, switch it off.

#### 8.1 Upload the sketch

This sketch is Practice 7 plus the automation rules, so the easiest way is to copy it whole:

1. Create a new sketch `module06_auto_water_lamp`.
2. Right-click the link [`module06_auto_water_lamp.ino`](code/module06_auto_water_lamp/module06_auto_water_lamp.ino) → **Open link in new tab**, click **Copy raw file**, then paste it into your new sketch.
3. Replace the four calibration numbers (Practices 3 and 6) and, if needed, `DARK_THRESHOLD` (Practice 1.4) with your notes.
4. Plug in the USB, turn on the MB102, then click **Upload**.

The new parts of that sketch are below the two `NEW in Practice 8` markers, plus two pin constants in the pin map (`PIN_PUMP` and `PIN_LAMP_RELAY`), two state variables (`lampOn` and `wateringCooldownLeft`), a few lines in `setup()` (the pump pin and the lamp relay are set up, then the lamp is switched off right away), and two new calls at the end of `loop()`: `autoWatering(reading);` and `autoLamp(reading);`. The most important part is the pump function:

```cpp
// The pump only runs if the tank has enough water, measured right before the pump starts.
void runPump(int seconds) {
  seconds = constrain(seconds, 1, 10);  // safety limit: 1-10 seconds
  delay(60);  // HC-SR04 datasheet: wait at least 60 ms after the previous measurement (Concept 10)
  int waterLevel = readWaterLevel();
  if (waterLevel < MIN_WATER_LEVEL) {  // -1 (unreadable) is smaller too, so it is refused as well
    Serial.print("pump REFUSED: water level ");
    if (waterLevel < 0) {
      Serial.println("unreadable");
    } else {
      Serial.print("only ");
      Serial.print(waterLevel);
      Serial.println(" %");
    }
    return;
  }
  Serial.print("pump running for ");
  Serial.print(seconds);
  Serial.println(" seconds...");
  digitalWrite(PIN_PUMP, HIGH);
  delay(seconds * 1000);  // still blocks for now; Module 8 makes it work without delay()
  digitalWrite(PIN_PUMP, LOW);
}

void autoWatering(SensorReading b) {
  if (wateringCooldownLeft > 0) {  // just tried to water: wait first
    wateringCooldownLeft--;
    return;
  }
  if (b.soil < SOIL_WATERING_THRESHOLD) {
    Serial.print("Dry soil (");
    Serial.print(b.soil);
    Serial.print(" %): ");
    runPump(WATERING_SECONDS);                 // the tank safety check is inside runPump()
    wateringCooldownLeft = WATERING_COOLDOWN;  // pumped or refused: don't retry for about 30 seconds
  }
}

void autoLamp(SensorReading b) {
  bool dark = b.light < DARK_THRESHOLD;
  if (b.motion && dark && !lampOn) {
    Serial.println("Motion in the dark: lamp on.");
    setLamp(true);
  }
  if (!b.motion && lampOn) {
    Serial.println("All quiet: lamp off.");
    setLamp(false);
  }
}
```

Notice three design decisions:

- **The tank safety check is inside `runPump()`**, not in the watering rule. So a command to run the pump from anywhere — today's automation rule, a Serial command on Node 1, or a command over MQTT in Module 11 — still gets checked. A mini pump that runs without water breaks quickly.
- **The tank is measured again right before the pump starts**, 60 ms after the last measurement (HC-SR04 datasheet, Concept 10). This matters especially for manual commands and, later, for commands from the internet, which can arrive at any moment.
- **One `if` guards against two dangers**: a low tank and an unreadable tank (`-1`), as explained in Concept 11.

#### 8.2 Test the automatic watering

1. **Full tank, dry soil.** Hang the soil sensor in the air (dry, 0%). Within 2 seconds, `Dry soil (0 %): pump running for 3 seconds...` appears, and the pump sends water into the plant glass. About 30 seconds later, the rule tries again, because the sensor is still in the air. After you've seen one or two waterings, **dip the sensor into the glass of water** (100%): the watering stops.
2. **⭐ Empty tank.** Turn off the MB102, unplug the USB, then scoop all the water out of the tank with the glass without moving the bridge (the pump stays inside the now-empty tank). Take the soil sensor out of the glass of water, dry it with the cloth, and leave it in the air; then plug in the USB and turn on the MB102. `Dry soil (0 %): pump REFUSED: water level only 0 %` appears — the percentage may be slightly above zero — and **the pump stays still**. The message repeats about every 30 seconds while the tank is empty. **That's the second completion requirement.** If `pump REFUSED: water level unreadable` shows up first, the MB102 came on after the first reading; wait about 30 seconds until the `only 0 %` message appears.
3. **Refill the tank.** Within about 30 seconds, the rule tries again, and this time the pump runs. Dip the soil sensor into the glass of water so the watering stops.
4. **Unreadable tank.** Turn off the MB102, unplug the USB, then pull the white ECHO wire out of 19f. Plug in the USB and turn on the MB102 again, with the soil sensor in the air: `pump REFUSED: water level unreadable` appears. Turn off the MB102, unplug the USB, then put the wire back and dip the soil sensor into the glass of water again.

**Expected output** (an excerpt of the Serial Monitor during tests 1 and 2):

```text
temperature=28.4 C  humidity=71 %  light=2744  soil=0 %  motion=no  water_level=96 %
Dry soil (0 %): pump running for 3 seconds...
…
temperature=28.5 C  humidity=70 %  light=2740  soil=0 %  motion=no  water_level=0 %
Dry soil (0 %): pump REFUSED: water level only 0 %
```

#### 8.3 Test the automatic lamp

The automatic lamp needs two conditions at once: dark **and** motion. To make it easy to test, we only "darken" the LDR, not the whole room.

1. **Power up again.** Plug in the USB, then turn on the MB102. Wait about 1 minute until the PIR has finished its warm-up.
2. **Cover the LDR** with the bottle cap or the small cup that doesn't let light through: the `light` number drops below the dark threshold.
3. **Wave your hand** in front of the PIR: the lamp relay goes "click", and `Motion in the dark: lamp on.` appears. (If you built the LED lamp in the Module 5 Level 3 Challenge, that LED lights up too.)
4. **Hold still**: about 5 seconds later (the PIR's Tx time), `All quiet: lamp off.` appears and the relay releases.
5. **Lift the cover off the LDR**, then wave your hand again: this time the lamp does **not** switch on, because the room is bright.

During the first minute after the MB102 is turned on, the PIR is still warming up and may report false motion, so the lamp may switch on by itself for a moment. That's normal.

**In Wokwi:** use the Practice 8 [`diagram.json`](code/module06_auto_water_lamp/diagram.json) and [`libraries.txt`](code/module06_auto_water_lamp/libraries.txt). Run the simulation, then click an empty area of the simulation panel and press **F** so the whole circuit is visible. The LED labeled **pump** stands for the pump, and the relay with the LED labeled **lamp** stands for the lamp relay.

**Refusal test:**

1. Click the HC-SR04, then **first** drag **Distance** to the right to 20 cm or more (`water_level=0 %`).
2. Click the potentiometer, then press **End** to turn it all the way to the right (`soil=0 %`). `Dry soil (0 %): pump REFUSED: water level only 0 %` appears, and the pump LED stays off. (If you do it in the other order, the pump runs once, because the tank still has water — exactly as on a real board.)
3. Drag **Distance** back to the left to about 12 cm (below 17 cm): about 30 seconds later `pump running for 3 seconds...` appears, and the pump LED lights up.

**Lamp test:**

1. Drag the potentiometer knob to the middle (`soil` above 30%) so the automatic watering stops.
2. Click the LDR module, then drag the lux slider all the way to the left (dark).
3. Click the PIR, then click **Simulate motion**: the lamp LED lights up, and about 5 seconds later it goes off.

![Wokwi screenshot of the Practice 8 circuit, zoomed out with the F key, then cropped and enlarged; white component name labels added by the author. At the top, the Editing Ultrasonic Distance Sensor window with Distance at 20 centimeters (marker 1). Below it, the sideways ESP32 board at the bottom center; on the left the DHT22 (D14), a light-blue LED labeled LED = pump, which is off (marker 4), and a relay with a yellow LED labeled relay + LED = lamp; on the right the PIR (D34), the potentiometer standing in for the soil sensor, turned all the way to the right (marker 2), the LDR module (VP), and the HC-SR04 (tank). At the very bottom, the Serial Monitor with the line Dry soil (0 percent): pump REFUSED: water level only 0 percent (marker 3), and next to it the explanations of markers 1 to 4](assets/wokwi-watering-refused.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

> ➡️ **Done with Practice 8?** Continue to [Practice 9](#practice-9--save-to-github-15-minutes).

### Practice 9 — Save to GitHub (15 minutes)

> 🖥️ **Tools used:** **Arduino IDE**, **VS Code** (from Module 4), a phone camera, and **GitHub Desktop** (from Module 3). Concepts used: no new concepts.

1. **Save the sketches to the repository.** Already saved them straight into the `module-06` folder from the start (the **Tip** box at the beginning of the Practice section)? Skip this step. If not, open the sketches one at a time (**File → Sketchbook**), then choose **File → Save As…** and save them to **Documents → GitHub → learn-iot → module-06** (first create the `module-06` folder with **New folder** when you save the first sketch). These must be there: `module06_soil_calibration`, `module06_tank_distance`, and `module06_auto_water_lamp`.
2. **Write your calibration notes.** In VS Code, open the `learn-iot` folder (**File → Open Folder…**). In the Explorer panel, click the `module-06` folder first so the new file goes in there, then click the **New File…** icon and name it `calibration-notes.md`. Fill it with your numbers, for example:

   ```markdown
   # Sensor calibration notes (Module 6)

   | Sensor | Condition | Number |
   | --- | --- | --- |
   | LDR (`light`) | room light on | 2750 |
   | LDR (`light`) | room light off | 300 |
   | Soil sensor (`raw`) | in air = DRY | 2948 |
   | Soil sensor (`raw`) | in water = WET | 1352 |
   | HC-SR04 (`distance`) | full tank = DISTANCE_FULL | 6.2 cm |
   | HC-SR04 (`distance`) | empty tank = DISTANCE_EMPTY | 19.5 cm |
   ```

   Save it with **Ctrl + S**. These notes come in handy: if you ever install a replacement sensor, you'll know which numbers need to be measured again.
3. **Photograph your build.** Take one photo from above: both breadboards, all five sensors, and the water tank must be visible. Make sure no personal items end up in the photo. Move the photo to your laptop (over a data cable, with a sharing app, or by emailing it to yourself), rename it to **`sensor-workbench.jpg`**, then copy it into the `module-06` folder (in GitHub Desktop, **Repository → Show in Explorer** opens the right repository folder; macOS: **Show in Finder**).
4. In GitHub Desktop, make sure the **Current repository** box shows **learn-iot**. The **Changes** tab lists the new files in `module-06`. macOS users: untick `.DS_Store` if it shows up.
5. Fill in **Summary** with `Module 6: five sensors, calibration, automatic watering and lamp`, click **Commit … to main**, then **Push origin**.
6. Click **Repository → View on GitHub** and open the `module-06` folder: your sketches, notes, and photo are there.

No GitHub Desktop? Use the alternative path in the note at the end of [Module 4 Practice 10](../../phase-0-foundations/module-04-javascript-nodejs/README.md#practice-10--save-to-github-the-phase-0-checkpoint-15-minutes).

> ➡️ **After Practice 9:** do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home) — that's where all five sensors and both automation rules move into Node 1 — then finish with the [📝 Quiz](#-5-question-quiz) and the [✅ Completion checklist](#-module-6-completion-checklist). Open the 🚨 and 🔬 sections in between only when you need them.

---
## 🚨 Troubleshooting

This week, the most common problems aren't in the code but in **wires in the wrong hole** and **sensors that haven't been powered**. Two habits before you take anything apart: **turn off the MB102 and unplug the USB before changing any wire**, and **change just one thing, then test again**. **Stuck right now? Skip the table below** — the list of symptoms (collapsible titles you can click) comes right after it. The table sums up things you'll often find in other tutorials that are different in this curriculum.

| What other tutorials often do | What's right for this curriculum | Why |
| :--- | :--- | :--- |
| Analog sensors on GPIO 2, 4, 12–15, or 25–27 | Only GPIO 32–39 (ADC1); on Node 1: VP and VN | Those pins belong to ADC2, which can't be used while Wi-Fi is on (from Module 10 on). |
| `map(value, 0, 1023, …)` or `analogReadResolution(10)` | Keep it at 12 bits: `0`–`4095` | An Arduino Uno (10-bit) habit. On the ESP32, the number 1023 throws the percentage way off. |
| The HC-SR04's ECHO straight to an ESP32 pin | ECHO through a 4.7 kΩ + 10 kΩ divider | The HC-SR04's ECHO is as high as its supply voltage (5 V); the ESP32 pin limit is 3.6 V. |
| A DHT22 module powered with 5 V "to keep it stable" | 3.3 V from the bottom rail | The module's pull-up resistor goes to 5 V too, so pin D14 receives 5 V. |
| `DHTesp` (**DHT sensor library for ESPx**) or another DHT library | **DHT sensor library by Adafruit** 1.4.7 | Its function names are different (`getTemperature()` and so on); this module's code uses `readTemperature()` and `readHumidity()`. |
| A soil sensor with two bare metal prongs | A **capacitive** v1.2/v2.0 sensor | Metal prongs carrying a current rust quickly in wet soil. |
| Reading the DHT22 again and again in `loop()` without a pause | At most once every 2 seconds | Any faster than that, the library returns the old reading. |
| `pulseIn(PIN_ECHO, HIGH)` without a timeout | `pulseIn(PIN_ECHO, HIGH, 30000)` | Without a timeout, `pulseIn()` waits up to 1 second if ECHO never goes up (a loose wire, a sensor without power); if the echo doesn't come back, it answers with the sensor's own pulse of about 38 ms — a fake distance of about 650 cm. |
| Trusting the PIR as soon as it's switched on | Wait for the warm-up, about 1 minute | The first minute can contain false motion. |

<details>
<summary><b><code>Build failed!</code> / <code>Compilation error</code> — this week's error messages</b></summary>

The rule is the same as in Module 3: **look at the line number**, fix only the **first error**, then compile again.

| Message (excerpt) | What it means | Fix |
| :--- | :--- | :--- |
| `fatal error: DHT.h: No such file or directory` | The DHT library isn't installed. | Practice 4.1. In Wokwi, fill `libraries.txt` with the two lines from the practice folder; don't rely on the **INSTALL "DHT SENSOR LIBRARY" LIBRARY** button Wokwi offers, because it doesn't lock the version. |
| `fatal error: Adafruit_Sensor.h: No such file or directory` | The companion library **Adafruit Unified Sensor** isn't installed (usually because **INSTALL WITHOUT DEPENDENCIES** was clicked). | Search for **Adafruit Unified Sensor** in the Library Manager and install version 1.1.15. |
| `'DHT' does not name a type`, followed by `'dht' was not declared in this scope` | The `#include <DHT.h>` line is missing or misspelled. | Add `#include <DHT.h>` at the very top of the sketch. |
| `'struct SensorReading' has no member named 'waterLevel'; did you mean 'water_level'?` | A `struct` field name is misspelled. | Follow the data contract letter for letter: `water_level`, with an underscore (Concept 11). The compiler even suggests the right name. |

</details>

<details>
<summary><b>LDR: the number is always <code>4095</code>, always <code>0</code>, or jumps around</b></summary>

Remember the layout: 3.3 V → 10 kΩ → **column 34** → LDR → GND, and column 34 → 17f (VP).

- **`raw` is always `4095`** (`light` always `0`), whatever the light: the LDR isn't connected, so the midpoint is only pulled to 3.3 V by the 10 kΩ resistor. Check both LDR legs in 34i and 36i, and the black wire at 36j.
- **`raw` is always `0`** (`light` always `4095`): the top end of the divider isn't getting 3.3 V. Check the orange wire at 30j and the resistor at 30g–34g. Is the USB plugged in?
- **The number jumps around for no reason**, even when the LDR is covered: the VP pin is floating. The gray wire isn't in column 34 (lower) or in **17f (upper)** — column 17 is the VP pin; column 16 is VN.
- **The brighter it is, the bigger `raw` gets**: the LDR and the 10 kΩ resistor have swapped places. The circuit is still safe; move them so the numbers match Wokwi and this module's code.
- **The number only changes a little**: the resistor may not be 10 kΩ. Check its bands: brown-black-orange.

</details>

<details>
<summary><b>Soil sensor: the air and water numbers are almost the same, always <code>0</code>/<code>4095</code>, or drifting slowly</b></summary>

- **The air and water numbers differ by less than 500**: the timer chip is probably an NE555 (look at the marking on the chip), or the 1 MΩ resistor on its output line isn't connected (Concept 6). Try the second sensor from the kit.
- **Always `0` or always `4095`**: the AOUT wire doesn't reach 26h, the green wire 26j → 16f has moved, the green and orange jumpers are swapped (AOUT must go to 26h and VCC to 28h — they really do cross), or the sensor's VCC and GND are swapped. **If they're swapped, unplug the USB right away** (turn off the MB102 first if it's on); the sensor can be damaged.
- **The number changes when you hold the top of the sensor**: your hand becomes part of the "capacitor". Hold the sensor by its cable, or put it down.
- **The number drifts slowly over several days**: the edges of the board are soaking up water. Dry it, then paint the edges with clear nail polish (Concept 6).
- **`soil` shows 100% although the soil was only watered a little**: the sensor is pushed in past the limit line, or there's a puddle of water around it. Push it in only up to the line.

</details>

<details>
<summary><b>DHT22: <code>Failed to read the DHT22!</code> over and over, or strange numbers</b></summary>

- **Check the wires**: DATA to **8f (upper)** — column 8 is D14; VCC to the bottom rail (+); GND to the bottom rail (−). Did you match the pin labels on your module, not just the order in the picture?
- **The pin in the code** must be `14`, and the type `DHT22`.
- **Is your DHT22 a "bare" four-pin one** (without a module board)? Count the pins from the left with the sensor's grille facing you: pin 1 = VCC, pin 2 = DATA, pin 3 unused, pin 4 = GND. You also need to add a 10 kΩ resistor from DATA to 3.3 V as a pull-up (the two 10 kΩ resistors from the parts list are already used in Practices 1 and 6; take another one from your resistor pack). The 3-pin module already has one.
- **The temperature is always 2–3 °C higher** than a room thermometer: the sensor is too close to the warm ESP32 board or MB102. Move it away.
- **Is your sensor blue (DHT11)?** With `DHT22` in the code, a DHT11 usually doesn't answer at all (`Failed to read the DHT22!` over and over) or gives impossible numbers (temperatures in the hundreds of degrees, humidity above 100%). Replace `DHT22` in the code with `DHT11`. The other way around, `DHT11` in the code with a white DHT22 makes the temperature read about 1–2 °C — change it back to `DHT22`.
- **The humidity is stuck at 99.9%**: there's condensation inside the sensor, for example from breathing on it for too long. Let the sensor dry for a few minutes.

</details>

<details>
<summary><b>PIR: always HIGH, never HIGH, or "seeing ghosts"</b></summary>

- **Never HIGH**: the MB102 isn't on (the PIR needs 5 V from the top rail), the OUT wire isn't in **15f (upper)**, or VCC and GND are swapped. Also check the Sx knob, which may be turned to the shortest range.
- **Always HIGH**: it's still warming up (wait a full minute), the Tx knob is at the longest time (up to 5 minutes), or the PIR faces something that moves or changes temperature — a curtain blowing in the wind, a fan, the draft from an air conditioner, or moving sunlight.
- **Sometimes HIGH on its own even with nobody around**: PIR modules are sensitive to radio interference. Keep the PIR at least 20 cm away from the ESP32's antenna (the part of the board with the zigzag line) and from long wires.
- **Doesn't detect a person sitting still**: that's simply how a PIR works (Concept 9). A PIR detects motion, not presence.

</details>

<details>
<summary><b>HC-SR04: <code>No echo</code> all the time, jumping numbers, or the wrong distance</b></summary>

- **`No echo` all the time**:
  - The MB102 isn't on; the HC-SR04 needs 5 V from the top rail.
  - The ECHO wire isn't in **19f**, the TRIG wire isn't in **6e (lower)**, or VCC and GND are swapped.
  - The two divider resistors are swapped: pin D35 only receives about 1.6 V, below the guaranteed HIGH threshold. Measure as in Practice 6.2.
  - The temporary red wire from Practice 6.2 is still plugged into 19f, so ECHO is connected straight to 5 V. Turn off the MB102, unplug the USB, then remove that wire.
  - The object is too far (more than 4 m), too close (less than 2 cm), slanted, or soft (cloth, foam).
- **The number jumps around** (for example `12.3`, `47.1`, `12.4`): the echo is bouncing off the walls of a narrow container, off the pump or the hose, or the water surface is rippling. Use a wider container, put the sensor in the middle, facing straight down at the water, then wait until the water is calm.
- **It always reads 2–3 cm**: something is right in front of the sensor's "eyes", for example tape or the edge of the cardboard bridge.
- **The distance is normal, but you've never measured the divider?** Without the 10 kΩ resistor, the sensor still "works", even though D35 is receiving more than 3.6 V. Measure as in Practice 6.2.
- **`water_level` is always off by a few percent**: one of the calibration numbers was taken from the ruler instead of from `distance` in the Serial Monitor, or the bridge has moved. Repeat Practice 6.6 and use the `distance` number for both.

</details>

<details>
<summary><b>The pump doesn't refuse even though the tank is empty, or keeps refusing even though it's full</b> (important!)</summary>

- **Doesn't refuse even though the tank is empty** — dangerous, because the pump can run dry:
  - `DISTANCE_EMPTY` is too large. For example, the bottom of the container is really at 19.5 cm, but you wrote 30: an empty tank reads (30 − 19.5) ÷ (30 − 6.2) × 100 ≈ 44%, so it passes the check. Measure again (Practice 6.6).
  - The sensor sees the pump or the hose instead of the bottom of the container, so the distance reads shorter and the tank is taken to have water in it. Move the sensor away from the pump.
  - `DISTANCE_EMPTY` and `DISTANCE_FULL` are **swapped**: an empty tank actually reads about 100%. `DISTANCE_EMPTY` must be the larger number.
- **Keeps refusing even though it's full**:
  - The message says `unreadable`: an HC-SR04 problem (see the section above).
  - The message says `only 0 %`: `DISTANCE_EMPTY` and `DISTANCE_FULL` are swapped (dangerous, see above), `DISTANCE_EMPTY` is smaller than the distance to the water when the tank is full, or the water surface is less than 3 cm from the sensor.
- **The pump runs every 30 seconds without stopping**: the soil sensor is still hanging in the air (always 0%). Dip it into the glass of water or push it into wet soil.

</details>

<details>
<summary><b>The automatic lamp never switches on, or won't switch off</b></summary>

- **Never switches on**: the `light` number with the LDR covered is still above `DARK_THRESHOLD`. Look at the number in the Serial Monitor, then raise the threshold (Practice 1.4). Also check the PIR (section above) and the lamp relay wire from Module 5 (IN1 → 13f). A PIR Tx knob set too short can also make motion get missed: Node 1 only looks at the PIR about every 2 seconds, so turn Tx a little clockwise.
- **Won't switch off**: the PIR still sees motion (the Tx knob is set too long, or something is moving in front of it). The lamp only switches off after the PIR goes back to LOW.
- **The relay clicks, but your LED lamp doesn't light up**: check the lamp circuit from the Module 5 Level 3 Challenge. Without that circuit, the relay's click is enough of a sign.

</details>

<details>
<summary><b>Serial Plotter: empty, strange lines, or <code>value 1</code> appears</b></summary>

- **Empty**: the speed in the bottom right corner of the Serial Plotter window isn't **115200 baud**, or no port is selected.
- **Lines named `value 1`, `value 2`, … appear**: the sketch prints ordinary sentences, and the Serial Plotter treats every word as a new line. Use the Practice 2 sketch as it is, and don't add any `Serial.println("…")` with a sentence in it.
- **Strange lines appear right after the board restarts or finishes uploading**: the ESP32's boot messages get drawn too. Click the clear icon (trash can), or close the window and open it again.
- **The lines look like big waves even though the numbers barely change**: the Serial Plotter zooms in automatically. Read the numbers on its left axis (Practice 2.3).
- **Line names are cut off or merged**: the name before the colon must not contain spaces. `raw:1342` is right; `raw value:1342` is wrong.

</details>

<details>
<summary><b>Wokwi only</b></summary>

- **Clicking a sensor doesn't open its window**: another sensor's window is open. Close it first with the **✕**, then click the sensor again.
- **Part of the circuit is cut off the screen**: click an empty area of the simulation panel, then press **F** on your keyboard. The **-** and **+** keys zoom out and in.
- **Wokwi's numbers don't wobble at all**: that's normal; Wokwi doesn't simulate noise. Use `ARTIFICIAL_NOISE` in Practice 2.
- **`analogReadMilliVolts()` in Wokwi doesn't match your calculation**: for example, a `raw` of `1001` is reported as 984 mV, although the voltage in the diagram is about 0.81 V. Wokwi calculates it differently. On a real board, this function is actually more accurate than the rough estimate (🔬).
- **The combined diagrams use ▽ and VCC symbols**: triangle = GND, VCC = 3.3 V from the board. In Wokwi, the PIR, HC-SR04, relays, and servo use those symbols too; on your desk, all four still get 5 V from the top rail (MB102).
- **The small LED labeled LED1 on Wokwi's relay module lights up the wrong way around**: ignore it, just like in Module 5.

</details>

## 🔬 Technical Deep Dive (optional)

This section is for anyone curious about what happens "behind the scenes". You can skip it without missing anything for the next modules. Click a title to open it.

<details>
<summary><b>Correcting the curved ADC ruler with <code>analogReadMilliVolts()</code></b></summary>

Every ESP32 chip is measured at the factory, and the results are stored in the chip itself (in a special memory area called eFuse). The **`analogReadMilliVolts(pin)`** function uses that data to straighten the ADC ruler, then answers directly in **millivolts** (1 V = 1,000 mV). The result is much closer to the multimeter's number than the rough estimate `raw × 3.3 ÷ 4095`.

**Try it (real board only):** upload this sketch with the Practice 1 LDR circuit, then compare the `rough` and `corrected` numbers with the multimeter at **34j** (the Practice 1.2 method; hole 34h is already taken by the capacitor), under a few different lighting conditions:

```cpp
// Module 6 bonus: rough estimate vs analogReadMilliVolts() on VP (GPIO 36)
void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(36);
  int rough = raw * 3300 / 4095;             // "straight ruler", in millivolts
  int corrected = analogReadMilliVolts(36);  // straightened with the factory calibration data
  Serial.print("raw=");
  Serial.print(raw);
  Serial.print("  rough=");
  Serial.print(rough);
  Serial.print(" mV  corrected=");
  Serial.print(corrected);
  Serial.println(" mV");
  delay(500);
}
```

The `corrected` number is usually only a few dozen millivolts away from the multimeter, while the `rough` number can be off by hundreds of millivolts. When does this matter? When what you want to know really is **the voltage**, for example Node 2's battery voltage later on (Node 2's VP pin is reserved for that in `PIN-MAP.md`). For sensors that are calibrated against real conditions — the LDR, the soil sensor — the raw number is enough, because the ruler's curve gets "calibrated in" along with everything else.

Also remember these two limits: below about 0.15 V and above about 3.1 V, the ADC still can't tell anything apart, with or without correction. And in Wokwi, the `analogReadMilliVolts()` numbers don't match the voltage in the diagram (🚨, the Wokwi section), so this experiment only makes sense on a real board.
</details>

<details>
<summary><b>What does an accuracy of ±0.5 °C actually mean?</b></summary>

The DHT22 datasheet gives two numbers that people often mix up:

- **A resolution of 0.1 °C** — the smallest step it can show: 28.4, 28.5, 28.6, and so on.
- **An accuracy of ±0.5 °C** — how far that number may be off from the real temperature. If your room is exactly 28.0 °C, a healthy DHT22 may show any number from 27.5 to 28.5.

As a result, two DHT22s placed side by side can differ by up to 1 °C, and both are still "right" according to their datasheet. Humidity is the same: its accuracy is ±2%RH (±5%RH at worst), so readings of 71% and 74% from two sensors are still normal.

Want more accuracy? Compare it with a thermometer you trust, in the same place, after leaving both alone for 15 minutes. If your DHT22 always reads 0.3 °C higher, add a correction:

```cpp
const float TEMPERATURE_CORRECTION = -0.3;  // the result of comparing with a reference thermometer
// ...
float temperature = dht.readTemperature() + TEMPERATURE_CORRECTION;
```

This is **one-point** calibration: the number is only shifted. The two-point calibration in Concept 5 is more complete, because it also sets the slope of the line. What spoils accuracy more often, though, is **where the sensor is placed**: right next to a warm chip, in sunlight, or in the draft of an air conditioner (Practice 4.2).
</details>

<details>
<summary><b>Correcting the speed of sound with the DHT22's temperature</b></summary>

The number 58 in the HC-SR04 formula assumes a speed of sound of about 343 m/s, which is the speed of sound in air at 20 °C. The speed of sound rises by about 0.6 m/s for every 1 °C:

```text
speed of sound (m/s) ≈ 331.3 + 0.606 × temperature (°C)
```

At 35 °C, the speed is about 352.5 m/s, about 2.7% faster than at 20 °C. For a distance of 20 cm, the difference is about 5 mm — small for our water tank, but it can matter for distances of a few meters. Because Node 1 already has a DHT22, the correction takes only a few lines:

```cpp
// distance in cm, using the air temperature from the DHT22
float computeDistanceCm(unsigned long duration, float temperature) {
  if (isnan(temperature)) {
    temperature = 20;  // the DHT22 couldn't be read: use an assumed temperature
  }
  float speed = 331.3 + 0.606 * temperature;  // meters per second
  return duration * speed / 10000.0 / 2;      // m/s -> cm/µs, then divided by 2 (there and back)
}
```

Notice how this function treats `NAN`: it doesn't stop working; it uses a reasonable assumption instead. If the temperature is unknown, a slightly less accurate result is still more useful than no result at all.
</details>

<details>
<summary><b>Hysteresis: two thresholds so the lamp doesn't flicker</b></summary>

Our automatic lamp uses one threshold: `light < 1000` means dark. Picture dusk, when the light number slowly drops past `1000` while wobbling because of noise: `1003`, `998`, `1001`, `996`… The "dark" decision can flip back and forth with every report. For our automatic lamp, that's a small problem, because the dark decision is only used for switching on. But for a rule that switches on **and** off based on one number — for example, the fan based on temperature in Module 19 — the relay can go "click-click" over and over.

The cure is **hysteresis**: two thresholds with a gap between them. The "dark" decision only takes effect after the light drops below `900`, and is only withdrawn after the light rises above `1100`. In between, the old decision is kept:

```cpp
const int DARK_ENTER_THRESHOLD = 900;  // starts counting as dark below this number
const int DARK_EXIT_THRESHOLD = 1100;  // only counts as bright again above this number
bool dark = false;                     // the last decision, remembered between passes

void updateDark(int light) {
  if (!dark && light < DARK_ENTER_THRESHOLD) {
    dark = true;
  }
  if (dark && light > DARK_EXIT_THRESHOLD) {
    dark = false;
  }
}
```

You've met hysteresis many times without noticing: an air conditioner that turns on when the room reaches 26 °C and only turns off after it drops to 24 °C, or a hot water dispenser that doesn't switch on and off every second.
</details>

---
## 🧩 Independent Challenges

Three levels, starting with the easiest. Do at least Level 1. They all use the build that's already on your workbench.

> 🖥️ **Tools:** **Arduino IDE** and the complete build from Practices 1–8. Want to try it in Wokwi first? Levels 1 and 3 can use the [Node 1 `diagram.json`](code/node-1-home/diagram.json) with its [`libraries.txt`](code/node-1-home/libraries.txt), which contain all the sensors and actuators, including the buzzer. For Level 2, the [Practice 7 `diagram.json`](code/module06_five_sensor_monitor/diagram.json) is enough.

**Level 1 — A small change: an empty-tank alarm.** Make the passive buzzer from Module 5 go "beep-beep" every time the pump is refused, so the people in the house know the water tank needs refilling. Hints:

- Open `module06_auto_water_lamp`, then **right away** choose **File → Save As…** and name it `module06_tank_alarm` before you change anything.
- Add `const int PIN_BUZZER = 27;` to the pin map, and `ledcAttach(PIN_BUZZER, 2000, 10);` at the end of `setup()`.
- Write a `void soundAlarm()` function that plays two short tones: `ledcWriteTone(PIN_BUZZER, 2000)`, `delay(150)`, `ledcWriteTone(PIN_BUZZER, 0)`, `delay(100)`, then the same again.
- Call `soundAlarm()` in the **refused** branch of `runPump()`, right before `return;`.
- You've got it if the buzzer beeps twice along with the `pump REFUSED` message, and stays quiet when the pump is allowed to run.

**Level 2 — Combine: five sensors in one graph.** Show the temperature, humidity, light, soil, and water level **all at once** in the Serial Plotter. Hints:

- Save `module06_five_sensor_monitor` under a new name, `module06_sensor_graph`.
- Replace the contents of `printReading()` so the function prints one line in the format `temperature:28.4,humidity:71,light_scaled:66,soil:37,water_level:64` (remember Practice 2: no other sentences, names without spaces). Also delete the `Serial.println(...)` in `setup()`; that opening sentence would be drawn as strange lines.
- The catch: light ranges from `0` to `4095`, while the others go from `0` to `100`, so the other lines look flattened at the bottom of the graph. Send `light / 41` instead, so its scale is also roughly 0–100. Name that line `light_scaled`.
- Change `delay(2000)` in `loop()` to `delay(500)`. The DHT22 stays safe: if it's asked more often than every 2 seconds, the library returns the previous reading.
- You've got it if all five lines show up together and each one reacts when you disturb its sensor (cover it, breathe on it, dip it, move in front of it).

**Level 3 — Design it yourself: an honest soil sensor.** Right now, if the soil sensor's AOUT wire comes out, the VN pin floats and Node 1 may think the soil is dry — and then water nonstop. Design a check that flags a soil reading as **invalid** (`-1`), and make sure the automatic watering **never** waters when `soil` is `-1`. Starting hints:

- A raw number far outside the calibration range — for example, more than `SOIL_DRY + 300`, or less than `SOIL_WET - 300` — is suspicious. First test which numbers show up when the AOUT wire is pulled out (turn off the MB102 and unplug the USB first; power up again with the USB first, then the MB102).
- Print `--` for an invalid soil reading, like `humidity` and `water_level`.
- Think about it: what's the safe action when the soil is unknown — watering or not watering? Write your reasoning as a comment in the code.

There's no answer key for Level 3 — if your check catches a pulled-out wire without wrongly accusing a healthy sensor, you got it right.

---

## ➕ Add-on to "Mini Smart Home"

Module 6's contribution to the running project: **all five of Node 1's senses are read for real**, the sample numbers in `readSensors()` are gone for good, and the `controlActuators()` shelf, empty since Module 3, finally holds **the first two automation rules**. The result: Node 1 **v0.3.0**. Like last week, you fill those shelves yourself with code from the Practices; the complete reference version is in [`mini-smart-home/firmware/node-1-home/`](../../mini-smart-home/firmware/node-1-home/node-1-home.ino).

> 🖥️ **Tools used:** **Arduino IDE** (with the ESP32Servo library from Module 5 and the DHT sensor library and Adafruit Unified Sensor from Practice 4), **VS Code**, **GitHub Desktop**, and the complete build. No board? Every step can be tested in Wokwi with Node 1's [`diagram.json`](code/node-1-home/diagram.json) and [`libraries.txt`](code/node-1-home/libraries.txt); press **F** to see the whole circuit. In that diagram, power is drawn as ▽ (GND) and VCC (3.3 V) symbols, and the lamp, fan, and pump are represented by labeled LEDs — don't copy that on a real board (🚨, the Wokwi section).

### A. Update `PIN-MAP.md`

Since Module 5, all five sensors have had the status "reserved" in `PIN-MAP.md`. Now their status becomes "connected".

1. In VS Code, open your project's repository folder (**File → Open Folder…** → **Documents → GitHub → mini-smart-home**), then open `PIN-MAP.md`.
2. Open the reference version of [`PIN-MAP.md`](../../mini-smart-home/PIN-MAP.md) in a new tab, click **Copy raw file**, then replace everything in your file with it (**Ctrl + A**, then **Ctrl + V**). What changed: the six sensor rows in the Node 1 table are now **connected**, with their wiring notes; the power rails table lists the 5 V sensors (PIR and HC-SR04) on the top rail; and the **History** table gets a version 2 row. The pin map is the same for every learner, so it's fine to copy it whole.
3. Save it (**Ctrl + S**).

### B. Fill Node 1's shelves to make v0.3.0

Open **`node-1-home.ino`** in Arduino IDE: **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home**. Make the following changes from top to bottom. After each step, click **Verify** (✓) so typos show up right away. The steps are ordered so that every Verify along the way succeeds; if an error appears, check the step you just did.

**Step 1 — The very top: comments, libraries, and version.** Replace all the lines from the first line through `const String FIRMWARE_VERSION = "0.2.0";` with this block:

```cpp
// Node 1 "Home" - firmware v0.3.0 (updated in Module 6)
// The running project: Mini Smart Home.
//
// New in v0.3.0: all five Node 1 sensors are read for real (DHT22, LDR, soil sensor,
// PIR, HC-SR04), plus a first, local version of two automation rules:
// "automatic watering" (refused if the water tank is too low) and "automatic lamp".
// You can still try the actuators from the Serial Monitor, for example:
// lamp on, fan off, pump 3, curtain 90, beep, status.
//
// Libraries: ESP32Servo version 3.2.1, DHT sensor library version 1.4.7
// (installed with it: Adafruit Unified Sensor version 1.1.15).

#include <ESP32Servo.h>
#include <DHT.h>
#include <esp_system.h>  // esp_reset_reason()

const String FIRMWARE_VERSION = "0.3.0";
```

**Step 2 — The pin map.** Right below the line `const int PIN_BUZZER = 27;         // Module 5, passive buzzer`, add these six lines:

```cpp
const int PIN_DHT = 14;            // Module 6, DHT22
const int PIN_LDR = 36;            // Module 6, VP: LDR (ADC1)
const int PIN_SOIL = 39;           // Module 6, VN: capacitive soil sensor (ADC1)
const int PIN_PIR = 34;            // Module 6, PIR
const int PIN_TRIG = 15;           // Module 6, HC-SR04 TRIG
const int PIN_ECHO = 35;           // Module 6, HC-SR04 ECHO through a voltage divider
```

Then **delete** the comment line `// Module 6: DHT22 = 14, LDR = 36 (VP), soil = 39 (VN), PIR = 34, HC-SR04 TRIG = 15, ECHO = 35` below them — those pins are no longer "reserved"; they're connected.

**Step 3 — Calibration, rules, form, and state.** Replace all the lines from `// The sensor data form. Its field names follow the data contract (Syllabus Appendix A).` through `int loopCount = 0;` with the block below. Don't forget to replace the four calibration numbers with your notes from Practices 3 and 6, and `DARK_THRESHOLD` with your result from Practice 1.4.

```cpp
// ---------- Module 6: your calibration results (Practices 3 and 6) ----------
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

// ---------- Module 6: automation rules, local version ----------
const int SOIL_WATERING_THRESHOLD = 30;  // Appendix A: "soil_watering"
const int MIN_WATER_LEVEL = 20;          // the pump is refused if the tank is less than 20% full
const int WATERING_SECONDS = 3;          // how long the pump runs when watering automatically
const int WATERING_COOLDOWN = 15;        // after a watering attempt, wait 15 reports (about 30 seconds)
const int DARK_THRESHOLD = 1000;         // light below this counts as dark

// The sensor data form. Its field names match the data contract (Syllabus Appendix A) EXACTLY.
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

// Current actuator states (sent later in the "ack", Appendix A)
bool lampOn = false;
bool fanOn = false;
int curtainAngle = 90;

bool lampByAutomation = false;  // true if the lamp was turned on by autoLamp()
int wateringCooldownLeft = 0;   // how many more reports before watering may be tried again

Servo curtainServo;
DHT dht(PIN_DHT, DHT22);
int loopCount = 0;
```

**Step 4 — `setLamp()`.** Add one line below `lampOn = isOn;` so that the function becomes:

```cpp
void setLamp(bool isOn) {
  lampOn = isOn;
  lampByAutomation = false;  // assume a manual command; autoLamp() marks its own
  if (isOn) {
    digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
  } else {
    digitalWrite(PIN_LAMP_RELAY, HIGH);
  }
}
```

**Step 5 — The sensor shelf.** Replace all the lines from the label `// ---------- Modules 6-7: read the real sensors ----------` through the closing curly brace of the `readSensors()` function with this block. The label changes to "Module 6" too, because Node 1's five sensors are now complete.

```cpp
// ---------- Module 6: read the real sensors ----------
// Averages 20 analog readings in a row to smooth out the noise.
int readAnalogAverage(int pin) {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(pin);
    delay(2);
  }
  return sum / 20;
}

int readLight() {
  return 4095 - readAnalogAverage(PIN_LDR);  // inverted: the brighter it is, the bigger the number
}

int readSoilPercent() {
  int percent = map(readAnalogAverage(PIN_SOIL), SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

// Measures the distance once, in cm. Returns -1 if the echo doesn't come back.
float measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) {
    return -1;
  }
  return duration / 58.0;
}

int readWaterLevel() {
  float distance = measureDistanceCm();
  if (distance < 0) {
    return -1;  // unknown
  }
  int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
  return constrain(percent, 0, 100);
}

SensorReading readSensors() {
  SensorReading b;
  b.temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(humidity)) {
    b.humidity = -1;
  } else {
    b.humidity = round(humidity);  // rounded to the nearest whole number
  }
  b.light = readLight();
  b.soil = readSoilPercent();
  b.motion = digitalRead(PIN_PIR) == HIGH;
  b.water_level = readWaterLevel();
  return b;
}
```

**Step 6 — `runPump()` gets the tank safety check.** Replace the whole `runPump()` function with the Practice 8 version below. This block starts with one new comment line, so paste that line too, right above the function:

```cpp
// Module 6: the pump only runs if the tank has enough water, measured right before the pump starts.
void runPump(int seconds) {
  seconds = constrain(seconds, 1, 10);  // safety limit: 1-10 seconds
  delay(60);  // HC-SR04 datasheet: wait at least 60 ms after the previous measurement (Concept 10)
  int waterLevel = readWaterLevel();
  if (waterLevel < MIN_WATER_LEVEL) {  // -1 (unreadable) is smaller too, so it is refused as well
    Serial.print("pump REFUSED: water level ");
    if (waterLevel < 0) {
      Serial.println("unreadable");
    } else {
      Serial.print("only ");
      Serial.print(waterLevel);
      Serial.println(" %");
    }
    return;
  }
  Serial.print("pump running for ");
  Serial.print(seconds);
  Serial.println(" seconds...");
  digitalWrite(PIN_PUMP, HIGH);
  delay(seconds * 1000);  // still blocks for now; Module 8 makes it work without delay()
  digitalWrite(PIN_PUMP, LOW);
}
```

**Step 7 — `setupPins()` sets up the sensors.** At the end of the `setupPins()` function, right below `ledcAttach(PIN_BUZZER, 2000, 10);` and before the closing curly brace `}`, add one blank line, then these lines:

```cpp
  // Module 6: sensors
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
```

**Step 8 — The `pump` command.** In `checkSerialCommand()`, **delete** the line `Serial.println("pump running...");`. Now `runPump()` itself announces whether the pump is running or refused; if you left that line in, Node 1 could print `pump running...` right before `pump REFUSED`.

**Step 9 — The automation rules shelf.** Replace all the lines from the label `// ---------- Modules 6 & 19: automation rules (watering, lamp, fan) ----------` through the closing curly brace of the `controlActuators()` function with this block:

```cpp
// ---------- Modules 6 & 19: automation rules (watering, lamp, fan) ----------
void autoWatering(SensorReading b) {
  if (wateringCooldownLeft > 0) {  // just tried to water: wait first
    wateringCooldownLeft--;
    return;
  }
  if (b.soil < SOIL_WATERING_THRESHOLD) {
    Serial.print("Dry soil (");
    Serial.print(b.soil);
    Serial.print(" %): ");
    runPump(WATERING_SECONDS);                 // the tank safety check is inside runPump()
    wateringCooldownLeft = WATERING_COOLDOWN;  // pumped or refused: don't retry for about 30 seconds
  }
}

void autoLamp(SensorReading b) {
  bool dark = b.light < DARK_THRESHOLD;
  if (b.motion && dark && !lampOn) {
    Serial.println("Motion in the dark: automatic lamp on.");
    setLamp(true);
    lampByAutomation = true;
  }
  if (!b.motion && lampByAutomation) {  // only turns off a lamp it turned on itself
    Serial.println("All quiet: automatic lamp off.");
    setLamp(false);
  }
}

void controlActuators(SensorReading b) {
  autoWatering(b);
  autoLamp(b);
  // Module 19 adds the automatic fan (Appendix A: "temp_fan_on")
}
```

`autoLamp()` here is slightly different from Practice 8: it has the **`lampByAutomation`** variable. Node 1 has a button and the `lamp on`/`lamp off` commands, so the automation rule needs to know **who turned the lamp on**. If you turned it on yourself with the button or a command, the automation rule won't turn it off when things are quiet; it only turns off a lamp it turned on itself. That's why `setLamp()` in Step 4 always clears that flag, and `autoLamp()` sets it again after turning the lamp on. Note: only a lamp that a human *turned on* is protected; if you *turn it off* while there's still motion in the dark, the automation rule turns it back on at the next report.

**Step 10 — `printReading()`.** Replace all the lines from `// Prints the reading to the Serial Monitor (our own helper).` through the closing curly brace of the `printReading()` function with this block:

```cpp
// Prints a number, or "--" if the value is not valid (less than 0).
void printValue(int value) {
  if (value < 0) {
    Serial.print("--");
  } else {
    Serial.print(value);
  }
}

// Prints the reading to the Serial Monitor (our own helper).
void printReading(SensorReading b) {
  Serial.print("temperature=");
  if (isnan(b.temperature)) {
    Serial.print("--");
  } else {
    Serial.print(b.temperature, 1);
  }
  Serial.print(" C  humidity=");
  printValue(b.humidity);
  Serial.print(" %  light=");
  Serial.print(b.light);
  Serial.print("  soil=");
  Serial.print(b.soil);
  Serial.print(" %  motion=");
  if (b.motion) {
    Serial.print("yes");
  } else {
    Serial.print("no");
  }
  Serial.print("  water_level=");
  printValue(b.water_level);
  Serial.println(" %");
}
```

`setup()` and `loop()` **don't change**: `loop()` has been calling `readSensors()`, `printReading()`, and `controlActuators()` since Module 3. That's what the shelves built from the start are for — this week you just fill them in.

### C. Test Node 1

1. Click **Verify**. If an error appears, compare the line the error message points to with the [reference version](../../mini-smart-home/firmware/node-1-home/node-1-home.ino).
2. Make sure the water tank has water in it and the soil sensor is in moist soil or dipped in the glass of water (so the automatic watering doesn't start right away). Plug in the USB, turn on the MB102, then click **Upload**. Open the Serial Monitor (**New Line**, 115200 baud).

   **Expected output:**

   ```text
   Node 1 Home - firmware 0.3.0
   Last restart reason: POWERON
   status: lamp=off fan=off curtain=90
   temperature=28.4 C  humidity=71 %  light=2744  soil=63 %  motion=no  water_level=96 %
   ```

3. **The pump safety check for manual commands.** Empty the water tank (turn off the MB102 and unplug the USB first, as in Practice 8.2), then plug in the USB, turn on the MB102, open the Serial Monitor again, and type `pump 3`: Node 1 answers `pump REFUSED: water level only 0 %`. Refill the tank the same way, then type `pump 2`: `pump running for 2 seconds...` appears and the pump really runs. Also type `pump xyz`: the answer is still `Need a number of seconds. Example: pump 3`.
4. **Automatic lamp.** Cover the LDR, then wave your hand in front of the PIR: `Motion in the dark: automatic lamp on.` Hold still: `All quiet: automatic lamp off.`
5. **Manual commands win.** Type `lamp on`, cover the LDR, wave your hand, then hold still: the lamp **stays on**, because you're the one who turned it on. Type `lamp off` to turn it off. The manual button on D13 still works as in Module 5, too.
6. **Automatic watering.** Lift the soil sensor into the air: within 2 seconds, `Dry soil (0 %): pump running for 3 seconds...` appears. Dip it back into the water.
7. The other Module 5 commands (`fan on`, `curtain 45`, `beep`, `status`) still work.

![Wokwi screenshot of the complete Node 1 v0.3.0, zoomed out with the F key, then cropped and enlarged; white component name labels added by the author. At the top, the PIR Motion Sensor window with its Simulate motion button boxed in red. The circuit: the sideways ESP32 board at the bottom center with the D4 status LED below it; on the left the D13 button, the DHT22, the buzzer, the curtain servo, LED = pump, relay + LED = fan, and relay + LED = lamp, whose yellow LED is on (marker 2); on the right the PIR (D34), the potentiometer standing in for the soil sensor, the LDR (VP), and the HC-SR04 (tank). At the very bottom, the Serial Monitor with the line pump REFUSED: water level only 0 percent after the command pump 3 with Distance at 20 centimeters (marker 1) and the line Motion in the dark: automatic lamp on. (marker 3), with the explanations of the three markers next to it](assets/wokwi-node-1-v3.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

### D. Commit and push

1. In GitHub Desktop, choose **`mini-smart-home`** in the **Current repository** box — always check this box before you commit!
2. The **Changes** tab lists two changed files: `PIN-MAP.md` and `firmware/node-1-home/node-1-home.ino`.
3. Fill in **Summary** with `Node 1 v0.3.0: five sensors, automatic watering and lamp (Module 6)`, click **Commit 2 files to main**, then **Push origin**.

> [!IMPORTANT]
> **A safe automation rule always asks, "What if the sensor is lying?"** The pump refuses to run when the tank can't be read, and the automatic lamp doesn't dare turn off a lamp that a human turned on. This way of thinking stays with us: in Module 19, the automation rules can be set from the server, but local safety rules like these stay on Node 1 — so the house stays safe even when the internet goes down.

---
## 📖 Glossary

| Term | Beginner-friendly meaning |
| :--- | :--- |
| **Sensor** | A component that turns something in the real world (brightness, heat, wetness, distance, motion) into an electrical signal. |
| **Analog / digital** | An analog signal can have any value between 0 and 3.3 V; a digital signal is only HIGH or LOW. |
| **ADC** | *Analog-to-Digital Converter*: the part of the chip that measures a voltage and answers with a number. The ESP32's ADC is 12-bit: `0`–`4095`. |
| **Bit** (12 bits) | The smallest unit of digital data. Twelve bits means 2¹² = 4,096 possible numbers. |
| **ADC1 / ADC2** | The ESP32's two ADCs. ADC2 can't be used while Wi-Fi is on, so our analog sensors are always on ADC1 (GPIO 32–39). |
| **Not linear** | Not proportional; the ESP32's ADC ruler isn't perfectly straight, and it's blunt at both ends. |
| **Floating** | The state of a pin that isn't connected to anything, so its reading jumps around for no reason. |
| **Voltage divider** | Two resistors in series that split a voltage in proportion to their resistances: V_mid = V_in × R_bottom ÷ (R_top + R_bottom). |
| **LDR** | *Light Dependent Resistor*, a light-sensitive resistor: its resistance gets smaller when it's bright. |
| **Lux** | A unit of brightness. A dark bedroom is about 1 lux, a lit room hundreds of lux, blazing sunlight up to about 100,000 lux. |
| **Noise** | Small random wobbles in an electrical signal that keep a sensor reading from ever holding still. |
| **Quick average** (*oversampling*) | Reading a sensor many times in quick succession, then taking the average. |
| **Moving average** | The average of a number of the **latest** readings; each new reading replaces the oldest one. |
| **100 nF ceramic capacitor** ("104") | A small capacitor without polarity, placed from the ADC pin to GND as a noise damper. |
| **Serial Plotter** | A tool in Arduino IDE (and Wokwi) that draws the numbers from Serial as lines on a graph. |
| **Calibration** | Matching a sensor's raw numbers to real conditions. Two-point calibration uses two situations whose answers are known (for example, air and water). |
| **`map()` / `constrain()`** | `map()` rescales a number along a straight line (without fencing it in); `constrain()` fences a number in so it stays between a lower and an upper limit. |
| **Capacitive / resistive soil sensor** | A capacitive sensor measures changes in capacitance without any exposed metal (it lasts); a resistive one sends a current through two metal prongs (they rust quickly). |
| **Limit line** | A line on the soil sensor board; the part above it (the electronics) must not get wet. |
| **Heat-shrink tubing** | Plastic tubing that shrinks when heated; used to wrap and protect things. |
| **Drip loop** | A cable bent so it dips lower than its connector, so drops of water fall off the lowest point of the cable. |
| **Datasheet** | The component maker's official document with its voltage limits, range, accuracy, timing, and pins. |
| **Resolution / accuracy** | Resolution = the smallest step it can show (DHT22: 0.1 °C). Accuracy = how far a reading may be off from the real value (DHT22: ±0.5 °C). |
| **%RH** | *Relative humidity*: how full the air is of water vapor, 0–100%. |
| ***Pull-up* resistor** | A resistor from a data wire to VCC that keeps the wire HIGH when nothing pulls it LOW; the 3-pin DHT22 module already has one. |
| **Single-wire protocol** | A way of talking in both directions over one data wire, taking turns, with strict timing rules (used by the DHT22). |
| ***Checksum*** | A check number at the end of a data transmission; if it doesn't match, the data was damaged along the way. |
| **Companion library** (*dependency*) | Another library that a library needs in order to work; for example, Adafruit Unified Sensor for the DHT library. |
| **`NAN`** | *Not a Number*: the DHT library's answer when a reading fails. Checked with `isnan()`. |
| **PIR** | *Passive Infrared*: a sensor that picks up changes in the heat (infrared) given off by warm objects that move. |
| **Fresnel lens** | The ridged plastic dome in front of a PIR that splits its view into many tiles. |
| **Warm-up** | The waiting time after a sensor gets power until its readings can be trusted; a PIR needs about 1 minute. |
| **Ultrasound** | Sound above the limit of human hearing (HC-SR04: 40 kHz). |
| **`pulseIn()`** | A function that measures how long a pin stays HIGH (or LOW), in microseconds. |
| **Microsecond** (µs) | One millionth of a second. |
| **Water tank** | The water container for the pump; its water level is measured with the HC-SR04. |
| **Data contract** | The agreement on the name and unit of every piece of data, used by every part of the project (Syllabus Appendix A). |
| **Invalid value** | A special value that flags a failed reading, for example `NAN` or `-1`, so it isn't mistaken for a real reading. |
| **Local safety rule** | A safety rule that the device itself runs, for example the pump refusing to run when the tank is empty, so it keeps working even when the internet goes down. |
| ***Errata*** | An official list of mistakes or quirks found in a chip after it was made, with ways to avoid them. |
| **Hysteresis** | Two thresholds with a gap between them (for example, dark below 900, bright again above 1100), so a decision doesn't flip back and forth around a single number. |

---

## 📝 5-Question Quiz

Answer in your notes first, then open the key. Pass = at least 4 correct.

1. The HC-SR04 gets 5 V, and its ECHO pin is connected to a voltage divider with a 4.7 kΩ resistor on top and a 10 kΩ resistor on the bottom. (a) What's the voltage at the midpoint when ECHO is HIGH? (b) Is that safe for an ESP32 pin, and is it still read as HIGH? (c) What happens if the two resistors are swapped?
2. Your friend connected a soil sensor to GPIO 25. Everything works fine — until they turn on Wi-Fi in Module 10, and the readings suddenly go haywire. (a) Why? (b) Which pins should have been chosen for analog sensors? (c) Which pins are Node 1's LDR and soil sensor connected to?
3. Your soil sensor reads `3100` in air and `1400` in water. (a) What's the result of `map(2250, 3100, 1400, 0, 100)`? (b) One afternoon the sensor reads `3400`. What does `map()` return, why is that number a problem, and how do you fix it?
4. Your DHT22 sketch keeps printing `Failed to read the DHT22!`. (a) What value does `readTemperature()` return when it fails, and how does the code detect it? (b) Name two possible causes. (c) Why does our DHT22 module get 3.3 V, not 5 V?
5. On Node 1, `readWaterLevel()` answers `-1`. (a) What does that mean? (b) What does `runPump()` do if it's asked to run at that moment, and why is one `if` enough to guard against two dangerous situations? (c) Why is the tank safety check placed inside `runPump()`, not inside `autoWatering()`?

<details>
<summary><b>Answer key & explanations</b></summary>

1. (a) 5 × 10 ÷ (4.7 + 10) = 5 × 10 ÷ 14.7 ≈ **3.40 V**. (b) **Safe**, because it's below the ESP32 pin limit of 3.6 V (3.3 V + 0.3 V), and **read as HIGH**, because it's above the threshold of about 0.75 × 3.3 V ≈ 2.5 V. (c) The result is 5 × 4.7 ÷ 14.7 ≈ **1.60 V**: still safe, but below the guaranteed HIGH threshold (about 2.5 V), so `pulseIn()` may not see the pulse at all (the sketch prints `No echo`) or may read it erratically.
2. (a) GPIO 25 belongs to **ADC2**, which is borrowed by the Wi-Fi radio; while Wi-Fi is on, `analogRead()` on ADC2 pins fails. (b) **ADC1** pins: GPIO 32–39, which on our 30-pin board means GPIO 32, 33, 34, 35, 36 (VP), and 39 (VN). (c) The LDR is on **VP (GPIO 36)** and the soil sensor on **VN (GPIO 39)** — both ADC1. That's the third completion requirement.
3. (a) (2,250 − 3,100) × (100 − 0) ÷ (1,400 − 3,100) + 0 = −85,000 ÷ (−1,700) = **50**, so 50%. (b) (3,400 − 3,100) × 100 ÷ (1,400 − 3,100) = 30,000 ÷ (−1,700) = −17.6, and because `map()` uses whole numbers, the result is **−17**. A moisture of −17% is impossible; `map()` simply doesn't fence its result in when the raw number leaves the calibration range. The fix is `constrain(percent, 0, 100)`, so −17 becomes **0%**.
4. (a) **`NAN`** ("not a number"), detected with **`isnan(temperature)`** — `NAN` can't be compared like an ordinary number. (b) Any two of: the DATA wire is loose or in the wrong hole (it should be 8f, above D14); VCC or GND isn't connected, or they're swapped; the pin in the code isn't 14, or the type isn't `DHT22`; a bare four-pin DHT22 is used without a pull-up resistor; or the sensor is broken. (c) The 3-pin module has a pull-up resistor from DATA to VCC, so the voltage on the DATA wire equals VCC. If the module gets 5 V, pin D14 receives 5 V, over the 3.6 V limit.
5. (a) The HC-SR04 **hears no echo**: the water level is **unknown** — for example, the ECHO wire is loose, the MB102 is off, or something is blocking the sensor. (b) The pump is **refused** with the message `pump REFUSED: water level unreadable`. One `if (waterLevel < MIN_WATER_LEVEL)` is enough because `-1` is smaller than `20`, so "the tank is almost empty" and "the tank level is unknown" both end with the safe action: the pump doesn't run. (c) So that **every** command that runs the pump gets checked: the automatic watering rule, the Serial command `pump 3`, and later the commands from the server (Module 11). If the safety check were only in `autoWatering()`, a manual command could run the pump in an empty tank.

</details>

---

## ✅ Module 6 Completion Checklist

Check the boxes honestly. The ⭐ boxes are the **official completion requirements** from the Syllabus; the rest are highly recommended. If everything is checked, mark Module 6 in your copy of [`PROGRESS.md`](../../PROGRESS.md) and continue to Module 7.

- [ ] My LDR is connected to VP; its midpoint voltage was shown to change with the light (multimeter), and I've set the dark threshold for my room (Practice 1).
- [ ] I've seen noise and the moving average in the Serial Plotter, and the 100 nF capacitor is in place at 34h–36h (Practice 2).
- [ ] ⭐ **My soil sensor reads about 0% in air and about 100% in water** after calibration (Practice 3).
- [ ] My DHT22 is read on a 3.3 V supply, and the failure message appears (not a nonsense number) when the DATA wire is pulled out (Practice 4).
- [ ] My PIR detects motion after the warm-up, and the status LED lights up along with it (Practice 5).
- [ ] The ECHO voltage divider measured 3.1–3.6 V (about 3.4 V) **before** the HC-SR04 was connected, and I've calibrated the water tank level (Practice 6).
- [ ] The five-sensor monitor prints one neat line every 2 seconds, and failed readings show up as `--` (Practice 7).
- [ ] ⭐ **The pump refuses to run when the water tank is empty** (Practice 8).
- [ ] The automatic lamp switches on when it's dark and there's motion, then off when it's quiet (Practice 8).
- [ ] ⭐ **All my analog sensors are on ADC1 pins**: the LDR on VP (GPIO 36) and the soil sensor on VN (GPIO 39) (Concept 2).
- [ ] The `module-06` folder, `calibration-notes.md`, and `sensor-workbench.jpg` have been pushed to the `learn-iot` repository (Practice 9).
- [ ] Node 1 v0.3.0 and `PIN-MAP.md` version 2 have been pushed to the `mini-smart-home` repository, and I've tested its pump safety check and automatic lamp (➕).
- [ ] ⭐ **Quiz: at least 4 out of 5 correct.**

**You pass when** (according to the Syllabus): *the soil sensor reads about 0% in air and about 100% in water, the pump refuses to run when the water tank is empty, and all your analog sensors are on ADC1 pins.*

**Toward the Phase 1 completion criteria** ([Syllabus §8](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)): Node 1 now has hands and senses, and the photo of your sensor build adds to your collection of Phase 1 circuit photos. Robust firmware v1.0 that can run for 24 hours follows in Module 8, a measured battery sketch in Module 9, and a 30-second video at the end of Phase 1.

---

## 📚 Sources & Image Credits

The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The two images that contain Wikimedia Commons photos (`pir-anatomy` and `photo-node-1-sensors`) are licensed **CC BY-SA 4.0**, following the license of their photos, and are only available as `.jpg`. The illustrations of the workbench, the sensor modules, and the Arduino IDE windows were redrawn to match the real things; the size and layout of real components can differ slightly from one manufacturer to another. A complete summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-06`, `five-sensors-node-1`, `noise-moving-average`, `two-point-calibration` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. | CC BY 4.0 |
| `data-contract-reading` (`.png` + `.svg`) | Original diagram. The column names and sample values follow Syllabus Appendix A. | CC BY 4.0 |
| `adc-ruler`, `voltage-divider` (`.png` + `.svg`) | Original diagrams (approximate drawings). The ADC measuring range (about 150–3,100 mV at the default attenuation) is from the Arduino-ESP32 ADC documentation, and the curve's shape follows ESP-IDF's 11 dB calibration; the pin voltage limit and the HIGH threshold are from the ESP32 datasheet; the LDR resistance is from the GL5528 datasheet. | CC BY 4.0 |
| `capacitive-soil-sensor`, `datasheet-dht22`, `dht22-single-wire`, `hc-sr04-echo`, `water-tank-hcsr04` (`.png` + `.svg`) | Original diagrams and illustrations, redrawn (not photos or copies of datasheets). Numbers and timings follow the DHT22/AM2302 (Aosong) and HC-SR04 (ElecFreaks) datasheets, the DFRobot SEN0193 capacitive soil sensor wiki, and Makerguides' notes on copied sensors. | CC BY 4.0 |
| `pir-anatomy.jpg` | The photo [*PIR motion sensor for Arduino oblique view*](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg) by Sjilla (Wikimedia Commons), cropped and scaled down, with markers and an output graph added by the author. Numbers from the HC-SR501 datasheet and Adafruit's PIR guide. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en), following its photo |
| `photo-node-1-sensors.jpg` | A collage of Wikimedia Commons photos: [DHT22](https://commons.wikimedia.org/wiki/File:AM2302_%28DHT22%29_digital_temperature_and_humidity_sensor_module.jpg) by Suyash Dwivedi (CC BY-SA 4.0), [LDR](https://commons.wikimedia.org/wiki/File:LDR_1480405_6_7_HDR_Enhancer_1.jpg) and [HC-SR04](https://commons.wikimedia.org/wiki/File:HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg) by Nevit Dilmen (CC BY-SA 3.0), and [PIR](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg) by Sjilla (CC BY-SA 4.0). Soil sensor illustration and collage layout by the author. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en), following its photos |
| `workbench-ldr`, `workbench-capacitor`, `workbench-soil`, `workbench-dht22`, `workbench-pir`, `workbench-hcsr04` (`.png` + `.svg`) | Original illustrations of the two-breadboard workbench (continuing the Module 5 workbench), drawn hole by hole according to the tables in this module. The Module 5 servo, relays, fan, and pump aren't drawn, only the ends of their wires. | CC BY 4.0 |
| `arduino-serial-plotter`, `arduino-library-dht` (`.png` + `.svg`) | Original illustrations redrawn from Arduino IDE 2.3.10. The button and dialog text is taken from the source code of Arduino IDE and its Serial Plotter. | CC BY 4.0 for the illustrations |
| `wokwi-first-light.png`, `wokwi-plotter.png`, `wokwi-dht22.png`, `wokwi-pir.png`, `wokwi-hcsr04.png`, `wokwi-watering-refused.png`, `wokwi-node-1-v3.png` | Screenshots of the [Wokwi](https://wokwi.com) simulator (October 2026) running this module's code and `diagram.json` files, cropped and rearranged. Markers and component name labels by the author. | © Wokwi (CodeMagic LTD); used for educational purposes. |

References used while writing:

- Espressif: the [ESP32 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) (§5.1 absolute maximum supply ratings, §5.3 HIGH/LOW thresholds and the input voltage limit), the [*ESP32 Series SoC Errata*](https://www.espressif.com/sites/default/files/documentation/esp32_errata_en.pdf) (GPIO 36/39), [ESP-IDF ADC calibration, the "Minimize Noise" section](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/adc/adc_calibration.html#minimize-noise) (the 100 nF capacitor and repeated readings), and the [ESP-IDF v4.4 ADC](https://docs.espressif.com/projects/esp-idf/en/v4.4/esp32/api-reference/peripherals/adc.html) page (ADC2 and Wi-Fi).
- The Arduino-ESP32 3.3.x package: the [ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html) documentation (12-bit `analogRead()`, the range of each attenuation, `analogReadMilliVolts()`).
- Sensor datasheets: [DHT22/AM2302 (Aosong)](https://files.seeedstudio.com/wiki/Grove-Temperature_and_Humidity_Sensor_Pro/res/AM2302-EN.pdf) and [its older version](https://cdn-shop.adafruit.com/datasheets/Digital+humidity+and+temperature+sensor+AM2302.pdf); [HC-SR04 (ElecFreaks)](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf); [HC-SR501](https://courses.ece.cornell.edu/ece5990/ECE5725_Spring2020_Projects/May_15_Demo/Smart%20Lock/W_pp445_yl656/datasheet/31227sc.pdf) (a copy of the MPJA datasheet) and [Adafruit's PIR guide](https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor/testing-a-pir); [LDR GL5528](https://static.rapidonline.com/pdf/58-0134_v1.pdf); the [DFRobot SEN0193 capacitive soil sensor](https://wiki.dfrobot.com/sen0193); and notes on copied soil sensors (the NE555 chip, the 1 MΩ resistor) from [Makerguides](https://www.makerguides.com/capacitive-soil-moisture-sensor-with-arduino/) and the [NE555 (Texas Instruments)](https://www.ti.com/lit/ds/symlink/ne555.pdf) datasheet.
- The [DHT sensor library](https://github.com/adafruit/DHT-sensor-library) 1.4.7 and [Adafruit Unified Sensor](https://github.com/adafruit/Adafruit_Sensor) 1.1.15 libraries (source code: `NAN` on failure, a minimum interval of 2,000 ms); the speed of sound from [HyperPhysics](http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/souspe3.html).
- Arduino IDE 2.3.10: the text of the `Install library dependencies` window, the **Tools → Serial Plotter** menu, and the Serial Plotter's `name:value` format were checked directly in the application's code.
- Wokwi part documentation: [DHT22](https://docs.wokwi.com/parts/wokwi-dht22), [light sensor](https://docs.wokwi.com/parts/wokwi-photoresistor-sensor), [HC-SR04](https://docs.wokwi.com/parts/wokwi-hc-sr04), [PIR](https://docs.wokwi.com/parts/wokwi-pir-motion-sensor), and [the diagram editor's keyboard shortcuts](https://docs.wokwi.com/guides/diagram-editor).

All the sketches in this module were run in Wokwi with esp32 package version 3, DHT sensor library 1.4.7, Adafruit Unified Sensor 1.1.15, and ESP32Servo 3.2.1, and every error message quoted is the compiler's real output.

---

[⬅️ Module 5](../module-05-gpio-and-pin-map/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 7 — Sensor Bus Protocols: I2C, 1-Wire, SPI, OLED Display, & Reading Schematics](../module-07-sensor-bus-oled-schematics/README.md) ➡️**
