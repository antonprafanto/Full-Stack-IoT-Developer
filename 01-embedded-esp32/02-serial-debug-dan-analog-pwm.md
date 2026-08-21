# 🎛️ Modul 1.2: Serial Debugging Canggih, Sinyal Analog (ADC 12-Bit) & Kontrol PWM

> **Fase 1: Rekayasa Hardware & Sensor ESP32**  
> **Target Pembaca:** Pemula yang ingin mencetak log diagnostik data dengan rapi, membaca sensor analog presisi, dan mengatur kecerahan lampu / putaran motor servo menggunakan PWM.  
> **Estimasi Waktu Belajar:** 45–60 Menit  
> **Alat Praktik:** [Wokwi Simulator ESP32](https://wokwi.com/esp32) atau Board ESP32 fisik + Potensiometer + Servo SG90 + LED.

---

## 🧭 Daftar Isi Modul
1. [Komunikasi Serial UART & Seni Debugging dengan `Serial.printf()`](#1-komunikasi-serial-uart--seni-debugging-dengan-serialprintf)
2. [Membaca Input Teks dari Pengguna Lewat Serial Monitor](#2-membaca-input-teks-dari-pengguna-lewat-serial-monitor)
3. [Dunia Sinyal Analog: Mengapa Dunia Nyata Bersifat Analog?](#3-dunia-sinyal-analog-mengapa-dunia-nyata-bersifat-analog)
4. [ADC 12-Bit ESP32 (`analogRead`): Membaca Rentang 0 hingga 4095](#4-adc-12-bit-esp32-analogread-membaca-rentang-0-hingga-4095)
5. [Fungsi Kalibrasi Matematis `map()`: Mengubah Voltase Menjadi Satuan Manusia](#5-fungsi-kalibrasi-matematis-map-mengubah-voltase-menjadi-satuan-manusia)
6. [Mengenal PWM (Pulse Width Modulation): Membuat Efek Lampu Redup-Terang](#6-mengenal-pwm-pulse-width-modulation-membuat-efek-lampu-redup-terang)
7. [Kontrol Sudut Motor Servo SG90 ($0^\circ - 180^\circ$) Menggunakan Sinyal PWM](#7-kontrol-sudut-motor-servo-sg90-0circ---180circ-menggunakan-sinyal-pwm)
8. [Laboratorium Praktik: Potensiometer Pengontrol Sudut Servo di Wokwi](#8-laboratorium-praktik-potensiometer-pengontrol-sudut-servo-di-wokwi)
9. [Kotak Antisipasi Error & Glosarium](#9-kotak-antisipasi-error--glosarium)

---

## 1. Komunikasi Serial UART & Seni Debugging dengan `Serial.printf()`

Banyak pemula mencetak log debugging menggunakan `Serial.print()` bertumpuk-tumpuk yang membuat kode menjadi sangat panjang dan sulit dibaca.

```cpp
// ❌ CARA LAMA (Panjang & Melelahkan):
Serial.print("Node: ");
Serial.print(nodeId);
Serial.print(" | Suhu: ");
Serial.print(suhu);
Serial.print(" C | Baterai: ");
Serial.println(tegangan);
```

### ✅ CARA MODERN: Gunakan `Serial.printf()` (Format String):
C++ ESP32 mendukung format string elegan menggunakan karakter *placeholder*:

```cpp
// ✅ HANYA 1 BARIS (Bersih, Rapi & Profesional):
Serial.printf("Node: %s | Suhu: %.2f C | Baterai: %.1f V | Status: %d\n", nodeId, suhu, tegangan, statusReady);
```

### 🏷️ Tabel Placeholder yang Wajib Diingat:
- `%d` atau `%i` : Bilangan bulat (*Integer*)
- `%f` : Bilangan desimal (*Float*) $\rightarrow$ `%.2f` artinya hanya tampilkan 2 angka di belakang koma.
- `%s` : Teks kalimat (*String*)
- `%x` : Format heksadesimal (*Hexadecimal*)
- `\n` : Karakter ganti baris baru (*New Line / Enter*)

---

## 2. Membaca Input Teks dari Pengguna Lewat Serial Monitor

Komunikasi serial bukan hanya satu arah (ESP32 $\rightarrow$ Laptop), tetapi juga **dua arah (Laptop $\rightarrow$ ESP32)**:

```cpp
void setup() {
  Serial.begin(115200);
  Serial.println("Ketik 'ON' untuk menyalakan LED, atau 'OFF' untuk mematikan:");
  pinMode(2, OUTPUT);
}

void loop() {
  // Periksa apakah ada pesan teks baru yang masuk dari keyboard laptop
  if (Serial.available() > 0) {
    String perintah = Serial.readStringUntil('\n'); // Baca teks sampai tombol Enter ditekan
    perintah.trim(); // Hapus spasi berlebih
    
    if (perintah == "ON") {
      digitalWrite(2, HIGH);
      Serial.println("💡 Lampu BERHASIL Dinyalakan!");
    } else if (perintah == "OFF") {
      digitalWrite(2, LOW);
      Serial.println("🌑 Lampu BERHASIL Dipadamkan.");
    } else {
      Serial.printf("❓ Perintah tidak dikenal: '%s'\n", perintah.c_str());
    }
  }
}
```

---

## 3. Dunia Sinyal Analog: Mengapa Dunia Nyata Bersifat Analog?

Dunia digital komputer hanya mengenal **2 kondisi kaku: `0` (Mati) dan `1` (Hidup)**.  
Namun di dunia fisik nyata, alam bekerja secara **kontinu (Analog)**:
- Suhu udara tidak melompat dari panas ke dingin secara instan, melainkan naik perlahan ($25.1^\circ\text{C} \rightarrow 25.2^\circ\text{C} \rightarrow 25.3^\circ\text{C}$).
- Cahaya matahari berangsur-angsur meredup saat senja.

Untuk membaca dunia fisik yang kontinu ini, mikrokontroler membutuhkan alat penerjemah bernama **ADC (*Analog-to-Digital Converter*)**.

---

## 4. ADC 12-Bit ESP32 (`analogRead`): Membaca Rentang 0 hingga 4095

ESP32 memiliki konverter ADC beresolusi **12-Bit**:
$$2^{12} = 4096 \text{ tingkat pembagian}$$

```
                          KONVERSI TEGANGAN KE ANGKA ADC
                          
       Tegangan Input Fisik :   0.0 Volt ──────── 1.65 Volt ──────── 3.3 Volt
                                   │                   │                 │
       Angka Digital Terbaca :     0                 2048              4095
```

```cpp
// Gunakan pin ADC1 yang aman (GPIO 32, 33, 34, 35, 36, 39)
const int PIN_POTENSIOMETER = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  // 1. Membaca angka mentah 0 - 4095
  int nilaiMentah = analogRead(PIN_POTENSIOMETER);
  
  // 2. Mengonversi angka mentah kembali menjadi Voltase fisik asli
  float voltase = (nilaiMentah / 4095.0) * 3.3;
  
  Serial.printf("Nilai Mentah: %4d | Voltase: %.2f V\n", nilaiMentah, voltase);
  delay(500);
}
```

---

## 5. Fungsi Kalibrasi Matematis `map()`: Mengubah Voltase Menjadi Satuan Manusia

Angka mentah `0 - 4095` tidak bermakna bagi pengguna awam. Pengguna ingin melihat **Persentase Baterai ($0\% - 100\%$)** atau **Level Tangki Air ($0 - 500\text{ Liter}$)**.

Fungsi `map()` adalah alat scaling matematis instan:

```cpp
int nilaiADC = analogRead(34); // Nilai antara 0 hingga 4095

// Rumus: map(nilai, batasBawahAsli, batasAtasAsli, batasBawahTujuan, batasAtasTujuan)
int persentase = map(nilaiADC, 0, 4095, 0, 100);
int levelTangkiAir = map(nilaiADC, 0, 4095, 0, 500); // dalam satuan Liter

Serial.printf("Kapasitas Air: %d Liter (%d%%)\n", levelTangkiAir, persentase);
```

---

## 6. Mengenal PWM (*Pulse Width Modulation*): Membuat Efek Lampu Redup-Terang

Pin digital ESP32 tidak bisa mengeluarkan tegangan $1.5\text{V}$ secara alami (pin hanya bisa $0\text{V}$ atau $3.3\text{V}$).  
Lalu bagaimana cara membuat lampu LED menyala redup? **Jawabannya: PWM (*Pulse Width Modulation*)**.

PWM menyalakan dan mematikan sinyal $3.3\text{V}$ dengan **kecepatan ribuan kali per detik**. Mata manusia tidak bisa melihat kedipan secepat itu, melainkan melihatnya sebagai lampu yang menyala **redup atau terang (*Duty Cycle*)**:

```
      DUTY CYCLE 25% (Lampu Redup)              DUTY CYCLE 75% (Lampu Terang)
      
      3.3V ──┐    ┌──┐    ┌──               3.3V ──────┐  ┌──────┐  ┌───
             │    │  │    │                        │  │  │      │  │
        0V   └───┘  └───┘  └──                0V   └──┘  └──┘  └──┘
             (25% On, 75% Off)                     (75% On, 25% Off)
```

### 💻 Efek Lampu Bernapas (*Fading / Breathing LED*) di ESP32:

```cpp
const int PIN_LED = 23;

void setup() {
  // Pada ESP32 Arduino Core v3.x+, PWM sangat mudah digunakan!
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // 1. Lampu berangsur-angsur semakin TERANG (0 -> 255)
  for (int duty = 0; duty <= 255; duty += 5) {
    analogWrite(PIN_LED, duty);
    delay(20);
  }
  
  // 2. Lampu berangsur-angsur semakin REDUP (255 -> 0)
  for (int duty = 255; duty >= 0; duty -= 5) {
    analogWrite(PIN_LED, duty);
    delay(20);
  }
}
```

---

## 7. Kontrol Sudut Motor Servo SG90 ($0^\circ - 180^\circ$) Menggunakan Sinyal PWM

Motor Servo SG90 adalah aktuator putar presisi yang menggunakan pulsa PWM $50\text{ Hz}$ (periode $20\text{ ms}$) untuk menentukan sudut putar sayapnya:

```
                    PULSA SUDUT MOTOR SERVO SG90
                    
       Pulsa 1.0 ms (5% Duty)   ══► Sayap Berputar ke Sudut 0°
       Pulsa 1.5 ms (7.5% Duty) ══► Sayap Berputar ke Sudut 90° (Tengah)
       Pulsa 2.0 ms (10% Duty)  ══► Sayap Berputar ke Sudut 180°
```

### 💻 Mengontrol Servo dengan Library `ESP32Servo`:

```cpp
#include <ESP32Servo.h>

Servo servoMotor;
const int PIN_SERVO = 18;

void setup() {
  servoMotor.attach(PIN_SERVO); // Hubungkan servo ke GPIO 18
}

void loop() {
  servoMotor.write(0);   // Putar ke 0 derajat
  delay(1000);
  servoMotor.write(90);  // Putar ke 90 derajat
  delay(1000);
  servoMotor.write(180); // Putar ke 180 derajat
  delay(1000);
}
```

---

## 8. Laboratorium Praktik: Potensiometer Pengontrol Sudut Servo di Wokwi

Mari kita hubungkan sensor analog (Potensiometer) untuk mengendalikan sudut motor servo secara real-time!

### 🛠️ Diagram Rangkaian Virtual:
```
       ESP32 BOARD
    ┌──────────────┐
    │              │
    │      GPIO 34 ├────────── [ Kaki Tengah Potensiometer (Sinyal Analog) ]
    │      GPIO 18 ├────────── [ Kabel Oranye Servo (PWM Data) ]
    │          3V3 ├────────── [ Kaki Kiri Potensiometer & Kabel Merah Servo ]
    │          GND ├────────── [ Kaki Kanan Potensiometer & Kabel Cokelat Servo ]
    └──────────────┘
```

### 💻 Salin Kode Ini ke [wokwi.com/esp32](https://wokwi.com/esp32):

```cpp
// ==========================================================
// PRAKTIK MODUL 1.2: ANALOG TO SERVO CONTROLLER
// ==========================================================
#include <ESP32Servo.h>

Servo myServo;
const int PIN_POT = 34;
const int PIN_SERVO = 18;

void setup() {
  Serial.begin(115200);
  myServo.attach(PIN_SERVO);
  Serial.println("🚀 Sistem Analog to Servo Aktif!");
}

void loop() {
  // 1. Baca nilai potensiometer (0 - 4095)
  int rawADC = analogRead(PIN_POT);
  
  // 2. Petakan nilai 0-4095 menjadi sudut 0-180 derajat
  int sudut = map(rawADC, 0, 4095, 0, 180);
  
  // 3. Gerakkan motor servo ke sudut tersebut
  myServo.write(sudut);
  
  Serial.printf("ADC Mentah: %4d ===> Sudut Servo: %3d Derajat\n", rawADC, sudut);
  delay(50); // Jeda pembaruan halus 20x per detik
}
```

---

## 9. Kotak Antisipasi Error & Glosarium

> [!WARNING]
> ### 🚨 Troubleshooting Masalah Analog & Servo:
> 1. **Nilai ADC selalu bernilai 4095 atau loncat liar:** Kaki tengah potensiometer Anda kemungkinan longgar (*floating*) atau Anda memakai pin ADC2 saat Wi-Fi menyala. Selalu gunakan pin **ADC1 (GPIO 34 atau 32)**.
> 2. **Servo bergetar (*jittering*) dan ESP32 restart sendiri:** Motor servo menyedot lonjakan arus sesaat saat bergerak. Jika menggunakan alat fisik, pasang kapasitor elektrolit $100\mu\text{F}$ di antara kabel Merah ($+$) dan Cokelat (GND) servo untuk menyerap kejutan arus (*Brownout protection*).

### 📚 Glosarium Modul 1.2:
- **ADC (*Analog-to-Digital Converter*):** Modul internal chip yang mengubah tegangan listrik kontinu menjadi angka diskrit (resolusi 12-bit = 0 hingga 4095).
- **PWM (*Pulse Width Modulation*):** Teknik memodulasi lebar pulsa on/off frekuensi tinggi untuk mengendalikan daya rata-rata lampu atau motor.
- **Duty Cycle:** Persentase waktu aktif sinyal dalam satu siklus gelombang ($0\% = \text{Mati Total}, 100\% = \text{Nyala Penuh}$).

---

> 🎉 **Luar Biasa!** Anda telah menguasai logging serial tingkat lanjut, pembacaan sinyal analog 12-bit, dan kendali motor aktuator PWM!
> 
> 👉 **Langkah Selanjutnya:** Mari kita pelajari teknik multitasking paling penting di dunia embedded: **[Modul 1.3: Mengatasi Jebakan delay() dengan millis() & State Machine](03-nonblocking-millis-dan-fsm.md)**!
