# 🔌 01 - Embedded Firmware Engineering (ESP32)

Folder ini berisi kode sumber firmware, eksperimen I/O, sensor bus, dan implementasi FreeRTOS pada ESP32 (**Fase 1**):

## 📂 Rencana Proyek Latihan:
- `01-blink-led/` : Digital Output (Blink, Running LED, Active High/Low).
- `02-push-button/` : Digital Input, Pull-up internal, dan Software Debouncing.
- `03-serial-debug/` : Komunikasi Serial UART (Baud rate 115200, Serial.printf).
- `04-adc-pwm/` : Pembacaan Analog ADC (Potensiometer/LDR) dan PWM LED Dimmer / Servo SG90.
- `05-millis-timer/` : Timer non-blocking `millis()` (menggantikan `delay()`).
- `06-bus-sensors/` : I2C OLED SSD1306, BME280, MicroSD SPI, dan 1-Wire DS18B20.
- `07-freertos-dualcore/` : Multi-tasking FreeRTOS Core 0 & Core 1, Queues, Mutex, dan Watchdog (WDT).
- `08-tinyml-anomaly/` : Edge AI / TinyML inferensi anomali getaran (ESP32-S3).

## 📚 Daftar Modul Pembelajaran Fase 1:
1. 📄 **[Modul 1.1: Anatomi Board ESP32 & Aturan Pinout Aman](01-anatomi-pinout-dan-aturan-aman.md)**
2. 📄 *Modul 1.2: Proyek 1 — Digital Output (Blink & Active High/Low) (Coming Soon)*
3. 📄 *Modul 1.3: Proyek 2 — Digital Input & Software Debouncing (Coming Soon)*
4. 📄 *Modul 1.4: Proyek 3 — Komunikasi Serial UART & Debugging (Coming Soon)*
5. 📄 *Modul 1.5: Proyek 4 — Sinyal Analog (ADC & PWM Dimmer/Servo) (Coming Soon)*
6. 📄 *Modul 1.6: Proyek 5 — Non-Blocking Timer millis() & FSM (Coming Soon)*
7. 📄 *Modul 1.7: Proyek 6 — Protokol Bus Sensor (I2C, SPI & 1-Wire) (Coming Soon)*
8. 📄 *Modul 1.8: FreeRTOS Dual-Core, Queues, Mutex & Watchdog Timer (Coming Soon)*
9. 📄 *Modul 1.9: Kompendium Troubleshooting Mandiri Pemula (Coming Soon)*

---

## 🎯 Target Pembelajaran:
1. Memahami pinout aman ESP32 (menghindari strapping pins dan konflik ADC2).
2. Membangun firmware tanpa crash (*non-blocking* & *watchdog protected*).
3. Menerapkan arsitektur *Finite State Machine (FSM)*.
