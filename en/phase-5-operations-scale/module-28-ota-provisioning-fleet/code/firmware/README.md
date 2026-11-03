# 🔌 Firmware — Mini Smart Home

🌐 **English** · [Bahasa Indonesia](../../../../../fase-5-operasi-skala/modul-28-ota-provisioning-fleet/kode/firmware/README.md)

This folder holds the firmware of both ESP32 boards of the **Mini Smart Home** project:

| Folder | Board | Version | Last changed |
| :--- | :--- | :---: | :--- |
| [`node-1-home/`](node-1-home/) | Node 1 "Home" (ESP32 DevKit V1, powered by a charger) | **1.7.0** | Module 28: over-the-air updates (OTA), automatic rollback, claim codes |
| [`node-2-garden/`](node-2-garden/) | Node 2 "Garden" (ESP32 DevKit V1, battery, ESP-NOW) | 1.0.0 | Module 14 (unchanged in Module 28) |

> [!WARNING]
> **Status 1.7.0: compiled, NOT yet run on a real board.** On 3 November 2026 the author compiled Node 1 1.7.0 and
> both of its practice versions (1.7.1 and 1.7.2-test) with `arduino-cli` 1.5.1, the esp32 package 3.3.12, and the libraries in the list below
> (exact versions), for the **ESP32 Dev Module** board with **Minimal SPIFFS** and **Flash Mode DIO** (the Module 10 settings): no errors, and
> not a single warning from the `node-1-home` files (the warnings that do show come from the WiFiManager, ESP32Servo, and ModbusMaster libraries,
> the same as with 1.6.0). The result: `Sketch uses 1411683 bytes (71%)`, `Global variables use 58404 bytes (17%)`, and the file `node-1-home.ino.bin`
> is 1,411,824 bytes (71.8% of a program shelf, 554,256 left). The list of functions in the compiled file (`nm`) confirms that the line
> `extern "C" bool verifyRollbackLater()` in `trial-period.cpp` really replaces the default function of the Arduino core (symbol `T`, not `W`),
> so rollback is on. The update, trial period, and rollback logic was also tested on a computer with fakes. **Not yet** done: running this firmware
> on a real ESP32 board (uploading by cable, the 1.7.1 update over the air, the 1.7.2-test rollback, a claim code), because the author has no
> board on the desk. This note will be updated after the board test.

## What Node 1 1.7.0 needs

- **Arduino IDE 2.3.10** with the board package **esp32 version 3.3.12** (not 3.3.11 or older: `setSHA256sum()` and `useBuiltinCACertBundle()`
  are new in 3.3.12; not 4.0.0-RC1, which is still a pre-release).
- The **ESP32 Dev Module** board, **Tools → Partition Scheme → Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, and
  **Tools → Flash Mode → DIO** (the same as Module 10): two program shelves of 1,966,080 bytes each. A scheme without OTA (**No OTA**,
  **Huge APP**) has only one shelf: an update command is still accepted (`ack` `ok:true`), then the update ends `failed`
  (`Update error: Partition Could Not be Found (Update 10)`; from the code and the esp32 package source, not run by the author).
- Libraries (Library Manager): ESP32Servo 3.2.1, DHT sensor library 1.4.7, Adafruit SSD1306 2.5.17, WiFiManager 2.0.17, ArduinoJson 7.4.3,
  **PubSubClient3** 3.3.2, ModbusMaster 2.0.1, plus three supporting libraries installed together with DHT and SSD1306 (the versions the
  author used: Adafruit Unified Sensor 1.1.15, Adafruit GFX Library 1.12.6, Adafruit BusIO 1.17.4). HTTPUpdate, HTTPClient,
  NetworkClientSecure, Update, Preferences, and WiFi already come with the esp32 package.
- **The server first.** Install backend 1.5.0 (data contract 1.6) before Node 1 1.7.0: the old backend refuses the new `vitals` that carry
  `reset_reason`, `fw`, and `ota`.

## New in Node 1 1.7.0

