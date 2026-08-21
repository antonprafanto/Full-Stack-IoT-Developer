# 📌 Modul 1.1: Anatomi Pinout ESP32, Digital Output & Input Tombol (Debouncing)

> **Fase 1: Rekayasa Hardware & Sensor ESP32**  
> **Target Pembaca:** Pemula yang ingin menguasai pinout ESP32 tanpa salah colok dan membuat logika tombol yang stabil tanpa loncatan sinyal mekanik (*debounce*).  
> **Estimasi Waktu Belajar:** 40–50 Menit  
> **Alat Praktik:** [Wokwi Simulator ESP32](https://wokwi.com/esp32) atau ESP32 DevKit V1 fisik + Push Button + LED + Resistor.

---

## 🧭 Daftar Isi Modul
1. [Peta Pinout ESP32: Pin Aman, Pin Bahaya & Aturan ADC Wi-Fi](#1-peta-pinout-esp32-pin-aman-pin-bahaya--aturan-adc-wi-fi)
2. [Aturan Emas 3 Golongan Pin ESP32 (Wajib Dihafal)](#2-aturan-emas-3-golongan-pin-esp32-wajib-dihafal)
3. [Digital Output: Mengontrol LED & Memahami Logika Active High vs Active Low](#3-digital-output-mengontrol-led--memahami-logika-active-high-vs-active-low)
4. [Digital Input: Membaca Tombol Tekan dengan `INPUT_PULLUP` Internal](#4-digital-input-membaca-tombol-tekan-dengan-input_pullup-internal)
5. [Logika Toggle Switch: Sekali Tekan ON, Tekan Lagi OFF](#5-logika-toggle-switch-sekali-tekan-on-tekan-lagi-off)
6. [Misteri Tombol Memantul: Mengapa Tombol Butuh Software Debouncing?](#6-misteri-tombol-memantul-mengapa-tombol-butuh-software-debouncing)
7. [Laboratorium Praktik: Rangkaian Tombol Anti-Bouncing di Wokwi](#7-laboratorium-praktik-rangkaian-tombol-anti-bouncing-di-wokwi)
8. [Kotak Antisipasi Error & Glosarium](#8-kotak-antisipasi-error--glosarium)

---

## 1. Peta Pinout ESP32: Pin Aman, Pin Bahaya & Aturan ADC Wi-Fi

Papan ESP32 DevKit memiliki 30 atau 38 kaki pin fisik. Namun **TIDAK SEMUA PIN BOLEH DIPAKAI SEMBARANGAN**.

```
                           PETA PINOUT AMAN ESP32 DEVKIT
                          ┌─────────────────────────────┐
                          │         ANTENA WI-FI        │
                          ├─────────────────────────────┤
              3V3 (Daya)  │ [ ]                     [ ] │  GND (Ground)
            EN (Restart)  │ [ ]                     [ ] │  GPIO 23 ──► [🟢 AMAN: SPI MOSI]
    [🟡 INPUT ONLY] VP/36 │ [ ]                     [ ] │  GPIO 22 ──► [🟢 AMAN: I2C SCL]
    [🟡 INPUT ONLY] VN/39 │ [ ]                     [ ] │  GPIO 1  ──► [🔴 BAHAYA: TX Serial]
    [🟡 INPUT ONLY] D34   │ [ ]                     [ ] │  GPIO 3  ──► [🔴 BAHAYA: RX Serial]
    [🟡 INPUT ONLY] D35   │ [ ]                     [ ] │  GPIO 21 ──► [🟢 AMAN: I2C SDA]
      [🟢 AMAN: ADC1] D32 │ [ ]                     [ ] │  GND (Ground)
      [🟢 AMAN: ADC1] D33 │ [ ]                     [ ] │  GPIO 19 ──► [🟢 AMAN: SPI MISO]
      [🟢 AMAN: DAC1] D25 │ [ ]                     [ ] │  GPIO 18 ──► [🟢 AMAN: SPI SCK]
      [🟢 AMAN: DAC2] D26 │ [ ]                     [ ] │  GPIO 5  ──► [🟢 AMAN]
      [🟢 AMAN: PWM ] D27 │ [ ]                     [ ] │  GPIO 17 ──► [🟢 AMAN]
      [🟢 AMAN: PWM ] D14 │ [ ]                     [ ] │  GPIO 16 ──► [🟢 AMAN]
    [🔴 STRAPPING]    D12 │ [ ]                     [ ] │  GPIO 4  ──► [🟢 AMAN]
              GND (Ground)│ [ ]                     [ ] │  GPIO 0  ──► [🔴 STRAPPING: Boot Button]
             VIN (5V In)  │ [ ]                     [ ] │  GPIO 2  ──► [🔴 STRAPPING: Onboard LED]
                          └───────────┬─────┬───────────┘
                                      │ USB │
                                      └─────┘
```

---

## 2. Aturan Emas 3 Golongan Pin ESP32 (Wajib Dihafal)

```
┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│  🟢 GOLONGAN 1: SANGAT AMAN  │  🟡 GOLONGAN 2: INPUT ONLY   │  🔴 GOLONGAN 3: BAHAYA/HINDARI│
├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Bebas dipakai untuk LED,     │ HANYA bisa membaca sensor,   │ Pin Strapping Boot & Serial. │
│ Relay, Tombol, I2C, SPI:     │ TIDAK BISA menyalakan lampu: │ Jangan dipasang beban!       │
│                              │                              │                              │
│ • GPIO 4, 16, 17, 18, 19     │ • GPIO 34                    │ • GPIO 0 (Tombol Boot)       │
│ • GPIO 21, 22, 23            │ • GPIO 35                    │ • GPIO 2 (LED Biru Bawaan)   │
│ • GPIO 25, 26, 27            │ • GPIO 36 (VP)               │ • GPIO 12, 15 (Strapping)    │
│ • GPIO 32, 33                │ • GPIO 39 (VN)               │ • GPIO 1, 3 (Serial TX/RX)   │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

### 🚨 Aturan Sakral ADC2 vs Wi-Fi:
ESP32 memiliki dua modul pembaca analog: **ADC1** dan **ADC2**.
- **ADC1 (GPIO 32, 33, 34, 35, 36, 39):** 100% AMAN dipakai kapan saja.
- **ADC2 (GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27):** **TIDAK BISA MEMBACA SENSOR SAAT WI-FI AKTIF**, karena sirkuit dalamnya digunakan bersama oleh modem radio Wi-Fi!

---

## 3. Digital Output: Mengontrol LED & Memahami Logika Active High vs Active Low

**Digital Output** berarti pin mikrokontroler bertindak sebagai sumber daya untuk mengirimkan tegangan listrik ($3.3\text{V}$) atau memutusnya ($0\text{V}$).

### Perbedaan Logika Active High vs Active Low:

```
      ACTIVE HIGH (Standar)                      ACTIVE LOW (Banyak Modul Relay)
      
    ESP32 Pin ──► [ LED ] ──► GND              ESP32 Pin ──► [ LED ] ──► 3.3V
    
    • digitalWrite(pin, HIGH) = MENYALA        • digitalWrite(pin, HIGH) = PADAM
    • digitalWrite(pin, LOW)  = PADAM          • digitalWrite(pin, LOW)  = MENYALA
```

---

## 4. Digital Input: Membaca Tombol Tekan dengan `INPUT_PULLUP` Internal

Saat kita menghubungkan tombol tekan (*Push Button*), kita ingin ESP32 membaca angka `1` atau `0`.

```
                    RANGKAIAN INPUT_PULLUP INTERNAL
                    
                    ESP32 DI DALAM CHIP
                    ┌─────────────────────────┐
                    │  3.3V                   │
                    │   │                     │
                    │  [ R Pull-Up (45kΩ) ]   │
                    │   │                     │
                    │   ├────────► Pin GPIO 4 ├───── [ TOMBOL TEKAN ] ───── GND
                    │                         │
                    └─────────────────────────┘
```

### Cara Kerjanya:
1. Saat tombol **DILEPAS:** Arus ditarik ke atas ke 3.3V oleh resistor pull-up internal. ESP32 membaca **`HIGH` (1)**.
2. Saat tombol **DITEKAN:** Pin GPIO 4 terhubung langsung ke GND. ESP32 membaca **`LOW` (0)**.

```cpp
const int PIN_TOMBOL = 4;

void setup() {
  Serial.begin(115200);
  // Mengaktifkan resistor penarik internal chip ESP32
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
}

void loop() {
  int statusTombol = digitalRead(PIN_TOMBOL);
  
  if (statusTombol == LOW) {
    Serial.println("🔘 Tombol sedang DITEKAN!");
  } else {
    Serial.println("⚪ Tombol sedang DILEPAS.");
  }
  delay(100);
}
```

---

## 5. Logika Toggle Switch: Sekali Tekan ON, Tekan Lagi OFF

Dalam kehidupan sehari-hari (seperti sakelar lampu dinding rumah), kita ingin:
- **Tekan 1x:** Lampu MENYALA dan tetap menyala meskipun tombol dilepas.
- **Tekan 1x lagi:** Lampu PADAM dan tetap padam.

```cpp
const int PIN_TOMBOL = 4;
const int PIN_LED = 23;

bool statusLampu = false; // Menyimpan status lampu (false = Mati, true = Nyala)
int statusTombolSebelumnya = HIGH;

void setup() {
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int statusTombolSekarang = digitalRead(PIN_TOMBOL);

  // Deteksi saat tombol BARU SAJA ditekan (perubahan dari HIGH ke LOW)
  if (statusTombolSebelumnya == HIGH && statusTombolSekarang == LOW) {
    statusLampu = !statusLampu; // Balikkan status lampu (true jadi false, false jadi true)
    digitalWrite(PIN_LED, statusLampu ? HIGH : LOW);
  }

  statusTombolSebelumnya = statusTombolSekarang;
  delay(50); // Jeda anti-bouncing sederhana
}
```

---

## 6. Misteri Tombol Memantul: Mengapa Tombol Butuh Software Debouncing?

Secara kasat mata, Anda merasa hanya menekan tombol 1 kali. Namun di tingkat mikroskopis, **plat logam pegas di dalam tombol memantul (*bouncing*) puluhan kali dalam waktu 5 milidetik**:

```
                              FENOMENA BOUNCING TOMBOL
                              
      Ditekan                                                      Dilepas
         │                                                            │
  HIGH ──┐  ┌┐ ┌┐ ┌┐                                            ┌┐ ┌┐ ┌──────── HIGH
         │  ││ ││ ││                                            ││ ││ │
   LOW   └──┘└─┘└─┘└────────────────────────────────────────────┘└─┘└─┘        LOW
            ▲                                                      ▲
            └──── Sinyal Liar Memantul (Bouncing) 5-20 ms ─────────┘
```

Karena prosesor ESP32 mengeksekusi 240 juta instruksi per detik, mikrokontroler akan mendeteksi pantulan tersebut sebagai **20 kali tekanan bertubi-tubi!** Akibatnya, lampu sakelar Anda akan berkedip kacau (*glitch*).

### 🛡️ Solusi Software Debouncing Elegan (Tanpa Delay):

```cpp
const int PIN_TOMBOL = 4;
const int PIN_LED = 23;

bool statusLED = false;
int statusTombolTerakhir = HIGH;
unsigned long waktuPerubahanTerakhir = 0;
const unsigned long jedaDebounce = 50; // Jeda filter 50 milidetik

void setup() {
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int pembacaanSekarang = digitalRead(PIN_TOMBOL);

  // 1. Jika ada perubahan sinyal, catat waktu saat ini
  if (pembacaanSekarang != statusTombolTerakhir) {
    waktuPerubahanTerakhir = millis();
  }

  // 2. Jika sinyal sudah stabil selama lebih dari 50 ms
  if ((millis() - waktuPerubahanTerakhir) > jedaDebounce) {
    // Jika tombol benar-benar dalam keadaan LOW (ditekan)
    if (pembacaanSekarang == LOW && statusLED == false) {
      statusLED = true;
      digitalWrite(PIN_LED, HIGH);
    } else if (pembacaanSekarang == LOW && statusLED == true) {
      statusLED = false;
      digitalWrite(PIN_LED, LOW);
    }
  }

  statusTombolTerakhir = pembacaanSekarang;
}
```

---

## 7. Laboratorium Praktik: Rangkaian Tombol Anti-Bouncing di Wokwi

Mari kita uji rangkaian tombol dan LED ini langsung di browser!

### 🛠️ Diagram Rangkaian Virtual Wokwi:
```
       ESP32 BOARD
    ┌──────────────┐
    │              │
    │      GPIO 23 ├──────────[ Resistor 220 Ω ]──► [ Anoda LED (+) ]
    │              │                                [ Katoda LED (-) ] ──► GND
    │       GPIO 4 ├──────────[ Push Button Pin 1 ]
    │              │          [ Push Button Pin 2 ] ─────────────────────► GND
    │          GND ├─────────────────────────────────────────────────────► GND Bersama
    └──────────────┘
```

### 🎯 Uji Coba:
1. Buka **[wokwi.com/esp32](https://wokwi.com/esp32)**.
2. Tambahkan komponen **Pushbutton** dan **LED** dari menu `+`.
3. Salin kode *Software Debouncing* di atas ke editor.
4. Klik **Play (Hijau)** $\rightarrow$ Klik tombol berkali-kali secepat mungkin. Perhatikan bahwa lampu menyala dan mati dengan sangat presisi tanpa pernah *glitch* atau meleset!

---

## 8. Kotak Antisipasi Error & Glosarium

> [!WARNING]
> ### 🚨 Troubleshooting Masalah Pin & Tombol:
> 1. **ESP32 gagal booting / lampu kedip terus saat dinyalakan:** Anda kemungkinan menghubungkan sensor/kabel ke **GPIO 12 atau GPIO 0**. Lepaskan kabel dari pin tersebut dan pindahkan ke GPIO 4, 16, atau 23.
> 2. **Tombol terbaca selalu LOW:** Periksa apakah Anda lupa menuliskan `INPUT_PULLUP` dan hanya menulis `INPUT`.

### 📚 Glosarium Modul 1.1:
- **GPIO (*General Purpose Input Output*):** Kaki pin serbaguna mikrokontroler yang bisa dikonfigurasi sebagai input maupun output.
- **Strapping Pins:** Kaki pin khusus (GPIO 0, 2, 12, 15) yang dibaca oleh ESP32 saat proses booting untuk menentukan mode eksekusi internal.
- **Debouncing:** Teknik penyaringan getaran mekanik tombol agar sinyal terbaca bersih 1 kali klik.

---

> 🎉 **Selamat!** Anda telah menguasai aturan pinout aman ESP32, logika I/O digital, dan algoritma debouncing standar industri!
> 
> 👉 **Langkah Selanjutnya:** Mari kita pelajari komunikasi Serial canggih, pembacaan sinyal Analog ADC 12-bit, dan pengaturan PWM di **[Modul 1.2: Serial Debug, Sinyal Analog & PWM](02-serial-debug-dan-analog-pwm.md)**!
