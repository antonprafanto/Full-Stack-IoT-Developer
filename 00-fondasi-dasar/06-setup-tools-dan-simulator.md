# 🛠️ Modul 0.6: Setup Lingkungan Belajar — VS Code, PlatformIO IDE & Wokwi Simulator

> **Tingkat Kesulitan:** Sangat Ramah Pemula (*Zero Prerequisite*)  
> **Estimasi Waktu Membaca & Praktik:** 20–25 Menit  
> **Tools yang Digunakan:** Laptop / Komputer (Windows/macOS/Linux), VS Code, Ekstensi PlatformIO & Wokwi  

---

## 🌟 Selamat Datang di Bengkel Kerja Profesional Anda!

Selamat! Anda telah menuntaskan seluruh teori dasar kelistrikan, sirkuit, C++, dan Python.  
Sekarang saatnya kita menyiapkan **bengkel kerja perangkat lunak (*Development Environment*)** di komputer Anda.

Banyak pemula memulai dengan aplikasi *Arduino IDE* biasa. Namun di dunia industri profesional, para insinyur menggunakan **VS Code (Visual Studio Code) + PlatformIO IDE**.

```
┌────────────────────────────────────────────────────────────────────────┐
│               MENGAPA KITA MENGGUNAKAN PLATFORMIO DI VS CODE?          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. IntelliSense Cerdas : Saran kode otomatis (*Auto-Complete*) cepat.  │
│ 2. Manajemen Library   : Mengunduh library otomatis tanpa cari file zip│
│ 3. Konfigurasi Rapi    : Cukup 1 file `platformio.ini` untuk semua board│
│ 4. Terintegrasi Git    : Simpan kode langsung ke GitHub dalam 1 klik.  │
│ 5. Simulator Wokwi     : Uji coba kode langsung di dalam VS Code!      │
└────────────────────────────────────────────────────────────────────────┘
```

Di modul ini, kita akan memasang semua perlengkapan ini langkah demi langkah, lengkap dengan panduan jika menemui kendala!

---

## 🧭 Peta Pembelajaran Modul Ini

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 0.6                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Langkah 1: Mengunduh & Memasang VS Code                             │
│ 2. Langkah 2: Memasang Ekstensi PlatformIO IDE (Ikon Alien)            │
│ 3. Langkah 3: Memasang Ekstensi Wokwi Simulator di VS Code             │
│ 4. Anatomi Proyek PlatformIO: Memahami Rahasia `platformio.ini`        │
│ 5. Proyek Pertama: Build, Upload & Membuka Serial Monitor              │
│ 6. Kotak Bantuan: Mengatasi Masalah Instalasi Paling Umum              │
│ 7. Glosarium & Kuis Penutup Fase 0                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Langkah 1: Mengunduh & Memasang VS Code

Jika di komputer Anda belum terpasang **Visual Studio Code**:

1. Buka browser dan kunjungi situs resmi: **[code.visualstudio.com](https://code.visualstudio.com/)**.
2. Klik tombol biru besar **Download for Windows** (atau sesuai sistem operasi Anda).
3. Jalankan file installer yang baru diunduh (`VSCodeUserSetup.exe`).
4. **PENTING saat instalasi:** Pada jendela *"Select Additional Tasks"*, centang semua pilihan:
   - `[x] Add "Open with Code" action to Windows Explorer file context menu`
   - `[x] Add "Open with Code" action to Windows Explorer directory context menu`
   - `[x] Add to PATH (requires shell restart)`
5. Klik **Next** $\rightarrow$ **Install** $\rightarrow$ **Finish**.

```
┌────────────────────────────────────────────────────────┐
│  Visual Studio Code Setup                        [—][X]│
├────────────────────────────────────────────────────────┤
│  Select Additional Tasks:                              │
│  [x] Create a desktop icon                             │
│  [x] Add "Open with Code" to context menu              │
│  [x] Add to PATH (recommended)                         │
│                                                        │
│                  [ Back ] [ Next > ] [ Cancel ]        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Langkah 2: Memasang Ekstensi PlatformIO IDE

PlatformIO adalah ekstensi gratis yang mengubah VS Code menjadi studio pengembangan mikrokontroler kelas enterprise:

1. Buka aplikasi **VS Code**.
2. Di bilah menu paling kiri (*Sidebar*), klik ikon **Extensions** (atau tekan tombol kombinasi **`Ctrl + Shift + X`**).
3. Di kotak pencarian, ketik: `PlatformIO IDE`.
4. Pilih **PlatformIO IDE** (yang dibuat oleh *PlatformIO* dengan ikon kepala alien semut berwarna oranye/hitam).
5. Klik tombol biru **Install**.
6. **Tunggu 1–3 Menit:** PlatformIO akan mengunduh inti sistem (*C/C++ toolchain & Python Core*) di latar belakang.  
   *(Saat selesai, akan muncul pesan popup di pojok kanan bawah: "PlatformIO IDE has been successfully installed. Please reload window").*
7. Klik tombol **Reload Now** (atau tutup dan buka kembali VS Code).

```
┌──────────────────────────────────────────────────────────────┐
│  EXTENSIONS                                            [—][X]│
├──────────────────────────────────────────────────────────────┤
│  [ PlatformIO IDE                 ]                          │
│                                                              │
│  👾 PlatformIO IDE                          [ Install ]      │
│     PlatformIO                                   1.2M ★★★★★  │
│     Professional collaborative platform for embedded dev     │
└──────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> Setelah berhasil dipasang, Anda akan melihat **ikon kepala alien PlatformIO (👾)** di sidebar kiri VS Code, serta deretan ikon alat kecil di bilah status bagian bawah layar (Ikon Rumah 🏠, Centang ✓, Panah Kanan →, dan Colokan 🔌).

---

## 3. Langkah 3: Memasang Ekstensi Wokwi Simulator di VS Code

Agar Anda bisa menjalankan simulasi ESP32 langsung di dalam VS Code tanpa perlu membuka browser terpisah:

1. Di menu **Extensions (`Ctrl + Shift + X`)**, ketik: `Wokwi Simulator`.
2. Klik tombol **Install** pada ekstensi buatan *Wokwi*.
3. Sekarang VS Code Anda sudah memiliki simulator sirkuit virtual terintegrasi!

---

## 4. Anatomi Proyek PlatformIO: Memahami `platformio.ini`

Ketika Anda membuat proyek baru di PlatformIO, Anda akan melihat struktur folder seperti ini:

```
Proyek-ESP32-Saya/
├── .pio/               # File hasil kompilasi biner (dikelola otomatis)
├── include/            # Tempat file header C++ (.h) kustom Anda
├── lib/                # Tempat pustaka/library buatan sendiri
├── src/                # TEMPAT KODE UTAMA ANDA DITULIS!
│   └── main.cpp        # File utama berisi setup() dan loop()
└── platformio.ini      # FILE JANTUNG KONFIGURASI PROYEK
```

### Membedah File `platformio.ini`:
File ini adalah cetak biru proyek. Contoh isi file `platformio.ini` standar ESP32:

```ini
; Konfigurasi Lingkungan ESP32 DevKit V1
[env:esp32doit-devkit-v1]
platform = espressif32        ; Menggunakan platform resmi chip ESP32
board = esp32doit-devkit-v1   ; Tipe board ESP32 yang kita gunakan
framework = arduino           ; Menggunakan kerangka kerja Arduino Framework
monitor_speed = 115200        ; Kecepatan komunikasi Serial Monitor (Baud Rate)

; Unduh library otomatis dari cloud (Contoh: sensor BME280 & OLED)
lib_deps = 
    adafruit/Adafruit BME280 Library @ ^2.2.2
    adafruit/Adafruit SSD1306 @ ^2.5.7
```

> [!TIP]
> **Keajaiban `lib_deps`:**  
> Anda tidak perlu lagi mencari file `.zip` library di internet lalu mengekstraknya manual. Cukup tulis nama library di bawah baris `lib_deps`, dan PlatformIO akan **mengunduh serta memasangnya secara otomatis saat proyek dikompilasi!**

---

## 5. Proyek Pertama: Membuat Proyek, Build, Upload & Serial Monitor

Mari kita buat proyek uji coba pertama kita dari nol!

### Langkah 1: Buat Proyek Baru
1. Klik ikon **Alien PlatformIO (👾)** di sidebar kiri.
2. Klik menu **PIO Home** $\rightarrow$ **Open**.
3. Di halaman beranda PlatformIO yang muncul, klik tombol **+ New Project**.
4. Isi data proyek:
   - **Name:** `01-test-blink-serial`
   - **Board:** Ketik dan pilih `Espressif ESP32 Dev Module` (atau `DOIT ESP32 DEVKIT V1`).
   - **Framework:** `Arduino`.
5. Klik **Finish** dan tunggu beberapa detik sampai struktur folder proyek selesai dibuat.

---

### Langkah 2: Tulis Kode di `src/main.cpp`
Buka file **`src/main.cpp`** di panel Explorer kiri, lalu ganti isinya dengan kode tes ini:

```cpp
#include <Arduino.h>

// Gunakan pin LED onboard (GPIO 2 pada ESP32 DevKit)
const uint8_t ledPin = 2;
uint32_t hitunganDetik = 0;

void setup() {
  // 1. Inisialisasi komunikasi serial dengan baud rate 115200
  Serial.begin(115200);
  
  // 2. Set pin GPIO 2 sebagai digital OUTPUT
  pinMode(ledPin, OUTPUT);
  
  Serial.println("\n=================================");
  Serial.println("🚀 ESP32 SIAP! MEMULAI PROGRAM...");
  Serial.println("=================================");
}

void loop() {
  // A. Nyalakan LED dan kirim pesan ke laptop
  digitalWrite(ledPin, HIGH);
  hitunganDetik++;
  Serial.printf("[INFO] Waktu Berjalan: %u Detik | Status LED: MENYALA\n", hitunganDetik);
  delay(1000); // Tunggu 1 detik

  // B. Matikan LED dan kirim pesan ke laptop
  digitalWrite(ledPin, LOW);
  Serial.printf("[INFO] Waktu Berjalan: %u Detik | Status LED: PADAM\n", hitunganDetik);
  delay(1000); // Tunggu 1 detik
}
```

---

### Langkah 3: Menggunakan Tombol Sakti PlatformIO di Bilah Bawah

Perhatikan bilah status biru di bagian paling bawah jendela VS Code Anda:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [🏠 Home]  [✓ Build]  [→ Upload]  [🔌 Serial Monitor]  [🗑️ Clean]     │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Tombol Build (Ikon Centang `✓`):**  
   Klik ikon ini untuk mengompilasi kode C++ Anda. Jika tidak ada error, akan muncul tulisan hijau: `[SUCCESS] Took ... seconds`.
2. **Tombol Upload (Ikon Panah Kanan `→`):**  
   Colokkan board ESP32 ke kabel USB laptop Anda, lalu klik tombol ini. PlatformIO akan mendeteksi port COM secara otomatis dan menyuntikkan file biner ke ESP32!
3. **Tombol Serial Monitor (Ikon Colokan Listrik `🔌`):**  
   Klik ikon ini untuk membuka jendela terminal pembaca data serial. Anda akan melihat log teks `[INFO] Waktu Berjalan...` mengalir rapi di layar Anda! 🎉

---

## 6. Kotak Bantuan: Mengatasi Masalah Setup Paling Umum

> [!WARNING]
> **1. Error: "Could not open port COMx: Access is denied"**  
> - **Penyebab:** Port serial sedang dipakai oleh aplikasi lain (misal Arduino IDE atau Serial Monitor lain masih terbuka).  
> - **Solusi:** Tutup aplikasi serial monitor lain atau cabut dan colok ulang kabel USB ESP32 Anda.

> [!WARNING]
> **2. Teks di Serial Monitor Muncul Karakter Aneh / Alien (`??`)**  
> - **Penyebab:** Perbedaan kecepatan baud rate antara kode C++ (`Serial.begin`) dan settingan monitor PlatformIO.  
> - **Solusi:** Pastikan di file `platformio.ini` tertulis `monitor_speed = 115200` sesuai dengan angka di `Serial.begin(115200);`.

> [!WARNING]
> **3. Error Upload: "A fatal error occurred: Failed to connect to ESP32"**  
> - **Penyebab:** Sirkuit auto-flasher pada board Anda butuh pemicu manual.  
> - **Solusi:** Saat tulisan `Connecting........_____` muncul di terminal bawah, **tekan dan tahan tombol fisik `BOOT` pada ESP32 selama 2 detik** lalu lepaskan!

---

## 7. 📖 Glosarium Istilah Penting Modul 0.6

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **VS Code** | Editor kode teks modern buatan Microsoft yang sangat fleksibel dan populer di kalangan developer. |
| **PlatformIO** | Ekstensi manajemen proyek embedded yang menangani kompilasi, upload, dan pustaka mikrokontroler. |
| **`platformio.ini`** | File teks konfigurasi utama proyek yang mendefinisikan tipe board, platform, framework, dan library. |
| **`lib_deps`** | Baris konfigurasi di `platformio.ini` untuk mengunduh library pihak ketiga secara otomatis dari internet. |
| **Build (`✓`)** | Proses kompilasi seluruh kode C++ dan library menjadi satu file biner `.bin` yang siap di-flash. |
| **Serial Monitor (`🔌`)** | Jendela terminal penerima teks yang dikirimkan oleh mikrokontroler ke komputer laptop melalui kabel USB. |

---

## 📝 Kuis Refleksi Akhir Fase 0

Uji kesiapan Anda sebelum melangkah ke proyek perangkat keras nyata:
1. Apa fungsi dari baris `monitor_speed = 115200` di dalam file `platformio.ini`?
2. Di folder manakah file kode utama program kita (`main.cpp`) harus diletakkan dalam struktur proyek PlatformIO?
3. Tombol berikon apakah di bilah status bawah VS Code yang kita klik untuk mengompilasi dan mengunggah kode ke ESP32?

---

> [!TIP]
> **🎉 KELULUSAN FASE 0: ANDA RESMI SIAP MENJADI IOT DEVELOPER!**  
> Selamat! Anda telah menuntaskan seluruh 7 Modul di **Fase 0 (Minggu 1–2)**:
> - ✅ Modul 0.0: Bagaimana Kode Masuk ke Chip Silikon
> - ✅ Modul 0.1: Dasar Listrik Intuitif & Hukum Ohm
> - ✅ Modul 0.2: Anatomi Breadboard & Komponen Fisik (Anti-Korslet)
> - ✅ Modul 0.3: Logika Sirkuit Dasar, Voltage Divider & Common Ground
> - ✅ Modul 0.4: Pemrograman C/C++ Embedded dari Nol
> - ✅ Modul 0.5: Pemrograman Python untuk Edge Gateway & Cloud
> - ✅ Modul 0.6: Setup Tools VS Code, PlatformIO & Wokwi Simulator
> 
> Buka file [TODO.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/TODO.md) dan tandai `[x]` pada modul 0.6. Progres Fase 0 Anda sekarang **100% SELESAI**!  
> Mari kita bersiap melangkah ke **[Fase 1: Langkah Demi Langkah Mikrokontroler ESP32 — Dari Blink ke FreeRTOS](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/01-embedded-esp32/README.md)**! 🚀
