# ⚡ Modul 0.1: Dasar Listrik Intuitif — Analogi Air, Hukum Ohm & Resistor LED

> **Tingkat Kesulitan:** Sangat Ramah Pemula (*Zero Prerequisite*)  
> **Estimasi Waktu Membaca & Praktik:** 15–20 Menit  
> **Tools yang Digunakan:** Browser Web (Kalkulator Online & Wokwi Simulator)  

---

## 🌟 Mengapa Kita Harus Belajar Listrik?

Selamat datang di Modul 0.1!  
Banyak orang yang ingin belajar IoT langsung melompat mengetik kode pemrograman. Namun, begitu rangkaian mereka tidak menyala atau lampunya terbakar, mereka langsung bingung: *"Apakah kodenya yang salah, atau kabelnya yang rusak?"*

IoT adalah perpaduan antara **Dunia Perangkat Lunak (Software)** dan **Dunia Fisika Elektronika (Hardware)**. Di modul ini, kita akan membongkar misteri listrik dengan cara yang paling santai, visual, dan tanpa rumus-rumus yang bikin pusing kepala!

---

## 🧭 Peta Pembelajaran Modul Ini

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 0.1                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Analogi Tandon Air: Memahami Volt, Ampere, Ohm, dan Watt            │
│ 2. Hukum Ohm: Sahabat Karib Semua Insinyur IoT (Segitiga V-I-R)        │
│ 3. Praktik Nyata: Mengapa LED Wajib Memakai Resistor?                  │
│ 4. Langkah Menghitung Resistor LED Sendiri (Rumus 3 Langkah)           │
│ 5. Arus DC vs Arus AC: Listrik Baterai vs Listrik Rumah 220V           │
│ 6. Uji Coba Virtual di Wokwi: Mengubah Resistor & Melihat Hasilnya     │
│ 7. Glosarium & Kuis Singkat                                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Analogi Tandon Air: Memahami 4 Variabel Listrik

Listrik tidak bisa kita lihat dengan mata telanjang karena elektron ukurannya sangat kecil. Namun, cara kerja listrik **persis sama seperti sistem aliran air di rumah Anda**!

Bayangkan sebuah tandon air di atas atap yang dihubungkan dengan pipa menuju keran:

```
                  ┌─────────────────┐
                  │   TANDON AIR    │
                  │ (TEGANGAN / V)  │
                  │ Tekanan ke Bawah│
                  └────────┬────────┘
                           │
                           │  ========================
                           │  ARUS AIR (I / AMPERE)
                           │  Banyaknya debit air mengalir
                           │  ========================
                           ▼
                  ┌─────────────────┐
                  │  KERAN PUTAR    │ ◄── HAMBATAN (R / OHM)
                  │ (Menahan Debit) │     Penyempitan pipa
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   KINCIR AIR    │ ◄── BEBAN & DAYA (P / WATT)
                  │ (Berputar Kuat) │     Energi kerja yang dihasilkan
                  └─────────────────┘
```

Mari kita bedah satu per satu:

### A. Tegangan / Voltage ($V$ - Satuan: Volt)
- **Analoginya:** **Tinggi dan Tekanan Tandon Air.**  
  Semakin tinggi tandon air dipasang, semakin kuat dorongan tekanan air yang menekan ke bawah.
- **Di Dunia Nyata:** Tegangan adalah **gaya dorong/tekanan listrik** yang mendorong elektron untuk bergerak.  
  - Port USB Laptop: **5 Volt**
  - Pin Sinyal ESP32: **3.3 Volt**
  - Baterai AA / Jam Dinding: **1.5 Volt**
  - Listrik Rumah Tangga: **220 Volt**

---

### B. Arus Listrik / Current ($I$ - Satuan: Ampere / $A$)
- **Analoginya:** **Banyaknya Debit/Volume Air yang Mengalir per Detik.**  
  Jika keran dibuka lebar, banyak air yang lewat per detik (Arus Besar). Jika keran ditutup hampir rapat, air hanya menetes perlahan (Arus Kecil).
- **Di Dunia Nyata:** Arus adalah **banyaknya elektron yang mengalir** melewati kabel dalam satu detik.
  - Pada rangkaian elektronika kecil, kita sering menggunakan satuan **Miliampere ($mA$)**:
    $$1\text{ Ampere } (A) = 1.000\text{ Miliampere } (mA)$$
  - Sebuah lampu LED biasanya membutuhkan arus sekitar **$10\text{ mA} - 20\text{ mA}$** ($0.01\text{ A} - 0.02\text{ A}$).

