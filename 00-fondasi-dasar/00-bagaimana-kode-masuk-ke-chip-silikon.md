# Modul 0.0: Perjalanan Ajaib — Bagaimana Ketikan Kode Masuk ke Chip Silikon?

> **Tingkat kesulitan:** Sangat ramah pemula (belum perlu pengalaman coding)  
> **Perkiraan waktu:** 20–25 menit (baca + praktik di browser)  
> **Board fisik:** Belum wajib. Kalau ESP32-mu belum sampai, tetap bisa ikut sampai akhir.

---

## Buka ini dulu, baru mulai

Biar tidak bingung “harus instal apa dulu”, modul ini cukup pakai alat di bawah. Yang lain **belum** diperlukan.

| Perlu sekarang? | Alat | Untuk apa |
| :--- | :--- | :--- |
| **Wajib** | Browser Chrome, Edge, atau Firefox | Menjalankan simulator **Wokwi** dan mengetes kode |
| **Opsional** | Board ESP32 + kabel USB **data** | Melihat port COM di Windows. Boleh dilewati |
| **Belum perlu** | VS Code, Arduino IDE, PlatformIO | Itu urusan [Modul 0.6](README.md). Jangan instal dulu kalau belum siap |

> [!TIP]
> **Satu-satunya tautan praktik di modul ini:** [Wokwi ESP32 Project Baru](https://wokwi.com/projects/new/esp32)  
> Tidak perlu daftar akun. Kalau muncul tombol **Sign up**, abaikan saja.

---

## Tenang, kamu tidak akan kesetrum

Mikrokontroler seperti **ESP32** bekerja di tegangan **3,3 volt sampai 5 volt DC** (arus searah, seperti baterai). Tegangan sekecil itu aman disentuh jari.

Port USB laptop modern juga punya pengaman: kalau arus terlalu besar, aliran listrik diputus otomatis. Jadi, boleh bereksperimen dengan santai.

> [!NOTE]
> **DC** artinya arus mengalir satu arah (baterai, USB). **AC** adalah listrik rumah 220 volt yang bolak-balik. Kita **tidak** menyentuh listrik rumah di modul ini.

---

## Peta singkat modul ini

1. Praktik 3 menit di Wokwi (lihat hasil dulu, teori belakangan).
2. Kenapa ESP32 tidak butuh Windows.
3. Perjalanan kode: dari teks C++ sampai masuk chip.
4. Mengenal bagian fisik board ESP32.
5. (Opsional) Cek port COM di Windows.
6. Tombol **EN** vs tombol **BOOT**.
7. Glosarium, kuis, dan langkah berikutnya.

---

## 1. Kemenangan cepat: nyalakan lampu di browser

Kita pakai **Wokwi**, simulator ESP32 di browser. Bayangkan ini sebagai “papan latihan virtual”: kodenya nyata, board-nya gambar, tapi logikanya sama dengan alat fisik.

### Langkah 1 — Buka proyek

1. Buka tautan ini: [https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)
2. Tunggu beberapa detik sampai layar terbelah:
   - **Kiri:** editor kode. Pastikan tab **`sketch.ino`** yang aktif. Itu file program.
   - **Kanan:** gambar board ESP32.
3. Ada juga tab **`diagram.json`**. Itu **bukan** kode C++. Isinya denah rangkaian. Jangan diubah dulu.

Tampilan yang kamu tuju kira-kira seperti ini:

![Tampilan Wokwi: editor sketch.ino di kiri, tombol Play hijau, board ESP32, dan Serial Hello ESP32](aset/wokwi-esp32-ui.jpg)

*Tangkapan layar [Wokwi Simulator](https://wokwi.com/projects/new/esp32), diambil 21 Agustus 2026. Wokwi adalah merek milik [wokwi.com](https://wokwi.com). Tombol **Sign up** di kanan atas boleh diabaikan.*

Cara baca layar itu, dari kiri ke kanan:

1. Tab **`sketch.ino`** — tempat mengetik program.
2. Tombol hijau **Play** — menyalakan simulasi.
3. Gambar board ESP32 — “chip virtual”-nya.
4. Kotak putih di bawah board — **Serial** (percakapan teks). Kalau berhasil, paling bawah ada `Hello, ESP32!`

Kode bawaan Wokwi kira-kira seperti ini (bukan program kedip lampu):

```cpp
void setup() {
  // Dijalankan sekali saat chip baru nyala
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
}

void loop() {
  // Dijalankan berulang-ulang
  delay(10); // jeda kecil biar simulasi tidak berat
}
```

### Langkah 2 — Tes dulu kode bawaan

1. Di panel kanan, klik tombol hijau **Start the simulation** (ikon Play).
2. Lihat kotak putih **Serial** di bawah gambar board.
3. Kalau berhasil, paling bawah muncul `Hello, ESP32!`

> [!NOTE]
> Tulisan aneh seperti `ets Jul`, `mode:DIO`, atau `load:0x3fff...` itu **bukan error**. Itu log “chip baru bangun tidur”. Yang kamu cari cuma baris `Hello, ESP32!`.

Itu percakapan teks antara chip dan laptop. Lampu belum berkedip — wajar, karena kodenya memang belum menyuruh lampu menyala.

Kalau simulasi sedang berjalan, tombol hijau berubah jadi **Stop**. Klik Stop dulu sebelum mengganti kode.

### Langkah 3 — Ganti jadi kedip lampu

1. Klik tab **`sketch.ino`**.
2. Pilih semua teks lama (`Ctrl + A`), lalu tempel kode ini:

```cpp
void setup() {
  // Pin 2 dipakai sebagai sakelar lampu LED onboard
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);  // Kirim listrik: lampu NYALA
  delay(1000);            // Diam 1000 milidetik = 1 detik
  digitalWrite(2, LOW);   // Putus listrik: lampu MATI
  delay(1000);            // Diam 1 detik, lalu ulang dari atas
}
```

3. Klik **Start the simulation** lagi.
4. Perhatikan LED kecil di board virtual. Ia harus berkedip kira-kira sekali per detik.

### Langkah 4 — Tebak, lalu buktikan

Sebelum klik Play, tebak dulu: kalau `1000` diganti `100`, lampunya lebih cepat atau lebih lambat?

Ubah kedua `delay(1000)` menjadi `delay(100)`, Stop, lalu Play lagi. Kedipnya kira-kira 10 kali lebih cepat.

Kalau sudah berani, coba isi sendiri angka jedanya (satu detik = 1000 milidetik):

```cpp
void loop() {
  digitalWrite(2, HIGH);
  delay(____);  // isi: berapa milidetik untuk 1 detik?
  digitalWrite(2, LOW);
  delay(____);  // isi angka yang sama
}
```

> [!WARNING]
> **Kalau lampu tidak berkedip**
> 1. Pastikan tab yang disunting adalah `sketch.ino`, bukan `diagram.json`.
> 2. Pastikan kamu menekan **Stop**, baru **Start** lagi setelah kode diganti.
> 3. Pastikan angka pin-nya `2` (LED bawaan board Wokwi ada di GPIO 2).
> 4. Kalau halaman kosong, refresh browser lalu ulangi dari tautan yang sama.

Tidak perlu VS Code di langkah ini. Kalau Wokwi sudah berkedip, fondasi “kode bisa menggerakkan chip” sudah kamu pegang.

---

## 2. Laptop vs mikrokontroler: kenapa ESP32 tidak butuh Windows?

Pernah kepikiran: laptop butuh belasan detik menunggu Windows. ESP32 diberi listrik, langsung kerja dalam sepersekian detik. Kenapa?

**Laptop** adalah komputer serbaguna. Ia harus menghidupkan sistem operasi dulu, baru bisa buka banyak aplikasi.

**Mikrokontroler (MCU)** seperti ESP32 lebih mirip mesin cuci: satu tugas utama, langsung jalan begitu ada listrik. Tidak ada desktop, tidak ada YouTube di dalamnya.

![Perbandingan laptop dan mikrokontroler ESP32](aset/laptop-vs-mikrokontroler.jpg)

*Ilustrasi orisinal kurikulum ini. Intinya: ESP32 menjalankan **satu** program, tanpa antre Windows.*

Di ESP32, programmu dieksekusi langsung di silikon. Istilah kerennya **bare-metal**: tanpa OS berat sebagai perantara.

Analogi gampangnya: laptop itu mal lengkap (banyak toko, harus buka pintu mal dulu). ESP32 itu warung kopi — buka rana, langsung seduh.

---

## 3. Perjalanan kode: dari teks C++ ke chip flash

Chip silikon **tidak mengerti** kata `digitalWrite` atau `HIGH`. Di dalamnya hanya ada jutaan sakelar mikroskopis (transistor) yang kenal dua keadaan: ada listrik (**1**) atau tidak ada (**0**).

Jadi, teks yang kamu ketik harus **diterjemahkan** dulu, lalu **dikirim**, lalu **disimpan**.

Analogi pos:

1. Kamu menulis surat dalam bahasa Indonesia (kode C++).
2. Penerjemah mengubahnya ke bahasa yang dipahami mesin (kompiler).
3. Surat dimasukkan amplop (file `.bin`).
4. Kurir mengantar lewat jalan USB (kabel data).
5. Petugas di ujung jalan mengubah “bahasa USB” menjadi “bahasa serial” (chip USB-to-UART).
6. Surat disimpan di laci tahan mati lampu (memori flash), lalu dibaca oleh otak chip (CPU).

![Enam langkah perjalanan kode dari laptop ke ESP32](aset/alur-kode-masuk-chip.jpg)

*Ilustrasi orisinal kurikulum ini. Colokan USB di board nyata bisa micro-USB atau USB-C. Kotak nomor 5 di DevKit adalah **chip hitam kecil dekat USB**, bukan modul terpisah.*

### Bedah langkah demi langkah

1. **Kode sumber (`sketch.ino` / `main.cpp`)**  
   File teks tempat kamu menulis logika. Masih bisa dibaca manusia.

2. **Kompiler**  
   Program di laptop yang menerjemahkan C++ menjadi instruksi `0` dan `1`. Nama teknisnya sering `xtensa-esp32-elf-gcc`. Tidak perlu dihafal sekarang; yang penting: tanpa langkah ini, chip buta huruf.

3. **File biner (`firmware.bin`)**  
   Hasil terjemahan. Sudah bukan teks biasa. Siap dikirim ke board.

4. **Program pengirim (`esptool`)**  
   Memecah file jadi paket kecil, lalu mengirimnya lewat USB. Di Arduino IDE / PlatformIO, langkah ini tersembunyi di balik tombol Upload.

5. **Chip USB-to-UART**  
   Chip kecil dekat colokan USB (sering **CP2102** atau **CH340**). Laptop bicara USB; ESP32 bicara serial **TX/RX**. Chip ini penerjemahnya.

6. **Memori flash + CPU**  
   Flash adalah “hard disk mini” (sering 4 MB) di dalam modul. Listrik mati, program tidak hilang. CPU kemudian menjalankan isinya, baris demi baris.

<details>
<summary>Mau lebih dalam: kenapa kompiler ESP32 namanya aneh?</summary>

CPU ESP32 klasik memakai arsitektur **Xtensa**, bukan Intel/AMD di laptopmu. Makanya kompiler khususnya bernama `xtensa-esp32-elf-gcc`. Analoginya: kamus Inggris–Jawa tidak bisa dipakai untuk menerjemahkan ke bahasa Jepang. Chip berbeda, kamus (kompiler) juga berbeda. Di Modul 0.6, PlatformIO yang akan menyiapkan kamus ini otomatis.

</details>

---

## 4. Mengenal bagian fisik board ESP32

Board yang sering dipakai pemula bernama **ESP32 DevKit**. Warna PCB, merek, dan colokan USB-mu bisa berbeda (micro-USB atau USB-C). Yang perlu dikenali tetap bagian-bagian yang sama.

![Foto board ESP32 DevKit dengan modul ESP-WROOM-32, tombol EN/BOOT, dan colokan USB](aset/esp32-devkitc.jpg)

*Foto: Ubahnverleih, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.id). Board kamu boleh beda warna, bagian utamanya sama.*

Biar lebih gampang diingat, lihat peta bergambar ini:

![Ilustrasi anatomi board ESP32: antena, modul WROOM, LED, USB-to-UART, tombol EN dan BOOT](aset/anatomi-board-esp32.jpg)

*Ilustrasi orisinal kurikulum ini. Pakai sebagai peta, bukan foto produk tertentu. Di board nyata colokan USB sering di tepi kiri; di peta ini USB ditaruh di tengah supaya label muat.*

Yang wajib kamu kenali:

- **Kaleng perak ESP-WROOM-32** — “otak” board. Di dalamnya ada CPU, radio Wi-Fi/Bluetooth, dan chip flash. **Jangan dilepas.**
- **Chip USB-to-UART** — kotak hitam kecil dekat USB. Jembatan laptop ↔ ESP32.
- **LED daya (sering merah)** — menyala terus artinya board dapat listrik.
- **LED program (sering di GPIO 2)** — ini yang kita kedipkan di Wokwi barusan.
- **Colokan USB** — untuk daya dan, kalau kabelnya kabel data, untuk kirim program.
- **Tombol EN** — restart.
- **Tombol BOOT** — “tolong terima program baru”.

<details>
<summary>Mau lihat isi dalam kaleng? (opsional, jangan ditiru di rumah)</summary>

Foto berikut diambil dari modul yang **kaleng pelindungnya sudah dibuka**. Board kamu tetap harus berkaleng. Ini hanya supaya kamu tahu: kode tidak “nempel di udara”, melainkan disimpan di chip flash kecil di samping CPU.

![Isi modul ESP-WROOM-32: CPU ESP32 di tengah, chip flash di samping, antena PCB di kiri](aset/esp32-wroom-32-modul.jpg)

*Foto: Brian Krent, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Espressif_ESP-WROOM-32_Wi-Fi_%26_Bluetooth_Module.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.id).*

