# 🔌 Modul 1.4: Protokol Bus Sensor Perangkat Keras (I2C, SPI & 1-Wire)

> **Fase 1: Rekayasa Hardware & Sensor ESP32**  
> **Target Pembaca:** Pengembang yang ingin menghubungkan puluhan sensor lingkungan presisi (suhu, tekanan, kelembaban, layar OLED, dan MicroSD) hanya dengan 2–4 kabel data.  
> **Estimasi Waktu Belajar:** 50–60 Menit  
> **Alat Praktik:** [Wokwi Simulator ESP32](https://wokwi.com/esp32) atau Sensor BME280 fisik + Layar OLED SSD1306 I2C + DS18B20.

---

## 🧭 Daftar Isi Modul
1. [Apa Itu Protokol Bus? (Mengapa Kita Tidak Memakai 1 Pin per Sensor?)](#1-apa-itu-protokol-bus-mengapa-kita-tidak-memakai-1-pin-per-sensor)
2. [Protokol I2C: Komunikasi 2 Kabel Pintar (SDA & SCL)](#2-protokol-i2c-komunikasi-2-kabel-pintar-sda--scl)
3. [Menjalankan I2C Scanner untuk Melacak Alamat Sensor](#3-menjalankan-i2c-scanner-untuk-melacak-alamat-sensor)
4. [Menampilkan Teks & Grafik pada Layar OLED 0.96" SSD1306 (I2C)](#4-menampilkan-teks--grafik-pada-layar-oled-096-ssd1306-i2c)
5. [Membaca Sensor Cuaca Presisi Tinggi Bosch BME280 (I2C)](#5-membaca-sensor-cuaca-presisi-tinggi-bosch-bme280-i2c)
6. [Protokol SPI: Komunikasi Kecepatan Tinggi untuk MicroSD Card Storage](#6-protokol-spi-komunikasi-kecepatan-tinggi-untuk-microsd-card-storage)
7. [Protokol 1-Wire: Sensor Suhu Industri Tahan Air DS18B20](#7-protokol-1-wire-sensor-suhu-industri-tahan-air-ds18b20)
8. [Laboratorium Praktik: Dashboard Cuaca Mini (ESP32 + BME280 + OLED) di Wokwi](#8-laboratorium-praktik-dashboard-cuaca-mini-esp32--bme280--oled-di-wokwi)
9. [Kotak Antisipasi Error & Glosarium](#9-kotak-antisipasi-error--glosarium)

---

## 1. Apa Itu Protokol Bus? (Mengapa Kita Tidak Memakai 1 Pin per Sensor?)

Jika Anda memiliki 10 sensor berbeda di pabrik Anda, apakah Anda harus menarik 10 pasang kabel ke 10 pin mikrokontroler yang berbeda? Tentu tidak, pin ESP32 akan langsung habis!

**Protokol Bus** adalah konsep "jalur bus umum". Bayangkan sebuah bus kota di mana banyak penumpang (sensor) berbagi satu jalan raya yang sama:

```
                            TOPOLOGI JALUR BUS I2C
                            
              ESP32 (MASTER)
         ┌──────────────────────┐
         │  SDA (GPIO 21) ──────┼───┬──────────────┬──────────────┐
         │  SCL (GPIO 22) ──────┼───┼───┬──────────┼───┬──────────┼───┬──────
         └──────────────────────┘   │   │          │   │          │   │
                                  ┌─┴───┴─┐      ┌─┴───┴─┐      ┌─┴───┴─┐
                                  │ OLED  │      │BME280 │      │  RTC  │
                                  │ (0x3C)│      │(0x76) │      │(0x68) │
                                  └───────┘      └───────┘      └───────┘
```

Setiap sensor memiliki **Nomor Alamat Unik (Address)**. Saat ESP32 memanggil: *"Alamat `0x76` (BME280), tolong kirimkan suhu!"*, hanya sensor BME280 yang menjawab, sementara sensor OLED dan RTC akan tetap diam.

---

## 2. Protokol I2C: Komunikasi 2 Kabel Pintar (SDA & SCL)

I2C (*Inter-Integrated Circuit*) hanya membutuhkan **2 kabel sinyal**:
1. **SDA (*Serial Data* - Default ESP32: GPIO 21):** Jalur pengiriman data bolak-balik.
2. **SCL (*Serial Clock* - Default ESP32: GPIO 22):** Ketukan detak irama data dari ESP32.

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│          KELEBIHAN I2C               │          KEKURANGAN I2C              │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Sangat hemat pin (hanya butuh 2 pin) │ Kecepatan sedang (100kHz - 400kHz)   │
│ Bisa pasang hingga 127 sensor serentak│ Jarak kabel pendek (< 1 - 2 meter)   │
│ Pengkabelan sangat ringkas di PCB    │ Butuh resistor pull-up (biasanya 4.7k)│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. Menjalankan I2C Scanner untuk Melacak Alamat Sensor

Jika Anda membeli sensor baru dari toko dan tidak tahu berapa alamat heksadesimalnya, jalankan program **I2C Scanner** ini:

```cpp
#include <Wire.h>

void setup() {
  Wire.begin(21, 22); // Inisialisasi I2C pada SDA=21, SCL=22
  Serial.begin(115200);
  Serial.println("\n🔍 MEMULAI I2C SCANNER...");
}

void loop() {
  byte error, address;
  int jumlahPerangkat = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.printf("✅ Perangkat I2C Ditemukan di Alamat: 0x%02X\n", address);
      jumlahPerangkat++;
    }
  }

  if (jumlahPerangkat == 0) {
    Serial.println("❌ Tidak ada perangkat I2C yang terdeteksi!");
  }

  Serial.println("----------------------------------------");
  delay(5000);
}
```

*Jika Anda memasang Layar OLED, scanner akan menampilkan `0x3C`. Jika memasang BME280, scanner akan menampilkan `0x76` atau `0x77`.*

---

## 4. Menampilkan Teks & Grafik pada Layar OLED 0.96" SSD1306 (I2C)

Layar OLED berukuran $128 \times 64$ piksel ini sangat hemat daya dan kontras tinggi. Kita menggunakan library **Adafruit SSD1306**:

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define LEBAR_LAYAR 128
#define TINGGI_LAYAR 64

Adafruit_SSD1306 display(LEBAR_LAYAR, TINGGI_LAYAR, &Wire, -1);

void setup() {
  Wire.begin(21, 22);
  // Alamat I2C umum OLED adalah 0x3C
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Gagal menginisialisasi OLED!");
    for (;;); // Berhenti jika gagal
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 10);
  display.println("MONITORING IOT");
  
  display.setTextSize(2);
  display.setCursor(10, 30);
  display.println("28.5 C");
  
  display.display(); // Perintah wajib untuk mengirim gambar ke layar fisik
}

void loop() {}
```

---

## 5. Membaca Sensor Cuaca Presisi Tinggi Bosch BME280 (I2C)

Sensor **BME280** adalah standar emas sensor lingkungan yang mampu membaca **3 parameter sekaligus**: Suhu, Kelembaban Relatif, dan Tekanan Udara Barometrik.

```cpp
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme; // Komunikasi I2C

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!bme.begin(0x76, &Wire)) {
    Serial.println("❌ Sensor BME280 tidak terdeteksi di alamat 0x76!");
    while (1);
  }
  Serial.println("✅ Sensor BME280 Siap!");
}

void loop() {
  float suhu = bme.readTemperature();       // Satuan Celcius
  float kelembaban = bme.readHumidity();    // Satuan Persen %
  float tekanan = bme.readPressure() / 100.0F; // Satuan hPa (Hectopascal)

  Serial.printf("Suhu: %.2f C | Kelembaban: %.1f %% | Tekanan: %.1f hPa\n", suhu, kelembaban, tekanan);
  delay(2000);
}
```

---

## 6. Protokol SPI: Komunikasi Kecepatan Tinggi untuk MicroSD Card Storage

Saat kita butuh kecepatan tinggi (misal: merekam data sensor ribuan kali per detik ke kartu MicroSD), I2C terlalu lambat. Di sinilah kita menggunakan **SPI (*Serial Peripheral Interface*)**.

```
                       TOPOLOGI PROTOKOL SPI 4-KABEL
                       
        ESP32 (MASTER)                                 MODUL MICROSD
       ┌────────────────────────┐                   ┌────────────────────────┐
       │  MOSI (GPIO 23) ───────┼───────────────────► DIN / MOSI (Data In)   │
       │  MISO (GPIO 19) ◄──────┼───────────────────┼ DOUT / MISO (Data Out) │
       │  SCK  (GPIO 18) ───────┼───────────────────► CLK / SCK (Clock)      │
       │  CS   (GPIO 5)  ───────┼───────────────────► CS / SS (Chip Select)  │
       └────────────────────────┘                   └────────────────────────┘
```

- **MOSI (*Master Out Slave In*):** ESP32 mengirim data ke MicroSD.
- **MISO (*Master In Slave Out*):** MicroSD mengirim data kembali ke ESP32.
- **SCK (*Serial Clock*):** Detak clock berkecepatan sangat tinggi (hingga $40\text{ MHz}$).
- **CS (*Chip Select*):** Pin pemicu untuk memilih kartu mana yang sedang diajak bicara.

---

## 7. Protokol 1-Wire: Sensor Suhu Industri Tahan Air DS18B20

Sensor **DS18B20** terbungkus pipa stainless steel tahan air. Berbeda dengan I2C dan SPI, protokol **1-Wire (Dallas Semiconductor)** hanya membutuhkan **1 kabel data tunggal**:

```
                 RANGKAIAN 1-WIRE DS18B20 TAHAN AIR
                 
                       3.3V
                        │
                      [ Resistor 4.7kΩ Pull-Up ]
                        │
       GPIO 4 ──────────┼───────────────► Kabel KUNING (Data DS18B20)
       3.3V   ──────────────────────────► Kabel MERAH  (VCC)
       GND    ──────────────────────────► Kabel HITAM  (GND)
```

Setiap sensor DS18B20 memiliki **kode unik 64-bit ROM pabrik**. Anda bisa memasang 50 sensor suhu tahan air di sepanjang pipa minyak industri hanya dengan 1 kabel yang sama!

---

## 8. Laboratorium Praktik: Dashboard Cuaca Mini (ESP32 + BME280 + OLED) di Wokwi

Mari kita satukan sensor BME280 dan Layar OLED pada **jalur bus I2C yang sama (SDA=21, SCL=22)**!

```
       ESP32 BOARD
    ┌──────────────┐
    │              │
    │      GPIO 21 ├───────┬────── [ Pin SDA BME280 ]
    │              │       └────── [ Pin SDA OLED 0.96" ]
    │      GPIO 22 ├───────┬────── [ Pin SCL BME280 ]
    │              │       └────── [ Pin SCL OLED 0.96" ]
    │          3V3 ├───────┬────── [ VCC BME280 & VCC OLED ]
    │          GND ├───────┴────── [ GND BME280 & GND OLED ]
    └──────────────┘
```

### 💻 Kode Siap Jalankan di [wokwi.com/esp32](https://wokwi.com/esp32):

```cpp
// ==========================================================
// PRAKTIK MODUL 1.4: MINI WEATHER STATION DASHBOARD
// ==========================================================
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
Adafruit_BME280 bme;

unsigned long waktuTerakhir = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // Inisialisasi OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED Gagal!");
  }
  display.clearDisplay();

  // Inisialisasi BME280
  if (!bme.begin(0x76, &Wire)) {
    Serial.println("BME280 Gagal!");
  }
}

void loop() {
  unsigned long sekarang = millis();

  // Perbarui tampilan tiap 1 detik
  if (sekarang - waktuTerakhir >= 1000) {
    waktuTerakhir = sekarang;

    float t = bme.readTemperature();
    float h = bme.readHumidity();
    float p = bme.readPressure() / 100.0F;

    // Gambar di Layar OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("--- WEATHER STATION ---");

    display.setCursor(0, 18);
    display.printf("Suhu : %.1f C\n", t);

    display.setCursor(0, 32);
    display.printf("Lembab: %.1f %%\n", h);

    display.setCursor(0, 46);
    display.printf("Tekan : %.0f hPa\n", p);

    display.display();
  }
}
```

---

## 9. Kotak Antisipasi Error & Glosarium

> [!WARNING]
> ### 🚨 Troubleshooting Masalah Bus Sensor:
> 1. **OLED atau BME280 tidak terdeteksi:** Cek apakah kabel SDA dan SCL tertukar. Jalankan program **I2C Scanner** untuk memastikan perangkat merespons sinyal.
> 2. **Nilai sensor DS18B20 selalu bernilai -127°C:** Ini adalah tanda khas ketiadaan **Resistor Pull-Up $4.7\text{k}\Omega$** antara kabel Data dan 3.3V.

### 📚 Glosarium Modul 1.4:
- **I2C (*Inter-Integrated Circuit*):** Protokol serial sinkron 2-kabel berkecepatan sedang dengan sistem pengalamatan perangkat (*addressing*).
- **SPI (*Serial Peripheral Interface*):** Protokol serial sinkron 4-kabel full-duplex berkecepatan tinggi tanpa sistem pengalamatan (menggunakan pin fisik Chip Select).
- **1-Wire:** Protokol komunikasi proprietary 1 kabel data hemat jalur untuk jaringan sensor terdistribusi.

---

> 🎉 **Selamat!** Anda telah menguasai 3 protokol bus perangkat keras utama di dunia embedded!
> 
> 👉 **Langkah Puncak Fase 1:** Mari kita pelajari sistem operasi waktu-nyata FreeRTOS multi-core dan teknik penyelamatan crash di **[Modul 1.5: FreeRTOS Dual-Core & Kehandalan Firmware WDT](05-freertos-multicore-dan-kehandalan-wdt.md)**!
