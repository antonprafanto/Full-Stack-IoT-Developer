# Module 12 — Raspberry Pi & Linux Basics: A Gateway That's Always On

🌐 **English** · [Bahasa Indonesia](../../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md)

*Phase 2 · Week 12 · Hardware: **Kit B** — a Raspberry Pi 5 or Pi 4, a *high-endurance* microSD card, the official power adapter, a LAN cable (see 🧰), or the **laptop path** without a Pi · Prerequisites: **Module 11** (the broker and Node 1 v1.2) and **Module 4** (the terminal) · Time: 8–10 hours, spread over the week*

[⬅️ Module 11](../module-11-mqtt-and-data-contract/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 13 ➡️](../module-13-node-red-dashboard/README.md)

---

In Module 11, Node 1 learned to talk through the **MQTT post office**, and we opened that post office on the laptop. The result was satisfying: readings flow in every 10 seconds, the status changes by itself, and commands are answered in an instant. But there's one big weakness: **that post office is only open while your laptop is on and its terminal is open.** This week we move it to a small computer that stays on 24 hours a day next to the router: the **Raspberry Pi**.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| The laptop gets closed, taken away, or restarted for an update: Node 1 loses the broker, and commands from the phone don't get through. | The broker runs in the laptop's terminal. | The broker moves to a Raspberry Pi **gateway** that's on 24 hours a day (Concepts 1–3, Quick Win, Practice 3) |
| You've never used a computer without a screen. | The Pi works *headless*, and all its settings are done by typing. | **SSH** and about 20 basic Linux commands (Concepts 4–5, Practice 1) |
| The broker's address can change after the router restarts. | The router lends out addresses through DHCP. | A **fixed address** for the Pi (Concept 6, Practice 2) |
| The broker has to be started by hand every time, and its log disappears with the terminal window. | The broker isn't a service yet. | A **systemd service** that starts and gets back up by itself, with a log you can read at any time (Concept 7, Practices 3–5) |
| A gateway that's on 24 hours a day can slowly break down. | The microSD card wears out, the power goes out, updates get put off. | A *high-endurance* card, the right way to shut down, backups, and a monthly check (Concept 8, Practice 6) |

By the end of the week, the Mini Smart Home has a **permanent gateway**: a Raspberry Pi named `gateway` with a fixed address, a Mosquitto broker that starts by itself every time the Pi starts, and a recipe in your repository for building it again. **Node 1 v1.2.1** connects to it, and the proof is simple: the laptop is shut down, and Node 1 stays connected. As in Module 11, everything is still inside your home network and the broker still has no password; locking it down is a job for Module 21.

