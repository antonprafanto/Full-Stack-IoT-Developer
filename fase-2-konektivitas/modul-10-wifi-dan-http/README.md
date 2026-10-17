# Modul 10 — WiFi & HTTP: Perangkat Mulai Berbicara dengan Jaringan

🌐 **Bahasa Indonesia** · [English](../../en/phase-2-connectivity/module-10-wifi-and-http/README.md)

*Fase 2 · Minggu 10 · Perangkat keras (*hardware*): **meja kerja Node 1 dari Modul 9**, **laptop**, **HP**, dan **WiFi 2,4 GHz** yang boleh kamu pakai (lihat 🧰) — tanpa komponen baru · Prasyarat: **Modul 8** (Node 1 v1.0) dan **Modul 4** (JSON dan server mini) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 9](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 11 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-11--mqtt-bahasa-resmi-dunia-iot--kontrak-data-proyek)

---

Selamat datang di Fase 2! Di Fase 1, Node 1 menjadi perangkat yang tangguh dan mandiri: membaca lima sensor, menggerakkan lampu, kipas, pompa, dan tirai, lalu hidup dari adaptornya sendiri. Namun, Node 1 masih **hidup sendirian**. Ia tidak bisa mengabari siapa pun, dan tidak ada yang bisa memberinya perintah dari jauh. Mulai minggu ini, Node 1 **tersambung ke jaringan**: ke WiFi rumahmu, ke laptopmu, ke HP-mu, dan ke internet.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Node 1 hanya bisa "diajak bicara" lewat kabel USB dan Serial Monitor. | Node 1 belum tersambung ke jaringan apa pun. | WiFi rumah, termasuk saat WiFi putus-sambung (Konsep 1–4, Praktik 2–3) |
| Kalau ditulis sembarangan di kode, kata sandi WiFi bisa ikut terunggah ke GitHub. | Rahasia bercampur dengan kode yang dibagikan. | File `secrets.h` yang diabaikan Git, lalu portal WiFi tanpa kata sandi di kode (Konsep 3 dan 5, Praktik 1 dan 4) |
| Node 1 tahu sudah berapa lama menyala, tetapi tidak tahu tanggal dan jam. | ESP32 tidak punya jam berbaterai: setiap kali menyala, jamnya mulai dari nol. | Jam dari internet lewat NTP (Konsep 6, Praktik 5) |
| Bacaan sensor hanya tampil di layar OLED dan tersimpan di kartu microSD. | Belum ada cara mengirim data ke komputer lain. | Surat-menyurat HTTP berisi JSON (Konsep 7–8, Praktik 6–7) |
| Perintah untuk lampu hanya bisa datang dari tombol atau Serial Monitor. | Node 1 belum bisa menerima perintah dari jaringan. | ESP32 menjadi server web kecil (Konsep 9, Praktik 8–9) |

Di akhir minggu, **Node 1 v1.1** tersambung ke WiFi rumah tanpa satu pun kata sandi tertulis di kodenya, tahu jam dan tanggal yang tepat, mengirim bacaan kelima sensornya ke laptop setiap menit, dan lampunya bisa dimatikan dari HP. Kalau router dimatikan sebentar, Node 1 tersambung lagi sendiri. Semuanya masih **di dalam jaringan rumahmu**: membuka perangkat ke internet adalah urusan Fase 5.

