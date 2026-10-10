# Modul 5 — Anatomi ESP32, Peta Pin Kanonik, Catu Daya, & Mengendalikan Dunia Nyata

*Fase 1 · Minggu 5 · Perangkat keras (*hardware*): **Kit A Tahap 1** + kabel USB A–A (lihat 🧰) — sebagian besar praktik juga bisa di Wokwi · Prasyarat: **Modul 3** (dan rangkaian LED dari Modul 2) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 6 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-6--membaca-sensor-analog-digital--kalibrasi)

---

Selamat datang di Fase 1! Selama empat minggu pertama, kamu sudah belajar "bahasa": listrik, C++, dan JavaScript. Mulai minggu ini, ESP32 berhenti sekadar mengedipkan LED dan mulai **menggerakkan benda sungguhan**: relay yang berbunyi "klik", kipas yang berputar, pompa yang mengalirkan air, servo yang membuka tirai, dan buzzer yang bernyanyi. ESP32 juga mulai **mendengarkan** lewat tombol yang kamu tekan.

Menggerakkan benda ternyata bukan soal kode saja. Ada tiga hal yang membuat pemula sering frustrasi, dan ketiganya kita bereskan minggu ini:

1. **Pin yang salah pilih.** Dari 30 kaki papan ESP32, sebagian "berjebakan": bisa membuat papan gagal menyala, mengganggu unggahan, atau tidak bisa dipakai sebagai keluaran. Kita menetapkan **peta pin kanonik** — daftar tetap "kabel apa di kaki mana" untuk seluruh proyek, berlaku sampai Modul 28.
2. **Listrik yang kurang.** Kipas dan pompa jauh lebih "lapar" daripada LED. Kalau diberi makan dari USB laptop, tegangannya bisa anjlok dan ESP32 *restart* sendiri. Kita memasang **catu daya terpisah** (modul MB102 + adaptor 5 V) dan sengaja membuat ESP32 *restart* supaya kamu mengenali gejalanya.
3. **Tombol yang "nakal".** Satu tekanan tombol bisa terbaca lima kali. Kita belajar sebabnya dan cara meredamnya.

Di akhir minggu, Node 1 "Rumah" — perangkat utama proyek Rumah Pintar Mini — punya semua "tangan"-nya: relay lampu, relay kipas, pompa, servo tirai, buzzer, dan tombol manual, semuanya di pin yang tidak akan berubah lagi.

