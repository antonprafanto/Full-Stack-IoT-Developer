# Module 28 Quick Win: two shelves on your board

Material for the 🏆 Module 28 Quick Win (±15 minutes, needs the Node 1 board). One small sketch prints which **program shelf** is
running, the shelf next to it, and the content of the **shelf note** (`otadata`, a slip of paper the **shelf opener** reads when the board
starts). Then you upload a second version of the same sketch **over Wi-Fi**, pushed from the Arduino IDE (ArduinoOTA), and see
for yourself the board move from shelf `app0` to shelf `app1`. The "Mini Smart Home" project isn't touched.

| File | What's in it |
| :--- | :--- |
| [`program-shelf.ino`](program-shelf.ino) | the sketch: the constant `VERSION`, prints the running shelf + its state in the shelf note, the other shelf + its size, `ESP.getFreeSketchSpace()`, the last restart reason; a password-protected ArduinoOTA |
| [`secrets.h`](secrets.h) | an example Wi-Fi name and password, the same as Module 10 (fill in your own; keep it out of Git) |

> [!WARNING]
> **Practice only.** During this Quick Win, Node 1 doesn't run the home firmware (the sensors, the automatic lamp, and MQTT
> stop). In step 4, Node 1 1.6.0 is installed again by cable. The example password in the line `ArduinoOTA.setPassword("change-this-password")`
> **must be changed** before the first upload: while this sketch runs, anyone on your home Wi-Fi who knows the password can
> send a program to the board.

> [!NOTE]
> **Compiled by the author, not yet run on a board.** On 3 November 2026 this sketch was compiled with `arduino-cli` 1.5.1 and
> the esp32 package 3.3.12 for the settings below: no errors and not a single warning, ``Sketch uses 950907 bytes (48%)``.
> The author has no board on the desk, so all the Serial Monitor text below is read from the sketch, not recorded from a board. The network port
> of the Arduino IDE for the 3.3.12 package (finding the board through mDNS, the `espota` upload tool, the laptop's firewall permission) hasn't been tested by the author either.

## Arduino IDE settings

- The **ESP32 Dev Module** board (the esp32 package **3.3.12**), as for Node 1 since Module 10.
- **Tools → Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**: two program shelves of 1,966,080 bytes each.
  A scheme whose name contains **No OTA** (including **Huge APP**) has only one shelf: the function for the other shelf then points at the shelf that is
  running itself, so the sketch writes `No other shelf: choose Partition Scheme Minimal SPIFFS.` and stops there.
- **Tools → Flash Mode** → **DIO**.
- No extra library: WiFi, ArduinoOTA, and `esp_ota_ops.h` (the program shelf functions of ESP-IDF) come with the esp32 package.

## The steps

Copy this `program-shelf` folder into your practice folder (for example `learn-iot/module-28/program-shelf`) and open `program-shelf.ino` in
the Arduino IDE. Fill in the `secrets.h` tab with the name and password of your home's 2.4 GHz Wi-Fi (or copy `secrets.h` from your Module 10 sketch folder),
then replace `change-this-password` with a password of your own.

1. **Upload by cable.** Choose the board's USB port as usual, click **Upload**, then open the **Serial Monitor** (**115200 baud**).
   If the first line was missed, press the **EN** button. What the sketch writes (an example IP address):

   ```text
   Version 1, last restart: POWERON
   Running shelf: app0 (UNDEFINED, installed by cable)
   Other shelf: app1, 1966080 bytes
   Room for a new program: 1966080 bytes
   Ready to receive a program over Wi-Fi at 192.168.1.50
   ```

   An upload by cable rewrites the shelf opener, the partition table, and the shelf note "start `app0`" with the state `UNDEFINED`: the program
   may run without conditions, without a trial period. `ESP.getFreeSketchSpace()` measures **the other shelf** (where the next program will be
   written), not what is left of the shelf in use, so its number is the same as the line above it.

2. **Upload over Wi-Fi.** Change `const int VERSION = 1;` to `2`. Open **Tools → Port**: besides the USB port, there should be a network port
   named `program-shelf` with the board's IP address (its exact label in Arduino IDE 2.3.10 hasn't been checked by the author). The laptop and the board must be
   connected to the same Wi-Fi. Choose that port, click **Upload**, then fill in the password you wrote in `setPassword()`. The new program is
   written to the other shelf by the old program that is still running, then the board restarts by itself. Leave the USB cable plugged in only
   to watch the Serial Monitor (if the Serial Monitor stays silent, choose the USB port for it again):

   ```text
   New program arriving, written to the other shelf...
   ```

   then after the restart:

   ```text
   Version 2, last restart: SW
   Running shelf: app1 (VALID, approved)
   Other shelf: app0, 1966080 bytes
   Room for a new program: 1966080 bytes
   Ready to receive a program over Wi-Fi at 192.168.1.50
   ```

   `SW` = the program itself asked for the restart (ArduinoOTA, as soon as it finished writing). Notice `VALID`: version 2 is **approved right away**
   without proving anything, because the Arduino core marks every new program valid before `setup()` runs. That is what the one
   `extern "C"` line in Node 1 1.7.0 changes into a 60-second trial period (Concept 4).

