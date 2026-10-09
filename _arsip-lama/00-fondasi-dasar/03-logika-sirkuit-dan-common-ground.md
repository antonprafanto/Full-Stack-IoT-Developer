# ⚡ Modul 0.3: Logika Sirkuit Dasar — Common Ground, Voltage Divider & Floating Pin

> **Tingkat Kesulitan:** Sangat Ramah Pemula (*Zero Prerequisite*)  
> **Estimasi Waktu Membaca & Praktik:** 20–25 Menit  
> **Tools yang Digunakan:** Browser Web (Wokwi Simulator) & Multimeter Digital (Opsional)  

---

## 🌟 Tiga Misteri Terbesar Pemula Elektronika & IoT

Pernahkah Anda mengalami atau mendengar cerita seperti ini?
1. *"Saya menghubungkan sensor ke ESP32, tapi angkanya bergerak liar dan acak seperti ada hantu!"*
2. *"Saya membuat tombol tekan (push button), tapi saat tombol TIDAK ditekan, lampu kadang menyala dan mati sendiri!"*
3. *"Saya menyambungkan motor kipas langsung ke pin ESP32, lalu chip ESP32 saya panas dan mati total!"*

Ketiga masalah di atas adalah **"jebakan klasik"** yang dialami oleh 99% pemula. Masalah tersebut bukan karena ESP32 Anda rusak atau kode Anda salah, melainkan karena Anda belum memahami **3 Logika Sirkuit Dasar**:
- **Prinsip Common Ground (GND Bersama)**
- **Misteri Floating Pin & Resistor Pull-Up/Pull-Down**
- **Rangkaian Pembagi Tegangan (Voltage Divider)**

Di modul ini, kita akan membongkar tuntas ketiga misteri ini dengan logika sederhana dan analogi yang mudah dicerna!

---

## 🧭 Peta Pembelajaran Modul Ini

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 0.3                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Prinsip Mutlak Common Ground (Mengapa Semua GND Wajib Bersatu?)    │
│ 2. Misteri "Floating Pin" & Mengapa Kita Butuh Resistor Pull-Up/Down   │
│ 3. Pembagi Tegangan (Voltage Divider): Cara Membaca Sensor Fisik       │
│ 4. Transistor & Relay: Sakelar Pengendali Beban Daya Besar             │
│ 5. Panduan Menggunakan Multimeter Digital (Uji Voltase & BEEP Kabel)   │
│ 6. Uji Coba Virtual di Wokwi: Membaca Sensor Cahaya LDR                │
│ 7. Glosarium & Kuis Singkat                                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Prinsip Mutlak Common Ground (GND Bersama)

Bayangkan Anda dan teman Anda sedang berdiri di dua gedung yang berbeda. Anda berdiri di lantai 3 gedung A, dan teman Anda berdiri di lantai 3 gedung B.  
Jika Anda berteriak: *"Tinggi saya sekarang 10 meter!"*, teman Anda akan bingung: *10 meter diukur dari lantai gedung Anda, atau dari permukaan tanah bumi?*

Tanpa **lantai dasar yang sama (titik acuan $0\text{ meter}$)**, perbandingan tinggi menjadi tidak bermakna!

```
     ❌ TANPA COMMON GROUND (DATA RUSAK)            ✅ DENGAN COMMON GROUND (DATA VALID)
     
   [ Baterai Sensor 9V ]      [ ESP32 ]          [ Baterai Sensor 9V ]      [ ESP32 ]
     (+) Sinyal Sensor ──► Pin ADC                 (+) Sinyal Sensor ──► Pin ADC
     (-) GND Sensor        Pin GND                 (-) GND Sensor   ┌──► Pin GND
            │                     │                       │         │
            └────── TERPUTUS ─────┘                       └─────────┴─── TERSAMBUNG BERSAMA!
      (Tegangan sensor melayang acak,               (Kedua sistem memiliki titik acuan
       ESP32 membaca angka liar!)                    0V yang sama, bacaan stabil!)
```