---

### C. Hambatan / Resistance ($R$ - Satuan: Ohm / $\Omega$)
- **Analoginya:** **Keran Air atau Penyempitan Diameter Pipa.**  
  Jika pipa sangat sempit, air sulit mengalir. Keran berfungsi sebagai rem untuk mengatur seberapa banyak air yang boleh keluar.
- **Di Dunia Nyata:** Hambatan adalah **sifat komponen yang menahan/mengerem aliran arus listrik**. Komponen khusus yang dipakai untuk memberi hambatan disebut **Resistor**.

---

### D. Daya Listrik / Power ($P$ - Satuan: Watt / $W$)
- **Analoginya:** **Kecepatan Putaran Kincir Air.**  
  Jika tekanan air tinggi ($V$) dan volume air yang mengalir deras ($I$), maka kincir air akan berputar sangat kuat menghasilkan kerja mekanik yang besar.
- **Di Dunia Nyata:** Daya adalah **total energi listrik yang dikonsumsi per detik**.
  $$\text{Daya } (P) = \text{Tegangan } (V) \times \text{Arus } (I)$$
  *(Contoh: Charger HP 5V dengan arus 2A memiliki daya $5 \times 2 = 10\text{ Watt}$).*

---

## 2. Hukum Ohm: Sahabat Karib Semua Insinyur IoT

Pada tahun 1827, fisikawan bernama **Georg Ohm** menemukan bahwa ketiga variabel listrik di atas memiliki hubungan matematis yang sangat sederhana dan indah. Hubungan ini dikenal sebagai **Hukum Ohm**:

$$V = I \times R$$

Untuk mempermudah mengingat rumusnya, para insinyur menggunakan **Segitiga Hukum Ohm**:

```
           / \
          / V \         Tutup huruf yang ingin Anda cari dengan jari:
         /-----\
        / I * R \       • Mencari V = I * R  (Tegangan = Arus dikali Hambatan)
       /_________\      • Mencari I = V / R  (Arus = Tegangan dibagi Hambatan)
                        • Mencari R = V / I  (Hambatan = Tegangan dibagi Arus)
```

> [!TIP]
> **Pola Pikir Logis:**
> - Jika **Hambatan ($R$) diperbesar**, maka **Arus ($I$) akan mengecil** (aliran listrik tertahan).
> - Jika **Hambatan ($R$) diperkecil**, maka **Arus ($I$) akan melonjak deras**.

---

## 3. Praktik Nyata: Mengapa Lampu LED Wajib Memakai Resistor?

Mari kita pelajari kasus paling nyata yang sering dialami pemula: **Menyalakan Lampu LED**.

```
    RANGKAIAN SALAH (BAHAYA / TERBAKAR)            RANGKAIAN BENAR (AMAN)
    
       [ Kutub + 5V ]                                 [ Kutub + 5V ]
             │                                              │
             ▼                                              ▼
       ┌──────────┐                                   ┌──────────┐
       │   LED    │                                   │ RESISTOR │ ◄── Mengerem arus
       │ (Hangus!)│                                   │  (220 Ω) │     ke ~15 mA
       └────┬─────┘                                   └────┬─────┘
            │                                              │
            ▼                                              ▼
       [ GND (0V) ]                                   ┌──────────┐
                                                      │   LED    │ ◄── Menyala terang
                                                      │  (Aman)  │     dan awet!
                                                      └────┬─────┘
                                                           │
                                                           ▼
                                                      [ GND (0V) ]
```

### Mengapa LED Tanpa Resistor Akan Terbakar?
Lampu LED (*Light Emitting Diode*) memiliki sifat unik: **ia tidak memiliki hambatan internal yang cukup untuk mengerem arus listrik sendiri**.  
Jika Anda menghubungkan LED langsung ke sumber tegangan 5V tanpa resistor:
1. LED akan mencoba menyerap arus sebesar-besarnya tanpa batas.
2. Arus yang lewat melonjak hingga ratusan miliampere.
3. Kawat tipis di dalam LED menjadi sangat panas dalam hitungan milidetik.
4. **Hasilnya:** LED berkedip sekali sangat terang, mengeluarkan asap kecil / bau hangus, dan mati selamanya! 💥

