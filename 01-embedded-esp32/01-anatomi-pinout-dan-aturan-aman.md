# 📌 Modul 1.1: Anatomi Board ESP32 & Aturan Pinout Aman

> **Tingkat Kesulitan:** Sangat Ramah Pemula (*Zero Prerequisite*)  
> **Estimasi Waktu Membaca & Praktik:** 20–25 Menit  
> **Tools yang Digunakan:** Browser Web (Wokwi Simulator) atau VS Code + PlatformIO  

---

## 🌟 Selamat Datang di Fase 1: Dunia Nyata ESP32!

Selamat! Anda telah resmi memasuki **Fase 1 (Embedded Firmware Engineering)**.  
Mulai modul ini, kita akan bekerja langsung dengan sang bintang utama IoT: **ESP32**.

ESP32 adalah mikrokontroler berkekuatan monster dengan prosesor **Dual-Core 240 MHz**, dilengkapi **Wi-Fi**, **Bluetooth BLE**, dan puluhan pin serbaguna (*GPIO - General Purpose Input/Output*).

Namun, ada satu rahasia penting yang jarang diungkap di tutorial pemula:  
> [!WARNING]
> **Tidak Semua Pin di ESP32 Boleh Digunakan Sembarangan!**  
> Ada pin yang jika dicolok kabel saat ESP32 dinyalakan akan membuat ESP32 **mati total (*gagal booting*)**. Ada pula pin sensor analog yang tiba-tiba **rusak dan mati saat Wi-Fi dinyalakan**. 

Di modul ini, kita akan membedah peta pinout ESP32 menggunakan **Sistem Lampu Lalu Lintas (Hijau - Kuning - Merah)** agar Anda bisa merangkai sirkuit dengan 100% aman dan percaya diri!

---

## 🧭 Peta Pembelajaran Modul Ini

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 1.1                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Peta Visual Pinout ESP32 DevKit V1 (30-Pin vs 38-Pin)               │
│ 2. Sistem Lampu Lalu Lintas: Klasifikasi Pin Hijau, Kuning, dan Merah │
│ 3. Perangkap Paling Fatal: Konflik Wi-Fi vs Pin ADC2                   │
│ 4. Waspada "Strapping Pins": Pin yang Menentukan Nasib Booting         │
│ 5. Pin Komunikasi Hardware Bawaan: I2C, SPI, UART, dan DAC            │
│ 6. Praktik Uji Coba: Program Pemindai Pinout Mandiri di Simulator     │
│ 7. Glosarium & Kuis Singkat                                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Peta Visual Pinout ESP32 DevKit V1 (30-Pin)

Board ESP32 yang paling banyak beredar di pasaran adalah **ESP32 DevKit V1 (30-Pin)**. Mari kita lihat diagram pin fisiknya:

```
                          ┌──────────────────────────┐
                          │  [ ANTENA PCB WI-FI ]    │
                          │                          │
                   3.3V ──┤ [1]                  [30]├── GND
                     EN ──┤ [2]                  [29]├── GPIO 23 (SPI MOSI)
         (ADC1) GPIO 36 ──┤ [3]   ESP-WROOM-32   [28]├── GPIO 22 (I2C SCL)
         (ADC1) GPIO 39 ──┤ [4]                  [27]├── GPIO 1  (UART TX0) ⚠️
         (ADC1) GPIO 34 ──┤ [5]                  [26]├── GPIO 3  (UART RX0) ⚠️
         (ADC1) GPIO 35 ──┤ [6]   ┌──────────┐   [25]├── GPIO 21 (I2C SDA)
         (ADC1) GPIO 32 ──┤ [7]   │   CHIP   │   [24]├── GND
         (ADC1) GPIO 33 ──┤ [8]   │ SILIKON  │   [23]├── GPIO 19 (SPI MISO)
         (ADC2) GPIO 25 ──┤ [9]   └──────────┘   [22]├── GPIO 18 (SPI SCK)
         (ADC2) GPIO 26 ──┤ [10]                 [21]├── GPIO 5  (SPI CS) ⚠️
         (ADC2) GPIO 27 ──┤ [11]                 [20]├── NC (Not Connected)
         (ADC2) GPIO 14 ──┤ [12]  (o)      (o)   [19]├── GPIO 17 (UART2 TX)
         (ADC2) GPIO 12 ──┤ [13]   EN     BOOT   [18]├── GPIO 16 (UART2 RX)
                    GND ──┤ [14]                 [17]├── GPIO 4  (ADC2)
         (ADC2) GPIO 13 ──┤ [15]   [ USB PORT ]  [16]├── GPIO 0  (BOOT MODE) ⚠️
                          └──────────────────────────┘
```