| What | In short | File |
| :--- | :--- | :--- |
| Over-the-air updates | The MQTT `update` command (the **Update** button on `/fleet`) → `ack` `ok:true` = **accepted** → status `offline-mode` + a clean disconnect → download `<server address>/fw/node-1/<version>.bin` with the device key → the SHA-256 fingerprint is checked → restart into the other shelf. A failure = the old firmware keeps running, a `failed` report | `ota-update.cpp` |
| Only from the home server | Node 1 only downloads from the server address **stored on Node 1 itself** (the Wi-Fi portal, Serial `server`, or a claim). A command with another address is refused (`url is not this home's server`) before the key is sent anywhere | `ota-check.cpp` |
| The 60-second trial period and rollback | New firmware is valid if within 60 seconds of starting it connects to the broker, publishes `online`, and subscribes to `cmd`. If not, Node 1 **goes back by itself** to the old firmware. A restart in the middle of the trial period (a power cut, `restart`, the program crashing) also cancels the new firmware | `trial-period.cpp` |
| Result reports | `vitals` carry `reset_reason`, `fw`, and the `ota` report (`succeeded`, `rollback`, or `failed`), repeated in at most 3 `vitals` | `ota-update.cpp`, `networking.cpp` |
| Claim codes | A new board registers with an `XXXX-XXXX` code from the admin (the **Claim code** field in the Wi-Fi portal, or Serial `claim <code>`), without typing a key | `claim.cpp` |
| Wi-Fi portal | Three new fields: **Claim code** (not stored), **Server address**, **Broker address**. A password-protected portal if `PORTAL_PASSWORD` is written in `keys.h`. The portal isn't opened during the trial period | `networking.cpp` |
| The `vitals` interval from afar | `config` may carry `"intervals":{"vitals_s":60}` (60–3600 seconds, 300 by default). `telemetry` stays every 10 seconds | `networking.cpp`, `settings.cpp` |
| Stopping on purpose | Before an update, the Serial command `restart`, and `wifi forget`: status `offline-mode` then a clean disconnect (the broker doesn't publish the `offline` will) | `networking.cpp`, `ota-update.cpp` |

New Serial Monitor commands: `ota` (the version, program shelves, trial period, report), `server`, `server <address>`, `broker`, `broker <ip>`, `claim`,
`claim <code> [server address] [broker address]`. Example: `claim 7K2M-QF9D https://iot.yourname.my.id 192.168.1.37`.

> [!IMPORTANT]
> **The line that turns rollback on** is in `trial-period.cpp`: `extern "C" bool verifyRollbackLater() { return true; }`. Without that line, or
> without the words `extern "C"`, the firmware still compiles without any warning, but rollback **never** happens: the Arduino core
> marks every new firmware valid right away, before `setup()`. Don't delete or change that line.

## Making the firmware file for the server

1. Raise `FIRMWARE_VERSION` in `config.h`. The server refuses a version that was already uploaded, and the device refuses the same version as
   the one it is running. A downgrade (the **Allow downgrade** tick on the server) is allowed, but not below 1.7.0: old firmware has no trial
   period and no rollback, so the device answers `versions below 1.7.0 have no rollback: install by cable`.
2. In the Arduino IDE: **Sketch → Export Compiled Binary**. The file shows up in the sketch's `build/` folder (for example
   `build/esp32.esp32.esp32/node-1-home.ino.bin`).
3. Upload **`node-1-home.ino.bin`** on `/fleet` (**Upload firmware**). Not `.merged.bin` (4 MB, starts with the byte `0xFF`, always refused) and
   not `.bootloader.bin` or `.partitions.bin`.

`.bin` files and the `build/` folder are guarded by `.gitignore`: **never** commit or share them. Node 1's broker key isn't in that
file (the key is stored in the board's NVS), but the content of `keys.h` is compiled into it: the ESP-NOW key (Module 14, if
`USE_ENCRYPTION = true`) and the portal password `PORTAL_PASSWORD` (if written).

The size of a program shelf: 1,966,080 bytes. Node 1 1.6.0 = 1,194,928 bytes (60%, Module 21). Node 1 1.7.0 (with HTTPS and the built-in list of root
certificates) = **1,411,683 bytes (71%)** according to `Sketch uses` on the author's machine (the Module 10 settings: Minimal SPIFFS, Flash Mode DIO), and
its `.bin` file is 1,411,824 bytes: about 554 thousand bytes of the shelf are still free. The numbers in your Arduino IDE may differ by a few hundred
bytes, because the full board name, the operating system, and the folder path of the esp32 package are stored inside the firmware too (on the author's
machine, 1.6.0 with the same settings came to 1,194,560 bytes, 368 bytes smaller than the Module 21 record).