![Peta jalan Modul 10. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 2 Konektivitas, Modul 10 sampai 15, disorot. Modul 1 sampai 9 bertanda selesai, dan Modul 10 ditandai KAMU DI SINI dengan catatan modul pertama Fase 2: Node 1 tersambung ke jaringan. Bawah, kotak Modul 10 minggu ini, 8 sampai 10 jam yang dicicil, tanpa komponen baru, cukup WiFi 2,4 GHz, laptop, dan HP: Kemenangan Cepat, ESP32 menyapa WiFi rumahmu; Praktik 1, penjaga rahasia secrets.h dan .gitignore; Praktik 2, kenali jaringanmu: IP, router, alamat MAC; Praktik 3, uji cabut router: tersambung lagi sendiri; Praktik 4, portal WiFi seperti di hotel (WiFiManager); Praktik 5, jam dari internet (NTP) dan cap waktu ts; Praktik 6, cuaca dari internet: HTTPS dan JSON; Praktik 7, kirim bacaan ke laptop: HTTP POST; Praktik 8, sakelar lampu dari HP: ESP32 jadi server web; Praktik 9, alamat tetap dan nama node1.local; dan bagian Tambahan, Node 1 v1.1 tersambung ke jaringan, bertanda bintang wajib untuk lulus](aset/peta-jalan-modul-10.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - Semua praktik memakai **papan Node 1** di meja kerjamu, yang selama praktik dicolokkan ke laptop. Sejak Modul 9, papan itu hidup dari *charger*-nya, jadi di awal Kemenangan Cepat kita memindahkannya dulu ke laptop. MB102 baru perlu dinyalakan di Praktik 8 dan bagian ➕, saat relay lampu dipakai.
> - Setiap kotak kode punya tombol salin di pojok kanan atasnya. Semua sketsa juga tersedia sebagai file di folder [`kode/`](kode/).
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik. Angka di papanmu pasti berbeda.
> - **Wokwi bisa menjalankan sebagian praktik**: menyambung ke jaringan simulasi bernama `Wokwi-GUEST` (tanpa kata sandi), menanyakan jam ke internet, dan meminta data lewat HTTPS. Yang **tidak** bisa: mematikan router (Praktik 3), portal WiFi yang disambungi HP (Praktik 4), mengirim ke laptopmu (Praktik 7), dan membuka server web ESP32 dari browser (Praktik 8–9). Jaringan simulasinya tidak bisa kamu matikan, dan sisanya terhalang karena layanan gratis Wokwi hanya mengizinkan sambungan keluar. Kotak **Hasilnya** yang bertanda **rekaman Wokwi** berasal langsung dari simulator. Selebihnya bertanda **contoh**: susunan barisnya mengikuti kode sketsa dan rekaman Wokwi, tetapi nama WiFi, alamat IP, dan angka sinyalnya diganti dengan contoh dari jaringan rumah.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, memilih semua, menyalin, menempel, dan membuat tab baru.

> [!WARNING]
> **Aturan aman minggu ini.** Begitu tersambung ke jaringan, kesalahan kecil bisa dilihat orang lain.
>
> 1. **Kata sandi WiFi tidak pernah ditulis di kode yang di-*commit*.** Tempatnya di file `secrets.h` yang diabaikan Git (Praktik 1). Kalau kata sandi telanjur terunggah ke GitHub, anggap sudah bocor: **ganti kata sandi WiFi-mu** di router.
> 2. **Server web ESP32 dan penerima di laptop sengaja dibuat tanpa kata sandi**, khusus untuk latihan di jaringan rumah. Jangan membuat *port forwarding* (membuka pintu di router supaya orang di internet bisa langsung mengetuk perangkat di rumahmu), dan jangan menjalankan penerima di laptop saat tersambung ke WiFi umum, misalnya di kafe atau bandara. Cara menguncinya dibahas di Modul 20, 21, dan 27.
> 3. **Pakai jaringan yang memang boleh kamu pakai.** Di kos, kantor, atau kampus, tanyakan dulu kepada pengelolanya, dan jangan mengubah setelan router milik orang lain.
> 4. **Sebelum mencabut router** (Praktik 3 dan bagian ➕), beri tahu orang serumah karena internet mereka ikut putus beberapa menit. Atau pakai *hotspot* HP-mu sendiri.
> 5. **Aturan emas catu daya Modul 5 tetap berlaku:** relay mendapat listrik dari MB102, ESP32 dari USB atau *charger*-nya, dan urutan nyala-matinya tetap sama.

Ritme modul ini sama dengan Modul 1–9. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat dan komponen yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: ESP32 menyapa WiFi rumahmu (10 menit)](#-kemenangan-cepat-esp32-menyapa-wifi-rumahmu-10-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Jaringan rumah](#1-jaringan-rumah-router-alamat-ip-dan-alamat-mac) · [2 WiFi 2,4 GHz](#2-wifi-untuk-esp32-hanya-24-ghz-dan-kuat-lemahnya-sinyal) · [3 Rahasia](#3-rahasia-tidak-ditulis-di-kode-secretsh-dan-gitignore) · [4 Sambung ulang](#4-menyambung-tanpa-macet-lalu-tersambung-lagi-sendiri) · [5 Portal WiFi](#5-portal-wifi-seperti-di-hotel-wifimanager) · [6 Jam NTP](#6-jam-dari-internet-ntp-zona-waktu-dan-cap-waktu-ts) · [7 HTTP & JSON](#7-http-surat-menyurat-antarperangkat-berisi-json) · [8 HTTPS](#8-https-dan-setinsecure-amplop-tersegel-yang-kurirnya-tidak-diperiksa) · [9 Server web](#9-esp32-menjadi-server-web-dan-cara-menemukan-alamatnya) · [10 Harga WiFi](#10-harga-wifi-program-membengkak-adc2-terkunci-arus-melonjak)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Penjaga rahasia](#praktik-1--pasang-penjaga-rahasia-10-menit) · [2 Kenali jaringan](#praktik-2--kenali-jaringanmu-20-menit) · [3 Cabut router](#praktik-3--uji-cabut-router-25-menit) · [4 Portal WiFi](#praktik-4--portal-wifi-seperti-di-hotel-25-menit) · [5 Jam internet](#praktik-5--jam-dari-internet-15-menit) · [6 Cuaca HTTPS](#praktik-6--cuaca-dari-internet-20-menit) · [7 Kirim ke laptop](#praktik-7--kirim-bacaan-ke-laptop-30-menit) · [8 Sakelar dari HP](#praktik-8--sakelar-lampu-dari-hp-20-menit) · [9 Alamat tetap](#praktik-9--alamat-tetap-untuk-node-1-20-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-10)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

- **Menjelaskan cara kerja jaringan rumah** dengan bahasa sehari-hari: router, alamat IP, DHCP, dan alamat MAC.
- **Menyambungkan ESP32 ke WiFi 2,4 GHz** dan membaca "kartu identitas" jaringannya.
- **Menyimpan kata sandi WiFi dengan aman**: di file `secrets.h` yang diabaikan Git, atau lewat portal WiFi sehingga kata sandinya tidak ditulis di kode sama sekali.
- **Membuat ESP32 tersambung lagi sendiri** saat WiFi putus, tanpa membuat programnya macet.
- **Mengambil jam dan tanggal yang tepat dari internet** (NTP), lengkap dengan zona waktu dan cap waktu `ts`.
- **Mengirim dan menerima data lewat HTTP**: meminta cuaca dari API HTTPS, lalu mengirim JSON ke server mini di laptopmu.
- **Mengendalikan relay dari browser HP** lewat server web kecil di ESP32, dan menemukan alamatnya lewat IP tetap atau nama `.local`.
- **Menjelaskan "harga" WiFi**: program membengkak, ADC2 tidak bisa dipakai, dan arus listrik melonjak.
- **Memasang Node 1 v1.1** yang tersambung ke jaringan rumah, mengirim bacaannya setiap menit, dan lampunya bisa dimatikan dari HP.

---

## 🧰 Yang perlu disiapkan

Minggu ini **tidak ada komponen baru**. Yang baru adalah jaringannya.

| Apa | Keterangan |
| :--- | :--- |
| **Meja kerja Node 1 dari Modul 9** | Lengkap, dengan firmware Node 1 v1.0. Selama praktik, papan Node 1 dicolokkan ke laptop seperti di Fase 1; *charger*-nya dipakai lagi di bagian ➕. |
| **WiFi 2,4 GHz** | Nama jaringan (SSID) dan kata sandinya, persis sampai huruf besar-kecilnya. ESP32 hanya bisa memakai WiFi 2,4 GHz; cara memastikannya ada di Konsep 2 dan Praktik 2. Kalau WiFi rumah tidak bisa dipakai, *hotspot* HP juga boleh (Konsep 2). |
| **Laptop** | Tersambung ke WiFi yang **sama** dengan ESP32. Siapkan Node.js 24 dan folder `rumah-pintar-mini/alat` dari Modul 4. |
| **HP** | Dengan browser apa saja (Chrome, Safari, atau Samsung Internet), tersambung ke WiFi yang sama. |
| **Akses ke halaman admin router** (opsional) | Untuk Praktik 9 (alamat IP tetap). Alamat dan kata sandinya biasanya tertulis di stiker di badan router. Tidak punya aksesnya? Praktik 9 punya jalan lain. |
| **Library WiFiManager dan ArduinoJson** | Dipasang lewat **Library Manager** saat dibutuhkan, di Praktik 4 dan 6. |

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (saat ditulis: 2.3.10) | Sejak Modul 2. |
| Paket papan **esp32 by Espressif Systems** | **3.3.x** (saat ditulis: 3.3.12) | Sejak Modul 2. Library **WiFi**, **HTTPClient**, **WebServer**, **ESPmDNS**, dan **NetworkClientSecure** (`WiFiClientSecure`) sudah ikut di dalamnya. Kalau kelak **Boards Manager** menawarkan versi 4.x, tetap pakai 3.3.x untuk kurikulum ini. |
| Library **WiFiManager** (by tzapu) | **2.0.17** | Baru (Praktik 4). Silabus mensyaratkan minimal 2.0.17. |
| Library **ArduinoJson** (by Benoit Blanchon) | **7.4.3** | Baru (Praktik 6). |
| Library **DHT sensor library** (by Adafruit) | **1.4.7** | Sejak Modul 6; dipakai lagi di Praktik 7. |
| Node.js | **24.21.0** | Sejak Modul 4, untuk `penerima-webhook.js`. |

---

## 🏆 Kemenangan Cepat: ESP32 menyapa WiFi rumahmu (10 menit)

Sejak Modul 2, papan ESP32-mu sebenarnya membawa radio WiFi, tetapi belum pernah kita nyalakan. Sekarang kita suruh ia mengetuk pintu router rumahmu, lalu memperkenalkan diri.

> 🖥️ **Alat yang dipakai di bagian ini:** **Arduino IDE** dan **Serial Monitor**, **papan Node 1** yang dicolokkan ke laptop (MB102 boleh tetap mati), serta nama dan kata sandi **WiFi 2,4 GHz** milikmu. LED status D4 di meja kerja menjadi tanda: berkedip selama menyambung, menyala tetap begitu tersambung. Belum punya papan? Lihat catatan Wokwi di akhir bagian ini.
>
> **Node 1 masih hidup dari *charger*-nya sejak Modul 9?** Pindahkan dulu ke laptop dengan urutan aturan emas, sama seperti Praktik 1.5 Modul 9: **matikan MB102**, cabut kabel USB papan Node 1 dari *charger*, lalu colokkan ke laptop. Biarkan MB102 mati sampai Praktik 8.

1. Di Arduino IDE, buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan dengan nama `modul10_halo_wifi` di folder `modul-10` repositori `belajar-iot` (buat foldernya kalau belum ada, seperti modul-modul sebelumnya).

   ```cpp
   // Modul 10 - Kemenangan Cepat: ESP32 menyapa WiFi rumahmu
   // Nama dan kata sandi WiFi TIDAK ditulis di file ini, tetapi di tab secrets.h.
   // LED status D4 berkedip selama menyambung, lalu menyala tetap begitu tersambung.

   #include <WiFi.h>     // ikut paket esp32, tidak perlu dipasang
   #include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

   const int PIN_LED_STATUS = 4;              // LED status meja kerja (Modul 2)
   const unsigned long BATAS_TUNGGU = 20000;  // menyerah setelah 20 detik

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED_STATUS, OUTPUT);
     Serial.println();
     Serial.printf("Menyambung ke WiFi \"%s\"", WIFI_NAMA);

     WiFi.mode(WIFI_STA);  // STA (station) = ESP32 menumpang di jaringan router, seperti HP-mu
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);

     // Menunggu di setup() boleh untuk Kemenangan Cepat ini: hanya sekali, dan watchdog belum mengawasi.
     // Konsep 4 membahas cara menyambung yang tidak pernah membuat program macet.
     bool ledNyala = false;
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < BATAS_TUNGGU) {
       ledNyala = !ledNyala;
       digitalWrite(PIN_LED_STATUS, ledNyala);  // kedip selama menunggu
       Serial.print(".");
       delay(250);
     }
     Serial.println();

     if (WiFi.status() != WL_CONNECTED) {
       digitalWrite(PIN_LED_STATUS, LOW);
       Serial.println("Belum tersambung setelah 20 detik. Periksa nama dan kata sandi di tab secrets.h.");
       return;
     }
     digitalWrite(PIN_LED_STATUS, HIGH);  // menyala tetap = tersambung
     Serial.printf("Tersambung dalam %lu ms!\n", millis() - mulai);
     Serial.print("Alamat IP ESP32 : ");
     Serial.println(WiFi.localIP());
     Serial.printf("Kekuatan sinyal : %d dBm\n", WiFi.RSSI());
   }

   void loop() {
     // Kosong: semua pekerjaan Kemenangan Cepat ada di setup().
   }
   ```

2. Buat tab baru untuk rahasiamu: klik tombol **⋯** (tiga titik) di ujung kanan deretan tab, pilih **New Tab** (pintasannya **Ctrl + Shift + N**), ketik **`secrets.h`** (lengkap dengan akhirannya), lalu klik **OK**. Tempel isi ini ke tab yang baru terbuka:

   ```cpp
   // secrets.h - RAHASIA: nama dan kata sandi WiFi-mu.
   // File ini CONTOH. Ganti kedua teks di bawah dengan nama dan kata sandi WiFi 2,4 GHz milikmu.
   // Di repositorimu sendiri, secrets.h diabaikan Git lewat .gitignore (Modul 10, Praktik 1)
   // sehingga kata sandimu tidak pernah ikut terunggah ke GitHub.
   #pragma once

   const char WIFI_NAMA[] = "NamaWiFiRumahmu";   // nama WiFi (SSID), huruf besar-kecil harus sama persis
   const char WIFI_SANDI[] = "KataSandiWiFimu";  // kata sandi WiFi
   ```

3. **Ganti kedua teks contoh** dengan nama dan kata sandi WiFi-mu. Petik gandanya jangan ikut terhapus. Kalau kata sandimu mengandung tanda petik ganda (`"`) atau garis miring terbalik (`\`), tulis masing-masing sebagai `\"` dan `\\`. Nama WiFi harus sama persis, termasuk huruf besar-kecil dan spasinya: `RumahKita` berbeda dengan `rumahkita`. Simpan dengan **Ctrl + S**.
4. Pastikan papan yang terpilih **DOIT ESP32 DEVKIT V1** dan port-nya benar, lalu klik **Upload**. Begitu `Done uploading` muncul, buka **Serial Monitor** (**115200 baud**). Kalau baris pertama tidak terlihat, tekan tombol **EN** di papan ESP32.

   **Hasilnya** (contoh; jumlah titiknya bergantung pada lama menyambung):

   ```text
   Menyambung ke WiFi "RumahKita"..........
   Tersambung dalam 2499 ms!
   Alamat IP ESP32 : 192.168.1.23
   Kekuatan sinyal : -58 dBm
   ```

Selamat — ESP32-mu baru saja bergabung dengan jaringan rumahmu, sama seperti HP dan laptopmu. Perhatikan tiga hal:

- **ESP32 mendapat alamat IP**, misalnya `192.168.1.23`. Alamat itu diberikan router, seperti nomor rumah yang dibagikan pengelola perumahan kepada warga baru (Konsep 1).
- **Kekuatan sinyalnya ditulis dalam dBm dan selalu negatif.** Makin dekat ke 0, makin kuat: −50 dBm sangat kuat, sedangkan −85 dBm sudah lemah (Konsep 2).
- **Kata sandi WiFi tidak ada di tab utama**, melainkan di tab `secrets.h`. Tab utama boleh dibagikan; `secrets.h` tidak. **Jangan *commit* folder `modul-10` dulu** sebelum Praktik 1: di sana kita memasang "penjaga" supaya GitHub Desktop tidak pernah mengunggah `secrets.h`.

Tidak tersambung setelah 20 detik? Jangan panik. Penyebab paling sering adalah salah ketik nama atau kata sandi, atau WiFi-mu hanya memancarkan 5 GHz. Buka "Titik-titik terus muncul, lalu `Belum tersambung setelah 20 detik`" di 🚨.

> 🖥️ **Mencoba di Wokwi?** Buka proyek ESP32 baru di [wokwi.com](https://wokwi.com), tempel kode tab utama ke `sketch.ino`, lalu buat file **`secrets.h`** lewat **▾ → New file...** (seperti di Modul 8). Isi file itu dengan nama jaringan simulasi Wokwi:
>
> ```cpp
> // secrets.h untuk Wokwi: jaringan simulasi Wokwi-GUEST tidak memakai kata sandi.
> #pragma once
>
> const char WIFI_NAMA[] = "Wokwi-GUEST";
> const char WIFI_SANDI[] = "";
> ```
>
> Wokwi menyambung ke jaringan `Wokwi-GUEST` dan mendapat alamat seperti `10.10.0.2`. LED status D4 tidak ada di proyek kosong ini; yang penting adalah tulisan di Serial Monitor.

---

## 🧠 Konsep "Mengapa"

Sepuluh konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–3 → Praktik 1–2 (penjaga rahasia dan kenali jaringanmu)
2. Konsep 4 → Praktik 3 (uji cabut router)
3. Konsep 5 → Praktik 4 (portal WiFi)
4. Konsep 6 → Praktik 5 (jam dari internet)
5. Konsep 7–8 → Praktik 6–7 (cuaca dari internet dan kirim bacaan ke laptop)
6. Konsep 9 → Praktik 8–9 (sakelar lampu dari HP dan alamat tetap)
7. Konsep 10 → 🧩 Tantangan → ➕ Rumah Pintar Mini (Node 1 v1.1) → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba kode di bagian Konsep?** Tidak wajib — semua kode akan kamu jalankan di Praktik. Kode di bagian Konsep hanya potongan; versi utuhnya ada di sketsa Praktik dan di folder [`kode/`](kode/).

### 1. Jaringan rumah: router, alamat IP, dan alamat MAC

Bayangkan jaringan rumahmu sebagai sebuah **perumahan berpagar**. Laptop, HP, televisi pintar, dan sekarang ESP32 adalah rumah-rumah di dalamnya. **Router** adalah pos satpam sekaligus kantor pengelolanya: satu-satunya gerbang keluar-masuk, dan tempat warga baru mendapat nomor rumah.

![Diagram jaringan rumah sebagai perumahan berpagar: router membagikan nomor rumah (alamat IP lokal), dan setiap perangkat punya nomor KTP (alamat MAC). Di dalam pagar putus-putus, jaringan rumahmu dengan blok 192.168.1.x: laptop dengan IP 192.168.1.10 yang menjalankan penerima-webhook.js di port 3000; HP dengan IP 192.168.1.42, browser untuk /on dan /off; serta ESP32 (Node 1) dengan IP 192.168.1.23 dan MAC A4:CF:12:E5:B7:C0, yang menjadi device_id a4cf12e5b7c0 (Lampiran A). Ketiganya tersambung lewat WiFi ke router, si pos satpam, beralamat 192.168.1.1 (gateway), yang membagi nomor lewat DHCP dan menjadi gerbang ke internet. Di luar pagar, internet: alamat perumahanmu di jalan raya 203.0.113.7 (IP publik), server cuaca api.open-meteo.com (Praktik 6), dan server jam pool.ntp.org (Praktik 5); nama diubah menjadi nomor dengan bertanya ke DNS. Catatan bawah: surat dari internet hanya sampai di pos satpam; orang di luar tidak bisa langsung mengetuk ESP32-mu](aset/jaringan-rumah.png)

- **Alamat IP lokal** adalah **nomor rumah di dalam perumahan**, misalnya `192.168.1.23`. Setiap perangkat yang tersambung mendapat satu nomor, dan dengan nomor itulah perangkat saling mengirim surat. Nomor ini hanya berlaku di dalam pagar: perumahan tetangga juga punya rumah bernomor `192.168.1.23`, dan keduanya tidak pernah tertukar.
- **Alamat IP publik** adalah **alamat perumahan di jalan raya**. Seluruh rumah di dalam pagar berbagi satu alamat ini saat berhubungan dengan internet. Surat dari luar hanya sampai di pos satpam; satpam meneruskannya ke rumah yang memang sedang menunggu balasan. Karena itu, orang di internet **tidak bisa** langsung mengetuk ESP32-mu. Untuk latihan minggu ini, itu kabar baik.
- **DHCP** adalah **petugas pembagi nomor rumah**. Begitu ESP32 masuk, ia meminta nomor, dan router meminjamkan nomor yang sedang kosong untuk sementara waktu (biasanya beberapa jam sampai beberapa hari). Masa pinjam itu diperpanjang otomatis, tetapi nomornya **bisa berganti**, misalnya setelah router dinyalakan ulang. Di Konsep 9, kita minta router memberi Node 1 nomor yang selalu sama.
- ***Gateway*** (gerbang) adalah **nomor pos satpam itu sendiri**, biasanya berakhiran `.1`, misalnya `192.168.1.1`. Surat untuk rumah di luar pagar selalu dititipkan ke sana. (Jangan tertukar dengan *gateway* Raspberry Pi di Modul 12: itu "kantor pos" data IoT di rumah, perannya berbeda.)
- **Alamat MAC** adalah **nomor KTP perangkat**: dicetak pabrik di chip, tidak berubah, dan berbeda untuk setiap perangkat. Bentuknya enam pasang angka heksadesimal, misalnya `A4:CF:12:E5:B7:C0`. Router mengenali perangkat dari nomor ini. Kontrak data proyek kita ([Lampiran A Silabus](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini)) memakainya sebagai **`device_id`**: kedua belas angkanya ditulis huruf kecil tanpa titik dua, misalnya `a4cf12e5b7c0`.
- **DNS** adalah **buku telepon**. Manusia mengingat nama seperti `api.open-meteo.com`, sedangkan perangkat butuh alamat IP. Sebelum mengirim surat ke sebuah nama, ESP32 lebih dulu bertanya ke DNS, "Nama ini nomornya berapa?"

**Mana yang tetangga, mana yang bukan?** Dua perangkat bertetangga kalau bagian depan alamatnya sama. Seberapa panjang "bagian depan" itu ditentukan oleh ***subnet mask*** (penanda blok): `255.255.255.0` berarti tiga angka pertama harus sama. Jadi, `192.168.1.23` dan `192.168.1.10` bertetangga, sedangkan `192.168.0.10` sudah di luar blok dan tidak bisa langsung dihubungi. Rentang alamat seperti `192.168.x.x` dan `10.x.x.x` memang khusus untuk jaringan di dalam pagar, tidak pernah dipakai di internet.

### 2. WiFi untuk ESP32: hanya 2,4 GHz, dan kuat-lemahnya sinyal

WiFi adalah **radio**. Router rumah biasanya memancarkan di dua "jalur" (*band*) frekuensi:

| | 2,4 GHz | 5 GHz |
| :--- | :--- | :--- |
| Jangkauan | lebih jauh, lebih mudah menembus dinding | lebih pendek |
| Kecepatan | cukup untuk IoT | lebih cepat, cocok untuk video |
| ESP32 di papan DevKit V1 | ✅ bisa | ❌ **tidak bisa** |

Chip ESP32 di papanmu **hanya punya radio 2,4 GHz**. Akibatnya, ESP32 **sama sekali tidak melihat** jaringan yang hanya memancarkan 5 GHz. Untuk perangkat IoT, itu bukan kekurangan: data sensor itu kecil, sedangkan jangkauan yang lebih jauh justru menolong.

![Diagram dua jalur WiFi: ESP32 hanya mendengar 2,4 GHz, sedangkan HP dan laptop bisa memakai yang mana saja. Router rumah memancarkan gelombang 2,4 GHz yang renggang (jangkauan jauh, menembus dinding) dan gelombang 5 GHz yang rapat (lebih cepat, jangkauan pendek). Kartu ESP32 (DevKit V1): mendengar 2,4 GHz, tuli terhadap 5 GHz; jaringan 5 GHz tidak pernah terlihat. Tiga keadaan di bawahnya: satu nama untuk dua jalur, misalnya RumahKita (2,4 + 5 GHz), biasanya bisa karena ESP32 memakai jalur 2,4 GHz-nya; dua nama berbeda, RumahKita dan RumahKita_5G, pilih nama tanpa 5G; hanya 5 GHz, misalnya KantorKu_5G, tidak terlihat, jadi nyalakan 2,4 GHz atau pakai hotspot HP](aset/dua-jalur-wifi.png)

Ada tiga keadaan yang perlu kamu kenali:

- **Satu nama untuk dua jalur** (sering disebut *band steering* atau Smart Connect). Banyak router modern memakai nama yang sama untuk 2,4 dan 5 GHz. Biasanya ESP32 tetap bisa masuk lewat jalur 2,4 GHz-nya. Kalau gagal, beri jalur 2,4 GHz nama sendiri (misalnya `RumahKita-2G`) atau matikan sementara fitur penggabungannya di halaman admin router.
- **Dua nama berbeda**, misalnya `RumahKita` dan `RumahKita_5G`. Pilih nama yang **tanpa** 5G.
- **Hanya 5 GHz** (jarang di rumah, lebih sering di kantor), atau jalur 2,4 GHz-nya dimatikan. ESP32 tidak akan pernah melihatnya. Nyalakan jalur 2,4 GHz di halaman admin router (minta izin pemiliknya), atau pakai *hotspot* HP.

> 📱 **Memakai *hotspot* HP sebagai WiFi cadangan?** Pastikan *hotspot*-nya memancar di 2,4 GHz:
>
> - **Samsung Galaxy:** **Pengaturan → Koneksi → Hotspot Seluler dan Penambatan → Hotspot Seluler → Konfigurasi**, lalu ubah **Band** menjadi **2,4 GHz**.
> - **Android lain**, misalnya Pixel: **Settings → Network & internet → Hotspot & tethering → Wi‑Fi hotspot**, lalu pilih **2.4 GHz** di **Speed & compatibility**, atau nyalakan **Extend compatibility** di versi Android yang lebih lama. Nama menunya bisa sedikit berbeda di setiap merek.
> - **iPhone:** nyalakan **Maximize Compatibility** di **Settings → Personal Hotspot**. Namun, *hotspot* iPhone memutus perangkat lain yang diam selama 90 detik, dan tidak dirancang untuk perangkat yang saling berkirim data. Untuk modul ini, *hotspot* Android atau laptop lebih cocok.
> - **Laptop Windows 11:** **Settings → Network & internet → Mobile hotspot**, buka **Properties**, klik **Edit**, lalu pilih **2.4 GHz** di **Network band**.

**Gembok jaringannya juga penting.** Jaringan rumah biasanya memakai **WPA2** atau campuran **WPA2/WPA3**, dan keduanya bisa dipakai ESP32. Paket esp32 versi 3 juga mengenal WPA3. Yang ditolak ESP32 adalah gembok lama, yaitu **WEP** dan **WPA** generasi pertama. Kalau routermu masih memakainya, ubah menjadi **WPA2-PSK (AES)** atau **WPA2/WPA3** di halaman admin router; gembok lama itu memang sudah tidak aman. Tiga jenis jaringan lain juga tidak cocok untuk modul ini:

- **WiFi dengan halaman *login***, seperti di hotel, kafe, dan sebagian kos atau kampus. ESP32 tidak punya browser untuk masuk.
- **WiFi kantor atau kampus yang meminta nama pengguna dan kata sandi pribadi** (WPA2-Enterprise, misalnya eduroam). ESP32 sebenarnya bisa, tetapi kodenya berbeda, portal WiFi kita tidak bisa mengisinya, dan menyimpan akun kampusmu di papan latihan bisa melanggar aturan kampus.
- **Jaringan tamu** (*guest*) atau jaringan yang **mengisolasi perangkat**. Perangkat di jaringan seperti ini sengaja dibuat tidak bisa saling menghubungi, padahal minggu ini ESP32, laptop, dan HP harus saling berkirim surat.

Untuk semua itu, pakai *hotspot* HP. Satu lagi: kalau nama WiFi rumahmu disembunyikan (*hidden*), tampilkan lagi selama mengerjakan modul ini.

**Kekuatan sinyal** dibaca ESP32 sebagai **RSSI** (*Received Signal Strength Indicator*, penunjuk kekuatan sinyal) dalam satuan **dBm**. Angkanya selalu negatif, dan **makin dekat ke 0, makin kuat**:

| RSSI | Artinya |
| :--- | :--- |
| −55 dBm ke atas (misalnya −45) | sangat kuat |
| −56 sampai −67 dBm | kuat: semua lancar |
| −68 sampai −75 dBm | cukup: masih aman untuk data sensor |
| −76 sampai −85 dBm | lemah: kiriman sesekali gagal, sambungan mudah putus |
| di bawah −85 dBm | sangat lemah: sering putus |

Skalanya tidak lurus seperti penggaris: setiap kali angkanya turun **3** (misalnya dari −50 ke −53 dBm), kekuatan sinyalnya tinggal **separuh**. Dinding bata, lemari besi, dan tandon air bisa membuat angka itu turun belasan. Kalau Node 1 kelak dipasang jauh dari router, periksa angka ini dulu.

### 3. Rahasia tidak ditulis di kode: `secrets.h` dan `.gitignore`

Di Kemenangan Cepat, nama dan kata sandi WiFi kita taruh di tab terpisah, `secrets.h`, lalu dipanggil dari tab utama dengan satu baris:

```cpp
#include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI
```

`#include` sebenarnya berarti "tempelkan isi file itu di sini saat dikompilasi" (🔬 Modul 3). Hasil kompilasinya sama saja dengan menulis kata sandi di tab utama. Bedanya ada pada **siapa yang boleh melihat file itu**.

Repositori `belajar-iot`-mu terbuka untuk umum di GitHub. Di sana ada program-program otomatis (*bot*) yang terus memindai repositori baru untuk mencari kata sandi dan kunci rahasia yang tidak sengaja terunggah. Kata sandi WiFi yang bocor memang tidak membuka rekening bankmu, tetapi siapa pun yang berada di dekat rumahmu bisa masuk ke jaringan rumahmu. Di dalam jaringan itu ada Node 1, dan mulai Praktik 8, lampunya bisa dinyalakan dan dimatikan siapa saja **tanpa kata sandi**.

Karena itu, kita memisahkan dua jenis file:

| | Tab utama (`.ino`) | `secrets.h` |
| :--- | :--- | :--- |
| Isinya | cara kerja program | nama dan kata sandi WiFi |
| Di laptopmu | ✅ ada | ✅ ada |
| Di GitHub | ✅ di-*commit* dan di-*push* | ❌ **tidak pernah** |

Yang menjaga pemisahan ini adalah **`.gitignore`**, daftar "jangan dicatat" yang sudah kamu kenal di Modul 4 (waktu itu untuk `node_modules/`). Satu baris `secrets.h` di file `.gitignore` di folder utama repositori berarti: **semua file bernama `secrets.h`, di folder mana pun**, tidak pernah dicatat Git. GitHub Desktop pun tidak lagi menampilkannya di daftar **Changes**, jadi tidak mungkin ikut ter-*commit*.

Dua hal yang sering terlewat:

- **`.gitignore` hanya menjaga file yang belum pernah di-*commit*.** File yang telanjur tercatat tetap diikuti Git walaupun namanya kemudian ditulis di `.gitignore`. Itulah sebabnya penjaganya kita pasang **sekarang**, sebelum *commit* pertama minggu ini.
- **Kalau kata sandi telanjur ter-*push***, menghapus filenya dari GitHub tidak cukup karena isinya masih tersimpan di riwayat (*history*) repositori. Anggap kata sandinya sudah bocor: **ganti kata sandi WiFi di router**, lalu perbarui `secrets.h`-mu. Langkah lengkapnya ada di 🚨.

Folder [`kode/`](kode/) kurikulum ini juga berisi `secrets.h`, tetapi isinya hanya contoh (`NamaWiFiRumahmu`), bukan kata sandi sungguhan, sehingga aman dibagikan. Di Konsep 5, kita melangkah lebih jauh: Node 1 menerima nama dan kata sandi WiFi lewat **portal di HP** sehingga kata sandi tidak tertulis di kode mana pun.

> ➡️ **Saatnya praktik!** Konsep 1–3 cukup untuk [Praktik 1 — Pasang penjaga rahasia](#praktik-1--pasang-penjaga-rahasia-10-menit) dan [Praktik 2 — Kenali jaringanmu](#praktik-2--kenali-jaringanmu-20-menit). Setelah itu, kembali ke Konsep 4.

### 4. Menyambung tanpa macet, lalu tersambung lagi sendiri

Menyambung ke WiFi ternyata terdiri atas tiga langkah, dan semuanya butuh waktu:

1. **Mencari** jaringan bernama sama dengan `WIFI_NAMA` di semua kanal radio (sekitar 1–2 detik).
2. **Mengetuk pintu** dengan kata sandi, lalu bertukar "kunci rahasia" dengan router.
3. **Meminta nomor rumah** (alamat IP) dari DHCP.

Biasanya semuanya selesai dalam 1–5 detik. Kalau sinyalnya lemah, lebih lama lagi. Kalau router sedang mati, tidak akan pernah selesai.

**Cara Kemenangan Cepat menunggu tidak boleh dipakai di `loop()`.** Di sana kita menulis `while (WiFi.status() != WL_CONNECTED) { … delay(250); }`. Untuk sekali jalan di `setup()`, itu tidak apa-apa. Namun, bayangkan pola yang sama di `loop()` Node 1 saat router mati selama sepuluh menit: selama itu, sensor tidak dibaca, tombol tidak dilayani, pompa tidak dimatikan tepat waktu, dan setelah 5 detik *watchdog* Modul 8 menganggap Node 1 macet lalu me-*restart*-nya. Berulang-ulang. Padahal Node 1 tetap bisa bekerja tanpa jaringan: menyiram tanaman dan menyalakan lampu otomatis tidak butuh internet.

Aturan kita sejak minggu ini: **WiFi boleh putus, Node 1 tidak boleh berhenti.**

Kabar baiknya, paket esp32 sudah menyiapkan hampir semuanya:

- **`WiFi.begin()` tidak menunggu.** Ia hanya memulai proses menyambung, lalu langsung kembali. Pekerjaan radionya dikerjakan "petugas" lain di dalam chip selagi `loop()` terus berputar.
- **Sambung ulang otomatis** (*auto reconnect*) sudah menyala sejak awal. Kalau sambungan putus karena router mati atau sinyal hilang, paket esp32 mencoba menyambung lagi setiap beberapa detik, **terus-menerus**, sampai berhasil. Pengecualiannya sedikit: pemutusan yang disengaja oleh programmu sendiri (`WiFi.disconnect()`) dan penolakan tegas dari router, misalnya kode 202 di tabel di bawah.

Tugas kita tinggal **mengamati tanpa menunggu**. Ada dua caranya:

- **Bertanya kapan saja** dengan `WiFi.status()`. Jawabannya `WL_CONNECTED` kalau sudah tersambung dan sudah punya alamat IP. Pertanyaan ini dijawab seketika, jadi aman ditanyakan di `loop()`.
- **Dikabari lewat peristiwa** (*event*). Kita mendaftarkan sebuah fungsi dengan `WiFi.onEvent(saatPeristiwaWiFi)`, lalu paket esp32 memanggilnya setiap kali ada kejadian. Mirip bel pintu: kita tidak perlu bolak-balik mengintip, cukup menunggu bel berbunyi. Dua peristiwa yang kita pakai adalah **`ARDUINO_EVENT_WIFI_STA_GOT_IP`** (sudah dapat nomor rumah) dan **`ARDUINO_EVENT_WIFI_STA_DISCONNECTED`** (sambungan putus atau percobaan menyambung gagal, lengkap dengan kode alasannya).

![Garis waktu uji cabut router selama 180 detik: WiFi boleh putus, loop() tidak boleh berhenti; paket esp32 menyambung ulang sendiri, sketsa hanya mengamati. Baris Router: menyala, dimatikan 1 menit, dinyalakan dan sedang bangun (1 sampai 3 menit), lalu siap. Baris WiFi: peristiwa GOT_IP di awal; peristiwa WiFi PUTUS dengan alasan 200 tak lama setelah router mati; deretan percobaan ulang setiap beberapa detik dengan alasan 201 (NO_AP_FOUND); lalu GOT_IP, tersambung LAGI, begitu router siap. Baris loop(): berputar terus sepanjang waktu mengurus LED status dan laporan setiap 10 detik, dengan putaran terlama 1 milidetik. Baris LED D4: menyala tetap saat tersambung, berkedip cepat selama putus, lalu menyala tetap lagi. Catatan bawah: peristiwa WiFi dari petugas lain menaikkan bendera, lalu loop() menurunkan bendera dan mencetak pesan, seperti interrupt di Modul 8; Node 1 v1.1 memakai pola yang sama, jadi sensor, tombol, pompa, dan layar tetap bekerja selama WiFi putus](aset/sambung-ulang.png)

Fungsi peristiwa dipanggil oleh "petugas" WiFi, **bukan** oleh `loop()`. Aturannya sama dengan fungsi *interrupt* (fungsi yang dipanggil chip secara mendadak, menyela pekerjaan lain) di 🔬 Modul 8: **sesingkat mungkin**. Cukup menaikkan "bendera" (variabel `volatile bool`), lalu `loop()` yang menurunkannya dan mencetak pesannya:

```cpp
volatile bool benderaDapatIp = false;  // volatile: bisa berubah "diam-diam" dari luar loop()

void saatPeristiwaWiFi(arduino_event_id_t peristiwa, arduino_event_info_t info) {
  if (peristiwa == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
    benderaDapatIp = true;  // hanya menaikkan bendera; mencetak dikerjakan loop()
  }
}

void loop() {
  if (benderaDapatIp) {
    benderaDapatIp = false;  // turunkan benderanya
    Serial.println("Tersambung!");
  }
  // ... pekerjaan lain tetap berjalan, tersambung atau tidak
}
```

**Kode alasan** di peristiwa putus sangat membantu saat berburu masalah. Yang paling sering muncul:

| Kode | Nama di paket esp32 | Biasanya artinya |
| :--- | :--- | :--- |
| 200 | `BEACON_TIMEOUT` | Sinyal router tiba-tiba hilang: router mati, atau papan terlalu jauh. |
| 201 | `NO_AP_FOUND` | Nama WiFi tidak ditemukan: router mati, nama salah ketik, atau WiFi-nya hanya 5 GHz. |
| 15 atau 204 | `4WAY_HANDSHAKE_TIMEOUT`, `HANDSHAKE_TIMEOUT` | Pertukaran kunci gagal. Hampir selalu: **kata sandi salah**. Paket esp32 terus mencoba, jadi tanpa kode ini yang terlihat hanyalah "belum tersambung". |
| 202 | `AUTH_FAIL` | Router menolak perangkat ini, misalnya karena router hanya mengizinkan alamat MAC tertentu (*MAC filter*). Tidak disambung ulang otomatis. |
| 210 atau 211 | (tanpa nama di paket esp32) | WiFi bernama itu ada, tetapi gemboknya tidak cocok: misalnya kata sandi diisi untuk WiFi terbuka seperti `Wokwi-GUEST`, atau router masih memakai gembok lama (WEP atau WPA). Tidak disambung ulang otomatis. |
| 8 | `ASSOC_LEAVE` | Programmu sendiri yang memutus (`WiFi.disconnect()`). Tidak disambung ulang otomatis. |

Untuk Node 1, kita menambahkan satu **penjaga cadangan** di bagian ➕: kalau selama 60 detik tidak ada percobaan baru, Node 1 sendiri yang menyuruh paket esp32 mencoba lagi. Penjaga kecil ini melindungi Node 1 dari keadaan langka yang tidak ditangani sambung ulang otomatis.

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 3 — Uji cabut router](#praktik-3--uji-cabut-router-25-menit), lalu kembali ke Konsep 5.

### 5. Portal WiFi seperti di hotel: WiFiManager

File `secrets.h` sudah menjauhkan kata sandi dari GitHub, tetapi masih ada dua kerepotan. Pertama, kata sandi tetap tertulis di laptopmu dan ikut tertanam di program. Kedua, setiap kali WiFi rumah berganti nama atau kata sandi, Node 1 harus dicolokkan lagi ke laptop, lalu programnya diunggah ulang. Bayangkan kalau Node 1 sudah terpasang di plafon.

Perangkat pintar yang kamu beli di toko, misalnya lampu pintar atau CCTV, tidak pernah meminta kita mengunggah program. Perangkat semacam itu memakai cara lain: saat pertama dinyalakan, ia **memancarkan WiFi-nya sendiri** untuk sementara. Kita menyambungkan HP ke WiFi itu, lalu muncul halaman kecil untuk memilih WiFi rumah dan mengetik kata sandinya. Mirip **WiFi hotel**: begitu tersambung, halaman *login* muncul sendiri.

Library **WiFiManager** memberi kemampuan yang sama kepada ESP32:

1. Saat menyala, ESP32 memeriksa: **apakah sudah ada WiFi tersimpan?**
2. **Belum ada** (atau kita memintanya): ESP32 berubah menjadi ***access point*** (titik akses, "router mini") bernama misalnya `Node1-Rumah`, lalu membuka **portal**: halaman web kecil di alamat `192.168.4.1`.
3. Kamu menyambungkan HP ke `Node1-Rumah`, memilih WiFi rumah dari daftar, mengetik kata sandinya, lalu menyimpannya.
4. Nama dan kata sandinya **disimpan di NVS** (lemari arsip dari Modul 8), lalu ESP32 mencoba menyambung. Kalau berhasil, portal ditutup. Kalau gagal, portal tetap terbuka supaya kamu bisa mengisi ulang; isian yang salah tadi sudah telanjur tersimpan, jadi ulangi sampai berhasil.
5. **Sudah ada WiFi tersimpan:** ESP32 langsung menyambung, tanpa portal.

![Diagram alir portal WiFi seperti di hotel (WiFiManager): nama dan kata sandi WiFi diisi lewat HP, lalu disimpan di NVS, tidak ada di kode mana pun. ESP32 menyala dan memeriksa NVS: sudah ada WiFi tersimpan? Kalau ya, ESP32 langsung menyambung ke WiFi rumah memakai WiFi yang tersimpan di NVS, tanpa portal. Kalau belum, atau tombol D13 ditahan, ESP32 menjadi titik akses bernama Node1-Rumah dengan portal di 192.168.4.1; HP menyambung ke Node1-Rumah, memilih WiFi rumah, mengisi kata sandi, dan mengetuk Save; WiFi itu disimpan di NVS milik WiFi (lemari arsip Modul 8), lalu ESP32 menyambung. Catatan di HP: iPhone biasanya langsung membuka lembar login; Android menampilkan pemberitahuan Sign in to Wi-Fi network, tetapi di sebagian HP tidak muncul; jalan keluarnya: matikan data seluler, pilih tetap tersambung, lalu buka http://192.168.4.1 di browser; portal menutup sendiri setelah 3 menit kalau tidak dipakai](aset/portal-wifi.png)

Hasilnya, **kata sandi WiFi tidak tertulis di kode mana pun**: tidak di tab utama, tidak di `secrets.h`, tidak di GitHub. Itulah yang dipakai Node 1 v1.1 di bagian ➕. Sketsa-sketsa latihan minggu ini tetap memakai `secrets.h` karena lebih cepat dicoba berulang kali.

**Muncul sendiri, atau harus dibuka?** Portal **WiFiManager** menjawab setiap pertanyaan ke "buku telepon" (DNS, Konsep 1) dengan `192.168.4.1` sehingga HP biasanya mengira sedang masuk ke WiFi hotel. iPhone langsung membuka lembar *login*, dan Android menampilkan pemberitahuan untuk masuk ke jaringan (di HP berbahasa Inggris: **Sign in to Wi-Fi network**). Namun, di sebagian HP Android pemberitahuan itu tidak muncul, atau HP malah menawarkan pindah jaringan karena WiFi ini "tidak punya akses internet". Jalan keluarnya selalu sama: **matikan data seluler**, pilih tetap tersambung, lalu buka `http://192.168.4.1` di browser. Itulah maksud catatan Silabus "di Android pop-up sering tidak muncul".

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 4 — Portal WiFi seperti di hotel](#praktik-4--portal-wifi-seperti-di-hotel-25-menit), lalu kembali ke Konsep 6.

### 6. Jam dari internet: NTP, zona waktu, dan cap waktu `ts`

Papan ESP32 DevKit V1 **tidak punya jam berbaterai**, seperti jam dinding yang ikut berhenti begitu baterainya dicabut. Selama menyala, chipnya memang menghitung waktu dengan tekun: itulah `millis()` dan *uptime* di Modul 8. Masalahnya, hitungan itu selalu dimulai dari nol. Setiap kali menyala, ESP32 mengira sekarang **1 Januari 1970, pukul 00.00**. Tanggal itu bukan sembarangan: itulah "hari nol" yang dipakai hampir semua komputer di dunia untuk menghitung waktu.

Obatnya adalah **NTP** (*Network Time Protocol*, protokol waktu jaringan): ESP32 menanyakan jam ke **server waktu** di internet, yang jamnya terus dicocokkan dengan jam atom. Mirip mencocokkan jam tangan dengan jam stasiun yang selalu tepat. Lewat WiFi, selisihnya biasanya hanya beberapa perseratus detik, jauh lebih teliti daripada yang kita butuhkan.

![Diagram jam dari internet: satu angka detik, dua cara membacanya. ESP32 yang baru menyala mengira sekarang 1 Januari 1970 karena tidak punya jam berbaterai. Ia bertanya jam berapa ke pool.ntp.org, server waktu yang dicocokkan dengan jam atom dan ditanya lagi setiap 3 jam, yang menjawab dalam UTC. Jawaban itu menyetel jam ESP32, yang terbaca sebagai angka time(nullptr), misalnya 1792194431 detik sejak 1 Januari 1970 pukul 00.00 UTC. Untuk manusia, localtime_r() dengan zona WIB-7 menjadi Sabtu, 17 Oktober 2026 pukul 06:47:11 WIB, untuk layar, halaman web, dan dashboard (Modul 22). Untuk data, gmtime_r() menjadi ts 2026-10-16T23:47:11Z (Lampiran A): Z berarti UTC, dibuat perangkat saat bacaan diambil, dan tanggalnya bisa berbeda dengan tanggal setempat. Baris bawah, zona waktu POSIX dengan tanda dibalik: WIB-7 berarti UTC+7, WITA-8 berarti UTC+8, dan WIT-9 berarti UTC+9](aset/jam-ntp.png)

Di paket esp32, semuanya cukup satu baris:

```cpp
configTzTime("WIB-7", "pool.ntp.org", "asia.pool.ntp.org");  // zona waktu, server utama, server cadangan
```

- **`pool.ntp.org`** adalah kumpulan ribuan server waktu sukarelawan di seluruh dunia; ia otomatis memilihkan server yang dekat denganmu. Cadangannya, `asia.pool.ntp.org`, khusus berisi server di Asia.
- Baris ini **tidak menunggu**. ESP32 bertanya di belakang layar, dan jawabannya biasanya datang dalam beberapa detik. Sengaja ada jeda acak 0–5 detik sebelum pertanyaan pertama supaya jutaan perangkat yang menyala bersamaan, misalnya saat listrik kembali setelah padam, tidak bertanya serentak. Setelah itu, ESP32 menanyakan jam lagi sendiri **setiap 3 jam** supaya jamnya tidak melenceng.
- Sebelum jawaban pertama datang, jamnya masih tahun 1970. Programmu harus memeriksanya dulu, seperti di Praktik 5.
- Panggil baris ini **setelah** ESP32 mendapat alamat IP. Kalau dipanggil terlalu awal, pertanyaan pertamanya gagal, dan ESP32 baru mencoba lagi sekitar 15 detik kemudian.

**Zona waktu** ditulis menurut POSIX, aturan lama dari dunia komputer: nama zonanya, lalu selisihnya dari **UTC** (waktu universal, patokan jam sedunia) **dengan tanda dibalik**.

| Zona | Selisih dari UTC | Ditulis |
| :--- | :--- | :--- |
| WIB (Waktu Indonesia Barat) | UTC+7 | `"WIB-7"` |
| WITA (Waktu Indonesia Tengah) | UTC+8 | `"WITA-8"` |
| WIT (Waktu Indonesia Timur) | UTC+9 | `"WIT-9"` |

Ya, tanda minusnya memang terbalik. Begitulah aturan POSIX menulisnya: angkanya menyatakan "berapa jam harus ditambahkan ke jam setempat supaya menjadi UTC". Cukup dihafal saja.

**Cap waktu `ts` selalu dalam UTC.** Kontrak data kita ([Lampiran A](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini)) mewajibkan setiap data membawa `ts` sejak modul ini, dengan bentuk seperti `"2026-10-17T01:23:45Z"`:

- `2026-10-17` adalah tanggal (tahun-bulan-hari), `T` pemisah tanggal dan jam, `01:23:45` jamnya, dan **`Z`** artinya "jam UTC".
- Bentuk ini dinamai **ISO-8601**, standar internasional penulisan tanggal-jam. Urutannya dari yang terbesar ke yang terkecil, jadi bisa diurutkan seperti teks biasa.

Mengapa bukan WIB? Karena perangkat, server, dan database kita kelak bisa berada di zona yang berbeda. Misalnya, perangkat di Makassar memakai WITA, sedangkan server di Jakarta memakai WIB. Kalau semuanya mencatat dalam UTC, tidak ada yang tertukar. Jam setempat baru dihitung saat **ditampilkan** kepada manusia, misalnya di layar atau di dashboard (Modul 22). Perhatikan juga bahwa tanggalnya bisa berbeda: pukul 06.47 WIB tanggal 17 Oktober adalah pukul 23.47 UTC tanggal **16** Oktober.

Satu aturan lagi dari Lampiran A: **`ts` dibuat oleh perangkat**, pada saat bacaan diambil, bukan oleh server saat menerimanya. Karena itu, Node 1 v1.1 menahan kirimannya sampai jamnya sudah disetel dari internet. Data tanpa jam yang benar lebih menyesatkan daripada tidak ada data.

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 5 — Jam dari internet](#praktik-5--jam-dari-internet-15-menit), lalu kembali ke Konsep 7.

### 7. HTTP: surat-menyurat antarperangkat, berisi JSON

Di Modul 4, laptopmu sudah berkirim surat lewat **HTTP**: `cuaca.js` meminta data ke Open-Meteo, dan `kirim-data.js` mengirim bacaan palsu ke `penerima-webhook.js`. Minggu ini, ESP32 yang menulis suratnya. Aturannya sama persis karena HTTP adalah "tata cara surat-menyurat" yang dipakai semua perangkat di internet.

![Diagram HTTP sebagai surat-menyurat antara ESP32 (192.168.1.23) dan laptop (192.168.1.10, port 3000): 1, surat permintaan dari ESP32; 2, surat balasan dari laptop. Surat permintaan: baris POST /telemetry HTTP/1.1 (metode dan jalur); header (kepala) Host 192.168.1.10:3000, User-Agent ESP32HTTPClient, Connection keep-alive, Accept-Encoding (bentuk balasan yang bisa dibaca HTTPClient), Content-Type application/json, dan Content-Length 71; satu baris kosong; lalu body (isi) JSON berisi ts, suhu 28.5, kelembapan 71, dan cahaya 2310. Surat balasan: HTTP/1.1 200 OK, Content-Type application/json, Connection keep-alive, header lain disingkat, lalu isi {"ok":true}. Keterangan kode: 200 berarti berhasil; 4xx salah di pengirim (404: jalur tidak ada); 5xx salah di server (500); angka negatif berarti tidak ada balasan (HTTPClient). Catatan bawah: GET berarti tolong berikan, tanpa body; POST berarti terimalah kiriman ini, dengan body; header Content-Type memberi tahu jenis isinya, dan HTTPClient menghitung Content-Length sendiri](aset/surat-http.png)

Setiap percakapan HTTP terdiri atas **satu surat permintaan** dan **satu surat balasan**:

| Bagian | Permintaan (dari ESP32) | Balasan (dari server) |
| :--- | :--- | :--- |
| Baris pertama | **metode** + **jalur**, misalnya `POST /telemetry` | **kode status**, misalnya `200 OK` |
| ***Header*** (kepala surat) | keterangan tambahan, misalnya `Content-Type: application/json` | keterangan tambahan, misalnya `Content-Type: application/json` |
| ***Body*** (isi surat) | data yang dikirim, misalnya JSON bacaan sensor | data jawaban, misalnya `{"ok":true}` |

**Metode** menyatakan maksud surat. Dua yang paling sering kita pakai:

- **GET**: "tolong berikan …". Tidak berisi *body*. Dipakai untuk meminta cuaca (Praktik 6), dan juga dipakai browser setiap kali kamu membuka halaman web.
- **POST**: "terimalah kiriman ini". Berisi *body*. Dipakai untuk mengirim bacaan ke laptop (Praktik 7).

**Kode status** adalah tiga angka di awal balasan. Angka depannya sudah memberi tahu kabar baik atau buruk:

| Kode | Artinya | Contoh minggu ini |
| :--- | :--- | :--- |
| **200** OK | berhasil | cuaca terkirim, bacaan diterima |
| **404** Not Found | alamatnya tidak ada | jalur yang tidak terdaftar di server web ESP32, misalnya `/favicon.ico` (Praktik 8) |
| **500** Internal Server Error | servernya sendiri yang bermasalah | server menjawab, tetapi programnya gagal memproses suratmu |

Kode 2xx berarti berhasil, 4xx berarti **kesalahan di pihak pengirim** (alamat salah, isi tidak sesuai), dan 5xx berarti **kesalahan di pihak server**. Di ESP32, library **HTTPClient** juga bisa menjawab dengan **angka negatif**. Angka negatif bukan kode dari server, melainkan tanda bahwa **tidak ada balasan yang diterima**, misalnya `-1` (`connection refused`: suratnya tidak sampai karena server mati, alamat salah, atau diblokir) dan `-11` (`read Timeout`: suratnya sudah terkirim, tetapi server tidak membalas tepat waktu).

**Alamat (URL) dibaca dari kiri ke kanan.** Contohnya alamat penerima di laptopmu:

```text
http://192.168.1.10:3000/telemetry
└┬─┘   └────┬─────┘ └┬─┘└───┬────┘
skema    host      port   jalur
```

- **Skema** `http` atau `https`: cara mengirimnya (Konsep 8).
- ***Host*** (tuan rumah): alamat IP atau nama server, misalnya `192.168.1.10` atau `api.open-meteo.com`.
- **Port**: **nomor pintu** di *host* itu (di Modul 4 kita menyebutnya "nomor loket"). Satu komputer bisa menjalankan banyak program server, masing-masing menunggu di pintunya sendiri. `penerima-webhook.js` menunggu di pintu **3000**. Kalau port tidak ditulis, `http` memakai pintu **80** dan `https` pintu **443**.
- **Jalur** (*path*): "nama ruangan" di dalam server, misalnya `/telemetry`. Alamat Open-Meteo juga punya bagian setelah tanda `?`, yaitu ***query*** (pertanyaan tambahan) seperti `latitude=-6.2`.

**JSON di ESP32: ArduinoJson.** Di Node.js, mengubah objek menjadi teks JSON cukup dengan `JSON.stringify()`, dan sebaliknya dengan `JSON.parse()`. Di ESP32, pekerjaan yang sama dikerjakan library **ArduinoJson**:

```cpp
JsonDocument dokumen;            // "wadah" JSON
dokumen["ts"] = ts;              // isi wadah, seperti objek JavaScript
dokumen["cahaya"] = 2310;
char isi[128];
serializeJson(dokumen, isi, sizeof(isi));  // wadah -> teks, seperti JSON.stringify()
// isi sekarang: {"ts":"2026-10-17T01:23:45Z","cahaya":2310}

deserializeJson(dokumen, teksDariServer);            // teks -> wadah, seperti JSON.parse()
float suhu = dokumen["current"]["temperature_2m"];   // ambil isi yang bertingkat
```

Bacaan sensor yang gagal tetap dikirim apa adanya. Kolom `kelembapan` dan `level_air` yang gagal tetap bernilai `-1`. Kolom `suhu` yang bernilai `NAN` ditulis **ArduinoJson** sebagai **`null`** karena JSON tidak mengenal NaN. Cara resmi menuliskan bacaan gagal di JSON ditetapkan di Modul 11.

**Surat butuh waktu, dan *watchdog* hanya sabar 5 detik.** Sebuah permintaan HTTP bisa menunggu lama kalau servernya mati atau jaringannya lambat. Secara bawaan, library **HTTPClient** menunggu sampai 5 detik untuk tersambung dan 5 detik lagi untuk balasan. Karena itu, kita selalu memasang batas waktu sendiri: 5 detik untuk server di internet (Praktik 6) dan 2 detik untuk laptop di rumah (Praktik 7), dua sketsa latihan yang tidak diawasi *watchdog*, serta **1,5 detik** untuk kiriman Node 1 ke laptop. Dengan begitu, kiriman yang gagal pun tidak pernah membuat *watchdog* me-*restart* Node 1.

### 8. HTTPS dan `setInsecure()`: amplop tersegel yang kurirnya tidak diperiksa

**HTTP polos itu seperti kartu pos.** Siapa pun yang dilewati surat itu, misalnya perangkat lain di WiFi yang sama atau penyedia internetmu, bisa membacanya, bahkan mengubahnya. Untuk surat dari ESP32 ke laptopmu sendiri, di dalam jaringan rumahmu sendiri, itu masih bisa diterima untuk latihan. Itulah sebabnya Silabus mengizinkan **HTTP polos ke server buatan sendiri di jaringan rumah**, dan kuncinya baru dipasang di Fase 3 dan 5.

**HTTPS** (`https://`, huruf S untuk *secure*, aman) menambahkan dua pelindung:

1. **Amplop tersegel** (enkripsi). Isi surat diacak sehingga hanya pengirim dan penerima yang bisa membacanya.
2. **Kartu identitas kurir** (sertifikat). "Kurir" di sini adalah server yang menerima amplopmu. Ia menunjukkan sertifikat yang ditandatangani lembaga tepercaya, yang menyatakan, "Aku benar-benar `api.open-meteo.com`." Tanpa pemeriksaan ini, penipu yang menyamar sebagai server cuaca bisa ikut menerima amplop tersegelmu.

![Tiga kartu perbandingan HTTP, HTTPS dengan setInsecure(), dan HTTPS yang diperiksa; dua pelindung HTTPS adalah amplop tersegel (enkripsi) dan kartu identitas server (sertifikat). HTTP polos, seperti kartu pos: isi tidak aman dari penguping dan identitas server tidak diperiksa; dipakai untuk ESP32 ke laptopmu di rumah, sampai Fase 3 dan 5. HTTPS dengan setInsecure(), amplop tersegel, tetapi kurir tidak dicek: isi aman dari penguping, tetapi identitas server tidak diperiksa; dipakai untuk ESP32 ke API publik (Open-Meteo), sementara, sampai Modul 27. HTTPS diperiksa, amplop tersegel ditambah kartu identitas: isi aman dan identitas server diperiksa; untuk semua yang terbuka ke internet, mulai Modul 27. Catatan bawah: setInsecure() menjaga isi surat, tetapi siapa pun yang menyamar sebagai server tetap diterima; jangan dipakai untuk kata sandi atau perintah](aset/https-setinsecure.png)

Browser di laptopmu membawa daftar lembaga tepercaya itu dan selalu memeriksa sertifikat. ESP32 juga bisa, tetapi kita harus memberinya daftar itu dan memakainya dengan benar. Itu pekerjaan Modul 27, saat proyek kita benar-benar terbuka ke internet.

Untuk sementara, kita memakai **`setInsecure()`**:

```cpp
WiFiClientSecure klien;
klien.setInsecure();  // SEMENTARA: amplop tersegel, tetapi identitas server TIDAK diperiksa
```

Mari jujur tentang artinya: dengan `setInsecure()`, isi surat **tetap tersegel** dari penguping, tetapi ESP32 **tidak memeriksa** siapa yang menerimanya. Untuk meminta data cuaca yang memang terbuka untuk umum, risikonya kecil. Untuk mengirim kata sandi atau perintah yang menggerakkan sesuatu, cara ini **tidak boleh** dipakai. Setiap kali `setInsecure()` muncul di kurikulum ini, ia diberi komentar "SEMENTARA" sampai Modul 27 menggantinya.

| Cara | Dipakai untuk | Isi aman dari penguping? | Identitas server diperiksa? | Sampai kapan |
| :--- | :--- | :---: | :---: | :--- |
| HTTP polos | ESP32 → laptopmu di jaringan rumah | ❌ | ❌ | sampai Fase 3 dan 5 |
| HTTPS + `setInsecure()` | ESP32 → API publik (Open-Meteo) | ✅ | ❌ | sementara, sampai Modul 27 |
| HTTPS + sertifikat diperiksa | semua yang terbuka ke internet | ✅ | ✅ | mulai Modul 27 |

> ➡️ **Saatnya praktik!** Konsep 7–8 cukup untuk [Praktik 6 — Cuaca dari internet](#praktik-6--cuaca-dari-internet-20-menit) dan [Praktik 7 — Kirim bacaan ke laptop](#praktik-7--kirim-bacaan-ke-laptop-30-menit). Setelah itu, kembali ke Konsep 9.

### 9. ESP32 menjadi server web, dan cara menemukan alamatnya

Sejauh ini ESP32 selalu menjadi **pengirim surat** (*client*, klien): ia yang bertanya ke server NTP, ke Open-Meteo, dan ke laptopmu. Sekarang perannya kita balik. ESP32 menjadi **server**: ia menunggu, dan browser HP-mu yang datang mengetuk. Persis seperti `penerima-webhook.js` di laptopmu, hanya saja kali ini penerimanya ESP32.

![Diagram ESP32 menjadi server web: dulu ESP32 mengirim surat (klien), kini menunggu surat (server). Kiri, browser HP di alamat http://192.168.1.23/on menampilkan Lampu: MENYALA dengan tautan Nyalakan lampu dan Matikan lampu. Browser mengirim GET /on ke ESP32, WebServer di pintu 80 beralamat 192.168.1.23, yang memasang server.on untuk /, /on, dan /off serta server.onNotFound untuk 404, dan memanggil server.handleClient() di loop(). ESP32 membalas 200 dengan halaman HTML dan menggerakkan relay lampu di D32 (aktif LOW) yang berbunyi klik. Catatan bawah: handleClient() hampir tidak menunggu; tanpa kata sandi, khusus jaringan rumah, jangan pernah membuat port forwarding; di Modul 11, tautan /on dan /off dipensiunkan dan diganti dengan perintah lewat MQTT](aset/server-web.png)

Library **WebServer** bawaan paket esp32 membuatnya ringkas:

```cpp
WebServer server(80);  // menunggu di pintu 80, pintu bawaan HTTP

void tanganiOn() {
  aturLampu(true);
  server.send(200, "text/html", "<p>Lampu menyala</p>");  // kirim surat balasan
}

void setup() {
  // ... menyambung ke WiFi ...
  server.on("/on", tanganiOn);  // "kalau ada yang meminta /on, jalankan tanganiOn()"
  server.begin();
}

void loop() {
  server.handleClient();  // ada yang mengetuk? layani sebentar, lalu langsung kembali
}
```

- **`server.on("/on", tanganiOn)`** membagi tugas per jalur: `/` untuk halaman utama, `/on` untuk menyalakan, `/off` untuk mematikan. Jalur yang tidak terdaftar dijawab `404`.
- **`server.handleClient()`** hampir tidak menunggu. Kalau tidak ada browser yang mengetuk, ia kembali setelah jeda 1 milidetik. Kalau ada, ia melayani satu permintaan browser dalam beberapa milidetik, lalu kembali. Jadi, ia aman dipanggil di `loop()` Node 1 bersama sensor, tombol, dan *watchdog*.
- Membuka `http://192.168.1.23/on` di browser berarti mengirim surat **GET** `/on` ke ESP32. Browser lalu menampilkan isi balasannya, yaitu halaman HTML kecil buatan ESP32.

**Tanpa kata sandi, khusus jaringan rumah.** Server web ini sengaja polos: siapa pun yang tersambung ke WiFi rumahmu bisa menyalakan dan mematikan lampu. Untuk latihan, itu cukup. Jangan pernah membukanya ke internet lewat *port forwarding*. Mulai Modul 11, kendali lewat tautan ini dipensiunkan dan diganti dengan MQTT, lalu dikunci di Modul 20–21.

**Masalah berikutnya: alamatnya bisa berubah.** Untuk membuka halaman ESP32 dari HP, kamu perlu alamat IP-nya. Ingat Konsep 1: DHCP **meminjamkan** alamat, dan alamat itu bisa berganti, misalnya setelah router dinyalakan ulang. Tautan yang kamu simpan di HP pun bisa tiba-tiba tidak jalan. Ada beberapa cara menemukan ESP32:

| Cara | Kelebihan | Kekurangan |
| :--- | :--- | :--- |
| **Serial Monitor** | paling mudah saat praktik | butuh laptop dan kabel USB |
| **Layar OLED Node 1** (halaman status, Node 1 v1.1) | tanpa laptop | harus berdiri di depan Node 1 |
| **Daftar perangkat di router** | melihat semua perangkat sekaligus | butuh akses ke halaman admin router |
| **IP tetap lewat router** (*DHCP reservation*) ✅ **jalur utama** | alamat tidak pernah berubah; tautan di HP selalu jalan | butuh akses ke halaman admin router, sekali saja |
| **Nama `.local`** (mDNS) 🎁 **bonus** | cukup mengetik `node1.local`, tanpa mengatur router | sering gagal di HP Android (terutama yang lama), dan tidak pernah jalan lewat data seluler atau VPN |

![Dua kartu cara menemukan Node 1. Kiri, jalur utama, alamat tetap lewat router (DHCP reservation, nomor rumah yang dipesan): di halaman admin router, menu Address Reservation memasangkan MAC A4-CF-12-E5-B7-C0 dengan 192.168.1.23 karena router mengenali ESP32 dari nomor KTP-nya; ESP32 tetap meminta alamat dengan cara biasa, alamatnya tidak berubah walaupun router dinyalakan ulang, dan tautan /off di HP selalu jalan; syaratnya akses ke halaman admin router, sekali saja. Kanan, bonus, nama node1.local (mDNS): ESP32 berteriak aku node1 di jaringan rumah; berhasil di laptop Windows 10/11, macOS, dan Linux serta di iPhone; sering gagal di HP Android, terutama HP lama; tidak pernah jalan lewat data seluler atau VPN; kalau gagal, pakai alamat IP-nya. Catatan bawah: cara lain melihat alamat adalah Serial Monitor, halaman status OLED Node 1 v1.1, atau daftar perangkat di router](aset/alamat-tetap.png)

**IP tetap lewat router** (*DHCP reservation*, "nomor rumah yang dipesan"): kita minta petugas DHCP untuk **selalu** memberi nomor yang sama kepada perangkat dengan nomor KTP (alamat MAC) tertentu. Pengaturannya di halaman admin router, bukan di kode, sehingga ESP32 tetap meminta alamat dengan cara biasa. Inilah jalur utama kita (Praktik 9).

**Nama `.local`** (mDNS, *multicast DNS*): ESP32 "berteriak" di jaringan rumah, "Aku `node1`!" Perangkat yang mendengarkan bisa menemukannya lewat nama `node1.local` tanpa perlu tahu alamat IP-nya. Cukup dua baris:

```cpp
MDNS.begin("node1");                 // nama di jaringan: node1.local
MDNS.addService("http", "tcp", 80);  // umumkan: "aku punya server web di pintu 80"
```

**Siapa yang bisa memakai nama ini?** Laptop Windows 10/11, macOS, iPhone, dan Linux (dengan Avahi) umumnya bisa. Android baru belakangan mendukungnya, dan masih sering gagal, terutama di HP lama dan di sebagian merek. Lewat data seluler atau VPN, nama `.local` tidak pernah bisa ditemukan karena hanya berlaku di dalam jaringan rumah. Karena itu, nama `.local` hanya bonus; jalur utama tetap alamat IP yang dipesan di router.

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 8 — Sakelar lampu dari HP](#praktik-8--sakelar-lampu-dari-hp-20-menit) dan [Praktik 9 — Alamat tetap untuk Node 1](#praktik-9--alamat-tetap-untuk-node-1-20-menit), lalu kembali ke Konsep 10.

### 10. "Harga" WiFi: program membengkak, ADC2 terkunci, arus melonjak

WiFi membuat Node 1 jauh lebih berguna, tetapi ada tiga harga yang harus dibayar. Ketiganya perlu kamu kenali sebelum merakit Node 1 v1.1.

**1. Program membengkak.** Bandingkan ukuran sketsa yang dilaporkan Arduino IDE setiap kali kamu mengunggah (`Sketch uses … bytes`):

| Sketsa | Ukuran program | Bagian dari ruang program bawaan (1.310.720 byte) |
| :--- | ---: | ---: |
| Blink (Modul 2), tanpa WiFi | 269.480 byte | 20 % |
| Node 1 v1.0 (Modul 8), tanpa WiFi | 419.137 byte | 31 % |
| Kemenangan Cepat: hanya menyambung ke WiFi | 889.428 byte | 67 % |
| Praktik 6: WiFi, HTTPS, dan ArduinoJson | 1.033.288 byte | 78 % |
| Node 1 v1.1: semua kemampuan minggu ini | 1.315.235 byte | 100 %, **tidak muat** |

*Diukur dengan paket esp32 3.3.7 di Wokwi; Node 1 v1.1 dikompilasi dengan setelan papan asli (`PAKAI_WOKWI = false`, lihat bagian ➕ B). Di Arduino IDE-mu, angkanya bisa bergeser beberapa ribu byte.*

Bandingkan Blink dengan Kemenangan Cepat: menyambung ke WiFi saja sudah menambah sekitar 620.000 byte karena radio WiFi dan seluruh "tata cara" jaringannya ikut masuk ke program. Sisa pertambahannya datang dari HTTPS, library, dan fitur-fitur Node 1. Node 1 v1.1 bahkan sedikit melewati batas ruang program bawaan itu, jadi Arduino IDE menolaknya dengan pesan `Sketch too big`.

Memori *flash* papanmu sebesar 4 MB, tetapi tidak semuanya untuk program. Ia dibagi menjadi beberapa "rak" yang disebut **partisi**, seperti lemari yang sekatnya sudah dipasang pabrik:

![Diagram rak-rak di memori flash 4 MB. Skema bawaan, Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS): app0 1,25 MB untuk program yang berjalan, app1 1,25 MB rak OTA (Modul 28), dan SPIFFS sekitar 1,4 MB, rak file yang tidak dipakai; Node 1 v1.1 berukuran 1.315.235 byte, lebih 4.515 byte daripada rak programnya, jadi tidak muat. Skema mulai modul ini, Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS): app0 dan app1 masing-masing 1,875 MB, dan SPIFFS 128 KB; Node 1 v1.1 memenuhi 66 %. Catatan: bagian abu-abu di ujung kiri berisi bootloader, tabel partisi, dan NVS 20 KB; letaknya sama di kedua skema, jadi ambang siram, angka Nyala ke-, dan WiFi tersimpan tidak hilang saat skemanya diganti; bagian abu-abu kecil di ujung kanan berisi coredump 64 KB, catatan sistem saat program mogok; dua rak program adalah jalan untuk OTA di Modul 28; menu Partition Scheme tidak ada di pilihan papan DOIT ESP32 DEVKIT V1, jadi kita memakai ESP32 Dev Module (bagian Tambahan, langkah A)](aset/partisi-flash.png)

- **Bawaan** (di menu: **Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)**): dua rak program masing-masing **1,25 MB**, ditambah sekitar 1,4 MB untuk menyimpan file (SPIFFS).
- **Minimal SPIFFS** (di menu: **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**): dua rak program masing-masing **1,875 MB**, dan rak file tinggal 128 KB.

Mengapa ada **dua** rak program? Rak kedua dipakai untuk **pembaruan lewat udara** (OTA, *over-the-air*) di Modul 28: program baru dikirim lewat WiFi ke rak yang kosong, lalu papan berpindah ke rak itu tanpa kabel USB. Rak file (SPIFFS) tidak kita pakai karena data Node 1 disimpan di NVS dan kartu microSD. Jadi, Silabus memutuskan: **mulai Node 1 v1.1 di modul ini, semua sketsa memakai skema Minimal SPIFFS**. Rak programnya lebih lega, dan pintu OTA tetap terbuka. Sketsa Kemenangan Cepat sampai Praktik 8 masih muat di rak bawaan, jadi semuanya cukup diunggah dengan pilihan **DOIT ESP32 DEVKIT V1** seperti yang kita lakukan selama ini.

Ada satu kerepotan: pilihan papan **DOIT ESP32 DEVKIT V1** di Arduino IDE **tidak punya menu Partition Scheme**. Menu itu ada di pilihan **ESP32 Dev Module**. Papanmu tidak perlu diganti. Chip, nomor GPIO, dan cara mengunggahnya sama persis; yang berganti hanya "kartu identitas" papan di Arduino IDE. Langkahnya ada di bagian ➕ A. NVS juga tidak terganggu karena raknya berada di tempat yang sama di kedua skema, jadi ambang siram dan WiFi tersimpan tidak hilang.

**2. ADC2 terkunci selama WiFi menyala.** ESP32 punya dua pengubah analog-ke-digital: ADC1 (GPIO 32–39) dan ADC2 (GPIO 0, 2, 4, 12–15, dan 25–27). Radio WiFi ikut memakai ADC2, jadi selama WiFi menyala, `analogRead()` di pin-pin ADC2 **diam-diam menjawab `0`**, tanpa pesan error apa pun. Sensornya tampak "mati", padahal kabelnya benar. Inilah sebabnya Modul 5 mewajibkan semua sensor analog dipasang di pin **ADC1**: LDR di VP (GPIO 36) dan sensor tanah di VN (GPIO 39). Pin ADC2 di Node 1 (LED D4, tombol D13, DHT22 D14, TRIG D15, pompa D25, servo D26, dan buzzer D27) hanya dipakai secara **digital**, dan itu tetap aman walaupun WiFi menyala.

**3. Arus melonjak.** Saat memancarkan sinyal WiFi, ESP32 menarik arus jauh lebih besar daripada saat diam. Menurut lembar datanya, chip ESP32 menarik sampai sekitar **240 mA** saat memancar dengan daya penuh dan sekitar **95–100 mA** saat mendengarkan, jauh di atas papan yang bangun tanpa WiFi di Modul 9 (sekitar 55–65 mA). Lonjakan itu terjadi berulang-ulang, setiap kali ada surat yang dikirim. Ini pelajaran Modul 9: sumber listrik ESP32 harus sanggup menahan lonjakan. Port USB laptop yang lemah, kabel USB yang tipis dan panjang, atau *charger* murahan bisa membuat tegangan anjlok tepat saat WiFi mulai menyala, lalu papan *restart* dengan pesan `Brownout detector was triggered`. Node 1 yang memakai *charger* 1 A dari Modul 9 sudah aman.

> ➡️ **Saatnya praktik!** Semua konsep sudah dibahas. Coba [🧩 Tantangan](#-tantangan-mandiri), lalu rakit [➕ Node 1 v1.1](#-tambahan-ke-rumah-pintar-mini).

---

## 🔧 Praktik langkah demi langkah

Sembilan praktik, **berurutan**. Semuanya memakai **papan Node 1** di meja kerjamu yang dicolokkan ke laptop. Sketsa Node 1 v1.0 memang tertimpa selama praktik; di bagian ➕, papan ini menjalankan Node 1 v1.1.

**Satu kebiasaan baru minggu ini:** setiap sketsa latihan butuh tab `secrets.h`. Supaya tidak perlu membuatnya berulang kali, mulailah setiap praktik dari sketsa sebelumnya: buka sketsa itu, pilih **File → Save As…** (**Ctrl + Shift + S**), lalu simpan di folder `modul-10` dengan nama baru. Perhatikan folder yang dibuka jendela simpan: sering kali bukan `modul-10`, melainkan folder sketsa bawaan **Documents → Arduino**. Pindah dulu ke **Documents → GitHub → belajar-iot → modul-10**, baru ketik nama barunya dan klik **Save**. Arduino IDE menyalin **seluruh** folder sketsa, termasuk tab `secrets.h`, lalu membuka salinannya di jendela yang sama. Setelah itu, cukup ganti isi tab utama.

Tiga langkah di bagian ➕ berikut adalah syarat lulus (bertanda ⭐):

1. **Bagian ➕ E** — server mini di laptop mencetak JSON dari Node 1 (latihannya: Praktik 7).
2. **Bagian ➕ F** — lampu dimatikan dari HP lewat tautan Node 1 (latihannya: Praktik 8).
3. **Bagian ➕ G** — Node 1 tersambung lagi sendiri setelah router dimatikan 1 menit (latihannya: Praktik 3).

### Praktik 1 — Pasang penjaga rahasia (10 menit)

> 🖥️ **Alat:** **GitHub Desktop** dan repositori `belajar-iot` yang berisi sketsa Kemenangan Cepat. Konsep yang dipakai: 3.

Sebelum *commit* pertama minggu ini, kita pasang "penjaga" yang memastikan `secrets.h` tidak pernah ikut terunggah.

1. Buka GitHub Desktop, lalu pastikan kotak **Current repository** menunjukkan **`belajar-iot`**. Di tab **Changes**, kamu melihat file-file baru di folder `modul-10`, **termasuk `secrets.h`**. **Jangan *commit* dulu.**
2. Buka menu **Repository → Repository settings…** (macOS: **Repository Settings…**), lalu pilih tab **Ignored files** (macOS: **Ignored Files**). Kotak teks di sana adalah isi file `.gitignore` di folder utama repositorimu. Kotak itu bisa kosong, bisa juga sudah berisi baris dari Modul 4.
3. Tambahkan satu baris baru di **paling bawah** kotak itu:

   ```text
   secrets.h
   ```

4. Klik **Save**.

   ![Ilustrasi GitHub Desktop 3.6.6, bukan tangkapan layar: memasang penjaga secrets.h lewat Repository, Repository settings…, Ignored files, tambah baris secrets.h, lalu Save. Di jendela GitHub Desktop dengan repositori belajar-iot, jendela Repository settings sedang terbuka: di kiri tab Remote, Ignored files (dipilih, penanda 1), dan Git config; di kanan teks "Editing .gitignore. This file specifies intentionally untracked files that Git should ignore. Files already tracked by Git are not affected.", tautan Learn more about gitignore files, dan kotak teks berisi baris secrets.h (penanda 2); di bawah tombol Save (penanda 3) dan Cancel. Bagian bawah membandingkan tab Changes. Sebelum disimpan, 2 changed files berisi modul-10/modul10_halo_wifi/modul10_halo_wifi.ino dan modul-10/modul10_halo_wifi/secrets.h yang ditandai merah, jangan di-commit. Sesudah disimpan, 2 changed files berisi .gitignore (penanda 4) dan modul10_halo_wifi.ino: secrets.h hilang dari daftar dan .gitignore muncul. Keterangan: 1, tab Ignored files (macOS: Ignored Files); 2, tambah baris secrets.h di paling bawah kotak; 3, klik Save; 4, lalu commit .gitignore bersama sketsanya](aset/github-desktop-gitignore.png)
5. Lihat lagi daftar **Changes**: `secrets.h` **sudah hilang dari daftar**, dan muncul `.gitignore` (file baru, atau file lama yang berubah). Daftarnya kini kira-kira berisi `.gitignore` dan `modul-10/modul10_halo_wifi/modul10_halo_wifi.ino`.
6. Isi **Summary** dengan `Modul 10: Kemenangan Cepat dan penjaga secrets.h`, klik **Commit … to main**, lalu **Push origin**.
7. Buka halaman repositori `belajar-iot` di GitHub, lalu masuk ke folder `modul-10/modul10_halo_wifi`. Yang ada di sana hanya `modul10_halo_wifi.ino`. **`secrets.h` tetap tinggal di laptopmu.**

**Hasilnya:** mulai sekarang, file bernama `secrets.h` di folder mana pun di dalam `belajar-iot`, termasuk di modul-modul berikutnya, tidak pernah muncul di daftar **Changes**.

**Bedah langkahnya:**

- **Satu baris untuk semua folder.** Aturan `secrets.h` tanpa garis miring berlaku untuk semua file bernama itu, di folder mana pun. Itu sebabnya kita menulisnya di jendela `Repository settings`, yang mengisi `.gitignore` di folder utama repositori.
- **Mengapa tidak mengeklik kanan `secrets.h` di daftar Changes?** Menu klik kanannya memang menawarkan **Ignore file (add to .gitignore)**, tetapi aturannya hanya berlaku untuk satu file di folder itu; `secrets.h` di sketsa berikutnya tetap muncul. Hati-hati juga dengan pilihan **Ignore all .h files (add to .gitignore)**: semua tab `.h` buatanmu, termasuk milik Node 1, ikut diabaikan.
- **Belum memakai GitHub Desktop** (misalnya di Linux)? Buat file bernama `.gitignore` di folder utama `belajar-iot` dengan VS Code, seperti Modul 4, lalu isi dengan baris `secrets.h`. Perintah `git status` tidak lagi menampilkan `secrets.h`.

`secrets.h` sudah telanjur ter-*commit* sebelum praktik ini? Buka "`secrets.h` telanjur ter-*commit* atau ter-*push*" di 🚨.

### Praktik 2 — Kenali jaringanmu (20 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, papan Node 1 (MB102 boleh tetap mati), sketsa Kemenangan Cepat, dan **VS Code** untuk catatan. Bisa juga di Wokwi, dengan `secrets.h` berisi `Wokwi-GUEST`. Konsep yang dipakai: 1 dan 2.

Sebelum mengirim data ke mana-mana, kita kenali dulu "perumahan" tempat ESP32 tinggal: jaringan apa saja yang terlihat, nomor rumah ESP32, nomor pos satpam, dan nomor KTP-nya.

1. Buka sketsa `modul10_halo_wifi`, pilih **File → Save As…**, lalu simpan di folder `modul-10` dengan nama `modul10_kenali_jaringan`. Tab `secrets.h` ikut tersalin.
2. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 10 - Praktik 2: kenali jaringanmu
   // Langkah 1: ESP32 mencari semua jaringan WiFi yang bisa ia "lihat".
   // Langkah 2: ESP32 menyambung ke WiFi di tab secrets.h, lalu mencetak "kartu identitas" jaringannya.
   // Sesudah itu, kekuatan sinyal dicetak setiap 2 detik.

   #include <WiFi.h>
   #include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

   const int PIN_LED_STATUS = 4;
   const unsigned long JEDA_SINYAL = 2000;  // cetak kekuatan sinyal setiap 2 detik
   unsigned long waktuSinyalTerakhir = 0;

   // Nama pendek untuk jenis gembok (keamanan) jaringan.
   const char* namaKeamanan(wifi_auth_mode_t jenis) {
     if (jenis == WIFI_AUTH_OPEN) {
       return "terbuka";
     }
     if (jenis == WIFI_AUTH_WPA2_PSK) {
       return "WPA2";
     }
     if (jenis == WIFI_AUTH_WPA_WPA2_PSK) {
       return "WPA/WPA2";
     }
     if (jenis == WIFI_AUTH_WPA2_WPA3_PSK) {
       return "WPA2/WPA3";
     }
     if (jenis == WIFI_AUTH_WPA3_PSK) {
       return "WPA3";
     }
     if (jenis == WIFI_AUTH_WPA2_ENTERPRISE) {
       return "Enterprise";
     }
     return "lainnya";
   }

   // Kata sederhana untuk angka kekuatan sinyal (RSSI). Makin dekat ke 0, makin kuat.
   const char* mutuSinyal(int rssi) {
     if (rssi >= -55) {
       return "sangat kuat";
     }
     if (rssi >= -67) {
       return "kuat";
     }
     if (rssi >= -75) {
       return "cukup";
     }
     if (rssi >= -85) {
       return "lemah";
     }
     return "sangat lemah";
   }

   // Langkah 1: daftar jaringan yang terlihat. Pencarian ini memakan beberapa detik.
   void cariJaringan() {
     Serial.println("Mencari jaringan WiFi di sekitar...");
     int jumlah = WiFi.scanNetworks();
     if (jumlah <= 0) {
       Serial.println("Tidak ada jaringan yang terlihat.");
       return;
     }
     Serial.printf("%d jaringan terlihat:\n", jumlah);
     Serial.println(" No  Sinyal    Kanal  Keamanan    Nama (SSID)");
     bool wifiKuTerlihat = false;
     for (int i = 0; i < jumlah; i++) {
       String nama = WiFi.SSID(i);
       const char* tanda = "";
       if (nama == WIFI_NAMA) {
         tanda = "   <- WiFi-mu";
         wifiKuTerlihat = true;
       }
       Serial.printf("%3d  %4d dBm  %4d   %-10s  %s%s\n", i + 1, WiFi.RSSI(i), WiFi.channel(i),
                     namaKeamanan(WiFi.encryptionType(i)), nama.c_str(), tanda);
     }
     WiFi.scanDelete();  // kosongkan lagi memori hasil pencarian
     if (!wifiKuTerlihat) {
       Serial.printf("\"%s\" TIDAK terlihat. Salah ketik, atau WiFi-mu hanya 5 GHz? (lihat Konsep 2)\n", WIFI_NAMA);
     }
   }

   // Langkah 2: "kartu identitas" ESP32 di jaringanmu.
   void cetakKartuJaringan() {
     uint8_t mac[6];
     WiFi.macAddress(mac);
     char deviceId[13];  // 12 huruf + tanda akhir teks
     snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

     Serial.println("---------- Kartu identitas jaringan ----------");
     Serial.printf("Nama WiFi (SSID) : %s\n", WiFi.SSID().c_str());
     Serial.printf("Alamat IP ESP32  : %s\n", WiFi.localIP().toString().c_str());
     Serial.printf("Router (gateway) : %s\n", WiFi.gatewayIP().toString().c_str());
     Serial.printf("Subnet mask      : %s\n", WiFi.subnetMask().toString().c_str());
     Serial.printf("DNS              : %s\n", WiFi.dnsIP().toString().c_str());
     Serial.printf("Nama perangkat   : %s\n", WiFi.getHostname());
     Serial.printf("Alamat MAC       : %s\n", WiFi.macAddress().c_str());
     Serial.printf("device_id        : %s\n", deviceId);
     Serial.printf("Kanal            : %d\n", WiFi.channel());
     Serial.println("----------------------------------------------");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED_STATUS, OUTPUT);
     Serial.println();

     WiFi.mode(WIFI_STA);
     cariJaringan();

     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     digitalWrite(PIN_LED_STATUS, HIGH);
     cetakKartuJaringan();
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // belum tersambung: tidak ada sinyal untuk dilaporkan
     }
     if (millis() - waktuSinyalTerakhir >= JEDA_SINYAL) {
       waktuSinyalTerakhir = millis();
       int rssi = WiFi.RSSI();
       Serial.printf("Sinyal: %d dBm (%s)\n", rssi, mutuSinyal(rssi));
     }
   }
   ```

3. Klik **Upload**, lalu buka **Serial Monitor** (**115200 baud**). Pencarian jaringan memakan beberapa detik; kalau baris pertama terlewat, tekan **EN**.

   **Hasilnya** (contoh):

   ```text
   Mencari jaringan WiFi di sekitar...
   3 jaringan terlihat:
    No  Sinyal    Kanal  Keamanan    Nama (SSID)
     1   -47 dBm     6   WPA2        RumahKita   <- WiFi-mu
     2   -71 dBm     1   WPA2/WPA3   Tetangga_Sebelah
     3   -79 dBm    11   WPA2        WiFi_Kos_Melati
   Menyambung ke "RumahKita"..........
   ---------- Kartu identitas jaringan ----------
   Nama WiFi (SSID) : RumahKita
   Alamat IP ESP32  : 192.168.1.23
   Router (gateway) : 192.168.1.1
   Subnet mask      : 255.255.255.0
   DNS              : 192.168.1.1
   Nama perangkat   : esp32-E5B7C0
   Alamat MAC       : A4:CF:12:E5:B7:C0
   device_id        : a4cf12e5b7c0
   Kanal            : 6
   ----------------------------------------------
   Sinyal: -48 dBm (sangat kuat)
   Sinyal: -49 dBm (sangat kuat)
   Sinyal: -48 dBm (sangat kuat)
   Sinyal: -61 dBm (kuat)
   Sinyal: -63 dBm (kuat)
   Sinyal: -50 dBm (sangat kuat)
   ```

4. **Isi "kartu jaringan" milikmu.** Dengan VS Code, buat file `catatan-modul10.md` di folder `modul-10`, seperti `catatan-debugging.md` di Modul 8, lalu salin angka-angka dari kartu identitas: alamat IP ESP32, router (*gateway*), *subnet mask*, alamat MAC, `device_id`, dan kanal. Kartu ini dipakai lagi di Praktik 7 dan 9. Catatan ini ikut ter-*push* ke repositori `belajar-iot` yang terbuka untuk umum, jadi **jangan pernah menulis kata sandi** di dalamnya, baik kata sandi WiFi maupun kata sandi halaman admin router.
5. **Bandingkan dengan HP-mu.** Buka pengaturan WiFi di HP, ketuk nama WiFi yang sedang tersambung, lalu cari alamat IP-nya (biasanya di bagian **Detail** atau ikon ⓘ). Tiga angka pertamanya sama dengan alamat ESP32? Berarti keduanya **tetangga satu blok** (Konsep 1).
6. **Uji sinyal.** Lihat baris `Sinyal:` yang muncul setiap 2 detik. Tutup ujung modul ESP32 yang berpola garis berliku-liku (itulah antenanya, di ujung kotak logam) dengan telapak tanganmu selama beberapa detik, lalu lepaskan. Angkanya turun, lalu naik lagi.

**Bedah kodenya:**

- **`WiFi.scanNetworks()`** mendengarkan semua kanal (jalur 2,4 GHz masih dibagi lagi menjadi kanal-kanal bernomor, misalnya 1, 6, dan 11, mirip saluran di radio) dan mengumpulkan nama-nama WiFi yang terdengar, lengkap dengan kekuatan sinyal, kanal, dan jenis gemboknya. Selama pencarian, sketsa menunggu beberapa detik; untuk latihan sekali jalan di `setup()`, itu tidak apa-apa. Karena ESP32 hanya punya radio 2,4 GHz, **jaringan 5 GHz tidak akan pernah muncul di daftar ini**. Jaringan yang namanya disembunyikan (*hidden*) juga tidak ikut muncul karena secara bawaan `scanNetworks()` melewatkannya. Kalau WiFi-mu tidak bertanda `<- WiFi-mu`, sketsa mencetak peringatan, dan penyebabnya biasanya salah ketik nama atau WiFi yang hanya 5 GHz (Konsep 2).
- **`device_id`** dibuat dari alamat MAC dengan `snprintf()` dan pola `%02x` ("dua angka heksadesimal, huruf kecil"), lalu disimpan di `char[13]`: dua belas huruf ditambah tanda akhir teks (Modul 8). Angka inilah identitas Node 1 di seluruh proyek: minggu ini sudah dipakai di alamat kiriman Node 1 v1.1 (bagian ➕ E), lalu menjadi bagian nama topik MQTT mulai Modul 11.
- **`Nama perangkat`** adalah nama yang dilaporkan ESP32 ke router, bawaannya `esp32-` diikuti enam huruf terakhir alamat MAC. Di daftar perangkat router, ESP32-mu biasanya muncul dengan nama ini. Di Praktik 8, kita menggantinya dengan `node1` supaya lebih mudah dikenali.
- **Mengapa angka sinyalnya naik-turun?** Gelombang radio memantul dari dinding dan orang yang lewat, jadi wajar kalau angkanya bergeser beberapa dBm. Yang penting adalah rata-ratanya. Di Wokwi, angkanya sengaja dibuat acak.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 4](#4-menyambung-tanpa-macet-lalu-tersambung-lagi-sendiri) (➡️ di akhir Konsep 4 akan mengantarmu ke Praktik 3).

### Praktik 3 — Uji cabut router (25 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, papan Node 1 (MB102 boleh tetap mati), sketsa `modul10_kenali_jaringan`, **router WiFi** yang boleh kamu matikan sebentar, dan jam atau *stopwatch* (pengukur waktu) di HP. Wokwi tidak bisa mematikan routernya, jadi uji putus-sambung harus dilakukan di papan asli. Konsep yang dipakai: 4.
>
> **Beri tahu orang serumah dulu:** selama uji ini, internet di rumah putus sekitar 2–4 menit. Kalau tidak memungkinkan, pakai *hotspot* HP (lihat catatan di akhir praktik).

Kali ini ESP32 menyambung **tanpa menunggu**, lalu melapor setiap kali ada perubahan. Kamu akan mematikan router selama 1 menit dan melihat sendiri: `loop()` tetap berputar selama WiFi putus, lalu ESP32 tersambung lagi tanpa disentuh.

1. Buka sketsa `modul10_kenali_jaringan`, pilih **File → Save As…**, lalu simpan di folder `modul-10` dengan nama `modul10_sambung_ulang`. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 10 - Praktik 3: uji cabut router
   // ESP32 menyambung TANPA menunggu. Kalau WiFi putus, paket esp32 sendiri yang mencoba menyambung lagi;
   // sketsa ini hanya mengamati dan melapor. loop() tidak pernah berhenti berputar:
   //   LED status menyala tetap = tersambung; berkedip cepat = putus, sedang mencoba lagi.

   #include <WiFi.h>
   #include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

   const int PIN_LED_STATUS = 4;
   const unsigned long JEDA_LAPORAN = 10000;  // laporan berkala setiap 10 detik
   const unsigned long JEDA_KEDIP = 100;      // kedip cepat selama WiFi putus

   // "Bendera" yang dinaikkan fungsi peristiwa dan diturunkan loop(), seperti interrupt di Modul 8.
   // volatile: isinya bisa berubah "diam-diam" dari luar loop().
   volatile bool benderaDapatIp = false;
   volatile bool benderaPutus = false;
   volatile uint8_t alasanPutus = 0;
   volatile unsigned long jumlahPercobaan = 0;  // berapa kali percobaan menyambung gagal

   bool tersambung = false;
   bool pernahTersambung = false;
   unsigned long waktuPutus = 0;
   unsigned long waktuLaporanTerakhir = 0;
   unsigned long waktuKedipTerakhir = 0;
   bool ledNyala = false;
   unsigned long putaranTerlamaUs = 0;  // putaran loop() paling lama sejak laporan terakhir (Modul 8)

   // Dipanggil oleh paket esp32 setiap ada peristiwa WiFi, dari "petugas" lain, bukan dari loop().
   // Aturannya sama dengan fungsi interrupt: sesingkat mungkin, cukup menaikkan bendera.
   void saatPeristiwaWiFi(arduino_event_id_t peristiwa, arduino_event_info_t info) {
     if (peristiwa == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
       benderaDapatIp = true;
     } else if (peristiwa == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
       uint8_t alasan = info.wifi_sta_disconnected.reason;
       if (alasan == WIFI_REASON_STA_LEAVING) {
         return;  // 36: paket esp32 sendiri memutus percobaan lama sebelum mencoba lagi, bukan percobaan gagal baru
       }
       alasanPutus = alasan;
       jumlahPercobaan++;
       benderaPutus = true;
     }
   }

   // Nama kode alasan putus dari paket esp32. Kode 209-212 belum diberi nama di sana.
   const char* namaAlasan(uint8_t kode) {
     const char* nama = WiFi.disconnectReasonName((wifi_err_reason_t)kode);
     if (nama[0] == '\0') {  // teks kosong: huruf pertamanya langsung tanda akhir teks
       return "lihat tabel Konsep 4";
     }
     return nama;
   }

   // Jam sejak menyala, misalnya "00:01:23", untuk awal setiap baris laporan.
   const char* jamUptime() {
     static char teks[12];
     unsigned long detik = millis() / 1000;
     snprintf(teks, sizeof(teks), "%02lu:%02lu:%02lu", detik / 3600, (detik / 60) % 60, detik % 60);
     return teks;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED_STATUS, OUTPUT);
     Serial.println();

     WiFi.onEvent(saatPeristiwaWiFi);  // daftarkan fungsi peristiwa SEBELUM mulai menyambung
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     Serial.printf("[%s] Mulai menyambung ke \"%s\" (tanpa menunggu)\n", jamUptime(), WIFI_NAMA);
   }

   void loop() {
     unsigned long mulaiPutaran = micros();
     unsigned long sekarang = millis();

     // 1. Turunkan bendera, lalu laporkan perubahannya.
     if (benderaDapatIp) {
       benderaDapatIp = false;
       tersambung = true;
       if (!pernahTersambung) {
         Serial.printf("[%s] Tersambung! IP %s, sinyal %d dBm\n", jamUptime(),
                       WiFi.localIP().toString().c_str(), WiFi.RSSI());
       } else {
         Serial.printf("[%s] Tersambung LAGI setelah %lu detik putus. IP %s\n", jamUptime(),
                       (sekarang - waktuPutus) / 1000, WiFi.localIP().toString().c_str());
       }
       pernahTersambung = true;
       jumlahPercobaan = 0;
     }
     if (benderaPutus) {
       benderaPutus = false;
       if (tersambung) {  // baru saja putus; percobaan ulang yang gagal tidak dilaporkan satu per satu
         tersambung = false;
         waktuPutus = sekarang;
         jumlahPercobaan = 0;  // mulai menghitung percobaan ulang yang gagal
         Serial.printf("[%s] WiFi PUTUS (alasan %u: %s). Paket esp32 mencoba menyambung lagi...\n",
                       jamUptime(), alasanPutus, namaAlasan(alasanPutus));
       }
     }

     // 2. LED status: menyala tetap saat tersambung, berkedip cepat saat putus.
     if (tersambung) {
       digitalWrite(PIN_LED_STATUS, HIGH);
     } else if (sekarang - waktuKedipTerakhir >= JEDA_KEDIP) {
       waktuKedipTerakhir = sekarang;
       ledNyala = !ledNyala;
       digitalWrite(PIN_LED_STATUS, ledNyala);
     }

     // 3. Laporan berkala: bukti bahwa loop() tetap berputar walaupun WiFi putus.
     if (sekarang - waktuLaporanTerakhir >= JEDA_LAPORAN) {
       waktuLaporanTerakhir = sekarang;
       if (tersambung) {
         Serial.printf("[%s] Laporan: tersambung, sinyal %d dBm, putaran loop() terlama %lu ms\n",
                       jamUptime(), WiFi.RSSI(), putaranTerlamaUs / 1000);
       } else if (pernahTersambung) {
         Serial.printf("[%s] Laporan: PUTUS selama %lu detik, %lu percobaan gagal, putaran loop() terlama %lu ms\n",
                       jamUptime(), (sekarang - waktuPutus) / 1000, jumlahPercobaan, putaranTerlamaUs / 1000);
       } else {
         Serial.printf("[%s] Laporan: belum pernah tersambung, %lu percobaan gagal (alasan terakhir %u: %s)\n",
                       jamUptime(), jumlahPercobaan, alasanPutus, namaAlasan(alasanPutus));
       }
       putaranTerlamaUs = 0;  // mulai mengukur lagi untuk laporan berikutnya
     }

     unsigned long lamaPutaran = micros() - mulaiPutaran;
     if (lamaPutaran > putaranTerlamaUs) {
       putaranTerlamaUs = lamaPutaran;
     }
   }
   ```

2. Klik **Upload**, lalu buka **Serial Monitor**. Tunggu sampai muncul `Tersambung!` dan LED status D4 menyala tetap.
3. **Matikan router** dengan menekan tombol dayanya atau mencabut adaptornya. Catat jamnya.
4. Perhatikan Serial Monitor dan LED D4:
   - Dalam beberapa detik, muncul `WiFi PUTUS` beserta kode alasannya, dan LED mulai **berkedip cepat**.
   - Setiap 10 detik, laporan berkala tetap muncul. Angka `putaran loop() terlama` tetap kecil: `loop()` tidak pernah tertahan.
5. Setelah **1 menit**, **nyalakan router lagi**. Router butuh waktu untuk "bangun", biasanya 1–3 menit. Jangan sentuh papan ESP32-nya.
6. Begitu WiFi router kembali memancar, muncul `Tersambung LAGI setelah … detik putus`, dan LED kembali menyala tetap.

   **Hasilnya** (contoh; jumlah detik dan percobaan di jaringanmu pasti berbeda):

   ```text
   [00:00:00] Mulai menyambung ke "RumahKita" (tanpa menunggu)
   [00:00:02] Tersambung! IP 192.168.1.23, sinyal -57 dBm
   [00:00:10] Laporan: tersambung, sinyal -58 dBm, putaran loop() terlama 1 ms
   [00:00:20] Laporan: tersambung, sinyal -57 dBm, putaran loop() terlama 0 ms
   [00:00:30] Laporan: tersambung, sinyal -59 dBm, putaran loop() terlama 0 ms
   [00:00:36] WiFi PUTUS (alasan 200: BEACON_TIMEOUT). Paket esp32 mencoba menyambung lagi...
   [00:00:40] Laporan: PUTUS selama 3 detik, 1 percobaan gagal, putaran loop() terlama 1 ms
   [00:00:50] Laporan: PUTUS selama 13 detik, 5 percobaan gagal, putaran loop() terlama 0 ms
   [00:01:00] Laporan: PUTUS selama 23 detik, 9 percobaan gagal, putaran loop() terlama 0 ms
   [00:01:10] Laporan: PUTUS selama 33 detik, 13 percobaan gagal, putaran loop() terlama 1 ms
   [00:01:20] Laporan: PUTUS selama 43 detik, 17 percobaan gagal, putaran loop() terlama 0 ms
   [00:01:30] Laporan: PUTUS selama 53 detik, 21 percobaan gagal, putaran loop() terlama 0 ms
   [00:01:40] Laporan: PUTUS selama 63 detik, 25 percobaan gagal, putaran loop() terlama 1 ms
   [00:01:50] Laporan: PUTUS selama 73 detik, 29 percobaan gagal, putaran loop() terlama 0 ms
   [00:02:00] Laporan: PUTUS selama 83 detik, 33 percobaan gagal, putaran loop() terlama 0 ms
   [00:02:10] Laporan: PUTUS selama 93 detik, 37 percobaan gagal, putaran loop() terlama 1 ms
   [00:02:20] Laporan: PUTUS selama 103 detik, 41 percobaan gagal, putaran loop() terlama 0 ms
   [00:02:30] Laporan: PUTUS selama 113 detik, 45 percobaan gagal, putaran loop() terlama 0 ms
   [00:02:40] Laporan: PUTUS selama 123 detik, 49 percobaan gagal, putaran loop() terlama 1 ms
   [00:02:44] Tersambung LAGI setelah 127 detik putus. IP 192.168.1.23
   [00:02:50] Laporan: tersambung, sinyal -58 dBm, putaran loop() terlama 1 ms
   ```

7. Catat di `catatan-modul10.md`: berapa detik WiFi putus, kode alasan saat putus, dan berapa percobaan gagal sebelum tersambung lagi.

**Bedah kodenya:**

- **Tidak ada `while` yang menunggu WiFi.** `setup()` hanya mendaftarkan fungsi peristiwa, memanggil `WiFi.begin()`, lalu selesai. Semua pemeriksaan ada di `loop()` dan memakai pola `millis()` dari Modul 8, jadi LED status dan laporan berkala tetap diurus tepat waktu, tersambung atau tidak.
- **`saatPeristiwaWiFi()`** hanya menaikkan bendera. Pesannya dicetak oleh `loop()` saat menurunkan bendera, persis seperti aturan *interrupt* di Modul 8.
- **Kode alasan saat router dimatikan** biasanya `200` (`BEACON_TIMEOUT`): sinyal router tiba-tiba hilang. Selama router mati, setiap percobaan menyambung gagal dengan alasan `201` (`NO_AP_FOUND`), dan paket esp32 langsung mencoba lagi. Sketsa ini menghitung percobaan itu tanpa mencetaknya satu per satu. Sebelum setiap percobaan baru, paket esp32 juga memutus percobaan lamanya sendiri dan memicu peristiwa putus beralasan `36` (`STA_LEAVING`). Fungsi peristiwa kita mengabaikannya supaya hitungan dan kode alasannya tetap benar.
- **Menyambung ulang dikerjakan oleh paket esp32**, bukan oleh sketsa kita. Tidak ada satu baris pun di `loop()` yang menyuruh ESP32 menyambung lagi. Di Node 1 v1.1, kita tetap menambahkan penjaga cadangan (Konsep 4).
- **`putaran loop() terlama`** mengukur putaran paling lama sejak laporan sebelumnya, seperti perintah `info` Node 1. Angka kecil, paling banyak beberapa milidetik, berarti `loop()` tidak pernah tertahan, bahkan saat WiFi putus. Kalau `loop()` menunggu WiFi dengan `while` seperti Kemenangan Cepat, angkanya bisa ribuan.

> 📱 **Tidak bisa mematikan router rumah?** Pakai *hotspot* HP. Nyalakan *hotspot* (pastikan memakai 2,4 GHz, lihat Konsep 2), ganti isi `secrets.h` dengan nama dan kata sandi *hotspot*-mu, lalu unggah ulang. "Mencabut router" berarti mematikan *hotspot* selama 1 menit, lalu menyalakannya lagi. *Hotspot* biasanya kembali dalam beberapa detik, jadi ESP32 juga tersambung lagi lebih cepat. Setelah uji selesai, **kembalikan isi `secrets.h` ke WiFi rumahmu**, lalu unggah ulang. Alasannya, Praktik 5–8 menyalin `secrets.h` dari sketsa ini, dan mulai Praktik 7 ESP32 harus berada di WiFi yang sama dengan laptopmu. Kalau laptop dan HP-mu juga berada di jaringan *hotspot* ini sampai akhir modul, isi `secrets.h` boleh tetap *hotspot*.

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 5](#5-portal-wifi-seperti-di-hotel-wifimanager) (➡️ di akhir Konsep 5 akan mengantarmu ke Praktik 4).

### Praktik 4 — Portal WiFi seperti di hotel (25 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, papan Node 1 (MB102 boleh tetap mati), **HP**, dan library baru **WiFiManager**. Wokwi tidak bisa menjadi titik akses yang disambungi HP, jadi praktik ini harus dikerjakan di papan asli. Konsep yang dipakai: 5.

Kali ini tidak ada `secrets.h`. Nama dan kata sandi WiFi diisi lewat HP, persis seperti memasang lampu pintar yang baru dibeli.

#### 4.1 Pasang library WiFiManager

1. Di Arduino IDE, buka **Library Manager** (ikon buku di bilah kiri), lalu ketik **WiFiManager**.
2. Muncul banyak library dengan nama mirip. Pilih **WiFiManager** yang di bawah judulnya tertulis **by tzapu**, versi **2.0.17**, lalu klik **INSTALL**. Library ini tidak membutuhkan library pendamping.

#### 4.2 Unggah sketsa portal

1. Buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan dengan nama `modul10_portal_wifi` di folder `modul-10`. Sketsa ini memang **tanpa** tab `secrets.h`.

   ```cpp
   // Modul 10 - Praktik 4: portal WiFi seperti di hotel (WiFiManager)
   // Tanpa secrets.h: nama dan kata sandi WiFi diisi lewat HP, lalu disimpan ESP32 di NVS.
   // Untuk menghapus WiFi tersimpan: tahan tombol D13, tekan lalu lepas EN, dan lepaskan D13 setelah 2 detik.

   #include <WiFi.h>
   #include <WiFiManager.h>  // library baru minggu ini: WiFiManager by tzapu

   const int PIN_LED_STATUS = 4;
   const int PIN_TOMBOL = 13;
   const char NAMA_PORTAL[] = "Node1-Latihan";  // nama WiFi sementara selama portal terbuka

   // Dipanggil WiFiManager tepat saat portal dibuka.
   void saatPortalDibuka(WiFiManager* wm) {
     Serial.printf("Portal terbuka. Sambungkan HP ke WiFi \"%s\", lalu buka http://192.168.4.1\n", NAMA_PORTAL);
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_LED_STATUS, OUTPUT);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     Serial.println();

     WiFiManager wm;
     wm.setDebugOutput(false);  // catatan WiFiManager sendiri tidak ikut dicetak
     wm.setAPCallback(saatPortalDibuka);
     wm.setConfigPortalTimeout(180);  // portal menutup sendiri setelah 3 menit tanpa diisi
     wm.setConnectTimeout(20);        // mencoba sebuah WiFi paling lama 20 detik

     if (digitalRead(PIN_TOMBOL) == LOW) {  // tombol ditahan saat menyala
       Serial.println("Tombol D13 ditahan: WiFi tersimpan dihapus.");
       wm.resetSettings();
     }

     Serial.println("Mencoba WiFi tersimpan...");
     digitalWrite(PIN_LED_STATUS, HIGH);  // LED menyala = sedang menyambung atau portal sedang terbuka
     // autoConnect(): pakai WiFi tersimpan; kalau belum ada atau gagal, buka portal.
     // Menunggu di sini sampai tersambung, atau sampai portal habis waktunya (boleh: hanya di setup()).
     bool tersambung = wm.autoConnect(NAMA_PORTAL);
     digitalWrite(PIN_LED_STATUS, LOW);

     if (!tersambung) {
       Serial.println("Portal ditutup tanpa WiFi. Tekan EN untuk mencoba lagi.");
       return;
     }
     Serial.printf("Tersambung ke \"%s\", IP %s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
     Serial.println("Nama dan kata sandi WiFi tersimpan di NVS. Tekan EN: kali ini langsung tersambung, tanpa portal.");
   }

   void loop() {
     // Kosong: semua pekerjaan praktik ini ada di setup().
   }
   ```

2. Klik **Upload**, lalu buka **Serial Monitor**. Kalau baris pertama terlewat, tekan **EN**.

   **Hasilnya** (contoh):

   ```text
   Mencoba WiFi tersimpan...
   Tersambung ke "RumahKita", IP 192.168.1.23
   Nama dan kata sandi WiFi tersimpan di NVS. Tekan EN: kali ini langsung tersambung, tanpa portal.
   ```

Lho, portalnya tidak muncul, padahal sketsa ini tidak berisi nama dan kata sandi WiFi! Rahasianya: setiap kali Kemenangan Cepat, Praktik 2, dan Praktik 3 memanggil `WiFi.begin(WIFI_NAMA, WIFI_SANDI)`, paket esp32 **diam-diam menyimpan** nama dan kata sandi itu di NVS. **WiFiManager** menemukannya, lalu langsung memakainya. Jadi, untuk melihat portal, kita hapus dulu WiFi tersimpan itu.

#### 4.3 Hapus WiFi tersimpan, lalu buka portal

1. Tahan tombol D13 di meja kerja, tekan lalu lepas **EN**, dan lepaskan tombol D13 sekitar 2 detik kemudian.

   **Hasilnya** (contoh):

   ```text
   Tombol D13 ditahan: WiFi tersimpan dihapus.
   Mencoba WiFi tersimpan...
   Portal terbuka. Sambungkan HP ke WiFi "Node1-Latihan", lalu buka http://192.168.4.1
   ```

2. LED status D4 menyala tetap: portal sedang terbuka dan menunggu HP-mu selama 3 menit. Kalau waktunya habis, tekan **EN** untuk membukanya lagi (WiFi tersimpan sudah terhapus, jadi portal langsung terbuka tanpa perlu menahan D13).

#### 4.4 Isi WiFi lewat HP

1. Di HP, **matikan data seluler** dulu. Buka pengaturan WiFi, lalu pilih jaringan **`Node1-Latihan`** (tanpa kata sandi).
2. **iPhone:** lembar *login* biasanya terbuka sendiri dan menampilkan halaman **WiFiManager**. Jangan ketuk **Cancel**; tombol itu memutus sambungan ke `Node1-Latihan`. **Android:** kalau muncul pemberitahuan untuk masuk ke jaringan (**Sign in to Wi-Fi network**), ketuk pemberitahuan itu. Kalau HP bertanya apakah tetap tersambung walaupun jaringan ini tidak punya akses internet, pilih tetap tersambung.
3. **Tidak muncul apa-apa?** Buka browser, lalu ketik `http://192.168.4.1` di kotak alamat.
4. Halaman **WiFiManager** terbuka: judulnya `WiFiManager`, di bawahnya nama portal `Node1-Latihan`, lalu tombol **Configure WiFi**, **Info**, **Exit**, dan **Update**. Ketuk **Configure WiFi**.

   ![Ilustrasi portal WiFiManager di browser HP, dirender dari HTML asli WiFiManager 2.0.17; nama-nama WiFi hanya contoh. Kiri, halaman 192.168.4.1 berjudul WiFiManager dengan nama portal Node1-Latihan, tombol Configure WiFi (penanda 1), Info, Exit, dan Update, serta status No AP set. Kanan, halaman 192.168.4.1/wifi: daftar jaringan RumahKita (penanda 2), Tetangga_Sebelah, dan WiFi_Kos_Melati dengan ikon gembok dan sinyal; kotak SSID yang sudah terisi RumahKita; kotak Password berisi kata sandi tersamar (penanda 3) dan kotak centang Show Password; serta tombol Save (penanda 4) dan Refresh, lalu status No AP set. Keterangan: 1, ketuk Configure WiFi; 2, ketuk nama WiFi rumahmu sehingga kotak SSID terisi sendiri; 3, ketik kata sandinya, centang Show Password untuk memeriksa; 4, ketuk Save, lalu ESP32 mencoba menyambung](aset/portal-hp.png)

   *Ilustrasi: halaman portal dirender dari HTML, CSS, dan teks asli library [WiFiManager](https://github.com/tzapu/WiFiManager) 2.0.17 (© tzapu, lisensi MIT); nama-nama WiFi hanya contoh.*

5. Muncul daftar WiFi yang terlihat oleh ESP32, hanya yang 2,4 GHz. Ketuk nama WiFi rumahmu sehingga kotak **SSID** terisi, lalu ketik kata sandinya di kotak **Password**. Centang **Show Password** untuk memeriksa ketikanmu. WiFi-mu tidak ada di daftar? Ketuk **Refresh**, atau ketik namanya sendiri di kotak **SSID**.
6. Ketuk **Save**. Halamannya berganti dengan tulisan `Saving Credentials`, `Trying to connect ESP to network.`, dan `If it fails reconnect to AP to try again`.
7. Kalau berhasil, ESP32 menutup portalnya, WiFi `Node1-Latihan` menghilang, dan LED status D4 padam (di sketsa ini, LED menyala hanya selama ESP32 menyambung atau portal terbuka). HP-mu kembali ke WiFi biasa dengan sendirinya; nyalakan lagi data selulernya. Kalau kata sandinya salah, portal tetap terbuka: sambungkan lagi HP ke `Node1-Latihan`, lalu ulangi dari langkah 2.

**Hasilnya di Serial Monitor** (contoh):

```text
Portal terbuka. Sambungkan HP ke WiFi "Node1-Latihan", lalu buka http://192.168.4.1
Tersambung ke "RumahKita", IP 192.168.1.23
Nama dan kata sandi WiFi tersimpan di NVS. Tekan EN: kali ini langsung tersambung, tanpa portal.
```

#### 4.5 Buktikan WiFi-nya tersimpan

Tekan **EN**. Kali ini tidak ada portal: ESP32 langsung tersambung memakai WiFi yang baru kamu isi lewat HP, sama seperti hasil langkah 4.2.

**Bedah kodenya:**

- **`wm.autoConnect(NAMA_PORTAL)`** melakukan semua langkah Konsep 5: mencoba WiFi tersimpan; kalau belum ada atau gagal, membuka portal dan **menunggu** sampai kamu mengisinya. Menunggu di sini boleh karena hanya terjadi di `setup()`, dan sketsa latihan ini tidak memakai *watchdog*.
- **`wm.setConfigPortalTimeout(180)`** menutup portal sendiri setelah 3 menit tanpa diisi. Tanpa baris ini, portal menunggu selamanya, misalnya kalau router sedang mati saat ESP32 menyala.
- **`wm.setConnectTimeout(20)`** membatasi percobaan menyambung menjadi 20 detik. Tanpanya, kata sandi yang salah membuat ESP32 menunggu sampai 60 detik.
- **`wm.setAPCallback(saatPortalDibuka)`** mendaftarkan fungsi yang dipanggil tepat saat portal dibuka. Polanya sama dengan fungsi peristiwa WiFi di Praktik 3.
- **`wm.resetSettings()`** menghapus WiFi tersimpan dari NVS. Kita memanggilnya hanya kalau tombol D13 ditahan saat papan menyala; isi map NVS milikmu sendiri, misalnya ambang siram Node 1, tidak ikut terhapus.
- **`wm.setDebugOutput(false)`** mematikan catatan bawaan **WiFiManager** (baris-baris berawalan `*wm:`) supaya Serial Monitor tetap rapi. Ingin mengintip cara kerjanya? Hapus baris ini.
- **Siapa yang menyimpan kata sandinya, dan di mana?** Bukan **WiFiManager**, melainkan paket esp32 sendiri, di bagian NVS milik WiFi. Setiap `WiFi.begin(nama, sandi)` menimpa simpanan itu dengan yang terbaru; itulah yang terjadi di Kemenangan Cepat sampai Praktik 3. Sebaliknya, `WiFi.begin()` **tanpa** nama dan kata sandi memakai apa yang tersimpan. Node 1 v1.1 memakai cara terakhir ini.
- **Router mati saat ESP32 menyala?** `autoConnect()` mencoba selama 20 detik, lalu membuka portal selama 3 menit, dan selama itu ESP32 tidak mengerjakan hal lain. Untuk sketsa latihan, itu tidak apa-apa. Untuk Node 1, itu tidak boleh karena listrik padam biasanya mematikan router dan Node 1 bersamaan, dan router menyala lebih lambat. Karena itu, Node 1 v1.1 hanya membuka portal kalau **belum ada** WiFi tersimpan atau kamu **memintanya** dengan menahan tombol D13 (bagian ➕).

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 6](#6-jam-dari-internet-ntp-zona-waktu-dan-cap-waktu-ts) (➡️ di akhir Konsep 6 akan mengantarmu ke Praktik 5).

### Praktik 5 — Jam dari internet (15 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, papan Node 1, dan sketsa `modul10_sambung_ulang`. WiFi-mu harus tersambung ke **internet**, bukan hanya ke router. Bisa juga di Wokwi. Konsep yang dipakai: 6.

1. Buka sketsa `modul10_sambung_ulang`, pilih **File → Save As…**, lalu simpan di folder `modul-10` dengan nama `modul10_jam_internet`. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 10 - Praktik 5: jam dari internet (NTP)
   // ESP32 menanyakan jam ke server NTP, lalu setiap 5 detik mencetak jam setempat
   // dan cap waktu "ts" sesuai kontrak data (Lampiran A Silabus).

   #include <WiFi.h>
   #include <time.h>     // ikut paket esp32: time(), localtime_r(), gmtime_r(), strftime()
   #include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

   // Zona waktu ditulis dengan aturan POSIX: nama zona, lalu selisihnya dari UTC dengan tanda TERBALIK.
   // WIB = UTC+7 ditulis "WIB-7". Di Indonesia tengah: "WITA-8". Di Indonesia timur: "WIT-9".
   const char ZONA_WAKTU[] = "WIB-7";
   const char SERVER_NTP_1[] = "pool.ntp.org";       // kumpulan server NTP sukarelawan; otomatis memilih yang dekat
   const char SERVER_NTP_2[] = "asia.pool.ntp.org";  // cadangan: kumpulan server di Asia
   const unsigned long JEDA_CETAK = 5000;            // cetak jam setiap 5 detik

   const char* NAMA_HARI[] = { "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu" };
   const char* NAMA_BULAN[] = { "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
                                "Agustus", "September", "Oktober", "November", "Desember" };

   bool jamSudahDisetel = false;
   unsigned long waktuCetakTerakhir = 0;

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     Serial.printf("Tersambung, IP %s\n", WiFi.localIP().toString().c_str());

     // Satu baris ini: atur zona waktu, lalu minta paket esp32 menanyakan jam ke server NTP.
     // Ia bertanya di belakang layar (tidak menunggu), lalu bertanya lagi sendiri setiap 3 jam.
     configTzTime(ZONA_WAKTU, SERVER_NTP_1, SERVER_NTP_2);
     Serial.println("Menanyakan jam ke server NTP...");
   }

   void loop() {
     if (millis() - waktuCetakTerakhir < JEDA_CETAK) {
       return;
     }
     waktuCetakTerakhir = millis();

     time_t sekarang = time(nullptr);  // jumlah detik sejak 1 Januari 1970 pukul 00:00 UTC
     struct tm lokal;                  // "formulir" tanggal dan jam: tahun, bulan, hari, jam, menit, detik
     localtime_r(&sekarang, &lokal);   // isi formulir dengan jam setempat (memakai ZONA_WAKTU)

     if (lokal.tm_year + 1900 < 2025) {  // tm_year dihitung dari tahun 1900
       Serial.printf("Jam belum disetel: ESP32 masih mengira sekarang tahun %d.\n", lokal.tm_year + 1900);
       return;
     }
     if (!jamSudahDisetel) {
       jamSudahDisetel = true;
       Serial.printf("Jam disetel dari internet! time() = %lld detik sejak 1 Januari 1970 UTC.\n", (long long)sekarang);
     }

     // Cap waktu ts (Lampiran A): selalu UTC, format ISO-8601, diakhiri huruf Z.
     struct tm utc;
     gmtime_r(&sekarang, &utc);
     char ts[21];  // "2026-10-17T01:23:45Z" = 20 huruf + tanda akhir teks
     strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%SZ", &utc);

     char jam[16];  // "08:23:45 WIB"; %Z = nama zona waktu
     strftime(jam, sizeof(jam), "%H:%M:%S %Z", &lokal);
     Serial.printf("%s, %d %s %d pukul %s | ts: %s\n", NAMA_HARI[lokal.tm_wday], lokal.tm_mday,
                   NAMA_BULAN[lokal.tm_mon], lokal.tm_year + 1900, jam, ts);
   }
   ```

2. Kalau kamu tinggal di wilayah WITA atau WIT, ubah `"WIB-7"` di baris `ZONA_WAKTU` menjadi `"WITA-8"` atau `"WIT-9"`.
3. Klik **Upload**, lalu buka **Serial Monitor**.

   **Hasilnya** (rekaman Wokwi, pada pagi hari 17 Oktober 2026):

   ```text
   Menyambung ke "Wokwi-GUEST"................
   Tersambung, IP 10.10.0.2
   Menanyakan jam ke server NTP...
   Jam belum disetel: ESP32 masih mengira sekarang tahun 1970.
   Jam disetel dari internet! time() = 1792200296 detik sejak 1 Januari 1970 UTC.
   Sabtu, 17 Oktober 2026 pukul 08:24:56 WIB | ts: 2026-10-17T01:24:56Z
   Sabtu, 17 Oktober 2026 pukul 08:25:01 WIB | ts: 2026-10-17T01:25:01Z
   Sabtu, 17 Oktober 2026 pukul 08:25:06 WIB | ts: 2026-10-17T01:25:06Z
   Sabtu, 17 Oktober 2026 pukul 08:25:11 WIB | ts: 2026-10-17T01:25:11Z
   Sabtu, 17 Oktober 2026 pukul 08:25:16 WIB | ts: 2026-10-17T01:25:16Z
   ```

4. Cocokkan jamnya dengan jam di HP-mu tepat saat baris baru muncul (setiap 5 detik): selisihnya paling banyak satu-dua detik.
5. Perhatikan pasangan jam setempat dan `ts`. Selisihnya selalu 7 jam (WIB), 8 jam (WITA), atau 9 jam (WIT). Kalau kamu menjalankannya sebelum pukul 07.00 WIB (08.00 WITA, 09.00 WIT), tanggal di `ts` masih **kemarin** (Konsep 6).
6. **Tekan EN.** Sesudah `Menanyakan jam ke server NTP...`, biasanya muncul lagi `Jam belum disetel: ESP32 masih mengira sekarang tahun 1970.` (kalau jawabannya datang sangat cepat, baris ini bisa terlewat), lalu jamnya benar lagi. Inilah sebabnya setiap kali Node 1 menyala, ia menunggu jam dari internet dulu sebelum mengirim data.

**Bedah kodenya:**

- **`time(nullptr)`** menjawab jumlah detik sejak 1 Januari 1970 pukul 00.00 UTC. Angka inilah "jam" sebenarnya di dalam ESP32. Untuk 17 Oktober 2026, angkanya sekitar 1,79 miliar.
- **`localtime_r()`** dan **`gmtime_r()`** memecah angka detik itu menjadi "formulir" `struct tm` berisi tahun, bulan, tanggal, jam, menit, dan detik. Yang pertama memakai `ZONA_WAKTU`, yang kedua selalu UTC. Huruf `_r` di belakang namanya berarti versi yang aman dipakai bersama tugas lain; selalu pilih versi ini.
- **`tm_year` dihitung dari tahun 1900** dan **`tm_mon` dari 0** (Januari = 0). Itu sebabnya kode menulis `lokal.tm_year + 1900` dan memakai `tm_mon` langsung sebagai nomor laci di `NAMA_BULAN`, yang juga dimulai dari 0. Begitu pula `tm_wday`: Minggu = 0.
- **`strftime()`** menyusun teks dari formulir itu dengan pola, misalnya `%Y-%m-%dT%H:%M:%SZ` untuk `ts`. `%Z` diganti dengan nama zona waktu (`WIB`). Nama hari dan bulan tidak kita ambil dari `strftime()` karena hasilnya selalu berbahasa Inggris.

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 7](#7-http-surat-menyurat-antarperangkat-berisi-json) (➡️ di akhir Konsep 8 akan mengantarmu ke Praktik 6).

### Praktik 6 — Cuaca dari internet (20 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, papan Node 1, sketsa `modul10_jam_internet`, dan library baru **ArduinoJson**. Bisa juga di Wokwi: klik tab **Library Manager** → tombol bulat **+** → ketik **ArduinoJson** → klik hasilnya, seperti di Modul 6, lalu ubah baris di tab `libraries.txt` menjadi `ArduinoJson@7.4.3`. Konsep yang dipakai: 7 dan 8.

Ingat `cuaca.js` di Modul 4? Sekarang ESP32 sendiri yang menanyakan cuaca ke Open-Meteo, lewat HTTPS.

#### 6.1 Pasang library ArduinoJson

1. Di Arduino IDE, buka **Library Manager** (ikon buku di bilah kiri), lalu ketik **ArduinoJson**.
2. Pilih **ArduinoJson** yang di bawah judulnya tertulis **by Benoit Blanchon**, versi **7.4.3**, lalu klik **INSTALL**. Library ini tidak membutuhkan library pendamping. Hati-hati dengan library lain yang namanya mirip, misalnya **Arduino_JSON** buatan Arduino: cara pakainya berbeda.

#### 6.2 Minta cuaca

1. Buka sketsa `modul10_jam_internet`, pilih **File → Save As…**, lalu simpan di folder `modul-10` dengan nama `modul10_cuaca`. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 10 - Praktik 6: cuaca dari internet (HTTPS GET + ArduinoJson)
   // ESP32 meminta cuaca terkini ke API gratis Open-Meteo (seperti di Modul 4) setiap menit,
   // lalu membaca jawabannya yang berbentuk JSON.
   // Data cuaca: Open-Meteo.com, lisensi CC BY 4.0 - https://open-meteo.com/

   #include <WiFi.h>
   #include <WiFiClientSecure.h>  // ikut paket esp32: sambungan HTTPS ("amplop tersegel")
   #include <HTTPClient.h>        // ikut paket esp32: menulis surat HTTP dan membaca balasannya
   #include <ArduinoJson.h>       // library baru minggu ini: membaca dan menulis JSON
   #include "secrets.h"           // berisi WIFI_NAMA dan WIFI_SANDI

   // Alamat API disusun dari beberapa potong teks; C++ menyambungnya menjadi satu.
   const char ALAMAT_CUACA[] =
     "https://api.open-meteo.com/v1/forecast"
     "?latitude=-6.2&longitude=106.85"  // Jakarta. Ganti dengan lokasimu, seperti di Modul 4
     "&current=temperature_2m,relative_humidity_2m,weather_code"
     "&timezone=auto";
   const unsigned long JEDA_TANYA = 60000;  // tanya setiap 1 menit (datanya sendiri diperbarui setiap 15 menit)

   unsigned long waktuTanyaTerakhir = 0;
   bool sudahBertanya = false;

   // Kode cuaca WMO yang paling sering muncul di Indonesia (sama dengan cuaca.js di Modul 4).
   const char* kondisiCuaca(int kode) {
     switch (kode) {
       case 0: return "cerah";
       case 1: return "cerah berawan";
       case 2: return "berawan sebagian";
       case 3: return "mendung";
       case 45: return "berkabut";
       case 51: return "gerimis ringan";
       case 53: return "gerimis";
       case 55: return "gerimis lebat";
       case 61: return "hujan ringan";
       case 63: return "hujan sedang";
       case 65: return "hujan lebat";
       case 80: return "hujan lokal ringan";
       case 81: return "hujan lokal";
       case 82: return "hujan lokal lebat";
       case 95: return "badai petir";
       default: return "kode cuaca lain";
     }
   }

   void tanyaCuaca() {
     WiFiClientSecure klien;
     klien.setInsecure();  // SEMENTARA: amplop tersegel, tetapi identitas server TIDAK diperiksa (Konsep 8, Modul 27)

     HTTPClient http;
     http.setConnectTimeout(5000);  // paling lama 5 detik untuk tersambung ke server
     http.setTimeout(5000);         // paling lama 5 detik menunggu balasan

     Serial.println("Mengirim GET ke api.open-meteo.com ...");
     unsigned long mulai = millis();
     http.begin(klien, ALAMAT_CUACA);
     int kode = http.GET();  // kirim surat permintaan, tunggu balasannya

     if (kode <= 0) {  // angka 0 atau negatif: tidak ada balasan dari server (surat tidak sampai, atau balasan tidak datang)
       Serial.printf("Gagal mengirim: %s (kode %d)\n", http.errorToString(kode).c_str(), kode);
       http.end();
       return;
     }
     Serial.printf("Kode status: %d, dijawab dalam %lu ms\n", kode, millis() - mulai);
     String isi = http.getString();  // isi balasan (body), berupa teks JSON
     http.end();                     // selesai: tutup sambungan
     if (kode != 200) {
       Serial.println("Server menolak permintaan. Isi balasannya:");
       Serial.println(isi);
       return;
     }
     Serial.println("Isi balasan (JSON):");
     Serial.println(isi);

     // "Wadah" JSON dari ArduinoJson. Teks JSON dari server dituangkan ke dalamnya (teks -> wadah).
     JsonDocument dokumen;
     DeserializationError galat = deserializeJson(dokumen, isi);
     if (galat) {
       Serial.printf("JSON tidak bisa dibaca: %s\n", galat.c_str());
       return;
     }
     const char* waktu = dokumen["current"]["time"];
     const char* zona = dokumen["timezone"];
     float suhu = dokumen["current"]["temperature_2m"];
     int lembap = dokumen["current"]["relative_humidity_2m"];
     int kodeCuaca = dokumen["current"]["weather_code"];

     Serial.printf("Waktu    : %s (%s)\n", waktu, zona);
     Serial.printf("Suhu     : %.1f C\n", suhu);
     Serial.printf("Lembap   : %d %%\n", lembap);
     Serial.printf("Kondisi  : %s (kode %d)\n", kondisiCuaca(kodeCuaca), kodeCuaca);
     Serial.println("Sumber data: Open-Meteo.com (CC BY 4.0)");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     Serial.printf("Tersambung, IP %s\n", WiFi.localIP().toString().c_str());
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // tanpa WiFi, surat tidak bisa dikirim
     }
     if (!sudahBertanya || millis() - waktuTanyaTerakhir >= JEDA_TANYA) {
       sudahBertanya = true;
       waktuTanyaTerakhir = millis();
       Serial.println();
       tanyaCuaca();
     }
   }
   ```

2. Kalau di Modul 4 kamu sudah mengganti lintang dan bujur dengan lokasimu, pakai lagi angka yang sama di baris `?latitude=…&longitude=…`.
3. Klik **Upload**, lalu buka **Serial Monitor**. Cuaca ditanyakan sekali di awal, lalu setiap 1 menit.

   **Hasilnya** (rekaman Wokwi; isi balasannya sangat panjang dan tercetak dalam satu baris):

   ```text
   Menyambung ke "Wokwi-GUEST"...............
   Tersambung, IP 10.10.0.2

   Mengirim GET ke api.open-meteo.com ...
   Kode status: 200, dijawab dalam 6445 ms
   Isi balasan (JSON):
   {"latitude":-6.221441,"longitude":106.856186,"generationtime_ms":0.13720989227294922,"utc_offset_seconds":25200,"timezone":"Asia/Jakarta","timezone_abbreviation":"GMT+7","elevation":14.0,"current_units":{"time":"iso8601","interval":"seconds","temperature_2m":"°C","relative_humidity_2m":"%","weather_code":"wmo code"},"current":{"time":"2026-10-17T09:45","interval":900,"temperature_2m":33.6,"relative_humidity_2m":44,"weather_code":2}}
   Waktu    : 2026-10-17T09:45 (Asia/Jakarta)
   Suhu     : 33.6 C
   Lembap   : 44 %
   Kondisi  : berawan sebagian (kode 2)
   Sumber data: Open-Meteo.com (CC BY 4.0)
   ```

**Bedah kodenya:**

- **`http.GET()`** mengirim surat permintaan, menunggu balasan, lalu menjawab **kode statusnya**. Angka 0 atau negatif berarti tidak ada balasan dari server: suratnya tidak sampai, atau balasannya tidak datang tepat waktu. `http.errorToString(kode)` menerjemahkannya, misalnya `connection refused`.
- **`http.getString()`** mengambil isi balasan (*body*) sebagai teks, dan **`http.end()`** menyelesaikan surat itu, lalu merapikan **HTTPClient** sebelum surat berikutnya. Di sketsa ini, `http` dan `klien` dibuat ulang setiap kali `tanyaCuaca()` berjalan, jadi sambungan lamanya ikut ditutup saat fungsi selesai. Tetap biasakan memanggil `end()` karena kelak **HTTPClient** sering dipakai berulang kali.
- **`deserializeJson(dokumen, isi)`** mengubah teks JSON menjadi wadah yang bisa dibaca seperti objek JavaScript: `dokumen["current"]["temperature_2m"]` sama dengan `data.current.temperature_2m` di Modul 4. Kalau JSON-nya rusak atau terpotong, `galat` berisi alasannya.
- **`WiFiClientSecure` + `setInsecure()`**: sambungan HTTPS dengan amplop tersegel, tetapi identitas server tidak diperiksa (Konsep 8). Komentar `SEMENTARA` mengingatkan kita bahwa Modul 27 akan menggantinya.
- **Dijawab dalam berapa milidetik?** Di papan asli, permintaan HTTPS pertama biasanya butuh 1–3 detik karena ESP32 harus bertukar kunci rahasia dengan server lebih dulu. Wokwi lebih lambat lagi. Itulah sebabnya `JEDA_TANYA` tidak boleh terlalu kecil dan sketsa yang diawasi *watchdog* harus memakai batas waktu yang pendek.
- **Etika memakai API gratis** dari Modul 4 tetap berlaku: data cuaca hanya diperbarui setiap 15 menit, jadi bertanya setiap menit pun sebenarnya sudah berlebihan. Untuk latihan sebentar tidak apa-apa; kalau ingin membiarkannya berjalan lama, ubah `JEDA_TANYA` menjadi `900000` (15 menit).

### Praktik 7 — Kirim bacaan ke laptop (30 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, **VS Code** dengan folder `rumah-pintar-mini` dari Modul 4, papan Node 1 (DHT22 dan LDR mendapat 3,3 V dari ESP32, jadi MB102 boleh tetap mati), dan sketsa `modul10_cuaca`. **Laptop dan ESP32 harus tersambung ke WiFi yang sama.** Wokwi tidak bisa menjangkau laptopmu, jadi praktik ini harus dikerjakan di papan asli. Konsep yang dipakai: 1, 7, dan 8.

Di Modul 4, `kirim-data.js` berpura-pura menjadi ESP32. Sekarang ESP32 sungguhan yang mengirim bacaan sensornya ke `penerima-webhook.js` di laptopmu. Ini latihan untuk syarat lulus di bagian ➕ E.

#### 7.1 Cari alamat IP laptopmu

ESP32 perlu tahu "nomor rumah" laptopmu. Jangan memakai `localhost`: bagi ESP32, `localhost` adalah dirinya sendiri.

- **Windows:** buka terminal VS Code (atau **Command Prompt**), lalu ketik `ipconfig` dan tekan **Enter**. Cari bagian **`Wireless LAN adapter Wi-Fi:`**, lalu baca angka di baris **`IPv4 Address`**:

  ```text
  Wireless LAN adapter Wi-Fi:

     Connection-specific DNS Suffix  . :
     Link-local IPv6 Address . . . . . : fe80::…
     IPv4 Address. . . . . . . . . . . : 192.168.1.10
     Subnet Mask . . . . . . . . . . . : 255.255.255.0
     Default Gateway . . . . . . . . . : 192.168.1.1
  ```

  Abaikan bagian lain, seperti `Local Area Connection*`, adaptor VPN, atau VirtualBox. Cara lain tanpa perintah: **Settings → Network & internet → Wi-Fi**, klik nama WiFi yang sedang tersambung (atau **Properties**), lalu lihat **IPv4 address**.
- **macOS:** di Terminal, ketik `ipconfig getifaddr en0` (kalau hasilnya kosong, coba `en1`). Cara lain: **System Settings → Network → Wi-Fi → Details → TCP/IP**.
- **Linux:** ketik `hostname -I`; alamat pertama biasanya alamat WiFi-mu.

Tulis alamat itu di `catatan-modul10.md`. Tiga angka pertamanya harus sama dengan alamat ESP32 di kartu jaringanmu (Praktik 2). Kalau berbeda, laptop dan ESP32 tidak berada di jaringan yang sama; buka "ESP32 dan laptop beda jaringan" di 🚨.

#### 7.2 Nyalakan penerima di laptop

1. Di VS Code, buka folder `rumah-pintar-mini`, lalu buka terminal (**Terminal → New Terminal**) dan masuk ke folder `alat`:

   ```bash
   cd alat
   ```

2. Jalankan penerimanya:

   ```bash
   node penerima-webhook.js
   ```

   **Hasilnya:**

   ```text
   Penerima siap di http://localhost:3000 — tekan Ctrl + C untuk berhenti.
   ```

   Tulisan `localhost` itu hanya contoh untuk laptopmu sendiri. Sebenarnya penerima ini mendengarkan di **semua** alamat laptopmu, termasuk alamat WiFi-nya.

3. **Windows: jendela izin *firewall*.** Saat penerima mulai menunggu sambungan, Windows bisa memunculkan jendela `Windows Security` untuk aplikasi **Node.js JavaScript Runtime**. Di Windows 11, judulnya biasanya `Do you want to allow public and private networks to access this app?`; klik **Allow**. Kalau judulnya menyebut `public`, izin ini juga berlaku di jaringan **umum**. Supaya sama amannya dengan Modul 4, setelah itu buka daftar izin dengan cara di langkah 5, lalu hilangkan centang **Public** untuk **Node.js JavaScript Runtime**. Di Windows 10, judulnya `Windows Defender Firewall has blocked some features of this app`; centang **Private networks** saja, lalu klik **Allow access**. Kalau kamu sudah menjawabnya di Modul 4, jendela ini tidak muncul lagi.
4. **Windows 10 dan 11: jadikan WiFi rumahmu jaringan pribadi.** Windows 11 menganggap setiap WiFi baru sebagai jaringan **umum** (**Public network**) yang tertutup dari perangkat lain, dan di Windows 10 pun WiFi rumahmu bisa berprofil **Public**. Buka **Settings → Network & internet → Wi-Fi**, klik nama WiFi rumahmu (atau **Properties**), lalu pada **Network profile type** pilih **Private network**. Di Windows 10, nama menunya sedikit berbeda, tetapi pilihannya sama: **Private**. Lakukan ini **hanya** untuk WiFi rumahmu sendiri, bukan WiFi kafe atau kampus.
5. **Dulu memilih Cancel?** Windows lalu diam-diam memblokir Node.js dan tidak bertanya lagi. Inilah cara membukanya, seperti yang dijanjikan di Modul 4: buka aplikasi **Windows Security → Firewall & network protection → Allow an app through firewall**, klik **Change settings**, cari **Node.js JavaScript Runtime** di daftar **Allowed apps and features**, centang kolom **Private**, kosongkan kolom **Public** (hilangkan centangnya kalau ada), lalu klik **OK**. Kalau namanya tidak ada di daftar, klik **Allow another app…** dan pilih file `node.exe`.

**macOS:** kalau *firewall*-nya menyala, macOS bertanya apakah `node` boleh menerima sambungan masuk; pilih **Allow**.

#### 7.3 Kirim dari ESP32

1. Buka sketsa `modul10_cuaca`, pilih **File → Save As…**, lalu simpan di folder `modul-10` dengan nama `modul10_kirim_ke_laptop`. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 10 - Praktik 7: kirim bacaan ke laptop (HTTP POST berisi JSON)
   // Setiap 10 detik, ESP32 mengirim suhu dan kelembapan (DHT22, D14) serta cahaya (LDR, VP)
   // ke penerima-webhook.js (Modul 4) yang berjalan di laptopmu.
   // Laptop dan ESP32 harus tersambung ke WiFi yang SAMA.

   #include <WiFi.h>
   #include <HTTPClient.h>
   #include <ArduinoJson.h>
   #include <DHT.h>  // library DHT dari Modul 6
   #include <time.h>
   #include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

   // GANTI 192.168.1.10 dengan alamat IP laptopmu (cara mencarinya ada di Praktik 7).
   // HTTP polos (bukan HTTPS): hanya untuk server buatan sendiri di jaringan rumah (Konsep 8).
   const char ALAMAT_PENERIMA[] = "http://192.168.1.10:3000/telemetry";

   const int PIN_DHT = 14;  // DHT22, Modul 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Modul 6
   const char ZONA_WAKTU[] = "WIB-7";
   const unsigned long JEDA_KIRIM = 10000;  // kirim setiap 10 detik (Node 1 di bagian ➕: setiap 1 menit)

   DHT dht(PIN_DHT, DHT22);
   unsigned long waktuKirimTerakhir = 0;
   int nomorKiriman = 0;

   // Cap waktu ts (Lampiran A), sama dengan Praktik 5. Menjawab false kalau jam belum disetel dari internet.
   bool buatTs(char* ts, size_t ukuran) {
     time_t sekarang = time(nullptr);
     struct tm utc;
     gmtime_r(&sekarang, &utc);
     if (utc.tm_year + 1900 < 2025) {
       return false;
     }
     strftime(ts, ukuran, "%Y-%m-%dT%H:%M:%SZ", &utc);
     return true;
   }

   void kirimBacaan() {
     char ts[21];
     if (!buatTs(ts, sizeof(ts))) {
       Serial.println("Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).");
       return;
     }

     // 1. Baca sensor, lalu susun isi surat (body) dengan ArduinoJson.
     int kelembapan = -1;  // -1 = gagal dibaca, seperti Node 1
     float bacaanKelembapan = dht.readHumidity();
     if (!isnan(bacaanKelembapan)) {
       kelembapan = round(bacaanKelembapan);
     }
     JsonDocument dokumen;
     dokumen["ts"] = ts;
     dokumen["suhu"] = dht.readTemperature();  // NAN (gagal dibaca) ditulis ArduinoJson sebagai null
     dokumen["kelembapan"] = kelembapan;
     dokumen["cahaya"] = 4095 - analogRead(PIN_LDR);  // dibalik seperti Node 1: makin terang, makin besar
     char isi[128];
     serializeJson(dokumen, isi, sizeof(isi));  // wadah -> teks JSON

     // 2. Kirim surat POST ke laptop.
     HTTPClient http;
     http.setConnectTimeout(2000);  // laptop ada di rumah: 2 detik sudah sangat lama
     http.setTimeout(2000);
     http.begin(ALAMAT_PENERIMA);
     http.addHeader("Content-Type", "application/json");  // label amplop: "isinya JSON"
     nomorKiriman++;
     Serial.printf("Kiriman %d: %s\n", nomorKiriman, isi);
     int kode = http.POST(isi);

     // 3. Baca balasannya.
     if (kode <= 0) {
       Serial.printf("  -> gagal: %s (kode %d). Penerima menyala? Alamat IP laptop benar?\n",
                     http.errorToString(kode).c_str(), kode);
     } else {
       Serial.printf("  -> kode status %d, balasan: %s\n", kode, http.getString().c_str());
     }
     http.end();
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     Serial.println();
     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     Serial.printf("Tersambung, IP ESP32 %s. Penerima: %s\n", WiFi.localIP().toString().c_str(), ALAMAT_PENERIMA);
     configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");  // jam dari internet (Praktik 5)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;
     }
     if (millis() - waktuKirimTerakhir >= JEDA_KIRIM) {
       waktuKirimTerakhir = millis();
       kirimBacaan();
     }
   }
   ```

2. **Ganti `192.168.1.10`** di baris `ALAMAT_PENERIMA` dengan alamat IP laptopmu dari langkah 7.1. Bagian `:3000/telemetry` jangan diubah.
3. Klik **Upload**, lalu buka **Serial Monitor**. Bacaan pertama baru dikirim setelah jam disetel dari internet, lalu pengiriman diulang setiap 10 detik. Kalau jamnya belum siap, Serial Monitor menulis `Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).`, dan ESP32 mencoba lagi 10 detik kemudian. Itu wajar.

   **Hasilnya di Serial Monitor** (contoh):

   ```text
   Menyambung ke "RumahKita"..........
   Tersambung, IP ESP32 192.168.1.23. Penerima: http://192.168.1.10:3000/telemetry
   Kiriman 1: {"ts":"2026-10-17T01:30:12Z","suhu":28.5,"kelembapan":71,"cahaya":2310}
     -> kode status 200, balasan: {"ok":true}
   Kiriman 2: {"ts":"2026-10-17T01:30:22Z","suhu":28.5,"kelembapan":71,"cahaya":2304}
     -> kode status 200, balasan: {"ok":true}
   Kiriman 3: {"ts":"2026-10-17T01:30:32Z","suhu":28.6,"kelembapan":70,"cahaya":2311}
     -> kode status 200, balasan: {"ok":true}
   ```

   **Hasilnya di terminal VS Code** (contoh):

   ```text
   Penerima siap di http://localhost:3000 — tekan Ctrl + C untuk berhenti.
   [08.30.12] POST /telemetry
   {"ts":"2026-10-17T01:30:12Z","suhu":28.5,"kelembapan":71,"cahaya":2310}
   [08.30.22] POST /telemetry
   {"ts":"2026-10-17T01:30:22Z","suhu":28.5,"kelembapan":71,"cahaya":2304}
   [08.30.32] POST /telemetry
   {"ts":"2026-10-17T01:30:32Z","suhu":28.6,"kelembapan":70,"cahaya":2311}
   ```

4. **Uji bacaan gagal.** Cabut USB papan Node 1, lalu cabut ujung kabel data DHT22 dari breadboard (seperti uji gagal di Modul 6). Colokkan USB lagi, lalu lihat terminal VS Code: `suhu` kini bernilai `null` dan `kelembapan` bernilai `-1`. Kembalikan kabelnya (cabut USB dulu).
5. **Uji penerima mati.** Di terminal VS Code, tekan **Ctrl + C** untuk mematikan penerima. Kiriman berikutnya di Serial Monitor gagal dengan `connection refused` (kode `-1`), tetapi ESP32 tetap berjalan dan mencoba lagi 10 detik kemudian. Nyalakan lagi penerimanya dengan `node penerima-webhook.js`: kiriman berikutnya kembali `200`.

**Bedah kodenya:**

- **`http.begin(ALAMAT_PENERIMA)`** tanpa `WiFiClientSecure`: alamatnya diawali `http://`, jadi **HTTPClient** memakai sambungan polos ke pintu 3000 (Konsep 8).
- **`http.addHeader("Content-Type", "application/json")`** adalah label di amplop: "isinya JSON". Persis seperti `headers` di `kirim-data.js` Modul 4.
- **`http.POST(isi)`** mengirim surat berisi teks JSON, lalu menjawab kode status balasan. `penerima-webhook.js` selalu membalas `200` dengan isi `{"ok":true}`.
- **`setConnectTimeout(2000)`** dan **`setTimeout(2000)`**: kalau laptopmu mati atau tidak menjawab, ESP32 menyerah setelah 2 detik, bukan 5 detik bawaannya. Node 1 v1.1 memakai 1,5 detik.
- **Mengapa jalurnya `/telemetry`?** Itu hanya nama ruangan yang kita pilih, sama dengan yang dipakai `kirim-data.js`. Penerima kita mencetak kiriman ke jalur mana pun. Di bagian ➕, Node 1 menambahkan `device_id`-nya di jalur, misalnya `/rpm/a4cf12e5b7c0/telemetry`, supaya penerima tahu siapa pengirimnya. Bentuk ini sama dengan nama topik MQTT di Modul 11.

> ⬆️ **Selesai Praktik 7?** Kembali ke [Konsep 9](#9-esp32-menjadi-server-web-dan-cara-menemukan-alamatnya) (➡️ di akhir Konsep 9 akan mengantarmu ke Praktik 8).

### Praktik 8 — Sakelar lampu dari HP (20 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, meja kerja Node 1 dengan **MB102 menyala** (relay butuh 5 V dari MB102; ingat urutannya: USB dulu, baru MB102), **HP** yang tersambung ke WiFi yang sama, dan sketsa `modul10_kirim_ke_laptop`. Di Wokwi, sketsa ini bisa dijalankan, tetapi halamannya tidak bisa dibuka dari browser (lihat catatan Wokwi di "Cara memakai modul ini"). Konsep yang dipakai: 9.

Lampu di meja kerjamu adalah LED indikator relay lampu (D32) dari Modul 5. Sekarang kita menyalakan dan mematikannya dari HP.

1. Buka sketsa `modul10_kirim_ke_laptop`, pilih **File → Save As…**, lalu simpan di folder `modul-10` dengan nama `modul10_sakelar_web`. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 10 - Praktik 8: sakelar lampu dari HP (ESP32 sebagai server web)
   // Buka http://<alamat IP ESP32>/ di browser HP yang tersambung ke WiFi yang SAMA.
   // Tautan /on menyalakan relay lampu (D32), /off mematikannya.
   // Tanpa kata sandi: hanya untuk jaringan rumah, jangan pernah dibuka ke internet.

   #include <WiFi.h>
   #include <WebServer.h>  // ikut paket esp32: ESP32 menjadi server web kecil
   #include <ESPmDNS.h>    // ikut paket esp32: nama node1.local (bonus, Praktik 9)
   #include "secrets.h"    // berisi WIFI_NAMA dan WIFI_SANDI

   const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW (Modul 5)
   const char NAMA_PERANGKAT[] = "node1";

   WebServer server(80);  // 80 = nomor "pintu" bawaan HTTP
   bool lampu = false;

   // Halaman siap tempel. R"( ... )" = teks mentah: boleh memuat petik ganda dan beberapa baris.
   // Tampilan yang cantik menunggu Modul 22.
   const char HALAMAN[] = R"(<!DOCTYPE html>
   <html>
   <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <title>Node 1</title>
   </head>
   <body style="font-family: sans-serif; font-size: 22px; padding: 16px">
   <h2>Lampu: %KEADAAN%</h2>
   <p><a href="/on">Nyalakan lampu</a></p>
   <p><a href="/off">Matikan lampu</a></p>
   </body>
   </html>)";

   void aturLampu(bool nyala) {
     lampu = nyala;
     if (nyala) {
       digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
     } else {
       digitalWrite(PIN_RELAY_LAMPU, HIGH);
     }
   }

   // Kirim halaman dengan keadaan lampu terbaru.
   void kirimHalaman() {
     String html = HALAMAN;
     if (lampu) {
       html.replace("%KEADAAN%", "MENYALA");
     } else {
       html.replace("%KEADAAN%", "PADAM");
     }
     server.send(200, "text/html", html);  // kode status 200 = OK
   }

   // Catat siapa yang meminta apa, misalnya "GET /on dari 192.168.1.42".
   void catatPermintaan() {
     Serial.printf("GET %s dari %s\n", server.uri().c_str(), server.client().remoteIP().toString().c_str());
   }

   void tanganiBeranda() {
     catatPermintaan();
     kirimHalaman();
   }

   void tanganiOn() {
     catatPermintaan();
     aturLampu(true);
     kirimHalaman();
   }

   void tanganiOff() {
     catatPermintaan();
     aturLampu(false);
     kirimHalaman();
   }

   void tanganiTidakAda() {
     catatPermintaan();
     server.send(404, "text/plain", "404: halaman ini tidak ada. Coba /, /on, atau /off");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_RELAY_LAMPU, OUTPUT);
     aturLampu(false);  // segera matikan: pinMode(OUTPUT) baru saja membuat pin LOW (= relay menarik)
     Serial.println();

     WiFi.setHostname(NAMA_PERANGKAT);  // nama yang tampil di daftar perangkat router (Praktik 9)
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }

     server.on("/", tanganiBeranda);  // "kalau ada yang meminta /, jalankan tanganiBeranda()"
     server.on("/on", tanganiOn);
     server.on("/off", tanganiOff);
     server.onNotFound(tanganiTidakAda);
     server.begin();
     Serial.printf("Server web siap. Buka di HP: http://%s/\n", WiFi.localIP().toString().c_str());

     if (MDNS.begin(NAMA_PERANGKAT)) {  // bonus: nama .local (sering gagal di HP Android)
       MDNS.addService("http", "tcp", 80);
       Serial.printf("Atau coba: http://%s.local/ (sering gagal di HP Android)\n", NAMA_PERANGKAT);
     }
   }

   void loop() {
     server.handleClient();  // layani permintaan yang datang, lalu langsung kembali (tidak menunggu)
   }
   ```

2. Klik **Upload**, buka **Serial Monitor**, lalu **nyalakan MB102**.

   **Hasilnya** (contoh):

   ```text
   Menyambung ke "RumahKita"..........
   Server web siap. Buka di HP: http://192.168.1.23/
   Atau coba: http://node1.local/ (sering gagal di HP Android)
   ```

3. Di HP, **matikan data seluler** sebentar supaya HP benar-benar memakai WiFi rumah. Buka browser, lalu ketik alamat dari Serial Monitor di kotak alamat, **lengkap dengan `http://`**, misalnya `http://192.168.1.23/`.

   Browser HP biasanya langsung membuka alamat lokal seperti ini tanpa peringatan. Namun, tulislah `http://` dengan lengkap: server ESP32 hanya melayani HTTP polos, jadi alamat yang tidak sengaja tertulis `https://` tidak akan terbuka.

