# Module 10 — Wi-Fi & HTTP: Devices Start Talking to the Network

🌐 **English** · [Bahasa Indonesia](../../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md)

*Phase 2 · Week 10 · Hardware: **the Node 1 workbench from Module 9**, **a laptop**, **a phone**, and **2.4 GHz Wi-Fi** that you're allowed to use (see 🧰) — no new parts · Prerequisites: **Module 8** (Node 1 v1.0) and **Module 4** (JSON and the mini server) · Time: 8–10 hours, spread over the week*

[⬅️ Module 9](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 11 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-11--mqtt-the-official-language-of-iot--the-project-data-contract)

---

Welcome to Phase 2! In Phase 1, Node 1 became a robust, independent device: it reads five sensors, drives the lamp, the fan, the pump, and the curtain, and runs on its own adapter. But Node 1 still **lives on its own**. It can't send news to anyone, and nobody can give it commands from a distance. Starting this week, Node 1 is **connected to the network**: to your home Wi-Fi, your laptop, your phone, and the internet.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Node 1 can only be "talked to" through the USB cable and the Serial Monitor. | Node 1 isn't connected to any network yet. | Home Wi-Fi, including when the Wi-Fi drops and comes back (Concepts 1–4, Practices 2–3) |
| If it's written carelessly in the code, the Wi-Fi password can end up uploaded to GitHub too. | Secrets are mixed in with code that gets shared. | A `secrets.h` file that Git ignores, then a Wi-Fi portal with no password in the code (Concepts 3 and 5, Practices 1 and 4) |
| Node 1 knows how long it has been running, but not the date and time. | The ESP32 has no battery-backed clock: every time it powers up, its clock starts from zero. | The time from the internet through NTP (Concept 6, Practice 5) |
| The sensor readings only appear on the OLED display and are stored on the microSD card. | There's no way yet to send data to another computer. | HTTP letters with JSON inside (Concepts 7–8, Practices 6–7) |
| Commands for the lamp can only come from the button or the Serial Monitor. | Node 1 can't receive commands from the network yet. | The ESP32 becomes a small web server (Concept 9, Practices 8–9) |

By the end of the week, **Node 1 v1.1** connects to your home Wi-Fi without a single password written in its code, knows the exact time and date, sends the readings of its five sensors to the laptop every minute, and its lamp can be turned off from your phone. If the router is turned off for a while, Node 1 reconnects by itself. Everything still stays **inside your home network**: opening the device up to the internet is a job for Phase 5.

