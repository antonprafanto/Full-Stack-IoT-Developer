# 🔌 Modul 0.2: Anatomi Breadboard & Komponen Fisik — Panduan Merangkai Anti-Korslet

> **Tingkat Kesulitan:** Sangat Ramah Pemula (*Zero Prerequisite*)  
> **Estimasi Waktu Membaca & Praktik:** 15–20 Menit  
> **Tools yang Digunakan:** Browser Web (Wokwi Breadboard Simulator)  

---

## 🌟 Kenapa Breadboard Begitu Populer?

Pernahkah Anda bertanya-tanya: *Bagaimana para penemu dan insinyur merakit sirkuit elektronika sebelum disolder permanen?*

Jawabannya adalah menggunakan **Breadboard (Papan Prototyping Tanpa Solder)**!  
Dengan breadboard, Anda bisa menancapkan dan mencabut komponen listrik (LED, resistor, kabel, sensor) ribuan kali layaknya bermain balok **LEGO**. 

Namun, ada satu masalah besar bagi pemula: **di balik lubang-lubang plastik putih tersebut, ada jalur plat tembaga tersembunyi**. Jika salah menancapkan lubang, sirkuit Anda bisa mengalami **korsleting (*short circuit*)** atau tidak terhubung sama sekali!

Di modul ini, kita akan membongkar rahasia jalur di balik breadboard dan cara membedakan kutub komponen tanpa takut salah!

---

## 🧭 Peta Pembelajaran Modul Ini

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 0.2                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Membedah Isi Perut Breadboard: Jalur Horizontal vs Vertikal        │
│ 2. Kesalahan Fatal Nomor 1 Pemula: Korslet di Kolom yang Sama          │
│ 3. Cara Menentukan Polaritas Komponen (+ vs -): LED, Dioda, Kapasitor  │
│ 4. Membaca Kode Warna Resistor Tanpa Hafalan Rumit                     │
│ 5. Tiga Jenis Kabel Jumper (M-M, M-F, F-F) & Standar Warna Kabel      │
│ 6. Praktik Virtual Wokwi: Merakit Sirkuit Breadboard Pertama           │
│ 7. Glosarium & Kuis Singkat                                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Membedah Isi Perut Breadboard: Jalur Horizontal vs Vertikal

Jika kita membelah plastik putih breadboard tipe **MB-102 (830 titik)**, kita akan melihat deretan plat jepit tembaga berbentuk seperti ini:

```
    JALUR DAYA ATAS (POWER RAILS) - TERSAMBUNG HORIZONTAL (KIRI KE KANAN)
    (+) ──[===============================================================]── (+) Garis Merah
    (-) ──[===============================================================]── (-) Garis Biru
    
    JALUR KOMPONEN TENGAH (TERMINAL STRIPS) - TERSAMBUNG VERTIKAL (ATAS KE BAWAH)
          Kolom 1   Kolom 2   Kolom 3   ...   Kolom 30
        A   (o)       (o)       (o)             (o)
        B   (o)       (o)       (o)             (o)     Setiap 5 lubang (A-B-C-D-E)
        C   (o)       (o)       (o)             (o) ◄── TERSAMBUNG OLEH 1 PLAT
        D   (o)       (o)       (o)             (o)     TEMBAGA DI BAWAHNYA!
        E   (o)       (o)       (o)             (o)
       ═════════════════════════════════════════════  ◄── PARIT TENGAH (TERPUTUS / ISOLASI)
        F   (o)       (o)       (o)             (o)
        G   (o)       (o)       (o)             (o)     Setiap 5 lubang (F-G-H-I-J)
        H   (o)       (o)       (o)             (o) ◄── TERSAMBUNG OLEH 1 PLAT
        I   (o)       (o)       (o)             (o)     TEMBAGA TERPISAH!
        J   (o)       (o)       (o)             (o)
    
    JALUR DAYA BAWAH (POWER RAILS) - TERSAMBUNG HORIZONTAL (KIRI KE KANAN)
    (+) ──[===============================================================]── (+) Garis Merah
    (-) ──[===============================================================]── (-) Garis Biru
```

