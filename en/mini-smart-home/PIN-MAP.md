# 📍 Canonical Pin Map — Mini Smart Home

🌐 **English** · [Bahasa Indonesia](../../proyek-rumah-pintar-mini/PETA-PIN.md)

> Created in [Module 5](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md#3-the-pin-budget-and-the-canonical-pin-map-of-node-1-and-node-2), updated in [Module 6](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-1-esp32-embedded/module-06-reading-sensors/README.md), [Module 7](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-1-esp32-embedded/module-07-sensor-bus-oled-schematics/README.md), [Module 9](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-1-esp32-embedded/module-09-power-and-low-power/README.md), and [Module 14](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-14-node-2-esp-now/README.md); valid until Module 28.
> **Before you add anything to Node 1 or Node 2, check this file first.**

## Rules

1. **One pin, one job.** A pin that is already reserved is not used for anything else, even if its part hasn't arrived yet.
2. **Change this map only when you have to.** Change this file and the pin constants in the code at the same time, and write the reason in the commit message.
3. This map **only applies to the 30-pin ESP32 DevKit V1** (classic ESP32 chip). Other boards (ESP32-S3, C3, C6) have their own pin rules.

## Node 1 "Home"

The first ESP32 DevKit V1, inside the house. Since Module 9, this board gets its power from **its own charger** through the board's USB port. This board never runs on a battery and never sleeps.

| GPIO (label on the board) | For | Direction | Since | Status after Module 9 | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 4 (D4) | Status LED | output | M2 | connected | through a 220 Ω resistor |
| 13 (D13) | Manual button | input | M5 | connected | `INPUT_PULLUP`; the other leg goes to GND |
| 32 (D32) | Lamp relay (IN1) | output | M5 | connected | active-LOW relay |
| 33 (D33) | Fan relay (IN2) | output | M5 | connected | active-LOW relay |
| 25 (D25) | Pump (MOSFET gate) | output | M5 | connected | 220 Ω in series + 10 kΩ to GND |
| 26 (D26) | Curtain servo | output (PWM) | M5 | connected | servo powered by the MB102 |
| 27 (D27) | Passive buzzer | output (PWM) | M5 | connected | through a 220 Ω resistor |
| 14 (D14) | DHT22 | two-way | M6 | connected | 3-pin module (pull-up already on the module), 3.3 V from the bottom rail |
| 36 (VP) | LDR | analog input | M6 | connected | ADC1; voltage divider: 10 kΩ to 3.3 V, LDR to GND; 100 nF capacitor to GND |
| 39 (VN) | Capacitive soil sensor | analog input | M6 | connected (replaces the Module 5 practice potentiometer) | ADC1; 3.3 V from the bottom rail |
| 34 (D34) | PIR | input | M6 | connected | the PIR gets 5 V from the top rail; its OUT pin is only 3.3 V, so it goes straight to the pin |
| 35 (D35) | HC-SR04 ECHO | input | M6 | connected | through a 4.7 kΩ + 10 kΩ voltage divider (5 V → about 3.4 V) |
| 15 (D15) | HC-SR04 TRIG | output | M6 | connected | strapping pin, safe as an output; the HC-SR04 gets 5 V from the top rail |
| 21 / 22 (D21 / D22) | I2C SDA / SCL: OLED display (address `0x3C`) | bus | M7 | connected | bus strips on the lower breadboard (see **Buses on the breadboard**); the display gets 3.3 V from the bottom rail; the BME280 is only practice and moves to Node 2; address `0x40` is reserved for the **INA219**, a temporary current meter (Module 9), connected in the BME280's holes only while measuring |
| 18 / 19 / 23 / 5 (D18 / D19 / D23 / D5) | microSD SCK / MISO / MOSI / CS | SPI bus | M7 | optional | connect it according to the **Buses on the breadboard** table; logs `node1.csv`; regulated module: press **EN** after turning on the MB102 so the card is detected; D5 is a strapping pin (HIGH at power-up), safe as a CS output; may be removed after Module 11 |
| 16 / 17 (RX2 / TX2) | RS-485 RO / DI (MAX485) | UART bus | M15 | reserved | GPIO 16 was borrowed for the DS18B20 practice in Module 7 (finished, the sensor is stored for Node 2); the RO output of a MAX485 module powered with 5 V is first brought down to 3.3 V (Module 15) |
| 2 (D2) | RS-485 DE/RE + built-in blue LED | output | M15 | reserved | strapping pin; the blue LED lights up while transmitting |

## Node 2 "Garden"

The second ESP32 DevKit V1, battery powered. Its skeleton (DS18B20 and the "awake" LED) is connected in Module 9; the BME280, the second soil sensor, and ESP-NOW to Node 1 are added in Module 14. This board never connects to the router: it only sends packets to Node 1.

| GPIO | For | Since | Status after Module 14 | Notes |
| :--- | :--- | :---: | :--- | :--- |
| 27 | DS18B20 (1-Wire) | M9 | connected | adapter module (the 4.7 kΩ resistor to 3V3 is already on the module); since Module 14, its VCC and GND come from the mini breadboard's bottom rail (see **Node 2 sensors**), while DAT still goes straight to the D27 pin; 10-bit resolution |
| 2 | Built-in blue LED: "awake" indicator | M9 | connected | on while the board is awake, off while it sleeps |
| 21 / 22 | I2C SDA / SCL: BME280 (address `0x76` or `0x77`) | M14 | connected | VIN from the bottom rail (+) 3.3 V; read in forced mode (one measurement, then the sensor sleeps by itself) |
| 39 (VN) | Second soil sensor: AOUT | M14 | connected | ADC1; same pin as on Node 1, so the code can be reused; the two-point calibration is done again with power from D32 |
| 32 (D32) | Second soil sensor: VCC | M14 | connected | output HIGH **only while awake** (the sensor draws about 5 mA); **not** 3V3, because the sensor would then stay on all the time while Node 2 sleeps |
| 16 / 17 / 2 | RS-485 for the Module 15 lab | M15 | reserved | only during the lab, with its own lab sketch; the MAX485 is removed again afterwards because GPIO 2 is also the "awake" LED |
| 36 (VP) | Battery voltage | M14 | optional | a 2 × 100 kΩ voltage divider from the TP4056's OUT+ to OUT−, the midpoint to VP, a 100 nF capacitor from VP to GND (Module 14 technical deep dive) |

## Node 2 battery circuit (since Module 9)

Built on a 400-point mini breadboard. **Top rail (−)** = GND, **top rail (+)** = 5.0 V from the MT3608.

| Part | Connections | Notes |
| :--- | :--- | :--- |
| 18650 holder | black wire → 3e, red wire → 6d | the battery goes in **last**; while the battery is in, columns 3 and 6 are not used for other wires, except briefly for multimeter test wires |
| TP4056 (6 pads, with protection) | B− → 3c, B+ → 6c; OUT+ → 12d, OUT− → top rail (−); IN+/IN− not used | charged through its USB port with a phone charger; loads **always** from OUT+/OUT− |
| MT3608 | VIN+ → 12b, VIN− → top rail (−); VOUT+ → top rail (+), VOUT− → top rail (−) | set to **5.0 V** with a multimeter **without a load**, before the board is connected |
| 100 µF capacitor | (+) leg → top rail (+), (−) leg → top rail (−) | installed **after** the MT3608 is set |
| Node 2 board | VIN → top rail (+) column 29; GND (left row, above VIN) → top rail (−) column 28 | while measuring current: VIN goes through the INA219 (VIN+ from top rail (+) column 29, VIN− to 27a, board VIN to 27e), and the mini breadboard's top rail (−) (not its bottom rail) is joined with the Node 1 workbench's bottom rail (−) column 30 by a black male–male wire |

## Node 2 sensors (since Module 14)

The sensors aren't plugged into the breadboard: their pins are connected with wires. The only part of the mini breadboard they use is the **bottom rail**: **bottom rail (+) = 3.3 V** from the board's 3V3 pin, **bottom rail (−) = GND**. Stick a "3V3" label on the bottom rail so that it isn't mixed up with the top rail (+), which carries 5.0 V from the MT3608.

| Part | Connections | Wires |
| :--- | :--- | :--- |
| Bottom rail | board 3V3 (right row, at the very bottom) → bottom rail (+) column 29; board GND (right row, above 3V3) → bottom rail (−) column 28 | male–female, orange and black |
| BME280 | VIN → bottom rail (+) column 15, GND → bottom rail (−) column 16, SCL → D22, SDA → D21 | VIN and GND male–female; SCL (yellow) and SDA (blue) female–female |
| DS18B20 adapter | VCC → bottom rail (+) column 24, GND → bottom rail (−) column 27, DAT → D27 | VCC and GND male–female; DAT (purple) female–female |
| Second soil sensor | the female ends of its wires: VCC straight onto the D32 pin, AOUT straight onto the VN pin; GND through a black male–male jumper wire to bottom rail (−) column 21 | follow the labels on the sensor board (GND, VCC, AOUT), not the wire colors |

**While running from the battery, Node 2's USB is unplugged**, and **its 3V3 pin never gets battery voltage**. Want to upload a program? Unplug its VIN and GND wires first.

## Pins to avoid

| GPIO | Reason |
| :--- | :--- |
| 12 (D12) | Strapping pin that selects the flash memory voltage. If it is pulled HIGH while the board powers up, the board fails to boot. |
| 1 and 3 (TX0, RX0) | The USB link to the laptop: used while a program is being uploaded and by the Serial Monitor. |
| 6–11 | Used by the flash memory. Not broken out on 30-pin boards; on 38-pin boards they are labeled `D0`–`D3` (or `SD0`–`SD3`), `CMD`, `CLK`. Watch out: the label `D2` or `SD2` on a 38-pin board is GPIO 9, not GPIO 2. |
| 0 | The **BOOT** button (selects download mode). Not broken out on 30-pin boards. |
| 34–39 for buttons or outputs | Input only, and no internal pull-up. |
| 36 and 39 for digital inputs with an interrupt | Per the *ESP32 Series SoC Errata*: the input is briefly pulled low while the ADC or Wi-Fi is active. That is why the PIR and ECHO are on 34/35. |

## Power rails on the workbench (since Module 5)

| Rail | Content | For |
| :--- | :--- | :--- |
| **Top rail** (upper breadboard) | 5 V from the MB102, top-rail-side jumper on **5V** | loads: relays, fan, pump, servo; 5 V sensors: PIR and HC-SR04; regulated microSD module (optional) |
| **Middle rail** (bottom rail strip of the upper breadboard) | not used, middle-rail-side jumper on **OFF** | — |
| **Bottom rail** (lower breadboard) | 3.3 V from the ESP32 3V3 pin | 3.3 V sensors: LDR, soil sensor, DHT22; OLED display (since Module 7); 3.3 V-only microSD module (optional) |

All GNDs are joined by two black wires from the board's two GND pins (column 5): one from 5f to the top rail (−), one from 5e to the bottom rail (−).

## Buses on the breadboard (since Module 7)

One bus = one strip of connected holes shared by several devices. A new device on the same bus just plugs into an empty hole in that strip.

| Bus | Jumper wire (male–male) | Shared strip | Already connected |
| :--- | :--- | :--- | :--- |
| I2C SDA (D21) | blue, from 14d to 20f | column 20, rows f–j | OLED display: SDA at 20j |
| I2C SCL (D22) | yellow, from 17e to 19f | column 19, rows f–j | OLED display: SCL at 19j |
| SPI (optional) | — | each ESP32 pin's own strip, row e | microSD: CS 11e, SCK 12e, MISO 13e, MOSI 18e |

OLED display: GND to the bottom rail (−) column 17, VCC to the bottom rail (+) column 18. microSD module: GND to the bottom rail (−) column 21; VCC of a regulated module to the top rail (+) column 22 (5 V), a 3.3 V-only module to the bottom rail (+) column 21. A regulated module is only detected if the MB102 is already on when the program looks for the card, so after turning on the MB102, press **EN**. **Column 9, rows f–j, is the status LED's cathode strip (GND)**, so don't use it for data wires.

## Golden power rules

1. **Loads** (relays, fan, pump, servo) **always get their power from the MB102**, never from the ESP32's VIN or 3V3 pin.
2. **ESP32 Node 1 is powered from its own charger** through the board's USB port (since Module 9). The laptop is only for uploading programs and reading the Serial Monitor.
3. **All GNDs are joined.**
4. **The MB102 5 V rail is never connected to the ESP32's 3V3 pin**, nor to its VIN pin while a USB cable (from the laptop or the charger) is plugged in.
5. **Power on/off order:** plug in the USB (laptop or charger) first, then turn on the MB102; turn off the MB102 first, then unplug the USB. If the MB102 is on while the ESP32 has no power, current from the relay module can leak into the ESP32 through the IN wires.

## History

| Version | Module | Changes |
| :---: | :---: | :--- |
| 1 | 5 | First pin map. Node 1 actuators connected; sensors, buses, and RS-485 reserved. |
| 2 | 6 | All five Node 1 sensors connected (DHT22, LDR, capacitive soil sensor, PIR, HC-SR04); 5 V sensors on the top rail, 3.3 V sensors on the bottom rail. |
| 3 | 7 | I2C bus connected (OLED display at `0x3C`, bus strips in columns 19 and 20, powered from the bottom rail); optional microSD; DS18B20 practice on GPIO 16 finished; new **Buses on the breadboard** table. |
| 4 | 9 | Node 1 gets its power from its own charger (golden power rules 2, 4, and 5). Node 2 skeleton connected: DS18B20 on GPIO 27 and the "awake" LED on GPIO 2. New **Node 2 battery circuit** section. I2C address `0x40` reserved for the INA219, a temporary measuring tool. |
| 5 | 14 | Node 2 complete: the BME280 on I2C (D21/D22), the second soil sensor on VN with VCC from **D32** (off during sleep), the DS18B20 moves to the mini breadboard's bottom rail; VP optional for the battery voltage. New **Node 2 sensors** section. Node 1 doesn't change. |

---

[⬅️ Back to the project folder](README.md) · [Module 5](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-1-esp32-embedded/module-05-gpio-and-pin-map/README.md) · [Module 7](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-1-esp32-embedded/module-07-sensor-bus-oled-schematics/README.md) · [Module 9](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-1-esp32-embedded/module-09-power-and-low-power/README.md) · [Module 14](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-14-node-2-esp-now/README.md) · [Syllabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/SYLLABUS.md)