---

## 2. Sistem Lampu Lalu Lintas: Klasifikasi Pin Aman

Untuk mempermudah ingatan Anda saat merakit proyek, gunakan panduan warna ini:

```
┌────────────────────────────────────────────────────────────────────────┐
│               KLASIFIKASI PIN LAMPU LALU LINTAS ESP32                  │
├────────────────────────────────────────────────────────────────────────┤
│ 🟢 PIN HIJAU (Sangat Aman & Bebas Dipakai Kapan Saja):                 │
│    GPIO 4, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33             │
│    • Bebas digunakan untuk LED, relay, tombol, dan sensor digital.     │
├────────────────────────────────────────────────────────────────────────┤
│ 🟡 PIN KUNING (Input Saja / Terbatas):                                 │
│    GPIO 34, 35, 36 (VP), 39 (VN)                                       │
│    • HANYA BISA JADI INPUT (Tidak bisa menyalakan LED/Relay).          │
│    • Tidak punya resistor pull-up internal. Sempurna untuk ADC sensor! │
├────────────────────────────────────────────────────────────────────────┤
│ 🔴 PIN MERAH (Waspada! Strapping Pins & Flash SPI Internal):           │
│    GPIO 0, 2, 12, 15 (Strapping Pins) & GPIO 6 s/d 11 (SPI Flash)      │
│    • GPIO 6 s/d 11: JANGAN PERNAH DIPAKAI! Terhubung ke chip memori.   │
│    • GPIO 0, 2, 12: Menentukan mode booting saat chip pertama menyala. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Perangkap Paling Fatal: Konflik Wi-Fi vs Pin ADC2

Ini adalah kesalahan yang paling sering membuat developer frustrasi berhari-hari:

ESP32 memiliki **Dua Modul Pengubah Sinyal Analog (ADC)**:
1. **ADC1 (8 Channel):** GPIO 32, 33, 34, 35, 36, 39.
2. **ADC2 (10 Channel):** GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27.

```
       [ KONDISI 1: WI-FI MATI ]             [ KONDISI 2: WI-FI MENYALA (WiFi.begin) ]
       
    ADC1 ──► Bekerja Normal (100% OK)     ADC1 ──► Bekerja Normal (100% OK)
    ADC2 ──► Bekerja Normal (100% OK)     ADC2 ──► 💥 DIBAJAK OLEH DRIVER WI-FI!
                                                   (Nilai bacaan sensor selalu 4095/rusak)
