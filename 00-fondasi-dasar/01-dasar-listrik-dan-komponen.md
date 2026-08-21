# ⚡ Modul 0.1: Analogi Aliran Air, Hukum Ohm & Anatomi Breadboard

> **Fase 0: Fondasi Dasar**  
> **Target Pembaca:** Pemula yang ingin memahami listrik secara intuitif tanpa pusing rumus dan merangkai komponen tanpa takut korsleting.  
> **Estimasi Waktu Belajar:** 30–45 Menit  
> **Alat Praktik:** [Wokwi Simulator (Gratis di Browser)](https://wokwi.com/esp32) atau Komponen Starter Kit Fisik.

---

## 🧭 Daftar Isi Modul
1. [Analogi Pipa Air: Memahami 4 Variabel Listrik Utama](#1-analogi-pipa-air-memahami-4-variabel-listrik-utama)
2. [Hukum Ohm ($V = I \times R$): Menghitung Resistor Pengaman LED](#2-hukum-ohm-v--i-times-r-menghitung-resistor-pengaman-led)
3. [Anatomi Breadboard: Cara Merangkai Sirkuit Tanpa Korslet](#3-anatomi-breadboard-cara-merangkai-sirkuit-tanpa-korslet)
4. [Mengenal Polaritas Komponen (Positif vs Negatif)](#4-mengenal-polaritas-komponen-positif-vs-negatif)
5. [Prinsip Mutlak Common Ground (GND Sharing)](#5-prinsip-mutlak-common-ground-gnd-sharing)
6. [Misteri "Floating Pin" & Solusi Resistor Pull-up / Pull-down](#6-misteri-floating-pin--solusi-resistor-pull-up--pull-down)
7. [Rangkaian Pembagi Tegangan (Voltage Divider) untuk Sensor Analog](#7-rangkaian-pembagi-tegangan-voltage-divider-untuk-sensor-analog)
8. [Laboratorium Praktik: Merangkai LED Pertama di Wokwi Simulator](#8-laboratorium-praktik-merangkai-led-pertama-di-wokwi-simulator)
9. [Kotak Antisipasi Error & Glosarium](#9-kotak-antisipasi-error--glosarium)

---

## 1. Analogi Pipa Air: Memahami 4 Variabel Listrik Utama

Listrik tidak bisa kita lihat langsung dengan mata, itulah mengapa listrik terasa abstrak. Cara termudah memahami listrik adalah dengan membayangkan **air yang mengalir di dalam pipa dari sebuah tandon**:

```
      ┌────────────────┐
      │   TANDON AIR   │  ════► TEGANGAN (VOLT - V)
      │  (Tekanan Air) │        Tinggi tandon menentukan seberapa kuat air didorong.
      └───────┬────────┘
              │ 
              │ ~ ~ ~  ════► ARUS (AMPERE - I)
              │ ~ ~ ~        Volume/debit air yang mengalir lewat pipa per detik.
              ▼
         [ ▨ KERAN ▨ ] ════► HAMBATAN (OHM - Ω)
              │              Penyempitan pipa yang menahan laju aliran air.
              ▼
        ( KINCIR AIR ) ════► DAYA / KERJA (WATT - P)
                             Energi putaran yang dihasilkan (lampu menyala terang).
```

### Rangkuman 4 Variabel Utama:
1. **Tegangan ($V$ / Volt):** Tekanan listrik yang mendorong elektron mengalir. Semakin tinggi voltase, semakin kuat dorongannya. (Contoh: USB mengeluarkan 5V, pin ESP32 mengeluarkan 3.3V).
2. **Arus ($I$ / Ampere atau miliampere - $mA$):** Jumlah elektron yang mengalir per detik. $1\text{ Ampere} = 1000\text{ mA}$.
3. **Hambatan ($R$ / Ohm - $\Omega$):** Benda yang menghalangi laju aliran listrik (seperti keran pemutar).
4. **Daya ($P$ / Watt):** Total kekuatan listrik yang bekerja ($P = V \times I$).

---

## 2. Hukum Ohm ($V = I \times R$): Menghitung Resistor Pengaman LED

Hukum Ohm adalah hukum dasar paling sakral di dunia elektronika:

$$\mathbf{V = I \times R} \quad \Longleftrightarrow \quad \mathbf{I = \frac{V}{R}} \quad \Longleftrightarrow \quad \mathbf{R = \frac{V}{I}}$$

### 🚨 Mengapa Lampu LED Wajib Diberi Resistor?
Lampu LED (*Light Emitting Diode*) memiliki resistansi internal yang **hampir nol ($R \approx 0$)**.  
Berdasarkan rumus $I = \frac{V}{R}$, jika $R$ sangat kecil mendekati nol, maka arus ($I$) yang lewat akan **melonjak tak terhingga besar!** Ini akan membakar kawat mikroskopis di dalam LED dalam waktu <0.1 detik hingga LED gosong/putus.

**Resistor dipasang sebagai "rem pembatas arus" agar LED menerima arus yang pas ($10\text{ mA} - 20\text{ mA}$).**

```
                     RUMUS RESISTOR PENGAMAN LED
                     
                     R = (V_sumber - V_led) / I_led
```

### 🧮 Contoh Perhitungan Nyata:
- **Tegangan Sumber ESP32 ($V_s$):** $3.3\text{ Volt}$
- **Tegangan Kerja LED Merah ($V_{led}$):** $1.8\text{ Volt}$
- **Arus Aman LED ($I_{led}$):** $10\text{ mA} = 0.01\text{ Ampere}$

$$R = \frac{3.3\text{V} - 1.8\text{V}}{0.01\text{A}} = \frac{1.5\text{V}}{0.01\text{A}} = \mathbf{150\,\Omega}$$

> 💡 **Aturan Praktis Laboratorium:**  
> Untuk mikrokontroler 3.3V atau 5V, nilai resistor **$220\,\Omega$** atau **$330\,\Omega$** adalah nilai paling umum dan aman untuk semua warna LED standar!

---

## 3. Anatomi Breadboard: Cara Merangkai Sirkuit Tanpa Korslet

Breadboard (*Project Board*) adalah papan tempat menancapkan kaki komponen tanpa perlu menyolder. Di balik lubang-lubang plastik breadboard, terdapat **jalur plat tembaga tersembunyi**:

```
        ┌─────────────────────────────────────────────────────────────┐
        │  (+)  ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ●  (Merah)  │ ◄─ Jalur Daya (Horizontal)
        │  (-)  ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ●  (Biru)   │ ◄─ Jalur GND (Horizontal)
        ├─────────────────────────────────────────────────────────────┤
        │  A    ●     ●     ●     ●     ●     ●     ●     ●         │
        │  B    │     │     │     │     │     │     │     │         │
        │  C    │     │     │     │     │     │     │     │         │ ◄─ Jalur Terminal
        │  D    │     │     │     │     │     │     │     │         │    (Terhubung VERTIKAL
        │  E    ●     ●     ●     ●     ●     ●     ●     ●         │     kolom per kolom)
        ├────────────────────── PARIT TENGAH ─────────────────────────┤
        │  F    ●     ●     ●     ●     ●     ●     ●     ●         │
        │  G    │     │     │     │     │     │     │     │         │
        │  H    │     │     │     │     │     │     │     │         │ ◄─ Jalur Terminal
        │  I    │     │     │     │     │     │     │     │         │    (Terhubung VERTIKAL)
        │  J    ●     ●     ●     ●     ●     ●     ●     ●         │
        ├─────────────────────────────────────────────────────────────┤
        │  (+)  ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ●  (Merah)  │
        │  (-)  ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ●  (Biru)   │
        └─────────────────────────────────────────────────────────────┘
```

### ⚠️ Kesalahan Fatal Pemula (Penyebab Korslet):
- ❌ **SALAH:** Menancapkan kedua kaki resistor atau LED di baris vertikal yang sama (misal: Lubang 1A dan 1C). Karena 1A dan 1C terhubung oleh plat tembaga yang sama di bawahnya, listrik akan melompati komponen (*Short Circuit / Korslet*).
- ✅ **BENAR:** Tancapkan kaki 1 di kolom 1, dan kaki 2 di kolom 2 (atau seberangi parit tengah breadboard).

---

## 4. Mengenal Polaritas Komponen (Positif vs Negatif)

Sebagian komponen elektronika memiliki arah kutub (**Polaritas**). Jika terbalik, sirkuit tidak akan bekerja atau komponen bisa rusak:

```
┌────────────────────────┬────────────────────────┬────────────────────────┐
│     LAMPU LED          │  KAPASITOR ELEKTROLIT  │         DIODA          │
├────────────────────────┼────────────────────────┼────────────────────────┤
│ Kaki Panjang = (+)Anoda│ Kaki Panjang = (+)Anoda│ Sisi Hitam Polos = (+) │
│ Kaki Pendek  = (-)Katoda│ Garis Garis  = (-)Katoda│ Garis Perak Putih= (-) │
│                        │ (ada strip tanda minus)│                        │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

> 💡 **Komponen Non-Polar (Bebas Bolak-Balik):**  
> **Resistor** dan **Kapasitor Keramik bulat kecil** tidak memiliki kutub positif/negatif. Anda bebas memasangnya bolak-balik tanpa khawatir terbalik.

---

## 5. Prinsip Mutlak Common Ground (GND Sharing)

Ini adalah **hukum nomor 1 dalam integrasi sistem IoT**:

> [!IMPORTANT]
> **Hukum Common Ground:**  
> Semua sensor, modul radio, aktuator relay, baterai eksternal, dan ESP32 **WAJIB MENYAMBUNGKAN SEMUA KABEL GND KE SATU JALUR BERSAMA.**

```
   [ Sensor Suhu ] ──────────── (GND) ────────────┐
                                                  │
   [ Baterai Eksternal 12V ] ── (GND) ────────────┼──► [ SATU JALUR GND BERSAMA ]
                                                  │    (Semua titik bertegangan 0V)
   [ Mikrokontroler ESP32 ] ─── (GND) ────────────┘
```

**Mengapa ini wajib?**  
Tegangan listrik adalah *beda potensial* (selisih tinggi air). Jika ESP32 dan Sensor memiliki sumber daya yang berbeda dan kabel GND-nya tidak disambungkan bersama, maka ESP32 tidak tahu di mana titik acuan 0 Volt-nya. Akibatnya, data sensor yang terbaca akan menjadi angka liar (*garbage data*).

---

## 6. Misteri "Floating Pin" & Solusi Resistor Pull-up / Pull-down

Pernahkah Anda mencoba menghubungkan tombol tekan (*Push Button*) ke mikrokontroler, tetapi saat tombol tidak ditekan, nilainya berubah-ubah acak antara 0 dan 1?

Fenomena ini disebut **Floating Pin (Pin Mengambang)**:
- Pin input mikrokontroler memiliki impedansi sangat tinggi (sangat sensitif).
- Saat tombol tidak ditekan dan kabel tidak menyentuh 3.3V maupun GND, pin tersebut bertindak seperti **antena radio** yang menangkap gelombang elektromagnetik dari udara di sekitar Anda.

```
       PULL-UP RESISTOR (Default: HIGH / 1)       PULL-DOWN RESISTOR (Default: LOW / 0)
       
              3.3V                                       3.3V
               │                                          │
             [ R ] (10k Ohm)                            [Sakelar Tombol]
               │                                          │
      GPIO ────┼───── [Sakelar Tombol] ── GND    GPIO ────┼───── [ R ] (10k Ohm) ── GND
```

- **Resistor Pull-up:** "Menarik" tegangan pin ke atas (3.3V / HIGH) saat tombol dilepas. Saat tombol ditekan, arus mengalir ke GND (menjadi LOW).
- **Kabar Baik:** ESP32 sudah memiliki **Resistor Pull-up Internal bawaan chip** sebesar $\approx 45\text{k}\Omega$. Anda cukup mengetik `pinMode(pin, INPUT_PULLUP)` di kode C++ tanpa perlu memasang resistor fisik di breadboard!

---

## 7. Rangkaian Pembagi Tegangan (*Voltage Divider*) untuk Sensor Analog

Pin input mikrokontroler hanya bisa membaca **Tegangan Listrik (Volt)**, mereka tidak bisa membaca hambatan resistor secara langsung.

Sensor analog seperti **LDR (*Light Dependent Resistor* / Sensor Cahaya)** atau **Termistor (Sensor Suhu)** mengubah nilai hambatannya saat kondisi lingkungan berubah. Agar ESP32 bisa membacanya, kita harus mengubah perubahan hambatan tersebut menjadi perubahan tegangan menggunakan **Rangkaian Pembagi Tegangan**:

```
                 V_in (3.3V dari ESP32)
                       │
                     [ R1 ]  (LDR / Sensor Cahaya)
                       │
                       ├────────► V_out (Masuk ke Pin ADC ESP32 GPIO 34)
                       │
                     [ R2 ]  (Resistor Tetap 10k Ohm)
                       │
                      GND
```

### Rumus Pembagi Tegangan:
$$V_{\text{out}} = V_{\text{in}} \times \frac{R_2}{R_1 + R_2}$$

- **Saat Terang:** Hambatan LDR ($R_1$) mengecil $\rightarrow$ $V_{\text{out}}$ naik mendekati 3.3V.
- **Saat Gelap:** Hambatan LDR ($R_1$) membesar $\rightarrow$ $V_{\text{out}}$ turun mendekati 0V.

---

## 8. Laboratorium Praktik: Merangkai LED Pertama di Wokwi Simulator

Mari kita gabungkan semua teori di atas ke dalam praktik nyata!

### 🛠️ Diagram Rangkaian Virtual (ESP32 + Resistor + LED):

```
       ESP32 BOARD
    ┌──────────────┐
    │              │
    │      GPIO 23 ├──────────[ Resistor 220 Ohm ]──────────┐
    │              │                                        │
    │              │                                   ┌────▼────┐
    │              │                                   │   LED   │
    │              │                                   │ (Merah) │
    │              │                                   └────┬────┘
    │              │                                        │
    │          GND ├────────────────────────────────────────┘
    └──────────────┘
```

### 💻 Tulis Kode C++ Ini di Editor Wokwi:

```cpp
// ==========================================================
// PROYEK 1: MENYALAKAN LAMPU LED PERTAMA DENGAN RESISTOR
// ==========================================================

// Tentukan nomor pin GPIO yang tersambung ke resistor LED
const int PIN_LED = 23;

void setup() {
  // 1. Beritahu ESP32 bahwa PIN_LED berfungsi sebagai OUTPUT (Pengirim Daya)
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // 2. Kirim tegangan 3.3V ke pin 23 -> Lampu LED MENYALA
  digitalWrite(PIN_LED, HIGH);
  
  // 3. Tunggu selama 1000 milidetik (1 detik)
  delay(1000);
  
  // 4. Putus tegangan menjadi 0V -> Lampu LED PADAM
  digitalWrite(PIN_LED, LOW);
  
  // 5. Tunggu lagi selama 1000 milidetik (1 detik)
  delay(1000);
  
  // Program akan otomatis berputar kembali ke awal fungsi loop()!
}
```

### 🎯 Uji Pemahaman Aktif (Predict & Modify):
1. Klik tombol **Play (Hijau)** di Wokwi. Amati lampu berkedip tiap 1 detik.
2. **Tantangan 1:** Ubah angka `delay(1000)` menjadi `delay(200)`. Apa yang terjadi pada kedipan lampu?
3. **Tantangan 2:** Ubah kode agar lampu menyala selama 3 detik dan padam hanya 0.5 detik!

---

## 9. Kotak Antisipasi Error & Glosarium

> [!WARNING]
> ### 🚨 Troubleshooting Jika Simulasi Tidak Berjalan:
> 1. **LED tidak menyala:** Periksa apakah kaki anoda (kaki bengkok/panjang pada Wokwi) terhubung ke resistor dan GPIO 23, serta katoda terhubung ke GND.
> 2. **Nilai resistor terlalu besar:** Jika Anda memasang resistor $100\text{k}\Omega$, arus akan terlalu kecil dan lampu tampak redup/mati. Gunakan $220\Omega - 330\Omega$.

### 📚 Glosarium Modul 0.1:
- **Anoda ($+$):** Kutub positif pada komponen dioda/LED tempat arus masuk.
- **Katoda ($-$/GND):** Kutub negatif tempat arus keluar menuju ground.
- **Short Circuit (Korsleting):** Kondisi ketika kutub positif dan negatif bersentuhan langsung tanpa hambatan beban, memicu lonjakan arus berbahaya.
- **Common Ground:** Menyatukan semua titik 0V dari berbagai sumber daya ke satu jalur tembaga bersama.

---

> 🎉 **Luar Biasa!** Anda telah menguasai konsep dasar kelistrikan, cara merangkai breadboard tanpa korslet, dan sukses menyalakan lampu pertama Anda!
> 
> 👉 **Langkah Selanjutnya:** Mari kita pelajari logika bahasa pemrograman C++ mikrokontroler di **[Modul 0.2: Logika C++ untuk Mikrokontroler](02-logika-cpp-untuk-mikrokontroler.md)**!