4. Halaman kecil Node 1 terbuka. Ketuk **Nyalakan lampu**: relay berbunyi "klik", LED indikator relay lampu menyala, dan judul halaman berubah menjadi `Lampu: MENYALA`. Ketuk **Matikan lampu** untuk memadamkannya.

   ![Ilustrasi halaman sakelar lampu Praktik 8 di browser HP, dirender dari HTML sketsa modul10_sakelar_web; alamat IP hanya contoh. Bilah alamat http://192.168.1.23/on. Penanda 1 pada judul Lampu: MENYALA, keadaan lampu sekarang (isi variabel lampu); penanda 2 pada tautan Nyalakan lampu, tautan ke /on yang membuat relay lampu menyala; penanda 3 pada tautan Matikan lampu, tautan ke /off yang membuat relay lampu padam. Kotak di sampingnya: sementara itu, di Serial Monitor tercetak GET / dari 192.168.1.42, GET /favicon.ico dari 192.168.1.42, dan GET /on dari 192.168.1.42](aset/hp-sakelar.png)

5. Lihat Serial Monitor: setiap ketukan tercatat bersama alamat IP HP-mu.

   **Hasilnya** (contoh):

   ```text
   GET / dari 192.168.1.42
   GET /favicon.ico dari 192.168.1.42
   GET /on dari 192.168.1.42
   GET /off dari 192.168.1.42
   ```

6. **Simpan tautannya.** Alamat di browser kini berakhiran `/off` (kalau belum, ketuk **Matikan lampu**). Tambahkan halaman itu ke **Bookmark** atau **Tambahkan ke layar utama** (**Add to Home screen**). Sekarang mematikan lampu cukup satu ketukan. Ingat: tautan ini hanya jalan selama alamat IP ESP32 tidak berubah. Praktik 9 membereskannya.

**Bedah kodenya:**

- **`WebServer server(80);`** menyiapkan server di pintu 80. Karena 80 adalah pintu bawaan HTTP, alamatnya cukup `http://192.168.1.23/` tanpa `:80`.
- **`server.on("/on", tanganiOn);`** mendaftarkan "petugas" untuk setiap jalur. Jalur yang tidak terdaftar dilayani `tanganiTidakAda()` dengan kode `404`.
- **`server.handleClient();`** adalah satu-satunya isi `loop()`. Setiap putaran, ia memeriksa apakah ada browser yang mengetuk; kalau tidak ada, ia segera kembali.
- **`HALAMAN`** adalah teks HTML mentah: `R"( … )"` membuat C++ menerima petik ganda dan beberapa baris tanpa perlu ditandai satu per satu. Penanda `%KEADAAN%` diganti dengan `MENYALA` atau `PADAM` lewat `html.replace()` sebelum dikirim. Halaman yang cantik dibuat dengan HTML, CSS, dan React di Modul 22.
- **`server.client().remoteIP()`** adalah alamat IP browser yang mengetuk. Dengan begitu, kamu tahu perangkat mana yang menyalakan lampu.
- **`GET /favicon.ico`** di Serial Monitor? Itu browser yang meminta ikon kecil untuk tabnya. Ikon itu tidak kita sediakan, jadi wajar dijawab `404`.
- **Mengapa relay tetap mati setelah ESP32 di-*restart*?** `aturLampu(false)` dipanggil tepat setelah `pinMode()`, sama seperti Node 1 sejak Modul 5. Server web yang "lupa" keadaan lampunya setelah *restart* bukan masalah; masalahnya kalau ia menyalakan sesuatu tanpa diminta.

> ⚠️ **Ingat aturan nomor 2 di atas:** halaman ini tanpa kata sandi. Siapa pun di WiFi rumahmu bisa membukanya. Jangan membuat *port forwarding* ke ESP32.

### Praktik 9 — Alamat tetap untuk Node 1 (20 menit)

> 🖥️ **Alat:** browser di laptop atau HP, akses ke **halaman admin router** (kalau ada), **Arduino IDE** dan **Serial Monitor**, meja kerja Node 1 yang masih menjalankan `modul10_sakelar_web` dari Praktik 8 (MB102 menyala), dan **kartu jaringan** dari Praktik 2. Konsep yang dipakai: 1 dan 9.

Tautan `/off` di HP-mu baru berguna kalau alamat ESP32 tidak pernah berubah. Kita minta router "memesankan" nomor rumah untuk ESP32.

#### 9.1 Masuk ke halaman admin router

1. Lihat kolom `Router (gateway)` di kartu jaringanmu, misalnya `192.168.1.1` atau `192.168.0.1`. Buka alamat itu di browser laptop: `http://192.168.1.1`. Router TP-Link juga bisa dibuka lewat `http://tplinkwifi.net`.
2. Router itu bukan milikmu? **Jangan mencoba masuk.** Minta izin pemiliknya, atau langsung lompat ke 9.4. Jangan mengubah setelan router milik orang lain.
3. Masuk dengan nama pengguna dan kata sandi admin. Biasanya keduanya tertulis di **stiker di badan router**. Tidak menemukan kata sandinya? Lompat ke 9.4. Jangan menebak berkali-kali: sebagian router mengunci halaman *login* sementara setelah tiga kali salah.

#### 9.2 Temukan ESP32 di daftar perangkat

Cari halaman daftar perangkat yang tersambung. Di router TP-Link, halaman itu ada di **Advanced → Network → DHCP Client List** atau **Basic → Network Map**. Di router lain, namanya mirip: daftar klien DHCP, *client list*, atau informasi perangkat. Cari nama **`node1`**: itulah nama yang diberikan `WiFi.setHostname()` di sketsa Praktik 8. Pastikan alamat MAC-nya sama dengan yang tercatat di kartu jaringanmu. (ESP32 yang sketsanya tidak memanggil `setHostname()` muncul dengan nama seperti `esp32-E5B7C0`.)

#### 9.3 Pesan alamat tetap (*DHCP reservation*)

1. Cari menu pemesanan alamat. Di router TP-Link: **Advanced → Network → DHCP Server → Address Reservation**. Di router lain, menu ini bisa bernama **DHCP Binding**, **Static DHCP**, atau **DHCP Static IP**, biasanya di bagian LAN atau DHCP. Isinya selalu sama: **alamat MAC** perangkat dan **alamat IP** yang dipesan.
2. Klik **Add**. Isi alamat MAC ESP32 dari kartu jaringanmu (TP-Link memakai tanda hubung: `A4-CF-12-E5-B7-C0`) dan **alamat IP yang sedang dipakai ESP32**, misalnya `192.168.1.23`. Memesan alamat yang sedang dipakai adalah pilihan paling aman: pasti berada di blok yang benar dan tidak sedang dipakai perangkat lain.
3. Simpan, lalu pastikan aturannya aktif (TP-Link: **Status** menyala). Kalau router meminta *reboot* (dinyalakan ulang), beri tahu orang serumah dulu karena internetnya putus sebentar, baru ikuti petunjuknya.
4. **Uji:** matikan MB102, cabut USB papan Node 1, tunggu 10 detik, colokkan lagi, lalu nyalakan MB102. Serial Monitor menulis alamat yang sama (barisnya terlewat karena Serial Monitor baru tersambung lagi? Tekan **EN**). Alamat yang sama sering muncul juga tanpa pemesanan, jadi bukti pastinya adalah alamat MAC ESP32-mu yang kini tercantum di daftar pemesanan router. Tautan `/off` di HP-mu tetap jalan.

> 💡 **Modem bawaan penyedia internet**, misalnya modem fiber, kadang tidak menampilkan menu pemesanan alamat untuk akun pengguna biasa. Kalau begitu, setiap kali papan menyala, catat saja alamat ESP32 dari Serial Monitor atau halaman status OLED Node 1 v1.1, lalu pakai bonus di 9.4.

#### 9.4 Bonus: buka dengan nama `node1.local`

1. Di laptop, buka `http://node1.local/`. Halaman yang sama terbuka, tanpa perlu tahu alamat IP-nya.
2. Coba juga di HP (data seluler dimatikan). Di iPhone biasanya berhasil; di sebagian HP Android tidak. Itu wajar (Konsep 9).
3. Catat hasilnya di `catatan-modul10.md`: perangkat mana yang bisa membuka `node1.local`, dan mana yang tidak.

> ⬆️ **Selesai Praktik 9?** Kembali ke [Konsep 10](#10-harga-wifi-program-membengkak-adc2-terkunci-arus-melonjak).

---

## 🚨 Kalau Tidak Jalan?

Masalah jaringan sering terasa gelap karena kabelnya tidak kelihatan. Minggu ini ada empat sumber bukti: **Serial Monitor** (kode alasan putus, kode status HTTP), **kartu jaringan** dari Praktik 2, **terminal VS Code** tempat penerima berjalan, dan **browser HP**. Mulailah dari yang paling dekat: apakah ESP32 sudah tersambung ke WiFi? Klik judul masalah untuk membuka penjelasannya.

> [!IMPORTANT]
> **Sebelum memeriksa atau memindah kabel di meja kerja:** matikan MB102, lalu cabut USB. Setelah selesai, colokkan USB dulu, baru nyalakan MB102. Untuk masalah jaringan, kabel hampir tidak pernah perlu disentuh.

<details>
<summary><b><code>Compilation error</code> — pesan error minggu ini</b></summary>

Di depan setiap pesan ada nama file dan nomor barisnya. Baca **pesan error pertama** dulu: error-error berikutnya sering hanya akibat dari yang pertama.

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `fatal error: secrets.h: No such file or directory` | Tab `secrets.h` belum ada, atau namanya salah, misalnya `secret.h` atau `Secrets.h`. | Buat tab baru bernama tepat **`secrets.h`** (**⋯ → New Tab**), atau perbaiki namanya lewat **⋯ → Rename**. Sketsa baru? Mulailah dari sketsa sebelumnya dengan **File → Save As…** supaya tabnya ikut tersalin. |
| `'WIFI_NAMA' was not declared in this scope` (atau `'WIFI_SANDI' …`) | Tab `secrets.h` ada, tetapi isinya tidak memakai nama `WIFI_NAMA` dan `WIFI_SANDI`, atau baris `#include "secrets.h"` terhapus. | Samakan isi `secrets.h` dengan contoh di Kemenangan Cepat. |
| `fatal error: WiFiManager.h: No such file or directory` | Library **WiFiManager** belum terpasang. | Pasang **WiFiManager by tzapu** versi **2.0.17** (Praktik 4.1). |
| `fatal error: ESP8266WiFi.h: No such file or directory` (dari file `WiFiManager.h`) | Yang terpasang **WiFiManager** versi lama (0.x) yang hanya untuk ESP8266. | Di **Library Manager**, pilih versi **2.0.17**, lalu klik **INSTALL**. |
| `fatal error: ArduinoJson.h: No such file or directory` | Library **ArduinoJson** belum terpasang. | Pasang **ArduinoJson by Benoit Blanchon** versi **7.4.3** (Praktik 6.1). |
| `'ArduinoJson::V6…::JsonDocument::JsonDocument()' is protected within this context` | Yang terpasang **ArduinoJson** versi 6 (lama). Cara menulis kodenya berbeda. | Di **Library Manager**, pilih versi **7.4.3**, lalu klik **INSTALL** (versi lama otomatis diganti). |
| `fatal error: DHT.h: No such file or directory` | Library DHT dari Modul 6 belum terpasang di laptop ini. | Pasang **DHT sensor library by Adafruit** 1.4.7 (Modul 6). |
| `Sketch too big` dan `text section exceeds available space in board` | Program lebih besar daripada rak program bawaan (1.310.720 byte). | Pilih **ESP32 Dev Module**, lalu ubah **Partition Scheme** menjadi **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)** dan **Flash Mode** menjadi **DIO** (Konsep 10, bagian ➕ A). |

</details>

<details>
<summary><b>Titik-titik terus muncul, lalu <code>Belum tersambung setelah 20 detik</code></b></summary>

ESP32 tidak berhasil masuk ke WiFi-mu. Periksa berurutan:

1. **Nama WiFi** di `secrets.h` sama persis, termasuk huruf besar-kecil, spasi, dan tanda baca. Cara paling pasti: jalankan Praktik 2, lalu salin namanya dari daftar jaringan yang terlihat.
2. **WiFi-mu muncul di daftar Praktik 2?** Kalau tidak muncul, ESP32 tidak bisa melihatnya: WiFi-nya hanya 5 GHz, papan terlalu jauh, atau nama jaringannya disembunyikan. Lihat Konsep 2.
3. **Kata sandi** benar, termasuk huruf besar-kecilnya. Coba ketik ulang di HP untuk memastikan.
4. **Lihat kode alasannya** dengan sketsa Praktik 3: laporan `belum pernah tersambung` menulis alasan terakhirnya. `201` berarti nama tidak ditemukan, `15` atau `204` hampir selalu berarti kata sandi salah, dan `210` atau `211` berarti gemboknya tidak cocok (tabel di Konsep 4).
5. **Jenis WiFi-nya tidak cocok** untuk ESP32: WiFi dengan halaman *login* (hotel, kafe, sebagian kos), WiFi kantor atau kampus yang meminta nama pengguna (misalnya eduroam), atau router lama yang masih memakai gembok WEP atau WPA. Pakai *hotspot* HP.
6. **Di Wokwi:** nama jaringannya `Wokwi-GUEST` dan `WIFI_SANDI` harus kosong (`""`). Kalau diisi kata sandi, alasannya `210` dan ESP32 berhenti mencoba. Kalau namanya salah, alasannya `201`, sama seperti di papan asli.

</details>

<details>
<summary><b>Papan <i>restart</i> tepat saat WiFi mulai menyala (<code>Brownout detector was triggered</code>)</b></summary>

Saat memancarkan sinyal, ESP32 menarik arus jauh lebih besar (Konsep 10). Kalau sumber listriknya lemah, tegangannya anjlok dan pengaman *brownout* me-*restart* papan, seperti di Modul 9. Coba port USB lain di laptop (sebaiknya langsung di badan laptop, bukan lewat *hub* biasa), ganti dengan kabel USB yang lebih pendek dan tebal, atau pakai *hub* USB yang punya catu daya sendiri (Modul 2). *Charger* 1 A dari Modul 9 juga kuat, tetapi selama papan dicolokkan ke *charger*, Serial Monitor tidak bisa dipakai.

</details>

<details>
<summary><b><code>secrets.h</code> telanjur ter-<i>commit</i> atau ter-<i>push</i></b></summary>

**Baru ter-*commit*, belum di-*push*:** di GitHub Desktop, *commit* terakhir tampil di kiri bawah (`Committed …`) dengan tombol **Undo** di sampingnya. Klik **Undo**: *commit*-nya dibatalkan dan file-filenya kembali ke daftar **Changes**. Pasang penjaga seperti Praktik 1, lalu *commit* lagi tanpa `secrets.h`.

**Sudah ter-*push*:** anggap kata sandinya sudah bocor. GitHub tidak akan memperingatkanmu: untuk repositori milik perorangan seperti `belajar-iot`, pemindai rahasianya hanya mengenali kunci layanan tertentu, bukan kata sandi WiFi.

1. **Ganti kata sandi WiFi** di halaman admin router (routernya bukan milikmu? Beri tahu pemiliknya sekarang juga), lalu perbarui `secrets.h` dan semua perangkat di rumah. Inilah langkah terpenting. Menghapus filenya saja tidak cukup: isinya tetap tersimpan di riwayat repositori, dan mungkin sudah tersalin orang lain.
2. **Keluarkan `secrets.h` dari pencatatan Git.** Semua file `secrets.h` bernama sama, jadi buat dulu satu folder di Desktop untuk setiap sketsa yang `secrets.h`-nya telanjur ter-*commit* (beri nama yang sama dengan sketsanya, misalnya `modul10_halo_wifi`) supaya file-filenya tidak saling menimpa. Sesudah itu, pindahkan sementara setiap `secrets.h` itu dari folder `belajar-iot` ke folder Desktop yang sesuai. Isi **Summary** dengan `Hapus secrets.h`, klik **Commit … to main**, lalu **Push origin**. Pasang penjaga seperti Praktik 1, lalu kembalikan setiap file ke folder sketsanya semula. Sekarang GitHub Desktop mengabaikannya.
3. **Menghapus dari riwayat** adalah langkah lanjutan yang berisiko. Panduannya ada di dokumentasi GitHub "Removing sensitive data from a repository". Setelah kata sandi diganti, langkah ini tidak wajib.

</details>

<details>
<summary><b>Portal WiFi tidak muncul di HP, atau <code>192.168.4.1</code> tidak bisa dibuka</b></summary>

- **WiFi `Node1-Latihan` (atau `Node1-Rumah`) tidak ada di daftar WiFi HP:** portal sudah menutup sendiri setelah 3 menit, atau ESP32 langsung tersambung ke WiFi tersimpan. Lihat Serial Monitor. Untuk membuka portal lagi, tahan tombol D13, tekan lalu lepas **EN**, dan baru lepaskan D13 sekitar 2 detik kemudian (Praktik 4.3) atau setelah layar OLED menulis `PORTAL WIFI` (Node 1 v1.1, langkah ➕ D4).
- **HP sudah tersambung, tetapi halaman tidak muncul:** matikan data seluler, pilih tetap tersambung kalau HP bertanya soal akses internet, lalu ketik `http://192.168.4.1` lengkap dengan `http://`. Matikan juga VPN di HP.
- **Lembar *login* di iPhone tidak sengaja tertutup:** buka lagi pengaturan WiFi, sambungkan ulang ke `Node1-Latihan`, lalu buka `http://192.168.4.1` di Safari.
- **Daftar WiFi di portal kosong** (`No networks found. Refresh to scan again.`): ketuk **Refresh**, atau ketik nama WiFi-mu sendiri di kotak **SSID**. WiFi 5 GHz memang tidak pernah muncul.
- **Setelah Save, portal muncul lagi:** ESP32 gagal tersambung, biasanya karena kata sandi salah atau WiFi yang dipilih hanya 5 GHz. Isi ulang dengan teliti.

</details>

<details>
<summary><b>Jam tidak pernah disetel (<code>Jam belum disetel</code> terus)</b></summary>

- **WiFi-nya tersambung, tetapi internetnya mati?** Buka sebuah situs di HP yang tersambung ke WiFi yang sama, dengan data seluler dimatikan. NTP butuh internet, bukan hanya router.
- **Jaringan kantor, kampus, atau kos** kadang memblokir NTP. Coba *hotspot* HP.
- **`configTzTime()` dipanggil sebelum ESP32 mendapat alamat IP?** Pertanyaan pertamanya gagal, dan ESP32 baru mencoba lagi sekitar 15 detik kemudian. Tunggu sebentar, atau pindahkan baris itu supaya baru dijalankan setelah ESP32 tersambung, seperti di Praktik 5.
- **Zona waktu salah tulis**, misalnya `"WIB+7"`: jamnya tetap jalan, tetapi meleset 14 jam. Tulis `"WIB-7"` (Konsep 6).

</details>

<details>
<summary><b>Cuaca gagal: <code>Gagal mengirim: connection refused (kode -1)</code></b></summary>

Angka `-1` berarti suratnya tidak pernah sampai. Penyebabnya bisa apa saja yang terjadi sebelum server menjawab: WiFi tanpa internet, nama `api.open-meteo.com` tidak bisa dicari (DNS), sinyal yang sangat lemah, atau sambungan HTTPS yang gagal. Periksa internetnya lewat HP (data seluler dimatikan), pastikan baris `klien.setInsecure();` tidak terhapus (tanpanya, sambungan HTTPS langsung gagal), lalu tunggu permintaan berikutnya. Kode `400` berarti alamatnya ditolak Open-Meteo: periksa lintang dan bujurnya, seperti di Modul 4.

</details>

<details>
<summary><b>Kiriman ke laptop gagal: <code>connection refused (kode -1)</code> atau <code>read Timeout (kode -11)</code></b></summary>

ESP32 tidak bisa menghubungi penerima di laptopmu. Periksa berurutan:

1. **Penerimanya menyala?** Terminal VS Code harus menampilkan `Penerima siap di http://localhost:3000`. Muncul `Error: listen EADDRINUSE` saat menjalankannya? Penerima lama masih berjalan di terminal lain: lihat 🚨 Modul 4.
2. **Alamat IP laptop benar?** Jalankan lagi Praktik 7.1. Alamat laptop juga bisa berubah setelah laptop tidur atau router dinyalakan ulang.
3. **Uji dari HP dulu.** Buka `http://<IP laptop>:3000/` di browser HP yang tersambung ke WiFi yang sama, dengan data seluler dimatikan. Kalau terminal VS Code mencetak `GET /`, jaringannya beres dan masalahnya ada di sketsa (biasanya salah ketik di `ALAMAT_PENERIMA`). Kalau HP pun tidak bisa, masalahnya di laptop atau jaringan; lanjut ke langkah 4–5.
4. ***Firewall* laptop** menahan sambungan masuk. Di Windows, pastikan **Node.js JavaScript Runtime** diizinkan untuk jaringan **Private** dan WiFi rumahmu berprofil **Private network** (Praktik 7.2 langkah 3–5). Aplikasi antivirus atau VPN yang punya *firewall* sendiri juga bisa menahannya; matikan VPN selama praktik.
5. **Laptop dan ESP32 beda jaringan.** Lihat rincian "ESP32 dan laptop beda jaringan" di bawah.

</details>

<details>
<summary><b>ESP32 dan laptop beda jaringan</b></summary>

Tiga angka pertama alamat IP keduanya harus sama (Konsep 1). Kalau berbeda, biasanya karena:

- Laptop tersambung ke **WiFi lain**, misalnya WiFi tetangga, *hotspot* HP, atau jaringan **5 GHz yang memakai nama berbeda** dan blok alamat yang berbeda. Sambungkan laptop ke WiFi yang sama dengan ESP32.
- Laptop memakai **kabel LAN** ke router lain, atau **VPN** sedang menyala. Matikan VPN selama praktik.
- Salah satunya tersambung ke **WiFi tamu** (*guest*). WiFi tamu biasanya mengisolasi setiap perangkat sehingga perangkat-perangkat itu tidak bisa saling menghubungi. Pakai WiFi utama.
- Router atau *hotspot* menyalakan **isolasi perangkat** (*AP isolation* atau *client isolation*): perangkat di WiFi yang sama sengaja tidak boleh saling menghubungi. Ini biasa di WiFi kos, kampus, dan kafe. Matikan fitur itu di halaman admin router kalau router itu milikmu sendiri, atau pakai *hotspot* HP Android atau laptop.

</details>

<details>
<summary><b>HP tidak bisa membuka halaman ESP32</b></summary>

- **Data seluler masih menyala**, atau HP tersambung ke WiFi lain (misalnya WiFi tamu). Matikan data seluler, lalu pastikan HP tersambung ke WiFi yang sama dengan ESP32.
- **Alamatnya salah atau sudah berubah.** Lihat alamat terbaru di Serial Monitor, di halaman status OLED (Node 1 v1.1), atau di daftar perangkat router. Praktik 9 mencegah alamat berubah lagi.
- **Tertulis `https://`.** Server ESP32 hanya melayani `http://`.
- **`node1.local` tidak bisa dibuka.** Wajar di banyak HP Android (Konsep 9). Pakai alamat IP-nya.
- **VPN di HP menyala.** Matikan selama praktik.
- **Halamannya terbuka dan tulisannya berubah, tetapi relay tidak berbunyi:** MB102 belum dinyalakan. Relay butuh 5 V dari MB102.

</details>

<details>
<summary><b>Node 1 v1.1: masalah khusus</b></summary>

- **Serial Monitor menulis `Mode Wokwi`** padahal di papan asli: `PAKAI_WOKWI` di `konfigurasi.h` masih `true`. Ubah menjadi `false`, lalu unggah ulang. Itu belum cukup: mode Wokwi tadi sudah menimpa WiFi rumah yang tersimpan di NVS dengan `Wokwi-GUEST` (setiap `WiFi.begin()` dengan nama WiFi menimpanya, Bedah Praktik 4), jadi Serial Monitor kini menulis `Menyambung ke WiFi tersimpan "Wokwi-GUEST" (tanpa menunggu)...`. Buka portal seperti langkah ➕ D4, lalu simpan lagi WiFi rumahmu.
- **`Gagal kirim: connection refused (kode -1)` setiap menit:** sama dengan masalah kiriman ke laptop di atas. Periksa juga `ALAMAT_SERVER`: cukup `http://` + alamat IP laptop + `:3000`, tanpa jalur di belakangnya. Jalur `/rpm/…/telemetry` ditambahkan Node 1 sendiri.
- **Jangan menulis nama** (misalnya `http://laptopku.local:3000`) di `ALAMAT_SERVER`. Mencari nama bisa memakan lebih dari 5 detik, dan *watchdog* lalu me-*restart* Node 1. Selalu pakai alamat IP.
- **Portal tidak terbuka saat menyala:** Node 1 hanya membuka portal kalau belum ada WiFi tersimpan. WiFi dari praktik-praktik minggu ini masih tersimpan, jadi Node 1 langsung memakainya. Untuk membuka portal, tahan tombol D13 seperti langkah ➕ D4, atau ketik `wifi lupa` di Serial Monitor.
- **Lampu menyala lagi sendiri beberapa detik setelah dimatikan dari HP:** itu lampu otomatis Modul 6. Kalau PIR melihat gerakan di tempat gelap, Node 1 menyalakan lampu lagi, dan Serial Monitor menulis `Ada gerakan di tempat gelap: lampu otomatis menyala.` Uji langkah F di ruangan yang terang, atau menjauhlah dari PIR sampai layar menulis `Gerak: sepi`.
- **Halaman status menulis `WiFi putus` terus:** ketik `wifi` di Serial Monitor untuk melihat kode alasannya, lalu cocokkan dengan tabel di Konsep 4. Alasan `15` atau `204` hampir selalu berarti kata sandi yang tersimpan salah: isian portal langsung disimpan begitu kamu mengetuk **Save** walaupun sambungannya gagal. Buka portal lagi seperti langkah ➕ D4, lalu isi ulang dengan teliti.
- **`Restart: WDT` setelah memasang v1.1:** sesuatu menahan `loop()` lebih dari 5 detik. Perhatikan kapan *restart* terjadi: kalau selalu bertepatan dengan jadwal kiriman (sekitar 1 menit sekali), penyebabnya kiriman ke server, paling mungkin `ALAMAT_SERVER` yang berisi nama, bukan alamat IP. Angka `putaran loop() terlama` di perintah `info` tidak bisa menangkapnya karena putaran yang macet tidak pernah selesai dan angkanya mulai dari nol lagi setelah *restart*.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini boleh dilewati. Klik judulnya kalau ingin tahu lebih dalam.

<details>
<summary><b>Surat HTTP apa adanya: isi sebenarnya yang dikirim ESP32</b></summary>

HTTP sebenarnya hanyalah **teks biasa** yang dikirim lewat sambungan jaringan. Inilah surat yang dikirim **HTTPClient** di Praktik 7, huruf demi huruf (contoh dengan alamat laptop `192.168.1.10`; setiap baris diakhiri dua huruf tak terlihat, "kembali ke awal baris" dan "baris baru"):

```text
POST /telemetry HTTP/1.1
Host: 192.168.1.10:3000
User-Agent: ESP32HTTPClient
Connection: keep-alive
Accept-Encoding: identity;q=1,chunked;q=0.1,*;q=0
Content-Type: application/json
Content-Length: 71

{"ts":"2026-10-17T01:30:12Z","suhu":28.5,"kelembapan":71,"cahaya":2310}
```

- **Baris pertama:** metode, jalur, dan versi HTTP.
- **`Host`**: alamat tujuan, lengkap dengan port-nya.
- **`User-Agent`**: "siapa yang mengirim". **HTTPClient** memperkenalkan diri sebagai `ESP32HTTPClient`.
- **`Connection: keep-alive`**: "sambungan ini boleh dipakai lagi untuk surat berikutnya".
- **`Accept-Encoding`**: bentuk balasan yang bisa dibaca **HTTPClient**.
- **`Content-Type`** ditambahkan oleh sketsa kita, sedangkan **`Content-Length`** (panjang isi: 71 huruf) dihitung **HTTPClient** sendiri.
- **Satu baris kosong** memisahkan kepala surat dari isinya.

Balasan dari `penerima-webhook.js` juga teks biasa:

```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sat, 17 Oct 2026 01:30:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

b
{"ok":true}
0
```

Karena `penerima-webhook.js` tidak menyebutkan panjang isinya, Node.js mengirim isinya **sepotong-sepotong** (*chunked*): `b` adalah panjang potongan dalam heksadesimal (11 huruf: `{"ok":true}`), dan `0` menandai potongan terakhir. **HTTPClient** menyambung potongan-potongan itu sendiri, jadi `http.getString()` menjawab `{"ok":true}` yang utuh. Open-Meteo pun membalas dengan cara ini.

</details>

<details>
<summary><b>Apa itu DNS, dan mengapa <code>-1</code> bisa berarti "nama tidak ditemukan"</b></summary>

Sebelum mengirim surat ke `api.open-meteo.com`, ESP32 harus tahu nomor rumahnya. Ia bertanya ke **server DNS** yang alamatnya diberikan DHCP (biasanya routermu sendiri, kolom `DNS` di kartu jaringan Praktik 2). Router meneruskan pertanyaan itu ke server DNS penyedia internetmu, yang bertanya lagi ke server-server lain kalau belum tahu jawabannya. Jawabannya disimpan sementara (*cache*) supaya pertanyaan berikutnya lebih cepat.

Kalau server DNS tidak menjawab, ESP32 mengulang pertanyaannya beberapa kali sebelum menyerah: sekitar 7 detik untuk setiap server DNS. Waktu ini **tidak** termasuk batas waktu yang kita atur dengan `setConnectTimeout()`. Bagi **HTTPClient**, gagal mencari nama sama saja dengan gagal tersambung, jadi hasilnya juga `-1` (`connection refused`). Itulah alasan Node 1 selalu memakai **alamat IP** laptop, bukan nama: tidak ada pencarian nama, tidak ada risiko menunggu lebih dari 5 detik.

</details>

<details>
<summary><b>Apa yang sebenarnya diperiksa sertifikat HTTPS (pratinjau Modul 27)</b></summary>

Saat tersambung ke `https://api.open-meteo.com`, server mengirim **sertifikat**: dokumen digital yang menyatakan, "Kunci ini milik `api.open-meteo.com`," dan ditandatangani oleh lembaga penerbit (*Certificate Authority*, CA). Pemeriksa yang teliti mengecek tiga hal:

1. **Rantai tanda tangan.** Sertifikat server ditandatangani CA perantara, yang ditandatangani CA akar (*root*). CA akar harus ada di **daftar tepercaya** milik pemeriksa. Browser membawa daftar lebih dari seratus CA akar.
2. **Nama.** Nama di sertifikat harus cocok dengan nama yang kita minta. Sertifikat sah milik situs lain tetap ditolak.
3. **Masa berlaku.** Sertifikat yang kedaluwarsa ditolak. Paket esp32 untuk Arduino ternyata **tidak** memeriksa tanggal ini (fitur itu dimatikan di dalam paketnya), jadi HTTPS di ESP32 tidak harus menunggu jam NTP.

Fungsi `setInsecure()` melewati semua pemeriksaan itu. Paket esp32 3.3.12 menyediakan cara baru yang praktis: `klien.useBuiltinCACertBundle()` memakai daftar CA akar yang sudah tertanam di dalam paketnya sehingga ketiga langkah di atas (kecuali tanggal) berjalan. Harganya sekitar 70 KB ruang program. Modul 27 membahasnya tuntas, bersama domain dan sertifikat milikmu sendiri.

</details>

<details>
<summary><b>Mengapa tautan <code>/on</code> dan <code>/off</code> sebenarnya kurang tepat</b></summary>

Aturan HTTP menyebut GET sebagai permintaan yang **aman**: membuka sebuah alamat tidak boleh mengubah apa pun. Tautan `/on` melanggar aturan itu, dan ada akibatnya:

- **Pratinjau tautan.** Kalau kamu mengirim tautan `http://192.168.1.23/on` lewat aplikasi obrolan dan aplikasinya membuat pratinjau dari perangkat yang tersambung ke WiFi rumahmu, "pratinjau" itu bisa ikut menyalakan lampu.
- **Riwayat dan pengisian otomatis.** Mengetik `192.168` di browser bisa langsung memunculkan `…/on` dari riwayat, lalu tidak sengaja dipilih.
- **Memuat ulang halaman.** Setelah kamu mengetuk **Nyalakan lampu**, alamat di browser menjadi `…/on`. Memuat ulang halaman itu, atau membuka lagi tab lamanya besok, berarti meminta `/on` sekali lagi walaupun lampunya sudah kamu matikan dengan tombol.

Cara yang benar adalah mengirim perintah dengan **POST** (misalnya lewat tombol formulir) atau, untuk perangkat IoT, lewat **MQTT** dengan jawaban `ack` (Modul 11), lalu menguncinya dengan kata sandi (Modul 20–21). Untuk minggu ini, dua tautan sederhana sengaja dipilih supaya kamu bisa mengendalikan relay dari HP dengan kode sesedikit mungkin.

</details>

<details>
<summary><b>IP tetap di kode (<code>WiFi.config()</code>) atau di router?</b></summary>

ESP32 juga bisa memaksakan alamatnya sendiri tanpa bertanya ke DHCP:

```cpp
IPAddress ip(192, 168, 1, 50), gateway(192, 168, 1, 1), subnet(255, 255, 255, 0), dns(192, 168, 1, 1);
WiFi.config(ip, gateway, subnet, dns);  // dipanggil sebelum WiFi.begin()
```

Cara ini memang tidak butuh akses ke router, tetapi kekurangannya banyak:

- **Bisa bentrok.** Kalau DHCP kebetulan meminjamkan `192.168.1.50` ke HP tamu, dua perangkat memakai nomor rumah yang sama, dan keduanya terganggu.
- **Tidak bisa pindah rumah.** Di jaringan lain (*hotspot* HP, rumah teman), alamat `192.168.1.x` mungkin tidak berlaku sama sekali sehingga ESP32 tidak bisa dihubungi atau bahkan tidak bisa ke internet.
- **Harus mengubah kode** setiap kali jaringan berubah.

Pemesanan alamat di router (Praktik 9) menyimpan aturannya di satu tempat, yaitu router itu sendiri, sedangkan ESP32 tetap meminta alamat dengan cara biasa. Itulah sebabnya Silabus memilihnya sebagai jalur utama.

</details>

<details>
<summary><b>Hemat daya radio WiFi dan jeda balasan server web</b></summary>

Sambil tetap tersambung, radio WiFi ESP32 sebenarnya sering **tertidur sebentar** di antara "detak" router (*beacon*), lalu bangun untuk mendengarkan apakah ada surat untuknya. Mode bawaannya bernama `WIFI_PS_MIN_MODEM`. Mode ini menghemat arus puluhan miliampere, tetapi balasan server web kadang tertunda sepersekian detik.

Kalau balasan halaman Node 1 terasa lambat, coba tambahkan `WiFi.setSleep(false);` sesudah `WiFi.mode(WIFI_STA);` atau `WiFi.begin(…)`. Radio tidak lagi tidur, balasannya lebih cepat, dan arusnya naik. Node 1 hidup dari *charger*, jadi arus tambahan itu tidak masalah. Untuk perangkat berbaterai seperti Node 2, hemat daya justru dibiarkan menyala.

</details>

<details>
<summary><b>ESPAsyncWebServer: server web yang tidak pernah menunggu</b></summary>

Library **WebServer** bawaan paket esp32 melayani **satu** permintaan pada satu waktu, di dalam `loop()` lewat `handleClient()`. Selama fungsi `tanganiOn()` berjalan, `loop()` menunggu. Untuk halaman kecil seperti milik kita, itu hanya beberapa milidetik.

**ESPAsyncWebServer** bekerja dengan cara lain: permintaan dilayani oleh tugas tersendiri di belakang layar, beberapa sekaligus, tanpa `handleClient()` di `loop()`. Ia juga mendukung WebSocket, yaitu sambungan yang tetap terbuka sehingga halaman bisa diperbarui seketika. Kekurangannya: kodenya lebih rumit, dan karena fungsi-fungsi penanganannya berjalan di tugas lain, kamu harus berhati-hati saat berbagi variabel dengan `loop()` (aturan bendera di Praktik 3). Versi yang masih dirawat sekarang diterbitkan oleh organisasi **ESP32Async** di GitHub.

Kita tetap memakai **WebServer** karena sederhana dan cukup, apalagi tautan `/on` dan `/off` dipensiunkan di Modul 11.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari yang paling ringan. Kerjakan minimal Tingkat 1.

> 🖥️ **Alat:** **Arduino IDE**, meja kerja Node 1 (MB102 menyala untuk Tingkat 1), HP, dan laptop dengan `penerima-webhook.js` untuk Tingkat 2 dan 3. Mulailah dari sketsa praktik yang disebut, lalu **segera** pilih **File → Save As…** dan simpan di folder `modul-10` dengan nama baru, misalnya `modul10_tantangan1`. Sketsa praktikmu tetap utuh, dan tab `secrets.h` ikut tersalin.

**Tingkat 1 — Ubah sedikit: sakelar kipas.** Mulai dari `modul10_sakelar_web` (Praktik 8). Tambahkan jalur `/kipas/on` dan `/kipas/off` untuk relay kipas di **D33** (aktif LOW, seperti relay lampu), lengkap dengan dua tautan baru di `HALAMAN` dan keadaan kipasnya. Petunjuk: buat fungsi `aturKipas()` yang mirip `aturLampu()`, dan jangan lupa mematikan relay kipas tepat setelah `pinMode()`. Uji dari HP, lalu coba juga alamat yang tidak ada, misalnya `/kipas/hidup`: kode berapa yang muncul, dan dari fungsi mana?

**Tingkat 2 — Gabungkan: suhu dalam dan luar rumah.** Gabungkan Praktik 6 dan 7: ESP32 menanyakan suhu luar ke Open-Meteo setiap 15 menit, sedangkan kiriman JSON ke laptop tetap setiap 10 detik dan kini berisi suhu DHT22 (dalam rumah) **dan** suhu Open-Meteo (luar rumah), misalnya `{"ts": "…", "suhu": 28.5, "suhu_luar": 31.2}`. Petunjuk: simpan suhu luar terakhir di variabel global, jadi kiriman setiap 10 detik tetap bisa memakainya walaupun cuaca hanya ditanyakan setiap 15 menit. Setelah satu jam, bandingkan di terminal laptop: kapan selisih dalam-luar paling besar?

**Tingkat 3 — Rancang sendiri: laporan kesehatan (`vitals`).** Kontrak data ([Lampiran A](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini)) punya laporan kedua selain bacaan sensor, yaitu `vitals`: kesehatan perangkat setiap 5 menit. Mulai dari `modul10_kirim_ke_laptop`, tambahkan kiriman kedua ke jalur `/vitals` setiap 5 menit dengan isi seperti contoh di Lampiran A: `ts`, `rssi` (kekuatan sinyal), `uptime_s` (detik sejak menyala), dan `heap_free` (memori bebas, `ESP.getFreeHeap()`). Lalu:

- Biarkan berjalan satu jam. Apakah `heap_free` turun terus? Kalau ya, ada memori yang "bocor" di programmu.
- Catat RSSI terendah dan tertinggi dalam satu jam di `catatan-modul10.md`. Di Modul 11, laporan seperti ini dikirim Node 1 lewat MQTT.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Sumbangan Modul 10 ke proyek benang merah: **Node 1 v1.1**. Semua yang kamu latih minggu ini masuk ke satu modul baru bernama `jaringan`:

- tersambung ke WiFi rumah lewat **portal**, tanpa satu pun kata sandi di kode (Praktik 4);
- **sambung ulang** otomatis plus penjaga cadangan, tanpa pernah membuat `loop()` menunggu (Praktik 3);
- **jam dari internet**, dan setiap kiriman membawa `ts` (Praktik 5);
- mengirim bacaan kelima sensornya ke `penerima-webhook.js` **setiap menit**, berbentuk JSON sesuai Lampiran A (Praktik 7);
- **server web** dengan tautan `/on` dan `/off` untuk lampu, di `http://node1.local` atau alamat IP-nya (Praktik 8–9).

Node 1 kini terdiri atas **26 file**: 24 file v1.0 ditambah `jaringan.h` dan `jaringan.cpp`. Kamu tidak menulis ulang semuanya; cukup dua file baru dan beberapa perubahan kecil.

> 🖥️ **Alat yang dipakai:** **Arduino IDE** (dengan library **WiFiManager** dan **ArduinoJson** dari Praktik 4 dan 6), **VS Code** dengan penerima dari Praktik 7, **GitHub Desktop**, meja kerja lengkap dengan MB102 dan *charger* Node 1, **HP**, dan router yang boleh dimatikan sebentar. Di Wokwi, pakai [`diagram.json`](kode/node-1-rumah/diagram.json) dan [`libraries.txt`](kode/node-1-rumah/libraries.txt) Node 1 dari folder `kode/` modul ini, lalu ubah `PAKAI_WOKWI` menjadi `true` (langkah B): kode portal lalu tidak ikut dikompilasi, jadi programnya muat di papan Wokwi. Belum punya proyek Wokwi Node 1 dari Modul 8? Buat semua file lainnya lewat **▾ → New file...** dan isi dari folder [`kode/node-1-rumah/`](kode/node-1-rumah/), seperti ➕ Modul 8. Wokwi hanya bisa menguji WiFi, jam, dan lognya: portal, server mini di laptop, dan HP tidak terjangkau dari sana.
>
> ⭐ **Wajib** — bagian dari syarat lulus: server mini di laptop mencetak JSON dari Node 1 (langkah E), lampu dimatikan dari HP lewat tautan Node 1 (langkah F), dan Node 1 tersambung lagi sendiri setelah router dimatikan 1 menit (langkah G).

![Peta 26 file Node 1 v1.1: satu modul baru, beberapa perubahan kecil. Di tengah, node-1-rumah.ino bertanda UBAH: memanggil siapkanJaringan() dan perbaruiJaringan(), dan kirimData() kini terisi. Di atas, konfigurasi.h bertanda UBAH: versi 1.1.0 dan bagian jaringan. Kiri, indra dan tangan: sensor.h/.cpp (lima sensor) dan aktuator.h/.cpp (relay, pompa, servo, buzzer); antarmuka: tombol.h/.cpp (tekan pendek dan lama), detak.h/.cpp (LED status), layar.h/.cpp bertanda UBAH (status: baris WiFi dan pesan portal), dan perintah.h/.cpp bertanda UBAH (hanya .cpp: wifi, wifi lupa, kirim). Kanan, otak dan catatan: aturan.h/.cpp (siram dan lampu otomatis) dan kartu.h/.cpp (CSV microSD, opsional); daya tahan: pengaturan.h/.cpp (NVS: ambang, jumlah nyala), sistem.h/.cpp (uptime, alasan restart), dan pencatat.h/.cpp (log DEBUG/INFO/ERROR). Bawah, jaringan.h/.cpp bertanda BARU: WiFi, portal WiFiManager, dan penjaga sambung ulang (Praktik 3–4); jam internet dan ts (Praktik 5); kiriman JSON ke laptop setiap menit (Praktik 7); server web /, /on, dan /off (Praktik 8); nama node1.local (Praktik 9); WiFi boleh putus, Node 1 tidak boleh berhenti. Garis putus-putus berarti #include; PETA-PIN.md tidak berubah karena WiFi tidak memakai pin; semua file ada di satu folder sketsa firmware/node-1-rumah/](aset/peta-file-node1-v11.png)

| File | Yang berubah | Caranya |
| :--- | :--- | :--- |
| `jaringan.h` / `.cpp` | **baru**: WiFi, portal, jam, kiriman ke server, server web, dan nama `node1.local` | buat tab baru, salin dari kurikulum (langkah B) |
| `konfigurasi.h` | versi `1.1.0` dan bagian baru "Modul 10: jaringan" | ubah dua bagian; angka kalibrasimu tetap (langkah B) |
| `node-1-rumah.ino` | memanggil `siapkanJaringan()` dan `perbaruiJaringan()`; `kirimData()` kini terisi | ganti seluruh isinya (langkah C) |
| `perintah.cpp` | perintah baru `wifi`, `wifi lupa`, dan `kirim` | ganti seluruh isinya (langkah C) |
| `layar.h` | fungsi baru `tampilkanPesan()` untuk petunjuk portal | ganti seluruh isinya (langkah C) |
| `layar.cpp` | halaman status menampilkan alamat IP; fungsi `tampilkanPesan()` | tiga perubahan kecil; rancangan layarmu tetap (langkah C) |

`PETA-PIN.md` tidak berubah: WiFi tidak memakai pin.

### A. Pindah ke "ESP32 Dev Module" dengan skema partisi Minimal SPIFFS

Node 1 v1.1 berukuran 1.315.235 byte, sedikit **lebih besar** daripada rak program bawaan (1.310.720 byte, Konsep 10). Dengan pilihan papan **DOIT ESP32 DEVKIT V1**, Arduino IDE menolaknya dengan pesan `Sketch too big`. Karena itu, kita pindah rak dulu sebelum memasang kode barunya.

1. Buka Node 1-mu: **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah** → `node-1-rumah.ino`.
2. Klik kotak pilihan papan di bilah atas (kini bertuliskan **DOIT ESP32 DEVKIT V1**) → **Select other board and port…**. Di kolom **BOARDS**, ketik `esp32 dev`, lalu klik **ESP32 Dev Module**. Port-nya tetap port papan Node 1. Klik **OK**. Ingat Modul 2: pilihan ini sejak awal adalah alternatif yang sah untuk papan DevKit V1-mu.
3. Buka menu **Tools**. Kini ada lebih banyak pilihan. Ubah dua di antaranya:
   - **Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**.
   - **Flash Mode** → **DIO**, sama dengan setelan **DOIT ESP32 DEVKIT V1** selama ini.

   Biarkan pilihan lainnya. Satu pengecualian: dulu menurunkan **Upload Speed** ke 115200 di Modul 2 supaya unggahan tidak gagal? Pilih lagi **Upload Speed** → **115200** di sini karena pilihan papan yang baru kembali ke 921600. Setelah **Partition Scheme** dan **Flash Mode** diubah, menu **Tools** menampilkan `Partition Scheme: "Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)"` dan `Flash Mode: "DIO"`.

![Ilustrasi Arduino IDE 2.3.10 dengan sketsa node-1-rumah dan menu Tools terbuka untuk papan ESP32 Dev Module. Isi menu dari atas: Auto Format, Archive Sketch, Manage Libraries..., Serial Monitor, Serial Plotter; Firmware Updater, Upload SSL Root Certificates; Board: "ESP32 Dev Module" (penanda 1), Port: "COM3", Reload Board Data, Get Board Info; lalu pilihan papan: CPU Frequency: "240MHz (WiFi/BT)", Core Debug Level: "None", Erase All Flash Before Sketch Upload: "Disabled", Events Run On: "Core 1", Flash Frequency: "80MHz", Flash Mode: "DIO" (penanda 3), Flash Size: "4MB (32Mb)", JTAG Adapter: "Disabled", Arduino Runs On: "Core 1", Partition Scheme: "Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)" yang sedang disorot, PSRAM: "Disabled", Upload Speed: "921600", Zigbee Mode: "Disabled"; terakhir Programmer dan Burn Bootloader. Submenu Partition Scheme terbuka di kanan, berisi dua puluh skema dari Default 4MB with spiffs sampai Custom, dengan Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS) dicentang (penanda 2). Keterangan: 1, papan ESP32 Dev Module, lewat kotak pilihan papan di bilah atas lalu Select other board and port; 2, Tools, Partition Scheme, Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS); 3, Tools, Flash Mode, DIO](aset/menu-partisi.png)

