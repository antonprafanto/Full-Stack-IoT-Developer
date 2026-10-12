# Module 5 — ESP32 Anatomy, the Canonical Pin Map, Power Supply, & Controlling the Real World

🌐 **English** · [Bahasa Indonesia](../../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md)

*Phase 1 · Week 5 · Hardware: **Kit A Stage 1** + a USB A–A cable (see 🧰) — most practices also work in Wokwi · Prerequisite: **Module 3** (and the LED circuit from Module 2) · Time: 8–10 hours, spread over the week*

[⬅️ Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 6 ➡️](../module-06-reading-sensors/README.md)

---

Welcome to Phase 1! During the first four weeks you learned the "languages": electricity, C++, and JavaScript. Starting this week, the ESP32 stops just blinking LEDs and starts **moving real things**: a relay that goes "click", a fan that spins, a pump that moves water, a servo that opens a curtain, and a buzzer that sings. The ESP32 also starts **listening**, through a button you press.

Moving things turns out to be about more than code. Three things often frustrate beginners, and we'll sort out all three this week:

1. **Picking the wrong pin.** Some of the ESP32 board's 30 pins are "booby-trapped": they can keep the board from starting up, interfere with uploads, or can't be used as outputs. We set a **canonical pin map** — a fixed list of "which wire goes on which pin" for the whole project, valid until Module 28.
2. **Not enough power.** Fans and pumps are much "hungrier" than LEDs. If you feed them from the laptop's USB, the voltage can drop and the ESP32 restarts on its own. We install a **separate power supply** (an MB102 module + a 5 V adapter) and make the ESP32 restart on purpose so you'll recognize the symptoms.
3. **"Naughty" buttons.** One press of a button can be read five times. We learn why, and how to tame it.

By the end of the week, Node 1 "Home" — the main device of the Mini Smart Home project — has all of its "hands": the lamp relay, the fan relay, the pump, the curtain servo, the buzzer, and the manual button, all on pins that won't change again.

![Module 5 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations to Phase 5 Operations and scale; Phase 1 ESP32, Modules 5 to 9, is highlighted, Modules 1 to 4 are marked done, and Module 5 is marked YOU ARE HERE as the first module of Phase 1. Bottom: the nine things you do this week, each with a label: QW, Quick Win, your first button in Wokwi; P1, rearranging the workbench with two breadboards and the MB102; P2, buttons, bouncing, and debounce; P3 to P5, PWM for the LED, the buzzer, and the servo; P6, a relay switching on a fan powered by the MB102; P7, running the pump for 3 seconds through a MOSFET; P8, the brownout experiment; P9, saving your sketches and a photo of your build to GitHub; and a plus sign, Add-on: PIN-MAP.md and Node 1 version 0.2.0. A star marks what is required to pass](assets/roadmap-module-05.png)

> [!NOTE]
> **How to use this module.**
>
> - Every code box has a copy button in its top right corner. All the sketches (Arduino programs) are also available as files in the [`code/`](code/) folder, complete with a `diagram.json` for Wokwi.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing.
> - **No kit yet, or some parts haven't arrived?** Almost every practice can be tried in Wokwi. The only things that can't be simulated are real electrical matters: the MB102, brownouts (brief voltage drops), and load current. Those parts are clearly marked.
> - macOS users: replace **Ctrl** with **Cmd** to save, copy, and paste.

> [!WARNING]
> **Two safety rules for this week.**
>
> 1. **Before you change any wire, turn off the MB102, then unplug the USB.** A wrong circuit without power doesn't damage anything.
> 2. **Everything we control runs on low voltage (5 V from an adapter).** This curriculum **never** connects anything to 220 V mains (the PLN grid). Relays for 220 V are only covered as knowledge and as a warning (Concept 9).

This module follows the same rhythm as Modules 1–4. Open the collapsible sections in 🚨 (click a title to expand it) only when you need them; the collapsible sections in 🔬 can be skipped. Every practice starts with a **🖥️** box that names the tools and parts it uses.

## Contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: your first button, straight in Wokwi (10 minutes)](#-quick-win-your-first-button-straight-in-wokwi-10-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Board anatomy](#1-anatomy-of-the-esp32-devkit-v1-board-which-pins-you-have) · [2 Safe & trap pins](#2-safe-pins-conditional-pins-and-trap-pins) · [3 Canonical pin map](#3-the-pin-budget-and-the-canonical-pin-map-of-node-1-and-node-2) · [4 Power supply](#4-power-supply-brains-from-the-laptop-muscle-from-the-adapter) · [5 Inputs & pull-ups](#5-digital-inputs-and-pull-ups-why-does-my-button-read-randomly) · [6 Debounce](#6-button-bounce-and-debounce) · [7 Pin current](#7-pin-current-and-drivers-pins-give-commands-not-power) · [8 PWM](#8-pwm-one-technique-three-uses-brightness-pitch-and-angle) · [9 Relays](#9-relays-switches-moved-by-a-magnet) · [10 MOSFETs](#10-mosfets-and-flyback-diodes-an-electronic-switch-for-the-pump) · [11 ESP32 family](#11-the-esp32-family-at-a-glance)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Workbench](#practice-1--rearranging-the-workbench-two-breadboards-the-status-led-and-the-mb102-4560-minutes-set-up-once) · [2 Button ⭐](#practice-2--buttons-bouncing-and-debounce-25-minutes) · [3 Dimmer](#practice-3--dimming-an-led-with-a-potentiometer-15-minutes) · [4 Buzzer](#practice-4--a-buzzer-plays-tones-15-minutes) · [5 Servo](#practice-5--servo-0180-from-the-serial-monitor-25-minutes) · [6 Fan relay ⭐](#practice-6--relay-a-button-turns-on-a-fan-powered-by-the-mb102-30-minutes) · [7 Pump ⭐](#practice-7--running-the-pump-for-3-seconds-through-a-mosfet-30-minutes) · [8 Brownout ⭐](#practice-8--the-brownout-experiment-wrong-on-purpose-then-fixed-20-minutes) · [9 GitHub](#practice-9--save-to-github-15-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-5-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

- **Read the ESP32 DevKit V1 pin map** and explain which pins are safe, which come with conditions, and which to avoid — including **three pins that are best left unused, and why**.
- **Use the canonical pin map** of Node 1 and Node 2, which stays valid until Module 28, so you don't have to take your circuit apart every week.
- **Power loads without making the ESP32 restart**: the ESP32 from the laptop's USB, the loads from an MB102 + a 5 V adapter, and the GNDs joined.
- **Read a button correctly** with the internal pull-up and debounce, then use it to switch anything on and off.
- **Control the real world**: a dimmable LED, a buzzer that plays notes, a servo that turns to an angle, a relay for a fan, and a MOSFET for a pump — using PWM the esp32 package version 3 way (`ledcAttach`).

---

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **The circuit from Modules 2–3** | A 30-pin ESP32 DevKit V1 board, a breadboard, a red LED + 220 Ω resistor on D4. The green and yellow LEDs of the Module 3 traffic light are **removed** in Practice 1. |
| **Kit A Stage 1 — the parts you start using this week** | The 2nd breadboard (already in the kit since Module 2); 2 push buttons; a 10 kΩ potentiometer; a **passive** buzzer; a 2-channel 5 V relay module, *low-level trigger*, with optocouplers (both are explained in Concept 9); a small 5 V DC fan; a 3–5 V mini pump + tubing; an **IRLZ44N** MOSFET (or a **D4184** module) + a **1N4007** diode; an **SG90** servo; a 100 µF electrolytic capacitor; 220 Ω and 10 kΩ resistors; male–male and male–female jumper wires. |
| **Power supply for the loads** | An **MB102** module + a **5 V USB adapter of at least 2 A** (a strong phone charger head is enough) + a **USB A–A cable** (male–male, IDR 10,000–15,000; listed in Kit A Stage 1 since Syllabus v1.0.6). The reasons are in Concept 4. Have a newer MB102 with a micro-USB or USB-C socket? For that version, an ordinary phone charging cable is enough. |
| **Two glasses (one with water) + a tray** | For the pump. Never run a mini pump dry for more than a few seconds, and keep the water away from the breadboard and the laptop. |
| **Masking tape + a marker** | For labeling the 5 V and 3.3 V rails. You also need a utility knife if your breadboard's rail strip is held on by adhesive (Practice 1). |
| **Small tools** | A small flat-head screwdriver for the relay's screw terminals; thick cardboard or a thin board + double-sided tape as a base for the breadboards (optional); 2 spare male–female jumper wires; a 1 kΩ resistor (optional, if the buzzer is too loud). |
| **Multimeter** | From Module 2. Used to make sure the MB102 rail really is 5 V. |
| **Laptop + Arduino IDE 2 + a USB data cable** | Installed since Module 2. |
| **Browser + Wokwi** | For the Quick Win, and for trying the practices before you build them. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. |
| **esp32 by Espressif Systems** board package | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. The way you write PWM in version 3 (`ledcAttach`) is different from version 2, which many old tutorials still use. |
| **ESP32Servo** library | **3.2.1** | Installed in Practice 5. |

---

## 🏆 Quick Win: your first button, straight in Wokwi (10 minutes)

Until last week, the ESP32 only "talked": it turned on LEDs and printed text. Now we make it **listen**. We start in Wokwi so you don't have to take your circuit apart yet — your real circuit gets rearranged in Practice 1.

