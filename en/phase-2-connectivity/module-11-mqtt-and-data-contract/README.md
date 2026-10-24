# Module 11 — MQTT: The Official Language of IoT & the Project Data Contract

🌐 **English** · [Bahasa Indonesia](../../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md)

*Phase 2 · Week 11 · Hardware: **the Node 1 workbench from Module 10** and **a laptop** that becomes the broker (see 🧰) — no new parts · Prerequisites: **Module 10** (Node 1 v1.1) · Time: 8–10 hours, spread over the week*

[⬅️ Module 10](../module-10-wifi-and-http/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 12 ➡️](../module-12-raspberry-pi-and-linux/README.md)

---

In Module 10, Node 1 started talking to the network: it connects to the home Wi-Fi, knows the exact time, sends its readings to the laptop, and its lamp can be turned off from your phone. But the way it does this is still like a **private letter**. Node 1 has to know your laptop's address, your phone has to know Node 1's address, and every new device means one more address to write down. This week we set up one shared "post office" called an **MQTT broker**. Every device only needs to know the broker's address, then sends its messages through that broker.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Node 1 has to know the laptop's IP address, and the phone has to know Node 1's address. If one address changes, a send or a link fails right away. | Every sender talks directly to every receiver. | One broker in the middle: every device only needs to know the broker's address (Concepts 1–4, Practices 1–3) |
| The laptop can't tell a Node 1 that is quiet from a Node 1 that is dead. | Over HTTP, Node 1 is only heard when it sends a letter. | An automatic online/offline status through a retained message that the broker keeps and a *Last Will* (Concept 7, Practice 4) |
| The `/on` and `/off` links never confirm that the command was really carried out. | There's no official answer from the device. | The command → `ack` pattern (Concept 8, Practice 6) |
| Motion in front of the PIR can take up to a minute to show up on the laptop. | Sends only follow a fixed schedule. | Send every 10 seconds, and **immediately** when something important happens (Concept 8, Practice 7) |
| The JSON shape isn't "locked" yet: failed readings are still mixed in with the number `-1`. | There's no written agreement yet, and no tool to check it. | `DATA-CONTRACT.md`, `null` for failed readings, and the contract checker (Concept 5, Practices 8–9) |

By the end of the week, **Node 1 v1.2** talks entirely over MQTT. Every 10 seconds it publishes the readings of its five sensors, and it reports right away as soon as something important happens, for example motion, or the place getting dark. Every 5 minutes it reports on its health. Its status changes to `offline` automatically if it dies, and every command from the laptop is answered in less than 1 second. The `/on` and `/off` links from Module 10 retire. Everything still stays **inside your home network**: the broker on the laptop doesn't use a password yet, and securing it is a job for Modules 21 and 27.

![Module 11 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 2 Connectivity, Modules 10 to 15, is highlighted. Modules 1 to 10 are marked done, and Module 11 is marked YOU ARE HERE with the note: Node 1 talks over an MQTT broker, with the project data contract. Bottom: the box for this week's Module 11, 8 to 10 hours spread over the week, no new parts, the laptop is the broker; ⭐ means required to pass. Left: QW, the Quick Win, hello through a public broker; P1, install the Mosquitto broker on the laptop; P2, exchange messages from the terminal and MQTTX; P3, the ESP32 publishes telemetry to the broker; P4, automatic online/offline status; P5, QoS 0 vs QoS 1 while the ESP32's Wi-Fi is off. Right: P6, commands from MQTTX, answered with ack; P7, send immediately when something happens; P8, the data contract checker; P9, the pub/sub diagram and DATA-CONTRACT.md ⭐; plus, Add-on: Node 1 v1.2 over MQTT ⭐. The stars mark P9 and the Add-on section as requirements for passing](assets/roadmap-module-11.png)

> [!NOTE]
> **How to use this module.**
>
> - Every practice uses the **Node 1 board** on your workbench, which stays plugged into the laptop during the practices, as in Module 10. The MB102 only needs to be turned on from Practice 6 on, when the relay and the PIR are used, and in the ➕ section.
> - **Your laptop becomes the broker.** A broker program called Mosquitto runs in a VS Code terminal and has to stay open during the practices, just like the receiver in Module 10.
> - Every code box has a copy button in its top right corner. All the sketches are also available as files in the [`code/`](code/) folder.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing. The numbers on your board will certainly be different.
> - **Wokwi can run all of this week's sketches, as long as they use a public broker.** Wokwi's free service only allows outgoing connections, so the simulated ESP32 can't reach the broker on your laptop. Each practice explains how. Only one piece of evidence for passing still needs a real board: the `ack` in under 1 second (➕ E), because through a public broker the answer takes 1–2 seconds. **Expected output** boxes marked **Wokwi recording** come straight from the simulator. The rest are marked **example**. For the Serial Monitor, their lines follow the sketch's code and the Wokwi recordings, but the addresses, the `device_id`, and the numbers are replaced with examples from a home network. The Mosquitto terminal output is put together from the texts in Mosquitto's source code, not recorded (see 📚).
> - macOS users: replace **Ctrl** with **Cmd** to save, select all, copy, paste, and create a new tab.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The broker on the laptop deliberately has no password**, only for practicing on your home network. Anyone connected to your home Wi-Fi can read and send messages through that broker, including commands for the relays. Don't set up *port forwarding*, and **stop the broker** (press **Ctrl + C** in its terminal) before the laptop joins public Wi-Fi, for example at a café or on a campus. How to lock it down is covered in Modules 21 and 27.
> 2. **A public broker is like a group chat that's open to everyone:** anyone can read and write there. The Quick Win uses one only for "hello" messages. Never send passwords, personal data, or commands for real devices through a public broker.
> 3. **Remote commands move real things.** Before you send a pump or curtain command, make sure the hose points into the pot and nothing is in the servo's way. The pump is still limited to 1–10 seconds and refused if the tank water is too low (Module 6).
> 4. **The Wi-Fi password stays in `secrets.h`**, which Git ignores (Module 10, Practice 1).
> 5. **The golden power rules from Module 5 still apply:** the relays get their power from the MB102, the ESP32 from USB or its charger, and the order for turning things on and off stays the same.