### Mengapa Semua GND Wajib Dihubungkan Bersama?
- **Tegangan listrik bukanlah nilai mutlak**, melainkan **perbedaan potensial antara dua titik**.
- Ketika ESP32 membaca tegangan dari sensor eksternal (misal: "tegangan sensor ini adalah 2.5V"), ESP32 mengukurnya **terhadap pin GND miliknya sendiri ($0\text{V}$)**.
- Jika pin GND sensor dan pin GND ESP32 tidak disambungkan dengan seutas kabel jumper, ESP32 tidak memiliki titik acuan $0\text{V}$ yang sama.

> [!IMPORTANT]
> **Aturan Emas IoT #1 (Hukum Common Ground):**  
> **Semua modul sensor, baterai eksternal, catu daya adaptor, dan ESP32 WAJIB menyambungkan pin GND-nya menjadi satu titik bersama (*Common Ground*)!**

---

## 2. Misteri "Floating Pin" & Resistor Pull-Up / Pull-Down

Pernahkah Anda mencoba menghubungkan tombol tekan (*push button*) ke pin mikrokontroler seperti ini?

```
                    [ 3.3V ]
                       │
                       ▼
                    ┌──o──┐
                    │     │ ◄── Tombol Tekan (Push Button)
                    └──o──┘
                       │
                       ▼
                 [ Pin GPIO 4 ]
```

- **Saat Tombol DITEKAN:** Pin GPIO 4 terhubung ke $3.3\text{V}$ $\rightarrow$ ESP32 membaca nilai **`HIGH` (Angka 1)**.
- **Saat Tombol DILEPAS:** Pin GPIO 4 tidak terhubung ke mana-mana $\rightarrow$ **Apa yang dibaca ESP32?**

Banyak pemula mengira jika tombol dilepas, pin akan otomatis membaca **`LOW` (Angka 0)**. **SALAH BESAR!**

### Fenomena Pin Melayang (*Floating Pin*)
Saat tombol dilepas, pin GPIO 4 berada dalam kondisi **mengambang (*Floating*)**.  
Kaki pin tembaga tersebut bertindak persis seperti **antena radio** yang menangkap gelombang elektromagnetik liar di udara (gelombang Wi-Fi, sinyal HP, atau listrik statis dari tangan Anda).  
**Akibatnya:** ESP32 akan membaca nilai `0`, `1`, `0`, `0`, `1`, `1` secara acak dan berkedip-kedip liar!

---

### Solusinya: Pasang Resistor Pull-Down atau Pull-Up!

Untuk memastikan pin memiliki status yang pasti saat tombol tidak ditekan, kita pasang **Resistor Penarik ($10\text{ k}\Omega$)**:

```
      A. SKEMA RESISTOR PULL-DOWN                     B. SKEMA RESISTOR PULL-UP
      
               [ 3.3V ]                                        [ 3.3V ]
                  │                                               │
                  ▼                                               ▼
               ┌──o──┐                                      ┌───────────┐
               │     │ ◄── Tombol Tekan                     │  Resistor │ ◄── Menarik pin ke 3.3V
               └──o──┘                                      │  (10 kΩ)  │     (Default: HIGH / 1)
                  │                                         └─────┬─────┘
                  ├───► [ Pin GPIO 4 ]                            │
                  │     (Default: LOW / 0)                        ├───► [ Pin GPIO 4 ]
            ┌─────┴─────┐                                         │
            │  Resistor │ ◄── Menarik pin ke GND               ┌──o──┐
            │  (10 kΩ)  │     saat tombol dilepas              │     │ ◄── Tombol Tekan
            └─────┬─────┘                                      └──o──┘     (Saat ditekan jadi LOW / 0)
                  │                                               │
                  ▼                                               ▼
              [ GND (0V) ]                                    [ GND (0V) ]
```

1. **Skema Pull-Down:**
   - Tombol dilepas $\rightarrow$ Pin ditarik oleh resistor ke GND (**Nilai = `0` / LOW**).
   - Tombol ditekan $\rightarrow$ Listrik 3.3V mengalir ke pin (**Nilai = `1` / HIGH**).
