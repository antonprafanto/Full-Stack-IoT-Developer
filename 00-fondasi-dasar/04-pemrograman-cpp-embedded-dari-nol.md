# 💻 Modul 0.4: Pemrograman C/C++ dari Nol — Khusus Mikrokontroler & Embedded IoT

> **Tingkat Kesulitan:** Sangat Ramah Pemula (*Zero Prerequisite*)  
> **Estimasi Waktu Membaca & Praktik:** 25–30 Menit  
> **Tools yang Digunakan:** Browser Web (Kompiler Online [OnlineGDB](https://www.onlinegdb.com/) atau [Wokwi Simulator](https://wokwi.com/))  

---

## 🌟 Mengapa Belajar C/C++ untuk Mikrokontroler Berbeda dengan Belajar C++ untuk Komputer?

Banyak orang merasa takut saat mendengar kata **C++**. Mereka membayangkan buku tebal ribuan halaman yang penuh rumus rumit.

Namun, ada satu rahasia besar: **C++ untuk Mikrokontroler (Embedded C++) jauh lebih ringkas, terarah, dan menyenangkan!**  
Di mikrokontroler, kita tidak membuat antarmuka game 3D yang rumit. Kita menggunakan C++ untuk:
1. Menyalakan/mematikan sakelar pin silikon (**Digital I/O**).
2. Membaca angka tegangan sensor (**ADC**).
3. Mengirimkan data angka tersebut melalui gelombang Wi-Fi/Bluetooth ke server cloud.

Di modul ini, kita akan mempelajari C++ dari titik nol absolut. Kita akan membedah konsep yang paling sering membuat orang bingung (seperti **Pointer** dan **Operasi Bitwise**) menggunakan **analogi dunia nyata** yang sangat mudah dipahami!

---

## 🧭 Peta Pembelajaran Modul Ini

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 0.4                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Dua Jantung Program: setup() dan loop()                             │
│ 2. Tipe Data Fixed-Width: Mengapa Kita Menghindari 'int' Biasa?        │
│ 3. Ruang Hidup Variabel: SRAM Global vs Stack Lokal                    │
│ 4. Logika Percabangan & Perulangan (Serta Bahaya Loop Beku!)          │
│ 5. Fungsi Kustom: Membuat Kode yang Bersih dan Rapi                    │
│ 6. Array: Menyimpan Riwayat Data Sensor                                │
│ 7. Membedah Pointer C++ dengan Analogi "Nomor Rumah" (& dan *)         │
│ 8. Operasi Bitwise: Cara Mengendalikan Bit 0 dan 1 (AND, OR, Shift)    │
│ 9. Uji Coba Langsung di Browser & Kuis Pemahaman                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Dua Jantung Program: `setup()` dan `loop()`

Setiap program mikrokontroler (ESP32/Arduino) memiliki **dua fungsi utama yang wajib ada**:

```cpp
void setup() {
  // BAGIAN 1: DIEKSEKUSI HANYA 1 KALI SAAT ESP32 PERTAMA KALI NYALA
  // Tempat inisialisasi: setup pin, mulai komunikasi serial, koneksi Wi-Fi.
}

void loop() {
  // BAGIAN 2: DIEKSEKUSI BERULANG-ULANG TANPA HENTI SELAMA ADA LISTRIK
  // Tempat logika utama: baca sensor -> proses data -> kirim ke cloud.
}
```

```
       [ LISTRIK DINYALAKAN ]
                 │
                 ▼
          ┌─────────────┐
          │   setup()   │ ◄── Dijalankan 1 kali saja (Persiapan alat)
          └──────┬──────┘
                 │
                 ▼
         ┌──► ┌─────────┐
         │    │ loop()  │ ◄── Dijalankan berputar terus-menerus (Siklus hidup)
         └─── └─────────┘
```

---

## 2. Tipe Data Fixed-Width: Mengapa Jangan Asal Pakai `int`?

Di komputer laptop dengan RAM 16 Gigabyte, Anda bebas membuat ribuan variabel `int` tanpa takut kehabisan memori.  
Namun di ESP32, kita hanya memiliki RAM sekitar **520 Kilobyte**! Setiap tetes bita (*byte*) memori sangat berharga.

Pada C++ standar, ukuran `int` bisa berbeda-beda tergantung prosesor (bisa 2 byte, bisa 4 byte). Oleh karena itu, di dunia IoT industri, kita **WAJIB menggunakan Tipe Data Fixed-Width** yang ukurannya pasti dan terukur:

```
┌─────────────────┬──────────┬─────────────────────────────┬───────────────────────────┐
│ Tipe Data IoT   │ Ukuran   │ Rentang Nilai yang Ditampung│ Contoh Penggunaan Nyata   │
├─────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ bool            │ 1 byte   │ true (1) atau false (0)     │ Status sakelar ON / OFF   │
│ uint8_t         │ 1 byte   │ 0 s/d 255 (Hanya Positif)   │ Nomor Pin GPIO, Kecerahan │
│ int8_t          │ 1 byte   │ -128 s/d 127                │ Suhu ruangan dingin       │
│ uint16_t        │ 2 bytes  │ 0 s/d 65.535                │ Nilai Sensor ADC (0-4095) │
│ int16_t         │ 2 bytes  │ -32.768 s/d 32.767          │ Data Akselerometer / Gyro │
│ uint32_t        │ 4 bytes  │ 0 s/d 4.294.967.295         │ Waktu milidetik millis()  │
│ float           │ 4 bytes  │ Angka Desimal (Presisi 6-7) │ Suhu 28.75 °C, GPS Lat/Lng│
└─────────────────┴──────────┴─────────────────────────────┴───────────────────────────┘
```

> [!TIP]
> **Cara Membaca Nama Tipe Data:**
> - Huruf **`u`** di depan = *Unsigned* (Hanya bilangan positif tanpa tanda minus, kapasitas tampung positifnya jadi 2x lipat).
> - Angka **`8`, `16`, `32`** = Jumlah **bit** memori yang dipakai ($8\text{ bit} = 1\text{ byte}$).
> - Huruf **`_t`** di belakang = *Type definition* standar C++.

---

## 3. Ruang Hidup Variabel: SRAM Global vs Stack Lokal

Di mana variabel Anda disimpan di dalam chip?

```
               PETA MEMORI RAM (SRAM) ESP32
               
    ┌───────────────────────────────────────────────┐
    │ 1. DATA SECTION (GLOBAL VARIABLES)            │
    │ • Variabel yang dibuat di luar fungsi.        │
    │ • Hidup selamanya selama ESP32 menyala.       │
    ├───────────────────────────────────────────────┤
    │ 2. STACK MEMORY (LOCAL VARIABLES)             │
    │ • Variabel yang dibuat di dalam kurung { }.   │
    │ • Lahir saat fungsi dipanggil, langsung mati  │
    │   dan dihapus dari memori saat fungsi selesai!│
    └───────────────────────────────────────────────┘
```

### Contoh Kode:
```cpp
#include <Arduino.h>

// VARIABEL GLOBAL: Dibuat di luar fungsi. 
// Bisa diakses oleh setup(), loop(), atau fungsi manapun.
uint16_t totalDetik = 0; 

void loop() {
  // VARIABEL LOKAL: Dibuat di dalam loop().
  // Hanya hidup di dalam loop(), setelah kurung kurawal tutup '}' variabel ini musnah!
  float suhuSekarang = 27.5; 
  
  totalDetik++;
  delay(1000);
}
```

---

## 4. Logika Percabangan & Perulangan

### A. Percabangan (`if - else` & `switch - case`)
Digunakan untuk mengambil keputusan otomatis berdasarkan data sensor:

```cpp
float suhu = 38.5;

if (suhu > 35.0) {
  // Jika suhu di atas 35 derajat, nyalakan kipas pendingin
  digitalWrite(18, HIGH);
  Serial.println("PERINGATAN: Suhu Terlalu Panas! Kipas Aktif.");
} else if (suhu < 20.0) {
  // Jika suhu di bawah 20 derajat, matikan kipas dan nyalakan pemanas
  digitalWrite(18, LOW);
  Serial.println("INFO: Suhu Dingin.");
} else {
  // Jika suhu normal (antara 20 s/d 35)
  digitalWrite(18, LOW);
  Serial.println("INFO: Suhu Normal.");
}
```

---

### B. Perulangan (`for` dan `while`) & Peringatan Watchdog Timer!

```cpp
// Contoh Perulangan FOR: Mengedipkan lampu LED sebanyak 5 kali
for (uint8_t i = 0; i < 5; i++) {
  digitalWrite(2, HIGH);
  delay(200);
  digitalWrite(2, LOW);
  delay(200);
}
```

> [!CAUTION]
> **Bahaya Perulangan Tak Berujung (`Infinite While Loop`):**  
> Jangan pernah membuat kode `while(kondisi)` yang tidak pernah berhenti tanpa jeda di ESP32.  
> Mikrokontroler ESP32 memiliki sistem pengawas otomatis bernama **Watchdog Timer (WDT)**. Jika CPU terkunci dalam satu perulangan lebih dari 3-5 detik tanpa memberi kesempatan proses background Wi-Fi bekerja, ESP32 akan menganggap sistem hang dan melakukan **RESTART OTOMATIS (Crash Reset)!**

---

## 5. Fungsi Kustom: Membuat Kode yang Modular

Alih-alih menulis kode yang panjang dan berantakan di dalam `loop()`, kita pecah kode menjadi fungsi-fungsi kecil yang rapi:

```cpp
// Fungsi Kustom: Menerima suhu Celsius, mengembalikan nilai Fahrenheit
float konversiKeFahrenheit(float celsius) {
  float fahrenheit = (celsius * 1.8) + 32.0;
  return fahrenheit; // Mengembalikan hasil hitungan ke pemanggil
}

void setup() {
  Serial.begin(115200);
  
  float suhuC = 30.0;
  float suhuF = konversiKeFahrenheit(suhuC); // Memanggil fungsi
  
  Serial.print("Suhu dalam Fahrenheit: ");
  Serial.println(suhuF); // Output: 86.0
}

void loop() {}
```

---

## 6. Array: Menyimpan Riwayat Data Sensor

Array adalah deretan kotak penyimpanan bertipe sama yang diberi nomor urut (*indeks*) mulai dari **angka 0**:

```
                 Array: float riwayatSuhu[4];
                 
            Indeks 0     Indeks 1     Indeks 2     Indeks 3
          ┌────────────┬────────────┬────────────┬────────────┐
          │    28.5    │    29.0    │    28.8    │    29.2    │
          └────────────┴────────────┴────────────┴────────────┘
```

### Menghitung Rata-Rata Data Sensor:
```cpp
float riwayatSuhu[4] = {28.5, 29.0, 28.8, 29.2};
float total = 0;

for (uint8_t i = 0; i < 4; i++) {
  total += riwayatSuhu[i]; // Menjumlahkan seluruh elemen
}

float rataRata = total / 4.0;
Serial.print("Rata-rata Suhu: ");
Serial.println(rataRata); // Output: 28.875
```

---

## 7. Membedah Pointer C++ dengan Analogi "Nomor Rumah"

Pointer adalah topik yang paling sering ditakuti pemula. Mari kita runtuhkan rasa takut itu dengan **Analogi Surat & Nomor Rumah**:

```
      RUMAH (VARIABEL BIASA)                 KERTAS CATATAN (POINTER)
      
    ┌────────────────────────┐              ┌────────────────────────┐
    │ ALAMAT : 0x3FFB1000    │              │ ALAMAT : 0x3FFB2004    │
    │ NAMA   : suhuRuangan   │              │ NAMA   : ptrSuhu       │
    │ ISI    : 32            │◄─────────────│ ISI    : 0x3FFB1000    │
    └────────────────────────┘              └────────────────────────┘
     (Variabel biasa menyimpan               (Pointer adalah variabel khusus
      NILAI data langsung)                    yang menyimpan ALAMAT MEMORI)
```

### Dua Simbol Sakti Pointer:
1. **Simbol Dan (`&`):** Dibaca *"Alamat dari..."*  
   Digunakan untuk mencari tahu di nomor alamat RAM sebelah mana sebuah variabel berada.
2. **Simbol Bintang (`*`):** Dibaca *"Isi dari alamat yang ditunjuk oleh..."*  
   Digunakan untuk mendatangi alamat tersebut dan membaca/mengubah isinya (*Dereferencing*).

### Mari Kita Lihat Kodenya:
```cpp
#include <Arduino.h>

void setup() {
  Serial.begin(115200);

  int suhuRuangan = 32; // Variabel biasa bernilai 32
  
  // Buat pointer 'ptrSuhu' yang menyimpan alamat memori dari 'suhuRuangan' (&)
  int* ptrSuhu = &suhuRuangan; 

  Serial.print("Nilai suhuRuangan asli : ");
  Serial.println(suhuRuangan); // Output: 32

  Serial.print("Alamat memori di RAM   : ");
  Serial.println((uint32_t)ptrSuhu, HEX); // Output contoh: 0x3FFB1000

  // Mengubah isi variabel lewat pointer menggunakan tanda bintang (*)
  *ptrSuhu = 40; 

  Serial.print("Nilai setelah diubah lewat pointer : ");
  Serial.println(suhuRuangan); // Output: 40! (Nilai aslinya ikut berubah!)
}

void loop() {}
```

### Mengapa Pointer Sangat Penting di IoT?
Bayangkan Anda memiliki data gambar kamera ESP32-CAM sebesar **50 Kilobyte**.  
- **Tanpa Pointer (*Pass by Value*):** Saat dikirim ke fungsi pengirim Wi-Fi, data 50 KB akan **dikopi/diduplikasi**, sehingga memakan RAM $50\text{ KB} + 50\text{ KB} = 100\text{ KB}$ (Memori langsung penuh dan boros!).
- **Dengan Pointer (*Pass by Reference*):** Anda hanya mengirim sebaris **Alamat Memori (hanya 4 byte!)**. Fungsi Wi-Fi langsung membaca data dari alamat aslinya tanpa membuat duplikat sama sekali! 🚀

---

## 8. Operasi Bitwise: Cara Mengendalikan Bit 0 dan 1

Di komputer desktop, kita mengolah data per file atau per kalimat. Di mikrokontroler IoT, kita sering kali harus **menyalakan atau mematikan 1 bit sakelar silikon secara langsung**.

### 5 Operator Bitwise Utama:

```
┌──────────┬─────────────────┬────────────────────────────────────────────────────────┐
│ Operator │ Nama Operasi    │ Logika Cara Kerja                                      │
├──────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ &        │ AND (Dan)       │ Hasil 1 hanya jika KEDUA bit bernilai 1.               │
│ |        │ OR (Atau)       │ Hasil 1 jika SALAH SATU atau kedua bit bernilai 1.     │
│ ^        │ XOR (Beda)      │ Hasil 1 hanya jika KEDUA bit BERBEDA (0^1 atau 1^0).   │
│ ~        │ NOT (Inversi)   │ Membalikkan bit (0 jadi 1, 1 jadi 0).                  │
│ <<       │ Shift Left      │ Menggeser bit ke kiri (mengalikan dengan 2).           │
│ >>       │ Shift Right     │ Menggeser bit ke kanan (membagi dengan 2).             │
└──────────┴─────────────────┴────────────────────────────────────────────────────────┘
```

### Contoh Nyata di IoT (Menggabungkan 2 Byte Menjadi 1 Angka 16-Bit):
Banyak sensor industri (seperti sensor suhu I2C) mengirimkan data dalam bentuk **2 potong data 8-bit (*High Byte* dan *Low Byte*)**:
- `highByte = 0x01` (Biner: `0000 0001`)
- `lowByte  = 0x2C` (Biner: `0010 1100`)

Bagaimana cara menggabungkannya menjadi 1 angka suhu utuh? **Gunakan Shift Left (`<<`) dan OR (`|`)**:

```cpp
uint8_t highByte = 0x01;
uint8_t lowByte  = 0x2C;

// Geser highByte ke kiri 8 langkah, lalu gabungkan dengan lowByte
uint16_t nilaiUtuh = (highByte << 8) | lowByte;

Serial.println(nilaiUtuh); // Output: 300 (0x012C dalam heksadesimal = 300 dalam desimal!)
```

---

## 9. Praktik Langsung di Kompiler Online (Tanpa Hardware)

Mari kita uji pemahaman sintaks C++ Anda sekarang juga di browser:

### Langkah Praktik (5 Menit):
1. Buka kompiler C++ online gratis ini: **[OnlineGDB C++ Compiler](https://www.onlinegdb.com/)**.
2. Hapus seluruh kode di layar, lalu salin dan tempelkan kode latihan terpadu ini:

```cpp
#include <iostream>
#include <cstdint>

// Fungsi menghitung rata-rata dengan pointer
void hitungStatusSensor(uint16_t* dataArray, uint8_t panjang, float* hasilRataRata) {
    uint32_t total = 0;
    for (uint8_t i = 0; i < panjang; i++) {
        total += dataArray[i];
    }
    *hasilRataRata = (float)total / panjang; // Isi hasil ke alamat pointer
}

int main() {
    // 1. Array data sensor ADC 12-bit (Rentang 0 - 4095)
    uint16_t bacaanSensor[5] = {3200, 3150, 3220, 3180, 3210};
    
    // 2. Variabel penampung hasil
    float rataRata = 0.0;
    
    // 3. Panggil fungsi dengan menyertakan alamat memori (&rataRata)
    hitungStatusSensor(bacaanSensor, 5, &rataRata);
    
    // 4. Tampilkan hasil
    std::cout << "=== SISTEM TELEMETRI IOT ===" << std::endl;
    std::cout << "Rata-rata Nilai ADC : " << rataRata << std::endl;
    
    if (rataRata > 3000.0) {
        std::cout << "STATUS: Kondisi Terang / Tegangan Tinggi!" << std::endl;
    } else {
        std::cout << "STATUS: Kondisi Redup / Tegangan Normal." << std::endl;
    }

    return 0;
}
```
3. Klik tombol hijau **Run ▶** di bagian atas layar OnlineGDB.
4. **Perhatikan:** Terminal konsol di bawah akan langsung menampilkan hasil perhitungan rata-rata dan status sensor secara instan! 🎉

---

## 10. 📖 Glosarium Istilah Penting Modul 0.4

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **`uint8_t` / `uint16_t`** | Tipe data bilangan bulat dengan ukuran bit pasti yang hemat memori (1 byte / 2 byte). |
| **Pointer** | Variabel khusus yang menyimpan nomor alamat memori dari variabel lain di RAM. |
| **Dereferencing (`*`)** | Tindakan mendatangi alamat memori yang disimpan oleh pointer untuk membaca atau mengubah nilainya. |
| **Pass-by-Reference** | Mengirimkan alamat memori ke fungsi (lewat pointer) agar tidak membuang RAM untuk menduplikasi data besar. |
| **Bitwise Operation** | Operasi manipulasi level bit biner secara langsung (`&`, `|`, `^`, `<<`, `>>`). |
| **Watchdog Timer (WDT)**| Pengawas internal hardware yang akan merestart mikrokontroler jika CPU membeku/macet terlalu lama. |

---

## 📝 Kuis Refleksi & Pemahaman Diri

Uji intuisi Anda dengan 3 pertanyaan singkat ini:
1. Jika kita ingin menyimpan nilai pin digital yang hanya bernilai 0 (LOW) atau 1 (HIGH), tipe data apa yang paling hemat memori?
2. Apa perbedaan antara operator `&variabel` dan `*pointer` pada bahasa C++?
3. Mengapa di mikrokontroler ESP32 kita lebih disarankan mengirim data array/sensor berukuran besar menggunakan pointer (*Pass by Reference*) daripada mengirimkan variabel aslinya secara langsung?

---

> [!TIP]
> **Status Selesai:**  
> Selamat! Anda baru saja menguasai pondasi C++ Embedded yang sering kali menjadi momok paling menakutkan bagi pemula.  
> Buka file [TODO.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/TODO.md) dan tandai `[x]` pada modul 0.4, lalu mari kita lanjutkan ke **[Modul 0.5: Pemrograman Python dari Nol untuk Edge Gateway & Cloud](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/00-fondasi-dasar/README.md)**! 🚀
