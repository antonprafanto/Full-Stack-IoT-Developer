# Module 28 Challenge 1 key: the program shelf and the trial period on the OLED display

**Task (change a little):** while Node 1 is updated over the air, the OLED display doesn't tell which program shelf is running,
let alone whether the new firmware is still in its trial period. Change the status page (a long press of the button, Module 8) so that it
writes the running shelf (`app0`/`app1`) and the state of its trial period, without the Serial Monitor.

> [!NOTE]
> **Compiled by the author, not yet run on a board.** On 3 November 2026 Node 1 1.7.0 with this change was compiled with
> `arduino-cli` 1.5.1, the esp32 package 3.3.12, and the exact library versions of the firmware README, for **ESP32 Dev Module**, **Minimal SPIFFS**,
> Flash Mode **DIO**: no errors and not a single warning from the `node-1-home` files (the full result below). The author has no
> board on the desk, so the display text below is read from the code, not from a photo of the display.

| Key file | Goes into the project as |
| :--- | :--- |
| [`firmware/node-1-home/display.cpp`](firmware/node-1-home/display.cpp) | a whole replacement of `firmware/node-1-home/display.cpp` (the `display.cpp` tab in the Arduino IDE) |
| [`changes.diff`](changes.diff) | the same change as a diff against Node 1 1.7.0 (+28 lines, −1), only `display.cpp` |

## The answer

One new function in `display.cpp` reads the running shelf from ESP-IDF, then its state from the shelf note (`otadata`), and
builds the last line of the status page:

```cpp
static void shelfVersionText(char* result, size_t size) {
  const esp_partition_t* shelf = esp_ota_get_running_partition();
  esp_ota_img_states_t state = ESP_OTA_IMG_UNDEFINED;  // UNDEFINED = installed by cable
  if (shelf == nullptr) {
    snprintf(result, size, "v%s shelf ?", FIRMWARE_VERSION);
    return;
  }
  esp_ota_get_state_partition(shelf, &state);
  if (state == ESP_OTA_IMG_PENDING_VERIFY) {  // trial period: 60 seconds counted from when Node 1 started
    unsigned long now = millis();
    unsigned long remaining = now < OTA_TRIAL_PERIOD ? (OTA_TRIAL_PERIOD - now) / 1000 : 0;
    snprintf(result, size, "v%s %.4s TRIAL %lus", FIRMWARE_VERSION, shelf->label, remaining);
  } else if (state == ESP_OTA_IMG_VALID) {
    snprintf(result, size, "v%s %.4s valid", FIRMWARE_VERSION, shelf->label);
  } else {
    snprintf(result, size, "v%s %.4s cable", FIRMWARE_VERSION, shelf->label);
  }
}
```

The status page uses it on its last line (plus `#include <esp_ota_ops.h>` at the top of the file):

```diff
-  snprintf(text, sizeof(text), "v%s  free %luKB", FIRMWARE_VERSION, ESP.getFreeHeap() / 1024);
+  shelfVersionText(text, sizeof(text));
```

`%.4s` means "at most 4 characters": a shelf's name in the Minimal SPIFFS scheme is indeed `app0` or `app1`, but the shelf name field in ESP-IDF
holds up to 16 characters. Without that limit, the compiler (the warning setting **All**) warns that the line may be cut off
(`-Wformat-truncation`), because it counts the longest possibility. `millis()` is also read only once (`now`), so that the compiler
knows the remaining seconds are at most 60 (two digits).

| State in the shelf note | The last line of the status page (example) | What it means |
| :--- | :--- | :--- |
| `UNDEFINED` | `v1.7.0 app0 cable` | installed by USB cable: may run without conditions, without a trial period |
| `PENDING_VERIFY` | `v1.7.3 app0 TRIAL 47s` | just installed over the air, 47 seconds of the trial period left; the number goes down every second |
| `VALID` | `v1.7.3 app0 valid` | has already proven itself (connected to the broker and published within 60 seconds) |

Why is the state read from the shelf note, not from `inTrialPeriod()` in `trial-period.cpp`? So that the display writes what is really
recorded for the shelf opener. If some day the firmware can't be marked valid (Serial `Firmware … couldn't be marked valid: …`), the display still
writes `TRIAL`, and rightly so: the next restart will go back to the old firmware. The remaining seconds are counted with the same formula
as the Serial command `ota` (60 seconds from when Node 1 started).

One display line only holds 21 characters (Module 8), so the free memory number (`free …KB`) that used to be on that line is given up. `v1.7.3
app0 TRIAL 47s` takes exactly 21 characters, so it fits only while every part of the version has one digit. The free memory number still shows with the Serial command `info` and on the **Fleet** card (RAM).

## How to test it

1. Apply it to your project: from the project root, `git apply changes.diff` (then delete the diff file), or replace the whole content of the
   `display.cpp` tab with the key file. Raise `FIRMWARE_VERSION` in `config.h` to the next release, for example `"1.7.3"` (`1.7.2`
   is already used by the test release), and make sure `TEST_WRONG_KEY = 0`.
2. **Sketch → Export Compiled Binary**, upload `node-1-home.ino.bin` on the **Fleet** screen, then **Update** Node 1 as in Practice 7.
3. As soon as Node 1 restarts (Serial `TRIAL PERIOD: firmware 1.7.3 was just installed over the air on shelf …`), long-press the button. The last line
   of the status page writes the new version, the shelf next to the previous one (in this module's order usually `app0`), and `TRIAL` with the remaining seconds
   going down every second. The status page closes by itself after 10 seconds; long-press again to see it again.
4. After Serial writes `Firmware 1.7.3 VALID: …`, long-press again: `TRIAL` becomes `valid`.
5. Optional: upload by cable (**Upload**), then long-press the button: the shelf goes back to `app0` with the state `cable`.

## The author's compile results

`arduino-cli` 1.5.1, the `esp32:esp32` 3.3.12 package, the exact library versions of the firmware README, Raspberry Pi 5, 3 November 2026; FQBN
`esp32:esp32:esp32:PartitionScheme=min_spiffs,FlashMode=dio` with `--warnings all` (Node 1 1.7.0 + `changes.diff`, `keys.h` =
a copy of `keys.example.h`):

```text
Sketch uses 1411855 bytes (71%) of program storage space. Maximum is 1966080 bytes.
Global variables use 58404 bytes (17%) of dynamic memory, leaving 269276 bytes for local variables. Maximum is 327680 bytes.
```

Errors 0; warnings from the `node-1-home` files 0 (the 27 other warnings come from the WiFiManager, ESP32Servo, and ModbusMaster libraries,
exactly the same as Node 1 1.7.0 without the change). Compared with 1.7.0 with the same settings (`Sketch uses 1411683 bytes`), the program
grows by 172 bytes; the file `node-1-home.ino.bin` = 1,412,000 bytes, it still fits one program shelf (554,080 bytes left). The line
`extern "C"` in `trial-period.cpp` still works: `xtensa-esp32-elf-nm` writes one `T verifyRollbackLater` and no `W`.

Not tried by the author: the view on a real OLED display and the 1.7.3 update over the air on a board.
