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

---

## 🎯 Target Pembelajaran:
1. Memahami pinout aman ESP32 (menghindari strapping pins dan konflik ADC2).
2. Membangun firmware tanpa crash (*non-blocking* & *watchdog protected*).
3. Menerapkan arsitektur *Finite State Machine (FSM)*.
