# Modul 0.0: Perjalanan Ajaib — Bagaimana Ketikan Kode Masuk ke Chip Silikon?

> **Tingkat Kesulitan:** Sangat ramah pemula (*Zero Prerequisite* — belum perlu pengalaman coding sebelumnya)  
> **Estimasi Waktu:** 20–25 menit (membaca materi + mencoba simulasi langsung di browser)  
> **Kebutuhan Hardware Fisik:** Belum wajib. Jika belum memiliki board ESP32 fisik, kamu tetap bisa mengikuti seluruh materi dan simulasi sampai selesai.

---

## 🛠️ Persiapan Awal: Buka Ini Dulu Sebelum Mulai

Agar kamu tidak bingung harus menginstal aplikasi apa terlebih dahulu, modul ini **hanya** membutuhkan alat-alat berikut:

| Status Kebutuhan | Alat / Perangkat | Fungsi & Penjelasan |
| :--- | :--- | :--- |
| **Wajib** | Browser Web (Google Chrome, Microsoft Edge, atau Mozilla Firefox) | Menjalankan simulator sirkuit **Wokwi** dan menguji program langsung di browser. |
| **Opsional** | Board fisik ESP32 + kabel USB **data** | Memeriksa deteksi port COM di Windows Device Manager (boleh dilewati jika belum punya alat). |
| **Belum Perlu** | VS Code, Arduino IDE, atau PlatformIO | Seluruh aplikasi editor ini akan dibahas tuntas pada [Modul 0.6](06-setup-tools-dan-simulator.md). Belum perlu dipasang sekarang. |

