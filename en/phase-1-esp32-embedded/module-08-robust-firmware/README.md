# Module 8 — Robust Firmware: millis(), State Machines, Modular Code, Watchdog, & Debugging

🌐 **English** · [Bahasa Indonesia](../../../fase-1-esp32-embedded/modul-08-firmware-tangguh/README.md)

*Phase 1 · Week 8 · Hardware: **the Node 1 workbench from Module 7** — no new parts and no new wires; you can also try every practice in Wokwi · Prerequisite: **Module 7** (Node 1 v0.4.0 with the OLED display) · Time: 8–10 hours, spread over the week*

[⬅️ Module 7](../module-07-sensor-bus-oled-schematics/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 9 ➡️](../module-09-power-and-low-power/README.md)

---

Over the last three weeks, Node 1 has gotten smarter: it has five senses (Module 6), a display of its own (Module 7), and two automatic rules. But if you look closely, Node 1 v0.4.0 still has a few bad habits:

| What happens in Node 1 v0.4.0 | The cause | This week's cure |
| :--- | :--- | :--- |
| While the pump runs for 3 seconds, the button doesn't react, Serial commands go unanswered, and the display freezes. | `delay(seconds * 1000)` inside `runPump()` | The `millis()` pattern (Concepts 1–2) |
| While the button is held down, every other task stops. | `buttonPressed()` waits for the finger to lift | A button that doesn't wait (Practice 2) |
| "Every 2 seconds" really means "every 200 passes of `loop()`", so the schedule drifts when the passes slow down. | `delay(10)` and a pass counter | A schedule based on the clock (Concept 2) |
| If the program gets stuck, Node 1 stays silent forever, until someone presses the EN button. | There's no "guard" | The watchdog (Concept 8) |
| The "dry soil" threshold is built into the code. To change it, you have to upload the program again. | The threshold is written as a constant | NVS (Concept 7) |
| As many as 650 lines of code are piled up in a single file. | The program has kept growing since Module 3 | Modular code (Concept 5) |
| When something odd happens, we guess at the cause. | `Serial.print` scattered everywhere | Leveled logging and systematic debugging (Concepts 9–10) |

