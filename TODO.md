# 📋 Pelacak Progres & TODO: Fullstack IoT Developer (Zero to Enterprise)

> **Repositori GitHub:** [antonprafanto/Full-Stack-IoT-Developer](https://github.com/antonprafanto/Full-Stack-IoT-Developer)  
> **Panduan Kurikulum Lengkap:** [README.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/README.md)  
> **Terakhir Diperbarui:** 21 Agustus 2026

---

## 📊 Ringkasan Progres Keseluruhan

| Fase | Modul Pembelajaran | Estimasi Waktu | Status | Progres |
| :---: | :--- | :---: | :---: | :---: |
| **0** | Fondasi Listrik Ramah Pemula, Logika & Tooling | Minggu 1–2 | `[ ] Belum Mulai` | 0% |
| **1** | ESP32 Step-by-Step: Dari Blink ke FreeRTOS | Minggu 3–6 | `[ ] Belum Mulai` | 0% |
| **2** | Desain Perangkat Keras, Skematik & PCB 4-Layer KiCad | Minggu 7–8 | `[ ] Belum Mulai` | 0% |
| **3** | Power Harvesting & Ultra Low-Power (10-Year Battery) | Minggu 9 | `[ ] Belum Mulai` | 0% |
| **4** | Protokol Industri & Otomotif (CAN Bus, Modbus, OPC-UA) | Minggu 10–11 | `[ ] Belum Mulai` | 0% |
| **5** | Ekosistem Nirkabel: Matter, LoRaWAN & Antares.id | Minggu 12–13 | `[ ] Belum Mulai` | 0% |
| **6** | Edge AI & TinyML pada Mikrokontroler (ESP32-S3) | Minggu 14 | `[ ] Belum Mulai` | 0% |
| **7** | Linux Edge Gateway (Raspberry Pi & Hardening OS) | Minggu 15–16 | `[ ] Belum Mulai` | 0% |
| **8** | Distributed Cloud Ingestion & Time-Series Lakehouse | Minggu 17–19 | `[ ] Belum Mulai` | 0% |
| **9** | Modern Frontend Dashboard (Next.js 15 & Digital Twin) | Minggu 20–21 | `[ ] Belum Mulai` | 0% |
| **10** | SRE, Observability & Distributed Tracing (OpenTelemetry) | Minggu 22 | `[ ] Belum Mulai` | 0% |
| **11** | Zero-Trust Security, Pen-Testing & Regulasi EU CRA | Minggu 23 | `[ ] Belum Mulai` | 0% |
| **12** | Produksi Massal, Factory Test Jig, FinOps & Capstone | Minggu 24–26 | `[ ] Belum Mulai` | 0% |

---

## ⚡ Fase 0: Fondasi Listrik Ramah Pemula, Logika Komponen & Pemrograman Inti (Minggu 1-2)

### 0.0 Pengantar Konseptual: "Bagaimana Kode Masuk ke Chip Silikon?"
- [ ] Memahami perbedaan Komputer vs Mikrokontroler (*Bare-Metal Execution*).
- [ ] Memahami alur kompilasi: Kode C++ $\rightarrow$ Kompiler $\rightarrow$ Biner `.bin` $\rightarrow$ Chip USB-to-UART (CP2102/CH340) $\rightarrow$ SPI Flash.
- [ ] Menginstal driver USB-to-UART (CH340/CP2102) dan mendeteksi port COM di Windows Device Manager.
- [ ] Memahami fungsi tombol fisik `EN` (Reset) dan `BOOT` (GPIO 0) saat proses flashing.

### 0.1 Dasar Listrik Intuitif (Analogi Aliran Air)
- [ ] Memahami konsep Tegangan ($V$), Arus ($I$), Hambatan ($R$), dan Daya Listrik ($P$).
- [ ] Menghitung resistor pengaman LED menggunakan Hukum Ohm ($R = \frac{V_s - V_{led}}{I}$).
- [ ] Memahami perbedaan arus listrik DC (3.3V / 5V) vs AC (220V).

### 0.2 Anatomi Breadboard & Komponen Fisik (Anti-Korslet)
- [ ] Memahami jalur plat tembaga internal breadboard (*Power Rails* horizontal vs *Terminal Strips* vertikal).
- [ ] Mengidentifikasi kaki polaritas anoda/katoda pada LED, kapasitor elektrolit, dan orientasi dioda.
- [ ] Membaca kode warna resistor ($220\Omega, 1k\Omega, 10k\Omega$) dan memverifikasi dengan multimeter.
- [ ] Menggunakan kabel jumper (*Male-to-Male*, *Male-to-Female*, *Female-to-Female*) secara tepat.

### 0.3 Logika Sirkuit Dasar & Fenomena Penting IoT
- [ ] **Prinsip Mutlak Common Ground (GND Sharing):** Menghubungkan semua GND perangkat agar memiliki titik acuan 0V yang sama.
- [ ] Menghitung dan merakit rangkaian pembagi tegangan (*Voltage Divider*) untuk sensor analog LDR.
- [ ] Memahami fenomena *Floating Pin* dan memasang resistor Pull-up / Pull-down.
- [ ] Menggunakan transistor / relay sebagai sakelar pengontrol beban daya tinggi.
- [ ] Menggunakan Multimeter Digital (True RMS) untuk mengukur voltase, kontinuitas 'beep', dan resistansi.

### 0.4 Pemrograman C/C++ dari Nol (Khusus Embedded)
- [ ] Memahami struktur eksekusi `setup()` dan `loop()`.
- [ ] Menguasai tipe data fixed-width (`uint8_t`, `int16_t`, `int32_t`, `float`, `bool`).
- [ ] Memahami perbedaan Scope Variabel (Variabel Global di SRAM vs Variabel Lokal di Stack).
- [ ] Menguasai percabangan (`if-else`, `switch-case`) dan perulangan (`for`, `while`).
- [ ] Membuat fungsi kustom dengan parameter dan return value.
- [ ] Menguasai array buffer data sensor (`int readings[10]`).
- [ ] Memahami konsep memori dan pointer (`&` dan `*`) dengan analogi nomor rumah.
- [ ] Memahami manipulasi bitwise dasar (`&`, `|`, `^`, `<<`, `>>`).

### 0.5 Pemrograman Python dari Nol (Khusus Gateway & Cloud)
- [ ] Menguasai tipe data dasar, List `[]`, Dictionary `{}` (format JSON), dan Tuples.
- [ ] Menguasai fungsi, modul, dan manajemen paket virtual environment (`venv` / `uv`).
- [ ] Memahami dasar pemrograman asinkron (`asyncio`, `await`).

### 0.6 Setup Lingkungan Belajar (Tools & Simulator Virtual)
- [ ] Instalasi **VS Code** dan ekstensi **PlatformIO IDE**.
- [ ] Uji coba simulasi rangkaian ESP32 pertama di browser menggunakan **Wokwi Simulator**.
- [ ] Setup Git repository dan GitHub untuk menyimpan kode latihan.

---

## 🔌 Fase 1: Langkah Demi Langkah Mikrokontroler ESP32 — Dari Blink ke FreeRTOS (Minggu 3-6)

### 1.1 Anatomi Board ESP32 & Aturan Pinout Aman
- [ ] Memetakan Pin Aman (GPIO 4, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33).
- [ ] Memahami Pin Input-Only (GPIO 34, 35, 36, 39) dan Strapping Pins bahaya (GPIO 0, 2, 12, 15).
- [ ] Memahami aturan ADC1 vs ADC2 (ADC2 tidak dapat dipakai saat Wi-Fi menyala).

### 1.2 Proyek 1: Digital Output (LED & Aktuator)
- [ ] Menulis program Blink LED internal dan eksternal (`pinMode`, `digitalWrite`).
- [ ] Membuat pola running LED dan memahami logika *Active High* vs *Active Low*.

### 1.3 Proyek 2: Digital Input & Push Button
- [ ] Membaca status tombol dengan `pinMode(pin, INPUT_PULLUP)` dan `digitalRead(pin)`.
- [ ] Membuat logika toggle switch (tekan sekali ON, tekan lagi OFF).
- [ ] Mengimplementasikan *Software Debouncing* untuk mengatasi getaran mekanik tombol.

### 1.4 Proyek 3: Serial Communication & Debugging
- [ ] Inisialisasi `Serial.begin(115200)` dan mencetak variabel data sensor.
- [ ] Menangani baud rate mismatch penyebab karakter rusak (``).
- [ ] Membaca input teks dari Serial Monitor ke ESP32.

### 1.5 Proyek 4: Sinyal Analog (ADC & PWM)
- [ ] Membaca sensor potensiometer dan LDR dengan `analogRead(pin)` (resolusi 12-bit, 0-4095).
- [ ] Mengonversi nilai analog ke rentang persentase menggunakan fungsi `map()`.
- [ ] Mengatur kecerahan LED (*Fading Effect*) menggunakan PWM ESP32 (`ledcAttachPin`, `ledcWrite`).
- [ ] Mengontrol sudut putar Motor Servo SG90 ($0^\circ - 180^\circ$).

### 1.6 Proyek 5: Mengatasi Jebakan `delay()` dengan `millis()`
- [ ] Memahami bahaya fungsi `delay()` yang membekukan prosesor mikrokontroler.
- [ ] Menerapkan timer stopwatch non-blocking `millis()` (menjalankan 3 tugas independen serentak).

### 1.7 Proyek 6: Protokol Bus Sensor Hardware (I2C, SPI, 1-Wire)
- [ ] Menjalankan *I2C Scanner* untuk mendeteksi alamat heksadesimal sensor.
- [ ] Menampilkan data dan grafik pada **Layar OLED 0.96" SSD1306** (I2C).
- [ ] Membaca sensor suhu, kelembaban, dan tekanan udara presisi tinggi **BME280** (I2C).
- [ ] Menyimpan data log sensor ke **MicroSD Card Module** (SPI).
- [ ] Membaca sensor suhu industri tahan air **DS18B20** (1-Wire).

### 1.8 Jembatan Menuju Mahir: FreeRTOS & Kehandalan Firmware
- [ ] Membuat multi-tasking terpisah pada Core 0 dan Core 1 (`xTaskCreatePinnedToCore`).
- [ ] Mengalirkan data antar-task secara thread-safe menggunakan FreeRTOS Queues dan Mutex.
- [ ] Menerapkan arsitektur Finite State Machine (FSM).
- [ ] Mengaktifkan **Hardware & Task Watchdog Timer (WDT)** dan proteksi *Brownout*.
- [ ] Profiling memori heap (`esp_get_free_heap_size()`) dan menerapkan *wear-leveling* pada LittleFS.

### 1.9 Pemecahan Masalah Pemula (Troubleshooting)
- [ ] Menguasai trik menahan tombol `BOOT` saat error upload serial.
- [ ] Mengatasi error `Brownout detector was triggered` dengan kapasitor buffer $100\mu\text{F}$.
- [ ] Melacak error `Guru Meditation panic` (pointer NULL / memory overflow).
- [ ] Mengonfigurasi jaringan Wi-Fi 2.4 GHz yang kompatibel dengan ESP32.

---

## 🛠️ Fase 2: Desain Perangkat Keras, Skematik & PCB 4-Layer KiCad (Minggu 7-8)
- [ ] Mendesain skematik terstruktur di KiCad 8.x (Sheet Power, MCU, Radio, Sensor, Aktuator).
- [ ] Merancang sirkuit catu daya: Buck Converter (MP2315), LDO ultra-low $I_q$ (AP2112K), dan proteksi TVS diode.
- [ ] Merancang sirkuit isolasi optocoupler dan *logic level shifter* 3.3V $\leftrightarrow$ 5V.
- [ ] Mendesain layout PCB 4-Layer (Signal - GND Solid Plane - Power Plane - Signal).
- [ ] Menghitung ketebalan jalur (*Trace Width*) berdasarkan standar IPC-2152.
- [ ] Menerapkan DFM: Menempatkan *Fiducial Marks* dan *Test Points* (Pogo-Pins).
- [ ] Mengekspor file produksi: Gerber RS-274X, Excellon Drill, BOM, dan CPL (Pick-and-Place).

---

## 🔋 Fase 3: Power Harvesting & Ultra Low-Power (10-Year Battery) (Minggu 9)
- [ ] Menerapkan **Hardware Nano-Timer (TI TPL5110 / TPL5010)** untuk *Power-Gating* fisik ($35\text{ nA}$ standby).
- [ ] Mengintegrasikan baterai primer industri **Lithium Thionyl Chloride ($Li-SOCl_2$)** vs LiFePO4.
- [ ] Menghitung kalkulasi matematis umur baterai berdasarkan profil konsumsi daya aktif vs tidur.
- [ ] Merancang sirkuit Solar MPPT menggunakan IC manajemen daya baterai **CN3791 / BQ25570**.

---

## 🚗 Fase 4: Protokol Industri & Otomotif (CAN Bus, Modbus, OPC-UA) (Minggu 10-11)
- [ ] Mengimplementasikan komunikasi kendaraan **CAN Bus (ISO 11898)** menggunakan peripheral bawaan ESP32 **TWAI**.
- [ ] Membaca data baterai EV / mesin menggunakan protokol **OBD-II & SAE J1939**.
- [ ] Menguasai sinyal diferensial **RS-485** dan implementasi protokol **Modbus RTU / TCP**.
- [ ] Mengintegrasikan Power Meter Listrik 3-Phase Schneider / PZEM-016.
- [ ] Menguasai standar industri **OPC-UA** dan implementasi payload **MQTT Sparkplug B**.

---

## 🏠 Fase 5: Ekosistem Nirkabel: Matter, LoRaWAN & Antares.id (Minggu 12-13)
- [ ] Membangun perangkat Smart Home dengan standar **Matter over Thread (ESP32-C6 / ESP32-H2)**.
- [ ] Membangun **OpenThread Border Router (OTBR)** pada Raspberry Pi.
- [ ] Mengoperasikan Private LoRaWAN Network Server menggunakan **ChirpStack v4** (AS923).
- [ ] **Platform Antares.id (Telkom Indonesia):**
  - [ ] Memahami arsitektur global **oneM2M**: CSE, AE, Container, dan ContentInstance (`cin`).
  - [ ] Mengirim dan membaca telemetri via HTTP REST, MQTT broker Antares, dan CoAP dengan header `X-M2M-Origin`.
  - [ ] Integrasi firmware menggunakan library resmi `AntaresESP32HTTP` / `AntaresESP32MQTT` dan Python SDK.
  - [ ] Mengatur *Subscription & Webhook* untuk meneruskan data dari Antares ke server backend kustom.
  - [ ] Menghubungkan perangkat ke jaringan publik **Telkom LoRaWAN (AS923)** di portal Antares.

---

## 🧠 Fase 6: Edge AI & TinyML pada Mikrokontroler (ESP32-S3) (Minggu 14)
- [ ] Ekstraksi fitur getaran dan audio menggunakan **ESP-DSP Fast Fourier Transform (FFT)**.
- [ ] Melakukan training dan kuantisasi model Machine Learning **INT8** di Edge Impulse / TensorFlow Lite Micro.
- [ ] Menjalankan inferensi on-device dengan akselerasi **Vector Instructions (SIMD)** ESP32-S3 untuk *Predictive Maintenance*.

---

## 🍓 Fase 7: Linux Edge Gateway (Raspberry Pi & Hardening OS) (Minggu 15-16)
- [ ] Menyiapkan Raspberry Pi OS Lite headless dengan akses SSH key-based.
- [ ] Mencegah korupsi SD Card menggunakan **OverlayFS (Read-Only Root Filesystem)** dan `log2ram`.
- [ ] Mengonfigurasi **Systemd Service** lengkap dengan restart policy otomatis.
- [ ] Menjalankan **Mosquitto MQTT Broker** lokal dengan otentikasi TLS dan bridging ke cloud.
- [ ] Menerapkan algoritma **Kalman Filter** pada Python Gateway untuk menghilangkan noise sensor.

---

## 💻 Fase 8: Distributed Cloud Ingestion & Time-Series Lakehouse (Minggu 17-19)
- [ ] Mengompresi payload data menggunakan **Protocol Buffers (Protobuf)** (menghemat kuota >80%).
- [ ] Menerapkan mekanisme **Store-and-Forward FIFO Queue** di LittleFS saat koneksi internet terputus.
- [ ] Menjalankan **EMQX Enterprise Cluster** dan mengintegrasikan **Apache Kafka / RabbitMQ** message stream.
- [ ] Membangun Ingestion Worker Service dengan **FastAPI / Go / NestJS**.
- [ ] Mendesain database relasional **PostgreSQL Multi-Tenant** dengan *Row-Level Security (RLS)*.
- [ ] Mengonfigurasi database time-series **TimescaleDB** (*Hypertables*, *Continuous Aggregates*, *Downsampling*).
- [ ] Mengarsipkan data historis ke Object Storage (S3 / MinIO) dalam format file biner **Apache Parquet**.
- [ ] Mengelola cache status perangkat (*Device Shadow State*) di **Redis**.

---

## 📊 Fase 9: Modern Frontend Dashboard (Next.js 15 & Digital Twin) (Minggu 20-21)
- [ ] Menerapkan pola sinkronisasi status **Digital Twin (Desired vs Reported State)**.
- [ ] Membangun antarmuka dashboard responsif dengan **Next.js 15**, TypeScript, dan Tailwind CSS.
- [ ] Memproses kalkulasi puluhan ribu data sensor di background browser menggunakan **Web Workers**.
- [ ] Merender grafik live 60 FPS menggunakan **Apache ECharts / uPlot**.
- [ ] Menampilkan pelacakan armada GPS di peta interaktif **Mapbox GL JS / Leaflet** dengan *Geofencing*.

---

## 📈 Fase 10: SRE, Observability & Distributed Tracing (OpenTelemetry) (Minggu 22)
- [ ] Mengirimkan metrik diagnostik kesehatan perangkat (*Device Vitals*: Heap, RSSI, Reset Reason).
- [ ] Menangkap crash log firmware secara otomatis dengan integrasi **Sentry for Native C++**.
- [ ] Melacak jejak satu paket data sensor dari ESP32 hingga database dengan **OpenTelemetry (OTel)**.
- [ ] Membangun dashboard pemantauan infrastruktur server di **Grafana & Prometheus**.

---

## 🛡️ Fase 11: Zero-Trust Security, Pen-Testing & Regulasi EU CRA (Minggu 23)
- [ ] Mengaktifkan **ESP32 Secure Boot v2** dengan tanda tangan digital RSA-3072 / ECDSA.
- [ ] Mengaktifkan **Hardware Flash Encryption AES-256** dan membakar *permanent eFuses*.
- [ ] Mengintegrasikan hardware crypto coprocessor **ATECC608A**.
- [ ] Menerapkan otentikasi dua arah **Mutual TLS (mTLS)** menggunakan sertifikat digital **X.509** per perangkat.
- [ ] Memahami kepatuhan regulasi siber global (**EU Cyber Resilience Act & NIST IR 8259**).
- [ ] Menghasilkan dokumen **Software Bill of Materials (SBOM)** dalam format SPDX / CycloneDX.
- [ ] Melakukan uji penetrasi perangkat keras (*Hardware Pen-Testing*).

---

## 🏭 Fase 12: Produksi Massal, Factory Test Jig, FinOps & Capstone (Minggu 24-26)
- [ ] Mendesain alat uji pabrik otomatis (**Factory Test Jig Fixture**) dengan jarum **Pogo-Pin**.
- [ ] Menulis script Python CLI otomatis untuk flashing firmware, injeksi sertifikat unik, dan uji fungsional <30 detik.
- [ ] Menghitung kelayakan finansial **BOM Costing & COGS**, serta optimasi cloud OPEX (<$0.05/device/bulan).
- [ ] Menyelesaikan salah satu proyek akhir komprehensif:
  - [ ] **Pilihan A:** Smart Factory Power Quality & Predictive Machine Maintenance (IIoT).
  - [ ] **Pilihan B:** Solar-Powered LoRaWAN Precision Smart Agriculture Grid.
  - [ ] **Pilihan C:** Cold-Chain Logistics & Pharmaceutical Asset Tracker.
- [ ] Mempublikasikan dokumentasi proyek, skematik, dan kode ke portofolio GitHub / LinkedIn.

---

> 💡 **Cara Menggunakan TODO Ini:**
> Setiap kali Anda menyelesaikan sebuah topik atau proyek, ubah tanda `- [ ]` menjadi `- [x]` dan buat *commit* ke GitHub repository agar perkembangan belajar Anda tercatat rapi dan dapat dipantau setiap hari!