## Module 28 practice: 1.7.1 over the air, then 1.7.2-test (rollback)

Both practice versions are made from 1.7.0 **by changing constants only** in `config.h`:

| Version | Change in `config.h` | Installed | What to expect |
| :---: | :--- | :--- | :--- |
| 1.7.0 | (as it is) | **by cable**, for the last time | Serial: `Node 1 Home - firmware 1.7.0 (installed by cable)` |
| 1.7.1 | `FIRMWARE_VERSION[] = "1.7.1"`, `VERSION_NOTE[] = "installed over the air"` | the **Update** button on `/fleet` | valid within 60 seconds, `/fleet` shows `fw` 1.7.1 |
| 1.7.2-test | `FIRMWARE_VERSION[] = "1.7.2"`, `VERSION_NOTE[] = "rollback TEST release"`, `TEST_WRONG_KEY = 1` | uploaded with the **test** box ticked, then **Update** on one device | the broker refuses its key, 60 seconds pass, Node 1 goes back to 1.7.1 and reports `rollback` |

```diff
-const char FIRMWARE_VERSION[] = "1.7.0";
-const char VERSION_NOTE[] = "installed by cable";  // Module 28: a short sentence on Serial at startup, may be changed
+const char FIRMWARE_VERSION[] = "1.7.2";
+const char VERSION_NOTE[] = "rollback TEST release";  // Module 28: a short sentence on Serial at startup, may be changed
 ...
-const int TEST_WRONG_KEY = 0;
+const int TEST_WRONG_KEY = 1;
```

`TEST_WRONG_KEY = 1` breaks the broker key **in RAM only**: NVS isn't touched, so the old firmware that comes back uses its real key again.
After the practice, **set it back to 0** and `FIRMWARE_VERSION` to the next release version (for example 1.7.3). The version `1.7.2` (without the
`-test` suffix: the data contract only accepts x.y.z) is already used by the test release on the server, so the next normal release uses a new number.

## The Wi-Fi portal password (optional, recommended for Node 1 inside the box)

In `keys.h` (the Module 14 secret file, guarded by `.gitignore`), add one line, then write the same password on the label of Node 1's box:

```cpp
#define PORTAL_PASSWORD "password-of-8-to-63-characters"
```

Without that line, the portal is open without a password as in Module 10, and the Serial Monitor warns that the page `192.168.4.1/update` can be
opened by anyone near Node 1 while the portal is open. A password shorter than 8 or longer than 63 characters stops the compile with a clear
message (the WPA2 Wi-Fi password rule).

## Known limits

- While the firmware downloads (about half a minute to a minute), `loop()` stops: the pump and the buzzer are turned off first, the lamp, the fan, and the curtain
  stay in their last state, and the local safety (the offline-mode fan, automatic watering) doesn't run. A Node 2 ESP-NOW packet that arrives
  at that moment may be missed.
- The watchdog is relaxed to 60 seconds while downloading or exchanging a claim code, then set back to 5 seconds. A server that is silent for 8 seconds
  before answering = `failed` (`-11`) without a restart. Data that stops **in the middle** of the file: over `https://` the library gives up by itself
  after ±30 seconds (`failed`, `Update 6`, without a restart); over `http://` (the home network) the 60-second watchdog restarts Node 1.
  On both paths the old shelf stays whole; the `http://` path reports `failed: restarted while downloading (WDT)` with `reset_reason` `WDT`.
- New firmware that gets stuck in `setup()` (for example waiting for a sensor forever) is still rolled back: during the trial period, a 75-second watchdog already
  watches `setup()`.
- A router that is off during the trial period: the Wi-Fi guard tries again every 10 seconds (60 seconds normally). A router that isn't on within 60 seconds =
  the new firmware is rolled back even though it is actually fine: repeat **Update** after the router is on.
- A command that arrives exactly while Node 1 stops on purpose (±0.3 seconds) isn't carried out and is answered `ok:false`
  (`Node 1 is stopping on purpose: send it again once it is online`).
- A restart in the middle of the trial period (a power cut, the `restart` command, a brownout) always cancels the new firmware, even if that firmware
  is actually fine. Install updates while the power is stable.
- Node 2 isn't updated over the air: still by cable.