Arduino IDE mengingat setelan ini untuk pilihan **ESP32 Dev Module**, jadi cukup diatur sekali. **Mulai sekarang, semua sketsa kurikulum diunggah dengan setelan ini.** Isi NVS, termasuk ambang siram, angka `Nyala ke-`, dan WiFi tersimpan, tidak hilang karena letak raknya sama di kedua skema. Yang hilang hanya isi rak file (SPIFFS), yang memang tidak kita pakai.

### B. Buat dua file baru dan ubah `konfigurasi.h`

1. **`jaringan.h` dan `jaringan.cpp`.** Dengan `node-1-rumah.ino` terbuka, buat dua tab baru seperti Modul 8 (**⋯ → New Tab**, ketik namanya lengkap dengan akhirannya, lalu klik **OK**; di Wokwi: **▾ → New file...**). Isi masing-masing dengan cara yang sama: klik kanan nama filenya → **Buka di tab baru**, klik **Copy raw file**, kembali ke Arduino IDE, lalu tempel (**Ctrl + V**).
   - [`jaringan.h`](kode/node-1-rumah/jaringan.h)
   - [`jaringan.cpp`](kode/node-1-rumah/jaringan.cpp)
2. **Versi firmware.** Di tab **`konfigurasi.h`**, ubah `"1.0.0"` di baris `VERSI_FIRMWARE` menjadi `"1.1.0"`.
3. **Bagian jaringan.** Masih di `konfigurasi.h`, gulir ke paling bawah, lalu tambahkan bagian ini setelah baris `BATAS_WATCHDOG`:

   ```cpp
   // ---------- Modul 10: jaringan ----------
   const bool PAKAI_WOKWI = false;                           // true HANYA di Wokwi: menyambung ke Wokwi-GUEST tanpa portal
   const char NAMA_PERANGKAT[] = "node1";                    // nama di daftar perangkat router dan alamat node1.local
   const char NAMA_PORTAL[] = "Node1-Rumah";                 // nama WiFi sementara selama portal terbuka
   const unsigned long BATAS_PORTAL = 180;                   // detik: portal menutup sendiri kalau tidak dipakai
   const char ALAMAT_SERVER[] = "http://192.168.1.10:3000";  // GANTI dengan alamat IP laptopmu (Praktik 7)
   const unsigned long JEDA_KIRIM = 60000;                   // bacaan dikirim ke server setiap 1 menit
   const char ZONA_WAKTU[] = "WIB-7";                        // WITA: "WITA-8", WIT: "WIT-9" (Praktik 5)
   ```

