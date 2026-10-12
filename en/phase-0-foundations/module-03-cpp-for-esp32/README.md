# Module 3 — C++ Programming for the ESP32 from Scratch

🌐 **English** · [Bahasa Indonesia](../../../fase-0-fondasi/modul-03-cpp-untuk-esp32/README.md)

*Phase 0 · Week 3 · Hardware: **not required** — every practice works without a board (Wokwi, Arduino IDE, GitHub Desktop); you can also use the ESP32 board and breadboard from Module 2 · Prerequisite: **Module 2** · Time: 8–10 hours, spread over the week*

[⬅️ Module 2](../module-02-electricity-and-first-upload/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 4 ➡️](../module-04-javascript-nodejs/README.md)

---

Over the last two weeks you made an LED blink — on screen (Module 1) and on your desk (Module 2). Let's be honest: you **copied** most of that code. This week it's your turn to **write it yourself**. We'll learn the "grammar" of the C++ that the ESP32 uses: storing numbers and text, making decisions, repeating work, writing your own "recipes", grouping sensor data, and even reading error messages without panicking. At the end of the week you'll write a **traffic light** program from scratch and save it to GitHub with a new tool, **GitHub Desktop**.

The good news: **no new hardware**. Every practice can be done without a board: Wokwi in your browser is enough, plus Arduino IDE and GitHub Desktop on your laptop. If the board and breadboard from Module 2 are on your desk, you can try the results on the real board too — that's a bonus, not a requirement.