> 🖥️ **Tools used in this section:** a browser and the [Wokwi](https://wokwi.com) website. No kit needed, nothing to install.

1. Open **https://wokwi.com/projects/new/esp32** in your browser. An empty ESP32 project appears: code on the left, the board on the right.
2. Right-click the link [`code/module05_first_button/diagram.json`](code/module05_first_button/diagram.json) → **Open link in new tab**, then click the **Copy raw file** button (the two-squares icon) at the top right of the file's contents. Go back to the Wokwi tab, click the **`diagram.json`** tab above the editor, select everything in it (**Ctrl + A**), then paste (**Ctrl + V**). On the right, the board now has company: a green button on its left and a red LED on its right.
3. Click the **`sketch.ino`** tab, delete its contents, then paste this code:

   ```cpp
   // Module 5 - Quick Win: your first button
   // While the button on D13 is pressed, the LED on D4 is on.
   // Circuit: one leg of the button to D13, the opposite leg to GND. No resistor.

   const int PIN_BUTTON = 13;  // manual button (canonical pin map)
   const int PIN_LED = 4;      // status LED, connected since Module 2

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_BUTTON, INPUT_PULLUP);  // input + internal pull-up: not pressed = HIGH
     pinMode(PIN_LED, OUTPUT);
     Serial.println("Press the button!");
   }

   void loop() {
     if (digitalRead(PIN_BUTTON) == LOW) {  // LOW = the button is being pressed
       digitalWrite(PIN_LED, HIGH);
     } else {
       digitalWrite(PIN_LED, LOW);
     }
   }
   ```

4. Click the green **▶** button. Wait until the text `Press the button!` appears in the Serial Monitor below the board.
5. **Press and hold** the green button with the mouse. The red LED lights up! Let go, and the LED goes out.

![Wokwi screenshot: the ESP32 board with a green button on the left connected to D13 and GND, and a red LED and resistor on the right connected to D4 and GND. Marker 1: the D13 button is being clicked and held; let go, and the LED goes out again. Marker 2: the D4 LED is on while the button is held. Marker 3: the Serial Monitor below the simulation panel shows the message Press the button!](assets/wokwi-first-button.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

Congratulations — your ESP32 can now feel your finger. There are two new things in that code:

- **`pinMode(PIN_BUTTON, INPUT_PULLUP)`** makes D13 an **input** and, at the same time, switches on a small "spring" inside the chip that pulls the pin up to HIGH. That's why the button only needs to be connected to GND, with no extra resistor.
- **`digitalRead(PIN_BUTTON)`** reads the pin's state: `HIGH` or `LOW`. Notice that the logic is **reversed**: pressed = `LOW`, released = `HIGH`. Concept 5 explains why.

Curious? Click **■** to stop the simulation, change `INPUT_PULLUP` to `INPUT`, then run it again. This time the LED **comes on right away and stays on**, even though nobody touches the button, and pressing the button changes nothing. Without that "spring", pin D13 is left **floating**: Wokwi treats it as `LOW`, while on a real board the reading can't even be predicted and can change when the wire is touched. Concept 5 covers this. Change it back to `INPUT_PULLUP` after trying.

---

## 🧠 The "Why" Concepts

Eleven concepts, one per section — **you don't need to read them all at once**. You alternate between concepts and practices, in this order:

1. Concepts 1–4 → Practice 1 (setting up the workbench)
2. Concepts 5–6 → Practice 2 (the button)
3. Concepts 7–8 → Practices 3–5 (dimmer, buzzer, servo)
4. Concepts 9–10 → Practices 6–9 (relay, pump, brownout, GitHub)
5. 🧩 Challenges → ➕ Mini Smart Home → 📝 Quiz → ✅ Checklist

At every switching point there's a ➡️ or ☕ box (on to the practice or the next section) and a ⬆️ box (back to the concepts), with links you just click. Concept 11 (the ESP32 family) is light reading; open it anytime.

> 🖥️ **Want to try the code in the Concepts section?** It's not required — you'll run all of the code in the Practices. If you're curious, you can try any of it in Wokwi with a `diagram.json` from the [`code/`](code/) folder, just like the Quick Win.

### 1. Anatomy of the ESP32 DevKit V1 board: which pins you have

You've known this board since Module 2: the ESP-WROOM-32 metal module (holding the ESP32 chip, 4 MB of flash memory, and the antenna), the 3.3 V regulator, the USB chip, the **EN** and **BOOT** buttons, the red power LED, and the blue LED connected to GPIO 2. This week we look at its **pins**.

The DevKit V1 board has **30 pins**, 15 on each side:

- **5 power and control pins**: **VIN** (about 5 V from USB), **3V3** (3.3 V from the regulator), **GND** (there are two, and they're the same), and **EN** (the reset button). These aren't program pins.
- **25 GPIOs** (*General Purpose Input/Output*: all-purpose input-output pins). These are the pins your code can control: switch them on, read them, or give them special jobs.

The labels on the board aren't always the same as the GPIO numbers. **D4** means GPIO **4**, and in code we just write the number (`4`). There are also special names: **VP** = GPIO **36**, **VN** = GPIO **39**, **RX0**/**TX0** = GPIO **3**/**1**, **RX2**/**TX2** = GPIO **16**/**17**. They're all in the picture in Concept 2.

"All-purpose" doesn't mean they're all the same. Every GPIO can be an **input** (reading a button), and most can be an **output** (turning on an LED). Some have extra abilities: reading analog voltages (ADC, Module 6), sensing touch, putting out a real analog voltage (DAC, a digital-to-analog converter), or serving as sensor bus lines (I2C, SPI, UART — Module 7). And some come with **taboos** — that's what the next concept is about.

### 2. Safe pins, conditional pins, and trap pins

Think of the ESP32's pins as chairs in a meeting room. Some chairs are free for anyone to sit in. Some are "reserved" for a moment by the organizers at the start of the event — you may sit there as long as you don't get in the organizers' way. Some are for listening only; you can't use them to speak. And some are simply off-limits because the system uses them.

![Pin map of the 30-pin ESP32 DevKit V1, seen from above with the antenna at the top and the USB connector at the bottom. Left side, from the top: EN, VP or GPIO 36, VN or GPIO 39, D34, D35, D32, D33, D25, D26, D27, D14, D12, D13, GND, VIN. Right side, from the top: D23, D22, TX0 or GPIO 1, RX0 or GPIO 3, D21, D19, D18, D5, TX2 or GPIO 17, RX2 or GPIO 16, D4, D2, D15, GND, 3V3. Green for safe pins, yellow for strapping pins 2, 5, and 15, which may be used as outputs with caveats, blue for pins 34 to 39, which are input-only without a pull-up, red for GPIO 12 and TX0 RX0, which are avoided, and gray for the power pins. Next to each pin its functions are written, for example ADC1 or ADC2, touch, DAC on D25 and D26, SPI on D23, D19, D18, and D5, I2C on D21 and D22, UART2 on TX2 and RX2, strapping, VIN about 5 volts from USB, and 3V3 as a 3.3-volt output. The note below it: ADC1 on GPIO 32 to 39 can still read analog values while Wi-Fi is on, ADC2 can't; GPIO 0 (the BOOT button) and GPIO 6 to 11 (flash memory) are not broken out on 30-pin boards; the built-in blue LED is on GPIO 2](assets/pinout-devkit-v1.png)

| Group | GPIO | What it means |
| :--- | :--- | :--- |
| 🟢 **Safe** | 4, 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33 | Can be an input, an output, or PWM (Concept 8). The first choice for anything. |
| 🟡 **Conditional** | 2, 5, 15 | **Strapping pins** (pins that decide how the chip starts up). The chip reads their level for a moment as it powers up, then releases them. Fine for **outputs**, as long as the circuit doesn't force a particular level while the board powers up. GPIO 2 is also connected to the built-in blue LED and must be LOW or floating while you upload. |
| 🔵 **Input only** | 34, 35, 36 (VP), 39 (VN) | Can't be outputs and **have no internal pull-up**. Good for sensors, including analog sensors. |
| 🔴 **Avoid** | 12, 1 (TX0), 3 (RX0) | GPIO 12 is a strapping pin that sets the memory voltage: if it's pulled HIGH at power-up, the board **fails to boot**. TX0/RX0 are the USB line: used while uploading and by the Serial Monitor. |
| ⚪ **Not broken out** | 0, 6–11 | On our 30-pin board, GPIO 0 is only connected to the **BOOT** button, and GPIO 6–11 are used by the flash memory. 38-pin boards break them out; **don't use them**. |

Two other divisions also affect which pins we choose:

- **ADC1 and ADC2.** The ESP32 has two analog readers. ADC2 (GPIO 0, 2, 4, 12–15, 25–27) **can't be used to read analog values while Wi-Fi is on** — and from Module 10 on, Wi-Fi is always on. That's why all the analog sensors in our project go on **ADC1** (GPIO 32–39). As ordinary digital pins, the ADC2 pins are still safe.
- **Pins that stay "quiet" at power-up.** Strapping pins have built-in pull resistors that are active while the board powers up (GPIO 0, 5, and 15 are pulled up; GPIO 2 and 12 are pulled down), and TX0 sends text while the board starts. So that the relays and the pump can't be triggered for a moment, we put them on ordinary pins (25, 32, 33).

> [!IMPORTANT]
> **Three pins you must remember to avoid** (this is a requirement to pass):
>
> 1. **GPIO 12 (D12)** — the strapping pin that sets the memory voltage. If a circuit pulls it HIGH while the board powers up, the chip picks 1.8 V for a memory that needs 3.3 V, so the board fails to start or keeps restarting.
> 2. **GPIO 1 and 3 (TX0, RX0)** — the USB line to the laptop. Using them interferes with uploads and garbles the Serial Monitor.
> 3. **GPIO 6–11** — used by the flash memory where your program is stored. Using them makes the program crash. (They aren't broken out on 30-pin boards, but on 38-pin boards they're labeled `D0`–`D3`, `CMD`, `CLK`. Watch out: the `D2` label on a 38-pin board is GPIO 9, which belongs to the flash — not GPIO 2.)

### 3. The pin budget and the canonical pin map of Node 1 and Node 2

First, let's count our "money". The board has 25 GPIOs. Take away TX0 and RX0 (the USB line) and GPIO 12, and **22 usable pins** are left. What Node 1 "Home" needs by the end of the curriculum:

- **Actuators** (Module 5): lamp relay, fan relay, pump, curtain servo, buzzer → 5 pins.
- **Manual button and status LED** → 2 pins.
- **Five sensors** (Module 6): DHT22, LDR, soil sensor, PIR, HC-SR04 distance sensor (2 wires) → 6 pins.
- **OLED display** over I2C (Module 7) → 2 pins.

That's **15 pins** in total. Add the optional microSD card (Module 7, 4 pins) and it's 19; add the RS-485 lab in Module 15 (3 pins) and it's exactly 22. The budget is **tight** — not a single pin can be wasted.

That's why we set a **canonical pin map**: a fixed list of "which wire goes on which pin" that **stays valid until Module 28**. Pins whose parts haven't arrived yet are still "reserved", so the circuit doesn't have to be taken apart every week.

![Canonical pin map of Node 1 Home on the ESP32 DevKit V1 board. The color and the round label next to each pin show the module in which that pin starts being used, not the pin group. Left side, from the top: EN, the reset button; VP or GPIO 36 for the LDR (Module 6); VN or GPIO 39 for the soil sensor (Module 6, a potentiometer this week); D34 for the PIR (Module 6); D35 for the distance sensor's ECHO (Module 6); D32 lamp relay; D33 fan relay; D25 pump through a MOSFET; D26 curtain servo; D27 buzzer (all Module 5); D14 DHT22 (Module 6); D12 in red with a cross, do not use; D13 manual button (Module 5); shared GND; VIN, don't put a load on it. Right side, from the top: D23, D19, D18, and D5 for microSD (Module 7, optional); D22 and D21 for the OLED display's I2C (Module 7); TX0 and RX0 in red with a cross, the USB line; TX2 and RX2 plus D2 for RS-485 (Module 15); D4 status LED (Module 2); D15 the distance sensor's TRIG (Module 6); shared GND; 3V3 to the bottom rail. Bottom left box: the module color legend, namely Modules 2, 5, 6, 7, 15, and a cross for the pins to avoid. Bottom right box: the Node 2 Garden pin map, namely I2C 21 and 22 for the BME280, GPIO 27 for the DS18B20 with a 4.7 kiloohm resistor to 3V3, VN for the second soil sensor, GPIO 2 the built-in blue LED, 16, 17, and 2 for RS-485 only during the Module 15 lab, and VP as a spare for the battery voltage](assets/canonical-pin-map.png)

Many names in the following tables — I2C, SPI, RS-485, DHT22, PIR, and so on — are only introduced in their own modules. This week it's enough to know that those pins are **already reserved**. The **Since** column holds the module in which the pin starts being used: M5 = Module 5.

**Node 1 "Home"** (the first ESP32 DevKit V1; it lives inside the house and never runs on a battery):

| GPIO (label on the board) | For | Direction | Since | Notes |
| :--- | :--- | :--- | :---: | :--- |
| 4 (D4) | Status LED | output | M2 | through a 220 Ω resistor |
| 13 (D13) | Manual button | input | M5 | `INPUT_PULLUP`; the other leg goes to GND |
| 32 (D32) | Lamp relay (IN1) | output | M5 | active-LOW relay |
| 33 (D33) | Fan relay (IN2) | output | M5 | active-LOW relay |
| 25 (D25) | Pump (MOSFET gate) | output | M5 | 220 Ω in series + 10 kΩ to GND |
| 26 (D26) | Curtain servo | output (PWM) | M5 | servo powered by the MB102 |
| 27 (D27) | Passive buzzer | output (PWM) | M5 | through a 220 Ω resistor |
| 14 (D14) | DHT22 | two-way | M6 | |
| 36 (VP) | LDR | analog input | M6 | ADC1 |
| 39 (VN) | Capacitive soil sensor | analog input | M6 | ADC1; a potentiometer stands in for it this week |
| 34 (D34) | PIR | input | M6 | |
| 35 (D35) | HC-SR04 ECHO | input | M6 | through a 5 V → 3.3 V voltage divider |
| 15 (D15) | HC-SR04 TRIG | output | M6 | strapping pin, safe as an output |
| 21 / 22 (D21 / D22) | I2C SDA / SCL: OLED display, BME280 practice | bus | M7 | |
| 18 / 19 / 23 / 5 | microSD SCK / MISO / MOSI / CS | SPI bus | M7 | optional; may be removed after Module 11 |
| 16 / 17 (RX2 / TX2) | RS-485 RO / DI (MAX485) | UART bus | M15 | GPIO 16 is borrowed for a while for the DS18B20 practice in Module 7; the RO output of a MAX485 module powered with 5 V is first brought down to 3.3 V (Module 15) |
| 2 (D2) | RS-485 DE/RE + built-in blue LED | output | M15 | strapping pin; the blue LED lights up while transmitting |

**Node 2 "Garden"** (the second ESP32, battery powered, built in Module 14):

| GPIO | For | Since | Notes |
| :--- | :--- | :---: | :--- |
| 21 / 22 | I2C: BME280 | M14 | |
| 27 | DS18B20 (1-Wire) | M14 | 4.7 kΩ resistor to 3V3 |
| 39 (VN) | Second soil sensor | M14 | same pin as on Node 1, so the code can be reused |
| 2 | Built-in blue LED: "awake" indicator | M14 | |
| 16 / 17 / 2 | RS-485 for the Module 15 lab | M15 | only during the lab, with its own lab sketch; the MAX485 is removed again afterwards because GPIO 2 is also the "awake" LED |
| 36 (VP) | Spare, for example battery voltage | — | optional |

The Node 2 battery comes in through the VIN pin (the Module 9 circuit), not through a GPIO.

Here are some of the reasons behind these choices, so the map makes sense instead of being something to memorize:

- **All the actuators and the button are on one side of the board** (D13 to D32, in a row), so the wiring stays tidy.
- **The analog sensors are on VP and VN** (ADC1), while **the PIR and ECHO are on D34 and D35**. This follows a note from Espressif: pins 36 and 39 shouldn't be used for digital inputs that need an *interrupt* — a feature that "wakes up" the program the moment a pin changes — while the ADC or Wi-Fi is active (explained in 🔬).
- **I2C on 21/22 and SPI on 18/19/23/5** are the esp32 package's default pins for this board, so libraries don't need to be reconfigured.
- **The green and yellow LEDs of the Module 3 traffic light (D18, D19) retire**: both pins are reserved for the microSD card.

A copy of this map is saved as `PIN-MAP.md` in your project repository (the ➕ section). The rule is simple: **before you add anything to Node 1, open `PIN-MAP.md` first.**

### 4. Power supply: brains from the laptop, muscle from the adapter

Starting this week, our board moves things that are "hungry" for electricity. Compare what they need (rough numbers; check the labels on your parts):

| Part | Approximate current |
| :--- | :--- |
| LED + 220 Ω resistor | about 6 mA |
| The ESP32 itself | about 50–250 mA (most while Wi-Fi is on) |
| One 5 V relay coil | about 70 mA |
| 40 mm 5 V fan | about 70–200 mA |
| 5 V mini pump | about 100–300 mA, more for a moment when it starts turning |
| SG90 servo | about 100–250 mA while moving; it can draw several hundred mA more when it's blocked |

A laptop's USB port usually only guarantees **500 mA** (USB 3: 900 mA). And the problem isn't just the total. Motors (fan, pump, servo) gulp a large current **for a moment** when they start turning. At that moment the USB voltage dips briefly, the board's regulator can't hold 3.3 V, and the chip's voltage drops with it.

The ESP32 has a guard for this situation: the **brownout detector** (a voltage-drop guard). As soon as the chip's voltage falls below a safe limit (around 2.4–2.8 V), the chip is **restarted on purpose** so it doesn't run haywire. The Serial Monitor shows the text `Brownout detector was triggered`, and then the board starts again from the beginning. For beginners the symptom is confusing: "Why does my ESP32 restart every time the fan turns on?" You'll see it for yourself in Practice 8.

![Graph of the 3.3-volt supply over time in two situations. Top, the load powered from the laptop's USB: when the fan starts turning, the voltage drops below the brownout limit line of about 2.4 to 2.8 volts, then the ESP32 restarts and the Serial Monitor prints Brownout detector was triggered. Bottom, the load powered from the MB102 and an adapter: when the fan starts turning, the ESP32's voltage only wobbles a little and stays above the limit, so the ESP32 keeps running](assets/brownout-graph.png)

The cure: **separate the power paths**.

- **The ESP32 stays on the laptop's USB.** Through the same cable, you upload programs and read the Serial Monitor.
- **All the loads run from a second power supply**: an **MB102** module plugged into the breadboard and fed by a **5 V 2 A adapter**. The relays, fan, pump, and servo take their power from the MB102's 5 V rail.
- **The two GNDs are joined** with one wire. Remember Module 2: GND is the "sea level" that every voltage is measured from. Without a shared GND, the relay or the MOSFET can't understand the ESP32's 3.3 V signal.

![Diagram of two power paths. Left, path 1, the brains: the laptop gives data and power to the ESP32 board through a USB cable whose allowance is only about 500 milliamperes; the ESP32 uses 3.3 volts for the chip and the signals, and the bottom rail carries 3.3 volts from the 3V3 pin for the potentiometer and sensors. Right, path 2, the muscle: a 5-volt 2-ampere USB adapter goes into the MB102 module's USB port through a USB A-to-A cable; the MB102 fills the top rail with 5 volts for the relays, fan, pump, and servo, which draw hundreds of milliamperes without passing through the ESP32. One black wire joins the ESP32's GND and the MB102's GND. Below, three don'ts marked with red crosses: loads powered from the ESP32 board's VIN or 3V3 pin, a 5-volt adapter in the MB102's round barrel jack, which needs 6.5 to 12 volts, and connecting the MB102's 5-volt rail to the ESP32's VIN or 3V3 pin. The note at the very bottom: VIN and 3V3 are not for loads, and 3V3 is only for the ESP32 and the small sensors on the bottom rail; power on/off order: plug in the USB first, then turn on the MB102; turn off the MB102 first, then unplug the USB](assets/two-power-paths.png)

**Getting to know the MB102.** This small module plugs into the **end of a breadboard**, with its pins going into the power rails along both the top and the bottom edge at the same time.

![Illustration of the MB102 breadboard power supply module seen from above, plugged into the end of a breadboard, with six markers: 1, the USB A port where the cable from the 5-volt adapter comes in, wired straight to the 5-volt rail without a regulator; 2, the round DC barrel jack, which needs 6.5 to 12 volts and goes through a regulator, not for a 5-volt adapter; 3, the power button, which on most MB102s cuts both inputs, checked in Practice 1.6; 4, the power-on LED; 5, two jumpers, one for each side of the breadboard, with the choices 3.3V, OFF, or 5V, set in our build to 5V on the top-rail side and OFF on the middle-rail side; 6, the pins under the module that go into the plus and minus strips on both sides of the breadboard. In the middle of the module are two regulators, AMS1117-5.0 and AMS1117-3.3](assets/mb102-anatomy.png)

- The **USB port** input (rectangular, type A) is connected **straight to the 5 V rail**, without a regulator. This is where our 5 V adapter comes in, through a **USB A–A cable** (male at both ends). On most MB102s, the power button also cuts this path; you check this in Practice 1.6.
- The **round barrel jack** input (*DC jack*) needs **6.5–12 V**, because it goes through a diode and an AMS1117 regulator that can only handle about 700 mA. **Don't plug a 5 V adapter in here**: the "5 V" rail would only get about 3.5 V, so the relays and the servo go limp. (A 9 V adapter in the barrel jack is fine, but the load is limited to about 700 mA and the regulator gets hot.)
- The MB102 has one **jumper** (a small removable cap) for each side of the breadboard, with three choices: **5V**, **OFF**, and **3.3V**. In our build, the jumper on the top-rail side is set to **5V**, and the jumper on the other side to **OFF**. The names top rail, middle rail, and bottom rail, and the reasons for them, are explained in Practice 1.
- The MB102 datasheet gives a maximum output current of about 700 mA. Power from the USB port doesn't go through the regulator, but it still goes through the MB102's thin copper tracks (and, on most MB102s, its power button). So treat about 700 mA as the safe limit: don't run the pump, the fan, and the servo all at once, nonstop. The 2 A adapter is chosen so its voltage doesn't sag when a load starts turning.

> [!CAUTION]
> **The USB A–A cable is only for adapter → MB102 USB port.** Never plug it into a laptop or between two devices that both have power: two 5 V sources can fight each other and damage a port. And don't use the MB102's barrel jack and USB port at the same time.

One more trick: a **100 µF electrolytic capacitor** near the servo or the pump works like a "small reservoir" that covers brief current surges. Connect its long leg (+) to the 5 V rail and its striped side (−) to GND — the wrong way around can damage it.

> [!IMPORTANT]
> **Golden power rules (valid until the end of the curriculum):**
>
> 1. **Loads** (relays, fan, pump, servo) **always get their power from the MB102**, never from the ESP32's VIN or 3V3 pin.
> 2. **The ESP32 is powered from the laptop's USB** (from Module 9 on: from its own adapter).
> 3. **All GNDs are joined.**
> 4. **The MB102 5 V rail is never connected to the ESP32's 3V3 pin**, **nor to its VIN pin while the laptop USB cable is plugged in** — two power sources must never meet. (How to power the ESP32 from an adapter is covered in Module 9.)
> 5. **Power on/off order:** plug in the laptop USB first, then turn on the MB102; turn off the MB102 first, then unplug the USB. If the MB102 is on while the ESP32 has no power, current from the relay module can leak into the ESP32 through the IN wires (🚨).

The ESP32 also **records the reason for its last restart**: just powered on (`POWERON`), the voltage dropped (`BROWNOUT`), the program crashed (`PANIC`), and so on. The Practice 8 sketch prints that record. Later, the same record is reported to the server in the device health message (`vitals`, the `reset_reason` field in Syllabus Appendix A) — so you can tell from far away if your device keeps restarting.

> ☕ **Break point.** Concepts 1–4 prepare you for Practice 1: rearranging the workbench. First read the [introduction to the Practice section](#-step-by-step-practice) (it has a **Tip** box on saving sketches), do [Practice 1](#practice-1--rearranging-the-workbench-two-breadboards-the-status-led-and-the-mb102-4560-minutes-set-up-once), then come back here for [Concept 5](#5-digital-inputs-and-pull-ups-why-does-my-button-read-randomly).

### 5. Digital inputs and pull-ups: "Why does my button read randomly?"

In Modules 2–3, the ESP32's pins were always **outputs**: pins that **put out** 3.3 V or 0 V for an LED. A pin can also be an **input**. An input pin doesn't put out anything; it only **measures the voltage** that arrives, then turns it into one of two answers:

| Voltage on the pin | Read as |
| :--- | :--- |
| above about 2.5 V | `HIGH` |
| below about 0.8 V | `LOW` |
| in between | uncertain — could be `HIGH`, could be `LOW` |

A push button is really just two metal plates: pressed → they touch and connect; released → they separate. Suppose one leg of the button is connected to a pin and the other leg to GND:

- **Pressed**: the pin is connected to GND → clearly `LOW`.
- **Released**: the pin is **not connected to anything**. This state is called **floating**. A floating pin behaves like a small antenna: it picks up electrical "ripples" from your finger, the wire next to it, or the lights in the room, so its reading changes all by itself. That's the answer to the classic beginner question: "Why does my button read randomly even when I'm not touching it?"

The cure is a **pull-up resistor**: a large-value resistor from the pin to 3.3 V.

- Button released → the resistor "pulls" the pin up to 3.3 V → `HIGH`. The pin is no longer floating.
- Button pressed → the pin is connected straight to GND → `LOW`. A little current flows from 3.3 V through the resistor to GND: 3.3 V ÷ 45 kΩ ≈ 0.07 mA, very small.

That resistor is a must. If the pin were connected straight to 3.3 V with no resistor, pressing the button would connect 3.3 V to GND: a **short circuit** (Module 2).

Picture a **door spring**. The spring always pulls the door shut by itself (`HIGH`). Your hand can push it open (`LOW`), and as soon as you let go, the door closes again. The spring is weak on purpose (the resistor is large), so a push of the hand easily beats it.

![Three ways to connect a button to an ESP32 pin, side by side. Left, floating: a button from pin D13 to GND with no pull resistor; released, the reading is random, pressed, it reads LOW, and Wokwi treats it as always LOW. Middle, external pull-up: a 10 kiloohm resistor from the pin to 3.3 volts and a button from the pin to GND; released reads HIGH, pressed LOW. Right, INPUT_PULLUP: a resistor of about 45 kiloohms is already inside the ESP32 chip and is drawn dashed, so outside you only need the button from D13 to GND; released HIGH, pressed LOW. Note at the bottom: reversed logic, pressed equals LOW and released equals HIGH; pins 34 to 39 have no internal pull-up](assets/input-pullup.png)

The good news: the ESP32 **already has pull-up resistors inside the chip** (about 45 kΩ). We just have to switch one on:

```cpp
pinMode(PIN_BUTTON, INPUT_PULLUP);  // input + internal pull-up
```

As a result, a button circuit only needs **two wires**: pin → button → GND, with no extra resistor. That's what you used in the Quick Win. The catch is that the logic is **reversed**: pressed = `LOW`, released = `HIGH`. So in code, "the button is being pressed" is written like this:

```cpp
if (digitalRead(PIN_BUTTON) == LOW) {  // LOW = being pressed
  // ...
}
```

Three important notes:

- **The opposite exists too**: a ***pull-down*** resistor to GND, with the button going to 3.3 V; pressed = `HIGH`. The ESP32 has `INPUT_PULLDOWN`. This curriculum always uses a pull-up with the button to GND. Besides being the most common way in the Arduino world, it doesn't need a 3.3 V wire to the button — so there's no live wire that could get mixed up with the 5 V rail.
- **Pins 34–39 have no internal pull-up** (Concept 2). On those pins, `INPUT_PULLUP` silently does nothing, so a button connected there still floats. That's why our manual button is on **D13**, not D34.
- **Input pins can't handle 5 V**, just as in Module 2. With a pull-up to 3.3 V and the button to GND, the pin never sees anything above 3.3 V. Never connect a button (or anything that leads to a GPIO pin) to the MB102's 5 V rail.

### 6. Button bounce and debounce

In Practice 2.1 you'll run a program that counts button presses. Press the button **once** — and often `Press #1`, `Press #2`, `Press #3` all show up at once. The program isn't wrong. The button is being "naughty".

The metal plates inside the button don't settle firmly right away. Like a ball dropped on the floor, they **bounce** a few times: connect-disconnect-connect-disconnect for roughly 1–10 milliseconds (sometimes longer), and only then stay put. The same bouncing happens again when the button is released. To human eyes, 10 milliseconds is an instant. To an ESP32 that can read a pin **hundreds of thousands of times per second**, every bounce looks like a new press.

![Graph of the voltage on pin D13 over time during one press and release of the button, not to scale. At first the line is at 3.3 volts, HIGH. When the finger presses, the line goes up and down a few times for about 1 to 10 milliseconds, marked by a box labeled bouncing on press, then settles at 0 volts, LOW. When the finger lifts, there's more bouncing before it returns to HIGH. Below it, a row of very closely spaced ESP32 reading points with the note: every drop is read as a new press, so one press is read four times when pressed and twice more when released, six times in all. The box at the very bottom explains the four steps of buttonPressed with DEBOUNCE_DELAY at 30 milliseconds: see the first LOW; wait 30 milliseconds, then check again; wait until the finger is lifted; wait 30 more milliseconds, then answer true once](assets/button-bounce.png)

Taming this bouncing is called ***debounce***. The program uses two ideas.

**Idea 1: react to the change, not the state.** If the program says "as long as the button is `LOW`, add to the count", one half-second press could be counted tens of thousands of times. What we want is **the moment it changes** from released to pressed. How: remember the state from the previous pass, then compare.

```cpp
int state = digitalRead(PIN_BUTTON);
if (previousState == HIGH && state == LOW) {  // released before, pressed now
  pressCount++;
}
previousState = state;  // remember it for the next pass
```

This is already correct, but bouncing still slips through: every little "disconnect-connect" in the middle of the bouncing also looks like a change from `HIGH` to `LOW`.

**Idea 2: wait for the bouncing to settle.** When you see the first `LOW`, don't believe it right away. Wait 30 milliseconds — much longer than the bouncing, but still too short for a human to notice — then check again. If it's still `LOW`, it's a real press. Here's the function you'll use again and again this week:

```cpp
const int DEBOUNCE_DELAY = 30;  // milliseconds: how long to wait for the button to stop bouncing

// Returns true ONCE for every real press.
bool buttonPressed() {
  if (digitalRead(PIN_BUTTON) == HIGH) {  // not being pressed
    return false;
  }
  delay(DEBOUNCE_DELAY);                  // wait for the bouncing to settle...
  if (digitalRead(PIN_BUTTON) == HIGH) {  // ...already released again: just noise
    return false;
  }
  while (digitalRead(PIN_BUTTON) == LOW) {  // wait until the finger is lifted
    delay(1);
  }
  delay(DEBOUNCE_DELAY);  // the button also bounces when it is released
  return true;
}
```

Read it from top to bottom, like a recipe:

1. The button isn't pressed? Answer `false` and you're done.
2. Pressed? Wait 30 ms, then check again. Already released? That was just a moment of noise; answer `false`.
3. Still pressed: this is a real press. Wait until the finger is lifted (the `while` loop from Module 3), then wait 30 ms more to tame the bouncing on release.
4. Answer `true` — exactly **once** for one press.

In `loop()`, using it is as simple as this:

```cpp
if (buttonPressed()) {
  // do something, for example flip the LED's state
}
```

Also notice: the `true` answer only comes out when the finger is **lifted**, so the action in `loop()` happens after the button is released — the program isn't being slow.

This function is simple on purpose. Its drawback: while the button is held down, the program "freezes", waiting for the finger to lift. For this week, that's fine. In Module 8 you learn to wait **without freezing** (the `millis()` pattern), so the button, the sensors, and the display can be checked in turn without waiting on each other.

> ➡️ **Time to practice.** Do [Practice 2](#practice-2--buttons-bouncing-and-debounce-25-minutes) — see the bouncing with your own eyes, then tame it — and then come back here for [Concept 7](#7-pin-current-and-drivers-pins-give-commands-not-power).

### 7. Pin current and drivers: pins give commands, not power

An ESP32 output pin can only supply **a little current**. Espressif's datasheet gives about 20–40 mA per pin as its limit, but working at that limit all the time is like driving with the pedal to the floor: it works, but things wear out fast. This curriculum's safe rule: **at most about 12 mA per pin**.

Compare that with what Node 1's "hands" need (the table in Concept 4):

| Load | Current needed | Voltage needed | Straight from a pin? |
| :--- | :--- | :--- | :---: |
| LED + 220 Ω resistor | about 6 mA | 3.3 V is enough | ✅ |
| Passive buzzer + 220 Ω resistor | about 7 mA on average | 3.3 V is enough | ✅ |
| Relay coil | about 70 mA | 5 V | ❌ |
| Fan, pump | about 100–300 mA | 5 V | ❌ |
| SG90 servo | about 100–250 mA, more when blocked | 5 V | ❌ |

The last three loads need **about 6–25 times** more current than a pin can safely give (even more when a motor is blocked), and a higher voltage as well. Connecting them straight to a pin means one of two things: the load doesn't move, or the ESP32 pin is permanently damaged.

The way out is a **driver**: an in-between switch that takes its power from the MB102, while the ESP32 pin only gives the **command**. Think of a light switch on the wall: your finger doesn't carry electricity to the lamp, it only presses the switch. The ESP32 pin is the "finger", and the driver is the "switch".

![Comparison of three ways to power a load from an ESP32 pin. Left, a green check mark: pin D4 straight to a 220 ohm resistor and an LED to GND, a current of about 6 milliamperes, safe. Middle, a red cross: pin D25 straight to the pump; the pump needs about 300 milliamperes and 5 volts, so the pump stays still, the pin gets damaged, or the ESP32 restarts. Right, a green check mark: pin D25 only sends a command to a MOSFET driver, while the pump gets 5 volts from the MB102's top rail, and the red arrow of the pump current doesn't pass through the ESP32; shared GND. Note at the bottom: this week's drivers are the relay module for the fan and the lamp, the MOSFET for the pump, and the circuit inside the servo](assets/pin-current-drivers.png)

This week you use three kinds of drivers:

| Load | Driver | Current the ESP32 pin has to supply |
| :--- | :--- | :--- |
| Fan (and later the lamp) | **Relay module** (Concept 9) | just a few mA, enough to light a small LED inside the module |
| Pump | **IRLZ44N MOSFET** (Concept 10) | almost zero; only a brief jolt each time it switches on or off |
| Servo | **The circuit inside the servo** itself | almost zero: the signal wire only carries an "angle command" |

There's one more trait that motors and relay coils share. Both contain a **coil of wire**, and a coil "doesn't like" having its current cut off suddenly. When it's cut, it throws out a brief voltage spike that can reach tens of volts — enough to damage the driver. The protection is a **flyback diode** (a diode that guards against that backward spike, Concept 10). The relay module already carries its own for its relay coils; for the pump, we add one ourselves. If your "fan" is a small bare DC motor with a propeller — not a 40 mm box fan that already has its own circuit inside — also put a 1N4007 in parallel with that motor, with the silver ring toward the (+) wire.

### 8. PWM: one technique, three uses (brightness, pitch, and angle)

A digital pin only knows two states: 3.3 V or 0 V. So how can an LED be **half bright**? The answer: blink the LED **very fast**, thousands of times per second. Our eyes can't see blinking that fast, so all we see is the average.

- On 25% of the time, off 75% → looks **dim**.
- On 75% of the time → looks **bright**.

This technique is called **PWM** (*Pulse Width Modulation*). It has two "knobs" you can turn:

- ***Duty cycle***: what percentage of each cycle the pin is on.
- **Frequency**: how many times per second the on-off pattern repeats, in **hertz** (Hz). A frequency of 5,000 Hz means 5,000 times per second.

With those two knobs, the same technique can be used for three things:

![Three uses of PWM, each in a row of square waves. Row 1, dimming an LED: the frequency stays at 5,000 hertz; left, duty cycle 25 percent, narrow pulses, a dim LED, with the code ledcWrite(PIN_LED, 64); right, duty cycle 75 percent, wide pulses, a bright LED, with the code ledcWrite(PIN_LED, 191). Row 2, buzzer tones: the duty cycle stays at 50 percent; left, 262 hertz, widely spaced waves, the low note do, with the code ledcWriteTone(PIN_BUZZER, 262); right, 523 hertz, waves twice as close together, high do, with the code ledcWriteTone(PIN_BUZZER, 523). Row 3, servo angle: one pulse every 20 milliseconds, or 50 hertz; from left to right, a 0.5 millisecond pulse means 0 degrees, about 1.45 milliseconds means 90 degrees, and 2.4 milliseconds means 180 degrees, each with a small picture of the servo arm at that angle; note: the pulse widths are enlarged so you can see them, and the direction of rotation depends on how the servo arm is mounted](assets/pwm-three-uses.png)

| Use | What stays fixed | What changes | Example |
| :--- | :--- | :--- | :--- |
| **Dimming an LED** | frequency (5,000 Hz) | duty cycle | 25% = dim, 75% = bright |
| **Passive buzzer tones** | duty cycle (50%) | frequency = pitch | 262 Hz = do (C4), 523 Hz = high do (C5) |
| **Servo angle** | frequency (50 Hz, one pulse every 20 ms) | pulse width | 0.5 ms = 0°, about 1.45 ms = 90°, 2.4 ms = 180° |

On the ESP32, PWM is handled by a part of the chip called **LEDC** (*LED Control*) — its name does come from LEDs, but it can be used for anything. In esp32 package **version 3**, using it only takes a few commands:

```cpp
ledcAttach(PIN_LED, 5000, 8);    // set up PWM on this pin: frequency 5,000 Hz, 8-bit resolution
ledcWrite(PIN_LED, 64);          // duty cycle 64 out of 255, about 25%: dim
ledcAttach(PIN_BUZZER, 1000, 10);  // the buzzer needs ledcAttach first too (its frequency is changed later)
ledcWriteTone(PIN_BUZZER, 440);  // play a 440 Hz tone (the duty cycle is automatically 50%)
```

- **`ledcAttach(pin, frequency, resolution)`** sets up PWM on that pin and takes the place of `pinMode`. A **resolution of 8 bits** means the duty cycle is written as a number from **0** (off) to **255** (full), so 128 is about 50%.
- **`ledcWrite(pin, duty)`** sets the duty cycle.
- **`ledcWriteTone(pin, frequency)`** changes the frequency while keeping the duty cycle at 50% — just right for a buzzer. A frequency of `0` means silence.

> [!WARNING]
> **Watch out for old tutorials.** Many tutorials on the internet still use the esp32 package **version 2** way: `ledcSetup(0, 5000, 8);` and then `ledcAttachPin(4, 0);`. In version 3, which we use, both of these commands **have been removed**, so the program fails to compile. If you find an example like that, translate it to `ledcAttach` (there's an example in 🚨).

For the **servo**, we don't calculate pulse widths ourselves. The **ESP32Servo** library takes care of it: we just write `write(90)`, and the library turns it into a pulse of about 1.45 ms every 20 ms. Behind the scenes, that library uses LEDC too.

One more thing: the ESP32 has **16 PWM channels**. Every `ledcAttach` and every servo takes one channel automatically. When the servo and the buzzer are used together, the order matters: **attach the servo first, then the buzzer** (explained in 🚨 and 🔬).

You'll often use two Arduino helpers together with PWM:

```cpp
int brightness = map(turns, 0, 4095, 0, 255);  // change the 0-4095 scale to 0-255
int angle = constrain(number, 0, 180);         // force it to stay between 0 and 180
```

- **`map(value, fromLow, fromHigh, toLow, toHigh)`** changes the scale, like turning a 0–100 test score into a 0–4 grade. Example: `2048` on the `0`–`4095` scale becomes about `127` on the `0`–`255` scale.
- **`constrain(value, min, max)`** "fences in" a number: anything smaller than `min` becomes `min`, and anything bigger than `max` becomes `max`.

> ➡️ **Time to practice.** Do [Practice 3](#practice-3--dimming-an-led-with-a-potentiometer-15-minutes) (dimmer), Practice 4 (buzzer), and Practice 5 (servo), then come back here for [Concept 9](#9-relays-switches-moved-by-a-magnet).

### 9. Relays: switches moved by a magnet

A **relay** is a switch that isn't pressed by a finger but pulled by an **electromagnet**. Inside its blue box there are:

- a **coil**: a winding of wire that becomes a magnet when current flows through it (about 70 mA at 5 V);
- a spring-loaded iron **lever** that the magnet pulls;
- **three contacts**: **COM** (*common*, the shared terminal), **NO** (*normally open*), and **NC** (*normally closed*).

When no current flows through the coil, the spring holds the lever so that **COM is connected to NC**. As soon as current flows through the coil, the magnet pulls the lever — "click!" — and **COM switches over to NO**. That "click" is the sign the relay is working.

![How a relay and a 2-channel relay module work. Top left, the inside of a relay when no current flows through the coil: a lever hinged on the left is held by a spring so its right end, the COM contact, touches NC. Bottom left, when current flows through the coil: the iron core in the coil becomes a magnet and pulls the lever down with a click, so the COM end drops to touch NO. Right, an illustration of a 2-channel relay module seen from above, with markers: the row of GND, IN1, IN2, VCC pins on the left; the JD-VCC jumper; two optocouplers; two blue relays; indicator LEDs; and the NO, COM, NC screw terminals for each relay on the right. Note: the module is active LOW; giving IN a LOW means the relay pulls in](assets/relay-how-it-works.png)

Our fan is connected through **COM and NO**: 5 V from the MB102 goes into COM, NO goes to the fan's red (+) wire, and the fan's black (−) wire goes to GND. As a result, the fan **only spins while the relay is pulled in**. If the ESP32 restarts or its IN wire comes loose, the relay releases and the fan stops. This principle — "if something fails, things fall back to a safe state" — is called ***fail-safe***.

The **relay module** we use isn't just a bare relay. That little board also carries *optocouplers* (a tiny light and light sensor in one package, so the ESP32 side only "talks" to the coil side through light), driver transistors, flyback diodes, and indicator LEDs. That's why an ESP32 pin only has to give the command with a current of a few mA (Concept 7).

Our module is a ***low-level trigger*** type (triggered by a low signal), also called **active LOW**:

| The IN pin gets… | Relay | Fan |
| :--- | :--- | :--- |
| `LOW` | pulls in (goes "click"), the indicator LED lights up | spins |
| `HIGH` | releases | stays still |

The opposite of what you'd expect, right? Inside the module, the IN pin is connected to the **(−) end** of the tiny light inside the optocoupler, while its (+) end goes to VCC (5 V) through a resistor. That light only turns on when IN is **pulled down** toward 0 V, because only then is there enough voltage difference to push a current through. To keep the code from being confusing, we wrap this in a function:

```cpp
// Our relay module is "active LOW": LOW = the relay connects (fan runs), HIGH = the relay releases.
void setFan(bool isOn) {
  if (isOn) {
    digitalWrite(PIN_FAN_RELAY, LOW);
  } else {
    digitalWrite(PIN_FAN_RELAY, HIGH);
  }
}
```

After that, `setFan(true)` means "fan on" — no need to remember the reversed logic anymore.

**Why do we have to check it with 3.3 V?** This relay module was actually designed for 5 V boards like the Arduino Uno, whose "HIGH" is 5 V. The ESP32's "HIGH" is only 3.3 V, so a 1.7 V difference is still left between VCC (5 V) and IN. On most modules, 1.7 V isn't enough to light the optocoupler's light, so the relay releases properly. But on some modules, that leftover voltage is enough to make the relay **refuse to release** or chatter. In Practice 6 you check this **without code**, just by moving one wire. If your module turns out to be one of the problem ones, there's a way out with the **JD-VCC** jumper (see 🚨).

> [!CAUTION]
> **Never connect a relay to 220 V mains (PLN) power.** The "10A 250VAC" printed on the relay's body is tempting, but mains electricity can **kill** and start **fires**. Breadboards and jumper wires aren't designed for that voltage, and cheap relay modules often have copper tracks that are too close together for 220 V. This curriculum **only** controls 5 V loads. If one day you want to control a real 220 V appliance, use a certified ready-made product (for example a smart plug with the SNI mark, Indonesia's national standard) or ask a licensed electrician for help.

**A lamp on relay 1?** Kit Stage 1 doesn't include a lamp. The lamp relay (IN1, D32) is already connected and controlled by the Node 1 code; for now, the "lamp" is the indicator LED on the relay module and its click. Want a real "lamp" — an ordinary LED with a 220 Ω resistor, powered with 5 V from the top rail, **not** a 220 V bulb? See 🧩 Level 3.

### 10. MOSFETs and flyback diodes: an electronic switch for the pump

A relay clicks and has moving parts. For the pump, we use a switch that is **fully electronic**: a **MOSFET** (*metal-oxide-semiconductor field-effect transistor*). A MOSFET has no moving parts, makes no sound, and can switch on and off thousands of times per second.

The IRLZ44N MOSFET has three legs. Hold it with **the printed text facing you** and the legs pointing down:

- **G** (*gate*) — the **left** leg: where the command from the ESP32 goes in.
- **D** (*drain*) — the **middle** leg: connected to the pump's (−) wire. The metal tab on its back is also connected to D, so don't let that tab touch any wire or other leg.
- **S** (*source*) — the **right** leg: to GND.

Picture a **water faucet**. The G leg is the faucet's handle. As soon as G gets a voltage (compared with S), the "faucet" between D and S opens, and the large current from the pump can flow to GND. Give G 0 V, and the faucet closes. The special part: this handle needs almost no current at all.

![The pump circuit with an IRLZ44N MOSFET. Left, the schematic: the MB102's 5-volt rail to the pump; the other end of the pump to the MOSFET's D leg; the S leg to GND; pin D25 through a 220 ohm resistor to the G leg; a 10 kiloohm resistor from the point between D25 and the 220 ohm resistor to GND; a 1N4007 diode in parallel with the pump, its striped end toward the 5-volt side. A red arrow shows the pump current going from 5 volts through the pump, D, S, to GND without passing through the ESP32. Three lines of notes explain what the 220 ohm resistor, the 10 kiloohm resistor, and the diode are for. Top right, the IRLZ44N MOSFET seen from the front with its text facing the reader: left leg G gate, middle D drain, right S source, and the metal tab on the back connected to D; a note that the letter L means logic-level, so 3.3 volts is enough, while the IRF520 isn't. Bottom right, the 1N4007 diode with a silver ring at one end: the silver ring is the cathode and faces the 5-volt side; the wrong way around means a short circuit through the MOSFET when the pump is switched on](assets/mosfet-pump.png)

This circuit is called a ***low-side switch***: the pump is always connected to 5 V, and the MOSFET connects or cuts its "way home" to GND. Three supporting parts make it safe:

1. **A 220 Ω resistor in series with the G leg.** A MOSFET's gate behaves like a tiny capacitor. Right when it switches on or off, a short jolt of current flows to charge it; this resistor softens that jolt to protect the ESP32 pin.
2. **A 10 kΩ resistor from the gate line to GND.** While the ESP32 is just starting up, restarting, or having a program uploaded, pin D25 floats for a while (Concept 5). Without this resistor, the gate could "get a charge" by itself and the pump would run without being asked. The 10 kΩ resistor makes sure the gate stays at 0 V — pump off — until the program says otherwise. In our circuit, this resistor sits on the D25 side of the 220 Ω resistor; because the gate draws almost no current, the gate is still pulled down to 0 V along with it.
3. **A 1N4007 flyback diode in parallel with the pump.** Remember the coil trait from Concept 7: when the MOSFET cuts the current, the pump motor's coil "forces" its current to keep flowing and throws out a voltage spike that can damage the MOSFET. Imagine fast-flowing water in a pipe whose faucet is shut suddenly: the pipe can burst (*water hammer*). The diode is a "relief hose": normally it does nothing, but when the spike arrives, the current circles through the diode and the pump until it dies out on its own. **Its direction matters**: the end with the silver stripe (the cathode) goes to the **+5 V** side. The wrong way around, that diode connects 5 V straight to GND through the MOSFET.

**Why does it have to be the IRLZ44N?** The **L** in its name means ***logic-level***: its gate already conducts well at a low voltage (it starts conducting at around 1–2 V and is fully open at 4–5 V). So the ESP32's 3.3 V is enough for our pump's current, which is only a few hundred mA. Many "MOSFET modules for Arduino" use the **IRF520**, which only opens fully at around 10 V; with 3.3 V, the pump is weak or doesn't turn at all. That's why our kit lists the IRLZ44N, or the **D4184** module, which is also logic-level.

When do you use a relay, and when a MOSFET?

| | Relay | MOSFET |
| :--- | :--- | :--- |
| How it works | mechanical, goes "click" | electronic, silent |
| Speed | about 10 ms per switch; not suitable for PWM | very fast; can do PWM (for example to control the pump's speed) |
| What it can switch | both DC and AC, and the load side is isolated from the ESP32 | DC only, and the GND must be shared |
| Lifespan | limited: about 100,000 switches | almost unlimited when used within its limits |
| On Node 1 | lamp and fan | pump |

> ➡️ **Time to practice.** Do [Practice 6](#practice-6--relay-a-button-turns-on-a-fan-powered-by-the-mb102-30-minutes) through Practice 9. Concept 11 below is light reading; read it whenever you like.

### 11. The ESP32 family at a glance

When you shop for parts, you'll come across many siblings of the ESP32. They're all made by Espressif, can be programmed with the Arduino IDE, and most of this curriculum's code still runs on them. The differences are in the "engine" and the features:

| Chip | Cores | Wireless | Strengths | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **ESP32** (our board) | 2 Xtensa cores, 240 MHz | Wi-Fi 4, Bluetooth Classic + BLE | the most tutorials; has a DAC and touch sensing | used in this curriculum |
| **ESP32-S3** | 2 Xtensa cores, 240 MHz | Wi-Fi 4, BLE 5 | built-in USB, more pins, special instructions for artificial intelligence (AI) | no DAC and no Bluetooth Classic |
| **ESP32-C3** | 1 RISC-V core, 160 MHz | Wi-Fi 4, BLE 5 | cheap, power-saving | fewer pins |
| **ESP32-C6** | 1 RISC-V core, 160 MHz | **Wi-Fi 6**, BLE 5, Zigbee/Thread | suits the new generation of smart homes | different pins and rules |

Remember two things. First, **the pin map in this module only applies to the ESP32 DevKit V1** (the classic ESP32 chip). Every member of the family has its own rules for strapping pins, ADCs, and forbidden pins. Second, the Syllabus deliberately asks for the ESP32 DevKit V1 for our kit: it's cheap, easy to find, and almost every tutorial is written for it. You can explore its siblings after you finish this curriculum.

> ➡️ **Finished reading Concept 11?** Haven't done [Practice 6](#practice-6--relay-a-button-turns-on-a-fan-powered-by-the-mb102-30-minutes) through Practice 9 yet? Continue there. Concept 11 has no practice.

---

## 🔧 Step-by-step practice

Nine practices, **in order**: every part goes onto the same workbench, and by the end of the module they all become Node 1. The practices marked ⭐ in the table of contents are part of the requirements to pass:

1. **Practices 2 and 6** — one button turns a relay on and off without bouncing.
2. **Practices 7 and 8** — the pump and the fan run from the MB102 without the ESP32 restarting.
3. The third requirement, naming the three pins to avoid with the reasons, is covered in [Concept 2](#2-safe-pins-conditional-pins-and-trap-pins) and the Quiz.

Almost every practice can first be tried in Wokwi with a `diagram.json` from the [`code/`](code/) folder, just like the Quick Win, and then built on the real board. Practices 1 and 8 only work on the real board, because they're about real electricity.

> [!TIP]
> **How to save this week's sketches.** For each sketch, choose **File → New Sketch** in the Arduino IDE, delete its default contents (**Ctrl + A**, then **Delete**), paste the code (**Ctrl + V**), then choose **File → Save** and give it the name mentioned in the practice, for example `module05_toggle_button`. Even handier: save it straight into the `module-05` folder inside the `learn-iot` repository (how to do that is in Practice 9), then commit every time you finish a practice.
>
> **Before you click Upload**, make sure the board box in the Arduino IDE's top bar says **DOIT ESP32 DEVKIT V1** and the port is right (Module 2). Stuck at `Connecting…`? Hold **BOOT** as soon as `Connecting…` appears, and let go when `Writing at …` starts moving. The Serial Monitor is always at **115200 baud**.

At the end of the module, your practice folder contains:

```text
learn-iot/
└── module-05/
    ├── module05_press_counter/          ← Practice 2.1
    ├── module05_toggle_button/          ← Practice 2.2 ⭐
    ├── module05_potentiometer_dimmer/   ← Practice 3
    ├── module05_buzzer_tones/           ← Practice 4
    ├── module05_servo_serial/           ← Practice 5
    ├── module05_fan_relay/              ← Practice 6 ⭐
    ├── module05_mosfet_pump/            ← Practice 7 ⭐
    ├── module05_restart_detective/      ← Practice 8 ⭐
    └── workbench.jpg                    ← Practice 9 (a photo of your build)
```

Each sketch folder holds one `.ino` file with the same name, for example `module05_toggle_button/module05_toggle_button.ino` — the Arduino IDE creates it automatically when you save.

### Practice 1 — Rearranging the workbench: two breadboards, the status LED, and the MB102 (45–60 minutes, set up once)

> 🖥️ **Tools and parts:** two breadboards, the ESP32 board, the red LED + 220 Ω resistor (from Module 2), the MB102 module + a 5 V 2 A USB adapter + a USB A–A cable, the multimeter, male–male jumper wires (black and orange, plus two spare wires for measuring), masking tape + a marker, and a utility knife (only if your breadboard's rail strip is held on by adhesive). The **Arduino IDE** is used in the last step. Concepts used: 1–4. This practice can't be simulated in Wokwi.

**Why rearrange it?** Remember Module 2: the ESP32 board covers almost the whole width of the breadboard, and only row **j** below the bottom row of pins is left. The **top** row of pins — where D13, D27, D26, D25, D33, and D32 are, that is, all our actuators and the button — has no free holes at all. The solution: **two breadboards side by side**, with the ESP32 board "riding" across both, so each row of pins gets free holes of its own.

![Four steps for setting up two breadboards, with only some of the columns drawn; each panel has the column numbers 1, 5, 10, 15, 20 at the top and the row letters a and j on the left. 1, the top rail strip of the new breadboard, with a piece of tape labeled REMOVE stuck on it, is slid lengthwise until it comes off the body; the strip's joint line is marked, with the note number 1 on the left, letter a at the top. 2, the new breadboard without its top rail strip is placed in front of the old breadboard; its row a side butts against the old breadboard's bottom rail strip, which now becomes the middle rail. 3, the ESP32 board, with its USB connector on the left, is lined up without pressing: the top row of pins, from VIN in column 4 to EN in column 18, over row i of the upper breadboard, and the bottom row of pins, from 3V3 to D23, over row b of the lower breadboard; if it doesn't fit yet, slide the lower breadboard. 4, the result seen from above: free holes colored green in rows f, g, h above the top row of pins and in rows c, d, e below the bottom row of pins; row f of the upper breadboard and row e of the lower breadboard are circled as the rows this module uses](assets/two-breadboards.png)

#### 1.1 Take the old circuit apart

1. **Unplug the USB cable** from the board.
2. Pull out all the jumper wires, then the green and yellow LEDs from Module 3 together with their resistors. Keep them somewhere safe. The red LED and its resistor come out for now too; both go back in step 1.4.
3. Take the ESP32 board off the breadboard: gently pry it up from both ends **in turn**, a little at a time, with a fingernail or a small flat-head screwdriver. Don't pull it out from just one end, because its pins can bend. A slightly bent pin can be straightened with a fingernail.

#### 1.2 Prepare the second breadboard

We call the old breadboard the **upper breadboard**, and the new one the **lower breadboard**. Place both the same way round as in Module 2: **number 1 on the left and letter a at the top** (row a farthest from you, row j closest).

1. Look at the lower breadboard. Along both of its long edges there's a **rail strip**: a long piece holding two power strips, marked with a red (+) line and a blue (−) line. On most breadboards, this strip is a separate piece, locked on by dovetail-shaped "tongues" along its side and held by a layer of adhesive underneath. The one you'll remove is the **top rail strip**: the strip along the top edge, next to **row a**. Stick a piece of masking tape labeled **REMOVE** on that strip now, before you turn the breadboard over.
2. Turn the lower breadboard over. If the adhesive layer covers the joint between the strip marked **REMOVE** and the breadboard's body, cut the adhesive exactly along the joint line with the utility knife. Cut away from your fingers, slowly.
3. Slide the strip marked **REMOVE** **lengthwise**, toward the end of the breadboard, until it comes off. Don't pry it upward — the tongues can snap. Keep the strip; you can put it back someday. Is the strip molded into the body so it won't come off at all? See 🚨.
4. Turn the lower breadboard back to its original position (number 1 on the left, letter a at the top), then place it **in front of** the upper breadboard — closer to you, side by side on the table, not stacked. Its row a side, whose strip you removed, butts against the **bottom rail strip of the upper breadboard**. That strip is now squeezed in the middle, so we call it the **middle rail**. Line up the left ends of the two breadboards so that column 1 meets column 1.

#### 1.3 Place the ESP32 across both breadboards

1. Hold the board with the USB connector on the **left**, as in Module 2. The **top** row of pins (VIN, GND, D13, D12, …, EN) goes into the bottom half of the upper breadboard (rows f–j), while the **bottom** row of pins (3V3, GND, D15, D2, D4, …, D23) goes into the top half of the lower breadboard (rows a–e).
2. **Line it up first, without pressing.** Aim the VIN pin at column 4 of the upper breadboard and the 3V3 pin at column 4 of the lower breadboard. Try a few rows until **every** pin sits right above a hole; usually the top row lands on row **i** and the bottom row on row **b**. If it doesn't fit on any row, slide the lower breadboard a little farther away or closer — they aren't locked together yet. **Don't force it**: a pin forced into the wrong hole will bend.
3. Press the board down gently and evenly at both ends until its pins go in. Hold the lower breadboard with your other hand so it doesn't shift.
4. **Check the free holes.** This part is a must: the holes in **row f** of the upper breadboard and **row e** of the lower breadboard, columns 4–18, must be empty and not covered by the board. Usually 2–3 rows are left on each side (rows f, g, h at the top; c, d, e at the bottom). Covered? Remove the board, slide the lower breadboard, then repeat step 2. Each of those free holes is connected to the pin in its column (Module 2: the five holes of one column = one strip).
5. From now on, this module uses **row f of the upper breadboard** for the top row of pins and **row e of the lower breadboard** for the bottom row of pins. Those two rows are always free, however your board ended up fitting. Example: **13f** (upper) means column 13, row f, upper breadboard — right above the D32 pin.
6. So they don't shift, stick both breadboards onto a flat base (thick cardboard or a thin board) with their own adhesive backing or double-sided tape. Optional, but very helpful.

#### 1.4 Put the D4 status LED back and set up the 3.3 V rail

Every connection in this step is on the **lower breadboard**. Make sure the USB is still unplugged.

> 💡 **How to read hole names** (same as Modules 2–3): number = column, letter = row. So **4e** means column 4, row e. Because there are two breadboards now, the note (upper) or (lower) tells you which breadboard. The wire colors in the tables are only suggestions — what matters is the hole — but get into the habit of **black = GND**, **orange = 3.3 V**, and **red = 5 V**. The workbench pictures in this module are wide; click a picture to open it at full size.

| Part | From | To | Purpose |
| :--- | :--- | :--- | :--- |
| **Orange** wire | 4e (below 3V3) | bottom rail **(+)** | the bottom rail (+) becomes 3.3 V for the sensors and the potentiometer |
| **Black** wire | 5e (below GND) | bottom rail **(−)** | the board's GND |
| 220 Ω resistor | 8e (below D4) | 8g, across the center channel | limits the LED's current; 8e and 8g are separated by the center channel, so they aren't connected directly |
| Red LED | **long** leg in 8i | **short** leg in 9i | status LED |
| **Black** wire | 9j | bottom rail **(−)** | the LED's "way home" |

#### 1.5 Install the MB102: the top rail becomes 5 V

1. Make sure the adapter is **not** plugged into the wall outlet yet.
2. Plug the MB102 into the **right end of the upper breadboard**: the pins underneath it go into the top rail and the middle rail at the same time, while its USB port and barrel jack face outward (to the right). Press gently until it's seated.
3. Set its jumpers. A jumper is a small yellow cap; pull it off with a fingernail or tweezers, then push it onto the two pins next to the label you want (compare with the MB102 picture in Concept 4). The jumper on the **top-rail** side goes in the **5V** position; the jumper on the **middle-rail** side goes in the **OFF** position (or just pull that jumper off and keep it). The middle rail is partly covered by the ESP32 board and sits right next to the free rows, so if it were live, it would only invite a wrong connection. **The middle rail isn't used.**
4. Connect a **black wire** from **5f** (upper) — right above the GND pin of the top row — to the **top rail (−)**. This is the **shared GND** (Concept 4): from now on, the board's GND, the bottom rail's GND, and the MB102's GND are one.
5. Label them with masking tape: write **5V** next to the top rail (+), **3V3** next to the bottom rail (+), and **DO NOT USE** on the middle rail. These little labels prevent the most expensive mistake of the week: giving 5 V to something that can only handle 3.3 V.

![Illustration of the workbench after Practice 1, seen from above. The upper breadboard is complete, with the top rail along its top edge and the middle rail along its bottom edge; the lower breadboard has no top rail strip and has the bottom rail along its bottom edge. The ESP32 board, with its USB connector on the left, rides across both: the top row of pins in row i of the upper breadboard, the bottom row of pins in row b of the lower breadboard, columns 4 to 18. On the lower breadboard: an orange wire from 4e below 3V3 to the bottom rail plus, a black wire from 5e below GND to the bottom rail minus, a 220 ohm resistor from 8e below D4 to 8g, the red LED with its long leg in 8i and its short leg in 9i, and a black wire from 9j to the bottom rail minus. On the upper breadboard: the MB102 module at the right end, the top-rail-side jumper on 5V and the middle-rail-side jumper on OFF, the 5-volt adapter coming in through a USB A-to-A cable, and the black shared-GND wire from 5f above GND to the top rail minus. The column numbers are also written in the center channel of both breadboards. Labels: top rail 5 V for loads, middle rail not used, bottom rail 3.3 V from the ESP32](assets/workbench-1-base.png)

#### 1.6 Measure before you use it

As in Module 2, the probe tips are too big for the breadboard holes. Plug in two spare jumper wires as "extensions", then touch the probes to their metal ends. Turn the multimeter dial to **V⎓ 20**.

1. The laptop USB is **still unplugged**. (This time on purpose: no relay module or other MB102-powered part is connected to a GPIO pin yet. From step 4 below on, always follow golden rule number 5: USB first, then the MB102.) Plug the adapter into the wall outlet, connect it to the MB102's USB port with the USB A–A cable, then press the MB102's power button. The LED on the MB102 lights up. The A–A cable is only for **adapter ↔ MB102** — **never plug it into the laptop**: an MB102 fed by the laptop is no different from loads on the laptop's USB (Practice 8).
   - Check the button: press it once more, and the MB102's LED must **go out**; then press it again to turn it back on. If the LED stays on, your MB102's button doesn't cut the USB path. From then on, every time this module says "turn off the MB102", **unplug the A–A cable from the MB102**.
2. Plug the spare wires into the top rail **(+)** and **(−)** at the **left end** (near columns 1–5). Touch the red probe to the wire in (+) and the black probe to the wire in (−). The display must show **about 5 V** (between 4.75 V and 5.25 V).
   - **A negative number**, for example `-5.02`, even though the probes are right? Then the MB102 puts its (+) on your breadboard's **blue**-lined strip. Turn off the MB102 and read 🚨 before you go on: the black 5f wire has to be moved too.
   - **`0`** even though the MB102's LED is on? Your top rail is probably **split in the middle** (Module 2 Practice 1). **Turn off the MB102 first**, then add two bridging wires around columns 30–33: a red one joining the left and right halves of the (+) strip, and a black one for the (−) strip. Measure again.
3. Move the spare wire touched by the red probe to the **middle rail (+)** near the MB102 (around columns 45–50, the part not covered by the ESP32 board). The wire touched by the black probe stays in the top rail (−). The display must show **about 0 V**, because the middle-rail-side jumper is in the OFF position.
4. Turn off the MB102. Before plugging in the USB, trace the wires with your finger: the orange wire (4e) goes into the **red**-lined strip of the bottom rail, and the black wires (5e, 9j) go into the **blue**-lined strip — none swapped, none sharing a strip. Plug the laptop USB into the ESP32 board. Measure the **bottom rail** at its **left end** (near columns 4–10): plug both spare wires into the bottom rail's (+) and (−), then touch the probes to them as before. The display must show **about 3.3 V**.
   - **`0`**, the board's red LED is dim or off, or the board feels warm? **Unplug the USB now**: the orange and black wires have probably gone into the same strip. A **negative** number (`-3.3`)? The two are in swapped strips.
5. Test the shared GND: turn the MB102 back on, then measure with the red probe on the **top rail (+)** and the black probe on the **bottom rail (−)**. The display must show **about 5 V**. That number proves the GNDs of the two sources are joined through the 5f wire. If it shows `0` or the number jumps around, check the black 5f wire.

Write down the results; you'll use them again in Practice 8.

#### 1.7 Final test: the status LED blinks again

1. In the Arduino IDE, open the Blink sketch from Module 2: **File → Sketchbook → module02_blink**. Can't find it? Copy it from [`module02_blink.ino`](../../phase-0-foundations/module-02-electricity-and-first-upload/code/module02_blink/module02_blink.ino).
2. Click **Upload**. The red LED on the lower breadboard blinks every half second. **Your workbench is ready.**

Not blinking? Check the LED's direction (long leg in 8i) and its resistor (8e–8g). Still not working? See 🚨.

> ⬆️ **Done with Practice 1?** Go back to [Concept 5](#5-digital-inputs-and-pull-ups-why-does-my-button-read-randomly) and read through Concept 6 (the ➡️ there will take you to Practice 2).

### Practice 2 — Buttons, bouncing, and debounce (25 minutes)

> 🖥️ **Tools and parts:** the **Arduino IDE** (or Wokwi), one push button, two jumper wires (yellow and black). Concepts used: 5 and 6.
>
> ⭐ **Required** — groundwork for the first requirement to pass: a button without bouncing.

#### Install the button first

First turn off the MB102 and unplug the USB (in the order of golden rule number 5). The button sits **across the center channel of the upper breadboard**, like the buttons in most tutorials.

| Part | Position (upper breadboard) | Purpose |
| :--- | :--- | :--- |
| Push button | four legs in **22e, 24e, 22f, 24f** | straddles the center channel |
| **Yellow** wire | **6f** (above D13) → **22h** | connects D13 to the button leg at 22f |
| **Black** wire | **24a** → top rail **(−)** | connects the button leg at 24e to GND |

Notice: the legs we use, **22f** and **24e**, are **diagonally opposite** each other. Inside a four-legged button, two pairs of legs are always permanently connected, and which way the pairs run depends on how the button is placed. Using diagonally opposite legs is **always right**, whichever way your button faces. Before powering up again, make sure the black wire from 24a ends in the **(−)** strip of the top rail, **not** in the strip labeled **5V** next to it. When you've finished building, plug the laptop USB back in; the MB102 doesn't need to be on until Practice 5.

![Illustration of the workbench after Practice 2: the same as after Practice 1, plus a push button straddling the center channel of the upper breadboard with its legs in 22e, 24e, 22f, and 24f; a yellow wire from 6f above D13 to 22h; a black wire from 24a to the top rail minus. The diagonally opposite legs 22f and 24e are marked with circles and an orange dashed line. The parts from Practice 1 are drawn faded](assets/workbench-2-button.png)

#### 2.1 See the bouncing: `module05_press_counter`

1. Want to try it in Wokwi first? Open a new ESP32 project, paste in the [`diagram.json`](code/module05_press_counter/diagram.json) and the code below, then click **▶**. The Wokwi button is made to bounce on purpose, like a real button.
2. In the Arduino IDE, create a new sketch **`module05_press_counter`** (how to create and save a sketch, and how to check the board before you click **Upload**, is in the **Tip** box at the start of the Practice section) with this code (file: [`module05_press_counter.ino`](code/module05_press_counter/module05_press_counter.ino)), then click **Upload** and open the Serial Monitor:

   ```cpp
   // Module 5 - Practice 2.1: counting button presses WITHOUT debounce
   // Press the button on D13 once, then look at the Serial Monitor.
   // Often a single press is counted more than once: that's "bouncing".

   const int PIN_BUTTON = 13;  // manual button (canonical pin map)

   int previousState = HIGH;  // the button's state on the previous pass of loop()
   int pressCount = 0;

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     Serial.println("Press the button ONCE, then look at the number.");
   }

   void loop() {
     int state = digitalRead(PIN_BUTTON);
     if (previousState == HIGH && state == LOW) {  // it has just changed: released -> pressed
       pressCount++;
       Serial.print("Press #");
       Serial.println(pressCount);
     }
     previousState = state;  // remember it for the next pass
   }
   ```

3. Press the button **once**, firmly, then let go. Repeat a few times while counting for yourself.

   **Expected output**, roughly like this — the numbers jump faster than your presses:

   ```text
   Press the button ONCE, then look at the number.
   Press #1
   Press #2
   Press #3
   Press #4
   ```

   ![Two cropped Wokwi screenshots side by side. Left, titled the green button was clicked only 3 times: the ESP32 board with the green button on D13. Right, titled but the count went up to 53: the Serial Monitor, whose last lines are Press #38 through Press #53. Note at the bottom: the Wokwi button is made to bounce on purpose, like a real button, every bounce is read as a new press, and the numbers can be different every time you try](assets/wokwi-button-bounce.png)

   *Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

   In Wokwi, three presses can be counted dozens of times. On a real board, the result depends on your button: a new button is sometimes clean, while cheap buttons, or buttons pressed slowly, often bounce. If your button happens to be "polite", press it slowly, halfway — the bouncing usually shows up.

#### 2.2 Tame the bouncing: `module05_toggle_button`

Now we use the `buttonPressed()` function from Concept 6. Every press flips the status LED: on → off → on.

1. Wokwi: use this [`diagram.json`](code/module05_toggle_button/diagram.json) — the same as the Quick Win (button + D4 LED), **not** the 2.1 diagram, which has no LED. Arduino IDE: create a new sketch **`module05_toggle_button`** (file: [`module05_toggle_button.ino`](code/module05_toggle_button/module05_toggle_button.ino)):

   ```cpp
   // Module 5 - Practice 2.2: one press = one switch (with debounce)
   // Every time the button on D13 is pressed, the LED on D4 switches: on -> off -> on ...

   const int PIN_BUTTON = 13;      // manual button (canonical pin map)
   const int PIN_LED = 4;          // status LED
   const int DEBOUNCE_DELAY = 30;  // milliseconds: how long to wait for the button to stop bouncing

   bool ledOn = false;
   int pressCount = 0;

   // Returns true ONCE for every real press.
   bool buttonPressed() {
     if (digitalRead(PIN_BUTTON) == HIGH) {  // not being pressed
       return false;
     }
     delay(DEBOUNCE_DELAY);                  // wait for the bouncing to settle...
     if (digitalRead(PIN_BUTTON) == HIGH) {  // ...already released again: just noise
       return false;
     }
     while (digitalRead(PIN_BUTTON) == LOW) {  // wait until the finger is lifted
       delay(1);
     }
     delay(DEBOUNCE_DELAY);  // the button also bounces when it is released
     return true;
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     pinMode(PIN_LED, OUTPUT);
     Serial.println("Press the button: the LED switches on/off.");
   }

   void loop() {
     if (buttonPressed()) {
       ledOn = !ledOn;  // flipped: true becomes false, false becomes true
       pressCount++;
       Serial.print("Press #");
       Serial.print(pressCount);
       if (ledOn) {
         digitalWrite(PIN_LED, HIGH);
         Serial.println(": LED ON");
       } else {
         digitalWrite(PIN_LED, LOW);
         Serial.println(": LED OFF");
       }
     }
   }
   ```

2. Click **Upload**, open the Serial Monitor, then press the button several times — slowly, quickly, or halfway.

   **Expected output:** one line for every press, and the LED switches every time — right when your finger is **lifted**, not when you press (remember Concept 6).

   ```text
   Press the button: the LED switches on/off.
   Press #1: LED ON
   Press #2: LED OFF
   Press #3: LED ON
   ```

The only new line here is **`ledOn = !ledOn;`**. The `!` sign (meaning "not", Module 3) flips a `bool` value: `true` becomes `false` and the other way around. That's the heart of a toggle (a switch that flips back and forth): one button that both switches something on and switches it off.

Still getting a press counted twice? Raise `DEBOUNCE_DELAY` to `50`. The button doesn't react at all? See 🚨.

> ⬆️ **Done with Practice 2?** Go back to [Concept 7](#7-pin-current-and-drivers-pins-give-commands-not-power) and read through Concept 8 (the ➡️ there will take you to Practice 3).

### Practice 3 — Dimming an LED with a potentiometer (15 minutes)

> 🖥️ **Tools and parts:** the **Arduino IDE** (or Wokwi), a 10 kΩ potentiometer, three jumper wires (black, orange, green). The D4 status LED from Practice 1. Concepts used: 8.

A **potentiometer** is a resistor with a turning knob. Its two outer legs go to 3.3 V and GND, while its middle leg puts out a voltage somewhere in between: 0 V when it's turned all the way to one side, 3.3 V when it's turned all the way to the other. The ESP32 reads that voltage with `analogRead()` as a number from `0` to `4095`. In Module 6, the same pin (VN) is used by the soil moisture sensor — this potentiometer is its "practice sensor".

#### 3.1 Install the potentiometer

First turn off the MB102 and unplug the USB. The potentiometer goes on the **lower breadboard**, near the 3.3 V rail.

> [!WARNING]
> **The potentiometer's legs go to the bottom rail (3.3 V), not the top rail (5 V).** Its middle leg can put out a voltage as high as its outer legs, and the VN pin can't handle 5 V.

| Part | Position | Purpose |
| :--- | :--- | :--- |
| 10 kΩ potentiometer | left leg **24h**, middle **26h**, right **28h** (lower); its body sits on the row f–g side, so rows i–j stay free | — |
| **Black** wire | **24j** → bottom rail **(−)** | left leg to GND |
| **Orange** wire | **28j** → bottom rail **(+)** | right leg to 3.3 V |
| **Green** wire | **26j** (lower) → **16f** (upper, above VN) | middle leg to VN (GPIO 39); 26j is in the same strip as the middle leg at 26h |

Are your potentiometer's legs spaced differently, or arranged in a triangle (a small trimmer potentiometer, often called a *trimpot*)? Use three different columns that fit. What matters is that the green wire is in the column of the **middle leg** and its other end is on VN. When you've finished building, plug the laptop USB back in (the MB102 doesn't need to be on yet).

![Illustration of the workbench after Practice 3: the potentiometer on the lower breadboard with its legs in 24h, 26h, and 28h; a black wire from 24j to the bottom rail minus; an orange wire from 28j to the bottom rail plus, 3.3 volts; a green wire from 26j on the lower breadboard crosses over the potentiometer, runs up along the right side of the ESP32 board, then turns left to 16f on the upper breadboard, right above the VN pin, without covering the VN, VP, and EN pin labels. The potentiometer's body covers rows f and g above its legs. The parts from Practices 1 and 2 are drawn faded](assets/workbench-3-potentiometer.png)

#### 3.2 Upload `module05_potentiometer_dimmer`

1. Wokwi: [`diagram.json`](code/module05_potentiometer_dimmer/diagram.json). While the simulation runs, **click the potentiometer**, then press **End** (all the way right), **Home** (all the way left), or the **←**/**→** arrows to turn it a little at a time. You can also drag its knob with the mouse.
2. Arduino IDE: create a new sketch **`module05_potentiometer_dimmer`** (file: [`module05_potentiometer_dimmer.ino`](code/module05_potentiometer_dimmer/module05_potentiometer_dimmer.ino)):

   ```cpp
   // Module 5 - Practice 3: dimming an LED with a potentiometer
   // Turn the potentiometer on VN (GPIO 39): the LED on D4 gets dimmer and brighter.
   // PWM uses ledcAttach + ledcWrite (the esp32 package version 3 way).

   const int PIN_POT = 39;          // VN: potentiometer (becomes the soil sensor in Module 6)
   const int PIN_LED = 4;           // status LED
   const int PWM_FREQUENCY = 5000;  // 5,000 blinks per second: too fast for the eye to see
   const int PWM_RESOLUTION = 8;    // 8 bits: brightness 0 (off) to 255 (full)

   void setup() {
     Serial.begin(115200);
     ledcAttach(PIN_LED, PWM_FREQUENCY, PWM_RESOLUTION);  // D4 becomes a PWM output (no pinMode needed)
   }

   void loop() {
     int turns = analogRead(PIN_POT);               // 0 (turned all the way left) to 4095 (all the way right)
     int brightness = map(turns, 0, 4095, 0, 255);  // convert to the 0-255 scale
     ledcWrite(PIN_LED, brightness);
     Serial.print("potentiometer = ");
     Serial.print(turns);
     Serial.print("   brightness = ");
     Serial.println(brightness);
     delay(200);
   }
   ```

3. Click **Upload**, open the Serial Monitor, then turn the potentiometer slowly from one end to the other.

   **Expected output:** the LED gets dimmer and brighter as you turn, and the numbers change along with it.

   ```text
   potentiometer = 0   brightness = 0
   potentiometer = 1025   brightness = 63
   potentiometer = 2050   brightness = 127
   potentiometer = 4095   brightness = 255
   ```

Three things to notice:

- **`analogRead`** doesn't need `pinMode` — the pin is read straight away as an analog input. On a real board, the number is rarely exactly `0` or `4095` and "wobbles" a little with every reading; that's normal. Module 6 covers why, and how to smooth it out.
- **`ledcAttach`** has already set up D4 for PWM, so `pinMode(PIN_LED, OUTPUT)` isn't needed.
- Turning it to the right makes the LED dimmer instead? Just swap the wires on the left and right legs (black ↔ orange) — or leave it; nothing gets damaged.

### Practice 4 — A buzzer plays tones (15 minutes)

> 🖥️ **Tools and parts:** the **Arduino IDE** (or Wokwi with the laptop's speakers on), a **passive** buzzer, a 220 Ω resistor, two jumper wires (blue and black). Concepts used: 7 and 8.

A **passive buzzer** only makes a sound when it's fed an electrical vibration, and its pitch follows the frequency of that vibration — perfect for PWM. (Its sibling, the **active buzzer**, has its own tone generator: just give it power and it goes "beeeep" with a single tone. The underside of a passive buzzer usually shows a green circuit board, while an active buzzer is sealed.)

#### 4.1 Install the buzzer

First turn off the MB102 and unplug the USB. The buzzer goes in the **top half of the upper breadboard**.

| Part | Position (upper breadboard) | Purpose |
| :--- | :--- | :--- |
| Passive buzzer | **(+)** leg in **27b**, **(−)** leg in **30b** | if its legs are spaced differently, use the nearest columns that fit |
| **Blue** wire | **9f** (above D27) → **27e** | PWM signal to the (+) leg |
| 220 Ω resistor | **30e** → **34e** | limits the current (Concept 7) |
| **Black** wire | **34a** → top rail **(−)** | the way home to GND |

The (+) leg is usually longer or marked "+" on the buzzer's body. For a passive buzzer, the direction doesn't matter much, but get into the habit of following the marking. When you've finished building, plug the laptop USB back in (the MB102 doesn't need to be on yet).

![Illustration of the workbench after Practice 4: a black passive buzzer in the top half of the upper breadboard with its plus leg in 27b and its minus leg in 30b; a blue wire from 9f above D27 to 27e; a 220 ohm resistor from 30e to 34e; a black wire from 34a to the top rail minus. The parts from Practices 1 to 3 are drawn faded](assets/workbench-4-buzzer.png)

#### 4.2 Upload `module05_buzzer_tones`

1. Wokwi: [`diagram.json`](code/module05_buzzer_tones/diagram.json); turn on your laptop's speakers.
2. Arduino IDE: create a new sketch **`module05_buzzer_tones`** (file: [`module05_buzzer_tones.ino`](code/module05_buzzer_tones/module05_buzzer_tones.ino)):

   ```cpp
   // Module 5 - Practice 4: a passive buzzer plays tones
   // Passive buzzer on D27 (through a 220 ohm resistor). Pitch = PWM frequency.

   const int PIN_BUZZER = 27;  // buzzer (canonical pin map)

   // Frequencies of the musical scale (Hz), 4th octave
   const int NOTE_C4 = 262;
   const int NOTE_D4 = 294;
   const int NOTE_E4 = 330;
   const int NOTE_F4 = 349;
   const int NOTE_G4 = 392;
   const int NOTE_A4 = 440;
   const int NOTE_B4 = 494;
   const int NOTE_C5 = 523;

   // "Twinkle Twinkle Little Star" (folk song, public domain): the notes and their lengths (in beats)
   const int MELODY[] = {NOTE_C4, NOTE_C4, NOTE_G4, NOTE_G4, NOTE_A4, NOTE_A4, NOTE_G4, NOTE_F4, NOTE_F4, NOTE_E4, NOTE_E4, NOTE_D4, NOTE_D4, NOTE_C4};
   const int BEATS[] = {1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2};
   const int NOTE_COUNT = 14;
   const int ONE_BEAT = 350;  // milliseconds

   // Plays one note for durationMs milliseconds, then stays silent for a moment.
   void playTone(int frequency, int durationMs) {
     ledcWriteTone(PIN_BUZZER, frequency);  // start sounding at this frequency
     delay(durationMs);
     ledcWriteTone(PIN_BUZZER, 0);          // frequency 0 = silence
     delay(50);                             // a short pause so two identical notes still sound separate
   }

   void setup() {
     Serial.begin(115200);
     ledcAttach(PIN_BUZZER, 1000, 10);  // set up PWM on D27; its frequency is changed for every note

     Serial.println("Scale: do re mi fa sol la ti do");
     int scale[] = {NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4, NOTE_G4, NOTE_A4, NOTE_B4, NOTE_C5};
     for (int i = 0; i < 8; i++) {
       playTone(scale[i], 300);
     }
     delay(500);

     Serial.println("Song: Twinkle Twinkle Little Star");
     for (int i = 0; i < NOTE_COUNT; i++) {
       playTone(MELODY[i], BEATS[i] * ONE_BEAT);
     }
     Serial.println("Done. Press the EN button on the board to hear it again.");
   }

   void loop() {
     // left empty on purpose: the song only needs to be played once, in setup()
   }
   ```

3. Click **Upload**. The buzzer plays the do-re-mi scale, then a bit of the song "Twinkle Twinkle Little Star". In Wokwi, click **↻** (restart the simulation) to hear it again.

   **Expected output** in the Serial Monitor:

   ```text
   Scale: do re mi fa sol la ti do
   Song: Twinkle Twinkle Little Star
   Done. Press the EN button on the board to hear it again.
   ```

You know every ingredient of this program from Module 3: constants, arrays (`MELODY` and `BEATS` go in pairs: the *i*-th note with the *i*-th beat count), the `for` loop, and your own function (`playTone`). The only new thing is **`ledcWriteTone`** (Concept 8). Too loud? Replace the 220 Ω resistor with a 1 kΩ one.

### Practice 5 — Servo 0–180° from the Serial Monitor (25 minutes)

> 🖥️ **Tools and parts:** the **Arduino IDE** with the **ESP32Servo 3.2.1** library (or Wokwi), an SG90 servo with its arms, a 100 µF electrolytic capacitor, three male–male jumper wires. The MB102 is turned on for testing in 5.3. Concepts used: 4, 7, and 8.

![Photo of an SG90 servo with a transparent blue body and four markers. 1, the black three-hole female connector at the end of the cable, connected with male–male jumper wires. 2, the servo's three wires: brown to GND, red to 5 volts from the MB102, and orange to the D26 signal pin. 3, the servo body, which holds the motor, the gears, and the angle sensor. 4, the white plastic arm that's fitted on the shaft and turns with it; its pointer line runs around the left side and the bottom of the servo](assets/photo-servo-sg90.jpg)

*Photo: Suyash Dwivedi, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tower_Pro_SG90_micro_servo_motor.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en); markers by the author. This marked-up image is also licensed CC BY-SA 4.0.*

A **servo** is a small motor that knows its own position: inside it are a motor, gears, and an angle sensor. We just send an "angle command" through the signal wire (Concept 8), and the circuit inside the servo does the hard work of turning the shaft. Its power comes from the MB102's 5 V rail, not from the ESP32.

#### 5.1 Install the ESP32Servo library

1. In the Arduino IDE, click the **Library Manager** icon in the left sidebar (the third icon, shaped like books), just as in Module 3 Practice 7.
2. Type **ESP32Servo** in the search box. Pick the entry **ESP32Servo by Kevin Harrington,John K. Bennett** — there are other libraries with similar names, for example **ServoESP32**.
3. Make sure the version menu shows **3.2.1** (pick it from the list if a newer version exists), then click **INSTALL**.
4. Wait until the entry says `3.2.1 installed`.

In Wokwi, you add a library through the **Library Manager** tab → the round **+** button → type **ESP32Servo** → click the result. A **`libraries.txt`** tab then appears by itself. Click that tab and change the line `ESP32Servo` to `ESP32Servo@3.2.1` (as in part B of Module 3 Practice 7). Once the **`libraries.txt`** tab exists, you can also replace its whole contents with the contents of the [`libraries.txt`](code/module05_servo_serial/libraries.txt) in this practice's folder.

#### 5.2 Connect the servo

First turn off the MB102 and unplug the USB. The servo cable ends in a **female** connector, so connect it with three male–male jumper wires.

> [!CAUTION]
> **An electrolytic capacitor must not go in the wrong way around.** The striped side of its body, marked "−", must go to GND. The wrong way around, the capacitor can bulge or pop.

| Servo wire | To | Purpose |
| :--- | :--- | :--- |
| **Brown** | top rail **(−)** | GND |
| **Red** | top rail **(+)** | 5 V from the MB102 |
| **Orange** | **10f** (upper, above D26) | angle signal |
| 100 µF capacitor | **long (+)** leg to the top rail (+), **short** leg (the side striped "−") to the top rail (−), at about column 16 | a "small reservoir" that absorbs current surges (Concept 4) |

Are your servo's wires black–red–white (or black–red–yellow)? Same pattern: **black** replaces brown (GND), and **white** or **yellow** replaces orange (signal). The jumper wires you connect them with can be any color; the orange in the table and the picture is the color of the servo's signal wire, not a 3.3 V marker.

Fit one of the servo arms (no screw needed) so its movement is easy to see. Don't turn that arm by hand while the servo is powered — its gears are plastic.

![Illustration of the workbench after Practice 5: the SG90 servo off the breadboard with three jumper wires: brown to the top rail minus, red to the top rail plus, orange to 10f above D26; a 100 microfarad electrolytic capacitor plugged into the top rail at column 16, its plus leg in the plus strip and its striped minus side facing the minus strip, with a red plus and a blue minus sign next to it. The parts from Practices 1 to 4 are drawn faded](assets/workbench-5-servo.png)

#### 5.3 Upload `module05_servo_serial`

1. Wokwi: [`diagram.json`](code/module05_servo_serial/diagram.json) and [`libraries.txt`](code/module05_servo_serial/libraries.txt). In that Wokwi diagram, the servo takes its power from the **VIN** pin, because Wokwi has no MB102 and doesn't count current. **Don't copy that on the real board**: on your workbench, the servo still gets its power from the MB102's top rail.
2. Arduino IDE: create a new sketch **`module05_servo_serial`** (file: [`module05_servo_serial.ino`](code/module05_servo_serial/module05_servo_serial.ino)):

   ```cpp
   // Module 5 - Practice 5: moving an SG90 servo from the Serial Monitor
   // Library: ESP32Servo version 3.2.1 (install it through the Library Manager).
   // Servo signal on D26; servo power from the MB102's 5 V rail (not from the ESP32 board).

   #include <ESP32Servo.h>

   const int PIN_SERVO = 26;  // curtain servo (canonical pin map)

   Servo curtain;  // one servo "object" that we name curtain

   void setup() {
     Serial.begin(115200);
     curtain.setPeriodHertz(50);            // a servo expects 50 pulses per second
     curtain.attach(PIN_SERVO, 500, 2400);  // a 0.5 ms pulse = 0 degrees ... 2.4 ms = 180 degrees
     curtain.write(90);                     // start in the middle
     Serial.println("Type an angle from 0 to 180, then press Enter.");
   }

   void loop() {
     if (Serial.available() > 0) {
       String text = Serial.readStringUntil('\n');  // take one typed line
       text.trim();                                 // throw away what's left of the Enter key
       int angle = text.toInt();                    // "120" becomes 120 (anything that isn't a number becomes 0)
       if (angle == 0 && text != "0") {             // it became 0, but what was typed isn't "0"?
         Serial.println("That's not a number. Type a number from 0 to 180.");
         return;                                    // ignore it; wait for the next typed line
       }
       angle = constrain(angle, 0, 180);            // keep it between 0 and 180
       curtain.write(angle);
       Serial.print("Servo to ");
       Serial.print(angle);
       Serial.println(" degrees");
     }
   }
   ```

3. Plug in the USB, turn on the MB102, then click **Upload**. The servo immediately turns to the middle (90°).
4. Open the Serial Monitor (the line-ending selector next to the baud selector must be on **New Line**, as in Module 3). Type `0` and press **Enter**; then `180`; then `45`. Also try `200` and `hello`.

   **Expected output:**

   ```text
   Type an angle from 0 to 180, then press Enter.
   Servo to 0 degrees
   Servo to 180 degrees
   Servo to 45 degrees
   Servo to 180 degrees
   That's not a number. Type a number from 0 to 180.
   ```

   `constrain` fences in the `200` you typed to 180, while `hello` is rejected. Which way the arm moves for 0° and 180° depends on how the arm is fitted and on the servo's brand; what matters is that they're the two ends of its movement.

What's new in this sketch:

- **`#include <ESP32Servo.h>`** brings in the library, and **`Servo curtain;`** creates one servo "object" named `curtain`. If you have two servos, create two objects.
- **`curtain.attach(PIN_SERVO, 500, 2400)`** tells the library the signal pin and the pulse widths for 0° and 180° (in microseconds: 500 µs = 0.5 ms). **`curtain.write(angle)`** moves the servo.
- **The "not a number" check**: `toInt()` (Module 3) turns text that isn't a number into `0`. So if the result is 0 but what was typed isn't `"0"`, the input can't have been a number. The `return;` statement ends this pass of `loop()` early; the next `loop()` waits for new input.

Does the servo buzz or shake at 0° or 180°? Many SG90s can't reach exactly 180°, so the shaft presses against its mechanical stop. See 🚨.

> ⬆️ **Done with Practice 5?** Go back to [Concept 9](#9-relays-switches-moved-by-a-magnet) and read through Concept 10 (the ➡️ at the end of Concept 10 will take you to Practice 6).

### Practice 6 — Relay: a button turns on a fan powered by the MB102 (30 minutes)

> 🖥️ **Tools and parts:** the **Arduino IDE** (or Wokwi), the 2-channel relay module, the 5 V fan, four 20 cm **male–female** jumper wires (plus two spares for the JD-VCC fix in 🚨, if needed), two male–male jumper wires (a red one for COM, and a spare for the 6.3 test), and a small flat-head screwdriver for the screw terminals. The button from Practice 2. Concepts used: 4, 6, 7, and 9.
>
> ⭐ **Required** — the first of the three requirements to pass: one button turns a relay on and off without bouncing. The fan is also half of the second requirement.

#### 6.1 Get to know your relay module

Look at the module (the picture in Concept 9):

- At one end there's a row of pins: **GND**, **IN1**, **IN2**, **VCC**. The order can differ between manufacturers — **read the labels on your board**.
- Near them are three pins labeled **GND**, **VCC**, **JD-VCC**, with a **jumper** connecting VCC and JD-VCC. Leave it in place.
- At the other end, each relay has **NO**, **COM**, **NC** screw terminals. No labels? The **middle** terminal is almost always COM. Make sure with the multimeter's continuity (beep) mode (or **Ω 200**, Module 2) while the module has no power: COM–NC are connected (it beeps or the number is close to 0), while COM–NO aren't.
- We call the relay controlled by IN1 **relay 1** (the lamp relay), and the one controlled by IN2 **relay 2** (the fan relay). They're usually labeled **K1** and **K2**; if in doubt, just watch which relay clicks during the test in 6.3.

Have a **1-channel** module? Its pins are just **GND**, **IN**, **VCC** (sometimes labeled **DC−**, **IN**, **DC+**). Connect IN to D33, and skip everything that mentions IN1.

#### 6.2 Connect the control side

First turn off the MB102 and unplug the USB. Put the relay module on the table, behind the upper breadboard (beyond its top edge) — don't stack it on the breadboard. Plug the **female** ends of the jumper wires onto the module's pins and the **male** ends into the breadboard. In the workbench picture, the row of pins is drawn along the module's bottom edge so the wires run straight. Your module's layout may differ (compare it with the picture in Concept 9); follow the labels on its pins. Crossed wires are fine.

| Relay module pin | To | Purpose |
| :--- | :--- | :--- |
| **GND** | top rail **(−)** | shared GND |
| **IN1** | **13f** (upper, above D32) | lamp relay |
| **IN2** | **12f** (upper, above D33) | fan relay |
| **VCC** | top rail **(+)** | 5 V for the module and the relay coils |

#### 6.3 The 3.3 V test, without code

This step answers the important question from Concept 9: does your relay module **release** when it gets the ESP32's "HIGH", which is only 3.3 V?

This is the only test where you move a wire while the power is on. Hold the plastic part and move **only** the end of the IN2 wire, exactly into the hole that's named.

1. Pull the male end of the **IN2** wire out of 12f for a moment, then try stretching it to the bottom rail; a 20 cm male–female wire usually reaches. Too short? While the power is still off, first add a male–male wire from **40d** (lower breadboard) to the **bottom rail (+)**. In step 4, you then just plug the IN2 end into **40c**.
2. Plug in the laptop USB (so the bottom rail carries 3.3 V), then turn on the MB102.
3. Plug the male end of the IN2 wire into a **top rail (−)** hole. Relay 2 goes "click" and its indicator LED lights up — proof that your module is active LOW.
4. Move that end to a **bottom rail (+)** hole (or to **40c** if you're using the extension wire), which carries 3.3 V. The relay must **release** (it clicks again) and its indicator LED must **go out**. If it does, your module is a good match for the ESP32. 🎉

   The relay stays pulled in, or its LED stays dimly lit? Your module is one of those that won't release at 3.3 V. Don't go on yet; fix it as described in 🚨.
5. Turn off the MB102 and unplug the USB first, **then** put the end of the IN2 wire back into **12f**.

#### 6.4 Connect the fan through relay 2

The relay is only a **switch**; the fan's power still comes from the 5 V top rail.

| From | To | How |
| :--- | :--- | :--- |
| **Red** male–male jumper wire: top rail **(+)** | relay 2's **COM** terminal | loosen the COM screw, insert the wire's male end, tighten |
| The fan's **red (+)** wire | relay 2's **NO** terminal | the same |
| The fan's **black (−)** wire | top rail **(−)** | straight into a breadboard hole |

The thin ends of the fan's wires are usually already tinned and go straight into a screw terminal or a breadboard hole. If your fan's wires end in a plug, connect them with male–male jumper wires. Make sure the blades can spin freely and don't face any other wires.

![Illustration of the workbench after Practice 6: the 2-channel relay module placed behind the upper breadboard, with the row of VCC, IN2, IN1, and GND pins along its bottom edge. All four run straight down with male–female wires: VCC in red to the top rail plus, IN2 in purple to 12f above D33, IN1 in pink to 13f above D32, and GND in black to the top rail minus; next to them, the GND, VCC, JD-VCC pins with the JD-VCC jumper in place. A red wire from the top rail plus to relay 2's COM terminal, the fan's red wire to relay 2's NO terminal, and the fan's black wire to the top rail minus. The parts from Practices 1 to 5 are drawn faded](assets/workbench-6-relay.png)

#### 6.5 Upload `module05_fan_relay`

1. Wokwi: [`diagram.json`](code/module05_fan_relay/diagram.json). Wokwi has no fan, so the fan is represented by an LED labeled **fan**. The Wokwi relay module here is set to active LOW, like your real module. In that diagram, the relay module takes its power from the **VIN** pin and the fan LED from 3V3 without a resistor, because Wokwi has no MB102 and its simulated LEDs can't be damaged. **Don't copy that on the real board**: on your workbench, the relay and the fan still get their power from the MB102's top rail, and an LED always uses a resistor.
2. Arduino IDE: create a new sketch **`module05_fan_relay`** (file: [`module05_fan_relay.ino`](code/module05_fan_relay/module05_fan_relay.ino)):

   ```cpp
   // Module 5 - Practice 6: a button turns a fan on and off through a relay
   // Fan relay on D33 (IN2 of the 2-channel relay module, active LOW). Button on D13.
   // The fan gets 5 V from the MB102 through the relay's COM-NO contacts.

   const int PIN_BUTTON = 13;      // manual button (canonical pin map)
   const int PIN_FAN_RELAY = 33;   // fan relay (canonical pin map)
   const int DEBOUNCE_DELAY = 30;  // milliseconds

   bool fanOn = false;

   // Returns true ONCE for every real press (same as Practice 2.2).
   bool buttonPressed() {
     if (digitalRead(PIN_BUTTON) == HIGH) {
       return false;
     }
     delay(DEBOUNCE_DELAY);
     if (digitalRead(PIN_BUTTON) == HIGH) {
       return false;
     }
     while (digitalRead(PIN_BUTTON) == LOW) {
       delay(1);
     }
     delay(DEBOUNCE_DELAY);
     return true;
   }

   // Our relay module is "active LOW": LOW = the relay connects (fan runs), HIGH = the relay releases.
   void setFan(bool isOn) {
     if (isOn) {
       digitalWrite(PIN_FAN_RELAY, LOW);
     } else {
       digitalWrite(PIN_FAN_RELAY, HIGH);
     }
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     pinMode(PIN_FAN_RELAY, OUTPUT);
     setFan(false);  // make sure the fan is off right away
     Serial.println("Press the button to turn the fan on or off.");
   }

   void loop() {
     if (buttonPressed()) {
       fanOn = !fanOn;
       setFan(fanOn);
       if (fanOn) {
         Serial.println("Fan ON");
       } else {
         Serial.println("Fan OFF");
       }
     }
   }
   ```

3. Plug in the USB, turn on the MB102, then click **Upload**. Open the Serial Monitor and press the button.

   **Expected output:** every press makes the relay click and switches the fan on or off — when your finger is lifted, just like the LED in Practice 2.2.

   ```text
   Press the button to turn the fan on or off.
   Fan ON
   Fan OFF
   Fan ON
   ```

4. **Pass test:** press the button **10 times** in different ways — fast, slow, halfway. Count the lines in the Serial Monitor: there must be exactly **10**, and the fan must switch exactly 10 times without "skipping". ✅ The first requirement to pass is met.

Right after an upload finishes, or when the **EN** button is pressed, the relay may click. If the fan was on, that's the sound of the relay **releasing**: while the ESP32 restarts, pin D33 puts out nothing, and an active-LOW relay releases whenever its IN pin isn't pulled to `LOW` (the fail-safe behavior, Concept 9).

So why does `setFan(false)` have to be called **right** after `pinMode` in `setup()`? Because `pinMode(PIN_FAN_RELAY, OUTPUT)` immediately makes that pin `LOW`, and for an active-LOW relay, `LOW` means **pull in**. The next line quickly changes it to `HIGH`, so the relay doesn't get the chance to switch on the fan. Calling `digitalWrite` **before** `pinMode` doesn't help: in esp32 package version 3, that command is ignored as long as the pin hasn't been set up as an output.

### Practice 7 — Running the pump for 3 seconds through a MOSFET (30 minutes)

> 🖥️ **Tools and parts:** the **Arduino IDE** (or Wokwi), an **IRLZ44N** MOSFET (or a D4184 module), 220 Ω and 10 kΩ resistors, a **1N4007** diode, a 5 V mini pump + tubing, two glasses (one with water), a container or tray, and three male–male jumper wires (white, black, red). The button from Practice 2. Concepts used: 7 and 10.
>
> ⭐ **Required** — part of the second requirement to pass: the pump runs from the MB102.

#### 7.1 Prepare the pump and the water

1. Put both glasses on the tray, on the side of the table **far from the adapter, the wall outlet, and the laptop**, as far as the pump's cable allows. Water and electricity must not meet. Pump cable too short? Extend it with jumper wires — don't move the glasses closer.
2. Fit the tubing onto the pump's outlet, then put the other end of the tubing into the second glass (or back into the same glass, so the water goes round).
3. Dip the pump into the glass of water until its **whole body is under water**. A mini pump must not run dry for more than a few seconds — it's cooled by the water it pumps.

#### 7.2 Wire up the MOSFET

First turn off the MB102 and unplug the USB. Every part goes in the **top half of the upper breadboard**. Hold the MOSFET with **the printed text facing you**: left leg G, middle D, right S (Concept 10).

| Part | Position (upper breadboard) | Purpose |
| :--- | :--- | :--- |
| IRLZ44N MOSFET | **G 42b**, **D 43b**, **S 44b**; text facing you | the pump's switch |
| **White** wire | **11f** (above D25) → **38e** | the command from D25 |
| 220 Ω resistor | **38d** → **42d** | gate resistor |
| 10 kΩ resistor | **34c** → **38c** | pull-down to GND: column 34 has been connected to GND since Practice 4 |
| **Black** wire | **44d** → top rail **(−)** | S to GND; it starts in front of the MOSFET, away from the metal tab on its back |
| **Red** wire | top rail **(+)** → **48a** | column 48 becomes a 5 V strip |
| 1N4007 diode | **43e** → **48e**, silver ring at **48e** | flyback diode |
| Pump | **red (+)** wire → **48c**; **black (−)** wire → **43d** | — |

A mini pump's wires are usually thin and stranded. Twist the metal ends tightly with your fingers, then push them in deep. If they still won't go in or keep coming out, wrap the end tightly around the metal pin of a male–male jumper wire, cover it with tape, then plug in the jumper wire.

Haven't done Practice 4? First add the black wire **34a** → top rail (−), so column 34 is connected to GND.

![Illustration of the workbench after Practice 7, with the older parts drawn faded. In the top half of the upper breadboard: the IRLZ44N MOSFET standing upright with its G leg in 42b, D in 43b, and S in 44b; a white wire from 11f above D25 to 38e; a 220 ohm resistor from 38d to 42d; a 10 kiloohm resistor from 34c to 38c; a black wire from 44d to the right, then up along the right side of the MOSFET to the top rail minus, away from its metal tab; a red wire from the top rail plus to 48a; a 1N4007 diode from 43e to 48e with its silver ring at 48e. The pump in a glass of water on a tray, behind the breadboard, with the note: place it as far as possible from the adapter and the laptop (not to scale). The pump's red wire goes to 48c, and its black wire comes down along the column 43 strip to 43d. The letters G, D, S are written below the MOSFET's legs. A box of notes below the picture repeats those hole positions](assets/workbench-7-pump.png)

Before powering anything, check the three things that most often end up the wrong way around: **the order of the MOSFET's legs** (text facing you), **the diode's silver ring** in column 48 (the 5 V side), and the pump's **red wire** in column 48 — not its black wire.

Have a **D4184 module** instead of an IRLZ44N? That module already holds the MOSFET and its resistors. How to connect it:

- The input terminals (usually **VIN+**/**VIN−** or **DC+**/**DC−**) to the top rail (+) and (−).
- The output terminals (**OUT+**/**OUT−**) to the pump's red and black wires.
- The signal pin (**TRIG**, **PWM**, or **SIG**) to **11f** (D25), and its **GND** pin to the top rail (−).
- The 1N4007 diode still goes in. Clamp its legs together with the pump wires in the same screw terminals: the leg with the silver ring together with the red wire in **OUT+**, the other leg together with the black wire in **OUT−**.

#### 7.3 Upload `module05_mosfet_pump`

1. Wokwi: [`diagram.json`](code/module05_mosfet_pump/diagram.json). Wokwi has no MOSFET and no pump, so the pump is represented by an LED labeled **pump**, straight on D25. Only the code can be tested there.
2. Arduino IDE: create a new sketch **`module05_mosfet_pump`** (file: [`module05_mosfet_pump.ino`](code/module05_mosfet_pump/module05_mosfet_pump.ino)):

   ```cpp
   // Module 5 - Practice 7: the pump runs for 3 seconds through an IRLZ44N MOSFET
   // MOSFET gate (G) on D25 through a 220 ohm resistor; a 10 kiloohm resistor from the gate line to GND.
   // The pump gets 5 V from the MB102. A 1N4007 diode in parallel with the pump, silver ring on the 5 V side.

   const int PIN_BUTTON = 13;      // manual button (canonical pin map)
   const int PIN_PUMP = 25;        // pump MOSFET gate (canonical pin map)
   const int DEBOUNCE_DELAY = 30;  // milliseconds
   const int PUMP_TIME = 3000;     // milliseconds: the pump runs for 3 seconds

   // Returns true ONCE for every real press (same as Practice 2.2).
   bool buttonPressed() {
     if (digitalRead(PIN_BUTTON) == HIGH) {
       return false;
     }
     delay(DEBOUNCE_DELAY);
     if (digitalRead(PIN_BUTTON) == HIGH) {
       return false;
     }
     while (digitalRead(PIN_BUTTON) == LOW) {
       delay(1);
     }
     delay(DEBOUNCE_DELAY);
     return true;
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     pinMode(PIN_PUMP, OUTPUT);
     digitalWrite(PIN_PUMP, LOW);  // LOW = the MOSFET disconnects = the pump stays still
     Serial.println("Press the button: the pump runs for 3 seconds.");
   }

   void loop() {
     if (buttonPressed()) {
       Serial.println("Pump running...");
       digitalWrite(PIN_PUMP, HIGH);  // HIGH = the MOSFET connects = the pump runs
       delay(PUMP_TIME);
       digitalWrite(PIN_PUMP, LOW);
       Serial.println("Pump stopped.");
     }
   }
   ```

3. Plug in the USB, turn on the MB102, then click **Upload**. Press the button; the pump starts when your finger is lifted.

   **Expected output:** the pump hums and moves water for 3 seconds, then stops.

   ```text
   Press the button: the pump runs for 3 seconds.
   Pump running...
   Pump stopped.
   ```

4. After a few tries, touch the MOSFET's body with a fingertip. **Cool or slightly warm** means it's right. Hot? Turn off the MB102 right away, then check the diode's direction and the MOSFET type (🚨).

Does the pump not turn at all, or does it start running the moment the MB102 is turned on? See 🚨. The fan from Practice 6 still works; only its code hasn't been combined yet — everything comes together in Node 1 (➕).

### Practice 8 — The brownout experiment: wrong on purpose, then fixed (20 minutes)

> 🖥️ **Tools and parts:** the **Arduino IDE**, the Practice 6 build (relay + fan), and one extra red male–male jumper wire. Concepts used: 4. This practice can't be tried in Wokwi, because Wokwi doesn't simulate voltage drops.
>
> ⭐ **Required** — completes the second requirement to pass: the fan and the pump run from the MB102 **without the ESP32 restarting**.

We're going to break the golden rules of Concept 4 **on purpose, in a controlled way**: the fan is fed from the laptop's USB through the VIN pin, so you'll recognize the symptoms of a brownout if it ever happens by accident. After that, we put things back the right way and prove that the ESP32 no longer restarts.

#### 8.1 Upload `module05_restart_detective` (the right way first)

1. Make sure the Practice 6 build is complete, the laptop USB is plugged in, and the MB102 is on (golden rule number 5: USB first, then the MB102).
2. In the Arduino IDE, create a new sketch **`module05_restart_detective`** (file: [`module05_restart_detective.ino`](code/module05_restart_detective/module05_restart_detective.ino)):

   ```cpp
   // Module 5 - Practice 8: a "restart detective" for testing the power supply
   // When it starts, this sketch prints the REASON for the last restart, using the same words
   // as the reset_reason field in Syllabus Appendix A: POWERON, BROWNOUT, SW, PANIC,
   // WDT, DEEPSLEEP, or UNKNOWN.
   // After that, the fan relay (D33) turns on and off in turn every 3 seconds.

   #include <esp_system.h>  // for esp_reset_reason()

   const int PIN_LED = 4;         // status LED
   const int PIN_FAN_RELAY = 33;  // fan relay, active LOW
   const int PAUSE_MS = 3000;     // milliseconds

   int cycle = 0;  // counted again from 0 every time the ESP32 restarts

   // Turns the restart reason code into a word that is easy to read.
   String resetReasonName() {
     esp_reset_reason_t reason = esp_reset_reason();
     if (reason == ESP_RST_POWERON) {
       return "POWERON";  // just powered on, EN button pressed, or a program has finished uploading
     }
     if (reason == ESP_RST_BROWNOUT) {
       return "BROWNOUT";  // the voltage briefly dropped too low
     }
     if (reason == ESP_RST_SW) {
       return "SW";  // the program itself asked for a restart
     }
     if (reason == ESP_RST_PANIC) {
       return "PANIC";  // the program crashed
     }
     if (reason == ESP_RST_INT_WDT || reason == ESP_RST_TASK_WDT || reason == ESP_RST_WDT) {
       return "WDT";  // a "watchdog" restarted a stuck program (Module 8)
     }
     if (reason == ESP_RST_DEEPSLEEP) {
       return "DEEPSLEEP";  // woke up from deep sleep (Module 9)
     }
     return "UNKNOWN";  // some other reason that rarely happens
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED, OUTPUT);
     pinMode(PIN_FAN_RELAY, OUTPUT);
     digitalWrite(PIN_FAN_RELAY, HIGH);  // the relay releases: the fan starts out off

     String reason = resetReasonName();
     Serial.println();
     Serial.println("Last restart reason: " + reason);
     if (reason == "BROWNOUT") {
       Serial.println(">> The voltage dropped for a moment! Move the loads (fan, pump, servo) to the MB102.");
     }
   }

   void loop() {
     cycle++;
     if (cycle % 2 == 1) {
       digitalWrite(PIN_FAN_RELAY, LOW);  // the fan runs
       digitalWrite(PIN_LED, HIGH);
       Serial.print("Cycle ");
       Serial.print(cycle);
       Serial.println(": fan ON");
     } else {
       digitalWrite(PIN_FAN_RELAY, HIGH);  // the fan stops
       digitalWrite(PIN_LED, LOW);
       Serial.print("Cycle ");
       Serial.print(cycle);
       Serial.println(": fan OFF");
     }
     delay(PAUSE_MS);
   }
   ```

3. Click **Upload** and open the Serial Monitor. The fan turns on and off in turn every 3 seconds.

   **Expected output** — the cycle number keeps going up:

   ```text
   Last restart reason: POWERON
   Cycle 1: fan ON
   Cycle 2: fan OFF
   Cycle 3: fan ON
   ```

What's new here: **`esp_reset_reason()`** from `esp_system.h` asks the chip **why** it last restarted. The `resetReasonName()` function turns the answer into the same word as the `reset_reason` field in Syllabus Appendix A; reasons that rarely happen get the answer `UNKNOWN`. The `+` sign in the line `Serial.println("Last restart reason: " + reason);` joins two pieces of text into one, just like in the Module 3 Morse sketch. The `%` operator (remainder, Module 3) makes odd cycles switch the fan on and even cycles switch it off.

#### 8.2 Wrong on purpose: the fan powered from the laptop's USB

1. **Turn off the MB102 first, then unplug the laptop USB** (golden rule number 5). Unplug the adapter cable from the MB102, then **pull the MB102 out of the breadboard**. That way, the top rail no longer gets power from the MB102.
2. For now, also remove the **100 µF capacitor** (that "small reservoir" can hide the symptoms), the **servo's red wire** from the top rail (+), and the **red 48a wire** (the pump's 5 V strip; D4184 module users: the module's DC+/VIN+ wire). This experiment only needs the relay and the fan. **Don't add the pump or the servo** to the laptop's USB port.
3. Connect a **red wire** from **4f** (**upper** breadboard, right above the **VIN** pin) to the **top rail (+)**. Check once more before powering up:
   - The first end is in **4f** — not 5f (GND), and not 4e on the lower breadboard (3V3).
   - The second end is in the strip labeled **5V**, not in the (−) strip right next to it.

   As soon as the USB is plugged in, the relay and the fan get their power from the laptop's USB through the VIN pin — exactly the mistake golden rule number 1 forbids.
4. Plug the laptop USB back in and open the Serial Monitor. The detective sketch starts running right away; watch it for one minute. Missed its opening lines? Press the **EN** button on the board.

   **What may happen** (depending on how strong your laptop's USB port is): every time the fan starts turning, the ESP32 restarts. The Serial Monitor shows a line containing `Brownout detector was triggered` (usually starting with the label `E BOD:`), followed by a few lines of boot messages (`ets …`, `rst:…`, and so on), and then your sketch starts over. Roughly like this; the line in parentheses is only a summary, not the exact text:

   ```text
   Cycle 1: fan ON
   E BOD: Brownout detector was triggered
   (a few lines of boot messages)
   Last restart reason: BROWNOUT
   >> The voltage dropped for a moment! Move the loads (fan, pump, servo) to the MB102.
   Cycle 1: fan ON
   ```

   The cycle count keeps going back to **1**: the ESP32 never makes it to cycle 2.

   **No restart?** Your laptop's USB port is strong enough for this small fan — lucky, but don't count on it. Prove that the voltage still drops with the multimeter on **V⎓ 20**: plug spare wires into the **top rail (+)**, which is now connected to VIN, and into the top rail (−), then touch the red and black probes to them. Compare the numbers while the fan is still and while it spins: it usually drops by a few tenths of a volt, and it's already lower than the roughly 5 V you wrote down in Practice 1.6. If VIN drops far enough, the board's voltage regulator can no longer hold 3.3 V, and the brownout detector trips.

   Does Windows show a `Power surge on the USB port` notification? Unplug the USB and go straight to 8.3; your laptop is protecting its port.

#### 8.3 Fix it, then prove it

1. Unplug the laptop USB. **Remove the red wire at 4f** — that wire must not stay.
2. Put the MB102 back at the right end of the upper breadboard with the same jumpers (top-rail side **5V**, middle-rail side **OFF**). Also put the 100 µF capacitor, the servo's red wire, and the red 48a wire (or the D4184 module's DC+/VIN+ wire) back where they were. Make sure the adapter is plugged into the wall outlet and reconnect the A–A cable to the MB102's USB port, but **don't turn on the MB102 yet**. If your MB102's button doesn't cut the USB path, only plug the A–A cable into the MB102 in step 3.
3. Plug in the laptop USB first, **then** turn on the MB102 or plug in its A–A cable (golden rule number 5), then press **EN**. The Serial Monitor once again shows `Last restart reason: POWERON`, and the cycle count keeps climbing.
4. **Pass test, the fan part:** let it run for **2 minutes**. If the cycle number reaches 40 without ever going back to 1, the fan runs from the MB102 without making the ESP32 restart.
5. **Pass test, the pump part:** make sure the pump is under water. Open the `module05_mosfet_pump` sketch again, click **Upload**, then open the Serial Monitor. Press the button **5 times**, one at a time. Every press must produce the pair `Pump running...` and then `Pump stopped.`. If boot messages or the opening line `Press the button: the pump runs for 3 seconds.` show up in between, the ESP32 restarted; see 🚨. ✅ If all five presses pass, the second requirement to pass is met.

> [!CAUTION]
> **Don't "cure" a brownout by turning off the detector.** The internet is full of advice to switch off the brownout detector in code. That's like pulling out a smoke alarm because it's noisy: the problem doesn't go away, and the ESP32 can actually run haywire or corrupt its memory. The right cure is always the same: **separate the loads' power path** and **join the GNDs**.

### Practice 9 — Save to GitHub (15 minutes)

> 🖥️ **Tools used:** the **Arduino IDE**, a phone camera, and **GitHub Desktop** (from Module 3). Concepts used: no new concepts.

1. **Save the sketches to the repository.** Already saved them straight into the `module-05` folder from the start (the **Tip** box at the start of the Practice section)? Skip this step. If not, open the sketches one by one in the Arduino IDE (**File → Sketchbook**). For each sketch, choose **File → Save As…** and save it into the folder **Documents → GitHub → learn-iot → module-05**. When you save the first sketch, first create the `module-05` folder with **New folder**, exactly as in Module 3 Practice 9.4. The full list is at the start of the Practice section. The required ones: `module05_toggle_button`, `module05_fan_relay`, `module05_mosfet_pump`, and `module05_restart_detective`.
2. **Photograph your build.**
   1. Take one photo of the workbench from above with your phone: both breadboards, the ESP32 board, the MB102, the relay, the fan, and the pump must be visible. Make sure no personal items end up in the picture.
   2. Move the photo to your laptop (with a data cable, a sharing app, or by emailing it to yourself), then rename it **`workbench.jpg`**.
   3. Copy that photo into the `module-05` folder. In GitHub Desktop, **Repository → Show in Explorer** (macOS: **Show in Finder**) opens the right repository folder.
   4. Compare your photo with the complete workbench picture below (click the picture to enlarge it). Your wires can be different colors as long as the holes are the same.

   ![Illustration of the complete Node 1 workbench after Practices 1 to 7, seen from above, every part in full color: two breadboards with the ESP32 board riding across both, the MB102 at the right end of the upper breadboard with its adapter, the status LED and the potentiometer on the lower breadboard, the button, the buzzer, and the MOSFET circuit on the upper breadboard, and the servo, the relay module with the fan, and the pump in a glass of water off the breadboard, each with its wires to the holes named in the practices](assets/workbench-node-1.png)
3. In GitHub Desktop, make sure the **Current repository** box says **learn-iot**. The **Changes** tab lists the new files in `module-05`: one `.ino` file for each sketch, plus `workbench.jpg`. macOS users: untick `.DS_Store` if it shows up.
4. Fill in **Summary** with `Module 5: button, PWM, relay, pump, and brownout test`, click **Commit … to main**, then **Push origin**.
5. Click **Repository → View on GitHub** and open the `module-05` folder: your sketches and your photo are there.

No GitHub Desktop? Use the alternative route in the note at the end of [Module 4 Practice 10](../../phase-0-foundations/module-04-javascript-nodejs/README.md#practice-10--save-to-github-the-phase-0-checkpoint-15-minutes): upload the whole `module-05` folder with **Add file → Upload files** on the repository page, or use `git add`, `git commit`, and `git push` in the Terminal.

> ➡️ **After Practice 9:** do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home) — where all the actuators come together in Node 1 and `PIN-MAP.md` is created — then finish with the [📝 Quiz](#-5-question-quiz) and the [✅ Completion checklist](#-module-5-completion-checklist). Open the 🚨 and 🔬 sections in between only when you need them.

---

## 🚨 Troubleshooting

This week the problem is more often in the **wires and the power** than in the code. Before you take anything apart, remember two habits: **turn off the MB102 and unplug the USB before changing wires**, and **change only one thing, then test again**. **Stuck right now? Skip the table below** — the list of symptoms (the collapsible titles you can click) comes right after it. This table sums up things you'll often see in other tutorials that are different in this curriculum.

| What you often see in other tutorials | What's right for this curriculum | Why |
| :--- | :--- | :--- |
| `ledcSetup(0, 5000, 8);` + `ledcAttachPin(4, 0);` + `ledcWrite(0, 128);` | `ledcAttach(4, 5000, 8);` + `ledcWrite(4, 128);` | The esp32 package version 2 way. In version 3, PWM is set up **per pin**, not per channel; the two old functions have been removed. |
| `ledcWriteTone(0, 440);` (channel number) | `ledcWriteTone(PIN_BUZZER, 440);` (pin number) | Same thing: version 3 uses pin numbers. |
| `#include <Servo.h>` | `#include <ESP32Servo.h>` | Arduino's Servo library doesn't run on the ESP32 with our esp32 package. |
| Adding a 10 kΩ resistor for every button | `INPUT_PULLUP` | The ESP32 already has internal pull-up resistors — except on pins 34–39. |
| `analogWrite(pin, value);` | `ledcAttach` + `ledcWrite` | `analogWrite` does exist in version 3, but it quietly picks a frequency of 1,000 Hz and takes a PWM channel of its own. With `ledcAttach`, everything is out in the open. |
| An **IRF520** MOSFET module "for Arduino" | **IRLZ44N** or a **D4184** module | The IRF520 only opens fully at around 10 V; with 3.3 V, the pump is weak or doesn't move. |
| "Turn off the brownout detector so the ESP32 doesn't restart" | Separate the loads' power supply, join the GNDs | Turning off the detector only hides the problem (Practice 8). |
| Powering a servo, relay, or motor from the board's 5V/VIN pin | Always from the MB102 | The laptop's USB port only gives about 500 mA; a motor's current surge makes the ESP32 restart. |

<details>
<summary><b><code>Build failed!</code> / <code>Compilation error</code> — this week's error messages</b></summary>

The rule is the same as in Module 3: **look at the line number**, fix only the **first error**, then compile again.

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `'ledcSetup' was not declared in this scope` | The code uses the esp32 package version 2 way of doing PWM. | Replace it with `ledcAttach(pin, frequency, resolution)`; see the table above. |
| `'ledcAttachPin' was not declared in this scope; did you mean 'ledcAttach'?` | Same. | Delete `ledcAttachPin`; `ledcAttach` alone is enough. Also replace the channel number in `ledcWrite` with the pin number. |
| `fatal error: ESP32Servo.h: No such file or directory` | The ESP32Servo library isn't installed. | Follow Practice 5.1. In Wokwi: check the **`libraries.txt`** tab. |
| `fatal error: Servo.h: No such file or directory`, or a long error from inside the `Servo` folder | The code uses Arduino's Servo library. | Replace `#include <Servo.h>` with `#include <ESP32Servo.h>`. In Wokwi, **don't** click the **INSTALL "SERVO" LIBRARY** button it offers. |
| `'Servo' does not name a type` | The `#include <ESP32Servo.h>` line is missing or misspelled. | Add it at the very top. |

</details>

<details>
<summary><b>The breadboard's rail strip won't come off, or the ESP32 doesn't fit across two breadboards</b></summary>

- **Is the strip molded into the breadboard's body** (no joint at all)? Some breadboards really are made in one piece. The easiest option: buy another 830-point breadboard whose strips come off (how to tell: there's a joint line between the rail strip and the breadboard's body); it costs IDR 15,000–30,000. Another option: a **30-pin ESP32 expansion board**, which is on the Module 28 kit list anyway; the ESP32 board plugs into that board, and then each pin is connected to the breadboard with a male–female wire.
- **The strip is off, but the pins never fit on any row?** Slide the lower breadboard away **a tiny bit at a time** (more than 1 mm per step is too much), trying again each time. Also make sure the two left ends are lined up: column 4 at the top must be exactly in line with column 4 at the bottom.
- **Only one free hole left on one side?** That still works, as long as row f (upper) and row e (lower) are free.
- **Are your ESP32's pin rows 0.9 inch apart** (the narrow version of the board, see Module 2)? It usually fits on row i at the top and row a at the bottom, or row j at the top and row b at the bottom. The fitting principle is the same.

</details>

<details>
<summary><b>Top rail: the multimeter shows a negative number, zero, or something other than 5 V</b></summary>

- **Negative** (for example `-5.02`) even though the red probe is on the red-lined strip: the MB102 puts its (+) on your breadboard's **blue**-lined strip. This happens because the order of the red and blue lines isn't the same across breadboard manufacturers. You don't need to move the MB102:
  1. Turn off the MB102. Stick on new tape labels: write **5V** on the strip that proved to be (+) and **GND** on the other strip. From now on, follow those labels, not the line colors, every time this module says "top rail (+)" or "(−)".
  2. **Move the end of the black 5f wire** to the strip you just labeled **GND**. That wire used to go into the blue-lined strip, which turned out to be 5 V.
  3. Repeat Practice 1.6 from step 2. Step 5 (the shared-GND test) must show about 5 V.
- **Zero**, and the MB102's LED is off: the adapter isn't plugged into the wall outlet, one end of the USB A–A cable isn't fully in (one end to the adapter, one to the MB102's USB port), or the MB102's power button hasn't been pressed. The A–A cable could also be a data-only cable without proper power lines; try another cable.
- **Zero**, and the MB102's LED is on: the rail is split in the middle (add bridging wires, Practice 1.6), or the MB102's pins aren't fully pushed into the rail.
- **About 3.3 V**: the top-rail-side jumper is in the **3.3V** position. Move it to **5V**.
- **About 3.5 V or less**: the adapter comes in through the **barrel jack** (which needs 6.5–12 V), not through the USB port. Use a USB A–A cable into the MB102's USB port.
- **Below 4.7 V while a load is running**: the adapter is too weak (less than 2 A) or the A–A cable is too long/thin. Try another charger head marked "5V 2A".

</details>

<details>
<summary><b>The ESP32 turns on by itself even though its USB is unplugged</b> (dangerous — read right away)</summary>

If the ESP32 board's red LED lights up just because the MB102 was turned on, **power from the top rail is leaking into the ESP32**. Turn off the MB102 right now, then check:

- **The power on/off order.** If the MB102 is on while the laptop USB is unplugged, 5 V from the relay module's VCC pin can leak through the optocoupler lights, the IN1/IN2 wires, and pins D32/D33 into the ESP32. The board's LED glows dimly, and the relays may pull in by themselves. Your wiring isn't wrong; just follow golden rule number 5: USB first, then the MB102 — and turn off the MB102 first, then unplug the USB.
- A wire connecting the top rail (+) to column **4** at the top (VIN) or column **4** at the bottom (3V3) — for example the red wire from Practice 8 that you forgot to remove.
- A 5 V wire going into the column of any GPIO pin. GPIO pins have small protection parts inside that end up "powering" the chip from the wrong direction — and that can damage it.
- The MB102's middle-rail-side jumper turns out to be in the **5V** position while there are wires in the middle rail.

Golden rules number 4 and 5 in Concept 4 exist to prevent this.

</details>

<details>
<summary><b>The upload fails, or the board keeps restarting after a new build</b></summary>

- **Is something on D12** (column 7 at the top)? Remove it. GPIO 12 pulled HIGH at power-up makes the board fail to boot (Concept 2).
- **The upload gets stuck at `Connecting…`** even though it worked before? Hold **BOOT** as soon as `Connecting…` appears, and let go when `Writing at …` starts moving. If it still fails, temporarily remove any wire on D2 (column 7 at the bottom) — this week it should be empty anyway.
- **The board restarts every time the fan, pump, or servo starts moving** — `Brownout detector was triggered`: some load is still taking power from the board. Check the wires in column 4 at the top (VIN), then redo Practice 8.3. Also make sure the MB102's adapter really is 2 A and the 100 µF capacitor is in place.
- **The board restarts right after the pump stops**: the flyback diode isn't installed (Practice 7.2), so the voltage spike from the pump causes trouble.

</details>

<details>
<summary><b>The button doesn't react, the program freezes, or the count runs by itself</b></summary>

- **No reaction at all** (the opening line appears, but pressing the button does nothing): the yellow wire must be in **6f** (upper), right above D13 — not 7f (D12). Make sure the button really straddles the center channel, all four of its legs are in, and the black 24a wire goes into the top rail (−).
- **The program seems frozen** (nothing else happens after the opening line; on Node 1, Serial commands get no reply either): pin D13 reads as **pressed all the time**, so `buttonPressed()` waits forever for the finger to be "lifted". The cause: both wires are connected to **a pair of legs that are permanently connected** inside the button. Use the **diagonally opposite** legs (22f and 24e), or turn the button 90°. How to make sure: upload the Practice 2.1 sketch. If `Press #1` shows up right away without anyone touching the button, pin D13 really does read as pressed all the time.
- **The count runs by itself without being touched:** pin D13 is floating. Make sure the code uses `INPUT_PULLUP`, not `INPUT` (Concept 5).
- **Is the button on pins 34–39?** Those pins have no internal pull-up; move it to D13, as in the canonical pin map.
- **Sometimes still counted twice:** raise `DEBOUNCE_DELAY` to `50`.

</details>

<details>
<summary><b>Potentiometer: the number is stuck, jumps around, or runs backward</b></summary>

- **Always `0` or always `4095`:** the green wire is plugged into the column of an **outer** leg (24 or 28), not the column of the middle leg (26).
- **The number is random even when nobody touches it:** the end of the green wire isn't on VN, or the outer legs aren't connected to the bottom rail (+) and (−) yet. Remember, VN is GPIO **39**, in column **16** at the top (the order of the top row of pins: VIN, GND, D13, D12, D14, D27, D26, D25, D33, D32, D35, D34, VN, VP, EN).
- **Hits about `4095` before the knob is turned all the way:** normal on the ESP32, because its ADC isn't linear near the ends (Module 6).
- **Backward** (turning right makes it dimmer): swap the wires on the left and right legs.

</details>

<details>
<summary><b>The buzzer is silent, very quiet, or only makes a flat "beeeep"</b></summary>

- **Silent:** check the blue wire **9f** (above D27) → **27e**, the resistor **30e → 34e**, and the black wire **34a** to the top rail (−). In Wokwi, make sure the browser's sound isn't muted.
- **Only one long "beeeep" at the same pitch**, and no tune: that's an **active buzzer**. An active buzzer has its own tone generator, so it can't play a tune. Replace it with a passive buzzer (its underside is usually open and shows a green circuit board).
- **Very quiet:** the resistor may be 10 kΩ (brown-black-orange), not 220 Ω (red-red-brown). Check it with the multimeter (Module 2).
- **The servo stops moving after the buzzer is added** to the same sketch: they're attached in the wrong order. Attach the servo first (`attach`), then `ledcAttach` the buzzer (🔬).

</details>

<details>
<summary><b>The servo doesn't move, shakes, or buzzes</b></summary>

- **Doesn't move at all:** is the MB102 on? Is the servo's red wire in the top rail (+), the brown (or black) one in the top rail (−), and the orange one in **10f** (upper, above D26)? Is the ESP32Servo library installed, and does the Serial Monitor print `Servo to …`?
- **Buzzes or shakes at 0° or 180°:** many SG90s can't do exactly 0–180°, so the shaft presses against its mechanical stop. Limit the angle, for example `constrain(angle, 10, 170)`, or adjust the pulse numbers in `attach`, for example `attach(PIN_SERVO, 600, 2300)`. Don't let the servo buzz for long; its motor can get hot.
- **Jerks around for a moment when the ESP32 restarts:** normal — while the ESP32 is starting up (booting), its signal pin isn't sending pulses yet.
- **Keeps shaking and the ESP32 sometimes restarts:** the 100 µF capacitor isn't installed, or the servo is still powered from the board.

</details>

<details>
<summary><b>The relay doesn't click, won't release, or the fan doesn't spin</b></summary>

- **The relay doesn't click at all:** is the MB102 on? Are the relay module's VCC and GND on the top rail? Is the IN2 wire in **12f** (D33) and IN1 in **13f** (D32)? Remember, the module's pin order differs between manufacturers — read the labels.
- **The relay's indicator LED lights up, but there's no "click":** the **JD-VCC** jumper has come off, so the relay coils get no power.
- **The relay won't release at 3.3 V** (the 6.3 test failed): your module needs a small change. Turn off the MB102 and unplug the USB first, then:
  1. Pull off the **JD-VCC** jumper and keep it. Make sure it's really off: if the jumper is still in place, steps 2 and 3 would connect the MB102's 5 V to the ESP32's 3V3 pin and could damage it. Check with the multimeter's continuity (beep) mode: the VCC and JD-VCC pins must not be connected.
  2. Move the wire from the **VCC** pin in the IN row to the **bottom rail (+)** (3.3 V from the ESP32). Wire too short? Plug its end into a free hole in column 40 of the lower breadboard (for example 40b), which is connected to the bottom rail (+) through the extension wire from 6.3 step 1.
  3. With the two spare male–female wires, connect the **JD-VCC** pin to the **top rail (+)** (5 V from the MB102) and the **GND** pin next to JD-VCC to the **top rail (−)**. The GND pin in the IN row stays on the top rail (−).

  Now the tiny lights in the optocouplers run on 3.3 V, while the relay coils still get 5 V. Repeat the 6.3 test. Still failing? Replace it with a relay module that really can be triggered by 3.3 V, for example a module with an **H/L** selector jumper (*high/low level trigger*) or one marked "3.3V".
- **The relay clicks, but the fan stays still:** the 5 V wire must be in **COM** and the fan's red wire in **NO** — not NC. Also check that the terminal screws are tightened on the metal part of the wire, not on its insulation. A DC fan has a direction: red (+), black (−).
- **The fan starts the moment the MB102 is turned on, and stops when the relay is active:** the fan wire is in **NC**. Move it to **NO**.

</details>

<details>
<summary><b>The pump doesn't turn, runs nonstop, or the MOSFET gets hot</b></summary>

Always **turn off the MB102 first**, then check one thing at a time:

- **The pump doesn't turn:** the order of the MOSFET's legs — with the text facing you, left G (42b), middle D (43b), right S (44b). The white wire comes from **11f** (D25), not 10f (D26) or 12f (D33). Make sure your MOSFET says **IRLZ44N**, not IRF520 or IRFZ44N without the letter L. A MOSFET mounted backward (text facing away) also keeps the pump still: its G leg lands in column 44, which is connected to GND. A pump that hasn't been used for a while sometimes sticks; dip it in water, then try again.
- **The pump runs nonstop as soon as the MB102 is turned on:** the pump's black wire isn't in 43d (for example it's in column 44 or straight on GND), the MOSFET's metal tab (= D) is touching a GND wire, or the MOSFET has failed with a short between D and S. That kind of damage often happens if the pump was ever switched on without a diode or with the diode backward; a damaged MOSFET has to be replaced.
- **The MOSFET or the diode gets hot:** almost certainly a **backward diode** — its silver ring must be at **48e** (the 5 V side). A backward diode connects 5 V to GND through the MOSFET every time the pump is told to run. The diode is right, but the MOSFET still gets hot? Check its markings: an IRF520 or IRFZ44N (without the letter L) only opens halfway at 3.3 V, so it heats up.
- **The pump runs briefly when the ESP32 restarts:** the 10 kΩ resistor (34c–38c) isn't installed, or column 34 isn't connected to GND yet (the black 34a wire).
- **The MOSFET's metal tab is touching another wire:** the tab on the back of the IRLZ44N is connected to the D leg. Keep it away from wires and other parts' legs; that's why its GND wire is connected at 44d, in front of the MOSFET.

</details>

<details>
<summary><b>Wokwi: the relay works the wrong way around, or the parts aren't the same as your kit</b></summary>

- **The relay works backward** (pulls in when the pin is HIGH): in a `diagram.json` you made yourself, the Wokwi relay module is active HIGH by default. The `diagram.json` files in the [`code/`](code/) folder already use `"transistor": "pnp"` so it's active LOW, like your real module.
- **The small LED labeled LED1 on the Wokwi relay module lights up the wrong way around:** on a Wokwi module set to active LOW, that LED actually lights up when the relay releases. Just ignore it; go by the LEDs labeled **lamp** and **fan** in the diagram. On your real relay module, the indicator LED lights up when the relay pulls in.
- **No fan, pump, or MOSFET in Wokwi:** they really aren't available. In every `diagram.json` of this module, the fan and the pump are represented by **labeled LEDs**. Wokwi also doesn't simulate load current or brownouts, so Practices 1 and 8 only work on the real board.
- **In the Wokwi diagrams, the servo and the relay modules take their power from the VIN pin**, and the "lamp"/"fan" LEDs from 3V3 without a resistor: that's only a simulator shortcut, because Wokwi has no MB102, doesn't count current, and its LEDs can't be damaged. **Don't copy that on the real board** — on your workbench, every load still runs from the MB102's top rail (golden rule number 1), and an LED always uses a resistor.
- **The Wokwi button bounces**, even with a clean mouse click: that's on purpose (the `bounce` attribute), so Practice 2.1 feels real.

</details>

---

## 🔬 Technical Deep Dive (optional)

This section is for anyone curious about what happens "behind the scenes". You can skip it without missing anything for the next modules. Click a title to open it.

<details>
<summary><b>The built-in touch sensor: the ESP32 can feel your finger without a button</b></summary>

Ten of the ESP32's GPIOs can act as a **capacitive touch sensor**: the chip measures how much electrical charge "sticks" to the pin, and your body adds to that charge when you touch it. The touch pins are GPIO 4, 0, 2, 15, 13, 12, 14, 27, 33, and 32 (named T0–T9).

**Try it (on the real board only; Wokwi doesn't simulate touch):** GPIO 14 (D14) isn't used by the DHT22 until Module 6, so it's still free this week. Plug one male–male jumper wire into **8f** (upper, above D14), leave its other end free, then upload:

```cpp
// Module 5 bonus: touch sensor on GPIO 14 (T6)
void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println(touchRead(14));  // the number DROPS when you touch the end of the wire
  delay(200);
}
```

Open the Serial Monitor (or choose **Tools → Serial Plotter** to see it as a graph), then hold the metal end of that wire. The number drops a lot, for example from a few dozen down to the teens; the exact numbers differ for every board and wire. With `if (touchRead(14) < threshold)`, that wire becomes a button with no moving parts. Pull the wire out again before Module 6.
</details>

<details>
<summary><b>DAC: a real analog voltage, not PWM blinking</b></summary>

PWM only **pretends** to be analog: the pin still blinks between 0 and 3.3 V, and your eyes (or a multimeter) do the averaging. The classic ESP32 has two **DACs** (*Digital-to-Analog Converters*) on **GPIO 25** and **GPIO 26** that put out a **steady** voltage between 0 and about 3.3 V, in 256 steps (8 bits).

Those two pins happen to be used by our pump and servo. To try it, **first remove the white wire at 11f** (D25 to the MOSFET), plug a spare wire into 11f as a place for the probe, then upload:

```cpp
// Module 5 bonus: DAC on GPIO 25 - measure it with a multimeter (V⎓ 20)
void setup() {
  Serial.begin(115200);
}

void loop() {
  for (int value = 0; value <= 255; value += 85) {  // 0, 85, 170, 255
    dacWrite(25, value);
    Serial.print("dacWrite 25 = ");
    Serial.println(value);
    delay(3000);
  }
}
```

The multimeter (black probe on the bottom rail (−)) shows roughly 0 V, 1.1 V, 2.2 V, and 3.2 V in turn. Put the white wire back when you're done.

An interesting comparison: measure D4 while the Practice 3 dimmer sketch is running. The multimeter also shows an "in-between" number (for example about 1.6 V at brightness 127), because the multimeter averages the PWM blinking too. The difference: a DAC pin really does sit still at that voltage.

The ESP32's newer siblings (S3, C3, C6) **have no DAC** — one of the reasons this curriculum sticks with the classic ESP32.
</details>

<details>
<summary><b>NPN transistors: a cheap driver for small loads</b></summary>

Before MOSFETs became popular, small loads were usually driven by an **NPN bipolar transistor** such as the BC547, 2N2222, or S8050. It's wired much like a low-side MOSFET: the load from 5 V to the *collector* leg, the *emitter* leg to GND, and the ESP32 pin to the *base* leg through a resistor of about 1 kΩ.

How it differs from a MOSFET:

- An NPN transistor is driven by **current** (the ESP32 pin has to keep supplying about 2–3 mA to the base), while a MOSFET is driven by **voltage** (with almost no current).
- When it's on, an NPN transistor still "eats" about 0.2–0.7 V and gets warm. A logic-level MOSFET is much more efficient for currents of hundreds of mA.
- A BC547 can only handle about 100 mA; an S8050 or 2N2222 around 500–800 mA.

Your relay module actually already contains an NPN transistor that drives the relay coil. For the pump, the IRLZ44N is still the best choice.
</details>

<details>
<summary><b>Measuring load current with a multimeter</b></summary>

To measure **current**, the multimeter has to be connected **in series**, becoming part of the path the current flows through — not touched to both ends, as when you measure voltage.

1. Turn off the MB102, then unplug the USB. Move the red probe to the multimeter's **10A** jack (the black probe stays in COM), then turn the dial to **A⎓ 10** (sometimes labeled **10A**). In Module 2, the 10A jack was off-limits because we were measuring voltage; for measuring **current**, this is the jack to use, under the rules below.
2. Pull the fan's **black (−) wire** out of the top rail. Touch the red probe to the end of that fan wire, and the black probe to a spare wire in the top rail (−). Now the fan's current flows **through** the multimeter.
3. Plug in the USB, then turn on the MB102 and run the fan (the Practice 6 sketch). The multimeter shows its current, for example `0.12` = 0.12 A = 120 mA. Try the pump too (with the pump under water): with the same on/off order, pull the pump's black wire out of 43d, then touch the red probe to the end of that wire and the black probe to a spare wire plugged into 43d.
4. When you're done, **put the red probe back in the VΩmA jack**. Forgetting this step is the fastest way to ruin a multimeter: in the 10A jack, touching the probes to two points with a voltage between them is the same as a short circuit.

> [!WARNING]
> **Never** touch a multimeter in current mode straight across the (+) and (−) rails — that's a short circuit that can blow the multimeter's fuse or damage the MB102. Always start from the largest range (10A). Cheap multimeters (DT-830B) often have no fuse on the 10A jack, so only measure for a short time.

Your measurements prove Concept 4 with numbers: the fan and the pump each draw hundreds of mA — far above a pin's safe limit (about 12 mA) and a big chunk of the laptop USB port's allowance (about 500 mA).
</details>

<details>
<summary><b>Strapping pins up close: what the chip reads when it powers up</b></summary>

Right when the ESP32 powers up or is reset, the chip "takes a snapshot" of the levels of a few pins, then uses the result to decide how to start:

| GPIO | Default at power-up | What it decides |
| :--- | :--- | :--- |
| **0** | pulled up | `HIGH` = run the program; `LOW` = download mode (that's what the **BOOT** button is for) |
| **2** | pulled down | must be `LOW` or floating to enter download mode |
| **5** | pulled up | SDIO interface timing |
| **12** (MTDI) | pulled down | **flash memory voltage**: `LOW` = 3.3 V, `HIGH` = 1.8 V |
| **15** (MTDO) | pulled up | `LOW` = ROM boot messages aren't printed; also SDIO timing |

The ESP-WROOM-32 module on our board uses 3.3 V flash memory. If GPIO 12 is pulled `HIGH` at power-up — for example by a sensor module that has its own pull-up resistor — the chip gives that memory 1.8 V, so the board fails to boot and keeps restarting. There is a way to lock that voltage permanently with an *eFuse* (a one-time fuse inside the chip), but that step can't be undone. For beginners, the rule "**don't connect anything to D12**" is much safer.

Once the chip has started, these pins become ordinary GPIOs. That's why GPIO 2, 5, and 15 can still be used as outputs, as long as the circuit doesn't force a particular level right when the board powers up.
</details>

<details>
<summary><b>Why the PIR and ECHO are on 34/35, not 36/39</b></summary>

Espressif's *ESP32 Series SoC Errata* (a list of the chip's "built-in flaws") records a quirk of GPIO 36 and 39. Every time certain parts of the chip are switched on — including the analog-to-digital converter (ADC), which Wi-Fi also uses — the input of those two pins is briefly **pulled low for about 80 nanoseconds**. For analog readings, a glitch that short isn't noticeable. But for digital inputs that use an ***interrupt*** (the feature that "wakes up" the program the moment a pin changes), that glitch can be read as a false change: the PIR seems to see motion, or the distance sensor times the echo wrong.

Espressif's workaround: don't use interrupts on GPIO 36 and 39. That's why the canonical pin map puts the **analog sensors** (the LDR and the soil sensor) on 36 and 39, and the **digital sensors** (the PIR and ECHO) on 34 and 35 — all of them still on ADC1 and all "input only".
</details>

<details>
<summary><b>Behind ESP32Servo: why the servo must be attached before the buzzer</b></summary>

The ESP32 has 16 PWM (LEDC) channels. The esp32 package's `ledcAttach` function picks the first free channel and writes it down in the esp32 package's own "notebook". The ESP32Servo library has **a notebook of its own**, and always starts at channel 0 without looking at the esp32 package's notes.

- **The wrong order** (buzzer first): the buzzer's `ledcAttach` takes channel 0. ESP32Servo then asks for channel 0 too. The esp32 package only writes an info message saying channel 0 is already in use — a message you don't see in the Serial Monitor with the default settings — and then the servo pin **hitches a ride** on the buzzer's channel, which runs at 2,000 Hz. The servo receives a signal it doesn't understand and just sits still. We tested this order in Wokwi: `write(0)` and `write(180)` were sent in turn, but the servo didn't move at all.
- **The right order** (servo first): the servo's channel 0 is already recorded in the esp32 package, so the buzzer's `ledcAttach` gets channel 1. Both work.

The rule: **attach all servos first, then the other `ledcAttach` calls.** That's what the comment in Node 1's `setupPins()` is about. The same goes for `analogWrite()`, which quietly calls `ledcAttach` with a frequency of 1,000 Hz and a resolution of 8 bits.
</details>

<details>
<summary><b>Debounce with a capacitor, without code</b></summary>

Bouncing can also be tamed in hardware. Put a **100 nF ceramic capacitor** (from the kit, marked "104") in parallel with the button: one leg in **22g** (in the same strip as the end of the yellow wire at 22h, so it's connected to D13) and the other in **24d** (in the same strip as the black 24a wire, so it's connected to GND). Bend its legs so it crosses the center channel. Together with the internal pull-up resistor of about 45 kΩ, that capacitor forms a "damper". The pin's voltage now changes slowly, over a few milliseconds, so the quick bounces don't get read.

Try it with the Practice 2.1 sketch (no software debounce): the count becomes much cleaner. In the real world, both are often used together.
</details>

<details>
<summary><b>The brownout detector up close</b></summary>

- Its voltage limit can be chosen from eight levels, roughly **2.43–2.80 V**; the esp32 package for Arduino already sets it when the package is built.
- When it trips, ESP-IDF code (the foundation underneath the esp32 package) records the restart reason as `BROWNOUT`, prints the message `Brownout detector was triggered` with the tag `BOD` (it usually shows up as `E BOD: …`), then restarts the chip through software. That's why the `rst:` line from the ROM may mention a software restart, while `esp_reset_reason()` still answers `BROWNOUT` — the real reason was recorded before the restart.
- The detector can be turned off, but never do it (see Practice 8). Later, in Module 28, the restart reason is also sent to the server as `reset_reason`, so a brownout that happens quietly at home still gets noticed.
</details>

---

## 🧩 Independent Challenges

Three levels, starting with the easiest. Do at least Level 1. They all use the build that's already on your workbench.

> 🖥️ **Tools:** the **Arduino IDE** and the Node 1 build. Want to try it in Wokwi first? Level 1 has its own diagram with a potentiometer and a servo: [`diagram.json`](code/wokwi-curtain-knob/diagram.json) and [`libraries.txt`](code/wokwi-curtain-knob/libraries.txt). Levels 2 and 3 use the [Node 1 `diagram.json`](code/node-1-home/diagram.json); there, the LED labeled **lamp** stands in for the Level 3 lamp (without a resistor in Wokwi; on your workbench, still use a 220 Ω resistor as in the Level 3 table).

**Level 1 — A small change: the curtain knob.** Combine Practices 3 and 5: turning the potentiometer sets the servo's angle, like a real curtain knob. Hints:

- Open `module05_servo_serial`, then **right away** choose **File → Save As…** and name it `module05_curtain_knob` before you change anything, so the Practice 5 sketch isn't overwritten. After that, delete the contents of `loop()`.
- In `loop()`: read `analogRead(39)`, change its scale with `map(…, 0, 4095, 0, 180)`, then send it to `curtain.write(…)`. Print the angle, then add a `delay(50)` pause.
- You've done it when the servo follows the potentiometer smoothly. The servo jitters even though the knob is still? Analog readings do wobble a little; Module 6 covers how to smooth them out.

**Level 2 — Combine: Morse with sound.** Open the Morse sketch from Module 3 (`module03_morse_name`; can't find it? copy it from [`module03_morse_name.ino`](../../phase-0-foundations/module-03-cpp-for-esp32/code/module03_morse_name/module03_morse_name.ino)) and save it under a new name, `module05_morse_sound`. Make the buzzer sound along with the LED, then turn the D13 button into a "repeat" button. Hints:

- Add the constants `const int PIN_BUZZER = 27;`, `const int PIN_BUTTON = 13;`, and `const int DEBOUNCE_DELAY = 30;`. In `setup()`, add `pinMode(PIN_BUTTON, INPUT_PULLUP);` and `ledcAttach(PIN_BUZZER, 800, 10);`.
- In the `blink()` function, call `ledcWriteTone(PIN_BUZZER, 800)` right after the LED is turned on, then call `ledcWriteTone(PIN_BUZZER, 0)` right after the LED is turned off.
- Move the `for` loop that sends the letters out of `loop()` into a new function, `void sendName(String name)`. Keep the last name in a `String` variable outside the functions. In `loop()`, call `sendName(…)` every time a new name comes in from the Serial Monitor. When `buttonPressed()` (copy it from Practice 2.2) answers `true`, call it again with the last name.

**Level 3 — Design it yourself: an LED lamp and four button modes.** Give relay 1 a "lamp": an ordinary LED with a 220 Ω resistor, powered with 5 V from the top rail — **not** a 220 V bulb (remember the CAUTION in Concept 9). Then make one button cycle through four modes: all off → lamp → fan → lamp and fan → back to all off.

**The lamp circuit.** Turn off the MB102 and unplug the USB first, then build this on the upper breadboard:

| Part | From | To |
| :--- | :--- | :--- |
| **Red** male–male wire | top rail **(+)** | **relay 1's COM** terminal |
| Male–male wire | **relay 1's NO** terminal | **16a** |
| 220 Ω resistor | **16c** | **20c** |
| White or yellow LED | **long** leg in **20e** | **short** leg in **21e** |
| **Black** wire | **21a** | top rail **(−)** |

Work out that LED's current yourself with Ohm's law (Module 2): is it safe for the LED?

- **Code:** keep the mode number in an `int` variable. Every press adds 1, and `% 4` (remainder) brings it back to 0 after 3. Set both relays according to the mode, print the mode's name, and play a short "beep" (2,000 Hz, 100 ms) as a sign that the press was received.
- **Remember the order** if your sketch has a servo: `attach` the servo first, then `ledcAttach` the buzzer.

---

## ➕ Add-on to "Mini Smart Home"

Module 5's contribution to the running project: **all of Node 1's "hands" are connected to their fixed pins**, and **`PIN-MAP.md`** becomes an official project document. Starting this week, the shelves in the Node 1 skeleton are no longer copied whole: you **fill them in yourself** from the pieces of code you've already written in the Practices. The complete reference version is in [`mini-smart-home/firmware/node-1-home/`](../../mini-smart-home/firmware/node-1-home/node-1-home.ino) — compare it with yours if you get stuck.

> 🖥️ **Tools used:** the **Arduino IDE** (with the ESP32Servo library from Practice 5), **VS Code**, **GitHub Desktop**, and the complete build from Practices 1–7. No board? Every step can be tested in Wokwi with Node 1's [`diagram.json`](code/node-1-home/diagram.json) and [`libraries.txt`](code/node-1-home/libraries.txt). In that diagram, the servo and the relays take their power from the VIN pin, and the lamp/fan LEDs light up without a resistor — don't copy that on the real board (🚨, the Wokwi section).

### A. Create `PIN-MAP.md`

1. In VS Code, open your project repository folder (**File → Open Folder…** → **Documents → GitHub → mini-smart-home**).
2. Click the empty space below the list of files in the Explorer panel (so the new file goes into the main folder), then click the **New File…** icon and name it `PIN-MAP.md`.
3. Open the reference version of [`PIN-MAP.md`](../../mini-smart-home/PIN-MAP.md) in a new tab, click **Copy raw file**, then paste it into your new file. It contains the Node 1 and Node 2 pin map tables from Concept 3, the pins to avoid, how the power rails on the workbench are shared, and the golden power rules. This pin map really is **the same for every** learner, so you may copy it whole.
4. Save it (**Ctrl + S**, or let Auto Save do its work).

### B. Fill in Node 1's shelves to reach v0.2.0

Open **`node-1-home.ino`** in the Arduino IDE: **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home**. Make the following changes from top to bottom. After each step, click **Verify** (✓) so typos show up right away.

**Step 1 — The very top: comments, library, version, and pin map.** Replace every line from the first line through the line `const int PIN_STATUS_LED = 4; …` — that is, the opening comment block and the first two constants — with the block below. **Leave** the line `const unsigned long READ_INTERVAL = 2000;` for now: the old `loop()` still uses it until Step 6.

```cpp
// Node 1 "Home" - firmware v0.2.0 (updated in Module 5)
// The running project: Mini Smart Home.
//
// New in v0.2.0: all Node 1 actuators are connected to the canonical pins (see PIN-MAP.md):
// lamp relay, fan relay, pump (through a MOSFET), curtain servo, buzzer, and manual button.
// The manual button turns the lamp on/off. You can try the other actuators from the
// Serial Monitor, for example: lamp on, fan off, pump 3, curtain 90, beep, status.
// The sensors are still sample numbers; Modules 6-7 replace them with real readings.
//
// Library: ESP32Servo version 3.2.1.

#include <ESP32Servo.h>
#include <esp_system.h>  // esp_reset_reason()

const String FIRMWARE_VERSION = "0.2.0";

// ---------- Node 1 canonical pin map (copied from PIN-MAP.md) ----------
const int PIN_STATUS_LED = 4;      // Module 2
const int PIN_BUTTON = 13;         // Module 5, INPUT_PULLUP
const int PIN_LAMP_RELAY = 32;     // Module 5, active-LOW relay
const int PIN_FAN_RELAY = 33;      // Module 5, active-LOW relay
const int PIN_PUMP = 25;           // Module 5, IRLZ44N MOSFET gate
const int PIN_CURTAIN_SERVO = 26;  // Module 5, SG90 servo
const int PIN_BUZZER = 27;         // Module 5, passive buzzer
// Reserved for later modules (don't use them for anything else):
// Module 6: DHT22 = 14, LDR = 36 (VP), soil = 39 (VN), PIR = 34, HC-SR04 TRIG = 15, ECHO = 35
// Module 7: I2C SDA = 21, SCL = 22; microSD SCK = 18, MISO = 19, MOSI = 23, CS = 5
// Module 15: RS-485 RX = 16, TX = 17, DE/RE = 2

const int DEBOUNCE_DELAY = 30;     // milliseconds, for debouncing the button
const int LOOP_DELAY = 10;         // loop() repeats about every 10 milliseconds
const int LOOPS_PER_REPORT = 200;  // 200 x 10 ms = about 2 seconds
```

**Step 2 — Node 1's memory.** Right **below** `struct SensorReading { … };`, add:

```cpp
// Current actuator states (sent later in the "ack", Appendix A)
bool lampOn = false;
bool fanOn = false;
int curtainAngle = 90;

Servo curtainServo;
int loopCount = 0;
```

**Step 3 — The "hands" functions.** Find the label line `// ---------- Module 5: set up all the pins ----------` (the label of the `setupPins()` shelf). Right **above** that label line, first add the new label `// ---------- Module 5: last restart reason (same names as Appendix A) ----------` and the `resetReasonName()` function — copied whole from the Practice 8 sketch — then the functions below. `setFan` is the same as in Practice 6, plus one line that remembers its state; `setLamp` is its twin for relay 1.

```cpp
// ---------- Module 5: actuators ----------
void setLamp(bool isOn) {
  lampOn = isOn;
  if (isOn) {
    digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
  } else {
    digitalWrite(PIN_LAMP_RELAY, HIGH);
  }
}

void setFan(bool isOn) {
  fanOn = isOn;
  if (isOn) {
    digitalWrite(PIN_FAN_RELAY, LOW);
  } else {
    digitalWrite(PIN_FAN_RELAY, HIGH);
  }
}

void runPump(int seconds) {
  seconds = constrain(seconds, 1, 10);  // safety limit: 1-10 seconds
  digitalWrite(PIN_PUMP, HIGH);
  delay(seconds * 1000);  // blocks for now; Module 8 makes it work without delay()
  digitalWrite(PIN_PUMP, LOW);
}

void setCurtain(int angle) {
  curtainAngle = constrain(angle, 0, 180);
  curtainServo.write(curtainAngle);
}

void soundBuzzer() {
  ledcWriteTone(PIN_BUZZER, 2000);  // 2,000 Hz
  delay(150);
  ledcWriteTone(PIN_BUZZER, 0);
}
```

**Step 4 — Fill in the `setupPins()` shelf.** Replace the **whole** `setupPins()` function — from the line `void setupPins() {` to its closing curly brace `}` — with:

```cpp
void setupPins() {
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  pinMode(PIN_LAMP_RELAY, OUTPUT);
  pinMode(PIN_FAN_RELAY, OUTPUT);
  setLamp(false);  // switch off right away: pinMode(OUTPUT) has just made the pin LOW (= relay pulls in)
  setFan(false);

  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);

  // The servo is attached BEFORE the buzzer: this order keeps the two from fighting over a PWM channel.
  curtainServo.setPeriodHertz(50);
  curtainServo.attach(PIN_CURTAIN_SERVO, 500, 2400);
  setCurtain(curtainAngle);

  ledcAttach(PIN_BUZZER, 2000, 10);
}
```

**Step 5 — The button and commands from the Serial Monitor.** Right **below** the closing curly brace of `setupPins()`, add the label `// ---------- Module 5: manual button with debounce ----------` and the `buttonPressed()` function — copied whole from Practice 2.2 — then these four functions:

```cpp
String onOffText(bool isOn) {
  if (isOn) {
    return "on";
  }
  return "off";
}

void printStatus() {
  Serial.print("status: lamp=");
  Serial.print(onOffText(lampOn));
  Serial.print(" fan=");
  Serial.print(onOffText(fanOn));
  Serial.print(" curtain=");
  Serial.println(curtainAngle);
}

// Returns true if the text is NOT a number: toInt() gives 0, but the text isn't "0" (as in Practice 5).
bool notANumber(String text) {
  return text.toInt() == 0 && text != "0";
}

// ---------- Module 5: commands from the Serial Monitor (Module 11 replaces them with MQTT) ----------
void checkSerialCommand() {
  if (Serial.available() == 0) {
    return;
  }
  String command = Serial.readStringUntil('\n');
  command.trim();
  command.toLowerCase();

  if (command == "lamp on") {
    setLamp(true);
  } else if (command == "lamp off") {
    setLamp(false);
  } else if (command == "fan on") {
    setFan(true);
  } else if (command == "fan off") {
    setFan(false);
  } else if (command.startsWith("pump ")) {
    String number = command.substring(5);  // the text after "pump "
    if (notANumber(number)) {
      Serial.println("Need a number of seconds. Example: pump 3");
      return;
    }
    Serial.println("pump running...");
    runPump(number.toInt());
  } else if (command.startsWith("curtain ")) {
    String number = command.substring(8);  // the text after "curtain "
    if (notANumber(number)) {
      Serial.println("Need a number of degrees. Example: curtain 90");
      return;
    }
    setCurtain(number.toInt());
  } else if (command == "beep") {
    soundBuzzer();
  } else if (command != "status") {
    Serial.println("Unknown command. Examples: lamp on, fan off, pump 3, curtain 90, beep, status");
    return;
  }
  printStatus();
}
```

What's new in this snippet:

- **`toLowerCase()`** turns every letter into lowercase, so `Lamp ON` is still recognized.
- **`startsWith("pump ")`** checks whether the text **starts with** that word.
- **`substring(5)`** takes the rest of the text after the first five characters: `pump ` is four letters and a space. C++ counts positions from 0, so position 5 is the sixth character — the number right after them. `curtain ` is seven letters and a space, so the curtain line uses `substring(8)`.
- **`notANumber()`** uses the "not a number" check from Practice 5. So `curtain abc` is rejected and the servo doesn't move to 0°.
- An unknown command gets the reply `Unknown command. …` right away, while a recognized command ends with `printStatus()`.

**Step 6 — `setup()`, `loop()`, and one shelf label.** Replace the old `setup()` and `loop()` with the block below, then **delete** the line `const unsigned long READ_INTERVAL = 2000;` near the top of the file — the new `loop()` doesn't use it anymore.

```cpp
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Node 1 Home - firmware " + FIRMWARE_VERSION);
  Serial.println("Last restart reason: " + resetReasonName());
  setupPins();
  printStatus();
}

void loop() {
  // The button and Serial are checked on every pass (about 100 times per second),
  // so no button press is missed. A sensor report about every 2 seconds is enough.
  if (buttonPressed()) {
    setLamp(!lampOn);
    printStatus();
  }
  checkSerialCommand();

  loopCount++;
  if (loopCount >= LOOPS_PER_REPORT) {
    loopCount = 0;
    SensorReading reading = readSensors();
    printReading(reading);
    showOnDisplay(reading);
    controlActuators(reading);
    sendData(reading);
    blinkStatus();
  }
  delay(LOOP_DELAY);
}
```

Finally, find the label line above the `controlActuators` shelf, which is `// ---------- Modules 5 & 19: control the fan, lamp, pump ----------`. Change that line to `// ---------- Modules 6 & 19: automation rules (watering, lamp, fan) ----------`, then replace the comment `// not filled in yet` inside that shelf with `// not filled in yet: Module 6 adds "automatic watering" and "automatic lamp"`. That shelf gets filled in next week.

Why did `loop()` change? In v0.1.0, `loop()` stopped for 2 seconds on every pass (`delay(READ_INTERVAL)`), so a button press could be missed. Now `loop()` repeats about every 10 ms to check the button and the Serial Monitor, while the sensor report is only printed every 200 passes (about 2 seconds). This approach is still simple; Module 8 replaces it with the `millis()` pattern.

### C. Test Node 1

1. Click **Verify**. If an error shows up, compare the line the error message points to with the [reference version](../../mini-smart-home/firmware/node-1-home/node-1-home.ino).
2. Plug in the USB, turn on the MB102, then click **Upload**. Open the Serial Monitor (**New Line**, 115200 baud).

   **Expected output:**

   ```text
   Node 1 Home - firmware 0.2.0
   Last restart reason: POWERON
   status: lamp=off fan=off curtain=90
   temperature=28.5 humidity=71 light=412 motion=no
   ```

3. Make sure the pump is under water and the end of its tubing is in a glass. Then test every "hand" by typing these commands one at a time: `lamp on`, `fan on`, `curtain 45`, `beep`, `pump 3`, `fan off`, `status`. Every command gets a `status: …` line as its reply, and the thing moves. Also press the manual button: the lamp relay switches when your finger is lifted.
4. Type `hello`: Node 1 replies `Unknown command. …`. Also type `curtain abc`: Node 1 replies `Need a number of degrees. …`, and the servo doesn't move.

In Wokwi, the 2-channel relay module is replaced by two 1-channel relay modules, while the lamp, the fan, and the pump are represented by labeled LEDs.

![Wokwi screenshot: the complete Node 1 with the servo, two 1-channel relay modules, LEDs labeled lamp and fan, the buzzer, an LED labeled pump, the D13 button, the ESP32 board, and the status LED. Marker 1: after the command lamp on, the lamp LED lights up. Marker 2: after the command curtain 45, the servo arm turns to about 45 degrees. Marker 3: the small LED labeled LED1 on the Wokwi relay module lights up the wrong way around; just ignore it. Marker 4: the Serial Monitor shows the status reply, for example status: lamp=on fan=off curtain=45. Note at the bottom: in Wokwi, the 2-channel relay module is replaced by two 1-channel relay modules, while the lamp, the fan, and the pump are represented by labeled LEDs](assets/wokwi-node-1.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

### D. Commit and push

1. In GitHub Desktop, choose **`mini-smart-home`** in the **Current repository** box — always check this box before you commit!
2. The **Changes** tab lists two files: `PIN-MAP.md` (new) and `firmware/node-1-home/node-1-home.ino` (changed; on the right you see the added lines in green and the deleted ones in red).
3. Fill in **Summary** with `Node 1 v0.2.0: all actuators on canonical pins + PIN-MAP.md (Module 5)`, click **Commit 2 files to main**, then **Push origin**.

> [!IMPORTANT]
> **`PIN-MAP.md` is the law of this project.** Every time a curriculum module adds a new sensor or part to Node 1, check this map first. If one day you have to change it, change **the file and the constants in the code at the same time**, then write down the reason in the commit message.

---

## 📖 Glossary

| Term | Beginner-friendly meaning |
| :--- | :--- |
| **GPIO** | *General Purpose Input/Output*: an ESP32 pin that code can set up as an input or an output. Our board has 25. |
| **Strapping pin** | A pin whose level the chip "snapshots" right as it powers up, to decide how to start (GPIO 0, 2, 5, 12, 15). |
| **Input-only pin** | GPIO 34–39: they can only read, can't be outputs, and have no internal pull-up. |
| **ADC1 / ADC2** | The ESP32's two analog voltage readers. ADC2 can't be used while Wi-Fi is on, so our analog sensors are always on ADC1 (GPIO 32–39). |
| **Canonical pin map** | The fixed list of "which wire goes on which pin" for the whole project, valid until Module 28. Saved in `PIN-MAP.md`. |
| **MB102** | A small power supply module that plugs into the end of a breadboard; it feeds 5 V (or 3.3 V) from an adapter to the breadboard's rails. |
| **Top / middle / bottom rail** | Our names for the power rails on the workbench: the top rail is 5 V from the MB102 for loads, the middle rail isn't used, the bottom rail is 3.3 V from the ESP32. |
| **Shared GND** | All the power sources joined at the same zero point, so the relay and the MOSFET understand the ESP32's 3.3 V signal. |
| **Load** | Something that "eats" quite a lot of electricity: relays, fans, pumps, servos. |
| ***Brownout*** | A brief voltage drop. The ESP32's brownout detector restarts the chip on purpose so it doesn't run haywire. |
| **Restart reason** (`reset_reason`) | The chip's record of why it last restarted: `POWERON`, `BROWNOUT`, `PANIC`, and so on. |
| **Input / output** | An input pin reads a voltage; an output pin puts out 3.3 V or 0 V. |
| **Floating** | The state of an input pin that isn't connected to anything, so its reading is random. |
| **Pull-up / pull-down** | A resistor that pulls an input pin to 3.3 V / to GND so it doesn't float. `INPUT_PULLUP` switches on the pull-up resistor inside the chip. |
| **Bounce** | A button's metal contacts connecting and disconnecting many times for a few milliseconds every time it's pressed or released. |
| ***Debounce*** | A way to tame bouncing, for example by waiting 30 ms and then checking again. |
| ***Toggle*** | One button that both switches something on and switches it off: every press flips the state. |
| **Driver** | An in-between switch that takes its power from the power supply, while the ESP32 pin only gives the command. |
| **PWM** | *Pulse Width Modulation*: switching a pin on and off very fast to imitate "half on", make tones, or give angle commands. |
| ***Duty cycle*** | The percentage of each PWM cycle that the pin is on. |
| **Frequency** (Hz) | How many times something repeats in one second. 5,000 Hz = 5,000 times per second. |
| **LEDC** | The part of the ESP32 chip that makes PWM; used through `ledcAttach`, `ledcWrite`, and `ledcWriteTone`. |
| **Resolution (bits)** | The number of duty cycle steps. 8 bits = 256 steps (0–255). |
| **Passive / active buzzer** | A passive buzzer sounds at the PWM frequency, so it can play notes; an active buzzer has its own tone generator with one fixed tone. |
| **Servo** | A small motor that can be commanded to a particular angle (0–180°) through the pulse width. |
| **Relay** | A switch moved by an electromagnet; it can switch a load that's kept separate from the ESP32. |
| **COM / NO / NC** | A relay's three contacts: common, normally open, and normally closed. |
| ***Low-level trigger*** / active LOW | Triggered by a low signal: the relay pulls in when its IN pin gets `LOW`. |
| ***Optocoupler*** | A tiny light and light sensor in one package; it separates the side that gives commands from the relay coil side. |
| **JD-VCC** | A pin and jumper on the relay module for separating the relay coils' power from the command side's power. |
| ***Fail-safe*** | A design that falls back to a safe state if something fails, for example the fan stopping when the ESP32 restarts or its IN wire comes loose. |
| **MOSFET** | A transistor that works as a silent electronic switch; driven by the voltage on its G (*gate*) leg. |
| ***Logic-level*** | A property of a MOSFET that already conducts well at a low gate voltage: fully open at 4–5 V, and at 3.3 V already enough for hundreds of mA. Example: the IRLZ44N. |
| **G / D / S** | A MOSFET's three legs: *gate*, *drain*, *source*. |
| ***Low-side switch*** | A switch on a load's "way home" to GND; the load stays connected to 5 V. |
| **Flyback diode** | A diode placed in parallel with a motor or coil, with its silver ring on the (+) side, to "swallow" the voltage spike when the current is cut. |
| **Electrolytic capacitor** | A part that stores charge, with (+) and (−) legs; used as a "small reservoir" against current surges. It must not go in the wrong way around. |
| **Potentiometer** | A resistor with a turning knob; its middle leg puts out a voltage between the voltages of its two outer legs. |
| **DAC** | *Digital-to-Analog Converter*: turns a number into a real analog voltage. The classic ESP32 has two, on GPIO 25 and 26. |
| ***Interrupt*** | A feature that "wakes up" the program the moment a pin changes, without it having to check over and over. |
| **USB A–A cable** | A USB cable with a male type A (rectangular) plug at both ends; used from the adapter to the MB102's USB port. |

---

## 📝 5-Question Quiz

Answer in your notes first, then open the key. Pass = at least 4 correct.

1. Name **three pins** (or groups of pins) on the ESP32 DevKit V1 that are best left unused, with the reason for each.
2. A button on D13 is connected to GND, with `pinMode(13, INPUT_PULLUP)`. (a) What does `digitalRead(13)` return when the button is pressed, and when it's released? (b) Why does the same button on **D34** read randomly, even though the code is exactly the same?
3. A friend wrote a program that counts button presses, but one press is counted four times. What's causing it? Name the two ideas the `buttonPressed()` function uses to deal with it.
4. Your friend's ESP32 restarts every time the fan starts turning. The fan gets its power from the VIN pin, and the board is plugged into a laptop. (a) What text will probably appear in the Serial Monitor? (b) How do you fix it? Name three rules that must be followed.
5. (a) A tutorial writes `ledcSetup(0, 5000, 8);`, `ledcAttachPin(4, 0);`, and `ledcWrite(0, 128);`. Rewrite it for esp32 package version 3. (b) Our relay module is active LOW, and `pinMode(33, OUTPUT)` has already been called in `setup()`. Write one line of code that **turns on** the fan on D33.

<details>
<summary><b>Answer key & explanations</b></summary>

1. (1) **GPIO 12 (D12)**: the strapping pin that sets the flash memory voltage; if it's pulled HIGH at power-up, the board fails to boot. (2) **GPIO 1 and 3 (TX0, RX0)**: the USB line to the laptop, used while a program is being uploaded and by the Serial Monitor. (3) **GPIO 6–11**: used by the flash memory where the program is stored; using them makes the program crash. The answer **GPIO 0** (the BOOT button, which selects download mode) is also correct.
2. (a) Pressed: `LOW` (the pin is connected to GND). Released: `HIGH` (pulled up to 3.3 V by the internal pull-up resistor). The logic is reversed. (b) GPIO 34–39 **have no internal pull-up resistor**, so `INPUT_PULLUP` silently does nothing. When the button is released, that pin floats and its reading is random. The solution: move the button to another pin (like D13) or add a 10 kΩ resistor to 3.3 V.
3. **Bouncing**: the button's metal contacts connect and disconnect several times over a few milliseconds, and the ESP32 is fast enough to read every bounce as a new press. Idea 1: **react to the change**, not the state (compare with the previous state). Idea 2: **wait for the bouncing to settle** (about 30 ms), check again, wait until the button is released, then wait again.
4. (a) `Brownout detector was triggered`, and then the ESP32 restarts; the Practice 8 sketch would print `Last restart reason: BROWNOUT`. (b) Move the fan (and every load) to a separate power supply. The rules: **loads always run from the MB102** (not from the board's VIN/3V3), **the ESP32 is powered from the laptop's USB**, and **the GNDs are joined**. The fourth and fifth rules are also correct answers: the MB102's 5 V rail is never connected to 3V3, or to VIN while the USB is plugged in; and the USB is plugged in before the MB102 is turned on. Turning off the brownout detector is **not** a correct answer.
5. (a) `ledcAttach(4, 5000, 8);` then `ledcWrite(4, 128);` — in version 3, PWM is set up per **pin**, not per channel. (b) `digitalWrite(33, LOW);` (or `setFan(true);` if you've already written that function). LOW = the relay pulls in = the fan spins. This line only takes effect after `pinMode(33, OUTPUT)`; in esp32 package version 3, a `digitalWrite` before `pinMode` is ignored.

</details>

---

## ✅ Module 5 Completion Checklist

Tick honestly. The ⭐ boxes are the **official requirements to pass** from the Syllabus; the rest are highly recommended. When everything is ticked, mark Module 5 in your copy of [`PROGRESS.md`](../../PROGRESS.md) and move on to Module 6.

- [ ] My workbench has been rearranged: the ESP32 rides across two breadboards, the top rail measures about 5 V from the MB102, the bottom rail about 3.3 V from the ESP32, and the shared GND is proven with the multimeter (Practice 1).
- [ ] I've seen button bounce with my own eyes, then tamed it with debounce (Practice 2).
- [ ] The LED dims and brightens with the potentiometer, the buzzer plays the scale, and the servo follows the angle I type (Practices 3–5).
- [ ] My relay module passes the 3.3 V test: it releases when IN gets 3.3 V (Practice 6.3).
- [ ] ⭐ **One button turns the fan relay on and off without bouncing**: 10 presses = exactly 10 switches (Practice 6).
- [ ] ⭐ **The pump runs for 3 seconds through a MOSFET, powered by the MB102** (Practice 7)…
- [ ] ⭐ …**and the fan and the pump run from the MB102 without the ESP32 restarting**: the restart detective runs for 2 minutes without going back to cycle 1, and all five pump tests pass (Practice 8.3).
- [ ] I've seen (or measured) what happens with loads on the laptop's USB, and I know why the brownout detector must not be turned off (Practice 8).
- [ ] ⭐ **I can name three ESP32 pins that are best left unused, with the reasons** (Concept 2).
- [ ] The `module-05` folder and `workbench.jpg` have been pushed to the `learn-iot` repository (Practice 9).
- [ ] `PIN-MAP.md` and Node 1 v0.2.0 have been pushed to the `mini-smart-home` repository, and I've tested all of Node 1's Serial commands (➕).
- [ ] ⭐ **Quiz: at least 4 of 5 correct.**

**You pass when** (according to the Syllabus): *one button turns a relay on/off without "bouncing", the pump & fan run from the MB102 without the ESP32 restarting, and you can name 3 ESP32 pins that are best left unused, with the reasons.*

**Toward the Phase 1 completion criteria** ([Syllabus §8](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)): you've collected two pieces of the Phase 1 evidence this week, namely **`PIN-MAP.md`** and **a photo of the circuit**. The rest — Node 1 firmware v1.0 running for 24 hours from an adapter, a measured battery sketch, and a 30-second video — follow in Modules 6–9.

---

## 📚 Sources & Image Credits

Our own diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The illustrations of the workbench, the MB102 module, the relay module, and the ESP32 board are redrawn to follow their real shapes; the real parts' sizes and layouts may differ slightly between manufacturers. A full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-05`, `button-bounce`, `pin-current-drivers`, `pwm-three-uses` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. | CC BY 4.0 |
| `pinout-devkit-v1`, `canonical-pin-map` (`.png` + `.svg`) | Original diagrams. The pin order follows the 30-pin ESP32 DevKit V1 board; the pin functions follow the ESP32 datasheet and the ESP-IDF documentation. | CC BY 4.0 |
| `two-power-paths`, `brownout-graph`, `input-pullup` (`.png` + `.svg`) | Original diagrams. The voltage limits and the brownout message come from the ESP-IDF source code; the internal pull-up resistor of about 45 kΩ from the ESP32 datasheet. | CC BY 4.0 |
| `mb102-anatomy`, `relay-how-it-works`, `mosfet-pump` (`.png` + `.svg`) | Original diagrams and illustrations, redrawn (not photos). The MB102's functions follow the YwRobot/Addicore guide and schematic; the IRLZ44N's leg order follows its datasheet. | CC BY 4.0 |
| `two-breadboards`, `workbench-1-base` through `workbench-7-pump`, `workbench-node-1` (`.png` + `.svg`) | Original curriculum illustrations. The hole layout follows an 830-point breadboard; on other breadboard brands, the ESP32's rows of pins may shift by one row (Practice 1.3). | CC BY 4.0 |
| `photo-servo-sg90.jpg` | Photo: Suyash Dwivedi, [*Tower Pro SG90 micro servo motor*](https://commons.wikimedia.org/wiki/File:Tower_Pro_SG90_micro_servo_motor.jpg), Wikimedia Commons. Markers added by the author. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en); this marked-up image is also licensed CC BY-SA 4.0. |
| `wokwi-first-button.png`, `wokwi-button-bounce.png`, `wokwi-node-1.png` | Screenshots of the [Wokwi](https://wokwi.com) simulator (October 2026) running this module's code and `diagram.json` files. Markers by the author. | © Wokwi (CodeMagic LTD); used for educational purposes. |

References used while writing:

- Espressif: the [ESP32 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) (pin current limits, HIGH/LOW voltages, the 45 kΩ pull-up resistor, strapping pins), the [*ESP32 Series SoC Errata*](https://www.espressif.com/sites/default/files/documentation/esp32_errata_en.pdf) (GPIO 36/39), the ESP-IDF documentation on [GPIO](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html) and [reset reasons](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/misc_system_api.html), and the brownout detector source code in [ESP-IDF](https://github.com/espressif/esp-idf).
- The Arduino-ESP32 3.3.x package: the documentation on [GPIO](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html), [LEDC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html), and the [migration guide from version 2 to 3](https://docs.espressif.com/projects/arduino-esp32/en/latest/migration_guides/2.x_to_3.0.html), plus the source code of `esp32-hal-ledc.c` and `esp32-hal-gpio.c`.
- The [ESP32Servo](https://github.com/madhephaestus/ESP32Servo) 3.2.1 library (the source code for how PWM channels are assigned).
- The datasheets of the IRLZ44N MOSFET (International Rectifier/Infineon) and the Songle SRD-05VDC-SL-C relay, and the guide to the MB102 breadboard power supply module (YwRobot/Addicore).
- The Wokwi part documentation: [pushbutton](https://docs.wokwi.com/parts/wokwi-pushbutton), [potentiometer](https://docs.wokwi.com/parts/wokwi-potentiometer), [relay module](https://docs.wokwi.com/parts/wokwi-relay-module), [servo](https://docs.wokwi.com/parts/wokwi-servo), and [buzzer](https://docs.wokwi.com/parts/wokwi-buzzer).

All the sketches in this module have been run in Wokwi with esp32 package version 3 and ESP32Servo 3.2.1, and every error message quoted is real compiler output.

---

[⬅️ Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 6 — Reading Sensors: Analog, Digital, & Calibration](../module-06-reading-sensors/README.md) ➡️**