![Module 12 roadmap. Top: the curriculum's six phases, from Phase 0 Foundations (Modules 1–4) to Phase 5 Operations and scale (Modules 26–32); Phase 2 Connectivity, Modules 10 to 15, is highlighted. Modules 1 to 11 are marked done, and Module 12 is marked YOU ARE HERE with the note: the MQTT post office moves to a Raspberry Pi that's on 24/7. Bottom: the box for this week's Module 12, 8 to 10 hours spread out, Kit B: Raspberry Pi, microSD card, LAN cable; ⭐ means required to pass. Left: QW, the Quick Win, your first Pi answers; P1, a Linux tour over SSH; P2, a fixed address for the Pi ⭐; P3, Mosquitto as a service on the Pi ⭐; P4, test: the service gets back up by itself ⭐. Right: P5, reading the logs ⭐; P6, looking after the gateway; P7, laptop path: the broker as a service; plus, Add-on: a permanent gateway, Node 1 v1.2.1 ⭐. Note at the bottom: no Raspberry Pi? On the laptop path, Practice 7 makes Mosquitto a service on your laptop; you can still do the Add-on, except the parts that need a Pi.](assets/roadmap-module-12.png)

> [!NOTE]
> **How to use this module.**
>
> - **The Pi is controlled from the laptop.** You don't need a monitor, keyboard, or mouse for the Pi. Every practice is done from a terminal on the laptop that's connected to the Pi over SSH (Concept 4).
> - **Every command box says where it runs:** **On the Pi** (the SSH terminal, prompt `budi@gateway:~ $`) or **On the laptop**. The username `budi`, the host name `gateway`, and the address `192.168.1.37` are only examples; use your own.
> - Boxes introduced by the words **Expected output** are only for comparing, not for typing. Every **Expected output** box from the Pi this week is marked **example**: its contents were put together from each program's documentation and source code (see 📚), while the names, numbers, dates, and version numbers on your Pi may be different.
> - **No Raspberry Pi yet?** Follow the **laptop path**: read Concepts 1–8, do Practice 7 (Mosquitto as a service on the laptop), then the ➕ section with your laptop's address. Its pass criteria are in ✅. Wokwi can't simulate a Raspberry Pi, and Node 1 in Wokwi keeps using a public broker, as in Module 11.
> - macOS users: replace **Ctrl** with **Cmd** to save, copy, and paste in windowed apps such as VS Code and Arduino IDE. In the Mac Terminal, including while it's connected to the Pi over SSH, command keys such as **Ctrl + C** and the nano keys (**Ctrl + O**, **Ctrl + X**) stay **Ctrl**; only copying and pasting text uses **Cmd + C** and **Cmd + V**.

> [!WARNING]
> **Safety rules this week.**
>
> 1. **The microSD card will be completely erased** when Raspberry Pi Imager writes it. Make sure that what you choose in Imager really is your microSD card, not a flash drive or a hard drive with important data on it. Unplug every other flash drive before you start.
> 2. **The broker on the Pi is open to the home network, without a password**, just like the one on the laptop in Module 11. **Never** set up *port forwarding* to the Pi on the router. Anyone connected to your home Wi-Fi can send commands to the relays; the lock is put on in Module 21.
> 3. **The Pi's password must be strong** and not used anywhere else: anyone on the home network who knows the password can get into the Pi over SSH. Don't write it in the repository or in your module notes.
> 4. **Shut down the Pi with the `sudo poweroff` command**, wait for its lights to give the safe sign (Pi 4: the green light goes out; Pi 5: the status light turns red; Concept 8), and only then unplug its adapter. Cutting the power while the Pi is writing to the card can damage the card.
> 5. **Use the official power adapter** (Pi 5: USB-C 27 W; Pi 4: USB-C 15 W). A phone charger that isn't strong enough makes the Pi restart by itself or damages its card.
> 6. **`sudo` means full authority.** Read every command with `sudo` again before you press **Enter**, especially ones that delete things.

This module follows the same rhythm as Modules 1–11. Open the collapsible sections in 🚨 (click a title to open it) only when you need them; you can skip the collapsible sections in 🔬. Every practice starts with a **🖥️** box that names the tools it uses.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🏆 Quick Win: your first Pi answers from the network (30 minutes)](#-quick-win-your-first-pi-answers-from-the-network-30-minutes)
4. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Gateway & edge](#1-gateway-and-edge-a-post-office-thats-always-open-at-home) · [2 Raspberry Pi](#2-raspberry-pi-a-complete-computer-the-size-of-a-business-card) · [3 Linux without a screen](#3-linux-and-raspberry-pi-os-lite-a-computer-without-a-screen) · [4 SSH](#4-ssh-a-remote-terminal) · [5 Folders, sudo, apt](#5-the-map-of-the-linux-house-folders-users-and-sudo) · [6 Fixed address](#6-a-fixed-address-the-post-office-mustnt-move-house) · [7 Services & systemd](#7-services-and-systemd-a-security-guard-who-never-sleeps) · [8 Looking after the gateway](#8-looking-after-the-gateway-the-microsd-card-power-and-backups)
5. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 Linux tour](#practice-1--a-linux-tour-over-ssh-40-minutes) · [2 Fixed address](#practice-2--a-fixed-address-for-the-pi-30-minutes) · [3 Mosquitto on the Pi](#practice-3--mosquitto-as-a-service-on-the-pi-30-minutes) · [4 Gets back up](#practice-4--test-the-service-gets-back-up-by-itself-20-minutes) · [5 Reading the logs](#practice-5--reading-the-logs-20-minutes) · [6 Looking after the gateway](#practice-6--looking-after-the-gateway-30-minutes) · [7 Laptop path](#practice-7--laptop-path-mosquitto-as-a-service-30-minutes)
6. [🚨 Troubleshooting](#-troubleshooting)
7. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
8. [🧩 Independent Challenges](#-independent-challenges)
9. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
10. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-12-completion-checklist)
11. [📚 Sources & Image Credits](#-sources--image-credits)

## 🎯 After this module you can…

- **Explain the role of the gateway and of *edge computing*** (computing at the edge) in a smart home, and when a task fits better on the ESP32 or on the Raspberry Pi.
- **Set up a Raspberry Pi without a monitor** (*headless*) with Raspberry Pi Imager, then log in to the Pi from the laptop over **SSH**.
- **Use about twenty basic Linux commands** comfortably: moving between folders, editing files with nano, installing programs with `apt`, and using `sudo` with care.
- **Give the Pi a fixed address** through a reservation on the router or with `nmcli`.
- **Run Mosquitto as a systemd service** that starts by itself when the Pi starts and gets back up by itself after a crash (a sudden death), then **read its logs** with `journalctl` and `tail`.
- **Look after the gateway**: check the voltage, the temperature, and the space on the card; back up the settings with `scp`; and shut down the Pi properly.
- **Move Node 1 v1.2.1 to the broker on the Pi** and prove that the Mini Smart Home stays alive without the laptop.

---

## 🧰 What you need

| What | Details |
| :--- | :--- |
| **Raspberry Pi 5** (2 GB or 4 GB) or **Pi 4 Model B** (2 GB or more) | Kit B in [Syllabus §5.3](../../SYLLABUS.md#53-kit-b--raspberry-pi-as-the-gateway-needed-from-module-12). A Pi 5 2 GB is more than enough for the broker, and later for Node-RED too (Module 13). A Pi Zero 2 W works too, with the notes in 🔬. The official prices went up several times during 2025–2026 because memory prices rose worldwide; as of October 1, 2026, the Pi 5 2 GB sells for US$77.50 and the Pi 4 2 GB for US$67.50 at the official stores, and prices at local shops are usually higher. |
| **A 32 GB *high-endurance* microSD card** (built to last; even better if it's also A1 or A2) | Completely erased when it's written. Why we choose a *high-endurance* card is explained in Concept 8. |
| **Card reader** | If your laptop has no card slot. Most microSD cards are sold with an SD adapter; a USB reader is more practical. |
| **Official power adapter** | Pi 5: a USB-C 27 W adapter (5.1 V 5 A). Pi 4: a USB-C 15 W adapter (5.1 V 3 A). A Pi 5 on a 3 A adapter still runs, but it limits the current of its USB ports. |
| **Case + cooling** | Pi 5: the official Active Cooler or a case with a fan, because the Pi 5 works best with active cooling. Pi 4: a heatsink is enough. |
| **LAN cable**, 1–2 m | From the Pi to one of the LAN ports on the router. |
| **Laptop** | Connected to the **same** home network as the Pi and Node 1, with **MQTTX**, **VS Code**, Node.js 24, and the `mini-smart-home` folder from Module 11. Windows 10 or Windows 11 that's regularly updated, or macOS 13 or later. |
| **The Node 1 workbench** | With Node 1 v1.2 from Module 11; used again in the ➕ section. |
| **Internet** | To download Raspberry Pi Imager (about 22 MB for Windows) and Raspberry Pi OS Lite (about 550 MB), plus their updates. |

**Versions used in this module:**

| Tool | Version | Notes |
| :--- | :--- | :--- |
| Raspberry Pi Imager | **2.0.12** (October 8, 2026) | New (Quick Win), installed on the laptop. It has no Indonesian translation yet, so its screens are in English. |
| Raspberry Pi OS Lite (64-bit) | release **2026-10-06**, based on Debian 13 "Trixie" | New, written to the microSD card. Linux kernel 6.18. |
| Mosquitto (on the Pi) | **2.0.21** | From the Debian Trixie package (Practice 3). On the laptop it stays 2.1.2 from Module 11; a few of its log lines are slightly different (Practice 5). |
| OpenSSH (on the laptop) | built into Windows 10/11 and macOS | No need to install it. How to check it is in step 4 of the Quick Win. |
| MQTTX | **1.13.1** | Since Module 11. |
| Node.js | **24.21.0** | Since Module 4; for the contract checker. |
| The **esp32** board package and the Node 1 libraries | the same as in Module 11 | Node 1 v1.2.1 only changes four lines in three files (➕ A). |

---

## 🏆 Quick Win: your first Pi answers from the network (30 minutes)

In 30 minutes (plus download time), you prepare the microSD card, start the Pi without a monitor, then "knock on its door" from the laptop. That Pi without a screen will answer with its own name.

> 🖥️ **Tools used in this section:** a laptop with a **browser** and a **Terminal**, the microSD card + card reader, the Raspberry Pi + official power adapter + LAN cable, and the home router. No Pi yet? Skip this section and read Concepts 1–8, then do Practice 7.

### Step 1 — Install Raspberry Pi Imager

Open [raspberrypi.com/software](https://www.raspberrypi.com/software/) on the laptop, then:

- **Windows:** click **Download for Windows**, run the file `imager_2.0.12.exe`, and follow its installer. Windows asks for administrator permission (`Do you want to allow this app to make changes to your device?`): click **Yes**. The same question appears **every time** Imager is opened, because Imager needs administrator permission to write the card; that's normal.
- **macOS:** click **Download for macOS**, open the file `imager_2.0.12.dmg`, then drag **Raspberry Pi Imager** into the **Applications** folder.
- **Linux:** click **Download for Linux (x86_64)**, make the file executable with `chmod +x imager_2.0.12_amd64.AppImage`, then run it with `sudo ./imager_2.0.12_amd64.AppImage`.

> 💡 Imager is also available through **winget** (Windows) and other app stores, but their versions often lag behind (at the time of writing, winget still had 2.0.8). Use the official download so that what you see matches this module.

### Step 2 — Write the microSD card

Put the microSD card into the card reader, then plug the reader into the laptop. **First unplug every other flash drive and external hard drive** (safety rule number 1).

Open **Raspberry Pi Imager**. Imager guides you through the steps listed in its left column (**Setup steps**): **Device**, **OS**, **Storage**, **Customisation**, **Writing**, and **Done**. All its buttons are written in capital letters: **NEXT** at the bottom right takes you to the next step, and **BACK** goes back one step. The screenshots are in three collages between the steps below; click a picture (on a phone: tap it) to enlarge it.

1. **Device:** click **Raspberry Pi 5** (or **Raspberry Pi 4**, or **Raspberry Pi Zero 2 W** near the bottom of the list), then **NEXT**.
2. **OS:** don't choose the top one. Scroll down, click **Raspberry Pi OS (other)**, then choose **Raspberry Pi OS Lite (64-bit)**, whose description reads `A port of Debian Trixie with no desktop environment …` and `Released: 2026-10-06` (or a later date). Then click **NEXT**.
3. **Storage:** click your microSD card. Compare its size with the label on your card. Imager counts 1 GB = 1,000,000,000 bytes, just like the card makers do, so a 32 GB card shows up as about 31–32 GB, for example `31.9 GB` (or `31,9 GB` if your laptop uses a regional number format with a decimal comma). The picture below was made with an older version of Imager that still wrote `29.7 GB`. Leave **Exclude system drives** checked so that the laptop's hard drive never appears in the list. Then click **NEXT**.

![A collage of four Raspberry Pi Imager screenshots, steps 1 to 4. One, the Select your Raspberry Pi device screen with the list Raspberry Pi 5, Raspberry Pi 4, Raspberry Pi 3, and so on; caption: Device, choose your board, Raspberry Pi 5 (or Pi 4 / Pi Zero 2 W), then NEXT. Two, the Choose operating system screen with Raspberry Pi OS (64-bit) highlighted; caption: scroll to Raspberry Pi OS (other), then choose Raspberry Pi OS Lite (64-bit), not the one highlighted here. Three, the Select your storage device screen with one card of 29.7 GB and the Exclude system drives box checked; caption: choose your microSD card; a 32 GB card shows as about 31 to 32 GB (this picture is from an old version of Imager). Four, the Customisation: Choose hostname screen with the Enter your hostname box, plus the SKIP CUSTOMISATION button next to BACK; caption: type gateway, lowercase, no spaces; the entry in the picture is just another example. Every screen has a NEXT button at the bottom right.](assets/imager-steps-1-4.png)

*Raspberry Pi Imager screenshots from the [official Raspberry Pi documentation](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en); step numbers and captions by the author. The example entries in the pictures (names, city, Wi-Fi) differ from yours.*

4. **Customisation: Choose hostname:** type `gateway` in the **Enter your hostname** box, then click **NEXT**. This name is what lets the Pi be called `gateway.local`. From this screen on, there's a **SKIP CUSTOMISATION** button next to **BACK**: don't click it (the reason is in the warning after step 9).
5. **Customisation: Localisation:** under **Capital city**, choose **Jakarta (Indonesia)**. **Time zone** automatically becomes `Asia/Jakarta` and **Keyboard layout** becomes `id`; you can leave both as they are. This choice also sets the Wi-Fi frequency rules for Indonesia. The **NEXT** button can only be clicked once a city is chosen. (If your Windows is in US English, this box is called **National capital**.) If you live in the WITA or WIT time zone, you can change **Time zone** to `Asia/Makassar` or `Asia/Jayapura`.
6. **Customisation: Choose username:** fill in **Username** with `budi` (or your own name, all lowercase), then **Password** and **Confirm password** with a strong password, for example three random words that only you know. Write it down in a password manager or a personal notebook, **not** in the repository. Then click **NEXT**.

   > ⚠️ Imager still lets you click **NEXT** even if the user boxes are left empty. For a Pi without a screen, that means nobody can log in to the Pi at all. Make sure all three boxes are filled in.
7. **Customisation: Choose Wi-Fi:** leave **SECURE NETWORK** selected. Imager has usually already filled in the **SSID** and the password with the Wi-Fi your laptop is using; make sure it's your own home Wi-Fi, not a phone hotspot. If they aren't filled in, type its name exactly (including upper and lower case) and fill in both password boxes. Check **Hidden SSID** only if your Wi-Fi really is hidden. On macOS, Imager may ask `Would you like to prefill the Wi-Fi password from the system keychain?`; answer **Yes** and enter your Mac's password, or **No** and type it yourself. After that, click **NEXT**. This Wi-Fi is the **backup path**; the Pi's main path is the LAN cable (Concept 6).
8. **Customisation: SSH authentication:** turn on the **Enable SSH** switch (it's **off** by default), then make sure **Use password authentication** is selected. After that, click **NEXT**. Forgot this step? The Pi still starts, but it can't be logged in to from the laptop (`Connection refused`, 🚨).
9. **Customisation: Raspberry Pi Connect:** leave **Enable Raspberry Pi Connect** off, then click **NEXT**. Raspberry Pi Connect is an official service for reaching the Pi from anywhere through an online account; our project doesn't use it.

![A collage of four Raspberry Pi Imager screenshots, steps 5 to 8. Five, the Customisation: Localisation screen with the Capital city, Time zone, and Keyboard layout boxes holding the example London (United Kingdom), Europe/London, and gb; caption: choose Jakarta (Indonesia), and Time zone Asia/Jakarta and keyboard id fill in by themselves. Six, the Customisation: Choose username screen with the Username, Password, and Confirm password boxes; caption: budi plus a strong password, a lowercase username, keep the password somewhere safe. Seven, the Customisation: Choose Wi-Fi screen with the SECURE NETWORK and OPEN NETWORK buttons, the SSID, Password, and Confirm password boxes, and the Hidden SSID checkbox; caption: your home Wi-Fi as the backup path, the exact name and password, including upper and lower case. Eight, the Customisation: SSH authentication screen with the Enable SSH switch still off and two choices, Use password authentication or Use public key authentication; caption: turn on Enable SSH, choose Use password authentication, then NEXT. Every screen has the SKIP CUSTOMISATION, BACK, and NEXT buttons.](assets/imager-steps-5-8.png)

*Raspberry Pi Imager screenshots from the [official Raspberry Pi documentation](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en); step numbers and captions by the author. The example entries in the pictures (names, city, Wi-Fi) differ from yours.*

> ⚠️ **Don't click SKIP CUSTOMISATION.** That button throws away all your **Customisation** entries and jumps straight to writing: the Pi starts without a user, without SSH, and without Wi-Fi, so it can't be reached from the laptop.

10. **Write image:** check the **Summary**. **Device** must be your board, **Operating system** must be `Raspberry Pi OS Lite (64-bit)`, and **Storage** must be your card. Under **Customisations to apply**, there must be `SSH enabled`. The example picture below doesn't have that line, because whoever made the example hadn't turned on SSH. Click **WRITE**.
11. Imager warns `You are about to ERASE all data on: …` and `This action is PERMANENT and CANNOT be undone.` After a two-second countdown, the confirmation button appears. Make sure the name after `ERASE all data on:` is your microSD card, then click **I UNDERSTAND, ERASE AND WRITE**. On macOS, Imager asks for your Mac's password (`Raspberry Pi Imager needs to access the disk to write the image.`).

![A collage of two Raspberry Pi Imager screenshots, steps 10 and 11. Ten, the Write image screen with its Summary: Device Raspberry Pi 5, Operating system Raspberry Pi OS (64-bit) in the example picture, Storage Apple SDXC Reader Media, and the Customisations to apply list; caption: check the board, OS Lite, the card, and SSH enabled, then click WRITE; this example picture doesn't include SSH enabled yet, but on your screen it must be there. Eleven, a warning window with the red title You are about to ERASE all data on: Apple SDXC Reader Media, then the sentence This action is PERMANENT and CANNOT be undone, with the CANCEL and I UNDERSTAND, ERASE AND WRITE buttons; caption: sure it's the right card? Click I UNDERSTAND, ERASE AND WRITE.](assets/imager-steps-10-11.png)

*Raspberry Pi Imager screenshots from the [official Raspberry Pi documentation](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en); step numbers and captions by the author. The example entries in the pictures (names, city, Wi-Fi) differ from yours.*

12. Imager downloads Raspberry Pi OS Lite (about 550 MB), writes it (`Writing... 37%`), then checks the result (`Verifying... 52%`). How long it takes depends on the speed of your internet and your card, usually 5–15 minutes. **Don't unplug the card** during this process, and don't skip the check (**SKIP VERIFICATION**): a card that fails the check isn't fit for a 24-hour gateway, and without the check you'd never know.
13. The screen changes to `Write complete!` with the message `The storage device was ejected automatically. You can now remove it safely.` Unplug the card reader, then click **FINISH**. If Windows then offers to format the card, click **Cancel** (🚨).

### Step 3 — Insert the card, connect the cables, then power on

![Photo of a Raspberry Pi 5 seen from above, with labels: the parts used this week are teal, the unused ones gray. Left: the microSD card slot, underneath the board on the left side (used); the power button, Pi 5 only (used); and the status light marked STAT (used). Top: the 40 GPIO pins, not used in our project, and the fan connector marked FAN for the active cooler (used). Right: two USB 2.0 ports and two blue USB 3.0 ports, not used, plus the Ethernet (LAN) port for the LAN cable to the router (used). Bottom: USB-C for power from the official 27-watt adapter (used) and two micro-HDMI ports, not used because the Pi works without a monitor.](assets/meet-the-raspberry-pi-5.jpg)

*Photo: [SimonWaldherr](https://commons.wikimedia.org/wiki/File:Raspberry_Pi_5.jpg), Wikimedia Commons, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en); cropped, labels by the author.*

1. Insert the microSD card into the slot **under** the Pi's board, on the left side of the photo above, with the printed side facing down (away from the board). Push it in gently until it's all the way in.
2. Fit the case and the cooler following the maker's instructions.
3. Plug the **LAN cable** from the Pi's Ethernet port into one of the LAN ports on the router.
4. **Last of all**, plug the official power adapter into the Pi's **USB-C** port, then plug the adapter into the wall outlet (if the outlet has a switch, switch it on). The Pi starts right away, without you needing to press any button. On a Pi 4, the red light comes on, then the green light next to it flickers while the Pi reads the card. On a Pi 5, the status light marked STAT next to the power button (see the photo) blinks green.
5. Wait **2–5 minutes**. On the first boot, the Pi enlarges the part of the card that holds the operating system, creates its own SSH keys, and applies the settings from Imager. That's why it takes longer than usual. **Don't cut the power** during that time. The official documentation suggests checking the lights if the Pi still isn't ready after 5 minutes (🚨).

### Step 4 — Knock on the door: `ping` and `ssh`

1. **On the laptop**, open **Terminal**. Windows 11: right-click the **Start** button → **Terminal**. Windows 10: right-click the **Start** button → **Windows PowerShell**. macOS: **Spotlight** (**Cmd + Space**) → type `Terminal` → **Enter**.
2. Make sure your laptop has SSH: type `ssh -V`, then press **Enter**. Windows 11 answers something like `OpenSSH_for_Windows_9.5p2, LibreSSL 3.8.2`, Windows 10 answers similarly with a lower version number, and macOS answers `OpenSSH_…`. Does `ssh : The term 'ssh' is not recognized…` appear? Open "SSH refuses …" in 🚨, the part about Windows without OpenSSH.
3. Ask whether the Pi can be heard on the network yet. On Windows, add `-4` so that the answer uses the usual IPv4 address:

   ```bash
   ping -4 gateway.local
   ```

   On macOS and Linux, just `ping gateway.local`, then stop it with **Ctrl + C**. **Expected output** (example, Windows):

   ```text
   Pinging gateway.local [192.168.1.37] with 32 bytes of data:
   Reply from 192.168.1.37: bytes=32 time=2ms TTL=64
   Reply from 192.168.1.37: bytes=32 time=1ms TTL=64
   Reply from 192.168.1.37: bytes=32 time=1ms TTL=64
   Reply from 192.168.1.37: bytes=32 time=1ms TTL=64
   ```

   The number in square brackets is the Pi's current address; write it down. On macOS and Linux, that address is in ordinary parentheses on the first line, for example `PING gateway.local (192.168.1.37): 56 data bytes`. No answer? Wait one more minute, then open "`ping gateway.local` doesn't find the Pi" in 🚨.
4. Log in to the Pi:

   ```bash
   ssh budi@gateway.local
   ```

   Replace `budi` with the username you entered in Imager. Because this is the first greeting, SSH shows the Pi's fingerprint and asks (Concept 4). **Expected output** (example):

   ```text
   The authenticity of host 'gateway.local (192.168.1.37)' can't be established.
   ED25519 key fingerprint is SHA256:Xq3m0LhR2vY9cTzN7bWk5JpE1sGfUo8aDiHy4KlVnQc.
   This key is not known by any other names.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```

   Type `yes`, then press **Enter**. SSH records it (`Warning: Permanently added 'gateway.local' (ED25519) to the list of known hosts.`), then asks for `budi@gateway.local's password:`. **While you type the password, nothing appears on the screen**, not even dots. That's normal: just type it carefully, then press **Enter**. (An old SSH on Windows 10 may show `ECDSA key fingerprint …` without the `This key is not known…` line; the answer is still `yes`.)
5. The Pi greets you with a welcome message, then the prompt changes. **Expected output** (example; the date and the version numbers on your Pi may be different):

   ```text
   Linux gateway 6.18.50+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.18.50-1+rpt1 (2026-09-30) aarch64

   The programs included with the Debian GNU/Linux system are free software;
   the exact distribution terms for each program are described in the
   individual files in /usr/share/doc/*/copyright.

   Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
   permitted by applicable law.
   budi@gateway:~ $
   ```

   On a Pi 4 and a Pi Zero 2 W, the kernel name on the first line ends in `+rpt-rpi-v8`, not `+rpt-rpi-2712`. The capitalized text `ABSOLUTELY NO WARRANTY` is just Debian's standard license notice that appears every time you log in, not a sign that something is broken.
6. **On the Pi**, ask for its name and how long it has been on:

   ```bash
   hostname
   ```

   ```bash
   uptime -p
   ```

   **Expected output** (example): `gateway`, then `up 4 minutes`.

Congratulations — the computer without a screen next to your router has just answered from the network. Notice three things:

- **You never touched the Pi except to plug in the cables.** The name, the user, the password, and the Wi-Fi were left on the card by Imager (Concept 3).
- **The prompt changed** from the laptop's to `budi@gateway:~ $`. Everything you type now runs on the Pi (Concept 4).
- **The Pi answers to its name**, `gateway.local`, without you needing to know its IP address. That's handy for the laptop, but Node 1 needs an address that doesn't change (Concept 6).

Type `exit` to leave: the Pi answers `logout`, then the laptop writes `Connection to gateway.local closed.` You can also leave this terminal open for Practice 1.

---

## 🧠 The "Why" Concepts

Eight concepts, one per section — **you don't need to read them all at once**. Concepts and practices alternate in this order:

1. Concepts 1–5 (what just happened in the Quick Win) → Practice 1 (a Linux tour over SSH)
2. Concept 6 → Practice 2 (a fixed address for the Pi)
3. Concept 7 → Practices 3–5 (Mosquitto as a service on the Pi, testing that it gets back up by itself, and reading the logs)
4. Concept 8 → Practice 6 (looking after the gateway)
5. Practice 7 is only for the laptop path (without a Pi): read Concepts 1–8 one after another, skip the ➡️ boxes that lead to Practices 1–6, then do Practice 7
6. 🧩 Challenges → ➕ Mini Smart Home (a permanent gateway and Node 1 v1.2.1) → 📝 Quiz → ✅ Checklist

At every switch point, there's a ➡️ box (forward to the practice) and a ⬆️ box (back to the concepts) with links you only need to click.

> 🖥️ **Want to try the commands in the Concepts section?** It's not required. The commands in the Concepts section are only examples; you'll type all of them yourself in the Practices, in the SSH window that's connected to the Pi.

### 1. Gateway and *edge*: a post office that's always open at home

In Module 11, we opened the post office (the broker) **on the laptop**. That post office is only open while you're sitting in front of it: the VS Code terminal has to stay open, and the laptop mustn't go to sleep. Picture a few everyday situations:

- The laptop is closed, and it goes to sleep. The broker goes to sleep with it. Node 1 knocks on the door every 5 seconds and always finds it shut (`MQTT failed to connect`).
- The laptop is taken to campus or to the office. The post office leaves home with it.
- Windows installs updates and restarts the laptop in the middle of the night. The broker's terminal closes, and nobody opens it again.

While the post office is closed, the sensor readings Node 1 sends are lost, and commands from the phone never arrive. A smart home that's only smart while the laptop is on isn't a smart home.

The cure is a **gateway**: one small computer at home **whose only job is to serve the IoT devices**, that's on 24 hours a day, and that's never taken anywhere. In our project, that gateway is a **Raspberry Pi** running the Mosquitto broker. Node 1 only needs to know the Pi's address, just as in Module 11 it only needed to know the laptop's address.

(Don't confuse it with the gateway router of Module 10, the "security post" router at the address `192.168.1.1`. The router carries letters out of the housing complex; the IoT gateway is the post office for data inside the home.)

![Diagram of the gateway: a data post office that's always open at home. Inside the dashed line of the home (network 192.168.1.x): the DEVICES column holds Node 1 Home (sensors and actuators) and Node 2 Garden (later, Module 14), which connects via Node 1; an MQTT arrow goes from Node 1 to the GATEWAY column, a Raspberry Pi named gateway at the address 192.168.1.37, which runs the Mosquitto broker 24/7 (Module 12, this week), and later Node-RED automation (Module 13) and the bridge to the internet (Module 27). Below it, the MONITORS, which may be off at any time: the laptop (MQTTX, SSH) and the phone (an MQTT app). Outside the home, an internet server (later, Module 27), linked to the gateway by a dashed line with a red cross: internet down? Inside the home, it keeps running. Side box: why a gateway? It keeps running when the internet is down, commands take milliseconds, raw data stays at home, a few watts of power; the laptop and the phone are only monitors, so it's no problem if they're off or taken away.](assets/gateway-at-home.png)

**Why not just have every device send straight to a server on the internet (the cloud)?** Many cheap products do exactly that. This curriculum chooses a gateway at home for four reasons:

| Reason | Without a gateway (straight to the internet) | With a gateway at home |
| :--- | :--- | :--- |
| **The internet drops** | Commands and automation stop completely, even though the devices are right next to each other. | Node 1, the broker, and later the automation on the Pi (Module 13) keep running. Only what's being sent to the internet has to wait. |
| **Speed** | A command from the phone in the living room first makes a detour through a server in another city. | A command only travels around inside the home, in a matter of milliseconds. |
| **Privacy** | Every reading, including "motion in the living room", leaves the home. | The raw data stays at home. Later, only what's needed is sent out (Module 27). |
| **Cost** | Every message to a cloud service can be billed, and the server runs 24 hours a day. | One Pi, using a few watts of power. |

This pattern is called ***edge computing*** (computing at the edge): the work is done as close as possible to the devices, at the "edge" of the network, not in a faraway data center. The gateway is that edge computer. From this week until the end of the curriculum, all the Mini Smart Home devices talk to the gateway, and only in Module 27 do we connect that gateway to a server on the internet.

### 2. Raspberry Pi: a complete computer the size of a business card

The ESP32 and the Raspberry Pi are both small green boards, but they're very different by nature. The **ESP32** is a **microcontroller**: one chip that runs **one program** of yours, right as soon as the power comes on. The **Raspberry Pi** is a **single-board computer**: a complete computer, with a processor, memory, and an operating system, that can run **many programs at once**, just like a laptop.

The analogy: the ESP32 is a **counter clerk who handles one thing only**. It never gets distracted, reacts quickly, and hardly needs to eat. The Raspberry Pi is a **small office**: it has an admin office (the operating system), several staff members working at the same time (the programs), and a records room (the microSD card). An office can do far more things, but it takes time to open in the morning and has to be closed properly.

A photo of the Raspberry Pi 5 with the name of each of its ports is in step 3 of the Quick Win.

| | ESP32 (Node 1) | Raspberry Pi 5 (gateway) |
| :--- | :--- | :--- |
| Kind | microcontroller: one program | computer: an operating system + many programs |
| Brain | 2 cores, 240 MHz | 4 Arm Cortex-A76 cores, 2.4 GHz |
| Working memory (RAM) | 520 KB | 1–16 GB (Kit B: 2 GB) |
| Storage | 4 MB of flash on the board | a 32 GB microSD card (or an SSD) |
| From plugging in to ready | less than 1 second | tens of seconds (first boot: 2–5 minutes) |
| Power | less than 1 W | a few watts; its official adapter is 27 W, to have a reserve when it's busy |
| If the power suddenly goes out | safe: its program is stored in flash | a file that's being written can get damaged (Concept 8) |
| Best suited for | reading sensors and moving actuators, fast and frugal | a broker, a database, a dashboard, network services 24 hours a day |

That's why the two **don't replace each other**. The ESP32 stays near the sensors and relays, while the Pi sits near the router as the post office. The Pi does have GPIO pins like the ESP32, but our project doesn't use them; the comparison is in 🔬.

### 3. Linux and Raspberry Pi OS Lite: a computer without a screen

Every computer needs an **operating system**: the "admin office" program that runs the processor, the memory, the files, and the network, and shares out its time among the other programs. Your laptop uses Windows or macOS, and your phone uses Android or iOS.

The Raspberry Pi uses **Linux**, a free and open operating system that runs most of the servers on the internet, as well as your home router, smart TVs, and the core of Android. Linux comes in many "flavors", called **distributions**. The Raspberry Pi uses **Raspberry Pi OS**, a **Debian** distribution adapted for the Pi. The version at the time of writing is based on **Debian 13 "Trixie"** (Debian names each of its versions after a character from the *Toy Story* films). The name "Trixie" matters: tutorials on the internet that were written for older versions, for example "Bullseye" (Debian 11), often use methods that no longer work (the table at the start of 🚨).

We use the **Raspberry Pi OS Lite** variant, the one without a ***desktop*** (the windowed screen with icons and a mouse). All the work is done by typing commands. It sounds like a hassle, but this is exactly how most servers are managed, and it has its advantages:

- **Lighter.** No memory or processor time is spent drawing windows that nobody ever looks at.
- **Less that can break and needs updating.** Its download is about 550 MB, less than half the size of the desktop version.
- **A good fit for a Pi without a screen.** Our Pi will work ***headless*** (without a head): without a monitor, keyboard, and mouse. We control it from the laptop over the network.

How can a Pi that has never been touched by a keyboard know your Wi-Fi name, your username, and your password? That's what the **Customisation** steps in Raspberry Pi Imager were for in the Quick Win. Imager leaves all those settings in a small part of the card called `bootfs`, as three text files (`user-data`, `network-config`, and `meta-data`). On the first boot, a program called **cloud-init** in Raspberry Pi OS reads all three: it sets the name `gateway`, creates the user `budi`, connects to the Wi-Fi, and turns on SSH. That's why the first boot takes longer than usual.

### 4. SSH: a remote terminal

In the Quick Win, you typed `ssh budi@gateway.local` in the laptop's terminal, and suddenly that terminal "moved" to the Pi. **SSH** (*Secure Shell*) is a way to open **another computer's terminal** over the network.

Imagine you're **phoning the Pi's office**. You dictate commands over the phone, the staff at the Pi's office carry them out, then read the results back to you. You're still sitting in front of the laptop, but **every command runs on the Pi**: the files you create are saved on the Pi's microSD card, and the programs you install are installed on the Pi. The phone call is **encrypted**, so other people on the same network can't eavesdrop on your password or your commands.

![Diagram of SSH, a remote terminal: you type on the laptop, the command runs on the Pi, the output comes back to your screen. Left, the terminal window on the laptop: PS C:\Users\budi> ssh budi@gateway.local, then the password request, the Raspberry Pi OS welcome message, then the prompt budi@gateway:~ $ with the command hostname (answer: gateway) and uptime -p (answer: up 2 hours, 5 minutes); marker: the Pi prompt means the command runs on the Pi. Middle, a typing arrow to the right and an output arrow to the left, through door 22, which is encrypted. Right, the Raspberry Pi gateway with no monitor or keyboard: the SSH service waits at door 22, your commands run here, files are saved on the Pi's microSD card, programs are installed on the Pi. Bottom: first greeting, SSH shows the Pi's key fingerprint and the laptop records it in known_hosts; after that, the fingerprint is checked every time, and if it's different, for example after the card was rewritten, SSH refuses and warns you.](assets/ssh-remote-terminal.png)

The easiest way to know "where" you are is to read the **prompt** (the ready sign, Module 4), the text in front of the cursor:

| Prompt | What it means |
| :--- | :--- |
| `PS C:\Users\budi>` | PowerShell on a Windows laptop. Commands run on the laptop. |
| `budi@MacBook-Air ~ %` | Terminal on a macOS laptop. Commands run on the laptop. |
| `budi@gateway:~ $` | The SSH terminal on the Pi: the user `budi`, on the computer named `gateway`, in the home folder (`~`). Commands run on the Pi. |

Make a habit of glancing at the prompt before you press **Enter**. Don't expect a command typed in the wrong place to always fail: some Linux commands, for example `ls`, `cd`, `cat`, and `rm`, are also known to PowerShell (the Mac Terminal even knows almost all of them, including `sudo reboot`), so such a command can really run on the wrong computer, for example deleting a file on the laptop instead of on the Pi.

**The fingerprint at the first greeting.** The first time it connects, the SSH on the laptop doesn't know the Pi yet. It shows the Pi's **key fingerprint** (a string of random letters and digits after `SHA256:`) and asks whether you're sure. After you answer `yes`, the laptop records that fingerprint in the `known_hosts` file. From then on, every time it connects, the laptop checks whether the one answering really is the same Pi. If one day the fingerprint is different, SSH refuses to connect with the big warning `REMOTE HOST IDENTIFICATION HAS CHANGED!`. At home, the cause is almost always harmless: you've just rewritten the microSD card, so the Pi created a new key. How to fix it is in 🚨.

**Password or key?** This week we log in with a **password**, because it's the easiest to understand. A safer and more comfortable way is an **SSH key**: a pair of files, one kept secret on the laptop and one left with the Pi, so you don't need to type a password again when you log in (`sudo` still asks for it). How to do it is in 🔬. Whichever way you choose, the rule is the same: **the Pi's password must be strong and not used anywhere else**, because anyone on your home network can try to log in.

### 5. The map of the Linux house: folders, users, and `sudo`

**One folder tree.** On Windows, files are spread over several drives: `C:`, `D:`, and so on. On Linux, **every** file is in one tree rooted at **`/`** (a slash, read as "root"). The microSD card, a flash drive, even information about the processor all appear as branches of that tree. The slashes also lean the other way from Windows: `/home/budi`, not `\home\budi`.

![Diagram of the map of the Linux house: one tree from the slash /. From the root /, six branches: /home/budi, the ~ sign, your desk, your own files, where SSH brings you in; /etc/mosquitto/conf.d, the settings cabinet, Mosquitto's .conf files, and changing them needs sudo; /var/log/mosquitto, the logbook, mosquitto.log with every client that comes and goes; /var/lib/mosquitto, the message store, mosquitto.db with the retained messages (the notice board) saved to the card; /boot/firmware, the front door key, the files that start the Pi and the only part Windows can read (on the laptop it shows up as bootfs); /usr/bin and /usr/sbin, the tool room, programs such as mosquitto_sub, nano, and mosquitto itself. Note at the bottom: Linux's slash leans the other way from Windows', and upper and lower case differ: Mosquitto.conf isn't the same as mosquitto.conf.](assets/linux-folder-map.png)

There are only five addresses you need to remember this week:

| Folder | What's in it | It's like |
| :--- | :--- | :--- |
| `/home/budi` (short: **`~`**) | your own files | your desk |
| `/etc` | the settings of every program, for example `/etc/mosquitto/` | the office's filing cabinet for settings |
| `/var/log` | the programs' logs, for example `/var/log/mosquitto/` | the logbook of events |
| `/boot/firmware` | the files that start the Pi; the only part of the card Windows can read (on the laptop it shows up as the `bootfs` drive, Concept 3) | the front door key |
| `/usr/bin` | the installed programs, for example `mosquitto_sub` | the tool room |

**Ordinary users and `sudo`.** The `budi` account you created in Imager is an **ordinary user**. It's free to change anything on its own desk (`/home/budi`), but it isn't allowed to change the filing cabinet (`/etc`) as it pleases, or to install programs. Only a special user named **root**, the "head of the office", may do that. (Its name is the same as what we called the `/` folder earlier, but this one is a user, not a folder.) So that you don't need to log in as root, Linux provides **`sudo`** ("do this as the head of the office"): write `sudo` in front of **one** command, and only that command runs with full authority. Before running it, `sudo` asks for your own password (`[sudo] password for budi:`), and as in SSH, what you type doesn't appear on the screen. After that, `sudo` remembers it for 15 minutes, so the next `sudo` commands don't ask again. (Old tutorials say that a Raspberry Pi never asks for a password for `sudo`; since April 2026, Raspberry Pi OS asks for it, for safety.)

Full authority means nothing stops a mistake anymore. Make two things a habit:

- **Use `sudo` only when you need it**, that is, when an error message says `Permission denied` for a file outside `/home/budi`, or when a command in this module already includes it.
- **Read every command with `sudo` again before you press Enter**, especially ones that delete (`rm`). Linux has no **Recycle Bin** in the terminal: whatever is deleted is gone right away.

**An app store you type into: `apt`.** On a phone, you install apps from the Play Store. On Raspberry Pi OS, programs are installed from the official Debian and Raspberry Pi **package warehouses** (repositories) with the **`apt`** command. Three commands you'll use often:

| Command | What it means |
| :--- | :--- |
| `sudo apt update` | Update the warehouses' **catalog**: the list of programs and their newest versions. Nothing is installed or changed yet. |
| `sudo apt full-upgrade` | Install **updates** for every program that's already installed, according to the newest catalog. |
| `sudo apt install mosquitto` | **Install** a new program, complete with everything it needs. |

The order is always `update` first, then `full-upgrade` or `install`, just like checking the newest catalog before you go shopping.

> ➡️ **Time to practice!** Concepts 1–5 are enough for [Practice 1 — A Linux tour over SSH](#practice-1--a-linux-tour-over-ssh-40-minutes). After that, come back to Concept 6.

### 6. A fixed address: the post office mustn't move house

Remember the housing complex analogy from Concept 1 of Module 10: the router is the clerk who **lends** out house numbers (IP addresses) through **DHCP**, and a number can change, for example after the router is restarted. For phones and laptops, a new number is no problem. For the **post office**, it's a disaster: Node 1 keeps the broker's address in `BROKER_ADDRESS`, and if the Pi suddenly moves from `192.168.1.37` to `192.168.1.41`, Node 1 keeps knocking on the wrong house.

**What about the name `gateway.local`?** In the Quick Win, your laptop found the Pi by that name. A `.local` name works by "shouting inside the house": the laptop asks the whole network, "Who's called `gateway`?", and the Pi answers with its address. This method (mDNS, Concept 9 of Module 10) is handy for SSH from the laptop, but it doesn't suit Node 1: since v1.2, Node 1 no longer uses mDNS and always connects to the broker's **IP address**. Besides, on some Android phones and some networks, a `.local` name can't be found.

So the Pi needs a **fixed address**. There are two ways, and both give the same result: the Pi always uses the same address.

| | **Option A — reserve the address on the router** (*DHCP reservation*) | **Option B — a fixed IP on the Pi** (*static IP*) |
| :--- | :--- | :--- |
| It's like | The clerk who hands out numbers is given a note: "the house with this ID card always gets number 37." | The Pi puts number 37 on its own door, without asking the clerk. |
| Needs | the router's admin page (its password is usually on the router's sticker) | only the Pi, plus an address that the router will never lend to another device |
| Risk of a conflict | none: the router knows that number is reserved | yes, if the router lends the same number to another device |
| If you make a typo | the Pi still gets an address from the router | the Pi may become unreachable altogether (there's a backup path, Practice 2) |
| Used in | Practice 9 of Module 10, for Node 1; also the method the official Raspberry Pi documentation recommends | the Syllabus for Module 12, with `nmcli` |

If you could already open the router's admin page in Practice 9 of Module 10, use **Option A**: the menu is the same; only the MAC address and the number are different. Use **Option B** if the router isn't yours, if you don't know its admin password, or if its address reservation menu isn't available (which often happens on the modem your internet provider installed).

**NetworkManager and `nmcli`.** On Raspberry Pi OS Trixie, networking is handled by a program called **NetworkManager**, and the way to configure it from the terminal is the **`nmcli`** command. Many old tutorials tell you to change the file `/etc/dhcpcd.conf`. That method **hasn't worked** since Raspberry Pi OS Bookworm (2023): the file doesn't exist anymore, and even if you create it, nothing reads it. On Trixie, the settings Imager left behind are stored through a helper program called **netplan**, so the connection names on your Pi start with `netplan-`, for example `netplan-eth0` for the LAN cable (Practice 2).

One more thing sets the Pi apart from the laptop: our Pi connects to the router with a **LAN cable** (Ethernet), not over Wi-Fi. A cable is more stable, doesn't compete for airtime with the ESP32 and the phones, and the Pi sits quietly near the router. The Wi-Fi settings you entered in Imager stay as the **backup path**: if the cable settings ever go wrong, you can still log in over Wi-Fi.

> ➡️ **Time to practice!** Continue to [Practice 2 — A fixed address for the Pi](#practice-2--a-fixed-address-for-the-pi-30-minutes). After that, come back to Concept 7.

### 7. Services and systemd: a security guard who never sleeps

In Module 11, the broker lived as long as its terminal window was open: `mosquitto -v -c mosquitto-lan.conf`. Close the terminal, and the broker stops too. On the gateway, nobody sits in front of a terminal. We need a broker that:

1. **starts by itself** every time the Pi is switched on, without anyone typing anything;
2. **gets back up by itself** if it ever dies suddenly (a crash);
3. **is stopped neatly** when the Pi is shut down, so that the retained messages get saved first;
4. **records** what happens in a logbook that can be read at any time.

A program that runs in the background like that is called a **service**. On Linux, all the services are looked after by **systemd**, the first program that runs when the Pi starts. Picture systemd as the office's **security guard**, who holds a duty list. Every morning, the guard opens the office and switches on every service on the list. All day long, the guard makes the rounds: if a service has fallen over and its duty list says "wake it up again", the guard wakes it up. The guard also records every event in a **logbook** called the ***journal***.

![Diagram of systemd, the guard who starts services, wakes them up, and keeps a log: one day in the life of the mosquitto service on the gateway. Timeline: the Pi powers on (systemd reads the duty list); mosquitto runs (enabled means it starts with the Pi, active running); crash, the program dies suddenly; a curved arrow labeled automatic leads to woken up again (the Restart=on-failure rule, active running); sudo poweroff, stopped neatly and retained saved; the Pi is off, safe to unplug. Bottom left box, the guard's logbook (journal): journalctl -u mosquitto shows when the service was started, stopped, or failed, but the journal's contents are lost when the Pi restarts; Mosquitto's own log about clients coming and going is in /var/log/mosquitto/mosquitto.log and stays saved on the card. Bottom right box, talking to the guard through systemctl: status (how is it doing?), restart (stop, then start again), enable (add to the morning duty list), disable (cross off the list).](assets/systemd-guard.png)

The duty list for each service is written in a small file called a **unit**, for example `mosquitto.service`. The good news: the `mosquitto` package from Debian already brings its own unit file. As soon as it's installed with `apt`, Mosquitto immediately becomes a service that's **enabled** (it starts when the Pi starts) and **active** (running). Our job this week is only to give it the right settings, then test the guard's promises.

All your dealings with the guard go through the **`systemctl`** command:

| Command | What it means |
| :--- | :--- |
| `systemctl status mosquitto` | Ask about the service's state: whether it's running, since when, and its last few log lines. |
| `sudo systemctl restart mosquitto` | Stop it, then start it again, for example after its settings were changed. |
| `sudo systemctl stop mosquitto` / `start` | Stop / start it now (until the Pi restarts). |
| `sudo systemctl disable mosquitto` / `enable` | Cross it off / write it on the morning duty list (takes effect from the next time the Pi starts). |

To read the guard's logbook, the command is **`journalctl`**, for example `journalctl -u mosquitto` (`-u` = *unit*, the log of a single service only). Mosquitto itself keeps a **second logbook**: it records every client that comes and goes in the file `/var/log/mosquitto/mosquitto.log`. So the journal answers "when did the guard start or wake up the broker?", while `mosquitto.log` answers "who came to the post office?". One more thing to remember: on Raspberry Pi OS, the journal is deliberately kept in memory (RAM) so that the microSD card doesn't wear out quickly. As a result, its contents are **lost every time the Pi restarts**. `mosquitto.log` is saved on the card and stays.

**Why bother with a service, instead of just running `mosquitto` in the SSH terminal?** An SSH terminal only lives as long as your connection does. As soon as the laptop is closed, the SSH connection drops, and the programs started inside it are stopped with it. A service doesn't depend on anyone who happens to be connected.

> ➡️ **Time to practice!** Concept 7 is enough for [Practice 3 — Mosquitto as a service on the Pi](#practice-3--mosquitto-as-a-service-on-the-pi-30-minutes), [Practice 4 — Test: the service gets back up by itself](#practice-4--test-the-service-gets-back-up-by-itself-20-minutes), and [Practice 5 — Reading the logs](#practice-5--reading-the-logs-20-minutes). After that, come back to Concept 8.

### 8. Looking after the gateway: the microSD card, power, and backups

A gateway that's on 24 hours a day has three enemies: **a worn-out card**, **a sudden power cut**, and **updates that keep getting put off**. All three can be tamed with simple habits.

**Why do ordinary microSD cards break so quickly?** A microSD card stores data in flash memory cells. Each cell can only be written and erased a certain number of times, like **a notebook page written in pencil**: erase it too often, and the paper gets thin, then tears. The problem is that the card can't erase just one word; it has to erase **one big block** at a time, then write the contents of that block again. As a result, small notes written over and over, for example one log line every few seconds, make the card erase and rewrite far more than the size of the notes themselves. Experts call this ***write amplification***. A good card spreads the wear evenly over all its blocks (*wear leveling*), but cheap cards often do it only half-heartedly.

![Diagram: why ordinary microSD cards wear out fast in a gateway. Left, the inside of the card drawn as rows of blocks of flash cells: writing can go bit by bit, but erasing takes a whole block; three blocks in the middle are red, with the note that the blocks erased and rewritten most often wear out first. Below them: one log line, a few dozen bytes, every few seconds makes the card copy and erase big blocks again and again. Right, three things that protect the gateway: one, a high-endurance card, designed for CCTV that records 24/7; two, sudo poweroff, then unplug: a power cut while writing can damage files; three, the official adapter plus backups, steady voltage, the recipe and the settings on GitHub. Note at the bottom: the A1/A2 code means speed at opening and writing many small files, not endurance; for a gateway, put high-endurance first.](assets/microsd-card-wear.png)

Cheap cards are designed for cameras and phones: now and then they save a big photo, and after that they're mostly read. For a gateway that writes a little at a time without stopping, this curriculum uses a ***high-endurance*** card (built to last), which really is designed for CCTV cameras and dashcams (car cameras) that record 24 hours a day. The makers state its endurance in hours of video recording, for example the SanDisk High Endurance 32 GB is rated for 2,500 hours of Full HD recording, and the SanDisk MAX Endurance 32 GB for 15,000 hours. The **A1/A2** code on a card is about **speed** at opening and writing many small files, not about endurance. For a gateway, endurance matters more: choose a *high-endurance* card. Some *high-endurance* cards don't show an A1/A2 code, and that's fine; a *high-endurance* card that also carries an A1 or A2 code is of course even better.

**A power cut while the card is writing** can damage the file being written, sometimes so badly that the Pi won't start. Three habits that prevent it:

1. **Shut down the Pi with a command**, not by pulling the cable: `sudo poweroff`, then wait for its lights to give the safe sign, and only then unplug the adapter. On a Pi 4, the green light (ACT) blinks briefly a few times and then goes out, while the red light (PWR) may stay on as long as the adapter is plugged in. On a Pi 5, the status light marked STAT next to the power button turns **red**: the Pi is asleep, waiting to be switched on again.
2. **Use the official power adapter.** A phone charger that isn't strong enough makes the voltage drop (undervoltage) when the Pi is busy, and the Pi can restart by itself. The Pi records every voltage drop, and you can check them (Practice 6).
3. **Keep backups**, because card damage can still happen.

**Realistic backups for beginners** come in two layers:

- **The recipe and the settings file.** Everything we change on the Pi this week fits on one page of notes and in one Mosquitto settings file. If both are saved in your GitHub repository, a new gateway can be built again from a blank card in half an hour. This is our main backup (section ➕ E).
- **A full copy of the card** (an *image*), optional, made with an app on the laptop. This copies the card's entire contents, including things you forgot to note down, but it's as big as the card (32 GB) and the Pi has to be shut down first. Raspberry Pi Imager **can't** make a copy like that; the tool for it is in 🔬.

**Updates.** A Linux system that's never updated slowly collects security holes that are already publicly known. Schedule it once a month: `sudo apt update`, then `sudo apt full-upgrade`. If the update touches the kernel (the core of Linux) or the firmware, the Pi needs a restart (`sudo reboot`) so that the new version gets used. The sign is easy to spot: the list of packages `apt` updates contains a name starting with `linux-image` (the kernel), `raspi-firmware`, or `rpi-eeprom`.

**Does the Pi need an automatic restart every day?** Almost never. A service that falls over is already woken up by systemd (Concept 7), and restarting every day actually hides problems you should be reading in the logs. A restart is needed after a kernel update, and as a last resort if the whole Pi is truly stuck. For that last case, the Pi has a hardware ***watchdog***, much like the guard you already met in Module 8, and on Raspberry Pi OS Trixie this watchdog is **already on from the start**: if the whole system is stuck for more than one minute, the Pi restarts by itself. The details are in 🔬.

> ➡️ **Time to practice!** Continue to [Practice 6 — Looking after the gateway](#practice-6--looking-after-the-gateway-30-minutes). Laptop path users: continue to [Practice 7](#practice-7--laptop-path-mosquitto-as-a-service-30-minutes).

---

## 🔧 Step-by-step practice

Every practice this week is done **in the SSH terminal that's connected to the Pi**, unless the step says otherwise. One rule before you start:

> [!IMPORTANT]
> **Glance at the prompt before you press Enter.** `budi@gateway:~ $` means your command runs on the Pi. `PS C:\Users\…>` (Windows) or `… ~ %` (macOS) means your command runs on the laptop. Every command box in this module is preceded by the label **On the Pi** or **On the laptop**.

How to open the SSH terminal again at any time: open **Terminal** on the laptop (Windows 11: right-click the **Start** button → **Terminal**; Windows 10: right-click the **Start** button → **Windows PowerShell**; macOS: **Spotlight** → type `Terminal`), then type `ssh budi@gateway.local` and enter your password. After Practice 2, you can also use its fixed address: `ssh budi@192.168.1.37`. Does the SSH terminal freeze, or say that its connection was lost after the laptop slept or was left alone for a long time? That's normal: the Pi stays on, so just close the window, then log in again this way. Only the command that was running in that window gets stopped with it, so don't let the laptop sleep while a long command such as `sudo apt full-upgrade` hasn't finished.

### Practice 1 — A Linux tour over SSH (40 minutes)

> 🖥️ **Tools:** a terminal on the laptop that's connected to the Pi over SSH (Quick Win). Concepts used: 3, 4, and 5.

This tour introduces about twenty commands that are enough for the whole curriculum. Type every command yourself instead of copying them all at once: fingers that type learn faster than eyes that read. The **Expected output** boxes in this practice are **examples**; the file names, numbers, and dates on your Pi may be different.

#### 1.1 Where am I? (`pwd`, `ls`, `cd`)

1. **On the Pi**, ask which folder you're in right now:

   ```bash
   pwd
   ```

   **Expected output:** `/home/budi`. `pwd` (*print working directory*) prints the working folder. Every time you log in over SSH, you start in your home folder.
2. Look at what's in this folder:

   ```bash
   ls
   ```

   Nothing appears? That's normal: your home folder is still empty. Add the **`-la`** option (*long*, *all*) to also see the hidden files, the files whose names start with a dot:

   ```bash
   ls -la
   ```

   **Expected output** (example; the numbers, the dates, and the permissions on your Pi may be slightly different):

   ```text
   total 20
   drwx------ 2 budi budi 4096 Oct 18 08:47 .
   drwxr-xr-x 3 root root 4096 Oct 18 08:41 ..
   -rw-r--r-- 1 budi budi  220 Oct 18 08:41 .bash_logout
   -rw-r--r-- 1 budi budi 3523 Oct 18 08:41 .bashrc
   -rw-r--r-- 1 budi budi  807 Oct 18 08:41 .profile
   ```

   Each line is one file or folder. A first letter `d` means a folder (*directory*), while `-` means an ordinary file. The letters `rwx` after it are the permissions (*read*, *write*, *execute*), then come the owner (`budi`), the size in bytes, and the date it was last changed. `.` is this folder itself, and `..` is its parent folder. The file `.bashrc` sets up how your terminal looks, including the prompt `budi@gateway:~ $`. If you've already logged out of SSH once, for example with `exit` at the end of the Quick Win, there's also a `.bash_history` file, the history of the commands you've typed (Practice 1.5).
3. Move between folders with **`cd`** (*change directory*). Try looking into the settings cabinet, then come back:

   ```bash
   cd /etc/mosquitto
   ```

   The Pi answers `-bash: cd: /etc/mosquitto: No such file or directory`, because Mosquitto isn't installed yet (Practice 3). An error message like this is harmless: nothing is broken. Try another folder that surely exists:

   ```bash
   cd /etc
   ```

   ```bash
   ls
   ```

   The prompt changes to `budi@gateway:/etc $`, and `ls` prints dozens of settings file names. Go back home with just `cd`, with nothing after it (or `cd ~`). Go up one level to the parent folder with `cd ..`.

> 💡 **Keys that save typing.** Type `cd /et`, then press **Tab**: the terminal completes it by itself to `cd /etc/`. Press **↑** to bring back the previous command. These two keys will save you thousands of keystrokes and prevent typos.

#### 1.2 Creating, viewing, copying, and deleting files

1. **On the Pi**, make sure you're in your home folder (`cd`), then create a practice folder:

   ```bash
   mkdir practice
   ```

   ```bash
   cd practice
   ```

2. Create a notes file with **nano**, the text editor in the terminal:

   ```bash
   nano gateway-notes.txt
   ```

   The screen turns into the editor. Type a few lines, for example:

   ```text
   Mini Smart Home gateway
   Host name: gateway
   User: budi
   Installed: (today's date)
   ```

   At the bottom of the screen there are two lines of shortcuts; the `^` sign means the **Ctrl** key:

   ```text
   ^G Help      ^O Write Out ^F Where Is  ^K Cut       ^T Execute   ^C Location
   ^X Exit      ^R Read File ^\ Replace   ^U Paste     ^J Justify   ^/ Go To Line
   ```

   Save with **Ctrl + O**. When nano asks `Write to File: gateway-notes.txt`, just press **Enter**; `[ Wrote 4 lines ]` appears at the bottom. Then leave with **Ctrl + X**. (In this version of nano, **Ctrl + S** also saves right away without asking.)

   > ⚠️ **The mouse can't be used in nano**, and **Ctrl + C** in nano isn't "copy": it shows the cursor's position. Move the cursor with the arrow keys. Forgot to save and pressed **Ctrl + X**? Then nano asks `Save modified buffer?`: press **Y**, then **Enter** for the file name.
3. Show a file's contents without opening it for editing:

   ```bash
   cat gateway-notes.txt
   ```

   For long files, use `less gateway-notes.txt`: scroll with the arrow keys, leave with **q**.
4. Copy, rename, then delete:

   ```bash
   cp gateway-notes.txt backup.txt
   ```

   ```bash
   mv backup.txt old-notes.txt
   ```

   ```bash
   rm old-notes.txt
   ```

   `cp` (*copy*) copies, `mv` (*move*) moves or renames, and `rm` (*remove*) deletes. Check with `ls` that only `gateway-notes.txt` is left.

   > ⚠️ **`rm` doesn't ask, and it has no Recycle Bin.** A deleted file is gone right away. The command `rm -r` deletes a folder together with its contents; never combine it with `sudo` and `/` unless you really know what's being deleted.

#### 1.3 How healthy is my Pi? (`uptime`, `df`, `free`, `hostname -I`)

**On the Pi**, run them one at a time:

| Command | What it asks | Example answer |
| :--- | :--- | :--- |
| `uptime -p` | How long has the Pi been on since it was last started? | `up 2 hours, 5 minutes` |
| `df -h /` | Does the microSD card still have plenty of room? (`-h` = easy-to-read numbers) | the columns `Size` `29G`, `Used` `2.3G`, `Use%` `9%` |
| `free -h` | Does the working memory (RAM) still have plenty of room? | the `Mem:` row, the columns `total` `1.9Gi` and `available` `1.7Gi` |
| `hostname -I` | What's the Pi's IP address now? | `192.168.1.37 192.168.1.38`: one for the cable, one for the Wi-Fi, in no fixed order; sometimes a long IPv6 address is added |
| `cat /etc/os-release` | Which version of Raspberry Pi OS is installed? | the first line, `PRETTY_NAME="Debian GNU/Linux 13 (trixie)"` |

Write the results of `df -h /`, `free -h`, and `hostname -I` in `gateway-notes.txt` (`nano ~/practice/gateway-notes.txt`; this full path still works even if you've just logged in again over SSH and are in your home folder). As soon as nano opens, the output of those commands is covered by nano's screen, so first write the numbers down on paper, or copy the text before you open nano: select the text with the mouse, then right-click (macOS: **Cmd + C**), and paste it into nano with a right-click (macOS: **Cmd + V**). Pasting still works even though the mouse can't move the cursor in nano (1.2); the text goes in where the cursor is. These numbers are the gateway's "pulse"; in Practice 6 we check them again.

#### 1.4 Updating the Pi (`sudo apt`)

1. **On the Pi**, update the package warehouses' catalog:

   ```bash
   sudo apt update
   ```

   Because this is your first `sudo` command, the Pi asks for a password (`[sudo] password for budi:`); type the Pi's password, then press **Enter**. **Expected output** (example):

   ```text
   Hit:1 http://deb.debian.org/debian trixie InRelease
   Get:2 http://deb.debian.org/debian trixie-updates InRelease [47.1 kB]
   Hit:3 http://deb.debian.org/debian-security trixie-security InRelease
   Hit:4 http://archive.raspberrypi.com/debian trixie InRelease
   Fetched 47.1 kB in 1s (52.3 kB/s)
   12 packages can be upgraded. Run 'apt list --upgradable' to see them.
   ```

   The first four lines are the four warehouses that were checked: three belong to Debian and one to Raspberry Pi. The last line says how many programs have a newer version. If it says `All packages are up to date.`, everything is already up to date.
2. Install all the updates:

   ```bash
   sudo apt full-upgrade
   ```

   `apt` shows the list of packages that will be updated and its summary (`Summary:` with `Upgrading: 12, Installing: 0, Removing: 0, Not Upgrading: 0`), then asks `Continue? [Y/n]`. The capital `Y` means the default answer: just press **Enter**. Note whether that list contains a name starting with `linux-image`, `raspi-firmware`, or `rpi-eeprom` (step 3). If a screen of change notes (`NEWS`) appears halfway and stops to wait, press **q** to continue. The first update after the card was written can take a few minutes. Let it run until the prompt `budi@gateway:~ $` appears again; don't close the terminal or let the laptop sleep halfway through.
3. If that list contained `linux-image`, `raspi-firmware`, or `rpi-eeprom`, restart the Pi so that its new kernel and firmware get used (Concept 8):

   ```bash
   sudo reboot
   ```

   The SSH connection drops right away, usually with the message `Connection to gateway.local closed by remote host.` Wait about one minute, then log in again with `ssh budi@gateway.local`.

#### 1.5 Asking Linux itself (`man`, `--help`, `history`)

- `man ls` opens the manual of the `ls` command (leave with **q**). Almost every command also accepts `--help`, for example `ls --help`, which prints a summary of its options.
- `history` prints the commands you've typed. Useful when you forget "what did I just type?".
- `exit` (or **Ctrl + D**) leaves SSH and takes you back to the laptop's terminal.

**This week's commands at a glance** (keep this for quick reference):

| Group | Commands |
| :--- | :--- |
| Moving around and looking | `pwd`, `ls -la`, `cd`, `cat`, `less` |
| Files and folders | `mkdir`, `nano`, `cp`, `mv`, `rm` |
| Authority and packages | `sudo`, `apt update`, `apt full-upgrade`, `apt install` |
| Health and network | `uptime`, `df -h`, `free -h`, `hostname -I`, `ping` |
| Fixed address (Practice 2) | `nmcli`, `ip` |
| Services and logs (Practices 3–5) | `systemctl`, `journalctl`, `tail` |
| Maintenance (Practice 6) | `vcgencmd`, `scp` (typed on the laptop) |
| Help and leaving | `man`, `history`, `exit`, `sudo reboot`, `sudo poweroff` |

> ⬆️ **Done with Practice 1?** Go back to [Concept 6](#6-a-fixed-address-the-post-office-mustnt-move-house).

### Practice 2 — A fixed address for the Pi (30 minutes)

> 🖥️ **Tools:** the SSH terminal to the Pi, a browser on the laptop (for Option A), and the network ID card from Practice 2 of Module 10 (in `notes-module10.md`). The Pi is connected to the router with a **LAN cable**. Concepts used: 6.
>
> ⭐ **Required** — Node 1 and MQTTX will connect to this address.

#### 2.1 Get to know the Pi's network connections

1. **On the Pi**, ask for the state of all the network "ports":

   ```bash
   nmcli device status
   ```

   **Expected output** (example):

   ```text
   DEVICE         TYPE      STATE                   CONNECTION
   eth0           ethernet  connected               netplan-eth0
   wlan0          wifi      connected               netplan-wlan0-OurHome
   lo             loopback  connected (externally)  lo
   p2p-dev-wlan0  wifi-p2p  disconnected            --
   ```

   `eth0` is the LAN cable port, and `wlan0` is the Wi-Fi. The `CONNECTION` column holds the **connection name** in use: `netplan-eth0` for the cable, and `netplan-wlan0-` followed by your Wi-Fi's name. Write down the connection name for `eth0` exactly as it's printed; you need it in Option B. (You can ignore the last two lines.)
2. Look at the LAN cable's IP address and its MAC address:

   ```bash
   ip -4 addr show eth0
   ```

   ```bash
   ip link show eth0
   ```

   **Expected output** (example):

   ```text
   2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
       inet 192.168.1.37/24 brd 192.168.1.255 scope global dynamic noprefixroute eth0
          valid_lft 86213sec preferred_lft 86213sec
   2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP mode DEFAULT group default qlen 1000
       link/ether d8:3a:dd:12:34:56 brd ff:ff:ff:ff:ff:ff
   ```

   The first three lines are the answer to the first command, and the last two lines are the answer to the second. Write down the address after `inet` without the `/24` (for example `192.168.1.37`) and the address after `link/ether` (the MAC address, for example `d8:3a:dd:12:34:56`). The word `dynamic` and the `valid_lft` value (the time left on the loan, in seconds) mark an address that's **on loan** from the router.
3. Look at the router's address, also called the gateway router (Module 10):

   ```bash
   ip route
   ```

   The first line reads `default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.37 metric 100`. The number after `via` is the router's address. A similar second line, with `dev wlan0` and `metric 600`, is the route over Wi-Fi; the route with the smaller `metric` number is used first, so the Pi uses the cable as long as the cable is connected.

Now choose **one** option: **Option A** if you can reserve an address on the router's admin page (as in Practice 9 of Module 10), or **Option B** if you can't.

#### 2.2 Option A — reserve the address on the router

1. Log in to the router's admin page in the laptop's browser, then open the address reservation menu as in Practice 9.3 of Module 10 (TP-Link routers: **Advanced → Network → DHCP Server → Address Reservation**).
2. Add a new reservation: the **MAC address of `eth0`** from step 2.1 (TP-Link writes it with hyphens and capital letters: `D8-3A-DD-12-34-56`) and **the IP address the Pi is using right now**, for example `192.168.1.37`. Save, and make sure the rule is active.
3. Test: **on the Pi**, restart with `sudo reboot`, wait about one minute, log in again, then run `hostname -I`. The cable's address is still `192.168.1.37`. The real proof: the Pi's MAC address is now listed in the router's reservation list.

Continue to 2.4.

#### 2.3 Option B — a fixed IP on the Pi with `nmcli`

With this option, the Pi sets its own address, so you have to choose an address that **the router will never lend** to another device. The official Raspberry Pi documentation is clear about it: the address must be **outside the router's lending range (the *DHCP pool*)**, and it must not be in use by another device.

- **The router can be opened, but there's no reservation menu?** Look for its range in the LAN or DHCP menu, usually written as **Start IP Address** and **End IP Address**. Choose an address outside that range. For example, if the router lends out `192.168.1.100` to `192.168.1.199`, the address the Pi currently has on loan is surely one of them (for example `192.168.1.105`), while an address outside the range such as `192.168.1.37` is safe to choose. Also make sure the address you choose isn't in use right now: open a second Terminal window **on the laptop** and leave the SSH window open (Windows: as in step 4 of the Quick Win; macOS: in Terminal, press **Cmd + N**), then `ping` that address. The ping must fail: on Windows it says `Request timed out.` or `Destination host unreachable.` (sometimes preceded by `Reply from` and your laptop's own address; that still means nobody answered), and on macOS `Request timeout for icmp_seq 0`, then `1`, `2`, and so on (sometimes with `ping: sendto: …` lines in between) until you press **Ctrl + C**. The Pi's address will move to this chosen address in step 2 below.
- **The router can't be opened at all?** Then you can't see its range. The emergency way out is to use **the address that's currently lent to the Pi** (step 2.1): that address is surely in the right block and isn't used by another device right now. Because the Pi is on 24 hours a day, most routers will find that address in use before lending it out again. However, that address is still inside the lending range, so a conflict can still happen, especially after the Pi has been off for a long time. The signs and the cure are in 🚨. As soon as you can open the router, switch to Option A.

> ⚠️ **Before you start, make sure the backup path is open.** `nmcli device status` in 2.1 must show `wlan0` as `connected`. If there's a typo in the cable settings, you can still log in over Wi-Fi with `ssh budi@gateway.local`. A Pi without Wi-Fi? First read "The Pi can't be reached after changing its address" in 🚨. A Pi Zero 2 W only has Wi-Fi, so it has no backup path: it's better to use Option A, or first read its adjustments in 🔬 "Pi 5, Pi 4, or Pi Zero 2 W?".

1. **On the Pi**, change the cable connection so that it uses a fixed address. If your connection name in step 2.1 isn't `netplan-eth0`, replace that name (keep it between the double quotes). Also replace all three addresses: `192.168.1.37` with the Pi address you chose above (an address outside the lending range, or the address the Pi currently has on loan if the router can't be opened), and both `192.168.1.1` with the router's address from step 2.1. All the settings must be written in **one** command:

   ```bash
   sudo nmcli connection modify "netplan-eth0" ipv4.method manual ipv4.addresses 192.168.1.37/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.1
   ```

   - `ipv4.method manual`: stop asking the router for an address; use the address written here.
   - `ipv4.addresses 192.168.1.37/24`: the Pi's address; `/24` is the same as the *subnet mask* `255.255.255.0` (Concept 1 of Module 10).
   - `ipv4.gateway` and `ipv4.dns`: the router's address, for reaching the internet and looking up names.

   This command prints nothing if it succeeds, and it doesn't change the running connection yet; it only saves the settings. NetworkManager writes them to a netplan settings file in `/etc/netplan/`, so these settings are still there after the Pi restarts. Does `Error: Failed to modify connection 'netplan-eth0': ipv4.method: method 'manual' requires at least an address or a route` appear? The `ipv4.addresses …` part is missing or mistyped: repeat the whole command on one line.
2. Apply those settings:

   ```bash
   sudo nmcli connection up "netplan-eth0"
   ```

   **Expected output:** `Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/5)` (its last number may be different). If you logged in over the cable and its address changed, your SSH terminal freezes: close the window, then log in again with `ssh budi@gateway.local`.
3. Check:

   ```bash
   ip -4 addr show eth0
   ```

   The line now reads `inet 192.168.1.37/24 brd 192.168.1.255 scope global noprefixroute eth0`, **without** the word `dynamic`, and with `valid_lft forever`: this address isn't on loan anymore.
4. Restart (`sudo reboot`), log in again, and run `hostname -I`. The cable's address is still `192.168.1.37`.

> 💡 **Prefer a menu to typing long commands?** Raspberry Pi OS also has `sudo nmtui`, a text-based menu for NetworkManager: choose **Edit a connection**, then `netplan-eth0`. The result is the same as the command above.

#### 2.4 Test from the laptop

1. Type `exit` in the SSH terminal until the laptop's prompt appears again, then test the new address **on the laptop**:

   ```bash
   ping 192.168.1.37
   ```

   On Windows, `ping` stops by itself after four replies. On macOS and Linux, stop it with **Ctrl + C**.
2. Log in through that address:

   ```bash
   ssh budi@192.168.1.37
   ```

   SSH asks again (`The authenticity of host '192.168.1.37 (192.168.1.37)' can't be established.`) because the laptop recorded the Pi under the name `gateway.local`, not under its address. SSH even tells you that the same key is already known under the name `gateway.local`. Answer `yes`.
3. Write down the Pi's fixed address in two places. **On the Pi**, in `gateway-notes.txt` from Practice 1: that file is in the `practice` folder, so open it with `nano ~/practice/gateway-notes.txt` (without `~/practice/`, nano opens a new, empty file in your home folder). **On the laptop**, in a new file, `notes-module12.md`, in the **Documents → GitHub → learn-iot → module-12** folder (create the folder if it doesn't exist yet), like `notes-module11.md` in Module 11 (in VS Code: **File → New Text File**, then **File → Save As…** to that folder); this file is completed and saved to GitHub in ➕ F. From now on, Node 1, MQTTX, and the contract checker use this address.

> ⬆️ **Done with Practice 2?** Go back to [Concept 7](#7-services-and-systemd-a-security-guard-who-never-sleeps).

### Practice 3 — Mosquitto as a service on the Pi (30 minutes)

> 🖥️ **Tools:** the SSH terminal to the Pi (the fixed address from Practice 2) and **MQTTX** on the laptop. Concepts used: 7, and Concept 3 of Module 11 (door 1883 and local only mode).
>
> ⭐ **Required** — this is the broker the Mini Smart Home uses from this week on.

#### 3.1 Install Mosquitto

1. **On the Pi**, install the broker and its terminal tools (`mosquitto_pub`, `mosquitto_sub`) in one go:

   ```bash
   sudo apt update
   ```

   ```bash
   sudo apt install mosquitto mosquitto-clients
   ```

   **Expected output** (example; the list and the sizes may be slightly different):

   ```text
   Installing:
     mosquitto  mosquitto-clients

   Installing dependencies:
     libcjson1  libdlt2  libmosquitto1  libwebsockets19t64

   Summary:
     Upgrading: 0, Installing: 6, Removing: 0, Not Upgrading: 0
     Download size: 1,062 kB
     Space needed: 3,456 kB / 25.1 GB available

   Continue? [Y/n]
   ```

   Press **Enter** (the default answer, `Y`). `apt` downloads and installs all six packages, then returns to the prompt. The `mosquitto` package from Debian immediately **enables** and **starts** its service.
2. Ask the guard how it's doing:

   ```bash
   systemctl status mosquitto
   ```

   **Expected output** (example):

   ```text
   ● mosquitto.service - Mosquitto MQTT Broker
        Loaded: loaded (/usr/lib/systemd/system/mosquitto.service; enabled; preset: enabled)
        Active: active (running) since Sun 2026-10-18 09:12:31 WIB; 1min 4s ago
    Invocation: 3f0c9d6a2b5e4c18a7d1e9f04b6c2a7e
          Docs: man:mosquitto.conf(5)
                man:mosquitto(8)
       Process: 803 ExecStartPre=/bin/mkdir -m 740 -p /var/log/mosquitto (code=exited, status=0/SUCCESS)
       Process: 805 ExecStartPre=/bin/chown mosquitto:mosquitto /var/log/mosquitto (code=exited, status=0/SUCCESS)
       Process: 807 ExecStartPre=/bin/mkdir -m 740 -p /run/mosquitto (code=exited, status=0/SUCCESS)
       Process: 809 ExecStartPre=/bin/chown mosquitto:mosquitto /run/mosquitto (code=exited, status=0/SUCCESS)
      Main PID: 812 (mosquitto)
         Tasks: 1 (limit: 2252)
           CPU: 47ms
        CGroup: /system.slice/mosquitto.service
                └─812 /usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf

   Oct 18 09:12:31 gateway systemd[1]: Starting mosquitto.service - Mosquitto MQTT Broker...
   Oct 18 09:12:31 gateway systemd[1]: Started mosquitto.service - Mosquitto MQTT Broker.
   ```

   Three things to look at: `enabled` on the `Loaded:` line (it starts when the Pi starts), the green `active (running)` on the `Active:` line (it's running right now), and `Main PID:` (the number of the running program; this number changes every time the broker is restarted, and Practice 4 makes use of that). The `Process:` lines are four small preparations before the broker is started, and the last two lines are an excerpt from the guard's logbook. The prompt doesn't come back right away? Press **q**.

Mosquitto has already become a service, without you writing a single unit file. However, it's still in **local only mode**, exactly as when you first ran it on the laptop in Module 11: only programs on the Pi itself are allowed in. Prove it:

3. Mosquitto's log on the Pi is kept in a file that only the head of the office may read, so use `sudo`. Show its last lines:

   ```bash
   sudo tail /var/log/mosquitto/mosquitto.log
   ```

   **Expected output** (example):

   ```text
   1792289551: mosquitto version 2.0.21 starting
   1792289551: Config loaded from /etc/mosquitto/mosquitto.conf.
   1792289551: Starting in local only mode. Connections will only be possible from clients running on this machine.
   1792289551: Create a configuration file which defines a listener to allow remote access.
   1792289551: For more details see https://mosquitto.org/documentation/authentication-methods/
   1792289551: Opening ipv4 listen socket on port 1883.
   1792289551: Opening ipv6 listen socket on port 1883.
   1792289551: mosquitto version 2.0.21 running
   ```

   The same as the warning on the laptop in Practice 1.2 of Module 11: `Starting in local only mode`.

#### 3.2 Open the door to the home network

In Module 11, the broker on the laptop was started with `-c mosquitto-lan.conf`. The service on the Pi doesn't use that file; it always reads the main settings file, `/etc/mosquitto/mosquitto.conf`. **On the Pi**, look at its contents:

```bash
cat /etc/mosquitto/mosquitto.conf
```

That default Debian file saves retained messages to the card (`persistence true`), writes the log to `/var/log/mosquitto/mosquitto.log` (`log_dest file …`), and, most importantly, contains the line `include_dir /etc/mosquitto/conf.d`. That means every file ending in `.conf` in the `conf.d` folder is read too. So we don't change the main file; we just **add one small file**.

1. **On the Pi**, create the file with nano. This file has to be written with the head of the office's authority (`sudo`), because its folder is in `/etc`:

   ```bash
   sudo nano /etc/mosquitto/conf.d/gateway-pi.conf
   ```

2. Type the following contents, then save (**Ctrl + O**, **Enter**) and leave (**Ctrl + X**). The first three lines, which start with `#`, are only notes for humans: you may shorten them, as long as each line still starts with `#`. The last two lines must be typed exactly like this:

   ```text
   # gateway-pi.conf - the Mini Smart Home broker on the Raspberry Pi gateway (Module 12).
   # Location on the Pi: /etc/mosquitto/conf.d/gateway-pi.conf. Open to the home network WITHOUT a password:
   # don't set up port forwarding to the Pi. The real lock comes in Module 21.
   listener 1883
   allow_anonymous true
   ```

   Those two lines are the same as the contents of `mosquitto-lan.conf` from Module 11: `listener 1883` opens the door for all of the Pi's networks, and `allow_anonymous true` lets clients in without a username. As in Module 11, a note (`#`) may only be at the start of a line. The same file is also available in [`mini-smart-home/edge/`](../../mini-smart-home/edge/gateway-pi.conf).
3. Restart the service so that the new file gets read:

   ```bash
   sudo systemctl restart mosquitto
   ```

   No news is good news: `systemctl` only speaks up if something fails. Don't use `reload` for this change: Mosquitto can't open a new door without a restart. Check:

   ```bash
   systemctl status mosquitto
   ```

   `Active:` must be back to `active (running)`, with a new `Main PID`. Does `failed` appear? Open "Mosquitto `failed` after the settings file was changed" in 🚨.
4. Look at the log again:

   ```bash
   sudo tail /var/log/mosquitto/mosquitto.log
   ```

   **Expected output** (example, the bottom lines):

   ```text
   1792289860: mosquitto version 2.0.21 terminating
   1792289860: Saving in-memory database to /var/lib/mosquitto//mosquitto.db.
   1792289860: mosquitto version 2.0.21 starting
   1792289860: Config loaded from /etc/mosquitto/mosquitto.conf.
   1792289860: Opening ipv4 listen socket on port 1883.
   1792289860: Opening ipv6 listen socket on port 1883.
   1792289860: mosquitto version 2.0.21 running
   ```

   The `local only mode` warning is gone: door 1883 is now open to the home network. Also notice the `Saving in-memory database` line: before stopping, the broker saves the retained messages to the card, so its notice board isn't empty after a restart. (The double slash `//` in the path really is how Mosquitto writes it; it's harmless.)

> 🔒 **Remember safety rule number 2.** The broker on the Pi is now open to anyone connected to your home network, without a password. Unlike the laptop, the Pi is never taken to public Wi-Fi, so the rule "stop it before you go to a café" no longer applies. What still applies: **never** set up *port forwarding* to the Pi on the router. The real lock comes in Module 21.

#### 3.3 Test from the Pi itself and from the laptop

1. **On the Pi**, become a subscriber to the practice topics. This command keeps running and waits for messages:

   ```bash
   mosquitto_sub -h localhost -v -t "practice/#"
   ```

2. **On the laptop**, open MQTTX and create a new connection through the **+** icon on the far left bar, as in Practice 2.3 of Module 11. Fill in **Name** with `Pi gateway` and **Host** with the Pi's fixed address, for example `192.168.1.37` (leave the `mqtt://` in front of it); **Port** stays `1883`. Click **Connect** in the top right corner, then wait until the name **Pi gateway** turns green. You can leave the old **Laptop broker** connection as it is; once the laptop broker retires in the ➕ section, it simply won't connect anymore.
3. In MQTTX's send box, choose **Plaintext**, fill in **Topic** with `practice/hello`, type `Hello gateway!`, then click the send button (the paper plane icon), as in Practice 2.3 of Module 11.
4. The SSH terminal running `mosquitto_sub` immediately prints:

   ```text
   practice/hello Hello gateway!
   ```

   The message from the laptop reached the Pi through the broker on the Pi. Stop `mosquitto_sub` with **Ctrl + C**.

Not connected? Open "MQTTX or Node 1 can't connect to the broker on the Pi" in 🚨.

### Practice 4 — Test: the service gets back up by itself (20 minutes)

> 🖥️ **Tools:** an SSH terminal to the Pi, and **MQTTX** connected through the **Pi gateway** connection. Concepts used: 7.
>
> ⭐ **Required** — this is the "gateway that's always on" promise.

#### 4.1 First promise: it starts by itself when the Pi starts

1. **On the Pi**, make sure Mosquitto is on the morning duty list:

   ```bash
   systemctl is-enabled mosquitto
   ```

   **Expected output:** `enabled`.
2. Restart the whole Pi:

   ```bash
   sudo reboot
   ```

3. Watch MQTTX: the **Pi gateway** connection drops, and its name is no longer green. Wait about one minute, then click **Connect** again. MQTTX connects **without you typing anything on the Pi**: the guard already started the broker when the Pi started.

#### 4.2 Second promise: it gets back up by itself after a crash

We're going to "kill" Mosquitto by force, like a program that suddenly breaks down.

1. **On the Pi** (log in again over SSH), look at the restart rule in its unit file, and note its program number:

   ```bash
   systemctl cat mosquitto
   ```

   Among its contents is the line `Restart=on-failure`: "if the program dies because it failed, start it again". Then:

   ```bash
   systemctl show -p MainPID mosquitto
   ```

   **Expected output** (example): `MainPID=812`.
2. Force it to stop, exactly like a program that suddenly breaks down:

   ```bash
   sudo systemctl kill --signal=KILL mosquitto
   ```

3. Wait two seconds, then ask again:

   ```bash
   systemctl show -p MainPID mosquitto
   ```

   **Expected output** (example): `MainPID=1407`. The number is **different**: the old broker died, and the guard has already started a new one. `systemctl status mosquitto` also shows `active (running)`, with a `since` of a few seconds ago.
4. See what happened in the guard's logbook:

   ```bash
   journalctl -u mosquitto -n 6
   ```

   **Expected output** (example):

   ```text
   Oct 18 09:31:07 gateway systemd[1]: mosquitto.service: Main process exited, code=killed, status=9/KILL
   Oct 18 09:31:07 gateway systemd[1]: mosquitto.service: Failed with result 'signal'.
   Oct 18 09:31:07 gateway systemd[1]: mosquitto.service: Scheduled restart job, restart counter is at 1.
   Oct 18 09:31:07 gateway systemd[1]: Starting mosquitto.service - Mosquitto MQTT Broker...
   Oct 18 09:31:07 gateway mosquitto[1407]: 1792290667: Loading config file /etc/mosquitto/conf.d/gateway-pi.conf
   Oct 18 09:31:07 gateway systemd[1]: Started mosquitto.service - Mosquitto MQTT Broker.
   ```

   Read it from the top: the main program was killed (`status=9/KILL`), the guard logged it as a failure (`'signal'`), scheduled the first restart (`restart counter is at 1`), then started it again. All in less than one second.
5. In MQTTX, the **Pi gateway** connection may drop for a moment. If its name isn't green again after a few seconds, click **Connect**.

> 💡 **Why doesn't `systemctl stop` make the broker come back?** Stopping on your command isn't a "failure". The guard only wakes up services that fall over by themselves. Want a stricter guard, for example one that always brings it back, whatever the cause? That's 🧩 Level 2.

### Practice 5 — Reading the logs (20 minutes)

> 🖥️ **Tools:** an SSH terminal to the Pi, and **MQTTX**. Concepts used: 7.
>
> ⭐ **Required** — the Module 12 completion requirement asks that you can read the gateway's logs over SSH.

#### 5.1 The guard's logbook: `journalctl`

1. **On the Pi**, show the log of the Mosquitto service:

   ```bash
   journalctl -u mosquitto
   ```

   Scroll with the arrow keys, and quit with **q**. It only holds the **service's** events: when it was started, stopped, or failed, plus the `Loading config file …` line that Mosquitto writes just before its own log is ready. Who connects to the broker isn't recorded here (5.2).
2. Show only the latest entries, for example the last twenty lines, or the log from the last 10 minutes:

   ```bash
   journalctl -u mosquitto -n 20
   ```

   ```bash
   journalctl -u mosquitto --since "10 min ago"
   ```

3. Show all the errors since the Pi last started, from any service:

   ```bash
   journalctl -b -p err
   ```

   No errors? The output is `-- No entries --`. A few red lines appear? Don't panic: even a healthy Pi often has one or two lines from the kernel about devices that aren't used. The lines worth a closer look are the ones that mention `mosquitto`, or lines that keep piling up every time you repeat this command.
4. Try looking at the log from **before** the Pi was restarted in Practice 4.1:

   ```bash
   journalctl -b -1
   ```

   **Expected output:** `Specifying boot ID or boot offset has no effect, no persistent journal was found.` This is what Concept 7 meant: on Raspberry Pi OS, the guard's logbook is kept in memory and is lost every time the Pi restarts. How to keep it on the card is in 🔬.

#### 5.2 Mosquitto's own log: `mosquitto.log`

1. **On the Pi**, follow the log live as it's written (`-f` = *follow*):

   ```bash
   sudo tail -f /var/log/mosquitto/mosquitto.log
   ```

2. **On the laptop**, disconnect MQTTX and connect it again: click the power button icon (**Disconnect**) at the top right of the **Pi gateway** connection, then **Connect**. In the SSH terminal, new lines appear instantly. **Expected output** (example):

   ```text
   1792291013: Client mqttx_3f9a1c2b disconnected.
   1792291016: New connection from 192.168.1.10:53120 on port 1883.
   1792291016: New client connected from 192.168.1.10:53120 as mqttx_3f9a1c2b (p5, c1, k60).
   ```

   The second and third lines name the laptop's address and port number, MQTTX's client name (`mqttx_…`), and three details in parentheses: `p5` means MQTT version 5 (MQTTX uses it by default; Node 1 uses MQTT 3.1.1, logged as `p2`), `c1` means a *clean session* (Concept 6 of Module 11), and `k60` means a 60-second *keep-alive* (Node 1: `k15`).
3. Stop it with **Ctrl + C**.

One note for anyone comparing this with the laptop: Mosquitto 2.0.21 on the Pi writes `Client … disconnected.` (the client said goodbye properly), `Client … closed its connection.` (the connection was closed without a goodbye), and `Client … has exceeded timeout, disconnecting.` (the client was silent for more than 1.5 times its *keep-alive*, Concept 7 of Module 11). Mosquitto 2.1.2 on the laptop writes the same things in slightly different words, with the client's address in square brackets.

The number at the start of every line is Mosquitto's clock, counted in seconds since January 1, 1970 (Concept 6 of Module 10), just as on the laptop. To read it, ask Linux **on the Pi** to translate it (this command doesn't work in PowerShell or in the Mac Terminal):

```bash
date -d @1792291016 "+%Y-%m-%d %H:%M:%S"
```

**Expected output:** `2026-10-18 09:36:56`, in the time zone you chose in Imager. The `-d @…` part means "the date from this number of seconds", and the part in double quotes is the format it's written in: year-month-day hour:minute:second. Making Mosquitto print an easy-to-read time right away is 🧩 Level 1.

> ⬆️ **Done with Practices 3–5?** Go back to [Concept 8](#8-looking-after-the-gateway-the-microsd-card-power-and-backups).

### Practice 6 — Looking after the gateway (30 minutes)

> 🖥️ **Tools:** an SSH terminal to the Pi, and **VS Code** with the `mini-smart-home` folder on the laptop. Concepts used: 8.

#### 6.1 A monthly check in five commands

**On the Pi**, run them one at a time, and compare the results with your Practice 1 notes (`cat ~/practice/gateway-notes.txt`):

| Command | What it checks | Healthy answer | Warning sign |
| :--- | :--- | :--- | :--- |
| `vcgencmd get_throttled` | Has it been short of voltage, or overheated, since it started? | `throttled=0x0` | any number other than `0x0` (table below) |
| `vcgencmd measure_temp` | The processor's temperature right now | for example `temp=48.3'C` | constantly above 80 °C: check the cooler |
| `df -h /` | Space left on the card | `Use%` below 80% | `Use%` above 80% |
| `systemctl list-units --failed` | Any services that failed? | `0 loaded units listed.` | a service line marked `failed` |
| `uptime -p` | Did the Pi restart without you knowing? | matches what you expect | the number is much smaller than you thought |

**Reading `get_throttled`.** The number is a collection of flags. The four most important ones:

| Flag | What it means |
| :--- | :--- |
| `0x1` | the voltage **is** too low right now (undervoltage) |
| `0x4` | the processor **is** being slowed down right now |
| `0x10000` | the voltage **has been** too low since the Pi started |
| `0x40000` | the processor **has been** slowed down since the Pi started |

The flags are added together. For example, `throttled=0x50005` means the voltage is too low and the processor is being slowed down right now, and both have also happened before; `0x50000` means they happened, but everything is back to normal now. The voltage flags (`0x1`, `0x10000`) almost always mean the adapter or the USB-C cable isn't strong enough: replace it with the official adapter. Slow-down flags without a voltage flag usually mean the Pi is overheating: check its cooler (🚨).

Finally, update as in Practice 1.4: `sudo apt update`, then `sudo apt full-upgrade`.

#### 6.2 Backing up the gateway settings to the laptop

There's only one file you really changed on the Pi this week: `/etc/mosquitto/conf.d/gateway-pi.conf`. We copy it into the `mini-smart-home` repository, in the `edge` folder, where `mosquitto-lan.conf` is kept too. The tool is **`scp`** (*secure copy*), SSH's sibling for copying files, which also comes with Windows and macOS.

1. **On the laptop**, open a VS Code terminal in the `mini-smart-home` folder (**Terminal → New Terminal**), then copy the file from the Pi:

   ```bash
   scp budi@192.168.1.37:/etc/mosquitto/conf.d/gateway-pi.conf edge/
   ```

   The `scp` pattern is always **from**, then **to**: `budi@192.168.1.37:/etc/…/gateway-pi.conf` is the file on the Pi (the address, a colon, then the file's path), and `edge/` is the folder on the laptop. Enter the Pi's password when asked. Every user on the Pi may read this file, so `sudo` isn't needed.
2. The file `edge/gateway-pi.conf` now appears in VS Code's **Explorer**. Open it, and make sure its contents are the same as what you typed in Practice 3.2.

If the microSD card ever breaks, this file plus the recipe in section ➕ E is enough to rebuild the gateway from a blank card. You can still make a full copy of the card as a second layer; how to do it is in 🔬.

#### 6.3 Shutting down and starting the Pi properly

1. **On the Pi**:

   ```bash
   sudo poweroff
   ```

   The SSH connection drops right away.
2. Wait for the safe sign from its lights (Concept 8). On the **Pi 4**, the green light blinks briefly a few times, then goes out (the red light may stay on); on the **Pi 5**, the STAT status light next to the power button turns **red**. Only then unplug the adapter.
3. To start it again, on the **Pi 4**, unplug the adapter and plug it back in. On the **Pi 5**, if the adapter is still plugged in, just press the power button once; if the adapter was unplugged, the Pi starts by itself as soon as it's plugged in. On the Pi 5, pressing the power button once while the Pi is running also shuts it down properly, just like `sudo poweroff`. Holding that button down for a long time forces the Pi off instantly; only do that if the Pi is completely frozen. Now start your Pi again in the way above, wait about one minute, then click **Connect** on the **Pi gateway** connection in MQTTX: 🧩 and ➕ need a Pi that's running.

Make this order a habit every time the Pi needs to be moved or cleaned, or when the power in the house is going to be switched off. If the power goes out suddenly, don't panic: start the Pi again, then run the 6.1 check.

> ➡️ **Done with Practice 6?** Do the [🧩 Independent Challenges](#-independent-challenges) (at least Level 1), then the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home). Practice 7 is only for the laptop path.

### Practice 7 — Laptop path: Mosquitto as a service (30 minutes)

> 🖥️ **Tools:** a laptop with Mosquitto from Practice 1 of Module 11, administrator rights, and **MQTTX**. Concepts used: 7.
>
> Do this practice **only if you don't have a Raspberry Pi yet**. Your laptop becomes a temporary gateway, with the alternative completion criterion from the Syllabus: Mosquitto runs as a service without a terminal open. A laptop that sleeps or is shut down still stops the broker; this is a middle path until Kit B arrives. Like the Pi gateway (Concept 6), this laptop also needs an address that doesn't change, because Node 1 stores it in `BROKER_ADDRESS`: reserve your laptop's address on the router as in Option A (Practice 2.2), using the laptop's MAC address and IP address as listed in the router's device list (Practice 9.2 of Module 10). Can't open the router? Skip this reservation, but every time MQTTX or Node 1 fails to connect, first check your laptop's address as in step 5 of Practice 7.1, then update **Host** in MQTTX and Node 1's `BROKER_ADDRESS` if the address has changed.

**Before you start:** stop the broker that's still running in the VS Code terminal with **Ctrl + C**. Two brokers can't use door 1883 at the same time (🚨 in Module 11, "Two brokers running at the same time").

#### 7.1 Windows

In Module 11, you deliberately unchecked **Service** in the installer. Now we install it. On Windows, the Mosquitto service **always** reads the `mosquitto.conf` file in its installation folder, so the LAN settings have to be written there.

1. **On the laptop**, open **Terminal as administrator**: right-click the **Start** button → **Terminal (Admin)** (Windows 10: **Windows PowerShell (Admin)**), then answer **Yes**. Go into the Mosquitto folder:

   ```powershell
   cd "C:\Program Files\Mosquitto"
   ```

2. First save a copy of the original file, then open the file with Notepad (which also runs as administrator, so it's allowed to save in this folder):

   ```powershell
   copy mosquitto.conf mosquitto.conf.original
   ```

   ```powershell
   notepad mosquitto.conf
   ```

3. This file is long, with hundreds of comment lines that start with `#`. Press **Ctrl + End** to jump to the **very bottom**, add these three lines there, then save (**Ctrl + S**) and close Notepad:

   ```text
   listener 1883
   allow_anonymous true
   log_dest file C:\Program Files\Mosquitto\mosquitto.log
   ```

   The first two lines are the same as `mosquitto-lan.conf`. The third line matters on Windows: the Mosquitto service **logs nothing at all** unless it's told where to write its log. The firewall permission for `mosquitto.exe` from Practice 1.4 of Module 11 still applies, because it's the same program.
4. Register Mosquitto as a service, then start it:

   ```powershell
   .\mosquitto install
   ```

   ```powershell
   net start mosquitto
   ```

   **Expected output:** `.\mosquitto install` prints nothing if it succeeds, then `net start mosquitto` writes `The Mosquitto Broker service is starting.` and `The Mosquitto Broker service was started successfully.` (on a Windows set to another language, the sentences follow your Windows language). A service called **Mosquitto Broker** is now registered with the *startup type* **Automatic**: it starts by itself every time Windows starts. You can see it in the **Services** app (press **Win + R**, type `services.msc`, then press **Enter**). Do you see `Error: …`, `Access is denied`, or `could not be started`? Open "Laptop path: the Mosquitto service won't start" in 🚨.
5. Test: close VS Code, then in MQTTX connect **Via laptop IP**, the connection to your laptop's IP address from Practice 2.4 of Module 11 (deleted it? create it again with the **+** icon). First check whether your laptop's address is still the same as that connection's **Host**: run `ipconfig` on Windows or `ipconfig getifaddr en0` on macOS (Practice 1.5 of Module 11), and if it's different, change its **Host** through that connection's **Edit** option. Don't use **Laptop broker**: its address is `127.0.0.1`, so that connection still works even if the broker hasn't opened its door to the network. Add the subscription `practice/#` (**New Subscription**), then send `Hello service!` to the topic `practice/hello` in **Plaintext** format: that message shows up again as an incoming message. Then restart the laptop, and without opening any terminal, connect MQTTX again: the broker is already waiting.

The service's log is written to `C:\Program Files\Mosquitto\mosquitto.log`, but Mosquitto makes that file readable only by the Windows system account that runs the service. Remember two limits of this Windows service as well: it does **not** get back up by itself after a crash (the Mosquitto installer doesn't give Windows that rule), and it stops when the laptop sleeps. You may need the following three things later; the `net` and `.\mosquitto` commands in them are typed in Terminal (Admin), from the `C:\Program Files\Mosquitto` folder:

- **Viewing the log:** stop the service for a moment with `net stop mosquitto`. Then run the broker exactly as in Module 11, in the VS Code terminal: `cd edge`, then `mosquitto -v -c mosquitto-lan.conf`. Don't use the `mosquitto.conf` from the installation folder for this: its `log_dest file` line sends every log line to the file, not to the screen, even with the `-v` option. When you're done watching, press **Ctrl + C** in the VS Code terminal, then run `net start mosquitto` again in Terminal (Admin).
- **Changing the settings:** change `mosquitto.conf` with Notepad as in step 2, then run `net stop mosquitto` and `net start mosquitto`.
- **Removing the service:** run `net stop mosquitto`, then `.\mosquitto uninstall`.

#### 7.2 macOS

Homebrew can turn Mosquitto into a service that starts every time you log in to your Mac.

1. **On the laptop**, open Homebrew's settings file in Terminal (a Mac with an Apple chip; on an Intel Mac, replace `/opt/homebrew` with `/usr/local`):

   ```bash
   nano /opt/homebrew/etc/mosquitto/mosquitto.conf
   ```

2. This file is long too. Jump to the last line with **Ctrl + W**, then **Ctrl + V**, add these two lines at the **very bottom**, then save (**Ctrl + O**, **Enter**) and exit (**Ctrl + X**):

   ```text
   listener 1883
   allow_anonymous true
   ```

3. Start the service:

   ```bash
   brew services start mosquitto
   ```

   Homebrew runs Mosquitto right away and registers it so that it starts every time you log in. Check with `brew services list`: the `mosquitto` line must have the status `started`.
4. Test it as in step 5 for Windows. To stop it and cross it off the list: `brew services stop mosquitto`. Just as on Windows, this service doesn't get back up by itself after a crash.

#### 7.3 Linux (Ubuntu, Debian)

A Linux laptop uses the same package and the same systemd as the Raspberry Pi. In Module 11, you turned its service off with `sudo systemctl disable --now mosquitto`. Now it's the other way around: create `/etc/mosquitto/conf.d/gateway-pi.conf` as in Practice 3.2, run `sudo systemctl enable --now mosquitto`, then test as in Practice 4. On Ubuntu, the Mosquitto version and some of the texts in its log are slightly different, but the steps are the same.

> ➡️ **Done with Practice 7?** Do the [🧩 Independent Challenges](#-independent-challenges), following the laptop path note at their start, then the [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home), with your laptop's address as `BROKER_ADDRESS`.

---

## 🚨 Troubleshooting

This week's problems can almost always be tracked down with three questions, in order: **Is the Pi on and connected to the network?** (the lights, `ping`) → **Can I log in?** (SSH) → **Is the service running?** (`systemctl status`, the logs). Click a problem's title to open its explanation.

**Old tutorials vs Raspberry Pi OS Trixie.** Many Raspberry Pi tutorials on the internet were written for older versions. If a tutorial tells you to do something in the left column, use the way in the right column:

| An old tutorial tells you to… | What's right for our version |
| :--- | :--- |
| Log in with the user `pi` and the password `raspberry` | There's no default user anymore. The user is created in Imager, on the **Choose username** screen (Quick Win step 2). |
| Put an empty file called `ssh` on the card to turn on SSH | Turn on **Enable SSH** in Imager, on the **SSH authentication** screen. |
| Put `wpa_supplicant.conf` on the card for Wi-Fi | Fill in the Wi-Fi in Imager, on the **Choose Wi-Fi** screen; after that, manage it with `nmcli` or `nmtui`. |
| Change `/etc/dhcpcd.conf` for a fixed address | An address reservation on the router, or `nmcli connection modify` (Practice 2). |
| Change `/boot/config.txt` | The file is now `/boot/firmware/config.txt` (no need to change it this week). |
| `ifconfig` and `iwconfig` | `ip a`, `hostname -I`, and `nmcli`. |
| `sudo service mosquitto restart` | `sudo systemctl restart mosquitto` (`service` still works, but `systemctl` is the way that's used everywhere). |
| "`sudo` never asks for a password on a Raspberry Pi" | Since April 2026, `sudo` asks for your password (Concept 5). |
| Read `/var/log/syslog` | That file doesn't exist on Raspberry Pi OS Lite. Use `journalctl` and `/var/log/mosquitto/mosquitto.log` (Practice 5). |
| `sudo rpi-update` to "update" the Pi | **Don't.** It installs experimental firmware. A normal update is just `sudo apt update`, then `sudo apt full-upgrade`. |
| The gear icon or **Ctrl + Shift + X** in Imager for the settings | Imager 2.x asks for them directly, as the **Customisation** steps. |

<details>
<summary><b>Windows offers to format the card (<code>You need to format the disk…</code>)</b></summary>

This offer appears when a card that has already been written is plugged into the laptop again, or right after Imager finishes. Click **Cancel**. **Never** click **Format disk**. A Raspberry Pi card has two parts: a small `bootfs` part that Windows can read, and a large part in a Linux format (ext4) that Windows can't read. Windows thinks that second part is damaged, when in fact it holds the Pi's operating system.

</details>

<details>
<summary><b>Imager doesn't show the card, or writing fails</b></summary>

- **`No storage devices found`:** unplug the card reader and plug it back in, try another USB port, or another card reader. A microSD-to-SD adapter has a small lock switch on its side; slide it away from the word "LOCK". On Windows, Imager has to be opened with administrator rights (answer **Yes** when asked).
- **The card shows up, but its size is far below its label** (for example 2 GB for a 32 GB card): the card is probably faulty; return it to the seller. A fake card, on the other hand, usually shows a size that matches its label, then quietly throws away any data beyond its real capacity, which is often only discovered weeks later. That's why you should buy cards from official stores.
- **`Write failed: …`, or the check (*verify*) fails:** try once more. If it fails again at the same place, replace the card; a card that doesn't pass the check isn't fit for a 24-hour gateway.
- **Clicked SKIP CUSTOMISATION by mistake**, or forgot to fill in the user and SSH: write the card again from the start. That's quicker than looking for a way to fix it.

</details>

<details>
<summary><b><code>ping gateway.local</code> doesn't find the Pi</b></summary>

On Windows, the message is `Ping request could not find host gateway.local. Please check the name and try again.`, and on macOS, `ping: cannot resolve gateway.local: Unknown host`. Check, in order:

1. **Have you waited long enough?** The first start takes 2–5 minutes. Wait, then try again.
2. **The Pi's lights.** Pi 4: a red light that's on means power is getting in, and a blinking green light means the Pi is reading the card. Pi 5: the STAT status light next to the power button blinks green while the Pi reads the card, and is red if the Pi is asleep. After 5 minutes, the green light still hasn't blinked even once? The card isn't being read: make sure the card is pushed all the way in, or write it again.
3. **Are the LAN port lights lit** on the Pi and on the router? If not, replace the cable, or use another port on the router.
4. **Is the laptop on the same network?** A laptop connected to a guest Wi-Fi, a phone hotspot, or a VPN can't see the Pi. Turn off the VPN first.
5. **Windows:** use `ping -4 gateway.local`. Without `-4`, Windows sometimes answers with a long IPv6 address (starting with `fe80::`).
6. **Find its address through the router:** the device list on the router's admin page (Practice 9.2 of Module 10) shows the name `gateway` with its address. A network scanner app on your phone, such as Fing, can find it too. After that, use its address directly: `ping 192.168.1.37`, `ssh budi@192.168.1.37`.
7. **Mistyped the hostname in Imager?** The router will show the name you typed, for example `gatway`. If the hostname wasn't filled in at all, its name is `raspberrypi`.

</details>

<details>
<summary><b>SSH refuses: <code>Connection refused</code>, <code>Connection timed out</code>, or <code>Permission denied</code></b></summary>

| Message (excerpt) | What it means | The fix |
| :--- | :--- | :--- |
| `Connection refused` | The Pi can be reached, but no SSH service answers. | On the first start, SSH is switched on last, after the Pi has finished updating its package catalog, while `ping` gets answered earlier: wait 2–3 minutes, then try again. Still refused after 10 minutes? SSH wasn't turned on in Imager (the **SSH authentication** screen): write the card again with **Enable SSH** turned on. |
| `Connection timed out` | Nothing answers at all. | The address is wrong, the Pi is off, or the laptop is on another network. Go back to `ping`. |
| `Permission denied, please try again.` | The username or the password is wrong. | Remember: when you type a password in SSH, **nothing appears on the screen**. Type it slowly, then press **Enter**. Also check the username: `budi@…`, in lowercase. |
| `Could not resolve hostname gateway.local` | The `.local` name wasn't found. | See "`ping gateway.local` doesn't find the Pi" above, or use the IP address. |
| `ssh : The term 'ssh' is not recognized…` (Windows) | Your Windows doesn't have the OpenSSH Client yet. | Open **Settings → System → Optional features** (Windows 10 and older versions of Windows 11: **Settings → Apps → Optional features**), add **OpenSSH Client**, then open a new Terminal. |

Forgot the Pi's password? The simplest way for beginners: write the card again with Imager, then rebuild your gateway from the recipe in `edge/README.md` (section ➕ E).

</details>

<details>
<summary><b><code>WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!</code></b></summary>

SSH refuses to connect because the Pi's fingerprint is different from the one recorded on the laptop (Concept 4). The message ends with `Host key verification failed.` At home, the cause is almost always a card that was just written again: the Pi creates a new key on its first start. Delete the old record **on the laptop**, for both its name and its address:

```bash
ssh-keygen -R gateway.local
```

```bash
ssh-keygen -R 192.168.1.37
```

Then connect again and answer `yes`. If you did **not** just write the card again and this message appears, stop and check first: maybe another device is using the Pi's address (see "Address conflict" below).

</details>

<details>
<summary><b><code>apt</code> waits or fails: <code>Could not get lock /var/lib/dpkg/lock-frontend</code></b></summary>

Another program is installing or updating packages, for example `apt` in another SSH window, or an automatic installation right after the Pi starts for the first time. `apt` usually waits on its own for a while, writing `Waiting for cache lock …`; if it gives up, wait a few minutes, then repeat your command. **Don't delete the *lock* files**, even if a tutorial on the internet tells you to: that can damage the package list that's being written.

</details>

<details>
<summary><b>The Pi can't be reached after changing its address (Option B)</b></summary>

The cause is usually a typo in `nmcli connection modify`: an address in another block, a forgotten `/24`, or a wrong router address.

1. **Log in through the Wi-Fi backup path:** `ssh budi@gateway.local`, because that name is still announced over Wi-Fi. Check with `nmcli device status` and `ip -4 addr show eth0`.
2. **Switch the cable back to an address lent by the router (DHCP)** with these two commands **on the Pi**:

   ```bash
   sudo nmcli connection modify "netplan-eth0" ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
   ```

   ```bash
   sudo nmcli connection up "netplan-eth0"
   ```

   Then repeat Practice 2.3 carefully.
3. **No Wi-Fi?** Connect a monitor and a keyboard to the Pi to fix it (its login screen even says `My IP address is …`), or write the card again and rebuild from the recipe.

</details>

<details>
<summary><b>Address conflict: the Pi is reachable only some of the time</b></summary>

The signs: SSH and MQTTX connect, then drop without any pattern, `ping` sometimes works and sometimes doesn't, or SSH suddenly warns `REMOTE HOST IDENTIFICATION HAS CHANGED!` even though the card wasn't written again. Most likely another device got the same address from the router (Option B, Concept 6). The fix: switch to **Option A** if you can open the router, or choose another address outside the router's lending range (check it first with `ping` while the Pi is off: there must be no answer), then update Node 1's `BROKER_ADDRESS`.

</details>

<details>
<summary><b>Mosquitto <code>failed</code> after the settings file was changed</b></summary>

Mosquitto refuses to start if its settings file contains a line it doesn't recognize. Error messages about the settings are written to the **guard's logbook**, not to `mosquitto.log`, because they appear before Mosquitto's own log is ready. See the reason **on the Pi**:

```bash
journalctl -u mosquitto -n 20
```

For example, if `listener` is mistyped as `listner`:

```text
Oct 18 09:40:12 gateway mosquitto[1530]: 1792291212: Error: Unknown configuration variable "listner".
Oct 18 09:40:12 gateway mosquitto[1530]: 1792291212: Error found at /etc/mosquitto/conf.d/gateway-pi.conf:4.
Oct 18 09:40:12 gateway mosquitto[1530]: 1792291212: Error found at /etc/mosquitto/mosquitto.conf:13.
```

The number after the file name is the line number. The second `Error found at` line only points at the `include_dir` line in the main file, which loads your file; the one to fix is still the file in `conf.d`. The most common causes:

- A typo, for example `listner 1883` or `allow_anonymus true`.
- A `#` comment written after a setting, not at the start of a line (Module 11).
- Two files in `conf.d` that both contain `listener 1883`.

Fix it with `sudo nano /etc/mosquitto/conf.d/gateway-pi.conf`, then run `sudo systemctl restart mosquitto`. The guard tries to wake the failed broker a few times in quick succession, then gives up. If `restart` refuses with a message that the service was started too often, wait about 10 seconds, or first run `sudo systemctl reset-failed mosquitto`.

</details>

<details>
<summary><b>MQTTX or Node 1 can't connect to the broker on the Pi</b></summary>

1. **Is the service running?** `systemctl status mosquitto` must show `active (running)`.
2. **Is the door open to the network?** If `sudo tail /var/log/mosquitto/mosquitto.log` still writes `Starting in local only mode` at the last start, the file in `conf.d` isn't being read: make sure its name ends with `.conf` and that it's in `/etc/mosquitto/conf.d/`, then run `sudo systemctl restart mosquitto` (not `reload`).
3. **Is the address right?** The Host in MQTTX and `BROKER_ADDRESS` in Node 1 must be the Pi's fixed address (Practice 2), not the laptop's address.
4. **Test from the Pi itself:** `mosquitto_sub -h localhost -v -t "practice/#"`. If this works but the laptop can't get in, the problem is in the network: a guest Wi-Fi or device isolation (*AP isolation* or *client isolation*) on the router can keep devices apart; how to deal with it is in 🚨 in Module 10, "The ESP32 and the laptop are on different networks".
5. **Node 1 says `code -2` or `-4`**: they mean the same as in Module 11 (🚨 "Can't connect to the broker"); check steps 1–4. The default Raspberry Pi OS doesn't install any firewall rule for door 1883. So, unlike the Windows laptop in Module 11, a quick failure (`code -2` within milliseconds) here usually means the broker on the Pi really isn't accepting connections from the network: go back to step 2.

</details>

<details>
<summary><b>The Pi restarts by itself, or <code>vcgencmd get_throttled</code> isn't <code>0x0</code></b></summary>

It's almost always about power. A voltage that drops below about 4.63 V makes the Pi log undervoltage, slow itself down, and sometimes restart. See the events in the kernel log: `journalctl -k | grep -i voltage` (an example line: `hwmon hwmon1: Undervoltage detected!`). The fixes, in order:

1. Use the **official adapter** (Pi 5: 27 W; Pi 4: 15 W), not a phone charger.
2. Use the USB-C cable that came with that adapter, not a long, thin cable.
3. Unplug USB devices you don't need, for example an external hard disk that draws its power from the Pi.
4. The flags `0x8` or `0x80000` mean temperature: make sure the cooler is fitted and its fan is spinning.

The Pi Zero 2 W doesn't have an undervoltage detector, so this check doesn't apply to it.

</details>

<details>
<summary><b>Laptop path: the Mosquitto service won't start</b></summary>

- **Windows, `.\mosquitto install` writes `Error: The specified service already exists.`:** the Mosquitto service was installed some time ago, for example because the **Service** box wasn't unchecked in Module 11, and its *startup type* may still be **Manual** from 🚨 "Two brokers running at the same time" in Module 11. In Terminal (Admin), make it automatic with `sc.exe config mosquitto start= auto` (the space after `start=` really is required), then run `net start mosquitto`.
- **Windows, `.\mosquitto install` or `net start mosquitto` writes `Access is denied`:** the terminal isn't Terminal (Admin). Close it, then open it again by right-clicking **Start** → **Terminal (Admin)** (Windows 10: **Windows PowerShell (Admin)**).
- **Windows, `The Mosquitto Broker service could not be started.`:** usually there's a typo in `mosquitto.conf`, or another broker (for example in the VS Code terminal) is still using door 1883. Stop the other broker, then run `.\mosquitto -v -c mosquitto.conf` in Terminal (Admin): typos in the settings file show up on the screen right away (ignore the `Error: Unable to open log file …` line if it appears; that file belongs to the service account). Other messages may go only into the log file because of the `log_dest file` line, so the screen may stay silent. If the prompt comes right back, either with a message like `Error: Only one usage of each socket address …` (on a Windows set to another language, the sentence follows your Windows language) or without any message, door 1883 is probably being used by another program: check with `Get-NetTCPConnection -LocalPort 1883 -State Listen` as in Practice 1.5 of Module 11. If the prompt doesn't come back, the settings are right and the broker is running in that window: stop it with **Ctrl + C**, then run `net start mosquitto` again.
- **macOS, `brew services list` writes `error`:** run `mosquitto -v -c /opt/homebrew/etc/mosquitto/mosquitto.conf` in Terminal to see its error message, fix the file, then run `brew services restart mosquitto`.
- **Node 1 can't get in even though MQTTX on the laptop can:** check the firewall permission for `mosquitto.exe` (Practice 1.4 of Module 11), and make sure `BROKER_ADDRESS` holds the laptop's IP address.

</details>

---

## 🔬 Technical Deep Dive (optional)

This section is for the curious. You can skip all of it without affecting the next modules.

<details>
<summary><b>Raspberry Pi GPIO pins vs the ESP32: why the sensors stay on the ESP32</b></summary>

The Raspberry Pi has forty pins along its top edge (photo in the Quick Win), and most of them are GPIO, just like the ESP32's pins. Its logic is also 3.3 V: never put 5 V on a Pi GPIO pin. On the Pi 5, these pins are controlled by a helper chip called **RP1**. Type `pinout` on the Pi to see its pin map in the terminal, and `sudo pinctrl` to see the state of every pin.

So why does our project still connect the sensors and relays to the ESP32?

- **The Pi has no ADC.** There are no analog pins for the soil sensor or the LDR (Module 6); the Pi needs an extra ADC chip, for example an ADS1115 or an MCP3008.
- **Linux can't guarantee exact timing.** Linux shares the processor's time among many programs, so signals that must be exact to the microsecond, such as the DHT22 or the HC-SR04 distance sensor, are read more reliably by the ESP32.
- **The gateway shouldn't have to look after wires too.** A Pi that's being updated or restarted must not make the pump stop halfway. With this division of work, the ESP32 keeps running its own safety rules (Modules 6 and 8) even while the gateway is busy.
- **Small currents.** Each Pi GPIO pin is only designed for a few milliamperes; relays and pumps still need a go-between, as in Module 5.

</details>

<details>
<summary><b>Pi 5, Pi 4, or Pi Zero 2 W?</b></summary>

| | Raspberry Pi 5 | Raspberry Pi 4 Model B | Raspberry Pi Zero 2 W |
| :--- | :--- | :--- | :--- |
| RAM | 1, 2, 4, 8, or 16 GB | 1, 2, 3, 4, or 8 GB | 512 MB |
| LAN port | yes (gigabit) | yes (gigabit) | **none** |
| Wi-Fi | 2.4 and 5 GHz | 2.4 and 5 GHz | **2.4 GHz only** |
| Official adapter | USB-C 27 W (5.1 V 5 A) | USB-C 15 W (5.1 V 3 A) | micro-USB 12.5 W (5.1 V 2.5 A) |
| Power button, RTC clock | yes (the RTC needs a separate small battery) | no | no |
| Undervoltage detector | yes | yes | **none** |
| Cooling | active (a fan) recommended | a heatsink is enough | not needed |
| Official price, October 2026 | 2 GB US$77.50 | 2 GB US$67.50 | US$15 |
| Good for | a gateway until the end of the curriculum, including the database of the free path | a gateway until the end of the curriculum | broker + Node-RED; too weak for a database |

The **Pi Zero 2 W** can follow this module with three adjustments: every connection goes over Wi-Fi (make sure your home Wi-Fi has a 2.4 GHz network), the fixed address is set on the Wi-Fi connection (`netplan-wlan0-…`, or reserved on the router), and the `vcgencmd get_throttled` command can't report low voltage.

</details>

<details>
<summary><b>Logging in without a password, using an SSH key</b></summary>

An SSH key is a pair of files: the **private key**, which must never leave your laptop, and the **public key**, which can be left with the Pi. SSH proves that you hold the private key without ever sending it, so you don't need to type a password when you log in, and the key is far harder to guess than a password. However, logging in with a password is still possible, and `sudo` still asks for the Pi's password. So that password still has to be strong.

1. **On the laptop**, create a key pair (press **Enter** to accept the default file name, then fill in or leave empty the *passphrase*, the password that protects the key):

   ```bash
   ssh-keygen -t ed25519
   ```

   The result is two files in your `.ssh` folder: `id_ed25519` (private) and `id_ed25519.pub` (public).
2. Leave the public key with the Pi. **macOS and Linux:**

   ```bash
   ssh-copy-id budi@gateway.local
   ```

   **Windows** doesn't have `ssh-copy-id`; in PowerShell, use this one line (note the double quotes in the second part):

   ```powershell
   type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh budi@gateway.local "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
   ```

3. Try `ssh budi@gateway.local` again: you get in without being asked for the Pi's password (except for your key's *passphrase*, if you filled one in).

Another way: when you write the card, choose **Use public key authentication** in Imager's SSH step, then paste the contents of `id_ed25519.pub`. **Never** copy `id_ed25519` (without `.pub`) anywhere.

</details>

<details>
<summary><b>A look inside the <code>mosquitto.service</code> unit file, and adding your own rules</b></summary>

`systemctl cat mosquitto` shows Debian's default unit file, `/usr/lib/systemd/system/mosquitto.service`:

```ini
[Unit]
Description=Mosquitto MQTT Broker
Documentation=man:mosquitto.conf(5) man:mosquitto(8)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
NotifyAccess=main
ExecStart=/usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
ExecStartPre=/bin/mkdir -m 740 -p /var/log/mosquitto
ExecStartPre=/bin/chown mosquitto:mosquitto /var/log/mosquitto
ExecStartPre=/bin/mkdir -m 740 -p /run/mosquitto
ExecStartPre=/bin/chown mosquitto:mosquitto /run/mosquitto

[Install]
WantedBy=multi-user.target
```

- `After=` and `Wants=network-online.target`: start after the network is ready.
- `Type=notify`: Mosquitto itself reports "I'm ready" to systemd, right after all its doors are open. That's why `Started …` in the log really means the broker is ready to receive guests.
- `ExecStart=`: the command that is run, the same as `mosquitto -c …` on the laptop, only without `-v`.
- `Restart=on-failure`: the restart rule you tested in Practice 4.
- `WantedBy=multi-user.target`: this is what makes `enable` mean "start together with the Pi".

**Don't change the files in `/usr/lib/systemd/system/`**: package updates will overwrite them. To add or replace rules, use an **extra file** (a *drop-in*). **On the Pi**, run:

```bash
sudo systemctl edit mosquitto
```

The nano editor opens with a few opening lines such as `### Editing /etc/systemd/system/mosquitto.service.d/override.conf`. Write your rules **between** the two comment lines `### Anything between here …` and `### Edits below this comment will be discarded`, save, and exit. `systemctl edit` reloads the list of units by itself; you only need to run `sudo systemctl restart mosquitto`. 🧩 Level 2 uses this method.

</details>

<details>
<summary><b><i>Watchdog</i>, automatic restarts, and logs that survive a restart</b></summary>

***Watchdog*.** Raspberry Pi OS Trixie turns on the hardware watchdog from the start, through the file `/usr/lib/systemd/system.conf.d/40-rpi-enable-watchdog.conf`, which contains `RuntimeWatchdogSec=1m` and `RebootWatchdogSec=2m`. This means systemd must "pat" the watchdog chip at least once a minute. If the whole system freezes so that the patting stops, the watchdog chip restarts the Pi. If the Pi is being restarted (`sudo reboot`) and its last stage freezes for more than two minutes, the Pi is also forced to restart. Check it **on the Pi** with:

```bash
systemctl show -p RuntimeWatchdogUSec
```

**Expected output:** `RuntimeWatchdogUSec=1min`. This guard watches over **the whole Pi**, not Mosquitto; Mosquitto is watched over by `Restart=on-failure`.

**Scheduled restarts** are almost never needed. If you still want one, for example every Sunday at 4:00 a.m., run `sudo crontab -e` (choose `nano` when asked) and add the line `0 4 * * 0 /sbin/shutdown -r now`.

**Logs that survive a restart.** On Raspberry Pi OS, the guard's logbook is kept in RAM (the file `/usr/lib/systemd/journald.conf.d/40-rpi-volatile-storage.conf`), so the log from before a crash is lost too when the Pi restarts, even though that's exactly when the log is needed most. If you're hunting down a problem that makes the Pi restart by itself, keep the log on the card for a while: `sudo raspi-config` → **Advanced Options** → **Logging** → **Persistent**, then run `sudo reboot`. Switch it back to **Volatile** once you've found the problem, so the card doesn't wear out quickly.

</details>

<details>
<summary><b>The Pi as its own Wi-Fi access point</b></summary>

In places without a router, for example a garden or a storeroom, the Pi can broadcast its own Wi-Fi through NetworkManager. Run **on the Pi**:

```bash
sudo nmcli device wifi hotspot ifname wlan0 ssid GatewayIoT password "replace-with-a-strong-password"
```

The ESP32 then connects to the `GatewayIoT` Wi-Fi, and the broker on the Pi can be reached through the Pi's address on that network (usually `10.42.0.1`; check with `ip -4 addr show wlan0`). Two warnings: if you're logged in to the Pi over that same Wi-Fi, your SSH connection drops as soon as `wlan0` turns into a hotspot; and this network isn't connected to the internet unless the Pi also uses a LAN cable. To go back, turn off the hotspot connection with `sudo nmcli connection down Hotspot`, then turn the home Wi-Fi connection on again.

</details>

<details>
<summary><b>A full copy of the microSD card, and booting the Pi from an SSD</b></summary>

**A full copy.** Raspberry Pi Imager can only **write** cards; it can't **copy** what's on them. On Windows, the free app **Win32 Disk Imager** 1.0.0 can read a whole card into a `.img` file: shut down the Pi with `sudo poweroff`, plug its card into the laptop (click **Cancel** if Windows offers to format it), choose its drive letter, fill in a file name, then click **Read**. The resulting file is as big as the card (32 GB) and holds everything on the card, including your home Wi-Fi password, so keep it as a private file: don't upload it to GitHub or share it. To restore it, write that file to a new card with Imager (**Use custom**). On macOS and Linux, the `dd` command can do the same thing, but a single mistyped letter can make it overwrite the laptop's hard disk; for beginners, the recipe in `edge/README.md` is much safer.

**SSD.** The microSD card is the part of the gateway that wears out fastest. The Pi 4 and Pi 5 can boot from an SSD over USB, and the Pi 5 also from an NVMe SSD through the official M.2 HAT+ add-on board. An SSD holds up much better to constant writing, so it's a good choice if a database runs on the Pi later (the free path of Phase 5).

</details>

---

## 🧩 Independent Challenges

Three levels, from changing a little to building your own. The answer keys for Levels 1 and 2 are in collapsible sections; Level 3 deliberately only gets hints. Laptop path: all three are written for the Pi, and a Linux laptop (Practice 7.3) can do them the same way. On Windows and macOS, Level 1 is enough: add its line to `edge/mosquitto-lan.conf`, then run the broker in the VS Code terminal as in "Viewing the log" in Practice 7.1 (macOS: first stop the service with `brew services stop mosquitto`, then start it again afterward with `brew services start mosquitto`); the human-readable time shows up on the screen right away. Levels 2 and 3 need systemd, so save them until Kit B arrives.

### Level 1 — Time that humans can read (a small change)

Numbers like `1792289551:` at the start of every line of `mosquitto.log` are hard to read. Mosquitto has a setting, **`log_timestamp_format`**, that turns them into an ordinary date and time. Add one line to `/etc/mosquitto/conf.d/gateway-pi.conf` so that every log line starts with, for example, `2026-10-18T09:45:02:`, then prove it with `sudo tail /var/log/mosquitto/mosquitto.log`. Don't forget to update its copy in the repository (Practice 6.2).

Hint: the format is the same as in the `date` command of Practice 5.2, but with the letter `T` between the date and the time.

<details>
<summary><b>Level 1 answer key</b></summary>

Add this line below `allow_anonymous true` (`sudo nano /etc/mosquitto/conf.d/gateway-pi.conf`):

```text
log_timestamp_format %Y-%m-%dT%H:%M:%S
```

Then run `sudo systemctl restart mosquitto` and `sudo tail /var/log/mosquitto/mosquitto.log`. **Expected output** (example, the last line):

```text
2026-10-18T09:45:02: mosquitto version 2.0.21 running
```

The time follows the Pi's time zone (`Asia/Jakarta` from Imager). Finally, copy the file to the repository again **on the laptop**, from the VS Code terminal in the `mini-smart-home` folder (Practice 6.2): `scp budi@192.168.1.37:/etc/mosquitto/conf.d/gateway-pi.conf edge/`.

</details>

### Level 2 — A stricter, more patient guard (fill in the blanks)

The default rule, `Restart=on-failure`, only wakes Mosquitto up if it died because it failed, and it wakes it up right away, 100 milliseconds later. Create an **extra file** (*drop-in*, 🔬) with `sudo systemctl edit mosquitto` so that the guard (a) wakes Mosquitto up **whatever** made it die, except when it's stopped with `systemctl stop`, and (b) waits **5 seconds** before waking it up. Fill in the blanks:

```ini
[Service]
Restart=________
RestartSec=___
```

Test it the Practice 4.2 way: the new `MainPID` should appear about 5 seconds after the broker is killed, not instantly.

<details>
<summary><b>Level 2 answer key</b></summary>

```ini
[Service]
Restart=always
RestartSec=5
```

Write those three lines between the comment lines `### Anything between here …` and `### Edits below this comment will be discarded`, save (**Ctrl + O**, **Enter**), and exit (**Ctrl + X**). Then run `sudo systemctl restart mosquitto`. Check the rules with `systemctl show -p Restart -p RestartUSec mosquitto`; the **expected output** is `Restart=always` and `RestartUSec=5s`. In `journalctl -u mosquitto`, the `Scheduled restart job` line now appears about 5 seconds after `Failed with result 'signal'`. To undo it later: `sudo systemctl revert mosquitto`.

</details>

### Level 3 — A recorder service of your own (from scratch)

Create a systemd service called `status-recorder.service` that runs `mosquitto_sub` on the Pi, subscribes to `msh/+/status`, and appends every message to the file `/home/budi/status-recording.txt`, complete with its time. This service must start by itself when the Pi starts, and get back up by itself if it dies. That way, you have a record of when every device was `online` and `offline`, even while your laptop is off: extra evidence for the "unplug the laptop" test in the ➕ section.

Hints:

- You create the file yourself with `sudo nano /etc/systemd/system/status-recorder.service`, with three sections, `[Unit]`, `[Service]`, and `[Install]`, like Mosquitto's unit file in 🔬.
- `After=mosquitto.service` makes it start after the broker. `User=budi` makes it run as an ordinary user, not as the head of the office.
- `mosquitto_sub -F "%I %t %p"` prints the time, the topic, and the message content on one line. In a unit file, the `%` sign has a special meaning, so write **`%%`** for every `%`.
- `StandardOutput=append:/home/budi/status-recording.txt` makes systemd append all of the program's output to that file.
- A unit file you made yourself needs `sudo systemctl daemon-reload` before `sudo systemctl enable --now status-recorder`.

Why only the `status` topic, not `msh/#`? Remember Concept 8: every line written to the card wears it down, and `telemetry` arrives every 10 seconds.

---

## ➕ Add-on to "Mini Smart Home"

This week, Mini Smart Home gets a **permanent gateway**: a Raspberry Pi called `gateway` with a fixed address, a Mosquitto broker that starts by itself, and a recipe for rebuilding it. Node 1 moves to that broker, and the broker on the laptop retires.

![Diagram of Mini Smart Home after Module 12: the broker moves from the laptop to the gateway, the laptop only monitors, and a dashed line means it comes later. Center, the Raspberry Pi gateway at 192.168.1.37 port 1883, with Mosquitto as a systemd service: it starts by itself when the Pi starts, gets back up by itself after a crash, and keeps retained messages on the card. Left, Node 1 v1.2.1 (a4cf12e5b7c0) with BROKER_ADDRESS = 192.168.1.37: two arrows to the gateway, one labeled telemetry and one labeled status, vitals, ack, plus a cmd arrow from the gateway. Right, three clients on the laptop: MQTTX (a monitor that may be off, and also the sender of cmd to the gateway), contract-checker.js with the address 192.168.1.37, and SSH to the Pi for maintenance and logs. Bottom, coming later: Node-RED on the Pi (Module 13, automation and dashboard v0) and Node 2 Garden (Module 14, via Node 1). Note: the broker on the laptop (Module 11) retires; the laptop is still used for MQTTX, the contract checker, and SSH, but Mini Smart Home no longer depends on it.](assets/project-gateway-diagram.png)

> 🖥️ **Tools used:** the Pi you set up in Practices 1–6, **Arduino IDE**, the Node 1 workbench complete with the MB102 and its charger, **VS Code** with the `mini-smart-home` folder, **MQTTX**, and **GitHub Desktop**.
>
> Wokwi path (no real board): the simulated Node 1 still uses the public broker (`USE_WOKWI` set to `true`), so it never connects to the broker on the Pi. Do step A in Arduino IDE (for your repository) and in the tabs of your Node 1 Wokwi project (its main tab is called `sketch.ino`), run Node 1 in Wokwi, and in step C use the Module 11 Wokwi way (the MQTTX **Public broker** connection with the subscription `msh/` + your `device_id` + `/#`, and `node contract-checker.js broker.emqx.io <device_id>`). Steps B.3 and D need the real board, so the "unplug the laptop" test can only be proven once you have your board.
>
> Laptop path: the broker service from Practice 7 replaces the Pi, your laptop's address replaces `192.168.1.37`, and the MQTTX connection **Via laptop IP** replaces **Pi gateway**. Skip steps B.3, D, and E, because all three need the Pi; test D is impossible anyway, because turning off the laptop also turns off your broker. In step F, save only the three Node 1 files. For F.2, first create `notes-module12.md` in the **Documents → GitHub → learn-iot → module-12** folder (like `notes-module11.md` in Module 11), then write down your laptop's IP address and the result of the Practice 7 test after the laptop was restarted.
>
> ⭐ **Required** — the Module 12 completion requirement.

| File in `mini-smart-home` | Change |
| :--- | :--- |
| `firmware/node-1-home/config.h` | `FIRMWARE_VERSION` becomes `"1.2.1"`, `BROKER_ADDRESS` becomes the Pi's fixed address |
| `firmware/node-1-home/node-1-home.ino` | the version comment line at the very top |
| `firmware/node-1-home/networking.cpp` | the error message `Is the broker on the laptop running?` becomes `Is the broker on the gateway running?` |
| `edge/gateway-pi.conf` | **new**: a copy of the gateway broker's settings (Practice 6.2) |
| `edge/README.md` | **new**: the recipe for rebuilding the gateway (step E) |

### A. Change four lines of Node 1

1. In Arduino IDE, open your Node 1: **File → Open…** → **Documents → GitHub → mini-smart-home → firmware → node-1-home** → `node-1-home.ino`.
2. In the `config.h` tab, change two lines that are far apart: `FIRMWARE_VERSION` at the very top, and `BROKER_ADDRESS` in the `Module 11: MQTT` section near the very bottom (search for it with **Ctrl + F**). After the change, the two lines read:

   ```cpp
   const char FIRMWARE_VERSION[] = "1.2.1";
   const char BROKER_ADDRESS[] = "192.168.1.37";  // REPLACE with your Pi gateway's fixed address (Module 12, Practice 2)
   ```

   Replace `192.168.1.37` with your Pi's fixed address from Practice 2. The complete reference version of Node 1 v1.2.1 is in this module's [`code/node-1-home/`](code/node-1-home/) folder.
3. In the `node-1-home.ino` tab, change the first line to:

   ```cpp
   // Node 1 "Home" - firmware v1.2.1 (Module 12: the broker moves to the Raspberry Pi gateway)
   ```

4. In the `networking.cpp` tab (called `network.cpp` before 19 October 2026; see the note in [Module 10](../module-10-wifi-and-http/README.md#b-create-two-new-files-and-change-configh)), press **Ctrl + F**, search for `Is the broker on the laptop running?`, then replace the word `laptop` with `gateway`.

That's all: Node 1 doesn't need to know that its broker is now a Raspberry Pi. It still connects to an address at door 1883, exactly as in Module 11. This is the advantage of the data contract and MQTT: the post office may move, but the letters stay the same.

### B. Verify, Upload, and greet the gateway

1. If Node 1 is still running from its charger, move it to the laptop in the order of the golden rules, as in ➕ A of Module 11: **turn off the MB102**, unplug the USB from the charger, plug it into the laptop, then turn on the MB102. Make sure the board is **ESP32 Dev Module**, with **Partition Scheme** **Minimal SPIFFS** and **Flash Mode** **DIO**, as it has been since Module 10. Click **Verify**, then **Upload**.
2. Open the **Serial Monitor** (**115200 baud**), and press **EN** if you missed the first line. **Expected output** (example; the line layout follows the Node 1 v1.2 recording in Module 11):

   ```text
   [00:00:00] INFO  Node 1 Home - firmware 1.2.1
   [00:00:00] INFO  Last restart reason: POWERON
   [00:00:00] INFO  Boot #17. soil_watering threshold: 35 % (from NVS)
   [00:00:01] INFO  microSD card ready: readings are logged to node1.csv every 30 seconds.
   [00:00:01] INFO  device_id a4cf12e5b7c0
   [00:00:01] INFO  Connecting to the saved WiFi "OurHome" (without waiting)...
   [00:00:01] INFO  Watchdog active: automatic restart if loop() is stuck for more than 5 seconds.
   [00:00:03] INFO  WiFi connected to "OurHome": IP 192.168.1.23, signal -58 dBm
   [00:00:03] INFO  MQTT connected to broker 192.168.1.37:1883 in 41 ms, as a4cf12e5b7c0
   [00:00:08] INFO  Clock set from the internet: 2026-10-18T02:50:36Z
   [00:00:09] INFO  Published telemetry (10-second schedule)
   [00:00:19] INFO  Published telemetry (10-second schedule)
   ```

3. **On the Pi**, follow the broker's log: `sudo tail -f /var/log/mosquitto/mosquitto.log`. Node 1 already connected in step 2, so its two connection lines usually already show up among the last lines (press **EN** on Node 1 to watch them appear again live), for example `New connection from 192.168.1.23:52731 on port 1883.` and `New client connected from 192.168.1.23:52731 as a4cf12e5b7c0 (p2, c1, k15).`: Node 1 comes in with its `device_id` as its client name, MQTT 3.1.1 (`p2`), and a 15-second *keep-alive* (`k15`). Stop it with **Ctrl + C**.

### C. Retire the laptop broker

1. **On the laptop**, make sure no terminal is still running `mosquitto -v -c mosquitto-lan.conf`. If one still is, press **Ctrl + C** in that terminal. The file `edge/mosquitto-lan.conf` is kept as a Module 11 archive. Laptop path: stop only the broker in the terminal; the service from Practice 7 stays on, because that's your broker.
2. In MQTTX, on the **Pi gateway** connection (Practice 3.3), add the subscription `msh/#` (**New Subscription**, as in Module 11). Node 1's `telemetry` messages appear every 10 seconds, and the `status` marked retained holds `online`. MQTTX remembers this subscription and sets it up again every time it connects.
3. **On the laptop**, open a new terminal in VS Code (**Terminal → New Terminal**); a new terminal always starts in the `mini-smart-home` folder. Go into the `tools` folder with `cd tools`, then run the contract checker from Module 11 with the Pi's address:

   ```bash
   node contract-checker.js 192.168.1.37
   ```

   Every message from Node 1 must `PASS`. The checker doesn't print the messages' contents, so look at the version in MQTTX: every `telemetry` now holds `"fw":"1.2.1"`. Leave the checker running for step 4.
4. Send one command from MQTTX as in ➕ E of Module 11 (topic `msh/<device_id>/cmd`, QoS 1, **Retain** unticked), for example to turn on the lamp with `{"id":"c-201","action":"set","target":"lamp","value":true}` (**JSON** format; every command uses a new `id`). The relay goes "click", and the checker's terminal writes an `ack` line with `answered … ms after the command: under 1 second`, as in ➕ E of Module 11.

### D. ⭐ The "unplug the laptop" test

This is the main evidence this week: Mini Smart Home stays alive without the laptop. That's why **Node 1 must not get its power from the laptop**: if its USB is still plugged into the laptop from step B, turning off the laptop turns off Node 1 too. Before you start, move Node 1 to its charger as in ➕ G of Module 11: **turn off the MB102** → unplug the USB from the laptop → plug the cable labeled **ESP32** into the charger → **only then** turn on the MB102 (regulated microSD module: press **EN** afterward). Wait until MQTTX shows `status` `online` again. Also read steps 1–4 all the way through before you turn off the laptop, or open this module on your phone. Laptop path: skip this section (see the 🖥️ box at the start of ➕).

1. Note the time now. **Shut the laptop down completely** (Windows: **Start → Power → Shut down**; macOS: **Apple menu → Shut Down**). Leave it off for at least 10 minutes. Meanwhile, touch or blow on the DHT22 sensor, or wave your hand in front of the PIR, so that Node 1 has events to report.
2. Turn the laptop on, open MQTTX, and connect **Pi gateway**. The retained `status` message holds `online` right away, and `telemetry` flows again.
3. Open a terminal and log in to the Pi with SSH. **On the Pi**, check Node 1's connection history while the laptop was off:

   ```bash
   sudo grep a4cf12e5b7c0 /var/log/mosquitto/mosquitto.log | tail -5
   ```

   Replace `a4cf12e5b7c0` with your Node 1's `device_id`. **Expected output** (example; if you've done 🧩 Level 1, every line starts with a time you can read right away, for example `2026-10-18T10:00:31:`, not a number of seconds):

   ```text
   1792291831: New client connected from 192.168.1.23:52731 as a4cf12e5b7c0 (p2, c1, k15).
   1792292428: Client a4cf12e5b7c0 has exceeded timeout, disconnecting.
   1792292431: New client connected from 192.168.1.23:61204 as a4cf12e5b7c0 (p2, c1, k15).
   ```

   What you want to see: the last `New client connected … as a4cf12e5b7c0` line happened **before** the laptop was turned off (compare it with the time you noted in step 1; translate the number of seconds at the start of your line as in Practice 5.2, for example `date -d @1792292431 "+%Y-%m-%d %H:%M:%S"` for the last example line), and **no** `Client a4cf12e5b7c0 …` line comes after it, such as `closed its connection.` or `has exceeded timeout, disconnecting.` That means Node 1 stayed connected to the gateway the whole time the laptop was off. `Client a4cf12e5b7c0 …` lines **before** that last connection are normal, for example `has exceeded timeout, disconnecting.` when Node 1 was moved to its charger at the start of this section, or `already connected, closing old connection.` every time the **EN** button was pressed.
4. Still **on the Pi**, compare that with your own laptop's MQTTX connection:

   ```bash
   sudo grep -i mqttx /var/log/mosquitto/mosquitto.log | tail -3
   ```

   **Expected output** (example):

   ```text
   1792292405: New client connected from 192.168.1.10:53388 as mqttx_3f9a1c2b (p5, c1, k60).
   1792293012: Client mqttx_3f9a1c2b disconnected.
   1792293788: New client connected from 192.168.1.10:49702 as mqttx_3f9a1c2b (p5, c1, k60).
   ```

   Here, you see MQTTX leave when the laptop was turned off (at 10:10 in this example; depending on how the laptop was turned off, the line can also be `closed its connection.` or `has exceeded timeout, disconnecting.`) and come back 13 minutes later. The laptop comes and goes; the gateway stays.

Have a phone or a second laptop? Here's more direct evidence: while the main laptop is off, connect an MQTT app on the second device to `192.168.1.37` port `1883`, then subscribe to `msh/#`. On a second laptop, use MQTTX as in Practice 3.3. On a phone connected to the home Wi-Fi (not mobile data), install a free MQTT client app from the app store (search for "MQTT client") that connects through `mqtt://` or TCP; web versions in a browser can't be used, because they need a WebSocket door (🔬 of Module 11). Node 1's data keeps flowing.

### E. The gateway recipe in the repository

The gateway's main backup is a **recipe**: notes that are enough to rebuild the gateway from a blank card. Write it in `edge/README.md`.

1. In VS Code with the `mini-smart-home` folder, right-click the `edge` folder, choose **New File…**, then name it `README.md`.
2. Open [`mini-smart-home/edge/README.md`](../../mini-smart-home/edge/README.md) on GitHub, click **Copy raw file**, go back to VS Code, then paste it into the `README.md` you just created (**Ctrl + V**). Adapt its contents to your gateway: the Pi model, the Raspberry Pi OS version (the `Released:` date you chose in Imager, plus the `PRETTY_NAME` line from `cat /etc/os-release` **on the Pi**), the fixed address and how you set it (A or B), and the date. The example address and username also appear in the recipe's commands: press **Ctrl + H** in VS Code (macOS: **Cmd + Option + F**), type the old text in the top box and its replacement in the bottom box, then click **Replace All** (the rightmost icon next to the bottom box). If your router's address isn't `192.168.1.1`, first replace `192.168.1.1` with your router's address, and only then `192.168.1.37` with your Pi's fixed address; this order keeps a Pi address like `192.168.1.105` from changing too. Do the same for `budi` if your username is different. Save with **Ctrl + S**. **Never write a password** in this file.
3. Make sure `edge/gateway-pi.conf` from Practice 6.2 is next to it.

### F. ⭐ Save to GitHub

1. In GitHub Desktop, choose the **`mini-smart-home`** repository. The **Changes** list holds the three Node 1 files and two new files in `edge/`. Fill in **Summary** with `Module 12: Pi gateway, Node 1 v1.2.1`, click **Commit … to main**, then **Push origin**.
2. In the **`learn-iot`** repository, complete this module's notes (`module-12/notes-module12.md` from Practice 2.4): the results of `df -h /`, `free -h`, and `vcgencmd get_throttled`; the Pi's fixed address; and the result of the "unplug the laptop" test. Commit and push that too.

**Evidence for passing Module 12** (compare it with ✅ below): Node 1 stays connected to the broker on the Pi while the laptop is off (D), you can log in to the Pi over SSH and read its logs (Practice 5 and D.3), and the gateway recipe is saved in the repository (E–F).

---

## 📖 Glossary

| Term | Short meaning |
| :--- | :--- |
| **Gateway** | The computer at home that serves as the post office for IoT data: every device connects to it. In our project, the Raspberry Pi called `gateway`. Don't confuse it with the gateway router of Module 10. |
| ***Edge computing*** | Doing the work as close as possible to the devices, inside the home, not in a faraway data center. |
| **Raspberry Pi** | A single-board computer the size of a business card that runs Linux. |
| **Linux** | A free and open operating system; Raspberry Pi OS is one of its "flavors" (distributions). |
| **Raspberry Pi OS Lite** | Raspberry Pi OS without a desktop, only a terminal. This module's version is based on Debian 13 "Trixie". |
| ***Headless*** | A computer that works without a monitor, keyboard, or mouse; it's controlled over the network. |
| **SSH** (*Secure Shell*) | A way to open another computer's terminal over the network, with an encrypted conversation. |
| **Key fingerprint** | The Pi's unique mark that the laptop records at the first SSH greeting (`known_hosts`), to make sure it's always the same Pi that answers. |
| ***Prompt*** (the ready sign) | The text in front of the terminal's cursor, for example `budi@gateway:~ $`: who, on which computer, in which folder. |
| **`sudo`** | "Do it as the head of the office (root)", for one command. |
| **`apt`** | The package manager: it updates the catalog (`update`), updates the programs (`full-upgrade`), and installs programs (`install`). |
| **nano** | A text editor in the terminal. Save with **Ctrl + O**, exit with **Ctrl + X**. |
| **Fixed address** | An IP address that doesn't change: reserved on the router (*DHCP reservation*) or set on the Pi (*static IP*). |
| **`nmcli`** | The command for controlling NetworkManager, the network manager of Raspberry Pi OS. |
| **Service** | A program that runs in the background, looked after by systemd: it starts when the computer starts, and gets back up if it dies. |
| **systemd** | Linux's "security guard": the first program that starts, which looks after all the services. You talk to it with `systemctl`. |
| ***Journal*** | systemd's logbook, read with `journalctl`. |
| **`scp`** | A command for copying files over SSH, from the laptop to the Pi or the other way around. |
| ***High-endurance*** | A microSD card designed to survive constant writing, for example for CCTV. |

---

## 📝 5-Question Quiz

1. Name two reasons why Mini Smart Home uses a gateway at home instead of sending all its data straight to a server on the internet. Why isn't a laptop a good fit for the gateway?
2. You're about to shut down the Pi with `sudo poweroff`. Before you press **Enter**, how do you make sure that command will run on the Pi, not on the laptop? And why should the Pi be shut down with a command, not by unplugging its adapter?
3. Node 1 connects to the broker through an IP address, not through `gateway.local`. What happens if the Pi isn't given a fixed address? Also name two ways to give it a fixed address.
4. In Module 11, the broker stopped when its terminal was closed. On the Pi, what makes it (a) start by itself when the Pi starts, and (b) get back up after it's killed by force? Which commands show both?
5. After you write the microSD card again, `ssh budi@gateway.local` refuses to connect with `REMOTE HOST IDENTIFICATION HAS CHANGED!`. Why, is it dangerous, and how do you fix it?

<details>
<summary><b>Answer key</b></summary>

1. Two of the four reasons in Concept 1: an **internet outage** doesn't stop the home (the broker, and later the automation, stay inside the home), **speed** (commands only travel around inside the home, within milliseconds), **privacy** (raw data such as "motion in the living room" doesn't leave the home), and **cost** (one Pi only uses a few watts of power, with no bill per message). A laptop isn't a good fit because it isn't on 24 hours a day: it gets closed and goes to sleep, gets taken away, or restarts by itself while it installs updates, and a broker running in a terminal stops as soon as that terminal is closed.
2. From the **prompt**, before you type the command: `budi@gateway:~ $` means that terminal is connected to the Pi over SSH, while `PS C:\Users\…>` or `… ~ %` means the laptop (Concept 4). The Pi is shut down with a command because the microSD card may be in the middle of writing; power that disappears halfway through a write can damage files, sometimes so badly that the Pi won't start. `sudo poweroff` finishes all the writing first, and the lights give the safe sign (Pi 4: the green light blinks, then goes out; Pi 5: the status light next to the power button turns red).
3. The router lends addresses through DHCP, and an address can change, for example after the router restarts. Node 1 v1.2.1 stores the broker's address as numbers in `BROKER_ADDRESS` (without mDNS), so it would keep knocking on the wrong address every 5 seconds, and the Serial Monitor would say `MQTT failed to connect …`. The two ways: **reserve the address on the router** (*DHCP reservation*, the way the official documentation recommends), or a **fixed IP on the Pi** with `nmcli connection modify … ipv4.method manual …`, using an address outside the router's lending range.
4. Mosquitto is now a **service** looked after by systemd. (a) It's **enabled**: its unit file contains `WantedBy=multi-user.target`, and the Debian package already ran `enable` when it was installed, so systemd starts it every time the Pi starts; the proof is that `systemctl is-enabled mosquitto` answers `enabled`. (b) Its unit file contains `Restart=on-failure`, so a program that dies because it failed, including being killed by force, is woken up again; the proof is that the `Main PID` in `systemctl status mosquitto` (or `systemctl show -p MainPID mosquitto`) changes, and `journalctl -u mosquitto` logs `Scheduled restart job`.
5. On its first start after the card is written again, the Pi creates a **new SSH key**, so its fingerprint is different from the one the laptop recorded in `known_hosts` (Concept 4). If you really did just write the card again, it isn't dangerous: delete the old record on the laptop with `ssh-keygen -R gateway.local` (and `ssh-keygen -R` for its IP address), then connect again and answer `yes`. If the card was **not** written again, don't delete the record right away. This warning is designed precisely to catch an impostor computer, so first check whether another device is using the Pi's address.

</details>

---

## ✅ Module 12 Completion Checklist

The completion requirement from the Syllabus: **you unplug the laptop, and Node 1 stays connected to the broker on the Pi** (proven with the broker's log or with MQTTX on another device), and **you can log in to the Pi over SSH and read its logs**. Laptop path: Mosquitto runs as a 24-hour service without a terminal open; check the item labeled **(Laptop path)** and the ➕ A–C item with your laptop's address, while the other items are for the Pi only.

- [ ] The Pi starts without a monitor, and I can log in with `ssh budi@gateway.local` (Quick Win).
- [ ] I can use `pwd`, `ls`, `cd`, `nano`, `cat`, `sudo apt`, `df -h`, and `free -h` without looking at the commands-at-a-glance table (Practice 1).
- [ ] The Pi has a fixed address, and that address stays the same after `sudo reboot` (Practice 2).
- [ ] Mosquitto on the Pi is `enabled` and `active (running)`, and MQTTX on the laptop can connect to the Pi's fixed address (Practice 3).
- [ ] After `sudo reboot` and after `systemctl kill`, Mosquitto runs again without me starting it (Practice 4).
- [ ] I can read the logs with `journalctl -u mosquitto` and `sudo tail -f /var/log/mosquitto/mosquitto.log` (Practice 5).
- [ ] I know what the result of `vcgencmd get_throttled` means, and `edge/gateway-pi.conf` has been copied to the laptop with `scp` (Practice 6).
- [ ] **(Laptop path)** Mosquitto runs as a service on the laptop and is still running after the laptop restarts, without a terminal open (Practice 7).
- [ ] Node 1 v1.2.1 is connected to the gateway broker, the contract checker writes `PASS`, and commands from MQTTX are answered with an `ack` (➕ A–C).
- [ ] The "unplug the laptop" test: while the laptop was off, `mosquitto.log` on the Pi didn't log Node 1 disconnecting (➕ D).
- [ ] `edge/README.md` and `edge/gateway-pi.conf` are committed and pushed to `mini-smart-home`, without any password (➕ E–F).

> ➡️ **Next module:** Module 13 — Node-RED & Dashboard 2. Your gateway gets its first "brain": a dashboard on your phone and a fan automation that runs 24 hours a day on the Pi, built with *drag-and-drop*, without writing much code.

---

## 📚 Sources & Image Credits

**Documentation, source code, and pages used** (accessed October 2026):

- Raspberry Pi, the [official documentation](https://www.raspberrypi.com/documentation/computers/) and [its source](https://github.com/raspberrypi/documentation): *Getting started* (Imager, the first start), *Configuration* (fixed addresses: a reservation on the router is recommended, and a fixed IP must be outside the DHCP range; `sudo` and passwords; how the lights behave; the Logging option in `raspi-config`), *Remote access* (SSH, finding the IP address, `.local`), *Raspberry Pi hardware* (power supply, undervoltage, the Pi 5 power button, booting from USB and NVMe), and *Raspberry Pi OS* (updating with `full-upgrade`, the meaning of the `vcgencmd get_throttled` flags). The release notes and package list of the [Raspberry Pi OS Lite 2026-10-06](https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2026-10-06/) image; the official blog post [cloud-init on Raspberry Pi OS](https://www.raspberrypi.com/news/cloud-init-on-raspberry-pi-os/) (November 27, 2025); the official price announcement of [October 1, 2026](https://www.raspberrypi.com/news/price-increases-for-2gb-raspberry-pi-4-and-raspberry-pi-5/); and the *whitepaper* "Making a more resilient file system" (August 2026) about card wear and system logs.
- [Raspberry Pi Imager](https://github.com/raspberrypi/rpi-imager/tree/v2.0.12) 2.0.12, source code: the order and title of every screen, the button labels (shown in capital letters), the list of capital cities (`Jakarta (Indonesia)`, `Asia/Jakarta`, the `id` keyboard), the administrator permission on Windows, and the cloud-init files written to the card; the official list of operating systems that Imager reads ([`os_list_imagingutility_v4.json`](https://downloads.raspberrypi.com/os_list_imagingutility_v4.json)).
- The Raspberry Pi OS image builder, [pi-gen](https://github.com/RPi-Distro/pi-gen) (the 2026-10-06 image), and the [raspberrypi-sys-mods](https://github.com/RPi-Distro/raspberrypi-sys-mods) package: the shape of the prompt, the journal in RAM, the default watchdog, and zram swap.
- Debian 13 "Trixie": the packages [mosquitto 2.0.21](https://packages.debian.org/trixie/mosquitto) (the `mosquitto.conf` file, `conf.d`, the systemd unit file, log rotation), [systemd 257](https://packages.debian.org/trixie/systemd) (what `systemctl status` shows, the journal lines, `Restart=`, `systemctl edit`), [apt 3.0](https://packages.debian.org/trixie/apt) (what `update` and `install` show), [nano 8.4](https://packages.debian.org/trixie/nano) (the help lines and the save question), and the `motd` from the base-files package; the manuals at [manpages.debian.org](https://manpages.debian.org/trixie/) (`journalctl`, `systemd.service`, `mosquitto.conf`, `nmcli`, `hostname`).
- [Mosquitto](https://github.com/eclipse-mosquitto/mosquitto) 2.0.21 (the log texts on the Pi) and 2.1.2 (the Windows service `mosquitto install`, how `log_dest file` is read, the installer); the [Authentication methods](https://mosquitto.org/documentation/authentication-methods/) page.
- NetworkManager 1.52 and netplan 1.1.2, source code (the `nmcli` messages, the connection name `netplan-eth0`), and the [trixie-feedback #3](https://github.com/raspberrypi/trixie-feedback/issues/3) discussion (`nmcli` settings survive a restart of the Pi).
- [OpenSSH](https://github.com/openssh/openssh-portable) 9.5 and 10.0, source code (the first greeting, the fingerprint, `REMOTE HOST IDENTIFICATION HAS CHANGED`, `ssh-keygen`); Microsoft: [OpenSSH for Windows](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse) and [mDNS in the Enterprise](https://techcommunity.microsoft.com/blog/networkingblog/mdns-in-the-enterprise/3275777) (`.local` since Windows 10 1703); Android: [DNS Resolver](https://source.android.com/docs/core/architecture/modular-system/dns-resolver) (`.local` since November 2021).
- [MQTTX](https://github.com/emqx/MQTTX/tree/v1.13.1) 1.13.1, source code: the **Disconnect** icon, the client name `mqttx_…`, the subscriptions that are set up again on every connection, and the default MQTT 5.0 with a 60-second *keep-alive*.
- Homebrew: the [mosquitto](https://formulae.brew.sh/formula/mosquitto) formula (`brew services`, where `mosquitto.conf` is).
- microSD cards: the product pages of [SanDisk High Endurance](https://www.sandisk.com/products/memory-cards/microsd-cards/sandisk-high-endurance-uhs-i-microsd) and [SanDisk MAX Endurance](https://www.sandisk.com/products/memory-cards/microsd-cards/sandisk-max-endurance-uhs-i-microsd) (recording hours), the SD Association: [Application Performance Class](https://www.sdcard.org/developers/sd-standard-overview/application-performance-class/) (A1/A2), and LWN: [Optimizing Linux with cheap flash drives](https://lwn.net/Articles/428584/) (erase blocks and *write amplification*); [Win32 Disk Imager](https://sourceforge.net/projects/win32diskimager/) 1.0.0.

**Images.** The original diagrams are licensed **CC BY 4.0**, and their `.svg` source files are included in the `assets/` folder so you can edit them. The Raspberry Pi Imager screenshot collages follow the license of the Raspberry Pi documentation, **CC BY-SA 4.0**, and the Raspberry Pi 5 photo is licensed **CC BY 4.0** by its photographer. The full summary is also in [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| `roadmap-module-12`, `gateway-at-home`, `ssh-remote-terminal`, `linux-folder-map` (`.png` + `.svg`) | Original diagrams of the Fullstack IoT Developer curriculum. The terminal texts and folder paths from Raspberry Pi OS 2026-10-06 and the Debian Mosquitto package; the addresses and names are only examples. | CC BY 4.0 |
| `systemd-guard`, `microsd-card-wear`, `project-gateway-diagram` (`.png` + `.svg`) | Original diagrams. The service rules from Debian's `mosquitto.service` unit file; card wear from the Raspberry Pi documentation and LWN; the meaning of the A1/A2 codes from the SD Association. | CC BY 4.0 |
| `meet-the-raspberry-pi-5.jpg` | Photo [Raspberry Pi 5](https://commons.wikimedia.org/wiki/File:Raspberry_Pi_5.jpg) by SimonWaldherr, Wikimedia Commons; cropped, labels by the author. | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en) |
| `imager-steps-1-4.png`, `imager-steps-5-8.png`, `imager-steps-10-11.png` | Raspberry Pi Imager screenshots from the [official Raspberry Pi documentation](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd); rearranged, with step numbers and captions added by the author. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en), following the original screenshots |

**About the Expected output boxes.** This module was written without a Raspberry Pi on the author's desk. That's why every **Expected output** box from the Pi, and from the laptop terminal that talks to the Pi, is marked **example**: the layout and text of every line are taken from the source code of the same program versions (Imager 2.0.12, OpenSSH, Mosquitto 2.0.21, systemd 257, apt 3.0.3, nano 8.4, NetworkManager 1.52) and from their official documentation, while the addresses, numbers, dates, program numbers (PIDs), and fingerprints are only examples. The column widths in some displays, for example `systemctl status` and nano's help lines, may be slightly different on your screen. The Imager screenshots come from the official documentation (Imager 2.0, late 2025); their labels were checked against the Imager 2.0.12 source code, except the card size number (`29.7 GB`), which the old Imager still worked out with 1 GB = 1,073,741,824 bytes. Node 1 v1.2.1 changes only four lines of v1.2.0, which was already tested in Module 11; this version was compiled again with version 3 of the esp32 package and the real board's settings (1,188,060 bytes, 16 bytes more than v1.2.0), then run in Wokwi with a public broker. The Serial Monitor example in ➕ B follows the layout of that recording, with the addresses and `device_id` from a home network.

---

[⬅️ Module 11](../module-11-mqtt-and-data-contract/README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 13 — Node-RED & Dashboard 2: Your First Dashboard Without Coding](../module-13-node-red-dashboard/README.md) ➡️**