2. **Skema Pull-Up (Paling Populer di Industri IoT):**
   - Tombol dilepas $\rightarrow$ Pin ditarik oleh resistor ke 3.3V (**Nilai = `1` / HIGH**).
   - Tombol ditekan $\rightarrow$ Pin langsung terhubung ke GND (**Nilai = `0` / LOW**).

> [!TIP]
> **Kabar Gembira: ESP32 Punya Resistor Pull-Up Internal!**  
> Anda tidak perlu repot memasang resistor fisik $10\text{ k}\Omega$ di breadboard untuk setiap tombol. ESP32 sudah memiliki resistor pull-up bawaan di dalam silikonnya. Cukup aktifkan lewat sebaris kode:  
> `pinMode(4, INPUT_PULLUP);` *(Pin akan otomatis berstatus HIGH saat tombol dilepas dan menjadi LOW saat tombol ditekan ke GND!)*

---

## 3. Rangkaian Pembagi Tegangan (*Voltage Divider*)

Banyak sensor di dunia nyata (seperti sensor cahaya **LDR**, sensor suhu **Termistor NTC**, dan sensor kelembaban tanah) bekerja dengan cara **mengubah nilai hambatannya ($R$) saat terkena perubahan fisik**.
- Sensor LDR saat terang: Hambatannya kecil ($\approx 500\Omega$).
- Sensor LDR saat gelap gulita: Hambatannya membesar ($\approx 100.000\Omega = 100\text{ k}\Omega$).

Namun, ada satu masalah: **Pin analog mikrokontroler (ADC) hanya bisa membaca TEGANGAN ($0\text{V} - 3.3\text{V}$), ia TIDAK BISA membaca hambatan secara langsung!**

Bagaimana cara mengubah perubahan hambatan ($R$) menjadi perubahan tegangan ($V$)?  
Jawabannya adalah menggunakan **Rangkaian Pembagi Tegangan (*Voltage Divider*)**:

```
                        [ Tegangan Masuk: Vin = 3.3V ]
                                      │
                                      ▼
                                ┌───────────┐
                                │    R1     │ ◄── Sensor LDR (Cahaya)
                                │  (Sensor) │     Hambatannya berubah-ubah
                                └─────┬─────┘
                                      │
                                      ├──────► [ Tegangan Keluar: Vout ke Pin ADC ]
                                      │
                                ┌─────┴─────┐
                                │    R2     │ ◄── Resistor Tetap (10 kΩ)
                                │  (Tetap)  │     Sebagai pembanding
                                └─────┬─────┘
                                      │
                                      ▼
                                 [ GND (0V) ]
```

### Rumus Pembagi Tegangan:
$$V_{\text{out}} = V_{\text{in}} \times \frac{R_2}{R_1 + R_2}$$

### Cara Kerja Sederhana:
- **Saat Ruangan Terang Benderang:** Hambatan LDR ($R_1$) mengecil drastis $\rightarrow$ Arus mudah lewat $\rightarrow$ Tegangan $V_{\text{out}}$ naik mendekati $3.3\text{V}$ (ESP32 membaca angka tinggi $\approx 4000$).
- **Saat Ruangan Gelap Gulita:** Hambatan LDR ($R_1$) membesar $\rightarrow$ Arus tertahan $\rightarrow$ Sebagian besar tegangan jatuh di $R_1$ $\rightarrow$ Tegangan $V_{\text{out}}$ turun mendekati $0\text{V}$ (ESP32 membaca angka rendah $\approx 200$).

---

## 4. Transistor & Relay: Pengendali Beban Daya Besar

Pin GPIO pada ESP32 dirancang untuk memproses **sinyal data**, bukan untuk memasok daya listrik berat!
- **Batas Kemampuan Pin ESP32:** Maksimal $3.3\text{ Volt}$ dan arus maksimal **$12\text{ mA}$** ($0.012\text{ A}$).

