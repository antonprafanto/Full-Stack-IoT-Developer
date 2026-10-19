# Module 13 — Node-RED & Dashboard 2: Your First Dashboard Without Coding

🌐 **English** · [Bahasa Indonesia](../../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md)

*Phase 2 · Week 13 · Hardware: **Kit B** — the Raspberry Pi gateway from Module 12, Node 1 v1.2.1, and a phone connected to the home Wi-Fi, or the **laptop path** without a Pi · Prerequisites: **Module 12** (the gateway and the Mosquitto broker) and **Module 11** (the data contract) · Time: 8–10 hours, spread over the week*

[⬅️ Module 12](../module-12-raspberry-pi-and-linux/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 14 ➡️](../module-14-node-2-esp-now/README.md)

---

In Module 12, Mini Smart Home got a **gateway** that's on 24 hours a day: a Raspberry Pi named `gateway` with the Mosquitto broker inside it. Node 1 reports to it every 10 seconds, and you can peek at the traffic with MQTTX. But try showing MQTTX to the people you live with: rows of JSON like `{"ts":"2026-10-18T01:30:12Z","fw":"1.2.1","temperature":28.5,…}` only make sense to a technician, and turning on the fan means typing a JSON command with a new `id`. This week, the gateway gets its first **face** and its first **brain**: **Node-RED**.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Node 1's readings only show up as JSON in MQTTX or the Serial Monitor. | There's no human-friendly display yet. | A **dashboard** on the phone: gauges, a water tank, a chart, and text (Concept 5, Practices 3–4) |
| Turning on the fan means typing a JSON command in MQTTX, complete with a new `id`. | Commands are still sent by hand. | **Switches and buttons** on the dashboard that build commands according to the data contract (Concept 6, Practice 5) |
| The fan never turns on by itself when the room is hot. | Node 1 only has watering and lamp rules; its fan rule only arrives in Module 19. | **Fan automation** on the gateway, complete with hysteresis so that it doesn't keep switching on and off (Concept 7, Practice 6) |
| Every rule change means writing and uploading a new program. | All the logic is inside the code. | **Node-RED**: flows built by dragging and connecting boxes (nodes), then applied with one click (Concepts 1–4, Practices 1–2) |
| If the gateway's microSD card breaks, all the displays and rules are lost with it. | They aren't saved in the repository yet. | **Flows exported** to `edge/node-red-flows.json` and the gateway recipe updated (Concept 8, Practice 7) |

By the end of the week, Mini Smart Home has **dashboard v0**: one page on the phone that shows all five of Node 1's sensors, the lamp and fan switches, a watering button, and a curtain slider, plus a **fan automation** that runs 24 hours a day on the gateway. Everything is built with **Node-RED**, a low-code tool (one that needs very little code), installed on the same Raspberry Pi as the broker. **Node 1 doesn't change**: it stays v1.2.1 and keeps talking according to the Module 11 data contract. That's the advantage of a contract: new listeners can come along without the device having to change.

![Module 13 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 2 Connectivity, Modules 10 to 15, is highlighted. Modules 1 to 12 are marked done, and Module 13 is marked YOU ARE HERE with the note: the gateway gets a face (a phone dashboard) and a first brain (fan automation). Bottom: the box for this week's Module 13, 8 to 10 hours spread out, Kit B: the Pi gateway from Module 12, Node 1, a phone; ⭐ means required to pass. Left: QW, the Quick Win, Node-RED listens to Node 1; P1, an editor tour and your first flow; P2, a service, listening to Node 1; P3, Dashboard 2 and the temperature gauge ⭐; P4, the full sensor panel. Right: P5, control from the phone ⭐; P6, fan automation with hysteresis ⭐; P7, save the flows to the repository ⭐; P8, laptop path, Node-RED on the laptop; plus, Add-on: dashboard v0 running 24/7 ⭐. Note at the bottom: no Raspberry Pi? On the laptop path, Practice 8 installs Node-RED on the laptop, the other practices use the laptop's address, and the 24-hour test is skipped.](assets/roadmap-module-13.png)

> [!NOTE]
> **How to use this module.**
>
> - **Node-RED runs on the Pi, but you use it from the laptop's browser.** Its editor opens at `http://192.168.1.37:1880`, and its dashboard at `http://192.168.1.37:1880/dashboard`, from the laptop and from the phone alike. Only installation and maintenance use the SSH terminal to the Pi, as in Module 12.
> - **Every command box says where it's used:** **On the Pi** (the SSH terminal, prompt `budi@gateway:~ $`), **On the laptop**, or **In the Node-RED editor** (the browser). The address `192.168.1.37`, the user `budi`, and the `device_id` `a4cf12e5b7c0` are only examples; use your own (your notes from Modules 11–12).
> - **The pictures of the editor and the dashboard in this module are real screenshots** of Node-RED 5.0.8 and Dashboard 2 version 1.33.0. The **Expected output** boxes from the Pi's terminal are still marked **example**, as in Module 12; the numbers, dates, and version numbers on your screen may be different.
> - **No Raspberry Pi yet?** Follow the **laptop path**: Node-RED is installed on the laptop (Practice 8) and uses the Mosquitto broker from Practice 7 of Module 12. No real Node 1 yet? Node 1 in Wokwi uses the public broker `broker.emqx.io`; Node-RED on your laptop can listen to it too (Practice 8). **Have a Pi, but your Node 1 is still in Wokwi?** Install Node-RED on the Pi as usual; the editor and dashboard addresses stay the Pi's address. The Wokwi Node 1 never connects to the broker on the Pi anyway (Module 12), so use the Wokwi column of [table 8.2](#82-adjust-the-addresses-in-every-step) for three things: the broker's **Server** `broker.emqx.io`, the MQTTX connection **Public broker**, and the contract checker with `broker.emqx.io`. The test without the laptop (➕ B) can only be proven once you have your board. The pass criteria are in ✅.
> - macOS users: replace **Ctrl** with **Cmd** for shortcuts in the browser and in the Node-RED editor, unless stated otherwise.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The Node-RED editor is a door with full access to the Pi.** Anyone who can open it can build a flow that runs any command on the Pi. That's why our editor **gets a password** as soon as it's installed (Quick Win), and door 1880 is **never** opened to the internet through port forwarding.
> 2. **The dashboard has no password yet.** Anyone connected to your home Wi-Fi can open the dashboard and press its switches, just like the broker without a password in Modules 11–12. The lock is put on in Module 21.
> 3. **Automation moves real relays.** Before you deploy (apply) an automation flow, make sure the relay only switches the kit's low-voltage load (the 5 V fan), following the rule we've had since Module 5. This curriculum never connects a relay to 220 V mains power.
> 4. **A `set` command is never retained.** In the MQTT sending node, choose **Retain** `false`, following the Module 11 data contract rule.
> 5. **Passwords and the passphrase never go into the repository.** Flows exported from Node-RED don't carry passwords, but never copy the files `settings.js` and `flows_cred.json` on the Pi to GitHub.