> [!TIP]
> **Tautan Simulator Praktik Modul Ini:** [Wokwi ESP32 Starter Project](https://wokwi.com/projects/new/esp32)  
> Kamu tidak perlu mendaftar atau membuat akun. Jika muncul jendela pop-up bertuliskan *Sign up*, kamu bisa langsung mengabaikan atau menutupnya.

---

## ⚡ Tenang, Kamu Tidak Akan Kesetrum!

Sebelum mulai melangkah, mari kita hilangkan rasa cemas yang sering dialami oleh pemula saat pertama kali belajar elektronika:

Mikrokontroler seperti **ESP32** bekerja pada rentang tegangan rendah, yaitu **3,3 volt hingga 5 volt DC** (*Direct Current* / Arus Searah, serupa dengan tegangan baterai kecil). Tegangan sebesar ini **100% aman disentuh dengan jari tangan** dan sama sekali tidak memiliki daya untuk menyengat kulit manusia.

Selain itu, port USB pada laptop dan komputer modern sudah dilengkapi sirkuit pengaman pemutus arus otomatis (*Overcurrent Protection*). Jika terjadi kesalahan rangkaian sekalipun, laptop akan melindungi dirinya sendiri. Jadi, kamu bisa bereksperimen dengan santai dan percaya diri! 😊

> [!NOTE]
> **Arus DC vs AC:** Arus **DC** mengalir satu arah secara stabil (seperti pada baterai dan kabel USB). Sedangkan arus **AC** (*Alternating Current*) adalah listrik bertegangan tinggi 220 volt dari stopkontak dinding PLN yang arah arusnya bolak-balik. Pada modul ini, kita murni hanya mempelajari arus DC tegangan rendah yang aman.

---

## 🧭 Peta Pembelajaran Modul Ini

Berikut adalah alur perjalanan belajar kita di modul ini:

1. **Kemenangan Cepat (Quick Win):** Menjalankan simulasi program pertama di browser dalam 3 menit.
2. **Laptop vs Mikrokontroler:** Memahami mengapa ESP32 tidak membutuhkan sistem operasi Windows.
3. **Pipa Perjalanan Kode:** Menelusuri bagaimana teks C++ diubah menjadi denyut listrik di dalam chip.
4. **Mengenal Bagian Fisik Board ESP32:** Membedakan modul utama, tombol, dan lampu indikator.
5. **Praktik Windows (Opsional):** Memeriksa deteksi port COM di Device Manager.
6. **Misteri Tombol Fisik:** Kapan harus menekan tombol **EN** (Reset) dan tombol **BOOT**.
7. **Glosarium Istilah & Kuis Refleksi.**

---

## 1. Kemenangan Cepat: Menyalakan Lampu di Browser (3 Menit)

Kita akan menggunakan **Wokwi**, sebuah simulator mikrokontroler interaktif yang berjalan langsung di browser. Anggap Wokwi ini sebagai *laboratorium virtual*: kode program yang kita tulis adalah kode nyata, hanya bentuk fisiknya saja yang disimulasikan di layar.

### Langkah 1 — Membuka Lembar Kerja Simulasi

1. Buka tautan berikut di browser kamu: **[https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)**
2. Tunggu beberapa detik hingga layar terbagi menjadi dua bagian:
   - **Sisi Kiri (Editor Kode):** Tempat menulis program. Pastikan tab yang terbuka aktif adalah **`sketch.ino`**.
   - **Sisi Kanan (Diagram Sirkuit):** Menampilkan gambar virtual board ESP32.
3. Tepat di sebelah tab `sketch.ino`, terdapat tab **`diagram.json`**. Tab ini berisi denah tata letak komponen sirkuit (bukan kode C++). Biarkan tab tersebut apa adanya dan jangan diubah.

Saat lembar kerja baru terbuka, kotak teks **Serial Monitor** di bawah gambar board masih kosong. Tombol hijau **Play (Start the simulation)** berada di sudut kanan atas area diagram board.

Kode program bawaan dari Wokwi tampak seperti ini:

```cpp
void setup() {
  // Bagian ini dijalankan SATU KALI saat ESP32 pertama kali dinyalakan
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
}

void loop() {
  // Bagian ini dijalankan BERULANG-ULANG tanpa henti
  delay(10); // Jeda singkat 10 milidetik agar simulasi berjalan ringan
}
```

---

### Langkah 2 — Menguji Kode Program Bawaan

1. Di panel sebelah kanan, klik tombol hijau **Start the simulation** (ikon Play ▶).
2. Perhatikan kotak putih bertuliskan **Serial** di bagian bawah gambar board ESP32.
3. Begitu proses booting simulasi selesai, baris teks paling bawah akan menampilkan tulisan: `Hello, ESP32!`

![Tampilan Wokwi: editor sketch.ino di kiri, tombol Play hijau, board ESP32, dan Serial Hello ESP32](aset/wokwi-esp32-ui.jpg)

*Tangkapan layar antarmuka [Wokwi Simulator](https://wokwi.com/projects/new/esp32). Tombol Sign up di sudut kanan atas dapat diabaikan.*

**Cara membaca tampilan tersebut:**
- **Tab `sketch.ino` (Kiri):** Tempat kita mengetik baris perintah program.
- **Tombol Hijau Play (Kanan Atas):** Menyalakan aliran listrik ke board virtual.
- **Gambar Board ESP32 (Kanan):** Representasi perangkat keras virtual.
- **Kotak Putih Serial (Bawah):** Jendela komunikasi teks yang menampilkan pesan yang dikirimkan oleh ESP32 ke komputer kita.

> [!NOTE]
> Baris teks teknis seperti `ets Jul...`, `mode:DIO`, atau `load:0x3fff...` yang muncul sesaat di awal **bukanlah pesan error**. Itu adalah log sistem internal saat prosesor ESP32 baru pertama kali terbangun (*booting*). Cukup perhatikan baris paling bawah yang bertuliskan `Hello, ESP32!`.

Saat simulasi sedang berjalan aktif, tombol hijau Play akan berubah menjadi tombol merah bertuliskan **Stop**. Selalu klik tombol **Stop** terlebih dahulu sebelum mengubah kode program.

---

### Langkah 3 — Mengubah Program Menjadi Kedip Lampu LED

Sekarang, mari kita buat lampu LED pada board berkedip:

1. Klik tab **`sketch.ino`** di panel kiri.
2. Hapus seluruh isi teks yang lama (tekan `Ctrl + A` lalu hapus), kemudian tempelkan (*paste*) kode program berikut:

```cpp
void setup() {
  // Atur pin GPIO 2 (terhubung ke lampu LED onboard) sebagai pengirim sinyal (OUTPUT)
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);  // Kirim aliran sinyal 3.3V: Lampu LED MENYALA
  delay(1000);            // Tahan kondisi selama 1000 milidetik (1 detik)
  digitalWrite(2, LOW);   // Putus aliran sinyal menjadi 0V: Lampu LED PADAM
  delay(1000);            // Tahan kondisi padam selama 1 detik, lalu ulangi dari awal
}
```

3. Klik tombol hijau **Start the simulation** kembali.
4. **Lihat hasilnya:** Lampu LED biru kecil pada gambar board ESP32 virtual akan mulai berkedip secara teratur setiap satu detik! 🎉

---

### Langkah 4 — Tantangan Eksperimen Mandiri (*Predict & Modify*)

Sebelum menekan tombol Play, coba latih intuisi analisismu:  
*Jika angka `1000` pada fungsi `delay()` kita ganti menjadi angka `100`, apakah kedipan lampu akan menjadi lebih cepat atau lebih lambat?*

Mari kita buktikan:
1. Klik tombol **Stop**.
2. Ubah kedua baris `delay(1000);` menjadi `delay(100);`.
3. Klik tombol **Start the simulation** lagi.
4. **Hasilnya:** Lampu LED kini berkedip sepuluh kali lebih cepat menyerupai lampu strobo!

Jika kamu ingin bereksperimen dengan ritme kedipanmu sendiri, isi angka milidetik sesuai keinginanmu (ingat: 1 detik = 1000 milidetik):

```cpp
void loop() {
  digitalWrite(2, HIGH);
  delay(500);   // Ganti angka ini untuk mengatur durasi menyala (contoh: 500 ms)
  digitalWrite(2, LOW);
  delay(200);   // Ganti angka ini untuk mengatur durasi padam (contoh: 200 ms)
}
```

> [!WARNING]
> **Panduan Jika Lampu Tidak Berkedip:**
> 1. Pastikan tab yang kamu edit adalah **`sketch.ino`**, bukan `diagram.json`.
> 2. Pastikan kamu sudah menekan tombol **Stop**, kemudian menekan tombol **Start the simulation** kembali setelah mengedit kode.
> 3. Pastikan nomor pin yang kamu tulis adalah angka `2` (karena lampu LED bawaan pada board virtual Wokwi terhubung ke pin GPIO 2).
> 4. Jika halaman web terasa macet, cukup muat ulang (*refresh*) browser kamu dan buka kembali tautan proyek.

---

## 2. Laptop vs Mikrokontroler: Kenapa ESP32 Tidak Butuh Windows?

Pernahkah kamu bertanya-tanya: *Mengapa saat laptop dinyalakan kita harus menunggu belasan detik untuk proses loading Windows atau macOS, sedangkan ESP32 langsung bekerja seketika dalam hitungan kurang dari 0,05 detik begitu diberi listrik?*

Perbedaan mendasar ini terletak pada tujuan perancangan perangkat:

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

*Ilustrasi perbandingan arsitektur sistem: ESP32 mengeksekusi satu program secara langsung tanpa lapisan sistem operasi berat.*

Di dalam ESP32, tidak ada desktop grafis, tidak ada aplikasi office, dan tidak ada pemutar video. Program yang kamu tulis akan dieksekusi secara **langsung di atas lapisan fisik silikon prosesor**. Istilah teknis untuk metode ini disebut **Bare-Metal Execution** (eksekusi langsung tanpa perantara sistem operasi).

**Analogi Sederhana:**  
Laptop seperti sebuah **Pusat Perbelanjaan Megah**: ada banyak gerai toko di dalamnya, pintu utama harus dibuka dulu, eskalator harus dinyalakan, dan petugas keamanan harus berjaga sebelum pengunjung bisa berbelanja.  
Sedangkan ESP32 seperti **Sakelar Lampu Senter di Tangan**: begitu tombol digeser, listrik langsung mengalir ke bohlam seketika tanpa antre!

---

## 3. Pipa Perjalanan Kode: Dari Teks C++ ke Chip Flash

Prosesor silikon pada ESP32 **sama sekali tidak mengerti huruf atau kata bahasa Inggris** seperti `digitalWrite`, `pinMode`, atau `OUTPUT`. 

Di dalam prosesor, hanya terdapat jutaan sakelar mikroskopis (*transistor*) yang hanya mengenali dua kondisi fisik: **Ada Aliran Listrik (Angka 1)** atau **Tidak Ada Aliran Listrik (Angka 0)**.

Lalu, bagaimana ketikan teks program di laptop bisa dimengerti oleh chip ESP32? Mari kita pelajari alur perjalanannya:

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

*Ilustrasi enam tahapan perjalanan kode dari editor teks di komputer hingga tersimpan permanen di memori flash ESP32.*

### Penjelasan 6 Tahapan Alur:

1. **Kode Sumber (*Source Code* - `main.cpp` / `sketch.ino`):**  
   File dokumen teks tempat kamu menuliskan logika instruksi dalam bahasa C++. Dokumen ini mudah dibaca dan dipahami oleh manusia.
2. **Kompiler (*Compiler* - `xtensa-esp32-elf-gcc`):**  
   Program khusus di komputer yang bertugas menerjemahkan teks C++ menjadi kumpulan instruksi bahasa mesin berupa angka biner (`0` dan `1`).
3. **File Biner (*Binary Firmware* - `firmware.bin`):**  
   File hasil akhir proses kompilasi yang berisi kode mesin murni yang siap dikirimkan ke mikrokontroler.
4. **Program Flasher Utility (*esptool.py*):**  
   Program pengirim data yang memecah file biner menjadi paket-paket kecil dan menyuntikkannya melalui jalur kabel USB.
5. **Chip USB-to-UART Bridge (CP2102 / CH340):**  
   Chip hitam kecil di dekat colokan USB board. Laptop berkomunikasi menggunakan protokol USB berkecepatan tinggi, sedangkan prosesor ESP32 berkomunikasi menggunakan protokol serial sederhana (**TX/RX**). Chip ini bertindak sebagai *penerjemah bahasa sinyal* antara USB laptop dan prosesor ESP32.
6. **Memori SPI Flash & CPU:**  
   Memori Flash adalah "penyimpanan permanen" (biasanya berukuran 4 Megabyte) di dalam modul ESP32. Program yang tersimpan di sini **tidak akan hilang meskipun kabel listrik dicabut**. Saat diberi daya, prosesor (CPU) akan membaca instruksi dari memori Flash ini dan mengeksekusinya baris demi baris.

<details>
<summary>🔬 Ingin Tahu Lebih Dalam: Mengapa Kompiler ESP32 Memiliki Nama Khusus?</summary>

Prosesor pada laptop kamu umumnya menggunakan arsitektur Intel atau AMD (x86_64), sedangkan chip ESP32 klasik menggunakan arsitektur prosesor bernama **Xtensa LX6**. 

Karena struktur internal kedua prosesor ini berbeda, kita membutuhkan kompiler penerjemah silang (*Cross-Compiler*) khusus bernama `xtensa-esp32-elf-gcc`. 

**Analoginya:** Kamus penerjemah bahasa Indonesia ke bahasa Inggris tidak bisa dipakai untuk menerjemahkan ke bahasa Jepang. Setiap jenis prosesor memiliki "kamus bahasa mesin" uniknya masing-masing. Di [Modul 0.6](06-setup-tools-dan-simulator.md), aplikasi PlatformIO akan mengunduh dan menyiapkan seluruh perlengkapan kompiler ini secara otomatis untukmu.

</details>

---

## 4. Mengenal Bagian Fisik Board ESP32

Jika kamu memegang board fisik **ESP32 DevKit**, berikut adalah komponen-komponen utama yang perlu kamu kenali:

![Foto board ESP32 DevKit dengan modul ESP-WROOM-32, tombol EN/BOOT, dan colokan USB](aset/esp32-devkitc.jpg)

*Foto fisik board ESP32 DevKit. Sumber: Ubahnverleih, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg), Lisensi [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.id).*

Agar lebih mudah dipahami, perhatikan peta visual berikut:

![Ilustrasi anatomi board ESP32: antena, modul WROOM, LED, USB-to-UART, tombol EN dan BOOT](aset/anatomi-board-esp32.jpg)

*Peta tata letak komponen penting pada board ESP32 DevKit.*

### Fungsi Komponen Kunci pada Board:

- **Pelindung Logam ESP-WROOM-32 (*Metal Shielding*):**  
  Kaleng pelindung persegi di bagian tengah board. Di dalamnya terdapat prosesor Dual-Core, sirkuit radio Wi-Fi/Bluetooth, dan chip memori SPI Flash. Pelindung ini berfungsi meredam interferensi gelombang elektromagnetik dari luar.
- **Chip USB-to-UART Bridge:**  
  Kotak hitam kecil di dekat colokan USB (biasanya bertipe CP2102 atau CH340) yang menjembatani komunikasi data antara laptop dan ESP32.
- **Lampu Indikator Daya (Power LED - Merah):**  
  Menyala stabil saat board menerima pasokan daya listrik dengan baik.
- **Lampu LED Pengguna (Onboard LED pada GPIO 2 - Biru):**  
  Lampu LED bawaan yang terhubung ke pin GPIO 2. Lampu ini bisa langsung kita program untuk berkedip tanpa perlu memasang kabel tambahan di breadboard.
- **Tombol EN (*Enable* / Reset):**  
  Berfungsi me-restart sistem ESP32 dari baris awal program.
- **Tombol BOOT (GPIO 0 / Download Mode):**  
  Berfungsi mengatur prosesor agar masuk ke mode penerimaan file firmware baru saat proses flashing.

<details>
<summary>🔬 Ingin Melihat Komponen di Balik Pelindung Logam? (Informasi Tambahan)</summary>

Foto di bawah ini memperlihatkan isi bagian dalam modul ESP-WROOM-32 setelah pelindung logamnya dibuka di laboratorium. Kamu bisa melihat langsung chip prosesor silikon dan chip memori flash yang berdampingan:

![Isi modul ESP-WROOM-32: CPU ESP32 di tengah, chip flash di samping, antena PCB di kiri](aset/esp32-wroom-32-modul.jpg)

*Foto isi dalam modul ESP-WROOM-32. Sumber: Brian Krent, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Espressif_ESP-WROOM-32_Wi-Fi_%26_Bluetooth_Module.jpg), Lisensi [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.id).*

