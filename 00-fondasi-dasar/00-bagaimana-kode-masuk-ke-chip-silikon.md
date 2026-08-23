# Modul 0.0: Perjalanan Ajaib — Bagaimana Ketikan Kode Masuk ke Chip Silikon?

> **Tingkat Kesulitan:** Sangat ramah pemula (*Zero Prerequisite* — belum memerlukan pengalaman coding atau elektronika apa pun)  
> **Estimasi Waktu Belajar:** 20–25 menit (membaca panduan + mencoba simulasi langsung di browser)  
> **Kebutuhan Perangkat Keras:** Belum wajib. Jika kamu belum memiliki modul ESP32 fisik, kamu tetap bisa mengikuti seluruh materi dan simulasi sampai selesai.

---

## 🛠️ Persiapan Awal: Buka Ini Dulu Sebelum Mulai

Agar kamu tidak bingung harus menginstal aplikasi apa di komputermu, modul ini **hanya** membutuhkan alat-alat berikut:

| Kebutuhan | Alat / Perangkat | Fungsi & Penjelasan |
| :--- | :--- | :--- |
| **Wajib** | Browser Web (Google Chrome, Microsoft Edge, atau Mozilla Firefox) | Menjalankan simulator sirkuit **Wokwi** untuk menguji program langsung di browser tanpa instalasi apa pun. |
| **Opsional** | Board fisik ESP32 + kabel USB data | Memeriksa port komunikasi di Windows Device Manager (hanya jika kamu sudah memegang alat fisik). |
| **Belum Perlu** | VS Code, Arduino IDE, atau PlatformIO | Seluruh aplikasi editor ini akan kita siapkan bersama secara bertahap pada [Modul 0.6](06-setup-tools-dan-simulator.md). Belum perlu dipasang sekarang. |