This module follows the same rhythm as Modules 1–12. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: Node-RED listens to Node 1 (40 minutes)](#-quick-win-node-red-listens-to-node-1-40-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Low-code](#1-low-code-building-programs-with-boxes-and-wires) · [2 Flows, nodes, msg](#2-flows-nodes-and-msg-items-on-a-conveyor-belt) · [3 Node-RED on the gateway](#3-node-red-on-the-gateway-service-files-and-password) · [4 MQTT in Node-RED](#4-mqtt-in-node-red-one-connection-many-listeners) · [5 Dashboard 2](#5-dashboard-2-pages-groups-and-widgets) · [6 Changing messages](#6-changing-messages-change-switch-and-commands-with-an-id) · [7 Automation & hysteresis](#7-automation-and-hysteresis-a-fan-that-isnt-jumpy) · [8 Saving flows](#8-saving-flows-export-import-and-security)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Editor tour](#practice-1--an-editor-tour-and-your-first-flow-25-minutes) · [2 Service & Node 1](#practice-2--node-red-as-a-service-listening-to-node-1-30-minutes) · [3 Dashboard & temperature gauge](#practice-3--dashboard-2-and-your-first-temperature-gauge-30-minutes) · [4 Sensor panel](#practice-4--the-full-sensor-panel-30-minutes) · [5 Control from the phone](#practice-5--control-from-the-phone-40-minutes) · [6 Fan automation](#practice-6--fan-automation-with-hysteresis-30-minutes) · [7 Save the flows](#practice-7--save-the-flows-to-the-repository-20-minutes) · [8 Laptop path](#practice-8--laptop-path-node-red-on-the-laptop-30-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-13-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

---

## 🎯 After this module you can…

1. **Explain what low-code is** (building programs with very little code), when Node-RED is enough, and why the project's "brain" moves to a backend in Module 16.
2. **Install Node-RED on the Pi gateway as a service** that starts by itself every time the Pi starts, complete with an editor password.
3. **Build flows**: place nodes, connect wires, read `msg.payload`, press **Deploy**, and use the debug node as a magnifying glass.
4. **Listen to and send MQTT from Node-RED** according to the data contract, including commands with a unique `id` that aren't retained.
5. **Build a dashboard that you open from your phone** with Dashboard 2: gauges, a tank, a chart, text, switches, a button, and a slider.
6. **Build a fan automation with hysteresis**: the fan turns on above 30 °C and only turns off below 28 °C, without constantly switching on and off.
7. **Save flows to the repository** and load them again (export and import), without saving any passwords along with them.

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **The Raspberry Pi gateway from Module 12** | On, with its fixed address (example: `192.168.1.37`), Mosquitto `active (running)`, and reachable over SSH. Installing Node-RED needs the internet; the download is about 100 MB. |
| **Node 1 v1.2.1** | Running from its charger and connected to the gateway broker (➕ in Module 12). No firmware changes this week. |
| **Laptop** | A browser (Chrome, Edge, Firefox, or Safari) for the Node-RED editor, a terminal for SSH, **MQTTX**, **VS Code** with the `mini-smart-home` folder, and **GitHub Desktop**. |
| **Phone** | Connected to the **same** home Wi-Fi as the Pi, to open the dashboard. Any browser will do. |
| **A place to keep passwords** | A password manager or a personal notebook, for the Node-RED editor password and its passphrase. Not the repository, not your module notes. |
| **Laptop path** (without a Pi) | Node.js 24 from Module 4 and Mosquitto as a service from Practice 7 of Module 12. Without a real Node 1: Node 1 in Wokwi with a public broker, as in Module 11. |

Versions used in this module (October 2026): **Node-RED 5.0.8**, Node.js 24 (installed by the Node-RED installer script), and **Dashboard 2** (`@flowfuse/node-red-dashboard`) **1.33.0**. The old dashboard (`node-red-dashboard`, often called "Dashboard 1") hasn't been maintained since June 2024; don't install it, even though many old tutorials still use it.

---

## 🏆 Quick Win: Node-RED listens to Node 1 (40 minutes)

The goal: Node-RED installed on the gateway as a service, its editor open in the laptop's browser, and your first flow showing Node 1's `telemetry` messages every 10 seconds. The first twenty minutes go to the installer script; the rest is yours.

> 🖥️ **No Raspberry Pi yet?** Skip step 1. First do [Practices 8.1–8.3](#81-install-node-red) to install Node-RED on the laptop and open it up for the phone, then continue from step 2 with the editor address `http://localhost:1880` and the broker from table 8.2. **Have a Pi, but your Node 1 is still in Wokwi?** Do all the steps on the Pi as usual, except that in step 3 you fill in **Server** with `broker.emqx.io`, and in **Topic** you replace `a4cf12e5b7c0` with your Wokwi Node 1's `device_id`.

### Step 1 — Install Node-RED on the Pi

1. **On the laptop**, open a terminal (as in Module 12) and log in to the Pi:

   ```bash
   ssh budi@192.168.1.37
   ```

2. **On the Pi**, run the official Node-RED installer script. Type exactly this one line, **without** `sudo` in front of it (the script asks for `sudo` authority by itself when it needs it):

   ```bash
   bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
   ```

   This command downloads the installer script from GitHub, then runs it. The script installs **Node.js 24**, Node-RED, and a systemd service called `nodered`. Old tutorials use an address ending in `update-nodejs-and-nodered-deb`; that address has been dead since June 2026 (🚨).
3. The script shows its welcome message, then asks for the password for `sudo` (`[sudo] password for budi:`). Type the Pi's password (it isn't shown), then press **Enter**. After that, two questions appear, and each one **only waits for a short while**:
   - `Are you really sure you want to do this ? [y/N] ? ` — type `y`, then press **Enter** within **30 seconds**. If you're too late, the script stops without any message; just run the command from step 2 again.
   - `Would you like to install the Pi-specific nodes ? [y/N] ? ` — type `n`, then press **Enter** (15 seconds). Those Pi-specific nodes are for the Pi's GPIO pins, and our project doesn't use them (🔬 in Module 12).
4. The screen is cleared, then a checklist appears one line at a time. Wait 10–20 minutes until `All done.` appears. **Expected output** (example, on a Pi 5):

   ```text
   Running Node-RED install for user budi at /home/budi on debian

     Will try to install Node.js 24
     Install Node.js                     ✔   v24.22.0 : Npm 11.19.1
     Remove old version of Node-RED      ✔
     Clean npm cache                     ✔
     Install Node-RED core               ✔   5.0.8
     Npm rebuild existing nodes          ✔
     Add shortcut commands               ✔
     Update systemd script               ✔
     Fixup Pi tweaks                     ✔
     All done.
   ```

   After that, the script prints the warning banner `DO NOT EXPOSE NODE-RED TO THE OPEN INTERNET WITHOUT SECURING IT FIRST` and immediately runs **`node-red admin init`**, a question-and-answer tool that creates the settings file.
5. Answer the following `node-red admin init` questions. Choose an answer with the arrow keys **↑**/**↓**, then press **Enter**; a password you type only shows up as asterisks.

   | Question on screen | Your answer | Why |
   | :--- | :--- | :--- |
   | `Settings file` | press **Enter** (`/home/budi/.node-red/settings.js`) | the default location |
   | `Share Anonymouse Usage Information` (the misspelling `Anonymouse` really comes from the program) | **No, do not send my usage data** | we update Node-RED ourselves with the same script |
   | `Do you want to setup user security?` | **Yes** | the editor must be protected by a password (safety rule number 1) |
   | `Username` | `admin` | the name of the **Node-RED editor** account, not a Linux user |
   | `Password` | the editor password, **at least 8 characters**, different from the Pi's password | keep it somewhere safe |
   | `User permissions` | **full access** | this account may change flows |
   | `Add another user?` | **No** | |
   | `Do you want to enable the Projects feature?` | **No** | this feature needs `git`, which isn't included in Raspberry Pi OS Lite |
   | `Enter a name for your flows file` | press **Enter** (`flows.json`) | |
   | `Provide a passphrase to encrypt your credentials file` | any passphrase you like, for example three random words | used to lock the broker password later (Module 21); keep it somewhere safe |
   | `Select a theme for the editor…` | press **Enter** (`default`) | other themes need an extra package |
   | `Select the text editor component to use in the Node-RED Editor` | press **Enter** (`monaco (default)`) | |
   | `Allow Function nodes to load external modules? (functionExternalModules)` | **No** | we don't need extra modules in the function node |

   At the end, `Settings file written to /home/budi/.node-red/settings.js` appears, then the prompt `budi@gateway:~ $` comes back.
6. The script does **not** start Node-RED, and it doesn't register it to start by itself. Do both at once:

   ```bash
   sudo systemctl enable --now nodered.service
   ```

   The `--now` option means "enable it for every time the Pi starts, **and** start it right now", just like Mosquitto in Module 12.
7. Wait about 30 seconds, then check:

   ```bash
   systemctl status nodered
   ```

   What to look for: `enabled` on the `Loaded:` line and `active (running)` on the `Active:` line. Press **q** to get back to the prompt.

### Step 2 — Open the Node-RED editor from the laptop

1. **On the laptop**, open a browser and type this address in the address bar: `http://192.168.1.37:1880` (use your Pi's fixed address; `1880` is Node-RED's door).
2. A login page appears. Fill in **Username** with `admin` and **Password** with the editor password from step 1.5, then click **Login**.
3. The first time it opens, Node-RED greets you with a short tour, `Welcome to Node-RED 5.0!`. You can follow it (**Start**, **Next**) or close it with the **✕** button.
4. Get to know the screen. The picture below shows the editor after step 3 is done; right now, your workspace is still empty.

![Screenshot of the Node-RED 5.0 editor in the laptop's browser after Quick Win step 3, with seven markers. Marker 1, top left: the EXPLORER panel with Flows, Flow 1, Subflows, and Global Configuration Nodes. Marker 2, bottom left: the PALETTE panel with the filter nodes box and the common category (inject, debug, complete, catch, status, link, comment), plus function. Marker 3, center: the workspace of the Flow 1 tab, with the mqtt in node telemetry Node 1, its status connected, wired to the node debug 1. Marker 4, top right: the Deploy button, still gray. Marker 5: the three-line main menu icon. Marker 6, top right: the INFORMATION panel for Flow 1. Marker 7, bottom right: the DEBUG MESSAGES panel with three messages from the topic msh/a4cf12e5b7c0/telemetry; the last one is opened and shows ts, fw 1.2.1, temperature 27.1, humidity 77, light 2310, soil 37, motion false, and water_level 64.](assets/node-red-editor.png)

*Real screenshot of Node-RED 5.0.8 and FlowFuse Dashboard 1.33.0 (Apache 2.0 license) from the author's laptop, with data from a mock Node 1; numbers and captions by the author.*

   - **Explorer** (top left, marker 1): the list of flows (every tab is one flow), subflows, and **config nodes** such as the connection to the broker.
   - **Palette** (bottom left, marker 2): the list of nodes you can use, grouped by category (`common`, `function`, `network`, …). The `filter nodes` box above it searches for nodes by name.
   - **Workspace** (center, marker 3): where you build flows. Its tab is called `Flow 1`.
   - **The Deploy button** (top right, marker 4): applies the flows in the workspace to the Node-RED running on the Pi. This button is gray when there are no changes yet.
   - **The main menu** (the three-line icon, top right corner, marker 5): **Import**, **Export**, **Manage palette**, and **Settings**.
   - **The right-hand panels**: **Information** (top, marker 6) explains the selected node, and **Debug messages** (bottom, marker 7) shows the messages from debug nodes.

### Step 3 — First flow: listen to Node 1's `telemetry`

1. **In the Node-RED editor**, type `mqtt` in the palette's `filter nodes` box. Drag the **mqtt in** node (with a wave icon, `network` category) to the middle of the workspace, then let go.
2. Double-click that node to open its settings. The **Server** row still says `Add new mqtt-broker...`. Click the **+** button at the right end of that row (its tooltip is `Add new mqtt-broker config node`; the pencil icon next to it is for editing an existing broker). In the `Add new mqtt-broker config node` window, fill in:
   - **Name**: `Mosquitto on the gateway`
   - **Server**: `localhost` (Node-RED and Mosquitto are on the same Pi), **Port**: `1883`

   Leave the other fields as they are, including the empty **Client ID** (Node-RED makes up a random name by itself), then click **Add**.
3. Back in the **mqtt in** settings, fill in:
   - **Topic**: `msh/a4cf12e5b7c0/telemetry` (replace `a4cf12e5b7c0` with your Node 1's `device_id`)
   - **QoS**: `0`, the same QoS that Node 1 uses to publish `telemetry`
   - **Output**: leave it at `auto-detect (parsed JSON object, string or buffer)`
   - **Name**: `telemetry Node 1`

   Click **Done**.
4. Clear the `filter nodes` box, then drag a **debug** node (`common` category, with a striped icon) to the right of the mqtt in node.
5. Connect the two: press and hold the left mouse button on the small dot on the **right side** of the mqtt in node, drag to the **left side** of the debug node, then let go. A gray wire appears between them.
6. Click **Deploy** at the top right. The notification `Successfully deployed` appears, and a green dot labeled `connected` appears under the mqtt in node: Node-RED is now connected to the broker.
7. Click the bug icon in the bottom right panel (**Debug messages**) if the panel isn't open yet. A new message appears every 10 seconds. Click the **▸** sign in front of `{ ts: … }` to open its contents. **Expected output** (the numbers and times on your screen will be different):

   ```text
   10/18/2026, 10:31:22 AM  node: debug 1
   msh/a4cf12e5b7c0/telemetry : msg.payload : Object
   ▾object
     ts: "2026-10-18T03:31:22Z"
     fw: "1.2.1"
     temperature: 28.5
     humidity: 71
     light: 2310
     soil: 37
     motion: false
     water_level: 64
   ```

Congratulations! Node-RED on the gateway now listens to Node 1, just like MQTTX in Module 11. The difference: Node-RED runs 24 hours a day on the Pi, and those messages can now be processed, displayed, and turned into automation without writing a program from scratch. Leave this flow as it is; we continue it in Practice 2.

> ➡️ **Done with the Quick Win?** Read [Concept 1](#1-low-code-building-programs-with-boxes-and-wires), then do the practices in the order given at the start of 🧠.

---

## 🧠 The "Why" Concepts

Eight concepts, one per section — **you don't need to read them all at once**. Concepts and practices alternate in this order:

1. Concepts 1–2 (what just happened in the Quick Win) → Practice 1 (an editor tour and your first flow)
2. Concepts 3–4 → Practice 2 (Node-RED as a service, listening to Node 1)
3. Concept 5 → Practices 3–4 (Dashboard 2 and the sensor panel)
4. Concept 6 → Practice 5 (control from the phone)
5. Concept 7 → Practice 6 (fan automation with hysteresis)
6. Concept 8 → Practice 7 (saving the flows to the repository)
7. Practice 8 is only for the laptop path (without a Pi): do Practice 8 first, then follow the order above with the addresses and methods from Practice 8
8. 🧩 Challenges → ➕ Mini Smart Home (dashboard v0 and 24-hour automation) → 📝 Quiz → ✅ Checklist

At every switch point, there's a ➡️ box (forward to the practice) and a ⬆️ box (back to the concepts) with links you only need to click.

> 🖥️ **Want to try something in the Concepts section?** It's not required. You'll build every example from the Concepts section yourself in the Practices, in the Node-RED editor.

### 1. Low-code: building programs with boxes and wires

In Module 11, you used the contract checker: a Node.js program of about 230 lines that subscribes to topics, unpacks JSON, then writes `PASS` or `FAIL`. To make a program like that, you have to write the code line by line, run it in the terminal, and repeat all that every time something needs to change.

**Node-RED** offers another way. Inside the browser, the program is built from **boxes** (called *nodes*) connected with **wires**. Each box does one small job: listening to an MQTT topic, changing a message's contents, sorting messages, showing a gauge, or publishing a command. That chain of boxes and wires is called a ***flow***. This way of programming is called ***low-code***: most of the work is done by choosing settings in the boxes, and code is only written for the small things that aren't available.

Node-RED was created at IBM in 2013 to connect IoT devices quickly, and was released as an open-source project the same year. Since 2016, Node-RED has been managed by a nonprofit foundation that's now called the OpenJS Foundation. Its official slogan is *low-code programming for event-driven applications*: programming with little code for applications that do their work every time an event happens. The "events" in our project are an MQTT message arriving, a click on the dashboard, or the clock reaching a certain time.

| | Writing a program (Modules 4 and 11) | Node-RED (this week) |
| :--- | :--- | :--- |
| What it looks like | text: lines of code in VS Code | a picture: boxes and wires in the browser |
| Changing a rule | change the code, save, run it again | change a box's settings, click **Deploy** |
| Seeing what's in a message | `console.log()` in the terminal | the **debug** node, shown in the right-hand panel |
| Building a dashboard | HTML, CSS, and JavaScript (Module 22) | install Dashboard 2, drag in widgets (display elements) |
| A good fit for | complex logic, automated testing, work in big teams | prototypes, a first dashboard, simple automation, "glue" between systems |

When is low-code enough? For Mini Smart Home **this week**: one home, one gateway, a few simple rules, and one dashboard page. When isn't it enough? When the rules multiply, when several people change the system at the same time, when data has to be kept for years in a database, and when every change has to be tested automatically before it's used. That's why, from Module 16 on, the project's "brain" moves to a ***backend*** that you write yourself in TypeScript, and the Node-RED automation is switched off so that there aren't two brains giving orders. Node-RED isn't thrown away: it stays useful as a tool for peeking at the data traffic, like a magnifying glass in a workshop.

### 2. Flows, nodes, and `msg`: items on a conveyor belt

Picture a **conveyor belt in a factory**. Items are put on one end of the belt and travel past several workstations, and at each station a worker does one thing: checks, sticks on a label, sorts, or packs. Node-RED works exactly like that:

- **The items** are messages, called **`msg`** (short for message). Every message is one JavaScript object, exactly like the objects in Module 4.
- **The workstations** are **nodes**. A node receives a message from the wire on its left, does its job, then passes the message (possibly changed) on through the wire on its right.
- **The conveyor belts** are the **wires**. One output may be connected to several nodes at once: the message is copied onto every wire.

![Diagram of flows, nodes, and msg as items on a conveyor belt. Three nodes on the belt: inject (the way in, creates a message), change (a processor, changes the message with $uppercase(payload) & "!"), and debug (the way out, displays it). Above the first wire, a msg card with payload "hello from the gateway", topic "practice", and _msgid "3c5e…"; above the second wire, the same msg card with payload "HELLO FROM THE GATEWAY!". Legend: node equals workstation, wire equals conveyor belt, msg equals the item traveling by, msg.payload equals its contents. Bottom: the editor in the laptop's browser (the drawing board; a blue dot on a node means not deployed yet), a Deploy arrow (Ctrl + D), to Node-RED on the Pi (the machine; flows run 24/7).](assets/flow-node-msg.png)

There are only two parts of `msg` you'll use most often:

| Part of `msg` | What it holds | Example from the Quick Win |
| :--- | :--- | :--- |
| `msg.payload` | the **payload**: the actual contents of the message | Node 1's `telemetry` object: `{ ts: "…", temperature: 28.5, … }` |
| `msg.topic` | the **topic**: a label saying where the message comes from or goes to | `msh/a4cf12e5b7c0/telemetry` |

Because the `payload` in the Quick Win is an object, each of its fields can be pointed to with a dot, exactly as in JavaScript: **`msg.payload.temperature`** is the temperature, and **`msg.payload.water_level`** is the water level in the tank. This way of pointing is used in almost every node setting this week.

Nodes are grouped by their role:

| Role | Example nodes | Its icon in the palette |
| :--- | :--- | :--- |
| **The way in**: creates or receives messages | **inject** (a button and a schedule), **mqtt in** | a connection dot on the right only |
| **Processor**: changes, sorts, or holds back messages | **change**, **switch**, **filter**, **function** | connection dots on the left and the right |
| **The way out**: displays or sends | **debug**, **mqtt out**, the **text** widget | a connection dot on the left only (other widgets, such as gauges, switches, buttons, and sliders, have dots on the left **and** the right, because they can also put out messages) |

**Deploy: from a drawing to a running program.** What you build in the editor **doesn't run yet** until you press **Deploy**. The editor is only a drawing board in the laptop's browser; the machine is on the Pi. The **Deploy** button sends that drawing to Node-RED on the Pi, which then stops the old flows and starts the new ones in an instant. A node whose changes haven't been applied yet is marked with a **blue dot** above it, and a node whose settings aren't complete is marked with a **red triangle**. The keyboard shortcut is **Ctrl + D**.

**Debug: the magnifying glass.** The **debug** node doesn't change anything. It only shows the messages passing by in the **Debug messages** panel, exactly like `console.log()` in Module 4. A good habit: every time you add a new node, put a debug node after it, see whether its contents are what you expected, then switch that debug node off (the small button on its right side) when the panel starts getting busy. The panel only keeps the last 100 messages.

> ➡️ **Time to practice!** Concepts 1–2 are enough for [Practice 1 — An editor tour and your first flow](#practice-1--an-editor-tour-and-your-first-flow-25-minutes). After that, come back to Concept 3.

### 3. Node-RED on the gateway: service, files, and password

In Module 12, Mosquitto became a **systemd service**: it starts by itself every time the Pi starts, and the security guard (systemd) wakes it up again if it dies suddenly. Node-RED now becomes the second service on the same gateway, named **`nodered`**. The installer script already created its unit file, and in the Quick Win you enabled it with `sudo systemctl enable --now nodered.service`.

![Diagram of Node-RED on the gateway: one Pi, two services. Center, the Raspberry Pi "gateway" at 192.168.1.37, holding Mosquitto (Module 12), the mosquitto service at door 1883, the MQTT post office, and below it Node-RED (this week), the nodered service at door 1880, with the folder ~/.node-red/ holding settings.js, flows.json, flows_cred.json, and node_modules/. The two exchange messages through localhost:1883. Left, Node 1 v1.2.1 connected to Mosquitto over MQTT: it sends telemetry, status, and ack, and receives cmd. Top right, the laptop opens the editor at http://192.168.1.37:1880, protected by the Username and Password from node-red admin init. Bottom right, the phone opens the dashboard at :1880/dashboard/home, with no password, for the home Wi-Fi only; the lock comes in Module 21. Bottom: no port forwarding to 1880 or 1883: the Node-RED editor can run any command on the Pi, and the broker has no password yet; both are only opened from the home network.](assets/node-red-on-the-gateway.png)

| | Mosquitto (Module 12) | Node-RED (this week) |
| :--- | :--- | :--- |
| Service name | `mosquitto` | `nodered` |
| Runs as user | `mosquitto` | `budi` (your Pi user) |
| Door | 1883 (MQTT) | 1880 (the editor and the dashboard, through the browser) |
| If it dies suddenly | woken up again (`Restart=on-failure`) | woken up again after 20 seconds (`Restart=on-failure`, `RestartSec=20`) |
| Settings file | `/etc/mosquitto/conf.d/gateway-pi.conf` | `/home/budi/.node-red/settings.js` |
| Log | `/var/log/mosquitto/mosquitto.log` | the journal: `journalctl -u nodered` or `node-red-log` |

Everything that belongs to Node-RED is kept in one hidden folder, **`~/.node-red`** (`/home/budi/.node-red`). Its important contents:

| File | What's in it | Goes into the repository? |
| :--- | :--- | :--- |
| `settings.js` | the settings from `node-red admin init`, including the editor password, already scrambled (*hashed*), and the credentials passphrase, written **as is** | **no** |
| `flows.json` | all the flows that have been *deployed* | yes, through an export (Concept 8) |
| `flows_cred.json` | the passwords that nodes use (for example the broker password later), locked with your passphrase | **never** |
| `node_modules/` | the extra nodes you install, for example Dashboard 2 | no (the package name is enough) |

The installer script also adds five short commands: `node-red-start`, `node-red-stop`, `node-red-restart`, `node-red-reload`, and `node-red-log`. They all call `sudo` inside, so they may ask for the Pi's password. The four you'll need most often are in the following table, together with one ordinary systemd command that doesn't need `sudo`:

| Command (on the Pi) | What it means |
| :--- | :--- |
| `node-red-start` | start the service, then keep showing its log (**Ctrl + C** only closes the log display; the service keeps running) |
| `node-red-stop` | stop the service |
| `node-red-restart` | restart the service |
| `node-red-log` | show the latest log and keep following it (**Ctrl + C** to stop) |
| `systemctl status nodered` | the ordinary systemd command from Module 12: `enabled` and `active (running)`? |

**An editor password, not a dashboard password.** In the Quick Win, you answered **Yes** to `Do you want to setup user security?`. That answer wrote an `adminAuth` block in `settings.js`, so the editor asks for a **Username** and **Password** before it opens. This matters: the **exec** node in the palette can run any Linux command on the Pi, and the **function** node can run any JavaScript. An editor without a password means anyone on your home Wi-Fi can give orders to your Pi. However, that password **only** protects the editor. The dashboard page at `/dashboard` stays open to every device on the home network; for now that's enough, and locking it is a job for Module 21. One rule applies from today on: **never set up port forwarding to door 1880.**

**The Pi's memory.** The installer script gives Node-RED a memory limit that suits your Pi's RAM: about 1 GB on a Pi 5 with 2 GB of RAM, 2 GB on a Pi 5 with 4 GB of RAM, and 256 MB on a Pi Zero 2 W (512 MB of RAM). This week's flows only use a small part of it, so Mosquitto and Node-RED share the same gateway comfortably.

### 4. MQTT in Node-RED: one connection, many listeners

Node-RED talks to the broker exactly like MQTTX in Module 11: it connects to `localhost:1883`, subscribes to topics, and publishes messages. The difference is that all of it is built from three kinds of nodes:

| Node | Its job | Important settings |
| :--- | :--- | :--- |
| **mqtt-broker** (a config node) | **one** connection to the broker, shared by all the MQTT nodes | **Server** `localhost`, **Port** `1883`, **Client ID** left empty |
| **mqtt in** | subscribes to one topic (the *wildcards* `+` and `#` are allowed) and puts out every message that arrives | **Topic**, **QoS**, **Output** |
| **mqtt out** | publishes `msg.payload` to the broker | **Topic**, **QoS**, **Retain** |

***Config node* = one shared connection.** The **mqtt-broker** node doesn't appear in the workspace. It's kept in the **Configuration nodes** section and chosen from the **Server** list in every MQTT node. The three **mqtt in** nodes and the one **mqtt out** node you'll build all use `Mosquitto on the gateway`, so they all share **one** connection to the broker. That's why, when you add the next MQTT node, you **choose** `Mosquitto on the gateway` from the list, and don't click the **+** button next to it again. That button creates a second broker node, which opens a second connection you don't need (🚨).

**Client ID left empty.** Node-RED makes up a random client name by itself, for example `nodered2f4a91c07b3d5e86`. **Don't** fill it in with Node 1's `device_id`: the data contract uses the `device_id` as Node 1's client name, and two clients with the same name keep kicking each other out of the broker (🚨 in Module 11, "Connects, then keeps dropping every few seconds").

**Output `auto-detect`.** The default **Output** choice of mqtt in, `auto-detect (parsed JSON object, string or buffer)`, tries to read the message's contents as JSON. A `telemetry` message becomes an object (`msg.payload.temperature` can be used), while a `status` message holding the text `online` stays text. Leave this choice; if you change it to `a String`, every `msg.payload.temperature` is suddenly empty.

**The status under the node.** Every MQTT node shows the state of its connection: a **green dot** `connected`, a **yellow ring** `connecting`, or a **red ring** `disconnected`. This is the first sign to check if the dashboard goes quiet (🚨).

**The mqtt out node: don't leave fields empty.** In the mqtt out node, a **Topic**, **QoS**, or **Retain** left empty is taken from the message that arrives at that node. That sounds handy, but it's dangerous: a message that came from mqtt in carries `msg.topic` `msh/…/telemetry` and sometimes `msg.retain` `true`, so your command could be published to the wrong topic or become retained. That's why, for commands, you always fill in all three explicitly: **Topic** `msh/a4cf12e5b7c0/cmd`, **QoS** `1`, **Retain** `false`. There's one more behavior to remember: if the connection to the broker is down, mqtt out **throws away** its message without an error, so also check the status under that node.

> ➡️ **Time to practice!** Concepts 3–4 are enough for [Practice 2 — Node-RED as a service, listening to Node 1](#practice-2--node-red-as-a-service-listening-to-node-1-30-minutes). After that, come back to Concept 5.

### 5. Dashboard 2: pages, groups, and widgets

Node-RED itself doesn't have a dashboard. The display for the phone comes from an extra package called **Dashboard 2** (its package name is **`@flowfuse/node-red-dashboard`**), installed through the **Manage palette** menu (Practice 3). Once it's installed, the palette gets a new category, **`dashboard 2`**, with nodes that show up as ***widgets*** (display elements) on a web page: `gauge`, `chart`, `text`, `switch`, `button`, `slider`, and others.

**It's built in levels, like a house.** Every widget has to live in a **group**, every group on a **page**, and all the pages in one **dashboard**:

| Level | Node name | Its important settings | Ours |
| :--- | :--- | :--- | :--- |
| Dashboard | **ui-base** | the base address, always `/dashboard` | `Mini Smart Home` |
| Page | **ui-page** | **Path** (must start with `/`), icon, layout | `Home`, path `/home` |
| Group | **ui-group** | a name that shows as the card's title, width | `Sensors`, `Controls`, `Chart` |
| Widget | **ui-gauge**, **ui-chart**, … | **Group**, then the widget's own settings | the temperature gauge, the fan switch, … |

![Diagram of how Dashboard 2 is built: dashboard, page, group, widget. Left, nested boxes: ui-base Mini Smart Home at /dashboard holds ui-page Home at /home, which holds three ui-groups. The Sensors group: Node 1 (status), Temperature, Humidity, Soil, Water tank, Light, Motion. The Controls group: Fan, Lamp, Water for 5 seconds, Curtain (degrees), Last reply. The Chart group: Temperature & humidity. Right, a picture of a phone: a screen less than 576 pixels wide has 3 columns, so the Sensors, Controls, and Chart cards are stacked downward. A picture of a laptop: 12 columns, two cards side by side per row: Sensors and Controls in the first row, Chart in the second row, below Sensors. The address on the phone: http://192.168.1.37:1880/dashboard/home.](assets/dashboard-2-structure.png)

You don't need to create the three upper levels by hand. As soon as the **first** widget is placed in the workspace, Dashboard 2 creates `My Dashboard`, the page `Page 1` (path `/page1`), the group `Group 1`, and the theme `Default Theme` for you, then puts that widget in `Group 1`. In Practice 3, we only need to rename them. The page's address on the phone becomes:

```text
http://192.168.1.37:1880/dashboard/home
```

**The layout adapts to the screen.** Dashboard 2 divides the screen's width into columns: 12 columns on a laptop screen, but only 3 columns on a phone screen less than 576 pixels wide. Our groups are 6 columns wide, so on the laptop two groups sit side by side, while on the phone all the groups and widgets are **stacked** into one long column that you simply scroll through. You don't need to set anything for that.

**Widgets read `msg`.** The gauge and text widgets have a **Value** setting that points to the part of the message to display. Because the `msg.payload` from the **mqtt in** node holds the whole `telemetry` message, it's enough to fill in **Value** with `payload.temperature` (with the `msg.` choice in front of it), and the temperature gauge moves right away, without an extra node:

| Widget (name in the palette) | Used for | Its key settings |
| :--- | :--- | :--- |
| **gauge** | temperature, humidity, soil, water tank | **Type** (`Half Gauge`, `Tank Level`, …), **Value**, **Range** min–max, **Units** |
| **chart** | the temperature and humidity chart for the last hour | **Series** of the JSON type `["temperature","humidity"]`, **X-Axis Limit** |
| **text** | light, motion, the `online` status, the reply to a command | **Label**, **Value** |
| **switch** | the lamp and the fan | **Topic** (`lamp`/`fan`), **Indicator** |
| **button** | watering for 5 seconds | **Payload** (the number `5`), **Topic** (`pump`) |
| **slider** | the curtain, 0–180 degrees | **Range**, **Output** `only on release`, **Topic** (`curtain`) |

There are two traps that often confuse beginners. First, **there are two nodes called `switch`**: the one in the `function` category is a **message sorter** (Concept 6), while the one in the `dashboard 2` category is a **switch** on the phone's screen. Second, **`null` isn't zero**. The data contract writes a failed reading as `null` (Module 11). A gauge that receives `null` quietly points to its **minimum** value: the temperature shows 0 °C and the tank shows 0%, as if it were empty. That's why we put a **switch** node (the sorter) with the rule `is not null` in front of the temperature and tank gauges. That node only passes on readings that were really read (Practice 4).

**The chart is kept on the gateway.** The chart's history is kept in Node-RED's memory, not on the phone. So a phone that has just opened the dashboard still sees the lines for the last hour. That history is lost when Node-RED is restarted; keeping data for years is the job of the database in Modules 17–18.

> ➡️ **Time to practice!** Concept 5 is enough for [Practice 3 — Dashboard 2 and your first temperature gauge](#practice-3--dashboard-2-and-your-first-temperature-gauge-30-minutes) and [Practice 4 — The full sensor panel](#practice-4--the-full-sensor-panel-30-minutes). After that, come back to Concept 6.

### 6. Changing messages: change, switch, and commands with an `id`

A message can rarely be used as it is. Sometimes we only need one field, sometimes messages have to be sorted by their contents, and sometimes we have to **create** a new message, for example a command for Node 1. Three processor nodes do almost all of that work:

| Node | It's like | Example in this module |
| :--- | :--- | :--- |
| **change** | a worker who sticks on or replaces labels | take `msg.payload.state.fan` from the `ack` and make it `msg.payload` (Practice 5) |
| **switch** (the sorter, `function` category) | a worker at a fork in the belt who sends items down different lanes | a temperature above 30 goes down lane 1, below 28 down lane 2 (Practice 6) |
| **function** | an all-round worker who follows written instructions (JavaScript) | not required this week; there's an example in 🔬 |

**The change node** has four actions: **Set** (fill in or replace a part of the message), **Change** (search and replace part of a text), **Delete** (remove a part), and **Move** (move a part). The value you fill in can be text, a number, `true`/`false`, another part of `msg`, or a **JSONata expression** (the **J:** icon), a small language for building and calculating JSON data. You've already used JSONata in Practice 1 (`make uppercase`) and Practice 4 (the light and motion words); its most important job is below: building commands.

**The switch node** checks one part of the message against one or more rules, for example `> 30`, `< 28`, or `is not null`, and each rule has its own way out. A message that doesn't match any rule is **thrown away**. This behavior is what makes hysteresis work later (Concept 7).

**Commands must follow the contract.** When you press the fan switch on the phone, the dashboard only puts out `msg.payload = true` and `msg.topic = "fan"`. Node 1 doesn't understand that message. It waits for a command that follows the Module 11 data contract:

```json
{"id":"nr-1792299778095","ts":"2026-10-18T05:02:58Z","action":"set","target":"fan","value":true}
```

One **change** node called `make cmd` turns the switch's message into that command with one JSONata expression:

```text
{
  "id": "nr-" & $string($millis()),
  "ts": $now("[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]Z"),
  "action": "set",
  "target": topic,
  "value": payload
}
```

| Part | What it means |
| :--- | :--- |
| `"nr-" & $string($millis())` | a unique `id`: the prefix `nr-` (from Node-RED) joined (`&`) with the number of milliseconds since 1970, which is different every time. Node 1 ignores commands with an `id` it has already seen, so the `id` **must** be new every time. |
| `$now("[Y0001]-…[s01]Z")` | the current time in UTC, **without** milliseconds. The contract checker rejects a `ts` with milliseconds, and `$now()` without a pattern produces milliseconds. |
| `"target": topic` | taken from `msg.topic`: `fan`, `lamp`, `pump`, or `curtain` |
| `"value": payload` | taken from `msg.payload`: `true`/`false`, the number of watering seconds, or the curtain's degrees |

This one `make cmd` node is shared by **all** the controls: the lamp switch, the fan switch, the watering button, the curtain slider, and later the fan automation. Each control only needs to provide the right `msg.topic` and `msg.payload`. The result is sent by the **mqtt out** node to `msh/a4cf12e5b7c0/cmd` with **QoS** `1` and **Retain** `false`, following the contract's rules.

**The `ack` reply closes the loop.** Node 1 answers every command with an `ack` that carries `state`, the state of **all** the actuators at that moment (Module 11). We use it to make the dashboard's switches **honest**: a switch only moves after Node 1 answers, not when your finger touches the screen. If Node 1 is off or the command is refused, the switch doesn't pretend that it worked. In Dashboard 2, this behavior is chosen through the **Indicator** setting `Switch icon shows state of the input`.

![Diagram of the honest switch: command out, ack back, and the switch only moves once the ack arrives. The upper path, in orange, is the command: 1, the Fan switch on the phone is tapped and shows a waiting sign; 2, the make cmd node in Node-RED builds a new id, ts, action, target, and value with JSONata; 3, the mqtt out node sends it to msh/<device_id>/cmd with QoS 1 and Retain false, to Mosquitto at door 1883; 4, Node 1 receives it, and the fan relay clicks. The lower path, in green, is the reply: 5, Node 1 answers with an ack; 6, the mqtt in node msh/<device_id>/ack in Node-RED receives it through Mosquitto; 7, the fan state node takes payload.state.fan, and the switch on the phone moves to on. Bottom, an example cmd {"id":"nr-1792301487215","ts":"…","action":"set","target":"fan","value":true} and ack {"id":"nr-1792301487215","ts":"…","ok":true,"state":{"fan":true,"lamp":false,…}}: the same id links the reply to its command (Module 11). Red box: Node 1 off? No ack: the switch keeps waiting and doesn't pretend that it worked.](assets/command-and-ack.png)

> ➡️ **Time to practice!** Concept 6 is enough for [Practice 5 — Control from the phone](#practice-5--control-from-the-phone-40-minutes). After that, come back to Concept 7.

### 7. Automation and hysteresis: a fan that isn't jumpy

Our first automation: **the fan turns on when the room is hot**. The simplest rule, "turn it on if the temperature is above 30 °C, turn it off if not", turns out to be a bad one. DHT22 readings always wobble a little, for example 29.9 → 30.1 → 29.9 → 30.2. With one threshold at 30, the fan would turn on, off, on, and off every 10 seconds. The relay keeps going "click", the fan wears out quickly, and the people in the house get annoyed.

The cure is **hysteresis**: two thresholds, not one. **The fan turns on above 30 °C** and **only turns off below 28 °C**. Between the two (28–30 °C), the fan is **left** in its last state. An air conditioner's thermostat and a clothes iron work the same way.

![Fan hysteresis chart: temperature over time, one point every 10 seconds. A red dashed line at 30 °C is the on threshold, a blue dashed line at 28 °C the off threshold, and the yellow band between them means leave the last state. The temperature curve wobbles up from 27 °C to about 31.5 °C, then down to about 27 °C. A red point where the temperature first goes past 30: 1 command, fan on. A blue point where the temperature drops below 28: 1 command, fan off. The bar under the chart: the fan is OFF, then ON (it stays on even though the temperature dips into the 28–30 band), then OFF. Note: with only one threshold at 30 °C, the same curve triggers 8 commands, the relay clicking every time the temperature wobbles from 29.9 to 30.1 and back to 29.9; with two thresholds, only 2 commands.](assets/fan-hysteresis.png)

In Node-RED, hysteresis is built from four built-in nodes, without code:

1. A **switch** `hysteresis 30/28` with two rules, `> 30` and `< 28` (both of the number type). A temperature of 28–30 °C doesn't match either rule, so its message is thrown away: this is the "leave it alone" band.
2. Two **change** nodes, `fan on` and `fan off`, which turn the message into `msg.payload = true` or `false`, with `msg.topic = "fan"`.
3. A **filter** `only when it changes` with the mode `block unless value changes`. As long as the temperature stays above 30 °C, lane 1 puts out `true` every 10 seconds. The filter only passes on a message that's **different** from the last one, so a command is only sent when the decision changes, not every 10 seconds.
4. The **`make cmd`** node from Concept 6, then **mqtt out**.

The order matters: **the filter must come before `make cmd`.** After `make cmd`, every message is always different, because its `id` is new. As a result, the filter would never hold anything back. One more trap: a failed reading (`null`) **gets through** the rule `< 28`, because JavaScript considers `null < 28` true. Without a guard, a sensor that comes loose would turn the fan off. That's why this automation is placed **after** the `DHT22 read?` switch node from Practice 4, which only passes on temperatures that were really read.

**Two brains are dangerous.** Node 1 has had local rules since Modules 6 and 8: **automatic watering** when the soil is dry (complete with the water tank safety) and an **automatic lamp** when there's motion in the dark. If Node-RED also made a watering rule based on the soil sensor, the two brains would override each other. That's why this week's Node-RED automation is **only for the fan**, the only actuator that doesn't have a local rule yet. In Module 19, Node 1 also gets a local fan rule as a safety net in case the gateway is down, and the division of work is discussed again there.

> ➡️ **Time to practice!** Concept 7 is enough for [Practice 6 — Fan automation with hysteresis](#practice-6--fan-automation-with-hysteresis-30-minutes). After that, come back to Concept 8.

### 8. Saving flows: export, import, and security

Flows that have been *deployed* are saved in `~/.node-red/flows.json` **on the gateway's microSD card**. If that card breaks, all the gauges, switches, and automation are lost with it. Like `gateway-pi.conf` in Module 12, a copy of them has to be in the repository.

**Exporting** is done from the main menu (the three-line icon) → **Export**, or with **Ctrl + E**. Choose **all flows** (every tab), the **formatted** format (neatly spread over many lines, so that changes are easy to read on GitHub), then **Download**. The browser saves a file called `flows.json`, which we keep as **`edge/node-red-flows.json`** in the `mini-smart-home` folder, so that it doesn't get mixed up with the file on the Pi. Its contents are a list of nodes in JSON, including config nodes such as `Mosquitto on the gateway` and the dashboard's structure, plus one note that names the package it needs (`@flowfuse/node-red-dashboard`).

**What doesn't get exported** is actually a relief: **passwords and credentials**. The broker's username and password (later, in Module 21) are kept separately in `flows_cred.json`, locked with your passphrase, and never go into an export. So the file `edge/node-red-flows.json` is safe for a public repository. What must **not** go into the repository is `settings.js` (it holds the passphrase as is), `flows_cred.json`, and the hidden files `.config.*.json` and `.sessions.json` (the editor's login tokens that are still valid) from the `~/.node-red` folder.

**Importing** is the reverse: main menu → **Import** (**Ctrl + I**) → **select a file to import** → choose the JSON file → **Import**. If the flow uses Dashboard 2 and the Node-RED you're importing into hasn't installed it yet, `Required modules missing` appears, with a button to install it right away. After an import, usually only two things need adjusting: the **Server** address in the broker node and the `device_id` in every topic.

**This week's security summary:**

| Part | Protected by | Notes |
| :--- | :--- | :--- |
| The Pi's terminal | SSH + the Pi's password (Module 12) | `sudo` still asks for the password |
| The Node-RED editor (`:1880`) | the **Username** + **Password** from `node-red admin init` | don't open it through port forwarding |
| The dashboard (`:1880/dashboard`) | not protected yet | anyone on the home Wi-Fi can open it and press the switches; Module 21 |
| The broker (`:1883`) | not protected yet | the same as in Modules 11–12; Module 21 |
| The repository | exports without credentials | don't copy `settings.js` or `flows_cred.json` |

> ➡️ **Time to practice!** Concept 8 is enough for [Practice 7 — Save the flows to the repository](#practice-7--save-the-flows-to-the-repository-20-minutes).

---

## 🔧 Step-by-step practice

Almost every practice this week is done **in the Node-RED editor**, in the laptop's browser (`http://192.168.1.37:1880`). The SSH terminal to the Pi is only used in Practice 2, and the phone comes in from Practice 3 on. Three habits before you start:

> [!IMPORTANT]
> 1. **Click Deploy after a change.** Changes in the editor only take effect after you click **Deploy** (or press **Ctrl + D**). A blue dot above a node means "not applied yet".
> 2. **Choose the broker that's already there.** In every new MQTT node, choose `Mosquitto on the gateway` from the **Server** list. Don't click the **+** button next to it again; that button creates a second broker.
> 3. **Replace `a4cf12e5b7c0` with your Node 1's `device_id`** in every topic. Look at your notes from Module 11, or read the topic in the Quick Win's debug panel.

How to open the editor at any time: the laptop's browser → `http://192.168.1.37:1880` → **Username** `admin` and the editor password → **Login**. Once you're logged in, you don't need to log in again for seven days. If Node-RED is restarted while the editor tab is still open, the editor says that its connection was lost, then reconnects by itself; reload the page if needed.

### Practice 1 — An editor tour and your first flow (25 minutes)

> 🖥️ **Tools:** the laptop's browser with the Node-RED editor. Node 1 isn't needed. Concepts used: 1–2.

In the Quick Win, your first flow (`telemetry Node 1` → debug) lives in the `Flow 1` tab. To keep that tab tidy, this practice is done in a new tab.

#### 1.1 A practice tab and the inject button

1. **In the Node-RED editor**, click the **+** sign at the right end of the row of tabs (above the workspace). A new tab appears, `Flow 2`.
2. Double-click the `Flow 2` tab. In its settings window, change **Name** to `Practice`, then click **Done**.
3. From the palette (`common` category), drag an **inject** node into the workspace. Its label changes to `timestamp`: by default, this node sends the current time.
4. Drag a **debug** node to the right of the inject node, then connect the two (inject's right dot → debug's left dot).
5. Click **Deploy**.
6. Click the **small square on the left side** of the inject node. That's its button. In the **Debug messages** panel, one message from your new debug node appears (its line is marked with that node's name, for example `node: debug 2`), holding a big number, for example `1792301234567`. That number is the count of milliseconds since January 1, 1970, the way computers store time (like the number at the start of each `mosquitto.log` line in Module 12, but in milliseconds). If Node 1 is on, the `telemetry` messages from the `Flow 1` tab (`node: debug 1`) also keep appearing every 10 seconds, because the debug panel shows messages from every tab; that's normal.

#### 1.2 Changing what the message says

1. Double-click the inject node. On the `msg.payload` row, click the small arrow in front of the `timestamp` field, then choose the **string** type (the **az** icon). Type `hello from the gateway`.
2. On the `msg.topic` row, type `practice`. Click **Done**.
3. Notice the blue dot above the inject node: this change hasn't been applied yet. Click **Deploy**, then click the inject button. The debug panel now shows `practice : msg.payload : string[22]` with the contents `"hello from the gateway"`.

#### 1.3 A workstation in the middle of the belt: the change node

1. Drag a **change** node (`function` category) and drop it **right on the wire** between inject and debug. The wire is highlighted, and the change node slips into the middle by itself.
2. Double-click the change node. Its first rule is already **Set** `msg.payload`. In the **to the value** field, choose the **J: expression** type, then type:

   ```text
   $uppercase(payload) & "!"
   ```

   **JSONata** is a small language for processing JSON data (covered in Concept 6). This expression turns the text into capital letters, then joins it (`&`) with an exclamation mark. Fill in **Name** with `make uppercase`, then click **Done**.
3. Double-click the debug node. Change **Output** from `msg.payload` to `complete msg object`, then click **Done**.
4. Click **Deploy**, then click the inject button. **Expected output** in the debug panel (click **▸** to open it):

   ```text
   ▾object
     _msgid: "3c5e4b2f8a1d7e90"
     payload: "HELLO FROM THE GATEWAY!"
     topic: "practice"
   ```

   That's the whole `msg`: the `payload` changed by the change node, the `topic` from inject, and `_msgid`, a unique number that Node-RED gives every message.

#### 1.4 Schedules, silenced debug nodes, and undo

1. Double-click the inject node. At the bottom, change **Repeat** from `none` to `interval`, **every** `5` **seconds**. Click **Done**, then **Deploy**. Now a message arrives by itself every 5 seconds: this is how Node-RED makes a schedule.
2. The debug panel fills up quickly. Click the **green button on the right side of the debug node**: the button fades, and messages from that node stop appearing in the panel, even though the flow keeps running. Click it once more to switch it back on. The **trash can** button in the debug panel clears its contents.
3. Select the change node with a single click, then press **Delete**. The node and its wires disappear. Press **Ctrl + Z**: the node comes back. This undo saves you if you delete something by mistake, as long as the editor page hasn't been reloaded. If the deletion has already been *deployed*, press **Ctrl + Z**, then click **Deploy** again.
4. When you're done practicing, turn off the schedule: set the inject's **Repeat** back to `none`, then click **Deploy**. You can leave the `Practice` tab; it doesn't disturb other flows.

> ⬆️ **Done with Practice 1?** Go back to [Concept 3](#3-node-red-on-the-gateway-service-files-and-password).

### Practice 2 — Node-RED as a service, listening to Node 1 (30 minutes)

> 🖥️ **Tools:** the Node-RED editor, an SSH terminal to the Pi, **MQTTX** on the laptop, and Node 1, switched on. Concepts used: 3–4.

#### 2.1 Name the project tab

1. **In the Node-RED editor**, click the `Flow 1` tab (holding `telemetry Node 1` from the Quick Win). Double-click that tab, change **Name** to `Mini Smart Home`, then click **Done**. All of this week's project flows live in this tab.
2. Double-click the debug node from the Quick Win, fill in **Name** with `watch telemetry`, then click **Done**. A clear name helps when the debug panel gets busy.

#### 2.2 Listen to `status` and `ack`

1. Drag a new **mqtt in** node below `telemetry Node 1`. Double-click that node, then fill in:
   - **Server**: choose `Mosquitto on the gateway` from the list (it's been there since the Quick Win)
   - **Topic**: `msh/a4cf12e5b7c0/status`
   - **QoS**: `1`
   - **Name**: `status Node 1`

   Click **Done**, then connect it to a new **debug** node named `watch status`.
2. In the same way, create a third **mqtt in** node: **Topic** `msh/a4cf12e5b7c0/ack`, **QoS** `0`, **Name** `ack Node 1`, connected to a new debug node named `watch ack`.
3. Click **Deploy**. The `online` message from `status Node 1` appears in the debug panel right away, even though Node 1 doesn't publish anything at that moment. That's the retained message from Module 11: the broker keeps it and hands it to every new subscriber.
4. **On the laptop**, open **MQTTX**, connect **Pi gateway** (Practice 3.3 of Module 12), then send one command as in ➕ C of Module 12: topic `msh/a4cf12e5b7c0/cmd`, QoS `1`, **Retain** unticked, content `{"id":"c-301","action":"set","target":"lamp","value":true}` in **JSON** format. The lamp relay goes "click", and the `ack` appears in Node-RED's debug panel:

   ```text
   msh/a4cf12e5b7c0/ack : msg.payload : Object
   ▾object
     id: "c-301"
     ts: "2026-10-18T03:41:07Z"
     ok: true
     ▸state: object
   ```

   Click **▸** in front of `state` to see the state of all four actuators. Send it once more with `"value":false` and a new `id` (`c-302`) to turn the lamp off. Node-RED and MQTTX are both listening; the broker hands the same message to every subscriber.

#### 2.3 Service test: Node-RED gets back up by itself

1. **On the laptop**, open a terminal and log in to the Pi (`ssh budi@192.168.1.37`). **On the Pi**, restart the service:

   ```bash
   sudo systemctl restart nodered
   ```

   In the browser, the editor briefly says that its connection to the server was lost, then reconnects by itself within a few seconds. Your flows are still there, because they're saved in `~/.node-red/flows.json`.
2. Look at the log from when Node-RED started:

   ```bash
   node-red-log
   ```

   **Expected output** (example; press **Ctrl + C** to stop following it):

   ```text
   18 Oct 10:45:02 - [info]

   Welcome to Node-RED
   ===================

   18 Oct 10:45:02 - [info] Node-RED version: v5.0.8
   18 Oct 10:45:02 - [info] Node.js  version: v24.22.0
   18 Oct 10:45:02 - [info] Linux 6.18.50+rpt-rpi-2712 arm64 LE
   18 Oct 10:45:03 - [info] Loading palette nodes
   18 Oct 10:45:05 - [info] Settings file  : /home/budi/.node-red/settings.js
   18 Oct 10:45:05 - [info] Context store  : 'default' [module=memory]
   18 Oct 10:45:05 - [info] User directory : /home/budi/.node-red
   18 Oct 10:45:05 - [warn] Projects disabled : editorTheme.projects.enabled=false
   18 Oct 10:45:05 - [info] Flows file     : /home/budi/.node-red/flows.json
   18 Oct 10:45:05 - [info] Server now running at http://127.0.0.1:1880/
   18 Oct 10:45:05 - [info] Starting flows
   18 Oct 10:45:05 - [info] Started flows
   18 Oct 10:45:05 - [info] [mqtt-broker:Mosquitto on the gateway] Connected to broker: mqtt://localhost:1883
   ```

   The `[warn] Projects disabled` line is only a notice that the Projects feature is turned off (your answer in `node-red admin init`), not an error. The line `Server now running at http://127.0.0.1:1880/` doesn't mean that Node-RED can only be opened from the Pi either; from the laptop and the phone, keep using `http://192.168.1.37:1880`. The last line is the most important one: Node-RED is connected to Mosquitto.
3. The real test: restart the whole Pi.

   ```bash
   sudo reboot
   ```

   The SSH connection drops right away (`Connection to 192.168.1.37 closed by remote host.`); that's normal, as in Practice 1.4 of Module 12. Wait about one minute, then reload the editor in the browser (log in again if you're asked to). The debug panel receives `telemetry` every 10 seconds again, without you starting anything. Node-RED, like Mosquitto, is now a permanent part of the gateway. If the editor doesn't open after 2–3 minutes, open "The editor won't open" in 🚨.

> ⬆️ **Done with Practice 2?** Go back to [Concept 5](#5-dashboard-2-pages-groups-and-widgets).

### Practice 3 — Dashboard 2 and your first temperature gauge (30 minutes)

> 🖥️ **Tools:** the Node-RED editor, a phone connected to the home Wi-Fi, and Node 1, switched on. Concepts used: 5.
>
> ⭐ **Required** — the Module 13 completion requirement asks for the phone to open the dashboard from the gateway.

#### 3.1 Install Dashboard 2

1. **In the Node-RED editor**, open the main menu (the three-line icon at the top right), then choose **Manage palette**.
2. The `User Settings` panel opens on the right side, with the **Palette** section already selected. Click the **Install** tab. In the `search modules` box, type `node-red-dashboard`.
3. A long list appears: dozens of packages related to `node-red-dashboard`, ten of which are shown first. The top two are usually `node-red-dashboard` and `@flowfuse/node-red-dashboard`. Choose the one whose name is **exactly** **`@flowfuse/node-red-dashboard`**, with nothing added after it (not, for example, `@flowfuse/node-red-dashboard-2-ui-led`), then click the **install** button next to it. The `node-red-dashboard` package without a prefix is marked `deprecated`; don't choose it.
4. A confirmation box appears with `Installing '@flowfuse/node-red-dashboard'` and a suggestion to read the package's documentation. Click **Install** in that box, not **Open node information**. Installing takes 1–3 minutes on the Pi; don't close the browser tab.
5. When it's done, the notification `Nodes added to palette:` appears with a list of the new nodes. Close the `User Settings` panel with the **Close** button at its top right. Scroll down the palette: there's a new category, **`dashboard 2`**.

Node-RED doesn't need to be restarted. Behind the scenes, the package was installed into the `~/.node-red/node_modules` folder on the Pi.

#### 3.2 Status text: the first widget

1. In the `Mini Smart Home` tab, drag a **text** node (`dashboard 2` category) to the right of `status Node 1`. Because this is the first widget, Dashboard 2 immediately creates a dashboard, the page `Page 1`, and the group `Group 1` for you.
2. Double-click that text node. We start by **replacing the automatically created names**:
   1. On the **Group** row (it says `[Page 1] Group 1`), click the pencil icon next to it. In the group's settings window, change **Name** to `Sensors`.
   2. Still in that window, click the pencil icon on the **Page** row. Change the page's **Name** to `Home` and **Path** to `/home` (starting with a slash).
   3. Still in the page window, click the pencil icon on the **UI** row. Change the dashboard's **Name** to `Mini Smart Home`. The **Path** field (`/dashboard`) is locked; leave it.
   4. Click **Update** in each window to go back one window at a time, until the text node's window is open again. The **Group** row now says `[Home] Sensors`.
3. Fill in **Label** with `Node 1`. Leave **Value** at `msg.payload`: the contents of the `status` message really are the text `online` or `offline`. Click **Done**.
4. Connect `status Node 1` to that text node, then click **Deploy**.

#### 3.3 The temperature gauge

1. Drag a **gauge** node (`dashboard 2` category) to the right of `telemetry Node 1`, then double-click it. **Group** is already filled in with `[Home] Sensors`.
2. Fill in its settings:
   - **Type**: leave it at `Half Gauge` (a half circle)
   - **Value**: leave its type at `msg.`, then type `payload.temperature` (so the whole thing reads `msg.payload.temperature`)
   - **Range**: **min.** `0`, **max.** `50`
   - **Segments** (the arc's colors): change the default numbers `0`, `4`, `7` to `0` (green), `28` (yellow), and `30` (red), to match the fan automation's thresholds later on. Each segment row holds a color box, the number where that color starts, a drop-down list belonging to that segment (it says `Label`; just leave it), and an **✕** button at the right end for deleting the row. The default colors are already green, yellow, and red, so for the temperature only the numbers need to change; for the gauges in 4.2, click the color box, then pick a new color in the color window that appears.
   - **Label**: `Temperature` (a field in the `Labelling` section, below **Segments**)
   - **Units**: `°C` (on Windows, you can copy the degree sign from this text)
3. Click **Done**. Connect the right dot of `telemetry Node 1` to the left dot of the gauge. One output can have many wires: the wire to `watch telemetry` stays.
4. Click **Deploy**.

#### 3.4 Open the dashboard on the laptop and the phone

1. **In the Node-RED editor**, open the **Dashboard 2.0** panel on the right side: click the bar chart icon in the row of small icons in the bottom right corner of the editor (hover the mouse over an icon to see its name), then click **Open Dashboard**. A new tab opens with the `Home` page: the temperature gauge and the text `Node 1 … online`.
2. **On the phone** (connected to the home Wi-Fi), open a browser and type:

   ```text
   http://192.168.1.37:1880/dashboard/home
   ```

   The same page appears, and its gauge moves every 10 seconds. The dashboard doesn't ask for a password; that's the security note in Concept 3.
3. To open it again easily, add this page to your phone's home screen: in Chrome on Android, the **⋮** menu → **Add to Home screen**; in Safari on iPhone, the **Share** button → **Add to Home Screen**.

Try warming up the DHT22 sensor by holding it in your hand for a few seconds: after one or two messages from Node 1, the temperature gauge goes up. Your first dashboard is alive.

> ➡️ **Continue** to [Practice 4 — The full sensor panel](#practice-4--the-full-sensor-panel-30-minutes) without going back to the concepts.

### Practice 4 — The full sensor panel (30 minutes)

> 🖥️ **Tools:** the Node-RED editor, the phone, and Node 1. Concepts used: 5.

#### 4.1 A `null` guard for the DHT22

If the DHT22 can't be read, Node 1 sends `"temperature": null` (Module 11), and the gauge shows `null` as **0**. Let's put in a guard:

1. **In the Node-RED editor**, drag a **switch** node from the **`function`** category (not the one in `dashboard 2`) and drop it on the wire between `telemetry Node 1` and the **Temperature** gauge, so that it slips in between.
2. Double-click that switch, then fill in:
   - **Property**: `msg.` `payload.temperature`
   - The first rule: click the operator list (it says `==`), choose **is not null**
   - **Name**: `DHT22 read?`
3. Click **Done**. Now the gauge only receives messages whose temperature was really read; if the DHT22 fails now and then, the gauge stays at its last value.

#### 4.2 Humidity, soil, and the water tank

1. **Humidity.** Drag a new **gauge**. Fill in **Group** `[Home] Sensors`, **Value** `msg.` `payload.humidity`, **Range** `0`–`100`, **Segments** `0` yellow, `40` green, and `80` yellow (all three colors are changed through the color box), **Label** `Humidity`, **Units** `%`. Connect it from the output of **`DHT22 read?`**, because the humidity also comes from the DHT22.
2. **Soil.** Drag a new **gauge**: **Value** `msg.` `payload.soil`, **Range** `0`–`100`, **Segments** just two rows, `0` red and `30` green (delete the third row with **✕**), **Label** `Soil`, **Units** `%`. Connect it directly from `telemetry Node 1`; the soil sensor never sends `null`.
3. **Water tank.** The HC-SR04 distance sensor can fail (`"water_level": null`), so make a second guard: a **switch** node (`function`) with **Property** `msg.` `payload.water_level`, the rule **is not null**, and **Name** `water read?`, connected from `telemetry Node 1`. Then drag a new **gauge** and first change its **Type** to `Tank Level`. As soon as the type changes, **Range** automatically becomes `0`–`100`, and **Segments** changes to the tank's four default blue rows: delete two rows with **✕**, then change the remaining two to `0` red and `20` green (the pump's safety threshold since Module 6). Fill in **Value** `msg.` `payload.water_level` and **Label** `Water tank`; the **Units** field deliberately doesn't appear for `Tank Level`, because the tank always shows its contents in percent. Connect it from `water read?`.

#### 4.3 Light and motion as words

A `light` number like `2310` doesn't mean much to the people you live with. The **text** node can show words worked out with JSONata:

1. Drag a **text** node, then fill in **Group** `[Home] Sensors` and **Label** `Light`. In **Value**, change its type to **J: expression**, then type:

   ```text
   payload.light < 1000 ? "dark (" & payload.light & ")" : "bright (" & payload.light & ")"
   ```

   In plain words: if `light` is below `1000` (the dark threshold in the data contract), write "dark"; otherwise, write "bright". The number is added in parentheses.
2. Drag another **text** node, fill in **Label** with `Motion`, then change the **Value** type to **J: expression** and type:

   ```text
   payload.motion ? "motion detected" : "quiet"
   ```

3. Connect both of them from `telemetry Node 1`.

#### 4.4 A temperature and humidity chart

1. Drag a **chart** node (`dashboard 2` category), then double-click it. We need a new group: on the **Group** row, click the **+** button at the right end (its tooltip is `Add new ui-group config node`). Fill in **Name** with `Chart`, make sure **Page** points to the `Home` page, then click **Add**.
2. Fill in the chart's settings:
   - **Label**: `Temperature & humidity (last hour)`
   - **Type**: leave it at `Line`
   - **X-Axis Limit**: leave it at `last 1 Hours`
   - **Y-Axis**: **min.** `0`, **max.** `100` (so that both lines can be seen on one scale)
   - **Series**: change its type to **JSON**, then type `["temperature","humidity"]`
3. Click **Done**, then connect it from the output of **`DHT22 read?`**.
4. Click **Deploy**, then look at the phone. The page now holds the **Sensors** card (status, temperature, humidity, soil, water tank, light, motion) and the **Chart** card, with two lines that grow every 10 seconds.

![Two screenshots of the Home dashboard after Practice 4, taken in a laptop browser narrowed to the width of a phone screen (412 pixels), then framed as a phone, with five markers and their captions. Left screen, the top part, the Sensors card: marker 1 on the line Node 1 online, a text widget from the status topic (a retained message) that turns offline if Node 1 goes off; marker 2 on the Temperature gauge at 29.6 °C, with an arc that's green below 28, yellow at 28–30, and red from 30, above the Humidity gauge at 70% and the Soil gauge at 37%; marker 3 on Water tank, a gauge of the Tank Level type at 64%. Right screen, after scrolling down: marker 4 on Light bright (2310) and Motion quiet, text widgets with JSONata; marker 5 on the Chart card, the chart Temperature & humidity (last hour), with a red humidity line and a blue temperature line that wave up and down, growing every 10 seconds. Note: on your phone, the browser's address bar shows above it, http://192.168.1.37:1880/dashboard/home.](assets/phone-dashboard.png)

*Real screenshots of FlowFuse Dashboard 1.33.0 (Apache 2.0 license) from the author's laptop browser, narrowed to the width of a phone screen, with data from a mock Node 1; phone frame, numbers, and captions by the author.*

The **Chart** card may appear above the **Sensors** card. That's normal: a group created through the **+** button doesn't have a position number yet, so Dashboard 2 puts it at the very top. Open the **Dashboard 2.0** panel → the **Layout** tab, drag the `Chart` group below `Sensors`, then click **Deploy**. The order of the widgets inside a card follows the order they were created in, and it can be changed the same way: drag a widget up or down.

> ⬆️ **Done with Practices 3–4?** Go back to [Concept 6](#6-changing-messages-change-switch-and-commands-with-an-id).

### Practice 5 — Control from the phone (40 minutes)

> 🖥️ **Tools:** the Node-RED editor, the phone, Node 1 with its relays, and (in 5.6) a VS Code terminal with the contract checker from Module 11. Concepts used: 6.
>
> ⭐ **Required** — the Module 13 completion requirement asks for a working fan switch on the phone.

All of this week's controls flow into one shared path: widget → **`make cmd`** → **mqtt out**. We'll build that path first.

#### 5.1 The command path: `make cmd` and mqtt out

1. **In the Node-RED editor**, drag a **change** node to an empty area below the sensor flow. Double-click it, then fill in **Name** with `make cmd`. In the **Set** `msg.payload` rule, change the type of **to the value** to **J: expression**, then click the **…** button at the end of the field to open the roomier expression editor. Type:

   ```text
   {
     "id": "nr-" & $string($millis()),
     "ts": $now("[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]Z"),
     "action": "set",
     "target": topic,
     "value": payload
   }
   ```

   Click **Done** in the expression editor, then **Done** in the change node. What each line means is explained in Concept 6.
2. Drag an **mqtt out** node (category `network`) to the right of `make cmd`. Double-click it, then fill in:
   - **Server**: `Mosquitto on the gateway`
   - **Topic**: `msh/a4cf12e5b7c0/cmd`
   - **QoS**: `1`
   - **Retain**: `false` (don't leave it empty; see Concept 4)
   - **Name**: `cmd Node 1`
3. Connect `make cmd` to `cmd Node 1`. Also add a **debug** node named `watch cmd`, connected from `make cmd`, so that every command going out shows up in the debug panel.

#### 5.2 An honest fan switch

1. Drag a **switch** node from the **`dashboard 2`** category (the one with a toggle-switch icon, not the message sorter from `function`). Double-click it. We need a new group for the controls: on the **Group** line, click the **+** button, fill in **Name** with `Controls`, make sure **Page** points to `Home`, then click **Add**.
2. Fill in the switch's settings:
   - **Label**: `Fan`
   - **If `msg` arrives on input, pass through to output**: **don't** check it
   - **Indicator**: `Switch icon shows state of the input`
   - **On Payload** `true` and **Off Payload** `false` (the defaults; leave them)
   - **Topic**: change its type to **string** (the **az** icon), then type `fan`
3. Click **Done**, then connect the switch to `make cmd`.
4. Now the feedback. Drag a **change** node, give it the **Name** `fan state`, then fill in the rule **Set** `msg.payload` **to the value** of type **msg.** `payload.state.fan`. Connect `ack Node 1` (from Practice 2) → `fan state` → the **Fan** switch. This last wire goes into the **left side** of the switch.
5. Click **Deploy**. On the phone, reload the dashboard: the **Controls** card appears with the **Fan** switch. Like the **Chart** card in Practice 4, this new card may show up at the very top. In the **Dashboard 2.0** panel → **Layout** tab, drag the `Controls` group between `Sensors` and `Chart`, then click **Deploy** again.
6. Tap the switch. The switch shows a waiting sign (a small spinning circle) for a moment, the fan relay goes "click", then the switch slides to **on**. The order: switch → `make cmd` → broker → Node 1 turns on the relay → Node 1 answers with an `ack` → `fan state` → switch. In the debug panel, `watch cmd` shows the command:

   ```text
   ▾object
     id: "nr-1792295887215"
     ts: "2026-10-18T03:58:07Z"
     action: "set"
     target: "fan"
     value: true
   ```

   Now test its honesty. Tap the switch once more until the relay goes "click" and the switch slides to **off**. Then turn off Node 1 in the order of the golden rules: **turn off the MB102** first, and only then unplug its USB from the charger (Wokwi users: stop the simulation). Tap the switch again: the waiting sign never changes to on, because no `ack` arrives, and within half a minute the `Node 1` text changes to `offline`. The switch doesn't lie. Turn Node 1 back on: plug the USB into the charger, **only then** turn on the MB102 (regulated microSD module: press **EN** afterward), as in ➕ D of Module 12; Wokwi users just run the simulation again. Once the `Node 1` text is back to `online`, tap the switch once more: this time the `ack` arrives, and the switch slides to **on**.

> ⚠️ **Don't check *pass through* on a switch that receives `ack`s.** If it's checked, the switch passes every incoming `ack` on as a new command, that command is answered with another `ack`, and so on, without end.

#### 5.3 The lamp switch

Repeat 5.2 for the lamp: a switch with **Label** `Lamp`, **Group** `[Home] Controls`, **Topic** string `lamp`, and **Indicator** `Switch icon shows state of the input`, connected to `make cmd`; then a change node `lamp state` (**Set** `msg.payload` ← `msg.payload.state.lamp`) from `ack Node 1` to the **Lamp** switch. Tip: click the **Fan** switch, then hold **Ctrl** while you click the `fan state` node so that both are selected (their outlines are highlighted in blue, or in red if your editor has a dark theme). Press **Ctrl + C**, then **Ctrl + V**, and click in an empty area to place the copy. Change the copy's settings, then reconnect the two wires that didn't get copied along: the **Lamp** switch → `make cmd`, and `ack Node 1` → `lamp state`.

Remember that Node 1 also has an automatic lamp (motion in the dark, Module 6). If the lamp is turned on from the dashboard, Node 1 treats it as turned on by hand and doesn't turn it off by itself (Module 11). The dashboard switch also only knows the lamp's state from the last `ack`, so when Node 1's automatic rule turns the lamp on, the switch doesn't show it until the next command.

#### 5.4 A 5-second watering button

1. Drag a **button** node (`dashboard 2`). Fill in **Group** `[Home] Controls` and **Label** `Water for 5 seconds`.
2. In the **Enable click event** → **Payload** section, change its type to **number** (the **09** icon) and fill in `5`. In **Topic**, choose the type **string** and type `pump`.
3. Connect it to `make cmd`, then click **Deploy**. Tap the button on the phone: the pump runs for 5 seconds.

The data contract limits `pump` to 1–10 seconds, and Node 1 **refuses** to water if the tank water is below 20%. You can see that refusal in the `ack` reply (5.6).

#### 5.5 The curtain slider

1. Drag a **slider** node (`dashboard 2`). Fill in **Group** `[Home] Controls`, **Label** `Curtain (degrees)`, and **Range** **min** `0`, **step** `10`, **max** `180`.
2. Change **Output** to `only on release` so that a command is only sent when your finger lets go, not dozens of times while the slider is being dragged. In **Topic**, choose the type **string** and type `curtain`. Leave *pass through* unchecked.
3. Connect the slider to `make cmd`. Also build its feedback: a change node `curtain state` (**Set** `msg.payload` ← `msg.payload.state.curtain`) from `ack Node 1` to the slider.
4. Click **Deploy**, then drag the slider on the phone: the curtain servo turns to that angle.

#### 5.6 The last reply and the contract check

1. Drag a **text** node (`dashboard 2`), then fill in **Group** `[Home] Controls` and **Label** `Last reply`. Change the type of **Value** to **J: expression**, then type:

   ```text
   payload.ok ? "done" : payload.message
   ```

   Connect it from `ack Node 1`, then click **Deploy**. Every command now gets a reply in words on the dashboard: `done`, or the reason for a refusal from the `message` field of the `ack`, for example `pump refused: tank water too low` when the tank is below 20%.
2. **On the laptop**, open a new terminal in VS Code (**Terminal → New Terminal**; a new terminal always starts in the `mini-smart-home` folder), go into the `tools` folder with `cd tools`, then run the Module 11 contract checker with the Pi's address and your `device_id`, as in ➕ C of Module 12:

   ```bash
   node contract-checker.js 192.168.1.37 a4cf12e5b7c0
   ```

3. Tap the fan switch, the watering button, and the curtain slider on the phone. Among the `telemetry` lines that appear every 10 seconds, every command from Node-RED (`cmd`) and its answer (`ack`) must `PASS`. **Expected output** (example, only the lines of a command and its answer):

   ```text
   [10:58:07 AM] msh/a4cf12e5b7c0/cmd  PASS
   [10:58:07 AM] msh/a4cf12e5b7c0/ack  PASS  (answered 38 ms after the command: under 1 second)
   ```

   The checker that guarded Node 1 in Module 11 now guards Node-RED too. That's the power of the data contract. Stop the checker with **Ctrl + C**.

![Screenshot of the Controls card after Practice 5, taken in a laptop browser narrowed to the width of a phone screen (412 pixels), then framed as a phone, with five markers. Marker 1, the Fan switch, on: it slides only after the ack from Node 1 arrives, so what you see is the relay's real state. Marker 2, the Lamp switch, off: the command goes out, the ack comes back, and only then does the switch slide. Marker 3, the blue Water for 5 seconds button: one tap is one pump command with the value 5. Marker 4, the Curtain (degrees) slider in the middle: the command is sent when your finger lets go, and its value is 0–180 degrees. Marker 5, the Last reply line, which reads done, or the reason for a refusal from the message field of the ack, for example pump refused: tank water too low. Below it, part of the Chart card is visible.](assets/phone-controls.png)

*Real screenshot of FlowFuse Dashboard 1.33.0 (Apache 2.0 license) from the author's laptop browser, narrowed to the width of a phone screen, with data from a mock Node 1; phone frame, numbers, and captions by the author.*

> ⬆️ **Done with Practice 5?** Go back to [Concept 7](#7-automation-and-hysteresis-a-fan-that-isnt-jumpy).

### Practice 6 — Fan automation with hysteresis (30 minutes)

> 🖥️ **Tools:** the Node-RED editor, the phone, and Node 1 with the DHT22 and the fan relay. Concepts used: 7.
>
> ⭐ **Required** — the Module 13 completion requirement asks that the automation turns on the fan when the sensor is warmed up.

#### 6.1 Pick thresholds you can test

This module's thresholds are **30 °C** (on) and **28 °C** (off). The problem is that the room temperature in many homes in Indonesia is already 29–32 °C, so the fan could switch on as soon as the automation is deployed, and you couldn't test the change. Look at the temperature gauge on the dashboard now:

- **Room temperature below 27 °C?** Use the module's thresholds: on above `30`, off below `28`.
- **Room temperature 27 °C or more?** For testing, take the room temperature plus 1 °C, rounded up, as the off threshold, and the off threshold plus 2 as the on threshold. For example, if the room is at 29.4 °C: off below `31`, on above `33`. The off threshold must be **above** the room temperature, because a sensor you let go of only cools back down to room temperature, never lower; an off threshold equal to or below the room temperature means the fan never switches off. Once testing is done, you can set thresholds that are comfortable for your home.

#### 6.2 Build the automation flow

1. **In the Node-RED editor**, drag a **switch** node from the **`function`** category to below the sensor flow. Double-click it, then fill in:
   - **Property**: `msg.` `payload.temperature`
   - Rule 1: operator **>**, value type **number** (the **09** icon), value `30` (or the on threshold you chose for testing in 6.1)
   - Click **+ add** below the list of rules for rule 2: operator **<**, type **number**, value `28` (or the off threshold you chose for testing in 6.1)
   - The option below the list: leave it at `checking all rules`
   - **Name**: `hysteresis 30/28` (keep this name even if your numbers are different; the next steps call it that)

   Click **Done**. The node now has **two** output points on its right: the top one for rule 1, the bottom one for rule 2.
2. Connect the output of **`DHT22 read?`** to `hysteresis 30/28`. Don't connect it straight from `telemetry Node 1`: that `null` guard is what keeps the fan from being turned off by a failed sensor reading (Concept 7).
3. Drag two **change** nodes. Double-click each one, then fill in its **Name** and its rules:
   - `fan on`: the rule **Set** `msg.payload` **to the value** of type **boolean** `true`; click **+ add** for a second rule, **Set** `msg.topic` of type **string** `fan`.
   - `fan off`: the same, but `msg.payload` boolean `false`.

   Connect the **top** output of `hysteresis 30/28` to `fan on`, and the **bottom** output to `fan off`.
4. Drag a **filter** node (category `function`). Double-click it, leave **Mode** at `block unless value changes`, fill in **Property** with `msg.payload`, and leave the **Apply mode separately for each** `msg.topic` option checked. Fill in **Name** with `only when it changes`. Connect `fan on` and `fan off` to this filter.
5. Connect the filter to **`make cmd`** from Practice 5. The automation uses the same command path as the switches.
6. Click **Deploy**.

#### 6.3 Test: warm up the sensor

1. Open the dashboard on the phone and the debug panel in the editor. The filter's memory is always empty after a deploy, so the first decision is always sent once, as soon as the next `telemetry` arrives (within 10 seconds at most): if the room temperature is below the off threshold, `watch cmd` shows one `fan` `false` command (a fan that's on because of the switch goes off too); if it's already above the on threshold, one `fan` `true` command; if it's in between, no command yet. The same thing happens every time you click **Deploy** again or Node-RED restarts.
2. **Hold the DHT22 sensor** in the palm of your hand, without touching its legs, for one to two minutes. Your hand is about 34–36 °C, and the temperature reading rises slowly every 10 seconds.
3. As soon as the temperature passes the on threshold, the fan relay goes "click", the fan spins, the **Fan** switch on the phone slides to on, and `watch cmd` shows **one** `value: true` command. Notice that the next message, even though its temperature is still above the threshold, doesn't produce a new command: the filter holds it back.
4. Let go of the sensor. The temperature drops slowly. As long as the temperature is still **between** the two thresholds, the fan stays on; that's the hysteresis band. After a few minutes, the temperature drops below the off threshold, and the fan switches off with **one** `value: false` command.

Wokwi users: while the simulation is running, click the DHT22 sensor, drag the **Temperature** slider past the on threshold, then lower it again past the off threshold.

**If you turn off the fan with the switch while the temperature is still above the on threshold,** the automation doesn't turn it back on right away: the filter still remembers its last decision (`true`), so the same "on" decision is held back. The automation only acts again after the temperature drops below the off threshold and then rises past the on threshold again. For the people living in the house, this behavior actually makes sense: a command given by hand is respected until the situation changes. How to make a "Fan automation" switch that turns the automation on and off is in 🧩 Level 2.

> ⬆️ **Done with Practice 6?** Go back to [Concept 8](#8-saving-flows-export-import-and-security).

### Practice 7 — Save the flows to the repository (20 minutes)

> 🖥️ **Tools:** the Node-RED editor, **File Explorer** (Windows) or **Finder** (macOS), and **VS Code** with the `mini-smart-home` folder. Concepts used: 8.
>
> ⭐ **Required** — the Module 13 completion requirement asks that the flow JSON is in your repository.

#### 7.1 Export all flows

1. **In the Node-RED editor**, open the main menu (the three-line icon), then choose **Export** (or press **Ctrl + E**).
2. In the `Export nodes` window, choose **all flows** in the top row, then choose **formatted** as the format.
3. Click **Download**. The browser saves a file named `flows.json` in the **Downloads** folder.

#### 7.2 Move it into the project with a clear name

1. **On the laptop**, open the **Downloads** folder in File Explorer (Windows) or Finder (macOS).
2. Move `flows.json` to the **Documents → GitHub → mini-smart-home → edge** folder, then rename it to **`node-red-flows.json`**. On Windows: right-click the file → **Rename** (or **F2**); on macOS: click the file, then press **Enter**. If File Explorer only shows `flows` (Windows hides the `.json` extension, Module 1), type just `node-red-flows`; if you type the extension too, the name becomes `node-red-flows.json.json`.
3. Open the `mini-smart-home` folder in VS Code, then open `edge/node-red-flows.json`. Its contents are a long list of nodes in JSON: you'll find `"type": "mqtt in"`, your topics, `"name": "Mosquitto on the gateway"`, and `"type": "ui-gauge"`. Press **Ctrl + F** and search for `password`: there are no results. The editor password, the passphrase, and the credentials are never exported.

This file is committed in ➕, together with the updated gateway recipe.

#### 7.3 Restore test: try an import (optional, 5 minutes)

A backup only proves its worth if it can be restored. Here's a small, safe test:

1. **In the Node-RED editor**, open the main menu → **Import** (or **Ctrl + I**). Click **select a file to import**, then choose `edge/node-red-flows.json` from the project folder. The file's contents appear in the text box of the `Import nodes` window; click **Import**.
2. Because all those nodes already exist in your Node-RED, the message `Some of the nodes you are importing already exist in your workspace.` appears. That's the sign that your backup file is complete and recognized. Click **Cancel**: we don't need a second copy.

A real restore, on a Pi whose card was just rewritten, is in the `edge/README.md` recipe (➕ C).

> ➡️ **Done with Practice 7?** Do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1), then the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home). Practice 8 is only for the laptop path.

### Practice 8 — Laptop path: Node-RED on the laptop (30 minutes)

> 🖥️ **Tools:** a laptop with Node.js 24 (Module 4), a terminal (Windows: PowerShell; macOS: Terminal), a browser, and the Mosquitto broker as a service from Practice 7 of Module 12. Without a real Node 1: Node 1 in Wokwi with the public broker. Concepts used: none yet; this practice comes first of all, before Quick Win step 2.
>
> Do this practice **only if you don't have a Raspberry Pi yet**. Node-RED on the laptop only runs while its terminal is open and the laptop isn't asleep; that's enough for learning, but it isn't a 24-hour gateway.

#### 8.1 Install Node-RED

1. **On the laptop**, open a terminal. Make sure your Node.js is version 22.9 or newer:

   ```bash
   node -v
   ```

   The answer must be `v22.9.0` or higher, for example `v24.21.0` from Module 4. Node-RED 5 refuses to run on older versions of Node.js.
2. Install Node-RED as a global command (`-g`), which can be run from any folder. **Windows**, in an ordinary terminal without administrator rights (don't use **Terminal (Admin)**). If in Module 4 you chose to type `npm.cmd` instead of changing the PowerShell setting, add `.cmd` after `npm` in the command below (making it `npm.cmd install -g node-red`), then type `node-red.cmd` instead of `node-red` in steps 3 and 4. The command:

   ```bash
   npm install -g node-red
   ```

   **macOS** (starting with `sudo`, then enter your Mac's password; on **Linux** with Node.js from nvm, as in Module 4, the command above without `sudo` is enough):

   ```bash
   sudo npm install -g node-red
   ```

   Wait 1–3 minutes, until the prompt comes back with a summary like `added 300 packages in 45s`.
3. Create the settings file with the same questions and answers as in [Quick Win step 1.5](#step-1--install-node-red-on-the-pi):

   ```bash
   node-red admin init
   ```

   Answer exactly as in the Quick Win table, including **Yes** for `Do you want to setup user security?` with **Username** `admin`. Even on a laptop, the editor password still matters: Node-RED on the laptop can be opened from other devices on the same Wi-Fi. Its settings file is saved in the `.node-red` folder inside your user folder (Windows: `C:\Users\YOURNAME\.node-red`).
4. Start Node-RED:

   ```bash
   node-red
   ```

   The terminal shows a log much like the example in Practice 2.3 (a practice the laptop path skips, but you may take a peek at its example), with your laptop's own operating system line (for example `Windows_NT 10.0.26200 x64 LE`). Because your flows are still empty, this first log is slightly different: there are the lines `Creating new flow file` and `[warn] Encrypted credentials not found` (normal: there are no node passwords to lock yet), and the `Connected to broker` line doesn't appear yet, because there's no MQTT node yet. Node-RED is ready to use as soon as `Server now running at http://127.0.0.1:1880/` and `Started flows` appear. Leave this terminal open; closing it turns off Node-RED, and so does closing VS Code if this terminal is inside it. To stop, press **Ctrl + C**. As soon as Node-RED starts running, Windows may show a `Windows Security` window for **Node.js JavaScript Runtime**; answer it as in 8.3, that is, allow it for **private** networks only.

   Does Windows refuse `node-red admin init` (step 3) or `node-red` with the message `node-red.ps1 cannot be loaded because running scripts is disabled on this system`? That's the same PowerShell rule as `npm.ps1` in Module 4. Type `node-red.cmd admin init` and `node-red.cmd` instead, or follow the Module 4 fix.

#### 8.2 Adjust the addresses in every step

Follow Quick Win steps 2–3 and Practices 1–7 with these differences:

| The module says | Laptop path with a real Node 1 | Laptop path with Node 1 in Wokwi |
| :--- | :--- | :--- |
| editor `http://192.168.1.37:1880` | `http://localhost:1880` | `http://localhost:1880` |
| broker **Server** `localhost` (Mosquitto on the gateway) | `localhost`: the broker service from Practice 7 of Module 12 | `broker.emqx.io` (the public broker, port `1883`) |
| dashboard on the phone `http://192.168.1.37:1880/dashboard/home` | `http://192.168.1.10:1880/dashboard/home` (your laptop's IP address, Module 11; the permission is in 8.3) | the same as the middle column; on the laptop itself, `http://localhost:1880/dashboard/home` works too |
| the MQTTX connection **Pi gateway** (Practice 2.2) | **Via laptop IP** (Practice 2.4 of Module 11) | **Public broker** (Module 11), with the subscription `msh/` + your `device_id` + `/#` |
| the contract checker `node contract-checker.js 192.168.1.37 a4cf12e5b7c0` (Practice 5.6) | `node contract-checker.js 127.0.0.1 a4cf12e5b7c0` (the broker on the same laptop) | `node contract-checker.js broker.emqx.io a4cf12e5b7c0` (your Wokwi Node 1's `device_id`) |

Skip Practice 2.3 (the systemd service on the Pi). The Wokwi path uses topics with your Wokwi Node 1's `device_id`, just as in Module 11, and the Node 1 simulation in Wokwi must be running (its tab kept open) while you practice.

> [!WARNING]
> **The public broker is open to everyone.** On `broker.emqx.io`, anyone can read your simulation's data and send commands to your `cmd` topic. Use this path only for Node 1 in Wokwi, never for a real board whose relays are connected to a load, following the rule from Module 11.

#### 8.3 The laptop's dashboard from the phone

Node-RED runs on top of Node.js, so its firewall permission is the same as the Node.js permission from Practice 7 of Module 10. If you already gave that permission, the phone can open Node-RED on your laptop right away. The dashboard itself only exists from Practice 3 on; before that, `http://192.168.1.10:1880/dashboard/home` (use your laptop's IP address) only answers `Cannot GET /dashboard/home`, and that's normal. To test the permission now, open `http://192.168.1.10:1880` in the phone's browser: the login page of the Node-RED editor must appear (you don't need to log in). If Windows shows a `Windows Security` window for Node.js (usually as soon as `node-red` starts running in step 4 of 8.1, not when the phone opens it), answer exactly as in Practice 1.4 of Module 11: allow it for **private** networks only, not public ones. On macOS, answer **Allow** if you're asked. After that, the phone can open Node-RED on your laptop (its dashboard from Practice 3 on) as long as the laptop is on and the Node-RED terminal is open.

> ⬆️ **Done with Practice 8?** Go back to [Quick Win step 2](#step-2--open-the-node-red-editor-from-the-laptop), then follow the module's order as usual (Concept 1, Practice 1, and so on) with the addresses from table 8.2.

---

## 🚨 Troubleshooting

Many Node-RED tutorials on the internet were written for older versions. If a tutorial uses a way from the left column, translate it into this week's way:

| Old tutorial | The way now (this module) |
| :--- | :--- |
| the `update-nodejs-and-nodered-deb` script | `install-update-nodered-deb` (the old address has been dead since June 2026) |
| `sudo apt install nodered`, or Node.js from `apt` | the official script; Debian 13 only has Node.js 20, while Node-RED 5 needs 22.9 or later |
| the `node-red-dashboard` package ("Dashboard 1"), address `/ui` | `@flowfuse/node-red-dashboard` (Dashboard 2), address `/dashboard` |
| `npm install -g --unsafe-perm node-red` | `npm install -g node-red` (on Windows without `sudo`) |
| the **rbe** node | the same node is now called **filter** |
| an editor with the palette on the left and one right-hand panel that switches between info and debug | Node-RED 5: the Explorer at the top left, the palette at the bottom left, the Information panel at the top right, and the Debug messages panel at the bottom right, all visible at the same time |

The sections below are collapsed; click a title to open it.

<details>
<summary><b>The installer script stops: <code>Not: command not found</code>, or goes quiet after the first question</b></summary>

- `/dev/fd/63: line 1: Not: command not found`: the script's address is mistyped or uses the old name `update-nodejs-and-nodered-deb`. GitHub answers `Not Found`, and bash tries to run that text. Copy the command from Quick Win step 1.2 again, exactly.
- The script finishes right away, without a message, after `Are you really sure you want to do this ? [y/N] ?`: that question only waits 30 seconds. Run the command again and answer `y` quickly.
- `root user detected. Typical installs should be done as a regular user.`: you typed it with `sudo` in front. Press **Ctrl + C**, then repeat it without `sudo`. If you already answered `y` to `Are you really sure you want to install as root ? (y/N) ?`, Node-RED is installed for the user `root`. First delete its service file with `sudo rm /lib/systemd/system/nodered.service`, then run the script again without `sudo` so that it's installed for `budi`. Without that delete step, the script keeps the old service (`Skipped - existing script is customized.`), and Node-RED keeps running as `root`.
- `Sorry - cannot connect to internet - not going to touch anything.`: the Pi can't reach the internet. Check with `ping -c 3 nodered.org`; the LAN cable and the router are the first suspects (Module 12).
- The checklist contains a red **✘**: read the line above it, then run the script once more. This script is safe to run again and again; it's also used to update Node-RED.

</details>

<details>
<summary><b>The editor won't open: <code>This site can’t be reached</code> or it keeps spinning</b></summary>

1. **On the Pi**, check the service: `systemctl status nodered`. It must say `active (running)`. If it says `inactive (dead)`, you haven't run `sudo systemctl enable --now nodered.service` yet (Quick Win step 1.6); after the Pi restarts, a service that hasn't been enabled doesn't start by itself.
2. The service starts, but keeps failing (`activating (auto-restart)`)? See the reason with `node-red-log`. The two most common:
   - `Error: port in use`: another Node-RED is already using door 1880, usually because you ran `node-red` in the SSH terminal (for example before step 1.6), so the service can't get the door. Close the one in the terminal with **Ctrl + C**.
   - `Error loading settings file`: `settings.js` is broken because it was edited by hand. Run `node-red admin init` again to recreate it (answer **Yes** when asked whether to overwrite the old file), then `node-red-restart`.
3. Is the address right? The editor is at door **1880**: `http://192.168.1.37:1880`, with `http`, not `https`. The laptop and the Pi must be on the same home network.

</details>

<details>
<summary><b>Can't log in: <code>Login failed</code></b></summary>

- **Username** is the name of the **editor** account from `node-red admin init` (in this module: `admin`), not `budi`. The password is the editor password too, not the Pi's password.
- Forgot the password? **On the Pi**, run `node-red admin init` again, answer **Yes** to overwrite `settings.js`, and fill in all the answers again as in the Quick Win (use the **same** passphrase as before if you remember it; if not, fill in a new one; after Node-RED starts again, the editor warns `Credentials could not be decrypted`, and the old credentials file is emptied on the next **Deploy**, which is safe this week because the broker has no password yet). Then run `node-red-restart`. Your flows aren't lost, because they're saved in `flows.json`.

</details>

<details>
<summary><b>An MQTT node keeps saying <code>disconnected</code> or <code>connecting</code></b></summary>

1. Is the broker running? **On the Pi**: `systemctl status mosquitto` must say `active (running)` (Module 12). Laptop path with a real Node 1: connect MQTTX with the **Via laptop IP** connection; if that fails, check the Mosquitto service on your laptop and its IP address (Practice 7 of Module 12). Node 1 in Wokwi: connect MQTTX with the **Public broker** connection; if that fails, check your internet connection.
2. In the broker node (`Mosquitto on the gateway`), **Server** must be `localhost` and **Port** `1883`. Node-RED and Mosquitto are on the same Pi, so no IP address is needed. There's one exception: if your Node 1 is in Wokwi, whether on the laptop path or on the Pi, fill in **Server** with `broker.emqx.io` (table 8.2), because the Wokwi Node 1 only connects to the public broker.
3. **Client ID** must be empty. If it holds Node 1's `device_id`, the broker keeps kicking one of them out, and Node 1 and Node-RED take turns getting disconnected.
4. Are there two broker nodes? Open the **Configuration nodes** panel (the gear icon in the row of small icons at the bottom right corner of the editor). If there are two `mqtt-broker` nodes, choose the same one in every MQTT node, then delete the unused one (the one with a dashed outline). When you click **Deploy**, Node-RED sometimes reminds you: `You have some unused configuration nodes.`

</details>

<details>
<summary><b>The debug panel is empty, although Node 1 is on</b></summary>

- The debug node is turned off: the button on its right side is faded. Click it to turn it on.
- The debug panel's filter is set to `selected nodes`, or to `current flow` while the debug node is on another tab. Choose **all nodes** in the panel's filter list.
- The topic in **mqtt in** is mistyped, for example a different `device_id` or an extra space. Compare it with the topic shown in MQTTX.
- Your Node 1 is in Wokwi, but the broker node's **Server** is still `localhost`: the mqtt in node still says `connected` because the broker on your Pi or laptop is running, while the Wokwi Node 1 publishes its messages to `broker.emqx.io`. Fill in **Server** with `broker.emqx.io` (table 8.2).
- Not deployed yet: there's a blue dot above the node.

</details>

<details>
<summary><b>Dashboard: <code>Please add some Dashboard 2.0 nodes to your flow and re-deploy.</code> or a 404 page</b></summary>

- That message means no widget has been deployed yet. Click **Deploy**, then reload the page.
- The address is `http://192.168.1.37:1880/dashboard/home`: the word `dashboard`, then your page's **Path**. A **Path** that doesn't start with `/` makes a strange address; fix it in the page settings.
- `Cannot GET /ui`: that's the Dashboard 1 address from old tutorials. Dashboard 2 is at `/dashboard`.
- `Cannot GET /dashboard/home`: no dashboard has been deployed yet. This address only comes alive after Dashboard 2 is installed (Practice 3.1) and its first widget is deployed (Practice 3.2).
- `Connection Lost` appears with `Attempting to reconnect to server...`: Node-RED is restarting, or your phone left the home Wi-Fi. Wait, or make sure the phone isn't using mobile data.
- The phone says `This site can’t be reached` or keeps spinning, although the laptop can open the same address: the phone isn't connected to the **same** home Wi-Fi as the Pi (not mobile data, not a guest Wi-Fi), or the address was opened as `https`. Type it in full, starting with `http://`.
- The `dashboard 2` category doesn't appear after Practice 3.1, or **Manage palette** tells you that the installation failed: the Pi needs the internet to download the package. Check **on the Pi** with `ping -c 3 nodered.org`, then repeat Practice 3.1.

</details>

<details>
<summary><b>A widget doesn't show up, or the gauge points at 0 and the chart is empty</b></summary>

- A widget without a **Group** never shows up, and Node-RED logs `No group configured`. Open the widget and choose a group.
- The gauge sits at **0**, or the tank at **0%**: look at the debug panel. If `temperature` or `water_level` is `null`, the sensor failed to read; the `is not null` guard (Practice 4.1) deliberately holds that value back. If the guard isn't in place yet, `null` shows up as the minimum value.
- **Value** holds just `msg.payload` (without `.temperature`): the widget receives the whole object and can't display it. Fill in `payload.temperature`.
- The **Output** of the mqtt in node was changed to `a String`: every `payload.temperature` becomes empty. Change it back to `auto-detect (parsed JSON object, string or buffer)`.
- The chart is empty: **Series** isn't of type **JSON** `["temperature","humidity"]` yet, or the chart was just deployed and hasn't received a message yet. Also remember that the chart's history is lost every time Node-RED restarts.

</details>

<details>
<summary><b>The switch keeps spinning and never moves (or it moves, but the relay stays silent)</b></summary>

A switch with **Indicator** `Switch icon shows state of the input` only moves after an `ack` arrives. If it keeps spinning:

1. Check `watch cmd` in the debug panel: does the command go out? If not, the wire from the switch to `make cmd` isn't connected yet.
2. The command goes out, but the relay stays silent: look at the status under the **mqtt out** node. `disconnected` means the command is thrown away without an error. Also check the **Topic** of mqtt out: `msh/<your device_id>/cmd`.
3. The relay clicks, but the switch keeps spinning: the path `ack Node 1` → `fan state` → switch isn't connected yet, or the change node doesn't take `payload.state.fan` correctly (for example, because of a typo).
4. Node 1 is off or not connected: the status text on the dashboard says `offline`. Without an `ack`, an honest switch simply doesn't move.
5. The opposite symptom, where the switch moves, but the relay doesn't go "click": the MB102 isn't on yet. The ESP32 gets its power from USB, so it still answers with an `ack`, while the relay needs 5 V from the MB102 (🚨 in Module 11). Turn on the MB102, then tap the switch again.

</details>

<details>
<summary><b>Node 1 ignores the second command and the ones after it</b></summary>

Node 1 ignores a command whose `id` is the same as one of the last eight commands (Module 11). If the first command is carried out, but the next ones aren't:

- The `id` doesn't change. Make sure `make cmd` uses `"nr-" & $string($millis())`, **not** `_msgid`: dashboard widgets reuse a stored message, so `_msgid` can be the same on every click.
- Check `watch cmd` in the debug panel: every command must have a different `id`.

</details>

<details>
<summary><b>The contract checker prints <code>FAIL</code> for commands from Node-RED</b></summary>

- `ts` is refused: the expression uses `$now()` without a pattern, so it has milliseconds (`…:58.123Z`). Use `$now("[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]Z")` exactly.
- `field "…" is not in the data contract`: the `make cmd` expression contains an extra field. Only `id`, `ts`, `action`, `target`, and `value` are allowed.
- `value` has the wrong type: the switch sends the text `"true"` instead of the boolean `true` (check that **On Payload** is of type boolean), the watering button sends the text `"5"` (change the type of **Payload** to **number**), or the curtain slider uses a fractional **step**, so `value` isn't a whole number.
- The `cmd` message is marked `[retained]` even though its stamp is `PASS` (this mark shows up as soon as the checker is run again): **Retain** in the mqtt out node is empty or `true`. Choose `false`, then clear that retained message from MQTTX (Module 11, **Clear Retained Message**).

</details>

<details>
<summary><b>The fan keeps switching on and off, never switches on by itself, or never switches off</b></summary>

- **It keeps switching on and off**: the threshold numbers in the switch node are swapped or equal, for example rule 1 `> 28` and rule 2 `< 30`. A temperature between the two matches **both** rules at once, so every reading produces `true`, then `false`. Rule 1 must use the higher on threshold (`> 30`), and rule 2 the lower off threshold (`< 28`).
- **The same command is sent every 10 seconds** (`watch cmd` is busy even though the decision doesn't change): the `only when it changes` filter was placed **after** `make cmd`, or isn't there at all. The right order: hysteresis → fan on/off → filter → `make cmd`.
- **It switches on as soon as it's deployed**: the room temperature is already above the on threshold. That's normal; use the test thresholds from Practice 6.1.
- **It never switches on**: the temperature never passes the on threshold (hold the sensor longer), or the **Property** of the `hysteresis 30/28` node is still `msg.payload` (the whole object), not `msg.payload.temperature`. Also make sure the hysteresis is connected from `DHT22 read?`, and the filter is connected to `make cmd`.
- **It switches on, but never switches off**: the off threshold is equal to or below the room temperature, so the reading never drops past it. Use the test thresholds from Practice 6.1.
- **The fan turns off by itself when the sensor is unplugged**: the hysteresis is connected straight from `telemetry Node 1`, without the `null` guard, so `null < 28` is treated as true.
- **The filter's mode** is `block unless value changes (ignore initial value)`: the first decision is deliberately held back. Choose `block unless value changes`.

</details>

<details>
<summary><b>Laptop path: <code>node-red</code> isn't recognized, or the phone can't open the laptop's dashboard</b></summary>

- `node-red : The term 'node-red' is not recognized…`: the terminal was opened before the installation finished. Close it, then open a new terminal.
- `node-red.ps1 cannot be loaded because running scripts is disabled on this system`: run `node-red.cmd`, or follow the PowerShell fix in 🚨 of Module 4.
- `Unsupported version of Node.js` and `Node-RED requires Node.js v22.9 or later`: update Node.js to version 24 as in Module 4.
- The editor `http://localhost:1880` won't open (`This site can’t be reached`): Node-RED on the laptop hasn't been started, for example after the laptop restarted. Open a terminal, type `node-red` (Practice 8.1 step 4), then leave the terminal open.
- The phone can't open `http://<laptop IP>:1880/dashboard/home`: Node.js doesn't have the firewall permission for private networks yet (Practice 8.3), the laptop's Wi-Fi has the **Public** profile, or the phone is using mobile data.

</details>

---

## 🔬 Technical Deep Dive (optional)

You can skip this section. It's for those of you who want to know what happens behind the boxes and wires.

<details>
<summary><b>The same hysteresis with a function node and JavaScript</b></summary>

The four hysteresis nodes from Practice 6 can be replaced with **one** **function** node holding JavaScript, the same language as in Module 4. Inside a function node, `msg` is the incoming message, `return msg;` passes it on, and `return null;` stops it. Memory between messages is kept with `context.get()` and `context.set()`:

```javascript
// Fan automation with hysteresis: on above 30 °C, off below 28 °C.
const temperature = msg.payload.temperature;
if (typeof temperature !== "number") {
    node.status({ fill: "grey", shape: "ring", text: "temperature not read" });
    return null; // a failed reading (null): don't change anything
}
const fan = context.get("fan"); // the last decision (undefined right after starting)
let newState = fan;
if (temperature > 30) {
    newState = true;
} else if (temperature < 28) {
    newState = false;
}
node.status({ fill: "blue", shape: "dot", text: temperature + " °C, fan " + (newState === true ? "ON" : newState === false ? "OFF" : "?") });
if (newState === undefined || newState === fan) {
    return null; // no change: no command is sent
}
context.set("fan", newState);
msg.topic = "fan";
msg.payload = newState;
return msg; // on to make cmd
```

The upside: one box, logic you can read from top to bottom, and `node.status()` writes the last state under the node. The downside: code can't be "taken in at a glance" like boxes and wires, and every typo only shows up when a message passes through (it appears in the debug panel as an error). For beginners, the four built-in nodes are easier to check; for complicated rules, one function node is tidier. Both keep what they remember in working memory, so that memory is empty again every time Node-RED restarts or the flow is deployed again.

</details>

<details>
<summary><b>How Dashboard 2 talks to your phone</b></summary>

When the phone opens `http://192.168.1.37:1880/dashboard/home`, Node-RED sends it a web app (built with the Vue framework). After that, the phone and Node-RED stay connected through **socket.io**, a two-way connection on top of WebSocket, on the same door as the editor (1880), through the path `/dashboard/socket.io`. Node-RED's log writes two lines about the dashboard when it starts:

```text
[info] [ui-base:Mini Smart Home] Node-RED Dashboard 2.0 (v1.33.0) started at /dashboard
[info] [ui-base:Mini Smart Home] Created socket.io server bound to Node-RED port at path /dashboard/socket.io
```

Every message that reaches a gauge node is passed through that connection to **every** phone and laptop that has the dashboard open, so the gauges on two phones move together. The other way around, a switch click on one phone is sent to Node-RED, which passes it on to `make cmd`. Because the switch's state is taken from the `ack`, the second phone sees the switch slide too.

The dashboard is **not** protected by the editor password, because it's served by the "HTTP server for nodes", not by the editor's server. Node-RED has an `httpNodeAuth` setting in `settings.js` for putting one username and password on the `/dashboard` page, but complete protection is only designed properly from Modules 20–21 on (user accounts, broker passwords), and TLS encryption follows in Module 27.

</details>

<details>
<summary><b>Node-RED vs Home Assistant</b></summary>

**Home Assistant** is a very popular open-source smart home platform, with the motto *open source home automation that puts local control and privacy first*. How it differs from Node-RED:

| | Node-RED | Home Assistant |
| :--- | :--- | :--- |
| What it is | a general-purpose data flow tool: messages from anywhere, processed, sent anywhere | a complete smart home platform: thousands of device integrations, automations, dashboards, a phone app |
| How it's installed on a Pi | on top of Raspberry Pi OS, next to Mosquitto (this week) | most complete as **Home Assistant OS**, which is written to the card and replaces everything on it |
| MQTT | the mqtt in/out nodes, version 3.1.1 or 5 | an MQTT integration that requires an MQTT version 5 broker, with a discovery feature (devices announce themselves) |
| Needs | light | a Pi 4/5 with at least 2 GB of RAM and a card of at least 32 GB |
| Good for | learning data flows, prototypes, "glue" between systems | homes that use many off-the-shelf devices |

The two can even be used together: Home Assistant OS has a community app (formerly called an add-on) for running Node-RED inside it. This curriculum deliberately doesn't use Home Assistant, because our goal is to **build** our own IoT system, from the firmware to the backend, not to assemble a ready-made product. The question "when to buy a ready-made platform, and when to build your own" comes up again in Module 25.

</details>

<details>
<summary><b>After Module 16: Node-RED retires as the brain</b></summary>

From Module 16 on, the automation rules move to a TypeScript backend that you write yourself, complete with a database, tests, and a history of changes in Git. At that point, the fan automation flow in Node-RED is **turned off** (for example by deleting the wire from `DHT22 read?` to `hysteresis 30/28`) so that there are never two brains giving commands to the same fan. Dashboard v0 may stay alive as a backup view, and debug nodes remain useful for peeking at MQTT traffic. This pattern is common in industry: Node-RED is used to try out ideas quickly, and the ideas that prove useful are then rewritten in the main system.

</details>

---

## 🧩 Independent Challenges

Three levels, from changing a little to building your own. The answer keys for Levels 1 and 2 are in collapsible sections; Level 3 deliberately only gets hints. Everything is done in the Node-RED editor, so readers on the laptop path can do them the same way.

### Level 1 — A light chart (a small change)

Add a second chart to the **Chart** card: Node 1's `light` value over the last hour. This chart is deliberately separate from the temperature and humidity chart, because its scale is different (`0`–`4095`, not `0`–`100`). Once the chart is running, cover the LDR sensor with your finger for a few seconds, then look at the dip in the chart.

Hint: copy the chart node from Practice 4.4 (**Ctrl + C**, **Ctrl + V**), then change three of its settings.

<details>
<summary><b>Level 1 answer key</b></summary>

Change the copied chart node to: **Label** `Light (last hour)`, **Series** of type **JSON** `["light"]`, and **Y-Axis** **min.** `0`, **max.** `4095`. **Group** stays `[Home] Chart`. Connect it from `telemetry Node 1` (not from `DHT22 read?`, because `light` doesn't come from the DHT22 and is never `null`), then click **Deploy**. On the phone and on the laptop alike, the new chart appears below the temperature chart, because the **Chart** card is only 6 columns wide, the same as the width of one chart. To put the two side by side on the laptop, open the settings of the `Chart` group (the pencil icon on the **Group** line) and change **Size** to 12 columns.

</details>

### Level 2 — A "Fan automation" switch (fill in the blanks)

Sometimes the people at home want the fan **not** to be controlled automatically, for example while they sleep. Add a **Fan automation** switch to the **Controls** card. When that switch is off, the automation from Practice 6 stops sending commands; the ordinary **Fan** switch can still be used. Fill in the blanks (`____`) of this design:

```text
[Fan automation switch] → [change: Set ____ to msg.payload]

[DHT22 read?] → [switch "automation on?": Property flow.fan_automation
                  rule 1: ____
                  rule 2: otherwise]
                      output ____ → [hysteresis 30/28]
```

Hint: Node-RED has a "whiteboard" that every node on one tab can read, called the ***flow context***, and its entries are pointed to with the prefix `flow.`. Before the switch is touched for the first time, its entry is empty, not `false`.

<details>
<summary><b>Level 2 answer key</b></summary>

- The **Fan automation** switch (`dashboard 2`, **Group** `[Home] Controls`, **On Payload** `true`, **Off Payload** `false`, **Indicator** left at `Switch icon shows state of the output`) is connected to a change node with the rule **Set** `flow.fan_automation` (choose the type **flow.** in the left column) **to the value** `msg.payload`.
- The switch node (`function`) `automation on?`: **Property** of type **flow.** `fan_automation`; rule 1 **is false**; rule 2 **otherwise**. Output **2** (the bottom one) is connected to `hysteresis 30/28`, while output 1 is left without a wire: messages that go that way stop there. The old wire from `DHT22 read?` to `hysteresis 30/28` is deleted.

Why **is false** and **otherwise**, not **is true**? Because before the switch is touched for the first time (and every time Node-RED restarts), `flow.fan_automation` is empty. With **is true**, the automation is quietly off until the switch is touched; with **is false**, the automation keeps running unless someone at home deliberately turns it off. One side effect: every time Node-RED has just started, the **Fan automation** switch shows off even though the automation is running. That's because the switch hasn't received any value yet. To make what it shows match, add an **inject** node with `msg.payload` of type **boolean** `true`, check **Inject once after** and leave its number at `0.1`, then connect it to that switch and to its change node.

</details>

### Level 3 — Scheduled morning watering (from scratch)

Build a flow that waters the plants **every morning at 6:00 a.m.** for 5 seconds, but **only if** the last soil reading is below 60%. Also show the time of the last watering on the dashboard.

Hints:

1. An **inject** node can send a message by itself at a certain time: **Repeat** → `at a specific time`. The time follows the Pi's time zone (`Asia/Jakarta`).
2. For "the last soil reading", save `msg.payload.soil` from every `telemetry` into `flow.last_soil` with a change node, then check its value with a switch node when the inject sends its message.
3. Send the command through the existing `make cmd` (`msg.topic` `pump`, `msg.payload` `5`).
4. Think about "two brains": Node 1 already waters by itself when the soil is below the `soil_watering` threshold (default 30%), and it still refuses to water if the tank water is low. Why is scheduled watering in Node-RED still safe alongside that rule, and when does it actually cause harm?

---

## ➕ Add-on to "Mini Smart Home"

This week, the Mini Smart Home gateway gets a **face** and a **first brain**: dashboard v0, which you open from the phone, and a fan automation that works 24 hours a day. Both live in Node-RED, on the same Pi as the Mosquitto broker from Module 12. **Node 1 doesn't change**: it stays v1.2.1, and not a single line of code is uploaded again.

![Diagram of Mini Smart Home after Module 13: the gateway now has a face (dashboard v0) and a first brain (fan automation); a dashed line means it comes later. Center, the Raspberry Pi gateway at 192.168.1.37, holding Mosquitto (a service, door 1883) and Node-RED (a service, door 1880) with dashboard v0 and the 30/28 fan automation; the two exchange messages through localhost:1883. Left, Node 1 v1.2.1, unchanged this week, sends telemetry, status, vitals, and ack to Mosquitto and receives cmd from it. Right, the phone opens /dashboard/home, and the laptop opens the editor :1880, MQTTX, and SSH; GitHub keeps edge/node-red-flows.json, exported from Node-RED (the line labeled export). Bottom, coming later: Node 2 "Garden" (Module 14, via Node 1) and the TypeScript backend (Module 16, the brain moves here). Note: Node 1 stays v1.2.1 because the data contract lets new listeners join without changing the device; Node 1's local rules (automatic watering and the automatic lamp) keep running, and Node-RED only handles the fan.](assets/project-diagram-module-13.png)

> 🖥️ **Tools used:** the Node-RED editor in the laptop's browser, the phone, Node 1 running from its charger, an SSH terminal to the Pi, **VS Code** with the `mini-smart-home` folder, and **GitHub Desktop**.
>
> Laptop path (including Node 1 in Wokwi): Node-RED on the laptop from Practice 8 replaces Node-RED on the Pi, with the addresses from table 8.2. Do steps A, D, and E. Skip B and C, because both need the Pi: Node-RED on the laptop stops when the laptop sleeps or its terminal is closed, so the "without the laptop" test is impossible anyway. Have a Pi, but your Node 1 is still in Wokwi? Do all the steps except B, which can only be proven once you have your board, because the Wokwi simulation stops too when the laptop is off.
>
> ⭐ **Required** — the Module 13 completion requirement.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `edge/node-red-flows.json` | **new**: all the Node-RED flows, that is, dashboard v0 and the fan automation (Practice 7, updated in step D) |
| `edge/README.md` | a new section, **Node-RED and the dashboard (Module 13)**: how to reinstall Node-RED and restore the flows (step C) |
| `firmware/node-1-home/` | unchanged, still v1.2.1 |

### A. Tidy the flow: description, labels, and debug nodes

A tidy flow is easy to read again three months from now, both for you and for other people.

1. **In the Node-RED editor**, delete the `Practice` tab from Practice 1 so that your backup only holds the project's flows: double-click the `Practice` tab, click **Delete** in the `Edit flow: Practice` panel, then click **Deploy**.
2. Double-click the `Mini Smart Home` tab (its name from Practice 2.1). In the **Description** box of the `Edit flow: Mini Smart Home` panel, write one sentence, for example `Dashboard v0 and fan automation (Module 13).`, then click **Done**. This description is saved in the export file too.
3. Give each group of nodes a title with a **comment** node (category `common`). Drag one comment node above each group, double-click it, then fill in **Name**:
   - `1 · Sensors: Node 1 telemetry and status to the dashboard`
   - `2 · Fan automation: on > 30 °C, off < 28 °C`
   - `3 · Control from the phone: widget → make cmd → mqtt out`
   - `4 · Node 1 replies (ack) → the real switch state`

   A comment node doesn't do anything; it's just writing on the workspace. You may replace the `·` and `→` signs with ordinary hyphens.
4. Arrange the nodes so that as few wires as possible cross each other, roughly as in the picture below. To move a whole group at once, drag a selection box from an empty area until it covers that group, then drag one of the selected nodes. Where the nodes sit doesn't change how the flow works; it only makes the flow easier to read.

![Screenshot of the whole dashboard v0 flow on the Mini Smart Home tab, with the editor's left and right panels hidden. Section 1, Sensors: the mqtt in node telemetry Node 1 is connected to the debug node watch telemetry, the switch DHT22 read? (to the Temperature gauge, the Humidity gauge, and the Temperature & humidity chart), the switch water read? (to the Water tank gauge), the Soil gauge, and the Light and Motion texts; the mqtt in node status Node 1 goes to the Node 1 text and the debug node watch status. Section 2, Fan automation, on above 30 °C and off below 28 °C: a wire from DHT22 read? to the switch hysteresis 30/28, then the change nodes fan on and fan off, then the filter only when it changes, then on to the change node make cmd. Section 3, Control from the phone: the Fan switch, the Lamp switch, the Water for 5 seconds button, and the Curtain (degrees) slider go to make cmd, then to the mqtt out node cmd Node 1 and the debug node watch cmd. Section 4, Node 1 replies: the mqtt in node ack Node 1 goes to the change nodes fan state, lamp state, and curtain state (their wires go back to the switches and the slider), the Last reply text, and the debug node watch ack. The titles of the four sections are comment nodes. The debug nodes watch telemetry, watch status, and watch ack are already turned off (the button on their right side is faded), while watch cmd stays on. All four MQTT nodes (three mqtt in and one mqtt out) show connected.](assets/flow-dashboard-v0.png)

*Real screenshot of Node-RED 5.0.8 (Apache 2.0 license) from the author's laptop; titles and captions by the author.*

5. Silence the debug nodes that don't need to keep talking, as in Practice 1.4: click the green button on the right side of `watch telemetry`, `watch status`, and `watch ack` until the button fades. The nodes stay where they are and can be turned on again at any time with the same click. Leave `watch cmd` on: every time the automation or a switch sends a command, the debug panel logs it.
6. Click **Deploy**.

### B. ⭐ Test without the laptop, then leave it for 24 hours

A good gateway keeps working while your laptop is off. This is the real test of the week.

1. Before you turn off the laptop, read steps 2–5 all the way through, or open this module on your phone, as in ➕ D of Module 12. Also make sure the room temperature is below the off threshold in the `hysteresis 30/28` node, so that the fan switches off by itself and the test in step 4 is easy to see; if after Practice 6 you set a threshold lower than the room temperature, use the test thresholds from Practice 6.1 again, then click **Deploy**. After that, close the Node-RED editor tab in the browser, then turn off the laptop (or close its lid so that the laptop sleeps).
2. On the phone, open `http://192.168.1.37:1880/dashboard/home`. Node 1's status shows `online`, and the temperature and humidity numbers keep changing every 10 seconds.
3. Tap the **Lamp** switch: the lamp relay goes "click", its indicator LED lights up, the switch slides after the `ack` arrives, and **Last reply** shows `done`. Tap it once more to turn the lamp off.
4. Hold the DHT22 as in Practice 6.3 until its temperature passes the on threshold. The fan turns on by itself, and the **Fan** switch on the phone slides along. All of this happens without the laptop: the dashboard and the automation live on the gateway.
5. Let everything run until tomorrow. The next day, turn on the laptop and log in to the Pi over SSH (`ssh budi@192.168.1.37`). **On the Pi**, run:

   ```bash
   systemctl status nodered
   ```

   Look at the `Active:` line. It says `active (running) since …`, and the time after it is still yesterday, for example `since Sun 2026-10-18 10:45:01 WIB; 1 day 2h ago` (example). That means Node-RED kept running without restarting even once. Press **q** to get back to the prompt. On the phone, the chart shows the last hour with unbroken lines.

If the Pi restarted at some point, for example because of a power cut, the chart starts again from empty. Dashboard 2 keeps the chart's history in memory, and what's in memory is lost when Node-RED restarts. History that lasts for years is the database's job, in Modules 17–18. The switches, too, only show the relays' state after the next command is answered with an `ack`.

### C. The gateway recipe: add Node-RED

The `edge/README.md` recipe from Module 12 only covers installing the broker so far. Add the Node-RED section so that the gateway can be rebuilt completely.

1. In the laptop's browser, open [`mini-smart-home/edge/README.md`](../../mini-smart-home/edge/README.md) on GitHub. Its last section, **Node-RED and the dashboard (Module 13)**, holds a small table and steps 8–12.
2. Click the **Raw** button above the file's contents so that they show as plain text. Select the text from the line `## Node-RED and the dashboard (Module 13)` to the end of the file, then copy it (**Ctrl + C**).
3. In VS Code, open your own `edge/README.md`. Click at the end of the very last line, press **Enter** twice, then paste (**Ctrl + V**). Also copy the `node-red-flows.json` row from the **Files in this folder** table on that GitHub page, then click at the end of the `gateway-pi.conf` row of the same table in your file, press **Enter** once, and paste it there. Don't leave an empty line between table rows; a row that's separated by an empty line doesn't show up as part of the table.
4. Adapt its contents to your gateway: the address `192.168.1.37` (press **Ctrl + H** in VS Code, macOS: **Cmd + Option + F**, as in ➕ E of Module 12), the username `budi` if yours is different, and the automation thresholds if you use other ones. In your file's opening paragraph, also replace `about 30 minutes` with `about an hour`, because the recipe now installs Node-RED too. Save with **Ctrl + S**. **Never write the editor password or the *passphrase*** in this file.

### D. Export the tidied flow again

Your flow changed in step A, so the backup file from Practice 7 needs to be updated.

1. **In the Node-RED editor**, repeat Practice 7.1: main menu → **Export** → **all flows** → **formatted** → **Download**.
2. **On the laptop**, open the **Downloads** folder. First rename `flows.json` to `node-red-flows.json` (if the `.json` extension isn't shown, type just `node-red-flows`, as in Practice 7.2), then move that file to the **Documents → GitHub → mini-smart-home → edge** folder. Because a file with the same name is already there from Practice 7, Windows asks what to do: choose **Replace the file in the destination**. On macOS, choose **Replace**. If the browser named the download `flows (1).json`, use that newest file.
3. In VS Code, open `edge/node-red-flows.json`. Press **Ctrl + F** and search for a piece of the tab description you wrote in step A, for example `fan automation (Module 13)`: if it's found, the file is the new one. Also search for `Practice` and `password`: neither of them is found.

### E. ⭐ Save to GitHub

1. In GitHub Desktop, choose the **`mini-smart-home`** repository. The **Changes** list holds `edge/node-red-flows.json` and `edge/README.md` (laptop path: only `edge/node-red-flows.json`, because step C was skipped). There must be no `flows_cred.json` or `settings.js` in it: both stay on the Pi and never go into the repository. Fill in **Summary** with `Module 13: Node-RED dashboard v0 and fan automation`, click **Commit … to main**, then **Push origin**.
2. In the **`learn-iot`** repository, write this module's notes: in VS Code, **File → New Text File**, then **File → Save As…** with the name `notes-module13.md` in the **Documents → GitHub → learn-iot → module-13** folder (create the `module-13` folder if it doesn't exist yet). Write down your dashboard's address, the automation thresholds you used for testing and your final thresholds (Practice 6.1), the `PASS` lines from the contract checker (Practice 5.6; if its terminal is already closed, run the checker again and tap the **Fan** switch twice so that the fan goes back to how it was), and the result of step B (laptop path: your laptop's IP address instead). Commit and push that too.

**Evidence for passing Module 13** (compare it with ✅ below): the phone opens the dashboard from the gateway, the fan switch works and follows the `ack` (Practice 5), the automation turns on the fan when the DHT22 is warmed up, also while the laptop is off (Practice 6, step B), and the flows are saved in the repository (Practice 7, steps D–E).

---

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Node-RED** | An open-source low-code tool for building programs from boxes and wires in the browser; it runs on the Pi gateway as the `nodered` service. |
| ***Low-code*** | A way of making programs where most of the work is choosing and connecting, not writing code. |
| ***Flow*** | A set of nodes and wires on one tab of the Node-RED editor. |
| ***Node*** | One box in a flow that does one job: listening to MQTT, changing a message, showing a widget, and so on. |
| **`msg`** | The message that travels along the wires; it mainly holds `msg.payload` (the content) and `msg.topic` (the topic). |
| ***Deploy*** | Sending the flows from the editor to the Node-RED that runs on the Pi. Shortcut: **Ctrl + D**. |
| **Debug node** | A node that shows messages in the **Debug messages** panel; Node-RED's magnifying glass. |
| ***Config node*** | A node that doesn't show on the workspace and is shared, for example the broker connection `Mosquitto on the gateway` and the dashboard page. |
| **JSONata** | A small expression language for reading and building JSON data, used in fields of the **J: expression** type. |
| **Dashboard 2** | The `@flowfuse/node-red-dashboard` package, which adds widgets and web pages at `/dashboard`. |
| ***Widget*** | A part of the dashboard that shows on the screen: a gauge, a chart, text, a switch, a button, or a slider. |
| **Hysteresis** | Two thresholds for one decision (on above 30 °C, off below 28 °C) so that a device doesn't keep switching on and off around a single threshold. |
| ***Flow context*** | A "whiteboard" that every node on one tab can read, pointed to with the prefix `flow.`; its contents are lost when Node-RED restarts. |
| **`adminAuth`** | The setting in `settings.js` that makes the Node-RED editor ask for a username and a password. |
| **Exporting/importing flows** | Saving flows to a JSON file (without credentials) and putting them back into any Node-RED. |

## 📝 5-Question Quiz

1. What's the difference between clicking **Done** in a node's settings window and clicking **Deploy**? What does a blue dot above a node mean?
2. Why must the **mqtt out** node for commands be filled in explicitly with **Topic**, **QoS** `1`, and **Retain** `false`, instead of being left empty?
3. The **Fan** switch on the dashboard uses **Indicator** `Switch icon shows state of the input` and receives the `ack`. What do you see on the phone if Node 1 is off and you tap the switch, and why is that better than a switch that slides right away?
4. Explain why the fan automation uses two thresholds (30 °C and 28 °C). Why must the **filter** node be placed **before** `make cmd`, not after it?
5. You export the flows and save them on GitHub, publicly. Do the editor password and the broker credentials get spread along with them? Which files in the `~/.node-red` folder must not be copied into the repository?

<details>
<summary><b>Answer key</b></summary>

1. **Done** only saves the node's settings in the editor, in the laptop's browser. Node-RED on the Pi doesn't change until you click **Deploy**, which sends the whole flow to the Pi and then runs it. A blue dot means that the node has been changed, but the change hasn't been deployed yet (Concept 2).
2. Empty fields are taken from the message that comes into that node. A message that comes from mqtt in carries a `msg.topic` like `msh/…/telemetry` and sometimes a `msg.retain` of `true`, so the command could be published to the wrong topic or become retained. A retained command is handed over by the broker again every time Node 1 connects, and carried out again as soon as Node 1's memory of `id`s is empty, for example after Node 1 restarts; that's what the Module 11 data contract forbids (Concept 4).
3. The switch only shows the waiting sign and never slides, because no `ack` arrives; the `Node 1` text even says `offline`. A switch that slides right away would "lie": the people at home would think the fan is on, when in fact the command never arrived. With the `ack` feedback, the screen always shows the relay's real state (Concept 6, Practice 5.2).
4. With one threshold, a reading that wobbles a little around 30 °C makes the fan switch on and off every 10 seconds. Two thresholds make a 28–30 °C band where the fan is left in its last state. The filter passes a message on only if its content differs from the last message; after `make cmd`, every message is always different, because its `id` is new. As a result, the filter never holds anything back, and a command is sent every 10 seconds (Concept 7).
5. No. An export never carries credentials; the editor password is saved (hashed) in `settings.js`, and the nodes' credentials in `flows_cred.json`, which is locked with the passphrase. The passphrase itself is written as-is in `settings.js`, so neither of those two files may be spread. The files that must not be copied into the repository: `settings.js`, `flows_cred.json`, and the hidden files `.config.*.json` and `.sessions.json` (Concept 8).

</details>

---

## ✅ Module 13 Completion Checklist

The completion requirement from the Syllabus: **your phone opens the Node-RED dashboard on the Pi, the fan button works, the automation turns on the fan when the sensor is warmed up, and the flow JSON is in your repository.** Laptop path: the same, with Node-RED on the laptop and the broker from table 8.2 (Practice 8); the dashboard is opened from the phone through the laptop's IP address (Practice 8.3).

- [ ] Node-RED 5 is installed on the Pi as the `nodered` service, which is `enabled` and `active (running)`, and it's still running after `sudo reboot` (Quick Win, Practice 2; laptop path: Node-RED 5 runs on the laptop with `node-red`, Practice 8).
- [ ] The Node-RED editor asks for a **Username** and a **Password** before it opens (Quick Win).
- [ ] I can explain `msg.payload`, **Deploy**, and what the debug node is for (Practice 1).
- [ ] The debug panel shows Node 1's `telemetry`, `status`, and `ack` (Quick Win, Practice 2).
- [ ] The phone opens `http://192.168.1.37:1880/dashboard/home` and shows the status, all five sensors, and the chart (Practices 3–4).
- [ ] The **Fan** switch on the phone turns the fan on and off, and the switch follows the `ack` (Practice 5).
- [ ] The contract checker prints `PASS` for commands from Node-RED (Practice 5.6).
- [ ] The automation turns on the fan when the DHT22 is warmed up and turns it off after it cools down, each time with **one** command (Practice 6).
- [ ] The dashboard and the automation keep working while the laptop is off, and Node-RED runs for 24 hours without restarting (➕ B; laptop path: skip it; Node 1 in Wokwi: once you have your board).
- [ ] `edge/node-red-flows.json` and the updated gateway recipe are committed and pushed to `mini-smart-home`, without any password (Practice 7, ➕; laptop path: `edge/node-red-flows.json` is enough).

> ➡️ **Next module:** Module 14 — Node 2 "Garden". Mini Smart Home gets a second, battery-powered sensor node in the garden that talks directly to Node 1 over ESP-NOW, without a router. Its data will show up on this Node-RED dashboard with its own `device_id`.

---

## 📚 Sources & Image Credits

**Documentation, source code, and pages used** (accessed October 2026):

- [Node-RED](https://nodered.org/) 5.0.8 ([its short history](https://nodered.org/about/)), [its source code](https://github.com/node-red/node-red/tree/5.0.8), and the [5.0 release notes](https://nodered.org/blog/2026/06/09/version-5-0-released): the editor layout (the palette, the Information and Debug panels); the **Deploy** button and its options; the keyboard shortcuts; the fields of the **mqtt in**, **mqtt out**, **change**, **switch**, **filter**, **inject**, and **debug** nodes; the log texts at startup; the **Export**/**Import** dialogs; and the credentials that aren't exported. Official documentation: [Running on Raspberry Pi](https://nodered.org/docs/getting-started/raspberrypi), [Running locally](https://nodered.org/docs/getting-started/local), [Securing Node-RED](https://nodered.org/docs/user-guide/runtime/securing-node-red), [Writing Functions](https://nodered.org/docs/user-guide/writing-functions), [Supported Node versions](https://nodered.org/docs/faq/node-versions), and the [Node-RED Cookbook](https://cookbook.nodered.org/) (the *report by exception* and *route on property* recipes).
- The official installer script [node-red/linux-installers](https://github.com/node-red/linux-installers/tree/v2.2.1) v2.2.1: its questions and their time limits, the checklist, Node.js 24 from NodeSource, the `nodered.service` unit file (`Restart=on-failure`, `RestartSec=20`), and the commands `node-red-start`, `node-red-stop`, `node-red-restart`, and `node-red-log`. The `node-red admin init` question-and-answer tool from the [node-red-admin](https://github.com/node-red/node-red-admin) 4.1.8 package.
- [FlowFuse Dashboard](https://dashboard.flowfuse.com/) (`@flowfuse/node-red-dashboard`) 1.33.0 and [its source code](https://github.com/FlowFuse/node-red-dashboard/tree/v1.33.0): how the dashboard, page, and group are created automatically; the fields of the gauge, chart, text, switch, button, and slider widgets; the column layout on phones; and how `null` values are handled. The statement that Dashboard 1 is deprecated is in [node-red-dashboard](https://github.com/node-red/node-red-dashboard).
- [JSONata](https://jsonata.org/) (the functions `$millis`, `$now` with a time pattern, `$uppercase`, and `$string`).
- Home Assistant: the [official site](https://www.home-assistant.io/), [installation on a Raspberry Pi](https://www.home-assistant.io/installation/raspberrypi), [Apps](https://www.home-assistant.io/apps/), and the [MQTT integration](https://www.home-assistant.io/integrations/mqtt/).
- [Node.js](https://nodejs.org/) (the release schedule and version 24 LTS), [NodeSource](https://github.com/nodesource/distributions), and the Debian 13 [nodejs](https://packages.debian.org/trixie/nodejs) package.
- [EMQX: public MQTT broker](https://www.emqx.com/en/mqtt/public-mqtt5-broker) (`broker.emqx.io`, and the warning that every message can be seen by others).

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The screenshots of the Node-RED editor and the dashboard were taken from Node-RED 5.0.8 and FlowFuse Dashboard 1.33.0 running on the author's laptop, with data from a mock Node 1; Node-RED and FlowFuse Dashboard are licensed Apache 2.0, and "Node-RED" is a trademark of the OpenJS Foundation. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-13`, `flow-node-msg`, `node-red-on-the-gateway`, `dashboard-2-structure` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The names of the nodes, widgets, and fields from Node-RED 5.0.8 and FlowFuse Dashboard 1.33.0; the addresses and `device_id` are only examples. | CC BY 4.0 |
| `command-and-ack`, `fan-hysteresis`, `project-diagram-module-13` (`.png` + `.svg`) | Original diagrams. The shape of `cmd` and `ack` from the Module 11 data contract; the temperature curve in the hysteresis chart was put together by the author to explain the idea, not recorded from a sensor. | CC BY 4.0 |
| `node-red-editor.png`, `flow-dashboard-v0.png` | Real screenshots of the Node-RED 5.0.8 editor from the author's laptop, with mock Node 1 data; marker numbers (editor picture), titles, and captions by the author. | Node-RED is licensed Apache 2.0 ("Node-RED" is a trademark of the OpenJS Foundation); images: CC BY 4.0 |
| `phone-dashboard.png`, `phone-controls.png` | Real screenshots of FlowFuse Dashboard 1.33.0 at the width of a phone screen (412 pixels) from the author's laptop, with mock Node 1 data; phone frame, numbers, and captions by the author. | FlowFuse Dashboard is licensed Apache 2.0; images: CC BY 4.0 |

**About the Expected output boxes.** Node-RED, Dashboard 2, and this module's flows were tested by the author on a laptop with Node-RED 5.0.8 and FlowFuse Dashboard 1.33.0 on top of Node.js 24. The dashboard v0 flow loads without errors. The fan automation sends exactly one command when the mock temperature rises past 30 °C and one more when it drops below 28 °C, and the Module 11 contract checker prints `PASS` for both commands. There's no Raspberry Pi on the author's desk, so the **Expected output** boxes from the Pi's terminal (the installer script, `node-red-log`) are marked **example**: the layout and text of every line are taken from the source code of the same program versions, while the times, the Node.js version number, and the other numbers are only examples.

---

[⬅️ Module 12](../module-12-raspberry-pi-and-linux/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 14 — Node 2 "Garden": Battery-Powered Sensors via ESP-NOW](../module-14-node-2-esp-now/README.md) ➡️**
