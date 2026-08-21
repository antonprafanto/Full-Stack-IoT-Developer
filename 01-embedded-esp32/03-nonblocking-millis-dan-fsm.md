# ⏱️ Modul 1.3: Mengatasi Jebakan `delay()` dengan `millis()` & Arsitektur State Machine (FSM)

> **Fase 1: Rekayasa Hardware & Sensor ESP32**  
> **Target Pembaca:** Pengembang yang ingin menghilangkan kebiasaan buruk menggunakan `delay()` dan membangun firmware multi-tugas yang responsif tanpa macet.  
> **Estimasi Waktu Belajar:** 45–60 Menit  
> **Alat Praktik:** [Wokwi Simulator ESP32](https://wokwi.com/esp32)

---

## 🧭 Daftar Isi Modul
1. [Dosa Terbesar Pemula: Mengapa `delay()` Sangat Berbahaya di IoT Produksi?](#1-dosa-terbesar-pemula-mengapa-delay-sangat-berbahaya-di-iot-produksi)
2. [Analogi Stopwatch: Memahami Cara Kerja `millis()`](#2-analogi-stopwatch-memahami-cara-kerja-millis)
3. [Pola Emas Non-Blocking Timer (Multitasking Tanpa Macet)](#3-pola-emas-non-blocking-timer-multitasking-tanpa-macet)
4. [Menjalankan 3 Tugas Independen Serentak (Blink Cepat + Blink Lambat + Tombol)](#4-menjalankan-3-tugas-independen-serentak-blink-cepat--blink-lambat--tombol)
5. [Mengenal Finite State Machine (FSM): Otak Logika Mesin Industri](#5-mengenal-finite-state-machine-fsm-otak-logika-mesin-industri)
6. [Laboratorium Praktik: Simulasi Sistem Traffic Light & Smart Alarm di Wokwi](#6-laboratorium-praktik-simulasi-sistem-traffic-light--smart-alarm-di-wokwi)
7. [Kotak Antisipasi Error & Glosarium](#7-kotak-antisipasi-error--glosarium)

---

## 1. Dosa Terbesar Pemula: Mengapa `delay()` Sangat Berbahaya di IoT Produksi?

Fungsi `delay(5000)` terdengar tidak berbahaya: *"Tunggu 5 detik saja kok!"*.  
Namun di tingkat prosesor mikrokontroler, **`delay()` MEMBEKUKAN PROSESOR TOTAL (*BUSY-WAITING*)**:

```
                       APA YANG TERJADI SAAT delay(5000)?
                       
       Detik 0.0s ═════════════════════════════════════════════════► Detik 5.0s
       
       [ PROSESOR MATI SURI / MEMBEKU TOTAL SELAMA 5 DETIK PENUH ]
       ❌ Tombol darurat yang ditekan pengguna? DIABAIKAN!
       ❌ Paket data Wi-Fi / MQTT masuk? HILANG & TIMEOUT!
       ❌ Sensor kebocoran gas berbunyi? TERLAMBAT DIDETEKSI!
       ❌ Watchdog Timer internal? MENGIRA CHIP HANG & ME-RESTART ESP32!
```

> [!IMPORTANT]
> **Hukum Mutlak Senior IoT Developer:**  
> **JANGAN PERNAH MENGGUNAKAN `delay()`** di dalam kode firmware produksi, kecuali untuk jeda inisialisasi awal di `setup()`!

---

## 2. Analogi Stopwatch: Memahami Cara Kerja `millis()`

Fungsi `millis()` mengembalikan angka berapa milidetik yang telah berlalu sejak ESP32 pertama kali dinyalakan.

### ⏱️ Analogi Koki Memanggang Kue:
- **Koki Bodoh (`delay`):** Koki memasukkan kue ke oven selama 20 menit, lalu berdiri mematung di depan oven tanpa berkedip selama 20 menit. Dia tidak bisa mencuci piring, tidak bisa memotong sayur, dan tidak bisa mengangkat telepon.
- **Koki Pintar (`millis`):** Koki memasukkan kue ke oven pada pukul **10.00**, mencatat target selesai pukul **10.20**, lalu dia pergi mencuci piring dan memotong sayur. Sesekali dia melirik jam dinding: *"Apakah sudah jam 10.20? Belum, baru 10.05, lanjut kerja lagi..."*.

```
   ESP32 Dinyalakan (millis = 0)
         │
         ├──► 1 Detik Kemudian (millis = 1000)
         ├──► 5 Detik Kemudian (millis = 5000)
         └──► 1 Menit Kemudian (millis = 60000)
```

---

## 3. Pola Emas Non-Blocking Timer (Multitasking Tanpa Macet)

```cpp
// 1. Variabel untuk mencatat waktu terakhir tugas dijalankan
unsigned long waktuTerakhir = 0;

// 2. Interval jeda yang diinginkan (misal: 1000 ms = 1 detik)
const unsigned long jedaInterval = 1000;

void loop() {
  // 3. Baca waktu jam dinding sekarang
  unsigned long waktuSekarang = millis();

  // 4. Periksa apakah selisih waktu sudah mencapai target interval
  if (waktuSekarang - waktuTerakhir >= jedaInterval) {
    // Simpan waktu sekarang sebagai titik awal baru
    waktuTerakhir = waktuSekarang;

    // JALANKAN TUGAS DI SINI (Misal: Baca Sensor / Kedipkan Lampu)
    Serial.println("⏰ 1 Detik Berlalu! Eksekusi tugas...");
  }

  // PROSESOR BEBAS! Baris di luar IF ini akan dieksekusi secepat kilat
  // tanpa pernah terhenti sedetik pun!
}
```

---

## 4. Menjalankan 3 Tugas Independen Serentak

Mari kita buktikan kekuatan `millis()` dengan menjalankan **3 tugas dengan kecepatan berbeda secara bersamaan**:
1. **Tugas 1:** LED 1 berkedip sangat cepat (tiap 200 ms).
2. **Tugas 2:** LED 2 berkedip santai (tiap 1000 ms).
3. **Tugas 3:** Tombol dipantau secara instan (respons < 1 ms tanpa jeda).

```cpp
const int PIN_LED_CEPAT = 23;
const int PIN_LED_LAMBAT = 22;
const int PIN_TOMBOL = 4;

unsigned long waktuLED1 = 0;
unsigned long waktuLED2 = 0;
bool statusLED1 = false;
bool statusLED2 = false;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_CEPAT, OUTPUT);
  pinMode(PIN_LED_LAMBAT, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
}

void loop() {
  unsigned long sekarang = millis();

  // TUGAS 1: Berkedip Tiap 200 ms
  if (sekarang - waktuLED1 >= 200) {
    waktuLED1 = sekarang;
    statusLED1 = !statusLED1;
    digitalWrite(PIN_LED_CEPAT, statusLED1);
  }

  // TUGAS 2: Berkedip Tiap 1000 ms
  if (sekarang - waktuLED2 >= 1000) {
    waktuLED2 = sekarang;
    statusLED2 = !statusLED2;
    digitalWrite(PIN_LED_LAMBAT, statusLED2);
  }

  // TUGAS 3: Membaca Tombol Seketika (Responsif Real-Time!)
  if (digitalRead(PIN_TOMBOL) == LOW) {
    Serial.println("🔘 Tombol Ditekan! Respons seketika tanpa jeda.");
  }
}
```

---

## 5. Mengenal Finite State Machine (FSM): Otak Logika Mesin Industri

**Finite State Machine (FSM)** adalah pola arsitektur di mana perangkat hanya bisa berada pada **satu kondisi (*State*) tertentu pada satu waktu**, dan berpindah ke kondisi lain (*Transition*) jika ada pemicu (*Trigger*):

```
                     DIAGRAM STATE MACHINE SMART IOT NODE
                     
           ┌──────────────┐    Timer 60s Habis    ┌──────────────┐
           │  STATE_IDLE  ├──────────────────────►│ STATE_SENSE  │
           │  (Standby)   │                       │ (Baca Sensor)│
           └──────▲───────┘                       └──────┬───────┘
                  │                                      │ Data Siap
                  │ Kirim Sukses                         ▼
           ┌──────┴───────┐    Koneksi Gagal      ┌──────────────┐
           │ STATE_SLEEP  │◄──────────────────────┤  STATE_MQTT  │
           │ (Hemat Daya) │                       │ (Kirim Cloud)│
           └──────────────┘                       └──────────────┘
```

### 💻 Implementasi C++ Menggunakan `enum` dan `switch-case`:

```cpp
// 1. Definisikan semua kemungkinan kondisi sistem
enum StateSistem {
  STATE_STANDBY,
  STATE_MEMBACA_SENSOR,
  STATE_KIRIM_DATA,
  STATE_ALARM_BAHAYA
};

StateSistem statusSekarang = STATE_STANDBY;
unsigned long waktuState = 0;

void loop() {
  unsigned long sekarang = millis();

  switch (statusSekarang) {
    case STATE_STANDBY:
      // Di kondisi standby selama 5 detik
      if (sekarang - waktuState >= 5000) {
        waktuState = sekarang;
        Serial.println("➡️ Pindah ke: MEMBACA SENSOR");
        statusSekarang = STATE_MEMBACA_SENSOR;
      }
      break;

    case STATE_MEMBACA_SENSOR:
      {
        int suhu = random(20, 50); // Simulasi suhu
        Serial.printf("🌡️ Sensor membaca suhu: %d C\n", suhu);
        
        if (suhu > 42) {
          statusSekarang = STATE_ALARM_BAHAYA;
        } else {
          statusSekarang = STATE_KIRIM_DATA;
        }
        waktuState = sekarang;
      }
      break;

    case STATE_KIRIM_DATA:
      Serial.println("📡 Data terkirim ke cloud! Kembali ke Standby.");
      statusSekarang = STATE_STANDBY;
      waktuState = sekarang;
      break;

    case STATE_ALARM_BAHAYA:
      Serial.println("🚨 ALARM AKTIF! Suhu berbahaya!");
      // Tetap di alarm sampai 3 detik lalu kembali
      if (sekarang - waktuState >= 3000) {
        statusSekarang = STATE_STANDBY;
        waktuState = sekarang;
      }
      break;
  }
}
```

---

## 6. Laboratorium Praktik: Simulasi Sistem Traffic Light & Smart Alarm di Wokwi

Mari kita uji State Machine lampu lalu lintas pintar di Wokwi:

```
                  STATE 1: HIJAU (Menyala 5 Detik)
                         │ (Waktu Habis)
                         ▼
                  STATE 2: KUNING (Menyala 2 Detik)
                         │ (Waktu Habis)
                         ▼
                  STATE 3: MERAH (Menyala 5 Detik)
                         │ (Waktu Habis)
                         ▼
                  (Kembali ke STATE 1)
```

### 💻 Kode Siap Uji di [wokwi.com/esp32](https://wokwi.com/esp32):

```cpp
// ==========================================================
// PRAKTIK MODUL 1.3: FSM TRAFFIC LIGHT NON-BLOCKING
// ==========================================================
const int LED_MERAH = 23;
const int LED_KUNING = 22;
const int LED_HIJAU = 21;

enum TrafficState { MERAH, KUNING, HIJAU };
TrafficState lampuSekarang = HIJAU;
unsigned long waktuGanti = 0;

void aturLampu(bool m, bool k, bool h) {
  digitalWrite(LED_MERAH, m);
  digitalWrite(LED_KUNING, k);
  digitalWrite(LED_HIJAU, h);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_MERAH, OUTPUT);
  pinMode(LED_KUNING, OUTPUT);
  pinMode(LED_HIJAU, OUTPUT);
  aturLampu(false, false, true); // Mulai dari Hijau
}

void loop() {
  unsigned long sekarang = millis();

  switch (lampuSekarang) {
    case HIJAU:
      if (sekarang - waktuGanti >= 5000) { // 5 Detik Hijau
        aturLampu(false, true, false);    // Kuning Nyala
        lampuSekarang = KUNING;
        waktuGanti = sekarang;
        Serial.println("🟡 Lampu: KUNING");
      }
      break;

    case KUNING:
      if (sekarang - waktuGanti >= 2000) { // 2 Detik Kuning
        aturLampu(true, false, false);    // Merah Nyala
        lampuSekarang = MERAH;
        waktuGanti = sekarang;
        Serial.println("🔴 Lampu: MERAH");
      }
      break;

    case MERAH:
      if (sekarang - waktuGanti >= 5000) { // 5 Detik Merah
        aturLampu(false, false, true);    // Hijau Nyala
        lampuSekarang = HIJAU;
        waktuGanti = sekarang;
        Serial.println("🟢 Lampu: HIJAU");
      }
      break;
  }
}
```

---

## 7. Kotak Antisipasi Error & Glosarium

> [!NOTE]
> ### 💡 Masalah Rollover `millis()` (Setelah 49 Hari):
> Variabel `millis()` bertipe `unsigned long` (32-bit) akan mencapai nilai maksimal ($4.294.967.295\text{ ms} \approx 49.7\text{ hari}$) lalu kembali ke angka 0 (*Rollover*).
> **Kabar Baik:** Pola pengurangan `(unsigned long)(sekarang - waktuTerakhir) >= jeda` secara matematis **TIDAK AKAN PERNAH ERROR** meskipun terjadi rollover karena sifat aritmatika biner unsigned integer!

### 📚 Glosarium Modul 1.3:
- **Non-Blocking:** Teknik penulisan program di mana eksekusi kode tidak pernah terhenti atau tertahan di satu baris.
- **FSM (*Finite State Machine*):** Model komputasi terstruktur yang mengorganisir alur logika sistem ke dalam serangkaian kondisi (*states*) dan transisi.
- **Rollover:** Fenomena ketika variabel pencacah angka mencapai batas maksimal kapasitas memorinya dan kembali berputar dari nol.

---

> 🎉 **Selamat!** Anda telah naik kelas dari pembuat skrip pemula menjadi perancang firmware handal yang mampu membangun sistem multi-tugas tanpa `delay()`!
> 
> 👉 **Langkah Selanjutnya:** Mari kita hubungkan sensor-sensor lingkungan canggih melalui bus perangkat keras di **[Modul 1.4: Protokol Bus Sensor I2C, SPI & 1-Wire](04-protokol-bus-i2c-spi-1wire.md)**!
