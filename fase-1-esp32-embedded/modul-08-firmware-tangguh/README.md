# Modul 8 — Firmware Tangguh: millis(), State Machine, Kode Modular, Watchdog, & Debugging

🌐 **Bahasa Indonesia** · [English](../../en/phase-1-esp32-embedded/module-08-robust-firmware/README.md)

*Fase 1 · Minggu 8 · Perangkat keras (*hardware*): **meja kerja Node 1 dari Modul 7** — tidak ada komponen baru dan tidak ada kabel baru; semua praktik juga bisa dicoba di Wokwi · Prasyarat: **Modul 7** (Node 1 v0.4.0 dengan layar OLED) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 7](../modul-07-bus-sensor-oled-skematik/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 9 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-9--catu-daya--hemat-daya-adaptor-baterai-deep-sleep--mengukur-arus)

---

Dalam tiga minggu terakhir, Node 1 makin pintar: punya lima indra (Modul 6), layar sendiri (Modul 7), dan dua aturan otomatis. Namun, kalau kamu perhatikan baik-baik, Node 1 v0.4.0 masih punya beberapa kebiasaan buruk:

| Yang terjadi di Node 1 v0.4.0 | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Selama pompa menyala 3 detik, tombol tidak bereaksi, perintah Serial tidak dijawab, dan layar membeku. | `delay(detik * 1000)` di dalam `jalankanPompa()` | Pola `millis()` (Konsep 1–2) |
| Selama tombol ditahan, semua tugas lain berhenti. | `tombolDitekan()` menunggu jari diangkat | Tombol yang tidak menunggu (Praktik 2) |
| "Setiap 2 detik" sebenarnya "setiap 200 putaran `loop()`", jadi jadwalnya bergeser kalau putarannya melambat. | `delay(10)` dan penghitung putaran | Jadwal berdasarkan jam (Konsep 2) |
| Kalau program tersangkut, Node 1 diam selamanya sampai ada yang menekan tombol EN. | Tidak ada "penjaga" | *Watchdog* (Konsep 8) |
| Ambang "tanah kering" tertanam di kode. Untuk mengubahnya, kamu harus mengunggah ulang program. | Ambang ditulis sebagai konstanta | NVS (Konsep 7) |
| Sebanyak 650 baris kode bertumpuk dalam satu file. | Program terus tumbuh sejak Modul 3 | Kode modular (Konsep 5) |
| Saat ada yang aneh, kita menebak-nebak penyebabnya. | `Serial.print` yang berserakan | Log bertingkat dan *debugging* sistematis (Konsep 9–10) |

Satu per satu, kebiasaan itu kita ganti minggu ini. Hasilnya **Node 1 v1.0**: versi pertama yang layak disebut "jadi" — **mandiri** (tetap bekerja tanpa laptop dan tanpa internet), **modular** (kodenya dipecah menjadi beberapa file yang rapi), dan **tangguh** (tidak membeku, me-*restart* sendiri kalau macet, dan tetap ingat setelannya walaupun listrik padam). Ujian kelulusannya juga baru: Node 1 harus berjalan **24 jam tanpa *restart***.

Minggu ini kamu tidak memasang komponen baru. Yang kamu "rakit" adalah cara berpikir yang dipakai firmware sungguhan, dari jam tangan pintar sampai mesin cuci: **jangan pernah menunggu dengan diam, selalu tahu sedang berada di tahap apa, dan selalu siap kalau ada yang salah**.