Jika Anda mencoba menyambungkan **Motor DC Mini, Pompa Air 12V, atau Lampu Kamar 220V** langsung ke pin GPIO ESP32:
- Komponen tersebut akan menyedot arus ratusan hingga ribuan miliampere.
- **Hasilnya:** Jalur mikroskopis di dalam chip silikon ESP32 akan terbakar (*overheated* / rusak permanen).

```
   ❌ SALAH (CHIP ESP32 TERBAKAR)                  ✅ BENAR (MENGGUNAKAN RELAY / MOSFET)
   
     [ ESP32 Pin GPIO ]                              [ ESP32 Pin GPIO ]
            │ (Hanya 12mA!)                                 │ (Sinyal Kecil 3.3V)
            ▼                                               ▼
     ┌──────────────┐                                ┌──────────────┐
     │ Pompa Air 12V│                                │ Modul Relay /│ ◄── Sakelar Isolasi
     │ (Butuh 1000mA)                                │ MOSFET Switch│
     └──────────────┘                                └──────┬───────┘
                                                            │ (Mengalirkan Daya Besar)
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Pompa Air 12V│ ◄── Mengambil daya dari
                                                     │ / Lampu 220V │     Adaptor Luar / PLN
                                                     └──────────────┘
```

### Solusinya:
1. **Transistor BJT / MOSFET:** Digunakan sebagai sakelar elektronik berkecepatan tinggi untuk beban DC (seperti motor DC, kipas 12V, strip LED).
2. **Modul Relay (dengan Optocoupler):** Digunakan sebagai sakelar mekanis berisolasi optik untuk mengendalikan peralatan listrik tegangan tinggi AC 220V rumah tangga (lampu, pemanas air, pompa sumur).

---

## 5. Panduan Praktik Multimeter Digital

Multimeter Digital adalah "kacamata rontgen" bagi seorang insinyur IoT. Tiga fungsi yang paling sering kita gunakan setiap hari:

```
                  ┌─────────────────────────┐
                  │    [  3.30 V  ] (LCD)   │
                  ├─────────────────────────┤
                  │           OFF           │
                  │       (o)     (o) DCV   │ ◄── 1. Ukur Tegangan DC
                  │   ACV (o)     (o) Ohm   │ ◄── 2. Ukur Hambatan Resistor
                  │       (o) •)))          │ ◄── 3. Uji Bunyi BEEP Kontinuitas
                  ├─────────────────────────┤
                  │     [V/Ω]     [COM/GND] │
                  └──────┬───────────┬──────┘
                         │           │
                     Kabel Merah  Kabel Hitam
```

1. **Mengukur Tegangan DC (Mode DCV $\overline{\text{V}}$):**
   - Colok jarum hitam ke lubang `COM` dan jarum merah ke `V/Ω`.
   - Putar selektor ke `DCV 20V`.
   - Tempelkan jarum merah ke kutub $(+)$ dan jarum hitam ke GND $(-)$ untuk memastikan sumber daya Anda benar-benar mengeluarkan tegangan $3.3\text{V}$ atau $5\text{V}$.
2. **Uji Sambungan Kabel Putus (Mode Kontinuitas •)))):**
   - Putar selektor ke simbol dioda / gelombang suara (Buzzer).
   - Sentuhkan jarum merah dan hitam pada kedua ujung kabel jumper.
   - **Jika berbunyi "BEEEEEP":** Kabel utuh dan terhubung normal!
   - **Jika hening:** Kabel putus di dalam dan harus dibuang ke tempat sampah.
3. **Mengukur Nilai Resistor (Mode Ohm $\Omega$):**
   - Putar selektor ke `20k $\Omega$`.
   - Tempelkan jarum pada kedua kaki resistor untuk mengetahui nilai hambatan pastinya tanpa perlu menebak gelang warna.

---

## 6. Uji Coba Virtual di Wokwi: Membaca Sensor LDR

Mari kita buktikan cara kerja rangkaian pembagi tegangan (*Voltage Divider*) secara langsung di simulator browser!