4. **Ganti `192.168.1.10`** di baris `ALAMAT_SERVER` dengan alamat IP laptopmu dari Praktik 7. Tulis `http://`, alamat IP, dan `:3000` saja, **tanpa** jalur di belakangnya, dan **jangan** memakai nama seperti `laptopku.local` (🚨 "Node 1 v1.1: masalah khusus").
5. Tinggal di wilayah WITA atau WIT? Ubah juga `ZONA_WAKTU` seperti Praktik 5. **Di Wokwi**, ubah `PAKAI_WOKWI` menjadi `true`; di papan asli, biarkan `false`.

Angka kalibrasi Modul 6 dan aturan-aturanmu di bagian atas `konfigurasi.h` tidak disentuh.

### C. Ganti tiga file dan ubah `layar.cpp`

1. **`node-1-rumah.ino`, `perintah.cpp`, dan `layar.h`**: ketiga file ini tidak berisi rancanganmu sendiri, jadi isinya diganti seluruhnya. Untuk setiap file, klik tabnya, kosongkan isinya (**Ctrl + A**, lalu **Delete**), lalu tempel versi barunya dengan cara **Copy raw file** seperti langkah B:
   - [`node-1-rumah.ino`](kode/node-1-rumah/node-1-rumah.ino) (di Wokwi: tab **`sketch.ino`**)
   - [`perintah.cpp`](kode/node-1-rumah/perintah.cpp). Pernah menambah perintahmu sendiri, misalnya dari 🧩 Modul 8? Salin dulu bagianmu, lalu tempelkan lagi sesudahnya.
   - [`layar.h`](kode/node-1-rumah/layar.h)