![Peta jalan Modul 8. Atas, enam fase kurikulum dari Fase 0 Fondasi sampai Fase 5 Operasi dan skala; Fase 1 ESP32, Modul 5 sampai 9, disorot, Modul 1 sampai 7 bertanda selesai, dan Modul 8 ditandai KAMU DI SINI dengan catatan firmware yang tidak pernah tertidur. Bawah, kotak Modul 8 minggu ini, sekitar 8 sampai 10 jam yang dicicil tanpa komponen baru, berisi sepuluh hal: KC, Kemenangan Cepat, berkedip sambil mendengar tombol; P1, jebakan delay(), buktikan sendiri; P2, tiga tugas, satu loop(); P3, state machine penyiraman; P4, kode modular, file .h dan .cpp; P5, ambang yang tidak lupa, NVS; P6, watchdog, sengaja macet lalu diselamatkan; P7, log bertingkat dan berburu bug; P8, simpan sketsa dan catatan ke GitHub; dan tanda plus, Tambahan: Node 1 versi 1.0 dan uji 24 jam. Tanda bintang menandai P2, P5, P6, dan bagian Tambahan sebagai syarat lulus](aset/peta-jalan-modul-08.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - Setiap kotak kode punya tombol salin di pojok kanan atasnya. Semua sketsa juga tersedia sebagai file di folder [`kode/`](kode/), lengkap dengan `diagram.json` (dan `libraries.txt` kalau perlu) untuk Wokwi.
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik.
> - **Minggu ini tidak ada kabel baru.** Semua praktik memakai rangkaian yang sudah terpasang di meja kerjamu sejak Modul 7. Di Wokwi, Kemenangan Cepat dan Praktik 1, 5, dan 6 memakai rangkaian kecil (papan ESP32, LED status, dan tombol), sedangkan Praktik 2, 3, 4, 7, dan Node 1 v1.0 memakai rangkaian Node 1 lengkap dari Modul 7.
> - **Angka di Wokwi berbeda dengan papan asli**, terutama jumlah putaran `loop()` per detik. Simulator menjalankan programmu lebih lambat daripada chip aslinya, jadi angkamu di papan asli bisa berkali-kali lipat lebih besar. Itu normal.
> - **Papan ESP32 di Wokwi tetap diputar menyamping** seperti Modul 6–7: colokan USB di kiri, deretan pin VIN…EN di atas, dan deretan 3V3…D23 di bawah.
> - Server Wokwi yang gratis kadang ramai. Kalau muncul jendela `Build Servers Busy`, programmu sedang antre untuk disusun: tunggu beberapa menit. Kalau simulasi tidak kunjung berjalan, klik **CLOSE**, hentikan simulasi (tombol **■**), lalu coba lagi nanti.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, memilih semua, menyalin, mencari, menempel, dan membuat tab baru.

> [!WARNING]
> **Tiga aturan keselamatan minggu ini.**
>
> 1. **Minggu ini tidak ada kabel yang perlu dipindah.** Kalau tetap harus menyentuh kabel (misalnya ada yang kendur, atau saat mencoba "sensor rusak" di Praktik 2), pakai aturan emas Modul 5: matikan MB102, lalu cabut USB. Menyalakannya lagi juga berurutan: colokkan USB dulu, baru nyalakan MB102.
> 2. **Praktik 3, 4, dan 7, serta Node 1 v1.0, menyalakan pompa sungguhan.** Pastikan tandon berisi air dan ujung selang mengarah ke gelas tanaman atau kembali ke tandon, seperti Modul 6. Semua yang berisi air tetap di atas nampan, jauh dari breadboard dan laptop.
> 3. **Uji 24 jam berarti Node 1 menyala tanpa ditunggui.** Letakkan meja kerja di permukaan yang kering, tidak mudah terbakar, dan jauh dari jangkauan anak kecil atau hewan peliharaan. Arahkan selang pompa kembali ke tandon dan rekatkan ujungnya ke dinding tandon (selotip atau penjepit) supaya air hanya berputar kalau pompa menyala berkali-kali dan selangnya tidak terlepas. Kalau tercium bau hangus atau ada komponen yang terasa sangat panas, matikan MB102, lalu cabut USB.

Ritme modul ini sama dengan Modul 1–7. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat dan komponen yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: berkedip sambil mendengar tombol, tanpa `delay()` (10 menit)](#-kemenangan-cepat-berkedip-sambil-mendengar-tombol-tanpa-delay-10-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Jebakan `delay()`](#1-jebakan-delay-tertidur-sambil-berdiri) · [2 Pola `millis()`](#2-pola-millis-melirik-jam-dinding) · [3 Jam yang meluap](#3-unsigned-long-dan-jam-yang-berputar-kembali-ke-nol) · [4 *State machine*](#4-state-machine-keadaan-dan-aturan-pindah) · [5 Kode modular](#5-kode-modular-satu-sketsa-beberapa-file) · [6 `char[]` & `snprintf()`](#6-char-dan-snprintf-menyusun-teks-tanpa-meminjam-memori) · [7 NVS](#7-nvs-dan-preferences-lemari-arsip-yang-tidak-lupa) · [8 *Watchdog*](#8-watchdog-penjaga-yang-me-restart-program-macet) · [9 Log bertingkat](#9-log-bertingkat-debug-info-error) · [10 *Debugging* sistematis](#10-debugging-sistematis-jadi-detektif-bukan-penebak)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Jebakan `delay()`](#praktik-1--jebakan-delay-buktikan-sendiri-20-menit) · [2 Tiga tugas ⭐](#praktik-2--tiga-tugas-satu-loop-30-menit) · [3 *State machine*](#praktik-3--state-machine-penyiraman-30-menit) · [4 Kode modular](#praktik-4--kode-modular-pecah-jadi-beberapa-file-35-menit) · [5 NVS ⭐](#praktik-5--ambang-yang-tidak-lupa-nvs-25-menit) · [6 *Watchdog* ⭐](#praktik-6--watchdog-sengaja-macet-lalu-diselamatkan-30-menit) · [7 Berburu *bug*](#praktik-7--log-bertingkat-dan-berburu-bug-35-menit) · [8 GitHub](#praktik-8--simpan-ke-github-15-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-8)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

- **Menjelaskan mengapa `delay()` membuat program "tuli"**, lalu menggantinya dengan pola `millis()` sehingga beberapa tugas berjalan bergantian tanpa saling menunggu.
- **Membuat tombol yang mengenali tekan pendek dan tekan lama** tanpa membekukan program.
- **Menyusun *state machine*** (mesin keadaan) sederhana dengan `enum`: daftar keadaan ditambah aturan kapan berpindah. Mesin ini dipakai untuk penyiraman dan siklus utama Node 1.
- **Memecah satu sketsa menjadi beberapa file `.h` dan `.cpp`**, serta mengenali dua jenis error khasnya: lupa `#include` dan *undefined reference*.
- **Menyusun teks dengan `char[]` dan `snprintf()`** tanpa `String`.
- **Menyimpan setelan di NVS** dengan library **Preferences** supaya tetap ada setelah listrik padam.
- **Memasang *watchdog* (anjing penjaga) dengan cara penulisan paket esp32 versi 3**, lalu membaca alasan *restart* dan pesan panik yang dicetaknya.
- **Mencetak log bertingkat** (DEBUG, INFO, ERROR) dan **berburu *bug* (kutu) secara sistematis**, bukan menebak-nebak.
- **Menjalankan uji ketahanan 24 jam** (30 menit di Wokwi) dengan penghitung *uptime* (lama menyala) di layar OLED.

---

## 🧰 Yang perlu disiapkan

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Meja kerja dari Modul 7** | Dua breadboard, papan ESP32, MB102 + adaptor 5 V 2 A + kabel USB A–A, kelima sensor, semua aktuator, dan layar OLED. **Biarkan semuanya terpasang.** Modul microSD boleh terpasang, boleh juga tidak. |
| **Tandon, pompa, dan gelas tanaman dari Modul 6** | Dipakai Praktik 3, 4, dan 7 serta Node 1 v1.0. Isi tandon dengan air dan letakkan semuanya di atas nampan. |
| **Laptop + Arduino IDE 2 + kabel USB data** | Sudah terpasang sejak Modul 2. Minggu ini tidak ada library baru yang perlu dipasang. |
| **Untuk uji 24 jam: sumber daya USB untuk ESP32 yang tidak "tidur"** | Pilih salah satu: (a) ***charger* HP 5 V** (pengisi daya) bermerek, minimal 1 A, dengan kabel USB yang cocok untuk colokan papan ESP32-mu (**bukan** *power bank*, yang sering mati sendiri saat arusnya kecil); atau (b) laptop yang diatur supaya tidak tidur selama tercolok listrik. Cara (a) paling mudah karena laptopmu tetap bebas dipakai. |
| **Kertas + pensil (atau file catatan)** | Untuk menggambar *state machine* (Praktik 3) dan membuat catatan berburu *bug* (Praktik 7). |
| **Browser + Wokwi** | Untuk Kemenangan Cepat dan untuk mencoba setiap praktik sebelum dijalankan di papan asli. |

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (saat ditulis: 2.3.10) | Dari Modul 2. |
| Paket papan **esp32 by Espressif Systems** | **3.3.x** (saat ditulis: 3.3.12) | Dari Modul 2. Sudah membawa library **Preferences** (NVS) dan fungsi *watchdog* `esp_task_wdt_…`, jadi keduanya tidak perlu dipasang. |
| Library dari Modul 5–7 | **ESP32Servo** 3.2.1, **DHT sensor library** 1.4.7 (+ **Adafruit Unified Sensor** 1.1.15), **Adafruit SSD1306** 2.5.17 (+ **Adafruit GFX Library** 1.12.6 dan **Adafruit BusIO** 1.17.4) | Sudah terpasang. Dipakai lagi oleh Praktik 2 dan Node 1 v1.0. |

---

## 🏆 Kemenangan Cepat: berkedip sambil mendengar tombol, tanpa `delay()` (10 menit)

Sejak Modul 2, LED-mu berkedip dengan `delay()`: nyalakan, tunggu, padamkan, tunggu. Cara itu mudah, tetapi selama menunggu, ESP32 tidak bisa mengerjakan apa pun. Sekarang kita coba cara lain. Kita mulai di Wokwi supaya kamu langsung melihat hasilnya tanpa menyentuh meja kerja.

> 🖥️ **Alat yang dipakai di bagian ini:** browser, situs [Wokwi](https://wokwi.com). Tidak perlu kit, tidak perlu memasang apa pun.

1. Buka **https://wokwi.com/projects/new/esp32** di browser. Muncul proyek ESP32 kosong: kode di kiri, papan di kanan.
2. Klik kanan tautan [`kode/modul08_kedip_tanpa_delay/diagram.json`](kode/modul08_kedip_tanpa_delay/diagram.json) → **Buka di tab baru**, lalu klik tombol **Copy raw file** (ikon dua kotak) di kanan atas isi file itu. Kembali ke tab Wokwi, klik tab **`diagram.json`** di atas editor, pilih semua isinya (**Ctrl + A**), lalu tempel (**Ctrl + V**). Di kanan, papan ESP32 kini menyamping. Di kiri atasnya ada tombol hijau yang tersambung ke **D13**, dan di bawahnya ada LED merah dengan resistor yang tersambung ke **D4**. Rangkaiannya sama dengan LED status dan tombol manual di meja kerjamu.
3. Klik tab **`sketch.ino`**, hapus isinya, lalu tempel kode ini:

   ```cpp
   // Modul 8 - Kemenangan Cepat: LED berkedip dan tombol tetap didengar, tanpa delay()
   // Rangkaian: LED status di D4 (lewat resistor 220 ohm) dan tombol di D13 (kaki seberangnya ke GND).
   // Tekan tombol kapan saja: irama kedip LED langsung berganti, pelan <-> cepat.

   const int PIN_LED_STATUS = 4;
   const int PIN_TOMBOL = 13;
   const unsigned long JEDA_PANTUL = 30;  // milidetik: bacaan tombol harus tenang selama ini (Modul 5)

   unsigned long jedaKedip = 500;         // LED berganti nyala/padam setiap 500 ms (pelan)
   unsigned long waktuKedipTerakhir = 0;  // kapan LED terakhir berganti
   unsigned long waktuLaporTerakhir = 0;  // kapan Serial terakhir melapor
   unsigned long waktuBacaanBerubah = 0;  // kapan bacaan tombol terakhir berubah
   bool ledMenyala = false;
   int bacaanTadi = HIGH;    // bacaan tombol di putaran sebelumnya; HIGH = dilepas (INPUT_PULLUP)
   int tombolStabil = HIGH;  // keadaan tombol yang sudah dipercaya (bacaannya sudah tenang 30 ms)
   int jumlahGanti = 0;    // berapa kali LED sudah berganti
   int jumlahTekan = 0;    // berapa kali tombol sudah ditekan

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     Serial.println("Kemenangan Cepat Modul 8: LED berkedip, tombol selalu didengar.");
   }

   void loop() {
     unsigned long sekarang = millis();  // lirik "jam dinding" sekali di awal setiap putaran

     // Tugas 1: sudah waktunya LED berganti?
     if (sekarang - waktuKedipTerakhir >= jedaKedip) {
       waktuKedipTerakhir = sekarang;
       ledMenyala = !ledMenyala;
       digitalWrite(PIN_LED_STATUS, ledMenyala);  // true = HIGH (nyala), false = LOW (padam)
       jumlahGanti++;
     }

     // Tugas 2: apakah tombol baru saja ditekan? Diperiksa di SETIAP putaran.
     int bacaan = digitalRead(PIN_TOMBOL);
     if (bacaan != bacaanTadi) {      // bacaan berubah: ditekan, dilepas, memantul, atau derau
       bacaanTadi = bacaan;
       waktuBacaanBerubah = sekarang;  // mulai menghitung "tenang" dari nol lagi
     }
     if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
       tombolStabil = bacaan;          // sudah tenang 30 ms: perubahan ini sungguhan
       if (tombolStabil == LOW) {      // berubah dari dilepas menjadi ditekan
         jumlahTekan++;
         if (jedaKedip == 500) {
           jedaKedip = 100;
           Serial.println("Tombol ditekan! Irama kedip: CEPAT");
         } else {
           jedaKedip = 500;
           Serial.println("Tombol ditekan! Irama kedip: PELAN");
         }
       }
     }

     // Tugas 3: sudah waktunya melapor? (setiap 2 detik)
     if (sekarang - waktuLaporTerakhir >= 2000) {
       waktuLaporTerakhir = sekarang;
       Serial.print("Detik ke-");
       Serial.print(sekarang / 1000);
       Serial.print(": LED sudah berganti ");
       Serial.print(jumlahGanti);
       Serial.print(" kali, tombol sudah ditekan ");
       Serial.print(jumlahTekan);
       Serial.println(" kali.");
     }
   }
   ```

4. Klik tombol hijau **▶**. Setelah program selesai disusun, LED berkedip pelan dan Serial Monitor (di bawah panel simulasi) melapor setiap 2 detik.
5. **Klik tombol hijau di rangkaian kapan saja.** Irama kedip LED langsung berganti menjadi cepat; klik sekali lagi, kembali pelan. Tidak ada tekanan yang terlewat walaupun kamu mengekliknya tepat saat LED sedang menyala.

   **Hasilnya** (angkamu bisa berbeda, bergantung pada kapan kamu mengeklik; gambar di bawah diambil setelah satu klik saja):

   ```text
   Kemenangan Cepat Modul 8: LED berkedip, tombol selalu didengar.
   Detik ke-2: LED sudah berganti 3 kali, tombol sudah ditekan 0 kali.
   Detik ke-4: LED sudah berganti 7 kali, tombol sudah ditekan 0 kali.
   Tombol ditekan! Irama kedip: CEPAT
   Detik ke-6: LED sudah berganti 17 kali, tombol sudah ditekan 1 kali.
   Tombol ditekan! Irama kedip: PELAN
   Detik ke-8: LED sudah berganti 35 kali, tombol sudah ditekan 2 kali.
   Detik ke-10: LED sudah berganti 39 kali, tombol sudah ditekan 2 kali.
   ```

![Tangkapan layar Wokwi Kemenangan Cepat, dipotong dan disusun ulang. Kiri atas, rangkaian di panel simulasi: tombol hijau D13 di kiri atas (penanda 1, klik kapan saja; kaki seberangnya ke GND), papan ESP32 menyamping, dan LED merah yang sedang menyala di bawah papan, tersambung ke D4 lewat resistor 220 ohm (penanda 2, berkedip pelan, setelah tombol diklik menjadi cepat); catatan: simbol segitiga adalah GND, simbol daya Wokwi, bukan kabel tambahan. Bawah, Serial Monitor: Kemenangan Cepat Modul 8: LED berkedip, tombol selalu didengar; laporan Detik ke-2, ke-4, dan ke-6 dengan LED berganti 3, 7, dan 11 kali dan tombol ditekan 0 kali; lalu Tombol ditekan! Irama kedip: CEPAT (penanda 3); lalu Detik ke-8 dan ke-10 dengan LED berganti 31 dan 51 kali dan tombol ditekan 1 kali. Keterangan penanda 3: sesudahnya LED berganti 20 kali per 2 detik, sebelumnya hanya 4 kali](aset/wokwi-kemenangan-cepat.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

Selamat — ESP32-mu baru saja mengerjakan tiga tugas bergantian tanpa satu pun `delay()`. Perhatikan tiga hal di kode:

- **`millis()` adalah jam dinding ESP32**: jumlah milidetik sejak papan menyala. Setiap putaran `loop()` dimulai dengan **melirik jam** sekali (`sekarang = millis()`).
- **Setiap tugas bertanya "sudah waktunya?"**: `if (sekarang - waktuKedipTerakhir >= jedaKedip)`. Kalau belum, `loop()` langsung lanjut ke tugas berikutnya, tidak menunggu. Kalau sudah, tugasnya dikerjakan, lalu jamnya dicatat (`waktuKedipTerakhir = sekarang`).
- **Tombol diperiksa di setiap putaran**, puluhan ribu kali per detik, jadi tidak ada tekanan yang terlewat. Perubahan baru dipercaya setelah bacaannya **tenang selama `JEDA_PANTUL`** (30 milidetik) sehingga pantulan dan derau sesaat tidak ikut terhitung. Idenya sama dengan Modul 5, tetapi kali ini tanpa menunggu: kita hanya mencatat kapan bacaan tombol terakhir berubah (`waktuBacaanBerubah`).

Penasaran? Klik **■** untuk menghentikan simulasi, ubah `jedaKedip = 100;` menjadi `jedaKedip = 40;`, lalu klik **▶** lagi: irama cepatnya kini nyaris seperti lampu kilat. Di Praktik 1, kamu membandingkan sketsa semacam ini dengan versi `delay()` dan melihat sendiri berapa banyak tekanan tombol yang hilang.

---

## 🧠 Konsep "Mengapa"

Sepuluh konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–3 → Praktik 1–2 (jebakan `delay()`, lalu tiga tugas dalam satu `loop()`)
2. Konsep 4 → Praktik 3 (*state machine* penyiraman)
3. Konsep 5 → Praktik 4 (kode modular)
4. Konsep 6–7 → Praktik 5 (ambang yang tersimpan di NVS)
5. Konsep 8 → Praktik 6 (*watchdog*)
6. Konsep 9–10 → Praktik 7–8 (log bertingkat, berburu *bug*, dan GitHub)
7. 🧩 Tantangan → ➕ Rumah Pintar Mini (Node 1 v1.0 dan uji 24 jam) → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba kode di bagian Konsep?** Tidak wajib — semua kode akan kamu jalankan di Praktik. Kode di bagian Konsep hanya potongan; versi utuhnya ada di sketsa Praktik, yang bisa dicoba di Wokwi dengan `diagram.json` dari folder [`kode/`](kode/), persis seperti Kemenangan Cepat.

### 1. Jebakan `delay()`: tertidur sambil berdiri

`delay(1000)` artinya "**berhenti total** selama 1.000 milidetik". Selama itu, `loop()` tidak bergerak sama sekali: tombol tidak diperiksa, perintah Serial tidak dibaca, layar tidak diperbarui. ESP32 seperti satpam yang tertidur sambil berdiri. Badannya ada di pos jaga, tetapi matanya terpejam.

Untuk program kecil, ini bukan masalah. Di Modul 2, LED berkedip dengan `delay(1000)` dan tidak ada hal lain yang perlu diurus. Masalah muncul ketika satu program mengurus banyak hal sekaligus, seperti Node 1. Coba lihat tempat-tempat Node 1 v0.4.0 "tertidur":

| Baris di Node 1 v0.4.0 | Lama tertidur | Akibatnya |
| :--- | :--- | :--- |
| `delay(detik * 1000)` di `jalankanPompa()` | 1–10 detik | Selama pompa menyala, semua tugas lain berhenti. Perintah `pompa 10` membekukan Node 1 selama 10 detik. |
| `while (digitalRead(PIN_TOMBOL) == LOW)` di `tombolDitekan()` | selama jari menahan tombol | Tahan tombol 5 detik, Node 1 membeku 5 detik. |
| `delay(150)` di `bunyikanBuzzer()` dan `delay(50)` di `kedipStatus()` | 0,05–0,15 detik | Kecil, tetapi tetap tertidur. |
| `delay(2)` sebanyak 20 kali untuk setiap sensor analog di `bacaAnalogRata()` | sekitar 0,08 detik setiap laporan | Sama saja: tetap tertidur. |
| `delay(JEDA_PUTARAN)` di akhir `loop()` | 0,01 detik setiap putaran | "Setiap 2 detik" sebenarnya "setiap 200 putaran". Karena setiap putaran juga butuh waktu untuk bekerja, jadwalnya selalu sedikit lebih lambat daripada 2 detik. |

Penyebab semua masalah itu satu: **`loop()` menunggu**. Selama menunggu, ia tidak bisa memeriksa hal lain. Di Praktik 1, kamu membuktikannya sendiri dengan menghitung tekanan tombol yang hilang.

![Diagram dua garis waktu 0 sampai 6 detik dengan lima tekanan tombol yang sama, pada 0,7; 1,6; 2,6; 3,5; dan 4,5 detik. Atas, versi delay(), loop() berputar 1 kali setiap 2 detik: LED nyala dan padam bergantian setiap detik, dimulai dari nyala, sedangkan ESP32 tertidur dalam tiga blok, masing-masing delay(1000) ditambah delay(1000); tombol hanya diperiksa sesaat di ujung setiap blok, (pada detik ke-2, ke-4, dan ke-6) sehingga kelima tekanan bertanda silang merah. Tulisannya: 0 dari 5 tekanan tercatat, tombol hanya dilirik saat ESP32 bangun sebentar setiap 2 detik. Bawah, versi millis(), loop() berputar puluhan ribu kali per detik: LED berkedip dengan irama yang sama, dimulai dari padam; ESP32 digambarkan sebagai deretan rapat garis tipis, masing-masing satu putaran loop() yang bertanya "sudah waktunya?" lalu memeriksa tombol; kelima tekanan bertanda centang hijau. Tulisannya: 5 dari 5 tekanan tercatat, tidak ada yang tertidur, jadi tombol diperiksa terus-menerus](aset/jebakan-delay.png)

Ada satu alasan lagi untuk berhenti memakai `delay()` yang lama: mulai minggu ini, Node 1 dijaga oleh *watchdog* (Konsep 8). Penjaga itu menganggap `loop()` yang berhenti lebih dari 5 detik sebagai program yang **macet**, lalu me-*restart* papan. Kalau `delay()` panjang masih ada, Node 1 akan di-*restart* terus-menerus padahal programnya tidak rusak.

### 2. Pola `millis()`: melirik jam dinding

Bayangkan kamu sedang memasak nasi (matang dalam 20 menit) sambil merebus telur (10 menit) dan menunggu kurir paket. Kamu tidak berdiri menatap panci selama 20 menit. Kamu **mencatat jam mulainya**, lalu sambil membereskan dapur, sesekali **melirik jam dinding**: "Sudah 10 menit sejak telur masuk? Belum, lanjut beres-beres." Kalau bel berbunyi, kamu langsung membuka pintu karena kamu tidak sedang tertidur di depan panci.

ESP32 punya jam dinding sendiri: **`millis()`**, yang menjawab berapa milidetik sudah berlalu sejak papan menyala. Kamu sudah memakainya di Modul 7 (`millis() / 1000` = detik sejak menyala). Dengan jam itu, setiap tugas cukup ditulis dengan pola tiga baris ini:

```cpp
unsigned long sekarang = millis();           // 1. lirik jam dinding

if (sekarang - waktuTerakhir >= JEDA) {      // 2. sudah lewat JEDA sejak terakhir dikerjakan?
  waktuTerakhir = sekarang;                  // 3. catat jamnya...
  // ...lalu kerjakan tugasnya, misalnya ganti nyala LED
}
```

Empat aturan kecil membuat pola ini bekerja:

1. **Setiap tugas punya catatan waktunya sendiri.** LED punya `waktuKedipTerakhir`, laporan punya `waktuLaporTerakhir`, dan seterusnya, seperti kertas catatan terpisah untuk nasi dan untuk telur.
2. **Kurangkan dulu, baru bandingkan:** tulis `sekarang - waktuTerakhir >= JEDA`. Bentuk ini tetap benar walaupun jam ESP32 "berputar kembali ke nol" setelah 49 hari (Konsep 3).
3. **Pakai `>=`, bukan `==`.** `loop()` belum tentu memeriksa tepat pada milidetik ke-1.000; bisa saja ia baru memeriksa pada milidetik ke-1.001. Dengan `>=`, tugasnya tetap dikerjakan.
4. **`loop()` tidak pernah menunggu; ia hanya memeriksa.** Kalau belum waktunya, `loop()` langsung lanjut ke tugas berikutnya. Karena tidak ada yang menunggu, `loop()` bisa berputar puluhan ribu kali per detik, dan setiap putaran menanyakan hal yang sama ke semua tugas: "sudah waktunya?"

Hasilnya, satu `loop()` bisa mengurus banyak jadwal sekaligus. Masing-masing berjalan dengan iramanya sendiri, dan tidak ada yang saling menunggu:

![Diagram pola millis(). Kiri atas, kode tiga baris bernomor: 1, unsigned long sekarang = millis(); 2, if (sekarang - waktuTerakhir >= JEDA) {; 3, waktuTerakhir = sekarang;, lalu komentar kerjakan tugasnya; catatan: lirik jam, sudah lewat JEDA?, catat jamnya lalu kerjakan, dan belum waktunya berarti langsung lanjut ke tugas berikutnya. Kanan atas, tiga tugas dengan catatannya masing-masing: LED status setiap 500 ms dengan waktuKedipTerakhir, laporan Serial setiap 2000 ms dengan waktuLaporTerakhir, dan tombol setiap putaran dengan waktuBacaanBerubah (tenang 30 ms). Bawah, garis waktu 0 sampai 4000 ms: deretan rapat putaran loop(), titik LED setiap 500 ms, titik laporan pada 2000 dan 4000 ms, dan satu tekanan tombol pada sekitar 1300 ms yang langsung terbaca, begitu bacaannya tenang 30 ms](aset/pola-millis.png)

Tombol adalah tugas yang sedikit istimewa. Ia tidak punya jadwal, tetapi diperiksa di **setiap** putaran supaya tidak ada tekanan yang terlewat. Yang diingat bukan "kapan terakhir diperiksa", melainkan "kapan bacaannya terakhir berubah". Perubahan baru dipercaya setelah bacaannya tenang selama 30 milidetik, jadi pantulan dan derau sesaat tidak ikut terhitung. Praktik 2 menambahkan satu kemampuan lagi: membedakan **tekan pendek** dari **tekan lama** tanpa menunggu jari diangkat.

### 3. `unsigned long` dan jam yang berputar kembali ke nol

`millis()` menyimpan angkanya dalam stoples berjenis **`unsigned long`** (Modul 3): bilangan bulat yang tidak pernah negatif, dari `0` sampai `4294967295` (sekitar 4,29 miliar). Dalam milidetik, itu sama dengan **49 hari 17 jam lebih sedikit**. Setelah itu, `millis()` **meluap** (*overflow*): angkanya kembali ke `0`, lalu naik lagi dari awal.

Kedengarannya berbahaya, tetapi pola di Konsep 2 tetap benar. Bayangkan **odometer** (penghitung jarak) mobil dengan enam angka. Setelah `999999` km, ia kembali ke `000000`. Kalau kamu mengisi bensin saat odometer menunjukkan `999800`, lalu sekarang odometer menunjukkan `000300`, berapa jauh kamu sudah berkendara? Jawabannya 500 km: 200 km sampai angka berputar, ditambah 300 km sesudahnya. Pengurangan "melewati nol" seperti itu persis yang dilakukan ESP32 untuk bilangan `unsigned long`:

| | Angka di `unsigned long` |
| :--- | ---: |
| `waktuTerakhir` (dicatat 296 ms sebelum meluap) | `4294967000` |
| `sekarang` (704 ms setelah meluap) | `704` |
| `sekarang - waktuTerakhir` | `1000` ✓ — tepat 1 detik |

Yang **tidak** aman adalah menghitung "jam tujuan" lalu membandingkannya:

```cpp
// JANGAN: bentuk ini rusak saat millis() meluap
unsigned long waktuTujuan = waktuTerakhir + JEDA;  // 4294967000 + 1000 meluap menjadi 704!
if (millis() >= waktuTujuan) {                       // 4294967000 >= 704 → langsung benar,
  // ...                                             // tugasnya dikerjakan ribuan kali tanpa jeda
}
```

Sesaat sebelum `millis()` meluap, `waktuTujuan` ikut meluap menjadi angka kecil sehingga perbandingannya langsung benar dan tugas itu dikerjakan di setiap putaran sampai `millis()` sendiri meluap. Kesalahan seperti ini hanya muncul sekali setiap 49 hari, jadi hampir mustahil ditemukan saat menguji. Karena itu, biasakan bentuk **`sekarang - waktuTerakhir >= JEDA`** sejak sekarang.

![Diagram jam yang berputar kembali ke nol. Kiri, odometer enam angka: 999800 saat mengisi bensin dan 000300 sekarang; 200 km sampai berputar lalu 300 km lagi, sama dengan 500 km. Kanan, millis() dalam unsigned long: waktuTerakhir 4294967000, yaitu 296 ms sebelum meluap, dan sekarang 704, yaitu 704 ms sesudah meluap; sekarang dikurangi waktuTerakhir sama dengan 1000, tepat 1 detik. Bawah, dua baris kode: if (sekarang - waktuTerakhir >= JEDA) bertanda centang hijau, aman selamanya asalkan JEDA kurang dari 49,7 hari; dan if (millis() >= waktuTerakhir + JEDA) bertanda silang merah, rusak sekali setiap 49,7 hari karena penjumlahannya ikut meluap](aset/odometer-millis.png)

Dua kebiasaan lain dari konsep ini:

- **Simpan waktu di `unsigned long`, jangan di `int`.** `int` di ESP32 sudah menjadi negatif setelah sekitar 2,1 miliar, yaitu setelah sekitar 24,9 hari menyala (Modul 3, 🔬).
- **Untuk menghitung lama menyala (*uptime*), pakai jam yang lebih panjang.** Node 1 v1.0 menampilkan *uptime* di layar. Kalau memakai `millis()`, angkanya kembali ke nol setelah 49 hari. Karena itu, *uptime* dihitung dengan `esp_timer_get_time()`, jam bawaan ESP32 yang menghitung **mikrodetik** dalam angka 64-bit (dua kali lebih panjang daripada `unsigned long` yang 32-bit) dan baru meluap setelah ratusan ribu tahun.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 1 — Jebakan `delay()`: buktikan sendiri](#praktik-1--jebakan-delay-buktikan-sendiri-20-menit) dan [Praktik 2 — Tiga tugas, satu `loop()`](#praktik-2--tiga-tugas-satu-loop-30-menit). Setelah selesai, kembali ke [Konsep 4](#4-state-machine-keadaan-dan-aturan-pindah).

### 4. *State machine*: keadaan dan aturan pindah

> ⬆️ **Baru selesai Praktik 1–2?** Bagus. Kamu sudah bisa menjalankan beberapa tugas bergantian. Sekarang kita belajar menyusun tugas yang punya **tahapan**.

Ingat lampu lalu lintas di Modul 3: merah, lalu hijau, lalu kuning, lalu merah lagi. Pada satu waktu, lampu itu selalu berada di **tepat satu keadaan**, dan ada **aturan** kapan ia pindah ke keadaan berikutnya. Mesin cuci juga begitu: mengisi air, mencuci, membilas, memeras, selesai. Pintunya hanya terkunci di keadaan tertentu, dan setiap keadaan tahu kapan harus berakhir. Cara berpikir seperti ini disebut ***state machine*** (mesin keadaan).

Sebuah *state machine* hanya punya dua bahan:

1. **Daftar keadaan** (*state*). Contohnya, penyiraman Node 1 punya tiga keadaan: SIAGA, MENYIRAM, dan JEDA.
2. **Aturan pindah** (transisi). Setiap aturan menjawab tiga pertanyaan: dari keadaan apa, kapan atau karena apa, dan ke keadaan apa. Pemicunya bisa waktu ("sudah 3 detik"), bacaan sensor ("tanah kering"), atau tombol.

Inilah aturan penyiraman yang kamu bangun di Praktik 3:

| Keadaan | Yang dikerjakan selama di keadaan ini | Pindah ke… | …kalau |
| :--- | :--- | :--- | :--- |
| **SIAGA** | memeriksa tanah setiap 2 detik | MENYIRAM | tanah kering (atau tombol ditahan 1 detik) **dan** air tandon cukup (pompa dinyalakan) |
| | | JEDA | tanah kering (atau tombol ditahan 1 detik), **tetapi** air tandon kurang (pompa ditolak) |
| **MENYIRAM** | membiarkan pompa menyala tanpa menunggu dengan diam | JEDA | sudah 3 detik (pompa dipadamkan) |
| **JEDA** | beristirahat supaya air sempat meresap ke tanah | SIAGA | sudah 30 detik |

![Diagram state machine penyiraman dengan tiga lingkaran. SIAGA, periksa tanah setiap 2 detik, dengan panah mulai dari kiri. Panah biru dari SIAGA ke MENYIRAM berlabel tanah kurang dari 30 persen (atau tombol ditahan) dan air paling sedikit 20 persen, pompa dinyalakan. MENYIRAM, pompa menyala tanpa menunggu; panah ke bawah ke JEDA berlabel sudah 3 detik, pompa dipadamkan. JEDA, beristirahat selagi air meresap; panah hijau toska kembali ke SIAGA berlabel sudah 30 detik. Panah merah langsung dari SIAGA ke JEDA berlabel tanah kurang dari 30 persen (atau tombol ditahan), tetapi air kurang dari 20 persen, pompa ditolak, LED kedip cepat. Catatan bawah: di semua keadaan, LED detak tetap berdetak dan tombol tetap diperiksa di setiap putaran loop()](aset/state-machine-siram.png)

**Mengapa repot-repot memakai keadaan?** Tanpa *state machine*, kode penyiraman biasanya dipenuhi "bendera" seperti `sedangMenyiram`, `sedangIstirahat`, dan `tadiDitolak`, ditambah `if` bersarang yang makin lama makin kusut. Lebih buruk lagi, bendera-bendera itu bisa membentuk gabungan yang tidak masuk akal, misalnya `sedangMenyiram` dan `sedangIstirahat` sama-sama `true`. Dengan *state machine*, hanya ada **satu** variabel keadaan, jadi gabungan yang tidak masuk akal itu tidak mungkin terjadi. Kode setiap keadaan juga pendek karena ia hanya perlu memikirkan satu hal: kapan harus pindah.

Di C++, daftar keadaan ditulis dengan **`enum`** (singkatan *enumeration*, "daftar pilihan"):

```cpp
enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };  // daftar nama keadaan yang mungkin
KeadaanSiram keadaan = SIAGA;                 // keadaan sekarang; mulai dari SIAGA
```

Variabel berjenis `KeadaanSiram` hanya bisa berisi salah satu dari ketiga nama itu, seperti soal pilihan ganda yang jawabannya harus a, b, atau c. Di balik layar, ketiganya hanyalah angka `0`, `1`, dan `2`, tetapi berkat namanya, kode bisa dibaca seperti kalimat biasa: `if (keadaan == MENYIRAM)`.

Perhatikan juga: di sini `JEDA` adalah **nama keadaan**, bukan konstanta `JEDA` di pola `millis()` Konsep 2. Dalam satu sketsa, satu nama hanya boleh dipakai untuk satu hal. Karena itu, di sketsa Praktik 3, lama istirahatnya diberi nama lain: `LAMA_JEDA`.

Setiap putaran `loop()`, *state machine* hanya mengerjakan bagian milik keadaan yang sedang berlaku, lalu langsung kembali:

```cpp
if (keadaan == SIAGA) {
  // periksa tanah setiap 2 detik; kalau kering: nyalakan pompa, lalu pindahKe(MENYIRAM)
} else if (keadaan == MENYIRAM) {
  if (millis() - waktuMasukKeadaan >= LAMA_SIRAM) {  // sudah 3 detik di keadaan ini?
    digitalWrite(PIN_POMPA, LOW);                    // padamkan pompa
    pindahKe(JEDA);
  }
} else if (keadaan == JEDA) {
  if (millis() - waktuMasukKeadaan >= LAMA_JEDA) {   // sudah 30 detik beristirahat?
    pindahKe(SIAGA);
  }
}
```

Perhatikan `pindahKe()`. Fungsi kecil ini adalah **satu-satunya tempat keadaan berganti**. Ia mencatat jam masuk ke keadaan baru (`waktuMasukKeadaan`) dan mencetak perpindahannya, misalnya `[SIAGA -> MENYIRAM]`. Karena semua perpindahan lewat satu pintu, kamu bisa melacak riwayatnya dengan mudah saat ada yang aneh (Konsep 10).

> [!IMPORTANT]
> **Tulis `enum` di bagian atas sketsa, sebelum fungsi mana pun.** Sebelum menyusun program, Arduino IDE diam-diam menyalin "daftar isi" semua fungsimu ke atas fungsi pertama. Daftar isi ini adalah deklarasi awal (*prototype*) yang kamu kenal di Modul 3 (🔬). Kalau `enum` baru ditulis di bawah fungsi pertama, daftar isi itu menyebut `KeadaanSiram` sebelum kompiler mengenalnya sehingga muncul error `'KeadaanSiram' was not declared in this scope` dan `variable or field 'pindahKe' declared void`. Aturan yang sama sudah kamu kenal untuk `struct` sejak Modul 3.

Node 1 v1.0 memakai *state machine* kedua untuk **siklus utamanya**. Di siklus ini, setiap keadaan kita sebut **langkah**, sesuai nama di kodenya (`LangkahSiklus`). Alih-alih membaca sensor, mencetak laporan, menggambar layar, dan menjalankan aturan otomatis sekaligus dalam satu putaran, setiap langkah dikerjakan di putaran `loop()` yang berbeda: **MENUNGGU** (*idle*) → **MEMBACA** → **MENAMPILKAN** → **BERTINDAK** → kembali MENUNGGU. Di antara langkah-langkah itu, tombol dan perintah Serial tetap diperiksa sehingga Node 1 tidak pernah "tuli" lebih lama daripada satu langkah.

Beberapa tugas kecil di bagian bawah gambar berikut, misalnya memberi makan *watchdog* dan halaman status, baru dibahas di Konsep 8 dan bagian ➕. Untuk sekarang, cukup perhatikan empat langkah di atasnya.

![Diagram siklus utama Node 1 versi 1.0, satu langkah per putaran loop(): empat kotak berurutan dengan panah, MENUNGGU (sudah 2 detik sejak bacaan terakhir?), MEMBACA (bacaSensor(), paling lama sekitar 70 ms), MENAMPILKAN (log, layar OLED, CSV setiap 30 detik), dan BERTINDAK (aturan otomatis dan kirimData(), rak Modul 10 sampai 11), lalu panah kembali ke MENUNGGU. Di bawahnya, daftar tugas kecil yang dikerjakan di setiap putaran loop() sebelum langkah siklus: beri makan watchdog, sampel analog setiap 2 ms, pompa dan buzzer padam tepat waktu, keadaan siram (MENYIRAM ke JEDA ke SIAGA), detak LED, halaman status, tombol, dan perintah Serial](aset/siklus-node1.png)

> ➡️ **Siap praktik?** Lanjut ke [Praktik 3 — *State machine* penyiraman](#praktik-3--state-machine-penyiraman-30-menit). Setelah selesai, kembali ke [Konsep 5](#5-kode-modular-satu-sketsa-beberapa-file).

### 5. Kode modular: satu sketsa, beberapa file

> ⬆️ **Baru selesai Praktik 3?** Sketsamu kini sudah lebih dari dua ratus baris. Saatnya merapikannya.

Node 1 v0.4.0 punya sekitar 650 baris dalam satu file. Untuk mencari kode layar, kamu harus menggulir melewati sensor, aktuator, dan perintah Serial. Mengubah satu bagian juga berisiko merusak bagian lain tanpa sengaja. Program sungguhan tidak ditulis seperti itu; programnya dipecah menjadi **modul**, yaitu beberapa file yang masing-masing mengurus satu hal.

Di Arduino, satu modul biasanya terdiri atas dua file. Bayangkan sebuah rumah makan:

- **File `.h` (*header*, berkas kepala; bukan *header* deretan kaki di Modul 7) adalah menu.** Isinya hanya daftar "hidangan" yang tersedia, yaitu nama fungsi beserta bahan yang dibutuhkannya, tanpa resep.
- **File `.cpp` adalah dapur.** Di sinilah resep setiap hidangan ditulis lengkap, termasuk "rahasia dapur" yang tidak perlu diketahui tamu.
- **Sketsa `.ino` adalah tamu.** Ia cukup membaca menu (`#include "detak.h"`), lalu memesan (`mulaiDetak(PIN_LED_STATUS)`). Ia tidak perlu tahu cara memasaknya.

![Diagram kode modular sebagai tamu, menu, dan dapur. Kiri, kartu Tamu, modul08_modular.ino, berisi #include detak.h, setup() yang memanggil mulaiDetak(PIN_LED_STATUS), dan loop() yang memanggil perbaruiDetak(); keterangan memesan lewat menu. Tengah, kartu Menu, detak.h, berisi #pragma once dan tiga deklarasi fungsi: mulaiDetak, aturIramaDetak, dan perbaruiDetak; keterangan daftar hidangan tanpa resep. Kanan, kartu Dapur, detak.cpp, berisi #include Arduino.h, #include detak.h, static int pinDetak, dan isi fungsi perbaruiDetak(); keterangan resep ditambah rahasia dapur (static). Panah #include dari tamu dan dari dapur menuju menu. Bawah, dua tahap saat Verify: 1, menyusun, setiap file diterjemahkan sendiri-sendiri, dengan contoh error 'mulaiDetak' was not declared in this scope karena lupa #include atau salah ketik; 2, menyambung (link, ld), semua hasil disatukan, dengan contoh error undefined reference to perbaruiDetak() karena menu ada, tetapi dapurnya tidak](aset/kode-modular.png)

Ini menu modul detak jantung yang kamu buat di Praktik 4:

```cpp
// detak.h - LED status sebagai "detak jantung" Node 1 (Modul 8)
// Kedip pelan = program berjalan normal; kedip cepat = ada masalah.
#pragma once

void mulaiDetak(int pin);           // panggil sekali di setup()
void aturIramaDetak(bool masalah);  // true = kedip cepat, false = kedip pelan
void perbaruiDetak();               // panggil di setiap putaran loop()
```

Lima hal baru yang perlu kamu kenal:

1. **`#pragma once`** di bagian paling atas setiap file `.h` (boleh didahului komentar) artinya "baca file ini sekali saja" walaupun ia di-`#include` dari banyak tempat. Contohnya, tab utama Node 1 v1.0 membaca `sensor.h` empat kali: langsung, dan lewat `layar.h`, `kartu.h`, serta `aturan.h`. Tanpa `#pragma once`, formulir `BacaanSensor` di dalamnya terbaca berkali-kali, dan kompiler protes `redefinition of 'struct BacaanSensor'`.
2. **`#include "detak.h"` memakai petik ganda**, sedangkan `#include <Arduino.h>` memakai kurung sudut. Petik ganda artinya "cari di folder sketsa ini dulu"; kurung sudut artinya "cari di library dan paket papan".
3. **File `.cpp` harus menulis `#include <Arduino.h>` sendiri.** Tab `.ino` mendapatkannya secara otomatis, tetapi tab `.cpp` tidak. Tanpa baris itu, nama seperti `millis()` dan `digitalWrite()` tidak dikenal di dapur.
4. **`static` di depan variabel di file `.cpp`** artinya "milik file ini saja". File lain tidak bisa melihatnya, dan variabel itu tidak akan tertukar dengan variabel lain yang kebetulan bernama sama. Itulah rahasia dapur.
5. **Di file `.cpp`, tidak ada "daftar isi" otomatis** (Konsep 4). Fungsi yang dipakai di dalam file `.cpp` harus sudah dikenal sebelum baris yang memakainya: ditulis lebih dulu di atasnya, atau dicantumkan di file `.h` yang di-`#include`. Kalau tidak, muncul `'namaFungsi' was not declared in this scope` walaupun fungsinya ada di bawah.

Saat kamu mengeklik **Verify**, Arduino IDE bekerja dalam dua tahap utama (di 🔬 Modul 3 disebut kompilasi dan penautan), dan masing-masing punya jenis error sendiri:

| Tahap | Yang dikerjakan | Contoh error | Artinya |
| :--- | :--- | :--- | :--- |
| 1. **Menyusun** (*compile*) | Setiap file `.cpp`, dan semua tab `.ino` yang digabung menjadi satu, diterjemahkan sendiri-sendiri. | `'mulaiDetak' was not declared in this scope` | Tamu memesan hidangan yang tidak ada di menu yang ia pegang: lupa `#include "detak.h"`, atau nama fungsinya salah ketik. |
| 2. **Menyambung** (*link*) | Semua hasil terjemahan disambung menjadi satu program utuh. | ``undefined reference to `perbaruiDetak()'`` | Menu menjanjikan hidangan, tetapi tidak ada dapur yang memasaknya: fungsi itu tidak ada di file `.cpp` mana pun, atau namanya berbeda. |

Error tahap kedua mudah dikenali karena biasanya diakhiri `collect2: error: ld returned 1 exit status` (di Windows: `collect2.exe: …`). `ld` adalah nama program penyambungnya. Di Praktik 4, kamu sengaja membuat kedua error ini supaya tidak kaget saat bertemu lagi.

Tiga kebiasaan membuat modul yang baik:

1. **Satu modul, satu urusan.** Modul `tombol` hanya mengurus tombol; modul `detak` hanya mengurus LED status.
2. **Rahasia dapur tetap di dapur.** Variabel dan fungsi bantu yang hanya dipakai di dalam modul diberi `static`, dan tidak ditulis di file `.h`.
3. **Modul melapor, sketsa yang memutuskan.** Modul `tombol` tidak menyalakan lampu sendiri. Ia hanya melapor "ada tekan pendek" atau "ada tekan lama", lalu sketsamu yang memutuskan akibatnya. Dengan begitu, modul `tombol` bisa dipakai lagi di proyek lain tanpa diubah.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 4 — Kode modular: pecah jadi beberapa file](#praktik-4--kode-modular-pecah-jadi-beberapa-file-35-menit). Setelah selesai, kembali ke [Konsep 6](#6-char-dan-snprintf-menyusun-teks-tanpa-meminjam-memori).

### 6. `char[]` dan `snprintf()`: menyusun teks tanpa meminjam memori

> ⬆️ **Baru selesai Praktik 4?** Sketsamu kini rapi dalam beberapa file. Dua konsep berikutnya menyiapkan Node 1 untuk berjalan berhari-hari.

Di Modul 3 (🔬), kita sudah berjanji: mulai Modul 8, bagian program yang sering diulang tidak lagi memakai `String`. Sekarang saatnya menepati janji itu.

`String` itu praktis. Teks bisa digabung semudah `"suhu=" + String(28.5)`. Namun, setiap kali teksnya bertambah panjang, `String` **meminjam** sepotong memori baru dari tempat penyimpanan sementara bernama *heap* (timbunan), lalu mengembalikan potongan lamanya. Kalau ini terjadi ribuan kali sehari dengan ukuran yang berbeda-beda, *heap* menjadi berlubang-lubang (**fragmentasi**). Bayangkan tempat parkir yang kosongnya tersebar satu-satu di antara mobil lain: totalnya luas, tetapi tidak ada satu pun tempat yang cukup untuk bus. Suatu hari, `String` gagal mendapat potongan yang cukup besar. Teks pun terpotong atau program berperilaku aneh, sering kali justru setelah berhari-hari berjalan dengan baik. Kesalahan seperti ini termasuk yang paling sulit dilacak.

**`char[]`** (deretan huruf) bekerja dengan cara lain. Ukurannya ditentukan sekali di awal, seperti deretan laci bernomor yang disiapkan sebelum dipakai. Tidak ada pinjam-meminjam. Di akhir teksnya selalu ada satu laci khusus bernilai nol (`'\0'`) sebagai tanda "teks selesai di sini". Karena itu, teks 21 huruf butuh 22 laci.

Untuk mengisi laci-laci itu, kita memakai **`snprintf()`**. Cara kerjanya seperti soal isian rumpang: kamu memberi **pola** berisi "kotak isian" bertanda `%`, lalu bahan-bahannya, dan `snprintf()` menyalin hasilnya ke dalam laci. Huruf `n` di namanya berarti ia tidak pernah menulis melebihi jumlah laci yang kamu sebutkan. Kalau teksnya terlalu panjang, sisanya dipotong dengan aman, tidak sampai menimpa memori lain.

```cpp
char teks[22];                                                // 22 laci: cukup untuk 21 huruf + tanda akhir
snprintf(teks, sizeof(teks), "Ambang tanah: %d%%", 30);       // teks berisi "Ambang tanah: 30%"
snprintf(teks, sizeof(teks), "Restart: %s", "POWERON");       // teks berisi "Restart: POWERON"
```

`sizeof(teks)` menjawab jumlah laci `teks` (22), jadi kamu tidak perlu menulis angkanya dua kali.

![Diagram char[] dan snprintf(): mengisi kotak isian teks. Atas, kode char teks[22]; dengan catatan 22 laci, 21 huruf ditambah 1 tanda akhir, lalu snprintf(teks, sizeof(teks), "Ambang tanah: %d%%", 30); dengan %d ditandai sebagai kotak isian, %% sebagai tanda persen, dan 30 sebagai bahan. Di bawahnya, 22 laci bernomor 0 sampai 21 berisi huruf A m b a n g, spasi, t a n a h, titik dua, spasi, 3 0 %, lalu laci nomor 17 berisi tanda akhir \0 dan laci 18 sampai 21 kosong; catatan: teks = "Ambang tanah: 30%", tanda ␣ berarti spasi, laci sesudah tanda akhir tidak dipakai, tetapi juga tidak merepotkan. Kiri bawah, String: pinjam, kembalikan, ulangi, dengan deretan potongan memori terpakai (abu-abu) dan kosong (putih) yang berselang-seling; heap berlubang-lubang (fragmentasi): total kosongnya banyak, tetapi tidak ada satu potongan yang cukup besar; masih boleh untuk perintah yang datang sesekali. Kanan bawah, char[]: laci tetap, deretan laci hijau yang disiapkan sekali dan dipakai ulang selamanya; snprintf() tidak pernah menulis melebihi lacinya; untuk log, baris CSV, dan halaman status Node 1](aset/char-snprintf.png)

Kotak isian yang dipakai di modul ini:

| Kotak isian | Untuk bahan berjenis | Contoh bahan | Hasilnya |
| :--- | :--- | :--- | :--- |
| `%d` | `int` | `30` | `30` |
| `%lu` | `unsigned long` | `12345` | `12345` |
| `%s` | teks (`"..."` atau `char[]`) | `"POWERON"` | `POWERON` |
| `%.1f` | `float`, satu angka di belakang tanda desimal | `28.46` | `28.5` |
| `%02lu` | `unsigned long`, minimal dua digit, diisi nol di depan | `5` | `05` |
| `%-5s` | teks, rata kiri, minimal lima huruf (sisanya diisi spasi) | `"INFO"` | `INFO ` |
| `%%` | tanda persen itu sendiri | — | `%` |

Ada dua hal yang perlu diingat. Pertama, **jenis bahannya harus cocok dengan kotak isiannya**: `%d` untuk `int`, `%lu` untuk `unsigned long`. Kalau tidak cocok, yang tercetak angka ngawur. Kedua, `%.1f` selalu memakai **titik** sebagai tanda desimal (`28.5`), sama seperti kontrak data di Lampiran A Silabus. Satu catatan untuk modul-modul berikutnya: di paket esp32 versi 3, jenis `uint32_t` (misalnya jawaban `ESP.getFreeHeap()`) sama dengan `unsigned long`, jadi kotak isiannya juga `%lu`.

**Siapkan laci untuk teks terpanjang yang mungkin, bukan yang biasa muncul.** Kelembapan biasanya hanya dua angka, tetapi bahan berjenis `int` bisa sepanjang 11 huruf (`-2147483648`). Karena itu, Node 1 v1.0 menyiapkan 12 laci untuk setiap angka `int` yang ditulis dengan `snprintf()`. Kompiler hanya membantu sebagian: peringatan `may be truncated` (Praktik 7.7) muncul kalau ia tahu rentang angkanya, misalnya angka yang baru saja dipastikan berada di antara 0 dan 100. Kalau rentangnya tidak ia ketahui, ia diam saja. Jadi, tetap hitung sendiri teks terpanjangnya.

**`Serial.printf()`** memakai pola yang persis sama dan langsung mencetak hasilnya ke Serial Monitor. Bedanya dengan `Serial.println()`, `Serial.printf()` tidak pindah baris sendiri: tambahkan `\n` di akhir pola, misalnya `Serial.printf("Ambang: %d%%\n", 30);`. Di balik layar, `Serial.printf()` menyiapkan laci 64 huruf sendiri. Untuk teks yang lebih panjang, ia meminjam *heap* sebentar lalu langsung mengembalikannya; pinjaman sesaat seperti itu tidak membuat *heap* berlubang. Modul log di Konsep 9 memakai `snprintf()` dan `Serial.printf()` sekaligus.

`String` tidak lantas terlarang. Node 1 v1.0 masih memakainya di dua tempat yang aman: **membaca perintah Serial** (perintah datang sesekali saja) dan **halaman bacaan layar** rancanganmu dari Modul 7 (teksnya pendek dan hanya dibuat setiap 2 detik). Yang kita ubah menjadi `char[]` adalah bagian yang paling sering berulang atau paling panjang: baris log, baris CSV di kartu microSD, dan halaman status layar yang baru. Mengubah halaman bacaanmu menjadi `char[]` adalah salah satu 🧩 Tantangan (2B).

### 7. NVS dan Preferences: lemari arsip yang tidak lupa

Variabel biasa disimpan di **RAM**. RAM itu seperti papan tulis: cepat ditulisi, tetapi langsung terhapus begitu listrik padam. Akibatnya, setelan yang diubah saat program berjalan ikut hilang setiap kali papan di-*restart*. Itulah sebabnya ambang siram Node 1 v0.4.0 masih berupa konstanta di kode, yang hanya bisa diubah dengan mengunggah ulang program.

ESP32 punya tempat penyimpanan lain: **memori *flash***, tempat programmu sendiri disimpan. Isinya tetap ada walaupun listrik padam, seperti lemari arsip. Sebagian kecil *flash* disediakan khusus untuk menyimpan setelan. Bagian itu disebut **NVS** (*Non-Volatile Storage*, penyimpanan yang tidak hilang saat listrik padam). Library **Preferences**, yang sudah ikut paket esp32, membuat NVS mudah dipakai:

```cpp
#include <Preferences.h>

Preferences arsip;
arsip.begin("node1", false);                    // buka map bernama "node1"; false = boleh membaca DAN menulis
int ambang = arsip.getInt("tanah_siram", 30);   // baca label "tanah_siram"; jawab 30 kalau label itu belum ada
arsip.putInt("tanah_siram", 35);                // tulis: angka 35 tetap ada walaupun listrik padam
```

Bayangkan NVS sebagai lemari arsip yang berisi beberapa **map** (Preferences menyebutnya *namespace*; tidak ada hubungannya dengan fungsi `map()` dari Modul 6). Setiap map dibuka dengan namanya, misalnya `"node1"`. Di dalam map, setiap angka disimpan dengan **label** (*key*), misalnya `"tanah_siram"`. Objek `arsip` di kode mewakili seluruh lemari itu. (Kata "laci" tetap kita pakai untuk deretan kotak `char[]` dan *array*, seperti di Modul 3.) Nama label ini sengaja sama dengan nama ambang di kontrak data (Lampiran A Silabus). Beberapa aturan dan fungsi yang perlu kamu tahu:

- **Nama map dan label paling panjang 15 huruf.** `"tanah_siram"` (11 huruf) dan `"jumlah_nyala"` (12 huruf) aman.
- **Setiap jenis data punya pasangan fungsi baca-tulisnya sendiri:** `getInt`/`putInt` untuk `int`, `getULong`/`putULong` untuk `unsigned long`, `getFloat`/`putFloat`, `getBool`/`putBool`, dan `getString`/`putString`.
- **Angka kedua di fungsi `get…` adalah jawaban bawaan** kalau label itu belum pernah ditulis. Karena itu, papan yang baru pertama kali menyala tetap mendapat angka yang masuk akal.
- `arsip.isKey("tanah_siram")` menjawab apakah label itu sudah ada, dan `arsip.remove("tanah_siram")` menghapusnya.

***Flash* bisa aus.** Setiap bagian *flash* hanya tahan dihapus dan ditulis ulang sekitar 100.000 kali, menurut lembar data chip *flash* yang umum dipakai papan ESP32. NVS sudah menyebar tulisannya ke beberapa tempat supaya tidak cepat aus, tetapi kebiasaan kita tetap: **tulis ke NVS hanya kalau angkanya berubah**, misalnya saat kamu mengetik ambang baru, dan **jangan pernah menulis di setiap putaran `loop()`**. `loop()` berputar puluhan ribu kali per detik. Kalau angka yang ditulis berubah terus, misalnya sebuah penghitung, setiap penulisan membuat catatan baru di *flash*, dan umur *flash* bisa habis dalam hitungan jam sampai hari. (NVS sebenarnya melewatkan tulisan yang angkanya sama persis dengan yang sudah tersimpan, tetapi jangan bergantung pada itu: memeriksanya sendiri membuat niatmu jelas.) Membaca tidak membuat aus, jadi boleh sesering apa pun.

![Diagram RAM lupa, NVS ingat. Kiri, RAM sebagai papan tulis: sebelum padam berisi ambang = 35 dan lampu = true, lalu panah merah padam menuju papan yang menyala lagi berisi ambang = 30 dan lampu = false, ditulis ulang dari kode; catatan: cepat, tetapi terhapus setiap kali papan padam, saat menyala lagi ambang kembali ke angka di kode (30); baca dan tulis sesering apa pun tidak membuat aus. Kanan, NVS di flash sebagai lemari arsip berisi map "node1" dengan label tanah_siram bernilai 35 dan jumlah_nyala bernilai 4; catatan: tetap ada setelah restart, listrik padam, dan unggah ulang sketsa (di Wokwi hilang kalau simulasi dihentikan lalu dimulai lagi); tulis hanya kalau berubah karena flash bisa aus. Bawah, dua baris kode: arsip.begin("node1", false); dan int ambang = arsip.getInt("tanah_siram", 30);, dengan catatan nama map dan label paling panjang 15 huruf, dan 30 adalah jawaban bawaan kalau labelnya belum ada](aset/nvs-lemari-arsip.png)

Apa saja yang membuat isi NVS hilang?

| Kejadian | Isi variabel (RAM) | Isi NVS |
| :--- | :--- | :--- |
| *Restart*: tombol EN, `ESP.restart()`, atau *watchdog* | hilang | **tetap** |
| Listrik padam (USB dicabut, lalu dicolokkan lagi) | hilang | **tetap** |
| Mengunggah ulang sketsa dari Arduino IDE | hilang | **tetap** selama menu **Tools → Erase All Flash Before Sketch Upload** bernilai **Disabled** (bawaannya) |
| Di Wokwi: menekan **■**, lalu **▶** | hilang | **hilang** karena Wokwi memulai dengan chip baru yang masih kosong |

Baris terakhir penting saat kamu mencoba Praktik 5 di Wokwi: untuk meniru "listrik padam lalu menyala lagi", pakai perintah `restart`, bukan tombol **■**.

NVS adalah fondasi untuk modul-modul berikutnya. Di Modul 19, server mengirim ambang terbaru ke Node 1 lewat jaringan (MQTT), dan Node 1 menyimpannya di NVS. Dengan begitu, walaupun server tidak terjangkau dan listrik sempat padam, Node 1 tetap bisa menjalankan **aturan pengaman lokalnya** sendiri.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 5 — Ambang yang tidak lupa: NVS](#praktik-5--ambang-yang-tidak-lupa-nvs-25-menit). Setelah selesai, kembali ke [Konsep 8](#8-watchdog-penjaga-yang-me-restart-program-macet).

### 8. *Watchdog*: penjaga yang me-*restart* program macet

> ⬆️ **Baru selesai Praktik 5?** Node 1 kini ingat setelannya. Berikutnya, Node 1 belajar menyelamatkan dirinya sendiri.

Program bisa macet karena banyak hal: perulangan yang lupa diberi jalan keluar, library sensor yang menunggu jawaban dari kabel yang copot, atau (mulai Modul 10) koneksi WiFi yang tersangkut. Kalau hal itu terjadi di tengah malam, tidak ada yang menekan tombol EN. Pompa bisa terus menyala, atau sebaliknya tidak pernah menyiram lagi.

Di Modul 2, kita sudah berkenalan dengan si "anjing penjaga". Sekarang kita memasangnya. ***Watchdog*** (anjing penjaga) adalah penghitung waktu di dalam chip yang harus **diberi makan** secara teratur. Bayangkan anjing yang harus kamu beri makan paling lambat setiap 5 detik. Selama kamu rutin memberinya makan, ia tenang. Kalau 5 detik berlalu tanpa makanan, ia menggonggong dan membangunkan seisi rumah. Di ESP32, "memberi makan" adalah satu baris di awal `loop()`, dan "menggonggong" berarti mencetak laporan, lalu me-*restart* papan.

![Diagram watchdog: beri makan sebelum 5 detik. Atas, garis waktu 0 sampai 14 detik: dari 0 sampai 3 detik, deretan garis tipis berlabel loop() berputar: makan, makan, makan; dari 3 sampai 8 detik, kotak merah macet: while (true) { } dengan rentang oranye 5 detik tanpa ada yang memberi makan; pada detik ke-8, kotak gelap restart, lalu deretan garis tipis lagi berlabel hidup lagi, berputar lagi. Di bawahnya, kotak keluaran Praktik 6: E (…) task_wdt: Task watchdog got triggered… dan Alasan restart terakhir: TASK_WDT (…). Bawah, tiga baris pemasangannya untuk paket esp32 versi 3: 1, esp_task_wdt_reconfigure(&konfigurasiWatchdog); atur ulang batas 5000 ms, panik lalu restart, di akhir setup(); 2, esp_task_wdt_add(NULL); awasi tugas yang sedang berjalan, yaitu loop(), di akhir setup(); 3, esp_task_wdt_reset(); beri makan, di awal loop()](aset/watchdog-penjaga.png)

Paket esp32 versi 3 sudah menyalakan *watchdog* jenis ini sejak papan menyala. Namanya ***Task Watchdog Timer*** (TWDT). Namun, bawaannya **belum mengawasi `loop()`**. Karena itu, kita mengatur tiga hal:

```cpp
#include <esp_task_wdt.h>

void setup() {
  // ... semua persiapan lain dulu ...
  esp_task_wdt_config_t konfigurasiWatchdog = {
    .timeout_ms = 5000,      // batas waktu: 5000 ms
    .idle_core_mask = 0b01,  // tetap awasi "tugas menganggur" inti 0 (bawaan paket esp32)
    .trigger_panic = true,   // terlambat diberi makan = panik, lalu restart
  };
  esp_task_wdt_reconfigure(&konfigurasiWatchdog);  // 1. atur ulang watchdog yang sudah menyala
  esp_task_wdt_add(NULL);                          // 2. NULL = awasi tugas yang sedang berjalan, yaitu loop()
}

void loop() {
  esp_task_wdt_reset();  // 3. "beri makan" penjaga: tanda loop() masih berputar
  // ... tugas-tugas lain, dan tidak ada yang menunggu lama ...
}
```

Penjelasan singkatnya:

- **`esp_task_wdt_config_t`** adalah "formulir" (`struct`, Modul 3) berisi tiga setelan. Penulisan `.timeout_ms = 5000` mengisi kolom berdasarkan namanya, jadi kodenya mudah dibaca. Urutannya harus sama dengan urutan kolom di formulir aslinya: `timeout_ms`, `idle_core_mask`, lalu `trigger_panic`.
- **`.idle_core_mask = 0b01`**. ESP32 punya dua inti pemroses (*core*): inti 0 mengurus pekerjaan sistem (nanti juga WiFi), dan inti 1 menjalankan `loop()`. Setiap inti punya "tugas menganggur" (*idle task*) yang hanya berjalan saat inti itu sedang tidak sibuk. Angka biner `0b01` (ingat ikon OLED di Modul 7) artinya "awasi tugas menganggur inti 0 saja", sama dengan bawaan paket esp32.
  - **Jangan ubah menjadi `0b11`.** `loop()` yang tidak pernah tidur membuat inti 1 selalu sibuk, jadi tugas menganggurnya tidak pernah sempat berjalan. Penjaga lalu mengira inti 1 macet dan me-*restart* program yang sebenarnya sehat.
- **`.trigger_panic = true`**. Kalau penjaga terlambat diberi makan, ESP32 **panik**: program dihentikan paksa, laporannya dicetak (termasuk *backtrace*, Praktik 6.3), lalu papan di-*restart*. Kalau `false`, penjaga hanya mengeluh di Serial Monitor, dan programnya tetap macet.
- **`esp_task_wdt_reconfigure()`**, bukan `esp_task_wdt_init()`. Paket esp32 sudah menyalakan penjaganya, jadi kita cukup mengatur ulang setelannya.
- **Pasang penjaga di akhir `setup()`**, setelah semua persiapan selesai. `delay(500)` di awal `setup()` masih boleh karena saat itu penjaga belum mengawasi.

Banyak tutorial dan jawaban AI masih memakai cara penulisan paket esp32 versi 2. Hasilnya di paket versi 3:

| Kode lama | Yang terjadi di paket esp32 versi 3 | Kode baru |
| :--- | :--- | :--- |
| `esp_task_wdt_init(5, true);` | Gagal disusun: `invalid conversion from 'int' to 'const esp_task_wdt_config_t*'` dan `too many arguments to function 'esp_err_t esp_task_wdt_init(const esp_task_wdt_config_t*)'`. Di versi 3, `esp_task_wdt_init()` hanya menerima satu "formulir". | `esp_task_wdt_config_t` + `esp_task_wdt_reconfigure(&konfigurasiWatchdog)` |
| `esp_task_wdt_init(&konfigurasiWatchdog);` | Berhasil disusun, tetapi saat papan menyala muncul `E (…) task_wdt: esp_task_wdt_init(517): TWDT already initialized`, dan setelan barumu tidak dipakai. | `esp_task_wdt_reconfigure(&konfigurasiWatchdog)` |

***Watchdog* bukan obat.** Ia tidak memperbaiki *bug*. Ia hanya menghidupkan Node 1 lagi supaya tugas pentingnya, seperti menjaga pompa, tetap berjalan. Kalau penyebabnya masih ada, macetnya bisa terulang. Karena itu, Node 1 v1.0 selalu mencetak **alasan *restart* terakhir** saat menyala, dan menghitung **berapa kali ia sudah menyala** di NVS. Kalau suatu pagi alasannya `WDT` dan hitungannya bertambah, kamu tahu ada yang macet semalam, lalu kamu bisa mulai berburu *bug* (Konsep 10).

Satu catatan untuk Modul 10–11: banyak fungsi jaringan menunggu sampai batas waktu bawaannya habis. Misalnya, `getLocalTime()` dan library **HTTPClient** menunggu sampai 5 detik, dan library MQTT **PubSubClient** sampai 15 detik. Itu sama dengan, atau lebih lama daripada, batas penjaga kita. Karena itu, nanti kita akan selalu memperpendek batas waktu fungsi-fungsi itu atau menyusun bagian jaringan sebagai *state machine*, bukan memperbesar batas penjaga.

Ada satu catatan untuk pembaca yang jeli. Di Modul 2, kita mengenal baris `rst:0x10` sebagai tanda *watchdog*. Tiga petunjuk berikut sering tertukar:

| Yang tercetak | Artinya |
| :--- | :--- |
| `rst:0x10` di baris *bootloader* | *Watchdog* tingkat chip me-*restart* papan tanpa bantuan program (Modul 2). |
| `rst:0xc (SW_CPU_RESET)` di baris *bootloader* | *Restart* yang diminta program: oleh penjaga yang kita pasang minggu ini (ia mencetak laporan dulu), atau oleh `ESP.restart()`. |
| jawaban `esp_reset_reason()` | Alasan yang sebenarnya. Untuk penjaga kita, jawabannya `ESP_RST_TASK_WDT`. Fungsi `alasanReset()` milik Node 1 (Modul 5) menyingkatnya menjadi `WDT`, sesuai Lampiran A Silabus. |

Jadi, untuk mengetahui alasan *restart* yang sebenarnya, jangan berpegang pada baris `rst:`; tanyakan ke `esp_reset_reason()`.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 6 — *Watchdog*: sengaja macet, lalu diselamatkan](#praktik-6--watchdog-sengaja-macet-lalu-diselamatkan-30-menit). Setelah selesai, kembali ke [Konsep 9](#9-log-bertingkat-debug-info-error).

### 9. Log bertingkat: DEBUG, INFO, ERROR

> ⬆️ **Baru selesai Praktik 6?** Kamu sudah melihat sendiri *watchdog* menyelamatkan program macet. Dua konsep terakhir membahas cara mencari tahu **mengapa** sesuatu terjadi.

Sejak Modul 2, alat bantu kita adalah `Serial.print()`. Masalahnya, saat semuanya lancar, cetakannya terlalu banyak; saat ada *bug*, rinciannya justru kurang. Lalu kita menambah `Serial.print()` sementara, lupa menghapusnya, dan Serial Monitor makin ramai.

Program sungguhan memakai **log bertingkat**. Setiap pesan diberi **tingkat** sesuai pentingnya:

| Tingkat | Untuk | Contoh dari Node 1 v1.0 |
| :--- | :--- | :--- |
| **ERROR** | Ada yang salah dan butuh perhatianmu. | `Pompa DITOLAK: air tandon tinggal 15 %.` |
| **INFO** | Kejadian penting sehari-hari. | `Pompa menyala 3 detik.`, juga bacaan sensor setiap 2 detik |
| **DEBUG** | Rincian untuk berburu *bug*; biasanya disembunyikan. | `Siklus: MEMBACA -> MENAMPILKAN` |

**Tingkat yang sedang berlaku bekerja seperti saringan.** Pada tingkat INFO (bawaan), pesan INFO dan ERROR tampil, sedangkan pesan DEBUG disembunyikan. Pada tingkat ERROR, hanya masalah yang tampil. Pada tingkat DEBUG, semuanya tampil. Tingkatnya bisa diganti kapan saja lewat Serial Monitor (`log debug`, `log info`, `log error`), tanpa mengunggah ulang program. Jadi, rincian untuk berburu *bug* tidak perlu dihapus; cukup disembunyikan saat tidak dibutuhkan.

Setiap baris log diawali **waktu sejak menyala** dan **tingkatnya**:

```text
[00:12:04] INFO  Tanah kering (12 %, ambang 30 %): mencoba menyiram.
[00:12:04] ERROR Pompa DITOLAK: air tandon tinggal 15 %.
```

Dari dua baris itu kamu langsung tahu **kapan** sesuatu terjadi (12 menit 4 detik setelah menyala) dan **seberapa serius** (ERROR). Cara memakai modul pencatat di Praktik 7 dan Node 1 v1.0 mirip `Serial.printf()`:

```cpp
logInfo("Pompa menyala %d detik.", detik);             // kotak isian sama dengan Konsep 6
logError("Pompa DITOLAK: air tandon tinggal %d %%.", levelAir);
logDebug("Siklus: %s -> %s", namaLangkah(langkah), namaLangkah(langkahBaru));
```

Satu kebiasaan penting: **catat saat ada perubahan, bukan di setiap putaran.** Pesan yang dicetak di setiap putaran `loop()` membanjiri Serial Monitor dan sekaligus memperlambat `loop()` karena pada 115200 baud, Serial hanya sanggup mengirim sekitar 11.500 huruf per detik. Karena itu, Node 1 v1.0 mencetak `DHT22 tidak terbaca.` **sekali** saat sensornya mulai gagal, lalu `DHT22 kembali terbaca.` sekali saat pulih, bukan setiap 2 detik.

Ide yang sama dipakai ESP32 sendiri. Pesan *watchdog* di Praktik 6, `E (22499) task_wdt: …`, adalah log tingkat ERROR (huruf **E**), dan angka di dalam kurungnya adalah milidetik sejak papan menyala.

![Diagram log bertingkat: tingkat yang berlaku bekerja seperti saringan, dan tingkatnya bisa diganti kapan saja lewat Serial Monitor dengan log debug, log info, atau log error. Kiri, enam pesan contoh, semuanya berawalan jam [00:12:04] kecuali yang terakhir [00:12:06]: DEBUG Siklus: MENUNGGU -> MEMBACA; INFO bacaan suhu, kelembapan, dan tanah 12 persen; INFO Tanah kering (12 %, ambang 30 %): mencoba menyiram; ERROR Pompa DITOLAK: air tandon tinggal 15 %; DEBUG Penyiraman: SIAGA -> JEDA; dan INFO bacaan berikutnya. Kanan, tiga kolom centang: log debug menampilkan keenam pesan; log info, bawaannya, menampilkan keempat pesan INFO dan ERROR; log error hanya menampilkan pesan ERROR. Catatan: jawaban perintah seperti status dan info selalu tampil; kebiasaan baik, catat saat ada perubahan, bukan di setiap putaran loop()](aset/log-bertingkat.png)

### 10. *Debugging* sistematis: jadi detektif, bukan penebak

*Bug* pasti datang; programmer berpengalaman pun mengalaminya setiap hari. Bedanya ada pada cara menghadapinya. Cara yang paling menghabiskan waktu adalah **menebak**: mengubah lima hal sekaligus, mengunggah, lalu berharap. Kalau ternyata berhasil, kamu tidak tahu perubahan mana yang menyembuhkan. Kalau gagal, kamu tidak tahu perubahan mana yang memperparah.

Detektif bekerja dengan **bukti**. Ini enam langkahnya, yang akan kamu pakai di Praktik 7:

1. **Ulangi.** Cari langkah yang **selalu** memunculkan *bug*-nya, misalnya "angkat sensor tanah ke udara, tunggu 2 detik". *Bug* yang bisa diulang sudah setengah tertangkap. Kalau ia hanya muncul "kadang-kadang", catat kapan dan dalam keadaan apa.
2. **Amati, jangan menebak.** Kumpulkan bukti: log di Serial Monitor, pola LED status, layar OLED, alasan *restart*, bahkan multimeter (Modul 2). Tulis dua kalimat: "**Seharusnya** …, **kenyataannya** …".
3. **Perbesar buktinya.** Nyalakan log DEBUG, atau tambahkan `logDebug()` sementara di sekitar bagian yang dicurigai, sampai kamu melihat **angka yang tidak masuk akal**.
4. **Bagi dua.** Kalau belum tahu bagian mana yang salah, potong daerah pencariannya menjadi dua: matikan separuh kode (jadikan komentar atau tambahkan `return` lebih awal), lalu lihat apakah *bug*-nya masih ada. Ulangi pada separuh yang tersisa. Untuk *bug* "kemarin masih jalan", bandingkan dengan versi terakhir yang masih benar di **History** GitHub Desktop.
5. **Isolasi.** Periksa bagian yang dicurigai **saja**, terpisah dari yang lain: cetak nilai di dalam satu fungsi itu, atau buat sketsa kecil yang hanya berisi bagian itu, seperti pemindai I2C di Modul 7. Bagian lain tidak bisa ikut mengacaukan, jadi hasilnya lebih jelas.
6. **Ubah satu hal, lalu buktikan.** Ubah **satu** hal saja setiap kali mencoba. Setelah *bug*-nya hilang, ulangi langkah 1 untuk membuktikan ia benar-benar hilang. Terakhir, tulis catatan singkat (gejala, penyebab, perbaikan) untuk dirimu di masa depan.

Ada satu sumber bukti lagi yang sering terlupakan: **peringatan kompiler** (*compiler warning*). Secara bawaan, Arduino IDE menyembunyikannya. Di Praktik 7, kamu menyalakannya dan melihat bahwa kompiler sebenarnya sudah "berbisik" tentang *bug* yang sedang kamu buru.

![Diagram enam langkah debugging sistematis dalam enam kartu berurutan, masing-masing dengan contoh dari Praktik 7. 1, Ulangi: cari langkah yang selalu memicu bug; contoh: angkat sensor tanah, tunggu 2 detik. 2, Amati: "seharusnya …, kenyataannya …"; contoh: pompa hanya berkedip sekejap. 3, Perbesar: nyalakan DEBUG, cari angka yang aneh; contoh: MENYIRAM: sudah 58015 ms. 4, Bagi dua: matikan separuh kode atau bandingkan versi; contoh: hanya satu baris yang mengisi waktunya. 5, Isolasi: periksa bagian yang dicurigai, terpisah; contoh: cetak nilainya di dalam pindahKe(). 6, Ubah satu hal: lalu buktikan dengan langkah 1; contoh: hapus unsigned long, pompa menyala 3 detik. Panah oranye dari kartu 6 kembali ke kartu 2: bug-nya belum hilang? kembali ke langkah 2 dengan bukti baru. Catatan bawah: jangan lupa sumber bukti gratis, peringatan kompiler, di File, Preferences…, Compiler warnings: More; di macOS lewat Arduino IDE, Settings…](aset/debugging-sistematis.png)

> ➡️ **Siap praktik?** Lanjut ke [Praktik 7 — Log bertingkat dan berburu *bug*](#praktik-7--log-bertingkat-dan-berburu-bug-35-menit), lalu [Praktik 8](#praktik-8--simpan-ke-github-15-menit). Setelah itu, lanjut ke [🧩 Tantangan mandiri](#-tantangan-mandiri) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini).

## 🔧 Praktik langkah demi langkah

Delapan praktik, **berurutan**. Tidak ada kabel baru: semua praktik memakai rangkaian Node 1 yang sudah ada di meja kerjamu. Satu-satunya kabel yang dicabut sebentar adalah kabel data DHT22 di Praktik 2.3. Praktik bertanda ⭐ di daftar isi adalah bagian dari syarat lulus:

1. **Praktik 2** — tiga tugas berjalan bergantian dalam satu `loop()` tanpa `delay()`, termasuk tombol yang mengenali tekan pendek dan tekan lama.
2. **Praktik 5** — ambang "tanah kering" tersimpan di NVS dan tetap ada setelah papan dicabut.
3. **Praktik 6** — *watchdog* me-*restart* program yang sengaja dibuat macet.

Syarat lulus sisanya ada di bagian ➕: Node 1 v1.0 yang tidak memakai `delay()` di `loop()` dan berjalan 24 jam tanpa *restart*.

Setiap praktik bisa dicoba dulu di Wokwi persis seperti Kemenangan Cepat: buka proyek ESP32 baru, tempel isi `diagram.json` praktik itu dari folder [`kode/`](kode/), lalu tempel kodenya ke tab `sketch.ino`. Kalau praktik itu punya `libraries.txt`, munculkan tab itu lewat **Library Manager** → **+** (seperti Modul 7): ketik nama library pertama di daftarnya, klik hasilnya, lalu ganti seluruh isi tab `libraries.txt` dengan isi file dari folder praktik itu. Setelah itu, baru jalankan di papan asli.

> [!TIP]
> **Cara menyimpan sketsa minggu ini.** Untuk setiap sketsa, pilih **File → New Sketch** di Arduino IDE, hapus isi bawaannya (**Ctrl + A**, lalu **Delete**), tempel kodenya (**Ctrl + V**), lalu pilih **File → Save** dan beri nama sesuai yang disebut di praktiknya, misalnya `modul08_jebakan_delay`. Saat menyimpan sketsa pertama, buat dulu folder `modul-08` di **Documents → GitHub → belajar-iot** dengan tombol **New folder** di jendela Save, lalu simpan semua sketsa minggu ini di sana. *Commit* setiap kali satu praktik selesai.
>
> **Sebelum mengeklik Upload**, pastikan kotak papan di bilah atas Arduino IDE bertuliskan **DOIT ESP32 DEVKIT V1** dan port-nya benar. Macet di `Connecting…`? Tahan **BOOT** begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan.
>
> **Serial Monitor minggu ini:** **115200 baud** dan akhiran baris **New Line** (menu di sebelah kanan kotak ketik, sama seperti Modul 5). Mulai Praktik 5, sketsa baru mengerjakan perintahmu setelah menerima tanda akhir baris dari **New Line**. Di Wokwi, klik kotak ketik di bawah Serial Monitor, ketik perintahnya, lalu tekan **Enter**; tanda akhir barisnya terkirim sendiri, jadi tidak ada menu yang perlu diatur.
>
> **Baris pertama tidak terlihat?** Tekan tombol **EN** di papan ESP32 untuk mengulang program dari awal; Serial Monitor tetap tersambung dan mencetaknya lagi. **Membuka lagi sketsa lama:** pilih **File → Open Recent**, atau **File → Open…** lalu buka **Documents → GitHub → belajar-iot → modul-08**.

> [!IMPORTANT]
> **MB102 dan relay.** Praktik 2, 3, 4, dan 7 memakai relay, pompa, atau sensor 5 V, yang semuanya mendapat daya dari MB102. Untuk praktik-praktik itu, nyalakan MB102 dengan urutan aturan emas: **colokkan USB dulu, baru nyalakan MB102**; saat selesai, **matikan MB102 dulu, baru cabut USB**. Kemenangan Cepat dan Praktik 1, 5, dan 6 cukup dengan USB.

Pada akhir modul, folder latihanmu berisi:

```text
belajar-iot/
└── modul-08/
    ├── modul08_kedip_tanpa_delay/      ← Kemenangan Cepat (opsional disimpan)
    ├── modul08_jebakan_delay/          ← Praktik 1 (versi delay)
    ├── modul08_obat_millis/            ← Praktik 1 (versi millis)
    ├── modul08_tiga_tugas/             ← Praktik 2 ⭐
    ├── modul08_siram_state_machine/    ← Praktik 3
    ├── modul08_modular/                ← Praktik 4 (5 file: .ino + detak.h/.cpp + tombol.h/.cpp)
    ├── modul08_ambang_nvs/             ← Praktik 5 ⭐
    ├── modul08_watchdog/               ← Praktik 6 ⭐
    ├── modul08_berburu_bug/            ← Praktik 7 (3 file: .ino + pencatat.h/.cpp)
    └── catatan-debugging.md            ← Praktik 7
```

### Praktik 1 — Jebakan `delay()`: buktikan sendiri (20 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor**, atau Wokwi dengan [`diagram.json`](kode/modul08_jebakan_delay/diagram.json) rangkaian kecil (sama dengan Kemenangan Cepat). Komponen: LED status (D4) dan tombol manual (D13) yang sudah terpasang sejak Modul 2 dan 5. Konsep yang dipakai: 1–3.

#### 1.1 Versi `delay()`: hitung tekanan yang hilang

1. Buat sketsa baru bernama `modul08_jebakan_delay`, tempel kode ini, lalu klik **Upload** dan buka Serial Monitor:

   ```cpp
   // Modul 8 - Praktik 1 (bagian A): jebakan delay()
   // Rangkaian sama dengan Kemenangan Cepat: LED status di D4, tombol di D13.
   // LED berkedip dengan delay(). Tekan tombol 5 kali dengan tempo santai: berapa yang tercatat?

   const int PIN_LED_STATUS = 4;
   const int PIN_TOMBOL = 13;

   int jumlahTekan = 0;
   int jumlahPutaran = 0;

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     Serial.println("Praktik 1A - versi delay(): tekan tombol 5 kali, lalu hitung yang tercatat.");
   }

   void loop() {
     jumlahPutaran++;

     digitalWrite(PIN_LED_STATUS, HIGH);
     delay(1000);  // ESP32 menunggu 1 detik tanpa melakukan apa pun
     digitalWrite(PIN_LED_STATUS, LOW);
     delay(1000);  // menunggu 1 detik lagi

     // Tombol hanya diperiksa di sini: sekali setiap 2 detik!
     if (digitalRead(PIN_TOMBOL) == LOW) {
       jumlahTekan++;
       Serial.println("Tombol terbaca ditekan!");
     }

     Serial.print("Putaran loop() ke-");
     Serial.print(jumlahPutaran);
     Serial.print(" selesai pada detik ke-");
     Serial.print(millis() / 1000);
     Serial.print(". Tombol tercatat: ");
     Serial.print(jumlahTekan);
     Serial.println(" kali.");
   }
   ```

2. Tunggu sampai baris pertama muncul. LED status menyala 1 detik, lalu padam 1 detik, bergantian.
3. Tekan tombol **lima kali** dengan tempo santai, kira-kira satu tekanan per detik. Tekan sebentar seperti biasa, jangan ditahan. Hitung sendiri berapa kali kamu menekan.
4. Lihat angka `Tombol tercatat:` di Serial Monitor.

   **Hasilnya** di Wokwi, setelah lima tekanan:

   ```text
   Praktik 1A - versi delay(): tekan tombol 5 kali, lalu hitung yang tercatat.
   Putaran loop() ke-1 selesai pada detik ke-2. Tombol tercatat: 0 kali.
   Putaran loop() ke-2 selesai pada detik ke-4. Tombol tercatat: 0 kali.
   Putaran loop() ke-3 selesai pada detik ke-6. Tombol tercatat: 0 kali.
   Putaran loop() ke-4 selesai pada detik ke-8. Tombol tercatat: 0 kali.
   Putaran loop() ke-5 selesai pada detik ke-10. Tombol tercatat: 0 kali.
   Putaran loop() ke-6 selesai pada detik ke-12. Tombol tercatat: 0 kali.
   ```

Lima kali ditekan, **tidak satu pun** tercatat. Di papan asli, hasilnya biasanya `0` atau `1`. Tombol hanya diperiksa **sekali setiap 2 detik**, tepat setelah dua `delay(1000)` selesai. Tekanan tercatat hanya kalau kebetulan tombol **sedang ditekan** pada saat itu. Coba sekarang **tahan** tombol selama 3 detik: tekanan itu pasti tercatat karena tombolmu masih ditekan saat akhirnya diperiksa. Programmu hanya melihat dunia sekali setiap 2 detik. Inilah jebakan `delay()`.

#### 1.2 Versi `millis()`: tidak ada yang hilang

1. Buat sketsa baru bernama `modul08_obat_millis`, tempel kode ini, klik **Upload**, lalu buka Serial Monitor:

   ```cpp
   // Modul 8 - Praktik 1 (bagian B): obatnya, pola millis()
   // Rangkaian sama: LED status di D4, tombol di D13.
   // LED tetap berganti setiap 1 detik, tetapi tombol diperiksa ribuan kali per detik.

   const int PIN_LED_STATUS = 4;
   const int PIN_TOMBOL = 13;
   const unsigned long JEDA_KEDIP = 1000;  // LED berganti setiap 1 detik, sama seperti versi delay()
   const unsigned long JEDA_LAPOR = 2000;  // lapor setiap 2 detik
   const unsigned long JEDA_PANTUL = 30;   // milidetik: bacaan tombol harus tenang selama ini

   unsigned long waktuKedipTerakhir = 0;
   unsigned long waktuLaporTerakhir = 0;
   unsigned long waktuBacaanBerubah = 0;
   bool ledMenyala = false;
   int bacaanTadi = HIGH;
   int tombolStabil = HIGH;
   int jumlahTekan = 0;
   unsigned long jumlahPutaran = 0;  // putaran loop() sejak laporan terakhir

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     Serial.println("Praktik 1B - versi millis(): tekan tombol 5 kali lagi.");
   }

   void loop() {
     unsigned long sekarang = millis();
     jumlahPutaran++;

     // Tugas 1: LED, dengan pola millis(): "sudah lewat 1 detik sejak terakhir berganti?"
     if (sekarang - waktuKedipTerakhir >= JEDA_KEDIP) {
       waktuKedipTerakhir = sekarang;
       ledMenyala = !ledMenyala;
       digitalWrite(PIN_LED_STATUS, ledMenyala);
     }

     // Tugas 2: tombol, diperiksa di setiap putaran
     int bacaan = digitalRead(PIN_TOMBOL);
     if (bacaan != bacaanTadi) {
       bacaanTadi = bacaan;
       waktuBacaanBerubah = sekarang;
     }
     if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
       tombolStabil = bacaan;
       if (tombolStabil == LOW) {
         jumlahTekan++;
         Serial.println("Tombol ditekan!");
       }
     }

     // Tugas 3: laporan setiap 2 detik, termasuk berapa kali loop() sempat berputar
     if (sekarang - waktuLaporTerakhir >= JEDA_LAPOR) {
       waktuLaporTerakhir = sekarang;
       Serial.print("Detik ke-");
       Serial.print(sekarang / 1000);
       Serial.print(": loop() berputar ");
       Serial.print(jumlahPutaran);
       Serial.print(" kali dalam 2 detik terakhir. Tombol tercatat: ");
       Serial.print(jumlahTekan);
       Serial.println(" kali.");
       jumlahPutaran = 0;
     }
   }
   ```

2. LED status berganti nyala-padam setiap 1 detik, persis seperti versi `delay()`.
3. Tekan tombol **lima kali** lagi dengan tempo yang sama.

   **Hasilnya** di Wokwi:

   ```text
   Praktik 1B - versi millis(): tekan tombol 5 kali lagi.
   Detik ke-2: loop() berputar 79298 kali dalam 2 detik terakhir. Tombol tercatat: 0 kali.
   Detik ke-4: loop() berputar 105829 kali dalam 2 detik terakhir. Tombol tercatat: 0 kali.
   Tombol ditekan!
   Tombol ditekan!
   Detik ke-6: loop() berputar 105707 kali dalam 2 detik terakhir. Tombol tercatat: 2 kali.
   Tombol ditekan!
   Detik ke-8: loop() berputar 105683 kali dalam 2 detik terakhir. Tombol tercatat: 3 kali.
   Tombol ditekan!
   Tombol ditekan!
   Detik ke-10: loop() berputar 105662 kali dalam 2 detik terakhir. Tombol tercatat: 5 kali.
   Detik ke-12: loop() berputar 105825 kali dalam 2 detik terakhir. Tombol tercatat: 5 kali.
   ```

Kelima tekanan tercatat. Perhatikan juga angka `loop() berputar …`. Versi `delay()` hanya berputar **satu kali** setiap 2 detik, sedangkan versi `millis()` berputar sekitar **100 ribu kali** dalam 2 detik di Wokwi. Di papan asli, angkanya bisa beberapa kali lipat lebih besar karena simulator lebih lambat daripada chip aslinya. Di setiap putaran itu, tombol diperiksa sekali, jadi tidak ada tekanan yang bisa lolos.

#### 1.3 Bedah kodenya

Kedua sketsa mengerjakan hal yang sama, tetapi cara berpikirnya berbeda:

| | Versi `delay()` | Versi `millis()` |
| :--- | :--- | :--- |
| Cara LED berkedip | nyalakan → **tidur** 1 detik → padamkan → **tidur** 1 detik | setiap putaran: "sudah 1 detik sejak terakhir berganti?" Kalau ya, ganti. |
| Kapan tombol diperiksa | sekali setiap 2 detik, sesudah tidur | di **setiap** putaran, puluhan ribu kali per detik |
| Yang dicatat | tidak ada | `waktuKedipTerakhir`, `waktuLaporTerakhir`, `waktuBacaanBerubah` |
| Jumlah putaran `loop()` | 1 setiap 2 detik | puluhan ribu per detik |

Bagian tombol di versi `millis()` patut dibaca pelan-pelan:

```cpp
int bacaan = digitalRead(PIN_TOMBOL);
if (bacaan != bacaanTadi) {        // bacaan berubah: ditekan, dilepas, memantul, atau derau
  bacaanTadi = bacaan;
  waktuBacaanBerubah = sekarang;   // mulai menghitung "tenang" dari nol lagi
}
if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
  tombolStabil = bacaan;           // sudah tenang 30 ms: perubahan ini sungguhan
  if (tombolStabil == LOW) {       // berubah dari dilepas menjadi ditekan: satu tekanan!
    jumlahTekan++;
  }
}
```

- **`tombolStabil`** menyimpan keadaan tombol yang sudah dipercaya. Satu tekanan dihitung saat keadaan itu **berubah** dari dilepas (`HIGH`) menjadi ditekan (`LOW`), bukan selama tombol ditekan. Itulah sebabnya tekanan yang ditahan tetap dihitung satu kali.
- **`bacaanTadi` dan `waktuBacaanBerubah`** mencatat kapan bacaan tombol terakhir berubah. Perubahan baru dipercaya setelah bacaannya **tenang** selama `JEDA_PANTUL` (30 ms). Setiap pantulan atau derau sesaat membuat hitungan tenangnya mulai lagi dari nol, jadi keduanya tidak pernah terhitung sebagai tekanan. Idenya sama dengan Modul 5 ("tunggu 30 ms, lalu periksa lagi"). Bedanya, kita tidak **menunggu** dengan `delay()`; kita hanya **mencatat** kapan bacaan terakhir berubah, lalu memeriksanya lagi di putaran-putaran berikutnya.

#### 1.4 Bereksperimen

- Di sketsa `modul08_obat_millis`, tambahkan `delay(100);` sebagai baris terakhir di dalam `loop()`, lalu unggah lagi. Jumlah putarannya anjlok menjadi sekitar dua puluh kali dalam 2 detik. Tekanan biasa mungkin masih tercatat, tetapi coba tekan **secepat kilat** beberapa kali: sebagian bisa hilang. Pelajarannya: `delay()` kecil pun memperlambat seluruh program. Hapus lagi baris itu.
- Ubah `JEDA_KEDIP` menjadi `250`. LED berkedip lebih cepat, sedangkan laporan tetap setiap 2 detik. Dua jadwal itu tidak saling memengaruhi.

> ➡️ **Selesai Praktik 1?** Lanjut ke [Praktik 2](#praktik-2--tiga-tugas-satu-loop-30-menit).

### Praktik 2 — Tiga tugas, satu `loop()` (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (library **DHT sensor library** dari Modul 6 sudah terpasang) dan **Serial Monitor**, atau Wokwi dengan [`diagram.json`](kode/modul08_tiga_tugas/diagram.json) Node 1 lengkap dan [`libraries.txt`](kode/modul08_tiga_tugas/libraries.txt). Komponen yang dipakai: LED status (D4), tombol (D13), relay lampu (D32), relay kipas (D33), dan DHT22 (D14). MB102 menyala. Konsep yang dipakai: 1–3.
>
> ⭐ **Wajib** — bagian dari syarat lulus: tiga tugas berjalan bergantian tanpa `delay()`, dan tombol mengenali tekan pendek dan tekan lama.

Di praktik ini, tiga tugas berjalan dalam satu `loop()`:

1. **Detak jantung.** LED status menyala sebentar setiap 1 detik, tanda program sehat. Kalau sensor bermasalah, iramanya menjadi **cepat**: empat kedip per detik. Inilah janji dari Modul 2: "kedip pelan = program jalan normal, …, kedip cepat = ada masalah".
2. **Sensor.** DHT22 dibaca setiap 2 detik.
3. **Tombol.** **Tekan pendek** (kurang dari 1 detik) menyalakan atau memadamkan lampu. **Tekan lama** (ditahan 1 detik) menyalakan atau memadamkan kipas.

#### 2.1 Unggah dan amati

1. Colokkan USB, lalu nyalakan MB102.
2. Buat sketsa baru bernama `modul08_tiga_tugas`, tempel kode ini, klik **Upload**, lalu buka Serial Monitor:

   ```cpp
   // Modul 8 - Praktik 2: tiga tugas, satu loop()
   // Rangkaian: meja kerja Node 1 (Modul 7). Yang dipakai: LED status D4, tombol D13,
   // relay lampu D32, relay kipas D33, dan DHT22 di D14.
   // Library: DHT sensor library 1.4.7 (ikut terpasang: Adafruit Unified Sensor 1.1.15).
   //
   // Tugas 1 - detak: LED status kedip pelan = normal, kedip cepat = sensor bermasalah.
   // Tugas 2 - sensor: DHT22 dibaca setiap 2 detik.
   // Tugas 3 - tombol: tekan pendek = lampu, tekan lama (1 detik) = kipas.

   #include <DHT.h>

   const int PIN_LED_STATUS = 4;
   const int PIN_TOMBOL = 13;
   const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW
   const int PIN_RELAY_KIPAS = 33;  // relay aktif LOW
   const int PIN_DHT = 14;

   // Jadwal, semuanya dalam milidetik
   const unsigned long DETAK_NORMAL = 1000;      // satu kedip setiap 1 detik
   const unsigned long DETAK_MASALAH = 250;      // empat kedip setiap 1 detik
   const unsigned long LAMA_NYALA_DETAK = 100;   // LED menyala 100 ms di awal setiap detak
   const unsigned long JEDA_BACA = 2000;         // DHT22 dibaca setiap 2 detik
   const unsigned long JEDA_PANTUL = 30;         // bacaan tombol harus tenang selama ini
   const unsigned long BATAS_TEKAN_LAMA = 1000;  // ditahan 1 detik atau lebih = tekan lama

   DHT dht(PIN_DHT, DHT22);

   // Catatan waktu dan keadaan setiap tugas
   unsigned long waktuDetakMulai = 0;
   bool sensorBermasalah = false;

   unsigned long waktuBacaTerakhir = 0;

   int bacaanTadi = HIGH;    // bacaan tombol di putaran sebelumnya; HIGH = dilepas
   unsigned long waktuBacaanBerubah = 0;
   int tombolStabil = HIGH;  // keadaan tombol yang sudah dipercaya (sudah tenang 30 ms)
   unsigned long waktuMulaiTekan = 0;
   bool tekanLamaSudah = false;

   bool lampuMenyala = false;
   bool kipasMenyala = false;

   // Pengukur kesehatan loop()
   unsigned long jumlahPutaran = 0;
   unsigned long putaranTerlamaUs = 0;  // mikrodetik

   void aturRelay(int pin, bool nyala) {
     if (nyala) {
       digitalWrite(pin, LOW);  // relay aktif LOW
     } else {
       digitalWrite(pin, HIGH);
     }
   }

   const char* teksOnOff(bool nyala) {
     if (nyala) {
       return "on";
     }
     return "off";
   }

   // ---------- Tugas 1: detak jantung ----------
   void perbaruiDetak() {
     unsigned long sekarang = millis();
     unsigned long panjangDetak = DETAK_NORMAL;
     if (sensorBermasalah) {
       panjangDetak = DETAK_MASALAH;
     }
     if (sekarang - waktuDetakMulai >= panjangDetak) {
       waktuDetakMulai = sekarang;  // mulai detak berikutnya
     }
     // LED menyala hanya di awal detak: true = HIGH (nyala), false = LOW (padam)
     digitalWrite(PIN_LED_STATUS, sekarang - waktuDetakMulai < LAMA_NYALA_DETAK);
   }

   // ---------- Tugas 2: membaca DHT22 setiap 2 detik ----------
   void bacaSensorTerjadwal() {
     if (millis() - waktuBacaTerakhir < JEDA_BACA) {
       return;  // belum waktunya: langsung kembali, tidak menunggu
     }
     waktuBacaTerakhir = millis();

     float suhu = dht.readTemperature();
     float kelembapan = dht.readHumidity();
     sensorBermasalah = isnan(suhu) || isnan(kelembapan);

     if (sensorBermasalah) {
       Serial.print("DHT22 tidak terbaca! LED status berkedip cepat.");
     } else {
       Serial.print("suhu=");
       Serial.print(suhu, 1);
       Serial.print(" C  kelembapan=");
       Serial.print(kelembapan, 0);
       Serial.print(" %");
     }
     Serial.print("  | loop(): ");
     Serial.print(jumlahPutaran);
     Serial.print(" putaran, terlama ");
     Serial.print(putaranTerlamaUs / 1000.0, 1);
     Serial.println(" ms");
     jumlahPutaran = 0;
     putaranTerlamaUs = 0;
   }

   // ---------- Tugas 3: tombol, tekan pendek dan tekan lama ----------
   void tekanPendek() {
     lampuMenyala = !lampuMenyala;
     aturRelay(PIN_RELAY_LAMPU, lampuMenyala);
     Serial.print("Tekan pendek: lampu ");
     Serial.println(teksOnOff(lampuMenyala));
   }

   void tekanLama() {
     kipasMenyala = !kipasMenyala;
     aturRelay(PIN_RELAY_KIPAS, kipasMenyala);
     Serial.print("Tekan lama: kipas ");
     Serial.println(teksOnOff(kipasMenyala));
   }

   void periksaTombol() {
     unsigned long sekarang = millis();
     int bacaan = digitalRead(PIN_TOMBOL);

     // 1. Bacaan berubah (ditekan, dilepas, memantul, atau derau)? Hitung "tenang"-nya dari nol lagi.
     if (bacaan != bacaanTadi) {
       bacaanTadi = bacaan;
       waktuBacaanBerubah = sekarang;
     }

     // 2. Sudah tenang 30 ms dan berbeda dengan keadaan yang dipercaya? Itu perubahan sungguhan.
     if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
       tombolStabil = bacaan;
       if (tombolStabil == LOW) {  // baru saja ditekan: mulai menghitung lamanya
         waktuMulaiTekan = sekarang;
         tekanLamaSudah = false;
       } else if (!tekanLamaSudah) {  // baru saja dilepas sebelum 1 detik: tekan pendek
         tekanPendek();
       }
     }

     // 3. Masih ditahan dan sudah 1 detik? Tekan lama, dikerjakan sekali tanpa menunggu jari diangkat.
     if (tombolStabil == LOW && !tekanLamaSudah && sekarang - waktuMulaiTekan >= BATAS_TEKAN_LAMA) {
       tekanLamaSudah = true;
       tekanLama();
     }
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     pinMode(PIN_RELAY_LAMPU, OUTPUT);
     pinMode(PIN_RELAY_KIPAS, OUTPUT);
     aturRelay(PIN_RELAY_LAMPU, false);  // segera matikan: pinMode(OUTPUT) membuat pin LOW (= relay menarik)
     aturRelay(PIN_RELAY_KIPAS, false);
     dht.begin();
     Serial.println("Praktik 2 - tiga tugas, satu loop(). Tekan pendek = lampu, tekan lama = kipas.");
   }

   void loop() {
     unsigned long mulai = micros();  // mikrodetik: untuk mengukur lama putaran ini

     perbaruiDetak();
     bacaSensorTerjadwal();
     periksaTombol();

     jumlahPutaran++;
     unsigned long lama = micros() - mulai;
     if (lama > putaranTerlamaUs) {
       putaranTerlamaUs = lama;
     }
   }
   ```

3. Amati LED status: ia menyala sekejap setiap detik, seperti detak jantung. Setiap 2 detik, Serial Monitor mencetak bacaan DHT22 dan dua angka tentang `loop()`.

   **Hasilnya** di Wokwi (angka putaran di papan asli jauh lebih besar):

   ```text
   Praktik 2 - tiga tugas, satu loop(). Tekan pendek = lampu, tekan lama = kipas.
   suhu=28.5 C  kelembapan=71 %  | loop(): 26100 putaran, terlama 0.1 ms
   suhu=28.5 C  kelembapan=71 %  | loop(): 34833 putaran, terlama 7.1 ms
   suhu=28.5 C  kelembapan=71 %  | loop(): 34985 putaran, terlama 7.1 ms
   suhu=28.5 C  kelembapan=71 %  | loop(): 34854 putaran, terlama 7.1 ms
   Tekan pendek: lampu on
   suhu=28.5 C  kelembapan=71 %  | loop(): 34710 putaran, terlama 7.1 ms
   Tekan lama: kipas on
   suhu=28.5 C  kelembapan=71 %  | loop(): 34470 putaran, terlama 7.1 ms
   suhu=28.5 C  kelembapan=71 %  | loop(): 34787 putaran, terlama 7.1 ms
   ```

4. **Tekan pendek:** tekan tombol sebentar. Relay lampu berbunyi "klik" dan LED indikatornya menyala (sejak Modul 5, itulah "lampu" Node 1 di meja kerja); Serial mencetak `Tekan pendek: lampu on`. Tekan sebentar lagi untuk memadamkannya.
5. **Tekan lama:** tekan dan **tahan** tombol. Tepat 1 detik setelah mulai ditekan, tanpa menunggu kamu melepasnya, relay kipas berbunyi "klik" dan kipas berputar; Serial mencetak `Tekan lama: kipas on`. Lepaskan. Ulangi untuk mematikan kipas.
6. Perhatikan yang **tidak** terjadi: selama tombol ditahan, LED status tetap berdetak dan laporan tetap muncul setiap 2 detik. Node 1 v0.4.0 justru membeku selama tombol ditahan.

**Di Wokwi:** tempel `diagram.json`, lalu klik tab **Library Manager** → tombol bulat **+** → ketik **DHT sensor library** → klik hasilnya. Setelah tab `libraries.txt` muncul, ganti seluruh isinya dengan isi [`libraries.txt`](kode/modul08_tiga_tugas/libraries.txt) praktik ini. Tempel kodenya ke tab `sketch.ino`, lalu klik **▶**. Setelah simulasi berjalan, klik area kosong di panel simulasi, lalu tekan **F** supaya seluruh rangkaian terlihat. Tombol hijau bertuliskan `D13` ada di ujung kiri rangkaian, di samping DHT22 (kotak putih berkisi). Lampu digambarkan sebagai LED kuning bertuliskan `lampu` di atas relay kanan, dan kipas sebagai LED biru bertuliskan `kipas` di atas relay kiri. Untuk tekan lama, tahan tombol mouse di atas tombol hijau selama **2–3 detik** karena simulator berjalan lebih lambat daripada jam sungguhan (lihat persentase kecepatan di kanan atas panel simulasi).

![Tangkapan layar Wokwi Praktik 2, diperkecil dengan tombol F lalu dipotong; label nama komponen ditambahkan penulis. Atas, seluruh rangkaian Node 1 dengan label tombol D13 di ujung kiri, DHT22 (D14) di sebelahnya, kipas (LED biru) di atas relay kiri dan lampu (LED kuning) di atas relay kanan, serta LED status (D4) di bawah papan; catatan di kanan: kedua LED di atas relay menyala, lampu dan kipas sedang on di simulasi. Bawah, Serial Monitor: baris suhu=28.5 C kelembapan=71 % disertai loop(): sekitar 35.000 putaran, terlama 6,9 sampai 7,1 ms; di antaranya Tekan pendek: lampu on (penanda 1, klik sebentar: LED kuning menyala) dan Tekan lama: kipas on (penanda 2, tahan 1 detik, di Wokwi 2 sampai 3 detik: LED biru langsung menyala). Penanda 3 pada laporan sesudah tekan lama, loop(): 34691 putaran, terlama 7.1 ms: putaran terlama tetap sekitar 7 ms karena laporan ini mencakup saat tombol sedang ditahan](aset/wokwi-tiga-tugas.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

#### 2.2 Bedah kodenya: tiga tugas, tiga catatan waktu

`loop()` di sketsa ini hanya memanggil tiga fungsi, dan setiap fungsi langsung kembali kalau belum waktunya:

- **`perbaruiDetak()`** membagi waktu menjadi "detak" sepanjang 1.000 ms (atau 250 ms kalau ada masalah). LED hanya menyala di 100 ms pertama setiap detak. Di setiap putaran, ia menghitung `sekarang - waktuDetakMulai`: kalau kurang dari 100, LED menyala; kalau sudah lewat satu detak penuh, detak baru dimulai.
- **`bacaSensorTerjadwal()`** memakai bentuk lain dari pola yang sama: "kalau **belum** waktunya, langsung `return`". Bentuk ini enak dipakai untuk tugas yang panjang karena isinya tidak perlu menjorok ke dalam `if`.
- **`periksaTombol()`** mengingat **kapan tombol mulai ditekan** (`waktuMulaiTekan`). Saat tombol dilepas sebelum 1 detik, itu tekan pendek. Kalau tombol masih ditahan dan sudah 1 detik berlalu, itu tekan lama, dan langsung dikerjakan saat itu juga, sekali saja (`tekanLamaSudah` mencegahnya terulang selama tombol masih ditahan). Pantulan dan derau disaring dengan cara yang sama seperti Praktik 1: perubahan baru dipercaya setelah tenang 30 ms.
- **`const char* teksOnOff(bool nyala)`** menjawab teks tetap, `"on"` atau `"off"`. Ingat Modul 3: `const char*` adalah nama C++ untuk teks di antara petik ganda. Di Node 1 v0.4.0, fungsi ini menjawab `String`; teks tetap seperti ini tidak perlu meminjam memori (Konsep 6). Arti tanda `*` di situ ada di 🔬 "*Pointer* dan *reference*".

![Diagram sinyal pin D13 dengan INPUT_PULLUP, HIGH berarti dilepas dan LOW berarti ditekan, dalam dua garis waktu 0 sampai 2000 ms. Catatan atas: perubahan baru dipercaya setelah bacaannya tenang 30 ms; pantulan dan derau sesaat tidak terhitung. Atas, tekan pendek: sinyal turun ke LOW pada 200 ms dengan pantulan singkat, dan sekitar 30 ms sesudah pantulan terakhir dicatat sebagai mulai ditekan; sinyal naik lagi pada sekitar 600 ms dengan pantulan, sebelum batas 1 detik, dan setelah tenang 30 ms, saat itulah tekanPendek() dipanggil. Bawah, tekan lama: sinyal turun pada 200 ms dan tetap LOW; tepat 1 detik sesudah mulai ditekan, pada sekitar 1250 ms, tekanLama() langsung dipanggil walaupun tombol masih ditahan; saat dilepas pada sekitar 1700 ms, tidak ada yang dipanggil](aset/tombol-pendek-lama.png)

Dua angka di akhir setiap laporan adalah **alat ukur kesehatan `loop()`**:

- **`putaran`**: berapa kali `loop()` berputar dalam 2 detik terakhir.
- **`terlama`**: putaran paling lama dalam 2 detik itu, diukur dengan `micros()` (jam mikrodetik, saudara `millis()`). Angka sekitar 7 ms di Wokwi berasal dari putaran tempat DHT22 dibaca. Putaran lainnya jauh lebih singkat, hanya puluhan mikrodetik: laporan pertama, yang dicetak sebelum DHT22 sempat dibaca, menunjukkan `terlama 0.1 ms`.

Angka `terlama` adalah ukuran paling jujur untuk "seberapa lama program ini bisa tuli". Program ini paling lama tuli sekitar 7 ms. Bandingkan dengan Node 1 v0.4.0, yang tuli **3.000 ms** setiap kali pompa menyala.

#### 2.3 Uji "sensor rusak": kedip cepat

Sekarang buktikan bahwa LED status benar-benar memberi tahu saat ada masalah.

1. Matikan MB102, lalu cabut USB.
2. Cabut ujung kabel **kuning** (kabel DATA DHT22) dari lubang **8f** breadboard atas, tepat di atas kaki **D14** (lihat gambar meja kerja di [Modul 6, Praktik 4.2](../modul-06-membaca-sensor/README.md#42-pasang-modul-dht22)).
3. Colokkan USB, lalu nyalakan MB102. LED status kini berkedip **cepat**, dan setiap laporan berbunyi:

   ```text
   DHT22 tidak terbaca! LED status berkedip cepat.  | loop(): 34500 putaran, terlama 40.6 ms
   ```

   Di Wokwi, `terlama` naik menjadi sekitar 40 ms: library DHT menunggu jawaban yang tidak pernah datang sampai batas waktunya habis, lalu menyerah. Angka di papan asli bisa berbeda, tetapi intinya sama: menunggunya ada batasnya, jadi `loop()` tetap berputar.
4. Matikan MB102, cabut USB, kembalikan kabel kuning ke **8f**, lalu nyalakan lagi (USB dulu, baru MB102). LED kembali berkedip pelan.

**Di Wokwi:** hentikan simulasi (**■**), klik kabel kuning yang keluar dari DHT22 sampai tersorot, tekan **Delete**, lalu jalankan lagi (**▶**). Setelah selesai, tempel ulang `diagram.json` untuk mengembalikan kabelnya.

#### 2.4 Bereksperimen

- Ubah `BATAS_TEKAN_LAMA` menjadi `2000`. Kini tekan lama berarti ditahan 2 detik.
- Tambahkan tugas keempat dengan pola yang sama: cetak `Masih hidup!` setiap 10 detik. Kamu hanya butuh satu variabel `waktu…Terakhir` baru, satu `if` baru di fungsi baru, dan satu baris di `loop()` untuk memanggil fungsi itu.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 4](#4-state-machine-keadaan-dan-aturan-pindah).

### Praktik 3 — *State machine* penyiraman (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor**, atau Wokwi dengan [`diagram.json`](kode/modul08_siram_state_machine/diagram.json) Node 1 lengkap. Komponen yang dipakai: LED status (D4), tombol (D13), relay lampu (D32), pompa (D25) beserta tandon dan selangnya, sensor tanah (VN), dan HC-SR04 (D15 dan D35). MB102 menyala. Konsep yang dipakai: 4.

Sketsa ini memindahkan aturan siram otomatis Modul 6 ke dalam *state machine* tiga keadaan. Tombol tetap bekerja selama pompa menyala: **tekan pendek** untuk lampu, **tekan lama** untuk "siram sekarang".

#### 3.1 Siapkan pompa dan sensor tanah

1. Pastikan tandon berisi air (lebih dari 20 %), sensor tanah tertancap di tanah lembap (atau dicelupkan ke gelas air), dan ujung selang pompa mengarah ke gelas tanaman atau kembali ke tandon, seperti di Modul 6.
2. Colokkan USB, lalu nyalakan MB102.

#### 3.2 Unggah dan amati keadaan SIAGA

1. Buat sketsa baru bernama `modul08_siram_state_machine`, tempel kode ini, klik **Upload**, lalu buka Serial Monitor:

   ```cpp
   // Modul 8 - Praktik 3: state machine penyiraman
   // Rangkaian: meja kerja Node 1 (Modul 7). Yang dipakai: LED status D4, tombol D13, relay lampu D32,
   // pompa D25 (lewat MOSFET), sensor tanah di VN (GPIO 39), dan HC-SR04 (TRIG D15, ECHO D35).
   //
   // Penyiraman punya tiga keadaan: SIAGA -> MENYIRAM -> JEDA -> SIAGA.
   // Selama pompa menyala, LED status tetap berdetak dan tombol tetap bekerja:
   // tekan pendek = lampu, tekan lama (1 detik) = siram sekarang.

   const int PIN_LED_STATUS = 4;
   const int PIN_TOMBOL = 13;
   const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW
   const int PIN_RELAY_KIPAS = 33;  // tidak dipakai di sini, tetapi relay-nya dimatikan supaya diam
   const int PIN_POMPA = 25;        // gerbang MOSFET: HIGH = pompa menyala
   const int PIN_TANAH = 39;        // VN
   const int PIN_TRIG = 15;
   const int PIN_ECHO = 35;

   // Hasil kalibrasimu dari Modul 6 (ganti dengan angkamu sendiri)
   const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
   const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
   const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
   const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

   // Aturan penyiraman
   const int AMBANG_TANAH_SIRAM = 30;        // siram kalau tanah di bawah 30 %
   const int LEVEL_AIR_MINIMUM = 20;         // pompa ditolak kalau isi tandon di bawah 20 %
   const unsigned long JEDA_PERIKSA = 2000;  // SIAGA: periksa tanah setiap 2 detik
   const unsigned long LAMA_SIRAM = 3000;    // MENYIRAM: pompa menyala 3 detik
   const unsigned long LAMA_JEDA = 30000;    // JEDA: istirahat 30 detik sebelum boleh menyiram lagi

   bool lampuMenyala = false;

   // Tiga keadaan penyiraman. Daftar nama seperti ini (enum) ditulis di atas, sebelum fungsi mana pun.
   enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };
   KeadaanSiram keadaan = SIAGA;            // keadaan sekarang; mulai dari SIAGA
   unsigned long waktuMasukKeadaan = 0;     // kapan keadaan sekarang dimulai
   unsigned long waktuPeriksaTerakhir = 0;  // kapan tanah terakhir diperiksa

   // ---------- Detak jantung (LED status) ----------
   const unsigned long DETAK_NORMAL = 1000;     // satu kedip setiap 1 detik
   const unsigned long DETAK_MASALAH = 250;     // empat kedip setiap 1 detik
   const unsigned long LAMA_NYALA_DETAK = 100;  // LED menyala 100 ms di awal setiap detak
   bool iramaMasalah = false;                   // true = kedip cepat
   unsigned long waktuDetakMulai = 0;

   void perbaruiDetak() {
     unsigned long sekarang = millis();
     unsigned long panjangDetak = DETAK_NORMAL;
     if (iramaMasalah) {
       panjangDetak = DETAK_MASALAH;
     }
     if (sekarang - waktuDetakMulai >= panjangDetak) {
       waktuDetakMulai = sekarang;  // mulai detak berikutnya
     }
     digitalWrite(PIN_LED_STATUS, sekarang - waktuDetakMulai < LAMA_NYALA_DETAK);
   }

   // ---------- Tombol: tekan pendek dan tekan lama ----------
   const unsigned long JEDA_PANTUL = 30;         // milidetik: bacaan harus tenang selama ini
   const unsigned long BATAS_TEKAN_LAMA = 1000;  // ditahan 1 detik atau lebih = tekan lama
   int bacaanTadi = HIGH;                        // HIGH = dilepas
   unsigned long waktuBacaanBerubah = 0;
   int tombolStabil = HIGH;                      // keadaan yang sudah dipercaya
   unsigned long waktuMulaiTekan = 0;
   bool tekanLamaSudah = false;

   void periksaTombol() {
     unsigned long sekarang = millis();
     int bacaan = digitalRead(PIN_TOMBOL);
     if (bacaan != bacaanTadi) {
       bacaanTadi = bacaan;
       waktuBacaanBerubah = sekarang;
     }
     if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
       tombolStabil = bacaan;
       if (tombolStabil == LOW) {
         waktuMulaiTekan = sekarang;
         tekanLamaSudah = false;
       } else if (!tekanLamaSudah) {
         tekanPendek();
       }
     }
     if (tombolStabil == LOW && !tekanLamaSudah && sekarang - waktuMulaiTekan >= BATAS_TEKAN_LAMA) {
       tekanLamaSudah = true;
       tekanLama();
     }
   }

   // ---------- Sensor tanah dan tandon (Modul 6) ----------
   int bacaTanahPersen() {
     long jumlah = 0;
     for (int i = 0; i < 20; i++) {
       jumlah += analogRead(PIN_TANAH);  // 20 bacaan berturut-turut, tanpa jeda (selesai dalam sekejap)
     }
     int persen = map(jumlah / 20, TANAH_KERING, TANAH_BASAH, 0, 100);
     return constrain(persen, 0, 100);
   }

   // Menjawab persen isi tandon, atau -1 kalau gema HC-SR04 tidak kembali.
   int bacaLevelAir() {
     digitalWrite(PIN_TRIG, LOW);
     delayMicroseconds(2);
     digitalWrite(PIN_TRIG, HIGH);
     delayMicroseconds(10);
     digitalWrite(PIN_TRIG, LOW);
     unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);  // menunggu paling lama 30 ms
     if (durasi == 0) {
       return -1;
     }
     float jarak = durasi / 58.0;
     int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
     return constrain(persen, 0, 100);
   }

   // ---------- State machine penyiraman ----------
   const char* namaKeadaan(KeadaanSiram k) {
     if (k == SIAGA) {
       return "SIAGA";
     }
     if (k == MENYIRAM) {
       return "MENYIRAM";
     }
     return "JEDA";
   }

   // Satu-satunya tempat keadaan berganti: catat waktunya dan laporkan perpindahannya.
   void pindahKe(KeadaanSiram keadaanBaru) {
     Serial.print("[");
     Serial.print(namaKeadaan(keadaan));
     Serial.print(" -> ");
     Serial.print(namaKeadaan(keadaanBaru));
     Serial.println("]");
     keadaan = keadaanBaru;
     waktuMasukKeadaan = millis();
   }

   // Mencoba menyalakan pompa. Pengaman tandon (Modul 6): air kurang = ditolak, lalu beristirahat.
   void mulaiMenyiram() {
     int levelAir = bacaLevelAir();
     if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
       Serial.print("Pompa DITOLAK: air tandon ");
       if (levelAir < 0) {
         Serial.println("tidak terbaca.");
       } else {
         Serial.print(levelAir);
         Serial.println(" %.");
       }
       iramaMasalah = true;  // LED status berkedip cepat: isi tandonnya!
       pindahKe(JEDA);
       return;
     }
     iramaMasalah = false;
     Serial.print("Pompa menyala (air tandon ");
     Serial.print(levelAir);
     Serial.println(" %).");
     digitalWrite(PIN_POMPA, HIGH);
     pindahKe(MENYIRAM);
   }

   void jalankanPenyiraman() {
     unsigned long sekarang = millis();

     if (keadaan == SIAGA) {
       // SIAGA: periksa tanah setiap 2 detik; kalau kering, mulai menyiram
       if (sekarang - waktuPeriksaTerakhir >= JEDA_PERIKSA) {
         waktuPeriksaTerakhir = sekarang;
         int tanah = bacaTanahPersen();
         Serial.print("SIAGA: tanah ");
         Serial.print(tanah);
         Serial.println(" %");
         if (tanah < AMBANG_TANAH_SIRAM) {
           mulaiMenyiram();
         }
       }
     } else if (keadaan == MENYIRAM) {
       // MENYIRAM: pompa padam setelah 3 detik, lalu beristirahat
       if (sekarang - waktuMasukKeadaan >= LAMA_SIRAM) {
         digitalWrite(PIN_POMPA, LOW);
         Serial.println("Pompa padam.");
         pindahKe(JEDA);
       }
     } else if (keadaan == JEDA) {
       // JEDA: tunggu 30 detik supaya air sempat meresap sebelum tanah diperiksa lagi
       if (sekarang - waktuMasukKeadaan >= LAMA_JEDA) {
         pindahKe(SIAGA);
       }
     }
   }

   // ---------- Yang dikerjakan tombol ----------
   void tekanPendek() {
     lampuMenyala = !lampuMenyala;
     if (lampuMenyala) {
       digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
       Serial.println("Tombol: lampu on");
     } else {
       digitalWrite(PIN_RELAY_LAMPU, HIGH);
       Serial.println("Tombol: lampu off");
     }
   }

   void tekanLama() {
     if (keadaan == SIAGA) {
       Serial.println("Tombol ditahan: siram sekarang!");
       mulaiMenyiram();
     } else {
       Serial.print("Tombol ditahan, tetapi penyiraman sedang ");
       Serial.print(namaKeadaan(keadaan));
       Serial.println(". Coba lagi nanti.");
     }
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     pinMode(PIN_RELAY_LAMPU, OUTPUT);
     digitalWrite(PIN_RELAY_LAMPU, HIGH);  // lampu padam (relay aktif LOW)
     pinMode(PIN_RELAY_KIPAS, OUTPUT);
     digitalWrite(PIN_RELAY_KIPAS, HIGH);  // kipas padam
     pinMode(PIN_POMPA, OUTPUT);
     digitalWrite(PIN_POMPA, LOW);
     pinMode(PIN_TRIG, OUTPUT);
     digitalWrite(PIN_TRIG, LOW);
     pinMode(PIN_ECHO, INPUT);
     Serial.println("Praktik 3 - state machine penyiraman: SIAGA -> MENYIRAM -> JEDA -> SIAGA");
   }

   void loop() {
     perbaruiDetak();
     periksaTombol();
     jalankanPenyiraman();
   }
   ```

2. **Ganti angka kalibrasinya dengan milikmu.** Empat angka di bagian "Hasil kalibrasimu dari Modul 6" (`TANAH_KERING`, `TANAH_BASAH`, `JARAK_KOSONG`, `JARAK_PENUH`) harus sama dengan angka di Node 1-mu. Buka Node 1-mu (**File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah**, lalu `node-1-rumah.ino`); sketsa itu terbuka di jendela baru. Salin keempat angka dari bagian `// ---------- Modul 6: hasil kalibrasimu` ke bagian yang sama di sketsa Praktik 3, lalu tutup jendela Node 1 tanpa mengubah apa pun. Setelah itu, klik **Upload** lagi di jendela `modul08_siram_state_machine`. Di Wokwi, biarkan angka bawaannya.
3. Selama tanah lembap, Node 1 berada di keadaan SIAGA dan memeriksa tanah setiap 2 detik: `SIAGA: tanah 70 %`, dan seterusnya. Angkamu tentu berbeda.

