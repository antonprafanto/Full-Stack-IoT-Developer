# ⚙️ Modul 1.5: FreeRTOS Dual-Core, Thread-Safe Queues & Panduan Anti-Crash (WDT)

> **Fase 1: Rekayasa Hardware & Sensor ESP32**  
> **Target Pembaca:** Pengembang yang ingin mengoptimalkan kedua prosesor inti ESP32 (Core 0 & Core 1), mencegah kebocoran memori RAM, dan membangun perangkat yang 100% tahan banting dari kondisi *hang / freeze*.  
> **Estimasi Waktu Belajar:** 50–60 Menit  
> **Alat Praktik:** [Wokwi Simulator ESP32](https://wokwi.com/esp32)

---

## 🧭 Daftar Isi Modul
1. [ESP32 Memiliki 2 Otak Prosesor (Dual-Core): Mengapa Ini Mengubah Segalanya?](#1-esp32-memiliki-2-otak-prosesor-dual-core-mengapa-ini-mengubah-segalanya)
2. [Menjalankan Tugas Terpisah pada Core 0 dan Core 1 (`xTaskCreatePinnedToCore`)](#2-menjalankan-tugas-terpisah-pada-core-0-dan-core-1-xtaskcreatepinnedtocore)
3. [Aliran Data Aman Antar-Core: FreeRTOS Queues & Mutex Semaphore](#3-aliran-data-aman-antar-core-freertos-queues--mutex-semaphore)
4. [Malaikat Penjaga Sistem: Hardware & Task Watchdog Timer (WDT)](#4-malaikat-penjaga-sistem-hardware--task-watchdog-timer-wdt)
5. [Mencegah Memori Bocor: Heap Profiling (`esp_get_free_heap_size`)](#5-mencegah-memori-bocor-heap-profiling-esp_get_free_heap_size)
6. [Menjaga Umur Flash SPI: Sistem File LittleFS & Wear-Leveling](#6-menjaga-umur-flash-spi-sistem-file-littlefs--wear-leveling)
7. [Kompilasi Troubleshooting Pemula: 5 Masalah Paling Sering & Solusinya](#7-kompilasi-troubleshooting-pemula-5-masalah-paling-sering--solusinya)
8. [Laboratorium Praktik: Dual-Core FreeRTOS Pipeline di Wokwi](#8-laboratorium-praktik-dual-core-freertos-pipeline-di-wokwi)
9. [Glosarium & Rangkuman Fase 1](#9-glosarium--rangkuman-fase-1)

---

## 1. ESP32 Memiliki 2 Otak Prosesor (Dual-Core): Mengapa Ini Mengubah Segalanya?

Sebagian besar mikrokontroler murah (seperti Arduino Uno) hanya memiliki 1 inti prosesor. Jika prosesor tersebut sedang sibuk mengirim data ke internet, pembacaan sensor getaran mesin akan terlewatkan.

ESP32 memiliki **2 inti prosesor Xtensa 32-bit (Core 0 dan Core 1)** yang bekerja berdampingan pada kecepatan $240\text{ MHz}$:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARSITEKTUR DUAL-CORE ESP32                      │
├────────────────────────────────────────────────────────────────────────┤
│  CORE 0 (Protocol Core)       │  CORE 1 (Application Core)             │
│  • Mengelola Wi-Fi & Bluetooth│  • Membaca Sensor Lingkungan           │
│  • Enkripsi TLS & MQTT Socket │  • Mengontrol Motor & Aktuator         │
│  • FreeRTOS Background Tasks  │  • Eksekusi setup() & loop() standar   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Menjalankan Tugas Terpisah pada Core 0 dan Core 1 (`xTaskCreatePinnedToCore`)

Dengan FreeRTOS, kita bisa menugaskan sebuah fungsi agar berjalan **khusus di Core 0**, sementara fungsi lain berjalan di **Core 1**:

```cpp
TaskHandle_t TaskSensorHandle;
TaskHandle_t TaskKirimHandle;

// TUGAS A: Berjalan di Core 0 (Khusus Pengiriman Data)
void TaskKirimData(void *parameter) {
  for (;;) {
    Serial.printf("[Core %d] 📡 Mengirim data ke Cloud...\n", xPortGetCoreID());
    vTaskDelay(3000 / portTICK_PERIOD_MS); // vTaskDelay adalah delay non-blocking FreeRTOS
  }
}

// TUGAS B: Berjalan di Core 1 (Khusus Pembacaan Sensor Cepat)
void TaskBacaSensor(void *parameter) {
  for (;;) {
    Serial.printf("[Core %d] 🌡️ Membaca Sensor Suhu...\n", xPortGetCoreID());
    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

void setup() {
  Serial.begin(115200);

  // Sematkan Tugas A ke CORE 0
  xTaskCreatePinnedToCore(
    TaskKirimData,    // Nama fungsi
    "KirimData",      // Nama deskriptif task
    4096,             // Ukuran Stack Memori (4 KB)
    NULL,             // Parameter
    1,                // Prioritas Task (1 = Normal)
    &TaskKirimHandle, // Handle
    0                 // NOMOR CORE (0)
  );

  // Sematkan Tugas B ke CORE 1
  xTaskCreatePinnedToCore(
    TaskBacaSensor,
    "BacaSensor",
    4096,
    NULL,
    1,
    &TaskSensorHandle,
    1                 // NOMOR CORE (1)
  );
}

void loop() {
  // Loop utama bisa dibiarkan kosong karena FreeRTOS yang mengatur kedua task!
  vTaskDelay(1000 / portTICK_PERIOD_MS);
}
```

---

## 3. Aliran Data Aman Antar-Core: FreeRTOS Queues & Mutex Semaphore

Jika Core 0 dan Core 1 mencoba menulis ke variabel global yang sama pada mikrodetik yang persis sama, nilai variabel tersebut akan rusak (*Race Condition*).

### 📬 Solusi: FreeRTOS Queue (Pipa Antrean Thread-Safe):
Core 1 memasukkan data sensor ke dalam "pipa antrean", dan Core 0 mengambil data dari pipa tersebut untuk dikirim ke internet:

```
    [ CORE 1: Sensor ] ──► [ PIPA ANTREAN (QUEUE) ] ──► [ CORE 0: Wi-Fi MQTT ]
                            (Data 1 ➔ Data 2 ➔ Data 3)
```

```cpp
// Buat struktur paket data
struct PaketSensor {
  float suhu;
  float kelembaban;
};

QueueHandle_t antreanSensor;

void setup() {
  Serial.begin(115200);
  // Buat pipa antrean berkapasitas 10 paket
  antreanSensor = xQueueCreate(10, sizeof(PaketSensor));
}
```

---

## 4. Malaikat Penjaga Sistem: Hardware & Task Watchdog Timer (WDT)

Apa yang terjadi jika perangkat IoT Anda dipasang di tiang sensor tengah sawah, lalu kodenya mengalami *infinite loop* atau jaringan internet macet total? Tidak ada manusia yang bisa menekan tombol Reset fisik di sana.

**Watchdog Timer (WDT)** adalah "anjing penjaga" perangkat keras:
- Anda menyetel timer WDT selama **5 Detik**.
- Kode program Anda wajib "memberi makan anjing" (`esp_task_wdt_reset()`) secara berkala.
- **Jika program mengalami *freeze* lebih dari 5 detik dan lupa memberi makan, Watchdog otomatis me-restart paksa chip ESP32 detik itu juga!**

```cpp
#include <esp_task_wdt.h>

#define WDT_TIMEOUT_SECONDS 5 // Batas waktu 5 detik

void setup() {
  Serial.begin(115200);
  
  // Inisialisasi Watchdog Timer
  esp_task_wdt_config_t wdt_config = {
    .timeout_ms = WDT_TIMEOUT_SECONDS * 1000,
    .idle_core_mask = (1 << 0) | (1 << 1),
    .trigger_panic = true
  };
  esp_task_wdt_init(&wdt_config);
  esp_task_wdt_add(NULL); // Daftarkan task saat ini ke pemantauan WDT
}

void loop() {
  // Jalankan tugas rutin...
  
  // Beri makan Watchdog agar ESP32 tidak me-restart
  esp_task_wdt_reset();
  
  delay(1000);
}
```

---

## 5. Mencegah Memori Bocor: Heap Profiling (`esp_get_free_heap_size`)

**Memory Leak (Kebocoran RAM)** terjadi jika Anda membuat variabel dinamis (seperti objek String C++ berulang-ulang) yang tidak pernah dihapus dari memori. Awalnya program tampak lancar, tetapi setelah 3 hari menyala, RAM habis dan ESP32 mengalami crash mendadak.

### 🔍 Cara Memantau Kesehatan Memori RAM Real-Time:

```cpp
void pantauMemori() {
  uint32_t sisaRAM = esp_get_free_heap_size();
  uint32_t titikTerendahRAM = esp_get_minimum_free_heap_size();

  Serial.printf("📊 Sisa RAM: %d Byte | Titik RAM Terendah: %d Byte\n", sisaRAM, titikTerendahRAM);

  if (sisaRAM < 20000) { // Kurang dari 20 KB
    Serial.println("🚨 PERINGATAN: Memori RAM hampir habis!");
  }
}
```

---

## 6. Menjaga Umur Flash SPI: Sistem File LittleFS & Wear-Leveling

Chip memori SPI Flash (tempat menyimpan file konfigurasi Wi-Fi atau data log offline) memiliki batas ketahanan fisik: **hanya bisa ditulis sekitar 100.000 kali**.

- ❌ **SPIFFS (Lama):** Selalu menulis ke sektor memori yang sama $\rightarrow$ sektor tersebut cepat rusak dalam beberapa bulan.
- ✅ **LittleFS (Standar Modern):** Dilengkapi teknologi **Wear-Leveling**. Menulis data secara bergilir ke seluruh area flash sehingga chip mampu bertahan bertahun-tahun tanpa ada sektor yang rusak!

---

## 7. Kompilasi Troubleshooting Pemula: 5 Masalah Paling Sering & Solusinya

> [!CAUTION]
> ### 🛠️ 5 Kasus Error Klasik Pemula & Cara Mengatasinya:

| Gejala Masalah | Penyebab Utama | Solusi Pasti |
| :--- | :--- | :--- |
| **1. `A fatal error occurred: Failed to connect to ESP32`** | ESP32 tidak otomatis masuk ke mode download saat kabel USB dicolok. | **Tahan tombol fisik `BOOT`**, klik tombol Upload di laptop, lalu lepaskan tombol BOOT begitu tulisan `Writing at 0x00001000...` muncul. |
| **2. `Brownout detector was triggered`** | Tegangan listrik drop di bawah 2.8V sesaat saat modem Wi-Fi menyedot arus besar. | Pasang **Kapasitor Elektrolit $100\mu\text{F} - 470\mu\text{F}$** di antara pin `3V3` dan `GND` ESP32, atau gunakan kabel USB berkualitas tebal. |
| **3. `Guru Meditation Error: Core 1 panic'ed`** | Pointer bernilai NULL atau variabel memori di luar batas array (*Buffer Overflow*). | Cek apakah ada variabel pointer yang belum dialokasikan memori, atau periksa indeks array yang melebihi kapasitasnya. |
| **4. Wi-Fi Gagal Terkoneksi Terus Menerus** | Router Wi-Fi Anda memancarkan frekuensi 5.0 GHz saja. | ESP32 standar hanya mendukung frekuensi **2.4 GHz**. Pastikan SSID 2.4 GHz diaktifkan pada pengaturan router Anda. |
| **5. Pembacaan ADC selalu bernilai 4095** | Menggunakan pin ADC2 saat Wi-Fi menyala, atau pin sensor tidak terhubung (*floating*). | Pindahkan sensor ke kelompok **ADC1 (GPIO 32, 33, 34, 35, 36, 39)**. |

---

## 8. Laboratorium Praktik: Dual-Core FreeRTOS Pipeline di Wokwi

Mari kita uji coba sistem pemrosesan paralel dua inti prosesor lengkap dengan FreeRTOS Queue di simulator!

### 💻 Kode Siap Jalankan di [wokwi.com/esp32](https://wokwi.com/esp32):

```cpp
// ==========================================================
// PRAKTIK MODUL 1.5: DUAL-CORE QUEUE PIPELINE
// ==========================================================
struct Telemetri {
  int sensorId;
  float suhu;
};

QueueHandle_t antreanData;

// TASK PRODUCER (Core 1): Membaca Sensor Tiap 1 Detik
void TaskProducer(void *pvParameters) {
  int counter = 1;
  for (;;) {
    Telemetri data;
    data.sensorId = counter++;
    data.suhu = 25.0 + (random(0, 150) / 10.0); // 25.0 - 40.0 C

    // Kirim data ke antrean
    xQueueSend(antreanData, &data, portMAX_DELAY);
    Serial.printf("[CORE %d] 📥 Sensor #%d Dibaca: %.1f C (Masuk Queue)\n", xPortGetCoreID(), data.sensorId, data.suhu);

    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

// TASK CONSUMER (Core 0): Mengolah & Mengirim Data Tiap 2 Detik
void TaskConsumer(void *pvParameters) {
  Telemetri dataTerima;
  for (;;) {
    // Ambil data dari antrean jika tersedia
    if (xQueueReceive(antreanData, &dataTerima, portMAX_DELAY) == pdPASS) {
      Serial.printf("        [CORE %d] 🚀 Data #%d Diproses & Dikirim ke Cloud: %.1f C\n", xPortGetCoreID(), dataTerima.sensorId, dataTerima.suhu);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Buat antrean berkapasitas 5 item
  antreanData = xQueueCreate(5, sizeof(Telemetri));

  // Jalankan Task Producer di CORE 1
  xTaskCreatePinnedToCore(TaskProducer, "Producer", 2048, NULL, 1, NULL, 1);

  // Jalankan Task Consumer di CORE 0
  xTaskCreatePinnedToCore(TaskConsumer, "Consumer", 2048, NULL, 1, NULL, 0);
}

void loop() {
  vTaskDelay(1000 / portTICK_PERIOD_MS);
}
```

---

## 9. Glosarium & Rangkuman Fase 1

| Istilah | Definisi Sederhana |
| :--- | :--- |
| **FreeRTOS** | Sistem operasi waktu-nyata (*Real-Time Operating System*) open-source untuk mikrokontroler. |
| **Queue** | Struktur data antrean First-In-First-Out (FIFO) yang thread-safe untuk komunikasi antar-prosesor. |
| **Watchdog Timer (WDT)** | Penghitung waktu darurat perangkat keras yang me-restart chip otomatis jika terjadi kebuntuan (*hang*). |
| **LittleFS** | Sistem file flash modern yang ringan dan memiliki perlindungan *wear-leveling* serta tahan mati listrik mendadak. |

---

> 🎉 **SELAMAT! ANDA TELAH MENUNTASKAN SELURUH FASE 1!**  
> Anda kini menguasai arsitektur mikrokontroler ESP32 seutuhnya: dari I/O dasar, ADC/PWM, `millis()` non-blocking, protokol bus I2C/SPI, hingga FreeRTOS Dual-Core dan penanganan error industri.
> 
> 👉 **Langkah Selanjutnya:** Mari kita melangkah ke **Fase 2: Desain Perangkat Keras, Skematik & PCB 4-Layer KiCad** di **[02-hardware-pcb/README.md](../02-hardware-pcb/README.md)**!
