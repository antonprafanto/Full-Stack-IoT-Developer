# Module 9 — Power Supply & Low Power: Adapters, Batteries, Deep Sleep, & Measuring Current

🌐 **English** · [Bahasa Indonesia](../../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md)

*Phase 1 · Week 9 · Hardware: **the Node 1 workbench from Module 8**, **a second ESP32 board**, an **INA219** module, and a set of **18650 battery + TP4056 + MT3608** (see 🧰) — most of this week's practices need a real board · Prerequisite: **Module 8** (Node 1 v1.0) · Time: 8–10 hours, spread over the week; the 24-hour test in the ➕ section runs on its own*

[⬅️ Module 8](../module-08-robust-firmware/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 10 ➡️](../../phase-2-connectivity/module-10-wifi-and-http/README.md)

---

Node 1 v1.0 is already robust: it never waits idly, it remembers its settings, and it restarts itself if it gets stuck. But one thing hasn't changed since Module 2: **Node 1 is still tethered to the laptop**. As soon as the laptop is turned off, goes to sleep, or is carried away, Node 1 goes dark too. Meanwhile, Node 2 "Garden", which we'll build in Module 14, will sit out in the yard, far from any wall outlet.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Node 1 only runs while the laptop is on and not asleep. | The ESP32 still takes its power from the laptop's USB. | An adapter of its own for the ESP32 (Concepts 1–2, Practice 1, the ➕ section) |
| A power bank looks right for a small device, but it can switch itself off. | Many power banks switch themselves off when the current drawn is small. | Recognizing the trap and choosing the right source (Concept 2, Practice 7) |
| There's no wall outlet in the garden, and an 18650 battery only gives 3.0–4.2 V. | The ESP32 DevKit board needs 5 V at the VIN pin or the USB port. | The TP4056 charger and the MT3608 voltage booster (Concepts 6–7, Practice 5) |
| An ESP32 that stays awake drains a battery in about a day. | The chip, the regulator, and the LED on the board keep drawing current. | Deep sleep and waking up by itself (Concepts 4–5, Practices 2–4) |
| We don't know yet how long the battery lasts. | The current has never been measured. | Measuring the current with the INA219, then calculating the battery life (Concepts 8–10, Practice 6) |

This week, Node 1 gets **a permanent power supply of its own**, and you prepare the **Node 2 skeleton**: a second ESP32 board that runs on a battery, wakes up every 30 seconds to read the temperature, then goes back to sleep. To measure its current, Node 1 itself becomes the **meter**. At the end of the module, you complete the **Phase 1 checkpoint** 🎉: Node 1 runs for 24 hours from an adapter, and the sleep current of the battery sketch has been measured.