Cara baca foto itu, dari kiri ke kanan:

1. Pola tembaga berliku = **antena Wi-Fi**.
2. Kotak hitam besar bertuliskan `ESP32-D0WDQ6` = **CPU** (yang menjalankan program).
3. Kotak hitam lebih kecil di sampingnya (`25Q32...`) = **memori flash** (laci tempat firmware disimpan).

</details>

---

## 5. Praktik Windows: cek port COM (boleh dilewati)

Bagian ini **hanya** jika board fisik sudah di tangan. Belum punya? Lompat ke [bagian 6](#6-dua-tombol-fisik-en-vs-boot).

Saat ESP32 dicolok ke Windows, laptop harus melihatnya sebagai **port COM** (saluran percakapan serial virtual). Editor nanti akan bertanya: “Kirim program ke COM yang mana?”

### Yang kamu buka di Windows

1. Pakai **kabel data**, bukan kabel cas-saja.

![Perbedaan kabel USB data (4 kawat) dan kabel cas saja (2 kawat)](aset/kabel-data-vs-cas.jpg)

*Ilustrasi orisinal kurikulum ini. Dari luar hampir kembar; isinya yang beda.*

2. Colok board ke USB laptop. LED daya biasanya menyala.
3. Tekan `Windows + X`, lalu klik **Device Manager**.
4. Buka **Ports (COM & LPT)**.

![Ilustrasi Device Manager dengan port COM yang dicari](aset/device-manager-com-port.jpg)

*Ilustrasi orisinal. Tampilan Windows kamu bisa sedikit berbeda; yang dicari tetap tulisan COM plus angkanya.*

Yang biasanya muncul:

- `Silicon Labs CP210x USB to UART Bridge (COMx)`
- `USB-SERIAL CH340 (COMx)`

Angka `COMx` beda di tiap laptop (COM3, COM5, COM13, ...). **Catat angkanya.** Itu alamat kirim program nanti.

> [!WARNING]
> **Board nyala, tapi tidak ada Ports (COM & LPT)?**
>
> 1. **Kabel cas-saja:** LED bisa menyala, laptop tetap buta. Ganti ke kabel data HP yang biasa dipakai transfer foto.
> 2. **Driver belum ada:** di *Other devices* muncul tanda seru kuning, misalnya `USB2.0-Serial`.
>    - Driver CP2102: [Silicon Labs CP210x VCP](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
>    - Driver CH340: [WCH CH341SER](http://www.wch-ic.com/downloads/CH341SER_EXE.html)
> 3. Unduh, instal, cabut-colok USB, cek Device Manager lagi.
> 4. Masih kosong? Coba port USB lain di laptop (yang di belakang/samping body, bukan hub murah).

Kamu **belum** perlu menekan Upload di IDE. Cukup yakin Windows sudah “melihat” board.

---

## 6. Dua tombol fisik: EN vs BOOT

Dua tombol kecil dekat USB sering bikin pemula gagap. Fungsinya beda jauh.

![Perbandingan tombol EN sebagai restart dan tombol BOOT sebagai mode terima program](aset/tombol-en-vs-boot.jpg)

*Ilustrasi orisinal kurikulum ini.*

| Tombol | Analogi | Fungsi sehari-hari |
| :--- | :--- | :--- |
| **EN** | Tombol restart HP | Mengulang program yang **sudah ada** dari awal |
| **BOOT** | Mode unduh / “terima file baru” | Menyuruh chip: jangan jalankan program lama, bersiap terima firmware baru |

Banyak board modern bisa upload otomatis tanpa kamu pegang tombol. Tetap hafalkan trik BOOT, karena suatu hari error `Connecting........_____` pasti datang.

> [!TIP]
> **Upload macet di `Connecting........_____`**  
> Tahan tombol **BOOT** kira-kira 2 detik saat laptop mulai mencari board, lalu lepas begitu muncul progres `Writing at ...`. Jangan tahan EN; itu malah mereset terus.

---

## Glosarium (bahasa manusia)

| Istilah | Artinya, versi warung |
| :--- | :--- |
| **Mikrokontroler (MCU)** | Komputer mini satu tugas, langsung jalan tanpa Windows |
| **Bare-metal** | Program menempel langsung di chip, tanpa OS berat |
| **Kompiler** | Penerjemah C++ menjadi `0` dan `1` |
| **Firmware** | Program yang disimpan permanen di dalam chip |
| **Flashing / upload** | Menyalin firmware ke memori flash |
| **USB-to-UART** | Penerjemah USB laptop menjadi percakapan serial TX/RX |
| **Port COM** | “Nomor saluran” yang diberikan Windows ke board |
| **Serial** | Jendela percakapan teks antara chip dan laptop (di Wokwi: kotak putih di bawah board) |
| **GPIO** | Pin serbaguna yang bisa jadi sakelar atau telinga (input/output) |
| **SPI Flash** | Laci penyimpan program yang tidak hilang saat listrik mati |
| **EN** | Tombol restart |
| **BOOT** | Tombol mode terima program baru |

---

## Kuis singkat

Jawab di kepala dulu, baru buka kunci jawaban.

1. Kenapa ESP32 bisa nyala dalam sepersekian detik, sedangkan laptop tidak?
2. Saat upload muncul `Connecting........_____`, tombol mana yang ditahan kira-kira 2 detik?
3. Kenapa file `sketch.ino` tidak bisa “dituang mentah-mentah” ke chip tanpa kompiler?
4. Di Wokwi, tab mana yang boleh kamu sunting untuk program kedip lampu: `sketch.ino` atau `diagram.json`?

<details>
<summary>Kunci jawaban</summary>

1. Karena ESP32 tidak menunggu sistem operasi. Ia langsung menjalankan satu program dari memori flash.
2. Tombol **BOOT**.
3. Chip hanya mengerti `0` dan `1`. Teks C++ masih bahasa manusia; kompiler yang menerjemahkannya.
4. **`sketch.ino`**. `diagram.json` adalah denah rangkaian, bukan program.

</details>

---

## Sumber gambar

| Gambar | Sumber | Lisensi |
| :--- | :--- | :--- |
| Foto board ESP32 DevKit | [Ubahnverleih, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.id) |
| Foto isi modul ESP-WROOM-32 | [Brian Krent, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Espressif_ESP-WROOM-32_Wi-Fi_%26_Bluetooth_Module.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.id) |
| Tampilan Wokwi (editor, Play, Serial) | Tangkapan layar [Wokwi Simulator](https://wokwi.com), 21 Agustus 2026 | Merek milik [wokwi.com](https://wokwi.com); dipakai sebagai panduan tombol |
| Diagram alur, perbandingan laptop/MCU, anatomi, Device Manager, kabel USB, tombol EN/BOOT | Ilustrasi orisinal kurikulum ini | Dibuat khusus untuk modul 0.0 |

---

## Status selesai & langkah berikutnya

Kalau ini sudah kamu lakukan, modul 0.0 boleh dicentang:

- [ ] Membuka Wokwi tanpa akun, menjalankan simulasi, dan melihat `Hello, ESP32!`
- [ ] Tidak panik saat muncul log boot (`mode:DIO` / `load:0x...`)
- [ ] Menempel program kedip dan melihat LED GPIO 2 berkedip
- [ ] Mengubah `delay(1000)` menjadi `delay(100)` dan mengisi sendiri `delay(____)`
- [ ] Bisa menjelaskan, dengan bahasa sendiri, kenapa teks C++ harus dikompilasi
- [ ] (Opsional) Board fisik terdeteksi sebagai port COM di Device Manager

Lanjut ke **[Modul 0.1: Dasar Listrik Intuitif — Analogi Air, Hukum Ohm, dan Resistor LED](01-dasar-listrik-dan-hukum-ohm.md)**.

Pantau progres lengkap di **[TODO.md](../TODO.md)**.
