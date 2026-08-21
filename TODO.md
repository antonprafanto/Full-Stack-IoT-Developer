# 📋 Pelacak Progres & TODO: Fullstack IoT Developer (Zero to Enterprise)

> **Repositori GitHub:** [antonprafanto/Full-Stack-IoT-Developer](https://github.com/antonprafanto/Full-Stack-IoT-Developer)  
> **Panduan Kurikulum Lengkap:** [README.md](README.md)  
> **Terakhir Diperbarui:** 21 Agustus 2026

---

## 📊 Ringkasan Progres Keseluruhan

| Fase | Modul Pembelajaran | Estimasi Waktu | Status | Progres |
| :---: | :--- | :---: | :---: | :---: |
| **0** | Fondasi Listrik Ramah Pemula, Logika & Tooling | Minggu 1–2 | `[x] Selesai` | 100% |
| **1** | ESP32 Step-by-Step: Dari Blink ke FreeRTOS | Minggu 3–6 | `[-] Sedang Berjalan` | 10% |
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

## 🧠 Standar Emas Pedagogis & Prinsip Penulisan Materi (Editorial Guidelines)

> [!IMPORTANT]
> **Pondasi Mutlak Penulisan Semua Modul:**  
> Setiap materi yang ditulis untuk repositori ini wajib mematuhi **14 Prinsip Emas Pedagogis & Sains Kognitif** berikut agar selalu ramah awam, mudah dipahami, anti-stuck, dan menyenangkan:

1. 🌊 **Analogi Dunia Nyata (*Mental Models*):** Selalu awali konsep abstrak dengan analogi fisik (misal: Tegangan/Arus = Tandon & Aliran Air, Pointer C++ = Nomor Rumah).
2. ❓ **Jelaskan WHY, Bukan Cuma HOW:** Jelaskan alasan logis di balik setiap instruksi (misal: *Mengapa wajib pakai resistor pengaman LED? Mengapa wajib Common Ground?*).
3. 🪜 **Langkah Mikro Tanpa Lompatan Gaib (*Micro-Steps*):** Pecah instruksi ke dalam langkah 1-2-3 atomik tanpa berasumsi pembaca sudah tahu cara kerja terminal atau tombol boot.
4. 🚨 **Kotak Antisipasi Error (*Troubleshooting in Context*):** Sediakan kotak solusi *"Bagaimana jika lampu tidak menyala atau compiler error?"* di setiap bab.
5. 💬 **Komentar Penjelas di Setiap Baris Kode (*Inline Comments*):** Beri keterangan maksud setiap baris kode C++ dan Python dalam bahasa sehari-hari.
6. 🏆 **Prinsip *Quick Win* (Kemenangan Cepat):** Buat pembaca berhasil menyalakan lampu atau melihat hasil pertamanya dalam **5–10 menit pertama** untuk memicu motivasi belajar.
7. 🎨 **Visual-First & Diagram Rangkaian Nyata:** Gunakan ilustrasi visual komponen fisik (kaki LED, lubang breadboard, warna kabel standar) sebelum skematik simbol.
8. 🧩 **Manajemen Beban Kognitif (*One Concept at a Time*):** Jangan mencampuradukkan terlalu banyak istilah baru dalam 1 halaman. Letakkan kode dan diagram berdampingan.
9. 🛡️ **Keamanan Psikologis (*Emotional Safety*):** Tegaskan sejak awal bahwa listrik 3.3V/5V USB 100% aman disentuh, laptop memiliki proteksi USB, dan error/kegagalan adalah hal yang wajar.
10. 📖 **Dekonstruksi Istilah Asing (*Jargon De-escalation*):** Setiap istilah teknis wajib diberi keterangan 1 kalimat bahasa manusia saat pertama kali muncul + Glosarium di akhir bab.
11. 🔄 **Siklus 4-Tahap Belajar Aktif (*Observe $\rightarrow$ Predict $\rightarrow$ Break $\rightarrow$ Create*):** Ajak pembaca menebak perubahan sebelum klik run, sengaja merusak sirkuit untuk belajar melacak error, lalu membuat tantangan mandiri.
12. 🥪 **Metode "Sandwich" (Praktik Cepat $\rightarrow$ Teori Mengapa $\rightarrow$ Eksperimen):** Hindari teori panjang di awal; biarkan mencoba dulu, baru dibedah teorinya.
13. 📉 **Bantuan Bertahap (*Faded Scaffolding*):** Dari kode 100% lengkap $\rightarrow$ kode rumpang (*fill-in-the-blanks*) $\rightarrow$ template kosong $\rightarrow$ tantangan mandiri tanpa contekan.
14. 🚀 **Jalur Ganda Pembelajaran (*Dual-Track: Fast-Track vs Deep-Dive*):** Gunakan blok lipat `<details><summary>🔬 Bedah Teknis Mendalam</summary>...</details>` untuk ulasan mendalam tanpa membebani pemula.

---

## ⚡ Fase 0: Fondasi Listrik Ramah Pemula, Logika Komponen & Pemrograman Inti (Minggu 1-2)

### 0.0 Pengantar Konseptual: "Bagaimana Kode Masuk ke Chip Silikon?"
> Materi: [00-bagaimana-kode-masuk-ke-chip-silikon.md](00-fondasi-dasar/00-bagaimana-kode-masuk-ke-chip-silikon.md) · Tinjauan GitHub live 21 Agustus 2026 malam: 9/9 gambar tampil. Screenshot Wokwi dipindah ke setelah Play; peringatan `delay(____)` agar tidak tertempel mentah.
- [x] Memahami perbedaan Komputer vs Mikrokontroler (*Bare-Metal Execution*).
- [x] Memahami alur kompilasi: Kode C++ (`.cpp` / `.ino`) $\rightarrow$ Kompiler (*xtensa-gcc*) $\rightarrow$ Biner `.bin` $\rightarrow$ Chip USB-to-UART (CP2102/CH340) $\rightarrow$ SPI Flash.
- [x] Menginstal driver USB-to-UART (CH340/CP2102) dan mendeteksi port COM di Windows Device Manager.
- [x] Memahami fungsi tombol fisik `EN` (Reset) dan `BOOT` (GPIO 0) saat proses flashing.
- [x] Praktik cepat di Wokwi (tanpa akun, tab `sketch.ino`, tombol Start the simulation) sebelum teori panjang.
- [x] Visual: foto board berlisensi, ilustrasi alur/anatomi/kabel/tombol, plus tangkapan layar Wokwi dengan sitasi.

### 0.1 Dasar Listrik Intuitif (Analogi Aliran Air)
- [x] Memahami konsep Tegangan ($V$), Arus ($I$), Hambatan ($R$), dan Daya Listrik ($P$).
- [x] Menghitung resistor pengaman LED menggunakan Hukum Ohm ($R = \frac{V_s - V_{led}}{I}$).
- [x] Memahami perbedaan arus listrik DC (3.3V / 5V) vs AC (220V).

### 0.2 Anatomi Breadboard & Komponen Fisik (Anti-Korslet)
- [x] Memahami jalur plat tembaga internal breadboard (*Power Rails* horizontal vs *Terminal Strips* vertikal).
- [x] Mengidentifikasi kaki polaritas anoda/katoda pada LED, kapasitor elektrolit, dan orientasi dioda.
- [x] Membaca kode warna resistor ($220\Omega, 1k\Omega, 10k\Omega$) dan memverifikasi dengan multimeter.
- [x] Menggunakan kabel jumper (*Male-to-Male*, *Male-to-Female*, *Female-to-Female*) secara tepat.

### 0.3 Logika Sirkuit Dasar & Fenomena Penting IoT
- [x] **Prinsip Mutlak Common Ground (GND Sharing):** Menghubungkan semua GND perangkat agar memiliki titik acuan 0V yang sama.
- [x] Menghitung dan merakit rangkaian pembagi tegangan (*Voltage Divider*) untuk sensor analog LDR.
- [x] Memahami fenomena *Floating Pin* dan memasang resistor Pull-up / Pull-down.
- [x] Menggunakan transistor / relay sebagai sakelar pengontrol beban daya tinggi.
- [x] Menggunakan Multimeter Digital (True RMS) untuk mengukur voltase, kontinuitas 'beep', dan resistansi.

### 0.4 Pemrograman C/C++ dari Nol (Khusus Embedded)
- [x] Memahami struktur eksekusi `setup()` dan `loop()`.
- [x] Menguasai tipe data fixed-width (`uint8_t`, `int16_t`, `int32_t`, `float`, `bool`).
- [x] Memahami perbedaan Scope Variabel (Variabel Global di SRAM vs Variabel Lokal di Stack).
- [x] Menguasai percabangan (`if-else`, `switch-case`) dan perulangan (`for`, `while`).
- [x] Membuat fungsi kustom dengan parameter dan return value.
- [x] Menguasai array buffer data sensor (`int readings[10]`).
- [x] Memahami konsep memori dan pointer (`&` dan `*`) dengan analogi nomor rumah.
- [x] Memahami manipulasi bitwise dasar (`&`, `|`, `^`, `<<`, `>>`).

### 0.5 Pemrograman Python dari Nol (Khusus Gateway & Cloud)
- [x] Menguasai tipe data dasar, List `[]`, Dictionary `{}` (format JSON), dan Tuples.
- [x] Menguasai fungsi, modul, dan manajemen paket virtual environment (`venv` / `uv`).
- [x] Memahami dasar pemrograman asinkron (`asyncio`, `await`).

### 0.6 Setup Lingkungan Belajar (Tools & Simulator Virtual)
- [x] Instalasi **VS Code** dan ekstensi **PlatformIO IDE**.
- [x] Uji coba simulasi rangkaian ESP32 pertama di browser menggunakan **Wokwi Simulator**.
- [x] Setup Git repository dan GitHub untuk menyimpan kode latihan.

---

## 🔌 Fase 1: Langkah Demi Langkah Mikrokontroler ESP32 — Dari Blink ke FreeRTOS (Minggu 3-6)

### 1.1 Anatomi Board ESP32 & Aturan Pinout Aman
- [x] Memetakan Pin Aman (GPIO 4, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33).
- [x] Memahami Pin Input-Only (GPIO 34, 35, 36, 39) dan Strapping Pins bahaya (GPIO 0, 2, 12, 15).
- [x] Memahami aturan ADC1 vs ADC2 (ADC2 tidak dapat dipakai saat Wi-Fi menyala).

### 1.2 Proyek 1: Digital Output (LED & Aktuator)
- [ ] Menulis program Blink LED internal dan eksternal (`pinMode`, `digitalWrite`).
- [ ] Membuat pola running LED dan memahami logika *Active High* vs *Active Low*.

### 1.3 Proyek 2: Digital Input & Push Button
- [ ] Membaca status tombol dengan `pinMode(pin, INPUT_PULLUP)` dan `digitalRead(pin)`.
- [ ] Membuat logika toggle switch (tekan sekali ON, tekan lagi OFF).
- [ ] Mengimplementasikan *Software Debouncing* untuk mengatasi getaran mekanik tombol.

### 1.4 Proyek 3: Serial Communication & Debugging
- [ ] Inisialisasi `Serial.begin(115200)` dan mencetak variabel data sensor.
- [ ] Menangani baud rate mismatch penyebab karakter rusak.
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

## 🛠️ Fase 2: Desain Perangkat Keras, Skematik, Multi-Layer PCB & DFM (Minggu 7-8)

### 2.1 Desain Skematik Profesional (KiCad 8.x)
- [ ] Merancang skematik modular (Sheet: Power, MCU, Radio, Analog Sensor, Digital Bus).
- [ ] Mendesain sirkuit catu daya: Reverse Polarity P-MOSFET, Polyfuse PTC, dan TVS Diode.
- [ ] Merancang Step-Down Buck Converter (MP2315 / TPS62130) dengan ripple <20mV.
- [ ] Merancang sirkuit LDO ultra-low quiescent current (AP2112K / TPS7A02) $I_q < 25\text{nA}$.
- [ ] Merancang isolasi optocoupler (PC817 / 6N137) dan *Logic Level Shifter* (TXS0108E) 3.3V $\leftrightarrow$ 5V.

### 2.2 Desain Layout PCB 4-Layer & Signal Integrity
- [ ] Mengonfigurasi Layer Stackup 4-Layer: Signal - GND Solid Plane - Power Plane - Signal.
- [ ] Memastikan integritas sinyal dan kontinuitas jalur *Ground Return Path*.
- [ ] Menghitung ketebalan jalur (*Trace Width*) berdasarkan standar IPC-2152 untuk jalur arus tinggi.
- [ ] Menjaga impedansi terkontrol $50\Omega$ dan area *keep-out* di bawah antena onboard ESP32.
- [ ] Menempatkan kapasitor decoupling sedekat mungkin (<2mm) dengan pin VDD chip.

### 2.3 DFM (Design for Manufacturing) & DFA (Design for Assembly)
- [ ] Menempatkan 3 titik *Fiducial Marks* optik untuk kalibrasi mesin otomatis Pick-and-Place.
- [ ] Menempatkan *Test Points (TP)* untuk kontak jarum Pogo-Pin alat penguji pabrik.
- [ ] Mengekspor file manufaktur lengkap: Gerber RS-274X, Excellon Drill, BOM, dan CPL/Centroid.

---

## 🔋 Fase 3: Power Harvesting & Ultra Low-Power Engineering (10-Year Lifespan) (Minggu 9)

### 3.1 Teknik Pemutusan Daya Nano-Power (Power-Gating)
- [ ] Mengintegrasikan **Hardware Nano-Timer (TI TPL5110 / TPL5010)** untuk memutus daya 100% saat standby ($35\text{ nA}$).
- [ ] Menghubungkan pin DONE dari ESP32 untuk memicu siklus power-down kembali ke timer nano.

### 3.2 Kimia Baterai Industri & Perhitungan Umur Baterai
- [ ] Menganalisis karakteristik baterai primer industri **Lithium Thionyl Chloride ($Li-SOCl_2$ ER14505)** vs LiFePO4.
- [ ] Menghitung estimasi matematis umur baterai berdasarkan profil arus aktif vs tidur.

### 3.3 Pemanenan Energi (*Energy Harvesting*)
- [ ] Merancang sirkuit Solar Panel MPPT menggunakan IC **CN3791 / BQ25570**.
- [ ] Mengevaluasi opsi pemanenan energi alternatif: Piezoelectric dan Thermoelectric Generator (TEG).

---

## 🚗 Fase 4: Protokol Industri & Otomotif — CAN Bus, RS-485, OPC-UA & Sparkplug B (Minggu 10-11)

### 4.1 Otomotif & Heavy Duty: CAN Bus (TWAI)
- [ ] Mengimplementasikan komunikasi fisik **CAN Bus (ISO 11898)** menggunakan peripheral bawaan ESP32 **TWAI**.
- [ ] Membaca data parameter kendaraan / BMS Baterai EV menggunakan protokol **OBD-II & SAE J1939**.

### 4.2 Standar Pabrik Cerdas: OPC-UA & MQTT Sparkplug B
- [ ] Menguasai sinyal diferensial **RS-485** dan implementasi protokol **Modbus RTU / Modbus TCP**.
- [ ] Mengintegrasikan Power Meter Listrik 3-Phase industri (Schneider IEM / PZEM-016).
- [ ] Mempelajari arsitektur protokol **OPC-UA** untuk integrasi PLC industri.
- [ ] Mengimplementasikan format data standar **MQTT Sparkplug B** (*NBIRTH*, *NDEATH*, *DDATA*).

---

## 🏠 Fase 5: Ekosistem Nirkabel & Platform Enterprise — Matter, LoRaWAN & Antares.id (Minggu 12-13)

### 5.1 Standar Smart Home Global: Matter & Thread Protocol
- [ ] Membangun perangkat Smart Home dengan standar **Matter over Thread (ESP32-C6 / ESP32-H2)**.
- [ ] Membangun **OpenThread Border Router (OTBR)** pada Raspberry Pi untuk menjembatani jaringan IPv6 Thread.

### 5.2 Bluetooth Low Energy (BLE) Mesh
- [ ] Membangun topologi jaringan **BLE Mesh** (Relay Node, Friend Node, Low Power Node).

### 5.3 LoRaWAN & Private ChirpStack Network
- [ ] Mengoperasikan Private LoRaWAN Network Server menggunakan **ChirpStack v4** pada frekuensi AS923.
- [ ] Mengonfigurasi parameter RF: Spreading Factor (SF7-SF12), Bandwidth (125 kHz), dan Adaptive Data Rate (ADR).

### 5.4 Standar Global oneM2M & Integrasi Platform Antares.id (Telkom Indonesia)
- [ ] Memahami hirarki standar internasional **oneM2M**: CSE, AE, Container, dan ContentInstance (`cin`).
- [ ] Mengirim dan membaca data telemetri via HTTP REST, MQTT, dan CoAP dengan header `X-M2M-Origin`.
- [ ] Mengintegrasikan library resmi `AntaresESP32HTTP` / `AntaresESP32MQTT` dan Python SDK.
- [ ] Mengonfigurasi *Subscription & Webhook* untuk meneruskan data dari Antares ke Cloud Backend kustom.
- [ ] Mendaftarkan perangkat ke jaringan publik **Telkom LoRaWAN (AS923)** di portal Antares.

---

## 🧠 Fase 6: Edge AI & TinyML pada Mikrokontroler (ESP32-S3) (Minggu 14)

### 6.1 Digital Signal Processing (DSP) di Edge
- [ ] Melakukan analisis spektrum sinyal getaran dan audio menggunakan **ESP-DSP Fast Fourier Transform (FFT)**.
- [ ] Mengekstraksi fitur domain frekuensi (*MFCC*) untuk deteksi anomali mekanik mesin.

### 6.2 Implementasi TinyML (TensorFlow Lite Micro & Edge Impulse)
- [ ] Melatih dan menguantisasi model machine learning ke format **INT8** di Edge Impulse / TensorFlow Lite Micro.
- [ ] Menjalankan inferensi on-device dengan akselerasi **Vector Instructions (SIMD)** pada ESP32-S3.
- [ ] Mengembangkan sistem *Predictive Maintenance* dan Vision AI (ESP32-CAM OCR meteran analog).

---

## 🍓 Fase 7: Linux Edge Gateway, Hardening OS & Local Edge Analytics (Minggu 15-16)

### 7.1 Linux OS Hardening & Read-Only Filesystem
- [ ] Menyiapkan Raspberry Pi OS Lite headless dengan akses SSH key-based yang aman.
- [ ] Mencegah kerusakan partisi SD Card menggunakan **OverlayFS (Read-Only Root Filesystem)** dan `log2ram`.
- [ ] Mengonfigurasi **Systemd Service** dengan restart policy otomatis dan resource limits.

### 7.2 Local Ingestion & Edge Filter
- [ ] Menjalankan **Eclipse Mosquitto Broker** lokal dengan otentikasi TLS dan bridging ke cloud.
- [ ] Menerapkan algoritma **Kalman Filter** pada Python Gateway untuk mereduksi noise sinyal sensor.
- [ ] Menyimpan data lokal secara offline selama 30 hari menggunakan **DuckDB / SQLite**.

---

## 💻 Fase 8: Distributed Cloud Ingestion, Stream Processing & Time-Series Lakehouse (Minggu 17-19)

### 8.1 Ingestion Berbasis Stream (EMQX Cluster & Apache Kafka)
- [ ] Mengompresi payload data menggunakan **Protocol Buffers (Protobuf)** (menghemat kuota >80%).
- [ ] Menerapkan mekanisme **Store-and-Forward FIFO Queue** di LittleFS saat offline.
- [ ] Menjalankan **EMQX Enterprise Cluster** dan mengintegrasikan **Apache Kafka / RabbitMQ** stream.
- [ ] Membangun Ingestion Worker Service paralel dengan **FastAPI / Go / NestJS** dan proteksi *Dead-Letter Queue*.

### 8.2 Database Multi-Tenant, Time-Series & Data Lake
- [ ] Mendesain database relasional **PostgreSQL Multi-Tenant** dengan *Row-Level Security (RLS)*.
- [ ] Mengonfigurasi database time-series **TimescaleDB** (*Hypertables*, *Continuous Aggregates*, *Downsampling*).
- [ ] Mengarsipkan data historis ke Object Storage (S3 / MinIO) dalam format file biner **Apache Parquet**.
- [ ] Mengelola cache status perangkat (*Device Shadow State*) di **Redis**.

---

## 📊 Fase 9: Modern Frontend, Real-time Visualisasi 60 FPS & Pola Digital Twin (Minggu 20-21)

### 9.1 Digital Twin State Flow (Desired vs Reported State)
- [ ] Menerapkan sinkronisasi status **Desired State** (perintah pengguna) vs **Reported State** (status fisik nyata).
- [ ] Menangani jeda jaringan (*latency*) dengan pola *Optimistic UI Updates* dan notifikasi kegagalan jika offline.

### 9.2 Arsitektur Frontend Next.js 15 & Visualisasi Data Masif
- [ ] Membangun antarmuka dashboard responsif dengan **Next.js 15**, TypeScript, dan Tailwind CSS.
- [ ] Memproses parsing 100.000 titik data sensor di background thread menggunakan **Web Workers**.
- [ ] Merender grafik real-time 60 FPS menggunakan **Apache ECharts / uPlot**.
- [ ] Menampilkan pelacakan armada GPS di peta interaktif **Mapbox GL JS / Leaflet** dengan *Geofencing*.

---

## 📈 Fase 10: Observability, SRE & Telemetri Armada (OpenTelemetry & Sentry) (Minggu 22)

### 10.1 Telemetri Kesehatan Perangkat (*Device Vitals*)
- [ ] Mengirim metrik diagnostik berkala: Free Heap, Minimum Heap Watermark, Wi-Fi RSSI, Tegangan Baterai, dan Reset Reason.
- [ ] Menangkap crash log firmware secara otomatis dengan integrasi **Sentry for Native C++**.

### 10.2 Distributed Tracing & Cloud Monitoring (OpenTelemetry & Prometheus)
- [ ] Melacak jejak satu paket data sensor dari ESP32 hingga database dengan **OpenTelemetry (OTel)**.
- [ ] Membangun dashboard pemantauan infrastruktur server di **Grafana & Prometheus**.

---

## 🛡️ Fase 11: Zero-Trust Hardware Security, Pen-Testing & Kepatuhan Siber Global (Minggu 23)

### 11.1 Keamanan Tingkat Silikon & Enkripsi Hardware
- [ ] Mengaktifkan **ESP32 Secure Boot v2** dengan tanda tangan digital RSA-3072 / ECDSA.
- [ ] Mengaktifkan **Hardware Flash Encryption AES-256** dan membakar *permanent eFuses*.
- [ ] Mengintegrasikan hardware crypto coprocessor **ATECC608A**.
- [ ] Menerapkan otentikasi dua arah **Mutual TLS (mTLS)** menggunakan sertifikat digital **X.509** per perangkat.

### 11.2 Kepatuhan Regulasi Internasional & Pengujian Penetrasi
- [ ] Memahami kepatuhan regulasi siber global (**EU Cyber Resilience Act & NIST IR 8259**).
- [ ] Menghasilkan dokumen **Software Bill of Materials (SBOM)** dalam format SPDX / CycloneDX.
- [ ] Melakukan uji penetrasi perangkat keras (*Hardware Pen-Testing* sniffing bus SPI/UART).

---

## 🏭 Fase 12: Produksi Massal, Factory Test Jig, BOM FinOps & Capstone Final (Minggu 24-26)

### 12.1 Merancang Factory Test Jig (Alat Penguji Pabrik Otomatis)
- [ ] Mendesain alat uji pabrik otomatis (**Factory Test Jig Fixture**) dengan jarum **Pogo-Pin**.
- [ ] Menulis script Python CLI otomatis untuk flashing firmware, injeksi sertifikat unik, dan uji fungsional <30 detik.

### 12.2 Financial Engineering & FinOps IoT
- [ ] Menghitung kelayakan finansial **BOM Costing & COGS** (komponen, PCB, SMT, casing, packaging).
- [ ] Mengoptimalkan biaya operasional cloud (OPEX) agar berada di bawah **\$0.02 – \$0.05 per perangkat per bulan**.

### 12.3 Proyek Akhir Enterprise (Industrial Capstone Projects)
- [ ] Menyelesaikan salah satu proyek akhir komprehensif:
  - [ ] **Pilihan A:** Smart Factory Power Quality & Predictive Machine Maintenance (IIoT).
  - [ ] **Pilihan B:** Solar-Powered LoRaWAN Precision Smart Agriculture Grid.
  - [ ] **Pilihan C:** Cold-Chain Logistics & Pharmaceutical Asset Tracker.
- [ ] Mempublikasikan dokumentasi proyek, skematik, dan kode ke portofolio GitHub / LinkedIn.

---

> 💡 **Cara Menggunakan TODO Ini:**
> Setiap kali Anda menyelesaikan sebuah sub-topik atau proyek, ubah tanda `- [ ]` menjadi `- [x]` dan buat *commit* ke GitHub repository agar perkembangan belajar Anda tercatat rapi dan dapat dipantau setiap hari!