### Langkah Praktik (5 Menit):
1. Buka tautan proyek Wokwi ini: **[Wokwi ESP32 LDR Sensor Playground](https://wokwi.com/projects/new/esp32)**.
2. Di layar editor kode, ketikkan program pembacaan sensor analog berikut:
   ```cpp
   // Tentukan pin analog yang akan membaca sensor
   const int ldrPin = 34; // GPIO 34 adalah pin ADC1 (Sangat aman!)

   void setup() {
     // Buka saluran komunikasi serial ke laptop dengan kecepatan 115200 baud
     Serial.begin(115200);
     Serial.println("Sistem Pembaca Sensor Cahaya LDR Siap!");
   }

   void loop() {
     // 1. Baca nilai tegangan dari sensor (Rentang 0 - 4095)
     int nilaiSensor = analogRead(ldrPin);
     
     // 2. Tampilkan nilai ke Serial Monitor
     Serial.print("Tingkat Cahaya: ");
     Serial.println(nilaiSensor);
     
     // 3. Beri jeda 500 milidetik agar layar tidak bergulir terlalu cepat
     delay(500);
   }
   ```
3. Tambahkan komponen **LDR Sensor** dan hubungkan:
   - Kaki VCC LDR $\rightarrow$ Pin **3V3 ESP32**.
   - Kaki GND LDR $\rightarrow$ Pin **GND ESP32**.
   - Kaki Sinyal (AO) LDR $\rightarrow$ Pin **GPIO 34 ESP32**.
4. Klik tombol **Play ▶**.
5. Buka tab **Serial Monitor** di bagian bawah simulator.
6. Klik pada komponen LDR virtual di layar, lalu geser pengatur intensitas matahari (dari Gelap ke Terang).
7. **Perhatikan:** Angka di Serial Monitor akan berubah secara dinamis seiring perubahan intensitas cahaya! 🎉

---

## 7. 📖 Glosarium Istilah Penting Modul 0.3

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **Common Ground** | Menghubungkan seluruh jalur negatif (GND) dari semua modul listrik menjadi satu agar memiliki titik acuan 0V yang sama. |
| **Floating Pin** | Kondisi pin input yang tidak tersambung ke tegangan pasti, sehingga menangkap gelombang elektromagnetik liar seperti antena. |
| **Pull-Up Resistor** | Resistor yang bertugas menarik tegangan pin ke status `HIGH` (3.3V) secara default saat tombol tidak ditekan. |
| **Pull-Down Resistor** | Resistor yang bertugas menarik tegangan pin ke status `LOW` (0V/GND) secara default saat tombol tidak ditekan. |
| **Voltage Divider** | Rangkaian dua resistor seri yang membagi tegangan masuk menjadi tegangan keluar yang lebih kecil secara proporsional. |
| **ADC (Analog-to-Digital Converter)** | Fitur mikrokontroler yang mengubah sinyal tegangan fisik ($0\text{V} - 3.3\text{V}$) menjadi angka biner integer ($0 - 4095$). |
| **Optocoupler** | Komponen sakelar isolasi yang menggunakan berkas cahaya inframerah internal untuk memisahkan tegangan rendah mikrokontroler dari tegangan tinggi 220V. |

---

## 📝 Kuis Refleksi & Pemahaman Diri

Uji pemahaman Anda dengan 3 pertanyaan singkat ini:
1. Mengapa jika kita menggunakan baterai eksternal untuk modul sensor, kabel GND baterai tetap harus disambungkan ke pin GND ESP32?
2. Apa fungsi perintah `pinMode(4, INPUT_PULLUP)` pada kode C++ ESP32?
3. Mengapa kita tidak boleh menghubungkan pompa air 12V langsung ke pin GPIO ESP32 tanpa perantara transistor atau modul relay?

---

> [!TIP]
> **Status Selesai:**  
> Luar biasa! Anda sekarang telah memahami prinsip dasar kelistrikan sirkuit yang paling krusial di dunia IoT.  
> Buka file [TODO.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/TODO.md) dan tandai `[x]` pada modul 0.3, lalu mari kita lanjutkan ke **[Modul 0.4: Pemrograman C/C++ dari Nol Khusus Mikrokontroler](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/00-fondasi-dasar/README.md)**! 🚀