![Mini roadmap: where Module 3 sits among the 32 modules, and the six things you'll do this week without any new hardware: the Quick Win, a first program that talks; the concepts variables, operators, if, loops, functions, arrays, and struct; Practices 1–2, a Serial calculator and a compiler error workshop; Practices 3–6, an LED function, automatic Morse, a temperature array, and a struct; Practice 7, specific library versions and built-in examples; and Practices 8–9, a traffic light, then commit and push with GitHub Desktop](assets/roadmap-module-03.png)

> [!NOTE]
> **How to use the code in this module.** Every code box has a copy button (an icon of two stacked squares) in its top right corner. If you'd rather type the code yourself — highly recommended, because your fingers learn too — watch the capitalization and punctuation: to C++, `Serial` and `serial` are two different names. All the code is also available as files in the [`code/`](code/) folder. macOS users: replace **Ctrl** with **Cmd** in every shortcut.

This module follows the same rhythm as Modules 1–2. Open the collapsible sections in 🚨 (click a title to expand it) only when you need them; the collapsible sections in 🔬 can be skipped. Every practice starts with a **🖥️** box that tells you which tool to open.

## Contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: your first program that "talks" (10 minutes)](#-quick-win-your-first-program-that-talks-10-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Sketch](#1-programs-compilers-and-the-shape-of-a-sketch) · [2 Variables](#2-variables-and-data-types-labeled-jars) · [3 Operators](#3-operators-math-comparison-and-logic-symbols) · [4 `if`/`else`](#4-branching-with-ifelse-making-decisions) · [5 Loops](#5-for-and-while-loops-repeating-without-rewriting) · [6 Functions](#6-functions-recipes-you-can-call-again-and-again) · [7 Arrays](#7-arrays-a-row-of-numbered-drawers) · [8 `struct`](#8-struct-one-form-holding-many-pieces-of-data) · [9 Tidy style](#9-const-define-comments-and-tidy-style) · [10 Serial Monitor & errors](#10-the-serial-monitor-as-a-window-into-the-chips-brain--and-how-to-read-error-messages) · [11 Libraries](#11-libraries-ready-made-code--and-built-in-examples) · [12 Git](#12-git-and-github-desktop-snapshots-of-your-progress)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Calculator](#practice-1--serial-calculator-20-minutes) · [2 Error workshop](#practice-2--error-workshop-break-it-on-purpose-then-read-the-message-15-minutes) · [3 LED function](#practice-3--your-own-function-turnonledhowmanytimes-15-minutes) · [4 Morse](#practice-4--name--morse-code--led-blinks-automatically-20-minutes) · [5 Temperature array](#practice-5--temperature-array-average-highest-lowest-15-minutes) · [6 `struct`](#practice-6--struct-sensorreading-one-form-lots-of-data-15-minutes) · [7 Libraries](#practice-7--specific-library-versions-and-built-in-examples-25-minutes) · [8 Traffic light ⭐](#practice-8--completion-project-a-3-led-traffic-light-3045-minutes) · [9 GitHub Desktop ⭐](#practice-9--github-desktop-clone-commit-push-3045-minutes-one-time-setup)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-3-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

- **Write simple C++ programs for the ESP32 without peeking** — using variables, operators, `if`/`else`, `for`/`while` loops, functions with parameters and return values, arrays, and `struct`.
- **Read compiler error messages without panicking**: find the line it refers to, understand the messages that show up most often, and know why the **first** error is the one to fix first.
- **Use a specific version of a library** and learn from **built-in examples** (**File → Examples**) — the best learning resource that people often forget.
- **Save every bit of progress with Git through GitHub Desktop**: get a copy of a repository (clone), "snapshot" your progress (commit), and upload it (push).
- **Write a 3-LED traffic light program yourself** and save it on GitHub — the requirement to pass this module.

---

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **Laptop with Arduino IDE 2 + the esp32 package** | Already installed in Module 2. Not yet? Do [Module 2 Practices 2.1–2.2](../module-02-electricity-and-first-upload/README.md#21-download-and-install-arduino-ide-2) first — no kit needed. |
| **Browser + Wokwi** | Same as Module 1. A (free) Wokwi account is optional, but handy for saving projects so you don't have to paste the circuit again. |
| **GitHub account + the `learn-iot` repository** | Created in [Module 1 Practice 4](../module-01-big-picture-iot/README.md#practice-4--save-to-github-in-the-browser-without-installing-anything). |
| **GitHub Desktop** | Installed in Practice 9 (a download of about 310 MB). Needs 64-bit Windows 10/11 or macOS 13 or later (version 3.6.6 still runs on macOS 12, but the versions after it don't). Linux or macOS 12 users: see the note in Practice 9. |
| **Optional: ESP32 board + breadboard from Module 2** | The red LED on D4 has been in place since Module 2. For the traffic light on the real board, add 1 green LED, 1 yellow LED, 2 resistors of 220 Ω, and 5 jumper wires (2 for signals, 3 black) — all of them are in Kit A Stage 1. |
| **Internet** | Wokwi compiles your code on its server, so you need a connection. It uses very little data, except when you download GitHub Desktop. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. |
| **esp32 by Espressif Systems** board package | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. |
| **ArduinoJson** library | **7.4.3** (released March 2026) | Installed in Practice 7. Code for version 7 is written differently from versions 5–6, which many old tutorials still use. |
| **GitHub Desktop** | **3.6.x** (at the time of writing: 3.6.6, released September 2026) | Installed in Practice 9. Git is built in, so you don't need to install Git separately. |

---

## 🏆 Quick Win: your first program that "talks" (10 minutes)

In Modules 1–2, the ESP32 mostly talked through LEDs. In Module 2 you did read its messages in the Serial Monitor, but the code was copied. Now you write the **sentences** yourself: introducing yourself and having it calculate something for you.

> 🖥️ **Tool used in this section:** browser → **https://wokwi.com/projects/new/esp32**. No board needed, nothing to install.

1. Open the address above. Wokwi opens a new ESP32 project; the **`sketch.ino`** tab already contains a `setup()` and `loop()` skeleton.
2. Click inside the editor, delete everything (**Ctrl + A**, then **Delete**), then copy and paste the code below (original file: [`code/module03_hello/module03_hello.ino`](code/module03_hello/module03_hello.ino)):

   ```cpp
   // Module 3 - Quick Win: your first program that "talks"
   // Run it in Wokwi (a new ESP32 project) or on a real board.
   // The output appears in the Serial Monitor.

   String name = "Ani";   // text: write your name between the quotes
   int age = 17;          // whole number: your age in years

   void setup() {
     Serial.begin(115200);  // open a talk line to the laptop, speed 115200
     delay(500);            // give it a moment before it starts talking
     Serial.println();      // one blank line to keep things tidy

     Serial.println("Hello, ESP32!");
     Serial.println("My name is " + name + ".");

     Serial.print("I am ");
     Serial.print(age);
     Serial.println(" years old.");

     Serial.print("That means I have been alive for about ");
     Serial.print(age * 365);  // the ESP32 does the math: age x 365
     Serial.println(" days.");
   }

   void loop() {
     // Left empty on purpose: every message is sent just once, in setup().
   }
   ```

3. Replace `"Ani"` with your name (don't delete the quotation marks) and `17` with your age.
4. Click the green **▶** button. Wait about 10 seconds — Wokwi is compiling your code on its server.
5. Look at the **Serial Monitor** below the simulation panel. First a few "strange" lines appear (`rst:0x1 …`, `entry 0x400805dc`) — that's the chip's built-in boot report, just like in Module 2. After that, your own sentences appear:

   ```text
   Hello, ESP32!
   My name is Ani.
   I am 17 years old.
   That means I have been alive for about 6205 days.
   ```

![Wokwi screenshot with four markers: 1, the sketch.ino tab holding the Quick Win code on the left; 2, the start button above the simulation panel, which turns into restart, stop, and pause buttons while the simulation runs; 3, the Serial Monitor at the bottom right showing Hello, ESP32!, My name is Ani., I am 17 years old., and That means I have been alive for about 6205 days.; 4, the Serial Monitor input box in the very bottom row](assets/wokwi-hello-serial.png)

*Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

Congratulations — you just used **two variables** (`name` and `age`) and told the ESP32 to **calculate** (`age * 365`). The board in the simulation panel may look different from yours (a new ESP32 project in Wokwi uses a 38-pin board), but for a program that only uses the Serial Monitor, that doesn't matter.

Try two small things before moving on: (1) change `age * 365` to `age * 365 * 24`, then change the word `days` to `hours`; (2) delete one semicolon `;` anywhere, click **▶**, see what happens, then put the semicolon back. Don't worry — Practice 2 is all about error messages.

---

## 🧠 The "Why" Concepts

Twelve concepts, one per section — **you don't need to read them all at once**. Take it easy; there's a ☕ break halfway through. Suggested order: Concepts 1–4 and Concept 10 → Practices 1–2 → Concepts 5–8 → Practices 3–6 → Concepts 9, 11, and 12 → Practices 7–9. Each practice also says which concepts it uses.

### 1. Programs, compilers, and the shape of a sketch

Remember the analogy from Module 1? Code is the **recipe**, the compiler is the **cook**, and the binary file that goes into the chip is the **dish** ([Module 1 Concept 4](../module-01-big-picture-iot/README.md#4-from-code-to-chip-recipe--cook--dish)). This cook is very meticulous: one missing punctuation mark makes it stop and ask a question. That question is what we call an **error message**.

An Arduino program is called a sketch. Its shape is almost always the same — four parts, from top to bottom:

![Anatomy of an Arduino sketch from top to bottom: part 1 holds the include and the settings, such as constants and global variables, part 2 your own functions, part 3 setup, which runs once, part 4 loop, which repeats forever; plus five writing rules: every statement ends with a semicolon, curly braces wrap one block, uppercase and lowercase are different, comments start with two slashes, and spaces and line breaks can be tidied up with Auto Format](assets/sketch-anatomy.png)

1. **The top part** — `#include` (brings in a library, Concept 11), constants, and variables that are used everywhere.
2. **Your own functions** — "small recipes" like the `blink()` you used in Module 1 Practice 3 (covered in Concept 6 of this module). In this curriculum we put them above `setup()`.
3. **`setup()`** — runs **once** when the chip powers on: the "morning ritual".
4. **`loop()`** — repeats **over and over** until the power is unplugged: the "all-day routine". You've already seen a picture of these two "rooms" in [Module 1 Concept 5](../module-01-big-picture-iot/README.md#5-two-rooms-in-every-program-setup-and-loop).

Five writing rules that apply in every part:

- Every **statement** ends with a **semicolon** `;` — like the period at the end of a sentence.
- **Curly braces** `{ … }` wrap one **block**: the body of a function, the body of an `if`, the body of a loop. Every `{` must have a matching `}`.
- **Uppercase and lowercase are different**: `digitalWrite` is right, `digitalwrite` is wrong.
- **Comments** start with `//` and are ignored by the compiler — notes for humans.
- **Spaces and line breaks** don't change the meaning, but they make code easy to read. Tidy up automatically with **Tools → Auto Format** (**Ctrl + T**) in Arduino IDE.

### 2. Variables and data types: labeled jars

Imagine a kitchen with lots of **labeled jars**: "sugar", "salt", "coffee". The label is the **variable name**, what's inside is the **value**, and the kind of jar is the **data type** — a cracker jar is no good for storing oil.

```cpp
int age = 17;
```

Read it from left to right: "make a jar **of type `int`** named **`age`**, then **fill it with** 17". In C++, the `=` sign means **"fill with"**, not "equals". (To compare "are these the same?", C++ uses `==` — covered in Concept 3.)

![Variables drawn as labeled jars: int age holds 17 for a whole number, float temperature holds 28.5 for a decimal number, bool lampOn holds true for yes or no, String name holds Ani for text, and char letter holds A for a single character; below them, the value limits on the ESP32 and the rules for naming variables](assets/variable-box.png)

The five data types we use most often:

| Type | Holds | Example | Notes on the ESP32 |
| :--- | :--- | :--- | :--- |
| `int` | **Whole** numbers | `int age = 17;` | From −2,147,483,648 to 2,147,483,647 (about ±2.1 billion). |
| `float` | **Decimal** numbers | `float temperature = 28.5;` | Precise to about 7 significant digits. Enough for sensors. |
| `bool` | **Yes/no** | `bool lampOn = true;` | Only `true` or `false`. |
| `String` | **Text** | `String name = "Ani";` | Written between double quotes `"…"`. |
| `char` | **One** character | `char letter = 'A';` | Written between single quotes `'…'`. |

Later you'll also meet `unsigned long` (a whole number that is never negative, from 0 to about 4.29 billion, used to keep track of time; Module 8) and `const` (Concept 9).

> [!WARNING]
> **In code, decimals use a point, not a comma.** Write `28.5`, not `28,5`. To C++, the comma means something else: `float temperature = 28,5;` gives an error, and `temperature = 28,5;` (without the word `float`) is worse — it gets through without any message and quietly fills `temperature` with 28. In this article, numbers use a decimal point everywhere — in ordinary sentences (28.5 °C) as well as in code and in the Serial Monitor; if you're used to writing decimals with a comma, as in Indonesian (28,5), switch to a point whenever you write code.

Rules for naming variables:

- No spaces, no digit at the start, and no punctuation except the underscore `_`. `age1`, `room_temperature`, and `secondsAlive` are fine; `1age`, `room temperature`, and `room-temperature` are not.
- This curriculum's style: variables and functions use **lowercase letters + a capital at the start of each following word** (`secondsAlive`, `turnOnLed`), constants use **UPPERCASE_WITH_UNDERSCORES** (`PIN_LED`).
- Use names that tell a story. `roomTemperature` is much clearer than `x`.

One more thing: **where** a variable is created decides **who** may use it. A variable created at the top of the sketch (outside all functions) is called a **global variable** — it can be used anywhere. A variable created **inside** a block `{ … }` only exists inside that block. That's why the error `'x' was not declared in this scope` ("x is unknown in this area") shows up so often: the variable was created in `setup()`, but it's used in `loop()`.

### 3. Operators: math, comparison, and logic symbols

**Arithmetic operators** work like a calculator, with two surprises:

| Operator | Meaning | Example | Result |
| :---: | :--- | :--- | :--- |
| `+` `-` | add, subtract | `10 - 3` | `7` |
| `*` | multiply (not `x`) | `4 * 5` | `20` |
| `/` | divide | `7 / 2` | **`3`** ← surprise 1 |
| `/` | divide (with decimals) | `7.0 / 2` | `3.5` |
| `%` | the **remainder** of a division | `7 % 2` | `1` ← surprise 2 |

**Surprise 1:** if both numbers are whole numbers, the result of dividing them is a whole number too — the fractional part is **thrown away**, not rounded. `7 / 2` gives 3. To get 3.5, one of the numbers must be a decimal: `7.0 / 2`. **Surprise 2:** `%` isn't percent, it's the **remainder**. `7 % 2` = 1 (7 divided by 2 leaves a remainder of 1). It has many uses, for example checking whether a number is even: `number % 2 == 0`.

Just like at school, `*` and `/` are done before `+` and `-`. Not sure? Use parentheses: `(a + b) / 2`.

**Comparison operators** produce `true` or `false`:

| Operator | Meaning | Example (`temperature` = 31) |
| :---: | :--- | :--- |
| `==` | equal to | `temperature == 31` → `true` |
| `!=` | not equal to | `temperature != 31` → `false` |
| `>` `<` | greater than, less than | `temperature > 30` → `true` |
| `>=` `<=` | greater than or equal to, less than or equal to | `temperature <= 30` → `false` |

**Logical operators** combine several conditions: `&&` (**and** — both must be true), `||` (**or** — one is enough), and `!` (**not** — turns true into false, and the other way around). Example: `temperature > 30 && personPresent` means "hot **and** someone is there".

**Shorthand** you'll see often: `x = x + 1;` can be written `x += 1;` or `x++;`. All three mean the same thing: "add one". The opposite, `x--;`, means "subtract one".

> [!CAUTION]
> **The most classic trap: `=` versus `==`.** `if (temperature = 30)` does **not** compare — it **fills** `temperature` with 30, and the condition always counts as true. Arduino IDE doesn't warn you (its compiler warnings are turned off by default). If your `if` "always runs", count the `=` signs in its condition first. Want to be warned? In Arduino IDE, open **File → Preferences…** (macOS: **Arduino IDE → Settings…**), then change **Compiler warnings** to **More**.

### 4. Branching with `if`/`else`: making decisions

A program that only runs straight ahead can't react. With `if`, a program can choose:

```cpp
if (temperature > 30) {
  Serial.println("Hot! Turn on the fan.");
} else if (temperature < 20) {
  Serial.println("Cold. Turn off the fan.");
} else {
  Serial.println("Cool. Leave it as is.");
}
```

Read it like a sentence: "**if** the temperature is above 30, print `Hot!`; **otherwise, if** the temperature is below 20, print `Cold.`; **in any other case**, print `Cool.`". The program checks the conditions from top to bottom and runs only **one** block — the first block whose condition is true.

![Flowchart of the fan decision: it starts by reading the temperature, then asks whether the temperature is above 30; if yes, turn on the fan; if no, it asks whether the temperature is below 20; if yes, turn off the fan; if no, leave it as is; all the paths meet again at the end](assets/if-else-flow.png)

Three things to remember:

- The condition always goes inside **parentheses** `( … )`, and the block inside **curly braces** `{ … }`.
- **Don't** put a semicolon after the condition's parentheses. `if (temperature > 30);` makes that `if` "empty", and the block below it always runs.
- `else if` and `else` are optional. An `if` on its own is valid too.

### 5. `for` and `while` loops: repeating without rewriting

You already know one loop: `loop()` itself repeats forever. Inside it, we often need to repeat something **just a few times** — for example, blinking an LED 5 times. That's what `for` is for:

```cpp
for (int i = 1; i <= 5; i++) {
  Serial.println(i);
}
```

Inside the parentheses of `for` are **three parts**, separated by semicolons:

![Anatomy of a for loop: the first part, int i = 1, is the starting point, the second part, i <= 5, is the condition to keep going, the third part, i++, is the step; a trace table shows i going from 1 to 5 while the Serial Monitor prints 1 to 5, and when i becomes 6 the condition is false, so the loop stops](assets/for-loop.png)

1. **Starting point** — `int i = 1`: create a counter `i`, starting at 1.
2. **Condition to keep going** — `i <= 5`: as long as `i` is at most 5, repeat.
3. **Step** — `i++`: each time a round is finished, add 1 to `i`.

As a result, the Serial Monitor prints 1, 2, 3, 4, 5. When `i` becomes 6, the condition is false and the loop stops. The name `i` is just a habit; you could call it `n` or `count` instead.

`while` is used when we **don't know** how many times to repeat, only **when to stop**:

```cpp
int remaining = 3;
while (remaining > 0) {
  Serial.print("Remaining ");
  Serial.println(remaining);
  remaining = remaining - 1;
}
```

Make sure something inside the `while` will eventually make the condition false. If not (for example, if you forget to write the line `remaining = remaining - 1;`), the program spins there forever: the Serial Monitor is flooded with `Remaining 3` nonstop, while the statements after the `while` — including blinking the LED — never run again. If there's no `Serial.print` inside the `while`, the chip seems completely "frozen". Want to leave a loop early? Use `break;`.

### 6. Functions: recipes you can call again and again

In Module 1 you used the function `blink(…)` without knowing what was inside. Now let's take it apart. A function is a **small named recipe** that can be called at any time:

```cpp
void turnOnLed(int howManyTimes) {
  for (int i = 1; i <= howManyTimes; i++) {
    digitalWrite(PIN_LED, HIGH);
    delay(300);
    digitalWrite(PIN_LED, LOW);
    delay(300);
  }
}
```

- **`turnOnLed`** is the name of the recipe.
- **`(int howManyTimes)`** is the **parameter** — the "ingredient" you hand over when you call the recipe. The call `turnOnLed(3);` fills `howManyTimes` with 3; `turnOnLed(5);` fills it with 5.
- **`void`** in front means this recipe **produces nothing** to take home — it only **does** something. (This is the meaning of `void` promised in Module 1.)

There are also recipes that **produce something**; the result is called the **return value**:

```cpp
float toFahrenheit(float celsius) {
  return celsius * 9.0 / 5.0 + 32.0;
}
```

The word `float` in front promises that this recipe returns a decimal number, and the word **`return`** hands over the result. Using it: `float f = toFahrenheit(30.0);` → `f` holds `86.0`.

![A function drawn as a machine: ingredients go in through the parameter, get processed inside the function body, and the result comes out through return; the top example, the toFahrenheit machine, takes 30.0 and puts out 86.0; the bottom example, the turnOnLed machine, takes 3 and makes one LED blink three times, drawn as an on–off line three times, without putting out a value because its type is void](assets/function-machine.png)

`setup()` and `loop()` are actually functions too — `void`, with no parameters, and called automatically by the Arduino "system". Why bother writing your own functions? There are three reasons: the same code doesn't have to be written over and over; the name makes the code easy to read ("ah, this is where the LED blinks"); and if something is wrong, you only fix it in one place.

> ☕ **Break time.** The six concepts above are the "core grammar" — with just those you can already write lots of programs. The next six are helpers: bigger containers for data, tidiness, error messages, libraries, and Git. If you've been reading for 30 minutes, stand up, have a drink, then carry on.

### 7. Arrays: a row of numbered drawers

If you want to store the temperature for 7 days, making 7 variables (`temperature1`, `temperature2`, …) is a real hassle. An array is **one name for a row of numbered drawers**:

```cpp
float temperature[7] = {28.5, 29.1, 30.4, 31.2, 29.8, 27.6, 28.9};
```

Meaning: "make a row of 7 drawers named `temperature`, each holding a `float`, with these starting contents". The drawer number (the **index**) **starts at 0**: `temperature[0]` is `28.5`, `temperature[1]` is `29.1`, … `temperature[6]` is `28.9`.

![An array drawn as seven drawers in a row, numbered 0 to 6, holding seven temperatures, from 28.5 in drawer 0 to 28.9 in drawer 6; drawer number 7 is drawn with a dashed outline and a danger mark because it doesn't exist; below, an example for loop from i = 0 while i < 7 that opens the drawers one by one](assets/array-drawers.png)

Two things make arrays both powerful and dangerous:

- **Powerful:** with `for`, you can open every drawer without writing them out one by one: `for (int i = 0; i < 7; i++) { … temperature[i] … }`. Note that the condition is `i < 7`, not `i <= 7`.
- **Dangerous:** C++ does **not** check whether the drawer number exists. `temperature[7]` (the eighth drawer, when there are only 7) gives no error when you compile. When the program runs, reading a drawer that doesn't exist usually gives a nonsense number. If the drawers hold `String`s, or if you **write** to a drawer outside the bounds, the ESP32 may restart with a `Guru Meditation Error` message in the Serial Monitor. If you see strange numbers or mysterious restarts after using an array, check the index bounds first.

### 8. `struct`: one form holding many pieces of data

One sensor reading is made up of several pieces of data at once: temperature, humidity, light, and whether there's motion. Instead of making four scattered variables, we group them all in one **`struct`** — picture a **form** with several fields to fill in:

```cpp
struct SensorReading {
  float temperature;  // degrees Celsius
  int humidity;       // percent
  int light;          // 0-4095
  bool motion;        // motion detected?
};
```

The code above only **designs an empty form**, a kind of template (a new data type called `SensorReading`). It has no contents yet, and nothing shows up in the Serial Monitor. To **fill in** the form, create a variable of that type, then fill in its fields using a dot (`reading.temperature`):

```cpp
SensorReading reading;
reading.temperature = 28.5;
reading.humidity = 71;
```

![A struct drawn as a form: the empty SensorReading design has four fields, float temperature, int humidity, int light, and bool motion; an arrow labeled create, then fill in leads to a filled-in form named reading with temperature 28.5, humidity 71, light 412, and motion false; next to it, a telemetry JSON snippet for Module 11, tried out in Practice 7, with the same field names](assets/struct-form.png)

The field names deliberately match our project's "data contract" — the agreement on data names and formats that every part of the project uses ([Syllabus Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract)). In Module 11, the contents of this form are sent to the server in JSON format — and in Practice 7 you'll get a sneak peek.

### 9. `const`, `#define`, comments, and tidy style

Numbers that **must not change** (pin numbers, pause lengths) are best given a name with `const`:

```cpp
const int PIN_LED = 4;
```

`const` ("constant") makes the compiler refuse if one day you accidentally change it. In other tutorials you'll often see the old way:

```cpp
#define PIN_LED 4
```

`#define` isn't a variable but a "find and replace" instruction that runs before compiling: every occurrence of `PIN_LED` is replaced with `4`. Note its form — **no** `=` and **no** `;`. The classic mistake is writing `#define PIN_LED 4;` — that semicolon gets "pasted" everywhere too and causes confusing errors on lines far away from the real one. This curriculum uses `const`, but you need to be able to read both.

Good **comments** explain **why**, rather than repeating **what**. `delay(500); // wait 500 ms` isn't very useful; `delay(500); // the LED needs a pause so the eye can see it blink` is more useful. For long notes, use `/* … */`.

**Tidy style** isn't a matter of taste but of **finding mistakes faster**. The contents of every block are indented by two spaces, one statement per line, and blank lines between sections. No need to memorize the rules: in Arduino IDE, **Tools → Auto Format** (**Ctrl + T**) tidies everything up in an instant. Make a habit of pressing it before you save.

### 10. The Serial Monitor as a "window into the chip's brain" — and how to read error messages

The chip has no screen, so we can't know what it's "thinking" — unless it tells us through the Serial Monitor. That's the number one debugging tool (finding the cause of a mistake) in the whole curriculum:

- `Serial.print(x)` prints without moving to a new line; `Serial.println(x)` prints and then moves to a new line.
- A `float` is printed with **2 digits after the decimal point** (`28.50`). Want 1 digit? `Serial.print(temperature, 1)`.
- **Bug-hunting trick:** print the contents of variables at important points. `Serial.print("i = "); Serial.println(i);` inside a loop often solves the mystery right away.
- Reading what you **type** in the Serial Monitor: `Serial.available()` tells you whether anything has arrived; `Serial.readStringUntil('\n')` reads one whole line. (`'\n'` is the "new line" character that gets sent along when you press **Enter**.) Both are used in Practices 1 and 4.

Now the side that often makes beginners panic: **compiler error messages**. In Module 1 you learned to read the most basic ones. This week we go up a level:

![Anatomy of a compiler error message from Wokwi with six numbered markers: the first line, In function 'void setup()', is labeled context, meaning the mistake is inside the setup() function; the line sketch.ino:17:16 means 1 the file name sketch.ino, 2 line number 17, and 3 column 16; then 4 the message type error, 5 the message itself, 'ag' was not declared in this scope, and 6 the compiler's guess, did you mean 'age'?; below it, the code snippet from line 17 with a wavy mark under the word ag and the suggested fix age; a Remember box lists three habits for reading errors, including that Arduino IDE shows the same message with the full file path and ends it with Compilation error](assets/error-message-anatomy.png)

- **`sketch.ino:17:16`** — the file name, **line 17**, column 16. Line numbers are shown along the left edge of the editor.
- **`error:`** followed by the message. **`note:`** is extra information, not a new error.
- **`did you mean 'age'?`** — newer compilers often **guess** what you meant. The guess is usually right; read it.
- **One mistake can produce many messages.** Fix **only the first message**, then run again. The rest of the messages often disappear with it.
- **In Arduino IDE**, the message is the same, but it starts with the full file path (for example `C:\Users\…\module03_hello.ino:17:16: error: …`) and ends with `Compilation error: …` in the **Output** panel and in the notification at the bottom right.

The list of the most common messages and their fixes is in Practice 2 and in 🚨.

### 11. Libraries: ready-made code — and built-in examples

You don't have to write everything yourself. A ***library*** is a collection of ready-made code written by other people — like a **recipe book** you can borrow. A library is brought in with `#include` at the top of the sketch:

```cpp
#include <ArduinoJson.h>
```

After that line, you can use all the "recipes" in the ArduinoJson library. Libraries can be installed in two places:

- **Arduino IDE** — through the **Library Manager** (the third icon in the left sidebar, a picture of books). Libraries installed there can be used by all your sketches.
- **Wokwi** — through the **Library Manager** tab above the editor. Wokwi keeps the list in a file called **`libraries.txt`** inside the project.

**Why do versions matter?** Libraries keep getting updated, and sometimes the way you write code for them changes too. A real example: code for ArduinoJson version 6 (`StaticJsonDocument<200> doc;`) is outdated in version 7 (just `JsonDocument doc;`). That's why every module states the versions it uses, and you'll learn to **pick a specific version** in Practice 7.

**Built-in examples** are the best learning resource that people often forget. Almost every library comes with ready-to-use examples that are **guaranteed to match the installed version**. You'll find them in the **File → Examples** menu, which has several groups:

- **Built-in examples** — basic Arduino examples (`01.Basics`, `02.Digital`, …).
- **Examples for any board** — examples from the libraries bundled with Arduino IDE that work on any board.
- **Examples for DOIT ESP32 DEVKIT V1** — ESP32-specific examples (Wi-Fi, Bluetooth, the touch sensor, …). This group appears once the board is selected (Module 2 Practice 2.4).
- **Examples from Custom Libraries** — examples from libraries you installed yourself, such as ArduinoJson.

A habit we'll keep until the end of the curriculum: **before you search the internet for a tutorial, open the built-in examples first.**

### 12. Git and GitHub Desktop: snapshots of your progress

So far you've been saving to GitHub through the browser: upload a file, click **Commit changes**. That was already using Git, you just didn't notice. This week we use it on purpose, with the **GitHub Desktop** app.

**Git** is a "time machine" for a folder. Its four verbs:

- ***Clone*** — downloads a copy of a repository from GitHub to your laptop, **complete with its history**. Only needed once.
- ***Commit*** — takes a **snapshot** of the folder as it is right now, together with a short note ("Module 3: Serial calculator"). Every photo is kept forever in the history; you can go back to any of them.
- ***Push*** — sends the new photos from your laptop to GitHub.
- ***Fetch*** — downloads news of new commits from GitHub without changing your folder; ***pull*** — brings those new commits into the folder on your laptop.

![The Git flow: the cloned learn-iot folder in Documents\GitHub holds README.md, the Module 1 file, the module-02 folder, and the new module-03 folder; commit takes a snapshot of the folder as photo number 3 at the top of the laptop's history, newest on top; push sends that new photo to the learn-iot repository on GitHub, where the new commit 3 appears after the push; fetch or pull brings commits from GitHub to the laptop; clone copies the repository from GitHub to the laptop once, at the start; a note says that a commit without a push means the photo is still only on the laptop](assets/git-commit-push.png)

The one thing that confuses beginners most: **a commit doesn't mean it's saved on GitHub yet.** A commit stores the photo on your **laptop**; only after a ***push*** does that photo appear on GitHub. GitHub Desktop lets you do all of this just by clicking buttons, without typing commands.

---

## 🔧 Step-by-step practice

Nine short practices. Almost all of them only need Wokwi; Practice 7 also uses Arduino IDE, and Practice 9 installs GitHub Desktop. The completion project is in **Practice 8**; keep its code safe for Practice 9.

> [!TIP]
> **Make a habit of saving your code.** Each time you finish a practice, click in the Wokwi editor, press **Ctrl + A**, then **Ctrl + C**. In Arduino IDE, choose **File → New Sketch**, delete its default contents (**Ctrl + A**, then **Delete**), paste (**Ctrl + V**), then **File → Save** with a name like `module03_calculator` (it's saved in the *Arduino* folder inside *Documents*). In Practice 9, everything moves to GitHub. Have a Wokwi account? Click **Save** in Wokwi too.
>
> **Want it easier?** Do Practices 9.1–9.3 first (install GitHub Desktop and clone, about 20 minutes). After that, save every sketch straight into the `module-03` folder inside the `learn-iot` repository (how to do that is in Practice 9.4), then commit each time you finish a practice.

### Practice 1 — Serial calculator (20 minutes)

> 🖥️ **Tool:** browser → **https://wokwi.com/projects/new/esp32** (a new ESP32 project). No board needed.

> 📌 Practices 1–2 use [Concepts 1–4](#1-programs-compilers-and-the-shape-of-a-sketch) and [Concept 10](#10-the-serial-monitor-as-a-window-into-the-chips-brain--and-how-to-read-error-messages) (reading what you type and reading error messages). Haven't read them yet? Read them first, about 30 minutes.

This calculator takes a question you type — for example `12 + 5` — and answers it. It uses Concepts 2–4 (variables, operators, and `if`/`else`) and the way of reading typed input from Concept 10.

1. Open a new ESP32 project in Wokwi, delete the contents of `sketch.ino`, then paste the code below (original file: [`code/module03_calculator/module03_calculator.ino`](code/module03_calculator/module03_calculator.ino)):

   ```cpp
   // Module 3 - Practice 1: Serial calculator
   // Type a question in the Serial Monitor, for example 12 + 5, then press Enter.
   // Operators it understands: +  -  *  /   (spaces are optional)

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("=== ESP32 Calculator ===");
     Serial.println("Type a question, for example 12 + 5, then press Enter.");
     Serial.println("Operators: +  -  *  /");
   }

   void loop() {
     if (Serial.available() > 0) {                      // has anything been typed?
       String question = Serial.readStringUntil('\n');  // read one line, for example "12 + 5"
       question.replace(" ", "");                       // remove all spaces: "12+5"
       question.trim();                                 // remove what's left of the Enter key

       // Find where the operator is. The search starts at the second character (position 1)
       // so that a minus sign before the first number (like -3*2) isn't taken as the operator.
       char operation = '*';
       int position = question.indexOf('*', 1);
       if (position < 0) {
         operation = '/';
         position = question.indexOf('/', 1);
       }
       if (position < 0) {
         operation = '+';
         position = question.indexOf('+', 1);
       }
       if (position < 0) {
         operation = '-';
         position = question.indexOf('-', 1);
       }

       if (position < 0) {
         // indexOf() returns -1 when it can't find what it's looking for
         Serial.println("Operator not found. A correct example: 12 + 5");
       } else {
         float number1 = question.substring(0, position).toFloat();   // the part left of the operator
         float number2 = question.substring(position + 1).toFloat();  // the part right of the operator

         if (operation == '/' && number2 == 0) {
           Serial.println("Cannot divide by zero!");
         } else {
           float result = 0;
           if (operation == '+') {
             result = number1 + number2;
           } else if (operation == '-') {
             result = number1 - number2;
           } else if (operation == '*') {
             result = number1 * number2;
           } else {
             result = number1 / number2;
           }

           Serial.print(number1);
           Serial.print(" ");
           Serial.print(operation);
           Serial.print(" ");
           Serial.print(number2);
           Serial.print(" = ");
           Serial.println(result);
         }
       }
     }
   }
   ```

2. Click **▶**. After the boot messages, the Serial Monitor shows `=== ESP32 Calculator ===`.
3. Click the **input box in the very bottom row of the Serial Monitor**, type `12 + 5`, then press **Enter**. The answer appears: `12.00 + 5.00 = 17.00`.

   ![Cropped screenshot of the Wokwi Serial Monitor while the calculator runs: the answers 12.00 + 5.00 = 17.00, 7.00 / 2.00 = 3.50, -3.00 * 4.00 = -12.00, and Cannot divide by zero! are highlighted; the input box in the very bottom row holds the question 2.5 - 10, not sent yet; on the right are three steps: click the input box, type a question, then press Enter](assets/wokwi-serial-typing.png)

   *Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*

4. Try these questions one at a time and compare them with the results in the Serial Monitor:

   | You type | Result that appears | The lesson |
   | :--- | :--- | :--- |
   | `7/2` | `7.00 / 2.00 = 3.50` | Because it uses `float`, the result is a decimal (compare with `7 / 2` = 3 in Concept 3). |
   | `-3*4` | `-3.00 * 4.00 = -12.00` | A minus sign in front of the first number isn't taken for the operator. |
   | `10 / 0` | `Cannot divide by zero!` | The `if` protects the program from an impossible question. |
   | `hello` | `Operator not found. …` | `indexOf()` returns `-1` when it finds nothing. |

The new parts of the code:

- `question.replace(" ", "")` removes all spaces, `question.indexOf('+', 1)` finds where the `+` sign is, starting from the second character (computers count positions from 0, so position 1 = the second character; see Concept 7), and `question.substring(0, position)` cuts the text from the start up to just before the operator. All three are "recipes" that belong to the `String` type.
- `.toFloat()` turns the text `"12"` into the number `12.0` so it can be used in a calculation. Text and numbers are two different things: `String("12") + "5"` produces the text `"125"`, not 17. (Writing `"12" + "5"` without `String(…)` is actually an error in C++ — unlike JavaScript in Module 4.)
- The `if … else if … else` chain picks the right operation — exactly Concept 4.
- The Serial Monitor uses a **decimal point** (`3.50`), not a comma.

### Practice 2 — Error workshop: break it on purpose, then read the message (15 minutes)

> 🖥️ **Tool:** Wokwi with the **Quick Win** code (paste it again from above if you've closed that tab).

In Module 2 you "broke" the circuit on purpose. Now we break the **code** — one thing at a time. For each row of the table: make the break, click **▶**, read the **Build failed!** box that appears, fix it, then move on to the next row. The line numbers on your screen may be slightly different if your code isn't exactly the same; what matters is that the number points to the line you broke — except for break 4 (read its last column). The messages in this table are real messages from Wokwi.

| # | Break | Message that appears | How to read it |
| :---: | :--- | :--- | :--- |
| 1 | Delete the `;` at the end of `Serial.println("Hello, ESP32!");` | `sketch.ino:13:34: error: expected ';' before 'Serial0'` | The semicolon is missing on **line 13**. The compiler only notices when it reaches the **next** statement. Why `Serial0` and not `Serial`? In version 3 of the esp32 package, `Serial` is really another name for `Serial0` — just treat them as the same thing. |
| 2 | Change `Serial.print(age);` to `Serial.print(ag);` | `error: 'ag' was not declared in this scope; did you mean 'age'?` | The name `ag` was never created. The compiler even guesses what you meant: `age`. |
| 3 | Change `Serial.begin(115200);` to `serial.begin(115200);` | `error: 'serial' was not declared in this scope; did you mean 'Serial'?` | Uppercase and lowercase are different. Once again, the compiler's guess is spot on. |
| 4 | Delete the `}` on line 23 (the end of `setup()`, two lines above `void loop() {`) | `error: a function-definition is not allowed here before '{' token` on the `void loop() {` line, then `error: expected '}' at end of input` and `note: to match this '{'` on the `void setup() {` line | **One** missing brace produces **three** messages, and not one of them points to the line that's actually wrong. The best clue is `note: to match this '{'`, which means the opening brace of `setup()` has no partner. |
| 5 | Change `int age = 17;` to `int age = "seventeen";` | `error: invalid conversion from 'const char*' to 'int' [-fpermissive]` | An `int` jar only holds whole numbers; the text `"seventeen"` can't go in. `const char*` is C++'s name for text between quotation marks. |

Three lessons from this workshop:

1. **Look at the line number first**, then search around that line — sometimes one line above it.
2. **Fix only the first error**, then click **▶** again. The next messages often disappear on their own.
3. **Read the `did you mean` suggestion.** The compiler often knows the answer.

> [!NOTE]
> **In Arduino IDE**, the same messages appear in the **Output** panel, starting with the full file path and ending with `exit status 1` and `Compilation error: …` (which also shows up as a notification at the bottom right). The problem line is highlighted in red in the editor as well.

### Practice 3 — Your own function: `turnOnLed(howManyTimes)` (15 minutes)

> 🖥️ **Tool:** Wokwi with the 3-LED breadboard circuit — **or** a real board with the Module 2 circuit (red LED on D4) and Arduino IDE.

> 📌 Practices 3–6 use [Concepts 5–8](#5-for-and-while-loops-repeating-without-rewriting). Haven't read them yet? Read them first, about 30 minutes.

From this practice on, we need LEDs. We use the same Wokwi circuit for Practices 3, 4, and 8: an ESP32 board on a breadboard with a **red LED on D4** (exactly the Module 2 circuit), a **green LED on D18**, and a **yellow LED on D19**.

1. Open a new ESP32 project in Wokwi. Click the **`diagram.json`** tab, delete its contents, then paste in the contents of the file [`code/wokwi-traffic-light/diagram.json`](code/wokwi-traffic-light/diagram.json) (right-click the link → open it in a new tab, then click the **Copy raw file** copy icon at the top right of the file contents). The simulation panel now shows an ESP32 board on a breadboard with three LEDs — red, green, yellow — like [the picture in Practice 8](#practice-8--completion-project-a-3-led-traffic-light-3045-minutes).
2. Have a Wokwi account? Click **Save** now so you can open this circuit again in Practices 4 and 8 without pasting it again. Once it's saved, the address in the browser bar changes to `wokwi.com/projects/…`; *bookmark* that address so it's easy to open again.
3. Click the **`sketch.ino`** tab, delete its contents, then paste the code below (original file: [`code/module03_led_function/module03_led_function.ino`](code/module03_led_function/module03_led_function.ino)):

   ```cpp
   // Module 3 - Practice 3: your own functions
   // Circuit: red LED on D4 (the Module 2 circuit or the Wokwi traffic-light diagram).

   const int PIN_LED = 4;  // red LED on D4

   // A function WITHOUT a return value (void): blinks the LED howManyTimes times.
   // howManyTimes is a parameter: the "ingredient" we hand over when we call the function.
   void turnOnLed(int howManyTimes) {
     for (int i = 1; i <= howManyTimes; i++) {
       digitalWrite(PIN_LED, HIGH);
       delay(300);
       digitalWrite(PIN_LED, LOW);
       delay(300);
     }
   }

   // A function WITH a return value (float): converts a temperature from Celsius to Fahrenheit.
   // The word return sends the result back to the place where the function was called.
   float toFahrenheit(float celsius) {
     return celsius * 9.0 / 5.0 + 32.0;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED, OUTPUT);
     Serial.println();

     Serial.println("Blink 3 times...");
     turnOnLed(3);
     delay(1000);

     Serial.println("Blink 5 times...");
     turnOnLed(5);

     float roomTemperature = 30.0;
     float result = toFahrenheit(roomTemperature);  // result holds the returned value
     Serial.print(roomTemperature);
     Serial.print(" degrees C = ");
     Serial.print(result);
     Serial.println(" degrees F");
   }

   void loop() {
     // empty: everything was already done once in setup()
   }
   ```

4. Click **▶**. The red LED blinks **3 times**, pauses briefly, then **5 times**. The Serial Monitor ends with `30.00 degrees C = 86.00 degrees F`.
5. Make your own changes: call `turnOnLed(10);` or add a line that prints `toFahrenheit(37.0)` (body temperature). Each time, guess the result first, then click **▶**.

**On a real board:** in Arduino IDE, choose **File → New Sketch**, delete its default contents (**Ctrl + A**, then **Delete**), paste the same code, then click **Upload** as in Module 2. Open the Serial Monitor (**115200 baud**) and press the **EN** button so you can see the messages from the start.

### Practice 4 — Name → Morse code → LED blinks, automatically (20 minutes)

> 🖥️ **Tool:** the Wokwi project from Practice 3 (the 3-LED circuit) — or a real board with the red LED on D4.

In Module 1 you translated your name into Morse code **by hand**, one `blink(…)` line per dot and dash. Now let the program translate any name you type. This program uses almost every concept: `String`, arrays (Concept 7), `for`, `if`, and functions.

1. In the Practice 3 Wokwi project, replace the contents of `sketch.ino` with this code (original file: [`code/module03_morse_name/module03_morse_name.ino`](code/module03_morse_name/module03_morse_name.ino)):

   ```cpp
   // Module 3 - Practice 4: name -> Morse code -> LED blinks, automatically
   // Type your name in the Serial Monitor, then press Enter. The red LED on D4 blinks it in Morse code.
   // In Module 1 you wrote blink(...) calls one by one; now the program does the translating.

   const int PIN_LED = 4;

   const int SHORT = 200;        // short blink (dot) length, milliseconds
   const int LONG = 600;         // long blink (dash) length
   const int BLINK_DELAY = 200;  // pause between two blinks within one letter
   const int LETTER_GAP = 400;   // extra pause between two letters
   const int WORD_GAP = 1000;    // pause for the space between words

   // Two lists in the same order: letter 0 (A) pairs with code 0 (".-"), and so on.
   const String LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   const String MORSE[26] = {
     ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---",  // A-J
     "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-",    // K-T
     "..-", "...-", ".--", "-..-", "-.--", "--.."                            // U-Z
   };

   void blink(int onTime) {
     digitalWrite(PIN_LED, HIGH);
     delay(onTime);
     digitalWrite(PIN_LED, LOW);
     delay(BLINK_DELAY);
   }

   // Sends one letter: look up its code, then blink its dots and dashes one by one.
   void sendLetter(char letter) {
     int position = LETTERS.indexOf(letter);  // A = 0, B = 1, ... ; -1 if it isn't a letter A-Z
     if (position < 0) {
       return;  // a digit or punctuation mark: just skip it
     }
     String code = MORSE[position];
     Serial.print(letter);
     Serial.print(" = ");
     Serial.println(code);

     for (int i = 0; i < code.length(); i++) {
       if (code.charAt(i) == '.') {
         blink(SHORT);
       } else {
         blink(LONG);
       }
     }
     delay(LETTER_GAP);
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED, OUTPUT);
     Serial.println();
     Serial.println("Type your name, then press Enter:");
   }

   void loop() {
     if (Serial.available() > 0) {
       String name = Serial.readStringUntil('\n');
       name.trim();         // remove what's left of the Enter key
       name.toUpperCase();  // "ani" becomes "ANI"
       Serial.println("Sending: " + name);

       for (int i = 0; i < name.length(); i++) {
         char letter = name.charAt(i);
         if (letter == ' ') {
           delay(WORD_GAP);  // space between words
         } else {
           sendLetter(letter);
         }
       }
       Serial.println("Done. Type another name:");
     }
   }
   ```

2. Click **▶**, wait for `Type your name, then press Enter:`, type your name in the input box at the bottom of the Serial Monitor, then press **Enter**. For `ani`, the Serial Monitor writes `A = .-`, `N = -.`, `I = ..`, and the red LED blinks short-long, long-short, short-short.

**On a real board:** in Arduino IDE, choose **File → New Sketch**, delete its default contents (**Ctrl + A**, then **Delete**), paste this code, then click **Upload**. Open the Serial Monitor (**115200 baud**, line ending **New Line**), press **EN**, then type your name in the **Message** box at the **top** of the Serial Monitor panel.

How it works, from the outside in:

- `loop()` takes the name you typed, turns it into uppercase, then **processes its letters one by one** with a `for` loop.
- `sendLetter()` finds the **position** of that letter in the alphabet with `LETTERS.indexOf(letter)` — A = 0, B = 1, N = 13, and so on — then opens the **drawer with the same number** in the `MORSE` array. Two lists kept in matching order like this are a very common trick.
- The second loop (the `for` inside `sendLetter`) reads the Morse code one sign at a time: dot → `blink(SHORT)`, dash → `blink(LONG)`.
- `return;` at the start of `sendLetter()` means "stop here and leave the function" — used when the letter isn't A–Z.

### Practice 5 — Temperature array: average, highest, lowest (15 minutes)

> 🖥️ **Tool:** Wokwi — a new ESP32 project, or any project (this practice doesn't use the LEDs).

1. Clear `sketch.ino` (**Ctrl + A**, then **Delete**), paste this code (original file: [`code/module03_average_temperature/module03_average_temperature.ino`](code/module03_average_temperature/module03_average_temperature.ino)), then click **▶**:

   ```cpp
   // Module 3 - Practice 5: sample temperature array -> average, highest, lowest
   // No circuit needed: the results only appear in the Serial Monitor.

   const int DAY_COUNT = 7;

   // Daytime temperatures over 7 days (sample data, not from a sensor)
   float temperature[DAY_COUNT] = {28.5, 29.1, 30.4, 31.2, 29.8, 27.6, 28.9};
   String day[DAY_COUNT] = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

   // A function with a return value: adds up the whole array, then divides by the number of values.
   float computeAverage(float data[], int count) {
     float total = 0;
     for (int i = 0; i < count; i++) {
       total = total + data[i];
     }
     return total / count;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("This week's temperatures:");

     // Print the array's contents one by one. Remember: drawer numbers start at 0.
     for (int i = 0; i < DAY_COUNT; i++) {
       Serial.print("  ");
       Serial.print(day[i]);
       Serial.print(": ");
       Serial.print(temperature[i], 1);  // 1 digit after the decimal point
       Serial.println(" C");
     }

     // Find the drawers with the highest and the lowest temperature.
     int highestDrawer = 0;
     int lowestDrawer = 0;
     for (int i = 1; i < DAY_COUNT; i++) {
       if (temperature[i] > temperature[highestDrawer]) {
         highestDrawer = i;
       }
       if (temperature[i] < temperature[lowestDrawer]) {
         lowestDrawer = i;
       }
     }

     Serial.print("Average : ");
     Serial.print(computeAverage(temperature, DAY_COUNT), 2);
     Serial.println(" C");
     Serial.print("Highest : ");
     Serial.print(temperature[highestDrawer], 1);
     Serial.println(" C (" + day[highestDrawer] + ")");
     Serial.print("Lowest  : ");
     Serial.print(temperature[lowestDrawer], 1);
     Serial.println(" C (" + day[lowestDrawer] + ")");
   }

   void loop() {
   }
   ```

2. The Serial Monitor prints the temperatures for all seven days, then `Average : 29.36 C`, `Highest : 31.2 C (Thursday)`, and `Lowest  : 27.6 C (Saturday)`.

Notice three things:

- `DAY_COUNT` is used in five places. Want to add an eighth day? Change the number to 8, then add one temperature **and** one day name. Try it now.
- How to find the highest: assume drawer 0 is the highest, then compare it with the drawers after it. Each time one is higher, write down its number. That's why the loop starts at `i = 1`.
- `computeAverage(temperature, DAY_COUNT)` hands the **whole** array to the function as an ingredient, plus how many values it holds — a function can't figure out by itself how many drawers there are.

### Practice 6 — `struct SensorReading`: one form, lots of data (15 minutes)

> 🖥️ **Tool:** Wokwi — a new ESP32 project, or any project.

1. Clear `sketch.ino` (**Ctrl + A**, then **Delete**), paste this code, then click **▶** (original file: [`code/module03_sensor_reading/module03_sensor_reading.ino`](code/module03_sensor_reading/module03_sensor_reading.ino)):

   ```cpp
   // Module 3 - Practice 6: struct SensorReading
   // One "form" holding several sensor values at once. The values are still fake (random);
   // real sensors are connected starting in Module 6. The field names deliberately match the
   // project's data contract (Syllabus Appendix A): temperature, humidity, light, motion.

   struct SensorReading {
     float temperature;  // degrees Celsius
     int humidity;       // percent
     int light;          // 0-4095 (later from a light sensor)
     bool motion;        // true = motion detected (later from a PIR motion sensor)
   };

   // A function that returns one complete form filled with random numbers.
   SensorReading readFakeSensor() {
     SensorReading b;
     b.temperature = random(250, 330) / 10.0;  // 25.0 to 32.9
     b.humidity = random(55, 85);              // 55 to 84
     b.light = random(0, 4096);                // 0 to 4095
     b.motion = (random(0, 2) == 1);           // true or false
     return b;
   }

   // A function that takes one form and prints it neatly.
   void printReading(SensorReading b) {
     Serial.print("temperature=");
     Serial.print(b.temperature, 1);
     Serial.print(" C  humidity=");
     Serial.print(b.humidity);
     Serial.print(" %  light=");
     Serial.print(b.light);
     Serial.print("  motion=");
     if (b.motion) {
       Serial.println("yes");
     } else {
       Serial.println("no");
     }
   }

   int readingNumber = 0;

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("Sensor readings (fake) every 2 seconds:");
   }

   void loop() {
     SensorReading reading = readFakeSensor();  // fill in a new form
     readingNumber = readingNumber + 1;
     Serial.print("#");
     Serial.print(readingNumber);
     Serial.print("  ");
     printReading(reading);
     delay(2000);
   }
   ```

2. Every 2 seconds a line appears, for example `#1  temperature=27.9 C  humidity=81 %  light=784  motion=no`. The numbers are random, so yours will certainly be different.

Things to notice:

- A function can **return a whole form** (`SensorReading readFakeSensor()`) and can **take a whole form** as an ingredient (`printReading(SensorReading b)`). Imagine it without a `struct`: that function would need four separate ingredients.
- `random(250, 330)` gives a random whole number from 250 to **329** (the second number isn't included). Divided by `10.0`, the result is 25.0 to 32.9 — a trick for making random decimals.
- Try adding a field `int soil;` (soil moisture, for the plants later on), fill it in `readFakeSensor()`, and print it in `printReading()`. That's three places to change. If you forget to add the field to the `struct`, the compiler complains (`has no member named 'soil'`). But if you forget to fill it in, the compiler says nothing and a nonsense number gets printed — so check all three yourself.

### Practice 7 — Specific library versions and built-in examples (25 minutes)

> 🖥️ **Tools:** **Arduino IDE** (part A; a real board is optional) and **Wokwi** (part B).

> 📌 Practices 7–9 use [Concepts 9, 11, and 12](#9-const-define-comments-and-tidy-style). Haven't read them yet? Read them first, about 20 minutes.

We'll install the **ArduinoJson** library — a writer and reader of the JSON format, the "letter format" the ESP32 will later use to talk to the server (Modules 10–11). We lock its version at **7.4.3**.

**A. In Arduino IDE: install a specific version, then open its built-in example**

1. Click the **Library Manager** icon in the left sidebar (the third icon from the top, a picture of books). Another way: **Tools → Manage Libraries…** (**Ctrl + Shift + I**).
2. In the search box, type **ArduinoJson**. Choose the entry **ArduinoJson by Benoit Blanchon** — careful, there are other libraries with similar names.
3. Below that entry there's a version menu (showing the newest version number) and an **INSTALL** button. Make sure the version menu shows **7.4.3**. If a newer version already exists, click that menu and choose 7.4.3 from the list. Then click **INSTALL**.
4. Wait for three signs that it's done: the notification `Successfully installed library ArduinoJson:7.4.3` appears briefly at the bottom right, the **Output** panel at the bottom ends with `Installed ArduinoJson@7.4.3`, and the ArduinoJson entry now says `7.4.3 installed`. If you later see the notification `Updates are available for some of your libraries.`, click **Later** — we're staying on 7.4.3 on purpose.

   ![Illustration of the Arduino IDE 2 Library Manager: the books icon in the left sidebar is highlighted, the search box holds ArduinoJson, the entry ArduinoJson by Benoit Blanchon, the version menu open with 7.4.3 selected, the INSTALL button, the Output panel ending with Installed ArduinoJson@7.4.3, the notification Successfully installed library ArduinoJson:7.4.3 at the bottom right, and a note box showing the text 7.4.3 installed once the library is installed](assets/ide-library-manager-arduinojson.png)

5. Open its built-in example: **File → Examples**, scroll to the **Examples from Custom Libraries** group, then **ArduinoJson → JsonGeneratorExample**. The example opens in a new window.

   ![Illustration of the File, Examples menu in Arduino IDE 2: the groups Built-in examples, Examples for any board, Examples for DOIT ESP32 DEVKIT V1, and Examples from Custom Libraries; in the last group, ArduinoJson is open and JsonGeneratorExample is highlighted; a note beside it explains that the Examples for DOIT ESP32 DEVKIT V1 group only appears once a board is selected](assets/ide-built-in-examples.png)

6. **Read before you run.** The comments in that example explain every step and even write down the expected result. One thing needs changing: the example uses `Serial.begin(9600);`. Change it to **`Serial.begin(115200);`** so it matches our habit (and the ESP32's boot messages).
7. Click **Verify** (✓). Even without a board, the compile should succeed — that's the sign the library is installed correctly. The first compile can take 1–3 minutes; wait until `Done compiling.` appears. (Kit hasn't arrived and you've never selected a board? Click **Select Board → Select other board and port…**, choose **DOIT ESP32 DEVKIT V1** without choosing a port, then **OK**. That's enough for **Verify**.)
8. Have a board? Click **Upload**, open the Serial Monitor (115200 baud), then press **EN**. The result is JSON in two versions — one compact line and one neatly indented version:

   ```text
   {"sensor":"gps","time":1351824120,"data":[48.75608,2.302038]}
   {
     "sensor": "gps",
     "time": 1351824120,
     "data": [
       48.75608,
       2.302038
     ]
   }
   ```

   The comment in that example says `48.756080`, while what gets printed is `48.75608` — the trailing zero isn't printed, but the value is the same. No board? After part B, you can run this example in Wokwi: in the example window, press **Ctrl + A** then **Ctrl + C**, open the Wokwi project from part B, clear `sketch.ino`, paste, then click **▶**.

**B. In Wokwi: libraries through `libraries.txt`**

1. Open a new ESP32 project in Wokwi. Click the **Library Manager** tab above the editor, then the light-blue round **+** button in the dark **Library Manager** panel (**Add a new library**) — not the + button in the simulation panel, which is for adding parts.
2. Type **ArduinoJson**, then click the result. ArduinoJson appears in the **Installed Libraries** list, and a new tab called **`libraries.txt`** appears. (Wokwi's **Library Manager** panel really is dark, even though the editor is light.)
3. Click the **`libraries.txt`** tab. The top two lines starting with `#` are just notes from Wokwi — leave them as they are. Change the `ArduinoJson` line to **`ArduinoJson@7.4.3`** — the `@` sign locks the version. (Without `@`, Wokwi uses the latest version.)

   ![Three cropped Wokwi screenshots. Steps 1–2: the Library Manager tab, the round + button, and the search box holding ArduinoJson with its result. The result: ArduinoJson in the Installed Libraries list and the libraries.txt tab that appears to the right of the Library Manager tab. Step 3: the contents of libraries.txt, made up of two note lines starting with a hash sign, one blank line, and the line ArduinoJson@7.4.3](assets/wokwi-library-manager.png)

   *Screenshot of [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, markers by the author.*
4. Click the **`sketch.ino`** tab, delete its default contents (**Ctrl + A**, then **Delete**), then paste this code (original file: [`code/module03_json_reading/module03_json_reading.ino`](code/module03_json_reading/module03_json_reading.ino)). This code turns the `SensorReading` form from Practice 6 into JSON:

   ```cpp
   // Module 3 - Practice 7 (extra step): struct SensorReading -> JSON with the ArduinoJson library
   // Needs ArduinoJson version 7.4.3 (install it with the Library Manager; in Wokwi via libraries.txt).
   // The result resembles the project's "telemetry" message (data contract, Syllabus Appendix A), sent from Module 11 on.

   #include <ArduinoJson.h>  // the gateway to the ArduinoJson library

   struct SensorReading {
     float temperature;
     int humidity;
     int light;
     bool motion;
   };

   SensorReading readFakeSensor() {
     SensorReading b;
     b.temperature = random(250, 330) / 10.0;
     b.humidity = random(55, 85);
     b.light = random(0, 4096);
     b.motion = (random(0, 2) == 1);
     return b;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("Sensor readings (fake) in JSON format:");
   }

   void loop() {
     SensorReading reading = readFakeSensor();

     JsonDocument doc;  // an empty JSON "envelope"
     doc["temperature"] = reading.temperature;
     doc["humidity"] = reading.humidity;
     doc["light"] = reading.light;
     doc["motion"] = reading.motion;

     serializeJson(doc, Serial);  // write the JSON to the Serial Monitor
     Serial.println();            // move to a new line
     delay(2000);
   }
   ```

5. Click **▶**. Every 2 seconds a line of JSON appears, for example `{"temperature":27.7,"humidity":55,"light":4079,"motion":false}`. Compare it with the sample `telemetry` message (the report of sensor readings that's sent regularly) in [Syllabus Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract): the field names are the same. That's the shape of the "letter" that Node 1 will send to the server starting in Module 11.

> [!TIP]
> **Forgot to install the library?** Try removing ArduinoJson from Wokwi's Library Manager (the trash can icon), then click **▶**. You get `fatal error: ArduinoJson.h: No such file or directory` — the most common message for a library that isn't installed — and Wokwi offers a button to install it. In Arduino IDE, the message is the same; the fix is the Library Manager. Once you've tried it, install ArduinoJson again and make sure `libraries.txt` says `ArduinoJson@7.4.3` again.

### Practice 8 — Completion project: a 3-LED traffic light (30–45 minutes)

> 🖥️ **Tools:** the Wokwi project from Practice 3 (the 3-LED circuit) and **Arduino IDE** to save your code (step 5). Optional: a real board + 2 extra LEDs.

This is the requirement to pass this module: a traffic light program that **you write yourself**. The specification:

| Order | Light that's on | Duration | Message in the Serial Monitor |
| :---: | :--- | :--- | :--- |
| 1 | **Red** (D4) | 5 seconds | `RED    - stop` |
| 2 | **Green** (D18) | 4 seconds | `GREEN  - go ahead` |
| 3 | **Yellow** (D19) | 2 seconds | `YELLOW - careful, red is coming soon` |
| | then repeat from number 1 | | |

The order is the same as the traffic lights on Indonesian roads: red → green → yellow → red. At each step, **only one light** is on. You may change the durations as long as the order is right.

1. Open the Practice 3 Wokwi project. If the project wasn't saved, create a new ESP32 project and paste its [`diagram.json`](code/wokwi-traffic-light/diagram.json) again.
2. Clear `sketch.ino` and **write the program yourself**. Step-by-step hints:
   - Create three constants for the pin numbers: 4, 18, and 19 (Concept 9). Green on 18 and yellow on 19 — the same as in Module 1.
   - In `setup()`: `Serial.begin(115200);` and `pinMode(…, OUTPUT);` for all three pins.
   - In `loop()`: for each step, print the message, turn on the right light, turn off the other two, then wait with `delay(…)`.
   - To keep `loop()` short, write a function `setLamp(bool red, bool yellow, bool green)` that sets all three lights at once (Concept 6). In `digitalWrite`, `true` means the same as `HIGH`, and `false` the same as `LOW`.
   - `delay()` uses **milliseconds**: 5 seconds = `delay(5000)`.
   - Write pin numbers as plain numbers: `4`, not `D4`.
   - Every statement (`Serial.println`, `digitalWrite`, `delay`) must be **inside** the `{ … }` of `setup()`, `loop()`, or your function. Outside the functions there are only constants, variables, and new functions. The `setLamp` function itself is written **outside** `setup()` and `loop()`, namely above `setup()`, like `turnOnLed` in Practice 3.
   - The order of `setLamp`'s parameters is red, **yellow**, green — like a traffic light pole from top to bottom — not the order of the LEDs on the breadboard.
3. Click **▶** and check it against the table above. The most common slip: forgetting to turn off the previous light, so two lights are on at the same time.
4. Working? Take a **screenshot** of Wokwi while one of the lights is on (Windows: **Win + Shift + S**; macOS: **Cmd + Shift + 4**), then save it and rename it `traffic-light-wokwi.png` (the same way as in [Module 1 Step 5](../module-01-big-picture-iot/README.md#step-5--capture-your-win)). Trick: click Wokwi's pause button **‖** while the light you want is on. You'll need this picture in Practice 9.
5. Save your code in Arduino IDE with the name **`module03_traffic_light`** (see the **Tip** box at the start of the practice section).

<details>
<summary><b>Sample answer — open it only after your program works (or after 45 minutes of trying)</b></summary>

This is one way to write it, not the only one. If your program is different but the lights turn on as in the table, you're still right. Original file: [`code/module03_traffic_light/module03_traffic_light.ino`](code/module03_traffic_light/module03_traffic_light.ino).

```cpp
// Module 3 - Practice 8: 3-LED traffic light (SAMPLE ANSWER)
// Try writing your own version first; open this file only to compare.
// Circuit: red on D4, green on D18, yellow on D19 (same as Module 1). Its Wokwi diagram
// is in the wokwi-traffic-light folder. The order is the one used on Indonesian roads:
// red -> green -> yellow -> red.

const int PIN_RED = 4;      // red LED    (labeled D4 on the board)
const int PIN_GREEN = 18;   // green LED  (D18)
const int PIN_YELLOW = 19;  // yellow LED (D19)

const int RED_TIME = 5000;     // milliseconds
const int GREEN_TIME = 4000;
const int YELLOW_TIME = 2000;

// One function to set all three lights at once.
// true means the same as HIGH (on), false the same as LOW (off).
void setLamp(bool red, bool yellow, bool green) {
  digitalWrite(PIN_RED, red);
  digitalWrite(PIN_YELLOW, yellow);
  digitalWrite(PIN_GREEN, green);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_RED, OUTPUT);
  pinMode(PIN_YELLOW, OUTPUT);
  pinMode(PIN_GREEN, OUTPUT);
  Serial.println();
  Serial.println("Traffic light ready.");
}

void loop() {
  Serial.println("RED    - stop");
  setLamp(true, false, false);
  delay(RED_TIME);

  Serial.println("GREEN  - go ahead");
  setLamp(false, false, true);
  delay(GREEN_TIME);

  Serial.println("YELLOW - careful, red is coming soon");
  setLamp(false, true, false);
  delay(YELLOW_TIME);
}
```

</details>

**On a real board (optional).** The Module 2 circuit already has a red LED on D4. **Unplug the USB first**, then add two LEDs with the same pattern, each shifted 12 columns to the right:

![The traffic-light circuit on a Wokwi breadboard, seen from above, with all three LEDs turned on together on purpose for this picture: the ESP32 board in columns 4 to 18; the red LED (resistor 24i and 30i, long leg 30h, short leg 31h) through a green wire from 8j (D4) to 24j; the green LED (resistor 36i and 42i, legs 42h and 43h) through a blue wire from 12j (D18) to 36j; the yellow LED (resistor 48i and 54i, legs 54h and 55h) through an orange wire from 13j (D19) to 48j; four black wires from 5j (GND), 31j, 43j, and 55j to the blue rail; plus one short black bridge wire for the blue rail, from the hole below column 30 to the hole below column 33, across the center channel; labels around the picture say where each wire goes, for example green wire to the red LED](assets/traffic-light-circuit.png)

*Picture made with the [Wokwi](https://wokwi.com) simulator so the hole positions are exact. Screenshot © Wokwi (CodeMagic LTD), October 2026; used for educational purposes, labels by the author. The hole layout of your real breadboard is usually the same.*

| LED | Signal wire | 220 Ω resistor | Long / short leg | Black wire |
| :--- | :--- | :--- | :--- | :--- |
| Red (already there) | 8j → 24j | 24i and 30i | 30h / 31h | 31j → blue rail |
| **Green** (new) | **12j** (below D18) → **36j** | **36i** and **42i** | **42h** / **43h** | **43j** → blue rail |
| **Yellow** (new) | **13j** (below D19) → **48j** | **48i** and **54i** | **54h** / **55h** | **55j** → blue rail |

Also add **one short black wire** that connects the left and right halves of the blue rail: plug one end into the blue-rail hole below **column 30** (the hole below column 31 is already used by the red LED's black wire) and the other end into the blue-rail hole below **column 33**, on the other side of the center channel. Is the column 30 hole already taken, or are your blue-rail holes shifted by one column? Use the nearest empty hole; what matters is that one end is to the left of the gap and the other end is to the right of it. On some breadboards, this rail is split in the middle (Module 2 Concept 4); the bridge wire connects the green and yellow LEDs to GND as well. Already did Module 2's Level 2 Challenge? Your green LED is already in place — just add the yellow LED (and the bridge wire, if it isn't there yet).

The order of the LEDs on the breadboard (red, green, yellow) is indeed different from the order of the lights on a traffic light pole — we're following the pins from Module 1. What matters is that the program lights them in the right order. Plug in the USB cable, open your sketch in Arduino IDE, then click **Upload**. Stuck at `Connecting…`? Hold **BOOT** as soon as that text appears, and release it when `Writing at …` starts running.

### Practice 9 — GitHub Desktop: clone, commit, push (30–45 minutes, one-time setup)

> 🖥️ **Tools:** a laptop + internet, a browser for the download, then the **GitHub Desktop** and **Arduino IDE** apps. A download of about 310 MB.

#### 9.1 Install GitHub Desktop

1. Open **https://desktop.github.com** in your browser, then click **Download for Windows**. Mac users: choose **Download for macOS (Silicon)** for Macs with an Apple M1 chip or later, or **Download for macOS (Intel)** for older Macs. (How to check: Apple menu → **About This Mac**. A line `Chip Apple M…` means Silicon; a line `Processor … Intel` means Intel.)
2. **Windows:** double-click the downloaded file (usually in the *Downloads* folder; its name starts with `GitHubDesktopSetup`). There are no questions at all; GitHub Desktop installs and opens right away. **macOS:** double-click the `.zip` file (if you use Safari, it has usually been opened automatically), drag **GitHub Desktop** into the *Applications* folder, then open it from there. If a warning says this app was downloaded from the internet, click **Open**.

<details>
<summary><b>Linux or macOS 12 users</b> — GitHub Desktop doesn't support Linux yet, and the versions after 3.6.6 no longer support macOS 12</summary>

Official GitHub Desktop is only available for Windows and macOS (the versions after 3.6.6 need macOS 13 or later). Your options:

1. **Stay with the browser** (Linux and macOS 12), as in Modules 1–2: in the `learn-iot` repository, click **Add file → Upload files**, drag in the Module 3 files, then **Commit changes**. This also makes a commit and counts for the requirement to pass.
2. **With the Terminal — Linux only** (if you want to go further): install Git and GitHub CLI with `sudo apt install git gh`, sign in with `gh auth login` (follow the prompts; choose **GitHub.com** and **HTTPS**), then run `gh repo clone YOUR-USERNAME/learn-iot` and `cd learn-iot`. Just once, set your Git identity: `git config --global user.name "Your Name"` and `git config --global user.email "ADDRESS@users.noreply.github.com"` (the full address is on GitHub → **Settings → Emails**). After copying files into that folder: `git add .`, then `git commit -m "Module 3: traffic light"`, then `git push`. These commands are covered in more depth in Module 16.
3. **macOS 12: install GitHub Desktop 3.6.6.** As long as the macOS download button still gives you version 3.6.6, install it as usual. If it has already switched to a newer version, open the [3.6.6 release page](https://github.com/desktop/desktop/releases/tag/release-3.6.6), then under **Assets** download `GitHub.Desktop-arm64.zip` (Silicon) or `GitHub.Desktop-x64.zip` (Intel), and follow step 2 above. This version won't update itself to a version that doesn't work on macOS 12.

</details>

#### 9.2 Sign in to your GitHub account and set up your Git identity

1. The first time it opens, GitHub Desktop shows **Welcome to GitHub Desktop**. Click **Sign in to GitHub.com**.
2. Your browser opens a GitHub page. Sign in to your account (if you haven't yet), then approve access for GitHub Desktop with the green button (usually labeled **Authorize desktop**). If the browser asks `Open GitHub Desktop?`, click **Open GitHub Desktop** (or **Open**). You're back in the app.
3. The **Configure Git** screen appears. Choose **Use my GitHub account name and email address**, then click **Finish**.

> [!IMPORTANT]
> **Set up email privacy now, before your first commit (9.5).** Every commit records its author's name and email, and in a public repository anyone can see that record — forever. It's best to use a stand-in address from GitHub:
>
> 1. On the GitHub website: profile picture → **Settings → Emails** → tick **Keep my email addresses private**. Leave the **Block command line pushes that expose my email** box unticked for now.
> 2. In GitHub Desktop: **File → Options → Git** (macOS: **GitHub Desktop → Settings → Git**), choose the email ending in **`@users.noreply.github.com`** in the **Email** menu, then click **Save**. Not in the menu yet? Close GitHub Desktop, open it again, then repeat.

#### 9.3 Clone the `learn-iot` repository to your laptop

1. In GitHub Desktop, choose **File → Clone repository…**; the **Clone a repository** window opens.
2. On the **GitHub.com** tab, click **learn-iot** in the **Your repositories** list. Not there? Click the button with the circular arrow icon next to the **Filter your repositories** box to reload the list.
3. Look at the **Local path** field: that's where the folder for the copy will be created — usually `C:\Users\YOURNAME\Documents\GitHub\learn-iot` (macOS: `/Users/YOURNAME/Documents/GitHub/learn-iot`). Leave it, or click **Choose…** to pick another place. If the path contains `OneDrive`, it's better to click **Choose…** and pick a folder outside OneDrive (for example `C:\Users\YOURNAME\GitHub`), because repositories in folders synced by OneDrive are prone to conflicts. **Write down the location.**
4. Click **Clone**. A few seconds later, the name `learn-iot` appears at the top left (**Current repository**).

![Illustration of the Clone a repository window in GitHub Desktop: the GitHub.com tab is selected, the learn-iot repository is highlighted in the Your repositories list, the Local path field holds the folder path Documents\GitHub\learn-iot with a Choose button, the Clone button is at the bottom right, and a legend reminds you that Local path is a new folder, not the old learn-iot folder from Module 1](assets/github-desktop-clone.png)

> [!WARNING]
> **Don't mix them up.** Since Module 1 you've had an ordinary folder called `learn-iot` (for example in *Documents*). That folder is **not** a repository, so GitHub Desktop doesn't watch it. From now on, save everything in the cloned folder (usually `Documents\GitHub\learn-iot`). So you don't mix them up, rename the old folder to `learn-iot-old`. Don't pick that old folder with **Choose…** — Git can only copy into an empty folder.

#### 9.4 Put the Module 3 code into the repository folder

The `learn-iot` folder on your laptop is now a "magic folder": anything that changes inside it will be noticed by GitHub Desktop.

1. Save your traffic light sketch into the repository folder:
   1. In Arduino IDE, open the sketch: **File → Sketchbook → module03_traffic_light** (or **File → Open Recent**).
   2. Click **Verify** (✓) once to make sure the code compiles.
   3. Choose **File → Save As…**. In the save window, click **Documents** in the left panel, double-click **GitHub**, then double-click **learn-iot** (or open the other location you wrote down in 9.3).
   4. Click the **New folder** button at the top of the window (macOS: first expand the window with the arrow button next to the name box, then click **New Folder**). Name it **`module-03`**, then double-click that folder.
   5. Type the name **`module03_traffic_light`**, then click **Save**. Arduino IDE automatically creates a `module03_traffic_light` folder containing the `.ino` file.
2. Repeat for any other sketches you want to keep (calculator, Morse, and so on) — still into the `module-03` folder.
3. In GitHub Desktop, click **Repository → Show in Explorer** (macOS: **Show in Finder**); the right repository folder opens straight away. Go into `module-03`, then copy the file **`traffic-light-wokwi.png`** (the screenshot from Practice 8) into it. Forgot where you saved it? Look in the `learn-iot-old` folder, in *Pictures → Screenshots* (Windows), or on the *Desktop* (macOS).

#### 9.5 Commit: taking a snapshot of your progress

1. Go back to GitHub Desktop. The **Changes** tab on the left now lists the new files (marked with a green **+**), each with a checkbox that's already ticked. macOS users: if a `.DS_Store` file shows up, untick it — it's a bookkeeping file that belongs to Finder.
2. At the bottom left, fill in the summary box (**Summary**) with a short note, for example **`Module 3: traffic light and C++ exercises`**. The **Description** box below it can stay empty.
3. Click the blue **Commit … to main** button — its text mentions the number of files, for example **Commit 6 files to main**. The **Changes** list is empty again: the snapshot has been saved on your laptop.

![Illustration of GitHub Desktop after new files are added: the Changes tab lists six files in the module-03 folder, marked with a green plus and a checkbox; on the right, the contents of your own version of the traffic light file (its comment line reads: Written on my own by: Ani), with every line green because it's new; the Summary box at the bottom left holds Module 3: traffic light and C++ exercises; the blue Commit 6 files to main button; and below that, the top bar after the commit, with a Push origin button showing the number 1](assets/github-desktop-commit-push.png)

#### 9.6 Push: uploading to GitHub

1. In the top bar, the button that said **Fetch origin** now says **Push origin**, with a small number (the number of commits that haven't been uploaded yet). Click that button. (*origin* is Git's nickname for your repository on GitHub, and *main* is the main line of history, where all your commits go.)
2. When it's done, the button goes back to **Fetch origin**.
3. Click **Repository → View on GitHub** (**Ctrl + Shift + G**) to open the `learn-iot` repository in your browser. The `module-03` folder is there, complete with your code and screenshot. **Requirement to pass: met.**

From now on, the rhythm is always the same: **change files → commit (with a clear note) → *push***. One commit per small step is better than one giant commit at the end of the week.

---

## 🚨 Troubleshooting

This week most problems are in the **code**, not the wires — and the good news is that the compiler almost always tells you where. **Stuck right now? Skip the table below** — the list of symptoms (clickable collapsible titles) comes right after it. This table sums up **"what you often find in other tutorials → what's right for our versions"**:

| What you often find in other tutorials | What's right for this curriculum | Why |
| :--- | :--- | :--- |
| "`int` only goes up to 32,767" | On the ESP32, `int` goes up to about ±2.1 billion | The number 32,767 applies to the Arduino UNO (an 8-bit chip). The ESP32 is a 32-bit chip; see 🔬. |
| `StaticJsonDocument<200> doc;` / `DynamicJsonDocument doc(1024);` | `JsonDocument doc;` | That's the ArduinoJson version 6 way. In version 7 (the one we use), the size is managed automatically. |
| `Serial.begin(9600);` (including in many built-in examples) | `Serial.begin(115200);` | The ESP32's standard speed. If you keep 9600, the boot messages turn into random characters and the Serial Monitor has to be set to 9600. |
| `#define LED_PIN 4;` | `const int PIN_LED = 4;` | `#define` must not end with `;`. `const` is safer and is checked by the compiler. |
| `git` commands on the command line for everything | GitHub Desktop (Windows/macOS) | We learn the concepts with buttons first. The command line is covered in Module 16. |
| `delay()` used everywhere, even in big programs | `delay()` is fine for this week | `delay()` makes `loop()` stop and wait; meanwhile your program can't react (typed input is only processed after the pause is over). The way to wait without falling asleep (`millis()`) is covered in Module 8. |

<details>
<summary><b><code>Build failed!</code> / <code>Compilation error</code> — the most common error messages</b></summary>

Remember the rule: **look at the line number**, fix **only the first error**, then run again.

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `expected ';' before …` | A semicolon is missing **at the end of the line whose number is given** (for example, `:13:` means the end of line 13). The word after `before` is the start of the **next** statement, where the compiler only just noticed. | Add `;` at the end of that line. |
| `'x' was not declared in this scope` | The name `x` hasn't been created, is misspelled, has the wrong capitalization, or was created in another block (Concept 2). | Read the `did you mean …?` suggestion; match the spelling; move the variable to the top of the sketch if it's used in several functions. |
| `expected '}' at end of input` / `a function-definition is not allowed here` | The curly braces don't pair up, **or** a function was written inside another function (for example `void setLamp(…) { … }` inside `loop()`). | Look for `note: to match this '{'`. In Arduino IDE, press **Ctrl + T** (Auto Format; in Wokwi that shortcut opens a new browser tab instead) — a block whose indentation looks odd usually marks the missing brace. If there's a function inside a function, move the whole thing above `setup()`. |
| `invalid conversion from 'const char*' to 'int'` | Text was put into a number jar (or the other way around). | Check the variable's type; to turn text into a number, use `.toInt()` or `.toFloat()`. |
| `'SensorReading' does not name a type` | The type name is unknown: a typo, or the `struct` is written **below** the place where it's used. | Move the `struct` to the very top of the sketch. |
| `'Serial0' does not name a type` / `expected constructor, destructor, or type conversion before '(' token` | A statement was written outside a function, for example `Serial.begin(…)` or `digitalWrite(…)` at the top of the sketch. (`Serial0` is the real name of `Serial` in version 3 of the esp32 package.) | Move that statement into `setup()` or `loop()`. Outside functions you may only have `#include`, constants, variables, `struct`s, and your own functions. |
| `redefinition of 'void setup()'` / `redefinition of 'void loop()'` | There are two `setup()`s or two `loop()`s — usually because code was pasted below the default skeleton without deleting the skeleton first. | **Ctrl + A**, **Delete**, then paste the code again. |
| `fatal error: ArduinoJson.h: No such file or directory` | The library isn't installed. | Install it with the Library Manager (Arduino IDE) or the Library Manager tab (Wokwi) — Practice 7. |
| `expected ')' before …` / `expected primary-expression before …` | The parentheses don't pair up, or a punctuation mark is in the wrong place. | Count the `(` and `)` on that line. |
| `extended character “ is not valid in an identifier` (in older tools: `stray '\342' in program`) | There are "smart" quotation marks (“ ”) copied from a messaging app or Word. | Copy the code again from the code box on this page, or retype the quotation marks. |

</details>

<details>
<summary><b>The calculator gives strange results</b></summary>

- `7/2` gives `3` or `3.00`? You used `int` instead of `float` for `number1`/`number2`/`result` — remember Surprise 1 in Concept 3.
- Typed `12 x 5`? The multiplication sign in C++ and in this calculator is `*`, not the letter `x`.
- Typed `12,5 + 1`? Use a point: `12.5 + 1`.
- Nothing happens after you press **Enter**? Make sure you're typing in the **input box in the very bottom row of the Serial Monitor** (Wokwi) or in the **Message** box at the top of the Serial Monitor panel (Arduino IDE), not in the code editor.
- The result is always `0.00`? Check the `toFloat()` lines — maybe `substring` cuts in the wrong place. Print `question`, `position`, `number1`, and `number2` with `Serial.println(…)` to see what they hold.

</details>

<details>
<summary><b>The LED doesn't light up in Practice 3, 4, or 8</b></summary>

- **In Wokwi:** make sure `diagram.json` has been replaced with the contents of the file [`code/wokwi-traffic-light/diagram.json`](code/wokwi-traffic-light/diagram.json). A new ESP32 project has no LEDs at all.
- **The pin numbers in the code don't agree with the wires.** Red = 4, green = 18, yellow = 19. Swapping pins 18 and 19 is the most common mistake in Practice 8.
- **Forgot `pinMode(…, OUTPUT);`** for that pin in `setup()`. Without this line, on the ESP32 (esp32 package version 3) `digitalWrite` is ignored and the LED doesn't light up at all.
- **The lights change too fast or seem to be on at the same time:** you may have written the `delay` numbers in seconds. `delay(5000)` = 5 seconds.
- **On a real board:** see the collapsible section "The LED on the breadboard doesn't light up" in [🚨 Module 2](../module-02-electricity-and-first-upload/README.md#-troubleshooting). If the green and yellow LEDs don't light up while the red one does, the cause is almost certainly a blue rail that's split in the middle — add the bridge wire. Green LED on, but much dimmer than the others? That's normal for a bright green LED (its forward voltage is about 3 V; see 🔬 in Module 2). Your circuit isn't wrong.

</details>

<details>
<summary><b>The Serial Monitor is empty, shows random characters, or ignores what you type</b></summary>

- **Random characters** = the speeds don't match. Make `Serial.begin(…)` in the code match the baud selector in the Serial Monitor (Arduino IDE). In Wokwi, the speed matches automatically.
- **Empty in Arduino IDE:** open the Serial Monitor, then press **EN** on the board so the program starts from the beginning.
- **Completely empty, even in Wokwi:** make sure `setup()` contains `Serial.begin(115200);`.
- **What you type gets no reply:** a program only reads what you type if its `loop()` has `Serial.available()`. The Quick Win and Practices 3, 5, and 6 don't read typed input at all.
- **In Arduino IDE**, the line-ending selector next to the baud selector must be **New Line** (the default). If it's **No Line Ending**, `readStringUntil('\n')` waits until its time limit (1 second) before it processes what you typed.

</details>

<details>
<summary><b>The ESP32 keeps <i>restarting</i>, or <code>Guru Meditation Error</code> appears</b></summary>

A message like `Guru Meditation Error: Core 1 panic'ed (…)` means the program did something forbidden, and the chip restarted to save itself. The word in parentheses tells you what kind:

- `IntegerDivideByZero` — dividing a **whole number** (`int`) by zero, or taking the remainder (`%`) of a division by zero. Check the zero guard in your program, for example after adding `%` in the Level 1 Challenge.
- `LoadProhibited` / `StoreProhibited` — reading or writing memory that doesn't belong to the program, often because an array index is out of bounds: for example `day[7]` when the array only has drawers 0–6, or a loop condition `i <= 7` that should be `i < 7`. Check every `[ ]` and every `for` condition that touches an array.

</details>

<details>
<summary><b>GitHub Desktop: can't sign in, files don't show up, or the <i>push</i> is rejected</b></summary>

- **After *Sign in*, the browser doesn't take you back to the app:** in the browser, look for an **Open GitHub Desktop** button or link; if the browser blocks it, click **Allow** or let it open the app. Start again from **File → Options → Accounts → Sign into GitHub.com** (macOS: **GitHub Desktop → Settings → Accounts**).
- **New files don't show up in the *Changes* tab:** the file was saved outside the repository folder — most often in the **old** `learn-iot` folder from Module 1, or in *Documents/Arduino* (Arduino IDE's default save location). Use **File → Save As…** and point it at the cloned folder (Practice 9.4). In GitHub Desktop, **Repository → Show in Explorer** (macOS: **Show in Finder**) opens the right repository folder. Also check the **Current repository** box at the top left — another repository may be open, for example `mini-smart-home`.
- **The Commit button can't be clicked:** the summary box (**Summary**) is still empty, or not a single file is ticked.
- **A warning says your email doesn't match your account:** set it again in **File → Options → Git** (Practice 9.2).
- **`Newer commits on remote` appears when you push:** GitHub has commits that aren't on your laptop yet (for example, you uploaded something through the browser in the meantime). Click **Fetch**, then **Pull origin**, and only then **Push origin**.
- **You've committed, but nothing changed on GitHub:** it hasn't been pushed yet. Look at the button in the top bar; if it still says **Push origin**, click it.
- **Don't delete the `.git` folder** inside the repository folder (it's usually hidden). That's where the whole commit history is stored.

</details>

Still stuck after all that? Use the question template from [Module 1 Practice 6](../module-01-big-picture-iot/README.md#practice-6--asking-good-questions-including-asking-ai), and include **your complete code** and the **complete error message** (copy the text, not a photo of the screen).

> [!TIP]
> **The 2-hour rule** from Module 2 still applies. A problem still not solved after 2 hours? Write your question, send it, then take a break or work on another part.

---

## 🔬 Technical Deep Dive (optional)

This section is for anyone curious about what happens "behind the scenes". **You can skip it** — nothing in this section is required to pass.

<details>
<summary><b>What actually happens during compilation</b></summary>

When you press **Verify**, Arduino IDE (or the Wokwi server) runs several stages in order:

1. **Preparing the sketch.** The `.ino` file is turned into an ordinary C++ file (`.cpp`). Arduino adds `#include <Arduino.h>` at the very top, then creates a **forward declaration** (*prototype*) for each of your functions. That's why in Arduino you may call a function that's only written further down — in plain C++, that's an error.
2. **Preprocessing.** Every `#include` line is replaced with the contents of the file it names, and every `#define` is carried out as a "find and replace". This is where `Serial` is replaced with `Serial0` in version 3 of the esp32 package — that's why that name shows up in the error message in Practice 2.
3. **Compiling.** The `xtensa-esp32-elf-g++` compiler (GCC for the ESP32's Xtensa chip) translates each C++ file into machine code. The error messages you read come from this stage.
4. **Linking.** Your machine code is combined with the library code and the ESP32's "small operating system" (FreeRTOS and ESP-IDF) into one `.elf` file, which is then turned into a `.bin`.
5. **Size report.** The `Sketch uses … bytes` line you saw in Module 2 is calculated from that file.
6. **Uploading.** If you pressed **Upload**, esptool then writes that `.bin` into flash memory (Module 2 Concept 9).

</details>

<details>
<summary><b><code>String</code> vs <code>char[]</code>: why we'll use the second one more often later</b></summary>

In this module we use `String` because it's the easiest: you can join it with `+`, cut it with `substring()`, and search it with `indexOf()`. Behind the scenes, a `String` borrows memory from a place called the ***heap*** every time its contents change. In a program that runs for days and joins text often, all this borrowing and returning can leave the *heap* memory "full of holes" (fragmentation) — like a cupboard full of small gaps where big items no longer fit — and one day the ESP32 restarts for no obvious reason.

`char[]` is the old C-language way: a row of drawers holding characters, with a fixed size decided at the start (`char name[20];`), ending with one special drawer holding 0 as the "end of text" mark. It never borrows new memory, but it's more of a hassle to use (joining text takes functions like `snprintf`). For short programs like the ones in this module, `String` is safe. Starting in Module 8 (firmware that runs 24 hours a day) and Module 11 (MQTT messages), we switch to `char[]` in the parts that repeat often.

</details>

<details>
<summary><b>Data type sizes: ESP32 vs Arduino UNO</b></summary>

| Type | ESP32 (32-bit) | Arduino UNO (8-bit) |
| :--- | :--- | :--- |
| `int` | 4 bytes: ±2,147,483,647 | 2 bytes: ±32,767 |
| `long` | 4 bytes | 4 bytes |
| `float` | 4 bytes (about 7 significant digits) | 4 bytes |
| `double` | 8 bytes (about 15 significant digits) | 4 bytes (same as `float`) |
| `bool`, `char` | 1 byte | 1 byte |

Tutorials for the Arduino UNO often warn that an `int` "overflows" after 32,767 — for example, a time in milliseconds that suddenly turns negative. On the ESP32, the limit is much higher. Even so, overflow can still happen: an `int` on the ESP32 overflows after about 2.1 billion. That's why time (`millis()`, Module 8) is stored in an `unsigned long`. Want to check for yourself? `Serial.println(sizeof(int));` prints its size in bytes.

</details>

<details>
<summary><b>Why <i>array</i> indexes start at 0</b></summary>

To a computer, an index isn't "which drawer" but "how many steps from the first drawer". The first drawer is 0 steps away from itself, so its index is 0. The address of drawer `i` is calculated with a simple formula: starting address + `i` × the size of one drawer. This formula is fast, and that's why almost every programming language (C, C++, JavaScript, Python) starts indexes at 0.

</details>

<details>
<summary><b>Git behind the scenes: the <code>.git</code> folder and <i>commit</i> IDs</b></summary>

When you clone, Git creates a hidden folder called `.git` inside the repository folder. The whole history — every "photo" — is stored there in compressed form. Every commit gets a unique ID made of 40 hexadecimal characters (for example `c421504…`), calculated from the file contents and from the previous commit. As a result, history that has already been pushed is very hard to fake quietly. GitHub Desktop shows its first seven characters in the **History** tab.

</details>

---

## 🧩 Independent Challenges

Three levels. Do at least Level 1.

> 🖥️ **Tool:** Wokwi — Level 1 in the calculator project (Practice 1), Level 2 in the traffic light project (Practice 8), Level 3 in a new ESP32 project.

**Level 1 — A small change: the remainder operator.** Add the `%` (remainder) operator to the Practice 1 calculator. Hint: `%` only works on whole numbers, so first turn both numbers into `int` — for example `int a = number1;` — before calculating `a % b`. Don't forget to add one more search step, `indexOf('%', 1)`. Remember, the last `else` in the calculator's `if` chain means **divide** — add `else if (operation == '%') { … }` **before** that `else`. Also change the zero guard to `(operation == '/' || operation == '%') && number2 == 0` so the program is protected from dividing by zero. Careful: `0.5` becomes `0` after it's turned into an `int`, so for `%` also make sure `b` isn't 0 — otherwise a question like `7 % 0.5` makes the ESP32 restart (`IntegerDivideByZero`, see 🚨). Test it with `17 % 5`; the correct result: `17.00 % 5.00 = 2.00`.

**Level 2 — Fill in the blanks: a countdown.** Make the red light count down in the Serial Monitor (`5, 4, 3, 2, 1`) before it changes to green. Fill in the `___` parts of this function, then call `redCountdown(5);` in place of `setLamp(true, false, false); delay(RED_TIME);` in your traffic light program. (`remaining--` means "subtract 1 from `remaining`". Your program doesn't use `setLamp`? Copy that function from the Practice 8 sample answer first.)

```cpp
void redCountdown(int seconds) {
  setLamp(true, false, false);
  for (int remaining = ___; remaining >= ___; remaining--) {
    Serial.print("RED ");
    Serial.println(___);
    delay(___);
  }
}
```

The correct result: `RED 5`, `RED 4`, … `RED 1`, one line per second, then the light changes to green.

**Level 3 — From scratch: a week's log.** Make an array of 7 `SensorReading`s (combining Practices 5 and 6): `SensorReading weekLog[7];`. Fill each drawer with `readFakeSensor()` inside a loop, print all seven, then print the reading with the **highest temperature** together with its drawer number, and the week's **average humidity**. Watch out for Surprise 1: the sum of the humidity values is an `int`, so divide by `7.0`, not `7`. There's no answer key — if the numbers look sensible when you check them by eye, you're right.

Save your challenge code in the `module-03/` folder of the `learn-iot` repository — good commit and push practice at the same time.

---

## ➕ Add-on to "Mini Smart Home"

Module 3's contribution to the running project: the **project repository** and the **Node 1 program skeleton**.

Until now, the project code has been mixed in with the exercises in `learn-iot`. Starting this week, the Mini Smart Home project gets a home of its own. We create it with GitHub Desktop — a second way to create a repository, besides the browser.

> 🖥️ **Tools:** **GitHub Desktop** (from Practice 9), **Arduino IDE**, and a browser to copy the skeleton code. No board needed.

1. In GitHub Desktop: **File → New repository…** (**Ctrl + N**; macOS **Cmd + N**).
2. Fill in the **Create a new repository** window:
   - **Name:** `mini-smart-home`
   - **Local path:** leave it (usually the *Documents/GitHub* folder; if you chose another folder in 9.3, GitHub Desktop uses that folder automatically).
   - **Description:** `Mini Smart Home project - Fullstack IoT Developer curriculum`
   - Tick **Initialize this repository with a README**. Leave **Git ignore** (a list of files Git deliberately doesn't track — important once passwords show up in Module 10) and **License** set to **None**.
3. Click **Create repository**. This repository **only exists on your laptop so far**. GitHub Desktop now shows `mini-smart-home` in the **Current repository** box (top left). You now have two repositories; to switch between them, click that box and choose the name. **Always check this box before you commit.**
4. Put the Node 1 skeleton into this repository:
   1. Open [`code/node-1-home/node-1-home.ino`](code/node-1-home/node-1-home.ino) in a new tab (right-click the link → open it in a new tab), then click the **Copy raw file** copy icon at the top right of the file contents.
   2. In Arduino IDE, choose **File → New Sketch**, delete its default contents (**Ctrl + A**, then **Delete**), then paste (**Ctrl + V**).
   3. Click **Verify** (✓) and wait until `Done compiling.` appears — a sign the code is complete.
   4. Choose **File → Save As…**. In the save window, open **Documents** → **GitHub** → **mini-smart-home** (or the other folder you wrote down in 9.3). Click **New folder** (macOS: **New Folder**), name it `firmware`, double-click that folder, type the name `node-1-home`, then click **Save**.

   **Don't** create the `node-1-home` folder yourself — Arduino IDE creates it automatically. The end result: `mini-smart-home/firmware/node-1-home/node-1-home.ino`.
5. Back in GitHub Desktop: fill in **Summary** with `Node 1 skeleton v0.1.0`, then click **Commit 1 file to main**.
6. Click **Publish repository** in the top bar. In the **Publish repository** window, the **Description** box is already filled in with the sentence you wrote in step 2 — leave it. It's best to untick **Keep this code private** so this repository is public and can become part of your portfolio (just like `learn-iot`); this skeleton contains no secrets. You can change this choice at any time on the repository page: **Settings → General**, at the very bottom. Then click the **Publish repository** button at the bottom right of that window.
7. Check the result: **Repository → View on GitHub** (**Ctrl + Shift + G**). The page `github.com/YOUR-USERNAME/mini-smart-home` should show `README.md` and the `firmware` folder.
8. (Optional) Try running the skeleton: paste its contents into the Practice 3 Wokwi project, then click **▶**. The Serial Monitor writes `Node 1 Home - firmware 0.1.0`, followed by one line of readings about every 2 seconds, and the red LED blinks briefly.

![Illustration of GitHub Desktop: on the left, the Create a new repository window with Name mini-smart-home, Local path, Description, a tick in Initialize this repository with a README, Git ignore None, License None, and the Create repository button; top right, the Publish repository button in the top bar; on the right, the Publish repository window with the name mini-smart-home, the Description box already filled in automatically, the Keep this code private checkbox unticked, and the Publish repository button](assets/github-desktop-new-repo.png)

The `node-1-home.ino` skeleton holds **labeled shelves**, most of them still empty: `setupPins()` (Module 5), `readSensors()` (Modules 6–7), `showOnDisplay()` (Module 7), `controlActuators()` (Modules 5 and 19), `sendData()` (Modules 10–11), and `blinkStatus()` (Module 8). The program already runs: it prints a sample reading and blinks the D4 status LED every 2 seconds. Each following module fills in one or two shelves — and each time, you commit and push to this repository. The curriculum's reference version is in the [`mini-smart-home/`](../../mini-smart-home/README.md) folder.

> [!IMPORTANT]
> **Anyone can read a public repository.** This skeleton is safe. But starting in Module 10 there will be Wi-Fi passwords and secret keys — they **must not** go into the repository. How to keep them out is covered in Module 10.

---

## 📖 Glossary

| Term | Beginner-friendly meaning |
| :--- | :--- |
| ***Sketch*** | An Arduino program; one folder containing an `.ino` file with the same name. |
| **Compiler** | The "cook" that translates C++ code into machine code for the chip. |
| **Variable** | A "labeled jar" for storing one value that can change. |
| **Data type** | The kind of contents a variable holds: `int` (whole number), `float` (decimal), `bool` (yes/no), `String` (text), `char` (one character). |
| **Constant** (`const`) | A variable whose contents are locked and must not change. |
| **Operator** | An arithmetic (`+ - * / %`), comparison (`== != < >`), or logical (`&& \|\| !`) symbol. |
| **Branching** (`if`/`else`) | The part of a program that chooses a path based on a condition. |
| **Loop** (`for`, `while`) | The part of a program that is repeated several times or as long as a condition is met. |
| **Function** | A named "small recipe" that can be called again and again. |
| **Parameter** | An "ingredient" handed over when you call a function. |
| **Return value** (`return`) | The result a function hands back to the code that called it. `void` = no return value. |
| ***Array*** | A row of numbered drawers with one name; the numbers start at 0. |
| **Index** | The number of a drawer in an array. |
| **`struct`** | A "form" that groups several pieces of data, of different types, under one name. |
| **Global variable** | A variable created outside all functions; it can be used anywhere. |
| **Comment** | A note for humans inside the code, starting with `//`; ignored by the compiler. |
| ***Library*** | A collection of ready-made code written by other people; brought in with `#include`. |
| **Built-in example** | A sample sketch installed along with a library; found in **File → Examples**. |
| ***Debugging*** | Finding and fixing the cause of a mistake (a bug) in a program. |
| **Git** | A "time machine" that records every change to a folder's contents. |
| ***Clone*** | Copying a repository from GitHub to your laptop, complete with its history. |
| ***Commit*** | A snapshot of the folder together with a short note; stored on your laptop. |
| ***Push*** | Uploading new commits from your laptop to GitHub. |
| ***Fetch* / *pull*** | Fetch checks for and downloads news of new commits from GitHub without changing your folder; *pull* brings those new commits into the folder on your laptop. |
| ***origin* / *main*** | *origin*: Git's nickname for your repository on GitHub. *main*: the main line of history (branch) where your commits go. |
| **GitHub Desktop** | A button-based app for using Git and GitHub without typing commands. |
| **JSON** | A "universal letter" text format for exchanging data, for example `{"temperature":28.5}`. |

---

## 📝 5-Question Quiz

Answer in your notes first, then open the key. Pass = at least 4 correct.

1. What do `a` and `b` hold after these two lines: `int a = 7 / 2;` and `float b = 7.0 / 2;`? Explain why they're different.
2. When you click **Verify** in Arduino IDE (or **▶** in Wokwi), the **Output** panel (or the **Build failed!** box) shows `error: 'ledpin' was not declared in this scope; did you mean 'ledPin'?`. What does it mean, and what should you do?
3. Write the first line (the header) of a function called `computeArea` that takes `length` and `width` (both decimals) and returns the area. Why isn't the word in front `void`?
4. You have `int value[5] = {70, 85, 90, 65, 80};`. What is the index of the last drawer? What might happen if your program reads `value[5]`?
5. You've clicked **Commit 3 files to main** in GitHub Desktop, but those files don't show up on the GitHub website yet. Why, and what should you click?

<details>
<summary><b>Answer key & explanations</b></summary>

1. `a` holds **3**, `b` holds **`3.5`**. Dividing two whole numbers (`7 / 2`) throws away the fractional part. If one of the numbers is a decimal (`7.0`), the result is a decimal.
2. The name `ledpin` is used, but what was created is `ledPin` — the only difference is the capitalization. The compiler guesses what you meant correctly. Change `ledpin` to `ledPin`, then run again. (Compiler error messages never appear in the Serial Monitor: a program that fails to compile hasn't run at all.)
3. `float computeArea(float length, float width)`. The word in front is the **return type**. This function returns the area (a decimal), so its type is `float`; `void` means the function returns nothing. Its body only needs `return length * width;`. Remember, every parameter must have its own type: `float length, float width` — not `float length, width`.
4. The last index is **4** (indexes start at 0: 0, 1, 2, 3, 4). `value[5]` is outside the array. C++ doesn't check it: reading it usually gives a nonsense number, while writing to it (or reading a `String` drawer out of bounds) can make the ESP32 restart with a `Guru Meditation Error`.
5. **A commit only saves the "photo" on your laptop.** To send it to GitHub, click **Push origin** in GitHub Desktop's top bar.

</details>

---

## ✅ Module 3 Completion Checklist

Tick honestly. The ⭐ boxes are the **official requirements to pass** from the Syllabus; the rest are highly recommended. When everything is ticked, mark Module 3 in your copy of [`PROGRESS.md`](../../PROGRESS.md) and move on to Module 4.

- [ ] The Quick Win program prints my own name and age in the Wokwi Serial Monitor.
- [ ] The Serial calculator answers the questions I type, including refusing to divide by zero (Practice 1).
- [ ] I've made the five mistakes in the error workshop and can explain what each message means (Practice 2).
- [ ] The `turnOnLed(howManyTimes)` function and the Morse program work; I can explain what a parameter and a return value are (Practices 3–4).
- [ ] The temperature array and `struct SensorReading` programs work; I've added one day / one field myself (Practices 5–6).
- [ ] ArduinoJson **7.4.3** is installed (Arduino IDE and/or Wokwi), and I've opened its built-in example through **File → Examples** (Practice 7).
- [ ] ⭐ **The 3-LED traffic light program runs from code I wrote myself** (Practice 8)…
- [ ] ⭐ …**and it's been pushed to GitHub** in the `module-03/` folder of the `learn-iot` repository, together with its Wokwi screenshot (Practice 9).
- [ ] The `mini-smart-home` repository is published on GitHub and contains `firmware/node-1-home/node-1-home.ino` (➕).
- [ ] ⭐ **Quiz: at least 4 out of 5 correct.**

**You pass when** (per the Syllabus): *the 5-question quiz ≥ 4 correct and the "3-LED traffic light" program runs from code you wrote yourself and is pushed to GitHub.*

---

## 📚 Sources & Image Credits

Our own diagrams and illustrations are licensed **CC BY 4.0**; for the ones drawn entirely by the author, the `.svg` source files are included in the `assets/` folder so you can edit them. The Arduino IDE and GitHub Desktop pictures are **illustrations** redrawn to follow the real interface (checked October 2026); the real interface may change. A full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-03`, `sketch-anatomy`, `variable-box`, `if-else-flow`, `for-loop`, `function-machine`, `array-drawers`, `struct-form`, `error-message-anatomy`, `git-commit-push` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The error message text in `error-message-anatomy` is real compiler output in Wokwi. | CC BY 4.0 |
| `ide-library-manager-arduinojson`, `ide-built-in-examples` (`.png` + `.svg`) | Original curriculum illustrations, redrawn to follow [Arduino IDE 2.3.10](https://www.arduino.cc/en/software); the interface text was matched against [`i18n/en.json`](https://github.com/arduino/arduino-ide/blob/2.3.10/i18n/en.json) and the arduino-ide source code. The Arduino name and logo belong to Arduino SA. | CC BY 4.0 for the illustrations. Not real screenshots. |
| `github-desktop-clone`, `github-desktop-commit-push`, `github-desktop-new-repo` (`.png` + `.svg`) | Original curriculum illustrations, redrawn to follow [GitHub Desktop 3.6.6](https://github.com/desktop/desktop/releases/tag/release-3.6.6); the interface text was matched against its source code. GitHub and GitHub Desktop are trademarks of GitHub, Inc. | CC BY 4.0 for the illustrations. Not real screenshots. |
| `wokwi-hello-serial.png`, `wokwi-serial-typing.png`, `wokwi-library-manager.png`, `traffic-light-circuit.png` | Screenshots of the [Wokwi](https://wokwi.com) simulator, © Wokwi (CodeMagic LTD), October 2026; markers and labels by the author. | Used for educational/tutorial purposes; not part of the curriculum's CC license. |

References used while writing: the Arduino language documentation ([docs.arduino.cc/language-reference](https://docs.arduino.cc/language-reference/)), the arduino-esp32 documentation ([docs.espressif.com/projects/arduino-esp32](https://docs.espressif.com/projects/arduino-esp32/en/latest/)) and the `platform.txt` of the esp32 3.3.12 package, the Arduino IDE 2.3.10 interface text ([github.com/arduino/arduino-ide](https://github.com/arduino/arduino-ide)), ArduinoJson 7.4.3 and its `JsonGeneratorExample` example ([arduinojson.org](https://arduinojson.org/), [github.com/bblanchon/ArduinoJson](https://github.com/bblanchon/ArduinoJson)), the Wokwi documentation on libraries and the Serial Monitor ([docs.wokwi.com](https://docs.wokwi.com/)), the GitHub Desktop documentation ([docs.github.com/desktop](https://docs.github.com/en/desktop)) and the GitHub Desktop 3.6.6 source code ([github.com/desktop/desktop](https://github.com/desktop/desktop)), and the commit email settings in the GitHub documentation. All the code in this module has been tested in the Wokwi simulator, and all the error messages in Practice 2 are real compiler output.

---

[⬅️ Module 2](../module-02-electricity-and-first-upload/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 4 — JavaScript & Node.js from Scratch (the Language for Servers & Dashboards)](../module-04-javascript-nodejs/README.md) ➡️**