One by one, we replace those habits this week. The result is **Node 1 v1.0**: the first version that deserves to be called "finished" — **standalone** (it keeps working without a laptop and without the internet), **modular** (its code is split into several tidy files), and **robust** (it doesn't freeze, it restarts itself if it gets stuck, and it still remembers its settings after a power cut). The completion test is new too: Node 1 must run for **24 hours without a restart**.

This week you don't add any new parts. What you "assemble" is the way of thinking that real firmware uses, from smartwatches to washing machines: **never wait idly, always know which stage you're in, and always be ready in case something goes wrong**.

![Module 8 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations to Phase 5 Operations and scale; Phase 1 ESP32, Modules 5 to 9, is highlighted, Modules 1 to 7 are marked done, and Module 8 is marked YOU ARE HERE with the note firmware that never falls asleep. Bottom: the box for this week's Module 8, about 8 to 10 hours spread over the week with no new parts, holding ten things: QW, the Quick Win, blinking while listening to the button; P1, the delay() trap, see it for yourself; P2, three tasks, one loop(); P3, a watering state machine; P4, modular code, .h and .cpp files; P5, a threshold that doesn't forget, NVS; P6, the watchdog, stuck on purpose, then rescued; P7, leveled logging and a bug hunt; P8, saving the sketches and notes to GitHub; and a plus sign, the Add-on: Node 1 version 1.0 and the 24-hour test. Stars mark P2, P5, P6, and the Add-on as part of the completion requirements](assets/roadmap-module-08.png)

> [!NOTE]
> **How to use this module.**
>
> - Every code box has a copy button in its top right corner. All the sketches are also available as files in the [`code/`](code/) folder, complete with `diagram.json` (and `libraries.txt` where needed) for Wokwi.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing.
> - **There are no new wires this week.** Every practice uses the circuit that has been on your workbench since Module 7. In Wokwi, the Quick Win and Practices 1, 5, and 6 use a small circuit (the ESP32 board, the status LED, and the button), while Practices 2, 3, 4, and 7 and Node 1 v1.0 use the complete Node 1 circuit from Module 7.
> - **The numbers in Wokwi differ from those on a real board**, especially the number of `loop()` passes per second. The simulator runs your program more slowly than the real chip, so your numbers on a real board may be many times larger. That's normal.
> - **The ESP32 board in Wokwi is still turned on its side**, as in Modules 6–7: the USB connector on the left, the VIN…EN row of pins at the top, and the 3V3…D23 row at the bottom.
> - Wokwi's free servers are sometimes busy. If a `Build Servers Busy` window appears, your program is waiting in line to be built: wait a few minutes. If the simulation still doesn't start, click **CLOSE**, stop the simulation (the **■** button), and try again later.
> - macOS users: replace **Ctrl** with **Cmd** to save, select all, copy, find, paste, and create a new tab.

> [!WARNING]
> **Three safety rules this week.**
>
> 1. **No wires need to be moved this week.** If you do have to touch a wire anyway (for example, one has come loose, or during the "broken sensor" test in Practice 2), use the golden rule from Module 5: turn off the MB102, then unplug the USB. Turning things back on has an order too: plug in the USB first, then turn on the MB102.
> 2. **Practices 3, 4, and 7, as well as Node 1 v1.0, run the real pump.** Make sure the water tank has water in it and that the end of the hose points into the plant glass or back into the tank, as in Module 6. Everything that holds water stays on the tray, away from the breadboard and the laptop.
> 3. **The 24-hour test means Node 1 runs unattended.** Put the workbench on a dry surface that doesn't burn easily, out of reach of small children and pets. Point the pump hose back into the water tank and tape or clip its end to the tank wall, so that if the pump runs many times, the water just circulates, and the hose can't slip out. If you smell burning or a part feels very hot, turn off the MB102, then unplug the USB.

This module follows the same rhythm as Modules 1–7. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools and parts it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: blinking while listening to the button, without `delay()` (10 minutes)](#-quick-win-blinking-while-listening-to-the-button-without-delay-10-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 The `delay()` trap](#1-the-delay-trap-asleep-on-its-feet) · [2 The `millis()` pattern](#2-the-millis-pattern-glancing-at-the-wall-clock) · [3 The clock that wraps around](#3-unsigned-long-and-the-clock-that-wraps-back-to-zero) · [4 State machines](#4-state-machines-states-and-transition-rules) · [5 Modular code](#5-modular-code-one-sketch-several-files) · [6 `char[]` & `snprintf()`](#6-char-and-snprintf-building-text-without-borrowing-memory) · [7 NVS](#7-nvs-and-preferences-a-filing-cabinet-that-doesnt-forget) · [8 Watchdog](#8-the-watchdog-a-guard-that-restarts-a-stuck-program) · [9 Leveled logging](#9-leveled-logging-debug-info-error) · [10 Systematic debugging](#10-systematic-debugging-be-a-detective-not-a-guesser)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 The `delay()` trap](#practice-1--the-delay-trap-see-it-for-yourself-20-minutes) · [2 Three tasks ⭐](#practice-2--three-tasks-one-loop-30-minutes) · [3 State machine](#practice-3--a-watering-state-machine-30-minutes) · [4 Modular code](#practice-4--modular-code-split-it-into-several-files-35-minutes) · [5 NVS ⭐](#practice-5--a-threshold-that-doesnt-forget-nvs-25-minutes) · [6 Watchdog ⭐](#practice-6--the-watchdog-stuck-on-purpose-then-rescued-30-minutes) · [7 Bug hunt](#practice-7--leveled-logging-and-a-bug-hunt-35-minutes) · [8 GitHub](#practice-8--save-to-github-15-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-8-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

- **Explain why `delay()` makes a program "deaf"**, then replace it with the `millis()` pattern so that several tasks take turns without waiting for each other.
- **Make a button that recognizes a short press and a long press** without freezing the program.
- **Build a simple state machine** with an `enum`: a list of states plus rules for when to move from one to another. This kind of machine runs Node 1's watering and its main cycle.
- **Split one sketch into several `.h` and `.cpp` files**, and recognize the two errors that typically come with it: a forgotten `#include` and *undefined reference*.
- **Build text with `char[]` and `snprintf()`** without `String`.
- **Store settings in NVS** with the **Preferences** library so they survive a power cut.
- **Set up a watchdog the way version 3 of the esp32 package writes it**, then read the restart reason and the panic message it prints.
- **Print leveled logs** (DEBUG, INFO, ERROR) and **hunt bugs systematically**, instead of guessing.
- **Run a 24-hour endurance test** (30 minutes in Wokwi) with an uptime counter (how long the board has been running) on the OLED display.

---

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **The workbench from Module 7** | Two breadboards, the ESP32 board, the MB102 + 5 V 2 A adapter + USB A–A cable, all five sensors, all the actuators, and the OLED display. **Leave everything connected.** The microSD module may stay connected or not, as you like. |
| **The water tank, pump, and plant glass from Module 6** | Used by Practices 3, 4, and 7 and by Node 1 v1.0. Fill the tank with water and put everything on the tray. |
| **Laptop + Arduino IDE 2 + USB data cable** | Installed since Module 2. There are no new libraries to install this week. |
| **For the 24-hour test: a USB power source for the ESP32 that doesn't "go to sleep"** | Pick one: (a) a **branded 5 V phone charger** of at least 1 A, with a USB cable that fits your ESP32 board's connector (**not** a power bank, which often switches itself off when the current is small); or (b) a laptop set up so that it doesn't sleep while it's plugged in. Option (a) is the easiest, because your laptop stays free to use. |
| **Paper + pencil (or a notes file)** | For drawing a state machine (Practice 3) and writing your bug-hunting notes (Practice 7). |
| **Browser + Wokwi** | For the Quick Win and for trying every practice before running it on the real board. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. |
| Board package **esp32 by Espressif Systems** | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. It already brings the **Preferences** library (NVS) and the `esp_task_wdt_…` watchdog functions, so you don't need to install either one. |
| Libraries from Modules 5–7 | **ESP32Servo** 3.2.1, **DHT sensor library** 1.4.7 (+ **Adafruit Unified Sensor** 1.1.15), **Adafruit SSD1306** 2.5.17 (+ **Adafruit GFX Library** 1.12.6 and **Adafruit BusIO** 1.17.4) | Already installed. Used again by Practice 2 and Node 1 v1.0. |

---

## 🏆 Quick Win: blinking while listening to the button, without `delay()` (10 minutes)

Since Module 2, your LED has blinked with `delay()`: turn it on, wait, turn it off, wait. That's easy, but while it waits, the ESP32 can't do anything else. Now let's try another way. We start in Wokwi so you see the result right away, without touching the workbench.

> 🖥️ **Tools used in this section:** a browser and the [Wokwi](https://wokwi.com) site. No kit needed, nothing to install.

1. Open **https://wokwi.com/projects/new/esp32** in your browser. An empty ESP32 project appears: code on the left, the board on the right.
2. Right-click the link [`code/module08_blink_without_delay/diagram.json`](code/module08_blink_without_delay/diagram.json) → **Open link in new tab**, then click the **Copy raw file** button (the two-squares icon) at the top right of the file contents. Go back to the Wokwi tab, click the **`diagram.json`** tab above the editor, select all its contents (**Ctrl + A**), then paste (**Ctrl + V**). On the right, the ESP32 board is now on its side. At its top left is a green button connected to **D13**, and below the board is a red LED with a resistor, connected to **D4**. It's the same circuit as the status LED and the manual button on your workbench.
3. Click the **`sketch.ino`** tab, delete its contents, then paste this code:

   ```cpp
   // Module 8 - Quick Win: the LED blinks and the button is still heard, without delay()
   // Circuit: status LED on D4 (through a 220 ohm resistor) and a button on D13 (its opposite leg to GND).
   // Press the button any time: the LED's blink rhythm switches at once, slow <-> fast.

   const int PIN_STATUS_LED = 4;
   const int PIN_BUTTON = 13;
   const unsigned long DEBOUNCE_DELAY = 30;  // milliseconds: the button reading must stay steady this long (Module 5)

   unsigned long blinkDelay = 500;    // the LED switches on/off every 500 ms (slow)
   unsigned long lastBlinkTime = 0;   // when the LED last switched
   unsigned long lastReportTime = 0;  // when Serial last reported
   unsigned long lastChangeTime = 0;  // when the button reading last changed
   bool ledOn = false;
   int previousReading = HIGH;  // the button reading on the previous pass; HIGH = released (INPUT_PULLUP)
   int stableButton = HIGH;     // the button state we already trust (its reading has been steady for 30 ms)
   int changeCount = 0;         // how many times the LED has switched
   int pressCount = 0;          // how many times the button has been pressed

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     Serial.println("Module 8 Quick Win: the LED blinks, the button is always heard.");
   }

   void loop() {
     unsigned long now = millis();  // glance at the "wall clock" once at the start of every pass

     // Task 1: time for the LED to switch?
     if (now - lastBlinkTime >= blinkDelay) {
       lastBlinkTime = now;
       ledOn = !ledOn;
       digitalWrite(PIN_STATUS_LED, ledOn);  // true = HIGH (on), false = LOW (off)
       changeCount++;
     }

     // Task 2: has the button just been pressed? Checked on EVERY pass.
     int reading = digitalRead(PIN_BUTTON);
     if (reading != previousReading) {  // the reading changed: pressed, released, bouncing, or noise
       previousReading = reading;
       lastChangeTime = now;            // start counting "steady" from zero again
     }
     if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
       stableButton = reading;          // steady for 30 ms: this change is real
       if (stableButton == LOW) {       // changed from released to pressed
         pressCount++;
         if (blinkDelay == 500) {
           blinkDelay = 100;
           Serial.println("Button pressed! Blink rhythm: FAST");
         } else {
           blinkDelay = 500;
           Serial.println("Button pressed! Blink rhythm: SLOW");
         }
       }
     }

     // Task 3: time to report? (every 2 seconds)
     if (now - lastReportTime >= 2000) {
       lastReportTime = now;
       Serial.print("Second ");
       Serial.print(now / 1000);
       Serial.print(": LED switches: ");
       Serial.print(changeCount);
       Serial.print(", button presses: ");
       Serial.print(pressCount);
       Serial.println(".");
     }
   }
   ```

4. Click the green **▶** button. Once the program has been built, the LED blinks slowly and the Serial Monitor (below the simulation panel) reports every 2 seconds.
5. **Click the green button in the circuit at any time.** The LED's blink rhythm switches to fast right away; click once more, and it's slow again. No press is missed, even if you click exactly while the LED is on.

   **Expected output** (your numbers may differ, depending on when you click; the picture below was taken after a single click):

   ```text
   Module 8 Quick Win: the LED blinks, the button is always heard.
   Second 2: LED switches: 3, button presses: 0.
   Second 4: LED switches: 7, button presses: 0.
   Second 6: LED switches: 11, button presses: 0.
   Button pressed! Blink rhythm: FAST
   Second 8: LED switches: 28, button presses: 1.
   Button pressed! Blink rhythm: SLOW
   Second 10: LED switches: 41, button presses: 2.
   ```

![Wokwi screenshot of the Quick Win, cropped and rearranged. Top left: the circuit in the simulation panel: the green D13 button at the top left (marker 1, click it any time; its opposite leg goes to GND), the ESP32 board on its side, and the red LED, lit, below the board, connected to D4 through a 220 ohm resistor (marker 2, blinks slowly, and fast after the button is clicked); a note says the triangle symbol is GND, a Wokwi power symbol, not an extra wire. Bottom: the Serial Monitor: the reports for Second 2, 4, and 6 with 3, 7, and 11 LED switches and 0 button presses; then Button pressed! Blink rhythm: FAST (marker 3); then Second 8, 10, and 12 with 24, 44, and 64 LED switches and 1 button press. The caption of marker 3: afterward the LED switches 20 times every 2 seconds, before that only 4 times](assets/wokwi-quick-win.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

Congratulations — your ESP32 has just done three tasks in turn without a single `delay()`. Notice three things in the code:

- **`millis()` is the ESP32's wall clock**: the number of milliseconds since the board powered up. Every pass of `loop()` starts by **glancing at the clock** once (`now = millis()`).
- **Every task asks "is it time yet?"**: `if (now - lastBlinkTime >= blinkDelay)`. If not, `loop()` moves straight on to the next task instead of waiting. If it is, the task is done and the time is noted (`lastBlinkTime = now`).
- **The button is checked on every pass**, tens of thousands of times per second, so no press is missed. A change is only trusted once the reading has **stayed steady for `DEBOUNCE_DELAY`** (30 milliseconds), so bounces and brief noise don't count. The idea is the same as in Module 5, but this time without waiting: we only note when the button reading last changed (`lastChangeTime`).

Curious? Click **■** to stop the simulation, change `blinkDelay = 100;` to `blinkDelay = 40;`, then click **▶** again: the fast rhythm now looks almost like a strobe light. In Practice 1, you compare a sketch like this one with a `delay()` version and see for yourself how many button presses get lost.

---

## 🧠 The "Why" Concepts

Ten concepts, one per section — **you don't need to read them all at once**. Concepts and practices alternate in this order:

1. Concepts 1–3 → Practices 1–2 (the `delay()` trap, then three tasks in one `loop()`)
2. Concept 4 → Practice 3 (a watering state machine)
3. Concept 5 → Practice 4 (modular code)
4. Concepts 6–7 → Practice 5 (a threshold stored in NVS)
5. Concept 8 → Practice 6 (the watchdog)
6. Concepts 9–10 → Practices 7–8 (leveled logging, the bug hunt, and GitHub)
7. 🧩 Challenges → ➕ Mini Smart Home (Node 1 v1.0 and the 24-hour test) → 📝 Quiz → ✅ Checklist

At every switch point, there's a ➡️ box (forward to the practice) and a ⬆️ box (back to the concepts) with links you only need to click.

> 🖥️ **Want to try the code in the Concepts section?** It's not required — you'll run all the code in the Practices. The code in the Concepts section is only snippets; the full versions are in the Practice sketches, which you can try in Wokwi with the `diagram.json` from the [`code/`](code/) folder, exactly like the Quick Win.

### 1. The `delay()` trap: asleep on its feet

`delay(1000)` means "**stop completely** for 1,000 milliseconds". During that time, `loop()` doesn't move at all: the button isn't checked, Serial commands aren't read, the display isn't updated. The ESP32 is like a security guard who has fallen asleep standing up. The body is at the guard post, but the eyes are closed.

For a small program, this isn't a problem. In Module 2, the LED blinked with `delay(1000)` and there was nothing else to take care of. The trouble starts when one program takes care of many things at once, like Node 1. Look at the places where Node 1 v0.4.0 "falls asleep":

| Line in Node 1 v0.4.0 | How long it sleeps | The result |
| :--- | :--- | :--- |
| `delay(seconds * 1000)` in `runPump()` | 1–10 seconds | While the pump runs, every other task stops. The command `pump 10` freezes Node 1 for 10 seconds. |
| `while (digitalRead(PIN_BUTTON) == LOW)` in `buttonPressed()` | as long as a finger holds the button | Hold the button for 5 seconds, and Node 1 freezes for 5 seconds. |
| `delay(150)` in `soundBuzzer()` and `delay(50)` in `blinkStatus()` | 0.05–0.15 seconds | Small, but still asleep. |
| `delay(2)` 20 times for every analog sensor in `readAnalogAverage()` | about 0.08 seconds per report | Same thing: still asleep. |
| `delay(LOOP_DELAY)` at the end of `loop()` | 0.01 seconds every pass | "Every 2 seconds" really means "every 200 passes". Because every pass also takes time to do its work, the schedule always runs a little slower than every 2 seconds. |

All these problems have one cause: **`loop()` waits**. While it waits, it can't check anything else. In Practice 1, you prove it yourself by counting the button presses that get lost.

![Diagram of two timelines from 0 to 6 seconds with the same five button presses, at 0.7, 1.6, 2.6, 3.5, and 4.5 seconds. Top: the delay() version, where loop() runs once every 2 seconds: the LED switches on and off every second, starting on, while the ESP32 sleeps in three blocks, each one delay(1000) plus delay(1000); the button is only checked for a moment at the end of each block (at seconds 2, 4, and 6), so all five presses carry a red cross. The text says: 0 of 5 presses recorded, the button is only glanced at when the ESP32 wakes up briefly every 2 seconds. Bottom: the millis() version, where loop() runs tens of thousands of times per second: the LED blinks with the same rhythm, starting off; the ESP32 is drawn as a dense row of thin lines, each one a pass of loop() that asks "is it time yet?" and then checks the button; all five presses carry a green check mark. The text says: 5 of 5 presses recorded, nothing falls asleep, so the button is checked all the time](assets/delay-trap.png)

There's one more reason to stop using long `delay()` calls: starting this week, Node 1 is guarded by a watchdog (Concept 8). That guard treats a `loop()` that stops for more than 5 seconds as a **stuck** program, then restarts the board. If a long `delay()` is still there, Node 1 gets restarted over and over, even though the program isn't broken.

### 2. The `millis()` pattern: glancing at the wall clock

Imagine you're cooking rice (done in 20 minutes) while boiling eggs (10 minutes) and waiting for a delivery courier. You don't stand there staring at the pot for 20 minutes. You **note the time you started**, then, while you tidy up the kitchen, you **glance at the wall clock** now and then: "Has it been 10 minutes since the eggs went in? Not yet, keep tidying." If the doorbell rings, you open the door right away, because you're not asleep in front of the pot.

The ESP32 has a wall clock of its own: **`millis()`**, which answers how many milliseconds have passed since the board powered up. You already used it in Module 7 (`millis() / 1000` = seconds since power-up). With that clock, every task can be written with this three-line pattern:

```cpp
unsigned long now = millis();      // 1. glance at the wall clock

if (now - lastTime >= INTERVAL) {  // 2. has INTERVAL passed since the task was last done?
  lastTime = now;                  // 3. note the time...
  // ...then do the task, for example switch the LED on or off
}
```

Four small rules make this pattern work:

1. **Every task has its own time note.** The LED has `lastBlinkTime`, the report has `lastReportTime`, and so on, like separate notes for the rice and for the eggs.
2. **Subtract first, then compare:** write `now - lastTime >= INTERVAL`. This form stays correct even when the ESP32's clock "wraps back to zero" after 49 days (Concept 3).
3. **Use `>=`, not `==`.** `loop()` won't necessarily check at exactly millisecond 1,000; it might only get to check at millisecond 1,001. With `>=`, the task still gets done.
4. **`loop()` never waits; it only checks.** If it's not time yet, `loop()` moves straight on to the next task. Because nothing waits, `loop()` can run tens of thousands of times per second, and every pass asks every task the same question: "is it time yet?"

As a result, one `loop()` can take care of many schedules at once. Each one runs at its own rhythm, and none of them waits for another:

![Diagram of the millis() pattern. Top left: the three numbered lines of code: 1, unsigned long now = millis(); 2, if (now - lastTime >= INTERVAL) {; 3, lastTime = now;, then the comment do the task; notes: glance at the clock, INTERVAL passed?, note the time and do it, and not time yet means moving straight on to the next task. Top right: three tasks, each with its own note: the status LED every 500 ms with lastBlinkTime, the Serial report every 2000 ms with lastReportTime, and the button on every pass with lastChangeTime (steady for 30 ms). Bottom: a timeline from 0 to 4000 ms: a dense row of loop() passes, an LED dot every 500 ms, report dots at 2000 and 4000 ms, and one button press at about 1300 ms that is read right away, as soon as its reading has been steady for 30 ms](assets/millis-pattern.png)

The button is a slightly special task. It has no schedule, but it's checked on **every** pass so that no press is missed. What it remembers isn't "when was it last checked" but "when did its reading last change". A change is only trusted once the reading has stayed steady for 30 milliseconds, so bounces and brief noise don't count. Practice 2 adds one more skill: telling a **short press** from a **long press** without waiting for the finger to lift.

### 3. `unsigned long` and the clock that wraps back to zero

`millis()` keeps its number in a jar of type **`unsigned long`** (Module 3): a whole number that is never negative, from `0` to `4294967295` (about 4.29 billion). In milliseconds, that's **a little over 49 days and 17 hours**. After that, `millis()` **rolls over** (it *overflows*): the number goes back to `0`, then climbs again from the start.

That sounds dangerous, but the pattern from Concept 2 stays correct. Picture a car's six-digit **odometer** (the distance counter). After `999999` km, it goes back to `000000`. If you filled up the tank when the odometer read `999800`, and now it reads `000300`, how far have you driven? The answer is 500 km: 200 km until the digits rolled over, plus 300 km after that. Subtracting "across zero" like that is exactly what the ESP32 does with `unsigned long` numbers:

| | Number in the `unsigned long` |
| :--- | ---: |
| `lastTime` (noted 296 ms before the rollover) | `4294967000` |
| `now` (704 ms after the rollover) | `704` |
| `now - lastTime` | `1000` ✓ — exactly 1 second |

What is **not** safe is calculating a "target time" and then comparing against it:

```cpp
// DON'T: this form breaks when millis() rolls over
unsigned long targetTime = lastTime + INTERVAL;  // 4294967000 + 1000 overflows to 704!
if (millis() >= targetTime) {                    // 4294967000 >= 704 → true right away,
  // ...                                         // the task runs thousands of times with no pause
}
```

Shortly before `millis()` rolls over, `targetTime` overflows first and becomes a small number, so the comparison is true right away, and the task runs on every pass until `millis()` itself rolls over. A mistake like this only shows up once every 49 days, so it's almost impossible to catch while testing. That's why you should get used to the form **`now - lastTime >= INTERVAL`** right from the start.

![Diagram of the clock that wraps back to zero. Left: a six-digit odometer: 999800 when filling up and 000300 now; 200 km until it rolls over, then 300 km more, equals 500 km. Right: millis() in an unsigned long: lastTime is 4294967000, that is, 296 ms before the rollover, and now is 704, that is, 704 ms after the rollover; now minus lastTime equals 1000, exactly 1 second. Bottom: two lines of code: if (now - lastTime >= INTERVAL) with a green check mark, safe forever as long as INTERVAL is shorter than 49.7 days; and if (millis() >= lastTime + INTERVAL) with a red cross, broken once every 49.7 days because the addition overflows too](assets/millis-odometer.png)

Two more habits from this concept:

- **Store time in an `unsigned long`, not in an `int`.** On the ESP32, an `int` already turns negative after about 2.1 billion, that is, after about 24.9 days of running (Module 3, 🔬).
- **To count how long the board has been running (its *uptime*), use a longer clock.** Node 1 v1.0 shows its uptime on the display. With `millis()`, that number would go back to zero after 49 days. That's why the uptime is calculated with `esp_timer_get_time()`, the ESP32's built-in clock that counts **microseconds** in a 64-bit number (twice as long as the 32-bit `unsigned long`), and that only overflows after hundreds of thousands of years.

> ➡️ **Ready to practice?** Continue to [Practice 1 — The `delay()` trap: see it for yourself](#practice-1--the-delay-trap-see-it-for-yourself-20-minutes) and [Practice 2 — Three tasks, one `loop()`](#practice-2--three-tasks-one-loop-30-minutes). When you're done, come back to [Concept 4](#4-state-machines-states-and-transition-rules).

### 4. State machines: states and transition rules

> ⬆️ **Just finished Practices 1–2?** Great. You can already run several tasks in turn. Now we learn how to build a task that has **stages**.

Remember the traffic light in Module 3: red, then green, then yellow, then red again. At any moment, that light is always in **exactly one state**, and there's a **rule** for when it moves on to the next state. A washing machine works the same way: filling with water, washing, rinsing, spinning, done. Its door is only locked in certain states, and every state knows when it should end. This way of thinking is called a **state machine**.

A state machine has only two ingredients:

1. **A list of states.** For example, Node 1's watering has three states: STANDBY, WATERING, and COOLDOWN.
2. **Transition rules.** Every rule answers three questions: from which state, when or because of what, and to which state. The trigger can be time ("3 seconds have passed"), a sensor reading ("the soil is dry"), or a button.

These are the watering rules you build in Practice 3:

| State | What it does while in this state | Moves to… | …when |
| :--- | :--- | :--- | :--- |
| **STANDBY** | checks the soil every 2 seconds | WATERING | the soil is dry (or the button is held for 1 second) **and** there's enough water in the tank (the pump is turned on) |
| | | COOLDOWN | the soil is dry (or the button is held for 1 second), **but** there's too little water in the tank (the pump is refused) |
| **WATERING** | lets the pump run, without waiting idly | COOLDOWN | 3 seconds have passed (the pump is turned off) |
| **COOLDOWN** | rests so the water has time to soak into the soil | STANDBY | 30 seconds have passed |

![Diagram of the watering state machine with three circles. STANDBY, check the soil every 2 seconds, with a start arrow coming in from the left. A blue arrow from STANDBY to WATERING labeled soil below 30 percent (or the button held) and water at least 20 percent, the pump is turned on. WATERING, the pump runs without waiting; an arrow down to COOLDOWN labeled 3 seconds have passed, the pump is turned off. COOLDOWN, resting while the water soaks in; a teal arrow back to STANDBY labeled 30 seconds have passed. A red arrow straight from STANDBY to COOLDOWN labeled soil below 30 percent (or the button held), but water below 20 percent, the pump is refused, the LED blinks fast. A note at the bottom: in every state, the heartbeat LED keeps beating and the button is still checked on every pass of loop()](assets/watering-state-machine.png)

**Why bother with states?** Without a state machine, watering code usually fills up with "flags" such as `isWatering`, `isResting`, and `wasRefused`, plus nested `if`s that get more tangled over time. Worse, those flags can form combinations that make no sense, for example `isWatering` and `isResting` both being `true`. With a state machine, there's only **one** state variable, so a senseless combination like that can't happen. The code for each state is short, too, because it only has to think about one thing: when to move on.

In C++, the list of states is written with an **`enum`** (short for *enumeration*, a "list of choices"):

```cpp
enum WateringState { STANDBY, WATERING, COOLDOWN };  // the list of possible state names
WateringState state = STANDBY;                       // the current state; starts at STANDBY
```

A variable of type `WateringState` can only hold one of those three names, like a multiple-choice question whose answer must be a, b, or c. Behind the scenes, the three are just the numbers `0`, `1`, and `2`, but thanks to their names, the code reads like an ordinary sentence: `if (state == WATERING)`.

Notice also: here `COOLDOWN` is the **name of a state**, not a length of time. In one sketch, one name may only be used for one thing. That's why, in the Practice 3 sketch, the length of the rest has a name of its own: `COOLDOWN_TIME`.

On every pass of `loop()`, the state machine only runs the part that belongs to the current state, then returns right away:

```cpp
if (state == STANDBY) {
  // check the soil every 2 seconds; if it's dry: turn on the pump, then moveTo(WATERING)
} else if (state == WATERING) {
  if (millis() - stateStartTime >= WATERING_TIME) {  // 3 seconds in this state already?
    digitalWrite(PIN_PUMP, LOW);                     // turn off the pump
    moveTo(COOLDOWN);
  }
} else if (state == COOLDOWN) {
  if (millis() - stateStartTime >= COOLDOWN_TIME) {  // rested for 30 seconds already?
    moveTo(STANDBY);
  }
}
```

Look at `moveTo()`. This small function is **the only place where the state changes**. It notes the time the new state starts (`stateStartTime`) and prints the move, for example `[STANDBY -> WATERING]`. Because every move goes through one door, you can easily trace the history when something odd happens (Concept 10).

> [!IMPORTANT]
> **Write the `enum` at the top of the sketch, before any function.** Before it builds the program, Arduino IDE quietly copies a "table of contents" of all your functions above the first function. That table of contents is made of the forward declarations (*prototypes*) you met in Module 3 (🔬). If the `enum` only comes below the first function, the table of contents mentions `WateringState` before the compiler knows it, and you get the errors `'WateringState' was not declared in this scope` and `variable or field 'moveTo' declared void`. You've known the same rule for `struct` since Module 3.

Node 1 v1.0 uses a second state machine for its **main cycle**. In this cycle, we call each state a **step**, to match the name in its code (`CycleStep`). Instead of reading the sensors, printing a report, drawing the display, and running the automatic rules all at once in one pass, each step is done in a different pass of `loop()`: **IDLE** → **READING** → **DISPLAYING** → **ACTING** → back to IDLE. Between those steps, the button and Serial commands are still checked, so Node 1 is never "deaf" for longer than one step.

Some of the small tasks at the bottom of the next picture, such as feeding the watchdog and the status page, are only covered in Concept 8 and the ➕ section. For now, just look at the four steps above them.

![Diagram of the main cycle of Node 1 version 1.0, one step per pass of loop(): four boxes in a row with arrows, IDLE (2 seconds since the last reading?), READING (readSensors(), about 70 ms at most), DISPLAYING (log, OLED display, CSV every 30 seconds), and ACTING (automatic rules and sendData(), the Modules 10 to 11 shelf), then an arrow back to IDLE. Below them, the list of small tasks done on every pass of loop() before the cycle step: feed the watchdog, an analog sample every 2 ms, pump and buzzer off right on time, the watering state (WATERING to COOLDOWN to STANDBY), the heartbeat, the status page, the button, and Serial commands](assets/node1-main-cycle.png)

> ➡️ **Ready to practice?** Continue to [Practice 3 — A watering state machine](#practice-3--a-watering-state-machine-30-minutes). When you're done, come back to [Concept 5](#5-modular-code-one-sketch-several-files).

### 5. Modular code: one sketch, several files

> ⬆️ **Just finished Practice 3?** Your sketch is now more than two hundred lines long. Time to tidy it up.

Node 1 v0.4.0 has about 650 lines in one file. To find the display code, you have to scroll past the sensors, the actuators, and the Serial commands. Changing one part also risks breaking another part by accident. Real programs aren't written like that; they're split into **modules**, that is, several files that each take care of one thing.

In Arduino, a module usually consists of two files. Picture a restaurant:

- **The `.h` file (a *header* file; not the pin *header* rows from Module 7) is the menu.** It only lists the "dishes" on offer, that is, the function names along with the ingredients they need, without the recipes.
- **The `.cpp` file is the kitchen.** This is where the full recipe for every dish is written, including the "kitchen secrets" the guests don't need to know.
- **The `.ino` sketch is the guest.** It only needs to read the menu (`#include "heartbeat.h"`), then order (`beginHeartbeat(PIN_STATUS_LED)`). It doesn't need to know how the dish is cooked.

![Diagram of modular code as a guest, a menu, and a kitchen. Left: the Guest card, module08_modular.ino, with #include heartbeat.h, setup() calling beginHeartbeat(PIN_STATUS_LED), and loop() calling updateHeartbeat(); caption: orders through the menu. Middle: the Menu card, heartbeat.h, with #pragma once and three function declarations: beginHeartbeat, setHeartbeatRhythm, and updateHeartbeat; caption: a list of dishes, without the recipes. Right: the Kitchen card, heartbeat.cpp, with #include Arduino.h, #include heartbeat.h, static int heartbeatPin, and the body of updateHeartbeat(); caption: recipes plus kitchen secrets (static). #include arrows go from the guest and from the kitchen to the menu. Bottom: the two stages of Verify: 1, compile, every file is translated on its own, with the example error 'beginHeartbeat' was not declared in this scope because of a forgotten #include or a typo; 2, link (ld), all the results are joined together, with the example error undefined reference to updateHeartbeat() because the menu exists, but the kitchen doesn't](assets/modular-code.png)

This is the menu of the heartbeat module you make in Practice 4:

```cpp
// heartbeat.h - the status LED as Node 1's "heartbeat" (Module 8)
// Slow blink = the program runs normally; fast blink = there is a problem.
#pragma once

void beginHeartbeat(int pin);           // call once in setup()
void setHeartbeatRhythm(bool problem);  // true = fast blink, false = slow blink
void updateHeartbeat();                 // call on every pass of loop()
```

Five new things you need to know:

1. **`#pragma once`** at the very top of every `.h` file (comments may come before it) means "read this file only once", even if it's `#include`d from many places. For example, the main tab of Node 1 v1.0 reads `sensors.h` four times: directly, and through `display.h`, `card.h`, and `rules.h`. Without `#pragma once`, the `SensorReading` form inside it would be read several times, and the compiler would complain `redefinition of 'struct SensorReading'`.
2. **`#include "heartbeat.h"` uses double quotes**, while `#include <Arduino.h>` uses angle brackets. Double quotes mean "look in this sketch's folder first"; angle brackets mean "look in the libraries and the board package".
3. **A `.cpp` file must write `#include <Arduino.h>` itself.** An `.ino` tab gets it automatically, but a `.cpp` tab doesn't. Without that line, names such as `millis()` and `digitalWrite()` are unknown in the kitchen.
4. **`static` in front of a variable in a `.cpp` file** means "belongs to this file only". Other files can't see it, and it can't get mixed up with another variable that happens to have the same name. That's the kitchen secret.
5. **In a `.cpp` file, there's no automatic "table of contents"** (Concept 4). A function used inside a `.cpp` file must already be known before the line that uses it: either written above it, or listed in a `.h` file that is `#include`d. Otherwise you get `'functionName' was not declared in this scope`, even though the function is there further down.

When you click **Verify**, Arduino IDE works in two main stages (the 🔬 section of Module 3 calls them compilation and linking), and each one has its own kind of error:

| Stage | What it does | Example error | What it means |
| :--- | :--- | :--- | :--- |
| 1. **Compile stage** | Every `.cpp` file, and all the `.ino` tabs joined into one, are translated separately. | `'beginHeartbeat' was not declared in this scope` | The guest orders a dish that isn't on the menu it's holding: a forgotten `#include "heartbeat.h"`, or a typo in the function name. |
| 2. **Link stage** | All the translated pieces are joined into one complete program. | ``undefined reference to `updateHeartbeat()'`` | The menu promises a dish, but no kitchen cooks it: the function isn't in any `.cpp` file, or its name is different. |

Link-stage errors are easy to recognize, because they usually end with `collect2: error: ld returned 1 exit status` (on Windows: `collect2.exe: …`). `ld` is the name of the linker program. In Practice 4, you make both of these errors on purpose, so they won't surprise you when you meet them again.

Three habits for making good modules:

1. **One module, one job.** The `button` module only takes care of the button; the `heartbeat` module only takes care of the status LED.
2. **Kitchen secrets stay in the kitchen.** Variables and helper functions that are only used inside the module get `static`, and they aren't written in the `.h` file.
3. **The module reports, the sketch decides.** The `button` module doesn't turn on the lamp itself. It only reports "there was a short press" or "there was a long press", and your sketch decides what happens next. That way, the `button` module can be reused in other projects without changes.

> ➡️ **Ready to practice?** Continue to [Practice 4 — Modular code: split it into several files](#practice-4--modular-code-split-it-into-several-files-35-minutes). When you're done, come back to [Concept 6](#6-char-and-snprintf-building-text-without-borrowing-memory).

### 6. `char[]` and `snprintf()`: building text without borrowing memory

> ⬆️ **Just finished Practice 4?** Your sketch is now neatly split into several files. The next two concepts prepare Node 1 to run for days on end.

In Module 3 (🔬), we made a promise: starting in Module 8, the parts of the program that repeat often no longer use `String`. Now it's time to keep that promise.

`String` is handy. Text can be joined as easily as `"temperature=" + String(28.5)`. But every time the text gets longer, `String` **borrows** a new piece of memory from a temporary storage area called the **heap**, then gives the old piece back. If this happens thousands of times a day with different sizes, the heap ends up full of holes (**fragmentation**). Picture a parking lot whose empty spaces are scattered one by one between other cars: in total there's plenty of room, but not a single spot is big enough for a bus. One day, `String` fails to get a big enough piece. The text gets cut off or the program behaves strangely, often precisely after running fine for days. Mistakes like this are among the hardest to track down.

**`char[]`** (a row of characters) works differently. Its size is decided once, at the start, like a row of numbered drawers that is prepared before it's used. There's no borrowing at all. At the end of the text there's always one special drawer holding zero (`'\0'`) as the mark "the text ends here". That's why a text of 21 characters needs 22 drawers.

To fill those drawers, we use **`snprintf()`**. It works like a fill-in-the-blank text: you give it a **pattern** with "blanks" marked by `%`, then the values to fill in, and `snprintf()` copies the result into the drawers. The letter `n` in its name means it never writes more than the number of drawers you give it. If the text is too long, the rest is safely cut off instead of overwriting other memory.

```cpp
char text[22];                                             // 22 drawers: room for 21 characters + the end mark
snprintf(text, sizeof(text), "Soil threshold: %d%%", 30);  // text holds "Soil threshold: 30%"
snprintf(text, sizeof(text), "Restart: %s", "POWERON");    // text holds "Restart: POWERON"
```

`sizeof(text)` answers how many drawers `text` has (22), so you don't have to write the number twice.

![Diagram of char[] and snprintf(): filling in the blanks of a text. Top: the code char text[22]; with the note 22 drawers, 21 characters plus 1 end mark, then snprintf(text, sizeof(text), "Soil threshold: %d%%", 30); with %d marked as a blank, %% as the percent sign, and 30 as the value. Below it, 22 drawers numbered 0 to 21 holding the letters S o i l, a space, t h r e s h o l d, a colon, a space, 3 0 %, then drawer number 19 holding the end mark \0, and drawers 20 and 21 empty; note: text = "Soil threshold: 30%", the ␣ sign means a space, the drawers after the end mark aren't used, but they don't cause any trouble either. Bottom left: String: borrow, give back, repeat, with a row of used (gray) and empty (white) pieces of memory alternating; the heap full of holes (fragmentation): there's plenty of empty space in total, but not a single piece that is big enough; still fine for commands that only come now and then. Bottom right: char[]: fixed drawers, a row of green drawers prepared once and reused forever; snprintf() never writes past its drawers; for Node 1's log, CSV lines, and status page](assets/char-snprintf.png)

The blanks used in this module:

| Blank | For a value of type | Example value | Result |
| :--- | :--- | :--- | :--- |
| `%d` | `int` | `30` | `30` |
| `%lu` | `unsigned long` | `12345` | `12345` |
| `%s` | text (`"..."` or `char[]`) | `"POWERON"` | `POWERON` |
| `%.1f` | `float`, one digit after the decimal point | `28.46` | `28.5` |
| `%02lu` | `unsigned long`, at least two digits, padded with zeros in front | `5` | `05` |
| `%-5s` | text, left-aligned, at least five characters (the rest is filled with spaces) | `"INFO"` | `INFO ` |
| `%%` | the percent sign itself | — | `%` |

There are two things to remember. First, **the value's type must match its blank**: `%d` for `int`, `%lu` for `unsigned long`. If they don't match, nonsense numbers get printed. Second, `%.1f` always uses a **point** as the decimal mark (`28.5`), just like the data contract in Syllabus Appendix A. One note for the coming modules: in version 3 of the esp32 package, the type `uint32_t` (for example, what `ESP.getFreeHeap()` returns) is the same as `unsigned long`, so its blank is `%lu` too.

**Prepare drawers for the longest text possible, not the usual one.** Humidity is usually only two digits, but a value of type `int` can be as long as 11 characters (`-2147483648`). That's why Node 1 v1.0 prepares 12 drawers for every `int` number written with `snprintf()`. The compiler only helps partly: the warning `may be truncated` (Practice 7.7) appears when it knows the number's range, for example a number that has just been checked to be between 0 and 100. If it doesn't know the range, it stays quiet. So count the longest text yourself anyway.

**`Serial.printf()`** uses exactly the same patterns and prints the result straight to the Serial Monitor. Unlike `Serial.println()`, `Serial.printf()` doesn't start a new line by itself: add `\n` at the end of the pattern, for example `Serial.printf("Threshold: %d%%\n", 30);`. Behind the scenes, `Serial.printf()` prepares 64 drawers of its own. For longer text, it borrows from the heap for a moment and gives it back right away; a brief loan like that doesn't leave holes in the heap. The logging module in Concept 9 uses both `snprintf()` and `Serial.printf()`.

That doesn't make `String` forbidden. Node 1 v1.0 still uses it in two safe places: **reading Serial commands** (commands only come now and then) and the **readings page** of the display that you designed in Module 7 (its text is short and is only built every 2 seconds). What we change to `char[]` are the parts that repeat most often or are the longest: the log lines, the CSV lines on the microSD card, and the display's new status page. Changing your readings page to `char[]` is one of the 🧩 Challenges (2B).

### 7. NVS and Preferences: a filing cabinet that doesn't forget

Ordinary variables are stored in **RAM**. RAM is like a whiteboard: quick to write on, but wiped the moment the power goes out. As a result, settings that are changed while the program runs are lost every time the board restarts. That's why Node 1 v0.4.0's watering threshold is still a constant in the code, which can only be changed by uploading the program again.

The ESP32 has another place to store things: its **flash memory**, where your program itself is stored. Its contents stay even when the power goes out, like a filing cabinet. A small part of the flash is set aside just for storing settings. That part is called **NVS** (*Non-Volatile Storage*, storage that isn't lost when the power goes out). The **Preferences** library, which already comes with the esp32 package, makes NVS easy to use:

```cpp
#include <Preferences.h>

Preferences archive;
archive.begin("node1", false);                        // open the folder named "node1"; false = may read AND write
int threshold = archive.getInt("soil_watering", 30);  // read the label "soil_watering"; answer 30 if that label doesn't exist yet
archive.putInt("soil_watering", 35);                  // write: the number 35 stays even when the power goes out
```

Think of NVS as a filing cabinet that holds several **folders** (Preferences calls them *namespaces*). Each folder is opened by its name, for example `"node1"`. Inside a folder, every number is stored under a **label** (a *key*), for example `"soil_watering"`. The `archive` object in the code stands for the whole cabinet. (We keep the word "drawer" for the boxes of a `char[]` and of an array, as in Module 3.) This label name deliberately matches the threshold's name in the data contract (Syllabus Appendix A). A few rules and functions you need to know:

- **Folder and label names are at most 15 characters long.** `"soil_watering"` (13 characters) and `"boot_count"` (10 characters) are safe.
- **Every data type has its own pair of read and write functions:** `getInt`/`putInt` for `int`, `getULong`/`putULong` for `unsigned long`, `getFloat`/`putFloat`, `getBool`/`putBool`, and `getString`/`putString`.
- **The second number in a `get…` function is the default answer** if that label has never been written. That way, a board that's powering up for the very first time still gets a sensible number.
- `archive.isKey("soil_watering")` answers whether that label already exists, and `archive.remove("soil_watering")` deletes it.

**Flash wears out.** Each part of the flash can only be erased and rewritten about 100,000 times, according to the datasheets of the flash chips commonly used on ESP32 boards. NVS already spreads its writes over several places so it doesn't wear out quickly, but our habit stays the same: **write to NVS only when the number changes**, for example when you type a new threshold, and **never write on every pass of `loop()`**. `loop()` runs tens of thousands of times per second. If the number being written keeps changing, a counter for example, every write creates a new entry in the flash, and the flash's lifetime can run out within hours to days. (NVS actually skips a write whose number is exactly the same as the one already stored, but don't rely on that: checking it yourself makes your intention clear.) Reading doesn't cause wear, so you can read as often as you like.

![Diagram: RAM forgets, NVS remembers. Left: RAM as a whiteboard: before the power cut it holds threshold = 35 and lamp = true, then a red power-off arrow leads to the board powered up again, holding threshold = 30 and lamp = false, rewritten from the code; note: fast, but wiped every time the board loses power, so after power-up the threshold goes back to the number in the code (30); reading and writing as often as you like causes no wear. Right: NVS in flash as a filing cabinet holding the folder "node1" with the label soil_watering set to 35 and boot_count set to 4; note: stays after a restart, a power cut, and uploading the sketch again (in Wokwi it's lost when the simulation is stopped and started again); write only when it changes, because flash wears out. Bottom: two lines of code: archive.begin("node1", false); and int threshold = archive.getInt("soil_watering", 30);, with the notes folder and label names are at most 15 characters, and 30 is the default answer if the label doesn't exist yet](assets/nvs-filing-cabinet.png)

What makes the contents of NVS disappear?

| Event | Contents of variables (RAM) | Contents of NVS |
| :--- | :--- | :--- |
| A restart: the EN button, `ESP.restart()`, or the watchdog | lost | **kept** |
| A power cut (USB unplugged, then plugged in again) | lost | **kept** |
| Uploading the sketch again from Arduino IDE | lost | **kept**, as long as the menu **Tools → Erase All Flash Before Sketch Upload** is set to **Disabled** (the default) |
| In Wokwi: pressing **■**, then **▶** | lost | **lost**, because Wokwi starts with a new chip that's still empty |

The last row matters when you try Practice 5 in Wokwi: to imitate "the power goes out and comes back", use the `restart` command, not the **■** button.

NVS is the foundation for the coming modules. In Module 19, the server sends the latest thresholds to Node 1 over the network (MQTT), and Node 1 stores them in NVS. That way, even if the server can't be reached and the power has gone out in the meantime, Node 1 can still run its own **local safety rules**.

> ➡️ **Ready to practice?** Continue to [Practice 5 — A threshold that doesn't forget: NVS](#practice-5--a-threshold-that-doesnt-forget-nvs-25-minutes). When you're done, come back to [Concept 8](#8-the-watchdog-a-guard-that-restarts-a-stuck-program).

### 8. The watchdog: a guard that restarts a stuck program

> ⬆️ **Just finished Practice 5?** Node 1 now remembers its settings. Next, Node 1 learns to rescue itself.

A program can get stuck for many reasons: a loop that was never given a way out, a sensor library waiting for an answer from a wire that came loose, or (starting in Module 10) a Wi-Fi connection that hangs. If that happens in the middle of the night, nobody presses the EN button. The pump might keep running, or the other way around, never water again.

In Module 2, we already met the "guard dog". Now we put it to work. A **watchdog** is a timer inside the chip that must be **fed** regularly. Picture a guard dog that you have to feed at least every 5 seconds. As long as you feed it regularly, it stays calm. If 5 seconds go by without food, it barks and wakes up the whole house. On the ESP32, "feeding" is one line at the start of `loop()`, and "barking" means printing a report, then restarting the board.

![Diagram of the watchdog: feed it before 5 seconds are up. Top: a timeline from 0 to 14 seconds: from 0 to 3 seconds, a row of thin lines labeled loop() runs: feed, feed, feed; from 3 to 8 seconds, a red box stuck: while (true) { } with an orange 5-second span with nobody feeding the guard; at second 8, a dark restart box, then a row of thin lines again labeled alive again, running again. Below it, a box with the output of Practice 6: E (…) task_wdt: Task watchdog got triggered… and Last restart reason: TASK_WDT (…). Bottom: the three set-up lines for version 3 of the esp32 package: 1, esp_task_wdt_reconfigure(&watchdogConfig); reconfigure: a 5000 ms limit, panic, then restart, at the end of setup(); 2, esp_task_wdt_add(NULL); watch the task that's running now: loop(), at the end of setup(); 3, esp_task_wdt_reset(); feed it, at the start of loop()](assets/watchdog-guard.png)

Version 3 of the esp32 package already starts this kind of watchdog as soon as the board powers up. It's called the **Task Watchdog Timer** (TWDT). By default, however, it **doesn't watch `loop()` yet**. That's why we set up three things:

```cpp
#include <esp_task_wdt.h>

void setup() {
  // ... all the other preparation first ...
  esp_task_wdt_config_t watchdogConfig = {
    .timeout_ms = 5000,      // time limit: 5000 ms
    .idle_core_mask = 0b01,  // keep watching the "idle task" of core 0 (the esp32 package default)
    .trigger_panic = true,   // fed too late = panic, then restart
  };
  esp_task_wdt_reconfigure(&watchdogConfig);  // 1. reconfigure the watchdog that is already running
  esp_task_wdt_add(NULL);                     // 2. NULL = watch the task that is running now, that is, loop()
}

void loop() {
  esp_task_wdt_reset();  // 3. "feed" the guard: a sign that loop() is still running
  // ... the other tasks, and none of them waits long ...
}
```

In short:

- **`esp_task_wdt_config_t`** is a "form" (a `struct`, Module 3) with three settings. Writing `.timeout_ms = 5000` fills in a field by its name, so the code is easy to read. The order must be the same as the order of the fields in the original form: `timeout_ms`, `idle_core_mask`, then `trigger_panic`.
- **`.idle_core_mask = 0b01`**. The ESP32 has two processor cores: core 0 takes care of system work (and later Wi-Fi too), and core 1 runs `loop()`. Each core has an *idle task* that only runs when that core isn't busy. The binary number `0b01` (remember the OLED icons in Module 7) means "watch only the idle task of core 0", the same as the esp32 package's default.
  - **Don't change it to `0b11`.** A `loop()` that never sleeps keeps core 1 busy all the time, so its idle task never gets a chance to run. The guard then thinks core 1 is stuck and restarts a program that is actually healthy.
- **`.trigger_panic = true`**. If the guard is fed too late, the ESP32 **panics**: the program is forcibly stopped, its report is printed (including a *backtrace*, Practice 6.3), then the board restarts. With `false`, the guard only complains in the Serial Monitor, and the program stays stuck.
- **`esp_task_wdt_reconfigure()`**, not `esp_task_wdt_init()`. The esp32 package has already started the guard, so we only need to change its settings.
- **Set up the guard at the end of `setup()`**, after all the other preparation is done. A `delay(500)` at the start of `setup()` is still fine, because the guard isn't watching yet at that point.

Many tutorials and AI answers still use the way version 2 of the esp32 package wrote it. Here's what happens with version 3:

| Old code | What happens with version 3 of the esp32 package | New code |
| :--- | :--- | :--- |
| `esp_task_wdt_init(5, true);` | It fails to build: `invalid conversion from 'int' to 'const esp_task_wdt_config_t*'` and `too many arguments to function 'esp_err_t esp_task_wdt_init(const esp_task_wdt_config_t*)'`. In version 3, `esp_task_wdt_init()` only accepts one "form". | `esp_task_wdt_config_t` + `esp_task_wdt_reconfigure(&watchdogConfig)` |
| `esp_task_wdt_init(&watchdogConfig);` | It builds, but when the board powers up, `E (…) task_wdt: esp_task_wdt_init(517): TWDT already initialized` appears, and your new settings aren't used. | `esp_task_wdt_reconfigure(&watchdogConfig)` |

**The watchdog is not a cure.** It doesn't fix the bug. It only brings Node 1 back to life, so that its important tasks, such as keeping an eye on the pump, keep going. If the cause is still there, it can get stuck again. That's why Node 1 v1.0 always prints the **last restart reason** when it powers up, and counts in NVS **how many times it has powered up**. If one morning the reason is `WDT` and the count has gone up, you know something got stuck overnight, and you can start hunting the bug (Concept 10).

One note for Modules 10–11: many network functions wait until their default timeout runs out. For example, `getLocalTime()` and the **HTTPClient** library wait up to 5 seconds, and the MQTT library **PubSubClient** up to 15 seconds. That's as long as, or longer than, our guard's limit. That's why we'll always shorten the timeouts of those functions later, or build the network part as a state machine, instead of raising the guard's limit.

One more note for sharp-eyed readers. In Module 2, we learned to read the line `rst:0x10` as a sign of the watchdog. These three clues often get mixed up:

| What gets printed | What it means |
| :--- | :--- |
| `rst:0x10` in the bootloader line | A chip-level watchdog restarted the board without the program's help (Module 2). |
| `rst:0xc (SW_CPU_RESET)` in the bootloader line | A restart requested by the program: by the guard we set up this week (it prints its report first), or by `ESP.restart()`. |
| the answer of `esp_reset_reason()` | The real reason. For our guard, the answer is `ESP_RST_TASK_WDT`. Node 1's `resetReasonName()` function (Module 5) shortens it to `WDT`, as in Syllabus Appendix A. |

So, to find out the real restart reason, don't rely on the `rst:` line; ask `esp_reset_reason()`.

> ➡️ **Ready to practice?** Continue to [Practice 6 — The watchdog: stuck on purpose, then rescued](#practice-6--the-watchdog-stuck-on-purpose-then-rescued-30-minutes). When you're done, come back to [Concept 9](#9-leveled-logging-debug-info-error).

### 9. Leveled logging: DEBUG, INFO, ERROR

> ⬆️ **Just finished Practice 6?** You've seen for yourself how the watchdog rescues a stuck program. The last two concepts are about finding out **why** something happens.

Since Module 2, our helper has been `Serial.print()`. The problem is that when everything runs smoothly, it prints too much, and when there's a bug, it shows too few details. So we add a temporary `Serial.print()`, forget to remove it, and the Serial Monitor gets more and more crowded.

Real programs use **leveled logging**. Every message gets a **level** that matches how important it is:

| Level | For | Example from Node 1 v1.0 |
| :--- | :--- | :--- |
| **ERROR** | Something is wrong and needs your attention. | `Pump REFUSED: water level only 15 %.` |
| **INFO** | Important everyday events. | `Pump running for 3 seconds.`, and also the sensor readings every 2 seconds |
| **DEBUG** | Details for bug hunting; usually hidden. | `Cycle: READING -> DISPLAYING` |

**The current level works like a filter.** At the INFO level (the default), INFO and ERROR messages are shown, while DEBUG messages are hidden. At the ERROR level, only problems are shown. At the DEBUG level, everything is shown. You can change the level at any time from the Serial Monitor (`log debug`, `log info`, `log error`), without uploading the program again. So the details for bug hunting don't have to be deleted; they're simply hidden when you don't need them.

Every log line starts with the **time since power-up** and the **level**:

```text
[00:12:04] INFO  Dry soil (12 %, threshold 30 %): trying to water.
[00:12:04] ERROR Pump REFUSED: water level only 15 %.
```

From those two lines, you immediately know **when** something happened (12 minutes and 4 seconds after power-up) and **how serious** it is (ERROR). Using the logger module in Practice 7 and Node 1 v1.0 is similar to `Serial.printf()`:

```cpp
logInfo("Pump running for %d seconds.", seconds);  // the same blanks as in Concept 6
logError("Pump REFUSED: water level only %d %%.", waterLevel);
logDebug("Cycle: %s -> %s", stepName(step), stepName(newStep));
```

One important habit: **log when something changes, not on every pass.** A message printed on every pass of `loop()` floods the Serial Monitor and slows `loop()` down at the same time, because at 115,200 baud, Serial can only send about 11,500 characters per second. That's why Node 1 v1.0 prints `DHT22 can't be read.` **once** when the sensor starts failing, then `DHT22 can be read again.` once when it recovers, instead of every 2 seconds.

The ESP32 itself uses the same idea. The watchdog message in Practice 6, `E (23503) task_wdt: …`, is an ERROR-level log line (the letter **E**), and the number in the parentheses is the number of milliseconds since the board powered up.

![Diagram of leveled logging: the current level works like a filter, and the level can be changed at any time from the Serial Monitor with log debug, log info, or log error. Left: six example messages, all starting with the time [00:12:04] except the last one, [00:12:06]: DEBUG Cycle: IDLE -> READING; INFO a reading of temperature, humidity, and soil at 12 percent; INFO Dry soil (12 %, threshold 30 %): trying to water; ERROR Pump REFUSED: water level only 15 %; DEBUG Watering: STANDBY -> COOLDOWN; and INFO the next reading. Right: three columns of check marks: log debug shows all six messages; log info, the default, shows the four INFO and ERROR messages; log error shows only the ERROR message. Notes: replies to commands such as status and info are always shown; a good habit: log when something changes, not on every pass of loop()](assets/leveled-logging.png)

### 10. Systematic debugging: be a detective, not a guesser

Bugs will come; even experienced programmers run into them every day. The difference is in how you deal with them. The biggest waste of time is **guessing**: changing five things at once, uploading, then hoping. If it turns out to work, you don't know which change fixed it. If it fails, you don't know which change made it worse.

A detective works with **evidence**. Here are the six steps, which you'll use in Practice 7:

1. **Reproduce.** Find the steps that **always** make the bug appear, for example "lift the soil sensor into the air, wait 2 seconds". A bug you can reproduce is already half caught. If it only shows up "sometimes", write down when and under what conditions.
2. **Observe, don't guess.** Collect evidence: the log in the Serial Monitor, the status LED's pattern, the OLED display, the restart reason, even the multimeter (Module 2). Write two sentences: "**It should** …, **but actually** …".
3. **Zoom in on the evidence.** Turn on the DEBUG log, or add a temporary `logDebug()` around the suspicious part, until you see **a number that makes no sense**.
4. **Split in half.** If you don't know yet which part is wrong, cut the search area in two: switch off half of the code (turn it into comments, or add an early `return`), then see whether the bug is still there. Repeat with the half that's left. For a "but it worked yesterday" bug, compare with the last version that was still correct in GitHub Desktop's **History**.
5. **Isolate.** Check **only** the suspicious part, separately from everything else: print the values inside that one function, or make a small sketch that contains only that part, like the I2C scanner in Module 7. The other parts can't interfere, so the result is clearer.
6. **Change one thing, then prove it.** Change only **one** thing per attempt. Once the bug is gone, repeat step 1 to prove it's really gone. Finally, write a short note (symptom, cause, fix) for your future self.

There's one more source of evidence that's often forgotten: **compiler warnings**. By default, Arduino IDE hides them. In Practice 7, you turn them on and see that the compiler had actually been "whispering" about the bug you're hunting all along.

![Diagram of the six steps of systematic debugging on six cards in a row, each with an example from Practice 7. 1, Reproduce: find the steps that always cause the bug; example: lift the soil sensor, wait 2 seconds. 2, Observe: "it should …, but actually …"; example: the pump only blinks on briefly. 3, Zoom in: turn on DEBUG, look for an odd number; example: WATERING: 44015 ms so far. 4, Split in half: disable half the code or compare versions; example: only one line sets the start time. 5, Isolate: check the suspicious part on its own; example: print its value inside moveTo(). 6, Change one thing: then prove it with step 1; example: delete unsigned long, pump on for 3 seconds. An orange arrow from card 6 back to card 2: bug not gone yet? go back to step 2 with new evidence. A note at the bottom: don't forget a free source of evidence, compiler warnings, in File, Preferences…, Compiler warnings: More; on macOS through Arduino IDE, Settings…](assets/systematic-debugging.png)

> ➡️ **Ready to practice?** Continue to [Practice 7 — Leveled logging and a bug hunt](#practice-7--leveled-logging-and-a-bug-hunt-35-minutes), then [Practice 8](#practice-8--save-to-github-15-minutes). After that, go on to the [🧩 Independent Challenges](#-independent-challenges) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home).

## 🔧 Step-by-step practice

Eight practices, **in order**. There are no new wires: every practice uses the Node 1 circuit that's already on your workbench. The only wire you pull out for a while is the DHT22's data wire in Practice 2.3. The practices marked ⭐ in the table of contents are part of the completion requirements:

1. **Practice 2** — three tasks take turns in one `loop()` without `delay()`, including a button that recognizes a short press and a long press.
2. **Practice 5** — the "dry soil" threshold is stored in NVS and is still there after the board has been unplugged.
3. **Practice 6** — the watchdog restarts a program that was made to get stuck on purpose.

The rest of the completion requirements are in the ➕ section: a Node 1 v1.0 that doesn't use `delay()` in `loop()` and runs for 24 hours without a restart.

You can try every practice in Wokwi first, exactly like the Quick Win: open a new ESP32 project, paste in that practice's `diagram.json` from the [`code/`](code/) folder, then paste its code into the `sketch.ino` tab. If the practice has a `libraries.txt`, bring up that tab through **Library Manager** → **+** (as in Module 7): type the name of the first library on its list, click the result, then replace all the contents of the `libraries.txt` tab with the contents of the file from that practice's folder. Only after that, run it on the real board.

> [!TIP]
> **How to save this week's sketches.** For each sketch, choose **File → New Sketch** in Arduino IDE, delete its default contents (**Ctrl + A**, then **Delete**), paste the code (**Ctrl + V**), then choose **File → Save** and give it the name mentioned in the practice, for example `module08_delay_trap`. When you save the first sketch, first create a `module-08` folder in **Documents → GitHub → learn-iot** with the **New folder** button in the Save window, then save all of this week's sketches there. Commit every time you finish a practice.
>
> **Before clicking Upload**, make sure the board box in Arduino IDE's top bar says **DOIT ESP32 DEVKIT V1** and that the port is correct. Stuck at `Connecting…`? Hold **BOOT** as soon as `Connecting…` appears, and release it when `Writing at …` starts running.
>
> **The Serial Monitor this week:** **115200 baud** and the line ending **New Line** (the menu to the right of the text box, as in Module 5). From Practice 5 on, the sketches only carry out your command after they receive the end-of-line mark that **New Line** sends. In Wokwi, click the text box below the Serial Monitor, type the command, then press **Enter**; the end-of-line mark is sent by itself, so there's no menu to set.
>
> **Can't see the first line?** Press the **EN** button on the ESP32 board to restart the program from the beginning; the Serial Monitor stays connected and prints it again. **Opening an old sketch again:** choose **File → Open Recent**, or **File → Open…** and then open **Documents → GitHub → learn-iot → module-08**.

> [!IMPORTANT]
> **The MB102 and the relays.** Practices 2, 3, 4, and 7 use the relays, the pump, or 5 V sensors, which all get their power from the MB102. For those practices, turn on the MB102 in the order of the golden rules: **plug in the USB first, then turn on the MB102**; when you're done, **turn off the MB102 first, then unplug the USB**. The Quick Win and Practices 1, 5, and 6 only need the USB.

By the end of the module, your practice folder contains:

```text
learn-iot/
└── module-08/
    ├── module08_blink_without_delay/     ← Quick Win (saving it is optional)
    ├── module08_delay_trap/              ← Practice 1 (delay version)
    ├── module08_millis_cure/             ← Practice 1 (millis version)
    ├── module08_three_tasks/             ← Practice 2 ⭐
    ├── module08_watering_state_machine/  ← Practice 3
    ├── module08_modular/                 ← Practice 4 (5 files: .ino + heartbeat.h/.cpp + button.h/.cpp)
    ├── module08_nvs_threshold/           ← Practice 5 ⭐
    ├── module08_watchdog/                ← Practice 6 ⭐
    ├── module08_bug_hunt/                ← Practice 7 (3 files: .ino + logger.h/.cpp)
    └── debugging-notes.md                ← Practice 7
```

### Practice 1 — The `delay()` trap: see it for yourself (20 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor**, or Wokwi with the small circuit's [`diagram.json`](code/module08_delay_trap/diagram.json) (the same as in the Quick Win). Parts: the status LED (D4) and the manual button (D13), connected since Modules 2 and 5. Concepts used: 1–3.

#### 1.1 The `delay()` version: count the lost presses

1. Create a new sketch named `module08_delay_trap`, paste this code, then click **Upload** and open the Serial Monitor:

   ```cpp
   // Module 8 - Practice 1 (part A): the delay() trap
   // Same circuit as the Quick Win: status LED on D4, button on D13.
   // The LED blinks with delay(). Press the button 5 times at a relaxed pace: how many are recorded?

   const int PIN_STATUS_LED = 4;
   const int PIN_BUTTON = 13;

   int pressCount = 0;
   int loopCount = 0;

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     Serial.println("Practice 1A - delay() version: press the button 5 times, then count how many were recorded.");
   }

   void loop() {
     loopCount++;

     digitalWrite(PIN_STATUS_LED, HIGH);
     delay(1000);  // the ESP32 waits 1 second without doing anything
     digitalWrite(PIN_STATUS_LED, LOW);
     delay(1000);  // waits 1 more second

     // The button is only checked here: once every 2 seconds!
     if (digitalRead(PIN_BUTTON) == LOW) {
       pressCount++;
       Serial.println("Button read as pressed!");
     }

     Serial.print("loop() pass #");
     Serial.print(loopCount);
     Serial.print(" finished at second ");
     Serial.print(millis() / 1000);
     Serial.print(". Presses recorded: ");
     Serial.print(pressCount);
     Serial.println(".");
   }
   ```

2. Wait until the first line appears. The status LED is on for 1 second, then off for 1 second, in turn.
3. Press the button **five times** at a relaxed pace, about one press per second. Press briefly as usual; don't hold it down. Count for yourself how many times you press.
4. Look at the number after `Presses recorded:` in the Serial Monitor.

   **Expected output** in Wokwi, after five presses:

   ```text
   Practice 1A - delay() version: press the button 5 times, then count how many were recorded.
   loop() pass #1 finished at second 2. Presses recorded: 0.
   loop() pass #2 finished at second 4. Presses recorded: 0.
   loop() pass #3 finished at second 6. Presses recorded: 0.
   loop() pass #4 finished at second 8. Presses recorded: 0.
   loop() pass #5 finished at second 10. Presses recorded: 0.
   ```

Five presses, and **not a single one** was recorded. On a real board, the result is usually `0` or `1`. The button is only checked **once every 2 seconds**, right after the two `delay(1000)` calls are done. A press is only recorded if the button happens to be **held down** at that very moment. Now try **holding** the button for 3 seconds: that press is sure to be recorded, because your button is still pressed when it finally gets checked. Your program only looks at the world once every 2 seconds. That's the `delay()` trap.

#### 1.2 The `millis()` version: nothing gets lost

1. Create a new sketch named `module08_millis_cure`, paste this code, click **Upload**, then open the Serial Monitor:

   ```cpp
   // Module 8 - Practice 1 (part B): the cure, the millis() pattern
   // Same circuit: status LED on D4, button on D13.
   // The LED still switches every 1 second, but the button is checked thousands of times per second.

   const int PIN_STATUS_LED = 4;
   const int PIN_BUTTON = 13;
   const unsigned long BLINK_DELAY = 1000;      // the LED switches every 1 second, just like the delay() version
   const unsigned long REPORT_INTERVAL = 2000;  // report every 2 seconds
   const unsigned long DEBOUNCE_DELAY = 30;     // milliseconds: the button reading must stay steady this long

   unsigned long lastBlinkTime = 0;
   unsigned long lastReportTime = 0;
   unsigned long lastChangeTime = 0;
   bool ledOn = false;
   int previousReading = HIGH;
   int stableButton = HIGH;
   int pressCount = 0;
   unsigned long loopCount = 0;  // loop() passes since the last report

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     Serial.println("Practice 1B - millis() version: press the button 5 times again.");
   }

   void loop() {
     unsigned long now = millis();
     loopCount++;

     // Task 1: the LED, with the millis() pattern: "has 1 second passed since it last switched?"
     if (now - lastBlinkTime >= BLINK_DELAY) {
       lastBlinkTime = now;
       ledOn = !ledOn;
       digitalWrite(PIN_STATUS_LED, ledOn);
     }

     // Task 2: the button, checked on every pass
     int reading = digitalRead(PIN_BUTTON);
     if (reading != previousReading) {
       previousReading = reading;
       lastChangeTime = now;
     }
     if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
       stableButton = reading;
       if (stableButton == LOW) {
         pressCount++;
         Serial.println("Button pressed!");
       }
     }

     // Task 3: a report every 2 seconds, including how many times loop() managed to run
     if (now - lastReportTime >= REPORT_INTERVAL) {
       lastReportTime = now;
       Serial.print("Second ");
       Serial.print(now / 1000);
       Serial.print(": loop() ran ");
       Serial.print(loopCount);
       Serial.print(" times in the last 2 seconds. Presses recorded: ");
       Serial.print(pressCount);
       Serial.println(".");
       loopCount = 0;
     }
   }
   ```

2. The status LED switches on and off every 1 second, exactly like the `delay()` version.
3. Press the button **five times** again, at the same pace.

   **Expected output** in Wokwi:

   ```text
   Practice 1B - millis() version: press the button 5 times again.
   Second 2: loop() ran 79289 times in the last 2 seconds. Presses recorded: 0.
   Button pressed!
   Second 4: loop() ran 105743 times in the last 2 seconds. Presses recorded: 1.
   Button pressed!
   Button pressed!
   Second 6: loop() ran 105674 times in the last 2 seconds. Presses recorded: 3.
   Button pressed!
   Second 8: loop() ran 105678 times in the last 2 seconds. Presses recorded: 4.
   Button pressed!
   Second 10: loop() ran 105723 times in the last 2 seconds. Presses recorded: 5.
   ```

All five presses were recorded. Also look at the number after `loop() ran …`. The `delay()` version runs only **once** every 2 seconds, while the `millis()` version runs about **100,000 times** in 2 seconds in Wokwi. On a real board, the number can be several times larger, because the simulator is slower than the real chip. On each of those passes, the button is checked once, so no press can slip through.

#### 1.3 Inside the code

Both sketches do the same thing, but they think differently:

| | The `delay()` version | The `millis()` version |
| :--- | :--- | :--- |
| How the LED blinks | turn on → **sleep** 1 second → turn off → **sleep** 1 second | on every pass: "has it been 1 second since the last switch?" If so, switch. |
| When the button is checked | once every 2 seconds, after sleeping | on **every** pass, tens of thousands of times per second |
| What gets noted | nothing | `lastBlinkTime`, `lastReportTime`, `lastChangeTime` |
| Number of `loop()` passes | 1 every 2 seconds | tens of thousands per second |

The button part of the `millis()` version is worth reading slowly:

```cpp
int reading = digitalRead(PIN_BUTTON);
if (reading != previousReading) {  // the reading changed: pressed, released, bouncing, or noise
  previousReading = reading;
  lastChangeTime = now;            // start counting "steady" from zero again
}
if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
  stableButton = reading;          // steady for 30 ms: this change is real
  if (stableButton == LOW) {       // changed from released to pressed: one press!
    pressCount++;
  }
}
```

- **`stableButton`** stores the button state we already trust. A press is counted when that state **changes** from released (`HIGH`) to pressed (`LOW`), not for as long as the button is held. That's why a press that is held down still counts only once.
- **`previousReading` and `lastChangeTime`** note when the button reading last changed. A change is only trusted once the reading has stayed **steady** for `DEBOUNCE_DELAY` (30 ms). Every bounce or burst of noise starts the steady count again from zero, so neither of them is ever counted as a press. The idea is the same as in Module 5 ("wait 30 ms, then check again"). The difference is that we don't **wait** with `delay()`; we only **note** when the reading last changed, then check it again on the passes that follow.

#### 1.4 Experiment

- In the `module08_millis_cure` sketch, add `delay(100);` as the last line inside `loop()`, then upload it again. The number of passes drops to about twenty in 2 seconds. Ordinary presses may still be recorded, but try pressing **lightning fast** a few times: some of them can get lost. The lesson: even a small `delay()` slows down the whole program. Delete that line again.
- Change `BLINK_DELAY` to `250`. The LED blinks faster, while the report still comes every 2 seconds. The two schedules don't affect each other.

> ➡️ **Done with Practice 1?** Continue to [Practice 2](#practice-2--three-tasks-one-loop-30-minutes).

### Practice 2 — Three tasks, one `loop()` (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** (the **DHT sensor library** from Module 6 is already installed) and the **Serial Monitor**, or Wokwi with the complete Node 1 [`diagram.json`](code/module08_three_tasks/diagram.json) and [`libraries.txt`](code/module08_three_tasks/libraries.txt). Parts used: the status LED (D4), the button (D13), the lamp relay (D32), the fan relay (D33), and the DHT22 (D14). The MB102 is on. Concepts used: 1–3.
>
> ⭐ **Required** — part of the completion requirements: three tasks take turns without `delay()`, and the button recognizes a short press and a long press.

In this practice, three tasks run in one `loop()`:

1. **The heartbeat.** The status LED lights up briefly every 1 second, a sign that the program is healthy. If a sensor has a problem, the rhythm turns **fast**: four blinks per second. This is the promise from Module 2: "slow blinking = the program is running normally, …, fast blinking = there's a problem".
2. **The sensor.** The DHT22 is read every 2 seconds.
3. **The button.** A **short press** (less than 1 second) turns the lamp on or off. A **long press** (held for 1 second) turns the fan on or off.

#### 2.1 Upload and watch

1. Plug in the USB, then turn on the MB102.
2. Create a new sketch named `module08_three_tasks`, paste this code, click **Upload**, then open the Serial Monitor:

   ```cpp
   // Module 8 - Practice 2: three tasks, one loop()
   // Circuit: the Node 1 workbench (Module 7). Used here: status LED D4, button D13,
   // lamp relay D32, fan relay D33, and the DHT22 on D14.
   // Library: DHT sensor library 1.4.7 (installed with it: Adafruit Unified Sensor 1.1.15).
   //
   // Task 1 - heartbeat: status LED blinks slowly = normal, blinks fast = sensor problem.
   // Task 2 - sensor: the DHT22 is read every 2 seconds.
   // Task 3 - button: short press = lamp, long press (1 second) = fan.

   #include <DHT.h>

   const int PIN_STATUS_LED = 4;
   const int PIN_BUTTON = 13;
   const int PIN_LAMP_RELAY = 32;  // active-LOW relay
   const int PIN_FAN_RELAY = 33;   // active-LOW relay
   const int PIN_DHT = 14;

   // Schedule, all in milliseconds
   const unsigned long NORMAL_BEAT = 1000;      // one blink every 1 second
   const unsigned long PROBLEM_BEAT = 250;      // four blinks every 1 second
   const unsigned long BEAT_ON_TIME = 100;      // the LED is on for 100 ms at the start of each beat
   const unsigned long READ_INTERVAL = 2000;    // the DHT22 is read every 2 seconds
   const unsigned long DEBOUNCE_DELAY = 30;     // the button reading must stay steady this long
   const unsigned long LONG_PRESS_TIME = 1000;  // held for 1 second or more = long press

   DHT dht(PIN_DHT, DHT22);

   // Each task's time notes and state
   unsigned long beatStartTime = 0;
   bool sensorProblem = false;

   unsigned long lastReadTime = 0;

   int previousReading = HIGH;  // the button reading on the previous pass; HIGH = released
   unsigned long lastChangeTime = 0;
   int stableButton = HIGH;     // the button state we already trust (steady for 30 ms)
   unsigned long pressStartTime = 0;
   bool longPressDone = false;

   bool lampOn = false;
   bool fanOn = false;

   // loop() health meter
   unsigned long loopCount = 0;
   unsigned long longestLoopUs = 0;  // microseconds

   void setRelay(int pin, bool isOn) {
     if (isOn) {
       digitalWrite(pin, LOW);  // active-LOW relay
     } else {
       digitalWrite(pin, HIGH);
     }
   }

   const char* onOffText(bool isOn) {
     if (isOn) {
       return "on";
     }
     return "off";
   }

   // ---------- Task 1: heartbeat ----------
   void updateHeartbeat() {
     unsigned long now = millis();
     unsigned long beatLength = NORMAL_BEAT;
     if (sensorProblem) {
       beatLength = PROBLEM_BEAT;
     }
     if (now - beatStartTime >= beatLength) {
       beatStartTime = now;  // start the next beat
     }
     // The LED is on only at the start of a beat: true = HIGH (on), false = LOW (off)
     digitalWrite(PIN_STATUS_LED, now - beatStartTime < BEAT_ON_TIME);
   }

   // ---------- Task 2: read the DHT22 every 2 seconds ----------
   void readSensorOnSchedule() {
     if (millis() - lastReadTime < READ_INTERVAL) {
       return;  // not time yet: return at once, don't wait
     }
     lastReadTime = millis();

     float temperature = dht.readTemperature();
     float humidity = dht.readHumidity();
     sensorProblem = isnan(temperature) || isnan(humidity);

     if (sensorProblem) {
       Serial.print("DHT22 can't be read! Status LED blinks fast.");
     } else {
       Serial.print("temperature=");
       Serial.print(temperature, 1);
       Serial.print(" C  humidity=");
       Serial.print(humidity, 0);
       Serial.print(" %");
     }
     Serial.print("  | loop(): ");
     Serial.print(loopCount);
     Serial.print(" passes, longest ");
     Serial.print(longestLoopUs / 1000.0, 1);
     Serial.println(" ms");
     loopCount = 0;
     longestLoopUs = 0;
   }

   // ---------- Task 3: the button, short press and long press ----------
   void shortPress() {
     lampOn = !lampOn;
     setRelay(PIN_LAMP_RELAY, lampOn);
     Serial.print("Short press: lamp ");
     Serial.println(onOffText(lampOn));
   }

   void longPress() {
     fanOn = !fanOn;
     setRelay(PIN_FAN_RELAY, fanOn);
     Serial.print("Long press: fan ");
     Serial.println(onOffText(fanOn));
   }

   void checkButton() {
     unsigned long now = millis();
     int reading = digitalRead(PIN_BUTTON);

     // 1. Did the reading change (pressed, released, bouncing, or noise)? Count its "steady" time from zero again.
     if (reading != previousReading) {
       previousReading = reading;
       lastChangeTime = now;
     }

     // 2. Steady for 30 ms and different from the trusted state? That's a real change.
     if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
       stableButton = reading;
       if (stableButton == LOW) {  // just pressed: start timing how long
         pressStartTime = now;
         longPressDone = false;
       } else if (!longPressDone) {  // just released before 1 second: short press
         shortPress();
       }
     }

     // 3. Still held after 1 second? Long press, handled once without waiting for the finger to lift.
     if (stableButton == LOW && !longPressDone && now - pressStartTime >= LONG_PRESS_TIME) {
       longPressDone = true;
       longPress();
     }
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     pinMode(PIN_LAMP_RELAY, OUTPUT);
     pinMode(PIN_FAN_RELAY, OUTPUT);
     setRelay(PIN_LAMP_RELAY, false);  // switch off right away: pinMode(OUTPUT) makes the pin LOW (= relay pulls in)
     setRelay(PIN_FAN_RELAY, false);
     dht.begin();
     Serial.println("Practice 2 - three tasks, one loop(). Short press = lamp, long press = fan.");
   }

   void loop() {
     unsigned long start = micros();  // microseconds: to measure how long this pass takes

     updateHeartbeat();
     readSensorOnSchedule();
     checkButton();

     loopCount++;
     unsigned long elapsed = micros() - start;
     if (elapsed > longestLoopUs) {
       longestLoopUs = elapsed;
     }
   }
   ```

3. Watch the status LED: it flashes briefly every second, like a heartbeat. Every 2 seconds, the Serial Monitor prints the DHT22 reading and two numbers about `loop()`.

   **Expected output** in Wokwi (on a real board, the number of passes is much larger):

   ```text
   Practice 2 - three tasks, one loop(). Short press = lamp, long press = fan.
   temperature=28.5 C  humidity=71 %  | loop(): 25962 passes, longest 0.1 ms
   temperature=28.5 C  humidity=71 %  | loop(): 34662 passes, longest 7.1 ms
   temperature=28.5 C  humidity=71 %  | loop(): 34677 passes, longest 7.1 ms
   temperature=28.5 C  humidity=71 %  | loop(): 34681 passes, longest 7.1 ms
   Short press: lamp on
   temperature=28.5 C  humidity=71 %  | loop(): 34484 passes, longest 7.1 ms
   Long press: fan on
   temperature=28.5 C  humidity=71 %  | loop(): 34559 passes, longest 7.1 ms
   ```

4. **Short press:** press the button briefly. The lamp relay goes "click" and its indicator LED lights up (since Module 5, that's Node 1's "lamp" on the workbench); Serial prints `Short press: lamp on`. Press briefly once more to turn it off.
5. **Long press:** press and **hold** the button. Exactly 1 second after you started pressing, without waiting for you to let go, the fan relay goes "click" and the fan spins; Serial prints `Long press: fan on`. Let go. Repeat to turn the fan off.
6. Notice what does **not** happen: while the button is held, the status LED keeps beating and the reports keep coming every 2 seconds. Node 1 v0.4.0, on the other hand, freezes while the button is held.

**In Wokwi:** paste in the `diagram.json`, then click the **Library Manager** tab → the round **+** button → type **DHT sensor library** → click the result. Once the `libraries.txt` tab appears, replace all its contents with the contents of this practice's [`libraries.txt`](code/module08_three_tasks/libraries.txt). Paste the code into the `sketch.ino` tab, then click **▶**. Once the simulation is running, click an empty spot in the simulation panel, then press **F** so that the whole circuit is visible. The green button labeled `D13` is at the left end of the circuit, next to the DHT22 (the white box with a grille). The lamp is drawn as a yellow LED labeled `lamp` above the right relay, and the fan as a blue LED labeled `fan` above the left relay. For a long press, hold the mouse button down on the green button for **2–3 seconds**, because the simulator runs more slowly than a real clock (see the speed percentage at the top right of the simulation panel).

![Wokwi screenshot of Practice 2, zoomed out with the F key, then cropped; the part-name labels were added by the author. Top: the whole Node 1 circuit with the labels D13 button at the left end, DHT22 (D14) next to it, fan (blue LED) above the left relay and lamp (yellow LED) above the right relay, and status LED (D4) below the board; a note on the right: both LEDs above the relays are lit, the lamp and the fan are on in the simulation. Bottom: the Serial Monitor: lines of temperature=28.5 C humidity=71 % followed by loop(): 34,491 to 34,680 passes, longest 7.1 ms; between them, Short press: lamp on (marker 1, a short click: the yellow LED lights up) and Long press: fan on (marker 2, hold for 1 second, 2 to 3 seconds in Wokwi: the blue LED lights up right away). Marker 3 is on the report after the long press, loop(): 34625 passes, longest 7.1 ms: the longest pass stays at about 7 ms because this report covers the time while the button was being held](assets/wokwi-three-tasks.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

#### 2.2 Inside the code: three tasks, three time notes

`loop()` in this sketch only calls three functions, and each function returns right away if it's not time yet:

- **`updateHeartbeat()`** divides time into "beats" that are 1,000 ms long (or 250 ms if there's a problem). The LED is only on during the first 100 ms of each beat. On every pass, it calculates `now - beatStartTime`: if that's less than 100, the LED is on; once a whole beat has gone by, a new beat starts.
- **`readSensorOnSchedule()`** uses another form of the same pattern: "if it's **not** time yet, `return` right away". This form is handy for long tasks, because their contents don't have to be indented inside an `if`.
- **`checkButton()`** remembers **when the button started being pressed** (`pressStartTime`). If the button is released before 1 second, that's a short press. If the button is still held after 1 second has passed, that's a long press, and it's handled right then and there, just once (`longPressDone` keeps it from repeating while the button is still held). Bounces and noise are filtered out the same way as in Practice 1: a change is only trusted after it has been steady for 30 ms.
- **`const char* onOffText(bool isOn)`** returns fixed text, `"on"` or `"off"`. Remember Module 3: `const char*` is C++'s name for text between double quotes. In Node 1 v0.4.0, this function returned a `String`; fixed text like this doesn't need to borrow memory (Concept 6). The meaning of the `*` sign there is explained in 🔬 "Pointers and references".

![Diagram of the signal on pin D13 with INPUT_PULLUP, where HIGH means released and LOW means pressed, on two timelines from 0 to 2000 ms. A note at the top: a change is only trusted once the reading has been steady for 30 ms; bounces and brief noise don't count. Top, a short press: the signal drops to LOW at 200 ms with a brief bounce, and about 30 ms after the last bounce it's noted as pressed; the signal rises again at about 600 ms with a bounce, before the 1-second limit, and once it has been steady for 30 ms, that's when shortPress() is called. Bottom, a long press: the signal drops at 200 ms and stays LOW; exactly 1 second after the press started, at about 1250 ms, longPress() is called right away, even though the button is still held; when it's released at about 1700 ms, nothing is called](assets/button-short-long.png)

The two numbers at the end of each report are a **health meter for `loop()`**:

- **`passes`**: how many times `loop()` ran in the last 2 seconds.
- **`longest`**: the longest pass in those 2 seconds, measured with `micros()` (the microsecond clock, a sibling of `millis()`). The number of about 7 ms in Wokwi comes from the pass in which the DHT22 is read. The other passes are much shorter, only tens of microseconds: the first report, printed before the DHT22 had been read, shows `longest 0.1 ms`.

The `longest` number is the most honest measure of "how long this program can be deaf". This program is deaf for about 7 ms at most. Compare that with Node 1 v0.4.0, which is deaf for **3,000 ms** every time the pump runs.

#### 2.3 The "broken sensor" test: fast blinking

Now prove that the status LED really tells you when there's a problem.

1. Turn off the MB102, then unplug the USB.
2. Pull the end of the **yellow** wire (the DHT22's DATA wire) out of hole **8f** on the upper breadboard, right above the **D14** pin (see the workbench picture in [Module 6, Practice 4.2](../module-06-reading-sensors/README.md#42-connect-the-dht22-module)).
3. Plug in the USB, then turn on the MB102. The status LED now blinks **fast**, and every report reads:

   ```text
   DHT22 can't be read! Status LED blinks fast.  | loop(): 34252 passes, longest 40.7 ms
   ```

   In Wokwi, `longest` goes up to about 40 ms: the DHT library waits for an answer that never comes until its time limit runs out, then gives up. The number on a real board may differ, but the point is the same: the waiting has a limit, so `loop()` keeps running.
4. Turn off the MB102, unplug the USB, put the yellow wire back into **8f**, then power up again (USB first, then the MB102). The LED blinks slowly again.

**In Wokwi:** stop the simulation (**■**), click the yellow wire coming out of the DHT22 until it's highlighted, press **Delete**, then run it again (**▶**). When you're done, paste the `diagram.json` in again to bring the wire back.

#### 2.4 Experiment

- Change `LONG_PRESS_TIME` to `2000`. Now a long press means holding for 2 seconds.
- Add a fourth task with the same pattern: print `Still alive!` every 10 seconds. You only need one new `last…Time` variable, one new `if` in a new function, and one line in `loop()` that calls that function.

> ⬆️ **Done with Practice 2?** Go back to [Concept 4](#4-state-machines-states-and-transition-rules).

### Practice 3 — A watering state machine (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor**, or Wokwi with the complete Node 1 [`diagram.json`](code/module08_watering_state_machine/diagram.json). Parts used: the status LED (D4), the button (D13), the lamp relay (D32), the pump (D25) with its water tank and hose, the soil sensor (VN), and the HC-SR04 (D15 and D35). The MB102 is on. Concepts used: 4.

This sketch moves the automatic watering rule from Module 6 into a state machine with three states. The button keeps working while the pump runs: a **short press** for the lamp, a **long press** for "water now".

#### 3.1 Get the pump and the soil sensor ready

1. Make sure the water tank has water in it (more than 20%), the soil sensor is stuck into moist soil (or dipped into a glass of water), and the end of the pump hose points into the plant glass or back into the tank, as in Module 6.
2. Plug in the USB, then turn on the MB102.

#### 3.2 Upload and watch the STANDBY state

1. Create a new sketch named `module08_watering_state_machine`, paste this code, click **Upload**, then open the Serial Monitor:

   ```cpp
   // Module 8 - Practice 3: watering state machine
   // Circuit: the Node 1 workbench (Module 7). Used here: status LED D4, button D13, lamp relay D32,
   // pump D25 (through the MOSFET), soil sensor on VN (GPIO 39), and the HC-SR04 (TRIG D15, ECHO D35).
   //
   // Watering has three states: STANDBY -> WATERING -> COOLDOWN -> STANDBY.
   // While the pump runs, the status LED keeps beating and the button keeps working:
   // short press = lamp, long press (1 second) = water now.

   const int PIN_STATUS_LED = 4;
   const int PIN_BUTTON = 13;
   const int PIN_LAMP_RELAY = 32;  // active-LOW relay
   const int PIN_FAN_RELAY = 33;   // not used here, but its relay is switched off so it stays quiet
   const int PIN_PUMP = 25;        // MOSFET gate: HIGH = pump on
   const int PIN_SOIL = 39;        // VN
   const int PIN_TRIG = 15;
   const int PIN_ECHO = 35;

   // Your calibration results from Module 6 (replace them with your own numbers)
   const int SOIL_DRY = 3000;          // raw soil sensor value in air
   const int SOIL_WET = 1300;          // raw soil sensor value in water
   const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
   const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

   // Watering rules
   const int SOIL_WATERING_THRESHOLD = 30;     // water if the soil is below 30%
   const int MIN_WATER_LEVEL = 20;             // the pump is refused if the tank is less than 20% full
   const unsigned long CHECK_INTERVAL = 2000;  // STANDBY: check the soil every 2 seconds
   const unsigned long WATERING_TIME = 3000;   // WATERING: the pump runs for 3 seconds
   const unsigned long COOLDOWN_TIME = 30000;  // COOLDOWN: rest 30 seconds before watering is allowed again

   bool lampOn = false;

   // The three watering states. A list of names like this (enum) goes at the top, before any function.
   enum WateringState { STANDBY, WATERING, COOLDOWN };
   WateringState state = STANDBY;     // the current state; starts at STANDBY
   unsigned long stateStartTime = 0;  // when the current state started
   unsigned long lastCheckTime = 0;   // when the soil was last checked

   // ---------- Heartbeat (status LED) ----------
   const unsigned long NORMAL_BEAT = 1000;  // one blink every 1 second
   const unsigned long PROBLEM_BEAT = 250;  // four blinks every 1 second
   const unsigned long BEAT_ON_TIME = 100;  // the LED is on for 100 ms at the start of each beat
   bool problemRhythm = false;              // true = fast blink
   unsigned long beatStartTime = 0;

   void updateHeartbeat() {
     unsigned long now = millis();
     unsigned long beatLength = NORMAL_BEAT;
     if (problemRhythm) {
       beatLength = PROBLEM_BEAT;
     }
     if (now - beatStartTime >= beatLength) {
       beatStartTime = now;  // start the next beat
     }
     digitalWrite(PIN_STATUS_LED, now - beatStartTime < BEAT_ON_TIME);
   }

   // ---------- Button: short press and long press ----------
   const unsigned long DEBOUNCE_DELAY = 30;     // milliseconds: the reading must stay steady this long
   const unsigned long LONG_PRESS_TIME = 1000;  // held for 1 second or more = long press
   int previousReading = HIGH;                  // HIGH = released
   unsigned long lastChangeTime = 0;
   int stableButton = HIGH;                     // the state we already trust
   unsigned long pressStartTime = 0;
   bool longPressDone = false;

   void checkButton() {
     unsigned long now = millis();
     int reading = digitalRead(PIN_BUTTON);
     if (reading != previousReading) {
       previousReading = reading;
       lastChangeTime = now;
     }
     if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
       stableButton = reading;
       if (stableButton == LOW) {
         pressStartTime = now;
         longPressDone = false;
       } else if (!longPressDone) {
         shortPress();
       }
     }
     if (stableButton == LOW && !longPressDone && now - pressStartTime >= LONG_PRESS_TIME) {
       longPressDone = true;
       longPress();
     }
   }

   // ---------- Soil sensor and water tank (Module 6) ----------
   int readSoilPercent() {
     long sum = 0;
     for (int i = 0; i < 20; i++) {
       sum += analogRead(PIN_SOIL);  // 20 readings in a row, no pause (done in a flash)
     }
     int percent = map(sum / 20, SOIL_DRY, SOIL_WET, 0, 100);
     return constrain(percent, 0, 100);
   }

   // Returns how full the tank is in percent, or -1 if the HC-SR04 echo doesn't come back.
   int readWaterLevel() {
     digitalWrite(PIN_TRIG, LOW);
     delayMicroseconds(2);
     digitalWrite(PIN_TRIG, HIGH);
     delayMicroseconds(10);
     digitalWrite(PIN_TRIG, LOW);
     unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);  // waits 30 ms at most
     if (duration == 0) {
       return -1;
     }
     float distance = duration / 58.0;
     int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
     return constrain(percent, 0, 100);
   }

   // ---------- Watering state machine ----------
   const char* stateName(WateringState s) {
     if (s == STANDBY) {
       return "STANDBY";
     }
     if (s == WATERING) {
       return "WATERING";
     }
     return "COOLDOWN";
   }

   // The only place where the state changes: note the time and report the move.
   void moveTo(WateringState newState) {
     Serial.print("[");
     Serial.print(stateName(state));
     Serial.print(" -> ");
     Serial.print(stateName(newState));
     Serial.println("]");
     state = newState;
     stateStartTime = millis();
   }

   // Tries to turn on the pump. Tank safety check (Module 6): too little water = refused, then rest.
   void startWatering() {
     int waterLevel = readWaterLevel();
     if (waterLevel < MIN_WATER_LEVEL) {  // -1 (unreadable) is smaller too, so it is refused as well
       Serial.print("Pump REFUSED: water level ");
       if (waterLevel < 0) {
         Serial.println("unreadable.");
       } else {
         Serial.print(waterLevel);
         Serial.println(" %.");
       }
       problemRhythm = true;  // the status LED blinks fast: fill the tank!
       moveTo(COOLDOWN);
       return;
     }
     problemRhythm = false;
     Serial.print("Pump on (water level ");
     Serial.print(waterLevel);
     Serial.println(" %).");
     digitalWrite(PIN_PUMP, HIGH);
     moveTo(WATERING);
   }

   void runWatering() {
     unsigned long now = millis();

     if (state == STANDBY) {
       // STANDBY: check the soil every 2 seconds; if it's dry, start watering
       if (now - lastCheckTime >= CHECK_INTERVAL) {
         lastCheckTime = now;
         int soil = readSoilPercent();
         Serial.print("STANDBY: soil ");
         Serial.print(soil);
         Serial.println(" %");
         if (soil < SOIL_WATERING_THRESHOLD) {
           startWatering();
         }
       }
     } else if (state == WATERING) {
       // WATERING: the pump turns off after 3 seconds, then rest
       if (now - stateStartTime >= WATERING_TIME) {
         digitalWrite(PIN_PUMP, LOW);
         Serial.println("Pump off.");
         moveTo(COOLDOWN);
       }
     } else if (state == COOLDOWN) {
       // COOLDOWN: wait 30 seconds so the water can soak in before the soil is checked again
       if (now - stateStartTime >= COOLDOWN_TIME) {
         moveTo(STANDBY);
       }
     }
   }

   // ---------- What the button does ----------
   void shortPress() {
     lampOn = !lampOn;
     if (lampOn) {
       digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
       Serial.println("Button: lamp on");
     } else {
       digitalWrite(PIN_LAMP_RELAY, HIGH);
       Serial.println("Button: lamp off");
     }
   }

   void longPress() {
     if (state == STANDBY) {
       Serial.println("Button held: water now!");
       startWatering();
     } else {
       Serial.print("Button held, but watering is in ");
       Serial.print(stateName(state));
       Serial.println(". Try again later.");
     }
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_STATUS_LED, OUTPUT);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     pinMode(PIN_LAMP_RELAY, OUTPUT);
     digitalWrite(PIN_LAMP_RELAY, HIGH);  // lamp off (active-LOW relay)
     pinMode(PIN_FAN_RELAY, OUTPUT);
     digitalWrite(PIN_FAN_RELAY, HIGH);  // fan off
     pinMode(PIN_PUMP, OUTPUT);
     digitalWrite(PIN_PUMP, LOW);
     pinMode(PIN_TRIG, OUTPUT);
     digitalWrite(PIN_TRIG, LOW);
     pinMode(PIN_ECHO, INPUT);
     Serial.println("Practice 3 - watering state machine: STANDBY -> WATERING -> COOLDOWN -> STANDBY");
   }

   void loop() {
     updateHeartbeat();
     checkButton();
     runWatering();
   }
   ```

2. **Replace the calibration numbers with your own.** The four numbers in the "Your calibration results from Module 6" section (`SOIL_DRY`, `SOIL_WET`, `DISTANCE_EMPTY`, `DISTANCE_FULL`) must be the same as the numbers in your Node 1. Open your Node 1 (**File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home**, then `node-1-home.ino`); that sketch opens in a new window. Copy the four numbers from the `// ---------- Module 6: your calibration results` section into the same section of the Practice 3 sketch, then close the Node 1 window without changing anything. After that, click **Upload** again in the `module08_watering_state_machine` window. In Wokwi, leave the default numbers as they are.
3. As long as the soil is moist, Node 1 stays in the STANDBY state and checks the soil every 2 seconds: `STANDBY: soil 70 %`, and so on. Your numbers will of course be different.

#### 3.3 Dry out the soil, then follow the state changes

1. **Lift the soil sensor into the air.** Within 2 seconds, Node 1 finds `soil` below 30%, checks the water in the tank, then turns on the pump: `[STANDBY -> WATERING]`.
2. **While the pump is running, press the button briefly.** The lamp relay goes "click" right away and its indicator LED lights up (`Button: lamp on`), even though the pump isn't finished yet. In Node 1 v0.4.0, that press would have been lost.
3. Exactly 3 seconds later, the pump turns off and Node 1 rests: `[WATERING -> COOLDOWN]`.
4. **During COOLDOWN, press and hold the button for 1 second** (2–3 seconds in Wokwi). The "water now" request is politely refused, because the watering is resting.
5. After 30 seconds, Node 1 goes back to STANDBY. If the sensor is still in the air, it waters again. **Stick the sensor back into the moist soil** so that your plant glass doesn't overflow.

**Expected output** in Wokwi (in the same order as the steps above):

```text
Practice 3 - watering state machine: STANDBY -> WATERING -> COOLDOWN -> STANDBY
STANDBY: soil 70 %
STANDBY: soil 70 %
STANDBY: soil 70 %
STANDBY: soil 70 %
STANDBY: soil 0 %
Pump on (water level 52 %).
[STANDBY -> WATERING]
Button: lamp on
Pump off.
[WATERING -> COOLDOWN]
Button held, but watering is in COOLDOWN. Try again later.
[COOLDOWN -> STANDBY]
STANDBY: soil 0 %
Pump on (water level 52 %).
[STANDBY -> WATERING]
Pump off.
[WATERING -> COOLDOWN]
```

**In Wokwi:** click an empty spot in the simulation panel, then press **F**. The soil sensor is replaced by a **potentiometer** (the round knob at the top right). To "lift the sensor into the air", click the potentiometer, then press **End** so it turns all the way to the right (`soil 0 %`). To "stick it back in", drag the knob to the middle until `soil` is above 30%. The pump is drawn as a light-blue LED labeled `pump`.

![Wokwi screenshot of Practice 3, zoomed out with the F key, then cropped; the part-name labels were added by the author. Top: the Node 1 circuit with the labels D13 button on the left, pump (light-blue LED): on, lamp (yellow LED): on, soil sensor = potentiometer, HC-SR04 (water level) at the top right, and status LED (D4) below the board. Bottom: the Serial Monitor: three lines of STANDBY: soil 70 %, then STANDBY: soil 0 % (marker 1, the potentiometer turned all the way to the right with End, as if the sensor had been lifted into the air), Pump on (water level 52 %) and [STANDBY -> WATERING] (marker 2, a water level of 52 percent from the HC-SR04, so the pump may run; the move goes through one door, moveTo()), and Button: lamp on (marker 3, the button is still heard while the pump runs)](assets/wokwi-watering-state-machine.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

#### 3.4 Inside the code

- **`enum WateringState { STANDBY, WATERING, COOLDOWN };`** is at the top of the sketch, before the first function, following the rule in Concept 4.
- **`runWatering()`** is called on every pass. Inside it are three `if`/`else if` branches, one for each state. Each branch only asks one thing: "is it time to move on?"
- **`moveTo()`** is the only place where the state changes. It prints the move and notes `stateStartTime`. That time is what WATERING uses to count 3 seconds and COOLDOWN uses to count 30 seconds.
- **`startWatering()`** checks the water tank right before the pump starts, as in Module 6. If there's too little water, the pump is refused, Node 1 goes straight to its rest (`[STANDBY -> COOLDOWN]`), and the status LED blinks fast as a sign: "fill the tank!".
- **`longPress()`** only allows "water now" in the STANDBY state. Even the button follows the state machine's rules: the same request can be accepted or refused, depending on the state.

Compare this with Node 1 v0.4.0, which counted the watering cooldown with `wateringCooldownLeft` (the number of reports left). Here the cooldown is measured with the **clock** (`COOLDOWN_TIME = 30000` ms), so it always lasts 30 seconds, no matter how fast `loop()` runs.

#### 3.5 Experiment

- **An empty tank.** On the real board, lift the HC-SR04 sensor off the water tank and point it at something far away. In Wokwi, click the HC-SR04 (top right) and slide its distance to `19` cm. Then dry out the soil: the pump is refused (`Pump REFUSED: water level 6 %.`), the state goes straight to `[STANDBY -> COOLDOWN]`, and the status LED blinks fast. Put the sensor back when you're done.
- **Draw your own state machine on paper:** three circles (STANDBY, WATERING, COOLDOWN) and four arrows, each labeled with its trigger. Compare it with the picture in Concept 4. Keep a photo of it; a more complicated state machine is always easier to design on paper first.

> ⬆️ **Done with Practice 3?** Go back to [Concept 5](#5-modular-code-one-sketch-several-files).

### Practice 4 — Modular code: split it into several files (35 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor**, or Wokwi with the complete Node 1 [`diagram.json`](code/module08_modular/diagram.json). The parts and the circuit are the same as in Practice 3. Concepts used: 5.

In this practice, you move the **heartbeat** and the **button** from the Practice 3 sketch into two modules of their own. The behavior doesn't change one bit; only the tidiness does. Later, Node 1 v1.0 uses both modules **exactly as they are**.

#### 4.1 Save it as a new sketch

Open the `module08_watering_state_machine` sketch, then choose **File → Save As…** and save it under the name `module08_modular` in the `module-08` folder. The Practice 3 sketch stays intact as a backup. **In Wokwi:** carry on in the Practice 3 project, or open a new ESP32 project, then paste in this practice's `diagram.json` and the Practice 3 code.

#### 4.2 Create four new tabs

Every module needs two files. In Arduino IDE, every file of a sketch appears as a **tab** above the editor. The first picture below shows how to create a new tab in Arduino IDE; the second shows how to do it in Wokwi.

![Illustration of Arduino IDE 2.3.10 with the module08_modular sketch open; the editor still holds the beginning of the Practice 3 sketch. Marker 1 is on the three-dots button at the right end of the tab bar. Marker 2 is on the menu that opens below it, at the item New Tab with the shortcut Ctrl+Shift+N; the other items are Rename, Delete, Previous Tab, and Next Tab. In the middle, the Name for new file dialog box with a text box holding heartbeat.h (marker 3) and the CANCEL and OK buttons, with OK marked by marker 4. The captions at the bottom: 1, click the three dots at the right end of the tab bar; 2, choose New Tab (shortcut Ctrl + Shift + N); 3, type the full name with its extension, heartbeat.h, heartbeat.cpp; 4, click OK, and the new, empty tab opens right away. A note: an illustration, not a screenshot](assets/arduino-new-tab.png)

**In Wokwi:** click the **▾** sign at the right end of the tab bar above the editor, then choose **New file...**. In the `Create a new file` box that appears, type the file's full name with its extension (for example `heartbeat.h`), then click **CREATE** (or press **Enter**). If the name box still holds the name of the previous file, clear it before you type. The new, still empty tab opens right away; paste its contents there. One important thing: **Wokwi doesn't build a file that is still empty**, so paste its contents before you press **▶**.

![Wokwi screenshot, cropped. Top: the editor's tab bar with sketch.ino, diagram.json, and Library Manager, with the beginning of the Practice 3 sketch in the editor; the small triangle at the right end of the tab bar has been clicked (marker 1) and has opened the menu Format code, Rename, Delete, New file... (marker 2: the file name box appears right away), and Upload file(s).... Bottom: the Create a new file box with the New file name text box (marker 3: type the file's full name with its extension, for example heartbeat.h, then heartbeat.cpp; if it still holds an old name, clear it first) and the CANCEL and CREATE buttons (marker 4: click CREATE or press Enter; the new, empty tab opens, so paste its contents before pressing the button that starts the simulation)](assets/wokwi-new-file.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

1. Click the **⋯** button (three dots) at the right end of the tab bar, then choose **New Tab**. Its shortcut is **Ctrl + Shift + N**.
2. The `Name for new file` box appears. Type **`heartbeat.h`**, **complete with its extension**, then click **OK**. If you forget the extension, Arduino IDE adds `.ino` by itself, and the file becomes an ordinary sketch tab instead of a module's menu.
3. The still empty `heartbeat.h` tab appears. Paste this into it:

   ```cpp
   // heartbeat.h - the status LED as Node 1's "heartbeat" (Module 8)
   // Slow blink = the program runs normally; fast blink = there is a problem.
   #pragma once

   void beginHeartbeat(int pin);           // call once in setup()
   void setHeartbeatRhythm(bool problem);  // true = fast blink, false = slow blink
   void updateHeartbeat();                 // call on every pass of loop()
   ```

4. Repeat steps 1–3 for the other three files. First, **`heartbeat.cpp`**:

   ```cpp
   // heartbeat.cpp - the code of the heartbeat module. Its functions are listed in heartbeat.h.
   #include <Arduino.h>
   #include "heartbeat.h"

   const unsigned long NORMAL_BEAT = 1000;  // one blink every 1 second
   const unsigned long PROBLEM_BEAT = 250;  // four blinks every 1 second
   const unsigned long BEAT_ON_TIME = 100;  // the LED is on for 100 ms at the start of each beat

   // "static" = belongs to this file only; other files can't see it or mix it up with their own.
   static int heartbeatPin = -1;
   static bool problemRhythm = false;
   static unsigned long beatStartTime = 0;

   void beginHeartbeat(int pin) {
     heartbeatPin = pin;
     pinMode(heartbeatPin, OUTPUT);
   }

   void setHeartbeatRhythm(bool problem) {
     problemRhythm = problem;
   }

   void updateHeartbeat() {
     unsigned long now = millis();
     unsigned long beatLength = NORMAL_BEAT;
     if (problemRhythm) {
       beatLength = PROBLEM_BEAT;
     }
     if (now - beatStartTime >= beatLength) {
       beatStartTime = now;  // start the next beat
     }
     // The LED is on only at the start of a beat: true = HIGH (on), false = LOW (off)
     digitalWrite(heartbeatPin, now - beatStartTime < BEAT_ON_TIME);
   }
   ```

   Second, **`button.h`**:

   ```cpp
   // button.h - a button with debounce, short press, and long press, without waiting (Module 8)
   #pragma once

   // The three possible answers of checkButton()
   enum ButtonEvent { NONE, SHORT_PRESS, LONG_PRESS };

   void beginButton(int pin);  // call once in setup()
   ButtonEvent checkButton();  // call on every pass of loop()
   ```

   Third, **`button.cpp`**:

   ```cpp
   // button.cpp - the code of the button module. Its functions are listed in button.h.
   #include <Arduino.h>
   #include "button.h"

   const unsigned long DEBOUNCE_DELAY = 30;     // milliseconds: the reading must stay steady this long (Module 5)
   const unsigned long LONG_PRESS_TIME = 1000;  // held for 1 second or more = long press

   static int buttonPin = -1;
   static int previousReading = HIGH;        // the raw reading on the previous pass; HIGH = released
   static unsigned long lastChangeTime = 0;  // when the raw reading last changed
   static int stableState = HIGH;            // the state we already trust (steady for 30 ms)
   static unsigned long pressStartTime = 0;  // when the button started being pressed
   static bool longPressDone = false;        // long press for this press already reported?

   void beginButton(int pin) {
     buttonPin = pin;
     pinMode(buttonPin, INPUT_PULLUP);
   }

   ButtonEvent checkButton() {
     unsigned long now = millis();
     int reading = digitalRead(buttonPin);

     // 1. Did the reading change (pressed, released, bouncing, or noise)? Count its "steady" time from zero again.
     if (reading != previousReading) {
       previousReading = reading;
       lastChangeTime = now;
     }

     // 2. Steady for 30 ms and different from the trusted state? That's a real change.
     if (reading != stableState && now - lastChangeTime >= DEBOUNCE_DELAY) {
       stableState = reading;
       if (stableState == LOW) {  // just pressed: start timing how long
         pressStartTime = now;
         longPressDone = false;
       } else if (!longPressDone) {  // just released before 1 second: short press
         return SHORT_PRESS;
       }
     }

     // 3. Still held after 1 second? Long press, reported once without waiting for the finger to lift.
     if (stableState == LOW && !longPressDone && now - pressStartTime >= LONG_PRESS_TIME) {
       longPressDone = true;
       return LONG_PRESS;
     }
     return NONE;
   }
   ```

**Don't click Verify yet** (in Wokwi: don't click **▶** yet) until step 4.3 is done: the main tab still holds the Practice 3 versions of `updateHeartbeat()` and `checkButton()`, which clash with your new modules.

#### 4.3 Replace the contents of the main tab

Click the **`module08_modular.ino`** tab (the leftmost tab; in Wokwi: **`sketch.ino`**), then replace all its contents with the version that already uses both modules:

```cpp
// Module 8 - Practice 4: modular code
// The Practice 3 sketch, split up: the heartbeat moves to heartbeat.h/.cpp, the button to button.h/.cpp.
// Same circuit as Practice 3. It behaves exactly the same, too.

#include "heartbeat.h"
#include "button.h"

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;
const int PIN_LAMP_RELAY = 32;  // active-LOW relay
const int PIN_FAN_RELAY = 33;   // not used here, but its relay is switched off so it stays quiet
const int PIN_PUMP = 25;        // MOSFET gate: HIGH = pump on
const int PIN_SOIL = 39;        // VN
const int PIN_TRIG = 15;
const int PIN_ECHO = 35;

// Your calibration results from Module 6 (replace them with your own numbers)
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

// Watering rules
const int SOIL_WATERING_THRESHOLD = 30;     // water if the soil is below 30%
const int MIN_WATER_LEVEL = 20;             // the pump is refused if the tank is less than 20% full
const unsigned long CHECK_INTERVAL = 2000;  // STANDBY: check the soil every 2 seconds
const unsigned long WATERING_TIME = 3000;   // WATERING: the pump runs for 3 seconds
const unsigned long COOLDOWN_TIME = 30000;  // COOLDOWN: rest 30 seconds before watering is allowed again

bool lampOn = false;

// The three watering states. A list of names like this (enum) goes at the top, before any function.
enum WateringState { STANDBY, WATERING, COOLDOWN };
WateringState state = STANDBY;     // the current state; starts at STANDBY
unsigned long stateStartTime = 0;  // when the current state started
unsigned long lastCheckTime = 0;   // when the soil was last checked

// ---------- Soil sensor and water tank (Module 6) ----------
int readSoilPercent() {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(PIN_SOIL);  // 20 readings in a row, no pause (done in a flash)
  }
  int percent = map(sum / 20, SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

// Returns how full the tank is in percent, or -1 if the HC-SR04 echo doesn't come back.
int readWaterLevel() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);  // waits 30 ms at most
  if (duration == 0) {
    return -1;
  }
  float distance = duration / 58.0;
  int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
  return constrain(percent, 0, 100);
}

// ---------- Watering state machine ----------
const char* stateName(WateringState s) {
  if (s == STANDBY) {
    return "STANDBY";
  }
  if (s == WATERING) {
    return "WATERING";
  }
  return "COOLDOWN";
}

// The only place where the state changes: note the time and report the move.
void moveTo(WateringState newState) {
  Serial.print("[");
  Serial.print(stateName(state));
  Serial.print(" -> ");
  Serial.print(stateName(newState));
  Serial.println("]");
  state = newState;
  stateStartTime = millis();
}

// Tries to turn on the pump. Tank safety check (Module 6): too little water = refused, then rest.
void startWatering() {
  int waterLevel = readWaterLevel();
  if (waterLevel < MIN_WATER_LEVEL) {  // -1 (unreadable) is smaller too, so it is refused as well
    Serial.print("Pump REFUSED: water level ");
    if (waterLevel < 0) {
      Serial.println("unreadable.");
    } else {
      Serial.print(waterLevel);
      Serial.println(" %.");
    }
    setHeartbeatRhythm(true);  // the status LED blinks fast: fill the tank!
    moveTo(COOLDOWN);
    return;
  }
  setHeartbeatRhythm(false);
  Serial.print("Pump on (water level ");
  Serial.print(waterLevel);
  Serial.println(" %).");
  digitalWrite(PIN_PUMP, HIGH);
  moveTo(WATERING);
}

void runWatering() {
  unsigned long now = millis();

  if (state == STANDBY) {
    // STANDBY: check the soil every 2 seconds; if it's dry, start watering
    if (now - lastCheckTime >= CHECK_INTERVAL) {
      lastCheckTime = now;
      int soil = readSoilPercent();
      Serial.print("STANDBY: soil ");
      Serial.print(soil);
      Serial.println(" %");
      if (soil < SOIL_WATERING_THRESHOLD) {
        startWatering();
      }
    }
  } else if (state == WATERING) {
    // WATERING: the pump turns off after 3 seconds, then rest
    if (now - stateStartTime >= WATERING_TIME) {
      digitalWrite(PIN_PUMP, LOW);
      Serial.println("Pump off.");
      moveTo(COOLDOWN);
    }
  } else if (state == COOLDOWN) {
    // COOLDOWN: wait 30 seconds so the water can soak in before the soil is checked again
    if (now - stateStartTime >= COOLDOWN_TIME) {
      moveTo(STANDBY);
    }
  }
}

// ---------- What the button does ----------
void shortPress() {
  lampOn = !lampOn;
  if (lampOn) {
    digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
    Serial.println("Button: lamp on");
  } else {
    digitalWrite(PIN_LAMP_RELAY, HIGH);
    Serial.println("Button: lamp off");
  }
}

void longPress() {
  if (state == STANDBY) {
    Serial.println("Button held: water now!");
    startWatering();
  } else {
    Serial.print("Button held, but watering is in ");
    Serial.print(stateName(state));
    Serial.println(". Try again later.");
  }
}

void setup() {
  Serial.begin(115200);
  beginHeartbeat(PIN_STATUS_LED);  // the heartbeat module sets up its own LED pin
  beginButton(PIN_BUTTON);         // the button module sets up its own button pin
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  digitalWrite(PIN_LAMP_RELAY, HIGH);  // lamp off (active-LOW relay)
  pinMode(PIN_FAN_RELAY, OUTPUT);
  digitalWrite(PIN_FAN_RELAY, HIGH);  // fan off
  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
  Serial.println("Practice 4 - modular code: it behaves the same as Practice 3.");
}

void loop() {
  updateHeartbeat();

  // The button module only reports what happened; this sketch decides what to do about it.
  ButtonEvent event = checkButton();
  if (event == SHORT_PRESS) {
    shortPress();
  } else if (event == LONG_PRESS) {
    longPress();
  }

  runWatering();
}
```

#### 4.4 Test: it must behave exactly the same

Click **Verify** (✓). If it succeeds, click **Upload**, then repeat step 3.3 of Practice 3. The result in the Serial Monitor is exactly the same, except for the first line, which now reads `Practice 4 - modular code: it behaves the same as Practice 3.`. If there's an error, see section 4.5 below; that's where we make the two most common errors on purpose.

Compare the length, too: the main tab is now about forty lines shorter. Everything about the status LED and the button is stored tidily in its own module.

#### 4.5 Make the two most common errors on purpose

You're sure to meet both of these errors one day. Better to get to know them now, while you know exactly what causes them.

**Error 1 — a forgotten `#include`.** In the main tab, turn the line `#include "heartbeat.h"` into a comment by adding `//` in front of it, then click **Verify**. Several errors appear. Their core looks like this (each line starts with the file name and its line number):

```text
error: 'setHeartbeatRhythm' was not declared in this scope
error: 'setHeartbeatRhythm' was not declared in this scope
error: 'beginHeartbeat' was not declared in this scope
error: 'updateHeartbeat' was not declared in this scope
```

The compiler doesn't know `setHeartbeatRhythm`, `beginHeartbeat`, and `updateHeartbeat`, because the main tab no longer "reads its menu". This is a **compile-stage** error. Delete the `//` again, then click **Verify** until it succeeds.

**Error 2 — a dish nobody cooks.** In the **`heartbeat.cpp`** tab, change `void updateHeartbeat() {` to `void updateHeartBeat() {` (with a capital B, as if you had made a typo), then click **Verify**. This time the error is different. In Arduino IDE (Windows), its core looks like this (a long file location comes in front of it):

```text
undefined reference to `updateHeartbeat()'
collect2.exe: error: ld returned 1 exit status
```

The menu (`heartbeat.h`) promises `updateHeartbeat()`, but no kitchen cooks it: `heartbeat.cpp` only has `updateHeartBeat()` (remember Module 3: uppercase and lowercase are different). This is a **link-stage** error (`ld`). The key sentence is ``undefined reference to `updateHeartbeat()'``. In Wokwi, the function name appears in a coded form, `_Z15updateHeartbeatv`; you can still read `updateHeartbeat` in the middle of it. Change the name back to `updateHeartbeat`, then click **Verify** until it succeeds.

#### 4.6 Inside the code: what changed?

- **Moved almost as they were:** the heartbeat's constants and variables are now in `heartbeat.cpp`, and the button's are in `button.cpp`. `stableButton` was renamed `stableState`, and each module has a new variable for its pin number (`heartbeatPin`, `buttonPin`). All of them get `static`, except the constants, which only apply in their own file anyway.
- **`beginHeartbeat(pin)` and `beginButton(pin)`** replace `pinMode()` for the LED and the button in `setup()`. Each module sets up its own pin.
- **`setHeartbeatRhythm(true)`** replaces `problemRhythm = true`. The main tab no longer touches the heartbeat module's variables; it "orders" through a function that's on the menu.
- **`checkButton()` now returns a `ButtonEvent`**: `NONE`, `SHORT_PRESS`, or `LONG_PRESS`. In Practice 3, the button function called `shortPress()` and `longPress()` itself. Now the button module only **reports**, and `loop()` **decides** what happens (Concept 5). That's why the button module can be used in Node 1 v1.0 for different tasks without a single change.

> ⬆️ **Done with Practice 4?** Go back to [Concept 6](#6-char-and-snprintf-building-text-without-borrowing-memory).

### Practice 5 — A threshold that doesn't forget: NVS (25 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor** (115200 baud, **New Line**), or Wokwi with the small circuit's [`diagram.json`](code/module08_nvs_threshold/diagram.json). The ESP32 board over USB is enough. The Node 1 circuit may stay connected, and the MB102 may stay off, because this sketch doesn't touch any pin. Concepts used: 6 and 7.
>
> ⭐ **Required** — part of the completion requirements: the threshold you save is still there after the board is unplugged and then plugged back in.

#### 5.1 Upload it and get to know its commands

1. Create a new sketch named `module08_nvs_threshold`, paste this code, click **Upload**, then open the Serial Monitor:

   ```cpp
   // Module 8 - Practice 5: a threshold that doesn't forget (NVS with the Preferences library)
   // The ESP32 board is enough. The Node 1 circuit may stay connected: this sketch doesn't touch any pin.
   // The Preferences library already comes with the esp32 package, so there's nothing to install.
   //
   // Commands in the Serial Monitor (choose New Line):
   //   threshold          -> show the current threshold
   //   threshold 35       -> save a new threshold (0-100) to NVS
   //   threshold default  -> delete it from NVS, back to the default value
   //   restart            -> restart the board (how Wokwi imitates "unplugged, then plugged back in")

   #include <Preferences.h>

   const int DEFAULT_THRESHOLD = 30;  // used as long as NVS holds no threshold yet

   Preferences archive;  // this sketch's NVS "filing cabinet"
   int soilWateringThreshold = DEFAULT_THRESHOLD;
   unsigned long bootCount = 0;

   // ---------- A Serial line reader that never waits ----------
   const int MAX_LINE_LENGTH = 40;
   char line[MAX_LINE_LENGTH + 1];  // +1 for the end-of-text mark
   int lineLength = 0;

   // Collects letters from the Serial Monitor WITHOUT waiting.
   // Returns true once, when a line is complete (ended with Enter); its text is in "line".
   bool lineReady() {
     while (Serial.available() > 0) {
       char letter = Serial.read();
       if (letter == '\n') {
         line[lineLength] = '\0';  // end-of-text mark
         lineLength = 0;           // ready to collect the next line
         return true;
       }
       if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
         line[lineLength] = letter;
         lineLength++;
       }
     }
     return false;
   }

   void showThreshold() {
     Serial.print("soil_watering threshold: ");
     Serial.print(soilWateringThreshold);
     if (archive.isKey("soil_watering")) {
       Serial.println(" % (from NVS)");
     } else {
       Serial.println(" % (default value, never saved)");
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("Practice 5 - threshold in NVS");

     archive.begin("node1", false);  // open the folder "node1"; false = may read AND write

     bootCount = archive.getULong("boot_count", 0) + 1;  // 0 if this label has never been written
     archive.putULong("boot_count", bootCount);
     Serial.print("Boot #");
     Serial.println(bootCount);

     soilWateringThreshold = archive.getInt("soil_watering", DEFAULT_THRESHOLD);  // the default value if there isn't one yet
     showThreshold();
     Serial.println("Commands: threshold, threshold 35, threshold default, restart");
   }

   void loop() {
     if (!lineReady()) {
       return;  // no complete line yet: return at once, don't wait
     }
     String command = line;  // commands only arrive now and then, so String is safe to use here
     command.trim();
     command.toLowerCase();

     if (command == "threshold") {
       showThreshold();
     } else if (command == "threshold default") {
       archive.remove("soil_watering");  // delete this label from the folder
       soilWateringThreshold = DEFAULT_THRESHOLD;
       Serial.println("Threshold deleted from NVS.");
       showThreshold();
     } else if (command.startsWith("threshold ")) {
       String number = command.substring(10);  // the text after "threshold "
       int percent = number.toInt();
       if ((percent == 0 && number != "0") || percent < 0 || percent > 100) {
         Serial.println("Need a number 0-100. Example: threshold 35");
         return;
       }
       if (percent == soilWateringThreshold && archive.isKey("soil_watering")) {
         Serial.println("Same number as the saved one: NVS doesn't need to be written again.");
         return;
       }
       archive.putInt("soil_watering", percent);  // write to flash: it stays even when the power goes out
       soilWateringThreshold = percent;
       Serial.print("Saved to NVS: ");
       Serial.print(percent);
       Serial.println(" %");
     } else if (command == "restart") {
       Serial.println("Restarting now...");
       Serial.flush();  // wait until the message above has really been sent
       ESP.restart();
     } else {
       Serial.println("Unknown command. Try: threshold, threshold 35, threshold default, restart");
     }
   }
   ```

2. The Serial Monitor prints `Boot #1` and `soil_watering threshold: 30 % (default value, never saved)`. If the number after `Boot #` is bigger, that's fine: the board has already restarted, for example because the EN button was pressed.
3. Type these commands one at a time in the Serial Monitor's input box, and press **Enter** after each one:
   - `threshold` — shows the current threshold.
   - `threshold 35` — saves 35% to NVS.
   - `threshold 35` once more — the number is the same, so NVS isn't written again (Concept 7: flash can wear out).
   - `threshold abc` — refused, because it isn't a number from 0 to 100.

#### 5.2 Prove it: unplug, then plug back in

1. **Unplug the USB cable** from the laptop. (If the MB102 is on, turn the MB102 off first, then unplug the USB.)
2. Wait 10 seconds so that the board is completely off, then plug it back in. If the Serial Monitor doesn't reconnect by itself, select the port again in the top bar of Arduino IDE, then press **EN** on the board so that its opening messages are printed again.
3. Now it prints `soil_watering threshold: 35 % (from NVS)`, and the `Boot #` number goes up by one, for example to `Boot #2`. If you pressed **EN** just now, the number goes up by one more, because every start of the board is counted. Your threshold survived the power cut.

**In Wokwi**, type `restart` to imitate a power cut; **don't** press **■** and then **▶**. Remember the table in Concept 7: Wokwi starts with a new, empty chip every time the simulation is started again.

**Expected output** in Wokwi, from the first `threshold` to the `threshold` typed again after `restart`:

```text
soil_watering threshold: 30 % (default value, never saved)
Saved to NVS: 35 %
Same number as the saved one: NVS doesn't need to be written again.
Need a number 0-100. Example: threshold 35
Restarting now...
ets Jul 29 2019 12:21:46
rst:0xc (SW_CPU_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
…
Practice 5 - threshold in NVS
Boot #2
soil_watering threshold: 35 % (from NVS)
Commands: threshold, threshold 35, threshold default, restart
soil_watering threshold: 35 % (from NVS)
```

The line `rst:0xc (SW_CPU_RESET)` is the bootloader's report of a restart by the program, in this case the `ESP.restart()` of the `restart` command. You already know what the `rst:` codes mean from Module 2 (🔬), and Concept 8 discusses them again. On a real board that was unplugged and plugged back in, that line reads `rst:0x1 (POWERON_RESET)`.

Also try these:

- **Upload the same sketch again** (click **Upload** again). The threshold stays at 35%, and `Boot #` goes up by one. Uploading a program doesn't erase NVS.
- Type `threshold default`. The `soil_watering` label is deleted from the folder, and the threshold goes back to 30% (the default value).
- **In Wokwi**, press **■**, then **▶**. The board prints `Boot #1` again with a 30% threshold: a new chip, an empty filing cabinet.

#### 5.3 Inside the code

- **`archive.begin("node1", false)`** opens the folder named `node1` in the NVS filing cabinet. Node 1 v1.0 uses the same folder later, so the threshold you save in this practice **is read** by Node 1 v1.0 too. If you want to start clean, type `threshold default` first.
- **`bootCount`** is read with `getULong("boot_count", 0)`, increased by one, then written back. The result is a "how many times has it booted" counter that isn't erased when the power goes out. Node 1 v1.0 uses it for the 24-hour test: if the number goes up, there was a restart.
- **`archive.isKey("soil_watering")`** tells "35 because it really was saved" apart from "30 because it was never saved".
- **The threshold is only written if the number changes**, and it's always checked first: it must be a number from 0 to 100. The check `percent == 0 && number != "0"` is the same as `notANumber()` in Node 1 (Module 5): `toInt()` answers `0` for text that isn't a number, so an answer of `0` is only trusted if what was typed really is `0`.
- **`Serial.flush()`** before `ESP.restart()` waits until the message `Restarting now...` has really been sent. Without it, the message can get cut off because the board restarts too soon.

There's one more new thing in this sketch: **a Serial line reader that never waits**, the `lineReady()` function. In Module 5, commands were read with `Serial.readStringUntil('\n')`, which **waits** until the end-of-line mark arrives, for up to 1 second. This new function collects the letters that have already arrived into `char line[41]`, one by one, then returns right away. If the line isn't complete yet, it answers `false`, and `loop()` keeps working. As soon as the end-of-line mark (`'\n'`, sent by the **New Line** option) arrives, it closes the text with `'\0'` (Concept 6) and answers `true`. The `'\r'` character (back to the start of the line) is sent too if the line ending is **Both NL & CR**; this function throws it away so that your command is still recognized. From now on, every sketch that accepts commands uses this function.

> ⬆️ **Done with Practice 5?** Go back to [Concept 8](#8-the-watchdog-a-guard-that-restarts-a-stuck-program).

### Practice 6 — The watchdog: stuck on purpose, then rescued (30 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor** (115200 baud, **New Line**), or Wokwi with the small circuit's [`diagram.json`](code/module08_watchdog/diagram.json). Parts: the status LED (D4). USB is enough; the MB102 may stay off. Concepts used: 8.
>
> ⭐ **Required** — part of the completion requirements: you see for yourself how the watchdog restarts a stuck program, and you can read its restart reason.

This sketch has three "naughty" commands: `hang` (enters a loop that never ends), `sleep 3`, and `sleep 7` (`delay()` for 3 and 7 seconds). The status LED switches on and off every 0.5 seconds; as long as the LED blinks, we know `loop()` is still running.

#### 6.1 Without a guard first

1. Create a new sketch named `module08_watchdog` and paste this code:

   ```cpp
   // Module 8 - Practice 6: the watchdog, a guard that restarts a stuck program
   // Circuit: status LED on D4 (the Quick Win circuit, or the Node 1 workbench).
   //
   // Commands in the Serial Monitor (choose New Line):
   //   hang     -> deliberately enter a loop that never ends
   //   sleep 3  -> delay(3000): still under the watchdog limit
   //   sleep 7  -> delay(7000): goes past the 5-second limit
   //   restart  -> the program itself asks for a restart

   #include <esp_task_wdt.h>  // comes with the esp32 package

   const bool USE_WATCHDOG = true;               // change to false to see what happens WITHOUT a guard
   const unsigned long WATCHDOG_TIMEOUT = 5000;  // milliseconds
   const int PIN_STATUS_LED = 4;

   unsigned long lastBlinkTime = 0;
   bool ledOn = false;

   // ---------- A Serial line reader that never waits (same as Practice 5) ----------
   const int MAX_LINE_LENGTH = 40;
   char line[MAX_LINE_LENGTH + 1];
   int lineLength = 0;

   bool lineReady() {
     while (Serial.available() > 0) {
       char letter = Serial.read();
       if (letter == '\n') {
         line[lineLength] = '\0';
         lineLength = 0;
         return true;
       }
       if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
         line[lineLength] = letter;
         lineLength++;
       }
     }
     return false;
   }

   // The last restart reason, with its explanation.
   const char* explainResetReason() {
     esp_reset_reason_t reason = esp_reset_reason();
     if (reason == ESP_RST_POWERON) {
       return "POWERON (just powered on, EN button pressed, or just uploaded)";
     }
     if (reason == ESP_RST_SW) {
       return "SW (the program itself asked for a restart)";
     }
     if (reason == ESP_RST_TASK_WDT) {
       return "TASK_WDT (watchdog: loop() fed the guard too late)";
     }
     if (reason == ESP_RST_INT_WDT || reason == ESP_RST_WDT) {
       return "WDT (another kind of watchdog)";
     }
     if (reason == ESP_RST_PANIC) {
       return "PANIC (the program crashed)";
     }
     if (reason == ESP_RST_BROWNOUT) {
       return "BROWNOUT (the voltage briefly dropped)";
     }
     return "other";
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_STATUS_LED, OUTPUT);
     Serial.println();
     Serial.println("Practice 6 - watchdog");
     Serial.print("Last restart reason: ");
     Serial.println(explainResetReason());

     if (USE_WATCHDOG) {
       // The esp32 package version 3 way of writing it: all settings in one "form"
       esp_task_wdt_config_t watchdogConfig = {
         .timeout_ms = WATCHDOG_TIMEOUT,  // time limit: 5000 ms
         .idle_core_mask = 0b01,          // keep watching the "idle task" of core 0 (the esp32 package default)
         .trigger_panic = true,           // fed too late = panic, then restart
       };
       esp_task_wdt_reconfigure(&watchdogConfig);  // the esp32 package has already started the watchdog: just reconfigure it
       esp_task_wdt_add(NULL);                     // NULL = watch the task that is running now, that is, loop()
       Serial.println("Watchdog ACTIVE: a loop() stuck for more than 5 seconds will be restarted.");
     } else {
       Serial.println("Watchdog NOT used.");
     }
     Serial.println("Commands: hang, sleep 3, sleep 7, restart");
   }

   void loop() {
     if (USE_WATCHDOG) {
       esp_task_wdt_reset();  // "feed" the guard: a sign that loop() is still running
     }

     // The LED switches every 500 ms: as long as it blinks, we know loop() is still running
     if (millis() - lastBlinkTime >= 500) {
       lastBlinkTime = millis();
       ledOn = !ledOn;
       digitalWrite(PIN_STATUS_LED, ledOn);
     }

     if (!lineReady()) {
       return;
     }
     String command = line;
     command.trim();
     command.toLowerCase();

     if (command == "hang") {
       Serial.println("Entering a loop that never ends... the LED stops blinking.");
       while (true) {
         // empty on purpose: the program is stuck here forever
       }
     } else if (command.startsWith("sleep ")) {
       int seconds = command.substring(6).toInt();  // the text after "sleep " turned into a number
       Serial.print("delay(");
       Serial.print(seconds * 1000);
       Serial.println(")...");
       delay(seconds * 1000);
       Serial.println("Awake again!");
     } else if (command == "restart") {
       Serial.println("Restarting now...");
       Serial.flush();
       ESP.restart();
     } else {
       Serial.println("Unknown command. Try: hang, sleep 3, sleep 7, restart");
     }
   }
   ```

2. Before uploading, change the line `const bool USE_WATCHDOG = true;` to `const bool USE_WATCHDOG = false;`. Then click **Upload** and open the Serial Monitor.
3. Type `hang`, then press **Enter**. The LED stops blinking and stays on or stays off. Try typing another command: there's no answer. Wait 30 seconds: still nothing happens.

   **Expected output:**

   ```text
   Practice 6 - watchdog
   Last restart reason: POWERON (just powered on, EN button pressed, or just uploaded)
   Watchdog NOT used.
   Commands: hang, sleep 3, sleep 7, restart
   Entering a loop that never ends... the LED stops blinking.
   ```

This program is stuck **forever**. On a real Node 1, that would mean no more sensor readings, no display, and no pump safety until someone presses the **EN** button. Press **EN** now. In Wokwi, the EN button in the board picture can't be clicked, so stop the simulation (**■**), then run it again (**▶**).

#### 6.2 Put the guard in place

1. Change the line back to `const bool USE_WATCHDOG = true;`, then click **Upload**. The Serial Monitor now prints `Watchdog ACTIVE: …`.
2. Type `sleep 3`. `delay(3000)...` appears, the LED stops blinking for 3 seconds, then `Awake again!` appears. Three seconds is still under the 5-second limit, so the guard stays quiet.
3. Type `hang`. The LED stops blinking. **Count to five in your head.** About 5 seconds later, the guard "barks": the Serial Monitor fills up with a report whose lines start with `E (`, the board restarts by itself, the LED blinks again, and its opening lines name the reason: `TASK_WDT`.
4. Type `sleep 7`. This time the board is restarted too, even though the program was "only" sleeping. For the guard, a `loop()` that doesn't come back within 5 seconds **is the same as a stuck one**, whatever the cause. That's why Node 1 must be free of long `delay()` calls **before** its guard is put in place. If this guard had been put into Node 1 v0.4.0, the `pump 10` command, which sleeps for 10 seconds, would certainly have triggered a restart.

**Expected output** in Wokwi, from `sleep 3` until the board restarts after `sleep 7`:

```text
delay(3000)...
Awake again!
Entering a loop that never ends... the LED stops blinking.
E (23503) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:
E (23503) task_wdt:  - loopTask (CPU 1)
E (23503) task_wdt: Tasks currently running:
E (23503) task_wdt: CPU 0: IDLE0
E (23503) task_wdt: CPU 1: loopTask
E (23503) task_wdt: Aborting.
E (23503) task_wdt: Print CPU 1 backtrace

Backtrace: 0x400d1876:0x3ffb2220 0x400d3cd8:0x3ffb2270 0x40088125:0x3ffb2290

ELF file SHA256: 5f63bbb95

Rebooting...
ets Jul 29 2019 12:21:46
rst:0xc (SW_CPU_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
…
Practice 6 - watchdog
Last restart reason: TASK_WDT (watchdog: loop() fed the guard too late)
Watchdog ACTIVE: a loop() stuck for more than 5 seconds will be restarted.
Commands: hang, sleep 3, sleep 7, restart
delay(7000)...
E (7052) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:
E (7052) task_wdt:  - loopTask (CPU 1)
E (7052) task_wdt: Tasks currently running:
E (7052) task_wdt: CPU 0: IDLE0
E (7052) task_wdt: CPU 1: IDLE1
E (7052) task_wdt: Aborting.
E (7052) task_wdt: Print CPU 1 backtrace

Backtrace: 0x40085803:0x3ffbd550 0x400efc66:0x3ffbd570 0x400890e3:0x3ffbd590 0x40088125:0x3ffbd5b0

ELF file SHA256: 5f63bbb95

Rebooting...
ets Jul 29 2019 12:21:46
rst:0xc (SW_CPU_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
…
Practice 6 - watchdog
Last restart reason: TASK_WDT (watchdog: loop() fed the guard too late)
Watchdog ACTIVE: a loop() stuck for more than 5 seconds will be restarted.
Commands: hang, sleep 3, sleep 7, restart
```

#### 6.3 Reading the guard's report

The report looks scary, but you can read it line by line:

| Line | What it means |
| :--- | :--- |
| `E (23503) task_wdt:` | A log message of level ERROR (the letter **E**) from the `task_wdt` part (the guard). `23503` is the number of milliseconds since the board powered up. Your number will certainly be different. |
| `Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:` | In plain words: "The guard went off. The tasks below didn't feed it in time:" |
| ` - loopTask (CPU 1)` | The task that was late: `loopTask`, the official name of the task that runs `setup()` and `loop()`, on core 1. |
| `Tasks currently running:` then `CPU 0: IDLE0` and `CPU 1: loopTask` | What each core was doing at that moment. Core 0 was idle, while core 1 was still stuck in `loop()`. With `sleep 7`, the core 1 line reads `IDLE1`: `delay()` lets core 1 rest, but `loop()` still doesn't feed the guard. |
| `Aborting.` and `Backtrace: 0x400d…` | The program is forcibly stopped. That row of addresses is the "footprints" of where the program got stuck; how to translate them is explained in 🔬. |
| `Rebooting...` | The board restarts. |
| `rst:0xc (SW_CPU_RESET)` | The bootloader's report: a restart by the program (Concept 8). |
| `Last restart reason: TASK_WDT (…)` | The real reason, from `esp_reset_reason()`. In Node 1 v1.0, `resetReasonName()` shortens it to `WDT`, as in Appendix A of the Syllabus (Concept 8). |

#### 6.4 Old code that's still going around on the internet

Many tutorials, and even AI answers, still write the watchdog the esp32 package version 2 way. Try it yourself so that you recognize the symptoms:

1. In `setup()`, replace the six lines from `esp_task_wdt_config_t watchdogConfig = {` to `esp_task_wdt_reconfigure(&watchdogConfig);` with this one line:

   ```cpp
   esp_task_wdt_init(5, true);  // the esp32 package version 2 way of writing it
   ```

2. Click **Verify**. Compiling fails. The important part looks like this (each line starts with a file name and a line number):

   ```text
   error: invalid conversion from 'int' to 'const esp_task_wdt_config_t*' [-fpermissive]
   error: too many arguments to function 'esp_err_t esp_task_wdt_init(const esp_task_wdt_config_t*)'
   ```

   In package version 3, `esp_task_wdt_init()` only accepts one argument, the address of an `esp_task_wdt_config_t` "form", not a number of seconds and `true`.

3. Press **Ctrl + Z** until the six original lines are back, then click **Verify** until it succeeds.

> ⬆️ **Done with Practice 6?** Go back to [Concept 9](#9-leveled-logging-debug-info-error).

### Practice 7 — Leveled logging and a bug hunt (35 minutes)

> 🖥️ **Tools and parts:** **Arduino IDE** and the **Serial Monitor** (115200 baud, **New Line**), or Wokwi with the complete Node 1 [`diagram.json`](code/module08_bug_hunt/diagram.json). Parts used: the pump (D25) with its water tank and hose, the soil sensor (VN), and the HC-SR04 (D15 and D35). The MB102 is on. Also have **VS Code** ready for writing notes. Concepts used: 9 and 10.

This practice's sketch **contains one bug on purpose**. Your job isn't to stare at the code right away looking for the wrong line, but to practice the six detective steps from Concept 10, with the logger module as your magnifying glass. Don't peek at section 7.6 yet!

#### 7.1 Create a three-file sketch

1. Create a new sketch named `module08_bug_hunt`, then paste this code into its main tab:

   ```cpp
   // Module 8 - Practice 7: hunting a bug with leveled logging
   // Circuit: the Node 1 workbench (Module 7). Used here: pump D25, soil sensor on VN (GPIO 39),
   // and the HC-SR04 (TRIG D15, ECHO D35). The logger module is in the tabs logger.h and logger.cpp.
   //
   // This sketch has ONE BUG ON PURPOSE. The symptom: when the soil is dry, the pump only flicks on for a moment
   // every 2 seconds, although it should run for 3 seconds and then rest for 30 seconds.
   // Commands in the Serial Monitor: log debug, log info, log error.

   #include "logger.h"

   const int PIN_PUMP = 25;  // MOSFET gate: HIGH = pump on
   const int PIN_SOIL = 39;  // VN
   const int PIN_TRIG = 15;
   const int PIN_ECHO = 35;
   const int PIN_LAMP_RELAY = 32;  // not used here: the lamp and fan relays are switched off so they stay quiet
   const int PIN_FAN_RELAY = 33;

   const int SOIL_DRY = 3000;          // your calibration results from Module 6
   const int SOIL_WET = 1300;
   const float DISTANCE_EMPTY = 20.0;
   const float DISTANCE_FULL = 5.0;

   const int SOIL_WATERING_THRESHOLD = 30;
   const int MIN_WATER_LEVEL = 20;
   const unsigned long CHECK_INTERVAL = 2000;  // STANDBY: check the soil every 2 seconds
   const unsigned long WATERING_TIME = 3000;   // WATERING: the pump runs for 3 seconds
   const unsigned long COOLDOWN_TIME = 30000;  // COOLDOWN: rest 30 seconds

   enum WateringState { STANDBY, WATERING, COOLDOWN };
   WateringState state = STANDBY;
   unsigned long stateStartTime = 0;  // when the current state started
   unsigned long lastCheckTime = 0;
   unsigned long lastDebugTime = 0;

   // ---------- A Serial line reader that never waits (same as Practice 5) ----------
   const int MAX_LINE_LENGTH = 40;
   char line[MAX_LINE_LENGTH + 1];
   int lineLength = 0;

   bool lineReady() {
     while (Serial.available() > 0) {
       char letter = Serial.read();
       if (letter == '\n') {
         line[lineLength] = '\0';
         lineLength = 0;
         return true;
       }
       if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
         line[lineLength] = letter;
         lineLength++;
       }
     }
     return false;
   }

   void checkSerialCommand() {
     if (!lineReady()) {
       return;
     }
     String command = line;
     command.trim();
     command.toLowerCase();
     if (command == "log debug") {
       setLogLevel(LEVEL_DEBUG);
     } else if (command == "log info") {
       setLogLevel(LEVEL_INFO);
     } else if (command == "log error") {
       setLogLevel(LEVEL_ERROR);
     } else {
       Serial.println("Unknown command. Try: log debug, log info, log error");
       return;
     }
     Serial.print("Log level now: ");
     Serial.println(logLevelName(logLevel()));
   }

   int readSoilPercent() {
     long sum = 0;
     for (int i = 0; i < 20; i++) {
       sum += analogRead(PIN_SOIL);
     }
     int percent = map(sum / 20, SOIL_DRY, SOIL_WET, 0, 100);
     return constrain(percent, 0, 100);
   }

   int readWaterLevel() {
     digitalWrite(PIN_TRIG, LOW);
     delayMicroseconds(2);
     digitalWrite(PIN_TRIG, HIGH);
     delayMicroseconds(10);
     digitalWrite(PIN_TRIG, LOW);
     unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);
     if (duration == 0) {
       return -1;
     }
     float distance = duration / 58.0;
     int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
     return constrain(percent, 0, 100);
   }

   const char* stateName(WateringState s) {
     if (s == STANDBY) {
       return "STANDBY";
     }
     if (s == WATERING) {
       return "WATERING";
     }
     return "COOLDOWN";
   }

   void moveTo(WateringState newState) {
     logInfo("Watering: %s -> %s", stateName(state), stateName(newState));
     state = newState;
     unsigned long stateStartTime = millis();  // note when the new state started
   }

   void startWatering() {
     int waterLevel = readWaterLevel();
     logDebug("Water level: %d %%", waterLevel);
     if (waterLevel < MIN_WATER_LEVEL) {
       logError("Pump REFUSED: water level %d %%.", waterLevel);
       moveTo(COOLDOWN);
       return;
     }
     digitalWrite(PIN_PUMP, HIGH);
     logInfo("Pump on.");
     moveTo(WATERING);
   }

   void runWatering() {
     unsigned long now = millis();

     // Details for the bug hunt: how long in this state so far? Once per second so Serial isn't flooded.
     if (state != STANDBY && now - lastDebugTime >= 1000) {
       lastDebugTime = now;
       logDebug("%s: %lu ms so far", stateName(state), now - stateStartTime);
     }

     if (state == STANDBY) {
       if (now - lastCheckTime >= CHECK_INTERVAL) {
         lastCheckTime = now;
         int soil = readSoilPercent();
         logDebug("STANDBY: soil %d %% (threshold %d %%)", soil, SOIL_WATERING_THRESHOLD);
         if (soil < SOIL_WATERING_THRESHOLD) {
           logInfo("Dry soil (%d %%): start watering.", soil);
           startWatering();
         }
       }
     } else if (state == WATERING) {
       if (now - stateStartTime >= WATERING_TIME) {
         digitalWrite(PIN_PUMP, LOW);
         logInfo("Pump off.");
         moveTo(COOLDOWN);
       }
     } else if (state == COOLDOWN) {
       if (now - stateStartTime >= COOLDOWN_TIME) {
         moveTo(STANDBY);
       }
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_PUMP, OUTPUT);
     digitalWrite(PIN_PUMP, LOW);
     pinMode(PIN_TRIG, OUTPUT);
     digitalWrite(PIN_TRIG, LOW);
     pinMode(PIN_ECHO, INPUT);
     pinMode(PIN_LAMP_RELAY, OUTPUT);
     digitalWrite(PIN_LAMP_RELAY, HIGH);  // active-LOW relay: HIGH = off
     pinMode(PIN_FAN_RELAY, OUTPUT);
     digitalWrite(PIN_FAN_RELAY, HIGH);
     Serial.println();
     logInfo("Practice 7 - bug hunt. Log level: %s", logLevelName(logLevel()));
   }

   void loop() {
     checkSerialCommand();
     runWatering();
   }
   ```

   Don't click **Verify** yet: the main tab uses `logInfo()` from `logger.h`, which you only create in steps 2–3.

2. Create a new tab (**⋯ → New Tab**, as in Practice 4; in Wokwi **▾ → New file...**) named **`logger.h`**, then paste in this content:

   ```cpp
   // logger.h - leveled log messages to the Serial Monitor: DEBUG, INFO, ERROR (Module 8)
   // Use it like Serial.printf(), for example: logInfo("pump running for %d seconds", seconds);
   #pragma once

   enum LogLevel { LEVEL_DEBUG, LEVEL_INFO, LEVEL_ERROR };

   void setLogLevel(LogLevel level);          // messages below this level are not printed
   LogLevel logLevel();                       // the level in effect now
   const char* logLevelName(LogLevel level);  // "DEBUG", "INFO", or "ERROR"

   void logDebug(const char* format, ...);  // details for bug hunting
   void logInfo(const char* format, ...);   // important everyday events
   void logError(const char* format, ...);  // something is wrong and needs attention
   ```

3. Create one more tab named **`logger.cpp`**, then paste in this content:

   ```cpp
   // logger.cpp - the code of the logger module. Its functions are listed in logger.h.
   #include <Arduino.h>
   #include <stdarg.h>     // va_list: the "three dots" (...) arguments of logDebug, logInfo, and logError
   #include <esp_timer.h>  // esp_timer_get_time()
   #include "logger.h"

   static LogLevel currentLevel = LEVEL_INFO;  // default: DEBUG is hidden

   void setLogLevel(LogLevel level) {
     currentLevel = level;
   }

   LogLevel logLevel() {
     return currentLevel;
   }

   const char* logLevelName(LogLevel level) {
     if (level == LEVEL_DEBUG) {
       return "DEBUG";
     }
     if (level == LEVEL_INFO) {
       return "INFO";
     }
     return "ERROR";
   }

   // The heart of the three log functions: filters the level, then prints [hours:minutes:seconds since power-up], the level, and the message.
   static void printLog(LogLevel level, const char* format, va_list args) {
     if (level < currentLevel) {
       return;  // too detailed for the level chosen now
     }
     char message[160];
     vsnprintf(message, sizeof(message), format, args);  // like snprintf, but its arguments are passed on from "..."
     unsigned long seconds = esp_timer_get_time() / 1000000;  // seconds since power-up (Concept 3)
     // %02lu = unsigned long number, at least 2 digits (05, not 5); %-5s = text left-aligned, 5 characters wide
     Serial.printf("[%02lu:%02lu:%02lu] %-5s %s\n", seconds / 3600, (seconds / 60) % 60, seconds % 60,
                   logLevelName(level), message);
   }

   void logDebug(const char* format, ...) {
     va_list args;
     va_start(args, format);
     printLog(LEVEL_DEBUG, format, args);
     va_end(args);
   }

   void logInfo(const char* format, ...) {
     va_list args;
     va_start(args, format);
     printLog(LEVEL_INFO, format, args);
     va_end(args);
   }

   void logError(const char* format, ...) {
     va_list args;
     va_start(args, format);
     printLog(LEVEL_ERROR, format, args);
     va_end(args);
   }
   ```

4. Replace the four calibration numbers with your own (as in Practice 3). In Wokwi, leave the default numbers.
5. Make sure the tank has water in it, the soil sensor is stuck in moist soil, and the hose points into the plant glass or back into the tank. Plug in the USB, turn on the MB102 (the pump and the HC-SR04 get their power from it; in Practices 5 and 6, the MB102 could stay off), then click **Upload** and open the Serial Monitor. Its first line reads `[00:00:01] INFO  Practice 7 - bug hunt. Log level: INFO` (on a real board, the seconds may be `00`).

A quick look at the logger module. `logDebug()`, `logInfo()`, and `logError()` are used like `Serial.printf()` (Concept 6). The `...` in `logger.h` means "may be followed by any number of arguments", just like `printf`. Inside `logger.cpp`, all three pass their work on to `printLog()`, which (1) throws away messages whose level is below the level in effect, (2) builds the message with `vsnprintf()`, a sibling of `snprintf()` that takes its arguments from `...`, then (3) prints it with the time and the level in front. `va_list`, `va_start`, and `va_end` are C++ tools for passing on the arguments from `...`. You don't need to memorize them; it's enough to know how to use the three log functions.

#### 7.2 Step 1 — Reproduce the bug

1. Let the sketch run for **at least 30 seconds** after the upload finishes, so that the symptom matches the example below. Use that time to read the next steps.
2. Lift the soil sensor into the air. In Wokwi, click the potentiometer, then press **End**.
3. Watch the pump and the Serial Monitor. In Wokwi, the `pump` LED **only flicks on for a moment, again and again every 2 seconds**. On a real board, the pump doesn't even get a chance to spin; at most you hear a small "tick" from the pump. The clearest evidence is in the log: `Pump on.` and `Pump off.` appear in the same second, even though the rule (Practice 3) is clear: run for 3 seconds, then rest for 30 seconds.
4. Stick the sensor back into moist soil so that your glass doesn't overflow.

**Expected output** in Wokwi:

```text
[00:00:01] INFO  Practice 7 - bug hunt. Log level: INFO
[00:00:40] INFO  Dry soil (0 %): start watering.
[00:00:40] INFO  Pump on.
[00:00:40] INFO  Watering: STANDBY -> WATERING
[00:00:40] INFO  Pump off.
[00:00:40] INFO  Watering: WATERING -> COOLDOWN
[00:00:40] INFO  Watering: COOLDOWN -> STANDBY
[00:00:42] INFO  Dry soil (0 %): start watering.
[00:00:42] INFO  Pump on.
[00:00:42] INFO  Watering: STANDBY -> WATERING
[00:00:42] INFO  Pump off.
[00:00:42] INFO  Watering: WATERING -> COOLDOWN
[00:00:42] INFO  Watering: COOLDOWN -> STANDBY
```

Open **VS Code**, choose **File → Open Folder…**, then open **Documents → GitHub → learn-iot**. In the **Explorer** panel (on the left), click the `module-08` folder once so that it's highlighted, move the mouse over the **LEARN-IOT** title above it, then click the **New File…** icon (a sheet of paper with a +). The new file goes into the highlighted folder. Type `debugging-notes.md`, press **Enter**, write your first two detective sentences, then save with **Ctrl + S**. Leave VS Code open; you'll complete these notes in the next steps.

```markdown
- What should happen: the pump runs for 3 seconds, then rests for 30 seconds.
- What actually happens: the pump only flicks on for a moment, then turns on again 2 seconds later.
```

#### 7.3 Step 2 — Observe, don't guess

Read the INFO log above carefully. All four transitions, `STANDBY -> WATERING`, `WATERING -> COOLDOWN`, `COOLDOWN -> STANDBY`, and then `STANDBY -> WATERING` again, happen **in the same second or 2 seconds apart**. WATERING should last 3 seconds and COOLDOWN 30 seconds. Both end far too early. What do they have in common? Both measure how long they've lasted from `stateStartTime`. Write down your guess:

```markdown
- Guess: the time counting in the WATERING and COOLDOWN states is wrong.
```

#### 7.4 Step 3 — Zoom in on the evidence with DEBUG

Type `log debug` in the Serial Monitor, then dry out the soil again. Now the sketch also prints, once per second, how long it has been in the current state:

```text
Log level now: DEBUG
[00:00:44] DEBUG STANDBY: soil 0 % (threshold 30 %)
[00:00:44] INFO  Dry soil (0 %): start watering.
[00:00:44] DEBUG Water level: 52 %
[00:00:44] INFO  Pump on.
[00:00:44] INFO  Watering: STANDBY -> WATERING
[00:00:44] DEBUG WATERING: 44015 ms so far
[00:00:44] INFO  Pump off.
[00:00:44] INFO  Watering: WATERING -> COOLDOWN
[00:00:44] INFO  Watering: COOLDOWN -> STANDBY
[00:00:46] DEBUG STANDBY: soil 0 % (threshold 30 %)
[00:00:46] INFO  Dry soil (0 %): start watering.
[00:00:46] DEBUG Water level: 52 %
[00:00:46] INFO  Pump on.
[00:00:46] INFO  Watering: STANDBY -> WATERING
[00:00:46] DEBUG WATERING: 46015 ms so far
[00:00:46] INFO  Pump off.
[00:00:46] INFO  Watering: WATERING -> COOLDOWN
[00:00:46] INFO  Watering: COOLDOWN -> STANDBY
```

Look at the line `WATERING: … ms so far`. This line is printed **right after** the pump turns on, so its number should be close to `0`. In reality, the number is in the tens of thousands, almost the same as the time at the start of the log line, which is how long the board has been on. That means `now - stateStartTime` is the same as `now - 0`: **`stateStartTime` is always 0**, as if it were never filled in. That's the number that makes no sense, the one we were looking for. Add it to your notes:

```markdown
- Evidence: right after the pump turns on, the DEBUG log prints "WATERING: 44015 ms so far",
  almost the same as how long the board has been on. So stateStartTime is always 0.
```

Type `log info` to hide the DEBUG messages again, then stick the sensor back into moist soil (in Wokwi, drag the potentiometer knob to the middle).

#### 7.5 Steps 4 and 5 — Split in half and isolate

The question is now narrower: **where is `stateStartTime` filled in, and why doesn't its value get through?**

1. Press **Ctrl + F** in Arduino IDE, then search for `stateStartTime`. Press **Enter** repeatedly to jump from one match to the next. There are five places: one at the top of the sketch (where the variable is created), one inside `moveTo()`, and three inside `runWatering()` (where its value is read).
2. Only one place **fills it in**: the line inside `moveTo()`. Compare that line with the line at the top of the sketch. Look at the start of the line.
3. **(Isolate, optional)** Want more proof? Temporarily add one line right below the suspect line, inside `moveTo()`:

   ```cpp
   logInfo("moveTo: stateStartTime = %lu", stateStartTime);
   ```

   Upload, type `log debug` again (every upload sets the log level back to INFO), then dry out the soil. The new line from `moveTo()` prints a number in the tens of thousands, and here that number is **correct**: it's the clock time when the new state started, that is, how long the board had been on at that moment. A moment later, `runWatering()` still prints `WATERING: … ms so far` with an almost equally big number, even though it should be close to 0. That means `runWatering()` is still reading **0**. Two different numbers for the same name mean that there are **two different variables** that happen to have the same name. Delete the temporary line again.

#### 7.6 Step 6 — Change one thing, then prove it

The cause is in this line, inside `moveTo()`:

```cpp
  unsigned long stateStartTime = millis();  // note when the new state started
```

Because it starts with `unsigned long`, this line **creates a new variable** named `stateStartTime` that only lives inside `moveTo()`, and then disappears as soon as that function ends at its closing curly brace. The variable that belongs to the whole sketch, which has the same name and is read by `runWatering()`, is never touched and stays 0. A new variable like this, which "covers up" another variable with the same name, is called a **shadow variable** (*shadowing*). It's one of the most classic bugs in C++, because the code looks right and compiles without an error.

The fix is just **one change**: delete `unsigned long ` at the start of that line, so that it becomes:

```cpp
  stateStartTime = millis();  // note when the new state started
```

Upload again, type `log debug`, then repeat step 1 (this time there's no need to wait 30 seconds). Now the pump runs for 3 seconds, and the DEBUG log counts from zero:

```text
Log level now: DEBUG
[00:00:06] DEBUG STANDBY: soil 0 % (threshold 30 %)
[00:00:06] INFO  Dry soil (0 %): start watering.
[00:00:06] DEBUG Water level: 52 %
[00:00:06] INFO  Pump on.
[00:00:06] INFO  Watering: STANDBY -> WATERING
[00:00:06] DEBUG WATERING: 0 ms so far
[00:00:07] DEBUG WATERING: 1000 ms so far
[00:00:08] DEBUG WATERING: 2000 ms so far
[00:00:09] DEBUG WATERING: 3000 ms so far
[00:00:09] INFO  Pump off.
[00:00:09] INFO  Watering: WATERING -> COOLDOWN
```

Leave the sensor in the air a little longer: 30 seconds after the pump turns off, Node 1 goes back to STANDBY and waters again. After that, stick the sensor back in. The bug is proven to be gone. Complete your notes:

```markdown
- Cause: in moveTo(), "unsigned long stateStartTime = millis();" creates a new (shadow) variable,
  so the whole sketch's stateStartTime variable stays 0.
- Fix: delete "unsigned long " in that line.
- Lesson: don't write the data type again when you fill in a variable that already exists.
```

#### 7.7 Bonus: the compiler was whispering from the start

1. In Arduino IDE, open **File → Preferences…** (macOS: **Arduino IDE → Settings…**). Change **Compiler warnings** from **None** to **More**, then click **OK**.

   ![Illustration of the Preferences window in Arduino IDE 2, Settings tab. The other rows are faded; the highlighted row is Compiler warnings, whose drop-down box shows More (marker 2) with the note default: None, and its list of options is open below it: None, Default, More (highlighted), and All. Marker 1 is on the title of the Preferences window, marker 3 on the OK button next to the CANCEL button. On the right, the Output panel after Verify holds a warning in white on black: module08_bug_hunt.ino: In function void moveTo(WateringState):, then module08_bug_hunt.ino:114:17: warning: unused variable stateStartTime [-Wunused-variable], with the last three lines marked by marker 4. Legend at the bottom: 1, File, Preferences… (macOS: Arduino IDE, Settings…); 2, Compiler warnings: change None to More; 3, click OK, then click Verify; 4, look for the warning that names your sketch file. Note: an illustration, not a screenshot](assets/arduino-compiler-warnings.png)

2. Press **Ctrl + Z** in the main tab until `unsigned long ` appears again in that line, so that the bug is back. Click **Verify**.
3. Scroll through the **Output** panel at the bottom. Among its messages is this warning:

   ```text
   warning: unused variable 'stateStartTime' [-Wunused-variable]
   ```

   It means "the variable `stateStartTime` (the new one) is never used". The compiler pointed at this bug from the start, but its warning was hidden by the default option, **None**. Warnings from libraries or the esp32 package that you didn't write may show up too; look for the one that names your sketch file.
4. Fix the line again (delete `unsigned long `), then click **Verify** until that warning is gone. Leave **Compiler warnings** at **More** from now on. One more thing you should know: for numbers whose range it knows, the compiler calculates the **longest possible** text, not the one that usually appears. If it ever warns `may be truncated` in your sketch, make the `char[]` drawers bigger (Concept 6). On the other hand, no warning doesn't necessarily mean the drawers are big enough: for numbers whose range it doesn't know, the compiler says nothing.

> ➡️ **Done with Practice 7?** Continue to [Practice 8](#practice-8--save-to-github-15-minutes).

### Practice 8 — Save to GitHub (15 minutes)

> 🖥️ **Tools used:** **Arduino IDE**, **VS Code** (from Module 4), and **GitHub Desktop** (from Module 3). Concepts used: no new concepts.

1. **Save the sketches to the repository.** Have you been saving straight into the `module-08` folder from the start (the **Tip** box at the beginning of the Practice section)? Skip this step. If not, open the sketches one by one, then choose **File → Save As…** and save them to **Documents → GitHub → learn-iot → module-08**. The ones that must be there: `module08_three_tasks`, `module08_nvs_threshold`, and `module08_watchdog`.
2. **Check the sketches that are made of several files.** In VS Code, open the `learn-iot` folder (**File → Open Folder…**), then open the `module-08/module08_modular` folder. It must hold five files: `module08_modular.ino`, `heartbeat.h`, `heartbeat.cpp`, `button.h`, and `button.cpp`. The `module08_bug_hunt` folder holds three files. Arduino IDE saves every tab as a separate file in its sketch folder.
3. **Complete `debugging-notes.md`** from Practice 7, then save with **Ctrl + S**.
4. In GitHub Desktop, make sure the **Current repository** box says **learn-iot**. The **Changes** tab lists the new files in `module-08`. macOS users: untick `.DS_Store` if it shows up.
5. Fill in **Summary** with `Module 8: millis, state machine, modular code, NVS, watchdog, logging`, click **Commit … to main**, then **Push origin**.
6. Click **Repository → View on GitHub** and open the `module-08` folder: all your sketches and notes are there.

No GitHub Desktop? Use the alternative route in the final note of [Module 4 Practice 10](../../phase-0-foundations/module-04-javascript-nodejs/README.md#practice-10--save-to-github-the-phase-0-checkpoint-15-minutes).

> ➡️ **After Practice 8:** do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home) — that's where Node 1 moves up to v1.0 and takes the 24-hour test — then finish with the [📝 Quiz](#-5-question-quiz) and the [✅ Completion checklist](#-module-8-completion-checklist). Open the 🚨 and 🔬 sections in between only when you need them.

---

## 🚨 Troubleshooting

This week, your first source of evidence is the **Serial Monitor**: almost every sketch reports what's going on, and Node 1 v1.0 even has leveled logging. If the Serial Monitor is silent, look at the status LED: a slow blink means `loop()` is still running, a fast blink means a sensor has a problem, and no blinking at all means the program is stuck (or hasn't started yet). Click a problem's title to open its explanation.

> [!IMPORTANT]
> Every time you check or move a wire: **turn off the MB102, then unplug the USB**. When you're done, plug in the USB first, then turn on the MB102.

<details>
<summary><b><code>Compilation error</code> — this week's error messages</b></summary>

Each message starts with a file name and a line number, for example `module08_modular.ino:97:5:` (line 97, character 5). Open that file's tab and find that line. If there are many errors, read the **first error message** first: the errors after it are often just consequences of the first one.

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `'WateringState' was not declared in this scope` and `variable or field 'moveTo' declared void` | The `enum` is written below the sketch's first function. | Move the `enum` and its variable to the top of the sketch, before any function (Concept 4). |
| `'beginHeartbeat' was not declared in this scope` | The main tab doesn't have `#include "heartbeat.h"`, the function name is misspelled, the `heartbeat.h` tab is still empty, or (in a `.cpp` file) the function is only written below the line that uses it. | Add the `#include`; make the function name match the one in the `.h` file (Practice 4.5); fill in the empty `.h` tab; in a `.cpp` file, move the function above the line that uses it (Concept 5). |
| `fatal error: heartbeat.h: No such file or directory` | The tab's name isn't exactly the same as the name in the `#include`, for example because of a typo (`hearbeat.h`) or because it's `heartbeat.ino` (the `.h` ending was forgotten, so Arduino IDE added `.ino`). In Wokwi, upper and lower case must match too (`Heartbeat.h` is different from `heartbeat.h`). | Open that tab, click **⋯ → Rename**, then fix its name. In Wokwi, also check whether the file is still empty (see the Wokwi problem below). |
| ``undefined reference to `updateHeartbeat()'`` and `ld returned 1 exit status` | The `.h` file promises that function, but no `.cpp` file makes it: its name is different, the `.cpp` tab hasn't been created yet, or (in Wokwi) the `.cpp` tab is still empty. | Make the function name the same in the `.h` and the `.cpp`, then make sure the `heartbeat.cpp` tab really exists (Practice 4.5). |
| `multiple definition of …`, for example ``multiple definition of `updateHeartbeat()'`` | A function or variable with the same name exists in two files. For example, the Practice 3 versions of `updateHeartbeat()` and `checkButton()` are still left in the main tab because step 4.3 of Practice 4 didn't replace **all** of its contents. Other causes: variables with the same name in two `.cpp` files without `static`, or an ordinary variable (not a `const`) in a `.h` file that several files `#include`. | Replace all of the main tab's contents (Practice 4.3). For variables, move them into one `.cpp` file and give them `static` (Concept 5). In Wokwi, the function name shows up encoded, for example `_Z15updateHeartbeatv`. |
| `'SensorReading' was not declared in this scope` or `'SensorReading' does not name a type`, together with dozens of other errors | A `.h` tab is still empty (here `sensors.h`), or its contents were swapped with its `.cpp` partner. | Check the first line of every tab (➕ B), then paste the wrong tab again. |
| `redefinition of 'const unsigned char ICON_SUN []'` | Icons or reference helper functions were copied into `display.cpp` as well, so now there are two of them, or one tab's contents were pasted twice. | Delete the duplicate copy (➕ C), then check the first and last lines of every tab (➕ B). |
| `'millis' was not declared in this scope` (or `'digitalWrite' …`) in a `.cpp` file | The `.cpp` file forgot `#include <Arduino.h>`. | Add that line at the top of the `.cpp` file. |
| `invalid conversion from 'int' to 'const esp_task_wdt_config_t*'` and `too many arguments to function 'esp_err_t esp_task_wdt_init(…)'` | Watchdog code written the esp32 package version 2 way. | Use the version 3 way from Concept 8 (Practice 6.4). |
| `'esp_task_wdt_config_t' was not declared in this scope` | `#include <esp_task_wdt.h>` was forgotten, or your esp32 package is still version 2.x. | Add the `#include`. Check the package version in **Tools → Board → Boards Manager** (search for **esp32**); it must be 3.3.x. |
| `fatal error: DHT.h: No such file or directory` | The DHT library isn't installed. In Wokwi: the `libraries.txt` tab doesn't have the list of libraries in it yet. | Install **DHT sensor library** 1.4.7 (Module 6). In Wokwi, copy `libraries.txt` from the practice's folder. |

</details>

<details>
<summary><b>Commands in the Serial Monitor get no answer</b></summary>

1. **The line ending must be New Line.** From Practice 5 on, the sketches only carry out your command after the end-of-line mark (`'\n'`) arrives. If the menu to the right of the input box says **No Line Ending** or **Carriage Return**, that mark is never sent, so your commands pile up without ever being carried out. Choose **New Line**, then type the command again. The first command after you change the option may get the answer `Unknown command`, because it's still mixed with what you typed before; type it once more.
2. **The baud rate must be 115200.** If random characters appear, change the menu in the right corner of the Serial Monitor to **115200 baud**.
3. **The program is stuck.** If the status LED has also stopped blinking, the program is trapped. In Practice 6, that's on purpose (`hang`). In other sketches, see the problems "The board keeps restarting" and "The status LED stays still" below.
4. **In Node 1 v1.0, the log level doesn't affect the answers to commands.** Answers to commands such as `status` and `info` are always printed, even at log level ERROR. Only the log lines are hidden.

</details>

<details>
<summary><b>A long press is read as a short press (or the other way around)</b></summary>

- **In Wokwi**, the simulator often runs slower than a real clock. Look at its speed percentage at the top right of the simulation panel, for example `49%`. At a speed of 50%, a button you hold for 1.6 seconds only "feels" like 0.8 seconds to the ESP32 in the simulator, so it's read as a short press. Hold the button longer, 2–3 seconds.
- **On a real board**, a long press is counted from the moment the button **starts being pressed**. Keep holding it until the sign of a long press appears, then let go: the fan relay "clicks" (Practice 2), the message `Button held…` is printed (Practices 3–4), or the status page appears on the display (Node 1 v1.0).
- **One press read twice?** Your button bounces for longer than 30 ms. Raise `DEBOUNCE_DELAY` to `50` (in Node 1 v1.0, this number is in the `button.cpp` tab).

</details>

<details>
<summary><b>The status LED blinks fast</b></summary>

That's Node 1's sign that a sensor can't be read. Look at the Serial Monitor: Node 1 v1.0 prints one `ERROR` line that names the sensor, once, when that sensor starts failing.

- `DHT22 can't be read.` — check the DHT22's yellow wire at **8f** on the upper breadboard, as well as its orange wire (3.3 V) and its black wire (GND) (Module 6, Practice 4).
- `HC-SR04: the echo didn't come back…` — check the TRIG wire (D15), ECHO through the voltage divider (D35), and its 5 V power from the top rail. The echo can also get lost if the sensor doesn't face the water surface squarely.

As soon as the sensor recovers, `DHT22 can be read again.` or `HC-SR04 can be read again.` is printed, and the LED goes back to a slow blink once all the sensors can be read again. In Practices 3 and 4, a fast blink means something else: the pump was refused because the tank is low on water. Fill the tank.

</details>

<details>
<summary><b>The Serial Monitor is empty, even though the status LED is beating</b></summary>

A beating LED means `loop()` is running fine; only the path to the Serial Monitor has a problem.

1. **The lines from `setup()` were missed.** The Serial Monitor only connects after the board has started. Press **EN** so that the program starts again from the beginning.
2. **The Serial Monitor isn't open yet, or the port is wrong.** Choose your board's port in the top bar of Arduino IDE, then open the Serial Monitor again.
3. **The baud rate isn't 115200.** Change the menu in the right corner of the Serial Monitor to **115200 baud**.
4. **In Node 1 v1.0, the log level is still ERROR.** The reading report every 2 seconds is an INFO log. Type `log info`.
5. **In Wokwi**, the Serial Monitor is below the simulation panel. If the panel is too small, drag its top edge up.

</details>

<details>
<summary><b>The pump keeps turning on, even though the soil is wet (or <code>soil</code> is always 0% or 100%)</b></summary>

It's almost certain that the calibration numbers `SOIL_DRY` and `SOIL_WET` haven't been replaced with yours yet. The sketches in this module use example numbers. Copy your numbers from Node 1 v0.4.0 (Practice 3.2 step 2, Practice 7.1 step 4, and section ➕ C). If even your own numbers are doubtful, repeat the calibration in Module 6. In Wokwi, leave the default numbers.

</details>

<details>
<summary><b>The status LED stays still (stuck on or stuck off) and the Serial Monitor is silent</b></summary>

`loop()` isn't running anymore.

- **With the watchdog active**, the board should restart within 5 seconds. If it doesn't, check whether `esp_task_wdt_add(NULL)` is really called at the end of `setup()`, and `esp_task_wdt_reset()` at the start of `loop()`. Don't put `esp_task_wdt_reset()` inside a loop that can get stuck; a guard that keeps being fed from inside a stuck loop will never bark.
- **Not at `loop()` yet?** If even the opening lines from `setup()` don't appear, press **EN**. If they still don't appear, check the USB cable, the port, and the baud rate.
- **After uploading a sketch without a watchdog** (for example `USE_WATCHDOG = false` in Practice 6), a stuck program really does stay silent forever. Press **EN**.

</details>

<details>
<summary><b>The board keeps restarting (<i>bootloop</i>)</b></summary>

Read the restart reason in the opening line (`Last restart reason: …`) or on Node 1 v1.0's status page on the display:

- **`WDT` or `TASK_WDT`.** Something holds `loop()` for more than 5 seconds, for example a long `delay()` left over from old code, a `while` that waits for something that never comes, or an `idle_core_mask` that was changed to `0b11` (Concept 8). Search for `delay(` in all the tabs; in VS Code, **Ctrl + Shift + F** searches the whole folder. For the time being, you can make `WATCHDOG_TIMEOUT` bigger so that you have time to read the log.
- **`BROWNOUT`.** The voltage briefly dropped, often right when the pump or a relay turns on. Make sure the loads get their power from the MB102, not from the ESP32's pins, and that all the GNDs are connected (the Module 5 golden power rules). Module 9 covers a stronger power supply.
- **`PANIC`.** The program crashed, for example because it accessed an array outside its bounds. Read the lines before `Rebooting...` in the Serial Monitor; 🔬 explains how to translate the `Backtrace`.

</details>

<details>
<summary><b>The threshold goes back to 30% after the board starts again</b></summary>

1. **In Wokwi, you pressed ■ and then ▶.** That starts a new, empty chip. Use the `restart` command (Concept 7).
2. **The menu Tools → Erase All Flash Before Sketch Upload is set to Enabled.** Every upload erases the whole flash, including NVS. Set it back to **Disabled**.
3. **The folder or label name is different.** `archive.begin("node1", …)` and the label `"soil_watering"` must be written exactly the same everywhere. A name longer than 15 characters makes saving fail without any message.
4. **`archive.begin()` hasn't been called**, or it was called with `true` (read only) as its second argument.
5. **You typed `threshold default`.** That command really does delete the threshold from NVS.

</details>

<details>
<summary><b>The 24-hour test failed: the uptime went back to zero or the <code>Boot #</code> number went up</b></summary>

Look at the `Restart:` line on the display's status page (long press of the button):

- **`POWERON`** — the power to the ESP32 was cut for a moment: the laptop went to sleep or turned off, the USB cable is loose, or the charger was unplugged. Use a phone charger, or set the laptop so that it doesn't sleep (section ➕ F). Also remember: pressing **EN** after you've written down the starting numbers (for example for a regulated microSD module) raises the `Boot #` number too. Write down the starting number **after** pressing EN.
- **`BROWNOUT`** — the voltage dropped (see the bootloop problem above).
- **`WDT`** — something got stuck. Repeat the test with the laptop plugged in and the Serial Monitor open, so that you can read the last log before the restart.
- **`PANIC`** — the program crashed. Save the messages before `Rebooting...`.

**Wokwi note:** after the `restart` command, the uptime clock in Wokwi doesn't go back to zero, although on a real board it does. That's why the 24-hour test uses **two** pieces of evidence at once: the uptime and the `Boot #` number.

</details>

<details>
<summary><b>Wokwi: <code>fatal error: … .h: No such file or directory</code>, even though the tab exists</b></summary>

- **Files that are still empty aren't compiled.** Paste their contents first, then click **▶**.
- **The tab's name differs by one letter** from the one in the `#include`, including upper and lower case.
- **The new file's name box still had the previous file's name in it.** As a result, the name became a combination, for example `heartbeat.hheartbeat.cpp`. Delete the wrong tab (**▾ → Delete**), then create it again with the right name.

</details>

<details>
<summary><b>The Serial Monitor is flooded with messages and the program feels slow</b></summary>

- **The log level is still DEBUG.** Type `log info`.
- **A log line or a `Serial.print()` is printed on every pass of `loop()`.** At 115,200 baud, Serial can only send about 11,500 characters per second. If `loop()` prints more than that, `loop()` slows down too, because it waits for Serial. Print only when something changes (Concept 9), or limit it with the `millis()` pattern, for example once per second as in Practice 7.

</details>

<details>
<summary><b>The pump won't turn on at all</b></summary>

- **Look at the Serial Monitor.** `Pump REFUSED: water level …` means that the tank safety is working: fill the tank, or check the HC-SR04 if it says `unreadable`.
- **Watering is in COOLDOWN.** After watering (or after being refused), Node 1 rests for 30 seconds. Type `info` in Node 1 v1.0: its third line says `watering STANDBY`, `WATERING`, or `COOLDOWN`.
- **The soil isn't dry enough yet.** You may have changed the threshold in Practice 5. Type `threshold` to see it.
- **Is the `pump 3` command refused too?** That's the same safety. The manual command uses the latest tank reading (at most 2 seconds old), so if the sensor has just failed to be read, wait for the next report.

</details>

---

## 🔬 Technical Deep Dive (optional)

This section is for the curious. Nothing here has to be practiced, and the next modules don't depend on it.

<details>
<summary><b>Why <code>unsigned long</code> subtraction stays correct even after <code>millis()</code> has rolled over</b></summary>

An `unsigned long` number on the ESP32 has 32 bits. All its arithmetic "wraps around" at 4,294,967,296 (2³²), like a clock hand that comes back to 12 after passing 11. Imagine a giant wall clock with 4.29 billion marks. `lastTime` is the position of the hand when the task was last done, and `now` is the position of the hand at this moment. As long as the hand hasn't gone all the way around once (49.7 days), the **clockwise** distance from `lastTime` to `now` can always be calculated correctly, even if the hand has just passed the top of the clock (mark 0, where the 12 is on an ordinary clock). The subtraction `now - lastTime` calculates exactly that distance.

As a result, `INTERVAL` can be as long as you like, as long as it's less than 49.7 days. On the other hand, `lastTime + INTERVAL` can "pass the top of the clock" before `millis()` does, so the comparison `millis() >= targetTime` goes haywire, as in the example in Concept 3.

</details>

<details>
<summary><b><code>lastTime = now</code> or <code>lastTime += INTERVAL</code>?</b></summary>

You'll come across both of these forms often:

- **`lastTime = now;`** (used in this module). The next deadline is counted from the moment the task was **actually** done. If `loop()` is running 3 ms late, the next deadline is pushed back 3 ms too. Over time the schedule drifts a little, but the task is never done twice in a row. Good for LEDs, reports, and reading sensors.
- **`lastTime += INTERVAL;`** The schedule stays on its original "grid" even when there are small delays: 1,000, 2,000, 3,000, and so on. Good for clocks or for sampling that must keep an exact rhythm. The downside: if the program was held up for a long time, for example 5 seconds, the task is done five times in a row to "catch up".

</details>

<details>
<summary><b><i>Interrupts</i>: counting pulses without missing any</b></summary>

A `loop()` that runs tens of thousands of times per second is good enough for a button. However, some sensors send **very short, very frequent pulses**, for example a water flow sensor that pulses hundreds of times per second, or a wind speed sensor. Pulses that short can be missed while `loop()` is busy for 30 ms waiting for the HC-SR04's echo or drawing the display.

An ***interrupt*** makes the chip **pause** whatever it's doing to run one small function exactly when the pin changes, then carry on with its previous work:

```cpp
const int PIN_FLOW_SENSOR = 18;            // an example for another board; on Node 1, D18 is used by the microSD module
volatile unsigned long pulseCount = 0;     // volatile: its value can change "behind the scenes" because of the interrupt

void IRAM_ATTR countPulse() {              // IRAM_ATTR: kept in RAM so that it can run as fast as possible
  pulseCount++;                            // as short as possible: no Serial.print(), no delay()
}

void setup() {
  pinMode(PIN_FLOW_SENSOR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), countPulse, FALLING);  // FALLING = when HIGH changes to LOW
}
```

The golden rule: an interrupt function must be **as short as possible** (just count, or raise a "flag"), and the heavy work is done in `loop()`. Variables shared with `loop()` get **`volatile`** so that the compiler always reads them again from memory. For a button, an interrupt actually makes things harder: every bounce triggers an interrupt, so the `millis()` pattern from Practice 2 is still the best choice. Also remember the note in `PIN-MAP.md`: GPIO 36 and 39 aren't suitable for inputs that use interrupts.

</details>

<details>
<summary><b>FreeRTOS: <code>loop()</code> is just one "task" on one of two cores</b></summary>

In Module 1, we said that the ESP32 has a "mini operating system". Its name is **FreeRTOS**. Inside it, the program is divided into several **tasks** that are scheduled to take turns, and the ESP32 has **two cores** to run them.

You've already seen the proof in Practice 6's watchdog report: `loopTask (CPU 1)`. Your `setup()` and `loop()` run inside one task named `loopTask`, on **core 1**, with 8 KB of stack memory. Core 0 is used by system tasks, and from Module 10 on by the Wi-Fi task too. `delay()` in the esp32 package actually calls `vTaskDelay()`: your task "sleeps", and that core is free to do other tasks or to rest (the `IDLE1` task, which also showed up in the watchdog report for `sleep 7`).

If you come across the `enableLoopWDT()` function on the internet, it's a shortcut from the esp32 package: it registers `loopTask` with the guard, then feeds it automatically before every pass of `loop()`, with the guard's default settings. The result is similar to our three lines in Concept 8. We use the manual way because we can set the time limit ourselves and every step is clearly visible.

You can create tasks of your own:

```cpp
void blinkTask(void* args) {            // a task: a loop that never ends
  pinMode(4, OUTPUT);
  bool isOn = false;
  while (true) {
    isOn = !isOn;
    digitalWrite(4, isOn);
    vTaskDelay(pdMS_TO_TICKS(500));     // only this task sleeps; the other tasks keep running
  }
}

void setup() {
  // the function, name, stack size (bytes), argument, priority, handle, core
  xTaskCreatePinnedToCore(blinkTask, "blink", 2048, NULL, 1, NULL, 0);
}

void loop() {
  // loop() keeps running on core 1
}
```

Why doesn't Node 1 use them yet? There are three reasons: several tasks that use the same variables must protect each other, for example with a *mutex* (a lock that is held in turn) or a *queue* (a line of messages); every important task has to be watched by its own watchdog; and their bugs often only appear with one particular timing. Bugs like that are the hardest to reproduce, and Concept 10 starts with "reproduce". The `millis()` pattern and state machines inside one task are enough for Node 1, and much easier to check.

</details>

<details>
<summary><b><code>switch</code>: another way to write a state machine</b></summary>

In other people's code, state machines are more often written with `switch` than with `if`/`else if`:

```cpp
switch (state) {
  case STANDBY:
    // ...
    break;   // required: without break, the program "falls through" into the next case
  case WATERING:
    // ...
    break;
  case COOLDOWN:
    // ...
    break;
}
```

Both are equally correct. `switch` has one advantage: if one day you add a new state to the `enum` but forget to write its `case`, the compiler (with **Compiler warnings: More**) warns `enumeration value '…' not handled in switch`. The downside: forgetting to write `break` is a classic bug. This module uses `if`/`else if` because you've known it since Module 3.

</details>

<details>
<summary><b><i>Pointers</i> and <i>references</i>: what you need to read other people's code</b></summary>

You don't need to write them now, but the `*` and `&` signs show up often in library code and in examples on the internet:

- **`const char* name`** is a ***pointer***: not the text itself, but the **address** of its first letter in memory, like a house address written on a slip of paper. Any text between double quotes can be stored this way, including the answer of Node 1 v1.0's `resetReasonName()`.
- **`&watchdogConfig`** means "the address of the `watchdogConfig` form". `esp_task_wdt_reconfigure()` asks for its address so that it can read that form directly, without copying it.
- **`NULL`** is "an empty address". In `esp_task_wdt_add(NULL)`, it means "not some other task, but this task that is running now".
- **`int drawers[]`** in a function's arguments (for example `drawerAverage()` in `sensors.cpp`) is actually a pointer to the first drawer too. That's why that function can accept any row of drawers.
- **`SensorReading& b`** is a ***reference***: "another name" for the same form, without making a copy. `const SensorReading& b` means "may be read, may not be changed". Node 1 passes `SensorReading` as an ordinary copy because the form is small (24 bytes); for big forms, a reference saves more.

</details>

<details>
<summary><b>PlatformIO: the natural next step after modular code</b></summary>

**PlatformIO** is a tool for building firmware that you install as a VS Code extension. Many professional teams use it for three reasons: all the library and board package versions are recorded in one `platformio.ini` file (similar to `libraries.txt` in Wokwi), so the result can be repeated on any laptop; it can build many variants of a program from one code base; and it connects to automated testing.

Its folder layout is similar to Node 1 v1.0: the `.cpp` files go in the `src/` folder, the `.h` files in the `include/` folder, and `platformio.ini` at the root. The difference: PlatformIO recommends turning the `.ino` file into a `.cpp` file so that code completion and code checking work fully. So `node-1-home.ino` should become `src/main.cpp` with `#include <Arduino.h>` on its first line, and every function must be declared before it's used, because Arduino IDE's automatic "table of contents" doesn't exist in `.cpp` files.

This curriculum keeps using Arduino IDE so that the tool is the same for every reader. If you'd like to try PlatformIO, first check whether the ESP32 platform you install already uses version 3 of the esp32 package, because this curriculum's code is written the version 3 way.

</details>

<details>
<summary><b>Core Debug Level: the esp32 package's built-in logs</b></summary>

The esp32 package has a logging system of its own, similar to our logger module. Choose its level in **Tools → Core Debug Level**: **None**, **Error**, **Warn**, **Info**, **Debug**, or **Verbose**, then upload again. From the **Info** level on, the esp32 package tells you in the Serial Monitor what's going on in its own kitchen, for example when it sets up pins or Wi-Fi. Your code can use it too:

```cpp
log_e("Sensor failed: %d", code);  // Error
log_i("Pump on");                  // Info
log_d("Cycle #%lu", number);       // Debug
```

The output looks like `[  1234][E][filename.cpp:12] functionName(): message`. The difference from the logger module: the **Core Debug Level** is chosen **when the program is compiled**. Messages below the chosen level are removed from the program, so they can't be switched on again over Serial without uploading again. The logger module chooses its level **while the program is running** (`log debug`), and that's more practical for hunting bugs in a Node 1 that's already installed.

The watchdog message `E (23503) task_wdt: …` comes from an even deeper layer, **ESP-IDF**, the base framework made by Espressif that the esp32 package is built on. ERROR messages from ESP-IDF are still printed even when the **Core Debug Level** is **None**.

</details>

<details>
<summary><b>Translating a <code>Backtrace</code> into function names and line numbers</b></summary>

The row `Backtrace: 0x400d1876:0x3ffb2220 …` is a list of addresses inside the program, starting from where the program stopped, then going back through the functions that called it. These addresses can be translated into function names and line numbers with a tool called an *exception decoder*. Arduino IDE 2.3 doesn't have this tool built in yet, and the community plugin [ESP Exception Decoder](https://github.com/dankeboy36/esp-exception-decoder) is now aimed at VS Code. The idea is simple: every address is matched against the program's map (the `.elf` file) produced by compiling, using the `addr2line` command from the ESP32's compiler tools.

For Practice 6, we don't need it, because we know exactly where the program got stuck. But for a mysterious restart at three in the morning, the `Backtrace` is your best clue.

</details>

<details>
<summary><b>How Arduino IDE compiles a sketch made of many files</b></summary>

1. **All the `.ino` tabs are combined into one file.** The main tab (the one with the same name as the sketch folder) goes first, then the other `.ino` tabs in alphabetical order. After that, Arduino IDE adds `#include <Arduino.h>` and a "table of contents" of the functions (Concept 4).
2. **Every `.cpp` file is compiled on its own.** The `.cpp` files aren't combined, so each one only knows what it `#include`s. That's what the `.h` files are for.
3. **All the results are linked** by the linker (`ld`), together with the libraries and the esp32 package, into one program.

Why does Node 1 use `.h`/`.cpp` pairs instead of just extra `.ino` tabs? Extra `.ino` tabs are indeed more practical, because everything automatically knows everything else. But that's exactly their weakness: you can't see which part depends on which, name clashes are only discovered later, and the code can't be moved to PlatformIO or ESP-IDF without being reworked. `.h`/`.cpp` pairs force every module to state its own needs through `#include`.

</details>

<details>
<summary><b>Monitoring memory health: <code>getFreeHeap()</code> and friends</b></summary>

The esp32 package provides three numbers for monitoring the heap (Concept 6):

- **`ESP.getFreeHeap()`** — the total heap that's still free right now. Node 1 v1.0 shows it on the status page (`free … KB`) and in the `info` command.
- **`ESP.getMinFreeHeap()`** — the least free heap since the board powered up, that is, the "lowest point" ever reached.
- **`ESP.getMaxAllocHeap()`** — the biggest piece of heap that can still be borrowed in one request. If `getFreeHeap()` stays large but this number keeps shrinking, that's a sign of fragmentation.

During the 24-hour test, compare the free memory numbers at the start and at the end. A number that goes up and down a little is normal. A number that **keeps going down** hour after hour is a sign of a memory leak: something keeps borrowing without ever giving back.

</details>

---

## 🧩 Independent Challenges

Three levels, starting with the easiest. Do at least Level 1. You can try all of them in Wokwi without touching the workbench.

> 🖥️ **Tools:** **Arduino IDE** or Wokwi, with the practice sketch named at each level. Before you change anything, open that sketch, then **right away** choose **File → Save As…** and save it in the `module-08` folder under a new name, for example `module08_challenge1`. Your practice sketch stays intact.

**Level 1 — A small change: a second setting in NVS.** Use the `module08_nvs_threshold` sketch (Practice 5). Add a second setting, `cooldown`, the rest time after watering (in seconds). Hints:

- Its default value is 30 seconds, and the numbers that may be saved are 10–600 seconds.
- Add two commands: `cooldown` (shows it) and `cooldown 60` (saves it). Copy the pattern of the `threshold` and `threshold 35` commands, including the check "same number, no need to write it again".
- The label `"cooldown"` is 8 characters long, so it's safe (15 at most).
- It works if, after `cooldown 60` and then `restart`, the `cooldown` command shows `60` together with a note that the number comes from NVS.

**Level 2 — Combine.** Choose one.

- **2A. Beep-beep-beep without `delay()`.** Use the `module08_three_tasks` sketch (Practice 2). Change the long press so that the buzzer (D27) beeps **three times** (100 ms of sound, 100 ms of silence), besides turning the fan on or off. While it beeps, the status LED must keep beating, and the report must still appear exactly every 2 seconds. Hint: make a small state machine with two states, `QUIET` and `BEEPING`, plus a counter, `beepsLeft`. Add `const int PIN_BUZZER = 27;` at the top, set up the buzzer in `setup()` with `ledcAttach(PIN_BUZZER, 2000, 10);`, then sound it with `ledcWriteTone(PIN_BUZZER, 2000);` and silence it with `ledcWriteTone(PIN_BUZZER, 0);`, as in Module 5. It works if you hear three beeps and the `longest` number in the report stays small.
- **2B. A display without `String`.** Use the `module07_node1_display` sketch from Module 7 Practice 6 (or your own design). Change `showOnDisplay()` and its helper functions so that they don't use `String` at all: build every text with `char[]` and `snprintf()` (Concept 6), then change the arguments of `printRightAligned()` and `barRow()` to `const char*`. Get the length of a text with `strlen(text)`. It works if all four samples in Module 7 Practice 6 appear exactly as before. If it works, you may move the result into Node 1 v1.0's `display.cpp`. Remember the rule for `.cpp` files: helper functions must be written above the functions that use them (Concept 5).

**Level 3 — Your own design: a `TANK_EMPTY` state.** Use the `module08_watering_state_machine` sketch (Practice 3). Right now, if the tank is empty, Node 1 tries to water every 30 seconds, fails, then tries again, on and on. Design a fourth state, `TANK_EMPTY`. Starting hints:

- If the pump is refused **three times in a row**, move to `TANK_EMPTY`, print `Tank empty: watering stopped until the tank is refilled.` **only once**, and let the status LED blink fast.
- While in `TANK_EMPTY`, check the tank every 5 seconds. Go back to STANDBY only when it's **30%** full or more. Why 30%, not 20%? Without a gap between the "empty" limit and the "enough" limit (called hysteresis), water sloshing around 20% makes Node 1 switch states back and forth.
- **Draw the state machine on paper first**: four circles and all their arrows, with their triggers. Only after that, write the code.
- In Wokwi, change the HC-SR04's distance to imitate an empty tank (`19` cm) and a refilled one (`10` cm).

There's no answer key for Level 3. If your Node 1 stops trying when the tank is empty, gives a clear sign, and carries on by itself once the tank has been refilled, your design is right.

---

## ➕ Add-on to "Mini Smart Home"

Module 8's contribution to the running project: **Node 1 v1.0**. This is the biggest change since Module 3. Almost every part was rewritten so that it never waits, and then the program was split into **one main file, one configuration file, and eleven modules** (each one a pair of `.h` and `.cpp` files), 24 files in all. That sounds like a lot, but don't worry: you already know every part of it from Practices 1–7. Here we put them together.

> 🖥️ **Tools used:** **Arduino IDE** (with the libraries from Modules 5–7), **VS Code**, **GitHub Desktop**, and the complete workbench with the MB102 on. No board? You can test every step in Wokwi with the Module 7 Node 1 [`diagram.json`](code/node-1-home/diagram.json) and [`libraries.txt`](code/node-1-home/libraries.txt). Create its 23 extra files through **▾ → New file...** as in Practice 4, then click an empty spot in the simulation panel and press **F** to see the whole circuit. Have a Wokwi account? Click **SAVE** after you create the first file, and again every now and then: a project that hasn't been saved is lost if its browser tab is closed (Module 1).
>
> ⭐ **Required** — part of the completion requirements: Node 1 v1.0 has no `delay()` in `loop()`, its threshold stays saved after a power cut, and it passes the 24-hour test (30 minutes in Wokwi).

![Node 1 version 1.0 file map: one main file, eleven modules. At the top, config.h with pins, calibration, rules, and schedule, connected by a dashed line to the main file node-1-home.ino in the middle, which holds setup(), loop(), and the main cycle IDLE, READING, DISPLAYING, ACTING. Around it, four groups of modules, each one a pair of .h and .cpp files labeled with where it came from: Senses and hands, namely sensors (five sensors without delay(), M6) and actuators (relays, pump, servo, buzzer, M5); Interface, namely button (short and long press, P4), heartbeat (status LED, P4), display (readings page and status page, M7), and commands (Serial commands, M5); Brain and records, namely rules (watering with a state machine, and the lamp, P3) and card (optional microSD CSV, M7); and Endurance, namely settings (NVS: threshold and boot count, P5), system (uptime and restart reason, M5), and logger (DEBUG, INFO, ERROR logs, P7). Legend: a dashed line means #include, and config.h is also #included by seven modules; P means made in this week's practices, M means it comes from an earlier module and is now rewritten without waiting; all the modules are in one sketch folder, firmware/node-1-home](assets/node1-v1-file-map.png)

| File | What's in it | Where it comes from |
| :--- | :--- | :--- |
| `node-1-home.ino` | `setup()`, `loop()`, and the main cycle IDLE → READING → DISPLAYING → ACTING | rewritten (section D) |
| `config.h` | all the pin numbers, your calibration numbers, the automation rules, and the main schedule | the v0.4.0 constants |
| `logger.h` / `.cpp` | DEBUG, INFO, and ERROR logs | exactly the same as Practice 7 |
| `system.h` / `.cpp` | uptime, restart reason, how long a `loop()` pass takes | `resetReasonName()` from v0.4.0 + Concept 3 |
| `settings.h` / `.cpp` | NVS: the `soil_watering` threshold and the boot counter | Practice 5 |
| `sensors.h` / `.cpp` | the five sensors and the `SensorReading` form | v0.4.0, now without `delay()` |
| `actuators.h` / `.cpp` | the lamp and fan relays, the pump, the curtain servo, the buzzer | v0.4.0, the pump and the buzzer now without `delay()` |
| `heartbeat.h` / `.cpp` | the status LED as a heartbeat | exactly the same as Practice 4 |
| `button.h` / `.cpp` | the button: short press and long press | exactly the same as Practice 4 |
| `display.h` / `.cpp` | the OLED display: the readings page and the new status page | Module 7 + status page |
| `card.h` / `.cpp` | (optional) CSV log on the microSD card | Module 7, now with `snprintf()` |
| `commands.h` / `.cpp` | commands through the Serial Monitor | v0.4.0 + Practice 5's line reader + new commands |
| `rules.h` / `.cpp` | automatic watering (state machine) and automatic lamp | Practice 3 + v0.4.0 |

`config.h` has no `.cpp` partner because it only holds constants. Constants may be written in a `.h` file that many files `#include`; ordinary variables may not (see `multiple definition` in 🚨). `PIN-MAP.md` doesn't change this week because there are no new pins.

### A. Write down your numbers first

1. In Arduino IDE, open your Node 1: **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home** → `node-1-home.ino`.
2. Copy onto paper the four numbers in the `// ---------- Module 6: your calibration results` section: `SOIL_DRY`, `SOIL_WET`, `DISTANCE_EMPTY`, and `DISTANCE_FULL`. Also write down `DARK_THRESHOLD` in the `// ---------- Module 6: automation rules, local version` section if you changed it back then (Module 6, Practice 1.4). Did you change `SOIL_WATERING_THRESHOLD` too? Write down its number; later you save it to NVS with the `threshold` command (step E).
3. **Copy your display layout.** You almost certainly have one, because Module 7 (Practice 6.3) asked you to change at least two things in the reference design. In the `node-1-home.ino` tab, press **Ctrl + F**, search for `// 8 x 8 pixel icons`, then copy into Notepad or VS Code:
   - only the icons and helper functions **you made yourself**, for example `ICON_DROP`, that is, the ones whose names are **not** in this list: `ICON_SUN`, `ICON_PLANT`, `ICON_TANK`, `ICON_PERSON`, `setupDisplay()`, `printRightAligned()`, `drawBar()`, and `barRow()` (they're all in `display.cpp` already);
   - the body of the `showOnDisplay()` function, from the first line after the `if (!displayFound)` check to `display.display();`. Usually that first line is `display.clearDisplay();`, but an extra line of yours above it, for example `display.dim(…)` from Module 7's 🧩, is copied too;
   - your version of an icon or helper function from the list above, **if you ever changed its contents** (for example an `ICON_PERSON` that you redrew in Module 7). In step C, replace the same item in `display.cpp` with your version; don't paste it in as a second copy.

Node 1 v0.4.0 isn't lost: after step G, that version stays saved in GitHub Desktop's **History** tab.

### B. Create 23 new files

With `node-1-home.ino` open in Arduino IDE, create a new tab for every file in the list below, exactly as in Practice 4: **⋯ → New Tab** (or **Ctrl + Shift + N**), type its name **with its ending**, then click **OK**. Fill each tab this way: right-click the file's name in the list → **Open link in new tab**, click **Copy raw file** on the page that opens, go back to Arduino IDE, then paste (**Ctrl + V**) into the tab you just created.

1. [`config.h`](code/node-1-home/config.h)
2. [`logger.h`](code/node-1-home/logger.h) and [`logger.cpp`](code/node-1-home/logger.cpp) — exactly the same as Practice 7; you may copy them from the tabs of the `module08_bug_hunt` sketch.
3. [`system.h`](code/node-1-home/system.h) and [`system.cpp`](code/node-1-home/system.cpp)
4. [`settings.h`](code/node-1-home/settings.h) and [`settings.cpp`](code/node-1-home/settings.cpp)
5. [`sensors.h`](code/node-1-home/sensors.h) and [`sensors.cpp`](code/node-1-home/sensors.cpp)
6. [`actuators.h`](code/node-1-home/actuators.h) and [`actuators.cpp`](code/node-1-home/actuators.cpp)
7. [`heartbeat.h`](code/node-1-home/heartbeat.h) and [`heartbeat.cpp`](code/node-1-home/heartbeat.cpp) — exactly the same as Practice 4.
8. [`button.h`](code/node-1-home/button.h) and [`button.cpp`](code/node-1-home/button.cpp) — exactly the same as Practice 4.
9. [`display.h`](code/node-1-home/display.h) and [`display.cpp`](code/node-1-home/display.cpp)
10. [`card.h`](code/node-1-home/card.h) and [`card.cpp`](code/node-1-home/card.cpp)
11. [`commands.h`](code/node-1-home/commands.h) and [`commands.cpp`](code/node-1-home/commands.cpp)
12. [`rules.h`](code/node-1-home/rules.h) and [`rules.cpp`](code/node-1-home/rules.cpp)

**Don't click Verify yet**, not until step D is done: the main tab still holds the v0.4.0 code, which clashes with the new modules. You can ignore the wavy red lines that appear in the editor during steps B–C. If there are too many tabs for one row, Arduino IDE shows them in a row that you can scroll; tabs that you can't see can also be selected through **⋯ → Next Tab**.

**Check all 24 tabs before you go on** (two minutes, but it saves a lot of time):

1. Count the tabs: there must be **24**, that is, `node-1-home.ino` plus the 23 files in the list. In Wokwi, the `diagram.json` tab and the library tab don't count.
2. Click every tab and look at its **first line**. Every reference file starts with a comment that names the file itself, for example `// sensors.cpp - the code of the sensors module…`. If the `sensors.cpp` tab starts with `// sensors.h - …`, its contents got swapped: empty that tab (**Ctrl + A**, then **Delete**), then paste again from the right link.
3. Scroll to the very bottom of every `.cpp` tab: the last line with text on it is always `}` (empty lines after it are fine). If the file's first line shows up again in the middle, its contents were pasted twice.

**Want to start over?** Version v0.4.0 is still safe on GitHub. Close Arduino IDE first, open GitHub Desktop, choose **`mini-smart-home`** in the **Current repository** box, then choose the menu **Branch → Discard all changes…** (macOS: **Discard All Changes…**) and click **Discard all changes** in the `Confirm discard all changes` window. All the changes and new files are moved to the **Recycle Bin** (macOS: **Trash**), and your sketch folder goes back to v0.4.0.

### C. Put in your calibration numbers and your display layout

1. In the **`config.h`** tab, replace the four numbers in the `// ---------- Module 6: your calibration results` section and, if needed, `DARK_THRESHOLD` with your notes from step A. In Wokwi, leave the default numbers.
2. **Your display layout.** In the **`display.cpp`** tab, search for `drawReadingsPage()` (**Ctrl + F**). Paste your own icons and helper functions right **above** the line `// Module 7 reference design. …`, because in a `.cpp` file a function must already be written before it's used (Concept 5). Then, inside `drawReadingsPage()`, replace all the lines from `display.clearDisplay();` to `display.display();` with the body of your `showOnDisplay()`. Your readings page may keep using `String` (Concept 6). If your layout also shows the state of the lamp or the fan, add `#include "actuators.h"` at the top of `display.cpp`, then change `lampOn` to `lampOn()` and `fanOn` to `fanOn()`. If you use the reference design as it is, skip this step.

You don't need to set the watering threshold here. The number in `config.h` (`DEFAULT_SOIL_WATERING_THRESHOLD = 30`) is only used as long as NVS holds no threshold. Because Node 1 v1.0 uses the same NVS folder as Practice 5 (`node1`), the threshold you saved in Practice 5 is read right away.

### D. Replace the main tab's contents

Click the **`node-1-home.ino`** tab (the leftmost one; in Wokwi: **`sketch.ino`**), then replace **all** of its contents with this:

```cpp
// Node 1 "Home" - firmware v1.0.0 (Module 8)
// The running project: Mini Smart Home.
//
// New in v1.0.0: no delay() in loop() (the millis() pattern and state machines), the code is split
// into several files, a watchdog restarts a stuck program, the "soil_watering" threshold is saved
// in NVS, leveled logging (DEBUG/INFO/ERROR), and a status page on the OLED display (long button press).
// Commands from the Serial Monitor: lamp on, fan off, pump 3, curtain 90, beep, status, info,
// threshold, threshold 35, threshold default, log debug, log info, log error, restart.
//
// Libraries: ESP32Servo version 3.2.1, DHT sensor library version 1.4.7
// (installed with it: Adafruit Unified Sensor version 1.1.15), Adafruit SSD1306 version 2.5.17
// (installed with it: Adafruit GFX Library version 1.12.6 and Adafruit BusIO version 1.17.4).
// Wire, SPI, SD, and Preferences already come with the esp32 package.

#include <esp_task_wdt.h>  // watchdog
#include "config.h"
#include "logger.h"
#include "system.h"
#include "settings.h"
#include "sensors.h"
#include "actuators.h"
#include "heartbeat.h"
#include "button.h"
#include "display.h"
#include "card.h"
#include "commands.h"
#include "rules.h"

// ---------- Main cycle: IDLE -> READING -> DISPLAYING -> ACTING -> IDLE ... ----------
enum CycleStep { IDLE, READING, DISPLAYING, ACTING };
CycleStep step = IDLE;
unsigned long lastReadTime = 0;
unsigned long lastCardLogTime = 0;
SensorReading reading;
bool dhtFailedBefore = false;    // did the DHT22 fail on the previous reading?
bool sonarFailedBefore = false;  // did the HC-SR04 fail on the previous reading?

const char* stepName(CycleStep s) {
  if (s == IDLE) {
    return "IDLE";
  }
  if (s == READING) {
    return "READING";
  }
  if (s == DISPLAYING) {
    return "DISPLAYING";
  }
  return "ACTING";
}

void moveToStep(CycleStep newStep) {
  logDebug("Cycle: %s -> %s", stepName(step), stepName(newStep));
  step = newStep;
}

// One report line per reading: a failed number is written "--".
void reportReading(SensorReading b) {
  char temperature[8] = "--";
  if (!isnan(b.temperature)) {
    snprintf(temperature, sizeof(temperature), "%.1f", b.temperature);
  }
  char humidity[12] = "--";  // 12 drawers: room for the longest int number (11 characters) + the end mark
  if (b.humidity >= 0) {
    snprintf(humidity, sizeof(humidity), "%d", b.humidity);
  }
  char waterLevel[12] = "--";
  if (b.water_level >= 0) {
    snprintf(waterLevel, sizeof(waterLevel), "%d", b.water_level);
  }
  const char* motion = "no";
  if (b.motion) {
    motion = "yes";
  }
  logInfo("temperature=%s C  humidity=%s %%  light=%d  soil=%d %%  motion=%s  water_level=%s %%",
          temperature, humidity, b.light, b.soil, motion, waterLevel);
}

// Sensor failed? The status LED blinks fast. Its message is printed once, when the sensor's state changes, not every 2 seconds.
void checkProblems(SensorReading b) {
  setHeartbeatRhythm(sensorProblem(b));
  bool dhtFailed = isnan(b.temperature) || b.humidity < 0;
  bool sonarFailed = b.water_level < 0;
  if (dhtFailed && !dhtFailedBefore) {
    logError("DHT22 can't be read. Status LED blinks fast.");
  }
  if (!dhtFailed && dhtFailedBefore) {
    logInfo("DHT22 can be read again.");
  }
  if (sonarFailed && !sonarFailedBefore) {
    logError("HC-SR04: the echo didn't come back, water level unknown. Status LED blinks fast.");
  }
  if (!sonarFailed && sonarFailedBefore) {
    logInfo("HC-SR04 can be read again.");
  }
  dhtFailedBefore = dhtFailed;
  sonarFailedBefore = sonarFailed;
}

// ---------- Modules 10-11: send the reading to the server ----------
void sendData(SensorReading b) {
  // not filled in yet
}

// One cycle step per pass of loop(): no step waits for long.
void runCycle() {
  if (step == IDLE) {
    if (millis() - lastReadTime >= READ_INTERVAL) {
      lastReadTime = millis();
      moveToStep(READING);
    }
  } else if (step == READING) {
    reading = readSensors();
    checkProblems(reading);
    moveToStep(DISPLAYING);
  } else if (step == DISPLAYING) {
    reportReading(reading);
    showReading(reading);
    if (millis() - lastCardLogTime >= CARD_LOG_INTERVAL) {
      lastCardLogTime = millis();
      logToCard(reading);
    }
    moveToStep(ACTING);
  } else if (step == ACTING) {
    runRules(reading);
    sendData(reading);
    moveToStep(IDLE);
  }
}

void handleButton() {
  ButtonEvent event = checkButton();
  if (event == SHORT_PRESS) {
    setLamp(!lampOn());
    logInfo("Button: lamp %s", onOffText(lampOn()));
  } else if (event == LONG_PRESS) {
    openStatusPage();  // status page for 10 seconds (display.cpp); its message is printed there too
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);  // allowed: setup() runs only once, and the watchdog isn't watching yet
  Serial.println();
  logInfo("Node 1 Home - firmware %s", FIRMWARE_VERSION);
  logInfo("Last restart reason: %s", resetReasonName());

  setupActuators();  // first: the relays are switched off right away
  loadSettings();
  setupSensors();
  beginHeartbeat(PIN_STATUS_LED);
  beginButton(PIN_BUTTON);
  setupDisplay();  // Module 7
  setupCard();     // Module 7 (optional)

  // The watchdog, written the esp32 package version 3 way (Concept 8)
  esp_task_wdt_config_t watchdogConfig = {
    .timeout_ms = WATCHDOG_TIMEOUT,  // time limit: 5000 ms
    .idle_core_mask = 0b01,          // keep watching the "idle task" of core 0 (the esp32 package default)
    .trigger_panic = true,           // fed too late = panic, then restart
  };
  esp_task_wdt_reconfigure(&watchdogConfig);  // the esp32 package has already started the watchdog: just reconfigure it
  esp_task_wdt_add(NULL);                     // NULL = watch the task that is running now, that is, loop()
  logInfo("Watchdog active: automatic restart if loop() is stuck for more than %lu seconds.", WATCHDOG_TIMEOUT / 1000);
}

void loop() {
  unsigned long loopStart = micros();
  esp_task_wdt_reset();  // "feed" the guard: loop() is still running

  updateSensors();       // one analog sample every 2 ms
  updateActuators();     // the pump and buzzer turn off right on time
  updateRules();         // WATERING -> COOLDOWN -> STANDBY
  updateHeartbeat();     // status LED
  updateDisplay();       // status page: the clock ticks, then it goes back by itself
  handleButton();
  checkSerialCommand();
  runCycle();

  recordLoopTime(micros() - loopStart);
}
```

This main file is now short and easy to read from top to bottom:

- **`setup()`** prepares every module. The actuators are prepared **first** so that the relays switch off right away, while the watchdog is put in place **last**, after all the preparation is done (Concept 8).
- **`loop()`** feeds the watchdog, then calls eight functions. Each function only checks "is it time yet?", then returns right away. At the end, `recordLoopTime()` keeps track of the longest pass, which you can see with the `info` command.
- **`runCycle()`** is the main cycle state machine from Concept 4. Each pass of `loop()` does only one step, so the button and the Serial commands are still checked in between those steps.
- **`checkProblems()`** sets the status LED's rhythm, and prints `ERROR` or `INFO` only **when a sensor's state changes**: failing or recovering (Concept 9).
- **`sendData()`** is still empty, just as it has been since Module 3. This shelf gets filled in Modules 10–11.

What changed in the other modules, compared with v0.4.0:

- **`sensors.cpp`** — the average of 20 analog readings (Module 6) is now collected **a little at a time**: `updateSensors()` takes one new sample every 2 ms without waiting, and `readSensors()` only has to calculate their average. The result is the same as in Module 6, the average of the last 40 ms, but without `delay(2)`.
- **`actuators.cpp`** — `turnOnPump()` turns the pump on and returns right away, and `updateActuators()` turns it off right on time. The buzzer works the same way. The tank safety now uses the latest tank reading, which is at most 2 seconds old, so the HC-SR04 doesn't need to measure again and `delay(60)` isn't needed anymore.
- **`rules.cpp`** — automatic watering uses Practice 3's state machine (STANDBY → WATERING → COOLDOWN). The automatic lamp stays as in Module 6; the note "this lamp belongs to the automation rule" is now kept by the actuators module through `setLampByAutomation()`.
- **`commands.cpp`** — commands are read with Practice 5's line reader, which never waits. There are new commands: `info`, `threshold`, `threshold 35`, `threshold default`, `log debug`, `log info`, `log error`, and `restart`. The `status` answer now also gives the pump's state.
- **`display.cpp`** — your readings page stays the same, plus a **status page** that appears for 10 seconds every time the button is pressed long: the uptime in large digits, the restart reason, the `Boot #` number, the threshold, the version, and the free memory.
- **`card.cpp`** — the CSV line is now built with `snprintf()`, and it's logged every 30 seconds by the clock, not every 15 reports.
- **`system.cpp`** — `uptimeSeconds()` uses `esp_timer_get_time()` (Concept 3), and `resetReasonName()` now answers with a `const char*`, not a `String`.

### E. Verify, Upload, and test every feature

1. Click **Verify**. Because there are many files, the first compile takes longer than usual. If an error appears, scroll the **Output** panel up and read only the **first error message**. It starts with a file name and a line number. Open that tab, compare it with the [reference version](code/node-1-home/), fix it, then click **Verify** again. The errors after it are often just consequences of the first one. The error table in 🚨 helps you translate the messages.
2. Make sure the tank has water in it and the soil sensor is stuck in moist soil. Plug in the USB, turn on the MB102, then click **Upload**. Open the Serial Monitor (**115200 baud**, **New Line**).

   **Expected output** (without a microSD module; your readings will certainly be different):

   ```text
   [00:00:01] INFO  Node 1 Home - firmware 1.0.0
   [00:00:01] INFO  Last restart reason: POWERON
   [00:00:01] INFO  Boot #1. soil_watering threshold: 30 % (default value)
   [00:00:02] INFO  microSD card not detected: CSV logging is off.
   [00:00:02] INFO  Watchdog active: automatic restart if loop() is stuck for more than 5 seconds.
   [00:00:02] INFO  temperature=28.5 C  humidity=71 %  light=3094  soil=70 %  motion=no  water_level=52 %
   ```

   The `Boot #` number and the threshold may be different, because the NVS folder `node1` has been in use since Practice 5.
3. Test every new feature:

| Test | How | What must happen |
| :--- | :--- | :--- |
| Heartbeat | Look at the status LED. | It flashes briefly every second. |
| Short press | Press the button briefly. | The lamp relay "clicks"; log `Button: lamp on`. |
| Long press | Hold the button for 1 second (in Wokwi, 2–3 seconds). | The display shows the **status page** for 10 seconds, then goes back to the readings page by itself. |
| Watering without freezing | Lift the soil sensor into the air. While the pump is running, press the button briefly. | The pump runs for 3 seconds, and the lamp still responds to the button. Type `info`: it says `watering COOLDOWN`. After that, stick the sensor back in. |
| Threshold in NVS | Type `threshold 40` (a number you've never saved), unplug the USB (turn off the MB102 first), plug it back in, turn on the MB102, then type `threshold`. In Wokwi, replace the unplugging and plugging back in with the `restart` command. | `threshold: soil_watering = 40 % (from NVS)`, and the `boot #` number in the `info` answer goes up by one (and by one more for every press of **EN**). |
| Old commands | Type `status`, `lamp on`, `lamp off`, `pump 2`, `curtain 30`, `beep`. | They work as in v0.4.0, but Node 1 never freezes. |
| Health | Type `info`. | Three lines: the version, uptime, restart reason, boot number, free memory, longest `loop()` pass, watchdog, threshold, watering state, and log level. |
| Leveled logging | Type `log debug`, wait 4 seconds, then type `log info`. | `Cycle: IDLE -> READING` and similar lines appear, then disappear again. |

When you're done testing, set the threshold back so that the 40% test number doesn't stay in NVS: type `threshold default` (back to 30%), or type `threshold` followed by your own number from step A, for example `threshold 35`.

4. **Prove that there's no `delay()` in `loop()`.** In VS Code, open the `mini-smart-home` folder, press **Ctrl + Shift + F**, then search for `delay(`. The result is three lines: two comment lines that mention `delay()`, and the only `delay(500)` command, in the `setup()` of `node-1-home.ino`. That one is allowed, because `setup()` runs only once and the watchdog isn't watching yet. `sensors.cpp` does have `delayMicroseconds()`, but that's only the HC-SR04's trigger pulse, 12 **micro**seconds long. The `longest loop() pass` number in `info` shows the longest time that Node 1 was "deaf": only tens of milliseconds, not 3,000 ms as in v0.4.0.

![Screenshot of Node 1 version 1.0 in Wokwi, cropped and rearranged. Top left, a close-up of the OLED display after the D13 button was held for 1 second, 2 to 3 seconds in Wokwi; this status page is shown for 10 seconds: Uptime: 00:00:13, Restart: POWERON, Boot #1, Soil threshold: 30%, and v1.0.0 free 312KB. Top right, what each line means: the uptime, how long the board has been on since the last restart; the last restart reason, POWERON means just powered on; how many times the board has booted, counted in NVS; the current watering threshold, from NVS or the default value; the firmware version and the RAM that is still free. Bottom, the Serial Monitor: the end of a log line with the readings, water_level=52 %; the three lines of the answer to the info command (marker 1): firmware 1.0.0, uptime 00:00:09, last restart POWERON, boot #1; free memory 319856 bytes, longest loop() pass 45 ms, watchdog 5 seconds; soil_watering threshold 30 %, watering STANDBY, log level INFO; then the readings at [00:00:10], wrapped onto a second line after motion=no, and [00:00:11] INFO Long button press: status page shown for 10 seconds. (marker 2, the long press is logged as INFO, at the same time as the status page appears on the OLED)](assets/wokwi-node-1-v1.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

**All the tests passed?** Do step G now so that v1.0 is safe on GitHub, then start the 24-hour test. If you change the code during the test, commit again afterward.

### F. The 24-hour endurance test

This is Node 1's completion exam: **24 hours without a restart**. Many bugs only show up after hours, for example memory that leaks little by little, or a hang that only happens once in a while. A long test like this, often called a *soak test*, is how you catch them.

**Preparation:**

1. **Dip the soil sensor into a glass of water.** That's the safest option for the 24-hour test. If the sensor is stuck in soil that slowly dries out below the threshold, the pump will run about every 33 seconds until morning. **Point the pump's hose back into the tank** and tape its end down, then make sure the tank is more than 20% full. That way, even if the pump does run many times, the water just goes around in a circle.
2. **A power source for the ESP32 that doesn't sleep.** The easiest way is a branded **5 V phone charger** that gives at least 1 A (**not** a power bank). This charger only **takes the laptop's place**: plug it into the ESP32 board's USB port, not into the MB102 and not into the VIN pin; the other golden power rules still apply. If the board is currently connected to the laptop, turn off the MB102, unplug the USB from the laptop, plug the charger into the wall socket and its cable into the ESP32 board, and **only then** turn on the MB102. If you use a laptop, set it so that it doesn't sleep while it's plugged in (Windows: **Settings → System → Power & battery**; macOS: **System Settings → Battery** or **Energy**), and don't close its lid: on many laptops, closing the lid is the same as putting it to sleep. Don't forget to change the settings back after the test.
3. Place the workbench according to safety rule number 3 at the start of the module, with the charger and its wall socket outside the tray.

**Start:**

1. Power up Node 1 (the USB or the charger first, then the MB102). If you have a microSD module that gets its power from the MB102, press **EN** after the MB102 is on (Module 7), and **only then** go on to step 2.
2. Hold the button for 1 second to open the status page. Write down the **start time**, the **`Boot #`** number, and the **free memory** number, or take a photo of the display.

**During the 24 hours:** glance at the status LED now and then (a slow beat) and at the display (the readings change every 2 seconds). There's no need to open the Serial Monitor.

**After 24 hours:** open the status page again. Node 1 **passes** if:

- the uptime on the status page shows **24:00:00 or more**, and
- the **`Boot #` number is the same** as at the start.

If you test with a laptop and the Serial Monitor open, also type `info` at the start and after 24 hours, then compare the free memory and the longest pass. Free memory that goes up and down a little is normal; memory that keeps going down is a sign of a leak (🔬). If the test fails, open "The 24-hour test failed" in 🚨.

**In Wokwi**, **30 minutes of uptime** is enough: run the simulation, keep the Wokwi tab open and make sure the laptop doesn't sleep, then open the status page after the uptime reaches 00:30:00. The Node 1 simulation usually runs slower than a real clock (see the speed percentage at the top right of the simulation panel), so 30 minutes of uptime can take about an hour. In Wokwi, the `Boot #` check still applies.

**Expected output** in Wokwi: the answers to the `info` command at the start of the test and after about 70 minutes of real time. The simulator runs at roughly half the speed of a real board, so its uptime is only 37 minutes. The `…` lines mark the reading reports, every 2 seconds, that aren't quoted here.

```text
[00:00:01] INFO  Boot #1. soil_watering threshold: 30 % (default value)
…
info: firmware 1.0.0, uptime 00:00:21, last restart POWERON, boot #1
info: free memory 319856 bytes, longest loop() pass 45 ms, watchdog 5 seconds
info: soil_watering threshold 30 %, watering STANDBY, log level INFO
…
info: firmware 1.0.0, uptime 00:37:22, last restart POWERON, boot #1
info: free memory 319856 bytes, longest loop() pass 45 ms, watchdog 5 seconds
info: soil_watering threshold 30 %, watering STANDBY, log level INFO
```

The free memory stays at `319856` bytes from start to finish, and the boot number stays at `boot #1`. That means there's no memory leak and no hidden restart: Node 1 passes the Wokwi version of the test.

Write the result in `debugging-notes.md` (in the `module-08` folder of `learn-iot`), then commit and push the `learn-iot` repository as in Practice 8:

```markdown
## Node 1 v1.0 24-hour test

| | Start | End |
| --- | --- | --- |
| Date and time | | |
| Uptime | 00:00:… | |
| Restart | | |
| Boot # | | |
| Free memory (KB) | | |

Passed (uptime ≥ 24:00:00 and the same "Boot #")? yes / no
```

### G. Commit and push

1. In GitHub Desktop, choose **`mini-smart-home`** in the **Current repository** box — always check this box before you commit!
2. The **Changes** tab lists 24 files: `firmware/node-1-home/node-1-home.ino`, which changed, plus 23 new files in the same folder.
3. Fill in **Summary** with `Node 1 v1.0: no delay, modular, watchdog, NVS, logging (Module 8)`, click **Commit 24 files to main**, then **Push origin**.

> [!IMPORTANT]
> **Version 1.0 is a promise.** From now on, every change to Node 1 still follows three rules: **`loop()` never waits**, **one module takes care of one thing**, and **important settings are saved in NVS**. Modules 9–11 add a power supply of its own, Wi-Fi, and MQTT to Node 1 without breaking any of them.

---

## 📖 Glossary

| Term | Short meaning |
| :--- | :--- |
| **`delay()`** | A "full stop" command for a number of milliseconds. During that time, `loop()` doesn't check anything. |
| **`millis()`** | The ESP32's clock: the number of milliseconds since the board powered up. It goes back to 0 after about 49.7 days. |
| **The `millis()` pattern** | A way of waiting without falling asleep: `if (now - lastTime >= INTERVAL)`. If it isn't time yet, carry on right away. |
| **A pass of `loop()`** | One run of `loop()` from its first line to its last. Without `delay()`, it happens tens of thousands of times per second. |
| **`unsigned long`** | A 32-bit whole number that is never negative: `0` to `4294967295`. The place where times are stored. |
| **Rollover** (*overflow*) | What happens when a number passes its biggest value and goes back to 0, like an odometer. |
| **`micros()`** | The ESP32's clock in microseconds (millionths of a second). Used to measure how long one pass takes. It rolls over about every 71.6 minutes; subtracting is still safe, but don't use it for long stretches of time. |
| **`esp_timer_get_time()`** | A 64-bit microsecond clock that counts from power-up and only rolls over after hundreds of thousands of years. Used for the uptime. |
| **Uptime** | How long the board has been on since its last restart. |
| **Heartbeat** | A status LED that blinks regularly as a sign that the program is still healthy. |
| **Short press / long press** | The button is released before 1 second / the button is held for 1 second or more. |
| **State machine** | A way of organizing a program as a list of states plus rules for when to move between them. |
| **State** | The condition a state machine is in, for example STANDBY or WATERING. Always exactly one at a time. In Node 1's main cycle, a state is called a **step**. |
| **Transition** | A move from one state to another because of a trigger. |
| **`enum`** | A list of named choices, for example `{ STANDBY, WATERING, COOLDOWN }`. Its variable can only hold one of them. |
| **Main cycle** | Node 1 v1.0's state machine: IDLE → READING → DISPLAYING → ACTING. |
| **Module** (code) | A pair of `.h` and `.cpp` files that takes care of one thing, for example the button. |
| **Header file (`.h`)** | A module's "menu": a list of the functions other files can use, without their contents. |
| **`.cpp` file** | A module's "kitchen": the contents of every function, plus its secret variables. |
| **`#include`** | A command to also read the contents of another file. Double quotes for sketch files, angle brackets for libraries. |
| **`#pragma once`** | The line at the very top of a `.h` file: "read this file only once". |
| **`static`** | In front of a variable or function in a `.cpp` file: it belongs to that file only. |
| **Compile and link** | The two stages of turning code into a program. Errors from the second stage end with `ld returned 1 exit status`. |
| ***Undefined reference*** | A link-stage error: a function is promised in a `.h` file, but it has no contents in any `.cpp` file. |
| **`char[]`** | A row of letter drawers whose size is set once, at the start. |
| **`'\0'`** | A drawer with the value zero that marks the end of the text in a `char[]`. |
| **`const char*`** | The C++ way of naming fixed text between double quotes, for example the answer of `onOffText()`. |
| **`snprintf()`** | A function that fills in a fill-in-the-blank text pattern and puts the result into a `char[]`, without ever going past its number of drawers. |
| **Blank** (*format specifier*) | A `%` sign in a `snprintf()` or `Serial.printf()` pattern, for example `%d`, `%lu`, `%s`, `%.1f`. |
| **Heap** and **fragmentation** | The memory area that is borrowed from while the program runs / the state in which the heap is full of holes, so that big pieces are hard to get. |
| **RAM** and **flash** | Working memory that is erased when the power goes out / memory that stores the program and the settings, which stay. |
| **NVS** | *Non-Volatile Storage*: a part of the flash for storing small settings. |
| **Preferences** | The esp32 package's library for using NVS. Its contents are stored per **folder** (*namespace*) and **label** (*key*), like a filing cabinet. |
| **Watchdog** | A "guard dog" that restarts the board if it isn't fed on time. |
| **TWDT** | *Task Watchdog Timer*: the watchdog that watches tasks, including `loop()`. |
| **Feeding** the watchdog | Calling `esp_task_wdt_reset()`, a sign that the program is still running. |
| **Panic** | The system forcibly stopping the program, followed by a report and a restart. |
| **Backtrace** | A row of "footprint" addresses of where the program stopped, printed during a panic. |
| **Restart reason** | The cause of the last restart, from `esp_reset_reason()`. Node 1 translates it into a short word such as `POWERON`, `SW`, or `WDT`; the Practice 6 sketch writes `TASK_WDT`. |
| **Bootloop** | When the board starts, gets stuck or crashes, then restarts, over and over. |
| **Core** | A processing brain. The ESP32 has two; `loop()` runs on core 1. |
| **FreeRTOS** and **task** | The mini operating system inside the ESP32 / one "small program" that FreeRTOS schedules, for example `loopTask`. |
| **Idle task** | The task that runs when a core has no other work. |
| **Log** | A record of events printed by the program, together with their times. |
| **Log level** | How log messages are classified: DEBUG (details), INFO (important events), ERROR (problems). |
| **Bug** and **debugging** | A mistake in a program / the work of finding and fixing it. |
| **Shadow variable** (*shadowing*) | A new variable with the same name as another variable, so that it "covers up" that variable. |
| **Compiler warning** | A message from the compiler about code that compiles but looks suspicious. Turn them on in **File → Preferences… → Compiler warnings**. |
| **Split in half** (*bisection*) | Narrowing down where a bug is by switching off half of the code, then half of what's left, and so on. |
| **Isolate** | Checking only the suspect part, separately from the rest, for example by printing its value inside one function or testing it in a small sketch of its own. |
| **Soak test** | A long test, for example 24 hours, to catch bugs that only show up after running for a long time. |
| **Hysteresis** | A gap between two limits (for example "empty" at 20% and "enough" at 30%) so that the state doesn't flip back and forth. |

---

## 📝 5-Question Quiz

1. Look at this `loop()`:

   ```cpp
   void loop() {
     digitalWrite(PIN_STATUS_LED, HIGH);
     delay(500);
     digitalWrite(PIN_STATUS_LED, LOW);
     delay(500);
     if (digitalRead(PIN_BUTTON) == LOW) {
       setLamp(!lampOn);
     }
   }
   ```

   (a) Why are button presses often not read? (b) Rewrite the LED part with the `millis()` pattern so that the button can be checked on every pass.
2. After `millis()` has rolled over, `lastTime` holds `4294966000` and `now` holds `2000`. (a) What is the result of `now - lastTime` for `unsigned long`? (b) If `INTERVAL` is `2000`, is the task done? (c) Why is `if (millis() >= lastTime + INTERVAL)` dangerous?
3. In Practice 3, the soil is dry, but the tank is only 10% full. (a) Which states does Node 1 go through during one minute? (b) What does the status LED do? (c) What happens if the COOLDOWN state is removed and Node 1 goes straight back to STANDBY?
4. (a) The main tab calls `soundBuzzer()`, but `#include "actuators.h"` was forgotten. Which stage's error appears, and roughly what does its message say? (b) `actuators.h` says `void soundBuzzer();`, but in `actuators.cpp` the function is written as `soundBuzer()`. Which stage's error appears? (c) Open the `actuators.cpp` tab. Why is the `pump` variable there given `static`?
5. (a) A friend adds a `water 10` command that uses `delay(10000)` to Node 1 v1.0. Every time that command is typed, Node 1 is restarted with the reason `WDT`. Explain the cause and how to fix it. (b) Another friend saves the temperature reading to NVS on every pass of `loop()` "so it doesn't get lost". What's the problem?

<details>
<summary><b>Answer key & explanations</b></summary>

1. (a) The button is only checked **once every 1 second**, after both `delay(500)` calls have finished. A press is only recorded if the button happens to be pressed at exactly that moment. (b) For example:

   ```cpp
   void loop() {
     unsigned long now = millis();
     if (now - lastBlinkTime >= 500) {
       lastBlinkTime = now;
       ledOn = !ledOn;
       digitalWrite(PIN_STATUS_LED, ledOn);
     }
     // ...the button is checked here, on every pass (its bounce is filtered as in Practice 1)
   }
   ```

2. (a) **`3296`**: 1,296 ms until `millis()` rolls over (4,294,967,296 − 4,294,966,000), plus 2,000 ms after that. (b) **Yes**, because 3,296 ≥ 2,000. (c) `lastTime + INTERVAL` can overflow first and become a small number, so `millis() >=` that small number is true right away, and the task is done on every pass until `millis()` itself rolls over. This mistake only shows up once every 49.7 days, so it's almost impossible to catch while testing.
3. (a) **STANDBY → COOLDOWN → STANDBY → COOLDOWN** and so on: every time dry soil is detected, the pump is refused, then Node 1 rests for 30 seconds. In one minute, the pump is refused twice and never runs. (b) It **blinks fast**, a sign that the tank is low on water. (c) Node 1 tries again every 2 seconds, that is, at every soil check. While the tank is empty, Serial is flooded with refusals. Once the tank has been filled, the pump turns on again as soon as it turns off (the last soil check was already 3 seconds ago), before the water has had time to soak in. As a result, the plant gets flooded.
4. (a) A **compile-stage** error: `'soundBuzzer' was not declared in this scope`. (b) A **link-stage** error: ``undefined reference to `soundBuzzer()'``, ending with `ld returned 1 exit status`. (c) So that only `actuators.cpp` can change the pump's state. Other files just ask through `pumpOn()`. Besides that, `static` prevents a name clash with a `pump` variable in another file.
5. (a) `delay(10000)` holds `loop()` for 10 seconds, but the watchdog treats a `loop()` that doesn't come back within 5 seconds as a stuck program. The fix: use the pump function that doesn't wait, which already exists, `turnOnPump(10, lastReading().water_level)`. That function returns right away, and `updateActuators()` turns the pump off right on time. (b) Every time the number changes, NVS writes a new record, and every now and then a section of the flash has to be erased. A temperature reading changes all the time, so that NVS section is erased and rewritten over and over, and its lifetime (about 100,000 times) runs out much sooner than for a setting that changes only once a month. Every write also takes time, so `loop()` stutters too. NVS is for **settings** that rarely change; sensor readings belong in RAM, or are sent to the microSD card and, from Module 10 on, to the server.

</details>

---

## ✅ Module 8 Completion Checklist

Check them all before you move on to Module 9:

- [ ] I can explain the `delay()` trap, and in Practice 1 I saw the difference for myself: button presses got lost in the `delay()` version, but all of them were recorded in the `millis()` version.
- [ ] ⭐ **Three tasks take turns in one `loop()`** (Practice 2): the LED beats, the DHT22 is read every 2 seconds, and the button recognizes a short press and a long press. The LED blinks fast when the DHT22's data wire is pulled out.
- [ ] The watering state machine works (Practice 3): the button still responds while the pump is running, and I've drawn the state machine on paper.
- [ ] The five-file modular sketch behaves exactly like Practice 3 (Practice 4), and I can tell compile-stage errors apart from link-stage errors.
- [ ] I can read a simple `snprintf()` pattern, for example `"Soil threshold: %d%%"`, and I know why `char[]` drawers are prepared for the longest possible text (Concept 6).
- [ ] ⭐ **The threshold I saved in NVS is still there after the board is unplugged and then plugged back in** (Practice 5, and once more in Node 1 v1.0, ➕ E; in Wokwi with the `restart` command).
- [ ] ⭐ **The watchdog restarts a program I made stuck on purpose**, and I can read its restart reason (`TASK_WDT`) and the lines of its report (Practice 6).
- [ ] I found the Practice 7 bug with the help of the log and wrote `debugging-notes.md`.
- [ ] ⭐ **Node 1 v1.0 doesn't use `delay()` in `loop()`, and it ran for 24 hours without a restart** (in Wokwi: 30 minutes of uptime): the uptime on the status page is ≥ 24:00:00, and the `Boot #` number didn't change.
- [ ] Node 1 v1.0 is committed and pushed to `mini-smart-home`; this week's sketches and notes are in `learn-iot/module-08`.
- [ ] ⭐ **Quiz: at least 4 of 5 correct.**

**You pass when** (according to the Syllabus): *Node 1 runs for 24 hours without restarting (checked with the uptime counter on the OLED; in Wokwi: 30 minutes; the laptop may still power the ESP32 — the permanent adapter is installed in Module 9), the threshold stays saved after a power cut, and your code no longer uses `delay()` in `loop()`.*

**Toward the Phase 1 completion criteria** ([Syllabus §8](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)): firmware v1.0 is now finished. This week's 24-hour test is the dress rehearsal: the Phase 1 completion criteria ask for Node 1 to run on its own for 24 hours from an **adapter**, which is installed in Module 9, together with the measured battery sketch. The 30-second video follows at the end of Phase 1.

Everything checked? Congratulations — Node 1 now has firmware that deserves to be called "finished": it never waits silently, it knows which stage it's in, it remembers its settings, and it can get back up by itself if it trips. In **Module 9**, Node 1 gets a power supply of its own, and you learn to measure current and to save power for the battery-powered Node 2.

---

## 📚 Sources & Image Credits

**Documentation, datasheets, and source code used** (accessed October 2026):

- The [`millis()` reference](https://docs.arduino.cc/language-reference/en/functions/time/millis/) and the [Blink Without Delay](https://docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay/) example from the Arduino documentation — the origin of the "glancing at the wall clock" pattern.
- Espressif's documentation for the esp32 package: [Preferences](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/preferences.html) — folders (*namespaces*), labels (*keys*), and the pairs of read and write functions.
- ESP-IDF 5.5 documentation: [Watchdogs](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/wdts.html), [Non-Volatile Storage](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/storage/nvs_flash.html) (names of at most 15 characters, and spreading the writes so that the flash doesn't wear out quickly), [esp_timer](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/esp_timer.html), [Miscellaneous System APIs](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/misc_system_api.html) (`esp_reset_reason()`), [Fatal Errors](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/fatal-errors.html) (panic reports and the backtrace), [FreeRTOS](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/freertos.html), and the [ESP-IDF 5.0 migration guide](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/migration-guides/release-5.x/5.0/system.html) (since this version, `esp_task_wdt_init()` takes a configuration "form").
- The source code of [arduino-esp32](https://github.com/espressif/arduino-esp32) 3.3.x: `cores/esp32/main.cpp` (the `loopTask` task, its 8 KB stack, and `loop()` not being watched by the watchdog by default), `cores/esp32/esp32-hal-misc.c`, and `cores/esp32/esp32-hal-log.h`; plus the configuration of [esp32-arduino-lib-builder](https://github.com/espressif/esp32-arduino-lib-builder) (`CONFIG_ESP_TASK_WDT_PANIC=y`, the idle task of core 1 not being watched).
- The source code of [ESP-IDF](https://github.com/espressif/esp-idf) 5.5: `components/esp_system/task_wdt/task_wdt.c` (the messages `TWDT already initialized` and `Task watchdog got triggered`, and how `esp_task_wdt_reconfigure()` behaves) and `components/esp_system/port/soc/esp32/system_internal.c` (the timer is reset too when the program restarts the chip).
- The source code of [Arduino IDE](https://github.com/arduino/arduino-ide) 2.3.10: the sketch tab menu (**New Tab**, **Rename**, **Delete**, **Previous Tab**, **Next Tab**), the **Ctrl + Shift + N** shortcut, the `Name for new file` dialog, the `.ino` ending for names without an ending, and the **Compiler warnings** option; plus the `boards.txt` of the esp32 package 3.3.12 (**Erase All Flash Before Sketch Upload** and **Core Debug Level**).
- The [Winbond W25Q32JV datasheet (PDF)](https://www.winbond.com/resource-files/w25q32jv%20revg%2003272018%20plus.pdf), an example of an SPI flash chip commonly used on ESP32 boards: at least 100,000 erase/write cycles per sector.
- David J. Agans, *Debugging: The 9 Indispensable Rules for Finding Even the Most Elusive Software and Hardware Problems* (AMACOM, 2002) — further reading; the six steps in Concept 10 are this curriculum's summary, inspired by that book.

**Images.** The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The illustrations of the Arduino IDE window are redrawn to match the real thing; they aren't screenshots. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-08`, `delay-trap`, `millis-pattern`, `millis-odometer` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The `millis()` pattern follows the Blink Without Delay example; the rollover numbers are calculated from the limit of a 32-bit `unsigned long`; the results of 0 of 5 and 5 of 5 presses match the Practice 1 test in Wokwi. | CC BY 4.0 |
| `button-short-long`, `watering-state-machine`, `node1-main-cycle`, `node1-v1-file-map` (`.png` + `.svg`) | Original diagrams, drawn from the code of the Practice 2 and Practice 3 sketches and of Node 1 v1.0. | CC BY 4.0 |
| `modular-code`, `char-snprintf`, `nvs-filing-cabinet`, `watchdog-guard`, `leveled-logging`, `systematic-debugging` (`.png` + `.svg`) | Original diagrams. The error messages and the watchdog report are quoted from real Wokwi output (esp32 package 3.3.x with GCC 14); the NVS rules from the ESP-IDF documentation; the log examples from the Node 1 v1.0 code; the number `44015 ms` from the Practice 7 test. | CC BY 4.0 |
| `arduino-new-tab`, `arduino-compiler-warnings` (`.png` + `.svg`) | Original illustrations redrawn from Arduino IDE 2.3.10 (not screenshots). The texts of the menu, the dialog, and the `Preferences` window from the Arduino IDE source code; the compiler warning text checked with the esp32 package's GCC. | CC BY 4.0 for the illustrations |
| `wokwi-quick-win.png`, `wokwi-three-tasks.png`, `wokwi-watering-state-machine.png`, `wokwi-new-file.png`, `wokwi-node-1-v1.png` | Screenshots of the [Wokwi](https://wokwi.com) simulator (October 2026) running this module's code and `diagram.json` files, cropped and rearranged. Markers and labels by the author. | © Wokwi (CodeMagic LTD); used for educational purposes. |

All the sketches in this module, including Node 1 v1.0 with its 24 files, have been run in Wokwi with version 3 of the esp32 package. Node 1 v1.0 has also gone through an endurance test of about 70 minutes of real time (37 minutes of simulated uptime), and its microSD card path has been tried out. The error messages quoted here follow the output of the GCC compiler in the esp32 package; the Arduino IDE version of the *undefined reference* message was checked with the same GNU linker.

---

[⬅️ Module 7](../module-07-sensor-bus-oled-schematics/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 9 — Power Supply & Low Power: Adapters, Batteries, Deep Sleep, & Measuring Current](../module-09-power-and-low-power/README.md) ➡️**