> [!TIP]
> **Tautan Laboratorium Simulator untuk Modul Ini:** [Wokwi ESP32 Starter Project](https://wokwi.com/projects/new/esp32)  
> Kamu tidak perlu membuat akun atau login. Jika muncul jendela ajakan *Sign up*, kamu bisa langsung menutup atau mengabaikannya.

---

## ⚡ Tenang, Kamu Tidak Akan Kesetrum!

Sebelum mulai melangkah, mari kita hilangkan rasa cemas yang sering dialami oleh pemula saat pertama kali belajar perangkat keras (*hardware*):

1. **Tegangannya Sangat Rendah dan Aman:**  
   Mikrokontroler seperti **ESP32** bekerja pada tegangan **3,3 volt hingga 5 volt DC** (*Direct Current* / Arus Searah, setara dengan tegangan baterai jam dinding atau baterai smartphone). Tegangan sekecil ini **100% aman disentuh dengan jari tangan** dan tidak memiliki daya untuk menyengat kulit manusia.
2. **Komputermu Memiliki Pengaman Otomatis:**  
   Port USB pada laptop dan komputer masa kini telah dilengkapi sirkuit pengaman pemutus arus (*Overcurrent Protection*). Jika terjadi kesalahan rangkaian kabel sekalipun, laptop akan mematikan aliran USB secara otomatis untuk melindungi dirinya sendiri.

Jadi, kamu bisa bereksperimen dengan santai, nyaman, dan percaya diri! 😊

> [!NOTE]
> **Perbedaan Singkat Arus DC vs AC:**  
> - **Arus DC (Direct Current):** Arus listrik searah bertegangan rendah yang stabil (seperti pada baterai dan port USB). Ini adalah jenis listrik yang kita gunakan di seluruh proyek IoT.  
> - **Arus AC (Alternating Current):** Arus listrik bolak-balik bertegangan tinggi (220 volt) dari stopkontak dinding PLN. Di modul-modul awal ini, kita **sama sekali tidak menyentuh** listrik AC.

---

## 🧭 Peta Pembelajaran Modul Ini

Berikut adalah tahapan materi yang akan kita pelajari bersama:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 0.0                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Kemenangan Cepat: Menyalakan Lampu di Browser dalam 3 Menit         │
│ 2. Laptop vs Mikrokontroler: Mengapa ESP32 Tidak Butuh Windows?        │
│ 3. Pipa Perjalanan Kode: Bagaimana Teks C++ Menjadi Denyut di Chip     │
│ 4. Mengenal Bagian Fisik Board ESP32 (Antena, Chip, dan Tombol)        │
│ 5. Praktik Windows (Opsional): Memeriksa Port COM di Device Manager    │
│ 6. Dua Tombol Fisik: Kapan Harus Menekan EN dan BOOT?                  │
│ 7. Glosarium Istilah Penting & Kuis Uji Pemahaman                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Kemenangan Cepat: Menyalakan Lampu di Browser (3 Menit)

Kita akan menggunakan **Wokwi**, sebuah simulator mikrokontroler interaktif berbasis web. Anggap Wokwi ini sebagai *laboratorium virtual*: kode program yang kita ketik adalah kode nyata, perilakunya nyata, hanya wujud fisiknya saja yang disimulasikan di layar browsermu.

---

### Langkah 1 — Membuka Lembar Kerja Simulasi

1. Buka tautan proyek ini di browsermu: **[https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)**
2. Tunggu beberapa detik hingga layar terbelah menjadi dua bagian utama:
   - **Sisi Kiri (Editor Program):** Tempat kita menuliskan kode. Pastikan tab yang sedang terbuka adalah **`sketch.ino`**.
   - **Sisi Kanan (Diagram Sirkuit):** Menampilkan papan sirkuit virtual ESP32.
3. Di samping tab `sketch.ino`, kamu akan melihat tab bernama **`diagram.json`**. Tab ini berisi denah tata letak kabel virtual (bukan kode C++). Biarkan tab tersebut apa adanya dan tidak perlu diubah.

Saat lembar kerja pertama kali terbuka, kotak teks **Serial Monitor** di bawah gambar board masih kosong. Tombol hijau **Play (Start the simulation)** terletak di sudut kanan atas area diagram sirkuit.

Kode program bawaan dari Wokwi tampak seperti ini:

```cpp
void setup() {
  // Bagian ini dijalankan SATU KALI saat ESP32 baru pertama kali menerima listrik
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
}

void loop() {
  // Bagian ini dijalankan BERULANG-ULANG tanpa henti
  delay(10); // Jeda singkat 10 milidetik agar simulasi berjalan ringan di komputer
}
```

---

### Langkah 2 — Menguji Kode Program Bawaan

1. Pada panel sebelah kanan, klik tombol hijau **Start the simulation** (ikon Play ▶).
2. Perhatikan kotak putih bertuliskan **Serial** di bagian bawah gambar board ESP32.
3. Setelah proses booting simulasi selesai (sekitar 1–2 detik), baris teks paling bawah akan menampilkan kalimat: `Hello, ESP32!`

![Tampilan Wokwi: editor sketch.ino di kiri, tombol Play hijau, board ESP32, dan Serial Hello ESP32](aset/wokwi-esp32-ui.jpg)

*Tangkapan layar antarmuka [Wokwi Simulator](https://wokwi.com/projects/new/esp32). Tombol Sign up di sudut kanan atas dapat diabaikan.*

**Panduan Membaca Antarmuka Wokwi:**
- **Tab `sketch.ino` (Panel Kiri):** Lembar kerja tempat kita mengetik instruksi program.
- **Tombol Hijau Play (Panel Kanan Atas):** Menyalakan aliran listrik ke board virtual dan langsung mengompilasi program.
- **Gambar Board ESP32 (Panel Kanan):** Wujud perangkat keras virtual yang merespons instruksi kodemu.
- **Kotak Putih Serial (Panel Bawah):** Jendela terminal teks untuk membaca pesan yang dikirimkan oleh ESP32 ke komputermu.

> [!NOTE]
> Baris teks teknis seperti `ets Jul...`, `mode:DIO`, atau `load:0x3fff...` yang muncul sesaat di awal **bukanlah pesan error**. Itu adalah log sistem bawaan dari pabrik saat prosesor ESP32 pertama kali terbangun (*booting*). Cukup perhatikan baris paling bawah yang bertuliskan `Hello, ESP32!`.

Ketika simulasi sedang menyala aktif, tombol hijau Play akan berubah menjadi tombol merah bertuliskan **Stop**. Selalu klik tombol **Stop** terlebih dahulu setiap kali kamu ingin mengubah isi kode program.

---

### Langkah 3 — Mengubah Program Menjadi Kedip Lampu LED

Sekarang, mari kita ubah program teks tadi menjadi aksi fisik: membuat lampu LED bawaan pada board berkedip!

1. Klik kembali tab **`sketch.ino`** di panel kiri.
2. Hapus seluruh isi teks yang ada (tekan `Ctrl + A` lalu tekan tombol `Delete`), kemudian tempelkan (*paste*) kode program berikut:

```cpp
void setup() {
  // 1. Beritahu ESP32 bahwa pin GPIO 2 (LED onboard) akan digunakan sebagai OUTPUT (pengirim sinyal)
  pinMode(2, OUTPUT);
}

void loop() {
  // 2. Kirim sinyal tegangan 3.3V ke pin 2 -> Lampu LED MENYALA
  digitalWrite(2, HIGH);

  // 3. Tahan kondisi menyala ini selama 1000 milidetik (1 detik)
  delay(1000);

  // 4. Putus aliran sinyal menjadi 0V -> Lampu LED PADAM
  digitalWrite(2, LOW);

  // 5. Tahan kondisi padam ini selama 1000 milidetik (1 detik), lalu putar ulang dari atas
  delay(1000);
}
```

3. Klik tombol hijau **Start the simulation** (Play ▶) kembali.
4. **Lihat hasilnya:** Lampu LED kecil berwarna biru di pojok modul virtual ESP32 akan mulai berkedip teratur setiap satu detik! 🎉

---

### Langkah 4 — Tantangan Eksperimen Mandiri (*Predict & Modify*)

Mari kita latih daya analisismu:  
*Jika angka `1000` pada fungsi `delay()` kita ubah menjadi angka `100`, menurutmu apakah kedipan lampu akan menjadi lebih cepat atau lebih lambat?*

Mari kita buktikan bersama:
1. Klik tombol merah **Stop**.
2. Ubah kedua baris `delay(1000);` menjadi `delay(100);`.
3. Klik tombol **Start the simulation** lagi.
4. **Hasilnya:** Lampu LED kini berkedip 10 kali lebih cepat menyerupai lampu strobo ambulans!

Kamu juga bisa mencoba kombinasi ritme unik buatanmu sendiri (misalnya menyala sebentar lalu padam lama):

```cpp
void loop() {
  digitalWrite(2, HIGH);
  delay(200);   // Menyala cepat selama 200 milidetik (0,2 detik)
  digitalWrite(2, LOW);
  delay(1500);  // Padam santai selama 1500 milidetik (1,5 detik)
}
```

> [!WARNING]
> **Panduan Jika Lampu Tidak Berkedip:**
> 1. Pastikan tab yang kamu sunting adalah **`sketch.ino`**, bukan `diagram.json`.
> 2. Pastikan kamu menekan tombol **Stop** terlebih dahulu sebelum mengedit kode, lalu menekan tombol **Start the simulation** setelah selesai mengedit.
> 3. Pastikan nomor pin yang kamu tulis adalah angka `2` (karena lampu LED bawaan pada board ESP32 terhubung ke pin GPIO 2).
> 4. Jika halaman web terasa lambat atau macet, cukup muat ulang (*refresh*) browsermu dan buka kembali tautan proyek.

---

## 2. Laptop vs Mikrokontroler: Kenapa ESP32 Tidak Butuh Windows?

Pernahkah kamu bertanya-tanya: *Mengapa saat laptop dinyalakan kita harus menunggu belasan detik untuk proses loading Windows atau macOS, sedangkan ESP32 langsung bekerja seketika dalam hitungan kurang dari 0,05 detik begitu diberi listrik?*

Perbedaan mendasar ini terletak pada tujuan perancangan kedua jenis komputer tersebut:

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│       LAPTOP / KOMPUTER DESKTOP      │     │        MIKROKONTROLER (ESP32)        │
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ • Komputer serbaguna (General Purpose│     │ • Komputer tugas tunggal (Dedicated) │
│ • Menjalankan Sistem Operasi (OS)    │     │ • Tanpa OS berat (Bare-Metal)        │
│ • Menjalankan banyak aplikasi serentak│    │ • Hanya menjalankan SATU program     │
│ • Kapasitas RAM besar (8 GB – 32 GB) │     │ • Kapasitas RAM ringkas (~520 KB)    │
│ • Konsumsi daya tinggi (15W – 100W)  │     │ • Konsumsi daya sangat hemat (<0,5W) │
│ • Waktu booting 10 – 30 detik        │     │ • Langsung bekerja instan (<0,05 dt) │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

![Perbandingan laptop dan mikrokontroler ESP32](aset/laptop-vs-mikrokontroler.jpg)

*Ilustrasi perbandingan arsitektur: ESP32 mengeksekusi program secara langsung tanpa lapisan sistem operasi berat.*

Di dalam ESP32, tidak ada tampilan desktop grafis, tidak ada aplikasi perkantoran, dan tidak ada browser internet. Program yang kamu tulis akan dieksekusi secara **langsung di atas lapisan fisik silikon prosesor**.

Pola kerja ini disebut dengan istilah teknis **Bare-Metal Execution**:
- *Bare* = Polos / langsung.
- *Metal* = Logam silikon fisik pada prosesor.  
Artinya, programmu langsung mengendalikan sirkuit chip tanpa diselimuti oleh sistem operasi perantara.

**Analogi Sederhana:**  
- **Laptop** seperti **Gedung Perkantoran Megah Bertingkat**: Ada pintu gerbang utama yang harus dibuka, lampu lobi yang harus dinyalakan, lift yang harus dioperasikan, dan resepsionis yang harus siap sebelum kamu bisa mulai bekerja di mejamu.  
- **ESP32** seperti **Sakelar Senter di Tangan**: Begitu tombol digeser, listrik langsung mengalir menyalakan bohlam lampu seketika tanpa perlu proses antre!

---

## 3. Pipa Perjalanan Kode: Dari Teks C++ ke Chip Flash

Prosesor silikon pada ESP32 **sama sekali tidak mengerti huruf atau kata bahasa manusia** seperti `digitalWrite`, `pinMode`, atau `OUTPUT`. 

Di dalam prosesor silikon, hanya terdapat jutaan sakelar mikroskopis (*transistor*) yang hanya mengenali dua kondisi fisik: **Ada Aliran Listrik (Logika 1)** atau **Tidak Ada Aliran Listrik (Logika 0)**.

Lalu, bagaimana ketikan teks program di laptop bisa berubah menjadi aksi fisik di dalam chip ESP32? Mari kita ikuti pipa perjalanannya:

```
  [ KODE SUMBER ]          [ KOMPILER ]          [ FILE BINER ]          [ PROGRAM FLASHER ]
     main.cpp     ────►  xtensa-gcc   ────►   firmware.bin   ────►       esptool.py
   (Teks C++)            (Penerjemah)          (Instruksi 0 & 1)         (Pengirim Data)
                                                                                │
                                                                                │ (Kabel USB)
                                                                                ▼
   [ CPU ESP32 ]          [ MEMORI FLASH ]      [ JALUR SERIAL ]      [ CHIP USB-TO-UART ]
  (Mengeksekusi)  ◄────    (Penyimpan)    ◄────     (TX / RX)    ◄────   (CP2102 / CH340)
```

![Enam langkah perjalanan kode dari laptop ke ESP32](aset/alur-kode-masuk-chip.jpg)

*Ilustrasi enam tahapan perjalanan kode dari teks C++ di komputer hingga tersimpan permanen di memori flash ESP32.*

### Penjelasan 6 Tahapan Alur:

1. **Kode Sumber (*Source Code* - `main.cpp` / `sketch.ino`):**  
   File dokumen teks tempat kamu mengetikkan logika program menggunakan bahasa C++. Dokumen ini mudah dibaca dan dipahami oleh manusia.
2. **Kompiler (*Compiler* - `xtensa-esp32-elf-gcc`):**  
   Program penerjemah di komputer yang bertugas mengubah teks C++ menjadi kumpulan instruksi bahasa mesin berupa deretan angka biner (`0` dan `1`).
3. **File Biner (*Binary Firmware* - `firmware.bin`):**  
   File hasil akhir kompilasi yang berisi instruksi mesin murni yang siap dikirimkan ke mikrokontroler.
4. **Program Flasher Utility (*esptool.py*):**  
   Perangkat lunak pengirim yang memecah file biner menjadi paket-paket data kecil dan menyuntikkannya melalui kabel USB ke board ESP32.
5. **Chip USB-to-UART Bridge (CP2102 / CH340):**  
   Chip hitam kecil di samping colokan USB board ESP32. Komputer laptop berkomunikasi menggunakan bahasa USB yang cepat, sedangkan prosesor ESP32 berkomunikasi menggunakan bahasa serial sederhana melalui dua jalur kabel:
   - **TX (*Transmit*):** Jalur untuk mengirimkan data keluar.
   - **RX (*Receive*):** Jalur untuk menerima data masuk.  
   Chip USB-to-UART ini bertindak sebagai **juru bahasa** yang menerjemahkan paket USB dari laptop menjadi sinyal serial TX/RX untuk prosesor ESP32.
6. **Memori SPI Flash & CPU:**  
   Memori Flash adalah "lemari penyimpan permanen" (biasanya berkapasitas 4 Megabyte) yang berada di dalam modul ESP32. Program yang tersimpan di memori Flash ini **tidak akan terhapus meskipun kabel daya dicabut**. Saat diberi listrik, prosesor (CPU) akan membaca instruksi dari memori Flash ini dan menjalankannya baris demi baris secara berurutan.

<details>
<summary>🔬 Ingin Tahu Lebih Dalam: Mengapa Nama Kompiler ESP32 Terdengar Unik?</summary>

Prosesor pada laptopmu umumnya menggunakan arsitektur Intel atau AMD (x86_64), sedangkan chip prosesor pada ESP32 menggunakan arsitektur bernama **Xtensa LX6**. 

Karena struktur internal kedua prosesor ini berbeda, laptopmu membutuhkan kompiler penerjemah silang (*Cross-Compiler*) khusus yang diberi nama `xtensa-esp32-elf-gcc`.

**Analoginya:** Kamus penerjemah bahasa Indonesia ke bahasa Inggris tidak bisa dipakai untuk menerjemahkan ke bahasa Jepang. Setiap keluarga prosesor memiliki "kamus bahasa mesin" tersendiri. Pada [Modul 0.6](06-setup-tools-dan-simulator.md), aplikasi PlatformIO akan mengunduh dan menyiapkan seluruh perlengkapan kompiler ini secara otomatis untukmu di latar belakang.

</details>

---

## 4. Mengenal Bagian Fisik Board ESP32

Jika kamu memegang board fisik **ESP32 DevKit**, mari kita kenali bagian-bagian utamanya:

![Foto board ESP32 DevKit dengan modul ESP-WROOM-32, tombol EN/BOOT, dan colokan USB](aset/esp32-devkitc.jpg)

*Foto fisik board ESP32 DevKit. Sumber: Ubahnverleih, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg), Lisensi [CC0 1.0 (Public Domain)](https://creativecommons.org/publicdomain/zero/1.0/deed.id).*

Agar fungsinya lebih mudah dipahami, perhatikan peta visual tata letak berikut:

![Ilustrasi anatomi board ESP32: antena, modul WROOM, LED, USB-to-UART, tombol EN dan BOOT](aset/anatomi-board-esp32.jpg)

*Peta lokasi dan fungsi komponen penting pada board ESP32 DevKit.*

### Fungsi Komponen Kunci pada Board:

- **Pelindung Logam ESP-WROOM-32 (*Metal Shielding*):**  
  Kaleng pelindung persegi di bagian tengah board. Di dalamnya tersimpan prosesor Dual-Core, sirkuit radio Wi-Fi/Bluetooth, dan chip memori SPI Flash. Pelindung logam ini sengaja dipasang permanen untuk meredam gangguan gelombang elektromagnetik dari lingkungan sekitar.
- **Chip USB-to-UART Bridge:**  
  Kotak hitam kecil di dekat colokan USB (biasanya bertipe CP2102 atau CH340) yang menghubungkan komunikasi data antara laptop dan prosesor ESP32.
- **Lampu Indikator Daya (Power LED - Merah):**  
  Menyala terang dan stabil menandakan bahwa board menerima pasokan daya listrik dengan baik.
- **Lampu LED Pengguna (Onboard LED pada GPIO 2 - Biru):**  
  Lampu LED bawaan yang terhubung langsung ke pin GPIO 2. Lampu inilah yang kita program untuk berkedip pada simulasi Wokwi tadi.
- **Kaki-Kaki Pin Logam (Header Pins):**  
  Deretan jarum pin di sisi kiri dan kanan board yang berfungsi untuk menghubungkan sensor, tombol, atau layar kabel ke breadboard.
- **Tombol EN (*Enable* / Reset):**  
  Berfungsi untuk me-restart program ESP32 dari awal.
- **Tombol BOOT (GPIO 0 / Download Mode):**  
  Berfungsi untuk mengatur ESP32 agar masuk ke mode siap menerima file program baru saat proses pengunggahan (*flashing*).

<details>
<summary>🔬 Ingin Melihat Komponen di Balik Pelindung Logam? (Informasi Tambahan)</summary>

Foto di bawah ini memperlihatkan isi bagian dalam modul ESP-WROOM-32 setelah pelindung logamnya dibuka di laboratorium:

![Isi modul ESP-WROOM-32: CPU ESP32 di tengah, chip flash di samping, antena PCB di kiri](aset/esp32-wroom-32-modul.jpg)

*Foto bagian dalam modul ESP-WROOM-32. Sumber: Brian Krent, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Espressif_ESP-WROOM-32_Wi-Fi_%26_Bluetooth_Module.jpg), Lisensi [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.id).*

**Keterangan Komponen:**
1. **Pola Jalur Tembaga Berliku (Kiri):** Antena pemancar dan penerima sinyal nirkabel Wi-Fi 2.4 GHz dan Bluetooth.
2. **Kotak Hitam Besar di Tengah (`ESP32-D0WDQ6`):** Prosesor utama (CPU) yang mengeksekusi baris instruksi kodemu.
3. **Kotak Hitam Kecil di Samping CPU (`25Q32...`):** Chip memori SPI Flash tempat file biner programmu disimpan secara permanen.

</details>

---

## 5. Praktik Windows: Memeriksa Port COM di Device Manager (Opsional)

> [!NOTE]
> Bagian ini **hanya dipraktikkan jika kamu sudah memiliki board fisik ESP32**. Jika saat ini kamu baru belajar menggunakan simulator Wokwi di browser, kamu bisa membaca sekilas lalu langsung melanjutkan ke [Bagian 6](#6-dua-tombol-fisik-tombol-en-vs-tombol-boot).

Ketika ESP32 dihubungkan ke laptop menggunakan kabel USB, Windows harus mengenali board tersebut sebagai sebuah **Port COM Virtual (*Virtual Communication Port*)**. Port COM ini diibaratkan sebagai "nomor saluran pipa komunikasi" agar laptop tahu ke mana file program harus dikirimkan.

---

### Langkah 1: Memastikan Tipe Kabel USB yang Tepat
Pastikan kabel USB yang kamu gunakan adalah **kabel data** (memiliki 4 jalur kawat: daya positif, daya negatif, data kirim, dan data terima), bukan kabel charger murahan yang hanya memiliki 2 kawat daya tanpa jalur transfer data.

![Perbedaan kabel USB data (4 kawat) dan kabel cas saja (2 kawat)](aset/kabel-data-vs-cas.jpg)

*Perbedaan internal: Kabel USB data memiliki 4 jalur kawat, sedangkan kabel charger biasa hanya memiliki 2 jalur daya.*

---

### Langkah 2: Memeriksa Device Manager di Windows
1. Colokkan board ESP32 ke port USB laptop. Lampu LED merah (Power) pada board akan menyala.
2. Tekan tombol kombinasi **`Windows + X`** pada keyboard komputermu, lalu pilih dan klik menu **Device Manager**.
3. Cari dan klik tanda panah `>` di samping kategori **Ports (COM & LPT)**.

![Ilustrasi Device Manager dengan port COM yang dicari](aset/device-manager-com-port.jpg)

*Tampilan jendela Device Manager saat port COM berhasil terdeteksi dengan benar.*

Pada daftar tersebut, kamu akan melihat salah satu dari nama perangkat berikut:
- `Silicon Labs CP210x USB to UART Bridge (COM3)`
- `USB-SERIAL CH340 (COM4)`

*(Angka `COMx` bisa berbeda di setiap komputer, misalnya COM3, COM5, COM7, dll. Catat angka port COM yang muncul di komputermu untuk digunakan saat upload program nanti).*

---

### 🚨 Kotak Bantuan: "Bagaimana Jika Menu Ports (COM & LPT) Tidak Muncul?"

> [!WARNING]
> **Penyebab dan Solusi Praktis:**
> 1. **Kabel Hanya Berfungsi Sebagai Charger:** Lampu LED merah di board tetap menyala, tetapi Windows sama sekali tidak mendeteksi perangkat baru. **Solusi:** Ganti kabel dengan kabel data smartphone yang biasa digunakan untuk transfer file foto ke laptop.
> 2. **Driver Belum Terpasang di Komputer:** Pada menu *Other devices*, muncul perangkat dengan tanda seru kuning bertuliskan `⚠️ USB2.0-Serial`. Ini menandakan Windows membutuhkan driver penerjemah chip USB tersebut.
>    - Unduh Driver Resmi Chip CP2102: **[Silicon Labs CP210x VCP Driver](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)**
>    - Unduh Driver Resmi Chip CH340: **[WCH CH341SER Official Driver](http://www.wch-ic.com/downloads/CH341SER_EXE.html)**
>    *(Unduh file installer tersebut, jalankan pemasangan driver, lalu cabut dan colokkan kembali kabel USB ESP32 kamu).*

---

## 6. Dua Tombol Fisik: Tombol EN vs Tombol BOOT

Pada board ESP32 fisik, terdapat dua tombol tekan kecil di samping colokan USB yang memiliki fungsi sangat berbeda:

![Perbandingan tombol EN sebagai restart dan tombol BOOT sebagai mode terima program](aset/tombol-en-vs-boot.jpg)

*Perbedaan peran tombol EN (Reset program yang ada) dan tombol BOOT (Penerimaan program baru).*

| Nama Tombol | Analogi Sederhana | Fungsi & Perilaku Nyata |
| :--- | :--- | :--- |
| **Tombol EN** (*Enable / Reset*) | Tombol restart pada smartphone | Memutus daya sesaat untuk memulai ulang eksekusi program yang **sudah tersimpan di memori flash** dari baris paling awal. |
| **Tombol BOOT** (*GPIO 0 / Download Mode*) | Pintu masuk pengiriman paket firmware | Menginstruksikan prosesor: *"Hentikan program lama sejenak, bersiaplah menerima file biner firmware baru dari kabel USB!"* |

---

### 💡 Trik Mengatasi Masalah Upload Paling Populer

Pada beberapa varian board ESP32 rakitan pabrik tertentu, sirkuit pengatur download otomatisnya memiliki kapasitor yang kurang presisi. 

Jika kelak saat proses pengunggahan kode di VS Code atau Arduino IDE muncul pesan yang terhenti seperti ini:
```text
Connecting........_____....._____....._____
```

> [!TIP]
> **Solusi Cepat:**  
> Begitu tulisan `Connecting........_____` mulai muncul di layar terminal, **segera tekan dan tahan tombol fisik `BOOT` selama kurang lebih 2 detik**, lalu lepaskan begitu bilah persentase pengunggahan (`Writing at 0x00010000... (10%)`) mulai berjalan lancar.  
> *(Catatan: Jangan menekan tombol EN saat proses upload sedang berjalan, karena tombol EN akan merestart board dan membatalkan proses flashing).*

---

## 7. 📖 Glosarium Istilah Penting Modul 0.0

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **Mikrokontroler (MCU)** | Komputer mini hemat daya dalam satu chip terpadu yang dirancang khusus untuk menjalankan satu tugas kontrol secara langsung. |
| **Bare-Metal** | Pola eksekusi program yang berjalan langsung di atas lapisan fisik chip silikon tanpa melalui perantara sistem operasi. |
| **Kompiler (*Compiler*)** | Perangkat lunak di komputer yang menerjemahkan teks kode bahasa manusia (C++) menjadi deretan instruksi biner mesin (`0` dan `1`). |
| **Firmware** | Program biner permanen yang disimpan di dalam memori mikrokontroler untuk mengontrol perilaku perangkat keras. |
| **Flashing / Upload** | Proses menyalin dan menuliskan file biner firmware ke dalam chip memori Flash mikrokontroler. |
| **USB-to-UART Bridge** | Chip penerjemah sinyal antara protokol USB komputer dan protokol serial UART (pin TX/RX) mikrokontroler. |
| **Port COM** | Nomor saluran komunikasi serial virtual yang dialokasikan oleh sistem operasi Windows untuk perangkat USB yang terhubung. |
| **Serial Monitor** | Jendela terminal teks pada komputer untuk melihat data pesan atau telemetri yang dikirimkan oleh mikrokontroler. |
| **GPIO** | *General Purpose Input/Output* — Pin fisik serbaguna pada mikrokontroler yang dapat difungsikan sebagai sakelar output atau sensor input. |
| **SPI Flash** | Chip memori penyimpanan permanen di dalam modul ESP32 tempat firmware tersimpan aman dan tidak akan hilang saat listrik mati. |

---

## 📝 Kuis Refleksi & Uji Pemahaman Mandiri

Uji pemahaman barumu dengan menjawab 4 pertanyaan singkat berikut di benakmu, lalu cocokkan dengan kunci jawaban di bawah:

1. Mengapa ESP32 dapat langsung menyala dan bekerja dalam hitungan sepersekian detik, sedangkan laptop membutuhkan waktu belasan detik untuk proses loading sistem operasi?
2. Saat proses pengunggahan firmware mengalami hambatan dan tertahan di pesan `Connecting........_____`, tombol fisik manakah yang perlu kita tekan dan tahan selama 2 detik?
3. Mengapa teks program pada file `sketch.ino` tidak bisa langsung dikirim mentah-mentah ke dalam chip ESP32 tanpa melalui proses kompilasi terlebih dahulu?
4. Pada lembar kerja simulator Wokwi, tab manakah yang harus kita pilih untuk menyunting kode program: `sketch.ino` atau `diagram.json`?

<details>
<summary>🔍 Klik di Sini untuk Membuka Kunci Jawaban</summary>

1. Karena ESP32 tidak menjalankan sistem operasi berat seperti Windows atau macOS. ESP32 langsung mengeksekusi satu program secara *bare-metal* dari memori flash begitu menerima pasokan daya listrik.
2. Tombol fisik **`BOOT`** (GPIO 0).
3. Karena prosesor silikon hanya mengenali sinyal listrik biner (`0` dan `1`). Teks C++ adalah bahasa tingkat tinggi untuk manusia, sehingga membutuhkan program *kompiler* untuk menerjemahkannya menjadi file biner `.bin`.
4. Tab **`sketch.ino`**. Tab `diagram.json` adalah denah penempatan komponen dan jalur kabel sirkuit virtual, bukan lembar kerja kode program.

</details>

---

## 📚 Sumber Gambar & Atribusi Lisensi

Seluruh materi visual dalam modul ini disajikan dengan mematuhi etika atribusi dan lisensi terbuka:

| Nama Berkas Gambar | Sumber Gambar & Hak Cipta | Jenis Lisensi |
| :--- | :--- | :--- |
| `aset/esp32-devkitc.jpg` | [Ubahnverleih, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg) | [Creative Commons CC0 1.0 (Public Domain)](https://creativecommons.org/publicdomain/zero/1.0/deed.id) |
| `aset/esp32-wroom-32-modul.jpg` | [Brian Krent, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Espressif_ESP-WROOM-32_Wi-Fi_%26_Bluetooth_Module.jpg) | [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/deed.id) |
| `aset/wokwi-esp32-ui.jpg` | Tangkapan layar antarmuka pengguna [Wokwi Simulator](https://wokwi.com), diambil 21 Agustus 2026 | Wokwi adalah merek dagang terdaftar milik [wokwi.com](https://wokwi.com); digunakan sebagai panduan edukasi tombol antarmuka |
| `aset/laptop-vs-mikrokontroler.jpg`, `aset/alur-kode-masuk-chip.jpg`, `aset/anatomi-board-esp32.jpg`, `aset/kabel-data-vs-cas.jpg`, `aset/device-manager-com-port.jpg`, `aset/tombol-en-vs-boot.jpg` | Ilustrasi orisinal kurikulum Fullstack IoT Developer | Hak cipta terbuka untuk materi kurikulum edukasi ini |

---

## 🎯 Status Selesai & Langkah Berikutnya

Jika kamu sudah memahami alur di atas dan berhasil menjalankan simulasi lampu berkedip di Wokwi, selamat! Kamu telah resmi menuntaskan **Modul 0.0**.

Tandai pemahamanmu pada checklist berikut:
- [x] Membuka simulator Wokwi dan melihat pesan `Hello, ESP32!` di Serial Monitor
- [x] Memahami bahwa pesan log sistem saat boot (`mode:DIO` / `load:0x...`) bukan merupakan error
- [x] Mengubah kode program dan berhasil membuat lampu LED GPIO 2 berkedip
- [x] Bereksperimen memodifikasi nilai `delay()` untuk mengatur kecepatan kedipan lampu
- [x] Mampu menjelaskan alur mengapa teks kode C++ harus diterjemahkan oleh kompiler
- [x] Memahami fungsi tombol fisik `EN` dan tombol `BOOT`

Langkah berikutnya, mari kita masuk ke materi fondasi kelistrikan yang sangat intuitif:  
👉 **[Modul 0.1: Dasar Listrik Intuitif — Analogi Air, Hukum Ohm & Resistor LED](01-dasar-listrik-dan-hukum-ohm.md)**

Pantau seluruh perkembangan belajarmu di pelacak progres terpadu: **[TODO.md](../TODO.md)**.