### Dua Wilayah Utama Breadboard:
1. **Jalur Daya (*Power Rails* / Garis Merah & Biru):**
   - Terletak di pinggir paling atas dan paling bawah.
   - **Tersambung secara HORIZONTAL (Memanjang dari kiri ke kanan).**
   - **Garis Merah ($+$):** Dihubungkan ke sumber tegangan (3.3V atau 5V).
   - **Garis Biru ($-$ / GND):** Dihubungkan ke Ground ($0\text{V}$).
2. **Jalur Komponen (*Terminal Strips* / Baris A–J):**
   - Terletak di area tengah tempat kita menancapkan sensor dan chip.
   - **Tersambung secara VERTIKAL (Tegak lurus dari atas ke bawah).**
   - Kolom 1 Baris A, B, C, D, E **semuanya tersambung jadi satu**.
   - **Parit Tengah (*Center Ravine*):** Memisahkan baris A–E dari baris F–J agar tidak tersambung. Parit ini dirancang khusus agar kita bisa menancapkan chip IC berkaki dua sisi tepat di tengahnya.

---

## 2. Kesalahan Fatal Nomor 1 Pemula: Korslet di Kolom yang Sama

Mari kita lihat kesalahan paling umum yang sering dilakukan orang yang baru pertama kali memegang breadboard:

```
   ❌ CARA SALAH (KORSLETING / TIDAK MENYALA)       ✅ CARA BENAR (BERFUNGSI NORMAL)
   
     Kolom 5                                          Kolom 5        Kolom 8
   A   (o)                                          A   (o)            (o)
   B   (o) ◄── Kaki Kiri Resistor                   B   (o) ◄──────────(o) ◄── Resistor
   C   (o)                                          C   (o) Jumper ke  (o)     menjembatani
   D   (o) ◄── Kaki Kanan Resistor                  D   (o) LED (+)    (o)     dua kolom!
   E   (o)                                          E   (o)            (o)
       ▲                                                ▲              ▲
   Kedua kaki menancap di kolom yang sama!          Kolom 5        Kolom 8
   Listrik memilih jalan pintas (korslet)           berbeda plat tembaga!
   dan resistor dilewati begitu saja!
```

> [!WARNING]
> **Aturan Emas Breadboard:**  
> **Jangan pernah menancapkan dua kaki komponen yang sama pada kolom vertikal yang sama!**  
> Karena lubang di satu kolom vertikal (misal 5A sampai 5E) terhubung oleh plat tembaga yang sama di bawahnya, menancapkan kedua kaki di kolom yang sama akan membuat listrik mengalir lewat plat tembaga tanpa melewati komponen Anda (*Short Circuit / Hubungan Singkat*). Komponen wajib **menjembatani dua kolom yang berbeda**.

---

## 3. Cara Menentukan Polaritas Komponen ($+$ vs $-$)

Komponen elektronika dibagi menjadi dua kelompok:
1. **Non-Polar (Bebas Bolak-Balik):** Tidak punya kutub positif/negatif. Dipasang terbalik tidak masalah (misal: Resistor, Kapasitor Keramik).
2. **Polar (Wajib Searah):** Punya kutub Positif ($+$) dan Negatif ($-$). Jika dipasang terbalik, komponen tidak akan menyala atau bahkan bisa meletus/rusak!

Mari kita pelajari cara membedakan polaritas komponen polar yang paling sering digunakan di IoT:

---

### A. Lampu LED (*Light Emitting Diode*)
Lampu LED hanya mengalirkan listrik dari kutub **Anoda ($+$)** menuju **Katoda ($-$)**:

```
                  ┌─────────┐
                  │ (  LED  │
                  │   )==== │ ◄── Sisi Pipih / Rata (Flat Edge)
                  └────┬─┬──┘
         Panjang       │ │      Pendek
         Anoda (+) ────┘ └─── Katoda (-)
```

- **Anoda (Positif / $+$):** Kaki yang lebih **panjang**. Di dalam kubah kaca, bentuk lempengannya lebih **kecil**.
- **Katoda (Negatif / $-$):** Kaki yang lebih **pendek**. Jika diraba kubah plastiknya, terdapat **sisi pipih/rata**.

---