2. **`layar.cpp`** berisi rancangan halaman bacaanmu dari Modul 7, jadi kita ubah sedikit saja. Klik tab **`layar.cpp`**:
   1. Di bagian paling atas, tepat **di bawah** baris `#include "pengaturan.h"`, tambahkan:

      ```cpp
      #include "jaringan.h"  // Modul 10: teksJaringan()
      ```

   2. Tekan **Ctrl + F**, cari `Ambang tanah`, lalu ganti **seluruh baris** itu dengan:

      ```cpp
        snprintf(teks, sizeof(teks), "WiFi %s", teksJaringan());  // Modul 10: alamat IP Node 1, "putus", atau "mati"
      ```

      Baris ambang memang dikorbankan: layar 128 × 64 titik hanya memuat enam baris. Ambang siram tetap bisa dilihat dengan perintah `ambang`.
   3. Gulir ke **paling bawah** `layar.cpp`, lalu tambahkan fungsi baru ini setelah tanda `}` terakhir:

      ```cpp
      // ---------- Modul 10: pesan singkat empat baris ----------
      // Misalnya petunjuk portal WiFi. Halaman bacaan kembali tampil bersama bacaan berikutnya.
      void tampilkanPesan(const char* judul, const char* baris2, const char* baris3, const char* baris4) {
        if (!layarAda) {
          return;
        }
        layar.clearDisplay();
        layar.setTextSize(1);
        layar.setCursor(0, 0);
        layar.print(judul);
        layar.drawFastHLine(0, 11, 128, SSD1306_WHITE);  // garis pemisah di bawah judul
        layar.setCursor(0, 18);
        layar.print(baris2);
        layar.setCursor(0, 30);
        layar.print(baris3);
        layar.setCursor(0, 46);
        layar.print(baris4);
        layar.display();
      }
      ```