#### 3.3 Keringkan tanahnya, lalu ikuti perpindahan keadaannya

1. **Angkat sensor tanah ke udara.** Dalam 2 detik, Node 1 mendapati `tanah` di bawah 30 %, memeriksa air tandon, lalu menyalakan pompa: `[SIAGA -> MENYIRAM]`.
2. **Selama pompa menyala, tekan tombol sebentar.** Relay lampu langsung berbunyi "klik" dan LED indikatornya menyala (`Tombol: lampu on`), padahal pompa belum selesai. Di Node 1 v0.4.0, tekanan itu hilang.
3. Tepat 3 detik kemudian, pompa padam dan Node 1 beristirahat: `[MENYIRAM -> JEDA]`.
4. **Selama JEDA, tekan dan tahan tombol 1 detik** (di Wokwi 2–3 detik). Permintaan "siram sekarang" ditolak dengan sopan karena penyiraman sedang beristirahat.
5. Setelah 30 detik, Node 1 kembali ke SIAGA. Kalau sensornya masih di udara, ia menyiram lagi. **Tancapkan kembali sensornya ke tanah lembap** supaya gelas tanamanmu tidak meluap.

**Hasilnya** di Wokwi (urutannya sama dengan langkah di atas):

```text
Praktik 3 - state machine penyiraman: SIAGA -> MENYIRAM -> JEDA -> SIAGA
SIAGA: tanah 70 %
SIAGA: tanah 70 %
SIAGA: tanah 70 %
SIAGA: tanah 0 %
Pompa menyala (air tandon 52 %).
[SIAGA -> MENYIRAM]
Tombol: lampu on
Pompa padam.
[MENYIRAM -> JEDA]
Tombol ditahan, tetapi penyiraman sedang JEDA. Coba lagi nanti.
[JEDA -> SIAGA]
SIAGA: tanah 0 %
Pompa menyala (air tandon 52 %).
[SIAGA -> MENYIRAM]
Pompa padam.
[MENYIRAM -> JEDA]
```