This module follows the same rhythm as Modules 1–10. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools and parts it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: hello through an MQTT broker (15 minutes)](#-quick-win-hello-through-an-mqtt-broker-15-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 HTTP vs MQTT](#1-why-http-alone-isnt-enough-a-private-letter-vs-a-group-chat) · [2 Pub/sub](#2-publishsubscribe-the-broker-as-a-whatsapp-group-server) · [3 Mosquitto](#3-a-broker-on-the-laptop-mosquitto-two-configuration-lines-and-the-firewall) · [4 Topics & wildcards](#4-topics-and-wildcards-message-addresses-with-levels) · [5 Data contract](#5-the-data-contract-five-topics-and-one-json-shape-for-everything) · [6 QoS](#6-qos-regular-mail-registered-mail-and-a-courier-who-wants-a-signature) · [7 Retained & last will](#7-retained-last-will-and-keep-alive-a-notice-board-a-last-will-and-a-heartbeat) · [8 When to send](#8-when-to-send-and-when-to-answer-every-10-seconds-immediately-when-it-matters-and-command--ack) · [9 Message size](#9-message-size-the-256-byte-container-that-silently-throws-things-away) · [10 Never stuck](#10-dont-let-mqtt-freeze-node-1)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Install Mosquitto](#practice-1--install-the-mosquitto-broker-on-the-laptop-30-minutes) · [2 Terminal & MQTTX](#practice-2--exchange-messages-from-the-terminal-and-mqttx-20-minutes) · [3 Telemetry](#practice-3--the-esp32-publishes-telemetry-to-the-laptop-broker-30-minutes) · [4 Online/offline](#practice-4--automatic-onlineoffline-status-20-minutes) · [5 QoS](#practice-5--qos-0-vs-qos-1-while-the-esp32s-wi-fi-is-off-25-minutes) · [6 Command → ack](#practice-6--commands-from-mqttx-answered-with-ack-30-minutes) · [7 Send immediately](#practice-7--send-immediately-when-something-happens-20-minutes) · [8 Contract checker](#practice-8--the-contract-checker-20-minutes) · [9 Diagram & contract](#practice-9--the-pubsub-diagram-and-data-contractmd-20-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-11-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

- **Explain how *publish/subscribe* works** with the WhatsApp group analogy, then draw the *pub/sub* diagram of your own project.
- **Install and run the Mosquitto broker** on the laptop, complete with its two configuration lines and the firewall permission.
- **Send messages through the broker** from the terminal (`mosquitto_pub` and `mosquitto_sub`) and from the MQTTX app, including the *wildcards* (stand-in characters) `+` and `#`.
- **Make the ESP32 publish JSON that follows the data contract** and receive commands, without ever getting its program stuck.
- **Explain and test QoS 0 and 1, retained messages, the last will (*Last Will*), and the heartbeat (*keep-alive*)**.
- **Use the command → `ack` pattern** and immediate sends when something important happens (*report-by-exception*).
- **Check messages with the contract checker** on the laptop, then write `DATA-CONTRACT.md` for your project.
- **Set up Node 1 v1.2**, whose communication runs entirely over MQTT.

---

## 🧰 What you need

This week there are **no new parts**. What's new is the software: one broker on the laptop and one app for peeking at messages.

| What | Details |
| :--- | :--- |
| **The Node 1 workbench from Module 10** | Complete, with the Node 1 v1.1 firmware. During the practices, the Node 1 board is plugged into the laptop; its charger is used again at the end of the ➕ section. |
| **Laptop** | Connected to the **same** Wi-Fi as the ESP32, as in Module 10. This laptop is the one that becomes the broker. Have VS Code, Node.js 24, and the `mini-smart-home/tools` folder from Module 4 ready. |
| **Your laptop's IP address** | How to find it is in Practice 7.1 of Module 10. The laptop's address can change after the laptop sleeps or the router restarts; if you can, set up a fixed address reservation (*DHCP reservation*) for the laptop in the router, just like the one for Node 1 in Practice 9 of Module 10. |
| **2.4 GHz Wi-Fi and the `secrets.h` tab** | The same as in Module 10. Every practice sketch this week starts from a Module 10 sketch, so `secrets.h` gets copied along. |
| **Internet** | For the Quick Win (a public broker), the NTP clock, and downloading the programs. |
| **Mosquitto, MQTTX, and new libraries** | Installed when they're needed: MQTTX and the **PubSubClient3** library in the Quick Win, Mosquitto in Practice 1, and the `mqtt` library for Node.js in Practice 8. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (at the time of writing: 2.3.10) | From Module 2. |
| Board package **esp32 by Espressif Systems** | **3.3.x** (at the time of writing: 3.3.12) | From Module 2. This package doesn't include an Arduino-style MQTT library (its built-in ESP-IDF client is covered in 🔬). |
| **PubSubClient3** library (by Nick O'Leary, maintained by Holger Mueller) | **3.3.2** | New (Quick Win). The successor of the old **PubSubClient** library (2.8), which has officially not been maintained since June 2026. |
| **ArduinoJson** library (by Benoit Blanchon) | **7.4.3** | From Module 10. |
| **DHT sensor library** (by Adafruit) | **1.4.7** | From Module 6; used again in Practice 3. |
| Mosquitto | **2.1.2** (Windows and macOS) | New (Practice 1). On Linux, the version from your distribution's package, for example 2.0.18 on Ubuntu 24.04. |
| MQTTX | **1.13.1** | New (Quick Win). |
| Node.js | **24.21.0** | From Module 4. |
| **mqtt** library for Node.js | **5.16.1** | New (Practice 8), installed with `npm install`. |

---

## 🏆 Quick Win: hello through an MQTT broker (15 minutes)

In Module 10, the ESP32 had to know your laptop's address to send it a letter. Now let's try another way: the ESP32 and the laptop both connect to one "post office" on the internet called a **broker**, then send each other messages through it. Neither of them **needs to know the other's address**.

> 🖥️ **Tools used in this section:** **Arduino IDE** and the **Serial Monitor**, the **Node 1 board** plugged into the laptop (the MB102 can stay off), 2.4 GHz Wi-Fi that's connected to the internet, and the **MQTTX** app on the laptop (installed in step 1). No board yet? See the Wokwi note at the end of this section.
>
> **Is Node 1 still running on its charger, as in the ➕ section of Module 10?** First move it to the laptop in the order of the golden rules: **turn off the MB102**, unplug the Node 1 board's USB cable from the charger, then plug it into the laptop. Leave the MB102 off until Practice 6.

1. **Install MQTTX**, an app for peeking at and sending MQTT messages. Open [mqttx.app/downloads](https://mqttx.app/downloads), then download version **1.13.1** for your laptop:
   - **Windows:** `MQTTX-Setup-1.13.1-x64.exe` (64-bit Windows, used by almost every laptop). Run that file and follow the installer's instructions to the end.
   - **macOS:** `MQTTX-1.13.1-arm64.dmg` for a Mac with an Apple chip (M1 and later), or `MQTTX-1.13.1.dmg` for an Intel Mac. Open the `.dmg` file, then drag **MQTTX** into the **Applications** folder.
   - **Linux:** on Ubuntu or Debian, download the `MQTTX_1.13.1_amd64.deb` package, open a terminal in your downloads folder, then type `sudo apt install ./MQTTX_1.13.1_amd64.deb`. Other distributions can use `MQTTX-1.13.1.AppImage`: give it permission to run with `chmod +x MQTTX-1.13.1.AppImage`, then run it with `./MQTTX-1.13.1.AppImage`.
2. **Install the PubSubClient3 library** in Arduino IDE. Open the **Library Manager** (the book icon on the left bar, or **Tools → Manage Libraries…**), then type **PubSubClient3** in the search box. On the **PubSubClient3** card, choose version **3.3.2**, then click **INSTALL**. The author's name on its card really is `Nick O'Leary`, the creator of the original library; what tells them apart is the **3** at the end of its name.

   > ⚠️ **Did you ever install the PubSubClient library (without the 3) from another tutorial?** Type **PubSubClient** in the search box. If the **PubSubClient** card says `2.8.0 installed`, click **REMOVE**, then answer **Yes** in the `Uninstall` window. Both libraries use the same file name (`PubSubClient.h`), and if both are installed, Arduino IDE quietly uses the old one. The sketches in this module refuse to compile if that happens, with the message `The old PubSubClient (2.8) is in use`.
3. Open the `module10_hello_wifi` sketch from Module 10, choose **File → Save As…**, then save it in the **`module-11`** folder of the `learn-iot` repository (create the folder if it doesn't exist yet) under the name `module11_hello_broker`. The `secrets.h` tab gets copied along. Replace the **whole** content of the main tab with this code:

   ```cpp
   // Module 11 - Quick Win: hello through an MQTT broker
   // The ESP32 publishes a "hello" message to a public broker every 5 seconds, then prints any message
   // you send to its topic from MQTTX on your laptop.
   // Public broker = an open group chat: anyone can read along. Never send secrets through it.

   #include <WiFi.h>
   #include <PubSubClient.h>  // PubSubClient3 library version 3.3.2 (install it with the Library Manager)
   #include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD, as in Module 10

   #ifndef MQTT_QOS1  // only PubSubClient3 has this name
   #error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
   #endif

   const char BROKER_ADDRESS[] = "broker.emqx.io";  // public broker, the same as MQTTX's default
   const uint16_t BROKER_PORT = 1883;               // the MQTT door without encryption
   const unsigned long HELLO_INTERVAL = 5000;       // one hello message every 5 seconds

   WiFiClient netClient;          // TCP connection to the broker
   PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
   char code[7];                  // 6 random hexadecimal characters so that your topic differs from other readers' topics
   char clientId[24];             // the ESP32's name at the broker, must be unique
   char sendTopic[40];            // learn-iot/<code>/from-esp32
   char receiveTopic[40];         // learn-iot/<code>/from-laptop
   unsigned long lastHelloTime = 0;
   int helloNumber = 0;

   // Called by the library for every message that arrives on a topic we subscribe to.
   void onMessage(char* topic, byte* content, unsigned int length) {
     Serial.printf("Message received on %s: ", topic);
     Serial.write(content, length);  // the content doesn't end with an end-of-text mark: print exactly 'length' characters
     Serial.println();
   }

   void connectBroker() {
     Serial.printf("Connecting to broker %s ...\n", BROKER_ADDRESS);
     while (!mqtt.connect(clientId)) {  // waiting here is fine for this Quick Win
       Serial.printf("Failed (code %d). Retrying in 3 seconds.\n", mqtt.state());
       delay(3000);
     }
     mqtt.subscribe(receiveTopic);  // subscribe to the topic of messages from the laptop
     Serial.println("Connected to the broker!");
     Serial.printf("In MQTTX, subscribe to the topic: learn-iot/%s/#\n", code);
     Serial.printf("Send messages to the ESP32 on the topic: %s\n", receiveTopic);
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     snprintf(code, sizeof(code), "%06lx", (unsigned long)(esp_random() & 0xFFFFFF));  // for example 3f9a1c
     snprintf(clientId, sizeof(clientId), "learn-iot-%s", code);
     snprintf(sendTopic, sizeof(sendTopic), "learn-iot/%s/from-esp32", code);
     snprintf(receiveTopic, sizeof(receiveTopic), "learn-iot/%s/from-laptop", code);

     Serial.printf("Connecting to WiFi \"%s\"", WIFI_NAME);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     while (WiFi.status() != WL_CONNECTED) {
       Serial.print(".");
       delay(250);
     }
     Serial.println(" connected!");

     mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
     mqtt.setCallback(onMessage);
     connectBroker();
   }

   void loop() {
     if (!mqtt.connected()) {
       connectBroker();  // the broker connection dropped: connect again
     }
     mqtt.loop();  // must be called as often as possible: receives messages and keeps the connection alive

     if (millis() - lastHelloTime >= HELLO_INTERVAL) {
       lastHelloTime = millis();
       helloNumber++;
       char message[40];
       snprintf(message, sizeof(message), "Hello from ESP32 #%d", helloNumber);
       mqtt.publish(sendTopic, message);
       Serial.printf("Sent to %s: %s\n", sendTopic, message);
     }
   }
   ```

4. Make sure the selected board is **ESP32 Dev Module** with **Partition Scheme** **Minimal SPIFFS** and **Flash Mode** **DIO**, the settings you've used since section ➕ A of Module 10, and that the port is right. Then click **Upload**. As soon as `Done uploading` appears, open the **Serial Monitor** (**115200 baud**). If you can't see the first line, press the **EN** button on the ESP32 board.

   **Expected output** (Wokwi recording; on your board, the Wi-Fi name and the topic code are different):

   ```text
   Connecting to WiFi "Wokwi-GUEST"................. connected!
   Connecting to broker broker.emqx.io ...
   Connected to the broker!
   In MQTTX, subscribe to the topic: learn-iot/5230e8/#
   Send messages to the ESP32 on the topic: learn-iot/5230e8/from-laptop
   Sent to learn-iot/5230e8/from-esp32: Hello from ESP32 #1
   ```

   Write down **your topic code**: the six random characters (digits `0`–`9` and letters `a`–`f`) in the middle of the topic, for example `5230e8`. This code is made anew every time the ESP32 powers up: if you later press **EN** or upload again, use the new code for the subscription in MQTTX (step 6) and for the send topic (step 7).
5. **Connect MQTTX to the same broker.** In MQTTX, click the **+ New Connection** button in the middle of the screen (if you've made a connection before: the **+** icon on the far left bar). Fill in **Name** with `Public broker`. The **Host** field already contains `mqtt://` and `broker.emqx.io`, and **Port** is already `1883`: that's the public broker your ESP32 uses. Click **Connect** in the top right corner, then wait until `Connected` appears.
6. **Subscribe to your ESP32's topic.** Click **New Subscription**. In the **Topic** field, delete its default content (`testtopic/#`), then type `learn-iot/` + your topic code + `/#`, for example `learn-iot/5230e8/#`, and click **Confirm**. Every 5 seconds, a `Hello from ESP32 #…` message appears in MQTTX.
7. **Reply from the laptop.** In the send box at the bottom of MQTTX, change the format choice from **JSON** to **Plaintext**. Fill in the **Topic** field with your own `from-laptop` topic (the one printed in the Serial Monitor), type `Hello from the laptop too!` in the message box, then click the send button (the paper plane icon) or press **Ctrl + Enter**. The Serial Monitor immediately writes `Message received on …: Hello from the laptop too!`. In MQTTX, your message shows up twice, as a sent message and as a received message, because MQTTX itself also subscribes to `learn-iot/<code>/#`; that's normal.

![An illustration of MQTTX 1.13.1, not a screenshot: chatting with the ESP32 through a public broker (Quick Win steps 5 to 7; the topic code 5230e8 is only an example, use the code printed in your Serial Monitor). On the far left, the icon bar with the + icon for creating a new connection (marker 1). Next to it, the Connections list with the Public broker connection, written as Public broker@broker.emqx… in green letters, the sign that it's connected. In the middle, the Public broker header, with the Connected notice that shows briefly at the top right; below it, the + New Subscription button (marker 2) and the subscription learn-iot/5230e8/# with QoS 0. On the right, the All, Received, and Published tabs, then three message bubbles: received, Topic learn-iot/5230e8/from-esp32 QoS 0, Hello from ESP32 #1; sent, Topic learn-iot/5230e8/from-laptop QoS 0, Hello from the laptop too!; received, Topic learn-iot/5230e8/from-laptop QoS 0, Hello from the laptop too!, which is your own message coming back from the broker because MQTTX also subscribes to learn-iot/5230e8/#. At the bottom, the send box: the Plaintext format choice (marker 3), QoS 0, the Retain box unchecked, the topic field learn-iot/5230e8/from-laptop, the message Hello from the laptop too!, and the send button with a paper plane icon (marker 4). Key: 1, the + icon on the left bar, that is, New Connection (while MQTTX has no connection yet, the + New Connection button is also in the middle of the screen), Name Public broker, Host mqtt:// broker.emqx.io and Port 1883 already filled in, then Connect; 2, New Subscription, Topic learn-iot/<code>/#, then Confirm; 3, the Plaintext format, then fill in Topic with your own from-laptop topic; 4, type the message, then click the send button or Ctrl + Enter](assets/mqttx-quick-win.png)

*Illustration: the MQTTX 1.13.1 window redrawn, not a screenshot; interface labels from the source code of [MQTTX](https://github.com/emqx/MQTTX) (© EMQ Technologies, Apache 2.0 license); the topic code and the times are only examples.*

Congratulations — your ESP32 and your laptop have just chatted through a broker, without knowing each other's address. Notice three things:

- **Both of them only know the broker's address** (`broker.emqx.io`). The ESP32 doesn't know your laptop's IP address, and MQTTX doesn't know the ESP32's address. That's the heart of MQTT (Concepts 1–2).
- **Messages flow in both directions over one connection**, which the ESP32 opened itself. The laptop can send messages to the ESP32 without the ESP32 becoming a web server as in Module 10.
- **The random code makes your topic unique.** This public broker is used by many people all over the world, and anyone who subscribes to the same topic can read along. That's why we only send "hello" there. From Practice 1 on, the broker moves to your own laptop.

Can't connect to the broker? Office and campus networks, and some public Wi-Fi networks, block door 1883. Open "Can't connect to the broker (`Failed`, code `-2`)" in 🚨.

> 🖥️ **Trying it in Wokwi?** Open a new ESP32 project at [wokwi.com](https://wokwi.com), paste the main tab's code into `sketch.ino`, then create a **`secrets.h`** file through **▾ → New file...** and fill it with Wokwi's simulated network:
>
> ```cpp
> // secrets.h for Wokwi: the simulated Wokwi-GUEST network has no password.
> #pragma once
>
> const char WIFI_NAME[] = "Wokwi-GUEST";
> const char WIFI_PASSWORD[] = "";
> ```
>
> Then install the library through the **Library Manager** tab → the round **+** button → type **PubSubClient3** → click the result, as in Module 6, and change the line in the `libraries.txt` tab to `PubSubClient3@3.3.2`. The MQTTX steps are exactly the same: the simulated ESP32 connects to `broker.emqx.io` too.

---

## 🧠 The "Why" Concepts

Ten concepts, one per section — **you don't need to read them all at once**. Concepts and practices alternate in this order:

1. Concepts 1–3 → Practice 1 (install the Mosquitto broker on the laptop)
2. Concept 4 → Practice 2 (exchange messages from the terminal and MQTTX)
3. Concept 5 → Practice 3 (the ESP32 publishes `telemetry`)
4. Concepts 6–7 → Practices 4–5 (the online/offline status and the QoS test while the Wi-Fi is off)
5. Concept 8 → Practices 6–7 (command → `ack` and immediate sends)
6. Concepts 9–10 (a close look at the safety lines you've been using since Practice 3) → Practices 8–9 (the contract checker, the *pub/sub* diagram, and `DATA-CONTRACT.md`)
7. 🧩 Challenges → ➕ Mini Smart Home (Node 1 v1.2) → 📝 Quiz → ✅ Checklist

At every switch point, there's a ➡️ box (forward to the practice) and a ⬆️ box (back to the concepts) with links you only need to click.

> 🖥️ **Want to try the code in the Concepts section?** It's not required — you'll run all the code in the Practices. The code in the Concepts section is only snippets; the full versions are in the Practice sketches and in the [`code/`](code/) folder.

### 1. Why HTTP alone isn't enough: a "private letter" vs a "group chat"

In Module 10, Node 1 talked to the world over **HTTP**, which we compared to **writing letters**. This way has proven that it works: the readings reach the laptop, and the lamp can be turned off from a phone. But look at who has to know whose address:

- Node 1 has to know the laptop's address (`SERVER_ADDRESS`, for example `http://192.168.1.10:3000`) to send its readings.
- The phone has to know Node 1's address (`192.168.1.23` or `node1.local`) to open `/on` and `/off`.
- If a second receiver comes along later, for example a dashboard on a Raspberry Pi (Module 13), Node 1 has to send the same letter **twice**, to two addresses.

Every sender–receiver pair needs its own "letter address". With one Node 1 and one laptop, that's still light work. Now imagine a house with ten devices and three apps that want to read their data: thirty address pairs, and every time one address changes, some send quietly fails.

The second problem is **direction**. HTTP is always started by the side that **asks**, and the side being asked has to be waiting as a **server**. So that the phone could give Node 1 commands, Node 1 had to become a web server (Concept 9 of Module 10). That server has to be reachable from outside, yet in Concept 1 of Module 10 we saw that letters from the internet only reach the security post: people outside can't knock directly on your ESP32.

The third problem is **cost**. The HTTP letter in Practice 7 of Module 10 carries a letter head (the headers) of about 200 bytes for a JSON body of only 75 bytes, then waits for a reply letter. For one reading a minute, you don't notice it. For thousands of devices reporting every 10 seconds, that cost piles up.

**MQTT** works another way, a lot like a **group chat**. Every device only needs to know **one** address: the address of the **broker**, the "post office" in the middle. Every device **opens** one connection to the broker **itself**, then keeps it open, like a phone that's always connected to the WhatsApp server. Over that same connection, messages can flow in **both directions**: Node 1 sends readings, and commands from the laptop reach Node 1 without Node 1 being a server. The message head is tiny, too: an MQTT message with the same JSON only adds about 30 bytes, most of them for the topic name, and there's no reply letter to wait for.

![Two panels: HTTP as a private letter, MQTT as a group chat; who has to know whose address. Left, Module 10, HTTP: Node 1 (192.168.1.23, web server) sends a POST to the laptop (192.168.1.10:3000); the phone (browser) sends GET /on to Node 1; for the dashboard later (Module 13, a dashed box) Node 1 would have to send another POST. Notes: every sender has to know every receiver's address; to take commands, Node 1 has to be a web server; a new receiver means a new send from Node 1; nobody knows when Node 1 is dead. Right, Module 11, MQTT: the broker in the middle (laptop, door 1883), surrounded by four clients that all connect to the broker: Node 1 (publishes telemetry, gets cmd), MQTTX (publishes cmd, gets telemetry), the Checker, and the Dashboard later (dashed). Notes: every client only needs one address, the broker's; the client opens the connection and keeps it open; one connection, messages flow both ways; a new reader doesn't change Node 1's firmware. Bottom: one reading over HTTP carries a letter head of about 200 bytes plus a reply letter; over MQTT, about 30 extra bytes and no reply](assets/letter-vs-group.png)

| | HTTP (Module 10) | MQTT (this week) |
| :--- | :--- | :--- |
| It's like | a private letter: one sender, one receiver | a group chat: one message, any number of receivers |
| What the sender has to know | the address of every receiver | only the broker's address |
| Who opens the connection | the one asking, every time it asks | every device, once, and then it stays open |
| Commands to Node 1 | Node 1 has to be a web server | through the connection Node 1 opened itself |
| Knows when a device is dead? | no: quiet and dead look the same | yes: the broker itself announces it (Concept 7) |
| Cost per message | a letter head of hundreds of bytes + a reply letter | a message head of a few bytes + the topic name |

That's why the Syllabus calls MQTT "the official language of IoT". This protocol was born in 1999 to monitor oil pipelines over satellite links that were expensive and often dropped, so it really was designed to be frugal and to survive dropouts. Today MQTT is used in everything from smart lamps to factories, and it's an open standard that anyone can use. The version our ESP32 uses is **MQTT 3.1.1**; the newest version, **MQTT 5**, is covered in 🔬.

HTTP doesn't retire because of this. It's still used for things that really are questions and answers: getting the weather, opening a web page, and later the backend API in Module 16. The only thing that changes this week is **Node 1's data path**: all its readings and commands move to MQTT.

### 2. *Publish/subscribe*: the broker as a WhatsApp group server

The way MQTT works is called ***publish/subscribe***, often shortened to *pub/sub*. The easiest analogy is a WhatsApp group:

| WhatsApp group | MQTT | Example in our project |
| :--- | :--- | :--- |
| The WhatsApp server | **broker** | Mosquitto on your laptop (Practice 1) |
| The group name | **topic** | `msh/a4cf12e5b7c0/telemetry` |
| Posting a message to the group | **publish** | Node 1 publishes its sensor readings |
| Joining the group | **subscribe** | MQTTX subscribes to Node 1's readings topic |
| A group member | **subscriber** | MQTTX, the contract checker, later the dashboard |

The flow is always the same:

1. Every device or app **connects** to the broker. In MQTT, they're all called **clients**, the ESP32 and MQTTX alike.
2. A client that wants to receive messages **subscribes** to a certain topic: "let me know every time there's a message on this topic".
3. A client that has news **publishes** a message to a topic. The publisher doesn't name its receivers; it only names the topic.
4. The broker passes that message on to **every** client currently subscribed to that topic, however many there are. If there are no subscribers, the message is simply thrown away.

![Diagram of publish/subscribe with the WhatsApp group analogy. Top, a three-column table: the WhatsApp server equals the broker, in our project Mosquitto on the laptop; the group name equals the topic, for example msh/a4cf12e5b7c0/telemetry; posting to the group equals publish, Node 1 sends readings; joining the group equals subscribe, MQTTX subscribes to msh/#. Bottom, the flow: Node 1, the publisher, sends a PUBLISH (marker 1) with the topic msh/a4cf12e5b7c0/telemetry and JSON content such as temperature 28.5 to the broker; the broker passes it on (marker 2) to MQTTX and to the Checker, which are both subscribed to msh/#; another client subscribed to msh/+/status doesn't receive that message (a red cross: another topic, not sent). Note at the bottom: marker 1, Node 1 publishes once, without knowing who reads it; marker 2, the broker sends a copy to every subscriber whose topic matches; unlike WhatsApp, the broker keeps no history, and whoever joins later doesn't see old messages, except retained ones (Concept 7)](assets/pubsub-group.png)

Notice three things that make this pattern such a good fit for IoT:

- **Publishers and subscribers don't know each other.** Node 1 doesn't know whether its readings are read by MQTTX, the checker, or a dashboard. Adding a new reader doesn't change a single line of Node 1's firmware.
- **One client can play both roles.** Node 1 publishes readings **and** subscribes to its own commands topic. MQTTX does too: it peeks at readings while sending commands.
- **Every connection is opened from the client to the broker.** That's why the only device that has to be "reachable" is the broker. The ESP32 stays safe behind the router, as in Module 10, but can now receive commands.

There's one important difference from WhatsApp: **the broker doesn't keep a chat history.** A message is only passed on to the clients that are subscribed **at the moment** it's published. A client that joins five minutes later doesn't see the old messages. There are two exceptions: a persistent session (Concept 6, only tried in Practice 5) and retained messages (Concept 7, used by Node 1 for its status).

The Quick Win has already proven all this: the ESP32 publishes to `learn-iot/<code>/from-esp32`, MQTTX subscribes to `learn-iot/<code>/#`, and the opposite direction goes through `from-laptop`. The difference is that the broker belongs to someone else and is open to the whole world. Now we set up our own broker.

### 3. A broker on the laptop: Mosquitto, two configuration lines, and the firewall

The broker we use is called **Mosquitto**, a free and *open-source* broker program from the Eclipse Foundation. It's small, it runs on Windows, macOS, or Linux laptops, and in Module 12 we move it to a Raspberry Pi that's always on. During this week, **your laptop becomes the post office**: Mosquitto runs in a terminal, and every client connects to the laptop's IP address on **port 1883**, the official door number for MQTT without encryption. (The encrypted MQTT door is number 8883; we use it in Module 27.)

**Mosquitto 2.x's biggest trap: by default it only serves the laptop itself.** Since version 2.0, a Mosquitto started without a configuration file goes into **local only mode**. It only opens its door to clients on the same laptop, for example MQTTX on that laptop, and refuses every connection from outside, including from your ESP32. It's like a post office that only serves the people who live in its own building: its front door is locked. Mosquitto actually says so in three warning lines when it starts, but they're easy to miss:

```text
Starting in local only mode. Connections will only be possible from clients running on this machine.
Create a configuration file which defines a listener to allow remote access.
For more details see https://mosquitto.org/documentation/authentication-methods/
```

This safeguard is deliberate. A broker without a password that's open to the network can be used by anyone, so Mosquitto's makers force us to **choose consciously**. For practicing at home, our choice takes just two lines, exactly the example from Mosquitto's official documentation:

```text
listener 1883
allow_anonymous true
```

- **`listener 1883`** opens a service counter at door 1883 for **all** of the laptop's networks, including the home Wi-Fi.
- **`allow_anonymous true`** lets clients in **without** a username and password. Without this line, Mosquitto does open its door, but refuses every client with `not authorised`.

We save those two lines in a file called `mosquitto-lan.conf` (the configuration for the local network, the LAN), then start Mosquitto with that file. Keep in mind what that means: **anyone connected to your home Wi-Fi can now use this broker**, including sending commands to the relays. That's why safety rule number 1 asks you to stop the broker before the laptop is taken to public Wi-Fi. The real lock, meaning usernames, passwords, and a per-topic permission list, is put in place in Module 21.

![Two panels: Mosquitto 2.x keeps its door locked until you open it. Left, red frame, without a configuration file, that is, local only mode: inside the laptop 192.168.1.10, Mosquitto at door 1883 only serves MQTTX on the same laptop through 127.0.0.1 (green check mark), while the ESP32 outside the laptop is refused (red cross). The Mosquitto terminal warns Starting in local only mode. Connections will only be possible from clients running on this machine; the ESP32 can't connect, for example Failed to reach the broker after … ms (code -2). Right, green frame, with mosquitto-lan.conf: the ESP32 is now accepted (green check mark); the two configuration lines listener 1883 (door 1883 for all networks) and allow_anonymous true (no password); then allow mosquitto in the firewall for Private only, and make sure the home Wi-Fi has the Private network profile. Bottom: the command mosquitto -v -c mosquitto-lan.conf, with -v so that every client and message is logged (required on Windows); one laptop, one broker: when installing on Windows, uncheck Service](assets/mosquitto-door.png)

Once Mosquitto's door is open, there's one more guard: the laptop's ***firewall***. Just like when you ran `webhook-receiver.js` in Module 10, Windows blocks incoming connections to a program that opens a door for the first time. We allow Mosquitto **only for private networks** (*Private network*), and make sure your home Wi-Fi really has the private profile. How to do it is in Practice 1.

Two more habits you'll see often:

- **Mosquitto is always started with `-v`** (*verbose*, talkative). With `-v`, the Mosquitto terminal logs every client that comes and goes, and every message that passes through, like CCTV in a post office. On Windows, `-v` is even required: without `-v`, Mosquitto almost always stays silent, even when it fails to start.
- **One laptop, one broker.** The Mosquitto installer on Windows offers to install it as a *service* (a background program that starts by itself every time Windows starts). That *service* runs in local only mode and quietly takes door 1883, so the broker in your terminal can fail to start, or the two end up running side by side. We avoid that from the start in Practice 1.

> ➡️ **Time to practice!** Concepts 1–3 are enough for [Practice 1 — Install the Mosquitto broker on the laptop](#practice-1--install-the-mosquitto-broker-on-the-laptop-30-minutes). After that, come back to Concept 4.

### 4. Topics and *wildcards*: message addresses with levels

A **topic** is plain text that serves as a message's "address". To keep things tidy, a topic is divided into several **levels** separated by a slash `/`, like a letter's address written from the most general to the most specific:

```text
msh / a4cf12e5b7c0 / telemetry
 │         │              └─ message kind: sensor readings
 │         └──────────────── device_id: which device (from the MAC address, Module 10)
 └────────────────────────── project: Mini Smart Home
```

Topics don't have to be registered with the broker first: a topic "exists" as soon as someone publishes or subscribes to it. That freedom is handy, but it also means typos are never reported: a message to the wrong topic is still accepted by the broker, then thrown away because it has no subscribers. So get to know these five topic rules:

| Rule | Examples that are **different** |
| :--- | :--- |
| Upper and lower case are different | `msh/a4cf12e5b7c0/telemetry` ≠ `msh/a4cf12e5b7c0/Telemetry` |
| A leading slash creates an empty level | `msh/a4cf…/telemetry` ≠ `/msh/a4cf…/telemetry` |
| Spaces count | `msh/a4cf…/status` ≠ `msh/a4cf…/status ` (with a space at the end) |
| A publisher's topic must not contain `+` or `#` | publishing to `msh/+/status` is refused |
| Topics that start with `$` belong to the broker | `$SYS/broker/clients/connected` |

The `/telemetry` path in Module 10 did start with a slash, because that's how HTTP paths are written. MQTT topics **don't**: write `msh/…`, not `/msh/…`.

***Wildcards*** (stand-in characters) may only be used when **subscribing**, to catch many topics at once:

- **`+`** (plus) stands for **exactly one level**. `msh/+/status` catches the status of **every** device: `msh/a4cf12e5b7c0/status`, `msh/240ac45e114b/status`, and so on.
- **`#`** (hash) stands for **that level and every level below it**, and it must be the last character. `msh/a4cf12e5b7c0/#` catches every message of one device, and `msh/#` catches every message of the project. `#` alone catches every message on the broker, except the `$SYS` topics.

![Tree of topics with levels, and wildcards; levels are separated by slashes, and wildcards are only for subscribing: + exactly one level, # that level and everything below it. On the left, the root msh branches into two device_ids: a4cf12e5b7c0 with five leaves, telemetry, status, vitals, cmd, and ack; 240ac45e114b with the leaves telemetry and status. Below it, a separate $SYS branch leads to broker/clients/connected. Every leaf gets a colored dot for each subscription that catches it: blue for msh/+/status (the status of every device: both status leaves), orange for msh/a4cf12e5b7c0/# (every message of one device: all five a4cf12e5b7c0 leaves), and teal for msh/# (every message of the project: every msh leaf); the $SYS branch has no dot. On the right, a box of common traps: # doesn't catch $SYS/…, subscribe to $SYS/# separately; Telemetry isn't the same as telemetry, upper and lower case differ; /msh/… isn't the same as msh/…, a leading slash means an empty level; msh/#/status and msh/sta+ are wrong wildcard forms and are refused](assets/topic-tree.png)

| Subscription | `msh/a4cf12e5b7c0/telemetry` | `msh/a4cf12e5b7c0/status` | `msh/240ac45e114b/status` | `practice/qos` |
| :--- | :---: | :---: | :---: | :---: |
| `msh/a4cf12e5b7c0/telemetry` | ✅ | — | — | — |
| `msh/+/status` | — | ✅ | ✅ | — |
| `msh/a4cf12e5b7c0/#` | ✅ | ✅ | — | — |
| `msh/#` | ✅ | ✅ | ✅ | — |
| `#` | ✅ | ✅ | ✅ | ✅ |

The **wrong** forms: `msh/#/status` (the `#` isn't at the end), `msh/sta+` (a `+` has to fill a whole level), and `msh#` (a `#` has to stand alone after a `/`). The broker refuses subscriptions like those.

**The `$SYS` topics.** Mosquitto publishes its own state under `$SYS/`, for example the number of connected clients in `$SYS/broker/clients/connected`, and updates it every 10 seconds. These topics aren't caught by `#`; to see them, subscribe to `$SYS/#` separately. Topics that start with `$` must not be used for your project's own messages.

**Why `device_id` and not a room name?** Our data contract deliberately doesn't write `living-room` or `garden` in the topic. Locations can change: a Node 1 that sits on your desk today might be mounted in the kitchen next month. If the location were part of the topic, every move to another room would mean changing the firmware and all its subscribers. `device_id` never changes, because it comes from the chip's MAC address. The room name is simply recorded as a description in the database (Module 17).

> ➡️ **Time to practice!** Continue to [Practice 2 — Exchange messages from the terminal and MQTTX](#practice-2--exchange-messages-from-the-terminal-and-mqttx-20-minutes), then come back to Concept 5.

### 5. The data contract: five topics and one JSON shape for everything

Until the end of the curriculum, Node 1's data will be read by many programs: MQTTX and the checker this week, Node-RED on the Raspberry Pi (Module 13), your own backend (Module 16), the database (Module 17), and the dashboard (Module 22). All those programs are written in different weeks. So that they still fit together, we need a **data contract**: a written agreement about the **topic names** and the **shape of the message content**.

It's like a **standard form** at the local government office. Because every resident fills in the same form, the clerk doesn't have to guess where the name is and where the address is. Our data contract has been written in [Syllabus Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract) since the beginning of the curriculum. This week we **use it for real**, fill in the parts that are still open, then copy it into your project as `DATA-CONTRACT.md` (Practice 9).

**Five topics for every device** (the prefix `msh` = Mini Smart Home):

| Topic | Direction | Content | Retained | When |
| :--- | :--- | :--- | :---: | :--- |
| `msh/<device_id>/telemetry` | device → broker | every sensor reading in one JSON | no | every 10 seconds, and immediately when something important happens |
| `msh/<device_id>/status` | device → broker | the text `online` or `offline` | **yes** | when connected; `offline` is published by the broker (Concept 7) |
| `msh/<device_id>/vitals` | device → broker | the device's health | no | once after connecting, then every 5 minutes |
| `msh/<device_id>/cmd` | broker → device | one command | no (except `config`, Module 19) | at any time |
| `msh/<device_id>/ack` | device → broker | the answer to one command | no | right after the command is received |

![The data contract: five topics for every device, msh/<device_id>/…, one JSON with every sensor, every command answered by an ack with the same id. Node 1 (a4cf12e5b7c0) on the left, the Mosquitto broker on the right, five arrows between them. From Node 1 to the broker: msh/<id>/telemetry, every 10 seconds and at once if important, QoS 0, example content {"ts":"…","fw":"1.2.0","temperature":28.5,…}; msh/<id>/status, retained, last will QoS 1, content online (offline is the last will, from the broker); msh/<id>/vitals, after connecting, then every 5 minutes, example content {"ts":"…","rssi":-61,"uptime_s":…}; and msh/<id>/ack, right after the command, with the same id, example content {"id":"c-001","ts":"…","ok":true,"state":{…}}. From the broker to Node 1: msh/<id>/cmd, from MQTTX or the dashboard, subscribed with QoS 1, example content {"id":"c-001","action":"set",…}. Note at the bottom: a failed reading is written as null, the client name equals the device_id, a cmd with the same id is only carried out once](assets/contract-five-topics.png)

**Example messages of Node 1 v1.2** (example `device_id` `a4cf12e5b7c0`):

```jsonc
// msh/a4cf12e5b7c0/telemetry
{"ts":"2026-10-18T01:30:12Z","fw":"1.2.0","temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}

// msh/a4cf12e5b7c0/status   (plain text, not JSON)
online

// msh/a4cf12e5b7c0/vitals
{"ts":"2026-10-18T01:30:00Z","rssi":-61,"uptime_s":86400,"heap_free":183200}

// msh/a4cf12e5b7c0/cmd   (from MQTTX or, later, from the dashboard)
{"id":"c-001","ts":"2026-10-18T01:31:05Z","action":"set","target":"lamp","value":true}

// msh/a4cf12e5b7c0/ack   (Node 1's answer, with the same id)
{"id":"c-001","ts":"2026-10-18T01:31:05Z","ok":true,"state":{"fan":false,"lamp":true,"pump":false,"curtain":90}}
```

Lines that start with `//` are only notes in this module; in a real message, there's only the content below them. The fields:

- **`ts`**: the UTC timestamp made by the **device** when the reading is taken (Concept 6 of Module 10). A message without `ts` must not be published, so Node 1 waits until its clock has been set from the internet.
- **`fw`**: the firmware version, for example `"1.2.0"`. Later, when strange data shows up, we can tell which firmware sent it.
- **`temperature` through `water_level`**: their units and ranges were set in Module 6 (the units table in Appendix A).
- **`vitals`**: `rssi` (the Wi-Fi signal strength, Concept 2 of Module 10), `uptime_s` (how many seconds it has been running), and `heap_free` (the free *heap* memory, Module 8). The `reset_reason` field is only added in Module 28.

**One JSON for all the sensors**, not one topic per reading such as `msh/<device_id>/temperature`. The reasons: all the readings are taken at the same time, so one `ts` is enough; there are only a sixth as many messages; and later the database only has to store one row per send (Module 17).

**New decisions this week.** Appendix A deliberately left a few things open until this module. You don't need to memorize the decisions below now: you'll see each of them for yourself in Practices 3–8, and the contract checker in Practice 8 warns you if you miss one. From now on, the following decisions are **locked** and recorded in Appendix A and in `DATA-CONTRACT.md`:

1. **A failed reading is written as `null`**, for every field. Up to Module 10, a failed `humidity` and `water_level` were sent as `-1`, while a failed `temperature` was already written as `null`. The number `-1` is dangerous because it can get counted: the daily average humidity could plunge because of a single failed reading. `null` means "there's no number", and both the database and the charts later understand what that means. Inside the firmware, the failure markers are still `NAN` and `-1`; the only thing that changes is how they're written in the JSON.
2. **The client name at the broker (*client ID*) = `device_id`.** The broker recognizes every client by its name, and that name **must be unique**. If two clients use the same name, the broker kicks out the old one every time the new one arrives, and the two keep kicking each other out. `device_id` is guaranteed to be unique, because it comes from the chip's MAC address.
3. **`telemetry` every 10 seconds, plus an immediate send** whenever one of these four states changes: whether there's motion or not, whether the place is bright or dark (the threshold `1000`, the same as the automatic lamp in Module 6), whether the soil is drier or wetter than the watering threshold, and whether the tank water is below or above the 20% safe limit. Immediate sends happen at most every 2 seconds (Concept 8).
4. **`vitals` once after connecting, then every 5 minutes.**
5. **The status** `online` is published by the device as a retained message as soon as it's connected. The `offline` status is left with the broker as a *Last Will* (QoS 1, retained), which the broker publishes when the device disappears (Concept 7).
6. **Every `cmd` is answered with one `ack`** carrying the same `id`, `ok` (`true` or `false`), the state of all four actuators in `state`, and a **`message`** field with the reason for the refusal if `ok` is `false`. Appendix A allows 5 seconds; our requirement for passing is much stricter: **under 1 second**. If the device's clock isn't set yet, the `ack` is still sent, with `"ts":null`, because answering matters more than recording the time.
7. **The only `action` Node 1 v1.2 knows** is `set`: `lamp` and `fan` with the value `true`/`false`, `pump` with a value of 1–10 (seconds), and `curtain` with a value of 0–180 (degrees). `config` and `update` are already listed in the contract, but they're only carried out in Modules 19 and 28; until then, Node 1 answers them with `ok:false`.
8. **A command with the same `id` is only carried out once.** While it's running, Node 1 remembers the last eight `id`s and quietly ignores repeats of them; that memory is empty again every time Node 1 restarts. An `id` may be at most 39 characters long so that it fits in that memory; a command with a longer `id` is ignored without an answer. The reasons are in Concepts 6–8.

> 💡 **"Contract" means it isn't changed carelessly.** Renaming one field, for example `temperature` to `temp`, would break every program that already reads that field. If it really has to change someday, change Appendix A and `DATA-CONTRACT.md` first, only then the code, and raise the firmware version. The contract checker in Practice 8 guards this agreement automatically.

> ➡️ **Time to practice!** Continue to [Practice 3 — The ESP32 publishes `telemetry` to the laptop broker](#practice-3--the-esp32-publishes-telemetry-to-the-laptop-broker-30-minutes), then come back to Concept 6.

### 6. QoS: regular mail, registered mail, and a courier who wants a signature

Networks aren't perfect: the Wi-Fi can drop for a moment, and the laptop can fall asleep. MQTT lets you choose how hard it tries to deliver a message. That choice is called **QoS** (*Quality of Service*), and there are three levels:

| QoS | It's like | How it works | The result |
| :---: | :--- | :--- | :--- |
| **0** | **regular mail**: dropped in the mailbox, done | sent once, with no receipt | arrives once, or is lost |
| **1** | **registered mail**: there's a receipt | the receiver replies with `PUBACK`; if the receipt doesn't come because the connection dropped, the sender sends it again after reconnecting | always arrives, but **can arrive twice** |
| **2** | **a courier who wants a signature**: a four-step handover | `PUBLISH` → `PUBREC` → `PUBREL` → `PUBCOMP` | arrives **exactly once**, the slowest |

![Three QoS sequence diagrams; time runs from top to bottom, the sender on the left, the receiver on the right. QoS 0, regular mail: one PUBLISH arrow, with no receipt and no resending; arrives once, or is lost; Node 1's telemetry uses this. QoS 1, registered mail: PUBLISH number 7 is answered with PUBACK number 7; if the PUBACK gets lost on the way: PUBLISH number 8 arrives, but its PUBACK is lost, then after reconnecting the sender repeats PUBLISH number 8 marked DUP, so the receiver gets the same message twice; always arrives, may be doubled; Node 1's cmd subscription uses this. QoS 2, a courier who wants a signature: a four-step handover, 1 PUBLISH, 2 PUBREC, 3 PUBREL, 4 PUBCOMP; exactly once, the slowest; PubSubClient3 can't subscribe with QoS 2. Note at the bottom: QoS applies per leg; publisher to broker uses the publisher's QoS, broker to subscriber uses the lower of the published QoS and the subscription QoS; PubSubClient3 on the ESP32 subscribes with QoS 0 or 1 and publishes QoS 1 without ever resending, like QoS 0 when the connection drops](assets/qos-three-levels.png)

Three things that often confuse people:

- **QoS applies per leg of the journey.** A message from the publisher to the broker uses the QoS the publisher chose. From the broker to the subscriber, the QoS is **the lower** of the published QoS and the subscription QoS. So a QoS 0 message on a topic subscribed with QoS 1 still arrives as QoS 0.
- **QoS 1 and 2 aren't free.** Every receipt is an extra packet, and the sender has to keep the message until its receipt arrives. That's why QoS 0 is actually the right choice for `telemetry`: a new reading comes 10 seconds later anyway.
- **QoS doesn't guarantee that a command gets carried out.** QoS only takes care of the message's journey **to the client**. Whether the relay really turned on, only Node 1 knows. That's what the `ack` is for (Concept 8).

**The library's limits on the ESP32.** The **PubSubClient3** library can subscribe with QoS 0 or 1 (not QoS 2). It can publish with QoS 1, but it **never resends** a message whose receipt doesn't come. As a result, if the connection drops halfway, that message is still lost, just as with QoS 0. (The old PubSubClient 2.8 could only publish QoS 0.) That's why, as the Syllabus suggests, we test the difference between QoS 0 and 1 with messages **sent from the laptop**: first to another subscriber on the same laptop, then through the broker **to the ESP32** (Practice 5).

**A persistent session: a broker that's willing to keep messages.** Normally, the broker forgets a client as soon as its connection drops. But a client may ask for a **persistent session**: it connects with the *clean session* flag (start with a clean slate) set to `false` and with a *client ID* that's always the same. While that client is away, the broker **keeps** messages for it, then hands them over when it comes back, with these rules:

- Messages that arrive on a **QoS 1** subscription are kept.
- **QoS 0** messages aren't kept by Mosquitto. (The MQTT rules allow a broker to keep them, and some public brokers do; that's why the Wokwi version of Practice 5 uses the HiveMQ broker.)

That's what we test in Practice 5: the ESP32's Wi-Fi is turned off, QoS 0 and QoS 1 messages are sent from MQTTX, then the Wi-Fi is turned on again. Only the "registered mail" is waiting at the broker.

**Node 1 deliberately doesn't use a persistent session.** Imagine Node 1 being dead all night while someone sends the command "pump for 10 seconds" five times. With a persistent session, all five stale commands would be carried out at once as soon as Node 1 powers up in the morning. For actuators, a late command is more dangerous than a lost one: a lost command can be repeated by its sender once it sees that the `ack` didn't come. So Node 1 connects with *clean session* = `true`, and subscribes to `cmd` with QoS 1 so that deliveries while it's connected still travel as registered mail.

### 7. Retained, *Last Will*, and *keep-alive*: a notice board, a last will, and a heartbeat

In Concept 2 we learned that the broker doesn't keep a message history. As a result, an MQTTX that has just been opened doesn't know whether Node 1 is alive until the next message arrives. These three MQTT features solve that.

**A retained message = a notice board.** A message published with the retained flag is **kept** by the broker on its topic, just one message per topic: a new retained message replaces the old one. Every time a client **newly subscribes** to that topic, the broker hands that message over right away, like a notice that stays pinned to the board and can be read by people who come later. MQTTX labels messages like this **Retained**.

- It suits states that **hold until they're replaced**: the `online`/`offline` status and, in Module 19, the threshold configuration.
- It does **not** suit `telemetry` (an old reading left pinned up is misleading), and it's **very dangerous for `set` commands**: a retained command is handed over again every time Node 1 connects, so the lamp can turn on by itself, for example after Node 1 restarts. The library on the ESP32 doesn't tell whether a message came from the notice board, and the `id` memory (decision 8 in Concept 5) only blocks repeats while Node 1 is running: its memory is empty again after a restart, so that retained command is carried out again. So never tick **Retain** when you send a command from MQTTX, and clear a command that got pinned up by mistake right away (🚨 "The lamp turns on again by itself").
- **Clearing** a notice: publish an **empty** message with the retained flag to the same topic. MQTTX has a **Clear Retained Message** menu; in the terminal, `mosquitto_pub -t <topic> -r -n`.

***Last Will* = a last will.** When it connects, a client may **leave** one message with the broker: its topic, content, QoS, and retained flag. The broker keeps that message while the client is connected, and publishes it **only if the client disappears without saying goodbye**: a power cut, a dropped Wi-Fi connection, a board that restarts, or a stuck program. If the client says goodbye properly (by sending a `DISCONNECT` packet), the last will is thrown away.

Put the two together, and we get an **automatic status**:

1. When connecting, Node 1 leaves its last will: "if I disappear, publish `offline` on `msh/<device_id>/status`, QoS 1, retained".
2. As soon as it's connected, Node 1 itself publishes `online` to the same topic, also retained.
3. If Node 1 disappears, the broker publishes its last will. The notice board now says `offline`, and anyone who opens MQTTX later sees it right away.

```cpp
// Last will: the status topic, QoS 1, retained (true), content "offline"
if (mqtt.connect(deviceId, statusTopic, 1, true, "offline")) {
  mqtt.publish(statusTopic, "online", true);  // true = retained
}
```

***Keep-alive* = a heartbeat.** How does the broker know a client has "disappeared", when a connection that breaks suddenly often leaves no trace at all? When connecting, the client promises: "I'll send something at least every **15 seconds**" (PubSubClient3's default value). PubSubClient3 keeps that promise in a simple way: every time 15 seconds pass without any packet from the broker, `mqtt.loop()` sends a small `PINGREQ` packet ("I'm still here"), and the broker answers with `PINGRESP`. Because QoS 0 `telemetry` is never answered by the broker, this heartbeat still goes out every 15 seconds even when Node 1 publishes messages diligently. That `PINGRESP` answer is what tells Node 1 the broker is still alive (🔬). If the broker hears nothing for **1.5 times** that number, that is **22.5 seconds**, the client is considered dead: its connection is closed and its last will is published. The Mosquitto terminal logs this as `disconnected: exceeded timeout.`

![A 60-second timeline: a notice board, a last will, and a heartbeat; example: Node 1's USB cable is unplugged at second 33. Node 1 row: at the start, CONNECT while leaving the last will status = "offline", QoS 1, retained, then publish online (retained); telemetry at seconds 10, 20, and 30; a red cross, USB unplugged, at second 33; after that it's dead and can't send anything. Broker row: the notice board says online from the start until second 52.5, then offline; a bracket from second 30 to 52.5 reads 22.5 seconds without news, 1.5 times the 15-second keep-alive; at second 52.5 the last will is published. MQTTX row: it only subscribes at second 15 and immediately receives online marked Retained; at second 52.5 it receives offline. At the bottom, three cards: Retained equals a notice board, the broker keeps the last message of a topic, new subscribers get it right away, clear it with an empty message plus the retained flag; Last Will equals a last will, left by the client when connecting, published by the broker if the client vanishes without a goodbye, thrown away if the client says goodbye with DISCONNECT; Keep-alive equals a heartbeat, the client sends something at least every 15 seconds; every time 15 seconds pass without a packet from the broker, the client sends PINGREQ and the broker answers PINGRESP; the broker gives up after 22.5 seconds](assets/retained-will-heartbeat.png)

From this we know how long it takes for `offline` to appear after Node 1's USB cable is unplugged: the broker counts 22.5 seconds **from the last message** from Node 1. Because Node 1 publishes something at least every 10 seconds, `offline` appears **about 13–23 seconds** after it's unplugged. Faster than that isn't needed; a heartbeat that's too frequent only wastes battery and data.

Two small notes you'll see in Practice 4:

- **Press EN, and `offline` usually appears briefly, then changes to `online`.** A Node 1 that has just restarted connects again with the same name before 22.5 seconds have passed. The broker kicks out the old connection that was left behind, publishes its last will (`offline`), and then the new Node 1 immediately publishes `online`.
- **Restart the broker, and the notice board is empty.** The Mosquitto we start with `mosquitto-lan.conf` keeps retained messages in memory only, on Windows, macOS, and Linux alike. After the broker restarts, the statuses only show up again as each device reconnects. (A Mosquitto running as a service on Debian and Ubuntu, like the one on the Raspberry Pi in Module 12, saves them to disk.)

> ➡️ **Time to practice!** Concepts 6–7 are enough for [Practice 4 — Automatic online/offline status](#practice-4--automatic-onlineoffline-status-20-minutes) and [Practice 5 — QoS 0 vs QoS 1 while the ESP32's Wi-Fi is off](#practice-5--qos-0-vs-qos-1-while-the-esp32s-wi-fi-is-off-25-minutes). After that, come back to Concept 8.

### 8. When to send and when to answer: every 10 seconds, immediately when it matters, and command → `ack`

**A fixed schedule: every 10 seconds.** In Module 10, Node 1 sent its readings every minute. For a dashboard that feels "alive", that's too rare, so the data contract sets **10 seconds**. In a day, that's 8,640 messages or about 1 MB of JSON text: very light work for a broker on a home network.

**Immediate sends when something important happens** (*report-by-exception*: reporting when something out of the ordinary happens). A 10-second schedule alone still has a weakness: motion in front of the PIR shows up on the laptop up to 10 seconds later. Yet some news matters more than just the latest number, for example "someone came in" or "this place suddenly got dark". For news like that, Node 1 publishes `telemetry` **right away**, without waiting for the schedule. Its content is exactly the same as a scheduled send; the only difference is **when** it's sent.

What counts as important is a **change of state**, not every reading that crosses a threshold. As long as the place stays dark, there are no extra sends; an immediate send only happens at the exact moment the state **changes**, for example from bright to dark. The four states Node 1 v1.2 watches are already listed in decision 3 of Concept 5: motion, dark or bright, dry soil, and low tank water.

![A 40-second timeline: when Node 1 sends, a 10-second schedule plus immediate sends. Motion row (PIR): no motion until second 23, then motion. Light row (LDR): bright until second 24, then dark (light below 1000). Sends row: scheduled sends at seconds 0, 10, and 20; at second 23 motion is detected, an immediate send; at second 24 it's getting dark, but the send waits for the 2-second gap, so it's published at second 25; a dashed mark at second 30 reads not 30 s, meaning no scheduled send falls at second 30; the next scheduled send is at second 35, 10 seconds after the last send. Note at the bottom: immediate sends only when a state changes, in both directions: motion appears or disappears, bright or dark, soil dry or wet, tank water low or OK; not on every reading; the message is the same as a scheduled send, the eight telemetry fields with the latest readings; Node 1 v1.2 checks the states every time the sensors are read (once every 2 seconds), so its immediate send lands on the next reading](assets/when-to-send.png)

Two extra rules keep this approach polite:

- **At most every 2 seconds.** A flickering PIR or a shadow passing in front of the LDR can trigger changes several times a second. Without a limit, Node 1 would flood the broker. Events that come too close together aren't thrown away: they're sent as soon as the 2-second gap has passed, with the latest readings.
- **The schedule restarts from the last send.** If an immediate send happens at second 7, the next scheduled send falls 10 seconds after it, not at second 10. That way, the gap between sends is never more than 10 seconds, and there are no wasteful double sends.

You'll feel the result in Module 23: the chart on your phone changes about 1–2 seconds after you cover the LDR with your hand, not 10 seconds later.

**Command → `ack`: every command gets an answer.** In Module 10, opening `/on` only produced a web page; there was no official record that the command was actually carried out. Our MQTT pattern is more orderly, like a **queue number at the bank**:

1. The sender (MQTTX, later the dashboard) publishes a command to `msh/<device_id>/cmd`, complete with a **unique `id`** of at most 39 characters, for example `"c-001"`. That's the queue number.
2. Node 1 receives the command, **checks** it, then **carries it out**.
3. Node 1 publishes an **`ack`** (*acknowledgement*, a receipt) to `msh/<device_id>/ack` with **the same `id`**, `ok` (`true` if it was carried out), the state of all the actuators in `state`, and the reason in `message` if it was refused.
4. The sender matches the answer's `id` with its command. An answer that doesn't come within 5 seconds means there's a problem, and the sender may try again with a **new** `id`: Node 1 v1.2 quietly ignores an `id` it has already received, so a repeat with the same `id` won't be answered.

![Sequence diagram of a command and its ack, like a queue number at the bank; three lifelines: MQTTX, the broker, and Node 1. 1, MQTTX publishes to msh/a4cf12e5b7c0/cmd; the broker passes its content {"id":"c-001","action":"set","target":"lamp","value":true} on to Node 1. In Node 1: 2, read JSON (with length), id present? seen before?, action, target, value type?; 3, do it: the lamp relay clicks. 4, Node 1 publishes to msh/a4cf12e5b7c0/ack, and the broker passes {"id":"c-001","ts":"…","ok":true,"state":{…}} on to MQTTX. 5, match the id, done; the round trip on home Wi-Fi is estimated at tens to hundreds of milliseconds (the requirement for passing is under 1 second; in Wokwi with a public broker, 1 to 2 seconds). Notes at the bottom: the same id comes again, ignored because Node 1 remembers the last 8 ids; a wrong command is still answered with ok:false plus a "message" with the reason; not JSON or no id, can't be answered, only logged in the Serial Monitor, and the same goes for an id longer than 39 characters](assets/command-ack.png)

Even a wrong command **still gets an answer**, with `ok:false` and its reason. That way, the sender can tell "your command was refused" from "the device didn't hear it". The only exceptions are messages that aren't JSON, have no `id`, or have an `id` longer than 39 characters: without a valid queue number, there's nothing to answer, so Node 1 only logs them in the Serial Monitor.

**The order inside the command handler.** The library calls our function every time a message arrives on a subscribed topic, and we handle it in the order **read → check → carry out → answer**:

```cpp
void onCommand(char* topic, byte* content, unsigned int length) {
  JsonDocument command;
  if (deserializeJson(command, content, length)) {  // the content has NO end-of-text mark: always pass its length
    return;                                         // not JSON: there is no id to answer
  }
  const char* id = command["id"] | "";              // "" if the id is missing or not text
  // ... empty id, longer than 39 characters, or already received? ignore it ...
  if (!command["value"].is<bool>()) {               // check the TYPE of the value first
    sendAck(id, false, "value must be true or false");
    return;
  }
  setLamp(command["value"].as<bool>());             // only now is it used
  sendAck(id, true, nullptr);
}
```

Three traps that this snippet guards against:

- **The message content isn't ordinary text that ends with an end-of-text mark.** The library only gives the start address of the content and its `length`. So `deserializeJson()` has to be given the `length`, and the content is printed with `Serial.write(content, length)`, as in the Quick Win.
- **`"false"` (text) isn't `false`.** In ArduinoJson, `as<bool>()` treats **every text** as true, including the text `"false"`. A mistyped command `{"value":"false"}` would **turn on** the fan if the value's type weren't checked first with `is<bool>()`. We refuse commands like that instead of guessing what they meant.
- **The same command can arrive twice.** QoS 1 may deliver again, and a command that was sent with **Retain** by mistake comes again every time Node 1 connects. That's why Node 1 remembers the last eight `id`s and ignores repeats of them. This principle is called ***idempotent***: carrying out the same command twice has the same result as carrying it out once. That memory only exists in working memory and is empty again after every restart, so a retained command is still carried out again every time Node 1 powers up.

This function runs **inside** `mqtt.loop()`, so it has to finish quickly. Publishing the `ack` from inside it is safe, as long as the command's content has been read first: the library uses one and the same container for incoming and outgoing messages, and that container is overwritten as soon as we publish something.

**How fast does the answer come?** On home Wi-Fi with the broker on the laptop, the round trip of a command and its `ack` is estimated at only tens to a few hundred milliseconds, far below the 1-second requirement for passing. In Wokwi with a public broker, the message crosses the internet twice, so the answer takes about 1–2 seconds; that's normal and not a mistake in your sketch.

> ➡️ **Time to practice!** Concept 8 is enough for [Practice 6 — Commands from MQTTX, answered with `ack`](#practice-6--commands-from-mqttx-answered-with-ack-30-minutes) and [Practice 7 — Send immediately when something happens](#practice-7--send-immediately-when-something-happens-20-minutes). After that, come back to Concept 9.

### 9. Message size: the 256-byte container that silently throws things away

The **PubSubClient3** library holds every incoming message in one **container** (a buffer) in memory. Its default size is **256 bytes**, and what has to fit there isn't just the message content, but **the whole packet**:

```text
packet = header 2–3 bytes + topic length 2 bytes + topic + (2-byte packet number for QoS 1) + content
```

For example: a `set` command to `msh/a4cf12e5b7c0/cmd` (a 20-byte topic) with about 95 bytes of JSON content makes a packet of about 120 bytes. It still fits.

**What happens if an incoming packet is bigger than its container:** the library still reads that packet to the end so that the connection doesn't get mixed up, then **silently throws it away**. The command handler isn't called, there's no error message, and `mqtt.loop()` still reports that everything is fine. From the outside, there's only one symptom: **the `ack` never comes**. Note that the message isn't cut off: it's **thrown away whole**. The result is just as dangerous, because nobody knows.

![The 256-byte container that silently throws things away: what has to fit is the whole incoming MQTT packet, not just its JSON content. Three bars. First, a regular set command, a 121-byte packet (a 2-byte header, the topic length, the 20-byte topic, the packet number, 95 bytes of JSON content) fits in the 256-byte container, green check mark. Second, a command with a long note, a 287-byte packet with 260 bytes of JSON content, goes past the 256-byte limit of the container; the part beyond the limit is red, red cross, too big: read to the end, then thrown away. Third, after setBufferSize(512), the same 287-byte packet fits in the 512-byte container, green check mark. Legend: header 2 to 3 bytes; topic length 2 plus packet number 2; topic msh/<id>/cmd 20 bytes; JSON content. Note at the bottom: a thrown-away packet doesn't call the receiving function, there's no error message, mqtt.loop() stays just fine; the only symptom, the ack never comes; the cure is one line in setup(), mqtt.setBufferSize(512)](assets/buffer-256.png)

For outgoing messages, PubSubClient3 is more generous: a message bigger than its container is still sent, piece by piece. (The old PubSubClient 2.8 refused to send it: `publish()` answered `false`, and the message didn't go out.)

The packet sizes of Node 1's messages today:

| Message | Direction | Approximate packet size |
| :--- | :--- | ---: |
| `cmd` of the `set` kind | incoming | 110–125 bytes |
| `cmd` of the `set` kind, typed neatly over several lines in MQTTX | incoming | about 145 bytes |
| `cmd` of the `update` kind (Module 28) | incoming | about 170 bytes |
| `vitals` | outgoing | about 105 bytes |
| `telemetry` (eight fields) | outgoing | 160–170 bytes |
| `ack` that refuses, complete with its reason | outgoing | about 200 bytes |

They all do still fit in 256 bytes, but the margin is thin. The spaces and line breaks in a neatly typed command count too, and the configuration in Module 19 will get more fields. Incoming messages that grow past 256 bytes later would be lost without a trace. That's why the Node 1 firmware and the sketches of Practices 3, 4, 6, and 7 enlarge the container to **512 bytes** in `setup()`:

```cpp
mqtt.setBufferSize(512);  // a 512-byte message container (default: 256); returns false if there is not enough memory
```

It only costs 256 extra bytes of memory out of the roughly 180 KB that are still free (see `heap_free` in `vitals`).

> ⚠️ **The `#define MQTT_MAX_PACKET_SIZE 512` recipe from old tutorials doesn't work.** That line, written in a sketch, never reaches the library's code, because the library is compiled separately with its own number, 256. Use `setBufferSize()`.

The second container is in our own program: an array like `char content[192]` in Node 1, where the JSON is written before it's published. If the JSON is longer than that array, `serializeJson()` stops at the end of the array **without** an end-of-text mark. That's why, from this week on, our sketches check the length first: if the result of `serializeJson()` is equal to or bigger than the array's size, the message isn't published. (Node 1 v1.1 in Module 10 didn't check it yet; back then its content was still much shorter than the array.)

### 10. Don't let MQTT freeze Node 1

The Module 10 rule still applies, now with an addition: **the Wi-Fi may drop, the broker may die, but Node 1 must not stop.** Our broker runs on a laptop, and a laptop can fall asleep, be closed, or be carried away at any time. Meanwhile, Node 1 has to keep watering the plants and turning on the automatic lamp.

The problem is that `mqtt.connect()` **waits**. Connecting to the broker takes two steps: opening a **TCP connection** (the send-and-receive path between the ESP32 and the laptop that the MQTT messages will travel along; opening it is like waiting for the phone to be picked up before you start talking), then waiting for the broker to answer. Both have default time limits that are far too patient:

| Step | Default limit | When that limit runs out |
| :--- | ---: | :--- |
| 1. Opening the TCP connection to the laptop | 3 seconds | a wrong IP address, a sleeping laptop, or a connection blocked by the firewall |
| 2. Waiting for the broker's answer (`CONNACK`) | **15 seconds** | the connection is open, but the broker doesn't answer |

Fifteen seconds is far beyond the patience of the Module 8 watchdog, which is **5 seconds**. One attempt that gets stuck is enough to make Node 1 restart, then try again, then restart again. Worse still, many tutorials write a pattern like this:

```cpp
while (!mqtt.connected()) {  // NOT in Node 1: loop() is stuck as long as the broker is down
  mqtt.connect("esp32");
  delay(5000);
}
```

The Quick Win used a similar waiting pattern, and for a try-out sketch, that's fine. In Node 1, that pattern would stop the sensors, the button, and the pump from being served for as long as the broker is down.

**Our recipe**, used in every practice sketch and in Node 1 v1.2:

1. **`netClient.setConnectionTimeout(1000)`**: opening the TCP connection takes at most 1 second.
2. **`mqtt.setSocketTimeout(1)`**: waiting for the broker's answer takes at most 1 second.
3. **The broker's address is written as an IP address**, for example `"192.168.1.10"`, not a name. Looking up a name through DNS isn't covered by the limit in step 1 and can hold up the program for about 7 seconds for every DNS server that doesn't answer (🔬 of Module 10).
4. **Try to connect at most every 5 seconds, and only when the Wi-Fi is connected.** Between two attempts, `loop()` keeps running as usual.
5. **`mqtt.loop()` is called on every pass of `loop()`** while connected. Without it, incoming messages aren't read and the heartbeat isn't sent.
6. **Every time it connects successfully: publish `online` and subscribe to `cmd` again.** With a *clean session*, the broker forgets the old subscriptions as soon as the connection drops.
7. **Leave the *keep-alive* at 15 seconds**; don't make it longer. If the broker disappears without a trace, the messages Node 1 keeps publishing pile up in the ESP32's send queue. Once that queue is full, a single send can wait up to about 10 seconds, and the watchdog bites. A 15-second *keep-alive* notices the missing broker long before the queue is full.

With this recipe, a failed attempt only holds up `loop()` for about 1 second, at most once every 5 seconds. The watchdog stays calm.

![Three 30-second timeline rows while the broker is down or stuck; the Module 8 watchdog restarts the board if loop() is stuck for more than 5 seconds. The tutorial pattern row, while (!mqtt.connected()): loop() is held up; every time it's held up for 5 seconds, the watchdog restarts Node 1, then loop() is held up again. The library's default limit row while the broker is stuck (the connection is open, but the CONNACK answer doesn't come), connect() waits 15 seconds: after running for a moment, connect() waits, and at second 6 the watchdog restarts the board, the remaining 10 seconds never come, then it starts over; a small note: a broker that is fully down fails fast or after 3 seconds. Our recipe row, at most 1 second every 5 seconds: loop() keeps running, with small gray blocks "try ≤ 1 s" at seconds 0, 5, 10, 15, 20, and 25; the sensors, button, pump, and display keep working; green check mark. Bottom: setConnectionTimeout(1000), setSocketTimeout(1), an IP address, not a name; try to connect at most every 5 seconds, only while the Wi-Fi is connected; mqtt.loop() on every pass](assets/never-stuck.png)

**Reading the `mqtt.state()` code.** Every failure leaves a number that explains its cause. Our sketches translate it with the `mqttStateName()` function:

| Code | What it means | Usually because |
| :---: | :--- | :--- |
| `-4` | the broker did not answer in time | the broker is stuck, or the heartbeat got no answer |
| `-3` | connection lost | the Wi-Fi dropped, the broker was stopped, or another client uses the same name |
| `-2` | could not connect to the broker | see below the table |
| `-1` | not connected yet | the starting state, before the first attempt |
| `0` | connected | — |
| `1`–`3` | rejected by the broker | the MQTT version isn't supported, the client name was refused, or the broker can't serve right now |
| `4` | username or password rejected | only relevant from Module 21 on |
| `5` | not authorized by the broker | `allow_anonymous true` was forgotten (Concept 3) |

Code `-2` shows up most often, and **how long** the attempt took gives a clue. That's why our sketches print how many milliseconds each attempt lasted:

- **Fails within a few milliseconds:** your laptop answered "nobody is serving door 1883". Mosquitto hasn't been started, is running in local only mode, or the port number is wrong. This quick answer usually only comes from macOS and Linux laptops. A Windows firewall that's on deliberately stays silent when an unserved door is knocked on, so on a Windows laptop, even these three causes usually show up as a failure after about 1,000 milliseconds.
- **Fails after about 1,000 milliseconds:** no answer at all. The IP address is wrong, the laptop is asleep, the ESP32 and the laptop are on different networks, or the firewall is blocking. On a Windows laptop, check the broker terminal first: a broker that's stopped or running in local only mode looks like this too.

> ➡️ **Time to practice!** Concepts 9–10 took a close look at the safety lines you've been using since Practice 3. Now continue to [Practice 8 — The contract checker](#practice-8--the-contract-checker-20-minutes) and [Practice 9 — The *pub/sub* diagram and `DATA-CONTRACT.md`](#practice-9--the-pubsub-diagram-and-data-contractmd-20-minutes). After that, continue to the 🧩 Challenges and ➕ Mini Smart Home.

---

## 🔧 Step-by-step practice

Nine practices, **in order**. Practices 1–2 only use the laptop. Practices 3–7 use the **Node 1 board** on your workbench, plugged into the laptop; the Node 1 v1.1 sketch does get overwritten during the practices, and in the ➕ section, this board runs Node 1 v1.2. Practices 8–9 go back to the laptop, then to a sheet of paper.

**Two windows that stay open this week:**

1. **The broker terminal** in VS Code. Mosquitto has to be running **before** the ESP32 tries to connect. If the laptop fell asleep or VS Code was closed, run its command again (step 1.3).
2. **MQTTX**, the magnifying glass for seeing every message that passes through.

**The habit from Module 10 still applies:** every ESP32 sketch starts from the previous sketch. Open that sketch, choose **File → Save As…** (**Ctrl + Shift + S**), move to the **Documents → GitHub → learn-iot → module-11** folder, then save it under a new name. The `secrets.h` tab gets copied along, so you only need to replace the content of the main tab.

These three steps in the ➕ section are requirements for passing (marked with ⭐):

1. **Section ➕ E** — a command from MQTTX turns on the relay and is answered with an `ack` in less than 1 second (practice for it: Practice 6).
2. **Section ➕ F** — Node 1's `telemetry` passes the contract checker (practice for it: Practice 8).
3. **Section ➕ H** — your project's *pub/sub* diagram is drawn on paper (practice for it: Practice 9).

> 🖥️ **Doing Practices 3–7 in Wokwi?** Set up one Wokwi project with the Node 1 circuit, then reuse it for all five practices:
>
> 1. Open a new ESP32 project at [wokwi.com](https://wokwi.com). In the **`diagram.json`** tab, replace its whole content with the content of the [`code/node-1-home/diagram.json`](code/node-1-home/diagram.json) file (open the file on GitHub, click the **Copy raw file** icon, then paste).
> 2. **Give your ESP32 its own MAC address.** In that `diagram.json`, find the line `"macAddress": "24:0a:c4:00:01:10"`, then replace the **last three pairs** with digits and letters `0`–`9`/`a`–`f` of your choice, for example `"24:0a:c4:5e:11:4b"`. Without this step, every simulated ESP32 in the world has the same `device_id`, `240ac4000110`, and they keep kicking each other out on the public broker (Concept 5). Don't copy that example exactly either: other readers who copy it would get the same `device_id` as you. Make up your own combination, but don't use personal data such as your date of birth, because the `device_id` is visible to anyone on the public broker.
> 3. Create a **`secrets.h`** file through **▾ → New file...** and fill it with the `Wokwi-GUEST` network, as in the Quick Win.
> 4. In the **`libraries.txt`** tab, replace its whole content with these four lines:
>
>    ```text
>    PubSubClient3@3.3.2
>    ArduinoJson@7.4.3
>    DHT sensor library@1.4.7
>    Adafruit Unified Sensor@1.1.15
>    ```
>
> 5. In each practice, paste its sketch into `sketch.ino`, then change the `BROKER_ADDRESS` line to the public broker `"broker.emqx.io"` (Practice 5: `"broker.hivemq.com"`). In MQTTX, use the **Public broker** connection from the Quick Win and subscribe to `msh/` + your `device_id` + `/#`, for example `msh/240ac45e114b/#`. Don't use `msh/#` or `msh/+/…` on a public broker: other readers' messages from all over the world get caught too. If a step uses a subscription like that (for example `msh/+/status` in Practice 4), replace the `+` with your `device_id`, for example `msh/240ac45e114b/status`.
> 6. **The terminal commands in these practices go to the laptop broker.** On the Wokwi path, the commands that peek at the ESP32 (topics `msh/…`) get an extra `-h broker.emqx.io`, and their topic uses your `device_id`, for example `mosquitto_sub -h broker.emqx.io -v -t "msh/240ac45e114b/status"`. The `practice/…` exercises that don't involve the ESP32 (the notice board at the end of Practice 4, and step 5.1) are still done on the laptop broker, without `-h`. The checker in Practice 8 is also given the public broker's address and your `device_id`: `node contract-checker.js broker.emqx.io 240ac45e114b`.
>
> A public broker can be read and written by anyone, so send only simulated data, and never connect a real board that controls relays and a pump to it. The **Expected output** boxes marked **example** in these practices were put together from Wokwi recordings made in exactly this way; only the Wi-Fi name, the addresses, the `device_id`, and the numbers were replaced with examples from a home network.

### Practice 1 — Install the Mosquitto broker on the laptop (30 minutes)

> 🖥️ **Tools:** a laptop with a **browser**, **VS Code** with the `mini-smart-home` folder from Module 4, and administrator rights on the laptop (to install programs). No ESP32 needed yet. Concepts used: 3.

#### 1.1 Install Mosquitto

**Windows:**

1. Open [mosquitto.org/download](https://mosquitto.org/download/). In the **Windows** section, click `mosquitto-2.1.2-install-windows-x64.exe` (the 64-bit version, used by almost every laptop).
2. Run that file. Windows asks `Do you want to allow this app to make changes to your device?`; click **Yes**. If the blue `Windows protected your PC` screen appears, make sure you really downloaded the file from mosquitto.org, click **More info**, then **Run anyway**.
3. On the installer's welcome page, click **Next >**.
4. **The most important step:** on the `Choose Components` page, **uncheck Service**. Leave **Files** and **Visual Studio Runtime** checked, then click **Next >**. (If **Service** stays checked, the installer starts a second broker in the background that takes door 1883; see Concept 3.)
5. Leave the destination folder as `C:\Program Files\Mosquitto`, click **Install**, then **Finish**.

The installer doesn't add that folder to the list of program folders (`PATH`), so the terminal doesn't know the `mosquitto` command yet. Add it once:

6. Click **Start**, type `environment`, then choose **Edit environment variables for your account**.
7. In the `Environment Variables` window, in the top part (**User variables for** your account name), click the **Path** row, then click **Edit…**.
8. Click **New**, type `C:\Program Files\Mosquitto`, then press **Enter**. Click **OK**, then **OK** once more.
9. **Close all VS Code windows, then open it again.** VS Code only reads the list of program folders when it opens.

**macOS** (needs [Homebrew](https://brew.sh)): open Terminal, then type `brew install mosquitto`. On a Mac with an Apple chip, the installation only takes a few minutes. On an Intel Mac, Homebrew has to compile Mosquitto first, so it can take much longer. **Don't** run `brew services start mosquitto`; we run the broker in a terminal only.

**Linux (Ubuntu, Debian, or Raspberry Pi OS):** type `sudo apt install mosquitto mosquitto-clients`. This package immediately starts Mosquitto as a background service in local only mode, so stop it first to free door 1883: `sudo systemctl disable --now mosquitto`. (In Module 12, this very service is the one we use on the Raspberry Pi.) The version from Ubuntu 24.04 is 2.0.18; some of the texts in its terminal are slightly different from the examples below, but the steps are the same.

#### 1.2 See the "local only mode" trap for yourself

1. In VS Code, open a terminal: **Terminal → New Terminal**.
2. Type this command, then press **Enter**:

   ```bash
   mosquitto -v
   ```

   **Expected output** (example; the lines shortened to `…` contain feature notes such as `Websockets support available.`):

   ```text
   1792287012: mosquitto version 2.1.2 starting
   1792287012: Using default config.
   …
   1792287012: Starting in local only mode. Connections will only be possible from clients running on this machine.
   1792287012: Create a configuration file which defines a listener to allow remote access.
   1792287012: For more details see https://mosquitto.org/documentation/authentication-methods/
   1792287012: Opening ipv4 listen socket on port 1883.
   1792287012: Opening ipv6 listen socket on port 1883.
   …
   1792287012: mosquitto version 2.1.2 running
   ```

   The number at the start of each line is the broker's clock, written as the number of seconds since January 1, 1970 (Concept 6 of Module 10). What matters are the three lines in the middle: **this broker only serves your own laptop.** The ESP32 will never get in.
3. Stop that broker with **Ctrl + C**. Its last line is `mosquitto version 2.1.2 terminating`.

Does the terminal write `The term 'mosquitto' is not recognized…` (Windows) or `command not found` (macOS and Linux)? Open "The terminal doesn't recognize `mosquitto`" in 🚨.

#### 1.3 Open the door to the home network

1. In the VS Code **Explorer** panel, click the empty space below the file list (so that the new folder doesn't end up inside another folder), then create a new folder named **`edge`** (the **New Folder…** icon). *Edge* is the name for the device at the edge of your home network that runs the broker. This week your laptop plays that role; from Module 12 on, a Raspberry Pi takes over, and its configuration is kept in the same folder.
2. Right-click the `edge` folder, choose **New File…**, then name it **`mosquitto-lan.conf`**. Fill it with these four lines, then save (**Ctrl + S**):

   ```text
   # mosquitto-lan.conf - the Module 11 practice broker: open to the home network, WITHOUT a password.
   # Stop the broker before the laptop joins a public WiFi. The real lock comes in Module 21.
   listener 1883
   allow_anonymous true
   ```

   Lines that start with `#` are notes for humans. Mosquitto only treats `#` as a note if it's **at the start of the line**; don't write a note after `listener 1883`. The same file is also available in [`mini-smart-home/edge/`](../../mini-smart-home/edge/mosquitto-lan.conf).
3. In the terminal, go into the `edge` folder, then start the broker with that file:

   ```bash
   cd edge
   ```

   ```bash
   mosquitto -v -c mosquitto-lan.conf
   ```

   **Expected output** (example):

   ```text
   1792287072: mosquitto version 2.1.2 starting
   1792287072: Config loaded from mosquitto-lan.conf.
   …
   1792287072: Opening ipv4 listen socket on port 1883.
   1792287072: Opening ipv6 listen socket on port 1883.
   1792287072: mosquitto version 2.1.2 running
   ```

   The text `Starting in local only mode` **no longer appears**, and the two `Opening … listen socket` lines now mean that door 1883 is open to all of the laptop's networks. The `ipv4` and `ipv6` lines may come in the opposite order. On Windows, the `Windows Security` window usually appears right at this moment; don't click **Cancel**, but answer it as in step 1.4.

**Leave this terminal open.** This is our post office. Every time you start studying again, open a terminal, type `cd edge`, then run the same command. If it says `Error: Unable to open config file`, your terminal isn't in the `edge` folder yet.

#### 1.4 Allow Mosquitto through the firewall

**Windows.** As soon as Mosquitto opens a door to the network, Windows usually shows a `Windows Security` window for the **mosquitto** app (or `mosquitto.exe`). Answer it as you did for Node.js in Practice 7 of Module 10:

- **Windows 11:** its title is usually `Do you want to allow public and private networks to access this app?`; click **Allow**. So that the permission only applies on **private** networks, open the list of permissions as in the last bullet, then uncheck **Public** for mosquitto.
- **Windows 10:** its title is `Windows Defender Firewall has blocked some features of this app`; check **Private networks** only, then click **Allow access**.
- **Make sure your home Wi-Fi has the private profile**: **Settings → Network & internet → Wi-Fi**, click your home Wi-Fi's name, then under **Network profile type** choose **Private network** (you already did this in Module 10).
- **The window didn't appear, or you chose Cancel by mistake?** In the **Windows Security** app, open **Firewall & network protection → Allow an app through firewall**, click **Change settings**, then look for **mosquitto** in the list. If it's there, check the **Private** column and clear **Public**. If it isn't, click **Allow another app…**, click **Browse…**, choose `C:\Program Files\Mosquitto\mosquitto.exe`, then click **Network types…**. Check **Private** only and click **OK**, then click **Add**, and finally **OK**.

**macOS:** the Mac firewall is usually off. If it's on, macOS asks whether `mosquitto` may accept incoming connections; click **Allow**. **Linux:** Ubuntu's firewall (`ufw`) is off unless you've turned it on; if it's on, allow door 1883 for the home network only, for example `sudo ufw allow proto tcp from 192.168.1.0/24 to any port 1883`.

#### 1.5 Only one broker (Windows), then note the laptop's IP address

**macOS and Linux:** skip this check, because the Mosquitto service was already stopped (Linux) or simply isn't run (macOS) in step 1.1; go straight to the **Every operating system** paragraph below. **Windows:** open a **second** terminal (**Terminal → Split Terminal**, or the split icon in the corner of the terminal), then type:

```powershell
Get-NetTCPConnection -LocalPort 1883 -State Listen
```

**Expected output** (example; the `OwningProcess` number on your laptop is different):

```text
LocalAddress                        LocalPort RemoteAddress                       RemotePort State       AppliedSetting OwningProcess
------------                        --------- -------------                       ---------- -----       -------------- -------------
::                                  1883      ::                                  0          Listen                     14832
0.0.0.0                             1883      0.0.0.0                             0          Listen                     14832
```

Two lines with **the same `OwningProcess` number** mean one broker listening on every network: correct. If there's a `127.0.0.1` or `::1` line with a **different** number, the Mosquitto service from the installer is running too. Open "Two brokers running at the same time" in 🚨 before you continue. (This command only works in PowerShell, the default terminal of VS Code on Windows.)

**Every operating system:** finally, **note your laptop's IP address**. Create a new file `notes-module11.md` in the **Documents → GitHub → learn-iot → module-11** folder, where the Quick Win sketch is (in VS Code: **File → New Text File**, then **File → Save As…** to that folder), like `notes-module10.md` in Module 10. How to find the address is in Practice 7.1 of Module 10: type `ipconfig` (Windows), `ipconfig getifaddr en0` (macOS), or `hostname -I` (Linux) in the second terminal, not in the broker terminal. On macOS and Linux, first open that second terminal with **Terminal → Split Terminal**. That address is the one you'll write in the ESP32 sketches from Practice 3 on.

**Inside the steps:**

- **Why not use the installer's built-in service?** A Windows service runs quietly without a window, with a configuration file in `C:\Program Files\Mosquitto` that only an administrator can change, and it never shows its log. For learning, a broker in a terminal is much more honest: every client and message is visible. In Module 12, the broker moves to the Raspberry Pi and only then becomes a service that's always on.
- **Why is the configuration file in the project folder, not in the Mosquitto folder?** So that it's saved in your project repository, can be read by anyone, and doesn't get lost. Uninstalling Mosquitto also deletes the `mosquitto.conf` in its installation folder.
- **`-v` on Linux and macOS** shows more lines than without `-v`, including every message that passes through. On Windows, without `-v` Mosquitto prints almost nothing, so make a habit of always writing it.

> ⬆️ **Done with Practice 1?** Go back to [Concept 4](#4-topics-and-wildcards-message-addresses-with-levels) (the ➡️ at the end of Concept 4 will take you to Practice 2).

### Practice 2 — Exchange messages from the terminal and MQTTX (20 minutes)

> 🖥️ **Tools:** **VS Code** with the broker terminal from Practice 1 still running, and **MQTTX**. No ESP32 needed yet. Concepts used: 2 and 4.

Before the ESP32 joins in, let's make sure the post office works with the simplest clients: two small programs that are installed together with Mosquitto, **`mosquitto_sub`** (a subscriber) and **`mosquitto_pub`** (a publisher).

#### 2.1 One subscriber, one publisher

1. In VS Code, open a second terminal with **Terminal → Split Terminal** (the second terminal from step 1.5 can be used too). The broker terminal keeps running next to it; don't type anything there.
2. In the second terminal, become a **subscriber** to every topic under `practice/`:

   ```bash
   mosquitto_sub -v -t "practice/#"
   ```

   Nothing is printed, and that's how it should be: the subscriber is waiting. `-t` is the topic subscribed to, and `-v` asks for every message to be printed together with its topic. Glance at the broker terminal: a new client has been logged, roughly `New client connected from … as auto-…`. Because `mosquitto_sub` doesn't state its own name, the broker gives it a random name that starts with `auto-`.
3. Open a **third** terminal (**Split Terminal** once more), then **publish** a message:

   ```bash
   mosquitto_pub -t "practice/hello" -m "hello from the terminal"
   ```

   `-m` is the message content. `mosquitto_pub` connects, publishes one message, then says goodbye right away.

**Expected output** in the second terminal:

```text
practice/hello hello from the terminal
```

Congratulations, your post office works: the publisher and the subscriber don't know each other; they only know the broker. In the broker terminal, you can also see a trace of every step, for example `Received PUBLISH from …` and `Sending PUBLISH to …`.

#### 2.2 Try *wildcards*

1. In the second terminal, stop the subscriber with **Ctrl + C**, then subscribe with `+`:

   ```bash
   mosquitto_sub -v -t "practice/+/temperature"
   ```

2. Guess first before you try: which ones will arrive? Then, in the third terminal, publish these four messages one at a time.

   ```bash
   mosquitto_pub -t "practice/node1/temperature" -m "28.5"
   ```

   ```bash
   mosquitto_pub -t "practice/node2/temperature" -m "27.9"
   ```

   ```bash
   mosquitto_pub -t "practice/node1/humidity" -m "71"
   ```

   ```bash
   mosquitto_pub -t "practice/node1/Temperature" -m "30.0"
   ```

   **Expected output** in the second terminal:

   ```text
   practice/node1/temperature 28.5
   practice/node2/temperature 27.9
   ```

   The third message doesn't arrive, because its last level isn't `temperature`. The fourth message doesn't arrive either, because `Temperature` with a capital first letter is **not** `temperature` (Concept 4). The broker doesn't tell anyone that those two messages had no subscribers; both are quietly thrown away.
3. Stop the subscriber (**Ctrl + C**), then subscribe with `#`: `mosquitto_sub -v -t "practice/#"`. In the third terminal, publish the third message again: press **↑** until `mosquitto_pub -t "practice/node1/humidity" -m "71"` appears, then **Enter**. This time it arrives, because `practice/#` catches every level under `practice/`.
4. **Peek into the post office itself.** Stop the subscriber, then subscribe to the `$SYS` topic that records the number of currently connected clients:

   ```bash
   mosquitto_sub -v -t '$SYS/broker/clients/connected'
   ```

   **Expected output** (example; the number depends on how many clients are connected):

   ```text
   $SYS/broker/clients/connected 1
   ```

   The broker checks that number every 10 seconds and publishes it again as soon as it changes. The `$SYS` topic must be wrapped in **single quotes**; with double quotes or no quotes, PowerShell and bash treat `$SYS` as a variable name and send the wrong topic. Stop it with **Ctrl + C**.

#### 2.3 Connect MQTTX to the laptop broker

1. In MQTTX, click the **+** icon on the far left bar to create a new connection (**New Connection**). Fill in **Name** with `Laptop broker`.
2. In the **Host** field, leave the `mqtt://` choice as it is, then **replace** `broker.emqx.io` with `127.0.0.1`. This special address always means "this laptop itself", the same as `localhost` in Module 4. **Port** stays `1883`, and leave the other fields as they are.
3. Click **Connect**, then wait until `Connected` appears. In the broker terminal, MQTTX is logged with a random name that starts with `mqttx_`.
4. Click **New Subscription**, fill in **Topic** with `practice/#`, then click **Confirm**.
5. In the third terminal, publish again:

   ```bash
   mosquitto_pub -t "practice/node1/temperature" -m "28.5"
   ```

   That message appears in MQTTX, complete with its topic.
6. Now the other direction. In the second terminal, subscribe to `practice/#` again (`mosquitto_sub -v -t "practice/#"`). In MQTTX's send box, change the **JSON** format to **Plaintext**, fill in the **Topic** field with `practice/node2/temperature`, type `27.9`, then click the send button (the paper plane icon). The second terminal prints `practice/node2/temperature 27.9`, and MQTTX also shows the message it just sent itself, because it's subscribed to `practice/#` too.

![An illustration of MQTTX 1.13.1, not a screenshot: the form for a new connection to the broker on the laptop (Practice 2.3); only Name and Host change. The top bar: ‹ Back, the title New, and the green Connect button (marker 3). The General section: * Name containing Laptop broker (marker 1); * Host as the mqtt:// choice and the field 127.0.0.1, which was broker.emqx.io (marker 2); * Port 1883; Client ID mqttx_3f9a1c2b; Username and Password empty; the SSL/TLS switch off. The Advanced section: MQTT Version 5.0 and Keep Alive 60 (s), with the note that MQTT 5.0 can stay as it is, because Mosquitto understands 3.1.1 (ESP32) and 5.0 (MQTTX). The key box: 1, Name, any name, just for you, Laptop broker; 2, Host, replace broker.emqx.io with 127.0.0.1, which means this laptop itself (Practice 2.4: the laptop's IP address); 3, Connect, then wait for the Connected notice. A small note at the bottom right: the other Advanced fields, such as Connect Timeout, Auto Reconnect, and Clean Start, aren't drawn; leave them as they are](assets/mqttx-laptop-connection.png)

*Illustration: the MQTTX 1.13.1 window redrawn, not a screenshot; interface labels from the source code of [MQTTX](https://github.com/emqx/MQTTX) (© EMQ Technologies, Apache 2.0 license); the client name (Client ID) is only an example.*

#### 2.4 Test the network door

So far every client has connected through `127.0.0.1`, the special address for the laptop itself. The ESP32 will come in through **the laptop's IP address on the Wi-Fi**, for example `192.168.1.10`. Let's make sure door 1883 is open through that address too:

1. In MQTTX, create another new connection through the **+** icon on the left bar: **Name** `Via laptop IP`, **Host** your laptop's IP address (from Practice 1), **Port** `1883`, then **Connect**.
2. On macOS 15 and later, MQTTX may first ask for permission to find devices on the local network; answer **Allow**, because without that permission the connection to the laptop's IP address can fail. Does `Connected` appear? Good: the broker isn't running in local only mode.

Does `Connect Failed` or `Error: connect ECONNREFUSED …` appear? Check again whether the broker terminal is running `mosquitto -v -c mosquitto-lan.conf` (not just `mosquitto -v`), then open "Can't connect to the broker (`Failed`, code `-2`)" in 🚨. This test doesn't check the firewall yet, because a connection from the laptop to its own address usually isn't blocked by the firewall; the ESP32 in Practice 3 will test it.

**Inside the steps:**

- **Why the `practice/` topics and not `msh/`?** `msh/…` topics are reserved for real messages that follow the data contract. The checker in Practice 8 will flag practice messages that stray there.
- **Double quotes around the topic.** `"practice/#"` would actually be safe without quotes, because its `#` isn't at the start of a word. But `-t #` alone (without quotes) is treated as a comment by PowerShell and bash, so the topic disappears. Getting used to quotes prevents that confusion.
- **Don't send JSON with `mosquitto_pub -m` in Windows PowerShell 5.1** (the PowerShell that comes with Windows 10 and 11). That PowerShell version strips the double quotes inside an argument, so `{"temperature":28.5}` arrives as `{temperature:28.5}`, which isn't JSON. For JSON messages, use MQTTX.

> ⬆️ **Done with Practice 2?** Go back to [Concept 5 — The data contract](#5-the-data-contract-five-topics-and-one-json-shape-for-everything) (the ➡️ at the end of Concept 5 will take you to Practice 3).

### Practice 3 — The ESP32 publishes `telemetry` to the laptop broker (30 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 board (the DHT22 and the LDR get 3.3 V from the ESP32, so the MB102 can stay off), the running broker terminal, and **MQTTX** with the **Laptop broker** connection. **The laptop and the ESP32 must be connected to the same Wi-Fi.** It also works in Wokwi (see the box at the start of 🔧); there, skip steps 5 and 6, which need real wires and a broker you can stop yourself. Concepts used: 5. The three safety lines in `setup()` are only examined closely in Concepts 9 and 10, after Practice 7; for now, it's enough to know that `setConnectionTimeout()` and `setSocketTimeout()` keep the ESP32 from waiting long when the broker doesn't answer, and that `setBufferSize()` enlarges the message container.

Now a real ESP32 publishes readings to the broker on your laptop, following the data contract. To keep it short, this sketch only carries three readings (temperature, humidity, light) from two sensors; Node 1 v1.2 in the ➕ section publishes all eight fields.

1. Open the `module11_hello_broker` sketch from the Quick Win, choose **File → Save As…**, then save it in the `module-11` folder under the name `module11_telemetry`. Replace the **whole** content of the main tab with this code:

   ```cpp
   // Module 11 - Practice 3: send telemetry over MQTT to the broker on the laptop
   // Every 10 seconds, the ESP32 publishes the temperature and humidity (DHT22, D14) and the light (LDR, VP)
   // as JSON to the topic msh/<device_id>/telemetry on the Mosquitto broker on your laptop (Practice 1).
   // Connecting to the broker NEVER waits long: about 1 second at most, retried every 5 seconds (Concept 10).

   #include <WiFi.h>
   #include <PubSubClient.h>  // PubSubClient3 library version 3.3.2
   #include <ArduinoJson.h>   // ArduinoJson library version 7.4.3 (Module 10)
   #include <DHT.h>           // the DHT library from Module 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): the MAC address straight from the chip
   #include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD

   #ifndef MQTT_QOS1  // only PubSubClient3 has this name
   #error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
   #endif

   // REPLACE 192.168.1.10 with your laptop's IP address (how to find it: Module 10, Practice 7.1).
   // Always write an IP address, not a name: looking up a name can hold up the program for a few seconds.
   const char BROKER_ADDRESS[] = "192.168.1.10";
   const uint16_t BROKER_PORT = 1883;

   const int PIN_DHT = 14;  // DHT22, Module 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Module 6
   const char TIME_ZONE[] = "WIB-7";
   const unsigned long SEND_INTERVAL = 10000;       // telemetry every 10 seconds (Appendix A)
   const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later

   DHT dht(PIN_DHT, DHT22);
   WiFiClient netClient;          // TCP connection to the broker
   PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
   char deviceId[13];             // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
   char telemetryTopic[40];       // msh/<device_id>/telemetry
   unsigned long lastSendTime = 0;
   unsigned long lastTryTime = 0;
   bool hasTried = false;

   // What the mqtt.state() numbers mean (Concept 10). The numbers 1-5 are the broker's own answer.
   const char* mqttStateName(int code) {
     switch (code) {
       case -4: return "the broker did not answer in time";
       case -3: return "connection lost";
       case -2: return "could not connect to the broker";
       case -1: return "not connected yet";
       case 0: return "connected";
       case 4: return "username or password rejected";
       case 5: return "not authorized by the broker";
       default: return "rejected by the broker";
     }
   }

   // The ts timestamp (Appendix A), as in Module 10. Returns false if the clock isn't set from the internet yet.
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

   // One connection attempt, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
   void tryConnectBroker() {
     if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
       return;
     }
     hasTried = true;
     lastTryTime = millis();
     unsigned long start = millis();
     if (mqtt.connect(deviceId)) {  // client ID = device_id: unique for every board
       Serial.printf("Connected to broker %s in %lu ms, as %s\n", BROKER_ADDRESS, millis() - start, deviceId);
     } else {
       int code = mqtt.state();
       Serial.printf("Failed to reach the broker after %lu ms: %s (code %d). Retrying in 5 seconds.\n", millis() - start,
                     mqttStateName(code), code);
     }
   }

   void sendTelemetry() {
     char ts[21];
     if (!makeTs(ts, sizeof(ts))) {
       Serial.println("Clock not set from the internet yet: sending postponed (every reading must carry a ts).");
       return;
     }
     JsonDocument doc;
     doc["ts"] = ts;
     doc["temperature"] = dht.readTemperature();  // ArduinoJson writes NAN (couldn't be read) as null
     float humidity = dht.readHumidity();
     if (isnan(humidity)) {
       doc["humidity"] = nullptr;  // a failed reading is written as null (data contract, Concept 5)
     } else {
       doc["humidity"] = (int)round(humidity);
     }
     doc["light"] = 4095 - analogRead(PIN_LDR);  // inverted as in Node 1: the brighter it is, the bigger the number
     char content[160];
     size_t length = serializeJson(doc, content, sizeof(content));
     if (length >= sizeof(content)) {
       Serial.println("JSON too long for the content[] container: not sent.");
       return;
     }
     if (mqtt.publish(telemetryTopic, content)) {
       Serial.printf("Published to %s: %s\n", telemetryTopic, content);
     } else {
       Serial.printf("FAILED to publish to %s\n", telemetryTopic);
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(telemetryTopic, sizeof(telemetryTopic), "msh/%s/telemetry", deviceId);

     netClient.setConnectionTimeout(1000);  // TCP connect takes at most 1 second (default: 3 seconds)
     mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
     mqtt.setSocketTimeout(1);   // wait at most 1 second for the broker's answer (default: 15 seconds)
     mqtt.setBufferSize(512);    // a 512-byte message container (default: 256), Concept 9

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
     Serial.printf("Connected to WiFi, ESP32 IP %s, device_id %s\n", WiFi.localIP().toString().c_str(), deviceId);
     configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");  // the time from the internet (Module 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi down: the esp32 package reconnects by itself (Module 10)
     }
     if (!mqtt.connected()) {
       tryConnectBroker();
       return;
     }
     mqtt.loop();  // must be called as often as possible: keeps the connection alive
     if (millis() - lastSendTime >= SEND_INTERVAL) {
       lastSendTime = millis();
       sendTelemetry();
     }
   }
   ```

2. **Change `BROKER_ADDRESS`** to your laptop's IP address from Practice 1, for example `"192.168.1.10"`. Don't write `localhost` or `127.0.0.1`: to the ESP32, both of those addresses mean the ESP32 itself.
3. Make sure the broker terminal is still running `mosquitto -v -c mosquitto-lan.conf`. In MQTTX, click the **Laptop broker** connection in the list on the left (if its name isn't green yet, click **Connect** in the top right), then add a new subscription (**New Subscription**) with **Topic** `msh/#`.
4. Click **Upload**, then open the **Serial Monitor** (**115200 baud**). If you can't see the first line, press the **EN** button.

**Expected output** in the Serial Monitor (example; the addresses, the `device_id`, and the numbers will certainly be different):

```text
Connecting to "OurHome"..........
Connected to WiFi, ESP32 IP 192.168.1.23, device_id a4cf12e5b7c0
Connected to broker 192.168.1.10 in 38 ms, as a4cf12e5b7c0
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:30:32Z","temperature":28.5,"humidity":71,"light":2310}
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:30:42Z","temperature":28.6,"humidity":71,"light":2298}
```

The first send happens about 10 seconds after the ESP32 powers up. If its clock hasn't been set from the internet by then, the Serial Monitor writes `Clock not set from the internet yet: sending postponed (every reading must carry a ts).` and the send waits for the next scheduled time.

In MQTTX, the same message appears every 10 seconds with the topic `msh/<device_id>/telemetry`. Glance at the broker terminal too (example):

```text
1792287025: New connection from 192.168.1.23:57288 on port 1883.
1792287025: New client connected from 192.168.1.23:57288 as a4cf12e5b7c0 (p4, c1, k15).
1792287025: No will message specified.
1792287025: Sending CONNACK to a4cf12e5b7c0 (0, 0)
1792287032: Received PUBLISH from a4cf12e5b7c0 (d0, q0, r0, m0, 'msh/a4cf12e5b7c0/telemetry', ... (75 bytes))
1792287032: Sending PUBLISH to mqttx_3f9a1c2b (d0, q0, r0, m0, 'msh/a4cf12e5b7c0/telemetry', ... (75 bytes))
```

The `New client connected` line shows the client's name (your `device_id`) and details about its connection: `p4` means MQTT 3.1.1, `c1` means *clean session*, and `k15` means a 15-second *keep-alive*. (Mosquitto 2.0.x on Linux writes `p2` for MQTT 3.1.1.)

5. **Test a failed reading.** Unplug the DHT22's data wire from the ESP32's D14 pin (the MB102 is off, so it's safe), wait for one send, then plug it back in. While it's unplugged, the send becomes:

   ```text
   Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:31:02Z","temperature":null,"humidity":null,"light":2304}
   ```

   That's decision 1 in Concept 5: a failed reading is written as `null`, not `-1`.
6. **Test a dead broker** (on the Wokwi path, skip this step: you can't stop a public broker). In the broker terminal, press **Ctrl + C**. The ESP32 only notices the broker is gone when it sends its next packet, so wait about 10 seconds (at most about 30 seconds). The Serial Monitor then writes:

   ```text
   Failed to reach the broker after 1001 ms: could not connect to the broker (code -2). Retrying in 5 seconds.
   ```

   The same line repeats every 5 seconds, and the ESP32 keeps running; nothing gets stuck. On a Windows laptop, the number is about `1001 ms`: the Windows firewall deliberately doesn't answer a knock on an unserved door, so the ESP32 waits until its 1-second limit runs out. On macOS and Linux, the laptop answers right away "nobody is serving door 1883", so the number is only a few milliseconds, for example `4 ms` (Concept 10). Start the broker again with the same command (press **↑** in the terminal to bring back the last command, then **Enter**). Within 5 seconds, the ESP32 reconnects by itself. MQTTX doesn't: about 4 seconds after the broker stops, it tries once, gets refused (the notice `Error: connect ECONNREFUSED 127.0.0.1:1883`), then stops trying. Click the **Laptop broker** connection, then click **Connect** in the top right until its name is green again; its `msh/#` subscription comes back by itself.

Does the Serial Monitor keep writing `Failed to reach the broker` from the very start, even though the broker terminal is running without the text `Starting in local only mode`? Open "Can't connect to the broker (`Failed`, code `-2`)" in 🚨, then check the IP address, the firewall, and the network.

**Inside the code:**

- **`esp_read_mac()` and `snprintf()`** build the `device_id` from the chip's MAC address, then the topic `msh/<device_id>/telemetry`, exactly like Node 1 in Module 10.
- **`tryConnectBroker()`** only tries **once**, at most every 5 seconds, then returns right away, whether it succeeded or not. Compare it with `connectBroker()` in the Quick Win, which loops until it succeeds (Concept 10). The client's name is the `device_id` (decision 2 in Concept 5).
- **The three safety lines in `setup()`**: `setConnectionTimeout(1000)` and `setSocketTimeout(1)` limit every connection attempt to about 1 second, and `setBufferSize(512)` enlarges the message container (Concepts 9 and 10). All three are set before connecting to the Wi-Fi, so they're still in place if the Wi-Fi only connects later, after `setup()` stopped early. The internet time is only requested if the Wi-Fi connects within the first 20 seconds, so after the message `Not connected after 20 seconds`, still press **EN** once your Wi-Fi is sorted out.
- **`loop()` has three paths**: the Wi-Fi is down → return right away (the esp32 package reconnects by itself); the broker is disconnected → try to connect; connected → `mqtt.loop()`, then check the 10-second schedule.
- **`sendTelemetry()`** builds the JSON with **ArduinoJson**: a `NAN` from `readTemperature()` is automatically written as `null`, while for a failed humidity reading we write `nullptr` ourselves. The length of the result of `serializeJson()` is checked before publishing.
- **`mqtt.publish()` answers `true`** when the message has been handed to the TCP connection (the send-and-receive path between the ESP32 and the broker; Concept 10), not when the broker has received it. It answers `false` if the connection has already dropped.

> ⬆️ **Done with Practice 3?** Go back to [Concept 6](#6-qos-regular-mail-registered-mail-and-a-courier-who-wants-a-signature) (the ➡️ at the end of Concept 7 will take you to Practices 4 and 5).

### Practice 4 — Automatic online/offline status (20 minutes)

> 🖥️ **Tools:** the same as Practice 3, plus a **clock or *stopwatch*** on your phone. It also works in Wokwi: stopping the simulation is the same as unplugging the cable, but `offline` from a public broker may only show up about 17–27 seconds later. Concepts used: 7.

1. Save `module11_telemetry` as `module11_online_status` (**File → Save As…**), replace the whole content of the main tab with this code, then **change `BROKER_ADDRESS` again** to your laptop's IP address:

   ```cpp
   // Module 11 - Practice 4: automatic online/offline status (retained + Last Will)
   // Builds on Practice 3. As soon as it connects, the ESP32 publishes "online" to msh/<device_id>/status as a
   // retained message (the "notice board"). While connecting, the ESP32 also leaves a "last will" with the broker:
   // if the ESP32 disappears without saying goodbye, the broker itself publishes "offline" to the same topic (Concept 7).

   #include <WiFi.h>
   #include <PubSubClient.h>  // PubSubClient3 library version 3.3.2
   #include <ArduinoJson.h>   // ArduinoJson library version 7.4.3 (Module 10)
   #include <DHT.h>           // the DHT library from Module 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): the MAC address straight from the chip
   #include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD

   #ifndef MQTT_QOS1  // only PubSubClient3 has this name
   #error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
   #endif

   // REPLACE 192.168.1.10 with your laptop's IP address (how to find it: Module 10, Practice 7.1).
   // Always write an IP address, not a name: looking up a name can hold up the program for a few seconds.
   const char BROKER_ADDRESS[] = "192.168.1.10";
   const uint16_t BROKER_PORT = 1883;

   const int PIN_DHT = 14;  // DHT22, Module 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Module 6
   const char TIME_ZONE[] = "WIB-7";
   const unsigned long SEND_INTERVAL = 10000;       // telemetry every 10 seconds (Appendix A)
   const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later

   DHT dht(PIN_DHT, DHT22);
   WiFiClient netClient;          // TCP connection to the broker
   PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
   char deviceId[13];             // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
   char telemetryTopic[40];       // msh/<device_id>/telemetry
   char statusTopic[40];          // msh/<device_id>/status
   unsigned long lastSendTime = 0;
   unsigned long lastTryTime = 0;
   bool hasTried = false;

   // What the mqtt.state() numbers mean (Concept 10). The numbers 1-5 are the broker's own answer.
   const char* mqttStateName(int code) {
     switch (code) {
       case -4: return "the broker did not answer in time";
       case -3: return "connection lost";
       case -2: return "could not connect to the broker";
       case -1: return "not connected yet";
       case 0: return "connected";
       case 4: return "username or password rejected";
       case 5: return "not authorized by the broker";
       default: return "rejected by the broker";
     }
   }

   // The ts timestamp (Appendix A), as in Module 10. Returns false if the clock isn't set from the internet yet.
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

   // One connection attempt, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
   void tryConnectBroker() {
     if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
       return;
     }
     hasTried = true;
     lastTryTime = millis();
     unsigned long start = millis();
     // Last will: the status topic, QoS 1, retained, content "offline". The broker keeps it while the ESP32 is connected.
     if (mqtt.connect(deviceId, statusTopic, 1, true, "offline")) {
       Serial.printf("Connected to broker %s in %lu ms, as %s\n", BROKER_ADDRESS, millis() - start, deviceId);
       mqtt.publish(statusTopic, "online", true);  // true = retained: stays posted for subscribers who come later
       Serial.printf("Published to %s: online (retained)\n", statusTopic);
     } else {
       int code = mqtt.state();
       Serial.printf("Failed to reach the broker after %lu ms: %s (code %d). Retrying in 5 seconds.\n", millis() - start,
                     mqttStateName(code), code);
     }
   }

   void sendTelemetry() {
     char ts[21];
     if (!makeTs(ts, sizeof(ts))) {
       Serial.println("Clock not set from the internet yet: sending postponed (every reading must carry a ts).");
       return;
     }
     JsonDocument doc;
     doc["ts"] = ts;
     doc["temperature"] = dht.readTemperature();  // ArduinoJson writes NAN (couldn't be read) as null
     float humidity = dht.readHumidity();
     if (isnan(humidity)) {
       doc["humidity"] = nullptr;  // a failed reading is written as null (data contract, Concept 5)
     } else {
       doc["humidity"] = (int)round(humidity);
     }
     doc["light"] = 4095 - analogRead(PIN_LDR);  // inverted as in Node 1: the brighter it is, the bigger the number
     char content[160];
     size_t length = serializeJson(doc, content, sizeof(content));
     if (length >= sizeof(content)) {
       Serial.println("JSON too long for the content[] container: not sent.");
       return;
     }
     if (mqtt.publish(telemetryTopic, content)) {
       Serial.printf("Published to %s: %s\n", telemetryTopic, content);
     } else {
       Serial.printf("FAILED to publish to %s\n", telemetryTopic);
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(telemetryTopic, sizeof(telemetryTopic), "msh/%s/telemetry", deviceId);
     snprintf(statusTopic, sizeof(statusTopic), "msh/%s/status", deviceId);

     netClient.setConnectionTimeout(1000);  // TCP connect takes at most 1 second (default: 3 seconds)
     mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
     mqtt.setSocketTimeout(1);   // wait at most 1 second for the broker's answer (default: 15 seconds)
     mqtt.setBufferSize(512);    // a 512-byte message container (default: 256), Concept 9

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
     Serial.printf("Connected to WiFi, ESP32 IP %s, device_id %s\n", WiFi.localIP().toString().c_str(), deviceId);
     configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");  // the time from the internet (Module 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi down: the esp32 package reconnects by itself (Module 10)
     }
     if (!mqtt.connected()) {
       tryConnectBroker();
       return;
     }
     mqtt.loop();  // must be called as often as possible: keeps the connection alive
     if (millis() - lastSendTime >= SEND_INTERVAL) {
       lastSendTime = millis();
       sendTelemetry();
     }
   }
   ```

   Only three parts changed from Practice 3: the `statusTopic` variable, the last will in `mqtt.connect()`, and the `online` notice right after connecting.
2. In the second VS Code terminal (if the `practice/#` subscriber from Practice 2 is still running there, stop it first with **Ctrl + C**), become a subscriber to the status of **every** device:

   ```bash
   mosquitto_sub -v -t "msh/+/status"
   ```

3. Click **Upload**. As soon as the Serial Monitor writes `Published to msh/…/status: online (retained)`, the subscriber terminal prints:

   ```text
   msh/a4cf12e5b7c0/status online
   ```

4. **Test the notice board.** Stop the subscriber with **Ctrl + C**, then run the same command again. The `online` status is printed **right away**, even though Node 1 didn't publish anything at that moment: the broker hands the stored retained message to the new subscriber. In MQTTX, add a new subscription `msh/+/status`: the `online` message appears with the **Retained** label. Because the `msh/#` subscription from Practice 3 also catches that topic, the next status messages can show up twice; remove the `msh/+/status` subscription again after you've seen the label.
5. **Test the last will.** Get the stopwatch ready, then **unplug the USB cable** of the Node 1 board and start timing. Wait without touching anything. Within **13–23 seconds**, the subscriber terminal prints:

   ```text
   msh/a4cf12e5b7c0/status offline
   ```

   The broker terminal records the cause, roughly `Client a4cf12e5b7c0 […] disconnected: exceeded timeout.` (Mosquitto 2.0.x: `Client a4cf12e5b7c0 has exceeded timeout, disconnecting.`). Node 1 had no chance to send anything; the broker itself published its last will after 22.5 seconds without news.
6. Plug the USB cable back in. A few seconds later, the status is back to `online`.
7. **Bonus:** press the **EN** button. Usually `offline` and `online` are printed one after the other within a few seconds: the Node 1 that has just powered up connects again with the same name, so the broker kicks out its old connection that was left behind and publishes its last will (Concept 7).

**Inside the steps:**

- **Why is the last will QoS 1 and retained?** QoS 1 so that this important news isn't lost on the way; retained so that a dashboard opened half an hour later still knows Node 1 is dead.
- **Why is `online` published by Node 1 itself, not by the broker?** The broker only keeps one last-will message, and that message is only published when the client disappears. The opposite message has to come from Node 1 itself, every time it connects successfully.
- **Unplugging the USB ≠ closing the Serial Monitor.** Closing the Serial Monitor doesn't turn off the ESP32, so its status stays `online`.

**A practice notice board.** To get used to creating and clearing retained messages, try this in the third terminal:

```bash
mosquitto_pub -t "practice/board" -m "meeting at 7 pm" -r
```

Then, in the second terminal, stop the status subscriber with **Ctrl + C** and subscribe to `practice/board` (`mosquitto_sub -v -t "practice/board"`). Whenever you subscribe, that message always appears right away. To clear it, publish an empty message (`-n`) with the retained flag (`-r`):

```bash
mosquitto_pub -t "practice/board" -r -n
```

New subscribers now receive nothing. In MQTTX, the **Clear Retained Message** menu does the same for the topic in its send box; that menu opens through the small triangle button to the right of the **Meta** button. Watch out: that menu also ticks the **Retain** box in the send box, and the tick doesn't go away by itself. Untick **Retain** again before you send the next message, especially a command to Node 1 (Concept 7).

### Practice 5 — QoS 0 vs QoS 1 while the ESP32's Wi-Fi is off (25 minutes)

> 🖥️ **Tools:** **VS Code** with the broker terminal running, **MQTTX** (the **Laptop broker** connection), **Arduino IDE** and the **Serial Monitor**, and the Node 1 board with the **D13 button** (the MB102 can stay off). You can also do it in Wokwi, with the broker `broker.hivemq.com` (see the note at the end of this practice). Concepts used: 6.

We test "regular mail" and "registered mail" twice: first with two programs on the laptop, then with the ESP32, whose Wi-Fi we switch off on purpose.

#### 5.1 On the laptop: a subscriber who steps out for a moment

1. In the second terminal (first stop the subscriber that's still running there with **Ctrl + C**), become a subscriber with a **persistent session**:

   ```bash
   mosquitto_sub -v -t "practice/qos" -q 1 -c -i qos-subscriber
   ```

   There are three additions compared with an ordinary subscribe command: `-q 1` subscribes with QoS 1, `-c` asks for a persistent session (*clean session* = `false`), and `-i qos-subscriber` gives the subscriber a fixed name. The broker only keeps messages for a client whose name stays the same.
2. Press **Ctrl + C**. The subscriber "steps out", but the broker still remembers its session.
3. In the third terminal, publish two messages, one with QoS 0 and one with QoS 1:

   ```bash
   mosquitto_pub -t "practice/qos" -q 0 -m "regular mail"
   ```

   ```bash
   mosquitto_pub -t "practice/qos" -q 1 -m "registered mail"
   ```

4. In the second terminal, run the same subscriber command again (press **↑**, then **Enter**).

**Expected output:**

```text
practice/qos registered mail
```

Only the "registered mail" was kept by the broker while its subscriber was away. The "regular mail" was thrown away right away, because no subscriber was connected at that moment. Stop the subscriber with **Ctrl + C**.

#### 5.2 On the ESP32: Wi-Fi switched off with a button

1. Open the `module11_telemetry` sketch, save it as `module11_qos` (**File → Save As…**), replace all of the main tab's contents with this code, then change `BROKER_ADDRESS` to your laptop's IP address:

   ```cpp
   // Module 11 - Practice 5: QoS 0 vs QoS 1 while the ESP32's WiFi is off
   // The ESP32 subscribes to practice/<device_id>/qos with QoS 1 and a persistent session (clean session = false).
   // Press the D13 button to switch the WiFi off, send QoS 0 and QoS 1 messages from MQTTX, then press D13 again.
   // The broker keeps the QoS 1 message and delivers it as soon as the ESP32 is back; the QoS 0 message is lost (Concept 6).

   #include <WiFi.h>
   #include <PubSubClient.h>  // PubSubClient3 library version 3.3.2
   #include <esp_mac.h>       // esp_read_mac(): the MAC address straight from the chip
   #include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD

   #ifndef MQTT_QOS1  // only PubSubClient3 has this name
   #error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
   #endif

   // REPLACE 192.168.1.10 with your laptop's IP address, as in Practice 3.
   const char BROKER_ADDRESS[] = "192.168.1.10";
   const uint16_t BROKER_PORT = 1883;

   const int PIN_BUTTON = 13;                       // the D13 button on the workbench (Module 5), active LOW
   const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later

   WiFiClient netClient;
   PubSubClient mqtt(netClient);
   char deviceId[13];  // device_id
   char clientId[24];  // a client ID just for this practice so that its persistent session doesn't mix with other sketches
   char qosTopic[40];  // practice/<device_id>/qos
   bool wifiOn = true;
   bool buttonBefore = HIGH;
   unsigned long buttonChangeTime = 0;
   unsigned long lastTryTime = 0;
   bool hasTried = false;

   void onMessage(char* topic, byte* content, unsigned int length) {
     Serial.print("Message received: ");
     Serial.write(content, length);
     Serial.println();
   }

   void tryConnectBroker() {
     if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
       return;
     }
     hasTried = true;
     lastTryTime = millis();
     // Persistent session: always the same client ID, and the last argument (clean session) = false.
     // No username and password (nullptr, nullptr), and no last will (nullptr, 0, false, nullptr).
     if (mqtt.connect(clientId, nullptr, nullptr, nullptr, 0, false, nullptr, false)) {
       mqtt.subscribe(qosTopic, 1);  // QoS 1 subscription: the broker keeps QoS 1 messages while the ESP32 is away
       Serial.printf("Connected to the broker (persistent session), subscribed to %s with QoS 1\n", qosTopic);
     } else {
       Serial.printf("Failed to reach the broker (code %d). Retrying in 5 seconds.\n", mqtt.state());
     }
   }

   // Each press of D13 switches the WiFi off or on, in turn.
   void checkButton() {
     bool now = digitalRead(PIN_BUTTON);
     if (now == buttonBefore || millis() - buttonChangeTime < 50) {  // 50 ms: ignore the button's bounce (Module 5)
       return;
     }
     buttonChangeTime = millis();
     buttonBefore = now;
     if (now == HIGH) {
       return;  // only when pressed
     }
     wifiOn = !wifiOn;
     if (wifiOn) {
       WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
       Serial.println("WiFi switched ON again: connecting to the WiFi, then to the broker...");
     } else {
       WiFi.disconnect();
       Serial.println("WiFi switched OFF. Now send one QoS 0 message and one QoS 1 message from MQTTX.");
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_BUTTON, INPUT_PULLUP);
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(clientId, sizeof(clientId), "%s-qos", deviceId);
     snprintf(qosTopic, sizeof(qosTopic), "practice/%s/qos", deviceId);

     Serial.printf("Connecting to \"%s\"", WIFI_NAME);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     Serial.printf("Practice topic: %s\n", qosTopic);

     netClient.setConnectionTimeout(1000);
     mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
     mqtt.setSocketTimeout(1);
     mqtt.setCallback(onMessage);
   }

   void loop() {
     checkButton();
     if (!wifiOn || WiFi.status() != WL_CONNECTED) {
       return;
     }
     if (!mqtt.connected()) {
       tryConnectBroker();
       return;
     }
     mqtt.loop();
   }
   ```

2. Click **Upload**, then open the **Serial Monitor**. Write down the practice topic, for example `practice/a4cf12e5b7c0/qos`.
3. **Warm-up:** in MQTTX's send box, fill in **Topic** with that practice topic, change the format to **Plaintext**, replace the whole contents of the message box with `test while connected`, then send it. The message is printed in the Serial Monitor right away.
4. **Press the D13 button once.** The Serial Monitor says `WiFi switched OFF…`. As far as the broker knows, the ESP32 hasn't left yet: the broker only notices after the ESP32's heartbeat has been missing for 22.5 seconds.
5. In MQTTX, send two messages to the same topic, each time replacing the whole contents of the message box: `regular mail` with **QoS 0** selected, then `registered mail` with **QoS 1** selected (the QoS choice is next to the **Retain** box). Leave **Retain** unticked.
6. Wait a moment, then **press D13 once more** to switch the Wi-Fi back on.

**Expected output in the Serial Monitor** (example):

```text
Connecting to "OurHome"..........
Practice topic: practice/a4cf12e5b7c0/qos
Connected to the broker (persistent session), subscribed to practice/a4cf12e5b7c0/qos with QoS 1
Message received: test while connected
WiFi switched OFF. Now send one QoS 0 message and one QoS 1 message from MQTTX.
WiFi switched ON again: connecting to the WiFi, then to the broker...
Connected to the broker (persistent session), subscribed to practice/a4cf12e5b7c0/qos with QoS 1
Message received: registered mail
```

The result is the same as in 5.1: only the "registered mail" waits for the ESP32 to come back. If the QoS 1 message was sent before the broker noticed that the ESP32 had left, the broker actually did send it, to a connection that was already dead. Because its receipt never came, the broker sends that message again as soon as the ESP32 reconnects. Regular mail has no receipt, so nobody sends it again.

**Inside the code:**

- **`mqtt.connect(clientId, nullptr, nullptr, nullptr, 0, false, nullptr, false)`** is the long version of `connect()`. The last argument, `false`, means *clean session* = `false`: a persistent session. The four `nullptr`, the number `0`, and the `false` in the middle mean no username, no password, and no last will.
- **`clientId` gets the suffix `-qos`**, for example `a4cf12e5b7c0-qos`. A persistent session is tied to the client's name, so this practice sketch deliberately doesn't use Node 1's name, to keep the sessions from getting mixed up.
- **`mqtt.subscribe(qosTopic, 1)`**: the number `1` is the subscription's QoS. With `0`, the broker keeps nothing for the ESP32.
- **`WiFi.disconnect()`** cuts the Wi-Fi on purpose, and `WiFi.begin()` connects again. The esp32 package doesn't reconnect by itself after a deliberate disconnect (Concept 4 of Module 10), so the button decides.
- **The sessions stay behind on the broker.** The broker keeps the `qos-subscriber` and `…-qos` sessions until Mosquitto is stopped. That's harmless, and they disappear by themselves when the broker restarts.

> 🖥️ **In Wokwi:** still do 5.1 on the laptop broker, without `-h`, because that part doesn't use the ESP32; on a public broker, the name `qos-subscriber` and the topic `practice/qos` could clash with those of other readers. For 5.2, change `BROKER_ADDRESS` to `"broker.hivemq.com"`, not `broker.emqx.io`. The EMQX broker also keeps QoS 0 messages for a client that's away (the MQTT rules allow it), so the difference wouldn't show. In MQTTX, create a new connection named `HiveMQ public` with **Host** `broker.hivemq.com` and **Port** `1883`, then send the messages from there. The D13 button is the green button labeled **D13** in the Wokwi circuit; click it once to switch the Wi-Fi off, and once more to switch it back on. The result is the same: after the Wi-Fi comes back on, only the QoS 1 message arrives.

> ⬆️ **Done with Practices 4 and 5?** Go back to [Concept 8](#8-when-to-send-and-when-to-answer-every-10-seconds-immediately-when-it-matters-and-command--ack) (the ➡️ at the end of Concept 8 will take you to Practices 6 and 7).

### Practice 6 — Commands from MQTTX, answered with `ack` (30 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 workbench with the **MB102 on** (the relay gets 5 V from the MB102; remember the order: USB first, then the MB102), the broker terminal running, and **MQTTX** with the **Laptop broker** connection. You can also do it in Wokwi. Concepts used: 8.

This is the practice for the completion requirement in section ➕ E: a command from MQTTX moves a relay, then Node 1 answers with an `ack`.

1. Open the `module11_online_status` sketch from Practice 4, save it as `module11_command_ack`, replace all of the main tab's contents with this code, then change `BROKER_ADDRESS` to your laptop's IP address. What's new compared with Practice 4: the relay pins D32 and D33, the `cmd` and `ack` topics, the `setLamp()` and `setFan()` functions, the memory of eight `id`s (`alreadyReceived()` and `rememberId()`), the `sendAck()` and `onCommand()` functions, the `cmd` subscription in `tryConnectBroker()`, and a few lines in `setup()`:

   ```cpp
   // Module 11 - Practice 6: commands over MQTT, answered with an ack
   // Builds on Practice 4. The ESP32 subscribes to msh/<device_id>/cmd. The command {"id":…,"action":"set","target":"lamp",
   // "value":true} turns on the lamp relay (D32) or the fan relay (D33), then the ESP32 answers on msh/<device_id>/ack with
   // the same id (Concept 8). A command whose id was already received is ignored.

   #include <WiFi.h>
   #include <PubSubClient.h>  // PubSubClient3 library version 3.3.2
   #include <ArduinoJson.h>   // ArduinoJson library version 7.4.3 (Module 10)
   #include <DHT.h>           // the DHT library from Module 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): the MAC address straight from the chip
   #include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD

   #ifndef MQTT_QOS1  // only PubSubClient3 has this name
   #error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
   #endif

   // REPLACE 192.168.1.10 with your laptop's IP address (how to find it: Module 10, Practice 7.1).
   // Always write an IP address, not a name: looking up a name can hold up the program for a few seconds.
   const char BROKER_ADDRESS[] = "192.168.1.10";
   const uint16_t BROKER_PORT = 1883;

   const int PIN_DHT = 14;  // DHT22, Module 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Module 6
   const int PIN_LAMP_RELAY = 32;  // active-LOW relay (Module 5)
   const int PIN_FAN_RELAY = 33;   // active-LOW relay (Module 5)
   const char TIME_ZONE[] = "WIB-7";
   const unsigned long SEND_INTERVAL = 10000;       // telemetry every 10 seconds (Appendix A)
   const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later

   DHT dht(PIN_DHT, DHT22);
   WiFiClient netClient;          // TCP connection to the broker
   PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
   char deviceId[13];             // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
   char telemetryTopic[40];       // msh/<device_id>/telemetry
   char statusTopic[40];          // msh/<device_id>/status
   char cmdTopic[40];             // msh/<device_id>/cmd
   char ackTopic[40];             // msh/<device_id>/ack
   bool lamp = false;
   bool fan = false;
   char lastIds[8][40];           // the last 8 command ids received (including refused ones)
   int idPosition = 0;
   unsigned long lastSendTime = 0;
   unsigned long lastTryTime = 0;
   bool hasTried = false;

   // What the mqtt.state() numbers mean (Concept 10). The numbers 1-5 are the broker's own answer.
   const char* mqttStateName(int code) {
     switch (code) {
       case -4: return "the broker did not answer in time";
       case -3: return "connection lost";
       case -2: return "could not connect to the broker";
       case -1: return "not connected yet";
       case 0: return "connected";
       case 4: return "username or password rejected";
       case 5: return "not authorized by the broker";
       default: return "rejected by the broker";
     }
   }

   // The ts timestamp (Appendix A), as in Module 10. Returns false if the clock isn't set from the internet yet.
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

   // Active-LOW relay: LOW = on, HIGH = off (Module 5).
   void setLamp(bool isOn) {
     lamp = isOn;
     digitalWrite(PIN_LAMP_RELAY, isOn ? LOW : HIGH);
   }

   void setFan(bool isOn) {
     fan = isOn;
     digitalWrite(PIN_FAN_RELAY, isOn ? LOW : HIGH);
   }

   bool alreadyReceived(const char* id) {
     for (int i = 0; i < 8; i++) {
       if (strcmp(lastIds[i], id) == 0) {
         return true;
       }
     }
     return false;
   }

   void rememberId(const char* id) {
     snprintf(lastIds[idPosition], sizeof(lastIds[idPosition]), "%s", id);
     idPosition = (idPosition + 1) % 8;  // the oldest one is overwritten
   }

   // The answer to a command: the same id, ok, and the relays' current state. message = the reason if refused.
   void sendAck(const char* id, bool ok, const char* message) {
     JsonDocument reply;
     reply["id"] = id;
     char ts[21];
     if (makeTs(ts, sizeof(ts))) {
       reply["ts"] = ts;
     } else {
       reply["ts"] = nullptr;  // clock not set yet: answer anyway, without a timestamp
     }
     reply["ok"] = ok;
     if (!ok) {
       reply["message"] = message;
     }
     JsonObject state = reply["state"].to<JsonObject>();
     state["lamp"] = lamp;
     state["fan"] = fan;
     char content[200];
     size_t length = serializeJson(reply, content, sizeof(content));
     if (length >= sizeof(content)) {
       Serial.println("Ack too long for the content[] container: not sent.");
       return;
     }
     mqtt.publish(ackTopic, content);
     Serial.printf("Published to %s: %s\n", ackTopic, content);
   }

   // Called by the library when a message arrives on msh/<device_id>/cmd. The order: read, check, carry out, answer.
   void onCommand(char* topic, byte* content, unsigned int length) {
     JsonDocument command;
     DeserializationError error = deserializeJson(command, content, length);  // the content has no end-of-text mark
     if (error) {
       Serial.printf("Command is not valid JSON (%s): ignored.\n", error.c_str());
       return;  // without an id, there is nothing to answer
     }
     const char* id = command["id"] | "";  // "" if the id is missing or not text
     if (id[0] == 0) {
       Serial.println("Command without an id: ignored.");
       return;
     }
     if (strlen(id) >= sizeof(lastIds[0])) {  // at most 39 characters: fits in the id memory and in the ack
       Serial.println("Command with an id longer than 39 characters: ignored.");
       return;
     }
     if (alreadyReceived(id)) {
       Serial.printf("Command %s was already received: ignored.\n", id);
       return;
     }
     rememberId(id);
     const char* action = command["action"] | "";
     const char* target = command["target"] | "";
     const char* message = nullptr;  // stays nullptr if the command was carried out
     if (strcmp(action, "set") != 0) {
       message = "unknown action";
     } else if (strcmp(target, "lamp") != 0 && strcmp(target, "fan") != 0) {
       message = "unknown target";  // this practice sketch only handles the lamp and the fan
     } else if (!command["value"].is<bool>()) {
       message = "value must be true or false";  // the text "false" is not false: refused, not guessed
     } else if (strcmp(target, "lamp") == 0) {
       setLamp(command["value"].as<bool>());
     } else {
       setFan(command["value"].as<bool>());
     }
     Serial.printf("Command %s: action=%s target=%s -> %s\n", id, action, target, message ? message : "done");
     sendAck(id, message == nullptr, message);
   }

   // One connection attempt, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
   void tryConnectBroker() {
     if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
       return;
     }
     hasTried = true;
     lastTryTime = millis();
     unsigned long start = millis();
     // Last will: the status topic, QoS 1, retained, content "offline". The broker keeps it while the ESP32 is connected.
     if (mqtt.connect(deviceId, statusTopic, 1, true, "offline")) {
       Serial.printf("Connected to broker %s in %lu ms, as %s\n", BROKER_ADDRESS, millis() - start, deviceId);
       mqtt.publish(statusTopic, "online", true);  // true = retained: stays posted for subscribers who come later
       Serial.printf("Published to %s: online (retained)\n", statusTopic);
       mqtt.subscribe(cmdTopic, 1);  // subscribe again after every connect (clean session)
       Serial.printf("Subscribed to %s\n", cmdTopic);
     } else {
       int code = mqtt.state();
       Serial.printf("Failed to reach the broker after %lu ms: %s (code %d). Retrying in 5 seconds.\n", millis() - start,
                     mqttStateName(code), code);
     }
   }

   void sendTelemetry() {
     char ts[21];
     if (!makeTs(ts, sizeof(ts))) {
       Serial.println("Clock not set from the internet yet: sending postponed (every reading must carry a ts).");
       return;
     }
     JsonDocument doc;
     doc["ts"] = ts;
     doc["temperature"] = dht.readTemperature();  // ArduinoJson writes NAN (couldn't be read) as null
     float humidity = dht.readHumidity();
     if (isnan(humidity)) {
       doc["humidity"] = nullptr;  // a failed reading is written as null (data contract, Concept 5)
     } else {
       doc["humidity"] = (int)round(humidity);
     }
     doc["light"] = 4095 - analogRead(PIN_LDR);  // inverted as in Node 1: the brighter it is, the bigger the number
     char content[160];
     size_t length = serializeJson(doc, content, sizeof(content));
     if (length >= sizeof(content)) {
       Serial.println("JSON too long for the content[] container: not sent.");
       return;
     }
     if (mqtt.publish(telemetryTopic, content)) {
       Serial.printf("Published to %s: %s\n", telemetryTopic, content);
     } else {
       Serial.printf("FAILED to publish to %s\n", telemetryTopic);
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     pinMode(PIN_LAMP_RELAY, OUTPUT);
     pinMode(PIN_FAN_RELAY, OUTPUT);
     setLamp(false);  // relays switched off right away (Module 5)
     setFan(false);
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(telemetryTopic, sizeof(telemetryTopic), "msh/%s/telemetry", deviceId);
     snprintf(statusTopic, sizeof(statusTopic), "msh/%s/status", deviceId);
     snprintf(cmdTopic, sizeof(cmdTopic), "msh/%s/cmd", deviceId);
     snprintf(ackTopic, sizeof(ackTopic), "msh/%s/ack", deviceId);

     netClient.setConnectionTimeout(1000);  // TCP connect takes at most 1 second (default: 3 seconds)
     mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
     mqtt.setSocketTimeout(1);   // wait at most 1 second for the broker's answer (default: 15 seconds)
     mqtt.setBufferSize(512);    // a 512-byte message container (default: 256), Concept 9
     mqtt.setCallback(onCommand);

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
     Serial.printf("Connected to WiFi, ESP32 IP %s, device_id %s\n", WiFi.localIP().toString().c_str(), deviceId);
     configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");  // the time from the internet (Module 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi down: the esp32 package reconnects by itself (Module 10)
     }
     if (!mqtt.connected()) {
       tryConnectBroker();
       return;
     }
     mqtt.loop();  // must be called as often as possible: keeps the connection alive
     if (millis() - lastSendTime >= SEND_INTERVAL) {
       lastSendTime = millis();
       sendTelemetry();
     }
   }
   ```

2. Make sure the Node 1 board's USB is plugged in, then **turn on the MB102**. Click **Upload**, then open the **Serial Monitor**. Wait until `Subscribed to msh/…/cmd` appears.
3. In MQTTX, the `msh/#` subscription from Practice 3 is still there, so you see all of Node 1's messages, including the commands and their answers.
4. **Send the first command.** In MQTTX's send box:
   - fill in **Topic** with `msh/` + your `device_id` + `/cmd`, for example `msh/a4cf12e5b7c0/cmd`;
   - choose **QoS 1** and **don't** tick **Retain**;
   - delete **all** the contents of the message box (MQTTX loads the last message you sent again, for example `registered mail` from Practice 5), paste the command below, **only then** choose the **JSON** format, and click the send button. Don't choose **JSON** before the contents are replaced: as long as the contents aren't JSON, MQTTX refuses with a red error message and goes back to **Plaintext**. The command:

   ```json
   {"id":"c-001","action":"set","target":"lamp","value":true}
   ```

   The lamp relay goes "click", and its indicator LED lights up. Almost at the same time, MQTTX shows a new message on the topic `msh/<device_id>/ack`:

   ```json
   {"id":"c-001","ts":"2026-10-18T01:41:05Z","ok":true,"state":{"lamp":true,"fan":false}}
   ```

   The `ts` field of a command can be left out when you type it yourself; later, the dashboard fills it in automatically. What's **required** is `id`, and every new command must use a new `id`: `c-002`, `c-003`, and so on.
5. **Send the wrong commands**, one at a time, each with a new `id`. Watch their `ack` answers:

   | Command | Answer |
   | :--- | :--- |
   | `{"id":"c-002","action":"set","target":"fan","value":"false"}` | `ok:false`, `"value must be true or false"` (the text `"false"` is not `false`) |
   | `{"id":"c-003","action":"set","target":"door","value":true}` | `ok:false`, `"unknown target"` |
   | `{"id":"c-004","action":"open","target":"lamp","value":true}` | `ok:false`, `"unknown action"` |
   | `{"id":"c-001","action":"set","target":"lamp","value":true}` (repeated) | no answer: this `id` was already received |

6. **Send text that isn't JSON.** Change the format to **Plaintext**, delete **all** the contents of the message box, type `turn the lamp on`, then send it. The Serial Monitor says `Command is not valid JSON (InvalidInput): ignored.`, and there's no `ack`, because there's no `id` to answer.
7. **Turn the lamp off again** with a new `id`. First delete `turn the lamp on` from the message box, paste the command below, **only then** change the format back to **JSON**, then send it:

   ```json
   {"id":"c-005","action":"set","target":"lamp","value":false}
   ```

**Expected output in the Serial Monitor** (example; the `Published to …/telemetry` lines that appear every 10 seconds aren't shown):

```text
Connected to broker 192.168.1.10 in 41 ms, as a4cf12e5b7c0
Published to msh/a4cf12e5b7c0/status: online (retained)
Subscribed to msh/a4cf12e5b7c0/cmd
Command c-001: action=set target=lamp -> done
Published to msh/a4cf12e5b7c0/ack: {"id":"c-001","ts":"2026-10-18T01:41:05Z","ok":true,"state":{"lamp":true,"fan":false}}
Command c-002: action=set target=fan -> value must be true or false
Published to msh/a4cf12e5b7c0/ack: {"id":"c-002","ts":"2026-10-18T01:41:31Z","ok":false,"message":"value must be true or false","state":{"lamp":true,"fan":false}}
Command c-003: action=set target=door -> unknown target
Published to msh/a4cf12e5b7c0/ack: {"id":"c-003","ts":"2026-10-18T01:41:48Z","ok":false,"message":"unknown target","state":{"lamp":true,"fan":false}}
Command c-004: action=open target=lamp -> unknown action
Published to msh/a4cf12e5b7c0/ack: {"id":"c-004","ts":"2026-10-18T01:42:02Z","ok":false,"message":"unknown action","state":{"lamp":true,"fan":false}}
Command c-001 was already received: ignored.
Command is not valid JSON (InvalidInput): ignored.
Command c-005: action=set target=lamp -> done
Published to msh/a4cf12e5b7c0/ack: {"id":"c-005","ts":"2026-10-18T01:42:40Z","ok":true,"state":{"lamp":false,"fan":false}}
```

Leave the MB102 on; Practice 7 still needs it for the PIR.

**Inside the code:**

- **`onCommand()`** is called by the library from inside `mqtt.loop()` every time a message arrives on `msh/<device_id>/cmd`, and works in the order read → check → carry out → answer (Concept 8). This function is registered with `mqtt.setCallback(onCommand)` in `setup()`.
- **`command["id"] | ""`** takes the `id` if it's text, or empty text if it's missing. This `| fallback-value` form is safe; `as<const char*>()` without a fallback can produce an empty address that makes the ESP32 restart when it's compared with `strcmp()`.
- **`alreadyReceived()` and `rememberId()`** keep the last eight `id`s in a circular array: the ninth overwrites the oldest. `rememberId()` is called **before** the command's contents are checked, so even a refused command is remembered: if the same `id` comes again, that command is ignored without a second `ack`.
- **`strlen(id) >= sizeof(lastIds[0])`** makes a command with an `id` longer than 39 characters get ignored without an `ack`, instead of refused with `ok:false`. Each slot in `lastIds` only fits 39 characters plus the end-of-text mark, so a longer `id` couldn't be remembered whole and would never be recognized as a repeat. That's why the data contract limits `id` to 39 characters at most.
- **The order of the checks:** `action` first, then `target`, then the **type** of `value`. This practice sketch only knows `lamp` and `fan`; the pump and the curtain come later, in Node 1 v1.2.
- **`sendAck()`** answers with the same `id`, `ok`, `message` (only if refused), and `state` holding the relays' **current** state, not the requested state. That way, the sender knows the real state, even when its command was refused.
- **`mqtt.subscribe(cmdTopic, 1)` is inside `tryConnectBroker()`**, not in `setup()`. With *clean session*, subscriptions disappear every time the connection drops, so they must be made again every time a connection succeeds.

**Trying it in Wokwi?** Use the practice project from the start of 🔧, which holds the Node 1 circuit. Go by the LEDs labeled **lamp** (relay D32) and **fan** (relay D33) in the circuit, as in Module 5; ignore the small LED on Wokwi's relay module, which lights up the other way around. Because the command crosses the internet twice, the `ack` in Wokwi takes about 1–2 seconds.

### Practice 7 — Send immediately when something happens (20 minutes)

> 🖥️ **Tools:** **Arduino IDE** and the **Serial Monitor**, the Node 1 workbench with the **MB102 on** (the PIR needs 5 V from the MB102), the broker terminal running, and **MQTTX** with the `msh/#` subscription. You can also do it in Wokwi: the PIR module has a **Simulate motion** button, and the LDR has a light slider. Concepts used: 8.

1. Open the `module11_command_ack` sketch, save it as `module11_send_immediately`, replace all of the main tab's contents with this code, then change `BROKER_ADDRESS` to your laptop's IP address. The only new things compared with Practice 6 are the PIR pin, `DARK_THRESHOLD`, `MIN_IMMEDIATE_GAP`, four variables that keep track of events, the `motion` field, the `checkEvents()` function, one `pinMode()` in `setup()`, and the contents of `loop()`:

   ```cpp
   // Module 11 - Practice 7: send immediately when something important happens (report-by-exception)
   // Builds on Practice 6. Telemetry is still published every 10 seconds, but also IMMEDIATELY when the PIR (D34)
   // starts or stops seeing motion, or when the place turns from bright to dark and back. Immediate sends happen
   // at most every 2 seconds so that a flickering PIR doesn't flood the broker (Concept 8).

   #include <WiFi.h>
   #include <PubSubClient.h>  // PubSubClient3 library version 3.3.2
   #include <ArduinoJson.h>   // ArduinoJson library version 7.4.3 (Module 10)
   #include <DHT.h>           // the DHT library from Module 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): the MAC address straight from the chip
   #include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD

   #ifndef MQTT_QOS1  // only PubSubClient3 has this name
   #error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
   #endif

   // REPLACE 192.168.1.10 with your laptop's IP address (how to find it: Module 10, Practice 7.1).
   // Always write an IP address, not a name: looking up a name can hold up the program for a few seconds.
   const char BROKER_ADDRESS[] = "192.168.1.10";
   const uint16_t BROKER_PORT = 1883;

   const int PIN_DHT = 14;  // DHT22, Module 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Module 6
   const int PIN_LAMP_RELAY = 32;    // active-LOW relay (Module 5)
   const int PIN_FAN_RELAY = 33;     // active-LOW relay (Module 5)
   const int PIN_PIR = 34;           // PIR HC-SR501, Module 6
   const int DARK_THRESHOLD = 1000;  // light below this counts as dark (Module 6)
   const char TIME_ZONE[] = "WIB-7";
   const unsigned long SEND_INTERVAL = 10000;       // telemetry every 10 seconds (Appendix A)
   const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later
   const unsigned long MIN_IMMEDIATE_GAP = 2000;    // immediate sends at most every 2 seconds

   DHT dht(PIN_DHT, DHT22);
   WiFiClient netClient;          // TCP connection to the broker
   PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
   char deviceId[13];             // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
   char telemetryTopic[40];       // msh/<device_id>/telemetry
   char statusTopic[40];          // msh/<device_id>/status
   char cmdTopic[40];             // msh/<device_id>/cmd
   char ackTopic[40];             // msh/<device_id>/ack
   bool lamp = false;
   bool fan = false;
   char lastIds[8][40];           // the last 8 command ids received (including refused ones)
   int idPosition = 0;
   bool motionBefore = false;
   bool darkBefore = false;
   const char* immediateReason = nullptr;  // not nullptr = an important event that hasn't been sent yet
   unsigned long lastCheckTime = 0;
   unsigned long lastSendTime = 0;
   unsigned long lastTryTime = 0;
   bool hasTried = false;

   // What the mqtt.state() numbers mean (Concept 10). The numbers 1-5 are the broker's own answer.
   const char* mqttStateName(int code) {
     switch (code) {
       case -4: return "the broker did not answer in time";
       case -3: return "connection lost";
       case -2: return "could not connect to the broker";
       case -1: return "not connected yet";
       case 0: return "connected";
       case 4: return "username or password rejected";
       case 5: return "not authorized by the broker";
       default: return "rejected by the broker";
     }
   }

   // The ts timestamp (Appendix A), as in Module 10. Returns false if the clock isn't set from the internet yet.
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

   // Active-LOW relay: LOW = on, HIGH = off (Module 5).
   void setLamp(bool isOn) {
     lamp = isOn;
     digitalWrite(PIN_LAMP_RELAY, isOn ? LOW : HIGH);
   }

   void setFan(bool isOn) {
     fan = isOn;
     digitalWrite(PIN_FAN_RELAY, isOn ? LOW : HIGH);
   }

   bool alreadyReceived(const char* id) {
     for (int i = 0; i < 8; i++) {
       if (strcmp(lastIds[i], id) == 0) {
         return true;
       }
     }
     return false;
   }

   void rememberId(const char* id) {
     snprintf(lastIds[idPosition], sizeof(lastIds[idPosition]), "%s", id);
     idPosition = (idPosition + 1) % 8;  // the oldest one is overwritten
   }

   // The answer to a command: the same id, ok, and the relays' current state. message = the reason if refused.
   void sendAck(const char* id, bool ok, const char* message) {
     JsonDocument reply;
     reply["id"] = id;
     char ts[21];
     if (makeTs(ts, sizeof(ts))) {
       reply["ts"] = ts;
     } else {
       reply["ts"] = nullptr;  // clock not set yet: answer anyway, without a timestamp
     }
     reply["ok"] = ok;
     if (!ok) {
       reply["message"] = message;
     }
     JsonObject state = reply["state"].to<JsonObject>();
     state["lamp"] = lamp;
     state["fan"] = fan;
     char content[200];
     size_t length = serializeJson(reply, content, sizeof(content));
     if (length >= sizeof(content)) {
       Serial.println("Ack too long for the content[] container: not sent.");
       return;
     }
     mqtt.publish(ackTopic, content);
     Serial.printf("Published to %s: %s\n", ackTopic, content);
   }

   // Called by the library when a message arrives on msh/<device_id>/cmd. The order: read, check, carry out, answer.
   void onCommand(char* topic, byte* content, unsigned int length) {
     JsonDocument command;
     DeserializationError error = deserializeJson(command, content, length);  // the content has no end-of-text mark
     if (error) {
       Serial.printf("Command is not valid JSON (%s): ignored.\n", error.c_str());
       return;  // without an id, there is nothing to answer
     }
     const char* id = command["id"] | "";  // "" if the id is missing or not text
     if (id[0] == 0) {
       Serial.println("Command without an id: ignored.");
       return;
     }
     if (strlen(id) >= sizeof(lastIds[0])) {  // at most 39 characters: fits in the id memory and in the ack
       Serial.println("Command with an id longer than 39 characters: ignored.");
       return;
     }
     if (alreadyReceived(id)) {
       Serial.printf("Command %s was already received: ignored.\n", id);
       return;
     }
     rememberId(id);
     const char* action = command["action"] | "";
     const char* target = command["target"] | "";
     const char* message = nullptr;  // stays nullptr if the command was carried out
     if (strcmp(action, "set") != 0) {
       message = "unknown action";
     } else if (strcmp(target, "lamp") != 0 && strcmp(target, "fan") != 0) {
       message = "unknown target";  // this practice sketch only handles the lamp and the fan
     } else if (!command["value"].is<bool>()) {
       message = "value must be true or false";  // the text "false" is not false: refused, not guessed
     } else if (strcmp(target, "lamp") == 0) {
       setLamp(command["value"].as<bool>());
     } else {
       setFan(command["value"].as<bool>());
     }
     Serial.printf("Command %s: action=%s target=%s -> %s\n", id, action, target, message ? message : "done");
     sendAck(id, message == nullptr, message);
   }

   // One connection attempt, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
   void tryConnectBroker() {
     if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
       return;
     }
     hasTried = true;
     lastTryTime = millis();
     unsigned long start = millis();
     // Last will: the status topic, QoS 1, retained, content "offline". The broker keeps it while the ESP32 is connected.
     if (mqtt.connect(deviceId, statusTopic, 1, true, "offline")) {
       Serial.printf("Connected to broker %s in %lu ms, as %s\n", BROKER_ADDRESS, millis() - start, deviceId);
       mqtt.publish(statusTopic, "online", true);  // true = retained: stays posted for subscribers who come later
       Serial.printf("Published to %s: online (retained)\n", statusTopic);
       mqtt.subscribe(cmdTopic, 1);  // subscribe again after every connect (clean session)
       Serial.printf("Subscribed to %s\n", cmdTopic);
     } else {
       int code = mqtt.state();
       Serial.printf("Failed to reach the broker after %lu ms: %s (code %d). Retrying in 5 seconds.\n", millis() - start,
                     mqttStateName(code), code);
     }
   }

   void sendTelemetry() {
     char ts[21];
     if (!makeTs(ts, sizeof(ts))) {
       Serial.println("Clock not set from the internet yet: sending postponed (every reading must carry a ts).");
       return;
     }
     JsonDocument doc;
     doc["ts"] = ts;
     doc["temperature"] = dht.readTemperature();  // ArduinoJson writes NAN (couldn't be read) as null
     float humidity = dht.readHumidity();
     if (isnan(humidity)) {
       doc["humidity"] = nullptr;  // a failed reading is written as null (data contract, Concept 5)
     } else {
       doc["humidity"] = (int)round(humidity);
     }
     doc["light"] = 4095 - analogRead(PIN_LDR);  // inverted as in Node 1: the brighter it is, the bigger the number
     doc["motion"] = digitalRead(PIN_PIR) == HIGH;
     char content[160];
     size_t length = serializeJson(doc, content, sizeof(content));
     if (length >= sizeof(content)) {
       Serial.println("JSON too long for the content[] container: not sent.");
       return;
     }
     if (mqtt.publish(telemetryTopic, content)) {
       Serial.printf("Published to %s: %s\n", telemetryTopic, content);
     } else {
       Serial.printf("FAILED to publish to %s\n", telemetryTopic);
     }
   }

   // Every 100 ms: did the motion or the dark/bright state change since the previous check?
   void checkEvents() {
     if (millis() - lastCheckTime < 100) {
       return;
     }
     lastCheckTime = millis();
     bool motion = digitalRead(PIN_PIR) == HIGH;
     bool dark = (4095 - analogRead(PIN_LDR)) < DARK_THRESHOLD;
     if (motion != motionBefore) {
       immediateReason = motion ? "motion detected" : "motion stopped";
     }
     if (dark != darkBefore) {
       immediateReason = dark ? "getting dark" : "getting bright";
     }
     motionBefore = motion;
     darkBefore = dark;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     pinMode(PIN_LAMP_RELAY, OUTPUT);
     pinMode(PIN_FAN_RELAY, OUTPUT);
     pinMode(PIN_PIR, INPUT);
     setLamp(false);  // relays switched off right away (Module 5)
     setFan(false);
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(telemetryTopic, sizeof(telemetryTopic), "msh/%s/telemetry", deviceId);
     snprintf(statusTopic, sizeof(statusTopic), "msh/%s/status", deviceId);
     snprintf(cmdTopic, sizeof(cmdTopic), "msh/%s/cmd", deviceId);
     snprintf(ackTopic, sizeof(ackTopic), "msh/%s/ack", deviceId);

     netClient.setConnectionTimeout(1000);  // TCP connect takes at most 1 second (default: 3 seconds)
     mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
     mqtt.setSocketTimeout(1);   // wait at most 1 second for the broker's answer (default: 15 seconds)
     mqtt.setBufferSize(512);    // a 512-byte message container (default: 256), Concept 9
     mqtt.setCallback(onCommand);

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
     Serial.printf("Connected to WiFi, ESP32 IP %s, device_id %s\n", WiFi.localIP().toString().c_str(), deviceId);
     configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");  // the time from the internet (Module 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi down: the esp32 package reconnects by itself (Module 10)
     }
     if (!mqtt.connected()) {
       tryConnectBroker();
       return;
     }
     mqtt.loop();  // must be called as often as possible: keeps the connection alive
     checkEvents();
     if (immediateReason != nullptr && millis() - lastSendTime >= MIN_IMMEDIATE_GAP) {
       Serial.printf("Sending immediately: %s\n", immediateReason);
       immediateReason = nullptr;
       lastSendTime = millis();  // the next 10-second slot is counted from this send
       sendTelemetry();
     } else if (millis() - lastSendTime >= SEND_INTERVAL) {
       lastSendTime = millis();
       sendTelemetry();
     }
   }
   ```

2. Click **Upload**, then open the **Serial Monitor**. If the MB102 was only just turned on, wait about 1 minute until the PIR has finished "warming up" (Module 6); during that time, the PIR can report motion that isn't there.
3. Keep your hand still at first. The sends still go out every 10 seconds, now with the `motion` field.
4. **Wave your hand in front of the PIR.** The Serial Monitor right away says `Sending immediately: motion detected`, and a new message appears in MQTTX **without** waiting for the 10-second schedule. A few seconds after your hand is still, depending on the PIR hold time you set in Module 6, `Sending immediately: motion stopped` appears.
5. **Cover the LDR with your palm**, then uncover it again. `Sending immediately: getting dark` and `Sending immediately: getting bright` appear.
6. **Test the 2-second limit.** Wave your hand, then **right away** cover the LDR. The second event isn't sent right away: it waits until 2 seconds after the previous send, then goes out with the latest readings.

**Expected output in the Serial Monitor** (example; `Command …` and `ack` lines from Practice 6 can still appear if you send commands):

```text
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:10Z","temperature":28.4,"humidity":70,"light":2287,"motion":false}
Sending immediately: motion detected
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:14Z","temperature":28.4,"humidity":70,"light":2290,"motion":true}
Sending immediately: getting dark
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:16Z","temperature":28.4,"humidity":70,"light":318,"motion":true}
Sending immediately: getting bright
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:19Z","temperature":28.4,"humidity":70,"light":2281,"motion":true}
Sending immediately: motion stopped
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:24Z","temperature":28.4,"humidity":70,"light":2285,"motion":false}
Published to msh/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:34Z","temperature":28.4,"humidity":70,"light":2288,"motion":false}
```

Look at the timestamps. The scheduled send has the `ts` `…01:50:10Z`, the immediate send `…01:50:14Z`, and then `getting dark` only goes out at `…01:50:16Z`, because it waits for the 2-second gap. The next scheduled send (`…01:50:34Z`) comes 10 seconds after the **last** send, not on every multiple of 10 seconds.

**Inside the code:**

- **`checkEvents()`** checks the PIR and the LDR every 100 ms, then compares them with the previous check (`motionBefore`, `darkBefore`). Only **changes** are recorded, as a reason text in `immediateReason`.
- **`immediateReason`** works like a flag in Module 8: as long as it isn't `nullptr`, there's an event that hasn't been sent yet. A new event that comes before the send simply overwrites the reason; the message's contents are always the latest readings anyway.
- **`MIN_IMMEDIATE_GAP = 2000`** limits immediate sends to at most once every 2 seconds.
- **`lastSendTime = millis()`** is updated by both kinds of send, so the 10-second schedule is always counted from the last send.
- **`DARK_THRESHOLD = 1000`** is the same as the automatic lamp's limit in Module 6. If the `light` number in your room is still above `1000` with the LDR covered, cover the LDR more tightly, or raise that number a little.

**In Wokwi:** click the PIR module, then click **Simulate motion** in the `PIR Motion Sensor` window. Wokwi's PIR holds the motion for 5 seconds. For dark and bright, click the LDR, then drag its light slider to the left until `light` is below `1000`.

> ⬆️ **Done with Practices 6 and 7?** Go back to [Concept 9](#9-message-size-the-256-byte-container-that-silently-throws-things-away) (the ➡️ at the end of Concept 10 will take you to Practices 8 and 9).

### Practice 8 — The contract checker (20 minutes)

> 🖥️ **Tools:** **VS Code** with the `mini-smart-home` folder, **Node.js 24** from Module 4, the broker terminal running, **MQTTX**, and the Node 1 board still running the Practice 7 sketch (leave the MB102 on: at the end of 8.4, the lamp relay is used again). Concepts used: 5 and 8.

Human eyes easily miss one missing field or a stray `-1`. So we put in the **contract's security guard**: a small program on the laptop that subscribes to `msh/#`, then checks every message of the project against the data contract. This tool is the judge of the completion requirement in section ➕ F, and you'll use it again every time you add a device or change the firmware.

#### 8.1 Install the `mqtt` library for Node.js

1. In VS Code, open a new terminal (**Terminal → New Terminal**). A new terminal always starts in the main `mini-smart-home` folder; go into the `tools` folder:

   ```bash
   cd tools
   ```

2. Install the **mqtt** library, an MQTT client for Node.js:

   ```bash
   npm install mqtt@5.16.1
   ```

   **Expected output** (the number of seconds and the number of packages looking for funding may be different):

   ```text
   added 44 packages, and audited 45 packages in 3s

   5 packages are looking for funding
     run `npm fund` for details

   found 0 vulnerabilities
   ```

   That one library turns out to bring 43 helper libraries along, about 11 MB in total, in the `node_modules` folder. Don't worry: the `.gitignore` from Module 4 already tells Git to ignore that folder. The only thing that gets saved is one new line in `package.json`: `"mqtt": "^5.16.1"` in the `dependencies` section.

#### 8.2 Copy the checker

1. In the **Explorer** panel, right-click the `tools` folder, choose **New File…**, then name it **`contract-checker.js`**.
2. Open [`mini-smart-home/tools/contract-checker.js`](../../mini-smart-home/tools/contract-checker.js) on GitHub, click the **Copy raw file** icon, paste it into your new file, then save it (**Ctrl + S**).

The program is about 230 lines long. You don't need to understand all of it now; its important parts are explained below.

#### 8.3 Run it

```bash
node contract-checker.js
```

Type that command in the terminal from step 8.1, which is already in the `tools` folder. Without anything added, this tool connects to the broker on the same laptop (`127.0.0.1`) and checks all the `msh/#` topics. If the broker is on another computer, write its address after the command, for example `node contract-checker.js 192.168.1.10`. On the Wokwi path, write the public broker **and** your `device_id`, for example `node contract-checker.js broker.emqx.io 240ac45e114b`: the tool then only subscribes to `msh/240ac45e114b/#`, so other readers' messages on the public broker aren't checked.

**Expected output** (example, with the Practice 7 sketch still running):

```text
Contract checker ready on broker 127.0.0.1:1883 (subscribed to msh/#) — press Ctrl + C to stop.
[8:52:10 AM] msh/a4cf12e5b7c0/status  PASS  [retained]
[8:52:14 AM] msh/a4cf12e5b7c0/telemetry  FAIL
   - field "fw" is missing
   - field "soil" is missing
   - field "water_level" is missing
```

Every message that passes by gets a **PASS** or **FAIL** stamp, with its reasons. The `online` status passes, and the `[retained]` mark appears because that message was handed over from the notice board. The `telemetry` from the Practice 7 sketch **fails**, and it's supposed to: that practice sketch only holds five of the eight fields. Node 1 v1.2 in section ➕ completes them.

#### 8.4 Test it with handmade messages from MQTTX

Send the following messages from MQTTX (**JSON** format) to the topic `msh/` + your `device_id` + `/telemetry`, then watch the checker's answers. You can leave the `ts` content as it is (the checker only refuses a `ts` with the wrong shape, from before the year 2025, or more than 5 minutes ahead of the laptop's clock):

| Message content | The checker's answer |
| :--- | :--- |
| `{"ts":"2026-10-18T01:30:12Z","fw":"1.2.0","temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}` | **PASS** |
| the same, but `"humidity":-1` | **FAIL**: `"humidity" must be a whole number from 0 to 100 or null, got -1` |
| the same, but `"motion":"false"` | **FAIL**: `"motion" must be true or false, got "false"` |
| the same, but `"temperature":null,"humidity":null,"water_level":null` | **PASS**: failed readings written as `null` are valid |

Also try a wrong topic, for example `msh/` + your `device_id` + `/Telemetry` (with a capital T). The checker answers `FAIL` with the reason `topic outside the data contract`. A topic that starts with a slash, such as `/msh/…`, isn't seen at all, because the `msh/#` subscription doesn't catch it (Concept 4).

**Measure the command's answer.** Leave the checker running, make sure the MB102 is still on, change **Topic** back to `msh/` + your `device_id` + `/cmd`, then send a command as in Practice 6 with a new `id`, for example `{"id":"c-010","action":"set","target":"lamp","value":true}`. The checker notes when the command passed by and when its `ack` came (example):

```text
[8:53:40 AM] msh/a4cf12e5b7c0/cmd  PASS
[8:53:40 AM] msh/a4cf12e5b7c0/ack  PASS  (answered 214 ms after the command: under 1 second)
```

That number of milliseconds is the time from when the command passed through the broker until its answer came back to the broker: the command is delivered to Node 1, carried out, then answered. That's the number used by the completion requirement "gets an `ack` back in < 1 second". On the Wokwi path, the command and its answer cross the internet, so the number goes up and down around 1 second; that's normal, and the completion requirement is only proven with the real board in section ➕ E.

Stop the checker with **Ctrl + C**. Before it stops, it prints a summary (example; while the Practice 7 sketch is still running, each of its `telemetry` messages adds one FAIL, so your numbers depend on how long the checker ran):

```text
Summary: 5 messages PASS, 17 messages FAIL.
```

**Inside the code:**

- **`mqtt.connect()`** connects with a random name starting with `checker-`, a time limit of 5 seconds, and `reconnectPeriod: 0` so it doesn't keep retrying. If the broker isn't running yet when the tool starts, the tool quits right away with the message `Can't connect to broker 127.0.0.1:1883 (ECONNREFUSED). Is the broker running?`.
- **`client.on("error", …)` is required.** Without this listener, the Node.js program stops right away with a long pile of error messages as soon as the broker can't be reached.
- **`client.on("close", …)`** handles a broker that is stopped while the checker is running: the tool prints `Connection to broker … lost` and its summary, then stops. The `error` handler does the same if an established connection drops because of an error, for example `ECONNRESET`. Without the `close` listener, the tool just goes quiet, and you might think Node 1 has stopped sending.
- **`process.argv[3]`** is the `device_id` you may write after the broker's address. If it's there, the tool only subscribes to `msh/<device_id>/#`; if not, to `msh/#`.
- **`check()`** splits the topic with `split("/")`, makes sure its shape is `msh/<device_id>/<kind>`, then calls the checker that fits its kind.
- **`checkFields()`** makes sure the required fields are there and that there's no field outside the contract. The numbers in them are checked by **`checkInteger()`** and **`checkTs()`**, following the units table in section 4 of `DATA-CONTRACT.md`, the copy of Appendix A that also holds the range of `temperature`. For `set` commands, **`SET_VALUES`** matches `target` and `value` against the table in section 7 of `DATA-CONTRACT.md`. **`validId()`** makes sure the `id` of every command and `ack` is text of 1 to 39 characters.
- **`seenCommands`** is a `Map` (a list of pairs) from a command's `id` to the time that command was seen. When an `ack` with the same `id` arrives, the time difference is printed.

### Practice 9 — The *pub/sub* diagram and `DATA-CONTRACT.md` (20 minutes)

> 🖥️ **Tools:** **a sheet of paper and a pencil** (or any drawing app), a **phone** to take a photo, **VS Code**, and **GitHub Desktop**. Concepts used: 2, 4, and 5.
>
> ⭐ **Required** — practice for the completion requirement in section ➕ H: you can draw your project's *pub/sub* diagram on paper.

#### 9.1 Draw your project's *pub/sub* diagram

Draw it from memory first, then compare it with the example below. Your diagram must include:

1. **The broker in the middle**, with its address, for example `Mosquitto, laptop 192.168.1.10:1883`.
2. **All the clients** around it: Node 1, MQTTX, and `contract-checker.js`. You may add future clients with dashed lines: Node-RED (Module 13) and the backend (Module 16). The Node-RED dashboard of Module 13 is already represented by the Node-RED box. Your own dashboard (Module 22) isn't a client of the broker: it gets its data from the backend, so if you want to draw it, connect it to the backend, not to the broker.
3. **An arrow for every topic**, from the publisher to the broker and from the broker to the subscriber, with the topic's name. Write it in full for one device, for example `msh/a4cf12e5b7c0/telemetry`.
4. **Special marks**: retained and *Last Will* on `status`, QoS 1 on the `cmd` subscription, and the *wildcard* that MQTTX and the checker use (`msh/#`).

![Example pub/sub diagram of the Mini Smart Home; a dashed line means a client that comes in a later module. In the middle, the Mosquitto broker on the laptop 192.168.1.10:1883 (Module 12: moves to a Raspberry Pi). Left, Node 1 "Home" (a4cf12e5b7c0) with five topic arrows msh/a4cf12e5b7c0/…: telemetry, status (retained), vitals, and ack going to the broker, and cmd (QoS 1) coming from the broker; below it, last will: status = offline. Right, MQTTX (subscribes to msh/#, sends cmd) receives all msh/… and sends cmd; contract-checker.js (subscribes to msh/#) with an arrow labeled all msh/… from the broker. Dashed: Node-RED (Module 13), Backend + database (Modules 16–17), Dashboard (Module 22, connected to the backend, not to the broker), and Node 2 "Garden" (Module 14, through Node 1 with ESP-NOW). The box at the bottom, what your diagram must include: the broker in the middle with its address and all the clients around it; an arrow for every topic, from the publisher to the broker and from the broker to the subscriber, with the topic name; the retained and last will marks on status, QoS 1 on the cmd subscription, and the msh/# wildcard on the subscribers](assets/project-pubsub-diagram.png)

Take a photo of your diagram, save it as `pubsub-diagram.jpg` in the `learn-iot/module-11` folder, then write three sentences in `notes-module11.md`: who publishes `telemetry`, who subscribes to it, and what happens to `status` when Node 1 runs out of power.

#### 9.2 Keep the data contract in your project

1. In VS Code with the `mini-smart-home` folder, click an empty space in the **Explorer**, then create a new file, **`DATA-CONTRACT.md`**, in the project's main folder (next to the `tools` and `firmware` folders).
2. Open [`mini-smart-home/DATA-CONTRACT.md`](../../mini-smart-home/DATA-CONTRACT.md) on GitHub, click **Copy raw file**, then paste it and save. The links inside that file that lead to Appendix A of the Syllabus and to Module 11 use the curriculum repository's full GitHub address, so they still open from your own repository.
3. At the very bottom, fill in the **My devices** table with your Node 1's `device_id` and your broker's address.
4. Make sure the `edge` folder holds the `mosquitto-lan.conf` from Practice 1. If you created it somewhere else earlier, move it there.

From now on, every time the contract changes, for example a new field in Module 19 or 28, this file is updated first, and the code after it (Concept 5). The full contract stays in [Appendix A of the Syllabus](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract); `DATA-CONTRACT.md` is the copy your project always carries with it.

> ➡️ **After Practice 9:** do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1) and the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home), where Node 1 moves up to v1.2 and all three completion requirements are proven, then finish with the [📝 Quiz](#-5-question-quiz) and the [✅ Completion Checklist](#-module-11-completion-checklist). The 🚨 and 🔬 sections in between only need to be opened when you need them.

---

## 🚨 Troubleshooting

This week there are four sources of evidence: the **Serial Monitor** (the `mqtt.state()` code and how long the attempt took), the **broker terminal** (who came, who left, and why), **MQTTX** (which messages actually passed by), and the **contract checker**. Start in the middle: is the broker running, and does it log the ESP32 as a client? Click a problem's title to open its explanation.

> [!IMPORTANT]
> **Before you check or move a wire on the workbench:** turn off the MB102, then unplug the USB. When you're done, plug in the USB first, then turn on the MB102. For MQTT problems, the wires almost never need to be touched.

<details>
<summary><b><code>Compilation error</code> — this week's error messages</b></summary>

Each message starts with a file name and a line number. Read the **first error message** first: the errors after it are often just consequences of the first one.

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `#error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."` | The guard at the start of the sketch found that the old **PubSubClient** library is the one in use, either because it's the only one installed, or because both are installed and Arduino IDE picked the old one. | In the **Library Manager**, search for `PubSubClient`, click **REMOVE** on the **PubSubClient** card (the one without the 3) and answer **Yes**, then make sure **PubSubClient3** version **3.3.2** is installed (Quick Win step 2). |
| `fatal error: PubSubClient.h: No such file or directory` | No MQTT library is installed yet. | Install **PubSubClient3** version **3.3.2**. Its file name is indeed still `PubSubClient.h`. |
| `fatal error: ArduinoJson.h: No such file or directory` | The **ArduinoJson** library isn't installed on this laptop. | Install **ArduinoJson by Benoit Blanchon** version **7.4.3** (Practice 6.1 of Module 10). |
| `fatal error: DHT.h: No such file or directory` | The DHT library from Module 6 isn't installed. | Install **DHT sensor library by Adafruit** 1.4.7 (Module 6). |
| `fatal error: secrets.h: No such file or directory` | The sketch was created from scratch, not with **Save As…** from the previous sketch. | Create a **`secrets.h`** tab as in Module 10, or start again with **File → Save As…** from a sketch that already has that tab. |
| `Sketch too big` | The selected board is still **DOIT ESP32 DEVKIT V1** with the default program shelf. | Choose **ESP32 Dev Module** with **Partition Scheme** **Minimal SPIFFS** and **Flash Mode** **DIO**, as in section ➕ A of Module 10. |

</details>

<details>
<summary><b>The terminal doesn't recognize <code>mosquitto</code></b></summary>

The message depends on your terminal:

```text
The term 'mosquitto' is not recognized as a name of a cmdlet, function, script file, or executable program.
```

In the built-in Windows PowerShell (version 5.1), it says `…as the name of a cmdlet, function, script file, or operable program.`; on macOS, `zsh: command not found: mosquitto`. They all mean the same thing: the terminal doesn't know which folder the program is in.

- **Windows:** repeat steps 6–9 of Practice 1.1, especially **closing VS Code and opening it again**. A VS Code that was already open before the Mosquitto folder was registered will never see it. Want to try it without registering the folder? Write the full path with an `&` sign in front:

  ```powershell
  & "C:\Program Files\Mosquitto\mosquitto.exe" -v -c mosquitto-lan.conf
  ```

  Without the `&`, PowerShell treats the quoted text as just a piece of text, then rejects the rest of the command with `Unexpected token '-v'`.
- **macOS:** `brew install mosquitto` hasn't finished, or your terminal doesn't know the Homebrew folder yet. Try `$(brew --prefix)/sbin/mosquitto -v -c mosquitto-lan.conf`.
- **Linux:** `mosquitto` (the broker) and `mosquitto-clients` (`mosquitto_pub`/`mosquitto_sub`) are two separate packages. Install both. On Debian and Raspberry Pi OS, the broker program lives in `/usr/sbin`, which is sometimes not in an ordinary user's list of program folders; try `/usr/sbin/mosquitto -v -c mosquitto-lan.conf`.

</details>

<details>
<summary><b>Mosquitto stops right away with <code>Error: …</code></b></summary>

| Message | What it means | The fix |
| :--- | :--- | :--- |
| `Error: Unable to open config file 'mosquitto-lan.conf'.` | The terminal isn't in the `edge` folder, or the file's name is different. | Type `cd edge` first. On Windows, make sure the file isn't secretly named `mosquitto-lan.conf.txt`. |
| `Error: Only one usage of each socket address (protocol/network address/port) is normally permitted.` (Windows) or `Error: Address already in use` (macOS and Linux) | Door 1883 is already used by another program, almost certainly a second broker. | Open "Two brokers running at the same time" below. |
| `Error: Unknown configuration variable '…'.` followed by `Error found at …` | There's a typo in `mosquitto-lan.conf`, or a comment line whose `#` isn't exactly its first character (for example, there's a space or a Tab in front of it). | Make the file's contents match Practice 1.3. A comment may only be on a line of its own, with `#` as its first character. |

</details>

<details>
<summary><b>Two brokers running at the same time</b></summary>

The symptoms can be confusing: Mosquitto in the terminal fails to start with a message that the door is in use, **or** it does start, but the ESP32 and MQTTX seem to be in two different worlds. The ESP32 connects through the laptop's IP address, while MQTTX, which uses `127.0.0.1`, never sees its messages. The check in Practice 1.5 shows two different `OwningProcess` numbers.

The cause is almost always the **Mosquitto service** that came with the installer (the **Service** option in Practice 1.1 wasn't unchecked, or Mosquitto was installed at some point before). Stop it, and don't let it start by itself again:

- **Windows, by clicking:** click **Start**, type `Services`, then open the **Services** app. Double-click **Mosquitto Broker**. Under **Startup type**, choose **Manual**, click **Stop**, then **OK**.
- **Windows, with the terminal:** open **Terminal (Admin)** or **Windows PowerShell (Admin)** (right-click the **Start** button), then type these two commands. The space after `start=` is required, and write `sc.exe`, not `sc`: in Windows PowerShell, `sc` means a different command.

  ```powershell
  sc.exe stop mosquitto
  ```

  ```powershell
  sc.exe config mosquitto start= demand
  ```

- **macOS:** `brew services stop mosquitto`.
- **Linux:** `sudo systemctl disable --now mosquitto`.

After that, start the broker in the terminal again, then repeat the Practice 1.5 check until only one `OwningProcess` number appears.

</details>

<details>
<summary><b>Can't connect to the broker (<code>Failed</code>, code <code>-2</code>)</b></summary>

First check the broker terminal: is it still running, with no `Starting in local only mode` text? After that, look at **how long** the attempt took in the Serial Monitor (Concept 10).

**It fails within a few milliseconds** (`Failed to reach the broker after 4 ms`): your laptop can be reached, but nothing is serving door 1883. On a Windows laptop with its firewall on, the three causes below usually show up as a failure after about 1,000 milliseconds instead.

1. The broker terminal has been closed, or the broker has stopped. Start it again (Practice 1.3).
2. The broker is running in **local only mode**: you ran `mosquitto -v` without `-c mosquitto-lan.conf`. Look for the text `Starting in local only mode` in the broker terminal.
3. `BROKER_PORT` isn't `1883`.

**It fails after about 1,000 milliseconds** (`Failed to reach the broker after 1001 ms`): no answer at all.

1. **`BROKER_ADDRESS` is still the example, or the laptop's address has changed.** Every practice code you paste holds the example `"192.168.1.10"` again, so replace it every time. The laptop's address can also change after the laptop sleeps or the router restarts. Check it again with `ipconfig` on Windows, `ipconfig getifaddr en0` on macOS, or `hostname -I` on Linux (Practice 7.1 of Module 10), then update `BROKER_ADDRESS`. To keep it from happening again, make an address reservation (*DHCP reservation*) for the laptop in the router, as for Node 1 in Practice 9 of Module 10.
2. **The ESP32 and the laptop are on different networks**, for example the laptop is on a 5 GHz Wi-Fi with a different name, on a guest network, or uses a LAN cable on another router. The first three numbers of both addresses must be the same.
3. **The Windows *firewall***: mosquitto doesn't have its permission yet, or your home Wi-Fi still has the **Public network** profile while the permission is only for **Private** (Practice 1.4).
4. **A VPN** on the laptop is on. Many VPNs block connections from the home network. Turn it off during the practice.
5. **The laptop is asleep.** On Windows, a broker that's stopped or running in local only mode (without `-c mosquitto-lan.conf`) also looks like this; check the broker terminal first.
6. **In Wokwi**, `BROKER_ADDRESS` is still the laptop's IP address. The simulated ESP32 can't reach your laptop; write `"broker.emqx.io"` (Practice 5: `"broker.hivemq.com"`). For Node 1 v1.2, change `USE_WOKWI` to `true` in `config.h` (➕ B); `BROKER_ADDRESS` is then ignored.

**In the Quick Win (public broker):** office, campus, and some public Wi-Fi networks block door 1883 to the internet. Try your phone's hotspot.

**Other codes:** `5` (`not authorized by the broker`) means the `allow_anonymous true` line wasn't read; check the contents of `mosquitto-lan.conf`. `-4` (`the broker did not answer in time`) is rare; usually the laptop is very busy, and the next attempt succeeds. In Wokwi with a public broker, the broker's answer is sometimes slower than 1 second; if `-4` keeps repeating there, change `setSocketTimeout(1)` to `setSocketTimeout(3)`, just for Wokwi.

</details>

<details>
<summary><b>Connects, then keeps dropping every few seconds (code <code>-3</code>)</b></summary>

If the broker terminal logs `disconnected: session taken over.` over and over (Mosquitto 2.0.x: `already connected, closing old connection.`), there are **two clients with the same name** pushing each other out (Concept 5). The usual causes:

- **Two Wokwi projects** (or two people) use the same `macAddress` on the public broker, so their `device_id`s are identical. Replace the last three pairs of `macAddress` with numbers of your own choice.
- **The Client ID field in MQTTX** is filled with Node 1's `device_id`. Let MQTTX use its own random name (`mqttx_…`).
- **The same sketch runs on two boards** with a client name written into the code, for example a sketch from another tutorial that writes `mqtt.connect("esp32")`. This week's sketches are safe: their client names come from the chip's MAC address, or from the random code in the Quick Win.

</details>

<details>
<summary><b>MQTTX shows nothing</b></summary>

1. **Look at the connection's Host field.** A new connection in MQTTX always starts with `broker.emqx.io`, the public broker. For the laptop broker, it must say `127.0.0.1`; on the Wokwi path, it must say `broker.emqx.io` instead (Practice 5: `broker.hivemq.com`). Create a new connection with the right Host, or change the old connection through its **Edit** option.
2. **Check the subscription's topic.** Upper and lower case are different, a topic doesn't start with `/`, and `msh/+` only catches one level. For all of the project's messages, use `msh/#`; on a public broker (the Wokwi path), use `msh/` + your `device_id` + `/#` so other readers' messages aren't caught too.
3. **Is the connection still alive?** A connection that's connected has a green name in MQTTX's list on the left. If it isn't green, or the notice `Reconnecting` appears followed by `Error: connect ECONNREFUSED …`, the broker may have stopped. Start the broker again, then click **Connect** at the top right of MQTTX: once the broker has stopped, MQTTX only tries to reconnect once, about 4 seconds later, then gives up after being refused.
4. **Are there two brokers?** Open "Two brokers running at the same time" above.
5. **Does the Serial Monitor say `Clock not set from the internet yet: sending postponed` or `Not connected after 20 seconds`?** The ESP32 hasn't published anything yet, because its Wi-Fi or its internet clock isn't ready. Open the same problem in 🚨 in Module 10 ("The dots keep coming, then `Not connected after 20 seconds`" or "The clock is never set").

</details>

<details>
<summary><b>Commands from MQTTX get no <code>ack</code>, or the relay stays silent</b></summary>

Look at the Serial Monitor while the command is sent:

- **Nothing is printed:** the command doesn't arrive. Its topic must be **exactly** `msh/<device_id>/cmd`, with the `device_id` in lowercase, as printed in the Serial Monitor. Also make sure the line `Subscribed to msh/…/cmd` (the practice sketch) or `MQTT connected to broker …` (Node 1 v1.2) has appeared, and that you're sending from the **Laptop broker** connection (click its name in MQTTX's list on the left). Commands sent from the **Public broker** connection left over from the Quick Win never reach the broker on your laptop. On the Wokwi path, it's the other way around: send from **Public broker**, because the simulated ESP32 is connected to `broker.emqx.io`.
- **`Command … was already received: ignored.`**: you used an old `id`, including the `id` of a command that was refused earlier. Change the number every time you send a new command.
- **`Command with an id longer than 39 characters: ignored.`**: shorten the `id`, for example to `c-011`.
- **`Command is not valid JSON (…)`** or **`Command without an id`**: check the quotation marks, the commas, and the curly braces. Keep MQTTX's format on **JSON**: the message's contents are colored according to the JSON rules, so typos are easier to spot.
- **The command is very long**, for example with many extra fields, and you deleted the `mqtt.setBufferSize(512)` line: a message bigger than the container is silently thrown away (Concept 9). Put that line back.
- **The `ack` comes with `ok:true`, but the relay doesn't go "click" and its indicator LED stays off:** the MB102 isn't on yet. The ESP32 gets its power from USB, so it still answers, but the relay needs 5 V from the MB102. Turn on the MB102 (USB first, then the MB102), then send the command again with a new `id`.

</details>

<details>
<summary><b>The lamp turns on again by itself</b></summary>

Two different causes:

- **It turns on again every time Node 1 restarts or is switched on:** a ***retained*** command is posted on the `cmd` topic, because the **Retain** box in MQTTX was ticked when the command was sent. The `id` memory only stops it from being carried out again while Node 1 stays on; after a restart, the memory is empty and the command is carried out again (a pump command too). Take the notice down: in MQTTX's send box, fill in **Topic** with your `cmd` topic, then click the small triangle button to the right of the **Meta** button, choose **Clear Retained Message**, and answer the confirmation. After that, untick the **Retain** box that got ticked along with it; otherwise, the next command gets posted again. With the terminal: `mosquitto_pub -t "msh/<device_id>/cmd" -r -n`.
- **It turns on when there's motion in the dark** (Node 1 v1.2): that's the **automatic lamp** from Module 6, not a mistake. That rule only turns off the lamp it turned on itself, but it may still turn on a lamp you just turned off from MQTTX.

</details>

<details>
<summary><b>The status never changes to <code>offline</code></b></summary>

- **Have you waited 23 seconds?** The broker only gives up after 22.5 seconds without news (Concept 7). On the Wokwi path, the public broker sometimes only publishes it about 27 seconds after the simulation is stopped.
- **Does the sketch have a last will?** The Quick Win, Practice 3, and Practice 5 don't leave one; Practices 4, 6, 7, and Node 1 v1.2 do.
- **Is the board really off?** Closing the Serial Monitor doesn't turn off the ESP32. Turn off the MB102 first if it's on, then unplug the USB cable. In Wokwi, stop the simulation.
- **The `offline` status doesn't go away after the practice is over**: that's correct, because Node 1 is off. If it bothers you, take the notice down with **Clear Retained Message** on the `status` topic, then untick the **Retain** box that got ticked along with it.

</details>

<details>
<summary><b>The contract checker won't run</b></summary>

| Message | What it means | The fix |
| :--- | :--- | :--- |
| `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'mqtt' imported from …` | The `mqtt` library isn't installed in this folder. | Run `npm install mqtt@5.16.1` **in the `tools` folder** (Practice 8.1). |
| `Error: Cannot find module '…contract-checker.js'` | The terminal isn't in the `tools` folder, for example it's the broker terminal (the `edge` folder) or a terminal split from it. | Open a new terminal (**Terminal → New Terminal**), type `cd tools`, then run the checker again. |
| `Can't connect to broker 127.0.0.1:1883 (ECONNREFUSED). Is the broker running?` | There's no broker on this laptop. | Start the broker first (Practice 1.3), then run the checker again. |
| The same message, but ending with `(connack timeout)` after 5 seconds (on macOS and Linux, sometimes `(EHOSTUNREACH)`) | The broker address you wrote doesn't answer at all. | Check the IP address after `node contract-checker.js`. |
| `"ts" is more than 5 minutes ahead of the laptop's clock` | Most likely it's your laptop's clock that's wrong, not the ESP32's. | Turn on **Set time automatically** in the laptop's date and time settings. |
| `Connection to broker … lost …` | The broker stopped (or the laptop went to sleep for a moment) while the checker was running. | Start the broker again (Practice 1.3), then run the checker again with **↑** and **Enter**. |
| `device_id must be 12 lowercase hexadecimal digits, …` | The `device_id` after the broker's address is mistyped, for example it still has the colons or the capital letters of the `macAddress`. | Copy the `device_id` exactly as printed in the Serial Monitor, for example `node contract-checker.js broker.emqx.io 240ac45e114b`. |

</details>

<details>
<summary><b>Node 1 v1.2: specific problems</b></summary>

- **`MQTT failed to connect to the broker after … ms: … (code -2). Is the broker on the laptop running?`**: the same as "Can't connect to the broker" above. Its address is set in `BROKER_ADDRESS` in the `config.h` tab. Meanwhile, Node 1 keeps working normally, and its display says `WiFi ok, MQTT down`.
- **The Serial Monitor says `Wokwi mode`** even though it's a real board: `USE_WOKWI` in `config.h` is still `true` (see the same problem in 🚨 in Module 10).
- **`Command … refused: pump refused: tank water too low`** (or `… unreadable`): the water tank safety of Module 6 is working. Fill the tank above 20%, or check the HC-SR04 sensor.
- **The `telemetry` sends seem more frequent than every 10 seconds:** that's normal when something important happens, for example a PIR that often sees motion, or a `light` or `soil` number going up and down across its threshold (for example at dusk, when `light` swings around `1000`). Immediate sends are limited to at most once every 2 seconds.
- **The checker says `answered … ms after the command: MORE than 1 second`:** in Wokwi, that's normal (Concept 8). On the real board, make sure the laptop and Node 1 are connected to the same router without a VPN, then repeat it a few times with new `id`s. If the number stays above 1,000 milliseconds, the ESP32's Wi-Fi power saving may be holding back incoming commands: add `WiFi.setSleep(false);` in `setupNetwork()` (the `networking.cpp` tab), right after `WiFi.mode(WIFI_STA);`, then upload again. Node 1 gets its power from USB, not from a battery, so the extra current isn't a problem.

</details>

---

## 🔬 Technical Deep Dive (optional)

This section is for the curious. You can skip it; nothing in it is used in the quiz or the checklist.

<details>
<summary><b>The MQTT message as it really is: 105 bytes for one reading</b></summary>

MQTT messages are sent as a very compact sequence of bytes. Take one send from Practice 3: the topic `msh/a4cf12e5b7c0/telemetry` (26 bytes) and 75 bytes of JSON content. Its QoS 0 `PUBLISH` packet is only **105 bytes**:

| Part | Bytes | What they hold |
| :--- | :--- | :--- |
| Fixed header | `30` | the packet type `PUBLISH` (the number 3 in the upper half), no DUP, QoS 0, not retained |
| Remaining length | `67` | 103 more bytes after this one (`0x67` = 103) |
| Topic length | `00 1A` | 26 bytes |
| Topic | `6D 73 68 2F …` | `msh/a4cf12e5b7c0/telemetry` |
| Content | `7B 22 74 73 …` | `{"ts":"2026-10-18T01:30:32Z",…}` |

Compare this with the HTTP letter of Practice 7 in Module 10: its letter head alone is about 200 bytes, not counting the reply letter. Other MQTT packets are even smaller: `PINGREQ` (the heartbeat) is only two bytes, `C0 00`, and its answer `PINGRESP` is two bytes too, `D0 00`. The `DISCONNECT` packet (leaving politely) is `E0 00`.

If a message is sent with QoS 1, there are two extra bytes after the topic: the **packet number** (*packet identifier*). That's the number the receiver sends back in `PUBACK`, so the sender knows which message has arrived.

</details>

<details>
<summary><b>MQTT 5 vs MQTT 3.1.1</b></summary>

Our ESP32 speaks **MQTT 3.1.1** (an OASIS standard from 2014), while MQTTX uses **MQTT 5** (an OASIS standard from 2019) by default. The two can talk through the same broker, because Mosquitto understands both versions and translates as needed. You can see the difference in the broker terminal: the ESP32 is logged as `p4` (MQTT 3.1.1), and MQTTX as `p5` (MQTT 5).

The MQTT 5 additions you notice most:

| Feature | What it's for |
| :--- | :--- |
| **Reason codes** in almost every answer | The broker can explain **why** a connection or a subscription was refused, not just "refused". |
| ***User properties*** | Extra information as name-value pairs, like HTTP headers, without changing the message's content. |
| **Message expiry** | A message that waits too long in a queue is thrown away by itself. Good for commands: a stale "pump 3 seconds" doesn't need to be carried out. |
| **Session expiry** | The replacement for *clean session*: a persistent session can be limited, for example to being kept for only 1 hour. |
| **Shared subscriptions** (`$share/group/topic`) | Several subscribers share the work: each message is given to only one of them. Useful for a backend that runs as several copies. |
| **Request and response** (*response topic*, *correlation data*) | The publisher can name a reply topic and a case number, much like our `cmd` → `ack` pattern, but official. |
| **Will delay** (*will delay interval*) | The last will is only published if the client doesn't come back within a set number of seconds, so a Wi-Fi that drops for a moment doesn't trigger `offline`. |

Our data contract deliberately uses only 3.1.1 features, so it works with any library, including PubSubClient3. If we ever move to MQTT 5, the topics and the JSON don't need to change.

</details>

<details>
<summary><b>esp-mqtt: the MQTT client built into ESP-IDF</b></summary>

The esp32 3.3.x package actually already brings an MQTT client made by Espressif called **esp-mqtt** (the file `mqtt_client.h`), even though there's no example of it in the **File → Examples** menu. Compared with PubSubClient3:

| | PubSubClient3 | esp-mqtt |
| :--- | :--- | :--- |
| How you write the code | Arduino style (`mqtt.connect()`, `mqtt.loop()`) | ESP-IDF C style (a configuration struct and event functions) |
| QoS 1 and 2 | QoS 1 without resending; QoS 2 not possible | really resent until a receipt arrives |
| Knows that a message is retained? | no | yes, every incoming message carries a mark |
| Where it runs | inside `loop()` | in its own "worker" (*task*), separate from `loop()` |
| Big messages | thrown away if bigger than the container | cut into several parts that can be joined back together |
| MQTT version in the esp32 package | 3.1.1 | 3.1.1 (MQTT 5 support isn't compiled into the Arduino package) |

Its advantages are tempting, but they come at a price. Because its event functions run in another *task*, touching a relay from there needs the same care as the interrupt functions of Module 8. QoS 1 messages waiting in its queue are also thrown away by themselves after about 30 seconds, and that number can't be changed from Arduino IDE. For Node 1, the simplicity of PubSubClient3 is worth more. The esp-mqtt client is worth a look if you ever need a real QoS 1 from the ESP32, or MQTT over TLS and WebSocket.

</details>

<details>
<summary><b>MQTT over WebSocket: the way in for browsers</b></summary>

Browsers on phones and laptops **can't** open an ordinary TCP connection to door 1883. The only kind of connection a browser can open is a **WebSocket** connection: a two-way connection that starts like an ordinary HTTP request. That's why MQTT has a "second lane": MQTT wrapped in WebSocket, with an address that starts with `ws://` (or `wss://`, which is encrypted).

In Mosquitto, that lane is opened with just two extra lines in the configuration file, for example:

```text
listener 9001
protocol websockets
```

Public brokers offer it too, for example `broker.emqx.io` on door 8083 (path `/mqtt`). MQTTX can use this lane through the `ws://` option in the **Host** field. PubSubClient3 on the ESP32 can't, and doesn't need to: the ESP32 keeps using door 1883. The WebSocket lane only matters when a dashboard in a browser wants to read data straight from the broker. In this curriculum, the Module 22 dashboard gets its data through the backend, so it's enough to know that this lane exists.

</details>

<details>
<summary><b>Why a 15-second <i>keep-alive</i>, not 60 seconds as in many tutorials</b></summary>

Many tutorials lengthen the *keep-alive* to 60 seconds or more to "save more". For Node 1, that's dangerous, and the reason lies inside the ESP32:

1. **When the Wi-Fi drops, the MQTT connection drops with it, instantly.** As soon as the Wi-Fi drops, the esp32 package clears the ESP32's IP address, and all its TCP connections are canceled right away. On this side, `mqtt.connected()` immediately answers `false`, and Node 1 starts trying again.
2. **A broker that disappears without a trace isn't noticed instantly.** If it's the laptop that disappears, for example because it falls asleep or its power cable gets pulled out, the ESP32 gets no sign at all. It still believes it's connected and keeps publishing `telemetry` every 10 seconds to a connection that is actually already dead.
3. **Those messages pile up in the ESP32's send queue.** That queue has a limit, about 2.9 KB or eight chunks of data. Once it's full, the next send can wait up to about 10 seconds, and Node 1's 5-second watchdog restarts the board.
4. **A 15-second *keep-alive* saves the day.** Without a `PINGRESP` answer, PubSubClient3 notices that the broker has disappeared within 15–30 seconds, when only three to six messages have piled up, long before the queue is full.

With a 60-second *keep-alive*, the queue can fill up first. The same thing happens if immediate sends aren't limited to one every 2 seconds, or if every send is forced to leave on its own. This chain of cause and effect was traced in the source code of the esp32 package and of lwIP (the network stack inside the ESP32); on the workbench, it happens rarely and is hard to trigger on purpose. The safeguards we put in mean you don't need to worry about it.

</details>

---

## 🧩 Independent Challenges

Three levels, starting with the easiest. Do at least Level 1.

> 🖥️ **Tools:** **Arduino IDE**, the Node 1 workbench (MB102 on for the relays), the broker terminal running, **MQTTX**, and **VS Code** with the `mini-smart-home` folder for Level 2. Start from the practice sketch named at each level, then **right away** choose **File → Save As…** and save it in the `module-11` folder under a new name, for example `module11_challenge1`. Your practice sketch stays intact, and the `secrets.h` tab gets copied along.

**Level 1 — A small change: prove the 256-byte container.** Start from `module11_command_ack` (Practice 6). Turn off the `mqtt.setBufferSize(512);` line by adding `//` in front of it, then upload. From MQTTX, send a valid but long command, with one extra field that holds a long sentence, for example `{"id":"c-201","action":"set","target":"lamp","value":true,"note":"…"}` with a `note` of about 200 characters. What happens in the Serial Monitor and on the `ack` topic? Then delete that `//`, upload again, and send the same command with a new `id`. Write in `notes-module11.md`: how long is the longest command that still gets an answer with the 256-byte container? Hint: work out the packet with the formula in Concept 9.

**Level 2 — Combine: automation on the laptop.** Combine Module 4 and Practice 8: write a new Node.js program, `lamp-automation.js`, in the `tools` folder. This program subscribes to `msh/+/telemetry` (on the public broker of the Wokwi path: `msh/` + your `device_id` + `/telemetry`, so your program doesn't command other readers' devices), and every time there's motion **and** the place is dark (`motion` is `true` and `light` is below `1000`), it publishes the command `set lamp true` to the `cmd` topic of the same device, then prints the `ack` that comes back. Hints: copy the `mqtt.connect()`, `subscribe()`, and `on("message", …)` parts from `contract-checker.js`; take the `device_id` from the topic with `topic.split("/")[1]`; make a unique `id` with `"auto-" + Date.now()`; and don't send the same command over and over while the lamp is already on (look at `state` in the `ack`). Test your program with the Practice 7 sketch, not with Node 1 v1.2: Node 1 v1.2 already has its own automatic lamp, and a `set` command from the laptop makes its lamp count as turned on by hand, so the lamp doesn't turn off by itself when nobody's around. This is the seed of the automation in Node-RED (Module 13) and in the backend (Module 16).

**Level 3 — Your own design: the `config` command.** The data contract names a second `action`, `config`, for changing thresholds without uploading the firmware again, for example `{"id":"c-301","action":"config","thresholds":{"soil_watering":35}}`. Starting from `module11_command_ack`, add `config` support for just one threshold, `soil_watering`:

- Refuse with `ok:false` and a clear reason if `thresholds` isn't an object, or if `soil_watering` isn't a whole number from 10 to 90.
- Store a valid threshold in NVS with **Preferences** (Module 8) so it survives a restart, then print it in the Serial Monitor at power-up.
- Put the threshold into the `state` of the `ack`, for example `"soil_watering":35`.

Then think it over and write your answer in `notes-module11.md`: Appendix A asks for `config` to be sent ***retained***. What's the benefit for a device that has just been switched on? One more: why is the `id` memory still safe for a `config` command that comes again after every reconnection? Module 19 discusses the answers.

---

## ➕ Add-on to "Mini Smart Home"

Module 11's contribution to the running project: **Node 1 v1.2**. All of its communication moves to MQTT, following the data contract:

- **`telemetry` every 10 seconds** and **immediately** when something important happens, with all eight fields, and with failed readings written as `null` (Practices 3 and 7);
- **automatic `online`/`offline` status** through a retained message and a *Last Will* (Practice 4);
- **`vitals`** with the signal strength, the time since power-up, and the free memory: once after connecting, then every 5 minutes;
- **commands** for the lamp, the fan, the pump (1–10 seconds, still guarded by Module 6's water tank safety), and the curtain (0–180 degrees), always answered with an **`ack`** (Practice 6);
- it **never gets stuck** when the broker is down, and the display says `WiFi ok, MQTT ok` or `WiFi ok, MQTT down` (Concept 10).

The web server with the `/on` and `/off` links, the address `node1.local`, and the HTTP sends to `webhook-receiver.js` are **retired**. The Wi-Fi through the portal, the internet clock, and the reconnect guard from Module 10 stay in use as they are.

Node 1 still consists of **26 files**. The truly new content is in just one file, `networking.cpp`; five other files change only a little, and the remaining twenty files don't change at all. To keep things simple, the three files whose only change is in their comments are replaced whole, together with `networking.cpp` (step C).

> 🖥️ **Tools used:** **Arduino IDE** (with the **PubSubClient3** library from the Quick Win, plus **WiFiManager** and **ArduinoJson** from Module 10), **VS Code** with the broker terminal and the checker, **MQTTX**, **GitHub Desktop**, the complete workbench with the MB102 and Node 1's charger, and the diagram from Practice 9. In Wokwi, open your own Node 1 Wokwi project from the ➕ of Modules 8–10, which holds all the Node 1 files, not the practice project of Practices 3–7, which holds only one sketch. In that project, copy the contents of [`diagram.json`](code/node-1-home/diagram.json) and [`libraries.txt`](code/node-1-home/libraries.txt) from this module's `code/` folder, replace its `macAddress` as at the start of 🔧, then change `USE_WOKWI` to `true` (step B). That way, Node 1 connects to `Wokwi-GUEST` and to the public broker `broker.emqx.io`, while `BROKER_ADDRESS` is ignored. Don't have that project yet? Create all the other files through **▾ → New file...** and fill them from the [`code/node-1-home/`](code/node-1-home/) folder, as in Module 8's ➕.
>
> ⭐ **Required** — part of the completion requirements: a command from MQTTX turns on a relay and gets an `ack` back in less than 1 second (step E), Node 1's `telemetry` passes the contract checker (step F), and your project's *pub/sub* diagram is drawn on paper (step H).

![Map of Node 1 v1.2's 26 files: one file rewritten, five changed a little, the rest as before; REWRITTEN means new content, CHANGED means changed a little, COMMENTS (shortened to COMM.) means comments only, and a file without a badge doesn't change. At the top, config.h marked CHANGED: version 1.2.0 and the "Module 11: MQTT" section. In the middle, node-1-home.ino marked COMMENTS: version, library list, "Modules 10-11" notes. Left, senses and hands: sensors.h/.cpp (five sensors) and actuators.h/.cpp (relays, pump, servo, buzzer); interface: button.h/.cpp (short and long press), heartbeat.h/.cpp (status LED), display.h/.cpp marked COMM. (only the .cpp: the Wi-Fi line "WiFi ok, MQTT ok"), and commands.h/.cpp marked COMM. (only the .cpp: the "send" note). Right, brain and records: rules.h/.cpp (automatic watering and lamp) and card.h/.cpp (microSD CSV, optional); endurance: settings.h/.cpp (NVS: threshold, boot count), system.h/.cpp (uptime, restart reason), and logger.h/.cpp (DEBUG/INFO/ERROR logs), all without a badge. Bottom, networking.cpp marked REWRITTEN (plus comments in networking.h): kept from Module 10, Wi-Fi, the portal, the reconnect guard, and the internet time; new, the MQTT connection, the offline last will, and the retained online (P3–P4); new, telemetry every 10 s and immediately when it matters (P3, P7), vitals every 5 minutes; new, cmd to ack for the lamp, fan, pump, and curtain (P6); retired, the HTTP sends, the /on /off web server, and node1.local. A dashed line means #include; PIN-MAP.md doesn't change because MQTT uses no pins](assets/node1-v12-file-map.png)

| File | What changes | How |
| :--- | :--- | :--- |
| `networking.cpp` | **rewritten**: HTTP and the web server are replaced by MQTT (connection, status, `telemetry`, `vitals`, commands and `ack`) | replace all of its contents (step C) |
| `networking.h` | comments only | replace all of its contents (step C) |
| `config.h` | version `1.2.0`, the "Module 10: network" section shortened, and the new "Module 11: MQTT" section | change two parts; your calibration numbers stay (step B) |
| `node-1-home.ino` | comments only: the version, the library list, and the "Modules 10-11" notes | replace all of its contents (step C) |
| `commands.cpp` | only the comment of the `send` command | replace all of its contents (step C) |
| `display.cpp` | only the comment of the Wi-Fi line | one line, may be skipped (step C) |

`PIN-MAP.md` doesn't change: MQTT uses no pins.

### A. Prepare the broker, the checker, and the board

1. **Laptop:** start the broker (Practice 1.3). Then open a new terminal (**Terminal → New Terminal**), type `cd tools`, and run the checker with `node contract-checker.js` (Practice 8.3). In MQTTX, open the **Laptop broker** connection with the `msh/#` subscription. As long as your board still runs a practice sketch, the checker logs **FAIL** for its `telemetry`; that's normal until Node 1 v1.2 is uploaded in step D. **In Wokwi**, run the checker with the public broker and your `device_id`, for example `node contract-checker.js broker.emqx.io 240ac45e114b`, then use the MQTTX **Public broker** connection with the subscription `msh/` + your `device_id` + `/#`.
2. **The Node 1 board:** if it's still running on its charger, move it to the laptop in the order of the golden rules: **turn off the MB102**, unplug the USB from the charger, plug it into the laptop, then turn on the MB102.
3. **Open your Node 1:** **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home** → `node-1-home.ino`. Make sure the selected board is **ESP32 Dev Module**, with **Partition Scheme** **Minimal SPIFFS** and **Flash Mode** **DIO** (section ➕ A of Module 10).

### B. Change `config.h`

1. **The firmware version.** In the **`config.h`** tab, change `"1.1.0"` on the `FIRMWARE_VERSION` line to `"1.2.0"`.
2. **The network section.** Scroll to the very bottom. Select all the lines from `// ---------- Module 10: network ----------` to the end of the file, then replace them with this section:

   ```cpp
   // ---------- Module 10: network ----------
   const bool USE_WOKWI = false;              // true ONLY in Wokwi: Wokwi-GUEST without the portal, public broker
   const char DEVICE_NAME[] = "node1";        // the name in the router's device list
   const char PORTAL_NAME[] = "Node1-Home";   // temporary WiFi name while the portal is open
   const unsigned long PORTAL_TIMEOUT = 180;  // seconds: the portal closes by itself when unused
   const char TIME_ZONE[] = "WIB-7";          // WITA: "WITA-8", WIT: "WIT-9" (Module 10, Practice 5)

   // ---------- Module 11: MQTT ----------
   const char BROKER_ADDRESS[] = "192.168.1.10";  // REPLACE with your laptop's IP address (the Mosquitto broker, Practice 1)
   const uint16_t BROKER_PORT = 1883;
   const unsigned long SEND_INTERVAL = 10000;     // telemetry every 10 seconds, plus immediately when something important happens
   const unsigned long VITALS_INTERVAL = 300000;  // vitals (Node 1's health) every 5 minutes
   ```

   Two old lines are deliberately gone from the Module 10 section: `SERVER_ADDRESS` (the HTTP sends are retired) and `SEND_INTERVAL`, which moved to the Module 11 section with a new number, 10 seconds.
3. **Replace `192.168.1.10`** on the `BROKER_ADDRESS` line with your laptop's IP address, the laptop where Mosquitto runs. Write only the IP address, without `mqtt://` and without a port number.
4. Live in the WITA or WIT time zone? Change `TIME_ZONE` again as in Module 10. **In Wokwi**, change `USE_WOKWI` to `true`; on a real board, leave it `false`.

Your Module 6 calibration numbers and your rules at the top of `config.h` aren't touched.

### C. Replace four files and change `display.cpp`

1. **`networking.cpp`, `networking.h`, `node-1-home.ino`, and `commands.cpp`**: these four files don't hold any design of your own, so their contents are replaced completely. For each file, click its tab, empty it (**Ctrl + A**, then **Delete**), then paste the new version: right-click the file's name below → **Open link in new tab**, click **Copy raw file**, go back to Arduino IDE, then paste (**Ctrl + V**).
   - [`networking.cpp`](code/node-1-home/networking.cpp)
   - [`networking.h`](code/node-1-home/networking.h)
   - [`node-1-home.ino`](code/node-1-home/node-1-home.ino) (in Wokwi: the **`sketch.ino`** tab)
   - [`commands.cpp`](code/node-1-home/commands.cpp). Ever added commands of your own, for example from Module 8's 🧩? Copy your part first, then paste it back in afterward.

   > 📝 Before 19 October 2026, `networking.h` and `networking.cpp` were called `network.h` and `network.cpp`. If your tabs still have the old names, rename them first, as the note in [Module 10](../module-10-wifi-and-http/README.md#b-create-two-new-files-and-change-configh) explains.
2. **`display.cpp`** (may be skipped, comments only): press **Ctrl + F**, search for `Module 10: Node 1's IP address`, then replace the comment after `//` on that line with `// Module 11: for example "WiFi ok, MQTT ok"`.
3. **In Wokwi**, make sure the `libraries.txt` tab holds the line `PubSubClient3@3.3.2`, and the `diagram.json` tab holds your own chosen `macAddress` (the 🖥️ box at the start of section ➕). Without your own `macAddress`, your simulated Node 1 uses the `device_id` `240ac4000110`, the same as other readers, and you push each other out on the public broker.

**Check before you go on:** there are still **26** tabs (in Wokwi, the `diagram.json` tab and the library tab don't count), the main tab's first line says `firmware v1.2.0 (Module 11)`, and the `networking.cpp` tab holds the line `#include <PubSubClient.h>`.

### D. Verify, Upload, and watch Node 1 greet the broker

1. Click **Verify**. If an error appears, read the **first error message** and compare the tab it names with the [reference version](code/node-1-home/). The **Output** panel says something like `Sketch uses 1188044 bytes (60%) of program storage space. Maximum is 1966080 bytes.` Node 1 v1.2 is actually **about 125 KB smaller** than v1.1, because the HTTPClient, WebServer, and mDNS libraries aren't used anymore.
2. Click **Upload**, then open the **Serial Monitor**.

   **Expected output** (example; the reading lines every 2 seconds aren't quoted):

   ```text
   [00:00:00] INFO  Node 1 Home - firmware 1.2.0
   [00:00:00] INFO  Last restart reason: POWERON
   [00:00:00] INFO  Boot #16. soil_watering threshold: 35 % (from NVS)
   [00:00:01] INFO  microSD card ready: readings are logged to node1.csv every 30 seconds.
   [00:00:01] INFO  device_id a4cf12e5b7c0
   [00:00:01] INFO  Connecting to the saved WiFi "OurHome" (without waiting)...
   [00:00:01] INFO  Watchdog active: automatic restart if loop() is stuck for more than 5 seconds.
   [00:00:03] INFO  WiFi connected to "OurHome": IP 192.168.1.23, signal -58 dBm
   [00:00:03] INFO  MQTT connected to broker 192.168.1.10:1883 in 37 ms, as a4cf12e5b7c0
   [00:00:08] INFO  Clock set from the internet: 2026-10-18T02:05:31Z
   [00:00:09] INFO  Published telemetry (10-second schedule)
   [00:00:19] INFO  Published telemetry (10-second schedule)
   ```

   In MQTTX, these appear one after another: `online` on the `status` topic (labeled **Retained** if the subscription was made afterward), one `vitals` message, then `telemetry` every 10 seconds with `"fw":"1.2.0"`. The checker's terminal prints **PASS** for each of those messages. The **FAIL** lines from before the upload finished come from the practice sketch that was still running (Practice 7 or your challenge sketch, whose fields aren't complete); just ignore them, because the count starts again in step F.
3. Type `wifi` in the Serial Monitor:

   **Expected output** (example):

   ```text
   wifi: connected to "OurHome", IP 192.168.1.23, signal -57 dBm
   wifi: device_id a4cf12e5b7c0, name node1, time 2026-10-18T02:06:02Z
   mqtt: connected to 192.168.1.10:1883 as a4cf12e5b7c0
   mqtt: telemetry every 10 seconds and immediately when something important happens, vitals every 5 minutes, published 4 times
   ```

4. Hold the D13 button for 1 second to open the status page on the OLED display: its fifth line now says `WiFi ok, MQTT ok`.

### E. ⭐ Commands from MQTTX: the relay switches on, `ack` under 1 second

Leave the checker running; it's the one that measures the time. From MQTTX's send box (**JSON** format, **QoS 1**, **Retain** unticked), send to your Node 1's `msh/<device_id>/cmd` topic, one at a time, each with a new `id`:

1. `{"id":"c-101","action":"set","target":"lamp","value":true}`: the lamp relay goes "click", and its indicator LED lights up.
2. `{"id":"c-102","action":"set","target":"fan","value":true}`, then `{"id":"c-103","action":"set","target":"fan","value":false}`: the fan spins, then stops.
3. `{"id":"c-104","action":"set","target":"curtain","value":90}`: the curtain servo turns to 90 degrees.
4. **First point the end of the hose at a pot or a glass**, then send `{"id":"c-105","action":"set","target":"pump","value":3}`: the pump runs for 3 seconds, then turns off by itself.
5. Turn the lamp off again: `{"id":"c-106","action":"set","target":"lamp","value":false}`.

**Expected output in the checker's terminal** (example):

```text
[9:07:10 AM] msh/a4cf12e5b7c0/cmd  PASS
[9:07:10 AM] msh/a4cf12e5b7c0/ack  PASS  (answered 236 ms after the command: under 1 second)
[9:07:14 AM] msh/a4cf12e5b7c0/telemetry  PASS
[9:07:22 AM] msh/a4cf12e5b7c0/cmd  PASS
[9:07:22 AM] msh/a4cf12e5b7c0/ack  PASS  (answered 188 ms after the command: under 1 second)
[9:07:24 AM] msh/a4cf12e5b7c0/telemetry  PASS
[9:07:39 AM] msh/a4cf12e5b7c0/cmd  PASS
[9:07:39 AM] msh/a4cf12e5b7c0/ack  PASS  (answered 251 ms after the command: under 1 second)
```

**The first completion requirement is met: a command from MQTTX turns on the relay and gets an `ack` back in less than 1 second.** In Wokwi, the checker's number goes up and down around 1 second (in this module's tests, about 700–1,300 ms; the checker starts counting when the command passes through the broker, so its number is a little smaller than the 1–2 seconds you feel in MQTTX), because the command and its answer cross the internet (Concept 8): sometimes it says `under 1 second`, sometimes `MORE than 1 second`. That number doesn't measure your Node 1, so the under-1-second requirement can only be proven with the real board and the broker on the laptop. Also look at the `state` in every `ack`: all four actuators are always reported, including `"pump":true` while the pump runs. Also try a wrong command, for example `"value":15` for the pump: Node 1 refuses it with `"message":"pump value must be 1-10 seconds"`. The checker also marks that command **FAIL**, because its value is outside the contract, while the refusing `ack` still gets a **PASS**.

### F. ⭐ The contract checker: everything PASSES

1. Start the checker's count from zero: stop it with **Ctrl + C** (ignore the `Summary` it prints at that moment), then run it again with **↑** and **Enter**. Let the checker run for at least 1 minute without commands. Every `telemetry` and `status` from Node 1 must **PASS**; `vitals` appears again within 5 minutes at the latest and must also **PASS**.
2. Wave your hand in front of the PIR and cover the LDR: immediate sends appear outside the 10-second schedule, and they still **PASS**. The Serial Monitor logs their reasons, for example `Published telemetry (motion detected)`.
3. **Turn off the MB102** (the USB stays plugged in, so Node 1 keeps running and sending), then briefly unplug the DHT22 data wire from D14, as in Practice 3. `temperature` and `humidity` become `null`. The HC-SR04 goes dark together with the MB102, so `water_level` becomes `null` too, and the PIR reading may change. The message **still PASSES**: failed readings written as `null` follow the contract. Plug the wire back in, then turn the MB102 on again. In Wokwi, wires can't be unplugged while the simulation runs; skip this step.
4. Stop the checker with **Ctrl + C**, then copy the `Summary` line into `notes-module11.md`. Because the count started again in step 1 and you didn't send any handmade messages, the summary should end with `0 messages FAIL.` If there's still a FAIL, read its reasons in the lines above it: every message from Node 1 must pass.

**The second completion requirement is met: Node 1's `telemetry` passes the Appendix A format check.**

### G. Status test: Node 1 runs out of power

1. **Move Node 1 to its charger**, as at the end of Module 10's ➕: **turn off the MB102** → unplug the USB from the laptop → plug the cable labeled **ESP32** into the charger → **only then** turn on the MB102. If you have a regulated microSD module connected, press **EN** afterward, as in Module 10. A few seconds later, MQTTX shows `online`.
2. In the terminal, become a status subscriber: `mosquitto_sub -v -t "msh/+/status"`. **In Wokwi**, use the public broker and your `device_id`, for example `mosquitto_sub -h broker.emqx.io -v -t "msh/240ac45e114b/status"`; skip steps 1 and 4, and in step 3 just stop the simulation: the public broker publishes `offline` too (in this module's tests, about 17–27 seconds later). The bonus in step 5 can only be tried on the real board, because you can't stop the public broker.
3. Get your stopwatch ready. **Turn off the MB102**, then unplug Node 1's charger from the wall outlet as you start counting. Within **13–23 seconds**, the terminal prints `msh/<device_id>/status offline`. Not a single line of code in Node 1 publishes `offline`: it's the broker itself that publishes its last will.
4. Plug the charger back in, then turn on the MB102 (regulated microSD module: press **EN** afterward). The status goes back to `online`.
5. **Bonus: the broker is down, Node 1 keeps working.** Stop the broker on the laptop (**Ctrl + C**) for 1 minute. Node 1 keeps reading the sensors, watering, and turning on the automatic lamp; its status page says `WiFi ok, MQTT down`. Start the broker again: within 5 seconds, Node 1 reconnects, publishes `online`, and carries on with its sends. In MQTTX, click **Connect** on the **Laptop broker** connection again: about 4 seconds after the broker was stopped, MQTTX tried to reconnect once, was refused, then stopped trying by itself.

Node 1 v1.2 now works permanently from its charger. Its sends can only be seen while the broker on the laptop is running; in Module 12, the broker moves to a Raspberry Pi that's always on.

### H. ⭐ The diagram, `DATA-CONTRACT.md`, and saving to GitHub

1. **The *pub/sub* diagram.** Compare your diagram from Practice 9 with the Node 1 v1.2 you just ran: add the `vitals` topic if it isn't there yet, and write next to the `cmd` arrow that this one topic carries the commands for all four actuators: the lamp, the fan, the pump, and the curtain. **The third completion requirement is met: you can draw your project's *pub/sub* diagram on paper.**
2. **`mini-smart-home`**: in GitHub Desktop, choose the **`mini-smart-home`** repository. The **Changes** list holds the changes in `firmware/node-1-home` (`networking.cpp`, `networking.h`, `config.h`, `node-1-home.ino`, `commands.cpp`, and maybe `display.cpp`), plus `DATA-CONTRACT.md`, `edge/mosquitto-lan.conf`, `tools/contract-checker.js`, `tools/package.json`, and `tools/package-lock.json`. That last file was made by `npm install` and records the exact version of every library; save it too. The `node_modules` folder doesn't appear, because `.gitignore` guards it. **Check the contents of `config.h` in the right panel:** there's no password of any kind there, only your laptop's IP address. Fill in **Summary** with `Node 1 v1.2: all communication over MQTT (Module 11)`, click **Commit … to main**, then **Push origin**.
3. First complete this evidence table in `notes-module11.md`; you commit it in step 4:

| Evidence | Your result |
| :--- | :--- |
| Node 1's `device_id` and the broker's address | |
| The checker's line for one `ack` (step E): `answered … ms` | |
| The checker's `Summary` line (step F) | |
| Status test: how many seconds until `offline` appeared (step G) | |
| Program size in the **Output** panel (`Sketch uses … bytes`, maximum 1,966,080) | |
| Photo of the *pub/sub* diagram (`pubsub-diagram.jpg`) | |

4. **`learn-iot`**: make sure the `module-11` folder holds all six of this week's practice sketches (`module11_hello_broker`, `module11_telemetry`, `module11_online_status`, `module11_qos`, `module11_command_ack`, and `module11_send_immediately`), your challenge sketch, `notes-module11.md`, and `pubsub-diagram.jpg`. Choose the **`learn-iot`** repository in GitHub Desktop, then check once more: **no `secrets.h`** in the **Changes** list. Fill in **Summary** with `Module 11: MQTT, data contract, and Node 1 v1.2`, then click **Commit … to main** and **Push origin**.

---

## 📖 Glossary

| Term | Short meaning |
| :--- | :--- |
| **MQTT** | A protocol (a set of rules) for sending messages through one go-between, the broker. Light, two-way, and able to survive dropouts; the "official language" of the IoT world. |
| **Broker** | MQTT's "post office": it receives messages from publishers, then passes them on to all the subscribers of that topic. This week: Mosquitto on the laptop. |
| **Client** | Every program or device that connects to the broker, for example the ESP32, MQTTX, and the contract checker. |
| ***Publish/subscribe*** (*pub/sub*) | How MQTT works: publishers and subscribers don't know each other; both only know the broker and the topic's name. |
| **Publish** | To send a message to a topic. |
| **Subscribe** | To ask the broker to pass on every message on a certain topic. |
| **Topic** | A message's address, with levels separated by `/`, for example `msh/a4cf12e5b7c0/telemetry`. Upper and lower case are different. |
| ***Wildcard*** | Only for subscribing: `+` stands for exactly one level, `#` stands for that level and everything below it. |
| **`$SYS`** | A special topic where the broker reports its own state, for example the number of clients. Not caught by `#`. |
| **Mosquitto** | An open-source MQTT broker program from the Eclipse Foundation. |
| **Local only mode** | The default state of Mosquitto 2.x without a configuration file, or with a file that has no `listener` line: it only serves clients on the same computer. |
| **`listener` and `allow_anonymous`** | Two Mosquitto configuration lines: they open the door to the network, and allow clients without a username and password. |
| **Port 1883** | The official door number of unencrypted MQTT. Encrypted MQTT uses 8883. |
| **TCP connection** | The send-and-receive lane that is opened first between two devices on a network. MQTT and HTTP run on top of it. |
| **MQTTX** | An app on the laptop for peeking at MQTT messages and sending them. |
| **`mosquitto_sub` / `mosquitto_pub`** | Two terminal programs that are installed together with Mosquitto: a simple subscriber and a simple publisher. |
| ***Client ID*** | Every client's unique name on the broker. Two clients with the same name push each other out. Node 1 uses its `device_id`. |
| **QoS** (*Quality of Service*) | How hard the broker and the clients try to deliver a message: 0 regular mail, 1 registered mail (can arrive twice), 2 a courier who wants a signature (exactly once). |
| **`PUBACK`** | The receipt for a QoS 1 message. |
| **Persistent session** (*clean session* = `false`) | The broker remembers a client's subscriptions and keeps QoS 1 messages for it while that client is away. |
| ***Retained* message** | "The notice board": the last message on a topic, which the broker keeps and hands straight to new subscribers. |
| ***Last Will*** | "The last will": a message a client leaves with the broker, which the broker publishes if that client disappears without saying goodbye. The basis of the automatic `offline` status. |
| ***Keep-alive*** (the heartbeat) | A client's promise to send something at least every so many seconds. The broker gives up after 1.5 times that. |
| **`PINGREQ` / `PINGRESP`** | The two-byte heartbeat packets: "I'm still here" and its answer. |
| **Data contract** | The written agreement about the names of the topics and the shape of the message contents (Appendix A, `DATA-CONTRACT.md`). |
| **`telemetry`, `status`, `vitals`, `cmd`, `ack`** | Each device's five kinds of message: sensor readings, on or off, health, commands, and answers to commands. |
| **`ack`** (*acknowledgement*) | A device's answer to one command, with the same `id`, `ok`, `state`, and a `message` if the command was refused. |
| ***Report-by-exception*** (immediate send) | Sending right away when something important happens, outside the fixed schedule. |
| ***Idempotent*** | The property of a command whose result is the same even if it's carried out twice. Node 1 achieves it by ignoring repeated `id`s. |
| **`null`** | The JSON value that means "no number". Used for sensor readings that failed. |
| **Message container** (buffer) | The library's memory space for one MQTT packet. Its default size is 256 bytes; incoming packets bigger than that are silently thrown away. Made bigger with `setBufferSize()`. |
| **PubSubClient3** | The MQTT library for the ESP32 that we use; the successor of PubSubClient 2.8, which is no longer maintained. |
| **`mqtt`** (Node.js library) | An MQTT client for Node.js programs, installed with `npm install`. The contract checker uses it. |

---

## 📝 5-Question Quiz

1. (a) Use the WhatsApp group analogy to explain what happens when Node 1 publishes `telemetry` and MQTTX and the contract checker both subscribe to `msh/#`. Name the roles of the broker, the topic, the publisher, and the subscribers. (b) A friend says, "For the laptop to turn on Node 1's lamp over MQTT, Node 1 has to become a web server, as in Module 10." Is that true? Explain.
2. The broker receives five messages with these topics: `msh/a4cf12e5b7c0/telemetry`, `msh/240ac45e114b/status`, `msh/A4CF12E5B7C0/status`, `/msh/a4cf12e5b7c0/status`, and `$SYS/broker/clients/connected`. (a) Which messages does a subscriber to `msh/+/status` receive? What about a subscriber to `#`? (b) Your friend's firmware publishes to `msh/a4cf12e5b7c0/Telemetry`. What shows up in MQTTX, subscribed to `msh/+/telemetry`, and which error message appears?
3. The ESP32 keeps saying `Failed to reach the broker after … ms: could not connect to the broker (code -2)`. MQTTX on the laptop that runs the broker can connect with **Host** `127.0.0.1`, but fails when its **Host** is that same laptop's IP address (as in Practice 2.4). (a) What's the most likely cause, and how do you fix it? (b) If MQTTX connects through both addresses, but the ESP32 still fails, name two possible causes. (c) Why is every connection attempt in Node 1 limited to about 1 second?
4. (a) In Practice 5, why does only the "registered mail" arrive after the ESP32's Wi-Fi is back on? Name two conditions on the ESP32's side that make it possible. (b) Why does Node 1 v1.2 **not** use a persistent session for commands? (c) The `online` status is sent with the retained flag, but a `set` command must not be. Why?
5. Node 1 v1.2 receives `{"id":"c-007","action":"set","target":"fan","value":"true"}`. (a) What does Node 1 do, and what does its `ack` look like? (b) Five seconds later, exactly the same message arrives again. What happens, and why is that behavior important? (c) Why does the data contract write failed readings as `null`, not `-1`?

<details>
<summary><b>Answer key & explanations</b></summary>

1. (a) The broker (Mosquitto) is the **WhatsApp server**, the topic `msh/a4cf12e5b7c0/telemetry` is the **group name**, Node 1 is the **publisher**, which posts a message to the group, and MQTTX and the contract checker are the **subscribers**, the members of that group. Node 1 only has to send one message to the broker; the broker passes it on to both subscribers, without Node 1 knowing who they are (Concept 2). (b) **Not true.** Node 1 itself opens the connection to the broker and keeps it open. A command from the laptop is published to `msh/<device_id>/cmd`, and the broker passes it on through the connection that Node 1 already opened. The only one that must be reachable is the broker (Concepts 1–2).
2. (a) `msh/+/status` receives `msh/240ac45e114b/status` and `msh/A4CF12E5B7C0/status` (`+` accepts anything on that level, including capital letters). `/msh/a4cf12e5b7c0/status` isn't received, because the leading slash makes the first level empty, so the levels shift. `#` receives the first four messages, but **not** `$SYS/…`, because topics that start with `$` are never caught by a wildcard at the front (Concept 4). (b) **Nothing shows up.** `+` does accept `a4cf12e5b7c0`, but the last level must be exactly `telemetry`, and `Telemetry` with a capital letter is a different topic. There's no error message anywhere: the broker accepts the message, finds no subscriber, then silently throws it away. That's why topics are built from variables put together once in `setup()`, and why the contract checker subscribes to `msh/#`, so mistyped topics are still caught.
3. (a) The broker only serves `127.0.0.1`, not the laptop's network address. That's the sign of **local only mode**: Mosquitto was started without `-c mosquitto-lan.conf`. Run `mosquitto -v -c mosquitto-lan.conf`, with a `mosquitto-lan.conf` file that holds `listener 1883` and `allow_anonymous true` (Concept 3, Practice 1). (b) The broker is already right, so the problem is somewhere between the ESP32 and the laptop. For example: `BROKER_ADDRESS` in the sketch is wrong or the laptop's address has changed, the firewall is blocking (the permission is only for Private, while the Wi-Fi has the Public profile), the ESP32 and the laptop are on different networks, or a VPN is on. (c) The default limits can be 3 seconds to open the connection and 15 seconds to wait for the broker's answer, far beyond the 5-second watchdog. Without the 1-second limit (`setConnectionTimeout(1000)` and `setSocketTimeout(1)`), a stuck broker could make Node 1 restart over and over (Concept 10).
4. (a) The broker only keeps QoS 1 messages for a client that's away, and a QoS 1 message that was already sent to a dead connection is sent again, because its receipt never came; QoS 0 messages are neither kept nor sent again. The two conditions on the ESP32's side: (1) it connects with a **persistent session** (*clean session* = `false`), using a client name that's **always the same**, and (2) it subscribes with **QoS 1** (Concept 6, Practice 5). (b) Commands that pile up while Node 1 is off, for example "pump 10 seconds" five times, would all be carried out at once as soon as Node 1 is switched on. For actuators, a stale command is more dangerous than a lost one: a lost command can be repeated by its sender after it sees that no `ack` came. (c) The status is a state that holds until it's replaced, so new subscribers need to know it right away. A retained `set` command would be handed over again every time Node 1 connects, so a relay could move by itself, for example every time Node 1 restarts and its `id` memory is empty (Concept 7).
5. (a) `"true"` is **text**, not the value `true`. Node 1 checks its type with `is<bool>()`, refuses it, and answers `{"id":"c-007",…,"ok":false,"message":"fan value must be true or false","state":{…}}`. Without that check, `as<bool>()` treats any text as true, including `"false"` (Concept 8). (b) Node 1 recognizes `c-007` as an `id` it has already received (even though it was refused), then ignores it without sending a second `ack`. The same message can arrive twice because QoS 1 may deliver it again, or because a command was sent retained by mistake; ignoring repeats makes commands *idempotent*, so a command like "pump 3 seconds" isn't carried out twice (Concepts 5 and 8). (c) `-1` can be read as a real number and get counted, for example lowering the average humidity. `null` clearly means "no number", and both the database and the charts later understand what it means (Concept 5).

</details>

---

## ✅ Module 11 Completion Checklist

Check them all before you move on to Module 12:

- [ ] I can explain *publish/subscribe* with the WhatsApp group analogy, and the three weaknesses of HTTP that MQTT solves (Concepts 1–2).
- [ ] Mosquitto runs on the laptop with `mosquitto-lan.conf`, is allowed through the firewall only for private networks, and there's only **one** broker (Practice 1).
- [ ] I've sent messages through `mosquitto_pub`, `mosquitto_sub`, and MQTTX, including with the `+` and `#` *wildcards* (Practice 2).
- [ ] The ESP32 publishes JSON `telemetry` to the laptop broker, and failed readings are written as `null` (Practice 3).
- [ ] The `online` and `offline` statuses appear automatically in MQTTX, and I know why `offline` takes about 13–23 seconds (Practice 4).
- [ ] I've seen it for myself: after the Wi-Fi is back on, only the QoS 1 message arrives (Practice 5).
- [ ] Commands from MQTTX are answered with an `ack`, wrong commands are refused with their reasons, and repeated `id`s are ignored (Practice 6).
- [ ] Motion and dark-bright changes are sent immediately, at least 2 seconds apart (Practice 7).
- [ ] The contract checker runs on my laptop (Practice 8), and `DATA-CONTRACT.md` is in the `mini-smart-home` repository (Practice 9).
- [ ] ⭐ **A command from MQTTX turns on the relay and gets an `ack` back in less than 1 second** (➕ E).
- [ ] ⭐ **Node 1 v1.2's `telemetry` PASSES the contract checker** (➕ F).
- [ ] ⭐ **I can draw my project's *pub/sub* diagram on paper** (Practice 9, ➕ H).
- [ ] Node 1 v1.2 shows `offline` when it runs out of power, and keeps working when the broker is stopped (➕ G).
- [ ] Node 1 v1.2, `DATA-CONTRACT.md`, `edge/mosquitto-lan.conf`, and the contract checker are committed and pushed to `mini-smart-home`; the sketches, `notes-module11.md`, and the diagram photo to `learn-iot`, without a single `secrets.h`.
- [ ] ⭐ **Quiz: at least 4 of 5 correct.**

**You pass when** (according to the Syllabus): *you can draw your project's pub/sub diagram on paper, a command from MQTTX turns on the relay and gets an `ack` back in < 1 second, and your `telemetry` payload passes the Appendix A format check.*

Congratulations — Node 1 now speaks the official language of the IoT world, with a data contract that will be used until the end of the curriculum. One weakness remains: the post office is on the laptop. As soon as the laptop sleeps or is taken away, all the messages stop. In **Module 12**, we set up a **Raspberry Pi** as a gateway that's always on, learn the basics of Linux, and move Mosquitto there.

---

## 📚 Sources & Image Credits

**Documentation, source code, and test results used** (accessed October 2026):

- MQTT: [MQTT Version 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) and [MQTT Version 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) (OASIS): topics and *wildcards*, QoS 0/1/2, persistent sessions, retained messages, the *Last Will*, the *keep-alive* and its factor of 1.5, and duplicate client names; a short history from [mqtt.org](https://mqtt.org/faq/).
- Mosquitto: the [download](https://mosquitto.org/download/) page, [Authentication methods](https://mosquitto.org/documentation/authentication-methods/) (local only mode, `listener` and `allow_anonymous`), and the [mosquitto](https://mosquitto.org/man/mosquitto-8.html), [mosquitto.conf](https://mosquitto.org/man/mosquitto-conf-5.html), [mosquitto_pub](https://mosquitto.org/man/mosquitto_pub-1.html), and [mosquitto_sub](https://mosquitto.org/man/mosquitto_sub-1.html) manuals; the source code of [Mosquitto 2.1.2](https://github.com/eclipse-mosquitto/mosquitto/tree/v2.1.2) (the log texts at startup and when clients come and go, Windows staying quiet without `-v`, keeping messages for clients that are away, and the Windows installer and service); the [Homebrew](https://formulae.brew.sh/formula/mosquitto) formula and the [Debian](https://packages.debian.org/source/sid/mosquitto)/[Ubuntu](https://launchpad.net/ubuntu/+source/mosquitto) packages.
- ESP32 libraries: [PubSubClient3](https://github.com/hmueller01/pubsubclient3/tree/v3.3.2) 3.3.2 by Holger Mueller (the message container, the time limits, `connect()`, `publish()`, `subscribe()`, the `state()` codes), [PubSubClient](https://github.com/knolleary/pubsubclient) 2.8 by Nick O'Leary (the "not maintained" note in its README), and [ArduinoJson](https://arduinojson.org/v7/) 7.4.3 (`deserializeJson()`, `is<bool>()`, `as<bool>()`, `null`).
- The source code of [arduino-esp32](https://github.com/espressif/arduino-esp32/tree/3.3.12) 3.3.12: `NetworkClient` (`setConnectionTimeout()`, the 3-second time limit, sends that can wait), the order of events when the Wi-Fi drops, and `sdkconfig` (the 5-second watchdog, the size of the TCP queue, esp-mqtt without MQTT 5); the [ESP-MQTT](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/protocols/mqtt.html) documentation of ESP-IDF 5.5.
- [MQTTX](https://mqttx.app) 1.13.1 by EMQ: the [download page](https://mqttx.app/downloads) and the [source code](https://github.com/emqx/MQTTX/tree/v1.13.1) (the labels of the connection form, the subscriptions, the send box, **Retained**, and **Clear Retained Message**, plus how it reconnects after the broker stops, and the **Retain** box that **Clear Retained Message** ticks along with it).
- [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1 (`mqtt` on npm): the `connect()` options and the `error`, `close`, and `message` events; how Node.js 24 behaves when the broker stops, from the [Node.js documentation](https://nodejs.org/docs/latest-v24.x/api/).
- Public brokers: [EMQX Public MQTT Broker](https://www.emqx.com/en/mqtt/public-mqtt5-broker) (`broker.emqx.io`), [HiveMQ MQTT Dashboard](https://www.mqtt-dashboard.com/) (`broker.hivemq.com`), and [test.mosquitto.org](https://test.mosquitto.org/). How `broker.emqx.io` and `broker.hivemq.com` keep QoS 0 and QoS 1 messages was tested directly with MQTT.js on October 18, 2026.
- Wokwi: [ESP32 WiFi Networking](https://docs.wokwi.com/guides/esp32-wifi) (outgoing connections only, `Wokwi-GUEST`) and [ESP32 Simulation](https://docs.wokwi.com/guides/esp32) (the `macAddress` attribute).
- Microsoft: [Windows Firewall rules](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/rules), [sc.exe config](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sc-config), [Get-NetTCPConnection](https://learn.microsoft.com/en-us/powershell/module/nettcpip/get-nettcpconnection), [the *stealth mode* of the Windows firewall](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/disable-stealth-mode) (no reply for doors that nothing serves), plus PowerShell's quoting rules, [about_Quoting_Rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules) and [about_Parsing](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing).

**Images.** The original diagrams and illustrations are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-11`, `letter-vs-group`, `pubsub-group`, `mosquitto-door`, `topic-tree`, `contract-five-topics` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The Mosquitto warning text from the Mosquitto 2.1.2 source code; the topics and message contents follow the Appendix A data contract; the addresses and the `device_id` are only examples. | CC BY 4.0 |
| `qos-three-levels`, `retained-will-heartbeat`, `when-to-send`, `command-ack`, `buffer-256`, `never-stuck` (`.png` + `.svg`) | Original diagrams. The packet flows from the MQTT 3.1.1 standard; the *keep-alive*, container, and time-limit numbers from the source code of PubSubClient3 3.3.2 and the esp32 package 3.3.12; the round-trip times in Wokwi from this module's tests. | CC BY 4.0 |
| `node1-v12-file-map`, `project-pubsub-diagram` (`.png` + `.svg`) | Original diagrams; the file contents and topics from Node 1 v1.2 in the `code/` folder and the Appendix A data contract. | CC BY 4.0 |
| `mqttx-quick-win`, `mqttx-laptop-connection` (`.png` + `.svg`) | Original illustrations of the MQTTX 1.13.1 interface, not screenshots; the interface labels from the [MQTTX](https://github.com/emqx/MQTTX) source code (© EMQ Technologies, Apache 2.0 license); the topic code, the client name, and the times are only examples. | CC BY 4.0 for the layout and markers |

All the sketches in this module have been compiled with version 3 of the esp32 package and run in Wokwi with a public broker. The **Expected output** box marked **Wokwi recording** (Quick Win) comes straight from the simulator. The boxes marked **example** in Practices 3–7 and the ➕ section use exactly the same line layout as the Wokwi recordings and the sketch code, but their Wi-Fi names, IP addresses, `device_id`, and numbers are replaced with examples from a home network, because Wokwi can't reach the broker on your laptop. The `npm install` output was recorded from the real program on Node.js 24. The layout of the contract checker's output was also recorded from the real program (with a public broker), but its `device_id`, broker address, times, and millisecond numbers are replaced with examples. The output of Mosquitto, `mosquitto_sub`, and `Get-NetTCPConnection` is put together from the Mosquitto 2.1.2 source code and the Mosquitto and Microsoft documentation, not run directly; the number at the start of every line, the ESP32's source port number (for example `57288`), and the `OwningProcess` number are only examples. How long a failure takes on a Windows laptop (about `1001 ms`) is inferred from Microsoft's *stealth mode* documentation, not measured with a real board.

---

[⬅️ Module 10](../module-10-wifi-and-http/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 12 — Raspberry Pi & Linux Basics: A Gateway That's Always On](../module-12-raspberry-pi-and-linux/README.md) ➡️**