![Module 9 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations to Phase 5 Operations and scale; Phase 1 ESP32, Modules 5 to 9, is highlighted, Modules 1 to 8 are marked done, and Module 9 is marked YOU ARE HERE with the note "power, sleep, and the Phase 1 checkpoint". Bottom: the box for this week's Module 9, about 8 to 10 hours spread over the week, plus the INA219, the 18650, the TP4056, the MT3608, and a second ESP32, holding ten things: QW, the Quick Win, the ESP32 sleeps and wakes up by itself; P1, Node 1 without a laptop, its own adapter; P2, three memories: RAM, RTC memory, NVS; P3, woken by a button, then light sleep; P4, the Node 2 skeleton on the second board; P5, build the battery supply, 18650 to TP4056 to MT3608; P6, Node 1 becomes a current meter (INA219); P7, power bank test: does it switch itself off?; P8, save the sketches and notes to GitHub; and a plus sign, the Add-on: Node 1, 24 hours on an adapter, and the checkpoint. Stars mark P6 and the 24-hour test as completion requirements](assets/roadmap-module-09.png)

> [!NOTE]
> **How to use this module.**
>
> - This week there are **two ESP32 boards**. **The Node 1 board** is the board that has been on your workbench since Module 2. **The second board** is the future Node 2. Every step always says which board it uses.
> - Every code box has a copy button in its top right corner. All the sketches are also available as files in the [`code/`](code/) folder.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing.
> - **Wokwi can't run deep sleep in Arduino ESP32 sketches correctly yet.** When this module was tested (October 2026), a sketch that calls `esp_deep_sleep_start()` made the simulated board restart right away with the message `rst:0x8 (TG1WDT_SYS_RESET)` instead of sleeping. That's why the Quick Win and most of this week's practices are done on a real board. The only thing you can try in Wokwi is light sleep with the timer alarm in Practice 3B. Electric current can't be measured in the simulator either. Don't have the kit yet? Read the concepts first, then do the practices as soon as the parts arrive.
> - The **Expected output** boxes for the deep sleep and current meter sketches are **example output on a real board**, not Wokwi recordings: the deep sleep output is put together from Espressif's official documentation and examples, while the current meter's numbers follow the measurements of similar boards cited in 📚. The numbers on your board will certainly be a little different. Some of the lines from the board's ROM (the ones starting with `ets`, `rst:`, `load:`, and so on) are shortened to `…`, and the date in the `ets` line may be different on your board.
> - macOS users: replace **Ctrl** with **Cmd** to save, select all, copy, and paste.

> [!WARNING]
> **Safety rules this week.** A Li-ion battery stores a lot of energy. A battery that is short-circuited or damaged can get very hot, give off smoke, or even catch fire.
>
> 1. **Never connect the battery's (+) and (−) terminals directly**, including through a metal object (a screwdriver, keys, jewelry, a paper clip). Keep the battery in its own place, not in a pocket or in a drawer with metal things.
> 2. **Don't use a battery that is dented, leaking, or swollen, or whose plastic wrapper is torn.** Don't puncture it, smash it, or burn it. Take used batteries to an e-waste collection point, not to the ordinary trash.
> 3. **Check the polarity when you put the battery into its holder** (the + mark on the holder meets the battery's raised + end). Reversed polarity can damage the charger module instantly and make the battery hot.
> 4. **Only charge the battery while someone is watching it**, on a surface that doesn't burn easily (a tile, a ceramic plate), away from direct sunlight and flammable things. Touch the battery now and then: warm is still normal; **hot** means unplug the charger, move the battery away from flammable things, and don't use it again.
> 5. **Set the MT3608 module to 5.0 V with the multimeter before you connect it to an ESP32 board.** Its factory setting is unpredictable, and this module can put out up to 28 V.
> 6. **One ESP32 board, one power source.** A board that gets 5 V through the VIN pin must not be plugged into USB at the same time. **The 3V3 pin never gets 5 V, and never gets a battery** (a full battery is at 4.2 V, while the ESP32 chip can only handle about 3.6 V).
> 7. **This week, the multimeter is only used on a voltage setting (V⎓), with the red probe in the VΩmA jack.** The 10A jack (used for measuring current in Module 5) isn't used this week. Don't touch the probes to the battery's terminals while the multimeter is on a current setting (A or mA) or while the red probe is still in the 10A jack: that's the same as connecting the two terminals directly.
>
> The golden power rules from Module 5 still apply to Node 1.

This module follows the same rhythm as Modules 1–8. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools and parts it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: the ESP32 sleeps and wakes up by itself (10 minutes)](#-quick-win-the-esp32-sleeps-and-wakes-up-by-itself-10-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Three power doors](#1-the-three-power-doors-of-the-esp32-board-usb-vin-and-3v3) · [2 Adapters & power banks](#2-adapters-and-power-banks-both-5-v-but-they-behave-differently) · [3 Brownout](#3-brownout-when-the-voltage-dips-for-a-moment) · [4 Sleep](#4-sleep-active-light-sleep-and-deep-sleep) · [5 Three memories](#5-three-memories-ram-rtc-memory-and-nvs) · [6 The 18650 battery](#6-the-18650-li-ion-battery-its-voltage-changes-and-its-capacity-is-often-exaggerated) · [7 TP4056 & MT3608](#7-tp4056-and-mt3608-the-charger-and-the-voltage-booster) · [8 Measuring current](#8-measuring-current-the-ina219-not-a-multimeter) · [9 Battery life](#9-calculating-battery-life) · [10 Honest about the DevKit V1](#10-honest-about-the-devkit-v1-why-its-battery-only-lasts-a-few-days)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Node 1 without a laptop](#practice-1--node-1-without-a-laptop-its-own-adapter-20-minutes) · [2 Three memories](#practice-2--three-memories-ram-rtc-memory-and-nvs-20-minutes) · [3 Waking & light sleep](#practice-3--woken-by-an-alarm-or-a-button-and-light-sleep-30-minutes) · [4 Node 2 skeleton](#practice-4--the-node-2-skeleton-on-the-second-board-25-minutes) · [5 Battery supply](#practice-5--build-the-battery-supply-18650--tp4056--mt3608-40-minutes) · [6 Measuring current ⭐](#practice-6--node-1-becomes-a-current-meter-ina219-45-minutes) · [7 Power bank](#practice-7--power-bank-test-does-it-switch-itself-off-15-minutes) · [8 GitHub](#practice-8--save-to-github-15-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-9-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

- **Power Node 1 without a laptop** safely, and know when to use the USB port, the VIN pin, or the 3V3 pin (and when you must not).
- **Explain two power supply traps**: a power bank that switches itself off and a voltage that dips (a brownout), then prevent them.
- **Build a battery supply** 18650 → TP4056 → MT3608 → VIN safely, including setting the MT3608 to 5.0 V with a multimeter.
- **Make the ESP32 sleep** (deep sleep and light sleep) and wake up by itself on a timer alarm or a button press.
- **Choose where to store data** on a device that sleeps: RAM, RTC memory, or NVS.
- **Measure the current** while awake and while asleep with an INA219 module, then **calculate the battery life** yourself.
- **Explain honestly** why the ESP32 DevKit V1 board isn't suited to a battery-powered device that has to last for months, and what the alternatives are.
- **Complete the Phase 1 checkpoint**: Node 1 runs for 24 hours from an adapter, and the Node 2 skeleton is ready to use in Module 14.

---

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **The Node 1 workbench from Module 8** | Complete, with the Node 1 v1.0 firmware. **Leave everything connected.** |
| **An adapter for the Node 1 board** | **A branded 5 V phone charger, at least 1 A**, with a USB cable that fits your ESP32 board's connector (the data cable from Module 2 is fine too). If your Module 8 24-hour test already used a charger, use the same one. **Not** a power bank (Concept 2). |
| **A second ESP32 DevKit V1 board + a second USB data cable** | From Kit A Stage 2. This board is the future Node 2. |
| **INA219 module** | An I2C current and voltage meter. Choose one **with soldered headers** (rows of pins), just like the OLED display and the BME280 in Module 7. |
| **An 18650 Li-ion battery + an 18650 holder with wires** | A genuine battery from a trusted shop, with a capacity of 2,000–3,500 mAh. Avoid batteries labeled 6,000–9,900 mAh: an 18650 battery that big doesn't exist (Concept 6). Choose an **unprotected** battery (about 65 mm long): the protection is already on the TP4056, while a protected battery (about 70 mm) often doesn't fit an ordinary holder. A holder for one battery, with two wires whose ends are preferably already tinned with solder (shiny and stiff). |
| **TP4056 charger module with protection** | The **6-pad** version (two for the incoming power, B+ and B− for the battery, OUT+ and OUT− for the load), with a USB-C or micro-USB port. The 4-pad version has no protection: don't buy it. |
| **MT3608 boost module** | A small module with a blue trimmer potentiometer that has a brass screw. For the TP4056 and the MT3608, choose ones **with soldered headers**, or ask the seller to solder them on. The pins of these two modules aren't spaced to match the breadboard holes, so the modules **aren't plugged into the breadboard**: each pin is connected with a male–female wire. |
| **A second phone charger (or the same one, taking turns)** | For charging the battery through the TP4056's USB port, with a cable that fits your TP4056's port (USB-C or micro-USB; an ordinary charging cable is enough). |
| **A mini breadboard (400 points)** | A cheap new item. The battery circuit is built on it, and this breadboard is used again for Node 2 in Module 14. |
| **Jumper wires** | About **16 male–female wires** (10 for the battery circuit, 6 for the INA219), 3 **male–male** (2 as multimeter test points in Practice 5, 1 for the shared GND in Practice 6), and 3 **female–female** (for the DS18B20). |
| **Waterproof DS18B20 + its adapter module** | Kept since Module 7 for Node 2. |
| **100 µF electrolytic capacitor** | The one left over from the Kit A pack (the other one has been on the workbench since Module 5). Optional, but recommended (Concept 3). |
| **Multimeter** | From Module 2, on **V⎓ 20**. Also a **small screwdriver** (a flat-head one) for the MT3608's potentiometer screw. |
| **Power bank** (optional) | Only for Practice 7. Use the one you have. |
| **Paper + pencil (or a notes file)** | For writing down your measurements and calculating the battery life. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. |
| Board package **esp32 by Espressif Systems** | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. The sleep functions (`esp_sleep_…`, `esp_deep_sleep_start()`) are already included. |
| **Adafruit INA219** library | **1.2.3** | New this week (Practice 6). The **Library Manager** offers a few companion libraries; **Adafruit BusIO**, the one that's actually used, has been installed since Module 7. |
| **OneWire** and **DallasTemperature** libraries | **2.3.8** and **4.0.6** | Already installed in Module 7 (Practice 4). |

> [!TIP]
> **Shopping for this week.** The Kit A list in the Syllabus already includes the INA219 and a set of 18650 battery + TP4056 + MT3608. All you may not have yet are a mini breadboard, female–female jumper wires, and some extra male–female wires. The second ESP32 board is also part of Stage 2 and is used from Practice 4 on; if you don't have one yet, order it now. When you order, ask the seller whether the TP4056, MT3608, and INA219 already have their headers soldered on. If not, many sellers will solder them for a small fee.

---

## 🏆 Quick Win: the ESP32 sleeps and wakes up by itself (10 minutes)

Since Module 2, your ESP32 board has never rested: once it's on, it keeps working until the power is unplugged. Now let's tell it to sleep for 5 seconds, wake up by itself, blink once, then go back to sleep, while counting how many times it has woken up.

> 🖥️ **Tools used in this section:** **Arduino IDE** and the **Serial Monitor**, plus the **Node 1 board** plugged into the laptop, with the **MB102 turned off**. The D4 status LED on the workbench becomes the "I'm awake" sign. Wokwi can't simulate deep sleep yet, so this section is done on the real board.

1. **Turn off the MB102** (press its power button until the MB102's LED goes out; if your button doesn't cut the USB path, unplug its A–A cable as in Module 5). Loads such as the relays, the pump, and the servo aren't used in the sleep practices. Plug the Node 1 board's USB cable into the laptop.
2. In Arduino IDE, open **File → New Sketch**, delete its contents, then paste this code. Save it as `module09_first_sleep` in the `module-09` folder of the `learn-iot` repository (create the folder if it doesn't exist yet, as in the previous modules).

   ```cpp
   // Module 9 - Quick Win: the ESP32 sleeps 5 seconds, wakes up by itself, then sleeps again
   // Circuit: status LED on D4 (through a 220 ohm resistor). The D13 button is not used here yet.
   // Every time it wakes up, the LED blinks once and Serial prints how many times the board has woken up.

   const int PIN_STATUS_LED = 4;
   const unsigned long SLEEP_SECONDS = 5;  // how long to sleep, in seconds

   RTC_DATA_ATTR int wakeCount = 0;  // kept in RTC memory: it stays there during deep sleep

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);

     wakeCount++;
     Serial.print("Wake #");
     Serial.print(wakeCount);
     if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
       Serial.println(": woken by the timer alarm.");
     } else {
       Serial.println(": just powered on.");
     }

     digitalWrite(PIN_STATUS_LED, HIGH);  // a short blink: the "I'm awake" sign
     delay(200);
     digitalWrite(PIN_STATUS_LED, LOW);

     Serial.printf("Sleeping for %lu seconds... see you!\n", SLEEP_SECONDS);
     Serial.flush();  // wait until every letter has been sent, then sleep
     esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);  // the unit is microseconds
     esp_deep_sleep_start();  // sleep now; on waking up, the program starts again from setup()
   }

   void loop() {
     // Never runs: after deep sleep, the board always starts again from setup().
   }
   ```

3. Make sure the selected board is **DOIT ESP32 DEVKIT V1** and the port is correct, then click **Upload**. As soon as `Done uploading` appears, open the **Serial Monitor** (**115200 baud**).
4. Watch the status LED on D4: every 5 seconds it **blinks once**. Between those blinks, the ESP32 is asleep.

   **Expected output** (example output on a real board; ROM lines shortened). The `Wake #1` line may already have gone by before the Serial Monitor opens; it's fine if your screen only starts at `Wake #2`:

   ```text
   rst:0x1 (POWERON_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
   …
   Wake #1: just powered on.
   Sleeping for 5 seconds... see you!
   ets Jul 29 2019 12:21:46

   rst:0x5 (DEEPSLEEP_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
   …
   Wake #2: woken by the timer alarm.
   Sleeping for 5 seconds... see you!
   ets Jul 29 2019 12:21:46

   rst:0x5 (DEEPSLEEP_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
   …
   Wake #3: woken by the timer alarm.
   Sleeping for 5 seconds... see you!
   ```

Congratulations — your ESP32 just went to sleep and woke up by itself. Notice three things:

- **Every time it wakes up, the board starts again from `setup()`**, as if it had just been powered on. The ROM lines (`ets …`, `rst:…`) are printed again too. Its reset reason is now `rst:0x5 (DEEPSLEEP_RESET)`: "woke up from deep sleep". In a deep sleep sketch, `loop()` never runs.
- **`wakeCount` still remembers its count**, even though every ordinary variable is wiped each time the board wakes up. The secret is the word `RTC_DATA_ATTR`: that variable is kept in **RTC memory** (RTC: *real-time clock*), a small part of the chip that stays powered during sleep (Concept 5).
- **The two lines before sleeping matter.** `esp_sleep_enable_timer_wakeup()` sets the alarm (its unit is **microseconds**: 5 seconds = 5,000,000 µs, written `SLEEP_SECONDS * 1000000ULL`, that is, 5 × 1,000,000), while `Serial.flush()` waits until every letter has been sent. On this board, the sleep command actually waits for the last letter to be sent too, but `flush()` is still a good habit that Espressif's official examples use: with other kinds of sleep or on other boards, the last sentence can get cut off or only appear after the board wakes up.

Press the **EN** button on the ESP32 board: the count goes back to `Wake #1: just powered on.` The EN button is the same as unplugging the power and plugging it back in, and the contents of RTC memory are wiped too. In Practice 2, you'll see the ESP32's three "memories" side by side.

Leave this sketch running for now; let's move on to the concepts. If you want to stop, just unplug the USB: a sleeping board doesn't need to be "woken up" before you unplug it.

## 🧠 The "Why" Concepts

Ten concepts, one per section — **you don't need to read them all at once**. Concepts and practices alternate in this order:

1. Concepts 1–3 → Practice 1 (Node 1 without a laptop)
2. Concepts 4–5 → Practices 2–4 (three memories, waking up with a button, light sleep, and the Node 2 skeleton)
3. Concepts 6–7 → Practice 5 (the battery supply)
4. Concepts 8–10 → Practices 6–8 (measuring current and calculating battery life, the power bank test, and GitHub)
5. 🧩 Challenges → ➕ Mini Smart Home (Node 1 permanently on an adapter, the Node 2 skeleton, and the Phase 1 checkpoint) → 📝 Quiz → ✅ Checklist

At every switch point, there's a ➡️ box (forward to the practice) and a ⬆️ box (back to the concepts) with links you only need to click.

> 🖥️ **Want to try the code in the Concepts section?** It's not required — you'll run all the code in the Practices. The code in the Concepts section is only snippets; the full versions are in the Practice sketches and in the [`code/`](code/) folder. Remember, most of this week's sketches use deep sleep, so they run on the real board, not in Wokwi.

### 1. The three power doors of the ESP32 board: USB, VIN, and 3V3

Since Module 2, your ESP32 board's power has always come in one way: the USB cable from the laptop. In fact, the DevKit V1 board has **three doors** where power can come in. All three end up in the same place, the ESP32 chip, which only accepts **3.3 V**, but the paths they take are different.

![Diagram of the three power doors of the ESP32 DevKit V1 board; all three end at the ESP32 chip, which only accepts 3.3 volts. Top: the power path inside the board, from left to right: the USB port, 5 volts in (door 1); a diode, a one-way door; the 5-volt line, which branches off to the VIN pin at the edge of the board (door 2); the AMS1117-3.3 regulator, which needs about 4.5 volts or more going in; the 3.3-volt line, which branches off to the 3V3 pin (door 3), the red LED, and the USB-serial chip; then the ESP32 chip and its flash memory, which only handle up to 3.6 volts. A note: all the GND pins are joined together. Bottom: three rule cards. Door 1, the USB port: allowed are a laptop, a 5-volt phone charger, or a power bank; the diode keeps power from VIN from flowing back into the laptop; this week, for Node 1, from its own charger. Door 2, the VIN pin: allowed is a steady 5 volts, such as an MT3608 at 5.0 volts; not a Li-ion battery directly (3.0 to 4.2 volts), and not at the same time as the USB cable; this week, for the second board, on a battery. Door 3, the 3V3 pin: not 5 volts from any source, and not a Li-ion battery directly (up to 4.2 volts), because this pin comes in after the regulator, with no guard; this week, only a 3.3-volt output for sensors](assets/three-power-doors.png)

Follow the power's path from the USB port:

1. The **USB port** receives 5 V from the laptop or a charger. That power first passes through a **diode** (Module 2), a "one-way door" that stops power from the VIN pin from flowing back into the laptop. This diode eats up a few tenths of a volt.
2. After the diode, the power reaches the board's **5 V line**. This is the line that's connected to the **VIN pin**. That's why VIN reads "about 5 V", a little below it, when the board is plugged into the laptop.
3. The 5 V line goes into the AMS1117-3.3 **regulator**, the small black part with three legs near the USB port. Its job is to bring the voltage down to a calm, steady **3.3 V**, whatever its input voltage is (as long as it's high enough).
4. The result reaches the **3.3 V line**, which is connected to the **3V3 pin**, the ESP32 chip, the flash memory, the red power LED, and the USB-serial chip (the USB translator chip from Module 2).

Because the paths are different, each door has its own rules:

| Door | Where it comes in | Allowed | Never | In this module |
| :--- | :--- | :--- | :--- | :--- |
| **USB port** | before the diode | 5 V from a laptop, a phone charger, or a power bank | — | Node 1, from its own charger (Practice 1 and ➕ A) |
| **VIN pin** | the 5 V line, after the diode | a steady 5 V from another source (this week: the MT3608 set to 5.0 V) | a Li-ion battery directly; another source **while** USB is also plugged in | the second board, from the battery through the MT3608 (Practice 5) |
| **3V3 pin** | the 3.3 V line, **after** the regulator (no guard) | only an already regulated 3.3 V | 5 V; a Li-ion battery directly (up to 4.2 V) | **not a way in**: only an output for small sensors, as it has been since Module 5 |

Three things to remember:

- **The regulator needs "breathing room".** The AMS1117 can only put out a calm 3.3 V if its input is about 1.1 V higher (its datasheet guarantees at most 1.3 V), so its input needs to be about **4.5 V** or more. If the input is only 3.7 V (a Li-ion battery), the output drops below 3.3 V too, and the ESP32 can restart by itself when it's busy. This is why the Syllabus says "the DevKit's regulator needs ≥ 4.5 V", and why we add the MT3608 voltage booster in Concept 7.
- **The 3V3 pin has no guard.** Power that comes in through this pin goes straight to the ESP32 chip without passing through the regulator. The ESP32 chip can only handle about **3.6 V**, while a full Li-ion battery is at **4.2 V**. One wire to the wrong pin is enough to damage it.
- **One board, one power source.** A board that gets its power through VIN isn't plugged into USB at the same time. The diode on the USB path does prevent part of the problem, but two sources with slightly different voltages can still push against each other. Want to upload a program to a board that's running on a battery? First unplug its VIN and GND wires, and only then plug in the USB.

For **Node 1**, we choose the simplest path: **it stays on the USB port**; only the laptop is replaced with a phone charger. No new wires, the power path doesn't change, and all the golden rules from Module 5 still apply. We only use the VIN pin for the **second board**, which runs on a battery.

### 2. Adapters and power banks: both 5 V, but they behave differently

The two easiest-to-find USB sources of 5 V are a **phone charger** (an adapter) and a **power bank**. Both put out 5 V, but they behave differently.

**An adapter (phone charger)** turns 220 V mains (PLN) power into 5 V. As long as the wall outlet has power, it keeps supplying power, whatever current is asked of it, from zero up to its limit. How to choose one for Node 1:

- **5 V output, at least 1 A.** The numbers are printed on the charger's body, for example "Output: 5V⎓2A". Espressif, the maker of the ESP32, recommends a source that can deliver **at least 500 mA**, because when Wi-Fi sends data (from Module 10 on), the current briefly jumps to hundreds of mA. A 1 A charger leaves plenty of room.
- **A fast charger (for example QC or PD) is fine too.** This kind of charger always starts at 5 V, and only raises its voltage (9 V, 12 V) if the device asks for it through a special "negotiation". The ESP32 board never asks, so it still gets 5 V.
- **Branded and undamaged.** Cheap no-name chargers often give a voltage that goes up and down, and their insulation is poor. For a device that's on 24 hours a day, choose a good one.
- **The cable matters too.** A long, thin USB cable "eats" a few tenths of a volt when the current is high. Use a short cable that isn't cheaply made.

A **power bank** holds a Li-ion battery, plus a circuit that raises its voltage to 5 V. For charging a phone, a power bank is very handy. For an ESP32, there's a **trap**: most power banks **switch themselves off** when the current drawn is too small. The threshold varies: tests of several power banks found limits between about 10 and 150 mA, and the power bank shut off after about 10–20 seconds below that limit. It's a battery-saving feature: the power bank thinks the phone is already full or has been unplugged.

The problem is that a sleeping ESP32 board draws only a few mA, far below that threshold. As a result, after a short sleep, your board never wakes up again, because the power bank has already shut off. Even a board that stays awake without Wi-Fi (about 55–65 mA) can fall into this trap with some power banks. In Practice 7, you test it yourself.

![Diagram of the power bank trap: it switches itself off at low current, with the example of an ESP32 board that wakes for 1 second, then sleeps for 30 seconds; the limit and timing vary between power banks. Top: an adapter (phone charger), with a check mark: a current graph from 0 to 70 seconds with wake-up spikes of about 55 milliamperes at seconds 2, 33, and 64, and about 5 milliamperes of sleep in between; the adapter keeps supplying power, whatever the current. Bottom: a power bank, with a cross, which thinks the phone is full, then switches itself off: a red dashed line marks the power bank's limit, 30 milliamperes in this example; after the wake-up at second 2, the sleep current stays below the limit for about 15 seconds, then at second 18 the power bank turns off and the current drops to zero; dashed boxes at seconds 33 and 64 mark the board that never wakes up again. Note at the bottom: tests of several power banks found limits of about 10 to 150 milliamperes, and they turned off after about 10 to 20 seconds below that limit; a sleeping board draws only a few milliamperes](assets/power-bank-trap.png)

| | Adapter (phone charger) | Power bank | 18650 battery + TP4056 + MT3608 |
| :--- | :--- | :--- | :--- |
| Energy source | mains (PLN) power | the battery inside it | the 18650 battery |
| Needs a wall outlet? | yes, all the time | only when recharging | only when recharging |
| Switches itself off at low current? | no | **often, yes** | no |
| Good for | **Node 1** (always near a wall outlet) | charging a phone; short tests | **Node 2** (in the garden, Module 14) |

> [!NOTE]
> **Node 1 never sleeps.** Node 1 looks after the lamp relay, the pump, and later Wi-Fi and MQTT, so it must always be awake and always get its power from an adapter. Everything we learn about sleep in this module is meant for battery-powered devices like Node 2.

### 3. Brownout: when the voltage dips for a moment

In Module 5, you already met the text `Brownout detector was triggered`. Back then, the cause was the fan taking its power from the laptop's USB. This time we go deeper, because this week the ESP32 will run from a source that's weaker than a laptop: a battery.

A **brownout** happens when the voltage on the 3.3 V line briefly drops below a safe limit, which in the esp32 package's default setting is about **2.43 V**. (Module 5 gave 2.4–2.8 V, because this limit can be set anywhere in that range.) As soon as that happens, the **brownout detector** inside the ESP32 chip restarts the board on purpose, so the chip doesn't run haywire on too little voltage. After it comes back on, Node 1 v1.0's status page shows `Restart: BROWNOUT`. If the voltage falls so far that the chip really loses power, what gets recorded is `POWERON` instead.

Where does the dip come from? The ESP32 doesn't draw current evenly. While doing ordinary work, it draws tens of mA; when Wi-Fi sends data, the current jumps to **hundreds of mA** for a very short time. Every part along its power path has a little resistance: a long, thin cable, a loose connection, the diode, and the regulator. Remember Ohm's law from Module 2: the bigger the current, the more voltage each resistance "eats". If the total is big enough, the voltage left for the chip falls below the limit.

![Diagram of a brownout: every resistance along the way eats a little voltage, and the bigger the current, the more voltage is lost along the way; the numbers are only examples; a red band marks the brownout limit of about 2.4 to 2.8 volts. Left: a good adapter, a short cable, a normal current: the charger at 5 volts, 4.95 volts after the cable (0.05 less), 4.65 volts after the diode (0.3 less), then the regulator gives the ESP32 chip 3.3 volts; a check mark, stays at 3.3 volts, safe. Right: a weak source, a long cable, a current surge: the charger at 4.6 volts, 3.9 volts after the cable (0.7 less), 3.5 volts after the diode (0.4 less), then the regulator can only give the chip 2.3 volts, below the red band; a cross, drops below the limit, the board restarts. Bottom: the three cures: 1, a strong source and cable (an adapter of at least 1 ampere, a short cable; the MT3608 set to 5.0 volts); 2, separate the loads (the relays, the pump, and the servo stay on the MB102); 3, a 100-microfarad capacitor as a small reservoir where the power comes in](assets/brownout-staircase.png)

There are three cures, starting with the most important:

1. **A strong source and cable.** An adapter of at least 1 A, a good short cable, and tight connections. For a battery: the MT3608 is set to 5.0 V so the regulator has breathing room (Concepts 1 and 7).
2. **Separate the loads.** The relays, the pump, and the servo stay on the MB102 (golden rule number 1), so their current surges don't pass through the ESP32's path.
3. **A buffer capacitor.** A 100 µF electrolytic capacitor near where the power comes in works like a "small reservoir" (Module 5): when the current briefly surges, the capacitor chips in from its stored charge, so the voltage doesn't have time to dip. In Practice 5, we connect it to the MT3608's output.

> [!WARNING]
> **Don't turn off the brownout detector.** The internet is full of "cures" in the form of a single line of code that turns this detector off. The result: the ESP32 does stop restarting, but it keeps running on too little voltage: memory contents can get corrupted, data going to flash can be written only halfway, and its behavior becomes random. That's like pulling out a smoke alarm because it's noisy. Find and fix the cause of the voltage dip.

> ➡️ **Ready to practice?** Continue to [Practice 1 — Node 1 without a laptop](#practice-1--node-1-without-a-laptop-its-own-adapter-20-minutes). When you're done, come back to [Concept 4](#4-sleep-active-light-sleep-and-deep-sleep).

### 4. Sleep: active, light sleep, and deep sleep

> ⬆️ **Just finished Practice 1?** Node 1 can now run without a laptop. The next two concepts prepare a device that runs on a battery: how it **sleeps**, and what it **remembers** while asleep.

In the Quick Win, the ESP32 slept for 5 seconds and then woke up by itself. In fact, the ESP32 has several levels of sleep. Picture an office worker:

- **Active**: they're working hard at their desk. All the lights and computers are on.
- **Light sleep**: they take a nap in their chair. All the papers on the desk stay where they are, and as soon as they're woken up, they **continue** their work right from the last sentence they wrote.
- **Deep sleep**: they go home. The desk is cleared and the office lights are turned off; all they take with them is a small **pocket notebook** and an **alarm clock**. The next morning, they start again **from the beginning**: open the office, turn on the computer, then read their pocket notebook to remember yesterday's work.

On the ESP32, that "pocket notebook" is **RTC memory** (Concept 5), and the "alarm clock" is the **timer alarm**, which keeps ticking during sleep. Starting again from the beginning means **starting again from `setup()`**, as you saw in the Quick Win.

![Illustrated table of the ESP32's sleep levels; the deeper the sleep, the less stays on; the current of the ESP32 chip alone, per its datasheet, on a scale that goes up tenfold at every line, from 0.001 to 1,000 milliamperes. Four rows. Active with Wi-Fi, like working while on the phone: the processor, RAM, Wi-Fi radio, timer alarm, and RTC memory are all on; 95 to 240 milliamperes. Active without Wi-Fi, like working at the desk: everything is on except the radio; 20 to 68 milliamperes. Light sleep, like a nap in the chair: the processor and RAM are paused with their contents kept, the radio is off, and the timer alarm and RTC memory are on; 0.8 milliamperes; after waking, the program continues on the next line. Deep sleep, like going home: the processor, RAM, and radio are off, and only the timer alarm and RTC memory are on; 0.01 milliamperes, or 10 microamperes; after waking, the program starts over from setup(). Note at the bottom: a whole DevKit V1 board uses far more power while asleep, because its regulator, LED, and USB chip don't sleep (Concept 10)](assets/sleep-levels.png)

| State | What stays on | Current of the ESP32 chip alone (per its datasheet) | After waking up, the program… |
| :--- | :--- | :--- | :--- |
| **Active with Wi-Fi** | everything, including the radio | about 95–100 mA while receiving, up to about 240 mA while transmitting | — |
| **Active without Wi-Fi** | the processor, RAM, and all the peripherals | about 20–68 mA, depending on the processor speed | — |
| **Light sleep** | RAM (its contents are kept), the timer alarm | about 0.8 mA | **continues** from the line after `esp_light_sleep_start()` |
| **Deep sleep** | only the RTC part: the timer alarm, the 8 KB of RTC memory, and the RTC pins | about 0.01 mA (10 µA) | **starts again** from the beginning of `setup()` |

These numbers are for **the ESP32 chip alone**. The DevKit V1 board has a regulator, an LED, and a USB chip that don't go to sleep, so the current of the whole board is much bigger. That's what you measure in Practice 6 and discuss in Concept 10.

**Putting the ESP32 into deep sleep** takes just three lines, as in the Quick Win:

```cpp
Serial.flush();                                  // wait until every letter has been sent
esp_sleep_enable_timer_wakeup(30 * 1000000ULL);  // set a 30-second alarm (the unit is microseconds)
esp_deep_sleep_start();                          // sleep; the lines below it never run
```

`ULL` after a number means "calculate with a very large whole number". Without `ULL`, an alarm longer than about 35 minutes produces a number of microseconds too big for an ordinary whole number, so the alarm goes wrong.

**Light sleep** is also started with one line, `esp_light_sleep_start()`. The difference is that this line **returns** when the board wakes up, and the program continues with the next line.

**Who's allowed to wake it up?** Before sleeping, you set up one or more **wake doors** (*wake-up sources*). The ones we use this week:

| Wake door | Its function | For | Practice |
| :--- | :--- | :--- | :--- |
| **Timer alarm** | `esp_sleep_enable_timer_wakeup(microseconds)` | deep sleep and light sleep | QW, 2, 3, 4 |
| **ext0**: one RTC pin goes HIGH or LOW | `esp_sleep_enable_ext0_wakeup(pin, 0 or 1)` | deep sleep | 3 |
| **GPIO**: any pin goes HIGH or LOW | `gpio_wakeup_enable(...)` then `esp_sleep_enable_gpio_wakeup()` | light sleep | 3B |

There are other doors too, such as **ext1** (several RTC pins at once) and touch, but the timer alarm and ext0 are enough for Node 2. After waking up, `esp_sleep_get_wakeup_cause()` tells you which door opened.

**When to use which?**

- **Deep sleep** for a device that sits idle for a very long time between two short tasks, for example a garden sensor that reads the temperature anywhere from every 30 seconds to every hour. This is Node 2's pattern: **wake up → read → (later: send) → sleep**.
- **Light sleep** for short, frequent pauses, when the program has to remember a lot or has to react quickly.
- **No sleep at all** for a device that must always be ready and always gets its power from an adapter, like **Node 1**.

> [!NOTE]
> **Wokwi and sleep.** As mentioned at the start of the module, Wokwi can't simulate deep sleep yet: the simulated board restarts right away with the message `rst:0x8 (TG1WDT_SYS_RESET)`, and the contents of RTC memory are lost. Light sleep with the timer alarm can be tried (Practice 3B), but the GPIO wake door isn't simulated yet.

### 5. Three memories: RAM, RTC memory, and NVS

The worker who goes home loses what was on the desk, but still takes the pocket notebook along. The ESP32 has three places to store numbers, and each one survives different events:

- **RAM** is the **desk**. It's roomy and fast, and every ordinary variable lives here. But its contents are lost every time the board goes into deep sleep, restarts, or loses power.
- **RTC memory** is the **pocket notebook**. It's small, only **8 KB**, but it stays powered during deep sleep. Its contents are lost if the board restarts or loses power.
- **NVS** (Module 8) is the **filing cabinet** in flash memory. Its contents stay even when the power has been unplugged for days, but writing to it is slower, and flash can wear out if it's written too often.

![Illustrated table of the ESP32's three memories: the same variable, three places to keep it, which one survives what. Three columns: RAM (an ordinary variable), RTC memory (RTC_DATA_ATTR), and NVS in flash (Preferences, Module 8). Waking from deep sleep: RAM lost, RTC memory kept, NVS kept. Restart by the program (ESP.restart): RAM lost, RTC memory lost, NVS kept. EN button or power unplugged: RAM lost, RTC memory lost, NVS kept. Program uploaded again: RAM lost, RTC memory lost, NVS kept. The row for size and traits: RAM is large, about 520 kilobytes, partly used by the system, fast, with no write limit, for everyday work; RTC memory is small, 8 kilobytes, fast, with no write limit, for small things between sleeps; NVS is a flash area of about 20 kilobytes, to be written sparingly because flash can wear out, for settings and important values](assets/three-memories.png)

To move a variable into RTC memory, just add `RTC_DATA_ATTR` in front of it:

```cpp
int ramCount = 0;                 // in RAM: back to 0 every time the board wakes up from deep sleep
RTC_DATA_ATTR int rtcCount = 0;   // in RTC memory: the 0 is only used when the board has really just powered on
```

The line `RTC_DATA_ATTR int rtcCount = 0;` doesn't mean "fill it with 0 every time it wakes up". That 0 is only used once, when the board has just been powered on, restarted, or had a new program uploaded. After waking up from deep sleep, its contents are left as they are.

So when do you use which?

| Question | Store it in |
| :--- | :--- |
| Only used while the board is awake? (for example, an intermediate result) | **RAM** (an ordinary variable) |
| Needs to be remembered from one wake-up to the next, and changes on every wake-up? (for example, the number of wake-ups, the previous reading) | **RTC memory** (`RTC_DATA_ATTR`) |
| Must survive even if the battery is removed? (for example, a threshold, settings, the device name) | **NVS** (`Preferences`) |

One habit to keep: **don't write to NVS every time the board wakes up**. A board that wakes up every 30 seconds wakes up 2,880 times a day; if it writes to NVS every time, its flash wears out quickly. Keep numbers that keep changing in RTC memory, and write to NVS only when a setting really changes, following the Module 8 rule.

> ➡️ **Ready to practice?** Continue to [Practice 2 — Three memories](#practice-2--three-memories-ram-rtc-memory-and-nvs-20-minutes), then [Practice 3](#practice-3--woken-by-an-alarm-or-a-button-and-light-sleep-30-minutes) and [Practice 4](#practice-4--the-node-2-skeleton-on-the-second-board-25-minutes). After that, come back to [Concept 6](#6-the-18650-li-ion-battery-its-voltage-changes-and-its-capacity-is-often-exaggerated).

### 6. The 18650 Li-ion battery: its voltage changes, and its capacity is often exaggerated

> ⬆️ **Just finished Practice 4?** The second board now sleeps and wakes up to read the temperature, but it's still tethered to the laptop. Time to give it a battery.

The name **18650** is its size: **18** mm in diameter, **65** mm long, and the **0** means it's a cylinder. This battery is inside many power banks, flashlights, and old laptop batteries. It's a **Li-ion** (lithium-ion) battery, the same kind of rechargeable battery as a phone battery. Its positive terminal is at the **raised** end (on an unprotected battery, the bump is small, so also look for the + mark on its wrapper), and its negative terminal is at the flat end.

**Its voltage changes as it's used.** An adapter always gives 5 V, but a Li-ion battery's voltage drops slowly as its charge is used up:

| Battery state | Voltage |
| :--- | :--- |
| Full, just finished charging | **4.2 V** |
| The "nominal" voltage printed on its body | 3.6–3.7 V |
| Almost empty | about 3.3–3.4 V |
| Lower limit: must stop being used | 2.5–2.65 V, according to the battery's datasheet |

From 4.2 V down to about 3.5 V, the voltage falls slowly and gently. Below that, it drops fast. A battery that keeps being used below its lower limit can be permanently damaged, and a battery charged above 4.2 V can get hot and dangerous. That's why a Li-ion battery is **always** charged with a special charger and guarded by a **protection circuit** (Concept 7).

![Diagram of the 18650 Li-ion battery, whose voltage drops as it's used; an example curve shape at a small current. Left: an upright battery measuring 18 by 65 millimeters, with the raised plus terminal at the top and the flat minus terminal at the bottom. Right: a curve of voltage against the charge already used, from 0 to 100 percent: it starts at full, 4.2 volts, falls gently past the nominal line of 3.6 to 3.7 volts printed on the battery, then after the almost-empty line of about 3.3 to 3.4 volts it drops fast; below that is a red band with the manufacturer's lower-limit line of 2.5 to 2.65 volts and a dashed line where the protection chip cuts off, at about 2.4 volts. Bottom: honest capacity: a green bar for a genuine battery, 2,000 to 3,500 milliampere-hours, and a red-framed bar for a fake battery labeled 10,000 milliampere-hours, with an actual capacity of about 500 milliampere-hours; a note: one battery labeled 10,000 milliampere-hours held only about 500 milliampere-hours when tested, and a genuine 18650 battery weighs about 45 to 48 grams, so one that's much lighter is suspicious](assets/battery-18650.png)

**Capacity: mAh.** A number like **2,500 mAh** (milliampere-hours) shows how much charge the battery can deliver: roughly 2,500 mA for 1 hour, or 250 mA for 10 hours, or 25 mA for 100 hours. In reality, not all of it can be used, and in Concept 9 we calculate it honestly.

**Its capacity is often exaggerated.** The best 18650 batteries on sale today hold about **3,500 mAh**. In online shops, many cheap batteries are labeled 6,000, 8,800, or even 9,900 mAh. Batteries like that are **fake**. One battery labeled 10,000 mAh, for example, turned out to hold only about **500 mAh** when tested, and its quality can't be trusted either. A simple guide for buying:

- Choose a capacity of **2,000–3,500 mAh** from a known brand and a trusted shop. Careful: even well-known brands are often faked.
- Avoid used batteries taken out of laptops or power banks: their age is unknown, and they may already be damaged inside.
- A genuine 18650 battery weighs about 45–48 g. One that feels much lighter is suspicious.

The **safety rules** at the start of the module apply in full here. The three most important: never connect its two terminals directly, never use a dented or swollen battery, and always watch it while it charges.

### 7. TP4056 and MT3608: the charger and the voltage booster

An 18650 battery can't be connected straight to the ESP32. There are two problems: the battery needs to be **recharged safely**, and its voltage (3.0–4.2 V) is **too low** for the VIN pin, which needs about 4.5 V or more (Concept 1). Two small modules solve them.

![Diagram of the second board's battery power chain; each module has its own job, and every voltage is measured from the shared GND (OUT minus). Four boxes in a row with arrows. The 18650 battery stores energy: 3.0 to 4.2 volts, dropping slowly as it's used. The TP4056 with protection charges and guards, and gets a 5-volt phone charger while charging: B plus and B minus from the battery, OUT plus and OUT minus to the load; it cuts off when the battery is too empty, too full, or short-circuited; its output is a guarded 3.0 to 4.2 volts. The MT3608 boosts the voltage: VIN plus and VIN minus from the TP4056's OUT, VOUT plus and VOUT minus to the board, set to 5.0 volts with a multimeter, with no load; its output is 5.0 volts. The second board wakes, reads, and sleeps: VIN to the AMS1117 regulator, then 3.3 volts for the ESP32, and the board's USB is unplugged while it runs on battery. Notes at the bottom: 1, the current on the battery side is about 1.6 times the current on the 5-volt side, because boosting the voltage takes more current, plus a little power that turns into heat (efficiency about 85 percent); 2, the whole circuit's GND is taken from OUT minus, because B minus is only for the battery, and between B minus and OUT minus sits the protection chip's switch; 3, the 3V3 pin never gets battery voltage, because a full battery is 4.2 volts, while the ESP32 chip only handles up to 3.6 volts](assets/battery-power-chain.png)

The **TP4056 with protection** is the battery's **charger** and its **guard** at the same time. This 6-pad module carries two parts:

- **The TP4056 chip, the charger.** It receives 5 V from its USB port, then charges the battery in two stages: first with a constant current, about 1 A on most modules; once the battery reaches 4.2 V, the voltage is held steady while the current shrinks by itself. When the current is down to a tenth, charging is finished. A **red** light means it's charging, and a **blue** light (green on some modules) means it's full.
- **The protection chip, the guard** (usually a DW01A together with its switch chip, the 8205A). It disconnects the battery from the load if the voltage falls below about **2.4 V** (too empty) or if the current goes above about **3 A**, for example because of a short circuit, and it stops the charging if the voltage goes past about **4.3 V** (too full).

Its pads come in three pairs:

| Pads | Where to | Notes |
| :--- | :--- | :--- |
| **IN+ / IN−** | 5 V power for charging | We just use its USB port; these two pads aren't connected. |
| **B+ / B−** | the battery terminals | The battery holder's red wire to B+, the black wire to B−. |
| **OUT+ / OUT−** | the load (here: the MT3608) | **The load is always taken from OUT**, because only this path is guarded by the protection chip. |

One small but important thing: **B− isn't the same as OUT−**. Between them sits the protection chip's "switch". That's why **the whole circuit's GND is taken from OUT−**, not from B−. The battery's black wire goes only into B−.

> [!CAUTION]
> **The 4-pad version of the TP4056** (only IN and B, no OUT) has no protection chip. Don't use it for this circuit.

The TP4056 feels **warm to hot** while charging, because the extra voltage between 5 V and the battery's voltage is thrown away as heat. That's normal for the module, as long as it sits on a surface that doesn't burn easily and isn't touched. What must not get hot is the **battery** (safety rule number 4). Charging a 2,500 mAh battery from empty to full takes about 3 hours.

**Two good habits.** First, **disconnect the load while charging** (unplug the second board's VIN wire): the TP4056 decides the battery is full when the charging current is down to a tenth, and a load that draws current at the same time can throw that calculation off. Second, **recharge before the battery runs out**. The MT3608 keeps putting out 5.0 V until the protection chip cuts off at about 2.4 V, a little below the lower limit that battery makers recommend (2.5–2.65 V). That means the second board only stops working after the protection has cut off. So recharge the battery before the battery life you calculated (Concept 9 and Practice 6) has passed, and if the second board has already stopped, recharge it that same day: don't leave it empty for days.

**The MT3608 is a voltage booster** (a *boost converter*). It turns the battery's changing voltage (3.0–4.2 V) into a higher, steady voltage, which we set to **5.0 V**. How it works: an electronic switch inside it opens and closes about 1.2 million times per second to charge and discharge a coil, so the voltage gets "pumped" up. The output voltage is set with the blue trimmer **potentiometer** with its brass screw. Its pads are **VIN+ / VIN−** (in, from the TP4056's OUT+/OUT−) and **VOUT+ / VOUT−** (out, to the ESP32 board). VIN− and VOUT− are connected together inside the module.

Two things about the MT3608 you need to know:

- **Power can't be made out of nothing.** When the voltage is raised from 3.7 V to 5 V, the current on the battery side becomes **bigger** than the current on the 5 V side. Add a little power that's lost as heat (we estimate an efficiency of 85%), and the battery current is about **1.6 times** the current on the 5 V side. The MT3608 itself also draws about 1 mA, whatever the load. That factor of **1.6** is what we use to calculate battery life in Concept 9; just remember that 1 mA as the reason the real battery life is a little shorter.
- **It can't lower the voltage, and its factory setting is unpredictable.** Some put out only a little below the battery voltage, others much higher; this module can put out up to 28 V. That's the reason for safety rule number 5: set it to 5.0 V with a multimeter **before** it's connected to the ESP32.

The complete chain, from the battery to the chip:

| Stage | Voltage |
| :--- | :--- |
| 18650 battery | 3.0–4.2 V, dropping slowly as it's used |
| Out of the TP4056 (OUT+/OUT−) | the same as the battery, but now guarded by the protection |
| Out of the MT3608 (VOUT+/VOUT−) | **5.0 V**, steady until the protection chip disconnects the battery |
| The second board's VIN pin → the board's regulator | 3.3 V for the ESP32 chip |

Why bother raising it to 5 V, only for the board's regulator to bring it back down to 3.3 V? Because the DevKit V1 board's 5 V doors (the USB port and VIN) need about 4.5 V or more, while the 3V3 door can't handle 4.2 V (Concept 1). This approach does waste a little energy, and in Concept 10 we look at a more efficient way for real devices.

> ➡️ **Ready to practice?** Continue to [Practice 5 — The battery supply](#practice-5--build-the-battery-supply-18650--tp4056--mt3608-40-minutes). When you're done, come back to [Concept 8](#8-measuring-current-the-ina219-not-a-multimeter).

### 8. Measuring current: the INA219, not a multimeter

> ⬆️ **Just finished Practice 5?** The second board now runs on a battery. How long will the battery last? To answer that, we need to know **how much current** the board draws, while awake and while asleep.

Measuring **voltage** is easy: touch the multimeter's two probes to two points (Module 2). Measuring **current** is different: the current has to **pass through** the meter. The path is cut, and the meter is inserted into the gap, like a water meter installed in the middle of a pipe.

**Why not with a multimeter?** A cheap multimeter does have an mA setting, even a µA one, but there are three problems:

1. **Its fuse blows easily.** The mA setting is usually protected only by a 200–500 mA fuse (read the text near its jack), and some cheap multimeters have no fuse at all on that setting. A board that's awake without Wi-Fi does draw only tens of mA, but when Wi-Fi is on (from Module 10 on), the current can jump to hundreds of mA, enough to blow a fuse that small. The multimeter is then "dead" on the mA setting until the fuse is replaced.
2. **The multimeter itself gets in the way.** To measure current, a multimeter inserts a resistance into the path. On the **2000µ** setting (2,000 µA), a cheap multimeter inserts about 100 Ω. A 50 mA wake-up current passing through that resistance "needs" 5 V just to get through the multimeter. That much voltage isn't available, so the board runs short of voltage, restarts, and the measurement is a mess (Concept 3).
3. **Too slow for a current that goes up and down.** A board that wakes for about 1 second and then sleeps for 30 seconds switches its current quickly. The number on the multimeter's display jumps around, and you can't work out its average.

On top of that, a multimeter on a current setting that's accidentally touched to the battery's two terminals is the same as a short circuit (safety rule number 7). That's why this week the multimeter is only used to measure voltage.

The **INA219** solves all three. This small module holds a 0.1 Ω **shunt resistor** (a measuring resistor) placed in the power path, and a chip that reads the **tiny voltage** across the two ends of that resistor. Remember Ohm's law: current = voltage ÷ resistance. A 10 mA current through a 0.1 Ω resistor produces only 1 mV, and the INA219 chip can tell apart changes as small as 0.01 mV (10 µV). The result:

| | The INA219 with this module's settings |
| :--- | :--- |
| Smallest current it can tell apart | about 0.1 mA (its small readings can be off by about 0.1 mA) |
| Largest current | about 400 mA, enough for a board that's awake without Wi-Fi |
| Voltage of the line being measured | up to 16 V with this setting (the chip itself can handle up to 26 V) |
| Speed | the ESP32 can read it hundreds of times per second over I2C |
| I2C address | `0x40` |

The INA219 is connected **in series**: the power comes in through the **VIN+** pin, passes through the 0.1 Ω resistor, then goes out through the **VIN−** pin to the load. So that the INA219 can read the line's **voltage**, and so that the VIN+/VIN− pins stay within the chip's working limits, its GND must be **joined** to the GND of the circuit being measured.

**Who reads the INA219?** The Node 1 board itself. The INA219 talks over I2C (Module 7), so it just needs to be connected to the I2C bus on the Node 1 workbench with four male–female wires, in the holes the BME280 used before. The Node 1 board, plugged into the laptop, runs the meter sketch and writes the results to the Serial Monitor. Meanwhile, the second board keeps running on its own battery, and its current passes through the INA219. The INA219 itself gets its power from Node 1's 3V3 pin, so the INA219's own current (about 1 mA) isn't included in the measurement.

![Diagram of Node 1 becoming the second board's current meter. Left: the Node 1 board, on the laptop's USB with the MB102 off, running the module09_current_meter sketch and writing the current every second and a summary every cycle to the Serial Monitor; four wires to the INA219 module: SDA (D21), SCL (D22), 3.3 volts, and GND. Middle: the INA219 module at address 0x40, holding a chip that reads the tiny voltage across the two ends of the 0.1-ohm shunt resistor. The 5-volt path: from the MT3608 at 5.0 volts (from the 18650 battery) into the VIN plus pin, through the 0.1-ohm resistor, out of VIN minus to the VIN pin of the second board, which runs the Practice 4 sketch, awake 1 second and asleep 30 seconds, with its USB unplugged. A shared GND line joins the GNDs of Node 1, the INA219, the battery circuit, and the second board. Bottom: Ohm's law, current equals the voltage across the resistor divided by 0.1 ohm; for example, 10 milliamperes gives only 1 millivolt, enough for the INA219 to read](assets/current-measurement-ina219.png)

The INA219 has its limits too. The sleep current of a bare ESP32 chip is only about 0.01 mA (10 µA), far below the 0.1 mA the INA219 can tell apart. For the DevKit V1 board, whose sleep current is a few mA (Concept 10), the INA219 is more than enough. Tools for measuring µA accurately are covered in 🔬.

### 9. Calculating battery life

The second board takes turns **waking briefly** (a big current) and **sleeping for a long time** (a small current). To calculate the battery life, we need the **average current** over one wake–sleep cycle, then we work out how long the battery can supply it.

![Diagram of calculating battery life, with example numbers for practice. Top: a graph of the second board's current on the 5-volt side over two cycles, with widths not to scale: a 55-milliampere wake-up spike for 1 second, then 5 milliamperes of sleep for 30 seconds. Next to it, one cycle of 31 seconds: awake, 55 milliamperes times 1.0 seconds equals 55; asleep, 5 milliamperes times 30 seconds equals 150; a total of 205 milliampere-seconds; a comparison bar shows that sleep accounts for 73 percent; a note: the small sleep current actually uses up most of the battery. Bottom: four steps: 1, the average on the 5-volt side, 55 plus 150 divided by 31, about 6.6 milliamperes; 2, move to the battery side, 6.6 times 1.6, about 10.6 milliamperes; 3, usable capacity, 2,500 milliampere-hours times 0.8 equals 2,000 milliampere-hours; 4, battery life, 2,000 divided by 10.6, about 189 hours, or about 7.9 days. Notes: 1.6 because the MT3608 boosts the voltage with an efficiency of about 85 percent, and the MT3608 itself draws about 1 milliampere more; 0.8 because the real capacity is smaller than the number printed on the battery](assets/battery-life.png)

There are four steps. The numbers in this example are only for practice; in Practice 6, you use your own measured numbers.

**Step 1 — The average current on the 5 V side.** Multiply each current by how long it lasts, add them up, then divide by the length of one cycle:

```text
average current = (awake current × awake time + sleep current × sleep time) ÷ (awake time + sleep time)

Example: awake 55 mA for 1.0 seconds, asleep 5 mA for 30 seconds
         = (55 × 1.0 + 5 × 30) ÷ (1.0 + 30)
         = (55 + 150) ÷ 31
         ≈ 6.6 mA
```

Look at the numbers 55 and 150. **Sleep time accounts for almost three quarters** (73%) of the total use, even though the sleep current is "small". Remember this number; in Concept 10, we discuss what it means.

**Step 2 — Move to the battery side.** The INA219 measures on the 5 V side, after the MT3608. On the battery side, the current is bigger (Concept 7):

```text
battery current ≈ 5 V average current × 5 V ÷ (average battery voltage × MT3608 efficiency)
                ≈ 6.6 × 5 ÷ (3.7 × 0.85)
                ≈ 6.6 × 1.6
                ≈ 10.6 mA
```

You can use this **1.6** directly. The MT3608 itself also draws about 1 mA (Concept 7), so the real battery life is a little shorter than this calculation.

**Step 3 — The capacity you can really use.** The number on the battery is its best-case number while it's still new: the capacity drops with age and temperature, and the battery should be recharged before it's completely empty (Concept 7). Use **80%** of the printed capacity:

```text
usable capacity = 2,500 mAh × 0.8 = 2,000 mAh
```

**Step 4 — Battery life.**

```text
battery life = usable capacity ÷ battery current
             = 2,000 mAh ÷ 10.6 mA
             ≈ 189 hours
             ≈ 7.9 days
```

Only **about eight days**, even though the battery is 2,500 mAh. This is an estimate; the real battery life can be a little different because of temperature, battery quality, and a current that isn't always the same. The bonus in ➕ A invites you to prove it.

### 10. Honest about the DevKit V1: why its battery only lasts a few days

In Concept 4, an ESP32 chip in deep sleep draws only about **0.01 mA**. But a development board like the DevKit V1 in deep sleep draws about **4–5 mA**, according to several people's measurements of similar boards, and clone boards can draw even more. That's **about four hundred times** the chip's current. Where does the current go?

![Diagram, honest about the DevKit V1: the chip sleeps, the board doesn't; an ESP32 chip in deep sleep draws about 0.01 milliamperes, similar development boards measured about 4 to 5 milliamperes, and clone boards can draw more. Left: a drawing of the board with four markers on the parts that keep drawing current while the chip sleeps: 1, the AMS1117 regulator, a few milliamperes, the regulator's "running money"; 2, the red power LED, about 1.3 to 1.5 milliamperes, always on; 3, the CP2102 USB-serial chip, still powered from the 3.3-volt line; 4, the ESP32 chip, about 0.01 milliamperes, the only part that sleeps. Right: bars for the life of a 2,500 milliampere-hour battery (2,000 usable) on a scale of 0 to 60 days, when the board is awake for 1 second at 55 milliamperes, then sleeps at the board's sleep current (DevKit V1: 5 milliamperes, through the MT3608): a DevKit V1 sleeping 30 seconds, about 8 days; a DevKit V1 sleeping 5 minutes, about 10 days; a DevKit V1 that never wakes up, about 10 days at most; a low-power board (0.01 milliamperes, an efficient regulator) sleeping 30 seconds, about 47 days; a low-power board sleeping 5 minutes, months. Bottom, what it means: for the DevKit V1, sleeping longer helps only a little, because the board's sleep current sets the limit on battery life; for this curriculum, a few days is enough, because Node 2 is recharged through the TP4056's USB port; a low-power board uses an efficient regulator straight from the battery, has no always-on LED, and its USB chip switches off too (covered in the Technical Deep Dive)](assets/honest-devkit-v1.png)

| Board part | Roughly its current while the chip sleeps | Why |
| :--- | :--- | :--- |
| AMS1117 regulator | a few mA (the datasheet gives a typical 5 mA and at most 11 mA; on a real board it's usually smaller, since the whole board measures only 4–5 mA) | This kind of regulator needs a fixed amount of "running money" to work, however much current it puts out. Boards that use a different regulator can be a little more frugal. |
| Red power LED | about 1.3–1.5 mA | It stays on as long as the board has power, even while the chip sleeps. |
| USB-serial chip (CP2102) | draws current too | On the DevKit V1 board, this chip gets its power from the 3.3 V line, so it stays on even when no USB cable is plugged in. |
| ESP32 chip | about 0.01 mA | This is the only part that really sleeps. Its flash memory is switched off too during deep sleep. |

The DevKit V1 board is designed for **learning and experimenting**: plug it into the laptop, upload a program, see the result. That convenience is paid for with a big sleep current. As a result:

- **Sleeping longer doesn't help much.** In the Concept 9 example, sleep already accounts for almost three quarters of the use. If the board wakes up every 5 minutes, ten times less often, its average current only drops from about 6.6 mA to about 5.2 mA, and the battery life only grows from about 8 days to about 10 days. However long it sleeps, this board can't last more than about 10 days: its sleep current alone (5 mA × 1.6 = 8 mA on the battery side) uses up 2,000 mAh in 250 hours.
- **What decides it is the board's sleep current.** If the whole board's sleep current really were 0.01 mA, with an efficient regulator taking its power straight from the battery (no MT3608), the same example (awake 1 second every 30 seconds) would last more than a month, and waking every 5 minutes, months.

So what does this mean for Node 2?

1. **For this curriculum, the DevKit V1 is good enough.** Node 2 in Module 14 may run on its battery for a few days, then be recharged through the TP4056's USB port. Our goal is to understand the low-power pattern, and that pattern is exactly the same on any board.
2. **For a real device that has to last for months,** use a board designed for low power (a regulator with very little "running money", no always-on LED, and a USB chip that switches off when the board runs on battery), or a bare ESP32 module without a development board. Examples are covered in 🔬, along with a small solar panel.
3. **Don't take a shortcut by feeding the battery straight into the 3V3 pin** to "skip" the regulator. A full battery is at 4.2 V, above the ESP32 chip's limit (Concept 1).

> ➡️ **Ready to practice?** Continue to [Practice 6 — Measuring current](#practice-6--node-1-becomes-a-current-meter-ina219-45-minutes), [Practice 7](#practice-7--power-bank-test-does-it-switch-itself-off-15-minutes), and [Practice 8](#practice-8--save-to-github-15-minutes). After that, go on to the [🧩 Independent Challenges](#-independent-challenges) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home).

## 🔧 Step-by-step practice

Eight practices, **in order**, with **two boards**:

- **The Node 1 board** is used for Practices 1–3 (the power supply and the sleep experiments) and becomes the **current meter** in Practice 6. In the ➕ section, this board goes back to running Node 1 v1.0, this time permanently from its own adapter.
- **The second board** (the future Node 2) is used from Practice 4 on: it sleeps and wakes up to read the temperature, then runs on a battery (Practice 5).

These two parts are completion requirements (Practice 6 is marked ⭐ in the table of contents):

1. **Practice 6** — the battery sketch's sleep current measures **less than 15 mA**, and you calculate its estimated battery life yourself.
2. **Section ➕ A** — Node 1 runs for **24 hours from an adapter** (not from a laptop) without a restart.

Practices 1–3 don't need any new parts. Practice 4 needs the second ESP32 board and three female–female jumper wires (see the **Shopping for this week** box). Practices 5–6 need the battery, the TP4056, the MT3608, the INA219, and the mini breadboard. If the parts haven't arrived yet, do Practices 1–4 first.

### Practice 1 — Node 1 without a laptop: its own adapter (20 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE**, the complete Node 1 workbench, a **5 V phone charger** (at least 1 A) with a USB cable for the Node 1 board, the MB102's adapter as usual, and a piece of masking tape for labels. Concepts used: 1, 2, and 3.

This practice is a dress rehearsal: Node 1 runs from the charger, its loads are tried out, then the board goes back to the laptop for Practices 2–3. The permanent setup is in section ➕ A, after all the practices are done.

#### 1.1 Put the Node 1 v1.0 firmware back

The Quick Win overwrote Node 1's program. Put Node 1 v1.0 back on the same way as in Module 8:

1. Make sure the **MB102 is off**, then plug the Node 1 board into the laptop.
2. In Arduino IDE, open **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home** → `node-1-home.ino`. All 24 of its tabs open with it.
3. Select the Node 1 board's port, click **Upload**, and wait for `Done uploading`.

#### 1.2 Get the charger ready and label the cables

1. Plug the phone charger into a wall outlet, as close as possible to the MB102's adapter. If you use a power strip, plug both into the same strip.
2. Stick a masking-tape label that says **ESP32** on the Node 1 board's USB cable, and one that says **MB102** on the MB102 adapter's A–A cable. These little labels keep the cables from getting swapped when you're in a hurry: the MB102's cable must never go into the ESP32 board, and vice versa.

#### 1.3 Move from the laptop to the charger

Follow the order of the golden rules from Module 5: **turn off the loads first, turn on the loads last**.

1. Make sure the **MB102 is off**.
2. Unplug the Node 1 board's USB cable from the laptop, then plug the same end into the **charger**. Node 1's status LED starts its heartbeat, and the OLED display turns on.
3. **Only now** turn on the MB102. If you have a regulated microSD module connected, press **EN** now (Module 7), before writing down the numbers in step 4.
4. Hold the D13 button for 1 second to open the status page. Write down the **`Boot #`** number, then check the **`Restart:`** line: it must say `POWERON`.

#### 1.4 Try all the loads

1. **Press the button briefly**: the lamp relay goes "click" and its indicator LED lights up. Press once more to turn it off.
2. **Lift the soil sensor into the air**: within a few seconds, the pump runs for 3 seconds (make sure the water tank has water in it and the hose points into the plant glass or back into the tank). Stick the sensor back into the moist soil.
3. Hold the button again to open the status page. **`Boot #` must be the same** as in your notes, and **`Restart:` must still be `POWERON`**.

**Expected output:** Node 1 works exactly as it did when connected to the laptop. The pump and the relay don't make the ESP32 restart, because the loads take their power from the MB102, while the ESP32 has its own charger. If the `Boot #` number goes up or `Restart:` shows `BROWNOUT`, open "Node 1 restarts when the pump turns on" in 🚨.

#### 1.5 Back to the laptop

Practices 2–3 use the Node 1 board and the Serial Monitor, so move the board back to the laptop in the reverse order: **turn off the MB102**, unplug the ESP32 cable from the charger, then plug it into the laptop.

#### 1.6 Inside the steps

- **The charger only replaces the laptop.** Its cable still goes into the board's USB port, not into the VIN pin and not into the MB102. The ESP32's power path doesn't change at all, so all the golden rules from Module 5 still apply (Concept 1).
- **Two adapters, two paths.** The current surges of the pump and the servo are handled by the MB102's adapter, while the ESP32 stays calm on its own path. That's why the ESP32 doesn't get a brownout (Concept 3).
- **The status page is Node 1's "black box".** Without a laptop, the Serial Monitor can't be opened, but `Boot #` and `Restart:` still record what happened. In section ➕ A, those two lines are your evidence for the 24-hour test.

> ⬆️ **Done with Practice 1?** Go back to [Concept 4](#4-sleep-active-light-sleep-and-deep-sleep) (the ➡️ at the end of Concept 5 will take you to Practice 2).

### Practice 2 — Three memories: RAM, RTC memory, and NVS (20 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor**, the **Node 1 board** on the laptop with the **MB102 turned off**, and the D4 status LED and D13 button that are already connected. Concepts used: 4 and 5.

This sketch makes the board sleep for 5 seconds over and over, and every time it wakes up, it adds 1 to **three counters** kept in three different places. Let's see which counter survives a sleep, a restart, and a power cut.

1. Create a new sketch named `module09_three_memories`, paste this code, then click **Upload**:

   ```cpp
   // Module 9 - Practice 2: the ESP32's three memories (RAM, RTC memory, and NVS) through deep sleep
   // Circuit: status LED on D4 and a button on D13 (its opposite leg to GND), same as the Quick Win.
   // The board wakes up every 5 seconds and adds 1 to three counters. To restart, hold the D13 button
   // until the LED lights up, wait a moment, then let go.

   #include <Preferences.h>

   const int PIN_STATUS_LED = 4;
   const int PIN_BUTTON = 13;
   const unsigned long SLEEP_SECONDS = 5;

   int ramCount = 0;                // an ordinary variable: kept in RAM
   RTC_DATA_ATTR int rtcCount = 0;  // kept in RTC memory: survives deep sleep
   Preferences archive;             // NVS from Module 8: survives even when the power goes out

   // A short name for the board's last reset reason (like Node 1 v1.0).
   const char* reasonName() {
     esp_reset_reason_t reason = esp_reset_reason();
     if (reason == ESP_RST_POWERON) {
       return "POWERON";  // just powered on, EN button pressed, or a program has finished uploading
     }
     if (reason == ESP_RST_SW) {
       return "SW";  // the program itself asked for a restart
     }
     if (reason == ESP_RST_DEEPSLEEP) {
       return "DEEPSLEEP";  // woke up from deep sleep
     }
     return "OTHER";
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);
     pinMode(PIN_BUTTON, INPUT_PULLUP);

     ramCount++;
     rtcCount++;
     archive.begin("module09", false);
     int nvsCount = archive.getInt("count", 0) + 1;
     archive.putInt("count", nvsCount);
     archive.end();

     Serial.printf("RAM: %d   RTC: %d   NVS: %d   (reset reason: %s)\n", ramCount, rtcCount, nvsCount, reasonName());

     digitalWrite(PIN_STATUS_LED, HIGH);  // the LED is on for 1 second: your chance to hold the button
     delay(1000);
     bool buttonHeld = (digitalRead(PIN_BUTTON) == LOW);
     digitalWrite(PIN_STATUS_LED, LOW);

     if (buttonHeld) {
       Serial.println("Button held: restarting now.");
       Serial.flush();
       ESP.restart();  // a restart by the program, much like pressing the EN button
     }

     Serial.flush();
     esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Never runs (see the Quick Win).
   }
   ```

2. Open the **Serial Monitor** (**115200 baud**) and wait for three or four wake-ups. The D4 LED lights up for 1 second every time the board wakes up.
3. **A restart by the program:** press and **hold** the D13 button until the LED lights up, wait until `Button held: restarting now.` appears, then let go **right away**. If the button is still held when the board comes back on, the board restarts once more, and your NVS number jumps further than in the example.
4. **The EN button:** wait for two more wake-ups, then press the **EN** button on the ESP32 board.
5. **Power unplugged:** unplug the USB, wait 5 seconds, plug it back in, then reopen the Serial Monitor if needed.

**Expected output** (example output on a real board; ROM lines not shown):

```text
RAM: 1   RTC: 1   NVS: 1   (reset reason: POWERON)
RAM: 1   RTC: 2   NVS: 2   (reset reason: DEEPSLEEP)
RAM: 1   RTC: 3   NVS: 3   (reset reason: DEEPSLEEP)
Button held: restarting now.
RAM: 1   RTC: 1   NVS: 4   (reset reason: SW)
RAM: 1   RTC: 2   NVS: 5   (reset reason: DEEPSLEEP)
RAM: 1   RTC: 3   NVS: 6   (reset reason: DEEPSLEEP)
RAM: 1   RTC: 1   NVS: 7   (reset reason: POWERON)
```

The last line comes from the EN button. After the power is unplugged and plugged back in (step 5), the result is the same: `RTC` goes back to 1, while `NVS` keeps counting. The first line after plugging back in has often gone by before the Serial Monitor reconnects; wait for the next line 5 seconds later, or press **EN**.

Your NVS number may be bigger if this sketch has run before. Compare your results with this table, copy the table into your notes (`notes-module09.md` in the `module-09` folder), then compare it with Concept 5:

| Event | RAM | RTC memory | NVS |
| :--- | :---: | :---: | :---: |
| Waking from deep sleep | back to 1 | **continues** | **continues** |
| Restart by the program (`ESP.restart()`) | back to 1 | back to 1 | **continues** |
| EN button or power unplugged | back to 1 | back to 1 | **continues** |
| Program uploaded again | back to 1 | back to 1 | **continues** |

#### 2.1 Inside the code

- **`int ramCount = 0;`** is an ordinary variable. Every time the board wakes up, the program starts from the beginning, and this line fills it with 0 again. That's why `RAM` is always 1.
- **`RTC_DATA_ATTR int rtcCount = 0;`** is kept in RTC memory. The 0 there is only used when the board has **really just powered on**. After waking up from deep sleep, its contents are left as they are.
- **`archive.getInt("count", 0) + 1`** and then **`archive.putInt(...)`** are NVS from Module 8. This time we write to NVS every 5 seconds **on purpose**, for the experiment. For a real program, remember the Module 8 rule: write to NVS only when its contents change, and don't keep writing to it nonstop for days. When you're done, move on to Practice 3 so that this sketch doesn't keep running.
- **`reasonName()`** reads why the board last started with `esp_reset_reason()`, like Node 1 v1.0's status page (Module 8): `POWERON` (just powered on, or the EN button), `SW` (a restart by the program), and `DEEPSLEEP` (woke up from deep sleep).
- **`delay(1000)` while the LED is on** gives you 1 second to hold the button. The Module 8 rule "no `delay()` in `loop()`" applies to devices that must always be ready, like Node 1. A board that lives from one sleep to the next only works briefly and then sleeps again, so a short pause in `setup()` hurts no one.

> ➡️ **Done with Practice 2?** Continue to [Practice 3](#practice-3--woken-by-an-alarm-or-a-button-and-light-sleep-30-minutes).

### Practice 3 — Woken by an alarm or a button, and light sleep (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor**, the **Node 1 board** on the laptop with the **MB102 turned off**, the D4 LED, and the D13 button. Part 3B (light sleep with the timer alarm) can also be tried in Wokwi with the [`diagram.json`](code/module09_light_sleep/diagram.json) of Module 8's small circuit. Concepts used: 4.

#### 3.1 Two wake doors: the timer alarm and the button

1. Create a new sketch named `module09_button_wake`, paste this code, then click **Upload**:

   ```cpp
   // Module 9 - Practice 3: woken by the timer alarm OR by the button
   // Circuit: status LED on D4 and a button on D13 (its opposite leg to GND).
   // The board sleeps 20 seconds. Press the D13 button any time to wake it up sooner.

   #include "driver/rtc_io.h"  // controls the RTC pins: the pins that stay "awake" during deep sleep

   const int PIN_STATUS_LED = 4;
   const gpio_num_t PIN_WAKE_BUTTON = GPIO_NUM_13;  // D13 is an RTC pin, so it can wake the board up
   const unsigned long SLEEP_SECONDS = 20;

   RTC_DATA_ATTR int wakeCount = 0;
   RTC_DATA_ATTR int buttonWakeCount = 0;

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);
     rtc_gpio_deinit(PIN_WAKE_BUTTON);  // turn D13 back into an ordinary pin after sleeping
     pinMode(PIN_WAKE_BUTTON, INPUT_PULLUP);

     wakeCount++;
     esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
     Serial.print("Wake #");
     Serial.print(wakeCount);
     if (cause == ESP_SLEEP_WAKEUP_EXT0) {
       buttonWakeCount++;
       Serial.println(": woken by the BUTTON.");
     } else if (cause == ESP_SLEEP_WAKEUP_TIMER) {
       Serial.println(": woken by the timer alarm.");
     } else {
       Serial.println(": just powered on.");
     }
     Serial.print("Button wake-ups so far: ");
     Serial.print(buttonWakeCount);
     Serial.println(".");

     digitalWrite(PIN_STATUS_LED, HIGH);
     delay(500);
     digitalWrite(PIN_STATUS_LED, LOW);

     // First wait until the button is released. If it is still pressed when the board sleeps, it wakes up again at once.
     while (digitalRead(PIN_WAKE_BUTTON) == LOW) {
       delay(10);
     }
     delay(50);  // wait for the button bounce to settle, so the board doesn't wake up again at once

     Serial.printf("Sleeping for %lu seconds. Press the button to wake it up sooner.\n", SLEEP_SECONDS);
     Serial.flush();
     esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);  // wake door 1: the timer alarm
     esp_sleep_enable_ext0_wakeup(PIN_WAKE_BUTTON, 0);           // wake door 2: D13 goes LOW
     rtc_gpio_pullup_en(PIN_WAKE_BUTTON);   // make sure D13's pull-up stays on during sleep
     rtc_gpio_pulldown_dis(PIN_WAKE_BUTTON);
     esp_deep_sleep_start();
   }

   void loop() {
     // Never runs.
   }
   ```

2. Open the **Serial Monitor**. The board sleeps for 20 seconds each time.
3. While the board is asleep, **briefly press the D13 button**. The board wakes up right away with the message `woken by the BUTTON.` After that, don't touch the button: 20 seconds later, the alarm wakes it up.

**Expected output** (example output on a real board; ROM lines not shown):

```text
Wake #1: just powered on.
Button wake-ups so far: 0.
Sleeping for 20 seconds. Press the button to wake it up sooner.
Wake #2: woken by the BUTTON.
Button wake-ups so far: 1.
Sleeping for 20 seconds. Press the button to wake it up sooner.
Wake #3: woken by the timer alarm.
Button wake-ups so far: 1.
Sleeping for 20 seconds. Press the button to wake it up sooner.
```

#### 3.2 Inside the code

- **`esp_sleep_enable_ext0_wakeup(PIN_WAKE_BUTTON, 0)`** sets up the second wake door: "wake me up when D13 goes LOW". This door is called **ext0** (*external 0*), and it can only be set up on an RTC pin, a pin that stays "awake" during sleep. D13 is an RTC pin, so Node 1's button can be used right away.
- **`rtc_gpio_pullup_en(...)`**: makes sure D13 stays pulled up to HIGH by the RTC version of the pull-up during sleep. On the classic ESP32 (the chip on the DevKit V1, Module 5), `INPUT_PULLUP` from `pinMode()` actually turns on that same pull-up already, but Espressif's official example still sets it up itself before sleeping, to be sure: a floating D13 pin can make the board wake up by itself without the button being pressed. As soon as the board wakes up, **`rtc_gpio_deinit(...)`** turns D13 back into an ordinary pin so that `digitalRead()` can read it again.
- **`esp_sleep_get_wakeup_cause()`** answers who woke it up: `ESP_SLEEP_WAKEUP_EXT0` (the button), `ESP_SLEEP_WAKEUP_TIMER` (the alarm), or something else (just powered on).
- **Waiting for the button to be released before sleeping** matters. If the button is still pressed when the board goes to sleep, the ext0 door opens right away and the board wakes up again nonstop. After the button is released, the sketch waits another 50 ms so the button's bounce (Module 8) settles first.

#### 3.3 Part B: light sleep

Now compare that with light sleep. This part can be done on the Node 1 board or in Wokwi (a new ESP32 project, with the `diagram.json` of the [small circuit](code/module09_light_sleep/diagram.json)).

1. Create a new sketch named `module09_light_sleep`, paste this code, then click **Upload** (or **▶** in Wokwi):

   ```cpp
   // Module 9 - Practice 3 (part B): light sleep, the sleep that forgets nothing
   // Circuit: a button on D13 (its opposite leg to GND), same as Practice 3.
   // The board sleeps lightly for 3 seconds, then CONTINUES from the next line. The button can wake it up too.

   const gpio_num_t PIN_WAKE_BUTTON = GPIO_NUM_13;
   const unsigned long SLEEP_SECONDS = 3;

   int ramCount = 0;  // an ordinary variable in RAM: this time it is NOT lost

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_WAKE_BUTTON, INPUT_PULLUP);
     Serial.println("Practice 3B - light sleep: the RAM contents and the millis() clock are kept.");

     esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);  // wake door 1: the timer alarm
     gpio_wakeup_enable(PIN_WAKE_BUTTON, GPIO_INTR_LOW_LEVEL);   // wake door 2: D13 goes LOW
     esp_sleep_enable_gpio_wakeup();
   }

   void loop() {
     ramCount++;
     Serial.printf("Pass %d, millis() = %lu ms. Light sleep...\n", ramCount, millis());
     Serial.flush();           // send every letter first; during light sleep, Serial stops too
     esp_light_sleep_start();  // light sleep; as soon as it wakes up, the program CONTINUES with the line below

     if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_GPIO) {
       Serial.println("Woken by the button.");
       while (digitalRead(PIN_WAKE_BUTTON) == LOW) {  // wait until the button is released, so it doesn't wake up again at once
         delay(10);
       }
       delay(50);  // wait for the button bounce to settle
     }
   }
   ```

2. Open the **Serial Monitor**. On the real board, press the D13 button now and then while the board is asleep.

**Expected output** in Wokwi (without the button):

```text
Practice 3B - light sleep: the RAM contents and the millis() clock are kept.
Pass 1, millis() = 514 ms. Light sleep...
Pass 2, millis() = 3527 ms. Light sleep...
Pass 3, millis() = 6532 ms. Light sleep...
Pass 4, millis() = 9538 ms. Light sleep...
Pass 5, millis() = 12545 ms. Light sleep...
Pass 6, millis() = 15552 ms. Light sleep...
```

Three things that differ from deep sleep:

- **No ROM lines and no `setup()` again.** The program **continues** from the line after `esp_light_sleep_start()`, then `loop()` goes around as usual.
- **`ramCount` keeps going up** (1, 2, 3, …): the contents of RAM are kept during light sleep.
- **`millis()` keeps running during sleep**: each pass adds about 3,000 ms, matching the sleep time.

On the real board, pressing the button wakes the board up sooner with the message `Woken by the button.` For light sleep, the door is different: `gpio_wakeup_enable()` and `esp_sleep_enable_gpio_wakeup()` can use any pin, not just an RTC pin. **In Wokwi, this button door isn't simulated yet**: pressing the green button doesn't wake the board; only the timer alarm works.

> ➡️ **Done with Practice 3?** Continue to [Practice 4](#practice-4--the-node-2-skeleton-on-the-second-board-25-minutes).

### Practice 4 — The Node 2 skeleton on the second board (25 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor**, the **second board** (the future Node 2) plugged into the laptop, the waterproof DS18B20 + its adapter module, and 3 **female–female** jumper wires. The second board isn't placed on a breadboard: the female ends plug straight onto the board's pins. Concepts used: 4 and 5.

The Node 1 board may stay plugged into the laptop; this week your laptop really does serve two boards. What matters is that you **select the right port** every time you upload (Module 2).

1. **Connect the DS18B20 to the second board** (the board isn't plugged into anything yet):

   | DS18B20 adapter module pin | Wire (female–female) | Second board pin |
   | :--- | :--- | :--- |
   | **VCC** | orange | **3V3** (right row, at the very bottom) |
   | **GND** | black | **GND** (right row, just above 3V3) |
   | **DAT** | purple | **D27** (left row, the 10th pin from the top) |

   Here "left" and "right" are seen from above, with the antenna at the top and the USB port at the bottom, like the pin map picture in Module 5. Remember Module 7: the DS18B20 gets **3.3 V**, not 5 V. The 4.7 kΩ pull-up resistor is already on its adapter module. D27 is Node 2's DS18B20 pin according to `PIN-MAP.md`.

2. Plug the **second board** into the laptop. In Arduino IDE, create a new sketch named `module09_node2_skeleton`, paste this code, select the **second board's port** (the port that newly appears in the list after the second board is plugged in; the Node 1 board's port was already there), then click **Upload**:

   ```cpp
   // Module 9 - Practice 4: the Node 2 "Garden" skeleton - wake up, read the temperature, sleep 30 seconds
   // The SECOND ESP32 board (the future Node 2), as in the Node 2 section of PIN-MAP.md:
   //   DS18B20 + its adapter module: VCC to 3V3, GND to GND, DAT to D27. It gets 3.3 V, NOT 5 V.
   //   The board's built-in blue LED (GPIO 2) is on while the board is awake.
   // Libraries: OneWire 2.3.8 and DallasTemperature 4.0.6 (already installed in Module 7).

   #include <OneWire.h>
   #include <DallasTemperature.h>

   const int PIN_AWAKE_LED = 2;                    // built-in blue LED: the "awake" indicator
   const int PIN_ONE_WIRE = 27;                    // Node 2's 1-Wire bus: DS18B20
   const unsigned long SLEEP_SECONDS = 30;

   RTC_DATA_ATTR int wakeCount = 0;                // RTC memory: survives deep sleep
   RTC_DATA_ATTR float previousTemperature = NAN;  // the reading from the previous wake (NAN = none yet)

   OneWire oneWire(PIN_ONE_WIRE);
   DallasTemperature tempSensors(&oneWire);

   void setup() {
     pinMode(PIN_AWAKE_LED, OUTPUT);
     digitalWrite(PIN_AWAKE_LED, HIGH);
     Serial.begin(115200);
     wakeCount++;

     tempSensors.begin();
     tempSensors.requestTemperatures();                    // measure now: up to 750 ms
     float temperature = tempSensors.getTempCByIndex(0);   // -127 if the sensor does not answer

     Serial.print("Wake #");
     Serial.print(wakeCount);
     if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
       Serial.print(" (timer). ");
     } else {
       Serial.print(" (just powered on). ");
     }
     if (temperature == DEVICE_DISCONNECTED_C) {
       Serial.println("DS18B20 unreadable: check the DAT wire to D27, VCC to 3V3, and GND.");
     } else {
       Serial.printf("Temperature %.1f C", temperature);
       if (!isnan(previousTemperature)) {
         Serial.printf(" (previous wake %.1f C)", previousTemperature);
       }
       Serial.println(".");
       previousTemperature = temperature;
     }

     Serial.printf("Awake for %lu ms. Sleeping for %lu seconds.\n", millis(), SLEEP_SECONDS);
     Serial.flush();
     digitalWrite(PIN_AWAKE_LED, LOW);
     esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Never runs: Node 2 always starts from setup() every time it wakes up.
   }
   ```

3. Open the **Serial Monitor** for the second board's port. The **board's built-in blue LED** (GPIO 2) lights up for about 1 second every time the board wakes up, then goes out while the board sleeps for 30 seconds.

**Expected output** (example output on a real board; ROM lines not shown):

```text
Wake #1 (just powered on). Temperature 27.4 C.
Awake for 806 ms. Sleeping for 30 seconds.
Wake #2 (timer). Temperature 27.4 C (previous wake 27.4 C).
Awake for 801 ms. Sleeping for 30 seconds.
Wake #3 (timer). Temperature 27.6 C (previous wake 27.4 C).
Awake for 802 ms. Sleeping for 30 seconds.
```

Hold the probe's steel tip in your hand for a moment: the temperature goes up on the next wake-up, and you can see the previous reading next to it.

#### 4.1 Inside the code

- **This is the pattern of every battery-powered sensor:** wake up → do the work as fast as possible → sleep. All the work is in `setup()`, and `loop()` is left empty.
- **`previousTemperature` in RTC memory** lets the board "remember" the reading from the previous wake-up without writing to NVS. In Module 14, the same trick is used to keep small things between two wake-ups, for example the ESP-NOW radio channel.
- **`requestTemperatures()` waits up to 750 ms**, the time the DS18B20 needs to measure at full resolution (Module 7). That's most of the "Awake for 800-something ms". The shorter the board stays awake, the longer its battery lasts (Concept 9).
- **The blue LED on GPIO 2** is turned on at the start and turned off before sleeping, on purpose. Later, when the board runs on a battery without a laptop, this LED is the only sign that the board is still waking up regularly.
- **`Awake for … ms`** is calculated from `millis()`, which starts from 0 every time the board wakes up from deep sleep.

Leave the second board running this sketch: Practices 5 and 6 use it. **Unplug the second board's USB from the laptop** before you go on, but leave the three DS18B20 wires connected.

> ⬆️ **Done with Practice 4?** Go back to [Concept 6](#6-the-18650-li-ion-battery-its-voltage-changes-and-its-capacity-is-often-exaggerated) (the ➡️ at the end of Concept 7 will take you to Practice 5).

### Practice 5 — Build the battery supply: 18650 → TP4056 → MT3608 (40 minutes)

> 🖥️ **Tools and parts:** the mini breadboard, the 18650 battery and its holder, the TP4056 module with protection, the MT3608 module, the 100 µF electrolytic capacitor, the **multimeter** on **V⎓ 20** and the small screwdriver, a phone charger with a cable that fits the TP4056's port, about 10 **male–female** jumper wires and 2 short **male–male** wires as spare wires (multimeter test points), and the **second board**, still running the Practice 4 sketch (the DS18B20 stays connected). Also set aside **1–3 hours** for charging the battery in 5.3, which must be watched. Concepts used: 1, 3, 6, and 7.

Before you start, read the **Safety rules this week** box at the start of the module again. Work on a table that's clear of metal objects, on a surface that doesn't burn easily. **The battery only goes into its holder after its wires are connected and checked, and the TP4056 is only connected to the battery after the polarity has been proven correct.**

This picture shows the complete circuit at the end of Practice 5. The red numbers in the picture are explained in the list below it, together with their step numbers (5.2–5.7). The modules aren't plugged into the breadboard (their pins aren't spaced to match the breadboard holes); each pin is connected to the female end of a male–female wire, and the male end is then plugged into the hole named in the table.

![Illustration of the second board's battery circuit on the mini breadboard at the end of Practice 5; the top rail minus is GND, the top rail plus carries 5.0 volts from the MT3608, and the modules aren't plugged in: each of their pins gets a male–female wire. Left, the 18650 holder with the battery: a red wire from the plus terminal to 6d and a black wire from the minus terminal to 3e (marker 1). Above the breadboard, the TP4056 with its USB port facing up and its pins along the bottom: OUT minus to the top rail minus, B minus to 3c, B plus to 6c, and OUT plus to 12d. To its right, the MT3608: VIN plus to 12b, VIN minus to the top rail minus at column 10, VOUT plus (the orange wire) to the top rail plus at column 24, and VOUT minus to the top rail minus at column 26 (marker 2). Marker 3 on the top rail: set the MT3608 to 5.0 volts first. The 100-microfarad capacitor at column 20, between the plus rail and the minus rail (marker 4). Right, the second board standing upright with its USB unplugged and the DS18B20 still connected (not drawn); its left row of pins is labeled D27, GND, and VIN, its right row of pins is drawn faded with the names 3V3 and GND outside the board, and next to the USB port there's a red LED and a blue LED. VIN from the top rail plus at column 29 and GND from the top rail minus at column 28; both wires run above the breadboard without crossing (marker 5). Every module wire runs between two columns or two rows, then turns into its hole. The list at the bottom: 5.2 battery, black 3e, red 6d, B minus 3c, B plus 6c, the battery goes in last; 5.4 OUT plus 12d with VIN plus 12b, OUT minus, VIN minus, and VOUT minus to the top rail minus, VOUT plus to the top rail plus; 5.5 set the MT3608 to 5.0 volts first, measure at the top rail plus and minus; 5.6 the 100-microfarad capacitor, long plus leg to the plus rail; 5.7 the second board, VIN to the top rail plus at column 29, GND to the top rail minus at column 28](assets/battery-circuit.png)

#### 5.1 Get to know the modules

![Collage titled Get to know the battery supply parts, four photo cards; its subtitle: the real parts may look slightly different between manufacturers, so always follow the print on your module. One, a photo of a green 18650 Li-ion battery next to an ordinary AA battery on squared paper; note: 18 by 65 millimeters, 3.0 to 4.2 volts, the raised end is the plus terminal, a genuine capacity of about 3,500 milliampere-hours at most. Two, a photo of a blue TP4056 module with a micro-USB port on the left and the labels OUT plus, B plus, B minus, OUT minus at the right end; note: by the port there are plus and minus pads (IN), a red light means charging, blue or green means full, the port can be USB-C or micro-USB. Three, a photo of a blue MT3608 module labeled VOUT plus and VOUT minus on the left and VIN plus and VIN minus on the right, with a blue potentiometer with a brass screw and a coil marked 220; note: VIN from the TP4056's OUT, VOUT to the board, the brass screw sets the output voltage, the MT3608 marking is on the back. Four, a photo of a blue INA219 module with an R100 resistor and a row of pins labeled Vcc, Gnd, Scl, Sda, Vin minus, Vin plus; note: the order of the pins can differ, R100 is a 0.1-ohm resistor, I2C address 0x40, the modules in the kit are often purple](assets/meet-the-battery-parts.jpg)

*Photos from Wikimedia Commons: the 18650 and AA batteries by Lead holder (CC BY-SA 3.0), the TP4056 by -stk (cropped, CC BY-SA 4.0), the MT3608 by Ogidya (cropped, CC BY-SA 4.0), and the INA219 by oomlout (cropped, CC BY-SA 2.0); collage layout by the author. Details in [📚 Sources & Image Credits](#-sources--image-credits).*

Read the small print next to each pin of your modules. The order of the pins can differ from one seller to another, so **always follow the printed labels**, not their positions in the picture.

#### 5.2 Connect the battery side

The mini breadboard has two pairs of rails along its edges, just like a big breadboard. In this practice, we use the **top rail**: the **(−)** rail becomes **GND**, and the **(+)** rail will later carry **5.0 V** from the MT3608.

| Wire | From | To the mini breadboard | Purpose |
| :--- | :--- | :--- | :--- |
| the battery holder's black wire | the 18650 holder | **3e** | the battery's (−) terminal |
| the battery holder's red wire | the 18650 holder | **6d** | the battery's (+) terminal |
| black male–female | the TP4056's **B−** pin | **3c** | B− to the (−) terminal |
| red male–female | the TP4056's **B+** pin | **6c** | B+ to the (+) terminal |

1. Make sure the holder is still **empty** (the battery isn't in yet), then connect **only the holder's two wires**: black to **3e**, red to **6d**. While the holder is still empty, also plug the two short spare wires into **6a** and **3a**, then spread their top ends apart: they become the test points in step 3. The TP4056's B− and B+ wires are only connected after the battery's polarity has been proven correct (below).
2. Put the battery into its holder. The **raised (+) end** meets the **+** mark on the holder.
3. **Measure the battery voltage.** Check the multimeter first: the dial on **V⎓ 20**, the black probe in the **COM** jack, and the red probe in the **VΩmA** jack, not **10A** (safety rule number 7). The top ends of the two spare wires in **6a** and **3a** are now connected straight to the battery's terminals, so they **must not touch each other** (safety rule number 1). Touch the red probe to the metal end of the wire in column 6 and the black probe to the wire in column 3.

**Expected output:** between **3.0 V** and **4.2 V**. A new battery usually reads about 3.5–3.8 V. Write the number down.

- **A negative number** (for example `-3.71`)? Check your probes first: red in column 6, black in column 3. Swapped probes also make the number negative (Module 2). If they're in the right place, the battery is in backward: **take the battery out**, check the + mark on the holder and the wires in columns 3 and 6, then repeat steps 2–3. The TP4056 isn't connected yet, so nothing has been damaged.
- **0 V, or below 2.5 V?** Open "The battery reads 0 V or very low" in 🚨. Don't charge it yet.
- **Between 2.5 V and 3.0 V?** The battery is very empty, but it may still be charged. Carry on, and in 5.3 touch the battery more often.

Unplug the two spare wires from 6a and 3a again. As long as the battery is in, **columns 3 and 6 are only for the wires in the table**. The only exception is these two spare wires, **only briefly** while measuring the battery voltage (5.3 and 🚨): plug them in one at a time, keep their free ends from ever touching, then unplug them again as soon as you've read the number.

**Connect the TP4056 to the battery.** Once the number is positive and both spare wires have been unplugged: **take the battery out again**, connect the **B−** wire to **3c** and **B+** to **6c**, check once more (column **3**: the holder's black wire and B−; column **6**: the holder's red wire and B+), then put the battery back in the same way around as before.

#### 5.3 Charge the battery until it's full

1. Plug the phone charger into a wall outlet, then into the TP4056's USB port. The **red** light on the TP4056 comes on: the battery is charging.
2. **Watch over the charging** (safety rule number 4). A half-full battery needs about 1–2 hours, and an empty one about 3 hours. While you wait, you may read [Concept 8](#8-measuring-current-the-ina219-not-a-multimeter) and [Concept 9](#9-calculating-battery-life), then come back here for step 3. The ⬆️ box at the start of Concept 8 is written for those who have finished Practice 5, so ignore it for now. Touch the battery now and then: warm is still normal; **hot** means unplug the charger and open 🚨. The TP4056 module itself does get warm, even hot: don't touch it.
3. As soon as the red light goes out and the **blue** light (green on some modules) comes on, the battery is full. Unplug the charger, then measure the battery voltage again as in step 5.2.3.

**Expected output:** about **4.2 V** (usually 4.15–4.20 V; up to about 4.25 V is still normal because of the TP4056's tolerance). Write the number down in `notes-module09.md`.

#### 5.4 Connect the TP4056 to the MT3608

The capacitor and the second board are **not** connected yet in this step. The battery is already in its holder, so OUT+ and OUT− are already live: connect the wires one at a time, and plug the **MT3608's VIN+ wire into 12b last**. As soon as that wire goes in, the MT3608 starts working, and its output can be far above 5 V before it's set.

| Wire (male–female) | From the pin | To the mini breadboard | Purpose |
| :--- | :--- | :--- | :--- |
| red | TP4056 **OUT+** | **12d** | the battery output, guarded by the protection |
| black | TP4056 **OUT−** | top rail **(−)** | the whole circuit's GND |
| red | MT3608 **VIN+** | **12b** | the MT3608 takes its power from OUT+ |
| black | MT3608 **VIN−** | top rail **(−)** | GND |
| orange | MT3608 **VOUT+** | top rail **(+)** | the 5 V output (after it's set) |
| black | MT3608 **VOUT−** | top rail **(−)** | GND (already joined to VIN− inside the module) |

Nothing is connected to the TP4056's **IN+/IN−**: the power for charging comes in through its USB port.

#### 5.5 Set the MT3608 to 5.0 V, with no load

![Illustration of setting the MT3608 to 5.0 volts before the board is connected; with no load, the step 5.4 wires stay connected but aren't drawn, the second board and the capacitor aren't connected yet, and the voltage is measured at the top rail plus and minus of the mini breadboard. Top left, the MT3608 module seen from the front, with the VIN minus, VIN plus, VOUT minus, and VOUT plus pads, the blue 3296 potentiometer, and the 220 coil; the tip of a red-handled screwdriver rests on the potentiometer's brass screw, with a two-way turning arrow. Note: turn the brass screw slowly, about half a turn at a time; it turns about 15 to 25 full turns, and at either end, turning further changes nothing. Right, a yellow multimeter on the DC V 20 setting with 5.00 on its display; the black probe lead from the COM jack to the spare wire on the minus rail, and the red probe lead from the V ohm mA jack to the spare wire on the plus rail; both on a piece of the mini breadboard's top rail. Bottom left, while turning, watch the multimeter: closer to 5.0 volts, keep going the same way; farther from 5.0 volts, turn the other way; no change, keep turning patiently; 4.95 to 5.05 volts, stop and wait 10 seconds, the number must hold](assets/adjust-mt3608.png)

1. Plug the short spare wires into the top rail **(+)** and the top rail **(−)**. Touch the red probe to the (+) rail's wire and the black probe to the (−) rail's wire.
2. **Read the number first, without turning anything.** Any number may appear, from about the battery voltage to more than 20 V. If the display only shows **1** on the left (or `OL`), the voltage is above 20 V, out of range for the V⎓ 20 setting (Module 2). That's fine: in step 3, turn patiently in one direction until a number appears, and if it still shows **1** after about 25 turns, turn the other way. That's exactly why the ESP32 board must not be connected yet.
3. With the small screwdriver, turn the brass screw of the MT3608's potentiometer **slowly**, about half a turn at a time, while watching the multimeter:
   - If the number **gets closer to 5.0 V**, keep going in the same direction.
   - If the number **gets farther from 5.0 V**, turn the other way.
   - If the number **doesn't change**, keep turning. This potentiometer can be turned about 15–25 full turns, and at either end, turning further doesn't change anything.
4. Stop when the multimeter shows **4.95–5.05 V**. Wait 10 seconds: the number must hold.

**Expected output:** `5.00` on the multimeter's display (4.95–5.05 V is fine).

If the number **won't go below the battery voltage** (for example it stops at 3.9 V), the potentiometer is actually already at its lower end: the MT3608 can't lower the voltage, so its output just passes the battery voltage through. Turn the other way until the number rises to 5.0 V.

#### 5.6 Install the 100 µF capacitor

1. Read the print on the capacitor's body: its voltage must be **10 V or more** (for example "16V" or "25V").
2. Plug the **long (+) leg** into the top rail **(+)**, and the short leg on the **striped (−) side** into the top rail **(−)**, anywhere along the rails. If it's in backward, the capacitor can be damaged.

The capacitor is installed **after** the MT3608 has been set, on purpose. Before it's set, its output can be higher than the capacitor's voltage limit.

#### 5.7 Connect the second board

1. Make sure **the second board's USB is unplugged** (safety rule number 6).
2. Connect two male–female wires: the female end to the second board's pin, the male end to the mini breadboard.

   | Wire (male–female) | Second board pin | To the mini breadboard |
   | :--- | :--- | :--- |
   | red | **VIN** (left row, at the very bottom) | top rail **(+)** column 29 |
   | black | **GND** (left row, just above VIN) | top rail **(−)** column 28 |

3. The second board's red LED lights up right away. Watch the **blue LED** next to it: it lights up for about 1 second, goes out, then lights up again roughly **every 30 seconds**.
4. Measure the (+) rail again with the multimeter: it stays at about **5.0 V**. While the blue LED is on, the number may drop a little. After that, unplug both spare wires from the (+) and (−) rails: their live free ends could touch each other and cause a short circuit.

**Expected output:** the second board now runs on the battery, without a laptop. There's no Serial Monitor, so the blue LED is your sign that the board wakes up, reads the temperature, then goes back to sleep.

Leave this circuit running. In Practice 6, we measure how much current it draws.

#### 5.8 Inside the steps

- **Why are B+/B− separate from OUT+/OUT−?** B+ and B− go straight to the battery. OUT+ is connected straight to B+, but OUT− only connects to B− through the guard's "switch" (the protection chip). Every load is taken from OUT, so if there's a short circuit or the battery is too empty, the guard cuts it off (Concept 7).
- **Why is the MT3608 set with no load?** So that the ESP32 board never gets the wrong voltage, not even for a second. Setting it while it's connected to the board is the same as guessing and hoping.
- **Why 5.0 V, not 3.3 V?** The VIN pin feeds the board's regulator, which needs a little over 1 V of breathing room (Concept 1). The MT3608 can't be set to 3.3 V for the 3V3 pin either: it can't lower the voltage, so with a full battery its output still stays at about 4 V, while the 3V3 pin can only handle about 3.6 V.
- **The 100 µF capacitor** becomes a "small reservoir" on the 5 V rail. When the board wakes up and its current surges, the capacitor chips in from its stored charge so the voltage doesn't dip (Concept 3).

> ⬆️ **Done with Practice 5?** Go back to [Concept 8](#8-measuring-current-the-ina219-not-a-multimeter) (the ➡️ there will take you to Practice 6).

### Practice 6 — Node 1 becomes a current meter: INA219 (45 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (with the **Library Manager**) and the **Serial Monitor**, the **Node 1 board** on the laptop with the **MB102 turned off**, the **INA219** module, 6 **male–female** wires and 1 **male–male** wire, the battery circuit and the second board from Practice 5, plus paper and a pencil (or `notes-module09.md`). Concepts used: 8, 9, and 10.
>
> ⭐ **Required** — part of the completion requirements: the battery sketch's sleep current measures less than 15 mA, and you calculate its estimated battery life yourself.

In this practice, the Node 1 board runs the meter sketch, and the INA219 is inserted in the 5 V wire going to the second board. You'll write down the sleep current and the awake current, then calculate the battery life yourself.

#### 6.1 Install the Adafruit INA219 library

1. In Arduino IDE, open the **Library Manager** (the books icon in the left sidebar), then type **Adafruit INA219**.
2. Choose the **Adafruit INA219** entry that says **by Adafruit** under its title, version **1.2.3**, then click **INSTALL**.
3. An `Install library dependencies` window appears with a list of several companion libraries, among them **Adafruit BusIO** and **Adafruit NeoPixel**. Click **INSTALL ALL**. The companion libraries already installed since Module 7 aren't harmed; **Adafruit NeoPixel** gets installed too, even though we don't use it (only the INA219 library's own examples use it).

#### 6.2 Connect the INA219 to Node 1's I2C bus

**Turn everything off first**: unplug the second board's **VIN** wire from the mini breadboard's (+) rail (the second board goes dark; remember the hole, column 29), make sure the **MB102 is off**, and **the Node 1 board's USB is unplugged**. Then slide the mini breadboard slowly, together with the second board, until it's close to the lower breadboard of the Node 1 workbench: the INA219's wires and the shared GND wire are only about 20 cm long.

The INA219 goes into the holes the BME280 used in Module 7, with the same wire colors:

| Wire (male–female) | From the INA219 pin | To the Node 1 workbench | Purpose |
| :--- | :--- | :--- | :--- |
| **Orange** | **VCC** | bottom rail **(+)** column 14 | 3.3 V from the ESP32 for the INA219 chip |
| **Black** | **GND** | bottom rail **(−)** column 14 | GND |
| **Yellow** | **SCL** | **19h** | the SCL strip, shared with the OLED display |
| **Blue** | **SDA** | **20i** | the SDA strip, shared with the OLED display |

![Illustration of the Node 1 workbench during Practice 6. The older parts, including the OLED display and both I2C bus bridge wires, are drawn faded. In front of the lower breadboard, below the display, a purple INA219 module with six pins, VCC, GND, SCL, SDA, VIN minus, and VIN plus, an R100 resistor, and an unused screw terminal. An orange wire from VCC curves into the bottom rail plus at column 14; a black wire from GND goes to the bottom rail minus at column 14; a yellow wire from SCL goes up to row h, then right to 19h; a blue wire from SDA goes up to row i, then right to 20i. A white wire from VIN minus and a red wire from VIN plus turn right and leave the edge of the picture, labeled VIN minus to 27a on the mini breadboard and VIN plus to the mini breadboard's top rail plus; a black wire from the bottom rail minus at column 30 goes down, then right between the label for the 3.3-volt bottom rail and the shared GND label, and leaves at the right edge toward the mini breadboard's top rail minus. A close-up box of columns 12 to 22 with four markers explains the VCC, GND, SCL, and SDA wires; notes: the I2C scanner now finds 0x3C (display) and 0x40 (INA219), and the VIN plus and VIN minus pins don't go to the Node 1 workbench: they're inserted in the second board's 5-volt wire on the mini breadboard. The list below the picture: the INA219 wires are male–female; VIN plus to the mini breadboard's top rail plus, which carries 5.0 volts from the MT3608, and VIN minus to 27a; the shared GND uses a black male–male wire from the bottom rail minus at column 30 to the mini breadboard's top rail minus, and the plus rails of the two breadboards are never connected](assets/workbench-ina219.png)

#### 6.3 Insert the INA219 in the second board's 5 V line

Now the INA219 is inserted between the mini breadboard's (+) rail and the second board's VIN pin, exactly like a water meter in the middle of a pipe.

| Wire | From | To | Purpose |
| :--- | :--- | :--- | :--- |
| **red** male–female | the INA219's **VIN+** pin | the mini breadboard's top rail **(+)**, in the hole the second board's VIN wire left (column 29) | the 5 V current **goes into** the INA219 |
| **white** male–female (or another color you haven't used yet) | the INA219's **VIN−** pin | **27a** on the mini breadboard | the current **comes out** of the INA219 |
| the second board's red **VIN** wire (from 5.7) | — | **27e**, but it's only plugged in at 6.5; until then, leave it unplugged | the second board will get 5 V through the INA219 |
| **black** male–male | the Node 1 workbench's bottom rail **(−)**, column 30 | the mini breadboard's top rail **(−)**, for example column 9 | the **shared GND**, so the INA219 can read the voltage |

Check three things before you power anything:

1. The second board's VIN wire is still unplugged. Its destination later is **27e**, **not** the (+) rail.
2. The only wire between the Node 1 workbench and the mini breadboard is the black **GND** wire. The mini breadboard's (+) rail is **never** connected to any rail on the Node 1 workbench.
3. The INA219's VCC pin is in the Node 1 workbench's bottom rail (+) (3.3 V), **not** in the mini breadboard's (+) rail.

![Illustration of the INA219 inserted in the second board's 5-volt wire in Practice 6; the Practice 5 circuit is drawn faded. Top right, above the second board, a purple INA219 module with its pins along its bottom edge, from the left VCC, GND, SCL, SDA, VIN minus, VIN plus, the same order as in the workbench picture. Four I2C wires, orange VCC, black GND, yellow SCL, and blue SDA, go down a little, turn left, then go up to the top edge of the picture toward the Node 1 workbench (marker 5). A white wire from VIN minus goes down, turns left, goes down between columns 27 and 28 without touching the rail holes, then into 27a (marker 2). A red wire from VIN plus turns left lower than the white wire, then goes down to the top rail plus at column 29, the hole the second board's VIN wire left (marker 1). The second board's red VIN wire now starts at 27e: it goes down to the center channel, right until it leaves the breadboard, then to the second board's VIN pin (marker 3). The second board's GND wire still comes from the top rail minus at column 28. The black shared GND wire comes down from the top edge of the picture, from the Node 1 workbench, to the top rail minus at column 9, in the gap between the TP4056 and the MT3608 (marker 4). The note at the bottom, in red: the mini breadboard's plus rail is never connected to any rail on the Node 1 workbench; only GND is joined](assets/current-meter-circuit.png)

#### 6.4 Upload the meter sketch to the Node 1 board

1. Plug the USB of the **Node 1 board** into the laptop (the MB102 stays off). The second board is still dark.
2. Create a new sketch named `module09_current_meter`, paste this code, select the **Node 1 board's port**, then click **Upload**:

   ```cpp
   // Module 9 - Practice 6: Node 1 becomes a current meter for the second board (the future Node 2)
   // The Node 1 board (powered from the laptop's USB) reads the INA219 module on its I2C bus, address 0x40:
   //   VCC to the bottom rail (+) 3.3 V, GND to the bottom rail (-), SCL to strip 19, SDA to strip 20 (like the BME280 in Module 7).
   //   The INA219's VIN+ and VIN- pins are inserted in the 5 V wire from the MT3608 to the second board's VIN pin.
   // Every second: the average, min, and max current. Every time the second board wakes up again: a summary of one cycle.
   // Library: Adafruit INA219 1.2.3 (installed with it: Adafruit BusIO 1.17.4).

   #include <Wire.h>
   #include <Adafruit_INA219.h>

   const unsigned long SAMPLE_INTERVAL = 5;     // ms: one current reading every 5 ms (200 times per second)
   const unsigned long REPORT_INTERVAL = 1000;  // ms: one report line every 1 second
   const float WAKE_THRESHOLD = 20.0;           // mA: above this, the second board counts as awake
   const int SAMPLES_SURELY_AWAKE = 3;          // 3 readings in a row above the threshold = really awake
   const int SAMPLES_SURELY_ASLEEP = 20;        // 20 readings in a row (100 ms) below the threshold = really asleep

   Adafruit_INA219 ina219;  // default address 0x40
   bool ina219Found = false;

   unsigned long lastSampleTime = 0;
   unsigned long lastReportTime = 0;

   // Statistics for the report every second
   float currentSumThisSecond = 0;
   int samplesThisSecond = 0;
   float minCurrent = 0;
   float maxCurrent = 0;
   float lastVoltage = 0;

   // The second board's wake-sleep cycle
   bool isAwake = false;
   int aboveInARow = 0;    // how many readings in a row above the threshold
   int belowInARow = 0;    // how many readings in a row below the threshold
   float awakeCurrentSum = 0;
   unsigned long awakeSamples = 0;
   float asleepCurrentSum = 0;
   unsigned long asleepSamples = 0;

   void printCycleSummary() {
     float awakeSeconds = awakeSamples * SAMPLE_INTERVAL / 1000.0;
     float asleepSeconds = asleepSamples * SAMPLE_INTERVAL / 1000.0;
     float awakeAverage = awakeCurrentSum / awakeSamples;
     float asleepAverage = asleepCurrentSum / asleepSamples;
     float cycleAverage = (awakeCurrentSum + asleepCurrentSum) / (awakeSamples + asleepSamples);
     Serial.printf("CYCLE: awake %.2f seconds, average %.1f mA | asleep %.2f seconds, average %.2f mA | cycle average %.2f mA\n",
                   awakeSeconds, awakeAverage, asleepSeconds, asleepAverage, cycleAverage);
   }

   void takeSample() {
     float current = ina219.getCurrent_mA();
     lastVoltage = ina219.getBusVoltage_V();

     if (samplesThisSecond == 0 || current < minCurrent) {
       minCurrent = current;
     }
     if (samplesThisSecond == 0 || current > maxCurrent) {
       maxCurrent = current;
     }
     currentSumThisSecond += current;
     samplesThisSecond++;

     // Awake or asleep? It takes several readings in a row, so that a moment of noise doesn't count.
     if (current > WAKE_THRESHOLD) {
       aboveInARow++;
       belowInARow = 0;
     } else {
       belowInARow++;
       aboveInARow = 0;
     }
     if (!isAwake && aboveInARow >= SAMPLES_SURELY_AWAKE) {
       if (awakeSamples > 0 && asleepSamples > 0) {  // one complete cycle has been recorded
         printCycleSummary();
       }
       isAwake = true;
       awakeCurrentSum = 0;
       awakeSamples = 0;
       asleepCurrentSum = 0;
       asleepSamples = 0;
     }
     if (isAwake && belowInARow >= SAMPLES_SURELY_ASLEEP) {
       isAwake = false;
     }

     if (isAwake) {
       awakeCurrentSum += current;
       awakeSamples++;
     } else {
       asleepCurrentSum += current;
       asleepSamples++;
     }
   }

   void report(unsigned long now) {
     if (samplesThisSecond == 0) {
       return;
     }
     Serial.printf("[%5lu s] %6.2f mA (min %.2f, max %.2f)  %.2f V  %s\n", now / 1000,
                   currentSumThisSecond / samplesThisSecond, minCurrent, maxCurrent, lastVoltage,
                   isAwake ? "AWAKE" : "asleep");
     currentSumThisSecond = 0;
     samplesThisSecond = 0;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Wire.begin();  // SDA = D21, SCL = D22, like Node 1's OLED display
     ina219Found = ina219.begin();
     if (ina219Found) {
       ina219.setCalibration_16V_400mA();  // a range up to 400 mA, finer readings for small currents
       Serial.println("Practice 6 - INA219 current meter ready. Wake threshold: 20 mA.");
     }
   }

   void loop() {
     unsigned long now = millis();

     if (!ina219Found) {
       if (now - lastReportTime >= 2000) {
         lastReportTime = now;
         Serial.println("INA219 not answering at address 0x40. Check the VCC, GND, SCL, and SDA wires, then press EN.");
       }
       return;
     }

     if (now - lastSampleTime >= SAMPLE_INTERVAL) {
       lastSampleTime = now;
       takeSample();
     }
     if (now - lastReportTime >= REPORT_INTERVAL) {
       lastReportTime = now;
       report(now);
     }
   }
   ```

3. Open the **Serial Monitor** (**115200 baud**). The first line must be `Practice 6 - INA219 current meter ready. Wake threshold: 20 mA.` If you missed this line because the Serial Monitor only just opened, press the Node 1 board's **EN** to print it again. If what appears is `INA219 not answering at address 0x40. …`, check the four I2C wires from 6.2, then press **EN**.

#### 6.5 Power up the second board and watch

Plug the second board's red **VIN** wire back in, at **27e**. The second board powers up from the battery, and its current now passes through the INA219. Before this wire goes in, the lines show about `0.00 mA` (small numbers such as `-0.10` or `0.10` when there's no current are normal); as soon as it's plugged in, an `AWAKE` line appears, because the second board has just powered up.

**Expected output** (example output on a real board; your numbers will certainly be different):

```text
Practice 6 - INA219 current meter ready. Wake threshold: 20 mA.
[    1 s]   0.01 mA (min -0.10, max 0.10)  5.00 V  asleep
[    2 s]   0.00 mA (min -0.10, max 0.10)  5.00 V  asleep
…
[   13 s]   0.01 mA (min -0.10, max 0.10)  5.00 V  asleep
[   14 s]  29.20 mA (min -0.10, max 61.40)  4.98 V  AWAKE
[   15 s]  31.35 mA (min 4.70, max 58.95)  5.00 V  asleep
[   16 s]   4.94 mA (min 4.70, max 5.20)  5.00 V  asleep
…
[   44 s]   4.92 mA (min 4.65, max 5.15)  5.00 V  asleep
CYCLE: awake 1.12 seconds, average 51.6 mA | asleep 29.93 seconds, average 4.92 mA | cycle average 6.60 mA
[   45 s]  29.37 mA (min 4.70, max 60.85)  4.98 V  AWAKE
[   46 s]  33.54 mA (min 4.75, max 59.10)  5.00 V  asleep
```

How to read it:

- One line appears every second: the **average current** during that 1 second, the **min** and **max** numbers, the **voltage** at the second board's VIN pin, and its state (`AWAKE` or `asleep`).
- As soon as the second board wakes up again, a **`CYCLE`** line appears that sums up the previous cycle: how long it was awake and its average current, how long it was asleep and its average current, then the **average over one cycle**. The first `CYCLE` line only appears when the second board wakes up for the **second** time, because the summary of one cycle (awake, then asleep) can only be printed when the next cycle starts.
- The voltage is a little below 5.0 V while the board is awake: the INA219's 0.1 Ω resistor and the wires eat a little voltage too, especially when the current is large.
- A line that covers the moment the board wakes up holds a mix of awake and asleep, so its average is "in between" (for example 29.37 mA). The numbers to use for the calculation are in the `CYCLE` line.

In this example, the second board's sleep current is about **4.9 mA**, far below the 15 mA pass limit. Your board may show a different number, because every brand of board uses slightly different parts (Concept 10).

#### 6.6 Write down your measurements ⭐

Wait until **three** `CYCLE` lines have appeared. Copy the last one into `notes-module09.md`, then fill in this table:

```markdown
## Second board current measurements (Practice 6)

| | Measured |
| --- | --- |
| Sleep current (average) | … mA |
| Awake current (average) | … mA |
| Awake time | … seconds |
| Sleep time | … seconds |
| Average over one cycle (5 V side) | … mA |

Sleep current < 15 mA? yes / no
```

**You pass** if the sleep current is **less than 15 mA**. More than that? Open "The sleep current is more than 15 mA" in 🚨.

#### 6.7 Calculate the battery life ⭐

Use the four steps of Concept 9 with **your own numbers**, and write every step in your notes (not just the final result):

```markdown
## Estimated battery life (Practice 6)

1. Average current on the 5 V side (from the CYCLE line): … mA
2. Current on the battery side: … mA × 1.6 = … mA
3. Usable capacity: … mAh (printed on the battery) × 0.8 = … mAh
4. Battery life: … mAh ÷ … mA = … hours = … days
```

If the battery's body doesn't show a sensible capacity (for example 9,900 mAh), take its printed capacity to be **2,000 mAh** (the low end for a genuine 18650 battery), so step 3 becomes 2,000 mAh × 0.8 = 1,600 mAh. Write down the reason too.

#### 6.8 Inside the code

- **`ina219.setCalibration_16V_400mA()`** chooses a range **up to 400 mA**. The range is narrower than the library's default, but its small-current readings are finer. A board that's awake without Wi-Fi never comes close to 400 mA.
- **One reading is taken every 5 ms** (two hundred times per second) with the `millis()` pattern from Module 8, so even a wake-up that lasts only about 1 second is recorded about two hundred times. Each INA219 reading only captures about 0.5 ms, so surges much shorter than 5 ms can be missed, but their effect on the average is small.
- **Awake or asleep?** The sketch counts the second board as awake when **three readings in a row** are above 20 mA, and as asleep again when **twenty readings in a row** (100 ms) are below it. This "in a row" condition filters out moments of noise, just like the button that has to be steady for 30 ms in Module 8. As a result, the awake time in the `CYCLE` line is about 0.1 seconds longer than it really is (the cycle average isn't affected). That number is also longer than `Awake for … ms` in Practice 4, because `millis()` doesn't count the very first part of the boot.
- **The cycle average** is calculated from **all** the readings in one cycle, not from just two numbers. The result is the same as the Concept 9 formula, only more precise.
- **`getBusVoltage_V()`** reads the voltage at the INA219's VIN− pin, which is the voltage that actually reaches the second board's VIN pin.

#### 6.9 After you finish measuring

Once your table and your calculation are finished:

1. Unplug the Node 1 board's USB. The INA219 circuit may stay connected until section ➕ A.
2. The second board may keep running on the battery. If you want to watch it for a few days, see "Bonus" in section ➕ A.

> ➡️ **Done with Practice 6?** Continue to [Practice 7](#practice-7--power-bank-test-does-it-switch-itself-off-15-minutes).

### Practice 7 — Power bank test: does it switch itself off? (15 minutes)

> 🖥️ **Tools and parts:** the **second board**, still running the Practice 4 sketch (the DS18B20 stays connected), a charged **power bank**, and the second board's USB cable. This practice is optional, but highly recommended if you have a power bank. Concepts used: 2.

1. **First disconnect the second board from the battery circuit**: unplug the wires from the second board's **VIN** and **GND** pins, and leave their other ends on the mini breadboard. The loose end of the VIN wire still carries 5 V: keep the two loose ends apart so they can't touch. Remember the rule "one board, one power source". Leave the three DS18B20 wires connected.
2. Plug the second board's USB cable into the **power bank**. If the power bank has a button, press it once so it starts supplying power.
3. Watch the second board's **blue LED** for **5 minutes**: it should light up for about 1 second every 30 seconds. Also watch the power bank's indicator lights and the second board's red LED (the sign that the board has power). Write down in `notes-module09.md`: the power bank's brand, how many times the blue LED managed to light up, and how many seconds after the blue LED went out the power bank's lights and the second board's red LED went out too (if they did).

**Expected output** (it depends on your power bank):

- **The blue LED only lights up once (when the board is first plugged in). About 10–20 seconds after the board falls asleep, the power bank's lights and the second board's red LED go out, and the blue LED never lights up again.** This is the trap: the power bank thinks nothing is charging, so it switches itself off. The second board won't wake up again until the power bank's button is pressed.
- **The blue LED keeps blinking regularly.** Your power bank may have a low-current mode, or its current limit is low. It's still not recommended for Node 2: its behavior can change when it's almost empty, and most power banks don't state their limit on the packaging.

**The fixes**, starting with the most recommended:

1. **Use a source that's actually made for the job**: an adapter or charger for a device that's always near a wall outlet (Node 1), and the 18650 + TP4056 + MT3608 circuit for a battery-powered device (Node 2).
2. **Turn on the low-current mode** if your power bank has one (usually by pressing its button two or three times, or holding it for about 2 seconds; see its manual). This mode is made for charging smartwatches and earphones. On some brands, this mode switches itself off after about 2 hours, so it's still not suitable for a device that runs for days. There are also special "always on" power banks, but they cost more, and they draw a few mA themselves.
3. **Don't trick it with a wasteful load**, for example a resistor that's deliberately heated so the current is always large. The battery then gets used up by a heater, not by the ESP32.

When you're done trying it, unplug the second board from the power bank. If you want to keep watching it, plug the two wires back onto the second board's **VIN** and **GND** pins; their other ends are still in **27e** and the mini breadboard's top rail (−), as at the end of Practice 6.

> ➡️ **Done with Practice 7?** Continue to [Practice 8](#practice-8--save-to-github-15-minutes).

### Practice 8 — Save to GitHub (15 minutes)

> 🖥️ **Tools used:** **GitHub Desktop**, **Arduino IDE** (if a sketch needs to be moved), **VS Code** or Notepad, and the `module-09` folder in the `learn-iot` repository.

1. Make sure the `module-09` folder holds this week's six sketches (`module09_first_sleep`, `module09_three_memories`, `module09_button_wake`, `module09_light_sleep`, `module09_node2_skeleton`, and `module09_current_meter`) and the `notes-module09.md` file. Is a sketch saved somewhere else, for example in **Documents → Arduino**? Open that sketch in Arduino IDE, choose **File → Save As…**, then save it to **Documents → GitHub → learn-iot → module-09**.
2. Check that `notes-module09.md` already has the sections below. Sections you've already written in Practices 2, 5, 6, and 7 (for example the 6.6 measurements table) don't need to be written again; only add what's missing:

   ```markdown
   # Module 9 Notes — Power supply and low power

   ## Three memories (Practice 2)
   (the RAM / RTC memory / NVS table)

   ## Battery circuit (Practice 5)
   - Battery voltage: … V before charging, … V when full

   ## Second board current measurements (Practice 6)
   - Sleep current: … mA
   - Awake current: … mA for … seconds
   - Average over one cycle: … mA (on the 5 V side)

   ## Estimated battery life (Practice 6)
   (write your own calculation steps, with their numbers)

   ## Power bank test (Practice 7)
   - Brand/type: …
   - Result: …
   ```

3. In GitHub Desktop, choose **`learn-iot`** in the **Current repository** box, fill in **Summary** with `Module 9: sleep, battery supply, and measuring current`, click **Commit … to main**, then **Push origin**.

> ➡️ **After Practice 8:** do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home) — that's where Node 1 moves permanently to its adapter and takes the 24-hour test, and you complete the Phase 1 checkpoint — then finish with the [📝 Quiz](#-5-question-quiz) and the [✅ Completion checklist](#-module-9-completion-checklist). Open the 🚨 and 🔬 sections in between only when you need them.

---

## 🚨 Troubleshooting

This week there are three sources of evidence: the **Serial Monitor** for the sleep sketches and the meter sketch; the **multimeter on V⎓ 20** for the battery circuit; and, while the second board runs on the battery without a laptop, its **blue LED**, which should light up for about 1 second every 30 seconds. Click a problem's title to open its explanation.

> [!IMPORTANT]
> **Before you check or move a wire:**
>
> - **The Node 1 workbench:** turn off the MB102, then unplug the USB. When you're done, plug in the USB first, then turn on the MB102.
> - **The battery circuit:** unplug the second board's **VIN** wire and unplug the charger from the TP4056. To change a wire on the battery side (columns 3 and 6, or the B+/B− pins), **take the battery out** of its holder first.

<details>
<summary><b><code>Compilation error</code> — this week's error messages</b></summary>

Each message starts with a file name and a line number. Read the **first error message** first: the errors after it are often just consequences of the first one.

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `'rtc_gpio_pullup_en' was not declared in this scope` (or `'rtc_gpio_deinit' …`) | The `#include "driver/rtc_io.h"` line is missing. | Add that line at the very top of the sketch (Practice 3). |
| `invalid conversion from 'int' to 'gpio_num_t'` | The pin number is written as an `int`, for example `const int PIN_WAKE_BUTTON = 13;`. The sleep functions ask for the type `gpio_num_t`. | Write `const gpio_num_t PIN_WAKE_BUTTON = GPIO_NUM_13;`, as in the Practice 3 sketch. |
| `'esp_sleep_enable_ext0_wakeup' was not declared in this scope`, `'RTC_DATA_ATTR' does not name a type`, or dozens of errors at once | The selected board isn't a classic ESP32, for example an ESP32-C3 or an Arduino Uno. | Select **DOIT ESP32 DEVKIT V1** in **Tools → Board → esp32**. |
| `fatal error: Adafruit_INA219.h: No such file or directory` | The INA219 library isn't installed. | Install **Adafruit INA219** 1.2.3 (Practice 6.1). |
| `fatal error: Adafruit_BusIO_Register.h: No such file or directory` (or `Adafruit_I2CDevice.h`) | The companion library **Adafruit BusIO** isn't installed. | Install **Adafruit BusIO** 1.17.4 from the **Library Manager** (Module 7). |
| `fatal error: DallasTemperature.h: No such file or directory` | The DS18B20 library from Module 7 isn't installed. | Install **OneWire** 2.3.8 and **DallasTemperature** 4.0.6 (Module 7, Practice 4). |

</details>

<details>
<summary><b>Can't upload to a sleeping board</b></summary>

Arduino IDE can usually wake the board up by itself: before uploading, it "presses" the EN button through the USB cable. If it still fails with the message `Failed to connect to ESP32`:

1. Make sure the selected port is the right board's port. This week your laptop often serves two boards.
2. Click **Upload**. Hold **BOOT** as soon as `Connecting…` appears, and let go when `Writing at …` starts running, as in Module 2.
3. For the second board while it's running on the battery: first unplug its VIN and GND wires, and only then plug in the USB.

</details>

<details>
<summary><b>The count always goes back to "Wake #1"</b></summary>

- **The variable doesn't use `RTC_DATA_ATTR`.** An ordinary variable always goes back to its starting number every time the board wakes up from deep sleep (Concept 5).
- **The board isn't waking up from sleep: it's restarting.** Look at the `rst:` line in the Serial Monitor. `rst:0x5 (DEEPSLEEP_RESET)` means it woke up from sleep. If it says `POWERON_RESET`, or the text `Brownout detector was triggered` appears, your board lost power for a moment: check its USB cable or, for the second board, its battery circuit (see the restart problem below).
- **You pressed EN, unplugged the power, or uploaded again.** All three really do wipe RTC memory (Practice 2).
- **In Wokwi**, deep sleep isn't simulated yet: the board always restarts with `rst:0x8 (TG1WDT_SYS_RESET)`, and RTC memory is lost. Do the deep sleep sketches on a real board.

</details>

<details>
<summary><b>Practice 3: the board wakes up again right away, nonstop, or the button doesn't wake it</b></summary>

**Waking up again nonstop** (the message `woken by the BUTTON.` over and over):

- The button is still pressed when the board starts to sleep. The sketch already waits for the button to be released, so check whether your button is stuck or whether its legs are in the wrong holes, leaving D13 always connected to GND.
- D13's pull-up is gone: the line `rtc_gpio_pullup_en(PIN_WAKE_BUTTON);` was deleted **and** `INPUT_PULLUP` in the `pinMode()` line was written as `INPUT` (or that line was deleted too). Both turn on the same pull-up (Practice 3.2); with neither of them, the D13 pin floats during sleep and can read as LOW.

**The button doesn't wake it** (only the timer alarm works):

- Check the D13 button's wiring as in Module 5: one leg to the D13 strip, its opposite leg to GND.
- Make sure the wake door is `esp_sleep_enable_ext0_wakeup(PIN_WAKE_BUTTON, 0);` with the number **0** (wake up on LOW). The number 1 means wake up on HIGH, but our button pulls D13 LOW.
- The ext0 door can only be set up on an **RTC pin**. D13 is an RTC pin; D21 and D22, for example, aren't.
- **Part 3B in Wokwi:** the GPIO wake door for light sleep isn't simulated yet. Pressing the green button really doesn't wake the board; on a real board, it does.

</details>

<details>
<summary><b>Node 1 restarts when the pump turns on</b></summary>

If the `Boot #` number goes up when the pump or the servo moves after Node 1 has moved to its charger, or `Restart:` says `BROWNOUT`:

1. **Make sure no load is connected to the board's VIN or 3V3 pin** (golden rule number 1). Check column 4 of the upper breadboard (VIN): there must be no wire to the top rail (+).
2. **Check the charger.** Use a branded charger of at least 1 A and a short USB cable. Try another charger and cable.
3. **Use separate wall outlets** if the ESP32's charger and the MB102's adapter share a cheap, loose power strip.
4. **Check the 100 µF capacitor** on the top rail (Module 5): make sure it's still in place, the right way around.
5. If Node 1 stays normal when it's plugged into the laptop, the problem is almost certainly the charger or its cable.

</details>

<details>
<summary><b>The battery reads 0 V or very low</b></summary>

- **The multimeter is on the wrong setting.** It must be on **V⎓ 20** (DC voltage), with the black probe in the **COM** jack and the red probe in the **VΩmA** jack (Module 2), not in the **10A** jack. If the red probe turns out to be in the 10A jack, lift both probes away right away: in that jack, touching them to the battery's terminals is the same as a short circuit.
- **The battery isn't touching the holder's spring or plate.** Press the battery gently toward the spring, then measure again.
- **Measuring at the wrong points.** The battery voltage is measured at column 6 (B+) and column 3 (B−), not at OUT+/OUT−. If the protection has cut off, OUT can read 0 V even though the battery is charged.
- **The battery really is empty**, below about 2.5 V. A Li-ion battery drained that deeply, especially if it stayed below 2 V for a long time, can be damaged inside and isn't safe to charge again. **Don't charge it**; use another battery, and take this one to an e-waste collection point. The only exception is a battery that the protection chip has **only just** cut off after the second board stopped working (for example in the ➕ A Bonus): its voltage really can be a little below 2.5 V. That one, on the contrary, must be recharged right away (5.3) while you watch it (Concept 7).

</details>

<details>
<summary><b>The battery gets hot while charging</b></summary>

**Unplug the charger now.** Don't hold the battery for long. If the battery can be taken out safely (for example using a thick cloth), take it out of its holder and put it on a surface that doesn't burn easily, away from other things, until it cools down.

A normal battery only feels **warm** while charging. A **hot** battery is probably damaged, fake, or has been short-circuited before. **Don't use it again**, and take it to an e-waste collection point. If the battery swells, smokes, or smells strange, keep it out of everyone's reach, and don't charge it or take it apart.

Remember: what may get hot is the **TP4056 module** (its charger chip), not the battery.

</details>

<details>
<summary><b>The TP4056's lights don't come on, blink, or show full right away</b></summary>

- **No light at all:** the charger or its cable isn't supplying power. Try another charger and another cable. If your TP4056 has a USB-C port and you're using a USB-C charger with a USB-C to USB-C cable, try a charger with a USB-A port and a USB-A to USB-C cable: some cheap USB-C modules lack the small resistors that a USB-C charger needs to see before it will supply power.
- **The red light keeps blinking while the other light is on:** the TP4056 can't find the battery. Check the B+ and B− wires in columns 3 and 6, and make sure the battery touches its holder.
- **It shows full right away:** the battery really is almost full already, or B+/B− isn't connected to the battery. Measure its voltage (5.2): if it's above 4.1 V, the battery really is full already.

</details>

<details>
<summary><b>The MT3608 won't show 5.0 V</b></summary>

- **The number doesn't change even though you turn the screw:** the potentiometer can be turned about 15–25 full turns, and at either end, turning further doesn't change anything. Turn patiently the other way until the number starts to move.
- **The number stops at about the battery voltage** (3.6–4.2 V): the setting is at its lower end, and the MT3608 is only passing the battery voltage through. Turn the other way until the number rises.
- **0 V:** the MT3608 isn't getting power. Check the TP4056's OUT+ wire and the MT3608's VIN+ wire in column 12, as well as the OUT− and VIN− wires on the (−) rail. Also measure column 12 against the (−) rail: it must be the same as the battery voltage. If it's 0 V here too, even though the battery is charged (column 6 against column 3), the protection chip has cut off, for example after a brief short circuit or because the battery has just been put in for the first time: unplug the second board's VIN wire, then plug the charger into the TP4056 for a few seconds to reset it.
- **The number jumps around:** a connection is loose. Press the ends of the jumper wires firmly onto the module pins and into the breadboard.

</details>

<details>
<summary><b>The second board doesn't power up from the battery, or its blue LED doesn't blink</b></summary>

1. **Measure the mini breadboard's (+) rail against its (−) rail:** it must be about 5.0 V. If it isn't, go back to 5.5.
2. **The second board's red LED is off:** its VIN or GND wire is on the wrong pin, or still in the wrong hole. VIN is the **bottom** pin of the **left** row (antenna at the top, USB port at the bottom), and GND is just above it. In Practice 6, the second board's VIN wire moves to **27e**, and the INA219 must be connected in between.
3. **The red LED is on, but the blue LED never blinks:** the second board may not be running the Practice 4 sketch yet. Unplug the VIN and GND wires, plug the board into the laptop, then upload `module09_node2_skeleton` again.
4. **The battery is already empty:** measure column 6 against column 3. Below about 3.3 V, unplug the second board's VIN wire, then charge it again (5.3).

</details>

<details>
<summary><b>The second board keeps restarting, or its blue LED blinks more often than every 30 seconds</b></summary>

A board that restarts because the voltage dips starts again from the beginning, turns on its blue LED, then restarts again (Concept 3). Check these one by one:

1. **The MT3608's voltage** is still 4.95–5.05 V (5.5), and the **100 µF capacitor** is in place the right way around (5.6).
2. **The battery's charge:** below about 3.4 V, the MT3608 has to work hard, and its voltage drops easily when the board wakes up. Unplug the second board's VIN wire, then charge the battery again (5.3).
3. **Loose connections** in the VIN wire, the GND wire, and the MT3608's wires: press them all in.
4. To see the cause, plug the second board into the laptop **without** the battery (unplug VIN and GND first), then open the Serial Monitor. If the board sleeps and wakes up normally on the laptop, the problem is in the battery circuit.

</details>

<details>
<summary><b>Practice 6: <code>INA219 not answering at address 0x40</code></b></summary>

1. Check the INA219's four I2C wires (6.2): VCC to the bottom rail (+), GND to the bottom rail (−), SCL to strip **19**, SDA to strip **20**. Swapped SCL and SDA wires are the most common mistake.
2. Run the I2C scanner from Module 7 (`module07_i2c_scanner`). The correct result: two devices, `0x3C` (the OLED display) and `0x40`.
3. If the scanner finds `0x41`, `0x44`, or `0x45`, the **A0/A1** solder pads on your module aren't open as they usually are. Change the line `Adafruit_INA219 ina219;` to, for example, `Adafruit_INA219 ina219(0x41);`, matching the address it found.
4. After fixing the wires, press the Node 1 board's **EN**. If you just ran the I2C scanner, upload `module09_current_meter` to the Node 1 board again first.

</details>

<details>
<summary><b>Practice 6: the current is 0 or negative, or the voltage is 0 V</b></summary>

- **A current of 0.00 mA, even though the second board's red LED is on:** the second board's VIN wire is still in the (+) rail, not in **27e**, so its current doesn't pass through the INA219.
- **A negative current** (for example `-9.70 mA`): the INA219's **VIN+** and **VIN−** wires are swapped. Swap them back. The current number itself is still right; only its sign is reversed.
- **A voltage of 0.00 V or a strange number, but a sensible current:** the **shared GND** wire (black male–male) between the Node 1 workbench and the mini breadboard isn't connected.

</details>

<details>
<summary><b>Practice 6: the <code>CYCLE</code> line never appears</b></summary>

- **The second board doesn't sleep:** its state is always `AWAKE`, and its current stays above 20 mA. Make sure the second board is running the Practice 4 sketch, not some other sketch that stays awake.
- **Its sleep current is above 20 mA:** its state is also always `AWAKE`, but look at the min number: when the blue LED goes out, the current drops, just not below 20 mA. Your board is power-hungry while asleep; read the next problem.
- **The second board never wakes up:** its state is always `asleep`, and its blue LED doesn't blink. See "The second board doesn't power up from the battery".
- **The sketch has only been running for a short time:** the first `CYCLE` line only appears when the second board wakes up for the **second** time, about 30 seconds after its VIN wire is plugged into 27e (up to about 60 seconds if the second board was already on before the meter sketch started).

</details>

<details>
<summary><b>The sleep current is more than 15 mA</b></summary>

1. **Make sure the second board is really asleep:** its blue LED is off, and the number in the Serial Monitor drops far below what it was while `AWAKE`.
2. **Check the DS18B20 adapter module.** If your adapter has an LED that stays on, that LED also draws current from the 3V3 pin while the board sleeps. Remove the adapter for a moment (unplug the second board's VIN first), then measure again. If the sleep current drops below 15 mA without the adapter, write down both numbers: that's a valid measurement.
3. **Not all DevKit V1 boards are the same.** Some use a different regulator or USB chip that's more power-hungry (Concept 10). If it's still above 15 mA, write the number down as it is in your notes, mention your board's brand or features, then ask your mentor or your class forum before you count this practice as failed.

</details>

---

## 🔬 Technical Deep Dive (optional)

This section is for the curious. Nothing here has to be practiced, and the next modules don't depend on it.

<details>
<summary><b>Low-power boards and ESP32 modules without a development board</b></summary>

The sleep current of the whole board, according to its maker or to other people's measurements (the ways of measuring differ, so treat these as rough figures):

| Board | Deep sleep current | Source of the number |
| :--- | :--- | :--- |
| An ordinary development board (ESP32-DevKitC, NodeMCU-32S, and similar), powered with 5 V | about 3.8–4.7 mA | measurements by several authors |
| **TinyPICO** | about 18 µA (0.018 mA) | its maker, Unexpected Maker |
| **FireBeetle ESP32** (DFRobot) | about 10 µA | the maker's claim and one measurement; other users measured much more while the board's LED was on |
| **LOLIN32** (WEMOS), from a 3.7 V battery | about 0.13 mA | one author's measurement |

Features of a board designed for batteries:

- **An efficient regulator**: its "running money" (its *quiescent current*) is only a few µA, not a few mA like the AMS1117's. The regulator can also take a Li-ion battery's voltage directly, without a voltage booster.
- **No LED that stays on**, or an LED that can be turned off. The FireBeetle version 2, for example, has a "low power" pad that can be cut to save about 0.5 mA.
- **A USB chip that only gets power from the USB cable**, so it switches off too when the board runs on the battery.
- Often a **battery charger** and a battery connector already built in.

The option that saves the most power is a **bare ESP32 module without a development board** (for example the ESP32-WROOM-32) mounted on a board of your own design, with an efficient regulator and no USB chip. Uploading programs works differently (through a separate USB-serial adapter), and designing a board like that is a skill of its own. Espressif itself recommends measuring a module's current on a special board, not on a development board, because the other circuits on a development board keep drawing current during sleep.

</details>

<details>
<summary><b>Why "battery → efficient regulator → 3.3 V" saves more power than our chain</b></summary>

Our chain raises the battery voltage to 5 V, then the board's regulator brings it back down to 3.3 V. Every stage wastes energy:

| Stage | What's wasted |
| :--- | :--- |
| MT3608: 3.7 V → 5 V | about 10–15% of the power becomes heat (an estimate), plus about 1 mA to run the MT3608 itself |
| The AMS1117 on the board: 5 V → 3.3 V | a linear regulator throws away its voltage difference, (5 − 3.3) ÷ 5 = 34% of the power, as heat, plus a few mA of "running money" |

Low-power boards use an **efficient low-dropout linear regulator** (LDO) straight from the battery. The difference from 3.7 V to 3.3 V is small, so little is wasted, and its "running money" is only a few µA.

Why don't we use one? Because the DevKit V1 board has no door for it: the 3V3 pin must not get battery voltage (Concept 1), and connecting a regulator of your own to the 3V3 pin while the board's built-in regulator is still in place is risky. The MT3608 → VIN chain is safe and easy, even though it isn't the most efficient.

</details>

<details>
<summary><b>A small solar panel + TP4056</b></summary>

Node 2 in the garden could be recharged by a small solar panel connected to the TP4056's **IN+/IN−** pads. It sounds easy, but there are a few traps:

- **Choose a panel of about 6 V.** Adafruit, which tested solar-powered battery chargers, found that a 5 V panel didn't work and a 5.5 V panel only worked sometimes. On the other hand, a "9 V" or "12 V" panel can damage the TP4056, because its input voltage is 8 V at most, and a panel's voltage with no load is higher than the number on its label.
- **The TP4056 is made for a strong source**, such as a phone charger. If the TP4056 asks for more current than the panel can give, the panel's voltage collapses, charging stops, the voltage recovers, and so on, over and over. Its red light can stay on even though very little goes into the battery.
- The TP4056 only charges when its input voltage is high enough (about 4 V or more), so it's only useful in bright sunshine. The panel must be outdoors, not in shade, and not behind glass.
- Chargers made for solar panels (for example ones that regulate their input voltage) work better, but that's beyond our kit.

</details>

<details>
<summary><b>The ULP coprocessor: a little brain that stays awake</b></summary>

Besides its two main cores, the ESP32 chip has a third, very small processor: the **ULP coprocessor** (*ultra-low-power coprocessor*). It can keep working during deep sleep, for example reading the ADC or an I2C sensor every few seconds, and only wakes up the main processor if the number crosses a limit. While the ULP is on, the chip's current rises from about 10 µA to about 150 µA (or 100 µA on average if it only works now and then), but that's still far less than waking up the whole chip.

For the classic ESP32 (like the one on the DevKit V1), ULP programs are written in a special assembly language or with complicated C macros. The esp32 package for Arduino comes with only one ULP example, and Wokwi doesn't simulate it yet. For our DevKit V1 board, cutting the board's current (Concept 10) matters far more than the ULP.

</details>

<details>
<summary><b>Other wake doors and <code>RTC_NOINIT_ATTR</code></b></summary>

- **ext1**: wakes the board up from several RTC pins at once, with `esp_sleep_enable_ext1_wakeup_io(maskPin, mode)`. On the classic ESP32, the choices are "all pins LOW" (`ESP_EXT1_WAKEUP_ALL_LOW`) or "any pin HIGH" (`ESP_EXT1_WAKEUP_ANY_HIGH`). The ESP32's RTC pins are GPIO 0, 2, 4, 12–15, 25–27, and 32–39.
- **Touch**: a touch pin can wake the board up when it's touched (`esp_sleep_enable_touchpad_wakeup()`).
- **Wake doors don't remove themselves.** A door that has been set up stays set up after the board wakes up. If you don't need it anymore, remove it with `esp_sleep_disable_wakeup_source()`.
- **`RTC_NOINIT_ATTR`**: similar to `RTC_DATA_ATTR`, but its contents are **not** reinitialized when the board starts again, so they can survive `ESP.restart()` and the watchdog. In exchange, its contents are random when the board has just been powered on, so your program has to check for itself whether they make sense (for example by storing a "key number" next to them).

</details>

<details>
<summary><b>Measuring currents as small as µA accurately</b></summary>

The INA219 can only tell apart steps of about 0.1 mA. To measure the sleep current of a low-power board, which is only a dozen or so µA, you need other tools:

- **Special instruments.** Espressif recommends the Joulescope or the Nordic Power Profiler Kit II. Both can switch ranges quickly, so a µA current during sleep and a current of hundreds of mA while awake are measured in one recording, without eating much voltage.
- **A small-current amplifier.** A tool such as EEVblog's µCurrent Gold is placed in front of an ordinary multimeter. The voltage it eats is only about 10–20 µV for every µA or mA that passes through it.
- **A multimeter trick.** Connect a jumper wire that "bridges" the multimeter's two probes while the board powers up and while it's awake, so the large current goes through the jumper, not through the multimeter. As soon as the board sleeps, pull out the jumper, read the number, then put it back before the board wakes up. It's a hassle, but good enough for a one-off measurement. This trick is for your knowledge only: this week, the multimeter stays on a voltage setting (safety rule number 7), and the INA219 is enough for the DevKit V1 board. On a current setting, the multimeter's probes must never be touched directly to the battery's terminals.

Also remember the numbers of a cheap multimeter: on the **2000µ** setting (2,000 µA), its internal resistance is about 100 Ω, so a current of just 2 mA already "eats" 0.2 V. That's why a multimeter on a µA setting immediately starves a waking board of voltage.

</details>

<details>
<summary><b>Shortening the awake time</b></summary>

For a board whose sleep current is already small, the awake time becomes the biggest part of the battery use. A few ways to shorten it:

- **Lower the DS18B20's resolution.** At 12 bits, one measurement takes up to 750 ms. At 9 bits (0.5 °C precision), only about 94 ms: `tempSensors.setResolution(9);` (Challenge Level 2).
- **Don't wait for no reason.** Avoid unnecessary `delay()` calls, including LED blinks that last too long.
- **Lower the processor speed** with `setCpuFrequencyMhz(80)` if the task is light. The current drops, even though the work takes a little longer.
- **Wi-Fi is the most power-hungry.** From Module 10 on, connecting to Wi-Fi can take a few seconds. That's one of the reasons Node 2 in Module 14 uses ESP-NOW, which can send data without connecting to a router (the central device of the Wi-Fi network at home).

</details>

<details>
<summary><b>Reading the battery voltage yourself with the ADC</b></summary>

`PIN-MAP.md` keeps the **VP** pin (GPIO 36) free on Node 2 for measuring the battery voltage. The way to do it is the **voltage divider** from Module 6: two equal resistors, for example 2 × 100 kΩ, from the **TP4056's OUT+** to GND, with their midpoint going to VP. A battery voltage of 4.2 V becomes 2.1 V at the midpoint, safe for the ESP32's ADC.

That way, the program can stop by itself (for example by sleeping for a very long time) as soon as the battery drops below about 3.3 V, before the protection chip is forced to cut off at 2.4 V. Connect that voltage divider between OUT+ and the circuit's GND (that is, OUT−), not between B+ and B−. OUT+ is actually connected straight to B+, but when the protection cuts off, OUT− is disconnected from B−, so the voltage divider stops draining the battery too. A voltage divider between B+ and B− would keep draining the battery even after the protection has cut off. Don't connect it to the MT3608's output either, which is always 5.0 V, however full the battery is.

Two things to keep in mind: the voltage divider also draws current all the time (4.2 V ÷ 200 kΩ = 0.021 mA, small compared with the DevKit V1's sleep current), and the ESP32's ADC isn't very accurate (Module 6), so calibrate it with the multimeter.

</details>

---

## 🧩 Independent Challenges

Three levels, starting with the easiest. Do at least Level 1. They all use the second board; Levels 1 and 2 also use the Practice 6 meter.

> 🖥️ **Tools:** **Arduino IDE**, the second board, and the Practice 6 circuit (the Node 1 board + the INA219). Before you change anything, open the `module09_node2_skeleton` sketch, then **right away** choose **File → Save As…** and save it in the `module-09` folder under a new name, for example `module09_challenge1`. Your practice sketch stays intact.
>
> **Every time you upload to the second board:** first unplug its **VIN** and **GND** wires from the battery circuit, plug its USB into the laptop, select the **second board's port** (don't let this sketch end up on the Node 1 board), upload, unplug its USB, then reconnect the VIN wire (to **27e**) and the GND wire (to the mini breadboard's top rail (−)). One board, one power source.
>
> **To measure:** plug the Node 1 board's USB back into the laptop (the MB102 stays off). The `module09_current_meter` sketch is still on that board from Practice 6, so just select the **Node 1 board's port** and open the Serial Monitor.

**Level 1 — A small change: sleep for 60 seconds.** Change `SLEEP_SECONDS` to `60`.

1. **Before you measure, guess first.** Use the awake current, the awake time, and the sleep current from your Practice 6 notes, then calculate the average current and the battery life with the Concept 9 formula for a 60-second sleep.
2. Upload, then measure with the Practice 6 sketch until three `CYCLE` lines have appeared.
3. Compare your guess with the measurement, then answer in your notes: **by what percentage does the battery life grow** when the sleep is twice as long? Why only a little? (Hint: Concept 10.)

**Level 2 — Combine: a shorter wake-up.** Use your Level 1 result (or go back to 30 seconds). Add `tempSensors.setResolution(9);` right after `tempSensors.begin();`. At 9 bits, the DS18B20 only needs about 94 ms to measure, not 750 ms, with a precision of 0.5 °C. This setting is also saved in the sensor's memory, so your DS18B20 stays at 9 bits even if the sketch is changed. To go back to 12 bits, run a sketch once that calls `tempSensors.setResolution(12);`.

- Compare the **awake time** in the `CYCLE` line and the `Awake for … ms` line in the Serial Monitor (first unplug the second board's **VIN** and **GND** wires from the battery circuit, then plug it into the laptop for a moment to see it) before and after the change.
- Calculate the battery life again. Which has the bigger effect for the DevKit V1 board: a shorter awake time, or a longer sleep time? What's the answer for a board whose sleep current is only 0.01 mA?

**Level 3 — Your own design: a temperature history in RTC memory.** Right now the Node 2 skeleton only remembers **one** previous reading. Change it so that it remembers the last **five** readings in RTC memory, then prints the lowest, highest, and average temperature of those five every time it wakes up. Starting hints:

- Prepare `RTC_DATA_ATTR float temperatureHistory[5];` and `RTC_DATA_ATTR int storedCount = 0;`. Store each new reading in drawer `(wakeCount - 1) % 5`, so the oldest drawer gets overwritten first.
- As long as the history isn't full yet (fewer than five readings), calculate only from the drawers that have been filled.
- Add a rule: print `Changed!` if the new temperature differs by more than 0.5 °C from the average of the history. A "report only when it changes" rule like this will later save Node 2's battery: sending data over the radio uses far more power than measuring.
- Test it by holding the DS18B20 probe in your hand for several wake-ups. This time, leave the second board plugged into the laptop after uploading (the battery circuit's VIN and GND wires stay unplugged) so you can read its Serial Monitor; the meter isn't needed.

There's no answer key for Level 3. If the history survives from one sleep to the next, is empty again after the EN button is pressed, and `Changed!` appears when you hold the probe, your design is right.

---

## ➕ Add-on to "Mini Smart Home"

This week, Node 1's firmware **doesn't change**: Node 1 v1.0 from Module 8 is already ready to run without a laptop, and it can even translate the restart reasons `BROWNOUT` and `DEEPSLEEP`. What changes is its **power supply**, plus one new folder in the project repository: the **Node 2 skeleton**.

| Section | What's in it | Based on |
| :--- | :--- | :--- |
| A | Node 1 permanently on its own adapter, then the 24-hour test ⭐ | Practice 1 |
| B | The `firmware/node-2-garden` folder with the Node 2 skeleton v0.1.0 | Practice 4 |
| C | `PIN-MAP.md` version 4 | Concepts 1 and 7, Practices 5–6 |
| D | The Phase 1 checkpoint 🎉: evidence, photos, and a 30-second video | Syllabus §8 |
| E | Commit and push | Module 4 |

> 🖥️ **Tools used:** **Arduino IDE**, **VS Code**, **GitHub Desktop**, the Node 1 workbench with its charger, the second board with the battery circuit, and a phone for recording the video.
>
> ⭐ **Required** (section A) — part of the completion requirements: Node 1 runs for 24 hours from an adapter, not from a laptop, without a restart.

### A. Node 1 permanently on an adapter, then the 24-hour test

**Already passed the Module 8 24-hour test on a charger?** If your Node 1 board already used a phone charger (not a laptop) in Module 8, and the setup is the same as now, that result meets this requirement: do steps 1, 2, and 4, then copy your Module 8 test notes into the table below. If you used a laptop back then, do all the steps.

1. **Put the Node 1 workbench back the way it was in Module 8.** Turn off the MB102 (if it's on) and unplug the Node 1 board's USB. If the second board is still running on the battery, first unplug its VIN wire from 27e. Then remove the INA219's four I2C wires from the bottom rail and strips 19–20, the shared GND wire (black male–male) to the mini breadboard, and the INA219's VIN+ and VIN− wires from the mini breadboard. If the second board is going to keep running on the battery, plug its VIN wire into the top rail (+) at column 29, the hole the INA219's VIN+ wire just left. Store the INA219 carefully: you can use it again whenever you want to measure current.
2. **Upload Node 1 v1.0 again** as in Practice 1.1: plug the Node 1 board into the laptop, open `node-1-home.ino` from the `mini-smart-home` repository, select its port, then click **Upload**.
3. **Prepare the 24-hour test** exactly as in section ➕ F of Module 8: dip the soil sensor into a glass of water, point the pump's hose back into the water tank and tape its end down, make sure the tank is more than 20% full, and place the workbench according to Module 8's safety rules.
4. **Move it to the charger** in the order of Practice 1.3: MB102 off → unplug the USB from the laptop → plug the cable labeled **ESP32** into the charger → **only then** turn on the MB102. If you have a regulated microSD module connected, press **EN** after the MB102 is on (Module 7), and **only then** go on to step 5.
5. **Start:** hold the button for 1 second to open the status page. Write down the **start time**, the **`Boot #`** number, and the **free memory**, or take a photo of the display.
6. **After 24 hours:** open the status page again. Node 1 **passes** if its uptime is **24:00:00 or more** and the **`Boot #` number is the same** as at the start. If it fails, open "The 24-hour test failed" in [🚨 Module 8](../module-08-robust-firmware/README.md#-troubleshooting) and "Node 1 restarts when the pump turns on" in this module's [🚨](#-troubleshooting), fix the cause, then repeat the test.

Write the result in `notes-module09.md` (in the `module-09` folder of `learn-iot`):

```markdown
## Node 1 24-hour test on an adapter (without a laptop)

| | Start | End |
| --- | --- | --- |
| Date and time | | |
| Uptime | 00:00:… | |
| Restart | | |
| Boot # | | |
| Free memory (KB) | | |

ESP32 power source: charger … (brand, … A)
Passed (uptime ≥ 24:00:00 and the same "Boot #")? yes / no
```

**Bonus: a real battery life test.** While Node 1 runs its 24-hour test, leave the second board running on the battery, with its VIN wire in the mini breadboard's top rail (+), as at the end of Practice 5. Charge the battery until it's full first (5.3), with the second board's VIN wire unplugged while charging (Concept 7). Put the battery circuit on a ceramic plate, away from anything that burns easily. Glance at its blue LED now and then. As soon as that LED no longer lights up every 30 seconds, write down how many days the battery lasted, then compare it with your calculation in Practice 6. After that, unplug the second board's VIN wire and **right away** recharge the battery with the TP4056 (5.3): a battery that the protection has cut off must not be left empty for days, let alone until Module 14 (Concept 7).

### B. The Node 2 skeleton goes into the project repository

The Practice 4 sketch becomes the first version of the Node 2 firmware, just as the Module 3 sketch once became Node 1 v0.1.0.

1. In Arduino IDE, open the `module09_node2_skeleton` sketch, then choose **File → Save As…**. Go to **Documents → GitHub → mini-smart-home → firmware**, type the name **`node-2-garden`**, then click **Save**. Arduino IDE creates a `node-2-garden` folder holding `node-2-garden.ino`.
2. Open the reference version of [`node-2-garden.ino`](../../mini-smart-home/firmware/node-2-garden/node-2-garden.ino) in a new tab, click **Copy raw file**, then replace the whole contents of the `node-2-garden.ino` tab with it (**Ctrl + A**, then **Ctrl + V**). The only difference from the Practice 4 sketch is in the two comment lines at the very top: the name, the version number (**0.1.0**), and where its power comes from.
3. Save (**Ctrl + S**). If you like, upload it to the second board over USB: it behaves exactly like Practice 4. Remember to unplug the battery circuit's VIN and GND wires before you plug in the USB.

### C. Update `PIN-MAP.md`

1. In VS Code, open your project repository's folder (**File → Open Folder…** → **Documents → GitHub → mini-smart-home**), then open `PIN-MAP.md`.
2. Open the reference version of [`PIN-MAP.md`](../../mini-smart-home/PIN-MAP.md) in a new tab, click **Copy raw file**, then replace the whole contents of your file with it (**Ctrl + A**, then **Ctrl + V**). What changed:
   - **Golden rule number 2** now says: ESP32 Node 1 is powered from **its own charger** through the board's USB port; the laptop is only for uploading programs. Rules number 4 (the MB102's 5 V rail doesn't go to the VIN pin while a USB cable is plugged in) and number 5 (the power on/off order) now apply to USB from the laptop and from the charger alike.
   - **The Node 2 section**: D27 (DS18B20) and GPIO 2 (the blue "awake" LED) are now connected, starting in Module 9, and there's a new **Node 2 battery circuit** section: 18650 → TP4056 → MT3608 (5.0 V) → VIN, all on the mini breadboard.
   - **Node 1's I2C bus**: address `0x40` is reserved for the INA219 as a **temporary measuring tool** (in the same holes as the BME280 in Module 7), connected only while measuring.
   - **History**: version 4.
3. Save (**Ctrl + S**).

### D. The Phase 1 checkpoint 🎉

With this module, Phase 1 is complete. Before you move on to Phase 2, check the evidence in [Syllabus §8](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase):

| Evidence | From | Done? |
| :--- | :--- | :---: |
| The Module 5–9 quizzes, each with **≥ 4 correct** | 📝 in every module | ☐ |
| **Node 1 on its own for 24 hours from an adapter** | section A above | ☐ |
| **A measured battery sketch**: sleep current < 15 mA + a battery-life calculation | Practice 6 | ☐ |
| **Node 1 firmware v1.0** in `mini-smart-home` | Module 8 | ☐ |
| **A photo of the circuit** (`workbench.jpg`) and the **Node 1 schematic** | Modules 5 and 7 | ☐ |
| **`PIN-MAP.md`** (now version 4) | Modules 5–9 | ☐ |
| **A 30-second video** | below | ☐ |

**Record a 30-second video** with your phone, in landscape, somewhere bright. It doesn't have to be pretty; what matters is that it's clear. An example order:

1. **Seconds 0–10:** the Node 1 workbench and its charger, without a laptop. Hold the button so the status page (uptime, `Boot #`) shows.
2. **Seconds 10–20:** press the button briefly (the lamp relay goes "click"), then lift the soil sensor until the pump runs for a moment.
3. **Seconds 20–30:** the second board on its battery circuit. Press the second board's **EN** button: its blue LED lights up right away for about 1 second, a sign that the Node 2 skeleton wakes up, reads the temperature, then goes back to sleep. Without EN, the next blink may only come 30 seconds later.

Save the video as **`video-phase-1.mp4`** in the `module-09` folder of the `learn-iot` repository. Choose **720p** resolution in the camera settings to keep the file small: GitHub rejects files larger than 100 MB, and already warns from 50 MB. Also photograph the battery circuit from above and save it as **`battery-circuit.jpg`** in the same folder. Make sure no personal items end up in the video or the photo.

### E. Commit and push

1. In GitHub Desktop, choose **`mini-smart-home`** in the **Current repository** box — always check this box before you commit!
2. The **Changes** tab lists two changes: the new folder `firmware/node-2-garden` (holding `node-2-garden.ino`) and `PIN-MAP.md`.
3. Fill in **Summary** with `Node 2 skeleton v0.1.0 and PIN-MAP version 4`, click **Commit 2 files to main**, then **Push origin**.
4. Switch to the **`learn-iot`** repository. The **Changes** tab lists `notes-module09.md`, `video-phase-1.mp4`, and `battery-circuit.jpg` (plus any sketches you didn't commit in Practice 8). Commit with a summary such as `Module 9: 24-hour adapter test and Phase 1 checkpoint`, then **Push origin**.
5. On github.com, open the `module-09` folder of the `learn-iot` repository, click `video-phase-1.mp4`, then make sure the video can be played or downloaded.

---

## 📖 Glossary

| Term | Short meaning |
| :--- | :--- |
| **Adapter** (charger) | Turns 220 V mains (PLN) power into 5 V. It keeps supplying power as long as the wall outlet has power, whatever current is asked of it. |
| **Power bank** | A Li-ion battery with a voltage booster up to 5 V. Many switch themselves off if the current drawn is too small. |
| **VIN pin** | The way into the ESP32 board's 5 V line, after the diode and before the regulator. Feed it a steady 5 V. |
| **3V3 pin** | The ESP32 board's 3.3 V line, after the regulator. In this curriculum, it's only used as an output for small sensors. |
| **Regulator** | A part that turns an input voltage into a fixed voltage. On the DevKit V1: the AMS1117-3.3, from 5 V to 3.3 V. |
| **Regulator breathing room** (*dropout*) | The smallest voltage difference between a regulator's input and output that keeps its output steady. For the AMS1117, about 1.1 V (at most 1.3 V). |
| **Brownout** | A voltage that briefly dips below a safe limit. The ESP32's brownout detector then restarts the board. |
| **Buffer capacitor** | A capacitor, for example 100 µF, near where the power comes in. It chips in current when there's a surge, like a small reservoir. |
| **Deep sleep** | The most power-saving sleep: almost the whole chip is off, except the RTC part. After waking up, the program starts again from `setup()`. |
| **Light sleep** | A sleep that pauses the processor but keeps the contents of RAM. After waking up, the program continues from the next line. |
| **Wake door** (*wake-up source*) | Something that's allowed to wake the board up: the timer alarm, a pin (ext0, GPIO), touch, and others. Set up before sleeping. |
| **ext0** | A wake door from one RTC pin that goes HIGH or LOW. Used for the D13 button in Practice 3. |
| **RTC pin** | A pin that stays "awake" during deep sleep, so it can be used as a wake door. D13 is one of them. |
| **RTC memory** | A small memory (8 KB) that stays powered during deep sleep. Its contents are lost if the board restarts or loses power. |
| **`RTC_DATA_ATTR`** | A mark in front of a variable so that it's kept in RTC memory, for example `RTC_DATA_ATTR int wakeCount = 0;`. |
| **Li-ion 18650** | A rechargeable lithium-ion battery measuring 18 × 65 mm. Full at 4.2 V, nominal 3.6–3.7 V. |
| **mAh** (milliampere-hour) | The unit of battery capacity. 2,500 mAh ≈ 25 mA for 100 hours. |
| **TP4056** | A Li-ion battery charger module. The 6-pad version also has a protection chip. |
| **Battery protection** | A circuit that disconnects the battery when it's too empty, too full, or short-circuited. It only guards the OUT+/OUT− path. |
| **MT3608** | A voltage booster module (*boost converter*). In this module, it turns the battery's 3.0–4.2 V into 5.0 V. |
| **Efficiency** | The percentage of power that actually reaches the output. The rest becomes heat. |
| **INA219** | An I2C current and voltage meter module (address `0x40`), with a 0.1 Ω shunt resistor. |
| **Shunt resistor** (measuring resistor) | A small resistor that the current passes through. The voltage across its two ends is proportional to the current. |
| **Average current** | The current that, if it flowed steadily, would use up the same charge as the alternating awake and sleep currents. |
| **Battery life** | The usable capacity divided by the average current on the battery side. |

---

## 📝 5-Question Quiz

1. A friend connects a freshly charged 18650 battery **straight to the 3V3 pin** of a DevKit V1 board. Another friend connects one **straight to the VIN pin**. (a) What can happen to each board? (b) What's the right way to power a board from that battery, and why?
2. An ESP32 board is plugged into a power bank. While an ordinary sketch (without sleep) runs, the board is fine. As soon as the sketch is replaced with one that sleeps for 30 seconds, the board wakes up once, then never wakes up again. (a) What's the cause? (b) Name two ways out.
3. Look at this snippet:

   ```cpp
   int countA = 0;
   RTC_DATA_ATTR int countB = 0;

   void setup() {
     countA++;
     countB++;
     Serial.begin(115200);
     Serial.printf("A=%d B=%d\n", countA, countB);
     Serial.flush();
     esp_sleep_enable_timer_wakeup(10 * 1000000ULL);
     esp_deep_sleep_start();
   }
   ```

   (a) What's printed on the third wake-up? (b) After that, the EN button is pressed. What's printed? (c) Why does this sketch's `loop()` never run?
4. The second board is awake for 1.0 second at 50 mA, then sleeps for 29 seconds at 6 mA (both on the 5 V side). Its battery is 3,000 mAh. Calculate (a) the average current on the 5 V side, (b) the current on the battery side (use the factor 1.6), and (c) the estimated battery life in days (use 80% of the capacity).
5. (a) Why is the DevKit V1 board's sleep current much bigger than the 10 µA in the ESP32 chip's datasheet? Name two causes. (b) A friend wants Node 2's battery to last twice as long, so they change its sleep time from 30 seconds to 60 seconds. Does it work? Explain.

<details>
<summary><b>Answer key & explanations</b></summary>

1. (a) **The 3V3 pin:** the power goes straight into the ESP32 chip without passing through the regulator, while a full battery is at 4.2 V, above the chip's limit (about 3.6 V). The chip can be damaged. **The VIN pin:** the board isn't damaged, but its regulator needs a little over 1 V of breathing room. With an input of 3.0–4.2 V, its output drops below 3.3 V, so the board restarts easily because of brownouts, more and more often as the battery runs down. (b) Battery → **TP4056** (charger and protection, load taken from OUT+/OUT−) → **MT3608** set to **5.0 V** with a multimeter, with no load → the board's **VIN** pin and GND (Concepts 1 and 7).
2. (a) The power bank switches itself off if the current drawn stays too small for a while. A sleeping board draws only a few mA, so the power bank thinks nothing is charging, then shuts off. The board won't wake up again until the power bank is turned back on. (b) Use the right source: an **adapter** for a device near a wall outlet, or the **18650 + TP4056 + MT3608 circuit** for a battery-powered device; or turn on the power bank's **low-current mode** if it has one. Adding a wasteful load isn't a good way out.
3. (a) **`A=1 B=3`**: `countA` in RAM goes back to 0 on every wake-up, while `countB` in RTC memory keeps going up. (b) **`A=1 B=1`**: the EN button wipes RTC memory, just like unplugging the power. (c) After `esp_deep_sleep_start()`, the board sleeps, and when it wakes up, the program starts again from `setup()`. The end of `setup()` is never reached, so `loop()` never runs.
4. (a) (50 × 1 + 6 × 29) ÷ 30 = (50 + 174) ÷ 30 ≈ **7.5 mA**. (b) 7.5 × 1.6 = **12 mA**. (c) Usable capacity 3,000 × 0.8 = 2,400 mAh; 2,400 ÷ 12 = 200 hours ≈ **8.3 days**.
5. (a) The parts of the board that don't sleep along with the chip, for example: the **AMS1117 regulator**, which needs a few mA of "running money", the red **power LED**, which stays on, and the **USB-serial chip**, which still gets power from the 3.3 V line. The ESP32 chip itself really is only about 10 µA. (b) **Hardly.** Sleep already accounts for most of the battery use (almost three quarters in the Concept 9 example), and the sleep current doesn't change. With the Concept 9 example numbers, the average current only drops from 6.6 mA to (55 × 1.0 + 5 × 60) ÷ 61 ≈ 5.8 mA, so the battery life grows by about 14%, not 100%. What really helps is lowering the board's sleep current (Concept 10).

</details>

---

## ✅ Module 9 Completion Checklist

Check them all before you move on to Module 10:

- [ ] I can explain the ESP32 board's three power doors (USB, VIN, 3V3), and I know why a Li-ion battery must not go straight into the 3V3 pin or the VIN pin.
- [ ] Node 1 works from its own charger, and the pump and the relay don't make it restart (Practice 1).
- [ ] I saw for myself the difference between RAM, RTC memory, and NVS when the board sleeps, is restarted, and has its power unplugged (Practice 2).
- [ ] The board can be woken up by the timer alarm **and** by the button, and I know the difference between deep sleep and light sleep (Practice 3).
- [ ] The Node 2 skeleton sleeps, wakes up every 30 seconds, reads the DS18B20, then goes back to sleep (Practice 4).
- [ ] The 18650 → TP4056 → MT3608 (5.0 V) circuit powers the second board without a laptop, and I set the MT3608 with the multimeter **before** connecting it to the board (Practice 5).
- [ ] ⭐ **The second board's sleep current measures less than 15 mA**, and I wrote the battery-life calculation steps myself (Practice 6).
- [ ] I know why a power bank isn't suitable for a device that sleeps (Practice 7).
- [ ] ⭐ **Node 1 ran for 24 hours from an adapter, not from a laptop, without a restart** (➕ A): uptime ≥ 24:00:00, and the `Boot #` number didn't change.
- [ ] `firmware/node-2-garden` and `PIN-MAP.md` version 4 are committed and pushed to `mini-smart-home`; this week's sketches, notes, photo, and video are in `learn-iot/module-09`.
- [ ] ⭐ **Quiz: at least 4 of 5 correct.**

**You pass when** (according to the Syllabus): *Node 1 runs from an adapter (not a laptop) for 24 hours, and your battery sketch measures < 15 mA while asleep, with a battery-life calculation you wrote yourself.*

🎉 **Phase 1 checkpoint.** If all the evidence in the ➕ D table is checked off, **Phase 1 is complete**. You now have a robust, independent Node 1 and a low-power Node 2 skeleton. In **[Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md)**, Node 1 starts talking to the network over Wi-Fi and HTTP.

---

## 📚 Sources & Image Credits

**Documentation, datasheets, and test results used** (accessed October 2026):

- [ESP32 Series Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) v5.3 (Espressif) — the chip's current in every state (active, light sleep 0.8 mA, deep sleep 10 µA, ULP) and the recommended power source of at least 0.5 A.
- ESP-IDF 5.5 documentation: [Sleep Modes](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/sleep_modes.html) (wake doors, RTC pins, the RTC pull-up, `rtc_gpio_deinit()`, Serial output before sleeping), [Deep-sleep Wake Stubs](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/deep-sleep-stub.html) and [Memory Types](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/memory-types.html) (when RTC memory is reinitialized, `RTC_NOINIT_ATTR`), [esp_timer](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/esp_timer.html) (`millis()` during sleep), [ULP](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/ulp.html), and [Current Consumption Measurement of Modules](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/current-consumption-measurement-modules.html) (why an ordinary multimeter isn't well suited).
- The source code of [arduino-esp32](https://github.com/espressif/arduino-esp32) 3.3.12: the `TimerWakeUp` and `ExternalWakeUp` examples, and its default `sdkconfig` (brownout detector level 0, about 2.43 V); the source code of [ESP-IDF](https://github.com/espressif/esp-idf) 5.5.5 (`brownout.c`, `esp_sleep.h`, `esp_system.h`).
- The DOIT ESP32 DevKit V1 schematic shared by [mischianti.org](https://mischianti.org/doit-esp32-dev-kit-v1-high-resolution-pinout-and-specs/) (the SS14 diode from USB to VIN, the CP2102 powered from the 3.3 V line, the red LED with a 1 kΩ resistor). Clone boards may differ.
- The datasheets of the [AMS1117](http://www.advanced-monolithic.com/pdf/ds1117.pdf) (breathing room of 1.1–1.3 V, quiescent current of about 5 mA), [TP4056](https://datasheet.lcsc.com/datasheet/pdf/d328ee101cbb1f3719611cd61db479c2.pdf?productCode=C16581) (4.2 V, charging current, lights), [DW01A](https://datasheet.lcsc.com/datasheet/pdf/4337bed4215d48fabf2b81d65cba2241.pdf?productCode=C14213) (the 2.4 V and 4.3 V limits), [MT3608](https://www.olimex.com/Products/Breadboarding/BB-PWR-3608/resources/MT3608.pdf) (1.2 MHz, output up to 28 V), [INA219](https://www.ti.com/lit/ds/symlink/ina219.pdf) (shunt resistor, range, address), and [DS18B20](https://cdn-shop.adafruit.com/datasheets/DS18B20.pdf) (measuring time of 94–750 ms).
- The [MT3608 module page at ProtoSupplies](https://protosupplies.com/product/mt3608-mini-adjustable-dc-dc-boost-module/) (the module's quiescent current of about 1 mA, the multi-turn potentiometer) and the [Adafruit INA219 guide](https://learn.adafruit.com/adafruit-ina219-current-sensor-breakout); the [Adafruit INA219](https://github.com/adafruit/Adafruit_INA219) library 1.2.3. USB-C ports that need CC resistors on the module side: [Hackaday, "All About USB-C: Resistors And Emarkers"](https://hackaday.com/2023/01/04/all-about-usb-c-resistors-and-emarkers/).
- [Battery University](https://batteryuniversity.com/) BU-205, BU-304a, and BU-409 (Li-ion voltages, safety, and charging without a load); battery reviews at [lygte-info](https://lygte-info.dk/) (the Samsung 25R/35E datasheets and the test of a fake "10000 mAh" battery).
- Power bank tests: [Zak Kemble](https://blog.zakkemble.net/smart-power-bank-keep-alive/) and [0110.be](https://0110.be/posts/Powering_low_current_electronics_projects_with_power_banks); the low-current mode from the help pages of [Xiaomi](https://www.mi.com/uk/support/faq/details/KA-301691/) and [Anker](https://www.anker.com/eu-en/products/a1268); always-on power banks from [Voltaic Systems](https://voltaicsystems.com/always-on/).
- Board sleep current measurements: [grillbaer](https://github.com/grillbaer/esp32-power-consumption-test), [Lucidar](https://lucidar.me/en/esp32/power-consumption-of-esp32/), [CircuitDigest](https://circuitdigest.com/microcontroller-projects/esp32-active-mode-and-deep-sleep-mode-power-consumption); the TinyPICO from its maker's page, Unexpected Maker; the FireBeetle from the [wiki](https://wiki.dfrobot.com/dfr0654) and the [DFRobot forum](https://www.dfrobot.com/forum/topic/12177).
- Multimeters: [Fluke, "Can you live with the burden?"](https://www.fluke.com/en-au/learn/blog/electrical/can-you-live-with-the-burden), a teardown of a cheap multimeter at [lygte-info](https://lygte-info.dk/review/DMMDT-830B%20UK.html), and EEVblog's small-current amplifier, the [µCurrent GOLD](https://www.eevblog.com/projects/ucurrent/); solar panels: [Adafruit, USB, DC & Solar Lipoly Charger](https://learn.adafruit.com/usb-dc-and-solar-lipoly-charger/design-notes).

**Images.** The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The photo collage follows the license of its photos. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-09`, `three-power-doors`, `power-bank-trap`, `brownout-staircase`, `sleep-levels`, `three-memories` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The chip current numbers from the ESP32 datasheet; the board's power path from the DOIT DevKit V1 schematic; the power bank limits from the tests above. | CC BY 4.0 |
| `battery-18650`, `battery-power-chain`, `current-measurement-ina219`, `battery-life`, `honest-devkit-v1` (`.png` + `.svg`) | Original diagrams. The battery voltage limits from Battery University and the datasheets; the current of similar boards from the measurements above; the battery life calculated the Concept 9 way. | CC BY 4.0 |
| `battery-circuit`, `adjust-mt3608`, `workbench-ina219`, `current-meter-circuit` (`.png` + `.svg`) | Original illustrations, with the holes exactly as in the Practice 5 and 6 tables; the Node 1 workbench continues the illustrations of Modules 5–7. | CC BY 4.0 |
| `meet-the-battery-parts.jpg` | Wikimedia Commons photos: the [18650 and AA batteries](https://commons.wikimedia.org/wiki/File:Liion-18650-AA-battery.jpg) by Lead holder (CC BY-SA 3.0), the [TP4056](https://commons.wikimedia.org/wiki/File:TP4056_board_P1089956.jpg) by -stk (CC BY-SA 4.0), the [MT3608](https://commons.wikimedia.org/wiki/File:Voltage_Boost_Converters.jpg) by Ogidya (CC BY-SA 4.0), and the [INA219](https://commons.wikimedia.org/wiki/File:Adafruit_INA219_high_side_DC_current_sensor_module.jpg) by oomlout (CC BY-SA 2.0); the TP4056, MT3608, and INA219 photos are cropped, all the photos are scaled down, and the labels and the collage layout are by the author. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en), following its photos |

All the sketches in this module, including the Practice 6 current meter, have been compiled with version 3 of the esp32 package, and the Practice 3B light sleep sketch has been run in Wokwi (with the timer alarm only). Because Wokwi doesn't run deep sleep in Arduino sketches correctly yet and has no INA219, the **Expected output** boxes for the deep sleep and current meter sketches are example output on a real board, not simulator recordings: the deep sleep output is put together from Espressif's official documentation and examples, while the current meter's numbers follow the measurements of similar boards cited above.

---

[⬅️ Module 8](../module-08-robust-firmware/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 10 — Wi-Fi & HTTP: Devices Start Talking to the Network](../../phase-2-connectivity/module-10-wifi-and-http/README.md) ➡️**