![Module 10 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 2 Connectivity, Modules 10 to 15, is highlighted. Modules 1 to 9 are marked done, and Module 10 is marked YOU ARE HERE with the note "the first module of Phase 2: Node 1 joins the network". Bottom: the box for this week's Module 10, 8 to 10 hours spread over the week, no new parts, just 2.4 GHz Wi-Fi, a laptop, and a phone: the Quick Win, the ESP32 greets your home Wi-Fi; Practice 1, the secrets guard: secrets.h and .gitignore; Practice 2, get to know your network: IP, router, MAC address; Practice 3, the router unplug test: it reconnects by itself; Practice 4, a Wi-Fi portal like at a hotel (WiFiManager); Practice 5, the time from the internet (NTP) and the ts timestamp; Practice 6, weather from the internet: HTTPS and JSON; Practice 7, send readings to the laptop: HTTP POST; Practice 8, a lamp switch on your phone: the ESP32 as a web server; Practice 9, a fixed address and the name node1.local; and the Add-on section, Node 1 v1.1 joins the network, marked with a star as required to pass](assets/roadmap-module-10.png)

> [!NOTE]
> **How to use this module.**
>
> - Every practice uses the **Node 1 board** on your workbench, which stays plugged into the laptop during the practices. Since Module 9, that board has been running on its charger, so at the start of the Quick Win we first move it back to the laptop. The MB102 only needs to be turned on in Practice 8 and the ➕ section, when the lamp relay is used.
> - Every code box has a copy button in its top right corner. All the sketches are also available as files in the [`code/`](code/) folder.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing. The numbers on your board will certainly be different.
> - **Wokwi can run some of the practices**: connecting to a simulated network called `Wokwi-GUEST` (with no password), asking the internet for the time, and requesting data over HTTPS. What it **can't** do: turning off the router (Practice 3), a Wi-Fi portal that a phone connects to (Practice 4), sending to your laptop (Practice 7), and opening the ESP32's web server from a browser (Practices 8–9). You can't turn the simulated network off, and the rest is blocked because Wokwi's free service only allows outgoing connections. **Expected output** boxes marked **Wokwi recording** come straight from the simulator. The rest are marked **example**: their lines follow the sketch's code and the Wokwi recordings, but the Wi-Fi name, the IP addresses, and the signal numbers are replaced with examples from a home network.
> - macOS users: replace **Ctrl** with **Cmd** to save, select all, copy, paste, and create a new tab.

> [!WARNING]
> **Safety rules this week.** Once you're connected to a network, small mistakes can be seen by other people.
>
> 1. **The Wi-Fi password is never written in code that gets committed.** Its place is the `secrets.h` file, which Git ignores (Practice 1). If a password has already been uploaded to GitHub, consider it leaked: **change your Wi-Fi password** in the router.
> 2. **The ESP32's web server and the receiver on the laptop deliberately have no password**, only for practicing on your home network. Don't set up *port forwarding* (opening a door in the router so that people on the internet can knock directly on a device in your home), and don't run the receiver on your laptop while it's connected to public Wi-Fi, for example at a café or an airport. How to lock them down is covered in Modules 20, 21, and 27.
> 3. **Use a network you're actually allowed to use.** In a boarding house, an office, or on a campus, ask the people who manage it first, and don't change the settings of someone else's router.
> 4. **Before you unplug the router** (Practice 3 and the ➕ section), tell the people you live with, because their internet goes down for a few minutes too. Or use your own phone's hotspot.
> 5. **The golden power rules from Module 5 still apply:** the relays get their power from the MB102, the ESP32 from USB or its charger, and the order for turning things on and off stays the same.

This module follows the same rhythm as Modules 1–9. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools and parts it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: the ESP32 greets your home Wi-Fi (10 minutes)](#-quick-win-the-esp32-greets-your-home-wi-fi-10-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Home network](#1-the-home-network-router-ip-address-and-mac-address) · [2 2.4 GHz Wi-Fi](#2-wi-fi-for-the-esp32-24-ghz-only-and-how-strong-the-signal-is) · [3 Secrets](#3-secrets-dont-go-in-the-code-secretsh-and-gitignore) · [4 Reconnecting](#4-connecting-without-getting-stuck-then-reconnecting-by-itself) · [5 Wi-Fi portal](#5-a-wi-fi-portal-like-at-a-hotel-wifimanager) · [6 NTP clock](#6-the-time-from-the-internet-ntp-time-zones-and-the-ts-timestamp) · [7 HTTP & JSON](#7-http-letters-between-devices-with-json-inside) · [8 HTTPS](#8-https-and-setinsecure-a-sealed-envelope-whose-courier-isnt-checked) · [9 Web server](#9-the-esp32-becomes-a-web-server-and-how-to-find-its-address) · [10 The price of Wi-Fi](#10-the-price-of-wi-fi-a-bloated-program-a-locked-adc2-and-current-spikes)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Secrets guard](#practice-1--install-the-secrets-guard-10-minutes) · [2 Know your network](#practice-2--get-to-know-your-network-20-minutes) · [3 Router unplug](#practice-3--the-router-unplug-test-25-minutes) · [4 Wi-Fi portal](#practice-4--a-wi-fi-portal-like-at-a-hotel-25-minutes) · [5 Internet clock](#practice-5--the-time-from-the-internet-15-minutes) · [6 HTTPS weather](#practice-6--weather-from-the-internet-20-minutes) · [7 Send to the laptop](#practice-7--send-readings-to-the-laptop-30-minutes) · [8 Switch on your phone](#practice-8--a-lamp-switch-on-your-phone-20-minutes) · [9 Fixed address](#practice-9--a-fixed-address-for-node-1-20-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-10-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

- **Explain how a home network works** in everyday language: router, IP address, DHCP, and MAC address.
- **Connect the ESP32 to 2.4 GHz Wi-Fi** and read its network "ID card".
- **Store the Wi-Fi password safely**: in a `secrets.h` file that Git ignores, or through a Wi-Fi portal, which means the password isn't written in the code at all.
- **Make the ESP32 reconnect by itself** when the Wi-Fi drops, without getting the program stuck.
- **Get the exact time and date from the internet** (NTP), complete with the time zone and the `ts` timestamp.
- **Send and receive data over HTTP**: request the weather from an HTTPS API, then send JSON to the mini server on your laptop.
- **Control a relay from your phone's browser** through a small web server on the ESP32, and find its address through a fixed IP or a `.local` name.
- **Explain the "price" of Wi-Fi**: a bloated program, an ADC2 that can't be used, and electric current that spikes.
- **Set up Node 1 v1.1**, which connects to your home network, sends its readings every minute, and has a lamp you can turn off from your phone.

---

## 🧰 What you need

This week there are **no new parts**. What's new is the network.

| What | Details |
| :--- | :--- |
| **The Node 1 workbench from Module 9** | Complete, with the Node 1 v1.0 firmware. During the practices, the Node 1 board is plugged into the laptop, as in Phase 1; its charger is used again in the ➕ section. |
| **2.4 GHz Wi-Fi** | The network name (SSID) and its password, exactly, down to upper and lower case. The ESP32 can only use 2.4 GHz Wi-Fi; how to make sure is in Concept 2 and Practice 2. If you can't use your home Wi-Fi, a phone hotspot is fine too (Concept 2). |
| **Laptop** | Connected to the **same** Wi-Fi as the ESP32. Have Node.js 24 and the `mini-smart-home/tools` folder from Module 4 ready. |
| **Phone** | With any browser (Chrome, Safari, or Samsung Internet), connected to the same Wi-Fi. |
| **Access to the router's admin page** (optional) | For Practice 9 (a fixed IP address). Its address and password are usually printed on a sticker on the router's body. No access? Practice 9 has another way. |
| **The WiFiManager and ArduinoJson libraries** | Installed through the **Library Manager** when they're needed, in Practices 4 and 6. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. |
| Board package **esp32 by Espressif Systems** | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. The **WiFi**, **HTTPClient**, **WebServer**, **ESPmDNS**, and **NetworkClientSecure** (`WiFiClientSecure`) libraries are already included. If **Boards Manager** offers a 4.x version someday, stay on 3.3.x for this curriculum. |
| **WiFiManager** library (by tzapu) | **2.0.17** | New (Practice 4). The Syllabus requires at least 2.0.17. |
| **ArduinoJson** library (by Benoit Blanchon) | **7.4.3** | New (Practice 6). |
| **DHT sensor library** (by Adafruit) | **1.4.7** | From Module 6; used again in Practice 7. |
| Node.js | **24.21.0** | From Module 4, for `webhook-receiver.js`. |

---

## 🏆 Quick Win: the ESP32 greets your home Wi-Fi (10 minutes)

Since Module 2, your ESP32 board has actually been carrying a Wi-Fi radio, but we've never turned it on. Now we'll have it knock on your home router's door and introduce itself.

> 🖥️ **Tools used in this section:** **Arduino IDE** and the **Serial Monitor**, the **Node 1 board** plugged into the laptop (the MB102 can stay off), and the name and password of your **2.4 GHz Wi-Fi**. The D4 status LED on the workbench acts as a signal: it blinks while connecting and stays on once connected. No board yet? See the Wokwi note at the end of this section.
>
> **Is Node 1 still running on its charger, as in Module 9?** First move it to the laptop in the order of the golden rules, the same as Practice 1.5 of Module 9: **turn off the MB102**, unplug the Node 1 board's USB cable from the charger, then plug it into the laptop. Leave the MB102 off until Practice 8.

1. In Arduino IDE, open **File → New Sketch**, delete its contents, then paste this code. Save it as `module10_hello_wifi` in the `module-10` folder of the `learn-iot` repository (create the folder if it doesn't exist yet, as in the previous modules).

   ```cpp
   // Module 10 - Quick Win: the ESP32 says hello to your home WiFi
   // The WiFi name and password are NOT written in this file, but in the secrets.h tab.
   // The D4 status LED blinks while connecting, then stays on once connected.

   #include <WiFi.h>     // comes with the esp32 package, nothing to install
   #include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

   const int PIN_STATUS_LED = 4;              // workbench status LED (Module 2)
   const unsigned long WAIT_TIMEOUT = 20000;  // give up after 20 seconds

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_STATUS_LED, OUTPUT);
     Serial.println();
     Serial.printf("Connecting to WiFi \"%s\"", WIFI_NAME);

     WiFi.mode(WIFI_STA);  // STA (station) = the ESP32 joins the router's network, like your phone
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);

     // Waiting in setup() is fine for this Quick Win: it happens only once, and no watchdog is watching yet.
     // Concept 4 shows how to connect without ever getting the program stuck.
     bool ledOn = false;
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < WAIT_TIMEOUT) {
       ledOn = !ledOn;
       digitalWrite(PIN_STATUS_LED, ledOn);  // blink while waiting
       Serial.print(".");
       delay(250);
     }
     Serial.println();

     if (WiFi.status() != WL_CONNECTED) {
       digitalWrite(PIN_STATUS_LED, LOW);
       Serial.println("Not connected after 20 seconds. Check the name and password in the secrets.h tab.");
       return;
     }
     digitalWrite(PIN_STATUS_LED, HIGH);  // steady on = connected
     Serial.printf("Connected in %lu ms!\n", millis() - start);
     Serial.print("ESP32 IP address: ");
     Serial.println(WiFi.localIP());
     Serial.printf("Signal strength : %d dBm\n", WiFi.RSSI());
   }

   void loop() {
     // Empty: all the Quick Win work is in setup().
   }
   ```

2. Create a new tab for your secrets: click the **⋯** button (three dots) at the right end of the tab bar, choose **New Tab** (its shortcut is **Ctrl + Shift + N**), type **`secrets.h`** (complete with its ending), then click **OK**. Paste this content into the tab that just opened:

   ```cpp
   // secrets.h - SECRET: your WiFi name and password.
   // This file is an EXAMPLE. Replace the two texts below with the name and password of your 2.4 GHz WiFi.
   // In your own repository, Git ignores secrets.h through .gitignore (Module 10, Practice 1),
   // so your password is never uploaded to GitHub.
   #pragma once

   const char WIFI_NAME[] = "YourHomeWiFiName";      // WiFi name (SSID), upper and lower case must match exactly
   const char WIFI_PASSWORD[] = "YourWiFiPassword";  // WiFi password
   ```

3. **Replace the two example texts** with your Wi-Fi name and password. Don't delete the double quotes along with them. If your password contains a double quote (`"`) or a backslash (`\`), write them as `\"` and `\\` respectively. The Wi-Fi name must match exactly, including upper and lower case and spaces: `OurHome` is different from `ourhome`. Save with **Ctrl + S**.
4. Make sure the selected board is **DOIT ESP32 DEVKIT V1** and the port is right, then click **Upload**. As soon as `Done uploading` appears, open the **Serial Monitor** (**115200 baud**). If you can't see the first line, press the **EN** button on the ESP32 board.

   **Expected output** (example; the number of dots depends on how long connecting takes):

   ```text
   Connecting to WiFi "OurHome"..........
   Connected in 2499 ms!
   ESP32 IP address: 192.168.1.23
   Signal strength : -58 dBm
   ```

Congratulations — your ESP32 has just joined your home network, just like your phone and your laptop. Notice three things:

- **The ESP32 gets an IP address**, for example `192.168.1.23`. The router hands out that address, like the house number that the management of a housing complex gives to new residents (Concept 1).
- **The signal strength is written in dBm and is always negative.** The closer to 0, the stronger: −50 dBm is very strong, while −85 dBm is already weak (Concept 2).
- **The Wi-Fi password isn't in the main tab**, but in the `secrets.h` tab. The main tab can be shared; `secrets.h` can't. **Don't commit the `module-10` folder yet**, not before Practice 1: there we install a "guard" so that GitHub Desktop never uploads `secrets.h`.

Not connected after 20 seconds? Don't panic. The most common causes are a typo in the name or the password, or a Wi-Fi network that only broadcasts on 5 GHz. Open "The dots keep coming, then `Not connected after 20 seconds`" in 🚨.

> 🖥️ **Trying it in Wokwi?** Open a new ESP32 project at [wokwi.com](https://wokwi.com), paste the main tab's code into `sketch.ino`, then create a **`secrets.h`** file through **▾ → New file...** (as in Module 8). Fill that file with the name of Wokwi's simulated network:
>
> ```cpp
> // secrets.h for Wokwi: the simulated Wokwi-GUEST network has no password.
> #pragma once
>
> const char WIFI_NAME[] = "Wokwi-GUEST";
> const char WIFI_PASSWORD[] = "";
> ```
>
> Wokwi connects to the `Wokwi-GUEST` network and gets an address such as `10.10.0.2`. There's no D4 status LED in this empty project; what matters is the text in the Serial Monitor.

---

## 🧠 The "Why" Concepts

Ten concepts, one per section — **you don't need to read them all at once**. Concepts and practices alternate in this order:

1. Concepts 1–3 → Practices 1–2 (the secrets guard and getting to know your network)
2. Concept 4 → Practice 3 (the router unplug test)
3. Concept 5 → Practice 4 (the Wi-Fi portal)
4. Concept 6 → Practice 5 (the time from the internet)
5. Concepts 7–8 → Practices 6–7 (weather from the internet and sending readings to the laptop)
6. Concept 9 → Practices 8–9 (a lamp switch on your phone and a fixed address)
7. Concept 10 → 🧩 Challenges → ➕ Mini Smart Home (Node 1 v1.1) → 📝 Quiz → ✅ Checklist

At every switch point, there's a ➡️ box (forward to the practice) and a ⬆️ box (back to the concepts) with links you only need to click.

> 🖥️ **Want to try the code in the Concepts section?** It's not required — you'll run all the code in the Practices. The code in the Concepts section is only snippets; the full versions are in the Practice sketches and in the [`code/`](code/) folder.

### 1. The home network: router, IP address, and MAC address

Imagine your home network as a **gated housing complex**. The laptop, the phone, the smart TV, and now the ESP32 are the houses inside it. The **router** is the security post and the management office at the same time: the only gate in and out, and the place where new residents get a house number.

![Diagram of the home network as a gated housing complex: the router hands out house numbers (local IP addresses), and every device has an ID card number (a MAC address). Inside the dashed fence, your home network with the block 192.168.1.x: the laptop with IP 192.168.1.10, which runs webhook-receiver.js on port 3000; the phone with IP 192.168.1.42, a browser for /on and /off; and the ESP32 (Node 1) with IP 192.168.1.23 and MAC A4:CF:12:E5:B7:C0, which becomes device_id a4cf12e5b7c0 (Appendix A). All three connect over Wi-Fi to the router, the security post, at the address 192.168.1.1 (the gateway), which hands out numbers through DHCP and is the gate to the internet. Outside the fence, the internet: your complex's address on the main road, 203.0.113.7 (the public IP), the weather server api.open-meteo.com (Practice 6), and the time server pool.ntp.org (Practice 5); names are turned into numbers by asking DNS. Note at the bottom: letters from the internet only reach the security post; people outside can't knock directly on your ESP32](assets/home-network.png)

- A **local IP address** is the **house number inside the complex**, for example `192.168.1.23`. Every connected device gets one number, and that's the number devices use to send each other letters. This number only counts inside the fence: the neighboring complex also has a house numbered `192.168.1.23`, and the two are never mixed up.
- The **public IP address** is **the complex's address on the main road**. All the houses inside the fence share this one address when they deal with the internet. Letters from outside only reach the security post; the guard passes them on to the house that is actually waiting for a reply. That's why people on the internet **can't** knock directly on your ESP32. For this week's practice, that's good news.
- **DHCP** is **the clerk who hands out house numbers**. As soon as the ESP32 comes in, it asks for a number, and the router lends it a free number for a while (usually a few hours to a few days). That loan is extended automatically, but the number **can change**, for example after the router is restarted. In Concept 9, we ask the router to always give Node 1 the same number.
- The **gateway** is **the number of the security post itself**, usually ending in `.1`, for example `192.168.1.1`. Letters for houses outside the fence are always left there. (Don't confuse it with the Raspberry Pi gateway in Module 12: that's the "post office" for IoT data at home, a different role.)
- The **MAC address** is **the device's ID card number**: printed into the chip at the factory, unchanging, and different for every device. It's written as six pairs of hexadecimal digits, for example `A4:CF:12:E5:B7:C0`. The router recognizes devices by this number. Our project's data contract ([Syllabus Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract)) uses it as the **`device_id`**: its twelve digits written in lowercase without the colons, for example `a4cf12e5b7c0`.
- **DNS** is the **phone book**. People remember names like `api.open-meteo.com`, while devices need IP addresses. Before sending a letter to a name, the ESP32 first asks DNS, "What's the number for this name?"

**Which ones are neighbors, and which aren't?** Two devices are neighbors if the front part of their addresses is the same. How long that "front part" is gets decided by the **subnet mask** (the block marker): `255.255.255.0` means the first three numbers must be the same. So `192.168.1.23` and `192.168.1.10` are neighbors, while `192.168.0.10` is already outside the block and can't be reached directly. Address ranges such as `192.168.x.x` and `10.x.x.x` are reserved for networks inside the fence and are never used on the internet.

### 2. Wi-Fi for the ESP32: 2.4 GHz only, and how strong the signal is

Wi-Fi is **radio**. A home router usually broadcasts on two frequency **bands**:

| | 2.4 GHz | 5 GHz |
| :--- | :--- | :--- |
| Range | longer, gets through walls more easily | shorter |
| Speed | enough for IoT | faster, good for video |
| ESP32 on the DevKit V1 board | ✅ works | ❌ **doesn't work** |

The ESP32 chip on your board **only has a 2.4 GHz radio**. As a result, a network that only broadcasts on 5 GHz is **completely invisible** to the ESP32. For an IoT device, that's not a drawback: sensor data is small, while a longer range actually helps.

![Diagram of the two Wi-Fi bands: the ESP32 only hears 2.4 GHz, while phones and laptops can use either one. The home router broadcasts widely spaced 2.4 GHz waves (long range, through walls) and tightly packed 5 GHz waves (faster, short range). The ESP32 (DevKit V1) card: hears 2.4 GHz, deaf to 5 GHz; 5 GHz networks are never visible. Three situations below it: one name for both bands, for example OurHome (2.4 + 5 GHz), usually works because the ESP32 uses its 2.4 GHz band; two different names, OurHome and OurHome_5G, choose the name without 5G; 5 GHz only, for example MyOffice_5G, not visible, so turn on 2.4 GHz or use a phone hotspot](assets/two-wifi-bands.png)

There are three situations you need to recognize:

- **One name for both bands** (often called *band steering* or Smart Connect). Many modern routers use the same name for 2.4 and 5 GHz. Usually the ESP32 can still get in through the 2.4 GHz band. If that fails, give the 2.4 GHz band its own name (for example `OurHome-2G`) or temporarily turn off the merging feature on the router's admin page.
- **Two different names**, for example `OurHome` and `OurHome_5G`. Choose the name **without** 5G.
- **5 GHz only** (rare at home, more common in offices), or the 2.4 GHz band has been turned off. The ESP32 will never see it. Turn on the 2.4 GHz band on the router's admin page (ask the owner's permission), or use a phone hotspot.

> 📱 **Using a phone hotspot as a backup Wi-Fi?** Make sure the hotspot broadcasts on 2.4 GHz:
>
> - **Samsung Galaxy:** **Settings → Connections → Mobile Hotspot and Tethering → Mobile Hotspot → Configure**, then change **Band** to **2.4 GHz**.
> - **Other Android phones**, for example a Pixel: **Settings → Network & internet → Hotspot & tethering → Wi‑Fi hotspot**, then choose **2.4 GHz** under **Speed & compatibility**, or turn on **Extend compatibility** on older Android versions. The menu names can differ a little between brands.
> - **iPhone:** turn on **Maximize Compatibility** in **Settings → Personal Hotspot**. However, an iPhone hotspot disconnects other devices that stay quiet for 90 seconds, and it isn't designed for devices that send data to each other. For this module, an Android or laptop hotspot is a better fit.
> - **Windows 11 laptop:** **Settings → Network & internet → Mobile hotspot**, open **Properties**, click **Edit**, then choose **2.4 GHz** under **Network band**.

**The network's lock matters too.** Home networks usually use **WPA2** or a **WPA2/WPA3** mix, and the ESP32 can use both. Version 3 of the esp32 package also supports WPA3. What the ESP32 refuses are the old locks: **WEP** and first-generation **WPA**. If your router still uses one of them, change it to **WPA2-PSK (AES)** or **WPA2/WPA3** on the router's admin page; those old locks aren't safe anymore anyway. Three other kinds of networks don't suit this module either:

- **Wi-Fi with a login page**, as in hotels, cafés, and some boarding houses or campuses. The ESP32 has no browser to sign in with.
- **Office or campus Wi-Fi that asks for a personal username and password** (WPA2-Enterprise, for example eduroam). The ESP32 can actually do it, but the code is different, our Wi-Fi portal can't fill it in, and storing your campus account on a practice board may break campus rules.
- **Guest networks** or networks that **isolate devices**. Devices on networks like these are deliberately kept from reaching each other, yet this week the ESP32, the laptop, and the phone have to send each other letters.

For all of these, use a phone hotspot. One more thing: if your home Wi-Fi's name is hidden, make it visible again while you work through this module.

The ESP32 reads the **signal strength** as **RSSI** (*Received Signal Strength Indicator*) in **dBm**. The number is always negative, and **the closer to 0, the stronger**:

| RSSI | What it means |
| :--- | :--- |
| −55 dBm and above (for example −45) | very strong |
| −56 to −67 dBm | strong: everything runs smoothly |
| −68 to −75 dBm | fair: still safe for sensor data |
| −76 to −85 dBm | weak: sends fail now and then, and the connection drops easily |
| below −85 dBm | very weak: drops often |

The scale isn't straight like a ruler: every time the number drops by **3** (for example from −50 to −53 dBm), the signal strength is cut in **half**. Brick walls, metal cabinets, and water tanks can make that number drop by a dozen or more. If Node 1 is someday mounted far from the router, check this number first.

### 3. Secrets don't go in the code: `secrets.h` and `.gitignore`

In the Quick Win, we put the Wi-Fi name and password in a separate tab, `secrets.h`, then pulled it into the main tab with one line:

```cpp
#include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD
```

`#include` actually means "paste that file's contents here when compiling" (🔬 Module 3). The compiled result is the same as writing the password in the main tab. The difference is **who gets to see that file**.

Your `learn-iot` repository is public on GitHub. There are automated programs (bots) there that keep scanning new repositories for passwords and secret keys that were uploaded by accident. A leaked Wi-Fi password won't open your bank account, but anyone near your home can get into your home network. Node 1 is inside that network, and from Practice 8 on, anyone can turn its lamp on and off **without a password**.

That's why we keep two kinds of files apart:

| | Main tab (`.ino`) | `secrets.h` |
| :--- | :--- | :--- |
| What's in it | how the program works | the Wi-Fi name and password |
| On your laptop | ✅ yes | ✅ yes |
| On GitHub | ✅ committed and pushed | ❌ **never** |

What keeps them apart is **`.gitignore`**, the "don't track" list you already know from Module 4 (back then for `node_modules/`). A single `secrets.h` line in the `.gitignore` file in the repository's main folder means: **every file named `secrets.h`, in any folder**, is never tracked by Git. GitHub Desktop no longer shows it in the **Changes** list either, so it can't get committed by accident.

Two things that are often missed:

- **`.gitignore` only guards files that have never been committed.** A file that Git is already tracking stays tracked, even if its name is written in `.gitignore` later. That's why we install the guard **now**, before this week's first commit.
- **If a password has already been pushed**, deleting the file from GitHub isn't enough, because its contents are still stored in the repository's history. Consider the password leaked: **change the Wi-Fi password in the router**, then update your `secrets.h`. The full steps are in 🚨.

This curriculum's [`code/`](code/) folder also contains `secrets.h`, but it only holds examples (`YourHomeWiFiName`), not a real password, so it's safe to share. In Concept 5, we go a step further: Node 1 receives the Wi-Fi name and password through a **portal on your phone**, so the password isn't written in any code at all.

> ➡️ **Time to practice!** Concepts 1–3 are enough for [Practice 1 — Install the secrets guard](#practice-1--install-the-secrets-guard-10-minutes) and [Practice 2 — Get to know your network](#practice-2--get-to-know-your-network-20-minutes). After that, come back to Concept 4.

### 4. Connecting without getting stuck, then reconnecting by itself

Connecting to Wi-Fi actually takes three steps, and they all take time:

1. **Searching** every radio channel for a network with the same name as `WIFI_NAME` (about 1–2 seconds).
2. **Knocking on the door** with the password, then exchanging "secret keys" with the router.
3. **Asking DHCP for a house number** (an IP address).

Usually it's all done in 1–5 seconds. With a weak signal, it takes longer. If the router is off, it never finishes.

**The way the Quick Win waits must not be used in `loop()`.** There we wrote `while (WiFi.status() != WL_CONNECTED) { … delay(250); }`. For a single run in `setup()`, that's fine. But imagine the same pattern in Node 1's `loop()` while the router is off for ten minutes: during that time, the sensors aren't read, the button isn't handled, the pump isn't turned off on time, and after 5 seconds the Module 8 watchdog decides Node 1 is stuck and restarts it. Over and over. Yet Node 1 can keep working without a network: watering the plants and turning on the automatic lamp don't need the internet.

Our rule from this week on: **the Wi-Fi may drop, but Node 1 must not stop.**

The good news is that the esp32 package already takes care of almost everything:

- **`WiFi.begin()` doesn't wait.** It only starts the connection process, then returns right away. The radio work is done by another "worker" inside the chip while `loop()` keeps running.
- **Auto-reconnect** is on from the start. If the connection drops because the router is off or the signal is gone, the esp32 package tries to reconnect every few seconds, **again and again**, until it succeeds. There are only a few exceptions: a deliberate disconnect by your own program (`WiFi.disconnect()`) and a firm refusal from the router, for example code 202 in the table below.

All we have left to do is **watch without waiting**. There are two ways to do it:

- **Asking at any time** with `WiFi.status()`. The answer is `WL_CONNECTED` once it's connected and has an IP address. This question is answered instantly, so it's safe to ask in `loop()`.
- **Being told through events.** We register a function with `WiFi.onEvent(onWiFiEvent)`, and the esp32 package calls it every time something happens. It's like a doorbell: we don't have to keep peeking, we just wait for the bell to ring. The two events we use are **`ARDUINO_EVENT_WIFI_STA_GOT_IP`** (got a house number) and **`ARDUINO_EVENT_WIFI_STA_DISCONNECTED`** (the connection dropped or a connection attempt failed, complete with its reason code).

![Timeline of the router unplug test over 180 seconds: the Wi-Fi may drop, but loop() must not stop; the esp32 package reconnects by itself, and the sketch only watches. Router row: on, turned off for 1 minute, turned back on and still waking up (1 to 3 minutes), then ready. Wi-Fi row: a GOT_IP event at the start; a WiFi DISCONNECTED event with reason 200 shortly after the router goes off; a series of retries every few seconds with reason 201 (NO_AP_FOUND); then GOT_IP, connected AGAIN, as soon as the router is ready. loop() row: keeps running the whole time, handling the status LED and a report every 10 seconds, with a longest pass of 1 millisecond. D4 LED row: steady on while connected, fast blinking while disconnected, then steady on again. Note at the bottom: a Wi-Fi event from another worker raises a flag, then loop() lowers the flag and prints the message, like the interrupt in Module 8; Node 1 v1.1 uses the same pattern, so the sensors, the button, the pump, and the display keep working while the Wi-Fi is down](assets/reconnect.png)

The event function is called by the Wi-Fi "worker", **not** by `loop()`. The rules are the same as for an interrupt function (a function the chip calls suddenly, interrupting other work) in the 🔬 section of Module 8: **as short as possible**. It just raises a "flag" (a `volatile bool` variable), and `loop()` is the one that lowers it and prints the message:

```cpp
volatile bool gotIpFlag = false;  // volatile: can change "silently" from outside loop()

void onWiFiEvent(arduino_event_id_t event, arduino_event_info_t info) {
  if (event == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
    gotIpFlag = true;  // only raises the flag; loop() does the printing
  }
}

void loop() {
  if (gotIpFlag) {
    gotIpFlag = false;  // lower the flag
    Serial.println("Connected!");
  }
  // ... other work keeps running, connected or not
}
```

The **reason code** in the disconnect event is a big help when you're hunting down problems. The ones that show up most often:

| Code | Name in the esp32 package | What it usually means |
| :--- | :--- | :--- |
| 200 | `BEACON_TIMEOUT` | The router's signal suddenly disappeared: the router is off, or the board is too far away. |
| 201 | `NO_AP_FOUND` | The Wi-Fi name wasn't found: the router is off, the name has a typo, or the Wi-Fi is 5 GHz only. |
| 15 or 204 | `4WAY_HANDSHAKE_TIMEOUT`, `HANDSHAKE_TIMEOUT` | The key exchange failed. Almost always: **a wrong password**. The esp32 package keeps trying, so without this code all you'd see is "not connected yet". |
| 202 | `AUTH_FAIL` | The router refuses this device, for example because the router only allows certain MAC addresses (a *MAC filter*). Not reconnected automatically. |
| 210 or 211 | (no name in the esp32 package) | A Wi-Fi network with that name exists, but its lock doesn't match: for example, a password was given for an open Wi-Fi network such as `Wokwi-GUEST`, or the router still uses an old lock (WEP or WPA). Not reconnected automatically. |
| 8 | `ASSOC_LEAVE` | Your own program disconnected (`WiFi.disconnect()`). Not reconnected automatically. |

For Node 1, we add a **backup guard** in the ➕ section: if there's no new attempt for 60 seconds, Node 1 itself tells the esp32 package to try again. This little guard protects Node 1 from rare situations that auto-reconnect doesn't handle.

> ➡️ **Time to practice!** Continue to [Practice 3 — The router unplug test](#practice-3--the-router-unplug-test-25-minutes), then come back to Concept 5.

### 5. A Wi-Fi portal like at a hotel: WiFiManager

The `secrets.h` file already keeps the password away from GitHub, but two hassles remain. First, the password is still written on your laptop and gets built into the program. Second, every time the home Wi-Fi changes its name or password, Node 1 has to be plugged into the laptop again and its program uploaded again. Imagine if Node 1 were already mounted on the ceiling.

Smart devices you buy in a store, such as a smart lamp or a CCTV camera, never ask us to upload a program. Devices like that use another way: when first powered on, they **broadcast their own Wi-Fi** for a while. We connect a phone to that Wi-Fi, and a small page appears for choosing the home Wi-Fi and typing its password. It's like **hotel Wi-Fi**: as soon as you connect, the login page appears by itself.

The **WiFiManager** library gives the ESP32 the same ability:

1. When it powers up, the ESP32 checks: **is there a saved Wi-Fi network yet?**
2. **Not yet** (or we ask for it): the ESP32 turns into an **access point** (a "mini router") named, for example, `Node1-Home`, then opens a **portal**: a small web page at the address `192.168.4.1`.
3. You connect your phone to `Node1-Home`, pick the home Wi-Fi from the list, type its password, then save it.
4. The name and password are **saved in NVS** (the filing cabinet from Module 8), then the ESP32 tries to connect. If it succeeds, the portal closes. If it fails, the portal stays open so you can fill it in again; the wrong entry has already been saved, so repeat until it works.
5. **A Wi-Fi network is already saved:** the ESP32 connects right away, without the portal.

![Flowchart of the Wi-Fi portal like at a hotel (WiFiManager): the Wi-Fi name and password are entered on a phone, then saved in NVS, not in any code. The ESP32 powers up and checks NVS: is a Wi-Fi network already saved? If yes, the ESP32 connects right away to the home Wi-Fi using the Wi-Fi saved in NVS, without the portal. If not, or if the D13 button is held, the ESP32 becomes an access point named Node1-Home with a portal at 192.168.4.1; the phone connects to Node1-Home, picks the home Wi-Fi, enters the password, and taps Save; that Wi-Fi is saved in the Wi-Fi's own part of NVS (the Module 8 filing cabinet), then the ESP32 connects. Note about phones: an iPhone usually opens the login sheet right away; Android shows the notification Sign in to Wi-Fi network, but on some phones it doesn't appear; the way out: turn off mobile data, choose to stay connected, then open http://192.168.4.1 in the browser; the portal closes by itself after 3 minutes if it isn't used](assets/wifi-portal.png)

As a result, **the Wi-Fi password isn't written in any code**: not in the main tab, not in `secrets.h`, not on GitHub. That's what Node 1 v1.1 uses in the ➕ section. This week's practice sketches still use `secrets.h`, because it's quicker for trying things again and again.

**Does it appear by itself, or do you have to open it?** The **WiFiManager** portal answers every question to the "phone book" (DNS, Concept 1) with `192.168.4.1`, so the phone usually thinks it's joining hotel Wi-Fi. An iPhone opens the login sheet right away, and Android shows a notification for signing in to the network (**Sign in to Wi-Fi network**). However, on some Android phones that notification doesn't appear, or the phone even offers to switch networks because this Wi-Fi "has no internet access". The way out is always the same: **turn off mobile data**, choose to stay connected, then open `http://192.168.4.1` in the browser. That's what the Syllabus note "on Android the pop-up often doesn't appear" means.

> ➡️ **Time to practice!** Continue to [Practice 4 — A Wi-Fi portal like at a hotel](#practice-4--a-wi-fi-portal-like-at-a-hotel-25-minutes), then come back to Concept 6.

### 6. The time from the internet: NTP, time zones, and the `ts` timestamp

The ESP32 DevKit V1 board **has no battery-backed clock**; it's like a wall clock that stops as soon as its battery is taken out. While it's running, the chip does count time diligently: that's `millis()` and the uptime in Module 8. The problem is that the count always starts from zero. Every time it powers up, the ESP32 thinks it's **January 1, 1970, 00:00**. That date isn't random: it's the "day zero" that almost every computer in the world uses to count time.

The cure is **NTP** (*Network Time Protocol*): the ESP32 asks a **time server** on the internet for the time, a server whose clock is constantly matched to atomic clocks. It's like setting your watch by the station clock that's always right. Over Wi-Fi, the difference is usually only a few hundredths of a second, far more precise than we need.

![Diagram of the time from the internet: one number of seconds, two ways to read it. An ESP32 that has just powered up thinks it's January 1, 1970, because it has no battery-backed clock. It asks pool.ntp.org what time it is, a time server matched to atomic clocks and asked again every 3 hours, which answers in UTC. That answer sets the ESP32's clock, which reads as the number time(nullptr), for example 1792194431 seconds since January 1, 1970, 00:00 UTC. For people, localtime_r() with the zone WIB-7 turns it into Saturday, 17 October 2026 at 06:47:11 WIB, for the display, web pages, and the dashboard (Module 22). For data, gmtime_r() turns it into the ts 2026-10-16T23:47:11Z (Appendix A): Z means UTC, made by the device when the reading is taken, and its date can differ from the local date. Bottom row, POSIX time zones with the sign reversed: WIB-7 means UTC+7, WITA-8 means UTC+8, and WIT-9 means UTC+9](assets/ntp-clock.png)

In the esp32 package, all it takes is one line:

```cpp
configTzTime("WIB-7", "pool.ntp.org", "asia.pool.ntp.org");  // time zone, main server, backup server
```

- **`pool.ntp.org`** is a pool of thousands of volunteer time servers all over the world; it automatically picks a server close to you. Its backup, `asia.pool.ntp.org`, contains only servers in Asia.
- This line **doesn't wait**. The ESP32 asks in the background, and the answer usually arrives within a few seconds. There's a deliberate random pause of 0–5 seconds before the first question, so that millions of devices that power up at the same moment, for example when the electricity comes back after an outage, don't all ask at once. After that, the ESP32 asks for the time again by itself **every 3 hours**, so its clock doesn't drift.
- Until the first answer arrives, the clock is still in 1970. Your program has to check that first, as in Practice 5.
- Call this line **after** the ESP32 has gotten an IP address. If it's called too early, the first question fails, and the ESP32 only tries again about 15 seconds later.

The **time zone** is written by the POSIX rules, an old convention from the computer world: the zone's name, then its offset from **UTC** (Coordinated Universal Time, the world's reference clock) **with the sign reversed**.

| Zone | Offset from UTC | Written as |
| :--- | :--- | :--- |
| WIB (Western Indonesia Time) | UTC+7 | `"WIB-7"` |
| WITA (Central Indonesia Time) | UTC+8 | `"WITA-8"` |
| WIT (Eastern Indonesia Time) | UTC+9 | `"WIT-9"` |

Yes, the minus sign really is reversed. That's how the POSIX rules write it: the number says "how many hours must be added to the local time to get UTC". Just memorize it.

**The `ts` timestamp is always in UTC.** Our data contract ([Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract)) requires every piece of data to carry a `ts` from this module on, in a form like `"2026-10-17T01:23:45Z"`:

- `2026-10-17` is the date (year-month-day), `T` separates the date from the time, `01:23:45` is the time, and **`Z`** means "UTC time".
- This form is called **ISO-8601**, the international standard for writing dates and times. It goes from the largest unit to the smallest, so it can be sorted like ordinary text.

Why not WIB? Because our devices, servers, and database may later be in different time zones. For example, a device in Makassar uses WITA, while a server in Jakarta uses WIB. If everything records in UTC, nothing gets mixed up. The local time is only calculated when it's **shown** to people, for example on the display or on the dashboard (Module 22). Notice too that the date can differ: 06:47 WIB on October 17 is 23:47 UTC on October **16**.

One more rule from Appendix A: **`ts` is made by the device**, at the moment the reading is taken, not by the server when it receives it. That's why Node 1 v1.1 holds back its sends until its clock has been set from the internet. Data without the right time is more misleading than no data at all.

> ➡️ **Time to practice!** Continue to [Practice 5 — The time from the internet](#practice-5--the-time-from-the-internet-15-minutes), then come back to Concept 7.

### 7. HTTP: letters between devices, with JSON inside

In Module 4, your laptop already sent letters over **HTTP**: `weather.js` requested data from Open-Meteo, and `send-data.js` sent fake readings to `webhook-receiver.js`. This week, the ESP32 writes the letters. The rules are exactly the same, because HTTP is the "letter-writing etiquette" that every device on the internet uses.

![Diagram of HTTP as letters between the ESP32 (192.168.1.23) and the laptop (192.168.1.10, port 3000): 1, the request letter from the ESP32; 2, the reply letter from the laptop. The request letter: the line POST /telemetry HTTP/1.1 (method and path); the headers (the letter's head) Host 192.168.1.10:3000, User-Agent ESP32HTTPClient, Connection keep-alive, Accept-Encoding (the reply formats HTTPClient can read), Content-Type application/json, and Content-Length 75; one empty line; then the JSON body (the content) with ts, temperature 28.5, humidity 71, and light 2310. The reply letter: HTTP/1.1 200 OK, Content-Type application/json, Connection keep-alive, other headers shortened, then the content {"ok":true}. Code key: 200 means success; 4xx a mistake on the sender's side (404: the path doesn't exist); 5xx a mistake on the server's side (500); a negative number means no reply came back (HTTPClient). Note at the bottom: GET means please give me, with no body; POST means accept this delivery, with a body; the Content-Type header says what kind of content it is, and HTTPClient calculates Content-Length by itself](assets/http-letter.png)

Every HTTP conversation consists of **one request letter** and **one reply letter**:

| Part | Request (from the ESP32) | Reply (from the server) |
| :--- | :--- | :--- |
| First line | **method** + **path**, for example `POST /telemetry` | **status code**, for example `200 OK` |
| **Header** (the letter's head) | extra information, for example `Content-Type: application/json` | extra information, for example `Content-Type: application/json` |
| **Body** (the letter's content) | the data being sent, for example the JSON of a sensor reading | the answer data, for example `{"ok":true}` |

The **method** states what the letter is for. The two we use most often:

- **GET**: "please give me …". It has no body. Used to request the weather (Practice 6), and also used by your browser every time you open a web page.
- **POST**: "accept this delivery". It has a body. Used to send readings to the laptop (Practice 7).

The **status code** is the three digits at the start of the reply. Its first digit already tells you whether the news is good or bad:

| Code | What it means | Example this week |
| :--- | :--- | :--- |
| **200** OK | success | the weather arrived, the reading was received |
| **404** Not Found | the address doesn't exist | a path that isn't registered on the ESP32's web server, for example `/favicon.ico` (Practice 8) |
| **500** Internal Server Error | the server itself has a problem | the server answers, but its program failed to process your letter |

A 2xx code means success, 4xx means **a mistake on the sender's side** (a wrong address, unsuitable content), and 5xx means **a mistake on the server's side**. On the ESP32, the **HTTPClient** library can also answer with a **negative number**. A negative number isn't a code from the server, but a sign that **no reply was received**, for example `-1` (`connection refused`: the letter didn't arrive because the server is off, the address is wrong, or it's blocked) and `-11` (`read Timeout`: the letter was sent, but the server didn't reply in time).

**An address (URL) is read from left to right.** For example, the address of the receiver on your laptop:

```text
http://192.168.1.10:3000/telemetry
└┬─┘   └────┬─────┘ └┬─┘└───┬────┘
scheme   host      port   path
```

- **Scheme** `http` or `https`: how it's sent (Concept 8).
- **Host**: the server's IP address or name, for example `192.168.1.10` or `api.open-meteo.com`.
- **Port**: **the door number** on that host (in Module 4 we called it a "counter number"). One computer can run many server programs, each waiting at its own door. `webhook-receiver.js` waits at door **3000**. If the port isn't written, `http` uses door **80** and `https` door **443**.
- **Path**: the "room name" inside the server, for example `/telemetry`. The Open-Meteo address also has a part after the `?` sign, the **query** (extra questions), such as `latitude=-6.2`.

**JSON on the ESP32: ArduinoJson.** In Node.js, turning an object into JSON text only takes `JSON.stringify()`, and the reverse takes `JSON.parse()`. On the ESP32, the same work is done by the **ArduinoJson** library:

```cpp
JsonDocument doc;            // the JSON "container"
doc["ts"] = ts;              // fill the container, like a JavaScript object
doc["light"] = 2310;
char content[128];
serializeJson(doc, content, sizeof(content));  // container -> text, like JSON.stringify()
// content now: {"ts":"2026-10-17T01:23:45Z","light":2310}

deserializeJson(doc, textFromServer);                   // text -> container, like JSON.parse()
float temperature = doc["current"]["temperature_2m"];   // take the nested content
```

A failed sensor reading is still sent as it is. A failed `humidity` or `water_level` field keeps the value `-1`. A `temperature` field that is `NAN` is written by **ArduinoJson** as **`null`**, because JSON has no NaN value. The official way to write a failed reading in JSON is decided in Module 11.

**Letters take time, and the watchdog only waits 5 seconds.** An HTTP request can wait a long time if the server is off or the network is slow. By default, the **HTTPClient** library waits up to 5 seconds to connect and another 5 seconds for the reply. That's why we always set our own time limit: 5 seconds for a server on the internet (Practice 6) and 2 seconds for the laptop at home (Practice 7), two practice sketches that no watchdog is watching, plus **1.5 seconds** for Node 1's sends to the laptop. That way, even a failed send never makes the watchdog restart Node 1.

### 8. HTTPS and `setInsecure()`: a sealed envelope whose courier isn't checked

**Plain HTTP is like a postcard.** Anyone the letter passes on its way, for example other devices on the same Wi-Fi or your internet provider, can read it, and can even change it. For letters from the ESP32 to your own laptop, inside your own home network, that's still acceptable for practice. That's why the Syllabus allows **plain HTTP to a server you built yourself on the home network**, and the locks only go on in Phases 3 and 5.

**HTTPS** (`https://`, the S stands for *secure*) adds two protections:

1. **A sealed envelope** (encryption). The letter's content is scrambled so that only the sender and the receiver can read it.
2. **The courier's ID card** (a certificate). The "courier" here is the server that receives your envelope. It shows a certificate signed by a trusted organization, stating, "I really am `api.open-meteo.com`." Without this check, an impostor pretending to be the weather server could receive your sealed envelope too.

![Three cards comparing HTTP, HTTPS with setInsecure(), and checked HTTPS; the two protections of HTTPS are a sealed envelope (encryption) and the server's ID card (a certificate). Plain HTTP, like a postcard: the content isn't safe from eavesdroppers and the server's identity isn't checked; used for the ESP32 to your laptop at home, until Phases 3 and 5. HTTPS with setInsecure(), a sealed envelope, but the courier isn't checked: the content is safe from eavesdroppers, but the server's identity isn't checked; used for the ESP32 to a public API (Open-Meteo), temporarily, until Module 27. Checked HTTPS, a sealed envelope plus an ID card: the content is safe and the server's identity is checked; for everything that is open to the internet, from Module 27 on. Note at the bottom: setInsecure() protects the letter's content, but anyone pretending to be the server is still accepted; don't use it for passwords or commands](assets/https-setinsecure.png)

The browser on your laptop carries a list of those trusted organizations and always checks certificates. The ESP32 can do it too, but we have to give it that list and use it correctly. That's the job of Module 27, when our project is truly open to the internet.

For now, we use **`setInsecure()`**:

```cpp
WiFiClientSecure client;
client.setInsecure();  // TEMPORARY: a sealed envelope, but the server's identity is NOT checked
```

Let's be honest about what it means: with `setInsecure()`, the letter's content **stays sealed** from eavesdroppers, but the ESP32 **doesn't check** who receives it. For requesting weather data that's open to everyone anyway, the risk is small. For sending passwords or commands that move something, this approach **must not** be used. Every time `setInsecure()` appears in this curriculum, it gets the comment "TEMPORARY" until Module 27 replaces it.

| Approach | Used for | Content safe from eavesdroppers? | Server's identity checked? | Until when |
| :--- | :--- | :---: | :---: | :--- |
| Plain HTTP | ESP32 → your laptop on the home network | ❌ | ❌ | until Phases 3 and 5 |
| HTTPS + `setInsecure()` | ESP32 → public API (Open-Meteo) | ✅ | ❌ | temporarily, until Module 27 |
| HTTPS + certificate checked | everything open to the internet | ✅ | ✅ | from Module 27 on |

> ➡️ **Time to practice!** Concepts 7–8 are enough for [Practice 6 — Weather from the internet](#practice-6--weather-from-the-internet-20-minutes) and [Practice 7 — Send readings to the laptop](#practice-7--send-readings-to-the-laptop-30-minutes). After that, come back to Concept 9.

### 9. The ESP32 becomes a web server, and how to find its address

So far, the ESP32 has always been the **letter sender** (the *client*): it's the one that asks the NTP server, Open-Meteo, and your laptop. Now we reverse its role. The ESP32 becomes a **server**: it waits, and your phone's browser is the one that comes knocking. Exactly like `webhook-receiver.js` on your laptop, except that this time the receiver is the ESP32.

![Diagram of the ESP32 becoming a web server: before, the ESP32 sent letters (a client); now it waits for letters (a server). Left: a phone browser at the address http://192.168.1.23/on shows Lamp: ON with the links Turn the lamp on and Turn the lamp off. The browser sends GET /on to the ESP32, a WebServer at door 80 with the address 192.168.1.23, which sets up server.on for /, /on, and /off plus server.onNotFound for 404, and calls server.handleClient() in loop(). The ESP32 replies 200 with an HTML page and moves the lamp relay on D32 (active LOW), which clicks. Note at the bottom: handleClient() hardly waits at all; no password, home network only, never set up port forwarding; in Module 11, the /on and /off links are retired and replaced with commands over MQTT](assets/web-server.png)

The **WebServer** library that comes with the esp32 package keeps it short:

```cpp
WebServer server(80);  // waits at door 80, the default HTTP door

void handleOn() {
  setLamp(true);
  server.send(200, "text/html", "<p>Lamp on</p>");  // send the reply letter
}

void setup() {
  // ... connect to the WiFi ...
  server.on("/on", handleOn);  // "if someone asks for /on, run handleOn()"
  server.begin();
}

void loop() {
  server.handleClient();  // anyone knocking? serve them briefly, then return right away
}
```

- **`server.on("/on", handleOn)`** divides the work by path: `/` for the main page, `/on` to turn on, `/off` to turn off. A path that isn't registered is answered with `404`.
- **`server.handleClient()`** hardly waits at all. If no browser is knocking, it returns after a 1-millisecond pause. If one is, it serves one browser request in a few milliseconds, then returns. So it's safe to call in Node 1's `loop()` alongside the sensors, the button, and the watchdog.
- Opening `http://192.168.1.23/on` in a browser means sending a **GET** `/on` letter to the ESP32. The browser then shows the content of the reply, a small HTML page made by the ESP32.

**No password, home network only.** This web server is deliberately plain: anyone connected to your home Wi-Fi can turn the lamp on and off. For practice, that's enough. Never open it to the internet through port forwarding. From Module 11 on, control through these links is retired and replaced with MQTT, then locked down in Modules 20–21.

**The next problem: its address can change.** To open the ESP32's page from your phone, you need its IP address. Remember Concept 1: DHCP **lends** addresses, and an address can change, for example after the router is restarted. The link you saved on your phone can suddenly stop working too. There are several ways to find the ESP32:

| Method | Advantage | Drawback |
| :--- | :--- | :--- |
| **Serial Monitor** | the easiest during practice | needs a laptop and a USB cable |
| **Node 1's OLED display** (the status page, Node 1 v1.1) | no laptop needed | you have to stand in front of Node 1 |
| **The device list in the router** | see all the devices at once | needs access to the router's admin page |
| **A fixed IP through the router** (*DHCP reservation*) ✅ **main path** | the address never changes; the link on your phone always works | needs access to the router's admin page, just once |
| **A `.local` name** (mDNS) 🎁 **bonus** | just type `node1.local`, no router settings | often fails on Android phones (especially older ones), and never works over mobile data or a VPN |

![Two cards on how to find Node 1. Left, the main path, a fixed address through the router (DHCP reservation, a reserved house number): on the router's admin page, the Address Reservation menu pairs the MAC A4-CF-12-E5-B7-C0 with 192.168.1.23, because the router recognizes the ESP32 by its ID card number; the ESP32 still asks for an address the usual way, the address doesn't change even when the router is restarted, and the /off link on the phone always works; the requirement is access to the router's admin page, just once. Right, the bonus, the name node1.local (mDNS): the ESP32 shouts "I'm node1!" on the home network; it works on Windows 10/11, macOS, and Linux laptops and on iPhones; it often fails on Android phones, especially older ones; it never works over mobile data or a VPN; if it fails, use its IP address. Note at the bottom: other ways to see the address are the Serial Monitor, the Node 1 v1.1 OLED status page, or the device list in the router](assets/fixed-address.png)

**A fixed IP through the router** (*DHCP reservation*, "a reserved house number"): we ask the DHCP clerk to **always** give the same number to the device with a particular ID card number (MAC address). It's set on the router's admin page, not in the code, so the ESP32 still asks for an address the usual way. This is our main path (Practice 9).

**A `.local` name** (mDNS, *multicast DNS*): the ESP32 "shouts" on the home network, "I'm `node1`!" Devices that are listening can find it by the name `node1.local` without needing to know its IP address. Two lines are enough:

```cpp
MDNS.begin("node1");                 // the name on the network: node1.local
MDNS.addService("http", "tcp", 80);  // announce: "I have a web server at door 80"
```

**Who can use this name?** Windows 10/11 laptops, macOS, iPhones, and Linux (with Avahi) generally can. Android only added support recently, and it still often fails, especially on older phones and some brands. Over mobile data or a VPN, a `.local` name can never be found, because it only works inside the home network. That's why the `.local` name is only a bonus; the main path is still the IP address reserved in the router.

> ➡️ **Time to practice!** Continue to [Practice 8 — A lamp switch on your phone](#practice-8--a-lamp-switch-on-your-phone-20-minutes) and [Practice 9 — A fixed address for Node 1](#practice-9--a-fixed-address-for-node-1-20-minutes), then come back to Concept 10.

### 10. The "price" of Wi-Fi: a bloated program, a locked ADC2, and current spikes

Wi-Fi makes Node 1 far more useful, but there are three prices to pay. You need to know all three before you put together Node 1 v1.1.

**1. The program bloats.** Compare the sketch sizes that Arduino IDE reports every time you upload (`Sketch uses … bytes`):

| Sketch | Program size | Share of the default program space (1,310,720 bytes) |
| :--- | ---: | ---: |
| Blink (Module 2), no Wi-Fi | 269,480 bytes | 20% |
| Node 1 v1.0 (Module 8), no Wi-Fi | 419,121 bytes | 31% |
| Quick Win: only connects to Wi-Fi | 889,428 bytes | 67% |
| Practice 6: Wi-Fi, HTTPS, and ArduinoJson | 1,033,240 bytes | 78% |
| Node 1 v1.1: everything from this week | 1,315,283 bytes | 100%, **doesn't fit** |

*Measured with esp32 package 3.3.7 in Wokwi; Node 1 v1.1 was compiled with the real-board settings (`USE_WOKWI = false`, see section ➕ B). In your Arduino IDE, the numbers may shift by a few thousand bytes.*

Compare Blink with the Quick Win: just connecting to Wi-Fi already adds about 620,000 bytes, because the Wi-Fi radio and all of the network's "etiquette" come into the program. The rest of the growth comes from HTTPS, the libraries, and Node 1's features. Node 1 v1.1 even goes slightly over that default program space, so Arduino IDE refuses it with the message `Sketch too big`.

Your board's flash memory is 4 MB, but not all of it is for the program. It's divided into several "shelves" called **partitions**, like a cabinet whose dividers were installed at the factory:

![Diagram of the shelves in the 4 MB flash memory. The default scheme, Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS): app0, 1.25 MB, for the running program, app1, 1.25 MB, the OTA shelf (Module 28), and SPIFFS, about 1.4 MB, a file shelf that isn't used; Node 1 v1.1 is 1,315,283 bytes, 4,563 bytes more than its program shelf, so it doesn't fit. The scheme from this module on, Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS): app0 and app1 at 1.875 MB each, and SPIFFS at 128 KB; Node 1 v1.1 fills 66%. Notes: the gray part at the left end holds the bootloader, the partition table, and the 20 KB NVS; it's in the same place in both schemes, so the watering threshold, the Boot # number, and the saved Wi-Fi aren't lost when the scheme is changed; the small gray part at the right end holds the 64 KB coredump, the system's notes when a program crashes; the two program shelves are the way to OTA in Module 28; the Partition Scheme menu doesn't exist in the DOIT ESP32 DEVKIT V1 board option, so we use ESP32 Dev Module (the Add-on section, step A)](assets/flash-partitions.png)

- **Default** (in the menu: **Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)**): two program shelves of **1.25 MB** each, plus about 1.4 MB for storing files (SPIFFS).
- **Minimal SPIFFS** (in the menu: **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**): two program shelves of **1.875 MB** each, and the file shelf shrinks to 128 KB.

Why are there **two** program shelves? The second shelf is used for **over-the-air updates** (OTA) in Module 28: a new program is sent over Wi-Fi to the empty shelf, then the board switches to that shelf without a USB cable. We don't use the file shelf (SPIFFS), because Node 1's data is stored in NVS and on the microSD card. So the Syllabus decided: **from Node 1 v1.1 in this module on, every sketch uses the Minimal SPIFFS scheme**. Its program shelves are roomier, and the door to OTA stays open. The sketches from the Quick Win to Practice 8 still fit on the default shelf, so they can all be uploaded with the **DOIT ESP32 DEVKIT V1** option, as we've done all along.

There's one hassle: the **DOIT ESP32 DEVKIT V1** board option in Arduino IDE **has no Partition Scheme menu**. That menu is in the **ESP32 Dev Module** option. You don't need to replace your board. The chip, the GPIO numbers, and the way you upload are exactly the same; only the board's "ID card" in Arduino IDE changes. The steps are in section ➕ A. NVS isn't affected either, because its shelf is in the same place in both schemes, so the watering threshold and the saved Wi-Fi aren't lost.

**2. ADC2 is locked while Wi-Fi is on.** The ESP32 has two analog-to-digital converters: ADC1 (GPIO 32–39) and ADC2 (GPIO 0, 2, 4, 12–15, and 25–27). The Wi-Fi radio uses ADC2 too, so while Wi-Fi is on, `analogRead()` on the ADC2 pins **silently answers `0`**, without any error message. The sensor seems "dead", even though the wiring is right. That's why Module 5 requires every analog sensor to be connected to an **ADC1** pin: the LDR on VP (GPIO 36) and the soil sensor on VN (GPIO 39). Node 1's ADC2 pins (the D4 LED, the D13 button, the D14 DHT22, D15 TRIG, the D25 pump, the D26 servo, and the D27 buzzer) are only used **digitally**, and that stays safe even while Wi-Fi is on.

**3. The current spikes.** When it transmits a Wi-Fi signal, the ESP32 draws much more current than when it's idle. According to its datasheet, the ESP32 chip draws up to about **240 mA** when transmitting at full power and about **95–100 mA** when listening, far above the board that was awake without Wi-Fi in Module 9 (about 55–65 mA). Those spikes happen again and again, every time a letter is sent. This is the Module 9 lesson: the ESP32's power source must be able to handle spikes. A weak laptop USB port, a thin and long USB cable, or a cheap charger can make the voltage dip right when Wi-Fi starts up, and then the board restarts with the message `Brownout detector was triggered`. Node 1, which uses the 1 A charger from Module 9, is already safe.

> ➡️ **Time to practice!** All the concepts have been covered. Try the [🧩 Challenges](#-independent-challenges), then put together [➕ Node 1 v1.1](#-add-on-to-mini-smart-home).

---

## 🔧 Step-by-step practice

Nine practices, **in order**. They all use the **Node 1 board** on your workbench, plugged into the laptop. The Node 1 v1.0 sketch does get overwritten during the practices; in the ➕ section, this board runs Node 1 v1.1.

**One new habit this week:** every practice sketch needs a `secrets.h` tab. So that you don't have to create it again and again, start every practice from the previous sketch: open that sketch, choose **File → Save As…** (**Ctrl + Shift + S**), then save it in the `module-10` folder under a new name. Watch which folder the save window opens: often it's not `module-10`, but the default sketch folder **Documents → Arduino**. First move to **Documents → GitHub → learn-iot → module-10**, and only then type the new name and click **Save**. Arduino IDE copies the **whole** sketch folder, including the `secrets.h` tab, then opens the copy in the same window. After that, you only need to replace the contents of the main tab.

These three steps in the ➕ section are requirements for passing (marked with ⭐):

1. **Section ➕ E** — the mini server on the laptop prints JSON from Node 1 (practice for it: Practice 7).
2. **Section ➕ F** — the lamp is turned off from your phone through a Node 1 link (practice for it: Practice 8).
3. **Section ➕ G** — Node 1 reconnects by itself after the router has been off for 1 minute (practice for it: Practice 3).

### Practice 1 — Install the secrets guard (10 minutes)

> 🖥️ **Tools:** **GitHub Desktop** and the `learn-iot` repository with the Quick Win sketch in it. Concepts used: 3.

Before this week's first commit, we install a "guard" that makes sure `secrets.h` is never uploaded along with the rest.

1. Open GitHub Desktop, then make sure the **Current repository** box shows **`learn-iot`**. In the **Changes** tab, you see the new files in the `module-10` folder, **including `secrets.h`**. **Don't commit yet.**
2. Open the menu **Repository → Repository settings…** (macOS: **Repository Settings…**), then choose the **Ignored files** tab (macOS: **Ignored Files**). The text box there holds the content of the `.gitignore` file in your repository's main folder. It may be empty, or it may already hold lines from Module 4.
3. Add one new line at the **very bottom** of that box:

   ```text
   secrets.h
   ```

4. Click **Save**.

   ![Illustration of GitHub Desktop 3.6.6, not a screenshot: installing the secrets.h guard through Repository, Repository settings…, Ignored files, adding the line secrets.h, then Save. In the GitHub Desktop window with the learn-iot repository, the Repository settings window is open: on the left the tabs Remote, Ignored files (selected, marker 1), and Git config; on the right the text "Editing .gitignore. This file specifies intentionally untracked files that Git should ignore. Files already tracked by Git are not affected.", the link Learn more about gitignore files, and a text box holding the line secrets.h (marker 2); below, the Save button (marker 3) and Cancel. The bottom part compares the Changes tab. Before saving, 2 changed files: module-10/module10_hello_wifi/module10_hello_wifi.ino and module-10/module10_hello_wifi/secrets.h, marked in red, don't commit. After saving, 2 changed files: .gitignore (marker 4) and module10_hello_wifi.ino: secrets.h is gone from the list and .gitignore appears. Captions: 1, the Ignored files tab (macOS: Ignored Files); 2, add the line secrets.h at the very bottom of the box; 3, click Save; 4, then commit .gitignore together with the sketch](assets/github-desktop-gitignore.png)
5. Look at the **Changes** list again: `secrets.h` **is gone from the list**, and `.gitignore` appears (as a new file, or as an old file that changed). The list now holds roughly `.gitignore` and `module-10/module10_hello_wifi/module10_hello_wifi.ino`.
6. Fill in **Summary** with `Module 10: Quick Win and the secrets.h guard`, click **Commit … to main**, then **Push origin**.
7. Open the `learn-iot` repository page on GitHub, then go into the `module-10/module10_hello_wifi` folder. The only file there is `module10_hello_wifi.ino`. **`secrets.h` stays on your laptop.**

**Expected output:** from now on, a file named `secrets.h` in any folder inside `learn-iot`, including in the next modules, never shows up in the **Changes** list.

**Inside the steps:**

- **One line for every folder.** The rule `secrets.h` without a slash applies to every file with that name, in any folder. That's why we write it in the `Repository settings` window, which fills in the `.gitignore` in the repository's main folder.
- **Why not right-click `secrets.h` in the Changes list?** Its right-click menu does offer **Ignore file (add to .gitignore)**, but that rule only applies to the one file in that folder; the `secrets.h` in your next sketch still shows up. Also watch out for the option **Ignore all .h files (add to .gitignore)**: all the `.h` tabs you made, including Node 1's, get ignored too.
- **Not using GitHub Desktop** (for example on Linux)? Create a file named `.gitignore` in the main `learn-iot` folder with VS Code, as in Module 4, then put the line `secrets.h` in it. The `git status` command no longer shows `secrets.h`.

Was `secrets.h` already committed before this practice? Open "`secrets.h` was already committed or pushed" in 🚨.

### Practice 2 — Get to know your network (20 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 board (the MB102 can stay off), the Quick Win sketch, and **VS Code** for notes. It works in Wokwi too, with `Wokwi-GUEST` in `secrets.h`. Concepts used: 1 and 2.

Before sending data anywhere, let's first get to know the "housing complex" where the ESP32 lives: which networks are visible, the ESP32's house number, the security post's number, and its ID card number.

1. Open the `module10_hello_wifi` sketch, choose **File → Save As…**, then save it in the `module-10` folder as `module10_know_your_network`. The `secrets.h` tab is copied along with it.
2. Replace the **entire** contents of the main tab with this code:

   ```cpp
   // Module 10 - Practice 2: get to know your network
   // Step 1: the ESP32 looks for all the WiFi networks it can "see".
   // Step 2: the ESP32 connects to the WiFi in the secrets.h tab, then prints its network "ID card".
   // After that, the signal strength is printed every 2 seconds.

   #include <WiFi.h>
   #include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

   const int PIN_STATUS_LED = 4;
   const unsigned long SIGNAL_INTERVAL = 2000;  // print the signal strength every 2 seconds
   unsigned long lastSignalTime = 0;

   // A short name for the network's type of lock (security).
   const char* securityName(wifi_auth_mode_t authMode) {
     if (authMode == WIFI_AUTH_OPEN) {
       return "open";
     }
     if (authMode == WIFI_AUTH_WPA2_PSK) {
       return "WPA2";
     }
     if (authMode == WIFI_AUTH_WPA_WPA2_PSK) {
       return "WPA/WPA2";
     }
     if (authMode == WIFI_AUTH_WPA2_WPA3_PSK) {
       return "WPA2/WPA3";
     }
     if (authMode == WIFI_AUTH_WPA3_PSK) {
       return "WPA3";
     }
     if (authMode == WIFI_AUTH_WPA2_ENTERPRISE) {
       return "Enterprise";
     }
     return "other";
   }

   // A simple word for the signal strength number (RSSI). The closer to 0, the stronger.
   const char* signalQuality(int rssi) {
     if (rssi >= -55) {
       return "very strong";
     }
     if (rssi >= -67) {
       return "strong";
     }
     if (rssi >= -75) {
       return "fair";
     }
     if (rssi >= -85) {
       return "weak";
     }
     return "very weak";
   }

   // Step 1: the list of visible networks. This scan takes a few seconds.
   void listNetworks() {
     Serial.println("Scanning for WiFi networks nearby...");
     int count = WiFi.scanNetworks();
     if (count <= 0) {
       Serial.println("No networks are visible.");
       return;
     }
     Serial.printf("Visible networks: %d\n", count);
     Serial.println(" No  Signal    Chan.  Security    Name (SSID)");
     bool myWiFiSeen = false;
     for (int i = 0; i < count; i++) {
       String name = WiFi.SSID(i);
       const char* marker = "";
       if (name == WIFI_NAME) {
         marker = "   <- your WiFi";
         myWiFiSeen = true;
       }
       Serial.printf("%3d  %4d dBm  %4d   %-10s  %s%s\n", i + 1, WiFi.RSSI(i), WiFi.channel(i),
                     securityName(WiFi.encryptionType(i)), name.c_str(), marker);
     }
     WiFi.scanDelete();  // free the memory used by the scan results
     if (!myWiFiSeen) {
       Serial.printf("\"%s\" is NOT visible. A typo, or is your WiFi 5 GHz only? (see Concept 2)\n", WIFI_NAME);
     }
   }

   // Step 2: the ESP32's "ID card" on your network.
   void printNetworkCard() {
     uint8_t mac[6];
     WiFi.macAddress(mac);
     char deviceId[13];  // 12 letters + the end-of-text mark
     snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

     Serial.println("---------- Network ID card ----------");
     Serial.printf("WiFi name (SSID) : %s\n", WiFi.SSID().c_str());
     Serial.printf("ESP32 IP address : %s\n", WiFi.localIP().toString().c_str());
     Serial.printf("Router (gateway) : %s\n", WiFi.gatewayIP().toString().c_str());
     Serial.printf("Subnet mask      : %s\n", WiFi.subnetMask().toString().c_str());
     Serial.printf("DNS              : %s\n", WiFi.dnsIP().toString().c_str());
     Serial.printf("Device name      : %s\n", WiFi.getHostname());
     Serial.printf("MAC address      : %s\n", WiFi.macAddress().c_str());
     Serial.printf("device_id        : %s\n", deviceId);
     Serial.printf("Channel          : %d\n", WiFi.channel());
     Serial.println("-------------------------------------");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_STATUS_LED, OUTPUT);
     Serial.println();

     WiFi.mode(WIFI_STA);
     listNetworks();

     Serial.printf("Connecting to \"%s\"", WIFI_NAME);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Not connected after 20 seconds. Check the secrets.h tab, then press EN.");
       return;
     }
     digitalWrite(PIN_STATUS_LED, HIGH);
     printNetworkCard();
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // not connected yet: no signal to report
     }
     if (millis() - lastSignalTime >= SIGNAL_INTERVAL) {
       lastSignalTime = millis();
       int rssi = WiFi.RSSI();
       Serial.printf("Signal: %d dBm (%s)\n", rssi, signalQuality(rssi));
     }
   }
   ```

3. Click **Upload**, then open the **Serial Monitor** (**115200 baud**). The network scan takes a few seconds; if you miss the first line, press **EN**.

   **Expected output** (example):

   ```text
   Scanning for WiFi networks nearby...
   Visible networks: 3
    No  Signal    Chan.  Security    Name (SSID)
     1   -47 dBm     6   WPA2        OurHome   <- your WiFi
     2   -71 dBm     1   WPA2/WPA3   Next_Door
     3   -79 dBm    11   WPA2        Jasmine_Dorm
   Connecting to "OurHome"..........
   ---------- Network ID card ----------
   WiFi name (SSID) : OurHome
   ESP32 IP address : 192.168.1.23
   Router (gateway) : 192.168.1.1
   Subnet mask      : 255.255.255.0
   DNS              : 192.168.1.1
   Device name      : esp32-E5B7C0
   MAC address      : A4:CF:12:E5:B7:C0
   device_id        : a4cf12e5b7c0
   Channel          : 6
   -------------------------------------
   Signal: -48 dBm (very strong)
   Signal: -49 dBm (very strong)
   Signal: -48 dBm (very strong)
   Signal: -61 dBm (strong)
   Signal: -63 dBm (strong)
   Signal: -50 dBm (very strong)
   ```

4. **Fill in your own "network card".** With VS Code, create a file `notes-module10.md` in the `module-10` folder, like `debugging-notes.md` in Module 8, then copy the numbers from the ID card: the ESP32's IP address, the router (gateway), the subnet mask, the MAC address, the `device_id`, and the channel. This card is used again in Practices 7 and 9. These notes get pushed to the public `learn-iot` repository too, so **never write a password** in them, neither the Wi-Fi password nor the password of the router's admin page.
5. **Compare with your phone.** Open the Wi-Fi settings on your phone, tap the name of the Wi-Fi it's connected to, then look for its IP address (usually under **Details** or the ⓘ icon). Are its first three numbers the same as the ESP32's address? Then the two are **neighbors in the same block** (Concept 1).
6. **Test the signal.** Watch the `Signal:` lines that appear every 2 seconds. With your palm, cover the end of the ESP32 module that has the zigzag line pattern (that's its antenna, at the end of the metal can) for a few seconds, then take your hand away. The number drops, then rises again.

**Inside the code:**

- **`WiFi.scanNetworks()`** listens on every channel (the 2.4 GHz band is divided further into numbered channels, for example 1, 6, and 11, a bit like stations on a radio) and collects the Wi-Fi names it hears, complete with their signal strength, channel (the `Chan.` column), and type of lock. During the scan, the sketch waits a few seconds; for a practice that runs once in `setup()`, that's fine. Because the ESP32 only has a 2.4 GHz radio, **5 GHz networks will never appear in this list**. Networks whose names are hidden don't appear either, because by default `scanNetworks()` skips them. If your Wi-Fi isn't marked `<- your WiFi`, the sketch prints a warning, and the cause is usually a typo in the name or a Wi-Fi network that is 5 GHz only (Concept 2).
- **`device_id`** is made from the MAC address with `snprintf()` and the pattern `%02x` ("two hexadecimal digits, lowercase"), then stored in a `char[13]`: twelve letters plus the end-of-text mark (Module 8). This number is Node 1's identity throughout the project: this week it's already used in the address Node 1 v1.1 sends to (section ➕ E), and from Module 11 on it becomes part of the MQTT topic names.
- **`Device name`** is the name the ESP32 reports to the router; by default it's `esp32-` followed by the last six characters of the MAC address. In the router's device list, your ESP32 usually appears under this name. In Practice 8, we change it to `node1` so it's easier to recognize.
- **Why does the signal number go up and down?** Radio waves bounce off walls and people walking by, so it's normal for the number to shift by a few dBm. What matters is the average. In Wokwi, the number is deliberately random.

> ⬆️ **Done with Practice 2?** Go back to [Concept 4](#4-connecting-without-getting-stuck-then-reconnecting-by-itself) (the ➡️ at the end of Concept 4 will take you to Practice 3).

### Practice 3 — The router unplug test (25 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 board (the MB102 can stay off), the `module10_know_your_network` sketch, a **Wi-Fi router** you're allowed to turn off for a while, and a clock or a stopwatch on your phone. Wokwi can't turn its router off, so the disconnect-and-reconnect test has to be done on the real board. Concepts used: 4.
>
> **Tell the people you live with first:** during this test, the internet at home is down for about 2–4 minutes. If that's not possible, use a phone hotspot (see the note at the end of the practice).

This time the ESP32 connects **without waiting**, then reports every time something changes. You'll turn off the router for 1 minute and see for yourself: `loop()` keeps running while the Wi-Fi is down, and then the ESP32 reconnects without being touched.

1. Open the `module10_know_your_network` sketch, choose **File → Save As…**, then save it in the `module-10` folder as `module10_reconnect`. Replace the **entire** contents of the main tab with this code:

   ```cpp
   // Module 10 - Practice 3: the router unplug test
   // The ESP32 connects WITHOUT waiting. If the WiFi drops, the esp32 package itself tries to reconnect;
   // this sketch only watches and reports. loop() never stops running:
   //   status LED steady on = connected; fast blinking = disconnected, trying again.

   #include <WiFi.h>
   #include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

   const int PIN_STATUS_LED = 4;
   const unsigned long REPORT_INTERVAL = 10000;  // a regular report every 10 seconds
   const unsigned long BLINK_DELAY = 100;        // fast blinking while the WiFi is down

   // "Flags" raised by the event function and lowered by loop(), like the interrupt in Module 8.
   // volatile: its value can change "silently" from outside loop().
   volatile bool gotIpFlag = false;
   volatile bool disconnectedFlag = false;
   volatile uint8_t disconnectReason = 0;
   volatile unsigned long failedAttempts = 0;  // how many connection attempts have failed

   bool connected = false;
   bool everConnected = false;
   unsigned long disconnectTime = 0;
   unsigned long lastReportTime = 0;
   unsigned long lastBlinkTime = 0;
   bool ledOn = false;
   unsigned long longestLoopUs = 0;  // the longest loop() pass since the last report (Module 8)

   // Called by the esp32 package on every WiFi event, from another "worker", not from loop().
   // The same rules as an interrupt function: as short as possible, just raise a flag.
   void onWiFiEvent(arduino_event_id_t event, arduino_event_info_t info) {
     if (event == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
       gotIpFlag = true;
     } else if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
       uint8_t reason = info.wifi_sta_disconnected.reason;
       if (reason == WIFI_REASON_STA_LEAVING) {
         return;  // 36: the esp32 package itself ends the old attempt before trying again; not a new failed attempt
       }
       disconnectReason = reason;
       failedAttempts++;
       disconnectedFlag = true;
     }
   }

   // The esp32 package's name for a disconnect reason code. Codes 209-212 have no name there yet.
   const char* reasonName(uint8_t code) {
     const char* name = WiFi.disconnectReasonName((wifi_err_reason_t)code);
     if (name[0] == '\0') {  // empty text: its first letter is already the end-of-text mark
       return "see the table in Concept 4";
     }
     return name;
   }

   // The clock since power-up, for example "00:01:23", at the start of every report line.
   const char* uptimeClock() {
     static char text[12];
     unsigned long seconds = millis() / 1000;
     snprintf(text, sizeof(text), "%02lu:%02lu:%02lu", seconds / 3600, (seconds / 60) % 60, seconds % 60);
     return text;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_STATUS_LED, OUTPUT);
     Serial.println();

     WiFi.onEvent(onWiFiEvent);  // register the event function BEFORE starting to connect
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     Serial.printf("[%s] Started connecting to \"%s\" (without waiting)\n", uptimeClock(), WIFI_NAME);
   }

   void loop() {
     unsigned long loopStart = micros();
     unsigned long now = millis();

     // 1. Lower the flags, then report what changed.
     if (gotIpFlag) {
       gotIpFlag = false;
       connected = true;
       if (!everConnected) {
         Serial.printf("[%s] Connected! IP %s, signal %d dBm\n", uptimeClock(),
                       WiFi.localIP().toString().c_str(), WiFi.RSSI());
       } else {
         Serial.printf("[%s] Connected AGAIN after %lu seconds offline. IP %s\n", uptimeClock(),
                       (now - disconnectTime) / 1000, WiFi.localIP().toString().c_str());
       }
       everConnected = true;
       failedAttempts = 0;
     }
     if (disconnectedFlag) {
       disconnectedFlag = false;
       if (connected) {  // just disconnected; failed retries are not reported one by one
         connected = false;
         disconnectTime = now;
         failedAttempts = 0;  // start counting the failed retries
         Serial.printf("[%s] WiFi DISCONNECTED (reason %u: %s). The esp32 package is trying to reconnect...\n",
                       uptimeClock(), disconnectReason, reasonName(disconnectReason));
       }
     }

     // 2. Status LED: steady on while connected, fast blinking while disconnected.
     if (connected) {
       digitalWrite(PIN_STATUS_LED, HIGH);
     } else if (now - lastBlinkTime >= BLINK_DELAY) {
       lastBlinkTime = now;
       ledOn = !ledOn;
       digitalWrite(PIN_STATUS_LED, ledOn);
     }

     // 3. Regular report: proof that loop() keeps running even when the WiFi is down.
     if (now - lastReportTime >= REPORT_INTERVAL) {
       lastReportTime = now;
       if (connected) {
         Serial.printf("[%s] Report: connected, signal %d dBm, longest loop() pass %lu ms\n",
                       uptimeClock(), WiFi.RSSI(), longestLoopUs / 1000);
       } else if (everConnected) {
         Serial.printf("[%s] Report: DISCONNECTED for %lu seconds, failed attempts: %lu, longest loop() pass %lu ms\n",
                       uptimeClock(), (now - disconnectTime) / 1000, failedAttempts, longestLoopUs / 1000);
       } else {
         Serial.printf("[%s] Report: never connected so far, failed attempts: %lu (last reason %u: %s)\n",
                       uptimeClock(), failedAttempts, disconnectReason, reasonName(disconnectReason));
       }
       longestLoopUs = 0;  // start measuring again for the next report
     }

     unsigned long loopTime = micros() - loopStart;
     if (loopTime > longestLoopUs) {
       longestLoopUs = loopTime;
     }
   }
   ```

2. Click **Upload**, then open the **Serial Monitor**. Wait until `Connected!` appears and the D4 status LED stays on.
3. **Turn off the router** by pressing its power button or unplugging its adapter. Write down the time.
4. Watch the Serial Monitor and the D4 LED:
   - Within a few seconds, `WiFi DISCONNECTED` appears with its reason code, and the LED starts **blinking fast**.
   - Every 10 seconds, the regular report still appears. The `longest loop() pass` number stays small: `loop()` is never held up.
5. After **1 minute**, **turn the router back on**. The router needs time to "wake up", usually 1–3 minutes. Don't touch the ESP32 board.
6. As soon as the router's Wi-Fi is broadcasting again, `Connected AGAIN after … seconds offline` appears, and the LED stays on again.

   **Expected output** (example; the numbers of seconds and attempts on your network will certainly be different):

   ```text
   [00:00:00] Started connecting to "OurHome" (without waiting)
   [00:00:02] Connected! IP 192.168.1.23, signal -57 dBm
   [00:00:10] Report: connected, signal -58 dBm, longest loop() pass 1 ms
   [00:00:20] Report: connected, signal -57 dBm, longest loop() pass 0 ms
   [00:00:30] Report: connected, signal -59 dBm, longest loop() pass 0 ms
   [00:00:36] WiFi DISCONNECTED (reason 200: BEACON_TIMEOUT). The esp32 package is trying to reconnect...
   [00:00:40] Report: DISCONNECTED for 3 seconds, failed attempts: 1, longest loop() pass 1 ms
   [00:00:50] Report: DISCONNECTED for 13 seconds, failed attempts: 5, longest loop() pass 0 ms
   [00:01:00] Report: DISCONNECTED for 23 seconds, failed attempts: 9, longest loop() pass 0 ms
   [00:01:10] Report: DISCONNECTED for 33 seconds, failed attempts: 13, longest loop() pass 1 ms
   [00:01:20] Report: DISCONNECTED for 43 seconds, failed attempts: 17, longest loop() pass 0 ms
   [00:01:30] Report: DISCONNECTED for 53 seconds, failed attempts: 21, longest loop() pass 0 ms
   [00:01:40] Report: DISCONNECTED for 63 seconds, failed attempts: 25, longest loop() pass 1 ms
   [00:01:50] Report: DISCONNECTED for 73 seconds, failed attempts: 29, longest loop() pass 0 ms
   [00:02:00] Report: DISCONNECTED for 83 seconds, failed attempts: 33, longest loop() pass 0 ms
   [00:02:10] Report: DISCONNECTED for 93 seconds, failed attempts: 37, longest loop() pass 1 ms
   [00:02:20] Report: DISCONNECTED for 103 seconds, failed attempts: 41, longest loop() pass 0 ms
   [00:02:30] Report: DISCONNECTED for 113 seconds, failed attempts: 45, longest loop() pass 0 ms
   [00:02:40] Report: DISCONNECTED for 123 seconds, failed attempts: 49, longest loop() pass 1 ms
   [00:02:44] Connected AGAIN after 127 seconds offline. IP 192.168.1.23
   [00:02:50] Report: connected, signal -58 dBm, longest loop() pass 1 ms
   ```

7. Write down in `notes-module10.md`: how many seconds the Wi-Fi was down, the reason code when it dropped, and how many failed attempts there were before it reconnected.

**Inside the code:**

- **There's no `while` waiting for the Wi-Fi.** `setup()` only registers the event function, calls `WiFi.begin()`, and finishes. All the checks are in `loop()` and use the `millis()` pattern from Module 8, so the status LED and the regular report are still handled on time, connected or not.
- **`onWiFiEvent()`** only raises flags. The messages are printed by `loop()` when it lowers the flags, exactly like the interrupt rule in Module 8.
- **The reason code when the router is turned off** is usually `200` (`BEACON_TIMEOUT`): the router's signal suddenly disappeared. While the router is off, every connection attempt fails with reason `201` (`NO_AP_FOUND`), and the esp32 package tries again right away. This sketch counts those attempts without printing them one by one. Before every new attempt, the esp32 package also ends its own old attempt and triggers a disconnect event with reason `36` (`STA_LEAVING`). Our event function ignores it so that the count and the reason code stay correct.
- **Reconnecting is done by the esp32 package**, not by our sketch. Not a single line in `loop()` tells the ESP32 to reconnect. In Node 1 v1.1, we still add a backup guard (Concept 4).
- **`longest loop() pass`** measures the longest pass since the previous report, like Node 1's `info` command. A small number, a few milliseconds at most, means `loop()` is never held up, even while the Wi-Fi is down. If `loop()` waited for the Wi-Fi with a `while` like the Quick Win, the number could be in the thousands.

> 📱 **Can't turn off the router at home?** Use a phone hotspot. Turn on the hotspot (make sure it uses 2.4 GHz, see Concept 2), replace the contents of `secrets.h` with your hotspot's name and password, then upload again. "Unplugging the router" then means turning the hotspot off for 1 minute, then turning it back on. A hotspot usually comes back within a few seconds, so the ESP32 also reconnects faster. When the test is over, **put your home Wi-Fi back in `secrets.h`**, then upload again. The reason: Practices 5–8 copy `secrets.h` from this sketch, and from Practice 7 on, the ESP32 has to be on the same Wi-Fi as your laptop. If your laptop and phone also stay on this hotspot network until the end of the module, `secrets.h` can keep the hotspot.

> ⬆️ **Done with Practice 3?** Go back to [Concept 5](#5-a-wi-fi-portal-like-at-a-hotel-wifimanager) (the ➡️ at the end of Concept 5 will take you to Practice 4).

### Practice 4 — A Wi-Fi portal like at a hotel (25 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 board (the MB102 can stay off), a **phone**, and the new **WiFiManager** library. Wokwi can't become an access point that a phone connects to, so this practice has to be done on the real board. Concepts used: 5.

This time there's no `secrets.h`. The Wi-Fi name and password are entered on your phone, just like setting up a smart lamp you've just bought.

#### 4.1 Install the WiFiManager library

1. In Arduino IDE, open the **Library Manager** (the book icon in the left bar), then type **WiFiManager**.
2. Many libraries with similar names appear. Choose the **WiFiManager** that says **by tzapu** under its title, version **2.0.17**, then click **INSTALL**. This library doesn't need any companion libraries.

#### 4.2 Upload the portal sketch

1. Open **File → New Sketch**, delete its contents, then paste this code. Save it as `module10_wifi_portal` in the `module-10` folder. This sketch really has **no** `secrets.h` tab.

   ```cpp
   // Module 10 - Practice 4: a WiFi portal like at a hotel (WiFiManager)
   // No secrets.h: the WiFi name and password are entered on a phone, then the ESP32 saves them in NVS.
   // To erase the saved WiFi: hold the D13 button, press and release EN, and let go of D13 after 2 seconds.

   #include <WiFi.h>
   #include <WiFiManager.h>  // new library this week: WiFiManager by tzapu

   const int PIN_STATUS_LED = 4;
   const int PIN_BUTTON = 13;
   const char PORTAL_NAME[] = "Node1-Practice";  // temporary WiFi name while the portal is open

   // Called by WiFiManager right when the portal opens.
   void onPortalOpened(WiFiManager* wm) {
     Serial.printf("Portal open. Connect your phone to the WiFi \"%s\", then open http://192.168.4.1\n", PORTAL_NAME);
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_STATUS_LED, OUTPUT);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     Serial.println();

     WiFiManager wm;
     wm.setDebugOutput(false);  // WiFiManager's own log messages are not printed
     wm.setAPCallback(onPortalOpened);
     wm.setConfigPortalTimeout(180);  // the portal closes by itself after 3 minutes without input
     wm.setConnectTimeout(20);        // tries a WiFi network for at most 20 seconds

     if (digitalRead(PIN_BUTTON) == LOW) {  // button held at power-up
       Serial.println("D13 button held: saved WiFi erased.");
       wm.resetSettings();
     }

     Serial.println("Trying the saved WiFi...");
     digitalWrite(PIN_STATUS_LED, HIGH);  // LED on = connecting or the portal is open
     // autoConnect(): use the saved WiFi; if there is none or it fails, open the portal.
     // Waits here until connected, or until the portal times out (allowed: only in setup()).
     bool connected = wm.autoConnect(PORTAL_NAME);
     digitalWrite(PIN_STATUS_LED, LOW);

     if (!connected) {
       Serial.println("Portal closed without WiFi. Press EN to try again.");
       return;
     }
     Serial.printf("Connected to \"%s\", IP %s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
     Serial.println("WiFi name and password saved in NVS. Press EN: this time it connects right away, without the portal.");
   }

   void loop() {
     // Empty: all the work of this practice is in setup().
   }
   ```

2. Click **Upload**, then open the **Serial Monitor**. If you miss the first line, press **EN**.

   **Expected output** (example):

   ```text
   Trying the saved WiFi...
   Connected to "OurHome", IP 192.168.1.23
   WiFi name and password saved in NVS. Press EN: this time it connects right away, without the portal.
   ```

Wait, the portal didn't appear, even though this sketch doesn't contain the Wi-Fi name and password! Here's the secret: every time the Quick Win, Practice 2, and Practice 3 called `WiFi.begin(WIFI_NAME, WIFI_PASSWORD)`, the esp32 package **quietly saved** that name and password in NVS. **WiFiManager** finds them and uses them right away. So, to see the portal, we first erase that saved Wi-Fi.

#### 4.3 Erase the saved Wi-Fi, then open the portal

1. Hold the D13 button on the workbench, press and release **EN**, and let go of the D13 button about 2 seconds later.

   **Expected output** (example):

   ```text
   D13 button held: saved WiFi erased.
   Trying the saved WiFi...
   Portal open. Connect your phone to the WiFi "Node1-Practice", then open http://192.168.4.1
   ```

2. The D4 status LED stays on: the portal is open and waits for your phone for 3 minutes. If time runs out, press **EN** to open it again (the saved Wi-Fi has already been erased, so the portal opens right away without holding D13).

#### 4.4 Enter the Wi-Fi from your phone

1. On your phone, **turn off mobile data** first. Open the Wi-Fi settings, then choose the **`Node1-Practice`** network (no password).
2. **iPhone:** the login sheet usually opens by itself and shows the **WiFiManager** page. Don't tap **Cancel**; that button disconnects from `Node1-Practice`. **Android:** if a notification to sign in to the network appears (**Sign in to Wi-Fi network**), tap that notification. If the phone asks whether to stay connected even though this network has no internet access, choose to stay connected.
3. **Nothing appears?** Open a browser, then type `http://192.168.4.1` in the address bar.
4. The **WiFiManager** page opens: its title is `WiFiManager`, below it the portal name `Node1-Practice`, then the buttons **Configure WiFi**, **Info**, **Exit**, and **Update**. Tap **Configure WiFi**.

   ![Illustration of the WiFiManager portal in a phone browser, rendered from WiFiManager 2.0.17's original HTML; the Wi-Fi names are only examples. Left: the page 192.168.4.1 titled WiFiManager with the portal name Node1-Practice, the buttons Configure WiFi (marker 1), Info, Exit, and Update, and the status No AP set. Right: the page 192.168.4.1/wifi: a list of the networks OurHome (marker 2), Next_Door, and Jasmine_Dorm with lock and signal icons; the SSID box already filled in with OurHome; the Password box holding a masked password (marker 3) and the Show Password checkbox; and the Save (marker 4) and Refresh buttons, then the status No AP set. Captions: 1, tap Configure WiFi; 2, tap your home Wi-Fi's name so the SSID box fills itself in; 3, type its password, and check Show Password to verify it; 4, tap Save, and the ESP32 tries to connect](assets/phone-portal.png)

   *Illustration: the portal pages are rendered from the original HTML, CSS, and text of the [WiFiManager](https://github.com/tzapu/WiFiManager) 2.0.17 library (© tzapu, MIT license); the Wi-Fi names are only examples.*

5. A list of the Wi-Fi networks the ESP32 can see appears, only the 2.4 GHz ones. Tap your home Wi-Fi's name so that the **SSID** box is filled in, then type its password in the **Password** box. Check **Show Password** to verify what you typed. Your Wi-Fi isn't in the list? Tap **Refresh**, or type its name yourself in the **SSID** box.
6. Tap **Save**. The page changes to the text `Saving Credentials`, `Trying to connect ESP to network.`, and `If it fails reconnect to AP to try again`.
7. If it succeeds, the ESP32 closes its portal, the `Node1-Practice` Wi-Fi disappears, and the D4 status LED goes off (in this sketch, the LED is only on while the ESP32 is connecting or the portal is open). Your phone goes back to its usual Wi-Fi by itself; turn its mobile data back on. If the password was wrong, the portal stays open: connect the phone to `Node1-Practice` again, then repeat from step 2.

**Expected output in the Serial Monitor** (example):

```text
Portal open. Connect your phone to the WiFi "Node1-Practice", then open http://192.168.4.1
Connected to "OurHome", IP 192.168.1.23
WiFi name and password saved in NVS. Press EN: this time it connects right away, without the portal.
```

#### 4.5 Prove that the Wi-Fi is saved

Press **EN**. This time there's no portal: the ESP32 connects right away using the Wi-Fi you just entered on your phone, just like the result in step 4.2.

**Inside the code:**

- **`wm.autoConnect(PORTAL_NAME)`** does all the steps of Concept 5: it tries the saved Wi-Fi; if there is none or it fails, it opens the portal and **waits** until you fill it in. Waiting here is allowed, because it only happens in `setup()`, and this practice sketch doesn't use the watchdog.
- **`wm.setConfigPortalTimeout(180)`** closes the portal by itself after 3 minutes without input. Without this line, the portal waits forever, for example if the router happens to be off when the ESP32 powers up.
- **`wm.setConnectTimeout(20)`** limits a connection attempt to 20 seconds. Without it, a wrong password makes the ESP32 wait up to 60 seconds.
- **`wm.setAPCallback(onPortalOpened)`** registers a function that is called right when the portal opens. The pattern is the same as the Wi-Fi event function in Practice 3.
- **`wm.resetSettings()`** erases the saved Wi-Fi from NVS. We only call it if the D13 button is held when the board powers up; the contents of your own NVS folders, for example Node 1's watering threshold, are not erased with it.
- **`wm.setDebugOutput(false)`** turns off **WiFiManager**'s built-in log (the lines starting with `*wm:`) so that the Serial Monitor stays tidy. Want to peek at how it works? Delete this line.
- **Who saves the password, and where?** Not **WiFiManager**, but the esp32 package itself, in the Wi-Fi's own part of NVS. Every `WiFi.begin(name, password)` overwrites what's saved there with the newest one; that's what happened from the Quick Win to Practice 3. On the other hand, `WiFi.begin()` **without** a name and password uses what's saved. Node 1 v1.1 uses this last approach.
- **The router is off when the ESP32 powers up?** `autoConnect()` tries for 20 seconds, then opens the portal for 3 minutes, and during that time the ESP32 does nothing else. For a practice sketch, that's fine. For Node 1, it's not allowed, because a power outage usually turns off the router and Node 1 at the same time, and the router starts up more slowly. That's why Node 1 v1.1 only opens the portal if there's **no** saved Wi-Fi yet or you **ask for it** by holding the D13 button (the ➕ section).

> ⬆️ **Done with Practice 4?** Go back to [Concept 6](#6-the-time-from-the-internet-ntp-time-zones-and-the-ts-timestamp) (the ➡️ at the end of Concept 6 will take you to Practice 5).

### Practice 5 — The time from the internet (15 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 board, and the `module10_reconnect` sketch. Your Wi-Fi must be connected to the **internet**, not just to the router. You can also do it in Wokwi. Concepts used: 6.

1. Open the `module10_reconnect` sketch, choose **File → Save As…**, then save it in the `module-10` folder under the name `module10_internet_clock`. Replace **all** of the main tab's contents with this code:

   ```cpp
   // Module 10 - Practice 5: the time from the internet (NTP)
   // The ESP32 asks an NTP server for the time, then every 5 seconds prints the local time
   // and the "ts" timestamp of the data contract (Syllabus Appendix A).

   #include <WiFi.h>
   #include <time.h>     // comes with the esp32 package: time(), localtime_r(), gmtime_r(), strftime()
   #include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

   // The time zone is written with the POSIX rule: the zone name, then its offset from UTC with the sign REVERSED.
   // WIB = UTC+7 is written "WIB-7". In central Indonesia: "WITA-8". In eastern Indonesia: "WIT-9".
   const char TIME_ZONE[] = "WIB-7";
   const char NTP_SERVER_1[] = "pool.ntp.org";       // a pool of volunteer NTP servers; picks a nearby one automatically
   const char NTP_SERVER_2[] = "asia.pool.ntp.org";  // backup: a pool of servers in Asia
   const unsigned long PRINT_INTERVAL = 5000;        // print the time every 5 seconds

   const char* DAY_NAMES[] = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
   const char* MONTH_NAMES[] = { "January", "February", "March", "April", "May", "June", "July",
                                 "August", "September", "October", "November", "December" };

   bool clockSet = false;
   unsigned long lastPrintTime = 0;

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.printf("Connecting to \"%s\"", WIFI_NAME);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Not connected after 20 seconds. Check the secrets.h tab, then press EN.");
       return;
     }
     Serial.printf("Connected, IP %s\n", WiFi.localIP().toString().c_str());

     // This one line: set the time zone, then have the esp32 package ask the NTP server for the time.
     // It asks in the background (no waiting), then asks again by itself every 3 hours.
     configTzTime(TIME_ZONE, NTP_SERVER_1, NTP_SERVER_2);
     Serial.println("Asking the NTP server for the time...");
   }

   void loop() {
     if (millis() - lastPrintTime < PRINT_INTERVAL) {
       return;
     }
     lastPrintTime = millis();

     time_t now = time(nullptr);  // the number of seconds since January 1, 1970 at 00:00 UTC
     struct tm local;             // a date-and-time "form": year, month, day, hour, minute, second
     localtime_r(&now, &local);   // fill in the form with the local time (using TIME_ZONE)

     if (local.tm_year + 1900 < 2025) {  // tm_year is counted from the year 1900
       Serial.printf("Clock not set yet: the ESP32 still thinks it is the year %d.\n", local.tm_year + 1900);
       return;
     }
     if (!clockSet) {
       clockSet = true;
       Serial.printf("Clock set from the internet! time() = %lld seconds since January 1, 1970 UTC.\n", (long long)now);
     }

     // The ts timestamp (Appendix A): always UTC, ISO-8601 format, ending with the letter Z.
     struct tm utc;
     gmtime_r(&now, &utc);
     char ts[21];  // "2026-10-17T01:23:45Z" = 20 letters + the end-of-text mark
     strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%SZ", &utc);

     char clockText[16];  // "08:23:45 WIB"; %Z = the time zone name
     strftime(clockText, sizeof(clockText), "%H:%M:%S %Z", &local);
     Serial.printf("%s, %d %s %d at %s | ts: %s\n", DAY_NAMES[local.tm_wday], local.tm_mday,
                   MONTH_NAMES[local.tm_mon], local.tm_year + 1900, clockText, ts);
   }
   ```

2. If you live in the WITA or WIT time zone, change `"WIB-7"` on the `TIME_ZONE` line to `"WITA-8"` or `"WIT-9"`.
3. Click **Upload**, then open the **Serial Monitor**.

   **Expected output** (Wokwi recording, on the morning of October 17, 2026):

   ```text
   Connecting to "Wokwi-GUEST"..................
   Connected, IP 10.10.0.2
   Asking the NTP server for the time...
   Clock not set yet: the ESP32 still thinks it is the year 1970.
   Clock not set yet: the ESP32 still thinks it is the year 1970.
   Clock set from the internet! time() = 1792212318 seconds since January 1, 1970 UTC.
   Saturday, 17 October 2026 at 11:45:18 WIB | ts: 2026-10-17T04:45:18Z
   Saturday, 17 October 2026 at 11:45:23 WIB | ts: 2026-10-17T04:45:23Z
   Saturday, 17 October 2026 at 11:45:28 WIB | ts: 2026-10-17T04:45:28Z
   Saturday, 17 October 2026 at 11:45:33 WIB | ts: 2026-10-17T04:45:33Z
   ```

4. Compare the time with the clock on your phone right when a new line appears (every 5 seconds): the difference is a second or two at most.
5. Look at each pair of local time and `ts`. The difference is always 7 hours (WIB), 8 hours (WITA), or 9 hours (WIT). If you run it before 07:00 WIB (08:00 WITA, 09:00 WIT), the date in `ts` is still **yesterday** (Concept 6).
6. **Press EN.** After `Asking the NTP server for the time...`, the line `Clock not set yet: the ESP32 still thinks it is the year 1970.` usually appears again (if the answer comes very quickly, this line can be skipped), then the time is right again. This is why, every time Node 1 powers up, it first waits for the time from the internet before sending any data.

**Inside the code:**

- **`time(nullptr)`** answers with the number of seconds since January 1, 1970, at 00:00 UTC. This number is the real "clock" inside the ESP32. For October 17, 2026, it's about 1.79 billion.
- **`localtime_r()`** and **`gmtime_r()`** break that number of seconds down into a `struct tm` "form" holding the year, month, day, hour, minute, and second. The first one uses `TIME_ZONE`; the second one is always UTC. The `_r` at the end of their names marks the version that's safe to use alongside other tasks; always choose this version.
- **`tm_year` is counted from the year 1900** and **`tm_mon` from 0** (January = 0). That's why the code writes `local.tm_year + 1900` and uses `tm_mon` directly as the drawer number in `MONTH_NAMES`, which also starts at 0. The same goes for `tm_wday`: Sunday = 0.
- **`strftime()`** builds text from that form with a pattern, for example `%Y-%m-%dT%H:%M:%SZ` for `ts`. `%Z` is replaced with the time zone's name (`WIB`). `strftime()` could also write the day and month names (`%A` and `%B`), but on the ESP32 they always come out in English. The sketch keeps its own `DAY_NAMES` and `MONTH_NAMES` arrays instead, so the names are easy to change into another language: the Indonesian edition of this curriculum fills the same arrays with Indonesian names.

> ⬆️ **Done with Practice 5?** Go back to [Concept 7](#7-http-letters-between-devices-with-json-inside) (the ➡️ at the end of Concept 8 will take you to Practice 6).

### Practice 6 — Weather from the internet (20 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 board, the `module10_internet_clock` sketch, and the new **ArduinoJson** library. You can also do it in Wokwi: click the **Library Manager** tab → the round **+** button → type **ArduinoJson** → click the result, as in Module 6, then change the line in the `libraries.txt` tab to `ArduinoJson@7.4.3`. Concepts used: 7 and 8.

Remember `weather.js` from Module 4? Now the ESP32 itself asks Open-Meteo for the weather, over HTTPS.

#### 6.1 Install the ArduinoJson library

1. In Arduino IDE, open the **Library Manager** (the books icon in the left sidebar), then type **ArduinoJson**.
2. Choose the **ArduinoJson** entry that says **by Benoit Blanchon** under its title, version **7.4.3**, then click **INSTALL**. This library doesn't need any companion libraries. Watch out for other libraries with similar names, for example **Arduino_JSON** by Arduino: it's used in a different way.

#### 6.2 Ask for the weather

1. Open the `module10_internet_clock` sketch, choose **File → Save As…**, then save it in the `module-10` folder under the name `module10_weather`. Replace **all** of the main tab's contents with this code:

   ```cpp
   // Module 10 - Practice 6: the weather from the internet (HTTPS GET + ArduinoJson)
   // Every minute, the ESP32 asks the free Open-Meteo API (as in Module 4) for the current weather,
   // then reads its reply, which comes as JSON.
   // Weather data: Open-Meteo.com, license CC BY 4.0 - https://open-meteo.com/

   #include <WiFi.h>
   #include <WiFiClientSecure.h>  // comes with the esp32 package: HTTPS connections (the "sealed envelope")
   #include <HTTPClient.h>        // comes with the esp32 package: writes HTTP letters and reads their replies
   #include <ArduinoJson.h>       // new library this week: reads and writes JSON
   #include "secrets.h"           // contains WIFI_NAME and WIFI_PASSWORD

   // The API address is built from several pieces of text; C++ joins them into one.
   const char WEATHER_ADDRESS[] =
     "https://api.open-meteo.com/v1/forecast"
     "?latitude=-6.2&longitude=106.85"  // Jakarta. Replace it with your location, as in Module 4
     "&current=temperature_2m,relative_humidity_2m,weather_code"
     "&timezone=auto";
   const unsigned long QUERY_INTERVAL = 60000;  // ask every 1 minute (the data itself is updated every 15 minutes)

   unsigned long lastQueryTime = 0;
   bool hasAsked = false;

   // The WMO weather codes that show up most often in Indonesia (the same as weather.js in Module 4).
   const char* weatherCondition(int code) {
     switch (code) {
       case 0: return "clear sky";
       case 1: return "mainly clear";
       case 2: return "partly cloudy";
       case 3: return "overcast";
       case 45: return "fog";
       case 51: return "light drizzle";
       case 53: return "drizzle";
       case 55: return "heavy drizzle";
       case 61: return "light rain";
       case 63: return "moderate rain";
       case 65: return "heavy rain";
       case 80: return "light showers";
       case 81: return "showers";
       case 82: return "heavy showers";
       case 95: return "thunderstorm";
       default: return "other weather code";
     }
   }

   void askWeather() {
     WiFiClientSecure client;
     client.setInsecure();  // TEMPORARY: a sealed envelope, but the server's identity is NOT checked (Concept 8, Module 27)

     HTTPClient http;
     http.setConnectTimeout(5000);  // at most 5 seconds to connect to the server
     http.setTimeout(5000);         // at most 5 seconds waiting for the reply

     Serial.println("Sending GET to api.open-meteo.com ...");
     unsigned long start = millis();
     http.begin(client, WEATHER_ADDRESS);
     int code = http.GET();  // send the request letter, wait for its reply

     if (code <= 0) {  // 0 or a negative number: no reply from the server (the letter didn't arrive, or the reply didn't come)
       Serial.printf("Sending failed: %s (code %d)\n", http.errorToString(code).c_str(), code);
       http.end();
       return;
     }
     Serial.printf("Status code: %d, answered in %lu ms\n", code, millis() - start);
     String content = http.getString();  // the reply's content (body), as JSON text
     http.end();                         // done: close the connection
     if (code != 200) {
       Serial.println("The server refused the request. Its reply:");
       Serial.println(content);
       return;
     }
     Serial.println("Reply body (JSON):");
     Serial.println(content);

     // The JSON "container" of ArduinoJson. The JSON text from the server is poured into it (text -> container).
     JsonDocument doc;
     DeserializationError error = deserializeJson(doc, content);
     if (error) {
       Serial.printf("Can't read the JSON: %s\n", error.c_str());
       return;
     }
     const char* timeText = doc["current"]["time"];
     const char* zone = doc["timezone"];
     float temperature = doc["current"]["temperature_2m"];
     int humidity = doc["current"]["relative_humidity_2m"];
     int weatherCode = doc["current"]["weather_code"];

     Serial.printf("Time     : %s (%s)\n", timeText, zone);
     Serial.printf("Temp     : %.1f C\n", temperature);
     Serial.printf("Humidity : %d %%\n", humidity);
     Serial.printf("Condition: %s (code %d)\n", weatherCondition(weatherCode), weatherCode);
     Serial.println("Data source: Open-Meteo.com (CC BY 4.0)");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.printf("Connecting to \"%s\"", WIFI_NAME);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Not connected after 20 seconds. Check the secrets.h tab, then press EN.");
       return;
     }
     Serial.printf("Connected, IP %s\n", WiFi.localIP().toString().c_str());
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // without WiFi, no letter can be sent
     }
     if (!hasAsked || millis() - lastQueryTime >= QUERY_INTERVAL) {
       hasAsked = true;
       lastQueryTime = millis();
       Serial.println();
       askWeather();
     }
   }
   ```

2. If you replaced the latitude and longitude with your own location in Module 4, use the same numbers again in the `?latitude=…&longitude=…` line.
3. Click **Upload**, then open the **Serial Monitor**. The weather is asked for once at the start, then every 1 minute.

   **Expected output** (Wokwi recording; the reply body is very long and is printed on one line):

   ```text
   Connecting to "Wokwi-GUEST".................
   Connected, IP 10.10.0.2

   Sending GET to api.open-meteo.com ...
   Status code: 200, answered in 6745 ms
   Reply body (JSON):
   {"latitude":-6.221441,"longitude":106.856186,"generationtime_ms":0.2238750457763672,"utc_offset_seconds":25200,"timezone":"Asia/Jakarta","timezone_abbreviation":"GMT+7","elevation":14.0,"current_units":{"time":"iso8601","interval":"seconds","temperature_2m":"°C","relative_humidity_2m":"%","weather_code":"wmo code"},"current":{"time":"2026-10-17T12:30","interval":900,"temperature_2m":36.3,"relative_humidity_2m":35,"weather_code":3}}
   Time     : 2026-10-17T12:30 (Asia/Jakarta)
   Temp     : 36.3 C
   Humidity : 35 %
   Condition: overcast (code 3)
   Data source: Open-Meteo.com (CC BY 4.0)
   ```

**Inside the code:**

- **`http.GET()`** sends the request letter, waits for the reply, then answers with its **status code**. 0 or a negative number means there was no reply from the server: the letter didn't arrive, or the reply didn't come in time. `http.errorToString(code)` translates it, for example into `connection refused`.
- **`http.getString()`** takes the reply's content (body) as text, and **`http.end()`** finishes that letter, then tidies up **HTTPClient** before the next letter. In this sketch, `http` and `client` are created again every time `askWeather()` runs, so the old connection is closed anyway when the function ends. Still, make a habit of calling `end()`, because later on **HTTPClient** is often used over and over.
- **`deserializeJson(doc, content)`** turns the JSON text into a container that can be read like a JavaScript object: `doc["current"]["temperature_2m"]` is the same as `data.current.temperature_2m` in Module 4. If the JSON is broken or cut off, `error` holds the reason.
- **`WiFiClientSecure` + `setInsecure()`**: an HTTPS connection with a sealed envelope, but the server's identity isn't checked (Concept 8). The `TEMPORARY` comment reminds us that Module 27 will replace it.
- **Answered in how many milliseconds?** On a real board, the first HTTPS request usually takes 1–3 seconds, because the ESP32 first has to exchange secret keys with the server. Wokwi is even slower. That's why `QUERY_INTERVAL` mustn't be too small, and a sketch that the watchdog watches must use short time limits.
- The **etiquette for using a free API** from Module 4 still applies: the weather data is only updated every 15 minutes, so even asking every minute is really too much. For a short practice that's fine; if you want to leave it running for a long time, change `QUERY_INTERVAL` to `900000` (15 minutes).

### Practice 7 — Send readings to the laptop (30 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, **VS Code** with the `mini-smart-home` folder from Module 4, the Node 1 board (the DHT22 and the LDR get 3.3 V from the ESP32, so the MB102 can stay off), and the `module10_weather` sketch. **The laptop and the ESP32 must be connected to the same Wi-Fi.** Wokwi can't reach your laptop, so this practice has to be done on a real board. Concepts used: 1, 7, and 8.

In Module 4, `send-data.js` pretended to be an ESP32. Now a real ESP32 sends its sensor readings to `webhook-receiver.js` on your laptop. This is practice for the completion requirement in section ➕ E.

#### 7.1 Find your laptop's IP address

The ESP32 needs to know your laptop's "house number". Don't use `localhost`: to the ESP32, `localhost` is the ESP32 itself.

- **Windows:** open the VS Code terminal (or **Command Prompt**), then type `ipconfig` and press **Enter**. Look for the **`Wireless LAN adapter Wi-Fi:`** section, then read the number on the **`IPv4 Address`** line:

  ```text
  Wireless LAN adapter Wi-Fi:

     Connection-specific DNS Suffix  . :
     Link-local IPv6 Address . . . . . : fe80::…
     IPv4 Address. . . . . . . . . . . : 192.168.1.10
     Subnet Mask . . . . . . . . . . . : 255.255.255.0
     Default Gateway . . . . . . . . . : 192.168.1.1
  ```

  Ignore the other sections, such as `Local Area Connection*`, VPN adapters, or VirtualBox. Another way, without a command: **Settings → Network & internet → Wi-Fi**, click the name of the Wi-Fi you're connected to (or **Properties**), then look at **IPv4 address**.
- **macOS:** in Terminal, type `ipconfig getifaddr en0` (if the result is empty, try `en1`). Another way: **System Settings → Network → Wi-Fi → Details → TCP/IP**.
- **Linux:** type `hostname -I`; the first address is usually your Wi-Fi address.

Write that address in `notes-module10.md`. Its first three numbers must be the same as those of the ESP32's address on your network ID card (Practice 2). If they're different, the laptop and the ESP32 aren't on the same network; open "The ESP32 and the laptop are on different networks" in 🚨.

#### 7.2 Start the receiver on the laptop

1. In VS Code, open the `mini-smart-home` folder, then open a terminal (**Terminal → New Terminal**) and go into the `tools` folder:

   ```bash
   cd tools
   ```

2. Start the receiver:

   ```bash
   node webhook-receiver.js
   ```

   **Expected output:**

   ```text
   Receiver ready at http://localhost:3000 — press Ctrl + C to stop.
   ```

   The word `localhost` there is only an example for your own laptop. In fact, this receiver listens on **all** of your laptop's addresses, including its Wi-Fi address.

3. **Windows: the firewall permission window.** When the receiver starts waiting for connections, Windows may show a `Windows Security` window for the **Node.js JavaScript Runtime** app. On Windows 11, its title is usually `Do you want to allow public and private networks to access this app?`; click **Allow**. If the title mentions `public`, this permission also applies on **public** networks. To stay as safe as in Module 4, afterward open the list of permissions as in step 5, then uncheck **Public** for **Node.js JavaScript Runtime**. On Windows 10, the title is `Windows Defender Firewall has blocked some features of this app`; check **Private networks** only, then click **Allow access**. If you already answered it in Module 4, this window doesn't appear again.
4. **Windows 10 and 11: make your home Wi-Fi a private network.** Windows 11 treats every new Wi-Fi as a **public** network (**Public network**) that's closed off to other devices, and on Windows 10 your home Wi-Fi can have the **Public** profile too. Open **Settings → Network & internet → Wi-Fi**, click your home Wi-Fi's name (or **Properties**), then under **Network profile type** choose **Private network**. On Windows 10, the menu names are slightly different, but the choice is the same: **Private**. Do this **only** for your own home Wi-Fi, not for a café or campus Wi-Fi.
5. **Chose Cancel back then?** Windows then quietly blocks Node.js and doesn't ask again. Here's how to unblock it, as promised in Module 4: in the **Windows Security** app, open **Firewall & network protection → Allow an app through firewall**, click **Change settings**, find **Node.js JavaScript Runtime** in the **Allowed apps and features** list, check the **Private** column, clear the **Public** column (uncheck it if it's checked), then click **OK**. If the name isn't in the list, click **Allow another app…** and choose the `node.exe` file.

**macOS:** if its firewall is on, macOS asks whether `node` may accept incoming connections; choose **Allow**.

#### 7.3 Send from the ESP32

1. Open the `module10_weather` sketch, choose **File → Save As…**, then save it in the `module-10` folder under the name `module10_send_to_laptop`. Replace **all** of the main tab's contents with this code:

   ```cpp
   // Module 10 - Practice 7: send readings to the laptop (an HTTP POST with JSON)
   // Every 10 seconds, the ESP32 sends the temperature and humidity (DHT22, D14) and the light (LDR, VP)
   // to webhook-receiver.js (Module 4) running on your laptop.
   // The laptop and the ESP32 must be connected to the SAME WiFi.

   #include <WiFi.h>
   #include <HTTPClient.h>
   #include <ArduinoJson.h>
   #include <DHT.h>  // the DHT library from Module 6
   #include <time.h>
   #include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

   // REPLACE 192.168.1.10 with your laptop's IP address (how to find it is in Practice 7).
   // Plain HTTP (not HTTPS): only for your own server on your home network (Concept 8).
   const char RECEIVER_ADDRESS[] = "http://192.168.1.10:3000/telemetry";

   const int PIN_DHT = 14;  // DHT22, Module 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Module 6
   const char TIME_ZONE[] = "WIB-7";
   const unsigned long SEND_INTERVAL = 10000;  // send every 10 seconds (Node 1 in the ➕ add-on: every 1 minute)

   DHT dht(PIN_DHT, DHT22);
   unsigned long lastSendTime = 0;
   int sendNumber = 0;

   // The ts timestamp (Appendix A), as in Practice 5. Returns false if the clock isn't set from the internet yet.
   bool makeTs(char* ts, size_t size) {
     time_t now = time(nullptr);
     struct tm utc;
     gmtime_r(&now, &utc);
     if (utc.tm_year + 1900 < 2025) {
       return false;
     }
     strftime(ts, size, "%Y-%m-%dT%H:%M:%SZ", &utc);
     return true;
   }

   void sendReading() {
     char ts[21];
     if (!makeTs(ts, sizeof(ts))) {
       Serial.println("Clock not set from the internet yet: sending postponed (every reading must carry a ts).");
       return;
     }

     // 1. Read the sensors, then build the letter's content (body) with ArduinoJson.
     int humidity = -1;  // -1 = couldn't be read, as in Node 1
     float humidityReading = dht.readHumidity();
     if (!isnan(humidityReading)) {
       humidity = round(humidityReading);
     }
     JsonDocument doc;
     doc["ts"] = ts;
     doc["temperature"] = dht.readTemperature();  // ArduinoJson writes NAN (couldn't be read) as null
     doc["humidity"] = humidity;
     doc["light"] = 4095 - analogRead(PIN_LDR);  // inverted as in Node 1: the brighter it is, the bigger the number
     char content[128];
     serializeJson(doc, content, sizeof(content));  // container -> JSON text

     // 2. Send the POST letter to the laptop.
     HTTPClient http;
     http.setConnectTimeout(2000);  // the laptop is at home: 2 seconds is already very long
     http.setTimeout(2000);
     http.begin(RECEIVER_ADDRESS);
     http.addHeader("Content-Type", "application/json");  // the label on the envelope: "it contains JSON"
     sendNumber++;
     Serial.printf("Send #%d: %s\n", sendNumber, content);
     int code = http.POST(content);

     // 3. Read the reply.
     if (code <= 0) {
       Serial.printf("  -> failed: %s (code %d). Is the receiver running? Is the laptop's IP address right?\n",
                     http.errorToString(code).c_str(), code);
     } else {
       Serial.printf("  -> status code %d, reply: %s\n", code, http.getString().c_str());
     }
     http.end();
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     Serial.println();
     Serial.printf("Connecting to \"%s\"", WIFI_NAME);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Not connected after 20 seconds. Check the secrets.h tab, then press EN.");
       return;
     }
     Serial.printf("Connected, ESP32 IP %s. Receiver: %s\n", WiFi.localIP().toString().c_str(), RECEIVER_ADDRESS);
     configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");  // the time from the internet (Practice 5)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;
     }
     if (millis() - lastSendTime >= SEND_INTERVAL) {
       lastSendTime = millis();
       sendReading();
     }
   }
   ```

2. **Replace `192.168.1.10`** on the `RECEIVER_ADDRESS` line with your laptop's IP address from step 7.1. Don't change the `:3000/telemetry` part.
3. Click **Upload**, then open the **Serial Monitor**. The first reading is only sent after the clock has been set from the internet, then the sending repeats every 10 seconds. If the clock isn't ready yet, the Serial Monitor prints `Clock not set from the internet yet: sending postponed (every reading must carry a ts).`, and the ESP32 tries again 10 seconds later. That's normal.

   **Expected output in the Serial Monitor** (example):

   ```text
   Connecting to "OurHome"..........
   Connected, ESP32 IP 192.168.1.23. Receiver: http://192.168.1.10:3000/telemetry
   Send #1: {"ts":"2026-10-17T01:30:12Z","temperature":28.5,"humidity":71,"light":2310}
     -> status code 200, reply: {"ok":true}
   Send #2: {"ts":"2026-10-17T01:30:22Z","temperature":28.5,"humidity":71,"light":2304}
     -> status code 200, reply: {"ok":true}
   Send #3: {"ts":"2026-10-17T01:30:32Z","temperature":28.6,"humidity":70,"light":2311}
     -> status code 200, reply: {"ok":true}
   ```

   **Expected output in the VS Code terminal** (example):

   ```text
   Receiver ready at http://localhost:3000 — press Ctrl + C to stop.
   [8:30:12 AM] POST /telemetry
   {"ts":"2026-10-17T01:30:12Z","temperature":28.5,"humidity":71,"light":2310}
   [8:30:22 AM] POST /telemetry
   {"ts":"2026-10-17T01:30:22Z","temperature":28.5,"humidity":71,"light":2304}
   [8:30:32 AM] POST /telemetry
   {"ts":"2026-10-17T01:30:32Z","temperature":28.6,"humidity":70,"light":2311}
   ```

4. **Test a failed reading.** Unplug the Node 1 board's USB, then pull the end of the DHT22's data wire out of the breadboard (as in the failure test of Module 6). Plug the USB back in, then look at the VS Code terminal: `temperature` is now `null`, and `humidity` is `-1`. Put the wire back (unplug the USB first).
5. **Test a stopped receiver.** In the VS Code terminal, press **Ctrl + C** to stop the receiver. The next send in the Serial Monitor fails with `connection refused` (code `-1`), but the ESP32 keeps running and tries again 10 seconds later. Start the receiver again with `node webhook-receiver.js`: the next send gets `200` again.

**Inside the code:**

- **`http.begin(RECEIVER_ADDRESS)`** without `WiFiClientSecure`: the address starts with `http://`, so **HTTPClient** uses a plain connection to door 3000 (Concept 8).
- **`http.addHeader("Content-Type", "application/json")`** is the label on the envelope: "it contains JSON". Exactly like `headers` in Module 4's `send-data.js`.
- **`http.POST(content)`** sends a letter containing the JSON text, then answers with the reply's status code. `webhook-receiver.js` always replies `200` with the content `{"ok":true}`.
- **`setConnectTimeout(2000)`** and **`setTimeout(2000)`**: if your laptop is off or doesn't answer, the ESP32 gives up after 2 seconds, not after its default 5 seconds. Node 1 v1.1 uses 1.5 seconds.
- **Why is the path `/telemetry`?** It's just a room name we chose, the same one `send-data.js` uses. Our receiver prints whatever is sent to any path. In the ➕ section, Node 1 adds its `device_id` to the path, for example `/msh/a4cf12e5b7c0/telemetry`, so the receiver knows who the sender is. This form is the same as the MQTT topic name in Module 11.

> ⬆️ **Done with Practice 7?** Go back to [Concept 9](#9-the-esp32-becomes-a-web-server-and-how-to-find-its-address) (the ➡️ at the end of Concept 9 will take you to Practice 8).

### Practice 8 — A lamp switch on your phone (20 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 workbench with the **MB102 on** (the relay needs 5 V from the MB102; remember the order: USB first, then the MB102), a **phone** connected to the same Wi-Fi, and the `module10_send_to_laptop` sketch. In Wokwi, this sketch can run, but its page can't be opened from a browser (see the Wokwi note in "How to use this module"). Concepts used: 9.

The lamp on your workbench is the lamp relay's indicator LED (D32) from Module 5. Now we turn it on and off from your phone.

1. Open the `module10_send_to_laptop` sketch, choose **File → Save As…**, then save it in the `module-10` folder under the name `module10_web_switch`. Replace **all** of the main tab's contents with this code:

   ```cpp
   // Module 10 - Practice 8: a lamp switch on your phone (the ESP32 as a web server)
   // Open http://<ESP32 IP address>/ in the browser of a phone connected to the SAME WiFi.
   // The /on link turns the lamp relay (D32) on, /off turns it off.
   // No password: for your home network only, never open it to the internet.

   #include <WiFi.h>
   #include <WebServer.h>  // comes with the esp32 package: the ESP32 becomes a small web server
   #include <ESPmDNS.h>    // comes with the esp32 package: the name node1.local (bonus, Practice 9)
   #include "secrets.h"    // contains WIFI_NAME and WIFI_PASSWORD

   const int PIN_LAMP_RELAY = 32;  // active-LOW relay (Module 5)
   const char DEVICE_NAME[] = "node1";

   WebServer server(80);  // 80 = the default HTTP "door" number
   bool lamp = false;

   // A ready-to-paste page. R"( ... )" = raw text: it may contain double quotes and several lines.
   // A pretty design waits for Module 22.
   const char PAGE[] = R"(<!DOCTYPE html>
   <html>
   <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <title>Node 1</title>
   </head>
   <body style="font-family: sans-serif; font-size: 22px; padding: 16px">
   <h2>Lamp: %STATE%</h2>
   <p><a href="/on">Turn the lamp on</a></p>
   <p><a href="/off">Turn the lamp off</a></p>
   </body>
   </html>)";

   void setLamp(bool isOn) {
     lamp = isOn;
     if (isOn) {
       digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
     } else {
       digitalWrite(PIN_LAMP_RELAY, HIGH);
     }
   }

   // Send the page with the latest lamp state.
   void sendPage() {
     String html = PAGE;
     if (lamp) {
       html.replace("%STATE%", "ON");
     } else {
       html.replace("%STATE%", "OFF");
     }
     server.send(200, "text/html", html);  // status code 200 = OK
   }

   // Log who asked for what, for example "GET /on from 192.168.1.42".
   void logRequest() {
     Serial.printf("GET %s from %s\n", server.uri().c_str(), server.client().remoteIP().toString().c_str());
   }

   void handleRoot() {
     logRequest();
     sendPage();
   }

   void handleOn() {
     logRequest();
     setLamp(true);
     sendPage();
   }

   void handleOff() {
     logRequest();
     setLamp(false);
     sendPage();
   }

   void handleNotFound() {
     logRequest();
     server.send(404, "text/plain", "404: this page doesn't exist. Try /, /on, or /off");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LAMP_RELAY, OUTPUT);
     setLamp(false);  // switch off right away: pinMode(OUTPUT) has just made the pin LOW (= relay pulls in)
     Serial.println();

     WiFi.setHostname(DEVICE_NAME);  // the name shown in the router's device list (Practice 9)
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     Serial.printf("Connecting to \"%s\"", WIFI_NAME);
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Not connected after 20 seconds. Check the secrets.h tab, then press EN.");
       return;
     }

     server.on("/", handleRoot);  // "if someone asks for /, run handleRoot()"
     server.on("/on", handleOn);
     server.on("/off", handleOff);
     server.onNotFound(handleNotFound);
     server.begin();
     Serial.printf("Web server ready. Open on your phone: http://%s/\n", WiFi.localIP().toString().c_str());

     if (MDNS.begin(DEVICE_NAME)) {  // bonus: the .local name (often fails on Android phones)
       MDNS.addService("http", "tcp", 80);
       Serial.printf("Or try: http://%s.local/ (often fails on Android phones)\n", DEVICE_NAME);
     }
   }

   void loop() {
     server.handleClient();  // serve the requests that came in, then return right away (no waiting)
   }
   ```

2. Click **Upload**, open the **Serial Monitor**, then **turn on the MB102**.

   **Expected output** (example):

   ```text
   Connecting to "OurHome"..........
   Web server ready. Open on your phone: http://192.168.1.23/
   Or try: http://node1.local/ (often fails on Android phones)
   ```

3. On your phone, **turn off mobile data** for a while so the phone really uses the home Wi-Fi. Open the browser, then type the address from the Serial Monitor into the address bar, **including `http://`**, for example `http://192.168.1.23/`.

   Phone browsers usually open a local address like this right away, without a warning. Still, write out `http://` in full: the ESP32's server only serves plain HTTP, so an address accidentally written with `https://` won't open.

4. Node 1's little page opens. Tap **Turn the lamp on**: the relay goes "click", the lamp relay's indicator LED lights up, and the page's heading changes to `Lamp: ON`. Tap **Turn the lamp off** to switch it off.

   ![Illustration of the Practice 8 lamp switch page in a phone browser, rendered from the HTML of the module10_web_switch sketch; the IP address is only an example. Address bar http://192.168.1.23/on. Marker 1 on the heading Lamp: ON, the lamp's current state (the contents of the lamp variable); marker 2 on the link Turn the lamp on, a link to /on that turns the lamp relay on; marker 3 on the link Turn the lamp off, a link to /off that turns the lamp relay off. The box next to it: meanwhile, the Serial Monitor prints GET / from 192.168.1.42, GET /favicon.ico from 192.168.1.42, and GET /on from 192.168.1.42](assets/phone-switch.png)

5. Look at the Serial Monitor: every tap is logged along with your phone's IP address.

   **Expected output** (example):

   ```text
   GET / from 192.168.1.42
   GET /favicon.ico from 192.168.1.42
   GET /on from 192.168.1.42
   GET /off from 192.168.1.42
   ```

6. **Save the link.** The address in the browser now ends with `/off` (if it doesn't, tap **Turn the lamp off**). Add that page to your **bookmarks** or to your home screen (**Add to Home screen**). Now turning off the lamp takes just one tap. Remember: this link only works as long as the ESP32's IP address doesn't change. Practice 9 takes care of that.

**Inside the code:**

- **`WebServer server(80);`** sets up a server at door 80. Because 80 is HTTP's default door, the address is just `http://192.168.1.23/`, without `:80`.
- **`server.on("/on", handleOn);`** registers a "handler" for each path. Paths that aren't registered are served by `handleNotFound()` with code `404`.
- **`server.handleClient();`** is the only thing in `loop()`. On every pass, it checks whether a browser is knocking; if not, it returns right away.
- **`PAGE`** is raw HTML text: `R"( … )"` makes C++ accept double quotes and several lines without marking them one by one. The `%STATE%` placeholder is replaced with `ON` or `OFF` through `html.replace()` before the page is sent. A pretty page is built with HTML, CSS, and React in Module 22.
- **`server.client().remoteIP()`** is the IP address of the browser that knocked. That way, you know which device turned the lamp on.
- **`GET /favicon.ico`** in the Serial Monitor? That's the browser asking for a small icon for its tab. We don't provide that icon, so it's normal for that request to get `404`.
- **Why does the relay stay off after the ESP32 restarts?** `setLamp(false)` is called right after `pinMode()`, just like in Node 1 since Module 5. A web server that "forgets" the lamp's state after a restart isn't a problem; it would be a problem if it turned something on without being asked.

> ⚠️ **Remember rule number 2 above:** this page has no password. Anyone on your home Wi-Fi can open it. Don't set up port forwarding to the ESP32.

### Practice 9 — A fixed address for Node 1 (20 minutes)

> 🖥️ **Tools:** a browser on the laptop or the phone, access to the **router's admin page** (if you have it), **Arduino IDE** and the **Serial Monitor**, the Node 1 workbench still running `module10_web_switch` from Practice 8 (MB102 on), and the **network ID card** from Practice 2. Concepts used: 1 and 9.

The `/off` link on your phone is only useful if the ESP32's address never changes. We ask the router to "reserve" a house number for the ESP32.

#### 9.1 Log in to the router's admin page

1. Look at the `Router (gateway)` field on your network ID card, for example `192.168.1.1` or `192.168.0.1`. Open that address in the laptop's browser: `http://192.168.1.1`. TP-Link routers can also be opened through `http://tplinkwifi.net`.
2. The router isn't yours? **Don't try to log in.** Ask its owner for permission, or skip straight to 9.4. Don't change the settings of someone else's router.
3. Log in with the admin username and password. Usually both are printed on the **sticker on the router's body**. Can't find the password? Skip to 9.4. Don't guess over and over: some routers temporarily lock the login page after three wrong tries.

#### 9.2 Find the ESP32 in the device list

Look for the page that lists the connected devices. On a TP-Link router, it's at **Advanced → Network → DHCP Client List** or **Basic → Network Map**. On other routers, its name is similar: DHCP clients, client list, or device information. Look for the name **`node1`**: that's the name given by `WiFi.setHostname()` in the Practice 8 sketch. Make sure its MAC address is the same as the one written on your network ID card. (An ESP32 whose sketch doesn't call `setHostname()` shows up with a name like `esp32-E5B7C0`.)

#### 9.3 Reserve a fixed address (*DHCP reservation*)

1. Find the address reservation menu. On a TP-Link router: **Advanced → Network → DHCP Server → Address Reservation**. On other routers, this menu may be called **DHCP Binding**, **Static DHCP**, or **DHCP Static IP**, usually in the LAN or DHCP section. Its contents are always the same: the device's **MAC address** and the reserved **IP address**.
2. Click **Add**. Fill in the ESP32's MAC address from your network ID card (TP-Link uses hyphens: `A4-CF-12-E5-B7-C0`) and **the IP address the ESP32 is using right now**, for example `192.168.1.23`. Reserving the address that's already in use is the safest choice: it's sure to be in the right block, and no other device is using it.
3. Save, then make sure the rule is active (TP-Link: **Status** switched on). If the router asks for a reboot (a restart), tell the people you live with first, because the internet drops for a moment, and only then follow its instructions.
4. **Test:** turn off the MB102, unplug the Node 1 board's USB, wait 10 seconds, plug it back in, then turn on the MB102. The Serial Monitor shows the same address (missed the line because the Serial Monitor only just reconnected? Press **EN**). The same address often shows up even without a reservation, so the real proof is your ESP32's MAC address, now listed in the router's reservation list. The `/off` link on your phone keeps working.

> 💡 **The modem your internet provider installed**, for example a fiber modem, sometimes doesn't show the address reservation menu to an ordinary user account. In that case, just note the ESP32's address from the Serial Monitor or from Node 1 v1.1's OLED status page every time the board powers up, then use the bonus in 9.4.

#### 9.4 Bonus: open it by the name `node1.local`

1. On the laptop, open `http://node1.local/`. The same page opens, without you needing to know its IP address.
2. Try it on your phone too (with mobile data off). On an iPhone it usually works; on some Android phones it doesn't. That's normal (Concept 9).
3. Write the result in `notes-module10.md`: which devices can open `node1.local`, and which can't.

> ⬆️ **Done with Practice 9?** Go back to [Concept 10](#10-the-price-of-wi-fi-a-bloated-program-a-locked-adc2-and-current-spikes).

---

## 🚨 Troubleshooting

Network problems often feel murky, because you can't see the cables. This week there are four sources of evidence: the **Serial Monitor** (disconnect reason codes, HTTP status codes), the **network ID card** from Practice 2, the **VS Code terminal** where the receiver runs, and the **phone's browser**. Start with the closest one: is the ESP32 connected to the Wi-Fi yet? Click a problem's title to open its explanation.

> [!IMPORTANT]
> **Before you check or move a wire on the workbench:** turn off the MB102, then unplug the USB. When you're done, plug in the USB first, then turn on the MB102. For network problems, the wires almost never need to be touched.

<details>
<summary><b><code>Compilation error</code> — this week's error messages</b></summary>

Each message starts with a file name and a line number. Read the **first error message** first: the errors after it are often just consequences of the first one.

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `fatal error: secrets.h: No such file or directory` | The `secrets.h` tab doesn't exist yet, or its name is wrong, for example `secret.h` or `Secrets.h`. | Create a new tab named exactly **`secrets.h`** (**⋯ → New Tab**), or fix its name through **⋯ → Rename**. A new sketch? Start from the previous sketch with **File → Save As…** so the tab gets copied along. |
| `'WIFI_NAME' was not declared in this scope` (or `'WIFI_PASSWORD' …`) | The `secrets.h` tab exists, but its contents don't use the names `WIFI_NAME` and `WIFI_PASSWORD`, or the `#include "secrets.h"` line was deleted. | Make the contents of `secrets.h` match the example in the Quick Win. |
| `fatal error: WiFiManager.h: No such file or directory` | The **WiFiManager** library isn't installed. | Install **WiFiManager by tzapu** version **2.0.17** (Practice 4.1). |
| `fatal error: ESP8266WiFi.h: No such file or directory` (from the file `WiFiManager.h`) | The installed **WiFiManager** is an old version (0.x) that's only for the ESP8266. | In the **Library Manager**, choose version **2.0.17**, then click **INSTALL**. |
| `fatal error: ArduinoJson.h: No such file or directory` | The **ArduinoJson** library isn't installed. | Install **ArduinoJson by Benoit Blanchon** version **7.4.3** (Practice 6.1). |
| `'ArduinoJson::V6…::JsonDocument::JsonDocument()' is protected within this context` | The installed **ArduinoJson** is version 6 (old). Its code is written differently. | In the **Library Manager**, choose version **7.4.3**, then click **INSTALL** (the old version is replaced automatically). |
| `fatal error: DHT.h: No such file or directory` | The DHT library from Module 6 isn't installed on this laptop. | Install **DHT sensor library by Adafruit** 1.4.7 (Module 6). |
| `Sketch too big` and `text section exceeds available space in board` | The program is bigger than the default program shelf (1,310,720 bytes). | Select **ESP32 Dev Module**, then set **Partition Scheme** to **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)** and **Flash Mode** to **DIO** (Concept 10, section ➕ A). |

</details>

<details>
<summary><b>The dots keep coming, then <code>Not connected after 20 seconds</code></b></summary>

The ESP32 couldn't get into your Wi-Fi. Check these in order:

1. **The Wi-Fi name** in `secrets.h` matches exactly, including upper and lower case, spaces, and punctuation. The surest way: run Practice 2, then copy the name from the list of visible networks.
2. **Does your Wi-Fi appear in the Practice 2 list?** If it doesn't, the ESP32 can't see it: the Wi-Fi is 5 GHz only, the board is too far away, or the network's name is hidden. See Concept 2.
3. **The password** is right, including upper and lower case. Try typing it again on your phone to make sure.
4. **Look at the reason code** with the Practice 3 sketch: the `never connected so far` report shows the last reason. `201` means the name wasn't found, `15` or `204` almost always means a wrong password, and `210` or `211` means the lock doesn't match (the table in Concept 4).
5. **The type of Wi-Fi doesn't suit** the ESP32: Wi-Fi with a login page (hotels, cafés, some boarding houses), office or campus Wi-Fi that asks for a username (for example eduroam), or an old router that still uses the WEP or WPA lock. Use your phone's hotspot.
6. **In Wokwi:** the network name is `Wokwi-GUEST`, and `WIFI_PASSWORD` must be empty (`""`). If it's filled with a password, the reason is `210`, and the ESP32 stops trying. If the name is wrong, the reason is `201`, just like on a real board.

</details>

<details>
<summary><b>The board restarts just as Wi-Fi turns on (<code>Brownout detector was triggered</code>)</b></summary>

While transmitting, the ESP32 draws much more current (Concept 10). If its power source is weak, the voltage dips and the brownout detector restarts the board, as in Module 9. Try another USB port on the laptop (preferably one on the laptop itself, not through an ordinary hub), switch to a shorter, thicker USB cable, or use a USB hub with its own power supply (Module 2). The 1 A charger from Module 9 is strong enough too, but while the board is plugged into the charger, the Serial Monitor can't be used.

</details>

<details>
<summary><b><code>secrets.h</code> was already committed or pushed</b></summary>

**Committed, but not pushed yet:** in GitHub Desktop, the last commit is shown at the bottom left (`Committed …`) with an **Undo** button next to it. Click **Undo**: the commit is undone, and its files go back to the **Changes** list. Install the guard as in Practice 1, then commit again without `secrets.h`.

**Already pushed:** treat the password as leaked. GitHub won't warn you: for a repository owned by an individual, like `learn-iot`, its secret scanner only recognizes the keys of certain services, not Wi-Fi passwords.

1. **Change the Wi-Fi password** on the router's admin page (the router isn't yours? Tell its owner right now), then update `secrets.h` and every device at home. This is the most important step. Just deleting the file isn't enough: its contents stay in the repository's history, and someone else may already have copied them.
2. **Take `secrets.h` out of Git's tracking.** All the `secrets.h` files have the same name, so first create a folder on the Desktop for each sketch whose `secrets.h` was committed (give it the same name as the sketch, for example `module10_hello_wifi`), so the files don't overwrite each other. Then temporarily move each of those `secrets.h` files from the `learn-iot` folder to the matching Desktop folder. Fill in **Summary** with `Remove secrets.h`, click **Commit … to main**, then **Push origin**. Install the guard as in Practice 1, then move each file back to its original sketch folder. Now GitHub Desktop ignores them.
3. **Removing it from the history** is an advanced, risky step. The guide is in GitHub's documentation, "Removing sensitive data from a repository". Once the password has been changed, this step isn't required.

</details>

<details>
<summary><b>The Wi-Fi portal doesn't show up on the phone, or <code>192.168.4.1</code> won't open</b></summary>

- **The Wi-Fi `Node1-Practice` (or `Node1-Home`) isn't in the phone's Wi-Fi list:** the portal already closed by itself after 3 minutes, or the ESP32 connected straight to the saved Wi-Fi. Look at the Serial Monitor. To open the portal again, hold the D13 button, press and release **EN**, and only release D13 about 2 seconds later (Practice 4.3) or after the OLED display shows `WIFI PORTAL` (Node 1 v1.1, step ➕ D4).
- **The phone is connected, but the page doesn't appear:** turn off mobile data, choose to stay connected if the phone asks about internet access, then type `http://192.168.4.1`, including `http://`. Also turn off any VPN on the phone.
- **You accidentally closed the login sheet on the iPhone:** open the Wi-Fi settings again, reconnect to `Node1-Practice`, then open `http://192.168.4.1` in Safari.
- **The portal's Wi-Fi list is empty** (`No networks found. Refresh to scan again.`): tap **Refresh**, or type your Wi-Fi's name yourself in the **SSID** box. 5 GHz Wi-Fi never appears there, as expected.
- **After Save, the portal shows up again:** the ESP32 failed to connect, usually because of a wrong password or because the chosen Wi-Fi is 5 GHz only. Fill it in again carefully.

</details>

<details>
<summary><b>The clock is never set (<code>Clock not set</code> keeps appearing)</b></summary>

- **The Wi-Fi is connected, but the internet is down?** Open a website on a phone connected to the same Wi-Fi, with mobile data turned off. NTP needs the internet, not just the router.
- **Office, campus, or boarding-house networks** sometimes block NTP. Try your phone's hotspot.
- **Was `configTzTime()` called before the ESP32 got an IP address?** Its first question fails, and the ESP32 only tries again about 15 seconds later. Wait a moment, or move that line so it only runs after the ESP32 is connected, as in Practice 5.
- **The time zone is written wrong**, for example `"WIB+7"`: the clock still runs, but it's 14 hours off. Write `"WIB-7"` (Concept 6).

</details>

<details>
<summary><b>Weather fails: <code>Sending failed: connection refused (code -1)</code></b></summary>

The number `-1` means the letter never arrived. The cause can be anything that happens before the server answers: Wi-Fi without internet, the name `api.open-meteo.com` can't be looked up (DNS), a very weak signal, or a failed HTTPS connection. Check the internet with your phone (mobile data off), make sure the `client.setInsecure();` line wasn't deleted (without it, the HTTPS connection fails right away), then wait for the next request. Code `400` means Open-Meteo rejected the address: check the latitude and longitude, as in Module 4.

</details>

<details>
<summary><b>Sending to the laptop fails: <code>connection refused (code -1)</code> or <code>read Timeout (code -11)</code></b></summary>

The ESP32 can't reach the receiver on your laptop. Check these in order:

1. **Is the receiver running?** The VS Code terminal must show `Receiver ready at http://localhost:3000`. Getting `Error: listen EADDRINUSE` when you start it? An old receiver is still running in another terminal: see 🚨 in Module 4.
2. **Is the laptop's IP address right?** Do Practice 7.1 again. The laptop's address can also change after the laptop sleeps or the router restarts.
3. **Test from your phone first.** Open `http://<laptop IP>:3000/` in the browser of a phone connected to the same Wi-Fi, with mobile data off. If the VS Code terminal prints `GET /`, the network is fine and the problem is in the sketch (usually a typo in `RECEIVER_ADDRESS`). If the phone can't get through either, the problem is in the laptop or the network; go on to steps 4–5.
4. **The laptop's firewall** is holding back incoming connections. On Windows, make sure **Node.js JavaScript Runtime** is allowed on **Private** networks and your home Wi-Fi has the **Private network** profile (Practice 7.2, steps 3–5). Antivirus or VPN apps with a firewall of their own can also hold it back; turn off the VPN during the practice.
5. **The laptop and the ESP32 are on different networks.** See the details in "The ESP32 and the laptop are on different networks" below.

</details>

<details>
<summary><b>The ESP32 and the laptop are on different networks</b></summary>

The first three numbers of their IP addresses must be the same (Concept 1). If they're different, it's usually because:

- The laptop is connected to **another Wi-Fi**, for example a neighbor's Wi-Fi, a phone hotspot, or a **5 GHz network with a different name** and a different address block. Connect the laptop to the same Wi-Fi as the ESP32.
- The laptop uses a **LAN cable** to another router, or a **VPN** is on. Turn off the VPN during the practice.
- One of them is connected to a **guest Wi-Fi**. A guest Wi-Fi usually isolates every device, so the devices can't reach each other. Use the main Wi-Fi.
- The router or hotspot has **device isolation** turned on (*AP isolation* or *client isolation*): devices on the same Wi-Fi are deliberately not allowed to reach each other. This is common on boarding-house, campus, and café Wi-Fi. Turn that feature off on the router's admin page if the router is your own, or use an Android phone's or a laptop's hotspot.

</details>

<details>
<summary><b>The phone can't open the ESP32 page</b></summary>

- **Mobile data is still on**, or the phone is connected to another Wi-Fi (for example a guest Wi-Fi). Turn off mobile data, then make sure the phone is connected to the same Wi-Fi as the ESP32.
- **The address is wrong or has changed.** Look up the latest address in the Serial Monitor, on the OLED status page (Node 1 v1.1), or in the router's device list. Practice 9 keeps the address from changing again.
- **It says `https://`.** The ESP32's server only serves `http://`.
- **`node1.local` won't open.** That's normal on many Android phones (Concept 9). Use its IP address.
- **A VPN on the phone is on.** Turn it off during the practice.
- **The page opens and its text changes, but the relay doesn't click:** the MB102 isn't on yet. The relay needs 5 V from the MB102.

</details>

<details>
<summary><b>Node 1 v1.1: specific problems</b></summary>

- **The Serial Monitor says `Wokwi mode`** even though it's a real board: `USE_WOKWI` in `config.h` is still `true`. Change it to `false`, then upload again. That isn't enough yet: Wokwi mode has already overwritten the home Wi-Fi saved in NVS with `Wokwi-GUEST` (every `WiFi.begin()` with a Wi-Fi name overwrites it; see "Inside the code" in Practice 4), so the Serial Monitor now says `Connecting to the saved WiFi "Wokwi-GUEST" (without waiting)...`. Open the portal as in step ➕ D4, then save your home Wi-Fi again.
- **`Sending failed: connection refused (code -1)` every minute:** the same as the problem with sending to the laptop above. Also check `SERVER_ADDRESS`: just `http://` + the laptop's IP address + `:3000`, with no path after it. Node 1 adds the `/msh/…/telemetry` path itself.
- **Don't write a name** (for example `http://mylaptop.local:3000`) in `SERVER_ADDRESS`. Looking up a name can take more than 5 seconds, and then the watchdog restarts Node 1. Always use the IP address.
- **The portal doesn't open at power-up:** Node 1 only opens the portal if there's no saved Wi-Fi yet. The Wi-Fi from this week's practices is still saved, so Node 1 uses it right away. To open the portal, hold the D13 button as in step ➕ D4, or type `wifi forget` in the Serial Monitor.
- **The lamp turns itself back on a few seconds after you turned it off from your phone:** that's the automatic lamp from Module 6. If the PIR sees motion in the dark, Node 1 turns the lamp on again, and the Serial Monitor says `Motion in the dark: automatic lamp on.` Do the step F test in a bright room, or move away from the PIR until the display shows `Motion: none`.
- **The status page keeps showing `WiFi disconnected`:** type `wifi` in the Serial Monitor to see the reason code, then compare it with the table in Concept 4. Reason `15` or `204` almost always means the saved password is wrong: what you enter in the portal is saved as soon as you tap **Save**, even if the connection fails. Open the portal again as in step ➕ D4, then fill it in again carefully.
- **`Restart: WDT` after installing v1.1:** something holds up `loop()` for more than 5 seconds. Notice when the restart happens: if it always coincides with the send schedule (about once a minute), the cause is the send to the server, most likely a `SERVER_ADDRESS` that holds a name, not an IP address. The `longest loop() pass` number in the `info` command can't catch it, because the stuck pass never finishes, and the number starts from zero again after the restart.

</details>

---

## 🔬 Technical Deep Dive (optional)

You can skip this section. Click a title if you want to dig deeper.

<details>
<summary><b>The HTTP letter as it really is: what the ESP32 actually sends</b></summary>

HTTP is really just **plain text** sent over a network connection. This is the letter **HTTPClient** sends in Practice 7, character by character (an example with the laptop address `192.168.1.10`; every line ends with two invisible characters, "back to the start of the line" and "new line"):

```text
POST /telemetry HTTP/1.1
Host: 192.168.1.10:3000
User-Agent: ESP32HTTPClient
Connection: keep-alive
Accept-Encoding: identity;q=1,chunked;q=0.1,*;q=0
Content-Type: application/json
Content-Length: 75

{"ts":"2026-10-17T01:30:12Z","temperature":28.5,"humidity":71,"light":2310}
```

- **The first line:** the method, the path, and the HTTP version.
- **`Host`**: the destination address, including its port.
- **`User-Agent`**: "who's sending". **HTTPClient** introduces itself as `ESP32HTTPClient`.
- **`Connection: keep-alive`**: "this connection may be used again for the next letter".
- **`Accept-Encoding`**: the reply formats **HTTPClient** can read.
- **`Content-Type`** is added by our sketch, while **`Content-Length`** (the content's length: 75 characters) is calculated by **HTTPClient** itself.
- **One empty line** separates the letter's head from its content.

The reply from `webhook-receiver.js` is plain text too:

```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sat, 17 Oct 2026 01:30:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

b
{"ok":true}
0
```

Because `webhook-receiver.js` doesn't state the length of its content, Node.js sends the content **piece by piece** (*chunked*): `b` is the piece's length in hexadecimal (11 characters: `{"ok":true}`), and `0` marks the last piece. **HTTPClient** joins the pieces itself, so `http.getString()` answers with the whole `{"ok":true}`. Open-Meteo replies this way too.

</details>

<details>
<summary><b>What DNS is, and why <code>-1</code> can mean "name not found"</b></summary>

Before sending a letter to `api.open-meteo.com`, the ESP32 has to know that server's house number. It asks the **DNS server** whose address DHCP handed out (usually your router itself, the `DNS` field on the Practice 2 network ID card). The router passes the question on to your internet provider's DNS server, which in turn asks other servers if it doesn't know the answer yet. The answer is stored for a while (cache) so the next question is answered faster.

If the DNS server doesn't answer, the ESP32 repeats its question several times before giving up: about 7 seconds for each DNS server. This time is **not** included in the time limit we set with `setConnectTimeout()`. To **HTTPClient**, failing to look up a name is the same as failing to connect, so the result is also `-1` (`connection refused`). That's why Node 1 always uses the laptop's **IP address**, not a name: no name lookup, no risk of waiting more than 5 seconds.

</details>

<details>
<summary><b>What an HTTPS certificate really checks (a preview of Module 27)</b></summary>

When the ESP32 connects to `https://api.open-meteo.com`, the server sends a **certificate**: a digital document that says, "This key belongs to `api.open-meteo.com`," signed by an issuing organization (*Certificate Authority*, CA). A careful checker verifies three things:

1. **The chain of signatures.** The server's certificate is signed by an intermediate CA, which is signed by a root CA. The root CA must be on the checker's **trusted list**. Browsers carry a list of more than a hundred root CAs.
2. **The name.** The name on the certificate must match the name we asked for. A valid certificate that belongs to another site is still rejected.
3. **The validity period.** An expired certificate is rejected. The esp32 package for Arduino actually does **not** check this date (that feature is turned off inside the package), so HTTPS on the ESP32 doesn't have to wait for the NTP clock.

The `setInsecure()` function skips all of those checks. The esp32 package 3.3.12 offers a handy new way: `client.useBuiltinCACertBundle()` uses the list of root CAs already built into the package, so the three checks above (except the date) are carried out. The price is about 70 KB of program space. Module 27 covers it fully, along with your own domain and certificate.

</details>

<details>
<summary><b>Why the <code>/on</code> and <code>/off</code> links aren't quite right</b></summary>

The HTTP rules call GET a **safe** request: opening an address must not change anything. The `/on` link breaks that rule, and that has consequences:

- **Link previews.** If you send the link `http://192.168.1.23/on` through a chat app, and the app makes a preview from a device connected to your home Wi-Fi, that "preview" can turn the lamp on too.
- **History and autocomplete.** Typing `192.168` in the browser can bring up `…/on` from the history right away, and then it gets picked by accident.
- **Reloading the page.** After you tap **Turn the lamp on**, the address in the browser becomes `…/on`. Reloading that page, or opening the old tab again tomorrow, means asking for `/on` once more, even if you've already turned the lamp off with the button.

The right way is to send commands with **POST** (for example through a form button) or, for IoT devices, through **MQTT** with an `ack` reply (Module 11), and then to lock them with a password (Modules 20–21). For this week, two simple links were chosen on purpose, so you can control the relay from your phone with as little code as possible.

</details>

<details>
<summary><b>A fixed IP in the code (<code>WiFi.config()</code>) or in the router?</b></summary>

The ESP32 can also force its own address without asking DHCP:

```cpp
IPAddress ip(192, 168, 1, 50), gateway(192, 168, 1, 1), subnet(255, 255, 255, 0), dns(192, 168, 1, 1);
WiFi.config(ip, gateway, subnet, dns);  // called before WiFi.begin()
```

This way doesn't need access to the router, but it has many drawbacks:

- **It can clash.** If DHCP happens to lend `192.168.1.50` to a guest's phone, two devices use the same house number, and both run into trouble.
- **It can't move house.** On another network (a phone hotspot, a friend's house), the address `192.168.1.x` may not be valid at all, so the ESP32 can't be reached or can't even get to the internet.
- **You have to change the code** every time the network changes.

An address reservation in the router (Practice 9) keeps the rule in one place, the router itself, while the ESP32 still asks for an address the usual way. That's why the Syllabus chose it as the main path.

</details>

<details>
<summary><b>Saving Wi-Fi radio power, and the web server's reply delay</b></summary>

Even while it stays connected, the ESP32's Wi-Fi radio actually **naps** often between the router's "beats" (*beacons*), then wakes up to listen for a letter addressed to it. Its default mode is called `WIFI_PS_MIN_MODEM`. This mode saves tens of milliamperes of current, but the web server's reply is sometimes delayed by a fraction of a second.

If Node 1's page feels slow to answer, try adding `WiFi.setSleep(false);` after `WiFi.mode(WIFI_STA);` or `WiFi.begin(…)`. The radio no longer naps, the reply comes faster, and the current goes up. Node 1 lives on its charger, so the extra current isn't a problem. For a battery-powered device like Node 2, power saving is left on instead.

</details>

<details>
<summary><b>ESPAsyncWebServer: a web server that never waits</b></summary>

The **WebServer** library that comes with the esp32 package serves **one** request at a time, inside `loop()`, through `handleClient()`. While the `handleOn()` function runs, `loop()` waits. For a small page like ours, that's only a few milliseconds.

**ESPAsyncWebServer** works differently: requests are served by a separate task in the background, several at once, without `handleClient()` in `loop()`. It also supports WebSocket, a connection that stays open so the page can update instantly. The drawbacks: the code is more complicated, and because its handler functions run in another task, you have to be careful when sharing variables with `loop()` (the flag rule of Practice 3). The version that's still maintained is now published by the **ESP32Async** organization on GitHub.

We stick with **WebServer** because it's simple and good enough, especially since the `/on` and `/off` links retire in Module 11.

</details>

---

## 🧩 Independent Challenges

Three levels, starting with the easiest. Do at least Level 1.

> 🖥️ **Tools:** **Arduino IDE**, the Node 1 workbench (MB102 on for Level 1), a phone, and the laptop with `webhook-receiver.js` for Levels 2 and 3. Start from the practice sketch named at each level, then **right away** choose **File → Save As…** and save it in the `module-10` folder under a new name, for example `module10_challenge1`. Your practice sketch stays intact, and the `secrets.h` tab gets copied along.

**Level 1 — A small change: a fan switch.** Start from `module10_web_switch` (Practice 8). Add the paths `/fan/on` and `/fan/off` for the fan relay on **D33** (active-LOW, like the lamp relay), complete with two new links in `PAGE` and the fan's state. Hint: write a `setFan()` function similar to `setLamp()`, and don't forget to switch the fan relay off right after `pinMode()`. Test it from your phone, then also try an address that doesn't exist, for example `/fan/start`: which code appears, and from which function?

**Level 2 — Combine: indoor and outdoor temperature.** Combine Practices 6 and 7: the ESP32 asks Open-Meteo for the outdoor temperature every 15 minutes, while the JSON sent to the laptop still goes out every 10 seconds and now holds both the DHT22 temperature (indoors) **and** the Open-Meteo temperature (outdoors), for example `{"ts": "…", "temperature": 28.5, "outdoor_temperature": 31.2}`. Hint: keep the last outdoor temperature in a global variable, so the send every 10 seconds can still use it even though the weather is only asked for every 15 minutes. After an hour, compare in the laptop's terminal: when is the indoor-outdoor difference largest?

**Level 3 — Your own design: a health report (`vitals`).** The data contract ([Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract)) has a second report besides the sensor readings: `vitals`, the device's health every 5 minutes. Starting from `module10_send_to_laptop`, add a second send to the `/vitals` path every 5 minutes, with content like the example in Appendix A: `ts`, `rssi` (signal strength), `uptime_s` (seconds since power-up), and `heap_free` (free memory, `ESP.getFreeHeap()`). Then:

- Let it run for an hour. Does `heap_free` keep going down? If so, memory is "leaking" somewhere in your program.
- Write the lowest and highest RSSI within that hour in `notes-module10.md`. In Module 11, Node 1 sends a report like this over MQTT.

---

## ➕ Add-on to "Mini Smart Home"

Module 10's contribution to the running project: **Node 1 v1.1**. Everything you practiced this week goes into one new module named `network`:

- connecting to the home Wi-Fi through the **portal**, without a single password in the code (Practice 4);
- automatic **reconnection** plus the backup guard, without ever making `loop()` wait (Practice 3);
- **the time from the internet**, and every send carries `ts` (Practice 5);
- sending the readings of all five sensors to `webhook-receiver.js` **every minute**, as JSON that follows Appendix A (Practice 7);
- a **web server** with the `/on` and `/off` links for the lamp, at `http://node1.local` or its IP address (Practices 8–9).

Node 1 now has **26 files**: the 24 files of v1.0 plus `network.h` and `network.cpp`. You don't rewrite all of them; two new files and a few small changes are enough.

> 🖥️ **Tools used:** **Arduino IDE** (with the **WiFiManager** and **ArduinoJson** libraries from Practices 4 and 6), **VS Code** with the receiver from Practice 7, **GitHub Desktop**, the complete workbench with the MB102 and Node 1's charger, a **phone**, and a router you're allowed to turn off for a moment. In Wokwi, use Node 1's [`diagram.json`](code/node-1-home/diagram.json) and [`libraries.txt`](code/node-1-home/libraries.txt) from this module's `code/` folder, then change `USE_WOKWI` to `true` (step B): the portal code is then left out of the compiled program, so the program fits on the Wokwi board. Don't have a Node 1 Wokwi project from Module 8 yet? Create all the other files through **▾ → New file...** and fill them from the [`code/node-1-home/`](code/node-1-home/) folder, as in Module 8's ➕. Wokwi can only test the Wi-Fi, the clock, and the log: the portal, the mini server on the laptop, and the phone can't be reached from there.
>
> ⭐ **Required** — part of the completion requirements: the mini server on the laptop prints JSON from Node 1 (step E), the lamp is turned off from a phone through Node 1's link (step F), and Node 1 reconnects by itself after the router has been off for 1 minute (step G).

![Map of Node 1 v1.1's 26 files: one new module, a few small changes. In the middle, node-1-home.ino marked CHANGED: it calls setupNetwork() and updateNetwork(), and sendData() is now filled in. At the top, config.h marked CHANGED: version 1.1.0 and the network section. Left, senses and hands: sensors.h/.cpp (five sensors) and actuators.h/.cpp (relays, pump, servo, buzzer); interface: button.h/.cpp (short and long press), heartbeat.h/.cpp (status LED), display.h/.cpp marked CHANGED (status: the Wi-Fi line and the portal message), and commands.h/.cpp marked CHANGED (only the .cpp: wifi, wifi forget, send). Right, brain and records: rules.h/.cpp (automatic watering and lamp) and card.h/.cpp (microSD CSV, optional); endurance: settings.h/.cpp (NVS: threshold, boot count), system.h/.cpp (uptime, restart reason), and logger.h/.cpp (DEBUG/INFO/ERROR logs). Bottom, network.h/.cpp marked NEW: Wi-Fi, the WiFiManager portal, and the reconnect guard (Practices 3–4); internet time and ts (Practice 5); JSON sent to the laptop every minute (Practice 7); the web server /, /on, and /off (Practice 8); the name node1.local (Practice 9); the Wi-Fi may drop, Node 1 must not stop. A dashed line means #include; PIN-MAP.md doesn't change because Wi-Fi uses no pins; all the files are in one sketch folder, firmware/node-1-home/](assets/node1-v11-file-map.png)

| File | What changes | How |
| :--- | :--- | :--- |
| `network.h` / `.cpp` | **new**: Wi-Fi, the portal, the clock, sending to the server, the web server, and the name `node1.local` | create new tabs, copy them from the curriculum (step B) |
| `config.h` | version `1.1.0` and the new section "Module 10: network" | change two parts; your calibration numbers stay (step B) |
| `node-1-home.ino` | calls `setupNetwork()` and `updateNetwork()`; `sendData()` is now filled in | replace all of its contents (step C) |
| `commands.cpp` | the new commands `wifi`, `wifi forget`, and `send` | replace all of its contents (step C) |
| `display.h` | the new function `showMessage()` for the portal instructions | replace all of its contents (step C) |
| `display.cpp` | the status page shows the IP address; the `showMessage()` function | three small changes; your display layout stays (step C) |

`PIN-MAP.md` doesn't change: Wi-Fi uses no pins.

### A. Switch to "ESP32 Dev Module" with the Minimal SPIFFS partition scheme

Node 1 v1.1 is 1,315,283 bytes, a little **bigger** than the default program shelf (1,310,720 bytes, Concept 10). With the **DOIT ESP32 DEVKIT V1** board option, Arduino IDE refuses it with the message `Sketch too big`. So we switch shelves first, before installing the new code.

1. Open your Node 1: **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home** → `node-1-home.ino`.
2. Click the board selector in the top bar (it now says **DOIT ESP32 DEVKIT V1**) → **Select other board and port…**. In the **BOARDS** column, type `esp32 dev`, then click **ESP32 Dev Module**. The port stays the Node 1 board's port. Click **OK**. Remember Module 2: from the start, this option has been a valid alternative for your DevKit V1 board.
3. Open the **Tools** menu. There are more options now. Change two of them:
   - **Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**.
   - **Flash Mode** → **DIO**, the same as the **DOIT ESP32 DEVKIT V1** setting you've used so far.

   Leave the other options alone. One exception: did you lower **Upload Speed** to 115200 in Module 2 so uploads wouldn't fail? Choose **Upload Speed** → **115200** again here, because the new board option goes back to 921600. After **Partition Scheme** and **Flash Mode** are changed, the **Tools** menu shows `Partition Scheme: "Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)"` and `Flash Mode: "DIO"`.

![Illustration of Arduino IDE 2.3.10 with the node-1-home sketch and the Tools menu open for the ESP32 Dev Module board. The menu's contents from the top: Auto Format, Archive Sketch, Manage Libraries..., Serial Monitor, Serial Plotter; Firmware Updater, Upload SSL Root Certificates; Board: "ESP32 Dev Module" (marker 1), Port: "COM3", Reload Board Data, Get Board Info; then the board options: CPU Frequency: "240MHz (WiFi/BT)", Core Debug Level: "None", Erase All Flash Before Sketch Upload: "Disabled", Events Run On: "Core 1", Flash Frequency: "80MHz", Flash Mode: "DIO" (marker 3), Flash Size: "4MB (32Mb)", JTAG Adapter: "Disabled", Arduino Runs On: "Core 1", Partition Scheme: "Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)", which is highlighted, PSRAM: "Disabled", Upload Speed: "921600", Zigbee Mode: "Disabled"; last, Programmer and Burn Bootloader. The Partition Scheme submenu is open on the right, with twenty schemes from Default 4MB with spiffs to Custom, and Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS) checked (marker 2). Legend: 1, the ESP32 Dev Module board, through the board selector in the top bar, then Select other board and port; 2, Tools, Partition Scheme, Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS); 3, Tools, Flash Mode, DIO](assets/partition-menu.png)

Arduino IDE remembers these settings for the **ESP32 Dev Module** option, so you only set them once. **From now on, every sketch in the curriculum is uploaded with these settings.** The contents of NVS, including the watering threshold, the `Boot #` number, and the saved Wi-Fi, aren't lost, because the NVS shelf is in the same place in both schemes. Only the contents of the file shelf (SPIFFS) are lost, and we don't use that shelf anyway.

### B. Create two new files and change `config.h`

1. **`network.h` and `network.cpp`.** With `node-1-home.ino` open, create two new tabs as in Module 8 (**⋯ → New Tab**, type the name with its ending, then click **OK**; in Wokwi: **▾ → New file...**). Fill each one the same way: right-click the file's name → **Open link in new tab**, click **Copy raw file**, go back to Arduino IDE, then paste (**Ctrl + V**).
   - [`network.h`](code/node-1-home/network.h)
   - [`network.cpp`](code/node-1-home/network.cpp)
2. **The firmware version.** In the **`config.h`** tab, change `"1.0.0"` on the `FIRMWARE_VERSION` line to `"1.1.0"`.
3. **The network section.** Still in `config.h`, scroll to the very bottom, then add this section after the `WATCHDOG_TIMEOUT` line:

   ```cpp
   // ---------- Module 10: network ----------
   const bool USE_WOKWI = false;                              // true ONLY in Wokwi: connects to Wokwi-GUEST without the portal
   const char DEVICE_NAME[] = "node1";                        // the name in the router's device list and the address node1.local
   const char PORTAL_NAME[] = "Node1-Home";                   // temporary WiFi name while the portal is open
   const unsigned long PORTAL_TIMEOUT = 180;                  // seconds: the portal closes by itself when unused
   const char SERVER_ADDRESS[] = "http://192.168.1.10:3000";  // REPLACE with your laptop's IP address (Practice 7)
   const unsigned long SEND_INTERVAL = 60000;                 // readings are sent to the server every 1 minute
   const char TIME_ZONE[] = "WIB-7";                          // WITA: "WITA-8", WIT: "WIT-9" (Practice 5)
   ```

4. **Replace `192.168.1.10`** on the `SERVER_ADDRESS` line with your laptop's IP address from Practice 7. Write only `http://`, the IP address, and `:3000`, **without** a path after it, and **don't** use a name such as `mylaptop.local` (🚨 "Node 1 v1.1: specific problems").
5. Live in the WITA or WIT time zone? Also change `TIME_ZONE` as in Practice 5. **In Wokwi**, change `USE_WOKWI` to `true`; on a real board, leave it `false`.

Your Module 6 calibration numbers and your rules at the top of `config.h` aren't touched.

### C. Replace three files and change `display.cpp`

1. **`node-1-home.ino`, `commands.cpp`, and `display.h`**: these three files don't hold any design of your own, so their contents are replaced completely. For each file, click its tab, empty it (**Ctrl + A**, then **Delete**), then paste the new version with **Copy raw file** as in step B:
   - [`node-1-home.ino`](code/node-1-home/node-1-home.ino) (in Wokwi: the **`sketch.ino`** tab)
   - [`commands.cpp`](code/node-1-home/commands.cpp). Ever added commands of your own, for example from Module 8's 🧩? Copy your part first, then paste it back in afterward.
   - [`display.h`](code/node-1-home/display.h)
2. **`display.cpp`** holds your readings page design from Module 7, so we change it only a little. Click the **`display.cpp`** tab:
   1. At the very top, right **below** the `#include "settings.h"` line, add:

      ```cpp
      #include "network.h"  // Module 10: networkText()
      ```

   2. Press **Ctrl + F**, search for `Soil threshold`, then replace that **whole line** with:

      ```cpp
        snprintf(text, sizeof(text), "WiFi %s", networkText());  // Module 10: Node 1's IP address, "disconnected", or "off"
      ```

      Yes, the threshold line is sacrificed: the 128 × 64 pixel display only fits six lines. You can still see the watering threshold with the `threshold` command.
   3. Scroll to the **very bottom** of `display.cpp`, then add this new function after the last `}`:

      ```cpp
      // ---------- Module 10: a short four-line message ----------
      // For example, the WiFi portal instructions. The readings page comes back with the next reading.
      void showMessage(const char* title, const char* line2, const char* line3, const char* line4) {
        if (!displayFound) {
          return;
        }
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 0);
        display.print(title);
        display.drawFastHLine(0, 11, 128, SSD1306_WHITE);  // divider line under the title
        display.setCursor(0, 18);
        display.print(line2);
        display.setCursor(0, 30);
        display.print(line3);
        display.setCursor(0, 46);
        display.print(line4);
        display.display();
      }
      ```

**Check before you go on:** there are now **26** tabs (in Wokwi, the `diagram.json` tab and the library tab don't count, as in Module 8), the `network.cpp` tab starts with `// network.cpp - the code of the network module…`, and the main tab's first line says `firmware v1.1.0 (Module 10)`.

### D. Verify, Upload, and connect to Wi-Fi

1. Click **Verify**. If an error appears, read the **first error message** and compare the tab it names with the [reference version](code/node-1-home/). The **Output** panel now shows `Sketch uses …` ending with `Maximum is 1966080 bytes.` That's the sign that the new partition scheme is in effect. Node 1 v1.1 now uses about 66% of its program shelf.
2. Plug in the USB, turn on the MB102, then click **Upload**. Open the **Serial Monitor**.
3. **Is the Wi-Fi still saved from the practices?** Node 1 uses it right away, without the portal. The example below was made while the receiver on the laptop was already running. If the receiver isn't running yet, the last line reads `Sending failed: connection refused (code -1). Is the receiver on the laptop running?`, and that's normal until step E.

   **Expected output** (example; the reading lines every 2 seconds aren't quoted):

   ```text
   [00:00:00] INFO  Node 1 Home - firmware 1.1.0
   [00:00:00] INFO  Last restart reason: POWERON
   [00:00:00] INFO  Boot #15. soil_watering threshold: 35 % (from NVS)
   [00:00:01] INFO  microSD card ready: readings are logged to node1.csv every 30 seconds.
   [00:00:01] INFO  device_id a4cf12e5b7c0
   [00:00:01] INFO  Connecting to the saved WiFi "OurHome" (without waiting)...
   [00:00:01] INFO  Watchdog active: automatic restart if loop() is stuck for more than 5 seconds.
   [00:00:03] INFO  WiFi connected to "OurHome": IP 192.168.1.23, signal -58 dBm
   [00:00:03] INFO  Open on your phone: http://192.168.1.23/ or http://node1.local/ (often fails on Android phones)
   [00:00:08] INFO  Clock set from the internet: 2026-10-17T01:30:59Z
   [00:00:09] INFO  Sent to the server (code 200, 41 ms)
   ```

   **No saved Wi-Fi yet** (for example after `wifi forget`, or on a new board)? The OLED display and the Serial Monitor show the portal instructions. Follow the phone steps of Practice 4.4, this time with the Wi-Fi named **`Node1-Home`**. The page is a little different: its title is `Node 1 Home`, and its buttons are only **Configure WiFi**, **Info**, and **Exit** (the **Update** button is hidden on purpose). While the portal is open (3 minutes at most), Node 1 hasn't started working yet: the status LED stays on, and the display keeps showing the portal instructions.
4. **Prove that the portal works.** Hold the D13 button, press and release **EN**, and release D13 after the OLED display shows `WIFI PORTAL`. Enter your Wi-Fi from your phone as above. That password is now stored in the NVS of the Node 1 board, not in any Node 1 code. (The `secrets.h` tabs of the practice sketches do still keep it on your laptop, but `.gitignore` still guards them.) This portal stays open without a password until you finish or 3 minutes pass, and during that time anyone near your home can connect to `Node1-Home` too. So open the portal only while you're filling it in yourself.
5. Hold the D13 button for 1 second (as usual, after power-up) to open the status page: its fifth line now says `WiFi 192.168.1.23`. Also type `wifi` in the Serial Monitor:

   **Expected output** (example):

   ```text
   [00:02:08] INFO  Long button press: status page shown for 10 seconds.
   wifi: connected to "OurHome", IP 192.168.1.23, signal -57 dBm
   wifi: device_id a4cf12e5b7c0, name node1, time 2026-10-17T01:33:11Z
   wifi: sending to http://192.168.1.10:3000/msh/a4cf12e5b7c0/telemetry every 60 seconds, last code 200
   ```

### E. ⭐ The mini server on the laptop prints JSON from Node 1

1. Start the receiver on the laptop as in Practice 7.2 (`node webhook-receiver.js` in the `tools` folder).
2. Wait 1 minute at most, or type `send` in the Serial Monitor so Node 1 sends right away.

   **Expected output in the VS Code terminal** (example):

   ```text
   Receiver ready at http://localhost:3000 — press Ctrl + C to stop.
   [8:31:00 AM] POST /msh/a4cf12e5b7c0/telemetry
   {"ts":"2026-10-17T01:31:00Z","fw":"1.1.0","temperature":28.4,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}
   [8:32:00 AM] POST /msh/a4cf12e5b7c0/telemetry
   {"ts":"2026-10-17T01:32:00Z","fw":"1.1.0","temperature":28.4,"humidity":71,"light":2297,"soil":37,"motion":false,"water_level":64}
   ```

   **The first completion requirement is met: the mini server on the laptop prints JSON from Node 1.** Notice the path: `/msh/<device_id>/telemetry`, with the `device_id` from Practice 2. The content follows the Appendix A format exactly: `ts`, `fw`, then the six reading fields.
3. Leave it for a few minutes: one send every minute. In the Serial Monitor, every send is logged as `Sent to the server (code 200, … ms)`.

### F. ⭐ Turn the lamp off from your phone

1. On your phone (mobile data off), open `http://192.168.1.23/` (your Node 1's address from the status page), or `http://node1.local/` if your phone isn't an Android phone.
2. Node 1's page now shows the lamp's state, the latest readings, the firmware version, and the local time. Tap **Turn the lamp on**, then **Turn the lamp off**. The relay goes "click", its indicator LED goes out, and the Serial Monitor logs `Browser 192.168.1.42: lamp off`.

   ![Illustration of the Node 1 v1.1 page in a phone browser, rendered from the HTML in network.cpp; the readings and addresses are only examples. Address bar http://node1.local/off, heading Node 1 Home. Marker 1 on Lamp: OFF, the lamp's current state; marker 2 on the link Turn the lamp on, a link to /on that turns the lamp relay on; marker 3 on the link Turn the lamp off, a link to /off that turns the lamp relay off; marker 4 on the latest sensor readings: temperature 28.4 °C, humidity 71 %, light 2310, soil 37 %, and water tank 64 %; marker 5 on the firmware version and the local time from NTP: Firmware 1.1.0, 17-10-2026 08:32 WIB. The box next to it: the address can be the .local name (laptop, iPhone) or the fixed IP address from Practice 9, for example http://192.168.1.23/off](assets/phone-node1.png)

   **The second completion requirement is met: you turned off the lamp from your phone through the ESP32's link.**
3. A lamp turned on from the phone can still be turned off with the D13 button or the `lamp off` command, and the other way around. All three change the same lamp. The page on the phone doesn't update itself: to see the latest state, open its main address again (for example `http://192.168.1.23/`). Don't reload a page whose address ends with `/on` or `/off`, because its command would be sent once more (🔬 "Why the `/on` and `/off` links aren't quite right").

### G. ⭐ The 1-minute router unplug test

This is the same test as Practice 3, but this time for the complete Node 1. **Tell the people you live with first.**

> 📱 **Can't turn off your home router?** Use your phone's hotspot (make sure it uses 2.4 GHz, see Concept 2), but remember: Node 1 v1.1 doesn't use `secrets.h`. Open its portal as in step D4, then save your hotspot's Wi-Fi through the `Node1-Home` portal. Fill in the portal from the laptop (or another phone), not from the phone that's running the hotspot: that phone usually can't connect to `Node1-Home` at the same time. Here's how: connect the laptop to the `Node1-Home` Wi-Fi for a moment, open `http://192.168.4.1` in the browser, choose your hotspot's name, type its password, then click **Save**. After that, put the laptop back on the home Wi-Fi. "Turning off the router" means turning off the hotspot for 1 minute. Your laptop stays on the home Wi-Fi, so during this test the sends to the laptop fail (`Sending failed` every minute), and that's normal: the Serial Monitor (`WiFi connected AGAIN`) and the `info` command in step 5 are proof enough. When you're done, save your home Wi-Fi again through the portal.

1. Keep the Serial Monitor and the receiver's terminal open. Type `info`, then write down the `boot #` number in its answer.
2. Write down the current time (look at your phone), then **turn off the router for 1 minute**, and turn it back on.
3. While the router is off, watch your workbench: the status LED keeps its heartbeat, the display keeps changing readings, and the D13 button still turns the lamp on. Node 1 works as usual; only the sends to the laptop stop for a while.
4. Wait until the router is back on and Node 1 reconnects by itself.

   **Expected output in the Serial Monitor** (example; the reading lines every 2 seconds aren't quoted):

   ```text
   [00:09:09] INFO  Sent to the server (code 200, 38 ms)
   [00:09:12] ERROR WiFi DISCONNECTED (reason 200: BEACON_TIMEOUT). Node 1 keeps working; the esp32 package is trying to reconnect.
   [00:09:31] INFO  Button: lamp on
   [00:09:35] INFO  Button: lamp off
   [00:11:19] INFO  WiFi connected AGAIN after 127 seconds: IP 192.168.1.23
   [00:11:21] INFO  Sent to the server (code 200, 52 ms)
   ```

5. In the receiver's terminal, the next sends appear again without you touching Node 1. Type `info`: `last restart` is still the same as before the test (usually `POWERON`), and the `boot #` number is the same as your note from step 1. That means Node 1 didn't restart; it only waited for its network to come back. The sends don't show up in the terminal again, even though the Serial Monitor says `WiFi connected AGAIN`? Your laptop's IP address may have changed after the router came back on: check it again as in Practice 7.1, update `SERVER_ADDRESS` in `config.h`, then upload again.

   **The third completion requirement is met: Node 1 reconnects by itself after the router has been off for 1 minute.**

> 💡 **Why don't the sends missed while the router was off show up later?** Node 1 v1.1 only sends the latest reading; it doesn't keep a queue. The missed readings are still logged on the microSD card (if one is installed). Storing them and sending them late, once the network is back, is Module 27's job.

**Put Node 1 back on its charger.** All three completion requirements are met, so Node 1 v1.1 goes back to working permanently, as at the end of Module 9. The order is the same as in Practice 1.3 of Module 9: **turn off the MB102** → unplug the USB from the laptop → plug the cable labeled **ESP32** into the charger → **only then** turn on the MB102. If you have a regulated microSD module connected, press **EN** afterward. Within a few seconds, Node 1 connects to the Wi-Fi by itself. Open its page from your phone and turn off the lamp once more: this time the laptop isn't involved at all. The every-minute sends are only received again when the receiver on the laptop is running.

### H. Save to GitHub and complete the evidence

1. **`mini-smart-home`**: in GitHub Desktop, choose the **`mini-smart-home`** repository. The **Changes** list holds two new files (`network.h`, `network.cpp`) and five changed files. **Check the contents of `config.h` in the right panel:** there's no password of any kind there, only your laptop's IP address. Fill in **Summary** with `Node 1 v1.1: Wi-Fi, internet time, sending data, and the web server (Module 10)`, click **Commit … to main**, then **Push origin**.
2. First complete this evidence table in `notes-module10.md`; you commit it in step 3:

| Evidence | Your result |
| :--- | :--- |
| Node 1's `device_id` | |
| Node 1's IP address (fixed, Practice 9) | |
| An excerpt of the receiver's terminal: one send from Node 1 (step E) | |
| The lamp turned off from the phone: date and time (step F) | |
| Router test: the time the router was turned off, the time it reconnected, `boot #` before and after (step G) | |
| Program size in the **Output** panel (`Sketch uses … bytes`, maximum 1,966,080) | |

3. **`learn-iot`**: make sure the `module-10` folder holds all eight of this week's practice sketches (`module10_hello_wifi`, `module10_know_your_network`, `module10_reconnect`, `module10_wifi_portal`, `module10_internet_clock`, `module10_weather`, `module10_send_to_laptop`, and `module10_web_switch`), your challenge sketch (for example `module10_challenge1`), and `notes-module10.md`. Is a sketch saved somewhere else, for example in **Documents → Arduino**? Open that sketch, choose **File → Save As…**, then save it to **Documents → GitHub → learn-iot → module-10**. Choose the **`learn-iot`** repository in GitHub Desktop, then check once more: **no `secrets.h`** in the **Changes** list. Fill in **Summary** with `Module 10: Wi-Fi, HTTP, and Node 1 v1.1`, then click **Commit … to main** and **Push origin**.

---

## 📖 Glossary

| Term | Short meaning |
| :--- | :--- |
| **Router** | The home network's security post and management office in one: the gate to the internet and the one that hands out IP addresses. |
| **Local IP address** | A device's house number inside the home network, for example `192.168.1.23`. Only valid inside the "fence". |
| **Public IP address** | Your home network's address on the internet. All the devices at home share this one address. |
| **DHCP** | The clerk who lends an IP address to a device that has just joined, for a while. |
| **Gateway** | The router's own address, for example `192.168.1.1`. Letters going outside the network are handed over here. |
| **Subnet mask** (block marker) | Decides which front part of the address must be the same for two devices to count as neighbors, for example `255.255.255.0`. |
| **MAC address** | The device's "ID card number", printed at the factory, for example `A4:CF:12:E5:B7:C0`. |
| **`device_id`** | Node 1's identity in this project: 12 lowercase hexadecimal digits from the MAC address, for example `a4cf12e5b7c0` (Appendix A). |
| **DNS** | The network's "phone book", which translates names, for example `api.open-meteo.com`, into IP addresses. |
| **SSID** | The name of a Wi-Fi network. Its upper and lower case must match exactly. |
| **2.4 GHz and 5 GHz** | The two Wi-Fi frequency bands. The ESP32 on the DevKit V1 board can only use 2.4 GHz. |
| **RSSI** | The received signal strength, in dBm. The number is negative; the closer to 0, the stronger. |
| **WPA2, WPA3** | Types of Wi-Fi network "lock". The ESP32 can use both; the old WEP and WPA locks are refused. |
| **Auto-reconnect** | The esp32 package feature that tries to connect again every time the Wi-Fi drops. |
| **Wi-Fi event** | News from the esp32 package, for example "got an IP address" or "disconnected", that calls the function we registered with `WiFi.onEvent()`. |
| **`secrets.h`** | The tab that holds the Wi-Fi name and password, which is never committed. |
| **`.gitignore`** | The list of files that Git deliberately doesn't track. |
| **Wi-Fi portal** (*captive portal*) | The settings page that appears when a phone connects to the ESP32's access point, like a hotel Wi-Fi login page. |
| **Access point** | A device that broadcasts Wi-Fi for other devices to connect to. A router is an access point; the ESP32 becomes one while the portal is open. |
| **WiFiManager** | The library that creates the Wi-Fi portal on the ESP32. The Wi-Fi you enter through that portal is saved in NVS by the esp32 package. |
| **NTP** | The way to ask a time server on the internet for the exact time. |
| **UTC** | Universal time, the world's reference clock. WIB = UTC+7, WITA = UTC+8, WIT = UTC+9. |
| **ISO-8601, `ts`** | The standard date-and-time format, for example `2026-10-17T01:23:45Z`. The letter `Z` means UTC. `ts` is the timestamp of every piece of data (Appendix A). |
| **HTTP** | The rules for letters between devices: one request, one reply. |
| **HTTPS** | HTTP inside a sealed envelope (encryption), plus a check of the server's certificate. |
| **GET, POST** | HTTP methods. GET asks for something; POST sends something. |
| **Status code** | The three digits at the start of an HTTP reply: 200 success, 404 the address doesn't exist, 500 the server has a problem. In **HTTPClient**, a negative number means there was no reply from the server. |
| **Header, body** | The letter's head (extra information) and the letter's content. |
| **URL** | The full address: scheme, host, port, and path, for example `http://192.168.1.10:3000/telemetry`. |
| **Port** | The "door number" of a server program on a computer. HTTP uses 80, HTTPS 443. |
| **JSON, ArduinoJson** | A text format for structured data (Module 4), and the ESP32 library for reading and writing it. |
| **Certificate** | A server's digital ID card, signed by a trusted organization (a CA). |
| **`setInsecure()`** | The command that keeps HTTPS encrypted but doesn't check the certificate. Temporary, until Module 27. |
| **Web server** | A program that waits for HTTP letters and replies to them. On the ESP32: the **WebServer** library. |
| **mDNS, `.local`** | The way a device announces its own name on the home network, for example `node1.local`. |
| **Address reservation** (*DHCP reservation*) | A rule in the router so that a device with a certain MAC address always gets the same IP address. |
| **Firewall** | The computer's doorkeeper, which decides which programs may accept connections from outside. |
| **Partition, partition scheme** | How the flash memory is divided into "shelves". From this module on: Minimal SPIFFS, with two 1.875 MB program shelves. |
| **OTA** (*over-the-air*) | Replacing the program over Wi-Fi, without a USB cable (Module 28). It needs two program shelves. |
| **ADC2** | The ESP32's second analog-to-digital converter. `analogRead()` can't use it while Wi-Fi is on. |

---

## 📝 5-Question Quiz

1. The ESP32 at your home gets the address `192.168.1.23`, the router is `192.168.1.1`, and the subnet mask is `255.255.255.0`. (a) Using the housing-complex analogy, explain what these three numbers mean. (b) A visiting friend's laptop connects to the guest Wi-Fi and gets the address `192.168.0.15`. Can that laptop receive what the ESP32 sends? Why?
2. A friend adds Wi-Fi to Node 1 by writing this at the start of `loop()`:

   ```cpp
   while (WiFi.status() != WL_CONNECTED) {
     Serial.print(".");
     delay(500);
   }
   ```

   (a) What happens to Node 1 if the router is off for 10 minutes? Name two consequences. (b) How does Node 1 v1.1 handle a dropped Wi-Fi without ever waiting?
3. A friend accidentally pushed `secrets.h` with the Wi-Fi password to GitHub. They then deleted the file and pushed again. (a) Is the password safe now? What must they do? (b) Why does one `secrets.h` line in the `.gitignore` of the `learn-iot` main folder already protect the sketches of all the following modules?
4. A friend sends ESP32 readings to a server they wrote themselves on their laptop. On three tries, the Serial Monitor shows three different results: `status code 200`, `status code 404`, and `failed: connection refused (code -1)`. (a) What does each one mean? (b) For the `-1` result, name three possible causes and one way to test the network with a phone. (c) Why may the weather sketch use `setInsecure()`, while lamp control over the internet may not?
5. (a) Node 1 takes a reading on Saturday, October 17, 2026, at 06:30 WIB. Write its `ts`. Why is the date different? (b) Why does Node 1 v1.1 hold back its sends until its clock is set from the internet? (c) A friend wants to move the soil sensor from VN (GPIO 39) to D25 because the wire is shorter. Why is that a bad idea from this week on?

<details>
<summary><b>Answer key & explanations</b></summary>

1. (a) `192.168.1.23` is the ESP32's **house number** inside the housing complex (the home network). `192.168.1.1` is the **security post** (the router, or gateway), where every letter going outside the complex is handed over. `255.255.255.0` is the **block marker**: devices whose first three numbers are the same (`192.168.1.…`) are neighbors in one block. (b) **No.** The address `192.168.0.15` is in another block, and a guest Wi-Fi is usually separated from the main network on purpose. That laptop must connect to the same Wi-Fi as the ESP32 (Concepts 1 and 2, 🚨 "The ESP32 and the laptop are on different networks").
2. (a) While the router is off, `loop()` is locked inside the `while`. The consequences, for example: the sensors aren't read, the button isn't served, the pump isn't turned off on time, and after 5 seconds the Module 8 watchdog restarts Node 1, over and over. (b) Node 1 v1.1 calls `WiFi.begin()` without waiting, lets the esp32 package's auto-reconnect work in the background, watches its state through Wi-Fi events (flags that are lowered in `loop()`), and only sends data once it's connected. Its backup guard tells the esp32 package to try again if there has been no new attempt for 60 seconds (Concept 4).
3. (a) **Not safe.** The file's contents stay in the repository's history, and someone else may already have copied them. They must **change the Wi-Fi password on the router**, then install the `.gitignore` guard so `secrets.h` isn't tracked again. (b) A rule without a slash applies to every file named `secrets.h` in any folder inside the repository, including `module-11`, `module-12`, and so on (Concept 3, Practice 1).
4. (a) `200`: the letter was received fine. `404`: the letter reached the server, but that server doesn't know the path (for example because of a typo). (Our own `webhook-receiver.js` accepts any path, so it never answers `404`.) `-1`: the letter didn't arrive; no server answered. (b) For example: the receiver hasn't been started, the laptop's IP address is wrong or has changed, the laptop's firewall is blocking it, the laptop and the ESP32 are on different networks, or a VPN is on. The test: open `http://<laptop IP>:3000/` in the browser of a phone connected to the same Wi-Fi; if the receiver's terminal prints `GET /`, the network is fine (Practice 7, 🚨). (c) Weather data is open to the public and doesn't move anything, so the risk from an impostor is small. Controlling a lamp over the internet needs certainty that the command comes from the right party and reaches the right device; `setInsecure()` doesn't check anyone's identity (Concept 8).
5. (a) `2026-10-16T23:30:00Z`. WIB is 7 hours ahead of UTC, so 06:30 WIB is still 23:30 UTC on **the previous day**. (b) Every piece of data must carry a `ts` that the device creates when the reading is taken (Appendix A). Before the clock is set, the ESP32 thinks it's the year 1970, and data with the wrong time is more misleading than no data at all (Concept 6). (c) D25 is an **ADC2** pin. While Wi-Fi is on, `analogRead()` on an ADC2 pin silently answers `0`. A raw value of `0` is below the "wet" number from your calibration, so the soil always reads 100% wet, the automatic watering never turns on, and your plant dries out without any error message. Analog sensors must stay on ADC1, as Module 5's rule says (Concept 10). Answering "D25 is already used by the pump" is also correct for Node 1, but this question asks about the problem that only appears because of Wi-Fi.

</details>

---

## ✅ Module 10 Completion Checklist

Check them all before you move on to Module 11:

- [ ] I can explain the local IP address, the gateway, DHCP, and the MAC address with the housing-complex analogy, and my ESP32's network ID card is written down (Practice 2).
- [ ] `secrets.h` is guarded by `.gitignore` and never appears on GitHub (Practice 1).
- [ ] The reconnect sketch keeps running while the router is off, then reconnects by itself (Practice 3).
- [ ] I've saved a Wi-Fi network through the portal on my phone, without writing the password in the code (Practice 4).
- [ ] The ESP32 shows the right local time and UTC `ts` (Practice 5).
- [ ] The ESP32 gets the weather from Open-Meteo over HTTPS, and I can honestly explain what `setInsecure()` means (Practice 6).
- [ ] The receiver on the laptop prints the JSON sent by the ESP32 (Practice 7).
- [ ] The lamp relay turns on and off from a phone browser (Practice 8), and I know how to find Node 1's address, both through the fixed IP and in other ways (Practice 9).
- [ ] Arduino IDE uses **ESP32 Dev Module** with the **Minimal SPIFFS** partition scheme (➕ A).
- [ ] ⭐ **The mini server on the laptop prints JSON from Node 1 v1.1** (➕ E).
- [ ] ⭐ **I turned off the lamp from my phone through Node 1's link** (➕ F).
- [ ] ⭐ **Node 1 reconnects by itself after the router has been off for 1 minute**, without a restart (➕ G).
- [ ] Node 1 v1.1 is back on its charger, and its lamp can still be turned off from the phone without any laptop at all (➕ G).
- [ ] Node 1 v1.1 is committed and pushed to `mini-smart-home`; the sketches and `notes-module10.md` to `learn-iot`, without a single `secrets.h`.
- [ ] ⭐ **Quiz: at least 4 of 5 correct.**

**You pass when** (according to the Syllabus): *you can turn off the lamp from your phone through the ESP32's link, the mini server on the laptop prints JSON from Node 1, and the device reconnects by itself after the router has been off for 1 minute.*

Congratulations — Node 1 is now a real IoT device: connected, aware of the time, reporting, and controllable from afar. But our way of doing it is still "private letters": Node 1 has to know your laptop's address, and your phone has to know Node 1's address. In **Module 11**, all the devices simply talk through one "post office" called the **MQTT broker**. The `/on` and `/off` links retire, and the Appendix A data contract comes into full use.

---

## 📚 Sources & Image Credits

**Documentation, source code, and test results used** (accessed October 2026):

- The source code of [arduino-esp32](https://github.com/espressif/arduino-esp32/tree/3.3.12) 3.3.12: the WiFi library (auto-reconnect, disconnect reason codes, the default device name, saving the Wi-Fi in NVS), HTTPClient (time limits, the order of the headers, negative error codes), WebServer, ESPmDNS, NetworkClientSecure (`setInsecure()` and `useBuiltinCACertBundle()`), plus `boards.txt` (ESP32 Dev Module, partition schemes, Flash Mode) and the partition tables `default.csv` and `min_spiffs.csv`.
- ESP-IDF 5.5 documentation: [Wi-Fi Driver](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/wifi.html) (disconnect reason codes, `WIFI_PS_MIN_MODEM` power saving, scanning for networks while connecting), [Wi-Fi Security](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/wifi-security.html) (WPA3), [System Time](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/system_time.html) (SNTP and time zones), and [ADC](https://docs.espressif.com/projects/esp-idf/en/v5.5.1/esp32/api-reference/peripherals/adc_oneshot.html) (ADC2 used by the Wi-Fi radio). The Wi-Fi current from the [ESP32 Series Datasheet](https://documentation.espressif.com/esp32_datasheet_en.pdf) (Espressif).
- The [WiFiManager](https://github.com/tzapu/WiFiManager) 2.0.17 library by tzapu (README, `WiFiManager.cpp`, `wm_strings_en.h`, and [issue #1797](https://github.com/tzapu/WiFiManager/issues/1797)) and [ArduinoJson](https://arduinojson.org/v7/) 7.4.3 by Benoit Blanchon (`serializeJson()`, `deserializeJson()`, NaN written as `null`).
- Time: the [NTP Pool Project](https://www.ntppool.org/en/use.html) (`pool.ntp.org` and the [Asia zone](https://www.ntppool.org/zone/asia)), the [POSIX](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html) time zone rules and [`strftime()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/strftime.html) (The Open Group), plus [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) for the ISO-8601 date-and-time format.
- Networks and HTTP: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) (methods, status codes, safe GET), [RFC 6762](https://www.rfc-editor.org/rfc/rfc6762) (mDNS), [RFC 1918](https://www.rfc-editor.org/rfc/rfc1918) (private network addresses), and [RFC 2131](https://www.rfc-editor.org/rfc/rfc2131) (DHCP); `.local` name support on Android from the [AOSP DNS Resolver](https://source.android.com/docs/core/ota/modular-system/dns-resolver) and [Google Issue Tracker 140786115](https://issuetracker.google.com/issues/140786115).
- [Open-Meteo](https://open-meteo.com/en/terms): the terms of use of the free API and the CC BY 4.0 data license.
- The source code of [Arduino IDE](https://github.com/arduino/arduino-ide/blob/2.3.10/arduino-ide-extension/src/browser/contributions/boards-data-menu-updater.ts) 2.3.10: the layout and order of the **Tools** menu.
- Git and GitHub: [gitignore](https://git-scm.com/docs/gitignore), [Ignoring files](https://docs.github.com/en/get-started/git-basics/ignoring-files), [Supported secret scanning patterns](https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns), and [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository); the source code of [GitHub Desktop](https://github.com/desktop/desktop/tree/release-3.6.6) 3.6.6 (the `Repository settings` window and the right-click menu in the **Changes** list).
- Laptops and phones: Microsoft [ipconfig](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig), [Windows Firewall](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/), [Windows network settings](https://support.microsoft.com/en-us/windows/experience/connectivity-networking/essential-network-settings-and-tasks-in-windows), and [Mobile hotspot](https://support.microsoft.com/en-us/windows/experience/connectivity-networking/use-your-windows-device-as-a-mobile-hotspot); Apple [Wi-Fi with a login page](https://support.apple.com/en-us/102554), [Personal Hotspot](https://support.apple.com/guide/platform-support/troubleshoot-personal-hotspot-connections-sup025284ac0/web), and the [macOS firewall](https://support.apple.com/guide/mac-help/block-connections-to-your-mac-with-a-firewall-mh34041/mac); Samsung [Galaxy mobile hotspot](https://www.samsung.com/id/support/mobile-devices/how-to-use-and-configure-mobile-hotspot-on-your-galaxy-phone/) (Samsung Indonesia page).
- Routers: TP-Link's guides to [Smart Connect](https://www.tp-link.com/us/support/faq/2595/), [guest networks](https://www.tp-link.com/us/support/faq/2798/), [AP Isolation](https://www.tp-link.com/us/support/faq/2089/), and [address reservation](https://www.tp-link.com/us/support/faq/182/).
- Wokwi: [ESP32 WiFi Networking](https://docs.wokwi.com/guides/esp32-wifi) (the `Wokwi-GUEST` network; Wokwi's free service only allows outgoing connections).

**Images.** The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-10`, `home-network`, `two-wifi-bands`, `reconnect`, `wifi-portal`, `ntp-clock` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The disconnect reason codes and the NTP delays from the source code of the esp32 package and ESP-IDF; the IP and MAC addresses are only examples. | CC BY 4.0 |
| `http-letter`, `https-setinsecure`, `web-server`, `fixed-address`, `flash-partitions`, `node1-v11-file-map` (`.png` + `.svg`) | Original diagrams. The HTTP letter's contents follow HTTPClient of the esp32 package 3.3.12; the shelf sizes from the esp32 package's partition tables; Node 1's size from compiling it in Wokwi. | CC BY 4.0 |
| `phone-portal` (`.png` + `.svg`) | Original illustration: the portal page rendered from the original HTML, CSS, and text of the [WiFiManager](https://github.com/tzapu/WiFiManager) 2.0.17 library (© tzapu, MIT license); the Wi-Fi names are only examples. | CC BY 4.0 for the layout and markers; the page content follows WiFiManager's MIT license |
| `phone-switch`, `phone-node1` (`.png` + `.svg`) | Original illustrations: the pages rendered from the HTML in the Practice 8 sketch and in Node 1 v1.1's `network.cpp`; the numbers and addresses are only examples. | CC BY 4.0 |
| `partition-menu` (`.png` + `.svg`) | Original illustration of the Arduino IDE 2.3.10 interface, not a screenshot; the menu labels from the Arduino IDE source code and the `boards.txt` of the esp32 package 3.3.12. | CC BY 4.0 |
| `github-desktop-gitignore` (`.png` + `.svg`) | Original illustration of the GitHub Desktop 3.6.6 interface, not a screenshot; the window texts from the [GitHub Desktop](https://github.com/desktop/desktop) source code (MIT license); the contents of the **Changes** list are only an example. | CC BY 4.0 |

All the sketches in this module have been compiled with version 3 of the esp32 package and run in Wokwi (the Practice 4 Wi-Fi portal sketch only up to the point where its portal opens, because a phone can't connect to Wokwi). The **Expected output** boxes marked **Wokwi recording** (Practices 5 and 6) come straight from the simulator. The boxes marked **example** use exactly the same line layout as the Wokwi recordings and the sketch code, but their Wi-Fi names, IP addresses, signal strengths, and readings are replaced with examples from a home network, because Wokwi can't turn off a router, can't be connected to from a phone (the portal and the web server), and can't reach a laptop. The layout of the receiver terminal's contents comes from `webhook-receiver.js`, actually run with letters like the ones in Practice 7 and the ➕ section.

---

[⬅️ Module 9](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 11 — MQTT: The Official Language of IoT & the Project Data Contract** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-11--mqtt-the-official-language-of-iot--the-project-data-contract))