![Peta jalan Modul 5. Atas, enam fase kurikulum dari Fase 0 Fondasi sampai Fase 5 Operasi dan skala; Fase 1 ESP32, Modul 5 sampai 9, disorot, Modul 1 sampai 4 bertanda selesai, dan Modul 5 ditandai KAMU DI SINI sebagai modul pertama Fase 1. Bawah, sembilan hal yang dikerjakan minggu ini, masing-masing berlabel: KC, Kemenangan Cepat, tombol pertama di Wokwi; P1, menata ulang meja kerja dengan dua breadboard dan MB102; P2, tombol, pantulan, dan debounce; P3 sampai P5, PWM untuk LED, buzzer, dan servo; P6, relay menyalakan kipas dari MB102; P7, pompa 3 detik lewat MOSFET; P8, eksperimen brownout; P9, menyimpan sketsa dan foto rakitan ke GitHub; dan tanda plus, Tambahan: PETA-PIN.md dan Node 1 versi 0.2.0. Tanda bintang menandai yang wajib untuk lulus](aset/peta-jalan-modul-05.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - Setiap kotak kode punya tombol salin di pojok kanan atasnya. Semua sketsa (*sketch*, program Arduino) juga tersedia sebagai file di folder [`kode/`](kode/), lengkap dengan `diagram.json` untuk Wokwi.
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik.
> - **Belum punya kit, atau sebagian komponen belum datang?** Hampir semua praktik bisa dicoba di Wokwi. Yang tidak bisa disimulasikan hanyalah urusan listrik sungguhan: MB102, *brownout* (tegangan anjlok sesaat), dan arus beban. Bagian itu ditandai jelas.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, menyalin, dan menempel.

> [!WARNING]
> **Dua aturan keselamatan minggu ini.**
>
> 1. **Sebelum mengubah kabel apa pun, matikan MB102, lalu cabut USB.** Rangkaian yang keliru tanpa listrik tidak merusak apa-apa.
> 2. **Semua yang kita kendalikan bertegangan rendah (5 V dari adaptor).** Kurikulum ini **tidak pernah** menyambungkan apa pun ke listrik PLN 220 V. Relay untuk 220 V hanya dibahas sebagai pengetahuan dan peringatan (Konsep 9).

Ritme modul ini sama dengan Modul 1–4. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat dan komponen yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: tombol pertamamu, langsung di Wokwi (10 menit)](#-kemenangan-cepat-tombol-pertamamu-langsung-di-wokwi-10-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Anatomi papan](#1-anatomi-papan-esp32-devkit-v1-pin-mana-saja-yang-kamu-punya) · [2 Pin aman & pin jebakan](#2-pin-aman-pin-bersyarat-dan-pin-jebakan) · [3 Peta pin kanonik](#3-anggaran-pin-dan-peta-pin-kanonik-node-1-dan-node-2) · [4 Catu daya](#4-catu-daya-otak-dari-laptop-tenaga-dari-adaptor) · [5 Masukan & *pull-up*](#5-masukan-digital-dan-pull-up-kenapa-tombolku-terbaca-acak) · [6 *Debounce*](#6-pantulan-tombol-dan-debounce) · [7 Arus pin](#7-arus-pin-dan-penggerak-pin-untuk-memberi-perintah-bukan-tenaga) · [8 PWM](#8-pwm-satu-teknik-tiga-kegunaan-redup-terang-nada-dan-sudut) · [9 Relay](#9-relay-sakelar-yang-digerakkan-magnet) · [10 MOSFET](#10-mosfet-dan-dioda-flyback-sakelar-elektronik-untuk-pompa) · [11 Keluarga ESP32](#11-keluarga-esp32-sekilas)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Meja kerja](#praktik-1--menata-ulang-meja-kerja-dua-breadboard-led-status-dan-mb102-4560-menit-sekali-pasang) · [2 Tombol ⭐](#praktik-2--tombol-pantulan-dan-debounce-25-menit) · [3 *Dimmer*](#praktik-3--meredupkan-led-dengan-potensiometer-15-menit) · [4 Buzzer](#praktik-4--buzzer-memainkan-nada-15-menit) · [5 Servo](#praktik-5--servo-0180-lewat-serial-monitor-25-menit) · [6 Relay kipas ⭐](#praktik-6--relay-tombol-menyalakan-kipas-dari-mb102-30-menit) · [7 Pompa ⭐](#praktik-7--pompa-3-detik-lewat-mosfet-30-menit) · [8 *Brownout* ⭐](#praktik-8--eksperimen-brownout-sengaja-salah-lalu-diperbaiki-20-menit) · [9 GitHub](#praktik-9--simpan-ke-github-15-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-5)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

- **Membaca peta pin ESP32 DevKit V1** dan menjelaskan pin mana yang aman, mana yang bersyarat, dan mana yang harus dihindari — termasuk **tiga pin yang sebaiknya tidak dipakai beserta alasannya**.
- **Memakai peta pin kanonik** Node 1 dan Node 2, yang berlaku sampai Modul 28 sehingga rangkaian tidak perlu dibongkar setiap minggu.
- **Memberi daya ke beban tanpa membuat ESP32 *restart***: ESP32 dari USB laptop, beban dari MB102 + adaptor 5 V, dan GND disatukan.
- **Membaca tombol dengan benar** memakai *pull-up* internal dan *debounce*, lalu memakainya untuk menyalakan dan mematikan apa saja.
- **Mengendalikan dunia nyata**: LED redup-terang, buzzer bernada, servo bersudut, relay untuk kipas, dan MOSFET untuk pompa — memakai PWM dengan cara paket esp32 versi 3 (`ledcAttach`).

---

## 🧰 Yang perlu disiapkan

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Rangkaian dari Modul 2–3** | Papan ESP32 DevKit V1 30 pin, breadboard, LED merah + resistor 220 Ω di D4. LED hijau dan kuning dari lampu lalu lintas Modul 3 akan **dicabut** di Praktik 1. |
| **Kit A Tahap 1 — komponen yang mulai dipakai minggu ini** | Breadboard ke-2 (sudah ada di kit sejak Modul 2); 2 *push button* (tombol tekan); potensiometer 10 kΩ; buzzer **pasif**; modul relay 2 kanal 5 V *low-level trigger* ber-*optocoupler* (keduanya dijelaskan di Konsep 9); kipas DC 5 V kecil; pompa mini 3–5 V + selang; MOSFET **IRLZ44N** (atau modul **D4184**) + dioda **1N4007**; servo **SG90**; kapasitor elektrolit 100 µF; resistor 220 Ω dan 10 kΩ; kabel jumper jantan–jantan dan jantan–betina. |
| **Catu daya beban** | Modul **MB102** + **adaptor USB 5 V minimal 2 A** (kepala cas HP yang kuat sudah cukup) + **kabel USB A–A** (jantan–jantan, Rp10–15 ribu; tercantum di Kit A Tahap 1 sejak Silabus v1.0.6). Alasannya ada di Konsep 4. Punya MB102 versi baru bercolokan micro-USB atau USB-C? Untuk versi itu, cukup kabel cas HP biasa. |
| **Dua gelas (satu berisi air) + nampan** | Untuk pompa. Pompa mini jangan dijalankan kering lebih dari beberapa detik, dan airnya dijauhkan dari breadboard serta laptop. |
| **Selotip kertas + spidol** | Untuk memberi label rel 5 V dan 3,3 V. Pisau *cutter* juga perlu kalau strip rel breadboard-mu terkunci perekat (Praktik 1). |
| **Perkakas kecil** | Obeng pipih (obeng minus) kecil untuk terminal sekrup relay; karton tebal atau papan tipis + selotip dua sisi sebagai alas breadboard (opsional); 2 kabel jumper jantan–betina cadangan; resistor 1 kΩ (opsional, kalau buzzer terlalu keras). |
| **Multimeter** | Dari Modul 2. Dipakai untuk memastikan rel MB102 benar-benar 5 V. |
| **Laptop + Arduino IDE 2 + kabel USB data** | Sudah terpasang sejak Modul 2. |
| **Browser + Wokwi** | Untuk Kemenangan Cepat dan untuk mencoba praktik sebelum merakit. |

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (saat ditulis: 2.3.10) | Dari Modul 2. |
| Paket papan **esp32 by Espressif Systems** | **3.3.x** (saat ditulis: 3.3.12) | Dari Modul 2. Cara menulis PWM di versi 3 (`ledcAttach`) berbeda dengan versi 2 yang masih banyak dipakai tutorial lama. |
| Library **ESP32Servo** | **3.2.1** | Dipasang di Praktik 5. |

---

## 🏆 Kemenangan Cepat: tombol pertamamu, langsung di Wokwi (10 menit)

Sampai minggu lalu, ESP32 hanya "berbicara": menyalakan LED dan mencetak tulisan. Sekarang kita membuatnya **mendengarkan**. Kita mulai di Wokwi supaya tidak perlu membongkar rangkaian dulu — rangkaian aslimu baru ditata ulang di Praktik 1.

> 🖥️ **Alat yang dipakai di bagian ini:** browser, situs [Wokwi](https://wokwi.com). Tidak perlu kit, tidak perlu memasang apa pun.

1. Buka **https://wokwi.com/projects/new/esp32** di browser. Muncul proyek ESP32 kosong: kode di kiri, papan di kanan.
2. Klik kanan tautan [`kode/modul05_tombol_pertama/diagram.json`](kode/modul05_tombol_pertama/diagram.json) → **Buka di tab baru**, lalu klik tombol **Copy raw file** (ikon dua kotak) di kanan atas isi file itu. Kembali ke tab Wokwi, klik tab **`diagram.json`** di atas editor, pilih semua isinya (**Ctrl + A**), lalu tempel (**Ctrl + V**). Di kanan, papan kini ditemani sebuah tombol hijau di kiri dan LED merah di kanan.
3. Klik tab **`sketch.ino`**, hapus isinya, lalu tempel kode ini:

   ```cpp
   // Modul 5 - Kemenangan Cepat: tombol pertamamu
   // Selama tombol di D13 ditekan, LED di D4 menyala.
   // Rangkaian: satu kaki tombol ke D13, kaki seberangnya ke GND. Tanpa resistor.

   const int PIN_TOMBOL = 13;  // tombol manual (peta pin kanonik)
   const int PIN_LED = 4;      // LED status, terpasang sejak Modul 2

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);  // masukan + pull-up internal: tidak ditekan = HIGH
     pinMode(PIN_LED, OUTPUT);
     Serial.println("Tekan tombolnya!");
   }

   void loop() {
     if (digitalRead(PIN_TOMBOL) == LOW) {  // LOW = tombol sedang ditekan
       digitalWrite(PIN_LED, HIGH);
     } else {
       digitalWrite(PIN_LED, LOW);
     }
   }
   ```

4. Klik tombol hijau **▶**. Tunggu sampai tulisan `Tekan tombolnya!` muncul di Serial Monitor di bawah papan.
5. **Tekan dan tahan** tombol hijau dengan mouse. LED merah menyala! Lepaskan, LED padam.

![Tangkapan layar Wokwi: papan ESP32 dengan tombol hijau di kiri yang tersambung ke D13 dan GND, serta LED merah dan resistor di kanan yang tersambung ke D4 dan GND. Penanda 1: tombol D13 sedang diklik dan ditahan; lepas, LED padam lagi. Penanda 2: LED D4 menyala selama tombol ditahan. Penanda 3: Serial Monitor di bawah panel simulasi menampilkan pesan Tekan tombolnya!](aset/wokwi-tombol-pertama.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

Selamat — ESP32-mu sekarang bisa merasakan jarimu. Dua hal baru ada di kode itu:

- **`pinMode(PIN_TOMBOL, INPUT_PULLUP)`** menjadikan D13 sebagai **masukan** (*input*) sekaligus menyalakan "pegas" kecil di dalam chip yang menarik pin itu ke HIGH. Itulah sebabnya tombol cukup disambung ke GND, tanpa resistor tambahan.
- **`digitalRead(PIN_TOMBOL)`** membaca keadaan pin: `HIGH` atau `LOW`. Perhatikan logikanya **terbalik**: ditekan = `LOW`, dilepas = `HIGH`. Konsep 5 menjelaskan alasannya.

Penasaran? Klik **■** untuk menghentikan simulasi, ubah `INPUT_PULLUP` menjadi `INPUT`, lalu jalankan lagi. Kali ini LED **langsung menyala terus**, padahal tombol tidak disentuh, dan menekan tombol tidak mengubah apa pun. Tanpa "pegas" tadi, pin D13 dibiarkan **mengambang**: Wokwi menganggapnya `LOW`, sedangkan di papan asli bacaannya bahkan tidak bisa ditebak dan bisa berubah saat kabelnya tersentuh. Konsep 5 membahasnya. Kembalikan ke `INPUT_PULLUP` setelah mencoba.

---

## 🧠 Konsep "Mengapa"

Sebelas konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–4 → Praktik 1 (menata meja kerja)
2. Konsep 5–6 → Praktik 2 (tombol)
3. Konsep 7–8 → Praktik 3–5 (*dimmer*, buzzer, servo)
4. Konsep 9–10 → Praktik 6–9 (relay, pompa, *brownout*, GitHub)
5. 🧩 Tantangan → ➕ Rumah Pintar Mini → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ atau ☕ (maju ke praktik atau bagian berikutnya) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik. Konsep 11 (keluarga ESP32) adalah bacaan santai; buka kapan saja.

> 🖥️ **Perlu mencoba kode di bagian Konsep?** Tidak wajib — semua kode akan kamu jalankan di Praktik. Kalau penasaran, setiap kode bisa dicoba di Wokwi dengan `diagram.json` dari folder [`kode/`](kode/), persis seperti Kemenangan Cepat.

### 1. Anatomi papan ESP32 DevKit V1: pin mana saja yang kamu punya

Kamu sudah mengenal papan ini sejak Modul 2: modul logam ESP-WROOM-32 (berisi chip ESP32, memori *flash* 4 MB, dan antena), regulator 3,3 V, chip USB, tombol **EN** dan **BOOT**, LED merah tanda daya, serta LED biru yang tersambung ke GPIO 2. Minggu ini kita memperhatikan **kakinya**.

Papan DevKit V1 punya **30 pin**, 15 di setiap sisi:

- **5 pin listrik dan kendali**: **VIN** (±5 V dari USB), **3V3** (3,3 V dari regulator), **GND** (ada dua, keduanya sama), dan **EN** (tombol *reset*). Ini bukan pin program.
- **25 GPIO** (*General Purpose Input/Output*, pin masukan-keluaran serbaguna). Inilah kaki yang bisa diatur lewat kode: dinyalakan, dibaca, atau diberi tugas khusus.

Tulisan di papan tidak selalu sama dengan nomor GPIO. **D4** berarti GPIO **4**, dan di kode kita cukup menulis angkanya (`4`). Ada juga nama khusus: **VP** = GPIO **36**, **VN** = GPIO **39**, **RX0**/**TX0** = GPIO **3**/**1**, **RX2**/**TX2** = GPIO **16**/**17**. Semuanya ada di gambar Konsep 2.

"Serbaguna" bukan berarti semua sama. Setiap GPIO bisa menjadi **masukan** (membaca tombol), dan sebagian besar bisa menjadi **keluaran** (menyalakan LED). Sebagian punya kemampuan tambahan: membaca tegangan analog (ADC, Modul 6), meraba sentuhan, mengeluarkan tegangan analog sungguhan (DAC, pengubah digital ke analog), atau menjadi jalur bus sensor (I2C, SPI, UART — Modul 7). Sebagian lagi punya **pantangan**, dan itulah isi konsep berikutnya.

### 2. Pin aman, pin bersyarat, dan pin jebakan

Bayangkan pin-pin ESP32 seperti kursi di ruang rapat. Sebagian kursi bebas diduduki siapa saja. Sebagian "dipesan" sebentar oleh panitia di awal acara — boleh diduduki asalkan tamunya tidak menghalangi panitia. Sebagian lagi hanya untuk mendengarkan, tidak boleh dipakai berbicara. Ada juga yang memang terlarang karena dipakai sistem.

![Peta pin ESP32 DevKit V1 30 pin, dilihat dari atas dengan antena di atas dan colokan USB di bawah. Sisi kiri dari atas: EN, VP atau GPIO 36, VN atau GPIO 39, D34, D35, D32, D33, D25, D26, D27, D14, D12, D13, GND, VIN. Sisi kanan dari atas: D23, D22, TX0 atau GPIO 1, RX0 atau GPIO 3, D21, D19, D18, D5, TX2 atau GPIO 17, RX2 atau GPIO 16, D4, D2, D15, GND, 3V3. Warna hijau untuk pin aman, kuning untuk pin strapping 2, 5, dan 15 yang boleh dipakai sebagai keluaran dengan catatan, biru untuk pin 34 sampai 39 yang hanya bisa masukan tanpa pull-up, merah untuk GPIO 12 dan TX0 RX0 yang dihindari, dan abu-abu untuk pin listrik. Di samping setiap pin tertulis fungsinya, misalnya ADC1 atau ADC2, sentuh, DAC di D25 dan D26, SPI di D23, D19, D18, dan D5, I2C di D21 dan D22, UART2 di TX2 dan RX2, strapping, VIN sekitar 5 volt dari USB, dan 3V3 sebagai keluaran 3,3 volt. Catatan di bawahnya: ADC1 di GPIO 32 sampai 39 tetap bisa membaca analog saat WiFi menyala, ADC2 tidak; GPIO 0 (tombol BOOT) dan GPIO 6 sampai 11 (memori flash) tidak dikeluarkan di papan 30 pin; LED biru bawaan di GPIO 2](aset/pinout-devkit-v1.png)

| Golongan | GPIO | Artinya |
| :--- | :--- | :--- |
| 🟢 **Aman** | 4, 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33 | Boleh menjadi masukan, keluaran, atau PWM (Konsep 8). Pilihan pertama untuk apa pun. |
| 🟡 **Bersyarat** | 2, 5, 15 | **Pin *strapping*** (*strapping pin*, pin penentu cara menyala). Chip membaca levelnya sesaat ketika menyala, lalu membebaskannya. Boleh untuk **keluaran** asalkan rangkaiannya tidak memaksa level tertentu saat papan menyala. GPIO 2 juga tersambung ke LED biru bawaan dan harus LOW atau mengambang saat mengunggah. |
| 🔵 **Hanya masukan** | 34, 35, 36 (VP), 39 (VN) | Tidak bisa menjadi keluaran dan **tidak punya *pull-up* internal**. Cocok untuk sensor, termasuk sensor analog. |
| 🔴 **Hindari** | 12, 1 (TX0), 3 (RX0) | GPIO 12 adalah pin *strapping* yang menentukan tegangan memori: kalau tertarik HIGH saat menyala, papan **gagal *boot***. TX0/RX0 adalah jalur USB: dipakai saat mengunggah dan oleh Serial Monitor. |
| ⚪ **Tidak dikeluarkan** | 0, 6–11 | Di papan 30 pin kita, GPIO 0 hanya terhubung ke tombol **BOOT** dan GPIO 6–11 dipakai memori *flash*. Papan 38 pin mengeluarkannya; **jangan dipakai**. |

Dua pembagian lain ikut menentukan pilihan pin:

- **ADC1 dan ADC2.** Pembaca analog ESP32 ada dua. ADC2 (GPIO 0, 2, 4, 12–15, 25–27) **tidak bisa dipakai membaca analog saat WiFi menyala** — dan mulai Modul 10, WiFi selalu menyala. Karena itu, semua sensor analog proyek kita ditaruh di **ADC1** (GPIO 32–39). Sebagai pin digital biasa, pin ADC2 tetap aman.
- **Pin yang "tenang" saat menyala.** Pin *strapping* punya resistor penarik bawaan yang aktif ketika papan menyala (GPIO 0, 5, dan 15 ditarik ke atas; GPIO 2 dan 12 ditarik ke bawah), dan TX0 mengirim tulisan saat papan menyala. Supaya relay dan pompa tidak sempat terpicu sesaat, keduanya kita taruh di pin biasa (25, 32, 33).

> [!IMPORTANT]
> **Tiga pin yang wajib kamu hafal untuk dihindari** (ini syarat lulus):
>
> 1. **GPIO 12 (D12)** — pin *strapping* penentu tegangan memori. Kalau ada rangkaian yang menariknya HIGH saat papan menyala, chip memilih tegangan 1,8 V untuk memori yang butuh 3,3 V sehingga papan gagal menyala atau *restart* terus.
> 2. **GPIO 1 dan 3 (TX0, RX0)** — jalur USB ke laptop. Memakainya mengganggu unggahan dan membuat Serial Monitor kacau.
> 3. **GPIO 6–11** — dipakai memori *flash* tempat programmu tersimpan. Memakainya membuat program mogok. (Di papan 30 pin memang tidak dikeluarkan, tetapi di papan 38 pin tertulis `D0`–`D3`, `CMD`, `CLK`. Awas: tulisan `D2` di papan 38 pin adalah GPIO 9 milik *flash*, bukan GPIO 2.)

### 3. Anggaran pin dan peta pin kanonik Node 1 dan Node 2

Hitung dulu "uang" kita. Papan punya 25 GPIO. Kurangi TX0 dan RX0 (jalur USB) serta GPIO 12, dan tersisa **22 pin yang bisa dipakai**. Kebutuhan Node 1 "Rumah" sampai akhir kurikulum:

- **Aktuator** (Modul 5): relay lampu, relay kipas, pompa, servo tirai, buzzer → 5 pin.
- **Tombol manual dan LED status** → 2 pin.
- **Lima sensor** (Modul 6): DHT22, LDR, sensor tanah, PIR, sensor jarak HC-SR04 (2 kabel) → 6 pin.
- **Layar OLED** lewat I2C (Modul 7) → 2 pin.

Totalnya **15 pin**. Ditambah kartu microSD opsional (Modul 7, 4 pin) menjadi 19, dan ditambah lab RS-485 di Modul 15 (3 pin) genap 22. Anggarannya **pas** — tidak boleh ada pin yang terbuang.

Karena itulah kita menetapkan **peta pin kanonik**: daftar tetap "kabel apa di kaki mana" yang **berlaku sampai Modul 28**. Pin yang komponennya belum datang tetap "dipesan" sehingga rangkaian tidak perlu dibongkar setiap minggu.

![Peta pin kanonik Node 1 Rumah pada papan ESP32 DevKit V1. Warna dan label bulat di samping setiap pin menunjukkan modul tempat pin itu mulai dipakai, bukan golongan pin. Sisi kiri dari atas: EN tombol reset; VP atau GPIO 36 untuk LDR (Modul 6); VN atau GPIO 39 untuk sensor tanah (Modul 6, minggu ini potensiometer); D34 untuk PIR (Modul 6); D35 untuk ECHO sensor jarak (Modul 6); D32 relay lampu; D33 relay kipas; D25 pompa lewat MOSFET; D26 servo tirai; D27 buzzer (semuanya Modul 5); D14 DHT22 (Modul 6); D12 merah bertanda silang, jangan dipakai; D13 tombol manual (Modul 5); GND bersama; VIN, jangan diberi beban. Sisi kanan dari atas: D23, D19, D18, dan D5 untuk microSD (Modul 7, opsional); D22 dan D21 untuk I2C layar OLED (Modul 7); TX0 dan RX0 merah bertanda silang, jalur USB; TX2 dan RX2 serta D2 untuk RS-485 (Modul 15); D4 LED status (Modul 2); D15 TRIG sensor jarak (Modul 6); GND bersama; 3V3 ke rel bawah. Kotak kiri bawah: legenda warna modul, yaitu Modul 2, 5, 6, 7, 15, dan tanda silang untuk pin yang dihindari. Kotak kanan bawah: peta pin Node 2 Kebun, yaitu I2C 21 dan 22 untuk BME280, GPIO 27 untuk DS18B20 dengan resistor 4,7 kiloohm ke 3V3, VN untuk sensor tanah ke-2, GPIO 2 LED biru bawaan, 16, 17, dan 2 untuk RS-485 hanya selama lab Modul 15, serta VP sebagai cadangan untuk tegangan baterai](aset/peta-pin-kanonik.png)

Banyak nama di tabel berikut — I2C, SPI, RS-485, DHT22, PIR, dan seterusnya — baru dikenalkan di modulnya masing-masing. Minggu ini cukup tahu bahwa pin-pin itu **sudah dipesan**. Kolom **Mulai** berisi modul tempat pin itu mulai dipakai: M5 = Modul 5.

**Node 1 "Rumah"** (ESP32 DevKit V1 pertama; tinggal di dalam rumah dan tidak pernah memakai baterai):

| GPIO (tulisan di papan) | Untuk | Arah | Mulai | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| 4 (D4) | LED status | keluar | M2 | lewat resistor 220 Ω |
| 13 (D13) | Tombol manual | masuk | M5 | `INPUT_PULLUP`; kaki seberang ke GND |
| 32 (D32) | Relay lampu (IN1) | keluar | M5 | relay aktif LOW |
| 33 (D33) | Relay kipas (IN2) | keluar | M5 | relay aktif LOW |
| 25 (D25) | Pompa (gerbang MOSFET) | keluar | M5 | 220 Ω seri + 10 kΩ ke GND |
| 26 (D26) | Servo tirai | keluar (PWM) | M5 | daya servo dari MB102 |
| 27 (D27) | Buzzer pasif | keluar (PWM) | M5 | lewat resistor 220 Ω |
| 14 (D14) | DHT22 | dua arah | M6 | |
| 36 (VP) | LDR | masuk analog | M6 | ADC1 |
| 39 (VN) | Sensor tanah kapasitif | masuk analog | M6 | ADC1; minggu ini dipakai potensiometer |
| 34 (D34) | PIR | masuk | M6 | |
| 35 (D35) | HC-SR04 ECHO | masuk | M6 | lewat pembagi tegangan 5 V → 3,3 V |
| 15 (D15) | HC-SR04 TRIG | keluar | M6 | pin *strapping*, aman untuk keluaran |
| 21 / 22 (D21 / D22) | I2C SDA / SCL: OLED, latihan BME280 | bus | M7 | |
| 18 / 19 / 23 / 5 | microSD SCK / MISO / MOSI / CS | bus SPI | M7 | opsional; boleh dilepas setelah Modul 11 |
| 16 / 17 (RX2 / TX2) | RS-485 RO / DI (MAX485) | bus UART | M15 | GPIO 16 dipinjam sementara untuk latihan DS18B20 di Modul 7; keluaran RO modul MAX485 yang diberi 5 V diturunkan dulu ke 3,3 V (Modul 15) |
| 2 (D2) | RS-485 DE/RE + LED biru bawaan | keluar | M15 | pin *strapping*; LED biru ikut menyala saat mengirim |

**Node 2 "Kebun"** (ESP32 kedua, dari baterai, dirakit di Modul 14):

| GPIO | Untuk | Mulai | Catatan |
| :--- | :--- | :---: | :--- |
| 21 / 22 | I2C: BME280 | M14 | |
| 27 | DS18B20 (1-Wire) | M14 | resistor 4,7 kΩ ke 3V3 |
| 39 (VN) | Sensor tanah ke-2 | M14 | pin sama dengan Node 1, jadi kodenya bisa dipakai ulang |
| 2 | LED biru bawaan: tanda "sedang bangun" | M14 | |
| 16 / 17 / 2 | RS-485 untuk lab Modul 15 | M15 | hanya selama lab, dengan sketsa lab tersendiri; MAX485 dilepas lagi setelahnya karena GPIO 2 juga LED "bangun" |
| 36 (VP) | Cadangan, misalnya tegangan baterai | — | opsional |

Baterai Node 2 masuk lewat pin VIN (rangkaian Modul 9), bukan lewat GPIO.

Berikut beberapa alasan di balik pilihan ini supaya peta itu terasa masuk akal, bukan sekadar hafalan:

- **Semua aktuator dan tombol ada di satu sisi papan** (D13 sampai D32, berderet) sehingga kabelnya rapi.
- **Sensor analog di VP dan VN** (ADC1), sedangkan **PIR dan ECHO di D34 dan D35**. Ini mengikuti catatan Espressif: pin 36 dan 39 sebaiknya tidak dipakai untuk masukan digital yang membutuhkan *interrupt* — fitur yang langsung "membangunkan" program begitu pin berubah — saat ADC atau WiFi aktif (penjelasannya di 🔬).
- **I2C di 21/22 dan SPI di 18/19/23/5** adalah pin bawaan paket esp32 untuk papan ini sehingga library tidak perlu diatur ulang.
- **LED hijau dan kuning lampu lalu lintas Modul 3 (D18, D19) pensiun**: kedua pin itu dipesan untuk microSD.

Salinan peta ini disimpan sebagai `PETA-PIN.md` di repositori proyekmu (bagian ➕). Aturannya sederhana: **sebelum menambahkan apa pun ke Node 1, buka `PETA-PIN.md` dulu.**

### 4. Catu daya: otak dari laptop, tenaga dari adaptor

Mulai minggu ini, papan kita menggerakkan benda yang "lapar" listrik. Bandingkan kebutuhannya (angka kira-kira; lihat label barangmu):

| Komponen | Arus kira-kira |
| :--- | :--- |
| LED + resistor 220 Ω | ±6 mA |
| ESP32 sendiri | ±50–250 mA (paling besar saat WiFi menyala) |
| Satu kumparan relay 5 V | ±70 mA |
| Kipas 5 V 40 mm | ±70–200 mA |
| Pompa mini 5 V | ±100–300 mA, lebih besar sesaat ketika mulai berputar |
| Servo SG90 | ±100–250 mA saat bergerak, bisa ratusan mA lagi saat tertahan |

Port USB laptop biasanya hanya menjamin **500 mA** (USB 3: 900 mA). Masalahnya bukan hanya jumlah. Motor (kipas, pompa, servo) menyedot arus besar **sesaat** ketika mulai berputar. Pada saat itu tegangan USB turun sejenak, regulator papan tidak sanggup menahan 3,3 V, dan tegangan untuk chip ikut anjlok.

ESP32 punya penjaga untuk keadaan ini: **detektor *brownout*** (penjaga tegangan anjlok). Begitu tegangan chip turun di bawah batas aman (sekitar 2,4–2,8 V), chip **sengaja di-*restart*** supaya tidak berjalan ngawur. Di Serial Monitor muncul tulisan `Brownout detector was triggered`, lalu papan menyala ulang dari awal. Bagi pemula, gejalanya membingungkan: "Kenapa ESP32-ku *restart* setiap kali kipasnya menyala?" Kamu akan melihatnya sendiri di Praktik 8.

![Grafik tegangan 3,3 volt terhadap waktu dalam dua keadaan. Atas, beban dari USB laptop: saat kipas mulai berputar, tegangan anjlok di bawah garis batas brownout sekitar 2,4 sampai 2,8 volt, lalu ESP32 restart dan Serial Monitor mencetak Brownout detector was triggered. Bawah, beban dari MB102 dan adaptor: saat kipas mulai berputar, tegangan ESP32 hanya bergoyang sedikit dan tetap di atas batas sehingga ESP32 terus berjalan](aset/brownout-grafik.png)

Obatnya: **pisahkan jalur listrik**.

- **ESP32 tetap dari USB laptop.** Lewat kabel yang sama, kamu mengunggah program dan membaca Serial Monitor.
- **Semua beban dari catu daya kedua**: modul **MB102** yang ditancapkan di breadboard dan diberi makan **adaptor 5 V 2 A**. Relay, kipas, pompa, dan servo mengambil listrik dari rel 5 V MB102.
- **GND keduanya disatukan** dengan satu kabel. Ingat Modul 2: GND adalah "permukaan laut" tempat semua tegangan diukur. Tanpa GND bersama, sinyal 3,3 V dari ESP32 tidak dimengerti relay atau MOSFET.

![Diagram dua jalur listrik. Kiri, jalur 1 otak: laptop memberi data dan listrik ke papan ESP32 lewat kabel USB yang jatahnya hanya sekitar 500 miliampere; ESP32 memakai 3,3 volt untuk chip dan sinyal, dan rel bawah berisi 3,3 volt dari pin 3V3 untuk potensiometer dan sensor. Kanan, jalur 2 tenaga: adaptor USB 5 volt 2 ampere masuk ke port USB modul MB102 lewat kabel USB A ke A; MB102 mengisi rel atas dengan 5 volt untuk relay, kipas, pompa, dan servo, yang mengambil ratusan miliampere tanpa melewati ESP32. Satu kabel hitam menyatukan GND ESP32 dan GND MB102. Di bawah, tiga larangan bertanda silang merah: beban dari pin VIN atau 3V3 papan ESP32, adaptor 5 volt ke colokan bulat MB102 yang butuh 6,5 sampai 12 volt, dan menyambung rel 5 volt MB102 ke pin VIN atau 3V3 ESP32. Catatan paling bawah: VIN dan 3V3 bukan untuk beban, dan 3V3 hanya untuk ESP32 serta sensor kecil di rel bawah; urutan nyala-mati: colokkan USB dulu baru nyalakan MB102, matikan MB102 dulu baru cabut USB](aset/catu-daya-dua-jalur.png)

**Mengenal MB102.** Modul kecil ini ditancapkan di **ujung breadboard**, dengan kaki-kakinya masuk ke jalur daya atas dan bawah sekaligus.

![Ilustrasi modul catu daya breadboard MB102 dilihat dari atas, ditancapkan di ujung breadboard, dengan enam penanda: 1, port USB A tempat kabel dari adaptor 5 volt masuk, jalurnya langsung ke rel 5 volt tanpa regulator; 2, colokan bulat DC yang butuh 6,5 sampai 12 volt dan melewati regulator, bukan untuk adaptor 5 volt; 3, tombol daya yang di kebanyakan MB102 memutus kedua jalur masuk, dicek di Praktik 1.6; 4, LED tanda menyala; 5, dua jumper, satu untuk setiap sisi breadboard, dengan pilihan 3.3V, OFF, atau 5V, yang di rakitan kita dipasang 5V di sisi rel atas dan OFF di sisi rel tengah; 6, kaki-kaki di bawah modul yang masuk ke jalur plus dan minus di kedua sisi breadboard. Di tengah modul ada dua regulator, AMS1117-5.0 dan AMS1117-3.3](aset/mb102-anatomi.png)

- Masukan **port USB** (persegi panjang, tipe A) tersambung **langsung ke rel 5 V**, tanpa regulator. Di sinilah adaptor 5 V kita masuk, memakai **kabel USB A–A** (jantan di kedua ujung). Di kebanyakan MB102, tombol daya juga memutus jalur ini; kamu mengeceknya di Praktik 1.6.
- Masukan **colokan bulat** (*DC jack*) butuh **6,5–12 V** karena melewati dioda dan regulator AMS1117 yang hanya kuat ±700 mA. **Jangan colokkan adaptor 5 V ke sini**: rel "5 V" hanya akan berisi sekitar 3,5 V sehingga relay dan servo lemas. (Adaptor 9 V ke colokan bulat boleh, tetapi bebannya dibatasi ±700 mA dan regulatornya menjadi panas.)
- MB102 punya satu **jumper** (tutup kecil yang bisa dipindahkan) untuk setiap sisi breadboard, dengan tiga pilihan: **5V**, **OFF**, dan **3.3V**. Di rakitan kita, jumper sisi rel atas dipasang di **5V**, sedangkan jumper sisi satunya di **OFF**. Nama rel atas, rel tengah, dan rel bawah serta alasannya dijelaskan di Praktik 1.
- Lembar data MB102 menyebut arus keluaran maksimal ±700 mA. Dari port USB, listrik memang tidak melewati regulator, tetapi tetap melewati jalur tembaga kecil di MB102 (dan, di kebanyakan MB102, tombol dayanya). Jadi, anggap ±700 mA sebagai batas aman: jangan menjalankan pompa, kipas, dan servo bersamaan terus-menerus. Adaptor 2 A dipilih supaya tegangannya tidak ikut turun saat beban mulai berputar.

> [!CAUTION]
> **Kabel USB A–A hanya untuk adaptor → port USB MB102.** Jangan pernah mencolokkannya ke laptop atau di antara dua perangkat yang sama-sama berlistrik: dua sumber 5 V bisa beradu dan merusak port. Jangan pula memakai colokan bulat dan port USB MB102 bersamaan.

Satu trik lagi: **kapasitor elektrolit 100 µF** di dekat servo atau pompa berfungsi seperti "tandon kecil" yang menutup lonjakan arus sesaat. Pasang dengan kaki panjang (+) ke rel 5 V dan sisi bergaris (−) ke GND — terbalik bisa merusaknya.

> [!IMPORTANT]
> **Aturan emas catu daya (berlaku sampai akhir kurikulum):**
>
> 1. **Beban** (relay, kipas, pompa, servo) **selalu dari MB102**, tidak pernah dari pin VIN atau 3V3 ESP32.
> 2. **ESP32 dari USB laptop** (mulai Modul 9: dari adaptor sendiri).
> 3. **GND disatukan.**
> 4. **Rel 5 V MB102 tidak pernah disambung ke pin 3V3 ESP32**, dan **tidak ke pin VIN selama kabel USB laptop tercolok** — dua sumber listrik tidak boleh bertemu. (Cara memberi ESP32 daya dari adaptor dibahas di Modul 9.)
> 5. **Urutan nyala-mati:** colokkan USB laptop dulu, baru nyalakan MB102; matikan MB102 dulu, baru cabut USB. Kalau MB102 menyala sementara ESP32 belum bertenaga, listrik modul relay bisa merembes ke ESP32 lewat kabel IN (🚨).

ESP32 juga **mencatat alasan *restart* terakhirnya**: baru dinyalakan (`POWERON`), tegangan anjlok (`BROWNOUT`), program mogok (`PANIC`), dan seterusnya. Sketsa Praktik 8 mencetak catatan itu. Nanti, catatan yang sama ikut dilaporkan ke server dalam pesan kesehatan perangkat (`vitals`, kolom `reset_reason` di Lampiran A Silabus) — supaya kamu tahu dari jauh kalau perangkatmu sering *restart*.

> ☕ **Titik istirahat.** Konsep 1–4 adalah bekal Praktik 1: menata ulang meja kerja. Baca dulu [pengantar bagian Praktik](#-praktik-langkah-demi-langkah) (ada kotak **Tip** cara menyimpan sketsa), kerjakan [Praktik 1](#praktik-1--menata-ulang-meja-kerja-dua-breadboard-led-status-dan-mb102-4560-menit-sekali-pasang), lalu kembali ke sini untuk [Konsep 5](#5-masukan-digital-dan-pull-up-kenapa-tombolku-terbaca-acak).

### 5. Masukan digital dan *pull-up*: "Kenapa tombolku terbaca acak?"

Selama Modul 2–3, pin ESP32 selalu menjadi **keluaran** (*output*): pin yang **mengeluarkan** 3,3 V atau 0 V untuk LED. Pin juga bisa menjadi **masukan** (*input*). Pin masukan tidak mengeluarkan apa-apa; ia hanya **mengukur tegangan** yang datang, lalu menerjemahkannya menjadi satu dari dua jawaban:

| Tegangan di pin | Dibaca sebagai |
| :--- | :--- |
| di atas ±2,5 V | `HIGH` |
| di bawah ±0,8 V | `LOW` |
| di antara keduanya | tidak pasti — bisa `HIGH`, bisa `LOW` |

Tombol tekan (*push button*) sebenarnya hanya dua lempeng logam: ditekan → keduanya bersentuhan dan menyambung; dilepas → terpisah. Misalkan satu kaki tombol disambung ke pin dan kaki lainnya ke GND:

- **Ditekan**: pin tersambung ke GND → jelas `LOW`.
- **Dilepas**: pin **tidak tersambung ke apa pun**. Keadaan ini disebut **mengambang** (*floating*). Pin yang mengambang bertingkah seperti antena kecil: ia menangkap "riak" listrik dari jarimu, kabel di sebelahnya, atau lampu di ruangan sehingga bacaannya berubah-ubah sendiri. Itulah jawaban untuk pertanyaan klasik pemula: "Kenapa tombolku terbaca acak padahal tidak kusentuh?"

Obatnya adalah **resistor *pull-up*** (resistor penarik ke atas): resistor bernilai besar dari pin ke 3,3 V.

- Tombol dilepas → resistor "menarik" pin ke 3,3 V → `HIGH`. Pin tidak lagi mengambang.
- Tombol ditekan → pin tersambung langsung ke GND → `LOW`. Sedikit arus mengalir dari 3,3 V lewat resistor ke GND: 3,3 V ÷ 45 kΩ ≈ 0,07 mA, sangat kecil.

Resistor itu wajib ada. Kalau pin disambung langsung ke 3,3 V tanpa resistor, menekan tombol sama dengan menyambung 3,3 V ke GND: **korsleting** (Modul 2).

Bayangkan **pegas pintu**. Pegas membuat pintu selalu tertutup sendiri (`HIGH`). Tanganmu bisa mendorongnya terbuka (`LOW`), dan begitu dilepas, pintu tertutup lagi. Pegasnya sengaja lemah (resistornya besar) supaya mudah dikalahkan dorongan tangan.

![Tiga cara menyambung tombol ke pin ESP32, berdampingan. Kiri, mengambang: tombol dari pin D13 ke GND tanpa resistor penarik; saat dilepas bacaannya acak, ditekan terbaca LOW, dan Wokwi menganggapnya selalu LOW. Tengah, pull-up luar: resistor 10 kiloohm dari pin ke 3,3 volt dan tombol dari pin ke GND; dilepas terbaca HIGH, ditekan LOW. Kanan, INPUT_PULLUP: resistor sekitar 45 kiloohm sudah ada di dalam chip ESP32 dan digambar putus-putus sehingga di luar cukup tombol dari D13 ke GND; dilepas HIGH, ditekan LOW. Catatan bawah: logika terbalik, ditekan sama dengan LOW dan dilepas sama dengan HIGH; pin 34 sampai 39 tidak punya pull-up internal](aset/masukan-pullup.png)

Kabar baiknya, ESP32 **sudah punya resistor *pull-up* di dalam chip** (±45 kΩ). Kita tinggal menyalakannya:

```cpp
pinMode(PIN_TOMBOL, INPUT_PULLUP);  // masukan + pull-up internal
```

Hasilnya, rangkaian tombol cukup **dua kabel**: pin → tombol → GND, tanpa resistor tambahan. Itulah yang kamu pakai di Kemenangan Cepat. Konsekuensinya, logikanya **terbalik**: ditekan = `LOW`, dilepas = `HIGH`. Jadi, di kode, "tombol sedang ditekan" ditulis seperti ini:

```cpp
if (digitalRead(PIN_TOMBOL) == LOW) {  // LOW = sedang ditekan
  // ...
}
```

Tiga catatan penting:

- **Kebalikannya juga ada**: resistor ***pull-down*** (penarik ke bawah) ke GND, dengan tombol ke 3,3 V; ditekan = `HIGH`. ESP32 punya `INPUT_PULLDOWN`. Kurikulum ini selalu memakai *pull-up* dengan tombol ke GND. Selain paling umum di dunia Arduino, cara ini tidak membutuhkan kabel 3,3 V ke tombol — jadi tidak ada kabel bertegangan yang bisa tertukar dengan rel 5 V.
- **Pin 34–39 tidak punya *pull-up* internal** (Konsep 2). Di pin itu, `INPUT_PULLUP` diam-diam tidak berpengaruh sehingga tombol yang dipasang di sana tetap mengambang. Itu sebabnya tombol manual kita di **D13**, bukan D34.
- **Pin masukan tidak tahan 5 V**, sama seperti di Modul 2. Dengan *pull-up* ke 3,3 V dan tombol ke GND, pin tidak pernah melihat tegangan di atas 3,3 V. Jangan pernah menyambung tombol (atau apa pun yang menuju pin GPIO) ke rel 5 V MB102.

### 6. Pantulan tombol dan *debounce*

Di Praktik 2.1 nanti, kamu menjalankan program yang menghitung tekanan tombol. Tekan tombolnya **satu kali** — dan sering kali yang muncul `Tekanan ke-1`, `Tekanan ke-2`, `Tekanan ke-3` sekaligus. Programnya tidak salah. Tombolnya yang "nakal".

Lempeng logam di dalam tombol tidak langsung menempel dengan mantap. Seperti bola yang dijatuhkan ke lantai, ia **memantul** beberapa kali: menyambung-putus-menyambung-putus selama kira-kira 1–10 milidetik (kadang lebih), baru diam. Pantulan yang sama terjadi lagi saat tombol dilepas. Bagi mata manusia, 10 milidetik itu sekejap. Bagi ESP32 yang bisa membaca pin **ratusan ribu kali per detik**, setiap pantulan tampak seperti tekanan baru.

![Grafik tegangan pin D13 terhadap waktu selama satu kali tombol ditekan lalu dilepas, tidak sesuai skala. Mula-mula garis di 3,3 volt, HIGH. Saat jari menekan, garis naik-turun beberapa kali selama kira-kira 1 sampai 10 milidetik, ditandai kotak pantulan saat ditekan, lalu stabil di 0 volt, LOW. Saat jari diangkat ada pantulan lagi sebelum kembali ke HIGH. Di bawahnya, deretan titik bacaan ESP32 yang sangat rapat dengan catatan: setiap turun terbaca sebagai tekanan baru sehingga satu tekanan terbaca empat kali saat ditekan dan dua kali lagi saat dilepas, jadi enam kali. Kotak paling bawah menjelaskan empat langkah tombolDitekan dengan JEDA_PANTUL 30 milidetik: lihat LOW pertama; tunggu 30 milidetik lalu periksa lagi; tunggu sampai jari diangkat; tunggu 30 milidetik lagi lalu jawab true satu kali](aset/pantulan-tombol.png)

Meredam pantulan ini disebut ***debounce*** (peredam pantulan). Programnya memakai dua gagasan.

**Gagasan 1: tanggapi perubahan, bukan keadaan.** Kalau program berbunyi "selama tombol `LOW`, tambah hitungan", satu tekanan selama setengah detik bisa terhitung puluhan ribu kali. Yang kita mau adalah **saat berubah** dari dilepas ke ditekan. Caranya: ingat keadaan pada putaran sebelumnya, lalu bandingkan.

```cpp
int keadaan = digitalRead(PIN_TOMBOL);
if (keadaanLama == HIGH && keadaan == LOW) {  // tadi dilepas, sekarang ditekan
  jumlahTekan++;
}
keadaanLama = keadaan;  // ingat untuk putaran berikutnya
```

Cara ini sudah benar, tetapi pantulan masih lolos: setiap "putus-sambung" kecil di tengah pantulan juga terlihat sebagai perubahan dari `HIGH` ke `LOW`.

**Gagasan 2: tunggu sampai pantulannya reda.** Begitu melihat `LOW` pertama, jangan langsung percaya. Tunggu 30 milidetik — jauh lebih lama daripada pantulan, tetapi masih terlalu singkat untuk dirasakan manusia — lalu periksa lagi. Kalau masih `LOW`, itu tekanan sungguhan. Inilah fungsi yang akan kamu pakai berulang kali minggu ini:

```cpp
const int JEDA_PANTUL = 30;  // milidetik: waktu tunggu sampai pantulan tombol reda

// Menjawab true SATU kali untuk setiap tekanan sungguhan.
bool tombolDitekan() {
  if (digitalRead(PIN_TOMBOL) == HIGH) {  // tidak sedang ditekan
    return false;
  }
  delay(JEDA_PANTUL);                     // tunggu pantulan reda...
  if (digitalRead(PIN_TOMBOL) == HIGH) {  // ...ternyata sudah lepas lagi: cuma gangguan
    return false;
  }
  while (digitalRead(PIN_TOMBOL) == LOW) {  // tunggu sampai jari diangkat
    delay(1);
  }
  delay(JEDA_PANTUL);  // tombol juga memantul saat dilepas
  return true;
}
```

Baca dari atas ke bawah, seperti resep:

1. Tombol tidak ditekan? Jawab `false` dan selesai.
2. Ditekan? Tunggu 30 ms, lalu periksa lagi. Ternyata sudah lepas? Itu hanya gangguan sesaat; jawab `false`.
3. Masih ditekan: ini tekanan sungguhan. Tunggu sampai jari diangkat (perulangan `while` dari Modul 3), lalu tunggu 30 ms lagi untuk meredam pantulan saat dilepas.
4. Jawab `true` — tepat **satu kali** untuk satu tekanan.

Di `loop()`, pemakaiannya sesederhana ini:

```cpp
if (tombolDitekan()) {
  // lakukan sesuatu, misalnya membalik keadaan LED
}
```

Perhatikan juga: jawaban `true` baru keluar saat jari **diangkat**, jadi aksi di `loop()` terjadi sesudah tombol dilepas — bukan programnya yang lambat.

Fungsi ini sengaja sederhana. Kekurangannya, selama tombol ditahan, program "membeku" menunggu jari diangkat. Untuk minggu ini, itu tidak masalah. Di Modul 8 kamu belajar menunggu **tanpa membeku** (pola `millis()`) sehingga tombol, sensor, dan layar bisa diperiksa bergantian tanpa saling menunggu.

> ➡️ **Saatnya praktik.** Kerjakan [Praktik 2](#praktik-2--tombol-pantulan-dan-debounce-25-menit) — melihat pantulan dengan matamu sendiri, lalu meredamnya — kemudian kembali ke sini untuk [Konsep 7](#7-arus-pin-dan-penggerak-pin-untuk-memberi-perintah-bukan-tenaga).

### 7. Arus pin dan penggerak: pin untuk memberi perintah, bukan tenaga

Pin keluaran ESP32 hanya sanggup memberi **sedikit arus**. Lembar data (*datasheet*) Espressif menyebut ±20–40 mA per pin sebagai batas kemampuannya, tetapi bekerja terus-menerus di batas itu sama dengan menyetir dengan gas pol: bisa, tetapi cepat rusak. Aturan aman kurikulum ini: **paling banyak ±12 mA per pin**.

Bandingkan dengan kebutuhan "tangan-tangan" Node 1 (tabel Konsep 4):

| Beban | Butuh arus | Butuh tegangan | Langsung dari pin? |
| :--- | :--- | :--- | :---: |
| LED + resistor 220 Ω | ±6 mA | 3,3 V cukup | ✅ |
| Buzzer pasif + resistor 220 Ω | ±7 mA rata-rata | 3,3 V cukup | ✅ |
| Kumparan relay | ±70 mA | 5 V | ❌ |
| Kipas, pompa | ±100–300 mA | 5 V | ❌ |
| Servo SG90 | ±100–250 mA, lebih saat tertahan | 5 V | ❌ |

Tiga beban terakhir butuh arus **±6–25 kali** lebih besar daripada kemampuan aman pin (bahkan lebih saat motor tertahan), dengan tegangan yang lebih tinggi pula. Menyambungnya langsung ke pin berarti dua kemungkinan: bebannya tidak bergerak, atau pin ESP32 rusak permanen.

Jalan keluarnya adalah **penggerak** (*driver*): sakelar perantara yang mengambil tenaga dari MB102, sedangkan pin ESP32 cukup memberi **perintah**. Bayangkan sakelar lampu di dinding: jarimu tidak mengalirkan listrik ke lampu, jarimu hanya menekan sakelarnya. Pin ESP32 adalah "jari", sedangkan penggerak adalah "sakelar".

![Perbandingan tiga cara menyalakan beban dari pin ESP32. Kiri, centang hijau: pin D4 langsung ke resistor 220 ohm dan LED ke GND, arus sekitar 6 miliampere, aman. Tengah, silang merah: pin D25 langsung ke pompa; pompa butuh sekitar 300 miliampere dan 5 volt sehingga pompa diam, pin rusak, atau ESP32 restart. Kanan, centang hijau: pin D25 hanya mengirim perintah ke penggerak MOSFET, sedangkan pompa mendapat 5 volt dari rel atas MB102 dan panah merah arus pompa tidak lewat ESP32; GND bersama. Catatan bawah: penggerak minggu ini adalah modul relay untuk kipas dan lampu, MOSFET untuk pompa, dan rangkaian di dalam servo](aset/arus-pin-penggerak.png)

Minggu ini kamu memakai tiga macam penggerak:

| Beban | Penggerak | Arus yang ditanggung pin ESP32 |
| :--- | :--- | :--- |
| Kipas (dan nanti lampu) | **Modul relay** (Konsep 9) | beberapa mA saja, cukup untuk menyalakan LED kecil di dalam modul |
| Pompa | **MOSFET** IRLZ44N (Konsep 10) | hampir nol; hanya sentakan sesaat ketika berganti nyala-padam |
| Servo | **Rangkaian di dalam servo** itu sendiri | hampir nol: kabel sinyal hanya membawa "perintah sudut" |

Ada satu sifat lagi yang khas pada motor dan kumparan relay. Keduanya mengandung **kumparan kawat**, dan kumparan "tidak rela" arusnya diputus mendadak. Saat diputus, ia melontarkan lonjakan tegangan sesaat yang bisa mencapai puluhan volt — cukup untuk merusak penggerak. Pelindungnya adalah **dioda *flyback*** (dioda pelindung lonjakan balik, Konsep 10). Modul relay sudah membawanya sendiri untuk kumparan relay-nya; untuk pompa, kita memasangnya sendiri. Kalau "kipas"-mu berupa motor DC kecil telanjang dengan baling-baling — bukan kipas kotak 40 mm yang sudah berisi rangkaiannya sendiri — pasang juga 1N4007 sejajar motor itu, dengan cincin perak ke kabel (+).

### 8. PWM: satu teknik, tiga kegunaan (redup-terang, nada, dan sudut)

Pin digital hanya kenal dua keadaan: 3,3 V atau 0 V. Lalu bagaimana LED bisa **setengah terang**? Jawabannya: kedipkan LED itu **sangat cepat**, ribuan kali per detik. Mata kita tidak sanggup melihat kedipan secepat itu sehingga yang terlihat hanyalah rata-ratanya.

- Menyala 25 % dari waktu, padam 75 % → terlihat **redup**.
- Menyala 75 % dari waktu → terlihat **terang**.

Teknik ini bernama **PWM** (*Pulse Width Modulation*, modulasi lebar pulsa). Ada dua "kenop" untuk mengaturnya:

- ***Duty cycle*** (siklus kerja): berapa persen dari setiap putaran pin dalam keadaan menyala.
- **Frekuensi**: berapa kali pola nyala-padam itu diulang per detik, dalam **hertz** (Hz). Frekuensi 5.000 Hz berarti 5.000 kali per detik.

Dengan dua kenop itu, satu teknik yang sama bisa dipakai untuk tiga hal:

![Tiga kegunaan PWM, masing-masing satu baris gelombang kotak. Baris 1, redup-terang LED: frekuensi tetap 5.000 hertz; kiri, duty cycle 25 persen, pulsa sempit, LED redup, dengan kode ledcWrite(PIN_LED, 64); kanan, duty cycle 75 persen, pulsa lebar, LED terang, dengan kode ledcWrite(PIN_LED, 191). Baris 2, nada buzzer: duty cycle tetap 50 persen; kiri, 262 hertz, gelombang jarang, nada rendah do, dengan kode ledcWriteTone(PIN_BUZZER, 262); kanan, 523 hertz, gelombang dua kali lebih rapat, nada do tinggi, dengan kode ledcWriteTone(PIN_BUZZER, 523). Baris 3, sudut servo: satu pulsa setiap 20 milidetik, atau 50 hertz; dari kiri ke kanan, pulsa 0,5 milidetik berarti 0 derajat, sekitar 1,45 milidetik berarti 90 derajat, dan 2,4 milidetik berarti 180 derajat, masing-masing dengan gambar kecil lengan servo pada sudut itu; catatan: lebar pulsa diperbesar supaya terlihat, dan arah putar bergantung pada pemasangan lengan servo](aset/pwm-tiga-kegunaan.png)

| Kegunaan | Yang tetap | Yang diubah | Contoh |
| :--- | :--- | :--- | :--- |
| **Redup-terang LED** | frekuensi (5.000 Hz) | *duty cycle* | 25 % = redup, 75 % = terang |
| **Nada buzzer pasif** | *duty cycle* (50 %) | frekuensi = tinggi nada | 262 Hz = do, 523 Hz = do tinggi |
| **Sudut servo** | frekuensi (50 Hz, satu pulsa tiap 20 ms) | lebar pulsa | 0,5 ms = 0°, ±1,45 ms = 90°, 2,4 ms = 180° |

Di ESP32, PWM dikerjakan bagian chip bernama **LEDC** (*LED Control*, pengendali LED) — namanya memang dari LED, tetapi bisa dipakai untuk apa saja. Di paket esp32 **versi 3**, cara memakainya cukup beberapa perintah:

```cpp
ledcAttach(PIN_LED, 5000, 8);    // siapkan PWM di pin ini: frekuensi 5.000 Hz, resolusi 8 bit
ledcWrite(PIN_LED, 64);          // duty cycle 64 dari 255, kira-kira 25 %: redup
ledcAttach(PIN_BUZZER, 1000, 10);  // buzzer juga perlu ledcAttach dulu (frekuensinya nanti diganti)
ledcWriteTone(PIN_BUZZER, 440);  // bunyikan nada 440 Hz (duty cycle otomatis 50 %)
```

- **`ledcAttach(pin, frekuensi, resolusi)`** menyiapkan PWM di pin itu dan menggantikan `pinMode`. **Resolusi 8 bit** berarti *duty cycle* ditulis sebagai angka **0** (padam) sampai **255** (penuh), jadi 128 kira-kira 50 %.
- **`ledcWrite(pin, duty)`** mengatur *duty cycle*.
- **`ledcWriteTone(pin, frekuensi)`** mengubah frekuensi sambil menjaga *duty cycle* 50 % — pas untuk buzzer. Frekuensi `0` berarti diam.

> [!WARNING]
> **Awas tutorial lama.** Banyak tutorial di internet masih memakai cara paket esp32 **versi 2**: `ledcSetup(0, 5000, 8);` lalu `ledcAttachPin(4, 0);`. Di versi 3 yang kita pakai, kedua perintah itu **sudah dihapus**, jadi programnya gagal dikompilasi. Kalau menemukan contoh seperti itu, terjemahkan ke `ledcAttach` (contohnya ada di 🚨).

Untuk **servo**, kita tidak menghitung lebar pulsa sendiri. Library **ESP32Servo** yang mengurusnya: kita cukup menulis `write(90)`, dan library mengubahnya menjadi pulsa ±1,45 ms setiap 20 ms. Di balik layar, library itu juga memakai LEDC.

Satu hal lagi: ESP32 punya **16 saluran PWM**. Setiap `ledcAttach` dan setiap servo mengambil satu saluran secara otomatis. Saat servo dan buzzer dipakai bersama, urutannya penting: **servo dipasang dulu, baru buzzer** (penjelasannya di 🚨 dan 🔬).

Dua alat bantu dari Arduino akan sering kamu pakai bersama PWM:

```cpp
int kecerahan = map(putaran, 0, 4095, 0, 255);  // ubah skala 0-4095 menjadi 0-255
int sudut = constrain(angka, 0, 180);           // paksa supaya tetap di antara 0 dan 180
```

- **`map(nilai, dariMin, dariMaks, keMin, keMaks)`** mengubah skala, seperti mengubah nilai ujian 0–100 menjadi 0–4. Contoh: `2048` dari skala `0`–`4095` menjadi ±`127` di skala `0`–`255`.
- **`constrain(nilai, min, maks)`** "memagari" angka: yang lebih kecil daripada `min` dijadikan `min`, yang lebih besar daripada `maks` dijadikan `maks`.

> ➡️ **Saatnya praktik.** Kerjakan [Praktik 3](#praktik-3--meredupkan-led-dengan-potensiometer-15-menit) (*dimmer*), Praktik 4 (buzzer), dan Praktik 5 (servo), lalu kembali ke sini untuk [Konsep 9](#9-relay-sakelar-yang-digerakkan-magnet).

### 9. Relay: sakelar yang digerakkan magnet

**Relay** adalah sakelar yang tidak ditekan jari, melainkan ditarik **magnet listrik**. Di dalam kotak birunya ada:

- **kumparan** (*coil*): lilitan kawat yang menjadi magnet ketika dialiri arus (±70 mA pada 5 V);
- **tuas** besi berpegas yang tertarik oleh magnet itu;
- **tiga kontak**: **COM** (*common*, kaki bersama), **NO** (*normally open*, biasanya terbuka), dan **NC** (*normally closed*, biasanya tertutup).

Saat kumparan tidak dialiri arus, pegas menahan tuas sehingga **COM tersambung ke NC**. Begitu kumparan dialiri arus, magnet menarik tuas — "klik!" — dan **COM pindah tersambung ke NO**. Bunyi "klik" itulah tanda relay bekerja.

![Cara kerja relay dan modul relay 2 kanal. Kiri atas, bagian dalam relay saat kumparan tidak dialiri arus: satu tuas berengsel di kiri ditahan pegas sehingga ujung kanannya, kontak COM, menyentuh NC. Kiri bawah, saat kumparan dialiri arus: inti besi di kumparan menjadi magnet dan menarik tuas turun dengan bunyi klik sehingga ujung COM turun menyentuh NO. Kanan, ilustrasi modul relay 2 kanal dari atas dengan penanda: deretan pin GND, IN1, IN2, VCC di kiri; jumper JD-VCC; dua optocoupler; dua relay biru; LED indikator; dan terminal sekrup NO, COM, NC untuk setiap relay di kanan. Catatan: modul aktif LOW, IN diberi LOW berarti relay menarik](aset/relay-cara-kerja.png)

Kipas kita disambung lewat **COM dan NO**: 5 V dari MB102 masuk ke COM, NO menuju kabel merah (+) kipas, dan kabel hitam (−) kipas ke GND. Akibatnya, kipas **hanya berputar saat relay menarik**. Kalau ESP32 *restart* atau kabel IN-nya copot, relay melepas dan kipas berhenti. Prinsip "kalau ada yang gagal, keadaannya kembali aman" ini disebut ***fail-safe*** (aman-gagal).

**Modul relay** yang kita pakai bukan hanya relay telanjang. Papan kecil itu juga membawa *optocoupler* (lampu dan sensor cahaya mungil dalam satu kemasan sehingga sisi ESP32 hanya "berbicara" lewat cahaya dengan sisi kumparan), transistor penggerak, dioda *flyback*, dan LED indikator. Karena itu, pin ESP32 cukup memberi perintah dengan arus beberapa mA (Konsep 7).

Modul kita bertipe ***low-level trigger*** (dipicu sinyal rendah), alias **aktif LOW**:

| Pin IN diberi… | Relay | Kipas |
| :--- | :--- | :--- |
| `LOW` | menarik (berbunyi "klik"), LED indikator menyala | berputar |
| `HIGH` | melepas | diam |

Terbalik dari dugaan, bukan? Di dalam modul, pin IN tersambung ke **ujung (−)** lampu kecil di dalam *optocoupler*, sedangkan ujung (+)-nya ke VCC (5 V) lewat sebuah resistor. Lampu itu baru menyala ketika IN **ditarik ke bawah** menuju 0 V karena barulah ada beda tegangan yang cukup untuk mendorong arus. Supaya kode tidak membingungkan, kita membungkusnya dalam fungsi:

```cpp
// Modul relay kita "aktif LOW": LOW = relay menyambung (kipas jalan), HIGH = relay melepas.
void aturKipas(bool nyala) {
  if (nyala) {
    digitalWrite(PIN_RELAY_KIPAS, LOW);
  } else {
    digitalWrite(PIN_RELAY_KIPAS, HIGH);
  }
}
```

Setelah itu, `aturKipas(true)` berarti "kipas nyala" — tidak perlu lagi mengingat logika terbaliknya.

**Kenapa harus dicek dengan 3,3 V?** Modul relay ini sebenarnya dirancang untuk papan 5 V seperti Arduino Uno, yang "HIGH"-nya 5 V. "HIGH" ESP32 hanya 3,3 V sehingga antara VCC (5 V) dan IN masih tersisa beda tegangan 1,7 V. Di sebagian besar modul, 1,7 V tidak cukup untuk menyalakan lampu *optocoupler*, jadi relay melepas dengan benar. Namun, di sebagian modul, sisa tegangan itu cukup untuk membuat relay **tidak mau melepas** atau bergetar. Di Praktik 6 kamu mengeceknya **tanpa kode**, hanya dengan memindah satu kabel. Kalau modulmu ternyata termasuk yang bermasalah, ada jalan keluarnya lewat jumper **JD-VCC** (lihat 🚨).

> [!CAUTION]
> **Jangan pernah menyambung relay ke listrik PLN 220 V.** Tulisan "10A 250VAC" di badan relay memang menggoda, tetapi listrik PLN bisa **membunuh** dan memicu **kebakaran**. Breadboard dan kabel jumper tidak dirancang untuk tegangan itu, dan modul relay murah sering punya jarak jalur tembaga yang terlalu rapat untuk 220 V. Kurikulum ini **hanya** mengendalikan beban 5 V. Kalau suatu hari kamu ingin mengendalikan alat 220 V sungguhan, pakai produk jadi yang bersertifikat (misalnya colokan pintar ber-SNI) atau minta bantuan teknisi listrik berizin.

**Lampu di relay 1?** Kit Tahap 1 tidak berisi lampu. Relay lampu (IN1, D32) sudah disambung dan dikendalikan kode Node 1; untuk sekarang, "lampunya" adalah LED indikator di modul relay dan bunyi kliknya. Mau "lampu" sungguhan — LED biasa dengan resistor 220 Ω yang diberi 5 V dari rel atas, **bukan** bohlam 220 V? Lihat 🧩 Tingkat 3.

### 10. MOSFET dan dioda *flyback*: sakelar elektronik untuk pompa

Relay berbunyi "klik" dan punya bagian yang bergerak. Untuk pompa, kita memakai sakelar yang **sepenuhnya elektronik**: **MOSFET** (*metal-oxide-semiconductor field-effect transistor*, transistor efek medan). MOSFET tidak punya bagian yang bergerak, tidak bersuara, dan bisa berganti nyala-padam ribuan kali per detik.

MOSFET IRLZ44N punya tiga kaki. Pegang dengan **tulisan menghadapmu** dan kaki di bawah:

- **G** (*gate*, gerbang) — kaki **kiri**: tempat perintah dari ESP32 masuk.
- **D** (*drain*, saluran) — kaki **tengah**: disambung ke kabel (−) pompa. Lempeng logam di punggungnya juga tersambung ke D, jadi jangan biarkan lempeng itu menyentuh kabel atau kaki lain.
- **S** (*source*, sumber) — kaki **kanan**: ke GND.

Bayangkan **keran air**. Kaki G adalah tuas kerannya. Begitu G diberi tegangan (dibandingkan dengan S), "keran" antara D dan S terbuka dan arus besar dari pompa bisa mengalir ke GND. G diberi 0 V, keran tertutup. Yang istimewa: tuas ini hampir tidak membutuhkan arus sama sekali.

![Rangkaian pompa dengan MOSFET IRLZ44N. Kiri, skema: rel 5 volt MB102 ke pompa; ujung lain pompa ke kaki D MOSFET; kaki S ke GND; pin D25 lewat resistor 220 ohm ke kaki G; resistor 10 kiloohm dari titik antara D25 dan resistor 220 ohm ke GND; dioda 1N4007 sejajar dengan pompa, ujung bergaris ke sisi 5 volt. Panah merah menunjukkan arus pompa dari 5 volt lewat pompa, D, S, ke GND tanpa melewati ESP32. Tiga baris keterangan menjelaskan gunanya resistor 220 ohm, resistor 10 kiloohm, dan dioda. Kanan atas, MOSFET IRLZ44N dilihat dari depan dengan tulisan menghadap pembaca: kaki kiri G gerbang, tengah D saluran, kanan S sumber, dan lempeng logam di belakang tersambung ke D; catatan bahwa huruf L berarti logic-level sehingga 3,3 volt sudah cukup, sedangkan IRF520 tidak. Kanan bawah, dioda 1N4007 dengan cincin perak di satu ujung: cincin perak adalah katoda dan menghadap ke sisi 5 volt; terbalik berarti korsleting lewat MOSFET saat pompa dinyalakan](aset/mosfet-pompa.png)

Rangkaian ini disebut ***low-side switch*** (sakelar sisi bawah): pompa selalu tersambung ke 5 V, dan MOSFET menyambung atau memutus "jalan pulangnya" ke GND. Tiga komponen pendamping membuatnya aman:

1. **Resistor 220 Ω seri di kaki G.** Gerbang MOSFET berperilaku seperti kapasitor mungil. Tepat saat berganti nyala-padam, ada sentakan arus singkat untuk mengisinya; resistor ini meredamnya demi keselamatan pin ESP32.
2. **Resistor 10 kΩ dari jalur gerbang ke GND.** Saat ESP32 baru menyala, *restart*, atau saat program sedang diunggah, pin D25 sempat mengambang (Konsep 5). Tanpa resistor ini, gerbang bisa "tersetrum" sendiri dan pompa menyala tanpa diminta. Resistor 10 kΩ memastikan gerbang tetap 0 V — pompa diam — sampai program memerintahkan lain. Di rangkaian kita, resistor ini dipasang di sisi D25 dari resistor 220 Ω; karena gerbang hampir tidak mengalirkan arus, gerbang tetap ikut tertarik ke 0 V.
3. **Dioda *flyback* 1N4007 sejajar dengan pompa.** Ingat sifat kumparan di Konsep 7: saat MOSFET memutus arus, kumparan motor pompa "memaksa" arusnya tetap mengalir dan melontarkan lonjakan tegangan yang bisa merusak MOSFET. Bayangkan air deras di pipa yang kerannya ditutup mendadak: pipanya bisa jebol (palu air, *water hammer*). Dioda adalah "selang pelepas": dalam keadaan biasa ia diam saja, tetapi saat lonjakan datang, arus berputar lewat dioda dan pompa sampai habis dengan sendirinya. **Arahnya penting**: ujung bergaris perak (katoda) ke sisi **+5 V**. Terbalik, dioda itu langsung menyambung 5 V ke GND lewat MOSFET.

**Kenapa harus IRLZ44N?** Huruf **L** di namanya berarti ***logic-level***: gerbangnya sudah menghantar dengan baik pada tegangan rendah (mulai menghantar di sekitar 1–2 V dan terbuka penuh di 4–5 V). Jadi, 3,3 V dari ESP32 sudah cukup untuk arus pompa kita yang hanya ratusan mA. Banyak "modul MOSFET untuk Arduino" memakai **IRF520**, yang baru terbuka penuh di sekitar 10 V; dengan 3,3 V, pompa lemah atau tidak berputar sama sekali. Itu sebabnya kit kita menyebut IRLZ44N, atau modul **D4184** yang juga *logic-level*.

Kapan memakai relay, kapan MOSFET?

| | Relay | MOSFET |
| :--- | :--- | :--- |
| Cara kerja | mekanis, berbunyi "klik" | elektronik, senyap |
| Kecepatan | ±10 ms per perpindahan; tidak cocok untuk PWM | sangat cepat; bisa PWM (misalnya mengatur kecepatan pompa) |
| Yang bisa diputus | baik DC maupun AC, dan sisi beban terpisah dari ESP32 | hanya DC, dan GND harus bersama |
| Umur | terbatas: sekitar 100.000 kali perpindahan | hampir tak terbatas bila dipakai dalam batasnya |
| Di Node 1 | lampu dan kipas | pompa |

> ➡️ **Saatnya praktik.** Kerjakan [Praktik 6](#praktik-6--relay-tombol-menyalakan-kipas-dari-mb102-30-menit) sampai Praktik 9. Konsep 11 di bawah ini bacaan santai; boleh dibaca kapan saja.

### 11. Keluarga ESP32 sekilas

Saat mencari komponen, kamu akan bertemu banyak saudara ESP32. Semuanya buatan Espressif, bisa diprogram dengan Arduino IDE, dan sebagian besar kode kurikulum ini tetap jalan. Bedanya ada di "mesin" dan fiturnya:

| Chip | Inti | Nirkabel | Kelebihan | Catatan |
| :--- | :--- | :--- | :--- | :--- |
| **ESP32** (papan kita) | 2 inti Xtensa, 240 MHz | WiFi 4, Bluetooth Classic + BLE | paling banyak tutorialnya; punya DAC dan sensor sentuh | dipakai kurikulum ini |
| **ESP32-S3** | 2 inti Xtensa, 240 MHz | WiFi 4, BLE 5 | USB bawaan, lebih banyak pin, instruksi khusus kecerdasan buatan (AI) | tidak punya DAC dan Bluetooth Classic |
| **ESP32-C3** | 1 inti RISC-V, 160 MHz | WiFi 4, BLE 5 | murah, hemat daya | lebih sedikit pin |
| **ESP32-C6** | 1 inti RISC-V, 160 MHz | **WiFi 6**, BLE 5, Zigbee/Thread | cocok untuk rumah pintar generasi baru | pin dan aturannya berbeda |

Ingat dua hal. Pertama, **peta pin di modul ini hanya berlaku untuk ESP32 DevKit V1** (chip ESP32 klasik). Setiap anggota keluarga punya aturan pin *strapping*, ADC, dan pin terlarang sendiri. Kedua, Silabus sengaja meminta ESP32 DevKit V1 untuk kit kita: murah, mudah dicari, dan hampir semua tutorial ditulis untuknya. Saudara-saudaranya bisa kamu jelajahi setelah kurikulum ini selesai.

> ➡️ **Sudah membaca Konsep 11?** Belum mengerjakan [Praktik 6](#praktik-6--relay-tombol-menyalakan-kipas-dari-mb102-30-menit) sampai Praktik 9? Lanjutkan ke sana. Konsep 11 tidak punya praktik.

---

## 🔧 Praktik langkah demi langkah

Sembilan praktik, **berurutan**: semua komponen dipasang di meja kerja yang sama, dan di akhir modul semuanya menjadi Node 1. Praktik bertanda ⭐ di daftar isi adalah bagian dari syarat lulus:

1. **Praktik 2 dan 6** — satu tombol menyalakan dan mematikan relay tanpa pantulan (*bouncing*).
2. **Praktik 7 dan 8** — pompa dan kipas bekerja dari MB102 tanpa ESP32 *restart*.
3. Syarat ketiga, menyebutkan tiga pin yang dihindari beserta alasannya, ada di [Konsep 2](#2-pin-aman-pin-bersyarat-dan-pin-jebakan) dan Kuis.

Hampir setiap praktik bisa dicoba dulu di Wokwi dengan `diagram.json` dari folder [`kode/`](kode/), persis seperti Kemenangan Cepat, lalu dirakit di papan asli. Praktik 1 dan 8 hanya bisa di papan asli karena memang urusan listrik sungguhan.

> [!TIP]
> **Cara menyimpan sketsa minggu ini.** Untuk setiap sketsa, pilih **File → New Sketch** di Arduino IDE, hapus isi bawaannya (**Ctrl + A**, lalu **Delete**), tempel kodenya (**Ctrl + V**), lalu pilih **File → Save** dan beri nama sesuai yang disebut di praktiknya, misalnya `modul05_tombol_toggle`. Lebih praktis lagi, simpan langsung ke folder `modul-05` di dalam repositori `belajar-iot` (caranya di Praktik 9), lalu *commit* setiap kali satu praktik selesai.
>
> **Sebelum mengeklik Upload**, pastikan kotak papan di bilah atas Arduino IDE bertuliskan **DOIT ESP32 DEVKIT V1** dan port-nya benar (Modul 2). Macet di `Connecting…`? Tahan **BOOT** begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan. Serial Monitor selalu di **115200 baud**.

Di akhir modul, folder latihanmu berisi:

```text
belajar-iot/
└── modul-05/
    ├── modul05_hitung_tekanan/         ← Praktik 2.1
    ├── modul05_tombol_toggle/          ← Praktik 2.2 ⭐
    ├── modul05_dimmer_potensiometer/   ← Praktik 3
    ├── modul05_buzzer_nada/            ← Praktik 4
    ├── modul05_servo_serial/           ← Praktik 5
    ├── modul05_relay_kipas/            ← Praktik 6 ⭐
    ├── modul05_pompa_mosfet/           ← Praktik 7 ⭐
    ├── modul05_detektif_restart/       ← Praktik 8 ⭐
    └── meja-kerja.jpg                  ← Praktik 9 (foto rakitanmu)
```

Setiap folder sketsa berisi satu file `.ino` bernama sama, misalnya `modul05_tombol_toggle/modul05_tombol_toggle.ino` — Arduino IDE membuatnya otomatis saat kamu menyimpan.

### Praktik 1 — Menata ulang meja kerja: dua breadboard, LED status, dan MB102 (45–60 menit, sekali pasang)

> 🖥️ **Alat dan komponen:** dua breadboard, papan ESP32, LED merah + resistor 220 Ω (dari Modul 2), modul MB102 + adaptor USB 5 V 2 A + kabel USB A–A, multimeter, kabel jumper jantan–jantan (hitam dan oranye, ditambah dua kabel cadangan untuk mengukur), selotip kertas + spidol, dan pisau *cutter* (hanya kalau strip rel breadboard-mu terkunci perekat). **Arduino IDE** dipakai di langkah terakhir. Konsep yang dipakai: 1–4. Praktik ini tidak bisa disimulasikan di Wokwi.

**Kenapa harus ditata ulang?** Ingat Modul 2: papan ESP32 menutupi hampir seluruh lebar breadboard, dan hanya baris **j** di bawah deretan pin bawah yang tersisa. Deretan pin **atas** — tempat D13, D27, D26, D25, D33, dan D32, alias semua aktuator dan tombol kita — sama sekali tidak punya lubang bebas. Solusinya: **dua breadboard dijajarkan**, dan papan ESP32 "menunggangi" keduanya sehingga setiap deretan pin punya lubang bebasnya sendiri.

![Empat langkah menyiapkan dua breadboard, hanya sebagian kolom yang digambar; setiap panel diberi angka kolom 1, 5, 10, 15, 20 di atas serta huruf baris a dan j di kiri. 1, strip rel atas breadboard baru, yang ditempeli selotip bertulisan LEPAS, digeser memanjang sampai lepas dari badannya; garis sambungan strip ditandai, dengan catatan angka 1 di kiri, huruf a di atas. 2, breadboard baru tanpa strip rel atas diletakkan di depan breadboard lama; sisi baris a-nya menempel pada strip rel bawah breadboard lama yang kini menjadi rel tengah. 3, papan ESP32 dengan colokan USB di kiri dipaskan tanpa ditekan: deretan pin atas, dari VIN di kolom 4 sampai EN di kolom 18, ke baris i breadboard atas, dan deretan pin bawah, dari 3V3 sampai D23, ke baris b breadboard bawah; kalau belum pas, geser breadboard bawah. 4, hasilnya dilihat dari atas: lubang bebas berwarna hijau di baris f, g, h di atas deretan pin atas dan di baris c, d, e di bawah deretan pin bawah; baris f breadboard atas dan baris e breadboard bawah dilingkari sebagai baris yang dipakai modul ini](aset/dua-breadboard.png)

#### 1.1 Bongkar rangkaian lama

1. **Cabut kabel USB** dari papan.
2. Cabut semua kabel jumper, lalu LED hijau dan kuning dari Modul 3 beserta resistornya. Simpan baik-baik. LED merah dan resistornya juga dicabut sementara; keduanya dipasang lagi di langkah 1.4.
3. Cabut papan ESP32 dari breadboard: ungkit pelan dari kedua ujungnya **bergantian**, sedikit demi sedikit, dengan kuku atau obeng pipih (obeng minus) kecil. Jangan ditarik dari satu ujung saja karena kaki-kakinya bisa bengkok. Kaki yang sedikit bengkok boleh diluruskan dengan kuku.

#### 1.2 Siapkan breadboard kedua

Breadboard yang lama kita sebut **breadboard atas**, dan breadboard yang baru **breadboard bawah**. Letakkan keduanya dengan arah yang sama seperti di Modul 2: **angka 1 di kiri dan huruf a di atas** (baris a paling jauh dari tubuhmu, baris j paling dekat).

1. Lihat breadboard bawah. Di kedua tepi panjangnya ada **strip rel**: potongan panjang berisi dua jalur daya bergaris merah (+) dan biru (−). Di sebagian besar breadboard, strip ini adalah potongan terpisah yang dikunci "lidah" berbentuk ekor burung (*dovetail*) di sisinya dan direkatkan oleh lapisan perekat di bagian bawah. Yang akan dilepas adalah **strip rel atas**: strip di tepi atas, bersebelahan dengan **baris a**. Tempelkan selotip kertas bertuliskan **LEPAS** di strip itu sekarang, sebelum breadboard dibalik.
2. Balik breadboard bawah. Kalau lapisan perekatnya menutupi sambungan antara strip bertanda **LEPAS** dan badan breadboard, iris perekat itu tepat di garis sambungannya dengan pisau *cutter*. Iris menjauhi jarimu, pelan-pelan.
3. Geser strip bertanda **LEPAS** itu **memanjang**, ke arah ujung breadboard, sampai lepas. Jangan dicungkil ke atas — lidahnya bisa patah. Simpan strip itu; suatu saat bisa dipasang kembali. Stripnya menyatu dan tidak bisa dilepas sama sekali? Lihat 🚨.
4. Balik lagi breadboard bawah ke posisi semula (angka 1 di kiri, huruf a di atas), lalu letakkan **di depan** breadboard atas — lebih dekat ke tubuhmu, berdampingan di meja, bukan ditumpuk. Sisi baris a-nya, yang stripnya sudah dilepas, menempel pada **strip rel bawah breadboard atas**. Strip itu sekarang terjepit di tengah, jadi kita menyebutnya **rel tengah**. Ratakan ujung kiri kedua breadboard supaya kolom 1 bertemu kolom 1.

#### 1.3 Pasang ESP32 di atas kedua breadboard

1. Pegang papan dengan colokan USB di **kiri**, sama seperti di Modul 2. Deretan pin **atas** (VIN, GND, D13, D12, …, EN) akan masuk ke belahan bawah breadboard atas (baris f–j), sedangkan deretan pin **bawah** (3V3, GND, D15, D2, D4, …, D23) masuk ke belahan atas breadboard bawah (baris a–e).
2. **Paskan dulu tanpa menekan.** Arahkan kaki VIN ke kolom 4 breadboard atas dan kaki 3V3 ke kolom 4 breadboard bawah. Coba beberapa baris sampai **semua** kaki berada tepat di atas lubang; biasanya deretan atas jatuh di baris **i** dan deretan bawah di baris **b**. Kalau belum pas di baris mana pun, geser breadboard bawah sedikit menjauh atau mendekat — keduanya memang belum dikunci. **Jangan dipaksa**: kaki yang dipaksa masuk ke lubang yang salah akan bengkok.
3. Tekan papan pelan dan merata di kedua ujungnya sampai kakinya masuk. Tahan breadboard bawah dengan tangan satunya supaya tidak bergeser.
4. **Periksa lubang bebas.** Yang wajib: lubang di **baris f** breadboard atas dan **baris e** breadboard bawah, kolom 4–18, harus kosong dan tidak tertutup papan. Biasanya tersisa 2–3 baris di setiap sisi (baris f, g, h di atas; c, d, e di bawah). Tertutup? Cabut papan, geser breadboard bawah, lalu ulangi langkah 2. Setiap lubang bebas itu tersambung dengan kaki di kolomnya (Modul 2: lima lubang satu kolom = satu jalur).
5. Mulai sekarang, modul ini memakai **baris f breadboard atas** untuk deretan pin atas dan **baris e breadboard bawah** untuk deretan pin bawah. Kedua baris itu selalu bebas, apa pun hasil pencocokanmu. Contoh: **13f** (atas) berarti kolom 13, baris f, breadboard atas — tepat di atas kaki D32.
6. Supaya tidak bergeser, tempelkan kedua breadboard pada alas datar (karton tebal atau papan tipis) dengan perekat bawaannya atau selotip dua sisi. Opsional, tetapi sangat membantu.

#### 1.4 Pasang lagi LED status D4 dan rel 3,3 V

Semua sambungan di langkah ini ada di **breadboard bawah**. Pastikan USB masih tercabut.

> 💡 **Cara membaca nama lubang** (sama dengan Modul 2–3): angka = kolom, huruf = baris. Jadi, **4e** berarti kolom 4, baris e. Karena sekarang ada dua breadboard, keterangan (atas) atau (bawah) menunjukkan breadboard-nya. Warna kabel di tabel hanya saran — yang penting lubangnya — tetapi biasakan **hitam = GND**, **oranye = 3,3 V**, dan **merah = 5 V**. Gambar meja kerja di modul ini lebar; klik gambarnya untuk membuka ukuran penuh.

| Komponen | Dari | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| Kabel **oranye** | 4e (di bawah 3V3) | rel bawah **(+)** | rel bawah (+) menjadi 3,3 V untuk sensor dan potensiometer |
| Kabel **hitam** | 5e (di bawah GND) | rel bawah **(−)** | GND papan |
| Resistor 220 Ω | 8e (di bawah D4) | 8g, menyeberangi parit tengah | pembatas arus LED; 8e dan 8g dipisahkan parit tengah, jadi tidak tersambung langsung |
| LED merah | kaki **panjang** di 8i | kaki **pendek** di 9i | LED status |
| Kabel **hitam** | 9j | rel bawah **(−)** | "jalan pulang" LED |

#### 1.5 Pasang MB102: rel atas menjadi 5 V

1. Pastikan adaptor **belum** tercolok ke stopkontak.
2. Tancapkan MB102 di **ujung kanan breadboard atas**: kaki-kaki di bawahnya masuk ke rel atas dan rel tengah sekaligus, sedangkan colokan USB dan colokan bulatnya menghadap ke luar (ke kanan). Tekan pelan sampai masuk.
3. Atur jumper-nya. Jumper adalah tutup kecil berwarna kuning; cabut dengan kuku atau pinset, lalu tancapkan di dua pin dekat tulisan yang dipilih (cocokkan dengan gambar MB102 di Konsep 4). Jumper di sisi **rel atas** di posisi **5V**; jumper di sisi **rel tengah** di posisi **OFF** (atau cabut saja jumper-nya dan simpan). Rel tengah sebagian tertutup papan ESP32 dan bersebelahan dengan baris-baris bebas, jadi kalau ikut bertegangan, ia hanya mengundang salah colok. **Rel tengah tidak dipakai.**
4. Pasang **kabel hitam** dari **5f** (atas) — tepat di atas kaki GND deretan atas — ke **rel atas (−)**. Inilah **GND bersama** (Konsep 4): mulai sekarang GND papan, GND rel bawah, dan GND MB102 adalah satu.
5. Beri label dengan selotip kertas: tulis **5V** di dekat rel atas (+), **3V3** di dekat rel bawah (+), dan **JANGAN DIPAKAI** di rel tengah. Label kecil ini mencegah kesalahan paling mahal minggu ini: memberi 5 V ke sesuatu yang hanya tahan 3,3 V.

![Ilustrasi meja kerja setelah Praktik 1, dilihat dari atas. Breadboard atas utuh dengan rel atas di tepi atas dan rel tengah di tepi bawahnya; breadboard bawah tanpa strip rel atas, dengan rel bawah di tepi bawahnya. Papan ESP32 dengan colokan USB di kiri menunggangi keduanya: deretan pin atas di baris i breadboard atas, deretan pin bawah di baris b breadboard bawah, kolom 4 sampai 18. Di breadboard bawah: kabel oranye dari 4e di bawah 3V3 ke rel bawah plus, kabel hitam dari 5e di bawah GND ke rel bawah minus, resistor 220 ohm dari 8e di bawah D4 ke 8g, LED merah dengan kaki panjang di 8i dan kaki pendek di 9i, serta kabel hitam dari 9j ke rel bawah minus. Di breadboard atas: modul MB102 di ujung kanan, jumper sisi rel atas di 5V dan jumper sisi rel tengah di OFF, adaptor 5 volt masuk lewat kabel USB A ke A, serta kabel hitam GND bersama dari 5f di atas GND ke rel atas minus. Angka kolom juga tertulis di parit tengah kedua breadboard. Label: rel atas 5 V untuk beban, rel tengah tidak dipakai, rel bawah 3,3 V dari ESP32](aset/meja-kerja-1-dasar.png)

#### 1.6 Ukur dulu sebelum dipakai

Seperti di Modul 2, ujung *probe* terlalu besar untuk lubang breadboard. Tancapkan dua kabel jumper cadangan sebagai "perpanjangan", lalu tempelkan *probe* ke ujung logamnya. Putar sakelar multimeter ke **V⎓ 20**.

1. USB laptop **masih tercabut**. (Kali ini memang sengaja: belum ada modul relay atau komponen bertenaga MB102 yang tersambung ke pin GPIO. Mulai langkah 4 di bawah, selalu ikuti aturan emas nomor 5: USB dulu, baru MB102.) Colokkan adaptor ke stopkontak, sambungkan ke port USB MB102 dengan kabel USB A–A, lalu tekan tombol daya MB102. LED di MB102 menyala. Kabel A–A hanya untuk **adaptor ↔ MB102** — **jangan pernah mencolokkannya ke laptop**: MB102 yang diberi makan laptop sama saja dengan beban dari USB laptop (Praktik 8).
   - Cek tombolnya: tekan sekali lagi, LED MB102 harus **padam**, lalu tekan lagi supaya menyala. Kalau LED tetap menyala, tombol MB102-mu tidak memutus jalur USB. Mulai sekarang, setiap kali modul ini menyuruh "matikan MB102", **cabut kabel A–A dari MB102**.
2. Tancapkan kabel cadangan ke rel atas **(+)** dan **(−)** di **ujung kiri** (dekat kolom 1–5). Tempelkan *probe* merah ke kabel di (+) dan *probe* hitam ke kabel di (−). Layar harus menunjukkan **±5 V** (antara 4,75 V dan 5,25 V).
   - **Angkanya minus**, misalnya `-5.02`, padahal *probe* sudah benar? Berarti MB102 menaruh (+) di jalur bergaris **biru** breadboard-mu. Matikan MB102 dan baca 🚨 sebelum lanjut: kabel hitam 5f juga harus dipindahkan.
   - **`0`** padahal LED MB102 menyala? Rel atasmu kemungkinan **terputus di tengah** (Modul 2 Praktik 1). **Matikan MB102 dulu**, lalu pasang dua kabel penyambung di sekitar kolom 30–33: merah menyambung belahan kiri dan kanan jalur (+), hitam untuk jalur (−). Ukur lagi.
3. Pindahkan kabel cadangan yang disentuh *probe* merah ke **rel tengah (+)** di dekat MB102 (sekitar kolom 45–50, bagian yang tidak tertutup papan ESP32). Kabel yang disentuh *probe* hitam tetap di rel atas (−). Layar harus menunjukkan **±0 V** karena jumper sisi rel tengah di posisi OFF.
4. Matikan MB102. Sebelum mencolokkan USB, telusuri dengan jari: kabel oranye (4e) masuk jalur bergaris **merah** rel bawah, dan kabel hitam (5e, 9j) masuk jalur bergaris **biru** — tidak ada yang tertukar atau masuk jalur yang sama. Colokkan USB laptop ke papan ESP32. Ukur **rel bawah** di **ujung kiri** (dekat kolom 4–10): tancapkan kedua kabel cadangan ke (+) dan (−) rel bawah, lalu tempelkan *probe*-nya seperti tadi. Layar harus menunjukkan **±3,3 V**.
   - **`0`**, LED merah papan redup atau padam, atau papan terasa hangat? **Cabut USB sekarang**: kabel oranye dan hitam kemungkinan masuk ke jalur yang sama. Angkanya **minus** (`-3.3`)? Keduanya tertukar jalur.
5. Uji GND bersama: nyalakan lagi MB102, lalu ukur dengan *probe* merah di **rel atas (+)** dan *probe* hitam di **rel bawah (−)**. Layar harus menunjukkan **±5 V**. Angka ini membuktikan GND kedua sumber sudah menyatu lewat kabel 5f. Kalau `0` atau angkanya melompat-lompat, periksa kabel hitam 5f.

Catat hasilnya; kamu akan memakainya lagi di Praktik 8.

#### 1.7 Uji akhir: LED status berkedip lagi

1. Di Arduino IDE, buka sketsa Blink dari Modul 2: **File → Sketchbook → modul02_blink**. Tidak ketemu? Salin dari [`modul02_blink.ino`](../../fase-0-fondasi/modul-02-listrik-dan-unggah-pertama/kode/modul02_blink/modul02_blink.ino).
2. Klik **Upload**. LED merah di breadboard bawah berkedip setiap setengah detik. **Meja kerjamu siap.**

Tidak berkedip? Periksa arah LED (kaki panjang di 8i) dan resistornya (8e–8g). Masih gagal, lihat 🚨.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 5](#5-masukan-digital-dan-pull-up-kenapa-tombolku-terbaca-acak) dan baca sampai Konsep 6 (➡️ di sana akan mengantarmu ke Praktik 2).

### Praktik 2 — Tombol, pantulan, dan *debounce* (25 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi), satu tombol tekan, dua kabel jumper (kuning dan hitam). Konsep yang dipakai: 5 dan 6.
>
> ⭐ **Wajib** — bekal syarat lulus pertama: tombol tanpa pantulan.

#### Pasang tombolnya dulu

MB102 dimatikan dan USB dicabut dulu (urutan aturan emas nomor 5). Tombol dipasang **melintang di parit tengah breadboard atas**, sama seperti tombol di kebanyakan tutorial.

| Komponen | Posisi (breadboard atas) | Gunanya |
| :--- | :--- | :--- |
| Tombol tekan | empat kaki di **22e, 24e, 22f, 24f** | melintangi parit tengah |
| Kabel **kuning** | **6f** (di atas D13) → **22h** | menyambung D13 ke kaki tombol 22f |
| Kabel **hitam** | **24a** → rel atas **(−)** | menyambung kaki tombol 24e ke GND |

Perhatikan: kaki yang dipakai, **22f** dan **24e**, saling **bersilangan** (diagonal). Di dalam tombol empat kaki, dua pasang kaki selalu tersambung permanen, dan arah pasangannya bergantung pada cara tombol dipasang. Memakai kaki yang bersilangan **selalu benar**, ke mana pun tombolmu menghadap. Sebelum menyalakan lagi, pastikan ujung kabel hitam 24a masuk jalur **(−)** rel atas, **bukan** jalur berlabel **5V** di sebelahnya. Selesai merakit, colokkan lagi USB laptop; MB102 belum perlu dinyalakan sampai Praktik 5.

![Ilustrasi meja kerja setelah Praktik 2, sama dengan Praktik 1 ditambah tombol tekan yang melintangi parit tengah breadboard atas dengan kaki di 22e, 24e, 22f, dan 24f; kabel kuning dari 6f di atas D13 ke 22h; kabel hitam dari 24a ke rel atas minus. Kaki 22f dan 24e yang bersilangan ditandai lingkaran dan garis putus-putus oranye. Komponen dari Praktik 1 digambar pudar](aset/meja-kerja-2-tombol.png)

#### 2.1 Lihat pantulannya: `modul05_hitung_tekanan`

1. Mau mencoba di Wokwi dulu? Buka proyek ESP32 baru, tempel [`diagram.json`](kode/modul05_hitung_tekanan/diagram.json) dan kode di bawah, lalu klik **▶**. Tombol Wokwi sengaja dibuat memantul seperti tombol asli.
2. Di Arduino IDE, buat sketsa baru **`modul05_hitung_tekanan`** (cara membuat dan menyimpan sketsa, serta memeriksa papan sebelum mengeklik **Upload**, ada di kotak **Tip** di awal bagian Praktik) dengan kode ini (file: [`modul05_hitung_tekanan.ino`](kode/modul05_hitung_tekanan/modul05_hitung_tekanan.ino)), lalu klik **Upload** dan buka Serial Monitor:

   ```cpp
   // Modul 5 - Praktik 2.1: menghitung tekanan tombol TANPA debounce
   // Tekan tombol di D13 satu kali, lalu lihat Serial Monitor.
   // Sering kali satu tekanan terhitung lebih dari satu: itulah "pantulan" (bounce).

   const int PIN_TOMBOL = 13;  // tombol manual (peta pin kanonik)

   int keadaanLama = HIGH;  // keadaan tombol pada putaran loop() sebelumnya
   int jumlahTekan = 0;

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     Serial.println("Tekan tombol SATU kali, lalu lihat angkanya.");
   }

   void loop() {
     int keadaan = digitalRead(PIN_TOMBOL);
     if (keadaanLama == HIGH && keadaan == LOW) {  // baru saja berubah: dilepas -> ditekan
       jumlahTekan++;
       Serial.print("Tekanan ke-");
       Serial.println(jumlahTekan);
     }
     keadaanLama = keadaan;  // ingat untuk putaran berikutnya
   }
   ```

3. Tekan tombol **satu kali** dengan mantap, lalu lepaskan. Ulangi beberapa kali sambil menghitung sendiri.

   **Hasilnya** kira-kira seperti ini — angkanya melompat lebih cepat daripada tekananmu:

   ```text
   Tekan tombol SATU kali, lalu lihat angkanya.
   Tekanan ke-1
   Tekanan ke-2
   Tekanan ke-3
   Tekanan ke-4
   ```

   ![Dua potongan tangkapan layar Wokwi berdampingan. Kiri, berjudul tombol hijau diklik hanya 3 kali: papan ESP32 dengan tombol hijau di D13. Kanan, berjudul tetapi terhitung sampai ke-49: Serial Monitor yang baris-baris terakhirnya Tekanan ke-34 sampai Tekanan ke-49. Catatan bawah: tombol Wokwi sengaja dibuat memantul seperti tombol asli, setiap pantulan terbaca sebagai tekanan baru, dan angkanya bisa berbeda setiap kali dicoba](aset/wokwi-pantulan-tombol.png)

   *Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

   Di Wokwi, tiga tekanan bisa terhitung sampai puluhan kali. Di papan asli, hasilnya bergantung pada tombolmu: tombol baru kadang rapi, tombol murah atau yang ditekan pelan sering memantul. Kalau tombolmu kebetulan "sopan", tekan pelan-pelan setengah jalan — biasanya pantulannya muncul.

#### 2.2 Redam pantulannya: `modul05_tombol_toggle`

Sekarang kita pakai fungsi `tombolDitekan()` dari Konsep 6. Setiap tekanan membalik LED status: nyala → padam → nyala.

1. Wokwi: pakai [`diagram.json`](kode/modul05_tombol_toggle/diagram.json) — sama dengan Kemenangan Cepat (tombol + LED D4), **bukan** diagram 2.1 yang belum punya LED. Arduino IDE: buat sketsa baru **`modul05_tombol_toggle`** (file: [`modul05_tombol_toggle.ino`](kode/modul05_tombol_toggle/modul05_tombol_toggle.ino)):

   ```cpp
   // Modul 5 - Praktik 2.2: satu tekanan = satu kali berganti (dengan debounce)
   // Setiap kali tombol di D13 ditekan, LED di D4 berganti: nyala -> padam -> nyala ...

   const int PIN_TOMBOL = 13;   // tombol manual (peta pin kanonik)
   const int PIN_LED = 4;       // LED status
   const int JEDA_PANTUL = 30;  // milidetik: waktu tunggu sampai pantulan tombol reda

   bool ledMenyala = false;
   int jumlahTekan = 0;

   // Menjawab true SATU kali untuk setiap tekanan sungguhan.
   bool tombolDitekan() {
     if (digitalRead(PIN_TOMBOL) == HIGH) {  // tidak sedang ditekan
       return false;
     }
     delay(JEDA_PANTUL);                     // tunggu pantulan reda...
     if (digitalRead(PIN_TOMBOL) == HIGH) {  // ...ternyata sudah lepas lagi: cuma gangguan
       return false;
     }
     while (digitalRead(PIN_TOMBOL) == LOW) {  // tunggu sampai jari diangkat
       delay(1);
     }
     delay(JEDA_PANTUL);  // tombol juga memantul saat dilepas
     return true;
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     pinMode(PIN_LED, OUTPUT);
     Serial.println("Tekan tombol: LED berganti nyala/padam.");
   }

   void loop() {
     if (tombolDitekan()) {
       ledMenyala = !ledMenyala;  // dibalik: true menjadi false, false menjadi true
       jumlahTekan++;
       Serial.print("Tekanan ke-");
       Serial.print(jumlahTekan);
       if (ledMenyala) {
         digitalWrite(PIN_LED, HIGH);
         Serial.println(": LED NYALA");
       } else {
         digitalWrite(PIN_LED, LOW);
         Serial.println(": LED PADAM");
       }
     }
   }
   ```

2. Klik **Upload**, buka Serial Monitor, lalu tekan tombol beberapa kali — pelan, cepat, atau setengah jalan.

   **Hasilnya:** satu baris untuk setiap tekanan, dan LED berganti setiap kali — tepat saat jarimu **diangkat**, bukan saat menekan (ingat Konsep 6).

   ```text
   Tekan tombol: LED berganti nyala/padam.
   Tekanan ke-1: LED NYALA
   Tekanan ke-2: LED PADAM
   Tekanan ke-3: LED NYALA
   ```

Baris baru di sini hanya **`ledMenyala = !ledMenyala;`**. Tanda `!` (artinya "bukan", Modul 3) membalik nilai `bool`: `true` menjadi `false` dan sebaliknya. Itulah inti *toggle* (sakelar bolak-balik): satu tombol untuk menyalakan sekaligus mematikan.

Masih ada tekanan yang terhitung dua kali? Naikkan `JEDA_PANTUL` menjadi `50`. Tombol tidak bereaksi sama sekali? Lihat 🚨.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 7](#7-arus-pin-dan-penggerak-pin-untuk-memberi-perintah-bukan-tenaga) dan baca sampai Konsep 8 (➡️ di sana akan mengantarmu ke Praktik 3).

### Praktik 3 — Meredupkan LED dengan potensiometer (15 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi), potensiometer 10 kΩ, tiga kabel jumper (hitam, oranye, hijau). LED status D4 dari Praktik 1. Konsep yang dipakai: 8.

**Potensiometer** adalah resistor dengan tombol putar. Dua kaki luarnya ke 3,3 V dan GND, sedangkan kaki tengahnya mengeluarkan tegangan di antara keduanya: 0 V saat diputar mentok ke satu sisi, 3,3 V saat mentok ke sisi lain. ESP32 membaca tegangan itu dengan `analogRead()` sebagai angka `0`–`4095`. Di Modul 6, pin yang sama (VN) dipakai sensor kelembapan tanah — potensiometer ini adalah "sensor latihan"-nya.

#### 3.1 Pasang potensiometer

MB102 dimatikan dan USB dicabut dulu. Potensiometer dipasang di **breadboard bawah**, dekat rel 3,3 V.

> [!WARNING]
> **Kaki potensiometer ke rel bawah (3,3 V), bukan ke rel atas (5 V).** Kaki tengahnya bisa mengeluarkan tegangan setinggi kaki luarnya, dan pin VN tidak tahan 5 V.

| Komponen | Posisi | Gunanya |
| :--- | :--- | :--- |
| Potensiometer 10 kΩ | kaki kiri **24h**, tengah **26h**, kanan **28h** (bawah); badannya di sisi baris f–g, jadi baris i–j tetap bebas | — |
| Kabel **hitam** | **24j** → rel bawah **(−)** | kaki kiri ke GND |
| Kabel **oranye** | **28j** → rel bawah **(+)** | kaki kanan ke 3,3 V |
| Kabel **hijau** | **26j** (bawah) → **16f** (atas, di atas VN) | kaki tengah ke VN (GPIO 39); 26j sejalur dengan kaki tengah 26h |

Kaki potensiometermu berjarak lain, atau bentuknya segitiga (potensiometer *trimmer* kecil, sering disebut *trimpot*)? Pakai tiga kolom berbeda yang pas. Yang penting, kabel hijau ada di kolom **kaki tengah** dan ujung satunya di VN. Selesai merakit, colokkan lagi USB laptop (MB102 belum perlu dinyalakan).

![Ilustrasi meja kerja setelah Praktik 3: potensiometer di breadboard bawah dengan kaki di 24h, 26h, dan 28h; kabel hitam dari 24j ke rel bawah minus; kabel oranye dari 28j ke rel bawah plus 3,3 volt; kabel hijau dari 26j di breadboard bawah melintas di atas potensiometer, naik di sisi kanan papan ESP32, lalu berbelok ke kiri sampai 16f di breadboard atas, tepat di atas pin VN, tanpa menutupi label pin VN, VP, dan EN. Badan potensiometer menutupi baris f dan g di atas kakinya. Komponen dari Praktik 1 dan 2 digambar pudar](aset/meja-kerja-3-potensiometer.png)

#### 3.2 Unggah `modul05_dimmer_potensiometer`

1. Wokwi: [`diagram.json`](kode/modul05_dimmer_potensiometer/diagram.json). Saat simulasi berjalan, **klik potensiometernya**, lalu tekan **End** (mentok kanan), **Home** (mentok kiri), atau panah **←**/**→** untuk memutarnya sedikit demi sedikit. Bisa juga dengan menyeret tombol putarnya dengan mouse.
2. Arduino IDE: buat sketsa baru **`modul05_dimmer_potensiometer`** (file: [`modul05_dimmer_potensiometer.ino`](kode/modul05_dimmer_potensiometer/modul05_dimmer_potensiometer.ino)):

   ```cpp
   // Modul 5 - Praktik 3: meredupkan LED dengan potensiometer
   // Putar potensiometer di VN (GPIO 39): LED di D4 meredup dan menerang.
   // PWM memakai ledcAttach + ledcWrite (cara paket esp32 versi 3).

   const int PIN_POT = 39;          // VN: potensiometer (di Modul 6 menjadi sensor tanah)
   const int PIN_LED = 4;           // LED status
   const int FREKUENSI_PWM = 5000;  // 5.000 kedipan per detik: terlalu cepat untuk dilihat mata
   const int RESOLUSI_PWM = 8;      // 8 bit: kecerahan 0 (padam) sampai 255 (penuh)

   void setup() {
     Serial.begin(115200);
     ledcAttach(PIN_LED, FREKUENSI_PWM, RESOLUSI_PWM);  // D4 menjadi keluaran PWM (tidak perlu pinMode)
   }

   void loop() {
     int putaran = analogRead(PIN_POT);              // 0 (mentok kiri) sampai 4095 (mentok kanan)
     int kecerahan = map(putaran, 0, 4095, 0, 255);  // ubah ke skala 0-255
     ledcWrite(PIN_LED, kecerahan);
     Serial.print("potensiometer = ");
     Serial.print(putaran);
     Serial.print("   kecerahan = ");
     Serial.println(kecerahan);
     delay(200);
   }
   ```

3. Klik **Upload**, buka Serial Monitor, lalu putar potensiometer pelan-pelan dari ujung ke ujung.

   **Hasilnya:** LED meredup dan menerang mengikuti putaranmu, dan angkanya ikut berubah.

   ```text
   potensiometer = 0   kecerahan = 0
   potensiometer = 1025   kecerahan = 63
   potensiometer = 2050   kecerahan = 127
   potensiometer = 4095   kecerahan = 255
   ```

Tiga hal yang perlu diperhatikan:

- **`analogRead`** tidak perlu `pinMode` — pin langsung dibaca sebagai masukan analog. Di papan asli, angkanya jarang tepat `0` atau `4095` dan sedikit "bergoyang" di setiap bacaan; itu wajar. Modul 6 membahas sebabnya dan cara meredamnya.
- **`ledcAttach`** sudah menyiapkan D4 untuk PWM, jadi `pinMode(PIN_LED, OUTPUT)` tidak diperlukan.
- Diputar ke kanan malah meredup? Kabel kaki kiri dan kanannya tinggal ditukar (hitam ↔ oranye) — atau biarkan saja; tidak ada yang rusak.

### Praktik 4 — Buzzer memainkan nada (15 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi dengan pengeras suara laptop menyala), buzzer **pasif**, resistor 220 Ω, dua kabel jumper (biru dan hitam). Konsep yang dipakai: 7 dan 8.

**Buzzer pasif** hanya berbunyi kalau diberi getaran listrik, dan tinggi nadanya mengikuti frekuensi getaran itu — pas untuk PWM. (Saudaranya, **buzzer aktif**, punya pembangkit nada sendiri: diberi listrik saja langsung berbunyi "tiiit" dengan satu nada. Bagian bawah buzzer pasif biasanya memperlihatkan papan hijau, sedangkan buzzer aktif tertutup rapat.)

#### 4.1 Pasang buzzer

MB102 dimatikan dan USB dicabut dulu. Buzzer dipasang di **belahan atas breadboard atas**.

| Komponen | Posisi (breadboard atas) | Gunanya |
| :--- | :--- | :--- |
| Buzzer pasif | kaki **(+)** di **27b**, kaki **(−)** di **30b** | kalau jarak kakinya lain, pakai kolom terdekat yang pas |
| Kabel **biru** | **9f** (di atas D27) → **27e** | sinyal PWM ke kaki (+) |
| Resistor 220 Ω | **30e** → **34e** | pembatas arus (Konsep 7) |
| Kabel **hitam** | **34a** → rel atas **(−)** | jalan pulang ke GND |

Kaki (+) biasanya lebih panjang atau ditandai "+" di badan buzzer. Untuk buzzer pasif, arahnya tidak terlalu menentukan, tetapi biasakan mengikuti tandanya. Selesai merakit, colokkan lagi USB laptop (MB102 belum perlu dinyalakan).

![Ilustrasi meja kerja setelah Praktik 4: buzzer pasif hitam di belahan atas breadboard atas dengan kaki plus di 27b dan kaki minus di 30b; kabel biru dari 9f di atas D27 ke 27e; resistor 220 ohm dari 30e ke 34e; kabel hitam dari 34a ke rel atas minus. Komponen dari Praktik 1 sampai 3 digambar pudar](aset/meja-kerja-4-buzzer.png)

#### 4.2 Unggah `modul05_buzzer_nada`

1. Wokwi: [`diagram.json`](kode/modul05_buzzer_nada/diagram.json); nyalakan pengeras suara laptopmu.
2. Arduino IDE: buat sketsa baru **`modul05_buzzer_nada`** (file: [`modul05_buzzer_nada.ino`](kode/modul05_buzzer_nada/modul05_buzzer_nada.ino)):

   ```cpp
   // Modul 5 - Praktik 4: buzzer pasif memainkan nada
   // Buzzer pasif di D27 (lewat resistor 220 ohm). Tinggi nada = frekuensi PWM.

   const int PIN_BUZZER = 27;  // buzzer (peta pin kanonik)

   // Frekuensi tangga nada (Hz), oktaf ke-4
   const int DO = 262;
   const int RE = 294;
   const int MI = 330;
   const int FA = 349;
   const int SOL = 392;
   const int LA = 440;
   const int SI = 494;
   const int DO_TINGGI = 523;

   // "Twinkle Twinkle Little Star" (lagu rakyat, domain publik): nada dan panjangnya (dalam ketukan)
   const int LAGU[] = {DO, DO, SOL, SOL, LA, LA, SOL, FA, FA, MI, MI, RE, RE, DO};
   const int KETUKAN[] = {1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2};
   const int JUMLAH_NADA = 14;
   const int SATU_KETUKAN = 350;  // milidetik

   // Membunyikan satu nada selama lamaMs milidetik, lalu diam sebentar.
   void bunyikan(int frekuensi, int lamaMs) {
     ledcWriteTone(PIN_BUZZER, frekuensi);  // mulai berbunyi pada frekuensi ini
     delay(lamaMs);
     ledcWriteTone(PIN_BUZZER, 0);          // frekuensi 0 = diam
     delay(50);                             // jeda pendek supaya dua nada sama tetap terdengar terpisah
   }

   void setup() {
     Serial.begin(115200);
     ledcAttach(PIN_BUZZER, 1000, 10);  // siapkan PWM di D27; frekuensinya diganti untuk tiap nada

     Serial.println("Tangga nada: do re mi fa sol la si do");
     int tangga[] = {DO, RE, MI, FA, SOL, LA, SI, DO_TINGGI};
     for (int i = 0; i < 8; i++) {
       bunyikan(tangga[i], 300);
     }
     delay(500);

     Serial.println("Lagu: Twinkle Twinkle Little Star");
     for (int i = 0; i < JUMLAH_NADA; i++) {
       bunyikan(LAGU[i], KETUKAN[i] * SATU_KETUKAN);
     }
     Serial.println("Selesai. Tekan tombol EN di papan untuk mendengarkan lagi.");
   }

   void loop() {
     // sengaja kosong: lagunya cukup dimainkan sekali di setup()
   }
   ```

3. Klik **Upload**. Buzzer memainkan tangga nada do-re-mi, lalu potongan lagu "Twinkle Twinkle Little Star". Di Wokwi, klik **↻** (ulangi simulasi) untuk mendengarkan lagi.

   **Hasilnya** di Serial Monitor:

   ```text
   Tangga nada: do re mi fa sol la si do
   Lagu: Twinkle Twinkle Little Star
   Selesai. Tekan tombol EN di papan untuk mendengarkan lagi.
   ```

Semua bahan program ini sudah kamu kenal dari Modul 3: konstanta, *array* (`LAGU` dan `KETUKAN` berpasangan, nada ke-*i* dengan ketukan ke-*i*), perulangan `for`, dan fungsi buatan sendiri (`bunyikan`). Yang baru hanya **`ledcWriteTone`** (Konsep 8). Bunyinya terlalu keras? Ganti resistor 220 Ω dengan 1 kΩ.

### Praktik 5 — Servo 0–180° lewat Serial Monitor (25 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dengan library **ESP32Servo 3.2.1** (atau Wokwi), servo SG90 beserta lengannya, kapasitor elektrolit 100 µF, tiga kabel jumper jantan–jantan. MB102 dinyalakan saat menguji di 5.3. Konsep yang dipakai: 4, 7, dan 8.

![Foto servo SG90 berbadan biru transparan dengan empat penanda. 1, colokan betina hitam berlubang tiga di ujung kabel, disambung dengan kabel jumper jantan–jantan. 2, tiga kabel servo: cokelat ke GND, merah ke 5 volt dari MB102, dan oranye ke pin sinyal D26. 3, badan servo yang berisi motor, roda gigi, dan sensor sudut. 4, lengan plastik putih yang dipasang di poros dan ikut berputar; garis penunjuknya memutar lewat kiri dan bawah servo](aset/foto-servo-sg90.jpg)

*Foto: Suyash Dwivedi, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tower_Pro_SG90_micro_servo_motor.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); penanda oleh penulis. Gambar berpenanda ini juga berlisensi CC BY-SA 4.0.*

**Servo** adalah motor kecil yang tahu posisinya sendiri: di dalamnya ada motor, roda gigi, dan sensor sudut. Kita cukup mengirim "perintah sudut" lewat kabel sinyal (Konsep 8), dan rangkaian di dalam servo yang bekerja keras memutar porosnya. Tenaganya datang dari rel 5 V MB102, bukan dari ESP32.

#### 5.1 Pasang library ESP32Servo

1. Di Arduino IDE, klik ikon **Library Manager** di bilah kiri (ikon ketiga, bergambar buku), sama seperti di Modul 3 Praktik 7.
2. Ketik **ESP32Servo** di kotak pencarian. Pilih entri **ESP32Servo by Kevin Harrington,John K. Bennett** — ada library lain yang namanya mirip, misalnya **ServoESP32**.
3. Pastikan menu versinya menunjukkan **3.2.1** (pilih dari daftar kalau sudah ada versi lebih baru), lalu klik **INSTALL**.
4. Tunggu sampai entri itu bertuliskan `3.2.1 installed`.

Di Wokwi, library ditambahkan lewat tab **Library Manager** → tombol bulat **+** → ketik **ESP32Servo** → klik hasilnya. Tab **`libraries.txt`** lalu muncul sendiri. Klik tab itu dan ubah baris `ESP32Servo` menjadi `ESP32Servo@3.2.1` (cara Modul 3 Praktik 7B). Setelah tab **`libraries.txt`** ada, kamu juga boleh mengganti seluruh isinya dengan isi [`libraries.txt`](kode/modul05_servo_serial/libraries.txt) dari folder praktik ini.

#### 5.2 Pasang servo

MB102 dimatikan dan USB dicabut dulu. Kabel servo berujung colokan **betina**, jadi sambungkan dengan tiga kabel jumper jantan–jantan.

> [!CAUTION]
> **Arah kapasitor elektrolit tidak boleh terbalik.** Sisi badannya yang bergaris dengan tanda "−" harus ke GND. Terbalik, kapasitor bisa menggembung atau meletus kecil.

| Kabel servo | Ke | Gunanya |
| :--- | :--- | :--- |
| **Cokelat** | rel atas **(−)** | GND |
| **Merah** | rel atas **(+)** | 5 V dari MB102 |
| **Oranye** | **10f** (atas, di atas D26) | sinyal sudut |
| Kapasitor 100 µF | kaki **panjang (+)** ke rel atas (+), kaki **pendek** (sisi bergaris "−") ke rel atas (−), kira-kira di kolom 16 | "tandon kecil" penahan lonjakan arus (Konsep 4) |

Kabel servomu hitam–merah–putih (atau hitam–merah–kuning)? Polanya sama: **hitam** menggantikan cokelat (GND), dan **putih** atau **kuning** menggantikan oranye (sinyal). Kabel jumper penyambungnya boleh warna apa saja; oranye di tabel dan gambar adalah warna kabel sinyal servo, bukan tanda 3,3 V.

Pasang salah satu lengan servo (tanpa sekrup pun boleh) supaya gerakannya mudah dilihat. Jangan memutar lengan itu dengan tangan saat servo menyala — roda giginya dari plastik.

![Ilustrasi meja kerja setelah Praktik 5: servo SG90 di luar breadboard dengan tiga kabel jumper: cokelat ke rel atas minus, merah ke rel atas plus, oranye ke 10f di atas D26; kapasitor elektrolit 100 mikrofarad menancap di rel atas kolom 16, kaki plusnya di jalur plus dan sisi bergaris minus menghadap jalur minus, dengan tanda plus merah dan minus biru di sebelahnya. Komponen dari Praktik 1 sampai 4 digambar pudar](aset/meja-kerja-5-servo.png)

#### 5.3 Unggah `modul05_servo_serial`

1. Wokwi: [`diagram.json`](kode/modul05_servo_serial/diagram.json) dan [`libraries.txt`](kode/modul05_servo_serial/libraries.txt). Di diagram Wokwi itu, servo mengambil daya dari pin **VIN** karena Wokwi tidak punya MB102 dan tidak menghitung arus. **Jangan tiru di papan asli**: di mejamu, servo tetap mendapat daya dari rel atas MB102.
2. Arduino IDE: buat sketsa baru **`modul05_servo_serial`** (file: [`modul05_servo_serial.ino`](kode/modul05_servo_serial/modul05_servo_serial.ino)):

   ```cpp
   // Modul 5 - Praktik 5: menggerakkan servo SG90 lewat Serial Monitor
   // Library: ESP32Servo versi 3.2.1 (pasang lewat Library Manager).
   // Sinyal servo di D26; daya servo dari rel 5 V MB102 (bukan dari papan ESP32).

   #include <ESP32Servo.h>

   const int PIN_SERVO = 26;  // servo tirai (peta pin kanonik)

   Servo tirai;  // satu "objek" servo yang kita beri nama tirai

   void setup() {
     Serial.begin(115200);
     tirai.setPeriodHertz(50);            // servo mengharapkan 50 pulsa per detik
     tirai.attach(PIN_SERVO, 500, 2400);  // pulsa 0,5 ms = 0 derajat ... 2,4 ms = 180 derajat
     tirai.write(90);                     // mulai dari tengah
     Serial.println("Ketik sudut 0-180, lalu tekan Enter.");
   }

   void loop() {
     if (Serial.available() > 0) {
       String teks = Serial.readStringUntil('\n');  // ambil satu baris ketikan
       teks.trim();                                 // buang sisa tanda Enter
       int sudut = teks.toInt();                    // "120" menjadi 120 (yang bukan angka menjadi 0)
       if (sudut == 0 && teks != "0") {             // jadi 0, padahal yang diketik bukan "0"?
         Serial.println("Itu bukan angka. Ketik angka 0-180.");
         return;                                    // abaikan; tunggu ketikan berikutnya
       }
       sudut = constrain(sudut, 0, 180);            // jaga supaya tetap di antara 0 dan 180
       tirai.write(sudut);
       Serial.print("Servo ke ");
       Serial.print(sudut);
       Serial.println(" derajat");
     }
   }
   ```

3. Colokkan USB, nyalakan MB102, lalu klik **Upload**. Servo langsung berputar ke tengah (90°).
4. Buka Serial Monitor (pemilih ujung baris di sebelah pemilih baud harus **New Line**, seperti di Modul 3). Ketik `0`, tekan **Enter**; lalu `180`; lalu `45`. Coba juga `200` dan `halo`.

   **Hasilnya:**

   ```text
   Ketik sudut 0-180, lalu tekan Enter.
   Servo ke 0 derajat
   Servo ke 180 derajat
   Servo ke 45 derajat
   Servo ke 180 derajat
   Itu bukan angka. Ketik angka 0-180.
   ```

   Ketikan `200` dipagari `constrain` menjadi 180, sedangkan `halo` ditolak. Ke arah mana lengan bergerak untuk 0° dan 180° bergantung pada cara lengan dipasang dan merek servonya; yang penting, keduanya adalah dua ujung gerakan.

Yang baru di sketsa ini:

- **`#include <ESP32Servo.h>`** memanggil library-nya, dan **`Servo tirai;`** membuat satu "objek" servo bernama `tirai`. Kalau punya dua servo, buat dua objek.
- **`tirai.attach(PIN_SERVO, 500, 2400)`** memberi tahu library pin sinyalnya dan lebar pulsa untuk 0° dan 180° (dalam mikrodetik: 500 µs = 0,5 ms). **`tirai.write(sudut)`** menggerakkan servo.
- **Pemeriksaan "bukan angka"**: `toInt()` (Modul 3) mengubah teks yang bukan angka menjadi `0`. Jadi, kalau hasilnya 0 padahal yang diketik bukan `"0"`, ketikan itu pasti bukan angka. Perintah `return;` mengakhiri putaran `loop()` ini lebih awal; `loop()` berikutnya menunggu ketikan baru.

Servo berdengung atau bergetar di 0° atau 180°? Banyak SG90 tidak sanggup tepat 180° sehingga porosnya menekan batas mekanisnya. Lihat 🚨.

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 9](#9-relay-sakelar-yang-digerakkan-magnet) dan baca sampai Konsep 10 (➡️ di akhir Konsep 10 akan mengantarmu ke Praktik 6).

### Praktik 6 — Relay: tombol menyalakan kipas dari MB102 (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi), modul relay 2 kanal, kipas 5 V, empat kabel jumper **jantan–betina** 20 cm (ditambah dua cadangan untuk perbaikan JD-VCC di 🚨, kalau perlu), dua kabel jumper jantan–jantan (satu merah untuk COM, satu cadangan untuk uji 6.3), dan obeng pipih (obeng minus) kecil untuk terminal sekrup. Tombol dari Praktik 2. Konsep yang dipakai: 4, 6, 7, dan 9.
>
> ⭐ **Wajib** — syarat lulus pertama dari tiga: satu tombol menyalakan dan mematikan relay tanpa pantulan. Kipasnya juga separuh dari syarat kedua.

#### 6.1 Kenali modul relay-mu

Lihat modulnya (gambar di Konsep 9):

- Di satu ujung ada deretan pin **GND**, **IN1**, **IN2**, **VCC**. Urutannya bisa berbeda antarpabrik — **baca tulisan di papanmu**.
- Di dekatnya ada tiga pin bertuliskan **GND**, **VCC**, **JD-VCC** dengan sebuah **jumper** yang menyambung VCC dan JD-VCC. Biarkan terpasang.
- Di ujung lain, setiap relay punya terminal sekrup **NO**, **COM**, **NC**. Tidak ada tulisannya? Terminal yang **tengah** hampir selalu COM. Pastikan dengan mode bip multimeter (atau **Ω 200**, Modul 2) selagi modul tanpa listrik: COM–NC tersambung (berbunyi bip atau angkanya mendekati 0), sedangkan COM–NO tidak.
- Relay yang dikendalikan IN1 kita sebut **relay 1** (relay lampu), dan yang dikendalikan IN2 kita sebut **relay 2** (relay kipas). Biasanya keduanya berlabel **K1** dan **K2**; kalau ragu, lihat saja relay mana yang berbunyi saat uji di 6.3.

Punya modul **1 kanal**? Pinnya hanya **GND**, **IN**, **VCC** (kadang tertulis **DC−**, **IN**, **DC+**). Sambungkan IN ke D33, dan lewati semua yang menyebut IN1.

#### 6.2 Sambungkan sisi kendali

MB102 dimatikan dan USB dicabut dulu. Letakkan modul relay di meja, di belakang breadboard atas (di luar tepi atasnya) — jangan ditumpuk di atas breadboard. Pasang ujung **betina** kabel jumper ke pin modul dan ujung **jantan** ke breadboard. Di gambar meja kerja, deretan pin digambar di tepi bawah modul supaya kabelnya lurus. Susunan modulmu bisa berbeda (bandingkan dengan gambar Konsep 9); ikuti tulisan di pinnya. Kabel yang bersilangan tidak apa-apa.

| Pin modul relay | Ke | Gunanya |
| :--- | :--- | :--- |
| **GND** | rel atas **(−)** | GND bersama |
| **IN1** | **13f** (atas, di atas D32) | relay lampu |
| **IN2** | **12f** (atas, di atas D33) | relay kipas |
| **VCC** | rel atas **(+)** | 5 V untuk modul dan kumparan relay |

#### 6.3 Uji 3,3 V tanpa kode

Langkah ini menjawab pertanyaan penting di Konsep 9: apakah modul relay-mu mau **melepas** saat diberi "HIGH"-nya ESP32 yang hanya 3,3 V?

Ini satu-satunya uji yang memindahkan kabel saat listrik menyala. Pegang bagian plastiknya dan pindahkan **hanya** ujung kabel IN2, persis ke lubang yang disebut.

1. Cabut sementara ujung jantan kabel **IN2** dari 12f, lalu coba rentangkan ke rel bawah; kabel jantan–betina 20 cm biasanya sampai. Terlalu pendek? Selagi listrik masih mati, pasang dulu kabel jantan–jantan dari **40d** (breadboard bawah) ke **rel bawah (+)**. Di langkah 4, ujung IN2 cukup ditancapkan di **40c**.
2. Colokkan USB laptop (supaya rel bawah berisi 3,3 V), lalu nyalakan MB102.
3. Tancapkan ujung jantan kabel IN2 ke lubang **rel atas (−)**. Relay 2 berbunyi "klik" dan LED indikatornya menyala — bukti modulmu aktif LOW.
4. Pindahkan ujung itu ke lubang **rel bawah (+)** (atau ke **40c** kalau memakai kabel perpanjangan), yang berisi 3,3 V. Relay harus **melepas** (berbunyi "klik" lagi) dan LED indikatornya **padam**. Kalau begitu, modulmu cocok untuk ESP32. 🎉

   Relay tetap menarik, atau LED-nya tetap menyala redup? Modulmu termasuk yang tidak mau melepas pada 3,3 V. Jangan lanjut dulu; perbaiki dengan cara di 🚨.
5. Matikan MB102 dan cabut USB dulu, **lalu** kembalikan ujung kabel IN2 ke **12f**.

#### 6.4 Sambungkan kipas lewat relay 2

Relay hanya **sakelar**; listrik untuk kipas tetap datang dari rel atas 5 V.

| Dari | Ke | Cara |
| :--- | :--- | :--- |
| Kabel jumper **merah** jantan–jantan: rel atas **(+)** | terminal **COM** relay 2 | kendurkan sekrup COM, masukkan ujung jantan kabel, kencangkan |
| Kabel **merah (+)** kipas | terminal **NO** relay 2 | sama |
| Kabel **hitam (−)** kipas | rel atas **(−)** | langsung ke lubang breadboard |

Ujung kabel kipas yang tipis biasanya sudah dilapisi timah dan bisa langsung masuk ke terminal sekrup atau lubang breadboard. Kalau kabel kipasmu berujung colokan, sambungkan dengan kabel jumper jantan–jantan. Pastikan baling-balingnya bebas berputar dan tidak menghadap kabel lain.

![Ilustrasi meja kerja setelah Praktik 6: modul relay 2 kanal diletakkan di belakang breadboard atas, dengan deretan pin VCC, IN2, IN1, dan GND di tepi bawahnya. Keempatnya turun lurus dengan kabel jantan–betina: VCC merah ke rel atas plus, IN2 ungu ke 12f di atas D33, IN1 merah muda ke 13f di atas D32, dan GND hitam ke rel atas minus; di sebelahnya pin GND, VCC, JD-VCC dengan jumper JD-VCC terpasang. Kabel merah dari rel atas plus ke terminal COM relay 2, kabel merah kipas ke terminal NO relay 2, dan kabel hitam kipas ke rel atas minus. Komponen dari Praktik 1 sampai 5 digambar pudar](aset/meja-kerja-6-relay.png)

#### 6.5 Unggah `modul05_relay_kipas`

1. Wokwi: [`diagram.json`](kode/modul05_relay_kipas/diagram.json). Wokwi tidak punya kipas, jadi kipas diwakili LED berlabel **kipas**. Modul relay Wokwi di sini diatur aktif LOW seperti modul aslimu. Di diagram itu, modul relay mengambil daya dari pin **VIN** dan LED kipasnya dari 3V3 tanpa resistor karena Wokwi tidak punya MB102 dan LED simulasinya tidak bisa rusak. **Jangan tiru di papan asli**: di mejamu, relay dan kipas tetap mendapat daya dari rel atas MB102, dan LED selalu memakai resistor.
2. Arduino IDE: buat sketsa baru **`modul05_relay_kipas`** (file: [`modul05_relay_kipas.ino`](kode/modul05_relay_kipas/modul05_relay_kipas.ino)):

   ```cpp
   // Modul 5 - Praktik 6: tombol menyalakan dan mematikan kipas lewat relay
   // Relay kipas di D33 (IN2 modul relay 2 kanal, aktif LOW). Tombol di D13.
   // Kipas mendapat 5 V dari MB102 lewat kontak COM-NO relay.

   const int PIN_TOMBOL = 13;       // tombol manual (peta pin kanonik)
   const int PIN_RELAY_KIPAS = 33;  // relay kipas (peta pin kanonik)
   const int JEDA_PANTUL = 30;      // milidetik

   bool kipasMenyala = false;

   // Menjawab true SATU kali untuk setiap tekanan sungguhan (sama dengan Praktik 2.2).
   bool tombolDitekan() {
     if (digitalRead(PIN_TOMBOL) == HIGH) {
       return false;
     }
     delay(JEDA_PANTUL);
     if (digitalRead(PIN_TOMBOL) == HIGH) {
       return false;
     }
     while (digitalRead(PIN_TOMBOL) == LOW) {
       delay(1);
     }
     delay(JEDA_PANTUL);
     return true;
   }

   // Modul relay kita "aktif LOW": LOW = relay menyambung (kipas jalan), HIGH = relay melepas.
   void aturKipas(bool nyala) {
     if (nyala) {
       digitalWrite(PIN_RELAY_KIPAS, LOW);
     } else {
       digitalWrite(PIN_RELAY_KIPAS, HIGH);
     }
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     pinMode(PIN_RELAY_KIPAS, OUTPUT);
     aturKipas(false);  // segera pastikan kipas mati
     Serial.println("Tekan tombol untuk menyalakan atau mematikan kipas.");
   }

   void loop() {
     if (tombolDitekan()) {
       kipasMenyala = !kipasMenyala;
       aturKipas(kipasMenyala);
       if (kipasMenyala) {
         Serial.println("Kipas NYALA");
       } else {
         Serial.println("Kipas MATI");
       }
     }
   }
   ```

3. Colokkan USB, nyalakan MB102, lalu klik **Upload**. Buka Serial Monitor dan tekan tombolnya.

   **Hasilnya:** setiap tekanan membuat relay berbunyi "klik" dan kipas berganti nyala-mati — saat jarimu diangkat, sama seperti LED di Praktik 2.2.

   ```text
   Tekan tombol untuk menyalakan atau mematikan kipas.
   Kipas NYALA
   Kipas MATI
   Kipas NYALA
   ```

4. **Uji kelulusan:** tekan tombol **10 kali** dengan berbagai cara — cepat, pelan, setengah jalan. Hitung baris di Serial Monitor: harus tepat **10**, dan kipas berganti tepat 10 kali tanpa "meloncat". ✅ Syarat lulus pertama tercapai.

Sesaat setelah unggahan selesai atau saat tombol **EN** ditekan, relay mungkin berbunyi "klik". Kalau kipas sedang menyala, itulah bunyi relay **melepas**: selama ESP32 menyala ulang, pin D33 tidak mengeluarkan apa-apa, dan relay aktif LOW memang melepas kalau pin IN-nya tidak ditarik ke `LOW` (sifat *fail-safe*, Konsep 9).

Lalu, kenapa `aturKipas(false)` harus dipanggil **tepat** setelah `pinMode` di `setup()`? Karena `pinMode(PIN_RELAY_KIPAS, OUTPUT)` langsung membuat pin itu `LOW`, dan bagi relay aktif LOW, `LOW` berarti **menarik**. Baris berikutnya segera mengubahnya menjadi `HIGH`, jadi relay tidak sempat menyalakan kipas. Memanggil `digitalWrite` **sebelum** `pinMode` tidak menolong: di paket esp32 versi 3, perintah itu diabaikan selama pin belum diatur sebagai keluaran.

### Praktik 7 — Pompa 3 detik lewat MOSFET (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi), MOSFET **IRLZ44N** (atau modul D4184), resistor 220 Ω dan 10 kΩ, dioda **1N4007**, pompa mini 5 V + selang, dua gelas (satu berisi air), wadah atau nampan, dan tiga kabel jumper jantan–jantan (putih, hitam, merah). Tombol dari Praktik 2. Konsep yang dipakai: 7 dan 10.
>
> ⭐ **Wajib** — bagian dari syarat lulus kedua: pompa bekerja dari MB102.

#### 7.1 Siapkan pompa dan airnya

1. Letakkan kedua gelas di atas nampan, di sisi meja yang **jauh dari adaptor, stopkontak, dan laptop**, sejauh kabel pompa memungkinkan. Air dan listrik tidak boleh bertemu. Kabel pompa kurang panjang? Sambung dengan kabel jumper — jangan dekatkan gelasnya.
2. Pasang selang di lubang keluar pompa, lalu masukkan ujung selang lainnya ke gelas kedua (atau kembali ke gelas yang sama supaya airnya berputar).
3. Celupkan pompa ke gelas berair sampai **seluruh badannya terendam**. Pompa mini tidak boleh dijalankan kering lebih dari beberapa detik — ia didinginkan oleh air yang dipompanya.

#### 7.2 Rangkai MOSFET

MB102 dimatikan dan USB dicabut dulu. Semua komponen dipasang di **belahan atas breadboard atas**. Pegang MOSFET dengan **tulisan menghadapmu**: kaki kiri G, tengah D, kanan S (Konsep 10).

| Komponen | Posisi (breadboard atas) | Gunanya |
| :--- | :--- | :--- |
| MOSFET IRLZ44N | **G 42b**, **D 43b**, **S 44b**; tulisan menghadapmu | sakelar pompa |
| Kabel **putih** | **11f** (di atas D25) → **38e** | perintah dari D25 |
| Resistor 220 Ω | **38d** → **42d** | resistor gerbang |
| Resistor 10 kΩ | **34c** → **38c** | penarik ke GND: kolom 34 sudah tersambung ke GND sejak Praktik 4 |
| Kabel **hitam** | **44d** → rel atas **(−)** | S ke GND; mulai dari depan MOSFET, jauh dari lempeng logam di punggungnya |
| Kabel **merah** | rel atas **(+)** → **48a** | kolom 48 menjadi jalur 5 V |
| Dioda 1N4007 | **43e** → **48e**, cincin perak di **48e** | dioda *flyback* |
| Pompa | kabel **merah (+)** → **48c**; kabel **hitam (−)** → **43d** | — |

Kabel pompa mini biasanya tipis dan berserabut. Pilin ujung logamnya rapat-rapat dengan jari, lalu tancapkan dalam-dalam. Kalau tetap tidak mau masuk atau mudah lepas, lilitkan ujung itu erat-erat pada kaki logam kabel jumper jantan–jantan, bungkus dengan selotip, lalu tancapkan kabel jumper-nya.

Belum mengerjakan Praktik 4? Pasang dulu kabel hitam **34a** → rel atas (−) supaya kolom 34 tersambung ke GND.

![Ilustrasi meja kerja setelah Praktik 7 dengan komponen lama digambar pudar. Di belahan atas breadboard atas: MOSFET IRLZ44N tegak dengan kaki G di 42b, D di 43b, dan S di 44b; kabel putih dari 11f di atas D25 ke 38e; resistor 220 ohm dari 38d ke 42d; resistor 10 kiloohm dari 34c ke 38c; kabel hitam dari 44d ke kanan lalu naik di sisi kanan MOSFET ke rel atas minus, jauh dari lempeng logamnya; kabel merah dari rel atas plus ke 48a; dioda 1N4007 dari 43e ke 48e dengan cincin perak di 48e. Pompa di gelas air di atas nampan, di belakang breadboard, dengan catatan: letakkan sejauh mungkin dari adaptor dan laptop (gambar tidak sesuai skala). Kabel merah pompa ke 48c, dan kabel hitamnya turun di jalur kolom 43 ke 43d. Huruf G, D, S tertulis di bawah kaki MOSFET. Kotak keterangan di bawah gambar mengulang posisi lubang itu](aset/meja-kerja-7-pompa.png)

Sebelum menyalakan apa pun, periksa tiga hal yang paling sering terbalik: **urutan kaki MOSFET** (tulisan menghadapmu), **cincin perak dioda** di kolom 48 (sisi 5 V), dan kabel **merah pompa** di kolom 48 — bukan kabel hitamnya.

Punya **modul D4184**, bukan IRLZ44N? Modul itu sudah berisi MOSFET dan resistornya. Cara menyambungnya:

- Terminal masukan (biasanya **VIN+**/**VIN−** atau **DC+**/**DC−**) ke rel atas (+) dan (−).
- Terminal keluaran (**OUT+**/**OUT−**) ke kabel merah dan hitam pompa.
- Pin sinyal (**TRIG**, **PWM**, atau **SIG**) ke **11f** (D25), dan pin **GND**-nya ke rel atas (−).
- Dioda 1N4007 tetap dipasang. Jepit kakinya bersama kabel pompa di terminal sekrup yang sama: kaki bercincin perak bersama kabel merah di **OUT+**, kaki satunya bersama kabel hitam di **OUT−**.

#### 7.3 Unggah `modul05_pompa_mosfet`

1. Wokwi: [`diagram.json`](kode/modul05_pompa_mosfet/diagram.json). Wokwi tidak punya MOSFET dan pompa, jadi pompa diwakili LED berlabel **pompa** langsung di D25. Hanya kodenya yang bisa diuji di sana.
2. Arduino IDE: buat sketsa baru **`modul05_pompa_mosfet`** (file: [`modul05_pompa_mosfet.ino`](kode/modul05_pompa_mosfet/modul05_pompa_mosfet.ino)):

   ```cpp
   // Modul 5 - Praktik 7: pompa menyala 3 detik lewat MOSFET IRLZ44N
   // Gerbang (G) MOSFET di D25 lewat resistor 220 ohm; resistor 10 kiloohm dari jalur gerbang ke GND.
   // Pompa mendapat 5 V dari MB102. Dioda 1N4007 sejajar pompa, cincin perak di sisi 5 V.

   const int PIN_TOMBOL = 13;    // tombol manual (peta pin kanonik)
   const int PIN_POMPA = 25;     // gerbang MOSFET pompa (peta pin kanonik)
   const int JEDA_PANTUL = 30;   // milidetik
   const int LAMA_POMPA = 3000;  // milidetik: pompa menyala 3 detik

   // Menjawab true SATU kali untuk setiap tekanan sungguhan (sama dengan Praktik 2.2).
   bool tombolDitekan() {
     if (digitalRead(PIN_TOMBOL) == HIGH) {
       return false;
     }
     delay(JEDA_PANTUL);
     if (digitalRead(PIN_TOMBOL) == HIGH) {
       return false;
     }
     while (digitalRead(PIN_TOMBOL) == LOW) {
       delay(1);
     }
     delay(JEDA_PANTUL);
     return true;
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     pinMode(PIN_POMPA, OUTPUT);
     digitalWrite(PIN_POMPA, LOW);  // LOW = MOSFET memutus = pompa diam
     Serial.println("Tekan tombol: pompa menyala 3 detik.");
   }

   void loop() {
     if (tombolDitekan()) {
       Serial.println("Pompa menyala...");
       digitalWrite(PIN_POMPA, HIGH);  // HIGH = MOSFET menyambung = pompa jalan
       delay(LAMA_POMPA);
       digitalWrite(PIN_POMPA, LOW);
       Serial.println("Pompa berhenti.");
     }
   }
   ```

3. Colokkan USB, nyalakan MB102, lalu klik **Upload**. Tekan tombolnya; pompa mulai saat jarimu diangkat.

   **Hasilnya:** pompa berdengung dan mengalirkan air selama 3 detik, lalu berhenti.

   ```text
   Tekan tombol: pompa menyala 3 detik.
   Pompa menyala...
   Pompa berhenti.
   ```

4. Setelah beberapa kali percobaan, sentuh badan MOSFET dengan ujung jari. **Dingin atau hangat sedikit** berarti benar. Panas? Segera matikan MB102, lalu periksa arah dioda dan jenis MOSFET-nya (🚨).

Pompa tidak berputar sama sekali, atau malah langsung menyala begitu MB102 dinyalakan? Lihat 🚨. Kipas dari Praktik 6 tetap bisa dipakai; kodenya saja yang belum digabung — semuanya bersatu di Node 1 (➕).

### Praktik 8 — Eksperimen *brownout*: sengaja salah, lalu diperbaiki (20 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE**, rakitan Praktik 6 (relay + kipas), dan satu kabel jumper jantan–jantan merah tambahan. Konsep yang dipakai: 4. Praktik ini tidak bisa dicoba di Wokwi karena Wokwi tidak menyimulasikan tegangan yang anjlok.
>
> ⭐ **Wajib** — melengkapi syarat lulus kedua: kipas dan pompa bekerja dari MB102 **tanpa ESP32 *restart***.

Kita akan melanggar aturan emas Konsep 4 **dengan sengaja dan terkendali**: kipas diberi makan dari USB laptop lewat pin VIN supaya kamu mengenali gejala *brownout* kalau suatu hari terjadi tanpa sengaja. Setelah itu, kita kembalikan ke cara yang benar dan kita buktikan bahwa ESP32 tidak lagi *restart*.

#### 8.1 Unggah `modul05_detektif_restart` (cara benar dulu)

1. Pastikan rakitan Praktik 6 lengkap, USB laptop tercolok, dan MB102 menyala (aturan emas nomor 5: USB dulu, baru MB102).
2. Di Arduino IDE, buat sketsa baru **`modul05_detektif_restart`** (file: [`modul05_detektif_restart.ino`](kode/modul05_detektif_restart/modul05_detektif_restart.ino)):

   ```cpp
   // Modul 5 - Praktik 8: "detektif restart" untuk uji catu daya
   // Saat menyala, sketsa ini mencetak ALASAN restart terakhir, dengan kata yang sama
   // seperti kolom reset_reason di Lampiran A Silabus: POWERON, BROWNOUT, SW, PANIC,
   // WDT, DEEPSLEEP, atau UNKNOWN.
   // Setelah itu relay kipas (D33) menyala dan mati bergantian tiap 3 detik.

   #include <esp_system.h>  // untuk esp_reset_reason()

   const int PIN_LED = 4;           // LED status
   const int PIN_RELAY_KIPAS = 33;  // relay kipas, aktif LOW
   const int JEDA = 3000;           // milidetik

   int putaran = 0;  // dihitung ulang dari 0 setiap kali ESP32 restart

   // Menerjemahkan kode alasan restart menjadi kata yang mudah dibaca.
   String alasanReset() {
     esp_reset_reason_t alasan = esp_reset_reason();
     if (alasan == ESP_RST_POWERON) {
       return "POWERON";  // baru dinyalakan, tombol EN ditekan, atau program selesai diunggah
     }
     if (alasan == ESP_RST_BROWNOUT) {
       return "BROWNOUT";  // tegangan sempat anjlok terlalu rendah
     }
     if (alasan == ESP_RST_SW) {
       return "SW";  // program sendiri yang meminta restart
     }
     if (alasan == ESP_RST_PANIC) {
       return "PANIC";  // program mogok (crash)
     }
     if (alasan == ESP_RST_INT_WDT || alasan == ESP_RST_TASK_WDT || alasan == ESP_RST_WDT) {
       return "WDT";  // "penjaga" me-restart program yang macet (Modul 8)
     }
     if (alasan == ESP_RST_DEEPSLEEP) {
       return "DEEPSLEEP";  // bangun dari tidur dalam (deep sleep, Modul 9)
     }
     return "UNKNOWN";  // alasan lain yang jarang terjadi
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED, OUTPUT);
     pinMode(PIN_RELAY_KIPAS, OUTPUT);
     digitalWrite(PIN_RELAY_KIPAS, HIGH);  // relay melepas: kipas mati dulu

     String alasan = alasanReset();
     Serial.println();
     Serial.println("Alasan restart terakhir: " + alasan);
     if (alasan == "BROWNOUT") {
       Serial.println(">> Tegangan sempat anjlok! Pindahkan beban (kipas, pompa, servo) ke MB102.");
     }
   }

   void loop() {
     putaran++;
     if (putaran % 2 == 1) {
       digitalWrite(PIN_RELAY_KIPAS, LOW);  // kipas jalan
       digitalWrite(PIN_LED, HIGH);
       Serial.print("Putaran ");
       Serial.print(putaran);
       Serial.println(": kipas NYALA");
     } else {
       digitalWrite(PIN_RELAY_KIPAS, HIGH);  // kipas berhenti
       digitalWrite(PIN_LED, LOW);
       Serial.print("Putaran ");
       Serial.print(putaran);
       Serial.println(": kipas MATI");
     }
     delay(JEDA);
   }
   ```

3. Klik **Upload** dan buka Serial Monitor. Kipas menyala dan mati bergantian setiap 3 detik.

   **Hasilnya** — angka putaran terus naik:

   ```text
   Alasan restart terakhir: POWERON
   Putaran 1: kipas NYALA
   Putaran 2: kipas MATI
   Putaran 3: kipas NYALA
   ```

Yang baru di sini: **`esp_reset_reason()`** dari `esp_system.h` menanyakan kepada chip **mengapa** ia terakhir menyala ulang. Fungsi `alasanReset()` menerjemahkan jawabannya menjadi kata yang sama dengan kolom `reset_reason` di Lampiran A Silabus; alasan yang jarang terjadi dijawab `UNKNOWN` (tidak diketahui). Tanda `+` di baris `Serial.println("Alasan restart terakhir: " + alasan);` menyambung dua teks menjadi satu, sama seperti di sketsa Morse Modul 3. Operator `%` (sisa bagi, Modul 3) membuat putaran ganjil menyalakan kipas dan putaran genap mematikannya.

#### 8.2 Sengaja salah: kipas dari USB laptop

1. **Matikan MB102 dulu, baru cabut USB laptop** (aturan emas nomor 5). Cabut kabel adaptor dari MB102, lalu **cabut MB102 dari breadboard**. Dengan begitu, rel atas tidak lagi mendapat listrik dari MB102.
2. Untuk sementara, cabut juga **kapasitor 100 µF** ("tandon kecil" itu bisa menutupi gejalanya), **kabel merah servo** dari rel atas (+), dan **kabel merah 48a** (jalur 5 V pompa; pemakai modul D4184: kabel DC+/VIN+ modulnya). Percobaan ini cukup memakai relay dan kipas. **Jangan menambah pompa atau servo** ke port USB laptop.
3. Pasang **kabel merah** dari **4f** (breadboard **atas**, tepat di atas kaki **VIN**) ke **rel atas (+)**. Periksa sekali lagi sebelum menyalakan:
   - Ujung pertama di **4f**, bukan 5f (GND) dan bukan 4e di breadboard bawah (3V3).
   - Ujung kedua di jalur berlabel **5V**, bukan di jalur (−) tepat di sebelahnya.

   Begitu USB tercolok, relay dan kipas mendapat listrik dari USB laptop lewat pin VIN — persis kesalahan yang dilarang aturan emas nomor 1.
4. Colokkan lagi USB laptop dan buka Serial Monitor. Sketsa detektif langsung berjalan; perhatikan selama satu menit. Baris pembukanya terlewat? Tekan tombol **EN** di papan.

   **Yang mungkin terjadi** (bergantung pada kekuatan port USB laptopmu): setiap kali kipas mulai berputar, ESP32 *restart*. Di Serial Monitor muncul baris yang memuat `Brownout detector was triggered` (biasanya diawali label `E BOD:`), disusul beberapa baris pesan *boot* (`ets …`, `rst:…`, dan seterusnya), lalu sketsamu mulai dari awal. Kira-kira seperti ini; baris dalam kurung hanya ringkasan, bukan tulisan persisnya:

   ```text
   Putaran 1: kipas NYALA
   E BOD: Brownout detector was triggered
   (beberapa baris pesan boot)
   Alasan restart terakhir: BROWNOUT
   >> Tegangan sempat anjlok! Pindahkan beban (kipas, pompa, servo) ke MB102.
   Putaran 1: kipas NYALA
   ```

   Hitungan putaran kembali ke **1** terus-menerus: ESP32 tidak pernah sampai ke putaran 2.

   **Tidak *restart*?** Port USB laptopmu cukup kuat untuk kipas kecil ini — beruntung, tetapi jangan diandalkan. Buktikan bahwa tegangannya tetap turun dengan multimeter di **V⎓ 20**: tancapkan kabel cadangan di **rel atas (+)**, yang sekarang tersambung ke VIN, dan di rel atas (−), lalu tempelkan *probe* merah dan hitam. Bandingkan angkanya saat kipas diam dan saat kipas berputar: biasanya turun beberapa persepuluh volt, dan sudah lebih rendah daripada ±5 V yang kamu catat di Praktik 1.6. Kalau VIN turun cukup jauh, pengatur tegangan di papan tidak sanggup lagi menahan 3,3 V, dan detektor *brownout* pun terpicu.

   Windows memunculkan pemberitahuan `Power surge on the USB port` (lonjakan daya di port USB)? Cabut USB dan langsung lanjut ke 8.3; laptopmu sedang melindungi port-nya.

#### 8.3 Perbaiki, lalu buktikan

1. Cabut USB laptop. **Lepaskan kabel merah di 4f** — kabel itu tidak boleh ada lagi.
2. Pasang kembali MB102 di ujung kanan breadboard atas dengan jumper yang sama (sisi rel atas **5V**, sisi rel tengah **OFF**). Kembalikan juga kapasitor 100 µF, kabel merah servo, dan kabel merah 48a (atau kabel DC+/VIN+ modul D4184) ke tempatnya semula. Pastikan adaptor tercolok di stopkontak dan sambungkan lagi kabel A–A ke port USB MB102, tetapi **jangan nyalakan MB102 dulu**. Kalau tombol MB102-mu tidak memutus jalur USB, kabel A–A itu baru dicolokkan ke MB102 di langkah 3.
3. Colokkan USB laptop dulu, **baru** nyalakan MB102 atau colokkan kabel A–A-nya (aturan emas nomor 5), lalu tekan **EN**. Serial Monitor kembali menulis `Alasan restart terakhir: POWERON`, dan hitungan putaran naik terus.
4. **Uji kelulusan, bagian kipas:** biarkan berjalan **2 menit**. Kalau angka putaran mencapai 40 tanpa pernah kembali ke 1, berarti kipas bekerja dari MB102 tanpa membuat ESP32 *restart*.
5. **Uji kelulusan, bagian pompa:** pastikan pompa terendam air. Buka lagi sketsa `modul05_pompa_mosfet`, klik **Upload**, lalu buka Serial Monitor. Tekan tombol **5 kali**, satu per satu. Setiap tekanan harus menghasilkan pasangan `Pompa menyala...` lalu `Pompa berhenti.`. Kalau di tengahnya muncul pesan *boot* atau baris pembuka `Tekan tombol: pompa menyala 3 detik.`, berarti ESP32 *restart*; lihat 🚨. ✅ Kalau kelima tekanan lolos, syarat lulus kedua tercapai.

> [!CAUTION]
> **Jangan "menyembuhkan" *brownout* dengan mematikan detektornya.** Di internet banyak saran untuk mematikan detektor *brownout* lewat kode. Itu seperti mencabut alarm asap karena berisik: masalahnya tidak hilang, ESP32 justru bisa berjalan ngawur atau merusak isi memorinya. Obat yang benar selalu sama: **pisahkan jalur daya beban** dan **satukan GND**.

### Praktik 9 — Simpan ke GitHub (15 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE**, kamera HP, dan **GitHub Desktop** (dari Modul 3). Konsep yang dipakai: tidak ada konsep baru.

1. **Simpan sketsa ke repositori.** Sudah menyimpan langsung ke folder `modul-05` sejak awal (kotak **Tip** di awal bagian Praktik)? Lewati langkah ini. Kalau belum, buka sketsanya satu per satu di Arduino IDE (**File → Sketchbook**). Untuk setiap sketsa, pilih **File → Save As…** dan simpan ke folder **Documents → GitHub → belajar-iot → modul-05**. Saat menyimpan sketsa pertama, buat dulu folder `modul-05` dengan **New folder**, persis seperti Modul 3 Praktik 9.4. Daftar lengkapnya ada di awal bagian Praktik. Yang wajib ada: `modul05_tombol_toggle`, `modul05_relay_kipas`, `modul05_pompa_mosfet`, dan `modul05_detektif_restart`.
2. **Foto rakitanmu.**
   1. Ambil satu foto meja kerja dari atas dengan HP: kedua breadboard, papan ESP32, MB102, relay, kipas, dan pompa harus terlihat. Pastikan tidak ada barang pribadi yang ikut terfoto.
   2. Pindahkan foto ke laptop (lewat kabel data, aplikasi berbagi, atau surel ke dirimu sendiri), lalu ubah namanya menjadi **`meja-kerja.jpg`**.
   3. Salin foto itu ke folder `modul-05`. Di GitHub Desktop, **Repository → Show in Explorer** (macOS: **Show in Finder**) membuka folder repositori yang benar.
   4. Bandingkan fotomu dengan gambar meja kerja lengkap di bawah ini (klik gambarnya untuk memperbesar). Kabelmu boleh berbeda warna asalkan lubangnya sama.

   ![Ilustrasi meja kerja Node 1 lengkap setelah Praktik 1 sampai 7, dilihat dari atas, semua komponen berwarna penuh: dua breadboard dengan papan ESP32 menunggangi keduanya, MB102 di ujung kanan breadboard atas dengan adaptor, LED status dan potensiometer di breadboard bawah, tombol, buzzer, dan rangkaian MOSFET di breadboard atas, serta servo, modul relay dengan kipas, dan pompa di gelas air di luar breadboard, masing-masing dengan kabelnya ke lubang yang disebut di praktik](aset/meja-kerja-node-1.png)
3. Di GitHub Desktop, pastikan kotak **Current repository** bertuliskan **belajar-iot**. Tab **Changes** berisi file-file baru di `modul-05`: satu file `.ino` untuk setiap sketsa, ditambah `meja-kerja.jpg`. Pengguna macOS: hilangkan centang `.DS_Store` kalau muncul.
4. Isi **Summary** dengan `Modul 5: tombol, PWM, relay, pompa, dan uji brownout`, klik **Commit … to main**, lalu **Push origin**.
5. Klik **Repository → View on GitHub** dan buka folder `modul-05`: sketsa dan fotomu sudah ada di sana.

Tanpa GitHub Desktop? Pakai jalur pengganti di catatan akhir [Modul 4 Praktik 10](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#praktik-10--simpan-ke-github-checkpoint-fase-0-15-menit): unggah folder `modul-05` utuh lewat **Add file → Upload files** di halaman repositori, atau pakai `git add`, `git commit`, dan `git push` di Terminal.

> ➡️ **Sesudah Praktik 9:** kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini) — di sana semua aktuator bersatu di Node 1 dan `PETA-PIN.md` dibuat — lalu tutup dengan [📝 Kuis](#-kuis-5-soal) dan [✅ Checklist kelulusan](#-checklist-kelulusan-modul-5). Bagian 🚨 dan 🔬 di antaranya cukup dibuka saat perlu.

---

## 🚨 Kalau Tidak Jalan?

Minggu ini masalahnya lebih sering di **kabel dan listrik** daripada di kode. Sebelum membongkar apa pun, ingat dua kebiasaan: **matikan MB102 dan cabut USB sebelum mengubah kabel**, dan **ubah satu hal saja, lalu uji lagi**. **Sedang macet? Lewati tabel di bawah** — daftar gejala (judul-judul lipat yang bisa diklik) ada tepat setelahnya. Tabel ini merangkum hal yang sering ditemui di tutorial lain, tetapi berbeda di kurikulum ini.

| Yang sering ditemui di tutorial lain | Yang benar untuk kurikulum ini | Kenapa |
| :--- | :--- | :--- |
| `ledcSetup(0, 5000, 8);` + `ledcAttachPin(4, 0);` + `ledcWrite(0, 128);` | `ledcAttach(4, 5000, 8);` + `ledcWrite(4, 128);` | Cara paket esp32 versi 2. Di versi 3, PWM diatur **per pin**, bukan per saluran; dua fungsi lama itu sudah dihapus. |
| `ledcWriteTone(0, 440);` (angka saluran) | `ledcWriteTone(PIN_BUZZER, 440);` (nomor pin) | Sama: versi 3 memakai nomor pin. |
| `#include <Servo.h>` | `#include <ESP32Servo.h>` | Library Servo milik Arduino tidak berjalan di ESP32 dengan paket esp32 kita. |
| Memasang resistor 10 kΩ untuk setiap tombol | `INPUT_PULLUP` | ESP32 sudah punya resistor *pull-up* internal — kecuali di pin 34–39. |
| `analogWrite(pin, nilai);` | `ledcAttach` + `ledcWrite` | `analogWrite` memang ada di versi 3, tetapi diam-diam memilih frekuensi 1.000 Hz dan mengambil saluran PWM sendiri. Dengan `ledcAttach`, semuanya terlihat jelas. |
| Modul MOSFET **IRF520** "untuk Arduino" | **IRLZ44N** atau modul **D4184** | IRF520 baru terbuka penuh di sekitar 10 V; dengan 3,3 V, pompa lemah atau diam. |
| "Matikan detektor *brownout* supaya ESP32 tidak *restart*" | Pisahkan catu daya beban, satukan GND | Mematikan detektor hanya menyembunyikan masalah (Praktik 8). |
| Servo, relay, atau motor diberi daya dari pin 5V/VIN papan | Selalu dari MB102 | Port USB laptop hanya ±500 mA; lonjakan arus motor membuat ESP32 *restart*. |

<details>
<summary><b><code>Build failed!</code> / <code>Compilation error</code> — pesan error minggu ini</b></summary>

Aturannya tetap sama dengan Modul 3: **lihat nomor baris**, betulkan **error pertama** saja, lalu kompilasi ulang.

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `'ledcSetup' was not declared in this scope` | Kode memakai cara PWM paket esp32 versi 2. | Ganti dengan `ledcAttach(pin, frekuensi, resolusi)`; lihat tabel di atas. |
| `'ledcAttachPin' was not declared in this scope; did you mean 'ledcAttach'?` | Sama. | Hapus `ledcAttachPin`; cukup `ledcAttach`, dan ganti angka saluran di `ledcWrite` dengan nomor pin. |
| `fatal error: ESP32Servo.h: No such file or directory` | Library ESP32Servo belum terpasang. | Ikuti Praktik 5.1. Di Wokwi: periksa tab **`libraries.txt`**. |
| `fatal error: Servo.h: No such file or directory`, atau error panjang dari dalam folder `Servo` | Kode memakai library Servo milik Arduino. | Ganti `#include <Servo.h>` dengan `#include <ESP32Servo.h>`. Di Wokwi, **jangan** klik tombol **INSTALL "SERVO" LIBRARY** yang ditawarkan. |
| `'Servo' does not name a type` | Baris `#include <ESP32Servo.h>` hilang atau salah ketik. | Tambahkan di baris paling atas. |

</details>

<details>
<summary><b>Strip rel breadboard tidak bisa dilepas, atau ESP32 tidak pas di dua breadboard</b></summary>

- **Stripnya menyatu dengan badan breadboard** (tidak ada sambungan sama sekali)? Beberapa breadboard memang dicetak utuh. Pilihan termudah: beli satu breadboard 830 titik lain yang stripnya bisa dilepas (ciri-cirinya: ada garis sambungan di antara strip rel dan badan breadboard), harganya Rp15–30 ribu. Pilihan lain: **papan ekspansi ESP32 30 pin** (*ESP32 expansion board*), yang memang ada di daftar kit Modul 28; papan ESP32 ditancapkan ke papan itu, lalu setiap pin disambung dengan kabel jantan–betina ke breadboard.
- **Strip sudah lepas, tetapi kaki tidak pernah pas di baris mana pun?** Geser breadboard bawah menjauh **sedikit demi sedikit** (lebih dari 1 mm per langkah terlalu banyak), sambil mencoba lagi. Pastikan juga kedua ujung kiri rata: kolom 4 atas harus tepat segaris dengan kolom 4 bawah.
- **Hanya tersisa satu lubang bebas di satu sisi?** Masih bisa dipakai asalkan baris f (atas) dan baris e (bawah) bebas.
- **Kaki ESP32-mu berjarak 0,9 inci** (papan versi sempit, lihat Modul 2)? Biasanya pas di baris i atas dan baris a bawah, atau baris j atas dan baris b bawah. Prinsip pencocokannya sama.

</details>

<details>
<summary><b>Rel atas: multimeter menunjukkan minus, nol, atau bukan 5 V</b></summary>

- **Minus** (misalnya `-5.02`) padahal *probe* merah di jalur bergaris merah: MB102 menaruh (+)-nya di jalur bergaris **biru** breadboard-mu. Ini terjadi karena urutan garis merah-biru tidak seragam antarpabrik breadboard. MB102-nya tidak perlu dipindahkan:
  1. Matikan MB102. Tempel label baru dengan selotip: tulis **5V** di jalur yang terbukti (+) dan **GND** di jalur satunya. Mulai sekarang, ikuti label itu, bukan warna garisnya, setiap kali modul ini menyebut "rel atas (+)" atau "(−)".
  2. **Pindahkan ujung kabel hitam 5f** ke jalur yang baru kamu beri label **GND**. Kabel itu tadinya masuk jalur bergaris biru, yang ternyata 5 V.
  3. Ulangi Praktik 1.6 mulai langkah 2. Langkah 5 (uji GND bersama) harus menunjukkan ±5 V.
- **Nol**, LED MB102 padam: adaptor belum tercolok ke stopkontak, salah satu ujung kabel USB A–A belum masuk penuh (satu ke adaptor, satu ke port USB MB102), atau tombol daya MB102 belum ditekan. Kabel A–A bisa juga hanya kabel data tanpa jalur daya yang layak; coba kabel lain.
- **Nol**, LED MB102 menyala: rel terputus di tengah (pasang kabel penyambung, Praktik 1.6), atau kaki MB102 belum masuk penuh ke rel.
- **Sekitar 3,3 V**: jumper sisi rel atas tertancap di posisi **3.3V**. Pindahkan ke **5V**.
- **Sekitar 3,5 V atau kurang**: adaptor masuk lewat **colokan bulat** (butuh 6,5–12 V), bukan lewat port USB. Pakai kabel USB A–A ke port USB MB102.
- **Di bawah 4,7 V saat beban menyala**: adaptor terlalu lemah (kurang dari 2 A) atau kabel A–A terlalu panjang/tipis. Coba kepala cas lain yang bertuliskan "5V 2A".

</details>

<details>
<summary><b>ESP32 menyala sendiri padahal USB-nya dicabut</b> (berbahaya — baca segera)</summary>

Kalau LED merah papan ESP32 menyala hanya karena MB102 dinyalakan, **ada listrik dari rel atas yang merembes ke ESP32**. Matikan MB102 sekarang juga, lalu periksa:

- **Urutan nyala-mati.** Kalau MB102 menyala sementara USB laptop tercabut, listrik 5 V dari pin VCC modul relay bisa merembes lewat lampu *optocoupler*, kabel IN1/IN2, dan pin D32/D33 ke dalam ESP32. LED papan menyala redup, dan relay bisa menarik sendiri. Kabelmu tidak salah; ikuti saja aturan emas nomor 5: USB dulu, baru MB102 — dan matikan MB102 dulu, baru cabut USB.
- Kabel yang menyambung rel atas (+) ke kolom **4** atas (VIN) atau kolom **4** bawah (3V3) — misalnya kabel merah dari Praktik 8 yang lupa dilepas.
- Kabel bertegangan 5 V yang masuk ke kolom pin GPIO mana pun. Pin GPIO punya pelindung kecil di dalamnya yang ikut "menghidupkan" chip dari arah yang salah — dan itu bisa merusaknya.
- Jumper sisi rel tengah MB102 yang ternyata di posisi **5V**, padahal ada kabel di rel tengah.

Aturan emas nomor 4 dan 5 di Konsep 4 ada untuk mencegah hal ini.

</details>

<details>
<summary><b>Unggahan gagal atau papan <i>restart</i> terus setelah rakitan baru</b></summary>

- **Ada sesuatu di D12** (kolom 7 atas)? Cabut. GPIO 12 yang tertarik HIGH saat menyala membuat papan gagal *boot* (Konsep 2).
- **Unggahan macet di `Connecting…`** padahal sebelumnya lancar? Tahan **BOOT** begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan. Kalau tetap gagal, cabut sementara kabel di D2 (kolom 7 bawah) — minggu ini seharusnya memang kosong.
- **Papan *restart* setiap kali kipas, pompa, atau servo mulai bergerak** — `Brownout detector was triggered`: ada beban yang masih mengambil listrik dari papan. Periksa kabel di kolom 4 atas (VIN), lalu kerjakan ulang Praktik 8.3. Pastikan juga adaptor MB102 benar-benar 2 A dan kapasitor 100 µF terpasang.
- **Papan *restart* sesaat setelah pompa berhenti**: dioda *flyback* belum terpasang (Praktik 7.2) sehingga lonjakan tegangan dari pompa mengganggu.

</details>

<details>
<summary><b>Tombol tidak bereaksi, program membeku, atau hitungan berjalan sendiri</b></summary>

- **Tidak bereaksi sama sekali** (baris pembuka muncul, tetapi menekan tombol tidak menghasilkan apa-apa): kabel kuning harus di **6f** (atas), tepat di atas D13 — bukan 7f (D12). Pastikan tombol benar-benar melintangi parit tengah, keempat kakinya masuk, dan kabel hitam 24a masuk rel atas (−).
- **Program seperti membeku** (setelah baris pembuka tidak terjadi apa-apa lagi; di Node 1, perintah Serial pun tidak dijawab): pin D13 terbaca **ditekan terus** sehingga `tombolDitekan()` menunggu jari "diangkat" selamanya. Penyebabnya, kedua kabel tersambung ke **sepasang kaki yang tersambung permanen** di dalam tombol. Pakai kaki yang **bersilangan** (22f dan 24e), atau putar tombolnya 90°. Cara memastikan: unggah sketsa Praktik 2.1. Kalau `Tekanan ke-1` langsung muncul tanpa tombol disentuh, pin D13 memang terbaca ditekan terus.
- **Hitungan berjalan sendiri tanpa disentuh:** pin D13 mengambang. Pastikan kode memakai `INPUT_PULLUP`, bukan `INPUT` (Konsep 5).
- **Tombol ada di pin 34–39?** Pin itu tidak punya *pull-up* internal; pindahkan ke D13 seperti peta pin kanonik.
- **Kadang masih terhitung dua kali:** naikkan `JEDA_PANTUL` menjadi `50`.

</details>

<details>
<summary><b>Potensiometer: angkanya macet, melompat, atau terbalik</b></summary>

- **Selalu `0` atau selalu `4095`:** kabel hijau tertancap di kolom kaki **luar** (24 atau 28), bukan di kolom kaki tengah (26).
- **Angkanya acak walau tidak disentuh:** ujung kabel hijau tidak di VN, atau kaki luar belum tersambung ke rel bawah (+) dan (−). Ingat, VN adalah GPIO **39**, di kolom **16** atas (urutan pin deretan atas: VIN, GND, D13, D12, D14, D27, D26, D25, D33, D32, D35, D34, VN, VP, EN).
- **Mentok di sekitar `4095` sebelum diputar habis:** wajar di ESP32 karena ADC-nya tidak lurus di ujung-ujungnya (Modul 6).
- **Terbalik** (diputar ke kanan malah meredup): tukar kabel kaki kiri dan kanan.

</details>

<details>
<summary><b>Buzzer diam, bunyinya pelan, atau hanya "tiiit" datar</b></summary>

- **Diam:** periksa kabel biru **9f** (di atas D27) → **27e**, resistor **30e → 34e**, dan kabel hitam **34a** ke rel atas (−). Di Wokwi, pastikan suara browser tidak dibisukan.
- **Hanya "tiiit" panjang dengan nada yang sama**, lagu tidak terdengar: itu **buzzer aktif**. Buzzer aktif punya pembangkit nada sendiri sehingga tidak bisa memainkan lagu. Ganti dengan buzzer pasif (bagian bawahnya biasanya terbuka dan memperlihatkan papan hijau).
- **Bunyinya pelan sekali:** resistornya mungkin 10 kΩ (cokelat-hitam-oranye), bukan 220 Ω (merah-merah-cokelat). Periksa dengan multimeter (Modul 2).
- **Servo jadi diam setelah buzzer ditambahkan** ke sketsa yang sama: urutan pemasangannya terbalik. Pasang servo dulu (`attach`), baru `ledcAttach` buzzer (🔬).

</details>

<details>
<summary><b>Servo diam, bergetar, atau berdengung</b></summary>

- **Diam sama sekali:** MB102 sudah menyala? Kabel merah servo di rel atas (+), cokelat (atau hitam) di rel atas (−), dan oranye di **10f** (atas, di atas D26)? Library ESP32Servo terpasang dan Serial Monitor menulis `Servo ke …`?
- **Berdengung atau bergetar di 0° atau 180°:** banyak SG90 tidak sanggup tepat 0–180° sehingga porosnya menekan batas mekanis. Batasi sudutnya, misalnya `constrain(sudut, 10, 170)`, atau sesuaikan angka pulsa di `attach`, misalnya `attach(PIN_SERVO, 600, 2300)`. Jangan biarkan servo berdengung lama; motornya bisa panas.
- **Bergerak liar sesaat ketika ESP32 menyala ulang:** wajar — selama ESP32 baru menyala (proses *boot*), pin sinyalnya belum mengirim pulsa.
- **Bergetar terus dan ESP32 kadang *restart*:** kapasitor 100 µF belum terpasang, atau servo masih diberi daya dari papan.

</details>

<details>
<summary><b>Relay tidak berbunyi, tidak mau melepas, atau kipas tidak berputar</b></summary>

- **Relay tidak berbunyi sama sekali:** MB102 menyala? VCC dan GND modul relay di rel atas? Kabel IN2 di **12f** (D33) dan IN1 di **13f** (D32)? Ingat, urutan pin modul berbeda antarpabrik — baca tulisannya.
- **LED indikator relay menyala, tetapi tidak ada bunyi "klik":** jumper **JD-VCC** terlepas sehingga kumparan relay tidak mendapat listrik.
- **Relay tidak mau melepas pada 3,3 V** (uji 6.3 gagal): modulmu butuh sedikit perubahan. Matikan MB102 dan cabut USB dulu, lalu:
  1. Cabut jumper **JD-VCC** dan simpan. Pastikan benar-benar tercabut: kalau jumper masih terpasang, langkah 2 dan 3 akan menyambung 5 V MB102 ke pin 3V3 ESP32 dan bisa merusaknya. Cek dengan mode bip multimeter: pin VCC dan JD-VCC tidak boleh tersambung.
  2. Pindahkan kabel dari pin **VCC** di deretan IN ke **rel bawah (+)** (3,3 V dari ESP32). Kabelnya terlalu pendek? Tancapkan ujungnya di lubang bebas kolom 40 breadboard bawah (misalnya 40b) yang tersambung ke rel bawah (+) lewat kabel perpanjangan dari 6.3 langkah 1.
  3. Dengan dua kabel jantan–betina cadangan, sambungkan pin **JD-VCC** ke **rel atas (+)** (5 V dari MB102) dan pin **GND** di sebelah JD-VCC ke **rel atas (−)**. Pin GND di deretan IN tetap di rel atas (−).

  Sekarang lampu kecil di *optocoupler* bekerja dengan 3,3 V, sedangkan kumparan relay tetap mendapat 5 V. Ulangi uji 6.3. Masih gagal? Ganti dengan modul relay yang memang bisa dipicu 3,3 V, misalnya modul yang punya jumper pemilih **H/L** (*high/low level trigger*) atau bertuliskan "3.3V".
- **Relay berbunyi, tetapi kipas diam:** kabel 5 V harus di **COM** dan kabel merah kipas di **NO** — bukan NC. Periksa juga apakah sekrup terminalnya sudah dikencangkan pada bagian logam kabel, bukan pada pembungkusnya. Kipas DC punya arah: merah (+), hitam (−).
- **Kipas langsung menyala begitu MB102 dinyalakan, dan mati saat relay aktif:** kabel kipas ada di **NC**. Pindahkan ke **NO**.

</details>

<details>
<summary><b>Pompa tidak berputar, menyala terus, atau MOSFET panas</b></summary>

Selalu **matikan MB102 dulu**, lalu periksa satu per satu:

- **Pompa tidak berputar:** urutan kaki MOSFET — dengan tulisan menghadapmu, kiri G (42b), tengah D (43b), kanan S (44b). Kabel putih dari **11f** (D25), bukan 10f (D26) atau 12f (D33). Pastikan MOSFET-mu bertuliskan **IRLZ44N**, bukan IRF520 atau IRFZ44N tanpa huruf L. MOSFET yang terpasang terbalik (tulisan menghadap ke belakang) juga membuat pompa diam: kaki G-nya jatuh di kolom 44 yang tersambung ke GND. Pompa yang lama tidak dipakai kadang macet; celupkan ke air, lalu coba lagi.
- **Pompa menyala terus begitu MB102 dinyalakan:** kabel hitam pompa tidak di 43d (misalnya di kolom 44 atau langsung di GND), lempeng logam MOSFET (= D) menyentuh kabel GND, atau MOSFET-nya sudah rusak tembus antara D dan S. Kerusakan itu sering terjadi kalau pompa pernah dinyalakan tanpa dioda atau dengan dioda terbalik; MOSFET yang rusak harus diganti.
- **MOSFET atau dioda panas:** hampir pasti **dioda terbalik** — cincin peraknya harus di **48e** (sisi 5 V). Dioda terbalik menyambung 5 V ke GND lewat MOSFET setiap kali pompa diperintah menyala. Dioda sudah benar, tetapi MOSFET tetap panas? Periksa tulisannya: IRF520 atau IRFZ44N (tanpa huruf L) hanya setengah terbuka pada 3,3 V sehingga panas.
- **Pompa menyala sebentar saat ESP32 *restart*:** resistor 10 kΩ (34c–38c) belum terpasang, atau kolom 34 belum tersambung ke GND (kabel hitam 34a).
- **Lempeng logam MOSFET menyentuh kabel lain:** lempeng di punggung IRLZ44N tersambung ke kaki D. Jauhkan dari kabel dan kaki komponen lain; karena itu kabel GND-nya dipasang di 44d, di depan MOSFET.

</details>

<details>
<summary><b>Wokwi: relay bekerja terbalik, atau komponennya tidak sama dengan kitmu</b></summary>

- **Relay terbalik** (menarik saat pin HIGH): pada `diagram.json` buatan sendiri, modul relay Wokwi bawaannya aktif HIGH. File `diagram.json` dari folder [`kode/`](kode/) sudah memakai `"transistor": "pnp"` supaya aktif LOW seperti modul aslimu.
- **LED kecil berlabel LED1 di modul relay Wokwi menyala terbalik:** di modul Wokwi yang diatur aktif LOW, LED itu justru menyala saat relay melepas. Abaikan saja; patokannya LED berlabel **lampu** dan **kipas** di diagram. Di modul relay aslimu, LED indikator menyala saat relay menarik.
- **Tidak ada kipas, pompa, atau MOSFET di Wokwi:** memang tidak tersedia. Di semua `diagram.json` modul ini, kipas dan pompa diwakili **LED berlabel**. Wokwi juga tidak menyimulasikan arus beban dan *brownout* sehingga Praktik 1 dan 8 hanya bisa di papan asli.
- **Di diagram Wokwi, servo dan modul relay mengambil daya dari pin VIN**, dan LED "lampu"/"kipas" dari 3V3 tanpa resistor: itu hanya jalan pintas simulator karena Wokwi tidak punya MB102, tidak menghitung arus, dan LED-nya tidak bisa rusak. **Jangan tiru di papan asli** — di mejamu, semua beban tetap dari rel atas MB102 (aturan emas nomor 1), dan LED selalu memakai resistor.
- **Tombol Wokwi memantul**, bahkan dengan klik mouse yang rapi: itu disengaja (atribut `bounce`) supaya Praktik 2.1 terasa nyata.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran "di balik layar". Boleh dilewati tanpa mengganggu modul berikutnya. Klik judulnya untuk membuka.

<details>
<summary><b>Sensor sentuh bawaan: ESP32 bisa merasakan jarimu tanpa tombol</b></summary>

Sepuluh GPIO ESP32 bisa menjadi **sensor sentuh kapasitif**: chip mengukur seberapa banyak muatan listrik yang "tersangkut" di pin itu, dan tubuhmu ikut menambah muatannya saat menyentuh. Pin sentuhnya adalah GPIO 4, 0, 2, 15, 13, 12, 14, 27, 33, dan 32 (bernama T0–T9).

**Coba (hanya di papan asli; Wokwi tidak menyimulasikan sentuhan):** GPIO 14 (D14) baru dipakai DHT22 di Modul 6, jadi minggu ini masih kosong. Tancapkan satu kabel jumper jantan–jantan di **8f** (atas, di atas D14), biarkan ujung lainnya bebas, lalu unggah:

```cpp
// Bonus Modul 5: sensor sentuh di GPIO 14 (T6)
void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println(touchRead(14));  // angkanya TURUN saat ujung kabel disentuh
  delay(200);
}
```

Buka Serial Monitor (atau pilih **Tools → Serial Plotter** untuk melihat grafiknya), lalu pegang ujung logam kabel itu. Angkanya turun jauh, misalnya dari puluhan menjadi belasan; angka persisnya berbeda di setiap papan dan kabel. Dengan `if (touchRead(14) < ambang)`, kabel itu menjadi tombol tanpa bagian bergerak. Cabut kabelnya lagi sebelum Modul 6.
</details>

<details>
<summary><b>DAC: tegangan analog sungguhan, bukan kedipan PWM</b></summary>

PWM hanya **pura-pura** analog: pinnya tetap berkedip antara 0 dan 3,3 V, dan mata (atau multimeter) yang merata-ratakannya. ESP32 klasik punya dua **DAC** (*Digital-to-Analog Converter*, pengubah digital ke analog) di **GPIO 25** dan **GPIO 26** yang mengeluarkan tegangan **tetap** di antara 0 dan ±3,3 V, dengan 256 tingkat (8 bit).

Kedua pin itu kebetulan dipakai pompa dan servo kita. Untuk mencoba, **cabut dulu kabel putih di 11f** (D25 ke MOSFET), tancapkan kabel cadangan di 11f sebagai tempat *probe*, lalu unggah:

```cpp
// Bonus Modul 5: DAC di GPIO 25 - ukur dengan multimeter (V⎓ 20)
void setup() {
  Serial.begin(115200);
}

void loop() {
  for (int nilai = 0; nilai <= 255; nilai += 85) {  // 0, 85, 170, 255
    dacWrite(25, nilai);
    Serial.print("dacWrite 25 = ");
    Serial.println(nilai);
    delay(3000);
  }
}
```

Multimeter (*probe* hitam ke rel bawah (−)) menunjukkan kira-kira 0 V, 1,1 V, 2,2 V, dan 3,2 V bergantian. Pasang kembali kabel putih setelah selesai.

Percobaan pembanding yang menarik: ukur D4 saat sketsa peredup (*dimmer*) Praktik 3 berjalan. Multimeter juga menunjukkan angka "di tengah" (misalnya ±1,6 V saat kecerahan 127) karena multimeter ikut merata-ratakan kedipan PWM. Bedanya, pin DAC benar-benar diam di tegangan itu.

Saudara ESP32 yang lebih baru (S3, C3, C6) **tidak punya DAC** — salah satu alasan kurikulum ini tetap memakai ESP32 klasik.
</details>

<details>
<summary><b>Transistor NPN: penggerak murah untuk beban kecil</b></summary>

Sebelum MOSFET populer, beban kecil biasanya digerakkan **transistor bipolar NPN** seperti BC547, 2N2222, atau S8050. Cara pasangnya mirip MOSFET *low-side*: beban dari 5 V ke kaki kolektor (*collector*), kaki emitor (*emitter*) ke GND, dan pin ESP32 ke kaki basis (*base*) lewat resistor ±1 kΩ.

Bedanya dengan MOSFET:

- Transistor NPN digerakkan **arus** (pin ESP32 harus terus memberi ±2–3 mA ke basis), sedangkan MOSFET digerakkan **tegangan** (hampir tanpa arus).
- Saat menyala, transistor NPN masih "memakan" tegangan ±0,2–0,7 V dan menjadi hangat. MOSFET *logic-level* jauh lebih efisien untuk arus ratusan mA.
- BC547 hanya sanggup ±100 mA; S8050 dan 2N2222 sekitar 500–800 mA.

Di dalam modul relay-mu sebenarnya sudah ada satu transistor NPN yang menggerakkan kumparan relay. Untuk pompa, IRLZ44N tetap pilihan terbaik.
</details>

<details>
<summary><b>Mengukur arus beban dengan multimeter</b></summary>

Untuk mengukur **arus**, multimeter harus dipasang **seri** (berderet), menjadi bagian dari jalan yang dilalui arus — bukan ditempelkan di kedua ujung seperti mengukur tegangan.

1. Matikan MB102, lalu cabut USB. Pindahkan *probe* merah ke lubang **10A** di multimeter (*probe* hitam tetap di COM), lalu putar sakelar ke **A⎓ 10** (kadang tertulis **10A**). Di Modul 2, lubang 10A dilarang karena kita mengukur tegangan; khusus untuk mengukur **arus**, lubang inilah yang dipakai, dengan aturan di bawah.
2. Cabut kabel **hitam (−) kipas** dari rel atas. Tempelkan *probe* merah ke ujung kabel kipas itu, dan *probe* hitam ke kabel cadangan di rel atas (−). Sekarang arus kipas mengalir **melewati** multimeter.
3. Colokkan USB, lalu nyalakan MB102 dan jalankan kipas (sketsa Praktik 6). Multimeter menunjukkan arusnya, misalnya `0.12` = 0,12 A = 120 mA. Coba dengan pompa juga (pompa terendam air): dengan urutan nyala-mati yang sama, cabut kabel hitam pompa dari 43d, lalu tempelkan *probe* merah ke ujung kabel itu dan *probe* hitam ke kabel cadangan yang ditancapkan di 43d.
4. Setelah selesai, **kembalikan *probe* merah ke lubang VΩmA**. Melupakan langkah ini adalah cara tercepat merusak multimeter: di lubang 10A, menempelkan *probe* ke dua titik bertegangan sama saja dengan korsleting.

> [!WARNING]
> **Jangan pernah** menempelkan multimeter mode arus langsung ke rel (+) dan (−) — itu korsleting yang bisa memutus sekering multimeter atau merusak MB102. Mulailah selalu dari rentang terbesar (10A). Multimeter murah (DT-830B) sering tidak bersekering di lubang 10A, jadi ukur sebentar saja.

Hasil pengukuranmu membuktikan Konsep 4 dengan angka: kipas dan pompa masing-masing memakan ratusan mA — jauh di atas batas aman pin (±12 mA) dan menyita sebagian besar jatah port USB laptop (±500 mA).
</details>

<details>
<summary><b>Pin <i>strapping</i> lebih dalam: apa yang dibaca chip saat menyala</b></summary>

Tepat ketika ESP32 menyala atau di-*reset*, chip "memotret" level beberapa pin, lalu memakai hasilnya untuk memutuskan cara menyala:

| GPIO | Bawaan saat menyala | Yang ditentukan |
| :--- | :--- | :--- |
| **0** | ditarik ke atas | `HIGH` = jalankan program; `LOW` = mode unduh (inilah gunanya tombol **BOOT**) |
| **2** | ditarik ke bawah | harus `LOW` atau mengambang saat masuk mode unduh |
| **5** | ditarik ke atas | pewaktuan antarmuka SDIO |
| **12** (MTDI) | ditarik ke bawah | **tegangan memori *flash***: `LOW` = 3,3 V, `HIGH` = 1,8 V |
| **15** (MTDO) | ditarik ke atas | `LOW` = pesan *boot* ROM tidak dicetak; juga pewaktuan SDIO |

Modul ESP-WROOM-32 di papan kita memakai memori *flash* 3,3 V. Kalau GPIO 12 tertarik `HIGH` saat menyala — misalnya oleh modul sensor yang punya resistor *pull-up* sendiri — chip memberi memori itu 1,8 V sehingga papan gagal *boot* dan terus-menerus menyala ulang. Memang ada cara mengunci tegangan itu secara permanen lewat *eFuse* (sekering sekali pakai di dalam chip), tetapi langkah itu tidak bisa dibatalkan. Untuk pemula, aturan "**jangan sambungkan apa pun ke D12**" jauh lebih aman.

Setelah selesai menyala, pin-pin ini menjadi GPIO biasa. Itu sebabnya GPIO 2, 5, dan 15 tetap boleh dipakai sebagai keluaran asalkan rangkaiannya tidak memaksa level tertentu tepat saat papan menyala.
</details>

<details>
<summary><b>Kenapa PIR dan ECHO di 34/35, bukan 36/39</b></summary>

Dokumen *ESP32 Series SoC Errata* (daftar "cacat bawaan" chip) dari Espressif mencatat satu keanehan GPIO 36 dan 39. Setiap kali bagian chip tertentu dinyalakan — termasuk pengubah analog ke digital (ADC) yang juga dipakai WiFi — masukan kedua pin itu sempat **ditarik ke bawah selama ±80 nanodetik**. Untuk pembacaan analog, gangguan sesingkat itu tidak terasa. Namun, untuk masukan digital yang memakai ***interrupt*** (fitur yang "membangunkan" program begitu pin berubah), gangguan itu bisa terbaca sebagai perubahan palsu: PIR seolah melihat gerakan, atau sensor jarak salah menghitung waktu pantul.

Jalan keluar dari Espressif: jangan memakai *interrupt* di GPIO 36 dan 39. Karena itu, peta pin kanonik menaruh **sensor analog** (LDR dan sensor tanah) di 36 dan 39, sedangkan **sensor digital** (PIR dan ECHO) di 34 dan 35 — semuanya tetap di ADC1 dan sama-sama "hanya masukan".
</details>

<details>
<summary><b>Di balik ESP32Servo: kenapa servo harus dipasang sebelum buzzer</b></summary>

ESP32 punya 16 saluran PWM (LEDC). Fungsi `ledcAttach` dari paket esp32 memilih saluran kosong pertama dan mencatatnya di "buku catatan" milik paket esp32. Library ESP32Servo punya **buku catatan sendiri**, dan selalu mulai dari saluran 0 tanpa melihat catatan paket esp32.

- **Urutan salah** (buzzer dulu): `ledcAttach` buzzer mengambil saluran 0. ESP32Servo lalu juga meminta saluran 0. Paket esp32 hanya menulis pesan info bahwa saluran 0 sudah terpakai — pesan yang tidak terlihat di Serial Monitor dengan setelan bawaan — lalu pin servo **ikut menumpang** di saluran buzzer yang berfrekuensi 2.000 Hz. Servo menerima sinyal yang tidak ia mengerti dan diam saja. Kami menguji urutan ini di Wokwi: perintah `write(0)` dan `write(180)` dikirim bergantian, tetapi servo tidak bergerak sedikit pun.
- **Urutan benar** (servo dulu): saluran 0 milik servo sudah tercatat di paket esp32 sehingga `ledcAttach` buzzer mendapat saluran 1. Keduanya bekerja.

Aturannya: **pasang semua servo lebih dulu, baru `ledcAttach` yang lain.** Itulah komentar di `siapkanPin()` milik Node 1. Hal yang sama berlaku untuk `analogWrite()`, yang diam-diam memanggil `ledcAttach` dengan frekuensi 1.000 Hz dan resolusi 8 bit.
</details>

<details>
<summary><b><i>Debounce</i> dengan kapasitor, tanpa kode</b></summary>

Pantulan juga bisa diredam oleh perangkat keras. Pasang **kapasitor keramik 100 nF** (dari kit, berkode "104") sejajar dengan tombol: satu kaki di **22g** (sejalur dengan ujung kabel kuning di 22h, jadi tersambung ke D13) dan satu lagi di **24d** (sejalur dengan kabel hitam 24a, jadi tersambung ke GND). Bengkokkan kakinya supaya menyeberangi parit tengah. Bersama resistor *pull-up* internal ±45 kΩ, kapasitor itu membentuk "peredam". Tegangan pin jadi berubah perlahan dalam beberapa milidetik sehingga pantulan cepat tidak sempat terbaca.

Coba dengan sketsa Praktik 2.1 (tanpa *debounce* perangkat lunak): hitungannya menjadi jauh lebih rapi. Di dunia nyata, keduanya sering dipakai bersamaan.
</details>

<details>
<summary><b>Detektor <i>brownout</i> dari dekat</b></summary>

- Batas tegangannya bisa dipilih dari delapan tingkat, sekitar **2,43–2,80 V**; paket esp32 untuk Arduino sudah menetapkannya saat dibuat.
- Saat terpicu, kode milik ESP-IDF (fondasi di balik paket esp32) mencatat alasan *restart* sebagai `BROWNOUT`, mencetak pesan `Brownout detector was triggered` dengan label `BOD` (biasanya tampil sebagai `E BOD: …`), lalu me-*restart* chip lewat perangkat lunak. Itu sebabnya baris `rst:` dari ROM bisa menyebut *restart* perangkat lunak, sedangkan `esp_reset_reason()` tetap menjawab `BROWNOUT` — alasan yang sebenarnya sudah dicatat sebelum *restart*.
- Detektornya memang bisa dimatikan, tetapi jangan pernah melakukannya (lihat Praktik 8). Nanti, di Modul 28, alasan *restart* ikut dikirim ke server sebagai `reset_reason` supaya *brownout* yang terjadi diam-diam di rumah tetap ketahuan.
</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari yang paling ringan. Kerjakan minimal Tingkat 1. Semuanya memakai rakitan yang sudah ada di meja kerjamu.

> 🖥️ **Alat:** **Arduino IDE** dan rakitan Node 1. Mau mencoba di Wokwi dulu? Tingkat 1 punya diagram sendiri yang berisi potensiometer dan servo: [`diagram.json`](kode/wokwi-kenop-tirai/diagram.json) dan [`libraries.txt`](kode/wokwi-kenop-tirai/libraries.txt). Tingkat 2 dan 3 memakai [`diagram.json` Node 1](kode/node-1-rumah/diagram.json); di sana, LED berlabel **lampu** mewakili lampu Tingkat 3 (di Wokwi tanpa resistor; di mejamu tetap pakai resistor 220 Ω seperti tabel Tingkat 3).

**Tingkat 1 — Ubah sedikit: kenop tirai.** Gabungkan Praktik 3 dan 5: putaran potensiometer menentukan sudut servo, seperti kenop tirai sungguhan. Petunjuk:

- Buka `modul05_servo_serial`, lalu **segera** pilih **File → Save As…** dan beri nama `modul05_kenop_tirai` sebelum mengubah apa pun supaya sketsa Praktik 5 tidak tertimpa. Setelah itu, hapus isi `loop()`.
- Di `loop()`: baca `analogRead(39)`, ubah skalanya dengan `map(…, 0, 4095, 0, 180)`, lalu kirim ke `tirai.write(…)`. Cetak sudutnya, lalu beri jeda `delay(50)`.
- Berhasil kalau servo mengikuti putaran potensiometer dengan mulus. Servo bergetar walaupun kenop diam? Bacaan analog memang sedikit bergoyang; Modul 6 membahas cara meredamnya.

**Tingkat 2 — Gabungkan: Morse bersuara.** Buka sketsa Morse dari Modul 3 (`modul03_morse_nama`; tidak ketemu? salin dari [`modul03_morse_nama.ino`](../../fase-0-fondasi/modul-03-cpp-untuk-esp32/kode/modul03_morse_nama/modul03_morse_nama.ino)) dan simpan dengan nama baru `modul05_morse_bersuara`. Buat buzzer ikut berbunyi bersama LED, lalu jadikan tombol D13 sebagai tombol "ulangi". Petunjuk:

- Tambahkan konstanta `const int PIN_BUZZER = 27;`, `const int PIN_TOMBOL = 13;`, dan `const int JEDA_PANTUL = 30;`. Di `setup()`, tambahkan `pinMode(PIN_TOMBOL, INPUT_PULLUP);` dan `ledcAttach(PIN_BUZZER, 800, 10);`.
- Di fungsi `kedip()`, panggil `ledcWriteTone(PIN_BUZZER, 800)` tepat setelah LED dinyalakan, lalu panggil `ledcWriteTone(PIN_BUZZER, 0)` tepat setelah LED dipadamkan.
- Pindahkan perulangan `for` pengirim huruf dari `loop()` ke fungsi baru `void kirimNama(String nama)`. Simpan nama terakhir di variabel `String` di luar fungsi. Di `loop()`, panggil `kirimNama(…)` setiap ada nama baru dari Serial Monitor. Kalau `tombolDitekan()` (salin dari Praktik 2.2) menjawab `true`, panggil lagi dengan nama terakhir.

**Tingkat 3 — Rancang sendiri: lampu LED dan empat mode tombol.** Beri relay 1 sebuah "lampu" berupa LED biasa dengan resistor 220 Ω yang diberi 5 V dari rel atas — **bukan** bohlam 220 V (ingat CAUTION di Konsep 9). Lalu, buat satu tombol bergantian memilih empat mode: semua mati → lampu → kipas → lampu dan kipas → kembali ke semua mati.

**Rangkaian lampu.** Matikan MB102 dan cabut USB dulu, lalu pasang di breadboard atas:

| Komponen | Dari | Ke |
| :--- | :--- | :--- |
| Kabel **merah** jantan–jantan | rel atas **(+)** | terminal **COM relay 1** |
| Kabel jantan–jantan | terminal **NO relay 1** | **16a** |
| Resistor 220 Ω | **16c** | **20c** |
| LED putih atau kuning | kaki **panjang** di **20e** | kaki **pendek** di **21e** |
| Kabel **hitam** | **21a** | rel atas **(−)** |

Hitung sendiri arus LED itu dengan Hukum Ohm (Modul 2): apakah aman untuk LED?

- **Kode:** simpan nomor mode di variabel `int`. Setiap tekanan menambah 1, dan `% 4` (sisa bagi) membuatnya kembali ke 0 setelah 3. Atur kedua relay sesuai mode, cetak nama modenya, dan bunyikan "bip" pendek (2.000 Hz, 100 ms) sebagai tanda tekanan diterima.
- **Ingat urutan** kalau ada servo di sketsamu: `attach` servo dulu, baru `ledcAttach` buzzer.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Sumbangan Modul 5 ke proyek benang merah: **semua "tangan" Node 1 terpasang di pin tetapnya**, dan **`PETA-PIN.md`** menjadi dokumen resmi proyek. Mulai minggu ini, rak-rak di kerangka Node 1 tidak lagi disalin utuh: kamu **mengisinya sendiri** dari potongan kode yang sudah kamu tulis di Praktik. Versi rujukan lengkap ada di [`proyek-rumah-pintar-mini/firmware/node-1-rumah/`](../../proyek-rumah-pintar-mini/firmware/node-1-rumah/node-1-rumah.ino) — bandingkan dengan milikmu kalau ada yang macet.

> 🖥️ **Alat yang dipakai:** **Arduino IDE** (dengan library ESP32Servo dari Praktik 5), **VS Code**, **GitHub Desktop**, dan rakitan lengkap Praktik 1–7. Tanpa papan? Semua langkah bisa diuji di Wokwi dengan [`diagram.json`](kode/node-1-rumah/diagram.json) dan [`libraries.txt`](kode/node-1-rumah/libraries.txt) Node 1. Di diagram itu, servo dan relay mengambil daya dari pin VIN, dan LED lampu/kipas menyala tanpa resistor — jangan tiru di papan asli (🚨, bagian Wokwi).

### A. Buat `PETA-PIN.md`

1. Di VS Code, buka folder repositori proyekmu (**File → Open Folder…** → **Documents → GitHub → rumah-pintar-mini**).
2. Klik ruang kosong di bawah daftar file di panel Explorer (supaya file baru masuk ke folder utama), lalu klik ikon **New File…** dan beri nama `PETA-PIN.md`.
3. Buka versi rujukan [`PETA-PIN.md`](../../proyek-rumah-pintar-mini/PETA-PIN.md) di tab baru, klik **Copy raw file**, lalu tempel ke file barumu. Isinya: tabel peta pin Node 1 dan Node 2 dari Konsep 3, pin yang dihindari, pembagian rel daya di meja kerja, dan aturan emas catu daya. Peta pin ini memang **satu untuk semua** pembelajar, jadi boleh disalin utuh.
4. Simpan (**Ctrl + S**, atau biarkan Auto Save bekerja).

### B. Isi rak-rak Node 1 menjadi v0.2.0

Buka **`node-1-rumah.ino`** di Arduino IDE: **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah**. Kerjakan perubahan berikut dari atas ke bawah. Setiap selesai satu langkah, klik **Verify** (✓) supaya salah ketik langsung ketahuan.

**Langkah 1 — Bagian paling atas: komentar, library, versi, dan peta pin.** Ganti semua baris dari baris pertama sampai baris `const int PIN_LED_STATUS = 4; …` — yaitu blok komentar pembuka dan dua konstanta pertama — dengan blok di bawah ini. Baris `const unsigned long JEDA_BACA = 2000;` **biarkan dulu**: `loop()` lama masih memakainya sampai Langkah 6.

```cpp
// Node 1 "Rumah" - firmware v0.2.0 (diperbarui di Modul 5)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v0.2.0: semua aktuator Node 1 terpasang di pin kanonik (lihat PETA-PIN.md):
// relay lampu, relay kipas, pompa (lewat MOSFET), servo tirai, buzzer, dan tombol manual.
// Tombol manual menyalakan/mematikan lampu. Aktuator lain bisa dicoba lewat
// Serial Monitor, misalnya: lampu on, kipas off, pompa 3, tirai 90, bunyi, status.
// Sensor masih berupa angka contoh; Modul 6-7 menggantinya dengan bacaan sungguhan.
//
// Library: ESP32Servo versi 3.2.1.

#include <ESP32Servo.h>
#include <esp_system.h>  // esp_reset_reason()

const String VERSI_FIRMWARE = "0.2.0";

// ---------- Peta pin kanonik Node 1 (salinan dari PETA-PIN.md) ----------
const int PIN_LED_STATUS = 4;    // Modul 2
const int PIN_TOMBOL = 13;       // Modul 5, INPUT_PULLUP
const int PIN_RELAY_LAMPU = 32;  // Modul 5, relay aktif LOW
const int PIN_RELAY_KIPAS = 33;  // Modul 5, relay aktif LOW
const int PIN_POMPA = 25;        // Modul 5, gerbang MOSFET IRLZ44N
const int PIN_SERVO_TIRAI = 26;  // Modul 5, servo SG90
const int PIN_BUZZER = 27;       // Modul 5, buzzer pasif
// Dipesan untuk modul berikutnya (jangan dipakai untuk hal lain):
// Modul 6: DHT22 = 14, LDR = 36 (VP), tanah = 39 (VN), PIR = 34, HC-SR04 TRIG = 15, ECHO = 35
// Modul 7: I2C SDA = 21, SCL = 22; microSD SCK = 18, MISO = 19, MOSI = 23, CS = 5
// Modul 15: RS-485 RX = 16, TX = 17, DE/RE = 2

const int JEDA_PANTUL = 30;           // milidetik, untuk debounce tombol
const int JEDA_PUTARAN = 10;          // loop() berputar kira-kira tiap 10 milidetik
const int PUTARAN_PER_LAPORAN = 200;  // 200 x 10 ms = kira-kira 2 detik
```

**Langkah 2 — Ingatan Node 1.** Tepat **di bawah** `struct BacaanSensor { … };`, tambahkan:

```cpp
// Keadaan aktuator saat ini (nanti dikirim di "ack", Lampiran A)
bool lampuMenyala = false;
bool kipasMenyala = false;
int sudutTirai = 90;

Servo servoTirai;
int hitungPutaran = 0;
```

**Langkah 3 — Fungsi-fungsi "tangan".** Cari baris label `// ---------- Modul 5: menyiapkan semua pin ----------` (label rak `siapkanPin()`). Tepat **di atas** baris label itu, tambahkan dulu label baru `// ---------- Modul 5: alasan restart terakhir (nama sama dengan Lampiran A) ----------` dan fungsi `alasanReset()` — salin utuh dari sketsa Praktik 8 — lalu fungsi-fungsi di bawah ini. `aturKipas` sama dengan Praktik 6, ditambah satu baris yang mengingat keadaannya; `aturLampu` adalah kembarannya untuk relay 1.

```cpp
// ---------- Modul 5: aktuator ----------
void aturLampu(bool nyala) {
  lampuMenyala = nyala;
  if (nyala) {
    digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
  } else {
    digitalWrite(PIN_RELAY_LAMPU, HIGH);
  }
}

void aturKipas(bool nyala) {
  kipasMenyala = nyala;
  if (nyala) {
    digitalWrite(PIN_RELAY_KIPAS, LOW);
  } else {
    digitalWrite(PIN_RELAY_KIPAS, HIGH);
  }
}

void jalankanPompa(int detik) {
  detik = constrain(detik, 1, 10);  // batas aman: 1-10 detik
  digitalWrite(PIN_POMPA, HIGH);
  delay(detik * 1000);  // sementara memblokir; Modul 8 membuatnya tanpa delay()
  digitalWrite(PIN_POMPA, LOW);
}

void aturTirai(int sudut) {
  sudutTirai = constrain(sudut, 0, 180);
  servoTirai.write(sudutTirai);
}

void bunyikanBuzzer() {
  ledcWriteTone(PIN_BUZZER, 2000);  // 2.000 Hz
  delay(150);
  ledcWriteTone(PIN_BUZZER, 0);
}
```

**Langkah 4 — Isi rak `siapkanPin()`.** Ganti **seluruh fungsi** `siapkanPin()` — mulai baris `void siapkanPin() {` sampai kurung kurawal tutup `}`-nya — dengan:

```cpp
void siapkanPin() {
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);

  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  aturLampu(false);  // segera matikan: pinMode(OUTPUT) baru saja membuat pin LOW (= relay menarik)
  aturKipas(false);

  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);

  // Servo dipasang SEBELUM buzzer: urutan ini mencegah keduanya berebut saluran PWM.
  servoTirai.setPeriodHertz(50);
  servoTirai.attach(PIN_SERVO_TIRAI, 500, 2400);
  aturTirai(sudutTirai);

  ledcAttach(PIN_BUZZER, 2000, 10);
}
```

**Langkah 5 — Tombol dan perintah lewat Serial Monitor.** Tepat **di bawah** kurung kurawal tutup `siapkanPin()`, tambahkan label `// ---------- Modul 5: tombol manual dengan debounce ----------` dan fungsi `tombolDitekan()` — salin utuh dari Praktik 2.2 — lalu empat fungsi ini:

```cpp
String teksOnOff(bool nyala) {
  if (nyala) {
    return "on";
  }
  return "off";
}

void cetakStatus() {
  Serial.print("status: lampu=");
  Serial.print(teksOnOff(lampuMenyala));
  Serial.print(" kipas=");
  Serial.print(teksOnOff(kipasMenyala));
  Serial.print(" tirai=");
  Serial.println(sudutTirai);
}

// Menjawab true kalau teks BUKAN angka: toInt() memberi 0, padahal teksnya bukan "0" (cara Praktik 5).
bool bukanAngka(String teks) {
  return teks.toInt() == 0 && teks != "0";
}

// ---------- Modul 5: perintah lewat Serial Monitor (Modul 11 menggantinya dengan MQTT) ----------
void periksaPerintahSerial() {
  if (Serial.available() == 0) {
    return;
  }
  String perintah = Serial.readStringUntil('\n');
  perintah.trim();
  perintah.toLowerCase();

  if (perintah == "lampu on") {
    aturLampu(true);
  } else if (perintah == "lampu off") {
    aturLampu(false);
  } else if (perintah == "kipas on") {
    aturKipas(true);
  } else if (perintah == "kipas off") {
    aturKipas(false);
  } else if (perintah.startsWith("pompa ")) {
    String angka = perintah.substring(6);  // teks sesudah "pompa "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka detik. Contoh: pompa 3");
      return;
    }
    Serial.println("pompa menyala...");
    jalankanPompa(angka.toInt());
  } else if (perintah.startsWith("tirai ")) {
    String angka = perintah.substring(6);  // teks sesudah "tirai "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka sudut. Contoh: tirai 90");
      return;
    }
    aturTirai(angka.toInt());
  } else if (perintah == "bunyi") {
    bunyikanBuzzer();
  } else if (perintah != "status") {
    Serial.println("Perintah tidak dikenal. Contoh: lampu on, kipas off, pompa 3, tirai 90, bunyi, status");
    return;
  }
  cetakStatus();
}
```

Yang baru di potongan ini:

- **`toLowerCase()`** mengubah semua huruf menjadi huruf kecil, jadi `Lampu ON` tetap dikenali.
- **`startsWith("pompa ")`** memeriksa apakah teks **diawali** kata itu.
- **`substring(6)`** mengambil sisa teks sesudah enam karakter pertama. `pompa ` dan `tirai ` sama-sama enam karakter (lima huruf dan satu spasi). C++ menghitung posisi dari 0, jadi posisi 6 adalah karakter ketujuh: angka di belakangnya.
- **`bukanAngka()`** memakai pemeriksaan "bukan angka" dari Praktik 5. Jadi, `tirai abc` ditolak dan servo tidak bergerak ke 0°.
- Perintah yang tidak dikenal langsung dijawab dengan `Perintah tidak dikenal. …`, sedangkan perintah yang dikenal diakhiri `cetakStatus()`.

**Langkah 6 — `setup()`, `loop()`, dan satu label rak.** Ganti `setup()` dan `loop()` lama dengan blok di bawah ini, lalu **hapus** baris `const unsigned long JEDA_BACA = 2000;` di bagian atas file — `loop()` yang baru tidak memakainya lagi.

```cpp
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Node 1 Rumah - firmware " + VERSI_FIRMWARE);
  Serial.println("Alasan restart terakhir: " + alasanReset());
  siapkanPin();
  cetakStatus();
}

void loop() {
  // Tombol dan Serial diperiksa di setiap putaran (kira-kira 100 kali per detik),
  // supaya tekanan tombol tidak terlewat. Laporan sensor cukup tiap kira-kira 2 detik.
  if (tombolDitekan()) {
    aturLampu(!lampuMenyala);
    cetakStatus();
  }
  periksaPerintahSerial();

  hitungPutaran++;
  if (hitungPutaran >= PUTARAN_PER_LAPORAN) {
    hitungPutaran = 0;
    BacaanSensor bacaan = bacaSensor();
    cetakBacaan(bacaan);
    tampilkanDiLayar(bacaan);
    kendalikanAktuator(bacaan);
    kirimData(bacaan);
    kedipStatus();
  }
  delay(JEDA_PUTARAN);
}
```

Terakhir, cari baris label di atas rak `kendalikanAktuator`, yaitu `// ---------- Modul 5 & 19: mengendalikan kipas, lampu, pompa ----------`. Ubah baris itu menjadi `// ---------- Modul 6 & 19: aturan otomatis (siram, lampu, kipas) ----------`, lalu ganti komentar `// belum diisi` di dalam raknya dengan `// belum diisi: Modul 6 menambahkan "siram otomatis" dan "lampu otomatis"`. Rak itu diisi minggu depan.

Kenapa `loop()` berubah? Di v0.1.0, `loop()` berhenti 2 detik di setiap putaran (`delay(JEDA_BACA)`) sehingga tekanan tombol bisa terlewat. Sekarang `loop()` berputar setiap ±10 ms untuk memeriksa tombol dan Serial Monitor, sedangkan laporan sensor hanya dicetak setiap 200 putaran (±2 detik). Cara ini masih sederhana; Modul 8 menggantinya dengan pola `millis()`.

### C. Uji Node 1

1. Klik **Verify**. Kalau muncul error, bandingkan baris yang ditunjuk pesan error dengan [versi rujukan](../../proyek-rumah-pintar-mini/firmware/node-1-rumah/node-1-rumah.ino).
2. Colokkan USB, nyalakan MB102, lalu klik **Upload**. Buka Serial Monitor (**New Line**, 115200 baud).

   **Hasilnya:**

   ```text
   Node 1 Rumah - firmware 0.2.0
   Alasan restart terakhir: POWERON
   status: lampu=off kipas=off tirai=90
   suhu=28.5 kelembapan=71 cahaya=412 gerak=tidak
   ```

3. Pastikan pompa terendam air dan ujung selangnya di gelas. Lalu, uji setiap "tangan" dengan mengetik perintah ini satu per satu: `lampu on`, `kipas on`, `tirai 45`, `bunyi`, `pompa 3`, `kipas off`, `status`. Setiap perintah dijawab dengan baris `status: …`, dan bendanya bergerak. Tekan juga tombol manual: relay lampu berganti saat jarimu diangkat.
4. Ketik `halo`: Node 1 menjawab `Perintah tidak dikenal. …`. Ketik juga `tirai abc`: Node 1 menjawab `Butuh angka sudut. …`, dan servo tidak bergerak.

Di Wokwi, modul relay 2 kanal diganti dua modul relay 1 kanal, sedangkan lampu, kipas, dan pompa diwakili LED berlabel.

![Tangkapan layar Wokwi: Node 1 lengkap dengan servo, dua modul relay satu kanal, LED berlabel lampu dan kipas, buzzer, LED berlabel pompa, tombol D13, papan ESP32, dan LED status. Penanda 1: setelah perintah lampu on, LED lampu menyala. Penanda 2: setelah perintah tirai 45, lengan servo berputar ke sekitar 45 derajat. Penanda 3: LED kecil berlabel LED1 di modul relay Wokwi menyala terbalik, abaikan saja. Penanda 4: Serial Monitor menampilkan jawaban status, misalnya status: lampu=on kipas=off tirai=45. Catatan bawah: di Wokwi, modul relay 2 kanal diganti dua modul relay 1 kanal, sedangkan lampu, kipas, dan pompa diwakili LED berlabel](aset/wokwi-node-1.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

### D. *Commit* dan *push*

1. Di GitHub Desktop, pilih **`rumah-pintar-mini`** di kotak **Current repository** — selalu lihat kotak ini sebelum *commit*!
2. Tab **Changes** berisi dua file: `PETA-PIN.md` (baru) dan `firmware/node-1-rumah/node-1-rumah.ino` (berubah; di kanan terlihat baris hijau yang ditambah dan merah yang dihapus).
3. Isi **Summary** dengan `Node 1 v0.2.0: semua aktuator di pin kanonik + PETA-PIN.md (Modul 5)`, klik **Commit 2 files to main**, lalu **Push origin**.

> [!IMPORTANT]
> **`PETA-PIN.md` adalah hukum proyek ini.** Setiap kali sebuah modul kurikulum menambahkan sensor atau komponen baru ke Node 1, periksa dulu peta ini. Kalau suatu hari kamu terpaksa mengubahnya, ubah **file dan konstanta di kode bersamaan**, lalu catat alasannya di pesan *commit*.

---

## 📖 Glosarium

| Istilah | Arti ramah awam |
| :--- | :--- |
| **GPIO** | *General Purpose Input/Output*: kaki ESP32 yang bisa diatur kode menjadi masukan atau keluaran. Papan kita punya 25. |
| **Pin *strapping*** | Pin yang levelnya "dipotret" chip tepat saat menyala untuk menentukan cara menyala (GPIO 0, 2, 5, 12, 15). |
| **Pin hanya masukan** | GPIO 34–39: hanya bisa membaca, tidak bisa menjadi keluaran, dan tidak punya *pull-up* internal. |
| **ADC1 / ADC2** | Dua pembaca tegangan analog di ESP32. ADC2 tidak bisa dipakai saat WiFi menyala, jadi sensor analog kita selalu di ADC1 (GPIO 32–39). |
| **Peta pin kanonik** | Daftar tetap "kabel apa di kaki mana" untuk seluruh proyek, berlaku sampai Modul 28. Disimpan di `PETA-PIN.md`. |
| **MB102** | Modul catu daya kecil yang ditancapkan di ujung breadboard; memberi 5 V (atau 3,3 V) ke rel breadboard dari adaptor. |
| **Rel atas / tengah / bawah** | Sebutan kita untuk jalur daya di meja kerja: rel atas 5 V dari MB102 untuk beban, rel tengah tidak dipakai, rel bawah 3,3 V dari ESP32. |
| **GND bersama** | Semua sumber listrik disambung di titik nol yang sama supaya sinyal 3,3 V dari ESP32 dimengerti relay dan MOSFET. |
| **Beban** | Benda yang "memakan" listrik cukup banyak: relay, kipas, pompa, servo. |
| ***Brownout*** | Tegangan yang anjlok sesaat. Detektor *brownout* ESP32 sengaja me-*restart* chip supaya tidak berjalan ngawur. |
| **Alasan *restart*** (`reset_reason`) | Catatan chip tentang sebab ia terakhir menyala ulang: `POWERON`, `BROWNOUT`, `PANIC`, dan seterusnya. |
| **Masukan / keluaran** | Pin masukan (*input*) membaca tegangan; pin keluaran (*output*) mengeluarkan 3,3 V atau 0 V. |
| **Mengambang** (*floating*) | Keadaan pin masukan yang tidak tersambung ke apa pun sehingga bacaannya acak. |
| ***Pull-up* / *pull-down*** | Resistor penarik ke 3,3 V / ke GND supaya pin masukan tidak mengambang. `INPUT_PULLUP` menyalakan resistor *pull-up* di dalam chip. |
| **Pantulan** (*bounce*) | Kontak logam tombol yang menyambung-putus berkali-kali selama beberapa milidetik setiap ditekan atau dilepas. |
| ***Debounce*** | Cara meredam pantulan, misalnya menunggu 30 ms lalu memeriksa ulang. |
| ***Toggle*** | Satu tombol untuk menyalakan sekaligus mematikan: setiap tekanan membalik keadaan. |
| **Penggerak** (*driver*) | Sakelar perantara yang mengambil tenaga dari catu daya, sedangkan pin ESP32 hanya memberi perintah. |
| **PWM** | *Pulse Width Modulation*: menyalakan dan mematikan pin sangat cepat untuk meniru "setengah menyala", membuat nada, atau memberi perintah sudut. |
| ***Duty cycle*** | Persentase waktu pin menyala dalam setiap putaran PWM. |
| **Frekuensi** (Hz) | Berapa kali sesuatu berulang dalam satu detik. 5.000 Hz = 5.000 kali per detik. |
| **LEDC** | Bagian chip ESP32 yang membuat PWM; dipakai lewat `ledcAttach`, `ledcWrite`, dan `ledcWriteTone`. |
| **Resolusi (bit)** | Banyaknya langkah *duty cycle*. 8 bit = 256 langkah (0–255). |
| **Buzzer pasif / aktif** | Buzzer pasif berbunyi sesuai frekuensi PWM sehingga bisa memainkan nada; buzzer aktif punya pembangkit nada sendiri dengan satu nada tetap. |
| **Servo** | Motor kecil yang bisa diperintah ke sudut tertentu (0–180°) lewat lebar pulsa. |
| **Relay** (KBBI: relai) | Sakelar yang digerakkan magnet listrik; bisa menyambung beban yang terpisah dari ESP32. |
| **COM / NO / NC** | Tiga kontak relay: kaki bersama, biasanya terbuka, dan biasanya tertutup. |
| ***Low-level trigger*** / aktif LOW | Dipicu sinyal rendah: relay menarik saat pin IN diberi `LOW`. |
| ***Optocoupler*** | Lampu dan sensor cahaya mungil dalam satu kemasan; memisahkan sisi pemberi perintah dari sisi kumparan relay. |
| **JD-VCC** | Pin dan jumper di modul relay untuk memisahkan daya kumparan relay dari daya sisi perintah. |
| ***Fail-safe*** (aman-gagal) | Rancangan yang kembali ke keadaan aman kalau ada yang gagal, misalnya kipas berhenti saat ESP32 *restart* atau kabel IN-nya copot. |
| **MOSFET** | Transistor yang menjadi sakelar elektronik senyap; digerakkan tegangan di kaki G (*gate*). |
| ***Logic-level*** | Sifat MOSFET yang sudah menghantar dengan baik pada tegangan gerbang rendah: terbuka penuh di 4–5 V, dan pada 3,3 V sudah cukup untuk arus ratusan mA. Contohnya IRLZ44N. |
| **G / D / S** | Tiga kaki MOSFET: *gate* (gerbang), *drain* (saluran), *source* (sumber). |
| ***Low-side switch*** | Sakelar di "jalan pulang" beban ke GND; beban tetap tersambung ke 5 V. |
| **Dioda *flyback*** | Dioda yang dipasang sejajar dengan motor atau kumparan, dengan cincin perak di sisi (+), untuk "menelan" lonjakan tegangan saat arusnya diputus. |
| **Kapasitor elektrolit** | Komponen penyimpan muatan berkaki (+) dan (−); dipakai sebagai "tandon kecil" penahan lonjakan arus. Arahnya tidak boleh terbalik. |
| **Potensiometer** | Resistor dengan tombol putar; kaki tengahnya mengeluarkan tegangan di antara kedua kaki luarnya. |
| **DAC** | *Digital-to-Analog Converter*: pengubah angka menjadi tegangan analog sungguhan. ESP32 klasik punya dua, di GPIO 25 dan 26. |
| ***Interrupt*** | Fitur yang langsung "membangunkan" program begitu sebuah pin berubah, tanpa harus terus-menerus diperiksa. |
| **Kabel USB A–A** | Kabel USB dengan colokan tipe A (persegi panjang) jantan di kedua ujungnya; dipakai dari adaptor ke port USB MB102. |

---

## 📝 Kuis 5 soal

Jawab dulu di catatanmu, baru buka kuncinya. Lulus = minimal 4 benar.

1. Sebutkan **tiga pin** (atau kelompok pin) ESP32 DevKit V1 yang sebaiknya tidak dipakai, beserta alasan masing-masing.
2. Tombol di D13 disambung ke GND dengan `pinMode(13, INPUT_PULLUP)`. (a) Apa hasil `digitalRead(13)` saat tombol ditekan dan saat dilepas? (b) Kenapa tombol yang sama di **D34** terbaca acak walaupun kodenya sama persis?
3. Seorang teman menulis program penghitung tekanan tombol, tetapi satu tekanan terhitung empat kali. Apa penyebabnya? Sebutkan dua gagasan yang dipakai fungsi `tombolDitekan()` untuk mengatasinya.
4. ESP32 temanmu *restart* setiap kali kipasnya mulai berputar. Kipas itu mendapat listrik dari pin VIN, dan papan dicolokkan ke laptop. (a) Tulisan apa yang kemungkinan muncul di Serial Monitor? (b) Bagaimana cara memperbaikinya? Sebutkan tiga aturan yang harus diikuti.
5. (a) Sebuah tutorial menulis `ledcSetup(0, 5000, 8);`, `ledcAttachPin(4, 0);`, dan `ledcWrite(0, 128);`. Tulis ulang untuk paket esp32 versi 3. (b) Modul relay kita aktif LOW, dan `pinMode(33, OUTPUT)` sudah dipanggil di `setup()`. Tulis satu baris kode yang **menyalakan** kipas di D33.

<details>
<summary><b>Kunci jawaban & penjelasan</b></summary>

1. (1) **GPIO 12 (D12)**: pin *strapping* penentu tegangan memori *flash*; kalau tertarik HIGH saat menyala, papan gagal *boot*. (2) **GPIO 1 dan 3 (TX0, RX0)**: jalur USB ke laptop, dipakai saat program sedang diunggah dan oleh Serial Monitor. (3) **GPIO 6–11**: dipakai memori *flash* tempat program tersimpan; memakainya membuat program mogok. Jawaban **GPIO 0** (tombol BOOT, menentukan mode unduh) juga benar.
2. (a) Ditekan: `LOW` (pin tersambung ke GND). Dilepas: `HIGH` (ditarik resistor *pull-up* internal ke 3,3 V). Logikanya terbalik. (b) GPIO 34–39 **tidak punya resistor *pull-up* internal**, jadi `INPUT_PULLUP` diam-diam tidak berpengaruh. Saat tombol dilepas, pin itu mengambang dan bacaannya acak. Solusinya: memindahkan tombol ke pin lain (seperti D13) atau memasang resistor 10 kΩ ke 3,3 V.
3. **Pantulan** (*bounce*): kontak logam tombol menyambung-putus beberapa kali selama beberapa milidetik, dan ESP32 cukup cepat untuk membaca setiap pantulan sebagai tekanan baru. Gagasan 1: **tanggapi perubahan**, bukan keadaan (bandingkan dengan keadaan sebelumnya). Gagasan 2: **tunggu pantulan reda** (±30 ms), periksa ulang, tunggu sampai tombol dilepas, lalu tunggu lagi.
4. (a) `Brownout detector was triggered`, lalu ESP32 menyala ulang; sketsa Praktik 8 akan mencetak `Alasan restart terakhir: BROWNOUT`. (b) Pindahkan kipas (dan semua beban) ke catu daya terpisah. Aturannya: **beban selalu dari MB102** (bukan dari VIN/3V3 papan), **ESP32 dari USB laptop**, dan **GND disatukan**. Aturan keempat dan kelima juga benar: rel 5 V MB102 tidak pernah disambung ke 3V3, atau ke VIN selama USB tercolok; dan USB dicolokkan dulu sebelum MB102 dinyalakan. Mematikan detektor *brownout* **bukan** jawaban yang benar.
5. (a) `ledcAttach(4, 5000, 8);` lalu `ledcWrite(4, 128);` — di versi 3, PWM diatur per **pin**, bukan per saluran. (b) `digitalWrite(33, LOW);` (atau `aturKipas(true);` kalau fungsinya sudah dibuat). LOW = relay menarik = kipas berputar. Baris ini baru berlaku setelah `pinMode(33, OUTPUT)`; di paket esp32 versi 3, `digitalWrite` sebelum `pinMode` diabaikan.

</details>

---

## ✅ Checklist kelulusan Modul 5

Centang dengan jujur. Kotak ⭐ adalah **syarat lulus resmi** dari Silabus; sisanya sangat dianjurkan. Kalau semuanya tercentang, tandai Modul 5 di salinan [`PROGRES.md`](../../PROGRES.md) milikmu dan lanjut ke Modul 6.

- [ ] Meja kerjaku sudah ditata ulang: ESP32 menunggangi dua breadboard, rel atas terukur ±5 V dari MB102, rel bawah ±3,3 V dari ESP32, dan GND bersama terbukti dengan multimeter (Praktik 1).
- [ ] Aku melihat sendiri pantulan tombol, lalu meredamnya dengan *debounce* (Praktik 2).
- [ ] LED redup-terang mengikuti potensiometer, buzzer memainkan tangga nada, dan servo menuruti sudut yang kuketik (Praktik 3–5).
- [ ] Modul relay-ku lolos uji 3,3 V: melepas saat IN diberi 3,3 V (Praktik 6.3).
- [ ] ⭐ **Satu tombol menyalakan dan mematikan relay kipas tanpa pantulan (*bouncing*)**: 10 tekanan = tepat 10 kali berganti (Praktik 6).
- [ ] ⭐ **Pompa menyala 3 detik lewat MOSFET dari MB102** (Praktik 7)…
- [ ] ⭐ …**dan kipas serta pompa bekerja dari MB102 tanpa ESP32 *restart***: detektif *restart* berjalan 2 menit tanpa kembali ke putaran 1, dan lima kali uji pompa lolos (Praktik 8.3).
- [ ] Aku sudah melihat (atau mengukur) akibat beban dari USB laptop, dan tahu kenapa detektor *brownout* tidak boleh dimatikan (Praktik 8).
- [ ] ⭐ **Aku bisa menyebutkan tiga pin ESP32 yang sebaiknya tidak dipakai beserta alasannya** (Konsep 2).
- [ ] Folder `modul-05` dan `meja-kerja.jpg` sudah ter-*push* ke repositori `belajar-iot` (Praktik 9).
- [ ] `PETA-PIN.md` dan Node 1 v0.2.0 sudah ter-*push* ke repositori `rumah-pintar-mini`, dan semua perintah Serial Node 1 sudah kuuji (➕).
- [ ] ⭐ **Kuis: minimal 4 dari 5 benar.**

**Lulus jika** (sesuai Silabus): *satu tombol menyalakan dan mematikan relay tanpa "bouncing", pompa dan kipas bekerja dari MB102 tanpa ESP32 restart, dan kamu bisa menyebutkan tiga pin ESP32 yang sebaiknya tidak dipakai beserta alasannya.*

**Menuju tanda lulus Fase 1** ([Silabus §8](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)): dua dari bukti Fase 1 sudah kamu kumpulkan minggu ini, yaitu **`PETA-PIN.md`** dan **foto rangkaian**. Sisanya — firmware Node 1 v1.0 yang hidup 24 jam dari adaptor, sketsa baterai terukur, dan video 30 detik — menyusul di Modul 6–9.

---

## 📚 Sumber & atribusi gambar

Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Ilustrasi meja kerja, modul MB102, modul relay, dan papan ESP32 digambar ulang mengikuti bentuk aslinya; ukuran dan tata letak komponen asli bisa sedikit berbeda antarpabrik. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-05`, `pantulan-tombol`, `arus-pin-penggerak`, `pwm-tiga-kegunaan` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. | CC BY 4.0 |
| `pinout-devkit-v1`, `peta-pin-kanonik` (`.png` + `.svg`) | Diagram orisinal. Urutan pin mengikuti papan ESP32 DevKit V1 30 pin; fungsi pin mengikuti lembar data ESP32 dan dokumentasi ESP-IDF. | CC BY 4.0 |
| `catu-daya-dua-jalur`, `brownout-grafik`, `masukan-pullup` (`.png` + `.svg`) | Diagram orisinal. Batas tegangan dan pesan *brownout* dari kode sumber ESP-IDF; resistor *pull-up* internal ±45 kΩ dari lembar data ESP32. | CC BY 4.0 |
| `mb102-anatomi`, `relay-cara-kerja`, `mosfet-pompa` (`.png` + `.svg`) | Diagram dan ilustrasi orisinal, digambar ulang (bukan foto). Fungsi MB102 mengikuti panduan dan skema YwRobot/Addicore; urutan kaki IRLZ44N mengikuti lembar datanya. | CC BY 4.0 |
| `dua-breadboard`, `meja-kerja-1-dasar` sampai `meja-kerja-7-pompa`, `meja-kerja-node-1` (`.png` + `.svg`) | Ilustrasi orisinal kurikulum. Tata letak lubangnya mengikuti breadboard 830 titik; letak baris pin ESP32 bisa bergeser satu baris di breadboard merek lain (Praktik 1.3). | CC BY 4.0 |
| `foto-servo-sg90.jpg` | Foto: Suyash Dwivedi, [*Tower Pro SG90 micro servo motor*](https://commons.wikimedia.org/wiki/File:Tower_Pro_SG90_micro_servo_motor.jpg), Wikimedia Commons. Penanda ditambahkan oleh penulis. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); gambar berpenanda ini juga berlisensi CC BY-SA 4.0. |
| `wokwi-tombol-pertama.png`, `wokwi-pantulan-tombol.png`, `wokwi-node-1.png` | Tangkapan layar simulator [Wokwi](https://wokwi.com) (Oktober 2026) yang menjalankan kode dan `diagram.json` modul ini. Penanda oleh penulis. | © Wokwi (CodeMagic LTD); dipakai untuk tujuan pendidikan. |

Rujukan yang dipakai saat menulis:

- Espressif: [lembar data ESP32](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) (batas arus pin, tegangan HIGH/LOW, resistor *pull-up* 45 kΩ, pin *strapping*), [*ESP32 Series SoC Errata*](https://www.espressif.com/sites/default/files/documentation/esp32_errata_en.pdf) (GPIO 36/39), dokumentasi [GPIO ESP-IDF](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html) dan [alasan *reset*](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/misc_system_api.html), serta kode sumber detektor *brownout* di [ESP-IDF](https://github.com/espressif/esp-idf).
- Paket Arduino-ESP32 3.3.x: dokumentasi [GPIO](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html), [LEDC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html), dan [panduan pindah dari versi 2 ke 3](https://docs.espressif.com/projects/arduino-esp32/en/latest/migration_guides/2.x_to_3.0.html), serta kode sumber `esp32-hal-ledc.c` dan `esp32-hal-gpio.c`.
- Library [ESP32Servo](https://github.com/madhephaestus/ESP32Servo) 3.2.1 (kode sumber pembagian saluran PWM).
- Lembar data MOSFET IRLZ44N (International Rectifier/Infineon), relay Songle SRD-05VDC-SL-C, dan panduan modul catu daya breadboard MB102 (YwRobot/Addicore).
- Dokumentasi komponen Wokwi: [tombol](https://docs.wokwi.com/parts/wokwi-pushbutton), [potensiometer](https://docs.wokwi.com/parts/wokwi-potentiometer), [modul relay](https://docs.wokwi.com/parts/wokwi-relay-module), [servo](https://docs.wokwi.com/parts/wokwi-servo), dan [buzzer](https://docs.wokwi.com/parts/wokwi-buzzer).

Semua sketsa di modul ini sudah dijalankan di Wokwi dengan paket esp32 versi 3 dan ESP32Servo 3.2.1, dan semua pesan error yang dikutip adalah keluaran asli kompilernya.

---

[⬅️ Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 6 — Membaca Sensor: Analog, Digital, & Kalibrasi** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-6--membaca-sensor-analog-digital--kalibrasi))