```

### Mengapa Ini Terjadi?
Sirkuit radio Wi-Fi di dalam silikon ESP32 membutuhkan konverter ADC2 untuk mengukur kekuatan sinyal antena secara berkala. Ketika perintah `WiFi.begin()` dijalankan di kode Anda, **sistem operasi ESP32 akan mengambil alih ADC2 secara mutlak**.

> [!IMPORTANT]
> **Aturan Emas Sensor Analog IoT:**  
> **SELALU sambungkan sensor analog (LDR, Potensiometer, Sensor Suhu LM35, Sensor Tanah) ke pin kelompok ADC1 (GPIO 32, 33, 34, 35, 36, 39).**  
> Jangan pernah memakai ADC2 jika proyek Anda menggunakan Wi-Fi!

---

## 4. Waspada "Strapping Pins": Pin Penentu Nasib Booting

Saat ESP32 pertama kali diberi daya listrik, prosesor akan memeriksa voltase pada 4 pin khusus (**Strapping Pins**) selama beberapa milidetik untuk memutuskan: *"Apakah saya harus menjalankan program pengguna di Flash, atau masuk ke mode download firmware?"*

```
┌──────────┬──────────────────────┬────────────────────────────────────────────────────┐
│ Pin GPIO │ Kondisi yang Diinginkan│ Bahaya Jika Salah Rangkaian                      │
├──────────┼──────────────────────┼────────────────────────────────────────────────────┤
│ GPIO 0   │ Default: HIGH (Pullup)│ Jika ditarik ke GND saat boot, ESP32 masuk mode    │
│          │                      │ flashing dan TIDAK AKAN menjalankan kode Anda!     │
├──────────┼──────────────────────┼────────────────────────────────────────────────────┤
│ GPIO 2   │ Default: LOW / Float │ Terhubung ke lampu LED biru onboard. Harus LOW saat│
│          │                      │ flashing chip model tertentu.                      │
├──────────┼──────────────────────┼────────────────────────────────────────────────────┤
│ GPIO 12  │ Default: LOW         │ SANGAT KRUSIAL! Mengatur voltase Flash (3.3V/1.8V).│
│ (MTDI)   │                      │ Jika ditarik HIGH saat boot, ESP32 GAGAL MENYALA!  │
├──────────┼──────────────────────┼────────────────────────────────────────────────────┤
│ GPIO 15  │ Default: HIGH        │ Mengatur output log debugging saat boot.           │
│ (MTDO)   │                      │                                                    │
└──────────┴──────────────────────┴────────────────────────────────────────────────────┘
```

> [!TIP]
> **Praktik Aman:** Hindari menyambungkan tombol tekan atau sensor dengan resistor pull-up/pull-down eksternal ke pin **GPIO 0, GPIO 2, dan GPIO 12**. Gunakan pin hijau seperti **GPIO 4, 16, 17, 18, 19, 21, 22, 23** agar ESP32 selalu boot dengan lancar!

---

## 5. Pin Komunikasi Hardware Bawaan (*Default Bus*)

ESP32 memiliki sirkuit komunikasi berkecepatan tinggi yang terhubung ke pin-pin default berikut:

```
┌─────────────────┬───────────────────────────────┬───────────────────────────────────┐
│ Protokol Bus    │ Pin Default ESP32             │ Contoh Perangkat yang Terhubung   │
├─────────────────┼───────────────────────────────┼───────────────────────────────────┤
│ I2C             │ SDA = GPIO 21, SCL = GPIO 22  │ Layar OLED SSD1306, Sensor BME280 │
│ SPI             │ MOSI = 23, MISO = 19, SCK = 18│ Modul MicroSD Card, Layar TFT LCD │
│ UART (Serial 0) │ TX0 = GPIO 1, RX0 = GPIO 3    │ Komunikasi USB ke Laptop / Serial │
│ UART2 (Serial 2)│ TX2 = GPIO 17, RX2 = GPIO 16  │ Modul GPS NEO-6M, Modem GSM/NB-IoT│
│ DAC (Analog Out)│ DAC1 = GPIO 25, DAC2 = GPIO 26│ Output Suara Audio / Gelombang Sinus│
└─────────────────┴───────────────────────────────┴───────────────────────────────────┘
```

---

## 6. Praktik Uji Coba: Program Pemindai Pinout di Simulator Wokwi

Mari kita uji pemahaman pinout ini menggunakan program interaktif di simulator!

### Langkah Praktik (5 Menit):
1. Buka proyek simulator ini di browser Anda: **[Wokwi ESP32 Pinout Scanner](https://wokwi.com/projects/new/esp32)**.
2. Di layar editor `sketch.ino`, salin dan tempelkan kode uji diagnostik pinout ini:

```cpp
#include <Arduino.h>