### B. Dioda Penyearah (1N4007 / SS14)
Dioda berfungsi sebagai katup satu arah (mencegah listrik mengalir mundur):
```
                  ┌───────────────┐
                  │    [====| ]   │ ◄── Garis Cincin Perak / Putih
                  └───┬───────┬───┘
                      │       │
                  Anoda (+) Katoda (-)
```
- **Katoda (Negatif / $-$):** Ujung badan dioda yang memiliki **garis cincin perak/putih**.
- **Anoda (Positif / $+$):** Sisi polos hitam tanpa garis.

---

### C. Kapasitor Elektrolit (*Electrolytic Capacitor*)
Kapasitor elektrolit berbentuk seperti tabung kaleng mini dan **sangat sensitif terhadap polaritas**:
```
                  ┌─────────┐
                  │ [ - - ] │ ◄── Garis Strip Putih / Abu-abu dengan Tanda Minus (-)
                  └────┬─┬──┘
                       │ │      
         Anoda (+) ────┘ └─── Katoda (-) (Kaki Pendek)
```
- **Katoda (Negatif / $-$):** Kaki yang lebih **pendek** dan memiliki **garis strip putih bertanda minus ($-$)** di sepanjang tabungnya.
- **Anoda (Positif / $+$):** Kaki yang lebih panjang.
> [!CAUTION]
> Jangan pernah memasang kapasitor elektrolit terbalik pada tegangan tinggi, karena gas di dalamnya bisa memuai dan meletup!

---

## 4. Membaca Kode Warna Resistor Tanpa Rumit

Resistor ukurannya sangat kecil sehingga nilainya tidak dicetak dalam bentuk angka, melainkan dicetak dengan **gelang warna melingkar**:

```
                 ┌───┬───┬───┬───┬───┐
                 │   │ 1 │ 2 │ 3 │ 4 │   │
                 └───┴─┬─┴─┬─┴─┬─┴─┬─┴───┘
                       │   │   │   └─── Gelang 4: Toleransi (Emas = 5%)
                       │   │   └─────── Gelang 3: Pengali Jumlah Nol (x10 / x100 / x1k)
                       │   └─────────── Gelang 2: Angka Kedua
                       └─────────────── Gelang 1: Angka Pertama
```

### 3 Resistor Paling Wajib yang Sering Dipakai di IoT:
Anda tidak perlu menghafal semua warna, cukup ingat **3 kombinasi warna paling populer** ini:

| Nilai Resistor | Warna Gelang 1 - 2 - 3 | Kegunaan di Proyek IoT |
| :---: | :---: | :--- |
| **$220\Omega$** | **Merah - Merah - Cokelat** | Resistor pengaman lampu LED biasa. |
| **$1\text{ k}\Omega$ ($1000\Omega$)** | **Cokelat - Hitam - Merah** | Pembagi tegangan, pengaman base transistor. |
| **$10\text{ k}\Omega$ ($10000\Omega$)** | **Cokelat - Hitam - Oranye** | Resistor Pull-up tombol tekan & sensor LDR. |

---

## 5. Tiga Jenis Kabel Jumper & Standar Warna Kabel

