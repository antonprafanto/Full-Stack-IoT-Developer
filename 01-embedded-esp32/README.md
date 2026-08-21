# 🔌 01 - Embedded Firmware Engineering (ESP32)

Selamat datang di **Fase 1: Rekayasa Hardware & Sensor ESP32**! Folder ini berisi kurikulum langkah-demi-langkah dari dasar digital I/O hingga penguasaan sistem operasi waktu-nyata FreeRTOS dual-core pada chip ESP32.

---

## 📚 Modul Pembelajaran Fase 1:

| Modul | Topik Materi & Pembelajaran | Status | Estimasi Waktu |
| :--- | :--- | :---: | :---: |
| 📄 **[Modul 1.1: Anatomi Pinout, Digital I/O & Tombol](01-anatomi-pinout-dan-digital-io.md)** | Pemetaan pin aman vs strapping pin, Aturan sakral ADC2 Wi-Fi, Digital Output (Active High vs Active Low), `INPUT_PULLUP` internal, dan algoritma *Software Debouncing*. | ✅ Selesai | 40–50 Menit |
| 📄 **[Modul 1.2: Serial Debugging, ADC 12-Bit & PWM](02-serial-debug-dan-analog-pwm.md)** | Format string `Serial.printf()`, Membaca input keyboard serial, Pembacaan analog ADC 12-bit (0-4095), Fungsi `map()`, Efek lampu bernapas PWM, dan Kontrol Motor Servo SG90 ($0^\circ - 180^\circ$). | ✅ Selesai | 45–60 Menit |
| 📄 **[Modul 1.3: Non-Blocking `millis()` & State Machine](03-nonblocking-millis-dan-fsm.md)** | Bahaya fatal `delay()` di produksi IoT, Analogi stopwatch, Multitasking 3 tugas serentak, Pola arsitektur *Finite State Machine (FSM)* lampu lalu lintas pintar. | ✅ Selesai | 45–60 Menit |
| 📄 **[Modul 1.4: Protokol Bus Sensor I2C, SPI & 1-Wire](04-protokol-bus-i2c-spi-1wire.md)** | I2C Scanner otomatis, Layar OLED 0.96" SSD1306, Sensor cuaca Bosch BME280, MicroSD SPI High-Speed Logger, dan Sensor suhu tahan air Dallas DS18B20. | ✅ Selesai | 50–60 Menit |
| 📄 **[Modul 1.5: FreeRTOS Dual-Core & Kehandalan WDT](05-freertos-multicore-dan-kehandalan-wdt.md)** | Multitasking Core 0 vs Core 1 (`xTaskCreatePinnedToCore`), Thread-safe FreeRTOS Queues & Mutex, Task Watchdog Timer (WDT), Heap Memory Profiling, LittleFS Wear-Leveling, dan Kompilasi 5 Troubleshooting Klasik. | ✅ Selesai | 50–60 Menit |

---

## 🎯 Capaian Pembelajaran Fase 1:
1. ✅ Memahami pinout fisik ESP32 secara aman tanpa menyebabkan kegagalan boot atau konflik Wi-Fi.
2. ✅ Mampu membaca sinyal digital, tombol mekanik bebas debouncing, dan sinyal analog 12-bit terkalibrasi.
3. ✅ Mampu mengendalikan aktuator motor servo dan lampu dimmer menggunakan modulasi PWM.
4. ✅ Membangun program multitasking non-blocking berbasis timer `millis()` dan Finite State Machine.
5. ✅ Menghubungkan berbagai sensor lingkungan I2C/SPI/1-Wire dan menampilkannya di layar OLED.
6. ✅ Menguasai pemrosesan paralel dua inti prosesor FreeRTOS dengan proteksi Watchdog Timer.

---

👉 **Langkah Berikutnya:** Lanjutkan ke **[02-hardware-pcb/](../02-hardware-pcb/README.md)** untuk mulai merancang skematik modular, proteksi catu daya, dan layout PCB 4-Layer di KiCad 8.x!
