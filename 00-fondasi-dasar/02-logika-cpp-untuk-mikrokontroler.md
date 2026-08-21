# 💻 Modul 0.2: Logika Pemrograman C++ dari Nol untuk Mikrokontroler

> **Fase 0: Fondasi Dasar**  
> **Target Pembaca:** Pemula yang belum pernah belajar bahasa C++ sebelumnya dan ingin memahami cara mengontrol mikrokontroler dengan logika yang bersih.  
> **Estimasi Waktu Belajar:** 45–60 Menit  
> **Alat Praktik:** [Wokwi Simulator ESP32 (Serial Monitor)](https://wokwi.com/esp32)

---

## 🧭 Daftar Isi Modul
1. [Mengapa Mikrokontroler Menggunakan Bahasa C/C++?](#1-mengapa-mikrokontroler-menggunakan-bahasa-cc)
2. [Anatomi Program: Perbedaan Sakral `setup()` dan `loop()`](#2-anatomi-program-perbedaan-sakral-setup-dan-loop)
3. [Variabel & Tipe Data Hemat Memori (*Fixed-Width Types*)](#3-variabel--tipe-data-hemat-memori-fixed-width-types)
4. [Scope Memori: Variabel Global (SRAM) vs Variabel Lokal (Stack)](#4-scope-memori-variabel-global-sram-vs-variabel-lokal-stack)
5. [Pengambilan Keputusan: Percabangan (`if-else` & `switch-case`)](#5-pengambilan-keputusan-percabangan-if-else--switch-case)
6. [Perulangan Berulang: `for` dan `while`](#6-perulangan-berulang-for-dan-while)
7. [Fungsi Kustom: Memecah Kode Menjadi Modular](#7-fungsi-kustom-memecah-kode-menjadi-modular)
8. [Array & Buffer Data Sensor](#8-array--buffer-data-sensor)
9. [Pointer & Referensi Ramah Pemula (Analogi Alamat Rumah)](#9-pointer--referensi-ramah-pemula-analogi-alamat-rumah)
10. [Manipulasi Bitwise Dasar (Mengapa Bit Sangat Penting di IoT)](#10-manipulasi-bitwise-dasar-mengapa-bit-sangat-penting-di-iot)
11. [Laboratorium Praktik: Eksperimen Interaktif di Serial Monitor Wokwi](#11-laboratorium-praktik-eksperimen-interaktif-di-serial-monitor-wokwi)
12. [Glosarium & Ringkasan Modul](#12-glosarium--ringkasan-modul)

---

## 1. Mengapa Mikrokontroler Menggunakan Bahasa C/C++?

Di dunia web atau aplikasi HP, bahasa seperti Python, JavaScript, atau Java sangat populer. Namun di dunia mikrokontroler (seperti ESP32, STM32, Arduino), **bahasa C dan C++ tetap menjadi raja tak tergantikan**.

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│     BAHASA TINGKAT TINGGI (PYTHON)   │         BAHASA C / C++ EMBEDDED      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Butuh penerjemah (Interpreter/VM)    │ Diterjemahkan langsung ke bahasa biner│
│ Boros RAM (1 variabel butuh puluhan B)│ Sangat hemat RAM (1 byte murni)      │
│ Eksekusi lebih lambat                │ Eksekusi secepat kilat (Real-Time)   │
│ Tidak bisa akses register silikon    │ Akses langsung ke pin & memori chip  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

> 💡 **Intinya:** C++ memberi kita kekuatan untuk mengontrol setiap bit kabel dan chip silikon dengan efisiensi maksimal tanpa memboroskan memori ESP32 yang terbatas (520 KB).

---

## 2. Anatomi Program: Perbedaan Sakral `setup()` dan `loop()`

Setiap program mikrokontroler memiliki **2 fungsi wajib** yang menjadi jantung hidupnya:

```cpp
void setup() {
  // BAGIAN 1: DIJALANKAN HANYA 1 KALI SAAT ESP32 PERTAMA KALI MENYALA
  // Digunakan untuk: Inisialisasi pin, sambungkan Wi-Fi, atur Serial Monitor.
}

void loop() {
  // BAGIAN 2: DIJALANKAN BERPUTAR-PUTAR TERUS MENERUS SELAMANYA
  // Begitu baris terakhir selesai, langsung otomatis mengulang dari baris pertama.
  // Digunakan untuk: Membaca sensor, mengirim data, menyalakan alarm.
}
```

```
     [ COLOK LISTRIK / NYALAKAN ]
                  │
                  ▼
          ┌───────────────┐
          │  setup()      │  (Dieksekusi 1x)
          └───────┬───────┘
                  │
                  ▼
        ┌──► ┌─────────────┐
        │    │  loop()     │ ◄──┐
        │    └──────┬──────┘    │ (Berputar terus tanpa henti
        │           │           │  sampai listrik dicabut)
        └───────────┴───────────┘
```

---

## 3. Variabel & Tipe Data Hemat Memori (*Fixed-Width Types*)

Variabel adalah **kotak penyimpanan data di dalam memori RAM**. Di mikrokontroler, kita harus memilih ukuran kotak yang pas agar RAM tidak cepat habis:

```
┌──────────────┬───────────────┬───────────────────────────────┬──────────────────────────┐
│ TIPE DATA    │ UKURAN MEMORI │ RENTANG NILAI YANG DISIMPAN   │ CONTOH PENGGUNAAN        │
├──────────────┼───────────────┼───────────────────────────────┼──────────────────────────┤
│ `bool`       │ 1 Bit / 1 Byte│ `true` (1) atau `false` (0)   │ Status sakelar lampu     │
│ `uint8_t`    │ 1 Byte (8-bit)│ `0` hingga `255`              │ Persentase / Nilai PWM   │
│ `int16_t`    │ 2 Byte(16-bit)│ `-32.768` hingga `32.767`     │ Nilai Sensor ADC 12-Bit  │
│ `int32_t`    │ 4 Byte(32-bit)│ `-2 Miliar` hingga `+2 Miliar`│ Penghitung waktu / Milis │
│ `float`      │ 4 Byte        │ Angka desimal (6-7 digit)     │ Suhu ($28.5^\circ\text{C}$)│
│ `char`       │ 1 Byte        │ 1 Huruf/Karakter tunggal      │ `'A'`, `'B'`, `'\n'`     │
└──────────────┴───────────────┴───────────────────────────────┴──────────────────────────┘
```

### 💡 Mengapa Menggunakan `uint8_t` Daripada `int` Biasa?
- Di ESP32, tipe data `int` standar berukuran **4 Byte (32-bit)**.
- Jika Anda hanya ingin menyimpan persentase baterai ($0-100\%$), memakai `int` membuang 3 byte memori sia-sia.
- Dengan `uint8_t` (*Unsigned Integer 8-bit*), kita hanya memakai **1 Byte**. Jika Anda punya ribuan data sensor, penghematan ini sangat masif!

---

## 4. Scope Memori: Variabel Global (SRAM) vs Variabel Lokal (Stack)

Tempat di mana Anda menuliskan variabel menentukan berapa lama variabel tersebut hidup di dalam memori:

```cpp
// 1. VARIABEL GLOBAL (Ditulis di luar semua fungsi)
// Hidup selamanya di memori SRAM selama ESP32 menyala.
// Bisa diakses oleh setup(), loop(), maupun fungsi lainnya.
int totalDetakJantung = 0; 

void loop() {
  // 2. VARIABEL LOKAL (Ditulis di dalam kurung kurawal fungsi)
  // Hanya hidup sesaat saat fungsi ini berjalan.
  // Begitu loop() selesai, kotak memori ini langsung DIHAPUS.
  int suhuRuanganSekarang = 28; 
  
  totalDetakJantung++; // Mengubah variabel global
}
```

---

## 5. Pengambilan Keputusan: Percabangan (`if-else` & `switch-case`)

Mikrokontroler menjadi "cerdas" karena kemampuannya mengambil keputusan berdasarkan kondisi sensor:

```cpp
float suhu = 38.5;

if (suhu > 35.0) {
  // Kondisi A: Jika suhu lebih dari 35 derajat
  Serial.println("🚨 BAHAYA: Suhu terlalu panas! Nyalakan Kipas.");
} else if (suhu < 18.0) {
  // Kondisi B: Jika suhu kurang dari 18 derajat
  Serial.println("❄️ DINGIN: Nyalakan Pemanas.");
} else {
  // Kondisi C: Jika suhu normal (antara 18 dan 35)
  Serial.println("✅ Suhu aman dan nyaman.");
}
```

---

## 6. Perulangan Berulang: `for` dan `while`

Digunakan saat kita ingin mengulang sebuah perintah beberapa kali secara otomatis:

```cpp
// CONTOH FOR LOOP: Mengedipkan lampu LED sebanyak 5 kali
for (int i = 1; i <= 5; i++) {
  digitalWrite(2, HIGH); // Nyala
  delay(200);
  digitalWrite(2, LOW);  // Padam
  delay(200);
  Serial.printf("Kedipan ke-%d selesai\n", i);
}
```

---

## 7. Fungsi Kustom: Memecah Kode Menjadi Modular

Jangan menulis semua kode di dalam satu fungsi `loop()` yang panjang dan berantakan (*Spaghetti Code*). Pecah kode ke dalam fungsi-fungsi kecil yang rapi:

```cpp
// 1. Fungsi kustom untuk menghitung konversi Celcius ke Fahrenheit
float celciusKeFahrenheit(float c) {
  float f = (c * 9.0 / 5.0) + 32.0;
  return f; // Mengembalikan hasil perhitungan
}

void loop() {
  float suhuC = 30.0;
  // 2. Memanggil fungsi kustom kita
  float suhuF = celciusKeFahrenheit(suhuC);
  
  Serial.printf("Suhu: %.1f C = %.1f F\n", suhuC, suhuF);
  delay(2000);
}
```

---

## 8. Array & Buffer Data Sensor

**Array** adalah deretan kotak memori bersebelahan yang memiliki nama yang sama dan diakses menggunakan nomor urut indeks (dimulai dari angka `0`):

```
                       ARRAY sensorSuhu[4]
                       
          Indeks 0       Indeks 1       Indeks 2       Indeks 3
        ┌──────────────┬──────────────┬──────────────┬──────────────┐
        │     28.5     │     29.1     │     30.0     │     28.8     │
        └──────────────┴──────────────┴──────────────┴──────────────┘
```

```cpp
// Mendeklarasikan array berisi 4 pembacaan suhu
float riwayatSuhu[4] = {28.5, 29.1, 30.0, 28.8};

void setup() {
  Serial.begin(115200);
  // Mengakses data indeks ke-0 (data pertama)
  Serial.println(riwayatSuhu[0]); // Mencetak 28.5
}
```

---

## 9. Pointer & Referensi Ramah Pemula (Analogi Alamat Rumah)

Banyak pemula menganggap **Pointer** adalah materi paling menyeramkan di C++. Mari kita sederhanakan dengan analogi nyata:

```
      RUMAH FISIK (Variabel)                     KERTAS CATATAN (Pointer)
   ┌───────────────────────────┐                ┌───────────────────────────┐
   │ Nomor Rumah : 0x3FFE0014  │ ◄─── Menunjuk  │ Berisi tulisan:           │
   │ Penghuni    : 42          │      Alamat    │ "0x3FFE0014"              │
   └───────────────────────────┘                └───────────────────────────┘
```

1. **Variabel Biasa (`int umur = 42;`):** Rumah tempat tinggal angka `42`.
2. **Operator Alamat (`&umur`):** Memberitahu di mana **nomor alamat rumah** tempat variabel itu berada di RAM (misal: alamat memori `0x3FFE0014`).
3. **Pointer (`int* ptrUmur = &umur;`):** Kertas catatan yang menyimpan tulisan alamat `0x3FFE0014` tersebut.
4. **Dereference (`*ptrUmur`):** Mendatangi alamat rumah tersebut dan mengambil/mengubah angka di dalamnya.

```cpp
int nilaiSensor = 100;
int* ptr = &nilaiSensor; // ptr sekarang memegang alamat memori nilaiSensor

*ptr = 250; // Kita mengubah isi rumah lewat pointer!

// Sekarang nilaiSensor otomatis berubah menjadi 250!
Serial.println(nilaiSensor); // Mencetak 250
```

> 💡 **Mengapa Pointer Dipakai di IoT?**  
> Saat membaca paket data sensor sebesar 1024 byte, mengirim pointer alamatnya jauh lebih cepat dan hemat RAM daripada harus menyalin/menggandakan 1024 byte tersebut berkali-kali!

---

## 10. Manipulasi Bitwise Dasar (Mengapa Bit Sangat Penting di IoT)

Satu byte terdiri dari **8 Bit** angka biner (hanya bernilai `0` atau `1`):  
`0b00000000` hingga `0b11111111`.

Di IoT, kita sering menghemat kuota transmisi dengan menggabungkan 8 status sakelar lampu sekaligus ke dalam **1 Byte data tunggal**:

```
                       1 BYTE STATUS 8 SAKELAR LAMPU
                       
        Lampu 7   Lampu 6   Lampu 5   Lampu 4   Lampu 3   Lampu 2   Lampu 1   Lampu 0
       ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
       │    1    │    0    │    1    │    1    │    0    │    0    │    0    │    1    │
       └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
         (ON)      (OFF)     (ON)      (ON)      (OFF)     (OFF)     (OFF)     (ON)
```

### Operator Bitwise Utama:
- **AND (`&`):** Memeriksa apakah bit tertentu bernilai 1.
- **OR (`|`):** Menyalakan bit tertentu menjadi 1.
- **XOR (`^`):** Membalikkan status bit (1 jadi 0, 0 jadi 1).
- **Bit Shift (`<<` dan `>>`):** Menggeser posisi bit ke kiri atau ke kanan.

---

## 11. Laboratorium Praktik: Eksperimen Interaktif di Serial Monitor Wokwi

Mari kita uji pemahaman logika C++ Anda langsung di simulator browser!

### 💻 Buka [wokwi.com/esp32](https://wokwi.com/esp32) dan Masukkan Kode Ini:

```cpp
// ==========================================================
// PRAKTIK MODUL 0.2: UJI LOGIKA C++ & SERIAL MONITOR
// ==========================================================

void setup() {
  // 1. Mulai komunikasi serial dengan baud rate 115200
  Serial.begin(115200);
  delay(500); // Beri waktu serial monitor untuk siap
  
  Serial.println("========================================");
  Serial.println("🚀 ESP32 SIAP! MEMULAI UJI LOGIKA C++...");
  Serial.println("========================================");
}

void loop() {
  // Mengambil angka acak simulasi sensor suhu (antara 20 hingga 45)
  int suhuSimulasi = random(20, 46);
  
  Serial.printf("\n[SENSOR DATA] Suhu Terbaca: %d C -> ", suhuSimulasi);
  
  // Logika pengambilan keputusan if-else
  if (suhuSimulasi >= 40) {
    Serial.print("🔥 STATUS: OVERHEAT! Pompa air pendingin AKTIF.");
  } else if (suhuSimulasi >= 30) {
    Serial.print("⚠️ STATUS: HANGAT. Kipas pendingin menyala sedang.");
  } else {
    Serial.print("✅ STATUS: NORMAL. Semua sistem stabil.");
  }
  
  // Jeda 2 detik sebelum membaca data berikutnya
  delay(2000);
}
```

### 🎯 Langkah Eksekusi:
1. Klik tombol **Play (Hijau)** di Wokwi.
2. Buka panel **"Serial Monitor"** di bagian bawah simulator.
3. Anda akan melihat log teks evaluasi sensor suhu muncul secara dinamis tiap 2 detik!

---

## 12. Glosarium & Ringkasan Modul

| Istilah | Penjelasan Sederhana |
| :--- | :--- |
| **SRAM** | Memori kerja sementara tempat variabel global dan lokal disimpan saat chip hidup. |
| **Stack** | Area memori tempat variabel lokal dibuat saat fungsi dipanggil dan dihapus saat fungsi selesai. |
| **Heap** | Area memori dinamis untuk alokasi objek ukuran besar. |
| **Baud Rate** | Kecepatan ketukan transmisi data serial (diatur pada `Serial.begin(115200)`). |
| **Pointer (`*`)** | Variabel khusus yang menyimpan alamat nomor memori dari variabel lain. |

---

> 🎉 **Hebat!** Anda kini telah menguasai logika pemrograman C++ inti untuk mikrokontroler!
> 
> 👉 **Langkah Selanjutnya:** Mari kita lengkapi fondasi software kita dengan mempelajari bahasa Python untuk Gateway dan Cloud di **[Modul 0.3: Logika Python untuk IoT](03-logika-python-untuk-iot.md)**!