Kabel jumper adalah kawat penghubung fleksibel yang ujungnya memiliki pin jarum atau lubang soket:

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│        JENIS KABEL JUMPER            │     │         STANDAR WARNA KABEL          │
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ 1. Male-to-Male (M-M):               │     │ 🔴 Merah  : Tegangan Positif (5V/3.3V│
│    Jarum di kedua ujung kabel.       │     │ ⚫ Hitam  : Ground / Negatif (0V/GND)│
│    (ESP32 ke Breadboard)             │     │ 🟡 Kuning : Sinyal Data / I2C SDA    │
│ 2. Male-to-Female (M-F):             │     │ 🟢 Hijau  : Sinyal Clock / I2C SCL   │
│    Jarum di 1 ujung, lubang di ujung │     │ 🔵 Biru   : Sinyal Kontrol / PWM     │
│    lainnya. (ESP32 ke Modul Sensor)  │     │                                      │
│ 3. Female-to-Female (F-F):           │     │ *Catatan: Semua warna kabel sama     │
│    Lubang di kedua ujung kabel.      │     │ daya hantarnya, warna hanya untuk    │
│    (Sensor langsung ke Raspberry Pi) │     │ kerapian agar mudah ditelusuri.*     │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

---

## 6. Praktik Virtual Wokwi: Merakit Sirkuit Breadboard Pertama

Mari kita latih keterampilan merangkai di atas breadboard virtual!

### Langkah Praktik (5 Menit):
1. Buka simulator interaktif ini: **[Wokwi ESP32 Breadboard Playground](https://wokwi.com/projects/new/esp32)**.
2. Tambahkan komponen berikut ke layar kerja:
   - 1 buah **Breadboard Half**
   - 1 buah **Lampu LED Merah**
   - 1 buah **Resistor 220 $\Omega$**
3. Tancapkan komponen ke breadboard dengan aturan berikut:
   - Tancapkan **Kaki Kiri Resistor** di baris **10A**, dan **Kaki Kanan Resistor** di baris **14A** (menjembatani kolom 10 dan 14).
   - Tancapkan **Anoda LED (Kaki Panjang/Melengkung)** di baris **14B** (sekolom dengan resistor agar terhubung!).
   - Tancapkan **Katoda LED (Kaki Pendek)** di baris **15B**.
4. Hubungkan kabel jumper:
   - Tarik kabel merah dari **Pin 3V3 ESP32** ke baris **10C** (terhubung ke kaki resistor).
   - Tarik kabel hitam dari **Pin GND ESP32** ke baris **15C** (terhubung ke katoda LED).
5. Klik tombol **Play ▶** di simulator! Lampu LED akan menyala dengan terang dan stabil!

```
               DIAGRAM KONEKSI BREADBOARD VIRTUAL
               
   [ ESP32 ]                          [ BREADBOARD ]
    Pin 3V3 ────(Kabel Merah)────────► Kolom 10A ──┐
                                                  [ Resistor 220 Ω ]
                                                   └► Kolom 14A ──┐
                                                                 [ Anoda LED (+) ]
                                                                 [ Katoda LED (-) ]
    Pin GND ────(Kabel Hitam)────────► Kolom 15C ─────────────────┘
```

---

## 7. 📖 Glosarium Istilah Penting Modul 0.2

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **Breadboard** | Papan berlubang dengan plat tembaga di dalamnya untuk merakit prototipe sirkuit elektronika tanpa perlu disolder. |
| **Power Rails** | Jalur rel daya di pinggir atas/bawah breadboard yang tersambung secara horizontal untuk jalur VCC dan GND. |
| **Terminal Strips** | Lubang-lubang di tengah breadboard yang tersambung secara vertikal (5 lubang per kolom). |
| **Short Circuit (Korsleting)** | Kondisi ketika arus listrik mengalir lewat jalur pintas tanpa hambatan beban, yang bisa memicu panas atau rusaknya komponen. |
| **Anoda & Katoda** | Anoda adalah kutub positif ($+$) dan Katoda adalah kutub negatif ($-$) pada komponen dioda/LED. |
| **Jumper Wire** | Kabel penghubung fleksibel berkepala jarum (*Male*) atau soket (*Female*). |

---

## 📝 Kuis Refleksi & Pemahaman Diri

Uji intuisi Anda dengan 3 pertanyaan singkat ini:
1. Jika kita menancapkan kaki anoda dan katoda LED pada kolom vertikal yang sama (misal lubang 7A dan 7D), apa yang akan terjadi?
2. Bagaimana cara membedakan kutub anoda dan katoda pada lampu LED fisik jika kedua kakinya sudah dipotong sama panjang?
3. Kabel jenis apakah yang kita butuhkan jika ingin menyambungkan modul sensor yang memiliki jarum pin ke lubang breadboard?

---

> [!TIP]
> **Status Selesai:**  
> Luar biasa! Anda sekarang sudah paham cara kerja breadboard dan tidak akan pernah salah menancapkan kutub komponen lagi.  
> Buka file [TODO.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/TODO.md) dan tandai `[x]` pada modul 0.2, lalu mari kita lanjutkan ke **[Modul 0.3: Logika Sirkuit Dasar, Voltage Divider & Common Ground](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/00-fondasi-dasar/README.md)**! 🚀