**Di Wokwi:** klik area kosong di panel simulasi, lalu tekan **F**. Sensor tanah digantikan **potensiometer** (kenop bulat di kanan atas). Untuk "mengangkat sensor ke udara", klik potensiometernya, lalu tekan **End** supaya mentok ke kanan (`tanah 0 %`). Untuk "menancapkannya kembali", seret kenopnya ke tengah sampai `tanah` di atas 30 %. Pompa digambarkan sebagai LED biru muda bertuliskan `pompa`.

![Tangkapan layar Wokwi Praktik 3, diperkecil dengan tombol F lalu dipotong; label nama komponen ditambahkan penulis. Atas, rangkaian Node 1 dengan label tombol D13 di kiri, pompa (LED biru muda): menyala, lampu (LED kuning): menyala, sensor tanah = potensiometer, HC-SR04 (air tandon) di kanan atas, dan LED status (D4) di bawah papan. Bawah, Serial Monitor: tiga baris SIAGA: tanah 70 %, lalu SIAGA: tanah 0 % (penanda 1, potensiometer diputar mentok ke kanan dengan End, seolah sensor diangkat ke udara), Pompa menyala (air tandon 52 %) dan [SIAGA -> MENYIRAM] (penanda 2, air tandon 52 persen dari HC-SR04 sehingga pompa boleh menyala; pindahnya lewat satu pintu, pindahKe()), dan Tombol: lampu on (penanda 3, tombol tetap didengar selama pompa menyala)](aset/wokwi-siram-state-machine.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

#### 3.4 Bedah kodenya

- **`enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };`** ada di bagian atas sketsa, sebelum fungsi pertama, sesuai aturan di Konsep 4.
- **`jalankanPenyiraman()`** dipanggil di setiap putaran. Di dalamnya ada tiga cabang `if`/`else if`, satu untuk setiap keadaan. Setiap cabang hanya menanyakan satu hal: "sudah waktunya pindah?"
- **`pindahKe()`** adalah satu-satunya tempat keadaan berganti. Ia mencetak perpindahannya dan mencatat `waktuMasukKeadaan`. Waktu itulah yang dipakai MENYIRAM untuk menghitung 3 detik dan JEDA untuk menghitung 30 detik.
- **`mulaiMenyiram()`** memeriksa tandon tepat sebelum pompa menyala, seperti Modul 6. Kalau airnya kurang, pompa ditolak, Node 1 langsung beristirahat (`[SIAGA -> JEDA]`), dan LED status berkedip cepat sebagai tanda "isi tandonnya!".
- **`tekanLama()`** hanya mengizinkan "siram sekarang" saat keadaannya SIAGA. Tombol pun ikut aturan *state machine*: perintah yang sama bisa diterima atau ditolak, bergantung pada keadaannya.

Bandingkan dengan Node 1 v0.4.0, yang menghitung jeda siram dengan `sisaJedaSiram` (sisa jumlah laporan). Di sini jedanya dihitung dengan **jam** (`LAMA_JEDA = 30000` ms), jadi lamanya tetap 30 detik secepat apa pun `loop()` berputar.

#### 3.5 Bereksperimen

- **Tandon kosong.** Di papan asli, angkat sensor HC-SR04 dari tandon dan arahkan ke benda yang jauh. Di Wokwi, klik HC-SR04 (kanan atas) dan geser jaraknya ke `19` cm. Lalu keringkan tanahnya: pompa ditolak (`Pompa DITOLAK: air tandon 6 %.`), keadaannya langsung `[SIAGA -> JEDA]`, dan LED status berkedip cepat. Kembalikan sensornya setelah selesai.
- **Gambar *state machine*-mu sendiri di kertas:** tiga lingkaran (SIAGA, MENYIRAM, JEDA) dan empat panah, lengkap dengan tulisan pemicunya. Bandingkan dengan gambar di Konsep 4. Simpan fotonya; *state machine* yang lebih rumit selalu lebih mudah dirancang di kertas dulu.

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 5](#5-kode-modular-satu-sketsa-beberapa-file).

### Praktik 4 — Kode modular: pecah jadi beberapa file (35 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor**, atau Wokwi dengan [`diagram.json`](kode/modul08_modular/diagram.json) Node 1 lengkap. Komponen dan rangkaiannya sama dengan Praktik 3. Konsep yang dipakai: 5.

Di praktik ini, kamu memindahkan **detak jantung** dan **tombol** dari sketsa Praktik 3 ke dua modul tersendiri. Perilakunya tidak berubah sedikit pun; yang berubah hanya kerapiannya. Kedua modul ini nanti dipakai **apa adanya** oleh Node 1 v1.0.

#### 4.1 Simpan sebagai sketsa baru

Buka sketsa `modul08_siram_state_machine`, lalu pilih **File → Save As…** dan simpan dengan nama `modul08_modular` di folder `modul-08`. Sketsa Praktik 3 tetap utuh sebagai cadangan. **Di Wokwi:** lanjutkan di proyek Praktik 3, atau buka proyek ESP32 baru, lalu tempel `diagram.json` praktik ini dan kode Praktik 3.

#### 4.2 Buat empat tab baru

Setiap modul butuh dua file. Di Arduino IDE, setiap file sketsa tampil sebagai **tab** di atas editor. Gambar pertama di bawah menunjukkan cara membuat tab baru di Arduino IDE; gambar kedua caranya di Wokwi.

![Ilustrasi Arduino IDE 2.3.10 dengan sketsa modul08_modular terbuka; editornya masih berisi awal sketsa Praktik 3. Penanda 1 pada tombol tiga titik di ujung kanan deretan tab. Penanda 2 pada menu yang terbuka di bawahnya, butir New Tab dengan pintasan Ctrl+Shift+N; butir lainnya Rename, Delete, Previous Tab, dan Next Tab. Di tengah, kotak dialog Name for new file dengan kotak ketik berisi detak.h (penanda 3) serta tombol CANCEL dan OK, dengan OK ditandai penanda 4. Keterangan bawah: 1, klik tiga titik di ujung kanan deretan tab; 2, pilih New Tab (pintasan Ctrl + Shift + N); 3, ketik nama lengkap dengan akhirannya, detak.h, detak.cpp; 4, klik OK, tab baru yang kosong langsung terbuka. Catatan: ilustrasi, bukan tangkapan layar](aset/arduino-tab-baru.png)

**Di Wokwi:** klik tanda **▾** di ujung kanan deretan tab di atas editor, lalu pilih **New file...**. Di kotak `Create a new file` yang muncul, ketik nama filenya lengkap dengan akhirannya (misalnya `detak.h`), lalu klik **CREATE** (atau tekan **Enter**). Kalau kotak nama itu masih berisi nama file sebelumnya, hapus dulu isinya sebelum mengetik. Tab baru yang masih kosong langsung terbuka; tempel isinya di sana. Satu hal penting: **file yang masih kosong tidak ikut disusun oleh Wokwi**, jadi tempel isinya sebelum menekan **▶**.

![Tangkapan layar Wokwi, dipotong. Atas, deretan tab editor sketch.ino, diagram.json, dan Library Manager, dengan awal sketsa Praktik 3 di editor; tanda segitiga kecil di ujung kanan deretan tab sudah diklik (penanda 1) dan membuka menu Format code, Rename, Delete, New file... (penanda 2: kotak nama file langsung muncul), dan Upload file(s).... Bawah, kotak Create a new file berisi kotak ketik New file name (penanda 3: ketik nama file lengkap dengan akhirannya, misalnya detak.h lalu detak.cpp; kalau masih berisi nama lama, hapus dulu) serta tombol CANCEL dan CREATE (penanda 4: klik CREATE atau tekan Enter; tab baru yang kosong terbuka, tempel isinya sebelum menekan tombol mulai simulasi)](aset/wokwi-file-baru.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

1. Klik tombol **⋯** (tiga titik) di ujung kanan deretan tab, lalu pilih **New Tab**. Pintasannya **Ctrl + Shift + N**.
2. Muncul kotak `Name for new file`. Ketik **`detak.h`**, **lengkap dengan akhirannya**, lalu klik **OK**. Kalau akhirannya lupa ditulis, Arduino IDE menambahkan `.ino` sendiri sehingga file itu menjadi tab sketsa biasa, bukan menu modul.
3. Tab `detak.h` yang masih kosong muncul. Tempel isi ini:

   ```cpp
   // detak.h - LED status sebagai "detak jantung" Node 1 (Modul 8)
   // Kedip pelan = program berjalan normal; kedip cepat = ada masalah.
   #pragma once

   void mulaiDetak(int pin);           // panggil sekali di setup()
   void aturIramaDetak(bool masalah);  // true = kedip cepat, false = kedip pelan
   void perbaruiDetak();               // panggil di setiap putaran loop()
   ```

4. Ulangi langkah 1–3 untuk tiga file lainnya. Pertama, **`detak.cpp`**:

   ```cpp
   // detak.cpp - isi modul detak. Daftar fungsinya ada di detak.h.
   #include <Arduino.h>
   #include "detak.h"

   const unsigned long DETAK_NORMAL = 1000;     // satu kedip setiap 1 detik
   const unsigned long DETAK_MASALAH = 250;     // empat kedip setiap 1 detik
   const unsigned long LAMA_NYALA_DETAK = 100;  // LED menyala 100 ms di awal setiap detak

   // "static" = milik file ini saja; file lain tidak bisa melihat atau tertukar dengannya.
   static int pinDetak = -1;
   static bool iramaMasalah = false;
   static unsigned long waktuDetakMulai = 0;

   void mulaiDetak(int pin) {
     pinDetak = pin;
     pinMode(pinDetak, OUTPUT);
   }

   void aturIramaDetak(bool masalah) {
     iramaMasalah = masalah;
   }

   void perbaruiDetak() {
     unsigned long sekarang = millis();
     unsigned long panjangDetak = DETAK_NORMAL;
     if (iramaMasalah) {
       panjangDetak = DETAK_MASALAH;
     }
     if (sekarang - waktuDetakMulai >= panjangDetak) {
       waktuDetakMulai = sekarang;  // mulai detak berikutnya
     }
     // LED menyala hanya di awal detak: true = HIGH (nyala), false = LOW (padam)
     digitalWrite(pinDetak, sekarang - waktuDetakMulai < LAMA_NYALA_DETAK);
   }
   ```

   Kedua, **`tombol.h`**:

   ```cpp
   // tombol.h - tombol dengan debounce, tekan pendek, dan tekan lama, tanpa menunggu (Modul 8)
   #pragma once

   // Tiga kemungkinan jawaban periksaTombol()
   enum PeristiwaTombol { TIDAK_ADA, TEKAN_PENDEK, TEKAN_LAMA };

   void mulaiTombol(int pin);        // panggil sekali di setup()
   PeristiwaTombol periksaTombol();  // panggil di setiap putaran loop()
   ```

   Ketiga, **`tombol.cpp`**:

   ```cpp
   // tombol.cpp - isi modul tombol. Daftar fungsinya ada di tombol.h.
   #include <Arduino.h>
   #include "tombol.h"

   const unsigned long JEDA_PANTUL = 30;         // milidetik: bacaan harus tenang selama ini (Modul 5)
   const unsigned long BATAS_TEKAN_LAMA = 1000;  // ditahan 1 detik atau lebih = tekan lama

   static int pinTombol = -1;
   static int bacaanTadi = HIGH;                 // bacaan mentah di putaran sebelumnya; HIGH = dilepas
   static unsigned long waktuBacaanBerubah = 0;  // kapan bacaan mentah terakhir berubah
   static int keadaanStabil = HIGH;              // keadaan yang sudah dipercaya (sudah tenang 30 ms)
   static unsigned long waktuMulaiTekan = 0;     // kapan tombol mulai ditekan
   static bool tekanLamaSudah = false;           // tekan lama untuk tekanan ini sudah dilaporkan?

   void mulaiTombol(int pin) {
     pinTombol = pin;
     pinMode(pinTombol, INPUT_PULLUP);
   }

   PeristiwaTombol periksaTombol() {
     unsigned long sekarang = millis();
     int bacaan = digitalRead(pinTombol);

     // 1. Bacaan berubah (ditekan, dilepas, memantul, atau derau)? Hitung "tenang"-nya dari nol lagi.
     if (bacaan != bacaanTadi) {
       bacaanTadi = bacaan;
       waktuBacaanBerubah = sekarang;
     }

     // 2. Sudah tenang 30 ms dan berbeda dengan keadaan yang dipercaya? Itu perubahan sungguhan.
     if (bacaan != keadaanStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
       keadaanStabil = bacaan;
       if (keadaanStabil == LOW) {  // baru saja ditekan: mulai menghitung lamanya
         waktuMulaiTekan = sekarang;
         tekanLamaSudah = false;
       } else if (!tekanLamaSudah) {  // baru saja dilepas sebelum 1 detik: tekan pendek
         return TEKAN_PENDEK;
       }
     }

     // 3. Masih ditahan dan sudah 1 detik? Tekan lama, dilaporkan sekali tanpa menunggu jari diangkat.
     if (keadaanStabil == LOW && !tekanLamaSudah && sekarang - waktuMulaiTekan >= BATAS_TEKAN_LAMA) {
       tekanLamaSudah = true;
       return TEKAN_LAMA;
     }
     return TIDAK_ADA;
   }
   ```

**Jangan klik Verify dulu** (di Wokwi: jangan klik **▶** dulu) sampai langkah 4.3 selesai: tab utama masih menyimpan `perbaruiDetak()` dan `periksaTombol()` versi Praktik 3, yang bertabrakan dengan modul barumu.

#### 4.3 Ganti isi tab utama

Klik tab **`modul08_modular.ino`** (tab paling kiri; di Wokwi: **`sketch.ino`**), lalu ganti seluruh isinya dengan versi yang sudah memakai kedua modul:

```cpp
// Modul 8 - Praktik 4: kode modular
// Sketsa Praktik 3 yang dipecah: detak jantung pindah ke detak.h/.cpp, tombol pindah ke tombol.h/.cpp.
// Rangkaian sama dengan Praktik 3. Perilakunya pun sama persis.

#include "detak.h"
#include "tombol.h"

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;
const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW
const int PIN_RELAY_KIPAS = 33;  // tidak dipakai di sini, tetapi relay-nya dimatikan supaya diam
const int PIN_POMPA = 25;        // gerbang MOSFET: HIGH = pompa menyala
const int PIN_TANAH = 39;        // VN
const int PIN_TRIG = 15;
const int PIN_ECHO = 35;

// Hasil kalibrasimu dari Modul 6 (ganti dengan angkamu sendiri)
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

// Aturan penyiraman
const int AMBANG_TANAH_SIRAM = 30;        // siram kalau tanah di bawah 30 %
const int LEVEL_AIR_MINIMUM = 20;         // pompa ditolak kalau isi tandon di bawah 20 %
const unsigned long JEDA_PERIKSA = 2000;  // SIAGA: periksa tanah setiap 2 detik
const unsigned long LAMA_SIRAM = 3000;    // MENYIRAM: pompa menyala 3 detik
const unsigned long LAMA_JEDA = 30000;    // JEDA: istirahat 30 detik sebelum boleh menyiram lagi

bool lampuMenyala = false;

// Tiga keadaan penyiraman. Daftar nama seperti ini (enum) ditulis di atas, sebelum fungsi mana pun.
enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };
KeadaanSiram keadaan = SIAGA;            // keadaan sekarang; mulai dari SIAGA
unsigned long waktuMasukKeadaan = 0;     // kapan keadaan sekarang dimulai
unsigned long waktuPeriksaTerakhir = 0;  // kapan tanah terakhir diperiksa

// ---------- Sensor tanah dan tandon (Modul 6) ----------
int bacaTanahPersen() {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(PIN_TANAH);  // 20 bacaan berturut-turut, tanpa jeda (selesai dalam sekejap)
  }
  int persen = map(jumlah / 20, TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

// Menjawab persen isi tandon, atau -1 kalau gema HC-SR04 tidak kembali.
int bacaLevelAir() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);  // menunggu paling lama 30 ms
  if (durasi == 0) {
    return -1;
  }
  float jarak = durasi / 58.0;
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

// ---------- State machine penyiraman ----------
const char* namaKeadaan(KeadaanSiram k) {
  if (k == SIAGA) {
    return "SIAGA";
  }
  if (k == MENYIRAM) {
    return "MENYIRAM";
  }
  return "JEDA";
}

// Satu-satunya tempat keadaan berganti: catat waktunya dan laporkan perpindahannya.
void pindahKe(KeadaanSiram keadaanBaru) {
  Serial.print("[");
  Serial.print(namaKeadaan(keadaan));
  Serial.print(" -> ");
  Serial.print(namaKeadaan(keadaanBaru));
  Serial.println("]");
  keadaan = keadaanBaru;
  waktuMasukKeadaan = millis();
}

// Mencoba menyalakan pompa. Pengaman tandon (Modul 6): air kurang = ditolak, lalu beristirahat.
void mulaiMenyiram() {
  int levelAir = bacaLevelAir();
  if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
    Serial.print("Pompa DITOLAK: air tandon ");
    if (levelAir < 0) {
      Serial.println("tidak terbaca.");
    } else {
      Serial.print(levelAir);
      Serial.println(" %.");
    }
    aturIramaDetak(true);  // LED status berkedip cepat: isi tandonnya!
    pindahKe(JEDA);
    return;
  }
  aturIramaDetak(false);
  Serial.print("Pompa menyala (air tandon ");
  Serial.print(levelAir);
  Serial.println(" %).");
  digitalWrite(PIN_POMPA, HIGH);
  pindahKe(MENYIRAM);
}

void jalankanPenyiraman() {
  unsigned long sekarang = millis();

  if (keadaan == SIAGA) {
    // SIAGA: periksa tanah setiap 2 detik; kalau kering, mulai menyiram
    if (sekarang - waktuPeriksaTerakhir >= JEDA_PERIKSA) {
      waktuPeriksaTerakhir = sekarang;
      int tanah = bacaTanahPersen();
      Serial.print("SIAGA: tanah ");
      Serial.print(tanah);
      Serial.println(" %");
      if (tanah < AMBANG_TANAH_SIRAM) {
        mulaiMenyiram();
      }
    }
  } else if (keadaan == MENYIRAM) {
    // MENYIRAM: pompa padam setelah 3 detik, lalu beristirahat
    if (sekarang - waktuMasukKeadaan >= LAMA_SIRAM) {
      digitalWrite(PIN_POMPA, LOW);
      Serial.println("Pompa padam.");
      pindahKe(JEDA);
    }
  } else if (keadaan == JEDA) {
    // JEDA: tunggu 30 detik supaya air sempat meresap sebelum tanah diperiksa lagi
    if (sekarang - waktuMasukKeadaan >= LAMA_JEDA) {
      pindahKe(SIAGA);
    }
  }
}

// ---------- Yang dikerjakan tombol ----------
void tekanPendek() {
  lampuMenyala = !lampuMenyala;
  if (lampuMenyala) {
    digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
    Serial.println("Tombol: lampu on");
  } else {
    digitalWrite(PIN_RELAY_LAMPU, HIGH);
    Serial.println("Tombol: lampu off");
  }
}

void tekanLama() {
  if (keadaan == SIAGA) {
    Serial.println("Tombol ditahan: siram sekarang!");
    mulaiMenyiram();
  } else {
    Serial.print("Tombol ditahan, tetapi penyiraman sedang ");
    Serial.print(namaKeadaan(keadaan));
    Serial.println(". Coba lagi nanti.");
  }
}

void setup() {
  Serial.begin(115200);
  mulaiDetak(PIN_LED_STATUS);  // modul detak menyiapkan pin LED-nya sendiri
  mulaiTombol(PIN_TOMBOL);     // modul tombol menyiapkan pin tombolnya sendiri
  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  digitalWrite(PIN_RELAY_LAMPU, HIGH);  // lampu padam (relay aktif LOW)
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  digitalWrite(PIN_RELAY_KIPAS, HIGH);  // kipas padam
  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
  Serial.println("Praktik 4 - kode modular: perilakunya sama dengan Praktik 3.");
}

void loop() {
  perbaruiDetak();

  // Modul tombol hanya melaporkan apa yang terjadi; sketsa ini yang memutuskan tindakannya.
  PeristiwaTombol peristiwa = periksaTombol();
  if (peristiwa == TEKAN_PENDEK) {
    tekanPendek();
  } else if (peristiwa == TEKAN_LAMA) {
    tekanLama();
  }

  jalankanPenyiraman();
}
```

#### 4.4 Uji: perilakunya harus sama persis

Klik **Verify** (✓). Kalau berhasil, klik **Upload**, lalu ulangi langkah 3.3 Praktik 3. Hasilnya di Serial Monitor sama persis, kecuali baris pertamanya yang kini berbunyi `Praktik 4 - kode modular: perilakunya sama dengan Praktik 3.`. Kalau ada error, lihat bagian 4.5 di bawah; dua error yang paling sering memang sengaja kita buat di sana.

Bandingkan juga panjangnya: tab utama kini sekitar empat puluh baris lebih pendek. Semua urusan LED status dan tombol tersimpan rapi di modulnya masing-masing.

#### 4.5 Sengaja membuat dua error yang paling sering

Kedua error ini pasti kamu temui suatu hari. Lebih baik berkenalan sekarang, saat kamu tahu persis penyebabnya.

**Error 1 — lupa `#include`.** Di tab utama, jadikan baris `#include "detak.h"` komentar dengan menambahkan `//` di depannya, lalu klik **Verify**. Muncul beberapa error. Intinya seperti ini (di depan setiap baris ada nama file dan nomor barisnya):

```text
error: 'aturIramaDetak' was not declared in this scope
error: 'aturIramaDetak' was not declared in this scope
error: 'mulaiDetak' was not declared in this scope
error: 'perbaruiDetak' was not declared in this scope
```

Kompiler tidak mengenal `aturIramaDetak`, `mulaiDetak`, dan `perbaruiDetak` karena tab utama tidak lagi "membaca menunya". Ini error **tahap menyusun**. Hapus lagi `//`-nya, lalu klik **Verify** sampai berhasil.

**Error 2 — hidangan yang tidak dimasak.** Di tab **`detak.cpp`**, ubah `void perbaruiDetak() {` menjadi `void perbaruiDetik() {` (seolah-olah salah ketik), lalu klik **Verify**. Kali ini errornya berbeda. Di Arduino IDE (Windows), intinya seperti ini (di depannya ada lokasi file yang panjang):

```text
undefined reference to `perbaruiDetak()'
collect2.exe: error: ld returned 1 exit status
```

Menu (`detak.h`) menjanjikan `perbaruiDetak()`, tetapi tidak ada dapur yang memasaknya: di `detak.cpp` hanya ada `perbaruiDetik()`. Ini error **tahap menyambung** (`ld`). Kalimat kuncinya adalah ``undefined reference to `perbaruiDetak()'``. Di Wokwi, nama fungsinya tampil dalam bentuk sandi, `_Z13perbaruiDetakv`; di tengahnya tetap terbaca `perbaruiDetak`. Kembalikan namanya menjadi `perbaruiDetak`, lalu klik **Verify** sampai berhasil.

#### 4.6 Bedah: apa saja yang berubah?

- **Dipindah hampir apa adanya:** konstanta dan variabel milik detak jantung kini ada di `detak.cpp`, sedangkan milik tombol ada di `tombol.cpp`. `tombolStabil` berganti nama menjadi `keadaanStabil`, dan setiap modul punya variabel baru untuk nomor pinnya (`pinDetak`, `pinTombol`). Semuanya diberi `static`, kecuali konstanta, yang memang hanya berlaku di filenya sendiri.
- **`mulaiDetak(pin)` dan `mulaiTombol(pin)`** menggantikan `pinMode()` untuk LED dan tombol di `setup()`. Setiap modul menyiapkan pinnya sendiri.
- **`aturIramaDetak(true)`** menggantikan `iramaMasalah = true`. Tab utama tidak lagi menyentuh variabel milik modul detak; ia "memesan" lewat fungsi yang ada di menu.
- **`periksaTombol()` kini menjawab sebuah `PeristiwaTombol`**: `TIDAK_ADA`, `TEKAN_PENDEK`, atau `TEKAN_LAMA`. Di Praktik 3, fungsi tombol memanggil `tekanPendek()` dan `tekanLama()` sendiri. Sekarang modul tombol hanya **melapor**, dan `loop()` yang **memutuskan** akibatnya (Konsep 5). Karena itu, modul tombol bisa dipakai di Node 1 v1.0 untuk tugas yang berbeda tanpa diubah sedikit pun.

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 6](#6-char-dan-snprintf-menyusun-teks-tanpa-meminjam-memori).

### Praktik 5 — Ambang yang tidak lupa: NVS (25 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor** (115200 baud, **New Line**), atau Wokwi dengan [`diagram.json`](kode/modul08_ambang_nvs/diagram.json) rangkaian kecil. Cukup papan ESP32 lewat USB. Rangkaian Node 1 boleh tetap terpasang dan MB102 boleh mati karena sketsa ini tidak menyentuh pin mana pun. Konsep yang dipakai: 6 dan 7.
>
> ⭐ **Wajib** — bagian dari syarat lulus: ambang yang kamu simpan tetap ada setelah papan dicabut, lalu dicolokkan lagi.

#### 5.1 Unggah dan kenali perintahnya

1. Buat sketsa baru bernama `modul08_ambang_nvs`, tempel kode ini, klik **Upload**, lalu buka Serial Monitor:

   ```cpp
   // Modul 8 - Praktik 5: ambang yang tidak lupa (NVS dengan library Preferences)
   // Cukup papan ESP32. Rangkaian Node 1 boleh tetap terpasang: sketsa ini tidak menyentuh pin mana pun.
   // Library Preferences sudah ikut paket esp32, jadi tidak perlu dipasang.
   //
   // Perintah di Serial Monitor (pilih New Line):
   //   ambang         -> tampilkan ambang sekarang
   //   ambang 35      -> simpan ambang baru (0-100) ke NVS
   //   ambang bawaan  -> hapus dari NVS, kembali ke angka bawaan
   //   restart        -> restart papan (cara Wokwi meniru "dicabut lalu dicolokkan lagi")

   #include <Preferences.h>

   const int AMBANG_BAWAAN = 30;  // dipakai selama NVS belum berisi ambang

   Preferences arsip;  // "lemari arsip" NVS milik sketsa ini
   int ambangTanahSiram = AMBANG_BAWAAN;
   unsigned long jumlahNyala = 0;

   // ---------- Pembaca baris Serial yang tidak pernah menunggu ----------
   const int PANJANG_BARIS_MAKS = 40;
   char baris[PANJANG_BARIS_MAKS + 1];  // +1 untuk tanda akhir teks
   int panjangBaris = 0;

   // Mengumpulkan huruf dari Serial Monitor TANPA menunggu.
   // Menjawab true sekali, saat satu baris sudah lengkap (diakhiri Enter); isinya ada di "baris".
   bool adaBarisBaru() {
     while (Serial.available() > 0) {
       char huruf = Serial.read();
       if (huruf == '\n') {
         baris[panjangBaris] = '\0';  // tanda akhir teks
         panjangBaris = 0;            // siap mengumpulkan baris berikutnya
         return true;
       }
       if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
         baris[panjangBaris] = huruf;
         panjangBaris++;
       }
     }
     return false;
   }

   void tampilkanAmbang() {
     Serial.print("Ambang tanah_siram: ");
     Serial.print(ambangTanahSiram);
     if (arsip.isKey("tanah_siram")) {
       Serial.println(" % (dari NVS)");
     } else {
       Serial.println(" % (angka bawaan, belum pernah disimpan)");
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("Praktik 5 - ambang di NVS");

     arsip.begin("node1", false);  // buka map "node1"; false = boleh membaca DAN menulis

     jumlahNyala = arsip.getULong("jumlah_nyala", 0) + 1;  // 0 kalau label ini belum pernah ditulis
     arsip.putULong("jumlah_nyala", jumlahNyala);
     Serial.print("Nyala ke-");
     Serial.println(jumlahNyala);

     ambangTanahSiram = arsip.getInt("tanah_siram", AMBANG_BAWAAN);  // angka bawaan kalau belum ada
     tampilkanAmbang();
     Serial.println("Perintah: ambang, ambang 35, ambang bawaan, restart");
   }

   void loop() {
     if (!adaBarisBaru()) {
       return;  // belum ada baris lengkap: langsung kembali, tidak menunggu
     }
     String perintah = baris;  // perintah datang sesekali saja, jadi String aman dipakai di sini
     perintah.trim();
     perintah.toLowerCase();

     if (perintah == "ambang") {
       tampilkanAmbang();
     } else if (perintah == "ambang bawaan") {
       arsip.remove("tanah_siram");  // hapus label ini dari map
       ambangTanahSiram = AMBANG_BAWAAN;
       Serial.println("Ambang dihapus dari NVS.");
       tampilkanAmbang();
     } else if (perintah.startsWith("ambang ")) {
       String angka = perintah.substring(7);  // teks sesudah "ambang "
       int persen = angka.toInt();
       if ((persen == 0 && angka != "0") || persen < 0 || persen > 100) {
         Serial.println("Butuh angka 0-100. Contoh: ambang 35");
         return;
       }
       if (persen == ambangTanahSiram && arsip.isKey("tanah_siram")) {
         Serial.println("Angkanya sama dengan yang tersimpan: NVS tidak perlu ditulis ulang.");
         return;
       }
       arsip.putInt("tanah_siram", persen);  // tulis ke flash: tetap ada walaupun listrik padam
       ambangTanahSiram = persen;
       Serial.print("Disimpan ke NVS: ");
       Serial.print(persen);
       Serial.println(" %");
     } else if (perintah == "restart") {
       Serial.println("Restart sekarang...");
       Serial.flush();  // tunggu sampai pesan di atas benar-benar terkirim
       ESP.restart();
     } else {
       Serial.println("Perintah tidak dikenal. Coba: ambang, ambang 35, ambang bawaan, restart");
     }
   }
   ```

2. Serial Monitor mencetak `Nyala ke-1` dan `Ambang tanah_siram: 30 % (angka bawaan, belum pernah disimpan)`. Kalau angka di `Nyala ke-` lebih besar, tidak apa-apa: papan sempat menyala ulang, misalnya karena tombol EN ditekan.
3. Ketik perintah ini satu per satu di kotak ketik Serial Monitor, lalu tekan **Enter** setelah setiap perintah:
   - `ambang` — menampilkan ambang sekarang.
   - `ambang 35` — menyimpan 35 % ke NVS.
   - `ambang 35` sekali lagi — angkanya sama, jadi NVS tidak ditulis ulang (Konsep 7: *flash* bisa aus).
   - `ambang abc` — ditolak karena bukan angka 0–100.

#### 5.2 Buktikan: cabut, lalu colokkan lagi

1. **Cabut kabel USB** dari laptop. (Kalau MB102 menyala, matikan dulu MB102, baru cabut USB.)
2. Tunggu 10 detik supaya papan benar-benar padam, lalu colokkan lagi. Kalau Serial Monitor tidak tersambung otomatis, pilih lagi port-nya di bilah atas Arduino IDE, lalu tekan **EN** di papan supaya pesan pembukanya tercetak ulang.
3. Kini tercetak `Ambang tanah_siram: 35 % (dari NVS)`, dan angka `Nyala ke-` bertambah satu, misalnya menjadi `Nyala ke-2`. Kalau tadi kamu menekan **EN**, angkanya bertambah satu lagi karena setiap kali papan menyala ikut terhitung. Ambangmu selamat melewati padamnya listrik.

**Di Wokwi**, ketik `restart` untuk meniru listrik padam; **jangan** menekan **■** lalu **▶**. Ingat tabel di Konsep 7: Wokwi memulai dengan chip baru yang masih kosong setiap kali simulasi dijalankan ulang.

**Hasilnya** di Wokwi, dari `ambang` pertama sampai `ambang` yang diketik lagi sesudah `restart`:

```text
Ambang tanah_siram: 30 % (angka bawaan, belum pernah disimpan)
Disimpan ke NVS: 35 %
Angkanya sama dengan yang tersimpan: NVS tidak perlu ditulis ulang.
Butuh angka 0-100. Contoh: ambang 35
Restart sekarang...
ets Jul 29 2019 12:21:46
rst:0xc (SW_CPU_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
…
Praktik 5 - ambang di NVS
Nyala ke-2
Ambang tanah_siram: 35 % (dari NVS)
Perintah: ambang, ambang 35, ambang bawaan, restart
Ambang tanah_siram: 35 % (dari NVS)
```

Baris `rst:0xc (SW_CPU_RESET)` adalah laporan *bootloader* untuk *restart* oleh program, dalam hal ini `ESP.restart()` milik perintah `restart`. Arti kode `rst:` sudah kamu kenal di Modul 2 (🔬), dan Konsep 8 membahasnya lagi. Di papan asli yang dicabut lalu dicolokkan lagi, baris itu berbunyi `rst:0x1 (POWERON_RESET)`.

Coba juga hal-hal berikut:

- **Unggah ulang sketsa yang sama** (klik **Upload** lagi). Ambangnya tetap 35 % dan `Nyala ke-` bertambah satu. Mengunggah program tidak menghapus NVS.
- Ketik `ambang bawaan`. Label `tanah_siram` dihapus dari map, dan ambangnya kembali menjadi 30 % (angka bawaan).
- **Di Wokwi**, tekan **■**, lalu **▶**. Papan kembali mencetak `Nyala ke-1` dengan ambang 30 %: chip baru, lemari arsip kosong.

#### 5.3 Bedah kodenya

- **`arsip.begin("node1", false)`** membuka map bernama `node1` di lemari arsip NVS. Map yang sama juga dipakai Node 1 v1.0 nanti, jadi ambang yang kamu simpan di praktik ini **ikut terbaca** oleh Node 1 v1.0. Kalau ingin mulai bersih, ketik `ambang bawaan` dulu.
- **`jumlahNyala`** dibaca dengan `getULong("jumlah_nyala", 0)`, ditambah satu, lalu ditulis kembali. Hasilnya adalah penghitung "sudah berapa kali menyala" yang tidak ikut terhapus saat listrik padam. Node 1 v1.0 memakainya untuk uji 24 jam: kalau angkanya bertambah, berarti ada *restart*.
- **`arsip.isKey("tanah_siram")`** membedakan "35 karena memang disimpan" dari "30 karena belum pernah disimpan".
- **Ambang hanya ditulis kalau angkanya berubah**, dan selalu diperiksa dulu: harus berupa angka 0–100. Pemeriksaan `persen == 0 && angka != "0"` sama dengan `bukanAngka()` di Node 1 (Modul 5): `toInt()` menjawab `0` untuk teks yang bukan angka, jadi jawaban `0` hanya dipercaya kalau yang diketik memang `0`.
- **`Serial.flush()`** sebelum `ESP.restart()` menunggu sampai pesan `Restart sekarang...` benar-benar terkirim. Tanpa itu, pesannya bisa terpotong karena papan keburu *restart*.

Ada satu hal baru lagi di sketsa ini: **pembaca baris Serial yang tidak pernah menunggu**, yaitu fungsi `adaBarisBaru()`. Di Modul 5, perintah dibaca dengan `Serial.readStringUntil('\n')`, yang **menunggu** sampai tanda akhir baris datang, paling lama 1 detik. Fungsi baru ini mengumpulkan huruf yang sudah tiba ke dalam `char baris[41]`, satu per satu, lalu langsung kembali. Kalau barisnya belum lengkap, ia menjawab `false` dan `loop()` lanjut bekerja. Begitu tanda akhir baris (`'\n'`, dikirim oleh pilihan **New Line**) tiba, ia menutup teksnya dengan `'\0'` (Konsep 6) dan menjawab `true`. Huruf `'\r'` (kembali ke awal baris) ikut terkirim kalau akhiran barisnya **Both NL & CR**; fungsi ini membuangnya supaya perintahmu tetap dikenali. Mulai sekarang, semua sketsa yang menerima perintah memakai fungsi ini.

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 8](#8-watchdog-penjaga-yang-me-restart-program-macet).

### Praktik 6 — *Watchdog*: sengaja macet, lalu diselamatkan (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor** (115200 baud, **New Line**), atau Wokwi dengan [`diagram.json`](kode/modul08_watchdog/diagram.json) rangkaian kecil. Komponen: LED status (D4). Cukup USB; MB102 boleh mati. Konsep yang dipakai: 8.
>
> ⭐ **Wajib** — bagian dari syarat lulus: kamu melihat sendiri *watchdog* me-*restart* program yang macet, dan bisa membaca alasan *restart*-nya.

Sketsa ini punya tiga perintah "nakal": `macet` (masuk perulangan yang tidak pernah selesai), `tidur 3`, dan `tidur 7` (`delay()` selama 3 dan 7 detik). LED status berganti nyala-padam setiap 0,5 detik; selama LED berkedip, kita tahu `loop()` masih berputar.

#### 6.1 Tanpa penjaga dulu

1. Buat sketsa baru bernama `modul08_watchdog` dan tempel kode ini:

   ```cpp
   // Modul 8 - Praktik 6: watchdog, penjaga yang me-restart program macet
   // Rangkaian: LED status di D4 (rangkaian Kemenangan Cepat, atau meja kerja Node 1).
   //
   // Perintah di Serial Monitor (pilih New Line):
   //   macet    -> sengaja masuk perulangan yang tidak pernah selesai
   //   tidur 3  -> delay(3000): masih di bawah batas watchdog
   //   tidur 7  -> delay(7000): melewati batas 5 detik
   //   restart  -> program sendiri yang meminta restart

   #include <esp_task_wdt.h>  // ikut paket esp32

   const bool PAKAI_WATCHDOG = true;           // ubah menjadi false untuk melihat apa yang terjadi TANPA penjaga
   const unsigned long BATAS_WATCHDOG = 5000;  // milidetik
   const int PIN_LED_STATUS = 4;

   unsigned long waktuKedipTerakhir = 0;
   bool ledMenyala = false;

   // ---------- Pembaca baris Serial yang tidak pernah menunggu (sama dengan Praktik 5) ----------
   const int PANJANG_BARIS_MAKS = 40;
   char baris[PANJANG_BARIS_MAKS + 1];
   int panjangBaris = 0;

   bool adaBarisBaru() {
     while (Serial.available() > 0) {
       char huruf = Serial.read();
       if (huruf == '\n') {
         baris[panjangBaris] = '\0';
         panjangBaris = 0;
         return true;
       }
       if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
         baris[panjangBaris] = huruf;
         panjangBaris++;
       }
     }
     return false;
   }

   // Alasan restart terakhir, lengkap dengan penjelasannya.
   const char* jelaskanAlasanReset() {
     esp_reset_reason_t alasan = esp_reset_reason();
     if (alasan == ESP_RST_POWERON) {
       return "POWERON (baru dinyalakan, tombol EN ditekan, atau selesai diunggah)";
     }
     if (alasan == ESP_RST_SW) {
       return "SW (program sendiri yang meminta restart)";
     }
     if (alasan == ESP_RST_TASK_WDT) {
       return "TASK_WDT (watchdog: loop() terlambat memberi makan penjaga)";
     }
     if (alasan == ESP_RST_INT_WDT || alasan == ESP_RST_WDT) {
       return "WDT (watchdog jenis lain)";
     }
     if (alasan == ESP_RST_PANIC) {
       return "PANIC (program mogok)";
     }
     if (alasan == ESP_RST_BROWNOUT) {
       return "BROWNOUT (tegangan sempat anjlok)";
     }
     return "lainnya";
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED_STATUS, OUTPUT);
     Serial.println();
     Serial.println("Praktik 6 - watchdog");
     Serial.print("Alasan restart terakhir: ");
     Serial.println(jelaskanAlasanReset());

     if (PAKAI_WATCHDOG) {
       // Cara penulisan paket esp32 versi 3: semua setelan dalam satu "formulir"
       esp_task_wdt_config_t konfigurasiWatchdog = {
         .timeout_ms = BATAS_WATCHDOG,  // batas waktu: 5000 ms
         .idle_core_mask = 0b01,        // tetap awasi "tugas menganggur" inti 0 (bawaan paket esp32)
         .trigger_panic = true,         // terlambat diberi makan = panik, lalu restart
       };
       esp_task_wdt_reconfigure(&konfigurasiWatchdog);  // watchdog sudah dinyalakan paket esp32: cukup diatur ulang
       esp_task_wdt_add(NULL);                          // NULL = awasi tugas yang sedang berjalan, yaitu loop()
       Serial.println("Watchdog AKTIF: loop() yang macet lebih dari 5 detik akan di-restart.");
     } else {
       Serial.println("Watchdog TIDAK dipakai.");
     }
     Serial.println("Perintah: macet, tidur 3, tidur 7, restart");
   }

   void loop() {
     if (PAKAI_WATCHDOG) {
       esp_task_wdt_reset();  // "beri makan" penjaga: tanda loop() masih berputar
     }

     // LED berganti setiap 500 ms: selama berkedip, kita tahu loop() masih berputar
     if (millis() - waktuKedipTerakhir >= 500) {
       waktuKedipTerakhir = millis();
       ledMenyala = !ledMenyala;
       digitalWrite(PIN_LED_STATUS, ledMenyala);
     }

     if (!adaBarisBaru()) {
       return;
     }
     String perintah = baris;
     perintah.trim();
     perintah.toLowerCase();

     if (perintah == "macet") {
       Serial.println("Masuk perulangan yang tidak pernah selesai... LED berhenti berkedip.");
       while (true) {
         // sengaja kosong: program terjebak di sini selamanya
       }
     } else if (perintah.startsWith("tidur ")) {
       int detik = perintah.substring(6).toInt();  // teks sesudah "tidur " diubah menjadi angka
       Serial.print("delay(");
       Serial.print(detik * 1000);
       Serial.println(")...");
       delay(detik * 1000);
       Serial.println("Bangun lagi!");
     } else if (perintah == "restart") {
       Serial.println("Restart sekarang...");
       Serial.flush();
       ESP.restart();
     } else {
       Serial.println("Perintah tidak dikenal. Coba: macet, tidur 3, tidur 7, restart");
     }
   }
   ```

2. Sebelum mengunggah, ubah baris `const bool PAKAI_WATCHDOG = true;` menjadi `const bool PAKAI_WATCHDOG = false;`. Lalu klik **Upload** dan buka Serial Monitor.
3. Ketik `macet`, lalu tekan **Enter**. LED berhenti berkedip, tetap menyala atau tetap padam. Coba ketik perintah lain: tidak dijawab. Tunggu 30 detik: tetap tidak terjadi apa-apa.

   **Hasilnya:**

   ```text
   Praktik 6 - watchdog
   Alasan restart terakhir: POWERON (baru dinyalakan, tombol EN ditekan, atau selesai diunggah)
   Watchdog TIDAK dipakai.
   Perintah: macet, tidur 3, tidur 7, restart
   Masuk perulangan yang tidak pernah selesai... LED berhenti berkedip.
   ```

Program ini macet **selamanya**. Di Node 1 sungguhan, itu berarti tidak ada lagi bacaan sensor, layar, atau pengaman pompa sampai ada orang yang menekan tombol **EN**. Tekan **EN** sekarang. Di Wokwi, tombol EN pada gambar papan tidak bisa diklik, jadi hentikan simulasi (**■**), lalu jalankan lagi (**▶**).

#### 6.2 Pasang penjaganya

1. Kembalikan barisnya menjadi `const bool PAKAI_WATCHDOG = true;`, lalu klik **Upload**. Serial Monitor kini mencetak `Watchdog AKTIF: …`.
2. Ketik `tidur 3`. Muncul `delay(3000)...`, LED berhenti berkedip selama 3 detik, lalu `Bangun lagi!`. Tiga detik masih di bawah batas 5 detik, jadi penjaga diam saja.
3. Ketik `macet`. LED berhenti berkedip. **Hitung dalam hati sampai lima.** Sekitar 5 detik kemudian, penjaga "menggonggong": Serial Monitor dipenuhi laporan berawalan `E (`, papan menyala ulang dengan sendirinya, LED berkedip lagi, dan baris pembukanya menyebut alasannya: `TASK_WDT`.
4. Ketik `tidur 7`. Kali ini papan juga di-*restart* walaupun programnya "hanya" tidur. Bagi penjaga, `loop()` yang tidak kembali dalam 5 detik **sama dengan macet**, apa pun penyebabnya. Itulah sebabnya Node 1 harus bebas dari `delay()` panjang **sebelum** penjaganya dipasang. Seandainya penjaga ini dipasang di Node 1 v0.4.0, perintah `pompa 10`, yang tidur 10 detik, pasti memicu *restart*.

**Hasilnya** di Wokwi, dari `tidur 3` sampai papan menyala ulang setelah `tidur 7`:

```text
delay(3000)...
Bangun lagi!
Masuk perulangan yang tidak pernah selesai... LED berhenti berkedip.
E (22499) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:
E (22499) task_wdt:  - loopTask (CPU 1)
E (22499) task_wdt: Tasks currently running:
E (22499) task_wdt: CPU 0: IDLE0
E (22499) task_wdt: CPU 1: loopTask
E (22499) task_wdt: Aborting.
E (22499) task_wdt: Print CPU 1 backtrace

Backtrace: 0x400d1876:0x3ffb2220 0x400d3cd8:0x3ffb2270 0x40088125:0x3ffb2290

ELF file SHA256: 750660314

Rebooting...
ets Jul 29 2019 12:21:46
rst:0xc (SW_CPU_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
…
Praktik 6 - watchdog
Alasan restart terakhir: TASK_WDT (watchdog: loop() terlambat memberi makan penjaga)
Watchdog AKTIF: loop() yang macet lebih dari 5 detik akan di-restart.
Perintah: macet, tidur 3, tidur 7, restart
delay(7000)...
E (6553) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:
E (6553) task_wdt:  - loopTask (CPU 1)
E (6553) task_wdt: Tasks currently running:
E (6553) task_wdt: CPU 0: IDLE0
E (6553) task_wdt: CPU 1: IDLE1
E (6553) task_wdt: Aborting.
E (6553) task_wdt: Print CPU 1 backtrace

Backtrace: 0x40085803:0x3ffbd550 0x400efc66:0x3ffbd570 0x400890e3:0x3ffbd590 0x40088125:0x3ffbd5b0

ELF file SHA256: 750660314

Rebooting...
ets Jul 29 2019 12:21:46
rst:0xc (SW_CPU_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
…
Praktik 6 - watchdog
Alasan restart terakhir: TASK_WDT (watchdog: loop() terlambat memberi makan penjaga)
Watchdog AKTIF: loop() yang macet lebih dari 5 detik akan di-restart.
Perintah: macet, tidur 3, tidur 7, restart
```

#### 6.3 Membaca laporan si penjaga

Laporannya terlihat menyeramkan, tetapi isinya bisa dibaca baris demi baris:

| Baris | Artinya |
| :--- | :--- |
| `E (22499) task_wdt:` | Pesan log tingkat ERROR (huruf **E**) dari bagian `task_wdt` (si penjaga). `22499` adalah milidetik sejak papan menyala. Angkamu pasti berbeda. |
| `Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:` | "Penjaga terpicu. Tugas berikut tidak memberinya makan tepat waktu:" |
| ` - loopTask (CPU 1)` | Tugas yang terlambat: `loopTask`, nama resmi tugas yang menjalankan `setup()` dan `loop()`, di inti 1. |
| `Tasks currently running:` lalu `CPU 0: IDLE0` dan `CPU 1: loopTask` | Yang sedang dikerjakan setiap inti saat itu. Inti 0 menganggur, sedangkan inti 1 masih terjebak di `loop()`. Saat `tidur 7`, baris inti 1 berbunyi `IDLE1`: `delay()` membuat inti 1 beristirahat, tetapi `loop()` tetap tidak memberi makan penjaga. |
| `Aborting.` dan `Backtrace: 0x400d…` | Program dihentikan paksa. Deretan alamat itu adalah "jejak kaki" tempat program macet; cara menerjemahkannya ada di 🔬. |
| `Rebooting...` | Papan menyala ulang. |
| `rst:0xc (SW_CPU_RESET)` | Laporan *bootloader*: *restart* oleh program (Konsep 8). |
| `Alasan restart terakhir: TASK_WDT (…)` | Alasan sebenarnya, dari `esp_reset_reason()`. Di Node 1 v1.0, `alasanReset()` menyingkatnya menjadi `WDT`, sesuai Lampiran A Silabus (Konsep 8). |

#### 6.4 Kode lama yang beredar di internet

Banyak tutorial, bahkan jawaban AI, masih menulis *watchdog* dengan cara paket esp32 versi 2. Coba sendiri supaya kamu mengenali gejalanya:

1. Di `setup()`, ganti keenam baris mulai `esp_task_wdt_config_t konfigurasiWatchdog = {` sampai `esp_task_wdt_reconfigure(&konfigurasiWatchdog);` dengan satu baris ini:

   ```cpp
   esp_task_wdt_init(5, true);  // cara penulisan paket esp32 versi 2
   ```

2. Klik **Verify**. Penyusunannya gagal. Intinya seperti ini (di depan setiap baris ada nama file dan nomor barisnya):

   ```text
   error: invalid conversion from 'int' to 'const esp_task_wdt_config_t*' [-fpermissive]
   error: too many arguments to function 'esp_err_t esp_task_wdt_init(const esp_task_wdt_config_t*)'
   ```

   Di paket versi 3, `esp_task_wdt_init()` hanya menerima satu bahan, yaitu alamat "formulir" `esp_task_wdt_config_t`, bukan angka detik dan `true`.

3. Tekan **Ctrl + Z** sampai keenam baris aslinya kembali, lalu klik **Verify** sampai berhasil.

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 9](#9-log-bertingkat-debug-info-error).

### Praktik 7 — Log bertingkat dan berburu *bug* (35 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor** (115200 baud, **New Line**), atau Wokwi dengan [`diagram.json`](kode/modul08_berburu_bug/diagram.json) Node 1 lengkap. Komponen yang dipakai: pompa (D25) beserta tandon dan selangnya, sensor tanah (VN), dan HC-SR04 (D15 dan D35). MB102 menyala. Siapkan juga **VS Code** untuk menulis catatan. Konsep yang dipakai: 9 dan 10.

Sketsa praktik ini **sengaja berisi satu *bug***. Tugasmu bukan langsung memelototi kode untuk mencari baris yang salah, melainkan berlatih enam langkah detektif dari Konsep 10, dengan modul pencatat sebagai kaca pembesarnya. Jangan mengintip bagian 7.6 dulu!

#### 7.1 Buat sketsa tiga file

1. Buat sketsa baru bernama `modul08_berburu_bug`, lalu tempel kode ini di tab utamanya:

   ```cpp
   // Modul 8 - Praktik 7: berburu bug dengan log bertingkat
   // Rangkaian: meja kerja Node 1 (Modul 7). Yang dipakai: pompa D25, sensor tanah di VN (GPIO 39),
   // dan HC-SR04 (TRIG D15, ECHO D35). Modul pencatat ada di tab pencatat.h dan pencatat.cpp.
   //
   // SENGAJA ADA SATU BUG di sketsa ini. Gejalanya: saat tanah kering, pompa hanya berkedip sekejap
   // setiap 2 detik, padahal seharusnya menyala 3 detik lalu beristirahat 30 detik.
   // Perintah di Serial Monitor: log debug, log info, log error.

   #include "pencatat.h"

   const int PIN_POMPA = 25;  // gerbang MOSFET: HIGH = pompa menyala
   const int PIN_TANAH = 39;  // VN
   const int PIN_TRIG = 15;
   const int PIN_ECHO = 35;
   const int PIN_RELAY_LAMPU = 32;  // tidak dipakai di sini: relay lampu dan kipas dimatikan supaya diam
   const int PIN_RELAY_KIPAS = 33;

   const int TANAH_KERING = 3000;    // hasil kalibrasimu dari Modul 6
   const int TANAH_BASAH = 1300;
   const float JARAK_KOSONG = 20.0;
   const float JARAK_PENUH = 5.0;

   const int AMBANG_TANAH_SIRAM = 30;
   const int LEVEL_AIR_MINIMUM = 20;
   const unsigned long JEDA_PERIKSA = 2000;  // SIAGA: periksa tanah setiap 2 detik
   const unsigned long LAMA_SIRAM = 3000;    // MENYIRAM: pompa menyala 3 detik
   const unsigned long LAMA_JEDA = 30000;    // JEDA: istirahat 30 detik

   enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };
   KeadaanSiram keadaan = SIAGA;
   unsigned long waktuMasukKeadaan = 0;  // kapan keadaan sekarang dimulai
   unsigned long waktuPeriksaTerakhir = 0;
   unsigned long waktuDebugTerakhir = 0;

   // ---------- Pembaca baris Serial yang tidak pernah menunggu (sama dengan Praktik 5) ----------
   const int PANJANG_BARIS_MAKS = 40;
   char baris[PANJANG_BARIS_MAKS + 1];
   int panjangBaris = 0;

   bool adaBarisBaru() {
     while (Serial.available() > 0) {
       char huruf = Serial.read();
       if (huruf == '\n') {
         baris[panjangBaris] = '\0';
         panjangBaris = 0;
         return true;
       }
       if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
         baris[panjangBaris] = huruf;
         panjangBaris++;
       }
     }
     return false;
   }

   void periksaPerintahSerial() {
     if (!adaBarisBaru()) {
       return;
     }
     String perintah = baris;
     perintah.trim();
     perintah.toLowerCase();
     if (perintah == "log debug") {
       aturTingkatLog(TINGKAT_DEBUG);
     } else if (perintah == "log info") {
       aturTingkatLog(TINGKAT_INFO);
     } else if (perintah == "log error") {
       aturTingkatLog(TINGKAT_ERROR);
     } else {
       Serial.println("Perintah tidak dikenal. Coba: log debug, log info, log error");
       return;
     }
     Serial.print("Tingkat log sekarang: ");
     Serial.println(namaTingkatLog(tingkatLog()));
   }

   int bacaTanahPersen() {
     long jumlah = 0;
     for (int i = 0; i < 20; i++) {
       jumlah += analogRead(PIN_TANAH);
     }
     int persen = map(jumlah / 20, TANAH_KERING, TANAH_BASAH, 0, 100);
     return constrain(persen, 0, 100);
   }

   int bacaLevelAir() {
     digitalWrite(PIN_TRIG, LOW);
     delayMicroseconds(2);
     digitalWrite(PIN_TRIG, HIGH);
     delayMicroseconds(10);
     digitalWrite(PIN_TRIG, LOW);
     unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);
     if (durasi == 0) {
       return -1;
     }
     float jarak = durasi / 58.0;
     int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
     return constrain(persen, 0, 100);
   }

   const char* namaKeadaan(KeadaanSiram k) {
     if (k == SIAGA) {
       return "SIAGA";
     }
     if (k == MENYIRAM) {
       return "MENYIRAM";
     }
     return "JEDA";
   }

   void pindahKe(KeadaanSiram keadaanBaru) {
     logInfo("Penyiraman: %s -> %s", namaKeadaan(keadaan), namaKeadaan(keadaanBaru));
     keadaan = keadaanBaru;
     unsigned long waktuMasukKeadaan = millis();  // catat kapan keadaan baru dimulai
   }

   void mulaiMenyiram() {
     int levelAir = bacaLevelAir();
     logDebug("Air tandon: %d %%", levelAir);
     if (levelAir < LEVEL_AIR_MINIMUM) {
       logError("Pompa DITOLAK: air tandon %d %%.", levelAir);
       pindahKe(JEDA);
       return;
     }
     digitalWrite(PIN_POMPA, HIGH);
     logInfo("Pompa menyala.");
     pindahKe(MENYIRAM);
   }

   void jalankanPenyiraman() {
     unsigned long sekarang = millis();

     // Rincian untuk berburu bug: sudah berapa lama di keadaan ini? Sekali per detik supaya Serial tidak banjir.
     if (keadaan != SIAGA && sekarang - waktuDebugTerakhir >= 1000) {
       waktuDebugTerakhir = sekarang;
       logDebug("%s: sudah %lu ms", namaKeadaan(keadaan), sekarang - waktuMasukKeadaan);
     }

     if (keadaan == SIAGA) {
       if (sekarang - waktuPeriksaTerakhir >= JEDA_PERIKSA) {
         waktuPeriksaTerakhir = sekarang;
         int tanah = bacaTanahPersen();
         logDebug("SIAGA: tanah %d %% (ambang %d %%)", tanah, AMBANG_TANAH_SIRAM);
         if (tanah < AMBANG_TANAH_SIRAM) {
           logInfo("Tanah kering (%d %%): mulai menyiram.", tanah);
           mulaiMenyiram();
         }
       }
     } else if (keadaan == MENYIRAM) {
       if (sekarang - waktuMasukKeadaan >= LAMA_SIRAM) {
         digitalWrite(PIN_POMPA, LOW);
         logInfo("Pompa padam.");
         pindahKe(JEDA);
       }
     } else if (keadaan == JEDA) {
       if (sekarang - waktuMasukKeadaan >= LAMA_JEDA) {
         pindahKe(SIAGA);
       }
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_POMPA, OUTPUT);
     digitalWrite(PIN_POMPA, LOW);
     pinMode(PIN_TRIG, OUTPUT);
     digitalWrite(PIN_TRIG, LOW);
     pinMode(PIN_ECHO, INPUT);
     pinMode(PIN_RELAY_LAMPU, OUTPUT);
     digitalWrite(PIN_RELAY_LAMPU, HIGH);  // relay aktif LOW: HIGH = padam
     pinMode(PIN_RELAY_KIPAS, OUTPUT);
     digitalWrite(PIN_RELAY_KIPAS, HIGH);
     Serial.println();
     logInfo("Praktik 7 - berburu bug. Tingkat log: %s", namaTingkatLog(tingkatLog()));
   }

   void loop() {
     periksaPerintahSerial();
     jalankanPenyiraman();
   }
   ```

   Jangan klik **Verify** dulu: tab utama memakai `logInfo()` dari `pencatat.h`, yang baru kamu buat di langkah 2–3.

2. Buat tab baru (**⋯ → New Tab**, seperti Praktik 4; di Wokwi **▾ → New file...**) bernama **`pencatat.h`**, lalu tempel isi ini:

   ```cpp
   // pencatat.h - catatan (log) bertingkat ke Serial Monitor: DEBUG, INFO, ERROR (Modul 8)
   // Cara pakainya mirip Serial.printf(), misalnya: logInfo("pompa menyala %d detik", detik);
   #pragma once

   enum TingkatLog { TINGKAT_DEBUG, TINGKAT_INFO, TINGKAT_ERROR };

   void aturTingkatLog(TingkatLog tingkat);      // pesan di bawah tingkat ini tidak dicetak
   TingkatLog tingkatLog();                      // tingkat yang sedang berlaku
   const char* namaTingkatLog(TingkatLog tingkat);  // "DEBUG", "INFO", atau "ERROR"

   void logDebug(const char* format, ...);  // rincian untuk berburu bug
   void logInfo(const char* format, ...);   // kejadian penting sehari-hari
   void logError(const char* format, ...);  // ada yang salah dan perlu perhatian
   ```

3. Buat satu tab lagi bernama **`pencatat.cpp`**, lalu tempel isi ini:

   ```cpp
   // pencatat.cpp - isi modul pencatat. Daftar fungsinya ada di pencatat.h.
   #include <Arduino.h>
   #include <stdarg.h>     // va_list: bahan "titik tiga" (...) milik logDebug, logInfo, dan logError
   #include <esp_timer.h>  // esp_timer_get_time()
   #include "pencatat.h"

   static TingkatLog tingkatSekarang = TINGKAT_INFO;  // bawaan: DEBUG disembunyikan

   void aturTingkatLog(TingkatLog tingkat) {
     tingkatSekarang = tingkat;
   }

   TingkatLog tingkatLog() {
     return tingkatSekarang;
   }

   const char* namaTingkatLog(TingkatLog tingkat) {
     if (tingkat == TINGKAT_DEBUG) {
       return "DEBUG";
     }
     if (tingkat == TINGKAT_INFO) {
       return "INFO";
     }
     return "ERROR";
   }

   // Inti ketiga fungsi log: menyaring tingkat, lalu mencetak [jam:menit:detik sejak menyala], tingkat, dan pesannya.
   static void cetakLog(TingkatLog tingkat, const char* format, va_list bahan) {
     if (tingkat < tingkatSekarang) {
       return;  // terlalu rinci untuk tingkat yang sedang dipilih
     }
     char pesan[160];
     vsnprintf(pesan, sizeof(pesan), format, bahan);  // seperti snprintf, tetapi bahannya diteruskan dari "..."
     unsigned long detik = esp_timer_get_time() / 1000000;  // detik sejak menyala (Konsep 3)
     // %02lu = angka unsigned long minimal 2 digit (05, bukan 5); %-5s = teks rata kiri selebar 5 huruf
     Serial.printf("[%02lu:%02lu:%02lu] %-5s %s\n", detik / 3600, (detik / 60) % 60, detik % 60,
                   namaTingkatLog(tingkat), pesan);
   }

   void logDebug(const char* format, ...) {
     va_list bahan;
     va_start(bahan, format);
     cetakLog(TINGKAT_DEBUG, format, bahan);
     va_end(bahan);
   }

   void logInfo(const char* format, ...) {
     va_list bahan;
     va_start(bahan, format);
     cetakLog(TINGKAT_INFO, format, bahan);
     va_end(bahan);
   }

   void logError(const char* format, ...) {
     va_list bahan;
     va_start(bahan, format);
     cetakLog(TINGKAT_ERROR, format, bahan);
     va_end(bahan);
   }
   ```

4. Ganti empat angka kalibrasinya dengan milikmu (seperti Praktik 3). Di Wokwi, biarkan angka bawaannya.
5. Pastikan tandon berisi air, sensor tanah tertancap di tanah lembap, dan selang mengarah ke gelas tanaman atau kembali ke tandon. Colokkan USB, nyalakan MB102 (pompa dan HC-SR04 mendapat daya dari situ; di Praktik 5 dan 6 tadi, MB102 boleh mati), lalu klik **Upload** dan buka Serial Monitor. Baris pertamanya berbunyi `[00:00:01] INFO  Praktik 7 - berburu bug. Tingkat log: INFO` (di papan asli, detiknya bisa `00`).

Sekilas tentang modul pencatat. `logDebug()`, `logInfo()`, dan `logError()` dipakai seperti `Serial.printf()` (Konsep 6). Tanda `...` di `pencatat.h` artinya "boleh diikuti bahan sebanyak apa pun", sama seperti `printf`. Di dalam `pencatat.cpp`, ketiganya meneruskan pekerjaannya ke `cetakLog()`, yang (1) membuang pesan yang tingkatnya di bawah tingkat yang berlaku, (2) menyusun pesannya dengan `vsnprintf()`, saudara `snprintf()` yang menerima bahan dari `...`, lalu (3) mencetaknya dengan awalan waktu dan tingkat. `va_list`, `va_start`, dan `va_end` adalah perlengkapan C++ untuk meneruskan bahan dari `...`. Kamu tidak perlu menghafalnya; cukup tahu cara memakai ketiga fungsi lognya.

#### 7.2 Langkah 1 — Ulangi *bug*-nya

1. Biarkan sketsa berjalan **setidaknya 30 detik** setelah unggahan selesai supaya gejalanya sama dengan contoh di bawah. Pakai waktu itu untuk membaca langkah berikutnya.
2. Angkat sensor tanah ke udara. Di Wokwi, klik potensiometer lalu tekan **End**.
3. Perhatikan pompa dan Serial Monitor. Di Wokwi, LED `pompa` **hanya berkedip sekejap, berulang setiap 2 detik**. Di papan asli, pompa bahkan tidak sempat berputar; paling-paling terdengar "tik" kecil dari pompanya. Bukti paling jelas ada di log: `Pompa menyala.` dan `Pompa padam.` muncul di detik yang sama, padahal aturannya (Praktik 3) jelas: menyala 3 detik, lalu beristirahat 30 detik.
4. Tancapkan lagi sensornya ke tanah lembap supaya gelasmu tidak meluap.

**Hasilnya** di Wokwi:

```text
[00:00:01] INFO  Praktik 7 - berburu bug. Tingkat log: INFO
[00:00:52] INFO  Tanah kering (0 %): mulai menyiram.
[00:00:52] INFO  Pompa menyala.
[00:00:52] INFO  Penyiraman: SIAGA -> MENYIRAM
[00:00:52] INFO  Pompa padam.
[00:00:52] INFO  Penyiraman: MENYIRAM -> JEDA
[00:00:52] INFO  Penyiraman: JEDA -> SIAGA
[00:00:54] INFO  Tanah kering (0 %): mulai menyiram.
[00:00:54] INFO  Pompa menyala.
[00:00:54] INFO  Penyiraman: SIAGA -> MENYIRAM
[00:00:54] INFO  Pompa padam.
[00:00:54] INFO  Penyiraman: MENYIRAM -> JEDA
[00:00:54] INFO  Penyiraman: JEDA -> SIAGA
```

Buka **VS Code**, pilih **File → Open Folder…**, lalu buka **Documents → GitHub → belajar-iot**. Di panel **Explorer** (kiri), klik sekali folder `modul-08` supaya tersorot, arahkan mouse ke judul **BELAJAR-IOT** di atasnya, lalu klik ikon **New File…** (lembar kertas bertanda +). File barunya masuk ke folder yang tersorot. Ketik `catatan-debugging.md`, tekan **Enter**, tulis dua kalimat detektifmu yang pertama, lalu simpan dengan **Ctrl + S**. Biarkan VS Code terbuka; catatan ini kamu lengkapi di langkah-langkah berikutnya.

```markdown
- Seharusnya: pompa menyala 3 detik, lalu beristirahat 30 detik.
- Kenyataannya: pompa hanya berkedip sekejap, lalu menyala lagi 2 detik kemudian.
```

#### 7.3 Langkah 2 — Amati, jangan menebak

Baca log INFO di atas dengan teliti. Keempat perpindahan, yaitu `SIAGA -> MENYIRAM`, `MENYIRAM -> JEDA`, `JEDA -> SIAGA`, lalu `SIAGA -> MENYIRAM` lagi, terjadi **di detik yang sama atau berselang 2 detik**. MENYIRAM seharusnya bertahan 3 detik dan JEDA 30 detik. Keduanya berakhir terlalu cepat. Apa kesamaan keduanya? Keduanya menghitung lamanya dari `waktuMasukKeadaan`. Tulis dugaanmu:

```markdown
- Dugaan: hitungan waktu di keadaan MENYIRAM dan JEDA salah.
```

#### 7.4 Langkah 3 — Perbesar buktinya dengan DEBUG

Ketik `log debug` di Serial Monitor, lalu keringkan lagi tanahnya. Sekarang sketsa juga mencetak, sekali per detik, sudah berapa lama ia berada di keadaan yang sedang berlaku:

```text
Tingkat log sekarang: DEBUG
[00:00:58] DEBUG SIAGA: tanah 0 % (ambang 30 %)
[00:00:58] INFO  Tanah kering (0 %): mulai menyiram.
[00:00:58] DEBUG Air tandon: 52 %
[00:00:58] INFO  Pompa menyala.
[00:00:58] INFO  Penyiraman: SIAGA -> MENYIRAM
[00:00:58] DEBUG MENYIRAM: sudah 58015 ms
[00:00:58] INFO  Pompa padam.
[00:00:58] INFO  Penyiraman: MENYIRAM -> JEDA
[00:00:58] INFO  Penyiraman: JEDA -> SIAGA
[00:01:00] DEBUG SIAGA: tanah 0 % (ambang 30 %)
[00:01:00] INFO  Tanah kering (0 %): mulai menyiram.
[00:01:00] DEBUG Air tandon: 52 %
[00:01:00] INFO  Pompa menyala.
[00:01:00] INFO  Penyiraman: SIAGA -> MENYIRAM
[00:01:00] DEBUG MENYIRAM: sudah 60015 ms
[00:01:00] INFO  Pompa padam.
[00:01:00] INFO  Penyiraman: MENYIRAM -> JEDA
[00:01:00] INFO  Penyiraman: JEDA -> SIAGA
```

Lihat baris `MENYIRAM: sudah … ms`. Baris ini dicetak **sesaat setelah** pompa menyala, jadi seharusnya angkanya mendekati `0`. Kenyataannya, angkanya puluhan ribu, dan hampir sama dengan waktu di awal baris log, yaitu lama papan menyala. Artinya, `sekarang - waktuMasukKeadaan` sama dengan `sekarang - 0`: **`waktuMasukKeadaan` selalu bernilai 0**, seolah-olah tidak pernah diisi. Itulah angka yang tidak masuk akal yang kita cari. Tambahkan ke catatanmu:

```markdown
- Bukti: sesaat setelah pompa menyala, log DEBUG mencetak "MENYIRAM: sudah 58015 ms",
  hampir sama dengan lama papan menyala. Artinya, waktuMasukKeadaan selalu 0.
```

Ketik `log info` untuk menyembunyikan pesan DEBUG lagi, lalu tancapkan kembali sensornya ke tanah lembap (di Wokwi, seret kenop potensiometer ke tengah).

#### 7.5 Langkah 4 dan 5 — Bagi dua dan isolasi

Pertanyaannya kini lebih sempit: **di mana `waktuMasukKeadaan` diisi, dan mengapa isiannya tidak sampai?**

1. Tekan **Ctrl + F** di Arduino IDE, lalu cari `waktuMasukKeadaan`. Tekan **Enter** berulang kali untuk melompat dari temuan ke temuan. Ada lima tempat: satu di bagian atas sketsa (tempat variabel itu dibuat), satu di dalam `pindahKe()`, dan tiga di dalam `jalankanPenyiraman()` (tempat isinya dibaca).
2. Hanya satu tempat yang **mengisinya**: baris di dalam `pindahKe()`. Bandingkan baris itu dengan baris di bagian atas sketsa. Perhatikan awal barisnya.
3. **(Isolasi, opsional)** Ingin bukti tambahan? Tambahkan sementara satu baris tepat di bawah baris tersangka, di dalam `pindahKe()`:

   ```cpp
   logInfo("pindahKe: waktuMasukKeadaan = %lu", waktuMasukKeadaan);
   ```

   Unggah, ketik `log debug` lagi (setiap kali diunggah, tingkat lognya kembali ke INFO), lalu keringkan tanahnya. Baris baru dari `pindahKe()` mencetak angka puluhan ribu, dan di sini angka itu **benar**: itulah jam saat keadaan baru dimulai, yaitu lama papan menyala saat itu. Sesaat kemudian, `jalankanPenyiraman()` tetap mencetak `MENYIRAM: sudah … ms` dengan angka yang hampir sama besar, padahal seharusnya mendekati 0. Artinya, `jalankanPenyiraman()` masih membaca **0**. Dua angka berbeda untuk nama yang sama berarti ada **dua variabel berbeda** yang kebetulan bernama sama. Hapus lagi baris sementara itu.

#### 7.6 Langkah 6 — Ubah satu hal, lalu buktikan

Penyebabnya ada di baris ini, di dalam `pindahKe()`:

```cpp
  unsigned long waktuMasukKeadaan = millis();  // catat kapan keadaan baru dimulai
```

Karena diawali `unsigned long`, baris ini **membuat variabel baru** bernama `waktuMasukKeadaan` yang hanya hidup di dalam `pindahKe()`, lalu hilang begitu fungsi itu selesai di kurung kurawal penutupnya. Variabel milik seluruh sketsa, yang namanya sama dan dibaca oleh `jalankanPenyiraman()`, tidak pernah tersentuh dan tetap bernilai 0. Variabel baru yang "menutupi" variabel lain bernama sama seperti ini disebut **variabel bayangan** (*shadowing*). Ini salah satu *bug* paling klasik di C++ karena kodenya terlihat benar dan tersusun tanpa error.

Perbaikannya hanya **satu perubahan**: hapus `unsigned long ` di awal baris itu sehingga menjadi:

```cpp
  waktuMasukKeadaan = millis();  // catat kapan keadaan baru dimulai
```

Unggah lagi, ketik `log debug`, lalu ulangi langkah 1 (kali ini tidak perlu menunggu 30 detik). Kini pompa menyala 3 detik dan log DEBUG menghitung dari nol:

```text
Tingkat log sekarang: DEBUG
[00:00:04] DEBUG SIAGA: tanah 0 % (ambang 30 %)
[00:00:04] INFO  Tanah kering (0 %): mulai menyiram.
[00:00:04] DEBUG Air tandon: 52 %
[00:00:04] INFO  Pompa menyala.
[00:00:04] INFO  Penyiraman: SIAGA -> MENYIRAM
[00:00:04] DEBUG MENYIRAM: sudah 0 ms
[00:00:05] DEBUG MENYIRAM: sudah 1000 ms
[00:00:06] DEBUG MENYIRAM: sudah 2000 ms
[00:00:07] DEBUG MENYIRAM: sudah 3000 ms
[00:00:07] INFO  Pompa padam.
[00:00:07] INFO  Penyiraman: MENYIRAM -> JEDA
```

Biarkan sensornya tetap di udara sedikit lebih lama: 30 detik setelah pompa padam, Node 1 kembali ke SIAGA dan menyiram lagi. Setelah itu, tancapkan kembali sensornya. *Bug*-nya terbukti hilang. Lengkapi catatanmu:

```markdown
- Penyebab: di pindahKe(), "unsigned long waktuMasukKeadaan = millis();" membuat variabel baru (bayangan),
  jadi variabel waktuMasukKeadaan milik seluruh sketsa tetap 0.
- Perbaikan: hapus "unsigned long " di baris itu.
- Pelajaran: jangan menulis jenis data lagi saat mengisi variabel yang sudah ada.
```

#### 7.7 Bonus: kompilernya sudah berbisik sejak awal

1. Di Arduino IDE, buka **File → Preferences…** (macOS: **Arduino IDE → Settings…**). Ubah **Compiler warnings** dari **None** menjadi **More**, lalu klik **OK**.

   ![Ilustrasi jendela Preferences di Arduino IDE 2, tab Settings. Baris-baris lain dipudarkan; yang ditonjolkan baris Compiler warnings, kotak pilihannya berisi More (penanda 2) dengan catatan bawaan: None, dan daftar pilihannya terbuka di bawahnya: None, Default, More (disorot), dan All. Penanda 1 pada judul jendela Preferences, penanda 3 pada tombol OK di sebelah tombol CANCEL. Kanan, panel Output setelah Verify berisi peringatan berwarna putih di latar hitam: modul08_berburu_bug.ino: In function void pindahKe(KeadaanSiram):, lalu modul08_berburu_bug.ino:114:17: warning: unused variable waktuMasukKeadaan [-Wunused-variable], dengan tiga baris terakhir ditandai penanda 4. Keterangan bawah: 1, File, Preferences… (macOS: Arduino IDE, Settings…); 2, Compiler warnings: ubah None menjadi More; 3, klik OK, lalu klik Verify; 4, cari peringatan yang menyebut nama file sketsamu. Catatan: ilustrasi, bukan tangkapan layar](aset/arduino-compiler-warnings.png)

2. Tekan **Ctrl + Z** di tab utama sampai `unsigned long ` muncul lagi di baris tadi sehingga *bug*-nya kembali. Klik **Verify**.
3. Gulir panel **Output** di bawah. Di antara pesannya ada peringatan ini:

   ```text
   warning: unused variable 'waktuMasukKeadaan' [-Wunused-variable]
   ```

   Artinya, "variabel `waktuMasukKeadaan` (yang baru itu) tidak pernah dipakai". Kompiler sudah menunjuk *bug* ini sejak awal, tetapi peringatannya disembunyikan oleh pilihan bawaan **None**. Mungkin muncul juga peringatan dari library atau paket esp32 yang bukan buatanmu; cari yang menyebut nama file sketsamu.
4. Perbaiki lagi barisnya (hapus `unsigned long `), lalu klik **Verify** sampai peringatan itu hilang. Biarkan **Compiler warnings** di **More** untuk seterusnya. Satu hal lagi yang perlu kamu tahu: untuk angka yang rentangnya ia ketahui, kompiler menghitung teks **terpanjang yang mungkin**, bukan yang biasa muncul. Kalau suatu saat ia memperingatkan `may be truncated` di sketsamu, perbesar laci `char[]`-nya (Konsep 6). Sebaliknya, tidak ada peringatan belum tentu berarti lacinya cukup: untuk angka yang rentangnya tidak ia ketahui, kompiler diam saja.

> ➡️ **Selesai Praktik 7?** Lanjut ke [Praktik 8](#praktik-8--simpan-ke-github-15-menit).

### Praktik 8 — Simpan ke GitHub (15 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE**, **VS Code** (dari Modul 4), dan **GitHub Desktop** (dari Modul 3). Konsep yang dipakai: tidak ada konsep baru.

1. **Simpan sketsa ke repositori.** Sudah menyimpan langsung ke folder `modul-08` sejak awal (kotak **Tip** di awal bagian Praktik)? Lewati langkah ini. Kalau belum, buka sketsanya satu per satu, lalu pilih **File → Save As…** dan simpan ke **Documents → GitHub → belajar-iot → modul-08**. Yang wajib ada: `modul08_tiga_tugas`, `modul08_ambang_nvs`, dan `modul08_watchdog`.
2. **Periksa sketsa yang terdiri atas beberapa file.** Di VS Code, buka folder `belajar-iot` (**File → Open Folder…**), lalu buka folder `modul-08/modul08_modular`. Isinya harus lima file: `modul08_modular.ino`, `detak.h`, `detak.cpp`, `tombol.h`, dan `tombol.cpp`. Folder `modul08_berburu_bug` berisi tiga file. Arduino IDE menyimpan setiap tab sebagai file terpisah di folder sketsanya.
3. **Lengkapi `catatan-debugging.md`** dari Praktik 7, lalu simpan dengan **Ctrl + S**.
4. Di GitHub Desktop, pastikan kotak **Current repository** bertuliskan **belajar-iot**. Tab **Changes** berisi file-file baru di `modul-08`. Pengguna macOS: hilangkan centang `.DS_Store` kalau muncul.
5. Isi **Summary** dengan `Modul 8: millis, state machine, kode modular, NVS, watchdog, log`, klik **Commit … to main**, lalu **Push origin**.
6. Klik **Repository → View on GitHub** dan buka folder `modul-08`: semua sketsa dan catatanmu sudah ada di sana.

Tanpa GitHub Desktop? Pakai jalur pengganti di catatan akhir [Modul 4 Praktik 10](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#praktik-10--simpan-ke-github-checkpoint-fase-0-15-menit).

> ➡️ **Sesudah Praktik 8:** kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini) — di sana Node 1 naik ke v1.0 dan menjalani uji 24 jam — lalu tutup dengan [📝 Kuis](#-kuis-5-soal) dan [✅ Checklist kelulusan](#-checklist-kelulusan-modul-8). Bagian 🚨 dan 🔬 di antaranya cukup dibuka saat perlu.

---

## 🚨 Kalau Tidak Jalan?

Minggu ini, sumber bukti pertamamu adalah **Serial Monitor**: hampir semua sketsa melaporkan apa yang sedang terjadi, dan Node 1 v1.0 bahkan punya log bertingkat. Kalau Serial Monitor diam, lihat LED status: berkedip pelan berarti `loop()` masih berputar, berkedip cepat berarti ada sensor yang bermasalah, dan diam berarti programnya macet (atau belum berjalan). Klik judul masalah untuk membuka penjelasannya.

> [!IMPORTANT]
> Setiap kali memeriksa atau memindah kabel: **matikan MB102, lalu cabut USB**. Setelah selesai, colokkan USB dulu, baru nyalakan MB102.

<details>
<summary><b><code>Compilation error</code> — pesan error minggu ini</b></summary>

Di depan setiap pesan ada nama file dan nomor barisnya, misalnya `modul08_modular.ino:95:5:` (baris 95, huruf ke-5). Buka tab file itu dan cari baris tersebut. Kalau errornya banyak, baca **pesan error pertama** dulu: error-error berikutnya sering hanya akibat dari yang pertama.

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `'KeadaanSiram' was not declared in this scope` dan `variable or field 'pindahKe' declared void` | `enum` ditulis di bawah fungsi pertama sketsa. | Pindahkan `enum` beserta variabelnya ke bagian atas sketsa, sebelum fungsi mana pun (Konsep 4). |
| `'mulaiDetak' was not declared in this scope` | Tab utama tidak menulis `#include "detak.h"`, nama fungsinya salah ketik, tab `detak.h` masih kosong, atau (di file `.cpp`) fungsinya baru ditulis di bawah baris yang memakainya. | Tambahkan `#include`-nya; samakan nama fungsi dengan yang ada di file `.h` (Praktik 4.5); isi tab `.h` yang kosong; di file `.cpp`, pindahkan fungsinya ke atas baris yang memakainya (Konsep 5). |
| `fatal error: detak.h: No such file or directory` | Nama tab tidak sama persis dengan yang di-`#include`, misalnya salah ketik (`detek.h`) atau `detak.ino` (akhiran `.h` lupa ditulis sehingga Arduino IDE menambahkan `.ino`). Di Wokwi, huruf besar-kecil juga harus sama (`Detak.h` berbeda dengan `detak.h`). | Buka tab itu, klik **⋯ → Rename**, lalu perbaiki namanya. Di Wokwi, periksa juga apakah filenya masih kosong (lihat masalah Wokwi di bawah). |
| ``undefined reference to `perbaruiDetak()'`` dan `ld returned 1 exit status` | File `.h` menjanjikan fungsi itu, tetapi tidak ada file `.cpp` yang membuatnya: namanya berbeda, tab `.cpp`-nya belum dibuat, atau (di Wokwi) tab `.cpp`-nya masih kosong. | Samakan nama fungsi di `.h` dan `.cpp`, lalu pastikan tab `detak.cpp` benar-benar ada (Praktik 4.5). |
| `multiple definition of …`, misalnya ``multiple definition of `perbaruiDetak()'`` | Ada fungsi atau variabel bernama sama di dua file. Contohnya, `perbaruiDetak()` dan `periksaTombol()` versi Praktik 3 masih tertinggal di tab utama karena langkah 4.3 Praktik 4 belum mengganti **seluruh** isinya. Penyebab lain: variabel bernama sama di dua file `.cpp` tanpa `static`, atau variabel biasa (bukan `const`) di file `.h` yang di-`#include` oleh beberapa file. | Ganti seluruh isi tab utama (Praktik 4.3). Untuk variabel, pindahkan ke satu file `.cpp` dan beri `static` (Konsep 5). Di Wokwi, nama fungsinya tampil tersandi, misalnya `_Z13perbaruiDetakv`. |
| `'BacaanSensor' was not declared in this scope` atau `'BacaanSensor' does not name a type`, bersama puluhan error lain | Ada tab `.h` yang masih kosong (di sini `sensor.h`), atau isinya tertukar dengan pasangan `.cpp`-nya. | Periksa baris pertama setiap tab (➕ B), lalu tempel ulang tab yang salah. |
| `redefinition of 'const unsigned char IKON_MATAHARI []'` | Ikon atau fungsi rujukan ikut tersalin ke `layar.cpp` sehingga ada dua, atau isi satu tab tertempel dua kali. | Hapus salinan yang dobel (➕ C), lalu periksa baris pertama dan terakhir setiap tab (➕ B). |
| `'millis' was not declared in this scope` (atau `'digitalWrite' …`) di file `.cpp` | File `.cpp` lupa `#include <Arduino.h>`. | Tambahkan baris itu di bagian atas file `.cpp`. |
| `invalid conversion from 'int' to 'const esp_task_wdt_config_t*'` dan `too many arguments to function 'esp_err_t esp_task_wdt_init(…)'` | Kode *watchdog* cara paket esp32 versi 2. | Pakai cara versi 3 di Konsep 8 (Praktik 6.4). |
| `'esp_task_wdt_config_t' was not declared in this scope` | Lupa `#include <esp_task_wdt.h>`, atau paket esp32-mu masih versi 2.x. | Tambahkan `#include`-nya. Periksa versi paketnya di **Tools → Board → Boards Manager** (cari **esp32**); harus 3.3.x. |
| `fatal error: DHT.h: No such file or directory` | Library DHT belum terpasang. Di Wokwi: tab `libraries.txt` belum berisi daftar library. | Pasang **DHT sensor library** 1.4.7 (Modul 6). Di Wokwi, salin `libraries.txt` dari folder praktiknya. |

</details>

<details>
<summary><b>Perintah di Serial Monitor tidak dijawab</b></summary>

1. **Akhiran baris harus New Line.** Mulai Praktik 5, sketsa baru mengerjakan perintahmu setelah tanda akhir baris (`'\n'`) tiba. Kalau menu di kanan kotak ketik bertuliskan **No Line Ending** atau **Carriage Return**, tanda itu tidak pernah terkirim, jadi perintahmu menumpuk tanpa pernah dikerjakan. Pilih **New Line**, lalu ketik ulang perintahnya. Perintah pertama sesudah mengganti pilihan bisa dijawab `Perintah tidak dikenal` karena masih bercampur dengan ketikan sebelumnya; ketik sekali lagi.
2. **Laju baud harus 115200.** Kalau yang tampil huruf acak, ubah menu di pojok kanan Serial Monitor menjadi **115200 baud**.
3. **Program sedang macet.** Kalau LED status juga berhenti berkedip, program terjebak. Di Praktik 6, hal ini disengaja (`macet`). Di sketsa lain, lihat masalah "Papan *restart* terus-menerus" dan "LED status diam" di bawah.
4. **Di Node 1 v1.0, tingkat log tidak memengaruhi jawaban perintah.** Jawaban perintah seperti `status` dan `info` selalu dicetak, bahkan saat tingkat log ERROR. Yang disembunyikan hanya baris log.

</details>

<details>
<summary><b>Tekan lama terbaca sebagai tekan pendek (atau sebaliknya)</b></summary>

- **Di Wokwi**, simulator sering berjalan lebih lambat daripada jam sungguhan. Lihat persentase kecepatannya di kanan atas panel simulasi, misalnya `49%`. Pada kecepatan 50 %, tombol yang kamu tahan 1,6 detik hanya "terasa" 0,8 detik oleh ESP32 di simulator sehingga terbaca sebagai tekan pendek. Tahan tombolnya lebih lama, 2–3 detik.
- **Di papan asli**, tekan lama dihitung sejak tombol **mulai ditekan**. Tahan terus sampai tanda tekan lamanya muncul, baru lepaskan: relay kipas berbunyi "klik" (Praktik 2), pesan `Tombol ditahan…` tercetak (Praktik 3–4), atau halaman status tampil di layar (Node 1 v1.0).
- **Satu tekanan terbaca dua kali?** Tombolnya memantul lebih lama daripada 30 ms. Naikkan `JEDA_PANTUL` menjadi `50` (di Node 1 v1.0, angka ini ada di tab `tombol.cpp`).

</details>

<details>
<summary><b>LED status berkedip cepat</b></summary>

Itu tanda dari Node 1 bahwa ada sensor yang gagal dibaca. Lihat Serial Monitor: Node 1 v1.0 mencetak satu baris `ERROR` yang menyebut sensornya, sekali saat sensor itu mulai gagal.

- `DHT22 tidak terbaca.` — periksa kabel kuning DHT22 di **8f** breadboard atas, serta kabel oranye (3,3 V) dan kabel hitamnya (GND) (Modul 6, Praktik 4).
- `HC-SR04: gema tidak kembali…` — periksa kabel TRIG (D15), ECHO lewat pembagi tegangan (D35), dan daya 5 V-nya dari rel atas. Gema juga bisa hilang kalau sensor tidak menghadap permukaan air dengan lurus.

Begitu sensornya pulih, tercetak `DHT22 kembali terbaca.` atau `HC-SR04 kembali terbaca.`, dan LED kembali berkedip pelan setelah semua sensor terbaca lagi. Di Praktik 3 dan 4, kedip cepat berarti hal lain: pompa ditolak karena air tandon kurang. Isi tandonnya.

</details>

<details>
<summary><b>Serial Monitor kosong, padahal LED status berdetak</b></summary>

LED yang berdetak berarti `loop()` berputar dengan baik; yang bermasalah hanya jalur ke Serial Monitor.

1. **Baris dari `setup()` terlewat.** Serial Monitor baru tersambung setelah papan menyala. Tekan **EN** supaya programnya mulai lagi dari awal.
2. **Serial Monitor belum dibuka, atau port-nya salah.** Pilih port papanmu di bilah atas Arduino IDE, lalu buka lagi Serial Monitor.
3. **Laju baud bukan 115200.** Ubah menu di pojok kanan Serial Monitor menjadi **115200 baud**.
4. **Di Node 1 v1.0, tingkat log masih ERROR.** Laporan bacaan setiap 2 detik adalah log INFO. Ketik `log info`.
5. **Di Wokwi**, Serial Monitor ada di bawah panel simulasi. Kalau panelnya terlalu kecil, seret batas atasnya ke atas.

</details>

<details>
<summary><b>Pompa menyala berulang-ulang, padahal tanah basah (atau <code>tanah</code> selalu 0 % atau 100 %)</b></summary>

Hampir pasti angka kalibrasi `TANAH_KERING` dan `TANAH_BASAH` belum diganti dengan milikmu. Sketsa di modul ini memakai angka contoh. Salin angkamu dari Node 1 v0.4.0 (Praktik 3.2 langkah 2, Praktik 7.1 langkah 4, dan bagian ➕ C). Kalau angkamu sendiri pun meragukan, ulangi kalibrasi di Modul 6. Di Wokwi, biarkan angka bawaannya.

</details>

<details>
<summary><b>LED status diam (tetap menyala atau tetap padam) dan Serial Monitor membisu</b></summary>

`loop()` tidak berputar lagi.

- **Dengan *watchdog* aktif**, papan seharusnya menyala ulang dalam 5 detik. Kalau tidak, periksa apakah `esp_task_wdt_add(NULL)` benar-benar dipanggil di akhir `setup()`, dan `esp_task_wdt_reset()` dipanggil di awal `loop()`. Jangan menaruh `esp_task_wdt_reset()` di dalam perulangan yang bisa macet; penjaga yang terus diberi makan dari dalam perulangan macet tidak akan pernah menggonggong.
- **Belum sampai `loop()`?** Kalau baris pembuka dari `setup()` pun tidak muncul, tekan **EN**. Kalau tetap tidak muncul, cek kabel USB, port, dan laju baud.
- **Setelah mengunggah sketsa tanpa *watchdog*** (misalnya `PAKAI_WATCHDOG = false` di Praktik 6), program yang macet memang diam selamanya. Tekan **EN**.

</details>

<details>
<summary><b>Papan <i>restart</i> terus-menerus (<i>bootloop</i>)</b></summary>

Baca alasan *restart*-nya di baris pembuka (`Alasan restart terakhir: …`) atau di halaman status layar Node 1 v1.0:

- **`WDT` atau `TASK_WDT`.** Ada bagian yang menahan `loop()` lebih dari 5 detik, misalnya `delay()` panjang yang tertinggal dari kode lama, `while` yang menunggu sesuatu yang tidak pernah datang, atau `idle_core_mask` yang diubah menjadi `0b11` (Konsep 8). Cari `delay(` di semua tab; di VS Code, **Ctrl + Shift + F** mencari di seluruh folder. Untuk sementara, kamu bisa memperbesar `BATAS_WATCHDOG` supaya sempat membaca lognya.
- **`BROWNOUT`.** Tegangan sempat anjlok, sering kali tepat saat pompa atau relay menyala. Pastikan beban mendapat daya dari MB102, bukan dari pin ESP32, dan semua GND tersambung (aturan emas Modul 5). Modul 9 membahas catu daya yang lebih kuat.
- **`PANIC`.** Program mogok, misalnya karena mengakses larik di luar batasnya. Baca baris-baris sebelum `Rebooting...` di Serial Monitor; 🔬 menjelaskan cara menerjemahkan `Backtrace`.

</details>

<details>
<summary><b>Ambang kembali ke 30 % setelah papan menyala lagi</b></summary>

1. **Di Wokwi, kamu menekan ■ lalu ▶.** Itu memulai chip baru yang kosong. Pakai perintah `restart` (Konsep 7).
2. **Menu Tools → Erase All Flash Before Sketch Upload bernilai Enabled.** Setiap unggahan menghapus seluruh *flash*, termasuk NVS. Kembalikan ke **Disabled**.
3. **Nama map atau label berbeda.** `arsip.begin("node1", …)` dan label `"tanah_siram"` harus ditulis sama persis di semua tempat. Nama yang lebih dari 15 huruf membuat penyimpanannya gagal diam-diam.
4. **`arsip.begin()` belum dipanggil**, atau dipanggil dengan `true` (hanya baca) sebagai bahan kedua.
5. **Kamu mengetik `ambang bawaan`.** Perintah itu memang menghapus ambang dari NVS.

</details>

<details>
<summary><b>Uji 24 jam gagal: <i>uptime</i> kembali ke nol atau angka <code>Nyala ke-</code> bertambah</b></summary>

Lihat baris `Restart:` di halaman status layar (tekan lama tombol):

- **`POWERON`** — listrik ke ESP32 sempat terputus: laptop tidur atau mati, kabel USB longgar, atau *charger* dicabut. Pakai *charger* HP, atau atur laptop supaya tidak tidur (bagian ➕ F). Ingat juga: menekan **EN** sesudah mencatat angka awal (misalnya untuk modul microSD beregulator) ikut menambah angka `Nyala ke-`. Catat angka awal **sesudah** menekan EN.
- **`BROWNOUT`** — tegangan anjlok (lihat masalah *bootloop* di atas).
- **`WDT`** — ada yang macet. Ulangi uji dengan laptop tercolok dan Serial Monitor terbuka supaya log terakhir sebelum *restart* bisa dibaca.
- **`PANIC`** — program mogok. Simpan pesan sebelum `Rebooting...`.

**Catatan Wokwi:** setelah perintah `restart`, jam *uptime* di Wokwi tidak kembali ke nol, padahal di papan asli kembali ke nol. Itulah sebabnya uji 24 jam memakai **dua** bukti sekaligus: *uptime* dan angka `Nyala ke-`.

</details>

<details>
<summary><b>Wokwi: <code>fatal error: … .h: No such file or directory</code>, padahal tabnya ada</b></summary>

- **File yang masih kosong tidak ikut disusun.** Tempel isinya dulu, baru klik **▶**.
- **Nama tab berbeda satu huruf** dengan yang di-`#include`, termasuk huruf besar-kecil.
- **Kotak nama file baru masih berisi nama file sebelumnya.** Akibatnya, namanya menjadi gabungan, misalnya `detak.hdetak.cpp`. Hapus tab yang salah (**▾ → Delete**), lalu buat lagi dengan nama yang benar.

</details>

<details>
<summary><b>Serial Monitor kebanjiran pesan dan program terasa lambat</b></summary>

- **Tingkat log masih DEBUG.** Ketik `log info`.
- **Ada log atau `Serial.print()` yang dicetak di setiap putaran `loop()`.** Pada 115200 baud, Serial hanya sanggup mengirim sekitar 11.500 huruf per detik. Kalau `loop()` mencetak lebih banyak daripada itu, `loop()` ikut melambat karena menunggu Serial. Cetak hanya saat ada perubahan (Konsep 9), atau batasi dengan pola `millis()`, misalnya sekali per detik seperti di Praktik 7.

</details>

<details>
<summary><b>Pompa tidak mau menyala sama sekali</b></summary>

- **Lihat Serial Monitor.** `Pompa DITOLAK: air tandon …` berarti pengaman tandon bekerja: isi tandonnya, atau periksa HC-SR04 kalau tertulis `tidak terbaca`.
- **Penyiraman sedang JEDA.** Setelah menyiram (atau setelah ditolak), Node 1 beristirahat 30 detik. Ketik `info` di Node 1 v1.0: baris ketiganya menyebut `penyiraman SIAGA`, `MENYIRAM`, atau `JEDA`.
- **Tanah belum cukup kering.** Ambangnya mungkin sudah kamu ubah di Praktik 5. Ketik `ambang` untuk melihatnya.
- **Perintah `pompa 3` juga ditolak?** Itu pengaman yang sama. Perintah manual memakai bacaan tandon terbaru (paling lama 2 detik), jadi kalau sensornya baru saja gagal dibaca, tunggu laporan berikutnya.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Tidak ada yang wajib dipraktikkan, dan modul berikutnya tidak bergantung pada bagian ini.

<details>
<summary><b>Mengapa pengurangan <code>unsigned long</code> tetap benar walaupun <code>millis()</code> sudah meluap</b></summary>

Bilangan `unsigned long` di ESP32 punya 32 bit. Semua hitungannya dikerjakan "berputar" pada 4.294.967.296 (2³²), seperti jarum jam yang kembali ke angka 12 setelah melewati angka 11. Bayangkan jam dinding raksasa dengan 4,29 miliar tanda. `waktuTerakhir` adalah posisi jarum saat tugas terakhir dikerjakan, dan `sekarang` adalah posisi jarum saat ini. Selama jarumnya belum berputar satu lingkaran penuh (49,7 hari), jarak **searah jarum jam** dari `waktuTerakhir` ke `sekarang` selalu bisa dihitung dengan benar walaupun jarumnya baru saja melewati puncak jam (tanda 0, tempat angka 12 di jam biasa). Pengurangan `sekarang - waktuTerakhir` menghitung tepat jarak itu.

Akibatnya, `JEDA` boleh sepanjang apa pun asalkan kurang dari 49,7 hari. Sebaliknya, `waktuTerakhir + JEDA` bisa "melewati puncak jam" lebih dulu daripada `millis()` sehingga perbandingan `millis() >= waktuTujuan` menjadi kacau, seperti contoh di Konsep 3.

</details>

<details>
<summary><b><code>waktuTerakhir = sekarang</code> atau <code>waktuTerakhir += JEDA</code>?</b></summary>

Kedua bentuk ini sama-sama sering kamu temui:

- **`waktuTerakhir = sekarang;`** (dipakai di modul ini). Jadwal berikutnya dihitung dari saat tugas **benar-benar** dikerjakan. Kalau `loop()` sedang terlambat 3 ms, jadwal berikutnya ikut mundur 3 ms. Lama-kelamaan jadwalnya sedikit bergeser, tetapi tugasnya tidak pernah dikerjakan dua kali berturut-turut. Cocok untuk LED, laporan, dan pembacaan sensor.
- **`waktuTerakhir += JEDA;`** Jadwalnya tetap di "kisi" aslinya walaupun ada keterlambatan kecil: 1.000, 2.000, 3.000, dan seterusnya. Cocok untuk jam atau pengambilan sampel yang harus tepat iramanya. Kekurangannya, kalau program sempat tertahan lama, misalnya 5 detik, tugas itu dikerjakan lima kali beruntun untuk "mengejar ketinggalan".

</details>

<details>
<summary><b><i>Interrupt</i>: menghitung pulsa tanpa ada yang terlewat</b></summary>

`loop()` yang berputar puluhan ribu kali per detik sudah cukup untuk tombol. Namun, ada sensor yang mengirim **pulsa sangat singkat dan sangat sering**, misalnya sensor aliran air yang berdenyut ratusan kali per detik, atau sensor kecepatan angin. Pulsa sependek itu bisa terlewat saat `loop()` sedang sibuk 30 ms menunggu gema HC-SR04 atau menggambar layar.

***Interrupt*** (interupsi) membuat chip **menghentikan sejenak** apa pun yang sedang dikerjakannya untuk menjalankan satu fungsi kecil tepat saat pinnya berubah, lalu melanjutkan pekerjaan semula:

```cpp
const int PIN_SENSOR_ALIRAN = 18;          // contoh di papan lain; di Node 1, D18 dipakai modul microSD
volatile unsigned long jumlahPulsa = 0;    // volatile: isinya bisa berubah "diam-diam" oleh interrupt

void IRAM_ATTR hitungPulsa() {             // IRAM_ATTR: disimpan di RAM supaya bisa dijalankan secepatnya
  jumlahPulsa++;                           // sesingkat mungkin: jangan Serial.print(), jangan delay()
}

void setup() {
  pinMode(PIN_SENSOR_ALIRAN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_SENSOR_ALIRAN), hitungPulsa, FALLING);  // FALLING = saat HIGH berubah menjadi LOW
}
```

Aturan emasnya: fungsi *interrupt* harus **sesingkat mungkin** (cukup menghitung atau menyalakan "bendera"), dan pekerjaan beratnya dikerjakan di `loop()`. Variabel yang dipakai bersama `loop()` diberi **`volatile`** supaya kompiler selalu membacanya ulang dari memori. Untuk tombol, *interrupt* justru merepotkan: setiap pantulan memicu satu *interrupt*, jadi pola `millis()` di Praktik 2 tetap pilihan terbaik. Ingat juga catatan di `PETA-PIN.md`: GPIO 36 dan 39 tidak cocok untuk masukan ber-*interrupt*.

</details>

<details>
<summary><b>FreeRTOS: <code>loop()</code> hanyalah satu "tugas" di salah satu dari dua inti</b></summary>

Di Modul 1, kita menyebut ESP32 punya "sistem operasi mini". Namanya **FreeRTOS**. Di dalamnya, program dibagi menjadi beberapa **tugas** (*task*) yang dijadwalkan bergantian, dan ESP32 punya **dua inti** untuk menjalankannya.

Kamu sudah melihat buktinya di laporan *watchdog* Praktik 6: `loopTask (CPU 1)`. `setup()` dan `loop()` milikmu berjalan di dalam satu tugas bernama `loopTask`, di **inti 1**, dengan memori tumpukan (*stack*) 8 KB. Inti 0 dipakai tugas-tugas sistem, dan mulai Modul 10 juga tugas WiFi. `delay()` di paket esp32 sebenarnya memanggil `vTaskDelay()`: tugasmu "tidur", lalu inti itu bebas mengerjakan tugas lain atau beristirahat (tugas `IDLE1`, yang juga muncul di laporan *watchdog* saat `tidur 7`).

Kalau kamu menemukan fungsi `enableLoopWDT()` di internet, itu jalan pintas dari paket esp32: ia mendaftarkan `loopTask` ke penjaga, lalu memberinya makan otomatis sebelum setiap putaran `loop()`, dengan setelan bawaan penjaga. Hasilnya mirip tiga baris kita di Konsep 8. Kita memakai cara manual karena batas waktunya bisa kita atur sendiri dan setiap langkahnya terlihat jelas.

Kamu bisa membuat tugas sendiri:

```cpp
void tugasKedip(void* bahan) {          // sebuah tugas: perulangan yang tidak pernah selesai
  pinMode(4, OUTPUT);
  bool nyala = false;
  while (true) {
    nyala = !nyala;
    digitalWrite(4, nyala);
    vTaskDelay(pdMS_TO_TICKS(500));      // hanya tugas ini yang tidur; tugas lain tetap berjalan
  }
}

void setup() {
  // fungsinya, nama, ukuran tumpukan (byte), bahan, prioritas, pegangan, inti
  xTaskCreatePinnedToCore(tugasKedip, "kedip", 2048, NULL, 1, NULL, 0);
}

void loop() {
  // loop() tetap berjalan di inti 1
}
```

Mengapa Node 1 belum memakainya? Ada tiga alasan: beberapa tugas yang memakai variabel yang sama harus saling menjaga, misalnya dengan *mutex* (kunci yang dipegang bergiliran) atau *queue* (antrean pesan), setiap tugas penting harus diawasi *watchdog*-nya sendiri, dan *bug*-nya sering hanya muncul pada urutan waktu tertentu. *Bug* seperti itu paling sulit diulang, padahal Konsep 10 dimulai dengan "ulangi". Pola `millis()` dan *state machine* dalam satu tugas sudah cukup untuk Node 1, dan jauh lebih mudah diperiksa.

</details>

<details>
<summary><b><code>switch</code>: cara lain menulis <i>state machine</i></b></summary>

Di kode orang lain, *state machine* lebih sering ditulis dengan `switch` daripada `if`/`else if`:

```cpp
switch (keadaan) {
  case SIAGA:
    // ...
    break;   // wajib: tanpa break, program "terjun" ke case berikutnya
  case MENYIRAM:
    // ...
    break;
  case JEDA:
    // ...
    break;
}
```

Keduanya sama benarnya. `switch` punya satu keunggulan: kalau suatu hari kamu menambah keadaan baru di `enum`, tetapi lupa menulis `case`-nya, kompiler (dengan **Compiler warnings: More**) memperingatkan `enumeration value '…' not handled in switch`. Kekurangannya, lupa menulis `break` adalah *bug* klasik. Modul ini memakai `if`/`else if` karena kamu sudah mengenalnya sejak Modul 3.

</details>

<details>
<summary><b><i>Pointer</i> dan <i>reference</i>: bekal membaca kode orang lain</b></summary>

Kamu tidak perlu menulisnya sekarang, tetapi tanda `*` dan `&` sering muncul di kode library dan contoh di internet:

- **`const char* nama`** adalah ***pointer*** (penunjuk): bukan teksnya sendiri, melainkan **alamat** huruf pertamanya di memori, seperti alamat rumah yang ditulis di secarik kertas. Semua teks di antara petik ganda bisa disimpan dengan cara ini, termasuk jawaban `alasanReset()` Node 1 v1.0.
- **`&konfigurasiWatchdog`** artinya "alamat formulir `konfigurasiWatchdog`". `esp_task_wdt_reconfigure()` meminta alamatnya supaya bisa membaca formulir itu langsung, tanpa menyalinnya.
- **`NULL`** adalah "alamat kosong". Di `esp_task_wdt_add(NULL)`, artinya "bukan tugas lain, melainkan tugas yang sedang berjalan ini".
- **`int laci[]`** di bahan fungsi (misalnya `rataRataLaci()` di `sensor.cpp`) sebenarnya juga *pointer* ke laci pertama. Itulah sebabnya fungsi itu bisa menerima deret laci mana pun.
- **`BacaanSensor& b`** adalah ***reference***: "nama lain" untuk formulir yang sama, tanpa membuat salinan. `const BacaanSensor& b` berarti "boleh dibaca, tidak boleh diubah". Node 1 mengirim `BacaanSensor` sebagai salinan biasa karena formulirnya kecil (24 byte); untuk formulir besar, *reference* lebih hemat.

</details>

<details>
<summary><b>PlatformIO: kelanjutan alami dari kode modular</b></summary>

**PlatformIO** adalah alat pembuat firmware yang dipasang sebagai ekstensi VS Code. Banyak tim profesional memakainya karena tiga hal: semua versi library dan paket papan dicatat dalam satu file `platformio.ini` (mirip `libraries.txt` di Wokwi) sehingga hasilnya bisa diulang di laptop mana pun; bisa membuat banyak varian program dari satu kode; dan terhubung dengan pengujian otomatis.

Susunan foldernya mirip Node 1 v1.0: file `.cpp` di folder `src/`, file `.h` di folder `include/`, dan `platformio.ini` di akarnya. Bedanya, PlatformIO menyarankan agar file `.ino` diubah menjadi `.cpp` supaya pelengkapan kode dan pemeriksaan kodenya bekerja penuh. Jadi, `node-1-rumah.ino` sebaiknya menjadi `src/main.cpp` dengan `#include <Arduino.h>` di baris pertama, dan setiap fungsi dikenalkan sebelum dipakai karena "daftar isi otomatis" ala Arduino IDE tidak ada di file `.cpp`.

Kurikulum ini tetap memakai Arduino IDE supaya alatnya sama untuk semua pembaca. Kalau ingin mencoba PlatformIO, periksa dulu apakah platform ESP32 yang kamu pasang sudah memakai paket esp32 versi 3 karena kode kurikulum ini memakai cara penulisan versi 3.

</details>

<details>
<summary><b>Core Debug Level: log bawaan paket esp32</b></summary>

Paket esp32 punya sistem log sendiri, mirip modul pencatat kita. Pilih tingkatnya di **Tools → Core Debug Level**: **None**, **Error**, **Warn**, **Info**, **Debug**, atau **Verbose**, lalu unggah ulang. Mulai tingkat **Info**, paket esp32 menceritakan isi dapurnya sendiri di Serial Monitor, misalnya saat menyiapkan pin atau WiFi. Kodemu juga bisa memakainya:

```cpp
log_e("Sensor gagal: %d", kode);   // Error
log_i("Pompa menyala");            // Info
log_d("Siklus ke-%lu", nomor);     // Debug
```

Hasilnya berbentuk `[  1234][E][namafile.cpp:12] namaFungsi(): pesan`. Bedanya dengan modul pencatat: tingkat **Core Debug Level** ditentukan **saat program disusun**. Pesan di bawah tingkat yang dipilih dibuang dari program sehingga tidak bisa dinyalakan lagi lewat Serial tanpa mengunggah ulang. Modul pencatat memilih tingkatnya **saat program berjalan** (`log debug`), dan itu lebih praktis untuk berburu *bug* di Node 1 yang sudah terpasang.

Pesan *watchdog* `E (22499) task_wdt: …` berasal dari lapisan yang lebih dalam lagi, yaitu **ESP-IDF**, kerangka dasar buatan Espressif yang menjadi fondasi paket esp32. Pesan ERROR dari ESP-IDF tetap dicetak walaupun **Core Debug Level** bernilai **None**.

</details>

<details>
<summary><b>Menerjemahkan <code>Backtrace</code> menjadi nama fungsi dan nomor baris</b></summary>

Deretan `Backtrace: 0x400d1876:0x3ffb2220 …` adalah alamat-alamat di dalam program, dari tempat program berhenti, lalu mundur ke fungsi-fungsi yang memanggilnya. Alamat itu bisa diterjemahkan menjadi nama fungsi dan nomor baris dengan alat yang disebut *exception decoder*. Arduino IDE 2.3 belum punya alat ini secara bawaan, dan *plugin* (pengaya) komunitas [ESP Exception Decoder](https://github.com/dankeboy36/esp-exception-decoder) kini ditujukan untuk VS Code. Prinsip kerjanya sederhana: setiap alamat dicocokkan dengan peta program (file `.elf`) hasil penyusunan, memakai perintah `addr2line` dari kumpulan alat penyusun ESP32.

Untuk Praktik 6, kita tidak memerlukannya karena kita tahu persis di mana program macet. Namun, untuk *restart* misterius pukul tiga pagi, `Backtrace` adalah petunjuk terbaik.

</details>

<details>
<summary><b>Cara Arduino IDE menyusun sketsa yang terdiri atas banyak file</b></summary>

1. **Semua tab `.ino` digabung menjadi satu file.** Tab utama (yang namanya sama dengan folder sketsa) ditaruh pertama, lalu tab `.ino` lainnya menurut urutan abjad. Setelah itu, Arduino IDE menambahkan `#include <Arduino.h>` dan "daftar isi" fungsi (Konsep 4).
2. **Setiap file `.cpp` disusun sendiri-sendiri.** File `.cpp` tidak ikut digabung, jadi ia hanya mengenal apa yang di-`#include`-nya. Itulah gunanya file `.h`.
3. **Semua hasilnya disambung** oleh penyambung (`ld`), bersama library dan paket esp32, menjadi satu program.

Mengapa Node 1 memakai pasangan `.h`/`.cpp`, bukan tab `.ino` tambahan saja? Tab `.ino` tambahan memang lebih praktis karena semuanya otomatis saling mengenal. Namun, justru di situ kelemahannya: tidak terlihat bagian mana bergantung pada bagian mana, nama yang bertabrakan baru ketahuan belakangan, dan kodenya tidak bisa dipindah ke PlatformIO atau ESP-IDF tanpa dirombak. Pasangan `.h`/`.cpp` memaksa setiap modul menyebut kebutuhannya sendiri lewat `#include`.

</details>

<details>
<summary><b>Memantau kesehatan memori: <code>getFreeHeap()</code> dan kawan-kawan</b></summary>

Paket esp32 menyediakan tiga angka untuk memantau *heap* (Konsep 6):

- **`ESP.getFreeHeap()`** — total *heap* yang masih bebas saat ini. Node 1 v1.0 menampilkannya di halaman status (`bebas … KB`) dan di perintah `info`.
- **`ESP.getMinFreeHeap()`** — *heap* bebas paling sedikit sejak papan menyala, yaitu "titik terendah" yang pernah tercapai.
- **`ESP.getMaxAllocHeap()`** — potongan *heap* terbesar yang masih bisa dipinjam dalam satu kali minta. Kalau `getFreeHeap()` tetap besar, tetapi angka ini terus mengecil, itulah tanda fragmentasi.

Saat uji 24 jam, bandingkan angka memori bebas di awal dan di akhir. Angka yang naik-turun sedikit itu wajar. Angka yang **terus turun** jam demi jam adalah tanda kebocoran memori: ada yang terus meminjam tanpa pernah mengembalikan.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari yang paling ringan. Kerjakan minimal Tingkat 1. Semuanya bisa dicoba di Wokwi tanpa menyentuh meja kerja.

> 🖥️ **Alat:** **Arduino IDE** atau Wokwi, dengan sketsa praktik yang disebut di setiap tingkat. Sebelum mengubah apa pun, buka sketsa itu, lalu **segera** pilih **File → Save As…** dan simpan di folder `modul-08` dengan nama baru, misalnya `modul08_tantangan1`. Sketsa praktikmu tetap utuh.

**Tingkat 1 — Ubah sedikit: setelan kedua di NVS.** Pakai sketsa `modul08_ambang_nvs` (Praktik 5). Tambahkan setelan kedua, `jeda_siram`, yaitu lama istirahat sesudah menyiram (dalam detik). Petunjuk:

- Angka bawaannya 30 detik, dan angka yang boleh disimpan 10–600 detik.
- Tambahkan dua perintah: `jeda` (menampilkan) dan `jeda 60` (menyimpan). Tirulah pola perintah `ambang` dan `ambang 35`, termasuk pemeriksaan "angkanya sama, tidak perlu ditulis ulang".
- Label `"jeda_siram"` panjangnya 10 huruf, jadi aman (paling panjang 15).
- Berhasil kalau, setelah `jeda 60` lalu `restart`, perintah `jeda` menampilkan `60` beserta keterangan bahwa angka itu berasal dari NVS.

**Tingkat 2 — Gabungkan.** Pilih salah satu.

- **2A. Bip-bip-bip tanpa `delay()`.** Pakai sketsa `modul08_tiga_tugas` (Praktik 2). Ubah tekan lama supaya buzzer (D27) berbunyi **tiga kali** (100 ms bunyi, 100 ms diam), selain menyalakan atau memadamkan kipas. Selama berbunyi, LED status harus tetap berdetak dan laporan tetap muncul tepat setiap 2 detik. Petunjuk: buat *state machine* kecil dengan dua keadaan, `DIAM` dan `BERBUNYI`, ditambah penghitung `sisaBip`. Tambahkan `const int PIN_BUZZER = 27;` di bagian atas, siapkan buzzer di `setup()` dengan `ledcAttach(PIN_BUZZER, 2000, 10);`, lalu bunyikan dengan `ledcWriteTone(PIN_BUZZER, 2000);` dan diamkan dengan `ledcWriteTone(PIN_BUZZER, 0);`, seperti Modul 5. Berhasil kalau tiga bip terdengar dan angka `terlama` di laporan tetap kecil.
- **2B. Layar tanpa `String`.** Pakai sketsa `modul07_layar_node1` dari Praktik 6 Modul 7 (atau rancanganmu sendiri). Ubah `tampilkanDiLayar()` dan fungsi bantunya supaya tidak memakai `String` sama sekali: susun setiap teks dengan `char[]` dan `snprintf()` (Konsep 6), lalu ubah bahan `tulisRataKanan()` dan `barisBatang()` menjadi `const char*`. Panjang teks diperoleh dengan `strlen(teks)`. Berhasil kalau keempat contoh di Praktik 6 Modul 7 tampil persis seperti sebelumnya. Kalau berhasil, kamu boleh memindahkan hasilnya ke `layar.cpp` Node 1 v1.0. Ingat aturan file `.cpp`: fungsi bantu harus ditulis di atas fungsi yang memakainya (Konsep 5).

**Tingkat 3 — Rancang sendiri: keadaan `TANDON_KOSONG`.** Pakai sketsa `modul08_siram_state_machine` (Praktik 3). Saat ini, kalau tandon kosong, Node 1 mencoba menyiram setiap 30 detik, gagal, lalu mencoba lagi, terus begitu. Rancang keadaan keempat, `TANDON_KOSONG`. Petunjuk awal:

- Kalau pompa ditolak **tiga kali berturut-turut**, pindah ke `TANDON_KOSONG`, cetak `Tandon kosong: penyiraman dihentikan sampai tandon terisi.` **sekali saja**, dan biarkan LED status berkedip cepat.
- Selama `TANDON_KOSONG`, periksa tandon setiap 5 detik. Kembali ke SIAGA hanya kalau isinya sudah **30 %** atau lebih. Mengapa 30 %, bukan 20 %? Tanpa jarak antara batas "kosong" dan batas "cukup" (disebut histeresis), air yang bergoyang di sekitar 20 % membuat Node 1 berpindah keadaan bolak-balik.
- **Gambar dulu *state machine*-nya di kertas**: empat lingkaran dan semua panahnya, lengkap dengan pemicunya. Baru setelah itu, tulis kodenya.
- Di Wokwi, ubah jarak HC-SR04 untuk meniru tandon yang kosong (`19` cm) dan yang terisi kembali (`10` cm).

Tidak ada kunci jawaban untuk Tingkat 3. Kalau Node 1-mu berhenti mencoba saat tandon kosong, memberi tanda yang jelas, dan melanjutkan sendiri setelah tandon terisi, rancanganmu sudah benar.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Sumbangan Modul 8 ke proyek benang merah: **Node 1 v1.0**. Ini perubahan terbesar sejak Modul 3. Hampir setiap bagian ditulis ulang supaya tidak pernah menunggu, lalu programnya dipecah menjadi **satu file utama, satu file konfigurasi, dan sebelas modul** (masing-masing sepasang `.h` dan `.cpp`), jadi 24 file seluruhnya. Kedengarannya banyak, tetapi tenang: kamu sudah mengenal setiap bagiannya dari Praktik 1–7. Di sini kita merakitnya.

> 🖥️ **Alat yang dipakai:** **Arduino IDE** (dengan library dari Modul 5–7), **VS Code**, **GitHub Desktop**, dan meja kerja lengkap dengan MB102 menyala. Tanpa papan? Semua langkah bisa diuji di Wokwi dengan [`diagram.json`](kode/node-1-rumah/diagram.json) dan [`libraries.txt`](kode/node-1-rumah/libraries.txt) Node 1 dari Modul 7. Buat 23 file tambahannya lewat **▾ → New file...** seperti Praktik 4, lalu klik area kosong di panel simulasi dan tekan **F** untuk melihat seluruh rangkaian. Punya akun Wokwi? Klik **SAVE** setelah file pertama dibuat, lalu sesekali lagi: proyek yang belum disimpan hilang kalau tab browsernya tertutup (Modul 1).
>
> ⭐ **Wajib** — bagian dari syarat lulus: Node 1 v1.0 tanpa `delay()` di `loop()`, ambangnya tetap tersimpan setelah listrik padam, dan lulus uji 24 jam (30 menit di Wokwi).

![Peta file Node 1 versi 1.0: satu file utama, sebelas modul. Atas, konfigurasi.h berisi pin, kalibrasi, aturan, dan jadwal, tersambung garis putus-putus ke file utama node-1-rumah.ino di tengah yang berisi setup(), loop(), dan siklus utama MENUNGGU, MEMBACA, MENAMPILKAN, BERTINDAK. Di sekelilingnya empat kelompok modul, masing-masing sepasang file .h dan .cpp dengan label asalnya: Indra dan tangan, yaitu sensor (lima sensor tanpa delay(), M6) dan aktuator (relay, pompa, servo, buzzer, M5); Antarmuka, yaitu tombol (tekan pendek dan lama, P4), detak (LED status, P4), layar (halaman bacaan dan status, M7), dan perintah (perintah Serial, M5); Otak dan catatan, yaitu aturan (siram dengan state machine dan lampu, P3) dan kartu (CSV microSD opsional, M7); serta Daya tahan, yaitu pengaturan (NVS: ambang dan jumlah nyala, P5), sistem (uptime dan alasan restart, M5), dan pencatat (log DEBUG, INFO, ERROR, P7). Keterangan: garis putus-putus berarti #include, dan konfigurasi.h juga di-#include oleh tujuh modul; P berarti dibuat di praktik minggu ini, M berarti berasal dari modul sebelumnya dan kini ditulis ulang tanpa menunggu; semua modul ada di satu folder sketsa firmware/node-1-rumah](aset/peta-file-node1-v1.png)

| File | Isinya | Asalnya |
| :--- | :--- | :--- |
| `node-1-rumah.ino` | `setup()`, `loop()`, dan siklus utama MENUNGGU → MEMBACA → MENAMPILKAN → BERTINDAK | ditulis ulang (bagian D) |
| `konfigurasi.h` | semua nomor pin, angka kalibrasimu, aturan otomatis, dan jadwal utama | konstanta v0.4.0 |
| `pencatat.h` / `.cpp` | log DEBUG, INFO, dan ERROR | sama persis dengan Praktik 7 |
| `sistem.h` / `.cpp` | *uptime*, alasan *restart*, lama putaran `loop()` | `alasanReset()` v0.4.0 + Konsep 3 |
| `pengaturan.h` / `.cpp` | NVS: ambang `tanah_siram` dan penghitung nyala | Praktik 5 |
| `sensor.h` / `.cpp` | kelima sensor dan formulir `BacaanSensor` | v0.4.0, kini tanpa `delay()` |
| `aktuator.h` / `.cpp` | relay lampu dan kipas, pompa, servo tirai, buzzer | v0.4.0, pompa dan buzzer kini tanpa `delay()` |
| `detak.h` / `.cpp` | LED status sebagai detak jantung | sama persis dengan Praktik 4 |
| `tombol.h` / `.cpp` | tombol: tekan pendek dan tekan lama | sama persis dengan Praktik 4 |
| `layar.h` / `.cpp` | layar OLED: halaman bacaan dan halaman status yang baru | Modul 7 + halaman status |
| `kartu.h` / `.cpp` | (opsional) catatan CSV di kartu microSD | Modul 7, kini dengan `snprintf()` |
| `perintah.h` / `.cpp` | perintah lewat Serial Monitor | v0.4.0 + pembaca baris Praktik 5 + perintah baru |
| `aturan.h` / `.cpp` | siram otomatis (*state machine*) dan lampu otomatis | Praktik 3 + v0.4.0 |

`konfigurasi.h` tidak punya pasangan `.cpp` karena isinya hanya konstanta. Konstanta boleh ditulis di file `.h` yang di-`#include` banyak file; variabel biasa tidak boleh (lihat `multiple definition` di 🚨). `PETA-PIN.md` tidak berubah minggu ini karena tidak ada pin baru.

### A. Catat dulu angka-angkamu

1. Di Arduino IDE, buka Node 1-mu: **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah** → `node-1-rumah.ino`.
2. Salin ke kertas keempat angka di bagian `// ---------- Modul 6: hasil kalibrasimu`: `TANAH_KERING`, `TANAH_BASAH`, `JARAK_KOSONG`, dan `JARAK_PENUH`. Catat juga `AMBANG_GELAP` di bagian `// ---------- Modul 6: aturan otomatis versi lokal` kalau dulu kamu mengubahnya (Modul 6, Praktik 1.4). Pernah mengubah `AMBANG_TANAH_SIRAM` juga? Catat angkanya; nanti kamu menyimpannya ke NVS dengan perintah `ambang` (langkah E).
3. **Salin tata letak layarmu.** Hampir pasti kamu memakainya karena Modul 7 (Praktik 6.3) memintamu mengubah paling sedikit dua hal di rancangan rujukan. Di tab `node-1-rumah.ino`, tekan **Ctrl + F**, cari `// Ikon 8 x 8 titik`, lalu salin ke Notepad atau VS Code:
   - ikon dan fungsi bantu **buatanmu sendiri** saja, misalnya `IKON_TETES`, yaitu yang namanya **tidak** ada di daftar ini: `IKON_MATAHARI`, `IKON_TANAMAN`, `IKON_TANDON`, `IKON_ORANG`, `siapkanLayar()`, `tulisRataKanan()`, `gambarBatang()`, dan `barisBatang()` (semuanya sudah ada di `layar.cpp`);
   - isi fungsi `tampilkanDiLayar()`, dari baris pertama sesudah pemeriksaan `if (!layarAda)` sampai `layar.display();`. Biasanya baris pertama itu `layar.clearDisplay();`, tetapi baris tambahanmu di atasnya, misalnya `layar.dim(…)` dari 🧩 Modul 7, ikut disalin;
   - versimu dari ikon atau fungsi bantu di daftar tadi, **kalau isinya pernah kamu ubah** (misalnya `IKON_ORANG` yang kamu gambar ulang di Modul 7). Di langkah C, timpa versi yang sama di `layar.cpp` dengan versimu; jangan ditempel sebagai salinan kedua.

Node 1 v0.4.0 tidak hilang: setelah langkah G, versi itu tetap tersimpan di tab **History** GitHub Desktop.

### B. Buat 23 file baru

Dengan `node-1-rumah.ino` terbuka di Arduino IDE, buat tab baru untuk setiap file di daftar di bawah, persis seperti Praktik 4: **⋯ → New Tab** (atau **Ctrl + Shift + N**), ketik namanya **lengkap dengan akhirannya**, lalu klik **OK**. Isi setiap tab dengan cara ini: klik kanan nama filenya di daftar → **Buka di tab baru**, klik **Copy raw file** di halaman yang terbuka, kembali ke Arduino IDE, lalu tempel (**Ctrl + V**) ke tab yang baru dibuat.

1. [`konfigurasi.h`](kode/node-1-rumah/konfigurasi.h)
2. [`pencatat.h`](kode/node-1-rumah/pencatat.h) dan [`pencatat.cpp`](kode/node-1-rumah/pencatat.cpp) — sama persis dengan Praktik 7; boleh disalin dari tab sketsa `modul08_berburu_bug`.
3. [`sistem.h`](kode/node-1-rumah/sistem.h) dan [`sistem.cpp`](kode/node-1-rumah/sistem.cpp)
4. [`pengaturan.h`](kode/node-1-rumah/pengaturan.h) dan [`pengaturan.cpp`](kode/node-1-rumah/pengaturan.cpp)
5. [`sensor.h`](kode/node-1-rumah/sensor.h) dan [`sensor.cpp`](kode/node-1-rumah/sensor.cpp)
6. [`aktuator.h`](kode/node-1-rumah/aktuator.h) dan [`aktuator.cpp`](kode/node-1-rumah/aktuator.cpp)
7. [`detak.h`](kode/node-1-rumah/detak.h) dan [`detak.cpp`](kode/node-1-rumah/detak.cpp) — sama persis dengan Praktik 4.
8. [`tombol.h`](kode/node-1-rumah/tombol.h) dan [`tombol.cpp`](kode/node-1-rumah/tombol.cpp) — sama persis dengan Praktik 4.
9. [`layar.h`](kode/node-1-rumah/layar.h) dan [`layar.cpp`](kode/node-1-rumah/layar.cpp)
10. [`kartu.h`](kode/node-1-rumah/kartu.h) dan [`kartu.cpp`](kode/node-1-rumah/kartu.cpp)
11. [`perintah.h`](kode/node-1-rumah/perintah.h) dan [`perintah.cpp`](kode/node-1-rumah/perintah.cpp)
12. [`aturan.h`](kode/node-1-rumah/aturan.h) dan [`aturan.cpp`](kode/node-1-rumah/aturan.cpp)

**Jangan klik Verify dulu** sampai langkah D selesai: tab utama masih berisi kode v0.4.0 yang bertabrakan dengan modul-modul baru. Garis merah bergelombang yang muncul di editor selama langkah B–C boleh diabaikan. Kalau tabnya sudah terlalu banyak untuk satu baris, Arduino IDE menampilkannya dalam deretan yang bisa digulir; tab yang tidak terlihat juga bisa dipilih lewat **⋯ → Next Tab**.

**Periksa dulu semua 24 tab sebelum lanjut** (dua menit, tetapi menghemat banyak waktu):

1. Hitung tabnya: harus **24**, yaitu `node-1-rumah.ino` ditambah 23 file di daftar. Di Wokwi, tab `diagram.json` dan tab library tidak ikut dihitung.
2. Klik setiap tab dan lihat **baris pertamanya**. Setiap file rujukan diawali komentar yang menyebut namanya sendiri, misalnya `// sensor.cpp - isi modul sensor…`. Kalau tab `sensor.cpp` diawali `// sensor.h - …`, isinya tertukar: kosongkan tab itu (**Ctrl + A**, lalu **Delete**), lalu tempel ulang dari tautan yang benar.
3. Gulir ke paling bawah setiap tab `.cpp`: baris terakhir yang berisi tulisan selalu `}` (baris kosong sesudahnya tidak apa-apa). Kalau baris pertama file itu muncul lagi di tengah, isinya tertempel dua kali.

**Ingin mengulang dari awal?** Versi v0.4.0 masih aman di GitHub. Tutup Arduino IDE dulu, buka GitHub Desktop, pilih **`rumah-pintar-mini`** di kotak **Current repository**, lalu pilih menu **Branch → Discard all changes…** (macOS: **Discard All Changes…**) dan klik **Discard all changes** di jendela `Confirm discard all changes`. Semua perubahan dan file baru dipindahkan ke **Recycle Bin** (macOS: **Trash**), dan folder sketsamu kembali ke v0.4.0.

### C. Masukkan angka kalibrasi dan tata letak layarmu

1. Di tab **`konfigurasi.h`**, ganti keempat angka di bagian `// ---------- Modul 6: hasil kalibrasimu` dan, kalau perlu, `AMBANG_GELAP` dengan catatanmu dari langkah A. Di Wokwi, biarkan angka bawaannya.
2. **Tata letak layarmu.** Di tab **`layar.cpp`**, cari `gambarHalamanBacaan()` (**Ctrl + F**). Tempel ikon dan fungsi bantu buatanmu tepat **di atas** baris `// Rancangan rujukan Modul 7. …` karena di file `.cpp` fungsi harus sudah ditulis sebelum dipakai (Konsep 5). Lalu, di dalam `gambarHalamanBacaan()`, ganti semua baris dari `layar.clearDisplay();` sampai `layar.display();` dengan isi `tampilkanDiLayar()` milikmu. Halaman bacaanmu boleh tetap memakai `String` (Konsep 6). Kalau tata letakmu ikut menampilkan keadaan lampu atau kipas, tambahkan `#include "aktuator.h"` di bagian atas `layar.cpp`, lalu ubah `lampuMenyala` menjadi `lampuMenyala()` dan `kipasMenyala` menjadi `kipasMenyala()`. Kalau kamu memakai rancangan rujukan apa adanya, lewati langkah ini.

Ambang siramnya tidak perlu diatur di sini. Angka di `konfigurasi.h` (`AMBANG_TANAH_SIRAM_BAWAAN = 30`) hanya dipakai selama NVS belum berisi ambang. Karena Node 1 v1.0 memakai map NVS yang sama dengan Praktik 5 (`node1`), ambang yang kamu simpan di Praktik 5 langsung terbaca.

### D. Ganti isi tab utama

Klik tab **`node-1-rumah.ino`** (paling kiri; di Wokwi: **`sketch.ino`**), lalu ganti **seluruh** isinya dengan ini:

```cpp
// Node 1 "Rumah" - firmware v1.0.0 (Modul 8)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v1.0.0: tidak ada delay() di loop() (pola millis() dan state machine), kode dipecah
// menjadi beberapa file, watchdog me-restart program yang macet, ambang "tanah_siram" tersimpan
// di NVS, log bertingkat (DEBUG/INFO/ERROR), dan halaman status di layar OLED (tekan lama tombol).
// Perintah lewat Serial Monitor: lampu on, kipas off, pompa 3, tirai 90, bunyi, status, info,
// ambang, ambang 35, ambang bawaan, log debug, log info, log error, restart.
//
// Library: ESP32Servo versi 3.2.1, DHT sensor library versi 1.4.7
// (ikut terpasang: Adafruit Unified Sensor versi 1.1.15), Adafruit SSD1306 versi 2.5.17
// (ikut terpasang: Adafruit GFX Library versi 1.12.6 dan Adafruit BusIO versi 1.17.4).
// Wire, SPI, SD, dan Preferences sudah ikut paket esp32.

#include <esp_task_wdt.h>  // watchdog
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "sensor.h"
#include "aktuator.h"
#include "detak.h"
#include "tombol.h"
#include "layar.h"
#include "kartu.h"
#include "perintah.h"
#include "aturan.h"

// ---------- Siklus utama: MENUNGGU -> MEMBACA -> MENAMPILKAN -> BERTINDAK -> MENUNGGU ... ----------
enum LangkahSiklus { MENUNGGU, MEMBACA, MENAMPILKAN, BERTINDAK };
LangkahSiklus langkah = MENUNGGU;
unsigned long waktuBacaTerakhir = 0;
unsigned long waktuCatatTerakhir = 0;
BacaanSensor bacaan;
bool dhtGagalTadi = false;    // DHT22 gagal pada bacaan sebelumnya?
bool sonarGagalTadi = false;  // HC-SR04 gagal pada bacaan sebelumnya?

const char* namaLangkah(LangkahSiklus l) {
  if (l == MENUNGGU) {
    return "MENUNGGU";
  }
  if (l == MEMBACA) {
    return "MEMBACA";
  }
  if (l == MENAMPILKAN) {
    return "MENAMPILKAN";
  }
  return "BERTINDAK";
}

void pindahLangkah(LangkahSiklus langkahBaru) {
  logDebug("Siklus: %s -> %s", namaLangkah(langkah), namaLangkah(langkahBaru));
  langkah = langkahBaru;
}

// Satu baris laporan bacaan: angka yang gagal ditulis "--".
void laporkanBacaan(BacaanSensor b) {
  char suhu[8] = "--";
  if (!isnan(b.suhu)) {
    snprintf(suhu, sizeof(suhu), "%.1f", b.suhu);
  }
  char kelembapan[12] = "--";  // 12 laci: muat angka int terpanjang (11 huruf) + tanda akhir
  if (b.kelembapan >= 0) {
    snprintf(kelembapan, sizeof(kelembapan), "%d", b.kelembapan);
  }
  char levelAir[12] = "--";
  if (b.level_air >= 0) {
    snprintf(levelAir, sizeof(levelAir), "%d", b.level_air);
  }
  const char* gerak = "tidak";
  if (b.gerak) {
    gerak = "ya";
  }
  logInfo("suhu=%s C  kelembapan=%s %%  cahaya=%d  tanah=%d %%  gerak=%s  level_air=%s %%",
          suhu, kelembapan, b.cahaya, b.tanah, gerak, levelAir);
}

// Sensor gagal? LED status berkedip cepat. Pesannya dicetak sekali saat keadaan sensornya berubah, bukan setiap 2 detik.
void periksaMasalah(BacaanSensor b) {
  aturIramaDetak(sensorBermasalah(b));
  bool dhtGagal = isnan(b.suhu) || b.kelembapan < 0;
  bool sonarGagal = b.level_air < 0;
  if (dhtGagal && !dhtGagalTadi) {
    logError("DHT22 tidak terbaca. LED status berkedip cepat.");
  }
  if (!dhtGagal && dhtGagalTadi) {
    logInfo("DHT22 kembali terbaca.");
  }
  if (sonarGagal && !sonarGagalTadi) {
    logError("HC-SR04: gema tidak kembali, level air tidak diketahui. LED status berkedip cepat.");
  }
  if (!sonarGagal && sonarGagalTadi) {
    logInfo("HC-SR04 kembali terbaca.");
  }
  dhtGagalTadi = dhtGagal;
  sonarGagalTadi = sonarGagal;
}

// ---------- Modul 10-11: mengirim bacaan ke server ----------
void kirimData(BacaanSensor b) {
  // belum diisi
}

// Satu langkah siklus per putaran loop(): tidak ada langkah yang menunggu lama.
void jalankanSiklus() {
  if (langkah == MENUNGGU) {
    if (millis() - waktuBacaTerakhir >= JEDA_BACA) {
      waktuBacaTerakhir = millis();
      pindahLangkah(MEMBACA);
    }
  } else if (langkah == MEMBACA) {
    bacaan = bacaSensor();
    periksaMasalah(bacaan);
    pindahLangkah(MENAMPILKAN);
  } else if (langkah == MENAMPILKAN) {
    laporkanBacaan(bacaan);
    tampilkanBacaan(bacaan);
    if (millis() - waktuCatatTerakhir >= JEDA_CATAT_KARTU) {
      waktuCatatTerakhir = millis();
      catatKeKartu(bacaan);
    }
    pindahLangkah(BERTINDAK);
  } else if (langkah == BERTINDAK) {
    jalankanAturan(bacaan);
    kirimData(bacaan);
    pindahLangkah(MENUNGGU);
  }
}

void tanganiTombol() {
  PeristiwaTombol peristiwa = periksaTombol();
  if (peristiwa == TEKAN_PENDEK) {
    aturLampu(!lampuMenyala());
    logInfo("Tombol: lampu %s", teksOnOff(lampuMenyala()));
  } else if (peristiwa == TEKAN_LAMA) {
    bukaHalamanStatus();  // halaman status 10 detik (layar.cpp); pesannya juga dicetak di sana
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);  // boleh: setup() hanya berjalan sekali, dan watchdog belum mengawasi
  Serial.println();
  logInfo("Node 1 Rumah - firmware %s", VERSI_FIRMWARE);
  logInfo("Alasan restart terakhir: %s", alasanReset());

  siapkanAktuator();  // pertama: relay segera dimatikan
  muatPengaturan();
  siapkanSensor();
  mulaiDetak(PIN_LED_STATUS);
  mulaiTombol(PIN_TOMBOL);
  siapkanLayar();  // Modul 7
  siapkanKartu();  // Modul 7 (opsional)

  // Watchdog dengan cara penulisan paket esp32 versi 3 (Konsep 8)
  esp_task_wdt_config_t konfigurasiWatchdog = {
    .timeout_ms = BATAS_WATCHDOG,  // batas waktu: 5000 ms
    .idle_core_mask = 0b01,        // tetap awasi "tugas menganggur" inti 0 (bawaan paket esp32)
    .trigger_panic = true,         // terlambat diberi makan = panik, lalu restart
  };
  esp_task_wdt_reconfigure(&konfigurasiWatchdog);  // watchdog sudah dinyalakan paket esp32: cukup diatur ulang
  esp_task_wdt_add(NULL);                          // NULL = awasi tugas yang sedang berjalan, yaitu loop()
  logInfo("Watchdog aktif: restart otomatis kalau loop() macet lebih dari %lu detik.", BATAS_WATCHDOG / 1000);
}

void loop() {
  unsigned long mulaiPutaran = micros();
  esp_task_wdt_reset();  // "beri makan" penjaga: loop() masih berputar

  perbaruiSensor();      // satu sampel analog setiap 2 ms
  perbaruiAktuator();    // pompa dan buzzer padam tepat waktu
  perbaruiAturan();      // MENYIRAM -> JEDA -> SIAGA
  perbaruiDetak();       // LED status
  perbaruiLayar();       // halaman status: jam berdetak, lalu kembali sendiri
  tanganiTombol();
  periksaPerintahSerial();
  jalankanSiklus();

  catatLamaPutaran(micros() - mulaiPutaran);
}
```

File utama ini kini pendek dan mudah dibaca dari atas ke bawah:

- **`setup()`** menyiapkan setiap modul. Aktuator disiapkan **pertama** supaya relay langsung padam, sedangkan *watchdog* dipasang **terakhir**, setelah semua persiapan selesai (Konsep 8).
- **`loop()`** memberi makan *watchdog*, lalu memanggil delapan fungsi. Setiap fungsi hanya memeriksa "sudah waktunya?", lalu langsung kembali. Di akhir, `catatLamaPutaran()` mencatat putaran terlama, yang bisa kamu lihat lewat perintah `info`.
- **`jalankanSiklus()`** adalah *state machine* siklus utama dari Konsep 4. Setiap putaran `loop()` hanya mengerjakan satu langkah, jadi tombol dan perintah Serial tetap diperiksa di antara langkah-langkah itu.
- **`periksaMasalah()`** mengatur irama LED status, dan mencetak `ERROR` atau `INFO` hanya **saat keadaan sebuah sensor berubah**: gagal atau pulih (Konsep 9).
- **`kirimData()`** masih kosong, sama seperti sejak Modul 3. Rak ini diisi di Modul 10–11.

Yang berubah di modul-modul lain, dibandingkan dengan v0.4.0:

- **`sensor.cpp`** — rata-rata 20 bacaan analog (Modul 6) kini dikumpulkan **sedikit demi sedikit**: `perbaruiSensor()` mengambil satu sampel baru setiap 2 ms tanpa menunggu, dan `bacaSensor()` tinggal menghitung rata-ratanya. Hasilnya sama dengan Modul 6, yaitu rata-rata 40 ms terakhir, tetapi tanpa `delay(2)`.
- **`aktuator.cpp`** — `nyalakanPompa()` menyalakan pompa lalu langsung kembali, dan `perbaruiAktuator()` yang memadamkannya tepat waktu. Buzzer pun begitu. Pengaman tandon kini memakai bacaan tandon terbaru, yang paling lama berumur 2 detik, sehingga HC-SR04 tidak perlu diukur ulang dan `delay(60)` tidak diperlukan lagi.
- **`aturan.cpp`** — siram otomatis memakai *state machine* Praktik 3 (SIAGA → MENYIRAM → JEDA). Lampu otomatis tetap seperti Modul 6; catatan "lampu ini milik aturan otomatis" kini disimpan oleh modul aktuator lewat `aturLampuOtomatis()`.
- **`perintah.cpp`** — perintah dibaca dengan pembaca baris Praktik 5 yang tidak pernah menunggu. Ada perintah baru: `info`, `ambang`, `ambang 35`, `ambang bawaan`, `log debug`, `log info`, `log error`, dan `restart`. Jawaban `status` kini juga menyebut keadaan pompa.
- **`layar.cpp`** — halaman bacaan rancanganmu tetap sama, ditambah **halaman status** yang muncul selama 10 detik setiap kali tombol ditekan lama: *uptime* besar, alasan *restart*, angka `Nyala ke-`, ambang, versi, dan memori bebas.
- **`kartu.cpp`** — baris CSV kini disusun dengan `snprintf()`, dan dicatat setiap 30 detik menurut jam, bukan setiap 15 laporan.
- **`sistem.cpp`** — `uptimeDetik()` memakai `esp_timer_get_time()` (Konsep 3), dan `alasanReset()` kini menjawab `const char*`, bukan `String`.

### E. Verify, Upload, dan uji setiap fitur

1. Klik **Verify**. Karena filenya banyak, penyusunan pertama memakan waktu lebih lama daripada biasanya. Kalau muncul error, gulir panel **Output** ke atas dan baca **pesan error pertama** saja. Di depannya ada nama file dan nomor barisnya. Buka tab itu, bandingkan dengan [versi rujukan](kode/node-1-rumah/), perbaiki, lalu klik **Verify** lagi. Error-error berikutnya sering hanya akibat dari yang pertama. Tabel error di 🚨 membantu menerjemahkan pesannya.
2. Pastikan tandon berisi air dan sensor tanah tertancap di tanah lembap. Colokkan USB, nyalakan MB102, lalu klik **Upload**. Buka Serial Monitor (**115200 baud**, **New Line**).

   **Hasilnya** (tanpa modul microSD; angka bacaanmu pasti berbeda):

   ```text
   [00:00:01] INFO  Node 1 Rumah - firmware 1.0.0
   [00:00:01] INFO  Alasan restart terakhir: POWERON
   [00:00:01] INFO  Nyala ke-1. Ambang tanah_siram: 30 % (angka bawaan)
   [00:00:02] INFO  Kartu microSD tidak terbaca: catatan CSV dimatikan.
   [00:00:02] INFO  Watchdog aktif: restart otomatis kalau loop() macet lebih dari 5 detik.
   [00:00:02] INFO  suhu=28.5 C  kelembapan=71 %  cahaya=3094  tanah=70 %  gerak=tidak  level_air=52 %
   ```

   Angka `Nyala ke-` dan ambangnya bisa berbeda karena map NVS `node1` sudah dipakai sejak Praktik 5.
3. Uji setiap fitur barunya:

| Uji | Caranya | Yang harus terjadi |
| :--- | :--- | :--- |
| Detak jantung | Lihat LED status. | Menyala sekejap setiap detik. |
| Tekan pendek | Tekan tombol sebentar. | Relay lampu berbunyi "klik"; log `Tombol: lampu on`. |
| Tekan lama | Tahan tombol 1 detik (di Wokwi 2–3 detik). | Layar menampilkan **halaman status** selama 10 detik, lalu kembali sendiri ke halaman bacaan. |
| Menyiram tanpa membeku | Angkat sensor tanah ke udara. Selama pompa menyala, tekan tombol sebentar. | Pompa menyala 3 detik, dan lampu tetap merespons tombol. Ketik `info`: tertulis `penyiraman JEDA`. Setelah itu, tancapkan kembali sensornya. |
| Ambang di NVS | Ketik `ambang 40` (angka yang belum pernah kamu simpan), cabut USB (matikan MB102 dulu), colokkan lagi, nyalakan MB102, lalu ketik `ambang`. Di Wokwi, ganti cabut-colok dengan perintah `restart`. | `ambang: tanah_siram = 40 % (dari NVS)`, dan angka `nyala ke-` di jawaban `info` bertambah satu (satu lagi untuk setiap tekanan **EN**). |
| Perintah lama | Ketik `status`, `lampu on`, `lampu off`, `pompa 2`, `tirai 30`, `bunyi`. | Bekerja seperti v0.4.0, tetapi Node 1 tidak pernah membeku. |
| Kesehatan | Ketik `info`. | Tiga baris: versi, *uptime*, alasan *restart*, angka nyala, memori bebas, putaran `loop()` terlama, *watchdog*, ambang, keadaan penyiraman, dan tingkat log. |
| Log bertingkat | Ketik `log debug`, tunggu 4 detik, lalu ketik `log info`. | Baris `Siklus: MENUNGGU -> MEMBACA` dan kawan-kawannya muncul, lalu hilang lagi. |

Selesai menguji, kembalikan ambangnya supaya angka uji 40 % tidak tertinggal di NVS: ketik `ambang bawaan` (kembali ke 30 %), atau ketik `ambang` diikuti angkamu sendiri dari langkah A, misalnya `ambang 35`.

4. **Buktikan tidak ada `delay()` di `loop()`.** Di VS Code, buka folder `rumah-pintar-mini`, tekan **Ctrl + Shift + F**, lalu cari `delay(`. Hasilnya tiga baris: dua baris komentar yang menyebut `delay()`, dan satu-satunya perintah `delay(500)` di `setup()` milik `node-1-rumah.ino`. Yang satu itu boleh karena `setup()` hanya berjalan sekali dan *watchdog* belum mengawasi. Di `sensor.cpp` memang ada `delayMicroseconds()`, tetapi itu hanya pulsa pemicu HC-SR04 sepanjang 12 **mikro**detik. Angka `putaran loop() terlama` di `info` menunjukkan waktu terlama Node 1 "tuli": puluhan milidetik saja, bukan 3.000 ms seperti v0.4.0.

![Tangkapan layar Wokwi Node 1 versi 1.0, dipotong dan disusun ulang. Kiri atas, perbesaran layar OLED setelah tombol D13 ditahan 1 detik, di Wokwi 2 sampai 3 detik; halaman status ini tampil 10 detik: Menyala selama: 00:00:10, Restart: POWERON, Nyala ke-1, Ambang tanah: 30%, dan v1.0.0 bebas 312KB. Kanan atas, arti setiap baris: uptime, lama menyala sejak restart terakhir; alasan restart terakhir, POWERON berarti baru dinyalakan; berapa kali papan pernah menyala, dihitung di NVS; ambang siram sekarang, dari NVS atau angka bawaan; versi firmware dan RAM yang masih bebas. Bawah, Serial Monitor: baris log [00:00:04] INFO dan [00:00:06] INFO berisi bacaan suhu, kelembapan, cahaya, tanah, gerak, dan level air; tiga baris jawaban perintah info (penanda 1): firmware 1.0.0, menyala 00:00:06, restart terakhir POWERON, nyala ke-1; memori bebas 319864 byte, putaran loop() terlama 45 ms, watchdog 5 detik; ambang tanah_siram 30 %, penyiraman SIAGA, tingkat log INFO; lalu bacaan [00:00:08] dan [00:00:08] INFO Tombol ditekan lama: halaman status ditampilkan 10 detik. (penanda 2, tekan lama tercatat sebagai INFO, bersamaan dengan halaman status di OLED)](aset/wokwi-node-1-v1.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

**Semua uji lolos?** Kerjakan langkah G sekarang supaya v1.0 aman di GitHub, lalu mulai uji 24 jam. Kalau selama uji kamu mengubah kode, *commit* lagi sesudahnya.

### F. Uji ketahanan 24 jam

Inilah ujian kelulusan Node 1: **24 jam tanpa *restart***. Banyak *bug* baru muncul setelah berjam-jam, misalnya memori yang bocor sedikit demi sedikit atau macet yang hanya terjadi sesekali. Uji panjang seperti ini, yang sering disebut *soak test* (uji rendam), adalah cara menangkapnya.

**Persiapan:**

1. **Celupkan sensor tanah ke gelas air.** Ini paling aman untuk uji 24 jam. Kalau sensornya tertancap di tanah yang lama-kelamaan mengering di bawah ambang, pompa akan menyala setiap sekitar 33 detik sampai pagi. **Arahkan selang pompa kembali ke tandon** dan rekatkan ujungnya, lalu pastikan tandon berisi lebih dari 20 %. Dengan begitu, kalau pompa tetap menyala berkali-kali, airnya hanya berputar.
2. **Sumber daya ESP32 yang tidak tidur.** Cara termudah adalah ***charger* HP 5 V** bermerek, minimal 1 A (**bukan** *power bank*). *Charger* ini hanya **menggantikan laptop**: colokkan ke port USB papan ESP32, bukan ke MB102 dan bukan ke pin VIN; aturan emas lainnya tetap berlaku. Kalau papannya sedang tersambung ke laptop, matikan MB102, cabut USB dari laptop, colokkan *charger* ke stopkontak dan kabelnya ke papan ESP32, **baru** nyalakan MB102. Kalau memakai laptop, atur supaya laptop tidak tidur selama tercolok listrik (Windows: **Settings → System → Power & battery**; macOS: **System Settings → Battery** atau **Energy**), dan jangan menutup layarnya: di banyak laptop, menutup layar sama dengan menidurkannya. Jangan lupa mengembalikan pengaturannya setelah uji selesai.
3. Letakkan meja kerja sesuai aturan keselamatan nomor 3 di awal modul, dengan *charger* dan stopkontaknya di luar nampan.

**Mulai:**

1. Nyalakan Node 1 (USB atau *charger* dulu, baru MB102). Kalau memasang modul microSD yang dayanya dari MB102, tekan **EN** setelah MB102 menyala (Modul 7), **baru** lanjut ke langkah 2.
2. Tahan tombol 1 detik untuk membuka halaman status. Catat **jam mulai**, angka **`Nyala ke-`**, dan angka **memori bebas**, atau potret layarnya.

**Selama 24 jam:** sesekali lirik LED status (berdetak pelan) dan layar (bacaan berganti setiap 2 detik). Tidak perlu membuka Serial Monitor.

**Setelah 24 jam:** buka lagi halaman status. Node 1 **lulus** kalau:

- *uptime* di halaman status menunjukkan **24:00:00 atau lebih**, dan
- angka **`Nyala ke-` sama** dengan saat mulai.

Kalau kamu menguji dengan laptop dan Serial Monitor terbuka, ketik juga `info` saat mulai dan setelah 24 jam, lalu bandingkan memori bebas dan putaran terlamanya. Memori bebas yang naik-turun sedikit itu wajar; yang terus turun adalah tanda kebocoran (🔬). Kalau gagal, buka "Uji 24 jam gagal" di 🚨.

**Di Wokwi**, cukup **30 menit *uptime***: jalankan simulasinya, biarkan tab Wokwi tetap terbuka dan pastikan laptop tidak tidur, lalu buka halaman status setelah *uptime* mencapai 00:30:00. Simulasi Node 1 biasanya berjalan lebih lambat daripada jam sungguhan (lihat persentase kecepatan di kanan atas panel simulasi), jadi 30 menit *uptime* bisa butuh sekitar satu jam. Di Wokwi, pemeriksaan `Nyala ke-` tetap berlaku.

**Hasilnya** di Wokwi: jawaban perintah `info` di awal uji dan setelah sekitar 70 menit waktu nyata. Simulatornya berjalan kira-kira separuh kecepatan papan asli, jadi *uptime*-nya baru 34 menit. Baris `…` menandai laporan bacaan setiap 2 detik yang tidak ikut dikutip.

```text
[00:00:01] INFO  Nyala ke-1. Ambang tanah_siram: 30 % (angka bawaan)
…
info: firmware 1.0.0, menyala 00:00:18, restart terakhir POWERON, nyala ke-1
info: memori bebas 319864 byte, putaran loop() terlama 45 ms, watchdog 5 detik
info: ambang tanah_siram 30 %, penyiraman SIAGA, tingkat log INFO
…
info: firmware 1.0.0, menyala 00:34:24, restart terakhir POWERON, nyala ke-1
info: memori bebas 319864 byte, putaran loop() terlama 45 ms, watchdog 5 detik
info: ambang tanah_siram 30 %, penyiraman SIAGA, tingkat log INFO
```

Memori bebas tetap `319864` byte dari awal sampai akhir, dan angka nyalanya tetap `nyala ke-1`. Artinya, tidak ada kebocoran memori dan tidak ada *restart* diam-diam: Node 1 lulus uji versi Wokwi.

Tulis hasilnya di `catatan-debugging.md` (folder `modul-08` di `belajar-iot`), lalu *commit* dan *push* repositori `belajar-iot` seperti Praktik 8:

```markdown
## Uji 24 jam Node 1 v1.0

| | Mulai | Selesai |
| --- | --- | --- |
| Tanggal dan jam | | |
| Menyala selama (uptime) | 00:00:… | |
| Restart | | |
| Nyala ke- | | |
| Memori bebas (KB) | | |

Lulus (uptime ≥ 24:00:00 dan "Nyala ke-" sama)? ya / tidak
```

### G. *Commit* dan *push*

1. Di GitHub Desktop, pilih **`rumah-pintar-mini`** di kotak **Current repository** — selalu lihat kotak ini sebelum *commit*!
2. Tab **Changes** berisi 24 file: `firmware/node-1-rumah/node-1-rumah.ino` yang berubah, ditambah 23 file baru di folder yang sama.
3. Isi **Summary** dengan `Node 1 v1.0: tanpa delay, modular, watchdog, NVS, log (Modul 8)`, klik **Commit 24 files to main**, lalu **Push origin**.

> [!IMPORTANT]
> **Versi 1.0 adalah janji.** Mulai sekarang, setiap perubahan Node 1 tetap mengikuti tiga aturan: **`loop()` tidak pernah menunggu**, **satu modul mengurus satu hal**, dan **setelan penting disimpan di NVS**. Modul 9–11 menambahkan catu daya sendiri, WiFi, dan MQTT ke Node 1 tanpa melanggar ketiganya.

---

## 📖 Glosarium

| Istilah | Arti singkat |
| :--- | :--- |
| **`delay()`** | Perintah "berhenti total" selama sekian milidetik. Selama itu, `loop()` tidak memeriksa apa pun. |
| **`millis()`** | Jam ESP32: jumlah milidetik sejak papan menyala. Kembali ke 0 setelah sekitar 49,7 hari. |
| **Pola `millis()`** | Cara menunggu tanpa tertidur: `if (sekarang - waktuTerakhir >= JEDA)`. Kalau belum waktunya, langsung lanjut. |
| **Putaran `loop()`** | Satu kali `loop()` dijalankan dari baris pertama sampai terakhir. Tanpa `delay()`, terjadi puluhan ribu kali per detik. |
| **`unsigned long`** | Bilangan bulat 32-bit yang tidak pernah negatif: `0` sampai `4294967295`. Tempat menyimpan waktu. |
| **Meluap** (*overflow*) | Keadaan saat angka melewati batas terbesarnya, lalu kembali ke 0, seperti odometer. |
| **`micros()`** | Jam ESP32 dalam mikrodetik (sepersejuta detik). Dipakai untuk mengukur lama satu putaran. Meluap setiap sekitar 71,6 menit; pengurangannya tetap aman, tetapi jangan dipakai untuk jarak waktu yang panjang. |
| **`esp_timer_get_time()`** | Jam mikrodetik 64-bit sejak papan menyala, yang baru meluap setelah ratusan ribu tahun. Dipakai untuk *uptime*. |
| ***Uptime*** | Lama papan menyala sejak *restart* terakhir. |
| **Detak jantung** (*heartbeat*) | LED status yang berkedip teratur sebagai tanda program masih sehat. |
| **Tekan pendek / tekan lama** | Tombol dilepas sebelum 1 detik / tombol ditahan 1 detik atau lebih. |
| ***State machine*** (mesin keadaan) | Cara menyusun program sebagai daftar keadaan ditambah aturan kapan berpindah. |
| **Keadaan** (*state*) | Kondisi yang sedang dijalani *state machine*, misalnya SIAGA atau MENYIRAM. Selalu tepat satu pada satu waktu. Di siklus utama Node 1, keadaan disebut **langkah**. |
| **Transisi** | Perpindahan dari satu keadaan ke keadaan lain karena suatu pemicu. |
| **`enum`** | Daftar nama pilihan, misalnya `{ SIAGA, MENYIRAM, JEDA }`. Variabelnya hanya bisa berisi salah satunya. |
| **Siklus utama** | *State machine* Node 1 v1.0: MENUNGGU → MEMBACA → MENAMPILKAN → BERTINDAK. |
| **Modul** (kode) | Sepasang file `.h` dan `.cpp` yang mengurus satu hal, misalnya tombol. |
| **File *header* (`.h`)** | "Menu" modul: daftar fungsi yang bisa dipakai file lain, tanpa isinya. |
| **File `.cpp`** | "Dapur" modul: isi setiap fungsi, ditambah variabel rahasianya. |
| **`#include`** | Perintah untuk ikut membaca isi file lain. Petik ganda untuk file sketsa, kurung sudut untuk library. |
| **`#pragma once`** | Baris di bagian paling atas file `.h`: "baca file ini sekali saja". |
| **`static`** | Di depan variabel atau fungsi di file `.cpp`: milik file itu saja. |
| **Menyusun dan menyambung** (*compile* dan *link*) | Dua tahap mengubah kode menjadi program. Error tahap kedua diakhiri `ld returned 1 exit status`. |
| ***Undefined reference*** | Error tahap menyambung: fungsi dijanjikan di file `.h`, tetapi tidak ada isinya di file `.cpp` mana pun. |
| **`char[]`** | Deretan laci huruf yang ukurannya ditentukan sekali di awal. |
| **`'\0'`** | Laci bernilai nol yang menandai akhir teks di `char[]`. |
| **`const char*`** | Cara C++ menyebut teks tetap di antara petik ganda, misalnya jawaban `teksOnOff()`. |
| **`snprintf()`** | Fungsi yang mengisi pola teks berkotak isian ke dalam `char[]`, tanpa pernah melebihi jumlah lacinya. |
| **Kotak isian** (*format specifier*) | Tanda `%` di pola `snprintf()` dan `Serial.printf()`, misalnya `%d`, `%lu`, `%s`, `%.1f`. |
| ***Heap*** (timbunan) dan **fragmentasi** | Tempat memori yang dipinjam saat program berjalan / keadaan ketika *heap* berlubang-lubang sehingga potongan besar sulit didapat. |
| **RAM** dan ***flash*** | Memori kerja yang terhapus saat listrik padam / memori penyimpan program dan setelan yang tetap ada. |
| **NVS** | *Non-Volatile Storage*: bagian *flash* untuk menyimpan setelan kecil. |
| **Preferences** | Library paket esp32 untuk memakai NVS. Isinya disimpan per **map** (*namespace*) dan **label** (*key*), seperti lemari arsip. |
| ***Watchdog*** | "Anjing penjaga" yang me-*restart* papan kalau tidak diberi makan tepat waktu. |
| **TWDT** | *Task Watchdog Timer*: *watchdog* yang mengawasi tugas-tugas, termasuk `loop()`. |
| **Memberi makan** *watchdog* | Memanggil `esp_task_wdt_reset()`, tanda program masih berputar. |
| **Panik** (*panic*) | Penghentian paksa program oleh sistem, diikuti laporan dan *restart*. |
| ***Backtrace*** | Deretan alamat "jejak kaki" tempat program berhenti, yang dicetak saat panik. |
| **Alasan *restart*** | Penyebab *restart* terakhir, dari `esp_reset_reason()`. Node 1 menerjemahkannya menjadi kata pendek seperti `POWERON`, `SW`, atau `WDT`; sketsa Praktik 6 menulis `TASK_WDT`. |
| ***Bootloop*** | Keadaan saat papan menyala, macet atau mogok, lalu *restart*, berulang terus. |
| **Inti** (*core*) | Otak pemroses. ESP32 punya dua; `loop()` berjalan di inti 1. |
| **FreeRTOS** dan **tugas** (*task*) | Sistem operasi mini di dalam ESP32 / satu "program kecil" yang dijadwalkan FreeRTOS, misalnya `loopTask`. |
| **Tugas menganggur** (*idle task*) | Tugas yang berjalan saat sebuah inti tidak punya pekerjaan lain. |
| **Log** | Catatan kejadian yang dicetak program, lengkap dengan waktunya. |
| **Tingkat log** | Penggolongan pesan log: DEBUG (rincian), INFO (kejadian penting), ERROR (masalah). |
| ***Bug*** dan ***debugging*** | Kesalahan dalam program / pekerjaan menemukan dan memperbaikinya. |
| **Variabel bayangan** (*shadowing*) | Variabel baru yang namanya sama dengan variabel lain sehingga "menutupi" variabel itu. |
| **Peringatan kompiler** (*compiler warning*) | Pesan kompiler tentang kode yang tersusun, tetapi mencurigakan. Nyalakan di **File → Preferences… → Compiler warnings**. |
| **Bagi dua** (*bisection*) | Mempersempit lokasi *bug* dengan mematikan separuh kode, lalu separuh dari sisanya, dan seterusnya. |
| **Isolasi** | Memeriksa bagian yang dicurigai saja, terpisah dari yang lain, misalnya dengan mencetak nilainya di satu fungsi atau mengujinya di sketsa kecil tersendiri. |
| **Uji rendam** (*soak test*) | Uji panjang, misalnya 24 jam, untuk menangkap *bug* yang baru muncul setelah lama berjalan. |
| **Histeresis** (*hysteresis*) | Jarak antara dua batas (misalnya "kosong" di 20 % dan "cukup" di 30 %) supaya keadaan tidak bolak-balik. |

---

## 📝 Kuis 5 soal

1. Perhatikan `loop()` ini:

   ```cpp
   void loop() {
     digitalWrite(PIN_LED_STATUS, HIGH);
     delay(500);
     digitalWrite(PIN_LED_STATUS, LOW);
     delay(500);
     if (digitalRead(PIN_TOMBOL) == LOW) {
       aturLampu(!lampuMenyala);
     }
   }
   ```

   (a) Mengapa tekanan tombol sering tidak terbaca? (b) Tulis ulang bagian LED-nya dengan pola `millis()` supaya tombol bisa diperiksa di setiap putaran.
2. Setelah `millis()` meluap, `waktuTerakhir` berisi `4294966000` dan `sekarang` berisi `2000`. (a) Berapa hasil `sekarang - waktuTerakhir` untuk `unsigned long`? (b) Kalau `JEDA` bernilai `2000`, apakah tugasnya dikerjakan? (c) Mengapa `if (millis() >= waktuTerakhir + JEDA)` berbahaya?
3. Di Praktik 3, tanahnya kering, tetapi air tandon tinggal 10 %. (a) Keadaan apa saja yang dilalui Node 1 selama satu menit? (b) Apa yang dilakukan LED status? (c) Apa akibatnya kalau keadaan JEDA dihapus dan Node 1 langsung kembali ke SIAGA?
4. (a) Tab utama memanggil `bunyikanBuzzer()`, tetapi lupa menulis `#include "aktuator.h"`. Error tahap apa yang muncul, dan bagaimana kira-kira pesannya? (b) `aktuator.h` menulis `void bunyikanBuzzer();`, tetapi di `aktuator.cpp` fungsinya tertulis `bunyikanBuzer()`. Error tahap apa yang muncul? (c) Buka tab `aktuator.cpp`. Mengapa variabel `pompa` di sana diberi `static`?
5. (a) Seorang teman menambahkan perintah `siram 10` yang memakai `delay(10000)` ke Node 1 v1.0. Setiap kali perintah itu diketik, Node 1 di-*restart* dengan alasan `WDT`. Jelaskan penyebabnya dan cara memperbaikinya. (b) Teman lain menyimpan bacaan suhu ke NVS di setiap putaran `loop()` "supaya tidak hilang". Apa masalahnya?

<details>
<summary><b>Kunci jawaban & penjelasan</b></summary>

1. (a) Tombol hanya diperiksa **sekali setiap 1 detik**, sesudah dua `delay(500)` selesai. Tekanan baru tercatat kalau kebetulan tombol sedang ditekan tepat pada saat itu. (b) Contohnya:

   ```cpp
   void loop() {
     unsigned long sekarang = millis();
     if (sekarang - waktuKedipTerakhir >= 500) {
       waktuKedipTerakhir = sekarang;
       ledMenyala = !ledMenyala;
       digitalWrite(PIN_LED_STATUS, ledMenyala);
     }
     // ...tombol diperiksa di sini, di setiap putaran (pantulannya disaring seperti Praktik 1)
   }
   ```

2. (a) **`3296`**: 1.296 ms sampai `millis()` meluap (4.294.967.296 − 4.294.966.000), ditambah 2.000 ms sesudahnya. (b) **Ya**, karena 3.296 ≥ 2.000. (c) `waktuTerakhir + JEDA` bisa meluap lebih dulu menjadi angka kecil sehingga `millis() >=` angka kecil itu langsung benar, dan tugasnya dikerjakan di setiap putaran sampai `millis()` sendiri meluap. Kesalahan ini hanya muncul sekali setiap 49,7 hari, jadi hampir mustahil tertangkap saat menguji.
3. (a) **SIAGA → JEDA → SIAGA → JEDA** dan seterusnya: setiap kali tanah kering terdeteksi, pompa ditolak, lalu Node 1 beristirahat 30 detik. Dalam satu menit, pompa ditolak dua kali dan tidak pernah menyala. (b) **Berkedip cepat**, tanda air tandon kurang. (c) Node 1 mencoba lagi setiap 2 detik, yaitu pada setiap pemeriksaan tanah. Saat tandon kosong, Serial dibanjiri penolakan. Saat tandon terisi, pompa langsung menyala lagi begitu padam (pemeriksaan tanah terakhir sudah lewat 3 detik), sebelum airnya sempat meresap. Akibatnya, tanaman kebanjiran.
4. (a) Error **tahap menyusun**: `'bunyikanBuzzer' was not declared in this scope`. (b) Error **tahap menyambung**: ``undefined reference to `bunyikanBuzzer()'``, diakhiri `ld returned 1 exit status`. (c) Supaya hanya `aktuator.cpp` yang bisa mengubah keadaan pompa. File lain cukup bertanya lewat `pompaMenyala()`. Selain itu, `static` mencegah tabrakan nama dengan variabel `pompa` di file lain.
5. (a) `delay(10000)` menahan `loop()` selama 10 detik, padahal *watchdog* menganggap `loop()` yang tidak kembali dalam 5 detik sebagai program macet. Perbaikannya: pakai fungsi pompa tanpa menunggu yang sudah ada, `nyalakanPompa(10, bacaanTerakhir().level_air)`. Fungsi itu langsung kembali, dan `perbaruiAktuator()` memadamkan pompanya tepat waktu. (b) Setiap kali angkanya berubah, NVS menulis catatan baru, dan sesekali satu bagian *flash* harus dihapus. Bacaan suhu berubah terus, jadi bagian NVS itu terus dihapus dan ditulis ulang, dan umurnya (sekitar 100.000 kali) habis jauh lebih cepat daripada untuk setelan yang hanya berubah sebulan sekali. Setiap penulisan juga butuh waktu, jadi `loop()` ikut tersendat. NVS untuk **setelan** yang jarang berubah; bacaan sensor cukup di RAM, atau dikirim ke kartu microSD dan, mulai Modul 10, ke server.

</details>

---

## ✅ Checklist kelulusan Modul 8

Centang semuanya sebelum lanjut ke Modul 9:

- [ ] Aku bisa menjelaskan jebakan `delay()`, dan di Praktik 1 aku melihat sendiri perbedaannya: tekanan tombol hilang di versi `delay()`, tetapi semuanya tercatat di versi `millis()`.
- [ ] ⭐ **Tiga tugas berjalan bergantian dalam satu `loop()`** (Praktik 2): LED berdetak, DHT22 dibaca setiap 2 detik, dan tombol mengenali tekan pendek dan tekan lama. LED berkedip cepat saat kabel data DHT22 dilepas.
- [ ] *State machine* penyiraman bekerja (Praktik 3): tombol tetap merespons selama pompa menyala, dan aku sudah menggambar *state machine*-nya di kertas.
- [ ] Sketsa modular lima file berjalan sama persis dengan Praktik 3 (Praktik 4), dan aku bisa membedakan error tahap menyusun dari error tahap menyambung.
- [ ] Aku bisa membaca pola `snprintf()` sederhana, misalnya `"Ambang tanah: %d%%"`, dan tahu mengapa laci `char[]` disiapkan untuk teks terpanjang yang mungkin (Konsep 6).
- [ ] ⭐ **Ambang yang kusimpan di NVS tetap ada setelah papan dicabut, lalu dicolokkan lagi** (Praktik 5, dan sekali lagi di Node 1 v1.0, ➕ E; di Wokwi lewat perintah `restart`).
- [ ] ⭐ ***Watchdog* me-*restart* program yang sengaja kubuat macet**, dan aku bisa membaca alasan *restart*-nya (`TASK_WDT`) serta baris-baris laporannya (Praktik 6).
- [ ] Aku menemukan *bug* Praktik 7 dengan bantuan log dan menulis `catatan-debugging.md`.
- [ ] ⭐ **Node 1 v1.0 tidak memakai `delay()` di `loop()`, dan berjalan 24 jam tanpa *restart*** (di Wokwi: 30 menit *uptime*): *uptime* di halaman status ≥ 24:00:00 dan angka `Nyala ke-` tidak berubah.
- [ ] Node 1 v1.0 sudah di-*commit* dan di-*push* ke `rumah-pintar-mini`; sketsa dan catatan minggu ini ada di `belajar-iot/modul-08`.
- [ ] ⭐ **Kuis: minimal 4 dari 5 benar.**

**Lulus jika** (sesuai Silabus): *Node 1 berjalan 24 jam tanpa restart (dicek lewat uptime counter di OLED; di Wokwi: 30 menit; laptop masih boleh menjadi catu daya ESP32 — adaptor permanen dipasang di Modul 9), ambang tetap tersimpan setelah mati listrik, dan kodemu tidak lagi memakai `delay()` di `loop()`.*

**Menuju tanda lulus Fase 1** ([Silabus §8](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)): firmware v1.0 kini selesai. Uji 24 jam minggu ini adalah geladi bersihnya: tanda lulus Fase 1 meminta Node 1 berjalan mandiri 24 jam dari **adaptor**, yang dipasang di Modul 9, bersama sketsa baterai terukur. Video 30 detik menyusul di akhir Fase 1.

Semua tercentang? Selamat — Node 1 kini punya firmware yang layak disebut "jadi": tidak pernah menunggu dengan diam, tahu sedang berada di tahap apa, ingat setelannya, dan bisa bangkit sendiri kalau tersandung. Di **Modul 9**, Node 1 mendapat catu daya sendiri, dan kamu belajar mengukur arus serta menghemat daya untuk Node 2 yang berbaterai.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, lembar data, dan kode sumber yang dipakai** (diakses Oktober 2026):

- [Referensi `millis()`](https://docs.arduino.cc/language-reference/en/functions/time/millis/) dan contoh [Blink Without Delay](https://docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay/) dari dokumentasi Arduino — asal pola "melirik jam dinding".
- Dokumentasi Espressif untuk paket esp32: [Preferences](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/preferences.html) — map (*namespace*), label (*key*), dan pasangan fungsi baca-tulis.
- Dokumentasi ESP-IDF 5.5: [Watchdogs](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/wdts.html), [Non-Volatile Storage](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/storage/nvs_flash.html) (panjang nama paling banyak 15 huruf dan penyebaran tulisan supaya *flash* tidak cepat aus), [esp_timer](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/esp_timer.html), [Miscellaneous System APIs](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/misc_system_api.html) (`esp_reset_reason()`), [Fatal Errors](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/fatal-errors.html) (laporan panik dan *backtrace*), [FreeRTOS](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/freertos.html), dan [panduan migrasi ESP-IDF 5.0](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/migration-guides/release-5.x/5.0/system.html) (sejak versi ini, `esp_task_wdt_init()` menerima "formulir" konfigurasi).
- Kode sumber [arduino-esp32](https://github.com/espressif/arduino-esp32) 3.3.x: `cores/esp32/main.cpp` (tugas `loopTask`, tumpukan 8 KB, `loop()` belum diawasi *watchdog* secara bawaan), `cores/esp32/esp32-hal-misc.c`, dan `cores/esp32/esp32-hal-log.h`; serta konfigurasi [esp32-arduino-lib-builder](https://github.com/espressif/esp32-arduino-lib-builder) (`CONFIG_ESP_TASK_WDT_PANIC=y`, tugas menganggur inti 1 tidak diawasi).
- Kode sumber [ESP-IDF](https://github.com/espressif/esp-idf) 5.5: `components/esp_system/task_wdt/task_wdt.c` (pesan `TWDT already initialized` dan `Task watchdog got triggered`, perilaku `esp_task_wdt_reconfigure()`) dan `components/esp_system/port/soc/esp32/system_internal.c` (pewaktu ikut di-*reset* saat *restart* oleh program).
- Kode sumber [Arduino IDE](https://github.com/arduino/arduino-ide) 2.3.10: menu tab sketsa (**New Tab**, **Rename**, **Delete**, **Previous Tab**, **Next Tab**), pintasan **Ctrl + Shift + N**, dialog `Name for new file`, akhiran `.ino` untuk nama tanpa akhiran, dan pilihan **Compiler warnings**; serta `boards.txt` paket esp32 3.3.12 (**Erase All Flash Before Sketch Upload** dan **Core Debug Level**).
- [Lembar data Winbond W25Q32JV (PDF)](https://www.winbond.com/resource-files/w25q32jv%20revg%2003272018%20plus.pdf), contoh chip *flash* SPI yang umum dipakai papan ESP32: minimal 100 ribu siklus hapus-tulis per sektor.
- David J. Agans, *Debugging: The 9 Indispensable Rules for Finding Even the Most Elusive Software and Hardware Problems* (AMACOM, 2002) — bacaan lanjutan; keenam langkah di Konsep 10 adalah ringkasan kurikulum ini yang terinspirasi oleh buku tersebut.

**Gambar.** Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Ilustrasi jendela Arduino IDE digambar ulang mengikuti bentuk aslinya, bukan tangkapan layar. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-08`, `jebakan-delay`, `pola-millis`, `odometer-millis` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Pola `millis()` mengikuti contoh Blink Without Delay; angka luapan dihitung dari batas `unsigned long` 32-bit; hasil 0 dari 5 dan 5 dari 5 tekanan sesuai uji Praktik 1 di Wokwi. | CC BY 4.0 |
| `tombol-pendek-lama`, `state-machine-siram`, `siklus-node1`, `peta-file-node1-v1` (`.png` + `.svg`) | Diagram orisinal, digambar dari kode sketsa Praktik 2, Praktik 3, dan Node 1 v1.0. | CC BY 4.0 |
| `kode-modular`, `char-snprintf`, `nvs-lemari-arsip`, `watchdog-penjaga`, `log-bertingkat`, `debugging-sistematis` (`.png` + `.svg`) | Diagram orisinal. Pesan error dan laporan *watchdog* dikutip dari keluaran asli Wokwi (paket esp32 3.3.x dengan GCC 14); aturan NVS dari dokumentasi ESP-IDF; contoh log dari kode Node 1 v1.0; angka `58015 ms` dari uji Praktik 7. | CC BY 4.0 |
| `arduino-tab-baru`, `arduino-compiler-warnings` (`.png` + `.svg`) | Ilustrasi orisinal yang digambar ulang dari Arduino IDE 2.3.10 (bukan tangkapan layar). Teks menu, dialog, dan jendela `Preferences` dari kode sumber Arduino IDE; teks peringatan kompiler diperiksa dengan GCC milik paket esp32. | CC BY 4.0 untuk ilustrasinya |
| `wokwi-kemenangan-cepat.png`, `wokwi-tiga-tugas.png`, `wokwi-siram-state-machine.png`, `wokwi-file-baru.png`, `wokwi-node-1-v1.png` | Tangkapan layar simulator [Wokwi](https://wokwi.com) (Oktober 2026) yang menjalankan kode dan `diagram.json` modul ini, dipotong dan disusun ulang. Penanda dan label oleh penulis. | © Wokwi (CodeMagic LTD); dipakai untuk tujuan pendidikan. |

Semua sketsa di modul ini, termasuk Node 1 v1.0 dengan 24 filenya, sudah dijalankan di Wokwi dengan paket esp32 versi 3. Node 1 v1.0 juga sudah menjalani uji ketahanan sekitar 70 menit waktu nyata (34 menit *uptime* simulasi), dan jalur kartu microSD-nya sudah dicoba. Pesan error yang dikutip mengikuti keluaran kompiler GCC di paket esp32; pesan *undefined reference* versi Arduino IDE diperiksa dengan penyambung GNU yang sama.

---

[⬅️ Modul 7](../modul-07-bus-sensor-oled-skematik/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 9 — Catu Daya & Hemat Daya: Adaptor, Baterai, Deep Sleep, & Mengukur Arus** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-9--catu-daya--hemat-daya-adaptor-baterai-deep-sleep--mengukur-arus))