**Periksa dulu sebelum lanjut:** jumlah tab sekarang **26** (di Wokwi, tab `diagram.json` dan tab library tidak ikut dihitung, seperti Modul 8), tab `jaringan.cpp` diawali `// jaringan.cpp - isi modul jaringan…`, dan baris pertama tab utama menulis `firmware v1.1.0 (Modul 10)`.

### D. Verify, Upload, dan sambungkan ke WiFi

1. Klik **Verify**. Kalau muncul error, baca **pesan error pertama** dan bandingkan tab yang disebut dengan [versi rujukan](kode/node-1-rumah/). Panel **Output** kini menulis `Sketch uses …` yang diakhiri `Maximum is 1966080 bytes.` Itulah tanda bahwa skema partisi barunya sudah berlaku. Node 1 v1.1 kini memakai sekitar 66 % rak programnya.
2. Colokkan USB, nyalakan MB102, lalu klik **Upload**. Buka **Serial Monitor**.
3. **WiFi masih tersimpan dari praktik?** Node 1 langsung memakainya, tanpa portal. Contoh di bawah ini dibuat saat penerima di laptop sudah menyala. Kalau penerimanya belum menyala, baris terakhirnya berbunyi `Gagal kirim: connection refused (kode -1). Penerima di laptop menyala?`, dan itu wajar sampai langkah E.

   **Hasilnya** (contoh; baris bacaan setiap 2 detik tidak ikut dikutip):

   ```text
   [00:00:00] INFO  Node 1 Rumah - firmware 1.1.0
   [00:00:00] INFO  Alasan restart terakhir: POWERON
   [00:00:00] INFO  Nyala ke-15. Ambang tanah_siram: 35 % (dari NVS)
   [00:00:01] INFO  Kartu microSD siap: bacaan dicatat ke node1.csv setiap 30 detik.
   [00:00:01] INFO  device_id a4cf12e5b7c0
   [00:00:01] INFO  Menyambung ke WiFi tersimpan "RumahKita" (tanpa menunggu)...
   [00:00:01] INFO  Watchdog aktif: restart otomatis kalau loop() macet lebih dari 5 detik.
   [00:00:03] INFO  WiFi tersambung ke "RumahKita": IP 192.168.1.23, sinyal -58 dBm
   [00:00:03] INFO  Buka di HP: http://192.168.1.23/ atau http://node1.local/ (sering gagal di HP Android)
   [00:00:08] INFO  Jam disetel dari internet: 2026-10-17T01:30:59Z
   [00:00:09] INFO  Terkirim ke server (kode 200, 41 ms)
   ```

   **Belum ada WiFi tersimpan** (misalnya setelah `wifi lupa` atau di papan baru)? Layar OLED dan Serial Monitor menampilkan petunjuk portal. Ikuti langkah HP di Praktik 4.4, kali ini dengan WiFi bernama **`Node1-Rumah`**. Halamannya sedikit berbeda: judulnya `Node 1 Rumah`, dan tombolnya hanya **Configure WiFi**, **Info**, dan **Exit** (tombol **Update** sengaja disembunyikan). Selama portal terbuka (paling lama 3 menit), Node 1 belum mulai bekerja: LED status menyala tetap, dan layar terus menampilkan petunjuk portal.
4. **Buktikan portalnya.** Tahan tombol D13, tekan lalu lepas **EN**, dan lepaskan D13 setelah layar OLED menulis `PORTAL WIFI`. Isi WiFi-mu lewat HP seperti di atas. Kata sandi itu kini tersimpan di NVS papan Node 1, tidak di kode Node 1 mana pun. (Tab `secrets.h` sketsa-sketsa latihan memang masih menyimpannya di laptopmu, tetapi tetap dijaga `.gitignore`.) Portal ini terbuka tanpa kata sandi sampai kamu selesai atau 3 menit berlalu, dan selama itu siapa pun di dekat rumahmu bisa ikut menyambung ke `Node1-Rumah`. Karena itu, buka portal hanya saat kamu sendiri sedang mengisinya.
5. Tahan tombol D13 selama 1 detik (seperti biasa, sesudah menyala) untuk membuka halaman status: baris kelimanya kini `WiFi 192.168.1.23`. Ketik juga `wifi` di Serial Monitor:

   **Hasilnya** (contoh):

   ```text
   [00:02:08] INFO  Tombol ditekan lama: halaman status ditampilkan 10 detik.
   wifi: tersambung ke "RumahKita", IP 192.168.1.23, sinyal -57 dBm
   wifi: device_id a4cf12e5b7c0, nama node1, jam 2026-10-17T01:33:11Z
   wifi: kirim ke http://192.168.1.10:3000/rpm/a4cf12e5b7c0/telemetry setiap 60 detik, kode terakhir 200
   ```

### E. ⭐ Server mini di laptop mencetak JSON dari Node 1

1. Nyalakan penerima di laptop seperti Praktik 7.2 (`node penerima-webhook.js` di folder `alat`).
2. Tunggu paling lama 1 menit, atau ketik `kirim` di Serial Monitor supaya Node 1 langsung mengirim.

   **Hasilnya di terminal VS Code** (contoh):

   ```text
   Penerima siap di http://localhost:3000 — tekan Ctrl + C untuk berhenti.
   [08.31.00] POST /rpm/a4cf12e5b7c0/telemetry
   {"ts":"2026-10-17T01:31:00Z","fw":"1.1.0","suhu":28.4,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}
   [08.32.00] POST /rpm/a4cf12e5b7c0/telemetry
   {"ts":"2026-10-17T01:32:00Z","fw":"1.1.0","suhu":28.4,"kelembapan":71,"cahaya":2297,"tanah":37,"gerak":false,"level_air":64}
   ```

   **Syarat lulus pertama terpenuhi: server mini di laptop mencetak JSON dari Node 1.** Perhatikan jalurnya: `/rpm/<device_id>/telemetry`, dengan `device_id` dari Praktik 2. Isinya persis seperti bentuk di Lampiran A: `ts`, `fw`, lalu keenam kolom bacaan.
3. Biarkan beberapa menit: satu kiriman setiap menit. Di Serial Monitor, setiap kiriman tercatat `Terkirim ke server (kode 200, … ms)`.

### F. ⭐ Matikan lampu dari HP