**Keterangan Bagian:**
1. **Pola Jalur Tembaga Berliku (Kiri):** Antena pemancar dan penerima sinyal Wi-Fi 2.4 GHz serta Bluetooth.
2. **Kotak Hitam Besar di Tengah (`ESP32-D0WDQ6`):** Prosesor utama (CPU) yang bertugas mengeksekusi kode programmu.
3. **Kotak Hitam Kecil di Samping CPU (`25Q32...`):** Chip memori SPI Flash tempat file biner programmu disimpan permanen.

</details>

---

## 5. Praktik Windows: Memeriksa Port COM di Device Manager (Opsional)

> [!NOTE]
> Bagian ini **hanya dipraktikkan jika kamu sudah memiliki board fisik ESP32**. Jika saat ini kamu baru belajar menggunakan simulator Wokwi, kamu boleh membaca sekilas lalu melanjutkan ke [Bagian 6](#6-dua-tombol-fisik-tombol-en-vs-tombol-boot).

Ketika ESP32 dihubungkan ke komputer melalui kabel USB, Windows harus mengenali board tersebut sebagai sebuah **Port COM Virtual (*Virtual Communication Port*)**. Port COM ini berfungsi sebagai pintu saluran pengiriman program dari laptop ke ESP32.

### Langkah 1: Memastikan Tipe Kabel USB
Pastikan kabel USB yang kamu gunakan adalah **kabel data** (kabel 4 kawat: daya dan data), bukan kabel charger murahan yang hanya memiliki 2 kawat daya tanpa jalur transfer data.

![Perbedaan kabel USB data (4 kawat) dan kabel cas saja (2 kawat)](aset/kabel-data-vs-cas.jpg)

*Perbedaan fisik kabel USB data (4 jalur kabel internal) vs kabel charger biasa (hanya 2 jalur daya).*

---

### Langkah 2: Memeriksa Device Manager di Windows
1. Hubungkan board ESP32 ke port USB laptop. Lampu LED merah (Power) pada board akan menyala.
2. Tekan tombol kombinasi **`Windows + X`** pada keyboard, lalu pilih dan klik **Device Manager**.
3. Cari dan klik tanda panah `>` di sebelah menu **Ports (COM & LPT)**.

![Ilustrasi Device Manager dengan port COM yang dicari](aset/device-manager-com-port.jpg)

*Tampilan jendela Device Manager saat port COM berhasil terdeteksi.*

Pada daftar tersebut, kamu akan melihat salah satu dari nama perangkat berikut:
- `Silicon Labs CP210x USB to UART Bridge (COM3)`
- `USB-SERIAL CH340 (COM4)`

*(Nomor COM di setiap komputer bisa berbeda-beda, misalnya COM3, COM5, COM7, dll. Catat nomor COM yang muncul di komputermu).*

---

### 🚨 Kotak Bantuan: "Bagaimana Jika Menu Ports (COM & LPT) Tidak Muncul?"

> [!WARNING]
> **Penyebab dan Solusi Penanganan:**
> 1. **Kabel Hanya Kabel Charger:** Lampu merah di board tetap menyala, tetapi komputer tidak mendeteksi perangkat data baru. **Solusi:** Ganti kabel dengan kabel data smartphone yang berkualitas baik.
> 2. **Driver Belum Terpasang:** Pada menu *Other devices*, muncul perangkat bertanda seru kuning `⚠️ USB2.0-Serial`. Ini menandakan Windows belum memiliki driver penerjemah chip USB tersebut.
>    - Unduh Driver Resmi CP2102: **[Silicon Labs CP210x VCP Driver](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)**
>    - Unduh Driver Resmi CH340: **[WCH CH341SER Official Driver](http://www.wch-ic.com/downloads/CH341SER_EXE.html)**
>    *(Unduh file installer, jalankan proses instalasi, lalu cabut dan colokkan kembali kabel USB ESP32 kamu).*

---

## 6. Dua Tombol Fisik: Tombol EN vs Tombol BOOT

Pada board ESP32 fisik, terdapat dua tombol kecil di samping colokan USB yang memiliki fungsi sangat berbeda:

![Perbandingan tombol EN sebagai restart dan tombol BOOT sebagai mode terima program](aset/tombol-en-vs-boot.jpg)

*Perbedaan peran tombol EN (Reset eksekusi) dan tombol BOOT (Mode download firmware).*

| Nama Tombol | Analogi Sederhana | Fungsi dan Perilaku Nyata |
| :--- | :--- | :--- |
| **Tombol EN** (*Enable / Reset*) | Tombol restart pada laptop/smartphone | Memutus daya sesaat untuk memulai ulang eksekusi program yang **sudah tersimpan** dari baris paling awal. |
| **Tombol BOOT** (*GPIO 0 / Download Mode*) | Mode penerimaan paket firmware baru | Menginstruksikan prosesor: *"Tunda eksekusi program lama, bersiaplah menerima file biner firmware baru dari kabel USB!"* |

---

### 💡 Trik Mengatasi Masalah Upload Paling Populer

Pada beberapa varian board ESP32 tertentu, sirkuit pengatur mode unduh otomatis (*Auto-Reset Circuit*) memiliki toleransi kapasitor yang kurang presisi. 

Jika kelak saat proses pengunggahan kode di VS Code atau Arduino IDE muncul pesan yang terhenti seperti ini:
```text
Connecting........_____....._____....._____
```

> [!TIP]
> **Solusi Cepat:**  
> Begitu tulisan `Connecting........_____` mulai muncul di layar, **segera tekan dan tahan tombol fisik `BOOT` selama kurang lebih 2 detik**, lalu lepaskan begitu bilah persentase pengunggahan (`Writing at 0x00010000... (10%)`) mulai berjalan lancar.  
> *(Jangan menekan tombol EN saat proses upload berlangsung, karena tombol EN akan merestart board dan membatalkan proses flashing).*

---

## 7. 📖 Glosarium Istilah Penting Modul 0.0

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **Mikrokontroler (MCU)** | Komputer mini satu chip berkekuatan hemat daya yang dirancang khusus untuk menjalankan satu tugas kontrol secara langsung. |
| **Bare-Metal** | Pola eksekusi program yang berjalan langsung di atas lapisan perangkat keras silikon tanpa perantara sistem operasi. |
| **Kompiler (*Compiler*)** | Perangkat lunak yang menerjemahkan teks kode bahasa tingkat tinggi (C++) menjadi instruksi biner mesin (`0` dan `1`). |
| **Firmware** | Program biner permanen yang disimpan di dalam chip memori mikrokontroler untuk mengontrol fungsi perangkat keras. |
| **Flashing / Upload** | Proses menyalin dan menyuntikkan file firmware biner ke dalam chip memori Flash mikrokontroler. |
| **USB-to-UART Bridge** | Chip penerjemah sinyal antara protokol USB komputer dan protokol serial UART (pin TX/RX) mikrokontroler. |
| **Port COM** | Nomor saluran komunikasi serial virtual yang dialokasikan oleh sistem operasi Windows untuk perangkat USB yang terhubung. |
| **Serial Monitor** | Jendela terminal teks untuk melihat data telemetri yang dikirimkan oleh mikrokontroler ke komputer laptop. |
| **GPIO** | *General Purpose Input/Output* — Pin fisik serbaguna yang dapat difungsikan sebagai sakelar output atau sensor input. |
| **SPI Flash** | Chip memori penyimpanan permanen tempat firmware disimpan dan tidak akan terhapus meskipun aliran listrik mati. |

---

## 📝 Kuis Refleksi & Uji Pemahaman Mandiri

Uji pemahamanmu dengan menjawab 4 pertanyaan singkat berikut di benakmu, lalu cocokkan dengan kunci jawaban di bawah:

1. Mengapa ESP32 dapat langsung menyala dan mulai bekerja dalam sepersekian detik, sedangkan laptop membutuhkan proses loading sistem operasi belasan detik?
2. Saat proses pengunggahan firmware mengalami kendala dan terhenti di pesan `Connecting........_____`, tombol fisik manakah yang perlu kita tekan dan tahan selama 2 detik?
3. Mengapa teks program pada file `sketch.ino` tidak bisa langsung disalin mentah-mentah ke dalam chip ESP32 tanpa melalui proses kompilasi terlebih dahulu?
4. Pada lembar kerja simulator Wokwi, tab manakah yang harus kita pilih untuk menyunting kode program: `sketch.ino` atau `diagram.json`?

<details>
<summary>🔍 Klik di Sini untuk Melihat Kunci Jawaban</summary>

1. Karena ESP32 tidak menjalankan sistem operasi berat seperti Windows atau macOS. ESP32 langsung mengeksekusi satu program secara *bare-metal* dari memori flash begitu menerima daya listrik.
2. Tombol fisik **`BOOT`** (GPIO 0).
3. Karena prosesor silikon hanya mengenali instruksi listrik biner (`0` dan `1`). Teks C++ adalah bahasa tingkat tinggi untuk manusia, sehingga membutuhkan program *kompiler* untuk menerjemahkannya menjadi file biner `.bin`.
4. Tab **`sketch.ino`**. Tab `diagram.json` adalah denah penempatan komponen dan jalur kabel sirkuit virtual, bukan tempat menulis kode program.

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

Jika kamu sudah memahami konsep di atas dan berhasil menjalankan simulasi lampu berkedip di Wokwi, selamat! Kamu telah resmi menyelesaikan **Modul 0.0**.

Tandai pemahamanmu pada checklist berikut:
- [x] Membuka simulator Wokwi dan melihat pesan `Hello, ESP32!` di Serial Monitor
- [x] Memahami bahwa pesan log sistem saat boot (`mode:DIO` / `load:0x...`) bukan merupakan error
- [x] Mengubah kode program dan berhasil membuat lampu LED GPIO 2 berkedip
- [x] Bereksperimen memodifikasi nilai `delay()` untuk mengubah kecepatan kedipan lampu
- [x] Mampu menjelaskan alur mengapa teks kode C++ harus diterjemahkan oleh kompiler
- [x] Memahami fungsi tombol fisik `EN` dan tombol `BOOT`

Langkah berikutnya, mari kita masuk ke materi fondasi kelistrikan yang sangat intuitif:  
👉 **[Modul 0.1: Dasar Listrik Intuitif — Analogi Air, Hukum Ohm & Resistor LED](01-dasar-listrik-dan-hukum-ohm.md)**

Pantau seluruh perkembangan belajarmu di pelacak progres terpadu: **[TODO.md](../TODO.md)**.
