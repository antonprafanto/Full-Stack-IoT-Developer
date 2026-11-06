# Module 28 — OTA Updates, Provisioning, Fleets, & From Breadboard to Enclosure

🌐 **English** · [Bahasa Indonesia](../../../fase-5-operasi-skala/modul-28-ota-provisioning-fleet/README.md)

*Phase 5 · Week 28 · Hardware: **Kit A** (2 ESP32s, project box, screw-terminal expansion board; perfboard + soldering optional) + a borrowed third ESP32 (optional; or a simulated device) + **the server from Module 27** (VPS and Pi gateway; the free path: the Pi only; without a Pi: the laptop) · Prerequisites: **Module 27** (backend 1.4.0, frontend 1.3.0, `compose.cloud.yml` and `edge/` on `main`), Module 10 (partitions), Module 21 (device keys), Module 9 (power supply) · Time: ±9 hours spread over one week, plus 24 hours of Node 1 running in the box (the soldering path +60 minutes; without a Kit ±6 hours) · Cost: project box + screw-terminal expansion board (Syllabus: about IDR 25,000–40,000, an estimate; check again, October 2026 prices); the soldering path: a 60 W soldering iron + solder (about IDR 60,000–120,000, an estimate); the server and the domain stay from Module 27*

[⬅️ Module 27](../module-27-deploy-internet-tls-pwa/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 29 ➡️](../module-29-testing-cicd/README.md)

---

[Module 27 closed](../module-27-deploy-internet-tls-pwa/README.md#-module-27-completion-checklist) with a home that's online 24 hours, encrypted, and outage-proof, with two honest limits: Node 1's firmware is still uploaded over a USB cable, and its circuit is still on the breadboard. This week's promise: Node 1 is updated over the air (OTA) from the server, goes back to the old version by itself when an update fails (rollback), shows its version on the `/fleet` page, and its circuit moves into a project box. According to the [Syllabus](../../SYLLABUS.md#-phase-5--operations--scale-deploy-ota-cicd--capstone-modules-2632), Phase 5 takes your system to "it runs on the internet, 24/7, encrypted, updatable, and never loses data". Module 28 pays off **updatable**, and at the same time gets your home ready to be installed at many locations.

Many old promises are paid off this week. [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#10-the-price-of-wi-fi-a-bloated-program-a-locked-adc2-and-current-spikes) chose the scheme with two program shelves because the second shelf is used for over-the-air updates in Module 28. [Module 5](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#4-power-supply-brains-from-the-laptop-muscle-from-the-adapter) promised that the restart reason would be sent to the server as `reset_reason` so a silent brownout still shows. [Module 9](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md#a-node-1-permanently-on-an-adapter-then-the-24-hour-test) gave Node 1 a permanent power supply and the 24-hour test; both are used again for the box. [Module 14](../../phase-2-connectivity/module-14-node-2-esp-now/README.md#-technical-deep-dive-optional) postponed OTA for Node 2 and program signing to this module, and [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#10-local-safety-node-1-guards-the-house-when-the-server-is-gone) kept the third `status`, `offline-mode`, for Module 28. [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#13-keys-and-their-fingerprints-srcauthkeyts-5-minutes) prepared `matchKey` for firmware downloads and asked who may tell the backend to make broker accounts. [Module 27](../module-27-deploy-internet-tls-pwa/README.md#6-certificates-in-full-chain-name-and-dates) warned: if the certificate root changes, an ESP32 with the root built in needs new firmware over OTA. The pin map that "doesn't change until Module 28" stays too; only its connections move into the box.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| Every new firmware needs a USB cable and a laptop. | Firmware 1.6.0 can't be updated from the server; the second shelf (Module 10) isn't used yet. | **Over-the-air updates**: the server gives the order, Node 1 pulls its firmware by itself ([Concept 1](#1-why-ota-is-a-must-a-device-on-the-roof)–3, [Practice 5](#practice-5--node-1-170-by-cable-for-the-last-time-25-minutes-needs-a-board)–7) |
| The `update` command is answered with `action update not supported yet (Module 28)`. | The contract has named `update` since Module 11, the firmware hasn't. | **Contract 1.6 and firmware 1.7.0** ([Concept 3](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period), [Practice 2](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes), Practice 5) |
| Broken firmware (for example a wrong broker key) makes Node 1 useless until the USB cable is plugged in again. | Without a trial period, a new program counts as valid right away. | **A 60-second trial period**: firmware that fails to connect to the broker goes back to the old version by itself ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c), [Practice 8](#practice-8--deliberately-broken-firmware-goes-back-to-the-old-version-by-itself-25-minutes)) |
| A device's health can't be seen from afar. | `vitals` doesn't carry `reset_reason` and the version yet; there's no fleet screen yet. | **`vitals` 1.6 and the Fleet screen** ([Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason), [Practice 4](#practice-4--dashboard-140-and-the-fleet-screen-with-simulated-devices-25-minutes), 13) |
| A new device needs manual steps, including `mosquitto_passwd` on the broker's machine. | Device broker accounts have been made by hand since Module 21. | **Claim codes and automatic broker accounts** ([Concept 8](#8-a-new-device-in-1-minute-identity-claim-codes-and-automatic-broker-accounts), [Practice 3](#practice-3--automatic-broker-accounts-at-the-gateway-moving-the-module-21-accounts-and-an-account-backup-35-minutes), 10) |
| A device whose key is revoked stays connected to the broker. | Revoking a key (Module 21) only makes the backend ignore it; the broker account is deleted by hand. | **Deactivate**: the key revoked, the broker account deleted, the connection cut at once ([Concept 10](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect), [Practice 11](#practice-11--the-vitals-interval-from-afar-and-deactivating-a-lost-device-20-minutes)) |
| A breadboard isn't fit to be installed: wires come loose, springs wear out, dust gets in. | The circuit is still for experiments on the desk. | **A project box** with a screw-terminal expansion board and the Module 9 power supply ([Concept 11](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v), [Practice 12](#practice-12--from-breadboard-to-enclosure-90-minutes-needs-a-board-the-soldering-path-adds-60-minutes)–13) |

The pass requirement from the [Syllabus](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure): "Node 1 is updated to a new version without a cable and its version shows up on `/fleet`, deliberately broken firmware automatically falls back to the old version, and Node 1 is neatly installed in an enclosure with its own power supply." This module splits it into one prerequisite, three proofs, and one required practice:

- **O0** (a prerequisite, not part of ✅): Node 1 runs 1.7.0, installed by cable **once**, and its card on the **Fleet** screen shows `1.7.0` together with `reset_reason`. This prerequisite exists because 1.6.0 refuses the `update` command.
- **O1** without a cable: Node 1's USB cable isn't connected to the laptop (Node 1 runs on its charger). You press **Update** on the Node 1 marked canary (the first test device); its card briefly shows `stopped on purpose`, then `Online` with the history `succeeded` 1.7.0 → 1.7.1, version `1.7.1`, and `reset_reason` `SW`.
- **O2** rollback: the test release 1.7.2, whose key is broken on purpose, is refused by the broker, and after the 60-second trial period, Node 1 goes back to 1.7.1 by itself without being touched: `back to the old version (rollback)`, the version stays `1.7.1`, `Online` again. "The old version" means the version before that update, not 1.6.0.
- **K1** the box: (a) before and after photos from the same angle; (b) every wire passes a gentle pull test; (c) labels: `device_id`, name, the function and polarity of the power wires, and the portal password; (d) its own power supply with the Module 9 arrangement, no laptop and no 220 V inside the box; (e) at least 24 hours on in the box, with a `reset_reason` that isn't `BROWNOUT`, `PANIC`, or `WDT`, because a bad power supply often only shows up after hours.
- **P1** a new device in 1 minute (a required practice, not part of ✅): an empty third board is set up through the portal (Wi-Fi, claim code, server address, broker address; a simulated device: the `claim` command), then shows `Online` on the **Fleet** screen within 60 seconds of **Save**.

The wording for each path is in the **Choose your path** table. The Syllabus (v1.0.30) records this split and the wording for each path in its ✅ line; the ✅ sentence itself stays.

For Mini Smart Home, Node 1's firmware moves up to **1.7.0**, the first version that can be updated over the air. It goes in by cable for the last time, then you build **1.7.1** (over the air) and the test release **1.7.2** (rollback). The Syllabus used to say "build firmware v1.1" (now amended, A-2); that number was passed long ago, so the next version here is 1.7.1. Node 2 stays at **1.0.0**. The backend moves up to **1.5.0** with migration **011** and the dashboard to **1.4.0** (the **Fleet** screen), both without a new npm package; the data contract to **1.6**; `PIN-MAP.md` to version **7** (its pins stay); `edge/` gets dynamic security. The third-party images stay (the dynamic security plugin is already in Mosquitto 2.1.2); the board package used: Arduino-ESP32 **3.3.12**. Module 28 isn't a Checkpoint: its quiz counts toward the [Phase 5 completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase).

> [!IMPORTANT]
> **The required order:** the backup ([Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-a-backup-and-account-notes-10-minutes)) → backend 1.5.0, migration 011, and the central broker (Practice 2) → the gateway ([3.1](#31--the-gateway-goes-up-the-plugin-password-in-edgeenv-two-bridge-remap-lines-then-restart-the-broker-10-minutes)) → moving the old accounts ([3.4](#34--move-the-old-module-21-accounts-rotate-the-key-the-new-key-over-serial-mosquitto_passwd--d-then-restart-10-minutes)) → the **Fleet** screen (Practice 4) → firmware 1.7.0 by cable (Practice 5) → over-the-air updates ([Practice 6](#practice-6--building-171-and-uploading-it-to-the-server-15-minutes)–8) → claim codes (Practice 10) → the box (Practice 12). Why: the old backend refuses firmware 1.7.0's `vitals`, a new device registered before the gateway is up is answered with `503`, and the box covers the USB port.

**Choose your path:**

| Path | The server that serves the firmware and the **Fleet** screen | Node 1 connects to | Proof | Practices | Time |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Main** | VPS, `https://iot.yourname.my.id` | the Pi gateway; accounts made through the bridge (`gateway:pi1`) | O0–O2, K1, P1 | 1–13 | ±9 hours |
| **Free** | Pi, `http://192.168.1.37` through the device door 8081; the dashboard still through the tunnel | the gateway 1883, the center 1884 on the same Pi | the same | 1–13 | ±9 hours |
| **Without a Pi** | the laptop, `http://192.168.1.10` as in phone mode; the laptop must not sleep during an update | the laptop's broker (`AUTO_BROKER_ACCOUNTS=center`) | the same; the `http://` download only tested by the author with the simulator on one machine, not over home Wi-Fi | 1–13 without the gateway steps | ±8.5 hours |
| **Without a Kit** | as your path | your path's broker (simulated devices from the `tools/` simulator) | simulated O0, O1, O2, P1; K1 = a box plan: **not a full pass yet** | 1–4, 6–11 with the simulator | ±6 hours |
| **Wokwi** | a server with a domain (the main path) | a public broker, so not `Online` on the **Fleet** screen | the claim through the Serial Monitor because the portal can't be opened in Wokwi ([Syllabus §5.4](../../SYLLABUS.md#54-learning-without-hardware-what-you-can-and-cannot-do-in-wokwi)); OTA and rollback in Wokwi not tested by the author: **not a full pass yet** | as without a Kit | ±6 hours |

The paths without a Kit and Wokwi finish O0–O2 and K1 as soon as the board arrives: install 1.7.0 by cable (Practice 5), register the board with a claim code (Practice 10) if it isn't registered yet, then repeat Practices 6–8 with new version numbers from 1.7.3, because the numbers already used by the fake files are refused `409`.

> [!NOTE]
> **How to use this module.**
>
> - **Marks.** ⭐ = required to pass. The practices that "need a board" (5, 12, 13) and the board parts of Practices 7, 8, and 10 are only for the paths with a Kit. The 🔀 boxes (**The free path:**, **Without a Pi:**, **Without a Kit:**, **Wokwi:**) explain what's different on the other paths.
> - **Practices 1–4 don't change the board's firmware:** Node 1 keeps running 1.6.0, and its USB cable is only used in 3.4 to type the new key in the Serial Monitor.
> - **The proof table:**
>
>   | Requirement | Practice | What you see |
>   | :-: | :-- | :-- |
>   | O0 | [5.4](#54--o0-serial-ota-and-server-then-node-1s-card-at-version-170-with-reset_reason-5-minutes) | Node 1's card at version `1.7.0` with `reset_reason` |
>   | O1 | [7.5](#75--o1-version-171-reset_reason-sw-and-the-history-succeeded-without-a-cable-5-minutes) | the USB cable not in the laptop; the history `succeeded` 1.7.0 → 1.7.1, `reset_reason` `SW` |
>   | O2 | [8.3](#83--o2-node-1-goes-back-to-171-by-itself-after-the-60-second-trial-period-10-minutes) | `back to the old version (rollback)`, the version stays `1.7.1` |
>   | K1 | [12.9](#129--k1-ad-labels-the-box-lid-then-node-1-online-again-5-minutes) (photo: 13.1) and [13.2](#132--k1-e-24-hours-on-without-brownout-panic-or-wdt-5-minutes) | photos, the pull test, labels, the Module 9 power supply, 24 hours without `BROWNOUT`, `PANIC`, or `WDT` |
>   | P1 | [10.4](#104--p1-a-new-card-online-on-the-fleet-screen-within-60-seconds-of-save-6-minutes) | a new card `Online` within 60 seconds of **Save** |
>
> - **The 🖥️ box at the start of each practice names the machine, the tools, and the folder**: **Arduino IDE** and the Serial Monitor (a USB cable to the board); **VS Code** (a terminal at the root of the `mini-smart-home` project, `backend`, `frontend`, or `tools`); **an SSH terminal to the VPS** (`ssh house@203.0.113.10`) and **to the Pi** (folder `mini-smart-home/edge`; on the free path also the project root); **Chrome**, a **phone**, **Bruno**, **Telegram**, **Grafana**, **MQTTX** (optional); and a **multimeter**, a **screwdriver**, and a **ruler**.
> - **The Expected output boxes** were recorded on a **Raspberry Pi 5 with Ubuntu 26.04 (arm64)**: Docker Engine 29.1.3, Compose 2.40.3, headless Chrome 156, and Node 24.21.0. That one machine played the laptop, the Pi, the VPS, the internet, and the devices. The box label names where an output comes from, for example **Expected output (the author's lab, simulator):**; other sources: the stand-in CA, host tests, and the `arduino-cli` compile. Board output that was never recorded is written as **text from the code**.
>
>   | Your real world | The author's lab stand-in |
>   | :-- | :-- |
>   | Node 1 and the third board | the `tools/` simulator (imitates the 1.7.0 design, flashes nothing) |
>   | `node-1-home.ino.bin` 1.7.1 | the real 1.7.1 file compiled by the author: uploaded to the server, then downloaded and SHA-256-checked by the simulator; not run |
>   | the test release 1.7.2 | a fake file (not firmware) marked `TEST_WRONG_KEY` from `tools/make-fake-bin.js` |
>   | the portal on a phone | an illustration from WiFiManager 2.0.17's real HTML |
>   | VPS `203.0.113.10`, the Pi gateway | containers in the Docker hallway that plays "the internet" |
>   | Let's Encrypt, Telegram, the internet unplugged | the stand-in CA, the mock Bot API server, `docker network disconnect` |
>   | many devices | 22 simulated devices from the simulator |
>
>   Times in the Expected output boxes are simulator numbers on one machine, not an ESP32 over Wi-Fi; times are written in WIB. Lab names and IPs are replaced by your examples (`iot.yourname.my.id`). Details: [🔬](#-technical-deep-dive-optional), [📚](#-sources--image-credits).
> - macOS users: replace **Ctrl** with **Cmd** for app shortcuts. **Except in the terminal:** stopping a program is still **Ctrl + C**.

> [!IMPORTANT]
> **Honest status: firmware 1.7.0 compiled by the author, not yet run on a board.** On 3 November 2026 the author compiled 1.7.0, 1.7.1, and 1.7.2-test with `arduino-cli` 1.5.1 (not Arduino IDE), the esp32 package 3.3.12, and the exact library versions, with Node 1's settings since Module 10 (**ESP32 Dev Module**, **Minimal SPIFFS**, **Flash Mode DIO**).
>
> | Part | Tested by the author in the lab (real code) | Simulated (simulator, fake files, simulated internet) | Only from documents / not yet |
> | :-- | :-- | :-- | :-- |
> | Server | backend 1.5.0 (203 tests), migration 011 with a filled history, upload, the locked `/fw` through Caddy, canary, **Update all**, the test release, claims, **Deactivate**, dynamic security at the center and the gateway (TLS bridge), moving the Module 21 accounts, the broker account backup, the **Fleet** screen, Telegram, Grafana | "VPS", "Pi", the domain, Let's Encrypt (stand-in CA), Telegram (mock server) | a real VPS, domain, Let's Encrypt, Cloudflare, and Telegram (as in Module 27) |
> | Devices | — | a successful OTA, rollback, failure, expiry, claims, 22 devices at once: the simulator | a real Node 1 over Wi-Fi |
> | Firmware 1.7.0 | the trial-period logic, rollback, reports, and message sizes (host tests: g++ and a stand-in shelf opener); compile: 0 errors, 0 warnings from the sketch files, about 1.41 million bytes (71% of a shelf), one `T verifyRollbackLater` = rollback on (without `extern "C"` it becomes `W`: silently off; Concept 4); the Quick Win sketch and the 🧩 Level 1 key compiled too | — | OTA over Wi-Fi, real rollback and watchdog, the portal on a phone, a claim on a board, a real `reset_reason`, a board's Serial Monitor |
> | Hardware | — | — | the expansion board, the box, soldering, the multimeter, 24 hours in the box: from sources, reconstructed diagrams, licensed photos |
> | Wokwi, QEMU | — | — | not run by the author |
>
> You are its first tester on a board: tick [✅](#-module-28-completion-checklist) only what really happened.

> [!WARNING]
> **This week's safety rules.**
>
> 1. **No 220 V inside the box.** The power supply stays the Module 9 arrangement, with the adapters in a wall socket outside the box, and the relay is only for 5 V loads. The golden power rules: loads (relay, pump, servo) are powered by the 5 V adapter through the MB102, not from an ESP32 pin, with a shared GND (Concept 11, [12.6](#126--the-module-9-power-supply-in-the-box-two-labeled-wires-and-a-shared-gnd-10-minutes)).
> 2. **`.bin` files, claim codes, `MOSQUITTO_DYNSEC_PASSWORD`, and the broker cupboard's contents are secrets:** never into Git, a forum, an AI, or a public link. Node 1's `.bin` file holds the ESP-NOW key, the portal password, and folder paths on your computer. Never `docker compose down -v`: the device accounts and the firmware files would be lost with it (Concept 6, [3.5](#35--back-up-the-broker-accounts-with-scriptsbackup-broker-accountssh-3-minutes), ➕ E).
> 3. **`update` is never retained.** In MQTTX, **Retain** stays off: a retained command repeats the update every time the board starts (Concept 3).
> 4. **Backend 1.5.0 and migration 011 first, then firmware 1.7.0**, and don't register a new device before the gateway is up (2.4, Practice 3).
> 5. **Upload `node-1-home.ino.bin`**, not `.merged.bin` or `.bootloader.bin` ([6.3](#63--choose-node-1-homeinobin-not-mergedbin-then-compute-its-sha-256-3-minutes)).
> 6. **Don't cut the power of Node 1, the Pi, or the router in the first 60 seconds after an update.** The new firmware is cancelled and Node 1 goes back to the old version: safe, but your update is lost (Concept 4).
> 7. **`TEST_WRONG_KEY` back to `0`** after the rollback practice, before the commit ([8.2](#82--right-away-set-test_wrong_key-back-to-0-and-the-version-back-to-171-3-minutes)).
> 8. **Soldering: safety glasses, ventilation, and washing your hands**; unplug all power before moving wires (12.2, [12.5](#125-small-circuits-on-a-mini-self-adhesive-breadboard-10-minutes)).

As in Modules 16–27, this module starts with the [🔁 Warm-up: versions, program shelves, and restart reasons](#-warm-up-versions-program-shelves-and-restart-reasons-30-minutes). On the first day, the warm-up, the [🏆 Quick Win](#-quick-win-two-shelves-on-your-board-15-minutes), Concepts 1 to [6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https), then Practices 1 and 2 are enough; Node 1 keeps running 1.6.0 until Practice 5. The eleven concepts are read in between their practices; the order is at the start of [🧠](#-the-why-concepts). The folded parts in [🚨](#-troubleshooting) are opened when needed; the folded parts in [🔬](#-technical-deep-dive-optional) can be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 Warm-up: versions, program shelves, and restart reasons (30 minutes)](#-warm-up-versions-program-shelves-and-restart-reasons-30-minutes)
4. [🏆 Quick Win: two shelves on your board (15 minutes)](#-quick-win-two-shelves-on-your-board-15-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Why OTA is a must](#1-why-ota-is-a-must-a-device-on-the-roof) · [2 Two shelves and the shelf note](#2-two-shelves-and-a-slip-of-paper-app0-app1-otadata-and-the-shelf-opener) · [3 HTTP OTA](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period) · [4 Rollback that works](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c) · [5 Versions and SemVer](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest) · [6 Who may hand out firmware](#6-who-may-hand-out-firmware-keys-fingerprints-and-https) · [7 The fleet and the canary](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota) · [8 A new device in 1 minute](#8-a-new-device-in-1-minute-identity-claim-codes-and-automatic-broker-accounts) · [9 The `vitals` interval and health](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason) · [10 Deactivating a device](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect) · [11 From breadboard to enclosure](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 The workbench](#practice-1--the-workbench-a-branch-the-fingerprint-a-backup-and-account-notes-10-minutes) · [2 Contract, backend, central broker](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes) · [3 Automatic broker accounts](#practice-3--automatic-broker-accounts-at-the-gateway-moving-the-module-21-accounts-and-an-account-backup-35-minutes) · [4 The Fleet screen](#practice-4--dashboard-140-and-the-fleet-screen-with-simulated-devices-25-minutes) · [5 Firmware 1.7.0 by cable](#practice-5--node-1-170-by-cable-for-the-last-time-25-minutes-needs-a-board) · [6 Upload 1.7.1](#practice-6--building-171-and-uploading-it-to-the-server-15-minutes) · [7 No cable, canary first](#practice-7--the-first-update-without-a-cable-canary-first-20-minutes) · [8 Rollback](#practice-8--deliberately-broken-firmware-goes-back-to-the-old-version-by-itself-25-minutes) · [9 "Update all" (optional)](#practice-9--optional-the-fleet-update-all-a-disconnected-device-and-expiry-15-minutes) · [10 Claim codes](#practice-10--a-new-device-in-1-minute-a-claim-code-and-the-portal-30-minutes) · [11 The `vitals` interval and Deactivate](#practice-11--the-vitals-interval-from-afar-and-deactivating-a-lost-device-20-minutes) · [12 From breadboard to enclosure](#practice-12--from-breadboard-to-enclosure-90-minutes-needs-a-board-the-soldering-path-adds-60-minutes) · [13 24 hours in the box](#practice-13--24-hours-in-the-box-and-the-after-photo-10-minutes-plus-24-hours-of-waiting-needs-a-board)
   - Needs a board: Practices 5, 12, and 13 · Without a Kit: Practices 1–4 and 6–11 with simulated devices
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-28-completion-checklist)

## 🎯 After this module you can…

1. **Update Node 1's firmware without a cable** from the **Update** button on the **Fleet** screen: the server gives the order over MQTT, then Node 1 pulls its new firmware by itself from its home server (HTTP OTA), right away.
2. **Explain the two program shelves** (`app0`, `app1`), the shelf note `otadata`, and the shelf opener (bootloader), and why an upload by cable always goes back to `app0`.
3. **Make new firmware prove itself within 60 seconds** and go back to the old version by itself when it fails (`extern "C" bool verifyRollbackLater()`), and know its limit: it only guards "can still connect and publish".
4. **Serve firmware only through a locked route**, with a SHA-256 fingerprint and HTTPS on the internet, and know why a `.bin` file must never be public or go into Git.
5. **Update one or many devices without touching them** with SemVer, test releases, a canary (one device first), and **Update all**, which stays locked until the canary succeeds.
6. **Register a new device in ±1 minute** through the portal and a claim code; its broker account is made by the backend itself (dynamic security), also at the Pi gateway.
7. **Know the health of every device** on the **Fleet** screen (`reset_reason`, signal, RAM, uptime) and change the `vitals` interval from afar.
8. **Deactivate a lost device** so the broker cuts it off at once, and know Grafana's misleading message.
9. **Move Node 1 from the breadboard into a box that's fit to be installed**: a screw-terminal expansion board, labels, and the Module 9 power supply, without 220 V.
10. **Say honestly what isn't proven yet**: Node 2 is still updated by cable, the paths without a Kit and Wokwi aren't a full pass yet, and firmware 1.7.0 hasn't been run by the author on a board; your board proves it.

## 🧰 What you need

The **Kit** column = the paths with a Kit (main, free, without a Pi); **Without a Kit** also covers Wokwi. Syllabus v1.0.30 records the hardware and the versions of the main tools in Module 28.

| What you need | Kit | Without a Kit | Notes |
| :--- | :-: | :-: | :--- |
| **The Module 27 result** on `main` | ✓ | ✓ | Backend 1.4.0, frontend 1.3.0, `compose.cloud.yml`, and `edge/` running on your path (VPS + TLS bridge, the Pi only, or the laptop); checked in [🔁 Step 1](#step-1--your-module-27-homes-inventory-node-1s-version-device_id-and-the-history-fingerprint). |
| **Node 1 1.6.0** on the breadboard with the Module 9 power supply | ✓ | simulated | A 5 V ≥ 1 A phone charger to the board's USB, a 5 V 2 A adapter to the MB102; loads still from the MB102, not from an ESP32 pin, with a shared GND. The USB cable for 🔁, 🏆, 3.4, and Practice 5. Without a Kit: the `tools/` simulator ([4.2](#42--simulated-170-devices-from-the-tools-simulator-6-minutes)). |
| **A plastic project box** | ✓ | plan | Fits the expansion board + DevKit, a mini breadboard, the relay, and the MB102, with room for sensor holes and ventilation; not a metal or waterproof box ([Concept 11](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v)). |
| **A screw-terminal expansion board** for the 30-pin DevKit V1 | ✓ | plan | Every pin has a screw that clamps a wire. Measure the distance between your DevKit's two rows of pins with a ruler and compare it with the seller's size; a board for 38 pins doesn't fit ([12.1](#121--match-the-expansion-board-to-your-devkit-measure-the-distance-between-the-two-pin-rows-5-minutes)). The [Syllabus](../../SYLLABUS.md#52-kit-a--esp32--basic-electronics) estimate for box + board: about IDR 25,000–40,000; prices on 30 Oct 2026 may be higher, check again. |
| Two mini self-adhesive breadboards, solid 22 AWG wire in several colors, cable ties, a marker, labels; a small screwdriver, a wire stripper, a multimeter, a ruler | ✓ | — | The small circuits in the box, strain relief, the lid label. Ferrules (metal sleeves for the ends of stranded wire): optional. |
| **A borrowed third ESP32** + a USB cable, and a **phone** | optional | simulated | An empty board for [Practice 10](#practice-10--a-new-device-in-1-minute-a-claim-code-and-the-portal-30-minutes), the phone for its portal. Without a third board: the simulator; Wokwi: the claim through the Serial Monitor. |
| **Bruno**, **MQTTX** 1.13.1, **GitHub** | ✓ | ✓ | Already there: Bruno since Module 16, MQTTX (optional) since Module 11. The `feature/fleet` branch is made in [1.1](#11-the-featurefleet-branch-from-the-latest-main-2-minutes). |

<details>
<summary><b>The soldering path (optional): extra items</b></summary>

A 60 W soldering iron with temperature control, 0.8 mm solder, perfboard (a board with holes for soldering), safety glasses, and a ventilated room; the Syllabus estimate is about IDR 60,000–120,000, check again. The steps are in the fold **The soldering path** of [12.5](#125-small-circuits-on-a-mini-self-adhesive-breadboard-10-minutes).

</details>

Versions used (Arduino tools: the newest as of 2 November 2026, except GFX; the author compiled with exactly these versions using `arduino-cli` 1.5.1, not Arduino IDE):

| Component | Version | Notes |
| :--- | :--- | :--- |
| Arduino IDE, the **esp32** board package | 2.3.10, 3.3.12 | the package: not 3.3.11 or older (`setSHA256sum()` and `useBuiltinCACertBundle()` only exist from 3.3.12), not 4.0.0-RC1; Update, HTTPUpdate, NetworkClientSecure, and Preferences come with the package |
| Node 1's settings | **ESP32 Dev Module**, **Partition Scheme** Minimal SPIFFS, **Flash Mode** DIO | since Module 10 |
| Node 1's libraries ([5.1](#51--the-esp32-package-3312-the-minimal-spiffs-scheme-and-firmware-170-with-trial-periodcpp-8-minutes)) | WiFiManager 2.0.17, ArduinoJson 7.4.3, PubSubClient3 3.3.2, ESP32Servo 3.2.1, DHT sensor library 1.4.7, Adafruit SSD1306 2.5.17, ModbusMaster 2.0.1 | no new library |
| Dependencies installed along with them | Adafruit Unified Sensor 1.1.15, Adafruit GFX Library 1.12.6, Adafruit BusIO 1.17.4 | GFX 1.13.0 not tested by the author yet: the notification `Updates are available for some of your libraries.` → click **Later** |
| Images | `eclipse-mosquitto:2.1.2-alpine` (already contains the dynamic security plugin), `caddy:2.11.7-alpine`, the others | the same as Module 27; their versions are pinned |

**Files that change this week** (compare them with `code/` in [➕ A](#a-match-your-project-the-root-edge-scripts-backend-150-frontend-140-and-firmware)):

| Place | Files |
| :--- | :--- |
| Project root | `compose.cloud.yml`, `.env.example` (`MOSQUITTO_DYNSEC_PASSWORD`, the "Fleet" block), `.gitignore` (+ `*.bin`, `firmware/**/build/`, `firmware-data/`), README, `DATA-CONTRACT.md` 1.6, `PIN-MAP.md` 7, the pull request template; new: `scripts/backup-broker-accounts.sh` |
| `edge/` | `center.conf`, `center-internet.conf`, `gateway.conf` (plugin), `bridge.example.conf` (remap), `acl-broker`, `compose.edge.yml`, `.env.example`, README |
| `backend/` 1.5.0 | migration `011_ota_and_fleet.sql`, new routes and services (firmware, fleet, claims, broker accounts), contract 1.6, 11 Bruno requests, README |
| `frontend/` 1.4.0 | the **Fleet** screen (a page + 8 components), `caddy/Caddyfile` (`/fw/*`, the door `:8081`), contract 1.6, README |
| `firmware/` Node 1 1.7.0 | new: `version`, `ota-check`, `ota-update`, `trial-period`, `claim` (`.h` + `.cpp`); 12 files changed; a new README |
| `tools/`, `grafana/` | the simulator, contract checker 1.6, `.env.example`, `make-fake-bin.js` + its test (new); README |
| Unchanged | Node 2 1.0.0, migrations `001…010`, the pin assignments, the Grafana provisioning, the third-party images |
| Outside the project | the practice material `quick-win/program-shelf/` and the 🧩 keys `challenges/key/` |

**The time** is ±9 hours (without a Pi ±8.5 hours), plus 24 hours of Node 1 running in the box: warm-up 30 minutes, Quick Win 15, concepts ±90, the required practices 335 (Practice 9 +15, the soldering path +60), ➕ 30, quiz and checklist 20. Without a Kit and Wokwi ±6 hours.

## 🔁 Warm-up: versions, program shelves, and restart reasons (30 minutes)

> 🖥️ **Tools used:** **Arduino IDE** (Serial Monitor) and **VS Code** on the laptop, a terminal on the **central machine** (VPS; the free path: the Pi; without a Pi: the laptop) and on the **Pi** (folder `mini-smart-home/edge`), **Chrome**, and a phone camera.

Five things to bring along, all read-only: Node 1 stays at 1.6.0 and the server stays at Module 27; Node 1 only restarts when its cable is moved and in Step 4. Write the results down in `learn-iot/module-28/warmup.md`, without passwords or keys.

> 🔀 **Without a Kit** (also Wokwi): Step 1 without the Serial Monitor, Steps 2–3 the same, Steps 4–5 wait for a board.

### Step 1 — Your Module 27 home's inventory: Node 1's version, `device_id`, and the history fingerprint

Move Node 1's USB cable from the charger to the laptop in the order of the Module 9 golden power rules: turn the MB102 off first, move the cable, then turn the MB102 on (a microSD module with a regulator: press **EN**). Loads stay powered by the MB102, not from an ESP32 pin, with a shared GND. Open the Serial Monitor, type in its send field, then press Enter:

```text
info
```

Its first line (every Serial text here is from the code, not yet recorded by the author on a board): `info: firmware 1.6.0, uptime HH:MM:SS, last restart <reason>, boot #N` (`uptime` = how long it has been on). On the dashboard (the **Devices** menu), write down the `device_id` on every card, Node 2's too.

In the central machine's terminal (the project root), run `docker compose ps -a`. A healthy home: `backend`, `db`, and `grafana` `Up … (healthy)`; `mosquitto`, `web`, `cloudflared` (the free path) `Up`; the one-off services (`broker-account`, `grafana-account`, `migrate`, `mqtt-certificate`) `Exited (0)`. Then take the history fingerprint with the Module 26 script (bash):

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

PowerShell (not tested by the author): `Get-Content scripts/fingerprint.sql | docker compose exec -T db psql -U postgres -d smarthome`.

**Expected output (the author's lab, simulated "VPS"; your numbers differ):**

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2211 | e09d5aec385a0edc06835413ee048367 |       369 |      9 |    3 |        2 |       3
(1 row)
```

The numbers move while data comes in. Have a Pi gateway? Run `docker compose ps -a` in the `edge` folder: `smarthome-gateway-mosquitto-1` `Up`. **Later in [1.2](#12--the-history-fingerprint-on-the-central-machine-with-scriptsfingerprintsql-3-minutes) and [1.4](#14--write-down-every-device-device_id-version-broker-and-its-old-account-2-minutes):** the fingerprint becomes the comparison before the server is updated; the version and `device_id` go into the notes per device.

### Step 2 — The program shelves since Module 10: the Minimal SPIFFS scheme and two 1,966,080-byte shelves

In Arduino IDE, open `node-1-home.ino`, then the **Tools** menu: the board is **ESP32 Dev Module**, with `Partition Scheme: "Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)"` and `Flash Mode: "DIO"` (Module 10 ➕ A). Different? Set them back now (without **Upload**): these settings are required this week.

Remember [Concept 10 of Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#10-the-price-of-wi-fi-a-bloated-program-a-locked-adc2-and-current-spikes): the 4 MB flash memory is divided into shelves (partitions), and the scheme the [Syllabus](../../SYLLABUS.md#module-10--wi-fi--http-devices-start-talking-to-the-network) chose from that module on gives **two program shelves**, `app0` and `app1`, of 1,966,080 bytes each. Node 1 1.6.0 fills about 1,194,928 bytes (60% of one shelf; the Module 21 record) on shelf `app0`; the second shelf isn't used yet. On another computer the number can differ by a few hundred bytes (the author's machine: 1,194,560): the board name, the operating system, and the package's folder path are stored too. **Later in [🏆](#-quick-win-two-shelves-on-your-board-15-minutes) and [Concept 2](#2-two-shelves-and-a-slip-of-paper-app0-app1-otadata-and-the-shelf-opener):** both shelves get to work.

### Step 3 — The contract already names `update`, the firmware doesn't yet: `action update not supported yet (Module 28)`

The data contract has named the `update` command since [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#5-the-data-contract-five-topics-and-one-json-shape-for-everything); firmware 1.6.0 doesn't carry it out yet. Search for `action update` in `firmware/node-1-home/networking.cpp` (VS Code: **Ctrl + F**), or in a terminal at the laptop's project root (bash):

```text
grep -n 'action update not supported yet' firmware/node-1-home/networking.cpp
```

**Expected output (the author's lab):**

```text
323:    message = "action update not supported yet (Module 28)";
```

Every `update` is answered with an `ack` holding that message. Just read it, don't try it from MQTTX: only the `backend` and `nodered` accounts may write `cmd`, and the `backend` account in MQTTX kicks out the real backend (account name = client name). **Later in [Concept 3](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period):** the full path of `update`.

### Step 4 — Two ways to restart: the EN button (`POWERON`) versus Serial `restart` (`SW`)

Press **EN**, wait a moment, then type `info` again: `last restart POWERON`. Now type this, then press Enter:

```text
restart
```

The firmware writes `Restarting now...` and restarts; the next `info`: `last restart SW` (the program itself asked for it). Version 1.6.0 restarts without saying goodbye to the broker; in 1.7.0, `restart` becomes **stopped on purpose** (`offline-mode`) and `SW` is sent along as `reset_reason`. **Later in [Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason):** the seven `reset_reason` values on the **Fleet** screen.

### Step 5 — A "before" photo of Node 1 from above

Put Node 1 back on its charger in the same order. Photograph Node 1's breadboard from above, with the whole circuit in the frame, then write down the angle and the distance. **Later in [13.1](#131--the-after-photo-from-the-same-angle-and-distance-3-minutes):** the "after" photo from the same angle and distance (part of K1). A photo that shows the inside of your home doesn't go into Git.

<details>
<summary>Self-test answer key</summary>

1. **After an upload over USB, which shelf runs?** `app0`: an upload by cable fills that shelf and picks it for starting.
2. **Why does 1.6.0 refuse `update`?** Its contract has existed since Module 11, but the update code only arrives in 1.7.0.
3. **What's the difference between `POWERON` and `SW`?** `POWERON` = the power just came on or EN was pressed; `SW` = the program itself asked for it, for example with the `restart` command.

</details>

## 🏆 Quick Win: two shelves on your board (15 minutes)

> 🖥️ **Tools used:** **Arduino IDE** and the Serial Monitor (a USB cable to Node 1), the same 2.4 GHz Wi-Fi for the laptop and the board, and [its material](code/quick-win/program-shelf/README.md).

A small sketch prints the **program shelf** that's running, its state in the **shelf note** (`otadata`), and the other shelf. The shelf note = a slip of paper that the **shelf opener** (bootloader) reads at startup to pick a shelf. Then Arduino IDE **pushes** a second version over Wi-Fi (ArduinoOTA): the board moves from `app0` to `app1`.

> [!WARNING]
> **Practice only.** Node 1 is `Offline` until 1.6.0 is installed again by cable (Step 5): the sensors, the automatic lamp, and MQTT stop; Telegram messages are expected. The example password `change-this-password` must be changed before the first upload: while this sketch runs, anyone on your home Wi-Fi who knows the password can send a program.

> [!NOTE]
> **Compiled by the author, not yet run on a board:** 3 November 2026, `arduino-cli` 1.5.1, the esp32 package 3.3.12, the settings of Step 1; 0 errors, 0 warnings, `Sketch uses 950907 bytes (48%)`, `Global variables use 51520 bytes (15%)`, `.bin` 951,056 bytes, no extra libraries.

> 🔀 **Without a Kit** (also Wokwi): Steps 1–2 only, in Wokwi (Wi-Fi `Wokwi-GUEST`, Module 10); the numbers and the shelf note there haven't been tested by the author, and there's no network port.

### Step 1 — Read `program-shelf.ino`, fill in Wi-Fi and the ArduinoOTA password, then Upload by cable (4 minutes)

1. **Turn the MB102 off**, then move the USB cable from the charger to the laptop (the golden power rules: loads only from the MB102, not an ESP32 pin, with a shared GND). The MB102 stays off until Step 5: this sketch has no loads.
2. **File → New Sketch**, replace its contents with the sketch below, then save it (**Ctrl + S**) as `program-shelf` in the `learn-iot/module-28` folder. Read its comments (`step 2` = Step 3 here).

```cpp
// Module 28 - Quick Win: two program shelves on your board (practice only).
// Tools: ESP32 Dev Module, Partition Scheme Minimal SPIFFS, Flash Mode DIO.
#include <WiFi.h>
#include <ArduinoOTA.h>   // comes with the esp32 package: receives a program over Wi-Fi
#include <esp_ota_ops.h>  // comes with the esp32 package: the program shelves and the shelf note
#include "secrets.h"      // WIFI_NAME and WIFI_PASSWORD, the same as Module 10

const int VERSION = 1;  // step 2: change this number, then Upload through the network port

// The state of a shelf in the shelf note (otadata)
const char* stateName(esp_ota_img_states_t k) {
  switch (k) {
    case ESP_OTA_IMG_NEW: return "NEW, never started yet";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, trial period";
    case ESP_OTA_IMG_VALID: return "VALID, approved";
    case ESP_OTA_IMG_INVALID: return "INVALID, refused";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, cancelled";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, installed by cable";
    default: return "unknown";
  }
}

// The name of the restart reason, the same as Module 5
const char* reasonName(esp_reset_reason_t a) {
  switch (a) {
    case ESP_RST_POWERON: return "POWERON";
    case ESP_RST_SW: return "SW";
    case ESP_RST_BROWNOUT: return "BROWNOUT";
    case ESP_RST_PANIC: return "PANIC";
    case ESP_RST_INT_WDT: case ESP_RST_TASK_WDT: case ESP_RST_WDT: return "WDT";
    case ESP_RST_DEEPSLEEP: return "DEEPSLEEP";
    default: return "UNKNOWN";
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  const esp_partition_t* running = esp_ota_get_running_partition();       // the shelf that is running
  const esp_partition_t* other = esp_ota_get_next_update_partition(NULL);  // the next shelf
  esp_ota_img_states_t state = ESP_OTA_IMG_UNDEFINED;
  esp_ota_get_state_partition(running, &state);
  Serial.printf("\nVersion %d, last restart: %s\n", VERSION, reasonName(esp_reset_reason()));
  Serial.printf("Running shelf: %s (%s)\n", running->label, stateName(state));
  if (other == NULL || other == running) {
    Serial.println("No other shelf: choose Partition Scheme Minimal SPIFFS.");
    return;
  }
  Serial.printf("Other shelf: %s, %u bytes\n", other->label, (unsigned)other->size);
  Serial.printf("Room for a new program: %u bytes\n", (unsigned)ESP.getFreeSketchSpace());

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  if (WiFi.waitForConnectResult(20000) != WL_CONNECTED) {  // at most 20 seconds
    Serial.println("Wi-Fi not connected yet. Check the secrets.h tab.");
    return;
  }
  ArduinoOTA.setHostname("program-shelf");         // the board's name in Tools > Port
  ArduinoOTA.setPassword("change-this-password");  // MUST BE CHANGED to your own password before Upload
  ArduinoOTA.onStart([]() { Serial.println("New program arriving, written to the other shelf..."); });
  ArduinoOTA.begin();
  Serial.print("Ready to receive a program over Wi-Fi at ");
  Serial.println(WiFi.localIP());
}

void loop() {
  ArduinoOTA.handle();  // a program sent from the IDE?
}
```

3. Make a `secrets.h` tab (**⋯** → **New Tab**), then paste the contents of your Module 10 sketch's `secrets.h`; it must hold Node 1's current Wi-Fi: this sketch overwrites the Wi-Fi saved in NVS, which 1.6.0 uses again (according to the esp32 package's code). The `.gitignore` (Module 10 Practice 1) keeps it out of a commit.
4. Replace `change-this-password` with a new password just for this practice; put the example back before a commit.
5. The **Tools** menu: the board **ESP32 Dev Module**, **Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, **Flash Mode** → **DIO**, **Erase All Flash Before Sketch Upload** → **Disabled** (the key in NVS stays safe), the USB port. Click **Upload**. Stuck at `Connecting…`? Hold **BOOT** as soon as that text appears, and let go when `Writing at …` starts running.

### Step 2 — Serial Monitor: the running shelf `app0`, the note `UNDEFINED`, the other shelf `app1` (2 minutes)

Open the **Serial Monitor** (**115200 baud**); missed the first line? Press **EN**.

**What the Serial Monitor shows (text from the sketch; not yet recorded by the author on a board; an example IP):**

```text
Version 1, last restart: POWERON
Running shelf: app0 (UNDEFINED, installed by cable)
Other shelf: app1, 1966080 bytes
Room for a new program: 1966080 bytes
Ready to receive a program over Wi-Fi at 192.168.1.50
```

The upload by cable rewrote the shelf note: "start `app0`", state `UNDEFINED` (no trial period). `Room for a new program` (`ESP.getFreeSketchSpace()`) = the size of **the other shelf**, where the next program is written, so it equals the line above it.

### Step 3 — Change `VERSION`, choose the network port in Tools → Port, then Upload over Wi-Fi (4 minutes)

Change `const int VERSION = 1;` to `2`. Under **Tools → Port**, besides the USB port there should be a network port `program-shelf` with the board's IP (not tested by the author). Choose that port, click **Upload**, then type your ArduinoOTA password if asked. The old program that's still running writes the new program to the other shelf, then restarts the board. The Serial Monitor follows the selected port: after clicking **Upload**, choose the USB port again; this line (text from the sketch) may be missed:

```text
New program arriving, written to the other shelf...
```

The network port doesn't show up? Open the fold with the same title in [🚨](#-troubleshooting).

### Step 4 — The board starts from shelf `app1`, also after the EN button is pressed (2 minutes)

After the restart (text from the sketch; followed by two lines as in Step 2):

```text
Version 2, last restart: SW
Running shelf: app1 (VALID, approved)
Other shelf: app0, 1966080 bytes
```

`SW`: ArduinoOTA itself asked for the restart after writing. Version 2 is **valid right away** without proving anything: the Arduino core approves a new program before `setup()`. One `extern "C"` line in Node 1 1.7.0 turns that into a 60-second trial period ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c)). Press **EN**: `Version 2, last restart: POWERON`, still on `app1 (VALID, approved)`, because the shelf note points to `app1`.

### Step 5 — Install Node 1 1.6.0 again by cable: back to `app0` (3 minutes)

1. Choose the USB port again, then click **Upload** once more: `Running shelf: app0 (UNDEFINED, installed by cable)`, because every upload by cable rewrites the shelf note (1.6.0 itself doesn't print the shelf).
2. Open `node-1-home.ino` (the `main` branch) and click **Upload**: the Serial Monitor writes `Node 1 Home - firmware 1.6.0` (text from the code).
3. Move the USB cable back to the charger, and **only then** turn the MB102 on: Node 1's card is back `Online`.

**Pushed vs pulled:**

| | Pushed from the IDE (ArduinoOTA) | Pulled from the server (Node 1 1.7.0) |
| :-- | :-- | :-- |
| Who starts it | the laptop sends a program | the server gives the order over MQTT, the board downloads by itself |
| The same network? | yes (mDNS) | no, as long as the board can reach its server |
| Key | one password for anyone who knows it | a key per device |
| The file's fingerprint | MD5 from Arduino IDE, only checks that the delivery is whole | SHA-256 from the home server, checked before installing |
| Bad firmware | still valid, still used | a 60-second trial period, then back to the old version by itself |
| Many devices | one by one from the laptop | the canary first, then the rest (Concept 7) |
| Trail | none | the history on the **Fleet** screen |

> ➡️ **Next:** [Concept 1](#1-why-ota-is-a-must-a-device-on-the-roof) to [Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https) ([Concept 2](#2-two-shelves-and-a-slip-of-paper-app0-app1-otadata-and-the-shelf-opener): the two shelves you just saw), then [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-a-backup-and-account-notes-10-minutes) and [Practice 2](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes); Node 1 stays at 1.6.0 until [Practice 5](#practice-5--node-1-170-by-cable-for-the-last-time-25-minutes-needs-a-board). No box and expansion board yet? Read [Concept 11](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v), measure your board, then order them now for [Practice 12](#practice-12--from-breadboard-to-enclosure-90-minutes-needs-a-board-the-soldering-path-adds-60-minutes).

## 🧠 The "Why" Concepts

These eleven concepts don't need to be read all at once. Read them in between their practices:

1. The Quick Win (already done) → Concepts 1–6 → Practice 1 (the workbench) and Practice 2 (the server: contract 1.6, backend 1.5.0, the central broker)
2. Concepts 7–9 → Practice 3 (automatic broker accounts at the gateway) and Practice 4 (the Fleet screen with simulated devices). Practices 1–4 don't change Node 1's firmware; its USB cable is only used in 3.4 to type the new key in the Serial Monitor
3. Practices 5–8 (Practice 5 needs a board; without a Kit: 6–8 with the simulator): 1.7.0 by cable for the last time, uploading 1.7.1, the update without a cable, then rollback. Practice 9 is optional
4. Practice 10 (a new device with a claim code) → Concept 10 → Practice 11 (the `vitals` interval and deactivating a device)
5. Concept 11 → Practice 12 (from breadboard to enclosure) → 24 hours on → Practice 13

Concept 11 can be read any time before you buy the box and the expansion board. The file excerpts, commands, and tables in the concepts are just for reading; everything is typed and run in the practices.

Module 27 closed with two honest limits: Node 1's firmware is still uploaded over a USB cable, and Node 1 is still on the breadboard ([the end of Module 27](../module-27-deploy-internet-tls-pwa/README.md#-module-27-completion-checklist)). Concepts 1–4 take apart the update machinery inside the board: why it's a must, which shelf a new program is written to, how its download goes, and how failed firmware goes back to the old version by itself (rollback). Concepts 5–11 follow: versions, who may hand out firmware, many devices, and the box.

### 1. Why OTA is a must: a device on the roof

Imagine Node 1 is already installed in its box, on the ceiling near the water tank, or in your parents' house in another city. The old way, every fix means: take the box down, connect a USB cable to the laptop, click **Upload**, then install it again. For one board on the desk, that's five minutes. For ten boards in ten houses, that's ten visits: the cost of one update = the cost of one visit × the number of devices. The [Syllabus](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure) calls it **a device on the roof**: a device installed in a hard-to-reach place must be updatable without climbing up. The way to do it is called **over-the-air updates** (OTA): the new program comes over the network, not over a cable.

Why does firmware need updates? There are three reasons.

1. **Fixing mistakes.** A program without bugs hardly exists; some only show up after a device has worked for weeks.
2. **Closing security holes.** The OWASP list in [🔬 Module 20](../../phase-3-backend-data/module-20-user-security/README.md#-technical-deep-dive-optional) puts "over-the-air firmware updates without a check that they're genuine" under A08, and the OWASP IoT table in [Concept 10 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear) gives I4 (*Lack of Secure Update Mechanism*) the ⏳ mark for this module. A device that can't be updated carries its holes forever.
3. **The certificate root changes.** [Concept 6 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#6-certificates-in-full-chain-name-and-dates) already warned: if Let's Encrypt's root changes, the Pi only has to pull a new image, while an ESP32 with the root built in needs new firmware. Without OTA, that means climbing every roof in the same week.

However, the update door is also an attacker's way in: whoever can hand firmware to your board can take it over. Who may hand it out is discussed in [Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https).

**Five ways a program gets onto a board:**

| Way | Who starts it | In this curriculum |
| :-- | :-- | :-- |
| USB cable | you, from Arduino IDE | since Module 2; Node 1 1.7.0 is installed this way for the last time in [Practice 5](#practice-5--node-1-170-by-cable-for-the-last-time-25-minutes-needs-a-board) |
| Pushed from the IDE (ArduinoOTA) | a laptop on the same Wi-Fi, with one password | [🏆 Quick Win](#-quick-win-two-shelves-on-your-board-15-minutes) |
| **Pulled from the server** | the server gives the order over MQTT, the board downloads by itself from its home server | **our path** ([Concept 3](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period)): the board may be anywhere, as long as it can reach its server |
| Uploading through the WiFiManager portal | anyone connected to the portal | not used, but `192.168.4.1/update` is always registered while the portal is open, even though the **Update** button has been hidden since [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#d-verify-upload-and-connect-to-wi-fi); a password-protected portal ([5.2](#52--a-password-protected-portal-portal_password-in-keysh-3-minutes)) makes it reachable only by people who know the password |
| Over another radio (ESP-NOW) | another board nearby | not used: Node 2 stays on the cable ([Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota), [🔬](#-technical-deep-dive-optional) *OTA for Node 2 through an "update mode"*) |

**Right away, not a check every hour.** Another way: the board asks the server regularly, for example every hour, "Is there a new version?" The Syllabus chose the opposite: the server decides, and the MQTT command `update` starts the update **right away**. Node 1 never pulls the release list itself, so there's no wasted traffic, and you know exactly when every device was updated: when the admin presses **Update** on the **Fleet** screen.

This is the promise "can be updated remotely without a cable" on [the Syllabus's first page](../../SYLLABUS.md#after-completing-the-32-modules-you-will-be-able-to), and OTA is also part of the Phase 5 Checkpoint project ([Syllabus §8](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase)). Its limit: this week your devices can be updated and registered without a cable; server images that update automatically and automatic tests come in [Module 29](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically), service monitoring and automatic backups in [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data).

### 2. Two shelves and a slip of paper: `app0`, `app1`, `otadata`, and the shelf opener

In [Concept 10 of Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#10-the-price-of-wi-fi-a-bloated-program-a-locked-adc2-and-current-spikes), your board's 4 MB flash memory was divided into several **shelves** (partitions), "like a cabinet whose dividers were installed at the factory". The [Syllabus](../../SYLLABUS.md#module-10--wi-fi--http-devices-start-talking-to-the-network) set the **Minimal SPIFFS** scheme from that module on: two roomier program shelves, the second one promised for over-the-air updates in Module 28. In the Quick Win you already saw both at work. The cabinet's contents, from the lowest address:

| Start address | Shelf | Size | Its job |
| :-- | :-- | --: | :-- |
| `0x1000` | **the shelf opener** (bootloader) | — | a small program that starts first: it reads the shelf note, then runs the shelf it points to |
| `0x8000` | the partition table | — | the cabinet's floor plan: which shelf is at which address |
| `0x9000` | `nvs` | 20 KB | [a filing cabinet that doesn't forget](../../phase-1-esp32-embedded/module-08-robust-firmware/README.md#7-nvs-and-preferences-a-filing-cabinet-that-doesnt-forget): Wi-Fi, the device key, thresholds, the server address |
| `0xE000` | `otadata` = **the shelf note** | 8 KB | a slip of paper: which shelf is started, and the state of every shelf |
| `0x10000` | `app0` = the first **program shelf** | 1,966,080 bytes | the program |
| `0x1F0000` | `app1` = the second program shelf | 1,966,080 bytes | the program |
| `0x3D0000` | `spiffs` | 128 KB | the file shelf, not used by Node 1 |
| `0x3F0000` | `coredump` | 64 KB | the system's notes when a program crashes |

1,966,080 bytes = `0x1E0000`, which Module 10 wrote as 1.875 MB.

**Who picks the shelf?** Every time the board starts, the shelf opener reads the shelf note, then runs the shelf it points to. A program never "changes shelves" halfway: only the note changes, and that change only takes effect the next time the board starts.

**Uploading by cable.** Clicking **Upload** over USB writes four things: the shelf opener, the partition table, a shelf note saying "start `app0`", and the program on `app0`. That shelf's state is `UNDEFINED`: it may run unconditionally, without a trial period.

**An over-the-air update writes the other shelf.** The running program receives the new file piece by piece and writes it to the shelf that isn't in use, **the other shelf**, while it keeps running on its own shelf. The `Update` library (used by HTTPUpdate) keeps one trick: **the first 16 bytes** of the new shelf are written last, after the whole file has arrived and been checked. Only once the new shelf is whole is the shelf note changed to point to it. If the power goes out in the middle of a download, the shelf note still points to the old shelf, and the half-finished shelf isn't valid in the shelf opener's eyes either, because its first 16 bytes aren't there yet: the board starts again with the old program.

**NVS isn't erased.** Neither an update nor a rollback overwrites the contents of the `nvs` filing cabinet (they only add update notes, Concepts 3–4), so the new firmware uses the same Wi-Fi, broker key, thresholds, and server address right away, and so does old firmware that comes back.

**Does it fit?** One shelf = 1,966,080 bytes. Node 1 1.6.0 = 1,194,928 bytes (60%, the Module 21 record). Firmware 1.7.0 adds HTTPS with the package's built-in list of root certificates, HTTPUpdate, and three portal fields. The author's compile with the Module 10 settings: **about 1.41 million bytes (71% of one shelf)**, about 217 thousand bytes more than 1.6.0 compiled on the same machine. About 554 thousand bytes of the shelf are left, enough for the versions to come. You read the exact number yourself in [5.3](#53--upload-by-cable-then-read-the-program-size-against-the-1966080-byte-shelf-5-minutes); in your Arduino IDE it may differ by a few hundred bytes (the board name, the operating system, and the package's folder path are stored too), ±2.6 thousand bytes more if your `keys.h` holds the ESP-NOW key and the portal password. One more thing: `ESP.getFreeSketchSpace()`, whose name sounds like "space left", actually answers **the size of the other shelf**, where the next program will be written.

**Which file goes to the server?** **Sketch → Export Compiled Binary** ([6.2](#62--sketch--export-compiled-binary-whats-in-the-build-folder-3-minutes)) puts several files in the sketch's `build/` folder. Only one is used for over-the-air updates:

| File | Its contents | For the server? |
| :-- | :-- | :-- |
| `node-1-home.ino.bin` | **the firmware file**: the program only, starting with the byte `0xE9`. On the author's machine 1,411,824 bytes, a little bigger than the `Sketch uses` number, because it carries a header, padding, a checksum, and a SHA-256 digest at its end | **yes** ([6.3](#63--choose-node-1-homeinobin-not-mergedbin-then-compute-its-sha-256-3-minutes)) |
| `node-1-home.ino.merged.bin` | **the merged file**: the contents of the whole 4 MB flash from address 0, starting with the byte `0xFF` | no: always refused, because it's bigger than a shelf and its first byte isn't `0xE9` |
| `.bootloader.bin`, `.partitions.bin` | the shelf opener and the partition table | no |

**The cable again after an over-the-air update.** Because an upload by cable rewrites the shelf note, a board already running on `app1` goes back to `app0` as soon as you upload over USB. That's the `app0 (UNDEFINED, installed by cable)` in [Quick Win Step 5](#step-5--install-node-1-160-again-by-cable-back-to-app0-3-minutes) and, later, in Node 1's answer to the Serial `ota` command ([5.4](#54--o0-serial-ota-and-server-then-node-1s-card-at-version-170-with-reset_reason-5-minutes)). That's normal, not damage ([🚨](#-troubleshooting) *After an Upload by cable, the board goes back to shelf `app0`*). The version on the **Fleet** screen is still right, because the version is read from the `fw` the firmware sends, not from the shelf's name.

![Diagram of two shelves and a slip of paper (Concept 2): the 4 MB flash map of Node 1 with the Minimal SPIFFS scheme (min_spiffs.csv, esp32 package 3.3.12); 0x… = start address in hexadecimal. Top, drawn to scale: the first 64 KB (the shelf opener, the partition table, nvs, otadata), then app0 (ota_0, 0x10000, 1,966,080 bytes) and app1 (ota_1, 0x1F0000, 1,966,080 bytes), spiffs 0x3D0000 128 KB, coredump 0x3F0000 64 KB. In app0: Node 1 1.7.0 = 1,411,683 bytes (71% of a shelf; the author's compile); for comparison, Node 1 1.6.0 = 1,194,928 bytes (60% of a shelf; Module 21). The zoom: 0x0 empty, 0x1000 bootloader (the shelf opener), 0x8000 partition table, 0x9000 nvs 20 KB, 0xE000 otadata 8 KB. nvs: Wi-Fi, the device key, thresholds, server_address, not erased or overwritten by an update or a rollback; otadata = a slip of paper: which shelf runs, and its state. Middle, three practice states; the shelf opener reads otadata at every start. 1, the cable upload of 1.7.0: app0 1.7.0 running, UNDEFINED, no trial period; app1 not used; a cable upload writes the shelf opener 0x1000, the table 0x8000, otadata (boot_app0.bin) and app0, so the board always goes back to app0; 1.7.0 is the last firmware that must go by cable. 2, the over-the-air update 1.7.1: app0 1.7.0 UNDEFINED, the spare intact; app1 1.7.1 running, NEW then PENDING_VERIFY then VALID; the download goes to the other shelf, the first 16 bytes are written last, only then otadata points to app1: a half-written shelf never runs; a 60-second trial period, proven = VALID. 3, the test release 1.7.2 fails: the other shelf of app1 is app0, 1.7.0 overwritten by 1.7.2, marked INVALID because of the wrong key and the 60 seconds running out (a restart during the trial: ABORTED); app1 1.7.1 starts again and reports rollback through vitals.ota. Bottom: what goes to the server is node-1-home.ino.bin (first byte 0xE9, one shelf), not .merged.bin (4 MB, starts at 0x0) or .bootloader.bin; ESP.getFreeSketchSpace() = the size of the other shelf, not the free space left; a spare shelf needs a two-shelf scheme (Module 10); the scheme without OTA (No OTA, Huge APP): the command is accepted, then the update failed (Update 10).](assets/two-shelves-otadata.png)

### 3. HTTP OTA step by step: from the `update` command to the trial period

The contract has named `update` since [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#5-the-data-contract-five-topics-and-one-json-shape-for-everything), but Node 1 1.6.0 answers it with `action update not supported yet (Module 28)` ([🔁 Step 3](#step-3--the-contract-already-names-update-the-firmware-doesnt-yet-action-update-not-supported-yet-module-28)). Data contract 1.6 ([2.1](#21-contract-15--16-update-vitals-configintervals-and-claim-codes-5-minutes)) spells it out, and Syllabus v1.0.30 updates the old example of Appendix A (`1.1.0`, without `sha256`) to this shape. An example from section 7 of [`DATA-CONTRACT.md`](code/DATA-CONTRACT.md):

```json
{"id":"c-20261031-010147-2","ts":"2026-10-31T01:01:47Z","action":"update","version":"1.7.1","url":"https://iot.yourname.my.id/fw/node-1/1.7.1.bin","sha256":"9f2c…(64 hexadecimal digits)…","size":1196032}
```

`sha256` is the fingerprint of the file's contents (the same as the output of `sha256sum`), and `size` is its length in bytes. The `size` number in that contract example equals the size of the author's lab fake file; your 1.7.1 file is about 1.41 million bytes. [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#9-message-size-the-256-byte-container-that-silently-throws-things-away) once estimated this command at about 170 bytes. With `sha256` and `size`, the longest command the contract allows (`id` 39 characters, `url` 200 characters) becomes 451 of the 512 bytes of an MQTT packet (computed by the author in the host tests): it still fits in Node 1's `setBufferSize(512)` container.

**QoS 1, never retained.** Node 1 remembers a command's `id` only while it's running ([rule 8 of Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract)), and after an update it does restart. An `update` command stuck on the broker would be handed over again every time Node 1 connects, while a freshly started Node 1 has already forgotten its `id`: as soon as its version differs (for example after a rollback), the same update starts again, over and over. The home server sends `update` without the retained flag; never tick **Retain** for it in MQTTX.

**Checked first, then answered.** Before answering, Node 1 checks the command's contents without downloading anything (`ota-check.cpp`):

- not in the trial period, and no other update running;
- `version` shaped x.y.z, **different** from the running version, and not below 1.7.0 (Concept 4);
- `sha256` exactly 64 lowercase hexadecimal digits, and `size` fits on the other shelf;
- `url` **exactly** equal to `<stored server address>/fw/node-1/<version>.bin`. That server address is stored on Node 1 itself (the Wi-Fi portal, the Serial `server` command, or a claim), not taken from the sender of the command, because the download carries the device key ([Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https));
- `http://` only to a home IP address (`10.x`, `172.16–31.x`, `192.168.x`); on the internet always `https://`.

All passed: `ack` `ok:true`. One failed: `ok:false` + its reason, and nothing is downloaded. Under rule 4, every command is answered within 5 seconds, while a full update (download, write, restart, trial period) takes much longer. So `ok:true` for `update` means **accepted, not finished**; the final result comes later, in `vitals`.

**After `ok:true`**, in the next pass of `loop()` (`ota-update.cpp`):

1. **The plan is written to NVS** (`id`, the version from, the version to), so whichever firmware starts after it knows what to report.
2. **The pump and the buzzer turn off**; the lamp, the fan, and the curtain stay in their last state. While downloading, `loop()` stops going round, so [Module 19's local safety rules](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#10-local-safety-node-1-guards-the-house-when-the-server-is-gone) stop too. That's the honest price of an update ([7.4](#74-what-happens-on-the-board-while-it-downloads-the-led-the-pump-and-the-buzzer-3-minutes)).
3. **Stopped on purpose.** Node 1 publishes the status `offline-mode` (retained, QoS 1), then disconnects from the broker **cleanly** (a DISCONNECT message). The broker doesn't publish the `offline` will for a cleanly closed connection, so the dashboard shows the badge `stopped on purpose`. This is the third status that has been "kept for Module 28" since Module 19. Keep these three apart: **stopped on purpose** (`offline-mode`, says goodbye first), **disconnected** (`offline`, the will from the broker), and **offline mode** (Module 19: the broker can't be reached, the local safety rules work).
4. **The [watchdog](../../phase-1-esp32-embedded/module-08-robust-firmware/README.md#8-the-watchdog-a-guard-that-restarts-a-stuck-program) is loosened** from 5 to 60 seconds: connecting to the server and waiting for its answer alone may take 8 seconds. While the file flows, the watchdog is fed every 4 KB. The OLED screen writes `FIRMWARE UPDATE`, the target version, a percentage, and `don't unplug power`, or `UPDATE FAILED` when it fails (text from the code).
5. **A locked download.** HTTPUpdate sends a `GET` to the address checked earlier over HTTP/1.0, carrying the `device_id` and the device key (Module 21) as when it logs in to the broker (Basic Auth: a username and a password in the HTTP header, `device_id:key`), the header `x-ESP32-STA-MAC` (the board's Wi-Fi MAC), `x-ESP32-version` (the running version), and a few other `x-ESP32-*` headers. The home server answers `200` + `Content-Length` (the file), `403` (a wrong key or MAC, or a deactivated device), `404` (the version doesn't exist or was withdrawn), or `304` (the requested version equals the running one; a second safeguard, because Node 1 already refuses it before the `ack`).
6. **Writing to the other shelf.** HTTPUpdate checks that the size fits and the first byte is `0xE9`, then writes per 4 KB while computing the SHA-256. Its fingerprint must equal the `sha256` in the command; only then are the first 16 bytes written and the shelf note pointed at the new shelf (Concept 2).
7. **A restart** (the next `reset_reason` is `SW`), then the 60-second **trial period** (Concept 4). Passed: `online`, then `vitals` carries the new `fw` and the `ota` report `succeeded`, repeated in at most 3 `vitals` because `vitals` (QoS 0) can get lost.

**Failure before the restart** (the server refuses, the file is broken, the connection drops): the old shelf keeps running without a restart, the watchdog goes back to 5 seconds, Node 1 reconnects (`online`), then `vitals` carries the report `failed` with a sentence on the cause (at most 80 characters). If Node 1 does restart in the middle of a download (the power goes out, or an `http://` download stops until the 60-second watchdog runs out), it starts with the old shelf intact, then reports `failed`.

You see this sequence on the **Fleet** screen in [7.3](#73--update-170--171-stopped-on-purpose-downloading-then-succeeded-6-minutes). The author tested it with the device simulator (the real 1.7.1 file compiled by the author, only downloaded and checked, not run): the `ack` 5 ms after the `cmd`, the card `succeeded` 5.5 seconds after the click. Those are simulator numbers on one machine, not an ESP32 over Wi-Fi; how long it takes on a real board is not measured by the author.

![Sequence diagram of an over-the-air update (Concept 3), Node 1 1.7.0 to 1.7.1: the server gives the order, the device downloads over HTTP, not MQTT. Lifelines: Admin (/fleet, dashboard 1.4.0), Home server (backend 1.5.0 + Caddy /fw/*), Broker (Pi gateway or center), Node 1. The admin clicks Update, then Yes, update (POST /api/devices/:id/update). The server sends the cmd action update (version, url, sha256, size) through the broker, QoS 1, never retained; status sent. Step 1, Node 1 checks without downloading: not in the trial period, no other update; a version not running and not below 1.7.0; sha256 64 hex digits, size fits the other shelf; url = the stored server address + /fw/node-1/version.bin; http:// only to a home IP. ack ok:true = accepted, not finished, within 5 seconds (ok:false + message = rejected); status accepted. Step 2, getting ready: the plan in NVS, pump and buzzer off, status offline-mode retained, then a clean DISCONNECT, the offline will not published (the badge stopped on purpose), the watchdog 5 to 60 seconds. Node 1: GET server address/fw/node-1/1.7.1.bin HTTP/1.0 with Basic device_id:key, x-ESP32-STA-MAC, x-ESP32-version 1.7.0, over Wi-Fi and the router, not through the broker. The backend checks (Caddy only forwards): wrong key or MAC 403, a missing or withdrawn version 404, the same version 304, a match 200 + Content-Length + x-SHA256; status downloading. Step 3, HTTPUpdate writes the other shelf: Content-Length fits (-100), first byte 0xE9 (-106), the watchdog fed every 4 KB, SHA-256 = the command sha256 (Update 15), the first 16 bytes last, then otadata switches shelves. Step 4, restart (reset_reason SW), the 60-second trial: broker, online, cmd subscription, valid. Node 1: online, then vitals fw 1.7.1 + ota result succeeded (at most 3 vitals); status succeeded; Socket.IO ota changes the card without a reload. Bottom left, failed before switching shelves: the old shelf stays, vitals.ota failed + message: 404 (-102), 403 (-103), a 308 redirect (-104), wrong content (-106), wrong SHA-256 (Update 15), server silent 8 seconds (-11), stuck https 30 seconds (Update 6); stuck http: the 60-second watchdog, failed: restarted while downloading (WDT). Right: failed after switching = rollback; an offline device refused 409, not queued; no word for 10 minutes = expired; simulated lab (simulator; 1.7.1 real, not run) ack 5 ms, succeeded 5.5 seconds after the click; the board not measured yet.](assets/http-ota-flow.png)

**Error codes as a diagnostic language.** A `failed` report names the HTTPUpdate code at the end of its sentence. The exact texts from `ota-update.cpp` (not yet recorded by the author on a board):

| The sentence in a `failed` report | What it means |
| :-- | :-- |
| `file bigger than the program shelf (-100 HTTP_UE_TOO_LESS_SPACE)` | the file doesn't fit on the other shelf |
| `the server gave no Content-Length (-101 HTTP_UE_SERVER_NOT_REPORT_SIZE)` | the server didn't give the file's length (its delivery is compressed or sent in chunks) |
| `file not on the server: 404 (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)` | that version doesn't exist or was already withdrawn |
| `download refused by the server: 403 (-103 HTTP_UE_SERVER_FORBIDDEN)` | a wrong key or MAC, or a deactivated device |
| `server answer not 200/304/403/404 (-104 HTTP_UE_SERVER_WRONG_HTTP_CODE)` | another code, including a `308` redirect from `http://` to `https://`: HTTPUpdate doesn't follow redirects |
| `first byte not 0xE9 or not arrived yet (-106 HTTP_UE_BIN_VERIFY_HEADER_FAILED)` | what arrived isn't an ESP32 program (for example a web page), or over `http://` its first byte arrived late |
| `server silent 8 seconds before answering (-11 HTTPC_ERROR_READ_TIMEOUT)` | the server doesn't answer; only happens **before** the answer's headers arrive |
| `download stopped halfway: 30 seconds without data (Update 6 UPDATE_ERROR_STREAM)` | the data stopped in the middle of the file over `https://`; no restart |
| `restarted while downloading (WDT)` | the data stopped in the middle of the file over `http://`: the 60-second watchdog restarts Node 1 |
| `power lost while downloading` | the power went out in the middle of a download |
| `SHA-256 doesn't match the command (Update 15 UPDATE_ERROR_SHA256)` | the file's contents differ from what the command meant, even by one byte |
| `server: no update (304, HTTP_UPDATE_NO_UPDATES)` | the second safeguard, the `304` of step 5 |
| `can't connect to server (-1)` | a wrong server address, the server is down, or the HTTPS certificate is refused (the details follow behind it) |

The cures per code are in [🚨](#-troubleshooting), in the group **Download `failed`**.

### 4. Rollback that really works: a 60-second trial period and `extern "C"`

The Syllabus states the requirement firmly: new firmware only counts as valid after it has connected to MQTT and published within 60 seconds; if not, the board goes back to the old version. New firmware is treated like a new employee on a trial period: it only gets the job if it proves within a set time that it can do the work. This module calls it **the trial period**. Besides pointing to a shelf, the shelf note records the state of every shelf:

| State | What it means |
| :-- | :-- |
| `NEW` | just written over the air, never started yet |
| `PENDING_VERIFY` | **the trial period**: the shelf opener marks it when that shelf starts for the first time |
| `VALID` | proven, used from now on |
| `INVALID` | the firmware itself declared failure and then restarted; the shelf opener goes back to the old shelf |
| `ABORTED` | the board restarted while that shelf was still in its trial period; the shelf opener cancels it and goes back to the old shelf |
| `UNDEFINED` | installed by cable, without a trial period (Concept 2) |

**The silent trap.** The shelf opener of the esp32 package 3.3.12 is already built with rollback support (the author confirmed it from three separate sources, including the contents of the shelf opener's binary). The problem is in the Arduino core. Before `setup()` runs, the Arduino core asks the function `verifyRollbackLater()`: "do you want to prove it yourself later?" Its default answer is `false`, so new firmware is marked `VALID` right away, before it has had a chance to try the broker. Even firmware with a wrong broker key counts as valid, without any message, and the board never goes back. You already saw the symptom in [Quick Win Step 4](#step-4--the-board-starts-from-shelf-app1-also-after-the-en-button-is-pressed-2-minutes): version 2 was `VALID, approved` right away.

**The cure is one line** in `trial-period.cpp` (you read the whole file, with a comment for every step, in [5.1](#51--the-esp32-package-3312-the-minimal-spiffs-scheme-and-firmware-170-with-trial-periodcpp-8-minutes)):

```cpp
extern "C" bool verifyRollbackLater() {
  return true;
}
```

The answer `true` = "yes, I'll prove it myself": the new firmware itself holds the decision. Why `extern "C"`? The default function is written in C, while C++ quietly changes the name of every function when it compiles. Without `extern "C"`, our function is registered under another name and doesn't replace the default one. The author proved it on 3 November 2026: without `extern "C"`, the compile still succeeds without a warning, but our function doesn't make it into the firmware: the default `false` is used (the author's compile). Even the program's size is exactly the same, so there's no sign at all. Never delete or change this line; how to check it is in [🔬](#-technical-deep-dive-optional) *Name mangling and `extern "C"`*.

**The validity rule** (rule 13 of `DATA-CONTRACT.md` = rule 15 of Appendix A): within **60 seconds of starting**, the new firmware must connect to the broker (its key accepted), then send `online` and the `cmd` subscription. As soon as that happens, the firmware marks itself `VALID` and prepares the report `succeeded`. If 60 seconds pass without it: (1) the `rollback` report is **saved first** in NVS, because after the restart it's the old firmware that's alive; (2) the firmware marks itself `INVALID` and restarts (that mark can fail without a restart, so its return value is checked and a plain `ESP.restart()` is the backup; a shelf that hasn't proven itself is still cancelled, `ABORTED`); (3) the old firmware starts, sends that report in `vitals`, and the **Fleet** screen writes `back to the old version (rollback)`.

**Two kinds of broken firmware, two catchers.**

- **Crashing or getting stuck** (panic, watchdog): the board restarts in the middle of the trial period, and the shelf opener cancels its shelf (`ABORTED`). Firmware that gets stuck in `setup()`, for example waiting for a sensor forever, is caught too: during the trial period, a 75-second watchdog already watches `setup()`.
- **Running but blind**: the program runs, but never connects (a wrong broker key or address). Its catcher is the 60-second timer (`INVALID`). The test release 1.7.2 in [Practice 8](#practice-8--deliberately-broken-firmware-goes-back-to-the-old-version-by-itself-25-minutes) is this kind on purpose: `TEST_WRONG_KEY = 1` breaks the broker key in RAM only, NVS isn't touched, so the old firmware that comes back still uses its real key.

**Honest properties.**

- A restart of **any** kind in the middle of the trial period cancels the new firmware, even if that firmware is actually good: a power cut, the `restart` command, a brownout. A router or Pi that's down for more than 60 seconds cancels it too, because the broker can't be reached (during the trial period, Wi-Fi is retried every 10 seconds, not 60). The direction is always safe, to the old version, but your update is lost: repeat **Update** after the power and the network are stable.
- During the trial period, the Wi-Fi portal isn't opened, `update` is refused (`still in the 60-second trial period`), and so is a claim.
- "The old version" = the version **before that update**. In Practice 8, 1.7.2 fails and Node 1 goes back to 1.7.1, not to 1.7.0 or 1.6.0.
- Versions below 1.7.0 can't be sent over the air: that firmware has no trial period and can't receive `update` again, so Node 1 refuses with `versions below 1.7.0 have no rollback: install by cable`.
- Only "can still connect and publish" is protected. A crash after the firmware is proven (even within 60 seconds) or a sensor read wrongly isn't rolled back; fix it with the next version, over the air.
- Firmware rollback is different from the "rollback" of the button in [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#2-optimistic-ui-show-it-first-roll-back-on-failure-and-when-not-to-be-optimistic): there, the optimistic button goes back to its old state; here, the board goes back to the old program shelf.

The author tested this trial-period and rollback logic on the laptop with a stand-in shelf opener (13 scenarios, 127 checks passed), and the firmware was compiled: its symbol list contains exactly one `verifyRollbackLater` of our own (the letter `T`, discussed in 🔬), so rollback is on. It hasn't been run by the author on a real board. In the simulator lab, rollback finished 70.4–70.5 seconds after the click (±5 seconds of simulated restart, 60 seconds of trial period, ±5 seconds more). How long a rollback takes on a board is not measured by the author: write your number down in [➕ F](#f-save-your-study-notes-the-proof-from-o0-to-p1-the-beforeafter-photos-and-your-boards-numbers).

![Diagram of the rollback state machine (Concept 4): the program shelf state is recorded in otadata (ESP-IDF v5.5.5), not in the .bin file; new firmware must prove itself within 60 seconds. From the left: NEW (newly written over the air, never started), starts, PENDING_VERIFY (the shelf opener marks it at the first start), then the Arduino core asks verifyRollbackLater() before setup(). The red dashed box: the default false = VALID at once before setup(), even a wrong key is valid, no message, no rollback. The answer true (Module 28): the firmware runs its own 60-second trial, the line extern C bool verifyRollbackLater() return true; trial-period.cpp: without extern C the compile still succeeds with no warning, but our function does not get into the firmware: the default false is used (the author's compile). UNDEFINED: by cable, no trial period. Three results on the right. VALID: within 60 seconds of starting, connected to the broker (key accepted) + online published + cmd subscription, the firmware marks itself valid. INVALID: 60 seconds run out without that (wrong key, broker unreachable), the rollback report saved first, marked invalid, restart. ABORTED: restarted in the middle of the trial (crash, watchdog, power loss, restart), the shelf opener cancels it at the next start. INVALID and ABORTED lead to Rollback: the old shelf starts, the old firmware reads its note in NVS (report or plan), vitals.ota result rollback, the dashboard: back to the old version. Bottom left, two kinds of broken firmware: crashes or hangs (panic, stuck in setup(), the 75-second trial-period watchdog), caught by the shelf opener (ABORTED), reports restarted during the trial period (PANIC) or power lost during the trial period; runs but blind (the test release 1.7.2, TEST_WRONG_KEY = 1: the key broken in RAM, the broker refuses), caught by the 60-second timer (INVALID), report not connected to the broker within 60 seconds. Bottom: any restart during the trial period = cancelled; a broker unreachable for 60 seconds (router or Pi off) cancels good firmware too, repeat Update; during the trial period Wi-Fi is retried every 10 seconds, the portal is not opened, another update is refused (still in the 60-second trial period); proven = key accepted, online published, cmd subscription sent; later faults not covered; simulated lab (simulator): rollback 70 seconds after the command (5 + 60 + 5); rollback on a real board not tested by the author.](assets/rollback-state-machine.png)

> ⬆️ **Done reading Concepts 1–4?** Continue to [Concept 5](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest) and [Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https): both are used in [Practice 2](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes). [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-a-backup-and-account-notes-10-minutes) (the workbench) can be done right now too.

### 5. Versions and SemVer: `FIRMWARE_VERSION`, `fw`, and the release list (manifest)

To be able to write "Node 1 needs an update", the server compares the version running on the board with the latest version on the server. Both are written with the **SemVer** rules, and each has one source.

**One source on the board: `FIRMWARE_VERSION`.** The firmware version is written in one place, the line `const char FIRMWARE_VERSION[] = "1.7.0";` in `config.h`. Node 1 sends it as `fw` in every `telemetry` since [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#5-the-data-contract-five-topics-and-one-json-shape-for-everything), and from 1.7.0 on also in every `vitals`, together with `reset_reason` ([Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason)). The application description the esp32 package builds into every `.bin` (`esp_app_desc`) doesn't help: in Arduino its contents are the same for every sketch of package 3.3.12 (the name `arduino-lib-builder`, version `6671d0b`). The server doesn't read the version from the `.bin`'s contents either, so the version you type when uploading must equal that file's `FIRMWARE_VERSION` ([6.1](#61--the-171-constants-in-configh-firmware_version-and-version_note-2-minutes), [6.4](#64--upload-firmware-on-the-fleet-screen-release-171-with-the-same-fingerprint-5-minutes)).

**Three numbers, three meanings.** SemVer (Semantic Versioning) writes a version as `MAJOR.MINOR.PATCH`. Which number goes up tells you how big the change is:

| Number | Goes up when | In this project |
| :-- | :-- | :-- |
| PATCH (the third) | a small fix, no new ability | 1.7.0 → 1.7.1 (practice: only two constants change) |
| MINOR (the second) | a new ability, the old ones still work | 1.6.0 → 1.7.0: OTA, the trial period, claim codes |
| MAJOR (the first) | a change that forces other parts to change too | hasn't happened in this project yet |

An honest note on MINOR: backend 1.4.0 refuses the `vitals` of 1.7.0 (it doesn't know the new fields), so the server is installed first ([Practice 2](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes)), and the firmware only in Practice 5.

**One version, one file, forever.** A second upload with the same version is answered with `409` `node1 1.7.1 already exists: a version can't be overwritten. Raise FIRMWARE_VERSION, build again, then upload with the new version` (the author's lab). If its contents could be replaced silently, two boards that both report `1.7.1` could be running different programs. So a version that's been used isn't used again: 1.7.2 becomes the deliberately broken test release in [Practice 8](#practice-8--deliberately-broken-firmware-goes-back-to-the-old-version-by-itself-25-minutes), so the next real firmware is 1.7.3. No leading zeros either: `1.07.1` is refused, because as numbers it equals 1.7.1, but as text it's different.

**Comparing versions: part by part, as numbers.** 1.10.0 is newer than 1.9.0, but compared character by character the result is the reverse (`1.1…` loses to `1.9…`). A small function, `compareVersions()`, splits a version into three numbers, then compares them from the left: MAJOR, MINOR, PATCH. A function with the same name lives in the backend (`backend/src/services/version.ts`) and in the firmware (`version.cpp`), without the npm package `semver`. The backend uses it to pick the `latest`, to mark `needs update`, and to refuse a downgrade unless the admin ticks **Allow downgrade**; Node 1 uses it to refuse versions below 1.7.0, which have no trial period yet (`versions below 1.7.0 have no rollback: install by cable`). You write the backend function's body yourself in [🧩 Level 2](#level-2--compareversions-and-the-needs-update-badge-fill-in-the-blanks-20-minutes).

**The release list (manifest) is made by the server from the database.** A manifest is a list of the available firmware versions, with their sizes and fingerprints. HTTPUpdate has no official format for it, and a hand-written list file can differ from what's in the cupboard, so the server builds it every time it's asked, from the `firmware` table (migration 011): version, size, SHA-256, notes, test, and withdrawn. Bruno's `firmware release list` (`GET /firmware`) and the **Firmware releases** section on the **Fleet** screen show it: `latest` = the highest version that isn't a test and isn't withdrawn, and every release carries the canary counts and `can_update_all` with its reason ([Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota)). Node 1 itself never reads this list and doesn't ask "is there a new version?" every hour ([Concept 1](#1-why-ota-is-a-must-a-device-on-the-roof)): the server compares every card's `fw` with `latest`, writes the badge `needs update`, and only sends `update` when the admin presses **Update** ([Concept 3](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period)). The extra safeguard on the download route: if the requested version equals the running version (the `x-ESP32-version` header from HTTPUpdate), the server answers `304` without content, so the same file isn't installed twice.

**Test releases and withdrawn releases.** Ticking **test** when uploading makes a **test release**: only for one device, through **Update** on its card, never for many devices, and never counted as `latest`. A **withdrawn** release isn't sent and can't be downloaded anymore (`404`), while its file stays in the cupboard. The **Fleet** screen has no withdraw button yet: use Bruno's `withdraw test release` (change the version 1.7.2 in its path for another release).

**Its limit.** SemVer for the whole project, a `CHANGELOG`, and version tags are covered in full in Module 29.

### 6. Who may hand out firmware: keys, fingerprints, and HTTPS

Whoever can install firmware on Node 1 holds its relays, its pump, and its keys. That's why updates without safeguards are on two OWASP lists you already know: A08 "Over-the-air firmware updates without a check that they're genuine (Module 28)" in [🔬 Module 20](../../phase-3-backend-data/module-20-user-security/README.md#-technical-deep-dive-optional), and I4 "no safe way to update the firmware" (⏳) in [Concept 10 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear). This week, the firmware file's path is guarded in three places:

1. **Only the admin puts files there.** The **Upload firmware** form on the **Fleet** screen is for admin accounts only. The server checks the first byte `0xE9` (an ESP32 application file, [Concept 2](#2-two-shelves-and-a-slip-of-paper-app0-app1-otadata-and-the-shelf-opener)) and a size of at most one shelf (1,966,080 bytes), computes its SHA-256 itself, then stores it in the new Compose cupboard `firmware-data`. That cupboard is only mounted on `backend`, not on `web`: Caddy never serves a firmware file directly.
2. **Only registered devices download, with their own key.** The backend route `GET`/`HEAD /fw/node-1/<version>.bin` asks for Basic Auth `device_id:key` (its broker key; [7.6](#76-a-locked-download-with-curl---http10-optional-2-minutes)) and checks it with `matchKey` from [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#13-keys-and-their-fingerprints-srcauthkeyts-5-minutes), keeping the promise of the comment in `backend/src/auth/key.ts`: "later for HTTP too, for example downloading firmware in Module 28". The `x-ESP32-STA-MAC` header must equal the `device_id`, a deactivated device is refused with `403`, a withdrawn release with `404`, and one IP address gets at most 120 downloads per minute.
3. **Caddy only passes it on.** The `handle /fw/*` block in the Caddyfile of dashboard 1.4.0 passes downloads on to the backend as they are, without compression (HTTPUpdate uses HTTP/1.0 and needs `Content-Length`), and Caddy checks it **before** the page fallback. Without that block (the Module 27 Caddyfile, the author's lab), `/fw/…` is answered with `200` holding the dashboard page, and HTTPUpdate stops with `-106` (the first byte isn't `0xE9`), not `-102` (the file doesn't exist).

**Why a `.bin` file must not be public.** That file isn't only the program: the contents of `keys.h` are compiled in, namely the ESP-NOW key (Module 14, when `USE_ENCRYPTION = true`) and the portal password `PORTAL_PASSWORD` ([Concept 8](#8-a-new-device-in-1-minute-identity-claim-codes-and-automatic-broker-accounts)), readable with the `strings` tool (tested by the author), plus the package's folder path on the computer that built it, which usually contains your username. So a `.bin` doesn't go into Git (`.gitignore` guards `*.bin` and `build/`) and isn't shared on a forum, with an AI, in an issue, or through a public link. Node 1's broker key, on the other hand, is **not** in the `.bin`: it lives in the board's NVS (Module 21).

**The file's fingerprint: intact, not "genuine".** The `update` command carries the `sha256` the server computed when the file was uploaded. Node 1 hands it to `setSHA256sum()` (new in package 3.3.12); a file that differs by even one byte doesn't match and is refused before the shelf note changes (`Update 15 UPDATE_ERROR_SHA256`, the old shelf keeps running; the author's lab, simulator, [8.5](#85-a-fingerprint-that-doesnt-match-failed-without-a-restart-optional-3-minutes)). The fingerprint guarantees **integrity**: what arrives is the same as what was uploaded. It isn't a signature, because it doesn't prove **who** made it: whoever holds a dashboard admin account can upload any firmware, and its fingerprint still "matches". Signed firmware, promised in [🔬 Module 14](../../phase-2-connectivity/module-14-node-2-esp-now/README.md#-technical-deep-dive-optional), is in the [🔬](#-technical-deep-dive-optional) fold *Signed firmware …*. In Module 21's OWASP IoT table, I4 now moves up from ⏳ to 🟡: locked, fingerprinted, and able to go back by itself, but not signed yet.

**Only from its own home server.** The `update` command may be sent by any account allowed to write `msh/+/cmd`: `backend`, and `nodered` since Module 13. Because the download carries the device key, the `url` in the command must be exactly `<stored server address>/fw/node-1/<version>.bin`, with the server address you fill in yourself through the portal or Serial (the NVS label `server_address`). Any other `url` is answered with `ack` `ok:false` `url is not this home's server`, and the key isn't sent anywhere. In the author's lab (simulator), a fake command in the name of `nodered` was refused like that, and its fake server didn't get a single request. The honest limit: that account can still tell Node 1 to install another release that **exists** on the home server, for example an old version that hasn't been withdrawn. Guard the `nodered` password, and withdraw bad old releases ([Concept 5](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest)).

**A [sealed envelope](../../phase-2-connectivity/module-10-wifi-and-http/README.md#8-https-and-setinsecure-a-sealed-envelope-whose-courier-isnt-checked) on the internet, a postcard only at home.** On the main path, Node 1 downloads straight from the VPS (not through the bridge), so its address is `https://`. Firmware 1.7.0 checks the server's certificate with the **esp32 package's built-in list of root certificates** (`useBuiltinCACertBundle()`), which holds both ISRG Root X1 and X2: an RSA chain (ending at X1) and an ECDSA chain (ending at X2) from [Concept 6 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#6-certificates-in-full-chain-name-and-dates) are both recognized. That's the answer to Module 27's promise about a changing root: Node 1 doesn't depend on one root, and a newer list will arrive later over the air with new firmware, while the old root is still valid. What's checked is the certificate's chain and name, not its validity dates (the setting of package 3.3.12; not yet tested by the author on a board; [🔬](#-technical-deep-dive-optional)), so Node 1 doesn't need to wait for the internet time before downloading. `http://` is only allowed to an IP address on the home network (`10.x`, `172.16–31.x`, `192.168.x`): the key travels in the clear, just like MQTT 1883 on the LAN, while the file's integrity is still guarded by SHA-256. Node 1 refuses `http://` to other addresses (`http only for the home network`), and the backend refuses to start with such a server address (`SERVER_URL`).

**The free-path Pi: the device door 8081.** On the free path, the dashboard is opened through the Cloudflare tunnel, but Node 1 downloads firmware and exchanges claim codes straight from the Pi's IP (`http://192.168.1.37`). So that the dashboard isn't opened in the clear on the home Wi-Fi too, the Caddyfile has a **device door** `:8081` that only serves `/fw/*` and `/api/provision/claim`; other paths are answered with `404` `This door is only for devices (firmware downloads and claims). Dashboard: your tunnel's https address.` (the author's lab). `WEB_INNER_PORT=8081` in the Pi's `.env` connects the Pi's port 80 to that door, so the server address in the portal stays `http://192.168.1.37`, without `:8081` ([2.3](#23--the-infrastructure-files-and-the-central-machines-env-mosquitto_dynsec_password-and-server_url-6-minutes)). This door doesn't trust the `X-Forwarded-For` header, so the rate limits for claims and downloads are counted per device's real address. The author's lab: the 1.7.1 download through this door took 85 ms (simulator, not an ESP32 over Wi-Fi).

![Diagram of who may hand out firmware (Concept 6): the .bin file flows along one guarded road from the admin to the other shelf of Node 1. A table: place, guard, what is refused (exact wording). 1, the admin on /fleet (dashboard 1.4.0): only an admin account may upload (login cookie); viewer 403, no login 401. 2, the backend accepts (POST /api/firmware/node1/:version): the first byte must be 0xE9 (an ESP32 app image), at most 1,966,080 bytes (one shelf), a body over 2 MiB refused, one version one file, SHA-256 computed by the server; refused 400 not an ESP32 app image, 400 too big, 413, 409 a version can not be overwritten. 3, the firmware-data cupboard of the backend: mounted only on the backend, not on web, Caddy does not serve it; not in Git (*.bin, firmware-data/, firmware/**/build/), because the Node 1 .bin holds what keys.h holds (the ESP-NOW key, the portal password); no public address. 4, the route /fw/node-1/version.bin, Caddy forwards to the backend: Basic device_id:key matched (matchKey, Module 21), x-ESP32-STA-MAC must equal device_id, a deactivated device refused, a withdrawn release not served, 120 requests per minute per IP, the same version as x-ESP32-version: 304 without content; refused 403 needs Basic Auth device_id:key, 403 wrong key or already deactivated, 403 x-ESP32-STA-MAC missing, 404 firmware 9.9.9 does not exist. 5, Node 1 1.7.0: url = the stored server address + /fw/node-1/version.bin; https:// + the built-in CA bundle (with ISRG Root X1 and X2): chain + name; http:// only to a home IP; the file SHA-256 = the command sha256; versions below 1.7.0 refused; wording: url is not this home's server, http only for the home network, SHA-256 does not match the command, versions below 1.7.0 have no rollback. Then into the other shelf. Who tries (simulated lab: simulator; 1.7.1 real + fake files): a stranger who knows the /fw address, the device key (403); another board as Node 1, key + MAC (403); a fake cmd update to another server, Node 1 refuses, the key is not sent; a file changed by one byte, the SHA-256 fingerprint, the old shelf stays; an eavesdropper, https, http only on the home Wi-Fi; another device account reading the cmd of Node 1, the default read permission = deny. Bottom: SHA-256 is not a signature, the backend and Node-RED may give the command, only for a file on that home server; digital signatures in the Technical Deep Dive; HTTPS of esp32 3.3.12 checks the chain and the name, not the dates, so no waiting for the internet clock (package settings; not tested by the author on a board).](assets/who-may-hand-out-firmware.png)

> ⬆️ **Done reading Concepts 1–6?** Continue to [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-a-backup-and-account-notes-10-minutes) and [Practice 2](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes): the server first, the firmware later. [Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota) to [Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason) are only needed before [Practice 3](#practice-3--automatic-broker-accounts-at-the-gateway-moving-the-module-21-accounts-and-an-account-backup-35-minutes).

### 7. The fleet: canary, "Update all", and what honestly gets no OTA

The [Syllabus](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure) promises you can update the firmware of "1 or 100 devices without touching them", and the [project README](../../mini-smart-home/README.md#coming-later) writes that Module 28 updates the firmware "for many devices at once". All your devices together are called **the fleet**, and their screen is the **Fleet** screen. One button for many devices also spreads one mistake to all of them at once, so the pattern is: one first, then the rest.

**Canary: one test device.** Miners used to carry a canary bird into the mine as an early warning: the bird got sick first when there was poison gas. In a fleet, the canary is the device that's updated first. The admin ticks **Canary** on the device card ([7.2](#72--make-node-1-the-canary-2-minutes)), then updates it. If its new firmware fails to prove itself, only that canary goes back to the old version ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c)); the other devices aren't touched.

**"Update all" stays locked until the canary succeeds.** The **Update all** button on each new release opens when at least one canary has `succeeded` with that version and no canary has `failed` or gone `back to the old version (rollback)`. Before that, the button is disabled with a reason, for example `Locked: no canary has succeeded yet.`, and the server refuses too: Bruno's `update all` is answered with `409` `no canary device has run 1.7.1 successfully yet: update the canary first`. If a canary fails, that release still counts as `latest` and every card shows `needs update` until the release is withdrawn: withdraw it right away ([Concept 5](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest)), then fix it with a new version.

**The rules the server guards:**

- **One update running per device.** The database refuses a second update while the first isn't finished, so a second command is answered with `409`.
- **Only to `online` devices, not queued.** [The Module 27 bridge](../module-27-deploy-internet-tls-pwa/README.md#9-a-store-and-forward-bridge-who-holds-what) holds the data going up, but not the `cmd` going down (rule 13 of Appendix A): a command published while the path is down is lost. That's why a device that's disconnected or stopped on purpose is `skipped` with its reason, for example `device is offline: update commands are only sent to online devices (not queued)`.
- **Expiry.** An update with no word for 10 minutes (`OTA_TIMEOUT_MINUTES`) is marked `expired`, but a report that arrives later still wins: in the author's lab (the limit shortened to 3 minutes), the `failed` report (`power lost while downloading`) of a simulated device that "lost power" in the middle of a download overwrote `expired`.
- **A lost report, the server concludes.** `vitals` (QoS 0) can get lost; if Node 1 has already reported a new `fw` without an `ota` report, the server closes its update itself (`concluded by the server: …`).

**"100 devices", honestly.** Readers of this curriculum usually have one or two Wi-Fi nodes. The author proved the canary-then-all pattern with the simulator: 22 simulated devices at once downloaded and checked the real firmware 1.7.1 over simulated HTTPS (without running it), and 22/22 `succeeded` within 6.3–8.1 seconds (a simulator on one machine, not an ESP32 over Wi-Fi). 100 devices weren't measured. Two limits show up from the lab and the code: the backend sends two Telegram messages per device (`🔄` then `✅`; the mock Telegram received 44 messages for 22 simulated devices), and the download route allows 120 requests per minute per IP address, so a fleet of more than 120 boards behind one home router is partly refused with `429` (`-104` in HTTPUpdate; from the code, not tested). Try it in [Practice 9](#practice-9--optional-the-fleet-update-all-a-disconnected-device-and-expiry-15-minutes) (optional); automatic waves in stages with an emergency brake are in [🧩 Level 3](#level-3--automatic-waves-canary-wait-until-healthy-then-the-rest-in-stages-from-scratch-45-minutes).

**Node 2 honestly gets no OTA.** Node 2 "Garden" has no OTA path over HTTP: it never connects to the router and on purpose doesn't know the Wi-Fi password, it's almost always asleep (deep sleep), and it has no ESP-NOW receiver (it only sends). [🔬 Module 14](../../phase-2-connectivity/module-14-node-2-esp-now/README.md#-technical-deep-dive-optional) already explained why OTA over ESP-NOW is complicated. So Node 2 stays at 1.0.0, and that second ESP32 of Kit A still shows up on the **Fleet** screen: its card shows the version from its ESP-NOW packet and `OTA isn't available for Node 2: update it by cable.` ([4.3](#43--the-fleet-screen-the-summary-the-health-cards-firmware-releases-and-new-devices-5-minutes)), and it's never on the **Update all** list. That's the price of a low-power radio: Node 2 can sleep almost all the time, but its updates go by cable. A design for OTA on Node 2 is in the [🔬](#-technical-deep-dive-optional) fold *OTA for Node 2 through an "update mode"*.

![Diagram of the fleet: one first, then all (Concept 7); canary = the device that gets updates first, the Update all button is locked until one canary succeeds. Top, three steps. 1, Upload a release: Upload Node 1 firmware on /fleet (admin), for example 1.7.1; a normal release may go to many devices; a test release, for example 1.7.2, only through Update on one device card. 2, Update canary: only the online Node 1s with Canary ticked; wait until the result is succeeded; in the release list: Canary: 1 succeeded, 0 failed or rolled back. A padlock between 2 and 3. 3, Update all: unlocked when canary succeeded is at least 1 and failed or rolled back is 0; every online Node 1 that meets the conditions gets it at once, the others are skipped, not queued. Until then the button is disabled and writes Locked: no canary has succeeded yet. / Locked: a canary failed or rolled back. / Locked: test release: per device only. / Locked: release withdrawn. Example, Update all to 1.7.1 (example names, exact reasons): Node 1 living room, canary already 1.7.1, skipped, device is already running 1.7.1; Node 1 garage, online 1.7.0, sent, then succeeded or rollback; third board, online 1.7.0, sent; Node 1 kitchen, offline, skipped, device is offline: update commands are only sent to online devices (not queued); Node 1 porch, online but its previous update not finished, the device is still running another update; the lost board, deactivated, device already deactivated (its key revoked); a newly claimed board, no telemetry yet, device kind not known yet: wait for its first telemetry. Fleet rules: one update running per device, a second command 409; no word for 10 minutes = expired (no word); a downgrade only with the Allow downgrade tick, versions below 1.7.0 refused by Node 1 itself (no rollback yet); the test release 1.7.2 never counts as the latest and never goes to all; Node 2 gets no OTA, updated by cable. The author's simulated lab: 22 simulator devices all succeeded within 6.3-8.1 seconds, the mock Telegram 44 messages (2 per device), 100 devices not measured. Coming next: automatic waves in stages with an emergency brake = Challenge Level 3.](assets/fleet-canary.png)

### 8. A new device in 1 minute: identity, claim codes, and automatic broker accounts

Module 21's way of setting up a device needs three manual steps: `POST /devices` in Bruno, the key typed in the Serial Monitor, then `mosquitto_passwd` and a broker restart. For "a new device in 1 minute", let alone at another location, that's too much. This week **device registration** (provisioning) runs by itself: a new board only needs Wi-Fi, a code, and the server address. (In [Module 26](../module-26-docker-compose/README.md#9-secrets-and-configuration-as-files-env-and-grafana-provisioning), provisioning meant installing Grafana's contents from files: the same name, a different matter.)

**Identity: a `device_id` from the MAC.** Every ESP32 carries a Wi-Fi MAC address from the factory. Node 1 reads it with `esp_read_mac(…, ESP_MAC_WIFI_STA)` and writes it as 12 lowercase hexadecimal characters, for example `a4cf12e5b7c0` (the data contract's example): the name in the topics, the broker username, and the identity for firmware downloads (Concept 6). Don't use `ESP.getEfuseMac()` for this: if its number is printed, the byte order is reversed.

**A claim code: like a ticket code.** The admin fills in the **New devices** section on the **Fleet** screen (name, location, validity 5–60 minutes, default 30), then presses **Create code**. The result is 8 characters shaped `XXXX-XXXX`, for example `7K2M-QF9D` (a documentation example), made of digits and letters (the Crockford alphabet) without I, L, O, and U so they aren't mixed up when read: 40 random bits, about a trillion possibilities. Like a ticket code or a booking code, it's single-use, has a time limit, and is exchanged at the ticket desk (the server) for the real thing: a device key. The code is shown only **once**, and the database only stores its SHA-256 fingerprint. Don't keep it in notes, screenshots, or Git.

**Exchanging the code at the ticket desk.** The board exchanges it once: `POST <server address>/api/provision/claim` with the code and its `device_id`.

| Answer | What it means |
| :-- | :-- |
| `201` | registered: a 43-character device key is saved in the board's NVS, like the Serial key of Module 21; its broker account is already made |
| `403` | the code is wrong, expired, or already used: one answer for all three, so a guesser can't tell which codes ever existed |
| `409` | that `device_id` is still registered and active: an identity can't be taken over, deactivate it first ([Concept 10](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect)) |
| `429` | more than 10 attempts per minute from one IP address |
| `503` | the database or the broker has a problem; the code is **not** used up, and the board tries at most 3 times, 30 seconds apart |

The registration, the "code used" mark, and the broker account are done in one transaction: if it fails halfway, the database doesn't change and the code is still valid. This is the home version of the "claim certificates" of big IoT services ([🔬 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-technical-deep-dive-optional), the fold *Provisioning in industry*): something short-lived is exchanged for that device's unique identity.

**The portal: three fields on the Wi-Fi page.** A new board that doesn't know any Wi-Fi yet opens the portal `Node1-Home`, the Wi-Fi portal like at a hotel from [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#5-a-wi-fi-portal-like-at-a-hotel-wifimanager). Its Wi-Fi page now has three extra fields: **Claim code** (only in RAM until it's exchanged, never in NVS), **Server address** (at most 64 characters, saved in the NVS label `server_address`; the place for the claim **and** the firmware downloads, so it must be exactly the home server's `SERVER_URL`, [2.3](#23--the-infrastructure-files-and-the-central-machines-env-mosquitto_dynsec_password-and-server_url-6-minutes)), and **Broker address** (the Pi gateway's IP, or the laptop's on the path without a Pi; NVS `broker_address`). After **Save** and once Wi-Fi is connected, the board exchanges its code, saves its key, logs in to the broker, then shows `Online` on the **Fleet** screen with the name and location from the code ([Practice 10](#practice-10--a-new-device-in-1-minute-a-claim-code-and-the-portal-30-minutes)). Without the portal (for example in Wokwi), type `claim <code> [server] [broker]` in the Serial Monitor.

**A password-protected portal.** The Module 10 portal opens without a password, and WiFiManager's built-in address `192.168.4.1/update` stays active even though its **Update** button is hidden ([Module 10 ➕ D](../../phase-2-connectivity/module-10-wifi-and-http/README.md#d-verify-upload-and-connect-to-wi-fi)): while the portal is open, anyone near the board could upload firmware through it. Because the portal is now opened more often, firmware 1.7.0 sets a password when `keys.h` holds `#define PORTAL_PASSWORD "…"` (8–63 characters, the WPA2 Wi-Fi password rule; also write it on the box label): a phone must enter that password to join the Wi-Fi `Node1-Home`, so only whoever holds the password can reach `192.168.4.1`, including `/update` ([5.2](#52--a-password-protected-portal-portal_password-in-keysh-3-minutes)).

In the author's lab (the simulator over simulated HTTPS), exchanging a code finished in 256–309 ms, and the `Online` card with version 1.7.0 showed up 3.8–6.7 seconds after the simulator started. With a real board and phone, the time is not measured by the author: your stopwatch in 10.4 is the first to measure it. A device's life cycle: claim → active (`online`, `offline`, or stopped on purpose) → **Deactivate** when lost or stolen ([Concept 10](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect)) → alive again only with a new claim code or a new key from the admin.

![Diagram of the one-minute claim (Concepts 8 and 10): a new board without typing a key; a single-use claim code exchanged for a device key. Six steps. 1 Admin: Create a claim code on /fleet, name + location (optional), valid 5-60 minutes (default 30), the code XXXX-XXXX shown once, the server only keeps its SHA-256. 2 The new board starts without Wi-Fi: the temporary portal Wi-Fi Node1-Home (password-protected if PORTAL_PASSWORD is set), open 192.168.4.1 from a phone; the board already has firmware 1.7.0 by cable. 3 The Wi-Fi page + three fields: Claim code (not stored), Server address to the NVS label server_address, Broker address to NVS (the Pi gateway IP), then Save; without the portal: Serial claim. 4 Exchanges the code, once: POST server address/api/provision/claim with code and device_id; device_id = the Wi-Fi MAC address, 12 hexadecimal digits. 5 The server, one transaction: the code valid and unused, register the device, mark the code used, make the broker account, 201; the 43-character key to NVS, never printed. 6 The board logs in with its new key, online on /fleet with the name and location from the code; simulator lab claim 256-309 ms. Server answers: 201 registered, key + broker account made; 403 code wrong, expired, or already used (one answer); 409 the device is still registered and active, deactivate it first; 429 more than 10 attempts per minute from one IP; 503 a server or broker problem, the code is not used up, the board sends at most 3 times, 30 seconds apart. One minute = the target for a real board + phone, not measured by the author (lab: simulator, the card Online 1.7.0 3.8-6.7 seconds after starting). Bottom, the life cycle (Concept 10): Claim (a claim code or the Module 21 registration), Active (online, offline, stopped on purpose), Deactivate (the admin button on /fleet), Alive again (a new claim code or a new key from the admin, back to Active). On Deactivate: the broker deletes its account, the board is disconnected at once (administrative action); the server writes the status offline (no will is published); the key revoked, the retained config deleted, commands and updates 409; lab 200 within 0.18 seconds (simulated), a real board not tested. Afterwards: the old retained online status stays at the broker (ignored by the backend); Grafana sends a false is sending data again ±4.5 minutes later (lab): set a silence before Deactivate; the key in the NVS of a stolen board is still readable (flash encryption, the Module 21 Technical Deep Dive).](assets/one-minute-claim.png)

**Broker accounts made by the backend: dynamic security.** In Module 21, the broker's doorkeeper read the device accounts from the password file, and the backend can't write that file. Mosquitto 2.1.2 in our image already carries the **dynamic security** plugin: a broker account book the backend can write while the broker is running, through JSON command letters on the control topic `$CONTROL/dynamic-security/v1`. The backend sends `createClient` when it registers a device, handles a claim, or rotates a key, and `deleteClient` on **Deactivate**: a new account works right away without a restart, and a deleted account is cut off right away. Its motto: **service accounts in the password file, device accounts in dynamic security**. The service accounts (`backend`, `pi-bridge`, `monitor`, …) stay in the password file; the old Module 21 accounts are moved in [3.4](#34--move-the-old-module-21-accounts-rotate-the-key-the-new-key-over-serial-mosquitto_passwd--d-then-restart-10-minutes).

Their topic permissions are still the `%u` pattern in Module 21's `acl-broker`: a device only writes its own topics and only reads its own `cmd`. The plugin's default actually lets an account without a role **read** anything, so before every `createClient` the backend sends `setDefaultACLAccess`, which turns that default read permission into deny. In the author's lab, the practice device's account, subscribed to `msh/#` and `$SYS/#` for 20 seconds, didn't receive a single message from another device ([3.3](#33--a-device-account-only-reads-its-own-cmd-4-minutes)). The backend setting `AUTO_BROKER_ACCOUNTS` picks the broker: `center` (the path without a Pi), `gateway:pi1` (the main and free paths), or `off` (accounts made by hand, as in Module 21).

**Devices behind the gateway: command letters handed to the bridge to deliver.** On the main path, Node 1 connects to the Pi gateway's broker, while the backend lives on the VPS and can't reach the Pi behind the home router. The Module 27 bridge is already connected from the Pi to the VPS, so the backend writes its command at the central broker on the topic `msh-gateway/pi1/dynamic-security/v1`, and two remap lines in `edge/bridge/center.conf` (a copy of [`bridge.example.conf`](code/edge/bridge.example.conf)) move it to the gateway's control topic, then carry the answer back:

```text
topic dynamic-security/v1 in 1 $CONTROL/ msh-gateway/pi1/
topic dynamic-security/v1/response out 1 $CONTROL/ msh-gateway/pi1/
```

The gateway's name `pi1` is written in three places: `AUTO_BROKER_ACCOUNTS=gateway:pi1` in the center's `.env`, these two lines, and the `pi-bridge` account's permissions in `acl-broker`. Firmware downloads and claims don't go through the bridge (Concept 6). In the author's lab (a simulated TLS bridge), registering a device through the bridge was answered with `201` in 154–312 ms ([3.2](#32--the-practice-device-its-broker-account-is-made-automatically-on-the-gateway-broker-pi1-8-minutes)).

**No answer within 3 seconds.** The backend tries once more, then answers `503`, and the database doesn't change. However, a command that was already sent can be held in a briefly stuck bridge, then carried out by the gateway as soon as it recovers: in the author's lab, a **Deactivate** answered with `503` while the home internet was unplugged was still carried out by the gateway after the internet came back. That's why the `503` sentences other than the claim's end with `… repeat this step in a moment so the database and the broker match again`, and repeating it is safe. This is also the reason for the install order: don't register or claim a new device before the gateway is up in [Practice 3](#practice-3--automatic-broker-accounts-at-the-gateway-moving-the-module-21-accounts-and-an-account-backup-35-minutes); until then the backend answers `503`.

**"Who may tell the backend to make them?"** [🧩 Level 3 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#level-3--the-backend-builds-the-broker-password-file-itself-6090-minutes) closed with that question: a backend that can make broker accounts holds the "master key" of the whole broker. Module 28's answer:

1. Only the `backend` account may write the control topic (four new lines in block 3 of `acl-broker`), and the bridge only carries commands for `pi1`. Never give that permission, or `topic #`, to another account.
2. A device can't register itself: it needs a claim code, and codes are only made by the admin, single-use and short-lived.
3. A leaked `backend` account = control over every device, as it has been since Module 19. Guard its `.env`.
4. The real master key of that account book is the password of the plugin's `admin` account, `MOSQUITTO_DYNSEC_PASSWORD` (in the center's `.env` and in `edge/.env`, different ones). The `admin` account is only used for checking (3.3), but whoever holds its password can make any account and read every message. Without that variable, the plugin makes its own password **and** a sample account `democlient` that may publish and subscribe to `#` (the author's lab), which is why Compose refuses to start without it. A random secret, at least 12 characters, not in Git.

![Diagram of devices behind the gateway (Concept 8), the main path: device broker accounts are made by the backend on the VPS but live on the Pi gateway broker. Left, the home (a router without port forwarding): Node 1 1.7.0 and the third board (from a claim) to the Pi gateway broker pi1, 192.168.1.37:1883; device accounts made by the backend (dynamic security); service accounts and the old Module 21 ones in password_file; a device only reads its own msh/id/cmd. The home router: OUTGOING connections, no door opened. Middle: the TLS bridge 8883, data up, account commands down. Right, the VPS: the central broker (8883 TLS, takes account commands on msh-gateway/pi1/…), backend 1.5.0 (AUTO_BROKER_ACCOUNTS=gateway:pi1; claim, registration, key rotation, Deactivate = createClient or deleteClient), Caddy HTTPS 443 (/fw/* and /api/provision/claim to the backend; SERVER_URL in .env, the same as typed in the board portal). The arrow router to Caddy: downloads + claims, HTTPS straight to the VPS, not through the bridge. Four steps: 1 the backend publishes setDefaultACLAccess, then createClient at the center, topic msh-gateway/pi1/dynamic-security/v1; 2 the bridge carries it to the gateway as $CONTROL/dynamic-security/v1, the plugin makes the account; 3 the answer …/response goes up to the backend, 201; 4 no answer within 3 seconds: once more, then 503; the database unchanged, a command already sent may still be carried out when the bridge is back. The remap in bridge/center.conf: topic dynamic-security/v1 in 1 $CONTROL/ msh-gateway/pi1/ and the same …/response out 1 line. Simulated lab: register 201 0.15-0.31 s, Deactivate 0.18 s. The .env table SERVER_URL and AUTO_BROKER_ACCOUNTS: laptop without a Pi http://192.168.1.10, center; laptop + Pi the same, gateway:pi1; VPS https://iot.yourname.my.id, gateway:pi1; the free-path Pi http://192.168.1.37, gateway:pi1; WEB_INNER_PORT empty (= 80), the Pi 8081 inside the container; in the portal Server address = SERVER_URL exactly, without :8081; Broker address = the gateway or laptop IP. The free path: the center on the Pi too (1884); the board calls http://192.168.1.37, the Pi port 80 goes to the device door 8081: only /fw/* and claims, no dashboard, no trust in X-Forwarded-For; the dashboard through the Cloudflare tunnel, downloads not. Bottom, moving the Module 21 accounts: rotate the key with Bruno (POST /devices/id/key, no dashboard button), key value on Serial at once, mosquitto_passwd -D, restart the gateway, not HUP; without step 3 the old key comes back to life.](assets/devices-behind-the-gateway.png)

### 9. Remote configuration and device health: the `vitals` interval and `reset_reason`

Node 1 on the roof can't be asked through the Serial Monitor. From afar, you need to **change its settings** without climbing up and **know how it's doing**: healthy, or quietly restarting often? The [Syllabus](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure) promises both: remote configuration through a retained `cmd`, the restart reason in `vitals`, and the health of every device on the `/fleet` page.

**One retained message for all the settings.** Since [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#10-local-safety-node-1-guards-the-house-when-the-server-is-gone), the server sends the local safety thresholds through the `config` command with QoS 1 and the retained flag: the broker keeps it, so a freshly started Node 1 receives it as soon as it subscribes to `cmd`. Contract 1.6 adds one key, `intervals`. In `cmd`, only `config` is retained (`set` and `update` never are), and one topic has only **one** retained message (rule 10), so the thresholds from the fan rule and the interval the admin sets are merged into one `config`. An example from section 7 of [`DATA-CONTRACT.md`](code/DATA-CONTRACT.md):

```json
{"id":"c-20261031-061500-4","ts":"2026-10-31T06:15:00Z","action":"config","thresholds":{"temp_fan_on":30},"intervals":{"vitals_s":60}}
```

The rules are the same as Module 19's thresholds: Node 1 checks every key first, and one unknown key or a number out of range makes the whole command refused (`ok:false`). A key that isn't sent doesn't change; a valid one is saved in NVS (the label `vitals_interval`), so it still applies after a power cut. The server publishes `config` again every time it connects to the broker and every time its content changes.

**"Interval" in the Syllabus = the `vitals` interval.** `telemetry` stays every 10 seconds (rule 3), because two guards depend on it: Module 23's `stale data` label and Module 25's "Silent node" alert. Only **the `vitals` interval** is set from afar: 60–3600 seconds, default 300 (5 minutes); 60 seconds is useful during the 24-hour test in the box. Syllabus v1.0.30 records it: "(the `vitals` interval and the thresholds; the `telemetry` interval stays 10 seconds; Wi-Fi and the server address can't be changed from afar)". The admin changes it on the card: **More settings** → **Vitals interval (seconds, 60-3600)** → **Save interval** ([11.1](#111--a-60-second-vitals-interval-through-more-settings-5-minutes)). Firmware 1.6.0 doesn't know `intervals` yet and ignores it (it answers a `config` holding only `intervals` with `ok:false`); the setting stays stored on the server and applies as soon as Node 1 runs 1.7.0.

**What deliberately can't be changed from afar:** Wi-Fi, the server address, the broker address, and the device key; all of them only through the Wi-Fi portal, Serial, or a claim code. `config` has no trial period like firmware has ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c)): one wrong broker address makes Node 1 unreachable, so it can't be fixed from afar; that "orphaned" device has to be visited.

**Health news: `vitals` 1.6.** Node 1 sends `vitals` once after connecting, then every interval above. Its contents since [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#5-the-data-contract-five-topics-and-one-json-shape-for-everything): the Wi-Fi signal (`rssi`), the uptime (`uptime_s`), and the free RAM (`heap_free`). From firmware 1.7.0 on, two required fields come along: `reset_reason` (the reason for the last start) and `fw` (the running version), plus the `ota` report when an update has just finished. The example in section 6 of the contract (the state in Practice 8):

```json
{"ts":"2026-10-31T01:04:54Z","rssi":-58,"uptime_s":7,"heap_free":181940,"reset_reason":"SW","fw":"1.7.1","ota":{"id":"c-20261031-010312-3","result":"rollback","version":"1.7.2","message":"not connected to the broker within 60 seconds"}}
```

`fw` = the running version (1.7.1), `ota.version` = the version that was tried (1.7.2). With these new fields, the longest `vitals` becomes 406 of the 512 bytes of an MQTT packet (computed by the author in the host tests), which still fits in Node 1's `setBufferSize(512)` container.

**`reset_reason`: seven words, each with one meaning.** The `resetReasonName()` function from Module 5, which answers `WDT` after Module 8's watchdog has acted, now fills this field with one of the seven values of [Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract):

| Value | What it means | Color on the card | What you do |
| :-- | :-- | :-- | :-- |
| `POWERON` | the power just came on, or the EN button was pressed | gray | normal after installing or a power cut |
| `BROWNOUT` | the ESP32's voltage dipped for a moment | yellow | check the power supply and its wires: loads (relay, pump, servo) from the MB102, never from an ESP32 pin, and the GNDs joined |
| `SW` | restarted by the program: an update, a rollback, or the `restart` command | blue | read **Last update** on the same card |
| `PANIC` | the program crashed | red | the firmware has a problem: write down its version, fix it with the next version |
| `WDT` | the program got stuck, and the watchdog restarted it | red | the same as `PANIC` |
| `DEEPSLEEP` | woke up from deep sleep | gray | doesn't happen on Node 1, which never sleeps |
| `UNKNOWN` | another reason | gray | rare; watch whether it repeats |

A successful update and a rollback because the trial period ran out are both `SW`; that's why the `ota` report (`succeeded`, `rollback`, or `failed`, the version, and a message of at most 80 characters) comes along in at most 3 `vitals` (Concept 3). A rollback because new firmware crashed or got stuck is recorded as `PANIC` or `WDT` (according to the code; not yet tested by the author on a board). [🔬 Module 5](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#-technical-deep-dive-optional) promised that the restart reason would be sent to the server "so a brownout that happens quietly at home still gets noticed"; now it shows on the card, and the 24-hour proof in the box ([13.2](#132--k1-e-24-hours-on-without-brownout-panic-or-wdt-5-minutes)) reads it.

**The card on the Fleet screen** ([4.3](#43--the-fleet-screen-the-summary-the-health-cards-firmware-releases-and-new-devices-5-minutes)) shows **Firmware version** (plus `→ <latest version>` when its badge is `needs update`), **Restarted because** (the value and its meaning; while Node 1 is still on 1.6.0: `— (the old firmware doesn't report it)`), **Wi-Fi signal** with the categories of [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#2-wi-fi-for-the-esp32-24-ghz-only-and-how-strong-the-signal-is)'s RSSI table (for example `-58 dBm (strong)`), **RAM** (KB free), **Uptime**, the sentence `Health from the last vitals, …; vitals sent every 300 seconds (firmware default).` (or `60 seconds (set by the admin)`), and **Last update**. Node 2's card writes `Node 2 doesn't send vitals`.

**Not everything is live.** The status, the version from `telemetry`, and an update's progress change by themselves through Socket.IO, without polling; the health numbers are only fetched again when the server announces something (an update finished, a new device, or a deactivation) or when the page is reloaded.

**"Last seen" now comes from data.** In Module 25, `last_seen` moved forward with any `status` message, `offline` too, so the Garden that had been silent for 16 minutes read "0 minutes ago" (its fix was noted for Modules 28 and 30). Backend 1.5.0 only moves it forward when `telemetry` or `vitals` arrives: in the author's lab, a deactivated simulated device still points to its last data delivery.

> ⬆️ **Done reading Concepts 7–9?** Continue to [Practice 3](#practice-3--automatic-broker-accounts-at-the-gateway-moving-the-module-21-accounts-and-an-account-backup-35-minutes) (automatic broker accounts at the gateway, using Concept 8), then [Practice 4](#practice-4--dashboard-140-and-the-fleet-screen-with-simulated-devices-25-minutes) (the Fleet screen, using Concepts 7 and 9). [Concept 10](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect) is only needed before [Practice 11](#practice-11--the-vitals-interval-from-afar-and-deactivating-a-lost-device-20-minutes), and [Concept 11](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v) before [Practice 12](#practice-12--from-breadboard-to-enclosure-90-minutes-needs-a-board-the-soldering-path-adds-60-minutes).

### 10. Deactivating a lost device: from revoking a key to an instant disconnect

A board can get lost, stolen, or retired; as long as its key is valid, whoever holds it can log in to the broker in your device's name. [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#9-revoking-a-lost-devices-key) revokes a key in two layers: the backend at once (`POST /devices/:id/revoke`: its deliveries are ignored, its commands are answered with `409`), while the broker only refuses it after `mosquitto_passwd -D` and a reload on the broker's machine.

**Deactivate: one button for every layer.** The admin presses **More settings** → **Deactivate** → **Yes, deactivate** on the device card ([11.3](#113--deactivate-the-third-board-its-broker-account-deleted-disconnected-at-once-6-minutes)). The route is still `POST /devices/:id/revoke`, but it now does four things at once:

1. **The key is revoked** as in Module 21: that device's deliveries are ignored, commands and **Update** are answered with `409`, and a firmware download with its old key with `403`.
2. **Its broker account is deleted** (`deleteClient`, Concept 8): the broker cuts it off at once (`… disconnected: administrative action.`) and refuses every later attempt, without `mosquitto_passwd` and without a restart.
3. **The `offline` status is written by the server**, because the broker doesn't publish the will for a connection cut this way (without it, its card would stay `Online`). Its badge is now `deactivated`.
4. **Its retained `config` is deleted**, the Telegram messages waiting for that device are cancelled, and the event log records `revoked`.

In the author's lab (a simulated device behind a simulated TLS bridge), this route was answered with `200` in 140–180 ms, then the simulator wrote `REJECTED by broker (code 5)`. The device comes back to life only with a new key from the admin or a new claim code ([11.5](#115-claim-again-with-a-new-code-4-minutes)). The gateway can't be reached right now? The answer is `503`: repeat it in a moment (Concept 8); the answer `"broker_account": "none"` on that retry is normal.

**The I8 promise, and the honest leftovers.** The OWASP IoT table in [Concept 10 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear) writes I8 (*Lack of Device Management*) "managing many devices in Module 28": the **Fleet** screen, claim codes, and **Deactivate** are the answer. What stays behind:

- **The old retained `online` status** stays on the broker, because the `backend` account may not write the `status` topic. The backend ignores it; its card stays `deactivated`.
- **The key in a stolen board's NVS** can still be read by whoever takes it apart (flash encryption is only in [🔬 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-technical-deep-dive-optional)), but it's useless now: its account has been deleted.
- **An old Module 21 account in the password file.** As long as the dynamic security account exists, the OLD key is refused (the plugin is read first); as soon as **Deactivate** deletes it, the old line applies again. In the author's lab, a simulated device with a password-file account was still accepted after **Deactivate** (`broker_account` `none`) until `mosquitto_passwd -D` and a broker restart. That's why the `-D` in [3.4](#34--move-the-old-module-21-accounts-rotate-the-key-the-new-key-over-serial-mosquitto_passwd--d-then-restart-10-minutes) is required, and why the box `After deactivating:` reminds you of it (safe to repeat; ignore it if the device never had a Module 21 account).

**Grafana's misleading message.** The "Silent node" alert of [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#7-alerts-that-wake-people-only-when-needed-silent-is-not-the-same-as-offline) only reads registered devices that haven't been revoked. A lost device is usually 🔴; as soon as it's deactivated, its row disappears from the query, and Grafana reports `✅ <name> is sending data again.`, while it really means "no longer watched". In the author's lab (Grafana 13.2.4, the mock Telegram), that false message arrived 4 minutes 36 seconds after **Deactivate**; with a silence (a mute for its alerts) for its `device_id` (**Alerting → Silences**, [11.2](#112--create-a-silence-for-the-silent-node-alert-in-grafana-before-deactivating-3-minutes)), there was no message during 9 minutes of watching. The rule is deliberately not changed: its fix is in [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data).

**Stopped on purpose isn't a disconnect.** The `offline-mode` status has been "kept for Module 28" since [Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#10-local-safety-node-1-guards-the-house-when-the-server-is-gone) and got a neutral badge in [Module 23](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#7-alive-isnt-always-fresh-status-last-seen-and-stale-data); now its badge is `stopped on purpose`, sky blue (not a fault; Concept 3). The backend's Telegram gives it its own sentences, not a false `📴`: `🔄 <id> stopped on purpose (firmware update or restart), back online shortly`, then `✅ <id> online again after stopping on purpose (<n> seconds)`, or `📴 <id> hasn't come back after stopping on purpose at HH:MM WIB` when 3 minutes pass without `online`. That grace period is longer than the 60 seconds for a normal `offline`, because a rollback takes the 60-second trial period plus a restart (simulator: ±70 seconds). The daily report doesn't count it in `disconnects` either.

> ⬆️ **Done reading Concept 10?** Continue to [Practice 11](#practice-11--the-vitals-interval-from-afar-and-deactivating-a-lost-device-20-minutes): the `vitals` interval from afar, then deactivating the third board you registered in [Practice 10](#practice-10--a-new-device-in-1-minute-a-claim-code-and-the-portal-30-minutes). If you read it earlier, go back to the practice you're working on.

### 11. From breadboard to enclosure: screw terminals, the Module 9 power supply, and no 220 V

A breadboard is good for trying things, not for staying: its springs wear out, jumper wires come out when bumped, the vibration of the pump and the fan shakes the components' legs, and dust gets into the open holes. A loose connection rarely kills the board outright; more often it's a strange reading now and then, or a relay that sometimes doesn't obey, the hardest faults to find from afar. Since Practice 7, Node 1 is updated without a USB cable, so its box may be closed.

**The pins and the firmware don't change.** The pin map was promised as one that "doesn't change until Module 28" ([Syllabus §2.1](../../SYLLABUS.md#21-two-devices-two-roles-fixed-from-the-start-so-they-dont-keep-changing), [Concept 3 of Module 5](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#3-the-pin-budget-and-the-canonical-pin-map-of-node-1-and-node-2)): the pins, the power rails, and the firmware stay; only the way of connecting moves, from breadboard holes to screw terminals. [`PIN-MAP.md`](code/PIN-MAP.md) version 7 records it in a new section, "Node 1 inside the box", and Syllabus v1.0.30 records its new wording: the pin map "doesn't change; in Module 28 its connections move from the breadboard to the box". Node 2 stays in [its enclosure from Module 14](../../phase-2-connectivity/module-14-node-2-esp-now/README.md#a-prepare-node-2-for-its-permanent-spot).

**The main path without soldering: a screw-terminal expansion board.** This board was already mentioned in [🔬 Module 2](../../phase-0-foundations/module-02-electricity-and-first-upload/README.md#-technical-deep-dive-optional) (the fold *If your board covers every hole …*) and [🚨 Module 5](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#-troubleshooting) (the fold *The breadboard's rail strip won't come off …*). The DevKit is plugged into its two rows of holes, and every pin is carried on to one **screw terminal** that clamps a wire with a metal plate: there's no spring to wear out. Before buying, match two things:

1. **The size.** Our pin map is only for the 30-pin DevKit V1, 15 pins per side ([Concept 1 of Module 5](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#1-anatomy-of-the-esp32-devkit-v1-board-which-pins-you-have)); an expansion board for 38 pins doesn't fit, and the distance between the two rows of pins isn't the same across manufacturers either (Module 2). Don't trust a "standard" number: measure the distance on your DevKit with a ruler, then compare it with the seller's photo or size ([12.1](#121--match-the-expansion-board-to-your-devkit-measure-the-distance-between-the-two-pin-rows-5-minutes)).
2. **The writing at the terminals**, a GPIO number (`32`) or a D name (`D32`): match it with the first column of Node 1's table in `PIN-MAP.md`.

The expansion board's DC jack and regulator **aren't used**: sellers often don't list their specifications.

There's no freely licensed photo of this board yet; examples of screw-terminal shapes, including ones on a board, are in [Wikipedia's article *Screw terminal*](https://en.wikipedia.org/wiki/Screw_terminal).

**Small circuits still need a place.** The expansion board has no room for resistors, capacitors, or MOSFETs, yet Node 1 has small circuits: the HC-SR04 ECHO voltage divider and the LDR divider (Module 6), the pump MOSFET with its resistor and flyback diode (Module 5), and the RO divider of the RS-485 module (Module 15, if used). The main path puts them on a **mini self-adhesive breadboard** inside the box. To be honest, those are still friction connections, only shorter and protected. Whoever wants them permanent solders them on **perfboard** (a board with holes for soldering), the optional path in [12.5](#125-small-circuits-on-a-mini-self-adhesive-breadboard-10-minutes).

**Wires that don't come loose.** For the screw terminals, use **solid wire** (one solid strand) 22 AWG: strip just enough, insert it, then tighten without clamping the insulation. Stranded wire easily splays and slips out under a screw; if you must use it, give its end a **ferrule** (a metal sleeve crimped on with a special tool; optional). Tie every wire going in or out of the box with a cable tie near its hole: that's **strain relief**, so a pull from outside is held by the tie, not the screw.

**The power supply: the Module 9 arrangement, moved as it is.** "Its own power supply" isn't a new source: the [Module 9 ➕ A](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md#a-node-1-permanently-on-an-adapter-then-the-24-hour-test) arrangement goes into the box, namely a 5 V phone charger (at least 1 A) to the board's USB through a wire labeled **ESP32**, and a 5 V 2 A adapter to the MB102 through a wire labeled **MB102**. **The golden power rules** still apply: loads (relay, fan, pump, servo) always from the MB102, never from the ESP32's VIN or 3V3 pin; all GNDs joined; the board's USB first, then the MB102. The charger's and the adapter's heads stay in the wall socket **outside** the box; only their 5 V wires go in.

**No 220 V, no exceptions.** The [Syllabus](../../SYLLABUS.md#2-the-big-picture-what-we-will-build) promises this curriculum **never** connects anything to the 220 V mains (the PLN grid). A box is tempting: "while we're at it, let the relay switch the house lights", or "use a 220 V AC-DC module so one cable is enough". Don't. Inside the box there's no mains wire and no AC-DC module, and the relay is only for this project's 5 V loads.

**The layout: sensors must see and breathe.**

- **DHT22** outside the box, away from the ESP32 and the regulator: the heat from inside the box warms up the sensor too, so it reads the box's temperature, not the room's.
- **PIR** and **LDR** through the wall, facing the room; the **HC-SR04** stays above the water tank; the **soil sensor** stays in its pot.
- **Ventilation**: gaps or holes in the top and bottom walls, not a tightly sealed waterproof box (for example IP65): trapped humid air condenses, the same reason as the holes in Node 2's enclosure.
- **Plastic**, not metal: a steel cabinet, a brick wall, and a water tank can lower the Wi-Fi signal by a dozen or so dBm ([Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#2-wi-fi-for-the-esp32-24-ghz-only-and-how-strong-the-signal-is)); compare **Wi-Fi signal** on the card before and after the move.
- **The EN button and D13** reachable or marked: the Wi-Fi portal is opened by holding D13 while pressing EN.

![Diagram from breadboard to enclosure (Concept 11): top view, an example arrangement, a reconstruction, not a photo and not to scale; pins and firmware unchanged (PIN-MAP 7). The project box, lid open. Outside left: a phone charger 5 V, min. 1 A, to the board USB, and a USB adapter 5 V, min. 2 A, to the MB102, both at the wall socket; the adapter heads stay outside the box, only the 5 V USB cables go in. At the top: the DHT22 outside the box, away from the warm ESP32 and regulator; vent slots in the top and bottom walls. Inside: a screw-terminal expansion board with the ESP32 DevKit V1 30 pins; a 2-channel relay module (lamp D32, fan D33, 5 V loads only); the MAX485, its A/B wires out of the right wall; a mini self-adhesive breadboard (the ECHO and LDR voltage dividers, the pump MOSFET, the RS-485 RO divider) with the MB102 at the end of its rails (the 5 V rail for the loads, Module 5); the GND wire from the expansion board to the MB102: GND tied together. The right wall: PIR + LDR through the wall, facing the room. Bottom, cables out through cable ties (black squares): HC-SR04 above the tank, the soil sensor in the pot, 5 V load cables to the pump, servo, lamp, fan. Right, the box rules (PIN-MAP 7): 1 pins unchanged, a short single wire from the screw terminal labeled with the same GPIO; 2 match the expansion board, measure the distance between the two pin rows with a ruler, a 38-pin board does not fit, its DC jack and regulator are not used; 3 the Module 9 power supply reused: the ESP32 from its own charger, the loads from the MB102, GND tied together; 4 sensors see the outside air: outside or through the wall; 5 it breathes, it is not watertight: vent slots, a sealed box invites condensation; 6 cables tied at the wall hole, ferrules for stranded wire (optional); 7 before the power goes on, check polarity and connections with a multimeter, move group by group: power, actuators, sensors, test through the dashboard. The label on the lid: device_id, name, the initial firmware version + date, power polarity, the Wi-Fi portal password if used, hold D13 while starting = Wi-Fi portal. Bottom, a red box: no 220 V mains power inside the box; the relay only for 5 V loads; a 220 V AC-DC module and mains cables do not go into the box; this curriculum never asks you to touch 220 V. A dashed box: the optional soldering path, a soldered perfboard replaces the mini breadboard for small circuits; soldering safety in Concept 11; the author did not photograph or test this box.](assets/box-layout.png)

**Before the lid is closed.** Move it group by group with PIN-MAP 7 (power → actuators → sensors) and test every group through the dashboard ([12.4](#124--move-it-group-by-group-with-pin-map-7-power-actuators-then-sensors-35-minutes)): if something is wrong, you know which group caused it. Before power goes in, check with a multimeter the polarity of 5 V and GND, that there's no short circuit between 5 V and GND, and that the shared GND is connected; then gently pull every wire. Stick a label on the lid: `device_id`, name, the initial firmware version + date, the polarity and function of both power wires, the portal password (if used), and "hold D13 while starting = Wi-Fi portal". The portal password on that label is deliberate: whoever holds your box can read the board's contents anyway. Last, the "after" photo from the same angle and distance as the "before" photo ([🔁 Step 5](#step-5--a-before-photo-of-node-1-from-above)), then 24 hours on without `BROWNOUT`, `PANIC`, or `WDT` ([13.2](#132--k1-e-24-hours-on-without-brownout-panic-or-wdt-5-minutes)).

**The box and I10.** Module 21's OWASP table writes I10 (*Lack of Physical Hardening*) "the device enclosure in Module 28". The box protects the connections from fingers, dust, and pulls, but not from thieves: a board that's taken away can still have its flash read (the device key in NVS, the ESP-NOW key and the portal password in the firmware). For a lost board, use **Deactivate** (Concept 10).

**The soldering path (optional): safety first.** The Syllabus introduces soldering "as an option in Module 28" ([§5.0](../../SYLLABUS.md#50-environment-prerequisites-check-before-you-start)). Its steps are in the fold **The soldering path** of [12.5](#125-small-circuits-on-a-mini-self-adhesive-breadboard-10-minutes); before you pick up a soldering iron:

- The iron's tip works at ±325–375 °C ([SparkFun's guide](https://learn.sparkfun.com/tutorials/how-to-solder-through-hole-soldering/all)): always put it back in its stand.
- **Safety glasses**: clipped component legs or molten solder can fly into your eyes.
- **Ventilation**: the fumes of flux (the cleaning agent inside the solder) are a common cause of occupational asthma ([the UK's HSE](https://www.hse.gov.uk/pubns/indg249.pdf)). Open a window, don't breathe in the fumes, and lower the temperature if there's a lot of smoke.
- **Wash your hands** afterwards, especially after leaded solder, and don't eat at the soldering desk. Lead-free solder needs a higher temperature.
- A good joint is **shiny and shaped like a small mountain** that wraps around the leg and its copper pad; one that's dull or has a gap at the base of the leg is **a cold joint**, which can connect and disconnect when it vibrates.

A sensible first solder joint: the 10 µF capacitor between EN and GND from 🔬 Module 2 (the fold *What esptool does…*), for a board that always needs the **BOOT** button held while uploading (hold BOOT as soon as `Connecting…` appears, and let go when `Writing at …` starts running); an over-the-air update itself doesn't need BOOT. The Syllabus writes the soldering path with "(video)": the author didn't use a soldering iron, so 12.5 links third-party illustrated guides to read, without an embedded video.

**Honest about the hardware.** The author didn't use an expansion board, a box, a soldering iron, or a multimeter. The diagram above is a reconstruction from `PIN-MAP.md` and Modules 5–9, not a photo and not measurements; the photos in Practice 12 come from licensed sources ([📚](#-sources--image-credits)).

> ⬆️ **Done reading Concept 11?** If you don't have the box and the expansion board yet, measure your board, then order them now (the list is in [🧰 What you need](#-what-you-need)). Node 1 only moves into the box in [Practice 12](#practice-12--from-breadboard-to-enclosure-90-minutes-needs-a-board-the-soldering-path-adds-60-minutes), after every over-the-air update is finished in [Practice 11](#practice-11--the-vitals-interval-from-afar-and-deactivating-a-lost-device-20-minutes).

## 🔧 Step-by-step practice

Practices 1–4, 6–8, 10, and 11 are required for every path; Practices 5, 12, and 13 are required for the paths with a Kit because they need a board; Practice 9 is optional. The steps marked ⭐ (1.2–1.4, 2.2–2.5, 3.1–3.5, 4.1–4.3, 5.1–5.4, 6.1–6.4, 7.1–7.3, 7.5, 8.1–8.4, 10.1–10.4, 11.1–11.4, 12.1–12.4, 12.6–12.9, 13.1, and 13.2) are the proof, plus ➕ E. The pass requirement **O0** is proven in [5.4](#54--o0-serial-ota-and-server-then-node-1s-card-at-version-170-with-reset_reason-5-minutes), **O1** in [7.5](#75--o1-version-171-reset_reason-sw-and-the-history-succeeded-without-a-cable-5-minutes), **O2** in [8.3](#83--o2-node-1-goes-back-to-171-by-itself-after-the-60-second-trial-period-10-minutes), **K1** in [12.9](#129--k1-ad-labels-the-box-lid-then-node-1-online-again-5-minutes) (a–d) and [13.2](#132--k1-e-24-hours-on-without-brownout-panic-or-wdt-5-minutes) (e); a new device in 1 minute (**P1**, a required practice) in [10.4](#104--p1-a-new-card-online-on-the-fleet-screen-within-60-seconds-of-save-6-minutes).

The order follows the required order at the start of the module: the server and the gateway first (the old backend refuses firmware 1.7.0's `vitals`; a new device registered before the gateway is up is answered with `503`), the firmware after that, the box last (it covers the USB port).

Every central `docker compose` command is run from the **project root** on the **central machine** the 🖥️ box names; the gateway's from the `edge` folder on the Pi. A practice that changes project files ends with a commit on the `feature/fleet` branch (1.1), which is pushed for the first time in 2.3 so the central machine can fetch it, then merged into `main` in ➕ E. One bot token is still for one backend (Module 27): a second backend is refused by Telegram with `409 Conflict`. [`code/`](code/) holds this week's reference files, five diffs, and the practice material: copy them one by one as each practice says, don't overwrite your whole folder.

The main path: the center on the VPS, the gateway on the Pi. The other paths use the same order; the differences are in the 🔀 boxes:

- **The free path:** the center (broker 1884) and the gateway (1883) on the same Pi; the firmware is downloaded from `http://192.168.1.37` through the device door 8081.
- **Without a Pi:** the center on the laptop; Node 1 connects straight to the laptop's broker, where the device accounts are made (`AUTO_BROKER_ACCOUNTS=center`); the gateway steps are skipped, the proof is the same.
- **Without a Kit:** simulated devices from the `tools/` simulator replace Node 1 and the third board (Practices 6–8 and 10 ticked "simulated"); Practices 5 and 13 wait for a board, Practice 12 becomes a box plan.
- **Wokwi:** like without a Kit; the Wokwi board (a public broker, not `Online` on the **Fleet** screen) claims through the Serial Monitor in Practice 10, not tested by the author.

**How to spread it out, one group per session:** **day 1** 🔁, 🏆, Concepts 1–6, Practices 1–2 · **day 2** Concepts 7–9, Practices 3–4 (in 3.4 Node 1 is connected by USB cable for the Serial Monitor) · **day 3 (needs a board)** Practices 5–7 · **day 4** Practice 8, Practice 10, Concept 10, Practice 11 (Practice 9 optional) · **day 5** Concept 11, measure and match your parts, Practice 12 · **days 6–7** Node 1 runs 24 hours in the box, Practice 13, ➕.

> [!NOTE]
> **Your home during this week.** Practice 2 recreates the central broker: the Pi bridge (without a Pi: Node 1) drops for a few seconds, then reconnects. 3.1 and 3.4 restart the gateway broker (its queue stays intact); do it while the home internet is connected, because a restart while the internet is down makes Node 1's card `Offline` although its data keeps coming in, until the next status. Practice 5 stops Node 1 while it's being uploaded, and 12.2–12.9 power it down while it's being moved (±1.5 hours without data).

### Practice 1 — The workbench: a branch, the fingerprint, a backup, and account notes (10 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, a terminal at the **project root** (1.1); a terminal on the **central machine** at the project root (1.2–1.4): **an SSH terminal to the VPS** (`ssh house@203.0.113.10`, folder `/home/house/mini-smart-home`; the free path: the Pi; without a Pi: the laptop); on the paths with a Pi also **an SSH terminal to the Pi**, folder `mini-smart-home/edge` (1.4). Its materials: 🔁 Step 1 and the backup recipe of [Module 26's 9.1](../module-26-docker-compose/README.md#91-pg_dump-inside-the-container-then-docker-compose-cp-to-backup-8-minutes).
>
> ⭐ **Required** — steps 1.2, 1.3, and 1.4: the history fingerprint recorded, a backup archive in `backup/` on the central machine, and every device written down with its broker and its old account.

#### 1.1 The `feature/fleet` branch from the latest `main` (2 minutes)

In the laptop's terminal:

```text
git switch main
git pull
git switch -c feature/fleet
```

**Expected output (the author's lab):**

```text
Already on 'main'
Your branch is up to date with 'origin/main'.
Already up to date.
Switched to a new branch 'feature/fleet'
```

Practice 1 doesn't change any project file, so there's no commit.

#### 1.2 ⭐ The history fingerprint on the central machine with `scripts/fingerprint.sql` (3 minutes)

In the central machine's terminal (bash; PowerShell, not tested by the author: `Get-Content scripts/fingerprint.sql | docker compose exec -T db psql -U postgres -d smarthome`):

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

**Expected output (the author's lab, simulated "VPS", 15:06 WIB; your numbers differ):**

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2216 | 9c40d88e79751e9e71074453a1cdd187 |       369 |      9 |    3 |        2 |       3
(1 row)
```

Copy your result with its date and WIB time into `learn-iot/module-28/fingerprint.md` under the heading "Before Module 28 (1.2)". The numbers move (Node 1 keeps sending); in [2.4](#24--docker-compose-up--d---build-backend-migration-011-the-dynamic-security-plugin-and-the-download-address-8-minutes), the history up to this time is checked to still be whole after migration 011.

**You pass this ⭐ step** when the full fingerprint row with its date and time is in `fingerprint.md`.

#### 1.3 ⭐ A backup before changing anything: `pg_dump`, then `docker compose cp` to `backup/` (3 minutes)

If Practices 2–4 break something, this archive is restored with the Module 26 9.2 recipe. In the central machine's terminal:

```text
docker compose exec db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
```

**Result:** four normal lines as in Module 26, starting with `pg_dump: warning: there are circular foreign-key constraints on this table:`. No `backup` folder yet? Make it with `mkdir backup`. Then copy the archive out, with today's date in its name:

```text
docker compose cp db:/tmp/smarthome.dump backup/smarthome-2026-11-02-before-m28.dump
```

**Expected output (the author's lab, simulated "VPS"):**

```text
[+] Copying 1/1
 ✔ smarthome-db-1 copy smarthome-db-1:/tmp/smarthome.dump to backup/smarthome-2026-11-02-before-m28.dump Copied            0.0s
```

Check `git status --short`: empty, because `backup/` has been ignored by Git since Module 26. This archive holds your whole history and your accounts: keep it as private data. The broker accounts aren't in it; their backup is in 3.5.

**You pass this ⭐ step** when `backup/` on the central machine holds an archive dated today and `git status --short` doesn't mention it.

#### 1.4 ⭐ Write down every device: `device_id`, version, broker, and its old account (2 minutes)

The device accounts move to dynamic security in Practice 3, so write down how things are now. Run this at the broker Node 1 connects to (the gateway: the `edge` folder on the Pi; without a Pi: the laptop's project root):

```text
docker compose exec mosquitto cut -d: -f1 /mosquitto/data/broker-passwd
```

`cut -d: -f1` only prints the account names; the file's second column is the password's fingerprint, so don't show the whole file.

**Expected output (the author's lab, simulated Pi gateway):**

```text
monitor
checker
f00d00000001
```

`f00d00000001` = Node 1 (simulated, the simulator); your list shows your Node 1's `device_id`: **the old Module 21 account**, moved in [3.4](#34--move-the-old-module-21-accounts-rotate-the-key-the-new-key-over-serial-mosquitto_passwd--d-then-restart-10-minutes). Repeat it at the central machine's project root (the paths with a Pi): the author's lab only got service accounts (`backend`, `pi-bridge`, `monitor`, `checker`); a `device_id` there is an old account too. Write one line per device in `learn-iot/module-28/devices.md`: `device_id`, name, version (🔁 Step 1), broker, and its old account. Node 2 (`1.0.0`) has no broker account: Node 1 publishes its data.

> 🔀 **Without a Kit:** the simulated devices are written down the same way; their version is `0.1.0` (the Module 27 simulator) until 4.2.

**You pass this ⭐ step** when every device is written down with its `device_id`, version, broker, and old account, without passwords or keys.

> ⬆️ **Done with Practice 1?** Continue to [Practice 2](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes). Haven't read [Concept 5](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest) and [Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https) yet? Read them first, because Practice 2 uses both.

### Practice 2 — Contract 1.6, backend 1.5.0, migration 011, and the central broker with dynamic security (30 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, a terminal at the **project root** and in the **`backend`** folder; a terminal on the **central machine** at the project root: **SSH to the VPS** (`ssh house@203.0.113.10`, folder `/home/house/mini-smart-home`; the free path: SSH to the Pi; without a Pi: the laptop); **Bruno** (the **internet** environment; without a Pi: **local**). Concepts used: 3, 5, 6.
>
> ⭐ **Required** — steps 2.2, 2.3, 2.4, and 2.5: 203 tests pass, `config --quiet` stays silent with the plugin password, the logs of migration 011 and the dynamic security plugin show up without the old history changing, then Bruno's `fleet` shows `"ota_ready": true` and Node 1 1.6.0 is still accepted.

The server first, the firmware later: backend 1.4.0 refuses firmware 1.7.0's `vitals` (the author's lab, Node 1 (simulated): `Unrecognized keys`). The gateway follows in Practice 3.

#### 2.1 Contract 1.5 → 1.6: `update`, `vitals`, `config.intervals`, and claim codes (5 minutes)

This project's rule: change the contract first, then the code, then the firmware version. On the laptop, first copy the contents of the **My devices** table in `DATA-CONTRACT.md`, replace the whole file with [version 1.6](code/DATA-CONTRACT.md) (**Copy raw file**), fill that table in again, then save. What changed (section 12):

| Section | What changes in 1.6 |
| :-- | :-- |
| 7 `cmd` | `update` carries `version`, `url`, `sha256`, and `size`; `url` only `<stored server address>/fw/node-1/<version>.bin`; QoS 1, never retained; `ack` `ok:true` = accepted, not finished (Concept 3) |
| 6 `vitals` | `reset_reason` and `fw` (required from firmware 1.7.0 on, always together), plus the `ota` report (Concept 9) |
| 7 `config` | may carry `intervals.vitals_s` (60–3600 seconds); `telemetry` stays at 10 seconds |
| 3 and 5 | the `status` `offline-mode` is used: stopped on purpose, then a clean disconnect without the will |
| 9 | rules 12–14: updates, the 60-second trial period and rollback, deactivated devices (Appendix A of the Syllabus: 14–16) |
| 10 (new) | registration with a claim code (Concept 8) and **the server address format** (2.3) |

Check: `git diff --stat DATA-CONTRACT.md` (the author's lab: `97 insertions(+), 11 deletions(-)`).

#### 2.2 ⭐ Backend 1.5.0 passes 203 tests: `npm ci`, `npm run check`, `npm test`, and `npm audit` (7 minutes)

Backend 1.5.0 changes in 55 files, without a new npm package: the locked download route `/fw`, releases, the fleet, claim codes, automatic broker accounts, contract 1.6, 11 Bruno requests, and migration 011 ([`code/backend/`](code/backend/)). The fastest way (tested by the author on Linux on a copy of the Module 27 project; Windows/macOS not yet): open [`code/backend-1.5.diff`](code/backend-1.5.diff), click **Download raw file**, save it at the project root, then in a terminal at the project root:

```text
git apply --check backend-1.5.diff
```

No output = it can be applied: run it again without `--check`, then delete the diff file. Refused (you changed a file at some point, or CRLF on Windows)? Not a single file has been applied yet: copy the 55 files listed by `git apply --stat backend-1.5.diff` from `code/backend/` (**Copy raw file**; write your `LABEL` in the `Dockerfile` again). An excerpt of migration 011 ([the whole file](code/backend/migrations/011_ota_and_fleet.sql)):

```sql
CREATE TABLE firmware (
  -- …
  size         integer NOT NULL CHECK (size > 0 AND size <= 1966080),    -- at most = one Minimal SPIFFS program shelf
  sha256       text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),           -- the file content's fingerprint, computed by the server
  -- …
);
-- …
CREATE UNIQUE INDEX updates_one_running ON updates (device_id) WHERE status IN ('sent', 'accepted', 'downloading');
```

The `updates` table records every `update` command (its index refuses a second update running at the same time), `claim_codes` only stores the codes' SHA-256, and `devices` gets `fw`, `fw_seen_at`, `reset_reason`, `canary`, and `vitals_interval_s`. In a terminal in the `backend` folder, one by one: `npm ci`, `npm run check`, `npm test`, then `npm audit`.

**Expected output (the author's lab, 3 November 2026, cut):**

```text
added 225 packages, and audited 226 packages in 7s
4 moderate severity vulnerabilities
> mini-smart-home-backend@1.5.0 check
> tsc --noEmit
 Test Files  25 passed (25)
      Tests  203 passed (203)
# npm audit report
glob  3.0.0 - 14.0.1
Will install @fastify/swagger-ui@2.1.0, which is a breaking change
4 moderate severity vulnerabilities
```

`npm test` takes ±20 seconds in the author's lab (one test deliberately waits 5 seconds); red? Compare your files with `code/backend/`. Module 27 wrote `found 0 vulnerabilities` with the same packages; as of 2 November 2026 there are two new vulnerability reports (`glob`, `minimatch`) in the package chain of the `/docs` page; this backend doesn't call `glob`, and the fix isn't in our version range yet. **Don't** run `npm audit fix --force`: it means going *down* to the ancient `@fastify/swagger-ui` 2.1.0 ([Limits of v1.5](code/backend/README.md#limits-of-v15)). The audit numbers depend on the date.

**You pass this ⭐ step** when `npm test` writes `25 passed (25)` and `203 passed (203)`, and `npm run check` has no errors.

#### 2.3 ⭐ The infrastructure files and the central machine's `.env`: `MOSQUITTO_DYNSEC_PASSWORD` and `SERVER_URL` (6 minutes)

**The laptop, the project root.** Replace the contents of these files with the files of the same name in [`code/`](code/) (**Copy raw file**): `compose.cloud.yml`, `.env.example` (write your old `IMAGE_REGISTRY` again, if you have one), `.gitignore` (+ `*.bin`, `firmware/**/build/`, `firmware-data/`), `edge/center.conf`, `edge/center-internet.conf`, `edge/acl-broker` (write your `device_id` in block 2 again and open block 2b again if it was open before, as in Module 27), `frontend/caddy/Caddyfile`, and the new file `scripts/backup-broker-accounts.sh` (for 3.5; on Windows, VS Code's status bar must say `LF`). The other `edge/` files follow in 3.1. What's new in `compose.cloud.yml`:

```yaml
x-backend-settings: &backend-settings
  # …
  SERVER_URL: ${SERVER_URL:-}
  AUTO_BROKER_ACCOUNTS: ${AUTO_BROKER_ACCOUNTS:-off}
  OTA_TIMEOUT_MINUTES: ${OTA_TIMEOUT_MINUTES:-10}
# …
  mosquitto:
    # …
      MOSQUITTO_DYNSEC_PASSWORD: ${MOSQUITTO_DYNSEC_PASSWORD:?fill in MOSQUITTO_DYNSEC_PASSWORD in .env (random, at least 12 characters)}
# …
  backend:
    # …
      - firmware-data:/app/firmware-data
# …
  web:
    # …
      - "${WEB_ADDRESS:-127.0.0.1}:${PORT_WEB:-80}:${WEB_INNER_PORT:-80}"
```

The new cupboard `firmware-data` is only mounted on `backend`, the last number of the `web` counter = the door inside the container, and the image tags move up to backend 1.5.0 and web 1.4.0. In `edge/center.conf` and `edge/center-internet.conf`, the plugin is loaded next to the password file and the permission list:

```text
password_file /mosquitto/data/broker-passwd
acl_file /mosquitto/config/acl-broker
plugin /usr/lib/mosquitto_dynamic_security.so
plugin_opt_config_file /mosquitto/data/dynamic-security.json
```

In `edge/acl-broker`, `backend` gets four control-topic lines and `pi-bridge` two (service accounts stay in the password file, device accounts in dynamic security):

```text
user backend
# …
topic write $CONTROL/dynamic-security/v1
topic read $CONTROL/dynamic-security/v1/response
topic write msh-gateway/+/dynamic-security/v1
topic read msh-gateway/+/dynamic-security/v1/response
# …
topic write $SYS/broker/connection/pi-bridge/state
topic read msh-gateway/pi1/dynamic-security/v1
topic write msh-gateway/pi1/dynamic-security/v1/response
```

In the `Caddyfile`, `/fw/*` is passed on to the backend without compression, above the page fallback, and the site `:8081` = the device door (Concept 6):

```text
	@compressible not path /fw/*
	encode @compressible zstd gzip
	# …
	handle /fw/* {
		reverse_proxy backend:8080
	}
# …
:8081 {
	# …
	handle /api/provision/claim {
		uri strip_prefix /api
		reverse_proxy backend:8080
	}
	# …
}
```

The new Caddyfile is only read when `web` is recreated in 4.1; until then `/fw/…` is answered with the dashboard page (the author's lab), which is fine because there's no firmware yet. Save, then push this branch for the first time (`.env` doesn't go along):

```text
git add DATA-CONTRACT.md backend compose.cloud.yml .env.example .gitignore edge scripts frontend/caddy
git commit -m "Module 28 Practice 2: contract 1.6, backend 1.5.0, central broker dynamic security"
git push -u origin feature/fleet
```

**The central machine, the project root** (without a Pi: skip it, your laptop is already on this branch): `git fetch`, then `git switch feature/fleet`. Refused because of `edge/acl-broker`? `git stash`, repeat, then `git stash pop`. Make a new random plugin password (the command in the head of `.env.example`; a VPS without Node.js uses the second line):

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

This password is used **once**, when the broker first starts with Module 28, but whoever holds it controls every broker account: keep it in your password manager, not in Git or notes. The gateway gets a different password in 3.1. Then open `.env` (VPS and Pi: `nano .env`):

1. In the secrets part, add `MOSQUITTO_DYNSEC_PASSWORD=` followed by that password.
2. At the end of the file, add `SERVER_URL`, `WEB_INNER_PORT`, and `AUTO_BROKER_ACCOUNTS` (= the "Fleet" block of `.env.example`) according to your place's column. `WEB_ADDRESS` and `MQTT_ADDRESS` have been there since Modules 26–27: change their lines if your column differs.

| Setting | Laptop without a Pi | VPS (main path) | Pi (free path) |
| :-- | :-- | :-- | :-- |
| `MOSQUITTO_DYNSEC_PASSWORD` | random ≥ 12 | random ≥ 12 | random ≥ 12 (+ the gateway's `edge/.env`: another random one) |
| `SERVER_URL` | `http://192.168.1.10` | `https://iot.yourname.my.id` | `http://192.168.1.37` |
| `AUTO_BROKER_ACCOUNTS` | `center` | `gateway:pi1` | `gateway:pi1` |
| `WEB_ADDRESS` | `0.0.0.0` (phone mode) | `0.0.0.0` (already, Module 27) | `192.168.1.37` |
| `WEB_INNER_PORT` | empty (= 80) | empty (= 80) | `8081` |
| `MQTT_ADDRESS` | `0.0.0.0` (Node 1 to the laptop's broker) | `127.0.0.1` | `172.17.0.1` |
| `OTA_TIMEOUT_MINUTES` | empty (= 10) | empty (= 10) | empty (= 10) |

`SERVER_URL` is written without a `/` at the end and **exactly the same** as what you'll type later in Node 1's Serial Monitor or portal (5.4, 10.3): Node 1 only downloads from that address. Its format (contract section 10): at most 64 characters, lowercase, a server name without underscores, a port 1–65535, `http://` only to a home IP address; otherwise the backend refuses to start and writes the reason in its log. Empty = over-the-air updates off. The free-path Pi: without `:8081` (that's the door inside the container). Without a Pi, the laptop works like [Module 23's phone mode](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode): its firewall allows port 80 during the practice (put it back afterwards), and the laptop must not sleep during an update. The center on the laptop with a Pi gateway, as in Module 26? Use the "Laptop + Pi gateway" column of `.env.example`. `OTA_TIMEOUT_MINUTES` was only shortened in the author's lab (3 minutes). Check:

```text
docker compose config --quiet
```

**Expected output (the author's lab, simulated "VPS"):** no output = it matches. Without the plugin password line, Compose stops ([🚨](#-troubleshooting)):

```text
error while interpolating services.mosquitto.environment.MOSQUITTO_DYNSEC_PASSWORD: required variable MOSQUITTO_DYNSEC_PASSWORD is missing a value: fill in MOSQUITTO_DYNSEC_PASSWORD in .env (random, at least 12 characters)
```

In the author's lab, the Module 27 `.env` plus only the plugin password already passed (its `config` output differs from Module 27's only in the image tags, three backend variables, the `firmware-data` cupboard, and the plugin password), and empty fleet settings behave as in Module 27. Until 4.1, only start the services you name: `docker compose up -d` without a name builds the web 1.4.0 image from the old dashboard.

**You pass this ⭐ step** when the central machine is on the `feature/fleet` branch, its `.env` holds a random plugin password and the settings of your place's column, and `config --quiet` has no output.

#### 2.4 ⭐ `docker compose up -d --build backend`: migration 011, the dynamic security plugin, and the download address (8 minutes)

Node 1 keeps sending, so `readings` in `scripts/fingerprint.sql` will certainly go up; what must not change is the history up to the time of 1.2. On the central machine, run this query **before** the new backend (its date and time = your 1.2 note, `+07` = WIB), then save the result:

```text
docker compose exec db psql -U postgres -d smarthome -c "SELECT count(*) AS readings, md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) AS fingerprint FROM readings AS r WHERE r.ts <= '2026-11-02 15:06:31+07'"
```

Then:

```text
docker compose up -d --build backend
```

Compose builds the 1.5.0 mold on the central machine itself (VPS: as in Module 27 7.4). In the author's lab (±12 seconds, layers from the cache) it writes `Built` for backend 1.5.0, `Created` for the cupboard `smarthome_firmware-data`, `Exited` for `migrate`, and `Started` for `mosquitto` (the new plugin password variable) and `backend`; `db` isn't touched, `web` stays at 1.3.0 until 4.1. Read the logs: `docker compose logs migrate mosquitto backend`.

**Expected output (the author's lab, simulated "VPS", cut; backend times WIB, broker numbers = seconds):**

```text
migrate-1  | applied: 011_ota_and_fleet.sql
migrate-1  | 1 new migration(s) applied, 8 applied earlier.
mosquitto-1  | 1793607032: Loading plugin: /usr/lib/mosquitto_dynamic_security.so
mosquitto-1  | 1793607032: Dynamic security plugin config not found, generating a default config.
mosquitto-1  | 1793607032:   Using admin password from MOSQUITTO_DYNSEC_PASSWORD environment variable
mosquitto-1  | 1793607032: Plugin dynamic-security loaded.
backend-1  | [15:10:37] INFO: firmware download address for devices: https://iot.yourname.my.id/fw/node-1/<version>.bin
backend-1  | [15:10:37] INFO: device broker accounts: gateway broker pi1 (AUTO_BROKER_ACCOUNTS)
```

`config not found` = the plugin makes `dynamic-security.json` in the broker's cupboard (only once). Without a Pi: `central broker`; `SERVER_URL` empty: `over-the-air firmware updates OFF: SERVER_URL not set`. The Pi bridge drops for ±4 seconds, then reconnects; Node 1 stays at the gateway (without a Pi: it drops briefly, then logs in again with its Module 21 account). Repeat the fingerprint query from before: the result must be exactly the same. In the author's lab, the query bounded by the time of 1.2 (15:06:31 WIB) wrote `2216` and `9c40d88e79751e9e71074453a1cdd187` after the migration, the same as the 1.2 row.

**Don't register or claim a new device until Practice 3 is done:** the gateway broker can't receive account commands yet, so the backend answers `503` (the author's lab, after ±6 seconds: `not saved in the database yet (… gateway broker pi1 didn't answer setDefaultACLAccess within 3 seconds). …`).

**You pass this ⭐ step** when the logs hold `applied: 011_ota_and_fleet.sql`, `Plugin dynamic-security loaded.`, and your download address, and the fingerprint bounded by the time of 1.2 is the same before and after.

#### 2.5 ⭐ Backward compatible: Bruno `fleet`, no releases yet, and Node 1 1.6.0 still accepted (4 minutes)

In Bruno, send **`login admin`**, then **`fleet`** and **`firmware release list`**.

**Expected output (the author's lab, simulated Node 1 and Garden, Bruno through a script; cut):**

```text
GET {{baseUrl}}/fleet -> 200 OK (58 ms)
  "settings": { "ota_ready": true, "broker_accounts": "gateway broker pi1" },
  f00d00000001: "status": "online", "fw": "0.1.0", "health": {… "reset_reason": null},
                "can_update": false, "blocked_reason": "no firmware release yet"
  f00d000000b2: "blocked_reason": "Node 2 (ESP-NOW): OTA isn't available, update it by cable"
GET {{baseUrl}}/firmware -> 200 OK (30 ms)
{ "latest": { "node1": null }, "releases": [] }
```

The Module 27 simulator writes `fw` `0.1.0`; your Node 1 `1.6.0` (without a Kit: `0.1.0` until 4.2). Node 1 can't be updated yet because there's no release yet (Practice 6), its `reset_reason` is empty because 1.6.0 doesn't send it yet, and Node 2 really isn't updated over the air (Concept 7). The 1.6.0 `vitals` (every 5 minutes) are still accepted; 5 minutes after 2.4, on the central machine:

```text
docker compose logs backend | grep -c REJECTED
```

**Result (the author's lab):** `0` (PowerShell, not tested by the author: `… | Select-String REJECTED` without output). Everything was already pushed in 2.3. The way back, if needed: the backend 1.4.0 and web 1.3.0 images are still there, migration 011 only adds (backend 1.4.0 still runs on top of it), and the broker follows "Going back to Module 27" in [`code/edge/README.md`](code/edge/README.md).

**You pass this ⭐ step** when `fleet` shows `"ota_ready": true` and your path's `broker_accounts`, `firmware release list` shows `"releases": []`, and `REJECTED` = `0`.

> ⬆️ **Done with Practice 2?** Read [Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota) to [Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason), then continue to [Practice 3](#practice-3--automatic-broker-accounts-at-the-gateway-moving-the-module-21-accounts-and-an-account-backup-35-minutes). Until Practice 3 is done, don't register or claim a new device: the backend will answer `503`.

### Practice 3 — Automatic broker accounts at the gateway, moving the Module 21 accounts, and an account backup (35 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, a terminal at the **project root** (the start of 3.1); **an SSH terminal to the Pi**, folder `mini-smart-home/edge` (3.1–3.5); **Bruno** (**`login admin`** first; 3.2, 3.4); **Arduino IDE** with a USB cable to Node 1 and the **Serial Monitor** (3.4); **an SSH terminal to the VPS**, folder `/home/house/mini-smart-home` (3.2, 3.5); your password manager. Concepts used: 8 (3.4 points ahead to 10).
>
> ⭐ **Required** — steps 3.1 (the paths with a Pi), 3.2, 3.3, 3.4, and 3.5: the gateway broker loads dynamic security, the practice device's account is made by the backend itself and only reads its own `cmd`, the old Module 21 accounts are moved and deleted from the password file, then the broker accounts are backed up.

Since 2.4, backend 1.5.0 on the VPS is ready to make device accounts, but Node 1 connects to the gateway broker on the Pi, which doesn't load the plugin yet. This practice turns that plugin on at the gateway, opens the way for command letters through the bridge ([Concept 8](#8-a-new-device-in-1-minute-identity-claim-codes-and-automatic-broker-accounts)), then moves the old accounts. The **Expected output** boxes come from the author's lab: the VPS, the Pi, and the internet simulated on one machine; Node 1 = a simulated device from the simulator.

> 🔀 **Without a Pi:** Node 1 connects straight to the laptop's central broker, which has loaded the plugin since 2.4 (`AUTO_BROKER_ACCOUNTS=center`). From 3.1, only the five files + the commit on the laptop are needed; 3.2–3.5 run in the laptop's terminal, at the project root (Windows: `grep` → `Select-String`, `MSYS_NO_PATHCONV=1 sh scripts/…` in Git Bash; not tested by the author), and its broker log lines start with `dynsec: backend/backend | …`. **The free path:** the gateway (1883) and the center (1884) on the same Pi; your bridge stays the HOME PATH block (Module 27), so the 3.1 log writes `Connecting bridge center (center:1884)`. **Without a Kit:** your Node 1 is the simulated device `f00d00000001`; the only difference is in 3.4.

#### 3.1 ⭐ The gateway goes up: the plugin password in `edge/.env`, two bridge remap lines, then restart the broker (10 minutes)

The gateway needs five `edge/` files that weren't copied in 2.3: [`gateway.conf`](code/edge/gateway.conf) (two plugin lines), [`bridge.example.conf`](code/edge/bridge.example.conf) (two remap lines), [`compose.edge.yml`](code/edge/compose.edge.yml) (the plugin password required), [`.env.example`](code/edge/.env.example), and [`README.md`](code/edge/README.md). On the laptop, open them one by one on GitHub, click **Copy raw file**, paste it over the contents of the file with the same name in the `edge` folder, then:

```text
git add edge
git commit -m "Module 28 Practice 3: gateway dynamic security"
git push
```

**Result (the author's lab):** `5 files changed, 77 insertions(+), 13 deletions(-)`. In the SSH terminal to the Pi, the `edge` folder (the free path: the Pi is already on this branch, just `git pull`):

```text
git fetch -q
git switch feature/fleet
```

**Result (the author's lab):** it ends with `Switched to a new branch 'feature/fleet'`. Refused because of `edge/acl-broker`? `git stash`, repeat, then `git stash pop` (as in Module 27).

The gateway's plugin password: random, at least 12 characters, **different** from the center's password of 2.3. Make it with the command from `edge/.env.example`:

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Open `nano .env`, add the line `MOSQUITTO_DYNSEC_PASSWORD=` followed by the result, save (**Ctrl + O**, **Enter**, **Ctrl + X**), then check it without showing the password:

```text
grep -c '^MOSQUITTO_DYNSEC_PASSWORD=.\{12,\}' .env
```

```text
docker compose config --quiet
```

**Result (the author's lab):** `1`, then `config` without output. Without that line (or with it empty), `config` stops with `… is missing a value: fill in MOSQUITTO_DYNSEC_PASSWORD in edge/.env (random, at least 12 characters)`. Whoever holds this password controls every account of the gateway: keep it out of Git and your study notes.

Then the two remap lines: open `nano bridge/center.conf`, and paste the last two lines of `bridge.example.conf` below `topic msh/+/cmd in 1`:

```text
topic dynamic-security/v1 in 1 $CONTROL/ msh-gateway/pi1/
topic dynamic-security/v1/response out 1 $CONTROL/ msh-gateway/pi1/
```

`pi1` = the gateway's name in `AUTO_BROKER_ACCOUNTS=gateway:pi1` (2.3). `grep -n dynamic-security bridge/center.conf` must show exactly those two lines; this file holds the `pi-bridge` password, so it stays out of Git. The Compose settings changed, so the broker is recreated (not a HUP, which throws away the store-and-forward queue; Module 27).

```text
docker compose up -d --force-recreate mosquitto
```

**Result (the author's lab):** `✔ Container smarthome-gateway-mosquitto-1  Started  1.1s`. Then `docker compose logs mosquitto`.

**Expected output (the author's lab, cut; the prefix `mosquitto-1  | <seconds>:` removed):**

```text
Restored 1 client messages
Loading plugin: /usr/lib/mosquitto_dynamic_security.so
Dynamic security plugin config not found, generating a default config.
  Using admin password from MOSQUITTO_DYNSEC_PASSWORD environment variable
Plugin dynamic-security loaded.
Warning: File /mosquitto/config/acl-broker has world readable permissions. Future versions will refuse to load this file.
Connecting bridge center (mqtt.yourname.my.id:8883)
```

`Restored … client messages` = the queue that survived. `config not found, generating` comes only once, when the account book `dynamic-security.json` is made in the gateway broker's cupboard. `world readable` since Module 26: ignore it. Node 1 drops briefly, then logs in again (lab: ±4 seconds).

**You pass this ⭐ step** when the gateway log holds `Plugin dynamic-security loaded.` and `Connecting bridge center (…)`, and Node 1 is `Online` again.

#### 3.2 ⭐ The practice device: its broker account is made automatically on the gateway broker `pi1` (8 minutes)

Register a new practice device, then watch its account appear at the gateway without any manual step on the Pi. `f00d00000001` has been registered since Module 21 (answered with `409`), so use `f00d00000005`: in Bruno, clone **`register practice device`**, change the `device_id` in the **Body** tab to `f00d00000005` and its `name` (for example `Gateway practice`), send it, save its key, then delete that clone.

**Expected output (the author's lab, simulated TLS bridge):** `201 Created` (174 ms), with the third of its `steps`:

```text
Broker: account f00d00000005 already created automatically at gateway broker pi1 (dynamic security): no manual step at the broker
```

Its key is shown once: keep it in your password manager and in the laptop's `tools/.env` (outside Git) as `KEY_F00D00000005=<key>`. This practice device is used again in [4.2](#42--simulated-170-devices-from-the-tools-simulator-6-minutes) and [11.3](#113--deactivate-the-third-board-its-broker-account-deleted-disconnected-at-once-6-minutes). On the Pi, `docker compose logs mosquitto | grep dynsec`. **Expected output (the author's lab, prefix removed):**

```text
dynsec: local.pi-bridge/(null) | setDefaultACLAccess | acltype=publishClientReceive | allow=false
dynsec: local.pi-bridge/(null) | createClient | username=f00d00000005 | password=*****
```

The command for that practice account was carried by the bridge (`local.pi-bridge`): the default read permission becomes deny first, then the account is made; its password isn't printed. The VPS backend log (`docker compose logs backend | grep 'read permission'`) writes once `broker accounts: default read permission of device accounts at gateway broker pi1 = deny (the acl-broker %u pattern applies)`. Answered with `503` after ±6 seconds? Check 3.1, then repeat ([🚨](#-troubleshooting) *Registering or claiming a device answered with `503` …*).

**You pass this ⭐ step** when Bruno answers `201` and the gateway log holds `createClient | username=f00d00000005`.

#### 3.3 ⭐ A device account only reads its own `cmd` (4 minutes)

Accounts made by the backend get no role: their permissions are still the `%u` pattern in `acl-broker`. Prove it with the practice device's account, for 20 seconds while Node 1 is sending. On the Pi, replace `<key>` with the key of `f00d00000005`:

```text
docker compose exec mosquitto mosquitto_sub -u f00d00000005 -P <key> -t 'msh/#' -t '$SYS/#' -v -W 20
```

**Result (the author's lab):** after 20 seconds only `Timed out`, although Node 1 (simulated) sent two `telemetry` and its retained status is on the broker; no `$SYS` either. The `monitor` account receives all of it; a device account may only read its own `cmd` (the path of `update` in Practice 7).

Its key is now in the Pi's terminal history: that's why the practice device is used. **Don't** use Node 1's account: client name = account name (`use_username_as_clientid`, Module 21), so its session would be taken over.

Optionally, look at the default permissions (the admin password is read inside the container, not typed):

```text
docker compose exec mosquitto sh -c 'mosquitto_ctrl -u admin -P "$MOSQUITTO_DYNSEC_PASSWORD" dynsec getDefaultACLAccess'
```

**Expected output (the author's lab; the two warning lines `without encryption` above it are normal):**

```text
publishClientSend    : deny
publishClientReceive : deny
subscribe            : deny
unsubscribe          : allow
```

**You pass this ⭐ step** when `mosquitto_sub` ends with `Timed out` without a single message, although Node 1 is sending.

#### 3.4 ⭐ Move the old Module 21 accounts: rotate the key, the new key over Serial, `mosquitto_passwd -D`, then restart (10 minutes)

The motto: service accounts in the password file, device accounts in dynamic security. Node 1 is still in the password file, while **Deactivate** (Practice 11) only deletes the dynamic security account: an old line left behind brings its key back to life ([Concept 10](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect)). Move every old account in your 1.4 notes, one by one, while the internet is connected. For Node 1: turn the MB102 off, move the USB cable from the charger to the laptop, turn the MB102 on (the golden power rules: loads from the MB102, not an ESP32 pin, a shared GND), and open the Serial Monitor (115200 baud, **New Line**): Node 1 restarts with its old key, which is still accepted. Then:

1. **Rotate the key.** In Bruno, clone **`rotate practice device key`**, change its URL to `{{baseUrl}}/devices/<Node 1's device_id>/key`, send it, keep its new key (shown once) in your password manager, then delete that clone. Its answer is `200` with the `steps` line `Broker: account <device_id> already created automatically at gateway broker pi1 …`. From then on, the gateway refuses the old key even though its line is still there (the plugin is read first).
2. **Install the new key right away:** type it in the Serial Monitor's send field, then press **Enter** (the recipe of [Module 21's 3.6](../../phase-3-backend-data/module-21-device-broker-security/README.md#36-device-path-upload-then-install-node-1s-key-10-minutes)):

   ```text
   key <new key>
   ```

   **What the Serial Monitor shows (text from the 1.6.0 code, cut; not yet recorded by the author on a board):**

   ```text
   key: stored in NVS, 43 chars, ending ...<last 4 characters>
   key: Node 1 is trying to connect to the broker as <device_id> with this key now.
   ```

   Right away, because a Node 1 that reconnects with its old key is refused (the author's lab, a simulated device: `disconnected: not authorised.`) and only tries again 60 seconds later; the longer it takes, the bigger the chance of a `📴` on Telegram.
3. **Delete its old line** (the Pi, the `edge` folder), then check:

   ```text
   docker compose exec -u mosquitto mosquitto mosquitto_passwd -D /mosquitto/data/broker-passwd <device_id>
   ```

   ```text
   docker compose exec mosquitto cut -d: -f1 /mosquitto/data/broker-passwd
   ```

   **Result (the author's lab):** only `monitor` and `checker` are left (yours may also have `nodered` and other old accounts).
4. **Restart, not HUP:**

   ```text
   docker compose restart mosquitto
   ```

   **Result (the author's lab):** `✔ Container smarthome-gateway-mosquitto-1  Started  0.6s`, and Node 1 logs in again. The author deliberately restarted it while the internet was unplugged: `Restored 5 client messages`, with no `telemetry` lost, but the `offline` will and the queued `online` message arrived in reverse order, so Node 1's card was `Offline` although its data came in, until its status changed. Do it while the internet is connected. Put Node 1's cable back on the charger in the same order.

Repeat 1–4 for the other old accounts in your 1.4 notes, for example the practice device `f00d00000001` (step 2: the 🔀 below). Device accounts at the central broker (Module 27's Practice 13) only need steps 3–4 at the central machine's project root. Node 2 has no broker account.

> 🔀 **Without a Kit:** the simulator has no `key` command: write the new key in `KEY_F00D00000001=` in `tools/.env`, stop the simulator (**Ctrl + C**), then run the same command again.

Step 3 is required: in the author's lab, a device whose old line was left behind, then deactivated, was accepted again with its Module 21 key ([🚨](#-troubleshooting) *A deactivated device still gets in …*).

**You pass this ⭐ step** when `cut -d: -f1` at the gateway shows only service accounts, and Node 1 is `Online` with its new key.

#### 3.5 ⭐ Back up the broker accounts with `scripts/backup-broker-accounts.sh` (3 minutes)

The device accounts now live in the broker's cupboard (`dynamic-security.json`), and from Practice 6 on, the firmware files live in the `firmware-data` cupboard. `docker compose down -v` deletes both: every device needs a new key, every firmware file has to be uploaded again. This script (copied in 2.3) copies them to `backup/`, completing the database backup of 1.3; the recipe to restore them is in its head:

```sh
#!/bin/sh
# backup-broker-accounts.sh - Module 28: copies the broker accounts from the Docker cupboard to the backup/ folder (not in Git):
#   - dynamic-security.json = the DEVICE accounts made by the backend (claim codes, key rotation) + the plugin's admin account
#   - broker-passwd         = the service accounts (backend, pi-bridge, monitor, ...) and the old Module 21 device accounts
#   - firmware-data/        = the firmware files the admin uploaded (only at the CENTER, where the backend service runs)
# The broker cupboard and the firmware cupboard belong to Compose: "docker compose down -v" deletes them. Without this backup, every
# device needs a new key and every firmware file has to be uploaded again. It completes the Module 26 database backup recipe (pg_dump).
#
# Run it from the project ROOT for the central broker (laptop, VPS, free-path Pi):  sh scripts/backup-broker-accounts.sh
#        from the edge folder on the Pi for the gateway broker:                   sh ../scripts/backup-broker-accounts.sh
# The result: backup/broker-accounts-<date-time>/ in the folder where the command was typed, readable only by its owner. Its content
# is SECRET (password fingerprints, and a Node 1 .bin file may contain the ESP-NOW key): don't send it to a forum, an issue, or an AI.
#
# Restoring into a new cupboard (the broker never started with Module 28, or its cupboard is gone), from the same folder:
#   docker compose cp backup/broker-accounts-<date-time>/dynamic-security.json mosquitto:/mosquitto/data/
#   docker compose cp backup/broker-accounts-<date-time>/broker-passwd mosquitto:/mosquitto/data/
#   docker compose restart mosquitto        (when it starts, the image hands both files over to the mosquitto user)
#   center only: docker compose cp -a backup/broker-accounts-<date-time>/firmware-data/. backend:/app/firmware-data/
#                (-a: the files become owned by the container's user, node)
set -eu

dest="backup/broker-accounts-$(date +%Y-%m-%d-%H%M)"
mkdir -p "$dest"
chmod 700 "$dest"

# docker compose cp copies from the container of a running service (its cupboard is read with it)
for file in dynamic-security.json broker-passwd; do
  if docker compose cp "mosquitto:/mosquitto/data/$file" "$dest/$file" 2>/dev/null; then
    echo "copied: $file"
  else
    echo "missing: $file (the broker has never used this file, or the mosquitto service isn't running)"
  fi
done

# Firmware files only exist at the center. On the gateway (the edge folder) there is no backend service: skipped.
if docker compose ps --services --status running 2>/dev/null | grep -qx backend; then
  docker compose cp backend:/app/firmware-data "$dest/firmware-data"
  echo "copied: firmware-data ($(find "$dest/firmware-data" -name '*.bin' | wc -l) .bin files)"
fi

chmod -R go-rwx "$dest"
echo "done: $dest"
```

On the VPS, at the project root (the free path: the Pi; without a Pi: the laptop):

```text
sh scripts/backup-broker-accounts.sh
```

**Expected output (the author's lab, simulated "VPS"; times WIB, your folder uses your machine's clock):**

```text
copied: dynamic-security.json
copied: broker-passwd
[+] Copying 1/1
 ✔ smarthome-backend-1 copy smarthome-backend-1:/app/firmware-data to backup/broker-accounts-2026-11-02-1518/firmware-data Copied       0.0s
copied: firmware-data (0 .bin files)
done: backup/broker-accounts-2026-11-02-1518
```

`0 .bin files` is normal before Practice 6: repeat the script after uploading firmware. On the Pi, the `edge` folder: `sh ../scripts/backup-broker-accounts.sh`. **Result (the author's lab):** `copied: dynamic-security.json`, `copied: broker-passwd`, `done: backup/broker-accounts-2026-11-02-1519` (the gateway has no backend, so no `firmware-data`). The backup folder is `drwx------`, and `git status --short` is empty (`backup/` is ignored by Git). Its contents are secret: the password fingerprints of every account, and a `.bin` file holds the ESP-NOW key and the portal password. In the author's lab, the recipe in the script's head (back then without `-a`) restored the simulated devices' accounts and the firmware downloads (`200`) after a deliberate `docker compose down -v`; don't test it at your home ([🚨](#-troubleshooting) *Firmware files gone from the `firmware-data` cupboard*).

**You pass this ⭐ step** when `backup/broker-accounts-…` on the central machine and on the Pi holds `dynamic-security.json` and `broker-passwd`, and `git status --short` doesn't mention it.

> ⬆️ **Done with Practice 3?** Continue to [Practice 4](#practice-4--dashboard-140-and-the-fleet-screen-with-simulated-devices-25-minutes): dashboard 1.4.0 and the Fleet screen, tried first with simulated devices.

### Practice 4 — Dashboard 1.4.0 and the Fleet screen with simulated devices (25 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, a terminal in the **`frontend`** and **`tools`** folders and at the **project root**; a terminal on the **central machine** at the project root (**SSH to the VPS**, folder `/home/house/mini-smart-home`; the free path: SSH to the Pi; without a Pi: the laptop); **Chrome** with DevTools (**F12**); a **phone** (4.5); **Bruno** (4.4, optional). Node 1 stays at 1.6.0. Concepts used: 7, 9.
>
> ⭐ **Required** — steps 4.1, 4.2, and 4.3: the web 1.4.0 image runs with the **Fleet** menu, the simulator writes `online (firmware 1.7.0)` for your practice device, and the **Fleet** screen shows every device's version and health.

The server has stored the devices' versions and health since Practice 2; dashboard 1.4.0 adds their screen, **Fleet**, without a new npm package. Before Node 1 runs 1.7.0 in Practice 5, that screen is filled with simulated 1.7.0 devices from the `tools/` simulator. The **Expected output** boxes come from the author's lab: the "VPS", the Pi, and the internet simulated on one machine; every device = the simulator.

#### 4.1 ⭐ Dashboard 1.4.0: `npm run build`, then `docker compose up -d --build web` (8 minutes)

The dashboard changes in 28 files; one of them, `frontend/caddy/Caddyfile`, you already copied in 2.3. Use the 2.2 way on the laptop (tested by the author on Linux): download [`code/frontend-1.4.diff`](code/frontend-1.4.diff) with **Download raw file** to the project root, then in a terminal at the project root:

```text
git apply --check --exclude=frontend/caddy/Caddyfile frontend-1.4.diff
```

No output = it can be applied: run it again without `--check`, then delete the diff file (without `--exclude`, Git refuses the Caddyfile that's already new). Refused? As in 2.2: copy the files listed by `git apply --stat frontend-1.4.diff` from `code/frontend/`. `git status --short frontend` now names 10 new files and 17 changed files. Then in a terminal in the `frontend` folder, one by one: `npm ci`, `npm run lint`, `npm run build`, and `npm run check-schema`.

**Expected output (the author's lab, 3 November 2026, cut; four commands in a row):**

```text
added 424 packages, and audited 425 packages in 17s
10 vulnerabilities (2 low, 8 moderate)
Found 0 warnings and 0 errors.
✓ 1195 modules transformed.
(!) Some chunks are larger than 500 kB after minification. Consider:
PWA v2.0.0
precache  10 entries (1097.39 KiB)
SAME  src/schemas/contract.ts
SAME  src/schemas/rule-basics.ts
```

The chunk warning has been there since Module 23. The audit numbers depend on the date: as of 2 November 2026 all ten are in the build tools under `vite-plugin-pwa` (`deepmerge`, `glob`, `minimatch`), and `npm audit --omit=dev` writes `found 0 vulnerabilities` (the author's lab). **Don't** run `npm audit fix --force`: it suggests going *down* to `vite-plugin-pwa` 1.1.0. In a terminal at the project root:

```text
git add frontend
git commit -m "Module 28 Practice 4: dashboard 1.4.0 (Fleet screen)"
git push
```

In the central machine's terminal, at the project root: `git pull` (without a Pi: skip it), then build the web image, as in [Module 27's 7.4](../module-27-deploy-internet-tls-pwa/README.md#74-docker-compose-build-on-the-vps-before-the-other-services-start-12-minutes):

```text
docker compose up -d --build web
```

**Expected output (the author's lab, simulated "VPS", cut; ±35 seconds because the `npm ci` layer is already cached; on your machine `npm ci` runs too):**

```text
 ✔ ghcr.io/<account>/mini-smart-home-web:1.4.0  Built
 ✔ Container smarthome-web-1                     Started
```

Now `docker compose up -d` without a service name is safe again, and the 2.3 Caddyfile applies (`/fw/*` and the device door `:8081`, [Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https)). Open the dashboard in Chrome as admin: the **Fleet** menu is next to **Rules**. Not there? Reload once more: the service worker uses the new version on the next opening ([Module 27's Concept 11](../module-27-deploy-internet-tls-pwa/README.md#11-pwa-from-a-shortcut-to-an-app)).

> 🔀 **The free path:** the PORTS column of `docker compose ps web` now holds `192.168.1.37:80->8081/tcp` (the 2.3 setting), so the home Wi-Fi only sees the device door, and `http://192.168.1.37` in a browser is answered with `This door is only for devices …` (right; the dashboard still goes through the tunnel).

**You pass this ⭐ step** when `npm run build` writes `PWA v2.0.0`, `check-schema` writes two `SAME`, `up -d --build web` writes `…-web:1.4.0  Built` and `Started`, and the **Fleet** menu shows up.

#### 4.2 ⭐ Simulated 1.7.0 devices from the `tools/` simulator (6 minutes)

The Module 28 simulator imitates the design of firmware 1.7.0 without flashing anything: its `vitals` carry `reset_reason` and `fw`. On the laptop, replace the contents of these files in the `tools` folder with the files of the same name in [`code/tools/`](code/tools/) (**Copy raw file**): `device-simulator.js`, `contract-checker.js` (contract 1.6, for 5.5), `README.md`, and `.env.example`, plus the new files `make-fake-bin.js` and `make-fake-bin.test.js` (the path without a Kit, Practice 6). Then, at the project root:

```text
git add tools
git commit -m "Module 28 Practice 4: simulator, contract checker 1.6, and fake .bin file maker"
git push
```

In `tools/.env` (outside Git), `KEY_F00D00000005` has been there since 3.2. Add `SERVER_URL=` with an address **exactly the same** as in the central machine's `.env` ([2.3](#23--the-infrastructure-files-and-the-central-machines-env-mosquitto_dynsec_password-and-server_url-6-minutes)), for example `SERVER_URL=https://iot.yourname.my.id`: like Node 1, a simulated device only downloads from that address. Stop the old simulator (**Ctrl + C**) if it's still running, then in a terminal in the `tools` folder:

```text
node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 5
```

`5` = the simulated devices `f00d00000001` to `f00d00000005`; the ones whose key isn't in `tools/.env` are skipped. As soon as they're `online`, type `ota` and press **Enter**.

**Expected output (the author's lab, simulator; `f00d00000001` = the Module 21 practice device; cut):**

```text
2 fake device(s) heading to mqtt://192.168.1.37:1883 (default simulated firmware 1.7.0). Type for example …
f00d00000001: online (firmware 1.7.0)
f00d00000005: online (firmware 1.7.0)
ota
f00d00000001: firmware 1.7.0, server address https://iot.yourname.my.id, reset_reason POWERON
f00d00000005: firmware 1.7.0, server address https://iot.yourname.my.id, reset_reason POWERON
```

Version `0.1.0` (the Module 27 simulator) is gone now. Leave the simulator running; stopping it and running it again is safe too: the version from a later update is stored in the `data/` folder (the stand-in for NVS, outside Git). Seeing `SERVER_URL in tools/.env isn't used: …`? The address format is wrong (2.3). `REJECTED by broker (code 5)`? The key in `tools/.env` is still the old one (3.4).

> 🔀 **Without a Pi:** the broker is `mqtt://127.0.0.1:1883`. **Without a Kit:** `f00d00000001` = your simulated Node 1, so its `online (firmware 1.7.0)` is your **simulated O0** (Practice 5 is skipped); also type `garden start` for the mock Garden (Module 25).

**You pass this ⭐ step** when the simulator writes `online (firmware 1.7.0)` for your practice device, and `ota` writes a server address exactly the same as in the central machine's `.env`.

#### 4.3 ⭐ The Fleet screen: the summary, the health cards, firmware releases, and new devices (5 minutes)

Click **Fleet**: the summary `<n> active device(s) (+1 deactivated) · latest Node 1 release: none yet` (`deactivated` = the Module 21 test device you revoked), then three sections. **Devices**: one card per device, its contents as in [Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason). **Firmware releases**: `No firmware uploaded to the server yet.` and the form **Upload Node 1 firmware** (Practice 6). **New devices**: **Create claim code** (Practice 10).

**Expected output (the author's lab, headless Chrome, admin, 1280 px; simulated devices; screen text, cut):**

```text
3 active device(s) · latest Node 1 release: none yet
Practice living room  Online
Node 1 · living room · f00d00000001 · last seen 6 seconds ago
Firmware version 1.7.0   Restarted because POWERON power just came on or the EN button
Wi-Fi signal -55 dBm (very strong)   RAM 184 KB free   Uptime 0 s
Health from the last vitals, Mon 2 Nov, 15:24 WIB; vitals sent every 300 seconds (firmware default).
Garden (mock)  Online
Firmware version 1.0.0   Health Node 2 doesn't send vitals
OTA isn't available for Node 2: update it by cable.
```

Your Node 1's card (still 1.6.0) writes `— (the old firmware doesn't report it)` under **Restarted because**: 1.6.0 really doesn't send `reset_reason` yet. Node 2 shows without **Update** ([Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota)), and Node 1's **Update** is disabled: `No firmware uploaded yet.` The status badge has a new value for Practice 7, `stopped on purpose` (also on the **Devices** screen; formerly "offline mode", [Module 23](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#7-alive-isnt-always-fresh-status-last-seen-and-stale-data)). The status and the version arrive through Socket.IO without polling; the health numbers are only fetched again when there's news or when the page is reloaded (Concept 9). Check the DevTools **Network** tab: 30 seconds quiet, without a new `fleet` request (the author's lab: 0, one WebSocket `wss://iot.yourname.my.id/api/socket.io/`).

**You pass this ⭐ step** when **Fleet** shows a card for each of your devices: the practice device `1.7.0` with `POWERON`, Node 1 `1.6.0` (without a Kit: the simulated Node 1 `1.7.0`), and Node 2 with `OTA isn't available for Node 2: update it by cable.`

#### 4.4 Logging in as a viewer: look only, no buttons (3 minutes)

Click **Log out**, log in with `viewer@home.test` ([Module 24's 3.3](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#33--switch-accounts-in-the-same-tab-nothing-left-over-admin-only-and-403-in-bruno-15-minutes)), then click **Fleet**. The screen is the same without the upload form, **Update**, **Canary**, **More settings**, and **New devices**; at the bottom, `Your account is a viewer: you can see the fleet, but …`. **Result (the author's lab):** the only things that can be clicked in the page's content are **Update history**. Hiding buttons isn't a safeguard ([Module 24's Concept 5](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#5-two-layer-roles-the-screen-for-convenience-the-backends-guard-for-security)); optionally, in Bruno, **`login viewer`** then **`make Node 1 canary`**. **Result (the author's lab; the Bruno files run by a script):** `403 Forbidden`, `{"message":"viewer accounts can only look; commands and changes are admin-only"}`. Then **`login admin`** again.

#### 4.5 Phone width 375 px and dark mode (3 minutes)

Open **Fleet** on a phone with a dark theme (the main and free paths: the Module 27 app; without a Pi: phone mode `http://192.168.1.10`); no **Fleet** menu yet? Close the app, then open it again. Without a phone: DevTools → **Rendering** → **prefers-color-scheme: dark**, then device mode (**Ctrl + Shift + M**) at `375` wide ([Module 23's 5.3](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#53-dark-mode-dark-classes-and-chart-colors-20-minutes)). The cards stack in one column and the page can't be scrolled sideways. **Result (the author's lab, Chrome's device mode 375 px, dark):** `scrollWidth 375 = clientWidth 375`, admin and viewer. Afterwards set it back to **No emulation**, turn device mode off, and log in again as admin. The picture: the author's lab, Chrome's device mode (not a phone), every device a simulator; the simulated Node 1 deliberately run as 1.6.0, like your Node 1 before Practice 5; your names and numbers differ.

![Composite of real screenshots of the Fleet screen of the Mini Smart Home dashboard 1.4.0 with backend 1.5.0 on a simulated VPS and internet (a stand-in CA, Pebble), in Chrome 156 DevTools device mode 375 pixels, dark mode, on Linux, not a real phone; the address bar is not captured. Practices 4.4 and 4.5, 3 Nov 2026 at 21:47 WIB; every device is the simulator. Three cuts of the viewer account page. Left: the Live badge, the Fleet menu, the name Home Guest (viewer) (number 1), the summary 3 active device(s) · latest Node 1 release: none yet, then the card Practice living room Online, the simulated Node 1 f00d00000001 still on 1.6.0 with Restarted because — (the old firmware doesn't report it) (number 2), Wi-Fi signal -70 dBm (fair), RAM 184 KB free, uptime 30 min, and only the link Update history (number 5). Middle: the card Practice kitchen f00d00000005 version 1.7.0, POWERON, -75 dBm (fair), 181 KB free, uptime 30 min, vitals every 300 seconds (number 3); the card Garden (mock), Node 2 via f00d00000001, version 1.0.0, Node 2 doesn't send vitals, OTA isn't available for Node 2: update it by cable. (number 4). Top right: Firmware releases, No firmware uploaded to the server yet., and the sentence Your account is a viewer: you can see the fleet, but uploading firmware, updates, claim codes, and deactivating devices are for the admin. (number 5). Bottom right, for comparison, the admin account on the Node 1 card: Update to version no release yet, the disabled Update button, the Canary tick, More settings (number 6). A numbered legend below.](assets/fleet-on-a-phone.png)

> ⬆️ **Done with Practice 4?** [Practice 5](#practice-5--node-1-170-by-cable-for-the-last-time-25-minutes-needs-a-board) needs a board: Node 1 gets 1.7.0 by cable for the last time. The path without a Kit: your simulated devices have been "1.7.0" since [4.2](#42--simulated-170-devices-from-the-tools-simulator-6-minutes), so continue to [Practice 6](#practice-6--building-171-and-uploading-it-to-the-server-15-minutes) with the fake files.

### Practice 5 — Node 1 1.7.0 by cable, for the last time (25 minutes, needs a board)

> 🖥️ **Tools used:** **Arduino IDE** and the **Serial Monitor** with a USB cable from the laptop to Node 1 (5.1–5.5); **VS Code** on the laptop, a terminal at the **project root** (5.1, 5.2, 5.4) and in the **`tools`** folder (5.5); **Chrome**, the **Fleet** screen (5.4). Concepts used: 2, 4.
>
> ⭐ **Required for the paths with a Kit** — steps 5.1, 5.2, 5.3, and 5.4: firmware 1.7.0 with `trial-period.cpp` installed by cable with the Module 10 settings, its portal password-protected, the server address stored in Node 1, and Node 1's card on the **Fleet** screen showing version `1.7.0` with `reset_reason` (proof **O0**).

> [!NOTE]
> **Compiled by the author, not yet run on a board.** On 3 November 2026 the author compiled firmware 1.7.0 with `arduino-cli` 1.5.1, the esp32 package 3.3.12, and the exact library versions, with the settings of 5.1: no errors, no warnings from the `node-1-home` files, and rollback on according to its symbol list (`nm`). The cable upload, the Serial Monitor, and a real Node 1 card have never been seen by the author: the Serial text below = text from the code, the size numbers = the author's compile, and the **Expected output** box in 5.5 = the simulator.

Node 1 1.6.0 can't be updated from the server: it answers `update` with `action update not supported yet (Module 28)`. Firmware 1.7.0 is the first version with over-the-air updates and a trial period, so it goes in by cable for the last time. The server has been ready since Practices 2–4, so Node 1's new `vitals` are accepted by backend 1.5.0 right away.

> 🔀 **Without a Kit:** skip this practice until the board arrives, then withdraw the fake releases (8.4): the real versions start at 1.7.3. Your simulated devices have been "1.7.0" since [4.2](#42--simulated-170-devices-from-the-tools-simulator-6-minutes); type `ota` in the simulator terminal (the author's lab: `f00d00000001: firmware 1.7.0, server address https://iot.yourname.my.id, reset_reason POWERON`) = a simulated **O0**, and 5.5 can be tried with `restart` in the simulator terminal. **Wokwi:** `USE_WOKWI = true` (a public broker; `WOKWI_LOCKED` as in Module 21, and don't type your real device key there); `vitals` with `reset_reason` and `fw` only show in the Serial Monitor (`log debug`) or MQTTX, not on the **Fleet** screen (public broker). Not tested by the author; 1.7.0 may not fit Wokwi's default shelf (1,310,720 bytes).

#### 5.1 ⭐ The esp32 package 3.3.12, the Minimal SPIFFS scheme, and firmware 1.7.0 with `trial-period.cpp` (8 minutes)

**The package and the libraries.** In Arduino IDE, open the **Boards Manager** (the board icon in the left bar): **esp32 by Espressif Systems** must be **3.3.12**, the same as Module 21 (the reason is in [🧰](#-what-you-need)). In the **Library Manager** (the book icon), match WiFiManager 2.0.17 and Node 1's other libraries against the same table: no new library, and Adafruit GFX stays 1.12.6 (don't click **Update** to 1.13.0, which the author hasn't tested).

**The Module 10 settings** (the **Tools** menu): **Board** → **ESP32 Dev Module**; **Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, the two program shelves the [Syllabus](../../SYLLABUS.md#module-10--wi-fi--http-devices-start-talking-to-the-network) chose in Module 10; **Flash Mode** → **DIO** (the menu shows `Flash Mode: "DIO"`); and **Erase All Flash Before Sketch Upload** stays **Disabled**, so NVS survives: the Wi-Fi, the broker key from 3.4, and the thresholds. The default scheme is too small for 1.7.0, and a scheme labeled **No OTA** or **Huge APP** has no second shelf ([🚨](#-troubleshooting) *The program is bigger than the shelf: …*).

**Firmware 1.7.0** (VS Code, a terminal at the project root, the `feature/fleet` branch). 24 files change: new `version`, `ota-check`, `ota-update`, `trial-period`, and `claim` (each `.h` and `.cpp`) plus the firmware README; changed `actuators`, `networking`, `settings`, and `system` (`.h` and `.cpp`), `commands.cpp`, `node-1-home.ino`, `keys.example.h`, `config.h`, and `PIN-MAP.md` version 7 (the pins stay; a new section for Practice 12). Node 2 doesn't change. The quickest way: open [`code/firmware-1.7.diff`](code/firmware-1.7.diff), click **Download raw file**, and save it at the project root. `config.h` holds your own numbers (`BROKER_ADDRESS`, the Module 6 calibration, `MAC_NODE2`, also `TIME_ZONE` if your zone isn't WIB), so the diff may be refused at that file. Leave that file out:

```text
git apply --exclude=firmware/node-1-home/config.h firmware-1.7.diff
```

No output = applied; delete the diff file. Refused anyway (for example CRLF on Windows)? Then not a single file was applied: copy the other 23 files one by one with **Copy raw file** from [`code/firmware/`](code/firmware/) and [`code/PIN-MAP.md`](code/PIN-MAP.md). Neither way touches `config.h`: write down your numbers, replace its contents with [version 1.7.0](code/firmware/node-1-home/config.h) (**Copy raw file**), then write those numbers back (`BROKER_ADDRESS` = your Pi gateway's IP; without a Pi: the laptop's IP). Check with `git diff firmware/node-1-home/config.h`: only the version part changes (`FIRMWARE_VERSION` `"1.7.0"`, the new `VERSION_NOTE`), the comment of the `VITALS_INTERVAL` line, and the Module 28 block at the end: `DEFAULT_SERVER_ADDRESS` empty (the server address is set over Serial in 5.4), `OTA_TRIAL_PERIOD = 60000`, and `TEST_WRONG_KEY = 0`. Any other changed line means the example overwrote your number: put it back.

Now read `trial-period.cpp`, the file that makes rollback really work ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c)). Its comments are part of the lesson:

```cpp
// trial-period.cpp - the code of the trial period module. Its functions are listed in trial-period.h.
// Compiled by the author (arduino-cli 1.5.1, esp32 3.3.12), but NOT run on a board yet: firmware README, "Status 1.7.0".
#include <Arduino.h>
#include <esp_ota_ops.h>  // ESP-IDF: the state of the program shelves (otadata), mark the firmware valid or cancel it
#include <esp_task_wdt.h> // watchdog: guards setup() during the trial period
#include "config.h"
#include "logger.h"
#include "system.h"
#include "display.h"
#include "ota-update.h"
#include "trial-period.h"

// ================================================================================================================
// THE MOST IMPORTANT LINE OF MODULE 28: without it, the automatic rollback NEVER happens, and there is no message at all.
//
// The bootloader of the esp32 3.3.12 package can already roll back: firmware just installed over the air starts in the state
// PENDING_VERIFY ("waiting to be proven"). But before setup() runs, the Arduino core (initArduino() in
// esp32-hal-misc.c) asks the function verifyRollbackLater(): "do you want to prove it yourself later?". Its default answer is
// false, so the Arduino core marks the new firmware VALID right away, before it even tried the broker. Even firmware with a
// wrong broker key counts as valid, and will never go back to the old version.
//
// The function below replaces that default answer with true: "yes, I prove it myself" (the trial period below).
//
// Why extern "C"? The default function is written in the C language (a .c file). C++ quietly changes every function's name
// when it compiles (name mangling, for example into _Z19verifyRollbackLaterv) so that functions with the same name may have
// different parameters. Without extern "C", our function has another name in the linker's eyes, the default function is still
// used, and the compile still SUCCEEDS without any warning. extern "C" = "use the name as it is, like the C language", so that
// our function replaces the default function (which is marked weak = "may be replaced").
// ================================================================================================================
extern "C" bool verifyRollbackLater() {
  return true;
}

static bool trialPeriod = false;

// The watchdog timeout during setup() of firmware in its trial period: the 60-second trial period + 15 seconds. If setup() finishes
// sooner (usually within a few seconds), the timeout goes back to 5 seconds at the end of setup() as usual.
const unsigned long TRIAL_SETUP_WATCHDOG_TIMEOUT = OTA_TRIAL_PERIOD + 15000;

// The name of a program shelf's state in otadata (esp_ota_img_states_t), for the Serial command "ota".
static const char* stateName(esp_ota_img_states_t state) {
  switch (state) {
    case ESP_OTA_IMG_NEW: return "NEW, never started yet";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, trial period";
    case ESP_OTA_IMG_VALID: return "VALID, already proven";
    case ESP_OTA_IMG_INVALID: return "INVALID, refused";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, cancelled";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, installed by cable";
    default: return "unknown";
  }
}

void startTrialPeriod() {
  const esp_partition_t* running = esp_ota_get_running_partition();
  esp_ota_img_states_t state;
  if (running == nullptr || esp_ota_get_state_partition(running, &state) != ESP_OK) {
    return;  // the state isn't recorded (for example just installed by cable): no trial period
  }
  if (state != ESP_OTA_IMG_PENDING_VERIFY) {
    return;
  }
  trialPeriod = true;
  logInfo("TRIAL PERIOD: firmware %s was just installed over the air on shelf %s. Within %lu seconds it must connect to the broker "
          "and publish; otherwise Node 1 goes back to the previous firmware by itself.", FIRMWARE_VERSION, running->label,
          OTA_TRIAL_PERIOD / 1000);
  logInfo("During the trial period, the Wi-Fi portal isn't opened and update commands are refused.");

  // The trial period also guards setup(). Normally the watchdog only starts watching loop() at the END of setup(), and the trial
  // period is checked in loop(). New firmware that hangs in setup() (for example waiting for a sensor forever) would never reach
  // loop(), so it would never be rolled back. That's why, from now on, the watchdog watches this task with a 75-second limit: hanging
  // in setup() = the watchdog restarts Node 1, and the bootloader cancels the firmware that isn't proven yet (PENDING_VERIFY becomes
  // ABORTED), so Node 1 still goes back to the old firmware and reports "rollback".
  // The order: register first, then set the limit (feeding the watchdog before registering = the error "task not found").
  if (esp_task_wdt_status(NULL) != ESP_OK) {   // ESP_OK = this task is already watched
    esp_task_wdt_add(NULL);                    // NULL = the task that is running now: setup() then loop()
  }
  setWatchdogTimeout(TRIAL_SETUP_WATCHDOG_TIMEOUT);  // system.cpp
}

bool inTrialPeriod() {
  return trialPeriod;
}

void firmwareProven() {
  if (!trialPeriod) {
    return;
  }
  trialPeriod = false;
  // Mark it valid FIRST, then record it in NVS: if the power goes out between the two, this firmware is still valid and
  // setupOta() at the next start writes the "succeeded" report from the plan left behind.
  esp_err_t error = esp_ota_mark_app_valid_cancel_rollback();  // otadata: PENDING_VERIFY -> VALID
  char message[OTA_MESSAGE_MAX_LENGTH + 1] = "";
  if (error != ESP_OK) {
    snprintf(message, sizeof(message), "couldn't be marked valid: %s", esp_err_to_name(error));
    logError("Firmware %s %s: the next restart may go back to the old firmware.", FIRMWARE_VERSION, message);
  }
  OtaPlan r;
  if (readOtaPlan(r)) {
    if (message[0] == '\0' && strcmp(FIRMWARE_VERSION, r.to) != 0) {
      snprintf(message, sizeof(message), "fw %s, not %s: FIRMWARE_VERSION not raised?", FIRMWARE_VERSION, r.to);
    }
    recordOtaResult(r.id, "succeeded", r.to, message);
    clearOtaPlan();
  }
  logInfo("Firmware %s VALID: connected to the broker and published %lu seconds after starting.", FIRMWARE_VERSION, millis() / 1000);
}

void updateTrialPeriod() {
  if (!trialPeriod || millis() < OTA_TRIAL_PERIOD) {  // millis() counts from when Node 1 started
    return;
  }
  trialPeriod = false;
  OtaPlan r;
  bool hasPlan = readOtaPlan(r);
  logError("Firmware %s NOT proven within %lu seconds (not connected to the broker): ROLLBACK to the previous firmware.",
           FIRMWARE_VERSION, OTA_TRIAL_PERIOD / 1000);
  if (hasPlan) {  // the report is saved BEFORE the restart: after the restart, the old firmware is the one that runs
    recordOtaResult(r.id, "rollback", r.to, "not connected to the broker within 60 seconds");
    clearOtaPlan();
  }
  showMessage("ROLLBACK", "new firmware failed", "back to version", hasPlan ? r.from : "previous");
  Serial.flush();
  esp_err_t error = esp_ota_mark_app_invalid_rollback_and_reboot();  // otadata: INVALID, then restart into the old shelf
  // If it gets here, the function above FAILED and didn't restart (for example the old shelf isn't valid). A normal restart still
  // cancels this firmware: the bootloader changes PENDING_VERIFY into ABORTED and picks the old shelf.
  logError("Automatic rollback failed (%s): a normal restart.", esp_err_to_name(error));
  Serial.flush();
  delay(100);
  ESP.restart();
}

void printShelfInfo() {
  const esp_partition_t* running = esp_ota_get_running_partition();
  const esp_partition_t* other = esp_ota_get_next_update_partition(nullptr);
  esp_ota_img_states_t state;
  const char* text = "not recorded (installed by cable)";
  if (running != nullptr && esp_ota_get_state_partition(running, &state) == ESP_OK) {
    text = stateName(state);
  }
  Serial.printf("ota: running shelf %s (%s); other shelf %s, %lu bytes\n", running != nullptr ? running->label : "?", text,
                other != nullptr ? other->label : "NONE (a partition scheme without OTA)",
                other != nullptr ? (unsigned long)other->size : 0UL);
  const esp_partition_t* cancelled = esp_ota_get_last_invalid_partition();
  if (cancelled != nullptr) {
    Serial.printf("ota: shelf %s was cancelled before (firmware that failed to prove itself)\n", cancelled->label);
  }
  if (trialPeriod) {
    unsigned long remaining = millis() < OTA_TRIAL_PERIOD ? (OTA_TRIAL_PERIOD - millis()) / 1000 : 0;
    Serial.printf("ota: TRIAL PERIOD, %lu seconds left\n", remaining);
  } else {
    Serial.println("ota: trial period: no");
  }
}
```

- **Lines 13–32:** `extern "C" bool verifyRollbackLater()` answers `true`, so the Arduino core no longer marks new firmware valid before `setup()`. **Don't change or delete this line.** Without `extern "C"`, the compile still succeeds without a warning, but rollback is off ([🔬](#-technical-deep-dive-optional) *Name mangling and `extern "C"`*).
- **`startTrialPeriod()`** (from `setup()`): is the running shelf still `PENDING_VERIFY`? The trial period starts, and a 75-second watchdog also guards `setup()`, so firmware that gets stuck before `loop()` goes back to the old version too.
- **`firmwareProven()`**: called by `networking.cpp` once the broker has accepted the key and `online` and the `cmd` subscription have been sent. It marks the firmware valid first, then writes the `succeeded` report in NVS.
- **`updateTrialPeriod()`**: 60 seconds pass without proof: the `rollback` report is saved first, the OLED shows `ROLLBACK`, then the shelf is marked cancelled and the board restarts. Marking fails? A plain `ESP.restart()` still cancels it.
- **`printShelfInfo()`**: the answer to the Serial command `ota` in 5.4.

**You pass this ⭐ step** when the esp32 package 3.3.12 and the Module 10 settings are selected, the `git diff` of `config.h` only holds the Module 28 changes, and `trial-period.cpp` holds the line `extern "C" bool verifyRollbackLater() {`.

#### 5.2 ⭐ A password-protected portal: `PORTAL_PASSWORD` in `keys.h` (3 minutes)

While Node 1's Wi-Fi portal is open, WiFiManager's built-in address `192.168.4.1/update` is active too, even though its button is hidden ([Module 10 ➕ D](../../phase-2-connectivity/module-10-wifi-and-http/README.md#d-verify-upload-and-connect-to-wi-fi)), and from this week the portal is opened more often. With a password, only a phone that knows it can join the Wi-Fi `Node1-Home` (Concept 8). Open the `node-1-home` sketch and its `keys.h` tab (made in Module 14 and guarded by `.gitignore`; not there yet? Create a `keys.h` tab holding a copy of `keys.example.h` as it is), then add one line:

```cpp
#define PORTAL_PASSWORD "<portal-password>"
```

Replace `<portal-password>` with a new password of 8–63 characters (the WPA2 Wi-Fi password rule) and keep it in your password manager: the phone uses it in [10.3](#103--the-node1-home-portal-from-a-phone-wi-fi-claim-code-server-address-and-broker-address-7-minutes), and the same password goes on the box label ([12.9](#129--k1-ad-labels-the-box-lid-then-node-1-online-again-5-minutes)). Three things:

- A length outside 8–63 characters stops the compile with `static assertion failed: PORTAL_PASSWORD in keys.h must be 8-63 characters (the WPA2 Wi-Fi password rule), or delete the line` (tried by the author with a 7-character password).
- `keys.h` is now read by two files (`bridge.cpp` since Module 14, and `networking.cpp`), so its variables must stay `const` as in `keys.example.h`; without `const`, the compile stops with `multiple definition` ([🚨](#-troubleshooting) *The compile stops: …*).
- This password is compiled into the `.bin` file too, like your ESP-NOW key (tested by the author with `strings`): one more reason that file is never shared (Concept 6).

Without that line, the portal is open as in Module 10, and every time it opens, the Serial Monitor warns (text from the code): `Portal WITHOUT a password: anyone near Node 1 can open 192.168.4.1, including the /update page. Set PORTAL_PASSWORD in keys.h (Module 28).`

**You pass this ⭐ step** when Node 1's `keys.h` holds a `PORTAL_PASSWORD` of 8–63 characters that's saved in your password manager, and `git status --short` doesn't mention `keys.h`.

#### 5.3 ⭐ Upload by cable, then read the program size against the 1,966,080-byte shelf (5 minutes)

Move Node 1's USB cable from the charger to the laptop in the order of the Module 9 golden power rules: the MB102 off first, move the cable, then turn the MB102 on. The loads (relay, pump, servo) stay powered by the MB102, not from the ESP32's pins, with a shared GND. Choose the USB port in **Tools → Port**, then click **Upload**. Stuck at `Connecting…`? Hold **BOOT** as soon as that text appears, and release it when `Writing at …` starts running.

Arduino IDE prints roughly (numbers from the author's compile with `arduino-cli`, the same settings):

```text
Sketch uses 1411683 bytes (71%) of program storage space. Maximum is 1966080 bytes.
Global variables use 58404 bytes (17%) of dynamic memory, leaving 269276 bytes for local variables. Maximum is 327680 bytes.
```

The program is about 1.41 million bytes, ±217 thousand bytes bigger than 1.6.0 (HTTPS with its list of root certificates, HTTPUpdate, and the portal fields), still ±554 thousand bytes below the limit of one shelf (Concept 2). On your computer the number may differ by a few hundred bytes, because the board name, the operating system, and the package's folder path are stored in the program too; about 2.6 thousand bytes more if your `keys.h` uses ESP-NOW encryption and `PORTAL_PASSWORD` (the numbers above use the contents of `keys.example.h`; the author measured +2,604 bytes with a complete `keys.h`).

With **Compiler warnings** at **More** (the Module 8 setting), Arduino IDE may show warnings from the WiFiManager, ESP32Servo, and ModbusMaster libraries (you've known the last one since Module 15). The author compiled with **All**: 27 warnings, all from the libraries and exactly the same as 1.6.0, and none from the `node-1-home` files. Library warnings can be ignored, `crc16_update` through `rs485.cpp` included; warnings from the `node-1-home` files themselves can't.

**You pass this ⭐ step** when the upload finishes without an error and the `Sketch uses` number is about 71% of `Maximum is 1966080 bytes`.

#### 5.4 ⭐ O0: Serial `ota` and `server`, then Node 1's card at version 1.7.0 with `reset_reason` (5 minutes)

Open the **Serial Monitor** (115200 baud, **New Line**); missed the first lines? Press **EN**. Then type into the Serial Monitor's send field and press Enter:

```text
ota
```

**What the Serial Monitor shows (text from the code; not yet recorded by the author on a board):**

```text
[..:..:..] INFO  Node 1 Home - firmware 1.7.0 (installed by cable)
…
ota: firmware 1.7.0 (installed by cable), server address NOT SET (type: server <address>)
ota: running shelf app0 (UNDEFINED, installed by cable); other shelf app1, 1966080 bytes
ota: trial period: no
ota: no update report is waiting
```

As in [Quick Win Step 2](#step-2--serial-monitor-the-running-shelf-app0-the-note-undefined-the-other-shelf-app1-2-minutes), the cable upload writes the shelf note "start `app0`" with the state `UNDEFINED`: no trial period. Shelf `app1` waits for 1.7.1. Now store the server address, **exactly the same** as `SERVER_URL` in the central machine's `.env` ([2.3](#23--the-infrastructure-files-and-the-central-machines-env-mosquitto_dynsec_password-and-server_url-6-minutes)); the free path `http://192.168.1.37`, without a Pi `http://192.168.1.10`:

```text
server https://iot.yourname.my.id
```

The answer (text from the code): `server: https://iot.yourname.my.id (firmware is only downloaded from this address: <address>/fw/node-1/<version>.bin)`. The address is stored in NVS, so it stays after an update, a rollback, and a cable upload. `http://` to an internet name is refused: `server: not saved. http only for the home network (…): use https:// on the internet`. Then type `broker`: the answer `broker: 192.168.1.37 (from config.h), door 1883` must name your Pi gateway's IP (without a Pi: the laptop's IP).

On the **Fleet** screen, Node 1's card now shows **Firmware version** `1.7.0`, and **Restarted because** no longer says `— (the old firmware doesn't report it)`: the first `vitals` is sent as soon as Node 1 connects. The card's health isn't live, so reload the page if it hasn't changed. After a cable upload its value should be `POWERON` (according to the code, as in Quick Win Step 2; the author hasn't seen the board). Save it to the branch (laptop terminal, project root; `keys.h` stays out):

```text
git add firmware PIN-MAP.md
git commit -m "Module 28 Practice 5: Node 1 firmware 1.7.0 and PIN-MAP version 7"
git push
```

**You pass this ⭐ step** (proof **O0**) when `ota` writes `app0 (UNDEFINED, installed by cable)`, `server` stores the same address as `SERVER_URL`, and Node 1's card shows version `1.7.0` with **Restarted because** filled in.

#### 5.5 Contract checker 1.6: Node 1's `vitals` PASS (4 minutes)

Contract checker version 1.6 also checks `reset_reason` and `fw` in `vitals`; not copied in 4.2 yet? Get [`code/tools/contract-checker.js`](code/tools/contract-checker.js) with **Copy raw file**. In the laptop terminal, folder `tools`, point it at Node 1's broker (the Pi gateway; without a Pi: no address):

```text
node --env-file=.env contract-checker.js 192.168.1.37
```

While it runs, type `restart` in the Serial Monitor: Node 1 stops on purpose (text from the code: `Stopped on purpose (Serial restart command): …`, then `Restarting now...`), restarts, and sends a new `status` and `vitals`. After ±30 seconds, press **Ctrl + C**.

**Expected output (the author's lab, simulator, `restart` in its terminal; WIB times; cut, only the lines of the simulated Node 1 `f00d00000001`):**

```text
Contract checker ready on broker 192.168.1.37:1883 (subscribed to msh/#) — press Ctrl + C to stop.
[3:29:08 PM] msh/f00d00000001/status  PASS  [retained]
[3:29:12 PM] msh/f00d00000001/status  PASS
[3:29:17 PM] msh/f00d00000001/status  PASS
[3:29:17 PM] msh/f00d00000001/vitals  PASS
[3:29:23 PM] msh/f00d00000001/telemetry  PASS
^C
Summary: 15 messages PASS, 0 messages FAIL.
```

The order: the old retained status, `offline-mode`, `online`, then `vitals` with `reset_reason` `SW` and `fw` `1.7.0`; the summary also counts the other simulated devices. Telegram reports `🔄 <id> stopped on purpose …`, then `✅ <id> online again after stopping on purpose (<n> seconds)`, without `📴` (the author's lab, mock Telegram). The checker stops at once with `Connection to broker … lost: the broker was stopped, or the same checker account is used by another program …`? In the author's lab the cause was a `tools/.env` without the line `CHECKER_USERNAME=checker`: copy it from `.env.example`. This checker reads the `rollback` report in [8.4](#84--the-update-history-the-event-log-and-the-rollback-report-in-vitals-4-minutes). The USB cable may stay on the laptop until [7.1](#71--unplug-the-usb-cable-node-1-only-on-the-module-9-charger-2-minutes).

> ⬆️ **Done with Practice 5?** Continue to [Practice 6](#practice-6--building-171-and-uploading-it-to-the-server-15-minutes): building 1.7.1 and uploading it to the server. From now on Node 1 no longer needs the USB cable to be updated.

### Practice 6 — Building 1.7.1 and uploading it to the server (15 minutes)

> 🖥️ **Tools used:** **Arduino IDE** on the laptop, the Node 1 sketch from Practice 5 (the board isn't used); **VS Code**, a terminal at the **project root** (without a Kit: the **`tools`** folder); **Chrome**, the **Fleet** screen as the admin; a terminal on the **central machine**, project root (end of 6.4). Concepts used: 5, 6.
>
> ⭐ **Required** — steps 6.1, 6.2, 6.3, and 6.4: the 1.7.1 firmware file is built without installing it on the board, then stored on the server as the `latest` release with a SHA-256 exactly the same as the fingerprint on your laptop.

This is the Syllabus step "build the next firmware version → upload it to the server" (formerly "v1.1"), with our project's number: 1.7.1. Node 1 keeps running 1.7.0 until Practice 7 installs 1.7.1 over the air. The **Expected output** boxes come from the author's lab: its 1.7.1 file is real firmware compiled by the author with `arduino-cli`, uploaded to the simulated "VPS", and never run.

> 🔀 **Without a Kit** (Wokwi too): replace 6.1–6.3 with a **fake** file from `make-fake-bin.js` (copied in 4.2; [the tools README](code/tools/README.md#fake-firmware-files-for-the-path-without-a-kit-module-28)). In a terminal in the `tools` folder (the destination: a folder next to your repository, outside Git):
>
> ```text
> node make-fake-bin.js 1.7.1 ../../fake-firmware
> ```
>
> **Expected output (the author's lab, cut):** `FAKE file created: …/fake-firmware/node-1-1.7.1-FAKE.bin`, `size         1196032 bytes (61% of one program shelf, 1966080 bytes)`, `SHA-256      1aff82c7b69ed34c6d7bdda531b8e4ec21c671bdcfb2aacff2168a9fa91311ab`. Its contents are fixed, so that fingerprint is the same on any computer, the opposite of real firmware. Upload it in 6.4 as version `1.7.1`: the screen shows `1,196,032 bytes (61% of a shelf)` and the same fingerprint (the author's lab). Skip 6.5.

> [!WARNING]
> A fake file **isn't firmware**: don't flash it, and don't send it to a real board with **Update**.

#### 6.1 ⭐ The 1.7.1 constants in `config.h`: `FIRMWARE_VERSION` and `VERSION_NOTE` (2 minutes)

In Arduino IDE, open the `config.h` tab, change the two version lines at the top (the "Module 28 practice" table in the [firmware README](code/firmware/README.md)), then save (**Ctrl + S**):

```diff
-const char FIRMWARE_VERSION[] = "1.7.0";
-const char VERSION_NOTE[] = "installed by cable";  // Module 28: a short sentence on Serial at startup, may be changed
+const char FIRMWARE_VERSION[] = "1.7.1";
+const char VERSION_NOTE[] = "installed over the air";  // Module 28: a short sentence on Serial at startup, may be changed
```

The version must go up every time the firmware changes (here the PATCH number, [Concept 5](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest)): the server refuses a version that was uploaded before, and Node 1 refuses the version it's running. `TEST_WRONG_KEY` stays `0`. **Don't** click **Upload**, even though the USB cable is still connected: 1.7.1 must arrive over the air. Did it anyway? Set it back to 1.7.0, click **Upload** (5.3), then start again.

**You pass this ⭐ step** when `config.h` says `"1.7.1"` and `"installed over the air"`, and Node 1's card on the **Fleet** screen still shows `1.7.0`.

#### 6.2 ⭐ Sketch → Export Compiled Binary: what's in the `build/` folder (3 minutes)

With the **Tools** settings of 5.1 (**ESP32 Dev Module**, **Minimal SPIFFS**, **Flash Mode** DIO), click **Sketch → Export Compiled Binary**. Arduino IDE compiles without sending anything to the board, then copies the results to the folder `build/esp32.esp32.esp32/` inside the sketch folder. The `Sketch uses …` line is almost the same as in 5.3: the new note is 4 characters longer (the author's compile: `1411699` bytes, 16 more).

**Expected output (the author's lab: `ls -l` of a copy of the `arduino-cli` output, the same settings; WIB times):**

```text
-rw-rw-r-- 1 you you  1411840 Nov  2 13:28 node-1-home.ino.bin
-rw-rw-r-- 1 you you    23488 Nov  2 13:28 node-1-home.ino.bootloader.bin
-rwxrwxr-x 1 you you 18498576 Nov  2 13:28 node-1-home.ino.elf
-rw-rw-r-- 1 you you  4194304 Nov  2 13:28 node-1-home.ino.merged.bin
-rw-rw-r-- 1 you you     3072 Nov  2 13:28 node-1-home.ino.partitions.bin
```

`.elf` is used by `nm` in [🔬](#-technical-deep-dive-optional); `node-1-home.ino.map` (the address map) is made too, but it isn't in the lab copy. The author hasn't seen Arduino IDE's export folder; the file to use is still `node-1-home.ino.bin`.

**You pass this ⭐ step** when the export finishes without an error and the folder `build/esp32.esp32.esp32/` holds `node-1-home.ino.bin`.

#### 6.3 ⭐ Choose `node-1-home.ino.bin`, not `.merged.bin`, then compute its SHA-256 (3 minutes)

Only the **firmware file** `node-1-home.ino.bin` goes to the server: the program only, starting with the byte `0xE9`. The **merged file** `.merged.bin` (the whole 4 MB flash, starting with `0xFF`) and `.bootloader.bin` aren't for the server ([Concept 2](#2-two-shelves-and-a-slip-of-paper-app0-app1-otadata-and-the-shelf-opener)). Compute its fingerprint in the terminal at the project root:

```text
sha256sum firmware/node-1-home/build/esp32.esp32.esp32/node-1-home.ino.bin
```

macOS: `shasum -a 256 <file>`; PowerShell: `Get-FileHash <file> -Algorithm SHA256`, which writes capital letters (the case doesn't matter; neither was tested by the author). Copy the 64 characters of the fingerprint into a temporary note. The compile time is embedded too, so your fingerprint differs from the author's and may change with every export: only compare it with the fingerprint from the server ([6.4](#64--upload-firmware-on-the-fleet-screen-release-171-with-the-same-fingerprint-5-minutes)). This file is a secret ([Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https)): it holds the ESP-NOW key, the portal password, and your laptop's folder paths, so it only goes through the **Fleet** form.

**You pass this ⭐ step** when you've written down the 64-character fingerprint of `node-1-home.ino.bin` (not `.merged.bin`).

#### 6.4 ⭐ Upload firmware on the Fleet screen: release 1.7.1 with the same fingerprint (5 minutes)

In Chrome, open **Fleet** → **Firmware releases** → the form **Upload Node 1 firmware**. Choose the file at **.bin file**, fill in **Version (the same as FIRMWARE_VERSION in that file)** with `1.7.1` and **Notes (optional)** with `installed over the air`, leave the **test** release box unticked, then click **Upload firmware**.

**Expected output (the author's lab, stand-in CA, the real 1.7.1 firmware; the fingerprint replaced by `…`):**

```text
Saved: Node 1 1.7.1, Mon 2 Nov, 15:31 WIB
Size: 1,411,840 bytes (72% of a shelf)
SHA-256 (computed by the server from the file it received):
…
Compare it with the file's fingerprint on your laptop (sha256sum or Get-FileHash): it must match exactly.
```

In the author's lab, the server's fingerprint matched the file's `sha256sum` exactly. Your size may differ a little (5.3); `72%` here and `71%` in `Sketch uses` are both right: the screen rounds normally, Arduino rounds down. **Firmware releases**, the release list (manifest) of Concept 5, now holds 1.7.1 with the badge `latest`, with `Locked: no canary has succeeded yet.` at **Update all**; Node 1's card has the badge `needs update`. The refusals (exact texts; their cures in the **Uploading firmware** group of [🚨](#-troubleshooting)):

| Uploaded | The form writes |
| :-- | :-- |
| `.merged.bin` or `.bootloader.bin` | `That isn't an app file: choose <sketch>.ino.bin, not .merged.bin, .bootloader.bin, or .partitions.bin.` |
| first byte not `0xE9` | `Not an ESP32 app file: its first byte must be 0xE9.` |
| a 1,966,081-byte file | `Too big: 1,966,081 bytes, one program shelf is only 1,966,080 bytes.` |
| version `1.7` (text from the code) | `Version must look like x.y.z, for example 1.7.1 (the same as FIRMWARE_VERSION).` |
| version `1.7.1` once more | `node1 1.7.1 already exists: a version can't be overwritten. …` (`409`, Concept 5) |

In the central machine's terminal, repeat the backup of [3.5](#35--back-up-the-broker-accounts-with-scriptsbackup-broker-accountssh-3-minutes): now `copied: firmware-data (1 .bin files)` (the author's lab).

**You pass this ⭐ step** when the green box says `Saved: Node 1 1.7.1` with a SHA-256 exactly the same as the 6.3 fingerprint, and release 1.7.1 has the badge `latest`.

#### 6.5 `git status` without `build/` and `*.bin`, then commit 1.7.1 (2 minutes)

In the terminal at the project root, `git status --short` only names ` M firmware/node-1-home/config.h` (the author's lab): `build/` and `.bin` don't show, because `.gitignore` ignores them (2.3: `firmware/**/build/` and `*.bin`). The proof:

```text
git status --short --ignored firmware
```

Besides that ` M` line, a `!!` line = ignored by Git, for example `build/` and `keys.h` (Module 14). **Expected output (the author's lab, after the commit; without `keys.h`):** `!! firmware/node-1-home/build/`. Save the version that will run:

```text
git add firmware
git commit -m "Module 28 Practice 6: Node 1 1.7.1, the version installed over the air"
git push
```

In [➕ E](#e--merge-featurefleet-into-main-through-the-pull-request-fleet-ota-rollback-claim-codes-and-the-enclosure), the **Files changed** tab of your pull request has no `.bin` either.

> ⬆️ **Done with Practice 6?** Continue to [Practice 7](#practice-7--the-first-update-without-a-cable-canary-first-20-minutes): unplug the USB cable, then update Node 1 without a cable (proof O1).

### Practice 7 — The first update without a cable, canary first (20 minutes)

> 🖥️ **Tools used:** the Module 9 charger for Node 1 (7.1); **Chrome** on the laptop or a phone, the **Fleet** screen as the admin (7.2–7.5); a terminal on the **central machine** at the project root (7.5): **SSH to the VPS**, folder `/home/house/mini-smart-home` (the free path: SSH to the Pi; without a Pi: the laptop); **Telegram**; a laptop terminal (7.6, optional). Concepts used: 3, 7.
>
> ⭐ **Required** — steps 7.1, 7.2, 7.3, and 7.5: Node 1's USB cable unplugged from the laptop, Node 1 marked canary and then updated from 1.7.0 to 1.7.1 with the **Update** button, and its card showing version `1.7.1`, `reset_reason` `SW`, and the history `succeeded` (proof **O1**).

> [!NOTE]
> **Not yet recorded by the author on a board.** The author has never run an over-the-air update on a real Node 1: the LED and the OLED below = from the code. The **Expected output** boxes = the author's lab: the simulated Node 1 from the simulator downloads the **real** 1.7.1 file compiled by the author over a simulated HTTPS, then only checks it (size, the byte `0xE9`, SHA-256) without running it.

This is the "device on the roof" ([Concept 1](#1-why-ota-is-a-must-a-device-on-the-roof)) updated without climbing up, the Syllabus's promise from the start: firmware that "can be updated remotely without a cable". Release 1.7.1 is already on the server (Practice 6), Node 1 1.7.0 knows its home server's address (5.4), and one canary device is tried first ([Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota)). No commit: the project files don't change.

> 🔀 **Without a Kit** (Wokwi too): skip 7.1; do 7.2–7.5 on the card of the simulated Node 1 `f00d00000001` (the 4.2 simulator, still running), then tick O1 as **simulated**. **The free path:** Node 1 downloads from `http://192.168.1.37` through the device door 8081 (lab: 85 ms, simulator). **Without a Pi:** from `http://192.168.1.10` (83 ms, simulator); during the update, the laptop mustn't sleep and its door 80 stays open as in phone mode.

#### 7.1 ⭐ Unplug the USB cable: Node 1 only on the Module 9 charger (2 minutes)

Proof O1 needs Node 1 without a cable to the laptop. Follow the order of the Module 9 golden power rules: turn the MB102 off first, move Node 1's USB cable from the laptop to its charger, then turn the MB102 on (a microSD module with a regulator: press **EN**). The loads (relay, pump, servo) stay powered by the MB102, not from the ESP32's pins, with a shared GND.

The power was cut for a moment, so Node 1 restarts. Wait until its card on the **Fleet** screen is `Online` again (reload if its health hasn't changed): **Restarted because** should be `POWERON` (according to the code; the author hasn't seen the board). Remember that value for 7.5. The Serial Monitor is out of sight now, and that's the point: the laptop isn't needed for updates anymore.

**You pass this ⭐ step** when Node 1's USB cable isn't connected to the laptop, Node 1 runs on its charger, and its card is `Online` again.

#### 7.2 ⭐ Make Node 1 the canary (2 minutes)

On Node 1's card, tick **Canary: a test device that gets updates first**. This mark doesn't update anything yet; only the badges and the condition of **Update all** change. **Update canary** in the **Firmware releases** part sends to every `online` canary at once; for one Node 1, **Update** on its card is enough.

**Expected output (the author's lab, simulator: the simulated Node 1 `f00d00000001` named `Practice living room`):** the toast `Practice living room is now a canary device.`, the card with the badges `Online` `canary` `needs update`, and release 1.7.1 still `Locked: no canary has succeeded yet.`

**You pass this ⭐ step** when Node 1's card has the badge `canary`.

#### 7.3 ⭐ Update 1.7.0 → 1.7.1: `stopped on purpose`, `downloading`, then `succeeded` (6 minutes)

**Update to version** on Node 1's card already picks `1.7.1 (latest)`. Click **Update**: the box `Update <name> from 1.7.0 to 1.7.1? …` (the file size, `±1 minute`) has its focus on **Cancel** (the Module 24 pattern), so an accidental **Enter** sends nothing. Leave **Allow downgrade** unticked ([Concept 5](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest)), then click **Yes, update**. Node 1 answers with an `ack` within 5 seconds: **accepted, not finished yet** ([Concept 3](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period)).

**Expected output (the author's lab, simulator: the simulated Node 1 `f00d00000001`; headless Chrome; seconds since **Yes, update**):**

```text
0.3 s  card: stopped on purpose
0.3 s  toast: f00d00000001 accepted the update command 1.7.0 → 1.7.1
0.3 s  toast: f00d00000001 stopped on purpose (offline-mode), for example to install new firmware
5.5 s  card: Online · Last update: succeeded 1.7.0 → 1.7.1
5.5 s  toast: f00d00000001 back online
5.5 s  toast: f00d00000001 updated successfully 1.7.0 → 1.7.1
```

The simulated card changed without a reload. The badge `stopped on purpose` = the status `offline-mode` that has been "kept for Module 28" since Module 19: Node 1 says goodbye first; it isn't disconnected. **Last update** changes to `accepted by the device`, `downloading`, then `succeeded` (text from the code; `downloading` stays until Node 1 starts again and reports). A toast shows for 4 seconds (wide screen: top right; phone: bottom).

**Expected output in the simulator terminal (the author's lab; the path without a Kit sees similar lines; cut):**

```text
f00d00000001: update 1.7.0 -> 1.7.1 ACCEPTED: offline-mode, clean disconnect, downloading https://iot.yourname.my.id/fw/node-1/1.7.1.bin
f00d00000001: 1.7.1 downloaded 1411840 bytes in 226 ms, SHA-256 matches; restarting
f00d00000001: started with 1.7.1 (the new shelf), the 60-second trial period begins
f00d00000001: 1.7.1 VALID (connected and published 0 seconds after starting)
f00d00000001: online (firmware 1.7.1)
```

The simulator imitates the order of Concept 3 until the trial period (Concept 4) is passed. The command arrives at once over MQTT, without waiting for an hourly check; on the main path it goes down through the bridge to the Pi gateway, while the file is downloaded straight from the VPS over HTTPS ([Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https)).

Those 5.5 seconds are almost all the simulator's made-up "restart" pause, not an ESP32 over Wi-Fi; the real file of about 1.41 million bytes takes longer over Wi-Fi (not measured by the author; write down your number in ➕ F). Until the card says `succeeded`, don't unplug the power of Node 1, the Pi, or the router: without the broker, or after a restart during the trial period, the new firmware is cancelled. **Update** disabled, a red box, or the history `failed`? The reason is on the card; the cure is in the [🚨](#-troubleshooting) group **The `update` command …** or **Download `failed`**.

**You pass this ⭐ step** when Node 1's card was `stopped on purpose` for a moment, then `Online` with **Last update** `succeeded 1.7.0 → 1.7.1`.

#### 7.4 What happens on the board while it downloads: the LED, the pump, and the buzzer (3 minutes)

According to the `ota-update.cpp` code (the author hasn't seen the board), while it downloads:

- **The status LED** (D2) blinks while the file is written; the Module 8 heartbeat stops because `loop()` isn't running.
- **The pump and the buzzer go off**; the lamp, the fan, and the curtain keep their last state. The ESP32 only turns off the signal to the pump's MOSFET (its power still comes from the MB102, shared GND), and the Module 19 local safety rules stop too (Concept 3).

**What the OLED shows (text from the code `ota-update.cpp` and `trial-period.cpp`; not yet seen by the author; a slash = the next line):**

```text
contacting:   FIRMWARE UPDATE / 1.7.1 / contacting server / don't unplug power
downloading:  the third line becomes 0 %, 10 %, … 100 %
done:         FIRMWARE UPDATE / 1.7.1 / downloaded / restarting...
failed:       UPDATE FAILED / 1.7.1 / old firmware / still in use
rollback:     ROLLBACK / new firmware failed / back to version / <old version>   (Practice 8)
```

The running shelf and the time left in the trial period don't show yet: that's [🧩 Level 1](#level-1--the-program-shelf-and-the-trial-period-on-the-oled-screen-a-small-change-20-minutes).

#### 7.5 ⭐ O1: version 1.7.1, `reset_reason` `SW`, and the history `succeeded` without a cable (5 minutes)

The USB cable stays unplugged. On Node 1's card: **Firmware version** `1.7.1` without the badge `needs update`, and **Update** disabled (`The device is already running this version.`); **Restarted because** `SW` (`restarted by the program …`), not the `POWERON` of 7.1; **Update history** (click to open) `1.7.0 → 1.7.1 succeeded · <day, date, time> WIB`. Release 1.7.1 shows `Canary: 1 succeeded, 0 failed or rolled back`, and **Update all** is now unlocked ([Practice 9](#practice-9--optional-the-fleet-update-all-a-disconnected-device-and-expiry-15-minutes)). On the board (from the code), 1.7.1 is now on shelf `app1` and 1.7.0 is intact on `app0` (Concept 2); hold D13 for more than 1 second, and the Module 8 status page shows `Restart: SW` and `v1.7.1  free …KB`. The card's version briefly still `1.7.0`? See [🚨](#-troubleshooting) *The card still shows the old version, …*.

In the central machine's terminal, project root (PowerShell, not tested by the author: `Select-String` replaces `grep -E`):

```text
docker compose logs --since 30m backend | grep -E 'canary|downloaded|successfully|Telegram'
```

**Expected output (the author's lab, simulated "VPS", the simulated Node 1 = the simulator; cut, the prefix `backend-1  |` removed):**

```text
[15:33:27] INFO: f00d00000001 marked canary by account 1
[15:33:29] INFO: update c-20261102-083329-1 to f00d00000001: 1.7.0 → 1.7.1 (1411840 bytes), canary
[15:33:29] INFO: Telegram sent: 🔄 f00d00000001 stopped on purpose (firmware update or restart), back online shortly
[15:33:29] INFO: firmware 1.7.1 downloaded by f00d00000001 (running 1.7.0)
[15:33:34] INFO: Telegram sent: ✅ f00d00000001 online again after stopping on purpose (5 seconds)
[15:33:34] INFO: f00d00000001 updated successfully 1.7.0 → 1.7.1
```

`update … canary` = the command; `downloaded … (running 1.7.0)` = Node 1's own locked download; your size may differ a little. Your Telegram receives those two messages with your Node 1's `device_id` (the mock Telegram server in the lab received exactly two), without `📴 … offline`: stopping on purpose isn't disconnecting. The picture: the author's lab, another run (headless Chrome; the simulated Node 1 = the simulator; the real 1.7.1 file, not run); your names and numbers differ.

![Composite of real screenshots of the Fleet screen of the Mini Smart Home dashboard 1.4.0 with backend 1.5.0 on a simulated VPS and internet (a stand-in CA, Pebble), Chrome 156 on Linux, laptop 1280 pixels; the address bar is not captured. Practices 7.2 to 7.5, 3 Nov 2026 at 21:49 WIB: the simulated Node 1 f00d00000001 (simulator) updated over the air to 1.7.1, the real firmware compiled by the author, downloaded over simulated HTTPS and only checked, not run. Top left: the summary 3 active device(s) · latest Node 1 release: 1.7.1 · 1 to update (number 1); the card Practice living room Online with the canary badge (number 2); version 1.7.1, Restarted because SW restarted by the program, signal -57 dBm (strong), RAM 179 KB free, uptime 0 s (number 3); Last update succeeded 1.7.0 → 1.7.1 and the opened Update history with the same line (number 4); the choice 1.7.1 (latest, in use), the disabled Update button, the ticked Canary box (number 2). Middle: the card Practice kitchen with the needs update badge, 1.7.0 → 1.7.1, POWERON, uptime 30 min (number 5). Bottom: the release Node 1 1.7.1 latest, 1,411,840 bytes (72% of a shelf), Canary: 1 succeeded, 0 failed or rolled back, the buttons Update canary and Update all, now unlocked (number 6). Top right: two toasts, f00d00000001 back online and f00d00000001 updated successfully 1.7.0 → 1.7.1, 5.8 seconds after Yes, update (number 7). A legend on the right.](assets/fleet-after-canary.png)

**You pass this ⭐ step** (proof **O1**) when Node 1's USB cable isn't on the laptop, its card shows `1.7.1` and `SW`, and **Update history** holds `1.7.0 → 1.7.1 succeeded`. Without a Kit: the same proof on the simulated Node 1's card = a **simulated** O1.

#### 7.6 A locked download with `curl --http1.0` (optional, 2 minutes)

Imitate HTTPUpdate's request with the practice device `f00d00000005` ([3.2](#32--the-practice-device-its-broker-account-is-made-automatically-on-the-gateway-broker-pi1-8-minutes); its key is in `tools/.env`), not Node 1: a key you type is kept in the terminal's history. In a laptop terminal (PowerShell: `curl.exe`, not tested by the author), with `<key>` and your `SERVER_URL` address:

```text
curl --http1.0 -sI -A ESP32-http-Update -u f00d00000005:<key> -H 'x-ESP32-STA-MAC: F0:0D:00:00:00:05' -H 'x-ESP32-version: 1.7.0' https://iot.yourname.my.id/fw/node-1/1.7.1.bin
```

**Expected output (the author's lab, stand-in CA; cut, the fingerprint hidden):**

```text
HTTP/1.0 200 OK
Content-Length: 1411840
Content-Type: application/octet-stream
X-Ratelimit-Limit: 120
X-Sha256: <the fingerprint of your 1.7.1 file (6.3)>
```

No `Content-Encoding`, also when `gzip` is asked for (Concept 6). The author's lab: `x-ESP32-version: 1.7.1` → `HTTP/1.0 304 Not Modified`; without `-u` (use `-s`, not `-sI`, so the body shows) → `{"message":"needs Basic Auth device_id:key"}` (403); another MAC → `{"message":"x-ESP32-STA-MAC missing or not equal to device_id"}` (403); `http://iot.yourname.my.id/…` → `308 Permanent Redirect` (`-104` in HTTPUpdate), so an internet address is always `https://`.

> ⬆️ **Done with Practice 7?** Continue to [Practice 8](#practice-8--deliberately-broken-firmware-goes-back-to-the-old-version-by-itself-25-minutes): deliberately broken firmware must go back to 1.7.1 by itself (proof O2). The USB cable stays unplugged.

### Practice 8 — Deliberately broken firmware goes back to the old version by itself (25 minutes)

> 🖥️ **Tools used:** **Arduino IDE** on the laptop (8.1–8.2; the USB cable stays unplugged); **VS Code**, a terminal at the **project root** (8.2) and in the **`tools`** folder (8.3–8.4); **Chrome**, the **Fleet** screen (admin); **Bruno**; a terminal on the **central machine**, project root (8.4–8.5). Concepts used: 4 (8.5: 6).
>
> ⭐ **Required** — steps 8.1, 8.2, 8.3, and 8.4: the test release 1.7.2 with the badge `test` on the server, your code back at 1.7.1 with `TEST_WRONG_KEY = 0`, Node 1 back at 1.7.1 by itself without being touched (proof **O2**), and the result recorded in the history, the event log, and `vitals`.

> [!NOTE]
> **Not yet recorded by the author on a board.** Firmware 1.7.2-test was compiled by the author (3 November 2026, the Module 10 settings), but the author has never seen a rollback on a real board. The simulator doesn't run the contents of a `.bin`, so the test release in the author's lab is a **fake** `--test` file: the **Expected output** boxes = a simulated device with simulator numbers, not an ESP32 over Wi-Fi. The Serial and OLED text = text from the code.

The Syllabus asks for proof that firmware with a wrong broker key goes back to the old version by itself. The `TEST_WRONG_KEY` switch breaks the key in RAM only, NVS isn't touched, so the 1.7.1 that comes back still uses its real key ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c)). "The old version" = 1.7.1, the version before this update: 1.7.2 overwrites 1.7.0 on shelf `app0`, then the rollback starts `app1` again (state 3 in the picture of [Concept 2](#2-two-shelves-and-a-slip-of-paper-app0-app1-otadata-and-the-shelf-opener)).

> 🔀 **Without a Kit** (Wokwi too): skip the Arduino IDE part of 8.1 and all of 8.2. In a terminal in the `tools` folder, make a **fake** test release:
>
> ```text
> node make-fake-bin.js 1.7.2 ../../fake-firmware --test
> ```
>
> **Expected output (the author's lab, cut):** `FAKE file created: …/fake-firmware/node-1-1.7.2-TEST-FAKE.bin`, SHA-256 `b2a0836e651080973916d8b852ef299cef0c2ed65bd0986367a61c8be86f86a2`. Upload it in 8.1 with the **test** release box ticked, then do 8.3–8.5 with your simulated Node 1: the simulator reads the `TEST_WRONG_KEY` marker in its first 512 bytes, writes `REJECTED by broker (code 5)`, then `… back to 1.7.1 (simulated rollback)`: a simulated **O2**. It isn't firmware: don't send it to a real board.

#### 8.1 ⭐ Test release 1.7.2: `TEST_WRONG_KEY` set to 1, then upload with the test box ticked (5 minutes)

In Arduino IDE, in the `config.h` tab, change three lines (the version at the top, the switch at the end; the "Module 28 practice" table in the [firmware README](code/firmware/README.md)), then save (**Ctrl + S**):

```diff
-const char FIRMWARE_VERSION[] = "1.7.1";
-const char VERSION_NOTE[] = "installed over the air";  // Module 28: a short sentence on Serial at startup, may be changed
+const char FIRMWARE_VERSION[] = "1.7.2";
+const char VERSION_NOTE[] = "rollback TEST release";  // Module 28: a short sentence on Serial at startup, may be changed
 ...
-const int TEST_WRONG_KEY = 0;
+const int TEST_WRONG_KEY = 1;
```

Click **Sketch → Export Compiled Binary** (the **Tools** settings of 5.1). `Sketch uses …` goes up by several dozen bytes (the author's compile), because the TEST warning sentence now goes into the program too. **Don't** click **Upload**: by cable this firmware has no trial period (`UNDEFINED`, Concept 2), so Node 1 never gets into the broker until 1.7.1 is installed by cable again.

On **Fleet** → **Firmware releases** → the form **Upload Node 1 firmware**: choose the new `node-1-home.ino.bin`, version `1.7.2`, notes `rollback TEST release`, tick the **test** release box, then click **Upload firmware**.

**Expected output (the author's lab, stand-in CA, the fake test release file; cut):**

```text
Saved: Node 1 1.7.2 (test), Mon 2 Nov, 15:35 WIB
Size: 1,196,032 bytes (61% of a shelf)
```

That's the fake file's size; your real file is about 1.41 million bytes (`72% of a shelf`). Release 1.7.2 has the badge `test`, without the **Update canary** and **Update all** buttons (even through Bruno the server answers `409` `1.7.2 TEST release: only through Update per device, never for many devices`, the author's lab). The `latest` badge stays on 1.7.1, and the version choice on Node 1's card now holds `1.7.2 (test)`.

**You pass this ⭐ step** when the green box says `Saved: Node 1 1.7.2 (test)`, and the `latest` release is still 1.7.1.

#### 8.2 ⭐ Right away, set `TEST_WRONG_KEY` back to 0 and the version back to 1.7.1 (3 minutes)

The test file is on the server now; your code doesn't need to keep it. In the `config.h` tab, put the three lines back (`"1.7.1"`, `"installed over the air"`, `0`), save, then in the terminal at the project root:

```text
git diff --stat
```

**Expected output (the author's lab):** no output, meaning `config.h` is exactly the same as the commit of [6.5](#65-git-status-without-build-and-bin-then-commit-171-2-minutes), so this practice has no commit. A 1 that gets committed makes the next normal release fail to get into the broker on every board (safety rule number 7, checked again in [➕ E](#e--merge-featurefleet-into-main-through-the-pull-request-fleet-ota-rollback-claim-codes-and-the-enclosure)). The number 1.7.2 now belongs to the test release, so the next normal release is 1.7.3 ([Concept 5](#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest)).

**You pass this ⭐ step** when `git diff --stat` prints nothing, and the `config.h` tab says `"1.7.1"` and `TEST_WRONG_KEY = 0`.

#### 8.3 ⭐ O2: Node 1 goes back to 1.7.1 by itself after the 60-second trial period (10 minutes)

Set up a witness first (read in 8.4): in the laptop terminal, folder `tools`, run the contract checker for Node 1 only and leave it running (without a Pi: `127.0.0.1` in place of the gateway IP).

```text
node --env-file=.env contract-checker.js 192.168.1.37 <device_id Node 1>
```

On Node 1's card, choose `1.7.2 (test)` → **Update**. The confirm box (focus on **Cancel**) says `… the device goes back by itself to 1.7.1 (rollback). Don't unplug its power meanwhile.` and `This is a TEST release: made on purpose for rollback practice.` Click **Yes, update**, then touch nothing until the word `rollback` appears.

On the board (from the code): Node 1 stops on purpose, downloads (as in 7.4), restarts on `app0`, and is refused by the broker. The Serial Monitor (out of sight without a cable) writes `TRIAL PERIOD: firmware 1.7.2 was just installed over the air on shelf app0. …`, then, as soon as the 60 seconds are up, `Firmware 1.7.2 NOT proven within 60 seconds (not connected to the broker): ROLLBACK to the previous firmware.` The `rollback` report is saved first, the OLED briefly shows `ROLLBACK` / `new firmware failed` / `back to version` / `1.7.1`, then the board restarts into `app1`.

**Expected output (the author's lab, simulator: the simulated Node 1 `f00d00000001`, the fake test file; seconds since **Yes, update**; cut):**

```text
0.3 s   card: stopped on purpose
70.5 s  card: Online · Firmware version 1.7.1 · Last update: back to the old version (rollback) 1.7.1 → 1.7.2
70.5 s  toast: f00d00000001 FAILED to run 1.7.2 and went back to 1.7.1 by itself (rollback)
```

70.5 seconds in the simulator = ±5 seconds of simulated restart + the 60-second trial period + ±5 seconds; on a real board not measured by the author (write down your number in [➕ F](#f-save-your-study-notes-the-proof-from-o0-to-p1-the-beforeafter-photos-and-your-boards-numbers)). This is proof **O2**: without a cable and without being touched, Node 1's card is `Online` again with **Firmware version** `1.7.1`, **Restarted because** `SW` (the firmware itself restarted the board), and **Last update** `back to the old version (rollback)`. The next picture is from the author's lab, another run (simulator devices, the real 1.7.1 file but not run, a fake test release); on your screen the names and the `device_id` are yours.

![Composite of real screenshots of the Fleet screen of the Mini Smart Home dashboard 1.4.0 with backend 1.5.0 on a simulated VPS and internet (a stand-in CA, Pebble), Chrome 156 on Linux, laptop 1280 pixels; the address bar is not captured. Practice 8.3, 3 Nov 2026 from 21:50 to 21:51 WIB: the simulated Node 1 f00d00000001 (simulator) is told to run the test release 1.7.2, a fake file whose broker key is wrong on purpose; the 60-second trial period fails and the device goes back by itself 70.4 seconds after the command. Left: the card Practice living room, Online, canary; version 1.7.1 and Restarted because SW (number 1); Last update with the yellow badge back to the old version (rollback) 1.7.1 → 1.7.2 and the message not connected to the broker within 60 seconds (number 2); the opened Update history: 1.7.1 → 1.7.2 back to the old version (rollback) · Tue 3 Nov, 21:50 WIB · not connected to the broker within 60 seconds, then 1.7.0 → 1.7.1 succeeded · Tue 3 Nov, 21:49 WIB (number 3); the choice 1.7.2 (test), the ticked Canary box. Bottom left: the release Node 1 1.7.2 with the test badge, rollback TEST release, 1,196,032 bytes (61% of a shelf), without Update canary and Update all (number 4). Right: the toast f00d00000001 back online and the red toast f00d00000001 FAILED to run 1.7.2 and went back to 1.7.1 by itself (rollback) (number 5). A numbered legend on the right.](assets/fleet-rollback.png)

A second command during the trial period isn't queued: Bruno `update Node 1` in the author's lab was answered `409` `device is offline-mode: update commands are only sent to online devices (not queued)`. The backend log on the central machine writes `WARN: <id> FAILED to run 1.7.2 and went back to 1.7.1 by itself (rollback)`, and Telegram only `🔄 <id> stopped on purpose …` then `✅ <id> online again after stopping on purpose (70 seconds)`, without `📴` (as received by the mock Telegram server in the author's lab). The card stays `stopped on purpose`, and after 10 minutes its update is `expired`? The rollback didn't happen: recover by cable as in [🚨](#-troubleshooting) *Rollback never happens …*.

**You pass this ⭐ step** (proof **O2**) when, without a cable and without your touch, Node 1's card is `Online` again with version `1.7.1` and **Last update** `back to the old version (rollback)`.

#### 8.4 ⭐ The update history, the event log, and the `rollback` report in `vitals` (4 minutes)

Open **Update history** on Node 1's card: `1.7.1 → 1.7.2 back to the old version (rollback) · … · not connected to the broker within 60 seconds`, below it `1.7.0 → 1.7.1 succeeded`. The red toast was saved in the event log (Module 19); in the central machine's terminal, project root:

```text
docker compose exec -T db psql -U postgres -d smarthome -c "SELECT to_char(occurred_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS wib, device_id, kind, message FROM events WHERE kind = 'ota' ORDER BY id;"
```

**Expected output (the author's lab, the simulated Node 1; cut):** the last row `15:37:36`, `ota`, `f00d00000001 FAILED to run 1.7.2 and went back to 1.7.1 by itself (rollback)`. Then press **Ctrl + C** in the checker's terminal. **Expected output (the author's lab, simulator; WIB times; cut):**

```text
[3:36:26 PM] msh/f00d00000001/cmd  PASS
[3:37:36 PM] msh/f00d00000001/vitals  PASS  (update report 1.7.2: rollback)
^C
Summary: 8 messages PASS, 0 messages FAIL.
```

The first `vitals` after 1.7.1 starts again carries the `ota` report `rollback`, which was saved in NVS before the board restarted. The report rides along with at most 3 `vitals`, because `vitals` (QoS 0) can get lost; if all of them are lost, the server concludes it by itself (Concept 7). Started the checker too late? Run it now and wait for the next `vitals` (the default interval is 5 minutes).

After 8.5 (or now, if you skip 8.5), withdraw that test release: Bruno `withdraw test release` (its path is meant for 1.7.2) → `200`, and its download is answered `404`; reload the **Fleet** screen: 1.7.2 is gone from the version choice.

**You pass this ⭐ step** when the history and the event log record the 1.7.2 rollback, and the checker prints `vitals  PASS  (update report 1.7.2: rollback)`.

#### 8.5 A fingerprint that doesn't match: `failed` without a restart (optional, 3 minutes)

The fingerprint ([Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https)) refuses a file that changed by even one byte. Try it on the 1.7.2 file that's no longer used: in the central machine's terminal, project root, change one byte in its middle (the size stays the same), then print its new fingerprint, which now differs from the fingerprint on **Firmware releases**:

```text
docker compose exec backend sh -c 'printf X | dd of=firmware-data/node-1/1.7.2.bin bs=1 seek=100000 conv=notrunc 2>/dev/null; sha256sum firmware-data/node-1/1.7.2.bin'
```

Send `1.7.2 (test)` to Node 1 again: the server still serves that file, but the `update` command carries the old fingerprint, so Node 1 refuses to install it and the shelf note doesn't change.

**Expected output (the author's lab, simulator, a fake practice release 1.7.3 done the same way):** `update 1.7.3 FAILED (211 ms): SHA-256 doesn't match the command (Update 15 UPDATE_ERROR_SHA256)`, then still `online (firmware 1.7.1)`; the history `failed`; `uptime_s` in the next `vitals` 68, counted since the rollback of 8.3, so no restart. That `failed` report rides along with exactly 3 `vitals`, every 5 minutes. On the board (from the code): the OLED `UPDATE FAILED` / `1.7.2` / `old firmware` / `still in use`. Then withdraw 1.7.2 (8.4).

> ⬆️ **Done with Practice 8?** [Practice 9](#practice-9--optional-the-fleet-update-all-a-disconnected-device-and-expiry-15-minutes) is optional (many simulated devices at once); if you skip it, continue to [Practice 10](#practice-10--a-new-device-in-1-minute-a-claim-code-and-the-portal-30-minutes): a new device with a claim code (proof P1).

### Practice 9 — (Optional) The fleet: "Update all", a disconnected device, and expiry (15 minutes)

> 🖥️ **Tools used:** **Bruno** (**`login admin`** first; 9.1, 9.3); **VS Code** on the laptop, a terminal at the **project root**, in the **`tools`** folder, and in its copy **`tools-fleet`**; **Chrome**, the **Fleet** screen as the admin; **Telegram**. Concepts used: 7.

The canary-then-all pattern ([Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota)) is tried with many simulated devices at once. Your Node 1 is already on 1.7.1 and is just skipped; Node 2 isn't on the list. No commit. The **Expected output** boxes: the author's lab, every device a simulator, the real 1.7.1 firmware only downloaded and checked.

> 🔀 **Without a Kit** (Wokwi too): the simulated Node 1 `f00d00000001` stops too in 9.2 (skipped: `offline`); after starting it again in 9.3, also type `garden start`. **Without a Pi:** the simulator's broker `mqtt://127.0.0.1:1883`.

#### 9.1 A simulator with many devices: `needs update` cards (4 minutes)

Register a few new simulated devices as in [3.2](#32--the-practice-device-its-broker-account-is-made-automatically-on-the-gateway-broker-pi1-8-minutes): clone **`register practice device`**, fill in the `device_id` `f00d00000011` (a name such as `Fleet 11`), send it, keep its key, repeat with `f00d00000012` and `f00d00000013`, then delete that clone. Three are enough; the author's lab used twenty (`f00d00000011` to `f00d00000030`), each `201 Created` within 154–312 ms. Numbers 11 and up stay clear of your practice device and the simulated third board `f00d00000003` (Practice 10).

One simulator folder = one process (its `data/` folder = the simulated NVS), so the fleet gets a copy of `tools` next to your repository, outside Git. In the terminal at the project root (PowerShell: `Copy-Item -Recurse tools ..\tools-fleet`, not tested by the author):

```text
cp -r tools ../tools-fleet
```

In `../tools-fleet/.env`, keep `SERVER_URL`, delete all the old `KEY_F00D…` lines (one device in two processes fights itself for the session), then add `KEY_F00D00000011=<key>` and so on. The `tools` simulator keeps running. Right away (a registered device that's silent for more than 5 minutes sets off 🔴 "Silent node"), open a new terminal, `cd ../tools-fleet`, then (the last number = the highest number):

```text
node --env-file=.env device-simulator.js mqtt://192.168.1.37:1883 13
```

**Expected output (the author's lab, twenty devices with the number `30`; cut):**

```text
f00d00000001: no key in tools/.env (KEY_F00D00000001=...), not started.
20 fake device(s) heading to mqtt://192.168.1.37:1883 (default simulated firmware 1.7.0). Type for example …
f00d00000011: online (firmware 1.7.0)
```

Numbers without a key are skipped. Reload the **Fleet** screen: new `1.7.0` cards with the badge `needs update` (lab: `26 active device(s) · latest Node 1 release: 1.7.1 · 23 to update`).

#### 9.2 "Update all" to 1.7.1: sent, skipped, and why (4 minutes)

Release 1.7.1 already has a canary that `succeeded` ([7.2](#72--make-node-1-the-canary-2-minutes), [7.5](#75--o1-version-171-reset_reason-sw-and-the-history-succeeded-without-a-cable-5-minutes)), so **Update all** in **Firmware releases** is unlocked. Before clicking it, stop the simulator in the `tools` terminal (**Ctrl + C**): your practice device becomes a disconnected device for 9.3. Then **Update all** → the box `Update ALL Node 1s to 1.7.1? Every online Node 1 that meets the conditions gets the command at once. …` → **Yes, update all**.

**Expected output (the author's lab, 1.75 seconds after the click; all simulated devices; cut):**

```text
Update all to 1.7.1: 22 sent, 3 skipped
f00d00000011 accepted the command … (up to f00d00000030)
f00d00000001 skipped: device is already running 1.7.1
f00d00000004 skipped: device is offline: update commands are only sent to online devices (not queued)
f00d00000006 skipped: device kind not known yet: wait for its first telemetry
```

The reasons: `…01` = the simulated Node 1 (the canary, already on 1.7.1; your Node 1 too), `…04` = stopped before the click, `…06` = registered but has never sent `telemetry` (its key isn't in `.env` yet?). Other reasons: `device already deactivated (its key revoked)`, and for one that's downloading, `device is offline-mode: …`. A test release doesn't have this button.

In the lab, 22/22 `succeeded` 1.7.0 → 1.7.1 within 6.3–8.1 seconds; their cards changed without a reload. Twenty simulated devices downloaded the real 1,411,840-byte firmware at once over a simulated HTTPS, each in 1.5–2.7 seconds (simulator, not an ESP32 over Wi-Fi). 100 devices weren't measured. Telegram receives two messages per device, `🔄` then `✅` (the mock Telegram server in the lab: 44 messages for 22); [🧩 Level 3](#level-3--automatic-waves-canary-wait-until-healthy-then-the-rest-in-stages-from-scratch-45-minutes) cuts that to one summary per wave (its answer key, in the author's lab: 5 messages for 22 simulated devices).

#### 9.3 A stopped device: skipped, not queued (3 minutes)

Your practice device is listed `skipped: device is offline: …`; its card is `Offline`, and **Update** is disabled: `The device isn't online: update commands are only sent to online devices (not queued).` (text from the code). **Expected output (the author's lab, the stopped simulated device `f00d00000004`):** Bruno `update Node 1` (with that device's URL) is answered `409 {"message":"device is offline: update commands are only sent to online devices (not queued)"}`, and ±60 seconds after it stopped, the mock Telegram server receives `📴 f00d00000004 offline since 15:43 WIB`.

Start the `tools` simulator again (the 4.2 command) less than 5 minutes after it stopped; any later and the Module 25 "Silent node" alert goes off too. The device is `Online` again (Telegram: `✅ <id> back online (offline <n> min)`), but its version stays the same: that command wasn't queued. Click **Update** on its card, then **Yes, update** → `1.7.1`.

#### 9.4 Expired: no word for 10 minutes (4 minutes)

Just read this one. A Node 1 that loses power while downloading stays silent until the power comes back. Telegram writes `📴 <id> hasn't come back after stopping on purpose at HH:MM WIB` 3 minutes after `stopped on purpose` (so that a rollback, which takes longer than the 60-second trial period, doesn't set off `📴`). After `OTA_TIMEOUT_MINUTES` (default 10 minutes), the update becomes `expired (no word)`, and that device may be updated again. As soon as it starts, the old firmware finds its download plan in NVS and reports `failed` `power lost while downloading` (from the `ota-update.cpp` code), which overwrites `expired`.

**Expected output (the author's lab, simulator and mock Telegram, `OTA_TIMEOUT_MINUTES=3` for the lab only; the simulated third board `f00d00000003` forced off while downloading the fake test release 1.7.2; cut):**

```text
15:49:23 Telegram: 📴 f00d00000003 hasn't come back after stopping on purpose at 15:46 WIB
[15:49:37] WARN: update f00d00000003 to 1.7.2 expired: no word for 3 minutes
(simulator started again)
f00d00000003: update report rides along with vitals (1/3): {"id":"c-20261102-084623-26","result":"failed","version":"1.7.2","message":"power lost while downloading"}
[15:49:47] INFO: Telegram sent: ✅ f00d00000003 back online (offline 3 min)
[15:49:48] WARN: f00d00000003 failed to install 1.7.2, still running 1.7.1: power lost while downloading
```

Its **Update history** says `failed`, not `expired`. With the default, the second line reads `… no word for 10 minutes`; `📴` stays at 3 minutes.

The fleet devices stay registered: without the simulator, each one sets off `📴` and the "Silent node" alert. Leave the `tools-fleet` simulator running until [11.3](#113--deactivate-the-third-board-its-broker-account-deleted-disconnected-at-once-6-minutes): there its devices are deactivated while still `Online` (not 🔴 yet), and only then is its simulator stopped.

> ⬆️ **Done with Practice 9?** Continue to [Practice 10](#practice-10--a-new-device-in-1-minute-a-claim-code-and-the-portal-30-minutes): the third board registers itself with a claim code.

### Practice 10 — A new device in 1 minute: a claim code and the portal (30 minutes)

> 🖥️ **Tools used:** **Chrome**, the **Fleet** screen as the admin (10.1, 10.4, 10.5); **Arduino IDE** and the **Serial Monitor** with a USB cable from the laptop to the third board (10.2–10.4); a **phone** and a stopwatch (10.3); **VS Code**, a terminal at the **project root** (10.2); **Bruno** (10.5). Concepts used: 8.
>
> ⭐ **Required** — steps 10.1, 10.2 (the third board), 10.3, and 10.4: the claim code shown once, then closed, the third board running Node 1 firmware version 1.7.0, its portal filled in from a phone, and its new card `Online` on the **Fleet** screen within 60 seconds of **Save** (proof **P1**).

> [!NOTE]
> **Not yet recorded by the author on a board.** The author has never run the third board, the portal on a phone, or a claim on a real board. The Serial text below = text from the code; the portal picture = an illustration. The **Expected output** boxes = the author's lab: the third board played by the simulator in claim mode, with simulator numbers, not an ESP32 over Wi-Fi.

The Syllabus asks for a third ESP32 (borrowed, or Wokwi) registered within 1 minute through the portal and a claim code ([Concept 8](#8-a-new-device-in-1-minute-identity-claim-codes-and-automatic-broker-accounts)). One firmware for the whole fleet: the third board runs the same Node 1 firmware 1.7.0, its `device_id` comes from the board's own MAC, its key from the claim, its Wi-Fi and addresses from the portal. The backend makes its broker account by itself in dynamic security. No commit.

> 🔀 **Without a third board** (also **Without a Kit**): the third board is played by the simulated device `f00d00000003` of the simulator in claim mode, and **P1** is ticked as simulated. Do 10.1, skip 10.2–10.3, then in 10.4 run the command below instead of **Save** (the stopwatch starts at Enter). One simulator folder = one process, so use a copy of `tools` next to your repository (a terminal at the project root; PowerShell: `Copy-Item -Recurse tools ..\tools-board3`, not tested by the author):
>
> ```text
> cp -r tools ../tools-board3
> ```
>
> In a new terminal, `cd ../tools-board3`, then (the server address = `SERVER_URL`; the free path `http://192.168.1.37`; without a Pi `mqtt://127.0.0.1:1883` and `http://192.168.1.10`):
>
> ```text
> node device-simulator.js mqtt://192.168.1.37:1883 claim <code> https://iot.yourname.my.id f00d00000003
> ```
>
> **Wokwi:** also run the simulator above (for Practice 11), then create a new code. Because the portal can't be opened in Wokwi, type into the Serial Monitor's send field of your Wokwi board (`USE_WOKWI = true`), then press Enter:
>
> ```text
> claim <code> https://iot.yourname.my.id
> ```
>
> From Wokwi only a server with a domain can be reached. The device gets registered but is never `Online` on the **Fleet** screen: it goes into a public broker and sends its key unencrypted (deactivate it too in 11.3). Not tested by the author (1.7.0 may not fit Wokwi's default shelf, 1,310,720 bytes); **P1** not a full pass yet. Syllabus v1.0.30 records this path ([§5.4](../../SYLLABUS.md#54-learning-without-hardware-what-you-can-and-cannot-do-in-wokwi)), and the automatic broker accounts at the Pi gateway too.

#### 10.1 ⭐ Create a claim code on the Fleet screen: shown once, then Copy and Close (5 minutes)

On the **Fleet** screen, in the **New devices** part (admin only), fill in **Device name (optional)**, for example `Third board`, and **Location (optional)**, for example `garage`. Keep **Valid (minutes, 5-60)** at `30`, then click **Create code**.

**Expected output (the author's lab, headless Chrome; the code masked):**

```text
Claim code for Third board (simulated), valid until 16:10:37 WIB (30 minutes):
XXXX-XXXX
This code is shown only once: write it down now. After it's closed, the code can't be seen again; create a new code if it's lost.
Copy  Close
```

You type this code into the portal on the phone (10.3): tap **Copy** if your **Fleet** screen is open on that phone (the button turns into `Copied ✓`; text from the code, not checked by the author), or write it on a scrap of paper that you throw away after 10.5. Don't photograph it or keep it in your study notes, a chat, or Git: until it's used or expires, whoever holds it can register a board to your home. At an `http://<IP>` address the browser doesn't allow copying automatically, so the toast says `Can't copy automatically at this address: the code is already selected, copy it with Ctrl + C.` (also in the author's lab's headless Chrome). Click **Close**: the code disappears from the screen, and the database only keeps its fingerprint. The list **Recent codes (without the code)** in the author's lab shows `valid Third board (simulated) (garage) · valid until Mon 2 Nov, 16:10 WIB`.

**You pass this ⭐ step** when you've copied or written down the code, its box is closed, and the list **Recent codes (without the code)** shows `valid`.

#### 10.2 ⭐ The third board: the same firmware 1.7.0 by cable (8 minutes)

The third board = a plain borrowed ESP32 DevKit, without sensors or a display: just a USB cable to the laptop (Node 1 stays on its charger). In Arduino IDE (the Node 1 sketch with the `keys.h` of 5.2 and the **Tools** settings of 5.1), change the two version lines in `config.h` back to `"1.7.0"` and `"installed by cable"` (the reverse of 6.1), then save. Choose the third board's port in **Tools → Port**, then click **Upload** as in [Practice 5](#practice-5--node-1-170-by-cable-for-the-last-time-25-minutes-needs-a-board). Stuck at `Connecting…`? Hold **BOOT** as soon as that text appears, and release it when `Writing at …` starts running. Afterwards, set both lines back to `"1.7.1"` and `"installed over the air"`, save, then in the terminal at the project root `git diff --stat` must print nothing, as in 8.2. A borrowed board keeps your secrets: wipe it before you give it back (11.5).

Open the **Serial Monitor** (115200 baud); missed the first lines? Press **EN**.

**What the Serial Monitor shows (text from the code; not yet recorded by the author on a board):**

```text
Node 1 Home - firmware 1.7.0 (installed by cable)
…
OLED display not found at 0x3C. Node 1 keeps running without a display.
…
No saved WiFi yet.
WiFi portal open for 180 seconds: connect your phone to the WiFi "Node1-Home", then open http://192.168.4.1
Password-protected portal: its password is on the label of Node 1's box (PORTAL_PASSWORD in keys.h).
```

That OLED line is normal for a plain board, and its sensor fields will later be `null` or floating numbers (pins without sensors). No `No saved WiFi yet.`? Then the borrowed board still holds an old Wi-Fi: type into the Serial Monitor's send field and press Enter:

```text
wifi forget
```

The answer (text from the code): `Saved WiFi erased. Restarting now; the WiFi portal will open.`

**You pass this ⭐ step** when the Serial Monitor writes `firmware 1.7.0 (installed by cable)` and the portal opens, while `git diff --stat` prints nothing.

#### 10.3 ⭐ The `Node1-Home` portal from a phone: Wi-Fi, claim code, server address, and broker address (7 minutes)

Leave the third board on the USB cable with the Serial Monitor open. The portal only lasts 180 seconds if unused: `Node1-Home` gone? Press the third board's **EN**. On the phone, follow [Module 10 4.4](../../phase-2-connectivity/module-10-wifi-and-http/README.md#44-enter-the-wi-fi-from-your-phone): turn mobile data off, connect to the Wi-Fi `Node1-Home` (now with the portal password of [5.2](#52--a-password-protected-portal-portal_password-in-keysh-3-minutes)), then wait for the portal page to open by itself or open `http://192.168.4.1`. The first page, `Node 1 Home`, holds **Configure WiFi**, **Info**, and **Exit**, without **Update**. Tap **Configure WiFi**, tap your home's 2.4 GHz Wi-Fi name, fill in **Password**, then the three fields below it (no example text inside the boxes, only a label above them):

- **Claim code**: the code of 10.1 (the server accepts lowercase too).
- **Server address**: **exactly the same** as `SERVER_URL` ([2.3](#23--the-infrastructure-files-and-the-central-machines-env-mosquitto_dynsec_password-and-server_url-6-minutes)), not just the example in its label: the main path `https://iot.yourname.my.id`, the free path `http://192.168.1.37` (the device door passes claims on), without a Pi `http://192.168.1.10` (the laptop's door 80 open, phone mode). At most 64 characters, no `/` at the end; `http://` only to a home IP address.
- **Broker address**: already holds the `BROKER_ADDRESS` of your `config.h` (the Pi gateway's IP); just check it (without a Pi: the laptop's IP).

The next illustration isn't a phone screenshot: the author rebuilt both pages from WiFiManager 2.0.17's real HTML with the 1.7.0 firmware settings; the Wi-Fi names are only examples.

![Illustration, not a phone screenshot: two pages of a new board's Wi-Fi portal rebuilt by the author from the real HTML, CSS, and texts of WiFiManager 2.0.17 with the Node 1 1.7.0 firmware settings, rendered by Chrome 156 on Linux 375 pixels wide; no ESP32 served it. Left, the first page http://192.168.4.1/: the title Node 1 Home and the portal Wi-Fi name Node1-Home, the blue buttons Configure WiFi, Info, and Exit without an Update button, then the box No AP set (number 1). Middle, the Wi-Fi page after filling in: the example Wi-Fi list OurHome, Next_Door, Jasmine_Dorm with padlocks; SSID holds OurHome and Password holds dots (number 2); the field Claim code from /fleet (may be empty) holds XXXX-XXXX, a masked code (number 3); the field Server address, for example http://192.168.1.10 holds https://iot.yourname.my.id (number 4); the field Broker address (the Pi gateway's IP) holds 192.168.1.37 (number 5); the Save button (number 6), Refresh, and No AP set. Top right, a new board's initial content before typing: the code and server address fields empty, the broker address already 192.168.1.37. Notes: the code field holds at most 12 characters, the server address 64 and must be exactly the server's SERVER_URL, the broker address 40; the three boxes have no example text, only the label above them. The Noto Sans font because Verdana is not on the author's machine.](assets/claim-code-portal.png)

Get the stopwatch ready, tap **Save**, and start counting. The board stores the Wi-Fi and both addresses in NVS (the code only in RAM), then closes the portal as soon as it's connected to the home Wi-Fi; turn your phone's mobile data back on.

**You pass this ⭐ step** when the phone joins `Node1-Home` with the portal password, the three fields are filled in with a server address exactly the same as `SERVER_URL`, and **Save** has been tapped.

#### 10.4 ⭐ P1: a new card `Online` on the Fleet screen within 60 seconds of Save (6 minutes)

Watch the **Fleet** screen on the laptop, without reloading. As soon as the board exchanges its code, the toast `<device_id> registered through a claim code as <name>; broker account created at gateway broker pi1` appears (without a Pi: `… at central broker`), then its new card goes `Online` with the name and location from the code: first `kind not known yet` and `never seen yet`, then `Node 1` with **Firmware version** `1.7.0` as soon as the first `telemetry` arrives. Stop the stopwatch when the card is `Online` with version `1.7.0`: 60 seconds at most = **P1**. The health and the `needs update` badge only show after a page reload.

**What the Serial Monitor shows (text from the code; not yet recorded by the author on a board; cut):**

```text
Claim code accepted (not saved in NVS); sent to https://iot.yourname.my.id as soon as Wi-Fi is ready.
…
Claim SUCCEEDED in … ms: device key saved in NVS (broker username <device_id>). Connecting to the broker...
```

How long it takes on a real board: not measured by the author; your stopwatch is the first to measure it (write it down in ➕ F). More than 60 seconds, `Claim REFUSED`, or `Claim FAILED`? See the [🚨](#-troubleshooting) group **The portal and claim codes**.

**Expected output (the author's lab, simulator: the simulated third board `f00d00000003`, simulated TLS bridge):**

```text
f00d00000003: claim SUCCEEDED in 274 ms (broker username f00d00000003); key stored in data/simulator-store.json, connecting to the broker...
1 fake device(s) heading to mqtt://192.168.1.37:1883 (default simulated firmware 1.7.0). Type for example …
f00d00000003: online (firmware 1.7.0)
```

Since the simulator started: the toast 1.2 seconds, the new card 1.5 seconds, `Online` with version `1.7.0` 6.7 seconds (a simulated **P1**; simulator numbers, not a board over Wi-Fi). The backend writes `POST /provision/claim -> 201 (147 ms)`, and the gateway log `setDefaultACLAccess` then `createClient | username=f00d00000003`, without a single command on the Pi. The next picture is from the author's lab, another run (the third board = the simulator, the code masked); on your screen the name and the `device_id` are yours.

![Composite of real screenshots of the New devices part of the Fleet screen of the Mini Smart Home dashboard 1.4.0 with backend 1.5.0 on a simulated VPS and internet (a stand-in CA, Pebble), Chrome 156 on Linux, laptop 1280 pixels; the address bar is not captured. Practices 10.1 and 10.4, 3 Nov 2026 at 21:51 WIB. Top: the box Create claim code with the fields Device name and Location empty again, Valid 30 minutes, the Create code button (number 1); the yellow box Claim code for Third board (simulated), valid until 22:21:45 WIB (30 minutes): with the code masked by the author as XXXX-XXXX before the shot, so the real code was never captured (number 2); the sentence This code is shown only once: write it down now. with the Copy and Close buttons (number 3); the list Recent codes (without the code) with the badge valid Third board (simulated) (garage) · valid until Tue 3 Nov, 22:21 WIB (number 4). Middle: the same list after the simulated third board, the simulator in claim mode, exchanged its code: used Third board (simulated) (garage) · used f00d00000003, Tue 3 Nov, 21:51 WIB (number 5). Bottom: the new card Third board (simulated), Online, Node 1 · garage · f00d00000003, version 1.7.0 without the needs update badge, Health no vitals yet, shown without reloading the page (number 6); the health and the needs update badge only follow when the fleet data is fetched again. A numbered legend on the right.](assets/claim-code-created.png)

**You pass this ⭐ step** (proof **P1**) when the third board's card is `Online` on the **Fleet** screen within 60 seconds of **Save**, with version `1.7.0`, and its code is `used` in the list. Keep this board running for Practice 11.

#### 10.5 Refused claims: `403`, `409`, and `429` (4 minutes)

Create a NEW code in **New devices**, write it in `backend/bruno/.env` as `CLAIM_CODE=<code>` (outside Git, like the Module 20 password), then send Bruno `claim simulated device` with your third board's `device_id` in the **Body** tab (simulated: keep `f00d00000003`). Replace the contents of `CLAIM_CODE` with the used code of 10.1, send again, then keep clicking **Send** until `429`. Don't press **Ctrl + S**. The **Tests** tab marks one Assert as failed: that's expected, the request expects `201`.

**Expected output (the author's lab, the simulated third board; cut):**

```text
409 {"message":"f00d00000003 is still registered and active: deactivate it on /fleet first, then claim again"}
403 {"message":"claim code wrong, expired, or already used: ask the admin for a new code"}
429 {"statusCode":429,"error":"Too Many Requests","message":"too many attempts: try again in 57 seconds"}
```

`409`: an identity that's still active can't be taken over, and the new code stays `valid` (this test needs a new code because the server checks the code first). `403` is exactly the same for a used, an expired, and a made-up code, so a guesser can't tell which codes ever existed. `429` comes on the 11th attempt within a minute from the same IP address (on the main path, one address for your whole home): wait a minute before the next claim. Delete the `CLAIM_CODE` line again. The board's answers to all three: [🚨](#-troubleshooting) *Claim refused: …*.

> ⬆️ **Done with Practice 10?** Read [Concept 10](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect), then continue to [Practice 11](#practice-11--the-vitals-interval-from-afar-and-deactivating-a-lost-device-20-minutes): you'll deactivate the newly registered third board, then claim it again.

### Practice 11 — The `vitals` interval from afar and deactivating a lost device (20 minutes)

> 🖥️ **Tools used:** **Chrome**, the **Fleet** screen as the admin; an **SSH terminal to the Pi**, folder `mini-smart-home/edge` (11.1, 11.3, 11.4; without a Pi: a laptop terminal at the project root); **Grafana** (`/grafana/`; 11.2); **Bruno** (11.3, 11.5); the third board: the Arduino IDE **Serial Monitor** over its USB cable, or its simulator terminal (11.3, 11.5). Concepts used: 9, 10.
>
> ⭐ **Required** — steps 11.1, 11.2, 11.3, and 11.4: Node 1's `vitals` interval set to 60 seconds from afar, a Grafana silence in place first, the third board deactivated and disconnected by the broker at once, and you know what stays behind.

Two admin jobs from afar: changing a setting and cutting off a lost device. The third board of Practice 10 is deactivated, then brought back in 11.5. No commit. The **Expected output** boxes: the author's lab, every device a simulator, the mock Telegram.

> 🔀 **Without a Kit** (Wokwi too): 11.1 on the card of the simulated Node 1 `f00d00000001`; its third board = the simulated third board `f00d00000003` (the simulator in claim mode, 10.4); your Wokwi board is deactivated too. **Without a Pi:** PowerShell uses `Select-String`, not `grep` (not tested by the author); its broker log starts with `dynsec: backend/backend | …` and the backend writes `central broker`.

#### 11.1 ⭐ A 60-second `vitals` interval through More settings (5 minutes)

On Node 1's card, click **More settings**, fill in **Vitals interval (seconds, 60-3600)** with `60`, then click **Save interval**. Its limits are written below it: `Only vitals (health). telemetry stays every 10 seconds. Wi-Fi, the server address, and the key can't be changed from afar.`

**Expected output (the author's lab, the simulated Node 1 `f00d00000001` in the simulator):** the toast `Vitals interval for Practice living room = 60 seconds.`, the card `… vitals sent every 60 seconds (set by the admin).`, and the simulator `f00d00000001: vitals interval saved: 60 seconds`.

This setting is sent as a retained `config` (Concept 9). See it in the Pi terminal, folder `edge` (`<password>` = the password of the `monitor` account):

```text
docker compose exec mosquitto mosquitto_sub -u monitor -P <password> -t 'msh/<device_id Node 1>/cmd' -v -C 1
```

**Expected output (the author's lab, the simulated Node 1; the same at the central broker and the gateway):**

```text
msh/f00d00000001/cmd {"id":"c-20261102-084858-27","ts":"2026-11-02T08:48:58Z","action":"config","intervals":{"vitals_s":60}}
```

Got a fan rule (Module 19)? Its `thresholds` ride along in this message. Replace `cmd` with `vitals` and `-C 1` with `-C 2`: the two `ts` are ±60 seconds apart (the author's lab: 15:49:58 and 15:50:58 WIB). On the board (text from the code): `Vitals interval saved to NVS: 60 seconds`, so the setting survives a power cut. Keep it at 60 seconds until Practice 13 so that Node 1's health in the box is read every minute; [13.3](#133-the-vitals-interval-back-to-300-seconds-optional-2-minutes) sets it back to 300.

**You pass this ⭐ step** when Node 1's card says `vitals sent every 60 seconds (set by the admin)` and its retained `cmd` holds `"intervals":{"vitals_s":60}`.

#### 11.2 ⭐ Create a silence for the "Silent node" alert in Grafana before deactivating (3 minutes)

A device that's really lost is usually 🔴 already in the "Silent node" alert; after it's deactivated, Grafana sends a false `✅ <name> is sending data again.` ([Concept 10](#10-deactivating-a-lost-device-from-revoking-a-key-to-an-instant-disconnect)). So silence it first.

In Grafana, open **Alerting → Silences**, then click **Create silence** (if there's already another silence: **Add Silence**). In **Refine affected alerts**, fill in **Label** with `device_id` and **Value** with the third board's `device_id` (copy it from its card); **Operator** is already `=`. **Duration** defaults to `2h`; change **Comment** to, for example, `third board deactivated`, then click **Save silence**. The button and field names come from the Grafana 13.2.4 code; the author's silence was made through the API.

**Expected output (the author's lab, simulated devices; as received by the mock Telegram server):** two devices that were both 🔴 were deactivated. The one with a silence: no message for 9 minutes; the one without a silence set off `✅ Deactivate test without silence is sending data again.` 4 minutes 36 seconds later. For a board that's still `Online` (not 🔴 yet), this silence is habit practice.

**You pass this ⭐ step** when the **Silences** list shows `device_id=<device_id of the third board>` in the **Matching labels** column before you press **Deactivate**.

#### 11.3 ⭐ Deactivate the third board: its broker account deleted, disconnected at once (6 minutes)

Make sure the third board's card ([10.4](#104--p1-a-new-card-online-on-the-fleet-screen-within-60-seconds-of-save-6-minutes)) is `Online` (without a Kit: its simulator is running). The borrowed board already went back? Deactivate it anyway (its log then only shows `deleteClient`), or practice with the practice device `f00d00000005` of [3.2](#32--the-practice-device-its-broker-account-is-made-automatically-on-the-gateway-broker-pi1-8-minutes). Click **More settings** → **Deactivate**. The red box `Deactivate <name>? For a device that is lost, stolen, or no longer used. …` opens with the focus on **Cancel**; click **Yes, deactivate**.

Its card gets the badge `deactivated` (`Deactivated: its key is revoked and its messages are ignored. …`), without **Update**, **Canary**, and **More settings**. The yellow box `After deactivating:` holds two items from the server: its broker account is already deleted; a reminder about `mosquitto_passwd -D` for Module 21 devices (3.4; a board from a claim code: ignore it). The focus moves to its **Close**, for keyboard and screen-reader users. **Expected output (the author's lab, the simulated third board `f00d00000003`):** the toast `f00d00000003 deactivated by account 1: its broker account deleted at gateway broker pi1`. The picture: the author's lab (simulator devices); your name and `device_id` differ.

![Composite of two real screenshots of the card Third board (simulated), the simulator device f00d00000003, on the Fleet screen of the Mini Smart Home dashboard 1.4.0 with backend 1.5.0 on a simulated VPS and internet (a stand-in CA, Pebble), Chrome 156 on Linux, laptop 1280 pixels; the address bar is not captured. Practice 11.3, 3 Nov 2026 at 21:52 WIB. Top, the lower part of the card: More settings open with Vitals interval 300 and Save interval, the red-outlined Deactivate button, then the red box Deactivate Third board (simulated)? explaining that the key is revoked, the broker account deleted, and the device disconnected at once (number 1), with the buttons Yes, deactivate and Cancel (number 2). Bottom, the whole card after Yes, deactivate: the red badge deactivated (number 3), version 1.7.0, the pink box Deactivated: its key is revoked and its messages are ignored. It comes back only with a new key or a new claim code. (number 4), without the Update, Canary, and More settings controls; the yellow box After deactivating: with two steps from the server, that the broker account f00d00000003 is already deleted at gateway broker pi1 so the device is disconnected at once, and a reminder for a device registered the Module 21 way to remove its old line with mosquitto_passwd -D, then restart the broker (number 5); the Close button (number 6). A numbered legend on the right.](assets/deactivate-device.png)

Right away, in the Pi terminal, folder `edge`:

```text
docker compose logs --since 5m mosquitto | grep <device_id of the third board>
```

**Expected output (the author's lab, the simulated third board; prefix removed):**

```text
dynsec: local.pi-bridge/(null) | deleteClient | username=f00d00000003
Client f00d00000003 [172.20.0.1:47286] disconnected: administrative action.
Client f00d00000003 [172.20.0.1:50160] disconnected: not authorised.
```

The account was deleted through the bridge; the next attempt to get in is refused. The simulator writes `… REJECTED by broker (code 5): wrong key, not registered, or revoked. Retrying in 60 seconds.`; a real board writes nearly the same sentence, starting with `MQTT`, in the Serial Monitor (text from the code). **Update** is gone already; Bruno `update Node 1` (with the third board's URL) is answered `409` `device already deactivated (its key revoked)` (the author's lab).

Did Practice 9? Also deactivate the simulated fleet devices `f00d00000011` and onward while they're `Online`, then stop the `tools-fleet` simulator (**Ctrl + C**).

**You pass this ⭐ step** when the third board's card has the badge `deactivated` and the broker log holds `deleteClient` for its `device_id` (and `administrative action` if the board was connected).

#### 11.4 ⭐ What stays behind: the old status, the key in NVS, and `503` when the gateway can't be reached (2 minutes)

Three honest leftovers (Concept 10):

- **The old retained `online` status.** The broker disconnects without the will, and the `backend` account may not write the `status` topic. Check it with the command of 11.1, with the topic `msh/<device_id of the third board>/status`. **Expected output (the author's lab):** the simulated third board is still `online` at both brokers, although its card says `deactivated`; the backend ignores it.
- **The key in the board's NVS** can be read by whoever takes the board apart, but it's useless now: its account is deleted. The home Wi-Fi password can be read too.
- **`503` when the gateway can't be reached**, for example when the home internet is down on the main path. The card shows a red box that stays until **Close**: `not saved in the database yet (…). A command that already reached the broker may still be carried out as soon as its connection is back: repeat this step …`.

**Expected output (the author's lab, the simulated home internet unplugged for 6 seconds; the simulated fleet device `f00d00000030`):** `503` after 6.1 seconds. As soon as the internet was back, the gateway still ran the held `deleteClient`, while the database still said `online`. Repeated: `200` (140 ms) with `"broker_account": "none"` and the `mosquitto_passwd -D` step: that's expected, its account really was deleted already ([🚨](#-troubleshooting) *`503` `not saved in the database yet` …*).

**You pass this ⭐ step** when `mosquitto_sub` shows the third board's leftover retained status (usually `online`) while its card says `deactivated`, and you know the answer to a `503`: repeat **Deactivate** once the gateway can be reached.

#### 11.5 Claim again with a new code (4 minutes)

That board turned up again? Its card becomes active again only with a **new** code (the code of [10.1](#101--create-a-claim-code-on-the-fleet-screen-shown-once-then-copy-and-close-5-minutes) is used: `403`). In **New devices**, fill in the same name and location, click **Create code**, **Copy**, then **Close**. The real third board still holds its Wi-Fi and its server address; type into its Serial Monitor's send field, then press **Enter**:

```text
claim <code>
```

**What the Serial Monitor shows (text from the code; not yet recorded by the author on a board; cut):**

```text
claim: code accepted; sent to <server address> as soon as Wi-Fi is ready (the result shows in the log).
…
Claim SUCCEEDED in … ms: device key saved in NVS (broker username <device_id>). Connecting to the broker...
```

The simulated third board: stop its simulator (**Ctrl + C**), then run the claim command of 10.4 again with the new code in the same folder. **Expected output (the author's lab, simulator):** `f00d00000003: claim SUCCEEDED in 309 ms …`, the backend log `f00d00000003 registered through a claim code as Third board (simulated); broker account created at gateway broker pi1` (`201`, 147 ms), and the database `online` again. The practice device: rotate the key of `f00d00000005` (3.4 step 1), put its new key into `tools/.env`, then run the 4.2 simulator again.

The borrowed board is going back? Deactivate it again, then wipe it: your home Wi-Fi is stored in its NVS, the ESP-NOW key and the portal password in its firmware. In Arduino IDE, open an empty sketch (**File → New Sketch**), set **Tools → Erase All Flash Before Sketch Upload** to **Enabled** (port: the third board), then click **Upload** (stuck at `Connecting…`? Hold **BOOT** as soon as that text appears, and release it when `Writing at …` runs). Afterwards set it back to **Disabled** so the next upload doesn't erase NVS.

> ⬆️ **Done with Practice 11?** Every update now runs without a cable, so Node 1 is ready to go into the box. Read [Concept 11](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v) if you haven't yet, then continue to [Practice 12](#practice-12--from-breadboard-to-enclosure-90-minutes-needs-a-board-the-soldering-path-adds-60-minutes). The path without a Kit: write your box plan in Practice 12, then continue to [➕ Add-on](#-add-on-to-mini-smart-home).

### Practice 12 — From breadboard to enclosure (90 minutes, needs a board; the soldering path adds 60 minutes)

> 🖥️ **Tools used:** a **ruler**, a small **screwdriver**, a wire stripper, a **multimeter** ([Module 2 Practice 1](../../phase-0-foundations/module-02-electricity-and-first-upload/README.md#practice-1--measuring-with-a-multimeter-20-minutes)), labels, and cable ties; **Chrome**: the **Fleet** screen and Node 1's detail page as the admin; the **Serial Monitor** over the laptop's USB cable (12.4: the servo and the buzzer); **VS Code**, a terminal at the **project root** (12.1). Concepts used: 11.
>
> ⭐ **Required for the paths with a Kit** — steps 12.1 to 12.4 and 12.6 to 12.9: the expansion board fits, Node 1 moved group by group and passing its tests, the Module 9 power supply labeled with a shared GND, the multimeter and the pull test passed, then the labeled box closed and Node 1 `Online` again (proof **K1 a–d**).

> [!NOTE]
> **Not recorded by the author.** The author didn't use an expansion board, a box, a soldering iron, or a multimeter, so Practices 12–13 have no **Expected output** boxes. The steps come from [`PIN-MAP.md`](code/PIN-MAP.md#node-1-inside-the-box-since-module-28) version 7, Modules 2, 5, 6, and 9, and sources read on 30–31 October 2026 (SparkFun and HSE for soldering); screen texts = text from the code. Every seller's parts differ: measure and match your own.

Updates now go over the air (Practices 7–8), so the box may cover Node 1's USB port. The pins and the firmware **don't change**; only the way things connect changes (Concept 11), and Node 2 stays in its Module 14 housing. During 12.2–12.9 (±1.5 hours), Node 1 only runs during the tests of 12.4, so Telegram reports `📴 <device_id> offline since HH:MM WIB` (text from the code) and the Module 25 "Silent node" alert goes off. The only commit is in 12.1.

> 🔀 **Without a Kit** (Wokwi too): write a **box plan** in your study notes ([➕ F](#f-save-your-study-notes-the-proof-from-o0-to-p1-the-beforeafter-photos-and-your-boards-numbers)): the layout drawing of 12.3, the shopping list of [🧰](#-what-you-need) with the dated prices you checked, and the sizes you wrote down (inside the box, the distance between the two rows of pins from the seller's description). This plan **doesn't** pass K1 yet; Practice 13 waits for the board.

#### 12.1 ⭐ Match the expansion board to your DevKit: measure the distance between the two pin rows (5 minutes)

With a plastic ruler (not a metal one: Node 1 is still running on the breadboard), measure the distance between your DevKit's two rows of pins, from the middle of a pin to the middle of the pin across from it, then the distance between the expansion board's two rows of holes. They must be the same; don't trust a "standard" number, because the distance isn't the same from factory to factory. Each row has 15 holes ([Module 5 Concept 1](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#1-anatomy-of-the-esp32-devkit-v1-board-which-pins-you-have)); 19 means a board for 38 pins, which doesn't fit.

Its terminal labels may be GPIO numbers (`32`), D names (`D32`), or both. Match them against the first column of the Node 1 table in `PIN-MAP.md` (including `36 (VP)` and `16 / 17 (RX2 / TX2)`), then write down the matches in one sentence below the table **Node 1 inside the box** (VS Code, the `feature/fleet` branch), for example:

```text
My expansion board writes the GPIO numbers without D (32 = D32, 36 = VP, 16 = RX2); its DC jack isn't used.
```

Then in the laptop terminal:

```text
git add PIN-MAP.md
git commit -m "Module 28 Practice 12: expansion board terminal labels"
git push
```

**You pass this ⭐ step** when the two distances are the same, each row has 15 holes, and the matching labels are written down in `PIN-MAP.md`.

#### 12.2 ⭐ Unplug all power: the board's charger and the load adapter (2 minutes)

No "before" photo yet ([🔁 Step 5](#step-5--a-before-photo-of-node-1-from-above))? Take it now. Also write down the **Wi-Fi signal** on Node 1's card (Concept 11). Then, in the order of the golden power rules, turn the MB102 off and unplug the **MB102** cable first, then unplug the **ESP32** cable from the board's USB port. From now on, wires are only fitted or moved without power, also between the tests of 12.4.

**You pass this ⭐ step** when both power cables are unplugged and no LED is lit on the DevKit, the MB102, or the relay module.

#### 12.3 ⭐ A layout plan on paper: board, sensors, power, and ventilation (15 minutes)

Draw the bottom of your box from above, preferably at full size so you can lay the parts on it. An example is the diagram of [Concept 11](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v); your arrangement may differ, as long as:

- **Inside:** the expansion board with the DevKit, the mini breadboard with the MB102 at the end of its rails, the relay module, and the MAX485 (if used). The 3.3 V rail on a second mini breadboard, like the workbench's bottom rail, not the rail on the MB102's **OFF** side.
- **Power:** one hole near the MB102 and the DevKit's USB port.
- **Outside or through the wall:** the DHT22 outside, away from the warm ESP32 and MB102; the PIR and the LDR facing the room; the HC-SR04 cable to the water tank, the soil sensor to the pot, and the load cables (lamp, fan, pump, curtain servo).
- **From outside:** the OLED and the status LED visible; the D13 button reachable (the Wi-Fi portal: hold D13 while pressing EN); the EN button reachable or marked.
- **Ventilation** in the top and bottom walls; the box **higher** than the water tank and the pot, away from splashing water; its lid still fits over the tallest part.

Make the holes while the box is empty: with hand tools, slowly, cutting away from your hands, no bigger than needed. Smooth the edges so they don't scratch the wire insulation.

**You pass this ⭐ step** when your plan holds all these points, the holes are made, and you've photographed the drawing for your study notes.

#### 12.4 ⭐ Move it group by group with PIN-MAP 7: power, actuators, then sensors (35 minutes)

Every group goes through the same cycle: **fit** without power → **quick check** in continuity mode (the 5 V and 3.3 V rails to GND **silent**; the expansion board's GND and the MB102's GND **beep**; the full check in 12.7) → **power on** (the ESP32 cable first, then the MB102) → **test** → **power off** (the MB102 first). The wires: one per terminal, each in the terminal labeled with the same GPIO as in the Node 1 table; 22 AWG solid wire, short but not tight, stripped only as long as the terminal hole (no copper sticking out, no insulation clamped); red 5 V, orange 3.3 V, black GND.

**(a) Power.** Stick the mini breadboard (and the breadboard for the 3.3 V rail) to the bottom of the box, then plug the MB102 into the end of its rails: the jumper on the load side at **5V**, the other side **OFF**, as on the workbench. Move the DevKit to the expansion board: its pin labels (`EN`, `VIN`, `GND`, `3V3`) must match the terminal labels next to them, so it isn't the wrong way round. Press it in evenly, then fasten the expansion board to the bottom of the box (screws in its corner holes if it has them, or double-sided foam tape). Fit black wires from both GND terminals to the MB102's GND rail and to the GND of the 3.3 V rail, then an orange wire from the `3V3` terminal to the 3.3 V rail. During 12.4, the **ESP32** cable may come from the laptop if you need the Serial Monitor. Test: Node 1's card on the **Fleet** screen goes `Online` again by itself, and the DevKit's blue LED blinks fast (according to the code: the DHT22 and the HC-SR04 aren't fitted yet).

**(b) Actuators.** The golden power rules: the loads from the MB102's 5 V rail, never from the ESP32's VIN or 3V3 pin, with a shared GND. The relay's `IN1` to D32 (lamp), `IN2` to D33 (fan), its `VCC` and `GND` to the 5 V rail and GND; the pump's MOSFET circuit of [Module 5 Practice 7](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#practice-7--running-the-pump-for-3-seconds-through-a-mosfet-30-minutes) on the mini breadboard (the 12.5 table); the curtain servo to D26, its red and brown wires to the 5 V rail and GND, plus the Module 5 100 µF capacitor (long leg to 5 V); the passive buzzer (D27) and the status LED (D2) each through 220 Ω; the button to D13 and GND. Test on Node 1's detail page, in the **Controls** part: **Lamp** and **Fan** (the relay clicks, the load turns on); the pump is tested in (c): without the HC-SR04 the firmware refuses it. Briefly press the D13 button: the lamp toggles. The servo and the buzzer have no button on the dashboard; type into the Serial Monitor's send field one at a time, each followed by Enter:

```text
curtain 90
curtain 0
beep
```

The servo moves and the buzzer beeps briefly; the Serial Monitor answers `status: …` (text from the code).

**(c) Sensors.** The DHT22 (D14, 3.3 V) outside the box; the LDR divider and its capacitor on the mini breadboard to VP, the LDR itself through the wall; the soil sensor (VN, 3.3 V) to the pot; the PIR (D34, 5 V; its output is only 3.3 V); the HC-SR04 (TRIG to D15, ECHO through a divider to D35, 5 V) to the water tank; the OLED (SDA D21, SCL D22, 3.3 V); the MAX485 if used (RO through a divider to RX2, DI to TX2, DE and RE to D4, VCC 5 V; Module 15). Test on Node 1's detail page once the PIR has warmed up for ±1 minute ([Module 6 Practice 5](../../phase-1-esp32-embedded/module-06-reading-sensors/README.md#practice-5--pir-the-motion-sensor-and-its-1-minute-warm-up-20-minutes)): **Temperature** and **Humidity** close to before the move, **Light** changing when your palm covers the LDR, **Motion** `Yes` when you wave, **Soil moisture** changing when the sensor is lifted from the pot, **Water tank** the same as before, **3 sec** on the `Pump: water for` card turning the pump on (hose into the tank), the OLED showing the readings, and the status LED back to blinking once per second. **Temperature** keeps rising? The DHT22 is too close to the ESP32 or the MB102 ([🚨](#-troubleshooting) *The DHT22 temperature is too high inside the box*; a group that misbehaves: *A loose terminal, a cold solder joint, or swapped wires*).

**You pass this ⭐ step** when all three groups pass their tests, and every signal wire goes into the terminal labeled with the same GPIO as the Node 1 table.

#### 12.5 Small circuits on a mini self-adhesive breadboard (10 minutes)

Check the small circuits that moved along, one by one (the values come from `PIN-MAP.md`):

| Circuit | Pin | What's in it | What often goes wrong |
| :-- | :-- | :-- | :-- |
| HC-SR04 ECHO divider | D35 | 4.7 kΩ + 10 kΩ (5 V → ±3.4 V) | ECHO straight to the pin: 5 V into the ESP32 |
| LDR divider | VP | 10 kΩ to 3.3 V, the LDR to GND, a 100 nF capacitor to GND | its top end on the 5 V rail |
| Pump MOSFET | D25 | 220 Ω in series + 10 kΩ to GND, a 1N4007 diode across the pump | the G-D-S legs swapped; the diode's silver ring must be on the 5 V side |
| RS-485 RO divider | RX2 | 4.7 kΩ + 10 kΩ (5 V → ±3.4 V) | RO straight to the pin |
| Status LED, buzzer | D2, D27 | 220 Ω in series | the LED's short leg not to GND |

The pump stays powered by the MB102's 5 V rail through its MOSFET, not from the ESP32's pins, with a shared GND. Press the mini breadboard firmly onto a clean bottom; no component legs may touch each other. These are still friction contacts: if the readings ever look odd, check here first.

<details>
<summary><b>The soldering path (optional, +60 minutes)</b></summary>

Only the small circuits of the table are soldered; the MB102 stays on the mini breadboard. Safety first (the reasons are in Concept 11): the perfboard out of the box and without power; **safety glasses**, also when you cut off leftover legs; **a window open**, and don't breathe the flux fumes; ±325–375 °C (lower it if there's a lot of smoke), the iron always back in its stand, and never touch its tip or metal shaft; leaded solder is toxic (wash your hands afterwards, don't eat at the soldering table), while lead-free solder needs a higher temperature.

First draw your perfboard layout on squared paper (one square = one hole), then do one circuit first. Component legs go in from the top; on the bottom side, touch the iron's tip to the leg and its copper pad at the same time, then touch the solder to the joint, not to the iron's tip, until the solder flows around both. Connect the points with bent component legs or solid wire, without solder bridging two pads. Test in continuity mode: points that must be connected **beep**, neighboring pads stay **silent**. Only then the next circuit.

![Photo of a perfboard (Practice 12.5, the soldering path) from Wikimedia Commons, not the author's board and not a Node 1 circuit. A brown rectangular board full of holes, photographed at an angle on a sheet with a schematic drawing. Its whole surface is covered with small evenly spaced holes; each component leg goes through one hole and is soldered on the underside, which is not visible. A small circuit sits on the board: a blue push switch with a white button on the left, several small striped resistors, one small black chip in the middle, and two potentiometers with black knobs with a yellow line and one clear LED on the right. Four wires (yellow, red, dark blue, orange) leave under the left edge. Near them, pieces of purple wire are threaded through the holes to form two crosses and a short line. The components only fill the top and middle; the bottom and the left end are still empty.](assets/photo-perfboard.jpg)

*Photo: Retired electrician, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Revox_B215_-_bias_adjustment_add-on.jpg), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.en). The circuit isn't Node 1, just an example of what a perfboard looks like.*

A good joint is shiny and shaped like a small mountain wrapping around the leg and its pad. A cold joint can still be shiny; its sign is a dark ring-shaped gap at the base of the leg. Heat it again until the solder melts into the leg.

![Two close-up photos of solder joints (Practice 12.5, the soldering path) from Wikimedia Commons, side by side with a white gap; not the author's soldering. Left, with a green check mark: three joints on the underside of a factory-made green circuit board, a good shape. Each joint is shiny like metal, a small mountain that covers its round copper pad to the edge, with the component leg sticking out at the top: the solder flowed neatly onto the leg and the pad. Right, with a red cross: one cold joint, its leg did not get hot enough while soldering. The solder covers the pad and is still shiny, but a dark ring-shaped gap shows around the base of the leg: the solder did not join the leg. A joint like this can connect and disconnect when the board shakes or warms up.](assets/photo-solder-joints.jpg)

*Left: a good joint (MJN123, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Solderedjoint.jpg), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/deed.en)). Right: a cold joint (Coronium, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cold_solder_joint2.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en)). Cropped and placed side by side; markers by the author. This combined picture is licensed CC BY-SA 3.0.*

Illustrated reading: SparkFun's guide [*How to Solder: Through-Hole Soldering*](https://learn.sparkfun.com/tutorials/how-to-solder-through-hole-soldering/all). Your board always needs **BOOT** held down when uploading by cable (hold BOOT as soon as `Connecting…` appears, release it when `Writing at …` starts running)? The permanent cure is a 10 µF electrolytic capacitor soldered to the DevKit's EN pin (+ leg) and GND (− leg) ([🔬 Module 2](../../phase-0-foundations/module-02-electricity-and-first-upload/README.md#-technical-deep-dive-optional), the fold *What esptool does…*). Mount the perfboard next to the mini breadboard; its soldered side must not touch any wire or metal. Then repeat the tests of 12.4.

</details>

#### 12.6 ⭐ The Module 9 power supply in the box: two labeled wires and a shared GND (10 minutes)

The arrangement of [Module 9 ➕ A](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md#a-node-1-permanently-on-an-adapter-then-the-24-hour-test) goes into the box as it is, and the ESP32 cable goes back to the charger, not the laptop:

1. The **ESP32** cable (a 5 V phone charger, at least 1 A, to the DevKit's USB) and the **MB102** cable (a 5 V 2 A adapter for the loads) come in through the power hole. The charger and adapter heads stay in the wall socket **outside** the box.
2. The **ESP32** and **MB102** labels of Module 9 are updated on both ends of each cable.
3. The expansion board's DC jack and regulator **aren't used**, and the MB102's 5 V rail never goes to the `VIN` or `3V3` terminal (golden rule number 4).
4. A cable too short? Move the box closer to the socket: a longer, thinner USB cable is one of the causes of `BROWNOUT` ([🚨](#-troubleshooting) *`BROWNOUT` after Node 1 moves into the box*).

No 220 V, no exceptions: no AC-DC module, mains cable, or socket inside the box, and the relays are only for this project's 5 V loads.

**You pass this ⭐ step** when both power cables are labeled on both ends, the charger and adapter heads are outside the box, the expansion board's DC jack is empty, and the expansion board's GND is connected to the MB102's GND.

#### 12.7 ⭐ The multimeter before power goes in: polarity and short circuits (5 minutes)

Both power cables unplugged, every group fitted. Turn the multimeter to continuity mode (the **•)))** symbol; without a beep mode, use **Ω 200**: a number close to 0 means connected), then check:

| Probe on | and on | Must be |
| :-- | :-- | :-- |
| the 5 V rail, the 3.3 V rail | the GND rail | **silent** (a short beep, then silent: a capacitor charging) |
| the 5 V rail | the `3V3` and `VIN` terminals | **silent** |
| a GND terminal | the MB102's GND rail and the GND of the 3.3 V rail | **beep**: shared GND |
| the 5 V rail | the `VCC` or red wire of the relay, servo, PIR, HC-SR04, pump, MAX485 | **beep**: correct polarity |
| the 3.3 V rail | the `VCC` of the DHT22, the soil sensor, the OLED, the top end of the LDR divider | **beep** |

A steady beep in the first two rows means a short circuit or a wire on the wrong rail: don't power it on; find the wire or leg that bridges them.

**You pass this ⭐ step** when all five rows match the **Must be** column.

#### 12.8 ⭐ A gentle pull test and strain relief (3 minutes)

Gently pull every wire in the screw terminals and on the mini breadboard, one by one: a good wire doesn't move. One that moves or comes out: strip it again and tighten it again; a stranded end that frays is replaced by solid wire or gets a ferrule. Then fit **strain relief**: tie every wire that goes in or out of the box with a cable tie right on the inside of its hole, tight enough that the tie can't slip out through the hole. Pull the wire from outside: the terminal inside doesn't move.

![Photo of screw terminals and ferrules (Practice 12.8) from Wikimedia Commons, not the author's parts, on a white background. Top left: a row of white screw terminals, the lamp-wire connector kind, bigger than the terminals on an expansion board; each wire hole has a clamping screw above it. Two loose terminals on the left show the metal clamping plate inside the hole. A light brown wire enters one terminal from the front, and from behind a dark brown wire with a gray ferrule on its end. Right: a green-yellow stranded wire whose end is already covered by a ferrule, a metal sleeve with a gray plastic collar, crimped so the copper strands can not splay. Bottom: a green-yellow wire with one solid copper core, simply stripped without a ferrule. The wire colors follow house wiring, but our project box only holds 5 V wires, no 220 V.](assets/photo-screw-terminal-ferrule.jpg)

*Photo: Simon A. Eugster, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Screw_terminal_with_crimped_wire.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.en). The terminals in the photo are the lamp-wire connector kind; the wires have house-wiring colors, while your box only holds 5 V wires.*

**You pass this ⭐ step** when every wire passes the gentle pull test, and every wire going in or out of the box is held by a tie on the inside of its hole.

#### 12.9 ⭐ K1 a–d: labels, the box lid, then Node 1 `Online` again (5 minutes)

Stick a label on the box lid, for example (the values are yours):

```text
Node 1 · <name on the Fleet screen> · device_id <device_id> · firmware 1.7.1, installed <date>
5 V power only: ESP32 cable = 5 V charger min. 1 A to the board's USB; MB102 cable = 5 V 2 A adapter
Red wire 5 V, orange 3.3 V, black GND · hold D13 at power-up = Wi-Fi portal · portal password <portal-password>
```

Copy the `device_id` and the version from Node 1's card; the portal password is the `PORTAL_PASSWORD` of [5.2](#52--a-password-protected-portal-portal_password-in-keysh-3-minutes) (its risk is in Concept 11). The home Wi-Fi password, the device key, and claim codes never go on the label. Photograph the inside of the box from above for your study notes, fit the lid without pinching any wire, then power it on: the ESP32 cable first, then the MB102.

What you see: Node 1's card is `Online` again, Telegram reports `✅ <device_id> back online (offline <n> min)`, and after a page reload **Restarted because** is filled in again, according to the code `POWERON` (power just came on; the author hasn't seen the board).

**You pass this ⭐ step** (proof **K1 a–d**; its photo in 13.1) when the full label is on, the lid is fitted, Node 1 runs only on the Module 9 charger and adapter outside the box, and Node 1's card is `Online` with **Restarted because** filled in.

> ⬆️ **Done with Practice 12?** Let Node 1 run for 24 hours in the box, then do [Practice 13](#practice-13--24-hours-in-the-box-and-the-after-photo-10-minutes-plus-24-hours-of-waiting-needs-a-board). While you wait, do [➕ A](#a-match-your-project-the-root-edge-scripts-backend-150-frontend-140-and-firmware) to [➕ E](#e--merge-featurefleet-into-main-through-the-pull-request-fleet-ota-rollback-claim-codes-and-the-enclosure).

### Practice 13 — 24 hours in the box and the "after" photo (10 minutes, plus 24 hours of waiting; needs a board)

> 🖥️ **Tools used:** a **phone** or camera (13.1); **Chrome**, the **Fleet** screen as the admin (13.2, 13.3). Concepts used: 9, 11.
>
> ⭐ **Required for the paths with a Kit** — steps 13.1 and 13.2: the "after" photo from the same angle and distance as the "before" photo, and Node 1 running 24 hours in the box without `BROWNOUT`, `PANIC`, or `WDT` (proof **K1 e**).

> [!NOTE]
> **Not run by the author.** This 24-hour test is yours; the card text below = text from the code of the dashboard.

#### 13.1 ⭐ The "after" photo from the same angle and distance (3 minutes)

Photograph the box from above at the angle and distance you wrote down in [🔁 Step 5](#step-5--a-before-photo-of-node-1-from-above), then put it next to the "before" photo in your study notes ([➕ F](#f-save-your-study-notes-the-proof-from-o0-to-p1-the-beforeafter-photos-and-your-boards-numbers)). Crop the photo to the box only and cover the portal password on the label; a photo that shows the inside of your home doesn't go into Git.

**You pass this ⭐ step** when two photos from the same angle sit side by side in your study notes, with no readable portal password.

#### 13.2 ⭐ K1 e: 24 hours on without `BROWNOUT`, `PANIC`, or `WDT` (5 minutes)

Let Node 1 work for 24 hours from 12.9: don't update it and don't unplug its cables. Afterwards, reload the **Fleet** screen (the card's health isn't live). Node 1's card must show **Uptime** `1 d …` (`1 d 0 h` = just past 24 hours) and **Restarted because** something other than `BROWNOUT`, `PANIC`, or `WDT`, with the sentence `Health from the last vitals, …` at a recent time (the interval is still 60 seconds since 11.1). The author hasn't run the 24 hours in a box: your result (**Uptime** and `reset_reason`) is its first; write it down in ➕ F.

Syllabus v1.0.30 adds this 24-hour test to the box requirement (**K1 e**): a weak power supply often only shows after hours. The promise of [🔬 Module 5](../../phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#-technical-deep-dive-optional) that a silent brownout would get caught is now proven from afar by the card of [Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason), like the Module 9 24-hour test. Failed? `BROWNOUT` = the power supply: the power cables, the adapter, the shared GND ([🚨](#-troubleshooting) *`BROWNOUT` after Node 1 moves into the box*); **Uptime** below 24 hours with `POWERON` = the power went out for a moment or a cable got knocked; `PANIC` or `WDT` = the firmware (Concept 9); `SW` = it was updated or restarted. Fix the cause, then repeat the 24 hours.

**You pass this ⭐ step** (proof **K1 e**) when after 24 hours Node 1's card shows **Uptime** of at least `1 d 0 h` and **Restarted because** isn't `BROWNOUT`, `PANIC`, or `WDT`.

#### 13.3 The `vitals` interval back to 300 seconds (optional, 2 minutes)

The 60-second interval is only for this test. Repeat [11.1](#111--a-60-second-vitals-interval-through-more-settings-5-minutes) with `300`: Node 1's card then says `vitals sent every 300 seconds (set by the admin)` (text from the code).

> ⬆️ **Done with Practice 13?** Continue to [➕ F](#f-save-your-study-notes-the-proof-from-o0-to-p1-the-beforeafter-photos-and-your-boards-numbers): your study notes with the before–after photos. The [🧩 Challenges](#-independent-challenges) can be done afterwards, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title closest to your problem (Compose and the VPS: [🚨 Module 27](../module-27-deploy-internet-tls-pwa/README.md#-troubleshooting); broker accounts and the ACL: [🚨 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-troubleshooting)). First glance at `docker compose logs <service>` on the machine with the problem (the gateway: the `edge` folder on the Pi), **Update history** on the **Fleet** screen, or the board's Serial Monitor. Server texts are quoted from the author's lab (devices = the simulator; a simulated VPS, internet, and CA); board texts = text from the code, not yet recorded by the author on a board. Asking on a forum or an AI? Paste only the log, without `.env`, keys, claim codes, or `.bin` files.

<details>
<summary><b>Old instructions → what's right for our versions (Arduino-ESP32 3.3.12, WiFiManager 2.0.17, Mosquitto 2.1.2 <i>dynamic security</i>)</b></summary>

| Old instruction | What's right for our versions | Why |
| :--- | :--- | :--- |
| `ESPhttpUpdate`, `ESP8266httpUpdate` | `HTTPUpdate`: `httpUpdate.update(client, url, version)` | it's the ESP8266's |
| `Update.h` without a fingerprint | `httpUpdate.setSHA256sum(…)` | new in 3.3.12 (Concept 6) |
| `setInsecure()` | `useBuiltinCACertBundle()` | the server's ID card isn't checked |
| the official example `httpUpdateSecure.ino` | the built-in list of roots | its intermediate certificate Let's Encrypt Authority X3 expired on 17 Mar 2021 |
| "enable rollback in menuconfig" | already on; `extern "C" bool verifyRollbackLater()` is enough | Concept 4 |
| `esp_ota_get_app_description()` | `esp_app_get_description()`; our version is `FIRMWARE_VERSION` | outdated; not the sketch's version |
| `ESP.getEfuseMac()` | `esp_read_mac(…, ESP_MAC_WIFI_STA)` | its bytes come out reversed when printed as a number |
| WiFiManager 0.x | 2.0.17 + `WiFiManagerParameter` | old API |
| (Async)ElegantOTA | pulled from the home server | pushed, not pulled (Quick Win) |
| the Default 4MB scheme | Minimal SPIFFS + DIO | a 1,310,720-byte shelf is too small |
| WiFiProv `NETWORK_PROV_SECURITY_0` | explicit security (🔬) | no security |
| Arduino-ESP32 4.0.0-RC1 | 3.3.12 | a pre-release, not tested |
| every account into dynamic security | service accounts in the password file, device accounts in dynamic security | Concept 8 |

</details>

**Server, Compose, and the broker**

<details>
<summary><b><code>MOSQUITTO_DYNSEC_PASSWORD</code> empty (<code>config</code> stops) or shorter than 12 characters</b></summary>

The plugin password line is missing or empty: `… is missing a value: fill in MOSQUITTO_DYNSEC_PASSWORD in .env (random, at least 12 characters)` (the gateway: `… in edge/.env …`). Make a random password with the 2.3 command, a different one for the center and the gateway. Shorter than 12 characters gets past `config`, but the broker writes `Error: Not generating dynsec config, MOSQUITTO_DYNSEC_PASSWORD must be at least 12 characters.` (the author's code lab, an empty password) and the account book isn't made. Fix it, then `docker compose up -d --force-recreate mosquitto` until the log writes `Using admin password from MOSQUITTO_DYNSEC_PASSWORD environment variable`.

</details>

<details>
<summary><b>The old backend refuses firmware 1.7.0's <code>vitals</code>: <code>Unrecognized keys</code></b></summary>

The author's lab, backend 1.4.0 with a simulated Node 1 1.7.0: `WARN: REJECTED msh/<device_id>/vitals: content: Unrecognized keys: "reset_reason", "fw"`. The server always goes first: backend 1.5.0 + migration 011 (Practice 2), then firmware 1.7.0; the IMAGE column of `docker compose ps backend` must say `…:1.5.0`. Can't do that yet? Put Node 1 back on 1.6.0 by cable. The contract checker of 5.5 stops with `Connection to broker … lost: …`? Fill in `CHECKER_USERNAME` in `tools/.env`.

</details>

<details>
<summary><b><code>SERVER_URL not set in .env</code>: the Update button can't be used</b></summary>

The card says `SERVER_URL in the server's .env isn't set: …` (text from the code). The author's lab: Bruno `update Node 1` is answered `503 {"message":"SERVER_URL not set in .env: the devices don't know where to download firmware from"}`, the backend log `over-the-air firmware updates OFF: SERVER_URL not set`. Fill it in from your place's column (2.3), then `docker compose up -d backend` until `firmware download address for devices: …` shows up. The wrong form (a `/` at the end, `http://` to an internet name)? The backend refuses to start; the reason is in `docker compose logs migrate backend`.

</details>

<details>
<summary><b>Registering or claiming a device answered with <code>503</code>: the gateway isn't up, the bridge isn't connected, or the <code>backend</code> ACL is missing lines</b></summary>

The author's lab, after ±6 seconds (two attempts): `not saved in the database yet (the database or gateway broker pi1 has a problem: gateway broker pi1 didn't answer setDefaultACLAccess within 3 seconds). …`. The database doesn't change, and the claim code isn't used up. Check in order:

1. The gateway log holds `Plugin dynamic-security loaded.` (3.1); before Practice 3 is done, this `503` is expected.
2. The two remap lines are in `edge/bridge/center.conf`, the name `pi1` is the same in `AUTO_BROKER_ACCOUNTS` and in the `pi-bridge` ACL, and the bridge is connected.
3. The `backend` block of the central `acl-broker` holds the four control-topic lines (2.3), and the broker was restarted afterwards. The author's lab, without those four: the same `503`, and a silent broker log.

Without a Pi (the sentence names `central broker`): the central plugin (2.4) and item 3. Then repeat the step.

</details>

<details>
<summary><b><code>503</code> <code>not saved in the database yet</code>, although the broker has already changed</b></summary>

The sentence goes on: `… A command that already reached the broker may still be carried out as soon as its connection is back: repeat this step in a moment so the database and the broker match again`. A stalled bridge holds the account command, then the gateway carries it out as soon as it's connected. The author's lab, **Deactivate** while the home internet was unplugged: `503` after 6.1 seconds, then the gateway still ran `deleteClient`, while the database still said `online`. The cure: repeat the same step once the gateway can be reached (lab: `200` with `"broker_account": "none"`, 11.4).

</details>

<details>
<summary><b>A new gateway stops with <code>Unable to open pwfile</code></b></summary>

The author's code lab, a gateway's first start: `password-file: Error: Unable to open pwfile "/mosquitto/data/broker-passwd".`. A new gateway (a new Pi, or the cupboard `smarthome-gateway_broker-data` lost) still needs the password file for the service accounts. On the Pi, folder `edge`, make the first account (the password is typed twice), then the other service accounts as in Module 27:

```text
docker compose run --rm --no-deps -u mosquitto mosquitto mosquitto_passwd -c /mosquitto/data/broker-passwd monitor
```

The device accounts are restored from the 3.5 backup (the recipe is in the script's header).

</details>

<details>
<summary><b>A deactivated device still gets in, or an old Module 21 key comes back to life</b></summary>

Its old line is still in the broker's password file. While its dynamic security account exists, the old key is refused; as soon as **Deactivate** deletes that account, the broker uses the old line again. The author's lab, a simulated device with a Module 21 account: the **Deactivate** answer holds `… until then the broker still accepts the device`, and the device was `online` again with its old key; after `mosquitto_passwd -D` and `restart`: `not authorised`. Do 3.4 steps 3–4 for every old account, at the gateway and at the center.

</details>

<details>
<summary><b>The free path: <code>This door is only for devices …</code> at the Pi's IP, or <code>WEB_INNER_PORT</code> empty</b></summary>

`http://192.168.1.37` in a browser is answered `This door is only for devices (firmware downloads and claims). …` (`404`, the author's lab): **right**. The wrong case is the opposite: `docker compose ps web` on the Pi says `192.168.1.37:80->80/tcp`, not `->8081/tcp`, and the Pi's IP opens the dashboard. That's an empty `WEB_INNER_PORT`: door 80 trusts an `X-Forwarded-For` that anyone on the home Wi-Fi can write, so the claim rate limit can be dodged (the author's code lab: 12 attempts without a `429`). Write `WEB_INNER_PORT=8081` in the Pi's `.env`, then `docker compose up -d web`.

</details>

<details>
<summary><b>Firmware files gone from the <code>firmware-data</code> cupboard</b></summary>

The cupboard is gone (`docker compose down -v`, a new central machine), but the releases are still in the database. The history says `failed` `… (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)`, and the backend log (the author's lab):

```text
ERROR: firmware node1 1.7.1 is in the database, but its file is gone from the firmware-data cupboard: upload the same file again
```

Upload the **same** `.bin` file and version again (`200`, restored), or copy it from the 3.5 backup, then `docker compose exec -u root backend chown -R node:node /app/firmware-data`. The original file is gone too? A new export gives another fingerprint (`409`): withdraw the release, then upload a new version.

</details>

**Uploading firmware**

<details>
<summary><b><code>409</code> <code>a version can't be overwritten</code>, or version <code>1.07.1</code> refused</b></summary>

The author's lab: `node1 1.7.1 already exists: a version can't be overwritten. …`. One version number is for one content only, also after its release is withdrawn (Concept 5): raise `FIRMWARE_VERSION` (6.1), export again, and upload. The form refuses a wrong shape (text from the code): `Version must look like x.y.z, for example 1.7.1 (the same as FIRMWARE_VERSION).` and `Version without leading zeros: 1.7.1, not 1.07.1.`; through Bruno or `curl`, the server answers `400` `FST_ERR_VALIDATION`.

</details>

<details>
<summary><b>Upload refused: the first byte isn't <code>0xE9</code>, or the file is bigger than a shelf</b></summary>

The form's texts are in the 6.4 table. Through Bruno or `curl` (the author's lab): `400 {"message":"not an ESP32 app image: the first byte must be 0xE9. Upload <sketch>.ino.bin from the build folder, not .merged.bin or .bootloader.bin"}`, `400 {"message":"too big: 1966081 bytes, one program shelf is only 1966080 bytes"}`, and a 4 MB `.merged.bin` `413` `FST_ERR_CTP_BODY_TOO_LARGE`. Choose `node-1-home.ino.bin` in `build/esp32.esp32.esp32/` (6.3).

</details>

<details>
<summary><b>A <code>.bootloader.bin</code> gets past the server through Bruno or <code>curl</code>, but fails on the board</b></summary>

The **Fleet** form refuses it by its file name; the server only checks the first byte and the size. `.bootloader.bin` starts with `0xE9` too, so through the API it's accepted (the author's lab: `201`, 23,488 bytes). It isn't an application program; what it does on a board hasn't been tested by the author (rollback will probably save it). Upload only through the form. Did it anyway? Don't send it: withdraw the release, then upload `node-1-home.ino.bin` with a new version.

</details>

<details>
<summary><b>Upload answered with <code>403</code> (a <i>viewer</i> account) or <code>401</code> (session expired)</b></summary>

The author's lab through the API: `403 {"message":"viewer accounts can only look; commands and changes are admin-only"}` and `401 {"message":"not logged in or session expired: log in with POST /auth/login"}`. A viewer account has no upload form anyway (4.4): log in as the admin (Bruno: **`login admin`** first). Session expired: log in again, then repeat.

</details>

**The `update` command and the device's answer**

<details>
<summary><b><code>409</code> when pressing Update: <i>canary</i>, a test release, <code>offline-mode</code>, or a deactivated device</b></summary>

The reason is in the red box (texts from the author's lab and the code):

- `no canary device yet: tick Canary on a device card on the Fleet screen first` (7.2), or `no canary device has run 1.7.1 successfully yet: update the canary first`.
- `1.7.2 TEST release: only through Update per device, …`: that's how it's meant to be.
- `device is offline-mode: update commands are only sent to online devices (not queued)`: wait for `Online`.
- `device already deactivated (its key revoked)`: claim it again (11.5).
- `downgrade (… to …): send with force if it's on purpose`: tick **Allow downgrade (if the target version is older)**.
- `<n> canary device(s) failed or rolled back on <version>: check first, don't spread it`: that version is locked for good, and the card stays `needs update` until the release is **withdrawn**. There's no button: in Bruno, clone `withdraw test release`, change the version in its URL, send it, then upload the fix with a new version.

</details>

<details>
<summary><b><code>422 device refused: action update not supported yet (Module 28)</code> or <code>server address not set</code></b></summary>

The board answers an `ack` with `ok:false`, and the server passes it on as `422`. `action update not supported yet (Module 28)` = the board is still on 1.6.0, which can't be updated from the server: install 1.7.0 by cable (Practice 5). `server address not set (Serial: server <address>)` = type `server <address>` in the Serial Monitor (5.4), exactly the same as `SERVER_URL`; a board from a claim gets it from the portal.

</details>

<details>
<summary><b>The device answers <code>ok:false</code>: <code>url is not this home's server</code>, <code>http only for the home network</code>, and other reasons</b></summary>

It shows as `422 device refused: <reason>` and the history `rejected`; the device key isn't sent (text from the code):

| Reason | Meaning → cure |
| :-- | :-- |
| `url is not this home's server` | `SERVER_URL` differs from the address stored on the board, even by one character (`http` versus `https`, a name versus an IP) → make them the same (Serial `server <address>`, or `.env`) |
| `http only for the home network` | `http://` to an internet name → `https://iot.yourname.my.id` |
| `versions below 1.7.0 have no rollback: install by cable` | going down to 1.6.0 only by cable |
| `still in the 60-second trial period` | wait for `succeeded` |
| `another update is running`, `Node 1 is stopping on purpose: send it again once it is online` | wait for `Online` |
| `already running 1.7.1` | already installed |

</details>

<details>
<summary><b>The update <code>didn't answer within 5 seconds</code></b></summary>

The status `no-ack`: the command was sent, but the `ack` didn't arrive within 5 seconds; its toast (text from the code) is `<name>: command sent, but the device didn't answer within 5 seconds. The result follows when the device reports.` Usually the bridge or the Wi-Fi stalled; the board may still carry it out. Don't send it again: wait for the result on the card, or `expired` after 10 minutes. Not yet recorded by the author.

</details>

**Download `failed`**

<details>
<summary><b>History <code>failed</code> with codes <code>-100</code> to <code>-106</code> or <code>304</code>: code, cause, and cure</b></summary>

The full sentences are in [Concept 3](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period). The old firmware keeps running in all these rows.

| Code | Most likely cause | Cure |
| :-- | :-- | :-- |
| `-100` | the file doesn't fit on the other shelf | `node-1-home.ino.bin` (6.3) |
| `-101` | the answer was compressed or chunked: not from the Caddyfile of 2.3 (the author's lab) | `SERVER_URL` straight to your Caddy |
| `-102` | the release was withdrawn, or the file is gone from the cupboard | the fold *Firmware files gone …* |
| `-103` | the board's key differs from the server's, or the device is deactivated | rotate the key (3.4) or claim again |
| `-104` | `429`: more than 120 downloads per minute from one IP, or `503`: a database problem | a big fleet: in stages; the backend log |
| `-106` | `/fw` answered with the dashboard page (the author's lab, web 1.3.0: `<!doctype html>`), or the first byte arrived late over `http://` | `up -d --build web` (4.1); repeat |
| `304` | the version in the command = the running version | the second safeguard; nothing to do |

</details>

<details>
<summary><b>The download stops: <code>-11</code>, <code>Update 6 UPDATE_ERROR_STREAM</code>, or <code>restarted while downloading (WDT)</code></b></summary>

A problem on the road between the board and the server, not with the file. `-11`: the server was silent for 8 seconds **before** answering (a busy central machine). `Update 6`: over `https://`, the data stopped in the **middle** of the file for 30 seconds; the board doesn't restart. `restarted while downloading (WDT)`: over `http://`, the 60-second watchdog restarted the board, which starts again from the old shelf. Check the **Wi-Fi signal** on the card, the router, and the server, then **Update** again. `power lost while downloading` = the power was cut (9.4). Text from the code; not measured by the author on a board.

</details>

<details>
<summary><b><code>SHA-256 doesn't match the command (Update 15 UPDATE_ERROR_SHA256)</code></b></summary>

The file that arrived differs from the fingerprint in the command, even by one byte: the file in the cupboard changed after the upload, or it was damaged on the way. The board throws it away before the shelf note changes: the old firmware keeps running without a restart (from the code; the author's lab: the simulator, 8.5). Don't touch the contents of the `firmware-data` cupboard: withdraw that release and upload a new version.

</details>

<details>
<summary><b><code>can't connect to server (-1)</code>: the server address or the certificate</b></summary>

The board doesn't reach the server: a typo in the stored address (Serial `server`), the server is down, the laptop's firewall closes port 80 (without a Pi), the Pi's `WEB_ADDRESS` is still `127.0.0.1` (the free path), or the HTTPS certificate is refused; the details come after the colon (text from the code). The main path uses the name, not the VPS's IP: the certificate is only for `iot.yourname.my.id`. Test from the laptop on the same Wi-Fi with `curl --http1.0 -sI` as in 7.6: even without a key it must be answered `403`, not a connection error.

</details>

**The trial period and rollback**

<details>
<summary><b><i>Rollback</i> never happens: the broken firmware stays in use</b></summary>

The test release 1.7.2 got installed, Node 1 isn't `Online` again, and its history says `expired` after 10 minutes. Most likely the line `extern "C" bool verifyRollbackLater()` in `trial-period.cpp` is missing or changed: without `extern "C"`, the compile still succeeds without a warning, but our function doesn't get into the firmware, and the default `false` is used (the author's compile; how to check it is in 🔬 *Name mangling …*). That board now needs the cable: put the line back (5.1), **Upload** 1.7.1 as in 5.3 (stuck at `Connecting…`? Hold **BOOT** as soon as that text appears, and release it when `Writing at …` starts running), then repeat Practice 8 with a new test version, not 1.7.2. The test release `succeeded` instead? `TEST_WRONG_KEY` was still `0` at the export of 8.1.

</details>

<details>
<summary><b>Good firmware also goes back to the old version: the router, the Pi, or the power goes out in the first 60 seconds</b></summary>

There's only one proof of validity: within 60 seconds the broker accepts the key, then `online` and the `cmd` subscription are sent. Even correct firmware is cancelled if the router or the Pi is off during that time, if Node 1 loses power or restarts (the report `power lost during the trial period` or `restarted during the trial period (…)`, text from the code), or if `setup()` hangs for more than 75 seconds. It's safe: Node 1 goes back to the previous version. Repeat **Update** when the network and the power are stable; a canary that has ever done a `rollback` locks **Update all** for that version (the `409` fold).

</details>

<details>
<summary><b>After an Upload by cable, the board goes back to shelf <code>app0</code></b></summary>

That's normal: a cable upload rewrites the shelf note to "start `app0`", the state `UNDEFINED`, no trial period (Concept 2). Serial `ota` (text from the code): `ota: running shelf app0 (UNDEFINED, installed by cable); other shelf app1, 1966080 bytes`. The card's version stays right (from `fw`); NVS (the Wi-Fi, the key, the server address) stays as long as **Erase All Flash Before Sketch Upload** is **Disabled**.

</details>

<details>
<summary><b>The <code>succeeded</code> or <code>rollback</code> report doesn't show up, or <code>FIRMWARE_VERSION not raised?</code></b></summary>

The report rides along with at most 3 `vitals`, which can get lost. All lost: the server concludes it from the next `vitals` (`concluded by the server: started with the new version, no report`, or `… without a report (maybe a rollback)`); a board report that arrives later overwrites it. No word at all: `expired` after 10 minutes. `fw 1.7.0, not 1.7.1: FIRMWARE_VERSION not raised?` (text from the code) = release 1.7.1 holds the 1.7.0 program because 6.1 was skipped: withdraw the release, then repeat 6.1–6.4 with a new version.

</details>

**The portal and claim codes**

<details>
<summary><b>A portal without the Claim code field, or the portal doesn't open during the trial period</b></summary>

The **Claim code**, **Server address**, and **Broker address** fields only exist from 1.7.0: the Serial must write `firmware 1.7.0` (10.2). The portal doesn't show up? The board still holds a Wi-Fi: Serial `wifi forget`. The phone is refused by `Node1-Home`: its password is `PORTAL_PASSWORD` (5.2, the box label). Right after an over-the-air update, the portal is postponed on purpose (text from the code): `Trial period of new firmware: the Wi-Fi portal is POSTPONED. Open it after the trial (hold D13, press EN).`

</details>

<details>
<summary><b>Claim refused: <code>403</code>, <code>409</code>, <code>429</code>, or <code>503</code></b></summary>

The Serial writes `Claim REFUSED <code>: <message>` (10.5), then its hint (text from the code): `403` `Wrong code, expired, or already used: ask the admin for a new code (/fleet, Create claim code).`; `409` `This device is still registered and active: deactivate it on /fleet first, then claim again with a new code.`; `429` `Too many attempts: wait 1 minute, then type claim <code> again.`. `503` (the gateway or the database can't be reached): `registration failed for now (database or broker): the code isn't used yet, try again`, then `Claim tried again in 30 seconds.`, at most 3 sends; the code isn't used up (the author's lab, simulator).

</details>

<details>
<summary><b>Serial: <code>Claim FAILED</code>, <code>server address not set</code>, or <code>Server address at most 64 characters</code></b></summary>

Text from the code. `Claim FAILED: server <address> can't be reached (…)` = the causes of the `-1` fold; the free path uses `http://192.168.1.37`, without `:8081`. `server address not set: type claim <code> <server address>, or server <address> first` = a claim over Serial without an address. `Portal: the server address was NOT saved. Server address at most 64 characters` (or `http only for the home network …`) = the wrong shape: no `/` at the end, `http://` only to a home IP, exactly the same as `SERVER_URL`.

</details>

<details>
<summary><b>Claiming a simulated device against the dev-mode backend answered with <code>401</code></b></summary>

A claim comes in through Caddy with the `/api` prefix. The dev-mode backend (`npm run dev`) doesn't have that prefix and answers `401 not logged in…` (the tools README): point the simulator in claim mode at Caddy's address, the same as `SERVER_URL`.

</details>

**Compiling**

<details>
<summary><b>The compile stops: an esp32 package below 3.3.12, <code>multiple definition</code>, or <code>PORTAL_PASSWORD</code> outside 8–63 characters</b></summary>

A package below 3.3.12 doesn't know `setSHA256sum()` and `useBuiltinCACertBundle()` yet: install **3.3.12** in the **Boards Manager**, not 4.0.0-RC1 (5.1). `multiple definition` = a variable in `keys.h` without `const` (5.2). The exact wording of these two wasn't recorded by the author. A 7-character portal password, the author's compile:

```text
…/node-1-home/networking.cpp:36:44: error: static assertion failed: PORTAL_PASSWORD in keys.h must be 8-63 characters (the WPA2 Wi-Fi password rule), or delete the line
Error during build: exit status 1
```

The last line is from `arduino-cli`; Arduino IDE may end differently. Other library versions (for example GFX 1.13.0) haven't been tested by the author.

</details>

<details>
<summary><b>The program is bigger than the shelf: the partition scheme isn't Minimal SPIFFS</b></summary>

The **Default 4MB** scheme only has 1,310,720-byte shelves, smaller than 1.7.0 (about 1.41 million bytes): `Sketch too big` ([🚨 Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#-troubleshooting)). **No OTA** or **Huge APP** compiles without a second shelf: the Serial `ota` writes the other shelf = the running shelf, and an update ends `failed` `Update error: Partition Could Not be Found (Update 10)` (from the code and the package's sources; not run by the author). Choose **Minimal SPIFFS** and **DIO** (5.1), then **Upload** by cable.

</details>

**Messages and screens**

<details>
<summary><b>Telegram writes 📴 <i>offline</i> during an update, or two messages per device during Update all</b></summary>

A good update only reports `🔄 <id> stopped on purpose …`, then `✅ <id> online again after stopping on purpose (<n> seconds)` (the author's lab, mock Telegram). `📴 <id> offline since …` = disconnected without a goodbye: the power or the Wi-Fi went out, the board crashed, or old firmware and an old simulator (1.6.0, the Module 27 simulator). `📴 … hasn't come back after stopping on purpose …` = 3 minutes without `online`: look at its history. **Update all** = two messages per device (lab: 44 for 22 simulated devices); one summary per wave = 🧩 Level 3.

</details>

<details>
<summary><b>Grafana sends <code>✅ … is sending data again.</code> after Deactivate</b></summary>

A deactivated device drops out of the query of the "Silent node" alert, so its 🔴 counts as recovered: it means "no longer watched". The author's lab: that false message came 4 minutes 36 seconds after **Deactivate**; with a silence for its `device_id`, no message for 9 minutes. Set up the silence first (11.2); the rule is deliberately not changed in this module (the `grafana` README).

</details>

<details>
<summary><b>The card still shows the old version, <code>kind not known yet</code>, or version <code>0.1.0</code></b></summary>

- The old version just after `succeeded`: wait for the next `telemetry`, or reload.
- `kind not known yet`: the first `telemetry` hasn't arrived; **Update** too soon is answered `409 … device kind not known yet: wait for its first telemetry` (the author's lab). The health of a card from a claim shows after a reload.
- `0.1.0`: the Module 27 simulator; use the 4.2 simulator.
- `Offline` although data comes in, after the gateway broker was restarted while the internet was down (3.4): it recovers as soon as its status changes again.

</details>

<details>
<summary><b><code>Can't copy automatically at this address</code></b></summary>

The **Copy** button needs `https://` or `localhost`. At `http://<IP>` (without a Pi, phone mode) its toast says `Can't copy automatically at this address: the code is already selected, copy it with Ctrl + C.` (text from the code). Copy it yourself or write it on paper; don't photograph it.

</details>

**Quick Win**

<details>
<summary><b>The network port doesn't show up in Tools → Port</b></summary>

Not tested by the author. Arduino IDE finds the board through mDNS: the laptop and the board on the same Wi-Fi, the laptop's firewall not blocking it, and the Quick Win sketch running (`Ready to receive a program over Wi-Fi at <IP>`); wait a moment, then open the menu again. Still nothing? Quick Win Steps 1, 2, and 5 are enough. The Quick Win sketch's messages: `No other shelf: choose Partition Scheme Minimal SPIFFS.` (a scheme without OTA); `Wi-Fi not connected yet. Check the secrets.h tab.` (a wrong password or a 5 GHz Wi-Fi); a refused password = the password that counts is the one in the sketch **that's running**.

</details>

**The box and the power supply**

<details>
<summary><b><code>BROWNOUT</code> after Node 1 moves into the box</b></summary>

The power supply, not the firmware ([Module 9 Concept 3](../../phase-1-esp32-embedded/module-09-power-and-low-power/README.md#3-brownout-when-the-voltage-dips-for-a-moment)). The golden rule: heavy loads from the MB102, never from the ESP32's pins, with a shared GND. Check: the ESP32's charger at least 1 A with a short USB cable; the relay, the pump, and the servo on the MB102's 5 V rail, not `VIN` or `3V3`; the expansion board's GND connected to the MB102's GND (12.7); the MB102 adapter 5 V 2 A. Don't turn off the brownout detector. Fix it, then repeat the 24 hours (13.2).

</details>

<details>
<summary><b>The DHT22 temperature is too high inside the box</b></summary>

The ESP32 and the MB102 warm up the air in a closed box. Move the DHT22 outside the box or through the wall, away from both, and give the box ventilation at the top and the bottom (12.3). The temperature difference in your box: not measured by the author.

</details>

<details>
<summary><b>A loose terminal, a cold solder joint, or swapped wires</b></summary>

Readings that are `null` or jumping, or a relay that sometimes doesn't obey (the loads still from the MB102, a shared GND)? With both power cables unplugged: tighten the terminals and repeat the pull test (12.8), replace frayed stranded ends with solid wire or give them a ferrule; heat cold joints again (a dark ring-shaped gap at the base of a leg; 12.5); match swapped wires against [`PIN-MAP.md`](code/PIN-MAP.md) and the labels, then test continuity from end to end.

</details>

<details>
<summary><b>A relay or the pump turns on while you move wires, or the expansion board doesn't fit</b></summary>

A relay or the pump moving = power is still coming in: unplug the MB102 cable, then the ESP32 cable (12.2), and only then move wires; a wire that touches a pin while powered can damage the ESP32. The loads still from the MB102, not the ESP32's pins, with a shared GND. The expansion board doesn't fit: the distance between its rows is different, or it's a 38-pin board (19 holes per row; 12.1); don't force it or bend the DevKit's pins.

</details>

**Messages you can ignore**

<details>
<summary><b>Safe to ignore: <code>world readable</code>, library warnings while compiling, <code>npm audit</code> findings, the 500 kB <i>chunk</i> warning, an old <code>online</code> status, and <code>none</code> on Deactivate</b></summary>

- `Warning: File /mosquitto/config/acl-broker has world readable permissions. …`: since Module 26.
- Library warnings while compiling (5.3), `crc16_update` through `rs485.cpp` too; warnings from the `node-1-home` files themselves must not be ignored.
- `npm audit` as of 2 November 2026: the backend `4 moderate severity vulnerabilities` (the chain of the `/docs` page, not called), the dashboard `10 vulnerabilities (2 low, 8 moderate)` (build tools). **Don't** run `npm audit fix --force`.
- `(!) Some chunks are larger than 500 kB after minification.`: since Module 23.
- An old retained `online` status after **Deactivate** (11.4): the backend ignores it.
- `"broker_account": "none"` with the `mosquitto_passwd -D` step for a board from a claim or a repeated **Deactivate**: skip it if there was never a Module 21 account.
- `… already exists` once during `docker compose build` (the author's lab): repeat the command.

</details>

## 🔬 Technical Deep Dive (optional)

You can skip this: four Syllabus options, two traps around OTA, how to check `extern "C"`, and how the author tested. Unless marked "the author's lab", the contents come from the official documentation and source code (read on 30–31 October 2026) and **haven't been run by the author**: just read them.

<details>
<summary><b>OTA for Node 2 through an "update mode": why we don't do it</b></summary>

The promise of [🔬 Module 14](../../phase-2-connectivity/module-14-node-2-esp-now/README.md#-technical-deep-dive-optional) and a Syllabus option: Node 1 tells Node 2 to "enter update mode", Node 2 connects to Wi-Fi for a moment, updates itself, then goes back to ESP-NOW. What both firmwares would need:

1. **A listening window.** Node 2 1.0.0 only sends; it would have to listen for a moment after every send. The packet's layout changes, so `PACKET_VERSION` goes up and both boards are updated together.
2. **The Wi-Fi password**, which Node 2 deliberately doesn't know: sent by Node 1 over encrypted ESP-NOW, or entered through a temporary portal on Node 2.
3. **A download like Node 1's** (`httpUpdate`, the locked route, SHA-256), although that route needs a device key and Node 2 is registered without one, through Node 1 as its link (Module 21).
4. **Valid before sleeping.** The esp32 package 3.3.12 is built with `CONFIG_BOOTLOADER_SKIP_VALIDATE_IN_DEEP_SLEEP=y`: waking from deep sleep skips the check of the shelf note. New firmware that sleeps in the middle of its trial period isn't rolled back: it must be valid, or cancel itself, before its first sleep.
5. **The battery** for Wi-Fi during a download of about 940 thousand bytes (Module 14) and the trial period; losing power halfway is still safe because the old shelf isn't touched.

Too many changes for a board that rarely changes; that's why Node 2 honestly gets no OTA on the main path ([Concept 7](#7-the-fleet-canary-update-all-and-what-honestly-gets-no-ota)). The ESP-IDF component `espressif/esp-now` has OTA over ESP-NOW, but whether it works with Arduino-ESP32 3.3.12 hasn't been proven. The author hasn't programmed or tried this design.

</details>

<details>
<summary><b>Signed firmware: <code>UPDATE_SIGN</code> versus Secure Boot V2</b></summary>

SHA-256 only guarantees that the file is **intact**: whoever holds the dashboard's admin account can still upload any firmware ([Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https)). A signature answers "who made it", the promise of Module 14 and item A08 in [🔬 Module 20](../../phase-3-backend-data/module-20-user-security/README.md#-technical-deep-dive-optional). There are two levels:

- **`UPDATE_SIGN`, the application level** (the 3.3.12 package, no eFuse; the official example `Signed_OTA_Update` in the Update library). A file `build_opt.h` in the sketch folder holds `-DUPDATE_SIGN`; an RSA or ECDSA key pair is made on the laptop with the package's `tools/bin_signing.py` (Python 3 + the `cryptography` package); the public key is compiled in, and every `.bin` is signed with the private key before it's uploaded. The firmware calls `Update.installSignature(…)` before `Update.begin()`; a wrong signature is refused (`UPDATE_ERROR_SIGN`, 14) even if someone else controls the update server. Its limits: the chip isn't locked (a USB cable can still overwrite it); the private key must never go into Git, a server, or an AI; the official example uses `HTTPClient` + `Update`, not `httpUpdate` as Node 1 does, and the combination hasn't been proven.
- **Secure Boot V2**: the shelf opener checks the signature at every start. On the ESP32 it's only for chips of revision v3.0 and up, the shelf opener must be built yourself with ESP-IDF (Arduino's default can't do it), every update must be signed, and the settings are burned into eFuses that can't be undone ([🔬 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-technical-deep-dive-optional), the fold *Secure boot and flash encryption*). One wrong step = a board that can never take another program. **Don't try it on Node 1** (Syllabus §10: the "Professional firmware" branch).

The author hasn't tried either of them.

</details>

<details>
<summary><b>Registration over BLE: NimBLE-Arduino and the <code>NETWORK_PROV_SECURITY_0</code> trap</b></summary>

The other Syllabus option: the phone sends the Wi-Fi details over Bluetooth Low Energy (BLE), without a portal:

- **WiFiProv** (built into the 3.3.12 package, the phone app "ESP BLE Provisioning"). **The trap:** its example's README describes security level 1 with a proof of possession (a proof code), but the example's code ends up at `NETWORK_PROV_SECURITY_0`: **no application security**, so the Wi-Fi password travels without application encryption. If you use it, write `NETWORK_PROV_SECURITY_1` (or `_2`) explicitly. That README also asks for a shelf above 1.4 MB (for example without OTA) because the example takes a lot of room; whether it fits together with Node 1 (71% of a shelf) hasn't been tried.
- **NimBLE-Arduino** 2.5.2 (25 Oct 2026): a BLE library that, according to its maker, saves half the flash and about 100 KB of RAM compared with the built-in BLE; you write the registration protocol yourself.

Wokwi doesn't simulate the ESP32's Bluetooth, so BLE can only be tested with a board and a phone. We use the Module 10 WiFiManager portal: no app, no new library, and now password-protected ([5.2](#52--a-password-protected-portal-portal_password-in-keysh-3-minutes)). Not tried by the author.

</details>

<details>
<summary><b>An ESP32 WROOM module without a DevKit</b></summary>

Your DevKit V1 = an ESP32-WROOM-32 module ([🔬 Module 2](../../phase-0-foundations/module-02-electricity-and-first-upload/README.md#-technical-deep-dive-optional), the fold *Inside the ESP-WROOM-32 module*) plus a 3.3 V regulator, a USB-serial chip, the EN and BOOT buttons, and an auto-reset circuit. The module can be used on its own as long as you provide what the schematic checklist of Espressif's hardware design guidelines asks for:

- a **3.3 V** supply that can deliver **at least 500 mA**;
- **EN** with an RC delay circuit of **10 kΩ + 1 µF**;
- a pull-up resistor on **GPIO0**, a strapping pin: low at power-up means download mode (Module 2, the fold *Strapping pins …*);
- **UART0** (TX0/RX0) to a 3.3 V USB-serial adapter for uploads and the Serial Monitor, plus your own **EN** and **BOOT** buttons.

Without an auto-reset circuit (that page doesn't cover it), every cable upload uses the full method of [🚨 Module 2](../../phase-0-foundations/module-02-electricity-and-first-upload/README.md#-troubleshooting): click **Upload**, and while `Connecting…` runs, hold **BOOT**, press and release **EN** once, then release **BOOT**. Only once: after 1.7.0 is installed, the next updates go over the air. The golden power rules still apply: heavy loads aren't powered from the module's pins, shared GND ([Concept 11](#11-from-breadboard-to-enclosure-screw-terminals-the-module-9-power-supply-and-no-220-v)). Not tried by the author; Node 1 stays a DevKit on an expansion board.

</details>

<details>
<summary><b><code>HttpsOTA</code> and <code>esp_https_ota()</code>: the <code>skip_cert_common_name_check</code> trap</b></summary>

The Update library of the 3.3.12 package has a shortcut: `HttpsOTA`, a wrapper around ESP-IDF's `esp_https_ota()`. Call `HttpsOTA.begin(address, root_certificate)`, the update runs by itself as a task, and its status is read with `HttpsOTA.status()`.

The trap is its third parameter, `skip_cert_common_name_check`, which **defaults to `true`**: the name in the server's certificate isn't compared with the name that was called. The envelope is still sealed, but a valid ID card of another site from the same root is accepted too, while the data contract requires the name to be checked. Node 1 uses `httpUpdate` with `NetworkClientSecure` and the built-in list of roots ([Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https)): the chain and the name are checked, plus the device key, the MAC header, and the SHA-256 from the command (none of which are parameters of `HttpsOTA.begin()`).

Honest about dates: the 3.3.12 package doesn't check a certificate's validity dates (`CONFIG_MBEDTLS_HAVE_TIME_DATE` is off), which is why Node 1 doesn't wait for the internet clock before downloading. That's no reason to use an old certificate, and it hasn't been tested by the author on a board.

</details>

<details>
<summary><b>ESP-IDF 6.2 later: automatic confirmation, not for 3.3.12</b></summary>

According to the ESP-IDF 6.2 migration guide, rollback is on by default in that version, with automatic confirmation as soon as new firmware starts running (`CONFIG_BOOTLOADER_APP_ROLLBACK_CONFIRM_ON_STARTUP`). That's the same as the Arduino core's default that we switch off with `extern "C"` ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c)): new firmware is valid without proving itself to the broker. Our esp32 package 3.3.12 (ESP-IDF v5.5.5) stays as in Concept 4: our trial period decides. Moving the esp32 package to a version based on ESP-IDF 6.x one day? First repeat the compile, `nm` (the next fold), and [Practice 8](#practice-8--deliberately-broken-firmware-goes-back-to-the-old-version-by-itself-25-minutes) on a board.

</details>

<details>
<summary><b><i>Name mangling</i> and <code>extern "C"</code>: checking the symbols with <code>nm</code></b></summary>

C++ may have two functions with the same name and different parameters, so its compiler adds a code for the parameters to the name (name mangling): `bool verifyRollbackLater()` in a `.cpp` file becomes `_Z19verifyRollbackLaterv` (`19` = the length of the name, `v` = no parameters). The Arduino core (the C language) calls the name as it is, `verifyRollbackLater`, which has a weak default ("may be replaced", its body `return false`). `extern "C"` gives our function that C name, so the default is replaced ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c), [5.1](#51--the-esp32-package-3312-the-minimal-spiffs-scheme-and-firmware-170-with-trial-periodcpp-8-minutes)).

Forgetting `extern "C"` causes no error or warning. The checker is `nm`, a tool of the esp32 package that lists the names in the `.elf` file (the complete program with its names). After [6.2](#62--sketch--export-compiled-binary-whats-in-the-build-folder-3-minutes), in the VS Code terminal at the project root (Linux; macOS, not tested: replace `~/.arduino15` with `~/Library/Arduino15`):

```text
~/.arduino15/packages/esp32/tools/esp-x32/2601/bin/xtensa-esp32-elf-nm firmware/node-1-home/build/esp32.esp32.esp32/node-1-home.ino.elf | grep verifyRollbackLater
```

Windows (PowerShell, not tested by the author):

```text
& "$env:LOCALAPPDATA\Arduino15\packages\esp32\tools\esp-x32\2601\bin\xtensa-esp32-elf-nm.exe" firmware\node-1-home\build\esp32.esp32.esp32\node-1-home.ino.elf | Select-String verifyRollbackLater
```

`2601` = the tool's version folder on the author's machine (different? look inside the `esp-x32` folder). Use exactly `xtensa-esp32-elf-nm`, not the `esp32s2`/`esp32s3` variants in that folder.

**Expected output (the author's lab, `arduino-cli` compile; 1.7.1, the same as 1.7.0):**

```text
401affa8 T verifyRollbackLater
```

Exactly one line with the letter **`T`**: our function is in the program's code section and replaces the default, so rollback is on. Then the author compiled a copy of 1.7.0 in a separate folder with one change, `extern "C"` removed:

**Expected output (the author's lab, `arduino-cli` compile; the copy without `extern "C"`):**

```text
401b12f0 W verifyRollbackLater
```

**`W`** = the weak default is used: rollback is off. That compile still succeeds without a new warning, its size is exactly the same as 1.7.0, and `trial-period.cpp.o` does hold `T _Z19verifyRollbackLaterv`, but nothing calls it, so the linker throws it away. 1.6.0 and the Quick Win sketch are `W` too (they have no trial period, as intended). The author's second proof: the literal pool of `initArduino()` in the `.elf` holds the address of our function, `0x401affa8`.

The address in front may differ on your computer; it's the letter that counts. **`T` = right. `W` = don't upload that file:** copy `trial-period.cpp` again from [`code/`](code/firmware/node-1-home/trial-period.cpp), export again, check again. Make it a habit after every export (6.2, 8.1).

</details>

<details>
<summary><b>How the author tested: the simulator, fake <code>.bin</code> files, host tests, and a simulated internet</b></summary>

Every **Expected output** box was made on one Raspberry Pi 5, without an ESP32, a phone, a VPS, or a domain:

1. **The server = real code.** From a copy of the published Module 27 project, the author followed the order of the practices on the `feature/fleet` branch for the main path; on the free path and without a Pi, the claims and the downloads were tested. The internet, the "VPS", the "Pi", and Let's Encrypt were simulated as in [🔬 Module 27](../module-27-deploy-internet-tls-pwa/README.md#-technical-deep-dive-optional) (Pebble, a stand-in DNS, a Docker network). The **Fleet** screen was opened by headless Chrome 156; the Bruno requests were run by a small script from the same `backend/bruno/` files; Telegram = a mock Bot API server.
2. **The devices = the simulator** `tools/device-simulator.js`, imitating the 1.7.0 design, 1 to 23 simulated devices. The 1.7.1 file = real firmware compiled by the author: uploaded, downloaded, and checked for its size, `0xE9`, and SHA-256, never run. The test release 1.7.2 = a fake `--test` file from `tools/make-fake-bin.js`: the simulator recognizes its marker and then fails to get into the broker on purpose. Its time numbers (OTA 5.5 seconds, rollback 70.4–70.5 seconds, claim 274 ms) = the simulator on one machine, not an ESP32 over Wi-Fi.
3. **The firmware logic = host tests:** the firmware files compiled by g++ for an ordinary computer, with mocks of the Arduino core, the shelf note, NVS, HTTPUpdate, and the watchdog (the tools aren't part of `code/`).

**Expected output (the author's lab, host tests, 3 November 2026; cut):**

```text
pure_test: 64 passed, 0 failed
pure_test: 64 passed, 0 failed
cases: 37, same: 34
sim_download_test (http): 22 passed, 0 failed
sim_download_test (https): 22 passed, 0 failed
size_test: 10 passed, 0 failed
ota_machine_test: 127 passed, 0 failed
extern "C" definitions: 1
== DONE: status 0 (0 = all passed)
```

In order: versions and `update` (two C++ standards); the firmware versus the simulator (3 deliberate differences); the simulator's download failure paths; the message sizes; 127 checks in 13 update, trial-period, and rollback scenarios with a mock shelf opener.

4. **The compile** (3 November 2026): `arduino-cli` 1.5.1 (not Arduino IDE), the esp32 package 3.3.12, 10 libraries at exact versions, the FQBN `esp32:esp32:esp32:PartitionScheme=min_spiffs,FlashMode=dio` (the board name + the Module 10 settings) with `--warnings all`: 1.7.0, 1.7.1, 1.7.2-test, the Quick Win, the 🧩 Level 1 key, the variant without `extern "C"`, and 1.6.0 for comparison. The numbers in your Arduino IDE may differ by a few hundred bytes.
5. **The 🧩 keys:** Vitest (Level 2: 5 tests; Level 3: 214 tests) and a wave lab with 21–22 simulated devices.
6. **Not run by the author:** Wokwi (the free one doesn't reach your home server), QEMU, an ESP32 board, the Serial Monitor, the portal on a phone (its illustration comes from WiFiManager 2.0.17's real HTML), the expansion board, the box, soldering, and a real VPS, domain, Let's Encrypt, Cloudflare, and Telegram.

So the firmware is compiled by the author, not yet run on a board (the status box at the start of the module): you're its first tester ([➕ F](#f-save-your-study-notes-the-proof-from-o0-to-p1-the-beforeafter-photos-and-your-boards-numbers)). The machine's details, the lab name substitutions, and the points not proven yet: [📚](#-sources--image-credits).

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** Level 1: **Arduino IDE**, Node 1, the **Fleet** screen. Level 2: **VS Code**, a terminal in the `backend` folder. Level 3: **VS Code**, a terminal on the central machine, **Bruno**, the `tools` simulator, the **Fleet** screen, **Telegram**.

All optional (no ⭐): do them after ➕ E, on a new branch from `main`.

### Level 1 — The program shelf and the trial period on the OLED screen (a small change, 20 minutes)

> [!NOTE]
> Its answer key is compiled by the author, not yet run on a board.

The OLED doesn't show the shelf and the trial period yet (7.4): in `display.cpp`, change the last line of the status page (a long press on D13, Module 8) into the version, the shelf (Concept 2), and the trial-period state. Hints: one line fits 21 characters (the free-memory number may go; it's in Serial `info` and on the **Fleet** screen); the running shelf comes from `esp_ota_get_running_partition()`, its state from `esp_ota_get_state_partition()` (the shelf note the shelf opener reads, not `inTrialPeriod()`); `#include <esp_ota_ops.h>` and the formula for the seconds left (Serial `ota`) are in `trial-period.cpp`.

**Self-test:** change `FIRMWARE_VERSION` to `"1.7.3"` (1.7.2 is taken by the test release; `TEST_WRONG_KEY` stays `0`), then export, upload, and **Update** as in Practices 6–7. **You pass when**, after `succeeded`, the status page shows `v1.7.3 app0 valid` (Node 1 was on `app1` before). `TRIAL <n>s` only shows until the broker accepts the key: long-press right after Node 1 restarts (not measured by the author on a board).

<details>
<summary><b>Level 1 answer key</b></summary>

[`level-1/`](code/challenges/key/level-1/): the whole `display.cpp` or `changes.diff` (+28 −1). The new function `shelfVersionText()` writes `v1.7.0 app0 cable` (by cable), `v1.7.3 app0 TRIAL 47s` (the trial period), or `v1.7.3 app0 valid` (proven already); `%.4s` (at most 4 characters) prevents the `-Wformat-truncation` warning.

**Expected output (the author's lab, `arduino-cli` compile):**

```text
Sketch uses 1411855 bytes (71%) of program storage space. Maximum is 1966080 bytes.
```

`.bin` 1,412,000 bytes; your number may differ (5.3). Warnings from the sketch files: 0; `nm` still shows one `T verifyRollbackLater` (rollback on).

</details>

### Level 2 — `compareVersions()` and the `needs update` badge (fill in the blanks, 20 minutes)

The `needs update` badge shows when `compareVersions(fw, latest) < 0`, and `latest` itself is picked with this function too (Concept 5). Read character by character, `"1.10.0"` loses to `"1.9.0"`. Empty these three lines in `backend/src/services/version.ts`, then fill them in yourself; `x[1]`–`x[3]` = MAJOR, MINOR, PATCH as **text**:

```ts
  for (let i = 1; i <= 3; i++) {
    ____ // (1) the difference of part i, computed as a NUMBER
    ____ // (2) is this part already different? answer -1 or 1 right away
  }
  ____ // (3) all three parts are equal
```

**Self-test** in the `backend` folder:

```text
npm test -- version
```

**Expected output (the author's lab):** a right answer `Tests  5 passed (5)`; an answer that compares text `Tests  3 failed | 2 passed (5)` with `expected -1 to be 1`. Afterwards `git restore src/services/version.ts`.

<details>
<summary><b>Level 2 answer key</b></summary>

```ts
    const diff = Number(x[i]) - Number(y[i]);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
```

`Number()` turns text into a number; the first part that differs decides, and `Math.sign()` tidies it into `-1` or `1`. The explanation: [`level-2/`](code/challenges/key/level-2/).

</details>

### Level 3 — Automatic waves: canary, wait until healthy, then the rest in stages (from scratch, 45 minutes)

**Update all** sends to all at once, with two Telegram messages per device (Practice 9). Build automatic waves in the backend (Concept 7): the canary first, healthy for 10 minutes, then the rest in waves of 2, 4, 8, …; one `rollback`, `failed`, or `expired` = the emergency brake (the rest aren't sent anything); one Telegram summary per stage (the canary, each wave). Hints: new files `services/wave.ts` + `routes/wave.ts` (`POST /fleet/wave` with `version` and `wait_minutes` 1–60, default 10; `GET /fleet/wave`; `POST …/stop`); send through `requestUpdate()`, and pass its results on from `announce()` (both in `ota.ts`); while waiting until healthy, check the canary every 5 seconds (`online`, the new version, no restart); a skipped device isn't a brake; `telegram.ts` silences the 🔄/✅ of wave devices, 📴 stays.

> [!WARNING]
> A wave sends to every active Node 1 that's `online`, your board included, while a fake file must never reach a real board. As long as the board takes part, use real firmware you exported (for example 1.7.3 from Level 1). The emergency brake with a fake file: make a simulated device the only canary (untick **Canary** on your Node 1), and the brake keeps your board from being sent anything.

**Self-test:** `npm test`, commit, push; on the central machine `git fetch`, `git switch <your-branch>`, `docker compose up -d --build backend`. With a few simulated devices (Practice 9; the ones deactivated in 11.3: clone `rotate practice device key`) and one canary, start a wave from Bruno (practice: `"wait_minutes": 1`); for the emergency brake, upload a fake `--test` file with a new version (🔀 Practice 8) **without** ticking the **test** release box. **You pass when** a smooth run = one summary per stage, and the emergency brake = one `🛑` message with no other device sent anything. Withdraw that broken release right away (Bruno `withdraw test release`, change its version): until it's withdrawn, every card says `needs update`, and **Update** on your board's card picks it. Done: deactivate the simulated devices while they're `Online` (11.3), stop the simulator, `git switch main`, and rebuild the backend.

<details>
<summary><b>Level 3 answer key</b></summary>

[`level-3/`](code/challenges/key/level-3/): three new files in `backend/src/` (10 Vitest tests), three Bruno requests, and `changes.diff` (4 files, +43 −2). `npm test`: `Test Files  26 passed (26)`, `Tests  214 passed (214)`.

**Expected output (the author's lab: 22 simulated devices, `wait_minutes` 1, as received by the mock Telegram server; simulator numbers):** a smooth run = 5 messages (the old way 44), the last one:

```text
✅ Wave 1.7.5 FINISHED · wave 4 of 4: 7 succeeded. All stages: 22 succeeded, in 1 min 28 s.
```

The emergency brake at the canary (a fake `--test` file) = one message:

```text
🛑 Wave 1.7.6 STOPPED (emergency brake) · canary: 1 back to the old version (rollback) (f00d00000001: not connected to the broker within 60 seconds). 21 other device(s) NOT sent: check first, then withdraw the release.
```

An earlier lab (21 simulated devices): the brake also worked in wave 2 (4 `expired`) and when the canary restarted while waiting until healthy. **Honest limits:** a wave lives in memory only (a backend restart = it stops); the pause is only after the canary; a device that was skipped isn't sent again; damage that doesn't disconnect a device (for example a sensor reading zero) isn't detected. Not tried by the author: a real ESP32 and the full 10-minute wait until healthy.

</details>

## ➕ Add-on to "Mini Smart Home"

This week Mini Smart Home **can be updated without a cable and is ready to be installed at many locations**. Its code is already committed on `feature/fleet`. A matches it, B–D tidy the documents, E merges into `main`, and F saves your notes (±30 minutes). The Concept 8 picture is now also the picture of Mini Smart Home's state after Module 28:

![Diagram of devices behind the gateway (Concept 8), the main path: device broker accounts are made by the backend on the VPS but live on the Pi gateway broker. Left, the home (a router without port forwarding): Node 1 1.7.0 and the third board (from a claim) to the Pi gateway broker pi1, 192.168.1.37:1883; device accounts made by the backend (dynamic security); service accounts and the old Module 21 ones in password_file; a device only reads its own msh/id/cmd. The home router: OUTGOING connections, no door opened. Middle: the TLS bridge 8883, data up, account commands down. Right, the VPS: the central broker (8883 TLS, takes account commands on msh-gateway/pi1/…), backend 1.5.0 (AUTO_BROKER_ACCOUNTS=gateway:pi1; claim, registration, key rotation, Deactivate = createClient or deleteClient), Caddy HTTPS 443 (/fw/* and /api/provision/claim to the backend; SERVER_URL in .env, the same as typed in the board portal). The arrow router to Caddy: downloads + claims, HTTPS straight to the VPS, not through the bridge. Four steps: 1 the backend publishes setDefaultACLAccess, then createClient at the center, topic msh-gateway/pi1/dynamic-security/v1; 2 the bridge carries it to the gateway as $CONTROL/dynamic-security/v1, the plugin makes the account; 3 the answer …/response goes up to the backend, 201; 4 no answer within 3 seconds: once more, then 503; the database unchanged, a command already sent may still be carried out when the bridge is back. The remap in bridge/center.conf: topic dynamic-security/v1 in 1 $CONTROL/ msh-gateway/pi1/ and the same …/response out 1 line. Simulated lab: register 201 0.15-0.31 s, Deactivate 0.18 s. The .env table SERVER_URL and AUTO_BROKER_ACCOUNTS: laptop without a Pi http://192.168.1.10, center; laptop + Pi the same, gateway:pi1; VPS https://iot.yourname.my.id, gateway:pi1; the free-path Pi http://192.168.1.37, gateway:pi1; WEB_INNER_PORT empty (= 80), the Pi 8081 inside the container; in the portal Server address = SERVER_URL exactly, without :8081; Broker address = the gateway or laptop IP. The free path: the center on the Pi too (1884); the board calls http://192.168.1.37, the Pi port 80 goes to the device door 8081: only /fw/* and claims, no dashboard, no trust in X-Forwarded-For; the dashboard through the Cloudflare tunnel, downloads not. Bottom, moving the Module 21 accounts: rotate the key with Bruno (POST /devices/id/key, no dashboard button), key value on Serial at once, mosquitto_passwd -D, restart the gateway, not HUP; without step 3 the old key comes back to life.](assets/devices-behind-the-gateway.png)

> 🖥️ **Tools used:** **VS Code**, a terminal at the laptop's **project root** (F: the `learn-iot` folder); **Chrome** (logged in to GitHub); in E also an **SSH terminal** to the VPS and the Pi. A–E can be done during the 24-hour test of Practice 13.
>
> ⭐ **Required** — step E: the pull request into `main`.

### A. Match your project: the root, `edge/`, `scripts/`, `backend/` 1.5.0, `frontend/` 1.4.0, and `firmware/`

In the terminal at the laptop's project root:

```text
git diff --stat main
```

The list must match the table **Files that change this week** in [🧰](#-what-you-need), except the documents of B–D. No `firmware/node-2-garden/` (Node 2 stays 1.0.0), migrations `001`–`010`, `.env`, `.bin`, or `build/` may be in it. The contents equal the files of the same name in [`code/`](code/), except your own (`LABEL` in the `Dockerfile`, the `device_id`s in `edge/acl-broker`, `IMAGE_REGISTRY`, the **My devices** table, `config.h` 1.7.1 from 6.5 with your numbers from 5.1, the 12.1 note in `PIN-MAP.md`). PIN-MAP 7 keeps the promise "doesn't change until Module 28": the pins stay, only their connections move into the box. The Syllabus project tree (§9) v1.0.30 records what's new: `firmware/README.md`, `scripts/backup-broker-accounts.sh`, the `firmware-data` cupboard, and dynamic security in `edge/`.

> 🔀 **Without a Kit:** firmware 1.7.0 and PIN-MAP 7 aren't on your branch yet (Practice 5 waits for the board); do them later on a new branch from `main`.

### B. Update the project README, then the READMEs of `backend/`, `frontend/`, `edge/`, `tools/`, `grafana/`, and `firmware/`

**The root README.** Open the [reference README](code/README.md), click **Raw**, copy the part from `## OTA & fleet (Module 28)` up to just before `## Coming later`, then paste it at the end of the root `README.md` of your repository and replace the path `[Module 28](…)` inside it with this page's address. Its content: what's new, the install order center → gateway → firmware, and **Keeping `.bin` files safe** (they may hold the ESP-NOW key and the portal password). In your README, step 2 of the Module 26 part: replace "its five secrets" with "its six secrets (since Module 28 including `MOSQUITTO_DYNSEC_PASSWORD`)". The "Current contents" table of the reference README now says Node 1 1.7.0, PIN-MAP 7, contract 1.6, backend 1.5.0, and dashboard 1.4.0; the promise "many devices at once" (the "Coming later" part) is kept as well: the canary first, then **Update all**.

**The folder READMEs.** `backend/`, `frontend/`, `edge/`, `tools/`, and `firmware/` (new) already came along in 2.2, 4.1, 3.1, 4.2, and 5.1 with their Module 28 parts (`edge/`: fill in its top table again); the backend's Limits of v1.5 say `npm audit` `4 moderate severity vulnerabilities` (as of 2 November 2026), and the firmware README has the status "compiled, NOT yet run on a real board". Only `grafana/README.md` is left: replace its contents with [its reference](code/grafana/README.md) (**Copy raw file**); its new Limits item: the false `✅ <name> is sending data again.` after **Deactivate**.

### C. Complete the root and `edge/` `.env.example`: the plugin password and the Fleet block without your real secrets

Both were copied in 2.3 and 3.1. Match them against [the root reference](code/.env.example) and [the `edge/` reference](code/edge/.env.example):

```text
MOSQUITTO_DYNSEC_PASSWORD=
# …
SERVER_URL=
# …
WEB_INNER_PORT=
# …
AUTO_BROKER_ACCOUNTS=off
```

The first line is in both, empty; the other three are in the root's "Fleet" block. Your values (two plugin passwords, your server address) only go in `.env`, with `chmod 600`, outside Git.

### D. Add the Module 28 items to the pull request template

Replace the contents of `.github/pull_request_template.md` with [the reference template](code/.github/pull_request_template.md) (**Copy raw file**): four **(Module 28)** items in **Checklist before merging** and eight in **Security checklist**, for example:

```markdown
- [ ] **(Module 28)** `TEST_WRONG_KEY` is `0` in the committed code; the rollback test release is uploaded with the **test** mark (`?test=true`) and is never sent to all devices
```

Two **(Module 21)** items changed their wording (dynamic security accounts without a restart; `devices` rows made automatically only through a claim code), and so did the image tag item (`1.5.0`, `1.4.0`); the two `npm audit` items are now dated: compare them with 2.2 and 4.1.

### E. ⭐ Merge `feature/fleet` into `main` through the pull request "Fleet: OTA, rollback, claim codes, and the enclosure"

In the terminal at the laptop's project root, `git status` only names the files of B–D (`.env`, `backup/`, `build/`, `*.bin`, `edge/bridge/center.conf` are ignored by Git). Then one at a time (plus the fixes of A and C, if any):

```text
git add README.md edge/README.md grafana/README.md .github/pull_request_template.md
git commit -m "Module 28 docs: project README, Grafana note, and PR template"
git push
```

1. On GitHub: **Compare & pull request** (base `main`), the title `Fleet: OTA, rollback, claim codes, and the enclosure`; write the changes and the proof from O0 to P1 as honestly as your notes (for example `O1: simulated, without a Kit`), copy the **(Module 28)** items of the D template (`main` still has the old template), then **Create pull request**.
2. **Review:** **Files changed** (the author's lab, `git diff`: 129 files) without `*.bin`, `build/`, `.env`, claim codes, plugin passwords, `dynamic-security.json`, `broker-passwd`, or the contents of `backup/broker-accounts-…`, and `config.h` says `TEST_WRONG_KEY = 0` (8.2); then **Review changes** → **Comment** → **Submit review**. Something forbidden in it? Don't merge: `git rm -r --cached` + its file name (a secret: change its value too), commit, and push again.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. The laptop: `git switch main`, `git pull`, `git branch -d feature/fleet`. The VPS and the Pi: `git switch main`, `git pull`, without `docker compose up -d` (the Pi refuses because of `edge/acl-broker`? `git stash` first, `git stash pop` afterwards).

The author tested these commits and pushes on a local git repository, not GitHub.

**You pass this ⭐ step** when that pull request was reviewed with the **(Module 28)** items and merged, and `main` on every machine of yours holds backend `1.5.0`, frontend `1.4.0`, and migration `011`. Tick ➕ E in [✅](#-module-28-completion-checklist).

### F. Save your study notes: the proof from O0 to P1, the before–after photos, and your board's numbers

The Module 28 firmware is compiled by the author, not yet run on a board, so your numbers are its first board test: write them down as they are, failures included. In `learn-iot/module-28/` add `notes.md`, without passwords, keys, claim codes, or `.env` contents:

```markdown
# Module 28 notes — Updated without a cable, ready to install in many places

| Item | Mine |
| :--- | :--- |
| Path | … |
| O0 (5.4), O1 (7.5), O2 (8.3): date WIB / simulated / not yet | … |
| P1 (10.4): seconds since Save | … |
| K1 a–d (12.9); K1 e (13.2): `reset_reason` after 24 hours | … |
| Seconds from Yes, update until succeeded / until rollback | … / … |
| Not tested by me yet | … |
```

Below it, the "before" and "after" photos side by side, without the inside of your home or a readable portal password (without a Kit: the box plan), then commit and push. The OWASP IoT table of Module 21 now shifts:

| No. | Module 21 | After Module 28 |
| :--- | :--- | :--- |
| I4 secure updates | ⏳ | 🟡 a locked download, SHA-256, and rollback; not signed yet (🔬; A08 of Module 20) |
| I8 device management | ✅ | ✅ the **Fleet** screen, claim codes, **Deactivate** |
| I10 physical hardening | ⏳ | 🟡 Node 1 in a box; the key in NVS can still be read if the board is taken apart |

That's "ready to be installed at many locations": a new board registers itself, everything is updated from one screen without a visit, a lost one is cut off from afar, and Node 1 works in its box.

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **The stored server address** | Exactly the same in `SERVER_URL`, the portal, and NVS. Node 1 only downloads from there; `http://` only to a home IP. |
| **ArduinoOTA** (pushed from the IDE) | Arduino IDE sends a program over Wi-Fi with one password (Quick Win); a bad program is still valid. |
| **The fleet** | All your devices; its screen is **Fleet** (`/fleet`). |
| **Stopped on purpose** (`offline-mode`) | Node 1 says goodbye, then disconnects cleanly before a download or a `restart`. Not **disconnected** (`offline`, the will) or **offline mode** (Module 19). |
| **The firmware file** and **the merged file** | `node-1-home.ino.bin` (first byte `0xE9`) is uploaded to the server; `.merged.bin` (the whole flash) is refused. |
| **Canary** | The test device that gets updates first, like a miner's canary. |
| **The shelf note** (`otadata`) | A slip of paper: which shelf to start, and whether it's still in its trial period. |
| **Dynamic security** | A broker account book the backend writes without a restart: device accounts here, service accounts in the password file; its master key is `MOSQUITTO_DYNSEC_PASSWORD`. |
| **`extern "C"`** | Without it, our `verifyRollbackLater()` doesn't replace the default `false`: rollback is off without a warning. |
| **Ferrule** | A metal sleeve on the end of a stranded wire (optional). |
| **HTTPUpdate** | The esp32 package's library that downloads firmware to the other shelf; it replaces `ESPhttpUpdate` (ESP8266). |
| **IP65** (IP code) | 6 = dust-tight, 5 = protected against water jets; that tight also traps humid air, which isn't Node 1's goal. |
| **The `vitals` interval** | How often the health report comes: 60–3600 seconds (default 300), set from afar; `telemetry` stays at 10 seconds. |
| **Claim code** | A ticket code `XXXX-XXXX` from the admin: single-use, 5–60 minutes, shown once; the board exchanges it for a device key. |
| **The project box** and **a box plan** | A ventilated plastic box without 220 V; its plan (layout, shopping, sizes) = the path without a Kit. |
| **The trial period** (`PENDING_VERIFY`) | The first 60 seconds of new firmware: the broker accepts its key, then `online` and the `cmd` subscription. Failed: rollback. |
| **Deactivate** | The key revoked, the broker account deleted, disconnected at once; revoking a key (Module 21) is only the second layer. |
| **OTA** (over-the-air update) | Our way is **pulled from the server**: `update` over MQTT, then Node 1 downloads by itself from its home server. |
| **Screw-terminal expansion board** | Where the 30-pin DevKit V1 plugs in, every pin to one screw terminal; measure the distance between its two rows of pins first. |
| **The shelf opener** (bootloader) | The first program to run: it reads the shelf note, then runs the shelf it points to. |
| **Strain relief** | A cable tie at the box's hole: a pull is held by the tie, not by the screw. |
| **Device registration** (provisioning) | Getting a new board ready so the server knows it (by hand before, now with a claim code); not the Grafana provisioning of Module 26. |
| **Perfboard** | A board with holes for soldered circuits. |
| **The device door** (`:8081`) | The Caddy door of the free-path Pi: only firmware downloads and claims. |
| **Password-protected portal** | The Wi-Fi `Node1-Home` with `PORTAL_PASSWORD` (8–63 characters): `192.168.4.1/update` only for whoever holds the password. |
| **Program shelf** (`app0`, `app1`) | Two partitions of 1,966,080 bytes; a cable always goes to `app0`, OTA writes the other shelf. |
| **The bridge's remap** | Two lines of `edge/bridge/center.conf` that hand account commands to the bridge to deliver to gateway `pi1` and bring the answers back. |
| **`reset_reason`** | The reason for the last start, seven values; `BROWNOUT` (brownout) = the power supply, `PANIC`/`WDT` = the firmware. |
| **Release** and **the release list** (manifest) | One version on the server, never overwritten; the server builds its list from the database (`GET /firmware`). |
| **Test release** and **withdrawn release** | Test: only **Update** on one device. Withdrawn (Bruno `withdraw test release`): not sent, its download `404`. |
| **Firmware rollback** | Going back by itself to the old shelf, to the version before that update; not the optimistic button "rollback" of Module 24. |
| **Cold joint** | A solder joint with a gap at the base of the leg that may connect on and off; a good one is shiny, shaped like a small mountain. |
| **SemVer** | `MAJOR.MINOR.PATCH`, compared as numbers part by part (1.10.0 > 1.9.0); its source is `FIRMWARE_VERSION`. |
| **The file's fingerprint** (SHA-256) | One byte different, another fingerprint (`Update 15`): it guarantees the file is intact, not who made it. |
| **Simulator** and **simulated device** | The `tools/` simulator imitates 1.7.0 without flashing anything; the output of `make-fake-bin.js` isn't firmware: never to a board. |
| **A locked download** | `/fw/node-1/<version>.bin` only with `device_id:key` and the `x-ESP32-STA-MAC` of an active device. |

## 📝 5-Question Quiz

[The Phase 5 completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase) ask for at least 4 correct answers in each quiz of Modules 26–30.

1. Node 1 is updated from 1.7.1 to 1.7.3. (a) Why must it prove itself within 60 seconds, although its SHA-256 matches? (b) 1.7.3 connects to the broker, but its temperature is always 0. Does Node 1 go back to 1.7.1 by itself?
2. An `update` to 1.7.3 is sent with the retained flag, and 1.7.3 fails its trial period. (a) What happens after the rollback? (b) Why may `config` be retained, then?
3. Your friend puts `node-1-home.ino.bin` in a web folder that anyone can download from. (a) What leaks, and which guard is missing compared with the `/fw` route? (b) What does the `sha256` in the `update` command guarantee, and what doesn't it?
4. Your friend installs 1.7.0 by cable before Practice 2. (a) What happens at backend 1.4.0? (b) Why is the opposite order safe for Node 1 1.6.0?
5. A day after Practice 12, Node 1's card says **Restarted because** `BROWNOUT` and **Uptime** `3 h 12 min`. (a) What does it mean, and why couldn't it be seen from afar before? (b) What do you check, and what about K1 e?

<details>
<summary><b>Answer key</b></summary>

1. (a) SHA-256 only proves that the file is intact, not that the program works on your board. A wrong broker key makes Node 1 unreachable: a device on the roof would need a visit. So within 60 seconds its key must be accepted by the broker, then `online` and the `cmd` subscription sent; if not, the board goes back to the old shelf. (b) No: what's guarded is only "can still connect and publish". Node 1 stays reachable, so fix it with 1.7.4 over the air ([Concept 4](#4-rollback-that-really-works-a-60-second-trial-period-and-extern-c)).
2. (a) The broker hands it over again every time Node 1 subscribes to `cmd`; the memory of `id`s is lost at a restart (rule 8) and the version differs, so download, failure, and rollback repeat without end, with the pump off every time. (b) `config` is a state, and the result is the same however often it's applied; `update` is a one-time action that ends with a restart ([Concept 3](#3-http-ota-step-by-step-from-the-update-command-to-the-trial-period)).
3. (a) The ESP-NOW key and the portal password (if used), plus the folder paths of their computer, can be read with `strings`. The `/fw` route only serves registered, active devices (`device_id:key` and `x-ESP32-STA-MAC`; deactivated: `403`). (b) Intact: one different byte is refused (`Update 15`) before the shelf note changes. Not a signature: it doesn't prove who made it ([Concept 6](#6-who-may-hand-out-firmware-keys-fingerprints-and-https)).
4. (a) All its `vitals` are refused (the author's lab, simulator: `Unrecognized keys: "reset_reason", "fw"`): the health and the update reports are lost; the `/fw` route and the **Fleet** screen don't exist yet either. (b) Backend 1.5.0 is backward compatible: 1.6.0's `vitals` are still accepted, and migration 011 only adds things ([Practice 2](#practice-2--contract-16-backend-150-migration-011-and-the-central-broker-with-dynamic-security-30-minutes)).
5. (a) The ESP32's voltage dipped so far that the chip restarted; without `reset_reason` in `vitals`, that event only showed in the Serial Monitor. Yellow = the power supply, not the firmware ([Concept 9](#9-remote-configuration-and-device-health-the-vitals-interval-and-reset_reason)). (b) The golden rule: the relay, the pump, and the servo from the MB102, never from the ESP32's pins, with a shared GND; a charger of ≥ 1 A with a short cable; loose terminals. K1 e isn't passed yet: fix it, then repeat the 24 hours ([13.2](#132--k1-e-24-hours-on-without-brownout-panic-or-wdt-5-minutes)).

</details>

---

## ✅ Module 28 Completion Checklist

The pass requirement from the [Syllabus](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure): "Node 1 is updated to a new version without a cable and its version shows up on `/fleet`, deliberately broken firmware automatically falls back to the old version, and Node 1 is neatly installed in an enclosure with its own power supply." Its parts are **O0** (a prerequisite), **O1**, **O2**, **K1**, and the required practice **P1**. Firmware downloads: the main path HTTPS from the VPS, the free path `http://192.168.1.37`, without a Pi `http://192.168.1.10` (the laptop mustn't sleep). Without a Kit and Wokwi: not a full pass yet until the board arrives.

> [!NOTE]
> **Firmware 1.7.0 is compiled by the author, not yet run on a board**, and the author hasn't held a box or a soldering iron; the devices in the Expected output boxes = the simulator ([📚](#-sources--image-credits)). Tick only what happened for you; the paths without a Kit and Wokwi write "simulated" or "not yet" (➕ F, the pull request).

- [ ] **O0** Node 1 1.7.0 by cable once; `ota` writes `app0 (UNDEFINED, installed by cable)`; the card `1.7.0` with **Restarted because** filled in ([5.4](#54--o0-serial-ota-and-server-then-node-1s-card-at-version-170-with-reset_reason-5-minutes)). Without a Kit: simulated (4.2).
- [ ] **O1** The USB cable not on the laptop; canary → **Update** → `stopped on purpose` → `Online` `1.7.1`, `SW`, the history `1.7.0 → 1.7.1 succeeded` ([7.5](#75--o1-version-171-reset_reason-sw-and-the-history-succeeded-without-a-cable-5-minutes)). Without a Kit: simulated.
- [ ] **O2** The test release 1.7.2 refused by the broker; without being touched, the card `Online` again with `1.7.1` and `back to the old version (rollback)` ([8.3](#83--o2-node-1-goes-back-to-171-by-itself-after-the-60-second-trial-period-10-minutes)). Without a Kit: simulated.
- [ ] **K1** (a) before–after photos from the same angle (13.1); (b) the gentle pull test; (c) labels: `device_id`, name, the power wires, the portal password; (d) the Module 9 power supply, the loads from the MB102, a shared GND, no laptop and no 220 V in the box ([12.9](#129--k1-ad-labels-the-box-lid-then-node-1-online-again-5-minutes)); (e) **Uptime** at least `1 d 0 h` without `BROWNOUT`, `PANIC`, or `WDT` ([13.2](#132--k1-e-24-hours-on-without-brownout-panic-or-wdt-5-minutes)). Without a Kit and Wokwi: a box plan, not yet.
- [ ] **P1** An empty third board → the portal → `Online` on the **Fleet** screen within 60 seconds of **Save** ([10.4](#104--p1-a-new-card-online-on-the-fleet-screen-within-60-seconds-of-save-6-minutes)). Without a third board: the simulator (simulated). Wokwi: `claim` over the Serial Monitor, not `Online` on the **Fleet** screen.
- [ ] The warm-up and the Quick Win: the "before" photo; `app0` → `app1` → `app0`.
- [ ] ⭐ The `feature/fleet` branch, the fingerprint, a backup in `backup/`, notes on the devices and the old accounts (Practice 1).
- [ ] ⭐ `203 passed (203)`, `config --quiet` without output, migration 011 and `Plugin dynamic-security loaded.`, `"ota_ready": true`, 1.6.0's `vitals` still accepted (Practice 2).
- [ ] ⭐ The gateway loads the plugin (the paths with a Pi); the practice device `201` and `createClient`; a device account only reads its own `cmd`; the old accounts moved; an account backup (Practice 3).
- [ ] ⭐ `PWA v2.0.0`, two `SAME`, web `1.4.0`; simulated devices `online (firmware 1.7.0)`; a card for every device on the **Fleet** screen (Practice 4).
- [ ] ⭐ (needs a board) esp32 3.3.12 and the Module 10 settings, `extern "C"` intact, `PORTAL_PASSWORD` not in Git, `Sketch uses` about 71%, O0 (Practice 5).
- [ ] ⭐ `config.h` 1.7.1; the SHA-256 of `node-1-home.ino.bin` the same as in the green box; 1.7.1 `latest` (Practice 6; without a Kit: a fake file).
- [ ] ⭐ Node 1 only on its charger, the badge `canary`, O1 (Practice 7).
- [ ] ⭐ 1.7.2 with the badge `test`; `TEST_WRONG_KEY = 0` again (`git diff --stat` empty); O2; the `rollback` report passes the checker (Practice 8).
- [ ] **Update all** after the canary succeeded; a disconnected device skipped (Practice 9, optional).
- [ ] ⭐ The claim code shown once (`valid` → `used`); the third board on 1.7.0; the password-protected portal, the server address = `SERVER_URL`; P1 (Practice 10).
- [ ] ⭐ `vitals sent every 60 seconds (set by the admin)`; a silence first; `deactivated` and `deleteClient`; the old status and `503` understood (Practice 11).
- [ ] ⭐ (needs a board) the expansion board fits, the power unplugged, a layout plan, moved group by group, two labeled power cables with a shared GND, the multimeter, the pull test, the labels: K1 a–d (Practice 12).
- [ ] ⭐ (needs a board) the "after" photo and K1 e (Practice 13).
- [ ] Security: no `*.bin`, `build/`, claim codes, plugin passwords, or broker cupboard contents in Git; `TEST_WRONG_KEY = 0` in every commit; a password-protected portal; the old Module 21 accounts removed with `-D`; the free path: the device door 8081; a broker account backup kept.
- [ ] Project matches `code/`; README, `.env.example`, and the pull request template updated; notes in `learn-iot/module-28/` (➕ A–D, F).
- [ ] ⭐ The pull request "Fleet: OTA, rollback, claim codes, and the enclosure" merged into `main` without secrets in **Files changed**; every machine has done `git pull` ([➕ E](#e--merge-featurefleet-into-main-through-the-pull-request-fleet-ota-rollback-claim-codes-and-the-enclosure)).

**Mini Smart Home can now be updated without a cable, registers new devices by itself, and is ready to be installed at many locations.** Its limits: Node 2 still goes by cable, the server images are still installed over SSH without automatic tests, and service monitoring and automatic backups come in Module 30.

> ➡️ **Next module:** [Module 29 — Testing & CI/CD: Every Change Tested and Deployed Automatically](../module-29-testing-cicd/README.md). Every code change is tested automatically, packed into an image, and installed on the VPS and the Pi without you using SSH; the Pi updates its images by itself.

## 📚 Sources & Image Credits

**Official sources** (read 30 October–3 November 2026):

- **Arduino-ESP32 3.3.12** (ESP-IDF v5.5.5 underneath): [release notes](https://github.com/espressif/arduino-esp32/releases/tag/3.3.12) (`setSHA256sum()`, `useBuiltinCACertBundle()`), [`HTTPUpdate.cpp`](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/HTTPUpdate/src/HTTPUpdate.cpp) (error codes), [the `Update` library](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/Update/README.md), [`esp32-hal-misc.c`](https://github.com/espressif/arduino-esp32/blob/3.3.12/cores/esp32/esp32-hal-misc.c) (`verifyRollbackLater()` defaults to `false`), [`min_spiffs.csv`](https://github.com/espressif/arduino-esp32/blob/3.3.12/tools/partitions/min_spiffs.csv), [NetworkClientSecure](https://github.com/espressif/arduino-esp32/blob/master/libraries/NetworkClientSecure/README.md), the official example [`httpUpdateSecure.ino`](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/HTTPUpdate/examples/httpUpdateSecure/httpUpdateSecure.ino) (its intermediate certificate expired in 2021), [the library builder's settings](https://github.com/espressif/esp32-arduino-lib-builder/blob/master/configs/defconfig.common) (rollback in the shelf opener).
- **ESP-IDF**: [OTA and app rollback v5.5](https://docs.espressif.com/projects/esp-idf/en/release-v5.5/esp32/api-reference/system/ota.html) (`esp_ota_ops`), [Secure Boot V2](https://docs.espressif.com/projects/esp-idf/en/release-v5.5/esp32/security/secure-boot-v2.html) and [the 6.2 migration](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/migration-guides/release-6.x/6.2/system.html) (both 🔬).
- **Node 1's libraries**: [WiFiManager](https://github.com/tzapu/WiFiManager/releases) 2.0.17 (MIT; the material of the portal illustration), [PubSubClient3 3.3.2](https://github.com/hmueller01/pubsubclient3/tree/v3.3.2), [ArduinoJson 7](https://arduinojson.org/v7/) (7.4.3).
- **Server and protocols**: Mosquitto 2.1.2 [dynamic security](https://mosquitto.org/documentation/dynamic-security/) and [`mosquitto.conf(5)`](https://mosquitto.org/man/mosquitto-conf-5.html); Caddy 2.11.7 [`handle`](https://caddyserver.com/docs/caddyfile/directives/handle) and [`encode`](https://caddyserver.com/docs/caddyfile/directives/encode); [SemVer 2.0.0](https://semver.org/); [MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) (DISCONNECT without the will, retained); AWS IoT [provisioning by claim](https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html) (the claim code's counterpart).
- **Hardware and safety**: Espressif's [ESP32 hardware design guidelines](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/schematic-checklist.html) (🔬 WROOM); SparkFun [*How to Solder: Through-Hole Soldering*](https://learn.sparkfun.com/tutorials/how-to-solder-through-hole-soldering/all) (CC BY-SA 4.0; it replaces the Syllabus's "video", and its video is on that page); HSE [INDG249](https://www.hse.gov.uk/pubns/indg249.pdf) (flux fumes); Bosch Sensortec [BST-BME280-HS006](https://www.bosch-sensortec.com/media/boschsensortec/downloads/handling_soldering_mounting_instructions/bst-bme280-hs006.pdf) (heat near a sensor); Wikipedia [IP code](https://en.wikipedia.org/wiki/IP_code) and [*Screw terminal*](https://en.wikipedia.org/wiki/Screw_terminal) (secondary). The pass requirement and its amendment: [Syllabus §7, Module 28](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure) (v1.0.30).

**Images.** Details per file: [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| 8 diagrams (`two-shelves-otadata` … `box-layout`) | Original diagrams from `code/`, the sources above, the author's compile, and the simulated lab; `box-layout` = a **reconstruction** from `PIN-MAP.md` version 7 and Modules 5–9 (the box, the expansion board, and the wires weren't photographed or measured). | CC BY 4.0 (`.svg` in `assets/`) |
| 5 composites (`fleet-on-a-phone` … `deactivate-device`) | Real screenshots of headless Chrome 156, 3 Nov 2026, from a simulated "VPS" and CA (1280 px; 375 px = Chrome's device mode, **not a phone**). Devices = the simulator; the 1.7.1 file = real firmware that was only checked, the test release 1.7.2 = a fake file; the claim code masked before the shot. | React, Tailwind CSS, Socket.IO (MIT) and Caddy (Apache-2.0) shown as they are for educational purposes; titles, numbers, captions CC BY 4.0 |
| `claim-code-portal` | An **illustration**, not a phone or ESP32 screenshot: WiFiManager 2.0.17's real HTML, CSS, and texts with the 1.7.0 firmware settings, rendered by Chrome (Noto Sans in place of Verdana). | the page content MIT (© tzapu); the layout CC BY 4.0 |
| 3 photos (`photo-perfboard`, `photo-solder-joints`, `photo-screw-terminal-ferrule`) | Wikimedia Commons: Retired electrician; MJN123 and Coronium (two crops side by side, marks by the author); Simon A. Eugster. Only cropped, resized, and stripped of metadata; not made with AI. | their original licenses: CC0 1.0; CC BY 3.0 + CC BY-SA 3.0 (combined CC BY-SA 3.0); CC BY-SA 3.0 |

No freely licensed photo of a screw-terminal expansion board was found (searched 2 November 2026). The author doesn't have the parts: a photo of your box (without the `device_id`, the portal password, or the inside of your home) and your board's numbers are welcome as an issue ([Contributing](../../README.md#contributing)).

**About the Expected output boxes.** "The author's lab" here is mostly the English lab of 3 November 2026 (±19:50–20:20 WIB, plus a supplementary lab ±22:15–22:50 WIB), on the English `code/` exactly, on a **Raspberry Pi 5 16 GB with Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3 and Compose 2.40.3 (the Ubuntu packages), Node.js 24.21.0, and headless Chrome 156. Story numbers (times, durations, IDs, counts) keep the values of the Indonesian edition's final lab on the same machine (2 November 2026, ±14:55–17:20 WIB) in the English lab's wording. Other labels: **host tests** (g++ 15.2.0, a mock shelf opener), **the compile** (3 November; `arduino-cli` 1.5.1, not Arduino IDE; the esp32 package 3.3.12, 10 exact library versions, the Module 10 settings with Flash Mode DIO; in your Arduino IDE the numbers may differ by a few hundred bytes), and **text from the code** (sentences of the source code, not a board recording). A few sentences come from the code lab of 31 October (the code before it was frozen), for example the fake `update` command in the name of `nodered` and the old Module 21 accounts after **Deactivate**.

That machine played the laptop, the Pi, the VPS, the phone, the internet, and every device ([🔬](#-technical-deep-dive-optional)): a Docker network = the internet, Pebble 2.10.1 = Let's Encrypt, pebble-challtestsrv = the DNS, `docker network disconnect` = the home internet unplugged. Devices = the `tools/` simulator (in Practice 9: 22 simulated devices updated at once; Pebble's root in place of the ESP32's list of roots). The 1.7.1 file = real firmware compiled by the author that was only uploaded, downloaded, and checked; the test release 1.7.2 and the practice releases after it = fake files from `tools/make-fake-bin.js`.

| Lab recording | Written in the text |
| :--- | :--- |
| `iot.example.test`, `mqtt.example.test` | `iot.yourname.my.id`, `mqtt.yourname.my.id` |
| the "VPS" IP `10.28.40.10`; the home on the "internet" `10.28.40.20` | `203.0.113.10`; `198.51.100.20` (documentation address blocks) |
| lab counters 64xx: the gateway, the backend, the database, Grafana | `192.168.1.37:1883`, `8080`, `5432`, `3000` |
| the lab's project, container, cupboard, and image names | `smarthome…`, `smarthome-gateway…`, `ghcr.io/<account>` |
| machine paths; a local git repository | `/home/you/…`, `/home/house/…`; `https://github.com/<account>/mini-smart-home.git` |
| the simulated device `f00d00000001` "Practice living room" | your Node 1 (your `device_id` differs) |

Replaced only on otherwise identical lines; counter 8080 on the author's machine is used by another program. The free path and without a Pi were tested on the same machine: "the Pi's IP" and "the laptop's IP" = the `docker0` address, not a home Wi-Fi, without Cloudflare Tunnel. Lab only: `OTA_TIMEOUT_MINUTES=3` (default 10), the gateway's `acl-broker` + 3 lines for the mock Garden (no real Node 2) and a `checker` account at the gateway, the Grafana silence through its API, Telegram = a mock Bot API server (a fake token; its message boxes = the texts that mock received), GitHub = a local git repository.

Times are written in WIB: the clock of the author's machine (WITA, WIB + 1 hour) in the terminal is rewritten; the backend log is already WIB (`TZ` in Compose); the Caddy, Grafana, and Pebble logs are UTC (+7 hours); Mosquitto prints seconds. Time numbers = the simulator on one machine, not an ESP32 over Wi-Fi; the real firmware's size and the sensor numbers = **examples**; the simulated devices' signal and RAM = random. Passwords, keys, and claim codes never show (secret scan: 0 places).

**Not** tested: a real ESP32 (the Serial Monitor, the OLED, OTA over Wi-Fi and how long it takes, a real rollback and watchdog, `reset_reason`), Arduino IDE (its menus and the network port), the third board and the portal on a phone, Node 2 (not compiled again), the expansion board, the box, soldering, a multimeter, the power supply in the box for 24 hours, Wokwi, QEMU, a VPS, a router, a domain, Let's Encrypt production, Cloudflare Tunnel, a real Telegram, MQTTX, the Bruno app, a GitHub pull request, Windows, macOS, and PowerShell.

**Not yet proven** at publication: the 60-second watchdog during a real download; the memory and the HTTPS handshake time on an ESP32 together with Wi-Fi and ESP-NOW; the three portal fields on a board and the portal postponed during the trial period; Arduino IDE 2.3.10's network port for the Quick Win; the shelf note in Wokwi; Node 2's ESP-NOW packets arriving while Node 1 downloads; 100 devices (what was measured: 22 simulated ones); 24 hours in the box, including the DHT22's heat; the prices and the fit of the expansion board, the box, and the ferrules; the Quick Win and the 🧩 Level 1 key on a board. Already settled: the 1.7.x size fits one shelf and `extern "C"` replaces the default (the compile), and all three 🧩 keys (compile, tests, lab). When this text was written (November 2026), the firmware was compiled by the author, not yet run on a board.

---

[⬅️ Module 27](../module-27-deploy-internet-tls-pwa/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: [Module 29 — Testing & CI/CD: Every Change Tested and Deployed Automatically](../module-29-testing-cicd/README.md) ➡️**