1. Di HP (data seluler dimatikan), buka `http://192.168.1.23/` (alamat Node 1-mu dari halaman status), atau `http://node1.local/` kalau HP-mu bukan Android.
2. Halaman Node 1 kini menampilkan keadaan lampu, bacaan terbaru, versi firmware, dan jam setempat. Ketuk **Nyalakan lampu**, lalu **Matikan lampu**. Relay berbunyi "klik", LED indikatornya padam, dan Serial Monitor mencatat `Browser 192.168.1.42: lampu off`.

   ![Ilustrasi halaman Node 1 v1.1 di browser HP, dirender dari HTML di jaringan.cpp; angka bacaan dan alamat hanya contoh. Bilah alamat http://node1.local/off, judul Node 1 Rumah. Penanda 1 pada Lampu: PADAM, keadaan lampu sekarang; penanda 2 pada tautan Nyalakan lampu, tautan ke /on yang membuat relay lampu menyala; penanda 3 pada tautan Matikan lampu, tautan ke /off yang membuat relay lampu padam; penanda 4 pada bacaan sensor terakhir: suhu 28.4 °C, kelembapan 71 %, cahaya 2310, tanah 37 %, dan air tandon 64 %; penanda 5 pada versi firmware dan jam setempat dari NTP: Firmware 1.1.0, 17-10-2026 08:32 WIB. Kotak di sampingnya: alamatnya boleh nama .local (laptop, iPhone) atau alamat IP tetap dari Praktik 9, misalnya http://192.168.1.23/off](aset/hp-node1.png)

   **Syarat lulus kedua terpenuhi: kamu mematikan lampu dari HP lewat tautan ESP32.**
3. Lampu yang dinyalakan dari HP tetap bisa dimatikan dengan tombol D13 atau perintah `lampu off`, dan sebaliknya. Ketiganya mengubah lampu yang sama. Halaman di HP tidak memperbarui dirinya sendiri: untuk melihat keadaan terbaru, buka lagi alamat utamanya (misalnya `http://192.168.1.23/`). Jangan memuat ulang halaman yang alamatnya berakhiran `/on` atau `/off` karena perintahnya akan terkirim sekali lagi (🔬 "Mengapa tautan `/on` dan `/off` sebenarnya kurang tepat").

### G. ⭐ Uji cabut router 1 menit

Inilah uji yang sama dengan Praktik 3, tetapi kali ini untuk Node 1 lengkap. **Beri tahu orang serumah dulu.**

> 📱 **Tidak bisa mematikan router rumah?** Pakai *hotspot* HP (pastikan memakai 2,4 GHz, lihat Konsep 2), tetapi ingat: Node 1 v1.1 tidak memakai `secrets.h`. Buka portalnya seperti langkah D4, lalu simpan WiFi *hotspot*-mu lewat portal `Node1-Rumah`. Isi portalnya dari laptop (atau HP lain), bukan dari HP yang sedang memancarkan *hotspot*: HP itu biasanya tidak bisa sekaligus tersambung ke `Node1-Rumah`. Caranya, sambungkan laptop sebentar ke WiFi `Node1-Rumah`, buka `http://192.168.4.1` di browser, pilih nama *hotspot*-mu, ketik kata sandinya, lalu klik **Save**. Setelah itu, kembalikan laptop ke WiFi rumah. "Mematikan router" berarti mematikan *hotspot* selama 1 menit. Laptopmu tetap di WiFi rumah, jadi selama uji ini kiriman ke laptop gagal (`Gagal kirim` setiap menit), dan itu wajar: buktinya cukup dari Serial Monitor (`WiFi tersambung LAGI`) dan perintah `info` di langkah 5. Setelah selesai, simpan lagi WiFi rumahmu lewat portal.

1. Biarkan Serial Monitor dan terminal penerima tetap terbuka. Ketik `info`, lalu catat angka `nyala ke-` di jawabannya.
2. Catat jam saat ini (lihat HP), lalu **matikan router selama 1 menit** dan nyalakan lagi.
3. Selama router mati, perhatikan meja kerjamu: LED status tetap berdetak, layar tetap berganti bacaan, dan tombol D13 tetap menyalakan lampu. Node 1 bekerja seperti biasa; hanya kiriman ke laptop yang berhenti sementara.
4. Tunggu sampai router menyala dan Node 1 tersambung lagi sendiri.

   **Hasilnya di Serial Monitor** (contoh; baris bacaan setiap 2 detik tidak ikut dikutip):

   ```text
   [00:09:09] INFO  Terkirim ke server (kode 200, 38 ms)
   [00:09:12] ERROR WiFi PUTUS (alasan 200: BEACON_TIMEOUT). Node 1 tetap bekerja; paket esp32 mencoba menyambung lagi.
   [00:09:31] INFO  Tombol: lampu on
   [00:09:35] INFO  Tombol: lampu off
   [00:11:19] INFO  WiFi tersambung LAGI setelah 127 detik: IP 192.168.1.23
   [00:11:21] INFO  Terkirim ke server (kode 200, 52 ms)
   ```

5. Di terminal penerima, kiriman berikutnya muncul lagi tanpa kamu menyentuh Node 1. Ketik `info`: `restart terakhir` tetap sama seperti sebelum uji (biasanya `POWERON`) dan angka `nyala ke-` sama dengan catatanmu di langkah 1. Artinya, Node 1 tidak *restart*; ia hanya menunggu jaringannya kembali. Kiriman tidak muncul lagi di terminal, padahal Serial Monitor menulis `WiFi tersambung LAGI`? Mungkin alamat IP laptopmu berganti setelah router menyala: periksa lagi seperti Praktik 7.1, perbarui `ALAMAT_SERVER` di `konfigurasi.h`, lalu unggah ulang.

   **Syarat lulus ketiga terpenuhi: Node 1 tersambung kembali sendiri setelah router dimatikan 1 menit.**

> 💡 **Mengapa kiriman selama router mati tidak muncul belakangan?** Node 1 v1.1 hanya mengirim bacaan terbaru, tidak menyimpan antrean. Bacaan yang terlewat masih tercatat di kartu microSD (kalau dipasang). Menyimpan lalu mengirim susulan saat jaringan kembali adalah pekerjaan Modul 27.

**Kembalikan Node 1 ke *charger*-nya.** Ketiga syarat lulus sudah terpenuhi, jadi Node 1 v1.1 kembali bekerja permanen seperti di akhir Modul 9. Urutannya sama dengan Praktik 1.3 Modul 9: **matikan MB102** → cabut USB dari laptop → colokkan kabel berlabel **ESP32** ke *charger* → **baru** nyalakan MB102. Kalau memasang modul microSD beregulator, tekan **EN** sesudahnya. Dalam beberapa detik, Node 1 tersambung ke WiFi sendiri. Buka halamannya dari HP dan matikan lampu sekali lagi: kali ini laptop sama sekali tidak terlibat. Kiriman setiap menit baru diterima lagi saat penerima di laptop dijalankan.

### H. Simpan ke GitHub dan lengkapi bukti

1. **`rumah-pintar-mini`**: di GitHub Desktop, pilih repositori **`rumah-pintar-mini`**. Daftar **Changes** berisi dua file baru (`jaringan.h`, `jaringan.cpp`) dan lima file yang berubah. **Periksa isi `konfigurasi.h` di panel kanan:** tidak ada kata sandi apa pun di sana, hanya alamat IP laptopmu. Isi **Summary** dengan `Node 1 v1.1: WiFi, jam internet, kirim data, dan server web (Modul 10)`, klik **Commit … to main**, lalu **Push origin**.
2. Lengkapi dulu tabel bukti ini di `catatan-modul10.md`; *commit*-nya di langkah 3:

| Bukti | Hasilmu |
| :--- | :--- |
| `device_id` Node 1 | |
| Alamat IP Node 1 (tetap, Praktik 9) | |
| Potongan terminal penerima: satu kiriman Node 1 (langkah E) | |
| Lampu dimatikan dari HP: tanggal dan jam (langkah F) | |
| Uji router: jam router dimatikan, jam tersambung lagi, `nyala ke-` sebelum dan sesudah (langkah G) | |
| Ukuran program di panel **Output** (`Sketch uses … bytes`, maksimum 1.966.080) | |

3. **`belajar-iot`**: pastikan folder `modul-10` berisi kedelapan sketsa latihan minggu ini (`modul10_halo_wifi`, `modul10_kenali_jaringan`, `modul10_sambung_ulang`, `modul10_portal_wifi`, `modul10_jam_internet`, `modul10_cuaca`, `modul10_kirim_ke_laptop`, dan `modul10_sakelar_web`), sketsa tantanganmu (misalnya `modul10_tantangan1`), dan `catatan-modul10.md`. Ada sketsa yang tersimpan di tempat lain, misalnya di **Documents → Arduino**? Buka sketsa itu, pilih **File → Save As…**, lalu simpan ke **Documents → GitHub → belajar-iot → modul-10**. Pilih repositori **`belajar-iot`** di GitHub Desktop, lalu periksa sekali lagi: **tidak ada `secrets.h`** di daftar **Changes**. Isi **Summary** dengan `Modul 10: WiFi, HTTP, dan Node 1 v1.1`, lalu klik **Commit … to main** dan **Push origin**.

---

## 📖 Glosarium

| Istilah | Arti singkat |
| :--- | :--- |
| **Router** | Pos satpam sekaligus kantor pengelola jaringan rumah: gerbang ke internet dan pembagi alamat IP. |
| **Alamat IP lokal** | Nomor rumah perangkat di dalam jaringan rumah, misalnya `192.168.1.23`. Hanya berlaku di dalam "pagar". |
| **Alamat IP publik** | Alamat jaringan rumahmu di internet. Seluruh perangkat di rumah berbagi satu alamat ini. |
| **DHCP** | Petugas yang meminjamkan alamat IP kepada perangkat yang baru masuk, untuk sementara waktu. |
| ***Gateway*** (gerbang) | Alamat router itu sendiri, misalnya `192.168.1.1`. Surat ke luar jaringan dititipkan ke sini. |
| ***Subnet mask*** (penanda blok) | Menentukan bagian depan alamat yang harus sama supaya dua perangkat dianggap bertetangga, misalnya `255.255.255.0`. |
| **Alamat MAC** | "Nomor KTP" perangkat yang dicetak pabrik, misalnya `A4:CF:12:E5:B7:C0`. |
| **`device_id`** | Identitas Node 1 di proyek ini: 12 huruf heksadesimal kecil dari alamat MAC, misalnya `a4cf12e5b7c0` (Lampiran A). |
| **DNS** | "Buku telepon" jaringan yang menerjemahkan nama, misalnya `api.open-meteo.com`, menjadi alamat IP. |
| **SSID** | Nama jaringan WiFi. Huruf besar-kecilnya harus sama persis. |
| **2,4 GHz dan 5 GHz** | Dua jalur frekuensi WiFi. ESP32 di papan DevKit V1 hanya bisa memakai 2,4 GHz. |
| **RSSI** | Kekuatan sinyal yang diterima, dalam dBm. Angkanya negatif; makin dekat ke 0, makin kuat. |
| **WPA2, WPA3** | Jenis "gembok" jaringan WiFi. Keduanya bisa dipakai ESP32; gembok lama WEP dan WPA ditolak. |
| **Sambung ulang otomatis** (*auto reconnect*) | Fitur paket esp32 yang mencoba menyambung lagi setiap kali WiFi putus. |
| **Peristiwa** (*event*) WiFi | Kabar dari paket esp32, misalnya "dapat alamat IP" atau "putus", yang memanggil fungsi yang kita daftarkan dengan `WiFi.onEvent()`. |
| **`secrets.h`** | Tab berisi nama dan kata sandi WiFi, yang tidak pernah ikut di-*commit*. |
| **`.gitignore`** | Daftar file yang sengaja tidak dicatat Git. |
| **Portal WiFi** (*captive portal*) | Halaman pengaturan yang muncul saat HP tersambung ke titik akses ESP32, seperti halaman *login* WiFi hotel. |
| ***Access point*** (titik akses) | Perangkat yang memancarkan WiFi untuk disambungi perangkat lain. Router adalah titik akses; ESP32 menjadi titik akses saat portal terbuka. |
| **WiFiManager** | Library yang membuat portal WiFi di ESP32. WiFi yang kamu isi lewat portal itu disimpan paket esp32 di NVS. |
| **NTP** | Cara meminta jam yang tepat dari server waktu di internet. |
| **UTC** | Waktu universal, patokan jam sedunia. WIB = UTC+7, WITA = UTC+8, WIT = UTC+9. |
| **ISO-8601, `ts`** | Bentuk standar tanggal-jam, misalnya `2026-10-17T01:23:45Z`. Huruf `Z` berarti UTC. `ts` adalah cap waktu setiap data (Lampiran A). |
| **HTTP** | Tata cara surat-menyurat antarperangkat: satu permintaan, satu balasan. |
| **HTTPS** | HTTP di dalam amplop tersegel (enkripsi), ditambah pemeriksaan sertifikat server. |
| **GET, POST** | Metode HTTP. GET meminta sesuatu, POST mengirim sesuatu. |
| **Kode status** | Tiga angka di awal balasan HTTP: 200 berhasil, 404 alamat tidak ada, 500 server bermasalah. Di **HTTPClient**, angka negatif berarti tidak ada balasan dari server. |
| ***Header*, *body*** | Kepala surat (keterangan tambahan) dan isi surat. |
| **URL** | Alamat lengkap: skema, *host*, port, dan jalur, misalnya `http://192.168.1.10:3000/telemetry`. |
| **Port** | "Nomor pintu" sebuah program server di satu komputer. HTTP memakai 80, HTTPS 443. |
| **JSON, ArduinoJson** | Bentuk teks untuk data terstruktur (Modul 4), dan library ESP32 untuk membaca dan menulisnya. |
| **Sertifikat** | Kartu identitas digital server, ditandatangani lembaga tepercaya (CA). |
| **`setInsecure()`** | Perintah yang membuat HTTPS tetap terenkripsi, tetapi tidak memeriksa sertifikat. Sementara, sampai Modul 27. |
| **Server web** | Program yang menunggu surat HTTP dan membalasnya. Di ESP32: library **WebServer**. |
| **mDNS, `.local`** | Cara perangkat mengumumkan namanya sendiri di jaringan rumah, misalnya `node1.local`. |
| **Pemesanan alamat** (*DHCP reservation*) | Aturan di router supaya perangkat dengan alamat MAC tertentu selalu mendapat alamat IP yang sama. |
| ***Firewall*** | Penjaga pintu komputer yang menentukan program mana yang boleh menerima sambungan dari luar. |
| **Partisi, skema partisi** | Pembagian memori *flash* menjadi "rak-rak". Mulai modul ini: Minimal SPIFFS, dengan dua rak program 1,875 MB. |
| **OTA** (*over-the-air*) | Mengganti program lewat WiFi tanpa kabel USB (Modul 28). Butuh dua rak program. |
| **ADC2** | Pengubah analog-ke-digital kedua ESP32. Tidak bisa dipakai `analogRead()` selama WiFi menyala. |

---

## 📝 Kuis 5 soal

1. ESP32 di rumahmu mendapat alamat `192.168.1.23`, router `192.168.1.1`, dan *subnet mask* `255.255.255.0`. (a) Dengan analogi perumahan, jelaskan arti ketiga angka itu. (b) Laptop temanmu yang datang berkunjung tersambung ke WiFi tamu dan mendapat alamat `192.168.0.15`. Bisakah laptop itu menerima kiriman dari ESP32? Mengapa?
2. Seorang teman memasang WiFi di Node 1 dengan menulis ini di awal `loop()`:

   ```cpp
   while (WiFi.status() != WL_CONNECTED) {
     Serial.print(".");
     delay(500);
   }
   ```

   (a) Apa yang terjadi pada Node 1 kalau router mati 10 menit? Sebutkan dua akibatnya. (b) Bagaimana Node 1 v1.1 menangani WiFi yang putus tanpa pernah menunggu?
3. Seorang teman telanjur mem-*push* `secrets.h` berisi kata sandi WiFi ke GitHub. Ia lalu menghapus file itu dan mem-*push* lagi. (a) Apakah kata sandinya sekarang aman? Apa yang wajib ia lakukan? (b) Mengapa satu baris `secrets.h` di `.gitignore` folder utama `belajar-iot` sudah melindungi sketsa di semua modul berikutnya?
4. Seorang teman mengirim bacaan ESP32 ke server buatannya sendiri di laptop. Pada tiga percobaan, Serial Monitor menulis tiga hasil yang berbeda: `kode status 200`, `kode status 404`, dan `gagal: connection refused (kode -1)`. (a) Apa arti masing-masing? (b) Untuk hasil `-1`, sebutkan tiga kemungkinan penyebabnya dan satu cara menguji jaringannya dengan HP. (c) Mengapa sketsa cuaca boleh memakai `setInsecure()`, tetapi kendali lampu lewat internet tidak boleh?
5. (a) Node 1 mengambil bacaan pada hari Sabtu, 17 Oktober 2026, pukul 06.30 WIB. Tulis `ts`-nya. Mengapa tanggalnya berbeda? (b) Mengapa Node 1 v1.1 menunda kirimannya sampai jamnya disetel dari internet? (c) Seorang teman ingin memindahkan sensor tanah dari VN (GPIO 39) ke D25 karena kabelnya lebih pendek. Mengapa itu ide buruk mulai minggu ini?

<details>
<summary><b>Kunci jawaban & penjelasan</b></summary>

1. (a) `192.168.1.23` adalah **nomor rumah** ESP32 di dalam perumahan (jaringan rumah). `192.168.1.1` adalah **pos satpam** (router/*gateway*) tempat semua surat ke luar perumahan dititipkan. `255.255.255.0` adalah **penanda blok**: perangkat yang tiga angka pertamanya sama (`192.168.1.…`) bertetangga satu blok. (b) **Tidak.** Alamat `192.168.0.15` berada di blok lain, dan WiFi tamu biasanya sengaja dipisahkan dari jaringan utama. Laptop itu harus tersambung ke WiFi yang sama dengan ESP32 (Konsep 1 dan 2, 🚨 "ESP32 dan laptop beda jaringan").
2. (a) Selama router mati, `loop()` terkunci di dalam `while`. Akibatnya, misalnya: sensor tidak dibaca, tombol tidak dilayani, pompa tidak dimatikan tepat waktu, dan setelah 5 detik *watchdog* Modul 8 me-*restart* Node 1, berulang-ulang. (b) Node 1 v1.1 memanggil `WiFi.begin()` tanpa menunggu, membiarkan sambung ulang otomatis paket esp32 bekerja di belakang layar, mengamati keadaannya lewat peristiwa WiFi (bendera yang diturunkan di `loop()`), dan hanya mengirim data saat sudah tersambung. Penjaga cadangannya menyuruh paket esp32 mencoba lagi kalau 60 detik tidak ada percobaan baru (Konsep 4).
3. (a) **Tidak aman.** Isi file itu tetap tersimpan di riwayat repositori dan mungkin sudah tersalin orang lain. Ia wajib **mengganti kata sandi WiFi di router**, lalu memasang penjaga `.gitignore` supaya `secrets.h` tidak tercatat lagi. (b) Aturan tanpa garis miring berlaku untuk semua file bernama `secrets.h` di folder mana pun di dalam repositori, termasuk `modul-11`, `modul-12`, dan seterusnya (Konsep 3, Praktik 1).
4. (a) `200`: surat diterima dengan baik. `404`: suratnya sampai ke server, tetapi server itu tidak mengenal jalurnya (misalnya salah ketik). (`penerima-webhook.js` kita sendiri menerima jalur apa pun, jadi tidak pernah menjawab `404`.) `-1`: suratnya tidak sampai; tidak ada server yang menjawab. (b) Misalnya: penerima belum dijalankan, alamat IP laptop salah atau berubah, *firewall* laptop memblokir, laptop dan ESP32 beda jaringan, atau VPN menyala. Ujinya: buka `http://<IP laptop>:3000/` di browser HP yang tersambung ke WiFi yang sama; kalau terminal penerima mencetak `GET /`, jaringannya beres (Praktik 7, 🚨). (c) Data cuaca terbuka untuk umum dan tidak menggerakkan apa pun, jadi risiko penyamar kecil. Kendali lampu lewat internet butuh kepastian bahwa perintahnya datang dari pihak yang benar dan sampai ke perangkat yang benar; `setInsecure()` tidak memeriksa identitas siapa pun (Konsep 8).
5. (a) `2026-10-16T23:30:00Z`. WIB lebih cepat 7 jam daripada UTC, jadi pukul 06.30 WIB masih pukul 23.30 UTC **hari sebelumnya**. (b) Setiap data wajib membawa `ts` yang dibuat perangkat saat bacaan diambil (Lampiran A). Sebelum disetel, jam ESP32 mengira tahun 1970, dan data dengan jam salah lebih menyesatkan daripada tidak ada data (Konsep 6). (c) D25 adalah pin **ADC2**. Selama WiFi menyala, `analogRead()` di pin ADC2 diam-diam menjawab `0`. Angka mentah `0` berada di bawah angka "basah" hasil kalibrasimu, jadi tanah selalu terbaca basah 100 %, siram otomatis tidak pernah menyala, dan tanamanmu kekeringan tanpa ada pesan error. Sensor analog harus tetap di ADC1, seperti aturan Modul 5 (Konsep 10). Menjawab "D25 sudah dipakai pompa" juga benar untuk Node 1, tetapi soal ini menanyakan masalah yang baru muncul karena WiFi.

</details>

---

## ✅ Checklist kelulusan Modul 10

Centang semuanya sebelum lanjut ke Modul 11:

- [ ] Aku bisa menjelaskan alamat IP lokal, *gateway*, DHCP, dan alamat MAC dengan analogi perumahan, dan kartu jaringan ESP32-ku sudah tercatat (Praktik 2).
- [ ] `secrets.h` dijaga `.gitignore` dan tidak pernah muncul di GitHub (Praktik 1).
- [ ] Sketsa sambung ulang tetap berputar saat router dimatikan, lalu tersambung lagi sendiri (Praktik 3).
- [ ] Aku pernah menyimpan WiFi lewat portal di HP, tanpa menulis kata sandi di kode (Praktik 4).
- [ ] ESP32 menampilkan jam setempat dan `ts` UTC yang benar (Praktik 5).
- [ ] ESP32 mengambil cuaca dari Open-Meteo lewat HTTPS, dan aku bisa menjelaskan arti `setInsecure()` dengan jujur (Praktik 6).
- [ ] Penerima di laptop mencetak JSON yang dikirim ESP32 (Praktik 7).
- [ ] Relay lampu menyala dan padam dari browser HP (Praktik 8), dan aku tahu cara menemukan alamat Node 1, baik lewat IP tetap maupun cara lain (Praktik 9).
- [ ] Arduino IDE memakai **ESP32 Dev Module** dengan skema partisi **Minimal SPIFFS** (➕ A).
- [ ] ⭐ **Server mini di laptop mencetak JSON dari Node 1 v1.1** (➕ E).
- [ ] ⭐ **Aku mematikan lampu dari HP lewat tautan Node 1** (➕ F).
- [ ] ⭐ **Node 1 tersambung kembali sendiri setelah router dimatikan 1 menit**, tanpa *restart* (➕ G).
- [ ] Node 1 v1.1 kembali hidup dari *charger*-nya, dan lampunya tetap bisa dimatikan dari HP tanpa laptop sama sekali (➕ G).
- [ ] Node 1 v1.1 sudah di-*commit* dan di-*push* ke `rumah-pintar-mini`; sketsa dan `catatan-modul10.md` ke `belajar-iot`, tanpa satu pun `secrets.h`.
- [ ] ⭐ **Kuis: minimal 4 dari 5 benar.**

**Lulus jika** (sesuai Silabus): *Kamu bisa mematikan lampu dari HP lewat tautan ESP32, server mini di laptop mencetak JSON dari Node 1, dan perangkat tersambung kembali sendiri setelah router dimatikan 1 menit.*

Selamat — Node 1 kini benar-benar menjadi perangkat IoT: tersambung, tahu waktu, melapor, dan bisa diperintah dari jauh. Namun, cara kita masih "surat pribadi": Node 1 harus tahu alamat laptopmu, dan HP-mu harus tahu alamat Node 1. Di **Modul 11**, semua perangkat cukup berbicara lewat satu "kantor pos" bernama ***broker* MQTT**. Tautan `/on` dan `/off` dipensiunkan, dan kontrak data Lampiran A mulai dipakai sepenuhnya.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, kode sumber, dan hasil uji yang dipakai** (diakses Oktober 2026):

- Kode sumber [arduino-esp32](https://github.com/espressif/arduino-esp32/tree/3.3.12) 3.3.12: library WiFi (sambung ulang otomatis, kode alasan putus, nama perangkat bawaan, penyimpanan WiFi di NVS), HTTPClient (batas waktu, urutan *header*, kode error negatif), WebServer, ESPmDNS, NetworkClientSecure (`setInsecure()` dan `useBuiltinCACertBundle()`), serta `boards.txt` (ESP32 Dev Module, skema partisi, Flash Mode) dan tabel partisi `default.csv` dan `min_spiffs.csv`.
- Dokumentasi ESP-IDF 5.5: [Wi-Fi Driver](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/wifi.html) (kode alasan putus, hemat daya `WIFI_PS_MIN_MODEM`, pencarian jaringan saat menyambung), [Wi-Fi Security](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/wifi-security.html) (WPA3), [System Time](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/system_time.html) (SNTP dan zona waktu), dan [ADC](https://docs.espressif.com/projects/esp-idf/en/v5.5.1/esp32/api-reference/peripherals/adc_oneshot.html) (ADC2 dipakai radio WiFi). Arus WiFi dari [ESP32 Series Datasheet](https://documentation.espressif.com/esp32_datasheet_en.pdf) (Espressif).
- Library [WiFiManager](https://github.com/tzapu/WiFiManager) 2.0.17 oleh tzapu (README, `WiFiManager.cpp`, `wm_strings_en.h`, dan [*issue* #1797](https://github.com/tzapu/WiFiManager/issues/1797)) dan [ArduinoJson](https://arduinojson.org/v7/) 7.4.3 oleh Benoit Blanchon (`serializeJson()`, `deserializeJson()`, NaN ditulis `null`).
- Waktu: [NTP Pool Project](https://www.ntppool.org/en/use.html) (`pool.ntp.org` dan [zona Asia](https://www.ntppool.org/zone/asia)), aturan zona waktu [POSIX](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html) dan [`strftime()`](https://pubs.opengroup.org/onlinepubs/9799919799/functions/strftime.html) (The Open Group), serta [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) untuk bentuk tanggal-jam ISO-8601.
- Jaringan dan HTTP: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) (metode, kode status, GET yang aman), [RFC 6762](https://www.rfc-editor.org/rfc/rfc6762) (mDNS), [RFC 1918](https://www.rfc-editor.org/rfc/rfc1918) (alamat jaringan pribadi), dan [RFC 2131](https://www.rfc-editor.org/rfc/rfc2131) (DHCP); dukungan nama `.local` di Android dari [AOSP DNS Resolver](https://source.android.com/docs/core/ota/modular-system/dns-resolver) dan [Google Issue Tracker 140786115](https://issuetracker.google.com/issues/140786115).
- [Open-Meteo](https://open-meteo.com/en/terms): syarat pemakaian API gratis dan lisensi data CC BY 4.0.
- Kode sumber [Arduino IDE](https://github.com/arduino/arduino-ide/blob/2.3.10/arduino-ide-extension/src/browser/contributions/boards-data-menu-updater.ts) 2.3.10: susunan dan urutan menu **Tools**.
- Git dan GitHub: [gitignore](https://git-scm.com/docs/gitignore), [Ignoring files](https://docs.github.com/en/get-started/git-basics/ignoring-files), [Supported secret scanning patterns](https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns), dan [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository); kode sumber [GitHub Desktop](https://github.com/desktop/desktop/tree/release-3.6.6) 3.6.6 (jendela `Repository settings` dan menu klik kanan di daftar **Changes**).
- Laptop dan HP: Microsoft [ipconfig](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig), [Windows Firewall](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/), [pengaturan jaringan Windows](https://support.microsoft.com/en-us/windows/experience/connectivity-networking/essential-network-settings-and-tasks-in-windows), dan [Mobile hotspot](https://support.microsoft.com/en-us/windows/experience/connectivity-networking/use-your-windows-device-as-a-mobile-hotspot); Apple [WiFi dengan halaman *login*](https://support.apple.com/en-us/102554), [Personal Hotspot](https://support.apple.com/guide/platform-support/troubleshoot-personal-hotspot-connections-sup025284ac0/web), dan [*firewall* macOS](https://support.apple.com/guide/mac-help/block-connections-to-your-mac-with-a-firewall-mh34041/mac); Samsung [Hotspot Seluler Galaxy](https://www.samsung.com/id/support/mobile-devices/how-to-use-and-configure-mobile-hotspot-on-your-galaxy-phone/).
- Router: panduan TP-Link untuk [Smart Connect](https://www.tp-link.com/us/support/faq/2595/), [jaringan tamu](https://www.tp-link.com/us/support/faq/2798/), [AP Isolation](https://www.tp-link.com/us/support/faq/2089/), dan [pemesanan alamat](https://www.tp-link.com/us/support/faq/182/).
- Wokwi: [ESP32 WiFi Networking](https://docs.wokwi.com/guides/esp32-wifi) (jaringan `Wokwi-GUEST`; layanan gratis Wokwi hanya mengizinkan sambungan keluar).

**Gambar.** Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-10`, `jaringan-rumah`, `dua-jalur-wifi`, `sambung-ulang`, `portal-wifi`, `jam-ntp` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Kode alasan putus dan jeda NTP dari kode sumber paket esp32 dan ESP-IDF; alamat IP dan MAC hanya contoh. | CC BY 4.0 |
| `surat-http`, `https-setinsecure`, `server-web`, `alamat-tetap`, `partisi-flash`, `peta-file-node1-v11` (`.png` + `.svg`) | Diagram orisinal. Isi surat HTTP mengikuti HTTPClient paket esp32 3.3.12; ukuran rak dari tabel partisi paket esp32; ukuran Node 1 dari hasil kompilasi di Wokwi. | CC BY 4.0 |
| `portal-hp` (`.png` + `.svg`) | Ilustrasi orisinal: halaman portal dirender dari HTML, CSS, dan teks asli library [WiFiManager](https://github.com/tzapu/WiFiManager) 2.0.17 (© tzapu, lisensi MIT); nama-nama WiFi hanya contoh. | CC BY 4.0 untuk susunan dan penanda; isi halaman mengikuti lisensi MIT WiFiManager |
| `hp-sakelar`, `hp-node1` (`.png` + `.svg`) | Ilustrasi orisinal: halaman dirender dari HTML di sketsa Praktik 8 dan `jaringan.cpp` Node 1 v1.1; angka dan alamat hanya contoh. | CC BY 4.0 |
| `menu-partisi` (`.png` + `.svg`) | Ilustrasi orisinal tampilan Arduino IDE 2.3.10, bukan tangkapan layar; label menu dari kode sumber Arduino IDE dan `boards.txt` paket esp32 3.3.12. | CC BY 4.0 |
| `github-desktop-gitignore` (`.png` + `.svg`) | Ilustrasi orisinal tampilan GitHub Desktop 3.6.6, bukan tangkapan layar; teks jendela dari kode sumber [GitHub Desktop](https://github.com/desktop/desktop) (lisensi MIT); isi daftar **Changes** hanya contoh. | CC BY 4.0 |

Semua sketsa di modul ini sudah dikompilasi dengan paket esp32 versi 3 dan dijalankan di Wokwi (sketsa portal WiFi Praktik 4 hanya sampai portalnya terbuka karena HP tidak bisa menyambung ke Wokwi). Kotak **Hasilnya** bertanda **rekaman Wokwi** (Praktik 5 dan 6) berasal langsung dari simulator. Kotak bertanda **contoh** memakai susunan baris yang sama persis dengan rekaman Wokwi dan kode sketsanya, tetapi nama WiFi, alamat IP, kekuatan sinyal, dan angka bacaannya diganti dengan contoh dari jaringan rumah karena Wokwi tidak bisa mematikan router, tidak bisa disambungi HP (portal dan server web), dan tidak bisa menjangkau laptop. Susunan isi terminal penerima diambil dari `penerima-webhook.js` yang dijalankan sungguhan dengan surat seperti di Praktik 7 dan bagian ➕.

---

[⬅️ Modul 9](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 11 — MQTT: Bahasa Resmi Dunia IoT & Kontrak Data Proyek** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-11--mqtt-bahasa-resmi-dunia-iot--kontrak-data-proyek))