Oleh karena itu, kita **WAJIB memasang Resistor sebagai "polisi tidur / rem"** untuk membatasi arus listrik yang lewat agar pas di angka $15\text{ mA}$.

---

## 4. Langkah Menghitung Nilai Resistor Sendiri (Rumus 3 Langkah)

Berapa nilai resistor yang harus kita pasang? Apakah $10\Omega$? $220\Omega$? Atau $10.000\Omega$?  
Mari kita hitung bersama dengan **3 langkah mudah**:

### Data Spesifikasi Komponen:
1. **Tegangan Sumber Listrik ($V_s$):** Misal dari port 5V ESP32 = **$5.0\text{ Volt}$**.
2. **Tegangan Maju LED Merah ($V_{led}$):** LED merah butuh tegangan sekitar **$2.0\text{ Volt}$** untuk mulai menyala.
3. **Arus Aman LED ($I$):** Arus aman standar untuk LED biasa adalah **$15\text{ mA} = 0.015\text{ Ampere}$**.

---

### Langkah 1: Hitung Sisa Tegangan yang Harus Diredam Resistor
Resistor bertugas membuang kelebihan tegangan dari sumber:
$$V_{\text{resistor}} = V_s - V_{led}$$
$$V_{\text{resistor}} = 5.0\text{V} - 2.0\text{V} = 3.0\text{ Volt}$$

### Langkah 2: Gunakan Rumus Hukum Ohm ($R = \frac{V}{I}$)
$$R = \frac{V_{\text{resistor}}}{I}$$
$$R = \frac{3.0\text{ Volt}}{0.015\text{ Ampere}} = 200\text{ Ohm } (\Omega)$$

### Langkah 3: Pilih Nilai Resistor Terdekat di Pasaran
Di toko komponen elektronika, nilai resistor diproduksi dalam standar seri E12 ($100\Omega, 150\Omega, 220\Omega, 330\Omega, 470\Omega, 1k\Omega$).  
Nilai standar pasar yang paling dekat di atas $200\Omega$ adalah **$220\Omega$** (Gelang warna: *Merah - Merah - Cokelat*).

> [!NOTE]
> **Tabel Referensi Cepat Tegangan LED Berdasarkan Warna:**
> - **Merah / Kuning / Oranye:** $V_{led} \approx 1.8\text{V} - 2.0\text{V}$ (Gunakan resistor $220\Omega - 330\Omega$).
> - **Hijau / Biru / Putih:** $V_{led} \approx 3.0\text{V} - 3.2\text{V}$ (Gunakan resistor $100\Omega - 220\Omega$).

---

## 5. Arus DC vs Arus AC: Mengapa Mikrokontroler Pakai DC?

Di dunia listrik, ada dua jenis aliran arus:

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│       ARUS SEARAH / DC (DIRECT)      │     │      ARUS BOLAK-BALIK / AC (ALT)     │
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ • Aliran elektron 1 arah konstan     │     │ • Arah elektron bolak-balik (50x/dtk)│
│ • Tegangan stabil (3.3V, 5V, 12V)    │     │ • Tegangan tinggi (110V - 220V)      │
│ • Sumber: Baterai, USB, Aki, Solar   │     │ • Sumber: Stopkontak PLN, Generator  │
│ • Dipakai: Komputer, HP, ESP32, Chip │     │ • Dipakai: Kulkas, AC, Pompa Air PLN │
│ • 100% AMAN disentuh tangan (3.3V)   │     │ • BAHAYA / BISA MENYENGAT (220V)     │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

### Mengapa ESP32 dan Komputer Wajib Menggunakan DC?
Karena logika pemrograman komputer bekerja dengan logika biner:
- **Bit 1 (HIGH):** Tegangan stabil berada di $+3.3\text{V}$.
- **Bit 0 (LOW):** Tegangan stabil berada di $0\text{V}$ (Ground).

Jika menggunakan listrik AC yang tegangannya terus naik-turun dan bolak-balik 50 kali per detik, prosesor silikon tidak akan bisa membedakan mana angka 0 dan mana angka 1!

---

## 6. Uji Coba Virtual di Wokwi: Mengubah Resistor & Melihat Hasilnya