3. **Press EN.** The board restarts and stays on the new shelf, because the shelf note already points at `app1`:

   ```text
   Version 2, last restart: POWERON
   Running shelf: app1 (VALID, approved)
   ```

4. **Back to the cable.** Choose the USB port again in **Tools → Port** and upload this sketch once more by cable (**Upload**):
   the Serial Monitor writes `Running shelf: app0 (UNDEFINED, installed by cable)` again, because every upload by cable rewrites
   the shelf note. After that open the Mini Smart Home project (the `main` branch) and install Node 1 1.6.0 again by cable as usual.

> 🔀 **Wokwi / without a Kit:** step 1 only (whether Wokwi imitates the shelf note hasn't been tested by the author); there is no network port in Wokwi.

## If it doesn't work

| What you see | The most likely cause |
| :--- | :--- |
| `No other shelf: choose Partition Scheme Minimal SPIFFS.` | a partition scheme without OTA; choose **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, then upload by cable again |
| `Wi-Fi not connected yet. Check the secrets.h tab.` | the Wi-Fi name or password is wrong, or it is a 5 GHz Wi-Fi (the ESP32 only does 2.4 GHz), the same as Module 10 |
| The network port `program-shelf` doesn't show up in **Tools → Port** | the laptop and the board aren't on the same Wi-Fi, or the laptop's firewall blocks finding the board; wait a few seconds, then open the menu again (not tested by the author) |
| The password is refused when uploading over Wi-Fi | what counts is the password in the sketch **running** on the board, not the new password you just typed |

## Pushed from the IDE (Quick Win) vs pulled from the server (this week)

| | Pushed from the IDE (ArduinoOTA) | Pulled from the server (Node 1 1.7.0) |
| :--- | :--- | :--- |
| Who starts it | the laptop sends a program to the board | the server orders it through MQTT, the board downloads it by itself from its home server |
| One network needed? | yes: the Arduino IDE finds the board through mDNS on the same Wi-Fi | no: the board can be anywhere, as long as it can reach its server |
| Key | one ArduinoOTA password, the same for anyone who knows it | a key per device (a locked download) |
| The file's fingerprint | the MD5 the Arduino IDE sends with the program (only makes sure the transfer is complete) | SHA-256 from the home server, checked before installing |
| Bad firmware | still approved and still used | a 60-second trial period, then it goes back by itself to the old version |
| Many devices | one by one from the laptop | one canary device first, then the rest |
| Trail | none | the update history on the **Fleet** screen |

## The author's compile results

`arduino-cli` 1.5.1, the `esp32:esp32` 3.3.12 package, `--fqbn esp32:esp32:esp32:PartitionScheme=min_spiffs,FlashMode=dio --warnings all`
(= ESP32 Dev Module, Minimal SPIFFS, DIO; other settings default), Raspberry Pi 5, 3 November 2026:

```text
Sketch uses 950907 bytes (48%) of program storage space. Maximum is 1966080 bytes.
Global variables use 51520 bytes (15%) of dynamic memory, leaving 276160 bytes for local variables. Maximum is 327680 bytes.
```

Errors 0, warnings 0 (also from the libraries). The libraries compiled along all come with the esp32 package 3.3.12: WiFi, Network,
ArduinoOTA, ESPmDNS, Update, and Hash. The file `program-shelf.ino.bin` = 951,056 bytes, about half of one program shelf.

The numbers in your Arduino IDE may differ a little (the full board name, the operating system, and the folder path of the package are stored in the
program). Not yet tried by the author: uploading to a real board, the network port, and Wokwi.