// Definisi pin aman untuk pengujian
const uint8_t pinLedHijau  = 18; // Pin Hijau (Bebas Output)
const uint8_t pinTombol    = 19; // Pin Hijau (Input Pull-up)
const uint8_t pinSensorAdc = 34; // Pin Kuning (Input Only / ADC1)

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=============================================");
  Serial.println("🔍 DIAGNOSTIK PINOUT AMAN ESP32 DIMULAI");
  Serial.println("=============================================");

  // 1. Inisialisasi Pin Output
  pinMode(pinLedHijau, OUTPUT);
  Serial.println("[OK] GPIO 18 (Pin Hijau) siap sebagai OUTPUT.");

  // 2. Inisialisasi Pin Input dengan Resistor Pull-Up Internal
  pinMode(pinTombol, INPUT_PULLUP);
  Serial.println("[OK] GPIO 19 (Pin Hijau) siap sebagai INPUT_PULLUP.");

  // 3. Inisialisasi Pin Input Analog (ADC1)
  pinMode(pinSensorAdc, INPUT); // GPIO 34 tidak punya pullup internal!
  Serial.println("[OK] GPIO 34 (Pin Kuning / ADC1) siap sebagai INPUT ADC.");

  Serial.println("=============================================");
  Serial.println("Tekan tombol di diagram untuk melihat respons!");
}

void loop() {
  // A. Baca status tombol digital (GPIO 19)
  bool tombolDitekan = (digitalRead(pinTombol) == LOW);

  // B. Nyalakan LED di GPIO 18 jika tombol ditekan
  if (tombolDitekan) {
    digitalWrite(pinLedHijau, HIGH);
  } else {
    digitalWrite(pinLedHijau, LOW);
  }

  // C. Baca nilai analog di GPIO 34 (ADC1 aman saat Wi-Fi menyala)
  uint16_t nilaiAdc = analogRead(pinSensorAdc);

  Serial.printf("Status Tombol (GPIO 19): %s | Nilai ADC1 (GPIO 34): %u\n", 
                tombolDitekan ? "DITEKAN (ON)" : "LEPAS (OFF)", nilaiAdc);

  delay(1000);
}
```

3. Klik tombol **Play ▶** di Wokwi.
4. Perhatikan log di Serial Monitor: Program berjalan dengan sangat stabil karena seluruh pin yang dipilih adalah **Pin Hijau dan Pin Kuning ADC1 yang aman**! 🎉

---

## 7. 📖 Glosarium Istilah Penting Modul 1.1

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **GPIO** | *General Purpose Input/Output* — Pin fisik serbaguna pada chip mikrokontroler. |
| **Strapping Pins** | Pin khusus yang dibaca status voltasenya oleh CPU saat booting untuk menentukan mode eksekusi. |
| **ADC1 vs ADC2** | Dua unit konverter analog di ESP32, di mana ADC2 akan dinonaktifkan untuk sensor saat Wi-Fi menyala. |
| **Input-Only Pins** | Pin yang secara fisik tidak memiliki transistor penggerak output (GPIO 34, 35, 36, 39). |
| **DAC** | *Digital-to-Analog Converter* — Pin yang mampu mengeluarkan tegangan analog asli (bukan sinyal denyut PWM). |

---

## 📝 Kuis Refleksi & Pemahaman Diri

Uji intuisi Anda dengan 3 pertanyaan penting ini:
1. Jika kita ingin menyambungkan sensor kelembaban tanah analog pada proyek penyiram tanaman berbasis Wi-Fi, pin manakah yang harus dipilih: GPIO 14 (ADC2) atau GPIO 34 (ADC1)? Mengapa?
2. Mengapa pin GPIO 34, 35, 36, dan 39 tidak bisa digunakan untuk menyalakan lampu LED atau mengontrol modul relay?
3. Apa yang bisa terjadi jika kita memasang modul tombol dengan resistor pull-up eksternal ke pin GPIO 12 saat ESP32 dinyalakan?

---

> [!TIP]
> **Status Selesai:**  
> Selamat! Anda sekarang telah memahami peta wilayah pinout ESP32 dan terhindar dari seluruh perangkap hardware yang mematikan.  
> Buka file [TODO.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/TODO.md) dan tandai `[x]` pada modul 1.1, lalu mari kita lanjutkan ke **[Modul 1.2: Proyek 1 — Menguasai Digital Output (LED, Running LED & Active High/Low)](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/01-embedded-esp32/README.md)**! 🚀