Mari kita buktikan teori Hukum Ohm di atas secara visual di simulator browser!

### Langkah Praktik (5 Menit):
1. Buka simulator interaktif ini di browser Anda: **[Wokwi ESP32 LED & Resistor Playground](https://wokwi.com/projects/new/esp32)**.
2. Di layar editor kode, gunakan kode sederhana ini:
   ```cpp
   void setup() {
     // Jadikan pin GPIO 4 sebagai pengirim sinyal listrik (OUTPUT)
     pinMode(4, OUTPUT);
     
     // Nyalakan aliran listrik 3.3V ke pin 4 terus menerus
     digitalWrite(4, HIGH);
   }

   void loop() {
     // Tidak perlu ada perulangan, biarkan lampu tetap menyala
   }
   ```
3. Tambahkan komponen LED dan Resistor di diagram simulator. Sambungkan:
   - **Pin GPIO 4** $\rightarrow$ **Kaki Kiri Resistor (220 $\Omega$)**.
   - **Kaki Kanan Resistor** $\rightarrow$ **Anoda LED (Kaki Melengkung/Panjang)**.
   - **Katoda LED (Kaki Lurus/Pendek)** $\rightarrow$ **Pin GND ESP32**.
4. Klik tombol **Play ▶** di atas simulator. Lampu LED akan menyala dengan terang dan stabil!

---

### 🧪 Tantangan Eksperimen Mandiri (*Break & Predict*):
> 💡 **Coba Lakukan Eksperimen Ini:**
> 1. Hentikan simulasi (klik tombol Stop ⏹).
> 2. Klik pada komponen Resistor, lalu ubah nilainya dari `220` menjadi `10000` ($10\text{ k}\Omega$).
> 3. **Tebak dulu:** Menurut Hukum Ohm ($I = \frac{V}{R}$), jika $R$ dinaikkan dari 220 ke 10.000, apakah lampu LED akan semakin terang atau semakin redup?
> 4. Klik tombol **Play ▶** dan perhatikan apa yang terjadi pada lampu LED! *(Apakah cahayanya menjadi sangat redup karena arusnya tertahan?)*

---

## 7. 📖 Glosarium Istilah Penting Modul 0.1

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **Voltage ($V$)** | Tekanan/dorongan listrik yang membuat elektron bergerak (satuan: Volt). |
| **Current ($I$)** | Jumlah debit aliran elektron yang mengalir per detik (satuan: Ampere / Miliampere). |
| **Resistance ($R$)** | Kemampuan suatu benda menahan laju aliran listrik (satuan: Ohm / $\Omega$). |
| **Hukum Ohm** | Rumus dasar kelistrikan yang menyatakan bahwa Tegangan = Arus $\times$ Hambatan ($V = I \times R$). |
| **Forward Voltage ($V_f$)** | Batas minimal tegangan yang dibutuhkan agar LED mulai menghantarkan listrik dan menyala. |
| **Direct Current (DC)** | Aliran listrik searah yang stabil, digunakan oleh seluruh chip mikrokontroler dan perangkat elektronik. |
| **Alternating Current (AC)** | Aliran listrik bolak-balik bertegangan tinggi dari stopkontak PLN. |

---

## 📝 Kuis Refleksi & Pemahaman Diri

Uji intuisi baru Anda dengan 3 pertanyaan singkat ini:
1. Jika kita memiliki sumber daya 5V dan ingin memperbesar arus listrik yang mengalir ke sebuah beban, apakah kita harus memperbesar atau memperkecil nilai resistansi ($R$)?
2. Apa yang akan terjadi jika kita memasang LED langsung ke pin 5V tanpa memasang resistor sama sekali?
3. Mengapa mikrokontroler ESP32 menggunakan arus DC 3.3V dan bukan arus AC 220V?

---

> [!TIP]
> **Status Selesai:**  
> Selamat! Anda telah menuntaskan **Fase 0.1** dan kini memiliki intuisi kelistrikan dasar yang sangat kokoh.  
> Buka file [TODO.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/TODO.md) dan tandai `[x]` pada modul 0.1, lalu mari kita lanjutkan ke **[Modul 0.2: Anatomi Breadboard & Komponen Fisik (Anti-Korslet)](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/00-fondasi-dasar/README.md)**! 🚀
